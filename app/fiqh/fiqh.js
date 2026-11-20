/* My Ihsan 0.2.4: Fiqh Syafi'i 3D mind map (three.js r159, bundled in hajj/three.min.js).
   The centre node opens into the four rubu', each rubu' into its kitab, each kitab into its bab and each bab into its subtopics.
   Tapping a node opens it (siblings fold away), highlights its path and shows the ayat and hadith it cites, each with a play button.
   A collapsible contents sidebar lists every topic. Background: sand, clouds or grass.
   Data: fiqh/fiqh_data.js (chapter tree of Fiqh Syafii by H. Idris Ahmad, Pustaka Antara), pending ustaz review. */
(function(){
"use strict";
var H, T, en=false, st, calm=false;
var ov, root, cv, R=null, scene, camera, raf=0, running=false, last=0, clock=0;
var NODES=[], ROOT=null, sel=null, HIST=[], meshes=[], ribbons=[], decor=null, decorKind="";
var port=false, cam={x:0,y:0,d:30, tx:0,ty:0,td:30}, sheetOpen=false, sideOpen=false;
var audio=null, playBtn=null, speakBtn=null, FQS={}, msTr=null, msTried=false;
var HUE=["#1f9e89","#d08a1e","#c95479","#5b62c9"], ROOTC="#b8862f";
var THEMES=[["pasir","🏜","Pasir","Sand"],["awan","☁️","Awan","Clouds"],["rumput","🌿","Rumput","Grass"]];

function L(ms, e){ return en ? e : ms; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function q(s){ return root.querySelector(s); }
function save(){ try{ H.save("ihsan_fiqh", st); }catch(e){} }

// ---------- data ----------
function prep(){
  if(ROOT) return;
  var id=0;
  var walk=function(n, par, depth, hue){
    n.id=id++; NODES.push(n); n.par=par; n.depth=depth; n.c=n.c||[]; n.d=n.d||[];
    n.hue = depth===0 ? ROOTC : (depth===1 ? HUE[(n.id>0? NODES.filter(function(x){ return x.depth===1; }).length-1 : 0)%4] : hue);
    n.open=false; n.vis=false; n.alpha=0; n.ta=0; n.x=0; n.y=0; n.z=0; n.cx=0; n.cy=0; n.cz=0; n.mesh=null;
    n.nd=0; n.nh=0; n.nsub=0;
    n.c.forEach(function(c){ walk(c, n, depth+1, n.hue); });
  };
  ROOT=window.FIQH_DATA; walk(ROOT, null, 0, ROOTC);
  // dalil totals per branch (shown on the cards)
  var tot=function(n){ var a=0,h=0,s=0; n.d.forEach(function(x){ if(x.y==="a") a++; else h++; }); n.c.forEach(function(c){ var r=tot(c); a+=r[0]; h+=r[1]; s+=r[2]+1; }); n.na=a; n.nh=h; n.nsub=s; return [a,h,s]; };
  tot(ROOT);
}
// titles follow the app language: n.te holds the English title of every topic
function labels(){ NODES.forEach(function(n){ n.lab = en && n.te ? n.te : n.t; }); ROOT.lab=L("Fiqh Syafi'i","Shafi'i Fiqh"); }
function pathOf(n){ var p=[]; while(n){ p.unshift(n); n=n.par; } return p; }
function side(n){ var p=pathOf(n); return p.length>1 ? (p[1].rx<0?-1:1) : 1; }

// ---------- open / close ----------
function open(helpers){
  H=helpers; T=window.THREE; en=H.S.lang==="en";
  st=H.load("ihsan_fiqh",{th:"pasir", sel:null});
  calm=!!H.S.sirahCalm; try{ if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) calm=true; }catch(e){}
  prep(); labels();
  ov=document.getElementById("overlay"); ov.className="fqov";
  ov.innerHTML='<div class="fq th-'+st.th+'" id="fq"><div class="fqbg"><i class="b1"></i><i class="b2"></i><i class="b3"></i></div><canvas class="fqc"></canvas>'+
    '<div class="fqtop"><button class="fqb fqx" aria-label="'+L("Tutup","Close")+'">✕</button><button class="fqb fqtoc" aria-label="'+L("Kandungan","Contents")+'">☰</button>'+
    '<b class="fqttl">⚖️ '+L("Fiqh Syafi'i","Shafi'i Fiqh")+'</b><span class="fqsp"></span>'+
    '<div class="fqth">'+THEMES.map(function(t){ return '<button class="fqb fqthb'+(st.th===t[0]?" on":"")+'" data-th="'+t[0]+'" aria-label="'+L(t[2],t[3])+'" title="'+L(t[2],t[3])+'">'+t[1]+'</button>'; }).join("")+'</div>'+
    '<button class="fqb fqhome" aria-label="'+L("Ke tengah","Recentre")+'">◎</button></div>'+
    '<div class="fqhint">'+L("Ketik topik untuk buka. Seret untuk gerak, cubit untuk zum.","Tap a topic to open it. Drag to move, pinch to zoom.")+'</div>'+
    '<div class="fqscrim"></div><aside class="fqside" aria-label="'+L("Kandungan","Contents")+'"><div class="fqsh"><b>📚 '+L("Kandungan penuh","Full contents")+'</b><button class="fqb fqsx" aria-label="'+L("Tutup","Close")+'">‹</button></div>'+
    '<input class="fqsearch" type="search" placeholder="'+L("Cari topik…","Search topics…")+'"><div class="fqtree"></div></aside>'+
    '<section class="fqsheet" aria-live="polite"><button class="fqgrab" aria-label="'+L("Besar / kecil","Expand / collapse")+'"><i></i></button><div class="fqsc"></div></section>'+
    '<div class="fqtoast" role="status"></div></div>';
  ov._close=back; root=ov.querySelector("#fq"); cv=q(".fqc");
  q(".fqx").onclick=exit; q(".fqtoc").onclick=function(){ showSide(!sideOpen); }; q(".fqsx").onclick=function(){ showSide(false); };
  q(".fqscrim").onclick=function(){ showSide(false); };
  q(".fqhome").onclick=function(){ select(ROOT, true); };
  root.querySelectorAll("[data-th]").forEach(function(b){ b.onclick=function(){ setTheme(b.getAttribute("data-th")); }; });
  q(".fqgrab").onclick=function(){ q(".fqsheet").classList.toggle("big"); };
  q(".fqsearch").oninput=function(){ filterTree(this.value); };
  buildTree();
  if(T){ try{ initGL(); }catch(e){ console.error(e); R=null; } }
  if(!R){ root.classList.add("nogl"); showSide(true); }
  NODES.forEach(function(n){ n.open=false; n.vis=false; n.alpha=0; n.mesh=null; });
  ROOT.open=true; HIST=[]; sel=null;
  layout(true);
  var start = H.rubu>=0 && ROOT.c[H.rubu] ? ROOT.c[H.rubu] : (st.sel!=null && NODES[st.sel] ? NODES[st.sel] : ROOT);
  select(start, true, true);
  window.addEventListener("resize", onResize); document.addEventListener("visibilitychange", onVis);
  H.on("pause", onPause); H.on("resume", onResume); H.on("ttsdone", ttsDone);
  onResize(); running=true; last=performance.now(); raf=requestAnimationFrame(loop);
  setTimeout(function(){ var h=q(".fqhint"); if(h) h.classList.add("off"); }, 4200);
}
// Back returns to the topic opened just before (not the parent), then closes the map back to the page it was opened from.
function back(){
  if(sideOpen){ showSide(false); return; }
  if(HIST.length){ select(NODES[HIST.pop()], true, false, true); return; }
  exit();
}
function exit(){
  running=false; cancelAnimationFrame(raf); stopAudio(); stopSpeak(); save();
  window.removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", onVis);
  H.off("pause", onPause); H.off("resume", onResume); H.off("ttsdone", ttsDone);
  meshes.forEach(function(m){ disposeMesh(m); }); meshes=[]; ribbons.forEach(function(r){ r.geometry.dispose(); r.material.dispose(); }); ribbons=[];
  NODES.forEach(function(n){ n.mesh=null; n.rib=null; n.vis=false; n.alpha=0; });
  if(R){ try{ R.dispose(); R.forceContextLoss(); }catch(e){} R=null; }
  decor=null; decorKind="";
  var o=document.getElementById("overlay"); o.classList.add("hidden"); o.innerHTML=""; o._close=null; o.className="hidden";
  if(H.onExit) H.onExit();
}
function onPause(){ running=false; cancelAnimationFrame(raf); stopAudio(); }
function onResume(){ if(!running && root && document.body.contains(root)){ running=true; last=performance.now(); raf=requestAnimationFrame(loop); } }
function onVis(){ if(document.hidden) onPause(); else onResume(); }
function toast(m){ var t=q(".fqtoast"); if(!t) return; t.textContent=m; t.classList.add("on"); clearTimeout(toast._t); toast._t=setTimeout(function(){ t.classList.remove("on"); }, 2400); }

// ---------- three.js scene ----------
function initGL(){
  R=new T.WebGLRenderer({canvas:cv, antialias:true, alpha:true}); R.domElement.dataset.ib3d="own";
  R.setPixelRatio(Math.min(2, window.devicePixelRatio||1)); R.setClearColor(0x000000, 0);
  scene=new T.Scene(); camera=new T.PerspectiveCamera(50, 1, 0.5, 400);
  setTheme(st.th, true);
  var ptrs={}, drag=null, pinch=null, moved=0;
  cv.addEventListener("pointerdown", function(e){ cv.setPointerCapture(e.pointerId); ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
    var ks=Object.keys(ptrs); if(ks.length===1){ drag={x:e.clientX,y:e.clientY}; moved=0; } else if(ks.length===2){ var a=ptrs[ks[0]], b=ptrs[ks[1]]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y), td:cam.td}; drag=null; moved=99; } });
  cv.addEventListener("pointermove", function(e){ if(!ptrs[e.pointerId]) return; ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
    var ks=Object.keys(ptrs);
    if(pinch && ks.length>=2){ var a=ptrs[ks[0]], b=ptrs[ks[1]], d=Math.hypot(a.x-b.x,a.y-b.y); if(d>10){ cam.td=clampD(pinch.td*pinch.d/d); cam.d=cam.td; } return; }
    if(drag){ var dx=e.clientX-drag.x, dy=e.clientY-drag.y; moved+=Math.abs(dx)+Math.abs(dy); drag={x:e.clientX,y:e.clientY};
      var k=2*cam.d*Math.tan(camera.fov*Math.PI/360)/(cv.clientHeight||1); cam.tx-=dx*k; cam.ty+=dy*k; cam.x=cam.tx; cam.y=cam.ty; } });
  var up=function(e){ var had=!!ptrs[e.pointerId]; delete ptrs[e.pointerId]; var n=Object.keys(ptrs).length;
    if(n<2) pinch=null;
    if(had && n===0){ if(drag && moved<10) tap(e.clientX, e.clientY); drag=null; }
    else if(n===1){ var k=Object.keys(ptrs)[0]; drag={x:ptrs[k].x,y:ptrs[k].y}; } };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("wheel", function(e){ e.preventDefault(); cam.td=clampD(cam.td*Math.exp(e.deltaY*0.0012)); }, {passive:false});
}
function clampD(d){ return Math.max(5, Math.min(110, d)); }
function onResize(){ if(!R) return; var w=root.clientWidth||innerWidth, h=root.clientHeight||innerHeight; R.setSize(w,h,false); camera.aspect=w/h; camera.fov = w<h ? 58 : 46; camera.updateProjectionMatrix(); layout(false); if(sel) frame(sel); }
function tap(x, y){
  if(!R) return; var r=cv.getBoundingClientRect(), v=new T.Vector2(((x-r.left)/r.width)*2-1, -((y-r.top)/r.height)*2+1);
  var rc=new T.Raycaster(); rc.setFromCamera(v, camera);
  var hit=rc.intersectObjects(meshes.filter(function(m){ return m.userData.n.alpha>0.5; }), false)[0];
  if(hit){ var n=hit.object.userData.n; select(n, false); try{ H.N.vibrate && H.N.vibrate(15); }catch(e){} }
}

