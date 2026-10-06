from __future__ import annotations

import json

import pandas as pd
import plotly.express as px
import streamlit as st

from src.clustering import cluster_episodes
from src.config import keys_status
from src.database import save_run, upsert_evidence, load_real
from src.demo import demo_episodes, load_collected_public_json, write_demo_csv
from src.pipeline import run_research
from src.reporting import funnel_notes, memory_map, report_markdown
from src.scoring import hypotheses, score_archetype

st.set_page_config(
    page_title="Photo Retrieval Discovery Engine",
    page_icon="📷",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    """
<style>
  .block-container { padding-top: 1.4rem; max-width: 1200px; }
  h1, h2, h3 { font-weight: 500; letter-spacing: -0.02em; }
  .quote { border-left: 4px solid #1a73e8; padding: 0.75rem 1rem; background: #f8f9fa; }
  .interp { border-left: 4px solid #80868b; padding: 0.75rem 1rem; background: #fff; color: #3c4043; }
  .notice { background: #e8f0fe; padding: 0.75rem 1rem; border-radius: 8px; }
  .warn { background: #fef7e0; padding: 0.75rem 1rem; border-radius: 8px; }
</style>
""",
    unsafe_allow_html=True,
)

NOTICE = (
    "Public online discussions are directional qualitative evidence and are not "
    "representative of all Google Photos users. Findings must be validated through "
    "primary user research."
)
AI_NOTICE = "AI interpretations are hypotheses derived from evidence and are not direct user statements."


def init_state():
    if "page" not in st.session_state:
        st.session_state.page = "Landing"
    if "mode" not in st.session_state:
        st.session_state.mode = "demo"
    if "real" not in st.session_state:
        st.session_state.real = load_real() or []
    if "run" not in st.session_state:
        st.session_state.run = None
    if "logs" not in st.session_state:
        st.session_state.logs = []


def episodes_for_mode() -> list[dict]:
    if st.session_state.mode == "demo":
        return demo_episodes()
    return st.session_state.real


def go(page: str, mode: str | None = None):
    if mode:
        st.session_state.mode = mode
    st.session_state.page = page


def banner():
    st.caption(NOTICE)
    st.caption(AI_NOTICE)
    if st.session_state.mode == "demo":
        st.markdown(
            '<div class="warn">⚠️ DEMO DATA — SYNTHETIC EXAMPLES — NOT REAL USER EVIDENCE</div>',
            unsafe_allow_html=True,
        )
    else:
        st.markdown(
            '<div class="notice"><strong>REAL PUBLIC WEB EVIDENCE</strong> — among analyzed conversations only, not a user census.</div>',
            unsafe_allow_html=True,
        )


def sidebar():
    st.sidebar.title("Photo Retrieval Discovery Engine")
    st.sidebar.caption("Understanding how people retrieve visual memories when exact metadata is missing")

    mode_label = st.sidebar.radio(
        "Dataset",
        ["Demo", "Real research"],
        index=0 if st.session_state.mode == "demo" else 1,
    )
    st.session_state.mode = "demo" if mode_label == "Demo" else "research"

    pages = [
        "Landing",
        "Overview",
        "Evidence Explorer",
        "Retrieval Archetypes",
        "Memory Map",
        "Retrieval Funnel",
        "Opportunity Matrix",
        "Research Hypotheses",
        "Research Report",
        "Run Real Research",
    ]
    st.sidebar.radio("Pages", pages, key="page")

    st.sidebar.markdown("## Research Configuration")
    depth = st.sidebar.selectbox("Search depth", ["Quick", "Standard", "Deep"])
    sources = st.sidebar.multiselect(
        "Sources",
        ["Reddit", "Google Photos Community", "App reviews", "Forums", "YouTube", "Other public web"],
        default=["Reddit", "Google Photos Community", "App reviews"],
    )
    max_results = st.sidebar.number_input("Maximum results", 10, 300, 100, 10)
    quality = st.sidebar.slider("Evidence quality threshold", 1, 5, 4)
    keys = keys_status()
    st.sidebar.write("Tavily:", "configured" if keys["tavily"] else "missing")
    st.sidebar.write("OpenAI:", "configured" if keys["openai"] else "optional / heuristic")
    return depth, sources, max_results, quality, keys


