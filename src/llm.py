from __future__ import annotations

import json
import os
import re
from typing import Any

import requests

from src.config import openrouter_key, openrouter_model, secret

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-4o-mini"


class LLMError(Exception):
    """User-facing OpenRouter error. Never includes the API key."""


def generate_text(
    messages: list[dict[str, str]],
    *,
    json_mode: bool = False,
    timeout: int = 40,
) -> str:
    """Call OpenRouter chat completions. Never log or return the API key."""
    key = openrouter_key()
    if not key:
        raise LLMError(
            "OpenRouter API key is missing. Add OPENROUTER_API_KEY to Streamlit Secrets."
        )

    model = openrouter_model()
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "X-Title": "Photo Retrieval Discovery Engine",
    }
    referer = secret("APP_URL") or os.environ.get("STREAMLIT_APP_URL", "")
    if referer:
        headers["HTTP-Referer"] = referer

    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    try:
        res = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=timeout)
    except requests.Timeout as e:
        raise LLMError("OpenRouter request timed out. Try again.") from e
    except requests.RequestException as e:
        raise LLMError("Could not reach OpenRouter. Check your network and try again.") from e

    if res.status_code in (401, 403):
        raise LLMError("OpenRouter API key is invalid. Update OPENROUTER_API_KEY in Streamlit Secrets.")
    if res.status_code == 429:
        raise LLMError("OpenRouter rate limit reached. Wait a moment and try again.")
    if res.status_code == 404:
        raise LLMError("OpenRouter model unavailable. Check OPENROUTER_MODEL.")
    if res.status_code >= 500:
        raise LLMError("OpenRouter server error. Try again later.")
    if not res.ok:
        raise LLMError(f"OpenRouter request failed (HTTP {res.status_code}).")

    try:
        data = res.json()
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError, ValueError) as e:
        raise LLMError("OpenRouter returned an unexpected response.") from e
    if not isinstance(content, str):
        raise LLMError("OpenRouter returned an empty response.")
    return content


def parse_json_response(text: str) -> dict[str, Any]:
    """Parse LLM JSON, including markdown fences and extra prose."""
    if not text or not text.strip():
        raise LLMError("OpenRouter returned empty JSON.")
    raw = text.strip()
    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw, re.I)
    if fenced:
        raw = fenced.group(1).strip()
    try:
        obj = json.loads(raw)
        if isinstance(obj, dict):
            return obj
        raise LLMError("OpenRouter JSON was not an object.")
    except json.JSONDecodeError:
        start, end = raw.find("{"), raw.rfind("}")
        if start >= 0 and end > start:
            try:
                obj = json.loads(raw[start : end + 1])
                if isinstance(obj, dict):
                    return obj
            except json.JSONDecodeError:
                pass
        raise LLMError("OpenRouter returned invalid JSON. Heuristic analysis will be used instead.")


def generate_json(messages: list[dict[str, str]], timeout: int = 40) -> dict[str, Any]:
    return parse_json_response(generate_text(messages, json_mode=True, timeout=timeout))
