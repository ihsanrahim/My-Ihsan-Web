/* My Ihsan 0.33.0: two more Salasilah 3D views (three.js r159, hajj/three.min.js), both with "me" at the centre.
   "grass": the family creeps out over a lawn as grass runners: green vines along the ground, blades and leaves growing along them,
            a small flower at each person. Everyone is placed in rings by how many steps they are from me.
   "bolt":  lightning veins inside a floating storm cloud: I am the glowing origin, branches fork out in every direction (up, down,
            all around) to each relative, with flashes running along the paths now and then.
   FamWeb3D.mount(box, {nodes, links}, {style, onPick}); same data as FamTree3D (family.js layout()). Drag to orbit, pinch/wheel zoom, tap a name. */
(function(){
"use strict";
var T, raf=0, st=null;
function rnd(s){ var x=Math.sin(s*12.9898+78.233)*43758.5453; return x-Math.floor(x); }
function canvasTex(w,h,draw){ var c=document.createElement("canvas"); c.width=w; c.height=h; draw(c.getContext("2d"),w,h); var t=new T.CanvasTexture(c); t.colorSpace=T.SRGBColorSpace; return t; }
function nameTex(n, me, dead, dark, hl){
  var c=document.createElement("canvas"), g=c.getContext("2d"), f=34; g.font="700 "+f+"px system-ui,sans-serif";
  var w=Math.max(g.measureText(n).width, 80)+44; c.width=Math.min(560, Math.ceil(w)); c.height=74; g.font="700 "+f+"px system-ui,sans-serif";
  var r=26; g.fillStyle=me?"rgba(232,196,90,.97)":dark?(dead?"rgba(40,44,60,.85)":"rgba(18,30,60,.82)"):(dead?"rgba(70,70,70,.85)":"rgba(255,253,245,.92)");
  g.beginPath(); g.moveTo(r,2); g.arcTo(c.width-2,2,c.width-2,c.height-2,r); g.arcTo(c.width-2,c.height-2,2,c.height-2,r); g.arcTo(2,c.height-2,2,2,r); g.arcTo(2,2,c.width-2,2,r); g.fill();
  g.strokeStyle=hl?"#ffb300":dark?(me?"rgba(255,240,180,.9)":"rgba(140,200,255,.85)"):"rgba(60,90,40,.6)"; g.lineWidth=hl?9:3; g.stroke();
  g.fillStyle=me?"#1d1405":dark?"#e6f2ff":dead?"#eee":"#22301a"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(n.length>22?n.slice(0,21)+"…":n, c.width/2, c.height/2+1);
  var t=new T.CanvasTexture(c); t.colorSpace=T.SRGBColorSpace; t.anisotropy=4; return {t:t, a:c.width/c.height};
}
// ---------- radial layout (0.33.3): husband and wife (and co-wives) are ONE unit standing right next to each other, so each
// child gets a single branch from the couple, not one from each parent. Units are laid out breadth-first from my unit; each
// unit gets a slice of the circle shared out by how many units hang below it. Every unit branch is "up" (to a parents' unit) or "down".
function radial(data){
  var nodes=data.nodes, byId={}; nodes.forEach(function(n){ byId[n.id]=n; });
  var me=nodes.filter(function(n){ return n.me; })[0]||nodes[0]; if(!me) return {nodes:[], units:[], edges:[], spl:[], depth:0, byId:{}};
  var up={}, f=function(x){ while(up[x]!==x){ up[x]=up[up[x]]; x=up[x]; } return x; };
  nodes.forEach(function(n){ up[n.id]=n.id; });
  var spl=[]; data.links.forEach(function(L){ if(L.t==="sp" && byId[L.a[0]] && byId[L.b]){ up[f(L.a[0])]=f(L.b); spl.push([L.a[0], L.b]); } });
  var U={}; nodes.forEach(function(n){ var r=f(n.id); (U[r]=U[r]||{id:"u"+r, mem:[], adj:[]}).mem.push(n.id); });
  var uOf=function(id){ return U[f(id)]; };
  var addA=function(a,b,t){ if(a!==b && !a.adj.some(function(x){ return x.to===b; })) a.adj.push({to:b,t:t}); };
  data.links.forEach(function(L){ if(L.t==="sp") return; var cu=byId[L.b]&&uOf(L.b); if(!cu) return; L.a.forEach(function(pid){ if(!byId[pid]) return; var pu=uOf(pid); addA(pu,cu,"down"); addA(cu,pu,"up"); }); });
  var mu=uOf(me.id), order=[mu]; mu.d=0; mu.gen=0; mu.kids=[]; mu.me=true;
  for(var i=0;i<order.length;i++){ var u=order[i]; u.adj.forEach(function(e){ var v=e.to; if(v.d===undefined){ v.d=u.d+1; v.gen=u.gen+(e.t==="up"?1:-1); v.par=u; v.t=e.t; v.kids=[]; u.kids.push(v); order.push(v); } }); }
  Object.keys(U).forEach(function(k){ var v=U[k]; if(v.d===undefined){ v.d=1; v.gen=0; v.par=mu; v.t="loose"; v.loose=true; v.kids=[]; mu.kids.push(v); order.push(v); } });
  order.forEach(function(u){ u.kids.sort(function(a,b){ return (a.t==="up"?0:a.t==="loose"?2:1)-(b.t==="up"?0:b.t==="loose"?2:1); }); });
  for(var j=order.length-1;j>=0;j--){ var x=order[j]; x.w=Math.max(1+(x.mem.length-1)*0.5, x.kids.reduce(function(a,k){ return a+k.w; },0)); }
  mu.a=-Math.PI/2; mu.wid=Math.PI*2;
  order.forEach(function(u){ if(!u.kids.length) return; var tot=u.kids.reduce(function(a,k){ return a+k.w; },0), span=u===mu?Math.PI*2:Math.min(u.wid, Math.PI*0.95), a0=u.a-span/2;
    u.kids.forEach(function(k){ var sl=span*k.w/tot; k.a=a0+sl/2; k.wid=sl; a0+=sl; }); });
  var out=nodes.map(function(n){ var u=uOf(n.id); return {id:n.id, n:n.n, g:n.g, dead:n.dead, me:n.id===me.id, d:u.d, gen:u.gen, a:u.a, loose:!!u.loose, u:u}; });
  var idx={}; out.forEach(function(n){ idx[n.id]=n; });
  order.forEach(function(u){ u.nodes=u.mem.map(function(id){ return idx[id]; }); if(u.me) u.nodes.sort(function(a,b){ return b.me-a.me; }); });
  var edges=[]; order.forEach(function(u){ if(u.par && !u.loose){ var e=[u.par, u]; e.t=u.t; edges.push(e); } });
  var maxD=order.reduce(function(a,u){ return Math.max(a,u.d); },0);
  return {nodes:out, byId:idx, units:order, edges:edges, spl:spl.map(function(x){ return [idx[x[0]], idx[x[1]]]; }), depth:maxD, me:idx[me.id]};
}
// members of a unit stand side by side along the ring, `gap` apart; I stay exactly in the centre with my spouse beside me.
// Each unit's branch point (u.p) is the middle of the couple, so a child's single branch starts between both parents.
function placeUnits(R, gap){ R.units.forEach(function(u){ var tg=u.me?new T.Vector3(1,0,0):new T.Vector3(-Math.sin(u.a),0,Math.cos(u.a)), n=u.nodes.length;
  u.nodes.forEach(function(m,i){ var off=u.me?i*gap:(i-(n-1)/2)*gap; m.p=u.c.clone().addScaledVector(tg, off); });
  u.p=u.nodes.reduce(function(a,m){ return a.add(m.p); }, new T.Vector3()).multiplyScalar(1/n); }); }
// ---------- shared: renderer, orbit camera, name sprites, picking ----------
function base(box, o){
  var W=box.clientWidth||360, Hh=box.clientHeight||360;
  var rn=new T.WebGLRenderer({antialias:true, alpha:false}); rn.domElement.dataset.ib3d="own"; rn.setPixelRatio(Math.min(2, window.devicePixelRatio||1)); rn.setSize(W,Hh); rn.outputColorSpace=T.SRGBColorSpace;
  box.innerHTML=""; box.appendChild(rn.domElement);
  var sc=new T.Scene(), cam=new T.PerspectiveCamera(50, W/Hh, 0.1, 500), tgt=o.tgt.clone(), orb={th:o.th, ph:o.ph, d:o.d, auto:true, last:Date.now(), min:o.min||0.2, max:o.max||1.5};
  var place=function(){ cam.position.set(tgt.x+orb.d*Math.sin(orb.ph)*Math.sin(orb.th), tgt.y+orb.d*Math.cos(orb.ph), tgt.z+orb.d*Math.sin(orb.ph)*Math.cos(orb.th)); cam.lookAt(tgt); };
  place();
  var el=rn.domElement, pts={}, moved=0, pinch0=0, d0=0, sprites=[], mid0=null, multi=false;
  var down=function(e){ el.setPointerCapture&&el.setPointerCapture(e.pointerId); pts[e.pointerId]={x:e.clientX,y:e.clientY}; if(Object.keys(pts).length===1){ moved=0; multi=false; } orb.auto=false; orb.last=Date.now(); var k=Object.keys(pts); if(k.length===2){ multi=true; var a=pts[k[0]], b=pts[k[1]]; pinch0=Math.hypot(a.x-b.x,a.y-b.y); d0=orb.d; mid0={x:(a.x+b.x)/2, y:(a.y+b.y)/2}; } };
  // 0.33.6: two fingers pinch to zoom AND drag to pan (the ground slides under the fingers)
  var pan=function(dx, dy){ var f=orb.d*0.0018, right=new T.Vector3(Math.cos(orb.th),0,-Math.sin(orb.th)), fwd=new T.Vector3(-Math.sin(orb.th),0,-Math.cos(orb.th)); tgt.addScaledVector(right, -dx*f).addScaledVector(fwd, dy*f); };
  var mv=function(e){ var p=pts[e.pointerId]; if(!p) return; var k=Object.keys(pts);
    if(k.length===2){ p.x=e.clientX; p.y=e.clientY; var a=pts[k[0]], b=pts[k[1]], d=Math.hypot(a.x-b.x,a.y-b.y); if(pinch0) orb.d=Math.max(4, Math.min(140, d0*pinch0/d)); var m={x:(a.x+b.x)/2, y:(a.y+b.y)/2}; if(mid0) pan(m.x-mid0.x, m.y-mid0.y); mid0=m; moved+=5; }
    else if(multi){ var dx0=e.clientX-p.x, dy0=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY; moved+=Math.abs(dx0)+Math.abs(dy0); }
    else { var dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY; moved+=Math.abs(dx)+Math.abs(dy); orb.th-=dx*0.008; orb.ph=Math.max(orb.min, Math.min(orb.max, orb.ph-dy*0.006)); }
    place(); e.preventDefault(); };
  var ray=new T.Raycaster();
  // 0.33.6: names are picked on screen (the label under the finger, the marked one first), so the second tap always opens that same name
  var pickAt=function(cx, cy){ var r=el.getBoundingClientRect(), th=Math.tan(cam.fov*Math.PI/360), best=null, bd=1e9, v=new T.Vector3();
    sprites.forEach(function(s){ s.getWorldPosition(v); var dist=v.distanceTo(cam.position); v.project(cam); if(v.z>1) return; var sx=r.left+(v.x+1)/2*r.width, sy=r.top+(1-v.y)/2*r.height, k=(r.height/2)/(dist*th), hw=s.scale.x/2*k+6, hh=s.scale.y/2*k+6, dx=Math.abs(cx-sx), dy=Math.abs(cy-sy);
      if(dx<=hw && dy<=hh){ var sc2=(s.userData.id===B.selId?-1e6:0)+dist; if(sc2<bd){ bd=sc2; best=s.userData.id; } } });
    return best; };
  var up=function(e){ var p=pts[e.pointerId]; delete pts[e.pointerId]; orb.last=Date.now(); if(Object.keys(pts).length<2) mid0=null; if(p && moved<16 && !multi && !Object.keys(pts).length){ var id=pickAt(e.clientX, e.clientY);
    if(id){ if(B.selId===id){ if(o.onPick) o.onPick(id); } else { B.highlight(id); if(o.onSel) o.onSel(id); } }
    else if(B.selId){ B.highlight(null); if(o.onSel) o.onSel(null); } } };   // 0.33.5: tapping empty space clears the mark
  var wheel=function(e){ orb.d=Math.max(4, Math.min(140, orb.d*(e.deltaY>0?1.1:0.9))); place(); orb.auto=false; orb.last=Date.now(); e.preventDefault(); };
  if(window.ResizeObserver){ var ro=new ResizeObserver(function(){ var w=box.clientWidth, h=box.clientHeight; if(!w||!h) return; rn.setSize(w,h); cam.aspect=w/h; cam.updateProjectionMatrix(); }); ro.observe(box); }
  el.style.touchAction="none"; el.addEventListener("pointerdown",down); el.addEventListener("pointermove",mv); el.addEventListener("pointerup",up); el.addEventListener("pointercancel",up); el.addEventListener("wheel",wheel,{passive:false});
  var B={};
  B.highlight=function(id){ B.selId=id; sprites.forEach(function(s){ var u=s.userData, on=u.id===id; if(on && !u.t1) u.t1=nameTex(u.n.n, u.n.me, u.n.dead, u.dark, true).t; s.material.map=on?u.t1:u.t0; s.material.needsUpdate=true; s.scale.set(u.w*(on?1.25:1), u.h*(on?1.25:1), 1); s.renderOrder=on?10:0; }); };
  var addName=function(n, p, h, dark){ var nt=nameTex(n.n, n.me, n.dead, dark), sp=new T.Sprite(new T.SpriteMaterial({map:nt.t, transparent:true, depthTest:true})); sp.scale.set(h*nt.a, h, 1); sp.position.copy(p); sp.userData={id:n.id, y0:p.y, ph:rnd(n.a*9+n.d)*6, n:n, t0:nt.t, dark:dark, w:h*nt.a, h:h}; sc.add(sp); sprites.push(sp); return sp; };
  // 0.33.3: a heart between husband and wife; it fades in, then beats gently
  var hearts=[], hT=null;
  var heart=function(p, size, at, grp){ if(!hT) hT=canvasTex(128,128,function(g){ g.fillStyle="#e8475f"; g.strokeStyle="#fff"; g.lineWidth=6; g.beginPath(); g.moveTo(64,112); g.bezierCurveTo(10,74,6,40,30,24); g.bezierCurveTo(48,12,62,24,64,40); g.bezierCurveTo(66,24,80,12,98,24); g.bezierCurveTo(122,40,118,74,64,112); g.closePath(); g.stroke(); g.fill(); g.fillStyle="rgba(255,255,255,.45)"; g.beginPath(); g.ellipse(42,40,10,6,-0.6,0,Math.PI*2); g.fill(); });
    var h=new T.Sprite(new T.SpriteMaterial({map:hT, transparent:true, depthWrite:false, fog:false})); h.position.copy(p); h.scale.setScalar(0.001); h.userData={s:size, at:at}; grp.add(h); hearts.push(h); return h; };
  var beat=function(t){ hearts.forEach(function(h){ var k=Math.max(0,Math.min(1,(t-h.userData.at)/0.5)), b=1+0.1*Math.max(0,Math.sin(t*4.2))*Math.max(0,Math.sin(t*4.2)); h.scale.setScalar(Math.max(0.001, h.userData.s*k*b)); }); };
  B.rn=rn; B.sc=sc; B.cam=cam; B.tgt=tgt; B.orb=orb; B.place=place; B.sprites=sprites; B.addName=addName; B.box=box; B.heart=heart; B.beat=beat; return B;
}
// a tube along a curve, growing from its start: g.setDrawRange is moved forward over time
// cols [startColour, endColour] (0.33.2): a colour gradient along the branch (the material needs vertexColors)
function vine(curve, seg, r0, r1, mat, radial, cols){
  var rs=radial||6, g=new T.TubeGeometry(curve, seg, 1, rs, false), pos=g.attributes.position, tmp=new T.Vector3(), per=rs+1, ca=cols?new Float32Array(pos.count*3):null, c0=cols&&new T.Color(cols[0]), c1=cols&&new T.Color(cols[1]), cc=new T.Color();
  for(var i=0;i<=seg;i++){ var t=i/seg, c=curve.getPointAt(t), r=r0+(r1-r0)*t; if(ca) cc.copy(c0).lerp(c1,t); for(var j=0;j<per;j++){ var k=i*per+j; tmp.fromBufferAttribute(pos,k).sub(c).multiplyScalar(r).add(c); pos.setXYZ(k,tmp.x,tmp.y,tmp.z); if(ca){ ca[k*3]=cc.r; ca[k*3+1]=cc.g; ca[k*3+2]=cc.b; } } }
  if(ca) g.setAttribute("color", new T.BufferAttribute(ca,3));
  pos.needsUpdate=true; g.computeVertexNormals(); var m=new T.Mesh(g, mat); m.userData.full=g.index.count; m.userData.per=rs*6; g.setDrawRange(0,0); return m;
}
function grow(m, k){ var n=Math.floor(m.userData.full*Math.max(0,Math.min(1,k))/m.userData.per)*m.userData.per; m.geometry.setDrawRange(0, n); }
function ease(k){ k=Math.max(0,Math.min(1,k)); return 1-Math.pow(1-k,3); }

// ================= GRASS: runners creeping over the ground =================
function buildGrass(box, R, opt){
  var RING=4.6, maxR=Math.max(1,R.depth)*RING+3;
  var B=base(box, {tgt:new T.Vector3(0,0,0), th:0.5, ph:0.9, d:Math.max(13, maxR*1.45), min:0.25, max:1.45, onPick:opt.onPick, onSel:opt.onSel}), sc=B.sc;
  sc.background=canvasTex(2,256,function(g){ var gr=g.createLinearGradient(0,0,0,256); gr.addColorStop(0,"#9fd0f2"); gr.addColorStop(0.55,"#dcefd9"); gr.addColorStop(1,"#f3f0d6"); g.fillStyle=gr; g.fillRect(0,0,2,256); });
  sc.fog=new T.Fog(0xdfeedd, maxR*2.2, maxR*5+40);
  sc.add(new T.HemisphereLight(0xf6fbff, 0x587a35, 1.15));
  var sun=new T.DirectionalLight(0xfff1cc, 1.3); sun.position.set(12,30,8); sc.add(sun);
  // lawn: soft mown stripes with darker tufts
  var lawnT=canvasTex(256,256,function(g){ g.fillStyle="#6aa04a"; g.fillRect(0,0,256,256); for(var i=0;i<3200;i++){ var x=rnd(i)*256, y=rnd(i+7)*256; g.fillStyle="hsl("+(84+rnd(i+11)*34)+",42%,"+(26+rnd(i+9)*26)+"%)"; g.fillRect(x,y,1.3,2+rnd(i+13)*5); } });
  lawnT.wrapS=lawnT.wrapT=T.RepeatWrapping; lawnT.repeat.set(18,18);
  var lawn=new T.Mesh(new T.CircleGeometry(maxR*4+40, 72), new T.MeshLambertMaterial({map:lawnT})); lawn.rotation.x=-Math.PI/2; sc.add(lawn);
  // faint growth rings show how many steps away each person is
  for(var rr=1; rr<=R.depth; rr++){ var ring=new T.Mesh(new T.RingGeometry(rr*RING-0.04, rr*RING+0.04, 96), new T.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.18, depthWrite:false})); ring.rotation.x=-Math.PI/2; ring.position.y=0.02; sc.add(ring); }
  var P=function(n){ var r=n.d*RING*(n.loose?0.8:1); return new T.Vector3(Math.cos(n.a)*r, 0, Math.sin(n.a)*r); };
  R.units.forEach(function(u){ u.c=P(u); }); placeUnits(R, 1.9);
  var stemM=new T.MeshLambertMaterial({color:0x3f7d2a}), runM=new T.MeshLambertMaterial({color:0x8fd65a}), gradM=new T.MeshLambertMaterial({vertexColors:true}), WOOD=0x6e4a28, STALK=0x8fd65a, SPC=0x9fbf55, upM=new T.MeshLambertMaterial({color:0x7a5a2e}), spM=new T.MeshLambertMaterial({color:0xe9a3c0}), bladeM=new T.MeshLambertMaterial({color:0x5fae3c, side:T.DoubleSide}), leafM=new T.MeshLambertMaterial({color:0x4aa042, side:T.DoubleSide});
  var bladeG=new T.ConeGeometry(0.045, 0.55, 3); bladeG.translate(0,0.27,0);
  var leafG=new T.SphereGeometry(0.16, 8, 5); leafG.scale(1, 0.25, 0.5);
  var runners=[], blades=[], flowers=[], t0=performance.now();
  // the centre: a mound of clover with a golden flower for me
  var mound=new T.Mesh(new T.SphereGeometry(1.25, 24, 12, 0, Math.PI*2, 0, Math.PI/2), new T.MeshLambertMaterial({color:0x4e9a36})); mound.scale.y=0.35; sc.add(mound);
  var flower=function(p, col, big, delay){ var g=new T.Group(), s=big?1.7:1;
    var stem=new T.Mesh(new T.CylinderGeometry(0.03*s,0.04*s,0.55*s,5), stemM); stem.position.y=0.27*s; g.add(stem);
    var pm=new T.MeshLambertMaterial({color:col}); for(var i=0;i<6;i++){ var pt=new T.Mesh(new T.SphereGeometry(0.13*s,8,6), pm); pt.scale.set(1,0.35,0.6); var a=i/6*Math.PI*2; pt.position.set(Math.cos(a)*0.14*s, 0.56*s, Math.sin(a)*0.14*s); pt.rotation.y=-a; g.add(pt); }
    var ctr=new T.Mesh(new T.SphereGeometry(0.08*s,8,6), new T.MeshLambertMaterial({color:big?0xffe27a:0xf3c94a, emissive:big?0x6b4a00:0x000000})); ctr.position.y=0.58*s; g.add(ctr);
    g.position.copy(p); g.scale.setScalar(0.01); g.userData.delay=delay; sc.add(g); flowers.push(g); return g; };
  flower(new T.Vector3(0,0.38,0), 0xfff4c2, true, 0);
  // runners: each one leaves its parent and creeps to the person, wandering a little as grass does, with side shoots
  // 0.33.2: one kind of branch: woody and thick at the parent's end, turning into a thin green stalk at the child's end.
  // Husband and wife are joined side by side by a short straight stalk.
  R.edges.forEach(function(e, ei){ var a=e[0].p, b=e[1].p, len=a.distanceTo(b), pts=[], k=Math.max(4, Math.round(len/1.2)), side=new T.Vector3(-(b.z-a.z),0,b.x-a.x).normalize(), isSp=false, eldA=(e[0].gen||0)>=(e[1].gen||0);
    for(var i=0;i<=k;i++){ var t=i/k, p=a.clone().lerp(b,t), wig=isSp?0:Math.sin(t*Math.PI*(2+rnd(ei)*2)+ei)*0.55*Math.sin(t*Math.PI); p.addScaledVector(side, wig); p.y=0.06+(isSp?0.04:Math.sin(t*Math.PI)*0.12); pts.push(p); }
    var cv=new T.CatmullRomCurve3(pts), seg=Math.max(24, k*8), delay=(e[0].d)*0.9+rnd(ei)*0.2, dur=isSp?0.5:0.9+len*0.05,
      m=isSp?vine(cv, seg, 0.08, 0.08, gradM, 6, [SPC,SPC]):vine(cv, seg, eldA?0.16:0.05, eldA?0.05:0.16, gradM, 6, eldA?[WOOD,STALK]:[STALK,WOOD]);
    sc.add(m); runners.push({m:m, delay:delay, dur:dur});
    // blades and leaves along the runner, each appearing as the runner reaches it
    var nb=Math.round(len*(isSp?2:4.5));
    for(var j=0;j<nb;j++){ var t2=(j+0.5)/nb, p2=cv.getPointAt(t2), bl=new T.Mesh(bladeG, j%5===0?leafM:bladeM);
      if(j%5===0){ bl.geometry=leafG; bl.position.copy(p2).addScaledVector(side,(j%2?1:-1)*0.18); bl.position.y+=0.05; bl.rotation.y=rnd(j+ei)*6; }
      else { bl.position.copy(p2).addScaledVector(side,(rnd(j*3+ei)-0.5)*0.35); bl.rotation.set((rnd(j+1)-0.5)*0.7, rnd(j+2)*6, (rnd(j+3)-0.5)*0.7); }
      bl.userData={at:delay+dur*t2, s:0.6+rnd(j+5)*0.9}; bl.scale.setScalar(0.001); sc.add(bl); blades.push(bl); }
    // a short side shoot or two, curling away
    for(var sh=0; sh<(isSp?0:Math.min(3,Math.floor(len/3))); sh++){ var ts=0.3+0.5*rnd(ei*7+sh), ps=cv.getPointAt(ts), dir=(sh%2?1:-1), sp=[ps.clone()];
      for(var q=1;q<=4;q++){ var pp=ps.clone().addScaledVector(side, dir*q*0.35).add(new T.Vector3((b.x-a.x)/len*q*0.25, 0, (b.z-a.z)/len*q*0.25)); pp.y=0.05; sp.push(pp); }
      var sm=vine(new T.CatmullRomCurve3(sp), 16, 0.05, 0.015, runM, 5); sc.add(sm); runners.push({m:sm, delay:delay+dur*ts, dur:0.6}); }
    e[1].at=delay+dur;
  });
  // husband and wife: a short stalk joins them with a heart between them, then a flower for each person
  // 0.33.4: no straight bar between husband and wife: the branch reaches the couple and splits naturally into a twig to each of them,
  // with a small heart over the fork
  R.units.forEach(function(u, ui){ if(u.nodes.length<2) return; var at=u.at||(u.me?0.2:0.5), J=u.p.clone().setY(0.08), out=u.me?new T.Vector3(0,0,1):new T.Vector3(Math.cos(u.a),0,Math.sin(u.a));
    u.nodes.forEach(function(m, mi){ var M=m.p.clone().setY(0.07), c1=J.clone().lerp(M,0.5).addScaledVector(out, 0.45+0.15*rnd(ui+mi)); c1.y=0.16;
      var tw=vine(new T.CatmullRomCurve3([J, J.clone().lerp(c1,0.6), c1, M]), 20, 0.11, 0.05, gradM, 6, [0x7a5c30, STALK]); sc.add(tw); runners.push({m:tw, delay:at, dur:0.5}); });
    B.heart(J.clone().addScaledVector(out, 0.35).setY(0.75), 0.48, at+0.4, sc); });
  R.nodes.forEach(function(n){ if(n.me) return; flower(new T.Vector3(n.p.x,0.05,n.p.z), n.g==="f"?0xf28cb4:0x7fb3ef, false, n.u.at||0.5); });
  // wild grass tufts all over the lawn for depth
  var tuftG=new T.ConeGeometry(0.05, 0.4, 3); tuftG.translate(0,0.2,0);
  var tufts=new T.InstancedMesh(tuftG, new T.MeshLambertMaterial({color:0x5a9a3c}), 1400), dm=new T.Object3D();
  for(var u=0;u<1400;u++){ var ra=rnd(u)*Math.PI*2, rd=Math.sqrt(rnd(u+1))*(maxR*1.8+8); dm.position.set(Math.cos(ra)*rd, 0, Math.sin(ra)*rd); dm.rotation.set((rnd(u+2)-0.5)*0.5, rnd(u+3)*6, (rnd(u+4)-0.5)*0.5); dm.scale.setScalar(0.6+rnd(u+5)*0.9); dm.updateMatrix(); tufts.setMatrixAt(u, dm.matrix); }
  sc.add(tufts);
  // names float just above each flower; mine sits above the centre
  R.nodes.forEach(function(n){ B.addName(n, new T.Vector3(n.p.x, (n.me?2.1:1.3)+(n.u.nodes.indexOf(n)%2?0.6:0), n.p.z), n.me?1.1:0.85, false); });
  var bees=[]; for(var bi=0;bi<8;bi++){ var be=new T.Mesh(new T.SphereGeometry(0.07,6,4), new T.MeshBasicMaterial({color:0xffe066})); be.userData={a:rnd(bi)*6, r:2+rnd(bi+1)*maxR*0.8, s:0.25+rnd(bi+2)*0.4}; sc.add(be); bees.push(be); }
  function frame(){ raf=requestAnimationFrame(frame); var t=(performance.now()-t0)/1000, o=B.orb;
    if(!o.auto && Date.now()-o.last>6000) o.auto=true; if(o.auto){ o.th+=0.0016; B.place(); }
    runners.forEach(function(r){ grow(r.m, ease((t-r.delay)/r.dur)); });
    blades.forEach(function(b){ var k=ease((t-b.userData.at)/0.5); b.scale.setScalar(Math.max(0.001,k*b.userData.s)); });
    flowers.forEach(function(f){ var k=ease((t-f.userData.delay)/0.6); f.scale.setScalar(Math.max(0.01,k)); f.rotation.y=Math.sin(t*0.8+f.position.x)*0.15; });
    B.beat(t);
    B.sprites.forEach(function(s){ s.position.y=s.userData.y0+Math.sin(t*0.9+s.userData.ph)*0.08; s.material.opacity=Math.min(1, Math.max(0, (t-(s.userData.n.d*0.9+0.6))/0.6)); });
    bees.forEach(function(m){ var u=m.userData; m.position.set(Math.cos(t*u.s+u.a)*u.r, 0.8+Math.sin(t*2.3+u.a)*0.3, Math.sin(t*u.s*1.3+u.a)*u.r); });
    B.rn.render(sc,B.cam); }
  frame();
  return B;
}

