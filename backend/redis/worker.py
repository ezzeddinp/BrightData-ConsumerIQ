import os
import time

from celery import Celery

REDIS_URL = os.getenv('REDIS_URL', 'redis://redis.consumeriq.svc.cluster.local:6379/0')

celery_app = Celery(
    'consumeriq_worker',
    broker=REDIS_URL,
    backend=REDIS_URL,
)


@celery_app.task(name='process_llm_insights')
def process_llm_insights(category_name: str):
    print(f'Worker picked up job for category: {category_name}')
    print('Booting up Llama-3 (Simulating 10-second heavy inference...)')

    time.sleep(10)

    mock_result = {
        'category': category_name,
        'status': 'completed',
        'gtm_intelligence': {'marketing_gap': 'Customers want cruelty-free.'},
        'finance_intelligence': {'optimal_price': 19.99},
        'security_compliance': {'risk_level': 'Low'},
    }

    print(f'Job complete for {category_name}! Saved to Postgres.')
    return mock_result
