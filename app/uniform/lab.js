/* My Ihsan 0.7.44 · School › Uniformed bodies › 3D Lab (Three.js r159, global THREE).
   Pengakap: Knot Lab (reef knot, clove hitch, square lashing, drawn rope by rope, step captions) + Compass bearings.
   TKRS/KRS: Kawad Coach (a squad of 12 faceless cadets obeys 10 commands) + "name the command" test.
   PBSM: CPR rhythm trainer (tap at 100–120/min, 30:2 cycles, rate meter, metronome) + DRSABC order game.
   Figures are faceless and fully covered; no emblems are drawn. UniLab.mount(box, orgId, ctx) → {stop}. ctx = {T, L, E, O, toast, done}. */
window.UniLab = (function(){
"use strict";
var T = THREE;
function ctex(w, h, f){ var c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d"), w, h); var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t; }
function mat(c, r, m){ return new T.MeshStandardMaterial({color:c, roughness:r == null ? 0.7 : r, metalness:m || 0}); }
// ---------- a small stage: renderer, lights, drag/pinch orbit, tweens, clean-up ----------
function Stage(box, o){ var S = this; o = o || {}; S.alive = true; S.tw = []; S.reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  box.classList.add("noswipe"); var cv = S.cv = document.createElement("canvas"); cv.className = "ulCv"; cv.dataset.ib3d = "own"; box.appendChild(cv);
  var r = S.r = new T.WebGLRenderer({canvas:cv, antialias:true}); r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.15;
  var sc = S.scene = new T.Scene(); sc.background = new T.Color(o.bg || 0x223344); if(o.fog) sc.fog = new T.Fog(o.bg || 0x223344, o.fog[0], o.fog[1]);
  S.cam = new T.PerspectiveCamera(o.fov || 40, 1, 0.1, 200);
  sc.add(new T.HemisphereLight(o.sky || 0xffffff, o.gnd || 0x667766, 1.2));
  var sun = S.sun = new T.DirectionalLight(0xfff4e0, 1.35); sun.position.set(5, 10, 6); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); var sh = sun.shadow.camera; sh.left = -10; sh.right = 10; sh.top = 10; sh.bottom = -10; sh.far = 45; sun.shadow.bias = -0.0005; sc.add(sun); sc.add(sun.target);
  var fl = new T.DirectionalLight(0xbfd0ff, 0.5); fl.position.set(-6, 5, -4); sc.add(fl);
  S.root = new T.Group(); sc.add(S.root);
  S.o = {az:o.az || 0, el:o.el == null ? 0.5 : o.el, d:o.d || 9, x:0, y:o.ty == null ? 0.9 : o.ty, z:0}; S.t = {az:S.o.az, el:S.o.el, d:S.o.d, x:0, y:S.o.y, z:0}; S.dmin = o.dmin || 3; S.dmax = o.dmax || 24; S.spin = o.spin || 0;
  // a notch under every 3D view: drag it to make the picture taller or shorter (remembered)
  var grip = document.createElement("div"); grip.className = "ulGrip"; grip.setAttribute("role", "separator"); grip.setAttribute("aria-label", "Resize"); grip.innerHTML = "<i></i>"; box.appendChild(grip);
  var hkey = function(){ return box.classList.contains("ulSm") ? "ihsan_uni_hs" : "ihsan_uni_h"; };
  S.applyH = function(){ var v = 0; try{ v = +localStorage.getItem(hkey()); }catch(e){} if(v > 0){ cv.style.maxHeight = "none"; cv.style.minHeight = "0"; cv.style.height = Math.round(v * window.innerHeight / 100) + "px"; S.resize(); } };
  (function(){ var g = null; grip.addEventListener("pointerdown", function(e){ g = {y:e.clientY, h:cv.getBoundingClientRect().height}; try{ grip.setPointerCapture(e.pointerId); }catch(x){} e.preventDefault(); e.stopPropagation(); });
    grip.addEventListener("pointermove", function(e){ if(!g) return; var h = Math.max(170, Math.min(window.innerHeight * 0.85, g.h + e.clientY - g.y)); cv.style.maxHeight = "none"; cv.style.minHeight = "0"; cv.style.height = Math.round(h) + "px"; S.resize(); e.preventDefault(); });
    var end = function(e){ if(!g) return; g = null; try{ localStorage.setItem(hkey(), String(Math.round(cv.getBoundingClientRect().height / window.innerHeight * 1000) / 10)); }catch(x){} }; grip.addEventListener("pointerup", end); grip.addEventListener("pointercancel", end); })();
  S.resize = function(){ var w = cv.clientWidth || box.clientWidth || 320, h = cv.clientHeight || 320; r.setSize(w, h, false); S.cam.aspect = w / h; S.cam.updateProjectionMatrix(); if(S.onResize) S.onResize(w, h); };
  window.addEventListener("resize", S.resize); if(window.ResizeObserver){ S.ro = new ResizeObserver(S.resize); S.ro.observe(cv); } S.resize(); setTimeout(S.applyH, 0);
  var pts = {}, drag = null;
  cv.addEventListener("pointerdown", function(e){ pts[e.pointerId] = [e.clientX, e.clientY]; drag = Object.keys(pts).length === 1 ? {x:e.clientX, y:e.clientY, az:S.t.az, el:S.t.el} : null; S.spin = 0; try{ cv.setPointerCapture(e.pointerId); }catch(x){} });
  cv.addEventListener("pointermove", function(e){ if(!pts[e.pointerId]) return; var ks = Object.keys(pts);
    if(ks.length === 2){ var a = pts[ks[0]], b = pts[ks[1]], d0 = Math.hypot(a[0] - b[0], a[1] - b[1]); pts[e.pointerId] = [e.clientX, e.clientY]; a = pts[ks[0]]; b = pts[ks[1]]; var d1 = Math.hypot(a[0] - b[0], a[1] - b[1]); if(d0 > 5) S.t.d = Math.max(S.dmin, Math.min(S.dmax, S.t.d * d0 / d1)); return; }
    pts[e.pointerId] = [e.clientX, e.clientY]; if(!drag) return; S.t.az = drag.az - (e.clientX - drag.x) * 0.008; S.t.el = Math.max(0.08, Math.min(1.5, drag.el + (e.clientY - drag.y) * 0.006)); });
  var up = function(e){ delete pts[e.pointerId]; drag = null; }; cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("wheel", function(e){ e.preventDefault(); S.t.d = Math.max(S.dmin, Math.min(S.dmax, S.t.d * (e.deltaY > 0 ? 1.08 : 0.93))); }, {passive:false});
  var lt = 0, loop = function(t){ if(!S.alive) return; if(!document.body.contains(cv)){ S.dispose(); return; } S.af = requestAnimationFrame(loop); var dt = Math.min(0.05, (t - (lt || t)) / 1000); lt = t;
    for(var i = S.tw.length - 1; i >= 0; i--){ var w = S.tw[i], k = Math.min(1, (t - w.s) / w.d); w.u(w.e ? w.e(k) : k); if(k >= 1){ S.tw.splice(i, 1); if(w.f) w.f(); } }
    if(S.spin) S.t.az += S.spin * dt; var q = S.o, g = S.t, f = 1 - Math.pow(0.0005, dt); q.az += (g.az - q.az) * f; q.el += (g.el - q.el) * f; q.d += (g.d - q.d) * f; q.x += (g.x - q.x) * f; q.y += (g.y - q.y) * f; q.z += (g.z - q.z) * f;
    S.cam.position.set(q.x + Math.sin(q.az) * Math.cos(q.el) * q.d, q.y + Math.sin(q.el) * q.d, q.z + Math.cos(q.az) * Math.cos(q.el) * q.d); S.cam.lookAt(q.x, q.y, q.z);
    if(S.onTick) S.onTick(dt, t / 1000); r.render(sc, S.cam); };
  S.af = requestAnimationFrame(loop); }
Stage.prototype.tween = function(ms, u, f, e){ if(this.reduce) ms = Math.min(ms, 80); this.tw.push({s:performance.now(), d:Math.max(1, ms), u:u, f:f, e:e || function(k){ return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }}); };
Stage.prototype.clear = function(){ var r = this.root; while(r.children.length){ var c = r.children.pop(); c.traverse(function(o){ if(o.geometry) o.geometry.dispose(); if(o.material){ (Array.isArray(o.material) ? o.material : [o.material]).forEach(function(m){ if(m.map) m.map.dispose(); m.dispose(); }); } }); } this.tw = []; };
Stage.prototype.dispose = function(){ if(!this.alive) return; this.alive = false; cancelAnimationFrame(this.af); window.removeEventListener("resize", this.resize); if(this.ro) this.ro.disconnect(); this.clear(); try{ this.r.dispose(); this.r.forceContextLoss(); }catch(e){} };
function cap(box){ var c = box.querySelector(".ulCap"); if(!c){ c = document.createElement("div"); c.className = "ulCap"; box.appendChild(c); } return function(h){ c.innerHTML = h; c.style.display = h ? "" : "none"; }; }
function shell(host){ host.innerHTML = '<div class="ulBox"></div><div class="ulUi"></div>'; return {box:host.querySelector(".ulBox"), ui:host.querySelector(".ulUi")}; }
function tabsBar(ui, list, cur, f){ var d = document.createElement("div"); d.className = "ulTools"; d.innerHTML = list.map(function(x){ return '<button class="chip' + (x[0] === cur ? ' on' : '') + '" data-lt="' + x[0] + '">' + x[1] + '</button>'; }).join(""); ui.appendChild(d); d.querySelectorAll("[data-lt]").forEach(function(b){ b.onclick = function(){ f(b.getAttribute("data-lt")); }; }); return d; }

// =====================================================================================================
// 🟪 PENGAKAP: knots + compass
// =====================================================================================================
function ropeMesh(pts, col, rad){ var cu = new T.CatmullRomCurve3(pts.map(function(p){ return new T.Vector3(p[0], p[1], p[2]); }), false, "centripetal"), seg = Math.max(120, pts.length * 22), g = new T.TubeGeometry(cu, seg, rad || 0.1, 10, false);
  var m = new T.Mesh(g, new T.MeshStandardMaterial({color:col, roughness:0.85})); m.castShadow = true; m.userData.n = g.index.count; m.geometry.setDrawRange(0, 0); return m; }
function ropeSet(m, k){ var n = m.userData.n, c = Math.floor(n * Math.max(0, Math.min(1, k)) / 6) * 6; m.geometry.setDrawRange(0, c); }
var GOLD = 0xE3B23C, LILAC = 0x9a7bd0, KHAKI = 0xC8A96A, WOOD = 0x8a5a33;
function pole(len, rad, col){ var m = new T.Mesh(new T.CylinderGeometry(rad, rad, len, 20), mat(col || WOOD, 0.8)); m.castShadow = true; return m; }
function knotDefs(){ return {
  reef:{name:"Simpul Buku Sila|Reef knot", ropes:[[GOLD, [[-3.4,0.62,0],[-1.4,0.62,0],[0.4,0.6,0],[1.0,0.32,0],[1.12,0,0],[1.0,-0.32,0],[0.4,-0.6,0],[-1.4,-0.62,0],[-3.4,-0.62,0]]],
        [LILAC, [[3.4,0.22,0],[1.8,0.22,0.28],[1.1,0.22,0.34],[0.3,0.22,0.1],[-0.6,0.22,0],[-0.98,0,0],[-0.6,-0.22,0],[0.3,-0.22,-0.1],[1.1,-0.22,-0.34],[1.8,-0.22,-0.28],[3.4,-0.22,0]]]],
    poles:[], steps:[[0.0, "1. Tali emas membuat gelung (bight) ke kanan.|1. The gold rope makes a bight (a U) opening to the left."], [0.5, "2. Tali ungu masuk melalui gelung: di atas, kemudian di bawah tali emas.|2. The lilac rope comes through it: over, then under the gold rope."], [0.95, "3. Dua hujung setiap tali keluar di sebelah yang sama. Tarik rata: Buku Sila siap.|3. The two ends of each rope come out on the same side. Pull it flat: reef knot done."]], el:0.3, d:10.5},
  clove:{name:"Simpul Manuk|Clove hitch", ropes:null, poles:[["v"]], steps:[[0.0, "1. Tali datang dari kiri, melilit tiang sekali.|1. The rope comes in from the left and goes once round the pole."], [0.5, "2. Lilitan kedua menyilang di atas lilitan pertama di bahagian depan.|2. The second turn crosses over the first on the front."], [0.9, "3. Hujung diselit di bawah lilitan kedua. Tarik: simpul manuk siap.|3. Tuck the end under the second turn. Pull tight: clove hitch done."]], el:0.3, d:10.5},
  square:{name:"Ikatan Seraya|Square lashing", ropes:null, poles:[["v"], ["h"]], steps:[[0.0, "1. Mulakan dengan simpul manuk pada tiang menegak, di bawah silang.|1. Start with a clove hitch on the upright pole, below the crossing."], [0.4, "2. Lilit tali mengelilingi kedua-dua tiang, 3–4 kali, tali rata sebelah-menyebelah.|2. Wrap the rope round both poles 3–4 times, the turns lying side by side."], [0.85, "3. Frapping: lilit di antara tiang untuk mengetatkan, kemudian tamat dengan simpul manuk.|3. Frapping: turn between the poles to tighten, then finish with a clove hitch."]], el:0.35, d:11}}; }
function cloveRope(){ var P = [], R = 0.62, y0 = 0.62; P.push([-3.4, y0, 1.1], [-1.9, y0, 1.1], [-0.9, y0, 0.9]);
  var n = 14; for(var i = 0; i <= n; i++){ var u = i / n, ph = Math.PI - u * 2 * Math.PI; P.push([R * Math.cos(ph), y0 - u * 0.46, R * Math.sin(ph)]); }    // turn 1 goes down
  for(var j = 1; j <= n; j++){ var v = j / n, ph2 = Math.PI - v * 2 * Math.PI; P.push([(R + 0.2) * Math.cos(ph2), y0 - 0.46 + v * 0.62, (R + 0.2) * Math.sin(ph2)]); }   // turn 2 goes up and crosses on the front
  P.push([-1.0, y0 + 0.2, 0.95], [-1.9, y0 + 0.16, 1.15], [-3.2, y0 + 0.1, 1.2]); return P; }
function squareRopes(){ var pts = [], a = 0.66, ys = 0.66, loops = 4;   // one rope: 4 turns, each a skew rectangle that passes in front of the upright and behind the crossbar, then in front of the crossbar and behind the upright
  for(var k = 0; k < loops; k++){ var o = (k - 1.5) * 0.19;
    pts.push([-a, ys + o, 0.55], [0, ys + o, 0.62], [a, ys + o, 0.6], [a, o * 0.5, 1.04], [a, -ys + o, 0.2], [a * 0.6, -ys + o, -0.5], [0, -ys + o, -0.8], [-a * 0.6, -ys + o, -0.5], [-a, -ys + o, -0.15], [-a, o * 0.5, -0.14]); }
  pts.push([-a, ys + 0.45, 0.45]); return [[KHAKI, pts]]; }
function pgkLab(host, ctx){ var T_ = ctx.T, L = ctx.L; var sh = shell(host), box = sh.box, ui = sh.ui, S = new Stage(box, {bg:0x3a2766, fog:[22, 48], sky:0xffffff, gnd:0x6a55a0, az:0, el:0.3, d:11, ty:0, dmin:5, dmax:20, spin:0.12}), say = cap(box), mode = "reef", K = knotDefs(), ropes = [], prog = 1, playing = false, cmp = null, timer = 0;
  var table = new T.Mesh(new T.CylinderGeometry(3.6, 3.6, 0.2, 48), mat(KHAKI, 0.8)); table.position.y = -2.5; table.receiveShadow = true; var rim = new T.Mesh(new T.TorusGeometry(3.6, 0.07, 8, 64), mat(GOLD, 0.35, 0.7)); rim.rotation.x = Math.PI / 2; rim.position.y = -2.4;
  function base(){ S.clear(); S.root.add(table, rim); ropes = []; }
  function build(id){ base(); mode = id; var d = K[id]; prog = 1; S.t.el = d.el; S.t.d = d.d; S.t.az = 0; S.spin = 0.12; S.t.y = 0;
    (d.poles || []).forEach(function(p){ var m = pole(4.6, 0.4); if(p[0] === "h"){ m.rotation.z = Math.PI / 2; m.position.z = 0.5; } else if(id === "square"){ m.position.z = -0.15; } S.root.add(m); });
    var def = d.ropes || (id === "clove" ? [[GOLD, cloveRope()]] : squareRopes());
    def.forEach(function(r){ var m = ropeMesh(r[1], r[0], id === "square" ? 0.12 : 0.16); S.root.add(m); ropes.push(m); }); sync(); }
  function sync(){ var n = ropes.length, seg = 1 / n; ropes.forEach(function(m, i){ ropeSet(m, (prog - i * seg) / seg); }); var st = K[mode].steps, cur = st[0]; st.forEach(function(s){ if(prog >= s[0] - 1e-6) cur = s; }); say('<b>' + ctx.E(T_(K[mode].name)) + '</b> · ' + ctx.E(T_(cur[1]))); if(sl) sl.value = Math.round(prog * 1000); }
  S.onTick = function(dt){ if(playing && cmpMode === "knot"){ prog = Math.min(1, prog + dt / 9); sync(); if(prog >= 1){ playing = false; setPlay(); } } };
  var cmpMode = "knot", sl = null, pb = null;
  function setPlay(){ if(pb) pb.textContent = playing ? "⏸" : "▶"; }
  function uiKnot(){ ui.innerHTML = ""; cmpMode = "knot"; tabsBar(ui, [["reef", "Buku Sila"], ["clove", "Manuk"], ["square", "Seraya"], ["cmp", "🧭 " + L("Kompas", "Compass")]], mode, function(id){ if(id === "cmp") return startCmp(); build(id); playing = false; uiKnot(); });
    var d = document.createElement("div"); d.className = "ulSl"; d.innerHTML = '<button class="chip" id="ulP">⏸</button><input type="range" id="ulS" min="0" max="1000" value="0" aria-label="' + L("Langkah", "Step") + '"><button class="chip" id="ulR">↺</button>'; ui.appendChild(d);
    pb = d.querySelector("#ulP"); sl = d.querySelector("#ulS"); setPlay(); pb.onclick = function(){ if(prog >= 1) prog = 0; playing = !playing; setPlay(); }; d.querySelector("#ulR").onclick = function(){ prog = 0; playing = true; setPlay(); };
    var sb = document.createElement("div"); sb.className = "ulTools"; sb.innerHTML = '<span class="mut tiny" style="align-self:center">' + L("Langkah", "Step") + '</span>' + [0.5, 0.94, 1].map(function(v, i){ return '<button class="chip" data-js="' + v + '">' + (i + 1) + '</button>'; }).join("") + '<button class="chip" id="ulPl">▶ ' + L("Main semula", "Replay") + '</button>'; ui.appendChild(sb);
    sb.querySelectorAll("[data-js]").forEach(function(b){ b.onclick = function(){ playing = false; setPlay(); prog = +b.getAttribute("data-js"); sync(); }; }); sb.querySelector("#ulPl").onclick = function(){ prog = 0; playing = true; setPlay(); }; sl.oninput = function(){ playing = false; setPlay(); prog = +sl.value / 1000; sync(); };
    var b = document.createElement("button"); b.className = "btn gold g3d uaGo"; b.textContent = "🪢 " + L("Saya sudah ikat dengan tali sebenar (+25 XP)", "I tied it with a real rope (+25 XP)"); b.onclick = function(){ ctx.done(); b.disabled = true; b.textContent = "✓ " + L("Bagus!", "Well done!"); }; ui.appendChild(b);
    var n = document.createElement("div"); n.className = "mut tiny"; n.textContent = L("Model ringkas untuk memahami langkah. Latih dengan tali sebenar; seret untuk memutar, cubit untuk zum.", "A simplified model to learn the steps. Practise with a real rope; drag to turn, pinch to zoom."); ui.appendChild(n); }
  // ---- compass bearings ----
  var NAMES = [["Utara|North", 0], ["Timur Laut|North-east", 45], ["Timur|East", 90], ["Tenggara|South-east", 135], ["Selatan|South", 180], ["Barat Daya|South-west", 225], ["Barat|West", 270], ["Barat Laut|North-west", 315]];
  function startCmp(){ S.clear(); S.root.add(table, rim); mode = "cmp"; cmpMode = "cmp"; S.spin = 0; S.t.el = 1.25; S.t.az = 0; S.t.d = 11; S.t.y = -2.2;
    var tx = ctex(512, 512, function(g, w){ g.fillStyle = "#f4ead0"; g.fillRect(0, 0, w, w); g.translate(w / 2, w / 2); g.strokeStyle = "#2D1A4D"; g.fillStyle = "#2D1A4D"; g.textAlign = "center"; g.textBaseline = "middle";
      for(var a = 0; a < 360; a += 5){ g.save(); g.rotate(a * Math.PI / 180); g.lineWidth = a % 45 === 0 ? 5 : a % 15 === 0 ? 3 : 1.5; g.beginPath(); g.moveTo(0, -240); g.lineTo(0, a % 45 === 0 ? -200 : a % 15 === 0 ? -212 : -222); g.stroke(); if(a % 30 === 0){ g.font = "bold 20px sans-serif"; g.fillText(String(a), 0, -178); } g.restore(); }
      g.font = "bold 44px sans-serif"; [["U", 0], ["T", 90], ["S", 180], ["B", 270]].forEach(function(p){ g.save(); g.rotate(p[1] * Math.PI / 180); g.fillStyle = p[0] === "U" ? "#C8102E" : "#2D1A4D"; g.fillText(p[0], 0, -135); g.restore(); }); g.beginPath(); g.arc(0, 0, 8, 0, 7); g.fill(); });
    var dial = new T.Group(), disc = new T.Mesh(new T.CylinderGeometry(2.4, 2.4, 0.14, 64), mat(KHAKI, 0.6)); disc.castShadow = true; disc.receiveShadow = true; var face = new T.Mesh(new T.CircleGeometry(2.38, 64), new T.MeshStandardMaterial({map:tx, roughness:0.6})); face.rotation.x = -Math.PI / 2; face.position.y = 0.075; dial.add(disc, face); dial.position.y = -2.2; S.root.add(dial);
    var ring = new T.Mesh(new T.TorusGeometry(2.45, 0.1, 10, 64), mat(0x4B2A7B, 0.4, 0.5)); ring.rotation.x = Math.PI / 2; ring.position.y = -2.18; S.root.add(ring);
    var arrow = new T.Mesh(new T.ConeGeometry(0.2, 0.55, 3), new T.MeshStandardMaterial({color:GOLD, emissive:0x553300, roughness:0.4})); arrow.rotation.x = -Math.PI / 2; arrow.position.set(0, -2.05, -2.95); S.root.add(arrow);
    var sc = {n:0, ok:0, target:null, h:0, tries:0}; var tgt;
    function next(){ sc.n++; var named = sc.n <= 3; tgt = named ? NAMES[Math.floor(Math.random() * 8)] : [null, 15 * Math.floor(Math.random() * 24)]; sc.target = tgt; draw(); }
    function draw(){ ui.innerHTML = ""; tabsBar(ui, [["reef", "Buku Sila"], ["clove", "Manuk"], ["square", "Seraya"], ["cmp", "🧭 " + L("Kompas", "Compass")]], "cmp", function(id){ if(id === "cmp") return; build(id); playing = false; uiKnot(); });
      var d = document.createElement("div"); d.className = "ulStat"; var want = tgt[0] ? T_(tgt[0]) + " (" + tgt[1] + "°)" : L("Bearing ", "Bearing ") + tgt[1] + "°";
      d.innerHTML = '<div style="flex:3 1 160px"><small>' + L("Soalan ", "Question ") + Math.min(sc.n, 5) + '/5</small><b style="font-size:16px">' + ctx.E(want) + '</b></div><div><small>' + L("Betul", "Correct") + '</small><b>' + sc.ok + '</b></div><div><small>' + L("Bearing anda", "Your bearing") + '</small><b id="ulB">' + sc.h + '°</b></div>'; ui.appendChild(d);
      var s = document.createElement("div"); s.className = "ulSl"; s.innerHTML = '<span>0°</span><input type="range" id="ulH" min="0" max="359" value="' + sc.h + '" aria-label="Bearing"><span>359°</span>'; ui.appendChild(s); var inp = s.querySelector("#ulH");
      inp.oninput = function(){ sc.h = +inp.value; dial.rotation.y = sc.h * Math.PI / 180; ui.querySelector("#ulB").textContent = sc.h + "°"; };
      var b = document.createElement("button"); b.className = "btn gold g3d uaGo"; b.textContent = "✔ " + L("Semak bearing", "Check bearing"); b.onclick = function(){ var diff = Math.abs(((sc.h - tgt[1]) % 360 + 540) % 360 - 180);
        if(diff <= 8){ sc.ok++; say("<b>✓</b> " + L("Betul! Bearing anda ", "Correct! Your bearing is ") + sc.h + "°"); } else say("<b>✗</b> " + L("Belum tepat; sasaran ", "Not quite; the target is ") + tgt[1] + "°. " + L("Putar sehingga nombor itu berada di bawah anak panah emas.", "Turn until that number sits under the gold arrow."));
        if(sc.n >= 5){ b.disabled = true; var good = sc.ok >= 4; var r = document.createElement("div"); r.className = "uaOk"; r.textContent = (good ? "🎉 " : "") + sc.ok + "/5 · " + (good ? L("Bagus! +25 XP", "Great! +25 XP") : L("Cuba lagi untuk 4/5.", "Try again for 4/5.")); ui.appendChild(r); if(good) ctx.done(); var a2 = document.createElement("button"); a2.className = "btn alt g3d uaGo"; a2.textContent = "↻ " + L("Lagi", "Again"); a2.onclick = startCmp; ui.appendChild(a2); }
        else setTimeout(next, 1100); }; ui.appendChild(b); }
    say(L("Putar sehingga nombor sasaran berada di bawah anak panah emas.", "Turn the dial so the target number sits under the gold arrow.")); dial.rotation.y = 0; next(); }
  build("reef"); uiKnot();
  return {stop:function(){ S.dispose(); }}; }

// =====================================================================================================
// 🟩 TKRS / KRS: Kawad Coach
// =====================================================================================================
function cadet(){ var g = new T.Group(), uni = mat(0x5a6428, 0.85), trs = mat(0x3e4620, 0.9), skin = mat(0xc99f7c, 0.7), boot = mat(0x1a1a14, 0.6), ber = mat(0x8B1E2D, 0.9), belt = mat(0xD4AF37, 0.4, 0.6), J = {};
  var legs = [], arms = [];
  [1, -1].forEach(function(s){ var p = new T.Group(); p.position.set(s * 0.13, 0.92, 0); var l = new T.Mesh(new T.CylinderGeometry(0.085, 0.075, 0.86, 10), trs); l.position.y = -0.43; var b = new T.Mesh(new T.BoxGeometry(0.15, 0.09, 0.27), boot); b.position.set(0, -0.9, 0.06); p.add(l, b); g.add(p); legs.push(p); });
  [1, -1].forEach(function(s){ var p = new T.Group(); p.position.set(s * 0.3, 1.45, 0); var a = new T.Mesh(new T.CylinderGeometry(0.055, 0.05, 0.58, 10), uni); a.position.y = -0.29; var h = new T.Mesh(new T.SphereGeometry(0.06, 10, 8), skin); h.position.y = -0.62; p.add(a, h); g.add(p); arms.push(p); });
  var torso = new T.Mesh(new T.CylinderGeometry(0.22, 0.2, 0.62, 14), uni); torso.scale.z = 0.62; torso.position.y = 1.18; var bl = new T.Mesh(new T.CylinderGeometry(0.205, 0.205, 0.05, 14), belt); bl.scale.z = 0.62; bl.position.y = 0.93;
  var neck = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, 0.1, 8), skin); neck.position.y = 1.53; var head = new T.Group(); head.position.y = 1.68; var hd = new T.Mesh(new T.SphereGeometry(0.15, 16, 12), skin); var be = new T.Mesh(new T.SphereGeometry(0.17, 16, 8), ber); be.scale.set(1.05, 0.42, 1.05); be.position.set(0.02, 0.13, 0); be.rotation.z = -0.15; head.add(hd, be);
  g.add(torso, bl, neck, head); g.traverse(function(m){ if(m.isMesh){ m.castShadow = true; m.receiveShadow = true; } });
  J = {legs:legs, arms:arms, head:head, cur:{l:[0, 0], r:[0, 0], al:[0, 0], ar:[0, 0], h:0}, tg:{l:[0, 0], r:[0, 0], al:[0, 0], ar:[0, 0], h:0}}; g.userData.J = J; return g; }
