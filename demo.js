const examples = [
  {
    title: 'Vintage Mid‑Century Amber Glass Vase',
    desc: 'Elegant ribbed vase from the 1960s with warm amber glass and boho flair; perfect for mid‑century modern decor or retro home styling. Tags: boho, MCM, glass, vintage home decor, amber vase.',
    price: '$24.99'
  },
  {
    title: 'Retro 80s Quartz Flip Clock',
    desc: 'Fully functional 1980s flip clock with bold orange digits and classic quartz movement; ideal for vintage collectors or retro-inspired office desk. Tags: 1980s, retro, clock, orange, quartz, home office.',
    price: '$42.00'
  },
  {
    title: 'Antique Brass Candle Holder',
    desc: 'Ornate solid brass candle holder with natural patina and Victorian-inspired detailing; an exquisite accent for rustic farmhouse or vintage dining table. Tags: brass, patina, Victorian, farmhouse, antique decor.',
    price: '$18.50'
  }
];

// Comparable sold items for each example
const comparables = [
  [
    { title: 'Vintage Art Deco Candle Stick', price: '$22.00' },
    { title: 'Solid Brass Candle Pair', price: '$27.50' },
    { title: 'Antique Bronze Lantern', price: '$30.00' }
  ],
  [
    { title: 'Retro Digital Desk Clock', price: '$40.00' },
    { title: 'Vintage Flip Alarm Clock', price: '$39.50' },
    { title: '1980s Quartz Flip Clock', price: '$45.00' }
  ],
  [
    { title: 'Carved Wooden Totem', price: '$16.00' },
    { title: 'Folk Art Wooden Figure', price: '$20.50' },
    { title: 'Vintage Wooden Carving', price: '$19.00' }
  ]
];

const fees = [
  { ship: 8.75, fee: 2.00, cost: 5.0 },
  { ship: 6.20, fee: 2.80, cost: 7.50 },
  { ship: 5.10, fee: 1.60, cost: 4.00 }
];

let current = 1;

function nextStep() {
  document.getElementById(`step${current}`).style.display = 'none';
  document.querySelectorAll('#stepper .dot')[current - 1].classList.remove('active');
  current++;
  document.getElementById(`step${current}`).style.display = 'block';
  document.querySelectorAll('#stepper .dot')[current - 1].classList.add('active');
}

// File upload and preview event
const upload   = document.getElementById('upload');
const preview  = document.getElementById('preview');
const btnNext  = document.getElementById('step1Btn');

upload.addEventListener('change', () => {
  if (upload.files.length) {
    const file = upload.files[0];
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    btnNext.disabled = false;

    const idx = Math.floor(Math.random() * examples.length);
    const ex  = examples[idx];
    const comps = comparables[idx];
    const f = fees[idx];

    // Listing & pricing preview with SEO-friendly description
    document.getElementById('listingCard').innerHTML =
      `<strong>Title:</strong> ${ex.title}<br>` +
      `<strong>Description:</strong> ${ex.desc}<br>` +
      `<strong>Suggested Price:</strong> ${ex.price} <span style="color:#777">(based on similar sold listings)</span>`;

    // Sold comparables list
    let compsHtml = '<strong>Sold Comparables:</strong><ul style="margin-left:1rem; padding-left:0.5rem;">';
    comps.forEach(item => {
      compsHtml += `<li>${item.title} — <em>${item.price}</em></li>`;
    });
    compsHtml += '</ul>';
    document.getElementById('compsCard').innerHTML = compsHtml;

    // Profit breakdown in Step 3
    const priceNum = parseFloat(ex.price.replace('$',''));
    const netProfit = (priceNum - f.ship - f.fee - f.cost).toFixed(2);
    document.getElementById('profitCard').innerHTML =
      `<strong>Shipping:</strong> $${f.ship}<br>` +
      `<strong>Platform Fees:</strong> $${f.fee}<br>` +
      `<strong>Item Cost:</strong> $${f.cost}<br>` +
      `<strong>Net Profit:</strong> $${netProfit}`;

    // Confidence score in Step 2
    const conf = Math.floor(Math.random() * 26) + 70; // 70–95%
    document.getElementById('confidenceCard').innerHTML =
      `<strong>Confidence Score:</strong> ${conf}%<br>` +
      `<p>We matched your item to thousands of recent sales to estimate price accuracy. A higher score means the AI is more certain about the suggested price based on image similarity and description keywords.</p>`;

    // Progress points in Step 4
    const xp = Math.floor(Math.random() * 26) + 15; // 15–40 pts
    document.getElementById('progressCard').innerHTML =
      `<strong>Progress Points:</strong> ${xp} pts<br>` +
      `<p>Keep listing items to earn points and unlock new features in Swiftora!</p>`;
  }
});
