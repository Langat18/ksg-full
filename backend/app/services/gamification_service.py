from app import db
from app.models.badge import Badge, UserBadge
from app.models.user import User
from app.models.story import Story
from datetime import datetime
from sqlalchemy import desc, func
import logging

logger = logging.getLogger(__name__)

class GamificationService:
    
    LEVELS = [
        {'level': 1, 'min_points': 0, 'max_points': 99, 'name': 'Novice', 'icon': '🌱'},
        {'level': 2, 'min_points': 100, 'max_points': 249, 'name': 'Explorer', 'icon': '🔍'},
        {'level': 3, 'min_points': 250, 'max_points': 499, 'name': 'Contributor', 'icon': '✍️'},
        {'level': 4, 'min_points': 500, 'max_points': 999, 'name': 'Expert', 'icon': '⭐'},
        {'level': 5, 'min_points': 1000, 'max_points': 1999, 'name': 'Champion', 'icon': '🏆'},
        {'level': 6, 'min_points': 2000, 'max_points': float('inf'), 'name': 'Legend', 'icon': '👑'}
    ]
    
    POINT_REWARDS = {
        'story_upload': 20,
        'story_view': 5,
        'story_like': 10,
        'story_share': 15,
        'pathway_complete': 50,
        'pathway_start': 5,
        'profile_complete': 25,
        'first_story': 30,
        'comment_create': 5,
        'daily_login': 2
    }
    
    def __init__(self):
        pass
    
    def award_points(self, user_id, action, points=None):
        try:
            user = User.query.get(user_id)
            if not user:
                logger.error(f"User {user_id} not found")
                return False
            
            points_to_award = points or self.POINT_REWARDS.get(action, 0)
            
            if points_to_award <= 0:
                logger.warning(f"Invalid points for action '{action}'")
                return False
            
            old_points = user.points or 0
            user.points = old_points + points_to_award
            
            old_level = self.get_user_level(old_points)['level']
            new_level = self.get_user_level(user.points)['level']
            
            level_up = new_level > old_level
            
            db.session.commit()
            
            if level_up:
                logger.info(f"User {user_id} leveled up from {old_level} to {new_level}")
            
            self.check_and_award_badges(user_id)
            
            return {
                'points_awarded': points_to_award,
                'total_points': user.points,
                'level_up': level_up,
                'new_level': new_level if level_up else None
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to award points to user {user_id}: {e}")
            return False
    
    def get_user_level(self, points):
        for level_data in self.LEVELS:
            if level_data['min_points'] <= points <= level_data['max_points']:
                return level_data
        return self.LEVELS[-1]
    
    def get_user_stats(self, user_id):
        try:
            user = User.query.get(user_id)
            if not user:
                return None
            
            total_points = user.points or 0
            current_level = self.get_user_level(total_points)
            
            next_level = None
            progress = 0
            points_needed = 0
            
            if current_level['level'] < len(self.LEVELS):
                next_level_data = self.LEVELS[current_level['level']]
                next_level = next_level_data['name']
                points_needed = next_level_data['min_points'] - total_points
                points_in_current_level = total_points - current_level['min_points']
                level_range = next_level_data['min_points'] - current_level['min_points']
                progress = int((points_in_current_level / level_range) * 100) if level_range > 0 else 100
            else:
                next_level = "Max Level"
                progress = 100
                points_needed = 0
            
            user_badges = UserBadge.query.filter_by(user_id=user_id).all()
            badges = [
                {
                    'id': ub.badge.id,
                    'name': ub.badge.name,
                    'description': ub.badge.description,
                    'icon': ub.badge.icon,
                    'earned_at': ub.earned_at.isoformat() if ub.earned_at else None
                }
                for ub in user_badges
            ]
            
            return {
                'user_id': user_id,
                'total_points': total_points,
                'level': current_level['level'],
                'level_name': current_level['name'],
                'level_icon': current_level['icon'],
                'next_level': next_level,
                'progress_to_next_level': progress,
                'points_to_next_level': points_needed,
                'badges': badges,
                'badge_count': len(badges)
            }
            
        except Exception as e:
            logger.error(f"Failed to get user stats for {user_id}: {e}")
            return None
    
    def check_and_award_badges(self, user_id):
        try:
            user = User.query.get(user_id)
            if not user:
                return []
            
            newly_awarded = []
            all_badges = Badge.query.all()
            
            existing_badge_ids = {ub.badge_id for ub in UserBadge.query.filter_by(user_id=user_id).all()}
            
            for badge in all_badges:
                if badge.id in existing_badge_ids:
                    continue
                
                if self._check_badge_criteria(user, badge):
                    user_badge = UserBadge(
                        user_id=user_id,
                        badge_id=badge.id,
                        earned_at=datetime.utcnow()
                    )
                    
                    if badge.points_value:
                        user.points = (user.points or 0) + badge.points_value
                    
                    db.session.add(user_badge)
                    newly_awarded.append(badge)
            
            if newly_awarded:
                db.session.commit()
                logger.info(f"Awarded {len(newly_awarded)} badges to user {user_id}")
            
            return [
                {
                    'id': badge.id,
                    'name': badge.name,
                    'description': badge.description,
                    'icon': badge.icon
                }
                for badge in newly_awarded
            ]
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to check badges for user {user_id}: {e}")
            return []
    
    def _check_badge_criteria(self, user, badge):
        try:
            criteria_type = badge.criteria_type
            criteria_value = badge.criteria_value
            
            if criteria_type == 'stories_uploaded':
                count = user.stories.filter_by(status='published').count()
                return count >= criteria_value
            
            elif criteria_type == 'stories_published':
                count = user.stories.filter_by(status='published').count()
                return count >= criteria_value
            
            elif criteria_type == 'views_received':
                total_views = db.session.query(func.sum(Story.views)).filter_by(
                    author_id=user.id,
                    status='published'
                ).scalar() or 0
                return total_views >= criteria_value
            
            elif criteria_type == 'likes_received':
                total_likes = db.session.query(func.sum(Story.likes)).filter_by(
                    author_id=user.id,
                    status='published'
                ).scalar() or 0
                return total_likes >= criteria_value
            
            elif criteria_type == 'pathways_completed':
                count = user.pathway_progress.filter_by(is_completed=True).count()
                return count >= criteria_value
            
            elif criteria_type == 'total_points':
                return (user.points or 0) >= criteria_value
            
            elif criteria_type == 'level_reached':
                current_level = self.get_user_level(user.points or 0)['level']
                return current_level >= criteria_value
            
            elif criteria_type == 'shares_made':
                total_shares = db.session.query(func.sum(Story.shares)).filter_by(
                    author_id=user.id,
                    status='published'
                ).scalar() or 0
                return total_shares >= criteria_value
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking badge criteria: {e}")
            return False
    
    def get_leaderboard(self, limit=10, timeframe='all'):
        try:
            query = User.query.filter(User.points > 0)
            
            if timeframe == 'week':
                from datetime import datetime, timedelta
                week_ago = datetime.utcnow() - timedelta(days=7)
                query = query.filter(User.last_login >= week_ago)
            elif timeframe == 'month':
                from datetime import datetime, timedelta
                month_ago = datetime.utcnow() - timedelta(days=30)
                query = query.filter(User.last_login >= month_ago)
            
            users = query.order_by(desc(User.points)).limit(limit).all()
            
            leaderboard = []
            for rank, user in enumerate(users, start=1):
                level_info = self.get_user_level(user.points or 0)
                leaderboard.append({
                    'rank': rank,
                    'user_id': user.id,
                    'username': user.username or user.email,
                    'full_name': user.full_name,
                    'points': user.points or 0,
                    'level': level_info['level'],
                    'level_name': level_info['name'],
                    'badge_count': UserBadge.query.filter_by(user_id=user.id).count()
                })
            
            return leaderboard
            
        except Exception as e:
            logger.error(f"Failed to get leaderboard: {e}")
            return []
    
    def get_user_rank(self, user_id):
        try:
            user = User.query.get(user_id)
            if not user:
                return None
            
            rank = User.query.filter(User.points > user.points).count() + 1
            total_users = User.query.filter(User.points > 0).count()
            
            return {
                'rank': rank,
                'total_users': total_users,
                'percentile': int(((total_users - rank) / total_users) * 100) if total_users > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Failed to get user rank for {user_id}: {e}")
            return None
    
    def initialize_default_badges(self):
        try:
            default_badges = [
                {
                    'name': 'First Story',
                    'description': 'Published your first story',
                    'icon': '📝',
                    'criteria_type': 'stories_uploaded',
                    'criteria_value': 1,
                    'points_value': 30
                },
                {
                    'name': 'Storyteller',
                    'description': 'Published 10 stories',
                    'icon': '📚',
                    'criteria_type': 'stories_uploaded',
                    'criteria_value': 10,
                    'points_value': 100
                },
                {
                    'name': 'Popular Creator',
                    'description': 'Received 100 views',
                    'icon': '🌟',
                    'criteria_type': 'views_received',
                    'criteria_value': 100,
                    'points_value': 50
                },
                {
                    'name': 'Influencer',
                    'description': 'Received 1000 views',
                    'icon': '🔥',
                    'criteria_type': 'views_received',
                    'criteria_value': 1000,
                    'points_value': 200
                },
                {
                    'name': 'Pathway Explorer',
                    'description': 'Completed your first pathway',
                    'icon': '🗺️',
                    'criteria_type': 'pathways_completed',
                    'criteria_value': 1,
                    'points_value': 50
                },
                {
                    'name': 'Pathway Master',
                    'description': 'Completed 5 pathways',
                    'icon': '🎯',
                    'criteria_type': 'pathways_completed',
                    'criteria_value': 5,
                    'points_value': 150
                },
                {
                    'name': 'Champion',
                    'description': 'Reached level 5',
                    'icon': '🏆',
                    'criteria_type': 'level_reached',
                    'criteria_value': 5,
                    'points_value': 100
                }
            ]
            
            for badge_data in default_badges:
                existing = Badge.query.filter_by(name=badge_data['name']).first()
                if not existing:
                    badge = Badge(**badge_data)
                    db.session.add(badge)
            
            db.session.commit()
            logger.info("Default badges initialized")
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to initialize badges: {e}")