/** Binds the rubric scorer to the form on tools/rubric/. Runs only where the form exists. */
import { CATEGORIES, SCALE, evaluate, toMarkdown } from './lib/rubric.js';

const root = document.getElementById('rubric-tool');
if (root) {
  const form = document.createElement('form');
  form.className = 'rb-form';
  form.noValidate = true;
  const nameField = document.createElement('div');
  nameField.className = 'rb-field';
  const nameLabel = document.createElement('label');
  nameLabel.htmlFor = 'rb-tool';
  nameLabel.textContent = 'Tool under evaluation';
  const nameInput = document.createElement('input');
  nameInput.id = 'rb-tool';
  nameInput.type = 'text';
  nameField.append(nameLabel, nameInput);
  form.append(nameField);
  for (const c of CATEGORIES) {
    const fs = document.createElement('fieldset');
    const lg = document.createElement('legend');
    lg.textContent = `${c.name} (${(c.weight * 100).toFixed(0)}%)`;
    fs.append(lg);
    c.criteria.forEach((name, i) => {
      const row = document.createElement('div');
      row.className = 'rb-row';
      const label = document.createElement('label');
      const id = `rb-${c.id}-${i}`;
      label.htmlFor = id;
      label.textContent = name;
      const select = document.createElement('select');
      select.id = id;
      select.dataset.cat = c.id;
      select.dataset.idx = String(i);
      const blank = document.createElement('option');
      blank.value = '';
      blank.textContent = 'not scored';
      select.append(blank);
      for (const s of [4, 3, 2, 1, 0]) {
        const o = document.createElement('option');
        o.value = String(s);
        o.textContent = `${s} — ${SCALE[s]}`;
        select.append(o);
      }
      row.append(label, select);
      fs.append(row);
    });
    form.append(fs);
  }
  const out = document.createElement('div');
  out.className = 'rb-out';
  out.setAttribute('aria-live', 'polite');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'md-button md-button--primary';
  btn.textContent = 'Copy result as Markdown';
  const status = document.createElement('p');
  status.className = 'rb-status';
  root.append(form, out, btn, status);

  const scores = () => Object.fromEntries(CATEGORIES.map((c) => [c.id, c.criteria.map((_, i) => { const v = form.querySelector(`#rb-${c.id}-${i}`).value; return v === '' ? null : Number(v); })]));
  const render = () => {
    const r = evaluate(scores());
    out.replaceChildren();
    const h = document.createElement('p');
    h.className = `rb-outcome rb-${r.failures.length || r.disqualified ? 'bad' : r.complete ? 'ok' : 'partial'}`;
    h.textContent = `${r.outcome} · overall ${r.overall === null ? '—' : r.overall.toFixed(2)} / 4.00${r.renormalised ? ' (weights renormalised over scored categories)' : ''}`;
    out.append(h);
    const ul = document.createElement('ul');
    for (const c of r.categories) { const li = document.createElement('li'); li.textContent = `${c.name}: ${c.average === null ? 'not scored' : c.average.toFixed(2)} (${c.scored}/${c.total} criteria)`; ul.append(li); }
    for (const f of r.failures) { const li = document.createElement('li'); li.className = 'rb-fail'; li.textContent = f; ul.append(li); }
    out.append(ul);
  };
  form.addEventListener('change', render);
  btn.addEventListener('click', async () => {
    const md = toMarkdown(nameInput.value.trim(), scores(), evaluate(scores()));
    try { await navigator.clipboard.writeText(md); status.textContent = 'Copied.'; } catch { status.textContent = 'Clipboard unavailable — result printed below.'; const pre = document.createElement('pre'); pre.textContent = md; status.append(pre); }
  });
  render();
}
