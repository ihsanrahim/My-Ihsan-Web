/* My Ihsan 0.33.7: Salasilah as a chart. One layout, two looks:
   - "chalk": handwritten chalk on a green board, shown flat (2D) with three.js (orthographic camera): drag to move, pinch to zoom, tap a name.
   - "print": black on white, for the one-page PDF of the whole tree (the more names, the smaller the writing).
   Top-down hierarchy: eldest generation on top, husband and wife side by side joined by a line with a small heart,
   one line down from the couple to a bar over their children, children left to right from the firstborn.
   FamChart.build(people, meId) -> layout; FamChart.draw(canvas, L, style, hlId); FamChalk.mount(box, people, meId, opt). */
(function(){
"use strict";
var FONT_CHALK='"Coming Soon", casual, "Comic Sans MS", "Segoe Print", cursive', FONT_PRINT='system-ui, "Segoe UI", Roboto, sans-serif';
function rnd(s){ var x=Math.sin(s*12.9898+78.233)*43758.5453; return x-Math.floor(x); }

// ---------- layout ----------
function build(people, meId, style){
  var P={}; people.forEach(function(p){ P[p.id]=p; });
  var kidsOf=function(id){ return people.filter(function(x){ return x.f===id || x.m===id; }); };
  // generations: breadth-first from me (parents up, children down, spouses level)
  var gen={}, q=[]; var start=P[meId]?meId:(people[0]&&people[0].id); if(!start) return {nodes:[], rows:[], W:0, H:0};
  gen[start]=0; q.push(start);
  var walk=function(){ while(q.length){ var id=q.shift(), p=P[id], g=gen[id];
    [[p.f,-1],[p.m,-1]].concat((p.sp||[]).map(function(s){ return [s,0]; })).concat(kidsOf(id).map(function(k){ return [k.id,1]; })).forEach(function(x){ if(x[0] && P[x[0]] && gen[x[0]]===undefined){ gen[x[0]]=g+x[1]; q.push(x[0]); } }); } };
  walk(); people.forEach(function(p){ if(gen[p.id]===undefined){ gen[p.id]=0; q.push(p.id); walk(); } });
  // spouses on the same row (the lower of the two)
  for(var it=0; it<3; it++) people.forEach(function(p){ (p.sp||[]).forEach(function(s){ if(P[s] && gen[s]!==gen[p.id]){ var g=Math.max(gen[s],gen[p.id]); gen[s]=g; gen[p.id]=g; } }); });
  var g0=Math.min.apply(null, people.map(function(p){ return gen[p.id]; }));
  var fs=style==="print"?22:30, pad=style==="print"?18:26, gap=style==="print"?26:40, cgap=style==="print"?34:46, RH=style==="print"?120:170;
  var c=document.createElement("canvas").getContext("2d"); c.font="700 "+fs+"px "+(style==="print"?FONT_PRINT:FONT_CHALK);
  var N={}; people.forEach(function(p){ N[p.id]={id:p.id, p:p, w:Math.ceil(c.measureText(p.n).width)+pad, row:gen[p.id]-g0, x:0}; });
  var birth=function(p){ var b=p.b?Date.parse(p.b):NaN; return isNaN(b)?9e15:b; };
  var ordOf=function(p){ return (p.o!=null?p.o:1e6)*1e16+birth(p)+(p.t||0)*1e-6; };
  // units: a person and their spouses on the same row
  var nRows=Math.max.apply(null, people.map(function(p){ return N[p.id].row; }))+1, rows=[];
  for(var r=0;r<nRows;r++){ var ids=people.filter(function(p){ return N[p.id].row===r; }).map(function(p){ return p.id; }), used={}, units=[];
    ids.forEach(function(id){ if(used[id]) return; var p=P[id], m=[id]; used[id]=1; (p.sp||[]).forEach(function(s){ if(N[s] && N[s].row===r && !used[s]){ used[s]=1; m.push(s); } });
      m.sort(function(a,b){ return (P[a].g==="f")-(P[b].g==="f"); });   // husband left, wife right
      var u={m:m, r:r}; m.forEach(function(x){ N[x].u=u; }); units.push(u); });
    rows.push(units); }
  var uw=function(u){ return u.m.reduce(function(a,x){ return a+N[x].w; },0)+(u.m.length-1)*cgap; };
  var place=function(u, x){ u.x=x; var cx=x; u.m.forEach(function(id){ N[id].x=cx; cx+=N[id].w+cgap; }); };
  var center=function(id){ return N[id].x+N[id].w/2; };
  var ucenter=function(u){ return u.x+uw(u)/2; };
  var parentC=function(id){ var p=P[id], a=[p.f,p.m].filter(function(z){ return z && N[z]; }); if(!a.length) return null; return a.reduce(function(s,z){ return s+center(z); },0)/a.length; };
  var settle=function(units, want){   // keep order, no overlaps, as close to `want` as possible
    units.forEach(function(u,i){ place(u, want[i]-uw(u)/2); });
    for(var i=1;i<units.length;i++){ var pr=units[i-1], mn=pr.x+uw(pr)+gap; if(units[i].x<mn) place(units[i], mn); }
    var sh=0; units.forEach(function(u,i){ sh+=want[i]-ucenter(u); }); sh/=Math.max(1,units.length); units.forEach(function(u){ place(u, u.x+sh); }); };
  rows.forEach(function(units){ var x=0; units.forEach(function(u){ place(u,x); x+=uw(u)+gap; }); });
  for(var k=0;k<10;k++){
    // down: each unit under its parents, children in birth order
    rows.forEach(function(units, r){ if(r===0) return;
      units.forEach(function(u){ var cs=u.m.map(parentC).filter(function(v){ return v!=null; }); u.want=cs.length?cs.reduce(function(x,y){ return x+y; },0)/cs.length:ucenter(u); u.ord=Math.min.apply(null, u.m.map(function(id){ return P[id].f||P[id].m?ordOf(P[id]):1e30; })); });
      units.sort(function(a,b){ return Math.abs(a.want-b.want)>1?(a.want-b.want):(a.ord-b.ord); });
      settle(units, units.map(function(u){ return u.want; })); });
    // up: each couple over the middle of its children
    for(var r2=rows.length-2;r2>=0;r2--){ var units2=rows[r2];
      units2.forEach(function(u){ var ch=[]; u.m.forEach(function(id){ people.forEach(function(x){ if((x.f===id||x.m===id) && N[x.id].row===r2+1) ch.push(center(x.id)); }); }); u.want=ch.length?(Math.min.apply(null,ch)+Math.max.apply(null,ch))/2:ucenter(u); });
      if(k<7) units2.sort(function(a,b){ return a.want-b.want; });
      settle(units2, units2.map(function(u){ return u.want; })); }
  }
  var minX=1e9, maxX=-1e9; people.forEach(function(p){ minX=Math.min(minX,N[p.id].x); maxX=Math.max(maxX,N[p.id].x+N[p.id].w); });
  var M=style==="print"?40:90, top=style==="print"?110:110;
  people.forEach(function(p){ var n=N[p.id]; n.x+=M-minX; n.y=top+n.row*RH; n.h=fs+18; });
  // sibling groups: children of the same father/mother pair
  var groups={}; people.forEach(function(p){ if(!(p.f&&N[p.f]) && !(p.m&&N[p.m])) return; var key=(N[p.f]?p.f:"")+"|"+(N[p.m]?p.m:""); (groups[key]=groups[key]||[]).push(p.id); });
  // bars that would overlap on the same row get their own height (lane), so each family's line stays readable
  var lane={}, byRow={}; Object.keys(groups).forEach(function(key){ var pr=key.split("|").filter(Boolean), ks=groups[key]; if(!pr.length) return;
    var xs=ks.map(center).concat([pr.reduce(function(s2,id){ return s2+center(id); },0)/pr.length]); (byRow[N[ks[0]].row]=byRow[N[ks[0]].row]||[]).push({k:key, a:Math.min.apply(null,xs), b:Math.max.apply(null,xs)}); });
  Object.keys(byRow).forEach(function(r){ var ends=[]; byRow[r].sort(function(x,y){ return x.a-y.a; }).forEach(function(iv){ var l=0; while(ends[l]!=null && ends[l]>iv.a-14) l++; ends[l]=iv.b; lane[iv.k]=l; }); });
  return {N:N, P:P, rows:rows, groups:groups, lane:lane, fs:fs, RH:RH, cgap:cgap, W:Math.ceil(maxX-minX+2*M), H:Math.ceil(top+nRows*RH-RH+fs+70), me:meId, style:style};
}

// ---------- drawing ----------
function chalkLine(g, x1,y1,x2,y2, seed, col, lw){ g.save(); g.strokeStyle=col; g.lineCap="round";
  for(var k=0;k<2;k++){ g.globalAlpha=k?0.35:0.8; g.lineWidth=(lw||3)*(k?1.8:1); g.beginPath(); var n=Math.max(2,Math.round(Math.hypot(x2-x1,y2-y1)/22)); g.moveTo(x1+(rnd(seed+k)-0.5)*1.5, y1+(rnd(seed+k+1)-0.5)*1.5);
    for(var i=1;i<=n;i++){ var t=i/n; g.lineTo(x1+(x2-x1)*t+(rnd(seed*3+i+k*7)-0.5)*2.2, y1+(y2-y1)*t+(rnd(seed*5+i+k*11)-0.5)*2.2); } g.stroke(); }
  g.restore(); }
function line(g, x1,y1,x2,y2, L, seed, col){ if(L.style==="print"){ g.save(); g.strokeStyle=col||"#444"; g.lineWidth=2; g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke(); g.restore(); } else chalkLine(g,x1,y1,x2,y2,seed,col||"rgba(240,244,236,.9)",3); }
function draw(cv, L, hl, title){
  var g=cv.getContext("2d"), S=L.style, sc=cv.width/L.W; g.setTransform(sc,0,0,sc,0,0);
  if(S==="print"){ g.fillStyle="#fff"; g.fillRect(0,0,L.W,L.H); }
  else { var gr=g.createLinearGradient(0,0,L.W,L.H); gr.addColorStop(0,"#2f5a3f"); gr.addColorStop(0.5,"#284f37"); gr.addColorStop(1,"#22452f"); g.fillStyle=gr; g.fillRect(0,0,L.W,L.H);
    // old chalk smudges
    for(var i=0;i<Math.min(260, L.W*L.H/9000);i++){ var x=rnd(i)*L.W, y=rnd(i+9)*L.H, r=20+rnd(i+3)*90, sg=g.createRadialGradient(x,y,0,x,y,r); sg.addColorStop(0,"rgba(255,255,255,"+(0.025+rnd(i+5)*0.03)+")"); sg.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=sg; g.fillRect(x-r,y-r,2*r,2*r); }
    g.strokeStyle="#6b4a2a"; g.lineWidth=26; g.strokeRect(13,13,L.W-26,L.H-26); g.strokeStyle="#8a6239"; g.lineWidth=6; g.strokeRect(26,26,L.W-52,L.H-52); }
  var N=L.N, P=L.P, fs=L.fs, font=(S==="print"?FONT_PRINT:FONT_CHALK);
  if(title){ g.font="700 "+(fs*1.25)+"px "+font; g.fillStyle=S==="print"?"#111":"rgba(255,255,255,.92)"; g.textAlign="center"; g.textBaseline="top"; g.fillText(title, L.W/2, S==="print"?24:44); }
  var mid=function(id){ var n=N[id]; return n.x+n.w/2; }, cy=function(id){ return N[id].y+N[id].h/2; };
  // couples
  L.rows.forEach(function(units){ units.forEach(function(u){ for(var i=1;i<u.m.length;i++){ var a=N[u.m[i-1]], b=N[u.m[i]], y=a.y+a.h/2;
    line(g, a.x+a.w-4, y, b.x+4, y, L, i*13+a.x, S==="print"?"#b03050":"rgba(255,200,215,.95)");
    g.font=(fs*0.7)+"px "+font; g.textAlign="center"; g.textBaseline="middle"; g.fillStyle=S==="print"?"#c0392b":"#ffb3c6"; g.fillText("♥", (a.x+a.w+b.x)/2, y-fs*0.42); } }); });
  // parents -> children
  Object.keys(L.groups).forEach(function(key, gi){ var pr=key.split("|").filter(Boolean), kids=L.groups[key]; if(!pr.length) return;
    var px=pr.reduce(function(s,id){ return s+mid(id); },0)/pr.length, py=Math.max.apply(null, pr.map(function(id){ return cy(id); }))+(pr.length>1?0:N[pr[0]].h/2), ky=N[kids[0]].y, by=ky-L.RH*0.22-(L.lane[key]||0)*L.RH*0.11;
    var xs=kids.map(mid), x1=Math.min.apply(null,xs.concat([px])), x2=Math.max.apply(null,xs.concat([px]));
    line(g, px, py, px, by, L, gi*31+1); line(g, x1, by, x2, by, L, gi*31+2);
    kids.forEach(function(k,ki){ line(g, mid(k), by, mid(k), N[k].y+2, L, gi*31+ki*7+3); }); });
  // names
  Object.keys(N).forEach(function(id, i){ var n=N[id], p=P[id], dead=!!(p.dd||p.dead), me=id===L.me, on=id===hl;
    if(on){ g.save(); g.strokeStyle=S==="print"?"#e0a000":"#ffd54a"; g.lineWidth=4; g.beginPath(); g.ellipse(n.x+n.w/2, n.y+n.h/2, n.w/2+12, n.h/2+8, 0, 0, Math.PI*2); g.stroke(); g.restore(); }
    if(S==="print"){ g.fillStyle=me?"#fff6d6":"#fff"; g.strokeStyle=me?"#c9a646":"#999"; g.lineWidth=me?2.5:1.5; g.beginPath(); if(g.roundRect) g.roundRect(n.x, n.y, n.w, n.h, 8); else g.rect(n.x,n.y,n.w,n.h); g.fill(); g.stroke(); }
    g.font="700 "+fs+"px "+font; g.textAlign="center"; g.textBaseline="middle";
    g.fillStyle=S==="print"?(dead?"#888":"#111"):(dead?"rgba(200,205,200,.55)":me?"#ffe27a":"rgba(250,250,245,.93)"); g.fillText(p.n, n.x+n.w/2, n.y+n.h/2+1);
    if(S!=="print"){ // chalk grain: tiny gaps in the strokes
      g.save(); g.globalCompositeOperation="destination-out"; for(var k=0;k<n.w*0.6;k++){ g.fillStyle="rgba(0,0,0,"+(0.25+rnd(i*97+k)*0.5)+")"; g.fillRect(n.x+rnd(i*31+k)*n.w, n.y+4+rnd(i*17+k*3)*(n.h-8), 1.3, 1.3); } g.restore();
      if(dead){ g.globalCompositeOperation="source-over"; } }
    if(me && S!=="print") chalkLine(g, n.x+8, n.y+n.h-2, n.x+n.w-8, n.y+n.h-2, i, "rgba(255,226,122,.85)", 2.5); });
}
function hitAt(L, x, y){ var best=null; Object.keys(L.N).forEach(function(id){ var n=L.N[id]; if(x>=n.x-10 && x<=n.x+n.w+10 && y>=n.y-10 && y<=n.y+n.h+10) best=id; }); return best; }
window.FamChart={ build:build, draw:draw, hitAt:hitAt };

// ---------- chalkboard view (three.js, flat) ----------
var st=null, raf=0;
function stop(){ if(raf) cancelAnimationFrame(raf); raf=0; if(st){ try{ st.ro&&st.ro.disconnect(); st.tex.dispose(); st.mesh.geometry.dispose(); st.mesh.material.dispose(); st.rn.dispose(); st.rn.forceContextLoss&&st.rn.forceContextLoss(); }catch(e){} st=null; } }
function mount(box, people, meId, opt){
  var T=window.THREE; stop(); opt=opt||{};
  var L=build(people, meId, "chalk"); if(!L.W){ box.innerHTML=""; return; }
  var maxT=4096, k=Math.min(1, maxT/Math.max(L.W, L.H)), cv=document.createElement("canvas"); cv.width=Math.max(2,Math.round(L.W*k)); cv.height=Math.max(2,Math.round(L.H*k));
  var hl=opt.sel||null, title=opt.title||"";
  draw(cv, L, hl, title);
  var W=box.clientWidth||360, Hh=box.clientHeight||360, rn=new T.WebGLRenderer({antialias:true}); rn.domElement.dataset.ib3d="own"; rn.setPixelRatio(Math.min(2, window.devicePixelRatio||1)); rn.setSize(W,Hh); rn.outputColorSpace=T.SRGBColorSpace;
  box.innerHTML=""; box.appendChild(rn.domElement);
  var sc=new T.Scene(); sc.background=new T.Color(0x1d3a28);
  var tex=new T.CanvasTexture(cv); tex.colorSpace=T.SRGBColorSpace; tex.anisotropy=4; tex.minFilter=T.LinearMipmapLinearFilter;
  var mesh=new T.Mesh(new T.PlaneGeometry(L.W, L.H), new T.MeshBasicMaterial({map:tex})); sc.add(mesh);
  var cam=new T.OrthographicCamera(-W/2, W/2, Hh/2, -Hh/2, -10, 10);
  var view={x:0, y:0, z:Math.min(W/L.W, Hh/L.H)*0.98};
  // start around me, readable
  var meN=L.N[meId]; if(meN && L.W*view.z<W*0.9){} else if(meN){ view.z=Math.max(view.z, Math.min(0.9, W/900)); view.x=meN.x+meN.w/2-L.W/2; view.y=L.H/2-(meN.y+meN.h/2); }
  var apply=function(){ var hw=W/2/view.z, hh=Hh/2/view.z; cam.left=view.x-hw; cam.right=view.x+hw; cam.top=view.y+hh; cam.bottom=view.y-hh; cam.updateProjectionMatrix(); };
  apply();
  var el=rn.domElement, pts={}, moved=0, multi=false, pinch0=0, z0=1, mid0=null;
  var down=function(e){ el.setPointerCapture&&el.setPointerCapture(e.pointerId); pts[e.pointerId]={x:e.clientX,y:e.clientY}; var k2=Object.keys(pts); if(k2.length===1){ moved=0; multi=false; } if(k2.length===2){ multi=true; var a=pts[k2[0]], b=pts[k2[1]]; pinch0=Math.hypot(a.x-b.x,a.y-b.y); z0=view.z; mid0={x:(a.x+b.x)/2,y:(a.y+b.y)/2}; } };
  var mv=function(e){ var p=pts[e.pointerId]; if(!p) return; var k2=Object.keys(pts), dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
    if(k2.length===2){ var a=pts[k2[0]], b=pts[k2[1]], d=Math.hypot(a.x-b.x,a.y-b.y), m={x:(a.x+b.x)/2,y:(a.y+b.y)/2}; if(pinch0) view.z=Math.max(0.05, Math.min(4, z0*d/pinch0)); if(mid0){ view.x-=(m.x-mid0.x)/view.z; view.y+=(m.y-mid0.y)/view.z; } mid0=m; moved+=5; }
    else { view.x-=dx/view.z; view.y+=dy/view.z; moved+=Math.abs(dx)+Math.abs(dy); }
    apply(); e.preventDefault(); };
  var toBoard=function(cx, cy){ var r=el.getBoundingClientRect(), wx=view.x+(cx-r.left-r.width/2)/view.z, wy=view.y-(cy-r.top-r.height/2)/view.z; return {x:wx+L.W/2, y:L.H/2-wy}; };
  var up=function(e){ var p=pts[e.pointerId]; delete pts[e.pointerId]; if(Object.keys(pts).length<2) mid0=null; if(p && moved<16 && !multi && !Object.keys(pts).length){ var b=toBoard(e.clientX, e.clientY), id=hitAt(L, b.x, b.y); setHl(id); if(opt.onSel) opt.onSel(id); } };
  var wheel=function(e){ view.z=Math.max(0.05, Math.min(4, view.z*(e.deltaY>0?0.9:1.1))); apply(); e.preventDefault(); };
  el.style.touchAction="none"; el.addEventListener("pointerdown",down); el.addEventListener("pointermove",mv); el.addEventListener("pointerup",up); el.addEventListener("pointercancel",up); el.addEventListener("wheel",wheel,{passive:false});
  var setHl=function(id){ hl=id; draw(cv, L, hl, title); tex.needsUpdate=true; };
  var ro=null; if(window.ResizeObserver){ ro=new ResizeObserver(function(){ var w=box.clientWidth, h=box.clientHeight; if(!w||!h) return; W=w; Hh=h; rn.setSize(w,h); apply(); }); ro.observe(box); }
  function frame(){ raf=requestAnimationFrame(frame); rn.render(sc, cam); } frame();
  st={rn:rn, tex:tex, mesh:mesh, ro:ro, L:L, setHl:setHl, focus:function(id){ var n=L.N[id]; if(!n) return; view.x=n.x+n.w/2-L.W/2; view.y=L.H/2-(n.y+n.h/2); view.z=Math.max(view.z, 0.6); apply(); }};
}
window.FamChalk={ mount:mount, stop:stop, highlight:function(id){ if(st) st.setHl(id); }, focus:function(id){ if(st) st.focus(id); }, resize:function(){} };
})();
