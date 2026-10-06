"use client";

import Link from "next/link";
import { useStore } from "@/components/Providers";
import { funnel } from "@/lib/analytics";

export default function FunnelPage() {
  const { episodes } = useStore();
  const fun = funnel(episodes);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-medium">Retrieval funnel</h1>
      <p className="rounded border border-line bg-white p-3 text-sm text-muted">
        Do not read these as conversion rates. The data does not support a
        measured percentage drop-off. Numbers are counts of analyzed episodes
        related to each stage.
      </p>
      <ol className="space-y-3">
        {fun.map((s) => (
          <li key={s.id} className="rounded-lg border border-line bg-white p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-medium">{s.name}</h2>
              <span className="text-sm text-muted">
                Related episodes: {s.stageEvidence} · corpus {s.evidenceCount}
              </span>
            </div>
            <p className="mt-2 text-sm">{s.behavior}</p>
            <p className="text-sm text-muted">Failure modes: {s.fail}</p>
            <p className="text-sm">Opportunity to test: {s.opportunity}</p>
            <p className="mt-2 text-sm">
              Representative evidence:{" "}
              {s.ids.length
                ? s.ids.map((id) => (
                    <Link key={id} href={`/app/evidence/${id}`} className="mr-2">
                      {id}
                    </Link>
                  ))
                : "—"}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
