/* My Ihsan 0.7.12 · Silibus lesson visuals: every note subtopic can carry {j:"viz", v:{k:template, …, c:caption}}.
   NVIZ.html(v) -> placeholder; NVIZ.hydrate(root, lang) draws a still picture of each scene (one shared WebGL renderer,
   only when the note is opened) and a "🧊 Lihat 3D" button that opens the same scene in a window you can rotate (drag),
   zoom (pinch / wheel) and that animates. three.js r159 from ../hajj/three.min.js (already in the app). Built only from
   primitives and text labels: no image files, no drawings of people's faces or of prophets. No WebGL: a labelled card. */
(function(){
"use strict";
var T = null, SNAP = null, CACHE = {};
function load(cb){ if(window.THREE){ T = window.THREE; cb(true); return; } var s = document.createElement("script"); s.src = "../hajj/three.min.js";
  s.onload = function(){ T = window.THREE; cb(!!T); }; s.onerror = function(){ cb(false); }; document.head.appendChild(s); }
function webgl(){ try{ var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }catch(e){ return false; } }
function esc(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
var PAL = [0x4f7bff, 0xf0a030, 0x20a39e, 0xe0457b, 0x8e24aa, 0x43a047, 0xff7043, 0x00acc1, 0xfdd835, 0x6d4c41];
// ---------- primitives ----------
function mat(c, o){ o = o || {}; return new T.MeshStandardMaterial({color: c, roughness: o.r == null ? 0.6 : o.r, metalness: o.m || 0, transparent: o.a != null, opacity: o.a == null ? 1 : o.a, side: o.ds ? T.DoubleSide : T.FrontSide, emissive: o.e || 0, emissiveIntensity: 0.6}); }
function M(g, c, o){ return new T.Mesh(g, mat(c, o)); }
function box(w, h, d, c, o){ return M(new T.BoxGeometry(w, h, d), c, o); }
function cyl(rt, rb, h, c, o, seg){ return M(new T.CylinderGeometry(rt, rb, h, seg || 28), c, o); }
function cone(r, h, c, seg){ return M(new T.ConeGeometry(r, h, seg || 24), c); }
function sph(r, c, o){ return M(new T.SphereGeometry(r, 28, 18), c, o); }
function at(o, x, y, z){ o.position.set(x || 0, y || 0, z || 0); return o; }
function rot(o, x, y, z){ o.rotation.set(x || 0, y || 0, z || 0); return o; }
function grp(){ var g = new T.Group(); for(var i = 0; i < arguments.length; i++) g.add(arguments[i]); return g; }
function line(pts, c, dash){ var g = new T.BufferGeometry().setFromPoints(pts.map(function(p){ return new T.Vector3(p[0], p[1], p[2] || 0); }));
  var m = dash ? new T.LineDashedMaterial({color: c, dashSize: 0.15, gapSize: 0.1}) : new T.LineBasicMaterial({color: c}); var l = new T.Line(g, m); if(dash) l.computeLineDistances(); return l; }
function arrow(from, to, c){ var a = new T.Vector3(from[0], from[1], from[2] || 0), b = new T.Vector3(to[0], to[1], to[2] || 0), d = b.clone().sub(a), L = d.length();
  return new T.ArrowHelper(d.normalize(), a, L, c || 0xffd400, Math.min(0.35, L * 0.3), Math.min(0.2, L * 0.18)); }
// text label (sprite, always faces the camera)
function wrap(t, n){ var out = [], cur = ""; String(t).split(" ").forEach(function(w){ if(cur && (cur + " " + w).length > n){ out.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; }); if(cur) out.push(cur); return out.join("\n"); }
function lab(txt, x, y, z, o){ o = o || {}; var fs = 44, cv = document.createElement("canvas"), cx = cv.getContext("2d"); cx.font = "bold " + fs + "px sans-serif";
  if(o.w) txt = wrap(txt, o.w); var lines = String(txt).split("\n"), w = 0; lines.forEach(function(l){ w = Math.max(w, cx.measureText(l).width); });
  cv.width = Math.ceil(w + 36); cv.height = lines.length * (fs + 10) + 22; cx = cv.getContext("2d"); cx.font = "bold " + fs + "px sans-serif";
  if(o.bg !== false){ cx.fillStyle = o.bg || "rgba(20,24,40,0.82)"; var r = 18; cx.beginPath(); cx.moveTo(r, 0); cx.arcTo(cv.width, 0, cv.width, cv.height, r); cx.arcTo(cv.width, cv.height, 0, cv.height, r); cx.arcTo(0, cv.height, 0, 0, r); cx.arcTo(0, 0, cv.width, 0, r); cx.fill(); }
  cx.fillStyle = o.fg || "#fff"; cx.textAlign = "center"; cx.textBaseline = "top"; lines.forEach(function(l, i){ cx.fillText(l, cv.width / 2, 11 + i * (fs + 10)); });
  var t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; var s = new T.Sprite(new T.SpriteMaterial({map: t, depthTest: o.dt !== false, transparent: true}));
  var h = (o.s || 0.32) * 1.3 * lines.length + 0.14; s.scale.set(h * cv.width / cv.height, h, 1); s.position.set(x || 0, y || 0, z || 0); s.renderOrder = 5; return s; }
function col(i){ return PAL[i % PAL.length]; }
function ring(r, c, th){ return M(new T.TorusGeometry(r, th || 0.03, 8, 64), c); }
// ---------- templates: each returns {g: group, tick?: fn(t), cam?: [x,y,z]} ----------
var K = {};
// 3D shapes with dimension labels
K.solid = function(v){ var s = v.s || "cube", c = col(v.ci || 0), m, L = v.l || [];
  if(s === "cube") m = box(2, 2, 2, c); else if(s === "cuboid") m = box(3, 1.6, 1.8, c); else if(s === "cylinder") m = cyl(1, 1, 2.4, c);
  else if(s === "cone") m = cone(1.2, 2.4, c); else if(s === "sphere") m = sph(1.3, c); else if(s === "pyramid") m = rot(cone(1.5, 2.2, c, 4), 0, Math.PI / 4, 0);
  else if(s === "prism"){ var sh = new T.Shape(); sh.moveTo(-1.2, -1); sh.lineTo(1.2, -1); sh.lineTo(0, 1.1); sh.lineTo(-1.2, -1); m = M(new T.ExtrudeGeometry(sh, {depth: 2.4, bevelEnabled: false}), c); m.position.z = -1.2; }
  else m = box(2, 2, 2, c);
  var e = new T.LineSegments(new T.EdgesGeometry(m.geometry), new T.LineBasicMaterial({color: 0xffffff})); e.position.copy(m.position); e.rotation.copy(m.rotation);
  var g = grp(m, e); L.forEach(function(t, i){ g.add(lab(t, [-2.2, 2.2, 0][i % 3], [-1.6, 0.4, 1.9][i % 3], 1.4)); }); return {g: g, spin: 1}; };
// particles: solid / liquid / gas
K.particles = function(v){ var g = new T.Group(), modes = v.m === "all" ? ["solid", "liquid", "gas"] : [v.m || "solid"], parts = [];
  modes.forEach(function(md, k){ var ox = (k - (modes.length - 1) / 2) * 3.2, frame = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(2.6, 2.6, 2.6)), new T.LineBasicMaterial({color: 0x90caf9}));
    g.add(at(frame, ox, 0, 0)); var n = md === "gas" ? 14 : 27;
    for(var i = 0; i < n; i++){ var p = sph(0.22, col(k + 2)); var base = md === "solid" ? [ox + (i % 3 - 1) * 0.6, (Math.floor(i / 3) % 3 - 1) * 0.6, (Math.floor(i / 9) - 1) * 0.6]
      : md === "liquid" ? [ox + (Math.random() - 0.5) * 2, -1 + Math.random() * 1.2, (Math.random() - 0.5) * 2] : [ox + (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2];
      at(p, base[0], base[1], base[2]); p.userData = {b: base, md: md, ph: Math.random() * 6, v: [(Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04], ox: ox}; g.add(p); parts.push(p); }
    g.add(lab(v.n ? v.n[k] : md, ox, 1.9, 0)); });
  return {g: g, tick: function(t){ parts.forEach(function(p){ var u = p.userData;
    if(u.md === "solid") p.position.set(u.b[0] + Math.sin(t * 9 + u.ph) * 0.04, u.b[1] + Math.cos(t * 8 + u.ph) * 0.04, u.b[2]);
    else if(u.md === "liquid") p.position.set(u.b[0] + Math.sin(t * 1.4 + u.ph) * 0.3, u.b[1] + Math.sin(t * 2 + u.ph) * 0.1, u.b[2] + Math.cos(t * 1.2 + u.ph) * 0.3);
    else { for(var a = 0; a < 3; a++){ p.position.setComponent(a, p.position.getComponent(a) + u.v[a] * 1.6); var lo = a === 0 ? u.ox - 1.1 : -1.1, hi = a === 0 ? u.ox + 1.1 : 1.1; if(p.position.getComponent(a) < lo || p.position.getComponent(a) > hi) u.v[a] = -u.v[a]; } } }); }, cam: [0, 2, modes.length > 1 ? 10 : 6.5]}; };
// cell: animal / plant
K.cell = function(v){ var plant = v.m === "plant", g = new T.Group();
  if(plant){ g.add(box(3.4, 2.2, 1.4, 0x81c784, {a: 0.35})); g.add(new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(3.5, 2.3, 1.5)), new T.LineBasicMaterial({color: 0x2e7d32})));
    g.add(box(2.2, 1.3, 0.8, 0xb3e5fc, {a: 0.6})); for(var i = 0; i < 7; i++) g.add(at(rot(M(new T.SphereGeometry(0.2, 14, 10).scale(1.6, 0.9, 0.9), 0x2e7d32), 0, 0, i), -1.4 + i * 0.45, (i % 2 ? 0.8 : -0.8), 0.45));
    g.add(at(sph(0.42, 0x8e24aa), 1.25, 0.45, 0.2));
    g.add(lab(v.l ? v.l[0] : "dinding sel", -2.3, 1.6, 0), lab(v.l ? v.l[1] : "vakuol", 0, 0, 1.2), lab(v.l ? v.l[2] : "kloroplas", -1.6, -1.5, 0.8), lab(v.l ? v.l[3] : "nukleus", 1.8, 1.2, 0.6)); }
  else { g.add(M(new T.SphereGeometry(1.8, 32, 20).scale(1.2, 0.85, 0.9), 0xffab91, {a: 0.4})); g.add(at(sph(0.5, 0x8e24aa), 0.3, 0.1, 0));
    for(var j = 0; j < 6; j++) g.add(at(M(new T.CapsuleGeometry(0.1, 0.3, 4, 8), 0xff7043), Math.cos(j) * 1.2, Math.sin(j * 2) * 0.6, Math.sin(j) * 0.5));
    g.add(lab(v.l ? v.l[0] : "membran sel", -2.3, 1.4, 0), lab(v.l ? v.l[1] : "nukleus", 0.6, 1.0, 0.8), lab(v.l ? v.l[2] : "sitoplasma", 1.9, -1.2, 0.4), lab(v.l ? v.l[3] : "mitokondria", -1.5, -1.3, 0.8)); }
  return {g: g, spin: 1}; };
// Earth: layers cut-away, globe with latitude / longitude
K.earth = function(v){ var g = new T.Group(), m = v.m || "layers";
  if(m === "layers"){ var cut = new T.Group(); cut.rotation.y = Math.PI * 0.75; g.add(cut); var R = [[2, 0x8d6e63, v.l ? v.l[0] : "kerak"], [1.75, 0xff7043, v.l ? v.l[1] : "mantel"], [1.05, 0xffa726, v.l ? v.l[2] : "teras luar"], [0.55, 0xfff176, v.l ? v.l[3] : "teras dalam"]];
    R.forEach(function(r, i){ var s = new T.Mesh(new T.SphereGeometry(r[0], 40, 24, 0, Math.PI * 1.5), mat(r[1], {ds: true})); cut.add(s); g.add(lab(r[2], 2.9, 1.4 - i * 0.9, 0.5)); }); }
  else { var e = sph(1.9, 0x1e88e5, {r: 0.8}); g.add(e); for(var k = 0; k < 5; k++) g.add(at(M(new T.SphereGeometry(0.6, 12, 8).scale(1.4, 0.5, 1), 0x43a047), Math.cos(k * 1.3) * 1.55, Math.sin(k * 2.1) * 1.0, Math.sin(k * 1.3) * 1.0));
    [-60, -30, 0, 30, 60].forEach(function(la){ var r = 1.92 * Math.cos(la * Math.PI / 180), t = ring(r, la === 0 ? 0xff5252 : 0xffffff, la === 0 ? 0.03 : 0.012); t.rotation.x = Math.PI / 2; t.position.y = 1.92 * Math.sin(la * Math.PI / 180); g.add(t); });
    for(var lo = 0; lo < 6; lo++){ var t2 = ring(1.92, lo === 0 ? 0xffeb3b : 0xffffff, lo === 0 ? 0.03 : 0.012); t2.rotation.y = lo * Math.PI / 6; g.add(t2); }
    g.add(lab(v.l ? v.l[0] : "Khatulistiwa 0°", 2.9, 0, 0), lab(v.l ? v.l[1] : "Meridian Greenwich", 0, 2.5, 0.6)); if(v.pt) g.add(at(sph(0.12, 0xff1744), 0.6, 0.1, 1.8), lab(v.pt, 1.2, 0.6, 2)); }
  return {g: g, spin: 1}; };
// light: reflection, refraction, prism dispersion, scattering, colour mixing
K.light = function(v){ var g = new T.Group(), m = v.m || "reflect", tick = null;
  if(m === "reflect" || m === "mirror"){ g.add(rot(box(4, 0.08, 1.6, 0xb0bec5, {m: 0.9, r: 0.1}), 0, 0, 0)); g.add(arrow([-2, 2, 0], [0, 0.05, 0], 0xffd400), arrow([0, 0.05, 0], [2, 2, 0], 0xffd400), line([[0, 0, 0], [0, 2.5, 0]], 0xffffff, true));
    g.add(lab(v.l ? v.l[0] : "sinar tuju", -2.2, 2.4, 0), lab(v.l ? v.l[1] : "sinar pantulan", 2.2, 2.4, 0), lab(v.l ? v.l[2] : "garis normal", 0, 2.9, 0), lab(v.l ? v.l[3] : "i = r", 0, -0.7, 0)); }
  else if(m === "refract"){ g.add(at(box(4, 2, 1.6, 0x81d4fa, {a: 0.45}), 0, -1, 0)); g.add(arrow([-2, 2, 0], [0, 0, 0], 0xffd400), arrow([0, 0, 0], [0.9, -2, 0], 0xffd400), line([[0, 2.4, 0], [0, -2.4, 0]], 0xffffff, true));
    g.add(lab(v.l ? v.l[0] : "udara", -1.6, 0.6, 0.9), lab(v.l ? v.l[1] : "air / kaca", -1.4, -1.6, 0.9), lab(v.l ? v.l[2] : "sinar terbias ke arah normal", 0.4, -2.6, 0.9, {w: 22})); }
  else if(m === "prism"){ var sh = new T.Shape(); sh.moveTo(-1.2, -1); sh.lineTo(1.2, -1); sh.lineTo(0, 1.2); sh.lineTo(-1.2, -1); var p = M(new T.ExtrudeGeometry(sh, {depth: 1.2, bevelEnabled: false}), 0xe1f5fe, {a: 0.5}); p.position.z = -0.6; g.add(p);
    g.add(arrow([-3.2, 0.6, 0], [-0.55, 0.2, 0], 0xffffff)); ["#ff1744", "#ff9100", "#ffea00", "#00e676", "#2979ff", "#3d5afe", "#d500f9"].forEach(function(c, i){ g.add(line([[0.6, 0.1, 0], [3.2, 0.9 - i * 0.32, 0]], new T.Color(c))); });
    g.add(lab(v.l ? v.l[0] : "cahaya putih", -2.6, 1.1, 0), lab(v.l ? v.l[1] : "spektrum: merah → ungu", 2.4, 1.5, 0)); }
  else if(m === "scatter"){ g.add(at(sph(0.6, 0xffeb3b, {e: 0xffeb3b}), -3, 1.5, 0)); var dots = []; for(var i = 0; i < 40; i++){ var d = sph(0.05, 0x90caf9); at(d, (Math.random() - 0.3) * 4, (Math.random()) * 2.5 - 0.5, (Math.random() - 0.5) * 2); dots.push(d); g.add(d); }
    for(var j = 0; j < 6; j++) g.add(arrow([-0.5 + j * 0.4, 0.8, 0], [-0.5 + j * 0.4 + Math.cos(j * 1.7) * 0.8, 0.8 + Math.sin(j * 1.7) * 0.8, 0], 0x42a5f5));
    g.add(lab(v.l ? v.l[0] : "cahaya biru paling banyak diserakkan", 0.8, 2.6, 0)); tick = function(t){ dots.forEach(function(d, k){ d.position.y += Math.sin(t * 2 + k) * 0.002; }); }; }
  else { [[0xff1744, -0.6, 0], [0x00e676, 0.6, 0], [0x2979ff, 0, -1]].forEach(function(c){ var s = new T.Mesh(new T.CircleGeometry(1.1, 48), new T.MeshBasicMaterial({color: c[0], transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false})); at(s, c[1], c[2] + 0.4, 0); g.add(s); });
    g.add(lab(v.l ? v.l[0] : "merah + hijau + biru = putih", 0, -1.7, 0.2)); }
  return {g: g, tick: tick, cam: [0, 1.5, 8]}; };
// landforms and maps
K.terrain = function(v){ var m = v.m || "mountain", N = 48, geo = new T.PlaneGeometry(8, 6, N, N); geo.rotateX(-Math.PI / 2);
  var P = geo.attributes.position, colors = [];
  for(var i = 0; i < P.count; i++){ var x = P.getX(i), z = P.getZ(i), y = 0;
    if(m === "mountain") y = 2.2 * Math.exp(-(x * x + z * z) / 3) + 1.2 * Math.exp(-((x - 2.5) * (x - 2.5) + (z + 1) * (z + 1)) / 1.5);
    else if(m === "river") y = 0.9 * Math.exp(-((x + 2.5) * (x + 2.5)) / 2) * 2 - 0.5 * Math.exp(-Math.pow(z - Math.sin(x * 0.8) * 0.8, 2) * 3) + 0.2;
    else if(m === "coast") y = x < 1 ? 0.25 + 0.05 * Math.sin(z * 2) + 0.6 * Math.exp(-((x + 3) * (x + 3)) / 2) : -0.3;
    else if(m === "plain") y = 0.08 * Math.sin(x) * Math.cos(z) + 1.5 * Math.exp(-((x + 3.2) * (x + 3.2) + z * z) / 1.2);
    else if(m === "lake") y = 0.6 + 0.8 * Math.exp(-((x - 3) * (x - 3)) / 2) - 0.9 * Math.exp(-(x * x + z * z) / 2.2);
    else y = 1.6 * Math.exp(-(x * x + z * z) / 4);
    P.setY(i, y); var c = y < 0 ? [0.2, 0.5, 0.9] : y < 0.4 ? [0.45, 0.75, 0.35] : y < 1.2 ? [0.3, 0.6, 0.25] : y < 1.8 ? [0.55, 0.45, 0.3] : [0.95, 0.95, 0.95]; colors.push(c[0], c[1], c[2]); }
  geo.setAttribute("color", new T.Float32BufferAttribute(colors, 3)); geo.computeVertexNormals();
  var g = grp(new T.Mesh(geo, new T.MeshStandardMaterial({vertexColors: true, roughness: 0.9, flatShading: true})));
  if(m === "river" || m === "lake" || m === "coast"){ var w = new T.Mesh(new T.PlaneGeometry(8, 6), new T.MeshStandardMaterial({color: 0x29b6f6, transparent: true, opacity: 0.75})); w.rotation.x = -Math.PI / 2; w.position.y = m === "coast" ? -0.05 : 0.05; g.add(w); }
  if(m === "contour") for(var h = 0.3; h < 1.6; h += 0.3){ var r = 2 * Math.sqrt(Math.log(1.6 / h)); var c2 = ring(r, 0x5d4037, 0.015); c2.rotation.x = Math.PI / 2; c2.position.y = h + 0.02; g.add(c2); }
  if(v.town) for(var b = 0; b < 9; b++) g.add(at(box(0.3, 0.3 + (b % 3) * 0.25, 0.3, col(b)), -0.5 + (b % 3) * 0.45, 0.4, 1.3 + Math.floor(b / 3) * 0.45));
  (v.l || []).forEach(function(t, k){ var p = (v.p || [])[k] || [-2.5 + k * 2.5, 2.4, 0]; g.add(lab(t, p[0], p[1], p[2], {w: 20})); });
  return {g: g, cam: [0, 5, 8.5]}; };
// charts
K.bars = function(v){ var g = new T.Group(), d = v.d || [], mx = Math.max.apply(null, d.map(function(x){ return x[1]; }).concat([1]));
  d.forEach(function(x, i){ var h = 3 * x[1] / mx, ox = (i - (d.length - 1) / 2) * 1.2; g.add(at(box(0.8, h, 0.8, col(i)), ox, h / 2, 0)); g.add(lab(x[0], ox, -0.4, 0.6, {s: 0.24})); g.add(lab(String(x[1]) + (v.u || ""), ox, h + 0.35, 0, {s: 0.24})); });
  g.add(at(box(d.length * 1.2 + 0.6, 0.05, 1.4, 0x9e9e9e), 0, 0, 0)); g.position.y = -1.3; return {g: g, cam: [0, 2.2, 8]}; };
K.pie = function(v){ var g = new T.Group(), d = v.d || [], tot = d.reduce(function(a, x){ return a + x[1]; }, 0) || 1, a0 = 0;
  d.forEach(function(x, i){ var a = 2 * Math.PI * x[1] / tot, s = new T.Mesh(new T.CylinderGeometry(2, 2, 0.5, 48, 1, false, a0, a), mat(col(i))), mid = a0 + a / 2;
    s.position.set(Math.sin(mid) * 0.08, 0, Math.cos(mid) * 0.08); g.add(s); g.add(lab(x[0] + (v.u === false ? "" : " " + (Math.round(1000 * x[1] / tot) / 10) + "%"), Math.sin(mid) * 2.9, 0.6, Math.cos(mid) * 2.9, {s: 0.26})); a0 += a; });
  return {g: g, cam: [0, 4.5, 6]}; };
// number line with points
K.numline = function(v){ var g = new T.Group(), a = v.a == null ? -5 : v.a, b = v.b == null ? 5 : v.b, s = 7 / (b - a), X = function(n){ return (n - a) * s - 3.5; };
  g.add(at(rot(cyl(0.04, 0.04, 7.6, 0xffffff), 0, 0, Math.PI / 2), 0, 0, 0)); g.add(arrow([3.6, 0, 0], [4.1, 0, 0], 0xffffff), arrow([-3.6, 0, 0], [-4.1, 0, 0], 0xffffff));
  for(var n = a; n <= b; n++){ g.add(at(box(0.03, 0.3, 0.03, 0xffffff), X(n), 0, 0)); if((b - a) <= 12 || n % 2 === 0) g.add(lab(String(n), X(n), -0.45, 0, {s: 0.22, bg: false})); }
  (v.pts || []).forEach(function(p, i){ g.add(at(sph(0.15, col(i + 3)), X(p[0]), 0, 0)); g.add(lab(p[1], X(p[0]), 0.65 + (i % 2) * 0.55, 0, {s: 0.24})); });
  if(v.jump) g.add(arrow([X(v.jump[0]), 0.3, 0], [X(v.jump[1]), 0.3, 0], 0xff5252));
  return {g: g, cam: [0, 1.2, 6.5]}; };
// timeline of blocks
K.timeline = function(v){ var g = new T.Group(), d = v.d || [], n = d.length, W = Math.max(6, n * 1.6);
  g.add(at(rot(cyl(0.05, 0.05, W, 0xb0bec5), 0, 0, Math.PI / 2), 0, 0, 0)); g.add(arrow([W / 2, 0, 0], [W / 2 + 0.5, 0, 0], 0xb0bec5));
  d.forEach(function(x, i){ var ox = -W / 2 + (i + 0.5) * W / n, up = i % 2 ? -1 : 1; g.add(at(cyl(0.18, 0.18, 0.2, col(i)), ox, 0, 0)); g.add(line([[ox, 0, 0], [ox, up * 1.1, 0]], 0xffffff)); g.add(lab(x[0], ox, up * 1.4, 0, {s: 0.24})); if(x[1]) g.add(lab(x[1], ox, up * 0.5 - (up < 0 ? 0.2 : -0.2) , 0.3, {s: 0.18, bg: "rgba(79,123,255,0.85)"})); });
  return {g: g, cam: [0, 0.6, Math.max(7, n * 1.25)]}; };
// buildings and objects
K.build = function(v){ var g = new T.Group(), m = v.m || "house";
  if(m === "pyramid"){ g.add(at(rot(cone(2.2, 2.6, 0xe0c068, 4), 0, Math.PI / 4, 0), 0, 1.3, 0)); g.add(at(rot(cone(1.2, 1.4, 0xd4b45a, 4), 0, Math.PI / 4, 0), 3, 0.7, -1)); g.add(at(box(9, 0.05, 6, 0xf5deb3), 0, 0, 0)); }
  else if(m === "temple"){ g.add(at(box(4.4, 0.3, 2.6, 0xeeeeee), 0, 0.15, 0)); for(var i = 0; i < 6; i++){ g.add(at(cyl(0.16, 0.18, 2, 0xfafafa), -1.9 + i * 0.76, 1.3, 1)); g.add(at(cyl(0.16, 0.18, 2, 0xfafafa), -1.9 + i * 0.76, 1.3, -1)); }
    var r = new T.Shape(); r.moveTo(-2.3, 0); r.lineTo(2.3, 0); r.lineTo(0, 0.8); r.lineTo(-2.3, 0); var roof = M(new T.ExtrudeGeometry(r, {depth: 2.6, bevelEnabled: false}), 0xe0e0e0); at(roof, 0, 2.35, -1.3); g.add(roof, at(box(4.6, 0.12, 2.6, 0xeeeeee), 0, 2.32, 0)); }
  else if(m === "colosseum"){ for(var k = 0; k < 3; k++){ var w = M(new T.CylinderGeometry(2.4, 2.4, 0.8, 40, 1, true), 0xd7b98e, {ds: true}); w.position.y = 0.4 + k * 0.8; g.add(w); }
    for(var a = 0; a < 24; a++){ var ar = box(0.2, 0.5, 0.06, 0x5d4037); var an = a / 24 * Math.PI * 2; ar.position.set(Math.cos(an) * 2.42, 0.45 + (a % 3) * 0.8, Math.sin(an) * 2.42); ar.rotation.y = -an + Math.PI / 2; g.add(ar); } }
  else if(m === "aqueduct"){ for(var q = 0; q < 5; q++){ g.add(at(box(0.3, 2, 0.6, 0xd7b98e), -3 + q * 1.5, 1, 0)); var t = M(new T.TorusGeometry(0.6, 0.12, 6, 16, Math.PI), 0xd7b98e); at(t, -2.25 + q * 1.5, 2, 0); if(q < 4) g.add(t); } g.add(at(box(7, 0.3, 0.7, 0xc8a97e), 0, 2.75, 0), at(box(7, 0.05, 0.4, 0x29b6f6), 0, 2.92, 0)); }
  else if(m === "wall"){ for(var s = 0; s < 8; s++){ g.add(at(box(1.1, 0.9, 0.7, 0xa1887f), -3.8 + s * 1.1, 0.45 + Math.sin(s * 0.8) * 0.5, 0)); if(s % 3 === 0) g.add(at(box(0.9, 1.6, 0.9, 0x8d6e63), -3.8 + s * 1.1, 0.8 + Math.sin(s * 0.8) * 0.5, 0)); } }
  else if(m === "mosque"){ g.add(at(box(3, 1.6, 2.4, 0xfafafa), 0, 0.8, 0)); var dm = new T.Mesh(new T.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x43a047)); at(dm, 0, 1.6, 0); g.add(dm, at(cyl(0.06, 0.06, 0.5, 0xffd54f), 0, 2.85, 0));
    [-1.9, 1.9].forEach(function(x){ g.add(at(cyl(0.2, 0.22, 3.2, 0xf5f5f5), x, 1.6, 0.8), at(cone(0.24, 0.6, 0x43a047), x, 3.5, 0.8)); }); g.add(at(box(0.7, 1, 0.05, 0x5d4037), 0, 0.5, 1.22)); }
  else if(m === "kaabah"){ g.add(at(box(2, 2.3, 1.8, 0x111111, {r: 0.4}), 0, 1.15, 0), at(box(2.02, 0.25, 1.82, 0xd4af37, {m: 0.6, r: 0.3}), 0, 1.7, 0), at(box(0.45, 0.8, 0.03, 0xd4af37, {m: 0.6}), 0.4, 0.9, 0.91));
    var fl = M(new T.RingGeometry(1.8, 4, 48), 0xeeeeee, {ds: true}); fl.rotation.x = -Math.PI / 2; g.add(fl); }
  else if(m === "book"){ [-1, 1].forEach(function(sx){ var pg = box(1.9, 0.12, 2.6, 0xfffde7); pg.position.set(sx * 0.98, 0.2, 0); pg.rotation.z = -sx * 0.12; g.add(pg); var cv = box(2, 0.06, 2.7, 0x1b5e20); cv.position.set(sx * 1.0, 0.08, 0); cv.rotation.z = -sx * 0.12; g.add(cv); });
    for(var l2 = 0; l2 < 6; l2++){ g.add(at(box(1.3, 0.01, 0.06, 0x9e9e9e), -1, 0.4 + 0.02, -0.9 + l2 * 0.35), at(box(1.3, 0.01, 0.06, 0x9e9e9e), 1, 0.4 + 0.02, -0.9 + l2 * 0.35)); } }
  else if(m === "cave"){ var cv2 = new T.Mesh(new T.SphereGeometry(2.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x795548, {ds: true})); cv2.scale.set(1.4, 0.9, 1); g.add(cv2); g.add(at(box(0.9, 1.3, 0.3, 0x212121), 0, 0.65, 2.3));
    for(var f = 0; f < 4; f++) g.add(at(rot(cyl(0.05, 0.05, 0.6, 0x6d4c41), 0.4, f, 0.3), -1.7 + f * 0.15, 0.1, 2.2)); g.add(at(cone(0.15, 0.4, 0xff7043), -1.5, 0.3, 2.3)); }
  else if(m === "lab"){ g.add(at(box(5, 0.15, 2.4, 0x8d6e63), 0, 0, 0)); var fl2 = cone(0.6, 1.1, 0xb3e5fc); fl2.material.transparent = true; fl2.material.opacity = 0.6; g.add(at(fl2, -1.5, 0.65, 0), at(cyl(0.14, 0.14, 0.4, 0xb3e5fc, {a: 0.6}), -1.5, 1.35, 0));
    g.add(at(cyl(0.45, 0.45, 1, 0xb3e5fc, {a: 0.5}), 0, 0.58, 0), at(cyl(0.42, 0.42, 0.5, 0x29b6f6, {a: 0.8}), 0, 0.33, 0)); g.add(at(cyl(0.12, 0.25, 0.9, 0x9e9e9e, {m: 0.6}), 1.6, 0.53, 0), at(cone(0.15, 0.5, 0x2979ff), 1.6, 1.2, 0)); }
  else if(m === "parliament"){ g.add(at(box(4.4, 1.2, 2.2, 0xeceff1), 0, 0.6, 0)); for(var pc = 0; pc < 8; pc++) g.add(at(cyl(0.1, 0.1, 1.2, 0xffffff), -1.9 + pc * 0.54, 0.6, 1.15)); var dm2 = new T.Mesh(new T.SphereGeometry(0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xffd54f, {m: 0.4})); at(dm2, 0, 1.2, 0); g.add(dm2, at(box(0.06, 1, 0.06, 0x9e9e9e), 1.8, 1.7, 0), at(box(0.6, 0.35, 0.02, 0x1565c0), 2.1, 2.05, 0)); }
  else if(m === "towers"){ [-0.9, 0.9].forEach(function(x){ for(var k = 0; k < 6; k++) g.add(at(cyl(0.45 - k * 0.05, 0.5 - k * 0.05, 0.9, 0xcfd8dc, {m: 0.7, r: 0.25}, 8), x, 0.45 + k * 0.9, 0)); g.add(at(cone(0.15, 1.2, 0xcfd8dc), x, 6, 0)); }); g.add(at(box(1.4, 0.15, 0.25, 0x90a4ae), 0, 2.9, 0)); g.scale.set(0.78, 0.78, 0.78); g.position.y = -1.6; }
  else if(m === "farm"){ g.add(at(box(8, 0.1, 6, 0x8d6e63), 0, 0, 0)); for(var r2 = 0; r2 < 5; r2++) for(var c2 = 0; c2 < 6; c2++) g.add(at(cone(0.18, 0.5, 0x43a047, 6), -2.5 + c2, 0.3, -2 + r2)); for(var pp = 0; pp < 3; pp++) g.add(line([[-3, 0.15, -2 + pp * 2], [3, 0.15, -2 + pp * 2]], 0x29b6f6)); g.add(at(box(0.8, 1.2, 0.8, 0x29b6f6), -3.4, 0.6, 2.4)); }
  else { g.add(at(box(2, 1.4, 1.6, 0xffcc80), 0, 0.7, 0)); var rf = cone(1.6, 1, 0xb23a48, 4); rf.rotation.y = Math.PI / 4; g.add(at(rf, 0, 1.9, 0), at(box(0.5, 0.8, 0.05, 0x6d4c41), 0, 0.4, 0.81)); }
  (v.l || []).forEach(function(t, k){ var p = (v.p || [])[k] || [-2.4 + k * 2.4, 2.6, 0.8]; g.add(lab(t, p[0], p[1], p[2], {w: 22})); });
  g.position.y = -0.9; return {g: g, spin: v.spin === false ? 0 : 1, cam: [0, 3, 9.5]}; };
// molecules / atoms
K.molecule = function(v){ var g = new T.Group(), m = v.m || "H2O", E = {O: [0xff1744, 0.5], H: [0xffffff, 0.32], C: [0x424242, 0.48], N: [0x2979ff, 0.48], Na: [0x8e24aa, 0.55], Cl: [0x00e676, 0.6], Fe: [0xff7043, 0.5], He: [0xffeb3b, 0.4]};
  var S = {H2O: [["O", 0, 0, 0], ["H", -0.75, -0.55, 0], ["H", 0.75, -0.55, 0]], CO2: [["C", 0, 0, 0], ["O", -1.1, 0, 0], ["O", 1.1, 0, 0]], O2: [["O", -0.5, 0, 0], ["O", 0.5, 0, 0]], N2: [["N", -0.5, 0, 0], ["N", 0.5, 0, 0]], NaCl: [], He: [["He", 0, 0, 0]], Fe: []};
  var A = S[m] || S.H2O; if(m === "NaCl" || m === "Fe"){ for(var i = 0; i < 27; i++){ var x = i % 3 - 1, y = Math.floor(i / 3) % 3 - 1, z = Math.floor(i / 9) - 1; A.push([m === "Fe" ? "Fe" : ((x + y + z + 3) % 2 ? "Na" : "Cl"), x * 0.9, y * 0.9, z * 0.9]); } }
  A.forEach(function(a){ var e = E[a[0]]; g.add(at(sph(e[1] * (m === "NaCl" || m === "Fe" ? 0.6 : 1), e[0], {r: 0.3}), a[1], a[2], a[3])); });
  if(A.length <= 3) for(var j = 1; j < A.length; j++){ var p = new T.Vector3(A[j][1], A[j][2], A[j][3]), q = new T.Vector3(A[0][1], A[0][2], A[0][3]); if(A.length === 2) q.set(A[0][1], A[0][2], A[0][3]);
    var b = cyl(0.08, 0.08, p.distanceTo(q), 0xbdbdbd); b.position.copy(p.clone().add(q).multiplyScalar(0.5)); b.lookAt(q); b.rotateX(Math.PI / 2); g.add(b); }
  if(v.l) v.l.forEach(function(t, k){ g.add(lab(t, -1.8 + k * 3.6, 1.7, 0)); }); else g.add(lab(m.replace(/2/g, "₂"), 0, 1.8, 0));
  return {g: g, spin: 1, cam: [0, 1, 5.5]}; };
// simple figure for PJ (no face)
K.figure = function(v){ var g = new T.Group(), m = v.m || "stand", c = col(v.ci || 0);
  function limb(a, b, r){ var p = new T.Vector3(a[0], a[1], a[2] || 0), q = new T.Vector3(b[0], b[1], b[2] || 0), l = cyl(r || 0.12, r || 0.12, p.distanceTo(q), c); l.position.copy(p.clone().add(q).multiplyScalar(0.5)); l.lookAt(q); l.rotateX(Math.PI / 2); return l; }
  var P = {stand: {hip: [0, 1.6], sh: [0, 2.8], ha: [[-0.6, 1.7], [0.6, 1.7]], ft: [[-0.3, 0], [0.3, 0]]}, run: {hip: [0, 1.5], sh: [0.25, 2.7], ha: [[-0.6, 2.3], [0.8, 1.9]], ft: [[-0.8, 0.3], [0.7, 0]]},
    jump: {hip: [0, 2.2], sh: [0, 3.4], ha: [[-0.7, 4.1], [0.7, 4.1]], ft: [[-0.4, 1.0], [0.4, 1.1]]}, balance: {hip: [0, 1.6], sh: [0, 2.8], ha: [[-1.2, 2.7], [1.2, 2.7]], ft: [[0, 0], [-1.1, 1.6]]},
    throw: {hip: [0, 1.5], sh: [-0.2, 2.7], ha: [[0.9, 3.2], [-0.9, 2.2]], ft: [[-0.6, 0], [0.6, 0]]}, kick: {hip: [0, 1.5], sh: [-0.1, 2.7], ha: [[-0.8, 2.2], [0.7, 2.0]], ft: [[-0.2, 0], [1.1, 0.7]]}}[m] || {};
  if(!P.hip) P = {hip: [0, 1.6], sh: [0, 2.8], ha: [[-0.6, 1.7], [0.6, 1.7]], ft: [[-0.3, 0], [0.3, 0]]};
  g.add(limb(P.hip, P.sh, 0.2), at(sph(0.32, 0xffcc80), P.sh[0], P.sh[1] + 0.5, 0)); P.ha.forEach(function(h){ g.add(limb(P.sh, h)); }); P.ft.forEach(function(f){ g.add(limb(P.hip, f, 0.14)); });
  if(v.ball) g.add(at(sph(0.25, 0xffffff), m === "kick" ? 1.5 : P.ha[0][0], m === "kick" ? 0.7 : P.ha[0][1] + 0.3, 0));
  g.add(at(box(6, 0.05, 3, 0x66bb6a), 0, -0.03, 0)); (v.l || []).forEach(function(t, k){ g.add(lab(t, (k % 2 ? 2.2 : -2.2), 3.4 - Math.floor(k / 2) * 0.8, 0)); }); g.position.y = -1.6;
  return {g: g, spin: 1, cam: [0, 1.4, 7.5]}; };
// sports courts and fields
K.court = function(v){ var g = new T.Group(), m = v.m || "football", D = {football: [8, 5, 0x43a047], netball: [6, 3.4, 0x1e88e5], volleyball: [6, 3, 0xff8f00], badminton: [5.4, 2.6, 0x2e7d32], track: [8, 4.4, 0xc62828], gym: [6, 6, 0x1565c0], basketball: [6, 3.4, 0xd7a86e], hockey: [8, 5, 0x2e7d32], rugby: [8, 5, 0x43a047], pingpong: [3, 1.6, 0x1565c0], softball: [7, 7, 0x6d4c41]}[m] || [8, 5, 0x43a047];
  var f = box(D[0], 0.06, D[1], D[2]); g.add(f); var w = 0xffffff, X = D[0] / 2, Z = D[1] / 2;
  g.add(line([[-X, 0.05, -Z], [X, 0.05, -Z], [X, 0.05, Z], [-X, 0.05, Z], [-X, 0.05, -Z]], w), line([[0, 0.05, -Z], [0, 0.05, Z]], w));
  if(m === "football"){ var cc = ring(0.8, w, 0.02); cc.rotation.x = Math.PI / 2; cc.position.y = 0.05; g.add(cc); [-1, 1].forEach(function(s){ g.add(line([[s * X, 0.05, -1.2], [s * (X - 1), 0.05, -1.2], [s * (X - 1), 0.05, 1.2], [s * X, 0.05, 1.2]], w), at(box(0.1, 0.7, 1.2, 0xffffff, {a: 0.6}), s * X, 0.35, 0)); }); }
  if(m === "netball"){ [-1, 1].forEach(function(s){ g.add(line([[s * X / 3, 0.05, -Z], [s * X / 3, 0.05, Z]], w), at(cyl(0.04, 0.04, 2.2, 0xbdbdbd), s * (X - 0.2), 1.1, 0), at(rot(ring(0.18, 0xff5722, 0.02), Math.PI / 2, 0, 0), s * (X - 0.4), 2.2, 0)); }); }
  if(m === "volleyball" || m === "badminton"){ g.add(at(box(0.05, m === "badminton" ? 1.1 : 1.5, D[1] + 0.4, 0xeeeeee, {a: 0.5}), 0, m === "badminton" ? 0.85 : 1.25, 0)); }
  if(m === "track"){ g.remove(f); for(var r = 0; r < 4; r++){ var t = M(new T.RingGeometry(1.4 + r * 0.35, 1.72 + r * 0.35, 48, 1), r % 2 ? 0xc62828 : 0xd84315, {ds: true}); t.rotation.x = -Math.PI / 2; t.scale.set(1.8, 1, 1); g.add(t); } g.add(rot(M(new T.CircleGeometry(1.4, 48), 0x43a047, {ds: true}), -Math.PI / 2, 0, 0)); g.children[g.children.length - 1].scale.set(1.8, 1, 1); }
  if(m === "basketball"){ [-1, 1].forEach(function(s){ g.add(at(cyl(0.04, 0.04, 2.2, 0xbdbdbd), s * (X - 0.15), 1.1, 0), at(box(0.05, 0.6, 0.9, 0xffffff, {a: 0.7}), s * (X - 0.25), 2.1, 0), at(rot(ring(0.2, 0xff5722, 0.025), Math.PI / 2, 0, 0), s * (X - 0.5), 1.9, 0)); var k = ring(0.9, w, 0.02); k.rotation.x = Math.PI / 2; k.position.set(s * (X - 0.5), 0.05, 0); g.add(k); }); }
  if(m === "hockey"){ [-1, 1].forEach(function(s){ var d = M(new T.RingGeometry(1.45, 1.5, 32, 1, s > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI), w, {ds: true}); d.rotation.x = -Math.PI / 2; d.position.set(s * X, 0.05, 0); g.add(d, at(box(0.1, 0.5, 0.8, 0xffffff, {a: 0.6}), s * X, 0.25, 0)); }); }
  if(m === "rugby"){ [-1, 1].forEach(function(s){ g.add(line([[s * (X - 0.8), 0.05, -Z], [s * (X - 0.8), 0.05, Z]], w), at(cyl(0.04, 0.04, 2.4, 0xffffff), s * (X - 0.8), 1.2, -0.5), at(cyl(0.04, 0.04, 2.4, 0xffffff), s * (X - 0.8), 1.2, 0.5), at(rot(cyl(0.03, 0.03, 1, 0xffffff), Math.PI / 2, 0, 0), s * (X - 0.8), 0.9, 0)); }); }
  if(m === "pingpong"){ f.position.y = 1.2; g.children[1].position.y = 1.2; g.children[2].position.y = 1.2; [-1, 1].forEach(function(s){ [-1, 1].forEach(function(t){ g.add(at(cyl(0.05, 0.05, 1.2, 0x424242), s * (X - 0.2), 0.6, t * (Z - 0.2))); }); }); g.add(at(box(0.03, 0.25, D[1] + 0.2, 0xeeeeee, {a: 0.7}), 0, 1.4, 0)); }
  if(m === "softball"){ var dm = box(3, 0.07, 3, 0xc8a165); dm.rotation.y = Math.PI / 4; g.add(dm); [[0, -2.1], [2.1, 0], [0, 2.1], [-2.1, 0]].forEach(function(b){ var bs = box(0.3, 0.1, 0.3, 0xffffff); bs.position.set(b[0], 0.08, b[1]); bs.rotation.y = Math.PI / 4; g.add(bs); }); g.add(at(cyl(0.3, 0.3, 0.1, 0xc8a165), 0, 0.08, 0)); }
  if(m === "gym"){ g.add(at(box(2, 0.1, 4, 0x1976d2), 0, 0.08, 0), at(box(1.2, 0.7, 0.6, 0x8d6e63), 2, 0.35, -1.8), at(box(3, 0.12, 0.3, 0xa1887f), -2, 0.9, 1.8), at(cyl(0.05, 0.05, 0.85, 0x9e9e9e), -3.2, 0.45, 1.8), at(cyl(0.05, 0.05, 0.85, 0x9e9e9e), -0.8, 0.45, 1.8)); }
  (v.l || []).forEach(function(t, k){ var p = (v.p || [])[k] || [-X + 1 + k * 2.4, 1.2, -Z - 0.4]; g.add(lab(t, p[0], p[1], p[2])); });
  return {g: g, cam: [0, 6, 7]}; };
// concept hub: a centre and satellite tiles that orbit slowly (for values, language and ideas)
K.hub = function(v){ var g = new T.Group(), n = (v.n || []).length, nodes = [];
  var ctr = box(2.2, 0.9, 0.3, col(v.ci || 0)); g.add(ctr, lab(v.t || "", 0, 0, 0.3, {s: 0.3, w: 14, bg: false}));
  (v.n || []).forEach(function(t, i){ var a = Math.PI / 2 - i / n * Math.PI * 2, x = Math.cos(a) * 3.1, y = Math.sin(a) * 1.75, nd = new T.Group();
    nd.add(box(2.2, 0.85, 0.2, col(i + 1)), lab(t, 0, 0, 0.2, {s: 0.25, w: 15, bg: false})); at(nd, x, y, 0); g.add(nd); nodes.push(nd);
    g.add(line([[x * 0.35, y * 0.45, -0.05], [x * 0.75, y * 0.72, -0.05]], 0xb0bec5)); });
  return {g: g, tick: function(t){ nodes.forEach(function(nd, i){ nd.position.z = Math.sin(t * 1.2 + i) * 0.25; }); }, cam: [0, 0.4, 8.6]}; };
// steps / flow chart
K.steps = function(v){ var g = new T.Group(), d = v.d || [], n = d.length, two = n > 4, per = two ? Math.ceil(n / 2) : n;
  d.forEach(function(t, i){ var row = two ? Math.floor(i / per) : 0, k = two ? i % per : i, x = (k - (per - 1) / 2) * 2.1 * (row ? -1 : 1), y = two ? (row ? -1.1 : 1.1) : 0;
    var shape = v.flow && (i === 0 || i === n - 1) ? M(new T.CylinderGeometry(0.75, 0.75, 0.3, 32).rotateX(Math.PI / 2).scale(1.3, 0.7, 1), col(i)) : v.flow && /\?$/.test(t) ? rot(box(1.1, 1.1, 0.3, col(i)), 0, 0, Math.PI / 4) : box(1.8, 0.9, 0.3, col(i));
    g.add(at(shape, x, y, 0), lab((i + 1) + ". " + t, x, y, 0.4, {s: 0.2, w: 13, bg: false}));
    if(i < n - 1){ var row2 = two ? Math.floor((i + 1) / per) : 0, k2 = two ? (i + 1) % per : i + 1, x2 = (k2 - (per - 1) / 2) * 2.1 * (row2 ? -1 : 1), y2 = two ? (row2 ? -1.1 : 1.1) : 0;
      if(row2 === row) g.add(arrow([x + (row ? -0.95 : 0.95), y, 0.2], [x2 + (row ? 0.95 : -0.95), y2, 0.2], 0xffd400)); else g.add(arrow([x, y - 0.5, 0.2], [x2, y2 + 0.5, 0.2], 0xffd400)); } });
  return {g: g, cam: [0, 0.4, Math.max(6.5, per * 1.9)]}; };
// Venn diagram
K.venn = function(v){ var g = new T.Group(), m = v.m || "intersect", S = v.s || ["A", "B"];
  g.add(at(box(7, 0.05, 4.4, 0x37474f), 0, -0.05, 0), lab(v.u || "ξ", -3.1, 0.6, -1.9));
  var C = m === "subset" ? [[0, 0, 1.9], [0.3, 0, 0.9]] : m === "complement" ? [[0, 0, 1.4]] : [[-0.9, 0, 1.4], [0.9, 0, 1.4]];
  C.forEach(function(c, i){ var d = new T.Mesh(new T.CylinderGeometry(c[2], c[2], 0.2 + i * 0.1, 48), mat(col(i), {a: 0.55})); at(d, c[0], 0.1 + i * 0.05, c[1]); g.add(d); g.add(lab(S[i] || "", c[0] + (i ? c[2] * 0.6 : -c[2] * 0.6), 0.9, c[1] - c[2] * 0.6)); });
  return {g: g, cam: [0, 6, 4.5]}; };
// lines and angles
K.lines = function(v){ var g = new T.Group(), m = v.m || "parallel";
  if(m === "parallel"){ g.add(line([[-3.5, 1, 0], [3.5, 1, 0]], 0xffffff), line([[-3.5, -1, 0], [3.5, -1, 0]], 0xffffff), line([[-2, -2.4, 0], [2, 2.4, 0]], 0xffd400));
    [[0.83, 1], [-0.83, -1]].forEach(function(p, i){ var a = M(new T.CircleGeometry(0.45, 24, 0, Math.atan2(2.4, 2)), col(i), {ds: true}); at(a, p[0], p[1], 0); g.add(a); }); }
  else if(m === "intersect"){ g.add(line([[-3, -1.5, 0], [3, 1.5, 0]], 0xffffff), line([[-3, 1.5, 0], [3, -1.5, 0]], 0xffd400)); var a1 = M(new T.CircleGeometry(0.6, 24, -0.46, 0.93), col(1), {ds: true}); var a2 = a1.clone(); a2.rotation.z = Math.PI; g.add(a1, a2); }
  else { g.add(line([[0, 0, 0], [3, 0, 0]], 0xffffff), line([[0, 0, 0], [3 * Math.cos(v.deg * Math.PI / 180 || 1), 3 * Math.sin(v.deg * Math.PI / 180 || 1), 0]], 0xffd400)); g.add(M(new T.CircleGeometry(0.7, 32, 0, (v.deg || 60) * Math.PI / 180), col(2), {ds: true})); }
  (v.l || []).forEach(function(t, k){ var p = (v.p || [])[k] || [0, 2.3 - k * 0.6, 0]; g.add(lab(t, p[0], p[1], p[2], {w: 26})); });
  return {g: g, cam: [0, 0.3, 7.5]}; };
// polygons (extruded) with angle labels
K.polygon = function(v){ var n = v.n || 3, g = new T.Group(), sh = new T.Shape(), R = 1.8, pts = [];
  var custom = v.m === "quad" ? [[-1.8, -1], [1.8, -1], [1.2, 1.2], [-1.4, 1]] : v.m === "kite" ? [[0, -1.8], [1.2, 0.3], [0, 1.2], [-1.2, 0.3]] : v.m === "trap" ? [[-2, -1], [2, -1], [1, 1], [-1, 1]] : v.m === "para" ? [[-2, -1], [1.2, -1], [2, 1], [-1.2, 1]] : null;
  if(custom) pts = custom; else for(var i = 0; i < n; i++){ var a = Math.PI / 2 + i * 2 * Math.PI / n; pts.push([R * Math.cos(a), R * Math.sin(a)]); }
  pts.forEach(function(p, i){ sh[i ? "lineTo" : "moveTo"](p[0], p[1]); }); sh.lineTo(pts[0][0], pts[0][1]);
  var m = M(new T.ExtrudeGeometry(sh, {depth: 0.3, bevelEnabled: false}), col(v.ci || 0)); g.add(m); g.add(new T.LineSegments(new T.EdgesGeometry(m.geometry), new T.LineBasicMaterial({color: 0xffffff})));
  if(v.ang) pts.forEach(function(p, i){ g.add(lab(v.ang[i] || "", p[0] * 0.72, p[1] * 0.72, 0.6, {s: 0.22})); });
  (v.l || []).forEach(function(t, k){ g.add(lab(t, 0, -2.4 - k * 0.6, 0.3)); }); return {g: g, cam: [0, 0, 7]}; };
// Pythagoras: right triangle with squares on each side
K.pyth = function(v){ var a = v.a || 3, b = v.b || 4, s = 2.2 / Math.max(a, b), g = new T.Group(), A = [0, 0], B = [a * s, 0], C = [0, b * s];
  function sq(p, q, c, txt){ var dx = q[0] - p[0], dy = q[1] - p[1], sh = new T.Shape(); sh.moveTo(p[0], p[1]); sh.lineTo(q[0], q[1]); sh.lineTo(q[0] + dy, q[1] - dx); sh.lineTo(p[0] + dy, p[1] - dx); sh.lineTo(p[0], p[1]);
    g.add(M(new T.ExtrudeGeometry(sh, {depth: 0.12, bevelEnabled: false}), c, {a: 0.85})); g.add(lab(txt, (p[0] + q[0] + dy) / 2, (p[1] + q[1] - dx) / 2, 0.4, {s: 0.24})); }
  var t = new T.Shape(); t.moveTo(A[0], A[1]); t.lineTo(B[0], B[1]); t.lineTo(C[0], C[1]); t.lineTo(A[0], A[1]); g.add(M(new T.ExtrudeGeometry(t, {depth: 0.2, bevelEnabled: false}), 0xffffff));
  sq(A, B, col(0), a + "² = " + a * a); sq(C, A, col(1), b + "² = " + b * b); sq(B, C, col(2), "c² = " + (a * a + b * b)); g.position.set(-0.9, -0.9, 0); return {g: g, cam: [0, 0, 9.5]}; };
// grid: area / perimeter / coordinates
K.grid = function(v){ var g = new T.Group(), W = v.w || 6, H = v.h || 4, m = v.m || "area";
  for(var x = -4; x <= 4; x++) g.add(line([[x * 0.5, -2, 0], [x * 0.5, 2, 0]], 0x546e7a)); for(var y = -4; y <= 4; y++) g.add(line([[-2, y * 0.5, 0], [2, y * 0.5, 0]], 0x546e7a));
  if(m === "coord"){ g.add(arrow([-2.2, 0, 0], [2.4, 0, 0], 0xffffff), arrow([0, -2.2, 0], [0, 2.4, 0], 0xffffff), lab("x", 2.6, 0, 0, {bg: false}), lab("y", 0, 2.7, 0, {bg: false}));
    (v.pts || [[2, 3, "(2, 3)"]]).forEach(function(p, i){ g.add(at(sph(0.1, col(i + 3)), p[0] * 0.5, p[1] * 0.5, 0.05), lab(p[2], p[0] * 0.5 + 0.4, p[1] * 0.5 + 0.35, 0.1, {s: 0.22})); }); }
  else { var sx = Math.min(W, 8) * 0.5, sy = Math.min(H, 8) * 0.5; g.add(at(box(sx, sy, 0.15, col(v.ci || 0), {a: 0.85}), -2 + sx / 2, -2 + sy / 2, 0.08));
    g.add(lab(m === "perimeter" ? "P = 2(" + W + " + " + H + ") = " + 2 * (W + H) : "A = " + W + " × " + H + " = " + W * H, 0, 2.5, 0.2)); }
  return {g: g, cam: [0, 0.1, 7.6]}; };
// binary bits as lamps
K.bits = function(v){ var g = new T.Group(), d = String(v.d || "1011"), n = d.length;
  d.split("").forEach(function(b, i){ var x = (i - (n - 1) / 2) * 0.9, on = b === "1"; g.add(at(sph(0.32, on ? 0xffeb3b : 0x424242, {e: on ? 0xffeb3b : 0}), x, 0.5, 0), lab(b, x, -0.3, 0, {s: 0.3}), lab(String(Math.pow(2, n - 1 - i)), x, -1, 0, {s: 0.2, bg: "rgba(79,123,255,0.85)"})); });
  if(v.l) g.add(lab(v.l, 0, 1.5, 0)); return {g: g, cam: [0, 0.2, Math.max(5, n * 0.9)]}; };
// compass and bearing
K.compass = function(v){ var g = new T.Group(), b = v.b || 0; g.add(cyl(2, 2, 0.15, 0x37474f), at(rot(ring(2, 0xffffff, 0.04), Math.PI / 2, 0, 0), 0, 0.09, 0));
  [["U", 0], ["T", 90], ["S", 180], ["B", 270]].forEach(function(d){ var a = d[1] * Math.PI / 180; g.add(lab(v.en ? {U: "N", T: "E", S: "S", B: "W"}[d[0]] : d[0], Math.sin(a) * 2.5, 0.3, -Math.cos(a) * 2.5, {s: 0.3})); });
  [["TL", 45], ["TG", 135], ["BD", 225], ["BL", 315]].forEach(function(d){ var a = d[1] * Math.PI / 180; g.add(lab(v.en ? {TL: "NE", TG: "SE", BD: "SW", BL: "NW"}[d[0]] : d[0], Math.sin(a) * 2.45, 0.25, -Math.cos(a) * 2.45, {s: 0.2, bg: "rgba(79,123,255,0.8)"})); });
  var nd = new T.Group(); nd.add(at(rot(cone(0.14, 1.6, 0xff1744, 4), -Math.PI / 2, 0, 0), 0, 0.2, -0.8), at(rot(cone(0.14, 1.6, 0xeeeeee, 4), Math.PI / 2, 0, 0), 0, 0.2, 0.8)); g.add(nd);
  if(b){ var br = new T.Group(); br.add(at(rot(cyl(0.04, 0.04, 1.9, 0xffd400), Math.PI / 2, 0, 0), 0, 0.25, -0.95)); br.rotation.y = -b * Math.PI / 180; g.add(br); g.add(lab(v.lb || ("0" + b).slice(-3) + "°", Math.sin(b * Math.PI / 180) * 1.4, 0.9, -Math.cos(b * Math.PI / 180) * 1.4)); }
  return {g: g, tick: function(t){ nd.rotation.y = Math.sin(t * 1.3) * 0.12; }, cam: [0, 5, 4.5]}; };
// balance scale for equations / inequalities
K.balance = function(v){ var g = new T.Group(), tilt = v.tilt || 0, arm = new T.Group();
  g.add(at(cyl(0.12, 0.3, 2.4, 0x8d6e63), 0, 1.2, 0), at(box(2, 0.15, 1, 0x6d4c41), 0, 0.05, 0)); arm.add(box(4.4, 0.12, 0.2, 0xffb300, {m: 0.4}));
  [[-2, v.lt || "x + 3"], [2, v.rt || "7"]].forEach(function(s){ arm.add(at(cyl(0.02, 0.02, 0.8, 0xbdbdbd), s[0], -0.4, 0), at(cyl(0.8, 0.6, 0.12, 0xffd54f, {m: 0.4}), s[0], -0.85, 0), lab(s[1], s[0], -0.2, 0.6)); });
  arm.position.y = 2.4; arm.rotation.z = tilt; g.add(arm); g.position.y = -1.3; return {g: g, cam: [0, 1, 7]}; };
// flower / plant
K.flower = function(v){ var g = new T.Group(), m = v.m || "flower";
  if(m === "flower"){ g.add(at(cyl(0.06, 0.08, 2, 0x43a047), 0, 0, 0)); for(var i = 0; i < 6; i++){ var p = M(new T.SphereGeometry(0.5, 16, 10).scale(1, 0.25, 0.5), 0xec407a); var a = i / 6 * Math.PI * 2; p.position.set(Math.cos(a) * 0.55, 1.05, Math.sin(a) * 0.55); p.rotation.y = -a; g.add(p); }
    for(var s = 0; s < 6; s++){ var a2 = s / 6 * Math.PI * 2; g.add(at(cyl(0.015, 0.015, 0.5, 0xfff176), Math.cos(a2) * 0.18, 1.3, Math.sin(a2) * 0.18), at(sph(0.05, 0xffb300), Math.cos(a2) * 0.18, 1.56, Math.sin(a2) * 0.18)); }
    g.add(at(cyl(0.05, 0.12, 0.7, 0x7cb342), 0, 1.35, 0), at(sph(0.08, 0x558b2f), 0, 1.72, 0));
    g.add(lab(v.l ? v.l[0] : "kelopak", -1.8, 1.4, 0), lab(v.l ? v.l[1] : "anter (debunga)", 1.8, 1.9, 0), lab(v.l ? v.l[2] : "stigma", 0.6, 2.4, 0), lab(v.l ? v.l[3] : "ovari", -1.4, 0.6, 0.5)); g.position.y = -0.8; }
  else { g.add(at(cyl(0.08, 0.12, 2.2, 0x6d4c41), 0, 0.1, 0)); for(var l = 0; l < 6; l++){ var lf = M(new T.SphereGeometry(0.5, 12, 8).scale(1.2, 0.12, 0.5), 0x43a047); lf.position.set(Math.cos(l * 2.1) * 0.6, 0.4 + l * 0.25, Math.sin(l * 2.1) * 0.6); lf.rotation.y = -l * 2.1; g.add(lf); }
    for(var r = 0; r < 5; r++) g.add(rot(at(cyl(0.02, 0.04, 0.9, 0xa1887f), Math.cos(r) * 0.25, -1.3, Math.sin(r) * 0.25), Math.sin(r) * 0.5, 0, Math.cos(r) * 0.5)); g.add(at(box(3, 0.05, 2, 0x8d6e63), 0, -1, 0));
    g.add(at(sph(0.5, 0xffeb3b, {e: 0xffeb3b}), -2.4, 2.4, 0), arrow([-1.9, 2, 0], [-0.7, 1.2, 0], 0xffd400)); (v.l || ["cahaya", "CO₂ + air → glukosa + O₂"]).forEach(function(t, k){ g.add(lab(t, k ? 1.8 : -2.4, k ? 2.2 : 3.1, 0)); }); }
  return {g: g, spin: 1, cam: [0, 1, 6.5]}; };
// unit blocks: squares, cubes, ratio
K.blocks = function(v){ var g = new T.Group(), n = v.n || 3, m = v.m || "square";
  if(m === "ratio"){ var d = v.d || [2, 3]; var k = 0; d.forEach(function(c, i){ for(var j = 0; j < c; j++){ g.add(at(box(0.6, 0.6, 0.6, col(i)), (k - (d.reduce(function(a, b){ return a + b; }, 0) - 1) / 2) * 0.7, 0, 0)); k++; } });
    g.add(lab(v.l || d.join(" : "), 0, 0.9, 0)); return {g: g, cam: [0, 1, 6]}; }
  for(var x = 0; x < n; x++) for(var y = 0; y < n; y++) for(var z = 0; z < (m === "cube" ? n : 1); z++) g.add(at(box(0.5, 0.5, 0.5, col((x + y + z) % 3)), (x - (n - 1) / 2) * 0.55, (y - (n - 1) / 2) * 0.55, (z - (m === "cube" ? (n - 1) / 2 : 0)) * 0.55));
  g.add(lab(m === "cube" ? n + "³ = " + n * n * n : n + "² = " + n * n, 0, n * 0.35 + 0.6, 0)); return {g: g, spin: 1, cam: [0, 1.5, 3 + n * 1.2]}; };
// fraction disc
K.frac = function(v){ var g = new T.Group(), d = v.d || 4, n = v.n || 1;
  for(var i = 0; i < d; i++){ var s = new T.Mesh(new T.CylinderGeometry(1.8, 1.8, i < n ? 0.5 : 0.25, 40, 1, false, i * 2 * Math.PI / d, 2 * Math.PI / d - 0.03), mat(i < n ? col(v.ci || 1) : 0x90a4ae)); s.position.y = i < n ? 0.12 : 0; g.add(s); }
  g.add(lab(v.l || n + "/" + d, 0, 1.2, 0)); return {g: g, cam: [0, 4.5, 4.5]}; };
// generic labelled stack (layers, levels, pyramid of ideas)
K.stack = function(v){ var g = new T.Group(), d = v.d || [], n = d.length;
  d.forEach(function(t, i){ var w = v.pyr ? 4.4 - i * (3.4 / Math.max(1, n - 1)) : 4.2, yy = v.pyr ? i : n - 1 - i; g.add(at(box(w, 0.6, 1.6, col(i)), 0, yy * 0.68 - n * 0.34, 0), lab(t, 0, yy * 0.68 - n * 0.34, 0.95, {s: 0.22, w: 30, bg: false})); });
  return {g: g, cam: [0, 1.4, 7.5]}; };
// ---------- 0.7.11 Form 5 scene types ----------
var FN = {sin: function(x){ return Math.sin(x); }, cos: function(x){ return Math.cos(x); }, tan: function(x){ var t = Math.tan(x); return Math.abs(t) > 3.2 ? NaN : t; },
  x2: function(x){ return x * x / 2 - 1; }, x3: function(x){ return x * x * x / 6 - x; }, normal: function(x){ return 2.6 * Math.exp(-x * x / 2); }, sigmoid: function(x){ return 2.8 / (1 + Math.exp(-1.6 * x)); },
  exp: function(x){ return Math.min(3, Math.exp(x / 1.5) / 3); }, decay: function(x){ return 2.8 * Math.pow(0.5, (x + 3.2) / 1.4); }, line: function(x){ return 0.6 * x + 0.5; }, vt: function(x){ return x < -1 ? 1.2 * (x + 3) : x < 1.5 ? 2.4 : 2.4 - 1.6 * (x - 1.5); },
  quad: function(x){ return -0.4 * x * x + 2.4; }, abs: function(x){ return Math.abs(x); }};
// function graph with optional shaded area, tangent and labelled points
K.plot = function(v){ var g = new T.Group(), f = FN[v.f] || FN.sin, X0 = v.x0 == null ? -3.6 : v.x0, X1 = v.x1 == null ? 3.6 : v.x1, sx = v.sx || (v.f === "sin" || v.f === "cos" || v.f === "tan" ? 0.55 : 1);
  g.add(arrow([-4, 0, 0], [4.2, 0, 0], 0xb0bec5), arrow([X0 < -3.5 ? 0 : -3.8, -2.2, 0], [X0 < -3.5 ? 0 : -3.8, 3.4, 0], 0xb0bec5), lab(v.xl || "x", 4.4, -0.3, 0, {s: 0.24, bg: false}), lab(v.yl || "y", X0 < -3.5 ? 0.3 : -3.5, 3.5, 0, {s: 0.24, bg: false}));
  var seg = [], prev = null;
  for(var x = X0; x <= X1 + 1e-6; x += 0.04){ var y = f(x / sx); if(isNaN(y)){ if(seg.length > 1) g.add(line(seg, 0xffd400)); seg = []; continue; } seg.push([x, y, 0]); }
  if(seg.length > 1){ var tube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(seg.map(function(p){ return new T.Vector3(p[0], p[1], p[2]); })), 160, 0.04, 6), mat(0xffd400, {e: 0x6b5600})); g.add(tube); }
  if(v.area){ var sh = new T.Shape(); sh.moveTo(v.area[0], 0); for(var a = v.area[0]; a <= v.area[1] + 1e-6; a += 0.05) sh.lineTo(a, f(a / sx)); sh.lineTo(v.area[1], 0); sh.lineTo(v.area[0], 0);
    g.add(M(new T.ShapeGeometry(sh), 0x4f7bff, {a: 0.55, ds: true})); }
  if(v.tan != null){ var x1 = v.tan, h = 0.01, m = (f((x1 + h) / sx) - f((x1 - h) / sx)) / (2 * h), y1 = f(x1 / sx); g.add(line([[x1 - 1.6, y1 - 1.6 * m, 0.02], [x1 + 1.6, y1 + 1.6 * m, 0.02]], 0xff5252), at(sph(0.09, 0xff5252), x1, y1, 0.05)); }
  if(v.bars){ v.bars.forEach(function(b, i){ var hh = b * 3; g.add(at(box(0.5, hh, 0.3, col(i)), -3 + i * 0.65, hh / 2, 0)); }); }
  (v.pts || []).forEach(function(p, i){ g.add(at(sph(0.09, col(i + 3)), p[0], p[1], 0.05), lab(p[2], p[0] + (p[3] || 0), p[1] + 0.45, 0.1, {s: 0.22})); });
  (v.l || []).forEach(function(t, k){ g.add(lab(t, 0, 3.6 - k * 0.55, 0, {s: 0.26, w: 34})); });
  g.position.y = -0.5; return {g: g, cam: [0, 0.4, 9]}; };
