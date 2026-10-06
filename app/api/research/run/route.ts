import { NextResponse } from "next/server";
import { searchConfig } from "@/lib/server/search";
import { createJob, appendLog, patchJob, getJob } from "@/lib/server/jobs";
import { runLiveResearch } from "@/lib/server/pipeline";
import { upsertEpisodes } from "@/lib/server/store";
import { REAL_SEED_EPISODES } from "@/lib/real-seed";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as { mode?: string }));
  const mode = body.mode === "live" ? "live" : "seed";
  const cfg = searchConfig();

  if (mode === "live" && !cfg.configured) {
    return NextResponse.json(
      {
        error:
          "WEB_SEARCH_API_KEY is not configured. Add a Tavily key (default) or set WEB_SEARCH_PROVIDER=serper and use a Serper key. Demo Mode still works. You can also load the collected public corpus without a search key.",
        config: cfg,
      },
      { status: 400 },
    );
  }

  const job = createJob();

  (async () => {
    try {
      if (mode === "seed") {
        appendLog(job.id, `Loading ${REAL_SEED_EPISODES.length} previously collected public retrieval episodes…`);
        upsertEpisodes(REAL_SEED_EPISODES);
        patchJob(job.id, {
          status: "complete",
          completed_at: new Date().toISOString(),
          queries_run: 0,
          pages_found: REAL_SEED_EPISODES.length,
          pages_reviewed: REAL_SEED_EPISODES.length,
          relevant_items: REAL_SEED_EPISODES.length,
          verified_items: REAL_SEED_EPISODES.filter((e) => e.verificationStatus === "VERIFIED").length,
          duplicates_removed: 0,
        });
        appendLog(
          job.id,
          "Seed corpus loaded. These are real public quotes with URLs. Index-verified items are PARTIALLY_VERIFIED; page-fetched items are VERIFIED. Use live search when WEB_SEARCH_API_KEY is set.",
        );
        return;
      }

      const episodes = await runLiveResearch((log, stats) => appendLog(job.id, log, stats));
      upsertEpisodes(episodes);
      patchJob(job.id, {
        status: "complete",
        completed_at: new Date().toISOString(),
        relevant_items: episodes.length,
        verified_items: episodes.filter((e) => e.verificationStatus === "VERIFIED").length,
      });
      appendLog(job.id, `Live research complete. ${episodes.length} episodes stored.`);
    } catch (e) {
      patchJob(job.id, {
        status: "error",
        completed_at: new Date().toISOString(),
        error: e instanceof Error ? e.message : "Research failed",
      });
      appendLog(job.id, `Error: ${e instanceof Error ? e.message : "Research failed"}`);
    }
  })();

  return NextResponse.json({ job: getJob(job.id), config: cfg });
}
