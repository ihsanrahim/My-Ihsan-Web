/* My Ihsan 0.37.0: Senaman (Kalendar › Senaman), Farah 2026-11-07.
   Six pages that swipe sideways: Badan (3D figure, tap body parts to set the focus, 3 levels) · Gerakan (50 simple cardio moves) ·
   Rutin (ready-made routines, my own routines, a free interval timer) · Pelan (a plan made from the focus, level, days and minutes) ·
   Jejak (calendar tracker, calories, streaks, badges, manual activities) · Kesihatan (BMI, calories, water, heart-rate zones, body
   measures, weight trend, blood pressure, blood sugar, sleep). Every workout runs in the player with a work timer and rest breaks.
   All offline. Storage: ihsan_fit; reminders for planned days go to ihsan_fitrem (read by app.js buildExtras). */
(function(){
"use strict";
var H, L2, E, el0=null, page="body", SHOT=false, fig=null, mvF={p:"", l:0, lo:false}, trM=null, rtTab="ready";
var PAGES=[["body","🧍","Badan","Body"],["moves","🤸","Gerakan","Moves"],["rutin","⏲","Rutin","Routines"],["plan","🗒","Pelan","Plan"],["track","👟","Jejak","Tracker"],["health","❤️","Kesihatan","Health"]];
var D=null;
function DEF(){ return {sex:"m", col:{top:9,pants:9,hj:9,sk:1,cap:true}, lvl:1, foc:[], by:null, h:null, w:null, act:1.375, goal:"keep", plan:null, log:[], wl:{}, my:[], water:{}, sl:{}, bp:[], gl:[], hm:{}, rem:{on:true, hm:"17:30"}, voice:true, qmin:10, mvT:{w:30,r:15,s:3}}; }
function ld(){ D=H.load("ihsan_fit",null); var d=DEF(); if(!D) D=d; for(var k in d) if(D[k]===undefined) D[k]=d[k];
  // 0.5.22: the outfit starts all white with a white kopiah (once for everyone); after that every choice is kept, also when switching gender
  if(!D.colV){ D.colV=2; D.col=d.col; H.save("ihsan_fit", D); } }
function sv(){ H.save("ihsan_fit",D); }
function en(){ return H.en(); }
function nm(x){ return en()?x.en:x.ms; }
function ymd(d){ d=d||new Date(); return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); }
function pYmd(s){ var p=s.split("-"); return new Date(+p[0],+p[1]-1,+p[2]); }
function addD(d,n){ var x=new Date(d); x.setDate(x.getDate()+n); return x; }
function kg(){ return D.w||60; }
function age(){ return D.by?Math.max(10,new Date().getFullYear()-D.by):null; }
function kcal(met, sec){ return met*3.5*kg()/200*sec/60; }
function r1(x){ return Math.round(x*10)/10; }
function mmss(s){ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+":"+("0"+(s%60)).slice(-2); }
function lvl(n){ return FIT_LEVELS[(n||1)-1]||FIT_LEVELS[0]; }
var MV={}, ALLM=[];
function mk(a){ return {id:a[0], ms:a[1], en:a[2], p:a[3], l:a[4], met:a[5], a:a[6], lo:!!a[7], hms:a[8], hen:a[9], prop:a[10]||""}; }
function initMV(){ if(ALLM.length) return; FIT_MOVES.forEach(function(a){ var m=mk(a); MV[m.id]=m; ALLM.push(m); }); FIT_WARM.concat(FIT_COOL).forEach(function(a){ MV[a[0]]=mk(a); });
  MV.free={id:"free", ms:"Gerak", en:"Work", p:[], l:1, met:6, a:"jog", lo:false, hms:"Buat senaman pilihan anda.", hen:"Do the exercise of your choice."}; }
function partNm(k){ var p=FIT_PARTS.filter(function(x){ return x[0]===k; })[0]; return p?(p[1]+" "+L2(p[2],p[3])):k; }
// 0.5.20: only the filled dots (Beginner ●, Intermediate ●●, Advanced ●●●)
function dots(n){ return '<span class="fdots">'+[1,2,3].filter(function(i){ return i<=n; }).map(function(){ return '<i class="on"></i>'; }).join("")+'</span>'; }
function seed(n){ var s=n>>>0; return function(){ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
function dayNo(d){ return Math.floor(pYmd(ymd(d)).getTime()/864e5); }

// ---------- sessions ----------
// a session: {n, lvl, work, rest, rounds, rr, warm, cool, mv:[ids], pl:ymd?}
function pickMoves(foc, lv, n, sd){
  var r=seed(sd||1), all=!foc.length || foc.indexOf("all")>=0;
  var c=ALLM.filter(function(m){ return m.l<=lv; }).map(function(m){ var ov=all?1:m.p.filter(function(p){ return foc.indexOf(p)>=0; }).length;
    var sc=ov*3+(m.l===lv?1.2:0)+(lv>1 && m.met>=7?0.8:0)+(lv===1 && m.lo?0.8:0)+r()*1.6; return [m,sc,ov]; });
  if(!all) c=c.filter(function(x){ return x[2]>0 || x[0].met>=6; });
  c.sort(function(a,b){ return b[1]-a[1]; });
  var out=c.slice(0,n).map(function(x){ return x[0].id; });
  // keep the heart rate up: at least one whole-body cardio move
  if(!out.some(function(id){ return MV[id].met>=6 || MV[id].l>=2; })){ var hc=ALLM.filter(function(m){ return m.l<=lv && m.met>=4.5 && out.indexOf(m.id)<0; })[0]; if(hc) out[out.length-1]=hc.id; }
  return out;
}
function autoSession(foc, lv, mins, sd, wk){
  var L=lvl(lv), work=L.work+Math.min(15,5*(wk||0)), rest=Math.max(10,L.rest-(lv>1?5*(wk||0):0)), rounds=L.rounds, rr=[45,30,20][lv-1];
  var main=Math.max(120, mins*60-210), n=Math.round(main/(rounds*(work+rest)));
  while(n<5 && rounds>1){ rounds--; n=Math.round(main/(rounds*(work+rest))); }
  if(n<3){ rounds=Math.max(1,Math.floor(main/(3*(work+rest)))); n=3; }
  n=Math.min(10,n);
  return {n:L2("Senaman ","Workout ")+mins+L2(" minit"," min"), lvl:lv, work:work, rest:rest, rounds:rounds, rr:rr, warm:true, cool:true, mv:pickMoves(foc, lv, n, sd)};
}
function routineOf(r){ return {n:L2(r[2],r[3]), ic:r[1], lvl:r[6], work:r[7], rest:r[8], rounds:r[9], rr:r[10], warm:!!r[11], cool:!!r[12], mv:r[13].slice(), id:r[0]}; }
function steps(s){
  var out=[], i, r;
  out.push({k:"ready", id:s.mv[0], sec:8});
  if(s.warm) FIT_WARM.forEach(function(a){ out.push({k:"warm", id:a[0], sec:30}); });
  for(r=1;r<=s.rounds;r++){
    for(i=0;i<s.mv.length;i++){
      out.push({k:"work", id:s.mv[i], sec:(s.wk&&s.wk[i])||s.work, r:r, i:i});
      var last=i===s.mv.length-1;
      if(!last && s.rest>0) out.push({k:"rest", id:s.mv[i+1], sec:s.rest, r:r});
      if(last && r<s.rounds && (s.rr||s.rest)>0) out.push({k:"rr", id:s.mv[0], sec:s.rr||s.rest, r:r});
    }
  }
  if(s.cool) FIT_COOL.forEach(function(a){ out.push({k:"cool", id:a[0], sec:30}); });
  return out;
}
function est(s){ var st=steps(s), t=0, k=0; st.forEach(function(x){ if(x.k==="ready") return; t+=x.sec; var m=MV[x.id]; k+=kcal(x.k==="work"?m.met*lvl(s.lvl).metF:x.k==="warm"||x.k==="cool"?2.8:1.8, x.sec); }); return {sec:t, kcal:k}; }

// ---------- plan ----------
function planOn(d){ var p=D.plan; if(!p) return null; var k=ymd(d); if(k<p.st) return null; var w=Math.floor((pYmd(k)-pYmd(p.st))/(7*864e5)); if(w>=p.wk) return null;
  if(p.days.indexOf(d.getDay())<0) return null; var s=autoSession(p.f, p.l, p.m, dayNo(d)*7+p.l, w); s.pl=k; s.n=L2("Pelan: minggu ","Plan: week ")+(w+1); return s; }
function doneOn(k){ return D.log.filter(function(x){ return x.d===k; }); }
function planDone(k){ return D.log.some(function(x){ return x.pl===k; }); }
function remSync(){
  var out=[];
  if(D.plan && D.rem && D.rem.on){ var hm=(D.rem.hm||"17:30").split(":");
    for(var i=0;i<12;i++){ var d=addD(new Date(),i), s=planOn(d), k=ymd(d); if(!s || planDone(k)) continue; var t=new Date(d); t.setHours(+hm[0],+hm[1],0,0); if(t.getTime()<=Date.now()) continue;
      var e=est(s); out.push({t:t.getTime(), k:"fit"+k, ti:"🏃 "+L2("Masa bersenam","Time to exercise"), b:s.mv.length+L2(" gerakan · lebih kurang "," moves · about ")+Math.round(e.sec/60)+L2(" minit"," min")}); } }
  H.save("ihsan_fitrem",{list:out}); try{ H.resched(); }catch(e){}
}

// ---------- stats ----------
function stats(){
  var days={}, n=0, kc=0, mn=0; D.log.forEach(function(x){ days[x.d]=1; n++; kc+=x.kcal||0; mn+=x.min||0; });
  var ks=Object.keys(days).sort(), best=0, run=0, prev=null; ks.forEach(function(k){ var d=pYmd(k); run=(prev && (d-prev)/864e5===1)?run+1:1; prev=d; if(run>best) best=run; });
  var cur=0, d=new Date(); if(!days[ymd(d)]) d=addD(d,-1); while(days[ymd(d)]){ cur++; d=addD(d,-1); }
  var wk={}; D.log.forEach(function(x){ var dd=pYmd(x.d), mon=addD(dd,-((dd.getDay()+6)%7)); var k=ymd(mon); wk[k]=(wk[k]||0)+(x.min||0); });
  var bw=0; for(var k in wk) if(wk[k]>bw) bw=wk[k];
  return {n:n, kcal:kc, min:mn, best:best, cur:cur, bestWeek:bw};
}
function weekMin(){ var t=new Date(), mon=ymd(addD(t,-((t.getDay()+6)%7))); var m=0, k=0, n=0; D.log.forEach(function(x){ if(x.d>=mon){ m+=x.min||0; k+=x.kcal||0; n++; } }); return {min:m, kcal:k, n:n}; }
function dayTot(k){ var m=0, c=0; doneOn(k).forEach(function(x){ m+=x.min||0; c+=x.kcal||0; }); return {min:m, kcal:c}; }
function addLog(o){ o.id=Date.now().toString(36)+Math.random().toString(36).slice(2,5); o.d=o.d||ymd(); o.t=o.t||Date.now(); D.log.push(o); if(D.log.length>3000) D.log=D.log.slice(-3000); sv(); remSync(); }

// ---------- page shell ----------
// (the Cardio / Travel banners are the Home widget "Fitness" in app.js)
function view(el, h){
  H=h; L2=h.L2x; E=h.esc; initMV(); ld(); el0=el;
  if(window.__fitPg){ page=window.__fitPg; window.__fitPg=null; D.mode="cardio"; }   // 0.6.51: opened from the left bar
  if(!document.getElementById("fitCss")){ var lk=document.createElement("link"); lk.id="fitCss"; lk.rel="stylesheet"; lk.href="fit/fit.css"; document.head.appendChild(lk); }
  // 0.5.20: two modes, Cardio (the six workout pages, level 4) and Travel (fit/run.js) with 🏃 Run · 🚴 Ride as its level 4.
  // The mode banners live on Home as the resizable "Fitness" widget.
  if(D.mode==="run") D.mode="travel"; if(D.mode==="sport") D.mode="cardio";   // 0.5.98: Sports moved to Learn › Explore
  var run=D.mode==="travel", tt=D.tty==="ride"?"ride":"run"; var spm=D.mode==="sport", hfm=D.mode==="huruf", fdm=D.mode==="find";   // 0.6.26 (owner): Find (masjid, food, graves, silent mode) lives here, left of Letters
  if(!hfm && window.HurufView) HurufView.stop();
  el.innerHTML='<div id="ftBody"></div><div class="dock fitmodes"><div class="grp3'+(H.findView?" g4":"")+'">'+[["cardio","🏋️",L2("Kardio","Cardio")],["travel","🧭",L2("Perjalanan","Travel")]].concat(H.findView?[["find","📍",L2("Cari","Find")]]:[]).concat([["huruf","🔤",L2("Huruf","Letters")]]).map(function(m){ return '<button class="chip'+((run?"travel":spm?"sport":hfm?"huruf":fdm?"find":"cardio")===m[0]?" on":"")+'" data-fmode="'+m[0]+'">'+m[1]+' '+m[2]+'</button>'; }).join("")+'</div></div>'+
    (run?'<div class="dock fitdock"><div class="grp3 g2">'+[["run","🏃",L2("Lari","Run")],["ride","🚴",L2("Kayuh","Ride")]].map(function(m){ return '<button class="chip'+(tt===m[0]?" on":"")+'" data-ftt="'+m[0]+'">'+m[1]+' '+m[2]+'</button>'; }).join("")+'</div></div>'
      :(spm||hfm||fdm)?'':'<div class="dock fitdock"><div class="fitg6" style="grid-template-columns:repeat('+(window.l3Keep?l3Keep(PAGES,"cal/senaman",page):PAGES).length+',minmax(0,1fr))">'+(window.l3Keep?l3Keep(PAGES,"cal/senaman",page):PAGES).map(function(p){ return '<button class="chip'+(page===p[0]?" on":"")+'" data-fp="'+p[0]+'"><span>'+p[1]+'</span>'+L2(p[2],p[3])+'</button>'; }).join("")+'</div></div>');
  el.querySelectorAll("[data-fmode]").forEach(function(b){ b.onclick=function(){ if(window.FitRun && FitRun.active() && b.getAttribute("data-fmode")!=="travel"){ H.toast(L2("Rakaman sedang berjalan","A recording is in progress")); } D.mode=b.getAttribute("data-fmode"); sv(); draw(); document.getElementById("view").scrollTop=0; }; });
  el.querySelectorAll("[data-ftt]").forEach(function(b){ b.onclick=function(){ if(window.FitRun && FitRun.active()){ H.toast(L2("Tamatkan rakaman dahulu","Finish the recording first")); return; } D.tty=b.getAttribute("data-ftt"); sv(); draw(); document.getElementById("view").scrollTop=0; }; });
  var body=el.querySelector("#ftBody");
  if(fdm){ if(H.findView) try{ H.findView(body); }catch(e){ console.error(e); } try{ H.dockFix(); }catch(e){} return; }
  // Sports (sport/): rules guides with 3D fields, quizzes and mini games; loads on first use
  if(spm){ var sgo=function(){ if(document.body.contains(body)) try{ SportView.view(body, H); }catch(e){ console.error(e); body.innerHTML='<div class="card">'+L2("Gagal dibuka","Could not open")+'</div>'; } try{ H.dockFix(); }catch(e){} };
    if(window.SportView) sgo(); else { body.innerHTML='<div class="card mut">'+L2("Memuatkan…","Loading…")+'</div>'; H.loadJs(["sport/sport_engine.js"], sgo, function(){ body.innerHTML='<div class="card">'+L2("Gagal dimuatkan","Could not load")+'</div>'; }); }
    try{ H.dockFix(); }catch(e){} return; }
  // Gerak Huruf (huruf/): camera letter-shape game for children; loads on first use
  if(hfm){ var hgo=function(){ if(document.body.contains(body)) try{ HurufView.view(body, H); }catch(e){ console.error(e); body.innerHTML='<div class="card">'+L2("Gagal dibuka","Could not open")+'</div>'; } try{ H.dockFix(); }catch(e){} };
    if(window.HurufView) hgo(); else { body.innerHTML='<div class="card mut">'+L2("Memuatkan…","Loading…")+'</div>'; H.loadJs(["huruf/huruf_data.js","huruf/huruf.js"], hgo, function(){ body.innerHTML='<div class="card">'+L2("Gagal dimuatkan","Could not load")+'</div>'; }); }
    try{ H.dockFix(); }catch(e){} return; }
  if(run){ var rgo=function(){ if(document.body.contains(body)) FitRun.view(body, H, {addLog:addLog, kg:function(){ return D.w||65; }, type:function(){ return D.tty==="ride"?"ride":"run"; }, redraw:function(){ ld(); draw(); }}); try{ H.dockFix(); }catch(e){} };
    if(window.FitRun) rgo(); else { body.innerHTML='<div class="card mut">'+L2("Memuatkan…","Loading…")+'</div>'; H.loadJs(["fit/run.js"], rgo, function(){ body.innerHTML='<div class="card">'+L2("Gagal dimuatkan","Could not load")+'</div>'; }); }
    try{ H.dockFix(); }catch(e){} return; }
  fn(page)(body);
  el.querySelectorAll("[data-fp]").forEach(function(b){ b.onclick=function(){ page=b.getAttribute("data-fp"); draw(); document.getElementById("view").scrollTop=0; }; });
  try{ H.dockFix(); }catch(e){}
  if(window.IbSwipe && window.ibWrap){
    var ks=(window.l3Keep?l3Keep(PAGES,"cal/senaman",page):PAGES).map(function(x){ return x[0]; }), nb=function(s){ return ks[ks.indexOf(page)+(s<0?1:-1)]; };
    var pg=window.ibWrap(body);
    window.IbSwipe(pg, {can:function(s){ return !!nb(s); }, go:function(s){ page=nb(s); draw(); },
      find:function(){ return document.querySelector("#ftBody .ibpg"); },
      skip:function(){ var a=document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName); },
      peek:function(s){ var k=nb(s), p0=page, b=window.IbSwipe.shot(function(){ page=k; SHOT=true; }, function(x){ fn(k)(x); }, function(){ page=p0; SHOT=false; });
        if(!b) return null; var w=document.createElement("div"); w.className="ibpg"; while(b.firstChild) w.appendChild(b.firstChild); return w; }});
  }
}
function draw(){ if(!el0 || !document.body.contains(el0)) return; var v=document.getElementById("view"), y=v.scrollTop; view(el0, H); v.scrollTop=y; }
function fn(p){ return {body:pBody, moves:pMoves, rutin:pRutin, plan:pPlan, track:pTrack, health:pHealth}[p]||pBody; }

// ---------- 1. Badan ----------
function pBody(box){
  var lv=D.lvl, foc=D.foc, all=!foc.length||foc.indexOf("all")>=0;
  var n=ALLM.filter(function(m){ return m.l<=lv && (all || m.p.some(function(p){ return foc.indexOf(p)>=0; })); }).length;
  var fem=D.sex==="f", ddo=window.__fitDD||"";
  // 0.2.0: colour choices are separate dropdowns beside the gender buttons (top, trousers, hijab, head for men)
  var ddb=function(key, lb, dot){ return '<button class="chip fddb'+(ddo===key?" on":"")+'" data-fdd="'+key+'">'+(dot?'<i style="background:'+dot+'"></i>':'')+lb+' ▾</button>'; };
  var curOf=function(key, list, def){ var c=D.col[key]!=null?D.col[key]:def; return list[c]||list[0]; };
  var ddp=function(key, list, def){ if(ddo!==key) return ''; var cur=D.col[key]!=null?D.col[key]:def; return '<div class="fddp"><span class="fsw">'+list.map(function(c,i){ return '<i data-fcol="'+key+'" data-fci="'+i+'" class="'+(cur===i?"on":"")+'" style="background:'+c+'"></i>'; }).join("")+'</span></div>'; };
  var topL=fem?L2("Parka","Parka"):L2("Baju","Top");
  // 0.5.20: three dropdowns above the preview (gender, colours, body parts; parts can be one or several),
  // a 20% smaller preview, then Start now, Quick workout and Level under it
  var partsLb=all?"🧍 "+L2("Seluruh badan","Whole body"):(function(){ var f=FIT_PARTS.filter(function(p){ return foc.indexOf(p[0])>=0; }); return f[0][1]+" "+L2(f[0][2],f[0][3])+(f.length>1?" +"+(f.length-1):""); })();
  var dd3=function(key, lb){ return '<button class="chip fddb'+(ddo===key?" on":"")+'" data-fdd="'+key+'">'+lb+' <span class="fdc">▾</span></button>'; };
  var swRow=function(lb, key, list, def){ var cur=D.col[key]!=null?D.col[key]:def; return '<div class="fswr"><span class="mut small">'+lb+'</span><span class="fsw">'+list.map(function(c,i){ return '<i data-fcol="'+key+'" data-fci="'+i+'" class="'+(cur===i?"on":"")+'" style="background:'+c+'"></i>'; }).join("")+'</span></div>'; };
  var panel='';
  if(ddo==="sex") panel='<div class="fddp"><span class="seg">'+[["m","👨","Lelaki","Male"],["f","🧕","Perempuan","Female"]].map(function(x){ return '<button class="'+(D.sex===x[0]?"on":"")+'" data-fsex="'+x[0]+'">'+x[1]+' '+L2(x[2],x[3])+'</button>'; }).join("")+'</span></div>';
  if(ddo==="col") panel='<div class="fddp">'+swRow(topL,"top",Fit3D.COAT,9)+swRow(L2("Seluar","Trousers"),"pants",Fit3D.PANTS,9)+
    (fem?swRow(L2("Tudung","Hijab"),"hj",Fit3D.HIJ,9):'<div class="fswr"><span class="mut small">'+L2("Kepala","Head")+'</span><span class="seg">'+[[0,"💇",L2("Rambut","Hair")],[1,"🧢",L2("Kopiah putih","White kopiah")]].map(function(x){ return '<button class="'+((D.col.cap?1:0)===x[0]?"on":"")+'" data-fcap="'+x[0]+'">'+x[1]+' '+x[2]+'</button>'; }).join("")+'</span></div>')+'</div>';
  if(ddo==="parts") panel='<div class="fddp"><div class="mut tiny" style="margin:0 0 6px">'+L2("Pilih satu atau beberapa","Pick one or several")+'</div><div class="chips fparts"><button class="chip'+(all?" on":"")+'" data-fpt="all">🧍 '+L2("Seluruh badan","Whole body")+'</button>'+FIT_PARTS.map(function(p){ return '<button class="chip'+(!all&&foc.indexOf(p[0])>=0?" on":"")+'" data-fpt="'+p[0]+'">'+p[1]+' '+L2(p[2],p[3])+'</button>'; }).join("")+'</div></div>';
  var h='<div class="card fbodyc"><div class="fdd3">'+dd3("sex",(fem?"🧕 ":"👨 ")+L2(fem?"Perempuan":"Lelaki",fem?"Female":"Male"))+dd3("col",'<i class="fdot" style="background:'+curOf("top",Fit3D.COAT,9)+'"></i>'+L2("Warna","Colours"))+dd3("parts",'<span class="fpl">'+partsLb+'</span>')+'</div>'+panel+
    '<div class="fbox fbox8 noswipe" id="fBox">'+(SHOT?'<div class="fph">🧍</div>':'')+'<div class="fhint">'+L2("Ketik bahagian badan untuk fokus · leret untuk pusing","Tap a body part to focus · drag to turn")+'</div><button class="fturn" id="fTurn">⟲</button></div>';
  var qs=autoSession(foc, lv, D.qmin, dayNo(new Date())), qe=est(qs);
  h+='<button class="btn gold g3d full" id="fGo">▶ '+L2("Mula sekarang","Start now")+'</button>'+
    '<div class="fqw"><div class="fqh"><b>⚡ '+L2("Senaman pantas","Quick workout")+'</b><button class="chip" id="fPlanMk">📋 '+L2("Buat pelan","Make a plan")+'</button></div><div class="chips fqmin">'+[5,10,15,20,30,45].map(function(m){ return '<button class="chip'+(D.qmin===m?" on":"")+'" data-fqm="'+m+'">'+m+' min</button>'; }).join("")+'</div>'+
    '<div class="mut small fqs">'+qs.mv.length+L2(" gerakan × "," moves × ")+qs.rounds+L2(" pusingan · "," rounds · ")+qs.work+"s / "+qs.rest+L2("s rehat · ≈ ","s rest · ≈ ")+Math.round(qe.kcal)+' kcal</div></div>'+
    '<div class="fqw"><div class="fqh"><b>📶 '+L2("Tahap","Level")+'</b></div><div class="grp3">'+FIT_LEVELS.map(function(L){ return '<button class="chip'+(lv===L.id?" on":"")+'" data-flv="'+L.id+'">'+dots(L.id)+' '+nm(L)+'</button>'; }).join("")+'</div><div class="mut small">'+E(L2(lvl(lv).dms,lvl(lv).den))+'</div>'+
    '<div class="fcount"><b>'+n+'</b> '+L2("gerakan sesuai untuk fokus dan tahap ini","moves fit this focus and level")+'</div></div></div>';
  h+=todayCard();
  box.innerHTML=h;
  if(SHOT) return;
  var fb=box.querySelector("#fBox");
  setTimeout(function(){ if(!document.body.contains(fb)) return; fig=Fit3D.mount(fb, {sex:D.sex, col:D.col, move:"idle", sel:all?[]:foc, yaw:D.yaw!=null?D.yaw:0.35, dist:4.3,
    onYaw:function(y){ D.yaw=y; sv(); },
    onPick:function(p){ if(!p) return; togglePart(p==="all"?"all":p); }}); }, 30);
  box.querySelector("#fTurn").onclick=function(){ if(fig){ var y=fig.yaw(); y=Math.abs(((y%(2*Math.PI))+2*Math.PI)%(2*Math.PI)-Math.PI)<1.2?0.35:Math.PI+0.35; fig.setYaw(y); D.yaw=y; sv(); } };
  box.querySelectorAll("[data-fsex]").forEach(function(b){ b.onclick=function(){ D.sex=b.getAttribute("data-fsex"); sv(); window.__fitDD=""; draw(); }; });
  box.querySelectorAll("[data-fcol]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-fcol"); D.col[k]=+b.getAttribute("data-fci"); sv(); window.__fitDD=""; if(fig) fig.setCol(D.col); draw(); }; });
  box.querySelectorAll("[data-fdd]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-fdd"); window.__fitDD=(window.__fitDD===k?"":k); draw(); }; });
  box.querySelectorAll("[data-fcap]").forEach(function(b){ b.onclick=function(){ D.col.cap=b.getAttribute("data-fcap")==="1"; sv(); window.__fitDD=""; if(fig) fig.setCol(D.col); draw(); }; });
  box.querySelectorAll("[data-fpt]").forEach(function(b){ b.onclick=function(){ togglePart(b.getAttribute("data-fpt")); }; });
  box.querySelectorAll("[data-flv]").forEach(function(b){ b.onclick=function(){ D.lvl=+b.getAttribute("data-flv"); sv(); draw(); }; });
  box.querySelectorAll("[data-fqm]").forEach(function(b){ b.onclick=function(){ D.qmin=+b.getAttribute("data-fqm"); sv(); draw(); }; });
  box.querySelector("#fGo").onclick=function(){ play(autoSession(D.foc, D.lvl, D.qmin, dayNo(new Date()))); };
  box.querySelector("#fPlanMk").onclick=function(){ page="plan"; planEdit=true; draw(); document.getElementById("view").scrollTop=0; };
  bindToday(box);
}
function togglePart(p){
  if(p==="all") D.foc=[]; else { var i=D.foc.indexOf(p); if(i>=0) D.foc.splice(i,1); else D.foc.push(p); if(D.foc.length===FIT_PARTS.length) D.foc=[]; }
  sv(); H.N.vibrate && H.N.vibrate(25);
  var b=el0.querySelector("#ftBody"); if(!b) return; var y=document.getElementById("view").scrollTop;
  // redraw the cards but keep the live 3D figure
  var all=!D.foc.length; if(fig) fig.setSel(all?[]:D.foc);
  b.querySelectorAll("[data-fpt]").forEach(function(x){ var k=x.getAttribute("data-fpt"); x.classList.toggle("on", k==="all"?all:(!all && D.foc.indexOf(k)>=0)); });
  var n=ALLM.filter(function(m){ return m.l<=D.lvl && (all || m.p.some(function(q){ return D.foc.indexOf(q)>=0; })); }).length, c=b.querySelector(".fcount b"); if(c) c.textContent=n;
  var pl=b.querySelector(".fpl"); if(pl){ var f=FIT_PARTS.filter(function(p){ return D.foc.indexOf(p[0])>=0; }); pl.textContent=all?"🧍 "+L2("Seluruh badan","Whole body"):f[0][1]+" "+L2(f[0][2],f[0][3])+(f.length>1?" +"+(f.length-1):""); }
  var qs=autoSession(D.foc, D.lvl, D.qmin, dayNo(new Date())), qe=est(qs), mt=b.querySelector("#fGo"); if(mt){ var sm=b.querySelector(".fqs"); if(sm) sm.textContent=qs.mv.length+L2(" gerakan × "," moves × ")+qs.rounds+L2(" pusingan · "," rounds · ")+qs.work+"s / "+qs.rest+L2("s rehat · ≈ ","s rest · ≈ ")+Math.round(qe.kcal)+" kcal"; }
  document.getElementById("view").scrollTop=y;
}
function todayCard(){
  var t=ymd(), dt=dayTot(t), s=stats(), wk=weekMin(), ps=planOn(new Date());
  var h='<div class="card"><h3>📅 '+L2("Hari ini","Today")+'</h3><div class="urow3"><div><b>'+Math.round(dt.kcal)+'</b><span class="mut tiny">kcal</span></div><div><b>'+Math.round(dt.min)+'</b><span class="mut tiny">'+L2("minit","minutes")+'</span></div><div><b>🔥 '+s.cur+'</b><span class="mut tiny">'+L2("hari berturut","day streak")+'</span></div></div>'+
    '<div class="fwk"><div class="ubar1"><i style="width:'+Math.min(100,Math.round(wk.min*100/150))+'%"></i></div><span class="mut tiny">'+Math.round(wk.min)+' / 150 '+L2("minit minggu ini (saranan WHO)","minutes this week (WHO advice)")+'</span></div>';
  if(ps && !planDone(t)) h+='<button class="btn gold full g3d" id="fToday" style="margin-top:8px">▶ '+L2("Sesi pelan hari ini","Today\'s plan session")+' · '+ps.mv.length+L2(" gerakan"," moves")+'</button>';
  else if(ps) h+='<div class="fok">✅ '+L2("Sesi pelan hari ini selesai. Alhamdulillah!","Today\'s plan session is done. Alhamdulillah!")+'</div>';
  return h+'</div>'; }
