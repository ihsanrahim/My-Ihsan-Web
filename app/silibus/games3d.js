/* My Ihsan · Silibus 🎮 Main in three.js (r159, ../hajj/three.min.js): a 3D stage above each game's questions.
   G3D.load(cb) loads three.js once; G3D.mount(kind, host, opt) -> controller or null (no WebGL: the games keep their 2D stage).
   Kinds: "rpg" (fantasy path: village → forest → cave → castle, hero, dragon), "escape" (library → lab → vault, code panel, door),
   "story" (forest / space / village dioramas, characters, stars), "show" (TV studio: spotlights, LED board, podium, prize ladder).
   Built from primitives and emoji sprites only (no model or image files, no drawings of prophets). Resizes with its container
   (foldables), pauses when hidden, cleans itself up when the game screen goes away. */
(function(){
"use strict";
var T = null;
function load(cb){ if(window.THREE){ T = window.THREE; cb(true); return; } var s = document.createElement("script"); s.src = "../hajj/three.min.js";
  s.onload = function(){ T = window.THREE; cb(!!T); }; s.onerror = function(){ cb(false); }; document.head.appendChild(s); }
function webgl(){ try{ var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }catch(e){ return false; } }
// ---------- helpers ----------
function mat(c, o){ o = o || {}; return new T.MeshStandardMaterial({color: c, roughness: o.r==null ? 0.75 : o.r, metalness: o.m||0, emissive: o.e||0x000000, emissiveIntensity: o.ei||1, transparent: !!o.t, opacity: o.op==null ? 1 : o.op}); }
function box(w, h, d, c, o){ return new T.Mesh(new T.BoxGeometry(w, h, d), mat(c, o)); }
function cyl(rt, rb, h, c, seg, o){ return new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg||20), mat(c, o)); }
function cone(r, h, c, seg){ return new T.Mesh(new T.ConeGeometry(r, h, seg||16), mat(c)); }
function sph(r, c, o){ return new T.Mesh(new T.SphereGeometry(r, 24, 16), mat(c, o)); }
function at(o, x, y, z){ o.position.set(x, y, z); return o; }
function emojiTex(e, px){ px = px||128; var cv = document.createElement("canvas"); cv.width = cv.height = px; var cx = cv.getContext("2d"); cx.font = Math.round(px*0.8)+"px serif"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(e, px/2, px*0.56);
  var t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; return t; }
function sprite(e, s){ var sp = new T.Sprite(new T.SpriteMaterial({map: emojiTex(e), transparent: true})); sp.scale.set(s||1, s||1, 1); return sp; }
function textPanel(w, h, opt){ opt = opt || {}; var cv = document.createElement("canvas"); cv.width = 512; cv.height = Math.round(512*h/w); var tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace;
  var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({map: tex, transparent: !!opt.transparent}));
  m.userData.draw = function(txt, fg, bg, font){ var cx = cv.getContext("2d"); cx.clearRect(0, 0, cv.width, cv.height); if(bg){ cx.fillStyle = bg; cx.fillRect(0, 0, cv.width, cv.height); }
    cx.fillStyle = fg||"#39ff14"; cx.textAlign = "center"; cx.textBaseline = "middle"; var sz = Math.round(cv.height*0.62); cx.font = (font||"bold ")+sz+"px monospace";
    while(cx.measureText(txt).width > cv.width*0.92 && sz > 10){ sz -= 4; cx.font = (font||"bold ")+sz+"px monospace"; } cx.fillText(txt, cv.width/2, cv.height/2+2); tex.needsUpdate = true; };
  return m; }
function star3d(c){ var s = new T.Shape(); for(var i=0;i<10;i++){ var a = -Math.PI/2 + i*Math.PI/5, r = i%2 ? 0.2 : 0.5; s[i ? "lineTo" : "moveTo"](r*Math.cos(a), r*Math.sin(a)); }
  return new T.Mesh(new T.ExtrudeGeometry(s, {depth: 0.15, bevelEnabled: false}), mat(c||0xffd400, {e: 0x6b5600, ei: 0.6, m: 0.3, r: 0.4})); }
