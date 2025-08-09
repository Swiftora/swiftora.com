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

/* ---------- Gamification ---------- */
const xpState = { xp: 0, level: 1 };
function addXP(amount) {
  xpState.xp += amount;
  if (xpState.xp >= 100) { xpState.level++; xpState.xp = xpState.xp - 100; }
  $('#xpValue').textContent = xpState.xp;
  $('#levelBadge').textContent = `Lv ${xpState.level}`;
  $('#levelMeter').style.width = `${xpState.xp}%`;
}
function updateProgress(stepIndex) {
  const pct = [20,40,60,80,100][stepIndex-1] || 20;
  $('#progressBar').style.width = `${pct}%`;
  const dots = $all('#stepper .dot');
  dots.forEach((d,i)=>d.classList.toggle('active', i < stepIndex));
}

/* ---------- Utilities ---------- */
const $ = (s) => document.querySelector(s);
const $all = (s) => Array.from(document.querySelectorAll(s));
const delay = (ms) => new Promise(r=>setTimeout(r,ms));
const toNum = (str) => { const n = parseFloat(String(str).replace(/[^0-9.]/g,'')); return isNaN(n)?0:n; };
function row(k, v) { return `<tr><td>${k}</td><td>${v}</td></tr>`; }
function renderComps(list) {
  return '<ul style="margin-left:1rem; padding-left:0.5rem;">' +
    list.map(i => `<li>${i.title} — <em>${i.price}</em></li>`).join('') + '</ul>';
}
function buildTitle({ category, color, brand, baseTitle }) {
  const parts = [];
  if (brand) parts.push(brand);
  if (color) parts.push(color);
  parts.push(baseTitle || category || 'Vintage Item');
  return parts.join(' ').replace(/\s+/g,' ').trim();
}

/* ---------- Step flow ---------- */
let current = 1;
function goTo(step) {
  current = step;
  $all('.screen').forEach((el,i)=> {
    el.classList.toggle('active', (i+1)===step);
  });
  updateProgress(step);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function nextStep() { goTo(current+1); }

/* ---------- DOM refs ---------- */
let uploadEl, previewEl, nextBtn1;
let listingCard, compsCard, confidenceCard, attrsCard, profitCard, statusList;
let fieldCategory, fieldCondition, fieldCost, fieldColor, fieldBrand;
let adjShip, adjFee;

document.addEventListener('DOMContentLoaded', () => {
  // refs
  uploadEl = $('#upload'); previewEl = $('#preview'); nextBtn1 = $('#step1Btn');
  listingCard = $('#listingCard'); compsCard = $('#compsCard');
  confidenceCard = $('#confidenceCard'); attrsCard = $('#attrsCard');
  profitCard = $('#profitCard'); statusList = $('#statusList');
  fieldCategory = $('#field-category'); fieldCondition = $('#field-condition');
  fieldCost = $('#field-cost'); fieldColor = $('#field-color'); fieldBrand = $('#field-brand');
  adjShip = $('#adj-ship'); adjFee = $('#adj-fee');

  // Validation for Step 1
  const checkValid = () => {
    const photoOK = uploadEl && uploadEl.files && uploadEl.files.length > 0;
    const catOK = fieldCategory.value !== '';
    const condOK = fieldCondition.value !== '';
    const costOK = fieldCost.value !== '' && !isNaN(Number(fieldCost.value));
    const ok = photoOK && catOK && condOK && costOK;
    nextBtn1.disabled = !ok;
  };

  ['change','input'].forEach(evt => {
    uploadEl.addEventListener(evt, () => {
      if (uploadEl.files?.length) {
        const file = uploadEl.files[0];
        previewEl.src = URL.createObjectURL(file);
        previewEl.style.display = 'block';
        addXP(10); // small reward for uploading
      }
      checkValid();
    });
    fieldCategory.addEventListener(evt, checkValid);
    fieldCondition.addEventListener(evt, checkValid);
    fieldCost.addEventListener(evt, checkValid);
  });

  nextBtn1.addEventListener('click', async () => {
    if (nextBtn1.disabled) return;
    addXP(15);
    goTo(2);
    await runSimulatedPipeline();
  });

  $('#step2Btn').addEventListener('click', () => { addXP(10); goTo(3); });
  $('#step3Btn').addEventListener('click', () => { addXP(10); goTo(4); $('#earnedXP').textContent = (xpState.xp + (xpState.level-1)*100); });
  $('#step4Btn').addEventListener('click', () => { addXP(5); goTo(5); });

  // Init
  goTo(1);
});

/* ---------- Pipeline ---------- */
async function runSimulatedPipeline() {
  // reset UI
  statusList.innerHTML = ''; listingCard.innerHTML = ''; compsCard.innerHTML = '';
  confidenceCard.innerHTML = ''; attrsCard.innerHTML = ''; profitCard.innerHTML = '';

  const ex = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
  const category  = $('#field-category').value;
  const condition = $('#field-condition').value;
  const cost      = toNum($('#field-cost').value);
  const color     = ($('#field-color').value || '').trim();
  const brand     = ($('#field-brand').value || '').trim();

  // streamed statuses
  pushStatus('Analyzing image…'); await delay(450);
  pushStatus('Detecting edges/background…'); await delay(450);
  pushStatus('Reading markings/labels…'); await delay(450);
  pushStatus('Finding visually similar items…'); await delay(500);
  pushStatus('Pulling sold prices (last 90 days)…'); await delay(600);

  // comps
  compsCard.innerHTML = renderComps(ex.comps);

  // listing
  const basePrice = toNum(ex.price);
  const suggested = Math.max(basePrice - 1, 10);
  const title = buildTitle({ category, color, brand, baseTitle: ex.title });
  const desc  = `${ex.desc} ${brand ? `Marked/Brand: ${brand}. ` : ''}${color ? `Color: ${color}. ` : ''}Category: ${category || 'N/A'}. Condition: ${condition || 'N/A'}.`;

  listingCard.innerHTML =
    `<p><strong>Title:<
