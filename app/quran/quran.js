/* My Ihsan 0.18.0: Al-Quran (Ilmu › Al-Quran, the first Ilmu tab).
   Ayat view (tajwid colours, Rumi, Malay/English, word meanings), Mushaf view (604 pages, 15 lines, KFGQPC Hafs),
   Mishary Alafasy audio per ayat with repeat and offline download, hold-to-pause autoscroll, search, bookmarks,
   notes, khatam planner, daily goal and streak.
   Data: quran/qmeta.js, qs/sNNN.js (tajwid text + word meanings), qm/mNN.js (mushaf pages), qen.js, qar.js.
   Storage: localStorage ihsan_quran; Malay translation and audio in the app's private files (quran/...). */
(function(){
"use strict";
var H=null, box=null, M=window.QMETA, KEY="ihsan_quran";
var D=null, SUR={}, MUSH={}, TR={ms:null}, loading={}, st={v:"home", tab:"surah", s:1, page:1, go:null, sq:"", find:"", pos:{}};
var timers=[], audioTimer=null, playK=-1, asOn=false, asPause=false, asAcc=0, asLast=0, asRaf=0, seenAt={}, io=null, pageTimer=null;
var NATIVE=!!(window.Native && window.Native.playerPlay);
var LET=/[\u0621-\u064A\u0671-\u06D3\u06FA-\u06FF]/;
var AD="٠١٢٣٤٥٦٧٨٩";

function L2(a,b){ return H.L2x(a,b); }
function E(s){ return H.esc(s); }
function en(){ return H.en(); }
function q(s){ return box?box.querySelector(s):null; }
function qa(s){ return box?Array.prototype.slice.call(box.querySelectorAll(s)):[]; }
function view(){ return document.getElementById("view"); }
function adig(n){ return String(n).replace(/[0-9]/g,function(c){ return AD[+c]; }); }
function pad3(n){ return ("00"+n).slice(-3); }
function ymd(d){ d=d||new Date(); return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); }
function dayDiff(a,b){ return Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/864e5); }

// ---------- persisted state ----------
function dflt(){ return {last:null, bm:[], cols:[], notes:{}, log:{}, goal:{k:"ayat", n:10}, plan:null, pr:"", seen:{d:"", ks:{}}, hz:{s:114, c:{}}, grp:[], tad:{},
  set:{mode:"ayat", tj:true, tf:false, tr:"auto", rumi:true, wbw:"tap", ar:30, ts:15, font:"hafs", rep:1, repAll:1, gap:0, spd:100, follow:true, as:28, kb:128, wl:"en", tfs:169}}; }
function loadD(){
  var d=dflt(); D=H.load(KEY,null)||d;
  for(var k in d) if(D[k]===undefined) D[k]=d[k];
  for(var k2 in d.set) if(D.set[k2]===undefined) D.set[k2]=d.set[k2];
  if(typeof D.pr!=="string" || D.pr.length!==604) D.pr=new Array(605).join("0");
  if(D.seen.d!==ymd()) D.seen={d:ymd(), ks:{}};
}
function saveD(){ H.save(KEY,D); }

// ---------- index helpers ----------
function sMeta(s){ return M.s[s-1]; }
function sName(s){ return sMeta(s)[1]; }
/* 0.6.6: in Arabic the surah's English meaning is left out of list lines (the Arabic name says it) */
function smP(s){ return document.documentElement.lang==="ar" ? "" : E(sMean(s))+' · '; }
function sMean(s){ return en()?sMeta(s)[2]:(window.QNAME_MS||[])[s-1]||sMeta(s)[2]; }
function gIdx(s,a){ return M.sa[s-1]+a-1; }
function bsearch(arr,k){ var lo=0, hi=arr.length-1; while(lo<hi){ var m=(lo+hi+1)>>1; if(arr[m]<=k) lo=m; else hi=m-1; } return lo; }
function fromIdx(k){ var i=bsearch(M.sa,k); return [i+1, k-M.sa[i]+1]; }
function pageOf(k){ return bsearch(M.pa,k)+1; }
function juzOf(k){ return bsearch(M.ja,k)+1; }
function refOf(k){ var r=fromIdx(k); return r[0]+":"+r[1]; }
function pageEndIdx(p){ return p>=604?6235:M.pa[p]-1; }

// ---------- loading data files ----------
function loadScript(src, ok, bad){
  if(loading[src]==="done"){ ok(); return; }
  if(loading[src]){ loading[src].push([ok,bad]); return; }
  loading[src]=[[ok,bad]];
  var sc=document.createElement("script"); sc.src=src;
  sc.onload=function(){ var l=loading[src]; loading[src]="done"; l.forEach(function(x){ x[0](); }); };
  sc.onerror=function(){ var l=loading[src]; delete loading[src]; l.forEach(function(x){ if(x[1]) x[1](); }); };
  document.body.appendChild(sc);
}
window.QSUR=function(n,d){ SUR[n]=d; };
window.QMUSH=function(g,pages){ MUSH[g]=pages; };
function needSurah(s, cb){ if(SUR[s]){ cb(); return; } loadScript("quran/qs/s"+pad3(s)+".js", cb, function(){ H.toast(L2("Surah gagal dimuatkan","Surah failed to load")); }); }
function needPage(p, cb){ var g=Math.floor((p-1)/20); if(MUSH[g]){ cb(); return; } loadScript("quran/qm/m"+("0"+g).slice(-2)+".js", cb); }
function needEn(cb){ if(window.QEN){ cb(); return; } loadScript("quran/qen.js", cb); }
function needAr(cb){ if(window.QAR){ cb(); return; } loadScript("quran/qar.js", cb); }
function msReady(){ if(TR.ms) return true; if(!window.Native || !H.N.qRead) return false; try{ var t=H.N.qRead("quran/tr/ms.json"); if(t){ var a=JSON.parse(t); if(a && a.length===6236){ TR.ms=a; return true; } } }catch(e){} return false; }
function trList(){ var t=D.set.tr; if(t==="auto") t=en()?"en":(msReady()?"ms":"en"); return t==="both"?["ms","en"]:t==="none"?[]:[t]; }
function trText(lang,k){ return lang==="ms"?(TR.ms?TR.ms[k]:null):(window.QEN?window.QEN[k]:null); }

function downloadMs(btn, done){
  if(btn){ btn.disabled=true; btn.textContent=L2("Memuat turun…","Downloading…"); }
  H.fetch("https://api.alquran.cloud/v1/quran/ms.basmeih", function(status, body){
    var arr=null;
    try{ var j=JSON.parse(body); arr=[]; j.data.surahs.forEach(function(s){ s.ayahs.forEach(function(a){ arr.push(String(a.text||"").trim()); }); }); }catch(e){ arr=null; }
    if(!arr || arr.length!==6236){ if(btn){ btn.disabled=false; btn.textContent=L2("Cuba lagi","Try again"); } H.toast(L2("Muat turun gagal. Semak internet.","Download failed. Check the internet.")); return; }
    TR.ms=arr; if(window.Native && H.N.qWrite) H.N.qWrite("quran/tr/ms.json", JSON.stringify(arr));
    H.toast(L2("Terjemahan Melayu sedia","Malay translation ready")); if(done) done();
  });
}

// ---------- reading log, streak, khatam ----------
function logToday(){ var d=ymd(); if(!D.log[d]) D.log[d]={a:0,t:0,p:0}; return D.log[d]; }
function markSeen(k){
  if(D.seen.d!==ymd()) D.seen={d:ymd(), ks:{}};
  if(D.seen.ks[k]) return; D.seen.ks[k]=1; logToday().a++;
  var p=pageOf(k); if(k>=pageEndIdx(p)) markPage(p);
  dirty=true;
}
function markPage(p){ if(D.pr.charAt(p-1)==="1") return; D.pr=D.pr.slice(0,p-1)+"1"+D.pr.slice(p); logToday().p++; dirty=true; }
var dirty=false;
function flush(){ if(dirty){ dirty=false; saveD(); } }
function streak(){ var n=0, d=new Date(); var ok=function(x){ var l=D.log[ymd(x)]; return l && (l.a>0 || l.t>=60); };
  if(!ok(d)) d.setDate(d.getDate()-1);
  while(ok(d) && n<999){ n++; d.setDate(d.getDate()-1); } return n; }
function pagesRead(){ var n=0; for(var i=0;i<604;i++) if(D.pr.charAt(i)==="1") n++; return n; }
function goalNow(){ var l=D.log[ymd()]||{a:0,t:0,p:0}, g=D.goal; return g.k==="min"?[Math.floor(l.t/60), g.n]:g.k==="page"?[l.p, g.n]:[l.a, g.n]; }
function goalUnit(k){ return k==="min"?L2("minit","min"):k==="page"?L2("muka surat","pages"):L2("ayat","ayat"); }
// 0.5.23 (Quran Majeed style): plans by juz (30 days), hizb (half a juz, 60 days) or manzil (7 days), with today's part
var MANZIL=[1,5,10,17,26,37,50];
function unitPart(u, n){ // returns [first global ayat index, last index] for part n (1-based)
  if(u==="juz"){ var a=M.ja[n-1], b=n<30?M.ja[n]-1:6235; return [a,b]; }
  if(u==="manzil"){ var s0=MANZIL[n-1], s1=n<7?MANZIL[n]:115; return [M.sa[s0-1], s1<=114?M.sa[s1-1]-1:6235]; }
  var j=Math.ceil(n/2), J=unitPart("juz", j), p0=pageOf(J[0]), p1=pageOf(J[1]), mid=Math.round((p0+p1+1)/2); // hizb: first or second half of the juz by page
  return n%2 ? [J[0], Math.max(J[0], M.pa[mid-1]-1)] : [M.pa[mid-1], J[1]]; }
function unitToday(){ var P=D.plan; if(!P || !P.u) return null; var day=Math.max(1, Math.min(P.days, dayDiff(P.d0, ymd())+1)), R=unitPart(P.u, day), a=fromIdx(R[0]), b=fromIdx(R[1]);
  var lab=P.u==="juz"?"Juz "+day:P.u==="hizb"?"Hizb "+day+" (Juz "+Math.ceil(day/2)+")":"Manzil "+day;
  return {label:lab, range:sName(a[0])+" "+a[0]+":"+a[1]+" → "+sName(b[0])+" "+b[0]+":"+b[1]+" · "+L2("ms ","p. ")+pageOf(R[0])+"–"+pageOf(R[1]), k:R[0]}; }
function planInfo(){
  var P=D.plan; if(!P) return null;
  var day=dayDiff(P.d0, ymd())+1, done=pagesRead(), rem=604-done;
  if(day<1) return {pre:1-day, day:0, days:P.days, done:done, rem:rem, today:Math.ceil(rem/P.days), late:false, ram:P.ram};
  var left=Math.max(1, P.days-day+1);
  return {day:Math.min(day,P.days), days:P.days, done:done, rem:rem, today:Math.ceil(rem/left), late:day>P.days && rem>0, ram:P.ram};
}

// ================= HOME =================
function home(){
  var h='', L=D.last, gn=goalNow(), sk=streak(), pi=planInfo();
  h+='<div class="qhero card">';
  if(L){ var r=fromIdx(L.k); h+='<button class="qcont" data-open="'+L.k+'"><span class="qci">📖</span><span><small>'+L2("Teruskan bacaan","Continue reading")+'</small><b>'+E(sName(r[0]))+' · '+r[0]+':'+r[1]+'</b><small>'+L2("Muka surat ","Page ")+pageOf(L.k)+' · Juz '+juzOf(L.k)+'</small></span><span class="shGo">›</span></button>'; }
  else h+='<button class="qcont" data-open="0"><span class="qci">📖</span><span><small>'+L2("Mula membaca","Start reading")+'</small><b>Al-Fatihah</b><small>'+L2("Muka surat 1 · Juz 1","Page 1 · Juz 1")+'</small></span><span class="shGo">›</span></button>';
  var pct=Math.min(100, Math.round(gn[0]*100/Math.max(1,gn[1])));
  h+='<div class="qgoal"><div class="row"><span class="small">🎯 '+L2("Hari ini","Today")+': <b>'+gn[0]+'/'+gn[1]+'</b> '+goalUnit(D.goal.k)+(gn[0]>=gn[1]?' ✅':'')+'</span><span class="small">🔥 '+sk+' '+L2("hari","day"+(sk===1?"":"s"))+'</span></div><div class="bar"><div style="width:'+pct+'%"></div></div>';
  if(pi) h+='<div class="mut small">🏁 Khatam: '+L2("hari ","day ")+pi.day+'/'+pi.days+' · '+pi.done+'/604 '+L2("muka surat","pages")+' · '+(pi.rem?L2("sasaran hari ini ","today\u2019s target ")+pi.today+' '+L2("muka surat","pages"):L2("selesai! Alhamdulillah","finished! Alhamdulillah"))+'</div>';
  h+='</div>';
  // 0.26.0: browse chips sit under the progress bar; the bottom dock keeps the tools in Farah's order
  var chipB=function(x){ return '<button class="chip g3d'+(st.tab===x[0]?" on":"")+'" data-tab="'+x[0]+'"><span>'+x[1]+'</span>'+L2(x[2],x[3])+'</button>'; };
  h+='<div class="chips qbrowse">'+[["surah","📜","Surah","Surah"],["juz","🧩","Juz","Juz"],["page","📄","Halaman","Page"],["tema","🏷","Tema","Topic"],["info","ℹ️","Info","Info"]].map(chipB).join("")+'</div>'+favRow()+'</div>';
  var tab=st.tab;
  if(tab==="surah"){
    h+='<input type="search" class="ilq qfind" id="qFind" placeholder="'+L2("Cari surah: nama, nombor atau maksud","Find a surah: name, number or meaning")+'" value="'+E(st.find)+'">';
    h+='<div id="qSL" class="qlist">'+surahRows(st.find)+'</div>';
  } else if(tab==="juz"){
    h+='<div class="qjuz">';
    for(var j=1;j<=30;j++){ var k=M.ja[j-1], r=fromIdx(k), p0=pageOf(k), p1=j<30?pageOf(M.ja[j])-1:604, rd=0; for(var p=p0;p<=p1;p++) if(D.pr.charAt(p-1)==="1") rd++;
      h+='<button class="qjb" data-open="'+k+'"><b>'+j+'</b><span>'+E(sName(r[0]))+' '+r[0]+':'+r[1]+'</span><i style="width:'+Math.round(rd*100/Math.max(1,p1-p0+1))+'%"></i></button>'; }
    h+='</div>';
  } else if(tab==="page"){
    var cp=L?pageOf(L.k):1;
    h+='<div class="card"><h3>'+L2("Buka muka surat","Open a page")+'</h3><div class="row"><input type="number" id="qPg" min="1" max="604" value="'+cp+'" style="flex:1"><button class="btn gold" id="qPgGo">'+L2("Buka","Open")+'</button></div>'+
      '<input type="range" id="qPgR" min="1" max="604" value="'+cp+'" style="width:100%;margin-top:12px"><div class="mut small" id="qPgI"></div></div>';
    h+='<div class="snl">'+L2("Surah pilihan","Often read")+'</div><div class="qlist">'+[1,18,36,55,56,67,112,113,114].map(function(s){ return sRow(s); }).join("")+'</div>';
  } else if(tab==="lib") h+=library();
  else if(tab==="khatam") h+=khatam();
  else if(tab==="amal") h+=amalTab();
  else if(tab==="tema") h+=topicsTab();
  else if(tab==="kamus") h+=dictTab();
  else if(tab==="info") h+='<div class="mut small" style="margin:4px 2px 8px">'+L2("Pilih surah untuk melihat maklumat, turutan turun dan pengenalannya.","Pick a surah to see its facts, revelation order and introduction.")+'</div><div class="qlist">'+(function(){ var o=''; for(var s=1;s<=114;s++) o+=sRow(s).replace('data-open="'+M.sa[s-1]+'"','data-info="'+s+'"'); return o; })()+'</div>';
  else if(tab==="cari") h+='<input type="search" class="ilq qfind" id="qSQ" placeholder="'+L2("Cari: 2:255, Yasin, sabar, رحمة …","Search: 2:255, Yasin, patience, رحمة …")+'" value="'+E(st.sq)+'"><div id="qSR"></div>';
  h+='<div class="mut tiny qsrc">'+L2("Teks: KFGQPC Uthmani Hafs dan Quran.com (tajwid). Terjemahan Inggeris: Saheeh International. Terjemahan Melayu: Abdullah Muhammad Basmeih. Audio: 8 qari daripada EveryAyah. Maksud nama surah dalam Bahasa Melayu menunggu semakan ustaz.","Text: KFGQPC Uthmani Hafs and Quran.com (tajwid). English: Saheeh International. Malay: Abdullah Muhammad Basmeih. Audio: 8 reciters from EveryAyah. Word meanings: Quran.com.")+'</div>';
  h+='<div class="dock"><div class="chips qdock">'+[["lib","🔖","Simpanan","Saved"],["amal","🧠","Latihan","Practice"],["kamus","🌱","Kamus","Dictionary"],["khatam","🏁","Khatam","Khatam"],["cari","🔍","Cari","Search"]].map(chipB).join("")+'</div></div>';
  box.innerHTML=h;
  qa("[data-tab]").forEach(function(b){ b.onclick=function(){ st.tab=b.getAttribute("data-tab"); home(); view().scrollTop=0; }; });
  bindOpen(); bindFav();
  var f=q("#qFind"); if(f) f.oninput=function(){ st.find=f.value; q("#qSL").innerHTML=surahRows(st.find); bindOpen(); bindFav(); };
  var pg=q("#qPg"), pr=q("#qPgR"); if(pg){ var info=function(){ var p=Math.max(1,Math.min(604,+pg.value||1)), k=M.pa[p-1], r=fromIdx(k); q("#qPgI").textContent=L2("Bermula: ","Starts: ")+sName(r[0])+" "+r[0]+":"+r[1]+" · Juz "+juzOf(k); };
    pg.oninput=function(){ pr.value=pg.value; info(); }; pr.oninput=function(){ pg.value=pr.value; info(); }; info();
    q("#qPgGo").onclick=function(){ var p=Math.max(1,Math.min(604,+pg.value||1)); openRead(M.pa[p-1], "mushaf"); }; }
  if(tab==="lib") bindLib();
  if(tab==="khatam") bindKhatam();
  if(tab==="kamus") bindDict();
  if(tab==="tema") bindTopics();
  if(tab==="amal") bindAmal();
  if(tab==="info") qa("[data-info]").forEach(function(b){ b.onclick=function(){ infoSheet(+b.getAttribute("data-info")); }; });
  if(tab==="cari"){ var sq=q("#qSQ"); sq.oninput=function(){ st.sq=sq.value; doSearch(); }; doSearch(); if(!st.sq) setTimeout(function(){ try{ sq.focus(); }catch(e){} },60); }
  H.dockFix();
}
function sRow(s){ var m=sMeta(s);
  var fv=(D.fav||[]).indexOf(s)>=0;
  return '<div class="qsrw"><button class="qsr" data-open="'+M.sa[s-1]+'"><span class="qno">'+s+'</span><span class="qsn"><b>'+E(m[1])+'</b><small>'+smP(s)+(m[3]==="m"?L2("Makkiyah","Makki"):L2("Madaniyah","Madani"))+' · '+m[4]+' '+L2("ayat","ayat")+'</small></span><span class="qsa">'+E(m[0])+'</span></button><button class="qstar'+(fv?' on':'')+'" data-qfav="'+s+'" aria-label="'+L2("Kegemaran","Favourite")+'">'+(fv?'★':'☆')+'</button></div>'; }
// 0.6.31 (owner): starred surahs sit in a row under the browse tabs
function favRow(){ var f=(D.fav||[]).filter(function(x){ return x>=1 && x<=114; });
  return '<div class="qfavs">'+(f.length?f.map(function(x){ return '<button class="chip" data-open="'+M.sa[x-1]+'">⭐ '+E(sMeta(x)[1])+'</button>'; }).join(""):'<span class="mut tiny">⭐ '+L2("Tekan ☆ pada surah untuk tambah ke kegemaran","Tap ☆ on a surah to add it to favourites")+'</span>')+'</div>'; }
function bindFav(){ qa("[data-qfav]").forEach(function(b){ if(b._f) return; b._f=1; b.onclick=function(e){ e.stopPropagation(); var x=+b.getAttribute("data-qfav"); D.fav=D.fav||[]; var i=D.fav.indexOf(x); if(i>=0) D.fav.splice(i,1); else D.fav.push(x); saveD();
  var on=i<0; qa('[data-qfav="'+x+'"]').forEach(function(y){ y.classList.toggle("on", on); y.textContent=on?"★":"☆"; }); var fr=q(".qfavs"); if(fr){ fr.outerHTML=favRow(); bindOpen(); } }; }); }
