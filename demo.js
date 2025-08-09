/* ---------- Sample data ---------- */
const EXAMPLES = [
  {
    title:'Vintage Mid-Century Amber Glass Vase',
    desc:'Elegant ribbed vase from the 1960s with warm amber glass—perfect for MCM decor.',
    price:'$24.99',
    comps:[{title:'Vintage Art Deco Candle Stick',price:'$22.00'},{title:'Solid Brass Candle Pair',price:'$27.50'},{title:'Antique Bronze Lantern',price:'$30.00'}],
    fees:{ship:8.75,fee:2.00}
  },
  {
    title:'Retro 80s Quartz Flip Clock',
    desc:'Classic 1980s flip clock with bold orange digits and quartz movement.',
    price:'$42.00',
    comps:[{title:'Retro Digital Desk Clock',price:'$40.00'},{title:'Vintage Flip Alarm Clock',price:'$39.50'},{title:'1980s Quartz Flip Clock',price:'$45.00'}],
    fees:{ship:6.20,fee:2.80}
  },
  {
    title:'Antique Brass Candle Holder',
    desc:'Ornate solid brass with natural patina and Victorian-inspired detailing.',
    price:'$18.50',
    comps:[{title:'Carved Wooden Totem',price:'$16.00'},{title:'Folk Art Wooden Figure',price:'$20.50'},{title:'Vintage Wooden Carving',price:'$19.00'}],
    fees:{ship:5.10,fee:1.60}
  }
];

/* ---------- Helpers ---------- */
const $    = (s)=>document.querySelector(s);
const $$   = (s)=>Array.from(document.querySelectorAll(s));
const num  = (x)=>{const n=parseFloat(String(x).replace(/[^0-9.]/g,''));return isNaN(n)?0:n;};
const row  = (k,v)=>`<tr><td>${k}</td><td>${v}</td></tr>`;
const delay=(ms)=>new Promise(r=>setTimeout(r,ms));

/* ---------- Gamification ---------- */
const xp={val:0,level:1};
function addXP(n){xp.val+=n;if(xp.val>=100){xp.level++;xp.val-=100}$('#xpValue').textContent=xp.val;$('#levelBadge').textContent=`Lv ${xp.level}`;$('#levelMeter').style.width=`${xp.val}%`;}
function progress(step){const pct=[20,40,60,80,100][step-1]||20;$('#progressBar').style.width=`${pct}%`;$$('#stepper .dot').forEach((d,i)=>d.classList.toggle('active',i<step));}

/* ---------- Navigation ---------- */
let current=1;
function show(step){current=step;$$('.screen').forEach((el,i)=>el.classList.toggle('active',i+1===step));progress(step);window.scrollTo({top:0,behavior:'smooth'});}

/* ---------- Step 1 validation ---------- */
let uploadEl, previewEl, descEl, condHidden, costEl, next1, err1;
function checkStep1(){
  const okPhoto = uploadEl && uploadEl.files && uploadEl.files.length>0;
  const okDesc  = (descEl.value||'').trim().length>4;
  const okCond  = (condHidden.value||'')!=='';
  const okCost  = costEl.value!=='' && !isNaN(Number(costEl.value));
  next1.disabled = !(okPhoto && okDesc && okCond && okCost);
  const msgs=[];
  if(!okPhoto) msgs.push('Add a photo');
  if(!okDesc)  msgs.push('Describe your item');
  if(!okCond)  msgs.push('Choose a condition');
  if(!okCost)  msgs.push('Enter your cost');
  err1.textContent = msgs.length? ('Please complete: ' + msgs.join(' • ')) : '';
}

