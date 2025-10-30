from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.pathway import Pathway, PathwayItem, PathwayProgress
from app.models.user import User
from app.models.contribution import Contribution

bp = Blueprint('pathways', __name__)

@bp.route('/', methods=['GET'])
def get_pathways():
    """Get all published pathways"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category = request.args.get('category')
    difficulty = request.args.get('difficulty')
    
    query = Pathway.query.filter_by(published=True)
    
    if category:
        query = query.filter_by(category=category)
    if difficulty:
        query = query.filter_by(difficulty=difficulty)
    
    pagination = query.order_by(Pathway.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'pathways': [pathway.to_dict() for pathway in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@bp.route('/<int:pathway_id>', methods=['GET'])
def get_pathway(pathway_id):
    """Get a single pathway by ID"""
    pathway = Pathway.query.get_or_404(pathway_id)
    return jsonify(pathway.to_dict())

@bp.route('/', methods=['POST'])
@jwt_required()
def create_pathway():
    """Create a new pathway"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['admin', 'contributor']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    pathway = Pathway(
        title=data.get('title'),
        description=data.get('description'),
        thumbnail_url=data.get('thumbnail_url'),
        difficulty=data.get('difficulty', 'beginner'),
        category=data.get('category'),
        estimated_duration=data.get('estimated_duration'),
        published=data.get('published', False),
        creator_id=user_id
    )
    
    db.session.add(pathway)
    db.session.commit()
    
    # Add pathway items
    if 'items' in data:
        for item_data in data['items']:
            item = PathwayItem(
                pathway_id=pathway.id,
                story_id=item_data['story_id'],
                position=item_data['position'],
                quiz_data=item_data.get('quiz_data'),
                reflection_prompt=item_data.get('reflection_prompt')
            )
            db.session.add(item)
    
    db.session.commit()
    
    return jsonify(pathway.to_dict()), 201

@bp.route('/<int:pathway_id>', methods=['PUT'])
@jwt_required()
def update_pathway(pathway_id):
    """Update a pathway"""
    user_id = get_jwt_identity()
    pathway = Pathway.query.get_or_404(pathway_id)
    user = User.query.get(user_id)
    
    if pathway.creator_id != user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        pathway.title = data['title']
    if 'description' in data:
        pathway.description = data['description']
    if 'difficulty' in data:
        pathway.difficulty = data['difficulty']
    if 'category' in data:
        pathway.category = data['category']
    if 'published' in data:
        pathway.published = data['published']
    
    db.session.commit()
    
    return jsonify(pathway.to_dict())

@bp.route('/<int:pathway_id>', methods=['DELETE'])
@jwt_required()
def delete_pathway(pathway_id):
    """Delete a pathway"""
    user_id = get_jwt_identity()
    pathway = Pathway.query.get_or_404(pathway_id)
    user = User.query.get(user_id)
    
    if pathway.creator_id != user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(pathway)
    db.session.commit()
    
    return jsonify({'message': 'Pathway deleted successfully'})

@bp.route('/<int:pathway_id>/start', methods=['POST'])
@jwt_required()
def start_pathway(pathway_id):
    """Start a pathway"""
    user_id = get_jwt_identity()
    pathway = Pathway.query.get_or_404(pathway_id)
    
    # Check if already started
    progress = PathwayProgress.query.filter_by(
        user_id=user_id,
        pathway_id=pathway_id
    ).first()
    
    if progress:
        return jsonify({'message': 'Pathway already started', 'progress': progress.to_dict()})
    
    # Create new progress record
    progress = PathwayProgress(
        user_id=user_id,
        pathway_id=pathway_id,
        completed_items=[],
        current_item_id=pathway.items[0].id if pathway.items else None
    )
    
    db.session.add(progress)
    db.session.commit()
    
    return jsonify({'message': 'Pathway started', 'progress': progress.to_dict()}), 201

@bp.route('/<int:pathway_id>/progress', methods=['POST'])
@jwt_required()
def update_progress(pathway_id):
    """Update pathway progress"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    progress = PathwayProgress.query.filter_by(
        user_id=user_id,
        pathway_id=pathway_id
    ).first_or_404()
    
    item_id = data.get('item_id')
    
    if item_id and item_id not in progress.completed_items:
        progress.completed_items.append(item_id)
    
    # Check if pathway is completed
    pathway = Pathway.query.get(pathway_id)
    total_items = len(pathway.items)
    
    if len(progress.completed_items) >= total_items:
        progress.completed = True
        progress.completion_date = datetime.utcnow()
        
        # Award points
        user = User.query.get(user_id)
        contribution = Contribution(
            user_id=user_id,
            contribution_type='pathway_completed',
            points_earned=50
        )
        user.points += 50
        db.session.add(contribution)
    
    db.session.commit()
    
    return jsonify({'message': 'Progress updated', 'completed': progress.completed})

@bp.route('/<int:pathway_id>/progress', methods=['GET'])
@jwt_required()
def get_progress(pathway_id):
    """Get pathway progress"""
    user_id = get_jwt_identity()
    
    progress = PathwayProgress.query.filter_by(
        user_id=user_id,
        pathway_id=pathway_id
    ).first()
    
    if not progress:
        return jsonify({'started': False})
    
    pathway = Pathway.query.get(pathway_id)
    total_items = len(pathway.items)
    completed_items = len(progress.completed_items)
    
    return jsonify({
        'started': True,
        'completed': progress.completed,
        'total_items': total_items,
        'completed_items': completed_items,
        'progress_percentage': (completed_items / total_items * 100) if total_items > 0 else 0,
        'completion_date': progress.completion_date.isoformat() if progress.completion_date else None
    })