function norm(t){ return String(t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim(); }
function surahRows(f){
  var v=norm(f), out=[]; if(f && !v) return '';
  for(var s=1;s<=114;s++){ var m=sMeta(s); if(!v || String(s)===v || norm(m[1]).replace(/^(al|an|ar|as|at|ad|az|ash|adh)\s?/,"").indexOf(v.replace(/^(al|an|ar|as|at|ad|az|ash|adh)\s?/,""))>=0 || norm(m[1]).indexOf(v)>=0 || norm(sMean(s)).indexOf(v)>=0 || norm(m[2]).indexOf(v)>=0) out.push(sRow(s)); }
  return out.join("")||'<div class="mut small" style="padding:10px">'+L2("Tiada surah sepadan.","No matching surah.")+'</div>';
}
function bindOpen(){ qa("[data-open]").forEach(function(b){ if(b._b) return; b._b=1; b.onclick=function(){ openRead(+b.getAttribute("data-open")); }; }); }

// ---------- saved: bookmarks + notes ----------
function colName(c){ return c||L2("Kegemaran","Favourites"); }
// 0.5.23 (Ayah style): each bookmark collection has a colour (tap the dot to change it)
var BMC=["#c9a646","#e0605a","#4a9be8","#3ddc84","#b07ae8","#f2994a","#9aa3a0"];
function colColor(c){ D.colc=D.colc||{}; return D.colc[c||""]||BMC[(D.cols.indexOf(c)+1)%BMC.length]; }
function library(){
  var h='';
  if(!D.bm.length && !Object.keys(D.notes).length) return '<div class="card mut">'+L2("Belum ada simpanan. Ketik nombor ayat ketika membaca untuk menanda buku atau menulis nota.","Nothing saved yet. Tap an ayat number while reading to bookmark it or write a note.")+'</div>';
  var groups={}; D.bm.forEach(function(b){ (groups[b.c||""]=groups[b.c||""]||[]).push(b); });
  Object.keys(groups).sort().forEach(function(c){
    h+='<div class="snl qcolh"><button class="qcold" data-colc="'+E(c)+'" style="background:'+colColor(c)+'" aria-label="'+L2("Tukar warna","Change colour")+'"></button>'+E(colName(c))+' ('+groups[c].length+')</div><div class="qlist">'+groups[c].slice().reverse().map(function(b){ var r=fromIdx(b.k), tx=trText(trList()[0]||"en", b.k)||"";
      return '<div class="qbm"><button class="qsr" data-open="'+b.k+'"><span class="qno">'+r[1]+'</span><span class="qsn"><b>'+E(sName(r[0]))+' '+r[0]+':'+r[1]+'</b><small>'+E(tx.slice(0,90))+(tx.length>90?"…":"")+'</small></span></button><button class="ib" data-unbm="'+b.k+'|'+E(b.c||"")+'">✕</button></div>'; }).join("")+'</div>';
  });
  var nk=Object.keys(D.notes);
  if(nk.length) h+='<div class="snl">📝 '+L2("Nota","Notes")+' ('+nk.length+')</div><div class="qlist">'+nk.sort(function(a,b){ return a-b; }).map(function(k){ var r=fromIdx(+k), n=D.notes[k];
    return '<button class="qsr" data-open="'+k+'"><span class="qno">📝</span><span class="qsn"><b>'+E(sName(r[0]))+' '+r[0]+':'+r[1]+'</b><small>'+E(n.t.slice(0,120))+'</small></span></button>'; }).join("")+'</div>';
  return h;
}
function bindLib(){ needEn(function(){}); qa("[data-colc]").forEach(function(b){ b.onclick=function(){ var c=b.getAttribute("data-colc"), i=BMC.indexOf(colColor(c)); D.colc=D.colc||{}; D.colc[c]=BMC[(i+1)%BMC.length]; saveD(); home(); }; }); qa("[data-unbm]").forEach(function(b){ b.onclick=function(){ var p=b.getAttribute("data-unbm").split("|"); D.bm=D.bm.filter(function(x){ return !(x.k===+p[0] && (x.c||"")===p[1]); }); saveD(); home(); }; }); }

// ---------- khatam + goal ----------
function khatam(){
  var pi=planInfo(), h='<div class="card"><h3>🏁 '+L2("Perancang khatam","Khatam planner")+'</h3>';
  if(pi){
    if(pi.ram) h+='<div class="badge">🌙 '+L2("Khatam Ramadan: sasaran harian dikira semula setiap hari supaya tamat pada 29 Ramadan","Ramadan khatam: the daily target is recalculated each day to finish on 29 Ramadan")+'</div>';
    if(pi.pre) h+='<div class="small">'+L2("Bermula dalam ","Starts in ")+pi.pre+' '+L2("hari","days")+' ('+D.plan.d0+')</div>';
    h+='<div class="small">'+L2("Hari ","Day ")+pi.day+' '+L2("daripada","of")+' '+pi.days+' · '+pi.done+'/604 '+L2("muka surat dibaca","pages read")+'</div><div class="bar"><div style="width:'+Math.round(pi.done*100/604)+'%"></div></div>';
    var pu=unitToday(); if(pu) h+='<div class="qunit"><span>'+L2("Bacaan hari ini","Today\u2019s reading")+'</span><b>'+E(pu.label)+'</b><small>'+E(pu.range)+'</small><button class="btn gold g3d" data-open="'+pu.k+'">📖 '+L2("Baca","Read")+'</button></div>';
    h+=pi.rem?'<div class="small">'+L2("Sasaran hari ini: ","Today\u2019s target: ")+'<b>'+pi.today+' '+L2("muka surat","pages")+'</b>'+(pi.late?' · '+L2("melebihi tempoh, teruskan!","past the plan, keep going!"):'')+'</div>':'<div class="small">🎉 '+L2("Khatam! Alhamdulillah.","Khatam! Alhamdulillah.")+'</div>';
    h+='<div class="qpg">'; for(var i=0;i<604;i++) h+='<i class="'+(D.pr.charAt(i)==="1"?"on":"")+'"></i>'; h+='</div><div class="mut tiny">'+L2("Setiap petak ialah satu muka surat.","Each square is one page.")+'</div>';
    h+='<div class="row" style="margin-top:10px"><button class="btn alt" id="qPlanX">'+L2("Padam pelan","Remove plan")+'</button><button class="btn alt" id="qPlanR">'+L2("Mula semula","Start over")+'</button></div>';
  } else {
    h+='<div class="mut small">'+L2("Pilih tempoh. Muka surat yang anda baca (paparan ayat atau mushaf) dikira secara automatik.","Pick a length. Pages you read (ayat or mushaf view) are counted automatically.")+'</div><div class="chips" style="margin-top:8px">'+
      [[7,"7 hari","7 days"],[15,"15 hari","15 days"],[30,"30 hari","30 days"],[60,"60 hari","60 days"],[90,"3 bulan","3 months"],[365,"1 tahun","1 year"]].map(function(x){ return '<button class="chip" data-plan="'+x[0]+'">'+L2(x[1],x[2])+'</button>'; }).join("")+'</div>'+
      '<div class="snl" style="margin-top:10px">'+L2("Atau ikut bahagian sehari","Or one part a day")+'</div><div class="chips" style="flex-wrap:wrap">'+
      [["juz",30,"1 juz sehari (30 hari)","1 juz a day (30 days)"],["hizb",60,"1 hizb sehari (60 hari)","1 hizb a day (60 days)"],["manzil",7,"1 manzil sehari (7 hari)","1 manzil a day (7 days)"]].map(function(x){ return '<button class="chip" data-planu="'+x[0]+'" data-pd="'+x[1]+'">'+L2(x[2],x[3])+'</button>'; }).join("")+'</div>'+
      '<button class="btn gold full" id="qRam" style="margin-top:10px">🌙 '+L2("Khatam Ramadan (1 hingga 29 Ramadan)","Ramadan khatam (1 to 29 Ramadan)")+'</button>';
  }
  // 0.7.93 (owner #7): Khatam together is also an option here
  h+='</div><div class="card qkb"><h3>👨‍👩‍👧‍👦 '+L2("Khatam bersama keluarga","Family khatam")+'</h3><div class="mut small">'+L2("Bahagikan 30 juz kepada ahli keluarga atau usrah. Setiap orang tanda juz masing-masing; doa khatam dikongsi bila semua selesai.","Split the 30 juz among family or usrah. Each person ticks their juz; the khatam doa is shared when everyone is done.")+'</div>'+
    (D.grp.length?'<div class="qkbL">'+D.grp.map(function(x){ var n=x.d.split("").filter(function(c){ return c==="1"; }).length; return '<button class="chip" data-kgrp="'+x.id+'">'+E(x.n)+' · '+n+'/30</button>'; }).join("")+'</div>':'')+
    '<button class="btn gold full" data-qgo="grp" style="margin-top:8px">'+(D.grp.length?L2("Urus kumpulan khatam","Manage khatam groups"):"＋ "+L2("Mula khatam bersama","Start a family khatam"))+'</button>';
  h+='</div><div class="card"><h3>🎯 '+L2("Sasaran harian","Daily goal")+'</h3><div class="chips">'+[["ayat","Ayat","Ayat"],["page","Muka surat","Pages"],["min","Minit","Minutes"]].map(function(x){ return '<button class="chip'+(D.goal.k===x[0]?" on":"")+'" data-gk="'+x[0]+'">'+L2(x[1],x[2])+'</button>'; }).join("")+'</div>'+
    '<div class="row" style="margin-top:10px"><button class="chip" data-gn="-1">−</button><b style="font-size:20px">'+D.goal.n+' '+goalUnit(D.goal.k)+'</b><button class="chip" data-gn="1">+</button></div></div>';
  // last 14 days
  var d=new Date(); d.setDate(d.getDate()-13); var cells='', mx=1, arr=[];
  for(var i2=0;i2<14;i2++){ var l=D.log[ymd(d)]||{a:0,t:0}; arr.push([ymd(d),l]); mx=Math.max(mx,l.a); d.setDate(d.getDate()+1); }
  arr.forEach(function(x){ cells+='<div class="qday"><i style="height:'+Math.round(x[1].a*100/mx)+'%"></i><small>'+(+x[0].slice(8))+'</small></div>'; });
  h+='<div class="card"><h3>📈 '+L2("14 hari terakhir","Last 14 days")+'</h3><div class="qdays">'+cells+'</div><div class="mut small">🔥 '+L2("Rentetan: ","Streak: ")+streak()+' '+L2("hari","days")+' · '+L2("Jumlah ayat hari ini: ","Ayat today: ")+((D.log[ymd()]||{a:0}).a)+' · '+L2("Masa: ","Time: ")+Math.round(((D.log[ymd()]||{t:0}).t)/60)+' '+L2("minit","min")+'</div></div>';
  return h;
}
function bindKhatam(){
  qa("[data-qgo]").forEach(function(b){ b.onclick=function(){ goV(b.getAttribute("data-qgo")); }; });
  qa("[data-kgrp]").forEach(function(b){ b.onclick=function(){ st.grp=b.getAttribute("data-kgrp"); goV("grp"); }; });
  qa("[data-plan]").forEach(function(b){ b.onclick=function(){ D.plan={d0:ymd(), days:+b.getAttribute("data-plan")}; D.pr=new Array(605).join("0"); saveD(); home(); }; });
  qa("[data-planu]").forEach(function(b){ b.onclick=function(){ D.plan={d0:ymd(), days:+b.getAttribute("data-pd"), u:b.getAttribute("data-planu")}; D.pr=new Array(605).join("0"); if(!D.set.rem) D.set.rem={}; D.set.rem.daily=true; saveD(); home(); H.toast(L2("Peringatan harian dihidupkan","Daily reminder switched on")); }; });
  var rb=q("#qRam"); if(rb) rb.onclick=function(){ var d0=ramadanStart(); if(!d0){ H.toast(L2("Tarikh Ramadan tidak dapat dikira","Could not work out the Ramadan date")); return; } D.plan={d0:d0, days:29, ram:true}; D.pr=new Array(605).join("0"); saveD(); home(); };
  var x=q("#qPlanX"); if(x) x.onclick=function(){ D.plan=null; saveD(); home(); };
  var r=q("#qPlanR"); if(r) r.onclick=function(){ D.plan.d0=ymd(); D.pr=new Array(605).join("0"); saveD(); home(); };
  qa("[data-gk]").forEach(function(b){ b.onclick=function(){ D.goal.k=b.getAttribute("data-gk"); D.goal.n=D.goal.k==="min"?15:D.goal.k==="page"?4:10; saveD(); home(); }; });
  qa("[data-gn]").forEach(function(b){ b.onclick=function(){ var st2=D.goal.k==="ayat"?5:1; D.goal.n=Math.max(1, D.goal.n+st2*(+b.getAttribute("data-gn"))); saveD(); home(); }; });
}

// ---------- search ----------
function arNorm(t){ return String(t||"").replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,"").replace(/[إأآٱا]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/ؤ/g,"و").replace(/ئ/g,"ي").replace(/\s+/g," ").trim(); }
var QARN=null;
function doSearch(){
  var R=q("#qSR"); if(!R) return; var v=st.sq.trim();
  if(v.length<2){ R.innerHTML='<div class="mut small" style="padding:8px 2px">'+L2("Taip rujukan (2:255), nama surah, perkataan Melayu/Inggeris atau perkataan Arab.","Type a reference (2:255), a surah name, an English/Malay word or an Arabic word.")+'</div>'; return; }
  var out='', m=v.match(/^(\d{1,3})\s*[:. ]\s*(\d{1,3})$/);
  if(m){ var s=+m[1], a=+m[2]; if(s>=1&&s<=114&&a>=1&&a<=sMeta(s)[4]) out+='<div class="snl">'+L2("Rujukan","Reference")+'</div>'+'<button class="qsr" data-open="'+gIdx(s,a)+'"><span class="qno">'+a+'</span><span class="qsn"><b>'+E(sName(s))+' '+s+':'+a+'</b></span></button>'; }
  var sr=surahRows(v); if(sr.indexOf("qsr")>=0 && !/^\d+$/.test(v)) out+='<div class="snl">Surah</div><div class="qlist">'+sr+'</div>';
  R.innerHTML=out+'<div id="qSR2" class="mut small">'+L2("Mencari…","Searching…")+'</div>'; bindOpen();
  var my=v;
  var show=function(hits, total){ if(st.sq.trim()!==my) return; var el=q("#qSR2"); if(!el) return;
    el.className=""; el.innerHTML='<div class="snl">'+L2("Ayat","Ayat")+' ('+total+(total>hits.length?", "+L2("100 pertama","first 100"):"")+')</div>'+(hits.length?hits.map(function(x){ var r=fromIdx(x[0]);
      return '<button class="qsr" data-open="'+x[0]+'"><span class="qno">'+r[1]+'</span><span class="qsn"><b>'+E(sName(r[0]))+' '+r[0]+':'+r[1]+'</b><small'+(x[2]?' class="qsar"':'')+'>'+x[1]+'</small></span></button>'; }).join(""):'<div class="mut small">'+L2("Tiada ayat sepadan.","No matching ayat.")+'</div>'); bindOpen(); };
  if(LET.test(v)){
    needAr(function(){ if(!QARN) QARN=window.QAR.map(arNorm); var nv=arNorm(v), hits=[], total=0;
      for(var k=0;k<6236;k++){ var i=QARN[k].indexOf(nv); if(i>=0){ total++; if(hits.length<100) hits.push([k, E(window.QAR[k].slice(0,140)), 1]); } } show(hits,total); });
  } else {
    needEn(function(){ msReady(); var nv=v.toLowerCase(), hits=[], total=0, langs=TR.ms?["ms","en"]:["en"];
      for(var k=0;k<6236;k++){ for(var li=0;li<langs.length;li++){ var t=trText(langs[li],k)||"", i=t.toLowerCase().indexOf(nv); if(i>=0){ total++;
        if(hits.length<100){ var a0=Math.max(0,i-50), sn=(a0?"…":"")+E(t.slice(a0,i))+'<mark>'+E(t.slice(i,i+nv.length))+'</mark>'+E(t.slice(i+nv.length,i+nv.length+70))+"…"; hits.push([k,sn,0]); } break; } } }
      show(hits,total); });
  }
}

