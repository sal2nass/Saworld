// منطق المنصة: أقسام -> كتب -> شروح -> قراءة صفحات + شرح المسألة + تكبير + دارك + متابعة
const SECTIONS = [
  { id:"aqida", name:"العقيدة", mark:"ع", desc:"التوحيد والإيمان والأسماء والصفات" },
  { id:"hadith", name:"الحديث", mark:"ح", desc:"أحاديث الأحكام — ابدأ بعمدة الأحكام" },
  { id:"nahw", name:"النحو", mark:"ن", desc:"قواعد الإعراب وبناء الجملة" },
  { id:"sarf", name:"الصرف", mark:"ص", desc:"أبنية الكلمات وتصريف الأفعال" },
  { id:"fiqh", name:"الفقه", mark:"ف", desc:"أحكام العبادات والمعاملات" },
  { id:"faraid", name:"الفرائض", mark:"م", desc:"علم المواريث وقسمة التركات" },
];
const BOOKS = {
  aqida: [{t:"كتاب التوحيد", ok:true, desc:"للإمام محمد بن عبد الوهاب — كاملًا (66 بابًا) بفتح المجيد"},{t:"الأصول الثلاثة", ok:false},{t:"العقيدة الواسطية", ok:false}],
  hadith: [{t:"عمدة الأحكام", ok:true, desc:"لعبد الغني المقدسي — أحاديث الطهارة بشرح البسام"},{t:"بلوغ المرام", ok:false},{t:"الأربعون النووية", ok:false}],
  nahw: [{t:"الآجرومية", ok:true, desc:"لابن آجروم — بشرح الشيخ العثيمين للمبتدئين (متاح الآن)"},{t:"قطر الندى", ok:false}],
  sarf: [{t:"نظم المقصود", ok:false},{t:"شذا العرف", ok:false}],
  fiqh: [{t:"عمدة الفقه", ok:true, desc:"لابن قدامة — كتاب الطهارة والصلاة (متاح الآن)"},{t:"زاد المستقنع", ok:true, desc:"للحجاوي — كتاب الطهارة بشرح ابن عثيمين (الشرح الممتع)"},{t:"دليل الطالب", ok:false}],
  faraid: [{t:"متن الرحبية", ok:true, desc:"منظومة الرحبي في الفرائض — بشرح الشيخ عبد المحسن القاسم"}],
};
const SHURUH = {
  "عمدة الفقه": [
    {t:"شرح الشيخ صالح الفوزان", ok:true, desc:"المعتمد حاليًا — مهذب من الدروس الصوتية والطبعة الأخيرة"},
    {t:"شرح الشيخ ابن عثيمين", ok:false},
    {t:"شرح الشيخ عبدالله البسام", ok:false},
  ],
  "كتاب التوحيد": [
    {t:"فتح المجيد شرح كتاب التوحيد", ok:true, desc:"للشيخ عبد الرحمن بن حسن آل الشيخ — تحقيق الفريان، آخر الطبعات"},
    {t:"شرح الشيخ صالح الفوزان (إعانة المستفيد)", ok:false},
  ],
  "الآجرومية": [
    {t:"شرح الشيخ محمد بن صالح العثيمين", ok:true, desc:"الأنسب للمبتدئ: عبارة سهلة وأمثلة متدرجة وتمارين"},
    {t:"شرح الكفراوي", ok:false},
  ],
  "متن الرحبية": [
    {t:"شرح الشيخ عبد المحسن القاسم", ok:true, desc:"شرح ميسر على المنظومة — آخر الطبعات"},
  ],
  "زاد المستقنع": [
    {t:"الشرح الممتع للشيخ ابن عثيمين", ok:true, desc:"أوسع شروح الزاد وأيسرها — آخر الطبعات"},
  ],
  "عمدة الأحكام": [
    {t:"تيسير العلام للشيخ عبد الله البسام", ok:true, desc:"شرح مختصر مفيد على أحاديث الأحكام — آخر الطبعات"},
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

// أقسام
function renderSections(){
  const avail = {aqida:"متاح: كتاب التوحيد", hadith:"متاح: عمدة الأحكام", nahw:"متاح: الآجرومية", fiqh:"متاح: عمدة الفقه + الزاد", faraid:"متاح: متن الرحبية"};
  $("#sectionsGrid").innerHTML = SECTIONS.map(s=>`<div class="card" data-s="${s.id}"><div class="mark">${s.mark}</div><h3>${s.name}</h3><p class="muted">${s.desc}</p><span class="tag">${avail[s.id]||"قريبًا"}</span></div>`).join("");
  document.querySelectorAll("#sectionsGrid .card").forEach(c=>c.onclick=()=>{
    state.section=c.dataset.s; renderBooks(); go("view-books");
  });
}
function renderBooks(){
  const sec = SECTIONS.find(s=>s.id===state.section);
  $("#booksTitle").textContent = "كتب قسم: "+sec.name;
  const list = BOOKS[state.section]||[];
  $("#booksGrid").innerHTML = list.map(b=>`<div class="card ${b.ok?"":"disabled"}" data-b="${b.t}"><h3>${b.t}</h3><p class="muted">${b.desc||"سيُضاف لاحقًا ضمن خطة المنصة"}</p>${b.ok?'<span class="tag">ادخل</span>':'<span class="soon">قريبًا</span>'}</div>`).join("");
  document.querySelectorAll("#booksGrid .card").forEach(c=>c.onclick=()=>{
    const b=(BOOKS[state.section]||[]).find(x=>x.t===c.dataset.b);
    if(!b||!b.ok){ alert("هذا الكتاب سيُضاف لاحقًا. المتاح الآن: عمدة الفقه، الزاد، التوحيد، عمدة الأحكام، الآجرومية، الرحبية."); return; }
    state.book=b.t; renderShuruh(); go("view-shuruh");
  });
}
function renderShuruh(){
  $("#shuruhTitle").textContent = "شروح كتاب: "+state.book;
  const list = SHURUH[state.book]||[];
  $("#shuruhGrid").innerHTML = list.map(s=>`<div class="card ${s.ok?"":"disabled"}" data-s="${s.t}"><h3>${s.t}</h3><p class="muted">${s.desc||"سيُضاف لاحقًا"}</p>${s.ok?'<span class="tag">اختر وابدأ القراءة</span>':'<span class="soon">قريبًا</span>'}</div>`).join("");
  document.querySelectorAll("#shuruhGrid .card").forEach(c=>c.onclick=()=>{
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
  $("#readSub").textContent = D.author+" | المرجع: الشاملة / تراث — آخر الطبعات";
  const babs = ["الكل", ...new Set(D.pages.map(p=>p.bab))];
  const keep = babs.includes(curBab)?curBab:"الكل"; curBab = keep;
  $("#babSelect").innerHTML = babs.map(b=>`<option>${b}</option>`).join("");
  $("#babSelect").value = curBab;
  $("#searchBox").value = "";
  $("#crumbs").textContent = `القسم: ${bookSection(state.book)} › الكتاب: ${state.book} › الشرح: ${state.sharh}`;
  $("#readHint").textContent = "ضغطة سريعة = تعليم كمقروء • ضغطة مطوّلة على المسألة = عرض شرحها في نافذة منبثقة";
  renderPages(); save(); updateResume();
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
  save(); updateResume();
}
// ضغطة سريعة = تعليم كمقروء فقط | ضغطة مطوّلة (600ms) = نافذة الشرح
function attachPress(el){
  let timer=null, longFired=false;
  const id = +el.dataset.m;
  const start = e=>{ longFired=false; timer=setTimeout(()=>{ longFired=true; openPopup(id); },600); };
  const cancel = ()=>{ clearTimeout(timer); };
  el.addEventListener("pointerdown", start);
  el.addEventListener("pointerup", e=>{ cancel(); if(!longFired) markMasala(id); });
  el.addEventListener("pointerleave", cancel);
  el.addEventListener("pointermove", cancel);
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
  $("#mSrc").textContent = "شرح مختصر مستفاد من: " + state.sharh + " — آخر الطبعات (الشاملة / تراث)";
  $("#mTitle").textContent = `مسألة ${m.id} — ${m.bab}`;
  $("#mMatn").textContent = m.matn;
  $("#mText").textContent = m.sharh;
  $("#mDalil").textContent = m.dalil;
  $("#mFaida").textContent = m.faida;
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

// متابعة
function updateResume(){
  const s = load();
  const btn = $("#resumeBtn");
  if(s&&s.page&&(s.book)){
    btn.classList.remove("hidden");
    btn.textContent = `▶ متابعة: ${s.book} — صفحة ${s.page}${s.masala?" — مسألة "+s.masala:""}`;
  } else btn.classList.add("hidden");
}
$("#resumeBtn").onclick=()=>{
  const s=load(); if(!s) return;
  state.book=s.book||"عمدة الفقه"; state.sharh=s.sharh||"شرح الشيخ صالح الفوزان";
  state.section=s.section||({ "كتاب التوحيد":"aqida", "عمدة الأحكام":"hadith", "الآجرومية":"nahw", "متن الرحبية":"faraid", "عمدة الفقه":"fiqh", "زاد المستقنع":"fiqh" }[state.book]||"fiqh");
  state.page=s.page||1; curBab="الكل";
  enterRead(); go("view-read");
  if(s.masala) openMasala(s.masala);
};

// init
(function(){
  const s=load();
  state.zoom=s?.zoom||100; applyZoom();
  document.documentElement.dataset.theme=s?.theme||"light";
  $("#themeBtn").textContent=document.documentElement.dataset.theme==="dark"?"☀️ نهاري":"🌙 ليلي";
  renderSections(); updateResume();
})();
