import type {
  Archetype,
  DataMode,
  Episode,
  FailureCode,
  MemoryDimension,
  OpportunityScores,
} from "./types";
import { FAILURE_LABELS } from "./types";

export const ARCHETYPE_META: Record<
  string,
  Omit<Archetype, "frequency" | "evidenceIds" | "quotes" | "opportunity">
> = {
  "incomplete-set": {
    id: "incomplete-set",
    name: "The keyword is a filter, not the answer",
    coreSituation:
      "User remembers a class (country, pet, birds, event) and needs to scan a complete dated set to recognize the photo.",
    memoryPattern: "Object/place/event class + relative time; weak exact date",
    missingInformation: "Exact date and which instance in a large class",
    searchBehavior: "Single noun; expect chronological gallery",
    failurePoint: "F",
    workaround: "Switch to classic search; demand reverse chronological order",
    frequencyScore: 5,
    severity: 4,
    aiOpportunity: 4,
  },
  "ocr-text": {
    id: "ocr-text",
    name: "I remember a word that was on the thing",
    coreSituation:
      "Utility photos (bills, screenshots, boarding passes, medicine, warranties) retrieved by remembered text, not date.",
    memoryPattern: "Textual + document/screenshot + episode (sick, moving, travel)",
    missingInformation: "Exact date; sometimes exact spelling",
    searchBehavior: "OCR keyword; occasional quotes",
    failurePoint: "D",
    workaround: "Quotation marks; captions; another gallery app",
    frequencyScore: 5,
    severity: 5,
    aiOpportunity: 4,
  },
  "people-index": {
    id: "people-index",
    name: "I remember who, the system does not have a who",
    coreSituation:
      "Family, friends, scans, Polaroids, unlabeled or merged faces.",
    memoryPattern: "Person + social relationship",
    missingInformation: "Detected face and user label; often date",
    searchBehavior: "Name search; People & pets",
    failurePoint: "D",
    workaround: "Write names in captions; cannot force undetected faces",
    frequencyScore: 4,
    severity: 4,
    aiOpportunity: 4,
  },
  "nl-mismatch": {
    id: "nl-mismatch",
    name: "I said the memory in English; it wanted a noun",
    coreSituation:
      "Life stage, clothing, place prepositions, or compositional queries parsed incorrectly — while some NL queries succeed.",
    memoryPattern: "Self + attribute, or unique pet/food episode",
    missingInformation: "The keyword the index actually stores",
    searchBehavior: "Natural language, then fallback to classic nouns",
    failurePoint: "C",
    workaround: "Shorter classic keywords",
    frequencyScore: 4,
    severity: 4,
    aiOpportunity: 5,
  },
  "visual-similarity": {
    id: "visual-similarity",
    name: "I can see it, or I have a new photo of it",
    coreSituation:
      "Appearance or pose remembered; date unknown; seed photo available.",
    memoryPattern: "Visual appearance / composition / distinctive object",
    missingInformation: "Date, object name, searchable metadata",
    searchBehavior: "Want in-library similarity; Lens searches the web",
    failurePoint: "A",
    workaround: "Find more like this if available; external tools",
    frequencyScore: 3,
    severity: 4,
    aiOpportunity: 5,
  },
  "place-unnamed": {
    id: "place-unnamed",
    name: "I remember the land, not the pin",
    coreSituation: "Wilderness, GPS-off travel, unnamed outdoor places.",
    memoryPattern: "Spatial / trip without Maps name",
    missingInformation: "GPS or official place name; often date",
    searchBehavior: "Places keyword; map heatmap on phone",
    failurePoint: "A",
    workaround: "Mobile map; manual location tags",
    frequencyScore: 3,
    severity: 4,
    aiOpportunity: 3,
  },
  "recognition-in-set": {
    id: "recognition-in-set",
    name: "I found the haystack, not the needle",
    coreSituation: "Album or class is known; specific photo cannot be spotted.",
    memoryPattern: "Visual of one item inside a large set",
    missingInformation: "Position, dates inside album",
    searchBehavior: "Open album; in-album find",
    failurePoint: "G",
    workaround: "Favorites; manual paging",
    frequencyScore: 3,
    severity: 4,
    aiOpportunity: 3,
  },
  "user-labels": {
    id: "user-labels",
    name: "I already filed it; search forgot my filing",
    coreSituation: "Captions, filenames, variety tags used as future memory.",
    memoryPattern: "User-authored text",
    missingInformation: "Dates / visual distinctions",
    searchBehavior: "Search own labels",
    failurePoint: "D",
    workaround: "Disable AI search",
    frequencyScore: 3,
    severity: 4,
    aiOpportunity: 2,
  },
  "policy-index": {
    id: "policy-index",
    name: "The photo exists in a vault, policy, or empty index",
    coreSituation:
      "Locked Folder, medical-term blocks, missing year, or search returning nothing while the library exists.",
    memoryPattern: "Document/work/family existence memory",
    missingInformation: "Which corpus slice is searchable",
    searchBehavior: "Keyword search; Settings; another device",
    failurePoint: "K",
    workaround: "Collections, Archive, Classic, leave product",
    frequencyScore: 3,
    severity: 5,
    aiOpportunity: 2,
  },
  "restaurant-food": {
    id: "restaurant-food",
    name: "I remember the dinner, not the dish name",
    coreSituation: "Food episode at a place; too many similar meals.",
    memoryPattern: "Place + food episode + plate visual",
    missingInformation: "Dish name and date",
    searchBehavior: "Place + dinner keywords",
    failurePoint: "E",
    workaround: "Unknown",
    frequencyScore: 2,
    severity: 3,
    aiOpportunity: 4,
  },
  "sequence-event": {
    id: "sequence-event",
    name: "I remember the day after, not the date",
    coreSituation: "Sequence around an event (wedding +1).",
    memoryPattern: "Sequence + people + event",
    missingInformation: "Calendar date",
    searchBehavior: "Event keyword then manual scroll",
    failurePoint: "A",
    workaround: "Open event then scroll later photos",
    frequencyScore: 2,
    severity: 4,
    aiOpportunity: 4,
  },
  "wrong-time": {
    id: "wrong-time",
    name: "I remember the era; the file says today",
    coreSituation: "Scans and downloads with wrong timestamps.",
    memoryPattern: "Decade / family era",
    missingInformation: "True capture date in EXIF",
    searchBehavior: "Year search",
    failurePoint: "D",
    workaround: "Exif repair",
    frequencyScore: 2,
    severity: 3,
    aiOpportunity: 2,
  },
  "policy-vault": {
    id: "policy-vault",
    name: "The photo exists in a different vault, or search is blocked",
    coreSituation: "Locked folder, empty index, medical safety intercept.",
    memoryPattern: "That the item exists somewhere in Photos",
    missingInformation: "Which corpus is searchable",
    searchBehavior: "Main library search",
    failurePoint: "K",
    workaround: "UI hunting; turn off AI",
    frequencyScore: 3,
    severity: 5,
    aiOpportunity: 2,
  },
  "context-fragment": {
    id: "context-fragment",
    name: "The useful clue is on another dimension",
    coreSituation: "Device owner, album, people, time must be joined by hand.",
    memoryPattern: "Social/device context",
    missingInformation: "A combined filter",
    searchBehavior: "Camera model string; mixed filters",
    failurePoint: "I",
    workaround: "Search camera model",
    frequencyScore: 2,
    severity: 3,
    aiOpportunity: 3,
  },
};

