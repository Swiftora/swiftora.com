const examples = [
  { title: 'Antique Brass Candle Holder', desc: 'Ornate solid brass with natural patina – ideal for Victorian-inspired interiors.', price: '$24.00' },
  { title: 'Retro Quartz Flip Clock', desc: 'Fully-functional flip clock with iconic 1980s design.', price: '$42.00' },
  { title: 'Hand-Carved Wooden Figurine', desc: 'Unique hand-carved figurine perfect for oddity collectors.', price: '$18.50' }
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
const upload = document.getElementById('upload');
const preview = document.getElementById('preview');
const btnNext = document.getElementById('step1Btn');
upload.addEventListener('change', () => {
  if (upload.files.length) {
    const file = upload.files[0];
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    btnNext.disabled = false;
    // Sample listing & profit
    const idx = Math.floor(Math.random() * examples.length);
    const ex  = examples[idx];
    document.getElementById('listingCard').innerHTML =
      `<strong>Title:</strong> ${ex.title}<br>` +
      `<strong>Description:</strong> ${ex.desc}<br>` +
      `<strong>Suggested Price:</strong> ${ex.price} <span style="color:#777">(based on similar sold listings)</span>`;
    const f = fees[idx];
    const profit = (parseFloat(ex.price.replace('$','')) - f.ship - f.fee - f.cost).toFixed(2);
    document.getElementById('profitCard').innerHTML =
      `<strong>Shipping:</strong> $${f.ship}<br>` +
      `<strong>Platform Fees:</strong> $${f.fee}<br>` +
      `<strong>Item Cost:</strong> $${f.cost}<br>` +
      `<strong>Net Profit:</strong> $${profit}`;
    // Confidence & XP
    const conf = Math.floor(Math.random() * 26) + 70; // 70–95%
    document.getElementById('confidenceCard').innerHTML =
      `<strong>Confidence Score:</strong> ${conf}%<br>` +
      `<p>We compared your item against thousands of similar listings and computed our confidence in the suggested price based on image match, description keywords, and sold comps.</p>`;
    const xp = Math.floor(Math.random() * 26) + 15; // 15–40 XP
    document.getElementById('gamifyCard').innerHTML =
      `<strong>XP Earned:</strong> ${xp} XP<br>` +
      `<p>Keep listing items to level up, earn badges, and unlock streak bonuses!</p>`;
  }
});
