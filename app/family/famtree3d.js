/* My Ihsan 0.23.0: Salasilah 3D. A wooden family tree with leaves in a quiet garden (three.js r159, hajj/three.min.js).
   Generations rise up the tree (eldest lowest), names are sprites that always face the camera, the tree grows with each person
   and new branches grow in over a second. Drag to orbit, pinch or wheel to zoom, tap a name to open it. */
(function(){
"use strict";
var T, R=null, raf=0, st=null;
function rnd(s){ var x=Math.sin(s*12.9898)*43758.5453; return x-Math.floor(x); }
// ---------- procedural textures ----------
function woodTex(){
  var c=document.createElement("canvas"); c.width=128; c.height=256; var g=c.getContext("2d");
  var gr=g.createLinearGradient(0,0,128,0); gr.addColorStop(0,"#4a2f1b"); gr.addColorStop(0.5,"#6d4628"); gr.addColorStop(1,"#4a2f1b"); g.fillStyle=gr; g.fillRect(0,0,128,256);
  for(var i=0;i<70;i++){ var x=rnd(i)*128, w=0.6+rnd(i+3)*2.2; g.strokeStyle="rgba("+(30+rnd(i+1)*40|0)+","+(18+rnd(i+2)*25|0)+",10,"+(0.25+rnd(i+4)*0.4)+")"; g.lineWidth=w; g.beginPath(); g.moveTo(x,0);
    for(var y=0;y<=256;y+=16) g.lineTo(x+Math.sin(y*0.05+i)*3*rnd(i+5),y); g.stroke(); }
  for(var k=0;k<6;k++){ var kx=rnd(k+40)*128, ky=rnd(k+50)*256; g.strokeStyle="rgba(35,20,10,.5)"; g.lineWidth=1.5; g.beginPath(); g.ellipse(kx,ky,4+rnd(k)*4,8+rnd(k+1)*6,0,0,Math.PI*2); g.stroke(); }
  var t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.colorSpace=T.SRGBColorSpace; return t;
}
function grassTex(){
  var c=document.createElement("canvas"); c.width=c.height=256; var g=c.getContext("2d"); g.fillStyle="#4f8a3a"; g.fillRect(0,0,256,256);
  for(var i=0;i<2600;i++){ var x=rnd(i)*256, y=rnd(i+7)*256, l=40+rnd(i+9)*40; g.fillStyle="hsl("+(88+rnd(i+11)*30)+",45%,"+(l*0.6)+"%)"; g.fillRect(x,y,1.2,3+rnd(i+13)*4); }
  var t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(14,14); t.colorSpace=T.SRGBColorSpace; return t;
}
function leafTex(){
  var c=document.createElement("canvas"); c.width=c.height=64; var g=c.getContext("2d");
  g.fillStyle="#3f9a46"; g.beginPath(); g.moveTo(32,2); g.quadraticCurveTo(62,30,32,62); g.quadraticCurveTo(2,30,32,2); g.fill();
  g.strokeStyle="rgba(20,70,25,.7)"; g.lineWidth=2; g.beginPath(); g.moveTo(32,6); g.lineTo(32,58); g.stroke();
  var t=new T.CanvasTexture(c); t.colorSpace=T.SRGBColorSpace; return t;
}
function nameTex(n, sub, me, dead){
  var c=document.createElement("canvas"), g=c.getContext("2d"), f=34; g.font="700 "+f+"px system-ui,sans-serif";
  var w=Math.max(g.measureText(n).width, 80)+44; c.width=Math.min(560, Math.ceil(w)); c.height=sub?104:74; g.font="700 "+f+"px system-ui,sans-serif";
  var r=26; g.fillStyle=me?"rgba(201,166,70,.95)":dead?"rgba(70,70,70,.85)":"rgba(255,253,245,.92)"; g.beginPath(); g.moveTo(r,2); g.arcTo(c.width-2,2,c.width-2,c.height-2,r); g.arcTo(c.width-2,c.height-2,2,c.height-2,r); g.arcTo(2,c.height-2,2,2,r); g.arcTo(2,2,c.width-2,2,r); g.fill();
  g.strokeStyle="rgba(90,60,30,.6)"; g.lineWidth=3; g.stroke();
  g.fillStyle=me?"#1d1405":dead?"#eee":"#2b1d10"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(n.length>22?n.slice(0,21)+"…":n, c.width/2, sub?38:c.height/2+1);
  if(sub){ g.font="500 22px system-ui,sans-serif"; g.fillStyle=me?"#3a2a08":dead?"#ccc":"#6b5537"; g.fillText(sub, c.width/2, 76); }
  var t=new T.CanvasTexture(c); t.colorSpace=T.SRGBColorSpace; t.anisotropy=4; return {t:t, a:c.width/c.height};
}
// ---------- scene ----------
function build(box, data, opt){
  T=window.THREE; stop();
  var W=box.clientWidth||360, Hh=box.clientHeight||360;
  var rn=new T.WebGLRenderer({antialias:true, alpha:false}); rn.domElement.dataset.ib3d="own"; rn.setPixelRatio(Math.min(2, window.devicePixelRatio||1)); rn.setSize(W,Hh); rn.outputColorSpace=T.SRGBColorSpace; rn.shadowMap.enabled=true;
  box.innerHTML=""; box.appendChild(rn.domElement);
  var sc=new T.Scene(), cam=new T.PerspectiveCamera(48, W/Hh, 0.1, 400);
  // sky: soft dawn gradient
  var sk=document.createElement("canvas"); sk.width=2; sk.height=256; var sg=sk.getContext("2d"), gg=sg.createLinearGradient(0,0,0,256); gg.addColorStop(0,"#8fc4ef"); gg.addColorStop(0.6,"#d9ecf7"); gg.addColorStop(1,"#f6efd8"); sg.fillStyle=gg; sg.fillRect(0,0,2,256);
  var skt=new T.CanvasTexture(sk); skt.colorSpace=T.SRGBColorSpace; sc.background=skt; sc.fog=new T.Fog(0xe6eff2, 38, 110);
  sc.add(new T.HemisphereLight(0xf4f8ff, 0x5c7a3a, 1.05));
  var sun=new T.DirectionalLight(0xfff3d6, 1.5); sun.position.set(14,26,12); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); var sca=sun.shadow.camera; sca.left=-30; sca.right=30; sca.top=30; sca.bottom=-30; sc.add(sun);
  // garden: lawn, stone path, low hedges, flower beds, a few round shrubs, a small pond
  var lawn=new T.Mesh(new T.CircleGeometry(90,64), new T.MeshLambertMaterial({map:grassTex()})); lawn.rotation.x=-Math.PI/2; lawn.receiveShadow=true; sc.add(lawn);
  var stone=new T.MeshLambertMaterial({color:0xe9e1cf});
  for(var i=0;i<12;i++){ var sp=new T.Mesh(new T.CylinderGeometry(0.9,0.95,0.12,18), stone); sp.position.set(Math.sin(i*0.35)*0.6, 0.06, 6+i*2.1); sp.receiveShadow=true; sc.add(sp); }
  var hedgeM=new T.MeshLambertMaterial({color:0x2f6b2d});
  [[-14,0,1],[14,0,1],[0,-14,0],[0,16,0]].forEach(function(h){ var hb=new T.Mesh(new T.BoxGeometry(h[2]?1.4:22,1.3,h[2]?22:1.4), hedgeM); hb.position.set(h[0],0.65,h[1]); hb.castShadow=true; if(h[1]===16){ hb.scale.x=0.35; hb.position.x=-7.5; var hb2=hb.clone(); hb2.position.x=7.5; sc.add(hb2); } sc.add(hb); });
  var fl=[0xf2c14e,0xe86a92,0xffffff,0xb388eb,0xff8c42], petal=new T.SphereGeometry(0.16,8,6), stem=new T.MeshLambertMaterial({color:0x3d7a2c});
  for(var f=0;f<180;f++){ var side=f%2?1:-1, fx=side*(10+rnd(f)*3.2), fz=-12+rnd(f+1)*24, m=new T.Mesh(petal, new T.MeshLambertMaterial({color:fl[f%fl.length]})); m.position.set(fx,0.35+rnd(f+2)*0.2,fz); sc.add(m);
    if(f%3===0){ var s2=new T.Mesh(new T.CylinderGeometry(0.03,0.03,0.35,4), stem); s2.position.set(fx,0.17,fz); sc.add(s2); } }
  for(var b=0;b<8;b++){ var a=b/8*Math.PI*2+0.3, sh=new T.Mesh(new T.SphereGeometry(1.1+rnd(b)*0.5,14,10), new T.MeshLambertMaterial({color:0x3c7d36})); sh.position.set(Math.cos(a)*22, 0.9, Math.sin(a)*22); sh.castShadow=true; sc.add(sh); }
  var pond=new T.Mesh(new T.CircleGeometry(3.2,40), new T.MeshPhongMaterial({color:0x7fb8d6, shininess:90, transparent:true, opacity:0.85})); pond.rotation.x=-Math.PI/2; pond.position.set(-8,0.03,9); sc.add(pond);
  var rim=new T.Mesh(new T.TorusGeometry(3.25,0.18,8,40), stone); rim.rotation.x=Math.PI/2; rim.position.set(-8,0.08,9); sc.add(rim);
  // ---------- the tree ----------
  var nodes=data.nodes, links=data.links, N=nodes.length, byId={};
  var gens=nodes.map(function(n){ return n.gen; }), g0=N?Math.min.apply(null,gens):0, g1=N?Math.max.apply(null,gens):0;
  var grow=Math.min(1.6, 0.8+N*0.04), LH=3.2, base=5.2+grow*1.6, sx=1.25;
  nodes.forEach(function(n){ n.p=new T.Vector3(n.x*sx, base+(n.gen-g0)*LH, n.z); byId[n.id]=n; });
  // centre the tree on the trunk: the oldest generation sits above the middle of the garden
  var old0=nodes.filter(function(n){ return n.gen===g0; }), ox=old0.length?old0.reduce(function(a,n){ return a+n.p.x; },0)/old0.length:0; nodes.forEach(function(n){ n.p.x-=ox; });
  var wood=new T.MeshLambertMaterial({map:woodTex()}), leafM=new T.MeshLambertMaterial({map:leafTex(), side:T.DoubleSide, alphaTest:0.5});
  var tree=new T.Group(); sc.add(tree);
  var cx=N?nodes.reduce(function(a,n){ return a+n.p.x; },0)/N:0, rootY=base-2.4;
  var oldest=nodes.filter(function(n){ return n.gen===g0; });
  var trunkTop=new T.Vector3(oldest.length?oldest.reduce(function(a,n){ return a+n.p.x; },0)/oldest.length:0, rootY, 0);
  var trunkR=0.32+grow*0.18;
  var tube=function(pts, r0, r1, grp){ var cv=new T.CatmullRomCurve3(pts), seg=Math.max(8, pts.length*6), g=new T.TubeGeometry(cv, seg, 1, 10, false);
    // taper the tube from r0 to r1
    var pos=g.attributes.position, tmp=new T.Vector3(), rings=seg+1, per=11;
    for(var i=0;i<rings;i++){ var t=i/seg, c=cv.getPointAt(t), r=r0+(r1-r0)*t; for(var j=0;j<per;j++){ var k=i*per+j; tmp.fromBufferAttribute(pos,k).sub(c).multiplyScalar(r).add(c); pos.setXYZ(k,tmp.x,tmp.y,tmp.z); } }
    pos.needsUpdate=true; g.computeVertexNormals(); var m=new T.Mesh(g, wood); m.castShadow=true; (grp||tree).add(m); return m; };
  // trunk with a slight lean and visible roots
  tube([new T.Vector3(0,0,0), new T.Vector3(0.15,rootY*0.45,0.1), trunkTop], trunkR*1.25, trunkR*0.8);
  for(var rt=0;rt<5;rt++){ var ra=rt/5*Math.PI*2+0.4; tube([new T.Vector3(0,0.5,0), new T.Vector3(Math.cos(ra)*1.2,0.15,Math.sin(ra)*1.2), new T.Vector3(Math.cos(ra)*2.4,-0.05,Math.sin(ra)*2.4)], trunkR*0.55, 0.06); }
  var leafG=new T.PlaneGeometry(0.55,0.55), leaves=[];
  var addLeaves=function(p, n, spread, grp, seed){ for(var i=0;i<n;i++){ var l=new T.Mesh(leafG, leafM), s=seed*31+i;
    l.position.set(p.x+(rnd(s)-0.5)*spread, p.y+(rnd(s+1)-0.3)*spread*0.7, p.z+(rnd(s+2)-0.5)*spread); l.rotation.set(rnd(s+3)*3, rnd(s+4)*3, rnd(s+5)*3); l.scale.setScalar(0.7+rnd(s+6)*0.7); (grp||tree).add(l); leaves.push(l); } };
  var newest=nodes.reduce(function(a,n){ return Math.max(a,n.t||0); },0), born=Date.now();
  var growers=[];
  var linkGrp=function(n){ var g=new T.Group(); tree.add(g); if(n && n.t && n.t===newest && Date.now()-n.t<15000){ g.scale.setScalar(0.01); growers.push(g); } return g; };
  // oldest generation hangs from the trunk top
  oldest.forEach(function(n,i){ var g=linkGrp(n), mid=trunkTop.clone().lerp(n.p,0.4); mid.y=trunkTop.y+1.3; var end=n.p.clone().add(new T.Vector3(0,-0.5,0)); tube([trunkTop.clone().add(new T.Vector3(0,-0.4,0)), mid, end], trunkR*0.62, 0.11, g); addLeaves(mid.clone().lerp(end,0.5), 12, 1.8, g, i+3); });
  links.forEach(function(L,li){ var b=byId[L.b]; if(!b) return;
    if(L.t==="sp"){ var a=byId[L.a[0]]; if(!a) return; var g=linkGrp(a.t>b.t?a:b), m=a.p.clone().lerp(b.p,0.5); m.y-=0.55; tube([a.p.clone().add(new T.Vector3(0,-0.45,0)), m, b.p.clone().add(new T.Vector3(0,-0.45,0))], 0.14, 0.14, g); addLeaves(m, 4, 1.2, g, li+50); return; }
    var ps=L.a.map(function(id){ return byId[id]; }).filter(Boolean); if(!ps.length) return;
    var from=ps.reduce(function(acc,p){ return acc.add(p.p); }, new T.Vector3()).multiplyScalar(1/ps.length); from.y-=0.5;
    var g2=linkGrp(b), c1=from.clone(); c1.y+=LH*0.45; var c2=b.p.clone(); c2.y-=LH*0.35;
    tube([from, c1, c2, b.p.clone().add(new T.Vector3(0,-0.5,0))], 0.17, 0.09, g2); addLeaves(c1.clone().lerp(c2,0.5), 12, 1.7, g2, li+90);
  });
  // a crown of leaves above the youngest generation
  nodes.filter(function(n){ return n.gen===g1; }).forEach(function(n,i){ addLeaves(n.p.clone().add(new T.Vector3(0,1.2,0)), 22, 2.2, null, i+200); });
  // name sprites
  var sprites=[];
  nodes.forEach(function(n){ var nt=nameTex(n.n, n.sub||"", n.me, n.dead), sp=new T.Sprite(new T.SpriteMaterial({map:nt.t, depthTest:true, transparent:true})); var h=0.78; sp.scale.set(h*nt.a, h, 1); sp.position.copy(n.p); sp.userData.id=n.id; sp.userData.y0=n.p.y; sp.userData.ph=rnd(n.p.x*7+n.gen)*6; sc.add(sp); sprites.push(sp);
    var dot=new T.Mesh(new T.SphereGeometry(0.14,10,8), new T.MeshLambertMaterial({color:n.g==="f"?0xe58fb0:0x6aa6e0})); dot.position.copy(n.p).add(new T.Vector3(0,-0.5,0)); sc.add(dot); });
  // butterflies of light: a few floating motes around the tree
  var motes=[]; for(var mo=0;mo<14;mo++){ var mm=new T.Mesh(new T.SphereGeometry(0.06,6,4), new T.MeshBasicMaterial({color:0xfff2b0})); mm.userData={a:rnd(mo)*6, r:3+rnd(mo+1)*6, y:base+rnd(mo+2)*(g1-g0+1)*LH, s:0.2+rnd(mo+3)*0.4}; sc.add(mm); motes.push(mm); }
  // ---------- camera orbit ----------
  var top=base+(g1-g0)*LH, height=top+1.5, span=N?Math.max(8, (Math.max.apply(null,nodes.map(function(n){ return n.p.x; }))-Math.min.apply(null,nodes.map(function(n){ return n.p.x; })))*1.1):8;
  var tgt=new T.Vector3(cx*0.6, height*0.5, 0), o={th:0.25, ph:1.25, d:Math.max(14, Math.max(span, height)*1.25), auto:true, last:Date.now()};
  var place=function(){ cam.position.set(tgt.x+o.d*Math.sin(o.ph)*Math.sin(o.th), tgt.y+o.d*Math.cos(o.ph), tgt.z+o.d*Math.sin(o.ph)*Math.cos(o.th)); cam.lookAt(tgt); };
  place();
  var el=rn.domElement, pts={}, moved=0, pinch0=0, d0=0;
  var down=function(e){ el.setPointerCapture&&el.setPointerCapture(e.pointerId); pts[e.pointerId]={x:e.clientX,y:e.clientY}; moved=0; o.auto=false; o.last=Date.now(); var k=Object.keys(pts); if(k.length===2){ var a=pts[k[0]], b2=pts[k[1]]; pinch0=Math.hypot(a.x-b2.x,a.y-b2.y); d0=o.d; } };
  var mv=function(e){ var p=pts[e.pointerId]; if(!p) return; var k=Object.keys(pts);
    if(k.length===2){ p.x=e.clientX; p.y=e.clientY; var a=pts[k[0]], b2=pts[k[1]], d=Math.hypot(a.x-b2.x,a.y-b2.y); if(pinch0) o.d=Math.max(5, Math.min(90, d0*pinch0/d)); moved+=5; }
    else { var dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY; moved+=Math.abs(dx)+Math.abs(dy); o.th-=dx*0.008; o.ph=Math.max(0.35, Math.min(1.52, o.ph-dy*0.006)); }
    place(); e.preventDefault(); };
  var up=function(e){ var p=pts[e.pointerId]; delete pts[e.pointerId]; o.last=Date.now(); if(p && moved<8 && !Object.keys(pts).length) pick(e); };
  var wheel=function(e){ o.d=Math.max(5, Math.min(90, o.d*(e.deltaY>0?1.1:0.9))); place(); o.auto=false; o.last=Date.now(); e.preventDefault(); };
  el.style.touchAction="none"; el.addEventListener("pointerdown",down); el.addEventListener("pointermove",mv); el.addEventListener("pointerup",up); el.addEventListener("pointercancel",up); el.addEventListener("wheel",wheel,{passive:false});
  var ray=new T.Raycaster();
  function pick(e){ var r=el.getBoundingClientRect(), v=new T.Vector2(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1); ray.setFromCamera(v,cam); var hit=ray.intersectObjects(sprites)[0]; if(hit && opt.onPick) opt.onPick(hit.object.userData.id); }
  // ---------- loop ----------
  var t0=performance.now();
  function frame(){ raf=requestAnimationFrame(frame); var t=(performance.now()-t0)/1000;
    if(!o.auto && Date.now()-o.last>6000) o.auto=true; if(o.auto){ o.th+=0.0018; place(); }
    sprites.forEach(function(s){ s.position.y=s.userData.y0+Math.sin(t*0.9+s.userData.ph)*0.12; });
    leaves.forEach(function(l,i){ if(i%3===0) l.rotation.z+=Math.sin(t*1.3+i)*0.002; });
    motes.forEach(function(m){ var u=m.userData; m.position.set(tgt.x+Math.cos(t*u.s+u.a)*u.r, u.y+Math.sin(t*u.s*1.7+u.a)*0.6, Math.sin(t*u.s+u.a)*u.r); });
    growers.forEach(function(g){ var k=Math.min(1,(Date.now()-born)/1100); g.scale.setScalar(0.01+0.99*(1-Math.pow(1-k,3))); });
    rn.render(sc,cam); }
  frame();
  st={rn:rn, cam:cam, box:box, sc:sc, focus:function(id){ var n=byId[id]; if(!n) return; tgt.copy(n.p); o.d=Math.min(o.d,14); o.auto=false; o.last=Date.now(); place(); },
    resize:function(){ var w=box.clientWidth, h=box.clientHeight; rn.setSize(w,h); cam.aspect=w/h; cam.updateProjectionMatrix(); }};
}
function stop(){ if(raf) cancelAnimationFrame(raf); raf=0; if(st){ try{ st.sc.traverse(function(o){ if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } }); st.rn.dispose(); st.rn.forceContextLoss&&st.rn.forceContextLoss(); }catch(e){} st=null; } }
window.FamTree3D={ mount:function(box, data, opt){ build(box, data, opt||{}); }, stop:stop, focus:function(id){ if(st) st.focus(id); }, resize:function(){ if(st) setTimeout(st.resize,50); } };
})();
