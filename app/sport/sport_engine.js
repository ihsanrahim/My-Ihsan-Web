/* My Ihsan: Sports engine (Move › Sports). Spec: docs/specs/sports-guide.md
   One three.js scene per open sport, 1 unit = 1 metre. Proportional players (body ratios of standing height),
   to-scale fields, rule cards with animated scenes, tappable field zones, a quiz and a mini game per sport.
   Each sport is a file sport/sports/<id>.js that registers window.SPORTS[id]. Everything is drawn in code (no images). */
window.SPORTS=window.SPORTS||{};
window.SportView=(function(){
"use strict";
var T=null, H=null, L2=null, E=null, PI=Math.PI;
function TT(){ T=window.THREE; }
function tx(o){ return o==null?"":(typeof o==="string"?o:(L2?L2(o[0],o[1]):o[1])); }
function clamp(v,a,b){ return v<a?a:v>b?b:v; }
function lerp(a,b,t){ return a+(b-a)*t; }
function ease(t){ t=clamp(t,0,1); return t*t*(3-2*t); }
function seg(t,a,b){ return ease((t-a)/(b-a)); }       // 0..1 between times a and b
function ld(){ try{ return JSON.parse(localStorage.getItem("ihsan_sport")||"{}")||{}; }catch(e){ return {}; } }
function sv(D){ try{ localStorage.setItem("ihsan_sport", JSON.stringify(D)); }catch(e){} }

// ---------------- proportional human ----------------
// ratios of standing height H (Drillis & Contini): shoulder .818, elbow .630, wrist .485, hip .530, knee .285, ankle .039,
// head .130, shoulder width .259, hip width .191, foot .152
var R={head:.130, sh:.818, el:.630, wr:.485, hip:.530, kn:.285, an:.039, shW:.259, hipW:.191, foot:.152};
var SKIN=["#e6bf9b","#c89e79","#a77a55"];
function mat(c, o){ return new T.MeshLambertMaterial(Object.assign({color:new T.Color(c)}, o||{})); }
function body(Hm, o){ o=o||{}; var k=Hm/1.75;
  var top=mat(o.top||"#f1efe9"), pants=mat(o.pants||"#2b2f3a"), skin=mat(o.skin||SKIN[(o.si||1)%3]), shoe=mat(o.shoe||"#e7e1d6");
  var g=new T.Group(), J={};
  function jt(n, p, x, y, z){ var j=new T.Group(); j.position.set(x,y,z); (p||g).add(j); J[n]=j; return j; }
  function cap(p, len, r, m){ var c=new T.Mesh(new T.CapsuleGeometry(r, Math.max(0.01,len-2*r), 4, 8), m); c.position.y=-len/2; p.add(c); return c; }
  var hip=jt("hip", null, 0, R.hip*Hm, 0), chest=jt("chest", hip, 0, (R.sh-R.hip)*Hm*0.82, 0);
  var tl=(R.sh-R.hip)*Hm; var torso=new T.Mesh(new T.CapsuleGeometry(R.shW*Hm*0.34, tl*0.62, 4, 10), top); torso.position.y=-tl*0.34; torso.scale.z=0.62; chest.add(torso);
  var pelvis=new T.Mesh(new T.CapsuleGeometry(R.hipW*Hm*0.52, 0.02, 4, 8), pants); pelvis.rotation.z=PI/2; pelvis.scale.y=1; pelvis.scale.z=0.75; hip.add(pelvis);
  var neck=jt("neck", chest, 0, tl*0.2, 0); var hr=R.head*Hm*0.43;
  var head=new T.Mesh(new T.SphereGeometry(hr, 16, 12), skin); head.position.y=hr*1.15; head.scale.set(0.9,1.05,0.95); neck.add(head);
  if(o.hijab){ var hj=new T.Mesh(new T.SphereGeometry(hr*1.12, 16, 12, 0, PI*2, 0, PI*0.62), mat(o.hijab)); hj.position.y=hr*1.2; neck.add(hj);
    var drape=new T.Mesh(new T.CylinderGeometry(hr*1.05, hr*1.5, hr*1.3, 16, 1, true), mat(o.hijab, {side:T.DoubleSide})); drape.position.y=hr*0.2; neck.add(drape); }
  else if(o.cap!==false){ var cp=new T.Mesh(new T.SphereGeometry(hr*1.04, 16, 8, 0, PI*2, 0, PI*0.42), mat(o.capc||"#f4f2ec")); cp.position.y=hr*1.25; neck.add(cp); }
  var ua=(R.sh-R.el)*Hm, fa=(R.el-R.wr)*Hm, th=(R.hip-R.kn)*Hm, sk=(R.kn-R.an)*Hm;
  ["L","R"].forEach(function(s){ var x=(s==="L"?-1:1);
    var sh=jt("sh"+s, chest, x*R.shW*Hm*0.46, 0, 0); cap(sh, ua, 0.048*k, o.short?skin:top);
    var el=jt("el"+s, sh, 0, -ua, 0); cap(el, fa, 0.04*k, o.short?skin:top);
    var hd=new T.Mesh(new T.SphereGeometry(0.045*k, 8, 6), skin); hd.position.y=-fa-0.03*k; el.add(hd);
    var hp=jt("hp"+s, hip, x*R.hipW*Hm*0.5, 0, 0); cap(hp, th, 0.068*k, pants);
    var kn=jt("kn"+s, hp, 0, -th, 0); cap(kn, sk, 0.052*k, o.shorts?skin:pants);
    var an=jt("an"+s, kn, 0, -sk, 0); var ft=new T.Mesh(new T.BoxGeometry(0.1*k, R.an*Hm*1.3, R.foot*Hm), shoe); ft.position.set(0, -R.an*Hm*0.35, R.foot*Hm*0.28); an.add(ft); });
  if(o.num!=null){ var c=document.createElement("canvas"); c.width=c.height=64; var x2=c.getContext("2d"); x2.fillStyle=o.numc||"#111"; x2.font="bold 44px sans-serif"; x2.textAlign="center"; x2.textBaseline="middle"; x2.fillText(String(o.num),32,34);
    var nm=new T.Mesh(new T.PlaneGeometry(0.2*k,0.2*k), new T.MeshBasicMaterial({map:new T.CanvasTexture(c), transparent:true})); nm.position.set(0,-tl*0.3,-R.shW*Hm*0.22); nm.rotation.y=PI; chest.add(nm); }
  // blob shadow
  var sh0=new T.Mesh(new T.CircleGeometry(0.32*k, 16), new T.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.22, depthWrite:false})); sh0.rotation.x=-PI/2; sh0.position.y=0.012; g.add(sh0);
  g.userData={J:J, H:Hm}; pose(g, "idle", 0); return g;
}
// poses: name + phase (0..1, loops for cyclic moves). Angles in radians. +x rotation on a hip = leg forward (toward +z).
function pose(b, name, p){ var J=b.userData.J, Hm=b.userData.H, s=Math.sin(p*PI*2), c=Math.cos(p*PI*2);
  function set(j, x, y, z){ J[j].rotation.set(x||0, y||0, z||0); }
  ["hip","chest","neck","shL","shR","elL","elR","hpL","hpR","knL","knR","anL","anR"].forEach(function(j){ set(j); });
  J.hip.position.y=R.hip*Hm; J.hip.position.z=0;
  if(name==="idle"){ set("shL",0,0,-0.12-0.03*s); set("shR",0,0,0.12+0.03*s); set("elL",-0.15); set("elR",-0.15); }
  else if(name==="ready"){ J.hip.position.y=R.hip*Hm*0.9; set("chest",0.25); set("hpL",-0.35,0,-0.12); set("hpR",-0.35,0,0.12); set("knL",0.7); set("knR",0.7); set("shL",-0.6,0,-0.3); set("shR",-0.6,0,0.3); set("elL",-0.9); set("elR",-0.9); }
  else if(name==="run"||name==="sprint"){ var a=name==="sprint"?1.0:0.7; set("chest",0.15*a); set("hpL",a*s); set("hpR",-a*s); set("knL",Math.max(0,-s)*1.4*a+0.2); set("knR",Math.max(0,s)*1.4*a+0.2);
    set("shL",-a*s,0,-0.1); set("shR",a*s,0,0.1); set("elL",-1.3); set("elR",-1.3); J.hip.position.y=R.hip*Hm+Math.abs(c)*0.04*Hm/1.75; }
  else if(name==="kick"){ var w=p<0.4?-1.2*ease(p/0.4):lerp(-1.2,1.5,ease((p-0.4)/0.25)); set("hpR",w); set("knR",p<0.5?1.3*ease(p/0.4):lerp(1.3,0.1,ease((p-0.4)/0.25))); set("hpL",-0.15); set("knL",0.25); set("shL",0.6,0,-0.5); set("shR",-0.5,0,0.4); set("chest",-0.15); }
  else if(name==="jump"){ var up=Math.sin(clamp(p,0,1)*PI); J.hip.position.y=R.hip*Hm+up*0.55*Hm/1.75; set("hpL",-0.3*(1-up)); set("hpR",-0.3*(1-up)); set("knL",0.6*(1-up)); set("knR",0.6*(1-up)); set("shL",-2.6*up,0,-0.2); set("shR",-2.6*up,0,0.2); }
  else if(name==="smash"){ var u2=Math.sin(clamp(p,0,1)*PI); J.hip.position.y=R.hip*Hm+u2*0.35*Hm/1.75; var arm=p<0.5?lerp(-1.2,-3.0,ease(p/0.5)):lerp(-3.0,-0.6,ease((p-0.5)/0.3)); set("shR",arm,0,0.25); set("elR",p<0.5?-1.6:-0.2); set("shL",-1.8,0,-0.3); set("chest",p<0.5?-0.25:0.3); set("hpL",-0.4*u2); set("knL",0.8*u2); }
  else if(name==="shoot"){ var u3=Math.sin(clamp(p,0,1)*PI*0.5+PI*0.5*clamp(p,0,1)); var ext=ease(p); J.hip.position.y=R.hip*Hm+Math.sin(clamp(p,0,1)*PI)*0.18; set("shR",lerp(-1.4,-2.9,ext)); set("shL",lerp(-1.3,-2.6,ext),0,-0.1); set("elR",lerp(-1.9,-0.1,ext)); set("elL",lerp(-1.6,-0.4,ext)); set("knL",0.5*(1-ext)); set("knR",0.5*(1-ext)); set("hpL",-0.3*(1-ext)); set("hpR",-0.3*(1-ext)); }
  else if(name==="bicycle"){ // sepak takraw "gulung": body tips back, kicking leg sweeps over the net
    J.hip.position.y=R.hip*Hm+Math.sin(clamp(p,0,1)*PI)*0.75; set("hip",-lerp(0.2,2.1,ease(p))); set("hpR",lerp(-0.2,2.2,ease(p*1.2))); set("knR",lerp(1.2,0.1,ease(p*1.4))); set("hpL",0.4); set("knL",1.1); set("shL",-1.6,0,-0.6); set("shR",-1.6,0,0.6); }
  else if(name==="dive"){ var d=ease(p); J.hip.position.y=R.hip*Hm*lerp(1,0.55,d); set("hip",0,0,-1.3*d); set("shL",-3.0*d,0,-0.2); set("shR",-3.0*d,0,0.2); set("hpL",0.2*d); set("hpR",-0.3*d); }
  else if(name==="serve"){ var q=ease(p); set("shR",lerp(0.6,-2.4,q),0,0.2); set("elR",-0.4); set("shL",lerp(-1.0,-0.2,q)); set("chest",lerp(0.1,-0.2,q)); set("hpL",-0.3); set("knL",0.2); }
  else if(name==="swing"){ var q2=ease(p); set("shR",lerp(-2.6,-0.4,q2),0,lerp(0.9,0.3,q2)); set("elR",lerp(-1.5,-0.2,q2)); set("chest",0,lerp(0.6,-0.6,q2)); set("shL",-0.8,0,-0.3); set("hpL",-0.3); set("knL",0.3); }
  else if(name.indexOf("swim")===0){ // horizontal body; the caller rotates the whole body to lie on the water
    var st=name.slice(5); set("hpL",0.2*s); set("hpR",-0.2*s); set("knL",0.25*Math.max(0,s)); set("knR",0.25*Math.max(0,-s));
    if(st==="free"){ set("shL",-PI*p*2,0,-0.15); set("shR",-PI*(p*2+1),0,0.15); set("elL",-0.4); set("elR",-0.4); set("chest",0,0.35*s); }
    else if(st==="back"){ set("shL",PI*p*2,0,-0.15); set("shR",PI*(p*2+1),0,0.15); }
    else if(st==="breast"){ var o2=Math.max(0,s); set("shL",-2.9+o2*0.6,0,-o2*1.1); set("shR",-2.9+o2*0.6,0,o2*1.1); set("elL",-o2*1.2); set("elR",-o2*1.2); set("hpL",-0.5*o2,0,-0.4*o2); set("hpR",-0.5*o2,0,0.4*o2); set("knL",1.6*o2); set("knR",1.6*o2); }
    else if(st==="fly"){ var ang=-PI*p*2; set("shL",ang,0,-0.35); set("shR",ang,0,0.35); set("hpL",0.35*s); set("hpR",0.35*s); set("knL",0.4*Math.max(0,s)); set("knR",0.4*Math.max(0,s)); set("chest",0.2*s); } }
  else if(name==="point"){ set("shR",-1.6,0,0.2); set("elR",-0.05); set("shL",0,0,-0.12); }
  else if(name==="whistle"){ set("shR",-2.2,0,0.3); set("elR",-2.3); set("shL",0,0,-0.12); }
  else if(name==="card"){ set("shR",-PI+0.1,0,0.1); set("elR",0); set("shL",0,0,-0.12); }
}
// put a body at x,z facing angle (radians, 0 = facing +z)
function place(b, x, z, ry, y){ b.position.set(x, y||0, z); b.rotation.set(0, ry||0, 0); }

