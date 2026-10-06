"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { DataMode, Episode, IngestRow } from "@/lib/types";
import { DEMO_EPISODES } from "@/lib/demo-data";
import { assignDuplicateGroups, heuristicAnalyze } from "@/lib/analyze";
import {
  episodesForMode,
  loadApiSettings,
  loadMode,
  loadResearchEpisodes,
  saveApiSettings,
  saveMode,
  saveResearchEpisodes,
} from "@/lib/storage";

type Ctx = {
  ready: boolean;
  mode: DataMode;
  setMode: (m: DataMode) => void;
  episodes: Episode[];
  research: Episode[];
  ingestRows: (rows: IngestRow[], useLlm: boolean) => Promise<string | null>;
  addManual: (row: IngestRow, useLlm: boolean) => Promise<string | null>;
  clearResearch: () => void;
  apiKey: string;
  provider: "openai" | "gemini";
  setApi: (key: string, provider: "openai" | "gemini") => void;
  analyzing: boolean;
  refreshResearch: () => Promise<void>;
};

const C = createContext<Ctx | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [mode, setModeState] = useState<DataMode>("demo");
  const [research, setResearch] = useState<Episode[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    setModeState(loadMode());
    setResearch(loadResearchEpisodes());
    const s = loadApiSettings();
    setApiKey(s.apiKey);
    setProvider(s.provider);
    setReady(true);
  }, []);

  const setMode = useCallback((m: DataMode) => {
    setModeState(m);
    saveMode(m);
  }, []);

  const setApi = useCallback((key: string, p: "openai" | "gemini") => {
    setApiKey(key);
    setProvider(p);
    saveApiSettings(key, p);
  }, []);

  const persist = useCallback((next: Episode[]) => {
    const tagged = assignDuplicateGroups(
      next.map((e, i) => ({ ...e, id: e.id || `R${String(i + 1).padStart(3, "0")}` })),
    );
    setResearch(tagged);
    saveResearchEpisodes(tagged);
    setMode("research");
  }, [setMode]);

  const refreshResearch = useCallback(async () => {
    try {
      const res = await fetch("/api/evidence");
      const data = await res.json();
      const combined = (data.combined || data.seed || []) as Episode[];
      if (combined.length) {
        setResearch(combined);
        saveResearchEpisodes(combined);
      }
    } catch {
      /* keep local */
    }
  }, []);

  const runLlm = useCallback(
    async (rows: IngestRow[]) => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: rows.map((r) => ({ ...r, text: r.text || "" })),
          provider,
          apiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "LLM analysis failed");
      const items = data.items || [];
      return rows.map((row, i) => {
        const base = heuristicAnalyze(row, research.length + i);
        const ai = items.find((x: { inputIndex: number }) => x.inputIndex === i) || items[i];
        if (!ai) return base;
        return {
          ...base,
          relevance: ai.relevance ?? base.relevance,
          scenario: ai.scenario ?? base.scenario,
          remembers: ai.remembers ?? base.remembers,
          forgot: ai.forgot ?? base.forgot,
          query: ai.query ?? base.query,
          searchStrategy: ai.searchStrategy ?? base.searchStrategy,
          refinements: ai.refinements ?? base.refinements,
          outcome: ai.outcome ?? base.outcome,
          succeeded: ai.succeeded ?? base.succeeded,
          whyFailed: ai.whyFailed ?? base.whyFailed,
          workaround: ai.workaround ?? base.workaround,
          failureCode: ai.failureCode ?? base.failureCode,
          failureRationale: ai.failureRationale ?? base.failureRationale,
          strength: ai.strength ?? base.strength,
          archetypeId: ai.archetypeHint || base.archetypeId,
          searchBehaviors: ai.searchBehaviors ?? base.searchBehaviors,
          memory: ai.memory ?? base.memory,
        } as Episode;
      });
    },
    [apiKey, provider, research.length],
  );

  const ingestRows = useCallback(
    async (rows: IngestRow[], useLlm: boolean) => {
      setAnalyzing(true);
      try {
        const valid = rows.filter((r) => (r.text || "").trim().length > 0);
        if (!valid.length) return "No rows with text.";
        let analyzed: Episode[];
        if (useLlm) analyzed = await runLlm(valid);
        else analyzed = valid.map((r, i) => heuristicAnalyze(r, research.length + i));
        persist([...research, ...analyzed]);
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Ingest failed";
      } finally {
        setAnalyzing(false);
      }
    },
    [persist, research, runLlm],
  );

  const addManual = useCallback(
    (row: IngestRow, useLlm: boolean) => ingestRows([row], useLlm),
    [ingestRows],
  );

  const clearResearch = useCallback(() => {
    setResearch([]);
    saveResearchEpisodes([]);
    setMode("demo");
  }, [setMode]);

  const episodes = useMemo(
    () => (ready ? episodesForMode(mode, research) : DEMO_EPISODES),
    [mode, ready, research],
  );

  const value = useMemo(
    () => ({
      ready,
      mode,
      setMode,
      episodes,
      research,
      ingestRows,
      addManual,
      clearResearch,
      apiKey,
      provider,
      setApi,
      analyzing,
      refreshResearch,
    }),
    [
      ready,
      mode,
      setMode,
      episodes,
      research,
      ingestRows,
      addManual,
      clearResearch,
      apiKey,
      provider,
      setApi,
      analyzing,
      refreshResearch,
    ],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useStore() {
  const v = useContext(C);
  if (!v) throw new Error("useStore");
  return v;
}
