/* My Ihsan 0.5.26 Falak 3D (three.js r159, already in the app for Hajj 3D).
   Falak3D.moon(el, size, date): a lit 3D moon showing tonight's real phase (sun direction from the ephemeris).
   Falak3D.orrery(el, opt): Earth, Moon and Sun at their real positions for any moment (sizes and distances not to scale):
     the Earth turns with sidereal time and shows your place, the Moon keeps the same face to Earth, sunlight casts real shadows,
     so solar and lunar eclipses appear when the three line up. "From Earth" puts the camera on your location looking at the Moon.
   Textures are drawn in code: the Earth from falak/land.js (Natural Earth), the Moon from the main maria and some craters. */
(function(){ "use strict";
var T = window.THREE, A = window.Astro, OB = 23.4393*Math.PI/180;
function ok(){ try{ var c = document.createElement("canvas"); return !!(T && (c.getContext("webgl2") || c.getContext("webgl"))); }catch(e){ return false; } }
// ecliptic longitude / latitude (deg) -> scene direction (x = vernal equinox, y = ecliptic north)
function dir(lon, lat){ var l = lon*Math.PI/180, b = (lat || 0)*Math.PI/180; return new T.Vector3(Math.cos(b)*Math.cos(l), Math.sin(b), -Math.cos(b)*Math.sin(l)); }
var MOONTEX = null, EARTHTEX = null;
function moonTex(){ if(MOONTEX) return MOONTEX; var W = 1024, H = 512, c = document.createElement("canvas"); c.width = W; c.height = H; var g = c.getContext("2d");
  var X = function(lon){ return (lon + 180)/360*W; }, Y = function(lat){ return (90 - lat)/180*H; }, s = 1;
  var rnd = function(){ s = (s*16807)%2147483647; return (s - 1)/2147483646; };
  g.fillStyle = "#b9b4a8"; g.fillRect(0, 0, W, H);
  for(var i = 0; i < 4000; i++){ g.fillStyle = "rgba(" + (rnd() < 0.5 ? "255,255,255" : "60,55,50") + "," + (0.04 + rnd()*0.06) + ")"; g.fillRect(rnd()*W, rnd()*H, 2 + rnd()*5, 2 + rnd()*5); }
  // maria (near side, selenographic lon/lat, radius deg)
  [[-16,33,15],[-57,18,22],[-45,5,14],[17,28,9],[31,8,10],[59,17,6],[51,-8,8],[34,-15,5],[-15,-21,10],[-39,-24,5],[4,13,4],[-23,-10,6],[0,56,7],[20,56,6],[-30,48,6],[-68,-2,6]].forEach(function(m){
    var gr = g.createRadialGradient(X(m[0]), Y(m[1]), 1, X(m[0]), Y(m[1]), m[2]/360*W*1.15); gr.addColorStop(0, "rgba(70,68,72,.85)"); gr.addColorStop(0.75, "rgba(80,78,80,.7)"); gr.addColorStop(1, "rgba(80,78,80,0)");
    g.fillStyle = gr; g.beginPath(); g.ellipse(X(m[0]), Y(m[1]), m[2]/360*W*1.15, m[2]/180*H*1.0, 0, 0, 7); g.fill(); });
  for(var j = 0; j < 260; j++){ var x = rnd()*W, y = rnd()*H, r = 1.5 + Math.pow(rnd(), 3)*14; g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.fillStyle = "rgba(40,38,36,.18)"; g.beginPath(); g.arc(x + r*0.2, y + r*0.2, r*0.8, 0, 7); g.fill(); }
  // Tycho and Copernicus with rays
  [[-11,-43,5,22],[-20,10,4,12]].forEach(function(t){ var x = X(t[0]), y = Y(t[1]); g.strokeStyle = "rgba(255,255,250,.18)"; g.lineWidth = 2; for(var k = 0; k < 16; k++){ var a = k/16*Math.PI*2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a)*t[3]*6, y + Math.sin(a)*t[3]*4); g.stroke(); } g.fillStyle = "#f4f0e6"; g.beginPath(); g.arc(x, y, t[2], 0, 7); g.fill(); });
  MOONTEX = new T.CanvasTexture(c); MOONTEX.colorSpace = T.SRGBColorSpace; return MOONTEX; }
