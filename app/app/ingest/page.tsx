"use client";

import { useState } from "react";
import Papa from "papaparse";
import { useStore } from "@/components/Providers";
import type { IngestRow } from "@/lib/types";

export default function IngestPage() {
  const { ingestRows, addManual, analyzing, apiKey, research, clearResearch } = useStore();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [useLlm, setUseLlm] = useState(false);
  const [form, setForm] = useState({ source: "", url: "", date: "", text: "" });

  async function onFile(file: File) {
    setErr(null);
    setOk(null);
    const text = await file.text();
    const parsed = Papa.parse<IngestRow>(text, { header: true, skipEmptyLines: true });
    const rows = (parsed.data || []).map((r) => ({
      source: r.source,
      url: r.url,
      date: r.date,
      title: r.title,
      author: r.author,
      text: r.text || (r as { body?: string }).body,
    }));
    const msg = await ingestRows(rows, useLlm && Boolean(apiKey));
    if (msg) setErr(msg);
    else setOk(`Analyzed ${rows.length} rows. Switched to Research Evidence mode.`);
  }

  async function onManual(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const msg = await addManual(form, useLlm && Boolean(apiKey));
    if (msg) setErr(msg);
    else {
      setOk("Episode added.");
      setForm({ source: "", url: "", date: "", text: "" });
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-medium">Upload research data</h1>
      <p className="text-sm text-muted">
        Demo analysis is precomputed and works without an API key. Uploads are
        analyzed with a local heuristic pipeline unless you enable LLM analysis
        in Settings. Synthetic demo data is never mixed into research statistics.
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={useLlm}
          onChange={(e) => setUseLlm(e.target.checked)}
        />
        Use LLM analysis (requires API key). If unchecked or missing key, heuristic analysis runs.
      </label>

      <section className="rounded-lg border border-line bg-white p-4">
        <h2 className="font-medium">Method A — CSV</h2>
        <p className="text-sm text-muted">
          Optional columns: source, url, date, title, author, text. Only text is required.
          Try <a href="/sample-upload.csv">sample-upload.csv</a>.
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-3 text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </section>

      <form onSubmit={onManual} className="space-y-3 rounded-lg border border-line bg-white p-4">
        <h2 className="font-medium">Method B — Paste a conversation</h2>
        <input
          className="w-full rounded border border-line px-3 py-2 text-sm"
          placeholder="Source"
          value={form.source}
          onChange={(e) => setForm({ ...form, source: e.target.value })}
        />
        <input
          className="w-full rounded border border-line px-3 py-2 text-sm"
          placeholder="URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
        <input
          className="w-full rounded border border-line px-3 py-2 text-sm"
          placeholder="Date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <textarea
          required
          rows={8}
          className="w-full rounded border border-line px-3 py-2 text-sm"
          placeholder="Conversation / review text"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />
        <button
          disabled={analyzing}
          className="rounded-full bg-blue px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {analyzing ? "Analyzing…" : "Analyze episode"}
        </button>
      </form>

      {err && <p className="text-sm text-red-700">{err}</p>}
      {ok && <p className="text-sm text-green-800">{ok}</p>}

      {research.length > 0 && (
        <button className="text-sm text-muted underline" onClick={clearResearch}>
          Clear research evidence ({research.length}) and return to demo
        </button>
      )}
    </div>
  );
}
