import { NextRequest, NextResponse } from "next/server";

type Body = {
  texts: { id?: string; source?: string; url?: string; date?: string; title?: string; author?: string; text: string }[];
  apiKey?: string;
};

const SYSTEM = `You are a research analyst for Google Photos retrieval.
Analyze each conversation independently.
Never invent facts. Use "Unknown" when absent.
Ignore generic sentiment without a retrieval attempt.
Return JSON only: { "items": [ ... ] }
Each item:
{
  "inputIndex": number,
  "relevance": "relevant" | "possibly_relevant" | "irrelevant",
  "scenario": string,
  "remembers": string,
  "forgot": string,
  "query": string,
  "searchStrategy": string,
  "refinements": string,
  "outcome": "succeeded" | "failed" | "partial" | "unknown",
  "succeeded": boolean | null,
  "whyFailed": string,
  "workaround": string,
  "failureCode": "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K",
  "failureRationale": string,
  "strength": 1|2|3|4|5,
  "archetypeHint": string,
  "searchBehaviors": string[],
  "memory": {
    "temporal": string[],
    "spatial": string[],
    "semantic": string[],
    "contextual": string[],
    "visual": string[],
    "textual": string[],
    "social": string[]
  }
}`;

function parseJsonPayload(text: string): unknown {
  const trimmed = (text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error("OpenRouter returned invalid JSON.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const apiKey = body.apiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OpenRouter API key is not configured. Add OPENROUTER_API_KEY to Streamlit Secrets (or the server environment).",
        },
        { status: 400 },
      );
    }

    const payload = JSON.stringify(
      body.texts.map((t, i) => ({
        inputIndex: i,
        source: t.source,
        url: t.url,
        date: t.date,
        title: t.title,
        author: t.author,
        text: t.text,
      })),
    );

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Photo Retrieval Discovery Engine",
    };
    const referer = process.env.APP_URL;
    if (referer) headers["HTTP-Referer"] = referer;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: payload },
        ],
      }),
    });
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: "OpenRouter API key is invalid." }, { status: 401 });
    }
    if (res.status === 429) {
      return NextResponse.json({ error: "OpenRouter rate limit reached. Try again later." }, { status: 429 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: `OpenRouter request failed (HTTP ${res.status}).` }, { status: 502 });
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    return NextResponse.json(parseJsonPayload(text));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 },
    );
  }
}
