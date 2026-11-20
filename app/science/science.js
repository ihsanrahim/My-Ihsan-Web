/* My Ihsan 0.5.70: Learn › Science. One page per field: a shaded three.js scene (orbit, zoom, pan, ⟲, ⛶ come from IB3D in app.js),
   the full study (what, who, when, where, how, with, why, contribution, today), a practice tool and a 3-question check.
   Progress: localStorage ihsan_sci {q:{id:best}, alg:{n,ok}, cip:{n}}. */
window.SciView = (function(){
var H = null, T = null, en = false, run = null;
function L(a, b){ return en ? b : a; }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function st(){ var s = H.load("ihsan_sci", {}) || {}; s.q = s.q || {}; s.alg = s.alg || {n:0, ok:0}; s.cip = s.cip || {n:0}; return s; }
function sv(s){ H.save("ihsan_sci", s); }
function F(id){ return (window.SCI_FIELDS||[]).filter(function(f){ return f.id===id; })[0]; }

// ---------------- 3D ----------------
function std(c, o){ return new T.MeshStandardMaterial(Object.assign({color:c, roughness:0.55, metalness:0.08}, o||{})); }
function mesh(g, m, x, y, z, sh){ var k = new T.Mesh(g, m); k.position.set(x||0, y||0, z||0); k.castShadow = sh!==false; k.receiveShadow = true; return k; }
function label(txt, col, size){ var c = document.createElement("canvas"), s = 256; c.width = s; c.height = s/2; var g = c.getContext("2d");
  g.fillStyle = "rgba(0,0,0,0)"; g.fillRect(0, 0, s, s/2); g.font = "bold "+(size||54)+"px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineWidth = 8; g.strokeStyle = "rgba(0,0,0,.6)"; g.strokeText(txt, s/2, s/4); g.fillStyle = col||"#fff"; g.fillText(txt, s/2, s/4);
  var sp = new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c), transparent:true, depthWrite:false})); sp.scale.set(1.6, 0.8, 1); return sp; }
