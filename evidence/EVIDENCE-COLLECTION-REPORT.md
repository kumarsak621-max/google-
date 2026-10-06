# Google Photos — Vague-memory retrieval evidence collection

**Collection date:** 2026-10-06  
**Datasets:** [retrieval-episodes.json](retrieval-episodes.json) · [retrieval-episodes.csv](retrieval-episodes.csv)  
**Rule:** original quotes preserved separately from researcher interpretation. No fabricated users.

---

## Stopping rule

**Condition 3 was reached:** additional queries mostly returned the same Ask Photos vs Classic threads, OCR/screenshot threads, and face-detection threads already coded.

Not reached: 100 unique high-quality (4–5) *fully page-fetched* episodes.  
Not used as a substitute: inflating snippet volume into 200 “records.”

**Verification limit:** Reddit HTML and many Help Community pages did not return full bodies (403 / JS shells). Most Reddit/Help quotes are **index-verified** (public URL + matching snippet). Seven items are **page-fetched**. Index-verified items are usable as directional public evidence, not as verbatim page archives.

---

## 1. Evidence coverage

| Measure | Count |
|---|---|
| Query families searched (approx.) | 55 |
| Pages/threads attempted to open | ~30 |
| Unique public URLs in the coded set | 52 |
| Relevant retrieval-episode records | **72** |
| Strength 4–5 | **60** |
| Strength 3 | 11 |
| Strength 2 | 1 |
| Strength 1 | 0 |
| Page-fetched | 7 |
| Index-verified | 65 |
| Duplicate *groups* (same incident/thread pattern) | 29 |
| Duplicate *users counted twice* | 0 (same-thread comments kept as separate episodes only when they describe a distinct retrieval situation) |
| Source types | 6 |

**Source types**

| source_type | records |
|---|---|
| reddit | 47 |
| google_help_community | 11 |
| article (hands-on / journalism with first-person retrieval) | 9 |
| quora | 2 |
| app_store | 2 |
| forum | 1 |

Play Store: listing pages did not yield unique, quote-stable individual review URLs in this environment. Those reviews were **not** coded as verified episodes.

**Successful vs failed (among 72)**

Classification uses the episode’s stated outcome, not sentiment.

- **Clear success on first useful strategy:** 18 (E06, E07, E08, E09, E17, E29, E32, E36, E37, E44, E45, E48, E54, E64, E65, E69, E71, E72)
- **Success only after workaround / mode switch / syntax:** 7 (E15 Classic; E22 captions; E27 quoted AND; E31 phone map; E34/E35 Classic; E59 camera-model)
- **Historical success, later failure of the same job:** 6 (E05, E14, E20, E40, E41, E50)
- **Failed or blocked in the described attempt:** 41 (remainder, including mixed corpus/deletion cases E42, E43, E53, E67)

Years spanned in the set: **2016–2026** (plus undated Help threads).

---

## 2. Top retrieval scenarios

Ranked by **verified records that describe that job** (an episode can contribute to one primary scenario).

| Rank | Scenario | Evidence IDs | n |
|---|---|---|---|
| 1 | Find a **document / screenshot / receipt / bill** by remembered **text**, not date | E05, E12, E14, E20, E21, E24, E29, E30, E40, E41, E43, E44, E45, E63, E65, E71, E72 | 17 |
| 2 | Find **many matching photos** (country, species, “dogs”) and **recognize the right one using time** | E13, E15, E16, E19, E49, E60, E70 | 7 |
| 3 | Find a **person** by name/relationship when faces are missing, merged, or unlabeled | E12, E22, E28, E38, E39, E47, E51, E54, E55, E62 | 10 |
| 4 | Find photos from a **trip/place** without a date (map, country, GPS-off, unnamed wilderness) | E08, E10, E16, E31, E33, E48, E52, E57, E58, E64, E68, E69 | 12 |
| 5 | Natural-language **scene / pose / clothing / pet identity** | E06, E07, E17, E34, E35, E36, E37 | 7 |
| 6 | User **labels, captions, filenames** as the retrieval key | E18, E25, E46, E65 | 4 |
| 7 | **Visual similarity** (have a recent photo of an object; find the older one) | E23, E66 | 2 |
| 8 | **Needle in a known album** | E03, E04 | 2 |
| 9 | **Coarse time** as the query (`July 2016`, `March`) | E02, E09, E26 | 3 |
| 10 | Recently uploaded **old media** / wrong timestamps | E01, E56 | 2 |

