"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/Providers";

type Job = {
  id: string;
  status: string;
  logs: string[];
  queries_run: number;
  pages_found: number;
  pages_reviewed: number;
  relevant_items: number;
  verified_items: number;
  duplicates_removed: number;
  error?: string;
};

type Cfg = {
  configured: boolean;
  provider: string;
  openrouter: boolean;
  docs: Record<string, string>;
  seededPublicEvidence: number;
};

export default function ResearchPage() {
  const { refreshResearch, setMode } = useStore();
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setCfg)
      .catch(() => setCfg(null));
  }, []);

  useEffect(() => {
    if (!busy && job?.status !== "running") return;
    const t = setInterval(async () => {
      const res = await fetch("/api/research/status");
      const data = await res.json();
      setJob(data.job);
      if (data.job?.status && data.job.status !== "running") {
        setBusy(false);
        await refreshResearch();
        setMode("research");
      }
    }, 1200);
    return () => clearInterval(t);
  }, [busy, job?.status, refreshResearch, setMode]);

  async function run(mode: "seed" | "live") {
    setErr("");
    setBusy(true);
    const res = await fetch("/api/research/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setErr(data.error || "Could not start research");
      return;
    }
    setJob(data.job);
    if (mode === "seed") {
      await refreshResearch();
      setMode("research");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-medium">Run Real Research</h1>
      <p className="text-sm text-muted">
        Collects publicly accessible conversations about retrieving a photo people remember but cannot
        precisely describe. Demo Mode stays separate. Original quotes and URLs are preserved.
      </p>
      <div className="rounded-lg border border-line bg-white p-4 text-sm">
        <div className="font-medium">Configuration</div>
        <ul className="mt-2 space-y-1 text-muted">
          <li>Web search ({cfg?.provider || "tavily"}): {cfg?.configured ? "configured" : "missing WEB_SEARCH_API_KEY"}</li>
          <li>OpenRouter: {cfg?.openrouter ? "configured" : "not set (heuristic extraction still runs)"}</li>
          <li>Collected public corpus: {cfg?.seededPublicEvidence ?? "—"} episodes ready without a search key</li>
        </ul>
        {!cfg?.configured && (
          <p className="mt-3 rounded bg-paper p-3">
            Live web search needs <code>WEB_SEARCH_API_KEY</code> (Tavily by default, or Serper if{" "}
            <code>WEB_SEARCH_PROVIDER=serper</code>). The app will not crash. You can still load the
            collected public evidence corpus.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-full bg-blue px-5 py-2 text-white disabled:opacity-50"
          disabled={busy}
          onClick={() => run("seed")}
        >
          Load collected public evidence
        </button>
        <button
          className="rounded-full border border-line px-5 py-2 disabled:opacity-50"
          disabled={busy}
          onClick={() => run("live")}
        >
          Run live web search
        </button>
        <Link href="/app/evidence" className="rounded-full border border-line px-5 py-2 no-underline text-ink">
          View Evidence
        </Link>
      </div>
      {err && <p className="text-sm text-red-700">{err}</p>}
      {job && (
        <section className="rounded-lg border border-line bg-white p-4">
          <h2 className="font-medium">Research progress</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>{job.queries_run ? "✓" : "→"} {job.queries_run} queries generated/run</li>
            <li>{job.pages_found ? "✓" : "→"} {job.pages_found} results found</li>
            <li>{job.pages_reviewed ? "✓" : "→"} {job.pages_reviewed} pages reviewed</li>
            <li>{job.relevant_items ? "✓" : "→"} {job.relevant_items} relevant episodes</li>
            <li>{job.verified_items ? "✓" : "→"} {job.verified_items} verified</li>
            <li>→ {job.duplicates_removed} duplicates removed</li>
            <li>Status: {job.status}</li>
          </ul>
          <pre className="mt-3 max-h-64 overflow-auto rounded bg-paper p-3 text-xs whitespace-pre-wrap">
            {(job.logs || []).join("\n")}
          </pre>
        </section>
      )}
    </div>
  );
}
