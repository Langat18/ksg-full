from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app import db
from app.models.user import User
from app.models.story import Story
import bcrypt
import secrets
from datetime import datetime, timedelta

bp = Blueprint('users', __name__)

@bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(int(user_id))
    return jsonify(user.to_dict())

@bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(int(user_id))
    data = request.get_json()
    
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'bio' in data:
        user.bio = data['bio']
    if 'county' in data:
        user.county = data['county']
    if 'campus' in data:
        user.campus = data['campus']
    if 'organization' in data:
        user.organization = data['organization']
    if 'profile_image' in data:
        user.profile_image = data['profile_image']
    
    db.session.commit()
    return jsonify(user.to_dict())

@bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@bp.route('/<int:user_id>/stories', methods=['GET'])
def get_user_stories(user_id):
    user = User.query.get_or_404(user_id)
    stories = Story.query.filter_by(author_id=user_id, status='published').all()
    
    return jsonify({
        'user': user.to_dict(),
        'stories': [story.to_dict() for story in stories]
    })

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    })

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    required_fields = ['email', 'password', 'full_name', 'username']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not data.get('county'):
        return jsonify({'error': 'County is required'}), 400
    
    if not data.get('campus'):
        return jsonify({'error': 'Campus is required'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    if len(data['password']) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    hashed_password = bcrypt.hashpw(
        data['password'].encode('utf-8'), 
        bcrypt.gensalt()
    ).decode('utf-8')
    
    user = User(
        email=data['email'],
        password_hash=hashed_password,
        full_name=data['full_name'],
        username=data['username'],
        role='user',
        county=data['county'],
        campus=data['campus'],
        organization=data.get('organization', 'Kenya School of Government')
    )
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201

@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200
    
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.session.commit()
    
    return jsonify({
        'message': 'Password reset instructions sent to your email',
        'dev_token': reset_token
    }), 200

@bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')
    
    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400
    
    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    user = User.query.filter_by(reset_token=token).first()
    
    if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired reset token'}), 400
    
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user.password_hash = hashed_password
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()
    
    return jsonify({'message': 'Password reset successful'}), 200