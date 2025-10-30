from app import db
from app.models.badge import Badge, UserBadge
from app.models.user import User

class GamificationService:
    def __init__(self):
        pass
    
    def check_and_award_badges(self, user_id):
        """
        Check if user qualifies for any badges and award them
        """
        user = User.query.get(user_id)
        if not user:
            return []
        
        newly_awarded = []
        all_badges = Badge.query.all()
        user_badge_ids = [ub.badge_id for ub in user.badges.all()]
        
        for badge in all_badges:
            if badge.id in user_badge_ids:
                continue  # User already has this badge
            
            if self._check_badge_criteria(user, badge):
                user_badge = UserBadge(user_id=user_id, badge_id=badge.id)
                user.points += badge.points_value
                db.session.add(user_badge)
                newly_awarded.append(badge)
        
        if newly_awarded:
            db.session.commit()
        
        return newly_awarded
    
    def _check_badge_criteria(self, user, badge):
        """
        Check if user meets badge criteria
        """
        criteria_type = badge.criteria_type
        criteria_value = badge.criteria_value
        
        if criteria_type == 'stories_uploaded':
            stories_count = user.stories.filter_by(status='published').count()
            return stories_count >= criteria_value
        
        elif criteria_type == 'views_received':
            total_views = sum(story.views for story in user.stories.filter_by(status='published'))
            return total_views >= criteria_value
        
        elif criteria_type == 'pathways_completed':
            completed_count = user.pathway_progress.filter_by(completed=True).count()
            return completed_count >= criteria_value
        
        elif criteria_type == 'total_points':
            return user.points >= criteria_value
        
        return False
    
    def update_user_level(self, user_id):
        """
        Update user level based on points
        """
        user = User.query.get(user_id)
        if not user:
            return
        
        # Simple level calculation: level = points // 100
        new_level = user.points // 100 + 1
        
        if new_level > user.level:
            user.level = new_level
            db.session.commit()
            return True
        
        return False