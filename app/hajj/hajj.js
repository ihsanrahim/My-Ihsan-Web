/* Hajj & Umrah 3D: guided "Next" mode and free-roam mode with a cute pilgrim and guide NPCs.
   Data: hajj_data.js. World: hajj_world.js (Three.js r159, bundled). Opened from app.js via HajjOpen(helpers). */
window.HajjOpen = (function(){
  var H, en, ov, root, cv, W=null, st, mode="home", raf=0, last=0, running=false, calm=false, T;
  var player=null, guideFig=null, npcs=[], ambient=[], labelEls=[], sheetH=0, toastT=0, bannerT=0;
  var cam={pos:null, look:null, tPos:null, tLook:null, k:1}, idleA=0;
  var gIdx=0, practice=null, act=null, dlg=null, roam={yaw:0.6, pitch:0.55, dist:11, jx:0, jy:0, tod:"day", todFrom:null, todT:1, near:null, gems:[]};
  var IC={
    back:'<path d="M15 18l-6-6 6-6"/>', close:'<path d="M18 6L6 18M6 6l12 12"/>', list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    next:'<path d="M9 18l6-6-6-6"/>', prev:'<path d="M15 18l-6-6 6-6"/>', play:'<path d="M6 4l14 8-14 8z"/>', pause:'<path d="M7 4v16M17 4v16"/>',
    vol:'<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
    map:'<path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/>', book:'<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
    walk:'<circle cx="13" cy="4" r="2"/><path d="M10 22l2-7-3-3 2-5 4 3 3 1M9 12l-3 2"/>', steps:'<path d="M4 20h4v-4h4v-4h4V8h4"/>',
    chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', check:'<path d="M20 6L9 17l-5-5"/>', pin:'<path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    arrow:'<path d="M12 3l7 18-7-4-7 4z"/>', star:'<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    user:'<circle cx="12" cy="7" r="4"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/>', moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>', info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'
  };
  function ic(n,s){ return '<svg class="hji" viewBox="0 0 24 24" width="'+(s||22)+'" height="'+(s||22)+'" aria-hidden="true">'+IC[n]+'</svg>'; }
  function L(a){ return a ? (en ? (a[1]!=null?a[1]:a[0]) : a[0]) : ""; }
  function esc(s){ return H.esc(String(s==null?"":s)); }
  function q(s){ return root.querySelector(s); }
  function save(){ H.save("ihsan_hajj", st); }
  function path(){ for(var i=0;i<HJ_PATHS.length;i++) if(HJ_PATHS[i].id===st.path) return HJ_PATHS[i]; return HJ_PATHS[0]; }
  function steps(){ return path().s; }
  function doneMap(kind){ var k=kind+"_"+st.path; st[k]=st[k]||{}; return st[k]; }
  function placeV(id, y){ var p=HJ_PLACES[id].p; return new T.Vector3(p[0], y||0, p[1]); }
  function kindBadge(k){ return '<span class="hjk k'+k+'">'+esc(L(HJ_KIND[k]))+'</span>'; }
  function toast(msg){ var t=q(".hjtoast"); t.textContent=msg; t.classList.add("on"); clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove("on"); }, 2600); }

  // ---------- open / close ----------
  function open(helpers){
    H=helpers; T=window.THREE; en=H.S.lang==="en";
    st=H.load("ihsan_hajj",{path:"umrah", av:"m", rumi:true, g:{}, badges:{}}); st.g=st.g||{}; st.badges=st.badges||{}; if(st.rumi==null) st.rumi=true;
    calm=!!H.S.sirahCalm; try{ if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) calm=true; }catch(e){}
    ov=document.getElementById("overlay"); ov.className="hajjov";
    ov.innerHTML='<div class="hj" id="hj"><canvas class="hjc"></canvas><div class="hjlab"></div><div class="hjfade"></div>'+
      '<div class="hjtop"><button class="hjb hjback" aria-label="'+(en?"Back":"Kembali")+'">'+ic("back")+'</button><div class="hjttl"></div><div class="hjtr"></div></div>'+
      '<div class="hjui"></div><div class="hjbanner"></div><div class="hjtoast" role="status" aria-live="polite"></div></div>';
    ov._close=back; root=ov.querySelector("#hj"); cv=q(".hjc");
    q(".hjback").onclick=back;
    if(window.THREE){ try{ W=HJWorld.init(cv,{}); }catch(e){ W=null; } }
    if(!W){ root.classList.add("nogl"); }
    else { buildPlayer(); buildNpcs(); buildLabels(); cam.pos=W.camera.position.clone(); cam.look=new T.Vector3(0,2,0); cam.tPos=cam.pos.clone(); cam.tLook=cam.look.clone(); }
    window.addEventListener("resize", onResize); document.addEventListener("visibilitychange", onVis); H.on("pause", onPause); H.on("resume", onResume);
    onResize(); showHome(); running=true; last=performance.now(); raf=requestAnimationFrame(loop);
  }
  function back(){
    if(q(".hjmodal")){ closeModal(); return; }
    if(dlg){ closeDlg(); return; }
    if(practice){ stopPractice(); return; }
    if(mode==="guide"||mode==="roam"||mode==="ref"){ if(act) endAct(false); showHome(); return; }
    exit();
  }
  function exit(){
    running=false; cancelAnimationFrame(raf); save(); stopSpeak();
    window.removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", onVis); H.off("pause", onPause); H.off("resume", onResume);
    if(W){ try{ W.renderer.dispose(); W.renderer.forceContextLoss(); }catch(e){} W=null; }
    npcs=[]; ambient=[]; player=null; guideFig=null; labelEls=[]; act=null; practice=null; dlg=null;
    var o=document.getElementById("overlay"); o.classList.add("hidden"); o.innerHTML=""; o._close=null; o.className="hidden";
    if(H.onExit) H.onExit();
  }
  function onPause(){ running=false; cancelAnimationFrame(raf); }
  function onResume(){ if(!running && W!==undefined && root && document.body.contains(root)){ running=true; last=performance.now(); raf=requestAnimationFrame(loop); } }
  function onVis(){ if(document.hidden) onPause(); else onResume(); }
  function stopSpeak(){ try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} }
  function onResize(){ if(!W) return; var w=root.clientWidth||innerWidth, h=root.clientHeight||innerHeight; W.renderer.setSize(w,h,false);
    W.camera.aspect=w/h; W.camera.fov = w<h ? 62 : 50; cam.k = w<h ? Math.min(1.7, 0.95/(w/h)*0.75+0.35) : 1; W.camera.updateProjectionMatrix(); applyOffset(); }
  var sheetW=0;
  function applyOffset(){ if(!W) return; var w=root.clientWidth, h=root.clientHeight, side = sheetW && sheetW < w*0.75, off=Math.round((side?sheetW:sheetH||0)*0.42);
    if(off>4) W.camera.setViewOffset(w, h, side?off:0, side?0:off, w, h); else W.camera.clearViewOffset(); }
  function setSheet(el){ var r = el ? el.getBoundingClientRect() : null; sheetH = r ? r.height : 0; sheetW = r ? r.width : 0; applyOffset(); }

  // ---------- loop ----------
  function loop(now){
    if(!running) return; raf=requestAnimationFrame(loop);
    var dt=Math.min(0.05,(now-last)/1000); last=now;
    if(!W) return;
    cv.dataset.ib3d = mode==="roam" ? "no1" : "";   // 0.5.69: one finger orbits the view except while walking (roam)
    W.update(dt);
    if(mode==="roam") roamStep(dt); else if(practice) practiceStep(dt); else idleStep(dt);
    // camera smoothing
    var k = calm ? 1 : 1-Math.pow(0.02, dt);
    cam.pos.lerp(cam.tPos, k); cam.look.lerp(cam.tLook, k);
    W.camera.position.copy(cam.pos); W.camera.lookAt(cam.look); W.followSky(cam.pos);
    if(roam.todFrom){ roam.todT=Math.min(1, roam.todT+dt/(calm?0.01:2.2)); W.setTod(roam.tod, roam.todT, roam.todFrom); if(roam.todT>=1) roam.todFrom=null; }
    animNpcs(dt);
    W.renderer.render(W.scene, W.camera);
    drawLabels();
  }
  function setTod(name){ if(!W) return; if(roam.tod===name && !roam.todFrom) return; roam.todFrom=roam.tod; roam.tod=name; roam.todT=calm?1:0; if(calm){ W.setTod(name); roam.todFrom=null; } }
  function aim(target, off, k){ k=k||cam.k; cam.tLook.copy(target); cam.tPos.set(target.x+off[0]*k, off[1]*(k>1?1+(k-1)*0.6:1), target.z+off[2]*k); }
  function idleStep(dt){ if(calm) return; idleA+=dt*0.05; if(mode==="home"){ var r=62*cam.k; cam.tPos.set(Math.sin(idleA)*r, 46*cam.k, Math.cos(idleA)*r); cam.tLook.set(0,2,0); } animFig(guideFig, dt, false); animFig(player, dt, false); }
  function animFig(f, dt, mv, sp){ if(f && f.visible) W.animFigure(f, dt, mv, sp); }

  // ---------- figures & NPCs ----------
  function buildPlayer(){
    if(player) W.scene.remove(player);
    var f = st.av==="f";
    player = W.makeFigure(f ? {f:true, robe:"#b48ad6", robe0:"#b48ad6", scarf:"#f6d6e4", scarf0:"#f6d6e4", shoe:"#7a5f4a"} : {robe:"#2a9d8f", robe0:"#2a9d8f", cap:"#3a2a1e", hat:"#1d1d1d", sash:"#eeeeee"});
    W.scene.add(player); player.visible=false; dress();
  }
  function inIhram(){ // derived from progress in the current path
    if(st.path==="ziarah") return false; var s=steps(), d=mode==="roam"?doneMap("r"):doneMap("g"), on=false;
    for(var i=0;i<s.length;i++){ var id=s[i]; if(!d[id]) break; if(id==="prep"||id==="tarwiyah_t"||id==="tanim") on=true; if(id==="cukur_u"||id==="cukur_h") on=false; }
    return on; }
  function dress(force){ if(!player) return; W.dressIhram(player, force!=null?force:inIhram()); var P=player.userData.parts; if(P.cap) P.cap.visible=!st.bald; }
  var NPC_LOOK=[{robe:"#2f6f57", vest:"#c9a646", cap:"#2b2b2b", flag:"#2fa36b", skin:"#c99269"},{f:true, robe:"#3c6e8f", scarf:"#e9e4d8", flag:"#c9a646", skin:"#e2b48c"}];
  function buildNpcs(){
    var seen={};
    Object.keys(HJ_STEPS).forEach(function(id){ var s=HJ_STEPS[id]; seen[s.pl]=1; });
    Object.keys(HJ_EXTRA).forEach(function(k){ seen[k]=1; });
    var i=0;
    Object.keys(seen).forEach(function(pl){ if(pl==="miqat") return; var P=HJ_PLACES[pl], o=NPC_SPOT[pl]||[1.8,1.6];
      var look=NPC_LOOK[i++%2], f=W.makeFigure(look); f.position.set(P.p[0]+o[0], 0, P.p[1]+o[1]); f.lookAt(P.p[0], 0, P.p[1]+4); W.scene.add(f);
      npcs.push({pl:pl, f:f, guide:true}); });
    // friendly pilgrims with tips, all over the map
    var r=0;
    HJ_TIPS.forEach(function(t){ var P=HJ_PLACES[t.pl], a=(r++)*2.4, rad=(HJ_PLACES[t.pl].zr||8)*0.45+3;
      var look={robe:["#ffffff","#f3efe6","#e9f0f3"][r%3], f:r%2===0, scarf:"#ffffff", cap:r%2?"#3a2a1e":null, skin:["#f1cfae","#e2b48c","#c99269","#a8714b"][r%4], small:t.kid, cane:t.old};
      var f=W.makeFigure(look); f.position.set(P.p[0]+Math.cos(a)*rad, 0, P.p[1]+Math.sin(a)*rad); f.rotation.y=a; W.scene.add(f); ambient.push({f:f, t:t}); });
  }
  function animNpcs(dt){ var cp=cam.pos; for(var i=0;i<npcs.length;i++){ var n=npcs[i]; if(n.f.position.distanceToSquared(cp)<14000) W.animFigure(n.f, dt, false); }
    for(var j=0;j<ambient.length;j++){ var a=ambient[j]; if(a.f.position.distanceToSquared(cp)<9000) W.animFigure(a.f, dt, false); } }
  function npcState(pl){ // "!" pending quest, "✓" done, "" otherwise
    var s=steps(), d=doneMap(mode==="roam"?"r":"g"), any=false, pend=false;
    s.forEach(function(id){ if(HJ_STEPS[id].pl===pl || (pl==="birali" && HJ_STEPS[id].pl==="miqat") || (id==="tawaf_u"||id==="tawaf_q"||id==="ifadah"||id==="wada"||id==="wada_u") && pl==="kaabah"){ any=true; if(!d[id]) pend=true; } });
    return !any ? "" : pend ? "!" : "✓"; }

  // ---------- labels projected over the canvas ----------
  function buildLabels(){
    var box=q(".hjlab"), html="";
    W.labels.forEach(function(l,i){ html+='<div class="hjl '+l.cls+'" data-i="'+i+'">'+esc(L(l.t))+'</div>'; });
    npcs.forEach(function(n,i){ html+='<button class="hjl npc" data-n="'+i+'" aria-label="'+esc(L(HJ_PLACES[n.pl].n))+'"><b></b></button>'; });
    ambient.forEach(function(a,i){ html+='<button class="hjl amb" data-a="'+i+'" aria-label="tip">…</button>'; });
    box.innerHTML=html; labelEls=[].slice.call(box.children);
    box.onclick=function(e){ var b=e.target.closest("[data-n],[data-a]"); if(!b || mode!=="roam") return;
      if(b.hasAttribute("data-n")){ var n=npcs[+b.getAttribute("data-n")]; if(n.f.position.distanceTo(player.position)<9) openDlg(n.pl); else toast(en?"Walk closer to talk":"Dekati dahulu untuk berbual"); }
      else { var a=ambient[+b.getAttribute("data-a")]; if(a.f.position.distanceTo(player.position)<9) tipBubble(a); else toast(en?"Walk closer to talk":"Dekati dahulu untuk berbual"); } };
  }
  var v3=null, lt=0;
  function drawLabels(){
    if(!labelEls.length) return; lt++; if(lt%2) return; v3=v3||new T.Vector3();
    var w=root.clientWidth, h=root.clientHeight, cp=cam.pos, nL=W.labels.length, show=mode!=="ref", roamM=mode==="roam";
    for(var i=0;i<labelEls.length;i++){ var el=labelEls[i], p, maxD, extra=0;
      if(i<nL){ var l=W.labels[i]; p=l.p; maxD = l.cls==="big"?420 : l.cls==="miqat"?1400 : 90; }
      else if(i<nL+npcs.length){ var n=npcs[i-nL]; if(!roamM){ el.style.display="none"; continue; } v3.copy(n.f.position); v3.y+=2.9; p=v3; maxD=60;
        var s=npcState(n.pl); if(el._s!==s){ el._s=s; el.firstChild.textContent=s||"i"; el.className="hjl npc"+(s==="!"?" pend":s==="✓"?" ok":""); } }
      else { var a=ambient[i-nL-npcs.length]; if(!roamM){ el.style.display="none"; continue; } v3.copy(a.f.position); v3.y+=2.5; p=v3; maxD=26; }
      var d=p.distanceTo(cp); if(i<nL && W.labels[i].cls==="miqat" && cp.y<120 && d>160) d=1e9; if(!show || d>maxD){ if(el._v!==0){ el.style.display="none"; el._v=0; } continue; }
      var sp=p.clone().project(W.camera); if(sp.z>1 || sp.x<-1.2 || sp.x>1.2 || sp.y<-1.2 || sp.y>1.2){ if(el._v!==0){ el.style.display="none"; el._v=0; } continue; }
      if(el._v!==1){ el.style.display="block"; el._v=1; }
      el.style.transform="translate3d("+((sp.x+1)/2*w).toFixed(1)+"px,"+((1-sp.y)/2*h).toFixed(1)+"px,0) translate(-50%,-100%)";
      el.style.opacity = d>maxD*0.7 ? ((maxD-d)/(maxD*0.3)).toFixed(2) : 1;
    }
  }

  // ---------- doa card ----------
  var sayList=[];
  function doaHtml(id, open){ var D=HJ_DOA[id]; if(!D) return ""; sayList.push(D.ar); var si=sayList.length-1;
    return '<details class="hjdoa"'+(open?' open':'')+'><summary><span>'+esc(L(D.t))+'</span><span class="hjchev">'+ic("next",18)+'</span></summary>'+
      '<div class="hjar" dir="rtl" lang="ar">'+D.ar+'</div>'+(st.rumi?'<div class="hjrumi">'+esc(D.r)+'</div>':'')+
      '<div class="hjmean">'+esc(L(D.m))+'</div><div class="hjsrcrow"><span class="hjsrc">'+esc(D.s||"")+'</span><button class="hjb sm" data-say="'+si+'" aria-label="'+(en?"Listen":"Dengar")+'">'+ic("vol",20)+'</button></div></details>'; }
  function bindSay(el){ el.querySelectorAll("[data-say]").forEach(function(b){ b.onclick=function(e){ e.preventDefault(); e.stopPropagation(); H.speakAr(sayList[+b.getAttribute("data-say")]); }; }); }
  function stepHtml(id, opts){ opts=opts||{}; var s=HJ_STEPS[id], P=HJ_PLACES[s.pl];
    var h='<div class="hjsh">'+kindBadge(s.k)+'<span class="hjplace">'+ic("pin",16)+esc(L(P.n))+'</span></div>';
    h+='<h2 class="hjst">'+esc(L(s.t))+'</h2>';
    h+='<div class="hjmeta"><div><b>'+(en?"When":"Bila")+'</b>'+esc(L(s.w))+'</div>'+(s.sl?'<div><b>'+(en?"Prayer":"Solat")+'</b>'+esc(L(s.sl))+'</div>':'')+'</div>';
    h+='<p class="hjd">'+esc(L(s.d))+'</p>';
    (s.tip||[]).forEach(function(t){ h+='<div class="hjtip">'+ic("info",18)+'<span>'+esc(L(t))+'</span></div>'; });
    (s.doa||[]).forEach(function(d,i){ h+=doaHtml(d, i===0 && !opts.closed); });
    if(s.src) h+='<div class="hjsrc pad">'+esc(s.src)+'</div>';
    return h; }

  // ---------- HOME ----------
  function showHome(){
    mode="home"; practice=null; act=null; closeDlg(); setTitle(en?"Hajj & Umrah 3D":"Haji & Umrah 3D", "");
    if(W){ W.setTod("day"); roam.tod="day"; roam.todFrom=null; player.visible=false; if(guideFig) guideFig.visible=false; W.scene.fog.far=700; }
    var tr=q(".hjtr"); tr.innerHTML='<button class="hjb" data-ref aria-label="'+(en?"Reference":"Rujukan")+'">'+ic("book")+'</button>'; tr.querySelector("[data-ref]").onclick=showRef;
    var hj=H.hijri ? H.hijri() : null, today="";
    if(hj && hj.m===12 && hj.d>=8 && hj.d<=13){ var map={8:"tarwiyah_t",9:"wukuf",10:"aqabah",11:"lontar3",12:"lontar3",13:"lontar3"}, sid=map[hj.d];
      today='<button class="hjtoday" data-today="'+sid+'">'+ic("moon",20)+'<span><b>'+(en?"Today is ":"Hari ini ")+hj.d+(en?" Dhul Hijjah":" Zulhijjah")+'</b>'+esc(L(HJ_STEPS[sid].t))+'</span>'+ic("next",18)+'</button>'; }
    var cards=HJ_PATHS.map(function(p){ var n=p.s.length, d=st["g_"+p.id]||{}, c=p.s.filter(function(id){ return d[id]; }).length;
      return '<button class="hjpath'+(st.path===p.id?" on":"")+'" data-path="'+p.id+'" style="--pc:'+p.col+'" aria-pressed="'+(st.path===p.id)+'"><b>'+esc(L(p.n))+'</b><small>'+esc(L(p.d))+'</small><span class="hjbar"><i style="width:'+Math.round(c/n*100)+'%"></i></span><em>'+c+' / '+n+(st.badges[p.id]?' · '+ic("star",14):'')+'</em></button>'; }).join("");
    var html='<div class="hjsheet home"><div class="hjgrab"></div>'+today+
      '<h1 class="hjh1">'+(en?"Hajj & Umrah 3D":"Haji & Umrah 3D")+'</h1><p class="hjsub">'+(en?"Practise every step, from the miqat to the farewell tawaf, and visit the Prophet's Mosque. Stylised, not to scale.":"Latih setiap langkah, dari miqat hingga tawaf wada', dan ziarah Masjid Nabawi. Gaya ilustrasi, tidak mengikut skala.")+'</p>'+
      '<div class="hjlbl">'+(en?"Choose a journey":"Pilih perjalanan")+'</div><div class="hjpaths">'+cards+'</div>'+
      '<div class="hjlbl">'+(en?"Your pilgrim":"Watak anda")+'</div><div class="hjseg" role="group"><button data-av="m" aria-pressed="'+(st.av==="m")+'" class="'+(st.av==="m"?"on":"")+'">'+ic("user",18)+(en?"Man":"Lelaki")+'</button><button data-av="f" aria-pressed="'+(st.av==="f")+'" class="'+(st.av==="f"?"on":"")+'">'+ic("user",18)+(en?"Woman":"Perempuan")+'</button></div>'+
      '<div class="hjgo"><button class="hjbtn pri" data-mode="guide">'+ic("steps")+'<span><b>'+(en?"Step by step":"Ikut langkah")+'</b><small>'+(en?"Tap Next through each rite":"Tekan Seterusnya bagi setiap amalan")+'</small></span></button>'+
      '<button class="hjbtn" data-mode="roam"'+(W?'':' disabled')+'>'+ic("walk")+'<span><b>'+(en?"Explore":"Jelajah bebas")+'</b><small>'+(W?(en?"Walk your pilgrim, talk to guides":"Gerakkan watak, bual dengan pembimbing"):(en?"Needs 3D (WebGL) support":"Perlukan sokongan 3D (WebGL)"))+'</small></span></button></div>'+
      (H.tawaf?'<button class="hjbtn wide" data-tawafc>'+ic("check")+'<span><b>'+(en?"Tawaf & sa'i counter":"Kaunter tawaf & sa'ie")+'</b><small>'+(en?"Count your rounds on the real trip":"Kira pusingan semasa di Tanah Suci")+'</small></span></button>':'')+
      '<label class="hjchk"><input type="checkbox" id="hjRumi"'+(st.rumi?" checked":"")+'> '+(en?"Show Rumi reading under the Arabic":"Papar bacaan Rumi di bawah teks Arab")+'</label>'+
      '<p class="hjnote">'+(en?"Follows the Shafi'i school as practised in Malaysia. Follow your Tabung Haji guide or mutawwif on the day.":"Mengikut mazhab Syafi'i seperti amalan di Malaysia. Ikut arahan pembimbing Tabung Haji atau mutawwif anda.")+'</p></div>';
    var ui=q(".hjui"); ui.innerHTML=html; var sh=ui.querySelector(".hjsheet"); requestAnimationFrame(function(){ setSheet(sh); });
    ui.querySelectorAll("[data-path]").forEach(function(b){ b.onclick=function(){ st.path=b.getAttribute("data-path"); save(); showHome(); }; });
    ui.querySelectorAll("[data-av]").forEach(function(b){ b.onclick=function(){ st.av=b.getAttribute("data-av"); save(); if(W) buildPlayer(); showHome(); }; });
    ui.querySelectorAll("[data-mode]").forEach(function(b){ b.onclick=function(){ if(b.getAttribute("data-mode")==="guide") startGuide(); else startRoam(); }; });
    var td=ui.querySelector("[data-today]"); if(td) td.onclick=function(){ var sid=td.getAttribute("data-today"); if(steps().indexOf(sid)<0){ st.path="tamattu"; if(sid==="tarwiyah_t"&&steps().indexOf(sid)<0) sid="tarwiyah_i"; } st.g[st.path]=steps().indexOf(sid); save(); startGuide(); };
    ui.querySelector("#hjRumi").onchange=function(){ st.rumi=this.checked; save(); };
    var twc=ui.querySelector("[data-tawafc]"); if(twc) twc.onclick=function(){ var go=H.tawaf; exit(); setTimeout(go, 60); };
    if(W){ cam.tLook.set(0,4,0); if(calm){ cam.tPos.set(40*cam.k,30*cam.k,40*cam.k); } }
  }
  function setTitle(t, sub){ q(".hjttl").innerHTML='<b>'+esc(t)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':''); }

  // ---------- GUIDED ----------
  function startGuide(){ mode="guide"; gIdx=Math.max(0, Math.min(steps().length-1, st.g[st.path]||0)); if(W){ player.visible=true; dress(); } renderGuide(); }
  function renderGuide(){
    practice=null; sayList=[]; var s=steps(), id=s[gIdx], S=HJ_STEPS[id], P=path();
    setTitle(L(P.n), (gIdx+1)+" / "+s.length);
    var tr=q(".hjtr"); tr.innerHTML='<button class="hjb" data-list aria-label="'+(en?"All steps":"Semua langkah")+'">'+ic("list")+'</button>'; tr.querySelector("[data-list]").onclick=stepList;
    var d=doneMap("g");
    var html='<div class="hjprog"><i style="width:'+((gIdx+1)/s.length*100)+'%;background:'+P.col+'"></i></div><div class="hjsheet guide'+(st.collapse?" col":"")+'"><button class="hjgrab" aria-label="'+(en?"Show or hide":"Papar atau sorok")+'"></button><div class="hjscroll">'+stepHtml(id)+
      (S.act?'<button class="hjbtn pri wide" data-prac>'+ic("play")+'<span><b>'+practiceLabel(S.act)+'</b><small>'+(en?"Watch and follow along":"Tonton dan ikut")+'</small></span></button>':'')+'</div>'+
      '<div class="hjnav"><button class="hjbtn" data-prev'+(gIdx===0?" disabled":"")+'>'+ic("prev")+(en?"Back":"Sebelum")+'</button><button class="hjbtn pri" data-next>'+(gIdx===s.length-1?(en?"Finish":"Selesai")+ic("check"):(en?"Next":"Seterusnya")+ic("next"))+'</button></div></div>';
    var ui=q(".hjui"); ui.innerHTML=html; bindSay(ui); var sh=ui.querySelector(".hjsheet"); requestAnimationFrame(function(){ setSheet(sh); });
    ui.querySelector("[data-prev]").onclick=function(){ if(gIdx>0){ gIdx--; st.g[st.path]=gIdx; save(); renderGuide(); } };
    ui.querySelector("[data-next]").onclick=function(){ d[id]=1; if(gIdx<s.length-1){ gIdx++; st.g[st.path]=gIdx; save(); renderGuide(); } else finishPath("g"); };
    ui.querySelector(".hjgrab").onclick=function(){ st.collapse=!st.collapse; sh.classList.toggle("col", st.collapse); setTimeout(function(){ setSheet(sh); }, 260); };
    var pb=ui.querySelector("[data-prac]"); if(pb) pb.onclick=function(){ startPractice(S.act, id); };
    stageStep(id);
  }
  function practiceLabel(a){ return ({tawaf:en?"Practise tawaf (7 rounds)":"Latih tawaf (7 pusingan)", saie:en?"Practise sa'i (7 lengths)":"Latih sa'ie (7 kali)", cukur:en?"Show the haircut":"Tunjuk cara bercukur",
    wukuf:en?"Practise wukuf until sunset":"Latih wukuf hingga terbenam", pebbles:en?"Collect 7 pebbles":"Kutip 7 biji batu", lontar1:en?"Throw 7 pebbles":"Lontar 7 biji batu", lontar3:en?"Stone the three jamarat":"Lontar tiga jamrah",
    solat:en?"Show the prayer":"Tunjuk cara solat", ihram:en?"Change into ihram":"Tukar pakaian ihram"})[a]||""; }
  // place the pilgrim and camera for a step
  function stageStep(id){
    if(!W) return; var S=HJ_STEPS[id], P=HJ_PLACES[S.pl], t=placeV(S.pl,1.2);
    W.scene.fog.far = S.pl==="miqat" ? 2600 : 700; W.setTod(P.tod); roam.tod=P.tod; roam.todFrom=null;
    var off=P.cam; if(S.pl==="miqat") off=[0, 620, 300];
    aim(t, off);
    player.userData.pose="idle"; player.userData.pt=0; dress(); player.rotation.set(0,0,0);
    var sp=new T.Vector3(P.p[0],0,P.p[1]);
    if(S.pl==="miqat"){ player.visible=false; return; }
    player.visible=true;
    if(S.act==="tawaf"){ sp.set(8,0,0); }
    if(S.pl==="kaabah"||S.pl==="haram") aim(new T.Vector3(0,1.5,0),[0,34,30]);
    player.position.set(sp.x, W.heightAt(sp.x,sp.z), sp.z);
    var face = (S.pl==="aqabah"||S.pl==="ula"||S.pl==="wusta"||S.pl==="jamrat") ? new T.Vector3(P.p[0],0,-34) : (P.city==="Madinah") ? new T.Vector3(P.p[0],0,P.p[1]+10) : new T.Vector3(0,0,0);
    if(S.pl==="jamrat") player.position.set(94, 0, -29);
    player.lookAt(face.x, 0, face.z);
    if(id==="wukuf"||id==="masyar"||id==="multazam"||id==="raudhah"||id==="salam"||id==="baqi"||id==="uhud") player.userData.pose="doa";
    if(id==="talbiah"||id==="masuk") player.userData.pose="wave";
  }
  function stepList(){
    var s=steps(), d=doneMap("g");
    var html='<div class="hjmodal" role="dialog" aria-modal="true"><div class="hjmh"><b>'+esc(L(path().n))+'</b><button class="hjb" data-x aria-label="'+(en?"Close":"Tutup")+'">'+ic("close")+'</button></div><div class="hjml">'+
      s.map(function(id,i){ var S=HJ_STEPS[id]; return '<button class="hjli'+(i===gIdx?" cur":"")+'" data-j="'+i+'"><span class="hjn'+(d[id]?" ok":"")+'">'+(d[id]?ic("check",16):(i+1))+'</span><span class="hjlt"><b>'+esc(L(S.t))+'</b><small>'+esc(L(HJ_PLACES[S.pl].n))+'</small></span>'+kindBadge(S.k)+'</button>'; }).join("")+'</div></div>';
    q(".hjui").insertAdjacentHTML("beforeend", html);
    var m=q(".hjmodal"); m.querySelector("[data-x]").onclick=closeModal;
    m.querySelectorAll("[data-j]").forEach(function(b){ b.onclick=function(){ gIdx=+b.getAttribute("data-j"); st.g[st.path]=gIdx; save(); closeModal(); renderGuide(); }; });
    var cur=m.querySelector(".cur"); if(cur) cur.scrollIntoView({block:"center"});
  }
  function closeModal(){ var m=q(".hjmodal"); if(m) m.remove(); }
  function finishPath(kind){
    st.badges[st.path]=1; save(); if(W && player){ W.sparkle(player.position.clone().setY(2)); player.userData.pose="doa"; }
    var html='<div class="hjmodal done" role="dialog" aria-modal="true"><div class="hjstar">'+ic("star",56)+'</div><h2>'+(en?"Alhamdulillah, complete!":"Alhamdulillah, selesai!")+'</h2><p>'+esc(L(path().n))+(en?": you have gone through every step. May Allah accept it and invite you to the real journey.":": anda telah melalui setiap langkah. Semoga Allah menerima dan menjemput anda ke sana.")+'</p>'+
      '<div class="hjgo"><button class="hjbtn pri" data-home>'+(en?"Choose another journey":"Pilih perjalanan lain")+'</button><button class="hjbtn" data-again>'+(en?"Start again":"Mula semula")+'</button></div></div>';
    q(".hjui").insertAdjacentHTML("beforeend", html); var m=q(".hjmodal");
    m.querySelector("[data-home]").onclick=function(){ closeModal(); showHome(); };
    m.querySelector("[data-again]").onclick=function(){ closeModal(); st[kind+"_"+st.path]={}; if(kind==="g"){ st.g[st.path]=0; save(); startGuide(); } else { save(); startRoam(true); } };
  }

  // ---------- guided practice (auto animation) ----------
  function startPractice(a, id){
    if(!W){ toast(en?"3D is not available on this phone":"3D tidak disokong pada telefon ini"); return; }
    practice={a:a, id:id, n:0, need:7, t:0, play:true, th:0, seg:0, lastBanner:""};
    if(a==="cukur"||a==="ihram") practice.need=1; if(a==="solat") practice.need=2; if(a==="wukuf") practice.need=1; if(a==="lontar3") practice.need=21;
    var ui=q(".hjui"); ui.querySelector(".hjsheet").classList.add("hide");
    ui.insertAdjacentHTML("beforeend", '<div class="hjprac"><div class="hjcount"><b class="hjcn">0</b><span>/ '+practice.need+'</span><small>'+esc(practiceLabel(a))+'</small></div><div class="hjpline"></div><div class="hjnav"><button class="hjbtn" data-stop>'+ic("close")+(en?"Stop":"Henti")+'</button><button class="hjbtn pri" data-pp>'+ic("pause")+(en?"Pause":"Jeda")+'</button></div></div>');
    var pr=ui.querySelector(".hjprac"); requestAnimationFrame(function(){ setSheet(pr); });
    pr.querySelector("[data-stop]").onclick=stopPractice;
    pr.querySelector("[data-pp]").onclick=function(){ if(practice.n>=practice.need){ stopPractice(); return; } practice.play=!practice.play; this.innerHTML=practice.play?ic("pause")+(en?"Pause":"Jeda"):ic("play")+(en?"Play":"Main"); };
    var S=HJ_STEPS[id];
    if(a==="tawaf"){ practice.th=0; player.position.set(8,0,0); aim(new T.Vector3(0,1,0),[0,36,26]); pline("istilam"); }
    if(a==="saie"){ player.position.set(46,0,18); aim(new T.Vector3(46,1,-4),[-30,20,6]); pline("safa"); practice.dir=-1; }
    if(a==="wukuf"){ player.userData.pose="doa"; pline("arafah"); }
    if(a==="pebbles"){ spawnGems(new T.Vector3(150,0,18), 7); pline("talbiah"); }
    if(a==="lontar1"){ player.position.set(74,0,-29.5); player.lookAt(74,0,-34); aim(new T.Vector3(74,2,-33),[-6,8,12]); pline("lontar"); }
    if(a==="lontar3"){ practice.j=0; jamTo(0); pline("lontar"); }
    if(a==="cukur"){ pline("cukur"); }
    if(a==="solat"){ player.userData.pose="solat"; player.userData.pt=0; pline(S.doa&&S.doa[0]); }
    if(a==="ihram"){ pline(null, en?"Bathe, perfume the body, then put on the ihram.":"Mandi, pakai wangian pada badan, kemudian pakai ihram."); }
  }
  var JAM=[["ula",94],["wusta",84],["aqabah",74]];
  function jamTo(j){ var x=JAM[j][1]; player.position.set(x,0,-29.5); player.lookAt(x,0,-34); aim(new T.Vector3(x,2,-33),[-4,8,13]); }
  function pline(doaId, txt){ var el=q(".hjpline"); if(!el) return; sayList=[]; el.innerHTML = doaId ? doaHtml(doaId,true) : '<p class="hjd">'+esc(txt||"")+'</p>'; bindSay(el); var pr=q(".hjprac"); if(pr) setSheet(pr); }
  function pcount(n){ practice.n=n; var c=q(".hjcn"); if(c) c.textContent=n; if(n>=practice.need) practiceDone(); }
  function practiceDone(){ var p=practice; p.play=false; doneMap("g")[p.id]=1; save(); W.sparkle(player.position.clone().setY(2));
    var b=q("[data-pp]"); if(b) b.innerHTML=ic("check")+(en?"Done":"Selesai"); H.N && H.N.vibrate && H.N.vibrate(120);
    if(p.a==="ihram") dress(true); if(p.a==="cukur"){ if(st.av==="m"){ st.bald=1; save(); } dress(false); var P=player.userData.parts; if(P.cap && st.av==="m") P.cap.visible=false; }
    if(p.a==="wukuf"){ player.userData.pose="doa"; } }
  function stopPractice(){ if(!practice) return; practice=null; clearGems(); var pr=q(".hjprac"); if(pr) pr.remove(); var sh=q(".hjsheet"); if(sh){ sh.classList.remove("hide"); setSheet(sh); }
    if(mode==="guide"){ var id=steps()[gIdx]; stageStep(id); W.setTod(HJ_PLACES[HJ_STEPS[id].pl].tod); } }
  function practiceStep(dt){
    var p=practice; animFig(player, dt, false);
    if(!p.play || p.n>=p.need){ if(p.a==="wukuf"&&p.n>=1){} return; }
    p.t+=dt; var a=p.a;
    if(a==="tawaf"){ var men=st.av==="m", fast = men && p.n<3 && p.id!=="wada" && p.id!=="wada_u"; var sp=(fast?0.95:0.75)*(calm?1:1);
      var prev=p.th; p.th+=sp*dt; var R=8, th=-p.th; player.position.set(Math.cos(th)*R, 0, Math.sin(th)*R); player.rotation.y=Math.atan2(Math.sin(th), -Math.cos(th));
      W.animFigure(player, dt, true, fast?1.5:1);
      var lap=Math.floor(p.th/(Math.PI*2)), fr=p.th/(Math.PI*2)-lap;
      if(fr>0.75 && p.lastBanner!=="y"+lap){ p.lastBanner="y"+lap; pline("rabbana"); }
      if(lap>p.n){ pcount(lap); if(p.n<p.need) pline("istilam"); }
      cam.tPos.set(Math.cos(th)*26*cam.k*0.8, 26*cam.k*0.9, Math.sin(th)*26*cam.k*0.8); cam.tLook.set(0,1,0); }
    else if(a==="saie"){ var z=player.position.z, spd=3.4, green = z<3 && z>-11, run = green && st.av==="m";
      z += p.dir*dt*spd*(run?1.7:1); var top=18, bot=-26;
      if(green && p.lastBanner!=="g"+p.n){ p.lastBanner="g"+p.n; pline("hijau"); }
      if(z<=bot){ z=bot; p.dir=1; pcount(p.n+1); if(p.n<p.need) pline("safa_zikir"); }
      if(z>=top){ z=top; p.dir=-1; pcount(p.n+1); if(p.n<p.need) pline("safa_zikir"); }
      player.position.set(46,0,z); player.rotation.y = p.dir<0 ? Math.PI : 0; W.animFigure(player, dt, true, run?1.6:1);
      cam.tLook.set(46,1,z); cam.tPos.set(46-24*cam.k*0.7, 15*cam.k*0.8, z+8); }
    else if(a==="lontar1"||a==="lontar3"){ if(p.t>0.9){ p.t=0; var x=a==="lontar1"?74:JAM[p.j][1]; player.userData.pose="throw"; player.userData.pt=0;
        var from=player.position.clone().add(new T.Vector3(0.4,1.6,-0.3)); W.throwPebble(from, new T.Vector3(x,1.6,-33.6), function(){});
        var n=p.n+1; pcount(n);
        if(a==="lontar3" && n<21 && n%7===0){ p.j++; p.t=-2.2; pline(p.j===1?"rabbana":p.j===2?"afiyah":"lontar"); var jj=p.j; setTimeout(function(){ if(practice===p) { jamTo(jj); if(jj<2) pline("lontar"); } }, 1600); } }
      else if(p.t>0.35) player.userData.pose="idle"; }
    else if(a==="wukuf"){ var k=Math.min(1,p.t/12); W.setTod("eve", k, "noon"); if(p.t>6 && p.lastBanner!=="i"){ p.lastBanner="i"; pline("istighfar"); } if(k>=1) pcount(1); }
    else if(a==="pebbles"){ walkToGems(dt); }
    else if(a==="cukur"){ if(p.t>1.2 && !p.sp){ p.sp=1; W.sparkle(player.position.clone().setY(1.9)); } if(p.t>2.2) pcount(1); }
    else if(a==="solat"){ if(p.t>6 && p.n<1) pcount(1); if(p.t>12) pcount(2); }
    else if(a==="ihram"){ if(p.t>1){ W.sparkle(player.position.clone().setY(1)); pcount(1); } }
  }
  // glowing pebbles at Muzdalifah
  function spawnGems(c, n){ clearGems(); var g=new T.DodecahedronGeometry(0.22,0), m=new T.MeshBasicMaterial({color:0xfff2b8});
    for(var i=0;i<n;i++){ var a=i/n*Math.PI*2+0.3, r=3+(i%3)*1.4, e=new T.Mesh(g,m); e.position.set(c.x+Math.cos(a)*r, 0.25, c.z+Math.sin(a)*r); W.scene.add(e); roam.gems.push(e); }
    if(mode!=="roam"){ player.position.set(c.x, 0, c.z); aim(c,[0,14,16]); } }
  function clearGems(){ roam.gems.forEach(function(e){ W.scene.remove(e); }); roam.gems=[]; }
  function walkToGems(dt){ var p=practice; var g=roam.gems[0]; if(!g){ return; }
    var d=g.position.clone().sub(player.position); d.y=0; var L2=d.length();
    if(L2<0.5){ W.scene.remove(g); roam.gems.shift(); W.puff(g.position, 0xfff2b8); pcount(p.n+1); player.userData.pose="idle"; return; }
    d.normalize(); player.position.addScaledVector(d, dt*3); player.rotation.y=Math.atan2(d.x,d.z); W.animFigure(player, dt, true); }

  // ---------- ROAM ----------
  function startRoam(reset){
    if(!W) return; mode="roam"; practice=null; act=null; sayList=[];
    W.scene.fog.far=700; player.visible=true;
    var s=steps(), d=doneMap("r"), nx=nextQuest();
    var startPl = st.path==="ziarah" ? "nabawi" : "birali";
    if(st.rpos && !reset && st.rpos.path===st.path){ player.position.set(st.rpos.x,0,st.rpos.z); }
    else { var P=HJ_PLACES[startPl]; player.position.set(P.p[0], 0, P.p[1]+6); }
    dress(); player.userData.pose="idle";
    setTitle(L(path().n), en?"Explore":"Jelajah");
    var tr=q(".hjtr"); tr.innerHTML='<button class="hjb" data-map aria-label="'+(en?"Travel":"Pergi ke")+'">'+ic("map")+'</button><button class="hjb" data-q aria-label="'+(en?"Tasks":"Tugasan")+'">'+ic("list")+'</button>';
    tr.querySelector("[data-map]").onclick=travelMenu; tr.querySelector("[data-q]").onclick=questList;
    var ui=q(".hjui");
    ui.innerHTML='<button class="hjquest" aria-live="polite"><span class="hjarrow">'+ic("arrow",22)+'</span><span class="hjqt"></span></button>'+
      '<div class="hjhud"></div><div class="hjjoy" aria-label="'+(en?"Move":"Gerak")+'"><div class="hjknob"></div></div><button class="hjact hidden"></button>'+
      '<p class="hjhint">'+(en?"Drag the left pad to walk. Drag elsewhere to look around.":"Seret pad kiri untuk berjalan. Seret di tempat lain untuk melihat sekeliling.")+'</p>';
    setSheet(null); bindJoy(); bindLook();
    ui.querySelector(".hjquest").onclick=function(){ var nq=nextQuest(); if(nq) { var P=HJ_PLACES[HJ_STEPS[nq].pl]; toast(L(HJ_STEPS[nq].t)+" · "+L(P.n)); } };
    ui.querySelector(".hjact").onclick=actPress;
    setTimeout(function(){ var h=q(".hjhint"); if(h) h.classList.add("off"); }, 6000);
    var z=zoneAt(player.position); roam.tod=z?HJ_PLACES[z].tod:"day"; W.setTod(roam.tod);
    updQuest(); roamCamSnap();
  }
  function nextQuest(){ var s=steps(), d=doneMap("r"); for(var i=0;i<s.length;i++) if(!d[s[i]]) return s[i]; return null; }
  function updQuest(){ var el=q(".hjqt"); if(!el) return; var nq=nextQuest();
    if(!nq){ el.innerHTML='<b>'+(en?"All done, alhamdulillah!":"Semua selesai, alhamdulillah!")+'</b>'; q(".hjarrow").style.visibility="hidden"; return; }
    var S=HJ_STEPS[nq]; el.innerHTML='<small>'+(en?"Next":"Seterusnya")+' · '+esc(L(HJ_PLACES[questPlace(nq)].n))+' <span class="hjdist"></span></small><b>'+esc(L(S.t))+'</b>'; q(".hjarrow").style.visibility=""; }
  function questPlace(id){ var S=HJ_STEPS[id]; return S.pl==="miqat" ? "birali" : S.pl; }
  function zoneAt(p){ var best=null, bd=1e9; ["nabawi","quba","uhud","birali","tanim","haram","mina","muzdalifah","arafah","jamrat"].forEach(function(k){ var P=HJ_PLACES[k], d=Math.hypot(p.x-P.p[0], p.z-P.p[1]); if(d<(P.zr+40) && d<bd){ bd=d; best=k; } }); return best; }
  function roamCamSnap(){ roamCam(); cam.pos.copy(cam.tPos); cam.look.copy(cam.tLook); }
  function roamCam(){ var p=player.position, d=roam.dist*(cam.k>1?1.15:1), y=roam.yaw, pi=roam.pitch;
    cam.tLook.set(p.x, p.y+1.6, p.z); cam.tPos.set(p.x+Math.sin(y)*Math.cos(pi)*d, p.y+1.6+Math.sin(pi)*d, p.z+Math.cos(y)*Math.cos(pi)*d); }
  var tmpV=null, qTick=0;
  function roamStep(dt){
    tmpV=tmpV||new T.Vector3();
    var jx=roam.jx, jy=roam.jy, mag=Math.min(1,Math.hypot(jx,jy)), moving=mag>0.12 && !dlg && !(act && act.lock);
    if(moving){ var y=roam.yaw, fx=-Math.sin(y), fz=-Math.cos(y), rx=Math.cos(y), rz=-Math.sin(y);
      var sp=4+5*mag; var dx=(rx*jx - fx*jy)*sp*dt, dz=(rz*jx - fz*jy)*sp*dt;
      player.position.x+=dx; player.position.z+=dz; W.collide(player.position);
      var tr=Math.atan2(dx,dz), cr=player.rotation.y, dd=((tr-cr+Math.PI*3)%(Math.PI*2))-Math.PI; player.rotation.y=cr+dd*Math.min(1,dt*12); player.userData.pose="idle"; }
    player.position.y=W.heightAt(player.position.x, player.position.z);
    W.animFigure(player, dt, moving, 0.6+mag*0.8);
    roamCam();
    // zone time of day
    qTick+=dt; if(qTick>0.25){ qTick=0; var z=zoneAt(player.position); var tod=z?HJ_PLACES[z].tod:"day"; if(act && act.a==="wukuf") tod=roam.tod; if(tod!==roam.tod && !roam.todFrom) setTod(tod); nearCheck(); arrowUpd(); }
    if(act) actStep(dt);
    // gems pickup
    if(roam.gems.length){ for(var i=roam.gems.length-1;i>=0;i--){ var g=roam.gems[i]; g.rotation.y+=dt*2; g.position.y=0.3+Math.sin(W.time*3+i)*0.08;
      if(g.position.distanceTo(player.position)<1.5){ W.scene.remove(g); roam.gems.splice(i,1); W.puff(g.position,0xfff2b8); if(act && act.a==="pebbles"){ act.n++; hud(); if(act.n>=act.need) actDone(); } } } }
    st.rpos={path:st.path, x:+player.position.x.toFixed(1), z:+player.position.z.toFixed(1)};
  }
  function arrowUpd(){ var nq=nextQuest(), ar=q(".hjarrow"); if(!nq||!ar) return; var P=HJ_PLACES[questPlace(nq)], dx=P.p[0]-player.position.x, dz=P.p[1]-player.position.z, d=Math.hypot(dx,dz);
    var ang=Math.atan2(dx,dz), rel=ang-(roam.yaw+Math.PI); ar.style.transform="rotate("+(-rel*180/Math.PI).toFixed(0)+"deg)";
    var ds=q(".hjdist"); if(ds) ds.textContent = d<6 ? (en?"· here":"· di sini") : "· "+Math.round(d)+" m"; }
  function nearCheck(){ var best=null, bd=7; npcs.forEach(function(n){ var d=n.f.position.distanceTo(player.position); if(d<bd){ bd=d; best=n; } });
    roam.near=best; actBtn(); }
  function actBtn(){ var b=q(".hjact"); if(!b) return; var lab="", kind="";
    if(act && (act.a==="lontar1"||act.a==="lontar3")){ var j=nearJam(); if(j){ lab=en?"Throw":"Lontar"; kind="throw"; } }
    if(!lab && roam.near && !dlg){ lab=en?"Talk":"Bual"; kind="talk"; }
    if(!lab){ b.classList.add("hidden"); b._k=""; return; } b.classList.remove("hidden"); if(b._l!==lab){ b._l=lab; b.innerHTML=(kind==="talk"?ic("chat",26):ic("star",26))+'<span>'+lab+'</span>'; } b._k=kind; }
  function actPress(){ var b=q(".hjact"); if(b._k==="talk" && roam.near) openDlg(roam.near.pl); else if(b._k==="throw") throwAt(); }
  function nearJam(){ for(var i=0;i<JAM.length;i++){ if(Math.hypot(player.position.x-JAM[i][1], player.position.z+34)<8) return i+1; } return 0; }
  // joystick & look
  function bindJoy(){ var j=q(".hjjoy"), k=q(".hjknob"), id=null, cx=0, cy=0, R=48;
    function mv(x,y){ var dx=x-cx, dy=y-cy, d=Math.hypot(dx,dy); if(d>R){ dx*=R/d; dy*=R/d; } k.style.transform="translate("+dx+"px,"+dy+"px)"; roam.jx=dx/R; roam.jy=dy/R; }
    j.addEventListener("pointerdown", function(e){ id=e.pointerId; j.setPointerCapture(id); var r=j.getBoundingClientRect(); cx=r.left+r.width/2; cy=r.top+r.height/2; mv(e.clientX,e.clientY); e.preventDefault(); });
    j.addEventListener("pointermove", function(e){ if(e.pointerId===id) mv(e.clientX,e.clientY); });
    function up(e){ if(e.pointerId!==id) return; id=null; roam.jx=roam.jy=0; k.style.transform=""; }
    j.addEventListener("pointerup", up); j.addEventListener("pointercancel", up);
    // keyboard (for desktop testing / accessibility)
    root.onkeydown=function(e){ if(mode!=="roam") return; var m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]}[e.key]; if(m){ roam.jx=m[0]; roam.jy=m[1]; e.preventDefault(); } };
    root.onkeyup=function(){ roam.jx=roam.jy=0; }; root.tabIndex=-1; }
  function bindLook(){ var id=null, lx=0, ly=0;
    cv.onpointerdown=function(e){ if(mode!=="roam") return; id=e.pointerId; cv.setPointerCapture(id); lx=e.clientX; ly=e.clientY; };
    cv.onpointermove=function(e){ if(e.pointerId!==id) return; roam.yaw-=(e.clientX-lx)*0.006; roam.pitch=Math.max(0.12,Math.min(1.25, roam.pitch+(e.clientY-ly)*0.004)); lx=e.clientX; ly=e.clientY; };
    cv.onpointerup=cv.onpointercancel=function(e){ if(e.pointerId===id) id=null; };
    cv.onwheel=function(e){ if(mode!=="roam") return; roam.dist=Math.max(5,Math.min(26, roam.dist+(e.deltaY>0?1:-1))); }; }
  // travel & quest list
  function travelMenu(){
    var groups={}; Object.keys(HJ_PLACES).forEach(function(k){ var P=HJ_PLACES[k]; if(k==="miqat"||k==="kaabah"||k==="yamani"||k==="multazam") return; (groups[P.city]=groups[P.city]||[]).push(k); });
    var html='<div class="hjmodal" role="dialog" aria-modal="true"><div class="hjmh"><b>'+(en?"Travel to":"Pergi ke")+'</b><button class="hjb" data-x aria-label="'+(en?"Close":"Tutup")+'">'+ic("close")+'</button></div><div class="hjml">'+
      ["Madinah","Miqat","Makkah","Mina","Muzdalifah","Arafah"].map(function(c){ return groups[c]?'<div class="hjgh">'+c+'</div>'+groups[c].map(function(k){ return '<button class="hjli" data-tp="'+k+'">'+ic("pin",18)+'<span class="hjlt"><b>'+esc(L(HJ_PLACES[k].n))+'</b></span></button>'; }).join(""):""; }).join("")+'</div></div>';
    q(".hjui").insertAdjacentHTML("beforeend", html); var m=q(".hjmodal"); m.querySelector("[data-x]").onclick=closeModal;
    m.querySelectorAll("[data-tp]").forEach(function(b){ b.onclick=function(){ closeModal(); teleport(b.getAttribute("data-tp")); }; }); }
  function teleport(k){ if(act && act.a!=="lontar3" && act.a!=="lontar1"){ endAct(false); } var f=q(".hjfade"); f.classList.add("on");
    setTimeout(function(){ var P=HJ_PLACES[k]; var o=TELE_SPOT[k]||[0,4]; player.position.set(P.p[0]+o[0],0,P.p[1]+o[1]); W.collide(player.position); var fc=FOCUS[k]||P.p; roam.yaw=Math.atan2(player.position.x-fc[0], player.position.z-fc[1]); player.rotation.y=roam.yaw+Math.PI; var z=zoneAt(player.position); roam.tod=z?HJ_PLACES[z].tod:"day"; roam.todFrom=null; W.setTod(roam.tod); roamCamSnap(); nearCheck(); arrowUpd(); f.classList.remove("on"); }, calm?0:260); }
  function questList(){ var s=steps(), d=doneMap("r"), nq=nextQuest();
    var html='<div class="hjmodal" role="dialog" aria-modal="true"><div class="hjmh"><b>'+(en?"Tasks":"Tugasan")+' · '+esc(L(path().n))+'</b><button class="hjb" data-x aria-label="'+(en?"Close":"Tutup")+'">'+ic("close")+'</button></div><div class="hjml">'+
      s.map(function(id,i){ var S=HJ_STEPS[id]; return '<button class="hjli'+(id===nq?" cur":"")+'" data-tp="'+questPlace(id)+'"><span class="hjn'+(d[id]?" ok":"")+'">'+(d[id]?ic("check",16):(i+1))+'</span><span class="hjlt"><b>'+esc(L(S.t))+'</b><small>'+esc(L(HJ_PLACES[S.pl].n))+'</small></span>'+kindBadge(S.k)+'</button>'; }).join("")+
      '</div><div class="hjmf"><button class="hjbtn" data-reset>'+(en?"Start the journey again":"Mula semula perjalanan")+'</button></div></div>';
    q(".hjui").insertAdjacentHTML("beforeend", html); var m=q(".hjmodal"); m.querySelector("[data-x]").onclick=closeModal;
    m.querySelectorAll("[data-tp]").forEach(function(b){ b.onclick=function(){ closeModal(); teleport(b.getAttribute("data-tp")); }; });
    m.querySelector("[data-reset]").onclick=function(){ st["r_"+st.path]={}; st.rpos=null; st.bald=0; save(); closeModal(); buildPlayer(); startRoam(true); }; }
  // NPC dialogue
  function placeSteps(pl){ var s=steps(), out=[];
    s.forEach(function(id){ var S=HJ_STEPS[id]; if(S.pl===pl || (pl==="kaabah" && S.act==="tawaf") || (pl==="birali" && S.pl==="miqat")) out.push(id); });
    if(!out.length) Object.keys(HJ_STEPS).forEach(function(id){ if(HJ_STEPS[id].pl===pl && out.length<2) out.push(id); });
    return out; }
  function openDlg(pl){
    closeDlg(); var ids=placeSteps(pl), d=doneMap("r"), nq=nextQuest(), start=Math.max(0, ids.indexOf(nq)); if(start<0) start=0;
    var ex=HJ_EXTRA[pl];
    dlg={pl:pl, ids:ids, i:ids.indexOf(nq)>=0?ids.indexOf(nq):0, extra:ex};
    if(!ids.length && !ex) return;
    renderDlg(); player.lookAt(npcFor(pl).f.position.x, player.position.y, npcFor(pl).f.position.z);
  }
  function npcFor(pl){ for(var i=0;i<npcs.length;i++) if(npcs[i].pl===pl) return npcs[i]; return npcs[0]; }
  function renderDlg(){
    sayList=[]; var pl=dlg.pl, ids=dlg.ids, d=doneMap("r"), nq=nextQuest(), body="", actHtml="";
    var pages=ids.length + (dlg.extra?1:0), i=Math.min(dlg.i, pages-1);
    if(i<ids.length){ var id=ids[i], S=HJ_STEPS[id], inPath=steps().indexOf(id)>=0;
      body=stepHtml(id,{closed:false});
      if(inPath && !d[id]){ if(S.act && ROAM_ACT[S.act]) actHtml='<button class="hjbtn pri wide" data-do="'+id+'">'+ic("play")+'<span><b>'+esc(roamActLabel(S.act))+'</b><small>'+esc(roamActHint(S.act))+'</small></span></button>';
        else actHtml='<button class="hjbtn pri wide" data-ok="'+id+'">'+ic("check")+'<span><b>'+(en?"Got it":"Faham")+'</b><small>'+(en?"Mark this step as done":"Tandakan langkah ini selesai")+'</small></span></button>'; }
      else if(inPath) actHtml='<div class="hjdone">'+ic("check",18)+(en?"Done":"Selesai")+'</div>';
      else actHtml='<div class="hjtip">'+ic("info",18)+'<span>'+(en?"Not part of this journey.":"Bukan sebahagian perjalanan ini.")+'</span></div>';
      if(nq && nq!==id && inPath && !d[id] && steps().indexOf(nq)<steps().indexOf(id)) actHtml='<div class="hjtip">'+ic("info",18)+'<span>'+(en?"Finish first: ":"Selesaikan dahulu: ")+esc(L(HJ_STEPS[nq].t))+'</span></div>';
    } else { var E=dlg.extra; body='<div class="hjsh"><span class="hjplace">'+ic("pin",16)+esc(L(HJ_PLACES[pl].n))+'</span></div>'+(E.t?'<p class="hjd">'+esc(L(E.t))+'</p>':'')+(E.doa||[]).map(function(x,j){ return doaHtml(x, j===0); }).join(""); }
    var html='<div class="hjsheet dlg"><div class="hjwho">'+ic("user",18)+'<b>'+(en?"Guide":"Pembimbing")+'</b><span>'+esc(L(HJ_PLACES[pl].n))+'</span><button class="hjb" data-x aria-label="'+(en?"Close":"Tutup")+'">'+ic("close")+'</button></div><div class="hjscroll">'+body+actHtml+'</div>'+
      (pages>1?'<div class="hjnav"><button class="hjbtn" data-dp'+(i===0?" disabled":"")+'>'+ic("prev")+'</button><span class="hjpg">'+(i+1)+' / '+pages+'</span><button class="hjbtn" data-dn'+(i>=pages-1?" disabled":"")+'>'+ic("next")+'</button></div>':'')+'</div>';
    var old=q(".hjsheet.dlg"); if(old) old.remove(); q(".hjui").insertAdjacentHTML("beforeend", html); var sh=q(".hjsheet.dlg"); bindSay(sh); root.classList.add("talk"); setSheet(sh);
    sh.querySelector("[data-x]").onclick=closeDlg;
    var dp=sh.querySelector("[data-dp]"), dn=sh.querySelector("[data-dn]"); if(dp) dp.onclick=function(){ dlg.i=i-1; renderDlg(); }; if(dn) dn.onclick=function(){ dlg.i=i+1; renderDlg(); };
    var ok=sh.querySelector("[data-ok]"); if(ok) ok.onclick=function(){ markDone(ok.getAttribute("data-ok")); if(i<pages-1){ dlg.i=i+1; renderDlg(); } else closeDlg(); };
    var dd=sh.querySelector("[data-do]"); if(dd) dd.onclick=function(){ var id2=dd.getAttribute("data-do"); closeDlg(); beginAct(HJ_STEPS[id2].act, id2); };
    actBtn();
  }
  function closeDlg(){ var s=q(".hjsheet.dlg"); if(s) s.remove(); dlg=null; if(root){ root.classList.remove("talk"); } if(mode==="roam") setSheet(null); }
  function markDone(id){ var d=doneMap("r"); if(d[id]) return; d[id]=1; save(); updQuest(); dress(); if(W) W.sparkle(player.position.clone().setY(2.2)); H.N && H.N.vibrate && H.N.vibrate(60);
    if(!nextQuest()) setTimeout(function(){ finishPath("r"); }, 600); }
  function tipBubble(a){ var t=a.t; banner('<b>'+esc(L(t.t))+'</b>'+(t.doa?'<div class="hjar sm" dir="rtl" lang="ar">'+HJ_DOA[t.doa].ar+'</div>'+(st.rumi?'<div class="hjrumi">'+esc(HJ_DOA[t.doa].r)+'</div>':'')+'<div class="hjmean">'+esc(L(HJ_DOA[t.doa].m))+'</div>':''), 9000); a.f.userData.pose="wave"; a.f.userData.pt=0; setTimeout(function(){ a.f.userData.pose="idle"; }, 2000); }
  function banner(html, ms){ var b=q(".hjbanner"); b.innerHTML=html; b.classList.add("on"); clearTimeout(bannerT); bannerT=setTimeout(function(){ b.classList.remove("on"); }, ms||5000); }
  function bannerDoa(id, lead){ var D=HJ_DOA[id]; banner((lead?'<b>'+esc(lead)+'</b>':'<b>'+esc(L(D.t))+'</b>')+'<div class="hjar sm" dir="rtl" lang="ar">'+D.ar+'</div>'+(st.rumi?'<div class="hjrumi">'+esc(D.r)+'</div>':''), 7000); }

  // ---------- roam activities ----------
  var ROAM_ACT={tawaf:1, saie:1, cukur:1, wukuf:1, pebbles:1, lontar1:1, lontar3:1, solat:1, ihram:1};
  function roamActLabel(a){ return ({tawaf:en?"Start tawaf":"Mula tawaf", saie:en?"Start sa'i":"Mula sa'ie", cukur:en?"Have the haircut":"Bercukur sekarang", wukuf:en?"Begin wukuf":"Mula wukuf",
    pebbles:en?"Collect pebbles":"Kutip batu", lontar1:en?"Go and throw":"Mula melontar", lontar3:en?"Start stoning":"Mula melontar", solat:en?"Pray 2 rakaat":"Solat 2 rakaat", ihram:en?"Put on ihram":"Pakai ihram"})[a]; }
  function roamActHint(a){ return ({tawaf:en?"Walk 7 rounds with the Kaabah on your left":"Jalan 7 pusingan, Kaabah di sebelah kiri", saie:en?"Walk from Safa to Marwah 7 times":"Jalan dari Safa ke Marwah 7 kali", cukur:"", wukuf:en?"Stay, make doa until sunset":"Berdoa hingga matahari terbenam",
    pebbles:en?"Walk over the 7 shining pebbles":"Jalan ke atas 7 batu yang bersinar", lontar1:en?"Stand by Jamrat al-Aqabah and tap Throw":"Berdiri dekat Jamrah Aqabah dan tekan Lontar", lontar3:en?"Al-Ula, then al-Wusta, then al-Aqabah":"Ula, kemudian Wusta, kemudian Aqabah", solat:"", ihram:""})[a]||""; }
  function beginAct(a, id){
    act={a:a, id:id, n:0, need:7, t:0};
    if(a==="cukur"||a==="ihram"||a==="solat"||a==="wukuf"){ act.need=1; act.lock=true; }
    if(a==="lontar3"){ act.need=21; act.j=0; }
    if(a==="tawaf"){ act.started=false; act.acc=0; act.last=Math.atan2(player.position.z, player.position.x); bannerDoa("niat_tawaf", en?"Go to the green line by the Black Stone to begin":"Pergi ke garisan hijau di Hajar Aswad untuk mula"); }
    if(a==="saie"){ act.at=null; bannerDoa("safa"); }
    if(a==="pebbles"){ spawnGems(new T.Vector3(player.position.x, 0, player.position.z), 7); banner('<b>'+(en?"Walk over the shining pebbles":"Jalan ke atas batu yang bersinar")+'</b>', 4000); }
    if(a==="lontar1") bannerDoa("lontar", en?"Stand by Jamrat al-Aqabah and tap Throw":"Berdiri dekat Jamrah Aqabah dan tekan Lontar");
    if(a==="lontar3") bannerDoa("lontar", en?"Start at al-Ula (the far one), 7 pebbles":"Mula di Jamrah Ula (paling jauh), 7 biji");
    if(a==="wukuf"){ player.userData.pose="doa"; bannerDoa("arafah"); }
    if(a==="solat"){ player.userData.pose="solat"; player.userData.pt=0; }
    if(a==="cukur"){ W.sparkle(player.position.clone().setY(1.9)); }
    if(a==="ihram"){ W.sparkle(player.position.clone().setY(1)); }
    hud(); actBtn();
  }
  function hud(){ var h=q(".hjhud"); if(!h) return; if(!act || act.need<=1){ h.innerHTML=""; h.classList.remove("on"); return; }
    var name=({tawaf:"Tawaf", saie:"Sa'ie", pebbles:en?"Pebbles":"Batu", lontar1:en?"Aqabah":"Aqabah", lontar3:(act.j<3?L(HJ_PLACES[JAM[Math.min(act.j,2)][0]].n):"")})[act.a];
    var n = act.a==="lontar3" ? (act.n%7 || (act.n?7:0)) : act.n, need = act.a==="lontar3" ? 7 : act.need;
    if(act.a==="lontar3" && act.n>0 && act.n%7===0 && act.n<21) n=0;
    h.innerHTML='<b>'+esc(name)+'</b><span>'+n+' / '+need+'</span><button class="hjb sm" data-end aria-label="'+(en?"Stop":"Henti")+'">'+ic("close",18)+'</button>'; h.classList.add("on");
    h.querySelector("[data-end]").onclick=function(){ endAct(false); }; }
  function endAct(ok){ if(!act) return; var a=act; act=null; clearGems(); hud(); actBtn(); player.userData.pose="idle"; if(!ok) toast(en?"Stopped":"Dihentikan"); if(a.a==="wukuf" && !ok){ setTod(HJ_PLACES[zoneAt(player.position)||"arafah"].tod); } }
  function actDone(){ var a=act; markDone(a.id); if(a.a==="ihram") dress(true); if(a.a==="cukur" && st.av==="m"){ st.bald=1; save(); dress(); }
    banner('<b>'+(en?"MasyaAllah, done!":"MasyaAllah, selesai!")+'</b><span>'+esc(L(HJ_STEPS[a.id].t))+'</span>', 3500); endAct(true); }
  function actStep(dt){ var a=act; a.t+=dt; var p=player.position;
    if(a.a==="tawaf"){ var r=Math.hypot(p.x,p.z), th=Math.atan2(p.z,p.x);
      if(!a.started){ if(r<23 && Math.abs(p.z)<1.6 && p.x>5){ a.started=true; a.acc=0; a.last=th; a.lap=0; bannerDoa("istilam", en?"Round 1: raise your right hand to the Black Stone":"Pusingan 1: angkat tangan kanan ke Hajar Aswad"); player.userData.pose="wave"; player.userData.pt=0; setTimeout(function(){ if(player) player.userData.pose="idle"; },1200); } return; }
      if(r>23.5){ if(!a.out){ a.out=1; banner('<b>'+(en?"Come back into the tawaf area":"Kembali ke kawasan tawaf")+'</b>', 2500); } return; } a.out=0;
      var dth=th-a.last; if(dth>Math.PI) dth-=Math.PI*2; if(dth<-Math.PI) dth+=Math.PI*2; a.last=th; a.acc-=dth;
      if(a.acc<-0.5 && !a.warn){ a.warn=1; banner('<b>'+(en?"Wrong way: keep the Kaabah on your LEFT":"Arah salah: Kaabah mesti di sebelah KIRI")+'</b>', 3500); a.acc=0; } if(a.acc>0.2) a.warn=0;
      var lap=Math.floor(Math.max(0,a.acc)/(Math.PI*2)), fr=Math.max(0,a.acc)/(Math.PI*2)-lap;
      if(fr>0.74 && a.y!==lap){ a.y=lap; bannerDoa("rabbana"); }
      if(lap>a.n){ a.n=lap; hud(); if(a.n>=7){ actDone(); return; } bannerDoa("istilam", (en?"Round ":"Pusingan ")+(a.n+1)+(st.av==="m"&&a.n<3&&a.id!=="wada"&&a.id!=="wada_u"?(en?" · walk briskly (raml)":" · ramal (jalan cepat)"):"")); } }
    else if(a.a==="saie"){ var inM = p.x>40 && p.x<52 && p.z<22 && p.z>-30; if(!inM) return;
      if(a.at===null){ if(p.z>14){ a.at="safa"; bannerDoa("safa_zikir", en?"On Safa: face the Kaabah":"Di Safa: hadap Kaabah"); } return; }
      if(a.at==="safa" && p.z<-22){ a.at="marwah"; a.n++; hud(); if(a.n>=7){ actDone(); return; } bannerDoa("safa_zikir", (en?"Marwah · length ":"Marwah · kali ")+a.n+" / 7"); }
      else if(a.at==="marwah" && p.z>14){ a.at="safa"; a.n++; hud(); bannerDoa("safa_zikir", (en?"Safa · length ":"Safa · kali ")+a.n+" / 7"); }
      var g = p.z<3 && p.z>-11; if(g && a.g!==a.n){ a.g=a.n; bannerDoa("hijau", st.av==="m"?(en?"Green lights: jog":"Lampu hijau: lari-lari anak"):null); } }
    else if(a.a==="wukuf"){ var k=Math.min(1,a.t/14); W.setTod("eve",k,"noon"); roam.tod="eve"; if(a.t>7 && !a.b2){ a.b2=1; bannerDoa("istighfar"); } if(k>=1){ act.n=1; actDone(); } }
    else if(a.a==="solat"){ if(a.t>12){ act.n=1; actDone(); } }
    else if(a.a==="cukur"){ if(a.t>2){ act.n=1; actDone(); } }
    else if(a.a==="ihram"){ if(a.t>1.2){ act.n=1; actDone(); } }
    actBtn(); }
  function throwAt(){ var j=nearJam(); if(!j||!act) return; var a=act, name=JAM[j-1][0];
    if(a.a==="lontar1" && name!=="aqabah"){ banner('<b>'+(en?"On 10 Dhul Hijjah, only Jamrat al-Aqabah":"Pada 10 Zulhijjah, hanya Jamrah Aqabah")+'</b>', 3000); return; }
    if(a.a==="lontar3"){ var want=JAM[Math.min(a.j,2)][0]; if(name!==want){ banner('<b>'+(en?"Follow the order: ":"Ikut tertib: ")+esc(L(HJ_PLACES[want].n))+'</b>', 3000); return; } }
    if(a.busy) return; a.busy=true; setTimeout(function(){ a.busy=false; }, 450);
    player.lookAt(JAM[j-1][1], player.position.y, -34); player.userData.pose="throw"; player.userData.pt=0; setTimeout(function(){ if(player) player.userData.pose="idle"; }, 400);
    W.throwPebble(player.position.clone().add(new T.Vector3(0,1.6,0)), new T.Vector3(JAM[j-1][1],1.6,-33.6));
    a.n++; hud(); H.N && H.N.vibrate && H.N.vibrate(30);
    if(a.a==="lontar1" && a.n>=7){ actDone(); return; }
    if(a.a==="lontar3"){ if(a.n%7===0){ a.j++; if(a.j>=3){ actDone(); return; } bannerDoa(a.j===1?"rabbana":"afiyah", en?"Step aside, face the qibla and make doa. Then go to "+L(HJ_PLACES[JAM[a.j][0]].n):"Ke tepi, hadap kiblat dan berdoa. Kemudian ke "+L(HJ_PLACES[JAM[a.j][0]].n)); hud(); } } }

  // ---------- REFERENCE ----------
  function showRef(){
    mode="ref"; setTitle(en?"Reference":"Rujukan", en?"Pillars, obligations, sunnah, dam":"Rukun, wajib, sunat, dam"); q(".hjtr").innerHTML="";
    if(player) player.visible=false;
    var html='<div class="hjref"><div class="hjtabs">'+HJ_REF.map(function(r,i){ return '<a href="#hjr'+i+'" class="hjtab k'+r.k+'">'+esc(L(r.t))+'</a>'; }).join("")+'</div>'+
      HJ_REF.map(function(r,i){ return '<section class="hjcard" id="hjr'+i+'"><div class="hjsh">'+kindBadge(r.k)+'</div><h2 class="hjst">'+esc(L(r.t))+'</h2><ol class="hjol">'+r.i.map(function(x){ return '<li>'+esc(L(x))+'</li>'; }).join("")+'</ol>'+(r.note?'<div class="hjtip">'+ic("info",18)+'<span>'+esc(L(r.note))+'</span></div>':'')+'</section>'; }).join("")+
      '<section class="hjcard"><h2 class="hjst">'+(en?"The five miqat":"Lima miqat")+'</h2><ol class="hjol">'+HJ_MIQAT.map(function(m){ return '<li><b>'+esc(L(m.n))+'</b>: '+esc(L(m.w))+'</li>'; }).join("")+'</ol></section>'+
      '<p class="hjnote">'+(en?"Shafi'i school, as practised in Malaysia. The 3D scene is a stylised illustration and not to scale. Three.js (MIT licence) is bundled in the app.":"Mazhab Syafi'i seperti amalan di Malaysia. Paparan 3D ialah ilustrasi dan tidak mengikut skala. Three.js (lesen MIT) disertakan dalam aplikasi.")+'</p></div>';
    var ui=q(".hjui"); ui.innerHTML=html; setSheet(null);
    ui.querySelectorAll(".hjtab").forEach(function(a){ a.onclick=function(e){ e.preventDefault(); var t=ui.querySelector(a.getAttribute("href")); if(t) t.scrollIntoView({behavior:calm?"auto":"smooth", block:"start"}); }; });
    if(W){ cam.tLook.set(0,4,0); }
  }

  // ---------- extra data used only by the engine ----------
  var NPC_SPOT={kaabah:[10,2.4], haram:[3,-2], hajar:[9,-2.5], yamani:[2.4,8.2], multazam:[7.4,-4.4], maqam:[9.6,-6.2], safa:[3,0], marwah:[3,0], masa:[3.4,0], gunting:[2,1.5],
    aqabah:[0,2.4], wusta:[0,2.4], ula:[0,2.4], jamrat:[3,0], mina:[3,-2], nabawi:[3,4], raudhah:[2.5,2], makam:[-2,2], birali:[3,2], tanim:[3,1], arafah:[3,3], muzdalifah:[3,-3], masyar:[3,1], namirah:[3,-1], rahmah:[3,1], korban:[2,2], hotel:[3,-1.5], quba:[3,1], uhud:[3,1], baqi:[2,1.5], zamzam:[-1.5,1.5]};
  var FOCUS={hajar:[0,0], yamani:[0,0], multazam:[0,0], maqam:[0,0], haram:[0,0], aqabah:[74,-34], wusta:[84,-34], ula:[94,-34], jamrat:[84,-34], safa:[46,-26], marwah:[46,18], masa:[46,18]};
  var TELE_SPOT={kaabah:[10,4], hajar:[9,1.5], yamani:[0,10], multazam:[8,-5], maqam:[10,-10], aqabah:[0,2], wusta:[0,2], ula:[0,2], jamrat:[0,4], haram:[0,0], safa:[0,-2], marwah:[0,3], masa:[0,0]};
  return open;
})();
