# Case Study — EdTech-Policy-Framework

**Repository:** [EdTech-Policy-Framework](https://github.com/Freddricklogan/EdTech-Policy-Framework) · **Live demo:** [freddricklogan.github.io/EdTech-Policy-Framework](https://freddricklogan.github.io/EdTech-Policy-Framework/) · **Author:** Freddrick Logan

---

## 1. Who has this problem

Anyone who sits on an instructional-technology committee. A provost's office, a K-12 district technology director, a procurement team asked to sign a three-year contract for a platform that will hold student data. They need a policy lifecycle they can point to, a governance chart that says who decides, a compliance map, an implementation plan and, most often, a way to score a vendor's product against criteria that were agreed before the vendor walked in.

## 2. The problem, as a scenario

A committee of eight meets to evaluate two learning platforms. Someone has printed the rubric: six categories, twenty-six criteria, a 0–4 scale, weights in the margin. Each member scores on paper; a chair averages the columns in a spreadsheet after the meeting. One platform's incident-response line was scored 1 by three members, which the rubric says fails the privacy threshold outright. Averaged into a category score of 2.4, it looks fine. The platform passes. Nobody lied; the arithmetic simply did not enforce the rule that was written two pages above it.

## 3. What it costs to leave it alone

A rubric that is not executable is a suggestion. The thresholds that matter most — privacy lines that must each clear 2, WCAG compliance that must clear 2, any 0 disqualifying — are precisely the ones a spreadsheet average hides. The cost is a procurement record that cannot be defended when a parent, an auditor or an accessibility complaint asks how the decision was reached. The lesser cost is that the framework itself, six documents readable only as raw Markdown on GitHub, was not something I could hand to a committee chair and expect to be read.

## 4. The approach, and the alternative I rejected

I rejected rewriting the framework as a web application with accounts, saved evaluations and a database. Committees do not want a system to log into; they want the document and a way to apply it that leaves a record in their own minutes. So the framework became a static MkDocs site, and the rubric became one page on that site: twenty-six selects, an outcome sentence that updates as you score, and a Markdown export you paste wherever your institution keeps decisions. The scoring arithmetic lives in a pure module with tests; the page only binds it to the form. Nothing leaves the browser.

I also rejected inventing a "research base" for the framework. The old README called it research-backed; it cites no studies, and I removed the word rather than add citations I had not read.

## 5. What the code does today

`docs/assets/lib/rubric.js` holds the six categories with their weights (25, 20, 20, 15, 10 and 10 percent), the twenty-six criteria, the 0–4 scale and the three thresholds, all transcribed from `docs/technology-evaluation-rubric.md`. `evaluate()` validates every score as an integer 0–4 or null, averages each category over its scored lines, renormalises weights over categories with at least one score, and reports failures for any privacy line under 2, a WCAG line under 2, or an overall below 2.5. Any 0 disqualifies. The outcome stays "Incomplete" until every line is scored, so a partial form can show a threshold failure but never a pass. `toMarkdown()` writes the outcome, the category table and every line's score with its label.

`docs/assets/rubric-page.js` builds the form from the same constants, re-evaluates on each change and offers a copy button. `docs/assets/site.js` mounts the Executive Shell — badges, KPIs, a two-step tour — on every page of the site. The CI pipeline lints, runs the tests with coverage, builds the site with `mkdocs build --strict`, runs npm audit and Trivy, and deploys to GitHub Pages.

## 6. Evidence

Six Vitest tests pass and cover 100 percent of statements in the rubric module. They pin the cases that motivated the tool: a single 0 disqualifies; a privacy line of 1 fails while the form is still incomplete; unscored categories are excluded and weights renormalised; a complete, compliant form returns the pass outcome; invalid input throws. `mkdocs build --strict` completes with no warnings. A headless-Chrome smoke of the built site found 26 selects, saw the outcome move from Incomplete through a privacy failure to a pass at an overall of 3.05, logged no console errors, and showed no horizontal overflow at 1280 or 400 pixels.

## 7. What it would take to run this in production

It already runs as a static site; production for a committee means adopting it. That is a governance question, not a technical one: the weights and thresholds should be ratified by the body that will use them, then changed in the one module where they live, with the tests updated to match. If an institution wants saved evaluations and multi-rater aggregation, the module is the piece to keep and a form backend is the piece to add.

## 8. Limits and next steps

The rubric encodes one institution's judgement about weights; the tool makes that judgement enforceable, not correct. There is no multi-rater mode, so a committee still reconciles individual exports by hand. The site sets no Content-Security-Policy because Material for MkDocs relies on inline scripts; the tool's own code has no inline handlers. The other framework documents remain advice without evaluation instruments, and the next step is to give the compliance framework the same treatment: a checklist that produces a record.

## 9. Who should look at this

Technology and academic leaders who need a procurement evaluation they can defend, and anyone assessing whether I can turn a policy document into a working instrument without losing what the document said.
