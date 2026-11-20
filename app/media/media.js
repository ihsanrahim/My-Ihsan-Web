/* My Ihsan 0.9.0: Islamic radio + podcasts, with a background player (native PlayerService) and a "now playing" screen.
   Radio list: radio-browser.info (free, community run). Podcast search: Apple Podcasts / iTunes Search API (free, no key).
   Transcripts ("lyrics") come from the feed's <podcast:transcript> tag when the publisher provides one. */
(function(){
"use strict";
var H=window.IBH; if(!H) return;
var N=H.N, esc=H.esc, L2x=H.L2x, en=H.en;
var NATIVE=!!(window.Native && window.Native.playerPlay);

// ---------- storage ----------
var POD=H.load("ihsan_pod",{subs:[],pos:{},done:{},last:null,seen:{}});
["subs","pos","done","seen"].forEach(function(k){ if(!POD[k]) POD[k]=k==="subs"?[]:{}; });
var RFAV=H.load("ihsan_radio_fav",[]);
function savePod(){ H.save("ihsan_pod",POD); }
var M={ st:{st:"idle"}, cur:POD.last||null, page:{rf:"all", rq:"", rn:60, tab:POD.subs.length?"subs":"speakers", lang:"all", sp:null, show:null, sq:""},
  radio:null, rLoading:false, rErr:"", feeds:{}, search:{}, sleepAt:0, tr:{}, ptab:"tr", ovOpen:false, lastSave:0 };

function safeUrl(u){ u=String(u||"").trim(); return /^https?:\/\//i.test(u)?u:""; }
function fmtT(ms){ var s=Math.max(0,Math.floor((ms||0)/1000)), h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h?h+":"+(m<10?"0":"")+m:m)+":"+(x<10?"0":"")+x; }
function artImg(u, cls, ic){ u=safeUrl(u); return u?'<img class="'+cls+'" src="'+esc(u)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML=\'<span class=&quot;'+cls+' noart&quot;>'+(ic||"🎙")+'</span>\'">':'<span class="'+cls+' noart">'+(ic||"🎙")+'</span>'; }
function flag(cc){ cc=String(cc||"").toUpperCase(); if(!/^[A-Z]{2}$/.test(cc)) return "🌐"; return String.fromCodePoint(127397+cc.charCodeAt(0))+String.fromCodePoint(127397+cc.charCodeAt(1)); }

// ---------- player (native service, or <audio> in a browser preview) ----------
var P;
if(NATIVE){
  P={ play:function(o){ o.en=en(); N.playerPlay(JSON.stringify(o)); }, cmd:function(c,v){ N.playerCmd(c, Math.round(v||0)); },
      state:function(){ try{ return JSON.parse(N.playerState()); }catch(e){ return {st:"idle"}; } } };
} else {
  var A=new Audio(), meta={}, wst="idle";
  A.addEventListener("playing",function(){ wst="playing"; }); A.addEventListener("pause",function(){ if(wst!=="idle") wst="paused"; });
  A.addEventListener("waiting",function(){ wst="loading"; }); A.addEventListener("error",function(){ if(wst!=="idle") wst="error"; }); A.addEventListener("ended",function(){ wst="ended"; });
  P={ play:function(o){ meta=o; wst="loading"; A.src=o.url; A.playbackRate=1; try{ A.currentTime=(o.start||0)/1000; }catch(e){} A.play().catch(function(){ wst="error"; }); },
      cmd:function(c,v){ if(c==="toggle"){ if(A.paused){ A.play().catch(function(){}); } else A.pause(); } else if(c==="pause") A.pause(); else if(c==="resume") A.play().catch(function(){});
        else if(c==="stop"){ A.pause(); A.removeAttribute("src"); wst="idle"; meta={}; } else if(c==="seek") A.currentTime=v/1000; else if(c==="skip") A.currentTime=Math.max(0,A.currentTime+v/1000); else if(c==="speed") A.playbackRate=v/100; },
      state:function(){ return {st:wst, url:meta.url||"", title:meta.title||"", artist:meta.artist||"", art:meta.art||"", icy:"", key:meta.key||"", live:!!meta.live,
        pos:Math.round((A.currentTime||0)*1000), dur:meta.live||!isFinite(A.duration)?0:Math.round(A.duration*1000), speed:A.playbackRate||1}; } };
}
function playing(){ return M.st.st==="playing"||M.st.st==="loading"; }

function playRadio(s){
  M.cur={kind:"radio", key:"r:"+s.id, title:s.n, artist:[flag(s.cc)+" "+(s.country||s.cc||""), (s.tags||[]).slice(0,3).join(", ")].filter(Boolean).join(" · "), art:s.fav, url:s.u0||s.url, live:true, st:s};
  POD.last=M.cur; savePod();
  // 0.9.1: play the station's own URL first (the "resolved" one can hold an expired token), resolved URL as backup
  P.play({url:s.u0||s.url, alt:s.u0&&s.u0!==s.url?s.url:"", title:s.n, artist:M.cur.artist, art:safeUrl(s.fav), live:true, start:0, key:M.cur.key});
  // radio-browser asks apps to report a click so popular stations rank higher
  H.fetch(RADIO_SERVERS[0]+"/json/url/"+encodeURIComponent(s.id), function(){});
  M.st={st:"loading", key:M.cur.key, title:s.n, live:true}; mini(); openPlayer();
}
function playEp(ep, show){
  var key="p:"+ep.g, start=(POD.pos[key]||0)*1000; if(POD.done[key]) start=0;
  M.cur={kind:"pod", key:key, title:ep.t, artist:show.t, art:ep.img||show.img, url:ep.u, live:false, ep:slimEp(ep, 12000), show:{t:show.t, img:show.img, feed:show.feed, a:show.a}};
  POD.last=M.cur; savePod();
  P.play({url:ep.u, title:ep.t, artist:show.t, art:safeUrl(ep.img||show.img), live:false, start:Math.max(0,start-3000), key:key});
  M.st={st:"loading", key:key, title:ep.t, live:false}; M.tr={}; M.ptab=ep.tr&&ep.tr.length?"tr":"notes"; mini(); openPlayer();
}
function slimEp(ep, n){ var o={}; for(var k in ep) o[k]=ep[k]; if(o.desc && o.desc.length>n) o.desc=o.desc.slice(0,n)+"…"; return o; }

// ---------- poll loop ----------
function tick(){
  var s=P.state(); M.st=s;
  if(s.st!=="idle" && (!M.cur || M.cur.key!==s.key) && POD.last && POD.last.key===s.key) M.cur=POD.last;
  if(M.cur && M.cur.kind==="pod" && s.key===M.cur.key && s.dur>0){
    var now=Date.now();
    if(s.st==="playing" && now-M.lastSave>5000){ M.lastSave=now; POD.pos[s.key]=Math.floor(s.pos/1000); if(s.pos>s.dur-30000) POD.done[s.key]=1; savePod(); }
    if(s.st==="ended" && !POD.done[s.key]){ POD.done[s.key]=1; delete POD.pos[s.key]; savePod(); }
  }
  if(M.sleepAt && Date.now()>=M.sleepAt){ M.sleepAt=0; P.cmd("pause"); H.toast(L2x("Pemasa tidur: dijeda","Sleep timer: paused")); }
  mini(); if(M.ovOpen) updPlayer();
}
setInterval(tick, 1000);

// ---------- mini player bar (above the bottom nav, on every page) ----------
var miniSig="";
function mini(){
  var el=document.getElementById("mini"); if(!el) return;
  var s=M.st, on=s.st!=="idle" && !!s.key, ov=document.getElementById("overlay");
  var hideOv=ov && !ov.classList.contains("hidden") && /theme-/.test(ov.className); // rakaat counter is open
  if(!on || hideOv){ if(!el.classList.contains("hidden")){ el.classList.add("hidden"); el.innerHTML=""; miniSig=""; H.dockFix(); } return; }
  var isQ=/^q:/.test(s.key||""), c=isQ?{}:(M.cur||{}), sub=s.live&&s.icy?s.icy:(isQ?s.artist:(c.artist||s.artist||"")), sig=[s.key,s.st,sub,s.title].join("|");
  var pct=!s.live&&s.dur?Math.min(100,s.pos*100/s.dur):0;
  if(sig!==miniSig){ miniSig=sig;
    el.innerHTML='<div class="mnp" style="width:'+pct.toFixed(1)+'%"></div>'+artImg(isQ?"":(c.art||s.art),"mna",isQ?"📖":s.live?"📻":"🎙")+'<div class="mnt" data-mopen="1"><b>'+esc(s.title||c.title||"")+'</b><span>'+(s.st==="loading"?"⏳ ":s.st==="error"?"⚠️ ":"")+esc(sub)+'</span></div>'+
      '<button class="mnb" data-mtog="1" aria-label="play/pause">'+(playing()?"⏸":"▶")+'</button><button class="mnb x" data-mstop="1" aria-label="stop">✕</button>';
    el.onclick=function(e){ if(e.target.closest("[data-mtog]")){ P.cmd("toggle"); setTimeout(tick,250); return; } if(e.target.closest("[data-mstop]")){ P.cmd("stop"); M.sleepAt=0; setTimeout(tick,150); return; } if(/^q:/.test((M.st||{}).key||"") && window.openQuran){ window.openQuran(true); return; } openPlayer(); };
  } else { var p=el.querySelector(".mnp"); if(p) p.style.width=pct.toFixed(1)+"%"; }
  if(el.classList.contains("hidden")){ el.classList.remove("hidden"); H.dockFix(); }
}

// ---------- now playing screen ----------
function openPlayer(){
  var c=M.cur; if(!c){ H.toast(L2x("Tiada apa-apa sedang dimainkan","Nothing is playing")); return; }
  var ov=document.getElementById("overlay"); ov.className="playerov"; M.ovOpen=true;
  var live=c.live, ep=c.ep||{}, fav=live&&RFAV.some(function(x){ return x.id===c.st.id; });
  ov.innerHTML='<div class="npl"><div class="npTop"><button class="chip" id="npX" aria-label="close">⌄</button><span class="mut small">'+(live?L2x("Radio langsung","Live radio"):"Podcast")+'</span><span style="width:40px"></span></div>'+
    '<div class="npArt">'+artImg(c.art,"npImg",live?"📻":"🎙")+'</div>'+
    '<div class="npTi"><b id="npT">'+esc(c.title)+'</b><span id="npA">'+esc(c.artist||"")+'</span></div>'+
    (live?'<div class="npLive"><span class="ldot"></span> '+L2x("LANGSUNG","LIVE")+' <span id="npIcy"></span></div>':
      '<div class="npSeek"><input type="range" id="npR" min="0" max="1000" value="0"><div class="row tiny mut"><span id="npP">0:00</span><span id="npD">--:--</span></div></div>')+
    '<div class="npC">'+(live?'':'<button class="npb" data-np="back" aria-label="back 15 seconds">↺<small>15</small></button>')+'<button class="npb big" data-np="tog" id="npPlay" aria-label="play/pause">▶</button>'+(live?'<button class="npb" data-np="stop" aria-label="stop">⏹</button>':'<button class="npb" data-np="fwd" aria-label="forward 30 seconds">↻<small>30</small></button>')+'</div>'+
    '<div class="npO">'+(live?'<button class="chip'+(fav?' on':'')+'" data-np="fav">'+(fav?"★":"☆")+' '+L2x("Kegemaran","Favourite")+'</button>':'<button class="chip" data-np="speed" id="npSp">1×</button>')+
      '<button class="chip" data-np="sleep" id="npSl">🌙 '+L2x("Pemasa tidur","Sleep timer")+'</button>'+(!live&&c.show&&c.show.feed?'<button class="chip" data-np="show">📂 '+L2x("Semua episod","All episodes")+'</button>':'')+'<button class="chip" data-np="stop2">⏹ '+L2x("Henti","Stop")+'</button></div>'+
    '<div class="npTabs"><button class="'+(M.ptab==="tr"?"on":"")+'" data-pt="tr">📝 '+L2x("Teks / lirik","Lyrics / transcript")+'</button><button class="'+(M.ptab==="notes"?"on":"")+'" data-pt="notes">ℹ️ '+(live?L2x("Stesen","Station"):L2x("Nota episod","Show notes"))+'</button></div>'+
    '<div class="npPane" id="npPane"></div></div>';
  ov.classList.remove("hidden");
  ov._close=function(){ M.ovOpen=false; H.closeOverlay(); H.render(); };
  ov.querySelector("#npX").onclick=ov._close;
  ov.onclick=function(e){ var b=e.target.closest("[data-np]"), t=e.target.closest("[data-pt]"), q=e.target.closest("[data-cue]");
    if(t){ M.ptab=t.getAttribute("data-pt"); ov.querySelectorAll("[data-pt]").forEach(function(x){ x.classList.toggle("on",x===t); }); pane(); return; }
    if(q){ P.cmd("seek", +q.getAttribute("data-cue")); M.trUser=0; return; }
    if(!b) return; var a=b.getAttribute("data-np");
    if(a==="tog"){ if(M.st.st==="idle" && M.cur){ if(M.cur.live) playRadio(M.cur.st); else replayCur(); return; } P.cmd("toggle"); }
    else if(a==="back") P.cmd("skip",-15000); else if(a==="fwd") P.cmd("skip",30000);
    else if(a==="stop"||a==="stop2"){ P.cmd("stop"); M.sleepAt=0; ov._close(); return; }
    else if(a==="speed"){ var S=[1,1.25,1.5,1.75,2,0.75], i=S.indexOf(+(M.st.speed||1).toFixed(2)); var nx=S[(i+1)%S.length]; P.cmd("speed",nx*100); b.textContent=nx+"×"; }
    else if(a==="sleep"){ var O=[0,15,30,45,60,90], cur=M.sleepAt?Math.round((M.sleepAt-Date.now())/60000):0, j=0; for(var k=0;k<O.length;k++) if(O[k]>cur){ j=k; break; } if(cur>=90) j=0;
      M.sleepAt=O[j]?Date.now()+O[j]*60000:0; H.toast(O[j]?L2x("Jeda selepas "+O[j]+" minit","Pause after "+O[j]+" min"):L2x("Pemasa tidur dimatikan","Sleep timer off")); }
    else if(a==="fav"){ toggleFav(M.cur.st); b.classList.toggle("on"); b.textContent=(b.classList.contains("on")?"★":"☆")+" "+L2x("Kegemaran","Favourite"); }
    else if(a==="show"){ var sh=M.cur.show; ov._close(); M.page.show={feed:sh.feed, t:sh.t, img:sh.img, a:sh.a}; M.page.tab="subs"; H.setLearn("podcast"); H.go("learn"); }
    setTimeout(tick,200);
  };
  var r=ov.querySelector("#npR");
  if(r){ r.oninput=function(){ M.seeking=true; var d=M.st.dur||0; ov.querySelector("#npP").textContent=fmtT(d*r.value/1000); };
    r.onchange=function(){ var d=M.st.dur||0; if(d) P.cmd("seek", d*r.value/1000); M.seeking=false; setTimeout(tick,200); }; }
  pane(); updPlayer();
}
function replayCur(){ var c=M.cur; P.play({url:c.url, title:c.title, artist:c.artist, art:safeUrl(c.art), live:false, start:(POD.pos[c.key]||0)*1000, key:c.key}); }
function updPlayer(){
  var ov=document.getElementById("overlay"); if(!ov.classList.contains("playerov")){ M.ovOpen=false; return; }
  var s=M.st, q=function(id){ return ov.querySelector(id); };
  if(q("#npPlay")) q("#npPlay").textContent=s.st==="loading"?"⏳":playing()?"⏸":"▶";
  if(q("#npIcy")) q("#npIcy").textContent=s.icy?"· "+s.icy:(s.st==="error"?"· "+L2x("Stesen tidak dapat dimainkan. Cuba stesen lain.","This station won't play. Try another one."):"");
  if(q("#npR") && !M.seeking){ q("#npR").value=s.dur?Math.round(s.pos*1000/s.dur):0; q("#npP").textContent=fmtT(s.pos); q("#npD").textContent=s.dur?fmtT(s.dur):"--:--"; }
  if(q("#npSp")) q("#npSp").textContent=(+(s.speed||1).toFixed(2))+"×";
  if(q("#npSl")) q("#npSl").textContent="🌙 "+(M.sleepAt?fmtT(M.sleepAt-Date.now()):L2x("Pemasa tidur","Sleep timer"));
  if(s.st==="error" && !s.live && q("#npT") && !M.errShown){ M.errShown=true; H.toast(L2x("Episod tidak dapat dimainkan","Episode could not be played")); }
  if(s.st!=="error") M.errShown=false;
  if(M.ptab==="tr") syncCues();
}
// ----- lyrics / transcript pane
function pane(){
  var el=document.getElementById("npPane"); if(!el) return; var c=M.cur, ep=c.ep||{};
  if(M.ptab==="notes"){
    if(c.live){ var st=c.st||{}; el.innerHTML='<div class="npN"><div><b>'+esc(st.n)+'</b></div><div class="mut small">'+flag(st.cc)+' '+esc(st.country||"")+(st.lang?' · '+esc(st.lang):'')+(st.br?' · '+st.br+' kbps':'')+(st.codec?' · '+esc(st.codec):'')+'</div>'+
      (st.tags&&st.tags.length?'<div class="chips" style="margin-top:6px">'+st.tags.slice(0,8).map(function(t){ return '<span class="chip">'+esc(t)+'</span>'; }).join("")+'</div>':'')+
      (safeUrl(st.home)?'<div style="margin-top:8px"><a href="#" data-home="1">🌐 '+L2x("Laman web stesen","Station website")+'</a></div>':'')+
      '<div class="mut tiny" style="margin-top:10px">'+L2x("Senarai dari radio-browser.info (direktori komuniti percuma). Kandungan stesen adalah tanggungjawab stesen itu sendiri.","Listing from radio-browser.info (free community directory). Each station is responsible for its own content.")+'</div></div>';
      var hm=el.querySelector("[data-home]"); if(hm) hm.onclick=function(e){ e.preventDefault(); N.openUrl(st.home); }; return; }
    el.innerHTML='<div class="npN"><div class="mut tiny">'+(ep.d?esc(new Date(ep.d).toLocaleDateString(H.locTag(),{day:"numeric",month:"long",year:"numeric"})):"")+(ep.du?' · '+H.durEn(ep.du):'')+'</div><div class="npDesc">'+(ep.desc?esc(ep.desc).replace(/\n/g,"<br>"):'<span class="mut">'+L2x("Tiada nota untuk episod ini.","No notes for this episode.")+'</span>')+'</div></div>';
    return;
  }
  if(c.live){ el.innerHTML='<div class="npN"><div class="npOnAir"><span class="mut tiny">'+L2x("Sedang ke udara","On air now")+'</span><b id="npIcy2">'+esc(M.st.icy||"—")+'</b></div><div class="mut small" style="margin-top:8px">'+L2x("Radio langsung tidak menyediakan lirik atau transkrip. Tajuk di atas muncul jika stesen menghantarnya.","Live radio does not come with lyrics or a transcript. The title above appears when the station sends one.")+'</div></div>'; return; }
  var tr=ep.tr||[];
  if(!tr.length){ el.innerHTML='<div class="npN"><b>'+L2x("Tiada transkrip untuk episod ini","No transcript for this episode")+'</b><div class="mut small" style="margin-top:6px">'+L2x("Penerbit podcast ini tidak menyertakan teks (tag podcast:transcript) dalam suapan RSS mereka. Lihat Nota episod untuk ringkasan.","This podcast's publisher does not include a text transcript (the podcast:transcript tag) in their RSS feed. See Show notes for a summary.")+'</div></div>'; return; }
  if(M.tr.key===c.key && M.tr.cues){ drawCues(el); return; }
  if(M.tr.key===c.key && M.tr.loading){ el.innerHTML='<div class="npN mut">⏳ '+L2x("Memuat transkrip…","Loading transcript…")+'</div>'; return; }
  var rank=function(t){ t=(t.ty||"")+" "+t.u; return /vtt/i.test(t)?0:/srt|subrip/i.test(t)?1:/json/i.test(t)?2:/html/i.test(t)?3:4; };
  var pick=tr.slice().sort(function(a,b){ return rank(a)-rank(b); })[0];
  M.tr={key:c.key, loading:true}; el.innerHTML='<div class="npN mut">⏳ '+L2x("Memuat transkrip…","Loading transcript…")+'</div>';
  H.fetch(pick.u, function(status, body){
    if(M.tr.key!==c.key) return;
    var cues=null; if(status>=200 && status<400) try{ cues=parseTranscript(body, pick); }catch(e){ cues=null; }
    M.tr={key:c.key, cues:cues||[], err:!cues};
    var e2=document.getElementById("npPane"); if(e2 && M.ptab==="tr") drawCues(e2);
  });
}
function tsec(s){ var p=String(s).trim().replace(",",".").split(":").map(parseFloat); var v=0; p.forEach(function(x){ v=v*60+(x||0); }); return v; }
function parseTranscript(body, t){
  var ty=((t.ty||"")+" "+t.u).toLowerCase(), b=String(body||"");
  if(/json/.test(ty) || /^\s*\{/.test(b)){ var j=JSON.parse(b), seg=j.segments||j.cues||[]; return seg.map(function(x){ return {s:+(x.startTime||x.start||0), e:+(x.endTime||x.end||0), t:String(x.body||x.text||""), sp:x.speaker||""}; }).filter(function(x){ return x.t; }); }
  if(/vtt|srt|subrip/.test(ty) || /-->/.test(b)){
    var out=[]; b.replace(/\r/g,"").split(/\n\s*\n/).forEach(function(blk){ var m=/((?:\d+:)?\d+:\d+[.,]\d+)\s*-->\s*((?:\d+:)?\d+:\d+[.,]\d+)[^\n]*\n([\s\S]+)/.exec(blk); if(!m) return;
      var txt=m[3].replace(/<v\s+([^>]+)>/g,"$1: ").replace(/<[^>]+>/g,"").trim(); if(txt) out.push({s:tsec(m[1]), e:tsec(m[2]), t:txt}); });
    // merge tiny cues (word-level files) into readable lines
    var mg=[]; out.forEach(function(c){ var l=mg[mg.length-1]; if(l && (l.t.length<60 && c.s-l.e<1.5) && !/[.?!]$/.test(l.t)){ l.t+=" "+c.t; l.e=c.e; } else mg.push({s:c.s,e:c.e,t:c.t}); });
    return mg;
  }
  var txt=b; if(/html/.test(ty) || /<\w+[^>]*>/.test(b)){ var d=new DOMParser().parseFromString(b,"text/html"); d.querySelectorAll("script,style").forEach(function(n){ n.remove(); }); txt=d.body?d.body.innerText||d.body.textContent:""; }
  return [{s:-1, e:-1, t:txt.trim()}];
}
function drawCues(el){
  var cs=M.tr.cues||[];
  if(M.tr.err || !cs.length){ el.innerHTML='<div class="npN"><b>'+L2x("Transkrip tidak dapat dibaca","Couldn't read the transcript")+'</b><div class="mut small">'+L2x("Fail transkrip penerbit tidak dapat dimuat atau formatnya tidak disokong.","The publisher's transcript file could not be loaded or its format is not supported.")+'</div></div>'; return; }
  var timed=cs[0].s>=0;
  el.innerHTML='<div class="cues'+(timed?'':' plain')+'" id="cues">'+(timed?'<div class="mut tiny" style="margin-bottom:6px">'+L2x("Ketik baris untuk lompat ke situ.","Tap a line to jump there.")+'</div>':'')+cs.map(function(c,i){ return timed?'<p data-cue="'+Math.round(c.s*1000)+'" data-ci="'+i+'">'+(c.sp?'<b>'+esc(c.sp)+':</b> ':'')+esc(c.t)+'</p>':'<p>'+esc(c.t).replace(/\n/g,"<br>")+'</p>'; }).join("")+'</div>';
  var box=el.querySelector("#cues"); box.addEventListener("scroll",function(){ if(!M.autoScr) M.trUser=Date.now(); }, {passive:true});
  M.ci=-1; syncCues();
}
function syncCues(){
  var box=document.getElementById("cues"); if(!box || !M.tr.cues || !M.tr.cues.length || M.tr.cues[0].s<0) { var ic=document.getElementById("npIcy2"); if(ic) ic.textContent=M.st.icy||"—"; return; }
  var t=(M.st.pos||0)/1000, cs=M.tr.cues, i=-1;
  for(var k=0;k<cs.length;k++){ if(cs[k].s<=t) i=k; else break; }
  if(i===M.ci) return; var old=box.querySelector(".on"); if(old) old.classList.remove("on"); M.ci=i; if(i<0) return;
  var p=box.querySelector('[data-ci="'+i+'"]'); if(!p) return; p.classList.add("on");
  if(!M.trUser || Date.now()-M.trUser>6000){ M.autoScr=true; box.scrollTop=p.offsetTop-box.offsetTop-box.clientHeight/3; setTimeout(function(){ M.autoScr=false; },80); }
}

// ---------- RADIO ----------
var RCACHE="ihsan_radio_cache2";
function loadRadio(force){
  var c=H.load(RCACHE,null);
  if(c && c.list && c.list.length && !force && Date.now()-c.t<24*3600e3){ M.radio=c.list; return; }
  if(c && c.list && !M.radio) M.radio=c.list;
  if(M.rLoading) return; M.rLoading=true; M.rErr="";
  var qs=[]; RADIO_TAGS.forEach(function(t){ qs.push("tag="+encodeURIComponent(t)); }); RADIO_NAMES.forEach(function(n){ qs.push("name="+encodeURIComponent(n)); });
  RADIO_FEATURED.forEach(function(n){ qs.push("name="+encodeURIComponent(n)+"&feat=1"); });
  var srv=0, got={}, left=qs.length, okN=0;
  function run(q, tries){
    var u=RADIO_SERVERS[(srv+tries)%RADIO_SERVERS.length]+"/json/stations/search?"+q.replace("&feat=1","")+(q.indexOf("feat=1")>0?"":"&hidebroken=true")+"&order=clickcount&reverse=true&limit=400";
    H.fetch(u, function(status, body){
      var arr=null; if(status>=200 && status<300){ try{ arr=JSON.parse(body); }catch(e){} }
      if(!arr && tries<2){ run(q, tries+1); return; }
      if(arr){ okN++; arr.forEach(function(s){ if(!s.stationuuid||got[s.stationuuid]) return; var url=s.url_resolved||s.url; if(!/^https?:/i.test(url)) return; var feat=q.indexOf("feat=1")>0||RADIO_FEATURED_RE.test(s.name||"");
        var tags=String(s.tags||"").split(",").map(function(x){ return x.trim(); }).filter(Boolean);
        if(/christ|gospel|church|bible|jesus|catholic|hindu|bhajan|krishna/i.test(tags.join(" ")+" "+s.name)) return;
        got[s.stationuuid]={id:s.stationuuid, n:String(s.name||"").trim()||"Radio", url:url, u0:/^https?:/i.test(s.url||"")?s.url:"", feat:feat, off:s.lastcheckok===0, fav:s.favicon||"", cc:s.countrycode||"", country:s.country||"", lang:s.language||"", tags:tags.slice(0,10), br:s.bitrate||0, codec:s.codec||"", votes:s.votes||0, clicks:s.clickcount||0, hls:!!s.hls, home:s.homepage||""}; }); }
      if(--left===0){ M.rLoading=false;
        var list=Object.keys(got).map(function(k){ return got[k]; }).sort(function(a,b){ return (b.feat-a.feat)||((b.clicks+b.votes)-(a.clicks+a.votes)); });
        if(list.length){ M.radio=list; H.save(RCACHE,{t:Date.now(), list:list}); } else M.rErr=okN?"none":"net";
        if(H.view()==="learn" && H.learnPg()==="radio") H.render(); }
    });
  }
  qs.forEach(function(q){ run(q,0); });
}
var AR_CC=["SA","EG","AE","KW","QA","BH","OM","JO","PS","LB","SY","IQ","YE","LY","TN","DZ","MA","SD"];
function radioFilter(l){
  var f=M.page.rf, q=M.page.rq.toLowerCase();
  return l.filter(function(s){
    if(f==="fav" && !RFAV.some(function(x){ return x.id===s.id; })) return false;
    if(f==="my" && s.cc!=="MY" && !(s.feat && ["ID","BN","SG"].indexOf(s.cc)<0 && (/malay|melayu/i.test(s.lang)||!s.cc))) return false;
    if(f==="id" && s.cc!=="ID") return false;
    if(f==="bn" && ["BN","SG"].indexOf(s.cc)<0) return false;
    if(f==="quran" && !/qur|koran|coran|tilaw|murot/i.test(s.n+" "+s.tags.join(" "))) return false;
    if(f==="ar" && AR_CC.indexOf(s.cc)<0 && !/arab/i.test(s.lang)) return false;
    if(f==="en" && !/english/i.test(s.lang) && ["GB","US","CA","AU","ZA","NZ","IE"].indexOf(s.cc)<0) return false;
    if(q && (s.n+" "+s.country+" "+s.tags.join(" ")+" "+s.lang).toLowerCase().indexOf(q)<0) return false;
    return true; });
}
function toggleFav(s){ var i=-1; RFAV.forEach(function(x,k){ if(x.id===s.id) i=k; }); if(i>=0) RFAV.splice(i,1); else RFAV.unshift(s); H.save("ihsan_radio_fav",RFAV); }
function vRadio(el){
  if(!M.radio) loadRadio(false); else if(!M.rLoading){ var c=H.load(RCACHE,null); if(!c || Date.now()-c.t>24*3600e3) loadRadio(true); }
  var all=(M.radio||[]).slice(); RFAV.forEach(function(f){ if(!all.some(function(s){ return s.id===f.id; })) all.unshift(f); });
  var l=radioFilter(all), n=M.page.rn, en_=en();
  var F=[["all",L2x("Semua","All")],["fav","★ "+L2x("Kegemaran","Favourites")],["my","🇲🇾 Malaysia"],["id","🇮🇩 Indonesia"],["bn","🇧🇳🇸🇬 Brunei & Singapura".replace("Singapura",en_?"Singapore":"Singapura")],["quran","📖 Al-Quran"],["ar","🌙 "+L2x("Arab","Arabic")],["en","🇬🇧 English"]];
  var h='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="mBack">‹ '+L2x("Belajar","Learn")+'</button><b>📻 '+L2x("Radio Islam","Islamic radio")+'</b><button class="chip" id="rRef" aria-label="refresh">⟳</button></div>';
  h+='<button class="lvLink" data-learn="live"><span>📺</span><b>'+L2x("Siaran langsung Makkah & Madinah","Live Makkah & Madinah")+'</b><small>'+L2x("Siaran langsung dan waktu solat di sana","Live broadcasts and prayer times there")+'</small></button>';
  h+='<input type="search" id="rQ" placeholder="🔍 '+L2x("Cari stesen, negara, bahasa","Search station, country, language")+'" value="'+esc(M.page.rq)+'" style="width:100%">';
  h+='<div class="chips rfl">'+F.map(function(f){ return '<button class="chip'+(M.page.rf===f[0]?' on':'')+'" data-rf="'+f[0]+'">'+esc(f[1])+'</button>'; }).join("")+'</div>';
  if(!M.radio && M.rLoading) h+='<div class="card mut">⏳ '+L2x("Memuat senarai stesen dari radio-browser.info…","Loading stations from radio-browser.info…")+'</div>';
  else if(!all.length) h+='<div class="card"><b>'+(M.rErr==="net"?L2x("Tiada sambungan","No connection"):L2x("Tiada stesen ditemui","No stations found"))+'</b><div class="mut small">'+L2x("Senarai radio perlukan internet. Cuba lagi dengan ⟳.","The station list needs internet. Try again with ⟳.")+'</div></div>';
  else {
    h+='<div class="mut tiny" style="margin:2px 4px 6px">'+l.length+L2x(" stesen"," stations")+(M.rLoading?' · ⏳':'')+'</div><div class="rlist">';
    h+=l.slice(0,n).map(function(s){ var on=M.st.key==="r:"+s.id&&M.st.st!=="idle", fv=RFAV.some(function(x){ return x.id===s.id; });
      return '<div class="ri'+(on?' on':'')+'" data-rid="'+esc(s.id)+'">'+artImg(s.fav,"ria","📻")+'<div class="rit"><b>'+(s.feat?'<span class="gold">★ </span>':'')+esc(s.n)+'</b><span>'+flag(s.cc)+' '+esc([s.country,s.tags.slice(0,3).join(", ")].filter(Boolean).join(" · "))+'</span>'+(s.off?'<span class="tiny" style="margin:0;color:var(--red)">'+L2x("Mungkin luar talian","May be offline")+'</span>':'')+'</div><button class="ib rfv'+(fv?' on':'')+'" data-rfav="'+esc(s.id)+'" aria-label="favourite">'+(fv?"★":"☆")+'</button><span class="rip">'+(on&&playing()?"⏸":"▶")+'</span></div>'; }).join("");
    h+='</div>';
    if(l.length>n) h+='<button class="btn alt full" id="rMore" style="margin:8px 0">'+L2x("Tunjuk lagi","Show more")+' ('+(l.length-n)+')</button>';
  }
  h+='<div class="mut tiny" style="padding:8px 4px 14px">'+L2x("Direktori: radio-browser.info. Stesen boleh bertukar atau berhenti siaran pada bila-bila masa. Radio terus dimainkan di latar; kawal dari notifikasi.","Directory: radio-browser.info. Stations can change or go off air at any time. Radio keeps playing in the background; control it from the notification.")+'</div>';
  el.innerHTML=h;
  var byId=function(id){ return all.filter(function(s){ return s.id===id; })[0]; };
  el.querySelector("#mBack").onclick=function(){ H.setLearn(null); H.render(); };
  el.querySelector("#rRef").onclick=function(){ loadRadio(true); H.render(); };
  var rq=el.querySelector("#rQ"), tmr=null; rq.oninput=function(){ clearTimeout(tmr); tmr=setTimeout(function(){ M.page.rq=rq.value.trim(); M.page.rn=60; H.render(); var n2=document.getElementById("rQ"); if(n2){ n2.focus(); n2.setSelectionRange(n2.value.length,n2.value.length); } },350); };
  el.querySelectorAll("[data-rf]").forEach(function(b){ b.onclick=function(){ M.page.rf=b.getAttribute("data-rf"); M.page.rn=60; H.render(); }; });
  var mo=el.querySelector("#rMore"); if(mo) mo.onclick=function(){ M.page.rn+=60; var st=document.getElementById("view").scrollTop; H.render(); document.getElementById("view").scrollTop=st; };
  el.querySelectorAll("[data-rid]").forEach(function(r){ r.onclick=function(e){
    var fb=e.target.closest("[data-rfav]"), s=byId(r.getAttribute("data-rid")); if(!s) return;
    if(fb){ e.stopPropagation(); toggleFav(s); var on=RFAV.some(function(x){ return x.id===s.id; }); fb.classList.toggle("on",on); fb.textContent=on?"★":"☆"; return; }
    if(M.st.key==="r:"+s.id && M.st.st!=="idle"){ openPlayer(); return; }
    playRadio(s); }; });
}

// ---------- PODCASTS ----------
// 0.9.1: four free sources, searched together. Apple Podcasts, fyyd.de and gpodder.net give RSS feeds;
// archive.org gives uploaded lecture recordings (each item becomes a "show" whose files are the episodes).
var SRC_NAME={apple:"Apple Podcasts", fyyd:"fyyd", gpodder:"gpodder", archive:"Archive.org"};
function norm(t){ return String(t||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(); }
function srcSearch(term, country, k, done){
  var R=[], left=0, okN=0, seen={};
  function add(list, src){ (list||[]).forEach(function(r){ if(!r.feed) return; var key=norm(r.feed.replace(/^https?:\/\//,"")); if(seen[key]) return; seen[key]=1; r.src=src; R.push(r); }); }
  function fin(){ if(--left>0){ M.search[k].res=R.slice(); M.search[k].partial=true; done(); return; } M.search[k]={res:R, err:!okN&&!R.length}; done(); }
  function get(u, src, map){ left++; H.fetch(u, function(st, body){ var list=null; if(st>=200&&st<300){ try{ list=map(JSON.parse(body)); okN++; }catch(e){} } add(list, src); fin(); }); }
  var q=encodeURIComponent(term);
  get("https://itunes.apple.com/search?media=podcast&entity=podcast&limit=30&term="+q+(country?"&country="+country:""), "apple", function(j){ return (j.results||[]).map(function(r){ return {feed:r.feedUrl, t:r.collectionName||r.trackName, a:r.artistName||"", img:r.artworkUrl600||r.artworkUrl100||"", n:r.trackCount||0, g:r.primaryGenreName||""}; }); });
  if(country) get("https://itunes.apple.com/search?media=podcast&entity=podcast&limit=30&term="+q, "apple", function(j){ return (j.results||[]).map(function(r){ return {feed:r.feedUrl, t:r.collectionName||r.trackName, a:r.artistName||"", img:r.artworkUrl600||r.artworkUrl100||"", n:r.trackCount||0, g:r.primaryGenreName||""}; }); });
  get("https://api.fyyd.de/0.2/search/podcast?count=30&term="+q, "fyyd", function(j){ return (j.data||[]).map(function(r){ return {feed:r.xmlURL, t:r.title, a:r.author||"", img:r.imgURL||r.layoutImageURL||"", n:r.episode_count||0, g:""}; }); });
  get("https://gpodder.net/search.json?q="+q, "gpodder", function(j){ return (j||[]).slice(0,30).map(function(r){ return {feed:r.url, t:r.title, a:r.author||"", img:r.scaled_logo_url||r.logo_url||"", n:0, g:"", d:r.description||""}; }); });
  var aq='(title:("'+term+'") OR creator:("'+term+'") OR subject:("'+term+'") OR description:("'+term+'")) AND mediatype:(audio)';
  get("https://archive.org/advancedsearch.php?q="+encodeURIComponent(aq)+"&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=downloads&sort[]=downloads+desc&rows=40&output=json", "archive", function(j){
    return ((j.response||{}).docs||[]).map(function(d){ var cr=Array.isArray(d.creator)?d.creator.join(", "):(d.creator||""); return {feed:"ia:"+d.identifier, t:Array.isArray(d.title)?d.title[0]:(d.title||d.identifier), a:cr, img:"https://archive.org/services/img/"+encodeURIComponent(d.identifier), n:0, g:"Archive.org"}; }); });
}
// Search a speaker or free text. For a speaker only results that really mention them are kept (Farah: "nothing related to him").
function podSearch(term, country, cb){
  var k=term+"|"+(country||"");
  if(M.search[k] && (M.search[k].res||M.search[k].loading)){ cb(); return; }
  M.search[k]={loading:true, res:[]};
  srcSearch(term, country, k, cb);
}
function relevant(r, keys){ var hay=" "+norm(r.t+" "+r.a+" "+(r.d||""))+" "; return keys.some(function(kw){ return hay.indexOf(" "+norm(kw)+" ")>=0; }); }
function spKeys(sp){ return sp.k||[sp.q]; }
function isSub(feed){ return POD.subs.some(function(s){ return s.feed===feed; }); }
function toggleSub(show){ if(isSub(show.feed)){ POD.subs=POD.subs.filter(function(s){ return s.feed!==show.feed; }); H.toast(L2x("Langganan dibatalkan","Unsubscribed")); }
  else { POD.subs.unshift({feed:show.feed, t:show.t, a:show.a||"", img:show.img||"", at:Date.now()}); H.toast("✓ "+L2x("Dilanggan","Subscribed")); }
  savePod(); }
function txt(n, tag){ var e=n.getElementsByTagName(tag)[0]; return e?(e.textContent||"").trim():""; }
function htmlText(s){ s=String(s||""); if(!/<\w/.test(s)) return s.trim(); var d=new DOMParser().parseFromString(s.replace(/<br\s*\/?>/gi,"\n").replace(/<\/p>/gi,"\n\n").replace(/<li>/gi,"• "),"text/html"); return (d.body?d.body.textContent:"").replace(/\n{3,}/g,"\n\n").trim(); }
function durS(s){ s=String(s||"").trim(); if(!s) return 0; if(/^\d+$/.test(s)) return +s; return tsec(s); }
function parseFeed(xml, feed){
  var d=new DOMParser().parseFromString(xml,"text/xml"); if(d.getElementsByTagName("parsererror").length && !d.getElementsByTagName("item").length) return null;
  var ch=d.getElementsByTagName("channel")[0]; if(!ch) return null;
  var im=ch.getElementsByTagName("itunes:image")[0], cimg=im?im.getAttribute("href"):""; if(!cimg){ var ie=ch.getElementsByTagName("image")[0]; if(ie) cimg=txt(ie,"url"); }
  var show={feed:feed, t:txt(ch,"title"), a:txt(ch,"itunes:author"), img:cimg, desc:htmlText(txt(ch,"description")).slice(0,1500)};
  var eps=[]; [].slice.call(d.getElementsByTagName("item")).forEach(function(it){
    var enc=it.getElementsByTagName("enclosure")[0], u=enc?enc.getAttribute("url"):""; if(!safeUrl(u)) return;
    var ty=enc.getAttribute("type")||""; if(ty && !/audio|mpeg|mp4|m4a|aac|ogg|octet|x-m4a/i.test(ty)) return;
    var ii=it.getElementsByTagName("itunes:image")[0], tr=[].slice.call(it.getElementsByTagName("podcast:transcript")).map(function(t){ return {u:t.getAttribute("url"), ty:t.getAttribute("type")||"", l:t.getAttribute("language")||""}; }).filter(function(t){ return safeUrl(t.u); });
    var ce=it.getElementsByTagName("content:encoded")[0], ds=ce?ce.textContent:(txt(it,"description")||txt(it,"itunes:summary"));
    eps.push({g:txt(it,"guid")||u, t:txt(it,"title")||"—", d:Date.parse(txt(it,"pubDate"))||0, du:durS(txt(it,"itunes:duration")), u:u, img:ii?ii.getAttribute("href"):"", tr:tr, desc:htmlText(ds).slice(0,12000)});
  });
  eps.sort(function(a,b){ return b.d-a.d; });
  return {show:show, eps:eps};
}
function parseIA(body, feed){
  var j=JSON.parse(body), id=feed.slice(3), md=j.metadata||{}; if(!j.files) return null;
  var one=function(v){ return Array.isArray(v)?v[0]:(v||""); };
  var show={feed:feed, t:one(md.title)||id, a:Array.isArray(md.creator)?md.creator.join(", "):(md.creator||""), img:"https://archive.org/services/img/"+encodeURIComponent(id), desc:htmlText(one(md.description)).slice(0,1500)};
  var files=j.files.filter(function(f){ return /mp3|ogg vorbis|m4a|aac/i.test(f.format||"") || /\.(mp3|m4a|ogg)$/i.test(f.name||""); });
  var names={}; files.forEach(function(f){ names[f.name]=1; });
  files=files.filter(function(f){ var m=/^(.*)_64kb\.mp3$/i.exec(f.name); return !(m && (names[m[1]+".mp3"]||names[m[1]+".ogg"])); }); // skip the low-quality copies
  files=files.filter(function(f){ return !/\.ogg$/i.test(f.name) || !names[f.name.replace(/\.ogg$/i,".mp3")]; });
  files.sort(function(a,b){ var ta=parseInt(a.track,10), tb=parseInt(b.track,10); if(ta&&tb&&ta!==tb) return ta-tb; return String(a.name).localeCompare(String(b.name),undefined,{numeric:true}); });
  var base=(j.d1?"https://"+j.d1+j.dir+"/":"https://archive.org/download/"+encodeURIComponent(id)+"/");
  var pub=Date.parse(one(md.date)||one(md.publicdate))||0;
  var eps=files.map(function(f){ var nm=String(f.name), path=nm.split("/").map(encodeURIComponent).join("/");
    return {g:"ia:"+id+"/"+nm, t:f.title||nm.replace(/\.[a-z0-9]+$/i,"").replace(/[_]+/g," "), d:pub, du:durS(f.length), u:"https://archive.org/download/"+encodeURIComponent(id)+"/"+path, img:"", tr:[], desc:show.desc}; });
  return {show:show, eps:eps};
}
function fkey(feed){ var h=0; for(var i=0;i<feed.length;i++) h=(h*31+feed.charCodeAt(i))|0; return "ihsan_podf_"+(h>>>0).toString(36); }
function getFeed(feed, force, cb){
  var m=M.feeds[feed];
  if(m && m.data && !force && Date.now()-m.t<3*3600e3){ cb(m.data); return; }
  if(!m || !m.data){ var c=H.load(fkey(feed),null); if(c && c.data){ M.feeds[feed]={t:force?0:c.t, data:c.data}; if(!force && Date.now()-c.t<3*3600e3){ cb(c.data); return; } cb(c.data); } }
  if(M.feeds[feed] && M.feeds[feed].loading) return;
  M.feeds[feed]=M.feeds[feed]||{}; M.feeds[feed].loading=true;
  var ia=feed.indexOf("ia:")===0, furl=ia?"https://archive.org/metadata/"+encodeURIComponent(feed.slice(3)):feed;
  H.fetch(furl, function(status, body){
    var data=null; if(status>=200 && status<400){ try{ data=ia?parseIA(body, feed):parseFeed(body, feed); }catch(e){} }
    var f=M.feeds[feed]; f.loading=false;
    if(data){ f.data=data; f.t=Date.now(); f.err=false;
      if(isSub(feed)){ try{ H.save(fkey(feed),{t:f.t, data:{show:data.show, eps:data.eps.slice(0,60).map(function(e){ return slimEp(e,700); })}}); }catch(e){} }
    } else f.err=true;
    cb(f.data||null);
  });
}
function rerender(){ var v=document.getElementById("view"), st=v?v.scrollTop:0; H.render(); if(v) v.scrollTop=st; }
function epRow(ep, show){
  var key="p:"+ep.g, pos=POD.pos[key]||0, done=POD.done[key], on=M.st.key===key&&M.st.st!=="idle";
  var pct=ep.du&&pos?Math.min(100,pos*100/ep.du):0;
  return '<div class="ep'+(on?' on':'')+(done?' done':'')+'" data-ep="'+esc(ep.g)+'"><div class="ept"><b>'+esc(ep.t)+'</b><span class="mut tiny">'+[ep.d?esc(new Date(ep.d).toLocaleDateString(H.locTag(),{day:"numeric",month:"short",year:"numeric"})):"", ep.du?H.durEn(ep.du):""].filter(Boolean).join(" · ")+(done?' · ✓ '+L2x("didengar","played"):pos?' · '+L2x("baki ","left ")+H.durEn(Math.max(0,ep.du-pos)):'')+(ep.tr&&ep.tr.length?' · 📝 '+L2x("teks","transcript"):'')+'</span>'+(pct&&!done?'<span class="epb"><i style="width:'+pct+'%"></i></span>':'')+'</div><span class="rip">'+(on&&playing()?"⏸":"▶")+'</span></div>';
}
function vShow(el){
  var sh=M.page.show, f=M.feeds[sh.feed], data=f&&f.data;
  if(!data && !(f&&f.err)) getFeed(sh.feed,false,function(){ rerender(); });
  var s=data?data.show:sh, sub=isSub(sh.feed);
  var h='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="mUp">‹ Podcast</button><span></span><button class="chip" id="fRef" aria-label="refresh">⟳</button></div>';
  h+='<div class="card shw">'+artImg(s.img||sh.img,"sha","🎙")+'<div><b>'+esc(s.t||sh.t)+'</b><div class="mut small">'+esc(s.a||sh.a||"")+'</div><button class="btn '+(sub?'alt':'gold')+'" id="subB" style="margin-top:8px">'+(sub?'✓ '+L2x("Dilanggan","Subscribed"):'＋ '+L2x("Langgan","Subscribe"))+'</button></div></div>';
  if(data && data.show.desc) h+='<details class="card"><summary class="small">'+L2x("Tentang podcast ini","About this podcast")+'</summary><div class="small" style="margin-top:6px;white-space:pre-line">'+esc(data.show.desc)+'</div></details>';
  if(!data) h+='<div class="card mut">'+(f&&f.err?'⚠️ '+L2x("Suapan RSS tidak dapat dimuat. Cuba ⟳.","The RSS feed could not be loaded. Try ⟳."):'⏳ '+L2x("Memuat episod…","Loading episodes…"))+'</div>';
  else {
    var n=M.page.epn||40, hasTr=data.eps.filter(function(e){ return e.tr&&e.tr.length; }).length;
    h+='<div class="mut tiny" style="margin:0 4px 6px">'+data.eps.length+L2x(" episod"," episodes")+' · '+(hasTr?'📝 '+hasTr+L2x(" dengan transkrip"," with transcripts"):L2x("tiada transkrip dalam suapan ini","no transcripts in this feed"))+'</div><div class="eplist">'+data.eps.slice(0,n).map(function(e){ return epRow(e,data.show); }).join("")+'</div>';
    if(data.eps.length>n) h+='<button class="btn alt full" id="epMore" style="margin:8px 0 14px">'+L2x("Episod lama","Older episodes")+' ('+(data.eps.length-n)+')</button>';
  }
  el.innerHTML=h;
  el.querySelector("#mUp").onclick=function(){ M.page.show=null; M.page.epn=40; rerender(); };
  el.querySelector("#fRef").onclick=function(){ getFeed(sh.feed,true,function(){ rerender(); }); rerender(); };
  el.querySelector("#subB").onclick=function(){ toggleSub({feed:sh.feed, t:s.t||sh.t, a:s.a||sh.a, img:s.img||sh.img}); if(isSub(sh.feed)&&data) getFeed(sh.feed,true,function(){}); rerender(); };
  var em=el.querySelector("#epMore"); if(em) em.onclick=function(){ M.page.epn=(M.page.epn||40)+40; rerender(); };
  el.querySelectorAll("[data-ep]").forEach(function(r){ r.onclick=function(){ var g=r.getAttribute("data-ep"), ep=data.eps.filter(function(e){ return e.g===g; })[0]; if(!ep) return;
    if(M.st.key==="p:"+g && M.st.st!=="idle" && M.st.st!=="ended" && M.st.st!=="error"){ openPlayer(); return; } playEp(ep, data.show); }; });
}
function showResults(el, res, loading, err, hidden){
  if(loading && (!res||!res.length)) return '<div class="card mut">⏳ '+L2x("Mencari di Apple Podcasts, fyyd, gpodder dan Archive.org…","Searching Apple Podcasts, fyyd, gpodder and Archive.org…")+'</div>';
  if(err) return '<div class="card"><b>'+L2x("Carian gagal","Search failed")+'</b><div class="mut small">'+L2x("Perlu internet. Cuba lagi.","Needs internet. Try again.")+'</div></div>';
  if(!res||!res.length) return '<div class="card small"><b>'+L2x("Tiada rakaman ditemui","Nothing found")+'</b><div class="mut">'+L2x("Tiada podcast atau rakaman audio yang menyebut nama ini di Apple Podcasts, fyyd, gpodder atau Archive.org. Penceramah ini mungkin hanya ada di YouTube.","No podcast or audio recording mentioning this name on Apple Podcasts, fyyd, gpodder or Archive.org. This speaker may only publish on YouTube.")+'</div>'+(hidden?'<button class="chip" id="showAll" style="margin-top:8px">'+L2x("Tunjuk "+hidden+" hasil lain yang mungkin tidak berkaitan","Show "+hidden+" other results that may be unrelated")+'</button>':'')+'</div>';
  return '<div class="plist2">'+res.map(function(r,i){ var sub=isSub(r.feed); return '<div class="pres" data-pr="'+i+'">'+artImg(r.img,"pra","🎙")+'<div class="prt"><b>'+esc(r.t)+'</b><span class="mut tiny">'+esc(r.a)+(r.n?' · '+r.n+L2x(" episod"," episodes"):'')+' · <span class="srcb s-'+r.src+'">'+esc(SRC_NAME[r.src]||"")+'</span></span></div><button class="chip'+(sub?'':' on')+'" data-psub="'+i+'">'+(sub?'✓':'＋')+'</button></div>'; }).join("")+'</div>'+(loading?'<div class="mut tiny" style="margin:6px 4px">⏳ '+L2x("Masih mencari…","Still searching…")+'</div>':'')+(hidden?'<button class="chip" id="showAll" style="margin:8px 0">'+L2x("Tunjuk "+hidden+" hasil lain yang mungkin tidak berkaitan","Show "+hidden+" other results that may be unrelated")+'</button>':'');
}
function bindResults(el, res){
  if(!res) return;
  el.querySelectorAll("[data-pr]").forEach(function(r){ r.onclick=function(e){ var i=+r.getAttribute("data-pr"), x=res[i];
    if(e.target.closest("[data-psub]")){ e.stopPropagation(); toggleSub(x); if(isSub(x.feed)) getFeed(x.feed,true,function(){}); rerender(); return; }
    M.page.show={feed:x.feed, t:x.t, a:x.a, img:x.img}; M.page.epn=40; H.render(); document.getElementById("view").scrollTop=0; }; });
}
var LANGS=[["all","Semua","All"],["ms","🇲🇾 Melayu","🇲🇾 Malay"],["id","🇮🇩 Indonesia","🇮🇩 Indonesian"],["en","🇬🇧 English","🇬🇧 English"]];
function vPodcast(el){
  if(M.page.show){ vShow(el); return; }
  var pg=M.page, h='';
  h+='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="mBack">‹ '+(pg.sp?"Podcast":L2x("Belajar","Learn"))+'</button><b>🎙 Podcast</b><span></span></div>';
  if(pg.sp){ // one speaker's search results
    var sp=pg.sp, k=sp.q+"|"+(sp.c||""), r=M.search[k];
    if(!r){ podSearch(sp.q, sp.c, function(){ rerender(); }); r=M.search[k]; }
    var all=(r&&r.res)||[], keys=spKeys(sp), rel=all.filter(function(x){ return relevant(x, keys); });
    rel.sort(function(a,b){ var o={apple:0,fyyd:1,gpodder:2,archive:3}; return (o[a.src]-o[b.src]); });
    var shown=pg.showAll?all:rel, hiddenN=pg.showAll?0:all.length-rel.length;
    h+='<div class="card spk"><span class="spi">'+esc(initials(sp.n))+'</span><div><b>'+esc(sp.n)+'</b><div class="mut tiny">'+esc(LN(sp.l))+' · '+esc(sp.r||"")+'</div></div></div>';
    h+='<div class="mut tiny" style="margin:0 4px 6px">'+L2x("Hanya hasil yang menyebut “","Only results that mention “")+esc(keys[0])+'” '+L2x("ditunjukkan. Sumber: Apple Podcasts, fyyd, gpodder dan Archive.org (rakaman kuliah).","are shown. Sources: Apple Podcasts, fyyd, gpodder and Archive.org (lecture recordings).")+'</div>';
    h+=showResults(el, shown, !r||r.loading||r.partial, r&&r.err, hiddenN);
    el.innerHTML=h; bindResults(el, shown);
    var sa=el.querySelector("#showAll"); if(sa) sa.onclick=function(){ pg.showAll=true; rerender(); };
    el.querySelector("#mBack").onclick=function(){ pg.sp=null; pg.showAll=false; rerender(); };
    return;
  }
  h+='<div class="seg ptabs"><button class="'+(pg.tab==="subs"?"on":"")+'" data-ptab="subs">📥 '+L2x("Langganan","Subscribed")+(POD.subs.length?' ('+POD.subs.length+')':'')+'</button><button class="'+(pg.tab==="speakers"?"on":"")+'" data-ptab="speakers">👳 '+L2x("Ustaz & Syeikh","Ustaz & Sheikhs")+'</button><button class="'+(pg.tab==="search"?"on":"")+'" data-ptab="search">🔍 '+L2x("Cari","Search")+'</button></div>';
  if(pg.tab==="subs"){
    if(!POD.subs.length) h+='<div class="card"><b>'+L2x("Belum ada langganan","No subscriptions yet")+'</b><div class="mut small">'+L2x("Pilih penceramah di tab Ustaz & Syeikh, kemudian tekan ＋ untuk melanggan rancangan mereka.","Pick a speaker in the Ustaz & Sheikhs tab, then tap ＋ to subscribe to their show.")+'</div><button class="btn gold" data-ptab="speakers" style="margin-top:8px">👳 '+L2x("Lihat senarai","See the list")+'</button></div>';
    else {
      h+='<div class="subs">'+POD.subs.map(function(s,i){ var f=M.feeds[s.feed], d=f&&f.data, nw=d&&d.eps[0]&&POD.seen[s.feed]!==d.eps[0].g;
        return '<button class="sub" data-sub="'+i+'">'+artImg(s.img,"sba","🎙")+(nw?'<i class="nw">●</i>':'')+'<span>'+esc(s.t)+'</span></button>'; }).join("")+'</div>';
      // latest episodes across subscriptions
      var latest=[]; POD.subs.forEach(function(s){ var f=M.feeds[s.feed]; if(!f||(!f.data&&!f.loading&&!f.err)||(f.data&&Date.now()-f.t>3*3600e3&&!f.loading)) getFeed(s.feed,false,function(){ rerender(); }); f=M.feeds[s.feed]; if(f&&f.data) f.data.eps.slice(0,5).forEach(function(e){ latest.push({e:e, s:f.data.show}); }); });
      latest.sort(function(a,b){ return b.e.d-a.e.d; });
      h+='<div class="snl" style="margin:12px 4px 6px">'+L2x("Episod terkini","Latest episodes")+'</div>';
      h+=latest.length?'<div class="eplist">'+latest.slice(0,25).map(function(x){ return epRow(x.e,x.s).replace('<div class="ept"><b>','<div class="ept"><span class="gold tiny">'+esc(x.s.t)+'</span><b>'); }).join("")+'</div>':'<div class="card mut">⏳ '+L2x("Memuat suapan…","Loading feeds…")+'</div>';
      M._latest=latest;
    }
  } else if(pg.tab==="speakers"){
    h+='<div class="chips">'+LANGS.map(function(l){ return '<button class="chip'+(pg.lang===l[0]?' on':'')+'" data-plang="'+l[0]+'">'+esc(en()?l[2]:l[1])+'</button>'; }).join("")+'</div>';
    // 0.27.0: filter by speaker (men / women) and by topic
    h+='<div class="chips pgen">'+[["","Semua","All"],["m","👳 Lelaki","👳 Men"],["f","🧕 Perempuan","🧕 Women"]].map(function(g){ return '<button class="chip'+((pg.gen||"")===g[0]?' on':'')+'" data-pgen="'+g[0]+'">'+esc(en()?g[2]:g[1])+'</button>'; }).join("")+'</div>';
    h+='<div class="chips ptop"><button class="chip'+(!pg.top?' on':'')+'" data-ptop="">'+L2x("Semua topik","All topics")+'</button>'+POD_TOPICS.map(function(t){ return '<button class="chip'+(pg.top===t[0]?' on':'')+'" data-ptop="'+t[0]+'">'+esc(en()?t[2]:t[1])+'</button>'; }).join("")+'</div>';
    var L=POD_SPEAKERS.filter(function(s){ return (pg.lang==="all"||s.l===pg.lang) && (!pg.gen||s.g===pg.gen) && (!pg.top||(" "+s.t+" ").indexOf(" "+pg.top+" ")>=0); });
    var TN=function(c){ var t=POD_TOPICS.filter(function(x){ return x[0]===c; })[0]; return t?(en()?t[2]:t[1]):""; };
    h+='<div class="mut tiny" style="margin:2px 4px 6px">'+L.length+L2x(" penceramah pilihan (bukan kedudukan). Ketik untuk cari podcast mereka."," picked speakers (not a ranking). Tap to find their podcasts.")+'</div><div class="spl">'+L.map(function(s){ var i=POD_SPEAKERS.indexOf(s), has=POD.subs.some(function(x){ return (x.a+" "+x.t).toLowerCase().indexOf(s.q.toLowerCase().split(" ").pop())>=0; });
      return '<button class="spb" data-sp="'+i+'"><span class="spi l-'+s.l+'">'+esc(initials(s.n))+'</span><span class="spn"><b>'+esc(s.n)+'</b><small>'+esc(LN(s.l))+(s.r?' · '+esc(s.r):'')+'</small><small class="sptop">'+esc((s.t||"").split(" ").map(TN).join(" · "))+'</small></span>'+(has?'<span class="badge">✓</span>':'<span class="mut">›</span>')+'</button>'; }).join("")+'</div>';
  } else {
    var sq=pg.sq||"", r2=sq?M.search[sq+"|"]:null;
    h+='<form id="psF"><input type="search" id="psQ" placeholder="🔍 '+L2x("Nama penceramah atau rancangan","Speaker or show name")+'" value="'+esc(sq)+'" style="width:100%"></form>';
    h+=sq?showResults(el, r2&&r2.res, !r2||r2.loading||r2.partial, r2&&r2.err, 0):'<div class="mut small" style="padding:8px 4px">'+L2x("Cari di Apple Podcasts, fyyd, gpodder dan Archive.org (percuma, tanpa akaun).","Search Apple Podcasts, fyyd, gpodder and Archive.org (free, no account).")+'</div>';
  }
  h+='<div class="mut tiny" style="padding:10px 4px 14px">'+L2x("Podcast dicari melalui Apple Podcasts dan dimainkan terus dari suapan RSS penerbit. Teks/lirik dipapar jika penerbit menyediakan transkrip.","Podcasts are found through Apple Podcasts and play straight from each publisher's RSS feed. Lyrics/transcripts show when the publisher provides one.")+'</div>';
  el.innerHTML=h;
  el.querySelector("#mBack").onclick=function(){ H.setLearn(null); H.render(); };
  el.querySelectorAll("[data-ptab]").forEach(function(b){ b.onclick=function(){ pg.tab=b.getAttribute("data-ptab"); rerender(); }; });
  el.querySelectorAll("[data-plang]").forEach(function(b){ b.onclick=function(){ pg.lang=b.getAttribute("data-plang"); rerender(); }; });
  el.querySelectorAll("[data-pgen]").forEach(function(b){ b.onclick=function(){ pg.gen=b.getAttribute("data-pgen")||null; rerender(); }; });
  el.querySelectorAll("[data-ptop]").forEach(function(b){ b.onclick=function(){ pg.top=b.getAttribute("data-ptop")||null; rerender(); }; });
  el.querySelectorAll("[data-sp]").forEach(function(b){ b.onclick=function(){ pg.sp=POD_SPEAKERS[+b.getAttribute("data-sp")]; H.render(); document.getElementById("view").scrollTop=0; }; });
  el.querySelectorAll("[data-sub]").forEach(function(b){ b.onclick=function(){ var s=POD.subs[+b.getAttribute("data-sub")], f=M.feeds[s.feed]; if(f&&f.data&&f.data.eps[0]){ POD.seen[s.feed]=f.data.eps[0].g; savePod(); } M.page.show={feed:s.feed,t:s.t,a:s.a,img:s.img}; M.page.epn=40; H.render(); document.getElementById("view").scrollTop=0; }; });
  if(pg.tab==="subs" && M._latest) el.querySelectorAll("[data-ep]").forEach(function(r){ r.onclick=function(){ var g=r.getAttribute("data-ep"), x=M._latest.filter(function(y){ return y.e.g===g; })[0]; if(!x) return;
    if(M.st.key==="p:"+g && ["idle","ended","error"].indexOf(M.st.st)<0){ openPlayer(); return; } playEp(x.e, x.s); }; });
  var f=el.querySelector("#psF"); if(f){ f.onsubmit=function(e){ e.preventDefault(); var q=el.querySelector("#psQ").value.trim(); if(!q) return; pg.sq=q; delete M.search[q+"|"]; podSearch(q,"",function(){ rerender(); }); rerender(); };
    var sq2=pg.sq&&M.search[pg.sq+"|"]; bindResults(el, sq2&&sq2.res); }
}
function initials(n){ return n.replace(/^(Ustaz|Ustadz|Ustazah|Dr\.|Datuk|Prof\.|Habib|Mufti|Buya|Gus|Aa|KH|M\.)\s+/g,"").replace(/^(Ustaz|Ustadz|Dr\.|Prof\.)\s+/g,"").split(/[\s(]+/).filter(Boolean).slice(0,2).map(function(w){ return w.charAt(0).toUpperCase(); }).join(""); }
function LN(l){ return l==="ms"?L2x("Bahasa Melayu","Malay"):l==="id"?L2x("Bahasa Indonesia","Indonesian"):"English"; }

// ---------- home widget ----------
function widget(w,h){
  var s=M.st, c=M.cur, on=s.st!=="idle" && c && c.key===s.key;
  if(!c) return '<div class="card wnp"><div class="wnpE"><button class="chip" data-wsc="sc-radio">📻 Radio</button><button class="chip" data-wsc="sc-podcast">🎙 Podcast</button></div></div>';
  return '<div class="card wnp'+(on?' on':'')+'" data-wsc="sc-player">'+artImg(c.art,"wnpa",c.live?"📻":"🎙")+'<div class="wnpt"><b>'+esc(c.title)+'</b><span id="wNpS">'+esc(on&&s.live&&s.icy?s.icy:(on?c.artist:L2x("Ketik ▶ untuk sambung","Tap ▶ to resume")))+'</span></div><button class="mnb" id="wNpB" data-wnp="1">'+(on&&playing()?"⏸":"▶")+'</button></div>';
}
function tickWidget(){
  var b=document.getElementById("wNpB"); if(!b) return; var on=M.st.st!=="idle"&&M.cur&&M.cur.key===M.st.key;
  b.textContent=on&&playing()?"⏸":"▶"; var s=document.getElementById("wNpS"); if(s && on && M.st.live && M.st.icy) s.textContent=M.st.icy;
  if(!b._b){ b._b=1; b.addEventListener("click", function(e){ e.stopPropagation(); var on2=M.st.st!=="idle"&&M.cur&&M.cur.key===M.st.key;
    if(on2){ P.cmd("toggle"); } else if(M.cur){ if(M.cur.live) playRadio(M.cur.st); else { replayCur(); M.st={st:"loading",key:M.cur.key}; mini(); } } setTimeout(tick,250); }, true); }
}

// ---------- public ----------
window.IbMedia={
  render:function(el, page){ if(page==="radio") vRadio(el); else vPodcast(el); },
  navGet:function(){ var p=M.page; return {show:p.show, sp:p.sp, tab:p.tab, k:(p.tab||"")+"/"+(p.show?p.show.feed:"")+"/"+(p.sp?JSON.stringify(p.sp).slice(0,60):"")}; },
  navSet:function(o){ M.page.show=o.show; M.page.sp=o.sp; if(o.tab) M.page.tab=o.tab; },
  back:function(){ if(H.learnPg()==="podcast"){ if(M.page.show){ M.page.show=null; H.render(); return true; } if(M.page.sp){ M.page.sp=null; H.render(); return true; } } return false; },
  openPlayer:openPlayer, widget:widget, tickWidget:tickWidget, state:function(){ return M.st; },
  filter:function(f){ M.page.rf=f; M.page.rn=60; M.page.rq=""; }
};
tick();
if(H.view()==="home" || (H.view()==="learn" && /radio|podcast/.test(H.learnPg()||""))) H.render();
})();