function bindToday(box){ var b=box.querySelector("#fToday"); if(b) b.onclick=function(){ var s=planOn(new Date()); if(s) play(s); }; }

// ---------- 2. Gerakan ----------
function pMoves(box){
  var L=ALLM.filter(function(m){ return (!mvF.p || m.p.indexOf(mvF.p)>=0) && (!mvF.l || m.l===mvF.l) && (!mvF.lo || m.lo); });
  var h='<div class="fsticky"><div class="chips"><button class="chip'+(!mvF.p?" on":"")+'" data-mfp="">'+L2("Semua","All")+' ('+ALLM.length+')</button>'+FIT_PARTS.map(function(p){ return '<button class="chip'+(mvF.p===p[0]?" on":"")+'" data-mfp="'+p[0]+'">'+p[1]+' '+L2(p[2],p[3])+'</button>'; }).join("")+'</div>'+
    '<div class="chips"><button class="chip'+(!mvF.l?" on":"")+'" data-mfl="0">'+L2("Semua tahap","All levels")+'</button>'+FIT_LEVELS.map(function(x){ return '<button class="chip'+(mvF.l===x.id?" on":"")+'" data-mfl="'+x.id+'">'+dots(x.id)+' '+nm(x)+'</button>'; }).join("")+'<button class="chip'+(mvF.lo?" on":"")+'" data-mlo="1">🤫 '+L2("Impak rendah","Low impact")+'</button></div></div>';
  h+='<div class="mut tiny" style="margin:4px 2px">'+L.length+L2(" gerakan · ketik untuk lihat 3D dan mula pemasa"," moves · tap to see it in 3D and start a timer")+'</div><div class="fmvg">'+L.map(function(m){
    return '<button class="fmv g3d" data-mv="'+m.id+'"><b>'+E(nm(m))+'</b><span class="fmvp">'+m.p.map(function(p){ return (FIT_PARTS.filter(function(x){ return x[0]===p; })[0]||["","•"])[1]; }).join("")+'</span><span class="fmvm">'+dots(m.l)+'<small>≈'+r1(kcal(m.met,60))+' kcal/min</small></span>'+(m.lo?'<em>🤫</em>':'')+'</button>'; }).join("")+'</div>';
  box.innerHTML=h;
  box.querySelectorAll("[data-mfp]").forEach(function(b){ b.onclick=function(){ mvF.p=b.getAttribute("data-mfp"); draw(); }; });
  box.querySelectorAll("[data-mfl]").forEach(function(b){ b.onclick=function(){ mvF.l=+b.getAttribute("data-mfl"); draw(); }; });
  box.querySelectorAll("[data-mlo]").forEach(function(b){ b.onclick=function(){ mvF.lo=!mvF.lo; draw(); }; });
  box.querySelectorAll("[data-mv]").forEach(function(b){ b.onclick=function(){ moveSheet(b.getAttribute("data-mv")); }; });
}
function moveSheet(id){
  var m=MV[id], T=D.mvT;
  var body='<div class="fbox fsm" id="fmBox"></div><div class="fmeta">'+dots(m.l)+' '+nm(lvl(m.l))+' · MET '+m.met+' · ≈'+r1(kcal(m.met,60))+' kcal/min'+(m.lo?' · 🤫 '+L2("impak rendah","low impact"):'')+'</div>'+
    '<div class="chips">'+m.p.map(function(p){ return '<span class="badge">'+partNm(p)+'</span>'; }).join("")+'</div><p class="small" style="line-height:1.5">'+E(L2(m.hms,m.hen))+'</p>'+
    '<div class="fset">'+tset("w",L2("Gerak","Work"),[20,30,40,45,60,90],T.w,"s")+tset("r",L2("Rehat","Rest"),[0,10,15,20,30,45,60],T.r,"s")+tset("s",L2("Set","Sets"),[1,2,3,4,5,6,8],T.s,"")+'</div>'+
    '<div class="btns" style="margin-top:10px"><button class="btn gold g3d" id="fmGo">▶ '+L2("Mula pemasa","Start timer")+'</button><button class="btn alt g3d" id="fmAdd">＋ '+L2("Ke rutin saya","To my routine")+'</button></div>';
  var ov=H.showSheet(E(nm(m)), body);
  var bx=ov.querySelector("#fmBox"); setTimeout(function(){ if(document.body.contains(bx)) Fit3D.mount(bx,{sex:D.sex, col:D.col, move:id, autoYaw:1, yaw:Fit3D.moveYaw(id), tempo:lvl(m.l).tempo, dist:4.4}); },40);
  bindSet(ov, T, function(){ sv(); });
  ov.querySelector("#fmGo").onclick=function(){ var mv=[]; for(var i=0;i<T.s;i++) mv.push(id); play({n:nm(m), lvl:m.l, work:T.w, rest:T.r, rounds:1, rr:0, warm:false, cool:false, mv:mv}); };
  ov.querySelector("#fmAdd").onclick=function(){ addToMine(id); };
}
function tset(k, lb, opts, cur, u){ return '<div class="ftset"><span class="mut small">'+lb+'</span><div class="chips">'+opts.map(function(v){ return '<button class="chip'+(cur===v?" on":"")+'" data-ts="'+k+'" data-tv="'+v+'">'+v+u+'</button>'; }).join("")+
  '<input type="number" class="ftnum" data-tn="'+k+'" value="'+(opts.indexOf(cur)<0?cur:"")+'" placeholder="'+L2("lain","other")+'" min="0" max="900"></div></div>'; }
