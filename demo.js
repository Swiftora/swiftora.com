/* Swiftora demo v2025-08-09-20 */

/* ---------- small helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const state = {
  files: [],
  desc: "",
  condition: "",
  cost: 0,
  priceSuggested: 47,
  feePct: 13,
  shipping: 12
};

function goTo(step) {
  // screens
  $$(".screen").forEach((sec, i)=>sec.classList.toggle("active", (i+1)===step));
  // dots
  $$("#stepper .dot").forEach((d,i)=>{
    d.classList.toggle("active",(i+1)===step);
  });
  // progress
  const pct = [20,40,60,80,100][step-1] || 20;
  $("#progressBar").style.width = pct + "%";
}

/* ---------- Step 1: inputs ---------- */
function bindStep1() {
  const upload = $("#upload");
  const thumbs = $("#thumbs");
  const coverageRow = $("#coverageRow");
  const coverageFill = $("#coverageFill");
  const coverageLabel = $("#coverageLabel");

  upload.addEventListener("change", (e) => {
    state.files = Array.from(e.target.files || []);
    // render thumbs
    thumbs.innerHTML = "";
    state.files.forEach(file => {
      const img = document.createElement("img");
      img.alt = "preview";
      img.src = URL.createObjectURL(file);
      thumbs.appendChild(img);
    });
    // show coverage meter only if there are photos
    if (state.files.length) {
      const target = Math.min(3, state.files.length);
      const pct = Math.min(100, target/3*100);
      coverageRow.style.display = "flex";
      coverageFill.style.width = pct + "%";
      coverageLabel.textContent = `${target}/3`;
    } else {
      coverageRow.style.display = "none";
    }
  });

  // chips
  const chips = $$("#condChips .chip");
  chips.forEach(chip=>{
    chip.addEventListener("click", ()=>{
      chips.forEach(c=>c.classList.remove("active"));
      chip.classList.add("active");
      $("#field-condition").value = chip.dataset.value;
      state.condition = chip.dataset.value;
    });
  });

  $("#field-desc").addEventListener("input",(e)=>{ state.desc = e.target.value.trim(); });
  $("#field-cost").addEventListener("input",(e)=>{ state.cost = parseFloat(e.target.value||"0")||0; });

  // Next always allowed (photos optional)
  $("#step1Btn").addEventListener("click", ()=>{
    renderStep2();
    goTo(2);
  });
}

/* ---------- color utility for confidence bars ---------- */
function colorForPercent(p) {
  // 0 -> red(0deg), 50 -> yellow(50), 100 -> green(120)
  const hue = Math.round((Math.max(0, Math.min(100,p)) / 100) * 120);
  return `hsl(${hue} 70% 45%)`;
}

