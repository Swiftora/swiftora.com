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
  $("#step3Btn").addEv
