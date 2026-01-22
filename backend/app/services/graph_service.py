from py2neo import Graph, Node, Relationship
from contextlib import contextmanager
import os
import logging

logger = logging.getLogger(__name__)

class GraphService:
    def __init__(self):
        self.neo4j_uri = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
        self.neo4j_user = os.getenv('NEO4J_USER', 'neo4j')
        self.neo4j_password = os.getenv('NEO4J_PASSWORD', 'password')
        self.graph = None
        self._connect()
        
    def _connect(self):
        try:
            self.graph = Graph(self.neo4j_uri, auth=(self.neo4j_user, self.neo4j_password))
            self._setup_constraints_and_indexes()
            logger.info("Connected to Neo4j successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            self.graph = None
    
    def _setup_constraints_and_indexes(self):
        if not self.graph:
            return
        
        try:
            constraints = [
                "CREATE CONSTRAINT IF NOT EXISTS FOR (s:Story) REQUIRE s.id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (p:Person) REQUIRE p.name IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (o:Organization) REQUIRE o.name IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (l:Location) REQUIRE l.name IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (t:Topic) REQUIRE t.name IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (c:County) REQUIRE c.name IS UNIQUE"
            ]
            
            indexes = [
                "CREATE INDEX IF NOT EXISTS FOR (s:Story) ON (s.title)",
                "CREATE INDEX IF NOT EXISTS FOR (s:Story) ON (s.category)",
                "CREATE INDEX IF NOT EXISTS FOR (s:Story) ON (s.county)"
            ]
            
            for constraint in constraints:
                self.graph.run(constraint)
            
            for index in indexes:
                self.graph.run(index)
                
            logger.info("Database constraints and indexes created")
        except Exception as e:
            logger.error(f"Failed to create constraints/indexes: {e}")
    
    def ensure_connection(self):
        if not self.graph:
            self._connect()
        return self.graph is not None
    
    @contextmanager
    def transaction(self):
        if not self.ensure_connection():
            raise ConnectionError("Neo4j connection not available")
        
        tx = self.graph.begin()
        try:
            yield tx
            tx.commit()
        except Exception as e:
            tx.rollback()
            logger.error(f"Transaction failed: {e}")
            raise
    
    def add_story_node(self, story):
        if not self.ensure_connection():
            logger.warning("Cannot add story node: No Neo4j connection")
            return False
        
        try:
            with self.transaction() as tx:
                story_node = Node(
                    "Story",
                    id=story.id,
                    title=story.title,
                    county=story.county or "Unknown",
                    category=story.category or "General",
                    content_type=story.content_type or "text"
                )
                
                tx.merge(story_node, "Story", "id")
                
                if story.entities:
                    self._add_entity_relationships(tx, story_node, story.entities)
                
                if hasattr(story, 'topics') and story.topics:
                    self._add_topic_relationships(tx, story_node, story.topics)
                
                if story.county:
                    self._add_county_relationship(tx, story_node, story.county)
                
                if story.category:
                    self._add_category_relationship(tx, story_node, story.category)
            
            logger.info(f"Successfully added story node: {story.id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add story node {story.id}: {e}")
            return False
    
    def _add_entity_relationships(self, tx, story_node, entities):
        for person in entities.get('people', [])[:10]:
            person_node = Node("Person", name=person)
            tx.merge(person_node, "Person", "name")
            rel = Relationship(story_node, "MENTIONS", person_node)
            tx.merge(rel)
        
        for org in entities.get('organizations', [])[:10]:
            org_node = Node("Organization", name=org)
            tx.merge(org_node, "Organization", "name")
            rel = Relationship(story_node, "MENTIONS", org_node)
            tx.merge(rel)
        
        for location in entities.get('locations', [])[:10]:
            location_node = Node("Location", name=location)
            tx.merge(location_node, "Location", "name")
            rel = Relationship(story_node, "LOCATED_IN", location_node)
            tx.merge(rel)
    
    def _add_topic_relationships(self, tx, story_node, topics):
        for topic in topics[:5]:
            topic_node = Node("Topic", name=topic)
            tx.merge(topic_node, "Topic", "name")
            rel = Relationship(story_node, "ABOUT", topic_node)
            tx.merge(rel)
    
    def _add_county_relationship(self, tx, story_node, county):
        county_node = Node("County", name=county)
        tx.merge(county_node, "County", "name")
        rel = Relationship(story_node, "IN_COUNTY", county_node)
        tx.merge(rel)
    
    def _add_category_relationship(self, tx, story_node, category):
        category_node = Node("Category", name=category)
        tx.merge(category_node, "Category", "name")
        rel = Relationship(story_node, "IN_CATEGORY", category_node)
        tx.merge(rel)
    
    def add_stories_bulk(self, stories):
        if not self.ensure_connection():
            logger.warning("Cannot bulk add stories: No Neo4j connection")
            return 0
        
        success_count = 0
        for story in stories:
            if self.add_story_node(story):
                success_count += 1
        
        logger.info(f"Bulk added {success_count}/{len(stories)} stories")
        return success_count
    
    def get_related_stories(self, story_id, limit=10):
        if not self.ensure_connection():
            return []
        
        try:
            query = """
            MATCH (s:Story {id: $story_id})
            MATCH (s)-[r]-(common)-[r2]-(related:Story)
            WHERE related.id <> $story_id
            WITH related, type(r) as connection_type, count(DISTINCT common) as commonality
            ORDER BY commonality DESC
            LIMIT $limit
            RETURN related.id as id, 
                   related.title as title, 
                   related.category as category,
                   related.county as county,
                   commonality,
                   collect(DISTINCT connection_type) as connections
            """
            
            results = self.graph.run(query, story_id=story_id, limit=limit)
            return [dict(record) for record in results]
            
        except Exception as e:
            logger.error(f"Failed to get related stories for {story_id}: {e}")
            return []
    
    def get_stories_by_entity(self, entity_name, entity_type='Person', limit=20):
        if not self.ensure_connection():
            return []
        
        try:
            query = f"""
            MATCH (e:{entity_type} {{name: $entity_name}})-[r]-(s:Story)
            RETURN s.id as id, s.title as title, s.category as category
            ORDER BY s.id DESC
            LIMIT $limit
            """
            
            results = self.graph.run(query, entity_name=entity_name, limit=limit)
            return [dict(record) for record in results]
            
        except Exception as e:
            logger.error(f"Failed to get stories by entity {entity_name}: {e}")
            return []
    
    def get_graph_data(self, limit=100):
        if not self.ensure_connection():
            return {'nodes': [], 'edges': []}
        
        try:
            story_query = """
            MATCH (s:Story)
            RETURN s.id as id, s.title as title, s.county as county, 
                   s.category as category, s.content_type as content_type
            ORDER BY s.id DESC
            LIMIT $limit
            """
            
            stories = self.graph.run(story_query, limit=limit)
            nodes = []
            
            for story in stories:
                nodes.append({
                    'id': f"story_{story['id']}",
                    'label': story['title'],
                    'type': 'story',
                    'county': story['county'],
                    'category': story['category'],
                    'content_type': story['content_type']
                })
            
            edge_query = """
            MATCH (s1:Story)-[r]->(entity)<-[r2]-(s2:Story)
            WHERE id(s1) < id(s2)
            WITH s1, s2, labels(entity)[0] as entity_type, count(*) as weight
            RETURN s1.id as source, s2.id as target, entity_type, weight
            ORDER BY weight DESC
            LIMIT $limit
            """
            
            relationships = self.graph.run(edge_query, limit=limit)
            edges = []
            
            for rel in relationships:
                edges.append({
                    'source': f"story_{rel['source']}",
                    'target': f"story_{rel['target']}",
                    'type': rel['entity_type'],
                    'weight': rel['weight']
                })
            
            return {'nodes': nodes, 'edges': edges}
            
        except Exception as e:
            logger.error(f"Failed to get graph data: {e}")
            return {'nodes': [], 'edges': []}
    
    def search_graph(self, query_text, limit=20):
        if not self.ensure_connection():
            return []
        
        try:
            search_query = """
            MATCH (s:Story)
            WHERE toLower(s.title) CONTAINS toLower($query)
               OR toLower(s.category) CONTAINS toLower($query)
               OR toLower(s.county) CONTAINS toLower($query)
            RETURN DISTINCT s.id as id, s.title as title, 
                   s.category as category, s.county as county
            ORDER BY s.title
            LIMIT $limit
            """
            
            results = self.graph.run(search_query, query=query_text, limit=limit)
            return [dict(record) for record in results]
            
        except Exception as e:
            logger.error(f"Graph search failed for '{query_text}': {e}")
            return []
    
    def get_county_stats(self):
        if not self.ensure_connection():
            return []
        
        try:
            query = """
            MATCH (c:County)<-[:IN_COUNTY]-(s:Story)
            WITH c.name as county, count(s) as story_count
            ORDER BY story_count DESC
            RETURN county, story_count
            """
            
            results = self.graph.run(query)
            return [dict(record) for record in results]
            
        except Exception as e:
            logger.error(f"Failed to get county stats: {e}")
            return []
    
    def get_category_stats(self):
        if not self.ensure_connection():
            return []
        
        try:
            query = """
            MATCH (cat:Category)<-[:IN_CATEGORY]-(s:Story)
            WITH cat.name as category, count(s) as story_count
            ORDER BY story_count DESC
            RETURN category, story_count
            """
            
            results = self.graph.run(query)
            return [dict(record) for record in results]
            
        except Exception as e:
            logger.error(f"Failed to get category stats: {e}")
            return []
    
    def delete_story_node(self, story_id):
        if not self.ensure_connection():
            return False
        
        try:
            query = """
            MATCH (s:Story {id: $story_id})
            DETACH DELETE s
            """
            
            self.graph.run(query, story_id=story_id)
            logger.info(f"Deleted story node: {story_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete story {story_id}: {e}")
            return False
    
    def close(self):
        if self.graph:
            self.graph = None
            logger.info("Neo4j connection closed")