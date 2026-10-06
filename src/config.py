from __future__ import annotations

import os


def secret(name: str, default: str = "") -> str:
    try:
        import streamlit as st

        if name in st.secrets:
            val = st.secrets[name]
            if val:
                return str(val)
    except Exception:
        pass
    return os.environ.get(name, default) or default


def tavily_key() -> str:
    return secret("TAVILY_API_KEY") or secret("WEB_SEARCH_API_KEY")


def openai_key() -> str:
    return secret("OPENAI_API_KEY")


def openai_model() -> str:
    return secret("OPENAI_MODEL", "gpt-4o-mini")


def keys_status() -> dict:
    return {
        "tavily": bool(tavily_key()),
        "openai": bool(openai_key()),
    }
