from __future__ import annotations
from pathlib import Path
from typing import Iterable, Optional
import gc
import re
from llama_cpp import Llama

_cjkPattern = re.compile(r'[\u4e00-\u9fff]')


def _defaultTranslatorPath() -> Path:
    return (Path(__file__).resolve().parents[2] / 'models' / 'Qwen3.50.8B.gguf')


def _isCjk(text: str) -> bool:
    return bool(_cjkPattern.search(text))


def _loadTranslator(modelPath: Optional[Path] = None) -> Llama:
    resolvedPath = modelPath or _defaultTranslatorPath()
    return Llama(
        model_path=str(resolvedPath),
        n_ctx=2048,
        verbose=False,
    )


def _translateText(translator: Llama, text: str) -> str:
    prompt = (
        'Translate the following text to natural English. '
        'Return only the translation, no extra text.\n\n'
        f'Text: {text}\nTranslation:'
    )
    response = translator.create_completion(
        prompt=prompt,
        max_tokens=256,
        temperature=0.2,
        stop=['\n\n'],
    )
    return response['choices'][0]['text'].strip()


def translateTextsIfNeeded(
    texts: Iterable[str],
    *,
    modelPath: Optional[Path] = None,
) -> list[str]:
    items = list(texts)
    indicesToTranslate = [i for i, text in enumerate(items) if _isCjk(text)]

    if not indicesToTranslate:
        return items

    translator = _loadTranslator(modelPath)
    try:
        for index in indicesToTranslate:
            items[index] = _translateText(translator, items[index])
    finally:
        del translator
        gc.collect()

    return items