// ---------- cards ----------
var CW={0:4.8, 1:4.0}, PXU=150;
function cardW(n){ return CW[n.depth]||3.7; }
function wrap(ctx, text, maxW, maxLines){
  var words=String(text).split(" "), lines=[], cur="";
  words.forEach(function(w){ var t=cur?cur+" "+w:w; if(ctx.measureText(t).width>maxW && cur){ lines.push(cur); cur=w; } else cur=t; });
  if(cur) lines.push(cur);
  if(lines.length>maxLines){ lines=lines.slice(0,maxLines); var l=lines[maxLines-1]; while(ctx.measureText(l+"…").width>maxW && l.length>1) l=l.slice(0,-1); lines[maxLines-1]=l+"…"; }
  return lines;
}
function rr(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function cardState(n){ return n===sel ? "sel" : (sel && pathOf(sel).indexOf(n)>=0 ? "path" : "n"); }
function drawCard(n){
  var w=Math.round(cardW(n)*PXU), fs = n.depth===0 ? 50 : n.depth===1 ? 44 : 38, lh=fs*1.18, pad=26;
  var c=document.createElement("canvas"), ctx=c.getContext("2d");
  ctx.font="700 "+fs+"px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  var lines=wrap(ctx, n.lab, w-pad*2-(n.depth>=2?14:0), n.depth===0?2:3);
  var meta=metaOf(n), mh=meta?36:0, h=Math.round(pad*2+lines.length*lh+mh), s=cardState(n);
  c.width=w+24; c.height=h+24; ctx=c.getContext("2d");
  ctx.translate(12,10);
  ctx.shadowColor="rgba(20,30,25,.28)"; ctx.shadowBlur=14; ctx.shadowOffsetY=5;
  rr(ctx,0,0,w,h, n.depth===0? h/2.2 : 30);
  ctx.fillStyle = s==="sel" ? n.hue : "rgba(255,255,255,.95)"; ctx.fill();
  ctx.shadowColor="transparent";
  if(s==="path"){ ctx.lineWidth=7; ctx.strokeStyle=n.hue; ctx.stroke(); }
  else if(s==="n" && n.depth>=1){ ctx.save(); rr(ctx,0,0,w,h,30); ctx.clip(); ctx.fillStyle=n.hue; ctx.fillRect(0,0,13,h); ctx.restore(); }
  if(n.depth===0 && s!=="sel"){ ctx.lineWidth=6; ctx.strokeStyle=ROOTC; ctx.stroke(); }
  ctx.fillStyle = s==="sel" ? "#fff" : "#1d2b24"; ctx.textBaseline="top"; ctx.textAlign="center";
  ctx.font="700 "+fs+"px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  lines.forEach(function(l,i){ ctx.fillText(l, w/2+(n.depth>=2?6:0), pad+i*lh+2); });
  if(meta){ ctx.font="600 27px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"; ctx.fillStyle = s==="sel" ? "rgba(255,255,255,.85)" : "#5d6f65"; ctx.fillText(meta, w/2+(n.depth>=2?6:0), pad+lines.length*lh+6); }
  if(n.c.length){ ctx.font="700 34px system-ui, sans-serif"; ctx.fillStyle = s==="sel" ? "#fff" : n.hue; ctx.textAlign="right"; ctx.fillText(n.open?"−":"+", w-16, h/2-17); }
  var tex=new T.CanvasTexture(c); tex.colorSpace=T.SRGBColorSpace; tex.anisotropy=4;
  return {tex:tex, w:(w+24)/PXU, h:(h+24)/PXU};
}
function metaOf(n){
  var p=[];
  if(n.c.length) p.push(n.c.length+" "+(n.depth===0?"rubu'":L("topik","topics")));
  if(n.na) p.push(n.na+" "+L("ayat","ayat"));
  if(n.nh) p.push(n.nh+" "+L("hadis","hadith"));
  return p.join(" · ");
}
function makeMesh(n){
  var d=drawCard(n), m=new T.Mesh(new T.PlaneGeometry(d.w, d.h), new T.MeshBasicMaterial({map:d.tex, transparent:true, depthWrite:false, opacity:0}));
  m.userData.n=n; n.mesh=m; n.h=d.h; n.mstate=cardState(n)+(n.open?1:0); m.renderOrder=10+n.depth; scene.add(m); meshes.push(m);
}
function refreshMesh(n){
  if(!n.mesh) return; var s=cardState(n)+(n.open?1:0); if(s===n.mstate) return;
  var d=drawCard(n); n.mesh.material.map.dispose(); n.mesh.material.map=d.tex; n.mesh.material.needsUpdate=true;
  n.mesh.geometry.dispose(); n.mesh.geometry=new T.PlaneGeometry(d.w, d.h); n.h=d.h; n.mstate=s;
}
function disposeMesh(m){ scene.remove(m); m.geometry.dispose(); if(m.material.map) m.material.map.dispose(); m.material.dispose(); }
function estH(n){ if(n.h) return n.h; var chars=n.lab.length, per = n.depth>=2 ? 15 : 17, lines=Math.min(3, Math.ceil(chars/per)); return 0.45+lines*0.3+(metaOf(n)?0.24:0); }

// ---------- layout ----------
function layout(first){
  NODES.forEach(function(n){ n.want=false; });
  ROOT.want=true; ROOT.x=0; ROOT.y=0; ROOT.z=0;
  var rub=ROOT.c, ang=[[1,1],[1,-1],[-1,-1],[-1,1]];
  port=(root.clientWidth||360)<(root.clientHeight||640); var RX=port?2.6:5.9, RY=port?3.5:2.9;
  rub.forEach(function(n,i){ var a=ang[i%4]; n.rx=a[0]; n.want=true; n.x=a[0]*RX; n.y=a[1]*RY; n.z=-0.4; });
  var col=function(p){
    if(!p.open || !p.c.length || p.depth===0) return;
    var sd=side(p), gap=0.34, hs=p.c.map(estH), tot=hs.reduce(function(a,b){ return a+b+gap; }, -gap), y=p.y+tot/2;
    var bx=p.x+sd*(cardW(p)/2+1.9+cardW(p.c[0])/2);
    p.c.forEach(function(c,i){ var cy=y-hs[i]/2; y-=hs[i]+gap; var dy=cy-p.y;
      c.want=true; c.x=bx+sd*Math.min(2.6, 0.018*dy*dy); c.y=cy; c.z=p.z-0.55; col(c); });
  };
  rub.forEach(col);
  NODES.forEach(function(n){
    if(n.want && !n.vis){ n.vis=true; var p=n.par||n; n.cx=p.cx; n.cy=p.cy; n.cz=p.cz; n.alpha=0; if(first && n===ROOT){ n.cx=0; n.cy=0; } if(R && !n.mesh) makeMesh(n); }
    n.ta = n.want ? 1 : 0;
    if(!n.want && n.vis){ var pp=n.par; while(pp && !pp.want) pp=pp.par; n.gx=pp?pp.x:0; n.gy=pp?pp.y:0; }
  });
}

// ---------- selection ----------
function select(n, fromNav, quiet, fromBack){
  var prev=sel; sel=n;
  if(prev && prev!==n && !fromBack){ HIST.push(prev.id); if(HIST.length>200) HIST.shift(); }
  // open the path, fold everything else (one branch at a time keeps the map readable)
  var path=pathOf(n);
  NODES.forEach(function(x){ if(path.indexOf(x)<0) x.open=false; });
  path.forEach(function(x){ x.open=true; });
  if(prev===n && !fromNav && n.c.length && n!==ROOT){ n.open=false; }
  ROOT.open=true;
  layout(false);
  NODES.forEach(function(x){ if(x.mesh) refreshMesh(x); });
  st.sel=n.id; save();
  frame(n);
  showSheet(n, quiet);
  markTree(n);
}
function frame(n){
  if(!R) return;
  var vis=[n].concat(n.open?n.c:[]);
  if(n===ROOT) vis=[ROOT].concat(ROOT.c);
  var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  vis.forEach(function(v){ var w=cardW(v)/2, h=estH(v)/2; x0=Math.min(x0,v.x-w); x1=Math.max(x1,v.x+w); y0=Math.min(y0,v.y-h); y1=Math.max(y1,v.y+h); });
  var w=root.clientWidth||360, h=root.clientHeight||640, tan=Math.tan(camera.fov*Math.PI/360), asp=w/h;
  var sheetH = sheetOpen && !wide() ? Math.min(0.5, (q(".fqsheet").offsetHeight||0)/h) : 0, sheetW = sheetOpen && wide() ? (q(".fqsheet").offsetWidth||0)/w : 0;
  var bw=x1-x0, bh=y1-y0;
  // a tall column of subtopics: fit the width and let the user scroll (drag) the rest
  var dH=(bh/2+0.8)/tan/(1-sheetH), dW=(bw/2+0.8)/(tan*asp)/(1-sheetW);
  var d = n.open && n.c.length>8 ? Math.max(dW, Math.min(dH, 26)) : Math.max(dW, dH);
  d=clampD(Math.max(9, d));
  var cx=(x0+x1)/2, cy=(y0+y1)/2;
  if(n.open && n.c.length>8){ // start at the top of a long column, near the opened node
    var vh=d*tan; cy=Math.min(cy, n.y+vh*0.35); cy=Math.max(cy, y0+vh*(1-2*sheetH)*0.9);
  }
  cam.tx = cx + sheetW*d*tan*asp; cam.ty = cy - sheetH*d*tan; cam.td=d;
}
function wide(){ return (root.clientWidth||0) >= 760; }

// ---------- loop ----------
function loop(now){
  if(!running) return; raf=requestAnimationFrame(loop);
  var dt=Math.min(0.05,(now-last)/1000); last=now; clock+=dt;
  if(!R) return;
  var k=1-Math.exp(-dt*(calm?14:6.5)), ka=1-Math.exp(-dt*(calm?16:5));
  cam.x+=(cam.tx-cam.x)*k; cam.y+=(cam.ty-cam.y)*k; cam.d+=(cam.td-cam.d)*k;
  var sw = calm ? 0 : 1;
  camera.position.set(cam.x+Math.sin(clock*0.31)*0.35*sw, cam.y+Math.cos(clock*0.23)*0.25*sw, cam.d);
  camera.lookAt(cam.x, cam.y, -1.5);
  var dead=[];
  NODES.forEach(function(n){
    if(!n.vis) return;
    var tx=n.want?n.x:n.gx, ty=n.want?n.y:n.gy, tz=n.want?n.z:(n.par?n.par.z:0);
    n.cx+=(tx-n.cx)*k; n.cy+=(ty-n.cy)*k; n.cz+=(tz-n.cz)*k; n.alpha+=(n.ta-n.alpha)*ka;
    if(!n.want && n.alpha<0.02){ dead.push(n); return; }
    if(n.mesh){ var bob = calm?0:Math.sin(clock*0.9+n.id)*0.04; n.mesh.position.set(n.cx, n.cy+bob, n.cz); n.mesh.material.opacity=Math.min(1,n.alpha);
      var sc = n===sel ? 1.06+Math.sin(clock*2.2)*0.012*sw : 1; n.mesh.scale.set(sc,sc,1); }
  });
  dead.forEach(function(n){ n.vis=false; n.alpha=0; if(n.mesh){ meshes.splice(meshes.indexOf(n.mesh),1); disposeMesh(n.mesh); n.mesh=null; } if(n.rib){ ribbons.splice(ribbons.indexOf(n.rib),1); scene.remove(n.rib); n.rib.geometry.dispose(); n.rib.material.dispose(); n.rib=null; } });
  NODES.forEach(function(n){ if(n.vis && n.par) ribbon(n); });
  stepDecor(dt);
  R.render(scene, camera);
}
var SEG=22;
function ribbon(n){
  var p=n.par, sd=side(n), onPath = sel && pathOf(sel).indexOf(n)>=0;
  var sx = p===ROOT ? p.cx+sd*cardW(p)*(port?0.06:0.42) : p.cx+sd*cardW(p)/2*0.98, sy=p.cy, sz=p.cz-0.02;
  var ex = n.cx-sd*cardW(n)/2*0.98, ey=n.cy, ez=n.cz-0.02;
  var w = (n.depth===1 ? 0.13 : n.depth===2 ? 0.085 : 0.055) * (onPath?1.7:1);
  if(!n.rib){ var g=new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(new Float32Array((SEG+1)*2*3),3)); var idx=[]; for(var i=0;i<SEG;i++){ var a=i*2; idx.push(a,a+1,a+2, a+1,a+3,a+2); } g.setIndex(idx);
    n.rib=new T.Mesh(g, new T.MeshBasicMaterial({color:new T.Color(n.hue), transparent:true, opacity:0, depthWrite:false, side:T.DoubleSide})); n.rib.renderOrder=1; n.rib.frustumCulled=false; scene.add(n.rib); ribbons.push(n.rib); }
  var pos=n.rib.geometry.attributes.position.array, mx=(sx+ex)/2;
  for(var i=0;i<=SEG;i++){ var t=i/SEG, u=1-t;
    var x=u*u*u*sx+3*u*u*t*mx+3*u*t*t*mx+t*t*t*ex, y=u*u*u*sy+3*u*u*t*sy+3*u*t*t*ey+t*t*t*ey, z=sz+(ez-sz)*t;
    var dx=3*u*u*(mx-sx)+6*u*t*(mx-mx)+3*t*t*(ex-mx), dy=3*u*u*0+6*u*t*(ey-sy)+3*t*t*0, l=Math.hypot(dx,dy)||1, ww=w*(1-0.45*t);
    pos[i*6]=x-dy/l*ww; pos[i*6+1]=y+dx/l*ww; pos[i*6+2]=z; pos[i*6+3]=x+dy/l*ww; pos[i*6+4]=y-dx/l*ww; pos[i*6+5]=z; }
  n.rib.geometry.attributes.position.needsUpdate=true;
  n.rib.material.opacity=Math.min(n.alpha, onPath?0.95:0.55);
}