function bindSet(root, obj, cb){
  root.querySelectorAll("[data-ts]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-ts"); obj[k]=+b.getAttribute("data-tv"); root.querySelectorAll('[data-ts="'+k+'"]').forEach(function(x){ x.classList.toggle("on", x===b); }); var n=root.querySelector('[data-tn="'+k+'"]'); if(n) n.value=""; cb(); }; });
  root.querySelectorAll("[data-tn]").forEach(function(n){ n.onchange=function(){ var k=n.getAttribute("data-tn"), v=Math.round(+n.value); if(!(v>=0)) return; obj[k]=k==="s"||k==="rounds"?Math.max(1,Math.min(20,v)):Math.min(900,v); root.querySelectorAll('[data-ts="'+k+'"]').forEach(function(x){ x.classList.remove("on"); }); cb(); }; });
}
function addToMine(id){
  if(!D.my.length){ D.my.push(newMine()); }
  var body='<div class="small" style="margin-bottom:8px">'+L2("Tambah ke rutin mana?","Add to which routine?")+'</div>'+D.my.map(function(r,i){ return '<button class="btn alt full g3d" data-mi="'+i+'" style="margin-bottom:6px">'+E(r.n)+' ('+r.mv.length+')</button>'; }).join("")+'<button class="btn gold full g3d" data-mi="new">＋ '+L2("Rutin baharu","New routine")+'</button>';
  var ov=H.showSheet(L2("Rutin saya","My routines"), body);
  ov.querySelectorAll("[data-mi]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-mi"), r; if(k==="new"){ r=newMine(); D.my.push(r); } else r=D.my[+k]; r.mv.push(id); sv(); H.closeOverlay(); H.toast(L2("Ditambah ke ","Added to ")+r.n); }; });
}
function newMine(){ return {id:"m"+Date.now().toString(36), n:L2("Rutin saya ","My routine ")+(D.my.length+1), lvl:D.lvl, work:40, rest:20, rounds:3, rr:45, warm:true, cool:true, mv:[]}; }

