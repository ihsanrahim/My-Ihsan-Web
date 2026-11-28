/* Halal checker: ingredient analysis + the Halal tab screen. The database check and the ingredient list work offline;
   label photos are read by the online AI (the offline OCR was removed in 0.39.0 to cut the app by about 5.6 MB). */
(function(){
"use strict";
var DB = window.HALAL_DB;
var STOP = /\b(?:and|dan|or|atau|with|dengan|contains?|mengandungi|may|mungkin|traces?|kesan|of|as|sebagai|added|ditambah|permitted|dibenarkan|the|a|an|in|dalam|from|daripada|dari|for|untuk|other|lain|lain-lain|natural|asli|semula jadi|artificial|tiruan|food|makanan|ingredients?|ramuan|kandungan|bahan|bahan-bahan|komposisi|composition|allergens?|alergen|information|maklumat|produce|product|produk|made|dibuat|packed|dibungkus|net|berat|bersih|weight|wt|g|kg|ml|mg|l|x|e|ins|type|jenis|powder|serbuk|extract|ekstrak|dried|kering|fresh|segar|pure|tulen|refined|ditapis|hydrogenated|terhidrogen|concentrate|pekatan|whole|penuh|low|rendah|fat|lemak|free|bebas|high|tinggi|class|kelas|ii|iii|iv|halal|jakim|malaysia|logo)\b/gi;

function norm(t){
  return String(t||"").replace(/\r/g,"").replace(/(\w)-\s*\n\s*(\w)/g,"$1$2").replace(/[‘’`´]/g,"'").replace(/[–—]/g,"-").replace(/\s*\n\s*/g," ").replace(/\s{2,}/g," ").toLowerCase();
}
function lookupE(code){
  if(DB.E[code]) return [code, DB.E[code]];
  var base=code.replace(/[a-f]$/,"");
  if(DB.E[base]) return [base, DB.E[base]];
  return null;
}
function note(n){ return typeof n==="string" ? DB.W[n] : n; }

function analyse(raw){
  var full = norm(raw), t = full;
  var hm = /(ingredients?|ramuan|kandungan|bahan-bahan|komposisi|composition)\s*[:：]/.exec(t);
  if(hm && hm.index < t.length*0.8) t = t.slice(hm.index + hm[0].length);
  var cut = /(nutrition(?:al)? information|nutrition facts|maklumat pemakanan|maklumat nutrisi|storage instructions?|cara penyimpanan|best before|baik sebelum)/.exec(t);
  if(cut && cut.index > 20) t = t.slice(0, cut.index);
  var work = t, items = [], seen = {};
  function push(st, ms, en, n, hit, code){
    var key = code || ms; if(seen[key]){ seen[key].hits.push(hit); return; }
    var it = {st:st, ms:ms, en:en, note:note(n)||["",""], hits:[hit], code:code||""}; seen[key]=it; items.push(it);
  }
  function blank(s, a, b){ return s.slice(0,a) + new Array(b-a+1).join(" ") + s.slice(b); }

  // 1. E-numbers: "E471", "E 471", "INS 471", "e-322(i)", and bare numbers next to a function word ("Emulsifier (471, 322)")
  var re = /\b(?:(e|ins)\s?-?\s?)?(\d{3,4})\s?([a-f](?![a-z]))?(?:\s?\(?(?:iii|ii|iv|vi|v|i)\)?(?![a-z]))?(?![\da-z])(?!\s?(?:g|mg|kg|ml|kcal|kj|%|cm|mm|gram))/gi, m, found=[];
  while((m = re.exec(work))){
    var n = +m[2]; if(n<100 || n>1599) continue;
    var pref = !!m[1];
    if(!pref){ var before = work.slice(Math.max(0, m.index-45), m.index); if(!DB.FUNC.test(before)) continue; }
    found.push([m.index, m.index+m[0].length, "E"+m[2]+(m[3]||"").toLowerCase(), m[0].replace(/^[\s(]+|[\s()]+$/g,"")]);
  }
  found.forEach(function(f){
    var r = lookupE(f[2]);
    if(r) push(r[1][0], r[0]+" "+r[1][1], r[0]+" "+r[1][2], r[1][3], f[3], r[0]);
    else push("S", f[2]+" (tidak dikenali)", f[2]+" (not recognised)", ["Nombor E ini tiada dalam pangkalan data aplikasi. Semak sumbernya atau logo halal.","This E-number is not in the app's database. Check its source or the halal logo."], f[3], f[2]);
  });
  for(var i=found.length-1;i>=0;i--) work = blank(work, found[i][0], found[i][1]);

  // 2. words and phrases, most specific first
  DB.K.forEach(function(k){
    var st = k[0], generic = st==="S!"; if(generic) st="S";
    var rx = new RegExp(k[1], "gi"), mm, spans=[];
    while((mm = rx.exec(work))){
      if(!mm[0].trim()){ rx.lastIndex++; continue; }
      if(generic){ var after = t.slice(mm.index+mm[0].length, mm.index+mm[0].length+30); if(/^\s*[:(\[]?\s*[(\[]?\s*(?:e\s?-?\d|ins|\d{3}|soy|soya|sunflower|lesitin|lecithin|sayuran|vegetable|tumbuhan|plant)/i.test(after)) { spans.push([mm.index, mm.index+mm[0].length]); continue; } }
      push(st, k[2], k[3], k[4], mm[0].trim());
      spans.push([mm.index, mm.index+mm[0].length]);
    }
    for(var j=spans.length-1;j>=0;j--) work = blank(work, spans[j][0], spans[j][1]);
  });

  // 3. what is left over and still looks like an ingredient
  var unknown = [];
  work.split(/[,;()\[\]{}:.\/•*·|]+/).forEach(function(seg){
    var s = seg.replace(STOP," ").replace(/[^a-zÀ-ɏ\s-]/gi," ").replace(/\s{2,}/g," ").trim();
    if(s.replace(/[^a-z]/gi,"").length >= 4 && unknown.indexOf(s)<0 && unknown.length < 15) unknown.push(s);
  });

  var nonHalal = items.some(function(x){ return x.ms==="Tanda 'tidak halal'"; });
  var logo = !nonHalal && DB.LOGO.test(full.replace(/(halal|fish|ikan)\s+(gelatine?|gelatin|collagen)/g,""));
  var veg = DB.VEG.test(full);
  var rank = {X:0, S:1, H:2};
  items.sort(function(a,b){ return rank[a.st]-rank[b.st]; });
  var verdict = items.length ? (items.some(function(x){return x.st==="X";}) ? "X" : items.some(function(x){return x.st==="S";}) ? "S" : "H") : "?";
  return {verdict:verdict, items:items, unknown:unknown, logo:logo, veg:veg, text:t};
}

// ---------------- screen ----------------
var H = null, st = {open:false, busy:false, img:null, res:null, text:"", msg:"", prog:0, typing:false, prod:null, jq:"", lq:"", lf:"all", lk:"all", lo:null, ln:12};
var HIST_KEY = "ihsan_halal_hist";
function L2(a,b){ return H.L2x(a,b); }
function nm(it){ return L2(it.ms, it.en); }
function stName(s){ return {H:L2("Halal","Halal"), X:L2("Haram","Haram"), S:L2("Syubhah","Syubhah"), "?":L2("Tiada keputusan","No result")}[s]; }

function verdictHtml(r){
  var en = H.S.lang==="en", v = r.verdict, nX=0, nS=0, nH=0;
  r.items.forEach(function(x){ if(x.st==="X") nX++; else if(x.st==="S") nS++; else nH++; });
  var head = {X:"✖ "+stName("X"), S:"⚠ "+stName("S"), H:"✔ "+stName("H"), "?":"? "+stName("?")}[v];
  var sub = v==="X" ? L2("Ramuan haram dikesan. Elakkan produk ini.","A haram ingredient was found. Avoid this product.")
    : v==="S" ? L2("Tiada ramuan haram yang jelas, tetapi ada ramuan syubhah. Beli hanya jika ada logo halal yang sah.","No clearly haram ingredient, but some are doubtful. Buy only with a valid halal logo.")
    : v==="H" ? L2("Semua ramuan yang dikenal pasti adalah halal.","Every ingredient that was recognised is halal.")
    : r.unclear ? L2("Teks dalam gambar kurang jelas, jadi keputusan tidak dapat dibuat. Ambil gambar lebih dekat, terang dan tegak, atau taip ramuan.","The text in the photo was not clear, so no result can be given. Take a closer, brighter, upright photo, or type the ingredients.")
    : L2("Tiada ramuan dapat dikenal pasti. Cuba gambar yang lebih jelas, dekat dan rata.","No ingredients could be recognised. Try a clearer, closer, flat photo.");
  var cnt = r.items.length ? '<div class="hvCount">'+(nX?'<span class="hp X">'+nX+' '+stName("X")+'</span>':'')+(nS?'<span class="hp S">'+nS+' '+stName("S")+'</span>':'')+(nH?'<span class="hp H">'+nH+' '+stName("H")+'</span>':'')+'</div>' : '';
  var extra = '';
  if(r.logo) extra += '<div class="hvNote">🟢 '+L2("Pek ini nampaknya ada perkataan atau logo halal. Pastikan ia logo JAKIM atau badan yang diiktiraf JAKIM; jika sah, ramuan syubhah biasanya sudah disemak.","This pack seems to show a halal word or logo. Make sure it is JAKIM's logo or one JAKIM recognises; if it is valid, doubtful ingredients have usually been checked already.")+'</div>';
  if(r.veg) extra += '<div class="hvNote">🌱 '+L2("Dilabel vegetarian/vegan: tiada daging, tetapi alkohol masih mungkin ada.","Labelled vegetarian/vegan: no meat, but alcohol may still be present.")+'</div>';
  return '<div class="hv '+v.replace("?","Q")+'"><div class="hvH">'+head+'</div><div class="hvS">'+sub+'</div>'+cnt+extra+'</div>';
}
function tableHtml(r){
  if(!r.items.length) return '';
  return '<div class="card htab"><h3>'+L2("Keputusan ramuan","Ingredient results")+'</h3><table class="htbl"><thead><tr><th>'+L2("Ramuan","Ingredient")+'</th><th>'+L2("Status","Status")+'</th><th>'+L2("Penjelasan ringkas","Brief explanation")+'</th></tr></thead><tbody>'+
    r.items.map(function(it){ return '<tr class="r'+it.st+'"><td><b>'+H.esc(nm(it))+'</b>'+(it.hits[0] && nm(it).toLowerCase().indexOf(it.hits[0].toLowerCase())<0 ? '<div class="hhit">“'+H.esc(it.hits.slice(0,3).join("”, “"))+'”</div>' : '')+'</td><td><span class="hp '+it.st+'">'+stName(it.st)+'</span></td><td>'+H.esc(L2(it.note[0], it.note[1]))+'</td></tr>'; }).join("")+
    '</tbody></table>'+
    (r.unknown.length ? '<details class="hunk"><summary>'+L2("Tidak dikenal pasti","Not recognised")+' ('+r.unknown.length+')</summary><div class="mut">'+L2("Perkataan ini tiada dalam pangkalan data atau tersalah baca. Ia tidak dikira dalam keputusan; semak sendiri.","These words are not in the database or were misread. They are not counted in the result; check them yourself.")+'</div><div class="hunkl">'+r.unknown.map(function(u){ return '<span class="badge">'+H.esc(u)+'</span>'; }).join(" ")+'</div></details>' : '')+
    '</div>';
}
function histLoad(){ return H.load(HIST_KEY, []); }
function histAdd(r){ var h=histLoad(); if(h[0] && h[0].text===st.text.slice(0,2000)) return; var first=r.items.slice(0,3).map(function(x){return x.en;}).join(", "); h.unshift({t:Date.now(), v:r.verdict, text:st.text.slice(0,2000), s:first, p:(st.prod&&st.prod.found)?(st.prod.name||st.prod.brand||st.prod.code):null}); h=h.slice(0,12); H.save(HIST_KEY, h); }

function render(el){
  var RP = window.HalalRecipe;
  if(RP && RP.page()!=="check"){ RP.render(el, H); return; }   // 0.2.9: Resepi / Rancang / Beli pages
  var en = H.S.lang==="en", html = RP ? RP.tabs() : '';
  html += '<div class="card hhero"><div class="hhTop"><div class="hhIc">🔍</div><div><b>'+L2("Penyemak Halal","Halal checker")+'</b><div class="mut">'+L2("Imbas kod bar, ambil gambar label, taip ramuan, atau cari satu ramuan dalam senarai di bawah. Senarai dan semakan teks berjalan tanpa internet; gambar dibaca oleh AI dalam talian.","Scan the barcode, photo the label, type the ingredients, or look up one ingredient in the list below. The list and text check work offline; photos are read by the online AI.")+'</div></div></div>'+
    '<button class="btn gold full hBig" id="hMain">'+(st.open?'▲ ':'▼ ')+L2("Semak Halal","Check Halal")+'</button>'+
    '<div class="hDrop'+(st.open?' open':'')+'"><div class="hOpts">'+
      '<button class="hOpt" id="hBc"><span class="bcIc">'+BC_IC+'</span>'+L2("Imbas kod bar","Scan barcode")+'</button>'+
      '<button class="hOpt" id="hCam"><span>📷</span>'+L2("Kamera","Camera")+'</button>'+
      '<button class="hOpt" id="hUp"><span>🖼️</span>'+L2("Muat naik gambar","Upload image")+'</button>'+
      '<button class="hOpt" id="hType"><span>⌨️</span>'+L2("Taip ramuan","Type ingredients")+'</button>'+
    '</div><div class="mut tiny hTip">'+L2("Gambar dibaca oleh AI dalam talian (apa-apa bahasa). Tanpa internet? Taip ramuan atau cari dalam senarai ramuan.","Photos are read by the online AI (any language). No internet? Type the ingredients or search the ingredient list.")+'</div></div>'+
    '<input type="file" accept="image/*" id="hFile" style="display:none"><input type="file" accept="image/*" capture="environment" id="hFileCam" style="display:none"></div>';
  if(!st.busy && !st.img && !st.res && !st.typing && !st.prod) html += listHtml();
  if(st.img && !st.busy && !st.ai && !AI().ready()) html += needAiHtml();
  if(st.img || st.busy) html += '<div class="card hprev">'+(st.img?'<img src="'+st.img+'" alt="">':'')+(st.busy?'<div class="hbusy"><div class="hspin"></div><div>'+H.esc(st.msg)+'</div><div class="bar"><div style="width:'+Math.round(st.prog*100)+'%"></div></div></div>':'')+'</div>';
  if(st.typing || (st.res && !st.busy)) html += '<div class="card"><h3>'+(st.typing&&!st.res?L2("Taip atau tampal senarai ramuan","Type or paste the ingredient list"):(st.img?L2("Ramuan yang dibaca AI (boleh dibetulkan)","Ingredients read by the AI (you can correct them)"):L2("Teks ramuan (boleh dibetulkan)","Ingredient text (you can correct it)")))+'</h3><textarea id="hTxt" class="htxt" rows="5" placeholder="'+L2("Contoh: Tepung gandum, gula, gelatin, E471, perisa…","e.g. Wheat flour, sugar, gelatine, E471, flavouring…")+'">'+H.esc(st.text)+'</textarea><button class="btn full" id="hRe" style="margin-top:8px">'+L2("Semak teks ini","Check this text")+'</button></div>';
  if(st.prod && !st.busy) html += prodHtml(st.prod);
  var photoAi = st.img && st.ai && !st.busy;
  if(photoAi) html += aiHtml();
  if(st.res && !st.busy){ if(photoAi) html += '<div class="hSec">📚 '+L2("Semakan silang dengan pangkalan data aplikasi","Cross-check with the app's ingredient database")+'</div>'; html += verdictHtml(st.res) + tableHtml(st.res); }
  if(!st.busy && (st.img || st.res)){ if(!photoAi && !(st.img && !AI().ready())) html += aiHtml(); html += appsHtml(); }
  if(!st.busy && (st.img || st.res || st.typing || st.prod)) html += listHtml();
  if(!st.busy) html += jakimHtml();
  var hist = histLoad();
  if(hist.length && !st.busy) html += '<div class="card"><h3>'+L2("Semakan lepas","Previous checks")+'</h3>'+hist.slice(0,6).map(function(h,i){ var d=new Date(h.t); return '<button class="hhist" data-h="'+i+'"><span class="hp '+h.v.replace("?","Q")+'">'+stName(h.v)+'</span><span class="hhs">'+(h.p?'📦 '+H.esc(h.p):H.esc(h.text.slice(0,60))+'…')+'</span><span class="mut">'+d.getDate()+"/"+(d.getMonth()+1)+'</span></button>'; }).join("")+'<button class="chip" id="hClr" style="margin-top:6px">'+L2("Padam sejarah","Clear history")+'</button></div>';
  html += aiSettingsHtml();   // 0.7.28 (owner): the ✨ AI panel stays on every AI feature; it opens Settings › Online AI
  html += '<div class="card hdisc"><h3>⚖️ '+L2("Panduan sahaja, bukan fatwa","A guide only, not a fatwa")+'</h3><div class="small">'+
    L2("Keputusan dibuat oleh komputer daripada teks label dan pangkalan data ramuan di dalam aplikasi (mengikut amalan halal Malaysia dan mazhab Syafi'i). Ia boleh tersalah baca atau terlepas ramuan. Logo halal JAKIM yang sah lebih utama daripada keputusan ini; jika ragu, tinggalkan, atau semak di laman Halal Malaysia (myehalal.halal.gov.my) atau tanya pihak berautoriti agama.",
       "The result is made by the computer from the label text and an ingredient database inside the app (following Malaysian halal practice and the Shafi'i school). It can misread or miss ingredients. A valid JAKIM halal logo matters more than this result; if in doubt, leave it, or check the Halal Malaysia portal (myehalal.halal.gov.my) or ask a religious authority.")+
    '</div><details class="small" style="margin-top:8px"><summary>'+L2("Bagaimana ia berfungsi","How it works")+'</summary><div class="mut" style="margin-top:6px">'+
    L2("1. Gambar label dibaca oleh AI dalam talian yang anda pilih (lalai: percuma, tanpa kunci). Gambar hanya dihantar apabila anda mengambil atau memuat naik gambar. Teks yang ditaip dan senarai ramuan disemak di dalam telefon tanpa internet.<br>2. Penilaian: ",
       "1. Label photos are read by the online AI you choose (default: free, no key). A photo is only sent when you take or upload one. Typed text and the ingredient list are checked on the phone, with no internet.<br>2. Checking: ")+Object.keys(DB.E).length+L2(" nombor E dan "," E-numbers and ")+DB.K.length+L2(" kumpulan ramuan dengan penjelasan. Status: Halal, Haram, atau Syubhah (bergantung pada sumber, perlu logo halal)."," ingredient groups with explanations. Status: Halal, Haram, or Syubhah (depends on the source, needs a halal logo).")+
    '</div></details></div>';
  el.innerHTML = html;
  bind(el); if(RP) RP.bindTabs(el);
}
function rerender(){ var el=document.getElementById("view"); if(el && el.querySelector(".hhero")) render(el); }

function check(text, conf){
  st.text = text; st.res = analyse(text); st.ai = null;
  st.typing=false; histAdd(st.res); rerender(); autoAI();
  setTimeout(function(){ var v=document.querySelector(".hprod")||document.querySelector(".hv"); if(v) v.scrollIntoView({behavior:"smooth", block:"start"}); }, 80);
}
// ---------- optional online AI ----------
var AI = function(){ return window.HalalAI; };
function autoAI(){ var c=AI().cfg(); if(AI().ready() && c.auto) askAI(); }
function askAI(){
  st.ai = {busy:true}; var me = st.ai; rerender();
  var t0 = st.text || (document.getElementById("hTxt")||{}).value || "";
  // 0.6.24: status, timer, backup and Cancel come from the shared AI engine (HalalAI.run → AIRun card)
  AI().ask(st.img, t0, H.S.lang, L2).then(function(r){ if(st.ai !== me) return; st.ai = {res:r};
    if(st.img && !t0.trim() && r.items.length){ st.text = aiText(r); st.res = analyse(st.text); histAdd(st.res); }
    rerender(); setTimeout(function(){ var v=document.querySelector(".hai"); if(v) v.scrollIntoView({behavior:"smooth", block:"start"}); }, 80); },
    function(e){ if(st.ai !== me) return; st.ai = e && e.cancel ? null : {err:String(e && e.message || e)}; rerender(); });
}
function aiBtn(){ return window.AIRun ? '<div class="aiBtnRow">'+AIRun.btn("halal")+'</div>' : ''; }
function aiHtml(){
  var a = AI();
  if(!a.ready()) return '<button class="btn alt full hAiOff" id="hAiSetup">✨ '+L2("Nilai dengan AI dalam talian (bahasa lain, ringkasan jelas)","Assess with online AI (any language, clear summary)")+' ›</button>';
  if(!st.ai) return aiBtn()+'<button class="btn full hAiBtn" id="hAiGo">✨ '+L2("Tanya AI dalam talian","Ask the online AI")+'</button>';
  if(st.ai.busy) return '<div class="hai">'+(window.AIRun ? AIRun.card("halal") : '<div class="card"><div class="hbusy"><div class="hspin"></div><div>…</div></div></div>')+'</div>';
  if(st.ai.err) return '<div class="card hai"><h3>✨ AI</h3><div class="small">⚠️ '+H.esc(st.ai.err)+'</div><div class="btns" style="margin-top:10px"><button class="btn" id="hAiGo">'+L2("Cuba lagi","Try again")+'</button>'+(window.AIRun?AIRun.btn("halal"):'')+'</div></div>';
  var r = st.ai.res, v = r.verdict;
  var head = {X:"✖ "+stName("X"), S:"⚠ "+stName("S"), H:"✔ "+stName("H"), "?":"? "+L2("Tidak jelas","Unclear")}[v];
  var meta = [r.product, r.language ? L2("Bahasa label: ","Label language: ")+r.language : "", r.logo ? L2("Logo: ","Logo: ")+r.logo : ""].filter(Boolean).map(function(x){ return H.esc(x); }).join(" · ");
  return '<div class="hai">'+aiBtn()+'<div class="hv '+v.replace("?","Q")+'"><div class="hAiTag">✨ '+L2("Penilaian AI","AI assessment")+'</div><div class="hvH">'+head+'</div><div class="hvS">'+H.esc(r.summary||"")+'</div>'+(meta?'<div class="hhit" style="margin-top:6px">'+meta+'</div>':'')+(r.advice?'<div class="hvNote">💡 '+H.esc(r.advice)+'</div>':'')+'</div>'+
    (r.items.length ? '<div class="card htab"><table class="htbl"><thead><tr><th>'+L2("Ramuan","Ingredient")+'</th><th>'+L2("Status","Status")+'</th><th>'+L2("Sebab","Reason")+'</th></tr></thead><tbody>'+
      r.items.map(function(it){ return '<tr class="r'+it.st+'"><td><b>'+H.esc(it.name)+'</b>'+(it.original && it.original.toLowerCase()!==String(it.name).toLowerCase() ? '<div class="hhit">“'+H.esc(it.original)+'”</div>' : '')+'</td><td><span class="hp '+it.st+'">'+stName(it.st)+'</span></td><td>'+H.esc(it.reason)+'</td></tr>'; }).join("")+'</tbody></table></div>' : '')+
    '<div class="mut tiny" style="padding:0 4px 8px">'+"✨ "+H.esc(r.provider+" · "+(window.AIRun?AIRun.shortModel(r.model):r.model))+(r.ms?" · "+Math.max(1,Math.round(r.ms/1000))+" s":"")+L2(". AI boleh tersilap. Panduan sahaja, bukan fatwa; logo halal JAKIM yang sah lebih utama.",". AI can be wrong. A guide only, not a fatwa; a valid JAKIM halal logo matters more.")+'</div></div>';
}
// 0.6.24: every AI setting (service, model, "ask after each check") is in Settings › ✨ AI; here only the ✨ button to it
function aiSettingsHtml(){ return '<div class="card haiset" id="hAiSet"><div class="row"><b>✨ AI</b>'+(window.AIRun?AIRun.btn("halal"):'<button class="btn alt" id="aiOpenSet">⚙</button>')+'</div></div>'; }
function openAiSet(){ if(window.AIRun) AIRun.open("halal"); else if(window.openSettings) window.openSettings("ai"); }
function appsHtml(){
  var a = AI();
  return '<div class="card happs"><h3>📲 '+L2("Hantar ke aplikasi AI anda","Send to your AI app")+'</h3><div class="mut tiny" style="margin-bottom:8px;line-height:1.4">'+L2("Guna akaun anda sendiri (percuma atau berbayar). Gambar dan arahan dihantar ke aplikasi itu; arahan juga disalin, tampal jika ia tidak muncul. Jawapan dipaparkan dalam aplikasi tersebut.","Uses your own account (free or paid). The photo and a prompt go to that app; the prompt is also copied, paste it if it does not appear. The answer shows in that app.")+'</div><div class="happl">'+
    a.APPS.map(function(x,i){ return '<button class="chip" data-app="'+i+'">'+H.esc(x[0])+'</button>'; }).join("")+'<button class="chip" data-app="-1">'+L2("Lain…","Other…")+'</button></div></div>';
}
function sendApp(i){
  var a = AI(), app = a.APPS[i] || ["","",""], t = st.text || (document.getElementById("hTxt")||{}).value || "";
  var prompt = a.sharePrompt(H.S.lang, t, !!st.img), N = H.N;
  if(N.shareTo){ if(N.copyText) N.copyText(prompt); N.shareTo(app[1], st.img || "", prompt); H.toast(L2("Arahan disalin. Tampal jika perlu.","Prompt copied. Paste it if needed.")); return; }
  try{ navigator.clipboard.writeText(prompt); }catch(e){}
  if(app[2]) window.open(app[2]); H.toast(L2("Arahan disalin. Tampal dalam aplikasi AI.","Prompt copied. Paste it in the AI app."));
}
function bindAI(el){
  var g = el.querySelector("#hAiGo"); if(g) g.onclick = askAI;
  el.querySelectorAll("[data-app]").forEach(function(b){ b.onclick=function(){ sendApp(+b.getAttribute("data-app")); }; });
  var su = el.querySelector("#hAiSetup"); if(su) su.onclick = openAiSet;
  var os = el.querySelector("#aiOpenSet"); if(os) os.onclick = openAiSet;
  var au = el.querySelector("#aiAuto"); if(au) au.onchange = function(){ var c = AI().cfg(); c.auto = au.checked; AI().saveCfg(c); };
}
// 0.39.0: no offline OCR. A photo goes to the online AI; its ingredient names are then cross-checked with the database.
function aiText(r){ return r.items.map(function(i){ var o=String(i.original||"").trim(), n=String(i.name||"").trim(); return n + (o && n.toLowerCase().indexOf(o.toLowerCase())<0 && /^[\x20-\x7e\u00c0-\u024f]+$/.test(o) ? " ("+o+")" : ""); }).filter(Boolean).join(", "); }
function gotImage(dataUrl){
  st.prod = null; st.img = dataUrl; st.res = null; st.text = ""; st.typing = false; st.ai = null;
  if(AI().ready()) askAI(); else rerender();
  setTimeout(function(){ var v=document.querySelector(".hneed")||document.querySelector(".hprev"); if(v) v.scrollIntoView({behavior:"smooth", block:"start"}); }, 80);
}
function needAiHtml(){
  return '<div class="card hneed"><h3>📷 '+L2("Gambar dibaca oleh AI dalam talian","Photos are read by the online AI")+'</h3><div class="small mut" style="line-height:1.45">'+
    L2("AI membaca label dalam apa-apa bahasa, kemudian aplikasi menyemak setiap ramuan dengan pangkalan datanya. Pilihan lalai percuma dan tanpa kunci; gambar dihantar kepada penyedia AI.","The AI reads the label in any language, then the app checks each ingredient against its own database. The default choice is free with no key; the photo is sent to the AI provider.")+
    '</div><button class="btn gold full" id="hAiQuick" style="margin-top:10px">✨ '+L2("Hidupkan AI percuma dan semak","Turn on the free AI and check")+'</button>'+
    '<div class="btns" style="margin-top:8px"><button class="btn alt" id="hType2">⌨️ '+L2("Taip ramuan","Type ingredients")+'</button><button class="btn alt" id="hAiMore">⚙ '+L2("Pilih penyedia lain","Choose another provider")+'</button></div></div>';
}
function pick(mode, el){
  st.open = false;
  var N = H.N;
  if(N.pickImage){
    var go = function(){
      var h = function(d){ H.off("image", h); if(d.cancel) return; if(d.error || !d.data){ H.toast(L2("Gambar tidak dapat dibuka","The image could not be opened")); return; } gotImage(d.data); };
      H.on("image", h); N.pickImage(mode);
    };
    if(mode==="camera" && !N.hasPerm("camera")){ var hp=function(p){ if(p.which!=="camera") return; H.off("perm",hp); if(p.granted) go(); else H.toast(L2("Perlu kebenaran kamera, atau pilih 'Muat naik gambar'","Camera permission needed, or choose 'Upload image'")); }; H.on("perm",hp); N.requestPerm("camera"); }
    else go();
    rerender(); return;
  }
  var inp = el.querySelector(mode==="camera" ? "#hFileCam" : "#hFile");
  inp.onchange = function(){ var f=inp.files && inp.files[0]; if(!f) return; var fr=new FileReader(); fr.onload=function(){ gotImage(fr.result); }; fr.readAsDataURL(f); };
  inp.click(); rerender();
}
function bind(el){
  el.querySelector("#hMain").onclick = function(){ st.open = !st.open; rerender(); };
  var aq = el.querySelector("#hAiQuick"); if(aq) aq.onclick = function(){ var a=AI(), c=a.cfg(); c.on=true; if(!a.PROV[c.prov].nokey && !c.keys[c.prov]) c.prov="pollinations"; a.saveCfg(c); askAI(); };
  var am = el.querySelector("#hAiMore"); if(am) am.onclick = openAiSet;
  var t2 = el.querySelector("#hType2"); if(t2) t2.onclick = function(){ st.typing=true; st.img=null; st.res=null; st.text=""; rerender(); setTimeout(function(){ var t=document.getElementById("hTxt"); if(t){ t.focus(); t.scrollIntoView({behavior:"smooth", block:"center"}); } },50); };
  bindList(el);
  el.querySelector("#hCam").onclick = function(){ pick("camera", el); };
  el.querySelector("#hBc").onclick = function(){ startBarcode(); };
  el.querySelectorAll("[data-hact]").forEach(function(b){ b.onclick=function(){ var a=b.getAttribute("data-hact");
    if(a==="cam") pick("camera", el); else if(a==="scan") startBarcode();
    else if(a==="jk"){ st.jq=b.getAttribute("data-q")||""; jakimGo(st.jq); }
    else if(a==="kal" && window.Kalori && st.prod){ Kalori.fromScan(st.prod, st.res ? st.res.verdict : null, H); } }; });
  var jq=el.querySelector("#hjQ"); if(jq){ jq.oninput=function(){ st.jq=jq.value; }; jq.onkeydown=function(e){ if(e.key==="Enter") jakimGo(jq.value); }; }
  var jg=el.querySelector("#hjGo"); if(jg) jg.onclick=function(){ jakimGo(el.querySelector("#hjQ").value); };
  var ja=el.querySelector("#hjApp"); if(ja) ja.onclick=function(){ var u="market://search?q="+encodeURIComponent("Verify Halal JAKIM")+"&c=apps"; if(window.Native) H.N.openUrl(u); else window.open("https://play.google.com/store/search?q=Verify%20Halal%20JAKIM&c=apps"); };
  el.querySelector("#hUp").onclick = function(){ pick("gallery", el); };
  el.querySelector("#hType").onclick = function(){ st.open=false; st.prod=null; st.typing=true; st.res=null; st.img=null; st.text=""; rerender(); setTimeout(function(){ var t=document.getElementById("hTxt"); if(t) t.focus(); },50); };
  var re = el.querySelector("#hRe"); if(re) re.onclick = function(){ var v=el.querySelector("#hTxt").value; if(!v.trim()){ H.toast(L2("Sila taip ramuan dahulu","Please type the ingredients first")); return; } check(v); };
  el.querySelectorAll("[data-h]").forEach(function(b){ b.onclick=function(){ var h=histLoad()[+b.getAttribute("data-h")]; if(h){ st.img=null; st.prod=null; check(h.text); } }; });
  bindAI(el);
  var clr = el.querySelector("#hClr"); if(clr) clr.onclick = function(){ H.save(HIST_KEY, []); rerender(); };
}

// ---------- 0.11.0: barcode (idea 71) and JAKIM certificate search (idea 72) ----------
var BC_IC='<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M2 4h2v16H2zm3 0h1v16H5zm2 0h2v16H7zm3 0h1v16h-1zm3 0h2v16h-2zm3 0h1v16h-1zm2 0h3v16h-3z"/></svg>';
var JAKIM_URL="https://www.halal.gov.my/?data=ZGlyZWN0b3J5L2luZGV4X2RpcmVjdG9yeTs7Ozs%3D";
function openWeb(u, title){ if(H.N.openWeb) H.N.openWeb(u, title); else H.N.openUrl(u); }
function startBarcode(){
  st.open=false; rerender();
  window.HalalBarcode.scan(H, function(code){
    st.img=null; st.res=null; st.ai=null; st.typing=false; st.text=""; st.prod={code:code};
    st.busy=true; st.prog=0.5; st.msg=L2("Mencari produk ","Looking up product ")+code+"…"; rerender();
    window.HalalBarcode.lookup(H, code, function(r){
      st.busy=false; st.prod=r; if(r.brand) st.jq=r.brand;
      if(r.found && r.ingr){ check(r.ingr); return; }
      rerender();
    });
  });
}
function prodHtml(p){
  var esc=H.esc, h='<div class="card hprod">';
  var acts='<div class="btns hpA"><button class="btn gold" data-hact="cam">📷 '+L2("Ambil gambar ramuan","Photo the ingredients")+'</button><button class="btn alt" data-hact="scan">'+L2("Imbas lagi","Scan again")+'</button></div>';
  if(p.error){ return h+'<b>⚠️ '+L2("Tiada sambungan internet","No internet connection")+'</b><div class="mut small">'+L2("Carian kod bar perlukan internet. Taip ramuan dari bungkusan atau cari dalam senarai ramuan; kedua-duanya berjalan tanpa internet.","Barcode lookup needs internet. Type the ingredients from the pack or search the ingredient list; both work offline.")+'</div>'+acts+'</div>'; }
  var head='<div class="hpH">'+(p.img?'<img src="'+esc(p.img)+'" alt="" referrerpolicy="no-referrer" onerror="this.remove()">':'<span class="hpI">📦</span>')+'<div><b>'+esc(p.name||L2("Produk tanpa nama","Unnamed product"))+'</b>'+(p.brand?'<div class="small">'+esc(p.brand)+'</div>':'')+'<div class="mut tiny">'+L2("Kod bar","Barcode")+' '+esc(p.code)+'</div></div></div>';
  if(!p.found) return h+'<b>'+L2("Produk belum ada dalam pangkalan data","Product not in the database yet")+'</b><div class="mut small">'+L2("Kod bar "+esc(p.code)+" tiada dalam Open Food Facts. Ambil gambar senarai ramuan pada bungkusan.","Barcode "+esc(p.code)+" is not in Open Food Facts. Take a photo of the ingredient list on the pack.")+'</div>'+acts+'</div>';
  if(!p.ingr) return h+head+'<div class="small" style="margin-top:8px">'+L2("Senarai ramuan belum dimasukkan untuk produk ini. Ambil gambar ramuan pada bungkusan.","No ingredient list has been entered for this product yet. Take a photo of the ingredients on the pack.")+'</div>'+acts+'</div>';
  return h+head+(p.halal?'<div class="hpL">🏷️ '+L2("Pengguna Open Food Facts melaporkan logo halal pada produk ini. Pastikan logo halal JAKIM ada pada bungkusan anda.","Open Food Facts users report a halal logo on this product. Make sure the JAKIM halal logo is on your pack.")+'</div>':'')+
    '<div class="mut tiny" style="margin-top:8px">'+L2("Ramuan di bawah diambil dari Open Food Facts (diisi oleh sukarelawan) dan mungkin berbeza dengan bungkusan anda. Bandingkan dengan label.","The ingredients below come from Open Food Facts (entered by volunteers) and may differ from your pack. Compare with the label.")+'</div>'+
    (window.Kalori ? '<button class="btn gold full" data-hact="kal" style="margin-top:8px">🍽️ '+L2("Tambah ke diari Kalori","Add to the Kalori diary")+(p.nut && (p.nut.serv||p.nut.per100) ? ' · '+(p.nut.serv||p.nut.per100).kcal+' kcal'+(p.nut.serv?'':' / 100 g') : '')+'</button>' : '')+   // 0.7.90: one scan, two answers
    '<div class="btns hpA">'+(p.brand?'<button class="btn alt" data-hact="jk" data-q="'+esc(p.brand)+'">🏷️ '+L2("Semak sijil JAKIM jenama ini","Check this brand with JAKIM")+'</button>':'')+'<button class="btn alt" data-hact="scan">'+L2("Imbas lagi","Scan again")+'</button></div></div>';
}
function jakimHtml(){
  return '<div class="card hjk"><h3>🏷️ '+L2("Semak sijil halal JAKIM","Check JAKIM halal certification")+'</h3><div class="mut small">'+
    L2("Cari nama produk, jenama atau syarikat dalam direktori rasmi Halal Malaysia. Nama yang anda taip disalin; tampal dalam kotak carian portal.","Search for a product, brand or company in the official Halal Malaysia directory. What you type is copied; paste it into the portal's search box.")+
    '</div><div class="hjRow"><input type="search" id="hjQ" placeholder="'+L2("Nama produk atau jenama","Product or brand name")+'" value="'+H.esc(st.jq||"")+'"><button class="btn gold" id="hjGo">'+L2("Cari","Search")+'</button></div>'+
    '<button class="chip" id="hjApp" style="margin-top:8px">📱 '+L2("Cari aplikasi rasmi JAKIM di Play Store","Find JAKIM's official app on Play Store")+'</button></div>';
}
function jakimGo(q){
  q=String(q||"").trim(); st.jq=q;
  if(q && H.N.copyText){ H.N.copyText(q); H.toast(L2("Disalin. Tampal dalam kotak carian portal.","Copied. Paste it into the portal's search box.")); }
  openWeb(JAKIM_URL, L2("Semakan status halal","Halal status check"));
}

// ---------- 0.39.0: searchable ingredient list (offline, built from the same database the checker uses) ----------
var LIST = null;
function aliasesOf(rx){
  var s = String(rx).replace(/\\b/g," ").replace(/\(\?[:!=]/g,"(").replace(/\\s[*+?]?/g," ").replace(/\[- \]\??/g," ").replace(/\[[^\]]*\]/g,"").replace(/\\./g,"").replace(/[?*+]/g,"");
  var out = [];
  s.split(/[|()]/).forEach(function(w){ w = w.replace(/\s{2,}/g," ").trim(); if(/^[a-zà-ɏ'][a-zà-ɏ' -]{2,}$/i.test(w) && w.replace(STOP,"").trim() && out.indexOf(w)<0) out.push(w); });
  return out;
}
function buildList(){
  if(LIST) return LIST;
  LIST = [];
  var byName = {};
  DB.K.forEach(function(k, i){
    if(k[2]==="Tanda 'tidak halal'") return;
    var rx; try{ rx = new RegExp(k[1], "i"); }catch(e){ rx = null; }
    var stt = k[0]==="S!"?"S":k[0], key = "k|"+stt+"|"+k[2]+"|"+k[3], old = byName[key];
    if(old){ aliasesOf(k[1]).forEach(function(a){ if(old.al.indexOf(a)<0) old.al.push(a); }); if(rx) old.rxs.push(rx); return; }
    byName[key] = {id:"k"+i, kind:"ing", st:stt, ms:k[2], en:k[3], note:note(k[4]), al:aliasesOf(k[1]), rxs:rx?[rx]:[], codes:[]};
    LIST.push(byName[key]);
  });
  Object.keys(DB.E).sort(function(a,b){ return parseInt(a.slice(1),10)-parseInt(b.slice(1),10) || (a<b?-1:1); }).forEach(function(c){
    var e = DB.E[c], key = e[0]+"|"+e[1]+"|"+e[2];
    if(byName[key]){ byName[key].codes.push(c); return; }
    byName[key] = {id:"e"+c, kind:"e", st:e[0], ms:e[1], en:e[2], note:note(e[3]), al:[], rxs:[], codes:[c]};
    LIST.push(byName[key]);
  });
  return LIST;
}
function listMatch(q){
  var all = buildList(), qn = norm(q).trim();
  var fl = all.filter(function(x){ return (st.lf==="all" || x.st===st.lf) && (st.lk==="all" || x.kind===st.lk); });
  if(!qn) return fl;
  var code = /^(?:e|ins)?\s*-?\s*(\d{3,4}[a-f]?)$/.exec(qn), scored = [];
  fl.forEach(function(x){
    var nm2 = (x.ms+" "+x.en).toLowerCase(), sc = -1;
    if(code){ x.codes.forEach(function(c){ var cn=c.toLowerCase().slice(1); if(cn===code[1]) sc=Math.max(sc,3); else if(cn.indexOf(code[1])===0) sc=Math.max(sc,2); }); }
    else {
      if(nm2.indexOf(qn)===0 || x.ms.toLowerCase().indexOf(qn)===0 || x.en.toLowerCase().indexOf(qn)===0) sc = 3;
      else if(nm2.indexOf(qn)>=0) sc = 2;
      else if(x.al.some(function(a){ return a.toLowerCase().indexOf(qn)>=0; })) sc = 1.5;
      else if(qn.length>=3 && x.rxs.some(function(r){ return r.test(qn); })) sc = 1;
      else if(x.codes.some(function(c){ return c.toLowerCase().indexOf(qn.replace(/\s/g,""))===0; })) sc = 1;
    }
    if(sc>=0) scored.push([sc, x]);
  });
  scored.sort(function(a,b){ return b[0]-a[0]; });
  return scored.map(function(p){ return p[1]; });
}
function listRows(){
  var res = listMatch(st.lq), shown = res.slice(0, st.lq ? 40 : st.ln), en = H.S.lang==="en";
  if(!res.length) return '<div class="hlEmpty small">'+L2("Tiada padanan dalam senarai. Taip senarai penuh di atas (⌨️ Taip ramuan) atau tanya AI dalam talian.","No match in the list. Type the full list above (⌨️ Type ingredients) or ask the online AI.")+'</div>';
  return shown.map(function(x){
    var open = st.lo===x.id, name = L2(x.ms, x.en), other = en ? x.ms : x.en;
    var codes = x.codes.length ? '<span class="hlCode">'+H.esc(x.codes.length>4 ? x.codes.slice(0,3).join(", ")+" … "+x.codes[x.codes.length-1] : x.codes.join(", "))+'</span>' : '';
    var body = open ? '<div class="hlBody"><div>'+H.esc(L2(x.note[0], x.note[1]))+'</div>'+
      (other && other!==name ? '<div class="mut tiny">'+(en?"Bahasa Melayu: ":"English: ")+H.esc(other)+'</div>' : '')+
      (x.codes.length>1 ? '<div class="mut tiny">'+L2("Kod: ","Codes: ")+H.esc(x.codes.join(", "))+'</div>' : '')+
      (x.al.length ? '<div class="mut tiny">'+L2("Juga ditulis sebagai: ","Also written as: ")+H.esc(x.al.slice(0,16).join(", "))+(x.al.length>16?" …":"")+'</div>' : '')+'</div>' : '';
    return '<div class="hlRow r'+x.st+(open?' open':'')+'"><button class="hlHead" data-li="'+x.id+'">'+codes+'<span class="hlName">'+H.esc(name)+'</span><span class="hp '+x.st+'">'+stName(x.st)+'</span><span class="hlChev">'+(open?'▴':'▾')+'</span></button>'+body+'</div>';
  }).join("") + (res.length>shown.length ? '<button class="btn alt full" id="hlMore" style="margin-top:8px">'+(st.lq?L2("Perhalusi carian untuk melihat lebih banyak","Narrow the search to see more"):L2("Tunjuk lagi","Show more"))+' ('+(res.length-shown.length)+')</button>' : '');
}
function listHtml(){
  var all = buildList(), n = {X:0, S:0, H:0};
  var names = 0, codes = 0; all.forEach(function(x){ n[x.st]++; names += x.al.length || 1; codes += x.codes.length; });
  var chip = function(v, label, cnt){ return '<button class="chip'+(st.lf===v?' on':'')+'" data-lf="'+v+'">'+label+(cnt!=null?' <span class="mut">'+cnt+'</span>':'')+'</button>'; };
  var kchip = function(v, label){ return '<button class="chip'+(st.lk===v?' on':'')+'" data-lk="'+v+'">'+label+'</button>'; };
  return '<div class="card hlist" id="hList"><h3>📚 '+L2("Senarai ramuan halal","Halal ingredient list")+'</h3><div class="mut tiny" style="margin:-2px 0 8px;line-height:1.4">'+
    L2("Cari satu ramuan atau nombor E (contoh: gelatin, E471, perisa, shortening). ","Look up one ingredient or E-number (e.g. gelatine, E471, flavouring, shortening). ")+codes+L2(" nombor E dan lebih "," E-numbers and over ")+(Math.floor(names/50)*50)+L2(" nama ramuan, tanpa internet."," ingredient names, offline.")+'</div>'+
    '<input type="search" id="hlQ" class="hlQ" placeholder="'+L2("Cari ramuan atau nombor E…","Search an ingredient or E-number…")+'" value="'+H.esc(st.lq)+'" autocomplete="off">'+
    '<div class="hlChips">'+chip("all", L2("Semua","All"), all.length)+chip("X", stName("X"), n.X)+chip("S", stName("S"), n.S)+chip("H", stName("H"), n.H)+'</div>'+
    '<div class="hlChips">'+kchip("all", L2("Semua jenis","All types"))+kchip("ing", L2("Ramuan","Ingredients"))+kchip("e", L2("Nombor E","E-numbers"))+'</div>'+
    '<div id="hlRes">'+listRows()+'</div></div>';
}
function bindRows(el){
  el.querySelectorAll("[data-li]").forEach(function(b){ b.onclick = function(){ var id=b.getAttribute("data-li"); st.lo = st.lo===id ? null : id; refreshRows(); }; });
  var m = el.querySelector("#hlMore"); if(m) m.onclick = function(){ if(st.lq){ var q=document.getElementById("hlQ"); if(q) q.focus(); return; } st.ln += 30; refreshRows(); };
}
function refreshRows(){ var r = document.getElementById("hlRes"); if(r){ r.innerHTML = listRows(); bindRows(r); } }
function bindList(el){
  var box = el.querySelector("#hList"); if(!box) return;
  var q = box.querySelector("#hlQ");
  q.oninput = function(){ st.lq = q.value; st.lo = null; refreshRows(); };
  box.querySelectorAll("[data-lf]").forEach(function(b){ b.onclick = function(){ st.lf = b.getAttribute("data-lf"); st.ln = 12; st.lo = null; rerender(); var l=document.getElementById("hList"); if(l) l.scrollIntoView({block:"start"}); }; });
  box.querySelectorAll("[data-lk]").forEach(function(b){ b.onclick = function(){ st.lk = b.getAttribute("data-lk"); st.ln = 12; st.lo = null; rerender(); var l=document.getElementById("hList"); if(l) l.scrollIntoView({block:"start"}); }; });
  bindRows(box);
}

window.HalalCheck = { analyse: analyse };
window.HalalView = function(el, helpers){ H = helpers; window.HalalAI._on = helpers.on; window.HalalAI._off = helpers.off;
  if(window.HalalRecipe){ HalalRecipe.init(helpers); if(helpers.auto==="recipe") HalalRecipe.take(); else if(helpers.auto==="recipes"||helpers.auto==="rplan") HalalRecipe.open(helpers.auto==="rplan"?"plan":"list"); else if(helpers.auto==="kal") HalalRecipe.open("kal"); else if(helpers.auto==="barcode") HalalRecipe.open("check"); }
  render(el);
  if(helpers.auto==="barcode") setTimeout(startBarcode, 120); };
})();