// ---------------- field kit ----------------
function Kit(root){
  var lineM=null;
  function lm(c){ return new T.MeshBasicMaterial({color:new T.Color(c||"#ffffff"), side:T.DoubleSide}); }
  var K={root:root, lineW:0.08, lineC:"#ffffff",
    rect:function(w, l, col, y, x, z){ var m=new T.Mesh(new T.PlaneGeometry(w, l), mat(col||"#3f8f4a")); m.rotation.x=-PI/2; m.position.set(x||0, y||0, z||0); root.add(m); return m; },
    stripes:function(w, l, n, c1, c2){ for(var i=0;i<n;i++) K.rect(w, l/n, i%2?c1:c2, 0.001, 0, -l/2+l/n*(i+0.5)); },
    line:function(x1, z1, x2, z2, w, col){ var dx=x2-x1, dz=z2-z1, len=Math.sqrt(dx*dx+dz*dz); var m=new T.Mesh(new T.PlaneGeometry(w||K.lineW, len), lm(col||K.lineC)); m.rotation.x=-PI/2; m.rotation.z=-Math.atan2(dx, dz); m.position.set((x1+x2)/2, 0.004, (z1+z2)/2); root.add(m); return m; },
    box:function(x1, z1, x2, z2, w, col){ K.line(x1,z1,x2,z1,w,col); K.line(x2,z1,x2,z2,w,col); K.line(x2,z2,x1,z2,w,col); K.line(x1,z2,x1,z1,w,col); },
    arc:function(cx, cz, r, a0, a1, w, col){ var m=new T.Mesh(new T.RingGeometry(r-(w||K.lineW)/2, r+(w||K.lineW)/2, 48, 1, a0, a1-a0), lm(col||K.lineC)); m.rotation.x=-PI/2; m.position.set(cx, 0.004, cz); root.add(m); return m; },
    dot:function(x, z, r, col){ var m=new T.Mesh(new T.CircleGeometry(r||0.11, 16), lm(col||K.lineC)); m.rotation.x=-PI/2; m.position.set(x, 0.005, z); root.add(m); return m; },
    post:function(x, z, h, r, col){ var m=new T.Mesh(new T.CylinderGeometry(r||0.06, r||0.06, h, 12), mat(col||"#ffffff")); m.position.set(x, h/2, z); root.add(m); return m; },
    bar:function(x1, y1, z1, x2, y2, z2, r, col){ var a=new T.Vector3(x1,y1,z1), b=new T.Vector3(x2,y2,z2), len=a.distanceTo(b); var m=new T.Mesh(new T.CylinderGeometry(r||0.06, r||0.06, len, 10), mat(col||"#ffffff"));
      m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0), b.clone().sub(a).normalize()); root.add(m); return m; },
    // net: a see-through mesh panel from (x1,z) to (x2,z), bottom y0, top y1
    net:function(x1, x2, z, y0, y1, col, cell){ var w=Math.abs(x2-x1), h=y1-y0; var c=document.createElement("canvas"); c.width=c.height=64; var g=c.getContext("2d"); g.strokeStyle=col||"rgba(255,255,255,.85)"; g.lineWidth=3; g.strokeRect(0,0,64,64);
      var tex=new T.CanvasTexture(c); tex.wrapS=tex.wrapT=T.RepeatWrapping; tex.repeat.set(w/(cell||0.1), h/(cell||0.1));
      var m=new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({map:tex, transparent:true, side:T.DoubleSide, depthWrite:false})); m.position.set((x1+x2)/2, y0+h/2, z); root.add(m);
      K.bar(x1, y1, z, x2, y1, z, 0.02, "#ffffff"); return m; },
    goal:function(z, w, h, d, dir){ var s=dir||1; K.post(-w/2, z, h, 0.06); K.post(w/2, z, h, 0.06); K.bar(-w/2, h, z, w/2, h, z, 0.06);
      var back=K.net(-w/2, w/2, z+s*d, 0, h*0.8, "rgba(255,255,255,.6)", 0.15); var side1=new T.Mesh(new T.PlaneGeometry(d, h), back.material); side1.rotation.y=PI/2; side1.position.set(-w/2, h/2, z+s*d/2); root.add(side1);
      var side2=side1.clone(); side2.position.x=w/2; root.add(side2); var topn=new T.Mesh(new T.PlaneGeometry(w, d), back.material); topn.rotation.x=PI/2; topn.position.set(0, h, z+s*d/2); root.add(topn); },
    label:function(text, x, y, z, size, col){ var s=sprite(text, col); s.position.set(x, y, z); s.scale.multiplyScalar(size||1); root.add(s); return s; },
    water:function(w, l, depth){ var m=new T.Mesh(new T.PlaneGeometry(w, l, 24, 48), new T.MeshPhongMaterial({color:0x2a9fd6, transparent:true, opacity:0.72, shininess:90})); m.rotation.x=-PI/2; m.position.y=-0.05; root.add(m);
      var fl=K.rect(w, l, "#7fd0f0", -(depth||2)); return m; }
  };
  return K;
}
function sprite(text, col, bg){ var c=document.createElement("canvas"), g=c.getContext("2d"); g.font="bold 40px sans-serif"; var w=Math.ceil(g.measureText(text).width)+28; c.width=w; c.height=60;
  g=c.getContext("2d"); g.font="bold 40px sans-serif"; g.fillStyle=bg||"rgba(1,42,32,.82)"; var r=14; g.beginPath(); g.moveTo(r,0); g.arcTo(w,0,w,60,r); g.arcTo(w,60,0,60,r); g.arcTo(0,60,0,0,r); g.arcTo(0,0,w,0,r); g.fill();
  g.fillStyle=col||"#CBFA1E"; g.textBaseline="middle"; g.fillText(text, 14, 32);
  var s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c), depthTest:false, transparent:true})); s.scale.set(w/60*0.9, 0.9, 1); s.renderOrder=10; return s; }