function tree(x, z, s){ var g = new T.Group(); g.add(at(cyl(0.12*s, 0.16*s, 0.8*s, 0x6d4c41, 8), 0, 0.4*s, 0)); g.add(at(cone(0.6*s, 1.3*s, 0x2e7d32, 10), 0, 1.3*s, 0)); g.add(at(cone(0.45*s, 1*s, 0x388e3c, 10), 0, 1.85*s, 0)); return at(g, x, 0, z); }
function house(x, z, c){ var g = new T.Group(); g.add(at(box(1.2, 0.8, 1, c||0xffcc80), 0, 0.4, 0)); var r = cone(0.95, 0.6, 0xb23a48, 4); r.rotation.y = Math.PI/4; g.add(at(r, 0, 1.1, 0)); g.add(at(box(0.25, 0.45, 0.02, 0x5d4037), 0, 0.23, 0.51)); return at(g, x, 0, z); }
function castle(x, z){ var g = new T.Group(), c = 0xb0bec5; g.add(at(box(1.8, 1.2, 1.4, c), 0, 0.6, 0)); [[-0.9,-0.7],[0.9,-0.7],[-0.9,0.7],[0.9,0.7]].forEach(function(p){ g.add(at(cyl(0.28, 0.3, 1.9, 0x90a4ae, 12), p[0], 0.95, p[1])); g.add(at(cone(0.36, 0.6, 0x5e35b1, 12), p[0], 2.2, p[1])); });
  g.add(at(box(0.5, 0.7, 0.05, 0x4e342e), 0, 0.35, 0.72)); return at(g, x, 0, z); }
function confettiBurst(scene, origin){ var n = 120, geo = new T.BufferGeometry(), pos = new Float32Array(n*3), vel = [], col = new Float32Array(n*3), C = [[1,.83,0],[1,.17,.84],[.22,1,.08],[0,.9,1],[1,.48,0]];
  for(var i=0;i<n;i++){ pos[i*3] = origin.x; pos[i*3+1] = origin.y; pos[i*3+2] = origin.z; vel.push(new T.Vector3((Math.random()-0.5)*0.12, Math.random()*0.16+0.06, (Math.random()-0.5)*0.12)); var c = C[i%5]; col[i*3] = c[0]; col[i*3+1] = c[1]; col[i*3+2] = c[2]; }
  geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("color", new T.BufferAttribute(col, 3));
  var p = new T.Points(geo, new T.PointsMaterial({size: 0.12, vertexColors: true})); scene.add(p); var life = 0;
  return function(){ life++; for(var i=0;i<n;i++){ vel[i].y -= 0.004; pos[i*3] += vel[i].x; pos[i*3+1] += vel[i].y; pos[i*3+2] += vel[i].z; } geo.attributes.position.needsUpdate = true; if(life > 150){ scene.remove(p); geo.dispose(); return false; } return true; }; }

