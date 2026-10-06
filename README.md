# Photo Retrieval Discovery Engine

Streamlit research app for a Google Photos product-management case:

> When people remember that a photo exists but cannot precisely describe it, what prevents them from retrieving it?

This is **not** sentiment analysis. The unit of analysis is a **retrieval episode**.

The app uses **OpenRouter** (`google/gemini-2.5-flash`) for LLM processing and **Tavily** for public web search:

```text
Streamlit → OpenRouter API → google/gemini-2.5-flash
Tavily → Public web search → Evidence → OpenRouter → Gemini 2.5 Flash → AI analysis
```

> Public online discussions are directional qualitative evidence and are not representative of all Google Photos users. Findings must be validated through primary user research.

> AI interpretations are hypotheses derived from evidence and are not direct user statements.

## Run locally

```bash
python -m pip install -r requirements.txt
python -m streamlit run app.py
```

Open the URL Streamlit prints (usually http://localhost:8501).

### Demo (no API keys)

1. Dataset → **Demo**
2. Explore Overview, Evidence, Archetypes, Memory Map, Funnel, Opportunity, Hypotheses, Report
3. Every demo page shows **DEMO DATA — SYNTHETIC EXAMPLES — NOT REAL USER EVIDENCE**

### Real research

**Load collected public corpus** (no Tavily key): uses `evidence/retrieval-episodes.json` (public quotes + URLs collected earlier).

**Run Real Research** needs Tavily for public web search. LLM processing uses OpenRouter (optional; heuristic extraction still runs without it).

#### Local secrets

Create `.streamlit/secrets.toml` (gitignored):

```toml
OPENROUTER_API_KEY = "your-openrouter-api-key"
TAVILY_API_KEY = "your-tavily-api-key"
OPENROUTER_MODEL = "google/gemini-2.5-flash"
```

Never put real credentials in the repository or README. Copy from `.streamlit/secrets.toml.example`.

## Deploy: GitHub → Streamlit Community Cloud

1. Push this repository to GitHub (do **not** commit `.streamlit/secrets.toml` or `.env`).
2. Go to [share.streamlit.io](https://share.streamlit.io) and sign in with GitHub.
3. **New app** → select the repo and branch.
4. Main file path: `app.py`
5. Python version: 3.11 or 3.12
6. **Advanced settings → Secrets** paste:

```toml
OPENROUTER_API_KEY = "your-openrouter-api-key"
TAVILY_API_KEY = "your-tavily-api-key"
OPENROUTER_MODEL = "google/gemini-2.5-flash"
```

7. Deploy.

Demo Mode works even if secrets are empty.

## Project layout

```text
app.py
requirements.txt
src/           llm (OpenRouter), search (Tavily), extraction, verification, clustering, scoring, pipeline
data/          demo_evidence.csv, research.db (created at runtime)
evidence/      optional collected public JSON
```

## Integrity

Never mix demo rows with real research stats. Scores are among analyzed public episodes, not “% of Google Photos users.”

**AI discovery generates hypotheses. Primary user research validates them.**
