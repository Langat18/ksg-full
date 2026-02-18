from app import db
from app.models.badge import Badge, UserBadge
from app.models.user import User
from app.models.story import Story
from datetime import datetime, timedelta
from sqlalchemy import desc, func
import logging

logger = logging.getLogger(__name__)


class GamificationService:

    LEVELS = [
        {'level': 1, 'min_points': 0,    'max_points': 99,          'name': 'Novice',      'icon': '🌱'},
        {'level': 2, 'min_points': 100,  'max_points': 249,         'name': 'Explorer',    'icon': '🔍'},
        {'level': 3, 'min_points': 250,  'max_points': 499,         'name': 'Contributor', 'icon': '✏️'},
        {'level': 4, 'min_points': 500,  'max_points': 999,         'name': 'Expert',      'icon': '⭐'},
        {'level': 5, 'min_points': 1000, 'max_points': 1999,        'name': 'Champion',    'icon': '🏆'},
        {'level': 6, 'min_points': 2000, 'max_points': float('inf'),'name': 'Legend',      'icon': '👑'},
    ]

    POINT_REWARDS = {
        'story_upload':      20,
        'story_view':         5,
        'story_like':        10,
        'story_share':       15,
        'pathway_complete':  50,
        'pathway_start':      5,
        'profile_complete':  25,
        'first_story':       30,
        'comment_create':     5,
        'daily_login':        2,
    }

    def get_user_level(self, points):
        for lvl in self.LEVELS:
            if lvl['min_points'] <= points <= lvl['max_points']:
                return lvl
        return self.LEVELS[-1]

    def award_points(self, user_id, action, points=None):
        try:
            user = User.query.get(user_id)
            if not user:
                return False

            pts = points or self.POINT_REWARDS.get(action, 0)
            if pts <= 0:
                return False

            old_pts   = user.points or 0
            user.points = old_pts + pts
            old_level = self.get_user_level(old_pts)['level']
            new_level = self.get_user_level(user.points)['level']
            db.session.commit()

            self.check_and_award_badges(user_id)

            return {
                'points_awarded': pts,
                'total_points':   user.points,
                'level_up':       new_level > old_level,
                'new_level':      new_level if new_level > old_level else None,
            }
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to award points to user {user_id}: {e}")
            return False

    def get_user_stats(self, user_id):
        try:
            user = User.query.get(user_id)
            if not user:
                return None

            pts   = user.points or 0
            cur   = self.get_user_level(pts)
            idx   = cur['level'] - 1

            if cur['level'] < len(self.LEVELS):
                nxt          = self.LEVELS[idx + 1]
                pts_needed   = nxt['min_points'] - pts
                level_range  = nxt['min_points'] - cur['min_points']
                progress     = int(((pts - cur['min_points']) / level_range) * 100) if level_range else 100
                next_name    = nxt['name']
            else:
                pts_needed, progress, next_name = 0, 100, 'Max Level'

            # Single query for badges
            user_badges = (
                UserBadge.query
                .filter_by(user_id=user_id)
                .join(UserBadge.badge)
                .all()
            )
            badges = [
                {
                    'id':          ub.badge.id,
                    'name':        ub.badge.name,
                    'description': ub.badge.description,
                    'icon':        ub.badge.icon,
                    'earned_at':   ub.earned_at.isoformat() if ub.earned_at else None,
                }
                for ub in user_badges
            ]

            return {
                'user_id':                user_id,
                'total_points':           pts,
                'level':                  cur['level'],
                'level_name':             cur['name'],
                'level_icon':             cur['icon'],
                'next_level':             next_name,
                'progress_to_next_level': progress,
                'points_to_next_level':   pts_needed,
                'badges':                 badges,
                'badge_count':            len(badges),
            }
        except Exception as e:
            logger.error(f"Failed to get user stats for {user_id}: {e}")
            return None

    def check_and_award_badges(self, user_id):
        try:
            user = User.query.get(user_id)
            if not user:
                return []

            all_badges        = Badge.query.all()
            existing_ids      = {ub.badge_id for ub in UserBadge.query.filter_by(user_id=user_id).all()}
            candidates        = [b for b in all_badges if b.id not in existing_ids]
            if not candidates:
                return []

            # Pre-fetch aggregates once rather than per-badge
            story_count = Story.query.filter_by(author_id=user_id, status='published').count()
            agg = db.session.query(
                func.coalesce(func.sum(Story.views),  0),
                func.coalesce(func.sum(Story.likes),  0),
                func.coalesce(func.sum(Story.shares), 0),
            ).filter_by(author_id=user_id, status='published').one()
            total_views, total_likes, total_shares = agg

            pathway_count = user.pathway_progress.filter_by(is_completed=True).count()
            current_level = self.get_user_level(user.points or 0)['level']

            agg_map = {
                'stories_uploaded':   story_count,
                'stories_published':  story_count,
                'views_received':     total_views,
                'likes_received':     total_likes,
                'shares_made':        total_shares,
                'pathways_completed': pathway_count,
                'total_points':       user.points or 0,
                'level_reached':      current_level,
            }

            newly_awarded = []
            for badge in candidates:
                threshold = agg_map.get(badge.criteria_type)
                if threshold is not None and threshold >= badge.criteria_value:
                    db.session.add(UserBadge(
                        user_id=user_id, badge_id=badge.id, earned_at=datetime.utcnow()
                    ))
                    if badge.points_value:
                        user.points = (user.points or 0) + badge.points_value
                    newly_awarded.append(badge)

            if newly_awarded:
                db.session.commit()
                logger.info(f"Awarded {len(newly_awarded)} badges to user {user_id}")

            return [{'id': b.id, 'name': b.name, 'description': b.description, 'icon': b.icon_url} for b in newly_awarded]

        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to check badges for user {user_id}: {e}")
            return []

    def get_leaderboard(self, limit=10, timeframe='all'):
        try:
            query = User.query.filter(User.points > 0)
            if timeframe == 'week':
                query = query.filter(User.last_login >= datetime.utcnow() - timedelta(days=7))
            elif timeframe == 'month':
                query = query.filter(User.last_login >= datetime.utcnow() - timedelta(days=30))

            users = query.order_by(desc(User.points)).limit(limit).all()
            if not users:
                return []

            badge_counts = dict(
                db.session.query(UserBadge.user_id, func.count(UserBadge.id))
                .filter(UserBadge.user_id.in_([u.id for u in users]))
                .group_by(UserBadge.user_id)
                .all()
            )

            return [
                {
                    'rank':       rank,
                    'user_id':    u.id,
                    'username':   u.username or u.email,
                    'full_name':  u.full_name,
                    'points':     u.points or 0,
                    'level':      (lvl := self.get_user_level(u.points or 0))['level'],
                    'level_name': lvl['name'],
                    'badge_count': badge_counts.get(u.id, 0),
                }
                for rank, u in enumerate(users, 1)
            ]
        except Exception as e:
            logger.error(f"Failed to get leaderboard: {e}")
            return []

    def get_user_rank(self, user_id):
        try:
            user = User.query.get(user_id)
            if not user:
                return None
            rank        = User.query.filter(User.points > user.points).count() + 1
            total_users = User.query.filter(User.points > 0).count()
            return {
                'rank':        rank,
                'total_users': total_users,
                'percentile':  int(((total_users - rank) / total_users) * 100) if total_users > 0 else 0,
            }
        except Exception as e:
            logger.error(f"Failed to get user rank for {user_id}: {e}")
            return None

    def initialize_default_badges(self):
        try:
            defaults = [
                {'name': 'First Story',      'description': 'Published your first story',  'icon': '📝', 'criteria_type': 'stories_uploaded',   'criteria_value': 1,    'points_value': 30},
                {'name': 'Storyteller',      'description': 'Published 10 stories',         'icon': '📚', 'criteria_type': 'stories_uploaded',   'criteria_value': 10,   'points_value': 100},
                {'name': 'Popular Creator',  'description': 'Received 100 views',           'icon': '🌟', 'criteria_type': 'views_received',     'criteria_value': 100,  'points_value': 50},
                {'name': 'Influencer',       'description': 'Received 1000 views',          'icon': '🔥', 'criteria_type': 'views_received',     'criteria_value': 1000, 'points_value': 200},
                {'name': 'Pathway Explorer', 'description': 'Completed your first pathway', 'icon': '🗺️', 'criteria_type': 'pathways_completed', 'criteria_value': 1,    'points_value': 50},
                {'name': 'Pathway Master',   'description': 'Completed 5 pathways',         'icon': '🎯', 'criteria_type': 'pathways_completed', 'criteria_value': 5,    'points_value': 150},
                {'name': 'Champion',         'description': 'Reached level 5',              'icon': '🏆', 'criteria_type': 'level_reached',      'criteria_value': 5,    'points_value': 100},
            ]
            for bd in defaults:
                if not Badge.query.filter_by(name=bd['name']).first():
                    db.session.add(Badge(**bd))
            db.session.commit()
            logger.info("Default badges initialized")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to initialize badges: {e}")