import { NextResponse } from "next/server";
import { REAL_SEED_EPISODES } from "@/lib/real-seed";
import { readStore } from "@/lib/server/store";
import { latestJob } from "@/lib/server/jobs";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = readStore();
  const live = store.episodes.filter((e) => !e.synthetic);
  const seed = REAL_SEED_EPISODES;
  return NextResponse.json({
    seed,
    live,
    combined: [...seed, ...live.filter((e) => !seed.some((s) => s.url === e.url && s.rawText === e.rawText))],
    latestRun: latestJob() || store.runs[0] || null,
  });
}
