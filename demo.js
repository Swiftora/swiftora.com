(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  const upload = $("#upload");
  const preview = $("#preview");
  const desc = $("#field-desc");
  const condChips = $("#condChips");
  const condHidden = $("#field-condition");
  const cost = $("#field-cost");
  const step1Btn = $("#step1Btn");
  const step1Errors = $("#step1Errors");

  const statusList = $("#statusList");
  const listingCard = $("#listingCard");
  const compsCard = $("#compsCard");
  const attrsCard = $("#attrsCard");
  const confidenceCard = $("#confidenceCard");

  const profitCard = $("#profitCard");
  const adjShip = $("#adj-ship");
  const adjFee = $("#adj-fee");

  const progressBar = $("#progressBar");
  const dots = $$("#stepper .dot");
  const screens = [$("#step1"), $("#step2"), $("#step3"), $("#step4"), $("#step5")];

  const levelMeter = $("#levelMeter");
  const earnedXP = $("#earnedXP");

  const state = {
    file: null,
    desc: "",
    condition: "",
    cost: 0,
    suggested: 48,
    ship: 12,
    feeRate: 0.13,
    feeFixed: 0.30,
    xp: 0,
    level: 1
  };

  const setProgress = (pct) => progressBar.style.width = pct + "%";
  const goto = (i) => {
    screens.forEach((el, idx) => el.classList.toggle("active", idx === i));
    dots.forEach((d, idx) => d.classList.toggle("active", idx <= i));
    setProgress([20,40,60,80,100][i] || 20);
  };

  const validateStep1 = () => {
    const errs = [];
    if (!state.file) errs.push("Please upload a photo.");
    if (!state.desc.trim()) errs.push("Please describe your item.");
    if (!state.condition) errs.push("Select a condition.");
    const c = parseFloat(cost.value);
    if (Number.isNaN(c) || c < 0) errs.push("Enter your cost (0 or greater).");
    step1Errors.textContent = errs.join(" ");
    step1Btn.disabled = errs.length > 0;
  };

  const selectCondition = (val) => {
    state.condition = val;
    condHidden.value = val;
    $$("#condChips .chip").forEach((b) => b.classList.toggle("active", b.dataset.value === val));
    validateStep1();
  };

  upload.addEventListener("change", () => {
    const f = upload.files?.[0];
    state.file = f || null;
    if (f) {
      const reader = new FileReader();
      reader.onload = (e) => { preview.src = e.target.result; preview.style.display = "block"; };
      reader.readAsDataURL(f);
    } else {
      preview.removeAttribute("src");
      preview.style.display = "none";
    }
    validateStep1();
  });

  condChips.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    selectCondition(b.dataset.value);
  });

  ["input","blur","keyup"].forEach(ev => {
    desc.addEventListener(ev, () => { state.desc = desc.value; validateStep1(); });
    cost.addEventListener(ev, () => { validateStep1(); });
  });

  $("#step1Btn").addEventListener("click", () => {
    state.cost = parseFloat(cost.value) || 0;
    simulateListingAndComps();
    goto(1);
  });

  $("#step2Btn").addEventListener("click", () => { renderProfit(); goto(2); });
  $("#step3Btn").addEventListener("click", () => { simulateXP(); goto(3); });
  $("#step4Btn").addEventListener("click", () => goto(4));

  function simulateListingAndComps() {
    statusList.innerHTML = "";
    appendStatus("Analyzing image (simulated)...");
    appendStatus("Extracting attributes from your description...");
    appendStatus("Drafting listing text...");

    const title = draftTitle(state.desc, state.condition);
    const body = draftBody(state.desc, state.condition);
    const tags = draftTags(state.desc);

    listingCard.innerHTML = `
      <div class="listing">
        <div class="listing-title">${esc(title)}</div>
        <div class="listing-body">${esc(body)}</div>
        <div class="listing-tags">${tags.map(t => `<span class="tag">#${esc(t)}</span>`).join("")}</div>
      </div>
    `;

    const comps = sampleComps(state.desc);
    state.suggested = Math.round(avg(comps.map(c => c.price)));
    compsCard.innerHTML = `
      <ul class="comps">
        ${comps.map(c => `
          <li>
            <div class="comp-line">
              <span class="comp-title">${esc(c.title)}</span>
              <span class="comp-price">$${c.price}</span>
            </div>
            <div class="comp-meta">Sold • ${c.date}</div>
          </li>
        `).join("")}
      </ul>
      <div class="comp-summary">Suggested price (demo): <strong>$${state.suggested}</strong></div>
      <small>(Example comps only — live data coming in MVP.)</small>
    `;

    const attrs = extractAttributes(state.desc, state.condition);
    attrsCard.innerHTML = `
      <tbody>
        ${Object.entries(attrs).map(([k,v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}
      </tbody>
    `;

    const conf = [
      {label:"Category", pct: 82},
      {label:"Era", pct: 66},
      {label:"Material", pct: 74},
      {label:"Condition", pct: 95}
    ];
    confidenceCard.innerHTML = conf.map(c => `
      <div class="bar">
        <span>${c.label}</span>
        <div class="bar-outer"><div class="bar-inner ${colorClass(c.pct)}" style="width:${c.pct}%"></div></div>
        <span class="pct">${c.pct}%</span>
      </div>
    `).join("");

    appendStatus("Done. Review your draft below.");
  }

  function appendStatus(line){ const li=document.createElement("li"); li.textContent=line; statusList.appendChild(li); }

  function renderProfit(){
    const ship = Number.isFinite(parseFloat(adjShip.value)) ? parseFloat(adjShip.value) : state.ship;
    const feeRate = Number.isFinite(parseFloat(adjFee.value)) ? (parseFloat(adjFee.value)/100) : state.feeRate;
    const gross = state.suggested;
    const fees = +(gross * feeRate + state.feeFixed).toFixed(2);
    const net = +(gross - fees - ship).toFixed(2);
    const profit = +(net - state.cost).toFixed(2);
    const roi = state.cost > 0 ? Math.round((profit / state.cost) * 100) : (profit > 0 ? 999 : 0);

    profitCard.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;text-align:center">
        <div><strong>Price</strong><div>$${gross}</div></div>
        <div><strong>Fees</strong><div>$${fees}</div></div>
        <div><strong>Shipping</strong><div>$${ship}</div></div>
        <div><strong>Cost</strong><div>$${state.cost.toFixed(2)}</div></div>
        <div><strong>Net</strong><div>$${net}</div></div>
        <div><strong>Profit</strong><div class="${profit>=0?'':'neg'}">$${profit}</div></div>
        <div><strong>ROI</strong><div>${roi}%</div></div>
      </div>
      <small>Fee rate: ${(feeRate*100).toFixed(1)}% + $${state.feeFixed.toFixed(2)} (simulated)</small>
    `;
    if (!adjShip.value) adjShip.value = state.ship.toFixed(2);
    if (!adjFee.value) adjFee.value = (state.feeRate*100).toFixed(1);
  }

  function simulateXP(){
    let xp = 30;
    if (state.file) xp += 25;
    if (state.desc.length > 40) xp += 20;
    if (state.condition) xp += 10;
    if (state.cost > 0) xp += 15;
    state.xp += xp;
    earnedXP.textContent = xp;
    const pct = Math.min(100, Math.round((state.xp % 150) / 150 * 100));
    levelMeter.style.width = pct + "%";
  }

  function draftTitle(text, condition){
    const base=(text||"Vintage item").replace(/\s+/g," ").trim();
    const first=base.charAt(0).toUpperCase()+base.slice(1);
    return `${first} • ${condition||"Good condition"}`;
  }
  function draftBody(text, condition){
    const clean=text.trim().replace(/\s+/g," ");
    return `${clean} ${condition?`Condition: ${condition}.`:""} Ships fast and packed with care.`;
  }
  function draftTags(text){
    const words=(text.toLowerCase().match(/[a-z0-9-]+/g)||[]).slice(0,12);
    const base=["vintage","collectible","resale","decor","gift"];
    return [...new Set([...words,...base])].slice(0,10);
  }
  function sampleComps(text){
    const t=text.toLowerCase();
    const hint=t.includes("amber")?"Amber":t.includes("silver")?"Silver":t.includes("ceramic")?"Ceramic":"Vintage";
    const now=new Date(); const d=(off)=>new Date(now.getTime()-off*86400000).toLocaleDateString();
    return [{title:`${hint} piece, similar style`,price:42,date:d(8)},
            {title:`${hint} item, comparable size`,price:51,date:d(15)},
            {title:`${hint} item, good condition`,price:49,date:d(23)}];
  }
  function extractAttributes(text, condition){
    const t=text.toLowerCase();
    const material=/glass|ceramic|porcelain|wood|metal|brass|bronze|silver|gold|plastic|resin/.exec(t)?.[0]||"Unknown";
    const color=/amber|blue|green|red|pink|white|black|brown|clear|smoke|yellow|violet|orange/.exec(t)?.[0]||"Neutral";
    const size=/(\d+(\.\d+)?)\s?(in|inch|inches|cm|mm)/.exec(t)?.[0]||"Approx.";
    const era=/(1920s|1930s|1940s|1950s|1960s|1970s|1980s|1990s|mid-?century|art deco|victorian|edwardian)/.exec(t)?.[0]||"Likely vintage";
    return {Material:cap(material),Color:cap(color),Size:size.replace(/inch(es)?/,"in"),Era:title(era),Condition:condition||"Good"};
  }

  const avg=(a)=>Math.round(a.reduce((x,y)=>x+y,0)/(a.length||1));
  const esc=(s)=>(s+"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const cap=(s)=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
  const title=(s)=>s.split(/\s+/).map(cap).join(" ");
  const colorClass=(p)=>p>=80?"ok":p>=60?"warn":"low";

  validateStep1(); goto(0);
})();
