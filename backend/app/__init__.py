from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=None):
    app = Flask(__name__)
    
    if config_class is None:
        from config import DevelopmentConfig
        config_class = DevelopmentConfig
    
    app.config.from_object(config_class)
    app.url_map.strict_slashes = False
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "https://ksg-frontend.onrender.com"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    @app.route('/')
    def home():
        return jsonify({
            'message': 'KSG Storytelling API',
            'status': 'healthy',
            'version': '1.0.0',
            'endpoints': {
                'stories': '/api/stories',
                'users': '/api/users',
                'auth': '/api/auth',
                'analytics': '/api/analytics',
                'pathways': '/api/pathways',
                'health': '/api/health'
            }
        }), 200
    
    from app.routes import stories, users, auth, analytics, pathways
    
    app.register_blueprint(stories.bp, url_prefix='/api/stories')
    app.register_blueprint(users.bp, url_prefix='/api/users')
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(analytics.bp, url_prefix='/api/analytics')
    app.register_blueprint(pathways.bp, url_prefix='/api/pathways')
    
    return app