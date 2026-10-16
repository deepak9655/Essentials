/* Generators — 6 tools */
import { el, fmt, copy, toast, haptic } from '../util.js';
import qrcode from '../vendor/qrcode.mjs';
import { stringToBytes as qrUtf8 } from '../vendor/qrcode-utf8.mjs';

// Enable UTF-8 QR payloads
qrcode.stringToBytes = qrUtf8;

export const categories = ['Generate'];

const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

const randomInt = (min, max) => crypto.getRandomValues(new Uint32Array(1))[0] % (max - min + 1) + min;

export const tools = [
  /* ---------------- 1. Password Generator ---------------- */
  {
    id: 'password',
    name: 'Password',
    desc: 'Cryptographically strong',
    cat: 'Generate',
    keywords: ['password', 'passcode', 'secure', 'random', 'strong', 'generator', 'pin'],
    icon: { bg: 'linear-gradient(135deg,#1c1c1e,#5e5ce6)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.4"/></svg>` },
    render(host) {
      const SETS = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789',
        symbols: '!@#$%^&*()-_=+[]{};:,.<>?/|~',
      };
      const state = { len: 20, upper: true, lower: true, digits: true, symbols: true, avoid: true };
      const out = el('div', {
        class: 'result-big mono',
        style: 'font-size:26px;padding:16px;background:var(--fill-quaternary);border-radius:16px;border:1px solid var(--separator);word-break:break-all;text-align:center;cursor:pointer;user-select:all',
        onclick: () => copy(out.textContent, 'Password copied'),
      }, '');
      const strengthLabel = el('div', { class: 'result-sub', style: 'text-align:center' }, '');
      const bar = el('div', { class: 'strength-bar' }, [0, 1, 2, 3].map(() => el('span')));
      const lenVal = el('span', { class: 'slider-value' }, String(state.len));
      const lenRange = el('input', { type: 'range', min: '6', max: '64', value: String(state.len) });

      const gen = () => {
        let pool = '';
        for (const [k, v] of Object.entries(SETS)) if (state[k]) pool += v;
        if (state.avoid) pool = pool.replace(/[O0oIl1|`'"]/g, '');
        if (!pool) { out.textContent = 'Select at least one set'; return; }
        let pwd = '';
        const arr = new Uint32Array(state.len);
        crypto.getRandomValues(arr);
        for (let i = 0; i < state.len; i++) pwd += pool[arr[i] % pool.length];
        out.textContent = pwd;

        // Strength estimate
        const entropy = state.len * Math.log2(pool.length);
        let lvl = 0, label = 'Weak', color = 'var(--red)';
        if (entropy > 45) { lvl = 1; label = 'Fair'; color = 'var(--orange)'; }
        if (entropy > 65) { lvl = 2; label = 'Strong'; color = 'var(--green)'; }
        if (entropy > 90) { lvl = 3; label = 'Excellent'; color = 'var(--blue)'; }
        strengthLabel.textContent = `${label} · ~${Math.round(entropy)} bits of entropy`;
        strengthLabel.style.color = color;
        bar.querySelectorAll('span').forEach((s, i) => {
          s.style.background = i <= lvl ? color : 'var(--fill-secondary)';
        });
      };

      lenRange.addEventListener('input', () => {
        state.len = parseInt(lenRange.value);
        lenVal.textContent = state.len;
        gen();
      });

      const toggles = el('div', { class: 'list' });
      for (const [key, label] of [['upper', 'Uppercase (A–Z)'], ['lower', 'Lowercase (a–z)'], ['digits', 'Digits (0–9)'], ['symbols', 'Symbols (!@#$…)'], ['avoid', 'Avoid look-alikes (O/0/l/1)']]) {
        const sw = el('button', { class: 'switch' + (state[key] ? ' on' : ''), role: 'switch', 'aria-checked': String(state[key]) });
        sw.addEventListener('click', () => {
          state[key] = !state[key];
          sw.classList.toggle('on', state[key]);
          gen(); haptic();
        });
        toggles.append(el('div', { class: 'switch-row' }, el('span', { class: 'switch-label' }, label), sw));
      }

      host.append(
        out, strengthLabel, bar,
        el('div', { class: 'field', style: 'margin-top:14px' }, el('label', { class: 'field-label' }, 'Length'),
          el('div', { class: 'slider-row' }, lenRange, lenVal)),
        toggles,
        el('div', { class: 'action-bar' },
          el('button', { class: 'btn btn-primary', onclick: gen }, '↻ Generate'),
          el('button', { class: 'btn btn-fill', onclick: () => copy(out.textContent, 'Password copied') }, 'Copy')),
      );
      gen();
    },
  },

  /* ---------------- 2. QR Code Generator ---------------- */
  {
    id: 'qr-generator',
    name: 'QR Code',
    desc: 'Links, text, Wi-Fi & more',
    cat: 'Generate',
    keywords: ['qr', 'qrcode', 'barcode', 'scan', 'link', 'url', 'code', 'share'],
    icon: { bg: 'linear-gradient(135deg,#1c1c1e,#0a84ff)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/><path d="M14 21h1M21 14h-1"/></svg>` },
    render(host) {
      const ta = el('textarea', { class: 'textarea', style: 'min-height:80px', placeholder: 'https://example.com or any text…' });
      const preview = el('div', { class: 'qr-preview' });
      const sizeSel = el('select', { class: 'select' },
        el('option', { value: '128' }, '128 px'),
        el('option', { value: '256', selected: '' }, '256 px'),
        el('option', { value: '512' }, '512 px'));
      const bgSel = el('select', { class: 'select' },
        el('option', { value: '#000000' }, 'Black'),
        el('option', { value: '#007aff' }, 'iOS Blue'),
        el('option', { value: '#1c1c1e' }, 'Graphite'));

      const presets = el('div', { class: 'pill-row' },
        ['Link', 'Wi-Fi', 'Email', 'Phone', 'SMS'].map((p) => el('button', {
          class: 'pill',
          onclick: () => {
            const templates = {
              Link: 'https://',
              'Wi-Fi': 'WIFI:T:WPA;S:MyNetwork;P:mypassword;;',
              Email: 'mailto:hello@example.com?subject=Hi',
              Phone: 'tel:+911234567890',
              SMS: 'smsto:+911234567890:Hello!',
            };
            ta.value = templates[p];
            render();
          },
        }, p)));

      const render = () => {
        preview.innerHTML = '';
        const text = ta.value.trim();
        if (!text) {
          preview.append(el('div', { style: 'color:#999;font-size:14px;font-weight:600;padding:60px' }, 'Type something to generate'));
          return;
        }
        try {
          const qr = qrcode(0, 'M');
          qr.addData(text);
          qr.make();
          const cell = Math.max(2, Math.floor(parseInt(sizeSel.value) / (qr.getModuleCount() + 8)));
          const div = el('div', { html: qr.createSvgTag({ cellSize: cell, margin: cell * 2, scalable: true }) });
          const svg = div.querySelector('svg');
          if (svg) {
            svg.style.width = parseInt(sizeSel.value) + 'px';
            svg.style.height = parseInt(sizeSel.value) + 'px';
            svg.querySelectorAll('path[fill]').forEach((p) => p.setAttribute('fill', bgSel.value));
          }
          preview.append(div);
        } catch (e) {
          preview.append(el('div', { style: 'color:var(--red);font-size:13px;padding:40px' }, 'Too much data for a QR code — try shorter text.'));
        }
      };

      ta.addEventListener('input', render);
      sizeSel.addEventListener('change', render);
      bgSel.addEventListener('change', render);

      const download = () => {
        const svg = preview.querySelector('svg');
        if (!svg) { toast('Generate a QR first'); return; }
        const size = parseInt(sizeSel.value);
        const canvas = el('canvas');
        canvas.width = size; canvas.height = size;
        const img = new Image();
        const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
          URL.revokeObjectURL(url);
          const a = el('a', { href: canvas.toDataURL('image/png'), download: 'essentials-qr.png' });
          a.click();
          toast('PNG downloaded');
        };
        img.src = url;
      };

      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Content'), ta),
        presets,
        preview,
        el('div', { class: 'pane-row' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Size'), sizeSel),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Color'), bgSel)),
        el('div', { class: 'action-bar' },
          el('button', { class: 'btn btn-primary', onclick: download }, 'Download PNG'),
          el('button', { class: 'btn btn-fill', onclick: () => copy(ta.value, 'QR content copied') }, 'Copy content')),
      );
      ta.value = 'https://github.com/deepak9655/Essentials';
      render();
    },
  },

  /* ---------------- 3. UUID Generator ---------------- */
  {
    id: 'uuid',
    name: 'UUID',
    desc: 'RFC 4122 v4 identifiers',
    cat: 'Generate',
    keywords: ['uuid', 'guid', 'identifier', 'unique', 'id', 'random', 'v4'],
    icon: { bg: 'linear-gradient(135deg,#bf5af2,#5e5ce6)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 12h8M12 8v8"/></svg>` },
    render(host) {
      const count = el('input', { class: 'input', type: 'number', min: '1', max: '20', value: '5', style: 'max-width:110px' });
      const list = el('div', { class: 'list' });
      let uuids = [];

      const gen = () => {
        const n = Math.min(20, Math.max(1, parseInt(count.value) || 5));
        uuids = [];
        for (let i = 0; i < n; i++) {
          uuids.push((crypto.randomUUID && crypto.randomUUID()) ||
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
              return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
            }));
        }
        list.innerHTML = '';
        uuids.forEach((u, i) => {
          list.append(el('div', { class: 'list-row', style: 'cursor:pointer', onclick: () => copy(u, 'UUID copied') },
            el('span', { class: 'k', style: 'min-width:22px' }, `#${i + 1}`),
            el('span', { class: 'v mono', style: 'font-size:12px' }, u)));
        });
      };

      count.addEventListener('input', gen);
      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'How many?'), count),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-primary', onclick: gen }, '↻ Generate'),
          el('button', { class: 'btn btn-fill', onclick: () => copy(uuids.join('\n'), 'All UUIDs copied') }, 'Copy all')),
        list,
        el('div', { class: 'hint' }, 'Tap any row to copy. Generated with WebCrypto.'),
      );
      gen();
    },
  },

  /* ---------------- 4. Random Number ---------------- */
  {
    id: 'random',
    name: 'Random',
    desc: 'Numbers, lottery & shuffle',
    cat: 'Generate',
    keywords: ['random', 'number', 'lottery', 'dice', 'shuffle', 'pick', 'generator', 'rng'],
    icon: { bg: 'linear-gradient(135deg,#0a84ff,#30d158)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>` },
    render(host) {
      const min = el('input', { class: 'input', type: 'number', value: '1' });
      const max = el('input', { class: 'input', type: 'number', value: '100' });
      const count = el('input', { class: 'input', type: 'number', min: '1', max: '20', value: '1', style: 'max-width:110px' });
      const uniq = el('button', { class: 'switch', role: 'switch' });
      uniq.addEventListener('click', () => uniq.classList.toggle('on'));
      const out = el('div', { class: 'pill-row', style: 'justify-content:center;min-height:56px;align-items:center' });

      const gen = () => {
        const lo = Math.min(parseInt(min.value) || 0, parseInt(max.value) || 0);
        const hi = Math.max(parseInt(min.value) || 0, parseInt(max.value) || 0);
        const n = Math.min(20, Math.max(1, parseInt(count.value) || 1));
        const unique = uniq.classList.contains('on');
        if (unique && hi - lo + 1 < n) { toast('Range too small for unique values'); return; }
        const results = [];
        const used = new Set();
        while (results.length < n) {
          const v = randomInt(lo, hi);
          if (unique && used.has(v)) continue;
          used.add(v);
          results.push(v);
        }
        out.innerHTML = '';
        results.forEach((v, i) => {
          const chip = el('div', {
            class: 'pill active',
            style: 'font-size:19px;padding:11px 18px;animation:fadeUp .35s ease both;animation-delay:' + (i * 55) + 'ms',
          }, String(v));
          out.append(chip);
        });
        haptic();
      };

      [min, max, count].forEach((x) => x.addEventListener('input', () => {}));
      host.append(
        el('div', { class: 'pane-row' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Min'), min),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Max'), max)),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'How many?'), count),
        el('div', { class: 'switch-row' }, el('span', { class: 'switch-label' }, 'Unique values only'), uniq),
        out,
        el('div', { class: 'action-bar' },
          el('button', { class: 'btn btn-primary btn-block', onclick: gen }, '↻ Generate')),
      );
      gen();
    },
  },

  /* ---------------- 5. Dice & Coin ---------------- */
  {
    id: 'dice-coin',
    name: 'Dice & Coin',
    desc: 'Roll dice, flip coins',
    cat: 'Generate',
    keywords: ['dice', 'die', 'coin', 'flip', 'roll', 'chance', 'random', 'game', 'heads', 'tails'],
    icon: { bg: 'linear-gradient(135deg,#ff375f,#ff9f0a)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/></svg>` },
    render(host) {
      let mode = 'dice';
      const face = el('div', { class: 'dice-face' }, '⚀');
      const result = el('div', { class: 'result-sub', style: 'text-align:center;min-height:22px;font-size:15px' }, 'Tap roll to begin');
      const diceCount = el('input', { class: 'input', type: 'number', min: '1', max: '6', value: '1', style: 'max-width:110px' });
      const sides = el('input', { class: 'input', type: 'number', min: '2', max: '100', value: '6', style: 'max-width:110px' });

      const seg = el('div', { class: 'segmented' });
      [['dice', 'Dice'], ['coin', 'Coin flip']].forEach(([id, label]) => {
        const b = el('button', { class: id === mode ? 'active' : '', onclick: () => {
          mode = id;
          seg.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x.textContent === label));
          face.textContent = id === 'dice' ? '⚀' : '🪙';
          result.textContent = 'Tap roll to begin';
          opts.style.display = id === 'dice' ? '' : 'none';
        } }, label);
        seg.append(b);
      });

      const opts = el('div', { class: 'pane-row' },
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Dice count'), diceCount),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Sides'), sides));

      const roll = () => {
        face.classList.remove('rolling');
        void face.offsetWidth;
        face.classList.add('rolling');
        haptic(12);
        if (mode === 'coin') {
          const heads = randomInt(0, 1) === 1;
          setTimeout(() => {
            face.textContent = heads ? '🪙' : '🪙';
            face.style.transform = `rotateY(${heads ? 0 : 180}deg)`;
            result.textContent = heads ? 'Heads!' : 'Tails!';
          }, 220);
        } else {
          const n = Math.min(6, Math.max(1, parseInt(diceCount.value) || 1));
          const s = Math.min(100, Math.max(2, parseInt(sides.value) || 6));
          const rolls = [];
          for (let i = 0; i < n; i++) rolls.push(randomInt(1, s));
          const total = rolls.reduce((a, b) => a + b, 0);
          const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
          setTimeout(() => {
            face.style.transform = '';
            face.textContent = n === 1 && s === 6 ? faces[rolls[0] - 1] : '🎲';
            result.textContent = (n > 1 ? rolls.join(' + ') + ' = ' : '') + `${total}`;
          }, 220);
        }
      };

      host.append(seg, face, result, opts,
        el('div', { class: 'action-bar' },
          el('button', { class: 'btn btn-primary btn-block', onclick: roll }, mode === 'coin' ? 'Flip!' : 'Roll!')));
    },
  },

  /* ---------------- 6. Gradient Generator ---------------- */
  {
    id: 'gradient',
    name: 'Gradient',
    desc: 'CSS gradients & codes',
    cat: 'Generate',
    keywords: ['gradient', 'css', 'color', 'design', 'linear', 'background', 'ui', 'hex'],
    icon: { bg: 'linear-gradient(135deg,#ff375f,#5e5ce6,#0a84ff)', svg: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18"/><circle cx="9" cy="10" r="1.2" fill="currentColor"/><circle cx="15" cy="14" r="1.2" fill="currentColor"/></svg>` },
    render(host) {
      const c1 = el('input', { type: 'color', value: '#5e5ce6' });
      const c2 = el('input', { type: 'color', value: '#0a84ff' });
      const h1 = el('input', { class: 'input mono', type: 'text', value: '#5E5CE6', style: 'flex:1' });
      const h2 = el('input', { class: 'input mono', type: 'text', value: '#0A84FF', style: 'flex:1' });
      const angleVal = el('span', { class: 'slider-value' }, '135°');
      const angle = el('input', { type: 'range', min: '0', max: '360', value: '135' });
      const swatch = el('div', { class: 'swatch' });
      const cssOut = el('div', { class: 'textarea mono', style: 'min-height:52px;background:var(--fill-quaternary);cursor:text;overflow:auto' });

      const update = () => {
        const a = parseInt(angle.value) || 135;
        const code = `background: linear-gradient(${a}deg, ${h1.value}, ${h2.value});`;
        angleVal.textContent = a + '°';
        swatch.style.background = `linear-gradient(${a}deg, ${h1.value}, ${h2.value})`;
        cssOut.textContent = code;
      };

      c1.addEventListener('input', () => { h1.value = c1.value.toUpperCase(); update(); });
      c2.addEventListener('input', () => { h2.value = c2.value.toUpperCase(); update(); });
      h1.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(h1.value)) { c1.value = h1.value; update(); } });
      h2.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(h2.value)) { c2.value = h2.value; update(); } });
      angle.addEventListener('input', update);

      const randomize = () => {
        const rnd = () => '#' + [...crypto.getRandomValues(new Uint8Array(3))].map((b) => b.toString(16).padStart(2, '0')).join('');
        h1.value = rnd().toUpperCase(); h2.value = rnd().toUpperCase();
        c1.value = h1.value; c2.value = h2.value;
        angle.value = randomInt(0, 360);
        update(); haptic();
      };

      host.append(
        el('div', { class: 'color-row' }, c1, h1, el('span', { style: 'font-size:13px;color:var(--label-secondary);font-weight:600' }, 'to'), c2, h2),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Angle'),
          el('div', { class: 'slider-row' }, angle, angleVal)),
        swatch,
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'CSS'), cssOut),
        el('div', { class: 'action-bar' },
          el('button', { class: 'btn btn-primary', onclick: randomize }, '🎲 Randomize'),
          el('button', { class: 'btn btn-fill', onclick: () => copy(cssOut.textContent, 'CSS copied') }, 'Copy CSS')),
      );
      update();
    },
  },
];