function stage(box, f){
  var w = box.clientWidth || 360, h = Math.round(Math.min(420, Math.max(240, w*0.72)));
  var r = new T.WebGLRenderer({antialias:true, alpha:false}); r.setPixelRatio(Math.min(2, window.devicePixelRatio||1)); r.setSize(w, h);
  r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap; r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  box.appendChild(r.domElement);
  var sc = new T.Scene(), top = new T.Color(f.c[0]), bot = new T.Color(f.c[1]);
  var cv = document.createElement("canvas"); cv.width = 2; cv.height = 256; var g = cv.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#"+top.getHexString()); gr.addColorStop(1, "#"+bot.clone().lerp(new T.Color("#ffffff"), 0.35).getHexString()); g.fillStyle = gr; g.fillRect(0, 0, 2, 256);
  sc.background = new T.CanvasTexture(cv); sc.fog = new T.Fog(bot.clone().lerp(new T.Color("#ffffff"), 0.3), 18, 46);
  var cam = new T.PerspectiveCamera(42, w/h, 0.1, 200); cam.position.set(0, 4.2, 9.5); cam.lookAt(0, 1.2, 0);
  sc.add(new T.HemisphereLight(0xffffff, new T.Color(f.c[0]), 0.9));
  var sun = new T.DirectionalLight(0xfff2dd, 2.1); sun.position.set(5, 9, 6); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  var sc2 = sun.shadow.camera; sc2.left = -8; sc2.right = 8; sc2.top = 8; sc2.bottom = -8; sc2.near = 1; sc2.far = 30; sun.shadow.bias = -0.0008; sc.add(sun);
  var fill = new T.PointLight(new T.Color(f.c[2]), 0.6, 30); fill.position.set(-5, 4, 3); sc.add(fill);
  var ground = mesh(new T.CircleGeometry(9, 64), std(new T.Color(f.c[0]).lerp(new T.Color("#d9cfb8"), 0.55), {roughness:0.9}), 0, 0, 0, false); ground.rotation.x = -Math.PI/2; sc.add(ground);
  return {r:r, sc:sc, cam:cam, w:w, h:h};
}
var SC = {};
SC.balance = function(s, f){ var gold = std("#d4af37", {metalness:0.6, roughness:0.3}), wood = std("#7a4a24");
  s.sc.add(mesh(new T.CylinderGeometry(0.15, 0.25, 3, 24), gold, 0, 1.5, 0)); s.sc.add(mesh(new T.CylinderGeometry(0.9, 1.1, 0.25, 32), wood, 0, 0.12, 0));
  var beam = new T.Group(); beam.position.y = 3; s.sc.add(beam); beam.add(mesh(new T.BoxGeometry(5.4, 0.14, 0.18), gold, 0, 0, 0));
  var pans = [-2.5, 2.5].map(function(x){ var p = new T.Group(); p.position.set(x, 0, 0); beam.add(p);
    [[-0.5, 0.5], [0.5, 0.5], [0, -0.6]].forEach(function(q){ var rope = mesh(new T.CylinderGeometry(0.015, 0.015, 1.6, 6), std("#ddd"), q[0]*0.6, -0.8, q[1]*0.6); p.add(rope); });
    var pan = mesh(new T.CylinderGeometry(0.85, 0.65, 0.16, 32), gold, 0, -1.6, 0); p.add(pan); return p; });
  var blk = function(c, lb){ var m = mesh(new T.BoxGeometry(0.42, 0.42, 0.42), std(c, {roughness:0.35}), 0, 0, 0); var t = label(lb, "#fff", 70); t.position.y = 0.55; t.scale.set(0.9, 0.45, 1); m.add(t); return m; };
  // 2x + 3 = 7 → x = 2 : left pan holds x x 1 1 1, right pan holds 7 ones
  var L1 = [blk("#4f7bff","x"), blk("#4f7bff","x"), blk("#e0a33c","1"), blk("#e0a33c","1"), blk("#e0a33c","1")], R1 = []; for(var i=0;i<7;i++) R1.push(blk("#e0a33c","1"));
  L1.forEach(function(b, i){ b.position.set((i%3-1)*0.45, -1.3+Math.floor(i/3)*0.45, 0); pans[0].add(b); });
  R1.forEach(function(b, i){ b.position.set((i%4-1.5)*0.45, -1.3+Math.floor(i/4)*0.45, 0); pans[1].add(b); });
  var eq = label("2x + 3 = 7", "#ffe9a8", 64); eq.position.set(0, 5, 0); eq.scale.set(3.4, 1.7, 1); s.sc.add(eq);
  s.cam.position.set(0, 3.6, 9); s.cam.lookAt(0, 2.2, 0);
  return function(t){ var a = Math.sin(t*1.2)*0.06*Math.max(0, 1-(t%8)/6); beam.rotation.z = a; pans.forEach(function(p){ p.rotation.z = -a; }); };
};
SC.body = function(s, f){ var skin = std("#e8c5a0", {roughness:0.7, transparent:true, opacity:0.55}), g = new T.Group(); s.sc.add(g);
  g.add(mesh(new T.CapsuleGeometry(0.9, 1.8, 8, 24), skin, 0, 2.6, 0)); g.add(mesh(new T.SphereGeometry(0.62, 32, 24), skin, 0, 4.55, 0));
  [-1.2, 1.2].forEach(function(x){ var a = mesh(new T.CapsuleGeometry(0.24, 1.6, 6, 12), skin, x, 2.8, 0); a.rotation.z = x>0 ? 0.18 : -0.18; g.add(a); });
  [-0.45, 0.45].forEach(function(x){ g.add(mesh(new T.CapsuleGeometry(0.3, 1.5, 6, 12), skin, x, 0.9, 0)); });
  var heart = mesh(new T.SphereGeometry(0.26, 24, 18), std("#c0394b", {roughness:0.35, emissive:"#400010"}), 0.18, 3.05, 0.25);
  var lungs = [-0.42, 0.42].map(function(x){ var l = mesh(new T.SphereGeometry(0.36, 24, 18), std("#f08a9a", {roughness:0.5}), x, 3.1, 0.05); l.scale.set(0.8, 1.35, 0.7); g.add(l); return l; });
  g.add(heart); var hl = label(L("Jantung","Heart"), "#fff", 50); hl.position.set(0.9, 3.5, 0.4); g.add(hl); var ll = label(L("Paru-paru","Lungs"), "#fff", 50); ll.position.set(-1.1, 3.9, 0.3); g.add(ll);
  // blood path heart → lungs → heart (Ibn al-Nafis)
  var path = new T.CatmullRomCurve3([new T.Vector3(0.18, 3.05, 0.3), new T.Vector3(-0.3, 3.4, 0.35), new T.Vector3(-0.45, 3.0, 0.3), new T.Vector3(0, 2.8, 0.35), new T.Vector3(0.45, 3.0, 0.3), new T.Vector3(0.3, 3.4, 0.35), new T.Vector3(0.18, 3.05, 0.3)], true);
  g.add(mesh(new T.TubeGeometry(path, 80, 0.03, 8, true), std("#7a1020", {emissive:"#300"}), 0, 0, 0, false));
  var dots = []; for(var i=0;i<8;i++){ var d = mesh(new T.SphereGeometry(0.06, 10, 8), std("#ff3344", {emissive:"#ff2233", emissiveIntensity:0.8}), 0, 0, 0, false); g.add(d); dots.push(d); }
  s.cam.position.set(0, 3.4, 7.2); s.cam.lookAt(0, 2.8, 0);
  return function(t){ var b = 1+Math.max(0, Math.sin(t*6))*0.12; heart.scale.set(b, b, b); lungs.forEach(function(l){ var k = 1+Math.sin(t*1.6)*0.06; l.scale.set(0.8*k, 1.35*k, 0.7*k); });
    dots.forEach(function(d, i){ d.position.copy(path.getPoint(((t*0.18)+i/8)%1)); }); g.rotation.y = Math.sin(t*0.3)*0.35; };
};
SC.mortar = function(s, f){ var stone = std("#b9b2a6", {roughness:0.85}), wood = std("#6b4221");
  var prof = [], i; for(i=0;i<=12;i++){ var a = i/12; prof.push(new T.Vector2(0.4+Math.sin(a*Math.PI*0.5)*1.1, a*1.4)); } prof.push(new T.Vector2(1.38, 1.4)); for(i=12;i>=0;i--){ var b2 = i/12; prof.push(new T.Vector2(0.3+Math.sin(b2*Math.PI*0.5)*0.95, 0.2+b2*1.2)); }
  var m = mesh(new T.LatheGeometry(prof, 48), stone, 0, 0.05, 0); s.sc.add(m);
  var pe = mesh(new T.CapsuleGeometry(0.16, 1.9, 8, 16), wood, 0.25, 2.0, 0); pe.rotation.z = -0.5; s.sc.add(pe);
  var herbs = []; var leaf = new T.SphereGeometry(0.1, 8, 6); for(i=0;i<40;i++){ var hb = mesh(leaf, std(["#2f8f5b","#7aa02a","#c9e7a6","#8a5a2a"][i%4]), (Math.random()-0.5)*1.4, 1.1+Math.random()*0.3, (Math.random()-0.5)*1.4); hb.scale.set(1.4, 0.4, 0.8); s.sc.add(hb); herbs.push(hb); }
  [[-2.6, 0, -1, "#5a8f3a"], [2.6, 0, -1.2, "#b5476e"], [-2.2, 0, 1.5, "#e0a33c"]].forEach(function(p){ var jar = mesh(new T.CylinderGeometry(0.45, 0.4, 1.1, 24), std("#2a6f8f", {roughness:0.2, metalness:0.1, transparent:true, opacity:0.85}), p[0], 0.55, p[2]); s.sc.add(jar);
    s.sc.add(mesh(new T.SphereGeometry(0.38, 16, 12), std(p[3]), p[0], 0.5, p[2])); s.sc.add(mesh(new T.CylinderGeometry(0.3, 0.3, 0.2, 16), wood, p[0], 1.2, p[2])); });
  s.cam.position.set(0, 4, 6.5); s.cam.lookAt(0, 1, 0);
  return function(t){ pe.position.x = 0.25+Math.sin(t*3)*0.35; pe.position.z = Math.cos(t*3)*0.35; pe.rotation.z = -0.5+Math.sin(t*3)*0.1; herbs.forEach(function(h, k){ h.rotation.y = t*0.5+k; }); };
};
SC.optics = function(s, f, ctl){ var wall = std("#e8e0cc", {roughness:0.95}), dark = std("#2a2235", {roughness:0.9});
  var box = new T.Group(); s.sc.add(box);
  box.add(mesh(new T.BoxGeometry(0.15, 3, 3), dark, 0, 1.5, 0)); // wall with pinhole
  box.add(mesh(new T.BoxGeometry(0.1, 3, 3), wall, 3.2, 1.5, 0)); // screen
  box.add(mesh(new T.BoxGeometry(3.2, 0.1, 3), dark, 1.6, 3.0, 0, false)); box.add(mesh(new T.BoxGeometry(3.2, 3, 0.1), dark, 1.6, 1.5, -1.5));
  var hole = mesh(new T.CylinderGeometry(0.06, 0.06, 0.2, 12), std("#fff", {emissive:"#fff"}), 0, 1.5, 0); hole.rotation.z = Math.PI/2; box.add(hole);
  // candle (object) at the left
  var cand = new T.Group(); cand.position.set(-3, 0, 0); s.sc.add(cand); cand.add(mesh(new T.CylinderGeometry(0.18, 0.2, 1.4, 20), std("#f5efe0"), 0, 0.7, 0));
  var flame = mesh(new T.SphereGeometry(0.16, 16, 12), std("#ffb020", {emissive:"#ff9000", emissiveIntensity:1.6}), 0, 1.6, 0, false); flame.scale.set(0.8, 1.6, 0.8); cand.add(flame);
  var fl = new T.PointLight(0xffa040, 1.4, 8); fl.position.set(0, 1.7, 0.3); cand.add(fl);
  // rays: from top and bottom of the candle through the hole to the screen (crossed = upside down)
  var rayM = new T.LineBasicMaterial({color:0xffd56b}), ray = function(a, b){ var g = new T.BufferGeometry().setFromPoints([a, b]); var l = new T.Line(g, rayM); s.sc.add(l); return l; };
  ray(new T.Vector3(-3, 1.65, 0), new T.Vector3(3.15, 1.35, 0)); ray(new T.Vector3(-3, 0.1, 0), new T.Vector3(3.15, 2.85, 0));
  var img = mesh(new T.ConeGeometry(0.12, 0.5, 12), std("#ffb020", {emissive:"#ff9000", emissiveIntensity:1.2}), 3.12, 2.4, 0, false); img.rotation.z = Math.PI; s.sc.add(img);
  var il = label(L("imej terbalik","upside-down image"), "#ffe9a8", 40); il.position.set(3.2, 3.5, 0.6); s.sc.add(il);
  // mirror with an adjustable angle and its reflected ray
  var mir = mesh(new T.BoxGeometry(1.4, 0.06, 0.9), std("#cfe6ff", {metalness:0.9, roughness:0.08}), -1.2, 0.5, 2.2); s.sc.add(mir);
  var rg = new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3()]), rl = new T.Line(rg, new T.LineBasicMaterial({color:0x9fe3ff})); s.sc.add(rl);
  var ig = new T.BufferGeometry().setFromPoints([new T.Vector3(-3, 1.6, 0.2), new T.Vector3(-1.2, 0.5, 2.2)]), il2 = new T.Line(ig, new T.LineBasicMaterial({color:0xffd56b})); s.sc.add(il2);
  var setAng = function(deg){ mir.rotation.z = deg*Math.PI/180; var n = new T.Vector3(0, 1, 0).applyAxisAngle(new T.Vector3(0, 0, 1), mir.rotation.z), d = new T.Vector3(-1.2+3, 0.5-1.6, 2.2-0.2).normalize(), r = d.clone().sub(n.clone().multiplyScalar(2*d.dot(n)));
    rg.setFromPoints([new T.Vector3(-1.2, 0.5, 2.2), new T.Vector3(-1.2, 0.5, 2.2).add(r.multiplyScalar(4))]); };
  setAng(10); if(ctl) ctl.setAng = setAng;
  s.cam.position.set(-1, 5, 9); s.cam.lookAt(0.3, 1.3, 0.5);
  return function(t){ var k = 1+Math.sin(t*9)*0.08; flame.scale.set(0.8*k, 1.6*k, 0.8*k); fl.intensity = 1.3+Math.sin(t*11)*0.2; };
};
SC.globe = function(s, f, ctl){ var gr = new T.Group(); gr.position.y = 2.2; s.sc.add(gr);
  var tx = document.createElement("canvas"); tx.width = 512; tx.height = 256; var g = tx.getContext("2d"); g.fillStyle = "#1f6fa0"; g.fillRect(0, 0, 512, 256);
  g.fillStyle = "#d9c08a"; // rough land shapes (stylised)
  [[250,80,60,40],[290,120,40,60],[330,95,90,35],[400,110,50,40],[275,170,40,50],[130,80,60,50],[150,160,35,55],[440,175,35,20],[90,60,40,25]].forEach(function(b){ g.beginPath(); g.ellipse(b[0], b[1], b[2], b[3], 0, 0, Math.PI*2); g.fill(); });
  g.strokeStyle = "rgba(255,255,255,.25)"; for(var i=0;i<=8;i++){ g.beginPath(); g.moveTo(0, i*32); g.lineTo(512, i*32); g.stroke(); g.beginPath(); g.moveTo(i*64, 0); g.lineTo(i*64, 256); g.stroke(); }
  var tex = new T.CanvasTexture(tx); tex.colorSpace = T.SRGBColorSpace;
  var globe = mesh(new T.SphereGeometry(1.8, 64, 48), std("#ffffff", {map:tex, roughness:0.7}), 0, 0, 0); gr.add(globe);
  // trade route arcs between cities (lat, lon): Makkah, Baghdad, Cordoba, Palermo, Samarkand, Calicut, Melaka, Guangzhou, Timbuktu
  var C = [[21.4,39.8],[33.3,44.4],[37.9,-4.8],[38.1,13.4],[39.6,67],[11.2,75.8],[2.2,102.2],[23.1,113.3],[16.8,-3]];
  var v = function(la, lo, r){ var p = (90-la)*Math.PI/180, t = (lo+180)*Math.PI/180; return new T.Vector3(-r*Math.sin(p)*Math.cos(t), r*Math.cos(p), r*Math.sin(p)*Math.sin(t)); };
  C.forEach(function(c){ var d = mesh(new T.SphereGeometry(0.05, 10, 8), std("#ffd56b", {emissive:"#ffb000"}), 0, 0, 0, false); d.position.copy(v(c[0], c[1], 1.82)); globe.add(d); });
  [[0,1],[1,4],[1,0],[0,5],[5,6],[6,7],[2,3],[3,1],[8,2],[0,8]].forEach(function(p){ var a = v(C[p[0]][0], C[p[0]][1], 1.82), b = v(C[p[1]][0], C[p[1]][1], 1.82), mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(1.82+a.distanceTo(b)*0.25);
    var cu = new T.QuadraticBezierCurve3(a, mid, b); globe.add(mesh(new T.TubeGeometry(cu, 30, 0.012, 6, false), std("#ffe9a8", {emissive:"#c08000"}), 0, 0, 0, false)); });
  var ring = mesh(new T.TorusGeometry(2.1, 0.03, 8, 80), std("#d4af37", {metalness:0.7, roughness:0.3}), 0, 0, 0); ring.rotation.x = Math.PI/2; gr.add(ring);
  s.sc.add(mesh(new T.CylinderGeometry(0.08, 0.5, 0.4, 24), std("#7a4a24"), 0, 0.2, 0)); s.sc.add(mesh(new T.CylinderGeometry(0.04, 0.04, 0.4, 8), std("#d4af37"), 0, 0.5, 0));
  var flip = false; if(ctl) ctl.flip = function(){ flip = !flip; };
  s.cam.position.set(0, 3, 7.5); s.cam.lookAt(0, 2.2, 0);
  return function(t, dt){ globe.rotation.y += dt*0.25; gr.rotation.z += ((flip ? Math.PI : 0.41) - gr.rotation.z)*Math.min(1, dt*3); };
};
SC.clock = function(s, f){ var brass = std("#c9973a", {metalness:0.7, roughness:0.3}), wood = std("#6b4221"), water = std("#3a9ad9", {transparent:true, opacity:0.6, roughness:0.1});
  s.sc.add(mesh(new T.BoxGeometry(3.6, 0.3, 2), wood, 0, 0.15, 0));
  var tank = mesh(new T.CylinderGeometry(0.7, 0.7, 2, 32, 1, true), std("#9fd0ff", {transparent:true, opacity:0.3, side:T.DoubleSide}), -0.9, 1.3, 0); s.sc.add(tank);
  var wl = mesh(new T.CylinderGeometry(0.68, 0.68, 1, 32), water, -0.9, 0.8, 0, false); s.sc.add(wl);
  var flt = mesh(new T.CylinderGeometry(0.45, 0.45, 0.2, 24), brass, -0.9, 1.4, 0); s.sc.add(flt);
  s.sc.add(mesh(new T.CylinderGeometry(0.02, 0.02, 2.2, 6), std("#eee"), -0.9, 2.5, 0));
  var gear = function(r, n, x, y, z){ var g = new T.Group(); g.position.set(x, y, z); g.add(mesh(new T.CylinderGeometry(r, r, 0.14, 40), brass, 0, 0, 0)); for(var i=0;i<n;i++){ var a = i/n*Math.PI*2, tth = mesh(new T.BoxGeometry(0.12, 0.14, 0.16), brass, Math.cos(a)*(r+0.06), 0, Math.sin(a)*(r+0.06)); tth.rotation.y = -a; g.add(tth); } g.rotation.x = Math.PI/2; s.sc.add(g); return g; };
  var g1 = gear(0.6, 16, 0.6, 2.4, 0), g2 = gear(0.35, 10, 1.55, 2.4, 0), g3 = gear(0.45, 12, 1.0, 1.25, 0);
  var dial = mesh(new T.CylinderGeometry(0.9, 0.9, 0.08, 48), std("#f5efe0"), 0.6, 3.9, -0.6); dial.rotation.x = Math.PI/2; s.sc.add(dial);
  var hand = mesh(new T.BoxGeometry(0.06, 0.75, 0.04), std("#2a1a0a"), 0.6, 3.9, -0.54); hand.geometry.translate(0, 0.33, 0); s.sc.add(hand);
  var drops = []; for(var i=0;i<4;i++){ var d = mesh(new T.SphereGeometry(0.06, 10, 8), water, -0.9, 3, 0, false); s.sc.add(d); drops.push(d); }
  s.sc.add(mesh(new T.CylinderGeometry(0.15, 0.15, 0.3, 12), brass, -0.9, 3.4, 0));
  s.cam.position.set(1, 3.4, 7.2); s.cam.lookAt(0.3, 2, 0);
  return function(t){ var lv = (t*0.05)%1; wl.scale.y = 0.2+lv; wl.position.y = 0.3+wl.scale.y*0.5; flt.position.y = 0.35+wl.scale.y+0.1;
    g1.rotation.y = t*0.6; g2.rotation.y = -t*0.6*16/10; g3.rotation.y = -t*0.6*16/12; hand.rotation.z = -t*0.6;
    drops.forEach(function(d, k){ var p = (t*1.4+k/4)%1; d.position.y = 3.25-p*(3.25-(0.4+wl.scale.y)); d.visible = p<0.95; }); };
};
SC.noria = function(s, f){ var wood = std("#6b4221", {roughness:0.8}), water = std("#2a8fd0", {transparent:true, opacity:0.75, roughness:0.1, metalness:0.1});
  var river = mesh(new T.BoxGeometry(12, 0.1, 2.4), water, 0, 0.05, 1.2, false); s.sc.add(river);
  var wh = new T.Group(); wh.position.set(0, 2.4, 1.2); s.sc.add(wh); var R = 2.2;
  wh.add(mesh(new T.TorusGeometry(R, 0.08, 8, 64), wood, 0, 0, 0.35)); wh.add(mesh(new T.TorusGeometry(R, 0.08, 8, 64), wood, 0, 0, -0.35));
  for(var i=0;i<12;i++){ var a = i/12*Math.PI*2, sp = mesh(new T.BoxGeometry(0.08, R*2, 0.08), wood, 0, 0, 0.35); sp.rotation.z = a; wh.add(sp); var sp2 = sp.clone(); sp2.position.z = -0.35; wh.add(sp2);
    var pot = mesh(new T.CylinderGeometry(0.16, 0.12, 0.3, 12), std("#b5652e", {roughness:0.85}), Math.cos(a)*R, Math.sin(a)*R, 0); wh.add(pot);
    var pd = mesh(new T.BoxGeometry(0.5, 0.06, 0.7), wood, Math.cos(a)*(R+0.25), Math.sin(a)*(R+0.25), 0); pd.rotation.z = a; wh.add(pd); }
  var axle = mesh(new T.CylinderGeometry(0.2, 0.2, 1.2, 16), wood, 0, 0, 0); axle.rotation.x = Math.PI/2; wh.add(axle);
  // aqueduct channel at the top
  var aq = new T.Group(); s.sc.add(aq); [-0.6, -2, -3.4].forEach(function(x){ aq.add(mesh(new T.BoxGeometry(0.4, 4.4, 0.4), std("#c9b28a", {roughness:0.95}), x-0.2, 2.2, -0.2)); });
  aq.add(mesh(new T.BoxGeometry(4, 0.3, 0.7), std("#c9b28a", {roughness:0.95}), -2, 4.55, -0.2)); var flow = mesh(new T.BoxGeometry(3.8, 0.08, 0.5), water, -2, 4.72, -0.2, false); aq.add(flow);
  s.cam.position.set(4.5, 4, 8); s.cam.lookAt(-0.5, 2.4, 0.5);
  return function(t, dt){ wh.rotation.z -= dt*0.35; river.material.opacity = 0.7+Math.sin(t*2)*0.05; flow.scale.x = 0.95+Math.sin(t*3)*0.05; };
};
SC.farm = function(s, f, ctl){ var soil = std("#7a5530", {roughness:1}), grow = 0.6, plants = [];
  for(var tr=0; tr<4; tr++){ var y = tr*0.45, z = -tr*1.3+1.6; s.sc.add(mesh(new T.BoxGeometry(8, 0.45, 1.25), soil, 0, y+0.22, z));
    for(var i=0;i<12;i++){ var p = new T.Group(); p.position.set(-3.6+i*0.65, y+0.45, z); s.sc.add(p);
      var kind = tr%2===0 ? "wheat" : "tree";
      if(kind==="wheat"){ var st2 = mesh(new T.CylinderGeometry(0.03, 0.04, 1, 6), std("#9ab83a"), 0, 0.5, 0); p.add(st2); var hd = mesh(new T.CapsuleGeometry(0.07, 0.25, 4, 8), std("#e3c45a"), 0, 1.05, 0); p.add(hd); }
      else { p.add(mesh(new T.CylinderGeometry(0.05, 0.07, 0.6, 8), std("#6b4221"), 0, 0.3, 0)); var cr = mesh(new T.SphereGeometry(0.32, 14, 10), std("#3f8f3a"), 0, 0.75, 0); p.add(cr);
        for(var k=0;k<3;k++){ var fr = mesh(new T.SphereGeometry(0.06, 8, 6), std("#f0a020", {emissive:"#402000"}), Math.cos(k*2.1)*0.25, 0.75+Math.sin(k)*0.1, Math.sin(k*2.1)*0.25, false); p.add(fr); } }
      plants.push(p); } }
  var ch = mesh(new T.BoxGeometry(8.4, 0.08, 0.25), std("#2a8fd0", {transparent:true, opacity:0.8}), 0, 1.82, -2.35, false); s.sc.add(ch);
  var set = function(v){ grow = v; plants.forEach(function(p){ p.scale.setScalar(0.15+grow*0.95); }); }; set(0.6); if(ctl) ctl.grow = set;
  s.cam.position.set(0, 5, 8); s.cam.lookAt(0, 0.8, -0.5);
  return function(t){ plants.forEach(function(p, i){ p.rotation.z = Math.sin(t*1.5+i*0.4)*0.04; }); };
};
SC.still = function(s, f){ var glass = std("#cfefff", {transparent:true, opacity:0.35, roughness:0.05, metalness:0.1}), copper = std("#b86b3a", {metalness:0.7, roughness:0.3});
  s.sc.add(mesh(new T.CylinderGeometry(0.9, 1.1, 0.8, 24), std("#5a3a2a", {roughness:0.9}), -1.4, 0.4, 0));
  var fire = mesh(new T.ConeGeometry(0.35, 0.7, 12), std("#ff8a20", {emissive:"#ff6000", emissiveIntensity:1.6}), -1.4, 1.05, 0.5, false); s.sc.add(fire); var fl = new T.PointLight(0xff8030, 1.4, 5); fl.position.set(-1.4, 1.2, 0.8); s.sc.add(fl);
  var flask = mesh(new T.SphereGeometry(0.85, 32, 24), glass, -1.4, 1.75, 0); s.sc.add(flask); var liq = mesh(new T.SphereGeometry(0.7, 32, 16, 0, Math.PI*2, Math.PI/2, Math.PI/2), std("#e86a9a", {transparent:true, opacity:0.75}), -1.4, 1.75, 0, false); s.sc.add(liq);
  var head = mesh(new T.SphereGeometry(0.55, 24, 16), copper, -1.4, 2.85, 0); head.scale.y = 0.8; s.sc.add(head);
  var tube = new T.CatmullRomCurve3([new T.Vector3(-1.1, 2.95, 0), new T.Vector3(0, 3.0, 0), new T.Vector3(1.2, 2.2, 0), new T.Vector3(1.6, 1.4, 0)]);
  s.sc.add(mesh(new T.TubeGeometry(tube, 40, 0.07, 10, false), copper, 0, 0, 0));
  var rec = mesh(new T.CylinderGeometry(0.45, 0.55, 0.9, 24), glass, 1.6, 0.45, 0); s.sc.add(rec); var rl = mesh(new T.CylinderGeometry(0.42, 0.42, 0.2, 24), std("#ffd0e0", {transparent:true, opacity:0.8}), 1.6, 0.12, 0, false); s.sc.add(rl);
  var bub = [], stm = [], drop = mesh(new T.SphereGeometry(0.06, 10, 8), std("#ffd0e0", {transparent:true, opacity:0.9}), 1.6, 1.3, 0, false); s.sc.add(drop);
  for(var i=0;i<10;i++){ var b = mesh(new T.SphereGeometry(0.05, 8, 6), std("#fff", {transparent:true, opacity:0.7}), -1.4, 1.3, 0, false); s.sc.add(b); bub.push(b); }
  for(var j=0;j<6;j++){ var w = mesh(new T.SphereGeometry(0.12, 8, 6), std("#ffffff", {transparent:true, opacity:0.25}), 0, 0, 0, false); s.sc.add(w); stm.push(w); }
  s.cam.position.set(0, 3, 6.8); s.cam.lookAt(0, 1.6, 0);
  return function(t){ fire.scale.y = 1+Math.sin(t*10)*0.15; fl.intensity = 1.3+Math.sin(t*12)*0.25;
    bub.forEach(function(b, k){ var p = (t*0.7+k/10)%1; b.position.set(-1.4+Math.sin(k*3)*0.4, 1.3+p*0.45, Math.cos(k*3)*0.3); b.scale.setScalar(0.5+p); });
    stm.forEach(function(w, k){ var p = (t*0.35+k/6)%1; w.position.copy(tube.getPoint(p*0.7)); w.position.y += 0.05; w.material.opacity = 0.3*(1-p); });
    var d = (t*0.8)%1; drop.position.y = 1.3-d*1.0; rl.scale.y = 1+((t*0.02)%1)*1.5; rl.position.y = 0.12+rl.scale.y*0.1; };
};
SC.wheel = function(s, f, ctl){ var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", outer = new T.Group(), inner = new T.Group(); outer.position.y = inner.position.y = 2.2; s.sc.add(outer); s.sc.add(inner);
  outer.add(mesh(new T.CylinderGeometry(2.6, 2.6, 0.2, 64), std("#2d5f7a", {metalness:0.3, roughness:0.4}), 0, 0, 0)); inner.add(mesh(new T.CylinderGeometry(1.8, 1.8, 0.24, 64), std("#d4af37", {metalness:0.6, roughness:0.3}), 0, 0.03, 0));
  outer.rotation.x = inner.rotation.x = Math.PI/2.4;
  for(var i=0;i<26;i++){ var a = i/26*Math.PI*2, lo = label(A[i], "#ffffff", 90); lo.position.set(Math.sin(a)*2.25, 0.25, -Math.cos(a)*2.25); lo.scale.set(0.7, 0.35, 1); outer.add(lo);
    var li = label(A[i], "#2a1a0a", 90); li.position.set(Math.sin(a)*1.45, 0.3, -Math.cos(a)*1.45); li.scale.set(0.6, 0.3, 1); inner.add(li); }
  inner.add(mesh(new T.CylinderGeometry(0.25, 0.25, 0.4, 24), std("#7a4a24"), 0, 0.1, 0));
  var target = 3*Math.PI*2/26, cur = 0; if(ctl) ctl.shift = function(k){ target = k*Math.PI*2/26; };
  s.cam.position.set(0, 5.4, 5.6); s.cam.lookAt(0, 2, 0);
  return function(t, dt){ cur += (target-cur)*Math.min(1, dt*4); inner.rotation.y = -cur; };
};

