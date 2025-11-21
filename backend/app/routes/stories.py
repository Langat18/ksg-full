from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.story import Story
from app.models.user import User
from app.models.contribution import Contribution
from app.services.nlp_service import NLPService
from app.services.graph_service import GraphService
import os
from werkzeug.utils import secure_filename

bp = Blueprint('stories', __name__)
nlp_service = NLPService()
graph_service = GraphService()

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'mp4', 'mp3', 'pdf', 'docx', 'wav', 'm4a'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/', methods=['GET'])
def get_stories():
    """Get all stories with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    limit = request.args.get('limit', per_page, type=int)
    county = request.args.get('county')
    category = request.args.get('category')
    status = request.args.get('status', 'published')
    search = request.args.get('search')
    q = request.args.get('q')  # Alternative search parameter
    
    query = Story.query.filter_by(status=status)
    
    if county:
        query = query.filter_by(county=county)
    if category:
        query = query.filter_by(category=category)
    if search:
        query = query.filter(Story.title.ilike(f'%{search}%'))
    if q:
        query = query.filter(
            db.or_(
                Story.title.ilike(f'%{q}%'),
                Story.description.ilike(f'%{q}%')
            )
        )
    
    # If limit is specified, use it instead of pagination
    if limit and limit != per_page:
        stories = query.order_by(Story.created_at.desc()).limit(limit).all()
        return jsonify({
            'stories': [story.to_dict() for story in stories],
            'total': query.count(),
            'pages': 1,
            'current_page': 1
        })
    
    pagination = query.order_by(Story.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'stories': [story.to_dict() for story in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@bp.route('/<int:story_id>', methods=['GET'])
def get_story(story_id):
    """Get a single story by ID"""
    story = Story.query.get_or_404(story_id)
    
    # Increment view count
    story.views += 1
    db.session.commit()
    
    return jsonify(story.to_dict())

@bp.route('/<int:story_id>/related', methods=['GET'])
def get_related_stories(story_id):
    """Get related stories based on category, county, and tags"""
    story = Story.query.get_or_404(story_id)
    
    # Find stories with same category or county, excluding the current story
    related_query = Story.query.filter(
        Story.id != story_id,
        Story.status == 'published'
    )
    
    # Prioritize stories with same category or county
    if story.category or story.county:
        related_query = related_query.filter(
            db.or_(
                Story.category == story.category if story.category else False,
                Story.county == story.county if story.county else False
            )
        )
    
    # Get up to 5 related stories, ordered by views
    related = related_query.order_by(Story.views.desc()).limit(5).all()
    
    # If we don't have enough related stories, get some random recent ones
    if len(related) < 3:
        additional = Story.query.filter(
            Story.id != story_id,
            Story.status == 'published'
        ).order_by(Story.created_at.desc()).limit(5 - len(related)).all()
        related.extend(additional)
    
    return jsonify([s.to_dict() for s in related])

@bp.route('/', methods=['POST'])
@jwt_required()
def create_story():
    """Create a new story"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.form
    
    # Handle file upload
    media_url = None
    thumbnail_url = None
    
    if 'media_file' in request.files:
        media_file = request.files['media_file']
        if media_file and allowed_file(media_file.filename):
            filename = secure_filename(media_file.filename)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            media_file.save(filepath)
            media_url = f'/uploads/{filename}'
    
    if 'thumbnail' in request.files:
        thumbnail = request.files['thumbnail']
        if thumbnail and allowed_file(thumbnail.filename):
            filename = secure_filename(thumbnail.filename)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            thumbnail.save(filepath)
            thumbnail_url = f'/uploads/{filename}'
    
    # Extract text for NLP processing
    text_content = data.get('description', '') + ' ' + data.get('transcript', '')
    nlp_results = nlp_service.process_text(text_content)
    
    # Create story
    story = Story(
        title=data.get('title'),
        description=data.get('description'),
        content_type=data.get('content_type'),
        media_url=media_url,
        thumbnail_url=thumbnail_url,
        transcript=data.get('transcript'),
        duration=data.get('duration', type=int),
        county=data.get('county'),
        category=data.get('category'),
        tags=data.get('tags', '').split(',') if data.get('tags') else [],
        entities=nlp_results['entities'],
        topics=nlp_results['topics'],
        sentiment=nlp_results['sentiment'],
        status='published',
        author_id=user_id
    )
    
    db.session.add(story)
    db.session.commit()
    
    # Add to graph database
    try:
        graph_service.add_story_node(story)
    except Exception as e:
        print(f"Warning: Could not add to graph database: {e}")
    
    # Award points for contribution
    contribution = Contribution(
        user_id=user_id,
        story_id=story.id,
        contribution_type='upload',
        points_earned=50
    )
    user.points += 50
    db.session.add(contribution)
    db.session.commit()
    
    return jsonify(story.to_dict()), 201