function ball(d, col, opts){ opts=opts||{}; var m=new T.Mesh(new T.SphereGeometry(d/2, 18, 12), mat(col||"#ffffff")); if(opts.seams){ var r=new T.Mesh(new T.TorusGeometry(d/2*1.001, d*0.025, 4, 24), mat(opts.seams)); m.add(r); var r2=r.clone(); r2.rotation.y=PI/2; m.add(r2); } return m; }

// ---------------- the stage (one renderer per open sport) ----------------
function Stage(box, sp){
  var w=box.clientWidth||360, h=box.clientHeight||300;
  var rnd=new T.WebGLRenderer({antialias:true, preserveDrawingBuffer:false}); rnd.domElement.dataset.ib3d="own"; rnd.setPixelRatio(Math.min(2, window.devicePixelRatio||1)); rnd.setSize(w, h);
  var cnv=rnd.domElement; cnv.className="spcv"; box.appendChild(cnv);
  var sc=new T.Scene(); sc.background=new T.Color(sp.sky||"#9fd4f0"); sc.fog=new T.Fog(sc.background, (sp.fog||[80])[0], (sp.fog||[0,260])[1]);
  sc.add(new T.HemisphereLight(0xffffff, 0x445544, 0.9)); var sun=new T.DirectionalLight(0xffffff, 0.75); sun.position.set(30, 60, 20); sc.add(sun);
  var cam=new T.PerspectiveCamera(45, w/h, sp.near||0.05, sp.far||600);
  var ground=new T.Mesh(new T.PlaneGeometry(sp.groundSize||300, sp.groundSize||300, Math.max(12, Math.round((sp.groundSize||300)/25)), Math.max(12, Math.round((sp.groundSize||300)/25))), mat(sp.ground||"#5b8f5a")); ground.rotation.x=-PI/2; ground.position.y=sp.groundY||-0.02; sc.add(ground);
  // 0.5.37: field and players live in one "world" group, so the Field tab can turn it 90° (length across the screen)
  var world=new T.Group(); sc.add(world);
  var field=new T.Group(); world.add(field); var K=Kit(field); var info=sp.field(K)||{};
  var dyn=new T.Group(); world.add(dyn);
  var camP=new T.Vector3(0, 30, 40), camA=new T.Vector3(), camPT=camP.clone(), camAT=camA.clone(), dead=false, fn=null, t0=performance.now(), last=t0, paused=false;
  var fitWL=null;
  function setCam(p, a, snap){ fitWL=null; camPT.set(p[0],p[1],p[2]); camAT.set(a[0],a[1],a[2]); if(snap){ camP.copy(camPT); camA.copy(camAT); } }
  // straight down over the whole field, distance chosen so the field fills the window (after the 90° turn its length runs across)
  function applyFit(snap){ if(!fitWL) return; var t=Math.tan(cam.fov*PI/360), a=cam.aspect||1, L=fitWL[1], W=fitWL[0], d=Math.max((W/2)/t, (L/2)/(t*a))*1.08;
    camPT.set(0, d, 0.001); camAT.set(0, 0, 0); if(snap){ camP.copy(camPT); camA.copy(camAT); } }
  setCam(sp.cam||[0,40,60], [0,0,0], true);
  var ro=window.ResizeObserver?new ResizeObserver(function(){ var W=box.clientWidth, Hh=box.clientHeight; if(W>10&&Hh>10){ rnd.setSize(W, Hh); cam.aspect=W/Hh; cam.updateProjectionMatrix(); applyFit(false); } }):null; if(ro) ro.observe(box);
  // ---- 0.5.37: the viewer can orbit (one finger), zoom (pinch / wheel), pan (two fingers) and reset (double tap or ⟲) on top of the scene's own camera
  var V={yaw:0, pitch:0, zoom:1, pan:new T.Vector3()}, ctlOn=true, ptr={}, g0=null, moved=false, lastTap=0;
  var rb=document.createElement("button"); rb.className="spReset"; rb.type="button"; rb.textContent="⟲"; rb.title="Reset view"; rb.style.display="none"; box.appendChild(rb);
  function isDefault(){ return Math.abs(V.yaw)<0.01 && Math.abs(V.pitch)<0.01 && Math.abs(V.zoom-1)<0.01 && V.pan.lengthSq()<0.0001; }
  function resetView(){ V.yaw=0; V.pitch=0; V.zoom=1; V.pan.set(0,0,0); rb.style.display="none"; }
  rb.onclick=function(e){ e.stopPropagation(); resetView(); };
  function changed(){ rb.style.display=isDefault()?"none":"flex"; }
  function pts(){ return Object.keys(ptr).map(function(k){ return ptr[k]; }); }
  cnv.addEventListener("pointerdown", function(e){ if(!ctlOn) return; try{ cnv.setPointerCapture(e.pointerId); }catch(x){} ptr[e.pointerId]={x:e.clientX, y:e.clientY}; var P=pts(); moved=false;
    if(P.length===2) g0={d:Math.hypot(P[0].x-P[1].x, P[0].y-P[1].y), mx:(P[0].x+P[1].x)/2, my:(P[0].y+P[1].y)/2, zoom:V.zoom, pan:V.pan.clone()}; else g0={x:e.clientX, y:e.clientY, yaw:V.yaw, pitch:V.pitch}; });
  cnv.addEventListener("pointermove", function(e){ if(!ctlOn || !ptr[e.pointerId]) return; ptr[e.pointerId]={x:e.clientX, y:e.clientY}; var P=pts();
    if(P.length>=2 && g0 && g0.d){ var d=Math.hypot(P[0].x-P[1].x, P[0].y-P[1].y), mx=(P[0].x+P[1].x)/2, my=(P[0].y+P[1].y)/2; V.zoom=clamp(g0.zoom*g0.d/Math.max(10,d), 0.12, 4);
      var r=camP.distanceTo(camA)*V.zoom, k=r*Math.tan(cam.fov*PI/360)*2/Math.max(100, cnv.clientHeight), right=new T.Vector3(), fwd=new T.Vector3();
      cam.getWorldDirection(fwd); right.crossVectors(fwd, cam.up).normalize(); fwd.y=0; if(fwd.lengthSq()<1e-6) fwd.set(0,0,-1).applyAxisAngle(new T.Vector3(0,1,0), Math.atan2(right.x, right.z)-PI/2); fwd.normalize();
      V.pan.copy(g0.pan).addScaledVector(right, -(mx-g0.mx)*k).addScaledVector(fwd, (my-g0.my)*k); moved=true; changed(); return; }
    if(P.length===1 && g0 && g0.x!=null){ var dx=e.clientX-g0.x, dy=e.clientY-g0.y; if(!moved && Math.hypot(dx,dy)<7) return; moved=true; V.yaw=g0.yaw-dx*0.008; V.pitch=clamp(g0.pitch-dy*0.006, -1.4, 1.4); changed(); } });
  function up(e){ if(!ptr[e.pointerId]) return; delete ptr[e.pointerId]; var P=pts();
    if(P.length===1){ g0={x:P[0].x, y:P[0].y, yaw:V.yaw, pitch:V.pitch}; } else if(!P.length){ if(!moved){ var n=performance.now(); if(n-lastTap<300){ resetView(); lastTap=0; } else lastTap=n; } } }
  cnv.addEventListener("pointerup", up); cnv.addEventListener("pointercancel", up);
  cnv.addEventListener("wheel", function(e){ if(!ctlOn) return; e.preventDefault(); V.zoom=clamp(V.zoom*(e.deltaY>0?1.12:0.89), 0.12, 4); changed(); }, {passive:false});
  var tv=new T.Vector3(), tp=new T.Vector3();
  function frame(now){ if(dead) return; if(!document.body.contains(cnv)){ dispose(); return; }
    var dt=Math.max(0, Math.min(0.05, (now-last)/1000)); last=now; var t=Math.max(0, (now-t0)/1000);
    if(fn && !paused) try{ fn(t, dt); }catch(e){ console.error(e); fn=null; }
    var k=1-Math.pow(0.0025, dt); camP.lerp(camPT, k); camA.lerp(camAT, k);
    // the scene's camera, then the viewer's orbit / zoom / pan on top
    tv.copy(camP).sub(camA); var r=tv.length()*V.zoom, th=Math.atan2(tv.x, tv.z)+V.yaw, ph=clamp(Math.acos(clamp(tv.y/Math.max(1e-6, tv.length()), -1, 1))-V.pitch, 0.03, 1.55);
    tp.copy(camA).add(V.pan); cam.position.set(tp.x+r*Math.sin(ph)*Math.sin(th), tp.y+r*Math.cos(ph), tp.z+r*Math.sin(ph)*Math.cos(th)); cam.lookAt(tp);
    rnd.render(sc, cam); requestAnimationFrame(frame); }
  function clear(){ while(dyn.children.length){ var c=dyn.children.pop(); c.traverse(function(x){ if(x.geometry) x.geometry.dispose(); if(x.material){ if(x.material.map) x.material.map.dispose(); x.material.dispose(); } }); } }
  function dispose(){ if(dead) return; dead=true; if(ro) ro.disconnect(); clear(); sc.traverse(function(x){ if(x.geometry) x.geometry.dispose(); if(x.material){ if(x.material.map) x.material.map.dispose(); x.material.dispose(); } }); try{ rnd.dispose(); rnd.forceContextLoss(); }catch(e){} if(cnv.parentNode) cnv.parentNode.removeChild(cnv); }
  requestAnimationFrame(frame);
  var ray=new T.Raycaster(), nd=new T.Vector2();
  return {T:T, sc:sc, cam:cam, cnv:cnv, field:field, dyn:dyn, info:info, K:K, world:world,
    turn:function(a){ world.rotation.y=a||0; }, fitTop:function(w, l){ fitWL=[w, l]; applyFit(true); },
    controls:function(on){ ctlOn=!!on; if(!on){ ptr={}; g0=null; } }, resetView:resetView, dragged:function(){ return moved; },
    setCam:setCam, run:function(f){ fn=f; t0=performance.now(); }, clear:clear, dispose:dispose, pause:function(p){ paused=p; },
    add:function(o){ dyn.add(o); return o; },
    body:function(Hm, o){ var b=body(Hm, o); dyn.add(b); return b; }, ball:function(d, c, o){ var b=ball(d, c, o); dyn.add(b); return b; },
    label:function(text, x, y, z, s, c){ var sp2=sprite(text, c); sp2.position.set(x, y, z); if(s) sp2.scale.multiplyScalar(s); dyn.add(sp2); return sp2; },
    pick:function(e, objs){ var r=cnv.getBoundingClientRect(); nd.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1); ray.setFromCamera(nd, cam); return ray.intersectObjects(objs, true)[0]||null; },
    alive:function(){ return !dead; }};
}