// ================= READER =================
function openRead(k, mode){
  stopAuto(); k=Math.max(0,Math.min(6235,k|0));
  st.from=st.v==="list"?st.list:null; st.fromV=(st.v==="map"||st.v==="grp"||st.v==="home")?st.v:null; var r=fromIdx(k); st.v="read"; st.s=r[0]; st.go=k; st.page=pageOf(k); if(mode) { D.set.mode=mode; saveD(); }
  D.last={k:k}; saveD(); render(); view().scrollTop=0;
}
function mushHdr(){ var k0=M.pa[st.page-1], r0=fromIdx(k0); return '<b>'+E(sName(r0[0]))+' <span class="qarS">'+E(sMeta(r0[0])[0])+'</span></b><small>'+L2("Muka surat ","Page ")+st.page+' · Juz '+juzOf(k0)+'</small>'; }
// 0.26.0: page turns slide the new page in and keep the scroll position (no jump back to the top)
// 0.33.0: d = +1 forward (finger moved right, like a mushaf), the new page enters from the left to finish that motion
function slideIn(el, d){ if(!el || !d) return; if(window.IbSwipe) IbSwipe.inFrom(el, d); else { el.classList.remove("qsl-r","qsl-l"); void el.offsetWidth; el.classList.add(d>0?"qsl-r":"qsl-l"); } }
function reader(){
  var m=D.set.mode, h='<div class="qtop"><button class="ib" id="qBack">‹</button><div class="qtt">';
  if(m==="mushaf") h+='<span id="qHdr">'+mushHdr()+'</span>';
  else h+='<b>'+E(sName(st.s))+' <span class="qarS">'+E(sMeta(st.s)[0])+'</span></b><small>'+E(sMean(st.s))+' · '+sMeta(st.s)[4]+' '+L2("ayat","ayat")+'</small>';
  h+='</div><div class="qmodes">'+[["ayat","📜",L2("Ayat","Ayat")],["mushaf","📖","Mushaf"],["tr","📝",L2("Terjemahan","Translation")]].map(function(x){ return '<button class="qmb'+(x[0]===m?" on":"")+'" data-mode="'+x[0]+'">'+x[1]+' '+x[2]+'</button>'; }).join("")+'</div></div>';
  h+='<div id="qBody" class="'+(m==="mushaf"?"qmush":m==="tr"?"qtrv qtl-"+(D.set.trl||"row"):"qayat")+(D.set.cmp?" qcmp":"")+' qf-'+D.set.font+'"><div class="card mut">'+L2("Memuatkan…","Loading…")+'</div></div>';
  h+='<div class="dock qrdock"><div class="grp3">'+
    '<button class="chip g3d" id="qPrev" aria-label="'+L2("Surah seterusnya","Next surah")+'">◀'+(m==="tr"?'':' '+L2("Seterus","Next"))+'</button>'+
    '<button class="chip g3d" id="qPlay">▶ '+L2("Dengar","Listen")+'</button>'+
    (m==="tr"?'<button class="chip g3d" id="qSay">🗣 '+L2("Baca","Read")+'</button>':'')+
    '<button class="chip g3d" id="qSet">⚙</button>'+
    (m!=="mushaf"?'<button class="chip g3d" id="qAuto">⇅ Auto</button>':'')+
    '<button class="chip g3d" id="qNext" aria-label="'+L2("Surah sebelum","Previous surah")+'">'+(m==="tr"?'':L2("Sebelum","Prev")+' ')+'▶</button></div>'+
    '<div id="qAsBar" class="qasbar hidden"><span class="small">⇅ '+L2("Tekan & tahan skrin untuk jeda","Press & hold the screen to pause")+'</span><button class="chip" data-asd="-1">−</button><b id="qAsV"></b><button class="chip" data-asd="1">+</button><button class="chip" id="qAsX">✕</button></div></div>';
  box.innerHTML=h;
  q("#qBack").onclick=function(){ back(); };
  qa("[data-mode]").forEach(function(b){ b.onclick=function(){ if(b.classList.contains("on")) return; var k=curIdx(); sayStop(); D.set.mode=b.getAttribute("data-mode"); saveD(); openRead(k); }; });
  var sy=q("#qSay"); if(sy) sy.onclick=function(){ if(SAYQ.on) sayStop(); else sayFrom(curIdx()); };
  q("#qSet").onclick=settingsSheet;
  q("#qPlay").onclick=function(){ if(SAYQ.on){ sayStop(); return; } if(isQPlaying()){ H.N.playerCmd("toggle",0); setTimeout(audioTick,200); } else if(isQActive()){ H.N.playerCmd("toggle",0); setTimeout(audioTick,200); } else audioSheet(curIdx()); };
  var A=q("#qAuto"); if(A) A.onclick=function(){ if(asOn) stopAuto(); else startAuto(); };
  qa("[data-asd]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); D.set.as=Math.max(6,Math.min(160,D.set.as+(+b.getAttribute("data-asd"))*(D.set.as<30?2:6))); saveD(); asLabel(); }; });
  var ax=q("#qAsX"); if(ax) ax.onclick=function(){ stopAuto(); };
  if(m==="mushaf"){
    q("#qPrev").onclick=function(){ turn(1); }; q("#qNext").onclick=function(){ turn(-1); };
    needPage(st.page, function(){ if(st.v==="read" && D.set.mode==="mushaf") drawPage(); });
  } else {
    q("#qPrev").onclick=function(){ sayStop(); if(st.s<114) openRead(M.sa[st.s]); };
    q("#qNext").onclick=function(){ sayStop(); if(st.s>1) openRead(M.sa[st.s-2]); };
    var s=st.s, list=m==="tr"?trList2():trList(), need=function(){ if(list.indexOf("en")>=0 && !window.QEN) return needEn(draw); draw(); }, draw=function(){ if(st.v==="read" && st.s===s && D.set.mode===m){ if(m==="tr") drawTr(); else drawSurah(); } };
    if(list.indexOf("ms")>=0) msReady();
    needSurah(s, need);
  }
  H.dockFix(); startAudioPoll(); startTrack();
}

// ----- ayat view -----
var TJC=null;
function tjClass(bits){
  if(!bits || !D.set.tj) return "";
  var lg=M.tj, best=-1;
  for(var i=0;i<lg.length;i++){ if(!(bits & (1<<i))) continue; if(lg[i]==="tafkhim"||lg[i]==="tarqiq"){ if(D.set.tf && best<0) best=i; continue; } best=i; break; }
  return best<0?"":"tj-"+lg[best];
}
function ayahWords(segs){
  // -> [{h:html, w:bool}] split at spaces; colour runs keep their tajwid class
  var words=[], cur=[];
  var push=function(){ if(cur.length){ var txt=cur.map(function(x){ return x[0]; }).join(""); words.push({h:cur.map(function(x){ var c=tjClass(x[1]); return c?'<span class="'+c+'">'+E(x[0])+'</span>':E(x[0]); }).join(""), w:LET.test(txt), t:txt}); cur=[]; } };
  segs.forEach(function(sg){ var t=typeof sg==="string"?sg:sg[0], b=typeof sg==="string"?0:sg[1]; var parts=t.split(" ");
    parts.forEach(function(p,i){ if(i>0) push(); if(p) cur.push([p,b]); }); });
  push(); return words;
}
// 0.34.0: the HTML of a surah (lim = only the first ayat, for the neighbour that rides in during a swipe)
function surahHtml(s, lim, from){
  var d=SUR[s], m=sMeta(s), list=trList(); from=from||0;
  var h=from?'':'<div class="qshead"><div class="qsframe"><span>'+E(m[0])+'</span></div><small>'+E(m[1])+' · '+smP(s)+(m[3]==="m"?L2("Makkiyah","Makki"):L2("Madaniyah","Madani"))+' · '+m[4]+' '+L2("ayat","ayat")+' · Juz '+juzOf(M.sa[s-1])+'</small><button class="chip qib" id="qInfo">ℹ️ '+L2("Info surah","Surah info")+'</button>'+
    (s!==1&&s!==9?'<div class="qbasm">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>':'')+'</div>';
  if(list.indexOf("ms")>=0 && !TR.ms) h+='<div class="card qdl"><div class="small">'+L2("Terjemahan Melayu (Abdullah Muhammad Basmeih) perlu dimuat turun sekali, kira-kira 2 MB.","The Malay translation (Abdullah Muhammad Basmeih) needs a one-time download, about 2 MB.")+'</div><button class="btn gold" id="qDlMs" style="margin-top:8px">⬇ '+L2("Muat turun","Download")+'</button></div>';
  var inter=D.set.wbw==="under";
  if(!d) return h;
  if(!lim && !from && D.set.wl==="id" && !WID[s] && D.set.wbw!=="off") needWid(s, function(ok){ if(ok && inter && st.v==="read" && st.s===s && D.set.mode==="ayat"){ st.go=curIdx(); drawSurah(); } });
  d.t.forEach(function(segs,i){
    if(i<from || (lim && i>=from+lim)) return;
    var k=M.sa[s-1]+i, a=i+1, ws=ayahWords(segs), wi=0, W=d.w[i]||[], arH='';
    ws.forEach(function(w){ if(w.w){ var mean=W[wi]; if(inter) arH+='<span class="qw qwi" data-w="'+wi+'"><span class="qwa">'+w.h+'</span><small>'+E(wMean(s,a,wi,mean))+'</small></span> '; else arH+='<span class="qw" data-w="'+wi+'">'+w.h+'</span> '; wi++; } else arH+='<span class="qwm">'+w.h+'</span> '; });
    arH+='<span class="qend">﴿'+adig(a)+'﴾</span>';
    var bm=D.bm.some(function(b){ return b.k===k; }), note=D.notes[k];
    h+='<div class="qa'+(k===playK?" play":"")+'" id="qa'+k+'" data-k="'+k+'"><div class="qah"><button class="qn" data-act="'+k+'">'+s+':'+a+'</button>'+(bm?'<span class="qbmk">🔖</span>':'')+(note?'<span class="qbmk">📝</span>':'')+(M.sj.indexOf(k)>=0?'<span class="badge">'+L2("Sujud tilawah","Prostration")+' ۩</span>':'')+'<span class="qpgn">'+L2("hlm ","p. ")+pageOf(k)+'</span></div>'+
      (D.set.arOn===false?'':'<div class="qar'+(inter?" inter":"")+'" dir="rtl" lang="ar">'+arH+'</div>');
    if(D.set.rumi && W.length) h+='<div class="qrm">'+E(W.map(function(x){ return x[1]; }).join(" "))+'</div>';
    list.forEach(function(lg){ var t=trText(lg,k); if(t) h+='<div class="qtr"><span class="qlg">'+(lg==="ms"?"MY":"EN")+'</span>'+E(t)+'</div>'; });
    if(note) h+='<div class="qnote">📝 '+E(note.t)+'</div>';
    h+='</div>';
  });
  if(!lim) h+='<div class="qendnav">'+(s<114?'<button class="btn gold full" data-open="'+M.sa[s]+'">'+L2("Surah seterusnya: ","Next surah: ")+E(sName(s+1))+' ›</button>':'<div class="card" style="text-align:center">صَدَقَ ٱللَّهُ ٱلْعَظِيمُ</div>')+'</div>';
  return h;
}
function drawSurah(){
  var s=st.s, B=q("#qBody"); if(!B) return;
  var h=surahHtml(s);
  B.innerHTML=h; applySizes(); bindOpen();
  // 0.34.0: load both neighbours now so a swipe can show them riding in beside this one
  [s-1,s+1].forEach(function(x){ if(x>=1&&x<=114) needSurah(x,function(){}); });
  var dl=q("#qDlMs"); if(dl) dl.onclick=function(){ downloadMs(dl, function(){ if(st.v==="read") drawSurah(); }); };
  var ib=q("#qInfo"); if(ib) ib.onclick=function(){ infoSheet(s); };
  B.onclick=function(e){
    var n=e.target.closest("[data-act]"); if(n){ ayahSheet(+n.getAttribute("data-act")); return; }
    var w=e.target.closest(".qw"); if(w){ var card=w.closest(".qa"), k=+card.getAttribute("data-k"); if(D.set.wbw==="off"){ ayahSheet(k); return; } wordPop(w, k, +w.getAttribute("data-w")); return; }
  };
  if(st.go!=null && st.quietGo){ st.go=null; st.quietGo=false; }
  if(st.go!=null){ var g=st.go; st.go=null; var el=q("#qa"+g); if(el && g!==M.sa[s-1]) setTimeout(function(){ el.scrollIntoView({block:"start"}); view().scrollTop-=60; flash(el); },30); }
  if(st.slide){ slideIn(B, st.slide); st.slide=0; }
  observe(); swipeSurah(B);
}
// 0.18.0: swipe sideways to change surah; like a mushaf, swiping right goes forward
function swipeSurah(B){
  // 0.33.0: the surah follows the finger (like the Zikir pages); let go and the next surah slides in
  window.IbSwipe(B, {skip:function(){ return asOn; }, can:function(s){ return s>0 ? st.s<114 : st.s>1; },
    // 0.34.1 (Farah): each surah keeps where you were reading; swipe away and back and you land on the same ayat
    go:function(s){ sayStop(); var n=st.s+(s>0?1:-1); st.pos[st.s]=curIdx(); var k=swK(n); st.swTo=k; st.quietGo=true; st.slide=s; openRead(k); },
    find:function(){ var k=st.swTo; st.swTo=null; return (k!=null && k!==M.sa[st.s-1] && q("#qa"+k)) || q("#qBody"); },
    // 0.34.0: the neighbouring surah (its heading and first ayat) rides in beside the finger, so there is no blank gap
    peek:function(s){ var n=st.s+(s>0?1:-1); if(n<1||n>114) return null;
      if(D.set.mode==="tr"){ var lgs=trList2(); if(lgs.some(function(lg){ return !trReady(lg); })) return trHead(n); st.peekK=swK(n); try{ return trHead(n)+trPara(n, lgs); }catch(e){ return trHead(n); } }
      var k=swK(n), from=k-M.sa[n-1]; return surahHtml(n, 14, from>0?from:0); },
    fit:function(g){ g.style.setProperty("--qar", D.set.ar+"px"); g.style.setProperty("--qts", D.set.ts+"px");
      // translation view shows the whole surah: lift it so the saved ayat sits at the top, and hide what is above
      var k=st.peekK; st.peekK=null; if(D.set.mode!=="tr" || k==null) return; var a=g.querySelector('[data-k="'+k+'"]'); if(!a || a.offsetTop<40) return;
      var off=a.offsetTop; g.style.top=(parseFloat(g.style.top)-off)+"px"; g.style.clipPath="inset("+off+"px 0 0 0)"; }}); }
function swK(n){ var k=st.pos[n]; return k!=null && k>=M.sa[n-1] && k<M.sa[n-1]+sMeta(n)[4] ? k : M.sa[n-1]; }
function flash(el){ el.classList.add("hl"); setTimeout(function(){ el.classList.remove("hl"); },1600); }
// 0.5.23 (Quran Majeed style): warm sepia reading, always or automatically at night (7 pm to 6 am)
function sepiaOn(){ var v=D.set.sep||"off", h=new Date().getHours(); return v==="on" || (v==="auto" && (h>=19 || h<6)); }
function applySizes(){ var B=q("#qBody"); if(!B) return; B.style.setProperty("--qar", D.set.ar+"px"); B.style.setProperty("--qts", D.set.ts+"px"); B.classList.toggle("qsepia", sepiaOn()); }

// word meaning bubble
var wAudio=null;
function wordPop(el, k, wi){
  var old=document.getElementById("qWp"); if(old) old.remove();
  var r=fromIdx(k), W=(SUR[r[0]].w[r[1]-1]||[])[wi]; if(!W){ ayahSheet(k); return; }
  var p=document.createElement("div"); p.id="qWp"; p.className="qwp";
  p.innerHTML='<div class="qwpa" dir="rtl">'+(el.querySelector(".qwa")||el).innerHTML+'</div><b>'+E(wMean(r[0],r[1],wi,W))+'</b><small>'+E(W[1])+'</small><div id="qWpR" class="qwpr"></div><div class="row" style="margin-top:6px"><button class="chip" id="qWpS">🔊</button><button class="chip" id="qWpA">'+r[0]+':'+r[1]+' ›</button></div>';
  document.body.appendChild(p);
  var rc=el.getBoundingClientRect(), pw=Math.min(260, window.innerWidth-20);
  p.style.width=pw+"px"; p.style.left=Math.max(10,Math.min(window.innerWidth-pw-10, rc.left+rc.width/2-pw/2))+"px";
  var top=rc.top-p.offsetHeight-8; p.style.top=(top<70?rc.bottom+8:top)+"px";
  qa(".qw.sel").forEach(function(x){ x.classList.remove("sel"); }); el.classList.add("sel");
  p.querySelector("#qWpS").onclick=function(e){ e.stopPropagation(); try{ if(wAudio) wAudio.pause(); wAudio=new Audio("https://audio.qurancdn.com/wbw/"+pad3(r[0])+"_"+pad3(r[1])+"_"+pad3(wi+1)+".mp3"); wAudio.play().catch(function(){ H.toast(L2("Audio perkataan perlukan internet","Word audio needs the internet")); }); }catch(err){} };
  p.querySelector("#qWpA").onclick=function(e){ e.stopPropagation(); closePop(); ayahSheet(k); };
  var ri=wordRoot(k, wi); if(ri>=0) needRoot(function(){ var R=p.querySelector("#qWpR"); if(!R || !document.body.contains(p)) return;
    R.innerHTML='<button class="qwrb"><span dir="rtl">'+E(rootLetters(RT.r[ri]))+'</span><small>'+L2("Akar kata · ","Root · ")+RT.ra[ri].length+' '+L2("ayat","ayat")+' ›</small></button>';
    var t2=rc.top-p.offsetHeight-8; p.style.top=(t2<70?rc.bottom+8:t2)+"px";
    R.firstChild.onclick=function(e){ e.stopPropagation(); closePop(); rootList(ri); }; });
  setTimeout(function(){ document.addEventListener("click", closePopDoc, true); view().addEventListener("scroll", closePop, {once:true}); },0);
}
function closePopDoc(e){ var p=document.getElementById("qWp"); if(p && p.contains(e.target)) return; closePop(); }
function closePop(){ var p=document.getElementById("qWp"); if(p) p.remove(); document.removeEventListener("click", closePopDoc, true); qa(".qw.sel").forEach(function(x){ x.classList.remove("sel"); }); }

// ----- mushaf view -----
// 0.34.0: the inside of one mushaf page (also used for the neighbour page that rides in during a swipe)
function pageInner(p){
  var g=Math.floor((p-1)/20); if(!MUSH[g]) return null; var lines=MUSH[g][(p-1)%20], wcount={};
  // 0.5.23: words are counted per ayat so a tap shows that word's meaning (Quran.com style)
  var h='<div class="qphd"><span>Juz '+juzOf(M.pa[p-1])+'</span><span>'+E(sName(fromIdx(M.pa[p-1])[0]))+'</span></div><div class="qlines">';
  lines.forEach(function(ln){
    if(ln.h){ h+='<div class="qml qmh"><span>سُورَةُ '+E(sMeta(ln.h)[0])+'</span></div>'+(ln.h!==1&&ln.h!==9?'<div class="qml qmb">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>':''); return; }
    var ws=[], pre="";
    ln.forEach(function(sg){ sg[1].split(" ").forEach(function(t){ if(!t) return; if(!LET.test(t)){ if(t==="۞"){ pre=t+" "; return; } if(ws.length){ ws[ws.length-1][1]+="\u00a0"+t; return; } } ws.push([sg[0], pre+t, (wcount[sg[0]]=(wcount[sg[0]]||0)+1)-1]); pre=""; }); });
    h+='<div class="qml"><span class="qmlt">'+ws.map(function(w){ return '<span class="qmk'+(w[0]===playK?" play":"")+'" data-k="'+w[0]+'" data-wi="'+w[2]+'">'+E(w[1])+'</span>'; }).join(" ")+'</span></div>';
  });
  return h+'</div><div class="qpfoot">'+adig(p)+'</div>';
}
function drawPage(){
  var p=st.page, B=q("#qBody"); if(!B) return;
  var h='<div class="qpage" id="qPage">'+pageInner(p)+'</div><div class="mut tiny" style="text-align:center;margin:6px 0 10px">'+L2("Leret ke kanan untuk muka surat seterusnya. Ketik ayat untuk pilihan. Warna tajwid ada dalam paparan Ayat.","Swipe right for the next page. Tap an ayat for options. Tajwid colours are in the Ayat view.")+'</div>';
  B.innerHTML=h; applySizes(); fitPage();
  B.onclick=function(e){ var s=e.target.closest(".qmk"); if(!s) return; var k=+s.getAttribute("data-k"), wi=+s.getAttribute("data-wi");
    if(D.set.wbw!=="off" && wi>=0 && pageStartsAyah(st.page, k)){ var rr=fromIdx(k); needSurah(rr[0], function(){ wordPop(s, k, wi); }); return; } qa(".qmk.sel").forEach(function(x){ x.classList.remove("sel"); }); qa('.qmk[data-k="'+k+'"]').forEach(function(x){ x.classList.add("sel"); }); ayahSheet(k, function(){ qa(".qmk.sel").forEach(function(x){ x.classList.remove("sel"); }); }); };
  // 0.33.0: the page follows the finger and the next page slides in
  // 0.34.0: the next page rides in beside it while you drag, so there is no blank gap
  window.IbSwipe(q("#qPage"), {can:function(s){ var p=st.page+s; return p>=1 && p<=604; }, go:function(s){ turn(s); },
    peek:function(s){ var x=st.page+s; return x>=1&&x<=604?pageInner(x):null; }, fit:function(g){ fitPage(g); }, find:function(){ return q("#qPage"); }});
  D.last={k:M.pa[p-1]}; saveD();
  clearTimeout(pageTimer); pageTimer=setTimeout(function(){ if(st.v==="read" && D.set.mode==="mushaf" && st.page===p){ for(var k=M.pa[p-1]; k<=pageEndIdx(p); k++) markSeen(k); markPage(p); flush(); } }, 12000);
  [p-1,p+1].forEach(function(x){ if(x>=1&&x<=604) needPage(x,function(){}); });
}
// the word count is exact only for an ayat that begins on this page; for the rest of a carried-over ayat, the tap opens the ayat sheet
function pageStartsAyah(p, k){ return k>=M.pa[p-1] && (p===1 || k!==M.pa[p-1] || fromIdx(k)[1]===1 || !carriedOver(p)); }
function carriedOver(p){ var g=Math.floor((p-2)/20), L=MUSH[g]; if(!L) return true; var lines=L[(p-2)%20]||[], last=null; lines.forEach(function(ln){ if(ln.h) return; ln.forEach(function(sg){ last=sg[0]; }); }); return last===M.pa[p-1]; }
function fitPage(pg){
  pg=pg||q("#qPage"); if(!pg) return; var W=pg.querySelector(".qlines").clientWidth, base=24, mx=0;
  pg.style.setProperty("--qmf", base+"px");
  var ts=[].slice.call(pg.querySelectorAll(".qmlt")); ts.forEach(function(t){ mx=Math.max(mx, t.scrollWidth); });
  var f=Math.max(12, Math.min(40, base*W/Math.max(1,mx)*0.985)); pg.style.setProperty("--qmf", f.toFixed(2)+"px");
  ts.forEach(function(t){ if(t.scrollWidth>W*0.72) t.classList.add("just"); });
}
function turn(d){ var p=st.page+d; if(p<1||p>604) return; st.page=p; var k=M.pa[p-1]; st.s=fromIdx(k)[0];
  needPage(p, function(){ if(st.v!=="read" || D.set.mode!=="mushaf" || st.page!==p) return; var v=view(), y=v.scrollTop, hd=q("#qHdr"); if(!hd){ reader(); return; }
    hd.innerHTML=mushHdr(); drawPage(); v.scrollTop=y; slideIn(q("#qPage"), d); }); }

// ----- current ayah, tracking, last read -----
function curIdx(){
  if(D.set.mode==="mushaf") return M.pa[st.page-1];
  var v=view(), top=v.getBoundingClientRect().top+70, best=null;
  qa(".qa").some(function(el){ var r=el.getBoundingClientRect(); if(r.bottom>top){ best=+el.getAttribute("data-k"); return true; } return false; });
  return best!=null?best:M.sa[st.s-1];
}
function observe(){
  if(io) io.disconnect(); seenAt={};
  if(!window.IntersectionObserver) return;
  io=new IntersectionObserver(function(ents){ var now=Date.now(); ents.forEach(function(en2){ var k=+en2.target.getAttribute("data-k"); if(en2.isIntersecting) seenAt[k]=now; else { if(seenAt[k] && now-seenAt[k]>1200) markSeen(k); delete seenAt[k]; } }); }, {root:view(), threshold:0.85});
  qa(".qa").forEach(function(el){ io.observe(el); });
}
var lastSave=0;
function track(){
  if(st.v!=="read" || !box || !document.body.contains(box)) return;
  if(document.visibilityState==="visible"){ logToday().t++; dirty=true; }
  var now=Date.now(); Object.keys(seenAt).forEach(function(k){ if(now-seenAt[k]>2500) markSeen(+k); });
  if(D.set.mode!=="mushaf" && now-lastSave>3000){ lastSave=now; var k=curIdx(); if(k!=null) D.last={k:k}; dirty=true; }
  if(now-(track._f||0)>10000){ track._f=now; flush(); }
}
function startTrack(){ clearInterval(track._i); track._i=setInterval(track, 1000); }

// ---------- autoscroll: press and hold to pause ----------
function asLabel(){ var v=q("#qAsV"); if(v) v.textContent=D.set.as; }
function hold(e){ if(e.target.closest(".dock")) return; asPause=true; }
function release(){ asPause=false; asLast=0; }
function startAuto(){
  if(D.set.mode!=="ayat") return; asOn=true; asPause=false; asAcc=0; asLast=0;
  var bar=q("#qAsBar"); if(bar) bar.classList.remove("hidden"); var b=q("#qAuto"); if(b) b.classList.add("on"); asLabel(); H.dockFix();
  var v=view(); v.addEventListener("touchstart", hold, {passive:true}); v.addEventListener("touchend", release); v.addEventListener("touchcancel", release);
  v.addEventListener("mousedown", hold); window.addEventListener("mouseup", release);
  try{ H.N.keepScreenOn(true,-1); }catch(e){}
  var step=function(ts){ if(!asOn) return;
    if(!asPause && document.visibilityState==="visible"){ if(asLast){ asAcc+=D.set.as*(ts-asLast)/1000; var px=Math.floor(asAcc); if(px>=1){ asAcc-=px; var before=v.scrollTop; v.scrollTop+=px; if(v.scrollTop===before && v.scrollTop>0){ stopAuto(); H.toast(L2("Hujung surah","End of the surah")); return; } } } asLast=ts; }
    else asLast=0;
    asRaf=requestAnimationFrame(step); };
  asRaf=requestAnimationFrame(step);
}
function stopAuto(){
  if(!asOn) return; asOn=false; cancelAnimationFrame(asRaf);
  var v=view(); v.removeEventListener("touchstart", hold); v.removeEventListener("touchend", release); v.removeEventListener("touchcancel", release);
  v.removeEventListener("mousedown", hold); window.removeEventListener("mouseup", release);
  try{ H.N.keepScreenOn(false,-1); }catch(e){}
  if(box){ var bar=q("#qAsBar"); if(bar) bar.classList.add("hidden"); var b=q("#qAuto"); if(b) b.classList.remove("on"); H.dockFix(); }
}

// ---------- ayah actions ----------
function ayahSheet(k, onClose){
  closePop(); var r=fromIdx(k), s=r[0], a=r[1], bm=D.bm.filter(function(b){ return b.k===k; });
  var body='<div class="qacts">'+
    '<button class="qt g3d" data-x="play"><span>▶</span>'+L2("Dengar","Listen")+'</button>'+
    '<button class="qt g3d" data-x="rep"><span>🔁</span>'+L2("Ulang","Repeat")+'</button>'+
    '<button class="qt g3d" data-x="bm"><span>🔖</span>'+(bm.length?L2("Tanda ✓","Bookmarked"):L2("Tanda buku","Bookmark"))+'</button>'+
    '<button class="qt g3d" data-x="note"><span>📝</span>'+(D.notes[k]?L2("Nota ✓","Note ✓"):L2("Nota","Note"))+'</button>'+
    '<button class="qt g3d" data-x="copy"><span>📋</span>'+L2("Salin","Copy")+'</button>'+
    '<button class="qt g3d" data-x="img"><span>🖼</span>'+L2("Gambar","Image")+'</button>'+
    '<button class="qt g3d" data-x="view"><span>'+(D.set.mode==="mushaf"?"📜":"📖")+'</span>'+(D.set.mode==="mushaf"?L2("Terjemahan","Translation"):L2("Mushaf","Mushaf"))+'</button>'+
    '<button class="qt g3d" data-x="last"><span>📍</span>'+L2("Akhir baca","Last read")+'</button>'+
    '<button class="qt g3d" data-x="tf"><span>📚</span>Tafsir</button>'+
    '<button class="qt g3d" data-x="say"><span>🗣</span>'+L2("Baca kuat","Read aloud")+'</button>'+
    '<button class="qt g3d" data-x="info"><span>ℹ️</span>'+L2("Info","Info")+'</button></div>';
  var ov=H.showSheet(E(sName(s))+' '+s+':'+a, body, onClose);
  ov.querySelectorAll("[data-x]").forEach(function(b){ b.onclick=function(){ var x=b.getAttribute("data-x");
    if(x==="play"){ H.closeOverlay(); playRange(k, M.sa[s-1]+sMeta(s)[4]-1, D.set.rep, D.set.repAll); }
    else if(x==="rep"){ H.closeOverlay(); playRange(k, k, 1, 0); H.toast(L2("Mengulang 2:255 tanpa henti. Tekan ⏸ untuk berhenti.","Repeating without end. Press ⏸ to stop.").replace("2:255", s+":"+a)); }
    else if(x==="bm") bmSheet(k);
    else if(x==="note") noteSheet(k);
    else if(x==="copy"){ ensureText(k, function(ar, tr){ var t=ar+"\n\n"+tr+"\n(QS "+sName(s)+" "+s+":"+a+")"; if(window.Native && H.N.copyText) H.N.copyText(t); else try{ navigator.clipboard.writeText(t); }catch(e){} H.toast(L2("Disalin","Copied")); }); }
    else if(x==="img"){ ensureText(k, function(ar, tr){ H.closeOverlay(); H.shareCard({title:sName(s)+" "+s+":"+a, ar:ar, text:tr, src:"Al-Quran "+s+":"+a}); }); }
    else if(x==="view"){ H.closeOverlay(); D.set.mode=D.set.mode==="mushaf"?"ayat":"mushaf"; saveD(); openRead(k); }
    else if(x==="say"){ H.closeOverlay(); sayFrom(k); }
    else if(x==="tf") tafsirSheet(k);
    else if(x==="info") infoSheet(s);
    else if(x==="last"){ D.last={k:k}; saveD(); H.closeOverlay(); H.toast(L2("Ditanda","Marked")); }
  }; });
}
function ensureText(k, cb){ var r=fromIdx(k); needSurah(r[0], function(){ needEn(function(){ var segs=SUR[r[0]].t[r[1]-1], ar=segs.map(function(x){ return typeof x==="string"?x:x[0]; }).join("").trim(); var l=trList(), tr=trText(l[0]||"en",k)||trText("en",k)||""; cb(ar, tr); }); }); }
function bmSheet(k){
  var r=fromIdx(k), cols=[""].concat(D.cols), has=function(c){ return D.bm.some(function(b){ return b.k===k && (b.c||"")===c; }); };
  var body='<div class="mut small">'+L2("Pilih koleksi. Ketik sekali lagi untuk buang.","Pick a collection. Tap again to remove.")+'</div><div class="chips" style="flex-wrap:wrap;margin-top:8px">'+cols.map(function(c,i){ return '<button class="chip'+(has(c)?" on":"")+'" data-c="'+i+'"><i class="qcdot" style="background:'+colColor(c)+'"></i>'+(has(c)?"✓ ":"")+E(colName(c))+'</button>'; }).join("")+'</div>'+
    '<div class="row" style="margin-top:10px"><input id="qNewC" class="ilq" placeholder="'+L2("Koleksi baharu, cth. Hafazan","New collection, e.g. Memorise")+'" style="flex:1"><button class="btn" id="qAddC">+</button></div>';
  var ov=H.showSheet("🔖 "+E(sName(r[0]))+" "+r[0]+":"+r[1], body, function(){ if(st.v==="read") rerenderKeep(); });
  ov.querySelectorAll("[data-c]").forEach(function(b){ b.onclick=function(){ var c=cols[+b.getAttribute("data-c")]; if(has(c)) D.bm=D.bm.filter(function(x){ return !(x.k===k && (x.c||"")===c); }); else D.bm.push({k:k, c:c, d:ymd()}); saveD(); bmSheet(k); }; });
  ov.querySelector("#qAddC").onclick=function(){ var v=ov.querySelector("#qNewC").value.trim().slice(0,30); if(!v) return; if(D.cols.indexOf(v)<0) D.cols.push(v); D.bm.push({k:k,c:v,d:ymd()}); saveD(); bmSheet(k); };
}
function noteSheet(k){
  var r=fromIdx(k), n=D.notes[k];
  var ov=H.showSheet("📝 "+E(sName(r[0]))+" "+r[0]+":"+r[1], '<textarea id="qNt" class="ilq" rows="6" style="width:100%" placeholder="'+L2("Tadabbur, pengajaran, tafsir ringkas…","Reflection, lesson, short tafsir…")+'">'+E(n?n.t:"")+'</textarea><div class="row" style="margin-top:10px">'+(n?'<button class="btn alt" id="qNtD">'+L2("Padam","Delete")+'</button>':'<span></span>')+'<button class="btn gold" id="qNtS">'+L2("Simpan","Save")+'</button></div>');
  ov.querySelector("#qNtS").onclick=function(){ var t=ov.querySelector("#qNt").value.trim(); if(t) D.notes[k]={t:t.slice(0,4000), d:ymd()}; else delete D.notes[k]; saveD(); H.closeOverlay(); rerenderKeep(); };
  var del=ov.querySelector("#qNtD"); if(del) del.onclick=function(){ delete D.notes[k]; saveD(); H.closeOverlay(); rerenderKeep(); };
}
function rerenderKeep(){ if(st.v!=="read") return; var v=view(), y=v.scrollTop; if(D.set.mode==="ayat") drawSurah(); else if(D.set.mode==="tr") drawTr(); else drawPage(); v.scrollTop=y; }

// ---------- display settings ----------
function settingsSheet(){
  // 0.6.31 (owner): smaller option tiles, at most 2 rows per setting and no side scroll
  var S0=D.set, ch=function(id, opts, cur){ var cols=opts.length<=4?opts.length:Math.ceil(opts.length/2); return '<div class="qsetg" style="grid-template-columns:repeat('+cols+',minmax(0,1fr))">'+opts.map(function(o){ return '<button class="chip'+(String(cur)===String(o[0])?" on":"")+'" data-set="'+id+'" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>'; };
  var lg=M.tj.filter(function(x){ return x!=="tafkhim"&&x!=="tarqiq"||S0.tf; });
  var body='<div class="snl">'+L2("Paparan","View")+'</div>'+ch("mode",[["ayat","📜 "+L2("Ayat","Ayat")],["mushaf","📖 Mushaf"]],S0.mode)+
    '<div class="snl" style="margin-top:12px">'+L2("Jubin ayat padat","Compact ayat tiles")+'</div>'+ch("cmp",[["false",L2("Biasa","Normal")],["true",L2("Padat","Compact")]],!!S0.cmp)+
    '<div class="mut tiny">'+L2("Padat: jidar jubin dikecilkan, nombor muka surat dibuang, nombor ayat sebaris dengan ayat, dan jarak antara ayat dan baris dikurangkan separuh.","Compact: smaller tile margins, no page number, the ayat number in line with the ayat, and half the space between ayat and lines.")+'</div>'+
    '<div class="snl" style="margin-top:12px">'+L2("Terjemahan","Translation")+'</div>'+ch("tr",[["auto",L2("Ikut bahasa aplikasi","App language")],["ms","Melayu"],["en","English"],["both",L2("Kedua-dua","Both")],["none",L2("Tiada","None")]],S0.tr)+
    (msReady()?'<div class="mut tiny">✓ '+L2("Terjemahan Melayu sudah dimuat turun","Malay translation downloaded")+'</div>':'<button class="chip" id="qDlMs2" style="margin-top:6px">⬇ '+L2("Muat turun terjemahan Melayu (~2 MB)","Download the Malay translation (~2 MB)")+'</button>')+
    '<div class="snl" style="margin-top:12px">'+L2("Maksud perkataan","Word meanings")+'</div>'+ch("wl",[["en","English"],["id","Bahasa Indonesia"]],S0.wl)+
    (S0.wl==="id"?'<div class="mut tiny">'+L2("Maksud Bahasa Indonesia dari Quran.com dimuat turun bagi setiap surah ketika dibuka (perlu internet kali pertama). Tiada sumber percuma perkataan demi perkataan dalam Bahasa Melayu.","Indonesian meanings from Quran.com download per surah when opened (internet needed the first time). No free Malay word-by-word source exists.")+'</div><button class="chip" id="qWidAll" style="margin-top:6px">⬇ '+L2("Muat turun semua 114 surah","Download all 114 surahs")+'</button> <span class="mut tiny" id="qWidI"></span>':'')+
    ch("wbw",[["tap",L2("Ketik perkataan","Tap a word")],["under",L2("Di bawah setiap perkataan","Under each word")],["off",L2("Tutup","Off")]],S0.wbw)+
    '<div class="snl" style="margin-top:12px">'+L2("Teks Arab (paparan ayat)","Arabic text (ayat view)")+'</div>'+ch("arOn",[["true",L2("Tunjuk","Show")],["false",L2("Sembunyi","Hide")]],S0.arOn!==false)+
    '<div class="snl" style="margin-top:12px">'+L2("Paparan terjemahan 📝","Translation view 📝")+'</div>'+ch("trl",[["page",L2("Satu surah, satu halaman","One surah per page")],["row",L2("Setiap ayat baris baharu","Each ayat on a new row")],["cont",L2("Berterusan tanpa henti","Continuous, no breaks")]],S0.trl||"row")+
    '<div class="mut tiny">'+L2("Bahasa terjemahan ikut pilihan Terjemahan di atas. 🗣 Baca membacakan terjemahan dengan suara telefon.","The language follows the Translation choice above. 🗣 Read speaks the translation with the phone voice.")+'</div>'+
    '<div class="snl" style="margin-top:12px">Rumi</div>'+ch("rumi",[["true",L2("Tunjuk","Show")],["false",L2("Sembunyi","Hide")]],S0.rumi)+
    '<div class="snl" style="margin-top:12px">'+L2("Warna tajwid","Tajwid colours")+'</div>'+ch("tj",[["true",L2("Hidup","On")],["false",L2("Tutup","Off")]],S0.tj)+ch("tf",[["false",L2("Tanpa tafkhim/tarqiq","No tafkhim/tarqiq")],["true",L2("Dengan tafkhim/tarqiq","With tafkhim/tarqiq")]],S0.tf)+
    '<div class="qlegend">'+lg.map(function(x){ var n=(window.QTJ_NAME||{})[x]; return '<span><i class="tj-'+x+'">ب</i>'+E(n?L2(n[0],n[1]):x)+'</span>'; }).join("")+'</div>'+
    '<div class="snl" style="margin-top:12px">🌙 '+L2("Bacaan malam (sepia)","Night reading (sepia)")+'</div>'+ch("sep",[["off",L2("Tutup","Off")],["on",L2("Sentiasa","Always")],["auto",L2("Auto waktu malam","Auto at night")]],S0.sep||"off")+
    '<div class="snl" style="margin-top:12px">'+L2("Fon Arab","Arabic font")+'</div>'+ch("font",[["hafs","KFGQPC Uthmani"],["sch","Scheherazade"],["amiri","Amiri Quran"]],S0.font)+
    '<div class="snl" style="margin-top:12px">'+L2("Saiz teks Arab","Arabic size")+' <b id="qArV">'+S0.ar+'</b></div><input type="range" id="qArS" min="20" max="56" value="'+S0.ar+'" style="width:100%">'+
    '<div class="snl" style="margin-top:8px">'+L2("Saiz terjemahan","Translation size")+' <b id="qTsV">'+S0.ts+'</b></div><input type="range" id="qTsS" min="12" max="24" value="'+S0.ts+'" style="width:100%">'+
    '<div class="snl" style="margin-top:8px">'+L2("Kelajuan auto-tatal","Autoscroll speed")+' <b id="qAsV2">'+S0.as+'</b></div><input type="range" id="qAsS" min="6" max="160" value="'+S0.as+'" style="width:100%">';
  var ov=H.showSheet("⚙ "+L2("Paparan Al-Quran","Quran display"), body, function(){ if(st.v==="read") reader(); });
  var wa=ov.querySelector("#qWidAll"); if(wa) wa.onclick=function(){ wa.disabled=true; var n=1, fail=0, info=ov.querySelector("#qWidI");
    var next=function(){ if(n>114 || !document.body.contains(ov)){ if(info) info.textContent=fail?L2("Selesai, ","Done, ")+fail+L2(" gagal"," failed"):L2("Selesai ✓","Done ✓"); return; } if(info) info.textContent=n+"/114"; needWid(n, function(ok){ if(!ok) fail++; n++; next(); }); }; next(); };
  ov.querySelectorAll("[data-set]").forEach(function(b){ b.onclick=function(){ var id=b.getAttribute("data-set"), v=b.getAttribute("data-v"); D.set[id]=v==="true"?true:v==="false"?false:v; saveD(); settingsSheet(); }; });
  var bind=function(id, key, lab){ var r=ov.querySelector(id); r.oninput=function(){ D.set[key]=+r.value; ov.querySelector(lab).textContent=r.value; applySizes(); saveD(); }; };
  bind("#qArS","ar","#qArV"); bind("#qTsS","ts","#qTsV"); bind("#qAsS","as","#qAsV2");
  var dl=ov.querySelector("#qDlMs2"); if(dl) dl.onclick=function(){ downloadMs(dl, function(){ settingsSheet(); }); };
}

// ================= AUDIO (Mishary Alafasy) =================
// 0.27.0: 8 qari (EveryAyah folders: [id, name, high-quality folder, saver folder])
var QARI=[["afasy","Mishary Rashid Alafasy","Alafasy_128kbps","Alafasy_64kbps"],["sudais","Abdurrahman As-Sudais","Abdurrahmaan_As-Sudais_192kbps","Abdurrahmaan_As-Sudais_64kbps"],
  ["shuraim","Saud Ash-Shuraim","Saood_ash-Shuraym_128kbps","Saood_ash-Shuraym_64kbps"],["husary","Mahmoud Khalil Al-Husary","Husary_128kbps","Husary_64kbps"],
  ["minshawi","Muhammad Siddiq Al-Minshawi","Minshawy_Murattal_128kbps","Minshawy_Murattal_128kbps"],["basit","Abdul Basit Abdus Samad","Abdul_Basit_Murattal_192kbps","Abdul_Basit_Murattal_64kbps"],
  ["ghamdi","Saad Al-Ghamdi","Ghamadi_40kbps","Ghamadi_40kbps"],["ajmi","Ahmed Al-Ajmi","Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net","Ahmed_ibn_Ali_al-Ajamy_64kbps_QuranExplorer.Com"]];
function qari(){ return QARI.filter(function(x){ return x[0]===D.set.qari; })[0]||QARI[0]; }
var RECITER="Mishary Rashid Alafasy";
function aBase(){ var r=qari(); RECITER=r[1]; return "https://everyayah.com/data/"+(D.set.kb==64?r[3]:r[2])+"/"; }
function aFile(s,a){ var r=qari(); return "quran/"+(r[0]==="afasy"?"afasy":"a_"+r[0])+(D.set.kb==64?"64":"128")+"/"+pad3(s)+pad3(a)+".mp3"; }
function item(s,a){ return {u:aBase()+pad3(s)+pad3(a)+".mp3", f:aFile(s,a), k:"q:"+s+":"+a, t:sName(s)+" · "+(a?s+":"+a:L2("Basmalah","Basmalah")), a:RECITER}; }
function queueFor(k0, k1){
  var out=[];
  for(var k=k0;k<=k1;k++){ var r=fromIdx(k); if(r[1]===1 && r[0]!==1 && r[0]!==9) { var b=item(1,1); b.k="q:"+r[0]+":0"; b.t=sName(r[0])+" · "+L2("Basmalah","Basmalah"); out.push(b); } out.push(item(r[0],r[1])); }
  return out;
}
function playList(ks){
  var items=[]; ks.forEach(function(k){ items=items.concat(queueFor(k,k)); });
  if(NATIVE){ H.N.playerPlay(JSON.stringify({queue:items, qi:0, rep:D.set.rep||1, repAll:1, gap:D.set.gap*1000, en:en()})); setTimeout(function(){ H.N.playerCmd("speed", D.set.spd); }, 600); }
  else webPlay(items, D.set.rep||1, 1);
  playK=ks[0]; H.toast(L2("Memainkan ","Playing ")+ks.length+L2(" ayat"," ayat"));
}
function playRange(k0, k1, rep, repAll){
  var items=queueFor(k0,k1);
  if(NATIVE){ H.N.playerPlay(JSON.stringify({queue:items, qi:0, rep:rep||1, repAll:repAll==null?1:repAll, gap:D.set.gap*1000, en:en()})); setTimeout(function(){ H.N.playerCmd("speed", D.set.spd); }, 600); }
  else webPlay(items, rep||1, repAll==null?1:repAll);
  playK=k0; setTimeout(audioTick,300);
}
// browser preview player (the phone uses the native PlayerService queue)
var WP={a:null, items:null, i:0, r:0, all:0, rep:1, repAll:1, st:"idle"};
function webPlay(items, rep, repAll){
  if(WP.a) WP.a.pause(); WP={a:new Audio(), items:items, i:0, r:0, all:0, rep:rep, repAll:repAll, st:"loading"};
  var go=function(){ WP.a.src=WP.items[WP.i].u; WP.a.playbackRate=D.set.spd/100; WP.a.play().then(function(){ WP.st="playing"; }).catch(function(){ WP.st="error"; }); };
  WP.a.onended=function(){ WP.r++; if(WP.r>=WP.rep){ WP.r=0; WP.i++; if(WP.i>=WP.items.length){ WP.all++; if(WP.repAll===0||WP.all<WP.repAll) WP.i=0; else { WP.st="ended"; return; } } } setTimeout(go, D.set.gap*1000); };
  WP.a.onerror=function(){ WP.st="error"; }; go();
}
function pState(){
  if(NATIVE){ try{ return JSON.parse(H.N.playerState()); }catch(e){ return {st:"idle"}; } }
  if(!WP.items) return {st:"idle"}; return {st:WP.a.paused&&WP.st==="playing"?"paused":WP.st, key:WP.items[WP.i].k};
}
function isQActive(){ var s=pState(); return /^q:/.test(s.key||"") && s.st!=="idle" && s.st!=="ended" && s.st!=="error"; }
function isQPlaying(){ var s=pState(); return /^q:/.test(s.key||"") && (s.st==="playing"||s.st==="loading"); }
function audioTick(){
  if(!box || !document.body.contains(box) || st.v!=="read") return;
  var s=pState(), k=-1;
  if(/^q:/.test(s.key||"") && s.st!=="idle" && s.st!=="ended"){ var p=s.key.split(":"); if(+p[2]>0) k=gIdx(+p[1],+p[2]); else k=playK; }
  var b=q("#qPlay"); if(b) b.innerHTML=(/^q:/.test(s.key||"") && (s.st==="playing"||s.st==="loading"))?"⏸ "+L2("Jeda","Pause"):"▶ "+L2("Dengar","Listen");
  if(k===playK && k>=0){ return; }
  if(k<0){ if(playK>=0 && !(/^q:/.test(s.key||"") && s.st==="loading")){ qa(".play").forEach(function(x){ x.classList.remove("play"); }); playK=-1; } return; }
  playK=k; qa(".play").forEach(function(x){ x.classList.remove("play"); });
  if(D.set.mode!=="mushaf"){
    var r=fromIdx(k); if(r[0]!==st.s && !q("#qa"+k)){ if(D.set.follow){ st.s=r[0]; st.go=k; reader(); } return; }
    var el=q("#qa"+k); if(el){ el.classList.add("play"); if(D.set.follow && !asOn){ var rc=el.getBoundingClientRect(), vr=view().getBoundingClientRect(); if(rc.top<vr.top+50 || rc.bottom>vr.bottom-110) view().scrollTo({top:view().scrollTop+rc.top-vr.top-70, behavior:"smooth"}); } }
  } else {
    var pg=pageOf(k); if(pg!==st.page){ if(D.set.follow){ st.page=pg; needPage(pg, function(){ reader(); }); } return; }
    qa('.qmk[data-k="'+k+'"]').forEach(function(x){ x.classList.add("play"); });
  }
}
function startAudioPoll(){ clearInterval(audioTimer); audioTimer=setInterval(audioTick, 700); audioTick(); }

function audioSheet(k){
  var r=fromIdx(k), s=r[0], last=M.sa[s-1]+sMeta(s)[4]-1, ch=function(id, opts, cur){ return '<div class="chips" style="flex-wrap:wrap">'+opts.map(function(o){ return '<button class="chip'+(String(cur)===String(o[0])?" on":"")+'" data-a="'+id+'" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>'; };
  var A=D.set, rg=audioSheet.rg||"surah";
  var files=[]; for(var a=1;a<=sMeta(s)[4];a++) files.push(aFile(s,a));
  var have=window.Native&&H.N.qCount?H.N.qCount(JSON.stringify(files)):0;
  aBase();
  var body='<div class="snl">🎙 '+L2("Qari","Reciter")+'</div><div class="qqari">'+QARI.map(function(x){ return '<button class="chip'+(qari()[0]===x[0]?' on':'')+'" data-qari="'+x[0]+'">'+E(x[1])+'</button>'; }).join("")+'</div>'+
    '<div class="snl" style="margin-top:10px">'+L2("Mula dari","Start from")+'</div>'+ch("rg",[["surah",s+":"+r[1]+" → "+L2("hujung surah","end of surah")],["one",L2("Ayat ini sahaja","This ayat only")],["range",L2("Julat ayat…","Ayat range…")],["page",L2("Muka surat ini","This page")],["juz",L2("Hingga hujung juz","To the end of the juz")]],rg)+
    (rg==="range"?'<div class="qrng"><label>'+L2("Dari ayat","From ayat")+'<input type="number" id="qRa" min="1" max="'+sMeta(s)[4]+'" value="'+(audioSheet.ra&&audioSheet.rs===s?audioSheet.ra:r[1])+'"></label><span>→</span><label>'+L2("Hingga ayat","To ayat")+'<input type="number" id="qRb" min="1" max="'+sMeta(s)[4]+'" value="'+(audioSheet.rb&&audioSheet.rs===s?audioSheet.rb:sMeta(s)[4])+'"></label><span class="mut tiny">/ '+sMeta(s)[4]+'</span></div>':'')+
    '<div class="snl" style="margin-top:10px">'+L2("Apa yang didengar","What to hear")+'</div>'+ch("lis",[["ar","🎙 "+L2("Bacaan Arab (qari)","Arabic recitation (reciter)")],["ms","🗣 "+L2("Terjemahan Melayu sahaja","Malay translation only")],["en","🗣 "+L2("Terjemahan Inggeris sahaja","English translation only")]],A.lis||"ar")+
    ((A.lis||"ar")!=="ar"?'<div class="mut tiny">'+L2("Dibaca oleh suara teks-ke-pertuturan telefon. Ulang, jeda dan kelajuan di bawah hanya untuk bacaan Arab.","Read by the phone's text-to-speech voice. Repeat, pause and speed below apply to the Arabic recitation only.")+'</div>':'')+
    '<div class="snl" style="margin-top:10px">'+L2("Ulang setiap ayat","Repeat each ayat")+'</div>'+ch("rep",[[1,"1×"],[2,"2×"],[3,"3×"],[5,"5×"],[10,"10×"]],A.rep)+
    '<div class="snl" style="margin-top:10px">'+L2("Ulang seluruh julat","Repeat the whole range")+'</div>'+ch("repAll",[[1,"1×"],[2,"2×"],[3,"3×"],[0,"∞"]],A.repAll)+
    '<div class="snl" style="margin-top:10px">'+L2("Jeda antara ayat","Pause between ayat")+'</div>'+ch("gap",[[0,"0"],[1,"1 s"],[2,"2 s"],[3,"3 s"],[5,"5 s"]],A.gap)+
    '<div class="snl" style="margin-top:10px">'+L2("Kelajuan","Speed")+'</div>'+ch("spd",[[75,"0.75×"],[100,"1×"],[125,"1.25×"],[150,"1.5×"]],A.spd)+
    '<div class="snl" style="margin-top:10px">'+L2("Ikut ayat yang dibaca","Follow the playing ayat")+'</div>'+ch("follow",[["true",L2("Ya","Yes")],["false",L2("Tidak","No")]],A.follow)+
    '<button class="btn gold full" id="qGo" style="margin-top:14px">▶ '+L2("Mula dengar","Start listening")+'</button>'+
    '<div class="card" style="margin-top:12px"><h3>⬇ '+L2("Audio luar talian","Offline audio")+'</h3>'+
    '<div class="small">'+E(sName(s))+': <b id="qHave">'+have+'</b>/'+sMeta(s)[4]+' '+L2("ayat di telefon","ayat on the phone")+'</div><div class="bar"><div id="qDlBar" style="width:'+Math.round(have*100/sMeta(s)[4])+'%"></div></div>'+
    '<div class="row"><button class="chip" id="qDlS">⬇ '+L2("Surah ini","This surah")+'</button><button class="chip" id="qDlJ">⬇ Juz '+juzOf(k)+'</button><button class="chip" id="qDlX">🗑</button></div>'+
    '<div class="snl" style="margin-top:10px">'+L2("Kualiti","Quality")+'</div>'+ch("kb",[[128,L2("Tinggi 128 kbps (~1 MB/minit)","High 128 kbps (~1 MB/min)")],[64,L2("Jimat 64 kbps","Saver 64 kbps")]],A.kb)+
    '<div class="mut tiny" id="qDlI">'+L2("Seluruh al-Quran kira-kira 600 MB (128 kbps). Audio yang dimuat turun dimainkan tanpa internet.","The whole Quran is about 600 MB (128 kbps). Downloaded audio plays without the internet.")+'</div></div>';
  var ov=H.showSheet("▶ "+L2("Dengar","Listen")+" · "+E(sName(s))+" "+s+":"+r[1], body);
  ov.querySelectorAll("[data-a]").forEach(function(b){ b.onclick=function(){ var id=b.getAttribute("data-a"), v=b.getAttribute("data-v");
    var ia=ov.querySelector("#qRa"), ib=ov.querySelector("#qRb"); if(ia){ audioSheet.ra=+ia.value; audioSheet.rb=+ib.value; audioSheet.rs=s; }
    if(id==="rg") audioSheet.rg=v; else if(id==="lis"){ D.set.lis=v; saveD(); } else { D.set[id]=v==="true"?true:v==="false"?false:+v; saveD(); if(id==="spd" && isQActive() && NATIVE) H.N.playerCmd("speed", D.set.spd); }
    audioSheet(k); }; });
  ov.querySelectorAll("[data-qari]").forEach(function(b){ b.onclick=function(){ D.set.qari=b.getAttribute("data-qari"); saveD(); if(isQActive()) try{ H.N.playerCmd("stop",0); }catch(e){} audioSheet(k); }; });
  ov.querySelector("#qGo").onclick=function(){ var rg2=audioSheet.rg||"surah", end=rg2==="one"?k:rg2==="page"?pageEndIdx(pageOf(k)):rg2==="juz"?(juzOf(k)<30?M.ja[juzOf(k)]-1:6235):last;
    var start=rg2==="page"?Math.max(k,M.pa[pageOf(k)-1]):k;
    if(rg2==="range"){ var n=sMeta(s)[4], a1=Math.max(1,Math.min(n,parseInt(ov.querySelector("#qRa").value,10)||1)), a2=Math.max(1,Math.min(n,parseInt(ov.querySelector("#qRb").value,10)||n)); if(a2<a1){ var tq=a1; a1=a2; a2=tq; }
      audioSheet.ra=a1; audioSheet.rb=a2; audioSheet.rs=s; start=M.sa[s-1]+a1-1; end=M.sa[s-1]+a2-1; }
    H.closeOverlay();
    if((D.set.lis||"ar")!=="ar"){ if(isQActive()) try{ H.N.playerCmd("stop",0); }catch(e){} sayFrom(start, end, D.set.lis); return; }
    playRange(start, end, D.set.rep, D.set.repAll); };
  var dl=function(k0,k1){ if(!window.Native || !H.N.qDownload){ H.toast(L2("Muat turun hanya dalam aplikasi telefon","Downloads work in the phone app")); return; }
    var list=[]; for(var k2=k0;k2<=k1;k2++){ var rr=fromIdx(k2), it=item(rr[0],rr[1]); list.push({u:it.u, f:it.f}); } list.push({u:item(1,1).u, f:aFile(1,1)});
    var id="dl"+Date.now(), info=ov.querySelector("#qDlI");
    var h2=function(e){ if(e.id!==id) return; if(info) info.textContent=L2("Memuat turun ","Downloading ")+e.done+"/"+e.total+(e.fail?" · "+e.fail+L2(" gagal"," failed"):""); if(e.end){ H.off("qdl",h2); H.toast(e.fail?L2("Sebahagian gagal. Cuba lagi.","Some failed. Try again."):L2("Muat turun selesai","Download complete")); if(document.body.contains(ov)) audioSheet(k); } };
    H.on("qdl",h2); H.N.qDownload(id, JSON.stringify(list)); if(info) info.textContent=L2("Memulakan…","Starting…"); };
  ov.querySelector("#qDlS").onclick=function(){ dl(M.sa[s-1], last); };
  ov.querySelector("#qDlJ").onclick=function(){ var j=juzOf(k); dl(M.ja[j-1], j<30?M.ja[j]-1:6235); };
  ov.querySelector("#qDlX").onclick=function(){ if(!window.Native||!H.N.qDelete) return; if(!confirm(L2("Padam semua audio al-Quran yang dimuat turun?","Delete all downloaded Quran audio?"))) return; var b=H.N.qDelete("quran/afasy128")+H.N.qDelete("quran/afasy64"); H.toast(L2("Dipadam ","Deleted ")+Math.round(b/1e6)+" MB"); audioSheet(k); };
}

// ================= 0.16.0: tafsir, word roots, dictionary, topics, surah info =================
function apiQ(path, cb){ H.fetch("https://api.quran.com/api/v4/"+path, function(status, body){ var j=null; if(status>=200 && status<300){ try{ j=JSON.parse(body); }catch(e){} } cb(j); }); }
function fRead(rel){ if(!window.Native || !H.N.qRead) return null; try{ var t=H.N.qRead(rel); return t?JSON.parse(t):null; }catch(e){ return null; } }
function fWrite(rel, obj){ if(window.Native && H.N.qWrite) try{ H.N.qWrite(rel, JSON.stringify(obj)); }catch(e){} }
function clean(html, rtl){
  var t=String(html||"").replace(/<(script|style)[\s\S]*?<\/\1>/gi,"").replace(/<(\/?)([a-z0-9]+)[^>]*>/gi,function(m,c,tg){ tg=tg.toLowerCase(); return /^(p|h2|h3|h4|b|i|em|strong|br|ul|ol|li|blockquote|sup)$/.test(tg)?"<"+c+tg+">":(tg==="div"?(c?"</p>":"<p>"):""); });
  return '<div class="qtfx"'+(rtl?' dir="rtl" lang="ar"':'')+'>'+t+'</div>';
}
// ----- Indonesian word meanings (Quran.com, language=id) -----
var WID={};
function needWid(s, cb){ if(WID[s]){ cb(true); return; } var c=fRead("quran/wbw/id/"+pad3(s)+".json"); if(c && c.length===sMeta(s)[4]){ WID[s]=c; cb(true); return; }
  if(needWid.busy[s]){ needWid.busy[s].push(cb); return; } needWid.busy[s]=[cb];
  var arr=[], n=sMeta(s)[4], done=function(ok){ var l=needWid.busy[s]; delete needWid.busy[s]; l.forEach(function(f){ f(ok); }); };
  var page=function(p){ apiQ("verses/by_chapter/"+s+"?words=true&language=id&word_fields=position&fields=verse_key&per_page=50&page="+p, function(j){
    if(!j || !j.verses){ done(false); return; }
    j.verses.forEach(function(v){ var a=+String(v.verse_key||"").split(":")[1]; if(a>=1 && a<=n) arr[a-1]=(v.words||[]).filter(function(w){ return w.char_type_name==="word"; }).map(function(w){ return ((w.translation||{}).text||"").trim(); }); });
    if(j.pagination && j.pagination.next_page) page(j.pagination.next_page);
    else { for(var i=0;i<n;i++) if(!arr[i]) arr[i]=[]; WID[s]=arr; fWrite("quran/wbw/id/"+pad3(s)+".json", arr); done(true); }
  }); };
  page(1);
}
needWid.busy={};
function wMean(s, a, wi, W){ if(D.set.wl==="id" && WID[s] && WID[s][a-1] && WID[s][a-1][wi]) return WID[s][a-1][wi]; return W?W[0]:""; }
// ----- tafsir -----
var TFS=[[169,"Ibn Kathir (ringkas)","Ibn Kathir (abridged)","en"],[168,"Ma'ariful Quran","Ma'ariful Quran","en"],[817,"Tazkirul Quran","Tazkirul Quran","en"],[16,"Tafsir al-Muyassar","Tafsir al-Muyassar","ar"],[91,"Tafsir as-Sa'di","Tafsir as-Sa'di","ar"],[14,"Tafsir Ibn Kathir (Arab)","Tafsir Ibn Kathir (Arabic)","ar"]];
var TF={};
function needTafsir(id, s, cb){
  var key=id+"_"+s; if(TF[key]){ cb(TF[key]); return; }
  var c=fRead("quran/tf/"+id+"/"+pad3(s)+".json"); if(c && c.length===sMeta(s)[4]){ TF[key]=c; cb(c); return; }
  var arr=[], n=sMeta(s)[4]; for(var i=0;i<n;i++) arr.push("");
  var page=function(p){ apiQ("tafsirs/"+id+"/by_chapter/"+s+"?per_page=50&page="+p, function(j){
    if(!j || !j.tafsirs){ cb(null); return; }
    j.tafsirs.forEach(function(t){ var a=+String(t.verse_key||"").split(":")[1]; if(a>=1 && a<=n) arr[a-1]=t.text||""; });
    if(j.pagination && j.pagination.next_page) page(j.pagination.next_page); else { TF[key]=arr; fWrite("quran/tf/"+id+"/"+pad3(s)+".json", arr); cb(arr); }
  }); };
  page(1);
}
function tafsirSheet(k){
  closePop(); var r=fromIdx(k), s=r[0], a=r[1], id=D.set.tfs||169, src=TFS.filter(function(x){ return x[0]===id; })[0]||TFS[0];
  var chips='<div class="chips qtfc">'+TFS.map(function(x){ return '<button class="chip'+(x[0]===id?" on":"")+'" data-tf="'+x[0]+'">'+(x[3]==="ar"?"ع ":"EN ")+E(L2(x[1],x[2]))+'</button>'; }).join("")+'</div>';
  var body=chips+'<div class="mut tiny">'+L2("Tafsir dalam Bahasa Melayu belum ada sumber percuma dalam talian. Tafsir di sini dalam Bahasa Inggeris atau Arab (Quran.com). Sekali dibuka, tafsir surah itu disimpan untuk luar talian.","No free online Malay tafsir exists yet. These are English or Arabic (Quran.com). Once opened, the surah's tafsir is kept for offline use.")+'</div><div id="qTfB" class="qtfb"><div class="mut small">'+L2("Memuatkan tafsir…","Loading tafsir…")+'</div></div>'+
    '<div class="row" style="margin-top:8px"><button class="btn alt" id="qTfN"'+(a>=sMeta(s)[4]?" disabled":"")+'>‹ '+L2("Ayat seterusnya","Next")+'</button><button class="btn alt" id="qTfP"'+(a<=1?" disabled":"")+'>'+L2("Ayat sebelum","Previous")+' ›</button></div>';
  var ov=H.showSheet("📚 "+L2("Tafsir ","Tafsir ")+E(sName(s))+" "+s+":"+a, body);
  ov.querySelectorAll("[data-tf]").forEach(function(b){ b.onclick=function(){ D.set.tfs=+b.getAttribute("data-tf"); saveD(); tafsirSheet(k); }; });
  ov.querySelector("#qTfP").onclick=function(){ tafsirSheet(k-1); };
  ov.querySelector("#qTfN").onclick=function(){ tafsirSheet(k+1); };
  needTafsir(src[0], s, function(arr){
    var B=ov.querySelector("#qTfB"); if(!B || !document.body.contains(ov)) return;
    if(!arr){ B.innerHTML='<div class="card mut small">'+L2("Tafsir perlukan internet kali pertama. Semak sambungan dan cuba lagi.","Tafsir needs the internet the first time. Check the connection and try again.")+'</div><button class="btn gold" id="qTfR">'+L2("Cuba lagi","Try again")+'</button>'; B.querySelector("#qTfR").onclick=function(){ tafsirSheet(k); }; return; }
    var i=a-1; while(i>0 && !arr[i]) i--; var j=a; while(j<arr.length && !arr[j]) j++;
    if(!arr[i]){ B.innerHTML='<div class="mut small">'+L2("Tiada tafsir untuk ayat ini dalam sumber ini.","This source has no tafsir for this ayat.")+'</div>'; return; }
    B.innerHTML=(i+1!==a || j>a?'<div class="badge">'+L2("Tafsir untuk ayat ","Tafsir for ayat ")+s+":"+(i+1)+(j>i+1?"–"+j:"")+'</div>':'')+clean(arr[i], src[3]==="ar")+'<div class="mut tiny">'+E(L2(src[1],src[2]))+' · Quran.com</div>';
  });
}
// ----- surah info -----
var SINFO={ch:null};
function needChapters(cb){ if(SINFO.ch){ cb(SINFO.ch); return; } var c=fRead("quran/info/ch.json"); if(c && c.length===114){ SINFO.ch=c; cb(c); return; }
  apiQ("chapters?language=ms", function(j){ if(!j || !j.chapters){ cb(null); return; } var a=j.chapters.map(function(x){ return [x.revelation_order, (x.translated_name||{}).name||""]; }); if(a.length===114){ SINFO.ch=a; fWrite("quran/info/ch.json", a); } cb(SINFO.ch); }); }
function needInfo(s, cb){ if(SINFO[s]){ cb(SINFO[s]); return; } var c=fRead("quran/info/s"+pad3(s)+".json"); if(c && c.t){ SINFO[s]=c; cb(c); return; }
  apiQ("chapters/"+s+"/info?language=en", function(j){ var x=j && j.chapter_info; if(!x){ cb(null); return; } SINFO[s]={st:x.short_text||"", t:x.text||"", src:x.source||""}; fWrite("quran/info/s"+pad3(s)+".json", SINFO[s]); cb(SINFO[s]); }); }
function infoSheet(s){
  var m=sMeta(s), a0=M.sa[s-1], a1=a0+m[4]-1, p0=pageOf(a0), p1=pageOf(a1), j0=juzOf(a0), j1=juzOf(a1), sj=M.sj.filter(function(k){ return k>=a0 && k<=a1; }).map(function(k){ return s+":"+fromIdx(k)[1]; });
  var row=function(l,v){ return '<div class="qir"><span>'+l+'</span><b>'+v+'</b></div>'; };
  var body='<div class="qsframe" style="margin:0 auto 8px"><span>'+E(m[0])+'</span></div><div class="card">'+
    row(L2("Nama","Name"), E(m[1]))+row(L2("Maksud","Meaning"), E(sMean(s)))+row(L2("Diturunkan","Revealed"), m[3]==="m"?L2("Makkah (Makkiyah)","Makkah (Makki)"):L2("Madinah (Madaniyah)","Madinah (Madani)"))+
    '<div id="qIOrd">'+row(L2("Turutan turun","Revelation order"), "…")+'</div>'+row(L2("Bilangan ayat","Ayat"), m[4])+row("Juz", j0===j1?j0:j0+"–"+j1)+row(L2("Muka surat","Pages"), p0===p1?p0:p0+"–"+p1)+row(L2("Kedudukan","Position"), s+" / 114")+
    (sj.length?row(L2("Sujud tilawah","Prostration"), sj.join(", ")):'')+'</div>'+
    '<div class="row"><button class="btn gold" id="qIRead">📖 '+L2("Baca","Read")+'</button><button class="btn alt" id="qIPlay">▶ '+L2("Dengar","Listen")+'</button></div>'+
    '<div class="snl">'+L2("Pengenalan surah (Bahasa Inggeris)","About this surah")+'</div><div id="qIB" class="qtfb"><div class="mut small">'+L2("Memuatkan…","Loading…")+'</div></div>';
  var ov=H.showSheet("ℹ️ "+E(sName(s)), body);
  ov.querySelector("#qIRead").onclick=function(){ H.closeOverlay(); openRead(a0); };
  ov.querySelector("#qIPlay").onclick=function(){ H.closeOverlay(); playRange(a0, a1, D.set.rep, D.set.repAll); };
  needChapters(function(c){ var el=ov.querySelector("#qIOrd"); if(el && c) el.innerHTML=row(L2("Turutan turun","Revelation order"), c[s-1][0]+" / 114"); else if(el) el.innerHTML=""; });
  needInfo(s, function(x){ var B=ov.querySelector("#qIB"); if(!B) return;
    if(!x){ B.innerHTML='<div class="mut small">'+L2("Pengenalan surah perlukan internet kali pertama.","The surah introduction needs the internet the first time.")+'</div>'; return; }
    B.innerHTML=(x.st?'<p><b>'+E(x.st)+'</b></p>':'')+clean(x.t)+'<div class="mut tiny">'+E(x.src)+' · Quran.com</div>'; });
}
// ----- roots / dictionary -----
var RT=null;
function needRoot(cb){ if(RT){ cb(); return; } loadScript("quran/qroot.js", function(){ var d=window.QROOT; RT=d; RT.ix={}; d.r.forEach(function(r,i){ RT.ix[r.replace(/-/g,"")]=i; }); RT.ak=function(i){ var o=[], p=0; d.ra[i].forEach(function(x){ p+=x; o.push(p); }); return o; }; cb(); }); }
function rootLetters(r){ return r.split("-").join(" "); }
function wordRoot(k, wi){ var r=fromIdx(k), d=SUR[r[0]]; return d && d.r && d.r[r[1]-1] ? d.r[r[1]-1][wi] : -1; }
function rootRow(i){ return '<button class="qsr" data-root="'+i+'"><span class="qrl" dir="rtl">'+E(rootLetters(RT.r[i]))+'</span><span class="qsn"><b>'+E(RT.rg[i]||"")+'</b><small>'+RT.ra[i].length+' '+L2("ayat","ayat")+' · '+RT.rn[i]+' '+L2("kali","times")+'</small></span><span class="shGo">›</span></button>'; }
var ABJ="ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي".split(" ");
function dictTab(){
  var wq=(D.wq||{})[ymd()];
  return '<button class="qwqB g3d" id="qWq"><span>🧩</span><span><b>'+L2("Kuiz 5 kata Al-Quran hari ini","Today\u2019s 5-word Quran quiz")+'</b><small>'+(wq!=null?L2("Skor hari ini: ","Today\u2019s score: ")+wq+"/5 · "+L2("cuba lagi untuk latihan","play again to practise"):L2("Kata paling kerap dalam Al-Quran, 5 sehari","The Quran\u2019s most frequent words, 5 a day"))+' · 🔥 '+wqStreak()+'</small></span></button>'+'<input type="search" class="ilq qfind" id="qDQ" placeholder="'+L2("Cari akar: رحم atau maksud: mercy","Find a root: رحم or a meaning: mercy")+'" value="'+E(st.dq||"")+'"><div class="qabj" dir="rtl">'+ABJ.map(function(c){ return '<button class="chip'+(st.dl===c?" on":"")+'" data-dl="'+c+'">'+c+'</button>'; }).join("")+'</div><div id="qDL" class="qlist"><div class="mut small">'+L2("Memuatkan…","Loading…")+'</div></div>'+
    '<div class="mut tiny">'+L2("Akar kata dan morfologi: Quranic Arabic Corpus (Universiti Leeds, GPL). Maksud: Quran.com (Bahasa Inggeris).","Roots and morphology: Quranic Arabic Corpus (University of Leeds, GPL). Meanings: Quran.com.")+'</div>';
}
function bindDict(){
  var wb=q("#qWq"); if(wb) wb.onclick=function(){ st.wq=null; goV("wq"); };
  needRoot(function(){ var L=q("#qDL"), Q=q("#qDQ"); if(!L) return;
    var draw=function(){ var v=(st.dq||"").trim(), ids=[];
      if(v && LET.test(v)){ var nv=arNorm(v).replace(/\s|-/g,"").replace(/[ىي]/g,"ي"); for(var i=0;i<RT.r.length;i++){ var rr=arNorm(RT.r[i]).replace(/-/g,""); if(rr.indexOf(nv)===0 || rr===nv) ids.push(i); } }
      else if(v){ var lv=v.toLowerCase(); for(var i2=0;i2<RT.r.length;i2++) if((RT.rg[i2]||"").indexOf(lv)>=0) ids.push(i2); }
      else if(st.dl){ for(var i3=0;i3<RT.r.length;i3++) if(arNorm(RT.r[i3]).charAt(0)===arNorm(st.dl)) ids.push(i3); }
      else { for(var i4=0;i4<RT.r.length;i4++) ids.push(i4); ids.sort(function(a,b){ return RT.rn[b]-RT.rn[a]; }); ids=ids.slice(0,60); }
      if(v || st.dl) ids.sort(function(a,b){ return RT.rn[b]-RT.rn[a]; });
      L.innerHTML=(!v && !st.dl?'<div class="snl">'+L2("Akar paling kerap","Most frequent roots")+'</div>':'<div class="snl">'+ids.length+' '+L2("akar","roots")+'</div>')+(ids.slice(0,150).map(rootRow).join("")||'<div class="mut small">'+L2("Tiada akar sepadan.","No matching root.")+'</div>');
      bindRoots(); };
    Q.oninput=function(){ st.dq=Q.value; draw(); };
    qa("[data-dl]").forEach(function(b){ b.onclick=function(){ var c=b.getAttribute("data-dl"); st.dl=st.dl===c?"":c; st.dq=""; Q.value=""; qa("[data-dl]").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-dl")===st.dl); }); draw(); }; });
    draw(); });
}
// ----- 0.7.93 (owner #8): Quran word quiz inside Kamus. 5 roots a day from the 300 most frequent; pick the meaning from 4 -----
function wqRand(seed){ var x=seed>>>0||1; return function(){ x=(x*1664525+1013904223)>>>0; return x/4294967296; }; }
function wqGloss(i){ return String(RT.rg[i]||"").split(";").map(function(t){ return t.trim(); }).filter(Boolean).slice(0,3).join(", "); }
function wqMake(practice){ var top=[]; for(var i=0;i<RT.r.length;i++) if(RT.rg[i]) top.push(i); top.sort(function(a,b){ return RT.rn[b]-RT.rn[a]; }); top=top.slice(0,300);
  var d=ymd(), rnd=wqRand(practice?Date.now():+d.replace(/-/g,"")), pick=[], used={};
  while(pick.length<5){ var c=top[Math.floor(rnd()*top.length)]; if(used[c]) continue; used[c]=1; var opts=[c], og={}; og[wqGloss(c)]=1;
    while(opts.length<4){ var o=top[Math.floor(rnd()*top.length)], g=wqGloss(o); if(og[g]||o===c) continue; og[g]=1; opts.push(o); }
    for(var j=3;j>0;j--){ var r=Math.floor(rnd()*(j+1)), t=opts[j]; opts[j]=opts[r]; opts[r]=t; } pick.push({k:c, o:opts}); }
  return {q:pick, i:0, sc:0, practice:!!practice, ans:[]}; }
function wqStreak(){ var n=0, t=new Date(); while(D.wq && D.wq[ymd(t)]!=null){ n++; t.setDate(t.getDate()-1); } return n; }
function wqView(){ needRoot(function(){ if(st.v!=="wq") return; var Z=st.wq=st.wq||wqMake(false);
  var h=topBar("🧩 "+L2("Kuiz kosa kata","Word quiz"), (Z.practice?L2("Latihan","Practice"):L2("Hari ini","Today"))+" · "+Math.min(Z.i+1,5)+"/5");
  if(Z.i>=5){ var known=Object.keys(D.wqk||{}).length;
    h+='<div class="card qwqEnd"><div class="qwqSc">'+Z.sc+'/5</div><div>'+(Z.sc===5?"🌟 "+L2("Sempurna! Masya-Allah.","Perfect! Masha'Allah."):Z.sc>=3?"👍 "+L2("Bagus!","Well done!"):"🌱 "+L2("Teruskan, sedikit demi sedikit.","Keep going, a little at a time."))+'</div>'+
      '<div class="mut small">'+L2("Akar dikuasai: ","Roots learned: ")+known+' · 🔥 '+wqStreak()+' '+L2("hari","days")+'</div>'+
      Z.ans.map(function(a){ return '<button class="qwqR'+(a.ok?' ok':' no')+'" data-root="'+a.k+'"><b dir="rtl" lang="ar">'+E(rootLetters(RT.r[a.k]))+'</b><span>'+E(wqGloss(a.k))+'</span><i>'+(a.ok?"✓":"✗")+'</i></button>'; }).join("")+
      '<button class="btn gold full" id="wqAg">🔁 '+L2("Latihan 5 lagi","Practise 5 more")+'</button></div>';
    box.innerHTML=h; bindTop(); bindRoots(); q("#wqAg").onclick=function(){ st.wq=wqMake(true); wqView(); }; return; }
  var Q=Z.q[Z.i], n=RT.rn[Q.k];
  h+='<div class="card qwqC"><div class="mut small">'+L2("Apakah maksud akar ini?","What does this root mean?")+'</div><div class="qwqAr" dir="rtl" lang="ar">'+E(rootLetters(RT.r[Q.k]))+'</div><div class="mut tiny">'+L2("Muncul ","Appears ")+n+L2(" kali dalam Al-Quran"," times in the Quran")+'</div>'+
    '<div class="qwqO">'+Q.o.map(function(o){ return '<button class="btn alt" data-wqo="'+o+'">'+E(wqGloss(o))+'</button>'; }).join("")+'</div><div id="wqF"></div></div>'+
    '<div class="mut tiny">'+L2("Maksud dalam Bahasa Inggeris dari Quranic Arabic Corpus.","English meanings from the Quranic Arabic Corpus.")+'</div>';
  box.innerHTML=h; bindTop();
  qa("[data-wqo]").forEach(function(b){ b.onclick=function(){ if(Q.done) return; Q.done=1; var o=+b.getAttribute("data-wqo"), ok=o===Q.k; if(ok){ Z.sc++; D.wqk=D.wqk||{}; D.wqk[Q.k]=(D.wqk[Q.k]||0)+1; } Z.ans.push({k:Q.k, ok:ok});
    qa("[data-wqo]").forEach(function(x){ var v=+x.getAttribute("data-wqo"); x.classList.add(v===Q.k?"ok":(x===b?"no":"dim")); }); if(H.N && H.N.vibrate) H.N.vibrate(ok?20:[30,40,30]);
    var F=q("#wqF"); F.innerHTML='<div class="qwqFb '+(ok?"ok":"no")+'">'+(ok?"✓ "+L2("Betul","Right"):"✗ "+L2("Jawapan: ","Answer: ")+E(wqGloss(Q.k)))+'</div><button class="btn gold full" id="wqN">'+(Z.i<4?L2("Seterusnya","Next")+" ›":L2("Lihat keputusan","See results"))+'</button>';
    q("#wqN").onclick=function(){ Z.i++; if(Z.i>=5 && !Z.practice){ D.wq=D.wq||{}; if(D.wq[ymd()]==null) D.wq[ymd()]=Z.sc; var ks=Object.keys(D.wq).sort(); while(ks.length>400) delete D.wq[ks.shift()]; } saveD(); wqView(); view().scrollTop=0; }; }; });
}); }
function bindRoots(){ qa("[data-root]").forEach(function(b){ if(b._b) return; b._b=1; b.onclick=function(){ rootList(+b.getAttribute("data-root")); }; }); }
function rootList(i){ needRoot(function(){ var r=RT.r[i];
  showList({icon:"🌱", ar:rootLetters(r), title:L2("Akar ","Root ")+rootLetters(r), sub:(RT.rg[i]||"")+" · "+RT.ra[i].length+" "+L2("ayat","ayat"), ks:RT.ak(i), root:i}); }); }
// ----- topics -----
function parseRefs(s){ var out=[]; String(s).split(",").forEach(function(p){ var m=p.trim().match(/^(\d+)(?::(\d+)(?:-(\d+))?)?$/); if(!m) return; var su=+m[1]; if(su<1||su>114) return; var n=sMeta(su)[4], a=m[2]?+m[2]:1, b=m[3]?+m[3]:(m[2]?a:n); for(var x=a;x<=Math.min(b,n);x++) out.push(gIdx(su,x)); }); return out; }
function topicsTab(){
  var T=window.QTOPIC||[];
  return '<div class="qtop2">'+T.map(function(t,i){ return '<button class="qtpc g3d" data-topic="'+i+'"><span>'+t[1]+'</span><b>'+E(L2(t[2],t[3]))+'</b><small>'+parseRefs(t[4]).length+' '+L2("ayat","ayat")+'</small></button>'; }).join("")+'</div><div class="mut tiny">'+L2("Senarai tema disusun daripada ayat-ayat yang masyhur dan menunggu semakan ustaz. Untuk semua ayat tentang sesuatu perkataan, guna Kamus.","Topics are put together from well-known ayat and await an ustaz review. For every ayat with a word, use the Dictionary.")+'</div>';
}
function needTopics(cb){ if(window.QTOPIC){ cb(); return; } loadScript("quran/qtopic.js", cb); }
function bindTopics(){ qa("[data-topic]").forEach(function(b){ b.onclick=function(){ var t=window.QTOPIC[+b.getAttribute("data-topic")]; showList({icon:t[1], title:L2(t[2],t[3]), sub:parseRefs(t[4]).length+" "+L2("ayat","ayat"), ks:parseRefs(t[4])}); }; }); }
// ----- generic ayat list view (topic, root) -----
function showList(o){ stopAuto(); st.list=o; st.listN=40; st.v="list"; render(); view().scrollTop=0; }
function listView(){
  var o=st.list; if(!o){ st.v="home"; home(); return; }
  box.innerHTML='<div class="qtop"><button class="ib" id="qBack">‹</button><div class="qtt"><b>'+o.icon+' '+E(o.title)+'</b><small>'+E(o.sub)+'</small></div>'+(o.ks.length>1?'<button class="ib" id="qLPlay">▶</button>':'')+'</div><div id="qLB" class="qlist"><div class="card mut">'+L2("Memuatkan…","Loading…")+'</div></div>';
  q("#qBack").onclick=function(){ back(); };
  var pb=q("#qLPlay"); if(pb) pb.onclick=function(){ playList(o.ks); };
  needAr(function(){ needEn(function(){ msReady(); var draw=function(){ var B=q("#qLB"); if(!B || st.list!==o) return;
    var lg=trList()[0]||"en", h='';
    o.ks.slice(0, st.listN).forEach(function(k){ var r=fromIdx(k), ar=E(window.QAR[k]||"");
      h+='<div class="qli card" data-k="'+k+'"><div class="qah"><button class="qn" data-open="'+k+'">'+E(sName(r[0]))+' '+r[0]+':'+r[1]+'</button><button class="ib" data-tfk="'+k+'" title="Tafsir">📚</button><button class="ib" data-pk="'+k+'">▶</button></div><div class="qlar" dir="rtl" lang="ar">'+ar+'</div><div class="qtr">'+E(trText(lg,k)||trText("en",k)||"")+'</div></div>'; });
    if(o.ks.length>st.listN) h+='<button class="btn alt full" id="qLMore">'+L2("Tunjuk lagi","Show more")+' ('+(o.ks.length-st.listN)+')</button>';
    B.innerHTML=h; bindOpen();
    B.querySelectorAll("[data-tfk]").forEach(function(b){ b.onclick=function(){ tafsirSheet(+b.getAttribute("data-tfk")); }; });
    B.querySelectorAll("[data-pk]").forEach(function(b){ b.onclick=function(){ var k=+b.getAttribute("data-pk"); playRange(k,k,D.set.rep,1); }; });
    var mo=q("#qLMore"); if(mo) mo.onclick=function(){ st.listN+=60; draw(); }; };
    draw(); }); });
  H.dockFix();
}

// ================= 0.17.0: hafazan, surah for the moment, khatam together, ayat in solat, tadabbur, Quran map, kids Juz Amma =================
function plainAyah(k){ var r=fromIdx(k), d=SUR[r[0]]; if(!d) return ""; return d.t[r[1]-1].map(function(x){ return typeof x==="string"?x:x[0]; }).join("").trim(); }
function topBar(title, sub){ return '<div class="qtop"><button class="ib" id="qBack">‹</button><div class="qtt"><b>'+title+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div></div>'; }
function bindTop(){ var b=q("#qBack"); if(b) b.onclick=function(){ back(); }; }
function goV(v){ stopAuto(); st.v=v; render(); view().scrollTop=0; }
function amalTab(){
  var due=hzDue().length, Q=H.load("ihsan_qsolat",{on:false,r:[]}), rem=D.set.rem||{};
  var h='<div class="qtop2">'+
    '<button class="qtpc g3d" data-qgo="hz"><span>🧠</span><b>'+L2("Hafazan","Memorise")+'</b><small>'+(due?due+L2(" ayat perlu diulang"," ayat due"):L2("Uji hafalan, ulang ikut jadual","Test yourself, review on schedule"))+'</small></button>'+
    '<button class="qtpc g3d" data-qgo="grp"><span>👨‍👩‍👧‍👦</span><b>'+L2("Khatam bersama","Khatam together")+'</b><small>'+D.grp.length+' '+L2("kumpulan","groups")+'</small></button>'+
    '<button class="qtpc g3d" data-qgo="map"><span>🗺</span><b>'+L2("Peta Al-Quran","Quran map")+'</b><small>'+L2("Makkah, Madinah & Sirah","Makkah, Madinah & Sirah")+'</small></button>'+
    '<button class="qtpc g3d" id="qSol"><span>🧎</span><b>'+L2("Ayat dalam solat","Ayat in your solat")+'</b><small>'+(Q.on?L2("Hidup: ","On: ")+(Q.r||[]).map(function(x){ return x?x[1]:"–"; }).join(", "):L2("Peringatan di kiraan rakaat","Reminder on the rakaat counter"))+'</small></button></div>';
  h+='<div class="snl">🕰 '+L2("Surah untuk masa ini","Surah for the moment")+'</div><div class="card">'+MOMENTS.map(function(m){ return '<div class="qmo"><button class="qmoo" data-open="'+gIdx(m[1],m[2])+'"><b>'+m[0]+' '+E(L2(m[3],m[4]))+'</b><small>'+E(L2(m[5],m[6]))+'</small></button><button class="ib" data-mop="'+m[1]+':'+m[2]+':'+m[7]+'">▶</button><label class="switch"><input type="checkbox" data-rem="'+m[8]+'"'+(rem[m[8]]?" checked":"")+'><span></span></label></div>'; }).join("")+
    '<div class="qmo"><span class="qmoo"><b>📅 '+L2("Peringatan bacaan harian","Daily reading reminder")+'</b><small>'+L2("40 minit selepas Subuh, ikut sasaran harian","40 min after Subuh, with your daily goal")+'</small></span><label class="switch"><input type="checkbox" data-rem="daily"'+(rem.daily?" checked":"")+'><span></span></label></div>'+
    '<div class="mut tiny">'+L2("Peringatan senyap (tiada bunyi azan). Pintasan juga boleh ditambah di Utama › Widget: Al-Kahf, Al-Mulk, Yasin, 2 ayat akhir Al-Baqarah.","Quiet reminders (no azan sound). Shortcuts can also go on Home › Widgets: Al-Kahf, Al-Mulk, Yasin, last 2 ayat of Al-Baqarah.")+'</div></div>';
  h+='<div class="snl">📝 '+L2("Tadabbur hari ini","Today’s tadabbur")+'</div><div class="card" id="qTad"><div class="mut small">'+L2("Memuatkan…","Loading…")+'</div></div>';
  return h;
}
// [icon, surah, ayat, ms, en, when ms, when en, last ayat (0 = whole surah), reminder key]
var MOMENTS=[["🕳",18,1,"Al-Kahf","Al-Kahf","Hari Jumaat","On Friday",0,"kahf"],["🌙",67,1,"Al-Mulk","Al-Mulk","Sebelum tidur","Before sleep",0,"mulk"],["🛡",2,285,"2 ayat akhir Al-Baqarah","Last 2 ayat of Al-Baqarah","Pada waktu malam","At night",286,"mulk"],["💚",36,1,"Yasin","Yasin","Malam Jumaat","Thursday night",0,"yasin"]];
function bindAmal(){
  qa("[data-qgo]").forEach(function(b){ b.onclick=function(){ goV(b.getAttribute("data-qgo")); }; });
  var so=q("#qSol"); if(so) so.onclick=solatSheet;
  qa("[data-mop]").forEach(function(b){ b.onclick=function(){ var p=b.getAttribute("data-mop").split(":"), s=+p[0], a=+p[1], e=+p[2]||sMeta(s)[4]; playRange(gIdx(s,a), gIdx(s,e), 1, 1); H.toast(L2("Memainkan ","Playing ")+sName(s)); }; });
  qa("[data-rem]").forEach(function(c){ c.onchange=function(){ D.set.rem=D.set.rem||{}; var k=c.getAttribute("data-rem"); D.set.rem[k]=c.checked; qa('[data-rem="'+k+'"]').forEach(function(x){ x.checked=c.checked; }); saveD(); if(H.resched) H.resched(); H.toast(c.checked?L2("Peringatan dihidupkan","Reminder on"):L2("Peringatan dimatikan","Reminder off")); }; });
  tadabbur();
}
// ----- tadabbur -----
function tadPool(){ var out=[]; (window.QTOPIC||[]).forEach(function(t){ out=out.concat(parseRefs(t[4]).slice(0,6)); }); return out; }
function tadabbur(){
  var C=q("#qTad"); if(!C) return; var pool=tadPool(), d=ymd(), day=Math.floor(new Date(d+"T12:00:00").getTime()/864e5), k=pool[day%pool.length], r=fromIdx(k), cur=D.tad[d]||{};
  needAr(function(){ needEn(function(){ msReady(); if(!document.body.contains(C)) return; var lg=trList()[0]||"en";
    C.innerHTML='<button class="qn" data-open="'+k+'">'+E(sName(r[0]))+' '+r[0]+':'+r[1]+'</button><div class="qlar" dir="rtl" lang="ar">'+E(window.QAR[k])+'</div><div class="qtr">'+E(trText(lg,k)||trText("en",k)||"")+'</div>'+
      '<div class="small" style="margin-top:8px">'+L2("Apa yang ayat ini ajar kepada saya hari ini?","What does this ayat teach me today?")+'</div><textarea id="qTadT" rows="3" style="width:100%;margin-top:4px">'+E(cur.t||"")+'</textarea>'+
      '<div class="row"><button class="btn gold" id="qTadS">💾 '+L2("Simpan ke Muhasabah","Save to journal")+'</button><button class="btn alt" data-tfk2="'+k+'">📚 Tafsir</button></div>';
    bindOpen(); C.querySelector("[data-tfk2]").onclick=function(){ tafsirSheet(k); };
    C.querySelector("#qTadS").onclick=function(){ var t=C.querySelector("#qTadT").value.trim(); D.tad[d]={k:k,t:t}; saveD(); if(H.jnTad) H.jnTad(d, k, sName(r[0])+" "+r[0]+":"+r[1]+" · "+t); H.toast(L2("Disimpan dalam jurnal Muhasabah","Saved in the reflection journal")); };
  }); });
}
// ----- ayat in solat -----
function solatSheet(){
  var Q=H.load("ihsan_qsolat",{on:false,r:[]}), opts=function(cur){ var o='<option value="">–</option>'; for(var s=1;s<=114;s++) if(s>=78 || [1,2,18,36,55,56,67].indexOf(s)<0 || true) o+='<option value="'+s+'"'+(cur===s?" selected":"")+'>'+s+'. '+E(sName(s))+'</option>'; return o; };
  var body='<div class="mut small">'+L2("Pilih surah yang anda mahu baca selepas Al-Fatihah. Ketika mengira rakaat, namanya dan permulaan ayatnya muncul di bawah kiraan sebagai peringatan.","Pick the surah you will read after Al-Fatihah. While counting rakaat, its name and opening words show under the counter as a reminder.")+'</div>'+
    '<div class="set"><span>'+L2("Hidupkan peringatan","Show the reminder")+'</span><label class="switch"><input type="checkbox" id="qsOn"'+(Q.on?" checked":"")+'><span></span></label></div>'+
    [1,2].map(function(i){ var x=(Q.r||[])[i-1]; return '<div class="snl">'+L2("Rakaat ","Rakaat ")+i+'</div><select id="qsR'+i+'" style="width:100%">'+opts(x?x[0]:0)+'</select>'; }).join("")+
    '<div class="chips" style="margin-top:8px">'+[[112,113],[109,112],[103,108],[87,88],[93,94],[1,0]].slice(0,5).map(function(p){ return '<button class="chip" data-qsp="'+p[0]+','+p[1]+'">'+E(sName(p[0]))+' + '+E(sName(p[1]))+'</button>'; }).join("")+'</div>'+
    '<button class="btn gold full" id="qsSave" style="margin-top:10px">'+L2("Simpan","Save")+'</button>';
  var ov=H.showSheet("🧎 "+L2("Ayat dalam solat","Ayat in your solat"), body);
  ov.querySelectorAll("[data-qsp]").forEach(function(b){ b.onclick=function(){ var p=b.getAttribute("data-qsp").split(","); ov.querySelector("#qsR1").value=p[0]; ov.querySelector("#qsR2").value=p[1]; }; });
  ov.querySelector("#qsSave").onclick=function(){ var ss=[+ov.querySelector("#qsR1").value||0, +ov.querySelector("#qsR2").value||0], out=[], i=0;
    var next=function(){ if(i>=2){ H.save("ihsan_qsolat",{on:ov.querySelector("#qsOn").checked, r:out}); H.closeOverlay(); H.toast(L2("Disimpan","Saved")); if(st.tab==="amal") home(); return; }
      var s=ss[i]; if(!s){ out.push(null); i++; next(); return; }
      needSurah(s, function(){ var w=plainAyah(M.sa[s-1]).split(/\s+/).slice(0,5).join(" "); out.push([s, sName(s), w]); i++; next(); }); };
    next(); };
}
// ----- hafazan (self-check + spaced review) -----
var HZI=[1,1,3,7,14,30];
function hzDue(){ var d=ymd(), out=[]; for(var k in D.hz.c){ if(D.hz.c[k][1]<=d) out.push(+k); } return out.sort(function(a,b){ return a-b; }); }
function addDaysY(n){ var t=new Date(); t.setDate(t.getDate()+n); return ymd(t); }
// 0.7.93 (owner #6): fade mode. The whole ayat shows; each "Fade" hides one more word (spread out, not just the end). Recite, then tap the words you missed; Done updates the review schedule.
function hzFadeOrder(n, k){ var o=[], r=wqRand(k*7919+n); for(var i=0;i<n;i++) o.push(i); for(var j=n-1;j>0;j--){ var x=Math.floor(r()*(j+1)), t=o[j]; o[j]=o[x]; o[x]=t; } return o; }
function hzFade(L, list){
  L.innerHTML='<div class="card mut small">'+L2("Baca ayat, tekan 🫥 untuk memudarkan satu lagi perkataan, dan baca semula dari ingatan. Ketik perkataan yang anda terlupa (jadi merah), kemudian ✓ Selesai.","Read the ayat, tap 🫥 to fade one more word, and recite again from memory. Tap any word you forgot (it turns red), then ✓ Done.")+'</div>'+
    list.slice(0,80).map(function(k){ var r=fromIdx(k), w=plainAyah(k).split(/\s+/).filter(Boolean);
      return '<div class="card hzf" data-k="'+k+'" data-lv="0"><div class="qah"><span class="qn">'+r[0]+':'+r[1]+'</span><button class="ib" data-hzp="'+k+'" aria-label="'+L2("Dengar","Listen")+'">🔊</button></div>'+
        '<div class="qlar hzft" dir="rtl" lang="ar">'+w.map(function(x, i){ return '<span class="hzfw" data-i="'+i+'">'+E(x)+'</span>'; }).join(" ")+'</div>'+
        '<div class="row hzfb"><button class="btn alt" data-hzf="1">🫥 '+L2("Pudar","Fade")+' <small>0/'+w.length+'</small></button><button class="btn alt" data-hzf="0">↺</button><button class="btn gold" data-hzd="1">✓ '+L2("Selesai","Done")+'</button></div></div>'; }).join("");
  L.onclick=function(e){ var card=e.target.closest(".hzf"); if(!card) return; var k=+card.getAttribute("data-k"), ws=card.querySelectorAll(".hzfw"), n=ws.length, ord=hzFadeOrder(n, k);
    var wd=e.target.closest(".hzfw"); if(wd && !card.classList.contains("done")){ wd.classList.toggle("miss"); return; }
    var b=e.target.closest("button"); if(!b) return;
    if(b.hasAttribute("data-hzp")){ playRange(k,k,1,1); return; }
    if(b.hasAttribute("data-hzf")){ var lv=b.getAttribute("data-hzf")==="1"?Math.min(n, +card.getAttribute("data-lv")+1):0; card.setAttribute("data-lv", lv);
      [].forEach.call(ws, function(x){ x.classList.remove("gone"); }); for(var i=0;i<lv;i++) ws[ord[i]].classList.add("gone");
      card.querySelector('[data-hzf="1"] small').textContent=lv+"/"+n; return; }
    if(b.hasAttribute("data-hzd")){ var miss=card.querySelectorAll(".hzfw.miss").length, lv2=+card.getAttribute("data-lv"), ok=!miss && lv2>=Math.ceil(n/2), cur=D.hz.c[k]||[0,""], bx=ok?Math.min(5,cur[0]+1):0;
      if(miss){ D.hz.m=D.hz.m||{}; D.hz.m[k]=(D.hz.m[k]||0)+1; } D.hz.c[k]=[bx, addDaysY(ok?HZI[bx]:1)]; saveD(); card.classList.add("done", ok?"ok":"no");
      card.querySelector(".hzfb").innerHTML='<span class="small">'+(ok?"✓ "+L2("Ulang pada ","Next review ")+D.hz.c[k][1]:miss?"✗ "+miss+L2(" perkataan terlupa · ulang esok"," words missed · review tomorrow"):"🌱 "+L2("Pudarkan sekurang-kurangnya separuh untuk dikira hafal · ulang esok","Fade at least half to count as known · review tomorrow"))+'</span>'; } };
}
function hzView(){
  var s=D.hz.s||114, m=sMeta(s), mode=st.hzMode||"surah", list=[];
  if(mode==="due") list=hzDue(); else for(var a=1;a<=m[4];a++) list.push(gIdx(s,a));
  var known=0; for(var a2=1;a2<=m[4];a2++){ var c=D.hz.c[gIdx(s,a2)]; if(c && c[0]>=3) known++; }
  var h=topBar("🧠 "+L2("Hafazan","Memorise"), mode==="due"?L2("Ulang kaji: ","Review: ")+list.length+" ayat":E(sName(s))+" · "+known+"/"+m[4]+" "+L2("hafal","known"));
  h+='<div class="card"><div class="row"><select id="hzS" style="flex:1">'+(function(){ var o=''; for(var i=114;i>=1;i--) o+='<option value="'+i+'"'+(i===s?" selected":"")+'>'+i+'. '+E(sName(i))+'</option>'; return o; })()+'</select></div>'+
    '<div class="chips" style="margin-top:8px"><button class="chip'+(mode==="surah"?" on":"")+'" data-hzm="surah">📜 '+L2("Seluruh surah","Whole surah")+'</button><button class="chip'+(mode==="due"?" on":"")+'" data-hzm="due">🔁 '+L2("Ulang kaji","Review")+' ('+hzDue().length+')</button><button class="chip'+(mode==="fade"?" on":"")+'" data-hzm="fade">🫥 '+L2("Pudar","Fade")+'</button></div>'+
    '<div class="mut tiny" style="margin-top:6px">'+L2("Baca dari ingatan, kemudian tekan Tunjuk dan tanda sendiri. Ayat yang belum lekat akan kembali esok; yang betul kembali selepas 3, 7, 14 dan 30 hari.","Recite from memory, then tap Show and mark yourself. Weak ayat come back tomorrow; correct ones after 3, 7, 14 and 30 days.")+'</div></div>';
  var ml=Object.keys(D.hz.m||{}).sort(function(x, y){ return D.hz.m[y]-D.hz.m[x]; }).slice(0,8);
  if(ml.length) h+='<div class="card"><h3>⚠ '+L2("Paling kerap silap","Most missed")+'</h3><div class="chips" style="flex-wrap:wrap">'+ml.map(function(k){ var r=fromIdx(+k); return '<button class="chip" data-open="'+k+'">'+E(sName(r[0]))+' '+r[0]+':'+r[1]+' · '+D.hz.m[k]+'×</button>'; }).join("")+'</div><button class="chip" id="hzMx" style="margin-top:6px">⟲ '+L2("Kosongkan log","Clear the log")+'</button></div>';
  h+='<div id="hzL">'+(list.length?'':'<div class="card mut">'+L2("Tiada ayat untuk diulang hari ini. Alhamdulillah!","Nothing to review today. Alhamdulillah!")+'</div>')+'</div>';
  box.innerHTML=h; bindTop();
  bindOpen(); var mx=q("#hzMx"); if(mx) mx.onclick=function(){ D.hz.m={}; saveD(); hzView(); };
  q("#hzS").onchange=function(){ D.hz.s=+this.value; st.hzMode="surah"; saveD(); hzView(); };
  qa("[data-hzm]").forEach(function(b){ b.onclick=function(){ st.hzMode=b.getAttribute("data-hzm"); hzView(); }; });
  var surs={}; list.forEach(function(k){ surs[fromIdx(k)[0]]=1; }); var ss=Object.keys(surs), i=0;
  var go=function(){ if(i<ss.length){ needSurah(+ss[i++], go); return; } var L=q("#hzL"); if(!L) return;
    if(mode==="fade"){ hzFade(L, list); return; }
    L.innerHTML=list.slice(0,80).map(function(k){ var r=fromIdx(k), c=D.hz.c[k], t=plainAyah(k), w=t.split(/\s+/);
      return '<div class="card hzc" data-k="'+k+'"><div class="qah"><span class="qn">'+r[0]+':'+r[1]+'</span>'+(c?'<span class="badge">'+["🌱","🌿","🌿","🌳","🌳","⭐"][c[0]]+' '+(c[0]>=3?L2("hafal","known"):L2("belajar","learning"))+'</span>':'')+'<span style="flex:1"></span><button class="ib" data-hzp="'+k+'">🔊</button></div>'+
        '<div class="qlar hzt" dir="rtl" lang="ar"><span class="hzh">'+E(w[0])+'</span> <span class="hzx">'+w.slice(1).map(function(x){ return '<span class="hzw">'+E(x)+'</span>'; }).join(" ")+'</span></div>'+
        '<div class="mut tiny hzhint">'+L2("Ketik ayat untuk buka satu perkataan demi satu","Tap the ayat to reveal one word at a time")+((D.hz.m||{})[k]?' · ⚠ '+L2("silap ","missed ")+D.hz.m[k]+'×':'')+'</div>'+
        '<div class="row hzb"><button class="btn alt" data-hzr="'+k+'">👁 '+L2("Tunjuk","Show")+'</button><button class="btn gold hidden" data-hzy="'+k+'">✓ '+L2("Betul","Right")+'</button><button class="btn alt hidden" data-hzn="'+k+'">✗ '+L2("Belum","Not yet")+'</button></div></div>'; }).join("")+(list.length>80?'<div class="mut small">'+L2("80 ayat pertama ditunjukkan.","First 80 ayat shown.")+'</div>':'');
    L.onclick=function(e){ var t0=e.target.closest(".hzt"); if(t0 && !t0.closest(".shown")){ var nx=t0.querySelector(".hzw:not(.rv)"); if(nx){ nx.classList.add("rv"); if(!t0.querySelector(".hzw:not(.rv)")){ var c0=t0.closest(".hzc"), sb=c0.querySelector("[data-hzr]"); if(sb) sb.click(); } } return; }
      var b=e.target.closest("button"); if(!b) return; var k;
      if(b.hasAttribute("data-hzp")){ k=+b.getAttribute("data-hzp"); playRange(k,k,1,1); return; }
      if(b.hasAttribute("data-hzr")){ var c=b.closest(".hzc"); c.classList.add("shown"); b.classList.add("hidden"); c.querySelectorAll(".hidden").forEach(function(x){ if(x!==b) x.classList.remove("hidden"); }); return; }
      if(b.hasAttribute("data-hzy")||b.hasAttribute("data-hzn")){ k=+(b.getAttribute("data-hzy")||b.getAttribute("data-hzn")); if(b.hasAttribute("data-hzn")){ D.hz.m=D.hz.m||{}; D.hz.m[k]=(D.hz.m[k]||0)+1; } var ok=b.hasAttribute("data-hzy"), cur=D.hz.c[k]||[0,""], bx=ok?Math.min(5,cur[0]+(D.hz.c[k]?1:3)):0;
        D.hz.c[k]=[bx, addDaysY(ok?HZI[bx]:1)]; saveD(); var card=b.closest(".hzc"); card.classList.add(ok?"ok":"no"); card.querySelector(".hzb").innerHTML='<span class="small">'+(ok?"✓ "+L2("Ulang pada ","Next review ")+D.hz.c[k][1]:"✗ "+L2("Ulang esok","Again tomorrow"))+'</span>'; } };
  }; go();
}
// ----- khatam together -----
function grpView(){
  var g=st.grp!=null?D.grp.filter(function(x){ return x.id===st.grp; })[0]:null, h;
  if(!g){
    h=topBar("👨‍👩‍👧‍👦 "+L2("Khatam bersama","Khatam together"), L2("Bahagikan 30 juz kepada keluarga atau usrah","Split the 30 juz across family or usrah"));
    h+=D.grp.map(function(x){ var n=x.d.split("").filter(function(c){ return c==="1"; }).length; return '<button class="qsr" data-grp="'+x.id+'"><span class="qno">'+n+'</span><span class="qsn"><b>'+E(x.n)+'</b><small>'+x.m.length+' '+L2("orang","people")+' · '+n+'/30 juz</small></span><span class="shGo">›</span></button>'; }).join("");
    h+='<div class="card"><h3>'+L2("Kumpulan baharu","New group")+'</h3><input id="gN" placeholder="'+L2("Nama kumpulan, cth. Keluarga Ahmad","Group name, e.g. Ahmad family")+'" style="width:100%"><textarea id="gM" rows="4" style="width:100%;margin-top:6px" placeholder="'+L2("Nama ahli, satu setiap baris","Members, one name per line")+'"></textarea><button class="btn gold full" id="gAdd" style="margin-top:6px">＋ '+L2("Cipta dan bahagi juz","Create and split the juz")+'</button></div>'+
      '<div class="card"><h3>'+L2("Terima kod kumpulan","Import a group code")+'</h3><textarea id="gI" rows="3" style="width:100%" placeholder="'+L2("Tampal mesej yang dikongsi (ada kod IBK1:…)","Paste the shared message (it has an IBK1:… code)")+'"></textarea><button class="btn alt full" id="gImp" style="margin-top:6px">⬇ '+L2("Terima","Import")+'</button></div>';
    box.innerHTML=h; bindTop();
    qa("[data-grp]").forEach(function(b){ b.onclick=function(){ st.grp=b.getAttribute("data-grp"); grpView(); }; });
    q("#gAdd").onclick=function(){ var n=q("#gN").value.trim(), m=q("#gM").value.split(/\n/).map(function(x){ return x.trim(); }).filter(Boolean); if(!n||!m.length){ H.toast(L2("Isi nama kumpulan dan sekurang-kurangnya seorang ahli","Enter a group name and at least one member")); return; }
      var o=[]; for(var j=0;j<30;j++) o.push(Math.floor(j*m.length/30)); var x={id:"g"+Date.now().toString(36), n:n, m:m, o:o, d:new Array(31).join("0"), t:Date.now()}; D.grp.push(x); saveD(); st.grp=x.id; grpView(); };
    q("#gImp").onclick=function(){ var r=grpImport(q("#gI").value); H.toast(r?L2("Kumpulan dikemas kini: ","Group updated: ")+r.n:L2("Kod tidak ditemui","No code found")); if(r){ st.grp=r.id; grpView(); } };
    return;
  }
  var dn=g.d.split("").filter(function(c){ return c==="1"; }).length;
  h=topBar("👨‍👩‍👧‍👦 "+E(g.n), dn+"/30 juz · "+g.m.length+" "+L2("orang","people"));
  h+='<div class="card"><div class="bar"><div style="width:'+Math.round(dn*100/30)+'%"></div></div><div class="mut tiny">'+L2("Ketik nama untuk tukar pembaca. Ketik kotak bila juz itu selesai. Kemudian Kongsi supaya semua dapat kemas kini.","Tap a name to change the reader. Tick the box when a juz is done. Then Share so everyone gets the update.")+'</div></div><div class="qlist">';
  for(var j=0;j<30;j++){ var on=g.d.charAt(j)==="1", k=M.ja[j], r=fromIdx(k);
    h+='<div class="qgj'+(on?" on":"")+'"><button class="qgc" data-gd="'+j+'">'+(on?"✅":"⬜")+'</button><button class="qgo" data-open="'+k+'"><b>Juz '+(j+1)+'</b><small>'+E(sName(r[0]))+' '+r[0]+':'+r[1]+'</small></button><button class="chip" data-gw="'+j+'">'+E(g.m[g.o[j]]||"?")+'</button></div>'; }
  h+='</div><div class="row" style="margin:10px 0"><button class="btn gold" id="gSh">↗ '+L2("Kongsi","Share")+'</button><button class="btn alt" id="gDel">🗑 '+L2("Padam","Delete")+'</button></div>';
  box.innerHTML=h; bindTop(); bindOpen();
  qa("[data-gd]").forEach(function(b){ b.onclick=function(){ var j=+b.getAttribute("data-gd"), a=g.d.split(""); a[j]=a[j]==="1"?"0":"1"; g.d=a.join(""); g.t=Date.now(); saveD(); grpView(); if(g.d.indexOf("0")<0) H.toast("🎉 Khatam! Alhamdulillah."); }; });
  qa("[data-gw]").forEach(function(b){ b.onclick=function(){ var j=+b.getAttribute("data-gw"); g.o[j]=(g.o[j]+1)%g.m.length; g.t=Date.now(); saveD(); b.textContent=g.m[g.o[j]]; }; });
  q("#gSh").onclick=function(){ var t="📖 "+L2("Khatam bersama: ","Khatam together: ")+g.n+" ("+dn+"/30)\n"; for(var j=0;j<30;j++) t+=(g.d.charAt(j)==="1"?"✅":"⬜")+" Juz "+(j+1)+": "+g.m[g.o[j]]+"\n";
    t+="\n"+L2("Buka aplikasi My Ihsan › Al-Quran › Amalan › Khatam bersama › Terima, dan tampal mesej ini.","Open My Ihsan › Al-Quran › Practice › Khatam together › Import, and paste this message.")+"\nIBK1:"+btoa(unescape(encodeURIComponent(JSON.stringify({id:g.id,n:g.n,m:g.m,o:g.o,d:g.d,t:g.t}))));
    if(window.Native && H.N.shareText) H.N.shareText(t); else { try{ navigator.clipboard.writeText(t); }catch(e){} H.toast(L2("Disalin","Copied")); } };
  q("#gDel").onclick=function(){ if(!confirm(L2("Padam kumpulan ini?","Delete this group?"))) return; D.grp=D.grp.filter(function(x){ return x.id!==g.id; }); st.grp=null; saveD(); grpView(); };
}
function grpImport(text){
  var m=String(text||"").match(/IBK1:([A-Za-z0-9+\/=]+)/); if(!m) return null; var o;
  try{ o=JSON.parse(decodeURIComponent(escape(atob(m[1])))); }catch(e){ return null; }
  if(!o || !o.id || !o.m || !o.o || !o.d || o.d.length!==30) return null;
  var g=D.grp.filter(function(x){ return x.id===o.id; })[0];
  if(!g){ D.grp.push(o); saveD(); return o; }
  var a=g.d.split(""), b=o.d.split(""); for(var j=0;j<30;j++) if(b[j]==="1") a[j]="1"; g.d=a.join("");
  if((o.t||0)>(g.t||0)){ g.m=o.m; g.o=o.o; g.n=o.n; g.t=o.t; } saveD(); return g;
}
// ----- Quran map + Sirah -----
// [sirah event id, refs, Malay, English]
var QSIRAH=[["s7","105","Tahun Gajah: Surah Al-Fil","The Year of the Elephant: Surah Al-Fil"],["s24","96:1-5","Wahyu pertama: Iqra'","The first revelation: Iqra'"],["s26","93","Wahyu terhenti: Surah Ad-Duha","The pause in revelation: Surah Ad-Duha"],["s27","74:1-7","Wahyu kembali: Al-Muddaththir","Revelation returns: Al-Muddaththir"],
 ["s31","111","Seruan di Bukit Safa: Surah Al-Masad","The call from Safa: Surah Al-Masad"],["s37","53:59-62","Sujud selepas Surah An-Najm","The prostration after An-Najm"],["s50","46:29-32,72:1-2","Jin mendengar Al-Quran","The jinn listen to the Quran"],["s56","17:1","Isra' dan Mi'raj","Isra' and Mi'raj"],
 ["s61","8:30","Pakatan membunuh Nabi ﷺ","The plot to kill the Prophet ﷺ"],["s63","9:40","Di Gua Thaur","In the Cave of Thaur"],["s75","22:39-40","Izin berperang","Permission to fight"],["s76","2:142-150","Kiblat bertukar ke Kaabah","The qiblah turns to the Kaabah"],["s77","2:183-185","Puasa Ramadan diwajibkan","Ramadan fasting made obligatory"],
 ["s78","8:5-19,8:41-44","Perang Badar","The Battle of Badr"],["s84","3:121-129,3:152-155","Perang Uhud","The Battle of Uhud"],["s85","3:172-174","Hamra' al-Asad","Hamra' al-Asad"],["s87","59:2-6","Bani Nadhir diusir","Banu an-Nadir expelled"],["s90","33:9-27","Perang Khandaq (Ahzab)","The Battle of the Trench"],
 ["s92","24:11-20","Peristiwa fitnah (Ifk)","The slander (Ifk)"],["s93","48:1-29","Hudaibiyah: Surah Al-Fath","Hudaibiyah: Surah Al-Fath"],["s97","4:101-102","Solat khauf","The prayer of fear"],["s101","110,17:81","Pembukaan Makkah","The Conquest of Makkah"],["s102","9:25-26","Perang Hunain","The Battle of Hunain"],
 ["s105","9:38-49,9:117-118","Tabuk dan tiga sahabat","Tabuk and the three who stayed behind"],["s106","9:1-5","Surah Bara'ah dibacakan","Surah Bara'ah proclaimed"],["s108","5:3","Haji Wada': agama disempurnakan","The Farewell Hajj: the religion completed"],["s113","3:144","Ucapan Abu Bakar","Abu Bakr's speech"]];
function mapView(){
  var ord=st.mapOrd||"m", ch=SINFO.ch, h=topBar("🗺 "+L2("Peta Al-Quran","Quran map"), L2("Di mana setiap surah diturunkan","Where each surah was revealed"));
  var cell=function(s){ var m=sMeta(s); return '<button class="qmc '+(m[3]==="m"?"mk":"md")+'" data-info="'+s+'"><b>'+s+'</b>'+(ch?'<small>#'+ch[s-1][0]+'</small>':'')+'</button>'; };
  var list=[]; for(var s=1;s<=114;s++) list.push(s); if(ord==="r" && ch) list.sort(function(a,b){ return ch[a-1][0]-ch[b-1][0]; });
  var mk=list.filter(function(s){ return sMeta(s)[3]==="m"; }), md=list.filter(function(s){ return sMeta(s)[3]==="d"; });
  h+='<div class="chips"><button class="chip'+(ord==="m"?" on":"")+'" data-ord="m">'+L2("Susunan mushaf","Mushaf order")+'</button><button class="chip'+(ord==="r"?" on":"")+'" data-ord="r">'+L2("Turutan turun","Revelation order")+'</button></div>';
  h+='<div class="qmap"><div class="card qmz"><h3>🕋 Makkah <small>'+mk.length+' surah · '+L2("13 tahun","13 years")+'</small></h3><div class="mut tiny">'+L2("Tauhid, akhirat, kisah para nabi, sabar.","Tawhid, the hereafter, prophets’ stories, patience.")+'</div><div class="qmg">'+mk.map(cell).join("")+'</div></div>'+
    '<div class="qmarrow">🐪 '+L2("Hijrah 622 M, 400 km","Hijrah 622 CE, 400 km")+' →</div>'+
    '<div class="card qmz"><h3>🕌 Madinah <small>'+md.length+' surah · '+L2("10 tahun","10 years")+'</small></h3><div class="mut tiny">'+L2("Hukum, masyarakat, keluarga, jihad, perjanjian.","Law, society, family, defence, treaties.")+'</div><div class="qmg">'+md.map(cell).join("")+'</div></div></div>';
  if(!ch) h+='<div class="mut tiny">'+L2("Nombor turutan turun dimuat turun dari Quran.com apabila ada internet.","Revelation order numbers download from Quran.com when online.")+'</div>';
  h+='<div class="snl">🐪 '+L2("Al-Quran dalam Sirah","The Quran in the Sirah")+'</div><div class="qlist">'+QSIRAH.map(function(x,i){ var ks=parseRefs(x[1]), r=fromIdx(ks[0]);
    return '<div class="qsrh"><button class="qsr" data-open="'+ks[0]+'"><span class="qno">📖</span><span class="qsn"><b>'+E(L2(x[2],x[3]))+'</b><small>'+E(x[1].split(",").map(function(p){ var s=+p.split(":")[0]; return sName(s)+(p.indexOf(":")>0?" "+p:""); }).join(" · "))+'</small></span></button><button class="ib" data-qsir="'+x[0]+'" title="Sirah">🐪</button></div>'; }).join("")+'</div>';
  box.innerHTML=h; bindTop(); bindOpen();
  qa("[data-ord]").forEach(function(b){ b.onclick=function(){ st.mapOrd=b.getAttribute("data-ord"); mapView(); }; });
  qa("[data-info]").forEach(function(b){ b.onclick=function(){ infoSheet(+b.getAttribute("data-info")); }; });
  qa("[data-qsir]").forEach(function(b){ b.onclick=function(){ if(H.openSirahAt) H.openSirahAt(b.getAttribute("data-qsir")); }; });
  if(!ch) needChapters(function(c){ if(c && st.v==="map" && box) mapView(); });
}
// ----- Ramadan khatam -----
function ramadanStart(){ if(!H.hijri) return null; var t=new Date(); t.setHours(12,0,0,0);
  var h=H.hijri(t); if(h && h.m===9) return ymd(H.addDays(t, -(h.d-1)));
  for(var i=1;i<400;i++){ var d=H.addDays(t,i), x=H.hijri(d); if(x && x.m===9 && x.d===1) return ymd(d); } return null; }
// ----- Juz Amma for kids -----
var KS={s:null,a:1};
function kidsList(){
  var J=H.load("ihsan_jamma",{s:{}}), n=Object.keys(J.s).length, h='<div class="card kjm"><h3>⭐ '+n+'/37</h3><div class="mut small">'+L2("Pilih surah. Dengar, baca bersama, dan kumpul bintang!","Pick a surah. Listen, read along and collect stars!")+'</div></div><div class="kjg">';
  for(var s=114;s>=78;s--) h+='<button class="kjb'+(J.s[s]?" on":"")+'" data-ks="'+s+'"><span class="kja">'+E(sMeta(s)[0])+'</span><b>'+E(sName(s))+'</b><small>'+(J.s[s]?"⭐":sMeta(s)[4]+" ayat")+'</small></button>';
  box.innerHTML=h+'</div>';
  qa("[data-ks]").forEach(function(b){ b.onclick=function(){ KS.s=+b.getAttribute("data-ks"); KS.a=1; needSurah(KS.s, kidsAyah); }; });
}
// 0.34.0: one ayah card for kids (also the neighbour that rides in during a swipe)
function kidsInner(s, a){
  var n=sMeta(s)[4], k=gIdx(s,a), W=(SUR[s]&&SUR[s].w[a-1])||[], last=a===n, tr=(!en() && TR.ms)?TR.ms[k]:(en()&&window.QEN?window.QEN[k]:null);
  var dots=''; for(var i=1;i<=n;i++) dots+='<i class="'+(i<a?"d":i===a?"c":"")+'"></i>';
  return '<div class="row"><b>'+E(sName(s))+'</b><span class="mut small">'+a+' / '+n+'</span></div><div class="kjdots">'+dots+'</div>'+
    (a===1 && s!==9?'<div class="qbasm">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>':'')+
    '<div class="kjar" dir="rtl" lang="ar">'+E(plainAyah(k))+' <span class="qend">﴿'+adig(a)+'﴾</span></div><div class="kjrm">'+E(W.map(function(x){ return x[1]; }).join(" "))+'</div>'+
    '<div class="kjtr" id="kjTr">'+E(tr||"")+'</div>'+
    '<div class="kjbtn"><button class="btn alt" id="kjN"'+(last?" disabled":"")+'>‹</button><button class="btn gold" id="kjL">🔊 '+L2("Dengar","Listen")+'</button><button class="btn alt" id="kjP"'+(a===1?" disabled":"")+'>›</button></div>'+
    (last?'<button class="btn gold full kjdone" id="kjD">⭐ '+L2("Saya sudah baca!","I read it!")+'</button>':'');
}
function kidsAyah(){
  if(!box) return; var s=KS.s, a=KS.a, n=sMeta(s)[4], k=gIdx(s,a), last=a===n;
  msReady(); var tr=(!en() && TR.ms)?TR.ms[k]:null;
  box.innerHTML='<div class="kja1">'+kidsInner(s,a)+'</div>';
  if(!tr) needEn(function(){ var t=q("#kjTr"); if(t && KS.s===s && KS.a===a) t.textContent=window.QEN[k]||""; });
  q("#kjP").onclick=function(){ KS.a--; kidsAyah(); }; q("#kjN").onclick=function(){ KS.a++; kidsAyah(); };
  q("#kjL").onclick=function(){ playRange(k,k,1,1); };
  var d=q("#kjD"); if(d) d.onclick=function(){ var J=H.load("ihsan_jamma",{s:{}}); J.s[s]=ymd(); H.save("ihsan_jamma",J); H.toast("⭐ "+L2("Syabas! Bintang untuk ","Well done! A star for ")+sName(s)); KS.s=null; kidsList(); };
  var kb=box.querySelector(".kja1"); window.IbSwipe(kb, {can:function(s){ return s>0 ? a<n : a>1; }, go:function(s){ KS.a+=s; kidsAyah(); IbSwipe.inFrom(box.querySelector(".kja1"), s); },
    peek:function(s){ var a2=a+s; return a2>=1&&a2<=n?kidsInner(KS.s,a2):null; }, find:function(){ return box.querySelector(".kja1"); }});
}


// ================= 0.18.0: translation-only reading view and read-aloud =================
function trList2(){ var l=trList(); if(!l.length) l=[en()?"en":"ms"]; return l; }
function trReady(lg){ return lg==="en"?!!window.QEN:msReady(); }
function trPara(s, lgs){
  var a0=M.sa[s-1], n=sMeta(s)[4], lay=D.set.trl||"row", h='';
  if(lay==="row"){
    for(var a=1;a<=n;a++){ var k=a0+a-1; h+='<div class="qa qtrow" id="qa'+k+'" data-k="'+k+'"><button class="qtn" data-act="'+k+'">'+a+'</button><div>'+lgs.map(function(lg){ return '<p'+(lgs.length>1?' class="qtl"><span class="qlg">'+(lg==="ms"?"MY":"EN")+'</span>':'>')+E(trText(lg,k)||"")+'</p>'; }).join("")+'</div></div>'; }
  } else {
    lgs.forEach(function(lg){ h+='<p class="qtpara" lang="'+lg+'">'; for(var a=1;a<=n;a++){ var k=a0+a-1; h+='<span class="qa qti" id="'+(lg===lgs[0]?'qa'+k:'qb'+k)+'" data-k="'+k+'"><sup class="qtn" data-act="'+k+'">'+a+'</sup>'+E(trText(lg,k)||"")+'</span> '; } h+='</p>'; });
  }
  return h;
}
function trHead(s){ var m=sMeta(s); return '<div class="qshead"><div class="qsframe"><span>'+E(m[0])+'</span></div><small>'+s+'. '+E(m[1])+' · '+smP(s)+m[4]+' '+L2("ayat","ayat")+'</small></div>'; }
function drawTr(){
  var s=st.s, lgs=trList2(), B=q("#qBody"); if(!B) return;
  var miss=lgs.filter(function(lg){ return !trReady(lg); });
  if(miss.indexOf("ms")>=0){ B.innerHTML='<div class="card qdl"><div class="small">'+L2("Terjemahan Melayu (Abdullah Muhammad Basmeih) perlu dimuat turun sekali, kira-kira 2 MB.","The Malay translation (Abdullah Muhammad Basmeih) needs a one-time download, about 2 MB.")+'</div><button class="btn gold" id="qDlMs" style="margin-top:8px">⬇ '+L2("Muat turun","Download")+'</button></div>';
    var dl=q("#qDlMs"); dl.onclick=function(){ downloadMs(dl, function(){ if(st.v==="read") drawTr(); }); }; return; }
  if(miss.indexOf("en")>=0){ needEn(drawTr); return; }
  var lay=D.set.trl||"row", h=trHead(s)+trPara(s, lgs);
  if(lay==="cont"){ st.trEnd=s; h+='<div id="qTrMore"></div>'; }
  else h+='<div class="qendnav">'+(s<114?'<button class="btn gold full" data-open="'+M.sa[s]+'">'+L2("Surah seterusnya: ","Next surah: ")+E(sName(s+1))+' ›</button>':'<div class="card" style="text-align:center">صَدَقَ ٱللَّهُ ٱلْعَظِيمُ</div>')+'</div>';
  B.innerHTML=h; applySizes(); bindOpen();
  B.onclick=function(e){ var n=e.target.closest("[data-act]"); if(n){ ayahSheet(+n.getAttribute("data-act")); } };
  if(st.go!=null && st.quietGo){ st.go=null; st.quietGo=false; }
  if(st.go!=null){ var g=st.go; st.go=null; var el=q("#qa"+g); if(el && g!==M.sa[s-1]) setTimeout(function(){ el.scrollIntoView({block:"start"}); view().scrollTop-=60; flash(el); },30); }
  observe();
  if(lay==="cont") moreTr(); else swipeSurah(B);
}
// continuous view: the next surah is added when the end comes into view
function moreTr(){
  var sen=q("#qTrMore"); if(!sen || !window.IntersectionObserver) return;
  var ob=new IntersectionObserver(function(ents){ if(!ents[0].isIntersecting || !box || st.v!=="read" || D.set.mode!=="tr") return; var s=st.trEnd+1; if(s>114){ ob.disconnect(); sen.innerHTML='<div class="card" style="text-align:center">صَدَقَ ٱللَّهُ ٱلْعَظِيمُ</div>'; return; }
    st.trEnd=s; var d=document.createElement("div"); d.innerHTML=trHead(s)+trPara(s, trList2()); sen.parentNode.insertBefore(d, sen);
    d.querySelectorAll(".qa").forEach(function(x){ if(io) io.observe(x); }); }, {root:view(), rootMargin:"600px"});
  ob.observe(sen);
}
// read the translation aloud ayat by ayat with the phone's voice
var SAYQ={on:false, k:-1, lg:"ms", h:null};
function saySpeak(){
  if(!SAYQ.on || !box) return; var k=SAYQ.k, t=trText(SAYQ.lg,k)||"", r=fromIdx(k);
  qa(".saying").forEach(function(x){ x.classList.remove("saying"); });
  var el=q("#qa"+k); if(el){ el.classList.add("saying"); var rc=el.getBoundingClientRect(), vr=view().getBoundingClientRect(); if(rc.top<vr.top+60 || rc.bottom>vr.bottom-120) view().scrollTo({top:view().scrollTop+rc.top-vr.top-90, behavior:"smooth"}); }
  else if(r[0]!==st.s && D.set.trl!=="cont"){ st.s=r[0]; st.go=k; reader(); setTimeout(saySpeak, 400); return; }
  var txt=(r[1]===1?sName(r[0])+". ":"")+t;
  if(window.Native && H.N.speak){ H.N.speak(txt, SAYQ.lg); }
  else { try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(txt); u.lang=SAYQ.lg==="en"?"en-GB":"ms-MY"; u.onend=function(){ sayNext(); }; speechSynthesis.speak(u); }catch(e){ sayStop(); } }
}
function sayNext(){ if(!SAYQ.on) return; if(SAYQ.k>=(SAYQ.end||6235)){ sayStop(); H.toast(L2("Selesai","Done")); return; } SAYQ.k++; saySpeak(); }
function sayFrom(k, end, lg0){
  if(k==null) k=M.sa[st.s-1]; var lg=lg0||trList2()[0];
  if(!trReady(lg)){ if(lg==="en") return needEn(function(){ sayFrom(k, end, lg0); }); H.toast(L2("Muat turun terjemahan Melayu dahulu","Download the Malay translation first")); return; }
  sayStop(); SAYQ={on:true, k:k, end:end||0, lg:lg, h:function(e){ if(e && e.stopped) return; if(e && e.error){ return sayNext(); } sayNext(); }};
  H.on("ttsdone", SAYQ.h); SAYQ.eh=function(e){ if(e && e.error==="nolang"){ H.toast(L2("Suara bahasa ini tiada di telefon. Pasang di Tetapan › Teks ke pertuturan.","This language voice is missing. Install it in Settings › Text-to-speech.")); sayStop(); } }; H.on("tts", SAYQ.eh);
  try{ H.N.keepScreenOn(true,-1); }catch(e){}
  var b=q("#qSay"); if(b){ b.classList.add("on"); b.textContent="⏹ "+L2("Henti","Stop"); }
  saySpeak();
}
function sayStop(){
  if(!SAYQ.on) return; SAYQ.on=false; if(SAYQ.h) H.off("ttsdone", SAYQ.h); if(SAYQ.eh) H.off("tts", SAYQ.eh);
  try{ if(window.Native && H.N.stopSpeak) H.N.stopSpeak(); else speechSynthesis.cancel(); }catch(e){}
  try{ if(!asOn) H.N.keepScreenOn(false,-1); }catch(e){}
  qa(".saying").forEach(function(x){ x.classList.remove("saying"); });
  var b=q("#qSay"); if(b){ b.classList.remove("on"); b.textContent="🗣 "+L2("Baca","Read"); }
}

// ================= mount / public =================
function render(){
  if(!box) return;
  closePop();
  if(st.v==="read") reader(); else if(st.v==="list") listView(); else if(st.v==="hz") hzView(); else if(st.v==="grp") grpView(); else if(st.v==="map") mapView(); else if(st.v==="wq") wqView(); else { clearInterval(audioTimer); clearInterval(track._i); if(io) io.disconnect(); flush(); home(); }
}
function back(){
  closePop(); sayStop();
  if(st.v==="read" && st.from){ var f=st.from; st.from=null; stopAuto(); flush(); st.v="list"; st.list=f; render(); return true; }
  if(st.v==="read" && (st.fromV==="map"||st.fromV==="grp")){ var fv=st.fromV; st.fromV=null; stopAuto(); flush(); st.v=fv; render(); return true; }
  if(st.v==="read"){ stopAuto(); flush(); st.v="home"; render(); view().scrollTop=0; return true; }
  if(st.v==="list"){ st.v="home"; st.list=null; render(); view().scrollTop=0; return true; }
  if(st.v==="grp" && st.grp){ st.grp=null; render(); return true; }
  if(st.v==="wq"){ st.v="home"; st.tab="kamus"; render(); view().scrollTop=0; return true; }
  if(st.v==="hz"||st.v==="grp"||st.v==="map"){ st.v="home"; render(); view().scrollTop=0; return true; }
  if(st.tab!=="surah"){ st.tab="surah"; render(); return true; }
  return false;
}
function QuranView(el, helpers){
  H=helpers; box=el; if(!D) loadD();
  render();
}
QuranView.back=back;
// 0.33.0: the app's back history records and restores where the reader was (view, tab, surah or mushaf page, list, Juz Amma ayat)
QuranView.navGet=function(){ var m=D&&D.set&&D.set.mode, L=st.list;
  return {v:st.v, tab:st.tab, s:st.s, page:st.page, list:L, grp:st.grp, from:st.from, fromV:st.fromV, ks:KS.s, ka:KS.a,
    k:[st.v, st.tab, st.v==="read"?(m==="mushaf"?"p"+st.page:"s"+st.s):"", st.v==="list"&&L?(L.title||"")+(L.root!=null?L.root:""):"", st.grp?JSON.stringify(st.grp).slice(0,40):"", KS.s?KS.s+"."+KS.a:""].join("/")}; };
QuranView.navSet=function(o){ try{ closePop(); sayStop(); stopAuto(); }catch(e){} st.v=o.v; st.tab=o.tab; st.s=o.s; st.page=o.page; st.list=o.list; st.grp=o.grp; st.from=o.from; st.fromV=o.fromV; KS.s=o.ks; KS.a=o.ka||1; };
// 0.18.0 helpers for the tajwid and reading lessons (ilmu/bacaan.js)
QuranView.ensure=function(helpers){ if(!H) H=helpers; if(!D) loadD(); };
QuranView.surah=function(n, cb){ needSurah(n, function(){ cb(SUR[n]); }); };
QuranView.meta=function(){ return M; };
QuranView.idx=gIdx; QuranView.ref=fromIdx; QuranView.sname=sName;
QuranView.tj=function(segs, only){ return ayahWords(segs).map(function(w){ return w.h; }).join(" "); };
QuranView.segHtml=function(segs, rules){ var lg=M.tj; return segs.map(function(sg){ var t=typeof sg==="string"?sg:sg[0], b=typeof sg==="string"?0:sg[1], hit="";
  (rules||[]).forEach(function(r){ var i=lg.indexOf(r); if(i>=0 && (b & (1<<i))) hit=hit||r; }); return hit?'<span class="tj-'+hit+' tjhl">'+E(t)+'</span>':E(t); }).join(""); };
QuranView.has=function(segs, rule){ var i=M.tj.indexOf(rule); return segs.some(function(sg){ return typeof sg!=="string" && (sg[1] & (1<<i)); }); };
QuranView.play=function(k, helpers){ QuranView.ensure(helpers); playRange(k, k, 1, 1); };

QuranView.kids=function(el, helpers){ H=helpers; box=el; if(!D) loadD(); if(KS.s) needSurah(KS.s, kidsAyah); else kidsList(); };
QuranView.kidsBack=function(){ if(KS.s && box){ KS.s=null; kidsList(); return true; } return false; };
QuranView.stop=function(){ if(!box) return; sayStop(); if(st.v==="read" && D && D.set.mode!=="mushaf" && document.body.contains(box)){ try{ st.go=curIdx(); }catch(e){} } stopAuto(); closePop(); clearInterval(audioTimer); clearInterval(track._i); clearTimeout(pageTimer); if(io) io.disconnect(); if(D) flush(); box=null; };
QuranView.open=function(k, mode){ st.v="read"; var r=fromIdx(k); st.s=r[0]; st.go=k; st.page=pageOf(k); if(mode){ if(!D) loadD(); D.set.mode=mode; saveD(); } };
QuranView.openPlaying=function(){ var s=pState(); if(/^q:/.test(s.key||"")){ var p=s.key.split(":"); QuranView.open(gIdx(+p[1], Math.max(1,+p[2]))); } };
QuranView.lastRef=function(){ try{ var x=JSON.parse(localStorage.getItem(KEY)||"null"); if(x && x.last) return refOf(x.last.k); }catch(e){} return null; };
window.QuranView=QuranView;
})();