/* ---------- DOM Ready ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  // refs
  uploadEl=$('#upload'); previewEl=$('#preview');
  descEl=$('#field-desc'); condHidden=$('#field-condition'); costEl=$('#field-cost');
  next1=$('#step1Btn'); err1=$('#step1Errors');

  // chips
  $$('#condChips .chip').forEach(ch=>{
    ch.addEventListener('click',()=>{
      $$('#condChips .chip').forEach(x=>x.classList.remove('active'));
      ch.classList.add('active');
      condHidden.value = ch.dataset.value;
      addXP(5);
      checkStep1();
    });
  });

  // photo preview
  const onPhoto=()=>{
    if(uploadEl.files?.length){
      const f=uploadEl.files[0];
      previewEl.src=URL.createObjectURL(f);
      previewEl.style.display='block';
      addXP(10);
    }
    checkStep1();
  };
  uploadEl.addEventListener('change',onPhoto);
  uploadEl.addEventListener('input',onPhoto);

  // typing listeners
  ['input','change'].forEach(e=>{
    descEl.addEventListener(e,checkStep1);
    costEl.addEventListener(e,checkStep1);
  });

  // next buttons
  next1.addEventListener('click',async()=>{
    if(next1.disabled) return;
    addXP(15);
    show(2);
    await runPipeline();
  });
  $('#step2Btn').addEventListener('click',()=>{addXP(10);show(3);});
  $('#step3Btn').addEventListener('click',()=>{addXP(10);show(4);$('#earnedXP').textContent=(xp.val+(xp.level-1)*100);});
  $('#step4Btn').addEventListener('click',()=>{addXP(5);show(5);});

  // start
  show(1);
});

/* ---------- “AI” pipeline (simulated) ---------- */
async function runPipeline(){
  const status=$('#statusList'), listing=$('#listingCard'), comps=$('#compsCard'), conf=$('#confidenceCard'), attrs=$('#attrsCard'), profit=$('#profitCard');
  status.innerHTML=listing.innerHTML=comps.innerHTML=conf.innerHTML=attrs.innerHTML=profit.innerHTML='';

  // parse “AI style” from natural description (very light heuristics)
  const d=(descEl.value||'').toLowerCase();
  const colorMatch = (d.match(/\b(amber|brass|green|blue|red|clear|brown|white|black|gold|silver)\b/)||[])[0]||'—';
  const brandMatch = (d.match(/\b(fenton|westclox|pyrex|corning|lenox|mccoy)\b/)||[])[0]||'—';
  const categoryGuess = (d.includes('vase')?'Glassware': d.includes('clock')?'Clocks': d.includes('ring')?'Jewelry': d.includes('toy')?'Toys':'Decor');

  const ex = EXAMPLES[Math.floor(Math.random()*EXAMPLES.length)];
  const base = num(ex.price);
  const suggested = Math.max(base-1,10);

  // stream status
  pushStatus('Analyzing image…',status); await delay(450);
  pushStatus('Reading description…',status); await delay(400);
  pushStatus('Extracting attributes…',status); await delay(400);
  pushStatus('Finding visually similar items…',status); await delay(500);
  pushStatus('Pulling sold prices (last 90 days)…',status); await delay(600);

  // comps
  comps.innerHTML = '<h4>Closest matches</h4>' + renderList(ex.comps);

  // listing
  const title = buildTitle({ baseTitle: ex.title, color: colorMatch!=='—'?colorMatch:null, brand: brandMatch!=='—'?capFirst(brandMatch):null });
  const description = `${ex.desc} Parsed from your text → Category: ${categoryGuess}. Color: ${colorMatch}. Brand: ${capFirst(brandMatch)}.`;
  listing.innerHTML =
    `<p><strong>Title:</strong> ${title}</p>`+
    `<p><strong>Description:</strong> ${description}</p>`+
    `<p><strong>Suggested Price:</strong> $${suggested.toFixed(2)} <span style="color:#777">(sample)</span></p>`;

  // attrs
  attrs.innerHTML =
    row('Category (guessed)', categoryGuess) +
    row('Condition', $('#field-condition').value || '—') +
    row('Color (parsed)', colorMatch) +
    row('Brand/Markings (parsed)', capFirst(brandMatch)) +
    row('Photo Quality', 'Good lighting, neutral background');

  // confidence
  pushStatus('Scoring confidence…',status); await delay(400);
  const score = Math.floor(Math.random()*26)+70;
  conf.innerHTML = `<p><strong>Confidence Score:</strong> ${score}%</p><p class="hint">Higher means better agreement with recent sales.</p>`;

  // profit
  const ship=ex.fees.ship, fee=ex.fees.fee, cost=num($('#field-cost').value);
  renderProfit({ ship, fee, cost, net: suggested-ship-fee-cost });

  // live adjust
  $('#adj-ship').value = ship.toFixed(2);
  $('#adj-fee').value = fee.toFixed(2);
  const recompute=()=>{
    const s=num($('#adj-ship').value||ship);
    const f=num($('#adj-fee').value||fee);
    renderProfit({ ship:s, fee:f, cost, net: suggested - s - f - cost });
  };
  $('#adj-ship').addEventListener('input',recompute);
  $('#adj-fee').addEventListener('input',recompute);
}

function pushStatus(msg,ul){const li=document.createElement('li');li.textContent=msg;ul.appendChild(li);}
function renderList(list){return '<ul style="margin-left:1rem; padding-left:0.5rem;">'+list.map(i=>`<li>${i.title} — <em>${i.price}</em></li>`).join('')+'</ul>';}
function buildTitle({baseTitle,color,brand}){const parts=[]; if(brand)parts.push(brand); if(color)parts.push(capFirst(color)); parts.push(baseTitle); return parts.join(' ').replace(/\s+/g,' ').trim();}
function capFirst(s){return !s||s==='—'? '—' : s.charAt(0).toUpperCase()+s.slice(1);}
function renderProfit({ship,fee,cost,net}){$('#profitCard').innerHTML=
  `<p><strong>Shipping:</strong> $${Number(ship).toFixed(2)}</p>`+
  `<p><strong>Platform Fees:</strong> $${Number(fee).toFixed(2)}</p>`+
  `<p><strong>Item Cost:</strong> $${Number(cost).toFixed(2)}</p>`+
  `<p><strong>Net Profit:</strong> $${Number(net).toFixed(2)}</p>`;}