// ---------- base stage ----------
function stage(host, opt){
  var wrap = document.createElement("div"); wrap.className = "g3d"; host.innerHTML = ""; host.appendChild(wrap);
  var r = new T.WebGLRenderer({antialias: true, alpha: false}); r.setPixelRatio(Math.min(2, window.devicePixelRatio||1)); r.outputColorSpace = T.SRGBColorSpace;
  r.shadowMap.enabled = false; wrap.appendChild(r.domElement);
  var scene = new T.Scene(), cam = new T.PerspectiveCamera(opt.fov||50, 1, 0.1, 200), fx = [], ticks = [], alive = true, shake = 0, camGoal = null, lookGoal = null, look = new T.Vector3();
  scene.background = new T.Color(opt.bg||0x1a2340); if(opt.fog) scene.fog = new T.Fog(opt.bg||0x1a2340, opt.fog[0], opt.fog[1]);
  scene.add(new T.HemisphereLight(0xffffff, 0x404060, 0.9)); var sun = new T.DirectionalLight(0xffffff, 1.1); sun.position.set(4, 8, 6); scene.add(sun);
  var size = function(){ var w = Math.max(1, wrap.clientWidth), h = Math.max(1, wrap.clientHeight); r.setSize(w, h, false); r.domElement.style.width = "100%"; r.domElement.style.height = "100%"; cam.aspect = w/h; cam.updateProjectionMatrix(); };
  var ro = window.ResizeObserver ? new ResizeObserver(size) : null; if(ro) ro.observe(wrap); else window.addEventListener("resize", size); size();
  var clock = new T.Clock();
  var loop = function(){ if(!alive) return; if(!wrap.isConnected){ dispose(); return; } requestAnimationFrame(loop); if(document.hidden) return; var dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
    ticks.forEach(function(f){ f(dt, t); }); fx = fx.filter(function(f){ return f(); });
    if(camGoal){ cam.position.lerp(camGoal, 0.06); } if(lookGoal){ look.lerp(lookGoal, 0.08); } cam.lookAt(look);
    if(shake > 0){ cam.position.x += (Math.random()-0.5)*shake; cam.position.y += (Math.random()-0.5)*shake; shake *= 0.85; if(shake < 0.002) shake = 0; }
    r.render(scene, cam); };
  var dispose = function(){ alive = false; if(ro) ro.disconnect(); scene.traverse(function(o){ if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } }); r.dispose(); };
  requestAnimationFrame(loop);
  return {T: T, scene: scene, cam: cam, el: wrap, renderer: r,
    tick: function(f){ ticks.push(f); }, fx: function(f){ fx.push(f); },
    camTo: function(p, l){ camGoal = p.clone(); if(l) lookGoal = l.clone(); }, camSet: function(p, l){ cam.position.copy(p); look.copy(l); camGoal = p.clone(); lookGoal = l.clone(); },
    shake: function(a){ shake = a||0.25; }, confetti: function(o){ fx.push(confettiBurst(scene, o || new T.Vector3(0, 1.5, 0))); }, dispose: dispose};
}

