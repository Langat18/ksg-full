from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=None):
    app = Flask(__name__)
    
    # Load config
    if config_class is None:
        from config import DevelopmentConfig
        config_class = DevelopmentConfig
    
    app.config.from_object(config_class)
    
    # IMPORTANT: Make Flask handle trailing slashes flexibly
    app.url_map.strict_slashes = False
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure CORS properly
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Register blueprints
    from app.routes import stories, users, auth, analytics, pathways
    
    app.register_blueprint(stories.bp, url_prefix='/api/stories')
    app.register_blueprint(users.bp, url_prefix='/api/users')
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(analytics.bp, url_prefix='/api/analytics')
    app.register_blueprint(pathways.bp, url_prefix='/api/pathways')
    
    return app