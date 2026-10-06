from __future__ import annotations

import os

DEFAULT_MODEL = "google/gemini-2.5-flash"


def secret(name: str, default: str = "") -> str:
    """Read Streamlit Cloud secrets first, then environment. Never crash on missing keys."""
    try:
        import streamlit as st

        try:
            val = st.secrets.get(name, default)
        except Exception:
            val = default
        if val is not None and str(val).strip():
            return str(val).strip()
    except Exception:
        pass
    env = os.environ.get(name)
    if env and str(env).strip():
        return str(env).strip()
    return default or ""


def tavily_key() -> str:
    try:
        return secret("TAVILY_API_KEY") or secret("WEB_SEARCH_API_KEY")
    except Exception:
        return ""


def openrouter_key() -> str:
    try:
        return secret("OPENROUTER_API_KEY", "")
    except Exception:
        return ""


def openrouter_model() -> str:
    try:
        model = secret("OPENROUTER_MODEL", DEFAULT_MODEL) or DEFAULT_MODEL
    except Exception:
        model = DEFAULT_MODEL
    lowered = str(model).strip().lower()
    if lowered.startswith("openai/") or lowered.startswith("gpt-") or "/gpt-" in lowered:
        return DEFAULT_MODEL
    return str(model).strip() or DEFAULT_MODEL


def keys_status() -> dict[str, bool]:
    """Always returns both keys so callers can use keys['openrouter'] safely."""
    try:
        openrouter_ok = bool(openrouter_key())
    except Exception:
        openrouter_ok = False
    try:
        tavily_ok = bool(tavily_key())
    except Exception:
        tavily_ok = False
    return {
        "openrouter": openrouter_ok,
        "tavily": tavily_ok,
    }
