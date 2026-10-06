from __future__ import annotations

import json
from typing import Callable

import requests

from src.config import tavily_key

Progress = Callable[[str], None]


def tavily_search(query: str, max_results: int = 8) -> list[dict]:
    key = tavily_key()
    if not key:
        raise RuntimeError("TAVILY_API_KEY is not configured.")
    res = requests.post(
        "https://api.tavily.com/search",
        json={
            "api_key": key,
            "query": query,
            "search_depth": "basic",
            "max_results": max_results,
            "include_raw_content": True,
        },
        timeout=25,
    )
    if res.status_code == 429:
        raise RuntimeError("Tavily rate limit. Wait and retry with Quick depth.")
    if not res.ok:
        raise RuntimeError(f"Tavily error {res.status_code}: {res.text[:400]}")
    data = res.json()
    hits = []
    for r in data.get("results") or []:
        url = r.get("url") or ""
        if not url:
            continue
        hits.append(
            {
                "title": r.get("title") or "",
                "url": url,
                "snippet": r.get("content") or "",
                "content": r.get("raw_content") or r.get("content") or "",
            }
        )
    return hits


SKIP = ("accounts.google", "signin", "login", "paywall")


def fetch_page(url: str) -> tuple[bool, str, int]:
    if any(s in url.lower() for s in SKIP):
        return False, "", 0
    try:
        res = requests.get(
            url,
            timeout=9,
            headers={
                "User-Agent": "PhotoRetrievalDiscoveryEngine/1.0 (public research; Streamlit)",
                "Accept": "text/html",
            },
            allow_redirects=True,
        )
        html = res.text or ""
        text = _strip_html(html)[:20000]
        return res.ok, text, res.status_code
    except requests.RequestException:
        return False, "", 0


def _strip_html(html: str) -> str:
    import re

    html = re.sub(r"(?is)<script.*?>.*?</script>", " ", html)
    html = re.sub(r"(?is)<style.*?>.*?</style>", " ", html)
    html = re.sub(r"(?is)<[^>]+>", " ", html)
    html = re.sub(r"\s+", " ", html)
    return html.strip()
