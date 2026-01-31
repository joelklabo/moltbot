---
name: using-quicken-web
description: Automate Quicken Web (app.quicken.com) using Clawdbot browser automation for sign-in, MFA via Gmail (gog), navigation to accounts/transactions, categorizing transactions, and marking them reviewed. Use when you need the agent to log into Quicken Web, fetch the email verification code automatically, and perform routine register work (review/categorize/export) via the web UI.
---

# Using Quicken Web

Automate Quicken Web (`https://app.quicken.com`) using Clawdbot’s `browser` tool (not Playwright scripts), including login + MFA code retrieval via Gmail (`gog`).

## Workflow

### 0) Preconditions

- **Browser profile:** default to the **clawd-managed browser** (fresh, reliable). Only use Chrome-extension relay if we explicitly need an already-logged-in tab.
- **Credentials:** prefer `op` (1Password) item title `Quicken` when available. If credentials aren’t accessible, ask the user to paste them.
- **MFA delivery:** choose **email** delivery so the agent can fetch the code via `gog`.

### 1) Sign in to Quicken Web

1. Open `https://app.quicken.com/`.
2. If a “Sign in” / “Log in” entry point is visible, click it.
3. Complete the login form.
4. If asked for a verification code:
   - Click the option that sends the code to **email** (avoid SMS/iMessage).
   - Use the helper script to fetch the code:
     - `python3 scripts/get_quicken_mfa_code.py --max-age-min 30`
   - Type the code into the verification input and submit.

**Stop conditions:** if you hit CAPTCHA / “unusual activity” / repeated failed attempts, stop and ask the user to take over rather than looping.

### 2) Navigate to Transactions

- Preferred landing page:
  - `https://app.quicken.com/transactions?displayNode=all`
- If Quicken UI changes, use the left nav to reach **Transactions** / **Banking** register view.

### 3) Refresh / sync

- At the start of each run, click **Refresh All** (or equivalent) to ensure the register reflects latest synced data.

### 4) Categorize + review workflow

1. Filter to “Needs review” / “Uncategorized” if available.
2. For each uncategorized row:
   - Prefer selecting an **existing** category.
   - If unsure, search transaction history for the same payee and mirror the prior category.
   - If still ambiguous, ask the user what category to use.
3. Mark transactions as **Reviewed** once categorized.

### 5) Logging (lightweight)

Write a short note to `~/Shared/quicken-imports/YYYY-MM-DD/run.log`:
- What you reviewed (accounts/pages)
- Count of transactions categorized
- Any remaining uncategorized payees needing user input

## Debugging & selector drift

If the UI changes and automation breaks:
- Take screenshots.
- Capture a quick DOM snapshot from the page.
- Update `references/quicken-web-selectors.md` with new selectors and notes.

## Resources

### scripts/
- `get_quicken_mfa_code.py`: fetch the latest Quicken email verification code using `gog`.

### references/
- `quicken-web-selectors.md`: notes for common UI landmarks/selectors and drift debugging.
