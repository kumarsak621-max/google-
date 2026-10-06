"use client";

import Link from "next/link";
import { useStore } from "@/components/Providers";
import {
  behaviorCounts,
  buildArchetypes,
  failureCounts,
  hypotheses,
  insights,
  memoryMap,
  researchEpisodes,
  workaroundCounts,
} from "@/lib/analytics";
import { download, researchReport } from "@/lib/exports";
import { FAILURE_LABELS } from "@/lib/types";

export default function ReportPage() {
  const { episodes, mode } = useStore();
  const i = insights(episodes);
  const eps = researchEpisodes(episodes);
  const mem = memoryMap(episodes);
  const arch = buildArchetypes(episodes);
  const hs = hypotheses(episodes);

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-medium">Research report</h1>
        <button
          className="rounded-full border border-line px-3 py-1 text-sm"
          onClick={() => download("research-report.md", researchReport(episodes, mode), "text/markdown")}
        >
          Export Research Report
        </button>
      </div>
      {mode === "demo" && (
        <p className="rounded bg-[#fef7e0] p-3 text-sm">SYNTHETIC DEMO DATA — NOT REAL USER EVIDENCE</p>
      )}
      <p className="text-sm text-muted">{i.limitations}</p>
      <p className="text-sm text-muted">
        AI-generated interpretations are hypotheses derived from evidence and should not be treated as
        direct user statements.
      </p>

      <section>
        <h2 className="text-lg font-medium">Executive Summary</h2>
        <p className="text-sm">
          Among {eps.length} retrieval episodes in this dataset ({i.strong} at strength 4–5; {i.verified}{" "}
          VERIFIED; {i.partial} PARTIALLY_VERIFIED), the recurring job is retrieving a photo from one
          incomplete clue. Highest-opportunity cluster in this set: {i.highestOpportunity?.name ?? "n/a"}.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">Evidence Coverage</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>Items: {i.totalItems}</li>
          <li>Episodes: {eps.length}</li>
          <li>Succeeded / failed / partial: {i.succeeded} / {i.failed} / {i.partialOutcome}</li>
          <li>Sources: {i.sources}</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">What Users Remember</h2>
        <ul className="list-disc pl-5 text-sm">
          {mem.slice(0, 8).map((m) => (
            <li key={m.dim}>
              {m.dim}: remembered in {m.remembered} episodes, forgotten/absent in {m.forgotten}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">Search Behaviors</h2>
        <ul className="list-disc pl-5 text-sm">
          {behaviorCounts(episodes).map((b) => (
            <li key={b.name}>
              {b.name}: {b.value}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">Retrieval Failure Points</h2>
        <ul className="list-disc pl-5 text-sm">
          {failureCounts(episodes).map((f) => (
            <li key={f.name}>
              {f.name} {FAILURE_LABELS[f.name as keyof typeof FAILURE_LABELS]}: {f.value}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">Workarounds</h2>
        <ul className="list-disc pl-5 text-sm">
          {workaroundCounts(episodes).map((w) => (
            <li key={w.name}>
              {w.name}: {w.value}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">Retrieval Archetypes</h2>
        {arch.map((a) => (
          <div key={a.id} className="mt-3 rounded border border-line p-3 text-sm">
            <div className="font-medium">{a.name}</div>
            <p>{a.coreSituation}</p>
            <p className="text-muted">
              n={a.frequency} · opportunity {a.opportunity.overall}
            </p>
            <p>
              Evidence:{" "}
              {a.evidenceIds.map((id) => (
                <Link key={id} href={`/app/evidence/${id}`} className="mr-2">
                  {id}
                </Link>
              ))}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-medium">Contradicting Evidence</h2>
        {hs.map((h) => (
          <div key={h.id} className="mt-3 text-sm">
            <div className="font-medium">
              {h.hypothesis} ({h.confidence})
            </div>
            <p>Support: {h.supportIds.join(", ") || "none"}</p>
            <p>Contradict: {h.contradictIds.join(", ") || "none"}</p>
            <p>Interview: {h.interviewQuestion}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-medium">Interview Hypotheses</h2>
        <p className="text-sm">See Insights. No MVP is proposed here.</p>
      </section>
    </article>
  );
}
