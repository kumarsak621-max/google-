from __future__ import annotations

import os


def secret(name: str, default: str = "") -> str:
    try:
        import streamlit as st

        val = st.secrets.get(name, None)
        if val:
            return str(val)
    except Exception:
        pass
    return os.environ.get(name, default) or default


def tavily_key() -> str:
    return secret("TAVILY_API_KEY") or secret("WEB_SEARCH_API_KEY")


def openrouter_key() -> str:
    return secret("OPENROUTER_API_KEY")


def openrouter_model() -> str:
    return secret("OPENROUTER_MODEL", "openai/gpt-4o-mini") or "openai/gpt-4o-mini"


def keys_status() -> dict:
    return {
        "tavily": bool(tavily_key()),
        "openrouter": bool(openrouter_key()),
    }
