import type { DataMode, Episode } from "./types";
import { DEMO_EPISODES } from "./demo-data";

const KEY_EPISODES = "prde.researchEpisodes";
const KEY_MODE = "prde.mode";
const KEY_API = "prde.apiKey";
const KEY_PROVIDER = "prde.provider";

export function loadResearchEpisodes(): Episode[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_EPISODES);
    return raw ? (JSON.parse(raw) as Episode[]) : [];
  } catch {
    return [];
  }
}

export function saveResearchEpisodes(episodes: Episode[]) {
  localStorage.setItem(KEY_EPISODES, JSON.stringify(episodes));
}

export function loadMode(): DataMode {
  if (typeof window === "undefined") return "demo";
  return (localStorage.getItem(KEY_MODE) as DataMode) || "demo";
}

export function saveMode(mode: DataMode) {
  localStorage.setItem(KEY_MODE, mode);
}

export function loadApiSettings() {
  if (typeof window === "undefined") return { apiKey: "", provider: "openrouter" as const };
  const stored = sessionStorage.getItem(KEY_PROVIDER);
  const provider =
    stored === "gemini" ? ("gemini" as const) : ("openrouter" as const);
  return {
    apiKey: sessionStorage.getItem(KEY_API) || "",
    provider,
  };
}

export function saveApiSettings(apiKey: string, provider: "openrouter" | "gemini") {
  sessionStorage.setItem(KEY_API, apiKey);
  sessionStorage.setItem(KEY_PROVIDER, provider);
}

export function episodesForMode(mode: DataMode, research: Episode[]): Episode[] {
  return mode === "demo" ? DEMO_EPISODES : research;
}
