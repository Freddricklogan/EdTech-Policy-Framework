import { describe, expect, it } from 'vitest';
import { CATEGORIES, THRESHOLDS, categoryAverage, evaluate, toMarkdown, validate } from '../docs/assets/lib/rubric.js';

const fill = (v) => Object.fromEntries(CATEGORIES.map((c) => [c.id, c.criteria.map(() => v)]));

describe('rubric', () => {
  it('encodes the document: six categories whose weights sum to 1, 26 criteria', () => {
    expect(CATEGORIES.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1, 9);
    expect(CATEGORIES.reduce((s, c) => s + c.criteria.length, 0)).toBe(26);
    expect(THRESHOLDS).toEqual({ privacyMinEach: 2, wcagMin: 2, overallMin: 2.5 });
  });
  it('validates shapes and ranges', () => {
    expect(validate(fill(3))).toEqual([]);
    const bad = fill(3);
    bad.privacy = [5, 1, 1];
    bad.cost[0] = 2.5;
    expect(validate(bad)).toEqual(['Privacy and Security: expected 4 scores', 'Cost and Sustainability / Pricing model: score must be an integer 0-4']);
    expect(() => evaluate(bad)).toThrow(/expected 4 scores/);
    expect(categoryAverage([null, null])).toBeNull();
    expect(categoryAverage([4, 2, null])).toBe(3);
  });
  it('computes the weighted overall and applies each threshold', () => {
    const all3 = evaluate(fill(3));
    expect(all3.overall).toBeCloseTo(3, 9);
    expect(all3.outcome).toMatch(/Meets minimum thresholds/);
    const s = fill(3);
    s.privacy[1] = 1; // one privacy criterion below 2
    const r = evaluate(s);
    expect(r.failures).toEqual(['Privacy and Security: every criterion must score at least 2']);
    expect(r.outcome).toBe('Does not meet minimum thresholds');
    const w = fill(3);
    w.accessibility[0] = 1;
    expect(evaluate(w).failures[0]).toMatch(/WCAG/);
    const low = fill(2);
    expect(evaluate(low).overall).toBeCloseTo(2, 9);
    expect(evaluate(low).failures).toContain('Overall weighted score 2.00 is below 2.5');
    const zero = fill(4);
    zero.usability[2] = 0;
    expect(evaluate(zero).outcome).toMatch(/Disqualified/);
  });
  it('weights categories: pedagogy at 25% moves the overall more than cost at 10%', () => {
    const a = fill(2);
    a.pedagogy = a.pedagogy.map(() => 4);
    const b = fill(2);
    b.cost = b.cost.map(() => 4);
    expect(evaluate(a).overall).toBeCloseTo(2 + 0.25 * 2, 9);
    expect(evaluate(b).overall).toBeCloseTo(2 + 0.1 * 2, 9);
  });
  it('handles partial scoring with renormalised weights and an Incomplete outcome', () => {
    const p = fill(null);
    p.pedagogy = [4, 4, 4, 4, 4];
    p.cost = [2, 2, 2, 2];
    const r = evaluate(p);
    expect(r.complete).toBe(false);
    expect(r.outcome).toBe('Incomplete');
    expect(r.renormalised).toBe(true);
    expect(r.overall).toBeCloseTo((4 * 0.25 + 2 * 0.1) / 0.35, 9);
    expect(evaluate(fill(null)).overall).toBeNull();
    // A threshold failure is reported as soon as the line is scored, but an incomplete form never passes.
    p.privacy = [3, 1, 3, null];
    const q = evaluate(p);
    expect(q.failures).toEqual(['Privacy and Security: every criterion must score at least 2']);
    expect(q.outcome).toBe('Incomplete');
  });
  it('exports Markdown with the outcome, table and every criterion', () => {
    const s = fill(3);
    s.integration[3] = null;
    const md = toMarkdown('Example LMS', s, evaluate(s));
    expect(md).toContain('# Rubric score: Example LMS');
    expect(md).toContain('| Pedagogical Alignment | 25% | 3.00 | 5/5 |');
    expect(md).toContain('| Integration and Scalability / Scalability | — |');
    expect(md).toContain('3 (Good)');
    expect(toMarkdown('', s, evaluate(s))).toContain('unnamed tool');
  });
});
