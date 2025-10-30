import spacy
from collections import Counter

class NLPService:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_md")
        except:
            print("Warning: spaCy model not found. Run: python -m spacy download en_core_web_md")
            self.nlp = None
    
    def process_text(self, text):
        """
        Process text to extract entities, topics, and sentiment
        """
        if not self.nlp or not text:
            return {
                'entities': {'people': [], 'organizations': [], 'locations': [], 'policies': []},
                'topics': [],
                'sentiment': 'neutral'
            }
        
        doc = self.nlp(text)
        
        # Extract entities
        entities = {
            'people': [],
            'organizations': [],
            'locations': [],
            'policies': []
        }
        
        for ent in doc.ents:
            if ent.label_ == 'PERSON':
                entities['people'].append(ent.text)
            elif ent.label_ == 'ORG':
                entities['organizations'].append(ent.text)
            elif ent.label_ in ['GPE', 'LOC']:
                entities['locations'].append(ent.text)
        
        # Remove duplicates
        for key in entities:
            entities[key] = list(set(entities[key]))
        
        # Extract key topics (using noun chunks)
        topics = []
        noun_chunks = [chunk.text.lower() for chunk in doc.noun_chunks if len(chunk.text) > 3]
        topic_counts = Counter(noun_chunks)
        topics = [topic for topic, count in topic_counts.most_common(10)]
        
        # Simple sentiment analysis (can be enhanced with more sophisticated models)
        sentiment = self._analyze_sentiment(doc)
        
        return {
            'entities': entities,
            'topics': topics,
            'sentiment': sentiment
        }
    
    def _analyze_sentiment(self, doc):
        """
        Simple sentiment analysis based on word polarity
        This is a basic implementation - consider using specialized sentiment models
        """
        positive_words = {'good', 'great', 'excellent', 'success', 'achievement', 'innovation', 
                         'improvement', 'effective', 'positive', 'beneficial'}
        negative_words = {'bad', 'poor', 'failure', 'problem', 'challenge', 'difficulty', 
                         'issue', 'negative', 'harmful'}
        
        tokens = [token.text.lower() for token in doc if token.is_alpha]
        
        positive_count = sum(1 for word in tokens if word in positive_words)
        negative_count = sum(1 for word in tokens if word in negative_words)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'
    
    def calculate_similarity(self, text1, text2):
        """
        Calculate semantic similarity between two texts
        """
        if not self.nlp:
            return 0.0
        
        doc1 = self.nlp(text1)
        doc2 = self.nlp(text2)
        
        return doc1.similarity(doc2)
    
    def extract_keywords(self, text, top_n=10):
        """
        Extract keywords from text
        """
        if not self.nlp:
            return []
        
        doc = self.nlp(text)
        
        # Extract keywords based on POS tags and frequency
        keywords = [token.text.lower() for token in doc 
                   if token.pos_ in ['NOUN', 'PROPN', 'ADJ'] 
                   and not token.is_stop 
                   and len(token.text) > 3]
        
        keyword_counts = Counter(keywords)
        return [word for word, count in keyword_counts.most_common(top_n)]