// ---------------- helpers for card scenes and games ----------------
function U(st){ return {
  // walk/run a body from (x0,z0) to (x1,z1) over p 0..1, facing the way it moves
  mv:function(b, x0, z0, x1, z1, p, nm){ var q=ease(p); b.position.x=lerp(x0,x1,q); b.position.z=lerp(z0,z1,q); var mv=p>0&&p<1&&(x0!==x1||z0!==z1); if(mv) b.rotation.y=Math.atan2(x1-x0, z1-z0); pose(b, mv?(nm||"run"):"idle", (performance.now()/1000*1.6)%1); },
  face:function(b, x, z){ b.rotation.y=Math.atan2(x-b.position.x, z-b.position.z); },
  // ball along a parabola from a to b (arrays [x,y,z]) with peak height hgt, p 0..1
  arc:function(o, a, b, hgt, p){ var q=clamp(p,0,1); o.position.set(lerp(a[0],b[0],q), lerp(a[1],b[1],q)+Math.sin(q*PI)*(hgt||0), lerp(a[2],b[2],q)); o.rotation.x+=0.2; },
  strip:function(x1, z1, x2, z2, w, col, y){ var dx=x2-x1, dz=z2-z1, len=Math.sqrt(dx*dx+dz*dz)||0.01; var m=new T.Mesh(new T.PlaneGeometry(w||0.15, len), new T.MeshBasicMaterial({color:new T.Color(col||"#CBFA1E"), transparent:true, opacity:0.85, side:T.DoubleSide, depthWrite:false})); m.rotation.x=-PI/2; m.rotation.z=-Math.atan2(dx, dz); m.position.set((x1+x2)/2, y||0.03, (z1+z2)/2); st.add(m); return m; },
  zone:function(x1, z1, x2, z2, col, op){ var m=new T.Mesh(new T.PlaneGeometry(Math.abs(x2-x1), Math.abs(z2-z1)), new T.MeshBasicMaterial({color:new T.Color(col||"#CBFA1E"), transparent:true, opacity:op||0.3, depthWrite:false, side:T.DoubleSide})); m.rotation.x=-PI/2; m.position.set((x1+x2)/2, 0.025, (z1+z2)/2); st.add(m); return m; },
  card:function(b, col){ var m=new T.Mesh(new T.BoxGeometry(0.08, 0.11, 0.006), new T.MeshBasicMaterial({color:new T.Color(col)})); m.position.set(0, -0.31, 0.03); b.userData.J.elR.add(m); return m; },
  show:function(o, on){ if(o) o.visible=!!on; },
  T:T
}; }
// ---------------- page ----------------
var D=null, cur=null, st=null, tab="rules", card=0, el0=null, qz=null, gameOn=null;
function team(i){ return [{top:"#f1efe9", pants:"#1f3b5c"},{top:"#c0392b", pants:"#2b2f3a"},{top:"#2e7d5b", pants:"#e9e6df"},{top:"#f2c94c", pants:"#2b2f3a"}][i%4]; }
function S0(){ return st; }
function view(el, h){ H=h; L2=h.L2x; E=h.esc; TT(); el0=el; D=ld(); D.done=D.done||{};
  if(!document.getElementById("spCss")){ var lk=document.createElement("link"); lk.id="spCss"; lk.rel="stylesheet"; lk.href="sport/sport.css"; document.head.appendChild(lk); }
  if(D.open){ var o=D.open; delete D.open; sv(D); open(o); return; }
  if(cur && SPORTS[cur]) { page(); return; }
  list(); }
