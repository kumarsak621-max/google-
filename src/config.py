from __future__ import annotations

import os

DEFAULT_MODEL = "google/gemini-2.5-flash"


def secret(name: str, default: str = "") -> str:
    """Read Streamlit Cloud secrets first, then environment. Never crash on missing keys."""
    try:
        import streamlit as st

        try:
            val = st.secrets[name]
        except Exception:
            val = None
        if val is not None and str(val).strip():
            return str(val).strip()
    except Exception:
        pass
    env = os.environ.get(name)
    if env and str(env).strip():
        return str(env).strip()
    return default or ""


def tavily_key() -> str:
    return secret("TAVILY_API_KEY") or secret("WEB_SEARCH_API_KEY")


def openrouter_key() -> str:
    return secret("OPENROUTER_API_KEY")


def openrouter_model() -> str:
    model = secret("OPENROUTER_MODEL", DEFAULT_MODEL) or DEFAULT_MODEL
    lowered = model.strip().lower()
    if lowered.startswith("openai/") or lowered.startswith("gpt-") or "/gpt-" in lowered:
        return DEFAULT_MODEL
    return model.strip()


def keys_status() -> dict[str, bool]:
    """Always includes openrouter and tavily, even when keys are missing."""
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