// matrix tiles
K.matrix = function(v){ var g = new T.Group(), parts = [v.a, v.op, v.b, "=", v.r].filter(function(x){ return x != null; }), x = 0, W = [];
  parts.forEach(function(p){ W.push(Array.isArray(p) ? p[0].length * 0.75 + 0.4 : 0.7); }); var tot = W.reduce(function(s, w){ return s + w; }, 0); x = -tot / 2;
  parts.forEach(function(p, k){ if(Array.isArray(p)){ var r = p.length, c = p[0].length;
      for(var i = 0; i < r; i++) for(var j = 0; j < c; j++){ g.add(at(box(0.62, 0.62, 0.15, k === parts.length - 1 && v.r ? 0x43a047 : col(k)), x + 0.2 + j * 0.75 + 0.31, (r - 1) / 2 * 0.75 - i * 0.75, 0), lab(String(p[i][j]), x + 0.2 + j * 0.75 + 0.31, (r - 1) / 2 * 0.75 - i * 0.75, 0.2, {s: 0.26, bg: false})); }
      g.add(at(box(0.06, r * 0.75, 0.1, 0xffffff), x + 0.08, 0, 0), at(box(0.06, r * 0.75, 0.1, 0xffffff), x + W[k] - 0.08, 0, 0)); }
    else g.add(lab(String(p), x + W[k] / 2, 0, 0.1, {s: 0.4, bg: false})); x += W[k]; });
  if(v.l) g.add(lab(v.l, 0, -1.9, 0, {s: 0.26, w: 34})); return {g: g, cam: [0, 0, Math.max(6, tot * 1.05)]}; };