function list(){ cur=null; if(st){ st.dispose(); st=null; } if(el0){ el0.removeAttribute("data-lv4"); el0._pager=null; }
  var td=SportList.today(), done=D.done||{};
  var h='<div class="card sphero" data-spo="'+td[0]+'"><div class="mut tiny">🏅 '+L2("Sukan hari ini","Sport of the day")+'</div><div class="sphb"><span class="spic">'+td[1]+'</span><div><b>'+E(L2(td[2],td[3]))+'</b><div class="mut small">'+L2("Peraturan, padang 3D, kuiz & permainan","Rules, 3D field, quiz & a game")+'</div></div></div></div>';
  h+='<div class="spgrid">'+SportList.LIST.map(function(s){ var d=done[s[0]]||{}, pr=s[4]?Math.round(((d.cards||0)/10*0.6+(d.quiz?0.2:0)+(d.best!=null?0.2:0))*100):0;
    return '<button class="spc'+(s[4]?"":" off")+'" '+(s[4]?'data-spo="'+s[0]+'"':'disabled')+'><span class="spic">'+s[1]+'</span><b>'+E(L2(s[2],s[3]))+'</b>'+
      (s[5]==="sunnah"?'<i class="spbd">🕌 '+L2("Sunnah","Sunnah")+'</i>':s[5]==="my"?'<i class="spbd">🇲🇾</i>':'')+
      (s[4]?'<span class="sppr"><i style="width:'+pr+'%"></i></span>':'<span class="mut tiny">'+L2("Akan datang","Coming soon")+'</span>')+'</button>'; }).join("")+'</div>'+
    '<div class="mut tiny" style="margin:8px 4px">'+L2("Padang, gelanggang dan pemain dilukis mengikut skala sebenar (1 unit = 1 meter). Peraturan setakat 2026.","Fields, courts and players are drawn to real scale (1 unit = 1 metre). Rules as of 2026.")+'</div>';
  el0.innerHTML=h; el0.querySelectorAll("[data-spo]").forEach(function(b){ b.onclick=function(){ open(b.getAttribute("data-spo")); }; }); }
