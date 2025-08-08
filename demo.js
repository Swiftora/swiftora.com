/* -------- Demo data (static examples) -------- */
const examples = [
  {
    title: 'Vintage Mid-Century Amber Glass Vase',
    desc:
      'Elegant ribbed vase from the 1960s with warm amber glass and boho flair—perfect for mid-century modern decor or retro home styling. ' +
      'Tags: boho, MCM, glass, vintage home decor, amber vase.',
    price: '$24.99',
    comps: [
      { title: 'Vintage Art Deco Candle Stick', price: '$22.00' },
      { title: 'Solid Brass Candle Pair', price: '$27.50' },
      { title: 'Antique Bronze Lantern', price: '$30.00' }
    ],
    fees: { ship: 8.75, fee: 2.00, cost: 5.0 }
  },
  {
    title: 'Retro 80s Quartz Flip Clock',
    desc:
      'Fully functional 1980s flip clock with bold orange digits and classic quartz movement—ideal for vintage collectors or a retro-inspired desk. ' +
      'Tags: 1980s, retro, clock, orange, quartz, home office.',
    price: '$42.00',
    comps: [
      { title: 'Retro Digital Desk Clock', price: '$40.00' },
      { title: 'Vintage Flip Alarm Clock', price: '$39.50' },
      { title: '1980s Quartz Flip Clock', price: '$45.00' }
    ],
    fees: { ship: 6.20, fee: 2.80, cost: 7.50 }
  },
  {
    title: 'Antique Brass Candle Holder',
    desc:
      'Ornate solid brass candle holder with natural patina and Victorian-inspired detailing—an exquisite accent for rustic farmhouse or vintage dining. ' +
      'Tags: brass, patina, Victorian, farmhouse, antique decor.',
    price: '$18.50',
    comps: [
      { title: 'Carved Wooden Totem', price: '$16.00' },
      { title: 'Folk Art Wooden Figure', price: '$20.50' },
      { title: 'Vintage Wooden Carving', price: '$19.00' }
    ],
    fees: { ship: 5.10, fee: 1.60, cost: 4.00 }
  }
];

/* -------- Stepper logic -------- */
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
window.nextStep = nextStep; // keep global for onClick handlers

/* -------- Elements -------- */
const upload   = document.getElementById('upload');
const preview  = document.getElementById('preview');
const btnNext1 = document.getElementById('step1Btn');

const listingCard    = document.getElementById('listingCard');
const compsCard      = document.getElementById('compsCard');
const confidenceCard = document.getElementById('confidenceCard');
const profitCard     = document.getElementById('profitCard');

/* -------- Helpers -------- */
function renderComps(list) {
  return (
    '<strong>Sold Comparables:</strong>' +
    '<ul style="margin-left:1rem; padding-left:0.5rem;">' +
    list.map(item => `<li>${item.title} — <em>${item.price}</em></li>`).join('') +
    '</ul>'
  );
}

function parsePrice(str) {
  const n = parseFloat