// electric circuits
K.circuit = function(v){ var g = new T.Group(), m = v.m || "series", w = 0xb0bec5;
  function comp(kind, x, y, txt, rotz){ var c = new T.Group();
    if(kind === "bat"){ c.add(at(box(0.08, 0.9, 0.3, 0xffffff), -0.1, 0, 0), at(box(0.08, 0.5, 0.3, 0xffffff), 0.1, 0, 0)); }
    else if(kind === "res"){ c.add(box(0.9, 0.35, 0.3, 0xffb300)); }
    else if(kind === "bulb"){ c.add(sph(0.28, 0xfff59d, {e: 0xfff176})); }
    else if(kind === "A" || kind === "V"){ c.add(rot(cyl(0.3, 0.3, 0.15, 0xeeeeee), Math.PI / 2, 0, 0), lab(kind, 0, 0, 0.2, {s: 0.24, bg: false, fg: "#111"})); }
    else if(kind === "diode"){ c.add(rot(cone(0.25, 0.45, 0x8e24aa, 3), 0, 0, -Math.PI / 2), at(box(0.06, 0.5, 0.3, 0xffffff), 0.25, 0, 0)); }
    else if(kind === "tr"){ c.add(rot(cyl(0.38, 0.38, 0.2, 0x37474f), Math.PI / 2, 0, 0), lab("npn", 0, 0, 0.2, {s: 0.18, bg: false})); }
    c.rotation.z = rotz || 0; g.add(at(c, x, y, 0)); if(txt) g.add(lab(txt, x, y + 0.65, 0, {s: 0.22})); }
  g.add(line([[-3, 1.4, 0], [3, 1.4, 0], [3, -1.4, 0], [-3, -1.4, 0], [-3, 1.4, 0]], w));
  comp("bat", -3, 0, v.l ? v.l[0] : "d.g.e. E", 0);
  if(m === "series"){ comp("res", -0.8, 1.4, "R₁"); comp("res", 1.2, 1.4, "R₂"); comp("A", 3, 0, "A"); comp("bulb", 0.2, -1.4, ""); }
  else if(m === "parallel"){ g.add(line([[-1, 1.4, 0], [-1, -1.4, 0]], w), line([[1.6, 1.4, 0], [1.6, -1.4, 0]], w)); comp("res", 0.3, 0.45, "R₁"); comp("res", 0.3, -0.45, "R₂"); g.add(line([[-1, 0.45, 0], [1.6, 0.45, 0]], w), line([[-1, -0.45, 0], [1.6, -0.45, 0]], w)); comp("A", 3, 0, "A"); }
  else if(m === "emf"){ comp("res", 0.5, 1.4, "R (luar)"); comp("V", 0.5, -1.4, "V"); g.add(lab("E = V + Ir", 0, 0, 0.2, {s: 0.3})); }
  else if(m === "diode"){ comp("diode", 0, 1.4, "diod (pincang ke depan)"); comp("bulb", 1.8, -1.4, "mentol menyala"); }
  else if(m === "transistor"){ comp("tr", 0.6, 0, "transistor"); comp("res", -1.4, 1.4, "R_B"); comp("bulb", 1.8, 1.4, "LED / mentol"); g.add(line([[0.6, 0.4, 0], [0.6, 1.4, 0]], w), line([[0.6, -0.4, 0], [0.6, -1.4, 0]], w)); }
  if(v.cap) g.add(lab(v.cap, 0, -2.3, 0, {s: 0.24, w: 34}));
  var dots = []; for(var i = 0; i < 14; i++){ var d = sph(0.06, 0x00e5ff); dots.push(d); g.add(d); }
  var P = [[-3, -1.4], [-3, 1.4], [3, 1.4], [3, -1.4], [-3, -1.4]], L = 22.8;
  return {g: g, tick: function(t){ dots.forEach(function(d, i){ var s = ((t * 1.2 + i * L / 14) % L), k = 0; while(k < 4){ var a = P[k], b = P[k + 1], seg = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]); if(s <= seg){ var r = s / seg; d.position.set(a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r, 0.05); break; } s -= seg; k++; } }); }, cam: [0, 0, 8]}; };
