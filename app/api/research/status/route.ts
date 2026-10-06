import { NextResponse } from "next/server";
import { latestJob } from "@/lib/server/jobs";
import { readStore } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ job: latestJob() || readStore().runs[0] || null });
}