function earthTex(){ if(EARTHTEX) return EARTHTEX; var W = 1024, H = 512, c = document.createElement("canvas"); c.width = W; c.height = H; var g = c.getContext("2d"), X = function(lon){ return (lon + 180)/360*W; }, Y = function(lat){ return (90 - lat)/180*H; };
  var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#1b4f8a"); gr.addColorStop(0.5, "#1f6fb2"); gr.addColorStop(1, "#1b4f8a"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  (window.FALAK_LAND || []).forEach(function(r){ g.beginPath(); for(var i = 0; i < r.length; i += 2){ var x = X(r[i]), y = Y(r[i+1]); if(i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); var lat = r[1]; g.fillStyle = Math.abs(lat) > 62 ? "#e8f0f4" : Math.abs(lat) < 30 && r[0] > -20 && r[0] < 60 ? "#c9a85a" : "#3e8e4e"; g.fill(); });
  g.fillStyle = "rgba(240,248,255,.92)"; g.fillRect(0, 0, W, H*0.06); g.fillRect(0, H*0.93, W, H*0.07);
  EARTHTEX = new T.CanvasTexture(c); EARTHTEX.colorSpace = T.SRGBColorSpace; return EARTHTEX; }
function label(text, col){ var c = document.createElement("canvas"), g = c.getContext("2d"); g.font = "bold 44px system-ui"; var w = Math.ceil(g.measureText(text).width) + 30; c.width = w; c.height = 64;
  g = c.getContext("2d"); g.font = "bold 44px system-ui"; g.fillStyle = "rgba(0,0,0,.45)"; g.beginPath(); g.roundRect ? g.roundRect(0, 4, w, 56, 18) : g.rect(0, 4, w, 56); g.fill(); g.fillStyle = col || "#fff"; g.textBaseline = "middle"; g.fillText(text, 15, 34);
  var sp = new T.Sprite(new T.SpriteMaterial({map: new T.CanvasTexture(c), transparent: true, depthTest: false})); sp.scale.set(w/64*0.55, 0.55, 1); sp.renderOrder = 10; return sp; }
function renderer(el, w, h){ var r = new T.WebGLRenderer({antialias: true, alpha: true}); r.domElement.dataset.ib3d="own"; r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.setSize(w, h); r.outputColorSpace = T.SRGBColorSpace; el.appendChild(r.domElement); return r; }
function kill(r){ try{ r.dispose(); r.forceContextLoss(); if(r.domElement && r.domElement.parentNode) r.domElement.parentNode.removeChild(r.domElement); }catch(e){} }

// ---------- a single lit moon ----------
function moon(el, size, date){ if(!ok()) return null; var r = renderer(el, size, size), sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 100); cam.position.set(0, 0, 4.6);
  var m = new T.Mesh(new T.SphereGeometry(1, 64, 48), new T.MeshStandardMaterial({map: moonTex(), roughness: 1, metalness: 0})); m.rotation.y = -Math.PI/2; sc.add(m); // near side (lon 0) faces the camera
  sc.add(new T.AmbientLight(0x5a6a8a, 0.55)); var L = new T.DirectionalLight(0xfff6e0, 3.2); // ambient = earthshine, so the dark side stays faintly visible sc.add(L);
  var mi = A.moonInfo(date || new Date()), a = mi.phaseAngle*Math.PI/180; // 0 new (light from behind), 180 full (light from the camera)
  L.position.set(Math.sin(a)*10, 0.6, -Math.cos(a)*10);   // waxing: lit on the right
  var raf = 0, alive = true, t0 = performance.now(); (function loop(){ if(!alive) return; m.rotation.x = Math.sin((performance.now() - t0)/4000)*0.06; m.rotation.y = -Math.PI/2 + Math.sin((performance.now() - t0)/5200)*0.12; r.render(sc, cam); raf = requestAnimationFrame(loop); })();
  return {stop: function(){ alive = false; cancelAnimationFrame(raf); kill(r); }}; }