def page_landing():
    st.title("Photo Retrieval Discovery Engine")
    st.subheader("Understanding how people retrieve visual memories when exact metadata is missing")
    st.write(
        "An AI-powered research engine that converts public user conversations into structured "
        "evidence about memory, search behavior, retrieval failure, and product opportunities."
    )
    st.info(NOTICE)
    c1, c2, c3 = st.columns(3)
    if c1.button("Explore Demo", type="primary"):
        go("Overview", "demo")
        st.rerun()
    if c2.button("Run Real Research"):
        go("Run Real Research", "research")
        st.rerun()
    if c3.button("View Evidence"):
        go("Evidence Explorer")
        st.rerun()
    st.markdown(
        "**Analyzes:** Memory → search expression → search behavior → retrieval failure → workaround → opportunity. "
        "This is not sentiment analysis."
    )


def analytics(eps: list[dict]):
    arch = cluster_episodes(eps)
    n = max(len([e for e in eps if int(e.get("evidence_strength") or 0) >= 3]), 1)
    arch = [score_archetype(a, n) for a in arch]
    hyps = hypotheses(eps)
    return arch, hyps


def page_overview(eps: list[dict]):
    banner()
    hq = [e for e in eps if int(e.get("evidence_strength") or 0) >= 2]
    ver = sum(1 for e in eps if e.get("verification_status") == "VERIFIED")
    suc = sum(1 for e in hq if e.get("search_outcome") == "succeeded")
    fail = sum(1 for e in hq if e.get("search_outcome") == "failed")
    arch, _ = analytics(eps)
    top = arch[0] if arch else None
    a, b, c, d, e, f, g = st.columns(7)
    a.metric("Verified", ver)
    b.metric("Sources", len({x.get("source") for x in eps}))
    c.metric("Retrieval episodes", len(hq))
    d.metric("Successful", suc)
    e.metric("Failed", fail)
    f.metric("Archetypes", len(arch))
    g.metric("Top opportunity", (top or {}).get("name", "—")[:24])
    st.caption(f"Among {len(hq)} episodes in this dataset — not % of Google Photos users.")

    df_fail = pd.DataFrame(Counter_safe(eps, "failure_category"))
    df_out = pd.DataFrame(Counter_safe(eps, "search_outcome"))
    df_scen = pd.DataFrame(Counter_safe(eps, "retrieval_scenario")[:12])
    col1, col2 = st.columns(2)
    if not df_fail.empty:
        col1.plotly_chart(px.bar(df_fail, x="count", y="name", orientation="h", title="Failure categories"), use_container_width=True)
    if not df_out.empty:
        col2.plotly_chart(px.bar(df_out, x="count", y="name", orientation="h", title="Outcomes"), use_container_width=True)
    if not df_scen.empty:
        st.plotly_chart(px.bar(df_scen, x="count", y="name", orientation="h", title="Retrieval scenarios (top)"), use_container_width=True)

    if top:
        st.markdown("## Strongest Observed Retrieval Problem")
        st.write(top["name"])
        st.markdown("### What users remember")
        st.write(top.get("remembered"))
        st.markdown("### What users forget")
        st.write(top.get("forgotten"))
        st.markdown("### Where retrieval breaks")
        st.write(top.get("failure_point"))
        st.markdown("### Current workaround")
        st.write(top.get("workaround"))
        st.markdown("### Supporting evidence")
        st.write(", ".join(top.get("evidence_ids") or []))
        for u in (top.get("urls") or [])[:5]:
            st.write(u)
        st.markdown("### Opportunity")
        st.write(f"Score {top.get('opportunity_score')} — {top.get('score_rationale')}")
        st.markdown("### Confidence")
        st.write("Medium for public qualitative evidence. High that the job exists in this corpus. Low for population prevalence.")
        st.markdown("### What must be validated through interviews")
        st.write("- Recreate a document/screenshot find using only a remembered word.")
        st.write("- Recreate a trip or class-noun find that needs dates on a full list.")
        st.write("- Recreate a person find with a missed face.")
        st.write("- Recreate a place with no official name.")
        st.success("**AI discovery generates hypotheses. Primary user research validates them.**")


