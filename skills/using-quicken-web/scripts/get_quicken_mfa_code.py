#!/usr/bin/env python3
"""Fetch the most recent Quicken email verification code via gog (Gmail).

Usage:
  python3 get_quicken_mfa_code.py
  python3 get_quicken_mfa_code.py --max-age-min 30

Prints the first 6-digit code found in the newest matching message.
Exits non-zero if no code is found.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import subprocess
import sys
from datetime import datetime, timedelta


DEFAULT_QUERY = "newer_than:2d (from:quicken OR from:noreply@quicken.com OR from:intuit) (subject:(Verify OR verification OR code OR security OR sign in OR login) OR body:(code OR verification))"


def run_json(cmd: list[str]) -> dict:
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"Command failed ({p.returncode}): {' '.join(cmd)}\n{p.stderr.strip()}")
    out = p.stdout.strip()
    if not out:
        return {}
    return json.loads(out)


def strip_html(s: str) -> str:
    s = html.unescape(s)
    # crude tag strip (good enough for codes)
    return re.sub(r"<[^>]+>", " ", s)


def extract_code(text: str) -> str | None:
    # Prefer 6-digit codes; Quicken commonly uses 6 digits.
    m = re.search(r"\b(\d{6})\b", text)
    if m:
        return m.group(1)
    # Fallback
    m = re.search(r"\b(\d{4,8})\b", text)
    return m.group(1) if m else None


def parse_message_body(msg: dict) -> str:
    # gog gmail get returns a JSON payload that includes a top-level 'body' field (HTML)
    body = msg.get("body")
    if isinstance(body, str) and body.strip():
        return body
    # fallback to other fields if the CLI output format changes
    for k in ("snippet", "text", "plain", "html"):
        v = msg.get(k)
        if isinstance(v, str) and v.strip():
            return v
    return ""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--query", default=DEFAULT_QUERY)
    ap.add_argument("--max", type=int, default=10, help="Max messages to scan")
    ap.add_argument("--max-age-min", type=int, default=0, help="If set, reject codes older than this many minutes")
    args = ap.parse_args()

    res = run_json(["gog", "gmail", "messages", "search", args.query, "--max", str(args.max), "--json"])
    msgs = res.get("messages") or []
    if not msgs:
        print("", end="")
        return 2

    now = datetime.now()

    for m in msgs:
        msg_id = m.get("id")
        if not msg_id:
            continue
        # Optional age filter (best-effort; the date format is CLI-dependent)
        if args.max_age_min:
            ds = m.get("date")
            if isinstance(ds, str) and ds.strip():
                try:
                    dt = datetime.strptime(ds, "%Y-%m-%d %H:%M")
                    if now - dt > timedelta(minutes=args.max_age_min):
                        continue
                except Exception:
                    pass

        full = run_json(["gog", "gmail", "get", msg_id, "--json"])
        body = parse_message_body(full)
        text = strip_html(body)
        code = extract_code(text)
        if code and code != "000000":
            sys.stdout.write(code)
            return 0

    print("", end="")
    return 3


if __name__ == "__main__":
    raise SystemExit(main())