function clampScore(n: number): 1 | 2 | 3 | 4 | 5 {
  return Math.max(1, Math.min(5, Math.round(n))) as 1 | 2 | 3 | 4 | 5;
}

export function researchEpisodes(episodes: Episode[]): Episode[] {
  return episodes.filter(
    (e) =>
      e.relevance !== "irrelevant" &&
      e.archetypeId !== "none" &&
      e.strength >= 2,
  );
}

export function uniqueSources(episodes: Episode[]): number {
  return new Set(episodes.map((e) => e.source)).size;
}

export function duplicateGroups(episodes: Episode[]): number {
  return new Set(episodes.map((e) => e.duplicateGroupId)).size;
}

export function countBy<T extends string>(items: T[]): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const i of items) map.set(i, (map.get(i) || 0) + 1);
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function failureCounts(episodes: Episode[]) {
  return countBy(researchEpisodes(episodes).map((e) => e.failureCode)).map(
    (row) => ({
      ...row,
      label: `${row.name} · ${FAILURE_LABELS[row.name as FailureCode]}`,
    }),
  );
}

export function scenarioCounts(episodes: Episode[]) {
  return countBy(researchEpisodes(episodes).map((e) => e.scenario)).slice(0, 12);
}

export function behaviorCounts(episodes: Episode[]) {
  return countBy(researchEpisodes(episodes).flatMap((e) => e.searchBehaviors));
}

