/* Device & Sensors — 7 tools */
import { el, fmt, copy, toast, haptic, beep } from '../util.js';

export const categories = ['Device & Sensors'];

const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const tools = [
  /* ---------------- 1. Flashlight ---------------- */
  {
    id: 'flashlight',
    name: 'Flashlight',
    desc: 'Screen torch & SOS strobe',
    cat: 'Device & Sensors',
    keywords: ['flashlight', 'torch', 'light', 'lamp', 'sos', 'strobe', 'bright', 'emergency'],
    icon: { bg: 'linear-gradient(135deg,#ffd60a,#ff9f0a)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M9 2h6l1 6-2 2v10a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V10L8 8z"/><path d="M8 7h8"/></svg>` },
    render(host) {
      let overlay = null, strobeIv = null, level = 255;
      let destroyed = false;

      const open = () => {
        if (overlay) return;
        overlay = el('div', { class: 'flash-full' });
        overlay.style.background = `rgb(${level},${level},${level})`;
        overlay.style.color = level > 128 ? '#000' : '#fff';
        const exit = el('button', { class: 'flash-exit', onclick: close }, '✕  Close');
        const dim = el('input', {
          type: 'range', min: '40', max: '255', value: String(level), style: 'width:220px',
          oninput: (e) => {
            level = parseInt(e.target.value);
            overlay.style.background = `rgb(${level},${level},${level})`;
            overlay.style.color = level > 128 ? '#000' : '#fff';
          },
        });
        const sosBtn = el('button', {
          class: 'btn',
          style: 'background:rgba(127,127,127,0.22);color:inherit;padding:14px 28px;border-radius:999px;font-size:17px',
          onclick: (e) => {
            if (strobeIv) {
              clearInterval(strobeIv); strobeIv = null;
              overlay.style.background = `rgb(${level},${level},${level})`;
              e.target.textContent = '◉  SOS Strobe';
            } else {
              let on = true;
              strobeIv = setInterval(() => {
                on = !on;
                overlay.style.background = on ? `rgb(${level},${level},${level})` : '#000';
              }, 350);
              e.target.textContent = '■  Stop strobe';
            }
          },
        }, '◉  SOS Strobe');
        overlay.append(exit,
          el('div', { style: 'font-size:19px;font-weight:700' }, 'Screen Torch'),
          dim, sosBtn,
          el('div', { style: 'font-size:13px;opacity:.7;max-width:260px;text-align:center' }, 'Turn brightness up on your device for maximum effect. Press Esc to exit.'));
        document.body.append(overlay);
      };

      const close = () => {
        if (strobeIv) { clearInterval(strobeIv); strobeIv = null; }
        if (overlay) { overlay.remove(); overlay = null; }
      };

      const escHandler = (e) => { if (e.key === 'Escape') close(); };
      document.addEventListener('keydown', escHandler);
      this._cleanup = () => { close(); document.removeEventListener('keydown', escHandler); };

      host.append(
        el('div', { class: 'note-info' }, 'This turns your whole screen into a torch. Great for finding keys, reading menus in the dark, or signaling.'),
        el('button', { class: 'btn btn-primary btn-block', style: 'margin-top:14px;padding:16px;font-size:17px', onclick: open }, '💡 Turn on flashlight'),
        el('div', { class: 'hint' }, 'Tip: the dimmer slider lets you reduce glare. SOS strobe flashes an international distress pattern.'),
      );
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 2. Compass ---------------- */
  {
    id: 'compass',
    name: 'Compass',
    desc: 'Heading & direction',
    cat: 'Device & Sensors',
    keywords: ['compass', 'heading', 'direction', 'north', 'navigation', 'bearing', 'magnetic'],
    icon: { bg: 'linear-gradient(135deg,#0a84ff,#30d158)', svg: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="9"/><path d="M16 8l-2.5 5.5L8 16l2.5-5.5z"/></svg>` },
    render(host) {
      const dial = el('div', { class: 'compass-dial' });
      dial.innerHTML = `
        <div class="compass-letter n" style="left:50%;top:11%">N</div>
        <div class="compass-letter" style="left:89%;top:50%">E</div>
        <div class="compass-letter" style="left:50%;top:89%">S</div>
        <div class="compass-letter" style="left:11%;top:50%">W</div>
        <div class="compass-needle"></div>`;
      const headingEl = el('div', { class: 'result-big', style: 'text-align:center' }, '—');
      const dirEl = el('div', { class: 'result-sub', style: 'text-align:center' }, 'Waiting for sensor…');
      const status = el('div', { class: 'hint', style: 'text-align:center' }, '');

      const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      let handler = null;

      const showHeading = (deg) => {
        const h = (deg + 360) % 360;
        dial.style.transform = `rotate(${-h}deg)`;
        headingEl.textContent = Math.round(h) + '°';
        dirEl.textContent = DIRS[Math.round(h / 45) % 8];
      };

      const start = async () => {
        // iOS 13+ requires a permission prompt via DeviceOrientationEvent.requestPermission
        try {
          if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res !== 'granted') {
              status.textContent = 'Compass permission denied. Grant motion access to use this tool.';
              return;
            }
          }
        } catch { /* non-iOS */ }

        if (typeof DeviceOrientationEvent === 'undefined') {
          status.textContent = 'This device does not expose orientation sensors.';
          // Demo spin so the UI is still explorable
          let d = 0;
          const demoIv = setInterval(() => { d = (d + 1.6) % 360; showHeading(d); }, 60);
          this._cleanup2 = () => clearInterval(demoIv);
          status.textContent = 'Demo mode — no motion sensors detected. The dial animates for preview.';
          return;
        }

        handler = (e) => {
          let heading = null;
          if (e.webkitCompassHeading !== undefined) heading = e.webkitCompassHeading; // iOS: degrees from north
          else if (e.alpha !== null) heading = 360 - e.alpha; // Android/web: alpha is CCW from north
          if (heading !== null && !isNaN(heading)) {
            showHeading(heading);
            status.textContent = 'Live sensor data';
            status.style.color = 'var(--green)';
          }
        };
        window.addEventListener('deviceorientationabsolute', handler, true);
        window.addEventListener('deviceorientation', handler, true);
        status.textContent = 'If nothing moves, your device may not have a magnetometer. Try waving it in a figure-8 to calibrate.';
      };

      this._cleanup = () => {
        if (handler) {
          window.removeEventListener('deviceorientationabsolute', handler, true);
          window.removeEventListener('deviceorientation', handler, true);
        }
        if (this._cleanup2) this._cleanup2();
      };

      host.append(dial, headingEl, dirEl,
        el('div', { class: 'action-bar' },
          el('button', { class: 'btn btn-primary btn-block', onclick: start }, '🧭 Enable compass')),
        status);
      start();
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 3. Leveler ---------------- */
  {
    id: 'leveler',
    name: 'Leveler',
    desc: 'Bubble surface level',
    cat: 'Device & Sensors',
    keywords: ['level', 'bubble', 'spirit', 'tilt', 'surface', 'angle', 'inclinometer', 'carpenter'],
    icon: { bg: 'linear-gradient(135deg,#30d158,#64d2ff)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="2" y="9" width="20" height="6.5" rx="3.2"/><circle cx="12" cy="12.2" r="1.6"/><path d="M6 12.2h2.4M15.6 12.2H18"/></svg>` },
    render(host) {
      const area = el('div', { class: 'level-area' },
        el('div', { class: 'level-cross-h' }), el('div', { class: 'level-cross-v' }));
      const bubble = el('div', { class: 'level-bubble' });
      area.append(bubble);
      const betaEl = el('div', { class: 'v' }, '—');
      const gammaEl = el('div', { class: 'v' }, '—');
      const statusText = el('div', { class: 'result-sub', style: 'text-align:center;min-height:22px' }, 'Place device on a surface');

      let handler = null;
      const calib = { b: 0, g: 0 };

      const update = (beta, gamma) => {
        const b = beta - calib.b, g = gamma - calib.g;
        betaEl.textContent = fmt(b, 1) + '°';
        gammaEl.textContent = fmt(g, 1) + '°';
        const x = 50 + Math.max(-50, Math.min(50, g * 1.4));
        const y = 50 + Math.max(-50, Math.min(50, b * 1.4));
        bubble.style.left = x + '%';
        bubble.style.top = y + '%';
        const off = Math.abs(b) > 1.2 || Math.abs(g) > 1.2;
        bubble.classList.toggle('off', off);
        statusText.textContent = off ? `Tilted — ${fmt(b, 1)}° × ${fmt(g, 1)}°` : '✓ Level';
        statusText.style.color = off ? 'var(--orange)' : 'var(--green)';
      };

      const start = async () => {
        try {
          if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res !== 'granted') { statusText.textContent = 'Motion permission denied.'; return; }
          }
        } catch { /* non-iOS */ }

        if (typeof DeviceOrientationEvent === 'undefined') {
          statusText.textContent = 'No orientation sensors — showing demo.';
          let t = 0;
          const demo = setInterval(() => {
            t += 0.05;
            update(Math.sin(t) * 6, Math.cos(t * 0.8) * 4);
          }, 80);
          this._cleanup2 = () => clearInterval(demo);
          return;
        }

        handler = (e) => {
          if (e.beta === null && e.gamma === null) return;
          update(e.beta || 0, e.gamma || 0);
        };
        window.addEventListener('deviceorientation', handler, true);
      };

      this._cleanup = () => {
        if (handler) window.removeEventListener('deviceorientation', handler, true);
        if (this._cleanup2) this._cleanup2();
      };

      host.append(area, statusText,
        el('div', { class: 'stat-grid' },
          el('div', { class: 'stat' }, betaEl, el('div', { class: 'k' }, 'Pitch (β)')),
          el('div', { class: 'stat' }, gammaEl, el('div', { class: 'k' }, 'Roll (γ)'))),
        el('div', { class: 'action-bar' },
          el('button', {
            class: 'btn btn-primary',
            onclick: async () => {
              await start();
            },
          }, 'Enable sensor'),
          el('button', {
            class: 'btn btn-fill',
            onclick: () => {
              calib.b = parseFloat(betaEl.textContent) || 0;
              calib.g = parseFloat(gammaEl.textContent) || 0;
              toast('Calibrated to current surface');
            },
          }, 'Calibrate here')),
        el('div', { class: 'hint' }, 'Place your device on a surface, tap "Calibrate here" to zero it, then check other surfaces.'));
      start();
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 4. Vibration Test ---------------- */
  {
    id: 'vibration',
    name: 'Vibration',
    desc: 'Haptic motor tester',
    cat: 'Device & Sensors',
    keywords: ['vibrate', 'haptic', 'motor', 'buzz', 'phone', 'test', 'pattern', 'sos'],
    icon: { bg: 'linear-gradient(135deg,#5e5ce6,#bf5af2)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="8" y="3" width="8" height="18" rx="2.5"/><path d="M4 8v8M20 8v8M1.5 10.5v3M22.5 10.5v3"/></svg>` },
    render(host) {
      const status = el('div', { class: 'result-sub', style: 'text-align:center;min-height:22px' }, '');

      const buzz = (pattern, label) => {
        if (!navigator.vibrate) {
          status.textContent = '⚠️ Vibration API not supported on this device/browser. Most desktops and iOS Safari do not support it.';
          status.style.color = 'var(--orange)';
          toast('Vibration not supported here');
          return;
        }
        try {
          navigator.vibrate(pattern);
          status.textContent = `Buzzing: ${label}`;
          status.style.color = 'var(--green)';
          setTimeout(() => { status.textContent = 'Done — did you feel it?'; }, Array.isArray(pattern) ? pattern.reduce((a, b) => a + b, 0) + 100 : pattern + 150);
        } catch {
          status.textContent = 'Vibration request failed.';
        }
      };

      const presets = [
        ['⚡ Short', [80], 'short tap'],
        ['〰️ Medium', [250], 'medium buzz'],
        ['💥 Long', [600], 'long buzz'],
        ['📳 Double', [120, 80, 120], 'double tap'],
        ['〰️〰️ Pulsing', [100, 80, 100, 80, 100], 'pulse train'],
        ['🆘 SOS', [200, 120, 200, 120, 200, 400, 400, 120, 400, 120, 400, 400, 200, 120, 200, 120, 200], 'SOS pattern'],
      ];

      host.append(
        el('div', { class: 'stat-grid', style: 'grid-template-columns:repeat(auto-fit,minmax(130px,1fr))' },
          presets.map(([label, pat, desc]) =>
            el('button', {
              class: 'stat',
              style: 'cursor:pointer;transition:transform .15s',
              onclick: (e) => { e.currentTarget.style.transform = 'scale(0.95)'; setTimeout(() => e.currentTarget.style.transform = '', 150); buzz(pat, desc); },
            },
              el('div', { class: 'v', style: 'font-size:15px' }, label),
              el('div', { class: 'k' }, desc)))),
        status,
        el('div', { class: 'note-warn' }, 'Note: iOS Safari (and most desktop browsers) block the Vibration API. This works best on Android/Chrome.'),
      );
    },
  },

  /* ---------------- 5. Battery ---------------- */
  {
    id: 'battery',
    name: 'Battery',
    desc: 'Charge & power status',
    cat: 'Device & Sensors',
    keywords: ['battery', 'charge', 'charging', 'power', 'percent', 'level', 'drain'],
    icon: { bg: 'linear-gradient(135deg,#30d158,#0a84ff)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="2" y="7" width="17" height="11" rx="3"/><path d="M21.5 10.5v4a2 2 0 0 1-2 2"/><path d="M10 10l-2 4h4l-2 4" stroke-width="1.8"/></svg>` },
    render(host) {
      const ring = el('div', { class: 'bat-ring-wrap', html: `
        <svg viewBox="0 0 220 220" style="transform:rotate(-90deg)">
          <defs><linearGradient id="batGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#30d158"/><stop offset="1" stop-color="#0a84ff"/>
          </linearGradient></defs>
          <circle cx="110" cy="110" r="90" fill="none" stroke="var(--fill-secondary)" stroke-width="14"/>
          <circle class="bat-fg" cx="110" cy="110" r="90" fill="none" stroke="url(#batGrad)" stroke-width="14" stroke-linecap="round" stroke-dasharray="565.5" stroke-dashoffset="565.5" style="transition:stroke-dashoffset .6s ease"/>
        </svg>` });
      const center = el('div', { class: 'ring-center' });
      ring.append(center);
      const pctEl = el('div', { class: 'ring-time' }, '…');
      const statEl = el('div', { class: 'ring-label' }, 'checking');
      center.append(pctEl, statEl);
      const details = el('div', { class: 'list' });

      const render = (bat) => {
        const pct = Math.round((bat.level ?? 0) * 100);
        pctEl.textContent = pct + '%';
        statEl.textContent = bat.charging ? '⚡ Charging' : 'On battery';
        statEl.style.color = bat.charging ? 'var(--green)' : 'var(--label-secondary)';
        const C = 2 * Math.PI * 90;
        ring.querySelector('.bat-fg').setAttribute('stroke-dashoffset', String(C * (1 - (bat.level ?? 0))));
        ring.querySelector('.bat-fg').setAttribute('stroke', pct <= 20 ? 'var(--red)' : 'url(#batGrad)');
        details.innerHTML = '';
        const rows = [
          ['Level', pct + '%'],
          ['Status', bat.charging ? 'Charging' : 'Discharging / idle'],
          ['Time to full', bat.charging && bat.chargingTime && isFinite(bat.chargingTime) ? Math.round(bat.chargingTime / 60) + ' min' : '—'],
          ['Time to empty', !bat.charging && bat.dischargingTime && isFinite(bat.dischargingTime) ? Math.round(bat.dischargingTime / 60) + ' min' : '—'],
        ];
        rows.forEach(([k, v]) => details.append(el('div', { class: 'list-row' }, el('span', { class: 'k' }, k), el('span', { class: 'v' }, v))));
      };

      const init = async () => {
        if (!navigator.getBattery) {
          pctEl.textContent = '—';
          statEl.textContent = 'not supported';
          host.append(el('div', { class: 'note-warn' }, 'The Battery Status API is not available in this browser. Try Chrome on Android or desktop.'));
          return;
        }
        const bat = await navigator.getBattery();
        render(bat);
        const onChange = () => render(bat);
        ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange'].forEach((ev) => bat.addEventListener(ev, onChange));
        this._cleanup = () => ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange'].forEach((ev) => bat.removeEventListener(ev, onChange));
      };

      host.append(ring, details,
        el('div', { class: 'hint' }, 'Live battery data via the Battery Status API — updates as your charge changes.'));
      init();
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 6. Sound Meter ---------------- */
  {
    id: 'sound-meter',
    name: 'Sound Meter',
    desc: 'Ambient noise level',
    cat: 'Device & Sensors',
    keywords: ['sound', 'noise', 'decibel', 'db', 'meter', 'microphone', 'volume', 'spl'],
    icon: { bg: 'linear-gradient(135deg,#ff375f,#ff9f0a)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7"/></svg>` },
    render(host) {
      const bar = el('div', { class: 'db-bar' });
      const levelEl = el('div', { class: 'result-big', style: 'text-align:center' }, '—');
      const peakEl = el('div', { class: 'result-sub', style: 'text-align:center' }, '');
      const status = el('div', { class: 'hint', style: 'text-align:center' }, '');
      let stream = null, audioCtx = null, iv = null, peak = 0;

      const stop = () => {
        if (iv) { clearInterval(iv); iv = null; }
        if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
        if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
      };
      this._cleanup = stop;

      const start = async () => {
        if (stream) { stop(); status.textContent = 'Stopped.'; startBtn.textContent = 'Start meter'; return; }
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 2048;
          source.connect(analyser);
          const data = new Float32Array(analyser.fftSize);
          startBtn.textContent = 'Stop meter';
          status.textContent = 'Listening… tap Stop when done. Values are approximate (relative to your mic).';
          status.style.color = 'var(--green)';
          peak = 0;
          iv = setInterval(() => {
            analyser.getFloatTimeDomainData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
            const rms = Math.sqrt(sum / data.length);
            // Map RMS to a pseudo-dB scale (calibration-free approximation)
            const db = rms > 0 ? Math.max(0, Math.min(120, 20 * Math.log10(rms) + 94)) : 0;
            peak = Math.max(peak, db);
            levelEl.textContent = fmt(db, 1);
            levelEl.append(el('span', { class: 'unit' }, 'dB'));
            bar.style.width = Math.min(100, (db / 120) * 100) + '%';
            peakEl.textContent = `Peak: ${fmt(peak, 1)} dB · RMS ${fmt(rms, 4)}`;
          }, 80);
        } catch {
          status.textContent = 'Microphone access denied or unavailable. Allow mic permission and try again.';
          status.style.color = 'var(--red)';
        }
      };

      const startBtn = el('button', { class: 'btn btn-primary btn-block', onclick: start }, 'Start meter');

      host.append(
        levelEl,
        el('div', { class: 'db-bar-wrap' }, bar),
        peakEl,
        startBtn,
        status,
        el('div', { class: 'note-warn' }, 'For fun/education only — phone microphones are not calibrated SPL meters.'),
      );
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 7. Pulse / BPM ---------------- */
  {
    id: 'pulse',
    name: 'Pulse BPM',
    desc: 'Heart rate by tapping',
    cat: 'Device & Sensors',
    keywords: ['heart', 'pulse', 'bpm', 'rate', 'beats', 'health', 'fitness', 'tap'],
    icon: { bg: 'linear-gradient(135deg,#ff375f,#ff9f0a)', svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>` },
    render(host) {
      let taps = [];
      const bpmEl = el('div', { class: 'result-big', style: 'text-align:center' }, '—');
      const hintEl = el('div', { class: 'result-sub', style: 'text-align:center;min-height:40px' }, 'Find your pulse (wrist or neck), then tap the heart in time with each beat.');
      const btn = el('button', { class: 'pulse-btn', html: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' });

      const calc = () => {
        const now = performance.now();
        taps = taps.filter((t) => now - t < 20000); // keep last 20s
        if (taps.length < 2) {
          bpmEl.textContent = taps.length ? '…' : '—';
          return;
        }
        const span = taps[taps.length - 1] - taps[0];
        const beats = taps.length - 1;
        const bpm = (beats / span) * 60000;
        bpmEl.textContent = Math.round(bpm).toString();
        bpmEl.append(el('span', { class: 'unit' }, 'BPM'));
        let zone = 'Resting range';
        if (bpm < 60) zone = 'Below typical resting — relaxed or athletic';
        else if (bpm <= 100) zone = 'Normal resting range (60–100)';
        else if (bpm <= 140) zone = 'Elevated — active or stressed';
        else zone = 'High — if at rest, consider resting further';
        hintEl.textContent = `${taps.length} taps · ${zone}`;
      };

      btn.addEventListener('click', () => {
        taps.push(performance.now());
        btn.classList.remove('beat');
        void btn.offsetWidth;
        btn.classList.add('beat');
        haptic(12);
        calc();
      });

      const reset = () => {
        taps = [];
        bpmEl.textContent = '—';
        hintEl.textContent = 'Find your pulse (wrist or neck), then tap the heart in time with each beat.';
      };

      host.append(btn, bpmEl, hintEl,
        el('button', { class: 'btn btn-fill btn-block', onclick: reset }, 'Reset'),
        el('div', { class: 'hint', style: 'text-align:center' }, 'Estimates BPM from your taps over the last 20 seconds. For wellness curiosity only — not medical advice.'));
    },
  },
];
