from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.story import Story
from app.models.user import User
from app.models.contribution import Contribution
from datetime import datetime, timedelta
from sqlalchemy import func, desc

bp = Blueprint('analytics', __name__)

@bp.route('/summary', methods=['GET'])
def get_analytics_summary():
    total_stories = Story.query.filter_by(status='published').count()
    
    stories = Story.query.filter_by(status='published').all()
    total_views = sum(story.views for story in stories)
    total_shares = sum(story.shares for story in stories)
    total_likes = sum(story.likes for story in stories)
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users = User.query.filter(User.last_login >= thirty_days_ago).count()
    
    counties_covered = db.session.query(func.count(func.distinct(Story.county))).filter(
        Story.status == 'published',
        Story.county.isnot(None)
    ).scalar()
    
    top_category = db.session.query(
        Story.category,
        func.count(Story.id).label('count')
    ).filter(
        Story.status == 'published',
        Story.category.isnot(None)
    ).group_by(Story.category).order_by(desc('count')).first()
    
    counties_data = db.session.query(
        Story.county,
        func.count(Story.id).label('stories'),
        func.sum(Story.views).label('plays')
    ).filter(
        Story.status == 'published',
        Story.county.isnot(None)
    ).group_by(Story.county).order_by(desc('stories')).limit(10).all()
    
    hot_topics = db.session.query(
        Story.category,
        func.count(Story.id).label('count')
    ).filter(
        Story.status == 'published',
        Story.category.isnot(None)
    ).group_by(Story.category).order_by(desc('count')).limit(6).all()
    
    top_contributors = db.session.query(
        User.id,
        User.full_name,
        User.username,
        func.count(Story.id).label('story_count')
    ).join(Story, User.id == Story.author_id).filter(
        Story.status == 'published'
    ).group_by(User.id).order_by(desc('story_count')).limit(5).all()
    
    campus_stats = db.session.query(
        User.campus,
        func.count(User.id)
    ).filter(
        User.campus.isnot(None)
    ).group_by(User.campus).all()
    
    campus_distribution = {
        campus: count for campus, count in campus_stats
    }
    
    recent_stories = Story.query.filter_by(status='published').order_by(
        Story.created_at.desc()
    ).limit(10).all()
    
    return jsonify({
        'total_stories': total_stories,
        'total_views': total_views,
        'total_plays': total_views,
        'total_shares': total_shares,
        'total_likes': total_likes,
        'active_users': active_users if active_users else 0,
        'counties_covered': counties_covered if counties_covered else 0,
        'top_category': top_category[0] if top_category else 'N/A',
        'campus_distribution': campus_distribution,
        'total_campuses': len(campus_distribution),
        'counties_data': [
            {
                'county': county,
                'stories': stories,
                'plays': plays if plays else 0
            }
            for county, stories, plays in counties_data
        ],
        'hot_topics': [
            {
                'topic': category,
                'count': count,
                'trend': 'up'
            }
            for category, count in hot_topics
        ],
        'top_contributors': [
            {
                'id': user_id,
                'name': full_name or username,
                'stories': story_count,
                'impact': 'High' if story_count >= 3 else 'Medium',
                'category': 'Contributor'
            }
            for user_id, full_name, username, story_count in top_contributors
        ],
        'recent_activity': [
            {
                'action': 'New story published',
                'title': story.title,
                'time': format_time_ago(story.created_at),
                'author': story.author.full_name or story.author.username
            }
            for story in recent_stories
        ]
    })

@bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_analytics(user_id):
    current_user_id = get_jwt_identity()
    
    user = User.query.get_or_404(user_id)
    current_user = User.query.get(current_user_id)
    
    if current_user_id != user_id and current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    user_stories = Story.query.filter_by(author_id=user_id, status='published').all()
    
    total_views = sum(story.views for story in user_stories)
    total_shares = sum(story.shares for story in user_stories)
    total_likes = sum(story.likes for story in user_stories)
    
    most_popular = max(user_stories, key=lambda s: s.views) if user_stories else None
    
    return jsonify({
        'user_id': user_id,
        'stories_count': len(user_stories),
        'total_views': total_views,
        'total_shares': total_shares,
        'total_likes': total_likes,
        'points': user.points,
        'level': user.level,
        'most_popular_story': most_popular.to_dict() if most_popular else None
    })

@bp.route('/trending', methods=['GET'])
def get_trending_analytics():
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    trending_stories = Story.query.filter(
        Story.status == 'published',
        Story.created_at >= week_ago
    ).order_by(Story.views.desc()).limit(10).all()
    
    return jsonify({
        'trending_stories': [story.to_dict() for story in trending_stories]
    })

def format_time_ago(dt):
    if not dt:
        return 'recently'
    
    now = datetime.utcnow()
    diff = now - dt
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return 'just now'
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f'{minutes} minute{"s" if minutes != 1 else ""} ago'
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f'{hours} hour{"s" if hours != 1 else ""} ago'
    elif seconds < 604800:
        days = int(seconds / 86400)
        return f'{days} day{"s" if days != 1 else ""} ago'
    else:
        weeks = int(seconds / 604800)
        return f'{weeks} week{"s" if weeks != 1 else ""} ago'