var CMDS = [["sedia", "Sedia!", 0], ["senang", "Senang diri!", 1], ["rehat", "Rehatkan diri!", 2], ["kanan", "Pusing kanan!", 5], ["kiri", "Pusing kiri!", 5], ["belakang", "Pusing belakang!", 6], ["gerak", "Ke depan, gerak!", 8], ["henti", "Berhenti!", 9], ["lencang", "Lencang kanan!", 3], ["hormat", "Hormat!", 10], ["bersurai", "Bersurai!", 11]];
var CAPX = {kiri:["Pusing kiri: berpusing 90° ke kiri pada tumit kiri dan hujung kaki kanan.", "Left turn: 90° to the left, pivoting on the left heel and right toe."], rehat:null};
function krsLab(host, ctx){ var T_ = ctx.T, L = ctx.L, sheet = ctx.O.sheets[1].rows; var sh = shell(host), box = sh.box, ui = sh.ui, S = new Stage(box, {bg:0xDCE3C8, fog:[16, 50], sky:0xffffff, gnd:0x8A8F7A, az:0.35, el:0.42, d:9.5, ty:0.9, dmin:5, dmax:18}), say = cap(box);
  var ground = new T.Mesh(new T.PlaneGeometry(120, 120), new T.MeshStandardMaterial({roughness:0.95, map:ctex(512, 512, function(g, w){ g.fillStyle = "#9aa07f"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, w - 6); g.strokeStyle = "rgba(255,255,255,.22)"; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, w); g.moveTo(0, w / 2); g.lineTo(w, w / 2); g.stroke(); })})); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.material.map.wrapS = ground.material.map.wrapT = T.RepeatWrapping; ground.material.map.repeat.set(20, 20); S.scene.add(ground);
  var squad = new T.Group(); S.root.add(squad); var C = [], seed = 7, rnd = function(){ seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for(var rk = 0; rk < 2; rk++) for(var fl = 0; fl < 6; fl++){ var c = cadet(); c.userData.home = [(fl - 2.5) * 1.05, rk * 1.35]; c.userData.jit = (rnd() - 0.5) * 0.4; c.position.set(c.userData.home[0] + c.userData.jit, 0, c.userData.home[1] + (rnd() - 0.5) * 0.25); c.userData.yaw = 0; squad.add(c); C.push(c); }
  var yaw = 0, marching = false, ph = 0, busy = [], speed = 1.7, salute = false, dressed = false;
  function later(ms, f){ var t = setTimeout(f, ms); busy.push(t); }
  function pose(name){ C.forEach(function(c){ var t = c.userData.J.tg;
    t.l = [0, 0]; t.r = [0, 0]; t.al = [0, 0]; t.ar = [0, 0]; t.h = 0;
    if(name === "senang"){ t.l = [0, 0.13]; t.r = [0, -0.13]; t.al = [0.7, 0.18]; t.ar = [0.7, -0.18]; }
    if(name === "rehat"){ t.l = [0, 0.18]; t.r = [0, -0.18]; t.al = [0.45, 0.35]; t.ar = [0.45, -0.35]; }
    if(name === "hormat"){ t.ar = [-2.45, -0.35]; }
    if(name === "lencang"){ t.ar = [0, -1.5]; t.h = -0.9; } }); }
  function align(){ C.forEach(function(c){ var u = c.userData, from = c.position.clone(), to = new T.Vector3(u.home[0], 0, u.home[1]); S.tween(700, function(k){ c.position.x = from.x + (to.x - from.x) * k; c.position.z = from.z + (to.z - from.z) * k; }); }); }
  function turn(d){ yaw += d; C.forEach(function(c){ c.userData.yaw = yaw; }); }
  function reset(){ busy.forEach(clearTimeout); busy = []; marching = false; yaw = 0; C.forEach(function(c, i){ var u = c.userData; u.yaw = 0; c.rotation.y = 0; c.position.set(u.home[0] + u.jit, 0, u.home[1]); }); squad.position.set(0, 0, 0); S.t.x = 0; S.t.z = 0; pose("sedia"); }
  function capFor(id){ var cm = CMDS.filter(function(c){ return c[0] === id; })[0], r = sheet[cm[2]], x = CAPX[id]; if(x) return '<b>' + cm[1] + '</b> ' + ctx.E(L(x[0], x[1])); return '<b>' + ctx.E(T_(r[0])) + '</b> ' + ctx.E(T_(r[1])) + ' · ' + ctx.E(T_(r[2])); }
  function run(id, quiet){ var step = function(){ };
    if(id === "sedia"){ marching = false; pose("sedia"); }
    else if(id === "senang"){ pose("senang"); } else if(id === "rehat"){ pose("rehat"); }
    else if(id === "kanan"){ marching = false; pose("sedia"); turn(-Math.PI / 2); } else if(id === "kiri"){ marching = false; pose("sedia"); turn(Math.PI / 2); } else if(id === "belakang"){ marching = false; pose("sedia"); turn(-Math.PI); }
    else if(id === "gerak"){ pose("sedia"); ph = 0; marching = true; }
    else if(id === "henti"){ if(marching){ later(560, function(){ marching = false; pose("sedia"); }); } else pose("sedia"); }
    else if(id === "lencang"){ marching = false; pose("lencang"); align(); later(1800, function(){ pose("sedia"); }); }
    else if(id === "hormat"){ pose("hormat"); later(1400, function(){ pose("sedia"); }); }
    else if(id === "bersurai"){ marching = false; pose("sedia"); turn(-Math.PI / 2); later(800, function(){ pose("hormat"); }); later(1700, function(){ pose("sedia"); ph = 0; marching = true; }); later(3000, function(){ marching = false; pose("sedia"); }); }
    if(!quiet) say(capFor(id)); }
  S.onTick = function(dt){ var f = 1 - Math.pow(0.0008, dt);
    if(marching){ ph += dt * 5.6; squad.position.x += Math.sin(yaw) * speed * dt; squad.position.z += Math.cos(yaw) * speed * dt; S.t.x = squad.position.x; S.t.z = squad.position.z; }
    C.forEach(function(c){ var u = c.userData, J = u.J, t = J.tg, q = J.cur; var dy = u.yaw - c.rotation.y; c.rotation.y += dy * f;
      var sw = marching ? Math.sin(ph) : 0, A = 0.62, B = 0.7; var tl = marching ? [-A * sw, t.l[1]] : t.l, tr = marching ? [A * sw, t.r[1]] : t.r, ta = marching ? [B * sw, t.al[1]] : t.al, tb = marching ? [-B * sw, t.ar[1]] : t.ar;
      [[q.l, tl, J.legs[0]], [q.r, tr, J.legs[1]], [q.al, ta, J.arms[0]], [q.ar, tb, J.arms[1]]].forEach(function(p){ var k = marching ? 0.6 : f; p[0][0] += (p[1][0] - p[0][0]) * k; p[0][1] += (p[1][1] - p[0][1]) * k; p[2].rotation.x = p[0][0]; p[2].rotation.z = p[0][1]; });
      q.h += (t.h - q.h) * f; J.head.rotation.y = q.h; }); };
  var testOn = false, T_sc = null;
  function bar(){ ui.innerHTML = ""; var g = document.createElement("div"); g.className = "ulCmd"; g.innerHTML = CMDS.map(function(c){ return '<button data-c="' + c[0] + '">' + ctx.E(c[1]) + '</button>'; }).join("") + '<button data-c="_reset">↺ ' + L("Susun semula", "Reset") + '</button>'; ui.appendChild(g);
    g.querySelectorAll("[data-c]").forEach(function(b){ b.onclick = function(){ var id = b.getAttribute("data-c"); if(id === "_reset"){ reset(); say(L("Skuad disusun semula: Sedia.", "Squad reset: attention.")); } else run(id); }; });
    var t = document.createElement("button"); t.className = "btn gold g3d uaGo"; t.textContent = "🧠 " + L("Uji: namakan arahan", "Test: name the command"); t.onclick = test; ui.appendChild(t);
    var n = document.createElement("div"); n.className = "mut tiny"; n.textContent = L("Tekan arahan dan lihat skuad bergerak. Ikut manual kawad unit anda untuk butiran.", "Press a command and watch the squad. Follow your unit's drill manual for details."); ui.appendChild(n); }
  function test(){ reset(); T_sc = {n:0, ok:0}; round(); }
  function round(){ T_sc.n++; reset(); var pick = ["senang", "kanan", "kiri", "belakang", "gerak", "lencang", "hormat"], id = pick[Math.floor(Math.random() * pick.length)]; var opts = [id]; while(opts.length < 3){ var o = pick[Math.floor(Math.random() * pick.length)]; if(opts.indexOf(o) < 0) opts.push(o); } opts.sort(function(){ return Math.random() - 0.5; });
    setTimeout(function(){ run(id, true); if(id === "gerak") later(1600, function(){ run("henti", true); }); }, 350); say(L("Perhatikan skuad… arahan apakah itu?", "Watch the squad… which command was that?"));
    ui.innerHTML = ""; var st = document.createElement("div"); st.className = "ulStat"; st.innerHTML = '<div><small>' + L("Soalan", "Question") + '</small><b>' + T_sc.n + '/6</b></div><div><small>' + L("Betul", "Correct") + '</small><b>' + T_sc.ok + '</b></div>'; ui.appendChild(st);
    var g = document.createElement("div"); g.className = "ulCmd"; g.innerHTML = opts.map(function(o){ return '<button data-o="' + o + '">' + ctx.E(CMDS.filter(function(c){ return c[0] === o; })[0][1]) + '</button>'; }).join(""); ui.appendChild(g);
    g.querySelectorAll("[data-o]").forEach(function(b){ b.onclick = function(){ var ok = b.getAttribute("data-o") === id; if(ok){ T_sc.ok++; b.classList.add("on"); say("<b>✓</b> " + capFor(id)); } else say("<b>✗</b> " + L("Sebenarnya: ", "It was: ") + capFor(id)); g.querySelectorAll("button").forEach(function(x){ x.disabled = true; });
      if(T_sc.n >= 6){ setTimeout(function(){ var good = T_sc.ok >= 5, r = document.createElement("div"); r.className = "uaOk"; r.textContent = (good ? "🎖️ " : "") + T_sc.ok + "/6 · " + (good ? L("Cemerlang! +25 XP", "Excellent! +25 XP") : L("Cuba lagi untuk 5/6.", "Try again for 5/6.")); ui.appendChild(r); if(good) ctx.done(); var a = document.createElement("button"); a.className = "btn alt g3d uaGo"; a.textContent = "↻ " + L("Kembali ke arahan", "Back to commands"); a.onclick = function(){ reset(); bar(); say(""); }; ui.appendChild(a); }, 1200); } else setTimeout(round, 1600); }; }); }
  pose("sedia"); bar(); say(L("Tekan satu arahan di bawah. Skuad menghadap kamera; putar dengan menyeret.", "Press a command below. The squad faces the camera; drag to turn the view."));
  return {stop:function(){ busy.forEach(clearTimeout); S.dispose(); }}; }

