// منطق المنصة: أقسام -> كتب -> شروح -> قراءة صفحات + شرح المسألة + تكبير + دارك + متابعة
const SECTIONS = [
  { id:"aqida", name:"العقيدة", icon:"🕌", desc:"التوحيد والإيمان والأسماء والصفات" },
  { id:"nahw", name:"النحو", icon:"✍️", desc:"قواعد الإعراب وبناء الجملة" },
  { id:"sarf", name:"الصرف", icon:"🔤", desc:"أبنية الكلمات وتصريف الأفعال" },
  { id:"fiqh", name:"الفقه", icon:"⚖️", desc:"أحكام العبادات والمعاملات — ابدأ بعمدة الفقه" },
  { id:"faraid", name:"الفرائض", icon:"🧮", desc:"علم المواريث وقسمة التركات" },
];
const BOOKS = {
  aqida: [{t:"كتاب التوحيد", ok:true, desc:"للإمام محمد بن عبد الوهاب — بفتح المجيد (متاح الآن)"},{t:"الأصول الثلاثة", ok:false},{t:"العقيدة الواسطية", ok:false}],
  nahw: [{t:"الآجرومية", ok:true, desc:"لابن آجروم — بشرح الشيخ العثيمين للمبتدئين (متاح الآن)"},{t:"قطر الندى", ok:false}],
  sarf: [{t:"نظم المقصود", ok:false},{t:"شذا العرف", ok:false}],
  fiqh: [{t:"عمدة الفقه", ok:true, desc:"لابن قدامة — كتاب الطهارة والصلاة (متاح الآن)"},{t:"زاد المستقنع", ok:false},{t:"دليل الطالب", ok:false}],
  faraid: [{t:"متن الرحبية", ok:false}],
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
  ]
};
// سجل البيانات: اسم الكتاب -> كائن البيانات المحمّل من ملفات data/
function bookData(name){
  if(name==="عمدة الفقه") return window.UMDAT;
  if(name==="كتاب التوحيد") return window.TAWHID;
  if(name==="الآجرومية") return window.AJRUM;
  return window.UMDAT;
}
function bookSection(name){
  if(name==="كتاب التوحيد") return "العقيدة";
  if(name==="الآجرومية") return "النحو";
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
  const avail = {aqida:"متاح: كتاب التوحيد", nahw:"متاح: الآجرومية", fiqh:"متاح: عمدة الفقه"};
  $("#sectionsGrid").innerHTML = SECTIONS.map(s=>`<div class="card" data-s="${s.id}"><div style="font-size:2rem">${s.icon}</div><h3>${s.name}</h3><p class="muted">${s.desc}</p><span class="tag">${avail[s.id]||"قريبًا"}</span></div>`).join("");
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
    if(!b||!b.ok){ alert("هذا الكتاب سيُضاف لاحقًا. المتاح الآن: عمدة الفقه، كتاب التوحيد، الآجرومية."); return; }
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
  const srcEl = $("#sharhSrc");
  if(srcEl) srcEl.textContent = "المصدر: " + state.sharh;
  const emp = $("#sharhEmpty p");
  if(emp) emp.textContent = `سيظهر لك هنا نص المسألة من «${state.book}»، وتحته شرحها المستفاد من ${state.sharh}، مع الدليل والفائدة.`;
  $("#sharhEmpty").classList.remove("hidden"); $("#sharhBody").classList.add("hidden");
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
  document.querySelectorAll(".masala").forEach(el=>el.onclick=()=>openMasala(+el.dataset.m));
  const D = cur();
  const done = D.flat.filter(m=>+localStorage.getItem(doneKey(m.id))).length;
  $("#progressBar").style.width = (done/D.flat.length*100)+"%";
  save(); updateResume();
}
function openMasala(id){
  const D = cur();
  const m = D.flat.find(x=>x.id===id); if(!m) return;
  state.masala=id; localStorage.setItem(doneKey(id),"1");
  document.querySelectorAll(".masala").forEach(e=>e.classList.toggle("active",+e.dataset.m===id));
  $("#sharhEmpty").classList.add("hidden"); $("#sharhBody").classList.remove("hidden");
  $("#sharhMasalaTitle").textContent = `مسألة ${m.id} — ${m.bab}`;
  $("#sharhMatn").textContent = m.matn;
  $("#sharhText").textContent = m.sharh;
  $("#sharhDalil").textContent = m.dalil;
  $("#sharhFaida").textContent = m.faida;
  if(window.innerWidth<900) $("#sharhPanel").scrollIntoView({behavior:"smooth"});
  renderPages0(); save();
}
function renderPages0(){ // تحديث التظليل والتقدم دون إعادة بناء البحث
  const D = cur();
  const done = D.flat.filter(m=>+localStorage.getItem(doneKey(m.id))).length;
  $("#progressBar").style.width = (done/D.flat.length*100)+"%";
}
$("#prevPage").onclick=()=>{state.page--;renderPages();};
$("#nextPage").onclick=()=>{state.page++;renderPages();};
$("#babSelect").onchange=e=>{curBab=e.target.value;state.page=1;renderPages();};
$("#searchBox").oninput=()=>{state.page=1;renderPages();};
$("#prevMasala").onclick=()=>{ if(state.masala>1) openMasala(state.masala-1); };
$("#nextMasala").onclick=()=>{ const D=cur(); if(state.masala<D.flat.length) openMasala(state.masala+1); };

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
  state.section=s.section||(state.book==="كتاب التوحيد"?"aqida":state.book==="الآجرومية"?"nahw":"fiqh");
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