// ---------- backgrounds (sand, clouds, grass) ----------
function dotTex(kind){
  var c=document.createElement("canvas"); c.width=c.height=128; var x=c.getContext("2d");
  if(kind==="awan"){ [[64,74,40],[38,82,28],[90,82,30],[52,56,30],[80,58,26]].forEach(function(b){ var g=x.createRadialGradient(b[0],b[1],2,b[0],b[1],b[2]); g.addColorStop(0,"rgba(255,255,255,.95)"); g.addColorStop(1,"rgba(255,255,255,0)"); x.fillStyle=g; x.beginPath(); x.arc(b[0],b[1],b[2],0,7); x.fill(); }); }
  else { var g=x.createRadialGradient(64,64,0,64,64,60); g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(0.35,"rgba(255,255,255,.55)"); g.addColorStop(1,"rgba(255,255,255,0)"); x.fillStyle=g; x.fillRect(0,0,128,128); }
  var t=new T.CanvasTexture(c); t.colorSpace=T.SRGBColorSpace; return t;
}
function buildDecor(kind){
  if(decor){ decor.children.forEach(function(s){ if(s.material.map) s.material.map.dispose(); s.material.dispose(); if(s.geometry) s.geometry.dispose(); }); scene.remove(decor); }
  decor=new T.Group(); decorKind=kind; scene.add(decor);
  var tex=dotTex(kind), n = kind==="awan" ? 16 : kind==="pasir" ? 70 : 55;
  for(var i=0;i<n;i++){
    var col = kind==="awan" ? 0xffffff : kind==="pasir" ? (i%3?0xf3d9a4:0xffffff) : (i%4?0xf6f2a0:0xd8ffb0);
    var s=new T.Sprite(new T.SpriteMaterial({map:tex, color:col, transparent:true, depthWrite:false, opacity: kind==="awan"?0.8:0.55}));
    var z = kind==="awan" ? -18-Math.random()*30 : -4-Math.random()*22, sz = kind==="awan" ? 9+Math.random()*10 : 0.12+Math.random()*0.3;
    s.scale.set(sz, kind==="awan"?sz*0.62:sz, 1); s.position.set((Math.random()-0.5)*90, (Math.random()-0.5)*60, z);
    s.userData={vx: kind==="awan" ? 0.4+Math.random()*0.5 : kind==="pasir" ? 0.8+Math.random()*1.2 : (Math.random()-0.5)*0.3, vy: kind==="rumput" ? 0.15+Math.random()*0.3 : kind==="pasir" ? (Math.random()-0.5)*0.15 : 0, ph:Math.random()*7};
    s.renderOrder=0; decor.add(s);
  }
}
function stepDecor(dt){
  if(!decor) return; var f=calm?0.3:1;
  decor.position.set(cam.x*0.75, cam.y*0.75, 0);
  decor.children.forEach(function(s){ var u=s.userData; s.position.x+=u.vx*dt*f; s.position.y+=(u.vy+Math.sin(clock*0.7+u.ph)*0.08)*dt*f;
    if(s.position.x>48) s.position.x=-48; if(s.position.x<-48) s.position.x=48; if(s.position.y>32) s.position.y=-32; if(s.position.y<-32) s.position.y=32;
    if(decorKind==="rumput") s.material.opacity=0.35+0.3*Math.sin(clock*1.6+u.ph); });
}
function setTheme(th, init){
  st.th=th; save(); root.className="fq th-"+th+(R||init?"":" nogl");
  root.querySelectorAll("[data-th]").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-th")===th); });
  if(scene) buildDecor(th);
}

