from py2neo import Graph, Node, Relationship
import os

class GraphService:
    def __init__(self):
        neo4j_uri = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
        neo4j_user = os.getenv('NEO4J_USER', 'neo4j')
        neo4j_password = os.getenv('NEO4J_PASSWORD', 'password')
        
        try:
            self.graph = Graph(neo4j_uri, auth=(neo4j_user, neo4j_password))
        except Exception as e:
            print(f"Warning: Could not connect to Neo4j: {e}")
            self.graph = None
    
    def add_story_node(self, story):
        """
        Add a story as a node in the graph database
        """
        if not self.graph:
            return
        
        # Create story node
        story_node = Node(
            "Story",
            id=story.id,
            title=story.title,
            county=story.county,
            category=story.category,
            content_type=story.content_type
        )
        
        self.graph.merge(story_node, "Story", "id")
        
        # Create entity nodes and relationships
        if story.entities:
            # People
            for person in story.entities.get('people', []):
                person_node = Node("Person", name=person)
                self.graph.merge(person_node, "Person", "name")
                rel = Relationship(story_node, "MENTIONS", person_node)
                self.graph.merge(rel)
            
            # Organizations
            for org in story.entities.get('organizations', []):
                org_node = Node("Organization", name=org)
                self.graph.merge(org_node, "Organization", "name")
                rel = Relationship(story_node, "MENTIONS", org_node)
                self.graph.merge(rel)
            
            # Locations
            for location in story.entities.get('locations', []):
                location_node = Node("Location", name=location)
                self.graph.merge(location_node, "Location", "name")
                rel = Relationship(story_node, "LOCATED_IN", location_node)
                self.graph.merge(rel)
        
        # Create topic nodes
        if story.topics:
            for topic in story.topics[:5]:  # Limit to top 5 topics
                topic_node = Node("Topic", name=topic)
                self.graph.merge(topic_node, "Topic", "name")
                rel = Relationship(story_node, "ABOUT", topic_node)
                self.graph.merge(rel)
        
        # Create county node
        if story.county:
            county_node = Node("County", name=story.county)
            self.graph.merge(county_node, "County", "name")
            rel = Relationship(story_node, "IN_COUNTY", county_node)
            self.graph.merge(rel)
    
    def get_related_stories(self, story_id, limit=10):
        """
        Get stories related to a given story based on graph connections
        """
        if not self.graph:
            return []
        
        query = """
        MATCH (s:Story {id: $story_id})
        MATCH (s)-[r]-(common)-[r2]-(related:Story)
        WHERE related.id <> $story_id
        WITH related, count(DISTINCT common) as commonality
        ORDER BY commonality DESC
        LIMIT $limit
        RETURN related.id as id, related.title as title, commonality
        """
        
        results = self.graph.run(query, story_id=story_id, limit=limit)
        return [dict(record) for record in results]
    
    def get_graph_data(self, limit=100):
        """
        Get graph data for visualization (nodes and edges)
        """
        if not self.graph:
            return {'nodes': [], 'edges': []}
        
        # Get story nodes
        story_query = """
        MATCH (s:Story)
        RETURN s.id as id, s.title as title, s.county as county, 
               s.category as category, s.content_type as content_type
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
        
        # Get relationships
        edge_query = """
        MATCH (s1:Story)-[r]-(common)-[r2]-(s2:Story)
        WHERE s1.id < s2.id
        WITH s1, s2, type(r) as rel_type, count(common) as weight
        RETURN s1.id as source, s2.id as target, rel_type, weight
        LIMIT $limit
        """
        
        relationships = self.graph.run(edge_query, limit=limit)
        edges = []
        
        for rel in relationships:
            edges.append({
                'source': f"story_{rel['source']}",
                'target': f"story_{rel['target']}",
                'type': rel['rel_type'],
                'weight': rel['weight']
            })
        
        return {'nodes': nodes, 'edges': edges}
    
    def search_graph(self, query_text):
        """
        Search the graph for stories matching the query
        """
        if not self.graph:
            return []
        
        search_query = """
        MATCH (s:Story)
        WHERE toLower(s.title) CONTAINS toLower($query)
        RETURN s.id as id, s.title as title
        LIMIT 20
        """
        
        results = self.graph.run(search_query, query=query_text)
        return [dict(record) for record in results]

