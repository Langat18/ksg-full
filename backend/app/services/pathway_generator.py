from app import db
from app.models.story import Story
from app.models.pathway import Pathway, PathwayItem
from collections import defaultdict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class PathwayGenerator:

    MIN_STORIES        = 7
    OPTIMAL_STORIES    = 10
    MAX_STORIES        = 15
    SIMILARITY_THRESHOLD = 0.5

    # NLP service intentionally not used here — pathway generation
    # is a batch/offline job

    def generate_pathways(self, force_regenerate=False):
        try:
            logger.info("Starting pathway generation...")
            stories = Story.query.filter_by(status='published').all()

            if len(stories) < self.MIN_STORIES:
                logger.warning(f"Not enough stories ({len(stories)}/{self.MIN_STORIES})")
                return []

            groups   = self._group_stories(stories)
            created  = []

            for key, group in groups.items():
                if len(group) >= self.MIN_STORIES:
                    pathway = self._create_pathway_from_group(key, group, force_regenerate)
                    if pathway:
                        created.append(pathway)

            logger.info(f"Generated {len(created)} pathways")
            return created

        except Exception as e:
            logger.error(f"Pathway generation failed: {e}")
            return []

    def generate_specific_pathway(self, story_ids, title, description=None,
                                  category=None, difficulty=None):
        try:
            stories = Story.query.filter(Story.id.in_(story_ids)).all()
            if len(stories) < self.MIN_STORIES:
                logger.error(f"Need at least {self.MIN_STORIES} stories, got {len(stories)}")
                return None

            category   = category   or self._determine_category(stories)
            difficulty = difficulty or self._determine_difficulty(stories)
            description = description or self._generate_description(stories, category)

            total_secs = sum(s.duration or 600 for s in stories)
            duration_str = self._format_duration(total_secs // 60)
            points = self._calculate_points(len(stories), difficulty)

            pathway = Pathway(
                title=title, description=description, category=category,
                difficulty=difficulty, duration=duration_str,
                points_reward=points, is_active=True
            )
            db.session.add(pathway)
            db.session.flush()

            for idx, sid in enumerate(story_ids):
                db.session.add(PathwayItem(pathway_id=pathway.id, story_id=sid, order=idx + 1))

            db.session.commit()
            logger.info(f"Created custom pathway: {title}")
            return pathway

        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to create custom pathway: {e}")
            return None

    # ------------------------------------------------------------------ #
    # Private helpers                                                       #
    # ------------------------------------------------------------------ #

    def _group_stories(self, stories):
        groups = defaultdict(list)
        for story in stories:
            if not self._is_quality(story):
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
            if story.category and story.topics:
                key = f"cat_topic_{story.category}_{story.topics[0]}"
                groups[key].append(story)
        return groups

    def _is_quality(self, story):
        return bool(
            story.media_url
            and story.description
            and len(story.description) >= 10
        )

    def _create_pathway_from_group(self, key, stories, force_regenerate):
        try:
            stories = list(set(stories))
            if len(stories) < self.MIN_STORIES:
                return None

            selected = self._score_and_rank(stories)
            if len(selected) < self.MIN_STORIES:
                return None

            meta = self._extract_metadata(key, selected)

            existing = Pathway.query.filter_by(
                title=meta['title'], category=meta['category']
            ).first()
            if existing and not force_regenerate:
                return None

            pathway = Pathway(is_active=True, **meta)
            db.session.add(pathway)
            db.session.flush()

            for idx, story in enumerate(selected):
                db.session.add(PathwayItem(pathway_id=pathway.id, story_id=story.id, order=idx + 1))

            db.session.commit()
            logger.info(f"Created pathway: {pathway.title} ({len(selected)} stories)")
            return pathway

        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to create pathway from {key}: {e}")
            return None

    def _score_and_rank(self, stories):
        now = datetime.utcnow()
        scored = []
        for s in stories:
            score = (
                min(s.views or 0, 100) * 0.2
                + (s.likes  or 0) * 2
                + (s.shares or 0) * 3
                + (15 if s.featured else 0)
                + (5  if s.description and len(s.description) > 200 else 0)
            )
            if s.created_at:
                age = (now - s.created_at).days
                score += 20 if age < 30 else 10 if age < 90 else 0
            if s.entities:
                score += len(s.entities.get('people', [])) * 2
                score += len(s.entities.get('organizations', [])) * 3
            scored.append((s, score))

        scored.sort(key=lambda x: x[1], reverse=True)

        selected, type_count, author_count = [], defaultdict(int), defaultdict(int)
        for story, _ in scored:
            if len(selected) >= self.MAX_STORIES:
                break
            if type_count[story.content_type] >= 4:
                continue
            if author_count[story.author_id] >= 3:
                continue
            selected.append(story)
            type_count[story.content_type] += 1
            author_count[story.author_id] += 1

        return selected

    def _extract_metadata(self, key, stories):
        category   = self._determine_category(stories)
        difficulty = self._determine_difficulty(stories)
        total_mins = sum(s.duration or 600 for s in stories) // 60
        return {
            'title':        self._generate_title(key, stories, category),
            'description':  self._generate_description(stories, category),
            'category':     category,
            'difficulty':   difficulty,
            'duration':     self._format_duration(total_mins),
            'points_reward': self._calculate_points(len(stories), difficulty),
        }

    def _determine_category(self, stories):
        counts = defaultdict(int)
        for s in stories:
            if s.category:
                counts[s.category] += 1
        return max(counts, key=counts.get) if counts else 'General'

    def _determine_difficulty(self, stories):
        avg_dur   = sum(s.duration or 600 for s in stories) / len(stories)
        doc_ratio = sum(1 for s in stories if s.content_type in ('document', 'pdf')) / len(stories)
        score = (
            (2 if avg_dur > 900 else 1 if avg_dur > 600 else 0)
            + (2 if doc_ratio > 0.4 else 1 if doc_ratio > 0.2 else 0)
            + (1 if any(len((s.entities or {}).get('organizations', [])) > 3 for s in stories) else 0)
        )
        return 'Advanced' if score >= 4 else 'Intermediate' if score >= 2 else 'Beginner'

    def _generate_title(self, key, stories, category):
        if key.startswith('category_'):
            return f"Understanding {key[9:]}"
        if key.startswith('county_'):
            return f"{key[7:]} Development Stories"
        if key.startswith('topic_'):
            return f"Exploring {key[6:].title()} in Kenya"
        if key.startswith('cat_topic_'):
            parts = key[10:].split('_', 1)
            return f"{parts[1].title()} {parts[0]}" if len(parts) > 1 else f"{parts[0]} Collection"
        return f"Curated {category} Journey"

    def _generate_description(self, stories, category):
        counties = list({s.county for s in stories if s.county})
        topics   = list({t for s in stories if s.topics for t in s.topics[:2]})[:3]

        parts = [f"A comprehensive learning pathway featuring {len(stories)} stories"]
        if topics:
            parts.append(f"exploring {', '.join(topics)}")
        if counties:
            parts.append(
                f"from {', '.join(counties)}" if len(counties) <= 3
                else f"from {len(counties)} counties across Kenya"
            )
        parts.append(f"in the {category} category.")
        return " ".join(parts)

    def _calculate_points(self, n, difficulty):
        bonus = {'Beginner': 0, 'Intermediate': 15, 'Advanced': 30}.get(difficulty, 0)
        return 50 + n * 8 + bonus

    @staticmethod
    def _format_duration(mins):
        if mins >= 60:
            h, m = divmod(mins, 60)
            return f"{h}h {m}m" if m else f"{h}h"
        return f"{mins}m"