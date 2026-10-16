/* Extra Time, Notes & Device — 10 tools */
import { el, fmt, copy, toast, haptic, beep, storeGet, storeSet } from '../util.js';

export const categories = ['Time & Focus', 'Notes & Lists', 'Device & Sensors'];

const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const tools = [
  /* ---------------- 1. Unix Timestamp ---------------- */
  {
    id: 'unix-time',
    name: 'Unix Time',
    desc: 'Epoch ↔ date converter',
    cat: 'Time & Focus',
    keywords: ['unix', 'epoch', 'timestamp', 'time', 'date', 'convert', 'gmt', 'seconds', 'utc'],
    icon: { bg: 'linear-gradient(135deg,#1c1c1e,#64d2ff)', svg: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>` },
    render(host) {
      const nowEl = el('div', { class: 'result-big', style: 'text-align:center;font-variant-numeric:tabular-nums' }, '—');
      const nowSub = el('div', { class: 'result-sub', style: 'text-align:center' }, '');
      const epochIn = el('input', { class: 'input mono', type: 'text', placeholder: 'e.g. 1760000000' });
      const dateOut = el('div', { class: 'result-sub mono', style: 'min-height:22px' }, '—');
      const dateIn = el('input', { class: 'input', type: 'datetime-local' });
      const epochOut = el('div', { class: 'result-sub mono', style: 'min-height:22px' }, '—');

      const tick = () => {
        const s = Math.floor(Date.now() / 1000);
        nowEl.textContent = s;
        nowSub.textContent = new Date().toLocaleString() + ' · ' + (Date.now() % 1000) + ' ms';
      };

      epochIn.addEventListener('input', () => {
        const raw = epochIn.value.trim();
        const n = Number(raw);
        if (!raw || isNaN(n)) { dateOut.textContent = '—'; return; }
        const d = new Date(raw.length <= 10 ? n * 1000 : n);
        dateOut.textContent = isNaN(d) ? 'invalid' : d.toLocaleString() + '  ·  ' + d.toUTCString();
      });

      dateIn.addEventListener('input', () => {
        const d = new Date(dateIn.value);
        epochOut.textContent = isNaN(d) ? '—' : `${Math.floor(d.getTime() / 1000)}  ·  ${d.getTime()} ms`;
      });

      const iv = setInterval(tick, 100);
      this._cleanup = () => clearInterval(iv);

      host.append(
        el('div', { class: 'result-card', style: 'text-align:center' }, nowEl, nowSub),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Epoch → date'), epochIn, dateOut),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Date → epoch'), dateIn, epochOut),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-primary', onclick: () => { epochIn.value = Math.floor(Date.now() / 1000); epochIn.dispatchEvent(new Event('input')); } }, 'Now → epoch'),
          el('button', { class: 'btn btn-fill', onclick: () => copy(String(Math.floor(Date.now() / 1000)), 'Timestamp copied') }, 'Copy now')),
        el('div', { class: 'hint' }, 'Supports seconds (10-digit) and milliseconds (13-digit) epochs.'));
      tick();
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 2. Sleep Calculator ---------------- */
  {
    id: 'sleep',
    name: 'Sleep',
    desc: 'Bedtime & wake planning',
    cat: 'Time & Focus',
    keywords: ['sleep', 'bedtime', 'wake', 'cycle', 'rest', 'alarm', 'health', 'circadian', '90'],
    icon: { bg: 'linear-gradient(135deg,#5e5ce6,#1c1c1e)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/><path d="M17 4h3M18.5 2.5v3"/></svg>` },
    render(host) {
      let mode = 'wake'; // 'wake' = I'll wake up at → show bedtimes
      const seg = el('div', { class: 'segmented' });
      [['wake', 'When to sleep'], ['bed', 'When to wake']].forEach(([id, label]) => {
        seg.append(el('button', {
          class: id === mode ? 'active' : '',
          onclick: (e) => {
            mode = id;
            seg.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === e.target));
            labelEl.textContent = mode === 'wake' ? 'Wake-up time' : 'Bedtime';
            calc();
          },
        }, label));
      });

      const now = new Date(Date.now() + 14 * 60000);
      const tstr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const timeIn = el('input', { class: 'input', type: 'time', value: tstr });
      const labelEl = el('label', { class: 'field-label' }, 'Wake-up time');
      const out = el('div', { class: 'list' });

      const calc = () => {
        out.innerHTML = '';
        const [hh, mm] = (timeIn.value || '07:00').split(':').map(Number);
        const target = new Date();
        target.setHours(hh, mm, 0, 0);
        const fallAsleep = 15; // minutes
        const cycle = 90;      // minutes
        const times = [];
        for (let cycles = 6; cycles >= 3; cycles--) {
          const t = new Date(target.getTime() + (mode === 'wake' ? -1 : 1) * (cycles * cycle + fallAsleep) * 60000);
          const lbl = cycles === 6 ? '6 cycles · 9h' : cycles === 5 ? '5 cycles · 7h 30m' : cycles === 4 ? '4 cycles · 6h' : '3 cycles · 4h 30m';
          times.push([t, lbl]);
        }
        times.forEach(([t, lbl], i) => {
          out.append(el('div', { class: 'clock-row' },
            el('div', {},
              el('div', { class: 'clock-time' }, t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
              el('div', { class: 'clock-zone' }, lbl)),
            el('div', { class: 'badge', style: i === 1 ? 'background:rgba(48,209,88,.18);color:var(--green)' : 'background:var(--fill-tertiary);color:var(--label-secondary)' },
              i === 1 ? '★ recommended' : i === 0 ? 'ideal' : '')));
        });
      };
      timeIn.addEventListener('input', calc);
      host.append(seg,
        el('div', { class: 'field' }, labelEl, timeIn),
        out,
        el('div', { class: 'hint' }, 'Sleep cycles are ~90 minutes. Falling asleep takes ~15 min on average. 4–6 cycles is the healthy range.'));
      calc();
    },
  },

  /* ---------------- 3. Metronome ---------------- */
  {
    id: 'metronome',
    name: 'Metronome',
    desc: 'Beat with tap tempo',
    cat: 'Time & Focus',
    keywords: ['metronome', 'bpm', 'beat', 'tempo', 'music', 'rhythm', 'practice', 'tap'],
    icon: { bg: 'linear-gradient(135deg,#ff9f0a,#ff375f)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M9 3h6l4 18H5z"/><path d="M12 15L17 6"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/></svg>` },
    render(host) {
      let playing = false, iv = null, beat = 0, ctx = null;
      const bpmVal = el('span', { class: 'slider-value' }, '100');
      const bpm = el('input', { type: 'range', min: '30', max: '240', value: '100' });
      const beatsPerBar = el('select', { class: 'select', style: 'max-width:110px' },
        [1, 2, 3, 4, 6].map((n) => el('option', { value: n, selected: n === 4 ? '' : undefined }, n + ' /bar')));
      const dots = el('div', { style: 'display:flex;gap:12px;justify-content:center;margin:18px 0' });
      const pendulum = el('div', {
        style: 'height:8px;border-radius:4px;background:var(--fill-secondary);position:relative;overflow:hidden;margin:10px 0',
      }, el('div', { id: 'pend-ball', style: 'position:absolute;top:-4px;left:0;width:16px;height:16px;border-radius:50%;background:var(--accent);transition:transform .12s linear' }));

      const renderDots = () => {
        dots.innerHTML = '';
        const n = parseInt(beatsPerBar.value);
        for (let i = 0; i < n; i++) {
          dots.append(el('div', {
            style: 'width:16px;height:16px;border-radius:50%;background:var(--fill-secondary);transition:all .12s',
          }));
        }
      };

      const tick = () => {
        const kids = dots.children;
        const n = kids.length;
        for (let i = 0; i < n; i++) {
          kids[i].style.background = 'var(--fill-secondary)';
          kids[i].style.transform = 'scale(1)';
        }
        const cur = kids[beat % n];
        if (cur) {
          cur.style.background = beat % n === 0 ? 'var(--red)' : 'var(--accent)';
          cur.style.transform = 'scale(1.35)';
        }
        const ball = pendulum.querySelector('div');
        if (ball) ball.style.transform = `translateX(${beat % 2 ? 180 : 0}%)`;
        try {
          ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = beat % n === 0 ? 1200 : 800;
          g.gain.setValueAtTime(0.18, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
          o.start(); o.stop(ctx.currentTime + 0.07);
        } catch { /* */ }
        beat++;
      };

      const startStop = () => {
        if (playing) {
          clearInterval(iv); iv = null; playing = false;
          playBtn.textContent = '▶ Start';
        } else {
          playing = true;
          beat = 0;
          iv = setInterval(tick, 60000 / parseInt(bpm.value));
          playBtn.textContent = '■ Stop';
        }
        haptic();
      };

      const playBtn = el('button', { class: 'btn btn-primary btn-block', style: 'padding:15px;font-size:17px', onclick: startStop }, '▶ Start');

      const taps = [];
      const tapTempo = () => {
        taps.push(performance.now());
        if (taps.length > 5) taps.shift();
        if (taps.length >= 2) {
          const gaps = taps.slice(1).map((t, i) => t - taps[i]);
          const avg = gaps.reduce((a, b) => a + b) / gaps.length;
          const est = Math.round(60000 / avg);
          bpm.value = Math.min(240, Math.max(30, est));
          bpmVal.textContent = bpm.value;
          if (playing) { clearInterval(iv); iv = setInterval(tick, 60000 / parseInt(bpm.value)); }
        }
        haptic(10);
      };

      bpm.addEventListener('input', () => {
        bpmVal.textContent = bpm.value;
        if (playing) { clearInterval(iv); iv = setInterval(tick, 60000 / parseInt(bpm.value)); }
      });
      beatsPerBar.addEventListener('change', renderDots);
      this._cleanup = () => clearInterval(iv);

      host.append(
        el('div', { class: 'result-sub', style: 'text-align:center;font-size:15px' }, '♩ ='),
        pendulum, dots,
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Tempo (BPM)'),
          el('div', { class: 'slider-row' }, bpm, bpmVal)),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Beats per bar'), beatsPerBar),
        el('div', { class: 'action-bar' }, playBtn,
          el('button', { class: 'btn btn-fill', onclick: tapTempo }, 'Tap tempo')),
        el('div', { class: 'hint' }, 'Tap the beat manually to set the tempo — the metronome locks onto your rhythm.'));
      renderDots();
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 4. Drawing Pad ---------------- */
  {
    id: 'draw',
    name: 'Draw',
    desc: 'Sketch & export PNG',
    cat: 'Notes & Lists',
    keywords: ['draw', 'paint', 'sketch', 'doodle', 'canvas', 'art', 'note', 'write', 'signature'],
    icon: { bg: 'linear-gradient(135deg,#ffd60a,#ff375f)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M12 19l7-7-4-4-7 7-2 6z"/><path d="M18 6l2-2 2 2-2 2M5 14l-3 5 5-3"/></svg>` },
    render(host) {
      const canvas = el('canvas', { style: 'width:100%;height:300px;border-radius:18px;border:1px solid var(--separator);background:#fff;touch-action:none;cursor:crosshair' });
      const dpr = window.devicePixelRatio || 1;
      canvas.width = 640 * dpr; canvas.height = 380 * dpr;
      const ctx = canvas.getContext && canvas.getContext('2d');
      if (!ctx) {
        host.append(el('div', { class: 'note-warn' }, 'Canvas is not available in this environment.'));
        return;
      }
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 640, 380);

      const color = el('input', { type: 'color', value: '#1c1c1e' });
      const sizeVal = el('span', { class: 'slider-value' }, '4');
      const size = el('input', { type: 'range', min: '1', max: '32', value: '4' });
      let drawing = false, erasing = false;

      const pos = (e) => {
        const r = canvas.getBoundingClientRect();
        return [(e.clientX - r.left) * (640 / r.width), (e.clientY - r.top) * (380 / r.height)];
      };
      canvas.addEventListener('pointerdown', (e) => {
        drawing = true;
        canvas.setPointerCapture(e.pointerId);
        const [x, y] = pos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
      });
      canvas.addEventListener('pointermove', (e) => {
        if (!drawing) return;
        const [x, y] = pos(e);
        ctx.strokeStyle = erasing ? '#ffffff' : color.value;
        ctx.lineWidth = erasing ? parseInt(size.value) * 2.5 : parseInt(size.value);
        ctx.lineTo(x, y);
        ctx.stroke();
      });
      const stopDraw = () => drawing = false;
      canvas.addEventListener('pointerup', stopDraw);
      canvas.addEventListener('pointerleave', stopDraw);

      const save = () => {
        const a = el('a', { href: canvas.toDataURL('image/png'), download: 'essentials-drawing.png' });
        a.click();
        toast('PNG saved');
      };

      size.addEventListener('input', () => sizeVal.textContent = size.value);
      host.append(canvas,
        el('div', { class: 'pane-row', style: 'margin-top:12px;align-items:center' },
          el('div', { style: 'display:flex;gap:10px;align-items:center' }, color,
            el('div', { class: 'slider-row', style: 'flex:1' }, size, sizeVal))),
        el('div', { class: 'action-bar' },
          el('button', { class: 'btn btn-fill', onclick: () => { erasing = !erasing; haptic(); toast(erasing ? 'Eraser on' : 'Pen on'); } }, 'Eraser'),
          el('button', { class: 'btn btn-danger', onclick: () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 640, 380); } }, 'Clear'),
          el('button', { class: 'btn btn-primary', onclick: save }, 'Save PNG')),
        el('div', { class: 'hint' }, 'Works with finger, stylus, and mouse. Exports at 640×380.'));
    },
  },

  /* ---------------- 5. Expense Tracker ---------------- */
  {
    id: 'expenses',
    name: 'Expenses',
    desc: 'Track spending by category',
    cat: 'Notes & Lists',
    keywords: ['expense', 'money', 'budget', 'spend', 'track', 'finance', 'daily', 'log'],
    icon: { bg: 'linear-gradient(135deg,#30d158,#0a84ff)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="2" y="6" width="20" height="14" rx="3"/><path d="M2 10h20"/><path d="M6 15h4"/><circle cx="17" cy="15" r="1.4"/></svg>` },
    render(host) {
      let items = storeGet('expenses', []);
      const CATS = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Fun', 'Other'];
      const amount = el('input', { class: 'input', type: 'number', min: '0', step: '0.01', placeholder: 'Amount' });
      const cat = el('select', { class: 'select' }, CATS.map((c) => el('option', { value: c }, c)));
      const note = el('input', { class: 'input', type: 'text', placeholder: 'Note (optional)' });
      const list = el('div', { class: 'list', style: 'max-height:240px;overflow:auto' });
      const totals = el('div', { class: 'stat-grid' });

      const save = () => { storeSet('expenses', items); render(); };

      const render = () => {
        list.innerHTML = '';
        totals.innerHTML = '';
        const sum = items.reduce((a, x) => a + x.amt, 0);
        totals.append(
          el('div', { class: 'stat' }, el('div', { class: 'v' }, '$' + fmt(sum, 2)), el('div', { class: 'k' }, 'Total spent')),
          el('div', { class: 'stat' }, el('div', { class: 'v' }, String(items.length)), el('div', { class: 'k' }, 'Entries')));
        const byCat = {};
        items.forEach((x) => byCat[x.cat] = (byCat[x.cat] || 0) + x.amt);
        Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([c, v]) => {
          totals.append(el('div', { class: 'stat' }, el('div', { class: 'v' }, '$' + fmt(v, 2)), el('div', { class: 'k' }, c)));
        });
        if (!items.length) {
          list.append(el('div', { class: 'list-row' }, el('span', { class: 'k' }, 'No expenses logged yet')));
          return;
        }
        items.slice(0, 30).forEach((x) => {
          list.append(el('div', { class: 'list-row' },
            el('div', {},
              el('div', { style: 'font-weight:700' }, x.cat + (x.note ? ' · ' + x.note : '')),
              el('div', { class: 'k', style: 'font-size:11.5px' }, new Date(x.ts).toLocaleDateString())),
            el('div', { style: 'display:flex;align-items:center;gap:8px' },
              el('span', { class: 'v' }, '$' + fmt(x.amt, 2)),
              el('button', {
                class: 'note-del', html: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
                onclick: () => { items = items.filter((i) => i.id !== x.id); save(); },
              }))));
        });
      };

      const add = () => {
        const amt = parseFloat(amount.value);
        if (!amt || amt <= 0) { toast('Enter an amount'); return; }
        items.unshift({ id: Date.now(), amt, cat: cat.value, note: note.value.trim(), ts: Date.now() });
        amount.value = ''; note.value = '';
        save(); toast('Expense added'); haptic();
      };

      host.append(
        el('div', { class: 'pane-row' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Amount'), amount),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Category'), cat)),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Note'), note),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-primary', onclick: add }, '＋ Add expense'),
          el('button', { class: 'btn btn-danger', onclick: () => { if (confirm('Delete all expenses?')) { items = []; save(); } } }, 'Clear all')),
        totals,
        el('label', { class: 'field-label', style: 'margin-top:14px' }, 'Recent'),
        list,
        el('div', { class: 'hint' }, 'Stored locally on this device only.'));
      render();
    },
  },

  /* ---------------- 6. Device Info ---------------- */
  {
    id: 'device-info',
    name: 'Device Info',
    desc: 'Everything about this device',
    cat: 'Device & Sensors',
    keywords: ['device', 'info', 'system', 'spec', 'browser', 'screen', 'memory', 'cores', 'user agent'],
    icon: { bg: 'linear-gradient(135deg,#5e5ce6,#0a84ff)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/><path d="M12 8.5v3.5"/></svg>` },
    render(host) {
      const grid = el('div', { class: 'stat-grid' });
      const list = el('div', { class: 'list' });

      const rows = [
        ['Platform', navigator.platform || navigator.userAgentData?.platform || '—'],
        ['Browser', (() => { const m = navigator.userAgent.match(/(Firefox|Safari|Chrome|Edg)\/([\d.]+)/); return m ? `${m[1]} ${m[2].split('.')[0]}` : '—'; })()],
        ['Screen', `${window.screen?.width || '?'} × ${window.screen?.height || '?'} px`],
        ['Viewport', `${window.innerWidth} × ${window.innerHeight} px`],
        ['Device pixel ratio', String(window.devicePixelRatio || 1)],
        ['CPU cores', String(navigator.hardwareConcurrency || '—')],
        ['Device memory', navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'not exposed'],
        ['Touch support', ('ontouchstart' in window) ? 'Yes · ' + (navigator.maxTouchPoints || 0) + ' points' : 'No'],
        ['Languages', (navigator.languages || [navigator.language]).join(', ')],
        ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone + ' (UTC' + (-new Date().getTimezoneOffset() / 60 >= 0 ? '+' : '') + (-new Date().getTimezoneOffset() / 60) + ')'],
        ['Cookies', navigator.cookieEnabled ? 'Enabled' : 'Disabled'],
        ['Connection', navigator.connection?.effectiveType || 'not exposed'],
        ['Online', navigator.onLine ? 'Yes' : 'No'],
        ['Orientation', window.screen?.orientation?.type || '—'],
        ['Color depth', (window.screen?.colorDepth || '—') + '-bit'],
        ['PDF viewer', navigator.pdfViewerEnabled ? 'Built-in' : '—'],
      ];

      const mk = (v, k) => el('div', { class: 'stat' }, el('div', { class: 'v', style: 'font-size:15px' }, v), el('div', { class: 'k' }, k));
      grid.append(
        mk(String(navigator.hardwareConcurrency || '?'), 'Cores'),
        mk((navigator.deviceMemory || '?') + ' GB', 'Memory'),
        mk(String(window.devicePixelRatio || 1), 'DPR'),
        mk(navigator.onLine ? 'Online' : 'Offline', 'Network'),
      );
      rows.forEach(([k, v]) => list.append(el('div', { class: 'list-row' },
        el('span', { class: 'k' }, k),
        el('span', { class: 'v', style: 'max-width:60%;font-size:12.5px' }, String(v)))));

      host.append(grid,
        el('label', { class: 'field-label', style: 'margin-top:14px' }, 'Details'),
        list,
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-primary', onclick: () => copy(rows.map(([k, v]) => `${k}: ${v}`).join('\n'), 'Device info copied') }, 'Copy all info')),
        el('div', { class: 'hint' }, 'All information stays local — nothing is sent anywhere.'));
    },
  },

  /* ---------------- 7. Ruler ---------------- */
  {
    id: 'ruler',
    name: 'Ruler',
    desc: 'Measure with calibration',
    cat: 'Device & Sensors',
    keywords: ['ruler', 'measure', 'length', 'cm', 'inch', 'mm', 'tape', 'size', 'distance'],
    icon: { bg: 'linear-gradient(135deg,#ff9f0a,#ffd60a)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="2" y="9" width="20" height="6" rx="1.5"/><path d="M6 9V6M10 9V7.5M14 9V6M18 9V7.5"/></svg>` },
    render(host) {
      let unit = 'cm';
      let ppi = (window.devicePixelRatio || 1) * 96; // default estimate

      const strip = el('div', { style: 'height:110px;border-radius:16px;overflow:hidden;position:relative;background:var(--bg-card-solid);border:1px solid var(--separator);user-select:none' });
      const calVal = el('span', { class: 'slider-value' }, '96');
      const cal = el('input', { type: 'range', min: '60', max: '200', value: String(Math.round(ppi / (window.devicePixelRatio || 1))) });
      const seg = el('div', { class: 'segmented' });

      const draw = () => {
        strip.innerHTML = '';
        const pxPerUnit = unit === 'cm' ? ppi / 2.54 : ppi;
        const w = strip.clientWidth || 340;
        const n = Math.ceil(w / pxPerUnit);
        for (let i = 0; i <= n; i++) {
          const major = unit === 'in' ? true : i % 10 === 0;
          const h = i % (unit === 'in' ? 1 : 5) === 0 ? 26 : 13;
          const tick = el('div', { style: `position:absolute;left:${i * pxPerUnit}px;top:0;width:2px;height:${h}px;background:${major ? 'var(--label)' : 'var(--label-secondary)'}` });
          strip.append(tick);
          if (i % (unit === 'in' ? 1 : 10) === 0) {
            strip.append(el('div', {
              style: `position:absolute;left:${i * pxPerUnit + 5}px;top:${h + 2}px;font-size:11px;font-weight:700;color:var(--label-secondary)`,
            }, String(unit === 'cm' ? i / 10 : i)));
          }
        }
        // sub-ticks (mm)
        if (unit === 'cm') {
          for (let i = 0; i <= n * 10; i++) {
            if (i % 5 === 0) continue;
            strip.append(el('div', { style: `position:absolute;left:${i * pxPerUnit / 10}px;top:0;width:1px;height:8px;background:var(--label-tertiary)` }));
          }
        }
      };

      ['cm', 'in'].forEach((u) => {
        seg.append(el('button', {
          class: u === unit ? 'active' : '',
          onclick: (e) => {
            unit = u;
            seg.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === e.target));
            draw();
          },
        }, u === 'cm' ? 'Centimeters' : 'Inches'));
      });

      cal.addEventListener('input', () => {
        ppi = parseFloat(cal.value) * (window.devicePixelRatio || 1);
        calVal.textContent = cal.value;
        draw();
      });

      const iv = setTimeout(draw, 50);
      window.addEventListener('resize', draw);
      this._cleanup = () => { clearTimeout(iv); window.removeEventListener('resize', draw); };

      host.append(seg, strip,
        el('div', { class: 'field', style: 'margin-top:14px' }, el('label', { class: 'field-label' }, 'Calibration (PPI)'),
          el('div', { class: 'slider-row' }, cal, calVal)),
        el('div', { class: 'note-info' }, 'Screens vary — for accuracy, calibrate against a real ruler: place it on screen and adjust PPI until the marks line up.'),
      );
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 8. Magnifier ---------------- */
  {
    id: 'magnifier',
    name: 'Magnifier',
    desc: 'Camera zoom & torch',
    cat: 'Device & Sensors',
    keywords: ['magnifier', 'zoom', 'camera', 'loupe', 'read', 'small', 'text', 'enlarge', 'microscope'],
    icon: { bg: 'linear-gradient(135deg,#0a84ff,#63e6e2)', svg: `<svg viewBox="0 0 24 24" ${S}><circle cx="10.5" cy="10.5" r="6.5"/><path d="M21 21l-5.4-5.4M8 10.5h5M10.5 8v5"/></svg>` },
    render(host) {
      let stream = null;
      const video = el('video', { style: 'width:100%;height:300px;object-fit:cover;border-radius:18px;background:#000', autoplay: '', playsinline: '', muted: '' });
      const zoomVal = el('span', { class: 'slider-value' }, '1.0×');
      const zoom = el('input', { type: 'range', min: '1', max: '6', step: '0.1', value: '1' });
      const status = el('div', { class: 'hint', style: 'text-align:center' }, '');
      const torchBtn = el('button', { class: 'btn btn-fill', onclick: toggleTorch }, '🔦 Torch');
      let torchOn = false;

      async function toggleTorch() {
        if (!stream) { toast('Start camera first'); return; }
        try {
          const track = stream.getVideoTracks()[0];
          const caps = track.getCapabilities?.() || {};
          if (!caps.torch) { status.textContent = 'Torch not supported on this camera.'; return; }
          torchOn = !torchOn;
          await track.applyConstraints({ advanced: [{ torch: torchOn }] });
          torchBtn.textContent = torchOn ? '🔦 Torch off' : '🔦 Torch';
        } catch {
          status.textContent = 'Could not toggle torch.';
        }
      }

      const start = async () => {
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
          stream = null;
          video.srcObject = null;
          startBtn.textContent = '📷 Start camera';
          status.textContent = 'Camera stopped.';
          return;
        }
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
          video.srcObject = stream;
          video.play().catch(() => {});
          startBtn.textContent = '■ Stop camera';
          status.textContent = 'Point at small text or objects. Pinch-free zoom below.';
          status.style.color = 'var(--green)';
        } catch {
          status.textContent = 'Camera access denied or unavailable.';
          status.style.color = 'var(--red)';
        }
      };

      const startBtn = el('button', { class: 'btn btn-primary btn-block', onclick: start }, '📷 Start camera');
      zoom.addEventListener('input', () => {
        video.style.transform = `scale(${zoom.value})`;
        video.style.transformOrigin = 'center';
        zoomVal.textContent = parseFloat(zoom.value).toFixed(1) + '×';
      });
      this._cleanup = () => { if (stream) stream.getTracks().forEach((t) => t.stop()); };

      host.append(video,
        el('div', { class: 'field', style: 'margin-top:12px' }, el('label', { class: 'field-label' }, 'Zoom'),
          el('div', { class: 'slider-row' }, zoom, zoomVal)),
        el('div', { class: 'action-bar' }, startBtn, torchBtn),
        status);
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 9. Motion Detector ---------------- */
  {
    id: 'motion',
    name: 'Motion Detector',
    desc: 'Camera movement alarm',
    cat: 'Device & Sensors',
    keywords: ['motion', 'detect', 'camera', 'security', 'alarm', 'movement', 'surveillance', 'tripwire'],
    icon: { bg: 'linear-gradient(135deg,#ff453a,#ff9f0a)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M3 12h4l2-7 4 14 2-7h6"/><rect x="2" y="3" width="20" height="18" rx="3"/></svg>` },
    render(host) {
      let stream = null, iv = null, armed = false, lastFrame = null, events = 0;
      const video = el('video', { style: 'width:100%;height:260px;object-fit:cover;border-radius:18px;background:#000', autoplay: '', playsinline: '', muted: '' });
      const canvas = el('canvas', { style: 'display:none' });
      const sensVal = el('span', { class: 'slider-value' }, '25');
      const sens = el('input', { type: 'range', min: '5', max: '80', value: '25' });
      const level = el('div', { class: 'db-bar' });
      const status = el('div', { class: 'hint', style: 'text-align:center' }, 'Start the camera, then arm the detector.');
      const counter = el('div', { class: 'result-big', style: 'text-align:center' }, '0 events');

      const detect = () => {
        if (!stream || !armed || !video.videoWidth) return;
        const w = 64, h = 48;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, w, h);
        const frame = ctx.getImageData(0, 0, w, h).data;
        if (lastFrame) {
          let diff = 0;
          for (let i = 0; i < frame.length; i += 16) {
            diff += Math.abs(frame[i] - lastFrame[i]);
          }
          diff /= (frame.length / 16);
          const threshold = 90 - parseInt(sens.value); // higher sens = lower threshold
          level.style.width = Math.min(100, (diff / 40) * 100) + '%';
          if (diff > threshold) {
            events++;
            counter.textContent = events + ' events';
            status.textContent = '🚨 Motion detected!';
            status.style.color = 'var(--red)';
            beep(980, 0.1);
            haptic(30);
            setTimeout(() => {
              if (armed) { status.textContent = 'Watching for motion…'; status.style.color = 'var(--green)'; }
            }, 900);
          }
        }
        lastFrame = frame;
      };

      const start = async () => {
        if (!stream) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            video.srcObject = stream;
            video.play().catch(() => {});
            armBtn.style.display = '';
            status.textContent = 'Camera live. Arm the detector to start watching.';
            status.style.color = 'var(--green)';
          } catch {
            status.textContent = 'Camera access denied or unavailable.';
            status.style.color = 'var(--red)';
          }
        } else {
          stopAll();
        }
      };

      const armBtn = el('button', {
        class: 'btn btn-primary',
        style: 'display:none',
        onclick: () => {
          armed = !armed;
          armBtn.textContent = armed ? 'Disarm' : 'Arm detector';
          armBtn.classList.toggle('btn-danger', armed);
          armBtn.classList.toggle('btn-primary', !armed);
          status.textContent = armed ? 'Watching for motion…' : 'Disarmed.';
          status.style.color = armed ? 'var(--green)' : '';
          if (armed) { events = 0; counter.textContent = '0 events'; iv = setInterval(detect, 120); }
          else { clearInterval(iv); iv = null; level.style.width = '0%'; }
          haptic();
        },
      }, 'Arm detector');

      const stopAll = () => {
        armed = false;
        clearInterval(iv); iv = null;
        if (stream) stream.getTracks().forEach((t) => t.stop());
        stream = null;
        video.srcObject = null;
        lastFrame = null;
        level.style.width = '0%';
        armBtn.style.display = 'none';
        armBtn.textContent = 'Arm detector';
        armBtn.classList.add('btn-primary'); armBtn.classList.remove('btn-danger');
        status.textContent = 'Camera stopped.';
      };

      sens.addEventListener('input', () => sensVal.textContent = sens.value);
      this._cleanup = stopAll;

      host.append(video, canvas,
        el('div', { class: 'field', style: 'margin-top:12px' }, el('label', { class: 'field-label' }, 'Sensitivity'),
          el('div', { class: 'slider-row' }, sens, sensVal)),
        el('div', { class: 'db-bar-wrap' }, level),
        counter,
        el('div', { class: 'action-bar' },
          el('button', { class: 'btn btn-fill', onclick: start }, '📷 Start camera'),
          armBtn),
        status,
        el('div', { class: 'hint' }, 'Frames are compared locally in real time — no video leaves your device. Try it as a desk tripwire!'));
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 10. Network Info ---------------- */
  {
    id: 'network',
    name: 'Network',
    desc: 'Connection quality & type',
    cat: 'Device & Sensors',
    keywords: ['network', 'wifi', 'internet', 'connection', 'speed', 'online', 'offline', 'latency', 'bandwidth'],
    icon: { bg: 'linear-gradient(135deg,#0a84ff,#32ade6)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5.5 5.5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1.3" fill="currentColor"/></svg>` },
    render(host) {
      const grid = el('div', { class: 'stat-grid' });
      const list = el('div', { class: 'list' });
      const pingEl = el('div', { class: 'result-big', style: 'text-align:center' }, '—');
      const status = el('div', { class: 'hint', style: 'text-align:center' }, '');

      const render = () => {
        const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        grid.innerHTML = '';
        const mk = (v, k) => el('div', { class: 'stat' }, el('div', { class: 'v', style: 'font-size:16px' }, v), el('div', { class: 'k' }, k));
        grid.append(
          mk(navigator.onLine ? 'Online' : 'Offline', 'Status'),
          mk(c?.effectiveType?.toUpperCase() || '—', 'Type'),
          mk(c?.downlink ? c.downlink + ' Mb/s' : '—', 'Downlink'),
          mk(c?.rtt ? c.rtt + ' ms' : '—', 'RTT'),
        );
        list.innerHTML = '';
        [
          ['Save-Data', c?.saveData ? 'On' : 'Off or unknown'],
          ['Downlink max', c?.downlinkMax ? c.downlinkMax + ' Mb/s' : 'not exposed'],
          ['Online since', performance.timeOrigin ? new Date(performance.timeOrigin).toLocaleTimeString() : '—'],
        ].forEach(([k, v]) => list.append(el('div', { class: 'list-row' }, el('span', { class: 'k' }, k), el('span', { class: 'v' }, String(v)))));
      };

      const ping = async () => {
        status.textContent = 'Measuring…';
        const t0 = performance.now();
        try {
          await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
          const ms = performance.now() - t0;
          pingEl.textContent = fmt(ms, 1);
          pingEl.append(el('span', { class: 'unit' }, 'ms'));
          status.textContent = 'Round-trip to this app (local server)';
          status.style.color = 'var(--green)';
        } catch {
          pingEl.textContent = '—';
          status.textContent = 'Could not measure.';
        }
      };

      window.addEventListener('online', render);
      window.addEventListener('offline', render);
      this._cleanup = () => {
        window.removeEventListener('online', render);
        window.removeEventListener('offline', render);
      };

      host.append(grid,
        el('div', { class: 'result-card', style: 'text-align:center;margin-top:12px' }, pingEl,
          el('div', { class: 'result-sub' }, 'local round-trip')),
        el('button', { class: 'btn btn-primary btn-block', onclick: ping }, '⚡ Measure now'),
        el('label', { class: 'field-label', style: 'margin-top:14px' }, 'Details'),
        list, status,
        el('div', { class: 'hint' }, 'Uses the Network Information API where available (Chrome/Edge).'));
      render();
      ping();
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },
];
