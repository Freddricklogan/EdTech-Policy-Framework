/** Rubric scorer page: 26 selects on the shared tool scaffold. Runs only where the mount exists. */
import { CATEGORIES, SCALE, evaluate, toMarkdown } from './lib/rubric.js';
import { el, mountTool } from './shell/tool-page.js';

const root = document.getElementById('rubric-tool');
if (root) {
  const selects = {};
  const scoreOptions = [4, 3, 2, 1, 0].map((s) => el('option', { value: String(s), text: `${s} — ${SCALE[s]}` }));
  mountTool(root, {
    subjectLabel: 'Tool under evaluation',
    copyLabel: 'Copy result as Markdown',
    buildFields(form) {
      for (const c of CATEGORIES) {
        const fs = el('fieldset', {}, [el('legend', { text: `${c.name} (${(c.weight * 100).toFixed(0)}%)` })]);
        selects[c.id] = c.criteria.map((name, i) => {
          const id = `rb-${c.id}-${i}`;
          const select = el('select', { id }, [el('option', { value: '', text: 'not scored' }), ...scoreOptions.map((o) => o.cloneNode(true))]);
          fs.append(el('div', { class: 'tool-row' }, [el('label', { for: id, text: name }), select]));
          return select;
        });
        form.append(fs);
      }
    },
    read: () => Object.fromEntries(CATEGORIES.map((c) => [c.id, selects[c.id].map((s) => (s.value === '' ? null : Number(s.value)))])),
    render(out, scores) {
      const r = evaluate(scores);
      const tone = r.failures.length || r.disqualified ? 'danger' : r.complete ? 'ok' : 'warn';
      out.append(el('p', { class: `tool-headline tool-${tone}`, text: `${r.outcome} · overall ${r.overall === null ? '—' : r.overall.toFixed(2)} / 4.00${r.renormalised ? ' (weights renormalised over scored categories)' : ''}` }));
      out.append(el('ul', {}, [
        ...r.categories.map((c) => el('li', { text: `${c.name}: ${c.average === null ? 'not scored' : c.average.toFixed(2)} (${c.scored}/${c.total} criteria)` })),
        ...r.failures.map((f) => el('li', { class: 'tool-danger', text: f }))
      ]));
    },
    toMarkdown: (subject, scores) => toMarkdown(subject, scores, evaluate(scores))
  });
}
