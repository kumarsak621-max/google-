import { NextResponse } from "next/server";
import { searchConfig } from "@/lib/server/search";
import { REAL_SEED_EPISODES } from "@/lib/real-seed";
import { readStore } from "@/lib/server/store";

export async function GET() {
  const cfg = searchConfig();
  const store = readStore();
  return NextResponse.json({
    ...cfg,
    seededPublicEvidence: REAL_SEED_EPISODES.length,
    storedLiveEvidence: store.episodes.length,
    notice:
      "Public online discussions are directional qualitative evidence and are not representative of all Google Photos users.",
  });
}
