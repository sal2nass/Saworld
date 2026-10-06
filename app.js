// منطق المنصة: أقسام -> كتب -> شروح -> قراءة صفحات + شرح المسألة + تكبير + دارك + متابعة
const SECTIONS = [
  { id:"aqida", name:"العقيدة" },
  { id:"hadith", name:"الحديث" },
  { id:"nahw", name:"النحو" },
  { id:"sarf", name:"الصرف" },
  { id:"fiqh", name:"الفقه" },
  { id:"faraid", name:"الفرائض" },
];
const BOOKS = {
  aqida: [{t:"كتاب التوحيد", a:"محمد بن عبد الوهاب", ok:true},{t:"الأصول الثلاثة", a:"محمد بن عبد الوهاب", ok:false},{t:"العقيدة الواسطية", a:"ابن تيمية", ok:false}],
  hadith: [{t:"عمدة الأحكام", a:"عبد الغني المقدسي", ok:true},{t:"بلوغ المرام", a:"ابن حجر العسقلاني", ok:false},{t:"الأربعون النووية", a:"يحيى النووي", ok:false}],
  nahw: [{t:"الآجرومية", a:"ابن آجروم", ok:true},{t:"قطر الندى", a:"ابن هشام الأنصاري", ok:false}],
  sarf: [{t:"نظم المقصود", a:"منظومة في علم الصرف", ok:false},{t:"شذا العرف", a:"أحمد الحملاوي", ok:false}],
  fiqh: [{t:"عمدة الفقه", a:"ابن قدامة المقدسي", ok:true},{t:"زاد المستقنع", a:"موسى الحجاوي", ok:true},{t:"دليل الطالب", a:"مرعي الكرمي", ok:false}],
  faraid: [{t:"متن الرحبية", a:"محمد الرحبي", ok:true}],
};
const SHURUH = {
  "عمدة الفقه": [
    {t:"شرح الشيخ صالح الفوزان", a:"صالح بن فوزان الفوزان", ok:true},
    {t:"شرح الشيخ ابن عثيمين", a:"محمد بن صالح العثيمين", ok:false},
    {t:"شرح الشيخ عبدالله البسام", a:"عبد الله البسام", ok:false},
  ],
  "كتاب التوحيد": [
    {t:"الملخص في شرح كتاب التوحيد", a:"صالح بن فوزان الفوزان", ok:true},
  ],
  "الآجرومية": [
    {t:"التحفة السنية بشرح المقدمة الآجرومية", a:"محمد محيي الدين عبد الحميد", ok:true},
    {t:"شرح الكفراوي", a:"حسن الكفراوي", ok:false},
  ],
  "متن الرحبية": [
    {t:"شرح الشيخ عبد المحسن القاسم", a:"عبد المحسن بن محمد القاسم", ok:true},
  ],
  "زاد المستقنع": [
    {t:"الشرح الممتع للشيخ ابن عثيمين", a:"محمد بن صالح العثيمين", ok:true},
  ],
  "عمدة الأحكام": [
    {t:"تيسير العلام للشيخ عبد الله البسام", a:"عبد الله البسام", ok:true},
  ]
};
// سجل البيانات: اسم الكتاب -> كائن البيانات المحمّل من ملفات data/
function bookData(name){
  if(name==="عمدة الفقه") return window.UMDAT;
  if(name==="كتاب التوحيد") return window.TAWHID;
  if(name==="الآجرومية") return window.AJRUM;
  if(name==="متن الرحبية") return window.RAHBI;
  if(name==="زاد المستقنع") return window.ZAD;
  if(name==="عمدة الأحكام") return window.AHKAM;
  return window.UMDAT;
}
function bookSection(name){
  if(name==="كتاب التوحيد") return "العقيدة";
  if(name==="عمدة الأحكام") return "الحديث";
  if(name==="الآجرومية") return "النحو";
  if(name==="متن الرحبية") return "الفرائض";
  return "الفقه";
}

const $ = s=>document.querySelector(s);
const state = { section:null, book:null, sharh:null, page:1, masala:null, zoom:100 };
const LS = "doros-platform-v1";
function save(){ localStorage.setItem(LS, JSON.stringify({section:state.section,book:state.book,sharh:state.sharh,page:state.page,masala:state.masala,zoom:state.zoom,theme:document.documentElement.dataset.theme})); }
function load(){ try{return JSON.parse(localStorage.getItem(LS));}catch{return null;} }

