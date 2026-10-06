from __future__ import annotations

import json
import re
from typing import Any

from src.config import openai_key, openai_model

FAILURES = [
    "Memory-expression failure",
    "Query formulation failure",
    "Product understanding failure",
    "Representation gap",
    "Result noise",
    "Ranking failure",
    "Recognition failure",
    "Refinement failure",
    "Context fragmentation",
    "Recovery failure",
    "Other",
]


def is_retrieval_episode(text: str) -> bool:
    t = text.lower()
    if len(t) < 40:
        return False
    if re.search(r"storage|unlimited|google one|subscription", t) and not re.search(
        r"search|find|remember", t
    ):
        return False
    wants = bool(re.search(r"photo|picture|screenshot|video|document|receipt|album", t))
    attempt = bool(re.search(r"search|find|look|typed|scroll|can't find|cannot find|looking for", t))
    clue = bool(re.search(r"remember|forgot|date|trip|name|text|face|location|when|where|i know|i have", t))
    if re.search(r"sucks|terrible|hate", t) and not (attempt and clue):
        return False
    return wants and attempt and clue


def extract_quote(page_text: str, snippet: str) -> str:
    snip = re.sub(r"\s+", " ", snippet).strip()
    if not snip:
        return ""
    hay = page_text or ""
    needle = snip[:80].lower()
    idx = hay.lower().find(needle)
    if idx >= 0:
        return hay[idx : idx + min(420, max(len(snip), 80))].strip()
    m = re.search(r"I (?:know|remember|took|have|can't find)[^.!?]{20,280}", hay, re.I)
    return (m.group(0) if m else snip)[:400]


def heuristic_extract(text: str, meta: dict[str, Any]) -> dict[str, Any]:
    t = text.lower()
    strength = 2
    if is_retrieval_episode(text):
        strength = 3
    if re.search(r"search|typed|looked", t) and re.search(r"remember|forgot|date", t):
        strength = 4
    if re.search(r"['\"][^'\"]{2,40}['\"]", text) and re.search(r"found|nothing|classic|map", t):
        strength = 5

    outcome = "unknown"
    if re.search(r"found it|got all|works|succeeded|amazing", t) and not re.search(r"now nothing|used to", t):
        outcome = "succeeded"
    elif re.search(r"used to|classic search|then I", t) and re.search(r"nothing|failed|sucks", t):
        outcome = "partial"
    elif re.search(r"can't find|cannot find|nothing|no results|failed", t):
        outcome = "failed"

    failure = "Other"
    if re.search(r"don't remember|can't remember|don't know how to search", t):
        failure = "Memory-expression failure"
    if re.search(r"quotes|how do I search|AND", t):
        failure = "Query formulation failure"
    if re.search(r"doesn't understand|best match|gemini|ask photos", t):
        failure = "Product understanding failure"
    if re.search(r"text in|ocr|caption|face not|location tag|filename", t):
        failure = "Representation gap"
    if re.search(r"too many|all of them|open each", t):
        failure = "Result noise"
    if re.search(r"2 pics|see more|no more results|best matches", t):
        failure = "Ranking failure"
    if re.search(r"can't tell|among|1400|chronological|date showing", t):
        failure = "Recognition failure"
    if re.search(r"what else|tried everything", t):
        failure = "Refinement failure"

    quoted = re.findall(r"['\"]([^'\"]{2,40})['\"]", text)
    behaviors = []
    mapping = [
        ("classic", "keyword search"),
        ("ask", "natural language"),
        ("gemini", "natural language"),
        ("face", "person search"),
        ("name", "person search"),
        ("location", "location search"),
        ("map", "location search"),
        ("july", "date search"),
        ("scroll", "timeline browsing"),
        ("album", "album browsing"),
        ("screenshot", "OCR/text search"),
        ("text", "OCR/text search"),
        ("quote", "OCR/text search"),
        ("dog", "object search"),
        ("then", "query reformulation"),
        ("lens", "Google Lens"),
        ("drive", "external search"),
        ("gave up", "gave up"),
    ]
    for k, v in mapping:
        if k in t and v not in behaviors:
            behaviors.append(v)

    remembers, forgot = _memory_bits(t)
    return {
        "id": meta.get("id", ""),
        "source": meta.get("source", ""),
        "source_type": meta.get("source_type", "web"),
        "url": meta.get("url", ""),
        "title": meta.get("title", "")[:160],
        "date": meta.get("date", ""),
        "author": meta.get("author", ""),
        "original_quote": text[:800],
        "retrieval_scenario": (text.split(".")[0][:180] if text else ""),
        "remembered_information": remembers,
        "forgotten_information": forgot,
        "search_attempt": "; ".join(quoted) if quoted else "Unknown",
        "search_strategy": "; ".join(behaviors) or "Unknown",
        "search_outcome": outcome,
        "failure_category": failure,
        "workaround": _workaround(t),
        "evidence_strength": strength,
        "verification_status": meta.get("verification_status", "UNVERIFIED"),
        "ai_interpretation": "Heuristic extraction from public text. Not a user statement.",
        "synthetic": False,
        "search_behaviors": behaviors,
        "temporal_memory": _hit(t, ["exact date", "month", "year", "season", "last year", "after"]),
        "location_memory": _hit(t, ["country", "city", "france", "trip", "wilderness", "map"]),
        "people_memory": _hit(t, ["wife", "child", "dad", "sister", "friend", "grandmother"]),
        "object_memory": _hit(t, ["dog", "bird", "receipt", "screenshot", "bill", "document"]),
        "duplicate_group": "",
        "archetype_id": "",
    }


