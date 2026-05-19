from __future__ import annotations
from pathlib import Path
from typing import Optional
from llama_cpp import Llama


def _defaultLlmPath() -> Path:
    return Path(__file__).resolve().parents[2] / 'models' / 'Llama-3.2-3B-Instruct-Q4_K_L.gguf'


def createLlm(
    model_path: Optional[Path] = None,
    *,
    n_ctx: int = 4096,
    verbose: bool = False,
) -> Llama:
    resolved_path = model_path or _defaultLlmPath()
    return Llama(
        model_path=str(resolved_path),
        n_ctx=n_ctx,
        verbose=verbose,
    )
