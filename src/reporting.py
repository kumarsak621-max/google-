from __future__ import annotations

from collections import Counter
from typing import Any


def memory_map(episodes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    dims = [
        ("Time", "temporal_memory", ["date", "month", "year", "season", "last year", "relative"]),
        ("Location", "location_memory", ["country", "city", "trip", "map", "france"]),
        ("People", "people_memory", ["wife", "child", "dad", "person", "face"]),
        ("Object", "object_memory", ["dog", "bird", "object"]),
        ("Document/text", "object_memory", ["screenshot", "receipt", "bill", "document"]),
        ("Event/context", "remembered_information", ["trip", "wedding", "college", "sick", "moved"]),
        ("Visual", "remembered_information", ["pose", "dress", "color", "looked"]),
    ]
    rows = []
    for name, field, keys in dims:
        rem = fog = 0
        ids = []
        for e in episodes:
            blob = f"{e.get(field,'')} {e.get('remembered_information','')} {e.get('forgotten_information','')}".lower()
            if any(k in blob for k in keys) and "forgot" not in (e.get("forgotten_information") or "").lower():
                # remembered if field has keys
                if any(k in (e.get(field) or e.get("remembered_information") or "").lower() for k in keys):
                    rem += 1
                    ids.append(e.get("id"))
            if "date" in (e.get("forgotten_information") or "").lower() and name == "Time":
                fog += 1
            elif name != "Time" and any(k in (e.get("forgotten_information") or "").lower() for k in keys):
                fog += 1
        rows.append({"Memory type": name, "Remembered": rem, "Forgotten": fog, "Evidence": len(ids)})
    return rows


def funnel_notes(episodes: list[dict[str, Any]]) -> list[dict[str, str]]:
    n = len(episodes)
    return [
        {"stage": "Remember", "n": str(n), "note": "User believes a specific visual item exists."},
        {"stage": "Recall clues", "n": str(n), "note": "Clues are often place, text, person, or class — not an exact date."},
        {"stage": "Express", "n": str(sum(1 for e in episodes if 'Memory-expression' in (e.get('failure_category') or ''))), "note": "Failure when the memory is a scene/map that is not a typed keyword."},
        {"stage": "Search", "n": str(sum(1 for e in episodes if e.get('search_attempt'))), "note": "Keyword, NL, OCR, map, album, person — only if stated."},
        {"stage": "Evaluate", "n": str(sum(1 for e in episodes if 'Ranking' in (e.get('failure_category') or '') or 'noise' in (e.get('failure_category') or '').lower())), "note": "Truncated Best Match sets and noisy classes show up here."},
        {"stage": "Refine", "n": str(sum(1 for e in episodes if 'reform' in (e.get('search_strategy') or '') or 'Refinement' in (e.get('failure_category') or ''))), "note": "Synonyms, Classic, quotes — if mentioned."},
        {"stage": "Recognize", "n": str(sum(1 for e in episodes if 'Recognition' in (e.get('failure_category') or ''))), "note": "Dates on a complete list are used as recognition aids."},
        {"stage": "Retrieve", "n": str(sum(1 for e in episodes if e.get('search_outcome') == 'succeeded')), "note": "Count of stated successes in this dataset, not a conversion rate."},
    ]


def report_markdown(episodes: list[dict[str, Any]], archetypes: list[dict[str, Any]], hyps: list[dict[str, Any]], mode: str) -> str:
    real = episodes
    n = len(real)
    hq = sum(1 for e in real if int(e.get("evidence_strength") or 0) >= 4)
    ver = sum(1 for e in real if e.get("verification_status") == "VERIFIED")
    suc = sum(1 for e in real if e.get("search_outcome") == "succeeded")
    fail = sum(1 for e in real if e.get("search_outcome") == "failed")
    banner = "DEMO DATA — SYNTHETIC EXAMPLES — NOT REAL USER EVIDENCE\n\n" if mode == "demo" else "REAL PUBLIC WEB EVIDENCE (directional, not a census)\n\n"
    lines = [
        "# Photo Retrieval Discovery Engine — Research Report",
        "",
        banner,
        "> Public online discussions are directional qualitative evidence and are not representative of all Google Photos users.",
        "",
        "> AI interpretations are hypotheses derived from evidence and are not direct user statements.",
        "",
        "## 1. Executive summary",
        f"Among {n} episodes in this dataset ({hq} at strength 4–5; {ver} VERIFIED), {suc} are stated successes and {fail} stated failures.",
        "",
        "## 2. Evidence coverage",
        f"- Items: {n}",
        f"- Sources: {len({e.get('source') for e in real})}",
        "",
        "## 3. What users remember",
        _bullets(Counter(e.get("remembered_information") or "Unknown" for e in real).most_common(8)),
        "",
        "## 4. What users forget",
        _bullets(Counter(e.get("forgotten_information") or "Unknown" for e in real).most_common(8)),
        "",
        "## 5. Search behavior",
        _bullets(Counter(e.get("search_strategy") or "Unknown" for e in real).most_common(8)),
        "",
        "## 6. Failure points",
        _bullets(Counter(e.get("failure_category") or "Other" for e in real).most_common(10)),
        "",
        "## 7. Workarounds",
        _bullets(Counter(e.get("workaround") or "Unknown" for e in real).most_common(8)),
        "",
        "## 8. Retrieval archetypes",
    ]
    for a in archetypes:
        lines += [
            f"### {a.get('name')}",
            a.get("description", ""),
            f"n={a.get('evidence_count')} · opportunity {a.get('opportunity_score', 'n/a')}",
            f"IDs: {', '.join(a.get('evidence_ids') or [])}",
            f"URLs: {' '.join(a.get('urls') or [])}",
            "",
        ]
    lines += [
        "## 9. Successful vs failed",
        f"Succeeded {suc}; failed {fail}; remainder partial/unknown. Compare clues in Evidence Explorer.",
        "",
        "## 10. Opportunity areas",
    ]
    for a in archetypes[:5]:
        lines.append(f"- {a.get('name')}: score {a.get('opportunity_score')} ({a.get('score_rationale','')})")
    lines += ["", "## 11. Contradicting evidence"]
    for h in hyps:
        lines += [
            f"### {h['id']} {h['hypothesis']}",
            f"Support: {', '.join(h['support'][:12]) or 'none'}",
            f"Contradict: {', '.join(h['contradict'][:12]) or 'none'}",
            f"Confidence: {h['confidence']}",
            "",
        ]
    lines += [
        "## 12. Interview hypotheses",
        *[f"- {h['id']}: {h['interview']}" for h in hyps],
        "",
        "## 13. Research limitations",
        "Public posters are self-selected. Reddit/Help pages are often index-verified rather than fully fetched. Do not treat counts as % of Google Photos users.",
        "",
        "**AI discovery generates hypotheses. Primary user research validates them.**",
    ]
    return "\n".join(lines)


def _bullets(pairs) -> str:
    return "\n".join(f"- {k}: {v}" for k, v in pairs)
