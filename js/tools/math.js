/* Math & Converters — 10 tools */
import { el, fmt, copy, toast, haptic } from '../util.js';

export const categories = ['Math & Converters'];

const S = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const tools = [
  /* ---------------- 1. Calculator ---------------- */
  {
    id: 'calculator',
    name: 'Calculator',
    desc: 'Standard & scientific',
    cat: 'Math & Converters',
    keywords: ['math', 'calc', 'scientific', 'arithmetic', 'sum'],
    icon: { bg: 'linear-gradient(135deg,#30d158,#0a84ff)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="4" y="2" width="16" height="20" rx="3"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h4"/></svg>` },
    render(host) {
      let expr = '';
      let acc = null;
      let waiting = null; // pending operator
      let lastOp = null, lastOperand = null;
      let justEvaluated = false;

      const exprEl = el('div', { class: 'calc-expr' }, '');
      const valEl = el('div', { class: 'calc-value' }, '0');
      host.append(el('div', { class: 'calc-display' }, exprEl, valEl));

      const show = () => {
        exprEl.textContent = expr;
        valEl.textContent = acc !== null && expr === '' ? fmt(acc, 10) : (expr || '0');
      };

      const safeEval = (e) => {
        const js = e
          .replace(/π/g, '(Math.PI)').replace(/\be\b/g, '(Math.E)')
          .replace(/√/g, 'Math.sqrt').replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos').replace(/tan/g, 'Math.tan')
          .replace(/log/g, 'Math.log10').replace(/ln/g, 'Math.log')
          .replace(/\^/g, '**').replace(/×/g, '*').replace(/÷/g, '/')
          .replace(/−/g, '-');
        // Strip recognized tokens; anything else is rejected
        const stripped = js.replace(/Math\.(log10|log|sqrt|sin|cos|tan|PI|E)/g, '').replace(/\*\*/g, '*');
        if (!/^[0-9+\-*/().%\s]*$/.test(stripped)) throw new Error('bad expression');
        // eslint-disable-next-line no-new-func
        return Function(`"use strict";return (${js})`)();
      };

      const press = (k) => {
        haptic(6);
        if (k === 'AC') { expr = ''; acc = null; waiting = null; justEvaluated = false; }
        else if (k === '⌫') { expr = expr.slice(0, -1); }
        else if (k === '±') {
          if (expr) expr = expr.startsWith('-( ') ? expr.slice(3, -1) : `-(${expr})`;
        }
        else if (k === '%') { expr += '/100'; }
        else if (['+', '−', '×', '÷', '^'].includes(k)) {
          const trimmed = expr.replace(/[+\-−×÷^ ]+$/, '');
          if (trimmed) {
            try { acc = safeEval(trimmed); expr = String(acc); }
            catch { expr = trimmed; }
          }
          expr += ` ${k} `;
          justEvaluated = false;
        }
        else if (k === '=') {
          try {
            const result = safeEval(expr);
            exprEl.textContent = expr;
            expr = '';
            acc = Number.isFinite(result) ? result : 0;
            valEl.textContent = fmt(acc, 10);
            exprEl.textContent = '';
            justEvaluated = true;
            return;
          } catch { valEl.textContent = 'Error'; expr = ''; return; }
        }
        else if (['sin', 'cos', 'tan', 'ln', 'log', '√'].includes(k)) {
          expr += k + '(';
        }
        else if (k === 'x²') { expr += '^2'; }
        else { expr += k; justEvaluated = false; }
        show();
      };

      const sci = el('div', { class: 'calc-sci' },
        ['sin', 'cos', 'tan', 'ln', 'log', '√', 'x²', '^', 'π', 'e', '(', ')', '1/x', 'x³', '10^'].map((k) =>
          el('button', {
            onclick: () => {
              if (k === '1/x') return press('^(-1)');
              if (k === 'x³') return press('^3');
              press(k);
            },
          }, k)));
      host.append(sci);

      const keys = [
        ['AC', 'fn'], ['±', 'fn'], ['%', 'fn'], ['÷', 'op'],
        ['7', ''], ['8', ''], ['9', ''], ['×', 'op'],
        ['4', ''], ['5', ''], ['6', ''], ['−', 'op'],
        ['1', ''], ['2', ''], ['3', ''], ['+', 'op'],
        ['0', 'zero'], ['.', ''], ['⌫', 'fn'], ['=', 'eq'],
      ];
      const pad = el('div', { class: 'calc-pad' },
        keys.map(([k, cls]) => el('button', { class: cls, onclick: () => press(k) }, k)));
      host.append(pad);
    },
  },

  /* ---------------- 2. Unit Converter ---------------- */
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    desc: 'Length, mass, temp & more',
    cat: 'Math & Converters',
    keywords: ['convert', 'length', 'weight', 'temperature', 'metric', 'imperial', 'distance'],
    icon: { bg: 'linear-gradient(135deg,#5e5ce6,#0a84ff)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M3 8h18M3 16h18"/><circle cx="8" cy="8" r="2.5"/><circle cx="16" cy="16" r="2.5"/></svg>` },
    render(host) {
      const UNITS = {
        Length: { base: 'm', u: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, 'in': 0.0254, nmi: 1852 } },
        Mass: { base: 'kg', u: { kg: 1, g: 0.001, mg: 1e-6, t: 1000, lb: 0.45359237, oz: 0.028349523, st: 6.35029318 } },
        Temperature: { special: true, u: { '°C': 1, '°F': 2, K: 3 } },
        Area: { base: 'm²', u: { 'm²': 1, 'km²': 1e6, 'cm²': 1e-4, 'ft²': 0.09290304, 'in²': 0.00064516, acre: 4046.8564224, ha: 10000, 'mi²': 2589988.110336 } },
        Volume: { base: 'L', u: { L: 1, mL: 0.001, 'm³': 1000, gal: 3.785411784, qt: 0.946352946, pt: 0.473176473, cup: 0.2365882365, 'fl oz': 0.0295735296, 'in³': 0.016387064 } },
        Speed: { base: 'm/s', u: { 'm/s': 1, 'km/h': 0.2777777778, mph: 0.44704, knot: 0.5144444444, 'ft/s': 0.3048 } },
        Time: { base: 's', u: { ms: 0.001, s: 1, min: 60, h: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 } },
        Data: { base: 'B', u: { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4, bit: 0.125, Kib: 128, Mib: 131072 } },
      };

      let cat = 'Length';
      const catSel = el('select', { class: 'select' },
        Object.keys(UNITS).map((c) => el('option', { value: c, selected: c === cat ? '' : undefined }, c)));
      const fromSel = el('select', { class: 'select' });
      const toSel = el('select', { class: 'select' });
      const input = el('input', { class: 'input', type: 'number', value: '1', step: 'any' });
      const out = el('div', { class: 'result-big' }, '—');
      const formula = el('div', { class: 'result-sub' }, '');

      const fillUnits = () => {
        const us = Object.keys(UNITS[cat].u);
        fromSel.innerHTML = ''; toSel.innerHTML = '';
        us.forEach((u, i) => {
          fromSel.append(el('option', { value: u }, u));
          toSel.append(el('option', { value: u, selected: i === 1 ? '' : undefined }, u));
        });
      };

      const convertTemp = (v, f, t) => {
        const c = f === '°C' ? v : f === '°F' ? (v - 32) * 5 / 9 : v - 273.15;
        return t === '°C' ? c : t === '°F' ? c * 9 / 5 + 32 : c + 273.15;
      };

      const calc = () => {
        const v = parseFloat(input.value);
        if (isNaN(v)) { out.textContent = '—'; formula.textContent = ''; return; }
        const f = fromSel.value, t = toSel.value;
        let r;
        if (UNITS[cat].special) r = convertTemp(v, f, t);
        else r = (v * UNITS[cat].u[f]) / UNITS[cat].u[t];
        out.textContent = `${fmt(r, 6)} `;
        out.append(el('span', { class: 'unit' }, t));
        formula.textContent = `1 ${f} = ${fmt(UNITS[cat].special ? convertTemp(1, f, t) : UNITS[cat].u[f] / UNITS[cat].u[t], 8)} ${t}`;
      };

      catSel.addEventListener('change', () => { cat = catSel.value; fillUnits(); calc(); });
      fromSel.addEventListener('change', calc);
      toSel.addEventListener('change', calc);
      input.addEventListener('input', calc);

      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Category'), catSel),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Value'), input),
        el('div', { class: 'pane-row' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'From'), fromSel),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'To'), toSel),
        ),
        el('div', { class: 'result-card' }, out, formula),
      );
      fillUnits(); calc();
    },
  },

  /* ---------------- 3. Currency Converter ---------------- */
  {
    id: 'currency',
    name: 'Currency',
    desc: 'Quick FX conversions',
    cat: 'Math & Converters',
    keywords: ['money', 'usd', 'inr', 'eur', 'exchange', 'forex', 'rupee', 'dollar'],
    icon: { bg: 'linear-gradient(135deg,#30d158,#32ade6)', svg: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.2c0-1 1-1.7 2.5-1.7s2.5.8 2.5 1.8c0 2.7-5 1.4-5 4 0 1.1 1.1 1.9 2.5 1.9s2.5-.7 2.5-1.7"/></svg>` },
    render(host) {
      // Indicative rates vs USD (static snapshot — offline-friendly)
      const RATES = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.2, JPY: 151.5, AUD: 1.52, CAD: 1.36, CHF: 0.88, CNY: 7.24, SGD: 1.34, AED: 3.67, HKD: 7.82, NZD: 1.64, SEK: 10.5, ZAR: 18.4, BRL: 5.12, KRW: 1340, THB: 36.2, MYR: 4.45, RUB: 92.5 };
      const SYM = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$', CHF: 'Fr', CNY: '¥', SGD: 'S$', AED: 'د.إ', HKD: 'HK$', NZD: 'NZ$', SEK: 'kr', ZAR: 'R', BRL: 'R$', KRW: '₩', THB: '฿', MYR: 'RM', RUB: '₽' };

      let from = 'USD', to = 'INR';
      const mkSel = (side) => {
        const s = el('select', { class: 'select' },
          Object.keys(RATES).map((c) => el('option', { value: c, selected: c === side ? '' : undefined }, c)));
        return s;
      };
      const fromSel = mkSel(from), toSel = mkSel(to);
      const input = el('input', { class: 'input', type: 'number', value: '1', step: 'any', min: '0' });
      const out = el('div', { class: 'result-big' }, '—');
      const sub = el('div', { class: 'result-sub' }, '');

      const calc = () => {
        from = fromSel.value; to = toSel.value;
        const v = parseFloat(input.value);
        if (isNaN(v)) { out.textContent = '—'; sub.textContent = ''; return; }
        const r = (v / RATES[from]) * RATES[to];
        out.textContent = `${SYM[to] || ''} ${fmt(r, 2)}`;
        sub.textContent = `1 ${from} ≈ ${fmt(RATES[to] / RATES[from], 4)} ${to} · indicative rates`;
      };

      [fromSel, toSel].forEach((s) => s.addEventListener('change', calc));
      input.addEventListener('input', calc);

      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Amount'), input),
        el('div', { class: 'pane-row' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'From'), fromSel),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'To'), toSel),
        ),
        el('div', { class: 'result-card' }, out, sub),
        el('div', { class: 'note-info' }, 'Indicative static rates — for planning only, not live markets.'),
      );
      calc();
    },
  },

  /* ---------------- 4. Percentage ---------------- */
  {
    id: 'percentage',
    name: 'Percentage',
    desc: 'Percent of, change & more',
    cat: 'Math & Converters',
    keywords: ['percent', 'percentile', 'increase', 'decrease', 'change', '%'],
    icon: { bg: 'linear-gradient(135deg,#ff9f0a,#ff375f)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M19 5L5 19"/><circle cx="7.5" cy="7.5" r="3"/><circle cx="16.5" cy="16.5" r="3"/></svg>` },
    render(host) {
      let mode = 'of';
      const seg = el('div', { class: 'segmented' });
      const modes = [['of', 'X% of Y'], ['is', 'X is ?% of Y'], ['chg', '% change']];
      modes.forEach(([id, label]) => {
        const b = el('button', { class: id === mode ? 'active' : '', onclick: () => { mode = id; seg.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x.textContent === label)); calc(); } }, label);
        seg.append(b);
      });

      const a = el('input', { class: 'input', type: 'number', step: 'any', value: '15' });
      const b = el('input', { class: 'input', type: 'number', step: 'any', value: '200' });
      const labelA = el('label', { class: 'field-label' }, 'X (%)');
      const labelB = el('label', { class: 'field-label' }, 'Y');
      const out = el('div', { class: 'result-big' }, '—');
      const sub = el('div', { class: 'result-sub' }, '');

      const calc = () => {
        const x = parseFloat(a.value), y = parseFloat(b.value);
        if (isNaN(x) || isNaN(y)) { out.textContent = '—'; sub.textContent = ''; return; }
        let r, s = '';
        if (mode === 'of') { r = (x / 100) * y; labelA.textContent = 'X (%)'; labelB.textContent = 'Y'; s = `${fmt(x)}% × ${fmt(y)}`; }
        else if (mode === 'is') { r = (x / y) * 100; labelA.textContent = 'X'; labelB.textContent = 'Y'; s = `${fmt(x)} is ${fmt(r, 4)}% of ${fmt(y)}`; }
        else { r = ((y - x) / Math.abs(x)) * 100; labelA.textContent = 'From'; labelB.textContent = 'To'; s = `${fmt(x)} → ${fmt(y)}`; }
        out.textContent = fmt(r, 4) + (mode === 'is' || mode === 'chg' ? '%' : '');
        sub.textContent = s;
      };

      a.addEventListener('input', calc);
      b.addEventListener('input', calc);
      host.append(seg,
        el('div', { class: 'field' }, labelA, a),
        el('div', { class: 'field' }, labelB, b),
        el('div', { class: 'result-card' }, out, sub));
      calc();
    },
  },

  /* ---------------- 5. Tip & Split ---------------- */
  {
    id: 'tip-split',
    name: 'Tip & Split',
    desc: 'Bill, tip & split',
    cat: 'Math & Converters',
    keywords: ['tip', 'gratuity', 'bill', 'restaurant', 'split', 'share'],
    icon: { bg: 'linear-gradient(135deg,#ffd60a,#ff9f0a)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M8 15h3"/></svg>` },
    render(host) {
      const bill = el('input', { class: 'input', type: 'number', step: 'any', min: '0', value: '50.00' });
      const tipVal = el('span', { class: 'slider-value' }, '18%');
      const tipRange = el('input', { type: 'range', min: '0', max: '50', value: '18' });
      const people = el('input', { class: 'input', type: 'number', min: '1', step: '1', value: '2' });
      const outTip = el('div', { class: 'v' }, '—');
      const outTotal = el('div', { class: 'v' }, '—');
      const outEach = el('div', { class: 'v' }, '—');

      const presets = el('div', { class: 'pill-row' },
        [10, 15, 18, 20, 25].map((p) => el('button', {
          class: 'pill' + (p === 18 ? ' active' : ''),
          onclick: (e) => {
            tipRange.value = p;
            e.target.parentElement.querySelectorAll('.pill').forEach((x) => x.classList.toggle('active', x === e.target));
            calc();
          },
        }, p + '%')));

      const calc = () => {
        const b = Math.max(0, parseFloat(bill.value) || 0);
        const t = parseFloat(tipRange.value) || 0;
        const n = Math.max(1, Math.floor(parseFloat(people.value) || 1));
        tipVal.textContent = t + '%';
        const tip = b * t / 100;
        outTip.textContent = '$ ' + fmt(tip, 2);
        outTotal.textContent = '$ ' + fmt(b + tip, 2);
        outEach.textContent = '$ ' + fmt((b + tip) / n, 2);
      };

      [bill, tipRange, people].forEach((x) => x.addEventListener('input', calc));

      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Bill amount'), bill),
        presets,
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Tip'),
          el('div', { class: 'slider-row' }, tipRange, tipVal)),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Split between (people)'), people),
        el('div', { class: 'stat-grid' },
          el('div', { class: 'stat' }, outTip, el('div', { class: 'k' }, 'Tip')),
          el('div', { class: 'stat' }, outTotal, el('div', { class: 'k' }, 'Total')),
          el('div', { class: 'stat' }, outEach, el('div', { class: 'k' }, 'Per person')),
        ));
      calc();
    },
  },

  /* ---------------- 6. Discount ---------------- */
  {
    id: 'discount',
    name: 'Discount',
    desc: 'Sale price & savings',
    cat: 'Math & Converters',
    keywords: ['sale', 'offer', 'price', 'save', 'markdown', 'shopping'],
    icon: { bg: 'linear-gradient(135deg,#ff375f,#bf5af2)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 3 12.2V5a2 2 0 0 1 2-2h7.2c.5 0 1 .2 1.4.6l7 7a2 2 0 0 1 0 2.8z"/><circle cx="8.5" cy="8.5" r="1.3"/></svg>` },
    render(host) {
      const price = el('input', { class: 'input', type: 'number', step: 'any', min: '0', value: '120' });
      const disc = el('input', { class: 'input', type: 'number', step: 'any', min: '0', max: '100', value: '25' });
      const out = el('div', { class: 'result-big' }, '—');
      const sub = el('div', { class: 'result-sub' }, '');
      const save = el('div', { class: 'v' }, '—');
      const final = el('div', { class: 'v' }, '—');

      const calc = () => {
        const p = Math.max(0, parseFloat(price.value) || 0);
        const d = Math.min(100, Math.max(0, parseFloat(disc.value) || 0));
        const sv = p * d / 100;
        out.textContent = '$ ' + fmt(p - sv, 2);
        sub.textContent = `${d}% off $${fmt(p, 2)}`;
        save.textContent = '− $ ' + fmt(sv, 2);
        final.textContent = '$ ' + fmt(p - sv, 2);
      };
      price.addEventListener('input', calc);
      disc.addEventListener('input', calc);

      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Original price'), price),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Discount %'), disc),
        el('div', { class: 'result-card' }, out, sub),
        el('div', { class: 'stat-grid' },
          el('div', { class: 'stat' }, save, el('div', { class: 'k' }, 'You save')),
          el('div', { class: 'stat' }, final, el('div', { class: 'k' }, 'Final price'))),
      );
      calc();
    },
  },

  /* ---------------- 7. Loan / EMI ---------------- */
  {
    id: 'loan-emi',
    name: 'Loan & EMI',
    desc: 'EMI, interest & total',
    cat: 'Math & Converters',
    keywords: ['loan', 'emi', 'mortgage', 'interest', 'finance', 'installment', 'repay'],
    icon: { bg: 'linear-gradient(135deg,#0a84ff,#64d2ff)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="2" y="7" width="20" height="13" rx="2.5"/><path d="M16 7V5.5A2.5 2.5 0 0 0 13.5 3h-3A2.5 2.5 0 0 0 8 5.5V7M2 12h20"/><circle cx="17" cy="15.5" r="1.2"/></svg>` },
    render(host) {
      const P = el('input', { class: 'input', type: 'number', min: '0', value: '25000' });
      const R = el('input', { class: 'input', type: 'number', min: '0', step: '0.1', value: '8.5' });
      const T = el('input', { class: 'input', type: 'number', min: '1', value: '5' });
      const tUnit = el('select', { class: 'select', style: 'max-width:110px' },
        el('option', { value: 'y' }, 'Years'), el('option', { value: 'm' }, 'Months'));
      const out = el('div', { class: 'result-big' }, '—');
      const outI = el('div', { class: 'v' }, '—');
      const outT = el('div', { class: 'v' }, '—');
      const outN = el('div', { class: 'v' }, '—');

      const calc = () => {
        const p = parseFloat(P.value) || 0;
        const annual = parseFloat(R.value) || 0;
        const n = Math.max(1, Math.round((parseFloat(T.value) || 1) * (tUnit.value === 'y' ? 12 : 1)));
        const r = annual / 12 / 100;
        const emi = r === 0 ? p / n : p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        const total = emi * n;
        out.textContent = '$ ' + fmt(emi, 2);
        out.append(el('span', { class: 'unit' }, '/ month'));
        outI.textContent = '$ ' + fmt(total - p, 2);
        outT.textContent = '$ ' + fmt(total, 2);
        outN.textContent = String(n);
      };
      [P, R, T].forEach((x) => x.addEventListener('input', calc));
      tUnit.addEventListener('change', calc);

      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Loan amount'), P),
        el('div', { class: 'pane-row' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Interest % (p.a.)'), R),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Tenure'),
            el('div', { style: 'display:flex;gap:8px' }, T, tUnit))),
        el('div', { class: 'result-card' }, out),
        el('div', { class: 'stat-grid' },
          el('div', { class: 'stat' }, outI, el('div', { class: 'k' }, 'Total interest')),
          el('div', { class: 'stat' }, outT, el('div', { class: 'k' }, 'Total paid')),
          el('div', { class: 'stat' }, outN, el('div', { class: 'k' }, 'Payments'))),
      );
      calc();
    },
  },

  /* ---------------- 8. Number Base ---------------- */
  {
    id: 'number-base',
    name: 'Base Converter',
    desc: 'Binary, octal, decimal, hex',
    cat: 'Math & Converters',
    keywords: ['binary', 'hex', 'octal', 'decimal', 'hexadecimal', 'base', 'convert', 'bits'],
    icon: { bg: 'linear-gradient(135deg,#1c1c1e,#5e5ce6)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M4 9l4-5 4 5-4 5-4-5zM12 15l4-5 4 5-4 5-4-5z"/><path d="M12 5h.01M12 8h.01"/></svg>` },
    render(host) {
      const mk = (label) => {
        const inp = el('input', { class: 'input mono', type: 'text', spellcheck: 'false' });
        return { inp, node: el('div', { class: 'field' }, el('label', { class: 'field-label' }, label), inp) };
      };
      const bin = mk('Binary (2)'), oct = mk('Octal (8)'), dec = mk('Decimal (10)'), hex = mk('Hexadecimal (16)');
      const fields = { 2: bin, 8: oct, 10: dec, 16: hex };
      let updating = false;

      const updateFrom = (base, raw) => {
        const v = raw.trim();
        if (!v) { updating = true; Object.values(fields).forEach((f) => f.inp.value = ''); updating = false; return; }
        const valid = new RegExp(`^-?[0-9a-f]+$`, 'i');
        const digits = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^-?[0-9]+$/, 16: /^-?[0-9a-f]+$/i };
        if (!digits[base].test(v)) { toast('Invalid digit for this base'); return; }
        let n;
        try {
          n = base === 10 ? parseInt(v, 10) : parseInt(v.replace('-', ''), base) * (v.startsWith('-') ? -1 : 1);
        } catch { return; }
        if (!Number.isFinite(n)) return;
        updating = true;
        for (const [b, f] of Object.entries(fields)) {
          f.inp.value = Number(n).toString(Number(b));
        }
        updating = false;
      };

      for (const [b, f] of Object.entries(fields)) {
        f.inp.addEventListener('input', () => { if (!updating) updateFrom(Number(b), f.inp.value); });
      }

      host.append(bin.node, oct.node, dec.node, hex.node,
        el('div', { class: 'hint' }, 'Type in any field — the others update live. Negative values supported.'));
      dec.inp.value = '255';
      updateFrom(10, '255');
    },
  },

  /* ---------------- 9. BMI ---------------- */
  {
    id: 'bmi',
    name: 'BMI',
    desc: 'Body mass index',
    cat: 'Math & Converters',
    keywords: ['health', 'weight', 'height', 'body', 'fitness', 'mass', 'index'],
    icon: { bg: 'linear-gradient(135deg,#30d158,#63e6e2)', svg: `<svg viewBox="0 0 24 24" ${S}><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 12l5-5"/><path d="M16 3h5v5"/><circle cx="12" cy="12" r="1.5"/></svg>` },
    render(host) {
      const hUnit = el('select', { class: 'select', style: 'max-width:120px' },
        el('option', { value: 'cm' }, 'cm'), el('option', { value: 'ft' }, 'ft / in'));
      const heightCm = el('input', { class: 'input', type: 'number', min: '0', value: '172' });
      const ftIn = el('div', { style: 'display:none;gap:8px' },
        el('input', { class: 'input', type: 'number', min: '0', value: '5', 'aria-label': 'feet' }),
        el('input', { class: 'input', type: 'number', min: '0', max: '11', value: '8', 'aria-label': 'inches' }));
      const weight = el('input', { class: 'input', type: 'number', min: '0', step: '0.1', value: '68' });
      const wUnit = el('select', { class: 'select', style: 'max-width:120px' },
        el('option', { value: 'kg' }, 'kg'), el('option', { value: 'lb' }, 'lb'));
      const out = el('div', { class: 'result-big' }, '—');
      const catEl = el('div', { class: 'result-sub' }, '');
      const bar = el('div', { style: 'display:flex;height:10px;border-radius:5px;overflow:hidden;margin:12px 0 4px' },
        el('div', { style: 'flex:15;background:#64d2ff' }),
        el('div', { style: 'flex:10;background:#30d158' }),
        el('div', { style: 'flex:10;background:#ffd60a' }),
        el('div', { style: 'flex:15;background:#ff453a' }));
      const marker = el('div', { style: 'height:16px;position:relative' });
      const marks = el('div', { style: 'display:flex;justify-content:space-between;font-size:10.5px;color:var(--label-secondary);font-weight:600' },
        el('span', {}, '15'), el('span', {}, '18.5'), el('span', {}, '25'), el('span', {}, '30'), el('span', {}, '40'));

      const calc = () => {
        let hM, kg;
        if (hUnit.value === 'cm') hM = (parseFloat(heightCm.value) || 0) / 100;
        else {
          const [f, i] = ftIn.querySelectorAll('input');
          hM = ((parseFloat(f.value) || 0) * 12 + (parseFloat(i.value) || 0)) * 0.0254;
        }
        kg = parseFloat(weight.value) || 0;
        if (wUnit.value === 'lb') kg *= 0.45359237;
        if (hM <= 0 || kg <= 0) { out.textContent = '—'; catEl.textContent = ''; return; }
        const bmi = kg / (hM * hM);
        out.textContent = fmt(bmi, 1);
        let label = '', color = '#30d158';
        if (bmi < 18.5) { label = 'Underweight'; color = '#64d2ff'; }
        else if (bmi < 25) { label = 'Normal — looking good!'; color = '#30d158'; }
        else if (bmi < 30) { label = 'Overweight'; color = '#ffd60a'; }
        else { label = 'Obese'; color = '#ff453a'; }
        catEl.textContent = label;
        out.style.color = color;
        const pos = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100));
        marker.innerHTML = `<div style="position:absolute;left:calc(${pos}% - 7px);top:0"><div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid var(--label)"></div></div>`;
      };

      hUnit.addEventListener('change', () => {
        heightCm.style.display = hUnit.value === 'cm' ? '' : 'none';
        ftIn.style.display = hUnit.value === 'cm' ? 'none' : 'flex';
        calc();
      });
      wUnit.addEventListener('change', calc);
      host.append(
        el('div', { class: 'pane-row' },
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Height unit'), hUnit),
          el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Weight unit'), wUnit)),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Height'),
          el('div', { style: 'display:flex;gap:8px' }, heightCm, ftIn)),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Weight'), weight),
        el('div', { class: 'result-card' }, out, catEl, bar, marker, marks),
        el('div', { class: 'hint' }, 'BMI = weight (kg) ÷ height (m)². General guidance only.'),
      );
      host.querySelectorAll('input').forEach((i) => i.addEventListener('input', calc));
      calc();
    },
  },

  /* ---------------- 10. Age Calculator ---------------- */
  {
    id: 'age',
    name: 'Age',
    desc: 'Years, months & days',
    cat: 'Math & Converters',
    keywords: ['birthday', 'born', 'date', 'years', 'old', 'days', 'zodiac'],
    icon: { bg: 'linear-gradient(135deg,#bf5af2,#ff375f)', svg: `<svg viewBox="0 0 24 24" ${S}><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M12 14v3l2 1"/></svg>` },
    render(host) {
      const today = new Date();
      const iso = (d) => d.toISOString().slice(0, 10);
      const birth = el('input', { class: 'input', type: 'date', value: iso(new Date(today.getFullYear() - 25, today.getMonth(), today.getDate())) });
      const to = el('input', { class: 'input', type: 'date', value: iso(today) });
      const out = el('div', { class: 'result-big' }, '—');
      const sub = el('div', { class: 'result-sub' }, '');
      const grid = el('div', { class: 'stat-grid' });

      const calc = () => {
        const b = new Date(birth.value + 'T00:00:00');
        const t = new Date(to.value + 'T00:00:00');
        if (isNaN(b) || isNaN(t) || b > t) { out.textContent = '—'; sub.textContent = 'Check the dates'; grid.innerHTML = ''; return; }
        let y = t.getFullYear() - b.getFullYear();
        let m = t.getMonth() - b.getMonth();
        let d = t.getDate() - b.getDate();
        if (d < 0) { m--; const pm = new Date(t.getFullYear(), t.getMonth(), 0).getDate(); d += pm; }
        if (m < 0) { y--; m += 12; }
        out.textContent = `${y} years`;
        sub.textContent = `${m} months · ${d} days`;

        const ms = t - b;
        const totalDays = Math.floor(ms / 86400000);
        const nextB = new Date(t.getFullYear(), b.getMonth(), b.getDate());
        if (nextB < t) nextB.setFullYear(t.getFullYear() + 1);
        const daysToB = Math.ceil((nextB - t) / 86400000);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        grid.innerHTML = '';
        grid.append(
          el('div', { class: 'stat' }, el('div', { class: 'v' }, totalDays.toLocaleString()), el('div', { class: 'k' }, 'Total days')),
          el('div', { class: 'stat' }, el('div', { class: 'v' }, Math.floor(totalDays / 7).toLocaleString()), el('div', { class: 'k' }, 'Weeks')),
          el('div', { class: 'stat' }, el('div', { class: 'v' }, daysToB.toLocaleString()), el('div', { class: 'k' }, 'Days to birthday')),
          el('div', { class: 'stat' }, el('div', { class: 'v', style: 'font-size:14px' }, dayNames[b.getDay()]), el('div', { class: 'k' }, 'Born on')),
        );
      };
      birth.addEventListener('change', calc);
      to.addEventListener('change', calc);
      host.append(
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Date of birth'), birth),
        el('div', { class: 'field' }, el('label', { class: 'field-label' }, 'Age at date'), to),
        el('div', { class: 'result-card' }, out, sub),
        grid,
      );
      calc();
    },
  },
];
