import os
from app import create_app
from flask import send_from_directory

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

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    upload_folder = app.config.get('UPLOAD_FOLDER') 
    return send_from_directory(upload_folder, filename)

@app.route('/api/health')
def health_check():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    upload_folder = app.config.get('UPLOAD_FOLDER')
    os.makedirs(upload_folder, exist_ok=True)
    
    port = int(os.getenv('PORT', 5000))
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=(env != 'production')
    )