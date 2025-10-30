from app import db
from datetime import datetime
class Pathway(db.Model):
    __tablename__ = 'pathways'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    thumbnail_url = db.Column(db.String(500))
    
    # Metadata
    difficulty = db.Column(db.String(20))  # beginner, intermediate, advanced
    estimated_duration = db.Column(db.Integer)  # in minutes
    category = db.Column(db.String(50))
    
    # Status
    published = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Relationships
    creator = db.relationship('User', backref='created_pathways')
    items = db.relationship('PathwayItem', back_populates='pathway', order_by='PathwayItem.position')
    progress_records = db.relationship('PathwayProgress', back_populates='pathway')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'thumbnail_url': self.thumbnail_url,
            'difficulty': self.difficulty,
            'estimated_duration': self.estimated_duration,
            'category': self.category,
            'published': self.published,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'items_count': len(self.items),
            'items': [item.to_dict() for item in self.items]
        }


class PathwayItem(db.Model):
    __tablename__ = 'pathway_items'
    
    id = db.Column(db.Integer, primary_key=True)
    position = db.Column(db.Integer, nullable=False)
    quiz_data = db.Column(db.JSON)  # Optional quiz questions
    reflection_prompt = db.Column(db.Text)
    
    # Foreign Keys
    pathway_id = db.Column(db.Integer, db.ForeignKey('pathways.id'), nullable=False)
    story_id = db.Column(db.Integer, db.ForeignKey('stories.id'), nullable=False)
    
    # Relationships
    pathway = db.relationship('Pathway', back_populates='items')
    story = db.relationship('Story', back_populates='pathway_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'position': self.position,
            'quiz_data': self.quiz_data,
            'reflection_prompt': self.reflection_prompt,
            'story': self.story.to_dict() if self.story else None
        }


class PathwayProgress(db.Model):
    __tablename__ = 'pathway_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    completed_items = db.Column(db.JSON, default=[])  # Array of completed item IDs
    current_item_id = db.Column(db.Integer)
    completed = db.Column(db.Boolean, default=False)
    completion_date = db.Column(db.DateTime)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    pathway_id = db.Column(db.Integer, db.ForeignKey('pathways.id'), nullable=False)
    
    # Relationships
    user = db.relationship('User', back_populates='pathway_progress')
    pathway = db.relationship('Pathway', back_populates='progress_records')
    
    # Timestamps
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

