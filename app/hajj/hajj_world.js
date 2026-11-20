/* Hajj & Umrah 3D world: stylised, not to scale. Built from Three.js primitives only (no model or image files).
   North is -z, east is +x. The Kaabah is at the origin, rotated so its corners point to the four directions:
   Hajar Aswad = east (+x), Iraqi = north, Shami = west, Yamani = south. Tawaf runs counter-clockwise seen from above. */
window.HJWorld = (function(){
  var T = THREE;
  function rnd(seed){ var s=seed>>>0; return function(){ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
  function col(h){ return new T.Color(h); }
  function lam(c, o){ var m=new T.MeshLambertMaterial(Object.assign({color:c}, o||{})); return m; }

  // ---------- times of day ----------
  var TOD = {
    day:   {top:"#4f9fe0", hor:"#d4ecf3", bot:"#e6d3ad", sun:"#fff1d6", si:2.6, hs:"#d6ecff", hg:"#c9a777", hi:1.5, dir:[0.45,1,0.35], night:0, fog:"#d9e9ee"},
    noon:  {top:"#3e95dc", hor:"#f2e7c7", bot:"#ecd4a4", sun:"#fff6e0", si:3.0, hs:"#e6f2ff", hg:"#d8b47c", hi:1.6, dir:[0.15,1,0.2], night:0, fog:"#efe4c6"},
    eve:   {top:"#3a5ea0", hor:"#f6bd84", bot:"#a9865f", sun:"#ffc690", si:2.0, hs:"#ffe2c4", hg:"#b49272", hi:1.45, dir:[-0.8,0.35,0.4], night:0.25, fog:"#e6a272"},
    dawn:  {top:"#22376a", hor:"#eda58c", bot:"#5b4a4a", sun:"#ffc2a0", si:1.4, hs:"#b9b4d8", hg:"#5c4a46", hi:1.0, dir:[0.9,0.3,-0.3], night:0.55, fog:"#9a8796"},
    night: {top:"#050a1e", hor:"#1b2a4c", bot:"#0a0e19", sun:"#a9bcff", si:0.6, hs:"#6f86c8", hg:"#5a4a38", hi:0.85, dir:[-0.3,1,0.5], night:1, fog:"#18223c"}
  };

  var W = {};
  W.TOD = TOD;

  W.init = function(canvas, opts){
    opts=opts||{};
    var renderer;
    try{ renderer = new T.WebGLRenderer({canvas:canvas, antialias:true, powerPreference:"high-performance"}); }catch(e){ return null; }
    if(!renderer.getContext()) return null;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, opts.lowGfx?1:1.6));
    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(50, 1, 0.3, 1400);
    camera.position.set(40,40,60);
    W.renderer=renderer; W.scene=scene; W.camera=camera;
    scene.fog = new T.Fog(0xd9e9ee, 160, 700);
    W.colliders=[]; W.boxes=[]; W.labels=[]; W.anim=[]; W.nightMats=[]; W.npcs=[];
    buildSky(); buildLights(); buildGround(); buildRoads();
    buildHaram(); buildMasa(); buildCity(); buildMina(); buildMuzdalifah(); buildArafah();
    buildMadinah(); buildMiqat(); buildMountains(); buildCrowd();
    W.setTod("day");
    return W;
  };

  // ---------- sky, lights ----------
  var skyMat, hemi, sun, stars, sunSprite;
  function buildSky(){
    skyMat = new T.ShaderMaterial({ side:T.BackSide, depthWrite:false, fog:false,
      uniforms:{ top:{value:col("#4f9fe0")}, hor:{value:col("#d4ecf3")}, bot:{value:col("#e6d3ad")} },
      vertexShader:"varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader:"uniform vec3 top; uniform vec3 hor; uniform vec3 bot; varying vec3 vP; void main(){ float h=vP.y; vec3 c = h>0.0 ? mix(hor, top, pow(min(h*1.6,1.0),0.7)) : mix(hor, bot, min(-h*4.0,1.0)); gl_FragColor=vec4(c,1.0); \n#include <colorspace_fragment>\n }" });
    var sky = new T.Mesh(new T.SphereGeometry(1200, 24, 16), skyMat); sky.renderOrder=-1; W.scene.add(sky); W.sky=sky;
    var n=900, pos=new Float32Array(n*3), r=rnd(7);
    for(var i=0;i<n;i++){ var th=r()*Math.PI*2, ph=Math.acos(0.05+r()*0.95), R=1100; pos[i*3]=R*Math.sin(ph)*Math.cos(th); pos[i*3+1]=R*Math.cos(ph); pos[i*3+2]=R*Math.sin(ph)*Math.sin(th); }
    var g=new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(pos,3));
    stars = new T.Points(g, new T.PointsMaterial({color:0xffffff, size:2.2, sizeAttenuation:false, transparent:true, opacity:0, fog:false, depthWrite:false}));
    W.scene.add(stars);
    var cv=document.createElement("canvas"); cv.width=cv.height=128; var c=cv.getContext("2d");
    var gr=c.createRadialGradient(64,64,6,64,64,64); gr.addColorStop(0,"rgba(255,255,255,1)"); gr.addColorStop(0.25,"rgba(255,245,220,0.9)"); gr.addColorStop(1,"rgba(255,230,180,0)");
    c.fillStyle=gr; c.fillRect(0,0,128,128);
    sunSprite = new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(cv), fog:false, depthWrite:false, transparent:true}));
    sunSprite.scale.set(140,140,1); W.scene.add(sunSprite);
  }
  function buildLights(){
    hemi = new T.HemisphereLight(0xd6ecff, 0xc9a777, 1.5); W.scene.add(hemi);
    sun = new T.DirectionalLight(0xfff1d6, 2.6); sun.position.set(45,100,35); W.scene.add(sun);
  }
  var curTod=null;
  function lerpTod(a,b,t){ var o={}; ["top","hor","bot","sun","hs","hg","fog"].forEach(function(k){ o[k]=col(a[k]).lerp(col(b[k]),t); });
    ["si","hi","night"].forEach(function(k){ o[k]=a[k]+(b[k]-a[k])*t; }); o.dir=[0,1,2].map(function(i){ return a.dir[i]+(b.dir[i]-a.dir[i])*t; }); return o; }
  W.setTod = function(name, t, from){
    var p = (from && t<1) ? lerpTod(TOD[from], TOD[name], t) : lerpTod(TOD[name], TOD[name], 0);
    skyMat.uniforms.top.value.copy(p.top); skyMat.uniforms.hor.value.copy(p.hor); skyMat.uniforms.bot.value.copy(p.bot);
    W.scene.fog.color.copy(p.fog); sun.color.copy(p.sun); sun.intensity=p.si; hemi.color.copy(p.hs); hemi.groundColor.copy(p.hg); hemi.intensity=p.hi;
    var d=new T.Vector3(p.dir[0],p.dir[1],p.dir[2]).normalize(); sun.position.copy(d).multiplyScalar(100);
    sunSprite.position.copy(d).multiplyScalar(1000); sunSprite.material.color.copy(p.sun); sunSprite.material.opacity = p.night>0.8 ? 0.55 : 1;
    sunSprite.scale.setScalar(p.night>0.8?70:140);
    stars.material.opacity = Math.max(0, p.night-0.3)*1.3;
    W.nightMats.forEach(function(m){ m.emissiveIntensity = p.night*1.2; });
    W.night = p.night; curTod=name;
  };
  W.followSky = function(pos){ W.sky.position.copy(pos); stars.position.copy(pos); };

  // ---------- ground ----------
  var ZONES=[]; // flattened circles
  function zonesInit(){ for(var k in HJ_PLACES){ var p=HJ_PLACES[k]; if(p.zr) ZONES.push([p.p[0],p.p[1],p.zr+14]); } ZONES.push([0,0,60],[46,-4,30],[104,0,40],[84,-34,30],[-30,-345,60]); }
  var ROADS=[[-30,-322,-26,-252],[-26,-226,-26,-104],[-26,-82,-14,-44],[60,0,70,-6],[118,6,134,10],[166,8,172,6]];
  function segDist(x,z,s){ var ax=s[0],az=s[1],bx=s[2],bz=s[3],dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz,t=l?Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l)):0; var px=ax+t*dx-x,pz=az+t*dz-z; return Math.sqrt(px*px+pz*pz); }
  function flatMask(x,z){ var m=1;
    for(var i=0;i<ZONES.length;i++){ var Z=ZONES[i], d=Math.hypot(x-Z[0],z-Z[1]); if(d<Z[2]+30) m=Math.min(m, Math.max(0,(d-Z[2])/30)); }
    for(var j=0;j<ROADS.length;j++){ var d2=segDist(x,z,ROADS[j]); if(d2<22) m=Math.min(m, Math.max(0,(d2-6)/16)); }
    return m; }
  function dune(x,z){ return (Math.sin(x*0.031+Math.sin(z*0.017)*1.4)+Math.sin(z*0.026+x*0.012))*1.6 + Math.sin(x*0.09+z*0.07)*0.45; }
  W.heightAt=function(x,z){ var m=flatMask(x,z); return m<=0?0:(dune(x,z)+3.2)*m*m*(3-2*m)*0.9; };
  function buildGround(){
    zonesInit();
    var S=1100, N=150, g=new T.PlaneGeometry(S,S,N,N); g.rotateX(-Math.PI/2); g.translate(20,0,-60);
    var p=g.attributes.position, cols=new Float32Array(p.count*3), c=new T.Color(), a=col("#e2c58f"), b=col("#d2ab72"), d=col("#c49a63");
    for(var i=0;i<p.count;i++){ var x=p.getX(i), z=p.getZ(i), h=W.heightAt(x,z); p.setY(i,h-0.02);
      var t=0.5+0.5*Math.sin(x*0.05+z*0.04); c.copy(a).lerp(b,t); if(h>2.5) c.lerp(d,Math.min(1,(h-2.5)/3)); cols[i*3]=c.r; cols[i*3+1]=c.g; cols[i*3+2]=c.b; }
    g.setAttribute("color", new T.BufferAttribute(cols,3)); g.computeVertexNormals();
    var m=new T.Mesh(g, new T.MeshLambertMaterial({vertexColors:true, flatShading:true})); W.scene.add(m); W.ground=m;
  }
  function buildRoads(){
    var mat=lam("#8a7a68");
    ROADS.forEach(function(s){ var dx=s[2]-s[0], dz=s[3]-s[1], L=Math.hypot(dx,dz); var r=new T.Mesh(new T.PlaneGeometry(7,L), mat); r.rotation.x=-Math.PI/2; r.rotation.z=-Math.atan2(dx,-dz); r.position.set((s[0]+s[2])/2,0.04,(s[1]+s[3])/2); W.scene.add(r);
      var dm=new T.MeshBasicMaterial({color:0xf3e7c9}); for(var t=6;t<L-4;t+=10){ var d=new T.Mesh(new T.PlaneGeometry(0.4,3.4),dm); d.rotation.copy(r.rotation); d.position.set(s[0]+dx*t/L,0.06,s[1]+dz*t/L); W.scene.add(d); } });
  }

  // ---------- helpers ----------
  function add(m,x,y,z){ m.position.set(x,y,z); W.scene.add(m); return m; }
  function box(w,h,d,c){ return new T.Mesh(new T.BoxGeometry(w,h,d), c.isMaterial?c:lam(c)); }
  function cyl(rt,rb,h,c,seg){ return new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg||12), c.isMaterial?c:lam(c)); }
  function dome(r,c){ return new T.Mesh(new T.SphereGeometry(r,16,10,0,Math.PI*2,0,Math.PI/2), c.isMaterial?c:lam(c)); }
  function nightMat(c,e){ var m=lam(c,{emissive:col(e||"#ffd9a0"), emissiveIntensity:0}); W.nightMats.push(m); return m; }
  function minaret(x,z,h,c,topc){ var g=new T.Group(); var m1=cyl(0.9,1.1,h,c||nightMat("#f4efe4")); m1.position.y=h/2; g.add(m1);
    var b=cyl(1.4,1.4,0.6,"#e8dfcc"); b.position.y=h*0.72; g.add(b); var b2=b.clone(); b2.position.y=h*0.9; g.add(b2);
    var t=new T.Mesh(new T.ConeGeometry(0.95,3.2,12), lam(topc||"#d8c38a")); t.position.y=h+1.6; g.add(t);
    var cr=new T.Mesh(new T.TorusGeometry(0.45,0.1,6,12,Math.PI*1.4), lam("#e6c25a")); cr.position.y=h+3.6; cr.rotation.z=Math.PI*0.8; g.add(cr);
    g.position.set(x,0,z); W.scene.add(g); W.colliders.push([x,z,1.3]); return g; }
  function collideBox(cx,cz,w,d){ W.boxes.push([cx-w/2,cz-d/2,cx+w/2,cz+d/2]); }
  W.label=function(text, x,y,z, cls, place){ var l={t:text,p:new T.Vector3(x,y,z),cls:cls||"",place:place}; W.labels.push(l); return l; };

  // ---------- Masjidil Haram ----------
  function buildHaram(){
    var mat=lam("#f6f3ec"), marble=lam("#efebe2");
    var floor=new T.Mesh(new T.CircleGeometry(23,48), mat); floor.rotation.x=-Math.PI/2; add(floor,0,0.05,0);
    var ring=new T.Mesh(new T.RingGeometry(23,40,48), marble); ring.rotation.x=-Math.PI/2; add(ring,0,0.04,0);
    // start line from the Hajar Aswad corner
    var line=new T.Mesh(new T.PlaneGeometry(18,0.35), new T.MeshBasicMaterial({color:0x3fbf74})); line.rotation.x=-Math.PI/2; add(line,13.6,0.08,0);
    // Kaabah
    var k=new T.Group(); k.rotation.y=Math.PI/4; W.scene.add(k);
    var base=box(6.6,0.5,6.6,"#d9d4c8"); base.position.y=0.25; k.add(base);
    var body=box(6,7,6,"#141414"); body.position.y=3.85; k.add(body);
    var band=box(6.06,0.55,6.06,"#d4af37"); band.position.y=5.6; k.add(band);
    var band2=box(6.04,0.12,6.04,"#b8952c"); band2.position.y=5.15; k.add(band2);
    // door on the north-east face (local +x face after rotation points north-east)
    var door=box(0.12,2.6,1.5,"#d8b445"); door.position.set(3.03,3.4,1.2); k.add(door);
    var stone=new T.Mesh(new T.SphereGeometry(0.32,10,8), lam("#2a2522")); stone.scale.set(1,1.2,0.5);
    var hs=new T.Mesh(new T.TorusGeometry(0.42,0.1,8,16), lam("#d8d8d8")); var hg=new T.Group(); hg.add(stone); hg.add(hs);
    hg.position.set(4.3,1.6,0); hg.rotation.y=Math.PI/2; W.scene.add(hg);
    var ym=box(0.3,1.2,0.3,"#3a3a3a"); add(ym,0,1.1,4.25);
    W.colliders.push([0,0,4.9]);
    // Hijr Ismail: low semicircle wall on the north-west face
    var hj=new T.Mesh(new T.CylinderGeometry(3.6,3.6,1.3,24,1,true,0,Math.PI), new T.MeshLambertMaterial({color:0xf3efe6, side:T.DoubleSide}));
    hj.position.set(-2.2,0.65,-2.2); hj.rotation.y=Math.PI*0.75; W.scene.add(hj); W.colliders.push([-3.4,-3.4,3.2],[-1.9,-4.5,1.6],[-4.5,-1.9,1.6]);
    // Maqam Ibrahim
    var mq=new T.Group(); var mb=cyl(0.7,0.8,0.5,"#e0dccf"); mb.position.y=0.25; mq.add(mb);
    var cg=new T.Mesh(new T.CylinderGeometry(0.62,0.62,1.4,8,1,true), lam("#d6b24a",{side:T.DoubleSide, transparent:true, opacity:0.9})); cg.position.y=1.2; mq.add(cg);
    var mt=dome(0.66,"#d6b24a"); mt.position.y=1.9; mq.add(mt); var sp=cyl(0.05,0.05,0.6,"#d6b24a"); sp.position.y=2.8; mq.add(sp);
    mq.position.set(6.4,0,-6.4); W.scene.add(mq); W.colliders.push([6.4,-6.4,0.9]);
    // colonnade
    var cm=nightMat("#f2ece0","#ffe2b0"), inst=new T.InstancedMesh(new T.CylinderGeometry(0.5,0.5,10,8), cm, 120), m4=new T.Matrix4(), n=0;
    for(var r=0;r<2;r++){ for(var a=0;a<60;a++){ var th=a/60*Math.PI*2, R=r?35:29.5; m4.makeTranslation(Math.cos(th)*R,5,Math.sin(th)*R); inst.setMatrixAt(n++,m4); } }
    W.scene.add(inst);
    var roof=new T.Mesh(new T.RingGeometry(28.8,38.5,60), lam("#e9e1d0",{side:T.DoubleSide})); roof.rotation.x=-Math.PI/2; add(roof,0,10,0);
    var rim=new T.Mesh(new T.CylinderGeometry(28.8,28.8,1.4,60,1,true), lam("#d9cfb9",{side:T.DoubleSide})); add(rim,0,10.4,0);
    var rim2=new T.Mesh(new T.CylinderGeometry(38.5,38.5,2.2,60,1,true), lam("#e6dccb",{side:T.DoubleSide})); add(rim2,0,10.6,0);
    [20,70,110,160,200,250,290,340].forEach(function(d){ var th=d*Math.PI/180; minaret(Math.cos(th)*41,Math.sin(th)*41,26); });
    // Zamzam coolers
    for(var i=0;i<4;i++){ var zc=new T.Group(), zb=cyl(0.45,0.45,1.2,"#f5f5f5"); zb.position.y=0.6; zc.add(zb); var zbl=cyl(0.47,0.47,0.25,"#3b82c4"); zbl.position.y=0.95; zc.add(zbl);
      zc.position.set(23+i*1.3,0,10.5); W.scene.add(zc); }
    W.label(HJ_PLACES.kaabah.n, 0,10.5,0, "big", "kaabah");
    W.label(HJ_PLACES.hajar.n, 6.2,3,0.6, "", "hajar"); W.label(HJ_PLACES.yamani.n, 0,3,6.0, "", "yamani");
    W.label(HJ_PLACES.maqam.n, 6.4,3.6,-6.4, "", "maqam"); W.label(HJ_PLACES.multazam.n, 4.6,4.8,-2.2, "", "multazam");
    W.label(["Hijir Ismail","Hijr Ismail"], -4.8,2.4,-4.8, "", "kaabah"); W.label(HJ_PLACES.zamzam.n, 25,2.6,10.5, "", "zamzam");
  }
  function buildMasa(){
    var x=46, z1=20, z2=-28, L=z1-z2, cz=(z1+z2)/2;
    var fl=box(10,0.2,L,"#f1ede4"); add(fl,x,0.05,cz);
    var rm0=nightMat("#e7dfcf","#fff0cc"); add(box(0.8,0.6,L+2,rm0),x-5,7,cz); add(box(0.8,0.6,L+2,rm0),x+5,7,cz);
    var cm=lam("#efe8da"); for(var z=z2+2; z<=z1-2; z+=6){ add(cyl(0.4,0.4,7,cm,8),x-5,3.5,z); add(cyl(0.4,0.4,7,cm,8),x+5,3.5,z); add(box(10.8,0.3,0.4,rm0),x,7,z); }
    var gm=new T.MeshBasicMaterial({color:0x2ee87a}); [3,-11].forEach(function(z){ add(box(10,0.25,0.5,gm),x,6.5,z); add(box(10,0.06,0.35,gm),x,0.17,z); });
    var gz=new T.Mesh(new T.PlaneGeometry(9.6,14), new T.MeshBasicMaterial({color:0x2ee87a, transparent:true, opacity:0.12})); gz.rotation.x=-Math.PI/2; add(gz,x,0.17,-4);
    var rm=lam("#a88b6a",{flatShading:true}), r=rnd(3);
    [[z1+1.5,"safa"],[z2-1.5,"marwah"]].forEach(function(e){ for(var i=0;i<7;i++){ var g=new T.DodecahedronGeometry(1+r()*1.3,0); var m=new T.Mesh(g,rm); m.position.set(x-3+r()*6,0.4+r()*0.6,e[0]+(e[1]==="safa"?1:-1)*r()*2.5); m.rotation.set(r()*3,r()*3,r()*3); W.scene.add(m); }
      W.label(HJ_PLACES[e[1]].n, x,5,e[0], "", e[1]); });
    W.label(["Lampu hijau","Green lights"], x,8.6,-4, "", "masa");
    W.boxes.push([x-5.6,z2-6,x-5.2,z1+5],[x+5.2,z2-6,x+5.6,z1+5]);
    // barber corner
    var sh=new T.Group(), sb=box(5,3.2,4,"#f6efe2"); sb.position.y=1.6; sh.add(sb);
    var aw=box(5.4,0.3,1.6,"#2fa36b"); aw.position.set(0,3,2.6); sh.add(aw);
    var pole=cyl(0.22,0.22,2.6,lam("#ffffff")); pole.position.set(2.2,1.3,2.3); sh.add(pole);
    var st=new T.Mesh(new T.TorusGeometry(0.24,0.06,6,10), lam("#d64545")); st.rotation.x=Math.PI/2; [0.6,1.2,1.8,2.4].forEach(function(y){ var s=st.clone(); s.position.set(2.2,y,2.3); sh.add(s); });
    sh.position.set(58,0,-35); W.scene.add(sh); collideBox(58,-35,5.2,4.2); W.label(HJ_PLACES.gunting.n, 58,5,-33, "", "gunting");
  }
  function buildCity(){
    var r=rnd(11), n=0, M=new T.InstancedMesh(new T.BoxGeometry(1,1,1), nightMat("#ffffff","#ffd28a"), 140), m4=new T.Matrix4(), q=new T.Quaternion(), s=new T.Vector3(), p=new T.Vector3(), c=new T.Color();
    var pal=["#efe6d6","#e6dccb","#f3efe8","#d9cdb8","#e9e2d6","#cdbfa8"];
    for(var i=0;i<400 && n<140;i++){ var th=r()*Math.PI*2, R=50+r()*55, x=Math.cos(th)*R, z=Math.sin(th)*R;
      if(x>30 && Math.abs(z)<44) continue; if(x>38 && z<-20 && z>-50) continue; if(Math.abs(x+30)<12 && Math.abs(z-40)<12) continue; if(Math.abs(x)<14 && z>60 && z<96) continue; if(Math.abs(x+20)<16 && z<-40) continue;
      var w=6+r()*8, d=6+r()*8, h=8+r()*20; var bad=false;
      for(var j=0;j<W.boxes.length;j++){ var b=W.boxes[j]; if(x+w/2>b[0]-2 && x-w/2<b[2]+2 && z+d/2>b[1]-2 && z-d/2<b[3]+2){ bad=true; break; } } if(bad) continue;
      p.set(x,h/2,z); s.set(w,h,d); m4.compose(p,q,s); M.setMatrixAt(n,m4); M.setColorAt(n,c.set(pal[n%pal.length])); n++; collideBox(x,z,w,d); }
    M.count=n; W.scene.add(M);
    // clock tower (south)
    var ct=new T.Group(); var t1=box(16,40,16,nightMat("#e4d9c4","#ffd890")); t1.position.y=20; ct.add(t1);
    var t2=box(10,30,10,nightMat("#ece3d2","#ffd890")); t2.position.y=55; ct.add(t2);
    var fm=lam("#ffffff",{emissive:col("#bff5d0"), emissiveIntensity:0}); W.nightMats.push(fm);
    [[0,5.06,0],[0,-5.06,Math.PI],[5.06,0,Math.PI/2],[-5.06,0,-Math.PI/2]].forEach(function(f){ var c2=new T.Mesh(new T.CircleGeometry(3.8,24), fm); c2.position.set(f[0],60,f[1]); c2.rotation.y=f[2]; ct.add(c2);
      var rimc=new T.Mesh(new T.RingGeometry(3.8,4.3,24), lam("#2f9d63")); rimc.position.set(f[0]*1.002,60,f[1]*1.002); rimc.rotation.y=f[2]; ct.add(rimc); });
    var sp=new T.Mesh(new T.ConeGeometry(3,18,8), lam("#d9c48a")); sp.position.y=79; ct.add(sp);
    var cr=new T.Mesh(new T.TorusGeometry(1.6,0.35,8,16,Math.PI*1.3), lam("#e6c25a")); cr.position.y=90; cr.rotation.z=Math.PI*0.85; ct.add(cr);
    ct.position.set(0,0,78); W.scene.add(ct); collideBox(0,78,17,17);
    // hotel
    var ho=box(12,14,10,nightMat("#f1e7d6","#ffd28a")); add(ho,-30,7,46); collideBox(-30,46,12,10); W.label(HJ_PLACES.hotel.n, -30,16,46, "", "hotel");
  }
  // ---------- Mina, jamrat ----------
  function buildMina(){
    var tm=lam("#fbfbf7"), r=rnd(5), n=0, cone=new T.ConeGeometry(2.3,2.4,4); cone.rotateY(Math.PI/4); cone.translate(0,1.2,0);
    var M=new T.InstancedMesh(cone, tm, 260), m4=new T.Matrix4();
    for(var x=90;x<=128;x+=5.2) for(var z=-20;z<=28;z+=5.2){ if(Math.abs(z-4)<3.5 || Math.abs(x-108)<2.6) continue; if(x>113 && z>22) continue; if(n<260){ m4.makeTranslation(x,0,z); M.setMatrixAt(n++,m4); } }
    M.count=n; W.scene.add(M);
    // Masjid al-Khaif
    var kh=box(10,4,8,nightMat("#f2ebdc")); add(kh,128,2,-24); collideBox(128,-24,10,8); minaret(122,-28,14); minaret(134,-28,14);
    W.label(["Masjid al-Khaif","Al-Khaif Mosque"],128,7,-24,"","mina");
    // jamarat plaza: a low curb and lamp posts (stylised, open to the sky)
    var pz=new T.Mesh(new T.PlaneGeometry(40,16), lam("#e4ded2")); pz.rotation.x=-Math.PI/2; add(pz,84,0.05,-32);
    var lpm=lam("#9a9a9a"), lbm=new T.MeshBasicMaterial({color:0xffe9b0}); for(var lx=66;lx<=102;lx+=9){ add(cyl(0.12,0.12,6,lpm,6),lx,3,-25); add(new T.Mesh(new T.SphereGeometry(0.35,8,6),lbm),lx,6.2,-25); }
    W.jamrat={};
    [["aqabah",74],["wusta",84],["ula",94]].forEach(function(j){ var g=new T.Group();
      var basin=new T.Mesh(new T.CylinderGeometry(3.6,3.6,1,24,1,true), lam("#bdb6a8",{side:T.DoubleSide})); basin.scale.set(1,1,0.55); basin.position.y=0.5; g.add(basin);
      var flr=new T.Mesh(new T.CircleGeometry(3.6,24), lam("#9b9384")); flr.rotation.x=-Math.PI/2; flr.scale.set(1,0.55,1); flr.position.y=0.05; g.add(flr);
      var wl=box(5.2,4.2,0.9,"#a39a8c"); wl.position.y=2.1; g.add(wl);
      g.position.set(j[1],0,-34); W.scene.add(g); W.colliders.push([j[1]-1.6,-34,1.6],[j[1]+1.6,-34,1.6],[j[1],-34,1.4]); W.jamrat[j[0]]=g;
      W.label(HJ_PLACES[j[0]].n, j[1],7.6,-34, "", j[0]); });
    // sacrifice area (pens, no animals shown)
    var pm=lam("#b28b5e"); for(var i=0;i<4;i++){ var pen=new T.Mesh(new T.TorusGeometry(2.4,0.12,4,16), pm); pen.rotation.x=Math.PI/2; add(pen,114+i*6,0.9,30); }
    W.label(HJ_PLACES.mina.n, 108,9,0, "big", "mina"); W.label(HJ_PLACES.korban.n, 122,4,30, "", "korban");
  }
  function buildMuzdalifah(){
    var r=rnd(9), n=0, M=new T.InstancedMesh(new T.DodecahedronGeometry(0.16,0), lam("#efe6d2",{emissive:col("#ffeec0"), emissiveIntensity:0.2}), 300), m4=new T.Matrix4();
    for(var i=0;i<300;i++){ var a=r()*Math.PI*2, R=Math.sqrt(r())*20; m4.makeTranslation(150+Math.cos(a)*R,0.12,14+Math.sin(a)*R); M.setMatrixAt(n++,m4); }
    W.scene.add(M);
    var ms=box(9,4,7,nightMat("#efe6d2")); add(ms,150,2,-10); collideBox(150,-10,9,7); minaret(144,-13,14); minaret(156,-13,14);
    var lm=new T.MeshBasicMaterial({color:0xffe3a0}), pm=lam("#9a9a9a");
    for(var k=0;k<8;k++){ var a2=k/8*Math.PI*2; var x=150+Math.cos(a2)*18, z=14+Math.sin(a2)*18; add(cyl(0.12,0.12,6,pm,6),x,3,z); add(new T.Mesh(new T.SphereGeometry(0.35,8,6),lm),x,6.2,z); }
    W.label(HJ_PLACES.muzdalifah.n, 150,8,18, "big", "muzdalifah"); W.label(HJ_PLACES.masyar.n, 150,8,-10, "", "masyar");
  }
  function buildArafah(){
    var r=rnd(13), rm=lam("#9c7b5c",{flatShading:true});
    for(var i=0;i<10;i++){ var g=new T.DodecahedronGeometry(2.6+r()*3,0), m=new T.Mesh(g,rm); var a=r()*Math.PI*2, R=r()*4; m.position.set(212+Math.cos(a)*R, 1+r()*3.5, -20+Math.sin(a)*R); m.rotation.set(r()*3,r()*3,r()*3); W.scene.add(m); }
    var pl=box(1.2,6,1.2,"#ffffff"); add(pl,212,9,-20); W.colliders.push([212,-20,6]);
    // Namirah
    var nm=box(16,5,10,nightMat("#f1eadb")); add(nm,184,2.5,22); collideBox(184,22,16,10);
    var dm=dome(2.6,"#ddd2bc"); add(dm,184,5,22); [176,192].forEach(function(x){ minaret(x,16,18); });
    // neem trees
    var tr=lam("#7a5a3a"), lf=lam("#5e9b4f",{flatShading:true});
    for(var t=0;t<40;t++){ var a=r()*Math.PI*2, R=8+r()*26, x=200+Math.cos(a)*R, z=Math.sin(a)*R; if(Math.hypot(x-212,z+20)<9 || Math.hypot(x-184,z-22)<10) continue;
      add(cyl(0.2,0.3,2,tr,6),x,1,z); var c=new T.Mesh(new T.IcosahedronGeometry(1.5+r()*0.6,0),lf); c.scale.y=0.8; add(c,x,2.8,z); W.colliders.push([x,z,0.5]); }
    // boundary posts
    var bm=lam("#e6c35a"); for(var k=0;k<14;k++){ var a2=k/14*Math.PI*2; var x2=200+Math.cos(a2)*36, z2=Math.sin(a2)*36; add(cyl(0.18,0.18,4,bm,6),x2,2,z2); add(box(1.8,0.9,0.12,bm),x2,4,z2).lookAt(200,4,0); }
    W.label(HJ_PLACES.arafah.n, 200,9,0, "big", "arafah"); W.label(HJ_PLACES.rahmah.n, 212,14,-20, "", "rahmah"); W.label(HJ_PLACES.namirah.n, 184,11,22, "", "namirah");
  }
  // ---------- Madinah ----------
  function buildMadinah(){
    var cx=-30, cz=-348, w=44, d=26;
    var fl=box(w,0.2,d,lam("#b6463f")); add(fl,cx,0.06,cz);
    var rf=box(w+1,1,d+1,nightMat("#efe7d6","#ffe2b0")); add(rf,cx,11,cz);
    var cm=lam("#efe8da"); for(var x=cx-w/2+2;x<=cx+w/2-2;x+=6) for(var z=cz-d/2+2;z<=cz+d/2-2;z+=6) add(cyl(0.45,0.45,11,cm,8),x,5.5,z);
    var gd=dome(4.2,lam("#2e9d62")); add(gd,-14,11.4,-339); var gs=cyl(0.1,0.1,2,"#d6b24a"); add(gs,-14,16.4,-339); var gc=new T.Mesh(new T.TorusGeometry(0.5,0.1,6,12,Math.PI*1.4), lam("#d6b24a")); gc.position.set(-14,17.6,-339); gc.rotation.z=Math.PI*0.8; W.scene.add(gc);
    var ra=new T.Mesh(new T.PlaneGeometry(12,6), lam("#3e9e63")); ra.rotation.x=-Math.PI/2; add(ra,-24,0.18,-341);
    var mb=box(1,3,2,"#e9e2d4"); add(mb,-30,1.5,-340);
    var gr=new T.Mesh(new T.BoxGeometry(6,4,5), lam("#c9a646",{wireframe:false})); add(gr,-14,2,-339); collideBox(-14,-339,6,5);
    var grw=new T.Mesh(new T.BoxGeometry(6.05,4.05,5.05), new T.MeshBasicMaterial({color:0x6b5520, wireframe:true})); add(grw,-14,2,-339);
    [[cx-w/2-1,cz-d/2-1],[cx+w/2+1,cz-d/2-1],[cx-w/2-1,cz+d/2+1],[cx+w/2+1,cz+d/2+1],[-2,-338]].forEach(function(p){ minaret(p[0],p[1],28); });
    // umbrellas in the courtyard (north side)
    var um=lam("#fbfaf6",{side:T.DoubleSide}), pm=lam("#e8e2d6");
    for(var i=0;i<8;i++) for(var j=0;j<2;j++){ var ux=cx-w/2+4+i*5.4, uz=cz-d/2-6-j*6; add(cyl(0.15,0.15,5,pm,6),ux,2.5,uz); var u=new T.Mesh(new T.ConeGeometry(2.8,1.4,8,1,true),um); add(u,ux,5.4,uz); }
    W.label(HJ_PLACES.nabawi.n, cx,16,cz-6, "big", "nabawi"); W.label(HJ_PLACES.raudhah.n, -24,3,-341, "", "raudhah"); W.label(HJ_PLACES.makam.n, -14,5.5,-336, "", "makam");
    // Baqi'
    var bw=lam("#d8cdb8"); [[8,-361,22,0.6],[8,-343,22,0.6],[-3,-352,0.6,18],[19,-352,0.6,18]].forEach(function(b){ add(box(b[2],1.4,b[3],bw),b[0],0.7,b[1]); collideBox(b[0],b[1],b[2],b[3]); });
    var r=rnd(17), sm=lam("#cfc2a8"); for(var k=0;k<60;k++) add(box(0.35,0.3,0.6,sm),-1+r()*18,0.15,-359+r()*14);
    W.label(HJ_PLACES.baqi.n, 8,4,-352, "", "baqi");
    // Quba
    var qb=box(14,4.5,10,nightMat("#f7f4ee")); add(qb,-62,2.25,-292); collideBox(-62,-292,14,10);
    [-67,-62,-57].forEach(function(x){ var dd=dome(1.8,"#f7f4ee"); add(dd,x,4.5,-292); }); [[-70,-298],[-54,-298],[-70,-286],[-54,-286]].forEach(function(p){ minaret(p[0],p[1],16); });
    W.label(HJ_PLACES.quba.n, -62,10,-292, "", "quba");
    // Uhud ridge + martyrs' plot
    var um2=lam("#8e5f45",{flatShading:true}); for(var u2=0;u2<7;u2++){ var mnt=new T.Mesh(new T.ConeGeometry(26+u2%3*6, 30+u2%2*12, 6), um2); mnt.position.set(-110+u2*30, 12, -440-(u2%2)*10); mnt.rotation.y=u2; W.scene.add(mnt); }
    [[-30,-406,14,0.5],[-30,-396,14,0.5],[-37,-401,0.5,10],[-23,-401,0.5,10]].forEach(function(b){ add(box(b[2],1.2,b[3],bw),b[0],0.6,b[1]); });
    W.label(HJ_PLACES.uhud.n, -30,10,-402, "", "uhud");
    // Bir Ali
    var ba=box(12,4,9,nightMat("#f4eee2")); add(ba,-26,2,-244); collideBox(-26,-244,12,9); var bd=dome(2.4,"#e5dccb"); add(bd,-26,4,-244);
    var tall=minaret(-18,-249,24); var mr=new T.Mesh(new T.RingGeometry(7,8,40), new T.MeshBasicMaterial({color:0xe6c25a, side:T.DoubleSide, transparent:true, opacity:0.85})); mr.rotation.x=-Math.PI/2; add(mr,-26,0.12,-232); W.miqatRing=mr;
    W.label(HJ_PLACES.birali.n, -26,10,-240, "", "birali");
    // Tan'im
    var tn=box(10,4,8,nightMat("#f4eee2")); add(tn,-26,2,-98); collideBox(-26,-98,10,8); minaret(-33,-102,16); minaret(-19,-102,16);
    W.label(HJ_PLACES.tanim.n, -26,9,-96, "", "tanim");
  }
  function buildMiqat(){
    var pm=lam("#c9b48a"), gm=lam("#e6c25a",{emissive:col("#e6c25a"), emissiveIntensity:0.25});
    var pts=[];
    HJ_MIQAT.forEach(function(m){ var x=m.p[0], z=m.p[1]; if(m.id!=="birali"){ add(cyl(1.2,1.6,12,pm,8),x,6,z); add(new T.Mesh(new T.TorusGeometry(1.7,0.25,8,20),gm),x,12.4,z).rotation.x=Math.PI/2; W.colliders.push([x,z,1.8]); }
      pts.push(new T.Vector3(x,0.6,z)); W.label(m.n, x,16,z, "miqat", "miqat"); });
    pts.sort(function(a,b){ return Math.atan2(a.z,a.x)-Math.atan2(b.z,b.x); }); pts.push(pts[0].clone());
    var curve=new T.CatmullRomCurve3(pts, true, "centripetal"), g=new T.BufferGeometry().setFromPoints(curve.getPoints(160));
    var ln=new T.Line(g, new T.LineDashedMaterial({color:0xe6c25a, dashSize:6, gapSize:4})); ln.computeLineDistances(); W.scene.add(ln);
    // a small aeroplane circling over Qarnul Manazil
    var pl=new T.Group(), b=new T.Mesh(new T.CapsuleGeometry(0.9,6,4,10), lam("#ffffff")); b.rotation.z=Math.PI/2; pl.add(b);
    var wg=box(2,0.2,9,"#e9eef5"); pl.add(wg); var tl=box(1.2,1.8,0.2,"#2fa36b"); tl.position.set(-3.2,1,0); pl.add(tl); var tw=box(1,0.15,3,"#e9eef5"); tw.position.set(-3.2,0.3,0); pl.add(tw);
    W.scene.add(pl); W.anim.push(function(t){ var a=t*0.25; pl.position.set(262+Math.cos(a)*30, 34, -60+Math.sin(a)*30); pl.rotation.y=-a-Math.PI; });
  }
  function buildMountains(){
    var r=rnd(21), cm=[lam("#a07a58",{flatShading:true}), lam("#8f6b4e",{flatShading:true}), lam("#b08a64",{flatShading:true})], n=0;
    for(var i=0;i<900 && n<70;i++){ var x=-240+r()*560, z=-330+r()*560, R=10+r()*16, ok=true;
      for(var j=0;j<ZONES.length;j++){ if(Math.hypot(x-ZONES[j][0],z-ZONES[j][1])<ZONES[j][2]+R+10){ ok=false; break; } }
      if(ok) for(var k=0;k<ROADS.length;k++){ if(segDist(x,z,ROADS[k])<R+14){ ok=false; break; } }
      if(ok) for(var q=0;q<HJ_MIQAT.length;q++){ if(Math.hypot(x-HJ_MIQAT[q].p[0],z-HJ_MIQAT[q].p[1])<R+12){ ok=false; break; } }
      if(!ok) continue;
      var h=10+r()*22; if(Math.hypot(x,z)<140) h+=10; var g=new T.ConeGeometry(R,h,6+Math.floor(r()*3),2);
      var p=g.attributes.position; for(var v=0;v<p.count;v++){ if(p.getY(v)<h/2-0.01){ p.setX(v,p.getX(v)*(0.85+r()*0.3)); p.setZ(v,p.getZ(v)*(0.85+r()*0.3)); } } g.computeVertexNormals();
      var m=new T.Mesh(g, cm[n%3]); m.position.set(x,h/2-1,z); m.rotation.y=r()*6; W.scene.add(m); W.colliders.push([x,z,R*0.8]); n++; }
  }

  // ---------- figures ----------
  var robeGeo=null;
  function robeG(){ if(robeGeo) return robeGeo; var pts=[]; [[0,0],[0.56,0],[0.6,0.08],[0.52,0.5],[0.4,0.9],[0.3,1.12],[0.1,1.2],[0,1.2]].forEach(function(p){ pts.push(new T.Vector2(p[0],p[1])); }); robeGeo=new T.LatheGeometry(pts,14); return robeGeo; }
  var SKIN=["#f1cfae","#e2b48c","#c99269","#a8714b"];
  // opt: {robe, skin, f (female), cap (hair colour or null), scarf, vest, flag, cane, small}
  W.makeFigure = function(opt){
    opt=opt||{}; var g=new T.Group(), parts={};
    var rm=lam(opt.robe||"#ffffff"); var robe=new T.Mesh(robeG(), rm); g.add(robe); parts.robe=robe;
    var skin=lam(opt.skin||SKIN[0]);
    var head=new T.Mesh(new T.SphereGeometry(0.44,16,12), skin); head.position.y=1.58; g.add(head); parts.head=head;
    if(opt.f){ var sc=new T.Mesh(new T.SphereGeometry(0.5,16,12,Math.PI*0.25,Math.PI*1.5), lam(opt.scarf||"#ffffff",{side:T.DoubleSide})); sc.rotation.y=Math.PI*0.5; sc.position.y=1.6; g.add(sc); parts.scarf=sc;
      var cape=new T.Mesh(new T.ConeGeometry(0.62,0.7,14,1,true), lam(opt.scarf||"#ffffff",{side:T.DoubleSide})); cape.position.y=1.12; g.add(cape); parts.cape=cape; }
    else if(opt.cap){ var cp=new T.Mesh(new T.SphereGeometry(0.46,16,8,0,Math.PI*2,0,Math.PI*0.42), lam(opt.cap)); cp.position.y=1.6; g.add(cp); parts.cap=cp; }
    if(opt.hat){ var ht=cyl(0.4,0.42,0.3,opt.hat,16); ht.position.y=1.98; g.add(ht); parts.hat=ht; }
    if(opt.sash){ var sh=new T.Mesh(new T.TorusGeometry(0.44,0.09,6,16), lam(opt.sash)); sh.position.set(0,0.95,0); sh.rotation.set(Math.PI/2, 0.55, 0); g.add(sh); parts.sash=sh;
      var shoulder=new T.Mesh(new T.SphereGeometry(0.16,10,8), skin); shoulder.position.set(0.3,1.08,0.05); g.add(shoulder); parts.shoulder=shoulder; }
    if(opt.vest){ var v=new T.Mesh(new T.CylinderGeometry(0.42,0.5,0.55,14,1,true), lam(opt.vest,{side:T.DoubleSide})); v.position.y=0.88; g.add(v); }
    var ag=new T.CapsuleGeometry(0.11,0.42,4,8); ag.translate(0,-0.26,0);
    var aL=new T.Mesh(ag, lam(opt.f?(opt.scarf||"#fff"):(opt.robe||"#fff"))), aR=aL.clone();
    aL.position.set(-0.46,1.12,0); aR.position.set(0.46,1.12,0); aL.rotation.z=-0.25; aR.rotation.z=0.25; g.add(aL); g.add(aR); parts.aL=aL; parts.aR=aR;
    var hL=new T.Mesh(new T.SphereGeometry(0.1,8,6), skin), hR=hL.clone(); hL.position.y=-0.56; hR.position.y=-0.56; aL.add(hL); aR.add(hR);
    var fg=new T.SphereGeometry(0.15,8,6); fg.scale(1,0.6,1.5); var fm=lam(opt.shoe||"#6b5440");
    var fL=new T.Mesh(fg,fm), fR=new T.Mesh(fg,fm); fL.position.set(-0.2,0.07,0.08); fR.position.set(0.2,0.07,0.08); g.add(fL); g.add(fR); parts.fL=fL; parts.fR=fR;
    if(opt.flag){ var st=cyl(0.03,0.03,2.2,"#8a8a8a",5); st.position.set(0.6,1.6,0); g.add(st); var fl=box(0.03,0.45,0.7,opt.flag); fl.position.set(0.6,2.5,0.35); g.add(fl); parts.flag=fl; }
    if(opt.cane){ var cn=cyl(0.04,0.04,1.3,"#6b4a2e",5); cn.position.set(0.62,0.65,0.15); g.add(cn); }
    var sh2=new T.Mesh(new T.CircleGeometry(0.62,16), new T.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.22, depthWrite:false})); sh2.rotation.x=-Math.PI/2; sh2.position.y=0.03; g.add(sh2);
    if(opt.small) g.scale.setScalar(0.72);
    g.userData.parts=parts; g.userData.opt=opt; g.userData.ph=Math.random()*6; g.userData.pose="idle"; g.userData.pt=0;
    return g;
  };
  // pose: idle, walk, doa (hands up), solat (bow), throw, wave
  W.animFigure = function(f, dt, moving, speed){
    var u=f.userData, P=u.parts; u.ph += dt*(moving?(speed||1)*9:2.2); u.pt+=dt; var s=Math.sin(u.ph);
    var bob=moving?Math.abs(s)*0.09:Math.sin(u.ph)*0.015;
    P.robe.position.y=bob; P.head.position.y=1.58+bob; if(P.scarf){ P.scarf.position.y=1.6+bob; P.cape.position.y=1.12+bob; } if(P.cap) P.cap.position.y=1.6+bob; if(P.hat) P.hat.position.y=1.98+bob; if(P.sash) P.sash.position.y=0.95+bob; if(P.shoulder) P.shoulder.position.y=1.08+bob;
    P.aL.position.y=P.aR.position.y=1.12+bob;
    P.fL.position.z=0.08+(moving?s*0.22:0); P.fR.position.z=0.08-(moving?s*0.22:0);
    var pose=u.pose;
    if(pose==="doa"){ P.aL.rotation.set(-2.2,0,-0.35); P.aR.rotation.set(-2.2,0,0.35); }
    else if(pose==="wave"){ P.aL.rotation.set(0,0,-0.2); P.aR.rotation.set(-2.6+Math.sin(u.pt*8)*0.35,0,0.2); }
    else if(pose==="throw"){ var k=Math.min(1,u.pt*4); P.aR.rotation.set(-2.8+k*2.2,0,0.2); P.aL.rotation.set(0,0,-0.25); }
    else if(pose==="solat"){ var c=(u.pt%6)/6, b=c<0.25?0:c<0.45?0.9:c<0.85?1.5:0; P.robe.rotation.x=0; f.rotation.x=0; P.head.position.z=b*0.55; P.head.position.y=1.58-b*0.55; if(P.scarf){ P.scarf.position.z=b*0.55; P.scarf.position.y=1.6-b*0.55; P.cape.position.y=1.12-b*0.3; } if(P.cap){ P.cap.position.z=b*0.55; P.cap.position.y=1.6-b*0.55; }
      P.aL.rotation.set(-0.6-b*0.6,0,-0.2); P.aR.rotation.set(-0.6-b*0.6,0,0.2); }
    else { P.aL.rotation.set(moving?-s*0.5:0,0,-0.25); P.aR.rotation.set(moving?s*0.5:0,0,0.25); if(P.head.position.z){ P.head.position.z=0; if(P.scarf) P.scarf.position.z=0; if(P.cap) P.cap.position.z=0; } }
    if(P.flag) P.flag.rotation.y=Math.sin(u.pt*3)*0.25;
  };
  W.dressIhram = function(f, on){ var o=f.userData.opt, P=f.userData.parts;
    var rc = on ? "#ffffff" : (o.robe0||o.robe); P.robe.material.color.set(rc); if(!o.f){ P.aL.material.color.set(rc); P.aR.material.color.set(rc); }
    if(o.f){ var sc = on ? "#ffffff" : (o.scarf0||o.scarf); P.scarf.material.color.set(sc); P.cape.material.color.set(sc); P.aL.material.color.set(sc); }
    if(P.hat) P.hat.visible=!on; if(P.sash) P.sash.visible=on; if(P.shoulder) P.shoulder.visible=on; };

  // ---------- crowd (instanced, cheap) ----------
  function buildCrowd(){
    var r=rnd(31), N=420, rg=robeG(), hg=new T.SphereGeometry(0.44,10,8); hg.translate(0,1.58,0);
    var RM=new T.InstancedMesh(rg, lam("#ffffff"), N), HM=new T.InstancedMesh(hg, lam("#ffffff"), N);
    var list=[], c=new T.Color();
    function push(kind, a, b, cc, sk, sc){ list.push({k:kind, a:a, b:b, s:sc||1}); var i=list.length-1; RM.setColorAt(i, c.set(cc)); HM.setColorAt(i, c.set(sk)); }
    var robes=["#ffffff","#ffffff","#ffffff","#f4f0e6","#ffffff","#eef3f7"], scarf=["#ffffff","#f5efe4","#e9eef2"];
    for(var i=0;i<190;i++){ var f=r()<0.45; push("tawaf", r()*Math.PI*2, 6.2+Math.pow(r(),0.8)*15.5, robes[i%6], f?scarf[i%3]:SKIN[i%4]); list[list.length-1].sp=0.10+r()*0.06; }
    for(var j=0;j<46;j++){ push("saie", r(), 42.5+r()*7, robes[j%6], r()<0.4?"#ffffff":SKIN[j%4]); list[list.length-1].sp=0.035+r()*0.02; list[list.length-1].dir=r()<0.5?1:-1; }
    function scatter(n, cx, cz, R, kind){ for(var k=0;k<n;k++){ var a=r()*Math.PI*2, d=Math.sqrt(r())*R; push(kind||"stand", cx+Math.cos(a)*d, cz+Math.sin(a)*d, robes[k%6], r()<0.4?"#ffffff":SKIN[k%4], 0.9+r()*0.15); list[list.length-1].ry=r()*6; } }
    scatter(50,200,4,26); scatter(30,150,16,18); scatter(24,104,4,10); scatter(20,84,-24,8); scatter(16,-30,-370,14); scatter(18,-30,-348,16); scatter(10,-26,-232,8); scatter(16,0,-38,8);
    RM.count=HM.count=list.length; W.scene.add(RM); W.scene.add(HM); W.crowd={R:RM,H:HM,list:list};
    updCrowd(0, true);
  }
  var m4=new T.Matrix4(), qq=new T.Quaternion(), vv=new T.Vector3(), ss=new T.Vector3(), up=new T.Vector3(0,1,0);
  function updCrowd(dt, all){ var C=W.crowd, L=C.list, t=W.time||0;
    for(var i=0;i<L.length;i++){ var e=L[i], x, z, ry, y=0;
      if(e.k==="tawaf"){ e.a-=e.sp*dt*(8/Math.max(6,e.b)); x=Math.cos(e.a)*e.b; z=Math.sin(e.a)*e.b; ry=-e.a+Math.PI; y=Math.abs(Math.sin(t*7+i))*0.06; }
      else if(e.k==="saie"){ e.a+=e.sp*dt*e.dir; if(e.a>1){ e.a=1; e.dir=-1; } if(e.a<0){ e.a=0; e.dir=1; } x=e.b; z=18-e.a*44; ry=e.dir>0?Math.PI:0; y=Math.abs(Math.sin(t*7+i))*0.06; }
      else { if(!all) continue; x=e.a; z=e.b; ry=e.ry; }
      qq.setFromAxisAngle(up, ry); vv.set(x,y,z); ss.setScalar(e.s); m4.compose(vv,qq,ss); C.R.setMatrixAt(i,m4); C.H.setMatrixAt(i,m4); }
    C.R.instanceMatrix.needsUpdate=true; C.H.instanceMatrix.needsUpdate=true; }

  W.update = function(dt){ W.time=(W.time||0)+dt; updCrowd(dt,false); for(var i=0;i<W.anim.length;i++) W.anim[i](W.time, dt); };

  // movement with collisions
  W.collide = function(p){ var C=W.colliders, B=W.boxes, R=0.5;
    for(var i=0;i<C.length;i++){ var c=C[i], dx=p.x-c[0], dz=p.z-c[1], d=Math.sqrt(dx*dx+dz*dz), m=c[2]+R; if(d<m && d>0.0001){ p.x=c[0]+dx/d*m; p.z=c[1]+dz/d*m; } }
    for(var j=0;j<B.length;j++){ var b=B[j]; if(p.x>b[0]-R && p.x<b[2]+R && p.z>b[1]-R && p.z<b[3]+R){ var l=p.x-(b[0]-R), rr=(b[2]+R)-p.x, t=p.z-(b[1]-R), bb=(b[3]+R)-p.z, mn=Math.min(l,rr,t,bb);
      if(mn===l) p.x=b[0]-R; else if(mn===rr) p.x=b[2]+R; else if(mn===t) p.z=b[1]-R; else p.z=b[3]+R; } }
    p.x=Math.max(-300,Math.min(320,p.x)); p.z=Math.max(-430,Math.min(260,p.z)); };

  // pebble throw effect
  W.throwPebble = function(from, to, onHit){
    var m=new T.Mesh(new T.DodecahedronGeometry(0.14,0), lam("#efe6d2")); W.scene.add(m); var t0=W.time;
    W.anim.push(function fn(t){ var k=Math.min(1,(t-t0)/0.6); m.position.lerpVectors(from,to,k); m.position.y+=Math.sin(k*Math.PI)*2.2;
      if(k>=1){ W.scene.remove(m); W.anim.splice(W.anim.indexOf(fn),1); W.puff(to); if(onHit) onHit(); } });
  };
  W.puff = function(p, colr){ var g=new T.Group(), mat=new T.MeshBasicMaterial({color:colr||0xf2e6c8, transparent:true, opacity:0.9}); for(var i=0;i<8;i++){ var s=new T.Mesh(new T.SphereGeometry(0.12,6,4),mat); s.userData.v=new T.Vector3(Math.random()-0.5,Math.random()*0.8+0.3,Math.random()-0.5).multiplyScalar(3); g.add(s); }
    g.position.copy(p); W.scene.add(g); var t0=W.time;
    W.anim.push(function fn(t,dt){ var k=(t-t0)/0.7; g.children.forEach(function(s){ s.position.addScaledVector(s.userData.v,dt); s.userData.v.y-=6*dt; }); mat.opacity=Math.max(0,0.9-k); if(k>=1){ W.scene.remove(g); W.anim.splice(W.anim.indexOf(fn),1); } }); };
  W.sparkle = function(p){ W.puff(p, 0xffe28a); W.puff(new T.Vector3(p.x,p.y+0.8,p.z), 0xffffff); };
  return W;
})();
