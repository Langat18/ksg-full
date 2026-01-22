from apscheduler.schedulers.background import BackgroundScheduler
from app.services.pathway_generator import PathwayGenerator
from app import db
import logging

logger = logging.getLogger(__name__)

def generate_pathways_job():
    from app import create_app
    app = create_app()
    
    with app.app_context():
        try:
            logger.info("Running scheduled pathway generation...")
            
            generator = PathwayGenerator()
            pathways = generator.generate_pathways(force_regenerate=False)
            
            if pathways:
                logger.info(f"Scheduled job: Generated {len(pathways)} new pathways")
            else:
                logger.info("Scheduled job: No new pathways generated")
                
        except Exception as e:
            logger.error(f"Scheduled pathway generation failed: {e}")

def init_scheduler(app):
    scheduler = BackgroundScheduler()
    
    scheduler.add_job(
        func=generate_pathways_job,
        trigger='cron',
        hour=2,
        minute=0,
        id='generate_pathways_daily',
        name='Generate Learning Pathways Daily',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Pathway generation scheduler started - runs daily at 2 AM")
    
    return scheduler