---

## 3. What users remember

Among the 60 strength 4–5 episodes, memory that actually appears in the quote (not inferred):

| Memory type | Pattern | Supporting IDs (selected) | n (4–5, primary) |
|---|---|---|---|
| **Text in the image** | Brand, OCR word, screenshot copy, signwriting | E05, E14, E20, E21, E24, E29, E41, E44, E71 | 9+ |
| **Place / trip** | Country, “that place,” wilderness map, postcode, parents’ house | E08, E10, E16, E31, E33, E48, E64, E68 | 8+ |
| **Person / relationship** | Child, wife, daughter, great-grandmother, siblings, dad | E02, E06, E22, E28, E38, E51, E54 | 7+ |
| **Object class** | Dogs, birds, kookaburra, monkeys, banana, fruit variety | E04, E10, E13, E49, E50 | 5+ |
| **User-authored label** | Rename, caption, fruit tags | E18, E25, E46 | 3 |
| **Visual / pose / clothing** | Arms crossed, red dress, distinctive object | E17, E23, E35 | 3 |
| **Coarse time** | July 2016, last year, 2019, 2024 | E02, E57, E63, E67 | 4 |
| **Event / context** | Zoo trip, road trip with parents, Halloween costume, work visit | E11, E37, E64, E67 | 4 |

**Finding.** Users often remember **one strong non-date dimension** (text, place, person, or class) and expect that dimension to act as a complete filter.

- Supporting items: 60 strength 4–5  
- Evidence IDs: see table  
- Links: each ID’s URL in the JSON  
- Representative quotes: E05, E08, E16, E20, E31  
- Contradicting: E09 (users who *do* remember year/month and just scroll)  
- Confidence: **High** for “date is often unused”; **Medium** for population ranking of memory types (public posters are search-problem self-selected)

---

## 4. What users forget

| Forgotten / missing | Evidence IDs | n |
|---|---|---|
| Exact capture date | E01, E02, E08, E11, E16, E20, E23, E31, E40, E57, many others | majority of 4–5 set |
| Official place name (unnamed land, “that place,” parents’ house) | E08, E31, E33 | 3 |
| Query syntax (quotes, AND, Classic vs Ask) | E20, E25, E27, E38 | 4 |
| Which instance among many similar items | E03, E04, E12, E13, E16, E49, E63 | 7 |
| That GPS / face / OCR / Locked Folder is not in the searchable index | E24, E28, E43, E57, E68 | 5 |

**Finding.** Among coded episodes, **exact calendar date is the most commonly unused or unavailable clue**, even when the user is certain the photo exists.

- Supporting: E01, E02, E08, E16, E20, E23, E31, E40  
- Contradicting: E02 and E09 *use* month/year when they have it; E67 *has* the year 2019  
- Confidence: **High** in this public sample

---

## 5. Search behaviors

Co-occurring strategies (an episode may use several):

| Behavior | Example IDs |
|---|---|
| Keyword / object / place string | E10, E13, E16, E49, E52 |
| OCR / text in image | E05, E14, E20, E24, E44, E71 |
| Natural language | E06, E17, E34, E35, E36, E37 |
| Person search / face groups | E12, E22, E28, E38, E54 |
| Timeline / date browse | E01, E09, E56 |
| Album browse + in-album find | E03, E04 |
| Location map / heatmap / postcode | E08, E31, E58, E64 |
| Query reformulation / trial-and-error | E11, E13, E25, E27 |
| Mode switch (Ask ↔ Classic) | E15, E34, E35 |
| External (Drive, Samsung Gallery, Lens-on-web) | E24, E29 |
| Gave up / switch apps (stated) | E18 thread, E21 |

**Finding.** Users rarely describe a single query. Typical pattern: **one remembered clue → empty or truncated set → reformulate synonym / switch engine / leave search and browse.**

- Supporting: E11, E13, E15, E24, E27  
- Confidence: **High**

---

## 6. Failure categories

Primary category on all 72 (researcher assignment from the quote, not assumed):

