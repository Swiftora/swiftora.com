/* ---------- Demo data ---------- */
const EXAMPLES = [
  {
    title: 'Vintage Mid-Century Amber Glass Vase',
    desc: 'Elegant ribbed vase from the 1960s with warm amber glass—perfect for MCM decor.',
    price: '$24.99',
    comps: [
      { title: 'Vintage Art Deco Candle Stick', price: '$22.00' },
      { title: 'Solid Brass Candle Pair', price: '$27.50' },
      { title: 'Antique Bronze Lantern', price: '$30.00' }
    ],
    fees: { ship: 8.75, fee: 2.00 }
  },
  {
    title: 'Retro 80s Quartz Flip Clock',
    desc: 'Classic 1980s flip clock with bold orange digits and quartz movement.',
    price: '$42.00',
    comps: [
      { title: 'Retro Digital Desk Clock', price: '$40.00' },
      { title: 'Vintage Flip Alarm Clock', price: '$39.50' },
      { title: '1980s Quartz Flip Clock', price: '$45.00' }
    ],
    fees: { ship: 6.20, fee: 2.80 }
  },
  {
    title: 'Antique Brass Candle Holder',
    desc: 'Ornate solid brass with natural patina and Victorian-inspired detailing.',
    price: '$18.50',
    comps: [
      { title: 'Carved Wooden Totem', price: '$16.00' },
      { title: 'Folk Art Wooden Figure', price: '$20.50' },
      { title: 'Vintage Wooden Carving', price: '$19.00' }
    ],
    fees: { ship: 5.10, fee: 1.60 }
  }
];

/* ---------- Stepper ---------- */
let current = 1;
function nextStep() {
  const cur = document.getElementById(`step${current}`);
  const dots = document.querySelectorAll('#stepper .dot');
  if (cur) cur.style.display = 'none';
  if (dots[current - 1]) dots[current - 1].classList.remove('active');
  current++;
  const nxt = document.getElementById(`step${current}`);
  if (nxt) nxt.style.display = 'block';
  if (dots[current - 1]) dots[current - 1].classList.add('active');
}
window.nextStep = nextStep;

/* ---------- DOM refs ---------- */
let uploadEl, previewEl, nextBtn1;
let listingCard, compsCard, confidenceCard, attrsCard, profitCard, statusList;
let fieldCategory, fieldCondition, fieldCost, fieldColor, fieldBrand;
let adjShip, adjFee;