// ثيم + تكبير
function applyZoom(){ document.documentElement.style.fontSize = (16*state.zoom/100)+"px"; $("#zoomVal").textContent = state.zoom+"%"; }
$("#zoomIn").onclick = ()=>{ state.zoom=Math.min(200,state.zoom+10); applyZoom(); save(); };
$("#zoomOut").onclick = ()=>{ state.zoom=Math.max(80,state.zoom-10); applyZoom(); save(); };
$("#themeBtn").onclick = ()=>{
  const d = document.documentElement.dataset.theme==="dark"?"light":"dark";
  document.documentElement.dataset.theme=d; $("#themeBtn").textContent = d==="dark"?"☀️ نهاري":"🌙 ليلي"; save();
};

// تنقل
function go(id){ document.querySelectorAll(".view").forEach(v=>v.classList.remove("active")); $("#"+id).classList.add("active"); window.scrollTo({top:0}); }
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));

// أقسام: اسم القسم فقط
function renderSections(){
  $("#sectionsGrid").innerHTML = SECTIONS.map(s=>`<div class="card sec" data-s="${s.id}"><h3>${s.name}</h3></div>`).join("");
  document.querySelectorAll("#sectionsGrid .card").forEach(c=>c.onclick=()=>{
    state.section=c.dataset.s; renderBooks(); go("view-books");
  });
}
function renderBooks(){
  const sec = SECTIONS.find(s=>s.id===state.section);
  $("#booksTitle").textContent = "كتب قسم: "+sec.name;
  const list = BOOKS[state.section]||[];
  $("#booksGrid").innerHTML = `<div class="vlist">`+list.map(b=>`<div class="row ${b.ok?"":"disabled"}" data-b="${b.t}"><div><h3>${b.t}</h3><p class="muted">${b.a||""}</p></div>${b.ok?'<span class="tag">ادخل</span>':'<span class="soon">قريبًا</span>'}</div>`).join("")+`</div>`;
  document.querySelectorAll("#booksGrid .row").forEach(c=>c.onclick=()=>{
    const b=(BOOKS[state.section]||[]).find(x=>x.t===c.dataset.b);
    if(!b||!b.ok){ alert("هذا الكتاب سيُضاف لاحقًا."); return; }
    state.book=b.t; renderShuruh(); go("view-shuruh");
  });
}
function renderShuruh(){
  $("#shuruhTitle").textContent = "شروح كتاب: "+state.book;
  const list = SHURUH[state.book]||[];
  $("#shuruhGrid").innerHTML = `<div class="vlist">`+list.map(s=>`<div class="row ${s.ok?"":"disabled"}" data-s="${s.t}"><div><h3>${s.t}</h3><p class="muted">${s.a||""}</p></div>${s.ok?'<span class="tag">اختر وابدأ</span>':'<span class="soon">قريبًا</span>'}</div>`).join("")+`</div>`;
  document.querySelectorAll("#shuruhGrid .row").forEach(c=>c.onclick=()=>{
    const s=(SHURUH[state.book]||[]).find(x=>x.t===c.dataset.s);
    if(!s||!s.ok){ alert("هذا الشرح سيُضاف لاحقًا."); return; }
    state.sharh=s.t; state.page=1; state.masala=null; enterRead(); go("view-read");
  });
}

