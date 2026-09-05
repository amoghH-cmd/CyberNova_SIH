"""
services/gemini_client.py
--------------------------
Shared Gemini client used by the SOAR AI decision layer and the AI Copilot.

Centralizing this means one client instance (lazily created, cached) and
one place that decides "AI is unavailable" — missing key, init failure,
or an API error. Every caller gets the same contract: get None back and
fall back to non-AI behavior. Nothing here ever raises out to callers.
"""

from __future__ import annotations
import logging
from typing import Optional, Type, TypeVar

from pydantic import BaseModel

from app.config import get_settings

logger = logging.getLogger(__name__)

_client = None
_init_attempted = False

T = TypeVar("T", bound=BaseModel)


def get_client():
    """Lazily create and cache the Gemini client. Returns None if unavailable."""
    global _client, _init_attempted
    if _client is not None or _init_attempted:
        return _client
    _init_attempted = True

    settings = get_settings()
    if not settings.gemini_api_key:
        logger.warning("GEMINI_API_KEY not set — AI features will fall back to static behavior.")
        return None

    try:
        from google import genai
        _client = genai.Client(api_key=settings.gemini_api_key)
    except Exception as e:
        logger.error("Failed to initialize Gemini client: %s", e)
        _client = None

    return _client


def generate_structured(
    prompt: str,
    schema: Type[T],
    model: str = "gemini-3.5-flash",
    temperature: float = 0.2,
) -> Optional[T]:
    """Call Gemini forcing JSON output matching `schema`. Returns None on any failure."""
    client = get_client()
    if client is None:
        return None
    try:
        from google.genai import types
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema,
                temperature=temperature,
            ),
        )
        if isinstance(response.parsed, schema):
            return response.parsed
        return schema.model_validate_json(response.text)
    except Exception as e:
        logger.error("Gemini structured call failed: %s", e)
        return None


def generate_text(
    prompt: str,
    model: str = "gemini-3.5-flash",
    temperature: float = 0.4,
) -> Optional[str]:
    """Call Gemini for a free-text response with automatic fallback models. Returns None on any failure."""
    client = get_client()
    if client is None:
        return None
        
    models_to_try = [model, "gemini-3.5-flash", "gemini-3.6-flash", "gemini-2.5-flash"]
    # De-duplicate preserving order
    seen = set()
    models_to_try = [m for m in models_to_try if not (m in seen or seen.add(m))]

    from google.genai import types
    for target_model in models_to_try:
        try:
            response = client.models.generate_content(
                model=target_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    http_options=types.HttpOptions(timeout=10000)
                )
            )
            if response.text:
                return response.text
        except Exception as e:
            logger.warning(f"Gemini model {target_model} call failed ({e}). Trying next model...")

    return None