// ---------- contents sidebar ----------
function buildTree(){
  var h=[], rec=function(n){
    var kids=n.c.length;
    h.push('<div class="fqi d'+n.depth+(n.depth<=1?" op":"")+'" data-i="'+n.id+'" style="--h:'+n.hue+'"><div class="fqrow">'+(kids?'<button class="fqcar" data-car="'+n.id+'" aria-label="'+L("Buka/tutup","Expand/collapse")+'">›</button>':'<span class="fqdot"></span>')+
      '<button class="fqlab" data-fq="'+n.id+'">'+esc(n.lab)+(n.d.length?' <small>'+n.d.length+'</small>':'')+'</button></div>');
    if(kids){ h.push('<div class="fqkids">'); n.c.forEach(rec); h.push('</div>'); }
    h.push('</div>');
  };
  rec(ROOT);
  var tr=q(".fqtree"); tr.innerHTML=h.join("");
  tr.onclick=function(e){
    var c=e.target.closest("[data-car]"); if(c){ c.parentNode.parentNode.classList.toggle("op"); return; }
    var g=e.target.closest("[data-fq]"); if(g){ var n=NODES[+g.getAttribute("data-fq")]; select(n, true); if(!wide() || !R) showSide(false); }
  };
}
function markTree(n){
  var tr=q(".fqtree"); if(!tr) return;
  var o=tr.querySelector(".fqi.on"); if(o) o.classList.remove("on");
  var el=tr.querySelector('.fqi[data-i="'+n.id+'"]'); if(!el) return; el.classList.add("on");
  var p=el.parentNode; while(p && p!==tr){ if(p.classList && p.classList.contains("fqi")) p.classList.add("op"); p=p.parentNode; }
}
function showSide(on){
  sideOpen=on; root.classList.toggle("side", on);
  if(on){ var el=q(".fqi.on"); if(el) setTimeout(function(){ try{ el.scrollIntoView({block:"center"}); }catch(e){} }, 260); }
}
function filterTree(qs){
  var tr=q(".fqtree"), s=String(qs||"").toLowerCase().trim();
  tr.classList.toggle("filt", !!s);
  tr.querySelectorAll(".fqi").forEach(function(el){ el.classList.remove("hit","keep"); });
  if(!s) return;
  NODES.forEach(function(n){ if(n.t.toLowerCase().indexOf(s)>=0 || (n.te && n.te.toLowerCase().indexOf(s)>=0)){ var el=tr.querySelector('.fqi[data-i="'+n.id+'"]'); if(!el) return; el.classList.add("hit"); var p=el.parentNode; while(p && p!==tr){ if(p.classList && p.classList.contains("fqi")) p.classList.add("keep","op"); p=p.parentNode; } } });
}