// ================= BOLT: lightning veins in a floating cloud =================
function buildBolt(box, R, opt){
  var STEP=3.6, maxR=Math.max(1,R.depth)*STEP+2;
  var B=base(box, {tgt:new T.Vector3(0,0,0), th:0.3, ph:1.3, d:Math.max(12, maxR*1.75), min:0.15, max:2.95, onPick:opt.onPick, onSel:opt.onSel}), sc=B.sc;
  sc.background=canvasTex(2,256,function(g){ var gr=g.createLinearGradient(0,0,0,256); gr.addColorStop(0,"#5aa6ea"); gr.addColorStop(0.55,"#9fd0f5"); gr.addColorStop(1,"#e4f3fc"); g.fillStyle=gr; g.fillRect(0,0,2,256); });
  sc.fog=new T.FogExp2(0xcfe6f7, 0.008);
  // 0.33.1: a bright day: blue sky, a warm sun and soft white clouds (Farah: no dark cloud)
  var sunT=canvasTex(256,256,function(g){ var gr=g.createRadialGradient(128,128,0,128,128,128); gr.addColorStop(0,"rgba(255,255,240,1)"); gr.addColorStop(0.18,"rgba(255,246,200,1)"); gr.addColorStop(0.32,"rgba(255,230,150,.55)"); gr.addColorStop(1,"rgba(255,220,140,0)"); g.fillStyle=gr; g.fillRect(0,0,256,256); });
  var sunS=new T.Sprite(new T.SpriteMaterial({map:sunT, transparent:true, depthWrite:false, fog:false})); sunS.position.set(-45,28,-95); sunS.scale.set(40,40,1); sc.add(sunS);
  sc.add(new T.HemisphereLight(0xffffff, 0xbcd6ee, 1.0)); var sunL=new T.DirectionalLight(0xfff1c8, 1.2); sunL.position.copy(sunS.position); sc.add(sunL);
  // positions: each person in a direction of their own around me; the angle comes from the radial layout, the height swings up or down
  // parents and elders rise above me, children and grandchildren hang below, my own generation spreads around the middle
  R.units.forEach(function(n, i){ if(n.me){ n.c=new T.Vector3(); return; } var el=Math.max(-1.15, Math.min(1.15, n.gen*0.5+(rnd(i*3.1+n.a)-0.5)*0.35)), r=n.d*STEP*(n.loose?0.8:1);
    n.c=new T.Vector3(Math.cos(n.a)*Math.cos(el)*r, Math.sin(el)*r, Math.sin(n.a)*Math.cos(el)*r); });
  placeUnits(R, 1.8);
  var world=new T.Group(); sc.add(world);
  // the cloud: many soft puffs in a flattened ball around the family, slowly turning, the whole cloud floating up and down
  var puffT=canvasTex(128,128,function(g){ var gr=g.createRadialGradient(64,64,4,64,64,62); gr.addColorStop(0,"rgba(255,255,255,.95)"); gr.addColorStop(0.5,"rgba(255,255,255,.45)"); gr.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=gr; g.fillRect(0,0,128,128); });
  var puffs=[], cloud=new T.Group(); world.add(cloud);
  for(var c=0;c<110;c++){ var ct=rnd(c)*Math.PI*2, cp=Math.acos(2*rnd(c+1)-1), cr=(0.35+0.75*Math.cbrt(rnd(c+2)))*(maxR+2), m=new T.Sprite(new T.SpriteMaterial({map:puffT, color:0xffffff, transparent:true, opacity:0.32, depthWrite:false}));
    m.position.set(cr*Math.sin(cp)*Math.cos(ct), cr*Math.cos(cp)*0.62, cr*Math.sin(cp)*Math.sin(ct)); var sz=5+rnd(c+3)*7; m.scale.set(sz,sz,1); m.userData={o:0.16+rnd(c+4)*0.14, sp:(rnd(c+5)-0.5)*0.002}; cloud.add(m); puffs.push(m); }
  // the origin: me, a glowing core
  var glowT=canvasTex(128,128,function(g){ var gr=g.createRadialGradient(64,64,0,64,64,64); gr.addColorStop(0,"rgba(255,255,255,1)"); gr.addColorStop(0.25,"rgba(200,230,255,.8)"); gr.addColorStop(1,"rgba(140,190,255,0)"); g.fillStyle=gr; g.fillRect(0,0,128,128); });
  var core=new T.Mesh(new T.SphereGeometry(0.45, 24, 16), new T.MeshBasicMaterial({color:0xe3f2ff})); world.add(core);
  var halo=new T.Sprite(new T.SpriteMaterial({map:glowT, color:0xbfe2ff, transparent:true, depthWrite:false})); halo.scale.set(4.2,4.2,1); world.add(halo);
  var light=new T.PointLight(0xbfe0ff, 0, 60); world.add(light);
  // a jagged vein between two points: midpoint displacement, with small forks that fade out
  // 0.33.1 soft yellow light. Parent branches: thick warm amber. Child branches: thin pale lemon. Spouse: a short smooth rose-gold tie.
  var KC={up:[0xe8901a,0xffb93a,0.09,0.22], down:[0xf5cf1f,0xffe873,0.05,0.14], sp:[0xe5806a,0xffb9a0,0.06,0.05], loose:[0xf2c230,0xffe27a,0.035,0.2], x:[0xf7d24a,0xffe9a0,0.03,0.3]};
  var coreM=new T.MeshBasicMaterial({color:0xfff6c8, transparent:true, depthWrite:false, fog:false}),
      glowM=new T.MeshBasicMaterial({color:0xffcf5a, transparent:true, opacity:0.3, depthWrite:false, fog:false});
  var jag=function(a, b, seed, rough){ var pts=[a.clone(), b.clone()], len=a.distanceTo(b), amp=len*(rough||0.18);
    for(var l=0;l<4;l++){ var np=[pts[0]]; for(var i=1;i<pts.length;i++){ var p0=pts[i-1], p1=pts[i], m=p0.clone().lerp(p1,0.5), s=seed*13+l*7+i;
      m.add(new T.Vector3(rnd(s)-0.5, rnd(s+1)-0.5, rnd(s+2)-0.5).multiplyScalar(amp)); np.push(m, p1); } pts=np; amp*=0.5; }
    return pts; };
  var bolts=[], sparks=[];
  var addVein=function(pts, r, delay, dur, grp, main, kc){ var cv=new T.CatmullRomCurve3(pts, false, "catmullrom", 0.1), seg=pts.length*3;
    var cm=new T.MeshBasicMaterial({vertexColors:true, transparent:true, depthWrite:false, fog:false}), gm=new T.MeshBasicMaterial({vertexColors:true, transparent:true, opacity:0.2, depthWrite:false, fog:false});
    var a=vine(cv, seg, r, r*0.8, cm, 5, kc), b=vine(cv, seg, r*2.4, r*2, gm, 6, kc); grp.add(a); grp.add(b);
    var v={a:a, b:b, delay:delay, dur:dur, fl:0, main:main}; bolts.push(v); return v; };
  var paths={};   // node id -> list of veins from me to that person (for flashes along a whole path)
  // 0.33.2 (Farah): one soft blue line per relation, darker at the parent's end, lighter towards the child; husband and wife side by side on a short straight line
  var DARK=0x1d4aa3, LIGHT=0x6fb6ff, SPB=0x4f86d6;
  R.edges.forEach(function(e, ei){ var isSp=false, eldA=(e[0].gen||0)>=(e[1].gen||0), p0=e[0].p, p1=e[1].p, pts=isSp?[p0.clone(), p0.clone().lerp(p1,0.5), p1.clone()]:jag(p0, p1, ei+1, 0.1), d0=e[0].d*0.55, dur=0.35+p0.distanceTo(p1)*0.03;
    var v=addVein(pts, 0.085, d0, dur, world, true, isSp?[SPB,SPB]:eldA?[DARK,LIGHT]:[LIGHT,DARK]);
    paths[e[1].id]=(paths[e[0].id]||[]).concat([v]);
    // a small spark where it reaches the person
    e[1].at=d0+dur;
  });
  // husband and wife side by side on one short straight line with a heart between them, a soft glow at each person
  R.spl.forEach(function(x){ var u=x[0].u, mid=x[0].p.clone().lerp(x[1].p,0.5); addVein([x[0].p.clone(), mid.clone(), x[1].p.clone()], 0.06, u.at||0.2, 0.25, world, true, [SPB,SPB]); B.heart(mid.clone().add(new T.Vector3(0,0.45,0)), 0.85, (u.at||0.2)+0.25, world); });
  R.nodes.forEach(function(n){ if(n.me) return; var sk=new T.Sprite(new T.SpriteMaterial({map:glowT, color:n.g==="f"?0xd9c4ff:0xbfe0ff, transparent:true, depthWrite:false})); sk.position.copy(n.p); sk.scale.set(1.6,1.6,1); sk.userData={at:n.u.at||0.3}; world.add(sk); sparks.push(sk); });
  R.nodes.forEach(function(n){ var sp2=B.addName(n, n.p.clone().add(new T.Vector3(0, (n.me?1.7:0.8)+(n.u.nodes.indexOf(n)%2?0.55:0), 0)), n.me?1.1:0.85, false); world.remove(sp2); sc.remove(sp2); world.add(sp2); });
  var t0=performance.now(), nextFlash=1.6, flashV=[], flashT=0, ids=Object.keys(paths);
  function frame(){ raf=requestAnimationFrame(frame); var t=(performance.now()-t0)/1000, o=B.orb;
    if(!o.auto && Date.now()-o.last>6000) o.auto=true; if(o.auto){ o.th+=0.0018; B.place(); }
    world.position.y=Math.sin(t*0.5)*0.45; cloud.rotation.y+=0.0006;
    // now and then a flash runs from me out to one relative and lights the cloud
    if(t>nextFlash){ var id=ids.length?ids[Math.floor(rnd(t*3.7)*ids.length)]:null; flashV=id?paths[id]:bolts.slice(-3); flashT=t; nextFlash=t+1.6+rnd(t)*2.8; }
    var fk=Math.max(0, 1-(t-flashT)/0.9), flick=fk*fk*0.8;   // a soft swell of light, no strobe
    bolts.forEach(function(v){ var k=ease((t-v.delay)/v.dur); grow(v.a,k); grow(v.b,k); var lit=flashV.indexOf(v)>=0?flick:0, base0=0.95, wob=0.85+0.15*Math.sin(t*7+v.delay*13);
      v.a.material.opacity=Math.min(1,(base0*wob)+lit); v.b.material.opacity=Math.min(0.6,0.2*wob+lit*0.4); });
    light.intensity=fk*35; halo.scale.setScalar(4.2+Math.sin(t*3)*0.25+fk*1.5);
    puffs.forEach(function(p){ p.material.opacity=p.userData.o+fk*0.35; p.material.color.setHex(fk>0.2?0xfff6dc:0xffffff); p.material.rotation+=p.userData.sp; });
    sparks.forEach(function(s){ var k=ease((t-s.userData.at)/0.3); s.material.opacity=k*(0.7+0.3*Math.sin(t*4+s.position.x)); });
    B.beat(t);
    B.sprites.forEach(function(s){ s.material.opacity=Math.min(1, Math.max(0, (t-(s.userData.n.d*0.55+0.4))/0.5)); });
    B.rn.render(sc,B.cam); }
  frame();
  return B;
}
function stop(){ if(raf) cancelAnimationFrame(raf); raf=0; if(st){ try{ st.sc.traverse(function(o){ if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } }); st.rn.dispose(); st.rn.forceContextLoss&&st.rn.forceContextLoss(); }catch(e){} st=null; } }
function mount(box, data, opt){ T=window.THREE; stop(); var R=radial(data); st=(opt.style==="bolt"?buildBolt:buildGrass)(box, R, opt); st.R=R; }
window.FamWeb3D={ mount:function(box, data, opt){ mount(box, data, opt||{}); }, stop:stop,
  highlight:function(id){ if(st && st.highlight) st.highlight(id); },
  focus:function(id){ if(!st || !st.R) return; var n=st.R.byId[id]; if(!n || !n.p) return; st.tgt.copy(n.p); st.orb.d=Math.min(st.orb.d, 12); st.orb.auto=false; st.orb.last=Date.now(); st.place(); },
  resize:function(){ if(st) setTimeout(function(){ var w=st.box.clientWidth, h=st.box.clientHeight; st.rn.setSize(w,h); st.cam.aspect=w/h; st.cam.updateProjectionMatrix(); },50); } };
})();
