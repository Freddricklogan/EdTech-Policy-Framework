/** Mounts the Executive Shell on every page; KPIs come from the rubric module, not typed in. */
import { mountExecShell } from './shell/exec-shell.js';
import { gotoTool } from './shell/tool-page.js';
import { CATEGORIES, THRESHOLDS } from './lib/rubric.js';

const criteria = CATEGORIES.reduce((n, c) => n + c.criteria.length, 0);
const thresholds = Object.keys(THRESHOLDS).length;

mountExecShell({
  title: 'EdTech Policy Framework',
  tagline: 'Policy design, governance, compliance, implementation guidance and a technology-evaluation rubric for educational institutions — published as a documentation site, with the rubric implemented as a scoring tool whose weights and thresholds are the document\'s own.',
  repo: 'https://github.com/Freddricklogan/EdTech-Policy-Framework',
  pagesUrl: 'https://freddricklogan.github.io/EdTech-Policy-Framework/',
  badges: [{ label: 'MkDocs', tone: 'accent' }, { label: 'Rubric scorer', dot: true }, { label: '5 framework documents', dot: true }],
  kpis: [
    { label: 'Documents', compute: () => 5, tone: 'accent' },
    { label: 'Rubric categories', compute: () => CATEGORIES.length },
    { label: 'Criteria scored', compute: () => criteria, tone: 'ok' },
    { label: 'Minimum thresholds', compute: () => thresholds, tone: 'warn' }
  ],
  tour: [
    { selector: '.md-content', title: 'A framework you can read', body: 'Five documents — policy design, governance, compliance, implementation, and the evaluation rubric — rendered as a site with search and navigation.' },
    { selector: '.md-content', title: 'A rubric you can use', body: `The Tools page turns the rubric into a scorer: ${criteria} criteria, ${CATEGORIES.length} weighted categories, the ${thresholds} minimum thresholds from the document, and a Markdown export for the governance committee.`, action: () => gotoTool('tools/rubric/') }
  ],
  mainSelector: '.md-main'
});
