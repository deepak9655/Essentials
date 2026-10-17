/* Time & Focus — 4 tools */
import { el, fmt, fmtTime, copy, toast, haptic, beep, storeGet, storeSet } from '../util.js';

export const categories = ['Time & Focus'];

const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

const RING_SVG = `
  <svg viewBox="0 0 220 220">
    <defs>
      <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#5e5ce6"/><stop offset="1" stop-color="#0a84ff"/>
      </linearGradient>
    </defs>
    <circle class="ring-bg" cx="110" cy="110" r="96"/>
    <circle class="ring-fg" cx="110" cy="110" r="96" stroke-dasharray="603.2" stroke-dashoffset="0"/>
  </svg>`;

function makeRing() {
  const wrap = el('div', { class: 'ring-wrap', html: RING_SVG });
  const center = el('div', { class: 'ring-center' });
  wrap.append(center);
  return { wrap, center, fg: () => wrap.querySelector('.ring-fg') };
}

export const tools = [
  /* ---------------- 1. Stopwatch ---------------- */
  {
    id: 'stopwatch',
    name: 'Stopwatch',
    desc: 'Laps & precision timing',
    cat: 'Time & Focus',
    keywords: ['stopwatch', 'lap', 'time', 'race', 'chronometer', 'millisecond', 'timer'],
    icon: { bg: 'linear-gradient(135deg,#1c1c1e,#ff9f0a)', svg: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="13.5" r="8"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5M12 2.5v3M18.5 6.5l1.5-1.5"/></svg>` },
    render(host) {
      let running = false, startTs = 0, elapsed = 0, raf = null;
      let laps = [];

      const display = el('div', { class: 'time-display' }, '00:00.00');
      const lapList = el('div', { class: 'list', style: 'max-height:230px;overflow:auto' });

      const tick = () => {
        if (!running) return;
        const now = performance.now();
        display.textContent = fmtTime(now - startTs + elapsed);
        raf = requestAnimationFrame(tick);
      };

      const startStop = (btn) => {
        if (!running) {
          running = true;
          startTs = performance.now();
          btn.textContent = 'Pause';
          btn.classList.remove('btn-primary');
          btn.classList.add('btn-danger');
          lapBtn.disabled = false;
          lapBtn.style.opacity = '1';
          tick();
        } else {
          running = false;
          elapsed += performance.now() - startTs;
          cancelAnimationFrame(raf);
          btn.textContent = 'Resume';
          btn.classList.add('btn-primary');
          btn.classList.remove('btn-danger');
        }
        haptic();
      };

      const addLap = () => {
        const t = running ? performance.now() - startTs + elapsed : elapsed;
        laps.unshift(t);
        renderLaps();
        haptic();
      };

      const renderLaps = () => {
        lapList.innerHTML = '';
        if (!laps.length) {
          lapList.append(el('div', { class: 'list-row' }, el('span', { class: 'k' }, 'No laps yet — press Lap')));
          return;
        }
        const best = Math.min(...laps), worst = Math.max(...laps);
        laps.forEach((t, i) => {
          const color = laps.length > 2 ? (t === best ? 'var(--green)' : t === worst ? 'var(--red)' : 'var(--label)') : 'var(--label)';
          lapList.append(el('div', { class: 'lap-row' },
            el('span', { class: 'lap-n' }, `Lap ${laps.length - i}`),
            el('span', { style: `font-weight:700;color:${color}` }, fmtTime(t))));
        });
      };

      const reset = () => {
        running = false;
        elapsed = 0;
        cancelAnimationFrame(raf);
        display.textContent = '00:00.00';
        laps = [];
        renderLaps();
        startBtn.textContent = 'Start';
        startBtn.classList.add('btn-primary');
        startBtn.classList.remove('btn-danger');
        lapBtn.disabled = true;
        lapBtn.style.opacity = '0.45';
        haptic();
      };

      const startBtn = el('button', { class: 'btn btn-primary', onclick: (e) => startStop(e.target) }, 'Start');
      const lapBtn = el('button', { class: 'btn btn-fill', onclick: addLap, disabled: '', style: 'opacity:.45' }, 'Lap');
      const resetBtn = el('button', { class: 'btn btn-ghost', onclick: reset }, 'Reset');

      host.append(display,
        el('div', { class: 'action-bar' }, startBtn, lapBtn, resetBtn),
        el('label', { class: 'field-label', style: 'margin-top:16px' }, 'Laps'),
        lapList);
      renderLaps();

      this._cleanup = () => {
        running = false;
        cancelAnimationFrame(raf);
      };
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 2. Countdown Timer ---------------- */
  {
    id: 'timer',
    name: 'Timer',
    desc: 'Countdown with alerts',
    cat: 'Time & Focus',
    keywords: ['timer', 'countdown', 'alarm', 'egg', 'pomodoro', 'minutes', 'alert', 'watch'],
    icon: { bg: 'linear-gradient(135deg,#ff9f0a,#ff453a)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M10 2h4M12 2v3"/><circle cx="12" cy="14" r="8"/><path d="M12 10v4l3 2"/></svg>` },
    render(host) {
      let totalMs = 3 * 60000, remain = totalMs, running = false, endTs = 0, iv = null;

      const ring = makeRing();
      const timeEl = el('div', { class: 'ring-time' }, fmtTime(remain, false));
      const labelEl = el('div', { class: 'ring-label' }, 'ready');
      ring.center.append(timeEl, labelEl);
      const C = 2 * Math.PI * 96;

      const setRing = () => {
        const frac = totalMs > 0 ? remain / totalMs : 0;
        ring.fg().setAttribute('stroke-dashoffset', String(C * (1 - frac)));
      };

      const update = () => {
        remain = Math.max(0, endTs - Date.now());
        timeEl.textContent = fmtTime(remain, false);
        setRing();
        if (remain <= 0) {
          clearInterval(iv);
          running = false;
          labelEl.textContent = "Time's up!";
          labelEl.style.color = 'var(--red)';
          beep(880, 0.18); beep(880, 0.18, 0.25); beep(1174, 0.3, 0.5);
          startBtn.textContent = 'Start';
          haptic([60, 60, 60]);
        }
      };

      const startPause = () => {
        if (running) {
          running = false;
          clearInterval(iv);
          remain = Math.max(0, endTs - Date.now());
          startBtn.textContent = 'Resume';
          labelEl.textContent = 'paused';
        } else {
          if (remain <= 0) remain = totalMs;
          running = true;
          endTs = Date.now() + remain;
          iv = setInterval(update, 100);
          startBtn.textContent = 'Pause';
          labelEl.textContent = 'running';
          labelEl.style.color = '';
        }
        haptic();
      };

      const reset = () => {
        running = false;
        clearInterval(iv);
        remain = totalMs;
        timeEl.textContent = fmtTime(remain, false);
        labelEl.textContent = 'ready';
        labelEl.style.color = '';
        startBtn.textContent = 'Start';
        setRing();
        haptic();
      };

      const startBtn = el('button', { class: 'btn btn-primary', onclick: startPause }, 'Start');

      const quick = el('div', { class: 'pill-row', style: 'justify-content:center' },
        [['30s', 30], ['1m', 60], ['3m', 180], ['5m', 300], ['10m', 600], ['25m', 1500]].map(([lab, secs]) =>
          el('button', {
            class: 'pill' + (secs === 180 ? ' active' : ''),
            onclick: (e) => {
              totalMs = secs * 1000;
              e.target.parentElement.querySelectorAll('.pill').forEach((x) => x.classList.toggle('active', x === e.target));
              reset();
            },
          }, lab)));

      const custom = el('div', { style: 'display:flex;gap:8px;align-items:center' },
        el('input', {
          class: 'input', type: 'number', min: '1', max: '999', placeholder: 'min', style: 'flex:1',
          onchange: (e) => {
            const m = Math.max(1, Math.min(999, parseInt(e.target.value) || 1));
            totalMs = m * 60000;
            quick.querySelectorAll('.pill').forEach((x) => x.classList.remove('active'));
            reset();
          },
        }),
        el('span', { style: 'color:var(--label-secondary);font-weight:600;font-size:13px' }, 'custom minutes'));

      host.append(ring.wrap, quick,
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Custom duration'), custom),
        el('div', { class: 'action-bar' }, startBtn,
          el('button', { class: 'btn btn-fill', onclick: reset }, 'Reset')));
      setRing();

      this._cleanup = () => clearInterval(iv);
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 3. Pomodoro ---------------- */
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    desc: 'Focus & break cycles',
    cat: 'Time & Focus',
    keywords: ['pomodoro', 'focus', 'study', 'work', 'productivity', 'break', 'timer', 'technique'],
    icon: { bg: 'linear-gradient(135deg,#ff453a,#bf5af2)', svg: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="13" r="8"/><path d="M12 5c0-2 1.5-3 3-3M12 5c0-2-1.5-3-3-3M12 5V2.5"/><path d="M12 9v4l2.5 1.5"/></svg>` },
    render(host) {
      const cfg = storeGet('pomodoro', { focus: 25, short: 5, long: 15, cycles: 4 });
      let phase = 'focus', remain = cfg.focus * 60000, totalMs = remain;
      let running = false, endTs = 0, iv = null, sessionsDone = storeGet('pomodoroDone', 0);

      const ring = makeRing();
      const timeEl = el('div', { class: 'ring-time' }, fmtTime(remain, false));
      const labelEl = el('div', { class: 'ring-label' }, 'Focus');
      ring.center.append(timeEl, labelEl);
      const C = 2 * Math.PI * 96;

      const stats = el('div', { class: 'stat-grid' });
      const renderStats = () => {
        stats.innerHTML = '';
        stats.append(
          el('div', { class: 'stat' }, el('div', { class: 'v' }, String(sessionsDone)), el('div', { class: 'k' }, 'Sessions today')),
          el('div', { class: 'stat' }, el('div', { class: 'v' }, `${cfg.focus}m`), el('div', { class: 'k' }, 'Focus')),
          el('div', { class: 'stat' }, el('div', { class: 'v' }, `${cfg.short}m`), el('div', { class: 'k' }, 'Short break')),
        );
      };

      const setRing = () => {
        const frac = totalMs > 0 ? remain / totalMs : 0;
        ring.fg().setAttribute('stroke-dashoffset', String(C * (1 - frac)));
      };

      const nextPhase = () => {
        if (phase === 'focus') {
          sessionsDone++;
          storeSet('pomodoroDone', sessionsDone);
          const isLong = sessionsDone % cfg.cycles === 0;
          phase = isLong ? 'long' : 'short';
          totalMs = (isLong ? cfg.long : cfg.short) * 60000;
          labelEl.textContent = isLong ? 'Long break ☕' : 'Short break';
          labelEl.style.color = 'var(--green)';
          beep(660, 0.15); beep(880, 0.2, 0.2);
        } else {
          phase = 'focus';
          totalMs = cfg.focus * 60000;
          labelEl.textContent = 'Focus';
          labelEl.style.color = 'var(--red)';
          beep(520, 0.15); beep(440, 0.25, 0.2);
        }
        remain = totalMs;
        renderStats();
      };

      const update = () => {
        remain = Math.max(0, endTs - Date.now());
        timeEl.textContent = fmtTime(remain, false);
        setRing();
        if (remain <= 0) {
          clearInterval(iv);
          running = false;
          startBtn.textContent = 'Start';
          nextPhase();
          haptic([50, 50, 50, 50, 80]);
        }
      };

      const startBtn = el('button', {
        class: 'btn btn-primary',
        onclick: () => {
          if (running) {
            running = false;
            clearInterval(iv);
            remain = Math.max(0, endTs - Date.now());
            startBtn.textContent = 'Resume';
          } else {
            running = true;
            endTs = Date.now() + remain;
            iv = setInterval(update, 250);
            startBtn.textContent = 'Pause';
          }
          haptic();
        },
      }, 'Start');

      const reset = () => {
        running = false;
        clearInterval(iv);
        phase = 'focus';
        totalMs = cfg.focus * 60000;
        remain = totalMs;
        timeEl.textContent = fmtTime(remain, false);
        labelEl.textContent = 'Focus';
        labelEl.style.color = '';
        startBtn.textContent = 'Start';
        setRing();
      };

      const skip = () => {
        clearInterval(iv);
        running = false;
        startBtn.textContent = 'Start';
        nextPhase();
        timeEl.textContent = fmtTime(remain, false);
        setRing();
      };

      host.append(ring.wrap,
        el('div', { class: 'action-bar' }, startBtn,
          el('button', { class: 'btn btn-fill', onclick: skip }, 'Skip →'),
          el('button', { class: 'btn btn-ghost', onclick: reset }, 'Reset')),
        el('div', { style: 'margin-top:14px' }, stats),
        el('div', { class: 'hint' }, `Classic Pomodoro: ${cfg.focus} min focus, ${cfg.short} min short break, ${cfg.long} min long break every ${cfg.cycles} sessions.`));
      renderStats();
      setRing();
      labelEl.style.color = 'var(--red)';

      this._cleanup = () => clearInterval(iv);
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 4. World Clock ---------------- */
  {
    id: 'world-clock',
    name: 'World Clock',
    desc: 'Time across the globe',
    cat: 'Time & Focus',
    keywords: ['clock', 'time', 'world', 'timezone', 'zone', 'city', 'local', 'date', 'gmt', 'ist'],
    icon: { bg: 'linear-gradient(135deg,#32ade6,#5e5ce6)', svg: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>` },
    render(host) {
      const CITIES = [
        ['Chennai', 'Asia/Kolkata', '🏠'],
        ['Mumbai', 'Asia/Kolkata', ''],
        ['Dubai', 'Asia/Dubai', ''],
        ['Singapore', 'Asia/Singapore', ''],
        ['Tokyo', 'Asia/Tokyo', ''],
        ['Sydney', 'Australia/Sydney', ''],
        ['London', 'Europe/London', ''],
        ['Paris', 'Europe/Paris', ''],
        ['New York', 'America/New_York', ''],
        ['San Francisco', 'America/Los_Angeles', ''],
        ['São Paulo', 'America/Sao_Paulo', ''],
      ];

      const list = el('div', { class: 'list' });
      const local = el('div', { class: 'result-card', style: 'text-align:center' });
      const localTime = el('div', { class: 'result-big' }, '--:--:--');
      const localDate = el('div', { class: 'result-sub' }, '');
      local.append(localTime, localDate);

      const render = () => {
        const now = new Date();
        localTime.textContent = now.toLocaleTimeString();
        localDate.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        list.innerHTML = '';
        for (const [city, tz, tag] of CITIES) {
          const t = now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true });
          const d = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });
          const offset = new Date(now.toLocaleString('en-US', { timeZone: tz })).getTime() - new Date(now.toLocaleString('en-US')).getTime();
          const offH = Math.round(offset / 3600000);
          list.append(el('div', { class: 'clock-row' },
            el('div', {},
              el('div', { class: 'clock-city' }, city + (tag ? ' ' + tag : '')),
              el('div', { class: 'clock-zone' }, (offH >= 0 ? '+' : '') + offH + 'h from local')),
            el('div', {},
              el('div', { class: 'clock-time' }, t),
              el('div', { class: 'clock-date' }, d))));
        }
      };

      const iv = setInterval(render, 1000);
      this._cleanup = () => clearInterval(iv);
      render();

      host.append(
        local,
        el('label', { class: 'field-label', style: 'margin-top:16px' }, 'Around the world'),
        list,
        el('div', { class: 'hint' }, 'Times update every second. Local timezone is detected automatically.'),
      );
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },
];