// ---------- 🗡️ RPG: path village → forest → cave → castle; hero sprite walks; dragon appears for the boss ----------
function rpg(host, opt){ var S = stage(host, {bg: 0x87b7e8, fog: [14, 34]}), sc = S.scene;
  var ground = new T.Mesh(new T.PlaneGeometry(60, 60), mat(0x6fbf4f)); ground.rotation.x = -Math.PI/2; sc.add(ground);
  var STOPS = [new T.Vector3(-9, 0, 2), new T.Vector3(-3, 0, -1), new T.Vector3(3, 0, 1.5), new T.Vector3(9, 0, -1)];
  var curve = new T.CatmullRomCurve3(STOPS.map(function(p){ return p.clone().setY(0.02); })), road = new T.Mesh(new T.TubeGeometry(curve, 80, 0.45, 6, false), mat(0xd7b98e)); road.scale.y = 0.05; sc.add(road);
  sc.add(house(-10.5, 0.2)); sc.add(house(-8.2, -0.8, 0xfff59d)); for(var i=0;i<14;i++) sc.add(tree(-5 + Math.random()*4.5, -4 + Math.random()*7 * (i%2 ? 1 : -0.4), 0.8 + Math.random()*0.5));
  var mtn = cone(3.2, 4.5, 0x78909c, 7); sc.add(at(mtn, 3.5, 2.2, -3)); var cave = new T.Mesh(new T.SphereGeometry(0.8, 16, 12, 0, Math.PI*2, 0, Math.PI/2), mat(0x263238)); cave.scale.set(1, 1.2, 0.6); sc.add(at(cave, 3, 0, -0.8));
  sc.add(castle(10.5, -2));
  var hero = sprite(opt.hero||"🧒", 1.3); sc.add(hero); var heroT = 0, heroGoal = 0;
  var dragon = new T.Group(), body = sph(0.9, 0xc62828, {r: 0.5}); dragon.add(body); var head = sph(0.55, 0xd32f2f); dragon.add(at(head, 0.9, 0.7, 0)); [-1, 1].forEach(function(s){ var w = cone(0.7, 1.6, 0x8e0000, 3); w.rotation.z = s*1.2; dragon.add(at(w, -0.2, 0.9, s*0.7)); });
  [-0.15, 0.15].forEach(function(z){ dragon.add(at(sph(0.08, 0xffeb3b, {e: 0xffeb3b}), 1.3, 0.85, z)); }); dragon.visible = false; sc.add(at(dragon, 10.5, 2.4, 0.8));
  var bar = new T.Mesh(new T.PlaneGeometry(2, 0.18), new T.MeshBasicMaterial({color: 0xe53935})); bar.visible = false; sc.add(at(bar, 10.5, 4, 0.8));
  S.tick(function(dt, t){ heroT += (heroGoal - heroT)*0.04; var p = curve.getPointAt(Math.max(0, Math.min(1, heroT))); hero.position.set(p.x, 0.75 + Math.abs(Math.sin(t*6))*0.08*(Math.abs(heroGoal-heroT) > 0.002 ? 1 : 0.2), p.z);
    if(dragon.visible){ dragon.position.y = 2.4 + Math.sin(t*2)*0.25; dragon.rotation.y = Math.sin(t)*0.3; }
    S.camTo(new T.Vector3(p.x - 2.5, 4.2, p.z + 6.5), new T.Vector3(p.x + 1.5, 0.8, p.z)); });
  var p0 = curve.getPointAt(0); S.camSet(new T.Vector3(p0.x - 2.5, 4.2, p0.z + 6.5), new T.Vector3(p0.x + 1.5, 0.8, p0.z));
  return {dispose: S.dispose, el: S.el,
    progress: function(mission, i){ heroGoal = Math.min(1, (mission + i/5) / 3.4); },
    hero: function(e){ hero.material.map = emojiTex(e); hero.material.needsUpdate = true; },
    hit: function(){ S.shake(0.3); hero.material.color.setHex(0xff6666); setTimeout(function(){ hero.material.color.setHex(0xffffff); }, 300); },
    good: function(){ var s = star3d(); s.scale.setScalar(0.5); s.position.copy(hero.position).add(new T.Vector3(0, 0.9, 0)); sc.add(s); var k = 0; S.fx(function(){ k++; s.position.y += 0.03; s.rotation.y += 0.2; if(k > 40){ sc.remove(s); return false; } return true; }); },
    boss: function(hp){ dragon.visible = hp > 0; bar.visible = hp > 0; bar.scale.x = Math.max(0.001, hp/5); if(hp <= 0) S.confetti(new T.Vector3(10.5, 2.5, 0.8)); },
    win: function(){ S.confetti(hero.position.clone().add(new T.Vector3(0, 1, 0))); }};
}

