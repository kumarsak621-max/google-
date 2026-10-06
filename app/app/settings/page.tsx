"use client";

import { useState } from "react";
import { useStore } from "@/components/Providers";
import { download, evidenceCsv, opportunityCsv, hypothesesCsv, researchReport } from "@/lib/exports";

export default function SettingsPage() {
  const { apiKey, provider, setApi, episodes, mode, research } = useStore();
  const [key, setKey] = useState(apiKey);
  const [prov, setProv] = useState(provider);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-medium">Settings & export</h1>
      <p className="text-sm text-muted">
        API keys are kept in sessionStorage and sent only to the server analysis
        route. They are not embedded in frontend bundles. Prefer environment
        variables on the host: OPENAI_API_KEY or GEMINI_API_KEY.
      </p>
      <form
        className="space-y-3 rounded-lg border border-line bg-white p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setApi(key, prov);
        }}
      >
        <label className="block text-sm">
          Provider
          <select
            className="mt-1 w-full rounded border border-line px-2 py-2"
            value={prov}
            onChange={(e) => setProv(e.target.value as "openai" | "gemini")}
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </label>
        <label className="block text-sm">
          API key (optional)
          <input
            type="password"
            className="mt-1 w-full rounded border border-line px-3 py-2"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-… or AIza…"
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
