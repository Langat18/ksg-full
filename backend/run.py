import os
from app import create_app

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

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=(env != 'production')
    )