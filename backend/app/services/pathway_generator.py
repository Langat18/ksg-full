from app import db
from app.models.story import Story
from app.models.pathway import Pathway, PathwayItem
from app.services.nlp_service import NLPService
from collections import defaultdict
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class PathwayGenerator:
    
    MIN_STORIES = 7
    OPTIMAL_STORIES = 10
    MAX_STORIES = 15
    MIN_VIEWS = 0
    SIMILARITY_THRESHOLD = 0.5
    
    def __init__(self):
        self.nlp_service = NLPService()
    
    def generate_pathways(self, force_regenerate=False):
        try:
            logger.info("Starting pathway generation...")
            
            stories = Story.query.filter_by(status='published').all()
            
            if len(stories) < self.MIN_STORIES:
                logger.warning(f"Not enough stories. Need {self.MIN_STORIES}, have {len(stories)}")
                return []
            
            groups = self._group_stories(stories)
            
            pathways_created = []
            for group_key, group_stories in groups.items():
                if len(group_stories) >= self.MIN_STORIES:
                    pathway = self._create_pathway_from_group(group_key, group_stories, force_regenerate)
                    if pathway:
                        pathways_created.append(pathway)
            
            logger.info(f"Generated {len(pathways_created)} pathways")
            return pathways_created
            
        except Exception as e:
            logger.error(f"Pathway generation failed: {e}")
            return []
    
    def _group_stories(self, stories):
        groups = defaultdict(list)
        
        for story in stories:
            if not self._is_story_quality(story):
                continue
            
            if story.category:
                groups[f"category_{story.category}"].append(story)
            
            if story.county:
                groups[f"county_{story.county}"].append(story)
            
            if story.topics:
                for topic in story.topics[:3]:
                    groups[f"topic_{topic}"].append(story)
            
            if story.entities:
                for org in story.entities.get('organizations', [])[:2]:
                    groups[f"org_{org}"].append(story)
        
        category_topic_groups = defaultdict(list)
        for story in stories:
            if story.category and story.topics:
                key = f"cat_topic_{story.category}_{story.topics[0] if story.topics else 'general'}"
                category_topic_groups[key].append(story)
        
        groups.update(category_topic_groups)
        
        return groups
    
    def _is_story_quality(self, story):
        if not story.media_url:
            return False
        if not story.description or len(story.description) < 10:
            return False
        if story.views < self.MIN_VIEWS:
            return False
        return True
    
    def _create_pathway_from_group(self, group_key, stories, force_regenerate):
        try:
            stories = list(set(stories))
            
            if len(stories) < self.MIN_STORIES:
                return None
            
            scored_stories = self._score_and_rank_stories(stories)
            
            selected_stories = scored_stories[:min(self.OPTIMAL_STORIES, len(scored_stories))]
            
            if len(selected_stories) < self.MIN_STORIES:
                return None
            
            metadata = self._extract_pathway_metadata(group_key, selected_stories)
            
            existing = Pathway.query.filter_by(
                title=metadata['title'],
                category=metadata['category']
            ).first()
            
            if existing and not force_regenerate:
                logger.info(f"Pathway already exists: {metadata['title']}")
                return None
            
            pathway = Pathway(
                title=metadata['title'],
                description=metadata['description'],
                category=metadata['category'],
                difficulty=metadata['difficulty'],
                duration=metadata['duration'],
                points_reward=metadata['points_reward'],
                is_active=True
            )
            
            db.session.add(pathway)
            db.session.flush()
            
            for idx, story in enumerate(selected_stories):
                item = PathwayItem(
                    pathway_id=pathway.id,
                    story_id=story.id,
                    order=idx + 1
                )
                db.session.add(item)
            
            db.session.commit()
            
            logger.info(f"Created pathway: {pathway.title} with {len(selected_stories)} stories")
            return pathway
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to create pathway from {group_key}: {e}")
            return None
    
    def _score_and_rank_stories(self, stories):
        scored = []
        
        for story in stories:
            score = 0
            
            score += min(story.views or 0, 100) * 0.2
            score += (story.likes or 0) * 2
            score += (story.shares or 0) * 3
            
            if story.created_at:
                days_old = (datetime.utcnow() - story.created_at).days
                if days_old < 30:
                    score += 20
                elif days_old < 90:
                    score += 10
            
            if story.featured:
                score += 15
            
            if story.description and len(story.description) > 200:
                score += 5
            
            if story.entities:
                score += len(story.entities.get('people', [])) * 2
                score += len(story.entities.get('organizations', [])) * 3
            
            scored.append((story, score))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        
        selected = []
        content_types = defaultdict(int)
        authors = defaultdict(int)
        
        for story, score in scored:
            if len(selected) >= self.MAX_STORIES:
                break
            
            if content_types[story.content_type] >= 4:
                continue
            
            if authors[story.author_id] >= 3:
                continue
            
            selected.append(story)
            content_types[story.content_type] += 1
            authors[story.author_id] += 1
        
        return selected
    
    def _extract_pathway_metadata(self, group_key, stories):
        category = self._determine_category(stories)
        difficulty = self._determine_difficulty(stories)
        total_duration = sum(s.duration or 600 for s in stories)
        
        title = self._generate_title(group_key, stories, category)
        description = self._generate_description(stories, category)
        
        points_reward = self._calculate_points(len(stories), difficulty)
        
        duration_mins = total_duration // 60
        duration_str = f"{duration_mins} minutes"
        if duration_mins >= 60:
            hours = duration_mins // 60
            mins = duration_mins % 60
            duration_str = f"{hours}h {mins}m" if mins > 0 else f"{hours}h"
        
        return {
            'title': title,
            'description': description,
            'category': category,
            'difficulty': difficulty,
            'duration': duration_str,
            'points_reward': points_reward
        }
    
    def _determine_category(self, stories):
        categories = [s.category for s in stories if s.category]
        if not categories:
            return "General"
        
        category_counts = defaultdict(int)
        for cat in categories:
            category_counts[cat] += 1
        
        return max(category_counts.items(), key=lambda x: x[1])[0]
    
    def _determine_difficulty(self, stories):
        avg_duration = sum(s.duration or 600 for s in stories) / len(stories)
        
        doc_count = sum(1 for s in stories if s.content_type in ['document', 'pdf'])
        doc_ratio = doc_count / len(stories)
        
        complexity_score = 0
        
        if avg_duration > 900:
            complexity_score += 2
        elif avg_duration > 600:
            complexity_score += 1
        
        if doc_ratio > 0.4:
            complexity_score += 2
        elif doc_ratio > 0.2:
            complexity_score += 1
        
        for story in stories:
            if story.entities:
                if len(story.entities.get('organizations', [])) > 3:
                    complexity_score += 1
                    break
        
        if complexity_score >= 4:
            return "Advanced"
        elif complexity_score >= 2:
            return "Intermediate"
        else:
            return "Beginner"
    
    def _generate_title(self, group_key, stories, category):
        if group_key.startswith("category_"):
            cat = group_key.replace("category_", "")
            return f"Understanding {cat}"
        
        elif group_key.startswith("county_"):
            county = group_key.replace("county_", "")
            return f"{county} Development Stories"
        
        elif group_key.startswith("topic_"):
            topic = group_key.replace("topic_", "").title()
            return f"Exploring {topic} in Kenya"
        
        elif group_key.startswith("cat_topic_"):
            parts = group_key.replace("cat_topic_", "").split("_")
            cat = parts[0] if len(parts) > 0 else "Stories"
            topic = parts[1].title() if len(parts) > 1 else ""
            return f"{topic} {cat}" if topic else f"{cat} Collection"
        
        else:
            return f"Curated {category} Journey"
    
    def _generate_description(self, stories, category):
        counties = list(set(s.county for s in stories if s.county))
        topics = []
        for story in stories:
            if story.topics:
                topics.extend(story.topics[:2])
        unique_topics = list(set(topics))[:3]
        
        desc_parts = []
        
        desc_parts.append(f"A comprehensive learning pathway featuring {len(stories)} stories")
        
        if unique_topics:
            topics_str = ", ".join(unique_topics[:3])
            desc_parts.append(f"exploring {topics_str}")
        
        if counties and len(counties) <= 3:
            counties_str = ", ".join(counties)
            desc_parts.append(f"from {counties_str}")
        elif counties:
            desc_parts.append(f"from {len(counties)} counties across Kenya")
        
        desc_parts.append(f"in the {category} category.")
        
        return " ".join(desc_parts)
    
    def _calculate_points(self, num_stories, difficulty):
        base_points = 50
        story_points = num_stories * 8
        
        difficulty_bonus = {
            'Beginner': 0,
            'Intermediate': 15,
            'Advanced': 30
        }.get(difficulty, 0)
        
        return base_points + story_points + difficulty_bonus
    
    def generate_specific_pathway(self, story_ids, title, description=None, 
                                  category=None, difficulty=None):
        try:
            stories = Story.query.filter(Story.id.in_(story_ids)).all()
            
            if len(stories) < self.MIN_STORIES:
                logger.error(f"Need at least {self.MIN_STORIES} stories")
                return None
            
            if not category:
                category = self._determine_category(stories)
            
            if not difficulty:
                difficulty = self._determine_difficulty(stories)
            
            total_duration = sum(s.duration or 600 for s in stories)
            duration_mins = total_duration // 60
            duration_str = f"{duration_mins} minutes"
            
            points_reward = self._calculate_points(len(stories), difficulty)
            
            if not description:
                description = self._generate_description(stories, category)
            
            pathway = Pathway(
                title=title,
                description=description,
                category=category,
                difficulty=difficulty,
                duration=duration_str,
                points_reward=points_reward,
                is_active=True
            )
            
            db.session.add(pathway)
            db.session.flush()
            
            for idx, story_id in enumerate(story_ids):
                item = PathwayItem(
                    pathway_id=pathway.id,
                    story_id=story_id,
                    order=idx + 1
                )
                db.session.add(item)
            
            db.session.commit()
            
            logger.info(f"Created custom pathway: {title}")
            return pathway
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to create custom pathway: {e}")
            return None