def Counter_safe(eps, field):
    from collections import Counter

    c = Counter((e.get(field) or "Unknown")[:80] for e in eps)
    return [{"name": k, "count": v} for k, v in c.most_common(10)]


def page_evidence(eps: list[dict]):
    banner()
    st.header("Evidence Explorer")
    q = st.text_input("Search quotes, IDs, queries")
    c1, c2, c3, c4 = st.columns(4)
    sources = ["all"] + sorted({e.get("source") or "" for e in eps})
    fails = ["all"] + sorted({e.get("failure_category") or "" for e in eps})
    outcomes = ["all", "succeeded", "failed", "partial", "unknown"]
    strengths = ["all", "5", "4", "3", "2", "1"]
    src = c1.selectbox("Source", sources)
    fail = c2.selectbox("Failure", fails)
    outc = c3.selectbox("Outcome", outcomes)
    strn = c4.selectbox("Strength", strengths)
    arches = ["all"] + sorted({e.get("archetype_id") or "" for e in eps})
    arch = st.selectbox("Archetype", arches)

    view = []
    for e in eps:
        if q:
            blob = json.dumps(e).lower()
            if q.lower() not in blob:
                continue
        if src != "all" and e.get("source") != src:
            continue
        if fail != "all" and e.get("failure_category") != fail:
            continue
        if outc != "all" and e.get("search_outcome") != outc:
            continue
        if strn != "all" and str(e.get("evidence_strength")) != strn:
            continue
        if arch != "all" and e.get("archetype_id") != arch:
            continue
        view.append(e)
    st.caption(f"{len(view)} of {len(eps)} items. Strength 4–5 should drive conclusions.")
    table = pd.DataFrame(
        [
            {
                "ID": e.get("id"),
                "Source": e.get("source"),
                "Strength": e.get("evidence_strength"),
                "Outcome": e.get("search_outcome"),
                "Failure": e.get("failure_category"),
                "Verification": e.get("verification_status"),
                "Scenario": (e.get("retrieval_scenario") or "")[:80],
            }
            for e in view
        ]
    )
    st.dataframe(table, use_container_width=True, hide_index=True)
    ids = [e.get("id") for e in view]
    if ids:
        pick = st.selectbox("Open evidence", ids)
        e = next(x for x in view if x.get("id") == pick)
        show_item(e)


def show_item(e: dict):
    st.markdown("### ORIGINAL USER EVIDENCE")
    st.markdown(f'<div class="quote">{e.get("original_quote")}</div>', unsafe_allow_html=True)
    if e.get("url"):
        st.markdown(f"**Source URL:** [{e.get('url')}]({e.get('url')})")
    st.write("**What user remembers:**", e.get("remembered_information"))
    st.write("**What user forgot:**", e.get("forgotten_information"))
    st.write("**Search attempted:**", e.get("search_attempt"))
    st.write("**Outcome:**", e.get("search_outcome"))
    st.write("**Failure:**", e.get("failure_category"))
    st.write("**Workaround:**", e.get("workaround"))
    st.markdown("### AI INTERPRETATION")
    st.markdown(f'<div class="interp">{e.get("ai_interpretation")}</div>', unsafe_allow_html=True)
    st.caption(f"Verification: {e.get('verification_status')} · Strength {e.get('evidence_strength')} · {e.get('source')}")


