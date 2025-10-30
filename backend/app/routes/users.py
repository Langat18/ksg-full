from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.contribution import Contribution

bp = Blueprint('users', __name__)

@bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'username', 'password', 'full_name']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    # Create new user
    user = User(
        email=data['email'],
        username=data['username'],
        full_name=data['full_name'],
        organization=data.get('organization'),
        county=data.get('county'),
        role=data.get('role', 'user')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Update last login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    })

@bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    return jsonify(user.to_dict())

@bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    # Update allowed fields
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'organization' in data:
        user.organization = data['organization']
    if 'county' in data:
        user.county = data['county']
    if 'bio' in data:
        user.bio = data['bio']
    
    db.session.commit()
    
    return jsonify(user.to_dict())

@bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get user dashboard data"""
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    # Get user statistics
    stories_contributed = user.stories.filter_by(status='published').count()
    total_views = sum(story.views for story in user.stories.filter_by(status='published'))
    badges_earned = user.badges.count()
    pathways_completed = user.pathway_progress.filter_by(completed=True).count()
    
    # Recent contributions
    recent_contributions = Contribution.query.filter_by(user_id=user_id).order_by(
        Contribution.created_at.desc()
    ).limit(10).all()
    
    return jsonify({
        'user': user.to_dict(),
        'stats': {
            'stories_contributed': stories_contributed,
            'total_views': total_views,
            'badges_earned': badges_earned,
            'pathways_completed': pathways_completed,
            'points': user.points,
            'level': user.level
        },
        'recent_activity': [
            {
                'type': contrib.contribution_type,
                'points': contrib.points_earned,
                'date': contrib.created_at.isoformat()
            } for contrib in recent_contributions
        ]
    })

@bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get top contributors leaderboard"""
    top_users = User.query.order_by(User.points.desc()).limit(20).all()
    
    return jsonify([
        {
            'rank': idx + 1,
            'username': user.username,
            'full_name': user.full_name,
            'points': user.points,
            'level': user.level,
            'stories_count': user.stories.filter_by(status='published').count()
        } for idx, user in enumerate(top_users)
    ])