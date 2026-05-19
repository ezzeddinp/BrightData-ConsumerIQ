'''Model loaders for local inference.'''

from .embeddings import createEmbedder, embedTexts
from .llm import createLlm

__all__ = ['createEmbedder', 'embedTexts', 'createLlm']