def page_archetypes(eps: list[dict]):
    banner()
    st.header("Retrieval Archetypes")
    arch, _ = analytics(eps)
    if not arch:
        st.write("Not enough episodes to cluster.")
        return
    pick = st.selectbox("Archetype", [a["name"] for a in arch])
    a = next(x for x in arch if x["name"] == pick)
    st.subheader(a["name"])
    st.write(a["description"])
    st.write(f"Among {a['evidence_count']} episodes in this cluster.")
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Severity", a.get("severity"))
    m2.metric("AI opportunity", a.get("ai_opportunity"))
    m3.metric("Opportunity score", a.get("opportunity_score"))
    m4.metric("Frequency score", a.get("score_frequency"))
    st.write("**Remember:**", a.get("remembered"))
    st.write("**Forget:**", a.get("forgotten"))
    st.write("**Search:**", a.get("search_behavior"))
    st.write("**Failure:**", a.get("failure_point"))
    st.write("**Workaround:**", a.get("workaround"))
    st.write("**Evidence IDs:**", ", ".join(a.get("evidence_ids") or []))
    for u in a.get("urls") or []:
        st.write(u)
    for q in a.get("quotes") or []:
        st.markdown(f'<div class="quote">{q}</div>', unsafe_allow_html=True)
    idset = set(a.get("evidence_ids") or [])
    for e in eps:
        if e.get("id") in idset:
            with st.expander(e.get("id")):
                show_item(e)


def page_memory(eps: list[dict]):
    banner()
    st.header("Memory Map")
    st.caption("Counts among episodes in this dataset — not population prevalence.")
    rows = memory_map(eps)
    st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
    st.plotly_chart(
        px.bar(pd.DataFrame(rows), x="Memory type", y=["Remembered", "Forgotten"], barmode="group"),
        use_container_width=True,
    )


def page_funnel(eps: list[dict]):
    banner()
    st.header("Retrieval Funnel")
    st.caption("Stage notes are evidence observations. These are not conversion percentages.")
    for row in funnel_notes(eps):
        st.markdown(f"**{row['stage']}** · observed n={row['n']}")
        st.write(row["note"])


def page_opportunity(eps: list[dict]):
    banner()
    st.header("Opportunity Matrix")
    arch, _ = analytics(eps)
    rows = [
        {
            "Problem": a["name"],
            "Frequency": a.get("score_frequency"),
            "Severity": a.get("score_severity"),
            "Evidence": a.get("score_evidence"),
            "AI leverage": a.get("score_ai"),
            "Feasibility": a.get("score_feasibility"),
            "Strategic value": a.get("score_strategic"),
            "Opportunity": a.get("opportunity_score"),
        }
        for a in arch
    ]
    st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
    if arch:
        pick = st.selectbox("Inspect", [a["name"] for a in arch])
        a = next(x for x in arch if x["name"] == pick)
        st.write(a.get("score_rationale"))
        for eid in a.get("evidence_ids") or []:
            e = next((x for x in eps if x.get("id") == eid), None)
            if e:
                with st.expander(eid):
                    show_item(e)


def page_hypotheses(eps: list[dict]):
    banner()
    st.header("Research Hypotheses")
    st.write("For 5–6 user interviews. No MVP is proposed.")
    for h in hypotheses(eps):
        st.subheader(h["id"])
        st.write(h["hypothesis"])
        st.write("**Supporting evidence:**", ", ".join(h["support"][:15]) or "none in this dataset")
        st.write("**Contradicting evidence:**", ", ".join(h["contradict"][:15]) or "none in this dataset")
        st.write("**Confidence:**", h["confidence"])
        st.write("**Interview question:**", h["interview"])


def page_report(eps: list[dict]):
    banner()
    st.header("Research Report")
    arch, hyps = analytics(eps)
    md = report_markdown(eps, arch, hyps, st.session_state.mode)
    st.markdown(md)
    exports(eps, arch, hyps, md)


