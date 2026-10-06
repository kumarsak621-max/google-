"use client";

import Link from "next/link";
import { useStore } from "@/components/Providers";
import { buildArchetypes } from "@/lib/analytics";
import { FAILURE_LABELS } from "@/lib/types";

export default function ArchetypesPage() {
  const { episodes } = useStore();
  const arch = buildArchetypes(episodes);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-medium">Retrieval archetypes</h1>
      <p className="text-sm text-muted">
        Clusters come from observed episode patterns (failure + memory + query
        behavior), not from a preset marketing list. {arch.length} clusters in
        this dataset.
      </p>
      {arch.map((a) => (
        <article key={a.id} className="rounded-lg border border-line bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-medium">{a.name}</h2>
            <div className="text-sm text-muted">
              {a.frequency} episodes · opportunity {a.opportunity.overall}
            </div>
          </div>
          <p className="mt-2 text-sm">{a.coreSituation}</p>
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Remember</dt>
              <dd>{a.memoryPattern}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Forget</dt>
              <dd>{a.missingInformation}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Search behavior</dt>
              <dd>{a.searchBehavior}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Failure</dt>
              <dd>
                {a.failurePoint} {FAILURE_LABELS[a.failurePoint]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Workaround</dt>
              <dd>{a.workaround}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Severity / frequency / AI</dt>
              <dd>
                {a.severity} / {a.frequencyScore} / {a.aiOpportunity} (1–5)
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm">
            <span className="text-muted">Evidence: </span>
            {a.evidenceIds.map((id) => (
              <Link key={id} href={`/app/evidence/${id}`} className="mr-2">
                {id}
              </Link>
            ))}
          </p>
          <div className="mt-3 space-y-2">
            {a.quotes.map((q, i) => (
              <blockquote key={i} className="border-l-4 border-line pl-3 text-sm text-muted">
                {q.replace("SYNTHETIC DEMO DATA — NOT REAL USER EVIDENCE", "").trim()}
              </blockquote>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
