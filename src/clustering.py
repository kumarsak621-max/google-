from __future__ import annotations

import json
from collections import defaultdict
from typing import Any

from src.config import openai_key, openai_model


def cluster_episodes(episodes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for e in episodes:
        if int(e.get("evidence_strength") or 0) < 3:
            continue
        key = _bucket(e)
        e["archetype_id"] = key
        groups[key].append(e)

    archetypes = []
    for i, (key, items) in enumerate(sorted(groups.items(), key=lambda x: -len(x[1])), start=1):
        quotes = [x.get("original_quote", "")[:220] for x in items[:3]]
        urls = [x.get("url", "") for x in items[:8]]
        ids = [x.get("id", "") for x in items]
        name = _name(key, items)
        arch = {
            "id": key,
            "name": name,
            "description": _describe(key, items),
            "evidence_count": len(items),
            "remembered": _top(items, "remembered_information"),
            "forgotten": _top(items, "forgotten_information"),
            "search_behavior": _top(items, "search_strategy"),
            "failure_point": _top(items, "failure_category"),
            "workaround": _top(items, "workaround"),
            "severity": min(5, 2 + (len(items) > 3) + (len(items) > 8)),
            "ai_opportunity": 4 if "Representation" in key or "Ranking" in key or "Memory" in key else 3,
            "evidence_ids": ids,
            "urls": urls,
            "quotes": quotes,
            "frequency": min(5, max(1, len(items))),
        }
        archetypes.append(arch)

    if openai_key() and archetypes:
        archetypes = _llm_names(archetypes, episodes) or archetypes
    return archetypes[:10]


def _bucket(e: dict[str, Any]) -> str:
    f = e.get("failure_category") or "Other"
    obj = (e.get("object_memory") or "") + (e.get("remembered_information") or "")
    obj = obj.lower()
    if "screenshot" in obj or "receipt" in obj or "document" in obj or "ocr" in (e.get("search_strategy") or "").lower():
        return "text-as-date"
    if "Ranking" in f or "Recognition" in f:
        return "incomplete-set"
    if "face" in obj or "person" in obj or "wife" in obj:
        return "person-index"
    if "map" in obj or "trip" in obj or "france" in obj or "location" in obj:
        return "place-without-name"
    if "Memory-expression" in f:
        return "visual-or-episode"
    return f.split()[0].lower() if f else "other"


def _name(key: str, items: list[dict[str, Any]]) -> str:
    names = {
        "text-as-date": "I remember a word that was on the photo, not the date",
        "incomplete-set": "The keyword is a filter; I need a dated list to recognize the photo",
        "person-index": "I remember who; the index does not have a who",
        "place-without-name": "I remember the place, not a searchable place name",
        "visual-or-episode": "I remember how it looked or the episode, not a keyword",
    }
    return names.get(key, items[0].get("failure_category") or key)


def _describe(key: str, items: list[dict[str, Any]]) -> str:
    n = len(items)
    return f"Among {n} public retrieval episodes in this cluster: {_name(key, items)}."


def _top(items: list[dict[str, Any]], field: str) -> str:
    from collections import Counter

    c = Counter((i.get(field) or "Unknown") for i in items)
    return c.most_common(1)[0][0]


def _llm_names(archetypes: list[dict[str, Any]], episodes: list[dict[str, Any]]) -> list[dict[str, Any]] | None:
    try:
        import requests

        summary = [
            {
                "id": a["id"],
                "n": a["evidence_count"],
                "quotes": a["quotes"],
                "failure": a["failure_point"],
            }
            for a in archetypes
        ]
        res = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {openai_key()}", "Content-Type": "application/json"},
            json={
                "model": openai_model(),
                "response_format": {"type": "json_object"},
                "messages": [
                    {
                        "role": "system",
                        "content": "Name 5-10 retrieval archetypes from clusters. JSON: {items:[{id,name,description}]}. Do not invent extra evidence.",
                    },
                    {"role": "user", "content": json.dumps(summary)[:8000]},
                ],
            },
            timeout=40,
        )
        if not res.ok:
            return None
        data = json.loads(res.json()["choices"][0]["message"]["content"])
        by = {x["id"]: x for x in data.get("items") or []}
        for a in archetypes:
            if a["id"] in by:
                a["name"] = by[a["id"]].get("name") or a["name"]
                a["description"] = by[a["id"]].get("description") or a["description"]
        return archetypes
    except Exception:
        return None
