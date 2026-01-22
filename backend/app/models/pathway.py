from datetime import datetime
from app import db

class Pathway(db.Model):
    __tablename__ = 'pathways'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    difficulty = db.Column(db.String(50))
    duration = db.Column(db.String(50))
    points_reward = db.Column(db.Integer, default=50)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    items = db.relationship('PathwayItem', back_populates='pathway', lazy='dynamic', 
                           order_by='PathwayItem.order', cascade='all, delete-orphan')
    progress = db.relationship('PathwayProgress', back_populates='pathway', 
                              lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_items=True):
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'difficulty': self.difficulty,
            'duration': self.duration,
            'points_reward': self.points_reward,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'stories_count': self.items.count()
        }
        
        if include_items:
            data['steps'] = [item.to_dict() for item in self.items.order_by(PathwayItem.order).all()]
        
        return data

class PathwayItem(db.Model):
    __tablename__ = 'pathway_items'
    
    id = db.Column(db.Integer, primary_key=True)
    pathway_id = db.Column(db.Integer, db.ForeignKey('pathways.id', ondelete='CASCADE'), nullable=False)
    story_id = db.Column(db.Integer, db.ForeignKey('stories.id', ondelete='CASCADE'), nullable=False)
    order = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    pathway = db.relationship('Pathway', back_populates='items')
    story = db.relationship('Story', back_populates='pathway_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order': self.order,
            'story': self.story.to_dict() if self.story else None
        }

class PathwayProgress(db.Model):
    __tablename__ = 'pathway_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    pathway_id = db.Column(db.Integer, db.ForeignKey('pathways.id', ondelete='CASCADE'), nullable=False)
    completed_items = db.Column(db.JSON, default=list)
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', back_populates='pathway_progress')
    pathway = db.relationship('Pathway', back_populates='progress')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'pathway_id': self.pathway_id,
            'completed_items': self.completed_items or [],
            'is_completed': self.is_completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None
        }