// ---------- 3. Rutin ----------
function pRutin(box){
  var h='<div class="seg fseg3">'+[["ready","⭐","Sedia ada","Ready-made"],["mine","🧩","Rutin saya","My routines"],["timer","⏲","Pemasa selang","Interval timer"]].map(function(x){ return '<button class="'+(rtTab===x[0]?"on":"")+'" data-rt="'+x[0]+'">'+x[1]+' '+L2(x[2],x[3])+'</button>'; }).join("")+'</div>';
  if(rtTab==="ready"){
    h+=FIT_ROUTINES.map(function(r,i){ var s=routineOf(r), e=est(s); return '<div class="card frt"><div class="row"><div class="frth"><span class="frti">'+r[1]+'</span><div><b>'+E(L2(r[2],r[3]))+'</b><div class="mut tiny">'+E(L2(r[4],r[5]))+'</div></div></div><button class="btn gold g3d fplay" data-rgo="'+i+'">▶</button></div>'+
      '<div class="frtm">'+dots(r[6])+' <span>⏱ '+Math.round(e.sec/60)+' min</span><span>🔥 ≈'+Math.round(e.kcal)+' kcal</span><span>'+r[7]+'s / '+r[8]+'s × '+r[9]+'</span><button class="linkb" data-rsee="'+i+'">'+L2("lihat","view")+' ›</button></div></div>'; }).join("");
  } else if(rtTab==="mine"){
    h+=(D.my.length?D.my.map(function(r,i){ var e=est(r); return '<div class="card frt"><div class="row"><div><b>'+E(r.n)+'</b><div class="mut tiny">'+r.mv.length+L2(" gerakan · "," moves · ")+r.work+'s / '+r.rest+'s × '+r.rounds+' · ⏱ '+Math.round(e.sec/60)+' min · 🔥 ≈'+Math.round(e.kcal)+' kcal</div></div><button class="btn gold g3d fplay" data-mgo="'+i+'"'+(r.mv.length?'':' disabled')+'>▶</button></div>'+
      '<div class="btns" style="margin-top:8px"><button class="btn alt g3d" data-med="'+i+'">✎ '+L2("Ubah","Edit")+'</button><button class="btn alt g3d" data-mdel="'+i+'">🗑</button></div></div>'; }).join(""):'<div class="card mut small">'+L2("Belum ada rutin sendiri. Buat satu: pilih gerakan, masa gerak, rehat dan pusingan.","No routines of your own yet. Make one: pick moves, work time, rest and rounds.")+'</div>')+
      '<button class="btn gold full g3d" id="fMk" style="margin:6px 0 10px">＋ '+L2("Buat rutin sendiri","Make my own routine")+'</button>';
  } else {
    var T=D.it||(D.it={w:40, r:20, n:8, rr:0, sets:1});
    h+='<div class="card"><h3>⏲ '+L2("Pemasa selang (HIIT / Tabata)","Interval timer (HIIT / Tabata)")+'</h3><div class="mut small">'+L2("Untuk apa-apa senaman: lompat tali, tekan tubi, lari. Bunyi getar dan suara pada setiap pertukaran.","For any exercise: skipping, push-ups, running. A buzz and a voice cue at every change.")+'</div>'+
      '<div class="chips" style="margin-top:6px">'+[["Tabata",20,10,8],["HIIT 40/20",40,20,10],["EMOM 1'",50,10,10],["30/30",30,30,10]].map(function(p){ return '<button class="chip" data-itp="'+p[1]+","+p[2]+","+p[3]+'">'+p[0]+'</button>'; }).join("")+'</div>'+
      '<div class="fset" id="fItS">'+tset("w",L2("Gerak","Work"),[20,30,40,45,60],T.w,"s")+tset("r",L2("Rehat","Rest"),[0,10,15,20,30,60],T.r,"s")+tset("n",L2("Selang","Intervals"),[4,6,8,10,12,20],T.n,"")+'</div>'+
      '<div class="mut small" id="fItTot"></div><button class="btn gold full g3d" id="fItGo" style="margin-top:8px">▶ '+L2("Mula","Start")+'</button></div>';
  }
  box.innerHTML=h;
  box.querySelectorAll("[data-rt]").forEach(function(b){ b.onclick=function(){ rtTab=b.getAttribute("data-rt"); draw(); }; });
  box.querySelectorAll("[data-rgo]").forEach(function(b){ b.onclick=function(){ play(routineOf(FIT_ROUTINES[+b.getAttribute("data-rgo")])); }; });
  box.querySelectorAll("[data-rsee]").forEach(function(b){ b.onclick=function(){ seeRoutine(routineOf(FIT_ROUTINES[+b.getAttribute("data-rsee")]), true); }; });
  box.querySelectorAll("[data-mgo]").forEach(function(b){ b.onclick=function(){ var r=D.my[+b.getAttribute("data-mgo")]; if(r.mv.length) play(r); }; });
  box.querySelectorAll("[data-med]").forEach(function(b){ b.onclick=function(){ editMine(+b.getAttribute("data-med")); }; });
  box.querySelectorAll("[data-mdel]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-mdel"); if(confirm(L2("Padam rutin ini?","Delete this routine?"))){ D.my.splice(i,1); sv(); draw(); } }; });
  var mk_=box.querySelector("#fMk"); if(mk_) mk_.onclick=function(){ D.my.push(newMine()); sv(); editMine(D.my.length-1); };
  var it=box.querySelector("#fItS"); if(it){ var T2=D.it, tot=function(){ box.querySelector("#fItTot").textContent=L2("Jumlah ","Total ")+mmss(T2.n*T2.w+(T2.n-1)*T2.r); sv(); }; bindSet(it, T2, tot); tot();
    box.querySelectorAll("[data-itp]").forEach(function(b){ b.onclick=function(){ var v=b.getAttribute("data-itp").split(","); T2.w=+v[0]; T2.r=+v[1]; T2.n=+v[2]; sv(); draw(); }; });
    box.querySelector("#fItGo").onclick=function(){ var mv=[]; for(var i=0;i<T2.n;i++) mv.push("free"); play({n:L2("Pemasa selang","Interval timer"), lvl:2, work:T2.w, rest:T2.r, rounds:1, rr:0, warm:false, cool:false, mv:mv}); }; }
}
function seeRoutine(s, ready){
  var body='<div class="mut small">'+s.work+L2("s gerak · ","s work · ")+s.rest+L2("s rehat · "," s rest · ")+s.rounds+L2(" pusingan"," rounds")+(s.rr?' · '+s.rr+L2("s rehat antara pusingan","s rest between rounds"):'')+(s.warm?' · '+L2("memanaskan badan","warm-up"):'')+(s.cool?' · '+L2("menyejukkan badan","cool-down"):'')+'</div>'+
    '<ol class="frl">'+s.mv.map(function(id){ var m=MV[id]; return '<li><b>'+E(nm(m))+'</b> <span class="mut tiny">'+m.p.map(partNm).join(", ")+'</span></li>'; }).join("")+'</ol>'+
    '<div class="btns"><button class="btn gold g3d" id="srGo">▶ '+L2("Mula","Start")+'</button>'+(ready?'<button class="btn alt g3d" id="srCp">⧉ '+L2("Salin & ubah","Copy & edit")+'</button>':'')+'</div>';
  var ov=H.showSheet((s.ic?s.ic+" ":"")+E(s.n), body);
  ov.querySelector("#srGo").onclick=function(){ play(s); };
  var cp=ov.querySelector("#srCp"); if(cp) cp.onclick=function(){ var r=JSON.parse(JSON.stringify(s)); r.id="m"+Date.now().toString(36); r.n=s.n+" ✎"; delete r.ic; D.my.push(r); sv(); rtTab="mine"; H.closeOverlay(); editMine(D.my.length-1); };
}
function editMine(i){
  var r=D.my[i]; if(!r) return; var q="";
  var render=function(){
    var body='<input type="text" id="meN" class="ftxt" value="'+E(r.n)+'">'+
      '<div class="fset">'+tset("work",L2("Gerak","Work"),[20,30,40,45,60],r.work,"s")+tset("rest",L2("Rehat","Rest"),[0,10,15,20,30,45],r.rest,"s")+tset("rounds",L2("Pusingan","Rounds"),[1,2,3,4,5],r.rounds,"")+tset("rr",L2("Rehat antara pusingan","Rest between rounds"),[0,30,45,60,90],r.rr,"s")+'</div>'+
      '<label class="fchk"><input type="checkbox" id="meW"'+(r.warm?" checked":"")+'> '+L2("Panaskan badan dahulu (1.5 min)","Warm up first (1.5 min)")+'</label><label class="fchk"><input type="checkbox" id="meC"'+(r.cool?" checked":"")+'> '+L2("Sejukkan badan di akhir (2 min)","Cool down at the end (2 min)")+'</label>'+
      '<h4>'+L2("Gerakan dalam rutin","Moves in the routine")+' ('+r.mv.length+')</h4><div class="frl2">'+(r.mv.length?r.mv.map(function(id,k){ var m=MV[id]; return '<div class="frow"><span>'+(k+1)+'. '+E(nm(m))+'</span><span><button class="chip" data-mu="'+k+'">▲</button><button class="chip" data-md="'+k+'">▼</button><button class="chip" data-mx="'+k+'">✕</button></span></div>'; }).join(""):'<div class="mut small">'+L2("Tambah gerakan di bawah.","Add moves below.")+'</div>')+'</div>'+
      '<h4>'+L2("Tambah gerakan","Add moves")+'</h4><input type="text" id="meQ" class="ftxt" placeholder="🔍 '+L2("Cari","Search")+'" value="'+E(q)+'"><div class="fpick">'+ALLM.filter(function(m){ return !q || (m.ms+" "+m.en).toLowerCase().indexOf(q.toLowerCase())>=0; }).map(function(m){ return '<button class="chip" data-ma="'+m.id+'">＋ '+E(nm(m))+' '+dots(m.l)+'</button>'; }).join("")+'</div>'+
      '<div class="mut small" style="margin:8px 0">⏱ '+mmss(est(r).sec)+' · 🔥 ≈'+Math.round(est(r).kcal)+' kcal</div><button class="btn gold full g3d" id="meOk">✓ '+L2("Simpan","Save")+'</button>';
    var ov=H.showSheet("✎ "+L2("Rutin saya","My routine"), body, function(){ sv(); if(page==="rutin") draw(); });
    var sh=ov.querySelector(".shb");
    ov.querySelector("#meN").onchange=function(){ r.n=this.value.trim()||r.n; sv(); };
    bindSet(ov, r, function(){ sv(); });
    ov.querySelector("#meW").onchange=function(){ r.warm=this.checked; sv(); };
    ov.querySelector("#meC").onchange=function(){ r.cool=this.checked; sv(); };
    var keep=function(){ var y=sh?sh.scrollTop:0; sv(); render(); var s2=document.querySelector("#overlay .shb"); if(s2) s2.scrollTop=y; };
    ov.querySelectorAll("[data-mu]").forEach(function(b){ b.onclick=function(){ var k=+b.getAttribute("data-mu"); if(k>0){ var t=r.mv[k]; r.mv[k]=r.mv[k-1]; r.mv[k-1]=t; } keep(); }; });
    ov.querySelectorAll("[data-md]").forEach(function(b){ b.onclick=function(){ var k=+b.getAttribute("data-md"); if(k<r.mv.length-1){ var t=r.mv[k]; r.mv[k]=r.mv[k+1]; r.mv[k+1]=t; } keep(); }; });
    ov.querySelectorAll("[data-mx]").forEach(function(b){ b.onclick=function(){ r.mv.splice(+b.getAttribute("data-mx"),1); keep(); }; });
    ov.querySelectorAll("[data-ma]").forEach(function(b){ b.onclick=function(){ r.mv.push(b.getAttribute("data-ma")); H.toast("＋ "+nm(MV[b.getAttribute("data-ma")])); keep(); }; });
    var qi=ov.querySelector("#meQ"); qi.oninput=function(){ q=this.value; var pk=ov.querySelector(".fpick"); pk.innerHTML=ALLM.filter(function(m){ return !q || (m.ms+" "+m.en).toLowerCase().indexOf(q.toLowerCase())>=0; }).map(function(m){ return '<button class="chip" data-ma="'+m.id+'">＋ '+E(nm(m))+' '+dots(m.l)+'</button>'; }).join("");
      pk.querySelectorAll("[data-ma]").forEach(function(b){ b.onclick=function(){ r.mv.push(b.getAttribute("data-ma")); H.toast("＋ "+nm(MV[b.getAttribute("data-ma")])); keep(); }; }); };
    ov.querySelector("#meOk").onclick=function(){ sv(); H.closeOverlay(); rtTab="mine"; page="rutin"; draw(); };
  };
  render();
}

