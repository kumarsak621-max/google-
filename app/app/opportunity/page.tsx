"use client";

import Link from "next/link";
import { HBar } from "@/components/Charts";
import { useStore } from "@/components/Providers";
import { buildArchetypes, recommendedArchetype } from "@/lib/analytics";
import { download, opportunityCsv } from "@/lib/exports";

export default function OpportunityPage() {
  const { episodes, mode } = useStore();
  const arch = buildArchetypes(episodes);
  const rec = recommendedArchetype(episodes);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium">Opportunity matrix</h1>
          <p className="text-sm text-muted">
            Scores 1–5 among analyzed conversations. The recommended row is not
            blindly the maximum.
          </p>
        </div>
        <button
          className="rounded-full border border-line px-4 py-2 text-sm"
          onClick={() => download("opportunity-matrix.csv", opportunityCsv(episodes), "text/csv")}
        >
          Export Opportunity Matrix
        </button>
      </div>
      {rec && (
        <div className="rounded-lg border border-blue bg-[#e8f0fe] p-4">
          <div className="text-xs uppercase text-muted">Recommended to investigate first</div>
          <div className="text-lg font-medium">{rec.name}</div>
          <p className="mt-2 text-sm">{rec.opportunity.whyAttractive}</p>
        </div>
      )}
      <HBar
        title="Overall opportunity score"
        data={arch.map((a) => ({ name: a.name, value: a.opportunity.overall }))}
      />
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase text-muted">
            <tr>
              {[
                "Opportunity",
                "n",
                "Freq",
                "Severity",
                "Evidence",
                "Strategic",
                "AI",
                "Feasible",
                "Diff",
                "Overall",
              ].map((h) => (
                <th key={h} className="px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {arch.map((a) => (
              <tr key={a.id} className="border-t border-line">
                <td className="px-3 py-2">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-muted">
                    {a.evidenceIds.map((id) => (
                      <Link key={id} href={`/app/evidence/${id}`} className="mr-1">
                        {id}
                      </Link>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2">{a.frequency}</td>
                <td className="px-3 py-2">{a.opportunity.frequency}</td>
                <td className="px-3 py-2">{a.opportunity.severity}</td>
                <td className="px-3 py-2">{a.opportunity.evidenceStrength}</td>
                <td className="px-3 py-2">{a.opportunity.strategicRelevance}</td>
                <td className="px-3 py-2">{a.opportunity.aiLeverage}</td>
                <td className="px-3 py-2">{a.opportunity.feasibility}</td>
                <td className="px-3 py-2">{a.opportunity.differentiation}</td>
                <td className="px-3 py-2 font-medium">{a.opportunity.overall}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        Dataset: {mode}. Click evidence IDs to inspect the episodes behind each score.
      </p>
    </div>
  );
}
