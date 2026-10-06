"use client";

import Link from "next/link";
import { useStore } from "@/components/Providers";
import {
  behaviorCounts,
  buildArchetypes,
  hypotheses,
  insights,
  recommendedArchetype,
  workaroundCounts,
} from "@/lib/analytics";
import { download, hypothesesCsv, researchReport } from "@/lib/exports";

export default function InsightsPage() {
  const { episodes, mode } = useStore();
  const i = insights(episodes);
  const rec = recommendedArchetype(episodes);
  const hs = hypotheses(episodes);
  const arch = buildArchetypes(episodes);
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="text-2xl font-medium">Research insights</h1>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-line px-3 py-1 text-sm"
            onClick={() => download("interview-hypotheses.csv", hypothesesCsv(episodes), "text/csv")}
          >
            Export Interview Hypotheses
          </button>
          <button
            className="rounded-full border border-line px-3 py-1 text-sm"
            onClick={() => download("research-report.md", researchReport(episodes, mode), "text/markdown")}
          >
            Export Research Report
          </button>
        </div>
      </div>
      <p className="text-sm text-muted">{i.limitations}</p>

      <section>
        <h2 className="text-lg font-medium">Top retrieval problems</h2>
        <ol className="mt-3 space-y-3">
          {arch.slice(0, 8).map((a) => (
            <li key={a.id} className="rounded border border-line bg-white p-4 text-sm">
              <div className="font-medium">{a.name}</div>
              <div>
                Frequency {a.frequency} episodes · severity {a.severity} · opportunity {a.opportunity.overall}
              </div>
              <div>Memory: {a.memoryPattern}</div>
              <div>Failure {a.failurePoint} · Workaround: {a.workaround}</div>
              <div>
                Evidence:{" "}
                {a.evidenceIds.map((id) => (
                  <Link key={id} href={`/app/evidence/${id}`} className="mr-2">
                    {id}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-medium">Top memory signals (when metadata is incomplete)</h2>
        <p className="text-sm">
          Observed in this dataset: object/place class, in-image text, people/relationships,
          trip/episode, and visual appearance. Exact dates are usually forgotten.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">Search behavior</h2>
        <ul className="list-disc pl-5 text-sm">
          {behaviorCounts(episodes)
            .slice(0, 8)
            .map((b) => (
              <li key={b.name}>
                {b.name} — observed in {b.value} episode tags
              </li>
            ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">Failed search behavior & workarounds</h2>
        <ul className="list-disc pl-5 text-sm">
          {workaroundCounts(episodes)
            .slice(0, 8)
            .map((b) => (
              <li key={b.name}>
                {b.name} ({b.value})
              </li>
            ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">Contradiction detection</h2>
        <p className="text-sm text-muted">
          Recommended problem remains: {rec?.name}. NL search is not uniformly bad
          (see successful Corgi / pose / Halloween episodes).
        </p>
        <div className="mt-3 space-y-3">
          {hs.map((h) => (
            <div key={h.id} className="rounded border border-line bg-white p-4 text-sm">
              <div className="font-medium">
                {h.id}. {h.hypothesis}
              </div>
              <div>
                Supporting evidence: {h.supportIds.length} episodes{" "}
                {h.supportIds.slice(0, 8).map((id) => (
                  <Link key={id} href={`/app/evidence/${id}`} className="mr-1">
                    {id}
                  </Link>
                ))}
              </div>
              <div>
                Contradicting evidence: {h.contradictIds.length} episodes{" "}
                {h.contradictIds.slice(0, 8).map((id) => (
                  <Link key={id} href={`/app/evidence/${id}`} className="mr-1">
                    {id}
                  </Link>
                ))}
              </div>
              <div>Confidence: {h.confidence}</div>
              <div className="text-muted">Interview question: {h.interviewQuestion}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-4 text-sm">
        <h2 className="text-lg font-medium">Recommended interview participant</h2>
        <p className="mt-2">
          Users who have attempted to retrieve a Google Photos image using
          contextual or episodic memory rather than an exact date or filename.
        </p>
        <p className="mt-2">
          <strong>Inclusion:</strong> reconstructable failed or slow retrieval in
          last 90 days; library large enough that scrolling is implausible; backup on.
        </p>
        <p>
          <strong>Exclusion:</strong> backup/account loss only; never uses Search;
          generic sentiment with no retrieval attempt.
        </p>
        <p className="mt-2">
          <strong>Screeners:</strong> Last incomplete-date search — what did you type?
          Did you find it? Document vs person vs trip vs visual? Ask vs classic?
          Ever search text seen in a photo?
        </p>
      </section>
    </div>
  );
}