// electromagnetism: motor effect, induction, transformer
K.emag = function(v){ var g = new T.Group(), m = v.m || "motor";
  function magnet(x, c, t){ g.add(at(box(1, 1.4, 1.2, c), x, 0, 0), lab(t, x, 1.05, 0, {s: 0.3})); }
  if(m === "motor"){ magnet(-2.2, 0xe53935, "U"); magnet(2.2, 0x1e88e5, "S"); g.add(at(rot(cyl(0.05, 0.05, 3, 0xffb300), Math.PI / 2, 0, 0), 0, 0, 0)); for(var i = 0; i < 5; i++) g.add(arrow([-1.6, -0.5 + i * 0.25, -0.8], [1.6, -0.5 + i * 0.25, -0.8], 0x90a4ae));
    g.add(arrow([0, 0.2, 0], [0, 1.8, 0], 0x00e676), lab(v.l ? v.l[0] : "daya F (petua tangan kiri Fleming)", 0, 2.3, 0, {s: 0.24, w: 28}), lab("I", 0.3, 0, 1.6, {s: 0.3})); }
  else if(m === "induction"){ var coil = new T.Group(); for(var j = 0; j < 8; j++) coil.add(at(rot(ring(0.6, 0xffb300, 0.05), 0, Math.PI / 2, 0), -0.9 + j * 0.25, 0, 0)); g.add(coil);
    var mg = new T.Group(); mg.add(at(box(0.8, 0.4, 0.4, 0xe53935), -0.4, 0, 0), at(box(0.8, 0.4, 0.4, 0x1e88e5), 0.4, 0, 0)); g.add(mg);
    g.add(at(rot(cyl(0.45, 0.45, 0.1, 0xeeeeee), Math.PI / 2, 0, 0), 0, -1.6, 0), lab(v.l ? v.l[0] : "galvanometer terpesong", 0, -2.3, 0, {s: 0.24}), lab(v.l ? v.l[1] : "magnet digerakkan → arus aruhan", 0, 1.7, 0, {s: 0.24, w: 28}));
    return {g: g, tick: function(t){ mg.position.x = -2.4 + Math.sin(t * 1.6) * 1.1; }, cam: [0, 0.5, 7]}; }
  else { g.add(at(box(0.4, 2.6, 0.4, 0x78909c), -1.2, 0, 0), at(box(0.4, 2.6, 0.4, 0x78909c), 1.2, 0, 0), at(box(2.8, 0.4, 0.4, 0x78909c), 0, 1.1, 0), at(box(2.8, 0.4, 0.4, 0x78909c), 0, -1.1, 0));
    for(var p = 0; p < 6; p++) g.add(at(rot(ring(0.4, 0xff7043, 0.05), Math.PI / 2, 0, 0), -1.2, -0.6 + p * 0.25, 0)); for(var s = 0; s < 12; s++) g.add(at(rot(ring(0.4, 0xffb300, 0.04), Math.PI / 2, 0, 0), 1.2, -0.8 + s * 0.14, 0));
    g.add(lab(v.l ? v.l[0] : "gegelung primer Nₚ", -2.4, 1.9, 0, {s: 0.24}), lab(v.l ? v.l[1] : "gegelung sekunder Nₛ", 2.4, 1.9, 0, {s: 0.24}), lab("Vₛ / Vₚ = Nₛ / Nₚ", 0, -2.1, 0, {s: 0.28})); }
  return {g: g, spin: 1, cam: [0, 1.2, 7.5]}; };
