from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120))
    role = db.Column(db.String(20), default='user')  # user, admin, contributor
    
    # Profile information
    organization = db.Column(db.String(120))
    county = db.Column(db.String(50))
    bio = db.Column(db.Text)
    profile_image = db.Column(db.String(255))
    
    # Gamification
    points = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    stories = db.relationship('Story', back_populates='author', lazy='dynamic')
    contributions = db.relationship('Contribution', back_populates='user', lazy='dynamic')
    badges = db.relationship('UserBadge', back_populates='user', lazy='dynamic')
    pathway_progress = db.relationship('PathwayProgress', back_populates='user', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'full_name': self.full_name,
            'role': self.role,
            'organization': self.organization,
            'county': self.county,
            'bio': self.bio,
            'profile_image': self.profile_image,
            'points': self.points,
            'level': self.level,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'badge_count': self.badges.count()
        }
