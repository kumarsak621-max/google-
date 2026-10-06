import type {
  Episode,
  FailureCode,
  IngestRow,
  MemorySignals,
  Outcome,
  Relevance,
  SemanticMemory,
  SpatialMemory,
  TemporalMemory,
} from "./types";

const SYNTHETIC_BANNER = "SYNTHETIC DEMO DATA — NOT REAL USER EVIDENCE";

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function textFingerprint(text: string): string {
  return norm(text)
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .slice(0, 240);
}

function classifyRelevance(text: string): Relevance {
  const t = norm(text);
  if (t.length < 20) return "irrelevant";
  const retrieval =
    /search|find|found|can't find|cannot find|looking for|retrieve|query|typed|screenshot|album|photos of|google photos/.test(
      t,
    );
  const memory = /remember|forgot|don't remember|date|trip|wedding|receipt|screenshot|face|location/.test(
    t,
  );
  if (/terrible|sucks|hate it|one star/.test(t) && !retrieval) return "irrelevant";
  if (retrieval && memory) return "relevant";
  if (retrieval || memory) return "possibly_relevant";
  return "irrelevant";
}

function pick<T extends string>(text: string, rules: [RegExp, T][], fallback: T): T[] {
  const hits = rules.filter(([re]) => re.test(text)).map(([, v]) => v);
  return hits.length ? [...new Set(hits)] : [fallback];
}

function extractMemory(text: string): MemorySignals {
  const t = norm(text);
  const temporal = pick<TemporalMemory>(
    t,
    [
      [/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|exact date/, "exact_date"],
      [/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/, "month"],
      [/\b(19|20)\d{2}\b|1970s|1980s/, "year"],
      [/\b(winter|spring|summer|fall|autumn)\b/, "season"],
      [/\b(last year|years ago|when i was|three years|yesterday)\b/, "relative_time"],
      [/\b(day after|the next morning|sequence|after the wedding)\b/, "sequence"],
    ],
    "unknown",
  );
  const spatial = pick<SpatialMemory>(
    t,
    [
      [/\b(france|country|europe|india)\b/, "country"],
      [/\b(london|paris|stanley|city|goa)\b/, "city"],
      [/\b(hotel|backyard|bar|venue|wilderness)\b/, "location"],
      [/\b(yosemite|landmark)\b/, "landmark"],
      [/\b(neighborhood|campus)\b/, "neighborhood"],
      [/\b(trip|travel|vacation|travelling)\b/, "trip"],
    ],
    "unknown",
  );
  const semantic = pick<SemanticMemory>(
    t,
    [
      [/\b(dad|sister|friends|baby|me |person|face|grandmother|siblings)\b/, "person"],
      [/\b(object|item|box|machinery|excavator)\b/, "object"],
      [/\b(food|dinner|meal|dish|restaurant|brunch|fruit)\b/, "food"],
      [/\b(dog|dogs|bird|birds|kookaburra|corgi|cat|poodle|puppy)\b/, "animal"],
      [/\b(bill|document|prescription|receipt|warranty|boarding pass)\b/, "document"],
      [/\b(screenshot|text message|meme)\b/, "screenshot"],
      [/\b(medicine|progressive|product|supplier)\b/, "product"],
      [/\b(wedding|birthday|halloween|milestone|party)\b/, "event"],
    ],
    "unknown",
  );
  const contextual: string[] = [];
  if (/sick|medicine/.test(t)) contextual.push("when sick");
  if (/college|university/.test(t)) contextual.push("at university");
  if (/mov(ing|ed) house/.test(t)) contextual.push("while moving house");
  if (/vacation|trip|travel/.test(t)) contextual.push("during vacation");
  if (/wedding|after/.test(t)) contextual.push("after an event");
  if (/work|colleague|supplier/.test(t)) contextual.push("work");
  const visual: string[] = [];
  if (/red dress|color/.test(t)) visual.push("color", "clothing");
  if (/arms crossed|pose/.test(t)) visual.push("pose");
  if (/looked|distinct|appearance|polaroid/.test(t)) visual.push("appearance");
  const textual: string[] = [];
  if (/bill|receipt|document|prescription|boarding/.test(t)) textual.push("document");
  if (/screenshot|message|quote/.test(t)) textual.push("screenshot");
  if (/caption|renamed|keyword/.test(t)) textual.push("caption");
  if (/medicine|drug/.test(t)) textual.push("medicine name");
  const social: string[] = [];
  if (/family|dad|grandmother|siblings|sister/.test(t)) social.push("family");
  if (/friend|college/.test(t)) social.push("friend");
  if (/spouse|partner|couple/.test(t)) social.push("partner");
  if (/colleague/.test(t)) social.push("colleague");
  return { temporal, spatial, semantic, contextual, visual, textual, social };
}

