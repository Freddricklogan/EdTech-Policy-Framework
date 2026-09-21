/** Technology Evaluation Rubric scorer — the weights, criteria and thresholds are those in
 * docs/technology-evaluation-rubric.md; the arithmetic is the only thing this module adds. */

export const CATEGORIES = [
  { id: 'pedagogy', name: 'Pedagogical Alignment', weight: 0.25, criteria: ['Learning objective support', 'Active learning', 'Assessment integration', 'Differentiation', 'Research evidence'] },
  { id: 'accessibility', name: 'Accessibility', weight: 0.2, criteria: ['WCAG compliance', 'Screen reader compatibility', 'Keyboard navigation', 'Captioning and transcription', 'Multilingual support'] },
  { id: 'privacy', name: 'Privacy and Security', weight: 0.2, criteria: ['Data handling', 'Compliance certifications', 'Data ownership', 'Incident response'] },
  { id: 'usability', name: 'Usability', weight: 0.15, criteria: ['Learning curve', 'Mobile experience', 'Technical requirements', 'Support resources'] },
  { id: 'cost', name: 'Cost and Sustainability', weight: 0.1, criteria: ['Pricing model', 'Total cost of ownership', 'Vendor stability', 'Contract flexibility'] },
  { id: 'integration', name: 'Integration and Scalability', weight: 0.1, criteria: ['LMS integration', 'SSO support', 'API availability', 'Scalability'] }
];
export const SCALE = { 4: 'Excellent', 3: 'Good', 2: 'Adequate', 1: 'Poor', 0: 'Unacceptable' };
export const THRESHOLDS = { privacyMinEach: 2, wcagMin: 2, overallMin: 2.5 };

/** scores: { [categoryId]: number[] } aligned with each category's criteria; unscored = null. */
export function validate(scores) {
  const problems = [];
  for (const c of CATEGORIES) {
    const arr = scores[c.id];
    if (!Array.isArray(arr) || arr.length !== c.criteria.length) { problems.push(`${c.name}: expected ${c.criteria.length} scores`); continue; }
    arr.forEach((s, i) => { if (s !== null && !(Number.isInteger(s) && s >= 0 && s <= 4)) problems.push(`${c.name} / ${c.criteria[i]}: score must be an integer 0-4`); });
  }
  return problems;
}

export function categoryAverage(arr) {
  const v = arr.filter((s) => s !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

/** Weighted overall score over categories with at least one score, weights renormalised; thresholds evaluated on what is scored. */
export function evaluate(scores) {
  const problems = validate(scores);
  if (problems.length) throw new Error(problems.join('; '));
  const categories = CATEGORIES.map((c) => ({ id: c.id, name: c.name, weight: c.weight, average: categoryAverage(scores[c.id]), scored: scores[c.id].filter((s) => s !== null).length, total: c.criteria.length }));
  const scored = categories.filter((c) => c.average !== null);
  const wsum = scored.reduce((s, c) => s + c.weight, 0);
  const overall = wsum ? scored.reduce((s, c) => s + c.average * (c.weight / wsum), 0) : null;
  const privacy = scores.privacy.filter((s) => s !== null);
  const wcag = scores.accessibility[0];
  const failures = [];
  if (privacy.some((s) => s < THRESHOLDS.privacyMinEach)) failures.push(`Privacy and Security: every criterion must score at least ${THRESHOLDS.privacyMinEach}`);
  if (wcag !== null && wcag < THRESHOLDS.wcagMin) failures.push(`Accessibility: WCAG compliance must score at least ${THRESHOLDS.wcagMin}`);
  if (overall !== null && overall < THRESHOLDS.overallMin) failures.push(`Overall weighted score ${overall.toFixed(2)} is below ${THRESHOLDS.overallMin}`);
  const complete = categories.every((c) => c.scored === c.total);
  const disqualified = Object.values(scores).flat().some((s) => s === 0);
  let outcome = 'Incomplete';
  if (complete) outcome = disqualified ? 'Disqualified (a criterion scored 0)' : failures.length ? 'Does not meet minimum thresholds' : 'Meets minimum thresholds — proceed to pilot';
  return { categories, overall, complete, disqualified, failures, outcome, renormalised: wsum > 0 && wsum < 1 - 1e-9 };
}

export function toMarkdown(tool, scores, result) {
  const lines = [`# Rubric score: ${tool || 'unnamed tool'}`, '', `Outcome: **${result.outcome}**  `, `Overall weighted score: ${result.overall === null ? '—' : result.overall.toFixed(2)} / 4.00`, '', '| Category | Weight | Average | Scored |', '|---|---|---|---|'];
  for (const c of result.categories) lines.push(`| ${c.name} | ${(c.weight * 100).toFixed(0)}% | ${c.average === null ? '—' : c.average.toFixed(2)} | ${c.scored}/${c.total} |`);
  if (result.failures.length) lines.push('', 'Threshold failures:', ...result.failures.map((f) => `- ${f}`));
  lines.push('', '| Criterion | Score |', '|---|---|');
  for (const c of CATEGORIES) c.criteria.forEach((name, i) => lines.push(`| ${c.name} / ${name} | ${scores[c.id][i] === null ? '—' : `${scores[c.id][i]} (${SCALE[scores[c.id][i]]})`} |`));
  return lines.join('\n') + '\n';
}
