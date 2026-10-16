/* Notes & Lists — 2 tools */
import { el, copy, toast, haptic, storeGet, storeSet } from '../util.js';

export const categories = ['Notes & Lists'];

const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const NOTE_COLORS = ['#FF9F0A', '#0A84FF', '#30D158', '#FF375F', '#BF5AF2', '#32ADE6'];

export const tools = [
  /* ---------------- 1. Notes ---------------- */
  {
    id: 'notes',
    name: 'Notes',
    desc: 'Quick notes, saved locally',
    cat: 'Notes & Lists',
    keywords: ['note', 'memo', 'sticky', 'write', 'remember', 'todo', 'journal'],
    icon: { bg: 'linear-gradient(135deg,#ffd60a,#ff9f0a)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 13h6M9 17h4"/></svg>` },
    render(host) {
      let notes = storeGet('notes', []);
      const title = el('input', { class: 'input', type: 'text', placeholder: 'Title' });
      const body = el('textarea', { class: 'textarea', placeholder: 'Note body…', style: 'min-height:80px' });
      const list = el('div', {});
      const search = el('input', { class: 'input', type: 'search', placeholder: 'Search notes…', style: 'margin-bottom:12px' });

      const save = () => {
        storeSet('notes', notes);
        renderList();
      };

      const renderList = () => {
        const q = search.value.trim().toLowerCase();
        list.innerHTML = '';
        const shown = notes.filter((n) => !q || (n.title + ' ' + n.text).toLowerCase().includes(q));
        if (!shown.length) {
          list.append(el('div', { class: 'empty-state', style: 'padding:34px 10px' },
            el('div', { class: 'big' }, '🗒️'),
            el('p', {}, notes.length ? 'No notes match your search.' : 'No notes yet — add one above.')));
          return;
        }
        shown.forEach((n) => {
          const item = el('div', { class: 'note-item' },
            el('div', { class: 'dot', style: `background:${n.color}` }),
            el('div', { class: 'body' },
              el('div', { class: 'title' }, n.title || 'Untitled'),
              el('div', { class: 'text' }, n.text),
              el('div', { class: 'hint', style: 'margin-top:4px' }, new Date(n.ts).toLocaleString())),
            el('button', {
              class: 'note-del', html: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
              onclick: () => {
                notes = notes.filter((x) => x.id !== n.id);
                save(); toast('Note deleted'); haptic();
              },
            }),
          );
          list.append(item);
        });
      };

      const add = () => {
        const t = title.value.trim(), b = body.value.trim();
        if (!t && !b) { toast('Write something first'); return; }
        notes.unshift({
          id: Date.now(),
          title: t, text: b,
          color: NOTE_COLORS[notes.length % NOTE_COLORS.length],
          ts: Date.now(),
        });
        title.value = ''; body.value = '';
        save();
        toast('Note saved');
        haptic();
      };

      search.addEventListener('input', renderList);
      host.append(
        el('div', { class: 'field' }, title),
        el('div', { class: 'field' }, body),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-primary', onclick: add }, '＋ Add note'),
          el('button', { class: 'btn btn-ghost', onclick: () => copy(notes.map((n) => `• ${n.title}: ${n.text}`).join('\n'), 'All notes copied') }, 'Copy all')),
        el('div', { style: 'margin-top:8px' }, search),
        list,
      );
      renderList();
    },
  },

  /* ---------------- 2. Checklist ---------------- */
  {
    id: 'checklist',
    name: 'Checklist',
    desc: 'Tasks with progress',
    cat: 'Notes & Lists',
    keywords: ['checklist', 'todo', 'tasks', 'list', 'done', 'progress', 'shopping', 'plan'],
    icon: { bg: 'linear-gradient(135deg,#30d158,#0a84ff)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>` },
    render(host) {
      let items = storeGet('checklist', []);
      const input = el('input', { class: 'input', type: 'text', placeholder: 'Add a task and press Enter…' });
      const list = el('div', {});
      const progress = el('div', { class: 'progress-fill', style: 'width:0%' });
      const progressLabel = el('div', { class: 'result-sub' }, '');

      const save = () => {
        storeSet('checklist', items);
        renderList();
      };

      const renderList = () => {
        const done = items.filter((i) => i.done).length;
        const pct = items.length ? Math.round((done / items.length) * 100) : 0;
        progress.style.width = pct + '%';
        progressLabel.textContent = items.length ? `${done} of ${items.length} done · ${pct}%` : 'Add your first task';

        list.innerHTML = '';
        if (!items.length) {
          list.append(el('div', { class: 'empty-state', style: 'padding:30px 10px' },
            el('div', { class: 'big' }, '✅'),
            el('p', {}, 'Nothing here yet.')));
          return;
        }
        items.forEach((it) => {
          const row = el('div', { class: 'check-item' + (it.done ? ' done' : '') },
            el('button', {
              class: 'check-box', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
              onclick: () => { it.done = !it.done; save(); haptic(); },
            }),
            el('span', { class: 'check-text' }, it.text),
            el('button', {
              class: 'note-del', html: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
              onclick: () => { items = items.filter((x) => x.id !== it.id); save(); },
            }),
          );
          list.append(row);
        });
      };

      const add = () => {
        const t = input.value.trim();
        if (!t) return;
        items.push({ id: Date.now(), text: t, done: false });
        input.value = '';
        save();
        haptic();
      };

      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });

      host.append(
        el('div', { style: 'display:flex;gap:8px' }, input,
          el('button', { class: 'btn btn-primary', onclick: add }, 'Add')),
        el('div', { class: 'progress-track' }, progress),
        progressLabel,
        list,
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-ghost', onclick: () => { items = items.filter((i) => !i.done); save(); toast('Cleared completed'); } }, 'Clear done'),
          el('button', { class: 'btn btn-danger', onclick: () => { if (confirm('Delete all tasks?')) { items = []; save(); } } }, 'Clear all')),
        el('div', { class: 'hint' }, 'Saved on this device automatically.'),
      );
      renderList();
    },
  },
];
