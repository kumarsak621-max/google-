import json
from pathlib import Path

p = Path(r"c:\Users\Tnluser\Desktop\GOOGLE PHOTO\evidence\retrieval-episodes.json")
data = json.loads(p.read_text(encoding="utf-8"))
FAIL = {
    "MEMORY EXPRESSION": "A",
    "QUERY FORMULATION": "B",
    "PRODUCT UNDERSTANDING": "C",
    "REPRESENTATION GAP": "D",
    "RESULT NOISE": "E",
    "RANKING": "F",
    "RECOGNITION": "G",
    "REFINEMENT": "H",
    "CONTEXT FRAGMENTATION": "I",
    "RECOVERY": "J",
    "OTHER": "K",
}
ARCH = {
    "G-ocr-bills": "ocr-text",
    "G-ocr-screenshots": "ocr-text",
    "G-ask-truncation": "incomplete-set",
    "G-faces-scans": "people-index",
    "G-nl-vs-noun": "nl-mismatch",
    "G-success-visual-nl": "nl-mismatch",
    "G-success-nl-scene": "nl-mismatch",
    "G-visual-similarity": "visual-similarity",
    "G-success-map": "place-unnamed",
    "G-place-mismatch": "place-unnamed",
    "G-place-filter": "place-unnamed",
    "G-album-needle": "recognition-in-set",
    "G-user-labels": "user-labels",
    "G-policy-block": "policy-index",
    "G-vault": "policy-index",
    "G-empty-index": "policy-index",
    "G-date-search-blocked": "nl-mismatch",
    "G-recent-upload-old-timestamp": "wrong-time",
    "G-wrong-time": "wrong-time",
    "G-success-timeline": "incomplete-set",
    "G-success-combo": "nl-mismatch",
    "G-recipe-person-noise": "ocr-text",
    "G-two-people": "people-index",
    "G-monkey-block": "policy-index",
    "G-journalist-archetype": "ocr-text",
    "G-partner-library": "user-labels",
    "G-combo-fail": "nl-mismatch",
    "G-vague-lost-file": "policy-index",
    "G-missing-year": "wrong-time",
}


def outcome(o, scenario):
    o = o.lower()
    sc = scenario.lower()
    if "success" in sc or o.startswith("succeeded") or "historically succeeded" in o:
        if "fail" in o or "later" in o:
            return "partial"
        return "succeeded"
    if "classic succeeded" in o or "ask failed" in o:
        return "partial"
    if "failed" in o or "blocked" in o or "nothing" in o:
        return "failed"
    return "unknown"


def behaviors(s):
    t = s.lower()
    out = []
    mapping = [
        ("keyword", "keyword search"),
        ("natural language", "natural language search"),
        ("person", "person search"),
        ("location", "location search"),
        ("date browsing", "date search"),
        ("timeline", "timeline browsing"),
        ("album", "album browsing"),
        ("ocr", "OCR/text search"),
        ("object", "object search"),
        ("reformulation", "query reformulation"),
        ("trial", "trial and error"),
        ("lens", "Google Lens"),
        ("external", "external search"),
        ("gave up", "giving up"),
    ]
    for k, v in mapping:
        if k in t:
            out.append(v)
    return out


lines = [
    'import type { Episode } from "./types";',
    "",
    "export const REAL_SEED_EPISODES: Episode[] = [",
]
for r in data:
    oc = outcome(r["search_outcome"], r["retrieval_scenario"])
    fc = FAIL.get(r["failure_category"], "K")
    vs = "VERIFIED" if r["verification_status"] == "page-fetched" else "PARTIALLY_VERIFIED"
    stren = int(r["evidence_strength"])
    suc = True if oc == "succeeded" else False if oc == "failed" else None
    tm = r.get("temporal_memory", "").lower()
    mem_t = []
    for a, b in [
        ("exact", "exact_date"),
        ("month", "month"),
        ("year", "year"),
        ("season", "season"),
        ("relative", "relative_time"),
        ("sequence", "sequence"),
    ]:
        if a in tm:
            mem_t.append(b)
    if not mem_t:
        mem_t = ["unknown"]
    lm = r.get("location_memory", "").lower()
    mem_s = []
    for a, b in [
        ("country", "country"),
        ("city", "city"),
        ("venue", "location"),
        ("landmark", "landmark"),
        ("neighborhood", "neighborhood"),
        ("trip", "trip"),
    ]:
        if a in lm:
            mem_s.append(b)
    if not mem_s:
        mem_s = ["unknown"]
    om = r.get("object_memory", "").lower()
    pm = r.get("people_memory", "").lower()
    mem_sem = []
    if pm and pm != "unknown":
        mem_sem.append("person")
    if "document" in om:
        mem_sem.append("document")
    if "food" in om:
        mem_sem.append("food")
    if "animal" in om:
        mem_sem.append("animal")
    if "product" in om:
        mem_sem.append("product")
    if "screenshot" in r.get("text_memory", "").lower():
        mem_sem.append("screenshot")
    if not mem_sem:
        mem_sem = ["unknown"]
    rec = {
        "id": r["evidence_id"],
        "mode": "research",
        "synthetic": False,
        "relevance": "relevant" if stren >= 3 else "possibly_relevant",
        "source": r["source"],
        "sourceType": r["source_type"],
        "url": r["url"],
        "date": r["date"],
        "title": r["retrieval_scenario"][:120],
        "author": r.get("author") or "Unknown",
        "rawText": r["original_quote"],
        "scenario": r["retrieval_scenario"],
        "remembers": r["remembered_information"],
        "forgot": r["forgotten_information"],
        "query": r["search_attempt"],
        "searchStrategy": r["search_strategy"],
        "refinements": "",
        "outcome": oc,
        "succeeded": suc,
        "whyFailed": r["search_outcome"] if oc != "succeeded" else "",
        "workaround": r["workaround"],
        "failureCode": fc,
        "failureRationale": r["researcher_interpretation"],
        "memory": {
            "temporal": mem_t,
            "spatial": mem_s,
            "semantic": mem_sem,
            "contextual": [r.get("context_memory", "")]
            if r.get("context_memory") and r.get("context_memory") != "unknown"
            else [],
            "visual": [r.get("visual_memory", "")]
            if r.get("visual_memory") and r.get("visual_memory") != "unknown"
            else [],
            "textual": [r.get("text_memory", "")]
            if r.get("text_memory") and r.get("text_memory") != "unknown"
            else [],
            "social": [r.get("people_memory", "")]
            if r.get("people_memory") and r.get("people_memory") != "unknown"
            else [],
        },
        "strength": stren,
        "archetypeId": ARCH.get(r["duplicate_group"], "incomplete-set"),
        "duplicateGroupId": r["duplicate_group"],
        "searchBehaviors": behaviors(r["search_strategy"]),
        "verificationStatus": vs,
        "aiInterpretation": r["researcher_interpretation"],
    }
    lines.append("  " + json.dumps(rec, ensure_ascii=False) + ",")
lines.append("];")
out = Path(r"c:\Users\Tnluser\Desktop\GOOGLE PHOTO\lib\real-seed.ts")
out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", len(data), out.stat().st_size)
