from flask import Blueprint, request, jsonify
from app.services.graph_service import GraphService
from app.services.nlp_service import NLPService

bp = Blueprint('graph', __name__)
graph_service = GraphService()
nlp_service = NLPService()

@bp.route('/data', methods=['GET'])
def get_graph_data():
    """Get graph data for visualization"""
    limit = request.args.get('limit', 100, type=int)
    graph_data = graph_service.get_graph_data(limit)
    return jsonify(graph_data)

@bp.route('/related/<int:story_id>', methods=['GET'])
def get_related_stories(story_id):
    """Get stories related to a given story"""
    limit = request.args.get('limit', 10, type=int)
    related = graph_service.get_related_stories(story_id, limit)
    return jsonify(related)

@bp.route('/search', methods=['GET'])
def search_graph():
    """Search the graph"""
    query = request.args.get('q', '')
    if not query:
        return jsonify({'error': 'Query parameter required'}), 400
    
    results = graph_service.search_graph(query)
    return jsonify(results)

@bp.route('/explore', methods=['POST'])
def explore_connections():
    """
    Explore connections based on user query
    This powers the Story Genie feature
    """
    data = request.get_json()
    query = data.get('query', '')
    
    if not query:
        return jsonify({'error': 'Query required'}), 400
    
    # Extract entities and keywords from query
    nlp_results = nlp_service.process_text(query)
    
    # Use graph service to find relevant stories
    # This is a simplified version - can be enhanced
    results = graph_service.search_graph(query)
    
    return jsonify({
        'query': query,
        'extracted_entities': nlp_results['entities'],
        'topics': nlp_results['topics'],
        'stories': results
    })