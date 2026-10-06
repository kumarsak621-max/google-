import {
  buildArchetypes,
  failureCounts,
  funnel,
  hypotheses,
  insights,
  memoryMap,
  recommendedArchetype,
  researchEpisodes,
} from "./analytics";
import type { Episode } from "./types";
import { FAILURE_LABELS } from "./types";

function csvEscape(v: unknown) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function evidenceCsv(episodes: Episode[]) {
  const headers = [
    "id",
    "synthetic",
    "source",
    "sourceType",
    "url",
    "date",
    "original_quote",
    "scenario",
    "remembers",
    "forgot",
    "query",
    "outcome",
    "failureCode",
    "workaround",
    "strength",
    "verificationStatus",
    "aiInterpretation",
    "archetypeId",
    "duplicateGroupId",
  ];
  const rows = episodes.map((e) =>
    [
      e.id,
      e.synthetic,
      e.source,
      e.sourceType || "",
      e.url,
      e.date,
      e.rawText,
      e.scenario,
      e.remembers,
      e.forgot,
      e.query,
      e.outcome,
      e.failureCode,
      e.workaround,
      e.strength,
      e.verificationStatus || "",
      e.aiInterpretation || "",
      e.archetypeId,
      e.duplicateGroupId,
    ]
      .map(csvEscape)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function opportunityCsv(episodes: Episode[]) {
  const arch = buildArchetypes(episodes);
  const headers = [
    "id",
    "name",
    "n",
    "frequency",
    "severity",
    "evidenceStrength",
    "strategicRelevance",
    "aiLeverage",
    "feasibility",
    "differentiation",
    "overall",
    "whyAttractive",
  ];
  const rows = arch.map((a) =>
    [
      a.id,
      a.name,
      a.frequency,
      a.opportunity.frequency,
      a.opportunity.severity,
      a.opportunity.evidenceStrength,
      a.opportunity.strategicRelevance,
      a.opportunity.aiLeverage,
      a.opportunity.feasibility,
      a.opportunity.differentiation,
      a.opportunity.overall,
      a.opportunity.whyAttractive,
    ]
      .map(csvEscape)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function hypothesesCsv(episodes: Episode[]) {
  const hs = hypotheses(episodes);
  const headers = ["id", "hypothesis", "support", "contradict", "confidence", "interviewQuestion"];
  const rows = hs.map((h) =>
    [h.id, h.hypothesis, h.supportIds.join(" "), h.contradictIds.join(" "), h.confidence, h.interviewQuestion]
      .map(csvEscape)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function researchReport(episodes: Episode[], mode: string) {
  const i = insights(episodes);
  const rec = recommendedArchetype(episodes);
  const eps = researchEpisodes(episodes);
  const arch = buildArchetypes(episodes);
  const mem = memoryMap(episodes);
  const fun = funnel(episodes);
  const hs = hypotheses(episodes);
  const fails = failureCounts(episodes);

  return `# Photo Retrieval Discovery Report

Mode: ${mode === "demo" ? "SYNTHETIC DEMO DATA — NOT REAL USER EVIDENCE" : "Research Evidence"}

AI discovery is a hypothesis generator, not a substitute for primary user research.

## 1. Executive summary

Among analyzed conversations, ${eps.length} retrieval episodes were coded from ${i.totalItems} items across ${i.sources} sources.

Strongest observed problem: ${rec?.name ?? "Unknown"}
Why: ${rec?.opportunity.whyAttractive ?? ""}

Limitation: ${i.limitations}

## 2. Dataset description

- Total items: ${i.totalItems}
- Retrieval episodes (relevant/possibly relevant, strength ≥2): ${eps.length}
- Strength 4–5 items: ${i.strong}
- Archetypes: ${i.archetypes}
- Most common failure code: ${fails[0]?.name} ${fails[0] ? FAILURE_LABELS[fails[0].name as keyof typeof FAILURE_LABELS] : ""}

## 3. Retrieval archetypes

${arch
  .map(
    (a) => `### ${a.name}
- Episodes: ${a.frequency}
- Failure: ${a.failurePoint}
- Opportunity overall: ${a.opportunity.overall}
- Evidence IDs: ${a.evidenceIds.join(", ")}
- Situation: ${a.coreSituation}
`,
  )
  .join("\n")}

## 4. Memory map

${mem.map((m) => `- ${m.dim}: remembered ${m.remembered}, forgotten ${m.forgotten}, searchable-ish ${m.searchable}`).join("\n")}

## 5. Failure funnel

Counts are qualitative episode tallies, not conversion rates.

${fun.map((s) => `- ${s.name}: related episodes ${s.stageEvidence} / ${s.evidenceCount}. ${s.behavior}`).join("\n")}

## 6. Opportunity matrix

Recommended: ${rec?.name}
${rec?.opportunity.whyAttractive}

${arch.map((a) => `- ${a.name}: overall ${a.opportunity.overall}`).join("\n")}

## 7. Evidence table

${eps.map((e) => `- ${e.id} [${e.strength}] ${e.source} | ${e.scenario} | fail ${e.failureCode} | ${e.url}`).join("\n")}

## 8. Contradictions

${hs
  .map(
    (h) => `### ${h.id} ${h.hypothesis}
Support: ${h.supportIds.length} (${h.supportIds.join(", ")})
Contradict: ${h.contradictIds.length} (${h.contradictIds.join(", ")})
Confidence: ${h.confidence}
`,
  )
  .join("\n")}

## 9. Interview hypotheses

${hs.map((h) => `- ${h.id}: ${h.hypothesis}\n  Q: ${h.interviewQuestion}`).join("\n")}

### Recommended participant

Users who attempted to retrieve a Google Photos image using contextual/episodic memory rather than an exact date or filename.

Inclusion: library large enough that scrolling is implausible; at least one reconstructable retrieval story; backup enabled.
Exclusion: missing backup/account only; never uses Search; Google employees; minors; generic AI dislike with no retrieval attempt.

Screeners:
1. Last time you needed a specific photo and did not remember the exact date — what did you type first?
2. Did you find it? How?
3. Was it a document/screenshot, a person, a trip, or something you could picture but not name?
4. Do you use Ask, classic search, or both?
5. Have you searched for text you remembered seeing in a photo?

## 10. Research limitations

${i.limitations}
`;
}

export function download(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