def _hit(t: str, words: list[str]) -> str:
    found = [w for w in words if w in t]
    return ", ".join(found) if found else "unknown"


def _memory_bits(t: str) -> tuple[str, str]:
    rem = []
    fog = []
    if "france" in t or "trip" in t:
        rem.append("place/trip")
    if "screenshot" in t or "receipt" in t or "bill" in t:
        rem.append("document/text")
    if "face" in t or "wife" in t or "child" in t:
        rem.append("person")
    if "dog" in t or "bird" in t:
        rem.append("object/animal")
    if "date" in t or "when" in t:
        fog.append("exact date")
    if "where" in t:
        fog.append("place name")
    return ", ".join(rem) or "Unknown", ", ".join(fog) or "Unknown"


def _workaround(t: str) -> str:
    if "classic" in t:
        return "Switch to Classic Search"
    if "quote" in t:
        return "Quoted exact text"
    if "map" in t:
        return "Map / heatmap"
    if "caption" in t:
        return "Write captions"
    if "gallery" in t or "drive" in t:
        return "Another app (Gallery/Drive)"
    if "scroll" in t:
        return "Manually scrolled timeline"
    return "Unknown"


def llm_enrich(item: dict[str, Any]) -> dict[str, Any]:
    key = openai_key()
    if not key:
        return item
    try:
        import requests

        payload = {
            "model": openai_model(),
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Extract a Google Photos retrieval episode. Never invent facts. "
                        "Return JSON with keys: scenario, remembers, forgot, query, outcome "
                        "(succeeded|failed|partial|unknown), failure, workaround, strength (1-5), interpretation. "
                        "interpretation is a hypothesis, not a quote."
                    ),
                },
                {"role": "user", "content": item.get("original_quote", "")[:2500]},
            ],
        }
        res = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json=payload,
            timeout=40,
        )
        if not res.ok:
            return item
        content = res.json()["choices"][0]["message"]["content"]
        data = json.loads(content)
        item["retrieval_scenario"] = data.get("scenario") or item["retrieval_scenario"]
        item["remembered_information"] = data.get("remembers") or item["remembered_information"]
        item["forgotten_information"] = data.get("forgot") or item["forgotten_information"]
        item["search_attempt"] = data.get("query") or item["search_attempt"]
        item["search_outcome"] = data.get("outcome") or item["search_outcome"]
        item["failure_category"] = data.get("failure") or item["failure_category"]
        item["workaround"] = data.get("workaround") or item["workaround"]
        if isinstance(data.get("strength"), int) and 1 <= data["strength"] <= 5:
            item["evidence_strength"] = data["strength"]
        item["ai_interpretation"] = data.get("interpretation") or item["ai_interpretation"]
    except Exception:
        return item
    return item