| Category | n | Example IDs |
|---|---|---|
| OTHER (policy block, missing corpus, deletion, index-empty, vault) | 24 | E10, E11, E21, E26, E42, E43, E67 |
| REPRESENTATION GAP | 20 | E01, E05, E14, E20, E22, E25, E28, E46, E51, E56, E57, E68 |
| PRODUCT UNDERSTANDING | 6 | E02, E34, E35, E38, E52 |
| MEMORY EXPRESSION | 5 | E23, E31, E58, E63, E66 |
| RECOGNITION | 4 | E03, E19, E49, E60 |
| RANKING (incl. truncation / Best Match) | 3 | E13, E15, E16 |
| RESULT NOISE | 3 | E12, E50, E70 |
| CONTEXT FRAGMENTATION | 3 | E04, E59, E61 |
| QUERY FORMULATION | 3 | E27, E33, E47 |
| REFINEMENT | 1 | E42 |

**Finding.** The largest *product-shaped* cluster is **REPRESENTATION GAP**: the user’s clue (OCR text, caption, face, GPS, upload-vs-capture date) is not what the index can use. The largest *mixed* bucket is OTHER, which should **not** be treated as one product problem.

- Confidence: **Medium–High** (OTHER is a residual; interviews should split policy vs missing files vs UI)

---

## 7. Workarounds

| Workaround | Example IDs |
|---|---|
| Switch to Classic / turn off Gemini Ask | E15, E18, E34, E35, E40 |
| Quoted exact text | E20, E24, E27 |
| Phone map / heatmap / postcode | E08, E31, E64 |
| Write names/descriptions on photos | E22, E65 |
| Samsung Gallery / Google Drive | E24, E29 |
| Open every result | E12 |
| Camera-model string in partner library | E59 |
| Scroll timeline by year/month | E09 |
| Check Locked Folder / Archive / old phones | E43, E53, E67 |
| None / leave product | E21, E28, E46 |

---

## 8. Retrieval archetypes

### A. Text-is-the-date (utility photos)

User photographed a bill, receipt, screenshot, boarding pass, or sign. They remember a **word**, not a day.

