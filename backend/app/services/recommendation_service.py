from sqlalchemy import desc
from app.models.story import Story
from app.models.user import User
from app.services.nlp_service import NLPService
import logging

logger = logging.getLogger(__name__)


class RecommendationService:
    def __init__(self):
        self.nlp = NLPService()

    def get_recommendations(self, user_id=None, query=None, limit=10, exclude_ids=None):
        try:
            exclude_ids = exclude_ids or []
            if query:
                return self._query_based(query, limit, exclude_ids)
            if user_id:
                return self._user_based(user_id, limit, exclude_ids)
            return self._popular(limit, exclude_ids)
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return []

    def get_similar_stories(self, story_id, limit=5):
        try:
            story = Story.query.get(story_id)
            if not story:
                return []

            candidates = Story.query.filter(
                Story.status == 'published',
                Story.id != story_id,
                (Story.category == story.category) | (Story.county == story.county)
            ).order_by(desc(Story.views)).limit(limit * 2).all()

            scored = sorted(
                candidates,
                key=lambda s: (s.category == story.category) * 3 + (s.county == story.county) * 2 + (s.author_id == story.author_id),
                reverse=True
            )
            return [s.to_dict() for s in scored[:limit]]
        except Exception as e:
            logger.error(f"Failed to get similar stories: {e}")
            return []

    def get_trending_stories(self, days=7, limit=10):
        from datetime import datetime, timedelta
        try:
            since = datetime.utcnow() - timedelta(days=days)
            stories = Story.query.filter(
                Story.status == 'published', Story.created_at >= since
            ).order_by(desc(Story.views), desc(Story.likes), desc(Story.shares)).limit(limit).all()
            return [s.to_dict() for s in stories]
        except Exception as e:
            logger.error(f"Failed to get trending stories: {e}")
            return []

    def _base_query(self, exclude_ids):
        q = Story.query.filter(Story.status == 'published')
        if exclude_ids:
            q = q.filter(Story.id.notin_(exclude_ids))
        return q

    def _popular(self, limit, exclude_ids):
        stories = self._base_query(exclude_ids).order_by(
            desc(Story.views), desc(Story.likes), desc(Story.created_at)
        ).limit(limit).all()
        return [s.to_dict() for s in stories]

    def _query_based(self, query, limit, exclude_ids):
        keywords = self.nlp.extract_keywords(query, top_n=5)
        if not keywords:
            return self._popular(limit, exclude_ids)

        scored = []
        for story in self._base_query(exclude_ids).all():
            score = self._score_by_query(story, keywords)
            if score > 0:
                scored.append((story, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [s.to_dict() for s, _ in scored[:limit]]

    def _score_by_query(self, story, keywords):
        score = 0
        kw_set = {k.lower() for k in keywords}
        if any(k in story.title.lower() for k in kw_set):
            score += 3
        if story.description and any(k in story.description.lower() for k in kw_set):
            score += 2
        if story.tags and any(k in ' '.join(story.tags).lower() for k in kw_set):
            score += 2
        if story.category and any(k in story.category.lower() for k in kw_set):
            score += 1
        if story.county and any(k in story.county.lower() for k in kw_set):
            score += 1
        return score

    def _user_based(self, user_id, limit, exclude_ids):
        user = User.query.get(user_id)
        if not user:
            return self._popular(limit, exclude_ids)

        authored = Story.query.filter_by(author_id=user_id, status='published').all()
        exclude_ids = list(set(exclude_ids + [s.id for s in authored]))

        if not authored:
            return self._county_based(user.county, limit, exclude_ids)

        cats = {s.category for s in authored if s.category}
        counties = {s.county for s in authored if s.county}

        scored = []
        for story in self._base_query(exclude_ids).limit(100).all():
            score = (5 if story.category in cats else 0) + \
                    (3 if story.county in counties else 0) + \
                    (2 if story.county == user.county else 0) + \
                    min(story.views or 0, 100) * 0.01 + \
                    min(story.likes or 0, 50) * 0.02
            if score > 0:
                scored.append((story, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        result = [s.to_dict() for s, _ in scored[:limit]]

        if len(result) < limit:
            result.extend(self._popular(limit - len(result), exclude_ids + [s['id'] for s in result]))

        return result[:limit]

    def _county_based(self, county, limit, exclude_ids):
        if not county:
            return self._popular(limit, exclude_ids)
        stories = self._base_query(exclude_ids).filter(
            Story.county == county
        ).order_by(desc(Story.views)).limit(limit).all()
        result = [s.to_dict() for s in stories]
        if len(result) < limit:
            result.extend(self._popular(limit - len(result), exclude_ids + [s['id'] for s in result]))
        return result[:limit]