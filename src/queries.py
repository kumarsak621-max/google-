from __future__ import annotations

CORE_QUERIES = [
    '"Google Photos" "can\'t find" photo',
    '"Google Photos" "can\'t remember" photo',
    '"Google Photos" "don\'t remember the date"',
    '"Google Photos" "can\'t remember where" photo',
    '"Google Photos" "old photo" "can\'t find"',
    '"Google Photos" "picture I took" "can\'t find"',
    '"Google Photos" "I know I have" photo',
    '"Google Photos" "I remember" photo "can\'t find"',
    '"Google Photos" "search doesn\'t find" photos',
    '"Google Photos" "search not finding" photo',
    '"Google Photos" vacation photo "can\'t find"',
    '"Google Photos" restaurant photo "can\'t find"',
    '"Google Photos" medicine photo "can\'t find"',
    '"Google Photos" prescription "can\'t find"',
    '"Google Photos" screenshot "can\'t find"',
    '"Google Photos" document "can\'t find"',
    '"Google Photos" wedding photo "can\'t find"',
    '"Google Photos" family photo "can\'t find"',
    '"Google Photos" college photo "can\'t find"',
]

SOURCE_QUERIES = {
    "Reddit": [
        'site:reddit.com/r/googlephotos "can\'t find" photo',
        'site:reddit.com/r/Android Google Photos search',
        'site:reddit.com/r/photography Google Photos search date',
    ],
    "Google Photos Community": [
        'site:support.google.com/photos/thread search "can\'t find"',
        'site:support.google.com/photos/thread OCR screenshot search',
    ],
    "App reviews": [
        '"Google Photos" review search "can\'t find" site:play.google.com',
        '"Google Photos" App Store review search location',
    ],
    "Forums": [
        'Google Photos "can\'t find" photo forum',
        'Android Central Google Photos old photo',
    ],
    "YouTube": [
        'site:youtube.com Google Photos search can\'t find',
    ],
    "Other public web": [
        'Google Photos heatmap "remember the date"',
        'Google Photos Ask Photos classic search',
    ],
}


def generate_queries(selected_sources: list[str], depth: str) -> list[str]:
    q = list(CORE_QUERIES)
    for src in selected_sources:
        q.extend(SOURCE_QUERIES.get(src, []))
    seen: set[str] = set()
    out: list[str] = []
    for item in q:
        if item not in seen:
            seen.add(item)
            out.append(item)
    if depth == "Quick":
        return out[:8]
    if depth == "Standard":
        return out[:16]
    return out


def followups(snippets: list[str]) -> list[str]:
    blob = " ".join(snippets).lower()
    extra: list[str] = []
    if "screenshot" in blob or "ocr" in blob:
        extra.append('"Google Photos" screenshot text search quotes')
    if "face" in blob or "people" in blob:
        extra.append('"Google Photos" face search name not found')
    if "classic" in blob or "ask photos" in blob:
        extra.append('"Google Photos" Ask Photos Best Matches date')
    if "map" in blob or "location" in blob:
        extra.append('"Google Photos" map "remember the date"')
    return extra
