/* Shared helpers — DOM, formatting, clipboard, toast */

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function fmt(n, digits = 2) {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-6 || abs >= 1e12)) return n.toExponential(4);
  const rounded = Math.round(n * 10 ** digits) / 10 ** digits;
  return rounded.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function fmtTime(ms, showMs = true) {
  const total = Math.max(0, ms);
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  const p = (x, l = 2) => String(x).padStart(l, '0');
  const base = h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
  return showMs ? `${base}.${p(cs)}` : base;
}

export function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 1900);
}

export async function copy(text, label = 'Copied to clipboard') {
  try {
    await navigator.clipboard.writeText(text);
    toast(label);
  } catch {
    const ta = el('textarea', { style: 'position:fixed;opacity:0' });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    try { document.execCommand('copy'); toast(label); } catch { toast('Copy failed'); }
    ta.remove();
  }
}

export function haptic(ms = 8) {
  if (navigator.vibrate) { try { navigator.vibrate(ms); } catch { /* unsupported */ } }
}

/** Tiny WAV beep via WebAudio (for timers). */
export function beep(freq = 880, dur = 0.14, when = 0) {
  try {
    const ctx = beep._ctx || (beep._ctx = new (window.AudioContext || window.webkitAudioContext)());
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = freq;
    o.type = 'sine';
    const t0 = ctx.currentTime + when;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.start(t0); o.stop(t0 + dur + 0.02);
  } catch { /* audio unavailable */ }
}

export function storeGet(key, fallback) {
  try {
    const raw = localStorage.getItem('essentials:' + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function storeSet(key, value) {
  try { localStorage.setItem('essentials:' + key, JSON.stringify(value)); } catch { /* quota */ }
}

export const ICON = {
  backspace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="M18 9l-6 6M12 9l6 6"/></svg>',
  copy: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
};