// ---------- 🔐 escape room: one room at a time, code panel on the door, the door swings open ----------
var ROOM_COL = [[0x6d4c41, 0x8d6e63, "📚"], [0x37474f, 0x546e7a, "🧪"], [0x263238, 0x455a64, "🔒"]];
function escape(host, opt){ var S = stage(host, {bg: 0x111111, fov: 60}), sc = S.scene, room = new T.Group(); sc.add(room);
  var lamp = new T.PointLight(0xfff1c1, 18, 16, 1.6); lamp.position.set(0, 2.8, 1); sc.add(lamp); sc.add(new T.AmbientLight(0xffffff, 0.55));
  var door = new T.Group(), leaf = box(1.2, 2.2, 0.08, 0x5d4037); leaf.position.x = 0.6; door.add(leaf); door.add(at(sph(0.06, 0xffd54f, {m: 0.8, r: 0.3}), 1.05, 1.1, 0.06)); door.position.set(-0.6, 1.1, -2.95); sc.add(door); var doorGoal = 0;
  var panel = textPanel(1.6, 0.42); panel.position.set(0, 2.55, -2.9); sc.add(panel); panel.userData.draw("? ? ? ?", "#39ff14", "#050505");
  var dial = textPanel(0.7, 0.7, {transparent: true}); dial.position.set(1.6, 1.4, -2.9); sc.add(dial);
  var props = new T.Group(); sc.add(props);
  var build = function(n){ room.clear(); props.clear(); var c = ROOM_COL[n];
    var floor = new T.Mesh(new T.PlaneGeometry(7, 7), mat(c[0])); floor.rotation.x = -Math.PI/2; room.add(floor);
    [[0, 1.6, -3, 0], [-3.5, 1.6, 0, Math.PI/2], [3.5, 1.6, 0, -Math.PI/2]].forEach(function(w){ var m = new T.Mesh(new T.PlaneGeometry(7, 3.2), mat(c[1])); m.position.set(w[0], w[1], w[2]); m.rotation.y = w[3]; room.add(m); });
    var ceil = new T.Mesh(new T.PlaneGeometry(7, 7), mat(0x222222)); ceil.rotation.x = Math.PI/2; ceil.position.y = 3.2; room.add(ceil);
    if(n===0){ [-2.25, 2.25].forEach(function(sx){ var sh = box(1.7, 2.5, 0.4, 0x4e342e); sh.position.set(sx, 1.25, -2.78); props.add(sh);
        for(var k=0;k<15;k++){ var bk = box(0.24, 0.48, 0.3, [0xb23a48, 0x1f4e9c, 0x2e7d32, 0xc9a646, 0x7b2d8e][k%5]); bk.position.set(sx - 0.62 + (k%5)*0.31, 0.45 + Math.floor(k/5)*0.78, -2.6); props.add(bk); } }); }
    if(n===1){ var tb = box(2.6, 0.12, 1, 0xeceff1); tb.position.set(-1.6, 1, -1.4); props.add(tb); [0x00e5ff, 0x39ff14, 0xff2bd6].forEach(function(cc, k){ var fl = cyl(0.12, 0.22, 0.45, cc, 16, {t: true, op: 0.75, e: cc, ei: 0.4}); fl.position.set(-2.4 + k*0.7, 1.3, -1.4); props.add(fl); }); }
    if(n===2){ var vd = cyl(0.9, 0.9, 0.2, 0x90a4ae, 32, {m: 0.8, r: 0.3}); vd.rotation.x = Math.PI/2; vd.position.set(2.2, 1.3, -2.85); props.add(vd); for(var b2=0;b2<6;b2++){ var gb = box(0.5, 0.25, 0.25, 0xffd54f, {m: 0.9, r: 0.2}); gb.position.set(-2.6 + (b2%3)*0.55, 0.13 + Math.floor(b2/3)*0.26, -2.2); props.add(gb); } }
    dial.userData.draw(c[2], "#fff", null, "");
    leaf.material.color.setHex(n===2 ? 0x78909c : 0x5d4037); doorGoal = 0; door.rotation.y = 0; };
  build(0); var sway = 0;
  S.tick(function(dt, t){ door.rotation.y += (doorGoal - door.rotation.y)*0.06; lamp.intensity = 18 + Math.sin(t*3)*0.8; sway = Math.sin(t*0.4)*0.25; S.camTo(new T.Vector3(sway, 1.6, 2.6), new T.Vector3(0, 1.4, -3)); });
  S.camSet(new T.Vector3(0, 1.6, 2.6), new T.Vector3(0, 1.4, -3));
  return {dispose: S.dispose, el: S.el,
    code: function(digits){ panel.userData.draw([0,1,2,3].map(function(k){ return digits[k]!=null ? digits[k] : "?"; }).join(" "), "#39ff14", "#050505"); },
    wrong: function(){ S.shake(0.15); panel.userData.draw("✗ ✗ ✗ ✗", "#ff3b3b", "#050505"); },
    open: function(){ doorGoal = -1.6; S.confetti(new T.Vector3(0, 1.5, -2.5)); },
    room: function(n){ build(Math.min(2, n)); }};
}