def exports(eps, arch, hyps, md):
    st.subheader("Export")
    df = pd.DataFrame(eps)
    csv = df.to_csv(index=False).encode("utf-8")
    st.download_button("Download Evidence CSV", csv, "evidence.csv", "text/csv")
    st.download_button(
        "Download JSON",
        json.dumps({"mode": st.session_state.mode, "episodes": eps, "archetypes": arch}, indent=2, ensure_ascii=False),
        "dataset.json",
        "application/json",
    )
    op = pd.DataFrame(
        [
            {
                "Problem": a["name"],
                "Frequency": a.get("score_frequency"),
                "Severity": a.get("score_severity"),
                "Evidence": a.get("score_evidence"),
                "AI leverage": a.get("score_ai"),
                "Feasibility": a.get("score_feasibility"),
                "Strategic": a.get("score_strategic"),
                "Opportunity": a.get("opportunity_score"),
                "IDs": ",".join(a.get("evidence_ids") or []),
            }
            for a in arch
        ]
    )
    st.download_button("Download Opportunity Matrix", op.to_csv(index=False).encode("utf-8"), "opportunity.csv", "text/csv")
    st.download_button("Download Research Report", md.encode("utf-8"), "research-report.md", "text/markdown")


def page_research(depth, sources, max_results, quality, keys):
    st.header("Run Real Research")
    st.markdown(
        '<div class="notice"><strong>REAL PUBLIC WEB EVIDENCE</strong></div>',
        unsafe_allow_html=True,
    )
    st.info(NOTICE)
    if not keys["tavily"]:
        st.warning(
            "TAVILY_API_KEY is not configured. Demo Mode still works.\n\n"
            "On Streamlit Community Cloud: App settings → Secrets:\n\n"
            "```toml\nTAVILY_API_KEY = \"tvly-...\"\nOPENAI_API_KEY = \"sk-...\"\n```\n\n"
            "Locally, set environment variables or `.streamlit/secrets.toml` (never commit secrets)."
        )
    col1, col2 = st.columns(2)
    if col1.button("Load collected public corpus"):
        rows = load_collected_public_json()
        if not rows:
            st.error("No file at evidence/retrieval-episodes.json")
        else:
            upsert_evidence(rows)
            st.session_state.real = load_real()
            st.session_state.mode = "research"
            st.success(f"Loaded {len(rows)} previously collected public episodes with original quotes and URLs.")
            st.rerun()
    run_disabled = not keys["tavily"]
    if col2.button("Run Real Research", type="primary", disabled=run_disabled):
        box = st.empty()
        logs: list[str] = []

        def progress(msg: str):
            logs.append(msg)
            box.code("\n".join(logs[-20:]))

        try:
            result = run_research(sources, depth, int(max_results), int(quality), progress, use_llm=keys["openai"])
            upsert_evidence(result["episodes"])
            save_run(result)
            st.session_state.real = load_real()
            st.session_state.run = result
            st.session_state.mode = "research"
            st.success("Research run complete. Switch Dataset to Real research to explore.")
        except Exception as ex:
            st.error(str(ex))
            st.info("Demo Mode remains available.")

    if st.session_state.run:
        r = st.session_state.run
        st.subheader("Last run")
        st.write(
            f"Queries {r.get('queries_run')} · results {r.get('pages_found')} · reviewed {r.get('pages_reviewed')} · "
            f"relevant {r.get('relevant_items')} · verified {r.get('verified_items')} · duplicates {r.get('duplicates_removed')}"
        )
        st.code("\n".join(r.get("logs") or []))
        dist = pd.DataFrame(Counter_safe(st.session_state.real, "source_type"))
        if not dist.empty:
            st.plotly_chart(px.bar(dist, x="name", y="count", title="Source distribution"), use_container_width=True)


def main():
    init_state()
    write_demo_csv()
    depth, sources, max_results, quality, keys = sidebar()
    page = st.session_state.page
    eps = episodes_for_mode()
    if page == "Landing":
        page_landing()
    elif page == "Overview":
        page_overview(eps)
    elif page == "Evidence Explorer":
        page_evidence(eps)
    elif page == "Retrieval Archetypes":
        page_archetypes(eps)
    elif page == "Memory Map":
        page_memory(eps)
    elif page == "Retrieval Funnel":
        page_funnel(eps)
    elif page == "Opportunity Matrix":
        page_opportunity(eps)
    elif page == "Research Hypotheses":
        page_hypotheses(eps)
    elif page == "Research Report":
        page_report(eps)
    else:
        page_research(depth, sources, max_results, quality, keys)


if __name__ == "__main__":
    main()
