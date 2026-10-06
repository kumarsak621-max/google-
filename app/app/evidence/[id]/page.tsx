"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/components/Providers";
import { FAILURE_LABELS } from "@/lib/types";
import { ARCHETYPE_META } from "@/lib/analytics";

export default function EvidenceDetail() {
  const { id } = useParams<{ id: string }>();
  const { episodes } = useStore();
  const e = episodes.find((x) => x.id === id);
  if (!e) {
    return (
      <p>
        Not found in the current dataset. <Link href="/app/evidence">Back</Link>
      </p>
    );
  }
  return (
    <article className="max-w-3xl space-y-4">
      <Link href="/app/evidence" className="text-sm">
        ← Evidence
      </Link>
      <h1 className="text-2xl font-medium">
        {e.id} · {e.title}
      </h1>
      {e.synthetic && (
        <p className="rounded bg-[#fef7e0] px-3 py-2 text-sm">
          SYNTHETIC DEMO DATA — NOT REAL USER EVIDENCE
        </p>
      )}
      <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        {[
          ["Source", e.source],
          ["Date", e.date],
          ["Author", e.author],
          ["Relevance", e.relevance],
          ["Strength", String(e.strength)],
          ["Outcome", e.outcome],
          ["Failure", `${e.failureCode} ${FAILURE_LABELS[e.failureCode]}`],
          ["Archetype", ARCHETYPE_META[e.archetypeId]?.name || e.archetypeId],
          ["Verification", e.verificationStatus || "n/a"],
          ["Source type", e.sourceType || "n/a"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-muted">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {e.url && (
        <p className="text-sm">
          URL:{" "}
          <a href={e.url} target="_blank" rel="noreferrer">
            {e.url}
          </a>
        </p>
      )}
      <section>
        <h2 className="font-medium">Retrieval episode</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Scenario: {e.scenario}</li>
          <li>Remembers: {e.remembers}</li>
          <li>Forgot: {e.forgot}</li>
          <li>Query: {e.query}</li>
          <li>Strategy: {e.searchStrategy}</li>
          <li>Refinements: {e.refinements}</li>
          <li>Why failed: {e.whyFailed}</li>
          <li>Workaround: {e.workaround}</li>
        </ul>
      </section>
      <section>
        <h2 className="font-medium">Failure rationale</h2>
        <p className="text-sm">{e.failureRationale}</p>
      </section>
      <section>
        <h2 className="font-medium">Memory signals</h2>
        <pre className="overflow-auto rounded border border-line bg-paper p-3 text-xs">
          {JSON.stringify(e.memory, null, 2)}
        </pre>
      </section>
      <section>
        <h2 className="font-medium">Original quote</h2>
        <blockquote className="whitespace-pre-wrap border-l-4 border-blue pl-4 text-sm">{e.rawText}</blockquote>
      </section>
      <section>
        <h2 className="font-medium">AI interpretation</h2>
        <p className="rounded bg-paper p-3 text-sm text-muted">
          {e.aiInterpretation || e.failureRationale}. This is a researcher/AI hypothesis, not a user
          statement.
        </p>
      </section>
    </article>
  );
}
