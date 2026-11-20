/* Sirah Nabi: interactive desert timeline. Adult and kids timelines share this engine.
   Data: SIRAH_ERAS, SIRAH, SIRAH_PLACES, SIRAH_PEOPLE, SIRAH_QUIZ, SIRAH_REFS (sirah_data_*.js). Art: SirahArt. */
window.SirahOpen = (function(){
  var H, kids, en, ov, root, scr, track, hz, skyEl, sunEl, cvs, ctx2, farEl, midEl, nearEl, lmBox, topEl, dockEl, sheet, panel=null;
  var W, VH, HZ, items=[], segs=[], focus=-1, focusEra=-1, st, stKey, lastScroll=0, raf=0, fxRaf=0, parts=[], calm=false, sheetIdx=-1, endY=0, maxScroll=1;
  var IC={
    back:'<path d="M15 18l-6-6 6-6"/>', close:'<path d="M18 6L6 18M6 6l12 12"/>',
    vol:'<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
    mute:'<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/>',
    map:'<path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    star:'<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    share:'<path d="M7 17L17 7M8 7h9v9"/>', play:'<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>',
    prev:'<path d="M15 18l-6-6 6-6"/>', next:'<path d="M9 18l6-6-6-6"/>',
    award:'<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5L17 22l-5-3-5 3 1.5-8.5"/>', up:'<path d="M18 15l-6-6-6 6"/>',
    pin:'<path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    cal:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>', book:'<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>'
  };
  function ic(n,s){ return '<svg class="ski" viewBox="0 0 24 24" width="'+(s||20)+'" height="'+(s||20)+'" aria-hidden="true">'+IC[n]+'</svg>'; }
  function L(a){ return a ? (en ? (a[1]||a[0]) : a[0]) : ""; }
  function esc(s){ return H.esc(s); }
  function q(s){ return root.querySelector(s); }
  function eraOf(id){ return SIRAH_ERAS[id]; }
  function pal(era){ var e=eraOf(era), sd=e.sand, A=SirahArt; return {s:A.shade(sd,-0.66), m:A.shade(sd,-0.32), l:A.shade(sd,0.6), g:e.stars?"#F2C25C":"#E8B04A", sand:sd}; }
  function evs(){ return kids ? SIRAH.filter(function(e){ return e.m; }) : SIRAH; }
  function hijri(e){ if(e.ah!=null) return e.ah+(en?" AH":" H"); if(e.y<622.54){ var n=Math.ceil((622.54-e.y)*1.0307); return n>0 ? n+(en?" BH":" SH") : ""; } return ""; }
  function yearTxt(e){ if(e.yt) return L(e.yt); var y=Math.floor(e.y); return y+(en?" CE":" M")+(hijri(e)?" · "+hijri(e):""); }
  function ageTxt(e){ return e.age==null||e.age==="" ? "" : (en?"Age ":"Umur ")+e.age; }
  function saveSt(){ H.save(stKey, st); }

  // ---------- open / close ----------
  function open(isKids, helpers){
    H=helpers; kids=!!isKids; en=H.S.lang==="en"; stKey=kids?"ihsan_sirah_kids":"ihsan_sirah";
    st=H.load(stKey,{pos:0, read:{}, fav:{}, badges:{}}); st.read=st.read||{}; st.fav=st.fav||{}; st.badges=st.badges||{};
    calm=!!H.S.sirahCalm; try{ if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) calm=true; }catch(e){}
    ov=document.getElementById("overlay"); ov.className="sirahov"; ov.innerHTML='<div class="sk'+(kids?" kids":"")+(calm?" calm":"")+'" id="sk"></div>'; ov._close=back;
    root=ov.querySelector("#sk"); lastScroll=0; focus=-1; focusEra=-1; panel=null; sheetIdx=-1;
    build();
    H.on("pause", onPause); H.on("resume", onResume); document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    if(H.jump){ var j=H.jump; setTimeout(function(){ jumpTo(j); }, 80); } else showIntro();
  }
  function back(){
    if(panel){ closePanel(); return; }
    if(sheet && sheet.classList.contains("open")){ closeSheet(); return; }
    exit();
  }
  function exit(){
    st.pos=scr?scr.scrollTop:st.pos; saveSt(); Wind.stop(true); stopSpeak();
    cancelAnimationFrame(raf); cancelAnimationFrame(fxRaf); fxRaf=0;
    H.off("pause", onPause); H.off("resume", onResume); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("resize", onResize);
    var ov2=document.getElementById("overlay"); ov2.classList.add("hidden"); ov2.innerHTML=""; ov2._close=null; ov2.className="hidden";
    if(H.onExit) H.onExit();
  }
  function onPause(){ Wind.stop(true); fxStop(); }
  function onResume(){ if(H.S.sirahWind && !panel) Wind.start(eraWind()); fxStart(); }
  function onVis(){ if(document.hidden) onPause(); else onResume(); }
  var rzT=0; function onResize(){ clearTimeout(rzT); rzT=setTimeout(function(){ var p=scr.scrollTop/Math.max(1,maxScroll); build(); scr.scrollTop=p*maxScroll; onScroll(true); },200); }

  // ---------- build the world ----------
  function build(){
    W=root.clientWidth||window.innerWidth; VH=root.clientHeight||window.innerHeight; HZ=Math.round(Math.max(180,Math.min(VH*0.33,290)));
    root.style.setProperty("--hz",HZ+"px");
    root.innerHTML=
      '<div class="sk-scroll" id="skScr"><div class="sk-track" id="skTrack"></div></div>'+
      '<div class="sk-hz" id="skHz"><div class="sk-sky" id="skSky"></div><div class="sk-sun" id="skSun"></div><canvas id="skFx"></canvas>'+
        '<div class="sk-far" id="skFar"></div><div class="sk-lm" id="skLm"></div><div class="sk-mid" id="skMid"></div><div class="sk-near" id="skNear"></div></div><div class="sk-hzf"></div>'+
      '<div class="sk-top" id="skTop"></div><div class="sk-dock" id="skDock"></div>'+
      '<div class="sk-sheet" id="skSheet" role="dialog"><div class="sk-handle" id="skHandle"><span></span></div><div class="sk-sb" id="skSb"></div></div>'+
      '<div class="sk-panel hidden" id="skPanel"></div>';
    scr=q("#skScr"); track=q("#skTrack"); hz=q("#skHz"); skyEl=q("#skSky"); sunEl=q("#skSun"); cvs=q("#skFx"); farEl=q("#skFar"); midEl=q("#skMid"); nearEl=q("#skNear"); lmBox=q("#skLm");
    topEl=q("#skTop"); dockEl=q("#skDock"); sheet=q("#skSheet");
    cvs.width=W; cvs.height=HZ; ctx2=cvs.getContext("2d");
    layout(); drawTrack(); drawTop(); drawDock();
    focus=-1; focusEra=-1;
    scr.addEventListener("scroll", function(){ if(!raf) raf=requestAnimationFrame(function(){ raf=0; onScroll(); }); }, {passive:true});
    track.addEventListener("click", onTrackClick);
    q("#skHandle").onclick=function(){ sheet.classList.toggle("full"); };
    sheetGestures();
    onScroll(true); fxStart();
  }
  function layout(){
    items=[]; segs=[];
    var list=evs(), y=HZ+16, side=0, r=SirahArt.rnd(7), G=kids?250:240, gapM=kids?230:200, gapm=152;
    SIRAH_ERAS.forEach(function(era){
      var es=list.filter(function(e){ return e.e===era.id; }); if(!es.length) return;
      var seg={era:era.id, y0:y, gateY:y, items:[]}; y+=G;
      es.forEach(function(e){
        var x=(side? 0.70 : 0.30)*W + (r()-0.5)*W*0.06;
        var it={ev:e, i:items.length, x:Math.round(x), y:Math.round(y), side:side, era:era.id}; items.push(it); seg.items.push(it);
        y+= e.m||kids ? gapM : gapm; side=1-side;
      });
      seg.y1=y; segs.push(seg);
    });
    endY=y; track.style.height=(y+VH*0.9)+"px";
    maxScroll=Math.max(1,(y+VH*0.9)-VH);
  }
  function drawTrack(){
    var h="", r=SirahArt.rnd(3);
    segs.forEach(function(sg,si){
      var era=eraOf(sg.era), P=pal(sg.era), nx=segs[si+1]?eraOf(segs[si+1].era):era, hgt=sg.y1-sg.y0;
      // ground
      h+='<div class="sk-seg" style="top:'+sg.y0+'px;height:'+(hgt+2)+'px;background:linear-gradient(to bottom,'+era.sand+' 0,'+SirahArt.shade(era.sand,-0.06)+' 70%,'+nx.sand+' 100%)">';
      var rip=""; for(var k=0;k<hgt/80;k++){ var ry=k*80+r()*50, rx=r()*W*0.6, rw=W*(0.25+r()*0.35); rip+='<path d="M'+rx.toFixed(0)+' '+ry.toFixed(0)+' q'+(rw/4).toFixed(0)+' -6 '+(rw/2).toFixed(0)+' 0 t'+(rw/2).toFixed(0)+' 0" stroke="'+SirahArt.shade(era.sand,-0.22)+'" stroke-width="1.2" fill="none" opacity=".45"/>'; }
      h+='<svg class="sk-rip" width="'+W+'" height="'+hgt+'">'+rip+'</svg>';
      // trail
      var pts=[[W/2, 150]].concat(sg.items.map(function(it){ return [it.x, it.y-sg.y0]; })); pts.push([W/2, hgt+4]);
      var d="M"+pts[0][0]+" "+pts[0][1];
      for(var i=1;i<pts.length;i++){ var a=pts[i-1], b=pts[i], dy=(b[1]-a[1])/2; d+=" C"+a[0]+" "+(a[1]+dy)+" "+b[0]+" "+(b[1]-dy)+" "+b[0]+" "+b[1]; }
      h+='<svg class="sk-trail" width="'+W+'" height="'+(hgt+4)+'"><path d="'+d+'" stroke="'+SirahArt.shade(era.sand,0.35)+'" stroke-width="'+(kids?30:24)+'" fill="none" stroke-linecap="round" opacity=".55"/><path d="'+d+'" stroke="'+SirahArt.shade(era.sand,-0.45)+'" stroke-width="2.4" fill="none" stroke-dasharray="1 9" stroke-linecap="round" opacity=".8"/></svg>';
      h+='</div>';
      // gate
      h+='<div class="sk-gate" style="top:'+sg.gateY+'px"><div class="sk-arch">'+SirahArt.gate(P)+'</div>'+
         '<div class="sk-gtxt"><span class="sk-gn">'+(sg.era+1)+'</span><b>'+esc(L(era.t))+'</b><small>'+esc(era.yr?L(era.yr):"")+'</small></div>'+
         (kids?'<div class="sk-badgehint">'+(st.badges[sg.era]?ic("award",14)+' '+L(["Lencana diperoleh","Badge earned"]):'')+'</div>':'')+'</div>';
      // decorations between milestones
      for(var j=0;j<=sg.items.length;j++){
        var ya=j===0?sg.gateY+170:sg.items[j-1].y, yb=j<sg.items.length?sg.items[j].y:sg.y1, ym=(ya+yb)/2;
        if(yb-ya<120) continue;
        var kinds=era.deco||["rock","bush"], kd=kinds[Math.floor(r()*kinds.length)], left=r()<0.5, sz=kd==="palm"?58:kd==="camel"?46:kd==="tent"?54:30;
        var dx=left? 6+r()*W*0.12 : W-sz-6-r()*W*0.12;
        h+='<div class="sk-deco" style="top:'+Math.round(ym-sz*0.6)+'px;left:'+Math.round(dx)+'px;width:'+sz+'px">'+SirahArt.deco(kd,P.m,P.s)+'</div>';
      }
    });
    // milestones
    items.forEach(function(it){
      var e=it.ev, P=pal(it.era), major=e.m||kids, onLeft=it.x<W/2, read=st.read[e.id], fav=st.fav[e.id];
      var lw=Math.round(onLeft ? W-it.x-30 : it.x-30);
      h+='<button class="sk-ms'+(major?" major":" minor")+(read?" read":"")+'" data-i="'+it.i+'" style="top:'+it.y+'px;left:'+it.x+'px" aria-label="'+esc(L(e.t)+", "+yearTxt(e))+'">'+
        '<span class="sk-mk">'+(major?'<svg viewBox="0 0 28 40" width="'+(kids?36:28)+'" height="'+(kids?50:40)+'"><path d="M9 6h10l2 4H7z" fill="'+P.s+'"/><rect x="6" y="10" width="16" height="22" rx="4" fill="'+P.s+'"/><rect x="9" y="13" width="10" height="16" rx="3" fill="'+P.g+'"/><path d="M8 32h12l-2 5h-8z" fill="'+P.s+'"/><circle cx="14" cy="3" r="2.4" fill="none" stroke="'+P.s+'" stroke-width="1.6"/></svg>':'<i style="background:'+P.l+';border-color:'+P.s+'"></i>')+
        (read?'<em class="sk-rd"></em>':'')+(fav?'<em class="sk-fv">'+ic("star",10)+'</em>':'')+'</span>'+
        '<span class="sk-lb '+(onLeft?"r":"l")+'" style="'+(onLeft?"left":"right")+':'+(kids?30:24)+'px;max-width:'+lw+'px"><b>'+esc(L(e.t))+'</b><small>'+esc(kids?yearTxt(e):L(e.w))+'</small></span></button>';
      if(major && !kids){ var sw=Math.round(W*0.26), sx=onLeft? Math.max(4,it.x-sw-22) : Math.min(W-sw-4,it.x+22); h+='<div class="sk-set" style="top:'+(it.y+30)+'px;left:'+sx+'px;width:'+sw+'px">'+SirahArt.scene(e.sc,P)+'</div>'; }
      if(kids){ var sw2=Math.round(W*0.34), sx2=onLeft? Math.min(W-sw2-6, it.x+28) : Math.max(6,it.x-sw2-28); h+='<div class="sk-set k" style="top:'+(it.y+44)+'px;left:'+sx2+'px;width:'+sw2+'px">'+SirahArt.scene(e.sc,P)+'</div>'; }
    });
    // ending
    var Pe=pal(11);
    h+='<div class="sk-end" style="top:'+(endY+20)+'px"><div class="sk-endart">'+SirahArt.scene("crescent",Pe)+'</div>'+
      '<div class="sk-endtx">'+(kids? L(["Tamat! Kamu sudah mengikuti perjalanan Nabi Muhammad ﷺ dari lahir hingga wafat.","The end! You have followed the journey of Prophet Muhammad ﷺ from his birth to his passing."])+'<div class="sk-endb">'+ic("award",18)+' '+Object.keys(st.badges).length+' / '+segs.length+' '+L(["lencana","badges"])+'</div>'
        : '<div class="ar sk-salawat">اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ</div>'+L(["Ya Allah, limpahkanlah selawat ke atas Muhammad dan keluarga Muhammad.","O Allah, send blessings upon Muhammad and the family of Muhammad."])+
          '<div class="sk-refs">'+(window.SIRAH_REFS||[]).map(function(rf,i){ return '<button class="sk-ref" data-ref="'+i+'">'+ic("book",16)+' '+esc(L(rf.t))+'</button>'; }).join("")+'</div>')+
      '<button class="sk-btn" id="skTop2">'+ic("up",16)+' '+L(["Kembali ke awal","Back to the start"])+'</button></div></div>';
    track.innerHTML=h;
    var t2=q("#skTop2"); if(t2) t2.onclick=function(){ scr.scrollTo({top:0,behavior:calm?"auto":"smooth"}); };
    root.querySelectorAll("[data-ref]").forEach(function(b){ b.onclick=function(){ openRef(+b.getAttribute("data-ref")); }; });
  }
  function onTrackClick(e){ var b=e.target.closest(".sk-ms"); if(!b) return; var i=+b.getAttribute("data-i"); openSheet(i); }

  // ---------- top bar & dock ----------
  function drawTop(){
    topEl.innerHTML='<button class="sk-ib" id="skBack" aria-label="'+L(["Kembali","Back"])+'">'+ic("back",22)+'</button>'+
      '<div class="sk-tt"><b id="skEra"></b><span><em id="skYear"></em><em id="skAge"></em></span></div>'+
      '<button class="sk-ib" id="skWind" aria-label="'+L(["Bunyi angin","Wind sound"])+'">'+ic(H.S.sirahWind?"vol":"mute",20)+'</button>'+
      (kids?'<button class="sk-ib" id="skBadges" aria-label="'+L(["Lencana","Badges"])+'">'+ic("award",20)+'</button>':
       '<button class="sk-ib" id="skMap" aria-label="'+L(["Peta","Map"])+'">'+ic("map",20)+'</button><button class="sk-ib" id="skFind" aria-label="'+L(["Cari","Search"])+'">'+ic("search",20)+'</button><button class="sk-ib" id="skPeople" aria-label="'+L(["Tokoh","People"])+'">'+ic("list",20)+'</button>');
    q("#skBack").onclick=back;
    q("#skWind").onclick=function(){ H.S.sirahWind=!H.S.sirahWind; H.saveS(); this.innerHTML=ic(H.S.sirahWind?"vol":"mute",20); if(H.S.sirahWind) Wind.start(eraWind()); else Wind.stop(); };
    if(kids) q("#skBadges").onclick=showBadges;
    else { q("#skMap").onclick=function(){ showMap(); }; q("#skFind").onclick=showSearch; q("#skPeople").onclick=function(){ showPeople(); }; }
  }
  function drawDock(){
    if(kids){
      dockEl.innerHTML='<div class="sk-stones">'+segs.map(function(sg){ var P=pal(sg.era); return '<button class="sk-stone'+(st.badges[sg.era]?" got":"")+'" data-se="'+sg.era+'" style="background:'+eraOf(sg.era).sand+';border-color:'+P.s+'" aria-label="'+esc(L(eraOf(sg.era).t))+'">'+(sg.era+1)+'</button>'; }).join("")+'</div>';
      dockEl.querySelectorAll("[data-se]").forEach(function(b){ b.onclick=function(){ var sg=segs.filter(function(s){ return s.era===+b.getAttribute("data-se"); })[0]; if(sg) scr.scrollTo({top:Math.max(0,sg.gateY-HZ-10),behavior:calm?"auto":"smooth"}); }; });
      return;
    }
    var tot=endY-segs[0].y0;
    dockEl.innerHTML='<div class="sk-scrub" id="skScrub"><div class="sk-bar">'+segs.map(function(sg){ var P=pal(sg.era); return '<i style="flex:'+((sg.y1-sg.y0)/tot).toFixed(4)+';background:'+eraOf(sg.era).sand+';border-right:1px solid '+P.s+'"></i>'; }).join("")+'</div><b class="sk-thumb" id="skThumb"></b><span class="sk-bub hidden" id="skBub"></span></div>'+
      '<div class="sk-scale"><span>'+Math.floor(SIRAH[0].y)+'</span><span>622</span><span>632</span></div>';
    var bar=q("#skScrub"), bub=q("#skBub"), drag=false, lastEra=-1;
    var at=function(cx){ var rc=bar.getBoundingClientRect(), f=Math.max(0,Math.min(1,(cx-rc.left)/rc.width)); var yy=segs[0].y0+f*tot; scr.scrollTop=Math.max(0,yy-HZ-(VH-HZ)*0.35);
      onScroll(true); var it=items[Math.max(0,focus)]; if(it){ bub.textContent=L(eraOf(it.era).t)+" · "+yearTxt(it.ev); bub.style.left=(f*100)+"%"; bub.classList.remove("hidden"); if(it.era!==lastEra){ if(lastEra>=0) H.N.vibrate(10); lastEra=it.era; } } };
    bar.addEventListener("pointerdown", function(e){ drag=true; bar.setPointerCapture(e.pointerId); at(e.clientX); });
    bar.addEventListener("pointermove", function(e){ if(drag) at(e.clientX); });
    var up=function(){ drag=false; bub.classList.add("hidden"); saveSt(); }; bar.addEventListener("pointerup", up); bar.addEventListener("pointercancel", up);
  }

  // ---------- scrolling: focus, sky, parallax ----------
  function onScroll(force){
    var top=scr.scrollTop, fy=top+HZ+(VH-HZ)*0.35, best=-1, bd=1e9;
    for(var i=0;i<items.length;i++){ var d=Math.abs(items[i].y-fy); if(d<bd){ bd=d; best=i; } }
    var sgi=0; for(var s=0;s<segs.length;s++) if(fy>=segs[s].y0-60) sgi=s;
    var sg=segs[sgi], era=eraOf(sg.era), nxt=segs[sgi+1]?eraOf(segs[sgi+1].era):era;
    var t=Math.max(0,Math.min(1,(fy-(sg.y0+(sg.y1-sg.y0)*0.7))/((sg.y1-sg.y0)*0.3+60)));
    var c0=SirahArt.mix(era.sky[0],nxt.sky[0],t), c1=SirahArt.mix(era.sky[1],nxt.sky[1],t);
    skyEl.style.background="linear-gradient(to bottom,"+c0+" 0%,"+c1+" 100%)";
    if(sg.era!==focusEra || force){ focusEra=sg.era; drawHorizon(sg.era); if(Wind.on) Wind.level(eraWind()); }
    if(best!==focus || force){ focus=best; var it=items[best]; if(it){ q("#skEra").textContent=L(eraOf(it.era).t); q("#skYear").textContent=yearTxt(it.ev); var ag=ageTxt(it.ev); var ae=q("#skAge"); ae.textContent=ag; ae.style.display=ag?"":"none"; setLandmark(it.ev.sc, it.era); } }
    if(!calm){ farEl.style.transform="translate3d("+(-((top*0.05)%W)).toFixed(1)+"px,0,0)"; midEl.style.transform="translate3d("+(-((top*0.12)%W)).toFixed(1)+"px,0,0)"; }
    var th=q("#skThumb"); if(th) th.style.left=(Math.max(0,Math.min(1,(fy-segs[0].y0)/(endY-segs[0].y0)))*100)+"%";
    if(Math.abs(top-lastScroll)>400){ lastScroll=top; st.pos=top; saveSt(); }
  }
  function drawHorizon(eraId){
    var era=eraOf(eraId), P=pal(eraId), A=SirahArt; root.style.setProperty("--sand",era.sand); root.style.setProperty("--sky1",era.sky[1]); var far=A.mix(era.sky[1],P.s,0.5), mid=A.shade(era.sand,-0.2);
    var fp=A.ridgePath(11+eraId*7, W, HZ, HZ*0.62, HZ*0.22, 0.6), mp=A.dunePath(5+eraId*3, W, HZ, HZ*0.84, HZ*0.06), np=A.dunePath(9+eraId, W, HZ, HZ*0.95, HZ*0.03);
    farEl.innerHTML='<svg width="'+(W*2)+'" height="'+HZ+'"><path d="'+fp+'" fill="'+far+'"/><path d="'+fp+'" fill="'+far+'" transform="translate('+W+' 0)"/></svg>';
    midEl.innerHTML='<svg width="'+(W*2)+'" height="'+HZ+'"><path d="'+mp+'" fill="'+mid+'"/><path d="'+mp+'" fill="'+mid+'" transform="translate('+W+' 0)"/></svg>';
    nearEl.innerHTML='<svg width="'+W+'" height="'+HZ+'"><path d="'+np+'" fill="'+era.sand+'"/></svg>';
    var c=era.cel||{};
    sunEl.className="sk-sun"+(c.k?" "+c.k:""); sunEl.style.display=c.k?"":"none";
    if(c.k){ sunEl.style.left=(c.x*100)+"%"; sunEl.style.top=(c.y*HZ)+"px"; sunEl.style.width=sunEl.style.height=(c.r*2)+"px"; sunEl.style.setProperty("--c",c.c); }
    parts=[]; var r=A.rnd(eraId+1);
    if(era.stars) for(var i=0;i<70;i++) parts.push({x:r()*W,y:r()*HZ*0.6,r:0.4+r()*1.1,p:r()*6.28,s:0.5+r()*1.5,star:1});
    else for(var j=0;j<(calm?0:26);j++) parts.push({x:r()*W,y:HZ*0.55+r()*HZ*0.42,r:0.6+r()*1.2,v:0.25+r()*0.6,p:r()*6.28});
    if(calm) fxDraw(0);
  }
  var lmKey="";
  function setLandmark(sc, eraId){
    var key=sc+"|"+eraId; if(key===lmKey) return; lmKey=key;
    var P=pal(eraId), P2={s:SirahArt.mix(P.s,eraOf(eraId).sky[1],0.18), m:P.m, l:P.l, g:P.g};
    var d=document.createElement("div"); d.className="sk-lmi"; d.innerHTML=SirahArt.scene(sc,P2);
    lmBox.appendChild(d); var old=lmBox.querySelectorAll(".sk-lmi");
    requestAnimationFrame(function(){ d.classList.add("on"); for(var i=0;i<old.length-1;i++){ (function(o){ o.classList.remove("on"); setTimeout(function(){ if(o.parentNode) o.parentNode.removeChild(o); },calm?0:700); })(old[i]); } });
  }
  // stars twinkle / sand drift on the horizon canvas
  function fxDraw(ts){
    if(!ctx2) return; ctx2.clearRect(0,0,W,HZ);
    for(var i=0;i<parts.length;i++){ var p=parts[i];
      if(p.star){ var a=calm?0.7:0.35+0.65*Math.abs(Math.sin(p.p+ts/1000*p.s)); ctx2.fillStyle="rgba(255,248,230,"+a.toFixed(2)+")"; ctx2.beginPath(); ctx2.arc(p.x,p.y,p.r,0,6.283); ctx2.fill(); }
      else { p.x-=p.v; if(p.x<-4) p.x=W+4; var yy=p.y+Math.sin(p.p+ts/700)*2; ctx2.fillStyle="rgba(255,240,210,0.55)"; ctx2.beginPath(); ctx2.arc(p.x,yy,p.r,0,6.283); ctx2.fill(); }
    }
  }
  function fxStart(){ if(calm||fxRaf) { if(calm) fxDraw(0); return; } var loop=function(ts){ fxDraw(ts); fxRaf=requestAnimationFrame(loop); }; fxRaf=requestAnimationFrame(loop); }
  function fxStop(){ cancelAnimationFrame(fxRaf); fxRaf=0; }
  function eraWind(){ var e=eraOf(Math.max(0,focusEra)); return e.wind||1; }

  // ---------- story card ----------
  function openSheet(i){
    var it=items[i]; if(!it) return; sheetIdx=i; var e=it.ev, P=pal(it.era);
    if(!st.read[e.id]){ st.read[e.id]=1; saveSt(); var b=track.querySelector('.sk-ms[data-i="'+i+'"]'); if(b){ b.classList.add("read"); var mk=b.querySelector(".sk-mk"); if(mk && !mk.querySelector(".sk-rd")) mk.insertAdjacentHTML("beforeend",'<em class="sk-rd"></em>'); } }
    var h='<button class="sk-ib sk-x" id="skX" aria-label="'+L(["Tutup","Close"])+'">'+ic("close",20)+'</button>';
    h+='<div class="sk-art" style="background:linear-gradient(to bottom,'+eraOf(it.era).sky[0]+','+eraOf(it.era).sky[1]+')">'+SirahArt.scene(e.sc,P)+'</div>';
    h+='<div class="sk-tag">'+esc(L(eraOf(it.era).t))+(e.m&&!kids?' · <b>'+L(["Peristiwa besar","Major event"])+'</b>':'')+'</div>';
    h+='<h2 class="sk-h">'+esc(L(e.t))+'</h2>';
    if(kids){
      h+='<div class="sk-meta">'+ic("cal",14)+' '+esc(yearTxt(e))+(ageTxt(e)?' · '+esc(ageTxt(e)):'')+'</div>';
      h+='<p class="sk-kid">'+esc(L(e.k||e.f))+'</p>';
      if(e.ay && e.ay[0] && e.ay[0].kid) h+=ayatHtml(e.ay[0]);
      h+='<button class="sk-big" id="skSay">'+ic("play",22)+' '+L(["Dengar cerita","Listen to the story"])+'</button>';
      var lastInEra=!items[i+1]||items[i+1].era!==it.era;
      if(lastInEra && window.SIRAH_QUIZ && SIRAH_QUIZ[it.era]) h+='<button class="sk-big gold" id="skQuiz">'+ic("award",22)+' '+(st.badges[it.era]?L(["Main kuiz lagi","Play the quiz again"]):L(["Jawab kuiz & dapatkan lencana","Answer the quiz & earn a badge"]))+'</button>';
    } else {
      h+='<div class="sk-meta">'+ic("cal",14)+' '+esc(L(e.w))+' · '+esc(yearTxt(e))+'</div>';
      h+='<div class="sk-meta">'+(ageTxt(e)?esc(ageTxt(e))+' · ':'')+ic("pin",14)+' <a href="#" id="skPl">'+esc(placeName(e.pl))+'</a></div>';
      h+='<div class="sk-acts"><button class="sk-ib" id="skSay" aria-label="'+L(["Dengar","Listen"])+'">'+ic("play",20)+'</button><button class="sk-ib'+(st.fav[e.id]?" on":"")+'" id="skFav" aria-label="'+L(["Simpan","Save"])+'">'+ic("star",20)+'</button><button class="sk-ib" id="skShare" aria-label="'+L(["Kongsi","Share"])+'">'+ic("share",20)+'</button></div>';
      h+=paras(L(e.f));
      if(e.l && e.l.length) h+='<div class="sk-sec"><h4>'+L(["Pengajaran","Lessons"])+'</h4><ul>'+e.l.map(function(x){ return '<li>'+esc(L(x))+'</li>'; }).join("")+'</ul></div>';
      if(e.ay && e.ay.length) h+='<div class="sk-sec"><h4>'+L(["Ayat berkaitan","Related ayat"])+'</h4>'+e.ay.map(ayatHtml).join("")+'</div>';
      if(e.hd && e.hd.length) h+='<div class="sk-sec"><h4>'+L(["Hadith","Hadith"])+'</h4>'+e.hd.map(function(x){ return '<div class="sk-hd">'+esc(L(x.m))+'<small>'+esc(x.r)+'</small></div>'; }).join("")+'</div>';
      if(e.o) h+='<div class="sk-sec sk-other"><h4>'+L(["Pendapat lain","Other views"])+'</h4>'+esc(L(e.o))+'</div>';
      if(e.p && e.p.length) h+='<div class="sk-sec"><h4>'+L(["Tokoh dalam peristiwa ini","People in this event"])+'</h4><div class="sk-chips">'+e.p.map(function(pid){ var pp=SIRAH_PEOPLE[pid]; return pp?'<button class="sk-chip" data-pp="'+pid+'">'+esc(L(pp.t))+'</button>':''; }).join("")+'</div></div>';
      h+='<div class="sk-src">'+ic("book",14)+' Ar-Raheeq al-Makhtum · '+esc(srcTxt(e.s))+'</div>';
    }
    h+='<div class="sk-nav"><button class="sk-btn" id="skPrev" '+(i>0?"":"disabled")+'>'+ic("prev",18)+' '+L(["Sebelum","Previous"])+'</button><button class="sk-btn" id="skNext" '+(i<items.length-1?"":"disabled")+'>'+L(["Seterusnya","Next"])+' '+ic("next",18)+'</button></div>';
    var sb=q("#skSb"); sb.innerHTML=h; sb.scrollTop=0;
    sheet.classList.add("open"); if(kids) sheet.classList.add("full");
    q("#skX").onclick=closeSheet;
    q("#skPrev").onclick=function(){ go(i-1); }; q("#skNext").onclick=function(){ go(i+1); };
    q("#skSay").onclick=function(){ sayStory(e); };
    var qz=q("#skQuiz"); if(qz) qz.onclick=function(){ showQuiz(it.era); };
    var fv=q("#skFav"); if(fv) fv.onclick=function(){ if(st.fav[e.id]) delete st.fav[e.id]; else st.fav[e.id]=1; saveSt(); fv.classList.toggle("on",!!st.fav[e.id]); drawTrackKeep(); };
    var sh=q("#skShare"); if(sh) sh.onclick=function(){ H.shareCard({title:L(e.t)+" · "+yearTxt(e), ar:(e.ay&&e.ay[0])?e.ay[0].ar:"", text:shortText(L(e.f)), src:"Ar-Raheeq al-Makhtum · "+srcTxt(e.s)}); };
    var pl=q("#skPl"); if(pl) pl.onclick=function(ev){ ev.preventDefault(); showMap(e.pl); };
    sb.querySelectorAll("[data-pp]").forEach(function(b){ b.onclick=function(){ showPeople(b.getAttribute("data-pp")); }; });
    sb.querySelectorAll("[data-say-ar]").forEach(function(b){ b.onclick=function(){ H.speakAr(b.getAttribute("data-say-ar")); }; });
  }
  function go(i){ if(i<0||i>=items.length) return; stopSpeak(); var it=items[i]; scr.scrollTop=Math.max(0,it.y-HZ-(VH-HZ)*0.35); onScroll(true); openSheet(i); }
  function closeSheet(){ sheet.classList.remove("open","full"); stopSpeak(); sheetIdx=-1; }
  function drawTrackKeep(){ var tp=scr.scrollTop; drawTrack(); scr.scrollTop=tp; }
  function paras(t){ return String(t||"").split(/\n+/).map(function(p){ return '<p class="sk-p">'+esc(p)+'</p>'; }).join(""); }
  function shortText(t){ t=String(t||""); if(t.length<=420) return t; var c=t.slice(0,420); return c.slice(0,c.lastIndexOf(" "))+"…"; }
  function ayatHtml(a){ return '<div class="sk-ay"><div class="ar">'+a.ar+'</div><div class="sk-aym">'+esc(L(a.m))+'</div><small>'+esc(a.r)+' <button class="sk-mini" data-say-ar="'+esc(a.ar)+'" aria-label="'+L(["Dengar ayat","Listen to the ayah"])+'">'+ic("play",14)+'</button></small></div>'; }
  function placeName(id){ var p=SIRAH_PLACES[id]; return p?L(p.t):""; }
  function srcTxt(s){ if(!s) return ""; var p=s.split("|"), e=p[0]||"", m=p[1]||"";
    if(en) return e || "the Malay edition, closing chapter";
    if(m) return m; var pg=e.match(/p\.\d+/g); return "edisi bahasa Inggeris"+(pg?", hlm. "+pg.map(function(x){ return x.slice(2); }).join(", "):""); }
  var speaking=false;
  function sayStory(e){ var t=L(e.t)+". "+(kids?L(e.k||e.f):L(e.f)); if(speaking){ stopSpeak(); return; } speaking=true;
    if(window.Native && H.N.speak) H.N.speak(t, en?"en":"ms");
    else { try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(t); u.lang=en?"en-GB":"ms-MY"; u.rate=0.95; u.onend=function(){ speaking=false; }; speechSynthesis.speak(u); }catch(x){} } }
  function stopSpeak(){ speaking=false; try{ if(H.N.stopSpeak) H.N.stopSpeak(); }catch(x){} try{ speechSynthesis.cancel(); }catch(x){} }
  function sheetGestures(){
    var sb=q("#skSb"), sx=0, sy=0, t0=0;
    // 0.33.0: the story card follows the finger; let go and the next event slides in
    if(window.IbSwipe) window.IbSwipe(sb, {can:function(s){ var j=sheetIdx+(s<0?1:-1); return sheetIdx>=0 && j>=0 && j<items.length; }, go:function(s){ go(sheetIdx+(s<0?1:-1)); }});
    var hd=q("#skHandle"), hy=0; hd.addEventListener("touchstart",function(e){ hy=e.touches[0].clientY; },{passive:true});
    hd.addEventListener("touchend",function(e){ var d=e.changedTouches[0].clientY-hy; if(d<-30) sheet.classList.add("full"); else if(d>40){ if(sheet.classList.contains("full")&&!kids) sheet.classList.remove("full"); else closeSheet(); } },{passive:true});
  }

  // ---------- panels ----------
  function openPanel(title, body, cls){
    panel=q("#skPanel"); panel.className="sk-panel"+(cls?" "+cls:"");
    panel.innerHTML='<div class="sk-ph"><button class="sk-ib" id="skPB" aria-label="'+L(["Kembali","Back"])+'">'+ic("back",22)+'</button><b>'+title+'</b></div><div class="sk-pb" id="skPBody">'+body+'</div>';
    q("#skPB").onclick=closePanel; fxStop(); return q("#skPBody");
  }
  function closePanel(){ if(!panel) return; panel.className="sk-panel hidden"; panel.innerHTML=""; panel=null; if(mapAnim){ cancelAnimationFrame(mapAnim); mapAnim=0; } fxStart(); }
  function jumpTo(id){ for(var i=0;i<items.length;i++) if(items[i].ev.id===id){ closePanel(); go(i); return; } }

  // intro
  function showIntro(){
    var any=Object.keys(st.read).length>0||st.pos>0, n=items.length;
    var body='<div class="sk-intro"><div class="sk-iart">'+SirahArt.scene("crescent",pal(6))+'</div>'+
      '<div class="ar sk-ititle">'+(kids?"سيرة النبي ﷺ":"السيرة النبوية")+'</div>'+
      '<h2>'+(kids?L(["Sirah Kanak-kanak","Sirah for Kids"]):L(["Perjalanan 63 Tahun","The 63-Year Journey"]))+'</h2>'+
      '<p>'+(kids?L(["Ikut jejak Nabi Muhammad ﷺ merentasi padang pasir. Baca "+n+" kisah, jawab kuiz, dan kumpul lencana!","Follow the footsteps of Prophet Muhammad ﷺ across the desert. Read "+n+" stories, answer quizzes and collect badges!"])
        :L(["Kehidupan Nabi Muhammad ﷺ dari sebelum kelahiran hingga wafat: "+n+" peristiwa mengikut susunan Ar-Raheeq al-Makhtum.","The life of Prophet Muhammad ﷺ from before his birth to his passing: "+n+" events in the order of Ar-Raheeq al-Makhtum."]))+'</p>'+
      (kids?'<div class="sk-shelf">'+segs.map(function(sg){ var got=st.badges[sg.era]; return '<div class="sk-bd'+(got?" got":"")+'" title="'+esc(L(eraOf(sg.era).t))+'">'+(got?SirahArt.scene(eraOf(sg.era).badge||"kaabah",pal(sg.era)):'<span>'+(sg.era+1)+'</span>')+'</div>'; }).join("")+'</div>':'')+
      '<div class="sk-ibtns">'+(any?'<button class="sk-big gold" id="skCont">'+L(["Sambung","Continue"])+'</button>':'')+'<button class="sk-big'+(any?"":" gold")+'" id="skStart">'+L(["Mula dari awal","Start from the beginning"])+'</button></div>'+
      '<div class="sk-iopts"><label><input type="checkbox" id="skWindC" '+(H.S.sirahWind?"checked":"")+'> '+L(["Bunyi angin","Wind sound"])+'</label><label><input type="checkbox" id="skCalmC" '+(H.S.sirahCalm?"checked":"")+'> '+L(["Kurangkan animasi","Reduce motion"])+'</label></div>'+
      (kids?'':'<div class="sk-ilinks"><button class="sk-chip" id="skIMap">'+ic("map",14)+' '+L(["Peta","Map"])+'</button><button class="sk-chip" id="skIPeople">'+ic("list",14)+' '+L(["Tokoh","People"])+'</button><button class="sk-chip" id="skIFind">'+ic("search",14)+' '+L(["Cari","Search"])+'</button></div>')+
      '<div class="sk-note">'+L(["Tiada gambar manusia, Nabi atau malaikat dilukis. Kisah ditulis semula berdasarkan Ar-Raheeq al-Makhtum (Safiyyurrahman al-Mubarakfuri).","No people, Prophet or angels are drawn. The stories are retold from Ar-Raheeq al-Makhtum (Safiyyur-Rahman al-Mubarakpuri)."])+'</div></div>';
    var b=openPanel(kids?L(["Sirah Kanak-kanak","Sirah for Kids"]):L(["Sirah Nabi ﷺ","Sirah of the Prophet ﷺ"]), body, "intro");
    q("#skPB").onclick=exit;
    var start=function(pos){ closePanel(); scr.scrollTop=pos; onScroll(true); if(H.S.sirahWind) Wind.start(eraWind()); };
    var c=q("#skCont"); if(c) c.onclick=function(){ start(st.pos||0); };
    q("#skStart").onclick=function(){ start(0); };
    q("#skWindC").onchange=function(){ H.S.sirahWind=this.checked; H.saveS(); var w=q("#skWind"); if(w) w.innerHTML=ic(H.S.sirahWind?"vol":"mute",20); };
    q("#skCalmC").onchange=function(){ H.S.sirahCalm=this.checked; H.saveS(); calm=this.checked; root.classList.toggle("calm",calm); if(calm){ fxStop(); farEl.style.transform=midEl.style.transform=""; } };
    if(!kids){ q("#skIMap").onclick=function(){ closePanel(); showMap(); }; q("#skIPeople").onclick=function(){ closePanel(); showPeople(); }; q("#skIFind").onclick=function(){ closePanel(); showSearch(); }; }
  }

  // map
  var mapAnim=0;
  function showMap(focusPl){
    var MW=Math.min(W-16,520), MH=Math.round(MW*1.18), box={lon0:31,lon1:52,lat0:10.5,lat1:34};
    var pj=function(lon,lat){ return [(lon-box.lon0)/(box.lon1-box.lon0)*MW, (box.lat1-lat)/(box.lat1-box.lat0)*MH]; };
    var readPl={}; SIRAH.forEach(function(e){ if(st.read[e.id]) readPl[e.pl]=1; });
    var cnt={}; SIRAH.forEach(function(e){ cnt[e.pl]=(cnt[e.pl]||0)+1; });
    var pins="", lbl="";
    Object.keys(SIRAH_PLACES).forEach(function(id){ var p=SIRAH_PLACES[id]; if(!cnt[id]||p.lon==null) return; var c=pj(p.lon,p.lat), major=p.big;
      pins+='<g class="sk-pin'+(readPl[id]?" read":"")+(focusPl===id?" focus":"")+'" data-pl="'+id+'" transform="translate('+c[0].toFixed(1)+' '+c[1].toFixed(1)+')"><circle r="14" fill="transparent"/><circle r="'+(major?5.5:3.8)+'"/></g>';
      lbl+='<text x="'+(c[0]+8).toFixed(1)+'" y="'+(c[1]+4).toFixed(1)+'" class="sk-ml" data-bx="'+c[0].toFixed(1)+'" data-by="'+c[1].toFixed(1)+'" data-pri="'+(focusPl===id?3:major?2:cnt[id]>2?1:0)+'" data-bp="'+(major?2:cnt[id]>2?1:0)+'" data-pl="'+id+'">'+esc(L(p.t).split(" (")[0].split(",")[0])+'</text>'; });
    var route=(window.SIRAH_HIJRAH||[]).map(function(p){ var c=pj(p[0],p[1]); return c[0].toFixed(1)+","+c[1].toFixed(1); }).join(" ");
    var mp={sea:"#20384f",land:"#c9a36b",land2:"#b48f5c",edge:"#5a4026"};
    var svg='<svg viewBox="0 0 '+MW+' '+MH+'" width="'+MW+'" height="'+MH+'" class="sk-mapsvg" id="skMapSvg"><g id="skMapG">'+
      '<rect width="'+MW+'" height="'+MH+'" fill="'+mp.sea+'"/>'+polyPath(SirahArt.AFRICA,pj,mp.land2,mp.edge)+polyPath(SirahArt.ASIA,pj,mp.land,mp.edge)+
      '<text x="'+pj(44,20)[0]+'" y="'+pj(44,20)[1]+'" class="sk-mreg">'+L(["SEMENANJUNG ARAB","ARABIAN PENINSULA"])+'</text><text x="'+pj(38.3,19)[0]+'" y="'+pj(38.3,19)[1]+'" class="sk-msea" transform="rotate(58 '+pj(38.3,19)[0]+' '+pj(38.3,19)[1]+')">'+L(["Laut Merah","Red Sea"])+'</text>'+
      '<polyline points="'+route+'" class="sk-route"/><g id="skCamel" style="display:none">'+'<path d="M-9 1c0-3 2-4 4-4 1-3 4-3 5-1 1-1 2-1 3 0l1.5-2c.5-1 2-1 2.5 0l.5 1-1 .5h-1l-1 3c0 1.5-1 2-2 2v4h-1v-3.5h-5v3.5h-1v-3.5c-2 0-3.5.5-4-1z" fill="#2b1d12"/></g>'+
      pins+lbl+'</g></svg>';
    var body='<div class="sk-mapwrap" id="skMapWrap">'+svg+'</div><div class="sk-maptools"><button class="sk-chip" id="skHij">'+L(["Animasi laluan Hijrah","Animate the Hijrah route"])+'</button><button class="sk-chip" id="skZin">＋</button><button class="sk-chip" id="skZout">－</button></div><div class="mut tiny sk-mapnote">'+L(["Peta anggaran untuk gambaran sahaja.","Approximate map, for orientation only."])+'</div><div id="skPlList"></div>';
    var b=openPanel(L(["Peta peristiwa","Map of events"]), body, "map");
    var wrap=q("#skMapWrap"), g=q("#skMapG"), sc=1, tx=0, ty=0;
    var apply=function(){ g.setAttribute("transform","translate("+tx.toFixed(1)+" "+ty.toFixed(1)+") scale("+sc+")"); declutter(); };
    // keep pins and labels the same size on screen while zooming, and hide labels that would overlap
    var declutter=function(){ var k=1/sc, placed=[], ls=[].slice.call(g.querySelectorAll(".sk-ml"));
      g.querySelectorAll(".sk-pin").forEach(function(pn){ var m=/translate\(([-\d.]+) ([-\d.]+)\)/.exec(pn.getAttribute("transform")); if(m) pn.setAttribute("transform","translate("+m[1]+" "+m[2]+") scale("+k.toFixed(3)+")"); });
      ls.sort(function(a,b){ return b.getAttribute("data-pri")-a.getAttribute("data-pri"); });
      ls.forEach(function(t){ var bx=+t.getAttribute("data-bx"), by=+t.getAttribute("data-by"), pri=+t.getAttribute("data-pri");
        t.setAttribute("x",(bx+8*k).toFixed(1)); t.setAttribute("y",(by+4*k).toFixed(1)); t.style.fontSize=(12*k).toFixed(2)+"px"; t.style.strokeWidth=(3*k).toFixed(2)+"px";
        if(pri<2 && sc<1.8 && pri!==3){ t.style.display="none"; return; } t.style.display="";
        var r=t.getBBox(), hit=placed.some(function(o){ return r.x<o.x+o.width && r.x+r.width>o.x && r.y<o.y+o.height && r.y+r.height>o.y; });
        if(hit && pri<3) t.style.display="none"; else placed.push(r); }); };
    var zoom=function(f,cx,cy){ var ns=Math.max(1,Math.min(4,sc*f)); cx=cx==null?MW/2:cx; cy=cy==null?MH/2:cy; tx=cx-(cx-tx)*ns/sc; ty=cy-(cy-ty)*ns/sc; sc=ns; clamp(); apply(); };
    var clamp=function(){ tx=Math.min(0,Math.max(MW-MW*sc,tx)); ty=Math.min(0,Math.max(MH-MH*sc,ty)); };
    q("#skZin").onclick=function(){ zoom(1.5); }; q("#skZout").onclick=function(){ zoom(1/1.5); };
    var ptrs={}, last=null, pd=0;
    wrap.addEventListener("pointerdown",function(e){ ptrs[e.pointerId]=[e.clientX,e.clientY]; last=[e.clientX,e.clientY]; var k=Object.keys(ptrs); if(k.length===2){ var a=ptrs[k[0]],c=ptrs[k[1]]; pd=Math.hypot(a[0]-c[0],a[1]-c[1]); } });
    wrap.addEventListener("pointermove",function(e){ if(!ptrs[e.pointerId]) return; ptrs[e.pointerId]=[e.clientX,e.clientY]; var k=Object.keys(ptrs);
      if(k.length===2){ var a=ptrs[k[0]],c=ptrs[k[1]], d=Math.hypot(a[0]-c[0],a[1]-c[1]); if(pd){ var rc=wrap.getBoundingClientRect(); zoom(d/pd,(a[0]+c[0])/2-rc.left,(a[1]+c[1])/2-rc.top); } pd=d; }
      else if(last && sc>1){ tx+=e.clientX-last[0]; ty+=e.clientY-last[1]; clamp(); apply(); last=[e.clientX,e.clientY]; } });
    var upf=function(e){ delete ptrs[e.pointerId]; pd=0; last=null; }; wrap.addEventListener("pointerup",upf); wrap.addEventListener("pointercancel",upf);
    wrap.querySelectorAll("[data-pl]").forEach(function(p){ p.addEventListener("click",function(){ listPlace(p.getAttribute("data-pl")); apply(); }); });
    q("#skHij").onclick=function(){ animHijrah(pj); };
    if(focusPl){ listPlace(focusPl); var pc=SIRAH_PLACES[focusPl]; if(pc&&pc.lon!=null){ var c=pj(pc.lon,pc.lat); sc=2.2; tx=MW/2-c[0]*sc; ty=MH/2-c[1]*sc; clamp(); } }
    apply();
  }
  function polyPath(arr,pj,fill,edge){ if(!arr) return ""; return '<path d="'+arr.map(function(p,i){ var c=pj(p[0],p[1]); return (i?"L":"M")+c[0].toFixed(1)+" "+c[1].toFixed(1); }).join(" ")+'Z" fill="'+fill+'" stroke="'+edge+'" stroke-width="1"/>'; }
  function listPlace(id){
    var p=SIRAH_PLACES[id], es=SIRAH.filter(function(e){ return e.pl===id; }); var el=q("#skPlList"); if(!el||!p) return;
    root.querySelectorAll(".sk-pin").forEach(function(g){ g.classList.toggle("focus", g.getAttribute("data-pl")===id); });
    root.querySelectorAll(".sk-ml").forEach(function(t){ t.setAttribute("data-pri", t.getAttribute("data-pl")===id?3:t.getAttribute("data-bp")); });
    el.innerHTML='<h4 class="sk-plh">'+ic("pin",16)+' '+esc(L(p.t))+'</h4>'+es.map(function(e){ return '<button class="sk-row" data-go="'+e.id+'"><b>'+esc(L(e.t))+'</b><small>'+esc(yearTxt(e))+'</small></button>'; }).join("");
    el.querySelectorAll("[data-go]").forEach(function(b){ b.onclick=function(){ jumpTo(b.getAttribute("data-go")); }; });
  }
  function animHijrah(pj){
    var R=(window.SIRAH_HIJRAH||[]).map(function(p){ return pj(p[0],p[1]); }); if(R.length<2) return;
    var cam=q("#skCamel"), lens=[0]; for(var i=1;i<R.length;i++) lens.push(lens[i-1]+Math.hypot(R[i][0]-R[i-1][0],R[i][1]-R[i-1][1]));
    var tot=lens[lens.length-1], t0=null, dur=calm?1:7000; cam.style.display="";
    var step=function(ts){ if(!t0) t0=ts; var f=Math.min(1,(ts-t0)/dur), d=f*tot, k=1; while(k<lens.length-1 && lens[k]<d) k++; var seg=(d-lens[k-1])/Math.max(0.001,lens[k]-lens[k-1]);
      var x=R[k-1][0]+(R[k][0]-R[k-1][0])*seg, y=R[k-1][1]+(R[k][1]-R[k-1][1])*seg, flip=R[k][0]<R[k-1][0]?-1:1; cam.setAttribute("transform","translate("+x.toFixed(1)+" "+(y-4).toFixed(1)+") scale("+(1.3*flip)+" 1.3)");
      if(f<1) mapAnim=requestAnimationFrame(step); else { mapAnim=0; listPlace("madinah"); } };
    if(mapAnim) cancelAnimationFrame(mapAnim); mapAnim=requestAnimationFrame(step);
  }

  // people
  function showPeople(openId){
    var ids=Object.keys(SIRAH_PEOPLE), body='<input class="sk-in" id="skPQ" type="search" placeholder="'+L(["Cari nama...","Search a name..."])+'"><div id="skPL"></div>';
    openPanel(L(["Tokoh dalam Sirah","People in the Sirah"]), body);
    var draw=function(f){ f=(f||"").toLowerCase();
      q("#skPL").innerHTML=ids.filter(function(id){ var p=SIRAH_PEOPLE[id]; return !f || (p.t[0]+" "+p.t[1]).toLowerCase().indexOf(f)>=0; }).map(function(id){ var p=SIRAH_PEOPLE[id], es=SIRAH.filter(function(e){ return e.p && e.p.indexOf(id)>=0; });
        return '<details class="sk-pp" id="pp_'+id+'" '+(id===openId?"open":"")+'><summary><span class="sk-mono ar">'+(p.mono||"")+'</span><b>'+esc(L(p.t))+'</b><small>'+es.length+' '+L(["peristiwa","events"])+'</small></summary><p>'+esc(L(p.b))+'</p><div class="sk-chips">'+es.map(function(e){ return '<button class="sk-chip" data-go="'+e.id+'">'+esc(L(e.t))+'</button>'; }).join("")+'</div></details>'; }).join("");
      root.querySelectorAll("#skPL [data-go]").forEach(function(b){ b.onclick=function(){ jumpTo(b.getAttribute("data-go")); }; }); };
    draw(""); q("#skPQ").oninput=function(){ draw(this.value); };
    if(openId){ var el=q("#pp_"+openId); if(el) setTimeout(function(){ el.scrollIntoView({block:"start"}); },30); }
  }
  // search
  function showSearch(){
    openPanel(L(["Cari dalam Sirah","Search the Sirah"]), '<input class="sk-in" id="skSQ" type="search" placeholder="'+L(["Cth: Badar, Hira, Khadijah, Ta'if","E.g. Badr, Hira, Khadijah, Ta'if"])+'"><div id="skSL"></div>');
    var inp=q("#skSQ"), fav=SIRAH.filter(function(e){ return st.fav[e.id]; });
    var row=function(e){ return '<button class="sk-row" data-go="'+e.id+'"><b>'+esc(L(e.t))+'</b><small>'+esc(L(eraOf(e.e).t))+' · '+esc(yearTxt(e))+'</small></button>'; };
    var bind=function(){ root.querySelectorAll("#skSL [data-go]").forEach(function(b){ b.onclick=function(){ jumpTo(b.getAttribute("data-go")); }; }); };
    var draw=function(v){ v=(v||"").trim().toLowerCase();
      if(!v){ q("#skSL").innerHTML=fav.length?'<h4 class="sk-plh">'+ic("star",16)+' '+L(["Disimpan","Saved"])+'</h4>'+fav.map(row).join(""):'<div class="mut small" style="padding:10px 4px">'+L(["Taip nama peristiwa, tempat atau tokoh.","Type an event, place or person."])+'</div>'; bind(); return; }
      var hits=SIRAH.map(function(e){ var s=0, t=L(e.t).toLowerCase(), pl=placeName(e.pl).toLowerCase(), pp=(e.p||[]).map(function(id){ var x=SIRAH_PEOPLE[id]; return x?L(x.t).toLowerCase():""; }).join(" ");
        if(t.indexOf(v)>=0) s+=10; if(pl.indexOf(v)>=0) s+=6; if(pp.indexOf(v)>=0) s+=5; if(L(e.f).toLowerCase().indexOf(v)>=0) s+=2; return {e:e,s:s}; }).filter(function(x){ return x.s>0; }).sort(function(a,b){ return b.s-a.s; });
      q("#skSL").innerHTML=hits.length?hits.slice(0,40).map(function(x){ return row(x.e); }).join(""):'<div class="mut small" style="padding:10px 4px">'+L(["Tiada hasil.","No results."])+'</div>'; bind(); };
    inp.oninput=function(){ draw(inp.value); }; draw(""); setTimeout(function(){ inp.focus(); },50);
  }
  // reference cards (adult, after the trail)
  function openRef(i){ var rf=SIRAH_REFS[i]; if(!rf) return;
    var b=openPanel(esc(L(rf.t)), '<div class="sk-art" style="background:linear-gradient(#2E2A4F,#E8A15C)">'+SirahArt.scene(rf.sc||"book",pal(11))+'</div>'+(rf.ay?rf.ay.map(ayatHtml).join(""):"")+paras(L(rf.f))+'<div class="sk-src">'+ic("book",14)+' Ar-Raheeq al-Makhtum · '+esc(srcTxt(rf.s))+'</div>');
    b.querySelectorAll("[data-say-ar]").forEach(function(x){ x.onclick=function(){ H.speakAr(x.getAttribute("data-say-ar")); }; }); }

  // kids: badges + quiz
  function showBadges(){
    var b=openPanel(L(["Lencana saya","My badges"]), '<div class="sk-shelf big">'+segs.map(function(sg){ var got=st.badges[sg.era]; return '<div class="sk-bd'+(got?" got":"")+'">'+(got?SirahArt.scene(eraOf(sg.era).badge||"kaabah",pal(sg.era)):'<span>'+(sg.era+1)+'</span>')+'<small>'+esc(L(eraOf(sg.era).t))+'</small></div>'; }).join("")+'</div><p class="sk-p" style="text-align:center">'+L(["Habiskan setiap era dan jawab kuiznya untuk mendapat lencana.","Finish each era and answer its quiz to earn a badge."])+'</p>');
  }
  function showQuiz(eraId){
    var Q=SIRAH_QUIZ[eraId]; if(!Q) return; var k=0, ok=0;
    var b=openPanel(L(["Kuiz: ","Quiz: "])+esc(L(eraOf(eraId).t)), '<div id="skQz"></div>', "quiz");
    var draw=function(){
      if(k>=Q.length){ var all=ok===Q.length; if(all){ st.badges[eraId]=1; saveSt(); H.N.vibrate(400); }
        q("#skQz").innerHTML='<div class="sk-qend">'+(all?'<div class="sk-bd got big1">'+SirahArt.scene(eraOf(eraId).badge||"kaabah",pal(eraId))+'</div><h3>'+L(["MasyaAllah! Lencana baharu!","MasyaAllah! A new badge!"])+'</h3>':'<h3>'+ok+' / '+Q.length+'</h3><p>'+L(["Hampir! Baca semula kisahnya dan cuba lagi.","Almost! Read the stories again and try once more."])+'</p>')+
          '<button class="sk-big gold" id="skQOk">'+(all?L(["Teruskan perjalanan","Continue the journey"]):L(["Cuba lagi","Try again"]))+'</button></div>';
        q("#skQOk").onclick=function(){ if(all){ closePanel(); closeSheet(); var tp=scr.scrollTop; drawTrack(); drawDock(); scr.scrollTop=tp; onScroll(true); } else { k=0; ok=0; draw(); } }; return; }
      var qq=Q[k];
      q("#skQz").innerHTML='<div class="sk-qn">'+(k+1)+' / '+Q.length+'</div><h3 class="sk-qq">'+esc(L(qq.q))+'</h3>'+qq.a.map(function(a,i){ return '<button class="sk-qa" data-a="'+i+'">'+esc(L(a))+'</button>'; }).join("");
      root.querySelectorAll("[data-a]").forEach(function(btn){ btn.onclick=function(){ var i=+btn.getAttribute("data-a"), right=i===qq.ok; if(right) ok++;
        btn.classList.add(right?"ok":"no"); if(!right) root.querySelector('[data-a="'+qq.ok+'"]').classList.add("ok"); H.N.vibrate(right?40:150);
        root.querySelectorAll("[data-a]").forEach(function(x){ x.disabled=true; }); setTimeout(function(){ k++; draw(); }, right?700:1400); }; }); };
    draw();
  }

  // ---------- wind: generated in code, no audio files ----------
  var Wind=(function(){
    var ac=null, master=null, src=null, on=false, lfo=null, lfo2=null, base=0.22;
    function make(){
      var Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx) return false;
      ac=new Ctx(); var len=ac.sampleRate*4, buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0), last=0;
      for(var i=0;i<len;i++){ var w=Math.random()*2-1; last=(last+0.02*w)/1.02; d[i]=last*3.2; }
      // cross-fade the loop ends so the loop point is silent
      var fl=Math.floor(ac.sampleRate*0.25); for(var j=0;j<fl;j++){ var a=j/fl; d[len-fl+j]=d[len-fl+j]*(1-a)+d[j]*a; }
      src=ac.createBufferSource(); src.buffer=buf; src.loop=true; src.loopStart=0.25; src.loopEnd=4;
      var bp=ac.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=520; bp.Q.value=0.55;
      var lp=ac.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=1400;
      var gust=ac.createGain(); gust.gain.value=0.7;
      master=ac.createGain(); master.gain.value=0;
      lfo=ac.createOscillator(); lfo.frequency.value=0.07; var lg=ac.createGain(); lg.gain.value=260; lfo.connect(lg); lg.connect(bp.frequency);
      lfo2=ac.createOscillator(); lfo2.frequency.value=0.13; var lg2=ac.createGain(); lg2.gain.value=0.3; lfo2.connect(lg2); lg2.connect(gust.gain);
      src.connect(bp); bp.connect(lp); lp.connect(gust); gust.connect(master); master.connect(ac.destination);
      src.start(); lfo.start(); lfo2.start(); return true;
    }
    function start(level){ try{ if(!ac && !make()) return; if(ac.state==="suspended") ac.resume(); on=true; var t=ac.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value,t); master.gain.linearRampToValueAtTime(base*(level||1),t+1.5); }catch(e){} }
    function stop(now){ if(!ac) return; on=false; try{ var t=ac.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value,t); master.gain.linearRampToValueAtTime(0,t+(now?0.2:1)); setTimeout(function(){ if(!on && ac) ac.suspend(); },now?300:1100); }catch(e){} }
    function level(l){ if(!ac||!on) return; try{ var t=ac.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value,t); master.gain.linearRampToValueAtTime(base*l,t+2); }catch(e){} }
    return {start:start, stop:stop, level:level, get on(){ return on; }};
  })();

  return open;
})();
