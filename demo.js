// Sample data for listing preview and profit calculation
const examples = [
  {
    title: 'Antique Brass Candle Holder',
    desc: 'Ornate solid brass with natural patina – ideal for Victorian-inspired interiors.',
    price: '$24.00'
  },
  {
    title: 'Retro Quartz Flip Clock',
    desc: 'Fully-functional flip clock with iconic 1980s design.',
    price: '$42.00'
  },
  {
    title: 'Hand-Carved Wooden Figurine',
    desc: 'Unique hand-carved figurine perfect for oddity collectors.',
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

// Fee structures matching the examples
const fees = [
  { ship: 8.75, fee: 2.00, cost: 5.0 },
  { ship: 6.20, fee: 2.80, cost: 7.50 },
  { ship: 5.10, fee: 1.60, cost: 4.00 }
];

let current = 1;

function nextStep() {
  // Hide current step and deactivate current step dot
  document.getElementById(`step${current}`).style.display = 'none';
  document.querySelectorAll('#stepper .dot')[current - 1].classList.remove('active');
  current++;
  // Show next step and activate the corresponding dot
  document.getElementById(`step${current}`).style.display = 'block';
  document.querySelectorAll('#stepper .dot')[current - 1].classList.add('active');
}

// File upload and preview event
const upload = document.getElementById('upload');
const preview = document.getElementById('preview');
const btnNext = document.getElementById('step1Btn');

upload.addEventListener('change', () => {
  if (upload.files.length) {
    const file = upload.files[0];
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    btnNext.disabled = false;

    // Choose a random example and corresponding comparables/fees
    const idx = Math.floor(Math.random() * examples.length);
    const ex = examples[idx];
    const comps = comparables[idx];
    const f = fees[idx];

    // Populate listing preview
    document.getElementById('listingCard').innerHTML =
      `<strong>Title:</strong> ${ex.title}<br>` +
      `<strong>Description:</strong> ${ex.desc}<br>` +
      `<strong>Suggested Price:</strong> ${ex.price} <span style="color:#777">(based on similar sold listings)</span>`;

    // Populate comparables list
    let compsHtml = '<strong>Sold Comparables:</strong><ul style="margin-left:1rem; padding-left:0.5rem;">';
    comps.forEach(item => {
      compsHtml += `<li>${item.title} — <em>${item.price}</em></li>`;
    });
    compsHtml += '</ul>';
    document.getElementById('compsCard').innerHTML = compsHtml;

    // Populate profit breakdown
    const priceNum = parseFloat(ex.price.replace('$',''));
    const netProfit = (priceNum - f.ship - f.fee - f.cost).toFixed(2);
    document.getElementById('profitCard').innerHTML =
      `<strong>Shipping:</strong> $${f.ship}<br>` +
      `<strong>Platform Fees:</strong> $${f.fee}<br>` +
      `<strong>Item Cost:</strong> $${f.cost}<br>` +
      `<strong>Net Profit:</strong> $${netProfit}`;

    // Populate confidence score
    const conf = Math.floor(Math.random() * 26) + 70; // random 70–95
    document.getElementById('confidenceCard').innerHTML =
      `<strong>Confidence Score:</strong> ${conf}%<br>` +
      `<p>We compared your item against thousands of similar listings and computed our confidence in the suggested price based on image match, description keywords, and sold comps.</p>`;

    // Populate progress points
    const xp = Math.floor(Math.random() * 26) + 15; // random 15–40 points
    document.getElementById('progressCard').innerHTML =
      `<strong>Progress Points:</strong> ${xp} pts<br>` +
      `<p>Keep listing items to accumulate points and unlock special rewards.</p>`;
  }
});
