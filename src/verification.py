from __future__ import annotations


def verify_quote(page_ok: bool, page_text: str, quote: str, snippet: str) -> str:
    if not quote:
        return "UNVERIFIED"
    if not page_ok:
        return "INACCESSIBLE"
    q = quote[:60].lower()
    hay = (page_text or "").lower()
    sn = (snippet or "")[:40].lower()
    if q and q in hay:
        return "VERIFIED"
    if sn and sn in hay:
        return "PARTIALLY VERIFIED"
    if quote and hay:
        return "PARTIALLY VERIFIED"
    return "UNVERIFIED"