// fluids and pressure
K.fluid = function(v){ var g = new T.Group(), m = v.m || "depth";
  if(m === "depth"){ g.add(at(box(3, 3.2, 1.6, 0x29b6f6, {a: 0.5}), 0, 0, 0)); [1, 0, -1].forEach(function(y, i){ var L = 0.5 + i * 0.5; g.add(arrow([1.6 + L, y, 0], [1.55, y, 0], 0xffd400), lab("P" + (i + 1), 2.5 + L, y, 0, {s: 0.22})); });
    g.add(lab(v.l ? v.l[0] : "P = hρg: tekanan bertambah dengan kedalaman", 0, 2.2, 0, {s: 0.24, w: 30})); }
  else if(m === "pascal"){ g.add(at(cyl(0.3, 0.3, 1.6, 0x29b6f6, {a: 0.6}), -2, 0, 0), at(cyl(1.1, 1.1, 1.6, 0x29b6f6, {a: 0.6}), 1.4, 0, 0), at(box(3.6, 0.4, 0.8, 0x29b6f6, {a: 0.6}), -0.3, -0.9, 0));
    g.add(at(cyl(0.3, 0.3, 0.15, 0x9e9e9e), -2, 0.85, 0), at(cyl(1.1, 1.1, 0.15, 0x9e9e9e), 1.4, 0.85, 0), arrow([-2, 2.2, 0], [-2, 1, 0], 0xff5252), arrow([1.4, 1, 0], [1.4, 2.6, 0], 0x00e676));
    g.add(lab("F₁ kecil", -2, 2.6, 0, {s: 0.24}), lab("F₂ besar", 2.6, 2.4, 0, {s: 0.24}), lab("F₁/A₁ = F₂/A₂", 0, -1.8, 0, {s: 0.28})); g.position.y = -0.4; }
  else if(m === "archimedes"){ g.add(at(box(3.6, 2.6, 2, 0x29b6f6, {a: 0.45}), 0, -0.4, 0)); var bx = at(box(1, 1, 1, 0xff7043), 0, 0.3, 0); g.add(bx, arrow([0, -0.2, 0.7], [0, 1.6, 0.7], 0x00e676), arrow([0, 0.8, -0.7], [0, -1, -0.7], 0xff5252));
    g.add(lab("daya apungan", 1.3, 1.6, 0.7, {s: 0.22}), lab("berat", -1.2, -1, -0.7, {s: 0.22}), lab("daya apungan = berat cecair tersesar", 0, 2.3, 0, {s: 0.24, w: 30}));
    return {g: g, tick: function(t){ bx.position.y = 0.3 + Math.sin(t * 1.5) * 0.08; }, cam: [0, 1, 7.5]}; }
  else if(m === "bernoulli"){ var sh = new T.Shape(); sh.moveTo(-3.5, 0.9); sh.lineTo(-1, 0.9); sh.lineTo(0, 0.35); sh.lineTo(1, 0.9); sh.lineTo(3.5, 0.9); sh.lineTo(3.5, -0.9); sh.lineTo(1, -0.9); sh.lineTo(0, -0.35); sh.lineTo(-1, -0.9); sh.lineTo(-3.5, -0.9);
    g.add(M(new T.ShapeGeometry(sh), 0x29b6f6, {a: 0.55, ds: true})); var dts = []; for(var i = 0; i < 18; i++){ var d = sph(0.06, 0xffffff); dts.push(d); g.add(d); }
    g.add(lab("halaju tinggi, tekanan rendah", 0, 1.6, 0, {s: 0.24, w: 24}), lab("halaju rendah, tekanan tinggi", -2.5, -1.5, 0, {s: 0.22, w: 22}));
    return {g: g, tick: function(t){ dts.forEach(function(d, i){ var x = ((t * (1.2) + i * 0.4) % 7) - 3.5, nar = Math.abs(x) < 1 ? 1 - Math.abs(x) : 0, sp = 1 + nar * 1.6; x = ((t * 1.4 * sp + i * 0.4) % 7) - 3.5; var hw = Math.abs(x) < 1 ? 0.35 + Math.abs(x) * 0.55 : 0.9; d.position.set(x, ((i % 3) - 1) * hw * 0.6, 0.05); }); }, cam: [0, 0, 7.5]}; }
  else if(m === "atmos"){ g.add(at(cyl(0.12, 0.12, 3.4, 0xb3e5fc, {a: 0.5}), 0, 0.6, 0), at(cyl(0.11, 0.11, 2.4, 0xb0bec5, {m: 0.8, r: 0.2}), 0, 0.1, 0), at(cyl(1, 1, 0.4, 0xb0bec5, {m: 0.8, r: 0.2}), 0, -1.2, 0));
    g.add(lab("76 cm Hg = 1 atm", 1.4, 1.3, 0, {s: 0.24}), lab("barometer merkuri", 0, -2, 0, {s: 0.22})); }
  else { g.add(at(cyl(1, 1, 2.4, 0xeeeeee, {a: 0.25}), 0, 0, 0)); var gs = []; for(var j = 0; j < 30; j++){ var p = sph(0.08, 0xff7043); p.userData.v = new T.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.06); at(p, (Math.random() - 0.5), (Math.random() - 0.5) * 2, (Math.random() - 0.5)); gs.push(p); g.add(p); }
    g.add(lab(v.l ? v.l[0] : "PV = pemalar (Hukum Boyle)", 0, 1.8, 0, {s: 0.26}));
    return {g: g, tick: function(){ gs.forEach(function(p){ p.position.add(p.userData.v); if(Math.hypot(p.position.x, p.position.z) > 0.9){ p.userData.v.x *= -1; p.userData.v.z *= -1; } if(Math.abs(p.position.y) > 1.1) p.userData.v.y *= -1; }); }, cam: [0, 1, 6]}; }
  return {g: g, cam: [0, 0.8, 7.5]}; };