/* ---------- Helpers ---------- */
const $ = (s) => document.querySelector(s);
const toNum = (str) => {
  const n = parseFloat(String(str).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};
function renderComps(list) {
  return '<ul style="margin-left:1rem; padding-left:0.5rem;">' +
    list.map(i => `<li>${i.title} — <em>${i.price}</em></li>`).join('') +
    '</ul>';
}
function pushStatus(msg) {
  const li = document.createElement('li');
  li.textContent = msg;
  statusList.appendChild(li);
}
function buildTitle({ category, color, brand, baseTitle }) {
  const parts = [];
  if (brand) parts.push(brand);
  if (color) parts.push(color);
  parts.push(baseTitle || category || 'Vintage Item');
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/* ---------- Main ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // Grab elements
  uploadEl = $('#upload');
  previewEl = $('#preview');
  nextBtn1  = $('#step1Btn');

  listingCard    = $('#listingCard');
  compsCard      = $('#compsCard');
  confidenceCard = $('#confidenceCard');
  attrsCard      = $('#attrsCard');
  profitCard     = $('#profitCard');
  statusList     = $('#statusList');

  fieldCategory  = $('#field-category');
  fieldCondition = $('#field-condition');
  fieldCost      = $('#field-cost');
  fieldColor     = $('#field-color');
  fieldBrand     = $('#field-brand');

  adjShip = $('#adj-ship');
  adjFee  = $('#adj-fee');

  // Make Next reliable on all browsers
  const enable = () => { if (nextBtn1) nextBtn1.disabled = false; };
  if (uploadEl) {
    uploadEl.addEventListener('change', enable);
    uploadEl.addEventListener('input', enable);
    uploadEl.addEventListener('change', () => {
      if (!uploadEl.files?.length) return;
      const file = uploadEl.files[0];
      previewEl.src = URL.createObjectURL(file);
      previewEl.style.display = 'block';
    });
  }

  // When Step 2 becomes visible, run the simulated pipeline
  const observer = new MutationObserver(() => {
    const st2 = $('#step2');
    if (st2 && st2.style.display !== 'none') {
      observer.disconnect();
      runSimulatedPipeline();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true });
});

async function runSimulatedPipeline() {
  // Reset
  statusList.innerHTML = '';
  listingCard.innerHTML = '';
  compsCard.innerHTML = '';
  confidenceCard.innerHTML = '';
  attrsCard.innerHTML = '';
  profitCard.innerHTML = '';

  const category  = fieldCategory.value;
  const condition = fieldCondition.value;
  const cost      = toNum(fieldCost.value);
  const color     = (fieldColor.value || '').trim();
  const brand     = (fieldBrand.value || '').trim();

  const ex = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
  const basePrice = toNum(ex.price);
  const suggested = Math.max(basePrice - 1, 10);

  // Stream statuses
  pushStatus('Analyzing image…');                 await delay(600);
  pushStatus('Detecting edges/background…');      await delay(500);
  pushStatus('Reading markings/labels…');         await delay(600);
  pushStatus('Finding visually similar items…');  await delay(600);
  pushStatus('Pulling sold prices (last 90 days)…'); await delay(700);

  // Comps
  compsCard.innerHTML = renderComps(ex.comps);

  // Listing
  const title = buildTitle({ category, color, brand, baseTitle: ex.title });
  const desc  = `${ex.desc} ${brand ? `Marked/Brand: ${brand}. ` : ''}${color ? `Color: ${color}. ` : ''}Category: ${category || 'N/A'}. Condition: ${condition || 'N/A'}.`;

  listingCard.innerHTML =
    `<p><strong>Title:</strong> ${title}</p>` +
    `<p><strong>Description:</strong> ${desc}</p>` +
    `<p><strong>Suggested Price:</strong> $${suggested.toFixed(2)} <span style="color:#777">(sample)</span></p>`;

  // Attributes
  attrsCard.innerHTML =
    row('Category', category || '—') +
    row('Condition', condition || '—') +
    row('Color', color || '—') +
    row('Brand/Markings', brand || '—') +
    row('Photo Quality', 'Good lighting, neutral background (tips applied)');

  // Confidence
  pushStatus('Scoring confidence…'); await delay(500);
  const conf = Math.floor(Math.random() * 26) + 70; // 70–95%
  confidenceCard.innerHTML = `<p><strong>Confidence Score:</strong> ${conf}%</p>
  <p class="fine">Higher means the estimate aligns with recent sales based on image similarity and keywords.</p>`;

  // Profit snapshot
  const ship = ex.fees.ship, fee = ex.fees.fee;
  const net  = suggested - ship - fee - (isNaN(cost) ? 0 : cost);
  profitCard.innerHTML = profitHTML({ ship, fee, cost: isNaN(cost) ? 0 : cost, net });

  // Adjustable fees
  const recompute = () => {
    const s = toNum(adjShip.value || ship);
    const f = toNum(adjFee.value || fee);
    const netNow = suggested - s - f - (isNaN(cost) ? 0 : cost);
    profitCard.innerHTML = profitHTML({ ship: s, fee: f, cost: isNaN(cost) ? 0 : cost, net: netNow });
  };
  adjShip.value = ship.toFixed(2);
  adjFee.value  = fee.toFixed(2);
  adjShip.addEventListener('input', recompute);
  adjFee.addEventListener('input', recompute);

  pushStatus('Done');
}

function row(k, v) { return `<tr><td>${k}</td><td>${v}</td></tr>`; }
function profitHTML({ ship, fee, cost, net }) {
  return `<p><strong>Shipping:</strong> $${Number(ship).toFixed(2)}</p>
          <p><strong>Platform Fees:</strong> $${Number(fee).toFixed(2)}</p>
          <p><strong>Item Cost:</strong> $${Number(cost).toFixed(2)}</p>
          <p><strong>Net Profit:</strong> $${net.toFixed(2)}</p>`;
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
