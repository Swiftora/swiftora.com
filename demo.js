// Swiftora Demo – photos optional, multi-image, back buttons (v14)
(() => {
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];

  // Step 1
  const upload=$("#upload"), thumbs=$("#thumbs"), coverageFill=$("#coverageFill"),
        coverageLabel=$("#coverageLabel"), coverageWrap=$("#coverageWrap"),
        step1Btn=$("#step1Btn"), desc=$("#field-desc"),
        condChips=$("#condChips"), condHidden=$("#field-condition"),
        cost=$("#field-cost"), step1Errors=$("#step1Errors");

  // Step 2/3/4
  const statusList=$("#statusList"), listingCard=$("#listingCard"),
        compsCard=$("#compsCard"), attrsCard=$("#attrsCard"), confidenceCard=$("#confidenceCard");
  const profitCard=$("#profitCard"), adjShip=$("#adj-ship"), adjFee=$("#adj-fee");
  const progressBar=$("#progressBar"), dots=$$("#stepper .dot"),
        screens=[$("#step1"),$("#step2"),$("#step3"),$("#step4"),$("#step5")];
  const levelMeter=$("#levelMeter"), earnedXP=$("#earnedXP");

  const state={
    images:[], desc:"", condition:"", cost:NaN,
    suggested:48, ship:12, feeRate:0.13, feeFixed:0.30, xp:0, level:1
  };

  const angles=["Front","Back","Base/Mark","Close-up","Other"];

  // Nav
  const setProgress=p=>progressBar.style.width=p+"%";
  const goto=i=>{ screens.forEach((el,idx)=>el.classList.toggle("active",idx===i));
    dots.forEach((d,idx)=>d.classList.toggle("active",idx<=i));
    setProgress([20,40,60,80,100][i]||20); window.scrollTo({top:0,behavior:"smooth"}); };

  // Thumbs
  function addPreview(url){
    const wrap=document.createElement("div");
    wrap.className="preview-item";
    wrap.innerHTML=`
      <img src="${url}" alt="">
      <select class="angle">${angles.map(a=>`<option value="${a}">${a}</option>`).join("")}</select>`;
    thumbs.appendChild(wrap);
    const select=wrap.querySelector(".angle");
    const item={url, angle:select.value};
    state.images.push(item);
    select.addEventListener("change",()=>{item.angle=select.value; refreshCoverage();});
  }

  function refreshCoverage(){
    if(state.images.length===0){ coverageWrap.style.display="none"; return; }
    coverageWrap.style.display="";
    const have=new Set(state.images.map(i=>i.angle));
    let score=0; if(have.has("Front")) score++; if(have.has("Close-up")) score++;
    if(have.has("Back")||have.has("Base/Mark")) score++;
    const pct=[0,34,67,100][score]||0;
    coverageFill.style.width=pct+"%"; coverageLabel.textContent=score+"/3";
  }

  upload.addEventListener("change",()=>{
    thumbs.innerHTML=""; state.images.length=0;
    const files=[...upload.files||[]];
    files.slice(0,12).forEach(f=>{
      const rd=new FileReader();
      rd.onload=e=>addPreview(e.target.result);
      rd.readAsDataURL(f);
    });
    setTimeout(refreshCoverage,0);
  });

  condChips.addEventListener("click",e=>{
    const b=e.target.closest(".chip"); if(!b) return;
    state.condition=b.dataset.value; condHidden.value=state.condition;
    $$("#condChips .chip").forEach(x=>x.classList.toggle("active",x===b));
  });

  $("#step1Btn").addEventListener("click",()=>{
    state.desc=(desc.value||"").trim();
    state.cost=parseFloat(cost.value);
    buildStep2();
    goto(1);
  });

  $("#back2").addEventListener("click",()=>goto(0));
  $("#back3").addEventListener("click",()=>goto(1));
  $("#back4").addEventListener("click",()=>goto(2));
  $("#step2Btn").addEventListener("click",()=>{renderProfit(); goto(2);});
  $("#step3Btn").addEventListener("click",()=>{awardXP(); goto(3);});
  $("#step4Btn").addEventListener("click",()=>goto(4));

  // Step 2
  function buildStep2(){
    statusList.innerHTML="";
    log(state.images.length? "Analyzing images…" : "No images supplied — using generic assumptions.");
    log(state.desc? "Extracting attributes from your description…" : "No description supplied.");
    log("Drafting listing text…");

    const title=draftTitle(state.desc,state.condition), body=draftBody(state.desc,state.condition), tags=draftTags(state.desc);
    const first=state.images[0]?.url;
    listingCard.innerHTML=`
      <div class="listing">
        ${first?`<img src="${first}" alt="" style="width:100%;max-height:220px;object-fit:cover;border-radius:12px;border:1px solid #e8ebf3;margin-bottom:10px">`:""}
        <div class="listing-title">${esc(title)}</div>
        <div class="listing-body">${esc(body)}</div>
        <div class="listing-tags">${tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join("")}</div>
      </div>`;

    const comps=sampleComps(state.desc);
    state.suggested=Math.round(avg(comps.map(c=>c.price)));
    compsCard.innerHTML=`
      <ul class="comps">
        ${comps.map(c=>`<li><div class="comp-line"><span class="comp-title">${esc(c.title)}</span><span class="comp-price">$${c.price}</span></div><div class="comp-meta">Sold • ${c.date}</div></li>`).join("")}
      </ul>
      <div class="comp-summary">Suggested price (demo): <strong>$${state.suggested}</strong></div>
      <small>(Example comps only — live data coming in MVP.)</small>`;

    const attrs=extractAttrs(state.desc,state.condition,state.images);
    attrsCard.innerHTML=`<tbody>${Object.entries(attrs).map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody>`;

    const conf=[{label:"Category",pct:82},{label:"Era",pct:66},{label:"Material",pct:74},{label:"Condition",pct: state.condition?95:76}];
    confidenceCard.innerHTML=conf.map(c=>`<div class="bar"><span>${c.label}</span><div class="bar-outer"><div class="bar-inner ${colorClass(c.pct)}" style="width:${c.pct}%"></div></div><span class="pct">${c.pct}%</span></div>`).join("");

    log("Done. Review your draft below.");
  }
  function log(t){const li=document.createElement("li"); li.textContent=t; statusList.appendChild(li);}

  // Step 3
  function renderProfit(){
    const ship=isNum(adjShip.value)?parseFloat(adjShip.value):12;
    const feeRate=isNum(adjFee.value)?(parseFloat(adjFee.value)/100):state.feeRate;
    const gross=state.suggested;
    const fees=+(gross*feeRate+state.feeFixed).toFixed(2);
    const net=+(gross-fees-ship).toFixed(2);
    const costVal=isNum(state.cost)?state.cost:0;
    const profit=+(net-costVal).toFixed(2);
    const roi=costVal>0?Math.round((profit/costVal)*100):(profit>0?999:0);
    profitCard.innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;text-align:center">
        <div><strong>Price</strong><div>$${gross}</div></div>
        <div><strong>Fees</strong><div>$${fees}</div></div>
        <div><strong>Shipping</strong><div>$${ship}</div></div>
        <div><strong>Cost</strong><div>$${isNum(state.cost)?costVal.toFixed(2):"—"}</div></div>
        <div><strong>Net</strong><div>$${net}</div></div>
        <div><strong>Profit</strong><div>${profit>=0?"":"-"}$${Math.abs(profit).toFixed(2)}</div></div>
        <div><strong>ROI</strong><div>${isNum(state.cost)?roi+"%":"—"}</div></div>
      </div>
      <small>Fee rate: ${(feeRate*100).toFixed(1)}% + $${state.feeFixed.toFixed(2)} (simulated)</small>`;
    if(!adjShip.value) adjShip.value="12.00";
    if(!adjFee.value) adjFee.value=(state.feeRate*100).toFixed(1);
  }

  function awardXP(){
    let xp=40;
    const have=new Set(state.images.map(i=>i.angle));
    if(have.has("Front")) xp+=10;
    if(have.has("Back")||have.has("Base/Mark")) xp+=10;
    if(have.has("Close-up")) xp+=10;
    if(state.images.length>=4) xp+=10;
    if((state.desc||"").length>40) xp+=10;
    if(state.condition) xp+=10;
    if(isNum(state.cost)) xp+=10;
    state.xp+=xp; earnedXP.textContent=xp;
    const pct=Math.min(100, Math.round((state.xp%150)/150*100)); levelMeter.style.width=pct+"%";
  }

  // helpers
  const isNum=v=>Number.isFinite(parseFloat(v));
  const draftTitle=(t,c)=>`${(t||"Vintage item").replace(/\s+/g," ").trim().replace(/^./,m=>m.toUpperCase())}${c?" • "+c:""}`;
  const draftBody=(t,c)=>`${(t||"Classic vintage piece with nice character.").trim()} ${c?`Condition: ${c}.`:""} Ships fast and packed with care.`;
  const draftTags=t=>[...new Set([...(t.toLowerCase().match(/[a-z0-9-]+/g)||[]).slice(0,12),"vintage","collectible","resale","decor","gift"])].slice(0,10);
  function sampleComps(t){const s=t.toLowerCase();const hint=s.includes("amber")?"Amber":s.includes("silver")?"Silver":s.includes("ceramic")?"Ceramic":"Vintage";const now=new Date();const d=o=>new Date(now.getTime()-o*86400000).toLocaleDateString();return[{title:`${hint} piece, similar style`,price:42,date:d(8)},{title:`${hint} item, comparable size`,price:51,date:d(15)},{title:`${hint} item, good condition`,price:49,date:d(23)}]}
  function extractAttrs(t,c,imgs){const s=t.toLowerCase();const material=/glass|ceramic|porcelain|wood|metal|brass|bronze|silver|gold|plastic|resin/.exec(s)?.[0]||"Unknown";const color=/amber|blue|green|red|pink|white|black|brown|clear|smoke|yellow|violet|orange/.exec(s)?.[0]||"Neutral";const size=/(\d+(\.\d+)?)\s?(in|inch|inches|cm|mm)/.exec(s)?.[0]||"Approx.";const era=/(1920s|1930s|1940s|1950s|1960s|1970s|1980s|1990s|mid-?century|art deco|victorian|edwardian)/.exec(s)?.[0]||"Likely vintage";const have=new Set(imgs.map(i=>i.angle));const photoCov=`${have.has("Front")?"Front ✓":"Front —"}, ${have.has("Back")||have.has("Base/Mark")?"Back/Base ✓":"Back/Base —"}, ${have.has("Close-up")?"Close-up ✓":"Close-up —"}`;const cap=x=>x?x.charAt(0).toUpperCase()+x.slice(1):x;const title=x=>x.split(/\s+/).map(cap).join(" ");return{Material:cap(material),Color:cap(color),Size:size.replace(/inch(es)?/,"in"),Era:title(era),Photos:photoCov,Condition:c||"Good"}}
  const avg=a=>Math.round(a.reduce((x,y)=>x+y,0)/(a.length||1));
  const esc=s=>(s+"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const colorClass=p=>p>=80?"ok":p>=60?"warn":"low";
})();