@bp.route('/<int:story_id>', methods=['PUT'])
@jwt_required()
def update_story(story_id):
    """Update a story"""
    user_id = get_jwt_identity()
    story = Story.query.get_or_404(story_id)
    
    if story.author_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Update fields
    if 'title' in data:
        story.title = data['title']
    if 'description' in data:
        story.description = data['description']
    if 'county' in data:
        story.county = data['county']
    if 'category' in data:
        story.category = data['category']
    if 'tags' in data:
        story.tags = data['tags']
    if 'status' in data:
        story.status = data['status']
    
    db.session.commit()
    
    return jsonify(story.to_dict())

@bp.route('/<int:story_id>', methods=['DELETE'])
@jwt_required()
def delete_story(story_id):
    """Delete a story"""
    user_id = get_jwt_identity()
    story = Story.query.get_or_404(story_id)
    
    user = User.query.get(user_id)
    if story.author_id != user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(story)
    db.session.commit()
    
    return jsonify({'message': 'Story deleted successfully'})

@bp.route('/<int:story_id>/share', methods=['POST'])
@jwt_required()
def share_story(story_id):
    """Track story share"""
    user_id = get_jwt_identity()
    story = Story.query.get_or_404(story_id)
    user = User.query.get(user_id)
    
    story.shares += 1
    
    # Award points for sharing
    contribution = Contribution(
        user_id=user_id,
        story_id=story_id,
        contribution_type='share',
        points_earned=5
    )
    user.points += 5
    
    db.session.add(contribution)
    db.session.commit()
    
    return jsonify({'message': 'Share recorded', 'shares': story.shares})

@bp.route('/<int:story_id>/like', methods=['POST'])
@jwt_required()
def like_story(story_id):
    """Like a story"""
    user_id = get_jwt_identity()
    story = Story.query.get_or_404(story_id)
    
    story.likes += 1
    db.session.commit()
    
    return jsonify({'message': 'Story liked', 'likes': story.likes})

@bp.route('/featured', methods=['GET'])
def get_featured_stories():
    """Get featured stories"""
    stories = Story.query.filter_by(
        status='published', 
        featured=True
    ).order_by(Story.created_at.desc()).limit(10).all()
    
    return jsonify([story.to_dict() for story in stories])

@bp.route('/trending', methods=['GET'])
def get_trending_stories():
    """Get trending stories based on recent engagement"""
    from datetime import datetime, timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    stories = Story.query.filter(
        Story.status == 'published',
        Story.created_at >= week_ago
    ).order_by(Story.views.desc()).limit(10).all()
    
    return jsonify([story.to_dict() for story in stories])

@bp.route('/by-category/<category>', methods=['GET'])
def get_stories_by_category(category):
    """Get stories by specific category"""
    limit = request.args.get('limit', 20, type=int)
    
    stories = Story.query.filter_by(
        status='published',
        category=category
    ).order_by(Story.created_at.desc()).limit(limit).all()
    
    return jsonify({
        'category': category,
        'stories': [story.to_dict() for story in stories],
        'total': Story.query.filter_by(status='published', category=category).count()
    })

@bp.route('/by-county/<county>', methods=['GET'])
def get_stories_by_county(county):
    """Get stories by specific county"""
    limit = request.args.get('limit', 20, type=int)
    
    stories = Story.query.filter_by(
        status='published',
        county=county
    ).order_by(Story.created_at.desc()).limit(limit).all()
    
    return jsonify({
        'county': county,
        'stories': [story.to_dict() for story in stories],
        'total': Story.query.filter_by(status='published', county=county).count()
    })

@bp.route('/search', methods=['GET'])
def search_stories():
    """Advanced search endpoint"""
    query_text = request.args.get('q', '')
    category = request.args.get('category')
    county = request.args.get('county')
    limit = request.args.get('limit', 20, type=int)
    
    query = Story.query.filter_by(status='published')
    
    if query_text:
        query = query.filter(
            db.or_(
                Story.title.ilike(f'%{query_text}%'),
                Story.description.ilike(f'%{query_text}%'),
                Story.transcript.ilike(f'%{query_text}%')
            )
        )
    
    if category:
        query = query.filter_by(category=category)
    
    if county:
        query = query.filter_by(county=county)
    
    stories = query.order_by(Story.created_at.desc()).limit(limit).all()
    
    return jsonify({
        'query': query_text,
        'filters': {
            'category': category,
            'county': county
        },
        'stories': [story.to_dict() for story in stories],
        'total': query.count()
    })