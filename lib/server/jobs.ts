import type { ResearchRun } from "./store";
import { saveRun } from "./store";

const jobs = new Map<string, ResearchRun>();

export function getJob(id: string) {
  return jobs.get(id);
}

export function latestJob() {
  return [...jobs.values()][0] || null;
}

export function createJob(): ResearchRun {
  const run: ResearchRun = {
    id: `run-${Date.now()}`,
    started_at: new Date().toISOString(),
    completed_at: null,
    queries_run: 0,
    pages_found: 0,
    pages_reviewed: 0,
    relevant_items: 0,
    verified_items: 0,
    duplicates_removed: 0,
    status: "running",
    logs: ["Starting research run…"],
  };
  jobs.set(run.id, run);
  saveRun(run);
  return run;
}

export function patchJob(id: string, patch: Partial<ResearchRun>) {
  const cur = jobs.get(id);
  if (!cur) return;
  Object.assign(cur, patch);
  if (patch.logs) {
    /* logs replaced */
  }
  saveRun(cur);
}

export function appendLog(id: string, line: string, stats?: Partial<ResearchRun>) {
  const cur = jobs.get(id);
  if (!cur) return;
  cur.logs.push(line);
  if (cur.logs.length > 80) cur.logs = cur.logs.slice(-80);
  Object.assign(cur, stats);
  saveRun(cur);
}