// قراءة
const PER_PAGE_VIEW = 2; // صفحتين متن في الشاشة
let curBab = "الكل";
function cur(){ return bookData(state.book); }
function doneKey(id){ return "done-"+state.book+"-"+id; }
function enterRead(){
  const D = cur();
  $("#readTitle").textContent = state.book+" — "+state.sharh;
  $("#readSub").textContent = D.author;
  const babs = ["الكل", ...new Set(D.pages.map(p=>p.bab))];
  const keep = babs.includes(curBab)?curBab:"الكل"; curBab = keep;
  $("#babSelect").innerHTML = babs.map(b=>`<option>${b}</option>`).join("");
  $("#babSelect").value = curBab;
  $("#searchBox").value = "";
  $("#crumbs").textContent = `القسم: ${bookSection(state.book)} › الكتاب: ${state.book} › الشرح: ${state.sharh}`;
  $("#readHint").textContent = "نقرة واحدة = تعليم كمقروء • نقرتان سريعتان على المسألة = عرض شرحها كاملًا";
  renderPages(); save();
}
function filteredPages(){
  const D = cur();
  let ps = D.pages;
  if(curBab!=="الكل") ps = ps.filter(p=>p.bab===curBab);
  const q = $("#searchBox").value.trim();
  if(q) ps = ps.filter(p=> p.bab.includes(q)||p.masael.some(m=>m.matn.includes(q)||m.sharh.includes(q)));
  return ps;
}
function renderPages(){
  const ps = filteredPages();
  const totalChunks = Math.max(1, Math.ceil(ps.length/PER_PAGE_VIEW));
  state.page = Math.min(Math.max(1,state.page), totalChunks);
  const slice = ps.slice((state.page-1)*PER_PAGE_VIEW, state.page*PER_PAGE_VIEW);
  $("#pageInfo").textContent = `صفحة ${state.page} / ${totalChunks}`;
  $("#pagesList").innerHTML = slice.map(p=>`
    <div class="page" id="pg${p.id}">
      <h3>${p.kitab} — ${p.bab} <small class="muted">(ص ${p.id})</small></h3>
      ${p.masael.map(m=>`<div class="masala ${state.masala===m.id?"active":""}" data-m="${m.id}"><span class="m-num">مسألة ${m.id}</span>${m.matn}</div>`).join("")}
    </div>`).join("") || `<p class="muted">لا نتائج. جرّب كلمة أخرى.</p>`;
  document.querySelectorAll(".masala").forEach(el=>attachPress(el));
  const D = cur();
  const done = D.flat.filter(m=>+localStorage.getItem(doneKey(m.id))).length;
  $("#progressBar").style.width = (done/D.flat.length*100)+"%";
  save();
}
// نقرة واحدة = تعليم كمقروء | نقرتان سريعتان (فأرة أو لمس) = نافذة الشرح
function attachPress(el){
  const id = +el.dataset.m;
  let lastTap = 0;
  el.addEventListener("pointerup", ()=>{
    const now = Date.now();
    if(now - lastTap < 350){ lastTap = 0; openPopup(id); }
    else { lastTap = now; markMasala(id); }
  });
  el.addEventListener("contextmenu", e=>e.preventDefault());
}
function markMasala(id){
  const D = cur();
  if(!D.flat.find(x=>x.id===id)) return;
  state.masala=id; localStorage.setItem(doneKey(id),"1");
  document.querySelectorAll(".masala").forEach(e=>e.classList.toggle("active",+e.dataset.m===id));
  renderPages0(); save();
}
function openMasala(id){ markMasala(id); openPopup(id); }
function openPopup(id){
  const D = cur();
  const m = D.flat.find(x=>x.id===id); if(!m) return;
  state.masala=id; localStorage.setItem(doneKey(id),"1");
  document.querySelectorAll(".masala").forEach(e=>e.classList.toggle("active",+e.dataset.m===id));
  $("#mSrc").textContent = state.sharh + " على " + state.book;
  $("#mTitle").textContent = `شرح مسألة ${m.id} — ${m.bab}`;
  $("#mText").textContent = m.sharh;
  $("#sharhModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  renderPages0(); save();
}
function closePopup(){ $("#sharhModal").classList.add("hidden"); document.body.style.overflow = ""; }
$("#modalClose").onclick = closePopup;
$("#modalCloseBottom").onclick = closePopup;
$("#sharhModal").addEventListener("click", e=>{ if(e.target.id==="sharhModal") closePopup(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closePopup(); });
function renderPages0(){ // تحديث التظليل والتقدم دون إعادة بناء البحث
  const D = cur();
  const done = D.flat.filter(m=>+localStorage.getItem(doneKey(m.id))).length;
  $("#progressBar").style.width = (done/D.flat.length*100)+"%";
}
$("#prevPage").onclick=()=>{state.page--;renderPages();};
$("#nextPage").onclick=()=>{state.page++;renderPages();};
$("#babSelect").onchange=e=>{curBab=e.target.value;state.page=1;renderPages();};
$("#searchBox").oninput=()=>{state.page=1;renderPages();};
$("#mPrev").onclick=()=>{ if(state.masala>1) openPopup(state.masala-1); };
$("#mNext").onclick=()=>{ const D=cur(); if(state.masala<D.flat.length) openPopup(state.masala+1); };

// init
(function(){
  const s=load();
  state.zoom=s?.zoom||100; applyZoom();
  document.documentElement.dataset.theme=s?.theme||"light";
  $("#themeBtn").textContent=document.documentElement.dataset.theme==="dark"?"☀️ نهاري":"🌙 ليلي";
  renderSections();
})();

// ============ الاختبار والمراجعة (تُبنى الأسئلة من نصوص الكتب فقط) ============
function availBooks(){
  const out = [];
  for(const sec of SECTIONS){
    for(const b of (BOOKS[sec.id]||[])){
      if(b.ok) out.push({book:b.t, section:sec.name});
    }
  }
  return out;
}
function fillBookSelect(sel, info, from, to){
  const books = availBooks();
  sel.innerHTML = books.map(b=>`<option value="${b.book}">${b.book} (${b.section})</option>`).join("");
  const upd = ()=>{
    const D = bookData(sel.value);
    info.textContent = `عدد صفحات القراءة في هذا الكتاب: ${D.pages.length} صفحة`;
    from.max = D.pages.length; to.max = D.pages.length;
    from.value = 1; to.value = Math.min(3, D.pages.length);
  };
  sel.onchange = upd; upd();
}
$("#quizBtn").onclick = ()=>{ fillBookSelect($("#qBook"), $("#qPagesInfo"), $("#qFrom"), $("#qTo")); go("view-quiz-setup"); };

// توليد الأسئلة من النصوص فقط: لا يُؤلَّف أي نص جديد
function norm(s){ return (s||"").replace(/\s+/g," ").trim(); }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function excerpt(t, n){ t = norm(t); return t.length>n ? t.slice(0,n)+"…" : t; }
function blankWord(matn){
  const words = norm(matn).split(" ").filter(w=>w.length>=4);
  if(!words.length) return null;
  const w = words.reduce((a,b)=>b.length>=a.length?b:a, words[0]);
  return { q: norm(matn).replace(w, "……"), a: w };
}
function buildQuiz(book, from, to, type, perPage){
  const D = bookData(book);
  const pages = D.pages.filter(p=>p.id>=from && p.id<=to);
  const pool = D.flat.map(m=>m.matn);
  const list = [];
  const kinds = type==="mcq" ? ["mcq","tf"] : type==="essay" ? ["write","complete"] : ["mcq","tf","complete","write"];
  let k = 0;
  for(const p of pages){
    for(const m of p.masael.slice(0, perPage)){
      const kind = kinds[k++ % kinds.length];
      if(kind==="mcq"){
        const others = shuffle(pool.filter(t=>t!==m.matn)).slice(0,3);
        list.push({ kind, bab:m.bab, id:m.id,
          prompt:`أيُّ مما يلي هو نصُّ المسألة رقم ${m.id} في «${m.bab}»؟`,
          options: shuffle([m.matn, ...others]).map(t=>excerpt(t,160)),
          answer: excerpt(m.matn,160) });
      } else if(kind==="tf"){
        const truth = Math.random()<0.5;
        const stmt = truth ? m.matn : shuffle(pool.filter(t=>t!==m.matn))[0];
        list.push({ kind, bab:m.bab, id:m.id,
          prompt:`قال المتن في المسألة رقم ${m.id} من «${m.bab}»: «${stmt}» — صح أم خطأ؟`,
          options:["صح","خطأ"], answer: truth?"صح":"خطأ" });
      } else if(kind==="complete"){
        const b = blankWord(m.matn);
        if(!b) continue;
        list.push({ kind, bab:m.bab, id:m.id,
          prompt:`أكمل المسألة رقم ${m.id} من «${m.bab}» بكتابة الكلمة الناقصة (مطابقة حرفية): «${b.q}»`,
          answer: b.a });
      } else {
        list.push({ kind, bab:m.bab, id:m.id,
          prompt:`اكتب نصَّ المسألة رقم ${m.id} من «${m.bab}» كاملًا من حفظك (التصحيح حرفي):`,
          answer: norm(m.matn) });
      }
    }
  }
  return list.slice(0, 30);
}
let QZ = { list:[], idx:0, score:0, locked:false };
function qChoice(v){ return document.querySelector(`input[name="${v}"]:checked`).value; }
$("#qStart").onclick = ()=>{
  const book = $("#qBook").value;
  const D = bookData(book);
  let from = Math.max(1, +$("#qFrom").value||1);
  let to = Math.min(D.pages.length, +$("#qTo").value||1);
  if(from>to) [from,to]=[to,from];
  const list = buildQuiz(book, from, to, qChoice("qtype")||"mixed", +qChoice("qper")||1);
  if(!list.length){ alert("لا توجد مسائل في هذا النطاق."); return; }
  QZ = { list, idx:0, score:0, locked:false, book };
  go("view-quiz-run"); renderQ();
};
function renderQ(){
  const total = QZ.list.length;
  $("#qProgText").textContent = `السؤال ${Math.min(QZ.idx+1,total)} من ${total} — الدرجة: ${QZ.score}`;
  $("#qProgBar").style.width = (QZ.idx/total*100)+"%";
  if(QZ.idx>=total){
    const pct = Math.round(QZ.score/total*100);
    $("#qProgBar").style.width = "100%";
    $("#qCard").innerHTML = `<div class="q-result"><div class="q-score">${QZ.score} / ${total}</div><p>النسبة: ${pct}% — ${pct>=80?"ممتاز":pct>=60?"جيد":"يحتاج مراجعة"}</p><button class="mode-btn" onclick="go('view-quiz-setup')">اختبار جديد</button></div>`;
    return;
  }
  QZ.locked = false;
  const q = QZ.list[QZ.idx];
  let body = `<div class="q-stem">${q.prompt}</div>`;
  if(q.kind==="mcq"||q.kind==="tf"){
    body += q.options.map((o,i)=>`<button class="q-opt" data-o="${i}">${o}</button>`).join("");
  } else if(q.kind==="complete"){
    body += `<input id="qAns" class="q-input" autocomplete="off" placeholder="اكتب الكلمة الناقصة هنا">`;
  } else {
    body += `<textarea id="qAns" class="q-input" rows="4" placeholder="اكتب نص المسألة هنا"></textarea>`;
  }
  body += `<div class="q-actions"><button id="qCheck" class="mode-btn">تحقق</button></div><div id="qFeed"></div>`;
  $("#qCard").innerHTML = body;
  document.querySelectorAll(".q-opt").forEach(b=>b.onclick=()=>{ clearSel(); b.classList.add("sel"); });
  $("#qCheck").onclick = checkQ;
}
function clearSel(){ document.querySelectorAll(".q-opt").forEach(b=>b.classList.remove("sel")); }
function checkQ(){
  if(QZ.locked) return;
  const q = QZ.list[QZ.idx];
  let given = "", ok = false;
  if(q.kind==="mcq"||q.kind==="tf"){
    const s = document.querySelector(".q-opt.sel");
    if(!s){ alert("اختر إجابة أولًا."); return; }
    given = s.textContent; ok = (norm(given)===norm(q.answer));
    document.querySelectorAll(".q-opt").forEach(b=>{
      if(norm(b.textContent)===norm(q.answer)) b.classList.add("good");
      else if(b.classList.contains("sel")) b.classList.add("bad");
    });
  } else {
    given = norm($("#qAns").value);
    ok = (given===norm(q.answer));
  }
  QZ.locked = true;
  if(ok) QZ.score++;
  $("#qProgText").textContent = `السؤال ${QZ.idx+1} من ${QZ.list.length} — الدرجة: ${QZ.score}`;
  $("#qFeed").innerHTML = `<div class="q-feed ${ok?"good":"bad"}">${ok?"إجابة صحيحة":"إجابة خاطئة — الصواب: «"+q.answer+"»"}</div><button class="mode-btn" id="qNext">${QZ.idx+1>=QZ.list.length?"عرض النتيجة":"السؤال التالي"}</button>`;
  $("#qNext").onclick = ()=>{ QZ.idx++; renderQ(); };
}
$("#qQuit").onclick = ()=>go("view-sections");