// ---------------- practice tools ----------------
function algebraHtml(){ var s = st(); return '<div class="card sciTool"><h3>🧮 '+L("Latihan al-jabr","Al-jabr practice")+'</h3><div class="mut small">'+L("Cari x. Pindahkan nombor (al-jabr) dan imbangkan (al-muqabalah).","Find x. Move the numbers (al-jabr) and balance (al-muqabala).")+'</div><div class="sciEq" id="algQ"></div><div class="row" style="gap:8px"><input id="algA" class="rin" type="number" inputmode="numeric" placeholder="x = ?" style="flex:1"><button class="btn gold g3d" id="algGo">✓</button></div><div class="small" id="algR"></div><div class="mut tiny" id="algP">'+s.alg.ok+' / '+s.alg.n+' '+L("betul","right")+'</div></div>'; }
function newAlg(){ var lvl = Math.min(3, Math.floor(st().alg.ok/4)), x = 1+Math.floor(Math.random()*9), a = 1+Math.floor(Math.random()*(lvl?6:3)), b = Math.floor(Math.random()*12)+(lvl>1?-6:0), c = a*x+b;
  if(lvl>=3){ var d = 1+Math.floor(Math.random()*3); if(d===a) d++; return {x:x, q:a+"x "+(b<0?"− "+(-b):"+ "+b)+" = "+d+"x + "+(c-d*x)}; }
  return {x:x, q:(a===1?"":a)+"x "+(b<0?"− "+(-b):"+ "+b)+" = "+c}; }