// ---------- 📖 story: a diorama per story; the camera visits places; characters as sprites; stars fly in ----------
function storyScene(host, opt){ var id = opt.id||"hutan", sky = id==="angkasa" ? 0x050a1e : id==="kampung" ? 0xffcc80 : 0x9fd3f5;
  var S = stage(host, {bg: sky, fog: id==="angkasa" ? null : [12, 30]}), sc = S.scene, spots = [];
  if(id==="angkasa"){ var sg = new T.BufferGeometry(), sp = new Float32Array(900); for(var i=0;i<900;i++) sp[i] = (Math.random()-0.5)*60; sg.setAttribute("position", new T.BufferAttribute(sp, 3)); sc.add(new T.Points(sg, new T.PointsMaterial({color: 0xffffff, size: 0.08})));
    var planet = sph(2.2, 0x7e57c2, {r: 0.6}); sc.add(at(planet, 4, -1, -6)); var ring = new T.Mesh(new T.TorusGeometry(3.2, 0.12, 8, 60), mat(0xffd54f)); ring.rotation.set(1.25, 0.35, 0.25); ring.scale.set(1, 1, 0.35); sc.add(at(ring, 4, -1, -6));
    var ship = new T.Group(); ship.add(at(cyl(0.3, 0.45, 1.6, 0xeceff1, 16), 0, 0, 0)); ship.add(at(cone(0.3, 0.6, 0xe53935), 0, 1.1, 0)); [-1, 1].forEach(function(s){ var f = box(0.08, 0.5, 0.5, 0xe53935); f.position.set(s*0.4, -0.6, 0); ship.add(f); }); ship.add(at(sph(0.15, 0x00e5ff, {e: 0x00e5ff, ei: 0.8}), 0, 0.3, 0.32));
    ship.rotation.z = -0.5; sc.add(at(ship, -2, 0.5, 0)); S.tick(function(dt, t){ ship.position.y = 0.5 + Math.sin(t*1.5)*0.2; planet.rotation.y += 0.002; });
    spots = [new T.Vector3(-2, 0.5, 0), new T.Vector3(0, 0, -2), new T.Vector3(2.5, -0.5, -4), new T.Vector3(4, -1, -6)]; }
  else { var gnd = new T.Mesh(new T.PlaneGeometry(50, 50), mat(id==="kampung" ? 0x9ccc65 : 0x558b2f)); gnd.rotation.x = -Math.PI/2; sc.add(gnd);
    if(id==="kampung"){ for(var h=0;h<5;h++) sc.add(house(-6 + h*3, -2 - (h%2)*2, [0xffcc80, 0xfff59d, 0xffab91][h%3])); for(var p=0;p<8;p++){ var palm = new T.Group(); palm.add(at(cyl(0.08, 0.12, 2.2, 0x8d6e63, 8), 0, 1.1, 0)); for(var l=0;l<5;l++){ var lf = box(1.1, 0.04, 0.25, 0x43a047); lf.rotation.y = l*1.25; lf.rotation.z = -0.4; lf.position.y = 2.2; palm.add(lf); } sc.add(at(palm, -8 + p*2.3, 0, 1.5 + (p%2)*1.5)); } }
    else { for(var tr=0;tr<26;tr++) sc.add(tree((Math.random()-0.5)*18, -1 - Math.random()*9, 0.8 + Math.random()*0.7)); var river = new T.Mesh(new T.PlaneGeometry(30, 1.6), mat(0x4fc3f7, {r: 0.2, m: 0.1})); river.rotation.x = -Math.PI/2; river.position.set(0, 0.02, -3.5); sc.add(river);
      var cav = new T.Mesh(new T.SphereGeometry(1.4, 16, 12, 0, Math.PI*2, 0, Math.PI/2), mat(0x546e7a)); sc.add(at(cav, 5, 0, -7)); var crystal = new T.Mesh(new T.OctahedronGeometry(0.4), mat(0x80deea, {e: 0x00bcd4, ei: 0.8, m: 0.3, r: 0.1})); sc.add(at(crystal, 5, 0.9, -6)); S.tick(function(dt, t){ crystal.rotation.y = t; crystal.position.y = 0.9 + Math.sin(t*2)*0.1; }); }
    spots = [new T.Vector3(-5, 0, 1), new T.Vector3(-1.5, 0, -1), new T.Vector3(2, 0, -3.5), new T.Vector3(5, 0, -6)]; }
  var hero = sprite(opt.hero||"🧒", 1.2), other = sprite("🦉", 1.1), starGroup = new T.Group(); sc.add(hero); sc.add(other); sc.add(starGroup);
  var stopI = 0, goal = spots[0].clone();
  S.tick(function(dt, t){ hero.position.lerp(goal.clone().add(new T.Vector3(0, id==="angkasa" ? 0.9 : 0.7, 0.5)), 0.05); other.position.copy(hero.position).add(new T.Vector3(1.1, 0.15 + Math.sin(t*2)*0.08, -0.2));
    starGroup.children.forEach(function(s, k){ s.rotation.y = t*2 + k; });
    S.camTo(hero.position.clone().add(new T.Vector3(-1.5, 2.2, 4.8)), hero.position.clone().add(new T.Vector3(0.8, 0.2, -1))); });
  S.camSet(spots[0].clone().add(new T.Vector3(-1.5, 2.9, 5.3)), spots[0].clone());
  return {dispose: S.dispose, el: S.el,
    step: function(k, n){ stopI = Math.min(spots.length-1, Math.floor(k/Math.max(1, n)*spots.length)); goal = spots[stopI].clone(); },
    who: function(e){ other.material.map = emojiTex(e||"🦉"); other.material.needsUpdate = true; },
    star: function(){ var s = star3d(); s.scale.setScalar(0.35); s.position.set(-1.2 + starGroup.children.length*0.5, 0, 0); starGroup.add(s); },
    wrong: function(){ S.shake(0.2); },
    end: function(best){ starGroup.position.copy(hero.position).add(new T.Vector3(0, 1.4, 0)); if(best) S.confetti(hero.position.clone().add(new T.Vector3(0, 1, 0))); }};
}

