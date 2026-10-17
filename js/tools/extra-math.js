/* Extra Math — 6 tools (GCD/LCM, Quadratic, Statistics, Primes, Roman, Geometry) */
import { el, fmt, copy, toast } from '../util.js';

export const categories = ['Math & Converters'];

const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const tools = [
  /* ---------------- 1. GCD & LCM ---------------- */
  {
    id: 'gcd-lcm',
    name: 'GCD & LCM',
    desc: 'Greatest common divisor',
    cat: 'Math & Converters',
    keywords: ['gcd', 'hcf', 'lcm', 'factor', 'common', 'divisor', 'multiple', 'math'],
    icon: { bg: 'linear-gradient(135deg,#0a84ff,#64d2ff)', svg: `<svg viewBox="0 0 24 24" ${S}><circle cx="8" cy="12" r="6"/><circle cx="16" cy="12" r="6"/><path d="M10.5 8.5a6 6 0 0 1 0 7M13.5 8.5a6 6 0 0 0 0 7"/></svg>` },
    render(host) {
      const input = el('input', { class: 'input mono', type: 'text', value: '12, 18, 24', placeholder: 'e.g. 12, 18, 24' });
      const out = el('div', { class: 'stat-grid' });
      const steps = el('div', { class: 'hint' }, '');

      const gcd2 = (a, b) => b === 0 ? Math.abs(a) : gcd2(b, a % b);

      const calc = () => {
        const nums = input.value.split(/[,\s]+/).map((x) => parseInt(x, 10)).filter((n) => Number.isInteger(n) && n > 0);
        out.innerHTML = '';
        if (nums.length < 2) { out.append(el('div', { class: 'stat' }, el('div', { class: 'v' }, '—'), el('div', { class: 'k' }, 'Enter 2+ numbers'))); steps.textContent = ''; return; }
        const gcd = nums.reduce((a, b) => gcd2(a, b));
        const lcm = nums.reduce((a, b) => Math.abs(a * b) / gcd2(a, b));
        const mk = (v, k) => el('div', { class: 'stat' }, el('div', { class: 'v' }, v), el('div', { class: 'k' }, k));
        out.append(mk(String(gcd), 'GCD (HCF)'), mk(String(Math.round(lcm * 1000) / 1000), 'LCM'), mk(nums.length, 'Numbers'));
        steps.textContent = `Euclidean algorithm on ${nums.join(', ')} · LCM × GCD of two numbers = product of the numbers`;
      };
      input.addEventListener('input', calc);
      host.append(el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Numbers (comma or space separated)'), input), out, steps);
      calc();
    },
  },

  /* ---------------- 2. Quadratic Solver ---------------- */
  {
    id: 'quadratic',
    name: 'Quadratic',
    desc: 'ax² + bx + c = 0 roots',
    cat: 'Math & Converters',
    keywords: ['quadratic', 'equation', 'roots', 'polynomial', 'algebra', 'formula', 'math', 'solve'],
    icon: { bg: 'linear-gradient(135deg,#5e5ce6,#bf5af2)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M4 20c3 0 3-16 8-16s5 16 8 16"/><path d="M4 12h16"/></svg>` },
    render(host) {
      const mk = (v) => el('input', { class: 'input', type: 'number', step: 'any', value: v });
      const a = mk('1'), b = mk('-5'), c = mk('6');
      const out = el('div', { class: 'result-card' });
      const sub = el('div', { class: 'result-sub' }, '');

      const calc = () => {
        const A = parseFloat(a.value), B = parseFloat(b.value), C = parseFloat(c.value);
        if (!A) { out.innerHTML = ''; out.append(el('div', { class: 'result-big' }, 'a ≠ 0 required')); return; }
        const disc = B * B - 4 * A * C;
        out.innerHTML = '';
        const sq = Math.sqrt(Math.abs(disc));
        let roots;
        if (disc > 0) roots = [(-B + sq) / (2 * A), (-B - sq) / (2 * A)].map((r) => fmt(r, 6)).join(' , ');
        else if (disc === 0) roots = fmt(-B / (2 * A), 6) + ' (repeated)';
        else roots = `${fmt(-B / (2 * A), 4)} ± ${fmt(sq / (2 * A), 4)}i`;
        out.append(el('div', { class: 'result-big', style: 'font-size:24px' }, 'x = ' + roots));
        const vx = -B / (2 * A);
        sub.textContent = `Discriminant Δ = ${fmt(disc, 4)} · vertex (${fmt(vx, 3)}, ${fmt(A * vx * vx + B * vx + C, 3)}) · ${disc > 0 ? 'two real roots' : disc === 0 ? 'one real root' : 'two complex roots'}`;
        out.append(sub);
      };
      [a, b, c].forEach((x) => x.addEventListener('input', calc));
      host.append(
        el('div', { class: 'pane-row', style: 'grid-template-columns:1fr 1fr 1fr' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'a'), a),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'b'), b),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'c'), c)),
        out);
      calc();
    },
  },

  /* ---------------- 3. Statistics ---------------- */
  {
    id: 'statistics',
    name: 'Statistics',
    desc: 'Mean, median, σ & more',
    cat: 'Math & Converters',
    keywords: ['statistics', 'mean', 'median', 'mode', 'average', 'standard deviation', 'math', 'data'],
    icon: { bg: 'linear-gradient(135deg,#30d158,#0a84ff)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>` },
    render(host) {
      const ta = el('textarea', { class: 'textarea', placeholder: '1, 2, 3, 4, 5…', style: 'min-height:90px' });
      ta.value = '2, 4, 4, 4, 5, 5, 7, 9';
      const grid = el('div', { class: 'stat-grid' });

      const calc = () => {
        const xs = ta.value.split(/[,\s;]+/).map(parseFloat).filter((n) => !isNaN(n)).sort((a, b) => a - b);
        grid.innerHTML = '';
        if (!xs.length) { grid.append(el('div', { class: 'stat' }, el('div', { class: 'v' }, '—'), el('div', { class: 'k' }, 'Add numbers'))); return; }
        const n = xs.length;
        const sum = xs.reduce((a, b) => a + b, 0);
        const mean = sum / n;
        const median = n % 2 ? xs[(n - 1) / 2] : (xs[n / 2 - 1] + xs[n / 2]) / 2;
        const counts = {};
        xs.forEach((x) => counts[x] = (counts[x] || 0) + 1);
        const maxCount = Math.max(...Object.values(counts));
        const modes = Object.keys(counts).filter((k) => counts[k] === maxCount).map(Number);
        const variance = xs.reduce((a, x) => a + (x - mean) ** 2, 0) / n;
        const std = Math.sqrt(variance);
        const mk = (v, k) => el('div', { class: 'stat' }, el('div', { class: 'v' }, v), el('div', { class: 'k' }, k));
        grid.append(
          mk(String(n), 'Count'),
          mk(fmt(sum, 3), 'Sum'),
          mk(fmt(mean, 4), 'Mean'),
          mk(fmt(median, 4), 'Median'),
          mk(modes.length > 3 ? 'multi' : modes.map((m) => fmt(m, 2)).join(', '), 'Mode'),
          mk(fmt(Math.min(...xs), 3), 'Min'),
          mk(fmt(Math.max(...xs), 3), 'Max'),
          mk(fmt(std, 4), 'Std dev (σ)'),
          mk(fmt(xs[n - 1] - xs[0], 3), 'Range'),
          mk(fmt(variance, 4), 'Variance'),
        );
      };
      ta.addEventListener('input', calc);
      host.append(el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Data points'), ta), grid,
        el('div', { class: 'hint' }, 'Sample standard deviation (population σ). Mode shows up to 3 values.'));
      calc();
    },
  },

  /* ---------------- 4. Prime Checker ---------------- */
  {
    id: 'primes',
    name: 'Primes',
    desc: 'Test, factor & list primes',
    cat: 'Math & Converters',
    keywords: ['prime', 'factor', 'factorization', 'composite', 'math', 'number theory', 'divisible'],
    icon: { bg: 'linear-gradient(135deg,#ffd60a,#ff9f0a)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>` },
    render(host) {
      const input = el('input', { class: 'input', type: 'number', min: '0', step: '1', value: '97' });
      const verdict = el('div', { class: 'result-big' }, '—');
      const factors = el('div', { class: 'result-sub' }, '');
      const listField = el('input', { class: 'input', type: 'number', min: '2', max: '500', value: '50', style: 'max-width:110px' });
      const primeList = el('div', { class: 'pill-row' });

      const isPrime = (n) => {
        if (n < 2) return false;
        for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
        return true;
      };
      const factorize = (n) => {
        const fs = [];
        let x = n;
        for (let i = 2; i * i <= x; i++) {
          while (x % i === 0) { fs.push(i); x /= i; }
        }
        if (x > 1) fs.push(x);
        return fs;
      };

      const calc = () => {
        const n = Math.floor(Math.abs(parseInt(input.value) || 0));
        const p = isPrime(n);
        verdict.textContent = n < 2 ? 'Not applicable' : p ? '✓ Prime' : '✗ Composite';
        verdict.style.color = n < 2 ? 'var(--label)' : p ? 'var(--green)' : 'var(--red)';
        if (n >= 2 && !p) {
          const fs = factorize(n);
          factors.textContent = `Factorization: ${n} = ${fs.join(' × ')}`;
        } else if (p) factors.textContent = `${n} is only divisible by 1 and itself.`;
        else factors.textContent = 'Enter an integer ≥ 2.';
      };

      const listPrimes = () => {
        const N = Math.min(500, Math.max(2, parseInt(listField.value) || 50));
        primeList.innerHTML = '';
        for (let i = 2; i <= N; i++) if (isPrime(i)) primeList.append(el('span', { class: 'pill active', style: 'padding:5px 11px;font-size:12.5px' }, String(i)));
        primeList.append(el('span', { class: 'hint' }, `π(${N}) = ${primeList.children.length} primes`));
      };

      input.addEventListener('input', calc);
      listField.addEventListener('input', listPrimes);
      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Number to test'), input),
        el('div', { class: 'result-card' }, verdict, factors),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'List primes up to'), listField),
        primeList);
      calc(); listPrimes();
    },
  },

  /* ---------------- 5. Roman Numerals ---------------- */
  {
    id: 'roman',
    name: 'Roman Numerals',
    desc: 'Numbers ↔ Roman numerals',
    cat: 'Math & Converters',
    keywords: ['roman', 'numeral', 'xiv', 'convert', 'ancient', 'number', 'arabic'],
    icon: { bg: 'linear-gradient(135deg,#ff9f0a,#ff375f)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M6 4v16M18 4v16M6 8h12M6 16h12"/><path d="M11 4v16"/></svg>` },
    render(host) {
      const numIn = el('input', { class: 'input', type: 'number', min: '1', max: '3999', value: '2026' });
      const romanIn = el('input', { class: 'input mono', type: 'text', value: 'MMXXVI', style: 'text-transform:uppercase' });
      const toRoman = (n) => {
        if (n < 1 || n > 3999) return '— (1–3999)';
        const T = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
        let out = '';
        for (const [v, s] of T) while (n >= v) { out += s; n -= v; }
        return out;
      };
      const fromRoman = (r) => {
        const V = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
        const s = r.toUpperCase().replace(/[^IVXLCDM]/g, '');
        if (!s) return '—';
        let total = 0;
        for (let i = 0; i < s.length; i++) {
          const cur = V[s[i]], next = V[s[i + 1]];
          total += next && cur < next ? -cur : cur;
        }
        return total < 1 || total > 3999 ? '—' : String(total);
      };
      const romanOut = el('div', { class: 'result-big', style: 'font-size:30px' }, '');
      const numOut = el('div', { class: 'result-big', style: 'font-size:30px' }, '');

      numIn.addEventListener('input', () => { romanOut.textContent = toRoman(Math.floor(parseInt(numIn.value) || 0)); });
      romanIn.addEventListener('input', () => { numOut.textContent = fromRoman(romanIn.value); });

      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Number → Roman'), numIn,
          el('div', { class: 'result-card', style: 'text-align:center' }, romanOut)),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Roman → Number'), romanIn,
          el('div', { class: 'result-card', style: 'text-align:center' }, numOut)),
        el('div', { class: 'hint' }, 'Range 1–3999 (with standard subtractive notation, e.g. IV = 4, CM = 900).'));
      romanOut.textContent = toRoman(2026);
      numOut.textContent = fromRoman('MMXXVI');
    },
  },

  /* ---------------- 6. Geometry ---------------- */
  {
    id: 'geometry',
    name: 'Geometry',
    desc: 'Areas, perimeters & volumes',
    cat: 'Math & Converters',
    keywords: ['geometry', 'area', 'volume', 'perimeter', 'circle', 'triangle', 'sphere', 'shape', 'math'],
    icon: { bg: 'linear-gradient(135deg,#64d2ff,#5e5ce6)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M12 2l9 18H3z"/><circle cx="12" cy="15" r="5"/></svg>` },
    render(host) {
      const SHAPES = {
        Circle: [['radius', 'r']], Rectangle: [['width', 'w'], ['height', 'h']],
        Triangle: [['base', 'b'], ['height', 'h']], Trapezoid: [['base a', 'a'], ['base b', 'b'], ['height', 'h']],
        Sphere: [['radius', 'r']], Cube: [['side', 's']], Cylinder: [['radius', 'r'], ['height', 'h']],
        Cone: [['radius', 'r'], ['height', 'h']],
      };
      let shape = 'Circle';
      const sel = el('select', { class: 'select' }, Object.keys(SHAPES).map((s) => el('option', { value: s, selected: s === shape ? '' : undefined }, s)));
      const fields = el('div', {});
      const out = el('div', { class: 'result-card' });

      const inputs = [];
      const buildFields = () => {
        fields.innerHTML = '';
        inputs.length = 0;
        SHAPES[shape].forEach(([label, key]) => {
          const inp = el('input', { class: 'input', type: 'number', min: '0', step: 'any', value: '5' });
          inp.addEventListener('input', calc);
          inputs.push({ key, inp });
          fields.append(el('div', { class: 'field' }, el('label', { class: 'field-label' }, label), inp));
        });
      };

      const calc = () => {
        const v = {};
        inputs.forEach(({ key, inp }) => v[key] = Math.max(0, parseFloat(inp.value) || 0));
        out.innerHTML = '';
        const rows = [];
        const push = (k, val) => rows.push([k, fmt(val, 4)]);

        switch (shape) {
          case 'Circle':
            push('Area (πr²)', Math.PI * v.r ** 2);
            push('Circumference (2πr)', 2 * Math.PI * v.r); break;
          case 'Rectangle':
            push('Area (w×h)', v.w * v.h);
            push('Perimeter (2(w+h))', 2 * (v.w + v.h)); break;
          case 'Triangle':
            push('Area (½bh)', 0.5 * v.b * v.h);
            push('Hypotenuse* (√(b²+h²))', Math.sqrt(v.b ** 2 + v.h ** 2)); break;
          case 'Trapezoid':
            push('Area (½(a+b)h)', 0.5 * (v.a + v.b) * v.h); break;
          case 'Sphere':
            push('Volume (⁴⁄₃πr³)', (4 / 3) * Math.PI * v.r ** 3);
            push('Surface area (4πr²)', 4 * Math.PI * v.r ** 2); break;
          case 'Cube':
            push('Volume (s³)', v.s ** 3);
            push('Surface area (6s²)', 6 * v.s ** 2); break;
          case 'Cylinder':
            push('Volume (πr²h)', Math.PI * v.r ** 2 * v.h);
            push('Surface area (2πr(r+h))', 2 * Math.PI * v.r * (v.r + v.h)); break;
          case 'Cone':
            push('Volume (⅓πr²h)', (1 / 3) * Math.PI * v.r ** 2 * v.h);
            push('Slant height (√(r²+h²))', Math.sqrt(v.r ** 2 + v.h ** 2)); break;
        }
        const list = el('div', { class: 'list' });
        rows.forEach(([k, val]) => list.append(el('div', { class: 'list-row' }, el('span', { class: 'k' }, k), el('span', { class: 'v' }, val))));
        out.append(list);
      };

      sel.addEventListener('change', () => { shape = sel.value; buildFields(); calc(); });
      host.append(el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Shape'), sel), fields, out);
      buildFields(); calc();
    },
  },
];
