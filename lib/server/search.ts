export type SearchHit = {
  title: string;
  url: string;
  snippet: string;
  content?: string;
};

function provider(): "tavily" | "serper" {
  const p = (process.env.WEB_SEARCH_PROVIDER || "tavily").toLowerCase();
  return p === "serper" ? "serper" : "tavily";
}

export function searchConfig() {
  const key = process.env.WEB_SEARCH_API_KEY || "";
  return {
    configured: Boolean(key),
    provider: provider(),
    openai: Boolean(process.env.OPENAI_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    docs: {
      WEB_SEARCH_API_KEY: "Tavily API key by default. If WEB_SEARCH_PROVIDER=serper, this is the Serper API key.",
      WEB_SEARCH_PROVIDER: "tavily | serper",
      OPENAI_API_KEY: "Optional. Used to extract structured episodes from page text.",
      GEMINI_API_KEY: "Optional alternative LLM.",
      DATABASE_URL: "Optional Postgres URL. If unset, evidence is stored in data/store.json (Replit-safe file DB).",
    },
  };
}

export async function webSearch(query: string, max = 8): Promise<SearchHit[]> {
  const key = process.env.WEB_SEARCH_API_KEY;
  if (!key) throw new Error("WEB_SEARCH_API_KEY is not configured.");
  if (provider() === "serper") {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": key, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, num: max }),
    });
    if (!res.ok) throw new Error(`Serper error ${res.status}: ${(await res.text()).slice(0, 400)}`);
    const data = await res.json();
    const organic = (data.organic || []) as { title?: string; link?: string; snippet?: string }[];
    return organic
      .filter((r) => r.link)
      .map((r) => ({ title: r.title || "", url: r.link!, snippet: r.snippet || "" }));
  }

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      query,
      search_depth: "basic",
      max_results: max,
      include_raw_content: true,
    }),
  });
  if (!res.ok) throw new Error(`Tavily error ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  const results = (data.results || []) as {
    title?: string;
    url?: string;
    content?: string;
    raw_content?: string;
  }[];
  return results
    .filter((r) => r.url)
    .map((r) => ({
      title: r.title || "",
      url: r.url!,
      snippet: r.content || "",
      content: r.raw_content || r.content,
    }));
}

const SKIP_HOST = /(login|signin|accounts\.google|paywall)/i;

export async function fetchPublicPage(url: string): Promise<{ ok: boolean; text: string; status: number }> {
  if (SKIP_HOST.test(url)) return { ok: false, text: "", status: 0 };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "PhotoRetrievalDiscoveryEngine/1.0 (research; public pages only)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(t);
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 20000);
    return { ok: res.ok, text, status: res.status };
  } catch {
    return { ok: false, text: "", status: 0 };
  }
}
