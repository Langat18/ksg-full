from app import db
class Badge(db.Model):
    __tablename__ = 'badges'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    icon_url = db.Column(db.String(500))
    points_value = db.Column(db.Integer, default=0)
    
    # Criteria
    criteria_type = db.Column(db.String(50))  # stories_uploaded, views_received, pathways_completed
    criteria_value = db.Column(db.Integer)  # Threshold value
    
    # Relationships
    user_badges = db.relationship('UserBadge', back_populates='badge')


class UserBadge(db.Model):
    __tablename__ = 'user_badges'
    
    id = db.Column(db.Integer, primary_key=True)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    badge_id = db.Column(db.Integer, db.ForeignKey('badges.id'), nullable=False)
    
    # Relationships
    user = db.relationship('User', back_populates='badges')
    badge = db.relationship('Badge', back_populates='user_badges')


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


class Bookmark(db.Model):
    __tablename__ = 'bookmarks'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.Integer)  # Timestamp in seconds for video/audio bookmarks
    note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    story_id = db.Column(db.Integer, db.ForeignKey('stories.id'), nullable=False)
    
    # Relationships
    user = db.relationship('User', backref='bookmarks')
    story = db.relationship('Story', back_populates='bookmarks')