// ---------- 4. Pelan ----------
var planEdit=false, pd=null;
function pPlan(box){
  var p=D.plan, h='';
  if(!p || planEdit){
    if(!pd) pd=p?JSON.parse(JSON.stringify(p)):{f:D.foc.slice(), l:D.lvl, days:[1,3,5], m:20, wk:4, st:ymd()};
    var DN=en()?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]:["Ahd","Isn","Sel","Rab","Kha","Jum","Sab"];
    h+='<div class="card"><h3>📋 '+L2("Rancang pelan senaman","Plan your workouts")+'</h3><div class="mut small">'+L2("Pilih fokus, tahap, hari dan masa. Aplikasi menyusun sesi setiap hari, menambah masa sedikit demi sedikit setiap minggu.","Pick a focus, level, days and time. The app builds each day\'s session and adds a little more each week.")+'</div>'+
      '<h4>'+L2("Fokus","Focus")+'</h4><div class="chips fwrap"><button class="chip'+(!pd.f.length?" on":"")+'" data-pf="all">🧍 '+L2("Seluruh badan","Whole body")+'</button>'+FIT_PARTS.map(function(x){ return '<button class="chip'+(pd.f.indexOf(x[0])>=0?" on":"")+'" data-pf="'+x[0]+'">'+x[1]+' '+L2(x[2],x[3])+'</button>'; }).join("")+'</div>'+
      '<h4>'+L2("Tahap","Level")+'</h4><div class="grp3">'+FIT_LEVELS.map(function(L){ return '<button class="chip g3d'+(pd.l===L.id?" on":"")+'" data-pl="'+L.id+'">'+dots(L.id)+' '+nm(L)+'</button>'; }).join("")+'</div>'+
      '<h4>'+L2("Hari","Days")+'</h4><div class="fdays">'+[1,2,3,4,5,6,0].map(function(d){ return '<button class="chip'+(pd.days.indexOf(d)>=0?" on":"")+'" data-pdd="'+d+'">'+DN[d]+'</button>'; }).join("")+'</div>'+
      '<h4>'+L2("Masa sesi","Session time")+'</h4><div class="chips">'+[10,15,20,30,45,60].map(function(m){ return '<button class="chip'+(pd.m===m?" on":"")+'" data-pm="'+m+'">'+m+' min</button>'; }).join("")+'</div>'+
      '<h4>'+L2("Tempoh","Length")+'</h4><div class="chips">'+[2,4,6,8,12].map(function(w){ return '<button class="chip'+(pd.wk===w?" on":"")+'" data-pw="'+w+'">'+w+L2(" minggu"," weeks")+'</button>'; }).join("")+'</div>'+
      '<h4>'+L2("Mula","Start")+'</h4><input type="date" id="pSt" class="ftxt" value="'+pd.st+'">'+
      '<div class="mut small" style="margin:8px 0">'+pd.days.length+L2(" hari seminggu × "," days a week × ")+pd.m+L2(" minit = "," min = ")+(pd.days.length*pd.m)+L2(" minit seminggu"," min a week")+(pd.days.length*pd.m>=150?" ✅ WHO":" ("+L2("saranan WHO 150","WHO advises 150")+")")+'</div>'+
      '<div class="btns"><button class="btn gold g3d" id="pOk">✓ '+L2("Buat pelan","Make the plan")+'</button>'+(p?'<button class="btn alt g3d" id="pCn">'+L2("Batal","Cancel")+'</button>':'')+'</div></div>';
    box.innerHTML=h;
    box.querySelectorAll("[data-pf]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-pf"); if(k==="all") pd.f=[]; else { var i=pd.f.indexOf(k); if(i>=0) pd.f.splice(i,1); else pd.f.push(k); } draw(); }; });
    box.querySelectorAll("[data-pl]").forEach(function(b){ b.onclick=function(){ pd.l=+b.getAttribute("data-pl"); draw(); }; });
    box.querySelectorAll("[data-pdd]").forEach(function(b){ b.onclick=function(){ var d=+b.getAttribute("data-pdd"), i=pd.days.indexOf(d); if(i>=0){ if(pd.days.length>1) pd.days.splice(i,1); } else pd.days.push(d); draw(); }; });
    box.querySelectorAll("[data-pm]").forEach(function(b){ b.onclick=function(){ pd.m=+b.getAttribute("data-pm"); draw(); }; });
    box.querySelectorAll("[data-pw]").forEach(function(b){ b.onclick=function(){ pd.wk=+b.getAttribute("data-pw"); draw(); }; });
    box.querySelector("#pSt").onchange=function(){ if(this.value) pd.st=this.value; };
    box.querySelector("#pOk").onclick=function(){ pd.id=Date.now().toString(36); D.plan=pd; pd=null; planEdit=false; sv(); remSync(); H.toast(L2("Pelan disimpan. Peringatan dihantar pada hari bersenam.","Plan saved. You\'ll get a reminder on workout days.")); draw(); };
    var cn=box.querySelector("#pCn"); if(cn) cn.onclick=function(){ pd=null; planEdit=false; draw(); };
    return;
  }
  var st=pYmd(p.st), end=addD(st,p.wk*7-1), tot=0, dn=0, t=ymd();
  for(var d=new Date(st); d<=end; d=addD(d,1)){ if(p.days.indexOf(d.getDay())>=0){ tot++; if(planDone(ymd(d))) dn++; } }
  var wkNo=Math.min(p.wk, Math.max(1, Math.floor((pYmd(t)-st)/(7*864e5))+1));
  h+='<div class="card"><div class="row"><h3 style="margin:0">📋 '+L2("Pelan saya","My plan")+'</h3><span class="badge">'+L2("Minggu ","Week ")+wkNo+'/'+p.wk+'</span></div>'+
    '<div class="mut small" style="margin-top:4px">'+(p.f.length?p.f.map(partNm).join(", "):"🧍 "+L2("Seluruh badan","Whole body"))+' · '+dots(p.l)+' '+nm(lvl(p.l))+' · '+p.m+L2(" min, "," min, ")+p.days.length+L2(" hari seminggu"," days a week")+'</div>'+
    '<div class="ubar1" style="margin-top:8px"><i style="width:'+Math.round(dn*100/Math.max(1,tot))+'%"></i></div><div class="mut tiny">'+dn+' / '+tot+L2(" sesi selesai"," sessions done")+'</div></div>';
  h+=todayCard();
  h+='<div class="card"><h3>🗓 '+L2("7 hari akan datang","Next 7 days")+'</h3>';
  for(var i=0;i<7;i++){ var dd=addD(new Date(),i), s=planOn(dd), k=ymd(dd), lb=dd.toLocaleDateString(H.locTag?H.locTag():undefined,{weekday:"short", day:"numeric", month:"short"});
    if(!s){ h+='<div class="fpd rest"><span>'+lb+'</span><span class="mut tiny">'+L2("Rehat · jalan santai atau regangan","Rest · easy walk or stretching")+'</span></div>'; continue; }
    var e=est(s); h+='<button class="fpd'+(planDone(k)?" done":"")+'" data-pday="'+k+'"><span>'+lb+'</span><span class="mut tiny">'+s.mv.slice(0,4).map(function(id){ return nm(MV[id]); }).join(", ")+(s.mv.length>4?"…":"")+'</span><b>'+(planDone(k)?"✅":Math.round(e.sec/60)+"′")+'</b></button>'; }
  h+='</div>';
  h+='<div class="card"><h3>🔔 '+L2("Peringatan","Reminder")+'</h3><div class="row"><label class="fchk"><input type="checkbox" id="pRem"'+(D.rem.on?" checked":"")+'> '+L2("Ingatkan pada hari bersenam","Remind me on workout days")+'</label><input type="time" id="pRemT" value="'+(D.rem.hm||"17:30")+'" class="ftime"></div><div class="mut tiny">'+L2("Elakkan waktu solat; selepas Asar atau selepas Isyak sesuai.","Avoid prayer times; after Asr or after Isha works well.")+'</div></div>';
  h+='<div class="btns" style="margin-bottom:12px"><button class="btn alt g3d" id="pEd">✎ '+L2("Ubah pelan","Edit plan")+'</button><button class="btn alt g3d" id="pDel">🗑 '+L2("Padam","Delete")+'</button></div>';
  box.innerHTML=h; bindToday(box);
  box.querySelectorAll("[data-pday]").forEach(function(b){ b.onclick=function(){ var s=planOn(pYmd(b.getAttribute("data-pday"))); if(s) seeRoutine(s); }; });
  box.querySelector("#pRem").onchange=function(){ D.rem.on=this.checked; sv(); remSync(); };
  box.querySelector("#pRemT").onchange=function(){ D.rem.hm=this.value||"17:30"; sv(); remSync(); };
  box.querySelector("#pEd").onclick=function(){ planEdit=true; pd=null; draw(); };
  box.querySelector("#pDel").onclick=function(){ if(confirm(L2("Padam pelan ini? Rekod senaman kekal.","Delete this plan? Your workout records stay."))){ D.plan=null; sv(); remSync(); draw(); } };
}

// ---------- 5. Jejak ----------
// 0.5.23 (Google Fit style): Heart Points (1 a minute of moderate activity, 2 a minute of vigorous, from each record's kcal and your weight)
// and three rings: move minutes today (goal 30), Heart Points this week (WHO: 150), steps today (when step counting is on)
function hpOf(x){ var kg=D.w||65, m=x.min||0; if(!m) return 0; var met=(x.kcal||0)/(kg*m/60); return met>=6?2*m:met>=3?m:0; }
function ringsCard(){ var t=ymd(), mon=ymd(addD(new Date(),-((new Date().getDay()+6)%7))), mt=0, hpw=0, days=[];
  D.log.forEach(function(x){ if(x.d===t) mt+=x.min||0; if(x.d>=mon) hpw+=hpOf(x); });
  for(var i=6;i>=0;i--){ var k=ymd(addD(new Date(),-i)), mm=0, hp=0; D.log.forEach(function(x){ if(x.d===k){ mm+=x.min||0; hp+=hpOf(x); } }); days.push([k, mm, hp]); }
  var st=H.steps?H.steps():null, sg=(H.S&&H.S.stepGoal)||6000, R=[[Math.min(1,mt/30),"#3ddc84",42],[Math.min(1,hpw/150),"#4a9be8",32],[st==null?0:Math.min(1,st/sg),"#f2b33d",22]];
  var ring=function(r){ var C=2*Math.PI*r[2]; return '<circle cx="50" cy="50" r="'+r[2]+'" fill="none" stroke="'+r[1]+'" stroke-opacity=".18" stroke-width="8"/><circle cx="50" cy="50" r="'+r[2]+'" fill="none" stroke="'+r[1]+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+(C*r[0]).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 50 50)"/>'; };
  return '<div class="card frings"><h3>💗 '+L2("Cincin aktiviti","Activity rings")+'</h3><div class="frRow"><svg viewBox="0 0 100 100" class="frSvg">'+R.map(ring).join("")+'</svg><div class="frLeg">'+
    '<div><i style="background:#3ddc84"></i><b>'+Math.round(mt)+'</b> / 30 '+L2("minit bergerak hari ini","move minutes today")+'</div>'+
    '<div><i style="background:#4a9be8"></i><b>'+Math.round(hpw)+'</b> / 150 '+L2("Mata Jantung minggu ini","Heart Points this week")+'</div>'+
    '<div><i style="background:#f2b33d"></i>'+(st==null?'<span class="mut">'+L2("Langkah: hidupkan dalam Statistik","Steps: turn on in Stats")+'</span>':'<b>'+st+'</b> / '+sg+' '+L2("langkah","steps"))+'</div></div></div>'+
    '<div class="frWeek">'+days.map(function(d){ var p1=Math.min(1,d[1]/30), p2=Math.min(1,d[2]/22), C1=2*Math.PI*14, C2=2*Math.PI*9;
      return '<div><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="14" fill="none" stroke="#3ddc84" stroke-opacity=".18" stroke-width="4"/><circle cx="18" cy="18" r="14" fill="none" stroke="#3ddc84" stroke-width="4" stroke-linecap="round" stroke-dasharray="'+(C1*p1).toFixed(1)+' '+C1.toFixed(1)+'" transform="rotate(-90 18 18)"/><circle cx="18" cy="18" r="9" fill="none" stroke="#4a9be8" stroke-opacity=".18" stroke-width="4"/><circle cx="18" cy="18" r="9" fill="none" stroke="#4a9be8" stroke-width="4" stroke-linecap="round" stroke-dasharray="'+(C2*p2).toFixed(1)+' '+C2.toFixed(1)+'" transform="rotate(-90 18 18)"/></svg><small>'+pYmd(d[0]).toLocaleDateString(H.locTag?H.locTag():undefined,{weekday:"narrow"})+'</small></div>'; }).join("")+'</div>'+
    '<div class="mut tiny">'+L2("Mata Jantung: 1 seminit aktiviti sederhana, 2 seminit aktiviti cergas (anggaran dari kalori dan berat).","Heart Points: 1 a minute of moderate activity, 2 a minute of vigorous (estimated from calories and weight).")+'</div></div>'; }
