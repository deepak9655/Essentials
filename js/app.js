/* Essentials — app shell: registry, favourites, search, categories, sheets, theme */

import { el, toast, haptic, storeGet, storeSet } from './util.js';
import { tools as mathTools, categories as mathCats } from './tools/math.js';
import { tools as textTools, categories as textCats } from './tools/text.js';
import { tools as genTools, categories as genCats } from './tools/generate.js';
import { tools as timeTools, categories as timeCats } from './tools/time.js';
import { tools as noteTools, categories as noteCats } from './tools/notes.js';
import { tools as devTools, categories as devCats } from './tools/device.js';
import { tools as extraMathTools, categories as extraMathCats } from './tools/extra-math.js';
import { tools as extraTextTools, categories as extraTextCats } from './tools/extra-text.js';
import { tools as extraDevTools, categories as extraDevCats } from './tools/extra-device.js';

const TOOLS = [
  ...mathTools, ...textTools, ...genTools, ...timeTools, ...noteTools, ...devTools,
  ...extraMathTools, ...extraTextTools, ...extraDevTools,
];
const CATEGORIES = [...new Set([
  ...mathCats, ...textCats, ...genCats, ...timeCats, ...noteCats, ...devCats,
  ...extraMathCats, ...extraTextCats, ...extraDevCats,
])];

/* ---------------- Persistence: favourites & recents ---------------- */

const favs = new Set(storeGet('favs', []));
let recents = storeGet('recents', []);

function toggleFav(id) {
  if (favs.has(id)) favs.delete(id);
  else { favs.add(id); haptic(); }
  storeSet('favs', [...favs]);
  updateFavWidgets();
  renderContent();
}

function pushRecent(id) {
  recents = [id, ...recents.filter((x) => x !== id)].slice(0, 10);
  storeSet('recents', recents);
}

const STAR = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.7L12 17.4l-5.9 3.4 1.3-6.7-4.9-4.6 6.6-.8z"/></svg>';

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

/* ---------------- Header widgets (live clock) ---------------- */

function initWidgets() {
  const timeEl = document.getElementById('widget-time');
  const dateEl = document.getElementById('widget-date');
  const greetEl = document.getElementById('widget-greet');
  const tick = () => {
    const now = new Date();
    if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (dateEl) dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    if (greetEl) {
      const h = now.getHours();
      greetEl.textContent = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    }
  };
  tick();
  setInterval(tick, 1000);
}

function updateFavWidgets() {
  const favCount = document.getElementById('widget-fav-count');
  if (favCount) favCount.textContent = String(favs.size);
  const toolCount = document.getElementById('widget-tool-count');
  if (toolCount) toolCount.textContent = String(TOOLS.length);
}

/* ---------------- Grid / search / chips ---------------- */

let activeCat = 'All';
let query = '';

function matches(tool) {
  if (activeCat === 'Favourites' && !favs.has(tool.id)) return false;
  if (query) {
    const q = query.toLowerCase();
    const hay = [tool.name, tool.desc, tool.cat, ...(tool.keywords || [])].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return activeCat === 'All' || activeCat === 'Favourites' || activeCat === 'A–Z' || tool.cat === activeCat;
}

function tileFor(tool) {
  const tile = el('div', {
    class: 'tool-tile',
    'data-id': tool.id,
    role: 'button',
    tabindex: '0',
    onclick: () => openSheet(tool),
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSheet(tool); } },
  },
    el('div', { class: 'tool-icon', style: `background:${tool.icon.bg}`, html: tool.icon.svg }),
    el('div', { class: 'tool-name' }, tool.name),
    tool.tag ? el('div', { class: 'tool-tag' }, tool.tag) : null,
  );
  const star = el('button', {
    class: 'fav-btn' + (favs.has(tool.id) ? ' on' : ''),
    html: STAR,
    'aria-label': (favs.has(tool.id) ? 'Remove from' : 'Add to') + ' favourites',
    title: 'Favourite',
    onclick: (e) => { e.stopPropagation(); toggleFav(tool.id); },
  });
  tile.append(star);
  return tile;
}

function recentStrip() {
  const items = recents.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean).slice(0, 10);
  if (!items.length) return null;
  return el('section', { class: 'section section-compact' },
    el('h2', { class: 'section-title' }, 'Recently Used'),
    el('div', { class: 'recents-strip' },
      items.map((t) => el('button', {
        class: 'recent-pill',
        onclick: () => openSheet(t),
      },
        el('span', { class: 'recent-dot', style: `background:${t.icon.bg}`, html: t.icon.svg }),
        el('span', { class: 'recent-name' }, t.name),
      ))));
}

function renderContent() {
  const host = document.getElementById('content');
  host.innerHTML = '';
  const shown = TOOLS.filter(matches);

  if (!shown.length) {
    host.append(el('div', { class: 'empty-state' },
      el('div', { class: 'big' }, query ? '🔍' : activeCat === 'Favourites' ? '⭐' : '🧰'),
      el('h3', {}, query ? 'No tools found' : activeCat === 'Favourites' ? 'No favourites yet' : 'Nothing here'),
      el('p', {}, query ? 'Try a different search term or category.'
        : activeCat === 'Favourites' ? 'Tap the star on any tool to pin it here.'
        : 'Try another category.'),
    ));
    return;
  }

  if (activeCat === 'A–Z') {
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

  // Recents strip on the "All" view
  if (activeCat === 'All' && !query) {
    const strip = recentStrip();
    if (strip) host.append(strip);

    // Favourites section first
    const favTools = TOOLS.filter((t) => favs.has(t.id));
    if (favTools.length) {
      host.append(el('section', { class: 'section section-compact' },
        el('h2', { class: 'section-title' }, '⭐ Favourites', el('span', { class: 'count' }, `${favTools.length} pinned`)),
        el('div', { class: 'tool-grid' }, favTools.map(tileFor)),
      ));
    }
  }

  // Group by category, in curated category order
  const cats = activeCat === 'All' ? CATEGORIES : activeCat === 'Favourites' ? [] : [activeCat];
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

  if (activeCat === 'Favourites') {
    host.append(el('section', { class: 'section' },
      el('h2', { class: 'section-title' }, 'Favourites', el('span', { class: 'count' }, `${shown.length} pinned`)),
      el('div', { class: 'tool-grid' }, shown.map(tileFor)),
    ));
  }
}

function initChips() {
  const row = document.getElementById('chip-row');
  const chips = ['All', '★ Favourites', ...CATEGORIES, 'A–Z'];
  for (const name of chips) {
    const catName = name === '★ Favourites' ? 'Favourites' : name;
    const btn = el('button', {
      class: 'chip' + (catName === activeCat ? ' active' : ''),
      type: 'button',
      onclick: () => {
        activeCat = catName;
        row.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
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

  if (currentTool && typeof currentTool.destroy === 'function') {
    try { currentTool.destroy(); } catch { /* ignore */ }
  }
  currentTool = tool;
  pushRecent(tool.id);

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
  renderContent(); // refresh recents strip
}

function initSheet() {
  document.getElementById('sheet-close').addEventListener('click', closeSheet);
  document.getElementById('sheet-backdrop').addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSheetOpen()) closeSheet();
  });
}

/* ---------------- PWA service worker ---------------- */

function initSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline optional */ });
  }
}

/* ---------------- Boot ---------------- */

initTheme();
initWidgets();
initChips();
initSearch();
initSheet();
initSW();
updateFavWidgets();
renderContent();

export { openSheet, closeSheet, TOOLS };
