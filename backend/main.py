from fastapi import FastAPI
from celery.result import AsyncResult
from backend.redis.worker import celery_app, process_llm_insights

app = FastAPI(title='ConsumerIQ API')


@app.post('/api/scan-market/{category_name}')
async def scan_market(category_name: str):
    print(f'Received request to scan market for: {category_name}')

    task = process_llm_insights.delay(category_name)

    return {
        'message': f'Successfully queued LLM analysis for {category_name}',
        'task_id': task.id,
        'status': 'processing',
    }


@app.get('/api/task-status/{task_id}')
async def get_task_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)

    if task_result.ready():
        return {'task_id': task_id, 'status': 'completed', 'result': task_result.result}

    return {'task_id': task_id, 'status': 'processing'}
