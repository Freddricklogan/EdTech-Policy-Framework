# AUDIT — EdTech-Policy-Framework (pre-refactor)

Audit of the previous build: six Markdown documents (about 5,100
words) and a README, no site, no code, no tests. The README linked to
`https://freddricklogan.github.io/edtech-policy-framework/`, which
answered 200 only because a stale copy of the folder sits in the
user-site repository; this repository had no Pages configuration and
no workflow.

---

## A. Claims the documents could not support

### A1 — "research-backed"
README line 13 called the framework "comprehensive, research-backed".
The documents cite no studies. **Fix:** "structured". The rubric's
"Research evidence" criterion still asks the *evaluator* for evidence
about a tool — that is a question, not a claim.

### A2 — A rubric nobody could run
`docs/technology-evaluation-rubric.md` defines six weighted categories,
26 criteria, a 0–4 scale and three minimum thresholds, then leaves the
arithmetic to the reader. Weighted averages done by hand in a committee
meeting are where these rubrics go wrong: a 0 on one line is supposed
to disqualify, a privacy line below 2 is supposed to fail, and both
are easy to miss in a spreadsheet. **Fix:** `docs/assets/lib/rubric.js`
implements the document exactly (the module is 3 constants and 4
functions; the weights and thresholds are copied from the document,
not restated) and `tests/rubric.test.js` pins the behaviour, including
the two silent-failure cases above.

## B. Publishing

### B1 — No site
Six documents linked from a README table are readable on GitHub but
not navigable. **Fix:** MkDocs + Material, `strict` build in CI so a
broken cross-reference fails the pipeline rather than shipping.

### B2 — Wrong-case URL
The README's live link used `edtech-policy-framework` (lowercase). The
repository is `EdTech-Policy-Framework`. GitHub Pages resolves project
paths case-insensitively once the project site exists, so the old link
keeps working; the canonical `site_url` uses the repository's casing.

### B3 — Material's GitHub widget
`repo_url` in `mkdocs.yml` makes Material call the GitHub API for
release metadata on every page load; the repository has no releases,
so every page logged a 404 in the console. **Fix:** `repo_url` removed;
the Executive Shell carries the repository link instead.

## C. Content left as it was

The six framework documents are advice, not measurements; they contain
no statistics to verify. They were moved under `docs/` unchanged apart
from relative links.

## D. What was added

| Item | Where |
| --- | --- |
| Rubric scoring module (pure, tested) | `docs/assets/lib/rubric.js`, `tests/rubric.test.js` |
| Rubric page (form, live outcome, Markdown export) | `docs/tools/rubric.md`, `docs/assets/rubric-page.js` |
| Executive Shell on every page | `docs/assets/site.js`, `docs/assets/shell/` |
| MkDocs site, strict | `mkdocs.yml`, `requirements.txt` |
| CI/CD (lint → tests → build → scan → Pages) + CodeQL | `.github/workflows/` |
| Case study | `docs/CASE_STUDY.md` |