// ---------- detail sheet: ayat and hadith with play buttons ----------
function showSheet(n, quiet){
  var sh=q(".fqsheet"), sc=q(".fqsc"); stopAudio(); stopSpeak();
  var crumbs=pathOf(n).map(function(x){ return '<button class="fqcr" data-fq="'+x.id+'" style="--h:'+x.hue+'">'+esc(x===ROOT?"⚖️":x.lab)+'</button>'; }).join('<span class="fqsep">›</span>');
  var h='<div class="fqcrumbs">'+crumbs+'</div><h2 style="--h:'+n.hue+'">'+esc(n.lab)+'</h2>'+(en && n.te && n!==ROOT ? '<div class="fqms">'+esc(n.t)+'</div>' : '');
  if(n===ROOT){
    h+='<p class="fqintro">'+L("Peta minda fiqh mengikut mazhab Syafi'i: empat rubu' (Ibadat, Muamalat, Munakahat, Jinayat), setiap satu dengan kitab, bab dan subtopiknya. Ketik mana-mana kad untuk membukanya. Setiap topik memaparkan ayat al-Quran dan hadis yang menjadi dalilnya.","A mind map of fiqh in the Shafi'i school: four quarters (Worship, Transactions, Marriage, Criminal law), each with its books, chapters and subtopics. Tap any card to open it. Each topic shows the Quran verses and hadith it is based on.")+'</p>'+
      '<div class="fqstat"><b>'+(NODES.length-1)+'</b> '+L("topik","topics")+' · <b>'+ROOT.na+'</b> '+L("ayat","ayat")+' · <b>'+ROOT.nh+'</b> '+L("hadis","hadith")+'</div>';
  } else if(n.v) h+='<div class="fqref">📖 Fiqh Syafii '+L("Jilid","Vol.")+' '+n.v+(n.p?', '+L("hlm.","p.")+' '+n.p:'')+'</div>';
  if(n.c.length){ h+='<div class="fqkid">'+n.c.map(function(c){ return '<button class="fqchip" data-fq="'+c.id+'" style="--h:'+c.hue+'">'+esc(c.lab)+(c.na+c.nh?'<small>'+(c.na+c.nh)+'</small>':'')+'</button>'; }).join("")+'</div>'; }
  if(n.d.length){
    h+='<div class="fqdh">'+L("Dalil","Evidence")+' <small>'+n.d.length+'</small>'+(n.na>1 && n.d.filter(function(x){ return x.y==="a"; }).length>1?'<button class="fqall" data-all="1">▶ '+L("Main semua ayat","Play all ayat")+'</button>':'')+'</div>';
    n.d.forEach(function(x,i){ h+= x.y==="a" ? ayatCard(x,i) : hadisCard(x,i); });
  } else if(!n.c.length) h+='<div class="fqnone">'+L("Tiada ayat atau hadis dikutip dalam bahagian ini. Lihat halaman buku untuk huraian penuh.","No ayat or hadith are quoted in this section. See the book page for the full explanation.")+'</div>';
  if(n!==ROOT) h+='<div class="fqfoot">'+L("Sumber: Fiqh Syafii oleh H. Idris Ahmad (Pustaka Antara). Teks diimbas secara automatik dan menunggu semakan ustaz; sila laporkan kesilapan.","Source: Fiqh Syafii by H. Idris Ahmad (Pustaka Antara). The text was scanned automatically and is pending review by an ustaz; please report mistakes.")+'</div>';
  sc.innerHTML=h; sc.scrollTop=0;
  sheetOpen=true; sh.classList.add("on"); sh.classList.toggle("big", false);
  sh.classList.remove("in"); void sh.offsetWidth; sh.classList.add("in");
  sc.querySelectorAll(".fqay").forEach(fillAyat);
  sc.onclick=function(e){
    var g=e.target.closest("[data-fq]"); if(g){ select(NODES[+g.getAttribute("data-fq")], true); return; }
    var p=e.target.closest("[data-pa]"); if(p){ var x=n.d[+p.getAttribute("data-pa")]; playAyat([[x.s,x.a,x.b]], p); return; }
    var sp=e.target.closest("[data-ph]"); if(sp){ var y=n.d[+sp.getAttribute("data-ph")]; speak(y.x, sp); return; }
    var qo=e.target.closest("[data-qo]"); if(qo){ var z=n.d[+qo.getAttribute("data-qo")]; exit(); setTimeout(function(){ if(window.openQuranAt) window.openQuranAt(z.s, z.a); }, 30); return; }
    if(e.target.closest("[data-all]")){ playAyat(n.d.filter(function(x){ return x.y==="a"; }).map(function(x){ return [x.s,x.a,x.b]; }), e.target.closest("[data-all]")); }
  };
  if(R) setTimeout(function(){ if(sel===n) frame(n); }, 30);
}
function sname(s){ var m=window.QMETA; return m ? m.s[s-1][1] : "Surah "+s; }
function ayatCard(x,i){
  return '<div class="fqcard fqay" data-s="'+x.s+'" data-a="'+x.a+'" data-b="'+x.b+'" data-i="'+i+'"><div class="fqch"><span class="fqtag a">'+L("Ayat","Ayah")+'</span><b class="fqsn" data-sn="'+x.s+'">'+esc(sname(x.s))+' '+x.s+':'+x.a+(x.b>x.a?'–'+x.b:'')+'</b>'+
    '<button class="fqplay" data-pa="'+i+'" aria-label="'+L("Main bacaan","Play recitation")+'">▶</button></div><div class="fqar" dir="rtl" lang="ar">…</div><div class="fqtr">'+esc(x.m||"")+'</div>'+
    '<button class="fqopen" data-qo="'+i+'">📖 '+L("Buka dalam al-Quran","Open in the Quran")+'</button></div>';
}
function hadisCard(x,i){
  return '<div class="fqcard fqhd"><div class="fqch"><span class="fqtag h">'+L("Hadis","Hadith")+'</span><b>'+L("Riwayat ","Narrated by ")+esc(en?x.r.replace(/ dan /g," and ").replace(/ dari /g," from "):x.r)+'</b><button class="fqplay" data-ph="'+i+'" aria-label="'+L("Dengar","Listen")+'">▶</button></div><div class="fqhx"'+(en?' lang="ms"':'')+'>'+esc(x.x)+'</div>'+(en?'<div class="fqnote">Malay text from the book. An English translation is not available yet.</div>':'')+'</div>';
}
// Arabic text comes from the app's own Quran files (qs/sNNN.js, the same text the Al-Quran reader uses); the meaning from the
// downloaded Basmeih translation when present, else the book's own rendering, else Saheeh International (English).
function needJs(src, ok){ var s=document.createElement("script"); s.src=src; s.onload=ok; s.onerror=function(){ ok(true); }; document.body.appendChild(s); }
function capQSUR(){ if(window.QSUR && window.QSUR._fq) return; var prev=window.QSUR; var f=function(n,d){ FQS[n]=d; if(prev) prev(n,d); }; f._fq=true; window.QSUR=f; }
function surahText(s, cb){
  if(FQS[s]){ cb(FQS[s]); return; }
  capQSUR(); needJs("quran/qs/s"+("00"+s).slice(-3)+".js", function(){ cb(FQS[s]||null); });
}
function ayahStr(d, a){ var t=d && d.t && d.t[a-1]; if(!t) return ""; return t.map(function(p){ return typeof p==="string"?p:p[0]; }).join(""); }
function needMeta(cb){ if(window.QMETA){ cb(); return; } needJs("quran/qmeta.js", cb); }
function ms(){ if(msTr || msTried) return msTr; msTried=true; try{ if(window.Native && H.N.qRead){ var t=H.N.qRead("quran/tr/ms.json"); if(t){ var a=JSON.parse(t); if(a && a.length===6236) msTr=a; } } }catch(e){} return msTr; }
function fillAyat(el){
  var s=+el.getAttribute("data-s"), a=+el.getAttribute("data-a"), b=+el.getAttribute("data-b");
  needMeta(function(){
    var sn=el.querySelector("[data-sn]"); if(sn && window.QMETA) sn.textContent=QMETA.s[s-1][1]+" "+s+":"+a+(b>a?"–"+b:"");
    surahText(s, function(d){ var ar=[]; for(var k=a;k<=b;k++) ar.push(ayahStr(d,k)+" ﴿"+k+"﴾"); var box=el.querySelector(".fqar"); if(box) box.textContent=d?ar.join(" "):(window.QAR&&QMETA?ar.join(" "):"");
      var tr=el.querySelector(".fqtr"), m=ms(), base=window.QMETA?QMETA.sa[s-1]:null;
      if(!en && m && base!=null){ var t=[]; for(var j=a;j<=b;j++) t.push(m[base+j-1]); tr.textContent=t.join(" "); tr.setAttribute("data-src","Basmeih"); }
      else if((en || !tr.textContent) && base!=null){ var put=function(){ if(!window.QEN) return; var t=[]; for(var j=a;j<=b;j++) t.push(QEN[base+j-1]); tr.textContent=t.join(" "); tr.setAttribute("data-src","Saheeh International"); };
        if(window.QEN) put(); else needJs("quran/qen.js", put); }
    });
  });
}
function stopAudio(){ if(audio){ try{ audio.pause(); }catch(e){} audio.onended=null; audio.onerror=null; audio=null; } if(playBtn){ playBtn.textContent=playBtn.getAttribute("data-all")?"▶ "+L("Main semua ayat","Play all ayat"):"▶"; playBtn.classList.remove("on"); playBtn=null; } }
function playAyat(list, btn){
  if(playBtn===btn){ stopAudio(); return; }
  stopAudio(); stopSpeak();
  var seq=[]; list.forEach(function(r){ for(var k=r[1];k<=r[2];k++) seq.push([r[0],k]); });
  if(!seq.length) return;
  playBtn=btn; btn.classList.add("on"); btn.textContent=btn.getAttribute("data-all")?"■ "+L("Henti","Stop"):"■";
  var i=0, next=function(){
    if(playBtn!==btn) return; if(i>=seq.length){ stopAudio(); return; }
    var x=seq[i++], url="https://everyayah.com/data/Alafasy_128kbps/"+("00"+x[0]).slice(-3)+("00"+x[1]).slice(-3)+".mp3";
    audio=new Audio(url); audio.onended=next; audio.onerror=function(){ toast(L("Audio tidak dapat dimainkan. Semak internet.","Audio could not play. Check the internet.")); stopAudio(); };
    var p=audio.play(); if(p && p.catch) p.catch(function(){});
  };
  next();
}
function speak(t, btn){
  if(speakBtn===btn){ stopSpeak(); return; }
  stopAudio(); stopSpeak(); speakBtn=btn; btn.classList.add("on"); btn.textContent="■";
  var txt=String(t).replace(/s\.a\.w\./gi,"sallallahu alaihi wasallam").replace(/r\.a\./gi,"radiallahu anhu").replace(/s\.w\.t\./gi,"subhanahu wa taala");
  if(window.Native && H.N.speak){ try{ H.N.speak(txt, "ms"); }catch(e){ ttsDone(); } return; }
  try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(txt); u.lang="ms-MY"; u.rate=0.95; u.onend=ttsDone; u.onerror=ttsDone; speechSynthesis.speak(u); }catch(e){ ttsDone(); toast(L("Suara tidak tersedia","Speech is not available")); }
}
function ttsDone(){ if(speakBtn){ speakBtn.textContent="▶"; speakBtn.classList.remove("on"); speakBtn=null; } }
function stopSpeak(){ try{ if(window.Native && H && H.N.stopSpeak) H.N.stopSpeak(); }catch(e){} try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} ttsDone(); }

window.FiqhOpen=open;
})();
