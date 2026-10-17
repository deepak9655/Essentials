/* Text & Developer — 10 tools */
import { el, copy, toast } from '../util.js';

export const categories = ['Text & Dev'];

const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const tools = [
  /* ---------------- 1. Word Counter ---------------- */
  {
    id: 'word-counter',
    name: 'Word Counter',
    desc: 'Words, chars, reading time',
    cat: 'Text & Dev',
    keywords: ['words', 'characters', 'count', 'sentences', 'reading', 'essay', 'letters'],
    icon: { bg: 'linear-gradient(135deg,#0a84ff,#5e5ce6)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M4 7V5h16v2M9 5v14M7 19h4"/><path d="M14 12h6M14 16h6M14 8h4"/></svg>` },
    render(host) {
      const ta = el('textarea', { class: 'textarea', placeholder: 'Start typing or paste text here…', style: 'min-height:160px' });
      const grid = el('div', { class: 'stat-grid' });

      const calc = () => {
        const t = ta.value;
        const words = (t.match(/\S+/g) || []).length;
        const chars = t.length;
        const noSpace = (t.match(/\S/g) || []).length;
        const lines = t ? t.split('\n').length : 0;
        const sentences = (t.match(/[.!?]+(\s|$)/g) || []).length || (words ? 1 : 0);
        const mins = words / 220;
        const speak = words / 135;
        const mk = (v, k) => el('div', { class: 'stat' }, el('div', { class: 'v' }, String(v)), el('div', { class: 'k' }, k));
        grid.innerHTML = '';
        grid.append(
          mk(words.toLocaleString(), 'Words'),
          mk(chars.toLocaleString(), 'Characters'),
          mk(noSpace.toLocaleString(), 'No spaces'),
          mk(lines.toLocaleString(), 'Lines'),
          mk(sentences.toLocaleString(), 'Sentences'),
          mk(mins < 1 ? '<1 min' : Math.round(mins) + ' min', 'Read time'),
          mk(speak < 1 ? '<1 min' : Math.round(speak) + ' min', 'Speak time'),
          mk(words ? Math.round((noSpace / words) * 10) / 10 : 0, 'Avg word len'),
        );
      };
      ta.addEventListener('input', calc);
      host.append(el('div', { class: 'field' }, ta), grid);
      ta.focus();
    },
  },

  /* ---------------- 2. Case Converter ---------------- */
  {
    id: 'case-converter',
    name: 'Case Converter',
    desc: 'UPPER, camel, snake & more',
    cat: 'Text & Dev',
    keywords: ['uppercase', 'lowercase', 'title case', 'camel', 'snake', 'kebab', 'text'],
    icon: { bg: 'linear-gradient(135deg,#ff9f0a,#ffd60a)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M4 20L10 4l6 16M6 14h8"/><path d="M17 12l3 8 3-8"/><path d="M18 17h4"/></svg>` },
    render(host) {
      const ta = el('textarea', { class: 'textarea', placeholder: 'Type or paste text…', style: 'min-height:130px' });
      const out = el('div', { class: 'textarea', style: 'min-height:110px;background:var(--fill-quaternary);cursor:text', tabindex: '0' });
      const words = (s) => s.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[^A-Za-z0-9]+/).filter(Boolean);
      const title = (s) => s.replace(/\S+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

      const modes = {
        UPPER: (s) => s.toUpperCase(),
        lower: (s) => s.toLowerCase(),
        'Title Case': (s) => title(s),
        'Sentence case': (s) => { const l = s.toLowerCase(); return l.replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase()); },
        camelCase: (s) => { const w = words(s); return w.map((x, i) => i ? x[0].toUpperCase() + x.slice(1).toLowerCase() : x.toLowerCase()).join(''); },
        PascalCase: (s) => words(s).map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase()).join(''),
        snake_case: (s) => words(s).map((x) => x.toLowerCase()).join('_'),
        'kebab-case': (s) => words(s).map((x) => x.toLowerCase()).join('-'),
        CONSTANT: (s) => words(s).map((x) => x.toUpperCase()).join('_'),
        'aLtErNaTiNg': (s) => [...s.toLowerCase()].map((c, i) => i % 2 ? c.toUpperCase() : c).join(''),
        'reverse': (s) => [...s].reverse().join(''),
      };

      const apply = (fn) => {
        out.textContent = fn(ta.value);
        if (!ta.value) toast('Nothing to convert');
      };

      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Input'), ta),
        el('div', { class: 'pill-row' },
          Object.entries(modes).map(([name, fn]) =>
            el('button', { class: 'pill', onclick: () => apply(fn) }, name))),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Output'),
          out,
          el('div', { class: 'btn-row' },
            el('button', { class: 'btn btn-primary', onclick: () => copy(out.textContent) }, 'Copy output'),
            el('button', { class: 'btn btn-fill', onclick: () => { ta.value = out.textContent; toast('Moved to input'); } }, 'Use as input'))),
      );
    },
  },

  /* ---------------- 3. JSON Formatter ---------------- */
  {
    id: 'json',
    name: 'JSON Formatter',
    desc: 'Format, minify & validate',
    cat: 'Text & Dev',
    keywords: ['json', 'format', 'minify', 'validate', 'beautify', 'pretty', 'lint'],
    icon: { bg: 'linear-gradient(135deg,#30d158,#32ade6)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M8 4c-2 0-2 2-2 3.5S5 11 4 12c1 1 2 1.5 2 3.5S6 20 8 20"/><path d="M16 4c2 0 2 2 2 3.5s1 2.5 2 3.5c-1 1-2 1.5-2 3.5s0 3.5-2 3.5"/></svg>` },
    render(host) {
      const ta = el('textarea', { class: 'textarea', placeholder: '{"hello": "world", "n": 42}', style: 'min-height:150px' });
      const out = el('pre', { class: 'textarea mono', style: 'min-height:130px;white-space:pre-wrap;background:var(--fill-quaternary)' });
      const status = el('div', { class: 'hint' }, '');

      const showError = (e) => {
        status.textContent = '✗ Invalid JSON: ' + e.message.replace('JSON.parse: ', '');
        status.style.color = 'var(--red)';
      };

      const format = (spaces) => {
        try {
          const parsed = JSON.parse(ta.value);
          out.textContent = JSON.stringify(parsed, null, spaces);
          status.textContent = '✓ Valid JSON';
          status.style.color = 'var(--green)';
        } catch (e) { showError(e); }
      };

      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'JSON input'), ta,
          el('div', { class: 'btn-row' },
            el('button', { class: 'btn btn-primary', onclick: () => format(2) }, 'Format'),
            el('button', { class: 'btn btn-fill', onclick: () => format(0) }, 'Minify'),
            el('button', { class: 'btn btn-fill', onclick: () => { try { JSON.parse(ta.value); status.textContent = '✓ Valid JSON'; status.style.color = 'var(--green)'; } catch (e) { showError(e); } } }, 'Validate'),
            el('button', { class: 'btn btn-ghost', onclick: () => copy(out.textContent) }, 'Copy'))),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Output'), out),
        status,
      );
    },
  },

  /* ---------------- 4. Base64 ---------------- */
  {
    id: 'base64',
    name: 'Base64',
    desc: 'Encode & decode',
    cat: 'Text & Dev',
    keywords: ['encode', 'decode', 'base64', 'b64', 'binary', 'data'],
    icon: { bg: 'linear-gradient(135deg,#5e5ce6,#bf5af2)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 17.5h7M17.5 14v7"/></svg>` },
    render(host) {
      const taIn = el('textarea', { class: 'textarea', placeholder: 'Plain text (to encode) or Base64 (to decode)…' });
      const taOut = el('textarea', { class: 'textarea', readonly: '', style: 'background:var(--fill-quaternary)' });
      const enc = () => {
        try {
          taOut.value = btoa(String.fromCharCode(...new TextEncoder().encode(taIn.value)));
        } catch { taOut.value = 'Encoding failed — text may be too large'; }
      };
      const dec = () => {
        try {
          const bytes = Uint8Array.from(atob(taIn.value.trim()), (c) => c.charCodeAt(0));
          taOut.value = new TextDecoder().decode(bytes);
        } catch { taOut.value = 'Invalid Base64 input'; }
      };
      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Input'), taIn,
          el('div', { class: 'btn-row' },
            el('button', { class: 'btn btn-primary', onclick: enc }, 'Encode →'),
            el('button', { class: 'btn btn-fill', onclick: dec }, '← Decode'),
            el('button', { class: 'btn btn-ghost', onclick: () => copy(taOut.value) }, 'Copy output'),
            el('button', { class: 'btn btn-ghost', onclick: () => { taIn.value = taOut.value; } }, 'Swap'))),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Output'), taOut),
      );
    },
  },

  /* ---------------- 5. URL Encode ---------------- */
  {
    id: 'url-encode',
    name: 'URL Encode',
    desc: 'Percent-encode & decode',
    cat: 'Text & Dev',
    keywords: ['url', 'uri', 'percent', 'encode', 'decode', 'query', 'escape'],
    icon: { bg: 'linear-gradient(135deg,#32ade6,#64d2ff)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/></svg>` },
    render(host) {
      const taIn = el('textarea', { class: 'textarea', placeholder: 'https://example.com/search?q=hello world&lang=en' });
      const taOut = el('textarea', { class: 'textarea', readonly: '', style: 'background:var(--fill-quaternary)' });
      const doEnc = (full) => {
        try { taOut.value = full ? encodeURIComponent(taIn.value) : encodeURI(taIn.value); }
        catch { taOut.value = 'Encoding failed'; }
      };
      const doDec = (full) => {
        try { taOut.value = full ? decodeURIComponent(taIn.value) : decodeURI(taIn.value); }
        catch { taOut.value = 'Invalid encoded input'; }
      };
      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Input'), taIn,
          el('div', { class: 'btn-row' },
            el('button', { class: 'btn btn-primary', onclick: () => doEnc(true) }, 'Encode'),
            el('button', { class: 'btn btn-fill', onclick: () => doDec(true) }, 'Decode'),
            el('button', { class: 'btn btn-ghost', onclick: () => copy(taOut.value) }, 'Copy'))),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Output'), taOut),
        el('div', { class: 'hint' }, 'Component-style encoding (encodeURIComponent). Great for query parameters.'),
      );
    },
  },

  /* ---------------- 6. Lorem Ipsum ---------------- */
  {
    id: 'lorem',
    name: 'Lorem Ipsum',
    desc: 'Placeholder text generator',
    cat: 'Text & Dev',
    keywords: ['lorem', 'ipsum', 'placeholder', 'dummy', 'filler', 'text', 'generator'],
    icon: { bg: 'linear-gradient(135deg,#8e8e93,#5e5ce6)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M4 7h16M4 12h12M4 17h15"/><circle cx="19" cy="17" r="1.6"/></svg>` },
    render(host) {
      const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
      const count = el('input', { class: 'input', type: 'number', min: '1', max: '30', value: '3' });
      const start = el('button', { class: 'switch on', role: 'switch', 'aria-checked': 'true' });
      start.addEventListener('click', () => start.classList.toggle('on'));
      const out = el('div', { class: 'textarea', style: 'min-height:150px;background:var(--fill-quaternary);cursor:text' });

      const gen = () => {
        const n = Math.min(30, Math.max(1, parseInt(count.value) || 3));
        const paras = [];
        for (let p = 0; p < n; p++) {
          const len = 40 + Math.floor(Math.random() * 50);
          const ws = [];
          for (let i = 0; i < len; i++) ws.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
          let text = ws.join(' ');
          text = text[0].toUpperCase() + text.slice(1) + '.';
          paras.push(text);
        }
        if (start.classList.contains('on')) {
          paras[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + paras[0].replace(/^Lorem ipsum dolor sit amet\.\s*/i, '');
        }
        out.textContent = paras.join('\n\n');
      };

      host.append(
        el('div', { class: 'pane-row' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Paragraphs'), count),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Classic opening'),
            el('div', { style: 'display:flex;align-items:center;height:46px' }, start))),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-primary', onclick: gen }, 'Generate'),
          el('button', { class: 'btn btn-fill', onclick: () => copy(out.textContent) }, 'Copy all')),
        el('div', { class: 'field' }, out),
      );
      gen();
    },
  },

  /* ---------------- 7. Markdown Preview ---------------- */
  {
    id: 'markdown',
    name: 'Markdown',
    desc: 'Live preview editor',
    cat: 'Text & Dev',
    keywords: ['md', 'markdown', 'preview', 'readme', 'editor', 'write', 'format'],
    icon: { bg: 'linear-gradient(135deg,#1c1c1e,#0a84ff)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M6 15v-6l3 3.5L12 9v6M16.5 9v5M14.5 12.5l2 2.5 2-2.5"/></svg>` },
    render(host) {
      const ta = el('textarea', { class: 'textarea', style: 'min-height:200px', placeholder: '# Heading\n\nSome **bold** and *italic* text…' });
      const preview = el('div', { class: 'textarea', style: 'min-height:200px;background:var(--fill-quaternary);font-family:var(--font);cursor:text;overflow:auto' });

      const mdToHtml = (src) => {
        let html = src
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
          .replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
          .replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
          .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
          .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
          .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>')
          .replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>')
          .replace(/^\s*\d+\.\s+(.*)$/gm, '<li>$1</li>')
          .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
          .replace(/`([^`]+)`/g, '<code style="background:var(--fill-secondary);padding:1px 6px;border-radius:6px;font-size:0.9em">$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
          .replace(/~~([^~]+)~~/g, '<del>$1</del>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--accent)">$1</a>')
          .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--separator);margin:12px 0">')
          .replace(/^&gt;\s?(.*)$/gm, '<blockquote style="border-left:3px solid var(--accent);padding-left:12px;color:var(--label-secondary);margin:8px 0">$1</blockquote>');
        html = html.split(/\n{2,}/).map((block) =>
          /^<(h\d|ul|li|hr|blockquote)/.test(block.trim()) ? block : (block.trim() ? `<p style="margin:8px 0">${block.replace(/\n/g, '<br>')}</p>` : '')
        ).join('');
        return html;
      };

      const render = () => { preview.innerHTML = mdToHtml(ta.value); };
      ta.addEventListener('input', render);
      ta.value = '# Hello\n\nThis is **live** Markdown with *style*.\n\n- Fast- Private- Beautiful\n\n`inline code` and [links](https://example.com)';
      render();

      host.append(el('div', { class: 'pane-row' },
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Markdown'), ta),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Preview'), preview),
      ));
    },
  },

  /* ---------------- 8. Regex Tester ---------------- */
  {
    id: 'regex',
    name: 'Regex Tester',
    desc: 'Match, highlight & explain',
    cat: 'Text & Dev',
    keywords: ['regex', 'regexp', 'match', 'pattern', 'regular expression', 'test', 'find'],
    icon: { bg: 'linear-gradient(135deg,#ff375f,#bf5af2)', svg: `<svg viewBox="0 0 24 24" ${S}><circle cx="6" cy="17" r="2.5"/><circle cx="18" cy="17" r="2.5"/><circle cx="12" cy="5" r="2.5"/><path d="M8 16l7-9"/></svg>` },
    render(host) {
      const pattern = el('input', { class: 'input mono', type: 'text', value: '\\b\\w+@\\w+\\.\\w+\\b', spellcheck: 'false' });
      const flags = el('input', { class: 'input mono', type: 'text', value: 'g', style: 'max-width:110px', spellcheck: 'false', maxlength: '6' });
      const sample = el('textarea', { class: 'textarea', style: 'min-height:110px' });
      sample.value = 'Contact alice@example.com or bob@test.org for help.\nNo match here: not-an-email.';
      const highlight = el('div', { class: 'textarea', style: 'min-height:110px;background:var(--fill-quaternary);white-space:pre-wrap;cursor:text' });
      const matchList = el('div', { class: 'hint' }, '');

      const run = () => {
        const p = pattern.value;
        const f = flags.value.includes('g') ? flags.value : flags.value + 'g';
        let re;
        try { re = new RegExp(p, f); } catch (e) {
          highlight.innerHTML = `<span style="color:var(--red)">Invalid: ${e.message}</span>`;
          matchList.textContent = '';
          return;
        }
        const text = sample.value;
        let out = '', last = 0, count = 0, details = [];
        let m;
        re.lastIndex = 0;
        while ((m = re.exec(text)) !== null && count < 999) {
          out += text.slice(last, m.index);
          out += `<mark style="background:rgba(255,214,10,0.45);border-radius:4px;padding:1px 2px">${m[0].replace(/</g, '&lt;') || '&nbsp;'}</mark>`;
          details.push(m[0]);
          last = m.index + m[0].length;
          count++;
          if (m[0] === '') re.lastIndex++;
        }
        out += text.slice(last);
        highlight.innerHTML = out.replace(/\n/g, '<br>');
        matchList.textContent = count ? `${count} match${count > 1 ? 'es' : ''}: ${details.slice(0, 12).map((d) => JSON.stringify(d)).join(', ')}${count > 12 ? ' …' : ''}` : 'No matches';
        matchList.style.color = count ? 'var(--green)' : 'var(--label-secondary)';
      };

      [pattern, flags, sample].forEach((x) => x.addEventListener('input', run));
      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Pattern'), pattern),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Flags'), flags),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Test string'), sample),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Matches'), highlight),
        matchList,
      );
      run();
    },
  },

  /* ---------------- 9. Hash Generator ---------------- */
  {
    id: 'hash',
    name: 'Hash',
    desc: 'SHA-1 / 256 / 384 / 512',
    cat: 'Text & Dev',
    keywords: ['hash', 'sha', 'checksum', 'digest', 'md5', 'integrity', 'crypto'],
    icon: { bg: 'linear-gradient(135deg,#30d158,#1c1c1e)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M4 9h16M4 15h16M10 4L8 20M16 4l-2 16"/></svg>` },
    render(host) {
      const ta = el('textarea', { class: 'textarea', placeholder: 'Text to hash…', style: 'min-height:100px' });
      const rows = el('div', { class: 'list' });
      const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

      const run = async () => {
        rows.innerHTML = '';
        const text = ta.value;
        if (!text) {
          algos.forEach((a) => rows.append(el('div', { class: 'list-row' }, el('span', { class: 'k' }, a), el('span', { class: 'v mono' }, '—'))));
          return;
        }
        const data = new TextEncoder().encode(text);
        for (const algo of algos) {
          try {
            const buf = await crypto.subtle.digest(algo, data);
            const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
            rows.append(el('div', { class: 'list-row', style: 'cursor:pointer', onclick: () => copy(hex, `${algo} copied`) },
              el('span', { class: 'k' }, algo),
              el('span', { class: 'v mono', style: 'font-size:11px' }, hex)));
          } catch {
            rows.append(el('div', { class: 'list-row' }, el('span', { class: 'k' }, algo), el('span', { class: 'v' }, 'unavailable')));
          }
        }
      };
      ta.addEventListener('input', run);
      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Input text'), ta),
        rows,
        el('div', { class: 'hint' }, 'Tap any row to copy its hex digest. Uses your browser\'s WebCrypto — nothing leaves the device.'),
      );
      run();
    },
  },

  /* ---------------- 10. Keycode Finder ---------------- */
  {
    id: 'keycode',
    name: 'Keycode',
    desc: 'Keyboard event inspector',
    cat: 'Text & Dev',
    keywords: ['key', 'keycode', 'keyboard', 'event', 'code', 'javascript', 'shortcut', 'ascii'],
    icon: { bg: 'linear-gradient(135deg,#64d2ff,#5e5ce6)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="2" y="6" width="20" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>` },
    render(host) {
      const capture = el('div', {
        class: 'result-card',
        style: 'text-align:center;padding:32px;border-style:dashed;cursor:text',
        tabindex: '0',
      }, el('div', { style: 'font-size:15px;font-weight:600;color:var(--label-secondary)' }, 'Press any key…'));

      const grid = el('div', { class: 'stat-grid' });
      const mods = el('div', { class: 'pill-row' });

      capture.addEventListener('keydown', (e) => {
        e.preventDefault();
        hapticFlash(capture);
        const keyName = e.key === ' ' ? 'Space' : e.key;
        capture.innerHTML = '';
        capture.append(el('div', { style: 'font-size:42px;font-weight:800;letter-spacing:-0.02em' }, keyName));
        grid.innerHTML = '';
        const mk = (v, k) => el('div', { class: 'stat' }, el('div', { class: 'v mono' }, String(v)), el('div', { class: 'k' }, k));
        grid.append(
          mk(e.code || '—', 'event.code'),
          mk(e.keyCode ?? '—', 'keyCode (legacy)'),
          mk(e.which ?? '—', 'which'),
          mk(e.location ?? '—', 'location'),
          mk(e.key.length, 'key length'),
          mk(e.repeat ? 'true' : 'false', 'repeat'),
        );
        mods.innerHTML = '';
        [['Shift', e.shiftKey], ['Ctrl', e.ctrlKey], ['Alt', e.altKey], ['Meta', e.metaKey], ['CapsLock', e.getModifierState && e.getModifierState('CapsLock')]].forEach(([n, on]) => {
          mods.append(el('span', { class: 'badge', style: on ? 'background:var(--accent);color:#fff' : 'background:var(--fill-secondary);color:var(--label-secondary)' }, n + (on ? ' ✓' : '')));
        });
      });

      function hapticFlash(node) {
        node.style.boxShadow = '0 0 0 4px rgba(0,122,255,0.25)';
        setTimeout(() => node.style.boxShadow = '', 160);
      }

      host.append(capture, grid, mods,
        el('div', { class: 'hint' }, 'Focus the box above and press keys to inspect their JavaScript event properties.'));
      capture.focus();
    },
  },
];
