"use client";

import { DEMO_EPISODES } from "./demo-data";
import type { DataMode, Episode } from "./types";

const KEY = "prde-store-v1";

export interface StoreState {
  mode: DataMode;
  research: Episode[];
  apiKey: string;
  provider: "heuristic" | "openai" | "gemini";
}

export const defaultStore = (): StoreState => ({
  mode: "demo",
  research: [],
  apiKey: "",
  provider: "heuristic",
});

export function loadStore(): StoreState {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStore();
    return { ...defaultStore(), ...JSON.parse(raw) };
  } catch {
    return defaultStore();
  }
}

export function saveStore(state: StoreState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function episodesFor(state: StoreState): Episode[] {
  return state.mode === "demo" ? DEMO_EPISODES : state.research;
}
