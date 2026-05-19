from __future__ import annotations
from pathlib import Path
from typing import Optional
from llama_cpp import Llama


def _defaultLlmPath() -> Path:
    return Path(__file__).resolve().parents[2] / 'models' / 'Llama3.23B.gguf'


def createLlm(
    modelPath: Optional[Path] = None,
    *,
    nCtx: int = 4096,
    verbose: bool = False,
) -> Llama:
    resolvedPath = modelPath or _defaultLlmPath()
    return Llama(
        model_path=str(resolvedPath),
        n_ctx=nCtx,
        verbose=verbose,
    )
