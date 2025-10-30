from app.models.story import Story
from app.models.user import User
from app.services.nlp_service import NLPService
import random

class RecommendationService:
    def __init__(self):
        self.nlp_service = NLPService()
    
    def get_recommendations(self, user_id=None, query=None, limit=10):
        """
        Get personalized story recommendations
        """
        if query:
            return self._query_based_recommendations(query, limit)
        elif user_id:
            return self._user_based_recommendations(user_id, limit)
        else:
            return self._popular_recommendations(limit)
    
    def _query_based_recommendations(self, query, limit):
        """
        Get recommendations based on natural language query
        """
        # Extract keywords from query
        keywords = self.nlp_service.extract_keywords(query)
        
        # Search stories
        stories = Story.query.filter(Story.status == 'published')
        
        # Filter by keywords in title, description, or tags
        matching_stories = []
        for story in stories:
            score = 0
            story_text = f"{story.title} {story.description}".lower()
            
            for keyword in keywords:
                if keyword in story_text:
                    score += 1
                if story.tags and keyword in [tag.lower() for tag in story.tags]:
                    score += 2
            
            if score > 0:
                matching_stories.append((story, score))
        
        # Sort by score
        matching_stories.sort(key=lambda x: x[1], reverse=True)
        
        return [story.to_dict() for story, score in matching_stories[:limit]]
    
    def _user_based_recommendations(self, user_id, limit):
        """
        Get recommendations based on user's viewing history
        """
        user = User.query.get(user_id)
        if not user:
            return self._popular_recommendations(limit)
        
        # Get user's viewed stories (from contributions)
        viewed_story_ids = [
            c.story_id for c in user.contributions.filter_by(contribution_type='view').all()
        ]
        
        if not viewed_story_ids:
            return self._popular_recommendations(limit)
        
        # Get stories with similar categories/counties
        viewed_stories = Story.query.filter(Story.id.in_(viewed_story_ids)).all()
        
        categories = list(set(s.category for s in viewed_stories if s.category))
        counties = list(set(s.county for s in viewed_stories if s.county))
        
        # Find similar stories
        recommendations = Story.query.filter(
            Story.status == 'published',
            Story.id.notin_(viewed_story_ids),
            (Story.category.in_(categories)) | (Story.county.in_(counties))
        ).order_by(Story.views.desc()).limit(limit).all()
        
        return [story.to_dict() for story in recommendations]
    
    def _popular_recommendations(self, limit):
        """
        Get popular stories as fallback
        """
        stories = Story.query.filter_by(status='published').order_by(
            Story.views.desc()
        ).limit(limit).all()
        
        return [story.to_dict() for story in stories]