// =====================================================================================================
// 🟥 PBSM: CPR rhythm trainer + DRSABC
// =====================================================================================================
function pbsLab(host, ctx){ var T_ = ctx.T, L = ctx.L; var sh = shell(host), box = sh.box, ui = sh.ui, S = new Stage(box, {bg:0xFFF1F2, fog:[20, 50], sky:0xffffff, gnd:0xd9c6c9, az:0.55, el:0.8, d:10.5, ty:0.3, dmin:5, dmax:16}), say = cap(box), mode = "cpr";
  var mt = ctex(1024, 512, function(g, w, h){ g.fillStyle = "#34363b"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = "#C8102E"; g.save(); g.translate(w * 0.82, h * 0.5); g.beginPath(); g.moveTo(0, 40); g.bezierCurveTo(-70, -10, -50, -60, 0, -22); g.bezierCurveTo(50, -60, 70, -10, 0, 40); g.fill(); g.restore();
    g.strokeStyle = "#ffffff"; g.lineWidth = 7; g.lineJoin = "round"; g.beginPath(); g.moveTo(w * 0.52, h * 0.5); g.lineTo(w * 0.6, h * 0.5); g.lineTo(w * 0.63, h * 0.36); g.lineTo(w * 0.67, h * 0.66); g.lineTo(w * 0.71, h * 0.44); g.lineTo(w * 0.73, h * 0.5); g.lineTo(w * 0.77, h * 0.5); g.stroke(); });
  var matM = new T.Mesh(new T.BoxGeometry(8, 0.1, 4), new T.MeshStandardMaterial({map:mt, roughness:0.9})); matM.position.y = -0.05; matM.receiveShadow = true;
  var man = new T.Group(), skin = mat(0xdcc9b3, 0.7), plate = mat(0xf2e9dc, 0.5), torso = new T.Mesh(new T.CapsuleGeometry(0.5, 1.2, 8, 16), skin); torso.rotation.z = Math.PI / 2; torso.position.set(0.2, 0.42, 0); torso.scale.set(1, 1, 1.15);
  var head = new T.Mesh(new T.SphereGeometry(0.42, 20, 16), skin); head.position.set(-1.65, 0.42, 0); var neck = new T.Mesh(new T.CylinderGeometry(0.17, 0.2, 0.3, 12), skin); neck.rotation.z = Math.PI / 2; neck.position.set(-1.3, 0.38, 0);
  var legs = [-0.3, 0.3].map(function(z){ var l = new T.Mesh(new T.CapsuleGeometry(0.21, 1.9, 6, 12), mat(0x4a4f58, 0.8)); l.rotation.z = Math.PI / 2; l.position.set(2.15, 0.25, z); return l; });
  var arms = [-0.78, 0.78].map(function(z){ var a = new T.Mesh(new T.CapsuleGeometry(0.15, 1.0, 6, 10), skin); a.rotation.z = Math.PI / 2; a.position.set(0.1, 0.2, z); return a; });
  var chest = new T.Mesh(new T.CylinderGeometry(0.4, 0.4, 0.06, 28), plate); chest.position.set(-0.28, 0.99, 0); var hands = new T.Group(); hands.position.set(-0.28, 1.16, 0);
  var glove = mat(0xf7f7f7, 0.6); var h1 = new T.Mesh(new T.BoxGeometry(0.46, 0.13, 0.3), glove), h2 = new T.Mesh(new T.BoxGeometry(0.4, 0.12, 0.26), glove); h2.position.y = 0.12; h2.rotation.y = 0.5; var ar = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 3.2, 12), mat(0x2B2B2B, 0.8)); ar.position.y = 1.8; hands.add(h1, h2, ar);
  man.add(torso, head, neck, legs[0], legs[1], arms[0], arms[1], chest, hands); man.traverse(function(m){ if(m.isMesh){ m.castShadow = true; m.receiveShadow = true; } });
  var ring = new T.Mesh(new T.TorusGeometry(0.62, 0.035, 8, 48), new T.MeshStandardMaterial({color:0xC8102E, emissive:0xC8102E, emissiveIntensity:0.6})); ring.rotation.x = Math.PI / 2; ring.position.set(-0.28, 0.06, 0);
  S.root.add(matM, man, ring); S.t.x = -0.3; S.o.x = -0.3;
  var taps = [], count = 0, cycle = 0, good = 0, total = 0, phase = "idle", bpm = 0, metro = null, ac = null, press = 0, breath = 0, hud = null, last = 0;
  S.onTick = function(dt){ press = Math.max(0, press - dt * 7); var d = press * 0.2; hands.position.y = 1.16 - d; chest.position.y = 0.99 - d * 0.7; ring.scale.setScalar(1 + press * 0.06); };
  function beep(){ try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)(); var o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 880; g.gain.value = 0.08; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.05); }catch(e){} }
  function cprUi(){ ui.innerHTML = ""; tabsBar(ui, [["cpr", "💓 CPR"], ["drs", "🔢 DRSABC"]], mode, function(m){ mode = m; if(m === "drs") drsUi(); else cprUi(); });
    var st = document.createElement("div"); st.className = "ulStat"; st.innerHTML = '<div><small>BPM</small><b id="ulBpm">–</b></div><div><small>' + L("Tekanan", "Compressions") + '</small><b id="ulCn">0/30</b></div><div><small>' + L("Kitaran", "Cycle") + '</small><b id="ulCy">1/3</b></div><div><small>' + L("Dalam kadar", "In range") + '</small><b id="ulIn">–</b></div>'; ui.appendChild(st); hud = st;
    var p = document.createElement("button"); p.className = "ulPad"; p.id = "ulPad"; p.textContent = L("TEKAN / TAP", "TAP / PRESS"); ui.appendChild(p);
    var r = document.createElement("div"); r.className = "ulTools"; r.innerHTML = '<button class="chip" id="ulMt">🔔 ' + L("Metronom 110", "Metronome 110") + '</button><button class="chip" id="ulBr" style="display:none">🫁 ' + L("Beri 2 nafas", "Give 2 breaths") + '</button><button class="chip" id="ulRs">↺</button>'; ui.appendChild(r);
    var n = document.createElement("div"); n.className = "mut tiny"; n.textContent = L("Latihan irama sahaja: tekan di tempat anda, pada kusyen jika boleh. Kedalaman 5–6 cm tidak diukur. Ambil kursus CPR bertauliah untuk kemahiran sebenar.", "Rhythm practice only: tap at your own pace, on a cushion if you can. The 5–6 cm depth is not measured. Take a certified CPR course for the real skill."); ui.appendChild(n);
    var pad = ui.querySelector("#ulPad"), br = ui.querySelector("#ulBr"); phase = "idle"; count = 0; cycle = 0; good = 0; total = 0; taps = []; bpm = 0;
    pad.addEventListener("pointerdown", function(e){ e.preventDefault(); if(phase === "breath" || phase === "done") return; var now = performance.now(); phase = "press"; taps = taps.filter(function(t){ return now - t < 6000; }); taps.push(now); press = 1; count++;
      if(taps.length >= 3){ bpm = Math.round(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1))); total++; if(bpm >= 100 && bpm <= 120) good++; }
      var msg = taps.length < 3 ? L("Teruskan menekan…", "Keep pressing…") : bpm < 100 ? '<b>' + L("Lebih laju", "Faster") + '</b> ' + bpm + '/min' : bpm > 120 ? '<b>' + L("Lebih perlahan", "Slower") + '</b> ' + bpm + '/min' : '<b>' + L("Sempurna", "Perfect") + '</b> ' + bpm + '/min'; say(msg);
      ring.material.color.setHex(taps.length >= 3 && (bpm < 100 || bpm > 120) ? 0xE8A33C : 0x2e9d5b); ring.material.emissive.setHex(ring.material.color.getHex());
      if(count >= 30){ phase = "breath"; br.style.display = ""; say("<b>" + L("30 tekanan selesai", "30 compressions done") + "</b> " + L("Kini beri 2 nafas penyelamat.", "Now give 2 rescue breaths.")); taps = []; }
      upd(); }, {passive:false});
    br.onclick = function(){ if(phase !== "breath") return; breath++; cycle++; count = 0; br.style.display = "none"; head.scale.setScalar(1.12); setTimeout(function(){ head.scale.setScalar(1); }, 500); if(cycle >= 3) return finish(); phase = "idle"; say(L("Bagus. Sambung tekanan dada.", "Good. Carry on with compressions.")); upd(); };
    ui.querySelector("#ulMt").onclick = function(){ if(metro){ clearInterval(metro); metro = null; this.classList.remove("on"); } else { beep(); metro = setInterval(function(){ beep(); press = Math.max(press, 0.5); }, 545); this.classList.add("on"); } };
    ui.querySelector("#ulRs").onclick = cprUi; say(L("Tekan butang besar mengikut rentak 100–120 seminit. Hidupkan metronom jika perlu.", "Press the big button at a 100–120 per minute rhythm. Turn the metronome on if you need it.")); }
  function upd(){ if(!hud) return; hud.querySelector("#ulBpm").textContent = bpm || "–"; hud.querySelector("#ulBpm").style.color = bpm && (bpm < 100 || bpm > 120) ? "#d8873b" : bpm ? "#2e9d5b" : ""; hud.querySelector("#ulCn").textContent = count + "/30"; hud.querySelector("#ulCy").textContent = Math.min(3, cycle + 1) + "/3"; hud.querySelector("#ulIn").textContent = total ? Math.round(good * 100 / total) + "%" : "–"; }
  function finish(){ phase = "done"; var pc = total ? Math.round(good * 100 / total) : 0, ok = pc >= 70; upd(); say("<b>" + (ok ? "🎉 " : "") + pc + "%</b> " + L("tekanan dalam kadar 100–120/min.", "of compressions in the 100–120/min range.")); var r = document.createElement("div"); r.className = "uaOk"; r.textContent = ok ? L("Lulus (≥ 70%): +25 XP", "Passed (≥ 70%): +25 XP") : L("Cuba lagi untuk ≥ 70%.", "Try again for ≥ 70%."); ui.appendChild(r); if(ok) ctx.done(); }
  // ---- DRSABC order game ----
  var STEPS = [["D", "Danger|Bahaya", "Periksa tempat: selamat untuk anda?|Check the scene: safe for you?"], ["R", "Response|Respons", "Tepuk bahu, panggil kuat.|Tap the shoulders, shout.", ], ["S", "Send for help|Hubungi bantuan", "Telefon 999 / 112, minta AED.|Call 999 / 112, ask for an AED."], ["A", "Airway|Saluran udara", "Dongak kepala, angkat dagu.|Tilt the head, lift the chin."], ["B", "Breathing|Pernafasan", "Lihat dada sehingga 10 saat.|Look at the chest for up to 10 s."], ["C", "CPR", "Mula 30 tekanan : 2 nafas.|Start 30 compressions : 2 breaths."]];
  function drsUi(){ ui.innerHTML = ""; tabsBar(ui, [["cpr", "💓 CPR"], ["drs", "🔢 DRSABC"]], "drs", function(m){ mode = m; if(m === "drs") drsUi(); else cprUi(); }); S.t.el = 0.85;
    var order = STEPS.map(function(s, i){ return i; }).sort(function(){ return Math.random() - 0.5; }), nx = 0, err = 0;
    var info = document.createElement("div"); info.className = "uaNote"; info.innerHTML = L("Anda menemui seseorang rebah di kantin sekolah. Tekan langkah mengikut susunan yang betul.", "You find someone collapsed in the school canteen. Tap the steps in the right order."); ui.appendChild(info);
    var seq = document.createElement("div"); seq.className = "ulSeq"; seq.innerHTML = STEPS.map(function(s){ return '<span>' + s[0] + '</span>'; }).join(""); ui.appendChild(seq);
    var g = document.createElement("div"); g.className = "ulSteps"; g.innerHTML = order.map(function(i){ var s = STEPS[i]; return '<button data-i="' + i + '">' + s[0] + '<b>' + ctx.E(T_(s[1])) + '</b></button>'; }).join(""); ui.appendChild(g);
    g.querySelectorAll("[data-i]").forEach(function(b){ b.onclick = function(){ var i = +b.getAttribute("data-i"); if(i === nx){ b.classList.add("done"); b.disabled = true; seq.children[i].classList.add("ok"); say("<b>" + STEPS[i][0] + "</b> " + ctx.E(T_(STEPS[i][2]))); nx++;
        if(nx >= 6){ var ok = err <= 1, r = document.createElement("div"); r.className = "uaOk"; r.textContent = (ok ? "🎉 " : "") + L("Salah: ", "Mistakes: ") + err + " · " + (ok ? L("Cemerlang! +25 XP", "Excellent! +25 XP") : L("Cuba lagi untuk ≤ 1 kesilapan.", "Try again for ≤ 1 mistake.")); ui.appendChild(r); if(ok) ctx.done(); var a = document.createElement("button"); a.className = "btn alt g3d uaGo"; a.textContent = "↻ " + L("Lagi", "Again"); a.onclick = drsUi; ui.appendChild(a); } }
      else { err++; b.classList.add("bad"); setTimeout(function(){ b.classList.remove("bad"); }, 500); say("<b>✗</b> " + L("Belum; fikirkan langkah ", "Not yet; think about step ") + STEPS[nx][0] + "."); } }; }); }
  cprUi();
  return {stop:function(){ if(metro) clearInterval(metro); try{ if(ac) ac.close(); }catch(e){} S.dispose(); }}; }

function mountOne(){}
function mount(host, id, ctx){ var fn = {pengakap:pgkLab, krs:krsLab, pbsm:pbsLab}[id]; return fn(host, ctx); }
return {mount:mount, Stage:Stage, mat:mat, ctex:ctex, cap:cap, shell:shell, tabsBar:tabsBar, ropeMesh:ropeMesh, ropeSet:ropeSet, knotDefs:knotDefs, cloveRope:cloveRope, squareRopes:squareRopes, pole:pole, C:{GOLD:GOLD, LILAC:LILAC, KHAKI:KHAKI, WOOD:WOOD}};
})();