function cipherHtml(){ return '<div class="card sciTool"><h3>🔐 '+L("Teka-teki sifir","Cipher puzzle")+'</h3><div class="mut small">'+L("Mesej ini dianjak beberapa huruf (sifir anjakan). Putar roda atau cuba anjakan, atau lihat kekerapan huruf seperti al-Kindi.","This message is shifted by some letters (a shift cipher). Turn the wheel or try a shift, or look at letter frequency like al-Kindi.")+'</div><div class="sciCode" id="cipC"></div><div class="row" style="gap:6px;align-items:center"><button class="chip" id="cipM">−</button><b id="cipK">0</b><button class="chip" id="cipP">+</button><span class="sciPlain" id="cipT"></span></div><div class="sciFreq" id="cipF"></div><button class="btn alt g3d full" id="cipN" style="margin-top:6px">↻ '+L("Mesej baharu","New message")+'</button></div>'; }
var MSGS = ["SEEK KNOWLEDGE FROM THE CRADLE TO THE GRAVE","THE INK OF THE SCHOLAR IS PRECIOUS","READ IN THE NAME OF YOUR LORD","SMILING AT YOUR BROTHER IS CHARITY","PATIENCE IS LIGHT","THE BEST OF YOU ARE THOSE WHO LEARN AND TEACH","ALGEBRA CAME FROM BAGHDAD","AL KINDI COUNTED THE LETTERS"];
function shift(t, k){ return t.replace(/[A-Z]/g, function(ch){ return String.fromCharCode((ch.charCodeAt(0)-65+k+26*10)%26+65); }); }

