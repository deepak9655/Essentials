/* Essentials — app shell: registry, search, categories, sheets, theme */

import { el, toast, haptic, storeGet, storeSet } from './util.js';
import { tools as mathTools, categories as mathCats } from './tools/math.js';
import { tools as textTools, categories as textCats } from './tools/text.js';
import { tools as genTools, categories as genCats } from './tools/generate.js';
import { tools as timeTools, categories as timeCats } from './tools/time.js';
import { tools as noteTools, categories as noteCats } from './tools/notes.js';
import { tools as devTools, categories as devCats } from './tools/device.js';

const TOOLS = [...mathTools, ...textTools, ...genTools, ...timeTools, ...noteTools, ...devTools];
const CATEGORIES = [...mathCats, ...textCats, ...genCats, ...timeCats, ...noteCats, ...devCats];

/* ---------------- Theme ---------------- */

function initTheme() {
  const saved = storeGet('theme', null);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    storeSet('theme', next);
    haptic();
  });
}

/* ---------------- Grid / search / chips ---------------- */

let activeCat = 'All';
let query = '';

function matches(tool) {
  if (query) {
    const q = query.toLowerCase();
    const hay = [tool.name, tool.desc, tool.cat, ...(tool.keywords || [])].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return activeCat === 'All' || tool.cat === activeCat;
}

function tileFor(tool) {
  return el('button', {
    class: 'tool-tile',
    'data-id': tool.id,
    type: 'button',
    onclick: () => openSheet(tool),
  },
    el('div', { class: 'tool-icon', style: `background:${tool.icon.bg}`, html: tool.icon.svg }),
    el('div', { class: 'tool-name' }, tool.name),
    tool.tag ? el('div', { class: 'tool-tag' }, tool.tag) : null,
  );
}

function renderContent() {
  const host = document.getElementById('content');
  host.innerHTML = '';
  const shown = TOOLS.filter(matches);

  if (!shown.length) {
    host.append(el('div', { class: 'empty-state' },
      el('div', { class: 'big' }, '🔍'),
      el('h3', {}, 'No tools found'),
      el('p', {}, 'Try a different search term or category.'),
    ));
    return;
  }

  if (activeCat === 'A–Z') {
    // Flat alphabetical index with sticky-ish letter headers
    const sorted = [...shown].sort((a, b) => a.name.localeCompare(b.name));
    const byLetter = new Map();
    for (const t of sorted) {
      const L = t.name[0].toUpperCase();
      if (!byLetter.has(L)) byLetter.set(L, []);
      byLetter.get(L).push(t);
    }
    for (const [letter, list] of byLetter) {
      host.append(el('section', { class: 'section' },
        el('h2', { class: 'az-letter' }, letter),
        el('div', { class: 'tool-grid' }, list.map(tileFor)),
      ));
    }
    return;
  }

  // Group by category, in curated category order
  const cats = activeCat === 'All' ? CATEGORIES : [activeCat];
  let i = 0;
  for (const cat of cats) {
    const list = shown.filter((t) => t.cat === cat);
    if (!list.length) continue;
    host.append(el('section', { class: 'section', style: `animation-delay:${Math.min(i * 60, 360)}ms` },
      el('h2', { class: 'section-title' }, cat, el('span', { class: 'count' }, `${list.length} tools`)),
      el('div', { class: 'tool-grid' }, list.map((t, j) => {
        const node = tileFor(t);
        node.style.animationDelay = `${Math.min(i * 60 + j * 35, 500)}ms`;
        return node;
      })),
    ));
    i++;
  }
}

function initChips() {
  const row = document.getElementById('chip-row');
  const chips = ['All', ...CATEGORIES, 'A–Z'];
  for (const name of chips) {
    const btn = el('button', {
      class: 'chip' + (name === activeCat ? ' active' : ''),
      type: 'button',
      onclick: () => {
        activeCat = name;
        row.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.textContent === name));
        renderContent();
        haptic();
      },
    }, name);
    row.append(btn);
  }
}

function initSearch() {
  const input = document.getElementById('search');
  input.placeholder = `Search ${TOOLS.length} tools…`;
  document.getElementById('tool-count').textContent =
    `${TOOLS.length} A–Z utilities, beautifully crafted`;
  input.addEventListener('input', () => {
    query = input.value.trim();
    renderContent();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input && !isSheetOpen()) {
      e.preventDefault();
      input.focus();
    }
  });
}

/* ---------------- Sheet ---------------- */

let currentTool = null;

function isSheetOpen() {
  return !document.getElementById('sheet').hidden;
}

function openSheet(tool) {
  const sheet = document.getElementById('sheet');
  const backdrop = document.getElementById('sheet-backdrop');
  const body = document.getElementById('sheet-body');

  // Teardown previous
  if (currentTool && typeof currentTool.destroy === 'function') {
    try { currentTool.destroy(); } catch { /* ignore */ }
  }
  currentTool = tool;

  document.getElementById('sheet-title').textContent = tool.name;
  document.getElementById('sheet-desc').textContent = tool.desc;
  const icon = document.getElementById('sheet-icon');
  icon.style.background = tool.icon.bg;
  icon.innerHTML = tool.icon.svg;

  body.innerHTML = '';
  body.scrollTop = 0;
  sheet.hidden = false;
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';

  tool.render(body);
  haptic();
}

function closeSheet() {
  const sheet = document.getElementById('sheet');
  const backdrop = document.getElementById('sheet-backdrop');
  if (sheet.hidden) return;
  if (currentTool && typeof currentTool.destroy === 'function') {
    try { currentTool.destroy(); } catch { /* ignore */ }
  }
  currentTool = null;
  sheet.hidden = true;
  backdrop.hidden = true;
  document.body.style.overflow = '';
}

function initSheet() {
  document.getElementById('sheet-close').addEventListener('click', closeSheet);
  document.getElementById('sheet-backdrop').addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSheetOpen()) closeSheet();
  });
}

/* ---------------- Boot ---------------- */

initTheme();
initChips();
initSearch();
initSheet();
renderContent();

export { openSheet, closeSheet, TOOLS };