// forces: resultant, resolution, equilibrium, spring
K.forces = function(v){ var g = new T.Group(), m = v.m || "resultant";
  g.add(at(box(0.7, 0.7, 0.7, 0x90a4ae), 0, 0, 0));
  if(m === "resultant"){ g.add(arrow([0, 0, 0], [2.4, 0, 0], 0xff5252), arrow([0, 0, 0], [0, 1.8, 0], 0x4f7bff), arrow([0, 0, 0], [2.4, 1.8, 0], 0xffd400), line([[2.4, 0, 0], [2.4, 1.8, 0]], 0x90a4ae, true), line([[0, 1.8, 0], [2.4, 1.8, 0]], 0x90a4ae, true));
    g.add(lab("F₁ = 4 N", 1.4, -0.4, 0, {s: 0.22}), lab("F₂ = 3 N", -0.7, 1.2, 0, {s: 0.22}), lab("F = 5 N (paduan)", 2.6, 2.2, 0, {s: 0.24})); }
  else if(m === "resolve"){ g.add(arrow([0, 0, 0], [2.2, 1.6, 0], 0xffd400), arrow([0, 0, 0], [2.2, 0, 0], 0xff5252), arrow([0, 0, 0], [0, 1.6, 0], 0x4f7bff));
    g.add(lab("F", 2.4, 1.9, 0, {s: 0.26}), lab("F kos θ", 1.2, -0.4, 0, {s: 0.22}), lab("F sin θ", -0.8, 0.9, 0, {s: 0.22})); }
  else if(m === "equil"){ g.add(arrow([0, 0.35, 0], [0, 2, 0], 0x00e676), arrow([0, -0.35, 0], [0, -2, 0], 0xff5252), arrow([0.35, 0, 0], [2, 0, 0], 0xffd400), arrow([-0.35, 0, 0], [-2, 0, 0], 0x4f7bff));
    g.add(lab("daya bersih = 0", 0, 2.4, 0, {s: 0.26})); }
  else { var sp = new T.Group(); for(var i = 0; i < 10; i++) sp.add(at(rot(ring(0.3, 0xb0bec5, 0.04), Math.PI / 2, 0, 0), 0, -i * 0.18, 0)); g.children[0].position.y = -2.3; g.add(at(box(2, 0.15, 0.6, 0x6d4c41), 0, 0.2, 0), sp);
    g.add(lab("F = kx (Hukum Hooke)", 1.9, -0.8, 0, {s: 0.24}));
    return {g: g, tick: function(t){ var s = 1 + Math.sin(t * 2) * 0.25; sp.scale.y = s; g.children[0].position.y = -1.95 * s - 0.35; }, cam: [0, -0.6, 7]}; }
  return {g: g, cam: [0, 0.6, 7]}; };
// nuclear: decay, fission, half-life
K.nucleus = function(v){ var g = new T.Group(), m = v.m || "alpha", nuc = new T.Group();
  for(var i = 0; i < 26; i++){ var p = sph(0.2, i % 2 ? 0xe53935 : 0x9e9e9e); p.position.set((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9); nuc.add(p); } g.add(nuc);
  var em = new T.Group(); if(m === "alpha"){ em.add(at(sph(0.18, 0xe53935), -0.12, 0, 0), at(sph(0.18, 0xe53935), 0.12, 0.1, 0), at(sph(0.18, 0x9e9e9e), 0, -0.15, 0.1), at(sph(0.18, 0x9e9e9e), 0, 0.12, -0.12)); }
  else if(m === "beta"){ em.add(sph(0.1, 0x00e5ff)); } else if(m === "gamma"){ em.add(line([[-0.5, 0, 0], [-0.3, 0.2, 0], [-0.1, -0.2, 0], [0.1, 0.2, 0], [0.3, -0.2, 0], [0.5, 0, 0]], 0xffeb3b)); }
  else if(m === "fission"){ em.add(at(sph(0.15, 0x9e9e9e), 0, 0, 0)); nuc.scale.set(1.2, 1.2, 1.2); }
  g.add(em); var names = {alpha: "zarah alfa (⁴₂He)", beta: "zarah beta (elektron)", gamma: "sinar gama", fission: "neutron → pembelahan nukleus"};
  g.add(lab(v.l || names[m] || m, 0, 1.8, 0, {s: 0.26, w: 30}));
  return {g: g, tick: function(t){ var s = (t * 0.9) % 3; if(m === "fission"){ em.position.set(-3 + s * 1.2, 0, 0); var sp = s > 2.4 ? (s - 2.4) * 2 : 0; nuc.children.forEach(function(p, i){ p.position.x += (i % 2 ? 1 : -1) * sp * 0.004; }); if(s < 0.05) nuc.children.forEach(function(p){ p.position.x *= 0.5; }); }
    else em.position.set(0.8 + s * 1.2, 0.1, 0); nuc.rotation.y = t * 0.4; }, cam: [0, 0.6, 6.5]}; };
// photoelectric effect
K.photon = function(v){ var g = new T.Group(), plate = box(3, 0.2, 1.6, 0xb0bec5, {m: 0.8, r: 0.3}); g.add(at(plate, 0, -1, 0)); var ph = [], el = [];
  for(var i = 0; i < 4; i++){ var w = line([[0, 0, 0], [0.2, 0.15, 0], [0.4, -0.15, 0], [0.6, 0.15, 0], [0.8, 0, 0]], 0xb388ff); w.rotation.z = -0.9; g.add(w); ph.push(w); var e = sph(0.09, 0x00e5ff); g.add(e); el.push(e); }
  g.add(lab(v.l ? v.l[0] : "foton cahaya, E = hf", -2, 2, 0, {s: 0.24}), lab(v.l ? v.l[1] : "fotoelektron terpancar", 2, 1.6, 0, {s: 0.24}), lab(v.l ? v.l[2] : "logam", 0, -1.7, 0, {s: 0.22}));
  return {g: g, tick: function(t){ ph.forEach(function(w, i){ var s = (t * 0.8 + i * 0.25) % 1; w.position.set(-2.6 + s * 2.4 + i * 0.4, 1.8 - s * 2.6, 0); }); el.forEach(function(e, i){ var s = (t * 0.8 + i * 0.25 + 0.5) % 1; e.position.set(-0.6 + i * 0.4 + s * 2, -0.85 + s * 2.4, 0); }); }, cam: [0, 0.3, 7]}; };
// lens ray diagrams and optical instruments
K.lens = function(v){ var g = new T.Group(), m = v.m || "convex", L = M(new T.SphereGeometry(1.6, 32, 16).scale(0.18, 1, 1), 0xb3e5fc, {a: 0.55});
  if(m === "concave"){ L = box(0.25, 3, 1, 0xb3e5fc, {a: 0.5}); } g.add(L, line([[-4, 0, 0], [4, 0, 0]], 0x90a4ae, true));
  g.add(at(sph(0.07, 0xffffff), -1.5, 0, 0), at(sph(0.07, 0xffffff), 1.5, 0, 0), lab("F", -1.5, -0.35, 0, {s: 0.2, bg: false}), lab("F", 1.5, -0.35, 0, {s: 0.2, bg: false}));
  if(m === "convex" || m === "camera" || m === "projector"){ g.add(arrow([-3, 0, 0], [-3, 1, 0], 0x00e676), line([[-3, 1, 0], [0, 1, 0], [3, -1, 0]], 0xffd400), line([[-3, 1, 0], [3, -1, 0]], 0xffd400), arrow([3, 0, 0], [3, -1, 0], 0xff5252));
    g.add(lab("objek", -3, 1.5, 0, {s: 0.22}), lab("imej nyata, songsang", 3, -1.6, 0, {s: 0.22})); }
  else if(m === "magnify"){ g.add(arrow([-0.8, 0, 0], [-0.8, 0.6, 0], 0x00e676), line([[-0.8, 0.6, 0], [0, 0.6, 0], [2, -0.2, 0]], 0xffd400), line([[0, 0.6, 0], [-1.5, 1.2, 0]], 0xffd400, true), arrow([-1.9, 0, 0], [-1.9, 1.4, 0], 0xff8a80));
    g.add(lab("imej maya, tegak, dibesarkan", -1.9, 1.9, 0, {s: 0.22})); }
  else if(m === "concave"){ g.add(arrow([-3, 0, 0], [-3, 1, 0], 0x00e676), line([[-3, 1, 0], [0, 1, 0], [2.5, 2, 0]], 0xffd400), line([[0, 1, 0], [-1.5, 0, 0]], 0xffd400, true), arrow([-1, 0, 0], [-1, 0.45, 0], 0xff8a80), lab("imej maya, tegak, dikecilkan", -1, 1.6, 0, {s: 0.22})); }
  else { var L2 = L.clone(); L2.position.x = 2.6; g.add(L2); L.position.x = -1.2; g.add(lab(m === "telescope" ? "kanta objek → kanta mata (teleskop)" : "kanta objek → kanta mata (mikroskop)", 0, 2, 0, {s: 0.24}), line([[-4, 0.6, 0], [-1.2, 0.6, 0], [2.6, -0.5, 0], [4, -1, 0]], 0xffd400)); }
  return {g: g, cam: [0, 0.4, 8]}; };
// Punnett square
K.punnett = function(v){ var g = new T.Group(), a = v.a || ["R", "r"], b = v.b || ["R", "r"], n = a.length, s = n > 2 ? 0.9 : 1.2;
  a.forEach(function(x, i){ g.add(lab(x, (i - (n - 1) / 2) * s, (n / 2) * s + 0.4, 0, {s: 0.26, bg: "rgba(79,123,255,0.9)"})); });
  b.forEach(function(y, j){ g.add(lab(y, -(n / 2) * s - 0.5, ((n - 1) / 2 - j) * s, 0, {s: 0.26, bg: "rgba(224,69,123,0.9)"})); });
  a.forEach(function(x, i){ b.forEach(function(y, j){ var gt = (x + y).split("").sort(function(p, q){ return p.toLowerCase() === q.toLowerCase() ? (p < q ? -1 : 1) : (p.toLowerCase() < q.toLowerCase() ? -1 : 1); }).join(""), dom = /[A-Z]/.test(gt);
    g.add(at(box(s * 0.92, s * 0.92, 0.12, dom ? 0x43a047 : 0xf0a030), (i - (n - 1) / 2) * s, ((n - 1) / 2 - j) * s, 0), lab(gt, (i - (n - 1) / 2) * s, ((n - 1) / 2 - j) * s, 0.15, {s: n > 2 ? 0.17 : 0.24, bg: false})); }); });
  if(v.l) g.add(lab(v.l, 0, -(n / 2) * s - 0.6, 0, {s: 0.24, w: 34})); return {g: g, cam: [0, 0, n > 2 ? 7.5 : 5.5]}; };
// DNA double helix
K.dna = function(v){ var g = new T.Group(); for(var i = 0; i < 22; i++){ var a = i * 0.5, y = -2.6 + i * 0.25, x1 = Math.cos(a) * 0.9, z1 = Math.sin(a) * 0.9;
    g.add(at(sph(0.12, 0x4f7bff), x1, y, z1), at(sph(0.12, 0xe0457b), -x1, y, -z1)); var bp = cyl(0.04, 0.04, 1.8, col(i % 4 + 2)); bp.position.set(0, y, 0); bp.rotation.z = Math.PI / 2; bp.rotation.y = -a; g.add(bp); }
  if(v.l) g.add(lab(v.l, 0, 3.1, 0, {s: 0.26, w: 30})); return {g: g, spin: 1, cam: [0, 0.3, 7]}; };
// carbon compounds: chains, double bonds, -OH, -COOH, polymer
K.carbon = function(v){ var g = new T.Group(), n = v.n || 2, t = v.t || "alkane";
  function atom(e, x, y, z){ var C = {C: [0x424242, 0.32], H: [0xffffff, 0.2], O: [0xff1744, 0.3]}[e]; g.add(at(sph(C[1], C[0], {r: 0.35}), x, y, z || 0)); }
  function bond(a, b, d){ var p = new T.Vector3(a[0], a[1], 0), q = new T.Vector3(b[0], b[1], 0), off = d ? 0.07 : 0; [-off, off].slice(0, d ? 2 : 1).forEach(function(o){ var c = cyl(0.05, 0.05, p.distanceTo(q), 0xbdbdbd); c.position.copy(p.clone().add(q).multiplyScalar(0.5)); c.position.y += o; c.lookAt(q.clone().setY(q.y + o)); c.rotateX(Math.PI / 2); g.add(c); }); }
  var X = function(i){ return (i - (n - 1) / 2) * 1.1; };
  for(var i = 0; i < n; i++){ var last = i === n - 1; atom("C", X(i), 0); if(i) bond([X(i - 1), 0], [X(i), 0], t === "alkene" && i === 1);
    if(!(last && t === "acid")){ atom("H", X(i), 0.95); bond([X(i), 0], [X(i), 0.95]); }
    if(!(t === "alkene" && i <= 1) && !(last && (t === "alcohol" || t === "acid"))){ atom("H", X(i), -0.95); bond([X(i), 0], [X(i), -0.95]); }
    if(i === 0){ atom("H", X(i) - 0.95, 0); bond([X(i), 0], [X(i) - 0.95, 0]); } }
  var e = X(n - 1);
  if(t === "alcohol"){ atom("O", e, -1); bond([e, 0], [e, -1]); atom("H", e + 0.8, -1.3); bond([e, -1], [e + 0.8, -1.3]); atom("H", e + 0.95, 0); bond([e, 0], [e + 0.95, 0]); }
  else if(t === "acid"){ atom("O", e, -1); bond([e, 0], [e, -1], true); atom("O", e + 1, 0); bond([e, 0], [e + 1, 0]); atom("H", e + 1.7, 0.4); bond([e + 1, 0], [e + 1.7, 0.4]); }
  else if(n > 0){ atom("H", e + 0.95, 0); bond([e, 0], [e + 0.95, 0]); }
  g.add(lab(v.l || t, 0, 1.9, 0, {s: 0.28})); return {g: g, spin: 1, cam: [0, 0.4, Math.max(5.5, n * 1.6 + 3)]}; };
K.polymer = function(v){ var g = new T.Group(), n = 9, c = new T.CatmullRomCurve3([]), pts = [];
  for(var i = 0; i < n * 3; i++){ var a = i * 0.45, p = new T.Vector3(-3.4 + i * 0.26, Math.sin(a) * 0.6, Math.cos(a * 0.7) * 0.5); pts.push(p); g.add(at(sph(0.15, Math.floor(i / 3) % 2 ? col(v.ci || 0) : col((v.ci || 0) + 1)), p.x, p.y, p.z)); }
  g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 120, 0.05, 6), mat(0xbdbdbd)));
  g.add(lab(v.l || "monomer → polimer", 0, 1.6, 0, {s: 0.26, w: 30})); return {g: g, spin: 1, cam: [0, 0.6, 7]}; };