// 0.5.37: back (the ‹ button and the phone's Back) steps to the previous page inside Sports: card → tab → sport → list
var hist=[];
function push(){ var k={sp:cur, tab:tab, card:card}, l=hist[hist.length-1]; if(l && l.sp===k.sp && l.tab===k.tab && l.card===k.card) return; hist.push(k); if(hist.length>60) hist.shift(); }
function back(){ if(!el0 || !document.body.contains(el0)) return false; if(!cur){ hist=[]; return false; }
  // 0.5.44 (owner): ‹ Sports and the phone's Back go straight to the sports list from any tab or card
  hist=[]; var p=null;
  if(!p || !p.sp){ hist=[]; list(); var v=document.getElementById("view"); if(v) v.scrollTop=0; return true; }
  if(p.sp!==cur){ cur=p.sp; tab=p.tab; card=p.card; H.loadJs(["sport/sports/"+cur+".js"], function(){ if(document.body.contains(el0)) page(); }); return true; }
  var re=p.tab!==tab; tab=p.tab; card=p.card; if(re) el0.querySelectorAll("[data-spt]").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-spt")===tab); }); show(); return true; }
function open(id){ var s=SportList.find(id); if(!s||!s[4]) return; if(!cur) hist=[{sp:null}]; cur=id; tab="rules"; card=0; push();
  if(SPORTS[id]){ page(); return; }
  el0.innerHTML='<div class="card mut">'+L2("Memuatkan…","Loading…")+'</div>';
  H.loadJs(["sport/sports/"+id+".js"], function(){ if(document.body.contains(el0)) page(); }, function(){ el0.innerHTML='<div class="card">'+L2("Gagal dimuatkan","Could not load")+'</div>'; }); }
function page(){ var sp=SPORTS[cur], s=SportList.find(cur); if(st){ st.dispose(); st=null; } gameOn=null;
  el0.innerHTML='<div class="sphead"><button class="chip" id="spBack">‹ '+L2("Sukan","Sports")+'</button><b>'+s[1]+' '+E(L2(s[2],s[3]))+'</b>'+(s[5]==="sunnah"?'<i class="spbd">🕌</i>':'')+'</div>'+
    '<div class="spbox noswipe" id="spBox"><div class="sphud" id="spHud"></div></div>'+
    '<div class="sptabs">'+[["rules","📜",L2("Peraturan","Rules")],["field","🗺️",L2("Padang","Field")],["quiz","❓",L2("Kuiz","Quiz")],["play","🎮",L2("Main","Play")]].map(function(x){ return '<button class="chip'+(tab===x[0]?" on":"")+'" data-spt="'+x[0]+'">'+x[1]+' '+x[2]+'</button>'; }).join("")+'</div>'+
    '<div id="spBody"></div>';
  el0.querySelector("#spBack").onclick=function(){ back(); };
  el0.querySelectorAll("[data-spt]").forEach(function(b){ b.onclick=function(){ if(tab===b.getAttribute("data-spt")) return; tab=b.getAttribute("data-spt"); push(); el0.querySelectorAll("[data-spt]").forEach(function(x){ x.classList.toggle("on", x===b); }); show(); }; });
  // 0.5.36: inside a sport, a finger swipe (and the ◀ ▶ side arrows) steps Rules · Field · Quiz · Play (level 4), not Cardio · Travel · Sports
  var TABS=["rules","field","quiz","play"]; el0.setAttribute("data-lv4","1");
  el0._pager={lv3:true, can:function(sg){ var i=TABS.indexOf(tab); return sg<0 ? i<TABS.length-1 : i>0; }, go:function(sg){ var i=TABS.indexOf(tab)+(sg<0?1:-1); if(i<0||i>=TABS.length) return; var b=el0.querySelector('[data-spt="'+TABS[i]+'"]'); if(b) b.click(); if(window.ibArr) setTimeout(window.ibArr, 60); }};
  var box=el0.querySelector("#spBox"); try{ st=Stage(box, sp); window.__spStage=st; }catch(e){ console.error(e); box.innerHTML='<div class="mut small" style="padding:20px">'+L2("3D tidak disokong pada peranti ini.","3D is not supported on this device.")+'</div>'; st=null; }
  show(); }
// 0.5.36: the 3D window takes the free space: Rules and Play fill the screen above the bars, Quiz shrinks so it all fits, Field keeps its size and scrolls
var fitT=0, fitObs=null;
function barsTop(){ var b=window.innerHeight; [].slice.call(document.querySelectorAll("#view .dock:not(.dkTop), #subnav, #nav, #mini:not(.hidden)")).forEach(function(x){ if(!x.offsetHeight) return; var r=x.getBoundingClientRect().top; if(r>0 && r<b) b=r; }); return b; }
function fit(){ var box=el0&&el0.querySelector("#spBox"), b=el0&&el0.querySelector("#spBody"), v=document.getElementById("view"); if(!box||!b||!v||!document.body.contains(box)) return;
  if(tab==="field"){ box.style.height=""; return; }
  var vr=v.getBoundingClientRect(), top=box.getBoundingClientRect().top+v.scrollTop-vr.top, rest=b.getBoundingClientRect().bottom-box.getBoundingClientRect().bottom;
  var avail=barsTop()-vr.top-top-rest-14, minH=tab==="quiz"?150:200, h=Math.max(minH, Math.round(avail));
  if(Math.abs((parseFloat(box.style.height)||box.clientHeight)-h)>2) box.style.height=h+"px"; }
function fitSoon(){ clearTimeout(fitT); fitT=setTimeout(fit, 40); }
window.addEventListener("resize", fitSoon);
function hud(html){ var h=el0&&el0.querySelector("#spHud"); if(h) h.innerHTML=html||""; }
function show(){ var sp=SPORTS[cur], b=el0.querySelector("#spBody"); hud(""); gameOn=null; if(st){ st.clear(); st.run(null); st.resetView(); st.turn(0); st.controls(true); }
  if(st && st.cnv) st.cnv.onpointerdown=st.cnv.onpointerup=st.cnv.onpointermove=null;
  if(tab==="rules") rules(sp, b); else if(tab==="field") fieldTab(sp, b); else if(tab==="quiz") quiz(sp, b); else play(sp, b);
  if(!fitObs && window.MutationObserver){ fitObs=new MutationObserver(fitSoon); } if(fitObs){ fitObs.disconnect(); fitObs.observe(b, {childList:true, subtree:true, characterData:true}); }
  fitSoon(); setTimeout(fit, 300); }
// ---- rules: 10 cards, each with its own animated scene ----
function rules(sp, b){ var n=sp.cards.length; card=clamp(card, 0, n-1); var c=sp.cards[card];
  b.innerHTML='<div class="card spcard"><div class="spcn">'+(card+1)+' / '+n+'</div><h3>'+E(tx(c.t))+'</h3><p>'+E(tx(c.x))+'</p>'+
    '<div class="spnav"><button class="chip" id="spPrev"'+(card?'':' disabled')+'>‹ '+L2("Sebelum","Previous")+'</button><span class="spdots">'+sp.cards.map(function(_,i){ return '<i class="'+(i===card?"on":i<((D.done[cur]||{}).cards||0)?"seen":"")+'"></i>'; }).join("")+'</span><button class="chip" id="spNext"'+(card<n-1?'':' disabled')+'>'+L2("Seterusnya","Next")+' ›</button></div></div>'+
    (sp.v?'<div class="mut tiny" style="margin:4px 6px">'+L2("Peraturan setakat ","Rules as of ")+sp.v+'. '+L2("Sukan sebenar diadili oleh badan induk rasmi.","Real matches follow the official governing body.")+'</div>':'');
  var d=D.done[cur]=D.done[cur]||{}; d.cards=Math.max(d.cards||0, card+1); sv(D);
  b.querySelector("#spPrev").onclick=function(){ card--; push(); show(); }; b.querySelector("#spNext").onclick=function(){ card++; push(); show(); };
  if(!st) return; var S={st:st, sp:sp, T:T, u:U(st), pose:pose, place:place, team:team, lerp:lerp, ease:ease, seg:seg, clamp:clamp, tx:tx, L2:L2, H:sp.H||1.78};
  if(c.cam) st.setCam(c.cam[0], c.cam[1]); var stt=c.set?c.set(S)||{}:{}; var dur=c.dur||4;
  st.run(function(t){ if(c.at) c.at(S, stt, (t%dur)/dur, t%dur); }); }
// ---- field: tap a zone ----
function fieldTab(sp, b){ b.innerHTML='<div class="card"><div class="mut small" id="spZi">'+L2("Ketik kawasan pada padang untuk melihat namanya.","Tap an area of the field to see its name.")+'</div><div class="chips spzc">'+(sp.zones||[]).map(function(z,i){ return '<button class="chip" data-spz="'+i+'">'+E(tx(z.n))+'</button>'; }).join("")+'</div></div>'+
    (sp.facts?'<div class="card"><h3>📐 '+L2("Ukuran sebenar","Real sizes")+'</h3><table class="sptab">'+sp.facts.map(function(f){ return '<tr><td>'+E(tx(f[0]))+'</td><td><b>'+E(f[1])+'</b></td></tr>'; }).join("")+'</table></div>':'');
  if(!st) return; st.turn(PI/2); var inf=st.info||{}; if(inf.w && inf.l) st.fitTop(inf.w+2, inf.l+2); else st.setCam(sp.top||[0,70,0.1], [0,0,0]);
  var Z=(sp.zones||[]).map(function(z){ var sh=new T.Shape(); z.p.forEach(function(q,i){ if(i) sh.lineTo(q[0], -q[1]); else sh.moveTo(q[0], -q[1]); });
    var m=new T.Mesh(new T.ShapeGeometry(sh), new T.MeshBasicMaterial({color:0xCBFA1E, transparent:true, opacity:0, depthWrite:false, side:T.DoubleSide})); m.rotation.x=-PI/2; m.position.y=(sp.zoneY||0)+0.03; m.userData.z=z; st.add(m); return m; });
  function sel(i){ Z.forEach(function(m,k){ m.material.opacity=k===i?0.45:0; }); var z=sp.zones[i]; b.querySelector("#spZi").innerHTML='<b>'+E(tx(z.n))+'</b><br>'+E(tx(z.d));
    b.querySelectorAll("[data-spz]").forEach(function(x){ x.classList.toggle("on", +x.getAttribute("data-spz")===i); }); }
  st.cnv.onpointerup=function(e){ if(st.dragged()) return; var hit=st.pick(e, Z); if(hit) sel(Z.indexOf(hit.object)); };
  b.querySelectorAll("[data-spz]").forEach(function(x){ x.onclick=function(){ sel(+x.getAttribute("data-spz")); }; });
  if(sp.fieldScene){ var S={st:st, sp:sp, T:T, u:U(st), pose:pose, place:place, team:team, H:sp.H||1.78}; sp.fieldScene(S); } }
// ---- quiz: 5 questions ----
function quiz(sp, b){ qz={i:0, ok:0, ans:null}; if(st){ st.setCam(sp.cam||[0,40,60],[0,0,0]); var a0=0; st.run(function(t){ var r=Math.hypot(sp.cam[0]||0.1, sp.cam[2]||60); st.setCam([Math.sin(t*0.15)*r, sp.cam[1], Math.cos(t*0.15)*r],[0,0,0]); }); }
  function q(){ var Q=sp.quiz[qz.i]; if(!Q){ var d=D.done[cur]=D.done[cur]||{}; d.quiz=Math.max(d.quiz||0, qz.ok); sv(D);
      b.innerHTML='<div class="card spq"><h3>'+(qz.ok>=4?"🏆 ":"")+L2("Markah","Score")+': '+qz.ok+' / '+sp.quiz.length+'</h3><p class="mut">'+(qz.ok===sp.quiz.length?L2("Sempurna! Anda faham peraturannya.","Perfect! You know the rules."):L2("Ulang kad peraturan dan cuba lagi.","Look at the rule cards again and try once more."))+'</p><button class="btn" id="spQr">'+L2("Cuba lagi","Try again")+'</button></div>';
      b.querySelector("#spQr").onclick=function(){ quiz(sp, b); }; return; }
    b.innerHTML='<div class="card spq"><div class="spcn">'+(qz.i+1)+' / '+sp.quiz.length+'</div><h3>'+E(tx(Q.q))+'</h3>'+Q.a.map(function(a,i){ return '<button class="spqa'+(qz.ans==null?"":i===Q.ok?" ok":i===qz.ans?" no":"")+'" data-spa="'+i+'"'+(qz.ans==null?"":" disabled")+'>'+E(tx(a))+'</button>'; }).join("")+
      (qz.ans==null?'':'<p class="small">'+(qz.ans===Q.ok?"✅ ":"❌ ")+E(tx(Q.why||""))+'</p><button class="btn" id="spQn">'+L2("Seterusnya","Next")+' ›</button>')+'</div>';
    b.querySelectorAll("[data-spa]").forEach(function(x){ x.onclick=function(){ qz.ans=+x.getAttribute("data-spa"); if(qz.ans===Q.ok) qz.ok++; q(); }; });
    var nx=b.querySelector("#spQn"); if(nx) nx.onclick=function(){ qz.i++; qz.ans=null; q(); }; }
  q(); }
// ---- play: the sport's mini game ----
function play(sp, b){ var g=sp.game, d=D.done[cur]=D.done[cur]||{};
  b.innerHTML='<div class="card"><h3>🎮 '+E(tx(g.name))+'</h3><p class="small">'+E(tx(g.help))+'</p><div class="spbest">'+L2("Terbaik","Best")+': <b id="spBest">'+(d.best!=null?d.best+(g.unit?" "+tx(g.unit):""):"—")+'</b></div><button class="btn" id="spGo">▶ '+L2("Mula","Start")+'</button></div>';
  if(!st) return; st.setCam(g.cam||sp.cam, g.at||[0,0,0], true);
  var G=null;
  function start(){ st.clear(); var S={st:st, sp:sp, T:T, u:U(st), pose:pose, place:place, team:team, lerp:lerp, ease:ease, seg:seg, clamp:clamp, tx:tx, L2:L2, H:sp.H||1.78, hud:hud, vib:function(ms){ try{ if(H.N && H.N.vibrate) H.N.vibrate(ms||20); }catch(e){} }};
    G={S:S, score:0, over:false, end:function(score, msg){ G.over=true; if(st) st.controls(true); var better=g.lower?(d.best==null||score<d.best):(d.best==null||score>d.best); if(better){ d.best=score; sv(D); }
        hud('<div class="sphb2"><b>'+E(msg||"")+'</b>'+(better?'<div>⭐ '+L2("Rekod baharu!","New best!")+'</div>':'')+'<button class="btn" id="spAgain">'+L2("Main lagi","Play again")+'</button></div>');
        var bb=el0.querySelector("#spBest"); if(bb) bb.textContent=(d.best!=null?d.best+(g.unit?" "+tx(g.unit):""):"—"); var ag=el0.querySelector("#spAgain"); if(ag) ag.onclick=start; }};
    gameOn=G; st.resetView(); st.controls(false); g.start(G); var last=null;
    st.run(function(t, dt){ if(G!==gameOn) return; if(!G.over) g.step(G, dt, t); });
    var down=null;
    st.cnv.onpointerdown=function(e){ if(G.over) return; down={x:e.clientX, y:e.clientY, t:performance.now()}; if(g.press) g.press(G, e); };
    st.cnv.onpointerup=function(e){ if(G.over||!down) return; var r=st.cnv.getBoundingClientRect(), dx=(e.clientX-down.x)/r.width, dy=(e.clientY-down.y)/r.height, dtm=(performance.now()-down.t)/1000; down=null;
      if(Math.hypot(dx,dy)>0.06 && g.swipe) g.swipe(G, dx, dy, dtm); else if(g.tap) g.tap(G, e, dtm); };
    hud(''); }
  b.querySelector("#spGo").onclick=function(){ start(); window.scrollTo(0,0); var v=document.getElementById("view"); if(v) v.scrollTop=0; }; }
// ---- 0.5.37 shared timing-rally game for racket sports (tennis, table tennis, pickleball, padel) ----
// cfg: name, help, cam, at, me [x,z], op [x,z], ball(S), gear(S, body), win, inPath(G) / outPath(G, aim) -> {pts:[[x,y,z],...], hs:[arc heights], d:seconds},
//      ai(G, aim) -> chance the computer misses, icon, lbl {me, op}
function rally(cfg){ var gm={name:cfg.name, help:cfg.help, unit:["mata","pts"], cam:cfg.cam, at:cfg.at,
  start:function(G){ var S=G.S; G.me=S.st.body(S.H, S.team(0)); G.op=S.st.body(S.H, S.team(1)); if(cfg.gear){ cfg.gear(S, G.me); cfg.gear(S, G.op); }
    S.place(G.me, cfg.me[0], cfg.me[1], 0); S.place(G.op, cfg.op[0], cfg.op[1], PI); G.b=cfg.ball(S); G.my=0; G.ai=0; G.rally=0; G.sw=0; G.op.userData.sw=0;
    G.ring=S.u.strip(-0.35, 0, 0.35, 0, 0.7, "#CBFA1E", 1); G.ring.rotation.x=0; G.ring.material.opacity=0.3;
    G.hu=function(msg){ S.hud((cfg.icon||"🎾")+' '+S.L2("Anda","You")+' '+G.my+' – '+G.ai+' '+S.L2("Komputer","Computer")+(msg?'  ·  '+msg:'')); };
    G.go=function(f){ G.fly=f; G.t=0; }; G.serve=function(){ G.rally=0; G.go(Object.assign(cfg.inPath(G), {me:true})); }; G.serve(); G.hu(); },
  step:function(G, dt){ var S=G.S, f=G.fly; S.pose(G.me, G.sw>0?"swing":"ready", 1-G.sw); S.pose(G.op, G.op.userData.sw>0?"swing":"ready", 1-G.op.userData.sw); G.sw=Math.max(0, G.sw-dt*2.5); G.op.userData.sw=Math.max(0, G.op.userData.sw-dt*2.5);
    if(!f) return; G.t+=dt/f.d; var n=f.pts.length-1, u=Math.min(1.25, G.t), k=Math.min(n-1, Math.floor(Math.min(u, 0.9999)*n)), q=u*n-k, a=f.pts[k], b=f.pts[k+1];
    if(u<=1) S.u.arc(G.b, a, b, f.hs[k]||0, q); else { G.b.position.y-=dt*4; G.b.position.z+=(b[2]-a[2])*dt*0.6; }
    var e=f.pts[n]; if(f.me){ G.ring.position.set(e[0], e[1], e[2]); G.ring.material.opacity=(u>0.8&&u<1.05)?0.8:0.25; } else G.ring.material.opacity=0;
    if(u>=1 && !f.me){ G.fly=null; var aim=f.aim||0; if(Math.random()<cfg.ai(G, aim)){ G.my++; S.vib(30); G.hu(S.L2("Mata anda!","Your point!")); G.next(); } else { G.op.userData.sw=1; G.go(Object.assign(cfg.inPath(G), {me:true})); } }
    else if(u>=1.25 && f.me){ G.fly=null; G.ai++; S.vib(70); G.hu(S.L2("Terlepas!","Missed!")); G.next(); } },
  tap:function(G){ G.hit(0); }, swipe:function(G, dx){ G.hit(dx<-0.04?-1:dx>0.04?1:0); } };
  var st0=gm.start; gm.start=function(G){ st0(G); var S=G.S;
    G.next=function(){ if(G.my>=cfg.win || G.ai>=cfg.win){ return G.end(G.my, (G.my>G.ai?"🏆 ":"")+S.L2("Anda ","You ")+G.my+" – "+G.ai); } setTimeout(function(){ if(!G.over) G.serve(); }, 700); };
    G.hit=function(aim){ var f=G.fly; if(!f||!f.me) return; if(G.t>0.78 && G.t<1.06){ G.sw=1; G.rally++; S.vib(20); G.go(Object.assign(cfg.outPath(G, aim), {me:false, aim:aim})); G.hu(G.rally>1?G.rally+"×":""); } else G.hu(S.L2("Terlalu awal / lewat","Too early / late")); }; };
  return gm; }
return {view:view, list:list, body:body, pose:pose, sprite:sprite, R:R, back:back, rally:rally, active:function(){ return !!(el0 && document.body.contains(el0) && cur); },
  navGet:function(){ return {sp:cur, tab:tab, card:card}; }, navSet:function(o){ cur=o.sp||null; tab=o.tab||"rules"; card=o.card||0; }};
})();
