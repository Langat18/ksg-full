import spacy
from collections import Counter
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

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
        if not self._validate_text(text):
            return self._empty_result()
        
        if not self.nlp:
            logger.warning("NLP model not available")
            return self._empty_result()
        
        try:
            doc = self.nlp(text[:100000])
            
            return {
                'entities': self._extract_entities(doc),
                'topics': self._extract_topics(doc),
                'keywords': self._extract_keywords_from_doc(doc),
                'sentiment': self._analyze_sentiment(doc)
            }
        except Exception as e:
            logger.error(f"Text processing failed: {e}")
            return self._empty_result()
    
    def _validate_text(self, text):
        if not text or not isinstance(text, str):
            return False
        if len(text.strip()) < 10:
            return False
        return True
    
    def _empty_result(self):
        return {
            'entities': {'people': [], 'organizations': [], 'locations': [], 'policies': []},
            'topics': [],
            'keywords': [],
            'sentiment': 'neutral'
        }
    
    def _extract_entities(self, doc):
        entities = {
            'people': set(),
            'organizations': set(),
            'locations': set(),
            'policies': set()
        }
        
        for ent in doc.ents:
            if ent.label_ == 'PERSON':
                entities['people'].add(ent.text)
            elif ent.label_ == 'ORG':
                entities['organizations'].add(ent.text)
            elif ent.label_ in ['GPE', 'LOC']:
                entities['locations'].add(ent.text)
            elif ent.label_ in ['LAW', 'EVENT']:
                entities['policies'].add(ent.text)
        
        return {key: list(values) for key, values in entities.items()}
    
    def _extract_topics(self, doc, top_n=10):
        noun_chunks = [
            chunk.text.lower().strip() 
            for chunk in doc.noun_chunks 
            if len(chunk.text.strip()) > 3 and not chunk.root.is_stop
        ]
        
        if not noun_chunks:
            return []
        
        topic_counts = Counter(noun_chunks)
        return [topic for topic, _ in topic_counts.most_common(top_n)]
    
    def _extract_keywords_from_doc(self, doc, top_n=10):
        keywords = [
            token.lemma_.lower() 
            for token in doc 
            if token.pos_ in ['NOUN', 'PROPN', 'ADJ', 'VERB']
            and not token.is_stop 
            and not token.is_punct
            and len(token.text) > 3
            and token.is_alpha
        ]
        
        if not keywords:
            return []
        
        keyword_counts = Counter(keywords)
        return [word for word, _ in keyword_counts.most_common(top_n)]
    
    def _analyze_sentiment(self, doc):
        positive_words = {
            'good', 'great', 'excellent', 'success', 'achievement', 'innovation',
            'improvement', 'effective', 'positive', 'beneficial', 'outstanding',
            'exceptional', 'remarkable', 'impressive', 'significant', 'progress',
            'advance', 'milestone', 'breakthrough', 'accomplished'
        }
        
        negative_words = {
            'bad', 'poor', 'failure', 'problem', 'challenge', 'difficulty',
            'issue', 'negative', 'harmful', 'crisis', 'decline', 'setback',
            'obstacle', 'deficit', 'inadequate', 'insufficient', 'disappointing'
        }
        
        tokens = [token.lemma_.lower() for token in doc if token.is_alpha]
        
        positive_count = sum(1 for word in tokens if word in positive_words)
        negative_count = sum(1 for word in tokens if word in negative_words)
        
        total = positive_count + negative_count
        if total == 0:
            return 'neutral'
        
        sentiment_ratio = (positive_count - negative_count) / total
        
        if sentiment_ratio > 0.2:
            return 'positive'
        elif sentiment_ratio < -0.2:
            return 'negative'
        else:
            return 'neutral'
    
    def calculate_similarity(self, text1, text2):
        if not self.nlp or not self._validate_text(text1) or not self._validate_text(text2):
            return 0.0
        
        try:
            doc1 = self.nlp(text1[:50000])
            doc2 = self.nlp(text2[:50000])
            return float(doc1.similarity(doc2))
        except Exception as e:
            logger.error(f"Similarity calculation failed: {e}")
            return 0.0
    
    @lru_cache(maxsize=100)
    def extract_keywords(self, text, top_n=10):
        if not self._validate_text(text) or not self.nlp:
            return []
        
        try:
            doc = self.nlp(text[:50000])
            return self._extract_keywords_from_doc(doc, top_n)
        except Exception as e:
            logger.error(f"Keyword extraction failed: {e}")
            return []
    
    def batch_process(self, texts):
        if not self.nlp:
            return [self._empty_result() for _ in texts]
        
        results = []
        for text in texts:
            results.append(self.process_text(text))
        
        return results