export function workaroundCounts(episodes: Episode[]) {
  return countBy(
    researchEpisodes(episodes).map((e) =>
      !e.workaround || e.workaround === "Unknown" || e.workaround === "None"
        ? "No workaround / unknown"
        : e.workaround,
    ),
  );
}

export function outcomeCounts(episodes: Episode[]) {
  return countBy(researchEpisodes(episodes).map((e) => e.outcome));
}

function memoryFlags(e: Episode): Record<MemoryDimension, { remembered: boolean; forgotten: boolean; searchable: boolean }> {
  const t = e.memory.temporal.filter((x) => x !== "unknown");
  const s = e.memory.spatial.filter((x) => x !== "unknown");
  const sem = e.memory.semantic.filter((x) => x !== "unknown");
  const forgot = e.forgot.toLowerCase();
  return {
    Time: {
      remembered: t.length > 0,
      forgotten: /date|month|year|when/.test(forgot) || t.includes("relative_time") || t.length === 0,
      searchable: t.includes("exact_date") || t.includes("month") || t.includes("year"),
    },
    Location: {
      remembered: s.length > 0,
      forgotten: /location|city|place|gps|pin/.test(forgot) || (s.includes("trip") && !s.includes("city")),
      searchable: s.includes("city") || s.includes("country") || s.includes("landmark"),
    },
    People: {
      remembered: sem.includes("person") || e.memory.social.length > 0,
      forgotten: /face|label|name/.test(forgot),
      searchable: sem.includes("person") && !/not (recognized|detected|labeled)/i.test(e.whyFailed),
    },
    Objects: {
      remembered: sem.includes("object") || sem.includes("product") || sem.includes("animal"),
      forgotten: /name|species/.test(forgot),
      searchable: true,
    },
    Events: {
      remembered: sem.includes("event"),
      forgotten: /date/.test(forgot),
      searchable: false,
    },
    Context: {
      remembered: e.memory.contextual.length > 0,
      forgotten: true,
      searchable: false,
    },
    "Visual appearance": {
      remembered: e.memory.visual.length > 0,
      forgotten: /looked|appearance/.test(forgot) || e.memory.visual.length > 0 && e.query.toLowerCase().includes("like"),
      searchable: e.searchBehaviors.some((b) => /natural|visual/i.test(b)),
    },
    Text: {
      remembered: e.memory.textual.length > 0,
      forgotten: /word|spelling|caption/.test(forgot),
      searchable: e.memory.textual.length > 0 && e.failureCode !== "D",
    },
    "Social relationships": {
      remembered: e.memory.social.length > 0,
      forgotten: /label|face/.test(forgot),
      searchable: false,
    },
    "Sequence/order": {
      remembered: t.includes("sequence"),
      forgotten: t.includes("sequence"),
      searchable: false,
    },
    "Emotional/contextual associations": {
      remembered: e.memory.contextual.some((c) => /sick|university|relationship|task/.test(c)),
      forgotten: true,
      searchable: false,
    },
  };
}

export function memoryMap(episodes: Episode[]) {
  const eps = researchEpisodes(episodes);
  const dims: MemoryDimension[] = [
    "Time",
    "Location",
    "People",
    "Objects",
    "Events",
    "Context",
    "Visual appearance",
    "Text",
    "Social relationships",
    "Sequence/order",
    "Emotional/contextual associations",
  ];
  return dims.map((dim) => {
    let remembered = 0;
    let forgotten = 0;
    let searchable = 0;
    const ids: string[] = [];
    for (const e of eps) {
      const f = memoryFlags(e)[dim];
      if (f.remembered) {
        remembered += 1;
        ids.push(e.id);
      }
      if (f.forgotten) forgotten += 1;
      if (f.searchable) searchable += 1;
    }
    return { dim, remembered, forgotten, searchable, ids: ids.slice(0, 8) };
  });
}

