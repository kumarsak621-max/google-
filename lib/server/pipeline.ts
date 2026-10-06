import { heuristicAnalyze, textFingerprint } from "../analyze";
import type { Episode, VerificationStatus } from "../types";
import { extraQueriesFromFindings, BEHAVIORAL_QUERIES } from "./queries";
import { fetchPublicPage, webSearch, type SearchHit } from "./search";
import type { ResearchRun } from "./store";

function isRetrievalSnippet(text: string) {
  const t = text.toLowerCase();
  if (t.length < 40) return false;
  if (/storage|unlimited|google one|subscription price/.test(t) && !/search|find|remember/.test(t))
    return false;
  const wants = /photo|picture|screenshot|video|document|receipt/;
  const exists = /i (know|have|took|saved|remember)|exists|backed up/;
  const clue = /remember|date|trip|name|text|face|location|when|where/;
  const attempt = /search|find|look|typed|scroll|album|can't find|cannot find/;
  return wants.test(t) && attempt.test(t) && (exists.test(t) || clue.test(t));
}

function extractQuote(pageText: string, snippet: string) {
  const snip = snippet.replace(/\s+/g, " ").trim();
  if (!snip) return "";
  const idx = pageText.toLowerCase().indexOf(snip.slice(0, 80).toLowerCase());
  if (idx >= 0) {
    return pageText.slice(idx, idx + Math.min(400, snip.length + 80)).trim();
  }
  const m = pageText.match(/I (?:know|remember|took|have|can't find)[^.!?]{20,280}/i);
  return m?.[0] || snip.slice(0, 400);
}

function verifyStatus(pageOk: boolean, quote: string, snippet: string): VerificationStatus {
  if (pageOk && quote && snippet && quote.toLowerCase().includes(snippet.slice(0, 40).toLowerCase()))
    return "VERIFIED";
  if (pageOk && quote) return "PARTIALLY_VERIFIED";
  if (!pageOk) return "INACCESSIBLE";
  return "UNVERIFIED";
}

export type PipelineProgress = (log: string, run: Partial<ResearchRun>) => void;

export async function runLiveResearch(onProgress: PipelineProgress, limitQueries = 8): Promise<Episode[]> {
  const snippets: string[] = [];
  let queries = BEHAVIORAL_QUERIES.slice(0, limitQueries);
  const hits: { query: string; hit: SearchHit }[] = [];
  let pagesFound = 0;

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    onProgress(`Searching: ${q}`, { queries_run: i + 1, pages_found: pagesFound });
    try {
      const results = await webSearch(q, 6);
      pagesFound += results.length;
      for (const hit of results) hits.push({ query: q, hit });
      snippets.push(...results.map((r) => r.snippet));
    } catch (e) {
      onProgress(`Search failed for one query: ${e instanceof Error ? e.message : "error"}`, {
        queries_run: i + 1,
      });
    }
    await new Promise((r) => setTimeout(r, 350));
  }

  const extras = extraQueriesFromFindings(snippets).slice(0, 3);
  for (const q of extras) {
    queries.push(q);
    onProgress(`Follow-up search: ${q}`, { queries_run: queries.length });
    try {
      const results = await webSearch(q, 5);
      pagesFound += results.length;
      for (const hit of results) hits.push({ query: q, hit });
    } catch {
      /* skip */
    }
  }

  const seenUrl = new Set<string>();
  const uniqueHits = hits.filter(({ hit }) => {
    if (seenUrl.has(hit.url)) return false;
    seenUrl.add(hit.url);
    return true;
  });

  onProgress(`Found ${pagesFound} results, ${uniqueHits.length} unique URLs. Reviewing pages…`, {
    pages_found: pagesFound,
  });

  const episodes: Episode[] = [];
  let reviewed = 0;
  let relevant = 0;
  let verified = 0;

  for (const { hit } of uniqueHits.slice(0, 40)) {
    reviewed += 1;
    const blob = `${hit.title} ${hit.snippet} ${hit.content || ""}`;
    if (!isRetrievalSnippet(blob)) {
      onProgress(`Skipped (not a retrieval episode): ${hit.title.slice(0, 60)}`, {
        pages_reviewed: reviewed,
      });
      continue;
    }
    const page = await fetchPublicPage(hit.url);
    const quote = extractQuote(page.text || hit.content || "", hit.snippet);
    const original = quote || hit.snippet;
    if (!original || original.length < 40) continue;
    const row = heuristicAnalyze(
      {
        source: hostLabel(hit.url),
        url: hit.url,
        title: hit.title,
        text: original,
        date: "",
      },
      episodes.length,
    );
    if (row.relevance === "irrelevant") continue;
    relevant += 1;
    const verificationStatus = verifyStatus(page.ok, original, hit.snippet);
    if (verificationStatus === "VERIFIED") verified += 1;
    episodes.push({
      ...row,
      id: `L${String(episodes.length + 1).padStart(3, "0")}`,
      sourceType: hostLabel(hit.url),
      title: hit.title,
      verificationStatus,
      aiInterpretation: row.failureRationale,
    });
    onProgress(`Kept episode from ${hit.url}`, {
      pages_reviewed: reviewed,
      relevant_items: relevant,
      verified_items: verified,
    });
  }

  const fp = new Set<string>();
  const deduped: Episode[] = [];
  for (const e of episodes) {
    const k = textFingerprint(e.rawText);
    if (fp.has(k)) continue;
    fp.add(k);
    deduped.push(e);
  }

  onProgress(`Removed ${episodes.length - deduped.length} near-duplicates.`, {
    duplicates_removed: episodes.length - deduped.length,
    relevant_items: deduped.length,
    verified_items: deduped.filter((e) => e.verificationStatus === "VERIFIED").length,
    pages_reviewed: reviewed,
    pages_found: pagesFound,
    queries_run: queries.length,
  });

  return deduped;
}

function hostLabel(url: string) {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "");
    if (h.includes("reddit")) return "reddit";
    if (h.includes("support.google")) return "google_help_community";
    if (h.includes("quora")) return "quora";
    if (h.includes("apple.com")) return "app_store";
    if (h.includes("play.google")) return "play_store";
    return h;
  } catch {
    return "web";
  }
}
