# Quicken Web selectors / landmarks (notes)

These are intentionally lightweight “drift notes”, not a contract.

## Stable-ish anchors

- Base URL: `https://app.quicken.com/`
- Transactions (often works directly): `https://app.quicken.com/transactions?displayNode=all`

## Login

Quicken’s login flow sometimes uses embedded frames / redirects.

If automation breaks:
- Take a screenshot of the login step.
- Identify whether the username/password inputs are inside an iframe.

## MFA

Email MFA codes usually appear as **6 digits** in a “Verify your Quicken account” email.

Use:
- `python3 scripts/get_quicken_mfa_code.py --max-age-min 30`

## Register work

When categorizing:
- Prefer keyboard-based selection + typing into category fields (less brittle than clicking nested widgets).
- If you must click: identify row-level containers (table row or grid row) and then find the category cell within that row.

## If you need the old selector set

See the legacy skill `quicken-classic-import` for prior verified selectors (2026-01-30).