const FUNNEL_STAGES = [
  {
    id: "exists",
    name: "Remember photo exists",
    behavior: "User is confident a photo is in the library.",
    fail: "Wrong account/vault (rare in this corpus).",
    opportunity: "Not the core vague-memory metric.",
  },
  {
    id: "recall",
    name: "Recall clues",
    behavior: "People, episode, object class, text, visual, relative time.",
    fail: "Date and precise names are typically missing.",
    opportunity: "Prompt for the strongest remaining dimension.",
  },
  {
    id: "express",
    name: "Express clues",
    behavior: "One keyword or a full English sentence.",
    fail: "A/B — cannot translate episode/visual; quotes unknown.",
    opportunity: "Help map memory → attributes without requiring expert syntax.",
  },
  {
    id: "search",
    name: "Search",
    behavior: "Classic noun, OCR string, person name, or Ask Photos.",
    fail: "C — NL misparse; K — policy/index.",
    opportunity: "Route nouns to complete-set search; NL to compositional search.",
  },
  {
    id: "candidates",
    name: "Receive candidates",
    behavior: "Expect a dated pile; receive Best Matches or nothing.",
    fail: "F/D/E — truncation, missing index, noise.",
    opportunity: "Always attach a complete time-ordered candidate set.",
  },
  {
    id: "evaluate",
    name: "Evaluate candidates",
    behavior: "Scan thumbs; need dates and faces.",
    fail: "G — cannot tell which event/day.",
    opportunity: "Show dates, bursts, and people on the grid.",
  },
  {
    id: "refine",
    name: "Refine",
    behavior: "Swap keywords, add quotes, disable AI, guess years.",
    fail: "H/J — no systematic next clue.",
    opportunity: "After miss, ask who / when / where / text / look.",
  },
  {
    id: "recognize",
    name: "Recognize correct photo",
    behavior: "Match visual memory to a thumb.",
    fail: "G — album of 1400; relevance order.",
    opportunity: "Jump-to-in-album; in-set object search.",
  },
  {
    id: "success",
    name: "Successful retrieval",
    behavior: "Open the intended photo.",
    fail: "Workaround success ≠ first-search success.",
    opportunity: "Measure first-session success on incomplete queries.",
  },
] as const;

export function funnel(episodes: Episode[]) {
  const eps = researchEpisodes(episodes);
  const n = eps.length;
  const failed = eps.filter((e) => e.outcome === "failed").length;
  const succeeded = eps.filter((e) => e.outcome === "succeeded").length;
  const expressFail = eps.filter((e) => e.failureCode === "A" || e.failureCode === "B").length;
  const searchFail = eps.filter((e) => e.failureCode === "C" || e.failureCode === "K").length;
  const candidateFail = eps.filter((e) => ["D", "E", "F"].includes(e.failureCode)).length;
  const evalFail = eps.filter((e) => e.failureCode === "G").length;
  const refineFail = eps.filter((e) => e.failureCode === "H" || e.failureCode === "J").length;
  const frag = eps.filter((e) => e.failureCode === "I").length;

  const counts = [
    n,
    n,
    n - Math.round(expressFail * 0),
    n,
    n,
    n,
    n,
    n,
    succeeded,
  ];

  return FUNNEL_STAGES.map((stage, i) => {
    const related =
      i === 2
        ? expressFail
        : i === 3
          ? searchFail
          : i === 4
            ? candidateFail
            : i === 5
              ? evalFail + frag
              : i === 6
                ? refineFail
                : i === 7
                  ? evalFail
                  : i === 8
                    ? succeeded
                    : n;
    const ids = eps
      .filter((e) => {
        if (i === 2) return e.failureCode === "A" || e.failureCode === "B";
        if (i === 3) return e.failureCode === "C" || e.failureCode === "K";
        if (i === 4) return ["D", "E", "F"].includes(e.failureCode);
        if (i === 5 || i === 7) return e.failureCode === "G" || e.failureCode === "I";
        if (i === 6) return e.failureCode === "H" || e.failureCode === "J";
        if (i === 8) return e.outcome === "succeeded";
        return true;
      })
      .map((e) => e.id)
      .slice(0, 6);
    return {
      ...stage,
      evidenceCount: n,
      stageEvidence: related,
      failed,
      succeeded,
      qualitativeNote:
        "Counts are episode tallies among analyzed conversations, not measured conversion rates.",
      ids,
    };
  });
}

