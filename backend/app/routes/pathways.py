from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.pathway import Pathway, PathwayItem, PathwayProgress
from app.models.story import Story
from app.models.user import User
from datetime import datetime

bp = Blueprint('pathways', __name__)

@bp.route('/', methods=['GET'])
def get_pathways():
    """Get all active learning pathways"""
    pathways = Pathway.query.filter_by(is_active=True).all()
    
    # Get user progress if authenticated
    user_id = None
    try:
        user_id = get_jwt_identity()
    except:
        pass
    
    result = []
    for pathway in pathways:
        pathway_dict = pathway.to_dict()
        
        # Add user progress if logged in
        if user_id:
            progress = PathwayProgress.query.filter_by(
                user_id=user_id,
                pathway_id=pathway.id
            ).first()
            
            if progress:
                pathway_dict['completed'] = len(progress.completed_items or [])
                pathway_dict['user_progress'] = progress.to_dict()
            else:
                pathway_dict['completed'] = 0
                pathway_dict['user_progress'] = None
        else:
            pathway_dict['completed'] = 0
            pathway_dict['user_progress'] = None
        
        result.append(pathway_dict)
    
    return jsonify(result)

@bp.route('/<int:pathway_id>', methods=['GET'])
def get_pathway(pathway_id):
    """Get a specific pathway"""
    pathway = Pathway.query.get_or_404(pathway_id)
    
    # Get user progress if authenticated
    user_id = None
    try:
        user_id = get_jwt_identity()
    except:
        pass
    
    pathway_dict = pathway.to_dict()
    
    if user_id:
        progress = PathwayProgress.query.filter_by(
            user_id=user_id,
            pathway_id=pathway_id
        ).first()
        
        if progress:
            pathway_dict['completed'] = len(progress.completed_items or [])
            pathway_dict['user_progress'] = progress.to_dict()
        else:
            pathway_dict['completed'] = 0
            pathway_dict['user_progress'] = None
    
    return jsonify(pathway_dict)

@bp.route('/<int:pathway_id>/progress', methods=['POST'])
@jwt_required()
def update_pathway_progress(pathway_id):
    """Update user's progress on a pathway"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    pathway = Pathway.query.get_or_404(pathway_id)
    story_id = data.get('story_id')
    
    if not story_id:
        return jsonify({'error': 'story_id is required'}), 400
    
    # Get or create progress record
    progress = PathwayProgress.query.filter_by(
        user_id=user_id,
        pathway_id=pathway_id
    ).first()
    
    if not progress:
        progress = PathwayProgress(
            user_id=user_id,
            pathway_id=pathway_id,
            completed_items=[]
        )
        db.session.add(progress)
    
    # Add story to completed items if not already there
    completed_items = progress.completed_items or []
    if story_id not in completed_items:
        completed_items.append(story_id)
        progress.completed_items = completed_items
    
    # Check if pathway is completed
    total_items = pathway.items.count()
    if len(completed_items) >= total_items and not progress.is_completed:
        progress.is_completed = True
        progress.completed_at = datetime.utcnow()
        
        # Award points
        user = User.query.get(user_id)
        user.points += pathway.points_reward
    
    db.session.commit()
    
    return jsonify(progress.to_dict())

@bp.route('/', methods=['POST'])
@jwt_required()
def create_pathway():
    """Create a new pathway (admin only)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    pathway = Pathway(
        title=data.get('title'),
        description=data.get('description'),
        category=data.get('category'),
        difficulty=data.get('difficulty', 'Beginner'),
        duration=data.get('duration'),
        points_reward=data.get('points_reward', 50)
    )
    
    db.session.add(pathway)
    db.session.commit()
    
    # Add stories to pathway
    story_ids = data.get('story_ids', [])
    for index, story_id in enumerate(story_ids):
        item = PathwayItem(
            pathway_id=pathway.id,
            story_id=story_id,
            order=index + 1
        )
        db.session.add(item)
    
    db.session.commit()
    
    return jsonify(pathway.to_dict()), 201

@bp.route('/user/progress', methods=['GET'])
@jwt_required()
def get_user_progress():
    """Get all pathway progress for current user"""
    user_id = get_jwt_identity()
    
    progress_records = PathwayProgress.query.filter_by(user_id=user_id).all()
    
    return jsonify([p.to_dict() for p in progress_records])