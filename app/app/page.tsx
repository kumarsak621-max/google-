"use client";

import Link from "next/link";
import { HBar, Stat } from "@/components/Charts";
import { useStore } from "@/components/Providers";
import {
  behaviorCounts,
  failureCounts,
  funnel,
  insights,
  researchEpisodes,
  scenarioCounts,
  workaroundCounts,
  buildArchetypes,
} from "@/lib/analytics";
import { FAILURE_LABELS } from "@/lib/types";

export default function Dashboard() {
  const { episodes, mode } = useStore();
  const i = insights(episodes);
  const rec = i.highestOpportunity;
  const fail = i.mostCommonFailure;
  const fun = funnel(episodes);
  const arch = buildArchetypes(episodes);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Discovery dashboard</h1>
        <p className="text-sm text-muted">
          {mode === "demo"
            ? "SYNTHETIC DEMO DATA — NOT REAL USER EVIDENCE."
            : "Research evidence from public URLs. Demo data is not included."}{" "}
          Among analyzed conversations in this dataset only.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Evidence items" value={i.totalItems} hint="All rows including weak/irrelevant" />
        <Stat
          label="Retrieval episodes"
          value={researchEpisodes(episodes).length}
          hint="Relevant / possibly relevant, strength ≥ 2"
        />
        <Stat label="Verified (page-fetched)" value={i.verified} hint="Primary conclusions should prefer these" />
        <Stat label="Partially verified" value={i.partial} hint="Public URL + matching snippet" />
        <Stat label="Successful retrievals" value={i.succeeded} />
        <Stat label="Failed retrievals" value={i.failed} />
        <Stat label="Sources" value={i.sources} />
        <Stat label="Archetypes" value={i.archetypes} />
        <Stat
          label="Most common failure"
          value={fail ? `${fail.name} · ${fail.value}` : "—"}
          hint={fail ? FAILURE_LABELS[fail.name as keyof typeof FAILURE_LABELS] : undefined}
        />
        <Stat
          label="Highest-opportunity problem"
          value={rec?.name ?? "—"}
          hint={rec ? `Overall ${rec.opportunity.overall} · not selected by score alone` : undefined}
        />
      </div>
      <section className="rounded-lg border border-line bg-white p-4">
        <h2 className="text-sm font-medium">Retrieval funnel (episode counts, not conversion rates)</h2>
        <ol className="mt-4 grid gap-2 md:grid-cols-3">
          {fun.map((s) => (
            <li key={s.id} className="rounded border border-line p-3">
              <div className="text-xs text-muted">{s.name}</div>
              <div className="text-lg font-medium">{s.stageEvidence}</div>
              <div className="text-xs text-muted">{s.qualitativeNote}</div>
            </li>
          ))}
        </ol>
        <Link href="/app/funnel" className="mt-3 inline-block text-sm">
          Open full funnel
        </Link>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <HBar title="1. Retrieval scenarios (top)" data={scenarioCounts(episodes)} />
        <HBar
          title="2. Failure categories"
          data={failureCounts(episodes).map((f) => ({
            name: `${f.name} ${FAILURE_LABELS[f.name as keyof typeof FAILURE_LABELS]}`,
            value: f.value,
          }))}
        />
        <HBar
          title="3. Memory types (semantic tags)"
          data={Object.entries(
            researchEpisodes(episodes).reduce<Record<string, number>>((acc, e) => {
              for (const s of e.memory.semantic) acc[s] = (acc[s] || 0) + 1;
              return acc;
            }, {}),
          ).map(([name, value]) => ({ name, value }))}
        />
        <HBar title="4. Search behaviors" data={behaviorCounts(episodes)} />
        <HBar title="5. Workarounds" data={workaroundCounts(episodes)} />
        <HBar
          title="6. Opportunity scores (overall)"
          data={arch.map((a) => ({ name: a.name, value: a.opportunity.overall }))}
        />
      </div>
    </div>
  );
}
