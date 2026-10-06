"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/components/Providers";
import { researchEpisodes } from "@/lib/analytics";
import { FAILURE_LABELS } from "@/lib/types";
import { ARCHETYPE_META } from "@/lib/analytics";

export default function EvidencePage() {
  const { episodes, ready } = useStore();
  const [q, setQ] = useState("");
  const [source, setSource] = useState("all");
  const [fail, setFail] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [strength, setStrength] = useState("all");
  const [arch, setArch] = useState("all");
  const [memory, setMemory] = useState("all");

  const list = useMemo(() => {
    return episodes.filter((e) => {
      if (q) {
        const blob = `${e.id} ${e.scenario} ${e.remembers} ${e.forgot} ${e.query} ${e.rawText}`.toLowerCase();
        if (!blob.includes(q.toLowerCase())) return false;
      }
      if (source !== "all" && e.source !== source) return false;
      if (fail !== "all" && e.failureCode !== fail) return false;
      if (outcome !== "all" && e.outcome !== outcome) return false;
      if (strength !== "all" && String(e.strength) !== strength) return false;
      if (arch !== "all" && e.archetypeId !== arch) return false;
      if (memory !== "all") {
        const hit =
          e.memory.semantic.includes(memory as never) ||
          e.memory.temporal.includes(memory as never) ||
          e.memory.spatial.includes(memory as never) ||
          e.memory.textual.includes(memory) ||
          e.memory.visual.includes(memory) ||
          e.memory.social.includes(memory);
        if (!hit) return false;
      }
      return true;
    });
  }, [arch, episodes, fail, memory, outcome, q, source, strength]);

  const sources = [...new Set(episodes.map((e) => e.source))];
  const arches = [...new Set(episodes.map((e) => e.archetypeId))];

  if (!ready) {
    return <p className="text-sm text-muted">Loading evidence…</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-medium">Evidence explorer</h1>
      <p className="text-sm text-muted">
        {list.length} of {episodes.length} items. Strength 4–5 should drive product conclusions.{" "}
        {researchEpisodes(episodes).length} coded as retrieval episodes.
      </p>
      <div className="grid gap-2 md:grid-cols-4">
        <input
          className="rounded border border-line px-3 py-2 text-sm"
          placeholder="Search text, IDs, queries…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="rounded border border-line px-2 py-2 text-sm" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="rounded border border-line px-2 py-2 text-sm" value={fail} onChange={(e) => setFail(e.target.value)}>
          <option value="all">All failure categories</option>
          {Object.entries(FAILURE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {k} {v}
            </option>
          ))}
        </select>
        <select className="rounded border border-line px-2 py-2 text-sm" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
          <option value="all">All outcomes</option>
          <option value="succeeded">succeeded</option>
          <option value="failed">failed</option>
          <option value="partial">partial</option>
          <option value="unknown">unknown</option>
        </select>
        <select className="rounded border border-line px-2 py-2 text-sm" value={strength} onChange={(e) => setStrength(e.target.value)}>
          <option value="all">All evidence strength</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select className="rounded border border-line px-2 py-2 text-sm" value={arch} onChange={(e) => setArch(e.target.value)}>
          <option value="all">All archetypes</option>
          {arches.map((a) => (
            <option key={a} value={a}>
              {ARCHETYPE_META[a]?.name || a}
            </option>
          ))}
        </select>
        <select className="rounded border border-line px-2 py-2 text-sm" value={memory} onChange={(e) => setMemory(e.target.value)}>
          <option value="all">All memory types</option>
          {["person", "object", "food", "animal", "document", "screenshot", "event", "relative_time", "country", "trip", "family"].map(
            (m) => (
              <option key={m}>{m}</option>
            ),
          )}
        </select>
      </div>
      <div className="grid gap-3">
        {list.map((e) => (
          <article key={e.id} className="rounded-lg border border-line bg-white p-4">
            {e.synthetic && (
              <p className="mb-2 text-xs font-medium text-amber-800">
                SYNTHETIC DEMO DATA — NOT REAL USER EVIDENCE
              </p>
            )}
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link href={`/app/evidence/${e.id}`} className="font-medium no-underline">
                {e.id} · {e.scenario}
              </Link>
              <span className="text-xs text-muted">
                Strength {e.strength} · {e.outcome} · {e.failureCode} · {e.verificationStatus || "n/a"}
              </span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-wide text-muted">Original quote</p>
            <blockquote className="border-l-4 border-blue pl-3 text-sm">{e.rawText}</blockquote>
            <p className="mt-3 text-xs uppercase tracking-wide text-muted">AI interpretation (not a user statement)</p>
            <p className="text-sm text-muted">{e.aiInterpretation || e.failureRationale}</p>
            <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Source</dt>
                <dd>
                  {e.source}
                  {e.url && (
                    <>
                      {" "}
                      ·{" "}
                      <a href={e.url} target="_blank" rel="noreferrer">
                        Open URL
                      </a>
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">What user remembers</dt>
                <dd>{e.remembers}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">What user forgot</dt>
                <dd>{e.forgot}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Search attempted</dt>
                <dd>{e.query}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Outcome</dt>
                <dd>{e.outcome}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Failure</dt>
                <dd>
                  {e.failureCode} {FAILURE_LABELS[e.failureCode]}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
