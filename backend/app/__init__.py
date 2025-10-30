from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import config
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    jwt.init_app(app)
    
    # Create upload folder
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from app.routes import stories, users, pathways, graph, analytics
    
    app.register_blueprint(stories.bp, url_prefix='/api/stories')
    app.register_blueprint(users.bp, url_prefix='/api/users')
    app.register_blueprint(pathways.bp, url_prefix='/api/pathways')
    app.register_blueprint(graph.bp, url_prefix='/api/graph')
    app.register_blueprint(analytics.bp, url_prefix='/api/analytics')
    
    # Health check route
    @app.route('/')
    def home():
        return {'message': 'KSG Storytelling API is running!'}
    
    return app