export function scoreArchetype(eps: Episode[], id: string): OpportunityScores {
  const items = researchEpisodes(eps).filter((e) => e.archetypeId === id);
  const meta = ARCHETYPE_META[id];
  const avgStrength =
    items.reduce((s, e) => s + e.strength, 0) / Math.max(1, items.length);
  const failShare = items.filter((e) => e.outcome === "failed").length / Math.max(1, items.length);
  const frequency = clampScore(1 + (items.length / Math.max(2, researchEpisodes(eps).length)) * 10);
  const severity = meta?.severity ?? clampScore(2 + failShare * 3);
  const evidenceStrength = clampScore(avgStrength);
  const strategicRelevance = ["incomplete-set", "ocr-text", "visual-similarity", "nl-mismatch", "people-index"].includes(id)
    ? 5
    : 3;
  const affectedUsers = frequency;
  const aiLeverage = meta?.aiOpportunity ?? 3;
  const feasibility = id === "incomplete-set" || id === "user-labels" ? 4 : id === "visual-similarity" ? 3 : 3;
  const differentiation = id === "visual-similarity" || id === "sequence-event" ? 5 : id === "incomplete-set" ? 3 : 3;
  const overall = Number(
    (
      strategicRelevance * 0.2 +
      severity * 0.15 +
      frequency * 0.15 +
      evidenceStrength * 0.15 +
      affectedUsers * 0.1 +
      aiLeverage * 0.1 +
      feasibility * 0.1 +
      differentiation * 0.05
    ).toFixed(2),
  );
  const whyAttractive =
    id === "incomplete-set"
      ? "Highest overlap with the business metric: people start searching with a fuzzy class and fail because the product answers a unique lookup instead of assembling a recognizable dated set. Not selected only because the number is high — Classic often already contains the photo."
      : id === "ocr-text"
        ? "When date is missing, text-in-image is the actual retrieval strategy for high-stakes utility photos. Pain is severe; representation is the bottleneck."
        : "Scored from cluster size, outcome mix, and how directly the memory-search gap maps to incomplete-metadata retrieval.";
  return {
    frequency,
    severity,
    evidenceStrength,
    strategicRelevance,
    affectedUsers,
    aiLeverage,
    feasibility,
    differentiation,
    overall,
    whyAttractive,
  };
}

export function buildArchetypes(episodes: Episode[]): Archetype[] {
  const eps = researchEpisodes(episodes);
  const ids = [...new Set(eps.map((e) => e.archetypeId).filter((id) => id && id !== "none"))];
  return ids
    .map((id) => {
      const items = eps.filter((e) => e.archetypeId === id);
      const meta = ARCHETYPE_META[id] ?? {
        id,
        name: id,
        coreSituation: "Discovered from uploaded evidence.",
        memoryPattern: "See evidence",
        missingInformation: "See evidence",
        searchBehavior: countBy(items.flatMap((e) => e.searchBehaviors))[0]?.name ?? "Unknown",
        failurePoint: (countBy(items.map((e) => e.failureCode))[0]?.name ?? "K") as FailureCode,
        workaround: countBy(items.map((e) => e.workaround))[0]?.name ?? "Unknown",
        frequencyScore: 3 as const,
        severity: 3 as const,
        aiOpportunity: 3 as const,
      };
      return {
        ...meta,
        frequency: items.length,
        evidenceIds: items.map((e) => e.id),
        quotes: items.map((e) => e.rawText.split("\n\n").slice(-1)[0] ?? e.rawText).slice(0, 3),
        opportunity: scoreArchetype(episodes, id),
      };
    })
    .sort((a, b) => b.opportunity.overall - a.opportunity.overall);
}

export function recommendedArchetype(episodes: Episode[]): Archetype | undefined {
  const all = buildArchetypes(episodes);
  const preferred = all.find((a) => a.id === "incomplete-set");
  return preferred ?? all[0];
}

export interface Hypothesis {
  id: string;
  hypothesis: string;
  supportIds: string[];
  contradictIds: string[];
  confidence: "High" | "Medium" | "Low";
  interviewQuestion: string;
}