function failureFromText(text: string): { code: FailureCode; why: string } {
  const t = norm(text);
  if (/best match|only \d+ photos|no more results|truncated|not all/.test(t))
    return { code: "F", why: "Results appear truncated or ranked as a short unique set." };
  if (/too many|hundreds|noise|unrelated/.test(t))
    return { code: "E", why: "Too many plausible candidates." };
  if (/cannot tell|recognize|scan|1400|album/.test(t))
    return { code: "G", why: "User struggles to identify the correct photo in a set." };
  if (/quote|how to search|don't know what to type/.test(t))
    return { code: "B", why: "User has clues but not the query syntax." };
  if (/looked like|day after|cannot describe/.test(t))
    return { code: "A", why: "Memory does not translate into searchable attributes." };
  if (/face not|not recognised|ocr|text search|caption|gps|location tags/.test(t))
    return { code: "D", why: "Remembered information is missing from the searchable index." };
  if (/misunderstood|thought i wanted|natural language|ask photos/.test(t))
    return { code: "C", why: "Product did not interpret the query as intended." };
  if (/what to try|give up|no help/.test(t))
    return { code: "J", why: "Little help after unsuccessful search." };
  if (/locked|policy|blocked|index|nothing comes up/.test(t))
    return { code: "K", why: "Vault, policy, or index issue." };
  if (/combine|people and place|fragment/.test(t))
    return { code: "I", why: "Clues sit on multiple unconnected dimensions." };
  return { code: "K", why: "Insufficient detail to assign a more specific failure." };
}

function archetypeFrom(code: FailureCode, mem: MemorySignals, text: string): string {
  const t = norm(text);
  if (mem.textual.length && /receipt|bill|screenshot|boarding|medicine|ocr|text/.test(t))
    return "ocr-text";
  if (mem.semantic.includes("person") || /face|grandmother|siblings/.test(t)) return "people-index";
  if (/like this|arms crossed|distinct item|older photo of/.test(t)) return "visual-similarity";
  if (/wilderness|gps|location tags|heatmap|places/.test(t)) return "place-unnamed";
  if (/album|1400|poodle/.test(t)) return "recognition-in-set";
  if (/caption|renamed|tagged/.test(t)) return "user-labels";
  if (/dinner|hotel|dish|restaurant/.test(t)) return "restaurant-food";
  if (/day after|sequence/.test(t)) return "sequence-event";
  if (/1970|timestamp|sorted as today/.test(t)) return "wrong-time";
  if (/locked|blocked|march and nothing/.test(t)) return "policy-vault";
  if (code === "F" || code === "G") return "incomplete-set";
  if (code === "C") return "nl-mismatch";
  if (code === "I") return "context-fragment";
  return "incomplete-set";
}

function strengthOf(text: string, relevance: Relevance): 1 | 2 | 3 | 4 | 5 {
  if (relevance === "irrelevant") return 1;
  const t = norm(text);
  const hasTask = /find|search|looking for|retrieve/.test(t);
  const hasClue = /remember|forgot|date|trip|name|text/.test(t);
  const hasQuery = /search(?:ed|ing)? ['"]|typed|query|looked up/.test(t) || /searching ['"]?\w+/.test(t);
  const hasOutcome = /found|nothing|no results|worked|failed|instead/.test(t);
  const score = [hasTask, hasClue, hasQuery, hasOutcome].filter(Boolean).length;
  if (score >= 4) return 5;
  if (score === 3) return 4;
  if (score === 2) return 3;
  if (relevance === "possibly_relevant") return 2;
  return 2;
}

function outcomeOf(text: string): Outcome {
  const t = norm(text);
  if (/instantly showed|now name search works|found the matching|successfully/.test(t) && !/cannot|doesn't|nothing/.test(t))
    return "succeeded";
  if (/nothing|no results|doesn't find|cannot find|failed/.test(t)) return "failed";
  if (/classic search|workaround|quotes|switch/.test(t)) return "partial";
  return "unknown";
}

export function heuristicAnalyze(row: IngestRow, index: number): Episode {
  const raw = row.text?.trim() || "";
  const relevance = classifyRelevance(raw);
  const memory = extractMemory(raw);
  const { code, why } = failureFromText(raw);
  const fp = textFingerprint(raw);
  const quoted = raw.match(/['"]([^'"]{2,40})['"]/g);
  const query = quoted?.map((q) => q.replace(/['"]/g, "")).join("; ") || "Unknown";
  return {
    id: `R${String(index + 1).padStart(3, "0")}`,
    mode: "research",
    synthetic: false,
    relevance,
    source: row.source || "Uploaded",
    url: row.url || "",
    date: row.date || "Unknown",
    title: row.title || raw.slice(0, 72) || "Untitled",
    author: row.author || "Unknown",
    rawText: raw,
    scenario:
      relevance === "irrelevant"
        ? "Unknown"
        : raw.split(/[.!?]/)[0]?.trim().slice(0, 160) || "Unknown",
    remembers: memory.semantic.filter((s) => s !== "unknown").join(", ") || "Unknown",
    forgot: /date/.test(norm(raw)) ? "Exact date (mentioned)" : "Unknown",
    query,
    searchStrategy: query === "Unknown" ? "Unknown" : "Keyword from quoted terms",
    refinements: /then|again|instead/.test(norm(raw)) ? "Mentioned reformulation" : "Unknown",
    outcome: outcomeOf(raw),
    succeeded: outcomeOf(raw) === "succeeded" ? true : outcomeOf(raw) === "failed" ? false : null,
    whyFailed: relevance === "irrelevant" ? "Unknown — no retrieval episode described" : why,
    workaround: /classic|quote|caption|timeline|map/.test(norm(raw))
      ? "Mentioned in text"
      : "Unknown",
    failureCode: relevance === "irrelevant" ? "K" : code,
    failureRationale: why,
    memory,
    strength: strengthOf(raw, relevance),
    archetypeId: relevance === "irrelevant" ? "none" : archetypeFrom(code, memory, raw),
    duplicateGroupId: fp || `solo-${index}`,
    searchBehaviors: quoted ? ["keyword search"] : [],
    verificationStatus: row.url ? "UNVERIFIED" : "UNVERIFIED",
    aiInterpretation: "Heuristic extraction from uploaded text. Not a user quote.",
  };
}

export function assignDuplicateGroups(episodes: Episode[]): Episode[] {
  const map = new Map<string, string>();
  let n = 1;
  return episodes.map((e) => {
    const fp = textFingerprint(e.rawText.replace(SYNTHETIC_BANNER, ""));
    if (!map.has(fp)) map.set(fp, `dup-${n++}`);
    return { ...e, duplicateGroupId: e.duplicateGroupId || map.get(fp)! };
  });
}
