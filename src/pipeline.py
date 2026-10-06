from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Callable
from urllib.parse import urlparse

from src.extraction import extract_quote, heuristic_extract, is_retrieval_episode, llm_enrich
from src.queries import followups, generate_queries
from src.search import fetch_page, tavily_search
from src.verification import verify_quote

Progress = Callable[[str], None]


def host_type(url: str) -> tuple[str, str]:
    try:
        h = urlparse(url).hostname or ""
    except Exception:
        return "web", "Other public web"
    h = h.replace("www.", "")
    if "reddit.com" in h:
        return h, "reddit"
    if "support.google.com" in h:
        return "Google Photos Community", "google_help_community"
    if "play.google" in h:
        return "Play Store", "play_store"
    if "apple.com" in h:
        return "App Store", "app_store"
    if "quora.com" in h:
        return "Quora", "quora"
    if "youtube.com" in h:
        return "YouTube", "youtube"
    return h, "web"


def run_research(
    sources: list[str],
    depth: str,
    max_results: int,
    quality: int,
    progress: Progress,
    use_llm: bool = True,
) -> dict:
    logs: list[str] = []

    def log(msg: str):
        logs.append(msg)
        progress(msg)

    queries = generate_queries(sources, depth)
    log(f"✓ {len(queries)} research queries generated")
    log("→ LLM: OpenRouter" if use_llm else "→ LLM: heuristic only (OpenRouter not configured)")

    hits: list[dict] = []
    snippets: list[str] = []
    pages_found = 0
    for q in queries:
        try:
            batch = tavily_search(q, max_results=6 if depth != "Deep" else 8)
            pages_found += len(batch)
            hits.extend(batch)
            snippets.extend(h["snippet"] for h in batch)
            log(f"Searched: {q} → {len(batch)} results")
        except Exception as e:
            log(f"Search failed for one query: {e}")
        time.sleep(0.25)
        if pages_found >= max_results:
            break

    extras = followups(snippets)
    for q in extras:
        queries.append(q)
        try:
            batch = tavily_search(q, max_results=5)
            pages_found += len(batch)
            hits.extend(batch)
            log(f"Follow-up: {q} → {len(batch)} results")
        except Exception as e:
            log(f"Follow-up failed: {e}")

    log(f"✓ {pages_found} search results found")

    seen = set()
    unique = []
    dups = 0
    for h in hits:
        if h["url"] in seen:
            dups += 1
            continue
        seen.add(h["url"])
        unique.append(h)
    log(f"✓ {len(unique)} unique pages identified")
    log(f"✓ {dups} duplicates removed")

    episodes = []
    reviewed = 0
    for h in unique[: max_results]:
        reviewed += 1
        blob = f"{h['title']} {h['snippet']} {h.get('content') or ''}"
        if not is_retrieval_episode(blob):
            continue
        ok, page, _status = fetch_page(h["url"])
        quote = extract_quote(page or h.get("content") or "", h["snippet"])
        if not quote or len(quote) < 40:
            continue
        src, stype = host_type(h["url"])
        meta = {
            "id": f"L{len(episodes)+1:03d}",
            "source": src,
            "source_type": stype,
            "url": h["url"],
            "title": h["title"],
            "verification_status": verify_quote(ok, page, quote, h["snippet"]),
        }
        item = heuristic_extract(quote, meta)
        if use_llm:
            item = llm_enrich(item)
        if int(item.get("evidence_strength") or 0) < quality - 2 and item.get("search_outcome") == "unknown":
            # keep moderate+; drop very weak
            if int(item.get("evidence_strength") or 0) < 2:
                continue
        episodes.append(item)

    relevant = episodes
    verified = [e for e in relevant if e.get("verification_status") == "VERIFIED"]
    log(f"✓ {reviewed} pages reviewed")
    log(f"✓ {len(relevant)} relevant retrieval episodes")
    log(f"✓ {len(verified)} verified evidence items")
    log("→ Clustering retrieval problems...")

    return {
        "id": f"run-{int(time.time())}",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "queries_run": len(queries),
        "pages_found": pages_found,
        "pages_reviewed": reviewed,
        "relevant_items": len(relevant),
        "verified_items": len(verified),
        "duplicates_removed": dups,
        "status": "complete",
        "logs": logs,
        "episodes": relevant,
    }