- URLs: [Progressive bill](https://www.reddit.com/r/googlephotos/comments/1fa4fg1/what_happened_to_the_search_feature_on_the_app/) · [screenshots](https://www.reddit.com/r/googlephotos/comments/1ccui2v/google_photos_text_search_no_longer_working/) · [Chase](https://support.google.com/photos/thread/153355203/how-can-i-search-for-photos-by-text-in-the-photo?hl=en) · [excavator OCR](https://www.reddit.com/r/GooglePixel/comments/1qbdo8i/google_photos_removing_search_and_replacing_it/) · [LG bill via Drive](https://www.quora.com/Does-Google-Photos-allow-searching-by-text-in-images)
- IDs: E05, E14, E20, E24, E29, E44, E71

### B. Incomplete candidate set (class or trip as a filter)

User is not looking for “the one true photo.” They need **all** France / dogs / birds **dated**, then they will recognize.

- URLs: [Classic vs 2 pics](https://www.reddit.com/r/googlephotos/comments/1kucfki/google_photos_new_ai_search_sucks/) · [kookaburra / 400 birds](https://www.reddit.com/r/GooglePixel/comments/1qbdo8i/google_photos_removing_search_and_replacing_it/) · [dog View more](https://www.androidauthority.com/google-photos-new-ask-photos-search-hands-on-3571895/)
- IDs: E13, E15, E16, E19, E49, E60

### C. Person remembered, face not in the index

- URLs: [great-grandmother captions](https://www.reddit.com/r/googlephotos/comments/p55on7/helpful_hack_how_i_manually_tag_unrecognized/) · [undetected face](https://support.google.com/photos/thread/197077935/adding-tag-for-a-person-on-google-photos?hl=en) · [name search No Results](https://www.reddit.com/r/googlephotos/comments/1odf8kp/google_photos_randomly_stopped_recognizing_faces/) · [Polaroid siblings](https://www.reddit.com/r/googlephotos/comments/xl693t/is_there_a_way_to_search_google_photos_using_a/) · [success: 1980 toddler scans](https://www.reddit.com/r/googlephotos/comments/1urtxxp/facial_recognition_still_is_the_worst/)
- IDs: E22, E28, E38, E51, E54 (contradiction)

### D. Place without a searchable name

- URLs: [that place / Maps](https://www.reddit.com/r/LifeProTips/comments/14shios/lpt_you_can_search_for_your_photos_on_your_phone/) · [wilderness heatmap](https://www.reddit.com/r/googlephotos/comments/1tk7c8i/where_can_i_find_the_heat_map_on_desktop/) · [GPS off last year](https://www.reddit.com/r/googlephotos/comments/ll1plt/location_data_on_photos/) · [postcode work visits](https://www.reddit.com/r/Android/comments/66q8g6/thank_you_google_photos/) · [App Store location](https://apps.apple.com/us/app/google-photos-backup-edit/id962194608?see-all=reviews)
- IDs: E08, E31, E57, E64, E68

### E. Scene NL works; noun/date NL fails

- URLs: [tulips](https://www.reddit.com/r/googlephotos/comments/1eqbi8x/google_photos_what_people_dont_understand_in_my/) · [arms crossed](https://www.reddit.com/r/googlephotos/comments/1kucfki/google_photos_new_ai_search_sucks/) · [baby / red dress / Corgi](https://xix.ai/ainews/google-photos-ai-search-falls-short-3-fixes-improve.html) · [July 2016 blocked](https://www.reddit.com/r/googlephotos/comments/1v3gsds/i_can_no_longer_search_for_photos_by_date/)
- IDs: E06, E17, E34, E35, E36, E02

### F. User tried to encode memory (caption / rename) and search ignored it

- URLs: [renamed keywords](https://www.reddit.com/r/googlephotos/comments/1lklsk2/classic_search_is_gone/) · [caption quotes fail](https://support.google.com/photos/thread/348529069/you-can-now-search-for-words-within-your-photos?hl=en) · [fruit descriptions](https://www.reddit.com/r/googlephotos/comments/1kucfki/google_photos_new_ai_search_sucks/) · [receipt descriptions worked](https://support.google.com/photos/thread/1261014/how-to-rename-photos?hl=en)
- IDs: E18, E25, E46, E65 (contradiction)

### G. Visual seed, forgotten date

- URLs: [older photo of same item](https://www.reddit.com/r/googlephotos/comments/xl693t/is_there_a_way_to_search_google_photos_using_a/) · [similar image Help](https://support.google.com/photos/thread/226221/how-do-i-search-for-an-image-in-google-photos-that-is-similar-not-identical-to-another-image?hl=en)
- IDs: E23, E66

### H. Known album, unknown position

- URL: [1400 album / poodles](https://www.reddit.com/r/googlephotos/comments/1vcu3cs/finding_specific_photo_in_a_large_album/)
- IDs: E03, E04

---

## 9. Successful vs failed retrieval

**Successful vague retrieval in this set tended to have:**

1. A **named, unique** clue already in the index: landmark (E48), postcode (E64), merchant OCR when it works (E44, E71), labeled person (E27 after syntax), named pet (E36).
2. A **spatial substitute for date**: map zoom (E08, E31).
3. **Classic / complete dated gallery** after Ask truncated (E15, E34, E35).
4. **Scene uniqueness** (tulips + spouse, arms crossed, Halloween costume) (E06, E17, E37).

**Failed vague retrieval tended to have:**

1. A **class** clue where the user needed a **set + dates** (France, dogs, birds) (E13, E16, E49).
2. A **text** clue the current engine no longer treats as exact OCR (E14, E20) — *or* safety blocking (E21, E10).
3. A **person** clue with no detected face (E28, E51, E38).
4. A **place** clue that is not a Maps name and has no GPS (E31, E57, E68).
5. A **user-authored** string the search page does not query (E18, E25, E46).

**Comparison (not a population rate):** unique visual/NL jobs and unique named entities succeed more often in public posts; **filter-style jobs** (all X, then pick by time) fail when results are truncated or undated.

- Confidence: **Medium** (survivorship: people post when Ask is newly broken)

---

## 10. Strongest opportunity areas

Do **not** read these as MVP specs. They are interview-validation targets.

### Opportunity 1 — Complete, dated candidate sets for class/place queries

- Evidence count: 7 primary (E13, E15, E16, E19, E49, E60 + related E70)
- Representative quotes: E15, E16, E13, E19
- Memory pattern: object or country remembered; instance identified by **time**
- Failure: RANKING / RECOGNITION
- Severity: high for “I know I have many”
- Workaround: Classic Search
- Confidence: **High**

### Opportunity 2 — OCR / screenshot / document as date substitute

- Evidence count: 17 scenario-1 records
- Quotes: E05, E20, E14, E24 vs success E71, E44
- Memory: text; forget date
- Failure: REPRESENTATION GAP (and quotes syntax)
- Workaround: `"quotes"`, Drive, Gallery
- Confidence: **High** that the job exists; **Medium** on current OCR quality (era contradiction)

### Opportunity 3 — Place memory that is not a place-name string

- Evidence count: E08, E31, E33, E57, E58, E64, E68
- Quotes: E08, E31
- Memory: map / trip / postcode / “parents’ house”
- Failure: MEMORY EXPRESSION + missing GPS
- Workaround: phone heatmap
- Confidence: **High** for outdoor/travel users in this sample

### Opportunity 4 — Person search when the face is undetected or split

- Evidence count: E22, E28, E38, E39, E51, E55, E62 vs success E54
- Failure: REPRESENTATION GAP
- Workaround: captions (labor)
- Confidence: **High** that the gap exists; **Medium** on how often scans succeed (E54)

### Opportunity 5 — User-encoded memory (captions, renames) actually searchable

- Evidence count: E18, E25, E46 vs older success E65
- Failure: REPRESENTATION GAP
- Workaround: none reliable in 2025–26 posts
- Confidence: **Medium** (product may have changed; interviews must check current index)

---

## Findings with required support (no unsupported “users usually”)

### Finding 1

Among the **60** strength 4–5 episodes, **18** describe using **in-image text or a screenshot** as the retrieval key.

- IDs: E05, E12, E14, E20, E21, E24, E29, E30, E40, E41, E44, E45, E63, E65, E71, E72 (plus E43 documents-in-vault)
- Links: see JSON
- Quotes: E05 Progressive; E20 screenshots; E14 excavators
- Contradict: E30 (OCR never worked for that author); E71 (Chase succeeded)
- Confidence: **High** that the job is real in public evidence

### Finding 2

Among those 60, **Ask/Best Match truncation** is described as failing a **set-recognition** job, while Classic dated lists succeed for the **same query**.

- IDs: E15, E16, E13, E34, E35
- Quote (E15): “got all the pics I was expecting, and in date order and with the date showing”
- Contradict: E06, E17, E36, E37 (Ask useful for unique scenes/pets)
- Confidence: **High**

### Finding 3

**Spatial memory substitutes for forgotten dates** when GPS exists (E08, E64, E48) and fails when the place is unnamed or untagged (E31, E57, E68).

- Confidence: **High** for the contrast in this sample

### Finding 4

Public evidence does **not** support a single “search is bad” root cause. The same product is described as excellent for tulips/Corgi/maps and unusable for kookaburra/France/OCR/undetected faces.

- Confidence: **High**

---

## Gaps (do not fill with invention)

- Individual **Play Store** review episodes: not stably URL-quoted here.
- **Medical prescription by drug name** (the brief’s high-value example): nearest is E21 (physician slides blocked) and E40 (boarding pass journalist example). No verified “last winter prescription photo” quote was found.
- **Wedding / college** specific episodes: not found as high-quality unique quotes after duplicate-heavy searches.
- Sample is **self-selected complainers and enthusiasts**, not a usage survey.

---

## Interview validation question

> **Based on real public user evidence, what is the most important unresolved problem in retrieving vaguely remembered photos, and what evidence should we validate through 5–6 user interviews?**

**Most important unresolved problem in this evidence base:** people often remember a **filter** (text, place, person, or class) and need a **complete, time-ordered candidate set** they can recognize — but the current default search either **does not index that clue**, **truncates/re-ranks it without dates**, or **cannot combine** the clue with the container (album, Locked Folder, unlabeled face).

That is **not** the same problem as “natural language is too weak.” NL sometimes **helps** unique scenes (E06, E17, E36) and **hurts** filter jobs (E13, E16, E34).

**Validate in 5–6 interviews (recent real retrieval, think-aloud):**

1. Recreate a **document/screenshot** find using only the word they remember (Archetype A). Did quotes/Classic/Drive matter?
2. Recreate a **trip or “all dogs”** find (Archetype B). Did they need dates on a full list?
3. Recreate a **person** find, including a photo they believe is unlabeled (Archetype C).
4. Recreate a **place without a name** (map vs Places chips) (Archetype D).
5. Recreate a **scene NL** query they think should work (Archetype E) — look for contrast with (2).
6. Ask whether they ever **captioned/renamed** photos so they could find them later (Archetype F) — and whether that still works.

Do not propose an MVP until those interviews confirm which of A–F is the primary job-to-be-done in the target segment.
