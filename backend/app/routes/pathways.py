from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from sqlalchemy.orm import joinedload
from app import db
from app.models.pathway import Pathway, PathwayItem, PathwayProgress
from app.models.story import Story
from app.models.user import User
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('pathways', __name__)

def _get_optional_user_id():
    try:
        verify_jwt_in_request(optional=True)
        return get_jwt_identity()
    except Exception:
        return None

def _attach_progress(pathway_dict, pathway_id, user_id):
    if not user_id:
        pathway_dict['completed'] = 0
        pathway_dict['user_progress'] = None
        return
    progress = PathwayProgress.query.filter_by(
        user_id=user_id, pathway_id=pathway_id
    ).first()
    if progress:
        pathway_dict['completed'] = len(progress.completed_items or [])
        pathway_dict['user_progress'] = progress.to_dict()
    else:
        pathway_dict['completed'] = 0
        pathway_dict['user_progress'] = None

@bp.route('/', methods=['GET'])
def get_pathways():
    try:
        pathways = Pathway.query.filter_by(is_active=True).options(
            joinedload(Pathway.items).joinedload(PathwayItem.story).joinedload(Story.author)
        ).all()

        user_id = _get_optional_user_id()

        progress_map = {}
        if user_id and pathways:
            records = PathwayProgress.query.filter(
                PathwayProgress.user_id == user_id,
                PathwayProgress.pathway_id.in_([p.id for p in pathways])
            ).all()
            progress_map = {r.pathway_id: r for r in records}

        result = []
        for pathway in pathways:
            d = pathway.to_dict()
            prog = progress_map.get(pathway.id)
            if prog:
                d['completed'] = len(prog.completed_items or [])
                d['user_progress'] = prog.to_dict()
            else:
                d['completed'] = 0
                d['user_progress'] = None
            result.append(d)

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error fetching pathways: {e}")
        return jsonify({'error': 'Failed to fetch pathways'}), 500

@bp.route('/<int:pathway_id>', methods=['GET'])
def get_pathway(pathway_id):
    try:
        pathway = Pathway.query.options(
            joinedload(Pathway.items).joinedload(PathwayItem.story).joinedload(Story.author)
        ).get_or_404(pathway_id)

        user_id = _get_optional_user_id()
        d = pathway.to_dict()
        _attach_progress(d, pathway_id, user_id)
        return jsonify(d), 200

    except Exception as e:
        logger.error(f"Error fetching pathway {pathway_id}: {e}")
        return jsonify({'error': 'Pathway not found'}), 404

@bp.route('/<int:pathway_id>/progress', methods=['POST'])
@jwt_required()
def update_pathway_progress(pathway_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        story_id = data.get('story_id')

        if not story_id:
            return jsonify({'error': 'story_id is required'}), 400

        pathway = Pathway.query.get_or_404(pathway_id)
        progress = PathwayProgress.query.filter_by(
            user_id=user_id, pathway_id=pathway_id
        ).first()

        if not progress:
            progress = PathwayProgress(
                user_id=user_id, pathway_id=pathway_id, completed_items=[]
            )
            db.session.add(progress)

        completed_items = list(progress.completed_items or [])
        if story_id not in completed_items:
            completed_items.append(story_id)
            progress.completed_items = completed_items
            progress.updated_at = datetime.utcnow()

        total_items = pathway.items.count()
        if len(completed_items) >= total_items and not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = datetime.utcnow()
            user = User.query.get(user_id)
            if user:
                user.points = (user.points or 0) + pathway.points_reward

        db.session.commit()
        return jsonify(progress.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating progress: {e}")
        return jsonify({'error': 'Failed to update progress'}), 500

@bp.route('/', methods=['POST'])
@jwt_required()
def create_pathway():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()
        if not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400

        pathway = Pathway(
            title=data.get('title'),
            description=data.get('description'),
            category=data.get('category'),
            difficulty=data.get('difficulty', 'Beginner'),
            duration=data.get('duration'),
            points_reward=data.get('points_reward', 50)
        )
        db.session.add(pathway)
        db.session.flush()

        story_ids = data.get('story_ids', [])
        stories = {s.id: s for s in Story.query.filter(Story.id.in_(story_ids)).all()}
        for idx, sid in enumerate(story_ids):
            if sid in stories:
                db.session.add(PathwayItem(pathway_id=pathway.id, story_id=sid, order=idx + 1))

        db.session.commit()
        return jsonify(pathway.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating pathway: {e}")
        return jsonify({'error': 'Failed to create pathway'}), 500

@bp.route('/<int:pathway_id>', methods=['PUT'])
@jwt_required()
def update_pathway(pathway_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403

        pathway = Pathway.query.get_or_404(pathway_id)
        data = request.get_json()

        for field in ('title', 'description', 'category', 'difficulty', 'duration', 'points_reward', 'is_active'):
            if field in data:
                setattr(pathway, field, data[field])

        pathway.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify(pathway.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating pathway: {e}")
        return jsonify({'error': 'Failed to update pathway'}), 500

@bp.route('/<int:pathway_id>', methods=['DELETE'])
@jwt_required()
def delete_pathway(pathway_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403

        pathway = Pathway.query.get_or_404(pathway_id)
        db.session.delete(pathway)
        db.session.commit()
        return jsonify({'message': 'Pathway deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting pathway: {e}")
        return jsonify({'error': 'Failed to delete pathway'}), 500

@bp.route('/user/progress', methods=['GET'])
@jwt_required()
def get_user_progress():
    try:
        user_id = get_jwt_identity()
        records = PathwayProgress.query.filter_by(user_id=user_id).all()
        return jsonify([p.to_dict() for p in records]), 200
    except Exception as e:
        logger.error(f"Error fetching user progress: {e}")
        return jsonify({'error': 'Failed to fetch progress'}), 500

@bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_pathways_endpoint():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Unauthorized. Admin access required'}), 403

        from app.services.pathway_generator import PathwayGenerator
        data = request.get_json() or {}
        pathways = PathwayGenerator().generate_pathways(force_regenerate=data.get('force', False))

        if not pathways:
            return jsonify({'message': 'No new pathways generated', 'count': 0, 'pathways': []}), 200

        return jsonify({
            'message': f'Successfully generated {len(pathways)} pathways',
            'count': len(pathways),
            'pathways': [p.to_dict(include_items=False) for p in pathways]
        }), 201

    except Exception as e:
        logger.error(f"Error generating pathways: {e}")
        return jsonify({'error': 'Failed to generate pathways'}), 500

@bp.route('/generate/custom', methods=['POST'])
@jwt_required()
def generate_custom_pathway():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Unauthorized. Admin access required'}), 403

        from app.services.pathway_generator import PathwayGenerator
        data = request.get_json()

        if not data.get('story_ids') or not data.get('title'):
            return jsonify({'error': 'story_ids and title are required'}), 400
        if len(data['story_ids']) < 7:
            return jsonify({'error': 'Minimum 7 stories required'}), 400

        pathway = PathwayGenerator().generate_specific_pathway(
            story_ids=data['story_ids'],
            title=data['title'],
            description=data.get('description'),
            category=data.get('category'),
            difficulty=data.get('difficulty')
        )

        if not pathway:
            return jsonify({'error': 'Failed to create pathway'}), 500

        return jsonify({'message': 'Custom pathway created successfully', 'pathway': pathway.to_dict()}), 201

    except Exception as e:
        logger.error(f"Error creating custom pathway: {e}")
        return jsonify({'error': 'Failed to create custom pathway'}), 500