/* ---------- Step 2: render simulated output ---------- */
function renderStep2() {
  const status = $("#statusList");
  status.innerHTML = "";
  const add = t => { const li=document.createElement("li"); li.textContent=t; status.appendChild(li); };
  add("Analyzing image...");
  add("Extracting attributes...");
  add("Drafting listing text...");
  add("Done. Review your draft below.");

  // image
  const imgEl = $("#draftImg");
  if (state.files.length) {
    imgEl.src = URL.createObjectURL(state.files[0]);
    imgEl.style.display = "block";
  } else {
    imgEl.src = "/swiftora_logo_transparent%20v2.png";
    imgEl.style.display = "block";
  }

  // listing text
  const desc = state.desc || "Vintage item";
  $("#listingCard").innerHTML = `
    <p><strong>${desc}</strong></p>
    <p>Classic vintage piece with nice character. Ships fast and packed with care.</p>
    <div class="chips" style="margin-top:6px">
      <span class="chip">#vintage</span>
      <span class="chip">#collectible</span>
      <span class="chip">#resale</span>
      <span class="chip">#decor</span>
      <span class="chip">#gift</span>
    </div>
  `;

  // comps (static sample)
  $("#compsCard").innerHTML = `
    <ul style="line-height:1.5">
      <li>Vintage piece, similar style <strong>$42</strong><br/><small>Sold · 8/1/2025</small></li>
      <li>Vintage item, comparable size <strong>$51</strong><br/><small>Sold · 7/25/2025</small></li>
      <li>Vintage item, good condition <strong>$49</strong><br/><small>Sold · 7/17/2025</small></li>
    </ul>
    <p style="margin-top:8px">Suggested price (demo): <strong>$${state.priceSuggested}</strong></p>
    <p><small>(Example comps only — live data coming in MVP.)</small></p>
  `;

  // attributes table
  $("#attrsCard").innerHTML = `
    <tr><td>Material</td><td>Unknown</td></tr>
    <tr><td>Color</td><td>Neutral</td></tr>
    <tr><td>Size</td><td>Approx.</td></tr>
    <tr><td>Era</td><td>Likely Vintage</td></tr>
    <tr><td>Condition</td><td>${state.condition || "Unspecified"}</td></tr>
  `;

  // confidence bars
  const conf = { Category:82, Era:66, Condition:74 };
  const cWrap = $("#confidenceCard");
  cWrap.innerHTML = "";
  Object.entries(conf).forEach(([label,val])=>{
    const row = document.createElement("div");
    row.className="conf-row";
    row.innerHTML = `
      <div class="conf-label">${label} <span style="float:right">${val}%</span></div>
      <div class="conf-outer"><div class="conf-fill" style="width:${val}%;background:${colorForPercent(val)}"></div></div>
    `;
    cWrap.appendChild(row);
  });

  // navigation
  $("#back2").onclick = ()=>goTo(1);
  $("#step2Btn").onclick = ()=>{
    renderStep3();
    goTo(3);
  };
}

/* ---------- Step 3: profit (P&L table) ---------- */
function money(n){ return n==null ? "—" : `$${n.toFixed(2)}`; }

function calcProfit() {
  const price = state.priceSuggested;
  const fee = price * (state.feePct/100);
  const ship = state.shipping || 0;
  const cost = state.cost || 0;
  const net = price - (fee + ship + cost);
  const profit = net; // no other costs in demo
  const roi = cost>0 ? (profit/cost)*100 : null;
  return {price,fee,ship,cost,net,profit,roi};
}

function renderStep3() {
  // defaults to resilient values
  $("#adj-ship").value = state.shipping;
  $("#adj-fee").value = state.feePct;
  $("#pPrice").textContent = money(state.priceSuggested);
  updatePNL();

  $("#adj-ship").oninput = (e)=>{ state.shipping = parseFloat(e.target.value||"0")||0; updatePNL(); };
  $("#adj-fee").oninput = (e)=>{ state.feePct = parseFloat(e.target.value||"0")||0; updatePNL(); };

  $("#back3").onclick = ()=>goTo(2);

  // **CHANGED**: render XP/meter before moving to Step 4
  $("#step3Btn").onclick = ()=>{
    renderStep4();
    goTo(4);
  };
}

function updatePNL() {
  const {price,fee,ship,cost,net,profit,roi} = calcProfit();
  $("#pPrice").textContent  = money(price);
  $("#pFees").textContent   = money(fee);
  $("#pShip").textContent   = money(ship);
  $("#pCost").textContent   = cost>0 ? money(cost) : "$—";
  $("#pNet").textContent    = money(net);
  $("#pProfit").textContent = money(profit);
  $("#pROI").textContent    = (roi!=null) ? (roi.toFixed(0)+"%") : "—";
}

/* ---------- Step 4 XP + meter (NEW) ---------- */
function computeXP(){
  let xp = 0;
  if (state.files.length) xp += 8;      // photos uploaded
  if (state.desc)         xp += 4;      // description provided
  if (state.condition)    xp += 3;      // picked a condition
  if (state.cost > 0)     xp += 2;      // entered cost
  return xp;                            // simple demo scoring
}

function renderStep4(){
  const xp = computeXP();
  const xpEl = $("#earnedXP");
  if (xpEl) xpEl.textContent = xp;
  const meter = $("#levelMeter");
  if (meter) meter.style.width = Math.min(100, xp * 5) + "%"; // 5% per XP
}

/* ---------- Step 4/5 nav ---------- */
function bindStep45() {
  $("#back4").onclick = ()=>goTo(3);
  $("#step4Btn").onclick = ()=>goTo(5);
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  bindStep1();
  bindStep45();
});