// ---------- Earth, Moon and Sun ----------
function orrery(el, opt){ opt = opt || {}; if(!ok()) return null;
  var w = opt.w || el.clientWidth || 340, h = opt.h || Math.round(w*0.95), r = renderer(el, w, h), sc = new T.Scene(), cam = new T.PerspectiveCamera(42, w/h, 0.05, 400);
  r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap; r.domElement.style.touchAction = "none"; r.domElement.style.borderRadius = "16px";
  // stars
  var sg = new T.BufferGeometry(), sp = []; for(var i = 0; i < 1500; i++){ var v = new T.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(150 + Math.random()*80); sp.push(v.x, v.y, v.z); }
  sg.setAttribute("position", new T.Float32BufferAttribute(sp, 3)); sc.add(new T.Points(sg, new T.PointsMaterial({color: 0xffffff, size: 0.7, sizeAttenuation: true, transparent: true, opacity: 0.8})));
  sc.add(new T.AmbientLight(0x3a4466, 0.25));
  var sun = new T.DirectionalLight(0xfff3dd, 3.0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); var sc0 = sun.shadow.camera; sc0.left = -9; sc0.right = 9; sc0.top = 9; sc0.bottom = -9; sc0.near = 1; sc0.far = 80; sun.shadow.bias = -0.0005; sc.add(sun); sc.add(sun.target);
  var sunBall = new T.Mesh(new T.SphereGeometry(1.8, 32, 24), new T.MeshBasicMaterial({color: 0xffd23f})); sc.add(sunBall);
  var glowC = document.createElement("canvas"); glowC.width = glowC.height = 128; var gg = glowC.getContext("2d"), gr = gg.createRadialGradient(64, 64, 8, 64, 64, 64); gr.addColorStop(0, "rgba(255,230,140,1)"); gr.addColorStop(0.3, "rgba(255,190,80,.5)"); gr.addColorStop(1, "rgba(255,160,60,0)"); gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128);
  var glow = new T.Sprite(new T.SpriteMaterial({map: new T.CanvasTexture(glowC), transparent: true, depthWrite: false})); glow.scale.set(13, 13, 1); sc.add(glow);
  // Earth: tilted group (axis toward ecliptic longitude 90), the globe turns with sidereal time
  var tilt = new T.Group(); tilt.rotation.x = -OB; sc.add(tilt);
  var earth = new T.Mesh(new T.SphereGeometry(1, 64, 48), new T.MeshStandardMaterial({map: earthTex(), roughness: 0.85, metalness: 0})); earth.castShadow = true; earth.receiveShadow = true; tilt.add(earth);
  var atm = new T.Mesh(new T.SphereGeometry(1.04, 48, 32), new T.MeshBasicMaterial({color: 0x6fb7ff, transparent: true, opacity: 0.12, side: T.BackSide})); tilt.add(atm);
  var axis = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 2.8, 6), new T.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.35})); tilt.add(axis);
  var here = new T.Mesh(new T.SphereGeometry(0.045, 12, 8), new T.MeshBasicMaterial({color: 0xff4d6d})); earth.add(here);
  var p = opt.loc || [3.14, 101.69], la = p[0]*Math.PI/180, lo = p[1]*Math.PI/180; here.position.set(Math.cos(la)*Math.cos(lo)*1.01, Math.sin(la)*1.01, -Math.cos(la)*Math.sin(lo)*1.01);
  // Moon (not to scale: about 6 Earth radii away instead of 60)
  var MD = 6, moonM = new T.Mesh(new T.SphereGeometry(0.42, 48, 32), new T.MeshStandardMaterial({map: moonTex(), roughness: 1, metalness: 0})); moonM.castShadow = true; moonM.receiveShadow = true; sc.add(moonM);
  // a ring that always shows where the Moon is (it can be dark: new moon, or inside Earth's shadow)
  var rc = document.createElement("canvas"); rc.width = rc.height = 128; var rg = rc.getContext("2d"); rg.strokeStyle = "rgba(255,240,170,.9)"; rg.lineWidth = 6; rg.beginPath(); rg.arc(64, 64, 56, 0, 7); rg.stroke();
  var ring = new T.Sprite(new T.SpriteMaterial({map: new T.CanvasTexture(rc), transparent: true, depthTest: false})); ring.scale.set(1.4, 1.4, 1); sc.add(ring);
  var labs = opt.labels || {}, lMoon = label(labs.moon || "Bulan", "#fff4cf"), lEarth = label(labs.earth || "Bumi", "#bfe3ff"), lSun = label(labs.sun || "Matahari", "#ffd23f"); sc.add(lMoon); sc.add(lEarth); sc.add(lSun); lSun.scale.multiplyScalar(2);
  // Earth's shadow (umbra), drawn faintly so a lunar eclipse makes sense
  var shadow = new T.Mesh(new T.CylinderGeometry(0.75, 1, 9, 32, 1, true), new T.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false, side: T.DoubleSide})); sc.add(shadow);
  var orbit = new T.Mesh(new T.TorusGeometry(MD, 0.012, 6, 160), new T.MeshBasicMaterial({color: 0x9ab0ff, transparent: true, opacity: 0.35})); orbit.rotation.x = Math.PI/2; sc.add(orbit);
  // views
  var t = opt.date ? new Date(opt.date) : new Date(), sd0 = dir(A.sun(t).lon, 0), view = {az: Math.atan2(sd0.z, sd0.x) + 0.62, el: 0.38, dist: 21, mode: opt.mode || "space"}, speed = 0, last = performance.now(), raf = 0, alive = true, onT = opt.onTime || function(){};
  var place = function(){ var s = A.sun(t), m = A.moon(t), sd = dir(s.lon, 0), md = dir(m.lon, m.lat);
    sun.position.copy(sd).multiplyScalar(40); sun.target.position.set(0, 0, 0); sunBall.position.copy(sd).multiplyScalar(30); glow.position.copy(sunBall.position);
    moonM.position.copy(md).multiplyScalar(MD); ring.position.copy(moonM.position); lMoon.position.copy(moonM.position).add(new T.Vector3(0, 0.95, 0)); lEarth.position.set(0, 1.55, 0); lSun.position.copy(sunBall.position).add(new T.Vector3(0, 3, 0));
    shadow.position.copy(sd).multiplyScalar(-4.5); shadow.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), sd.clone().negate()); shadow.visible = orbit.visible = view.mode !== "earth"; moonM.rotation.set(0, Math.atan2(md.z, -md.x), 0); // near side (texture lon 0 = local +x) faces the Earth
    earth.rotation.y = A.gmst(A.jdOf(t))*Math.PI/180;
    orbit.rotation.set(Math.PI/2, 0, 0);
    if(view.mode === "earth"){ var hw = new T.Vector3(); here.getWorldPosition(hw); cam.position.copy(hw); cam.up.copy(hw).normalize(); cam.fov = 16; cam.updateProjectionMatrix(); cam.lookAt(moonM.position); ring.visible = lMoon.visible = lEarth.visible = lSun.visible = false; }
    else { ring.visible = lMoon.visible = lEarth.visible = lSun.visible = true; cam.fov = 42; cam.updateProjectionMatrix(); cam.up.set(0, 1, 0); cam.position.set(Math.cos(view.az)*Math.cos(view.el)*view.dist, Math.sin(view.el)*view.dist, Math.sin(view.az)*Math.cos(view.el)*view.dist); cam.lookAt(0, 0, 0); }
    atm.visible = axis.visible = view.mode !== "earth"; onT(t); };
  var loop = function(now){ if(!alive) return; var dt = Math.min(0.1, (now - last)/1000); last = now; if(speed) t = new Date(t.getTime() + speed*dt*1000); place(); r.render(sc, cam); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
  // touch: drag to orbit, pinch / wheel to zoom
  var pts = {}, lastP = null, pinch = null, cv = r.domElement;
  cv.addEventListener("pointerdown", function(e){ cv.setPointerCapture(e.pointerId); pts[e.pointerId] = [e.clientX, e.clientY]; lastP = [e.clientX, e.clientY]; var k = Object.keys(pts); if(k.length === 2) pinch = {d: Math.hypot(pts[k[0]][0] - pts[k[1]][0], pts[k[0]][1] - pts[k[1]][1]), z: view.dist}; });
  cv.addEventListener("pointermove", function(e){ if(!pts[e.pointerId]) return; pts[e.pointerId] = [e.clientX, e.clientY]; var k = Object.keys(pts);
    if(k.length === 2 && pinch){ var d = Math.hypot(pts[k[0]][0] - pts[k[1]][0], pts[k[0]][1] - pts[k[1]][1]); view.dist = Math.max(4, Math.min(60, pinch.z*pinch.d/Math.max(10, d))); return; }
    view.az += (e.clientX - lastP[0])*0.008; view.el = Math.max(-1.4, Math.min(1.4, view.el + (e.clientY - lastP[1])*0.008)); lastP = [e.clientX, e.clientY]; });
  var up = function(e){ delete pts[e.pointerId]; if(Object.keys(pts).length < 2) pinch = null; }; cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("wheel", function(e){ e.preventDefault(); view.dist = Math.max(4, Math.min(60, view.dist*(e.deltaY > 0 ? 1.1 : 0.9))); }, {passive: false});
  return {setTime: function(d){ t = new Date(d); }, time: function(){ return t; }, setSpeed: function(s){ speed = s; }, speed: function(){ return speed; },
    setMode: function(m){ view.mode = m; }, mode: function(){ return view.mode; }, frame: function(){ place(); r.render(sc, cam); },
    stop: function(){ alive = false; cancelAnimationFrame(raf); [earth, moonM, atm, axis, here, orbit, sunBall, shadow].forEach(function(o){ o.geometry.dispose(); if(o.material.dispose) o.material.dispose(); }); sg.dispose(); kill(r); }}; }

window.Falak3D = {ok: ok, moon: moon, orrery: orrery};
})();
