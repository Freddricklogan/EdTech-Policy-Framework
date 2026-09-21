/** Mounts the Executive Shell on every page of the docs site. */
import { mountExecShell } from './shell/exec-shell.js';

const shell = mountExecShell({
  title: 'EdTech Policy Framework',
  tagline: 'Policy design, governance, compliance, implementation guidance and a technology-evaluation rubric for educational institutions — published as a documentation site, with the rubric implemented as a scoring tool whose weights and thresholds are the document\'s own.',
  repo: 'https://github.com/Freddricklogan/EdTech-Policy-Framework',
  pagesUrl: 'https://freddricklogan.github.io/EdTech-Policy-Framework/',
  badges: [{ label: 'MkDocs', tone: 'accent' }, { label: 'Rubric scorer', dot: true }, { label: '5 framework documents', dot: true }],
  kpis: [
    { label: 'Documents', compute: () => 5, tone: 'accent' },
    { label: 'Rubric categories', compute: () => 6 },
    { label: 'Criteria scored', compute: () => 26, tone: 'ok' },
    { label: 'Minimum thresholds', compute: () => 3, tone: 'warn' }
  ],
  tour: [
    { selector: '.md-content', title: 'A framework you can read', body: 'Five documents — policy design, governance, compliance, implementation, and the evaluation rubric — rendered as a site with search and navigation.' },
    { selector: '.md-content', title: 'A rubric you can use', body: 'The Tools page turns the rubric into a scorer: 26 criteria, six weighted categories, the three minimum thresholds from the document, and a Markdown export for the governance committee.', action: () => { if (!location.pathname.includes('/tools/')) location.href = new URL('tools/rubric/', document.baseURI).href; } }
  ],
  mainSelector: '.md-main'
});
shell.refreshKpis();
