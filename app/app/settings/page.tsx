"use client";

import { useState } from "react";
import { useStore } from "@/components/Providers";
import { download, evidenceCsv, opportunityCsv, hypothesesCsv, researchReport } from "@/lib/exports";

export default function SettingsPage() {
  const { apiKey, setApi, episodes, mode, research } = useStore();
  const [key, setKey] = useState(apiKey);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-medium">Settings & export</h1>
      <p className="text-sm text-muted">
        API keys are kept in sessionStorage and sent only to the server analysis
        route. They are not embedded in frontend bundles. Prefer OPENROUTER_API_KEY
        on the host. Model: google/gemini-2.5-flash via OpenRouter.
      </p>
      <form
        className="space-y-3 rounded-lg border border-line bg-white p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setApi(key, "openrouter");
        }}
      >
        <p className="text-sm">Model: google/gemini-2.5-flash</p>
        <label className="block text-sm">
          OpenRouter API key (optional)
          <input
            type="password"
            className="mt-1 w-full rounded border border-line px-3 py-2"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="OpenRouter API key"
          />
        </label>
        <button className="rounded-full bg-blue px-4 py-2 text-sm text-white">Save in this browser session</button>
      </form>
      <section className="space-y-2">
        <h2 className="font-medium">Export current dataset ({mode})</h2>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-full border border-line px-3 py-1 text-sm" onClick={() => download("evidence.csv", evidenceCsv(episodes), "text/csv")}>
            Export Evidence CSV
          </button>
          <button className="rounded-full border border-line px-3 py-1 text-sm" onClick={() => download("research-report.md", researchReport(episodes, mode), "text/markdown")}>
            Export Research Report
          </button>
          <button className="rounded-full border border-line px-3 py-1 text-sm" onClick={() => download("opportunity-matrix.csv", opportunityCsv(episodes), "text/csv")}>
            Export Opportunity Matrix
          </button>
          <button className="rounded-full border border-line px-3 py-1 text-sm" onClick={() => download("interview-hypotheses.csv", hypothesesCsv(episodes), "text/csv")}>
            Export Interview Hypotheses
          </button>
          <button
            className="rounded-full border border-line px-3 py-1 text-sm"
            onClick={() => download("dataset.json", JSON.stringify({ mode, episodes, researchCount: research.length }, null, 2), "application/json")}
          >
            Export JSON
          </button>
        </div>
      </section>
    </div>
  );
}
