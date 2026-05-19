from __future__ import annotations
from pathlib import Path
import time
from typing import Iterable, Optional
from llama_cpp import Llama


def _defaultEmbedderPath() -> Path:
    return Path(__file__).resolve().parents[2] / 'models' / 'all-MiniLM-L6-v2.Q4_K_M.gguf'


def createEmbedder(model_path: Optional[Path] = None, *, verbose: bool = False) -> Llama:
    resolved_path = model_path or _defaultEmbedderPath()
    return Llama(
        model_path=str(resolved_path),
        embedding=True,
        verbose=verbose,
    )


def embedTexts(embedder: Llama, texts: Iterable[str]) -> list[list[float]]:
    vectors: list[list[float]] = []
    for text in texts:
        response = embedder.create_embedding(text)
        vectors.append(response['data'][0]['embedding'])
    return vectors


if __name__ == '__main__':
    print('Loading all-MiniLM-L6-v2 GGUF...')
    start_time = time.time()

    embedder = createEmbedder(verbose=False)

    print(f'Model loaded in {time.time() - start_time:.2f} seconds!')

    mock_tiktok_comment = (
        'WARNING: I used this hydrating serum and it gave me massive chemical burns. '
        'I think there are fake sellers on Shopee selling counterfeit batches. Do not buy!'
    )

    print('\nEmbedding mock TikTok comment...')
    start_time = time.time()

    response = embedder.create_embedding(mock_tiktok_comment)
    vector = response['data'][0]['embedding']

    print(f'Embedding completed in {time.time() - start_time:.4f} seconds!')
    print(f'\nVector Dimension Count: {len(vector)}')
    print(f'First 5 dimensions preview: {vector[:5]}')

    if len(vector) == 384:
        print('\nVector dimension is 384!')
    else:
        print(f'\nERROR: Dimension mismatch. Expected 384, got {len(vector)}.')
