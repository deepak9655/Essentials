/* Extra Text & Generate — 9 tools */
import { el, fmt, copy, toast, haptic, beep } from '../util.js';

export const categories = ['Text & Dev', 'Generate'];

const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const tools = [
  /* ---------------- 1. Text Compare ---------------- */
  {
    id: 'text-compare',
    name: 'Text Compare',
    desc: 'Line-by-line diff',
    cat: 'Text & Dev',
    keywords: ['diff', 'compare', 'difference', 'text', 'change', 'version', 'delta'],
    icon: { bg: 'linear-gradient(135deg,#0a84ff,#30d158)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><path d="M12 2v20"/></svg>` },
    render(host) {
      const ta = el('textarea', { class: 'textarea', placeholder: 'Original text…' });
      const tb = el('textarea', { class: 'textarea', placeholder: 'Changed text…' });
      const out = el('div', { class: 'list', style: 'max-height:260px;overflow:auto' });
      const stats = el('div', { class: 'hint' }, '');

      const compare = () => {
        const a = ta.value.split('\n'), b = tb.value.split('\n');
        const setB = new Set(b), setA = new Set(a);
        out.innerHTML = '';
        let same = 0, onlyA = 0, onlyB = 0;
        const rows = [];
        const maxLen = Math.max(a.length, b.length);
        for (let i = 0; i < maxLen; i++) {
          const la = a[i], lb = b[i];
          if (la === lb) { if (la !== undefined) { rows.push(['same', la]); same++; } }
          else {
            if (la !== undefined) { rows.push(['del', la]); onlyA++; }
            if (lb !== undefined) { rows.push(['add', lb]); onlyB++; }
          }
        }
        rows.forEach(([kind, line]) => {
          const style = kind === 'add' ? 'background:rgba(48,209,88,.12);color:var(--green)'
            : kind === 'del' ? 'background:rgba(255,69,58,.12);color:var(--red)' : 'color:var(--label-secondary)';
          out.append(el('div', { class: 'list-row mono', style },
            el('span', { style: 'min-width:14px;font-weight:800' }, kind === 'add' ? '+' : kind === 'del' ? '−' : ' '),
            el('span', { style: 'white-space:pre-wrap;word-break:break-word' }, line || ' ')));
        });
        stats.textContent = `${same} unchanged · ${onlyA} removed · ${onlyB} added`;
        stats.style.color = 'var(--label-secondary)';
      };
      [ta, tb].forEach((x) => x.addEventListener('input', compare));
      host.append(
        el('div', { class: 'pane-row' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Original'), ta),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Changed'), tb)),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-primary', onclick: compare }, 'Compare'),
          el('button', { class: 'btn btn-ghost', onclick: () => { ta.value = tb.value; compare(); } }, '← Copy right to left')),
        out, stats);
    },
  },

  /* ---------------- 2. Slugify ---------------- */
  {
    id: 'slugify',
    name: 'Slugify',
    desc: 'SEO-friendly URL slugs',
    cat: 'Text & Dev',
    keywords: ['slug', 'url', 'seo', 'title', 'permalink', 'kebab', 'clean', 'filename'],
    icon: { bg: 'linear-gradient(135deg,#32ade6,#0a84ff)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/></svg>` },
    render(host) {
      const ta = el('textarea', { class: 'textarea', placeholder: 'My Awesome Blog Post! (2026)', style: 'min-height:70px' });
      ta.value = 'My Awesome Blog Post! (2026)';
      const out = el('div', { class: 'textarea', style: 'min-height:52px;background:var(--fill-quaternary);cursor:text;user-select:all' });
      const sep = el('select', { class: 'select', style: 'max-width:110px' },
        el('option', { value: '-' }, 'Dash -'), el('option', { value: '_' }, 'Underscore _'));
      const lower = el('button', { class: 'switch on', role: 'switch' });
      lower.addEventListener('click', () => { lower.classList.toggle('on'); calc(); });

      const calc = () => {
        let s = ta.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9\s_-]/g, '')
          .trim();
        if (!lower.classList.contains('on')) s = s.toUpperCase();
        out.textContent = s.replace(/[\s_-]+/g, sep.value);
      };
      ta.addEventListener('input', calc);
      sep.addEventListener('change', calc);
      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Title / text'), ta),
        el('div', { class: 'pane-row' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Separator'), sep),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Lowercase'),
            el('div', { style: 'display:flex;align-items:center;height:46px' }, lower))),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Slug'), out),
        el('button', { class: 'btn btn-primary btn-block', onclick: () => copy(out.textContent, 'Slug copied') }, 'Copy slug'));
      calc();
    },
  },

  /* ---------------- 3. HTML Formatter ---------------- */
  {
    id: 'html-format',
    name: 'HTML Formatter',
    desc: 'Pretty-print & minify HTML',
    cat: 'Text & Dev',
    keywords: ['html', 'format', 'pretty', 'minify', 'indent', 'markup', 'web'],
    icon: { bg: 'linear-gradient(135deg,#ff9f0a,#ff453a)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M8 4L3 12l5 8M16 4l5 8-5 8M13 5l-2 14"/></svg>` },
    render(host) {
      const ta = el('textarea', { class: 'textarea', placeholder: '<div class="card"><p>Hi</p></div>', style: 'min-height:130px' });
      ta.value = '<div class="card"><h2>Hello</h2><p>World</p></div>';
      const out = el('pre', { class: 'textarea mono', style: 'min-height:130px;white-space:pre-wrap;background:var(--fill-quaternary);overflow:auto' });

      const format = () => {
        const src = ta.value.trim();
        if (!src) { out.textContent = ''; return; }
        // Tokenize tags & text, re-indent
        const tokens = src.replace(/>\s*</g, '><').replace(/</g, '\n<').split('\n').filter(Boolean);
        let depth = 0;
        const VOID = /^(<br|<hr|<img|<input|<meta|<link|<source|<area|<base|<col|<embed|<track|<wbr|<!|<\?)/i;
        const CLOSE = /^<\//;
        const lines = [];
        for (const raw of tokens) {
          const t = raw.trim();
          if (CLOSE.test(t)) depth = Math.max(0, depth - 1);
          lines.push('  '.repeat(depth) + t);
          const opens = (t.match(/<[a-zA-Z][^/]*>/g) || []).length;
          const closes = (t.match(/<\/[a-zA-Z]/g) || []).length;
          const selfClose = /\/>$/.test(t);
          if (!CLOSE.test(t) && !VOID.test(t) && !selfClose && opens > closes && !/<\/[a-zA-Z][^>]*>$/.test(t)) depth++;
          // inline open+close like <p>Hi</p> keeps depth
          if (/<([a-zA-Z][^>]*)>.*<\/\1>/.test(t) && !CLOSE.test(t)) depth = Math.max(0, depth - 1);
        }
        out.textContent = lines.join('\n');
      };

      const minify = () => {
        out.textContent = ta.value.replace(/\n\s*/g, '').replace(/>\s+</g, '><').trim();
      };

      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'HTML input'), ta),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-primary', onclick: format }, 'Format'),
          el('button', { class: 'btn btn-fill', onclick: minify }, 'Minify'),
          el('button', { class: 'btn btn-ghost', onclick: () => copy(out.textContent) }, 'Copy')),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Output'), out));
      format();
    },
  },

  /* ---------------- 4. Character Info ---------------- */
  {
    id: 'char-info',
    name: 'Characters',
    desc: 'ASCII, Unicode & codes',
    cat: 'Text & Dev',
    keywords: ['ascii', 'unicode', 'char', 'code', 'hex', 'binary', 'utf', 'glyph', 'utf-8'],
    icon: { bg: 'linear-gradient(135deg,#5e5ce6,#64d2ff)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M6 7V5a1 1 0 0 1 1-1h2M18 7V5a1 1 0 0 0-1-1h-2"/><path d="M5 7h14M12 7v12M8 19h8"/></svg>` },
    render(host) {
      const input = el('input', { class: 'input', type: 'text', value: 'A', maxlength: '6', style: 'font-size:24px;text-align:center' });
      const grid = el('div', { class: 'stat-grid' });
      const utf = el('div', { class: 'list' });

      const calc = () => {
        const ch = input.value;
        grid.innerHTML = ''; utf.innerHTML = '';
        if (!ch) return;
        [...ch].slice(0, 6).forEach((c) => {
          const cp = c.codePointAt(0);
          const mk = (v, k) => el('div', { class: 'stat' }, el('div', { class: 'v mono', style: 'font-size:15px' }, v), el('div', { class: 'k' }, k));
          grid.append(
            mk(`'${c}'`, 'Char'),
            mk(String(cp), 'Decimal'),
            mk('U+' + cp.toString(16).toUpperCase().padStart(4, '0'), 'Unicode'),
            mk('0x' + cp.toString(16).toUpperCase(), 'Hex'),
            mk('0b' + cp.toString(2), 'Binary'),
            mk(String.fromCharCode(cp).charCodeAt(0) === cp && cp < 128 ? 'ASCII' : 'Unicode', 'Range'),
          );
          const bytes = [...new TextEncoder().encode(c)];
          utf.append(el('div', { class: 'list-row' },
            el('span', { class: 'k' }, `UTF-8 bytes for '${c}'`),
            el('span', { class: 'v mono' }, bytes.map((b) => b.toString(16).padStart(2, '0')).join(' '))));
        });
      };
      input.addEventListener('input', calc);
      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Type a character (or paste several)'), input),
        grid, utf);
      calc();
    },
  },

  /* ---------------- 5. Speech ---------------- */
  {
    id: 'speech',
    name: 'Speech',
    desc: 'Text↔voice (TTS & STT)',
    cat: 'Text & Dev',
    keywords: ['speech', 'tts', 'stt', 'voice', 'talk', 'speak', 'listen', 'dictate', 'audio', 'a11y'],
    icon: { bg: 'linear-gradient(135deg,#bf5af2,#ff375f)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0M12 17v4"/></svg>` },
    render(host) {
      const ta = el('textarea', { class: 'textarea', placeholder: 'Type text to speak, or use the microphone…', style: 'min-height:110px' });
      ta.value = 'Hello from Essentials — the ultimate all tools app!';
      const voiceSel = el('select', { class: 'select' }, el('option', {}, 'Default voice'));
      const rate = el('input', { type: 'range', min: '0.5', max: '2', step: '0.1', value: '1' });
      const rateVal = el('span', { class: 'slider-value' }, '1.0×');
      const status = el('div', { class: 'hint' }, '');

      const loadVoices = () => {
        if (!('speechSynthesis' in window)) return;
        const voices = speechSynthesis.getVoices();
        voiceSel.innerHTML = '';
        if (!voices.length) { voiceSel.append(el('option', {}, 'Default voice')); return; }
        voices.slice(0, 40).forEach((v, i) => voiceSel.append(el('option', { value: String(i) }, `${v.name} (${v.lang})`)));
      };
      if ('speechSynthesis' in window) {
        loadVoices();
        speechSynthesis.addEventListener('voiceschanged', loadVoices);
        this._cleanup = () => { speechSynthesis.cancel(); speechSynthesis.removeEventListener('voiceschanged', loadVoices); };
      }

      const speak = () => {
        if (!('speechSynthesis' in window)) { status.textContent = 'Speech synthesis not supported in this browser.'; return; }
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(ta.value);
        const voices = speechSynthesis.getVoices();
        if (voices[voiceSel.value]) u.voice = voices[voiceSel.value];
        u.rate = parseFloat(rate.value);
        status.textContent = 'Speaking…';
        u.onend = () => status.textContent = 'Done.';
        speechSynthesis.speak(u);
      };

      const listen = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { status.textContent = 'Speech recognition needs Chrome/Edge/Safari. Your browser does not support it.'; status.style.color = 'var(--orange)'; return; }
        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = true;
        status.textContent = 'Listening… speak now';
        status.style.color = 'var(--green)';
        micBtn.textContent = '● Listening…';
        rec.onresult = (e) => {
          const text = [...e.results].map((r) => r[0].transcript).join('');
          ta.value = text;
        };
        rec.onend = () => { micBtn.textContent = '🎤 Dictate'; status.textContent = 'Stopped listening.'; status.style.color = ''; };
        rec.onerror = () => { micBtn.textContent = '🎤 Dictate'; status.textContent = 'Could not listen — check microphone permission.'; status.style.color = 'var(--red)'; };
        rec.start();
      };

      const micBtn = el('button', { class: 'btn btn-fill', onclick: listen }, '🎤 Dictate');

      rate.addEventListener('input', () => rateVal.textContent = parseFloat(rate.value).toFixed(1) + '×');
      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Text'), ta),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Voice'), voiceSel),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Rate'),
          el('div', { class: 'slider-row' }, rate, rateVal)),
        el('div', { class: 'action-bar' },
          el('button', { class: 'btn btn-primary', onclick: speak }, '🔊 Speak'),
          micBtn,
          el('button', { class: 'btn btn-ghost', onclick: () => speechSynthesis.cancel() }, 'Stop')),
        status);
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },

  /* ---------------- 6. Color Palette ---------------- */
  {
    id: 'palette',
    name: 'Palette',
    desc: 'Color harmonies & codes',
    cat: 'Generate',
    keywords: ['color', 'palette', 'harmony', 'design', 'triadic', 'complementary', 'hex', 'scheme'],
    icon: { bg: 'linear-gradient(135deg,#ff375f,#ffd60a,#30d158)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-2a2.5 2.5 0 0 0-2 4c.5.8 0 2-2 2z"/><circle cx="7.5" cy="11" r="1" fill="currentColor"/><circle cx="11" cy="7" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/></svg>` },
    render(host) {
      const base = el('input', { type: 'color', value: '#5e5ce6' });
      const hexIn = el('input', { class: 'input mono', type: 'text', value: '#5E5CE6', style: 'flex:1' });
      const sel = el('select', { class: 'select' },
        ['Analogous', 'Complementary', 'Triadic', 'Split-complementary', 'Tetradic', 'Monochromatic shades'].map((s, i) =>
          el('option', { value: s, selected: i === 0 ? '' : undefined }, s)));
      const swatches = el('div', { style: 'display:flex;gap:10px;margin:14px 0;flex-wrap:wrap' });

      const hexToHsl = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0; const l = (max + min) / 2;
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          else if (max === g) h = ((b - r) / d + 2) / 6;
          else h = ((r - g) / d + 4) / 6;
        }
        return [h * 360, s * 100, l * 100];
      };
      const hslToHex = (h, s, l) => {
        s /= 100; l /= 100;
        const k = (n) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        const to = (x) => Math.round(255 * x).toString(16).padStart(2, '0');
        return `#${to(f(0))}${to(f(8))}${to(f(4))}`.toUpperCase();
      };

      const render = () => {
        const hex = hexIn.value.toUpperCase();
        if (!/^#[0-9A-F]{6}$/.test(hex)) return;
        const [h, s, l] = hexToHsl(hex);
        const mode = sel.value;
        let colors;
        switch (mode) {
          case 'Complementary': colors = [hex, hslToHex((h + 180) % 360, s, l)]; break;
          case 'Triadic': colors = [0, 120, 240].map((d) => hslToHex((h + d) % 360, s, l)); break;
          case 'Split-complementary': colors = [0, 150, 210].map((d) => hslToHex((h + d) % 360, s, l)); break;
          case 'Tetradic': colors = [0, 90, 180, 270].map((d) => hslToHex((h + d) % 360, s, l)); break;
          case 'Monochromatic shades': colors = [12, 26, 42, 58, 74, 88].map((L) => hslToHex(h, s, L)); break;
          default: colors = [-40, -20, 0, 20, 40].map((d) => hslToHex((h + d + 360) % 360, s, l));
        }
        swatches.innerHTML = '';
        colors.forEach((c, i) => {
          const chip = el('button', {
            class: 'swatch',
            style: `flex:1;min-width:70px;height:86px;border-radius:16px;background:${c};border:1px solid var(--separator);cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px`,
            onclick: () => copy(c, c + ' copied'),
          }, el('span', { style: `font-size:11px;font-weight:800;color:${l > 55 ? '#000' : '#fff'}` }, c));
          chip.style.animation = `fadeUp .35s ease both`;
          chip.style.animationDelay = (i * 50) + 'ms';
          swatches.append(chip);
        });
      };

      base.addEventListener('input', () => { hexIn.value = base.value.toUpperCase(); render(); });
      hexIn.addEventListener('input', () => { if (/^#[0-9A-Fa-f]{6}$/.test(hexIn.value)) { base.value = hexIn.value; render(); } });
      sel.addEventListener('change', render);
      host.append(
        el('div', { class: 'color-row' }, base, hexIn),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Harmony'), sel),
        swatches,
        el('div', { class: 'hint' }, 'Tap any swatch to copy its hex code.'));
      render();
    },
  },

  /* ---------------- 7. PIN Generator ---------------- */
  {
    id: 'pin',
    name: 'PIN Generator',
    desc: 'Secure numeric PINs',
    cat: 'Generate',
    keywords: ['pin', 'code', 'passcode', 'otp', 'numeric', 'secure', 'random', 'lock'],
    icon: { bg: 'linear-gradient(135deg,#1c1c1e,#0a84ff)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="5" y="10" width="14" height="11" rx="2.5"/><circle cx="9" cy="15.5" r="1.2" fill="currentColor"/><circle cx="12" cy="15.5" r="1.2" fill="currentColor"/><circle cx="15" cy="15.5" r="1.2" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>` },
    render(host) {
      const len = el('input', { class: 'input', type: 'number', min: '3', max: '16', value: '6', style: 'max-width:110px' });
      const uniq = el('button', { class: 'switch', role: 'switch' });
      uniq.addEventListener('click', () => uniq.classList.toggle('on'));
      const count = el('input', { class: 'input', type: 'number', min: '1', max: '10', value: '1', style: 'max-width:110px' });
      const out = el('div', { class: 'pill-row', style: 'justify-content:center;min-height:56px;align-items:center' });

      const gen = () => {
        const n = Math.min(16, Math.max(3, parseInt(len.value) || 6));
        const k = Math.min(10, Math.max(1, parseInt(count.value) || 1));
        const unique = uniq.classList.contains('on');
        out.innerHTML = '';
        for (let p = 0; p < k; p++) {
          let pin = '';
          const used = new Set();
          const buf = new Uint32Array(n * 2);
          crypto.getRandomValues(buf);
          let bi = 0;
          while (pin.length < n) {
            const d = buf[bi++ % buf.length] % 10;
            if (unique && used.has(d)) continue;
            used.add(d);
            pin += d;
          }
          out.append(el('button', {
            class: 'pill active',
            style: `font-size:22px;letter-spacing:6px;padding:12px 18px;animation:fadeUp .35s ease both;animation-delay:${p * 60}ms`,
            onclick: () => copy(pin, 'PIN copied'),
          }, pin));
        }
        haptic();
      };

      host.append(
        el('div', { class: 'pane-row' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Digits'), len),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'How many'), count)),
        el('div', { class: 'switch-row' }, el('span', { class: 'switch-label' }, 'Unique digits only'), uniq),
        out,
        el('div', { class: 'action-bar' },
          el('button', { class: 'btn btn-primary btn-block', onclick: gen }, '↻ Generate PINs')),
        el('div', { class: 'hint' }, 'Tap a PIN to copy. Generated with WebCrypto — never leaves your device.'));
      gen();
    },
  },

  /* ---------------- 8. Random Picker ---------------- */
  {
    id: 'picker',
    name: 'Picker',
    desc: 'Random name & list picker',
    cat: 'Generate',
    keywords: ['picker', 'random', 'name', 'list', 'choose', 'raffle', 'shuffle', 'team', 'wheel'],
    icon: { bg: 'linear-gradient(135deg,#30d158,#ffd60a)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M9 18l6-12M15 18L9 6"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>` },
    render(host) {
      const ta = el('textarea', { class: 'textarea', placeholder: 'One entry per line…', style: 'min-height:110px' });
      ta.value = 'Ava\nBen\nChitra\nDev\nElena\nFarah';
      const count = el('input', { class: 'input', type: 'number', min: '1', max: '10', value: '1', style: 'max-width:110px' });
      const uniq = el('button', { class: 'switch on', role: 'switch' });
      uniq.addEventListener('click', () => uniq.classList.toggle('on'));
      const out = el('div', { class: 'pill-row', style: 'justify-content:center;min-height:56px;align-items:center' });

      const pick = () => {
        const items = ta.value.split('\n').map((s) => s.trim()).filter(Boolean);
        if (!items.length) { toast('Add some entries first'); return; }
        const k = Math.min(10, Math.max(1, parseInt(count.value) || 1));
        const unique = uniq.classList.contains('on');
        if (unique && items.length < k) { toast('Not enough unique entries'); return; }
        const pool = [...items];
        const chosen = [];
        const buf = new Uint32Array(k * 3);
        crypto.getRandomValues(buf);
        let bi = 0;
        while (chosen.length < k && pool.length) {
          const i = buf[bi++ % buf.length] % pool.length;
          chosen.push(pool.splice(i, 1)[0]);
          if (!unique && chosen.length < k && pool.length === 0) pool.push(...items);
        }
        out.innerHTML = '';
        chosen.forEach((c, i) => out.append(el('span', {
          class: 'pill active',
          style: `font-size:17px;padding:10px 18px;animation:fadeUp .35s ease both;animation-delay:${i * 70}ms`,
        }, c)));
        haptic();
      };

      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Entries'), ta),
        el('div', { class: 'pane-row' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Pick how many'), count),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'No repeats'),
            el('div', { style: 'display:flex;align-items:center;height:46px' }, uniq))),
        out,
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-primary', onclick: pick }, '🎲 Pick'),
          el('button', { class: 'btn btn-fill', onclick: () => {
            const items = ta.value.split('\n').map((s) => s.trim()).filter(Boolean);
            for (let i = items.length - 1; i > 0; i--) {
              const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
              [items[i], items[j]] = [items[j], items[i]];
            }
            ta.value = items.join('\n');
            toast('List shuffled');
          } }, 'Shuffle list')));
      pick();
    },
  },

  /* ---------------- 9. Tone Generator ---------------- */
  {
    id: 'tone',
    name: 'Tone Generator',
    desc: 'Frequencies & waveforms',
    cat: 'Generate',
    keywords: ['tone', 'sound', 'frequency', 'hz', 'audio', 'sine', 'wave', 'tuning', '432', 'generator'],
    icon: { bg: 'linear-gradient(135deg,#32ade6,#bf5af2)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M2 12c2.5 0 2.5-7 5-7s2.5 14 5 14 2.5-7 5-7 2.5 7 5 7"/></svg>` },
    render(host) {
      let ctx = null, osc = null, gain = null, playing = false;
      const freqVal = el('span', { class: 'slider-value' }, '440 Hz');
      const freq = el('input', { type: 'range', min: '20', max: '4000', value: '440' });
      const volVal = el('span', { class: 'slider-value' }, '30%');
      const vol = el('input', { type: 'range', min: '0', max: '100', value: '30' });
      const wave = el('select', { class: 'select' }, ['sine', 'square', 'sawtooth', 'triangle'].map((w) => el('option', { value: w }, w)));
      const playBtn = el('button', { class: 'btn btn-primary btn-block', style: 'padding:15px;font-size:17px' }, '▶ Play tone');
      const presets = el('div', { class: 'pill-row' },
        [['A4 440Hz', 440], ['C5 523Hz', 523], ['432 Hz', 432], ['Low 60Hz', 60], ['High 2kHz', 2000]].map(([lab, f]) =>
          el('button', { class: 'pill', onclick: () => { freq.value = f; update(); if (playing) restart(); } }, lab)));

      const update = () => {
        freqVal.textContent = freq.value + ' Hz';
        volVal.textContent = vol.value + '%';
        if (osc) { osc.frequency.value = freq.value; gain.gain.value = (vol.value / 100) * 0.25; }
      };

      const stop = () => {
        if (osc) { try { osc.stop(); } catch { /* */ } osc = null; }
        playing = false;
        playBtn.textContent = '▶ Play tone';
      };

      const restart = () => { stop(); start(); };

      const start = () => {
        try {
          ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
          osc = ctx.createOscillator();
          gain = ctx.createGain();
          osc.type = wave.value;
          osc.frequency.value = freq.value;
          gain.gain.value = (vol.value / 100) * 0.25;
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start();
          playing = true;
          playBtn.textContent = '■ Stop tone';
        } catch { toast('Audio unavailable'); }
      };

      playBtn.addEventListener('click', () => playing ? stop() : start());
      freq.addEventListener('input', update);
      vol.addEventListener('input', update);
      wave.addEventListener('change', () => { if (playing) restart(); });
      this._cleanup = stop;

      host.append(
        presets,
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Frequency'),
          el('div', { class: 'slider-row' }, freq, freqVal)),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Volume'),
          el('div', { class: 'slider-row' }, vol, volVal)),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Waveform'), wave),
        playBtn,
        el('div', { class: 'hint' }, 'Pure oscillator tones — great for tuning instruments, testing speakers, or sound therapy experiments. Keep volume low!'));
      update();
    },
    destroy() { if (this._cleanup) this._cleanup(); },
  },
];