// electrochemical cells and rusting
K.echem = function(v){ var g = new T.Group(), m = v.m || "electrolytic"; g.add(at(cyl(1.6, 1.6, 2.2, 0xb3e5fc, {a: 0.35}), 0, -0.4, 0), at(cyl(1.55, 1.55, 1.6, 0x4fc3f7, {a: 0.5}), 0, -0.7, 0));
  g.add(at(box(0.25, 2.4, 0.25, m === "daniell" ? 0xff7043 : 0x9e9e9e), -0.8, 0, 0), at(box(0.25, 2.4, 0.25, m === "daniell" ? 0xb0bec5 : 0x9e9e9e), 0.8, 0, 0));
  g.add(line([[-0.8, 1.2, 0], [-0.8, 2, 0], [0.8, 2, 0], [0.8, 1.2, 0]], 0xb0bec5));
  if(m === "electrolytic"){ g.add(at(box(0.6, 0.3, 0.3, 0x212121), 0, 2, 0), lab("anod (+)", -1.6, 1.4, 0, {s: 0.22}), lab("katod (−)", 1.6, 1.4, 0, {s: 0.22})); }
  else if(m === "daniell"){ g.add(at(rot(cyl(0.3, 0.3, 0.1, 0xeeeeee), Math.PI / 2, 0, 0), 0, 2, 0), lab("V", 0, 2, 0.15, {s: 0.22, bg: false, fg: "#111"}), lab("Cu (+)", -1.6, 1.4, 0, {s: 0.22}), lab("Zn (−)", 1.6, 1.4, 0, {s: 0.22})); }
  else { g.children.length = 0; g.add(at(box(3, 0.3, 0.6, 0x8d6e63), 0, 0, 0)); for(var r = 0; r < 14; r++) g.add(at(sph(0.1 + Math.random() * 0.08, 0xbf360c), -1.3 + Math.random() * 2.6, 0.18, -0.2 + Math.random() * 0.4)); g.add(lab("Fe → Fe²⁺ + 2e⁻ (air + oksigen = karat)", 0, 1, 0, {s: 0.24, w: 30})); }
  var ions = []; if(m !== "rust"){ for(var i = 0; i < 10; i++){ var s = sph(0.09, i % 2 ? 0x00e676 : 0xff5252); ions.push(s); g.add(s); } }
  if(v.l) g.add(lab(v.l, 0, -2.4, 1.8, {s: 0.22, w: 34}));
  return {g: g, tick: function(t){ ions.forEach(function(s, i){ var p = ((t * 0.3 + i * 0.1) % 1), dir = i % 2 ? 1 : -1; s.position.set(dir * (-0.7 + p * 1.4) * -1, -1.2 + (i % 5) * 0.25, (i % 3 - 1) * 0.5); }); }, cam: [0, 0.6, 6.8]}; };
// logic gates with truth table
K.gate = function(v){ var g = new T.Group(), m = v.m || "AND", body;
  if(m === "NOT"){ body = rot(cone(0.7, 1.4, 0x4f7bff, 3), 0, 0, -Math.PI / 2); g.add(body, at(sph(0.15, 0x4f7bff), 0.85, 0, 0)); }
  else { var sh = new T.Shape(); sh.moveTo(-0.8, -0.8); sh.lineTo(0, -0.8); sh.absarc(0, 0, 0.8, -Math.PI / 2, Math.PI / 2, false); sh.lineTo(-0.8, 0.8); sh.lineTo(-0.8, -0.8); body = M(new T.ExtrudeGeometry(sh, {depth: 0.3, bevelEnabled: false}), m.indexOf("OR") >= 0 ? 0xf0a030 : 0x4f7bff); body.position.z = -0.15; g.add(body); if(/^N/.test(m)) g.add(at(sph(0.15, 0x4f7bff), 0.95, 0, 0)); }
  g.add(line([[-2, 0.4, 0], [-0.8, 0.4, 0]], 0xffffff), line([[1.1, 0, 0], [2, 0, 0]], 0xffffff)); if(m !== "NOT") g.add(line([[-2, -0.4, 0], [-0.8, -0.4, 0]], 0xffffff));
  g.add(lab("A", -2.3, 0.4, 0, {s: 0.24}), lab("X", 2.3, 0, 0, {s: 0.24}), lab(m, 0, 1.2, 0, {s: 0.3})); if(m !== "NOT") g.add(lab("B", -2.3, -0.4, 0, {s: 0.24}));
  var tt = {AND: "00→0  01→0  10→0  11→1", OR: "00→0  01→1  10→1  11→1", NOT: "0→1  1→0", NAND: "00→1  01→1  10→1  11→0", NOR: "00→1  01→0  10→0  11→0"}[m];
  g.add(lab(tt, 0, -1.4, 0, {s: 0.24})); return {g: g, cam: [0, 0, 6]}; };
// table (spreadsheet / statement / SQL)
K.table = function(v){ var g = new T.Group(), rows = [v.h].concat(v.r || []), nc = v.h.length, W = v.wd || nc * 1.8;
  rows.forEach(function(r, i){ r.forEach(function(c, j){ var w = W / nc, x = -W / 2 + w * (j + 0.5), y = (rows.length - 1) / 2 * 0.62 - i * 0.62;
    g.add(at(box(w - 0.06, 0.56, 0.1, i === 0 ? 0x4f7bff : (v.hl === i ? 0x43a047 : (i % 2 ? 0x2a3350 : 0x323c5e))), x, y, 0), lab(String(c), x, y, 0.1, {s: 0.19, bg: false, w: 18})); }); });
  if(v.l) g.add(lab(v.l, 0, -(rows.length / 2) * 0.62 - 0.5, 0, {s: 0.24, w: 36})); return {g: g, cam: [0, 0, Math.max(6, W * 1.05, rows.length * 0.9)]}; };
// transformations: enlargement, congruence, tessellation
K.transform = function(v){ var g = new T.Group(), m = v.m || "enlarge"; function tri(s, x, y, c, r){ var sh = new T.Shape(); sh.moveTo(0, 0); sh.lineTo(1 * s, 0); sh.lineTo(0, 0.8 * s); sh.lineTo(0, 0); var t = M(new T.ShapeGeometry(sh), c, {ds: true, a: 0.85}); t.position.set(x, y, 0); t.rotation.z = r || 0; g.add(t); return t; }
  if(m === "enlarge"){ g.add(at(sph(0.08, 0xffffff), -3, -1.6, 0), lab("O", -3.3, -1.9, 0, {s: 0.2, bg: false})); tri(1, -2, -1.2, col(0)); tri(2, -1, -0.8, col(1)); g.add(line([[-3, -1.6, 0], [1, 0.0, 0]], 0x90a4ae, true), line([[-3, -1.6, 0], [-1, 0.8, 0]], 0x90a4ae, true)); g.add(lab(v.l || "faktor skala k = 2: luas × k² = 4", 0, 2, 0, {s: 0.24, w: 30})); }
  else if(m === "congruent"){ tri(1.5, -2.5, -0.8, col(0)); tri(1.5, 1.8, 0.7, col(0), Math.PI); g.add(lab(v.l || "kongruen: sama bentuk dan sama saiz", 0, 2, 0, {s: 0.24, w: 30})); }
  else { for(var i = -3; i <= 3; i++) for(var j = -2; j <= 2; j++){ var hx = new T.Mesh(new T.CircleGeometry(0.5, 6), mat(col((i + j + 10) % 4), {ds: true})); hx.position.set(i * 0.87 + (j % 2 ? 0.43 : 0), j * 0.75, 0); hx.rotation.z = Math.PI / 6; g.add(hx); } g.add(lab(v.l || "teselasi heksagon sekata", 0, 2.2, 0.1, {s: 0.24})); }
  return {g: g, cam: [0, 0.2, 7.5]}; };
// circle sector for radians
K.sector = function(v){ var g = new T.Group(), d = (v.deg || 60) * Math.PI / 180, r = 2;
  g.add(rot(ring(r, 0xffffff, 0.02), 0, 0, 0), M(new T.CircleGeometry(r, 48, 0, d), 0x4f7bff, {ds: true, a: 0.8}), line([[0, 0, 0], [r, 0, 0]], 0xffd400), line([[0, 0, 0], [r * Math.cos(d), r * Math.sin(d), 0]], 0xffd400));
  g.add(new T.Mesh(new T.TubeGeometry(new T.EllipseCurve(0, 0, r, r, 0, d).getPoints ? new T.CatmullRomCurve3(new T.EllipseCurve(0, 0, r + 0.02, r + 0.02, 0, d, false, 0).getPoints(40).map(function(p){ return new T.Vector3(p.x, p.y, 0.02); })) : null, 60, 0.05, 6), mat(0xff5252)));
  g.add(lab("j", r / 2, -0.3, 0, {s: 0.22, bg: false}), lab("θ", 0.45, 0.2, 0.05, {s: 0.22, bg: false}), lab(v.l || "s = jθ   A = ½j²θ", 0, -2.5, 0, {s: 0.26}));
  if(v.t) g.add(lab(v.t, 0, 2.6, 0, {s: 0.24})); return {g: g, cam: [0, 0, 7]}; };
// feasible region for linear programming
K.region = function(v){ var g = new T.Group(); for(var x = 0; x <= 8; x++) g.add(line([[x * 0.5 - 2, -1.8, 0], [x * 0.5 - 2, 2.2, 0]], 0x37474f)); for(var y = 0; y <= 8; y++) g.add(line([[-2, y * 0.5 - 1.8, 0], [2.2, y * 0.5 - 1.8, 0]], 0x37474f));
  g.add(arrow([-2, -1.8, 0], [2.6, -1.8, 0], 0xffffff), arrow([-2, -1.8, 0], [-2, 2.6, 0], 0xffffff)); var sh = new T.Shape(); sh.moveTo(-2, -1.8); sh.lineTo(1.5, -1.8); sh.lineTo(0.5, 0.7); sh.lineTo(-2, 1.4); sh.lineTo(-2, -1.8);
  g.add(M(new T.ShapeGeometry(sh), 0x43a047, {a: 0.55, ds: true}), line([[1.5, -1.8, 0], [0.5, 0.7, 0], [-2, 1.4, 0]], 0xffd400));
  g.add(at(sph(0.1, 0xff5252), 0.5, 0.7, 0.05), lab(v.p || "titik optimum", 1.4, 1.1, 0.1, {s: 0.22}), lab(v.l || "rantau tersaur R", -0.8, -0.6, 0.1, {s: 0.24}), lab("x", 2.8, -1.8, 0, {s: 0.22, bg: false}), lab("y", -2, 2.8, 0, {s: 0.22, bg: false}));
  return {g: g, cam: [0, 0.2, 7]}; };
// arrangements for permutations / combinations
K.arrange = function(v){ var g = new T.Group(), it = v.d || ["A", "B", "C"], perms = [];
  function pm(a, s){ if(!a.length){ perms.push(s); return; } a.forEach(function(x, i){ pm(a.slice(0, i).concat(a.slice(i + 1)), s.concat([x])); }); } pm(it.slice(0, 3), []);
  perms.slice(0, 6).forEach(function(p, r){ p.forEach(function(x, c){ g.add(at(box(0.55, 0.55, 0.3, col(it.indexOf(x))), (c - 1) * 0.65 + (r % 2 ? 1.6 : -1.6), 1.2 - Math.floor(r / 2) * 0.9, 0), lab(x, (c - 1) * 0.65 + (r % 2 ? 1.6 : -1.6), 1.2 - Math.floor(r / 2) * 0.9, 0.2, {s: 0.22, bg: false})); }); });
  g.add(lab(v.l || "3! = 6 susunan", 0, 2.2, 0, {s: 0.26})); return {g: g, cam: [0, 0, 7]}; };
// satellites around the Earth
K.orbit = function(v){ var g = new T.Group(); g.add(sph(1.3, 0x1e88e5, {r: 0.8})); var sats = [];
  [[2.4, 0, "orbit rendah"], [3.6, 0.5, "orbit geopegun"]].forEach(function(o, i){ var r = ring(o[0], 0x90a4ae, 0.015); r.rotation.x = Math.PI / 2 + o[1] * 0.3; g.add(r); var s = new T.Group(); s.add(box(0.25, 0.18, 0.18, 0xeeeeee), at(box(0.6, 0.02, 0.22, 0x1565c0), 0.42, 0, 0), at(box(0.6, 0.02, 0.22, 0x1565c0), -0.42, 0, 0)); g.add(s); sats.push([s, o[0], o[1], i]); g.add(lab(o[2], o[0] + 0.3, 0.6 + i * 0.4, 0, {s: 0.22})); });
  if(v.gps) for(var k = 0; k < 4; k++){ var sp = at(sph(0.1, 0xffeb3b), Math.cos(k * 1.6) * 3, 1.5 + (k % 2) * 0.6, Math.sin(k * 1.6) * 3); g.add(sp, line([[sp.position.x, sp.position.y, sp.position.z], [0.4, 1.2, 0.5]], 0xffeb3b, true)); }
  if(v.l) g.add(lab(v.l, 0, 2.9, 0, {s: 0.24, w: 30}));
  return {g: g, tick: function(t){ sats.forEach(function(s){ var a = t * (s[3] ? 0.3 : 0.9) + s[3]; s[0].position.set(Math.cos(a) * s[1], Math.sin(a) * s[1] * Math.sin(s[2] * 0.3), Math.sin(a) * s[1]); }); }, cam: [0, 2.6, 8]}; };
