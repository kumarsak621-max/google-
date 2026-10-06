from __future__ import annotations

import hashlib
import json
import os
import sqlite3
from typing import Any

DB_PATH = os.path.join("data", "research.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  source TEXT,
  source_type TEXT,
  url TEXT,
  title TEXT,
  date TEXT,
  author TEXT,
  original_quote TEXT,
  retrieval_scenario TEXT,
  remembered_information TEXT,
  forgotten_information TEXT,
  search_attempt TEXT,
  search_strategy TEXT,
  search_outcome TEXT,
  failure_category TEXT,
  workaround TEXT,
  evidence_strength INTEGER,
  verification_status TEXT,
  ai_interpretation TEXT,
  synthetic INTEGER,
  payload TEXT
);
CREATE TABLE IF NOT EXISTS research_runs (
  id TEXT PRIMARY KEY,
  started_at TEXT,
  completed_at TEXT,
  queries_run INTEGER,
  pages_found INTEGER,
  pages_reviewed INTEGER,
  relevant_items INTEGER,
  verified_items INTEGER,
  duplicates_removed INTEGER,
  status TEXT,
  logs TEXT
);
"""


def connect() -> sqlite3.Connection:
    os.makedirs("data", exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.executescript(SCHEMA)
    return con


def fingerprint(quote: str, url: str) -> str:
    raw = (url + "::" + (quote or "")[:160]).encode("utf-8", errors="ignore")
    return hashlib.sha1(raw).hexdigest()[:12]


def upsert_evidence(rows: list[dict[str, Any]]) -> tuple[int, int]:
    con = connect()
    added = 0
    for r in rows:
        eid = r.get("id") or f"L{fingerprint(r.get('original_quote',''), r.get('url',''))}"
        r["id"] = eid
        r["duplicate_group"] = r.get("duplicate_group") or fingerprint(r.get("original_quote", ""), "")
        exists = con.execute("SELECT 1 FROM evidence WHERE id=?", (eid,)).fetchone()
        payload = json.dumps(r, ensure_ascii=False)
        vals = (
            eid,
            r.get("source", ""),
            r.get("source_type", ""),
            r.get("url", ""),
            r.get("title", ""),
            r.get("date", ""),
            r.get("author", ""),
            r.get("original_quote", ""),
            r.get("retrieval_scenario", ""),
            r.get("remembered_information", ""),
            r.get("forgotten_information", ""),
            r.get("search_attempt", ""),
            r.get("search_strategy", ""),
            r.get("search_outcome", ""),
            r.get("failure_category", ""),
            r.get("workaround", ""),
            int(r.get("evidence_strength") or 1),
            r.get("verification_status", "UNVERIFIED"),
            r.get("ai_interpretation", ""),
            1 if r.get("synthetic") else 0,
            payload,
        )
        con.execute(
            """INSERT OR REPLACE INTO evidence VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            vals,
        )
        if not exists:
            added += 1
    con.commit()
    total = con.execute("SELECT COUNT(*) FROM evidence WHERE synthetic=0").fetchone()[0]
    con.close()
    return total, added


def load_real() -> list[dict[str, Any]]:
    con = connect()
    rows = con.execute("SELECT payload FROM evidence WHERE synthetic=0").fetchall()
    con.close()
    out = []
    for r in rows:
        try:
            out.append(json.loads(r["payload"]))
        except json.JSONDecodeError:
            continue
    return out


def save_run(run: dict[str, Any]) -> None:
    con = connect()
    con.execute(
        """INSERT OR REPLACE INTO research_runs VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
        (
            run.get("id"),
            run.get("started_at"),
            run.get("completed_at"),
            run.get("queries_run", 0),
            run.get("pages_found", 0),
            run.get("pages_reviewed", 0),
            run.get("relevant_items", 0),
            run.get("verified_items", 0),
            run.get("duplicates_removed", 0),
            run.get("status", ""),
            json.dumps(run.get("logs") or []),
        ),
    )
    con.commit()
    con.close()
