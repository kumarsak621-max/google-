import fs from "fs";
import path from "path";
import type { Episode } from "../types";

export type ResearchRun = {
  id: string;
  started_at: string;
  completed_at: string | null;
  queries_run: number;
  pages_found: number;
  pages_reviewed: number;
  relevant_items: number;
  verified_items: number;
  duplicates_removed: number;
  status: "idle" | "running" | "complete" | "error" | "needs_config";
  logs: string[];
  error?: string;
};

type Store = {
  episodes: Episode[];
  runs: ResearchRun[];
};

const FILE = path.join(process.cwd(), "data", "store.json");

function empty(): Store {
  return { episodes: [], runs: [] };
}

export function readStore(): Store {
  try {
    if (!fs.existsSync(FILE)) return empty();
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Store;
  } catch {
    return empty();
  }
}

export function writeStore(store: Store) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(store, null, 2), "utf8");
}

export function upsertEpisodes(incoming: Episode[]) {
  const store = readStore();
  const byUrlQuote = new Map(store.episodes.map((e) => [`${e.url}::${e.rawText.slice(0, 80)}`, e]));
  let added = 0;
  for (const e of incoming) {
    const k = `${e.url}::${e.rawText.slice(0, 80)}`;
    if (byUrlQuote.has(k)) continue;
    byUrlQuote.set(k, e);
    added += 1;
  }
  store.episodes = [...byUrlQuote.values()];
  writeStore(store);
  return { total: store.episodes.length, added };
}

export function saveRun(run: ResearchRun) {
  const store = readStore();
  const i = store.runs.findIndex((r) => r.id === run.id);
  if (i >= 0) store.runs[i] = run;
  else store.runs.unshift(run);
  writeStore(store);
}