function pTrack(box){
  var now=new Date(), t=ymd(now); if(!trM) trM=t.slice(0,7);
  var s=stats(), wk=weekMin(), mp=trM.split("-"), y=+mp[0], m=+mp[1]-1, dim=new Date(y,m+1,0).getDate(), lead=(new Date(y,m,1).getDay()+6)%7;
  var MO=en()?["January","February","March","April","May","June","July","August","September","October","November","December"]:["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"];
  var h=ringsCard()+'<div class="card"><h3>📊 '+L2("Minggu ini","This week")+'</h3><div class="urow3"><div><b>'+Math.round(wk.min)+'</b><span class="mut tiny">'+L2("minit","minutes")+'</span></div><div><b>'+Math.round(wk.kcal)+'</b><span class="mut tiny">kcal</span></div><div><b>'+wk.n+'</b><span class="mut tiny">'+L2("sesi","sessions")+'</span></div></div>'+
    '<div class="fwk"><div class="ubar1"><i style="width:'+Math.min(100,Math.round(wk.min*100/150))+'%"></i></div><span class="mut tiny">'+L2("Sasaran WHO: 150 minit sederhana atau 75 minit cergas seminggu","WHO target: 150 moderate or 75 vigorous minutes a week")+'</span></div>'+
    '<div class="urow3" style="margin-top:8px"><div><b>🔥 '+s.cur+'</b><span class="mut tiny">'+L2("berturut kini","current streak")+'</span></div><div><b>🏆 '+s.best+'</b><span class="mut tiny">'+L2("terbaik","best streak")+'</span></div><div><b>'+Math.round(s.kcal)+'</b><span class="mut tiny">'+L2("jumlah kcal","total kcal")+'</span></div></div></div>';
  h+='<div class="card"><div class="stNav"><button class="chip g3d" id="trP">‹</button><b>'+MO[m]+' '+y+'</b><button class="chip g3d" id="trN"'+(trM<t.slice(0,7)?'':' disabled')+'>›</button></div><div class="stGrid">'+(en()?["M","T","W","T","F","S","S"]:["I","S","R","K","J","S","A"]).map(function(x){ return '<div class="stH">'+x+'</div>'; }).join("");
  for(var z=0;z<lead;z++) h+='<div></div>';
  var mx=1, vals=[]; for(var d=1; d<=dim; d++){ var k=ymd(new Date(y,m,d)), dt=dayTot(k); vals.push([k,dt]); if(dt.kcal>mx) mx=dt.kcal; }
  vals.forEach(function(x){ var k=x[0], dt=x[1], pl=planOn(pYmd(k)), a=dt.kcal?0.2+0.8*dt.kcal/mx:0;
    h+='<button class="stC fdc'+(k===t?" today":"")+(k>t?" fut":"")+(pl?" pl":"")+(pl && k<t && !planDone(k)?" miss":"")+'" data-trd="'+k+'" style="--a:'+a+'"><b>'+pYmd(k).getDate()+'</b><small>'+(dt.kcal?Math.round(dt.kcal):(pl?"•":""))+'</small></button>'; });
  h+='</div><div class="mut tiny" style="margin-top:6px">'+L2("Angka = kcal dibakar. • = hari pelan. Ketik hari untuk butiran atau tambah aktiviti.","Number = kcal burned. • = plan day. Tap a day for details or to add an activity.")+'</div>'+
    '<button class="btn gold full g3d" id="trAdd" style="margin-top:8px">＋ '+L2("Tambah aktiviti (jalan, badminton, futsal…)","Add an activity (walk, badminton, futsal…)")+'</button></div>';
  // last 7 days bars
  var b7='', m7=1, d7=[]; for(var i=6;i>=0;i--){ var dd=addD(now,-i), dt2=dayTot(ymd(dd)); d7.push([dd,dt2]); if(dt2.kcal>m7) m7=dt2.kcal; }
  b7=d7.map(function(x){ return '<div class="fb7"><i style="height:'+Math.round(x[1].kcal*100/m7)+'%"></i><small>'+Math.round(x[1].kcal||0)+'</small><span>'+x[0].toLocaleDateString(H.locTag?H.locTag():undefined,{weekday:"narrow"})+'</span></div>'; }).join("");
  h+='<div class="card"><h3>🔥 '+L2("Kalori 7 hari","Calories, last 7 days")+'</h3><div class="fbars">'+b7+'</div></div>';
  h+='<div class="card"><h3>🏅 '+L2("Lencana","Badges")+'</h3><div class="fbadges">'+FIT_BADGES.map(function(b){ var ok=b[4](s); return '<div class="fbg'+(ok?" on":"")+'"><span>'+b[1]+'</span><small>'+E(L2(b[2],b[3]))+'</small></div>'; }).join("")+'</div></div>';
  var last=D.log.slice(-12).reverse();
  h+='<div class="card"><h3>🧾 '+L2("Rekod terkini","Recent records")+'</h3>'+(last.length?last.map(function(x){ return logRow(x); }).join(""):'<div class="mut small">'+L2("Belum ada rekod. Mulakan senaman atau tambah aktiviti.","No records yet. Start a workout or add an activity.")+'</div>')+'</div>';
  box.innerHTML=h;
  box.querySelector("#trP").onclick=function(){ var d=new Date(y,m-1,1); trM=ymd(d).slice(0,7); draw(); };
  box.querySelector("#trN").onclick=function(){ var d=new Date(y,m+1,1); if(ymd(d).slice(0,7)<=t.slice(0,7)){ trM=ymd(d).slice(0,7); draw(); } };
  box.querySelectorAll("[data-trd]").forEach(function(b){ b.onclick=function(){ daySheet(b.getAttribute("data-trd")); }; });
  box.querySelector("#trAdd").onclick=function(){ actSheet(t); };
  bindDel(box);
}
function logRow(x){ return '<div class="flog"><span class="fli">'+(x.ic||(x.k==="a"?"🏃":"💪"))+'</span><span class="fmain"><b>'+E(x.n)+'</b><small>'+pYmd(x.d).toLocaleDateString(H.locTag?H.locTag():undefined,{day:"numeric", month:"short"})+' · '+Math.round(x.min)+' min'+(x.mv?' · '+x.mv+L2(" gerakan"," moves"):'')+'</small></span><b class="gold">'+Math.round(x.kcal)+' kcal</b><button class="chip" data-ldel="'+x.id+'">✕</button></div>'; }
function bindDel(root){ root.querySelectorAll("[data-ldel]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); if(!confirm(L2("Padam rekod ini?","Delete this record?"))) return; var id=b.getAttribute("data-ldel"); D.log=D.log.filter(function(x){ return x.id!==id; }); sv(); remSync(); var ov=document.getElementById("overlay"); if(!ov.classList.contains("hidden")) H.closeOverlay(); draw(); }; }); }
function daySheet(k){
  var L=doneOn(k), pl=planOn(pYmd(k)), dt=dayTot(k);
  var body='<div class="urow3"><div><b>'+Math.round(dt.kcal)+'</b><span class="mut tiny">kcal</span></div><div><b>'+Math.round(dt.min)+'</b><span class="mut tiny">min</span></div><div><b>'+(D.water[k]||0)+'</b><span class="mut tiny">'+L2("gelas air","glasses of water")+'</span></div></div>'+
    (pl?'<div class="small" style="margin:8px 0">📋 '+(planDone(k)?"✅ ":"")+E(pl.n)+' · '+pl.mv.length+L2(" gerakan"," moves")+'</div>':'')+
    (L.length?L.map(logRow).join(""):'<div class="mut small" style="margin:8px 0">'+L2("Tiada rekod pada hari ini.","Nothing recorded that day.")+'</div>')+
    '<div class="btns" style="margin-top:8px"><button class="btn gold g3d" id="dsAdd">＋ '+L2("Aktiviti","Activity")+'</button>'+(pl && !planDone(k) && k===ymd()?'<button class="btn alt g3d" id="dsGo">▶ '+L2("Sesi pelan","Plan session")+'</button>':'')+'</div>';
  var ov=H.showSheet(pYmd(k).toLocaleDateString(H.locTag?H.locTag():undefined,{weekday:"long", day:"numeric", month:"long"}), body);
  bindDel(ov);
  ov.querySelector("#dsAdd").onclick=function(){ actSheet(k); };
  var g=ov.querySelector("#dsGo"); if(g) g.onclick=function(){ play(pl); };
}
function actSheet(k){
  var a=FIT_ACT[0][0], min=30;
  var body='<div class="fpick fact">'+FIT_ACT.map(function(x){ return '<button class="chip'+(x[0]===a?" on":"")+'" data-act="'+x[0]+'">'+x[1]+' '+E(L2(x[2],x[3]))+'</button>'; }).join("")+'</div>'+
    '<div class="row" style="margin-top:10px"><span class="small">'+L2("Minit","Minutes")+'</span><input type="number" id="acM" value="30" min="1" max="600" class="ftnum2"></div>'+
    '<div class="row"><span class="small">kcal</span><input type="number" id="acK" class="ftnum2"></div><div class="mut tiny">'+L2("Kalori dianggar dari nilai MET dan berat anda ("," Calories are estimated from MET values and your weight (")+kg()+' kg). '+L2("Boleh diubah.","You can change it.")+'</div>'+
    '<button class="btn gold full g3d" id="acOk" style="margin-top:10px">✓ '+L2("Simpan","Save")+'</button>';
  var ov=H.showSheet(L2("Tambah aktiviti","Add an activity"), body);
  var kc=ov.querySelector("#acK"), mi=ov.querySelector("#acM"), upd=function(){ var x=FIT_ACT.filter(function(q){ return q[0]===a; })[0]; kc.value=Math.round(kcal(x[4], (+mi.value||0)*60)); };
  upd(); mi.oninput=upd;
  ov.querySelectorAll("[data-act]").forEach(function(b){ b.onclick=function(){ a=b.getAttribute("data-act"); ov.querySelectorAll("[data-act]").forEach(function(x){ x.classList.toggle("on", x===b); }); upd(); }; });
  ov.querySelector("#acOk").onclick=function(){ var x=FIT_ACT.filter(function(q){ return q[0]===a; })[0], mm=+mi.value||0; if(mm<=0) return; addLog({d:k, k:"a", n:L2(x[2],x[3]), ic:x[1], min:mm, kcal:+kc.value||0, met:x[4]}); H.closeOverlay(); H.toast(L2("Disimpan","Saved")); draw(); };
}

// ---------- 6. Kesihatan ----------
function bmiCat(b){ if(b<18.5) return ["low",L2("Kurang berat badan","Underweight")]; if(b<23) return ["ok",L2("Normal","Normal")]; if(b<27.5) return ["mid",L2("Lebih berat badan","Overweight")]; return ["high",L2("Obes","Obese")]; }
function pHealth(box){
  var hm=D.hm, a=age(), bmi=D.h&&D.w?D.w/Math.pow(D.h/100,2):null, t=ymd();
  // 0.7.93 (owner #28): pulse with the camera (fit/pulse.js); the result becomes the resting pulse and goes in a small log
  var pl=(hm.pl||[]).slice(-7);
  var h='<div class="card fpls"><div class="row"><h3 style="margin:0">❤️ '+L2("Nadi","Pulse")+'</h3><button class="btn gold" id="plsGo">📷 '+L2("Ukur dengan kamera","Measure with the camera")+'</button></div>'+
    '<div class="mut small">'+(pl.length?L2("Terakhir: ","Last: ")+'<b>'+pl[pl.length-1].b+' BPM</b> · '+pl[pl.length-1].d+(pl.length>1?' · '+L2("7 bacaan: ","7 readings: ")+pl.map(function(x){ return x.b; }).join(", "):''):L2("Letak hujung jari pada kamera belakang dengan lampu menyala, 30 saat.","Put a fingertip over the back camera with the light on, 30 seconds."))+'</div>'+
    '<div class="mut tiny">'+L2("Anggaran kesihatan umum, bukan alat perubatan.","A general wellness estimate, not a medical device.")+'</div></div>'+
    '<div class="card"><h3>👤 '+L2("Profil","Profile")+'</h3><div class="fgrid2">'+
    '<label>'+L2("Jantina","Sex")+'<span class="seg">'+[["m",L2("Lelaki","Male")],["f",L2("Perempuan","Female")]].map(function(x){ return '<button class="'+(D.sex===x[0]?"on":"")+'" data-hsx="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</span></label>'+
    '<label>'+L2("Tahun lahir","Birth year")+'<input type="number" data-hp="by" value="'+(D.by||"")+'" placeholder="1990" min="1920" max="2025"></label>'+
    '<label>'+L2("Tinggi (cm)","Height (cm)")+'<input type="number" data-hp="h" value="'+(D.h||"")+'" placeholder="160" step="0.5"></label>'+
    '<label>'+L2("Berat (kg)","Weight (kg)")+'<input type="number" data-hp="w" value="'+(D.w||"")+'" placeholder="60" step="0.1"></label></div>'+
    '<label class="fsel">'+L2("Tahap aktiviti harian","Daily activity")+'<select id="hAct">'+[[1.2,"Duduk banyak (kerja pejabat)","Mostly sitting (desk job)"],[1.375,"Ringan (senaman 1-3 hari)","Light (exercise 1-3 days)"],[1.55,"Sederhana (3-5 hari)","Moderate (3-5 days)"],[1.725,"Aktif (6-7 hari)","Active (6-7 days)"],[1.9,"Sangat aktif (kerja fizikal)","Very active (physical job)"]].map(function(x){ return '<option value="'+x[0]+'"'+(D.act===x[0]?" selected":"")+'>'+L2(x[1],x[2])+'</option>'; }).join("")+'</select></label>'+
    '<label class="fsel">'+L2("Matlamat","Goal")+'<select id="hGoal">'+[["lose","Turun berat (0.5 kg seminggu)","Lose weight (0.5 kg a week)"],["keep","Kekalkan berat","Keep my weight"],["gain","Naik berat (perlahan)","Gain weight (slowly)"]].map(function(x){ return '<option value="'+x[0]+'"'+(D.goal===x[0]?" selected":"")+'>'+L2(x[1],x[2])+'</option>'; }).join("")+'</select></label></div>';
  // BMI
  if(bmi){ var c=bmiCat(bmi), lo=18.5*Math.pow(D.h/100,2), hi=22.9*Math.pow(D.h/100,2), pos=Math.max(0,Math.min(100,(bmi-14)/(36-14)*100));
    h+='<div class="card"><h3>⚖️ BMI</h3><div class="fbmi"><b class="fbv '+c[0]+'">'+bmi.toFixed(1)+'</b><span class="fbc '+c[0]+'">'+c[1]+'</span></div>'+
      '<div class="fgauge"><i class="g1"></i><i class="g2"></i><i class="g3"></i><i class="g4"></i><em style="left:'+pos+'%"></em></div><div class="fgl"><span>18.5</span><span>23</span><span>27.5</span></div>'+
      '<div class="small" style="margin-top:8px">'+L2("Berat sihat untuk tinggi anda: ","Healthy weight for your height: ")+'<b>'+lo.toFixed(1)+' – '+hi.toFixed(1)+' kg</b>'+(D.w>hi?' · '+L2("kurang ","lose ")+(D.w-hi).toFixed(1)+' kg':D.w<lo?' · '+L2("tambah ","gain ")+(lo-D.w).toFixed(1)+' kg':' ✅')+'</div>'+
      '<div class="mut tiny" style="margin-top:4px">'+L2("Had Asia / KKM (CPG Obesiti): normal 18.5–22.9, lebih berat 23–27.4, obes ≥27.5. Had WHO antarabangsa: 25 dan 30.","Asian / Malaysian MOH cut-offs (Obesity CPG): normal 18.5–22.9, overweight 23–27.4, obese ≥27.5. International WHO cut-offs: 25 and 30.")+'</div></div>'; }
  else h+='<div class="card mut small">⚖️ '+L2("Masukkan tinggi dan berat untuk melihat BMI, berat sihat dan keperluan kalori.","Enter your height and weight to see your BMI, healthy weight and calorie needs.")+'</div>';
  // calories
  if(D.h && D.w && a){ var bmr=10*D.w+6.25*D.h-5*a+(D.sex==="f"?-161:5), tdee=bmr*D.act, tg=tdee+(D.goal==="lose"?-500:D.goal==="gain"?300:0), floor=D.sex==="f"?1200:1500, ex=dayTot(t).kcal;
    h+='<div class="card"><h3>🍽 '+L2("Kalori sehari","Daily calories")+'</h3><div class="urow3"><div><b>'+Math.round(bmr)+'</b><span class="mut tiny">'+L2("BMR (rehat)","BMR (at rest)")+'</span></div><div><b>'+Math.round(tdee)+'</b><span class="mut tiny">'+L2("keperluan harian","daily need")+'</span></div><div><b class="gold">'+Math.round(Math.max(floor,tg))+'</b><span class="mut tiny">'+L2("sasaran anda","your target")+'</span></div></div>'+
      '<div class="small" style="margin-top:8px">🔥 '+L2("Dibakar melalui senaman hari ini: ","Burned through exercise today: ")+'<b>'+Math.round(ex)+' kcal</b></div><div class="mut tiny">'+L2("Formula Mifflin-St Jeor. Jangan makan bawah ","Mifflin-St Jeor formula. Don\'t eat below ")+floor+L2(" kcal sehari tanpa nasihat doktor."," kcal a day without a doctor\'s advice.")+'</div></div>'; }
  // water
  var wt=Math.round(kg()*35+(dayTot(t).min>=20?500:0)), gl=D.water[t]||0, gT=Math.ceil(wt/250);
  h+='<div class="card"><h3>💧 '+L2("Air hari ini","Water today")+'</h3><div class="fwat">'+Array.apply(null,{length:Math.max(gT,gl)}).map(function(_,i){ return '<i class="'+(i<gl?"on":"")+'"></i>'; }).join("")+'</div>'+
    '<div class="row"><span class="small"><b>'+gl*250+'</b> / '+wt+' ml ('+gl+'/'+gT+L2(" gelas)"," glasses)")+'</span><span><button class="chip g3d" id="wM">−</button> <button class="chip g3d on" id="wP">＋ 250 ml</button></span></div><div class="mut tiny">'+L2("Anggaran 35 ml setiap kg berat badan, tambah 500 ml pada hari bersenam. Waktu puasa: minum antara berbuka dan sahur.","About 35 ml per kg of body weight, plus 500 ml on exercise days. When fasting: drink between iftar and sahur.")+'</div></div>';
  // heart rate
  if(a){ var mx=Math.round(208-0.7*a), rhr=hm.rhr||null, Z=[[50,60,"Zon 1: sangat ringan","Zone 1: very light","Pemanasan, pemulihan","Warm-up, recovery"],[60,70,"Zon 2: ringan","Zone 2: light","Bakar lemak, daya tahan","Fat burn, endurance"],[70,80,"Zon 3: sederhana","Zone 3: moderate","Kecergasan jantung","Heart fitness"],[80,90,"Zon 4: berat","Zone 4: hard","Kelajuan, HIIT","Speed, HIIT"],[90,100,"Zon 5: maksimum","Zone 5: maximum","Pecutan pendek sahaja","Short sprints only"]];
    var bpm=function(p){ return Math.round(rhr?rhr+(mx-rhr)*p/100:mx*p/100); };
    h+='<div class="card"><h3>❤️ '+L2("Zon kadar jantung","Heart-rate zones")+'</h3><div class="small">'+L2("Maksimum anggaran: ","Estimated maximum: ")+'<b>'+mx+' bpm</b> ('+L2("umur ","age ")+a+')</div>'+
      Z.map(function(z,i){ return '<div class="fzone z'+(i+1)+'"><b>'+bpm(z[0])+'–'+bpm(z[1])+'</b><span>'+L2(z[2],z[3])+'<small>'+L2(z[4],z[5])+'</small></span></div>'; }).join("")+
      '<label class="frow2">'+L2("Nadi rehat (pagi, sebelum bangun)","Resting pulse (morning, before getting up)")+'<input type="number" data-hm="rhr" value="'+(rhr||"")+'" placeholder="70"></label>'+
      '<div class="mut tiny">'+L2("Formula Tanaka (208 − 0.7 × umur)","Tanaka formula (208 − 0.7 × age)")+(rhr?L2(" dengan kaedah Karvonen (nadi rehat)."," with the Karvonen method (resting pulse)."):".")+'</div></div>'; }
  // body measures
  var wa=hm.waist, hp=hm.hip, nk=hm.neck, mBody='';
  if(wa && D.h){ var whtr=wa/D.h, wc=whtr<0.4?["low",L2("Rendah","Low")]:whtr<0.5?["ok",L2("Sihat","Healthy")]:whtr<0.6?["mid",L2("Risiko meningkat","Increased risk")]:["high",L2("Risiko tinggi","High risk")];
    mBody+='<div class="fmr"><span>'+L2("Nisbah pinggang/tinggi","Waist-to-height")+'</span><b class="fbc '+wc[0]+'">'+whtr.toFixed(2)+' · '+wc[1]+'</b></div>';
    var lim=D.sex==="f"?80:90; mBody+='<div class="fmr"><span>'+L2("Lilit pinggang (had KKM ","Waist (MOH limit ")+lim+' cm)</span><b class="fbc '+(wa>=lim?"high":"ok")+'">'+wa+' cm</b></div>'; }
  if(wa && hp){ var whr=wa/hp, wl=D.sex==="f"?0.85:0.9; mBody+='<div class="fmr"><span>'+L2("Nisbah pinggang/pinggul","Waist-to-hip")+'</span><b class="fbc '+(whr>wl?"mid":"ok")+'">'+whr.toFixed(2)+'</b></div>'; }
  if(wa && nk && D.h && (D.sex==="m" || hp)){ var lg=Math.log10, bf=D.sex==="m"?495/(1.0324-0.19077*lg(wa-nk)+0.15456*lg(D.h))-450:495/(1.29579-0.35004*lg(wa+hp-nk)+0.221*lg(D.h))-450;
    if(isFinite(bf) && bf>2 && bf<70) mBody+='<div class="fmr"><span>'+L2("Lemak badan (kaedah US Navy)","Body fat (US Navy method)")+'</span><b>'+bf.toFixed(1)+'%</b></div>'; }
  h+='<div class="card"><h3>📏 '+L2("Ukuran badan","Body measures")+'</h3><div class="fgrid3"><label>'+L2("Pinggang","Waist")+'<input type="number" data-hm="waist" value="'+(wa||"")+'" placeholder="cm"></label><label>'+L2("Pinggul","Hip")+'<input type="number" data-hm="hip" value="'+(hp||"")+'" placeholder="cm"></label><label>'+L2("Leher","Neck")+'<input type="number" data-hm="neck" value="'+(nk||"")+'" placeholder="cm"></label></div>'+
    (mBody||'<div class="mut tiny">'+L2("Ukur pinggang di paras pusat, pinggul di bahagian paling lebar, leher di bawah halkum.","Measure the waist at the navel, the hips at the widest point, the neck below the Adam\'s apple.")+'</div>')+'</div>';
  // weight trend
  var wk=Object.keys(D.wl).sort().slice(-60);
  h+='<div class="card"><h3>📉 '+L2("Trend berat","Weight trend")+'</h3>'+(wk.length>1?wChart(wk):'<div class="mut small">'+L2("Kemas kini berat anda dari semasa ke semasa untuk melihat graf.","Update your weight now and then to see a chart.")+'</div>')+
    '<div class="row" style="margin-top:6px"><span class="small">'+L2("Berat sasaran","Target weight")+'</span><input type="number" data-hm="goalW" value="'+(hm.goalW||"")+'" placeholder="kg" class="ftnum2"></div></div>';
  // vitals
  var bp=D.bp.slice(-4).reverse(), glu=D.gl.slice(-4).reverse();
  h+='<div class="card"><h3>🩺 '+L2("Tekanan darah","Blood pressure")+'</h3><div class="fgrid3"><label>'+L2("Sistolik","Systolic")+'<input type="number" id="bpS" placeholder="120"></label><label>'+L2("Diastolik","Diastolic")+'<input type="number" id="bpD" placeholder="80"></label><label>'+L2("Nadi","Pulse")+'<input type="number" id="bpP" placeholder="72"></label></div><button class="btn alt full g3d" id="bpOk" style="margin-top:6px">＋ '+L2("Rekod","Record")+'</button>'+
    bp.map(function(x){ var c=bpCat(x.s,x.d); return '<div class="fmr"><span>'+new Date(x.t).toLocaleDateString(H.locTag?H.locTag():undefined,{day:"numeric",month:"short"})+'</span><b class="fbc '+c[0]+'">'+x.s+'/'+x.d+(x.p?' · ♥'+x.p:'')+' · '+c[1]+'</b><button class="chip" data-bpx="'+x.t+'">✕</button></div>'; }).join("")+
    '<div class="mut tiny">'+L2("Kategori CPG Hipertensi Malaysia (2018). ≥140/90 berulang kali: jumpa doktor.","Malaysian Hypertension CPG (2018) categories. ≥140/90 again and again: see a doctor.")+'</div></div>';
  h+='<div class="card"><h3>🩸 '+L2("Gula dalam darah","Blood sugar")+'</h3><div class="row"><input type="number" id="glV" placeholder="mmol/L" step="0.1" class="ftnum2"><span class="seg">'+[["f",L2("Puasa","Fasting")],["r",L2("Rawak","Random")]].map(function(x,i){ return '<button class="'+(i===0?"on":"")+'" data-glk="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</span></div><button class="btn alt full g3d" id="glOk" style="margin-top:6px">＋ '+L2("Rekod","Record")+'</button>'+
    glu.map(function(x){ var c=glCat(x.v,x.k); return '<div class="fmr"><span>'+new Date(x.t).toLocaleDateString(H.locTag?H.locTag():undefined,{day:"numeric",month:"short"})+' · '+(x.k==="f"?L2("puasa","fasting"):L2("rawak","random"))+'</span><b class="fbc '+c[0]+'">'+x.v+' · '+c[1]+'</b><button class="chip" data-glx="'+x.t+'">✕</button></div>'; }).join("")+
    '<div class="mut tiny">'+L2("Puasa: normal 3.9–6.0, prediabetes 6.1–6.9, diabetes ≥7.0 mmol/L (CPG Diabetes Malaysia).","Fasting: normal 3.9–6.0, prediabetes 6.1–6.9, diabetes ≥7.0 mmol/L (Malaysian Diabetes CPG).")+'</div></div>';
  // sleep
  var sl=D.sl[t]||"", sk=Object.keys(D.sl).sort().slice(-7), avg=sk.length?sk.reduce(function(s,k){ return s+(+D.sl[k]||0); },0)/sk.length:0;
  h+='<div class="card"><h3>🌙 '+L2("Tidur","Sleep")+'</h3><div class="row"><span class="small">'+L2("Jam tidur malam tadi","Hours slept last night")+'</span><input type="number" id="slH" value="'+sl+'" step="0.5" min="0" max="16" class="ftnum2"></div>'+
    (avg?'<div class="small" style="margin-top:6px">'+L2("Purata 7 rekod: ","Average of 7 records: ")+'<b>'+avg.toFixed(1)+L2(" jam"," h")+'</b> '+(avg>=7&&avg<=9?"✅":"⚠")+'</div>':'')+'<div class="mut tiny">'+L2("Dewasa perlu 7–9 jam. Tidur awal memudahkan bangun Subuh dan tahajud.","Adults need 7–9 hours. Sleeping early makes Subuh and tahajjud easier.")+'</div></div>';
  // steps
  var sp=H.steps?H.steps():null;
  if(sp!=null) h+='<div class="card"><h3>🚶 '+L2("Langkah hari ini","Steps today")+'</h3><div class="ubig">'+sp.toLocaleString()+'</div><div class="mut tiny">≈ '+Math.round(sp*0.04*kg()/70)+' kcal · '+L2("Butiran di Kalendar › Statistik","Details in Calendar › Stats")+'</div></div>';
  h+='<div class="card fnote"><h3>🤲 '+L2("Niat kerana Allah","Intend it for Allah")+'</h3><p class="small" style="line-height:1.55">'+L2("“Mukmin yang kuat lebih baik dan lebih dicintai Allah daripada mukmin yang lemah, dan pada kedua-duanya ada kebaikan.” (Riwayat Muslim, no. 2664)","“The strong believer is better and more beloved to Allah than the weak believer, and there is good in both.” (Muslim, no. 2664)")+'</p>'+
    '<ul class="small fnl"><li>'+L2("Bersenam dengan pakaian yang menutup aurat dan longgar.","Exercise in loose clothing that covers the aurah.")+'</li><li>'+L2("Jangan sampai terlepas waktu solat. Rehat antara set boleh diisi dengan zikir.","Don\'t let it make you miss a prayer. Fill rests between sets with zikir.")+'</li><li>'+L2("Bulan Ramadan: senaman ringan sebelum berbuka atau selepas tarawih.","In Ramadan: light exercise before iftar or after tarawih.")+'</li></ul>'+
    '<div class="mut tiny">'+L2("Rujukan hadis perlu semakan ustaz. Maklumat kesihatan di sini panduan umum, bukan nasihat perubatan. Jumpa doktor jika sakit dada, pening atau sesak nafas.","Hadith reference pending ustaz review. The health information here is general guidance, not medical advice. See a doctor for chest pain, dizziness or breathlessness.")+'</div></div>';
  box.innerHTML=h;
  box.querySelectorAll("[data-hsx]").forEach(function(b){ b.onclick=function(){ D.sex=b.getAttribute("data-hsx"); sv(); draw(); }; });
  box.querySelectorAll("[data-hp]").forEach(function(i){ i.onchange=function(){ var k=i.getAttribute("data-hp"), v=parseFloat(i.value); D[k]=isFinite(v)&&v>0?v:null; if(k==="w" && D.w) D.wl[ymd()]=D.w; sv(); draw(); }; });
  var pg=box.querySelector("#plsGo"); if(pg) pg.onclick=function(){ var run=function(){ IbPulse.open(H, function(b){ D.hm=D.hm||{}; D.hm.rhr=b; D.hm.pl=(D.hm.pl||[]).concat([{d:ymd(), b:b}]).slice(-60); sv(); draw(); H.toast("❤️ "+b+" BPM"); }); }; if(window.IbPulse) run(); else H.loadJs(["fit/pulse.js"], run, function(){}); };
  box.querySelectorAll("[data-hm]").forEach(function(i){ i.onchange=function(){ var v=parseFloat(i.value); D.hm[i.getAttribute("data-hm")]=isFinite(v)&&v>0?v:null; sv(); draw(); }; });
  box.querySelector("#hAct").onchange=function(){ D.act=+this.value; sv(); draw(); };
  box.querySelector("#hGoal").onchange=function(){ D.goal=this.value; sv(); draw(); };
  box.querySelector("#wP").onclick=function(){ D.water[t]=(D.water[t]||0)+1; sv(); H.N.vibrate && H.N.vibrate(20); draw(); };
  box.querySelector("#wM").onclick=function(){ D.water[t]=Math.max(0,(D.water[t]||0)-1); sv(); draw(); };
  box.querySelector("#bpOk").onclick=function(){ var s=+box.querySelector("#bpS").value, d=+box.querySelector("#bpD").value, p=+box.querySelector("#bpP").value; if(!(s>50&&s<260&&d>30&&d<200)){ H.toast(L2("Masukkan bacaan yang betul","Enter a valid reading")); return; } D.bp.push({t:Date.now(), s:s, d:d, p:p||null}); sv(); draw(); };
  var gk="f"; box.querySelectorAll("[data-glk]").forEach(function(b){ b.onclick=function(){ gk=b.getAttribute("data-glk"); box.querySelectorAll("[data-glk]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  box.querySelector("#glOk").onclick=function(){ var v=parseFloat(box.querySelector("#glV").value); if(!(v>1&&v<40)){ H.toast(L2("Masukkan bacaan yang betul","Enter a valid reading")); return; } D.gl.push({t:Date.now(), v:v, k:gk}); sv(); draw(); };
  box.querySelectorAll("[data-bpx]").forEach(function(b){ b.onclick=function(){ var t0=+b.getAttribute("data-bpx"); D.bp=D.bp.filter(function(x){ return x.t!==t0; }); sv(); draw(); }; });
  box.querySelectorAll("[data-glx]").forEach(function(b){ b.onclick=function(){ var t0=+b.getAttribute("data-glx"); D.gl=D.gl.filter(function(x){ return x.t!==t0; }); sv(); draw(); }; });
  box.querySelector("#slH").onchange=function(){ var v=parseFloat(this.value); if(isFinite(v)&&v>0) D.sl[t]=v; else delete D.sl[t]; sv(); draw(); };
}
function bpCat(s,d){ if(s>=180||d>=110) return ["high",L2("Tahap 3","Stage 3")]; if(s>=160||d>=100) return ["high",L2("Tahap 2","Stage 2")]; if(s>=140||d>=90) return ["mid",L2("Tahap 1","Stage 1")]; if(s>=130||d>=85) return ["mid",L2("Normal tinggi","High normal")]; if(s>=120||d>=80) return ["ok","Normal"]; return ["ok",L2("Optimum","Optimal")]; }
function glCat(v,k){ if(k==="f"){ if(v<3.9) return ["low",L2("Rendah","Low")]; if(v<6.1) return ["ok","Normal"]; if(v<7) return ["mid","Prediabetes"]; return ["high",L2("Tinggi (diabetes?)","High (diabetes?)")]; }
  if(v<3.9) return ["low",L2("Rendah","Low")]; if(v<7.8) return ["ok","Normal"]; if(v<11.1) return ["mid",L2("Tinggi","High")]; return ["high",L2("Sangat tinggi","Very high")]; }
function wChart(keys){
  var v=keys.map(function(k){ return D.wl[k]; }), g=D.hm.goalW, mn=Math.min.apply(null,v.concat(g?[g]:[]))-1, mx=Math.max.apply(null,v.concat(g?[g]:[]))+1, W=300, Hh=110;
  var x=function(i){ return 8+i*(W-16)/Math.max(1,v.length-1); }, y=function(w){ return 8+(mx-w)*(Hh-16)/(mx-mn); };
  var pts=v.map(function(w,i){ return x(i).toFixed(1)+","+y(w).toFixed(1); }).join(" ");
  var d=v[v.length-1]-v[0];
  return '<svg viewBox="0 0 '+W+' '+Hh+'" class="fwc">'+(g?'<line x1="0" x2="'+W+'" y1="'+y(g)+'" y2="'+y(g)+'" class="fwg"/>':'')+'<polyline points="'+pts+'" class="fwl"/>'+v.map(function(w,i){ return '<circle cx="'+x(i)+'" cy="'+y(w)+'" r="2.6" class="fwp"/>'; }).join("")+'</svg>'+
    '<div class="mut tiny">'+keys[0]+' → '+keys[keys.length-1]+' · '+(d>0?"+":"")+d.toFixed(1)+' kg'+(g?' · '+L2("sasaran ","target ")+g+' kg':'')+'</div>'; }

// ---------- player: work timer and rest breaks ----------
var PL=null;
function play(s){
  if(!s || !s.mv || !s.mv.length) return;
  initMV(); H.closeOverlay(); if(PL) stop(false);
  var st=steps(s), L=lvl(s.lvl), ov=document.getElementById("overlay");
  ov.className="fitov"; ov.classList.remove("hidden");
  ov.innerHTML='<div class="fpTop"><button class="fpB" id="fpX">✕</button><div class="fpBar" id="fpBar"></div><button class="fpB" id="fpV">'+(D.voice?"🔊":"🔇")+'</button></div>'+
    '<div class="fpTitle" id="fpT"></div><div class="fpStage" id="fpStage"><div class="fpPh" id="fpPh"></div><div class="fpRing"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="fpr0"/><circle cx="50" cy="50" r="44" class="fpr1" id="fpRing"/></svg><b id="fpTime">0:00</b></div></div>'+
    '<div class="fpInfo"><div class="fpName" id="fpName"></div><div class="fpHow" id="fpHow"></div><div class="fpNext" id="fpNext"></div><div class="fpStat" id="fpStat"></div></div>'+
    '<div class="fpCtl"><button class="fpB" id="fpPrev">⏮</button><button class="fpB fpPlay" id="fpPlay">⏸</button><button class="fpB" id="fpNx">⏭</button><button class="fpB" id="fpAdd">+10s</button></div>';
  var stage=ov.querySelector("#fpStage"), box=document.createElement("div"); box.className="fpFig"; stage.insertBefore(box, stage.firstChild);
  var f3=Fit3D.mount(box,{sex:D.sex, col:D.col, move:"idle", autoYaw:1, tempo:L.tempo, dist:4.4});
  PL={s:s, st:st, i:0, left:st[0].sec, run:true, t:Date.now(), act:0, kcal:0, f3:f3, ov:ov, last:-1, done:false};
  try{ H.N.keepScreenOn && H.N.keepScreenOn(true); }catch(e){}
  var bar=ov.querySelector("#fpBar"); bar.innerHTML=st.map(function(x){ return '<i class="'+x.k+'" style="flex:'+x.sec+'"></i>'; }).join("");
  ov._close=function(){ stop(true); };
  ov.querySelector("#fpX").onclick=function(){ stop(true); };
  ov.querySelector("#fpV").onclick=function(){ D.voice=!D.voice; sv(); this.textContent=D.voice?"🔊":"🔇"; };
  ov.querySelector("#fpPlay").onclick=function(){ PL.run=!PL.run; PL.t=Date.now(); this.textContent=PL.run?"⏸":"▶"; if(PL.f3) PL.f3.pause(!PL.run); };
  ov.querySelector("#fpNx").onclick=function(){ go(PL.i+1); };
  ov.querySelector("#fpPrev").onclick=function(){ go(PL.left<st[PL.i].sec-3?PL.i:Math.max(0,PL.i-1)); };
  ov.querySelector("#fpAdd").onclick=function(){ PL.left+=10; st[PL.i].sec+=10; };
  go(0);
  PL.iv=setInterval(tick, 200);
}
var CUES=[function(){ return L2("Separuh jalan. Bernafas dengan tenang.","Halfway. Breathe steadily."); }, function(){ return L2("Kemaskan otot perut.","Keep your core tight."); },
  function(){ return L2("Belakang lurus, bahu rileks.","Back straight, shoulders relaxed."); }, function(){ return L2("Mendarat dengan lembut.","Land softly."); },
  function(){ return L2("Ikut rentak sendiri. Perlahan pun tidak mengapa.","Go at your own pace. Slower is fine."); }, function(){ return L2("Bagus! Kekalkan gerakan.","Great, keep it up!"); },
  function(){ return L2("Minum air bila rehat nanti.","Drink some water at the next rest."); }];
function say(t){ if(!D.voice) return; try{ if(window.Native && H.N.speak) H.N.speak(t, en()?"en":"ms"); else if(window.speechSynthesis){ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(t); u.lang=en()?"en-GB":"ms-MY"; speechSynthesis.speak(u); } }catch(e){} }
function buzz(ms){ try{ H.N.vibrate && H.N.vibrate(ms); }catch(e){} }
function go(i){
  var P=PL; if(!P) return; if(i>=P.st.length){ finish(); return; }
  P.i=i; var x=P.st[i], m=MV[x.id], ov=P.ov, nx=P.st[i+1];
  P.left=x.sec; P.t=Date.now();
  var kL={ready:L2("BERSEDIA","GET READY"), warm:L2("PANASKAN BADAN","WARM-UP"), work:L2("GERAK","WORK"), rest:L2("REHAT","REST"), rr:L2("REHAT PUSINGAN","ROUND BREAK"), cool:L2("SEJUKKAN BADAN","COOL-DOWN")}[x.k];
  ov.className="fitov k-"+x.k;
  ov.querySelector("#fpPh").textContent=kL;
  ov.querySelector("#fpT").textContent=P.s.n+(x.r?" · "+L2("Pusingan ","Round ")+x.r+"/"+P.s.rounds:"");
  var rest=x.k==="rest"||x.k==="rr"||x.k==="ready";
  ov.querySelector("#fpName").textContent=(rest?L2("Seterusnya: ","Next: "):"")+nm(m);
  ov.querySelector("#fpHow").textContent=L2(m.hms,m.hen);
  ov.querySelector("#fpNext").textContent=!rest && nx?(L2("Selepas ini: ","After this: ")+(nx.k==="rest"||nx.k==="rr"?L2("rehat ","rest ")+nx.sec+"s":nm(MV[nx.id]))):"";
  if(P.f3){ P.f3.setMove(rest?(x.k==="ready"?x.id:"idle"):x.id, lvl(P.s.lvl).tempo*(x.k==="warm"||x.k==="cool"?0.8:1)); if(rest && x.k!=="ready") setTimeout(function(){ if(PL===P && P.i===i && P.f3) P.f3.setMove(x.id, 0.6); }, 1200); }
  [].forEach.call(ov.querySelectorAll("#fpBar i"), function(b,j){ b.className=P.st[j].k+(j<i?" past":j===i?" now":""); });
  if(i>0) buzz(x.k==="work"?300:150);
  // 0.5.23 (Nike Training Club style): voice coaching reads the first line of how to do the move, then form cues mid-move
  var how1=String(L2(m.hms,m.hen)||"").split(/(?<=[.!?])\s/)[0]||""; P.cue=0;
  say(x.k==="work"?nm(m)+". "+how1:x.k==="ready"?L2("Bersedia. ","Get ready. ")+nm(m)+". "+how1:x.k==="rest"||x.k==="rr"?L2("Rehat. Seterusnya, ","Rest. Next, ")+nm(m):x.k==="warm"?nm(m):nm(m));
  P.last=-1; paint();
}
function tick(){
  var P=PL; if(!P || P.done) return; if(!document.body.contains(P.ov) || P.ov.classList.contains("hidden")){ stop(false); return; }
  var now=Date.now(), dt=(now-P.t)/1000; P.t=now; if(!P.run) return;
  var x=P.st[P.i], m=MV[x.id]; P.left-=dt;
  if(x.k!=="ready"){ P.act+=dt; P.kcal+=kcal(x.k==="work"?m.met*lvl(P.s.lvl).metF:(x.k==="warm"||x.k==="cool")?2.8:1.8, dt); }
  var sec=Math.ceil(P.left); if(sec!==P.last){ P.last=sec; if(sec<=3 && sec>0){ buzz(60); if(D.voice && sec<=3 && P.st[P.i+1]) say(String(sec)); }
    if(x.k==="work" && D.voice){ var half=Math.round(x.sec/2);
      if(P.cue===0 && x.sec>=20 && sec===half){ P.cue=1; say(CUES[(P.i*7+(m.l||1))%CUES.length]()); }
      else if(P.cue<2 && x.sec>=25 && sec===10){ P.cue=2; say(L2("Sepuluh saat lagi, teruskan!","Ten seconds left, keep going!")); } }
    paint(); }
  if(P.left<=0) go(P.i+1);
}
function paint(){ var P=PL; if(!P) return; var x=P.st[P.i], ov=P.ov; ov.querySelector("#fpTime").textContent=mmss(Math.max(0,P.left));
  var c=ov.querySelector("#fpRing"), L=2*Math.PI*44; c.style.strokeDasharray=L; c.style.strokeDashoffset=L*(1-Math.max(0,P.left)/x.sec);
  ov.querySelector("#fpStat").textContent="⏱ "+mmss(P.act)+" · 🔥 "+Math.round(P.kcal)+" kcal"; }
function save_(full){ var P=PL; if(!P || P.saved) return; P.saved=true; var w=P.st.filter(function(x,j){ return x.k==="work" && j<P.i+(full?1:0); }).length;
  addLog({k:"w", n:P.s.n, ic:P.s.ic||"💪", min:r1(P.act/60), kcal:Math.round(P.kcal), mv:w, pl:full||P.act>=0.6*est(P.s).sec?P.s.pl:undefined, lv:P.s.lvl}); }
function finish(){
  var P=PL; if(!P) return; P.done=true; clearInterval(P.iv); save_(true); buzz(700);
  say(L2("Alhamdulillah, senaman selesai.","Alhamdulillah, workout complete."));
  if(P.f3) P.f3.setMove("breath",1);
  var info=P.ov.querySelector(".fpInfo"); P.ov.className="fitov k-done";
  P.ov.querySelector("#fpPh").textContent=L2("SELESAI","DONE"); P.ov.querySelector("#fpTime").textContent="✓";
  info.innerHTML='<div class="fpName">🎉 '+L2("Alhamdulillah, selesai!","Alhamdulillah, all done!")+'</div><div class="fpDone"><div><b>'+mmss(P.act)+'</b><small>'+L2("masa","time")+'</small></div><div><b>'+Math.round(P.kcal)+'</b><small>kcal</small></div><div><b>'+P.st.filter(function(x){ return x.k==="work"; }).length+'</b><small>'+L2("set","sets")+'</small></div></div><div class="fpHow">'+L2("Rekod disimpan dalam Jejak. Minum air dan regangkan badan.","Saved in the Tracker. Drink some water and stretch.")+'</div>';
  P.ov.querySelector(".fpCtl").innerHTML='<button class="btn gold g3d" id="fpOk">✓ '+L2("Tutup","Close")+'</button>';
  P.ov.querySelector("#fpOk").onclick=function(){ stop(false); };
}
function stop(ask){
  var P=PL; if(!P) return; clearInterval(P.iv);
  if(!P.done && P.act>=60) { save_(false); H.toast(L2("Disimpan: ","Saved: ")+Math.round(P.act/60)+" min, "+Math.round(P.kcal)+" kcal"); }
  PL=null; try{ H.N.keepScreenOn && H.N.keepScreenOn(false); }catch(e){} try{ if(H.N.stopSpeak) H.N.stopSpeak(); }catch(e){}
  if(P.f3) P.f3.dispose(); H.closeOverlay(); draw();
}

// the Home widget reads this without loading the page
window.FitView={view:view, play:play, open:function(p){ if(p) page=p; },
  navGet:function(){ return {pg:page, k:page+(planEdit?"e":"")}; }, navSet:function(o){ page=o.pg||"body"; },
  remSync:function(h){ H=H||h; L2=L2||h.L2x; E=E||h.esc; initMV(); ld(); remSync(); }};
})();
