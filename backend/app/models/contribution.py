from app import db
from datetime import datetime

class Contribution(db.Model):
    __tablename__ = 'contributions'
    
    id = db.Column(db.Integer, primary_key=True)
    contribution_type = db.Column(db.String(50))  # upload, view, share, comment, like
    points_earned = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    story_id = db.Column(db.Integer, db.ForeignKey('stories.id'))
    
    # Relationships
    user = db.relationship('User', back_populates='contributions')
    story = db.relationship('Story', back_populates='contributions')