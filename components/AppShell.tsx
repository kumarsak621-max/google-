"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "./Providers";

const NAV = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/research", label: "Run research" },
  { href: "/app/evidence", label: "Evidence" },
  { href: "/app/archetypes", label: "Archetypes" },
  { href: "/app/memory", label: "Memory map" },
  { href: "/app/funnel", label: "Funnel" },
  { href: "/app/opportunity", label: "Opportunity" },
  { href: "/app/insights", label: "Insights" },
  { href: "/app/report", label: "Report" },
  { href: "/app/direction", label: "Research direction" },
  { href: "/app/ingest", label: "Upload" },
  { href: "/app/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { mode, setMode, research } = useStore();
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <Link href="/" className="text-ink no-underline">
              <div className="text-lg font-medium tracking-tight">Photo Retrieval Discovery Engine</div>
            </Link>
            <div className="text-sm text-muted">
              Understanding how people retrieve visual memories when metadata is incomplete
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted">Dataset</span>
            <button
              className={`rounded-full px-3 py-1 ${mode === "demo" ? "bg-blue text-white" : "bg-paper border border-line"}`}
              onClick={() => setMode("demo")}
            >
              Synthetic demo
            </button>
            <button
              className={`rounded-full px-3 py-1 ${mode === "research" ? "bg-blue text-white" : "bg-paper border border-line"}`}
              onClick={() => setMode("research")}
              disabled={!research.length}
            >
              Research evidence ({research.length})
            </button>
          </div>
        </div>
        {mode === "demo" && (
          <div className="bg-[#fef7e0] px-4 py-2 text-center text-sm text-ink">
            SYNTHETIC DEMO DATA — NOT REAL USER EVIDENCE. Public discussions are directional, not population prevalence.
          </div>
        )}
        {mode === "research" && (
          <div className="bg-[#e8f0fe] px-4 py-2 text-center text-sm text-ink">
            Research Evidence mode — real public quotes with source URLs. Public online discussions
            are directional qualitative evidence and are not representative of all Google Photos users.
            AI-generated interpretations are hypotheses, not user statements.
          </div>
        )}
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {NAV.map((n) => {
            const active = path === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-sm no-underline ${
                  active ? "bg-[#e8f0fe] text-blue-dark font-medium" : "text-muted hover:bg-paper"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