// ---------------- page ----------------
function render(el, id, helpers){
  H = helpers; T = window.THREE; en = !!H.en(); stop();
  var f = F(id); if(!f){ el.innerHTML = '<div class="card">?</div>'; return; }
  var ss = st(), ctl = {}, sec = function(ic, a, b, body){ return '<div class="card sciSec"><h3>'+ic+' '+L(a, b)+'</h3>'+body+'</div>'; }, P = function(x){ return '<p>'+E(L(x[0], x[1]))+'</p>'; };
  var h = '<div class="sciHead" style="--c0:'+f.c[0]+';--c1:'+f.c[1]+';--c2:'+f.c[2]+'"><span class="sciHI">'+f.ic+'</span><div><b>'+E(L(f.ms, f.en))+'</b><small>'+E(L(f.tag[0], f.tag[1]))+'</small></div>'+(ss.q[id]!=null?'<span class="sciBadge">'+ss.q[id]+'/3</span>':'')+'</div>';
  h += '<div class="sci3d" id="sci3d"></div><div class="mut small sciCap">'+E(L(f.cap[0], f.cap[1]))+'</div>';
  if(f.scene==="optics") h += '<label class="set"><span>🪞 '+L("Sudut cermin","Mirror angle")+' <b id="sciAV">10°</b></span><input type="range" id="sciAng" min="-40" max="40" value="10"></label>';
  if(f.scene==="globe") h += '<button class="chip" id="sciFlip">🔄 '+L("Selatan di atas (al-Idrisi)","South at the top (al-Idrisi)")+'</button>';
  if(f.scene==="farm") h += '<label class="set"><span>🌱 '+L("Musim","Season")+'</span><input type="range" id="sciGrow" min="0" max="100" value="60"></label>';
  h += '<div class="sciNav">'+[["what","❓",L("Apa","What")],["who","👤",L("Siapa","Who")],["when","📅",L("Bila","When")],["where","📍",L("Di mana","Where")],["how","🛠",L("Bagaimana","How")],["with","🧰",L("Dengan apa","With")],["why","💡",L("Mengapa","Why")],["contrib","🏛",L("Sumbangan","Contribution")],["now","🚀",L("Teknologi kini","Today")]].map(function(x){ return '<button class="chip" data-sj="'+x[0]+'">'+x[1]+' '+x[2]+'</button>'; }).join("")+'</div>';
  h += '<div id="sj-what">'+sec("❓", "Apa", "What", P(f.what))+'</div>';
  h += '<div id="sj-who">'+sec("👤", "Siapa", "Who", '<div class="sciWho">'+f.who.map(function(w){ return '<div><b>'+E(w[0])+'</b><small>'+E(en && w[4] ? w[4] : w[1])+'</small><span>'+E(L(w[2], w[3]))+'</span></div>'; }).join("")+'</div>')+'</div>';
  h += '<div id="sj-when">'+sec("📅", "Bila", "When", P(f.when))+'</div><div id="sj-where">'+sec("📍", "Di mana", "Where", P(f.where))+'</div>';
  h += '<div id="sj-how">'+sec("🛠", "Bagaimana", "How", P(f.how))+'</div><div id="sj-with">'+sec("🧰", "Dengan apa (alat & kaedah)", "With what (tools & methods)", P(f["with"]))+'</div>';
  h += '<div id="sj-why">'+sec("💡", "Mengapa", "Why", P(f.why))+'</div><div id="sj-contrib">'+sec("🏛", "Sumbangan", "Contribution", P(f.contrib))+'</div>';
  h += '<div id="sj-now">'+sec("🚀", "Teknologi kini", "Today's technology", P(f.now))+'</div>';
  if(id==="algebra") h += algebraHtml();
  if(id==="crypto") h += cipherHtml();
  if(id==="pharma") h += '<div class="card sciTool"><h3>🌿 '+L("Atlas tumbuhan","Plant atlas")+'</h3><div class="mut tiny" style="margin-bottom:6px">'+L("Untuk belajar sahaja, bukan nasihat perubatan. Tanya doktor atau ahli farmasi sebelum mengambil apa-apa.","For learning only, not medical advice. Ask a doctor or pharmacist before taking anything.")+'</div>'+(window.SCI_PLANTS||[]).map(function(p){ return '<details class="sciPl"><summary>'+p[0]+' <b>'+E(L(p[1], p[2]))+'</b></summary><div class="sciPlH"><span>📜 '+L("Catatan lama","Historical claim")+'</span>'+E(L(p[3], p[4]))+'</div><div class="sciPlM"><span>🔬 '+L("Bukti moden","Modern evidence")+'</span>'+E(L(p[5], p[6]))+'</div></details>'; }).join("")+'</div>';
  h += '<div class="card sciTool" id="sciQz"></div>';
  h += '<div class="mut tiny" style="padding:4px 4px 14px">'+L("Sains ini sebahagian daripada sejarah ilmu yang dikongsi: sarjana Muslim menterjemah, menguji dan mengembangkan ilmu daripada banyak tamadun. Tarikh anggaran. Perlu semakan guru.","This science is part of a shared history of knowledge: Muslim scholars translated, tested and expanded knowledge from many civilisations. Dates are approximate. Needs a teacher's review.")+'</div>';
  el.innerHTML = h;
  // 3D
  var box = el.querySelector("#sci3d");
  if(T){ try{ var s = stage(box, f), upd = SC[f.scene](s, f, ctl), t0 = performance.now(), last = t0;
      run = {s:s, raf:0}; var loop = function(now){ if(!run || !document.body.contains(s.r.domElement)){ stop(); return; } run.raf = requestAnimationFrame(loop); var dt = Math.max(0, Math.min(0.05, (now-last)/1000)); last = Math.max(last, now); upd(Math.max(0, (now-t0)/1000), dt); s.r.render(s.sc, s.cam); };
      run.raf = requestAnimationFrame(loop);
    }catch(e){ console.error(e); box.innerHTML = '<div class="mut small" style="padding:30px;text-align:center">3D</div>'; } }
  var q = function(sel){ return el.querySelector(sel); };
  el.querySelectorAll("[data-sj]").forEach(function(b){ b.onclick = function(){ var t = q("#sj-"+b.getAttribute("data-sj")); if(t) t.scrollIntoView({behavior:"smooth", block:"start"}); }; });
  if(q("#sciAng")) q("#sciAng").oninput = function(){ q("#sciAV").textContent = this.value+"°"; if(ctl.setAng) ctl.setAng(+this.value); };
  if(q("#sciFlip")) q("#sciFlip").onclick = function(){ if(ctl.flip) ctl.flip(); };
  if(q("#sciGrow")) q("#sciGrow").oninput = function(){ if(ctl.grow) ctl.grow(this.value/100); };
  if(id==="algebra"){ var cur = newAlg(); q("#algQ").textContent = cur.q;
    q("#algGo").onclick = function(){ var v = +q("#algA").value, s2 = st(); s2.alg.n++; var ok = v===cur.x; if(ok) s2.alg.ok++; sv(s2);
      q("#algR").innerHTML = ok ? '✅ '+L("Betul! x = ","Right! x = ")+cur.x : '❌ '+L("Belum. Jawapan: x = ","Not yet. Answer: x = ")+cur.x; q("#algP").textContent = s2.alg.ok+" / "+s2.alg.n+" "+L("betul","right");
      cur = newAlg(); setTimeout(function(){ if(document.body.contains(el)){ q("#algQ").textContent = cur.q; q("#algA").value = ""; } }, 1400); }; }
  if(id==="crypto"){ var msg, key, k = 0, drawC = function(){ var c = shift(msg, key); q("#cipC").textContent = c; q("#cipK").textContent = k; var p = shift(c, -k); q("#cipT").textContent = p; q("#cipT").classList.toggle("ok", k===key);
      var cnt = {}; c.replace(/[A-Z]/g, function(ch){ cnt[ch] = (cnt[ch]||0)+1; }); var top = Object.keys(cnt).sort(function(a, b){ return cnt[b]-cnt[a]; }).slice(0, 5);
      q("#cipF").innerHTML = L("Paling kerap: ","Most frequent: ")+top.map(function(x){ return '<b>'+x+'</b>×'+cnt[x]; }).join(" · ")+' <span class="mut">('+L("dalam bahasa Inggeris: E, T, A","in English: E, T, A")+')</span>';
      if(ctl.shift) ctl.shift(k); if(k===key){ var s3 = st(); s3.cip.n++; sv(s3); } };
    var fresh = function(){ msg = MSGS[Math.floor(Math.random()*MSGS.length)]; key = 1+Math.floor(Math.random()*25); k = 0; drawC(); }; fresh();
    q("#cipM").onclick = function(){ k = (k+25)%26; drawC(); }; q("#cipP").onclick = function(){ k = (k+1)%26; drawC(); }; q("#cipN").onclick = fresh; }
  // quiz
  var qi = 0, sc = 0, order = f.quiz.map(function(x){ var o = [x[2]].concat(x[3]).map(function(a, i){ return {a:a, ok:i===0}; }); o.sort(function(){ return Math.random()-0.5; }); return {q:L(x[0], x[1]), o:o}; });
  var qz = q("#sciQz"), drawQ = function(){ if(qi>=order.length){ var s4 = st(); s4.q[id] = Math.max(s4.q[id]||0, sc); sv(s4);
      qz.innerHTML = '<h3>✅ '+L("Semak kefahaman","Check your understanding")+'</h3><div class="sciDone">'+sc+' / '+order.length+(sc===order.length?' 🌟':'')+'</div><button class="btn alt g3d full" id="qzA">↻ '+L("Cuba lagi","Try again")+'</button>'; qz.querySelector("#qzA").onclick = function(){ qi = 0; sc = 0; drawQ(); }; return; }
    var x = order[qi]; qz.innerHTML = '<h3>✅ '+L("Semak kefahaman","Check your understanding")+' · '+(qi+1)+'/'+order.length+'</h3><div class="sciQ">'+E(x.q)+'</div>'+x.o.map(function(o, i){ return '<button class="btn alt full sciO" data-qo="'+i+'">'+E(L(o.a[0], o.a[1]))+'</button>'; }).join("");
    qz.querySelectorAll("[data-qo]").forEach(function(b){ b.onclick = function(){ var o = x.o[+b.getAttribute("data-qo")]; if(o.ok) sc++; b.classList.add(o.ok ? "ok" : "no"); qz.querySelectorAll("[data-qo]").forEach(function(z){ z.disabled = true; if(x.o[+z.getAttribute("data-qo")].ok) z.classList.add("ok"); }); setTimeout(function(){ qi++; drawQ(); }, 900); }; }); };
  drawQ();
}
function stop(){ if(run){ cancelAnimationFrame(run.raf); try{ run.s.r.dispose(); run.s.r.forceContextLoss(); }catch(e){} run = null; } }
function score(id){ var s = st(); return s.q[id]; }
return {render:render, stop:stop, score:score};
})();
