import spacy
from collections import Counter
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

_POSITIVE_WORDS = {
    'good', 'great', 'excellent', 'success', 'achievement', 'innovation',
    'improvement', 'effective', 'positive', 'beneficial', 'outstanding',
    'exceptional', 'remarkable', 'impressive', 'significant', 'progress',
    'advance', 'milestone', 'breakthrough', 'accomplished'
}
_NEGATIVE_WORDS = {
    'bad', 'poor', 'failure', 'problem', 'challenge', 'difficulty',
    'issue', 'negative', 'harmful', 'crisis', 'decline', 'setback',
    'obstacle', 'deficit', 'inadequate', 'insufficient', 'disappointing'
}


class NLPService:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_md")
            logger.info("spaCy model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load spaCy model: {e}")
            logger.warning("Run: python -m spacy download en_core_web_md")
            self.nlp = None

    def process_text(self, text):
        if not self._valid(text) or not self.nlp:
            return self._empty()
        try:
            doc = self.nlp(text[:100000])
            return {
                'entities': self._entities(doc),
                'topics': self._topics(doc),
                'keywords': self._keywords(doc),
                'sentiment': self._sentiment(doc)
            }
        except Exception as e:
            logger.error(f"Text processing failed: {e}")
            return self._empty()

    def calculate_similarity(self, text1, text2):
        if not self.nlp or not self._valid(text1) or not self._valid(text2):
            return 0.0
        try:
            return float(self.nlp(text1[:50000]).similarity(self.nlp(text2[:50000])))
        except Exception as e:
            logger.error(f"Similarity calculation failed: {e}")
            return 0.0

    @lru_cache(maxsize=100)
    def extract_keywords(self, text, top_n=10):
        if not self._valid(text) or not self.nlp:
            return []
        try:
            return self._keywords(self.nlp(text[:50000]), top_n)
        except Exception as e:
            logger.error(f"Keyword extraction failed: {e}")
            return []

    def batch_process(self, texts):
        return [self.process_text(t) for t in texts]

    def _valid(self, text):
        return bool(text and isinstance(text, str) and len(text.strip()) >= 10)

    def _empty(self):
        return {
            'entities': {'people': [], 'organizations': [], 'locations': [], 'policies': []},
            'topics': [], 'keywords': [], 'sentiment': 'neutral'
        }

    def _entities(self, doc):
        label_map = {'PERSON': 'people', 'ORG': 'organizations', 'GPE': 'locations', 'LOC': 'locations', 'LAW': 'policies', 'EVENT': 'policies'}
        result = {k: set() for k in ('people', 'organizations', 'locations', 'policies')}
        for ent in doc.ents:
            key = label_map.get(ent.label_)
            if key:
                result[key].add(ent.text)
        return {k: list(v) for k, v in result.items()}

    def _topics(self, doc, top_n=10):
        chunks = [c.text.lower().strip() for c in doc.noun_chunks if len(c.text.strip()) > 3 and not c.root.is_stop]
        return [t for t, _ in Counter(chunks).most_common(top_n)] if chunks else []

    def _keywords(self, doc, top_n=10):
        words = [
            t.lemma_.lower() for t in doc
            if t.pos_ in ('NOUN', 'PROPN', 'ADJ', 'VERB')
            and not t.is_stop and not t.is_punct and t.is_alpha and len(t.text) > 3
        ]
        return [w for w, _ in Counter(words).most_common(top_n)] if words else []

    def _sentiment(self, doc):
        tokens = {t.lemma_.lower() for t in doc if t.is_alpha}
        pos = len(tokens & _POSITIVE_WORDS)
        neg = len(tokens & _NEGATIVE_WORDS)
        total = pos + neg
        if not total:
            return 'neutral'
        ratio = (pos - neg) / total
        return 'positive' if ratio > 0.2 else 'negative' if ratio < -0.2 else 'neutral'