import os
from app import create_app
from flask import send_from_directory

# Get config based on environment
env = os.getenv('FLASK_ENV', 'development')

if env == 'production':
    from config import ProductionConfig
    app = create_app(ProductionConfig)
elif env == 'testing':
    from config import TestingConfig
    app = create_app(TestingConfig)
else:
    from config import DevelopmentConfig
    app = create_app(DevelopmentConfig)

# CRITICAL: Serve uploaded media files
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    """Serve uploaded media files"""
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
    return send_from_directory(upload_folder, filename)

if __name__ == '__main__':
    # Create uploads directory if it doesn't exist
    os.makedirs('uploads', exist_ok=True)
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=(env != 'production')
    )