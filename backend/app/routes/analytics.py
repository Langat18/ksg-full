from flask import Blueprint, jsonify
from app import db
from app.models.story import Story
from app.models.user import User
from sqlalchemy import func
from datetime import datetime, timedelta

bp = Blueprint('analytics', __name__)

@bp.route('/dashboard', methods=['GET'])
def get_public_dashboard():
    """
    Get public analytics dashboard data (Story Pulse)
    """
    # Total counts
    total_stories = Story.query.filter_by(status='published').count()
    total_users = User.query.count()
    total_views = db.session.query(func.sum(Story.views)).scalar() or 0
    total_shares = db.session.query(func.sum(Story.shares)).scalar() or 0
    
    # Stories by county
    stories_by_county = db.session.query(
        Story.county,
        func.count(Story.id).label('count')
    ).filter(
        Story.status == 'published',
        Story.county.isnot(None)
    ).group_by(Story.county).all()
    
    # Hot topics (from tags)
    hot_topics = db.session.query(
        func.unnest(Story.tags).label('tag'),
        func.count().label('count')
    ).filter(
        Story.status == 'published',
        Story.tags.isnot(None)
    ).group_by('tag').order_by(func.count().desc()).limit(20).all()
    
    # Most viewed stories (this month)
    month_ago = datetime.utcnow() - timedelta(days=30)
    most_viewed = Story.query.filter(
        Story.status == 'published',
        Story.created_at >= month_ago
    ).order_by(Story.views.desc()).limit(10).all()
    
    # Content type distribution
    content_types = db.session.query(
        Story.content_type,
        func.count(Story.id).label('count')
    ).filter(
        Story.status == 'published'
    ).group_by(Story.content_type).all()
    
    # Growth over time (last 6 months)
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    monthly_growth = db.session.query(
        func.date_trunc('month', Story.created_at).label('month'),
        func.count(Story.id).label('count')
    ).filter(
        Story.status == 'published',
        Story.created_at >= six_months_ago
    ).group_by('month').order_by('month').all()
    
    return jsonify({
        'overview': {
            'total_stories': total_stories,
            'total_users': total_users,
            'total_views': total_views,
            'total_shares': total_shares
        },
        'stories_by_county': [
            {'county': county, 'count': count} 
            for county, count in stories_by_county
        ],
        'hot_topics': [
            {'topic': tag, 'count': count} 
            for tag, count in hot_topics if tag
        ],
        'most_viewed': [story.to_dict() for story in most_viewed],
        'content_types': [
            {'type': content_type, 'count': count} 
            for content_type, count in content_types
        ],
        'monthly_growth': [
            {'month': month.isoformat() if month else None, 'count': count} 
            for month, count in monthly_growth
        ]
    })

@bp.route('/stories/<int:story_id>/analytics', methods=['GET'])
def get_story_analytics(story_id):
    """Get analytics for a specific story"""
    story = Story.query.get_or_404(story_id)
    
    # Get engagement over time (simplified)
    # In production, you'd track this in a separate table
    
    return jsonify({
        'story_id': story_id,
        'title': story.title,
        'views': story.views,
        'shares': story.shares,
        'likes': story.likes,
        'comments_count': story.comments_count,
        'created_at': story.created_at.isoformat() if story.created_at else None
    })

@bp.route('/trends', methods=['GET'])
def get_trends():
    """Get trending topics and stories"""
    days = request.args.get('days', 7, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Trending stories
    trending_stories = Story.query.filter(
        Story.status == 'published',
        Story.created_at >= start_date
    ).order_by(Story.views.desc()).limit(20).all()
    
    # Trending counties
    trending_counties = db.session.query(
        Story.county,
        func.count(Story.id).label('story_count'),
        func.sum(Story.views).label('total_views')
    ).filter(
        Story.status == 'published',
        Story.created_at >= start_date,
        Story.county.isnot(None)
    ).group_by(Story.county).order_by(func.sum(Story.views).desc()).limit(10).all()
    
    return jsonify({
        'period_days': days,
        'trending_stories': [story.to_dict() for story in trending_stories],
        'trending_counties': [
            {
                'county': county,
                'story_count': story_count,
                'total_views': total_views
            }
            for county, story_count, total_views in trending_counties
        ]
    })