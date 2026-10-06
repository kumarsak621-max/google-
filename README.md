# Photo Retrieval Discovery Engine

Streamlit research app for a Google Photos product-management case:

> When people remember that a photo exists but cannot precisely describe it, what prevents them from retrieving it?

This is **not** sentiment analysis. The unit of analysis is a **retrieval episode**.

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

**Run Real Research** needs Tavily:

#### Local secrets

Create `.streamlit/secrets.toml` (gitignored):

```toml
TAVILY_API_KEY = "tvly-..."
OPENAI_API_KEY = "sk-..."
```

OpenAI is optional. Without it, heuristic extraction still runs.

## Deploy: GitHub → Streamlit Community Cloud

1. Push this repository to GitHub (do **not** commit `.streamlit/secrets.toml` or `.env`).
2. Go to [share.streamlit.io](https://share.streamlit.io) and sign in with GitHub.
3. **New app** → select the repo and branch.
4. Main file path: `app.py`
5. Python version: 3.11 or 3.12
6. **Advanced settings → Secrets** paste:

```toml
TAVILY_API_KEY = "tvly-..."
OPENAI_API_KEY = "sk-..."
```

7. Deploy.

Demo Mode works even if secrets are empty.

## Project layout

```text
app.py
requirements.txt
src/           search, extraction, verification, clustering, scoring, pipeline
data/          demo_evidence.csv, research.db (created at runtime)
evidence/      optional collected public JSON
```

## Integrity

Never mix demo rows with real research stats. Scores are among analyzed public episodes, not “% of Google Photos users.”

**AI discovery generates hypotheses. Primary user research validates them.**