export function hypotheses(episodes: Episode[]): Hypothesis[] {
  const eps = researchEpisodes(episodes);
  const by = (pred: (e: Episode) => boolean) => eps.filter(pred).map((e) => e.id);
  return [
    {
      id: "H1",
      hypothesis:
        "Users treat object/place nouns as filters to browse by time, not as unique IDs.",
      supportIds: by((e) => e.archetypeId === "incomplete-set"),
      contradictIds: by((e) => e.archetypeId === "nl-mismatch" && e.outcome === "succeeded"),
      confidence: "High",
      interviewQuestion:
        "Walk through your last failed search: what did you type first, and what did you expect the grid to look like?",
    },
    {
      id: "H2",
      hypothesis:
        "When date is missing, the strongest retrievable clue is text-in-image or a person, not a scene description.",
      supportIds: by((e) => e.archetypeId === "ocr-text" || e.archetypeId === "people-index"),
      contradictIds: by((e) => e.archetypeId === "visual-similarity" || (e.archetypeId === "nl-mismatch" && e.outcome === "succeeded")),
      confidence: "Medium",
      interviewQuestion:
        "If you could not remember the date, which clue would you type first: a word on the photo, a person, a place, or how it looked?",
    },
    {
      id: "H3",
      hypothesis: "Users abandon after 1–2 reformulations unless a mode switch is obvious.",
      supportIds: by((e) => /switch|classic|quotes|disable/i.test(e.workaround) || e.failureCode === "J" || e.failureCode === "H"),
      contradictIds: by((e) => /exif|caption|manual paging/i.test(e.workaround)),
      confidence: "Medium",
      interviewQuestion: "How many tries before you scrolled the timeline, changed settings, or quit?",
    },
    {
      id: "H4",
      hypothesis:
        "The photo is often in a result set the user cannot recognize without dates or because the set is truncated.",
      supportIds: by((e) => e.failureCode === "F" || e.failureCode === "G"),
      contradictIds: by((e) => e.failureCode === "D" && e.outcome === "failed"),
      confidence: "High",
      interviewQuestion:
        "If I showed you a full dated grid for the same keyword, would you recognize the photo without new clues?",
    },
    {
      id: "H5",
      hypothesis:
        "Users do not know they must label faces or quote text — formulation, not ranking.",
      supportIds: by((e) => e.failureCode === "B" || /quote|label/i.test(e.workaround + e.whyFailed)),
      contradictIds: by((e) => e.searchBehaviors.includes("Quoted search") && e.outcome === "succeeded"),
      confidence: "Medium",
      interviewQuestion: "Show them a screenshot and ask them to find it by a remembered word — do they use quotes?",
    },
    {
      id: "H6",
      hypothesis:
        "Partner/locked/archive vaults cause “I know it exists” failures that look like search quality.",
      supportIds: by((e) => e.archetypeId === "policy-vault" || e.archetypeId === "context-fragment"),
      contradictIds: by((e) => e.archetypeId === "incomplete-set"),
      confidence: "Medium",
      interviewQuestion: "Where was the last missed photo actually stored?",
    },
    {
      id: "H7",
      hypothesis:
        "Sequence and episode (“the day after”, “when I was sick”) are common in memory and rare as successful queries.",
      supportIds: by((e) => e.memory.temporal.includes("sequence") || e.memory.contextual.length > 0),
      contradictIds: by((e) => e.archetypeId === "nl-mismatch" && e.outcome === "succeeded"),
      confidence: "Medium",
      interviewQuestion:
        "Tell the memory out loud before using the app; compare that story to what you type.",
    },
    {
      id: "H8",
      hypothesis: "Natural-language search helps unique visual/compositional memories and hurts class nouns.",
      supportIds: by((e) => e.archetypeId === "nl-mismatch"),
      contradictIds: by((e) => e.id === "D16" || e.id === "D17" || e.id === "D29"),
      confidence: "High",
      interviewQuestion:
        "Try one class noun and one descriptive sentence for the same photo. Which grid can you recognize from?",
    },
  ].map((h) => ({
    ...h,
    confidence:
      h.supportIds.length >= 5 && h.contradictIds.length <= 3
        ? "High"
        : h.supportIds.length >= 2
          ? "Medium"
          : "Low",
  }));
}

export function insights(episodes: Episode[]) {
  const eps = researchEpisodes(episodes);
  const archetypes = buildArchetypes(episodes);
  const rec = recommendedArchetype(episodes);
  const strong = eps.filter((e) => e.strength >= 4);
  return {
    totalItems: episodes.length,
    episodes: eps.length,
    strong: strong.length,
    verified: episodes.filter((e) => e.verificationStatus === "VERIFIED").length,
    partial: episodes.filter((e) => e.verificationStatus === "PARTIALLY_VERIFIED").length,
    succeeded: eps.filter((e) => e.outcome === "succeeded").length,
    failed: eps.filter((e) => e.outcome === "failed").length,
    partialOutcome: eps.filter((e) => e.outcome === "partial").length,
    sources: uniqueSources(episodes),
    archetypes: archetypes.length,
    mostCommonFailure: failureCounts(episodes)[0],
    highestOpportunity: rec,
    topProblems: archetypes.slice(0, 8),
    contradictions: hypotheses(episodes),
    limitations:
      "Public online discussions are not representative of all Google Photos users. They are directional qualitative evidence and may overrepresent users experiencing problems. Among analyzed public conversations — or synthetic demo episodes — counts are not population prevalence. Requires validation through primary research.",
  };
}

export function modeLabel(mode: DataMode) {
  return mode === "demo" ? "Synthetic Demo Data" : "Research Evidence";
}