// ---------- 📺 quiz show: studio, moving spotlights, LED board, host, podium, prize ladder ----------
function show(host, opt){ var S = stage(host, {bg: 0x0b0b1e, fov: 52}), sc = S.scene;
  var floor = new T.Mesh(new T.CircleGeometry(9, 48), mat(0x1a1440, {m: 0.4, r: 0.3})); floor.rotation.x = -Math.PI/2; sc.add(floor);
  var ringL = new T.Mesh(new T.TorusGeometry(4, 0.06, 8, 80), new T.MeshBasicMaterial({color: 0xff2bd6})); ringL.rotation.x = Math.PI/2; ringL.position.y = 0.02; sc.add(ringL);
  var podium = cyl(0.7, 0.85, 1.1, 0x283593, 24, {m: 0.5, r: 0.3}); sc.add(at(podium, 1.6, 0.55, 0.5)); var podTop = cyl(0.75, 0.75, 0.08, 0xffd400, 24, {e: 0xffd400, ei: 0.4}); sc.add(at(podTop, 1.6, 1.12, 0.5));
  var you = sprite(opt.hero||"🧒", 1.1); sc.add(at(you, 1.6, 1.8, 0.5)); var hostS = sprite("🎤", 0.9); sc.add(at(hostS, -1.7, 1.5, 0.6)); var hostP = sprite("🧑", 1.2); sc.add(at(hostP, -2.2, 1.1, 0.4));
  var led = textPanel(4.2, 1.1); sc.add(at(led, 0, 3.4, -3)); led.userData.draw("0", "#39ff14", "#000");
  var frame = box(4.5, 1.35, 0.1, 0x37474f, {m: 0.6}); sc.add(at(frame, 0, 3.4, -3.08));
  var ladder = new T.Group(); sc.add(at(ladder, 4.2, 0, -1.5)); var steps = [];
  for(var i=0;i<10;i++){ var b = box(1.4, 0.26, 0.4, i===4 ? 0xffb300 : 0x3949ab, {e: 0x000000}); b.position.y = 0.3 + i*0.32; ladder.add(b); steps.push(b); }
  ladder.visible = false;
  var spots = []; [0xff2bd6, 0x00e5ff, 0xffd400].forEach(function(c, k){ var sp = new T.SpotLight(c, 30, 20, 0.35, 0.5); sp.position.set(-4 + k*4, 7, 3); sc.add(sp); sc.add(sp.target); spots.push(sp);
    var beam = new T.Mesh(new T.ConeGeometry(1.2, 7, 24, 1, true), new T.MeshBasicMaterial({color: c, transparent: true, opacity: 0.08, side: T.DoubleSide, depthWrite: false})); beam.userData.sp = sp; sc.add(beam); sp.userData.beam = beam; });
  for(var a=0;a<16;a++){ var bulb = sph(0.08, 0xffd400, {e: 0xffd400, ei: 1}); var ang = a/16*Math.PI*2; bulb.position.set(Math.cos(ang)*4, 0.08, Math.sin(ang)*4); bulb.userData.k = a; sc.add(bulb); spots.push(bulb); }
  S.tick(function(dt, t){ spots.forEach(function(s, k){ if(s.isSpotLight){ s.target.position.set(Math.sin(t*0.8 + k*2)*3, 0, Math.cos(t*0.6 + k)*2); var bm = s.userData.beam; bm.position.copy(s.position).lerp(s.target.position, 0.5); bm.lookAt(s.target.position); bm.rotateX(-Math.PI/2); }
      else if(s.userData.k != null) s.material.emissiveIntensity = ((Math.floor(t*4) + s.userData.k) % 2) ? 1 : 0.15; });
    you.position.y = 1.8 + Math.sin(t*2)*0.05; hostP.position.y = 1.1 + Math.sin(t*1.7 + 1)*0.04; });
  S.camSet(new T.Vector3(0, 2.6, 7.2), new T.Vector3(0, 1.6, -1));
  return {dispose: S.dispose, el: S.el,
    score: function(v){ led.userData.draw(Number(v).toLocaleString(), "#39ff14", "#000"); },
    round: function(n){ ladder.visible = n===3; S.camTo(n===3 ? new T.Vector3(2.2, 2.8, 6.5) : new T.Vector3(0, 2.6, 7.2), n===3 ? new T.Vector3(2.2, 1.6, -1) : new T.Vector3(0, 1.6, -1)); },
    ladder: function(step){ steps.forEach(function(b, k){ b.material.emissive.setHex(k===step ? 0xffd400 : k < step ? 0x1b5e20 : 0x000000); b.material.emissiveIntensity = k===step ? 0.9 : 0.5; }); },
    good: function(){ S.confetti(new T.Vector3(1.6, 2.2, 0.5)); podTop.material.emissive.setHex(0x39ff14); setTimeout(function(){ podTop.material.emissive.setHex(0xffd400); }, 600); },
    bad: function(){ S.shake(0.15); podTop.material.emissive.setHex(0xff1744); setTimeout(function(){ podTop.material.emissive.setHex(0xffd400); }, 600); },
    win: function(){ S.confetti(new T.Vector3(0, 3, -2)); S.confetti(new T.Vector3(1.6, 2.2, 0.5)); }};
}

var KINDS = {rpg: rpg, escape: escape, story: storyScene, show: show};
function mount(kind, host, opt){ if(!T || !webgl() || !host) return null; try{ return KINDS[kind](host, opt||{}); }catch(e){ console.error(e); return null; } }
window.G3D = {load: load, mount: mount, ok: function(){ return !!T && webgl(); }};
})();
