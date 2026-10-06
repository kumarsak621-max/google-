from __future__ import annotations

from typing import Any


def score_archetype(arch: dict[str, Any], n_total: int) -> dict[str, Any]:
    freq = min(5, max(1, round(5 * arch["evidence_count"] / max(n_total, 1))))
    sev = int(arch.get("severity") or 3)
    evid = 4 if arch["evidence_count"] >= 3 else 3
    strategic = 5 if arch["id"] in {"text-as-date", "incomplete-set", "person-index", "place-without-name"} else 3
    ai = int(arch.get("ai_opportunity") or 3)
    feas = 4 if arch["id"] in {"incomplete-set", "text-as-date"} else 3
    diff = 4
    overall = round((freq + sev + evid + strategic + ai + feas + diff) / 7, 2)
    arch.update(
        {
            "score_frequency": freq,
            "score_severity": sev,
            "score_evidence": evid,
            "score_strategic": strategic,
            "score_ai": ai,
            "score_feasibility": feas,
            "score_differentiation": diff,
            "opportunity_score": overall,
            "score_rationale": (
                f"Mean of frequency {freq}, severity {sev}, evidence {evid}, "
                f"strategic {strategic}, AI {ai}, feasibility {feas}, differentiation {diff}. "
                "Among analyzed public episodes only — not population prevalence."
            ),
        }
    )
    return arch


def hypotheses(episodes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    real = [e for e in episodes]
    by = lambda pred: [e["id"] for e in real if pred(e)]
    return [
        {
            "id": "H1",
            "hypothesis": "Users treat class nouns (country, dogs, birds) as dated filters, not unique photo IDs.",
            "support": by(lambda e: e.get("archetype_id") == "incomplete-set" or "Ranking" in (e.get("failure_category") or "")),
            "contradict": by(lambda e: e.get("search_outcome") == "succeeded" and "natural" in (e.get("search_strategy") or "")),
            "confidence": "High" if real else "Low",
            "interview": "Walk through your last failed search: what did you type first, and what did you expect the results to look like?",
        },
        {
            "id": "H2",
            "hypothesis": "When date is missing, in-image text is the strongest substitute clue.",
            "support": by(lambda e: e.get("archetype_id") == "text-as-date"),
            "contradict": by(lambda e: e.get("archetype_id") == "visual-or-episode" and e.get("search_outcome") == "succeeded"),
            "confidence": "Medium",
            "interview": "If you could not remember the date, what would you type first: a word on the photo, a person, a place, or how it looked?",
        },
        {
            "id": "H3",
            "hypothesis": "Person search fails when faces are undetected, even when the user clearly remembers who is in the photo.",
            "support": by(lambda e: e.get("archetype_id") == "person-index"),
            "contradict": by(lambda e: "face" in (e.get("original_quote") or "").lower() and e.get("search_outcome") == "succeeded"),
            "confidence": "Medium",
            "interview": "Show me a photo of someone search cannot find. Was a face box present?",
        },
        {
            "id": "H4",
            "hypothesis": "Spatial memory (map, trip, unnamed land) substitutes for forgotten dates when GPS exists.",
            "support": by(lambda e: e.get("archetype_id") == "place-without-name"),
            "contradict": by(lambda e: "map" in (e.get("original_quote") or "").lower() and e.get("search_outcome") == "failed"),
            "confidence": "Medium",
            "interview": "Think of a photo from a trip whose date you forgot. Would you rather zoom a map or type a place name?",
        },
        {
            "id": "H5",
            "hypothesis": "Natural-language scene queries can succeed for unique poses/pets while failing for class filters.",
            "support": by(lambda e: e.get("search_outcome") == "succeeded" and "natural" in (e.get("search_strategy") or "")),
            "contradict": by(lambda e: "Ask" in (e.get("original_quote") or "") and e.get("search_outcome") == "failed"),
            "confidence": "Medium",
            "interview": "Have you ever described a photo in a sentence and had it work? When did a single noun work better?",
        },
        {
            "id": "H6",
            "hypothesis": "Users who caption or rename photos expect those strings to be searchable later.",
            "support": by(lambda e: "caption" in (e.get("original_quote") or "").lower() or "rename" in (e.get("original_quote") or "").lower()),
            "contradict": by(lambda e: "caption" in (e.get("original_quote") or "").lower() and e.get("search_outcome") == "succeeded"),
            "confidence": "Low",
            "interview": "Have you ever written a caption so you could find the photo later? Did search find it?",
        },
        {
            "id": "H7",
            "hypothesis": "After a failed search, the product offers too little recovery, so people switch engines or scroll.",
            "support": by(lambda e: "classic" in (e.get("workaround") or "").lower() or "scroll" in (e.get("workaround") or "").lower()),
            "contradict": by(lambda e: e.get("search_outcome") == "succeeded" and not e.get("workaround")),
            "confidence": "Medium",
            "interview": "After a search returned the wrong set, what did you try next?",
        },
        {
            "id": "H8",
            "hypothesis": "Successful vague retrieval usually has one unique indexed clue (landmark, OCR word, labeled person).",
            "support": by(lambda e: e.get("search_outcome") == "succeeded"),
            "contradict": by(lambda e: e.get("search_outcome") == "failed" and e.get("evidence_strength", 0) >= 4),
            "confidence": "Medium",
            "interview": "Compare a find that worked with one that failed. What clue did you have in each?",
        },
    ]