// ---------- 0.7.12 Form 2–4 scene modes (added on top of the templates above) ----------
(function(){
  var cellB = K.cell, molB = K.molecule, partB = K.particles, nucB = K.nucleus, forB = K.forces, ligB = K.light;
  // cell division: one cell splits into 2 (mitosis) or 4 (meiosis) daughter cells with chromosomes
  K.cell = function(v){ if(v.m !== "mitosis" && v.m !== "meiosis") return cellB(v);
    var g = new T.Group(), n = v.m === "meiosis" ? 4 : 2, cells = [];
    for(var i = 0; i < n; i++){ var c = new T.Group(); c.add(M(new T.SphereGeometry(0.9, 28, 18), 0xffab91, {a: 0.45}));
      for(var k = 0; k < (n === 4 ? 2 : 4); k++) c.add(at(rot(M(new T.CapsuleGeometry(0.06, 0.4, 4, 8), col(k)), 0, 0, k * 0.8), (k - 1) * 0.22, 0, 0.2));
      g.add(c); cells.push(c); }
    var L = v.l || (n === 2 ? ["sel induk 2n", "2 sel anak 2n (seiras)"] : ["sel induk 2n", "4 sel anak n (berbeza)"]);
    g.add(lab(L[0], 0, 2.1, 0, {s: 0.26}), lab(L[1], 0, -2.1, 0, {s: 0.26}));
    return {g: g, tick: function(t){ var s = (Math.sin(t * 0.9) + 1) / 2; cells.forEach(function(c, i){ var a = n === 2 ? (i ? 1 : -1) : null;
      if(n === 2) c.position.set(a * s * 1.1, 0, 0); else c.position.set((i % 2 ? 1 : -1) * s * 1.1, (i < 2 ? 1 : -1) * s * 0.9, 0); c.scale.setScalar(1 - s * (n === 4 ? 0.35 : 0.2)); }); }, cam: [0, 0.4, 7]}; };
  // more molecules; key is case-insensitive
  K.molecule = function(v){ var m = String(v.m || "H2O"), u = m.toUpperCase(), map = {H2O: "H2O", CO2: "CO2", O2: "O2", N2: "N2", NACL: "NaCl", HE: "He", FE: "Fe"};
    if(map[u]) return molB(Object.assign({}, v, {m: map[u]}));
    var X = {CL2: [["Cl", -0.6, 0, 0], ["Cl", 0.6, 0, 0]], NH4: [["N", 0, 0, 0], ["H", 0.6, 0.6, 0.6], ["H", -0.6, -0.6, 0.6], ["H", -0.6, 0.6, -0.6], ["H", 0.6, -0.6, -0.6]],
      CH4: [["C", 0, 0, 0], ["H", 0.6, 0.6, 0.6], ["H", -0.6, -0.6, 0.6], ["H", -0.6, 0.6, -0.6], ["H", 0.6, -0.6, -0.6]], HCL: [["H", -0.5, 0, 0], ["Cl", 0.5, 0, 0]]}[u];
    if(!X) return molB(v);
    var E = {H: [0xffffff, 0.32], C: [0x424242, 0.48], N: [0x2979ff, 0.48], Cl: [0x00e676, 0.6]}, g = new T.Group();
    X.forEach(function(a, j){ var e = E[a[0]]; g.add(at(sph(e[1], e[0], {r: 0.3}), a[1], a[2], a[3]));
      if(j){ var p = new T.Vector3(a[1], a[2], a[3]), q = new T.Vector3(X[0][1], X[0][2], X[0][3]), b = cyl(0.08, 0.08, p.distanceTo(q), 0xbdbdbd); b.position.copy(p.clone().add(q).multiplyScalar(0.5)); b.lookAt(q); b.rotateX(Math.PI / 2); g.add(b); } });
    var nm = {CL2: "Cl₂", NH4: "NH₄⁺", CH4: "CH₄", HCL: "HCl"}[u];
    if(v.l) v.l.forEach(function(t, k){ g.add(lab(t, -1.8 + k * 3.6, 1.7, 0)); }); else g.add(lab(nm, 0, 1.8, 0));
    return {g: g, spin: 1, cam: [0, 1, 5.5]}; };
  // particles: "states" = all three; "alloy" / "metal" lattices; "diffuse" = gas
  K.particles = function(v){ var m = v.m;
    if(m === "states") return partB(Object.assign({}, v, {m: "all"}));
    if(m === "diffuse") return partB(Object.assign({}, v, {m: "gas", n: v.n || ["resapan"]}));
    if(m !== "alloy" && m !== "metal") return partB(v);
    var g = new T.Group(), dots = [];
    for(var i = 0; i < 27; i++){ var x = i % 3 - 1, y = Math.floor(i / 3) % 3 - 1, z = Math.floor(i / 9) - 1, odd = m === "alloy" && (i === 4 || i === 13 || i === 22);
      g.add(at(sph(odd ? 0.36 : 0.26, odd ? 0xf0a030 : 0x90a4ae, {m: 0.6, r: 0.3}), x * 0.65, y * 0.65, z * 0.65)); }
    if(m === "metal") for(var j = 0; j < 30; j++){ var d = sph(0.06, 0x00e5ff); d.userData = {p: Math.random() * 6, a: Math.random() * 6}; g.add(d); dots.push(d); }
    g.add(lab((v.n && v.n[0]) || (m === "alloy" ? "atom asing menghalang lapisan menggelongsor" : "ion logam dalam lautan elektron"), 0, 1.6, 0, {s: 0.24, w: 30}));
    return {g: g, spin: 1, tick: function(t){ dots.forEach(function(d){ var u = d.userData; d.position.set(Math.sin(t * 1.3 + u.p) * 1.1, Math.cos(t * 0.9 + u.a) * 1.1, Math.sin(t * 0.7 + u.a + u.p) * 1.1); }); }, cam: [0, 1, 5.5]}; };
  // atom model: nucleus with p protons and n neutrons, electrons in shells 2.8.8.2
  K.nucleus = function(v){ if(v.m && v.m !== "atom") return nucB(v); if(!v.m && v.p == null) return nucB(v);
    var g = new T.Group(), p = v.p || 6, n = v.n == null ? p : v.n, nuc = new T.Group(), tot = p + n, r = 0.12 + Math.cbrt(tot) * 0.09, els = [];
    for(var i = 0; i < tot; i++){ var s = sph(0.13, i < p ? 0xe53935 : 0x9e9e9e), a = Math.random() * 6.3, b = Math.acos(2 * Math.random() - 1), rr = r * Math.cbrt(Math.random());
      s.position.set(rr * Math.sin(b) * Math.cos(a), rr * Math.sin(b) * Math.sin(a), rr * Math.cos(b)); nuc.add(s); } g.add(nuc);
    var left = p, cap = [2, 8, 8, 18], sh = 0; while(left > 0 && sh < 4){ var k = Math.min(left, cap[sh]), R = 0.9 + sh * 0.55; g.add(ring(R, 0x546e7a, 0.012));
      for(var e = 0; e < k; e++){ var d = sph(0.08, 0x00e5ff); d.userData = {R: R, a: e / k * Math.PI * 2, w: 0.6 / (sh + 1)}; g.add(d); els.push(d); } left -= k; sh++; }
    g.add(lab(v.l || (p + " proton · " + n + " neutron · " + p + " elektron"), 0, 0.9 + sh * 0.55 + 0.4, 0, {s: 0.24, w: 34}));
    return {g: g, tick: function(t){ els.forEach(function(d){ var u = d.userData, a = u.a + t * u.w; d.position.set(Math.cos(a) * u.R, Math.sin(a) * u.R, 0); }); nuc.rotation.y = t * 0.3; }, cam: [0, 0.5, 5.6 + sh * 1.4]}; };
  // motion scenes: moving box with velocity, free fall, collision, inertia
  K.forces = function(v){ var m = v.m; if(["motion", "fall", "collision", "inertia"].indexOf(m) < 0) return forB(v);
    var g = new T.Group(); g.add(at(box(6, 0.08, 1.2, 0x546e7a), 0, -0.6, 0)); var A, B, va;
    if(m === "fall"){ g.children[0].position.y = -2.2; A = sph(0.3, 0xf0a030); g.add(A); g.add(arrow([1, 1.6, 0], [1, 0.4, 0], 0xff5252), lab("g = 9.81 m s⁻²", 1.9, 1, 0, {s: 0.22}));
      return {g: g, tick: function(t){ var s = (t * 0.8) % 1.4; A.position.set(0, 2 - 0.5 * 9.81 * s * s * 0.28, 0); if(A.position.y < -1.9) A.position.y = -1.9; }, cam: [0, 0, 7.5]}; }
    A = box(0.6, 0.6, 0.6, 0x4f7bff); g.add(A);
    if(m === "collision"){ B = box(0.6, 0.6, 0.6, 0xf0a030); g.add(B); g.add(lab(v.l || "jumlah momentum sebelum = selepas", 0, 1.6, 0, {s: 0.24}));
      return {g: g, tick: function(t){ var s = (t * 0.6) % 3; if(s < 1.5){ A.position.set(-2.5 + s * 1.67, -0.25, 0); B.position.set(0.6, -0.25, 0); } else { var d = (s - 1.5) * 0.55; A.position.set(-0.0 + d, -0.25, 0); B.position.set(0.6 + d, -0.25, 0); } }, cam: [0, 0.6, 7]}; }
    if(m === "inertia"){ B = sph(0.22, 0xf0a030); g.add(B); g.add(lab(v.l || "kereta berhenti, objek terus bergerak ke depan", 0, 1.7, 0, {s: 0.24, w: 30}));
      return {g: g, tick: function(t){ var s = (t * 0.6) % 3, x = Math.min(s, 1.5) * 1.6 - 2.4; A.position.set(x, -0.25, 0); B.position.set(x + (s > 1.5 ? (s - 1.5) * 1.4 : 0), 0.3 + (s > 1.5 ? -(s - 1.5) * 0.3 : 0), 0); }, cam: [0, 0.6, 7]}; }
    va = new T.Group(); va.add(arrow([0, 0.6, 0], [1.1, 0.6, 0], 0x00e676), lab("v", 1.3, 0.6, 0, {s: 0.22})); g.add(va); g.add(lab(v.l || "a = (v − u) / t", 0, 1.8, 0, {s: 0.26}));
    return {g: g, tick: function(t){ var s = (t * 0.5) % 2, x = -2.6 + s * s * 1.3; A.position.set(x, -0.25, 0); va.position.set(x, -0.25, 0); va.scale.set(0.4 + s * 0.6, 1, 1); }, cam: [0, 0.6, 7]}; };
  // waves: plane waves meeting a slit (diffraction) or two slits (interference)
  K.light = function(v){ var m = v.m; if(m !== "diffract" && m !== "interfere") return ligB(v);
    var g = new T.Group(), fr = [], two = m === "interfere";
    g.add(at(box(0.15, 1.6, 0.3, 0x90a4ae), 0, 2.0, 0), at(box(0.15, 1.6, 0.3, 0x90a4ae), 0, -2.0, 0)); if(two) g.add(at(box(0.15, 0.9, 0.3, 0x90a4ae), 0, 0, 0));
    for(var i = 0; i < 5; i++){ var w = line([[0, -2.6, 0], [0, 2.6, 0]], 0x4fc3f7); g.add(w); fr.push({o: w, k: "p", i: i}); }
    var src = two ? [0.75, -0.75] : [0];
    src.forEach(function(y0){ for(var j = 0; j < 5; j++){ var pts = []; for(var a = -80; a <= 80; a += 8){ var r = 1; pts.push([Math.cos(a * Math.PI / 180) * r, y0 + Math.sin(a * Math.PI / 180) * r, 0]); }
      var c = line(pts, two ? (y0 > 0 ? 0xffd54f : 0xff8a65) : 0x4fc3f7); g.add(c); fr.push({o: c, k: "c", i: j, y: y0}); } });
    g.add(lab(v.l || (two ? "interferens membina dan memusnah" : "pembelauan melalui celah"), 0, 3.2, 0, {s: 0.26}));
    return {g: g, tick: function(t){ fr.forEach(function(f){ var s = ((t * 0.5 + f.i * 0.6) % 3); if(f.k === "p") f.o.position.x = -3.2 + s; else { var r = 0.2 + s; f.o.scale.set(r, r, 1); f.o.position.set(0.1, f.y * (1 - r), 0); } }); }, cam: [0, 0, 8.5]}; };
})();
// ---------- render ----------
function scene(v, w, h){ var sc = new T.Scene(), cam = new T.PerspectiveCamera(45, w / h, 0.1, 100), r = (K[v.k] || K.hub)(v);
  sc.add(new T.HemisphereLight(0xffffff, 0x445566, 1.4)); var dl = new T.DirectionalLight(0xffffff, 1.6); dl.position.set(4, 8, 6); sc.add(dl);
  sc.add(r.g); var c = r.cam || [0, 2.5, 7.5], f = Math.pow(Math.max(1, 1.6 / (w / h)), 0.85); cam.position.set(c[0] * f, c[1] * f, c[2] * f); cam.lookAt(0, 0, 0); r.g.rotation.y = r.spin ? -0.35 : 0; return {sc: sc, cam: cam, r: r}; }
function dispose(o){ o.traverse(function(x){ if(x.geometry) x.geometry.dispose(); if(x.material){ if(x.material.map) x.material.map.dispose(); x.material.dispose(); } }); }
function still(v, cb){ var key = JSON.stringify(v); if(CACHE[key]){ cb(CACHE[key]); return; }
  try{ if(!SNAP){ SNAP = new T.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true}); SNAP.setPixelRatio(1); SNAP.setSize(640, 400, false); SNAP.outputColorSpace = T.SRGBColorSpace; }
    var s = scene(v, 640, 400); if(s.r.tick) s.r.tick(0.8); SNAP.setClearColor(0x1b2238, 1); SNAP.render(s.sc, s.cam); var url = SNAP.domElement.toDataURL("image/jpeg", 0.82); dispose(s.sc); CACHE[key] = url; cb(url); }
  catch(e){ cb(null); } }
function open3d(v, lang){ var ov = document.createElement("div"); ov.className = "notaLapis vizLapis"; ov.innerHTML = '<div class="vizWin"><div class="vizBar"><b>' + esc(v.c || "3D") + '</b><button class="vizX" aria-label="close">✕</button></div><div class="vizStage"></div><div class="vizTip">' + (lang === "en" ? "Drag to turn · pinch or scroll to zoom" : "Seret untuk pusing · cubit atau tatal untuk zum") + '</div></div>';
  document.body.appendChild(ov); var st = ov.querySelector(".vizStage"), W = st.clientWidth || 340, H = st.clientHeight || 300, rd = new T.WebGLRenderer({antialias: true});
  rd.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); rd.setSize(W, H); rd.outputColorSpace = T.SRGBColorSpace; rd.setClearColor(0x1b2238, 1); st.appendChild(rd.domElement);
  var s = scene(v, W, H), alive = true, t0 = performance.now(), drag = null, ry = s.r.g.rotation.y, rx = 0, zoom = 1, base = s.cam.position.clone(), auto = true, pts = {};
  function frame(){ if(!alive || !document.body.contains(ov)){ stop(); return; } var t = (performance.now() - t0) / 1000; if(s.r.tick) s.r.tick(t); if(auto && s.r.spin) ry += 0.004;
    s.r.g.rotation.y = ry; s.r.g.rotation.x = rx; s.cam.position.copy(base).multiplyScalar(zoom); s.cam.lookAt(0, 0, 0); rd.render(s.sc, s.cam); requestAnimationFrame(frame); }
  function stop(){ alive = false; dispose(s.sc); rd.dispose(); if(ov.parentNode) ov.remove(); }
  var cv = rd.domElement; cv.style.touchAction = "none";
  cv.addEventListener("pointerdown", function(e){ pts[e.pointerId] = [e.clientX, e.clientY]; drag = [e.clientX, e.clientY]; auto = false; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", function(e){ if(!pts[e.pointerId]) return; var ids = Object.keys(pts);
    if(ids.length === 2){ var o = pts[ids[0] == e.pointerId ? ids[1] : ids[0]], d0 = Math.hypot(pts[e.pointerId][0] - o[0], pts[e.pointerId][1] - o[1]), d1 = Math.hypot(e.clientX - o[0], e.clientY - o[1]); zoom = Math.max(0.45, Math.min(2.2, zoom * d0 / (d1 || 1))); }
    else if(drag){ ry += (e.clientX - drag[0]) * 0.01; rx = Math.max(-1.2, Math.min(1.2, rx + (e.clientY - drag[1]) * 0.008)); drag = [e.clientX, e.clientY]; } pts[e.pointerId] = [e.clientX, e.clientY]; });
  ["pointerup", "pointercancel"].forEach(function(n){ cv.addEventListener(n, function(e){ delete pts[e.pointerId]; drag = null; }); });
  cv.addEventListener("wheel", function(e){ e.preventDefault(); zoom = Math.max(0.45, Math.min(2.2, zoom * (e.deltaY > 0 ? 1.08 : 0.93))); }, {passive: false});
  ov.querySelector(".vizX").onclick = stop; ov.addEventListener("click", function(e){ if(e.target === ov) stop(); }); frame(); }
function html(v){ return '<figure class="nviz" data-v="' + esc(JSON.stringify(v)) + '"><div class="nvizImg"></div>' + (v.c ? '<figcaption>' + esc(v.c) + '</figcaption>' : "") + "</figure>"; }
function card(fig, v, lang){ var box2 = fig.querySelector(".nvizImg"), L = (v.l || v.n || v.d || []).map(function(x){ return Array.isArray(x) ? x[0] : x; }).slice(0, 6);
  box2.classList.add("nvizCard"); box2.innerHTML = "<b>" + esc(v.c || "") + "</b>" + (L.length ? "<span>" + L.map(esc).join(" · ") + "</span>" : ""); }
function hydrate(root, lang){ if(!root) return; var figs = [].slice.call(root.querySelectorAll(".nviz:not([data-ok])")); if(!figs.length) return;
  var gl = webgl(); figs.forEach(function(f){ f.setAttribute("data-ok", "1"); });
  function draw(f){ var v; try{ v = JSON.parse(f.getAttribute("data-v")); }catch(e){ return; } if(!gl){ card(f, v, lang); return; }
    load(function(ok){ if(!ok){ card(f, v, lang); return; } still(v, function(url){ var b = f.querySelector(".nvizImg"); if(!url){ card(f, v, lang); return; }
      b.innerHTML = '<img alt="' + esc(v.c || "") + '" src="' + url + '"><button class="nviz3d">🧊 ' + (lang === "en" ? "View in 3D" : "Lihat 3D") + "</button>";
      b.querySelector(".nviz3d").onclick = function(e){ e.stopPropagation(); open3d(v, lang); }; b.querySelector("img").onclick = function(){ open3d(v, lang); }; }); }); }
  function visible(f){ var d = f.closest("details"); while(d){ if(!d.open) return false; d = d.parentElement && d.parentElement.closest("details"); } return true; }
  function pass(){ figs = figs.filter(function(f){ if(document.body.contains(f) && visible(f)){ draw(f); return false; } return document.body.contains(f); }); }
  pass(); root.addEventListener("toggle", function(){ setTimeout(pass, 30); }, true); }
window.NVIZ = {html: html, hydrate: hydrate, open: function(v, lang){ load(function(ok){ if(ok && webgl()) open3d(v, lang); }); }, kinds: Object.keys(K)};
})();
