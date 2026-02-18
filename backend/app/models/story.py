from datetime import datetime
from app import db


class Story(db.Model):
    __tablename__ = 'stories'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    content_type = db.Column(db.String(20), nullable=False)

    media_url = db.Column(db.String(500))
    thumbnail_url = db.Column(db.String(500))
    transcript = db.Column(db.Text)

    duration = db.Column(db.Integer)
    county = db.Column(db.String(50))
    category = db.Column(db.String(50), index=True)
    tags = db.Column(db.JSON)

    entities = db.Column(db.JSON)
    topics = db.Column(db.JSON)
    sentiment = db.Column(db.String(20))

    views = db.Column(db.Integer, default=0)
    shares = db.Column(db.Integer, default=0)
    likes = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)

    status = db.Column(db.String(20), default='draft', index=True)
    featured = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime)

    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    author = db.relationship('User', back_populates='stories')
    contributions = db.relationship('Contribution', back_populates='story', lazy='dynamic')
    pathway_items = db.relationship('PathwayItem', back_populates='story', lazy='dynamic')
    bookmarks = db.relationship('Bookmark', back_populates='story', lazy='dynamic')

    def to_step_dict(self):
        """Minimal representation used inside pathway steps — avoids sending
        transcript, entities and topics which can be hundreds of KB."""
        return {
            'id':           self.id,
            'title':        self.title,
            'content_type': self.content_type,
            'duration':     self.duration,
            'category':     self.category,
            'county':       self.county,
            'media_url':    self.media_url,
            'thumbnail_url':self.thumbnail_url,
            'views':        self.views,
            'likes':        self.likes,
        }

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'content_type': self.content_type,
            'media_url': self.media_url,
            'thumbnail_url': self.thumbnail_url,
            'transcript': self.transcript,
            'duration': self.duration,
            'county': self.county,
            'category': self.category,
            'tags': self.tags,
            'entities': self.entities,
            'topics': self.topics,
            'sentiment': self.sentiment,
            'views': self.views,
            'shares': self.shares,
            'likes': self.likes,
            'comments_count': self.comments_count,
            'status': self.status,
            'featured': self.featured,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'author': self.author.to_dict() if self.author else None
        }