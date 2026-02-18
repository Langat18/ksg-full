from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload
from app import db
from app.models.story import Story
from app.models.user import User
from app.models.contribution import Contribution
from app.services.nlp_service import NLPService
from app.services.graph_service import GraphService
import os
from werkzeug.utils import secure_filename
from datetime import datetime

bp = Blueprint('stories', __name__)
nlp_service = NLPService()
graph_service = GraphService()

ALLOWED_EXTENSIONS = {'mp4', 'mp3', 'pdf', 'docx', 'wav', 'm4a', 'jpg', 'jpeg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def _paginated_stories_query(query, page, per_page):
    return query.options(
        joinedload(Story.author).joinedload(User.badges)
    ).order_by(Story.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

def _limited_stories_query(query, limit):
    return query.options(
        joinedload(Story.author).joinedload(User.badges)
    ).order_by(Story.created_at.desc()).limit(limit).all()

def _save_file(file, upload_folder, suffix='', max_bytes=50 * 1024 * 1024):
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > max_bytes:
        return None, f'File size ({size / (1024*1024):.1f}MB) exceeds limit of {max_bytes // (1024*1024)}MB'
    if not allowed_file(file.filename):
        return None, 'File type not allowed'
    filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{suffix}{secure_filename(file.filename)}"
    file.save(os.path.join(upload_folder, filename))
    return f'/uploads/{filename}', None

@bp.route('/', methods=['GET'])
def get_stories():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    limit = request.args.get('limit', type=int)
    county = request.args.get('county')
    category = request.args.get('category')
    status = request.args.get('status', 'published')
    search = request.args.get('search') or request.args.get('q')

    query = Story.query.filter_by(status=status)

    if county:
        query = query.filter_by(county=county)
    if category:
        query = query.filter_by(category=category)
    if search:
        query = query.filter(
            db.or_(Story.title.ilike(f'%{search}%'), Story.description.ilike(f'%{search}%'))
        )

    if limit:
        stories = _limited_stories_query(query, limit)
        return jsonify({'stories': [s.to_dict() for s in stories], 'total': len(stories), 'pages': 1, 'current_page': 1})

    pagination = _paginated_stories_query(query, page, per_page)
    return jsonify({
        'stories': [s.to_dict() for s in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@bp.route('/<int:story_id>', methods=['GET'])
def get_story(story_id):
    story = Story.query.options(joinedload(Story.author).joinedload(User.badges)).get_or_404(story_id)
    story.views += 1
    db.session.commit()
    return jsonify(story.to_dict())

@bp.route('/<int:story_id>/related', methods=['GET'])
def get_related_stories(story_id):
    story = Story.query.get_or_404(story_id)

    filters = []
    if story.category:
        filters.append(Story.category == story.category)
    if story.county:
        filters.append(Story.county == story.county)

    base = Story.query.options(joinedload(Story.author).joinedload(User.badges)).filter(
        Story.id != story_id, Story.status == 'published'
    )

    related = base.filter(db.or_(*filters)).order_by(Story.views.desc()).limit(5).all() if filters else []

    if len(related) < 3:
        existing_ids = [s.id for s in related] + [story_id]
        extra = base.filter(Story.id.notin_(existing_ids)).order_by(
            Story.created_at.desc()
        ).limit(5 - len(related)).all()
        related.extend(extra)

    return jsonify([s.to_dict() for s in related])

@bp.route('/', methods=['POST'])
@jwt_required()
def create_story():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.form
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)

    media_url = thumbnail_url = None

    if 'media_file' in request.files and request.files['media_file'].filename:
        media_url, err = _save_file(request.files['media_file'], upload_folder)
        if err:
            return jsonify({'error': err}), 413 if 'size' in err else 400

    if 'thumbnail' in request.files and request.files['thumbnail'].filename:
        thumbnail_url, err = _save_file(request.files['thumbnail'], upload_folder, suffix='thumb_', max_bytes=5 * 1024 * 1024)
        if err:
            return jsonify({'error': err}), 413 if 'size' in err else 400

    text_content = f"{data.get('description', '')} {data.get('transcript', '')}"
    nlp_results = nlp_service.process_text(text_content)

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
    db.session.flush()

    try:
        graph_service.add_story_node(story)
    except Exception as e:
        current_app.logger.warning(f"Could not add to graph database: {e}")

    db.session.add(Contribution(user_id=user_id, story_id=story.id, contribution_type='upload', points_earned=50))
    user.points += 50
    db.session.commit()

    return jsonify(story.to_dict()), 201

@bp.route('/<int:story_id>', methods=['PUT'])
@jwt_required()
def update_story(story_id):
    user_id = get_jwt_identity()
    story = Story.query.get_or_404(story_id)

    if story.author_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    for field in ('title', 'description', 'county', 'category', 'tags', 'status'):
        if field in data:
            setattr(story, field, data[field])

    db.session.commit()
    return jsonify(story.to_dict())

@bp.route('/<int:story_id>', methods=['DELETE'])
@jwt_required()
def delete_story(story_id):
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
    user_id = get_jwt_identity()
    story = Story.query.get_or_404(story_id)
    user = User.query.get(user_id)

    story.shares += 1
    user.points += 5
    db.session.add(Contribution(user_id=user_id, story_id=story_id, contribution_type='share', points_earned=5))
    db.session.commit()

    return jsonify({'message': 'Share recorded', 'shares': story.shares})

@bp.route('/<int:story_id>/like', methods=['POST'])
@jwt_required()
def like_story(story_id):
    story = Story.query.get_or_404(story_id)
    story.likes += 1
    db.session.commit()
    return jsonify({'message': 'Story liked', 'likes': story.likes})

@bp.route('/featured', methods=['GET'])
def get_featured_stories():
    stories = Story.query.options(
        joinedload(Story.author).joinedload(User.badges)
    ).filter_by(status='published', featured=True).order_by(Story.created_at.desc()).limit(10).all()
    return jsonify([s.to_dict() for s in stories])

@bp.route('/trending', methods=['GET'])
def get_trending_stories():
    from datetime import timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    stories = Story.query.options(
        joinedload(Story.author).joinedload(User.badges)
    ).filter(Story.status == 'published', Story.created_at >= week_ago).order_by(Story.views.desc()).limit(10).all()
    return jsonify([s.to_dict() for s in stories])

@bp.route('/by-category/<category>', methods=['GET'])
def get_stories_by_category(category):
    limit = request.args.get('limit', 20, type=int)
    stories = Story.query.options(
        joinedload(Story.author).joinedload(User.badges)
    ).filter_by(status='published', category=category).order_by(Story.created_at.desc()).limit(limit).all()
    return jsonify({
        'category': category,
        'stories': [s.to_dict() for s in stories],
        'total': Story.query.filter_by(status='published', category=category).count()
    })

@bp.route('/by-county/<county>', methods=['GET'])
def get_stories_by_county(county):
    limit = request.args.get('limit', 20, type=int)
    stories = Story.query.options(
        joinedload(Story.author).joinedload(User.badges)
    ).filter_by(status='published', county=county).order_by(Story.created_at.desc()).limit(limit).all()
    return jsonify({
        'county': county,
        'stories': [s.to_dict() for s in stories],
        'total': Story.query.filter_by(status='published', county=county).count()
    })

@bp.route('/search', methods=['GET'])
def search_stories():
    q = request.args.get('q', '')
    category = request.args.get('category')
    county = request.args.get('county')
    limit = request.args.get('limit', 20, type=int)

    query = Story.query.options(
        joinedload(Story.author).joinedload(User.badges)
    ).filter_by(status='published')

    if q:
        query = query.filter(db.or_(
            Story.title.ilike(f'%{q}%'),
            Story.description.ilike(f'%{q}%'),
            Story.transcript.ilike(f'%{q}%')
        ))
    if category:
        query = query.filter_by(category=category)
    if county:
        query = query.filter_by(county=county)

    stories = query.order_by(Story.created_at.desc()).limit(limit).all()

    return jsonify({
        'query': q,
        'filters': {'category': category, 'county': county},
        'stories': [s.to_dict() for s in stories],
        'total': query.count()
    })