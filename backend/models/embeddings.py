from __future__ import annotations
from pathlib import Path
import time
from typing import Iterable, Optional
from llama_cpp import Llama


def _defaultEmbedderPath() -> Path:
    return Path(__file__).resolve().parents[2] / 'models' / 'multilingualMiniLML12v2.gguf'


def createEmbedder(modelPath: Optional[Path] = None, *, verbose: bool = False) -> Llama:
    resolvedPath = modelPath or _defaultEmbedderPath()
    return Llama(
        model_path=str(resolvedPath),
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
    print('Loading multilingualMiniLML12v2 GGUF...')
    startTime = time.time()

    embedder = createEmbedder(verbose=False)

    print(f'Model loaded in {time.time() - startTime:.2f} seconds!')

    mockTikTokComment = (
        'WARNING: I used this hydrating serum and it gave me massive chemical burns. '
        'I think there are fake sellers on Shopee selling counterfeit batches. Do not buy!'
    )

    print('\nEmbedding mock TikTok comment...')
    startTime = time.time()

    response = embedder.create_embedding(mockTikTokComment)
    vector = response['data'][0]['embedding']

    print(f'Embedding completed in {time.time() - startTime:.4f} seconds!')
    print(f'\nVector Dimension Count: {len(vector)}')
    print(f'First 5 dimensions preview: {vector[:5]}')

    if len(vector) == 384:
        print('\nVector dimension is 384!')
    else:
        print(f'\nERROR: Dimension mismatch. Expected 384, got {len(vector)}.')
