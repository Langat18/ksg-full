from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc
from app import db
from app.models.story import Story
from app.models.user import User
from datetime import datetime, timedelta

bp = Blueprint('analytics', __name__)

def _format_time_ago(dt):
    if not dt:
        return 'recently'
    diff = (datetime.utcnow() - dt).total_seconds()
    for limit, unit in ((60, None), (3600, 'minute'), (86400, 'hour'), (604800, 'day')):
        if diff < limit:
            if unit is None:
                return 'just now'
            val = int(diff / (limit // 60 if unit == 'minute' else limit // 24 if unit == 'hour' else limit // 7))
            return f'{val} {unit}{"s" if val != 1 else ""} ago'
    weeks = int(diff / 604800)
    return f'{weeks} week{"s" if weeks != 1 else ""} ago'

@bp.route('/summary', methods=['GET'])
def get_analytics_summary():
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    engagement = db.session.query(
        func.count(Story.id).label('total'),
        func.coalesce(func.sum(Story.views), 0).label('views'),
        func.coalesce(func.sum(Story.shares), 0).label('shares'),
        func.coalesce(func.sum(Story.likes), 0).label('likes')
    ).filter(Story.status == 'published').one()

    active_users = User.query.filter(User.last_login >= thirty_days_ago).count()

    counties_covered = db.session.query(
        func.count(func.distinct(User.county))
    ).filter(User.county.isnot(None), User.county != '', User.county != 'undefined').scalar()

    top_category = db.session.query(
        Story.category, func.count(Story.id).label('cnt')
    ).filter(Story.status == 'published', Story.category.isnot(None)
    ).group_by(Story.category).order_by(desc('cnt')).first()

    counties_data = db.session.query(
        User.county,
        func.count(func.distinct(User.id)).label('users'),
        func.count(Story.id).label('stories')
    ).outerjoin(Story, (User.id == Story.author_id) & (Story.status == 'published')
    ).filter(User.county.isnot(None), User.county != '', User.county != 'undefined'
    ).group_by(User.county).order_by(desc('users')).limit(10).all()

    hot_topics = db.session.query(
        Story.category, func.count(Story.id).label('cnt')
    ).filter(Story.status == 'published', Story.category.isnot(None)
    ).group_by(Story.category).order_by(desc('cnt')).limit(6).all()

    top_contributors = db.session.query(
        User.id, User.full_name, User.username, func.count(Story.id).label('cnt')
    ).join(Story, User.id == Story.author_id
    ).filter(Story.status == 'published'
    ).group_by(User.id, User.full_name, User.username).order_by(desc('cnt')).limit(5).all()

    campus_stats = db.session.query(
        User.campus, func.count(User.id)
    ).filter(
        User.campus.isnot(None), User.campus != '', User.campus != 'undefined', User.campus != 'null'
    ).group_by(User.campus).all()

    campus_distribution = {c.strip(): n for c, n in campus_stats if c and c.strip()}

    recent_stories = Story.query.filter_by(status='published').order_by(
        Story.created_at.desc()
    ).limit(10).all()

    return jsonify({
        'total_stories': engagement.total,
        'total_views': engagement.views,
        'total_plays': engagement.views,
        'total_shares': engagement.shares,
        'total_likes': engagement.likes,
        'active_users': active_users or 0,
        'counties_covered': counties_covered or 0,
        'top_category': top_category[0] if top_category else 'N/A',
        'campus_distribution': campus_distribution,
        'total_campuses': len(campus_distribution),
        'counties_data': [
            {'county': county, 'users': users, 'stories': stories or 0}
            for county, users, stories in counties_data
        ],
        'hot_topics': [
            {'topic': cat, 'count': cnt, 'trend': 'up'}
            for cat, cnt in hot_topics
        ],
        'top_contributors': [
            {
                'id': uid, 'name': name or uname,
                'stories': cnt,
                'impact': 'High' if cnt >= 3 else 'Medium',
                'category': 'Contributor'
            }
            for uid, name, uname, cnt in top_contributors
        ],
        'recent_activity': [
            {
                'action': 'New story published',
                'title': s.title,
                'time': _format_time_ago(s.created_at),
                'author': s.author.full_name or s.author.username
            }
            for s in recent_stories
        ]
    })

@bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_analytics(user_id):
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    current_user = User.query.get(current_user_id)

    if current_user_id != user_id and (not current_user or current_user.role != 'admin'):
        return jsonify({'error': 'Unauthorized'}), 403

    stats = db.session.query(
        func.count(Story.id).label('cnt'),
        func.coalesce(func.sum(Story.views), 0).label('views'),
        func.coalesce(func.sum(Story.shares), 0).label('shares'),
        func.coalesce(func.sum(Story.likes), 0).label('likes')
    ).filter_by(author_id=user_id, status='published').one()

    most_popular = Story.query.filter_by(
        author_id=user_id, status='published'
    ).order_by(Story.views.desc()).first()

    return jsonify({
        'user_id': user_id,
        'stories_count': stats.cnt,
        'total_views': stats.views,
        'total_shares': stats.shares,
        'total_likes': stats.likes,
        'points': user.points,
        'level': user.level,
        'most_popular_story': most_popular.to_dict() if most_popular else None
    })

@bp.route('/trending', methods=['GET'])
def get_trending_analytics():
    week_ago = datetime.utcnow() - timedelta(days=7)
    stories = Story.query.filter(
        Story.status == 'published', Story.created_at >= week_ago
    ).order_by(Story.views.desc()).limit(10).all()
    return jsonify({'trending_stories': [s.to_dict() for s in stories]})