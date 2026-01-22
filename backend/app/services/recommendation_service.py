from app.models.story import Story
from app.models.user import User
from app.services.nlp_service import NLPService
from sqlalchemy import func, desc, and_, or_
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self):
        self.nlp_service = NLPService()
    
    def get_recommendations(self, user_id=None, query=None, limit=10, exclude_ids=None):
        try:
            exclude_ids = exclude_ids or []
            
            if query:
                return self._query_based_recommendations(query, limit, exclude_ids)
            elif user_id:
                return self._user_based_recommendations(user_id, limit, exclude_ids)
            else:
                return self._popular_recommendations(limit, exclude_ids)
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return []
    
    def _query_based_recommendations(self, query, limit, exclude_ids):
        keywords = self.nlp_service.extract_keywords(query, top_n=5)
        
        if not keywords:
            return self._popular_recommendations(limit, exclude_ids)
        
        base_query = Story.query.filter(
            Story.status == 'published',
            Story.id.notin_(exclude_ids) if exclude_ids else True
        )
        
        scored_stories = []
        
        for story in base_query.all():
            score = self._calculate_query_score(story, keywords, query)
            if score > 0:
                scored_stories.append((story, score))
        
        scored_stories.sort(key=lambda x: x[1], reverse=True)
        
        return [story.to_dict() for story, _ in scored_stories[:limit]]
    
    def _calculate_query_score(self, story, keywords, query):
        score = 0
        story_text = f"{story.title} {story.description or ''}".lower()
        
        for keyword in keywords:
            keyword_lower = keyword.lower()
            if keyword_lower in story.title.lower():
                score += 3
            if story.description and keyword_lower in story.description.lower():
                score += 2
            if story.tags and keyword_lower in ' '.join(story.tags).lower():
                score += 2
        
        if story.category and any(k in story.category.lower() for k in keywords):
            score += 1
        
        if story.county and any(k in story.county.lower() for k in keywords):
            score += 1
        
        return score
    
    def _user_based_recommendations(self, user_id, limit, exclude_ids):
        user = User.query.get(user_id)
        if not user:
            return self._popular_recommendations(limit, exclude_ids)
        
        user_stories = Story.query.filter_by(
            author_id=user_id,
            status='published'
        ).all()
        
        viewed_story_ids = [story.id for story in user_stories]
        exclude_ids.extend(viewed_story_ids)
        
        if not user_stories:
            return self._county_based_recommendations(user.county, limit, exclude_ids)
        
        user_categories = [s.category for s in user_stories if s.category]
        user_counties = [s.county for s in user_stories if s.county]
        
        scored_stories = []
        
        base_query = Story.query.filter(
            Story.status == 'published',
            Story.id.notin_(exclude_ids) if exclude_ids else True
        )
        
        for story in base_query.limit(100).all():
            score = self._calculate_user_score(story, user_categories, user_counties, user)
            if score > 0:
                scored_stories.append((story, score))
        
        scored_stories.sort(key=lambda x: x[1], reverse=True)
        
        recommended = [story.to_dict() for story, _ in scored_stories[:limit]]
        
        if len(recommended) < limit:
            remaining = limit - len(recommended)
            popular = self._popular_recommendations(remaining, exclude_ids)
            recommended.extend(popular)
        
        return recommended[:limit]
    
    def _calculate_user_score(self, story, user_categories, user_counties, user):
        score = 0
        
        if story.category in user_categories:
            score += 5
        
        if story.county in user_counties:
            score += 3
        
        if story.county == user.county:
            score += 2
        
        score += min(story.views or 0, 100) * 0.01
        score += min(story.likes or 0, 50) * 0.02
        
        return score
    
    def _county_based_recommendations(self, county, limit, exclude_ids):
        if not county:
            return self._popular_recommendations(limit, exclude_ids)
        
        stories = Story.query.filter(
            Story.status == 'published',
            Story.county == county,
            Story.id.notin_(exclude_ids) if exclude_ids else True
        ).order_by(desc(Story.views)).limit(limit).all()
        
        recommended = [story.to_dict() for story in stories]
        
        if len(recommended) < limit:
            remaining = limit - len(recommended)
            popular = self._popular_recommendations(remaining, exclude_ids)
            recommended.extend(popular)
        
        return recommended[:limit]
    
    def _popular_recommendations(self, limit, exclude_ids):
        stories = Story.query.filter(
            Story.status == 'published',
            Story.id.notin_(exclude_ids) if exclude_ids else True
        ).order_by(
            desc(Story.views),
            desc(Story.likes),
            desc(Story.created_at)
        ).limit(limit).all()
        
        return [story.to_dict() for story in stories]
    
    def get_similar_stories(self, story_id, limit=5):
        try:
            story = Story.query.get(story_id)
            if not story:
                return []
            
            similar_stories = Story.query.filter(
                Story.status == 'published',
                Story.id != story_id,
                or_(
                    Story.category == story.category,
                    Story.county == story.county
                )
            ).order_by(desc(Story.views)).limit(limit * 2).all()
            
            scored_similar = []
            for similar in similar_stories:
                score = 0
                if similar.category == story.category:
                    score += 3
                if similar.county == story.county:
                    score += 2
                if similar.author_id == story.author_id:
                    score += 1
                
                scored_similar.append((similar, score))
            
            scored_similar.sort(key=lambda x: x[1], reverse=True)
            
            return [s.to_dict() for s, _ in scored_similar[:limit]]
            
        except Exception as e:
            logger.error(f"Failed to get similar stories: {e}")
            return []
    
    def get_trending_stories(self, days=7, limit=10):
        from datetime import datetime, timedelta
        
        try:
            since_date = datetime.utcnow() - timedelta(days=days)
            
            stories = Story.query.filter(
                Story.status == 'published',
                Story.created_at >= since_date
            ).order_by(
                desc(Story.views),
                desc(Story.likes),
                desc(Story.shares)
            ).limit(limit).all()
            
            return [story.to_dict() for story in stories]
            
        except Exception as e:
            logger.error(f"Failed to get trending stories: {e}")
            return []