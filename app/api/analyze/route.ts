import { NextRequest, NextResponse } from "next/server";

type Body = {
  texts: { id?: string; source?: string; url?: string; date?: string; title?: string; author?: string; text: string }[];
  provider?: "openai" | "gemini";
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const envKey =
      body.provider === "gemini"
        ? process.env.GEMINI_API_KEY
        : process.env.OPENAI_API_KEY;
    const apiKey = body.apiKey || envKey;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "No LLM API key configured. Use heuristic analysis (works without a key) or add OPENAI_API_KEY / GEMINI_API_KEY on the server, or paste a key in Settings (sent only to this API route, never stored in the repo).",
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

    if (body.provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: `${SYSTEM}\n\nDATA:\n${payload}` }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        },
      );
      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: err.slice(0, 800) }, { status: 502 });
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      return NextResponse.json(JSON.parse(text));
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: payload },
        ],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err.slice(0, 800) }, { status: 502 });
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    return NextResponse.json(JSON.parse(text));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 },
    );
  }
}
