/* My Ihsan 0.6.37 (owner spec "20 simple, high-IQ games"): Explore › 🧠 IQ puzzles. Shared Three.js core.
   "A heritage workshop by lamplight": every puzzle is an object on a lit bench under one warm pelita that brightens when solved.
   IQ.def(id, {build(S, level) → {pick(obj, hit), hint()}}) · IQView.render(box, H). Games live in iq/g_<id>.js and load on open.
   Rules kept from the spec: no living beings, no Quranic text or prayers on boards or win messages, plain "Selesai / Solved". */
(function(){ "use strict";
var T = window.THREE, IQ = window.IQ = {defs:{}}, H = null;
var C = {lapis:0x0F1E3A, blue:0x1F5FA8, teal:0x2AA198, gold:0xD4A544, sand:0xE4D3B5, crimson:0x8E2B2B, brass:0xB08D57, wood:0x6b4423};
IQ.C = C;
// id, icon, name ms, name en, Arabic / Jawi label, rule ms, rule en, difficulty 1-3
IQ.list = [
  ["mirror","🔦","Cermin Ibn al-Haytham","Ibn al-Haytham's Mirror","مِرآة","Letak cermin untuk membelokkan cahaya ke sasaran.","Place mirrors to bend the light into the target.",2],
  ["tingkat","🥮","Tingkat Tembaga","Tingkat Brass","تيڠكت","Pindah dulang satu demi satu; dulang besar tidak boleh di atas yang kecil.","Move trays one at a time; a big tray never sits on a smaller one.",1],
  ["pelita","🪔","Pelita Malam","Pelita Lamps","ڤليتا","Ketuk pelita: ia dan empat jirannya bertukar. Padamkan semua.","Tap a lamp: it and its four neighbours switch. Put them all out.",2],
  ["zellige","🧩","Gelongsor Zellige","Zellige Slide","زليج","Gelongsor jubin ke ruang kosong hingga tersusun.","Slide tiles into the gap until they are in order.",2],
  ["guli","🔵","Laluan Guli","Guli Route","ڬولي","Senget papan; guli bergolek hingga terhenti. Masuk ke lubang.","Tilt the board; the marble rolls until it stops. Get it in the hole.",2],
  ["girih","⭐","Jubin Girih","Girih Tiles","گره","Isi bentuk dengan semua kepingan, tiada lubang atau tindih.","Fill the shape with every piece, no gaps or overlaps.",3],
  ["tikar","🟤","Tikar Mengkuang","Mengkuang Mat","تيکر","Lompat biji atas jirannya ke lubang kosong. Tinggal satu di tengah.","Jump a peg over a neighbour into a hole. Leave one in the centre.",3],
  ["faras","♞","Jelajah Faras","Faras Tour","فرس","Kuda bergerak bentuk L. Lawati setiap petak sekali sahaja.","The horse moves in an L. Visit every square exactly once.",3],
  ["congkak","🌰","Nim Biji Congkak","Congkak Nim","چوڠکق","Ambil berapa biji pun dari satu lubang. Yang ambil biji terakhir menang.","Take any number of seeds from one pit. Whoever takes the last seed wins.",2],
  ["falaj","💧","Saluran Falaj","Falaj Channels","فلج","Putar saluran supaya air dari mata air sampai ke semua taman.","Turn the channels so water from the spring reaches every garden.",2],
  ["songket","🧊","Kiub Songket","Songket Cube","سوڠكيت","Pilih bentangan yang dilipat menjadi kiub ini.","Pick the flat net that folds into this cube.",3],
  ["lulu","⚪","Kod Lu'lu'","Lu'lu' Code","لؤلؤ","Teka susunan mutiara tersembunyi. Petunjuk: tepat tempat ● dan tepat warna ○.","Guess the hidden pearls. Clues: right place ● and right colour ○.",2],
  ["wau","🪁","Angin Wau","Wau Wind","واو","Ubah arah angin; wau melayang hingga terlanggar. Sampai ke pintu.","Change the wind; the wau drifts until it hits something. Reach the gate.",2],
  ["mihrab","🕌","Cermin Mihrab","Mihrab Mirror","محراب","Lengkapkan corak supaya simetri pada paksi.","Complete the pattern so it is symmetric across the axis.",2],
  ["mashrabiya","🪟","Bayang Mashrabiya","Mashrabiya Shadow","مشربية","Putar kekisi supaya bayangnya sama dengan sasaran di dinding.","Turn the lattice so its shadow matches the outline on the wall.",3],
  ["kendi","🏺","Kendi Air","Kendi Jugs","کندي","Isi, kosongkan atau tuang untuk mendapat sukatan tepat.","Fill, empty or pour to measure an exact amount.",2],
  ["fanous","🏮","Campur Fanus","Fanous Mix","فانوس","Laraskan tiga tanglung untuk menyamai warna sasaran.","Set the three lanterns to match the target colour.",1],
  ["gasing","🌀","Rantai Gasing","Gasing Chain","ڬاسيڠ","Letak gasing supaya putaran bersambung dari mula ke hujung.","Place tops so the spin passes from start to end.",2],
  ["pola","🔐","Peti Pola","Pola Vault","ڤولا","Cari peraturan; pilih bentuk seterusnya.","Find the rule; pick the shape that comes next.",2],
  ["kotak","💠","Kotak Cermin","Mirror Box","کوتق","Putar cermin, lancar kiub, sampai ke penjuru sasaran.","Turn the mirrors, launch the cube, reach the target corner.",3]];
IQ.meta = function(id){ for(var i = 0; i < IQ.list.length; i++) if(IQ.list[i][0] === id) return IQ.list[i]; return null; };
IQ.def = function(id, d){ IQ.defs[id] = d; };
function L(a, b){ return H ? H.L2x(a, b) : b; }
IQ.L = L;
// ---------- store ----------
function st(){ try{ return JSON.parse(localStorage.getItem("ihsan_iq") || "{}") || {}; }catch(e){ return {}; } }
function stSave(o){ try{ localStorage.setItem("ihsan_iq", JSON.stringify(o)); }catch(e){} }
IQ.best = function(id, lv){ var o = st()[id]; return o && o["b" + lv] != null ? o["b" + lv] : null; };
IQ.solved = function(id){ var o = st()[id]; return o ? [0, 1, 2, 3, 4, 5].filter(function(l){ return o["b" + l] != null; }).length : 0; };
IQ.stars = function(id, lv){ var o = st()[id]; return o && o["s" + lv] || 0; };
// ---------- procedural textures ----------
var texC = {};
function canvasTex(key, w, h, draw, rep){ if(texC[key]) return texC[key]; var c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); var t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; if(rep){ t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } texC[key] = t; return t; }
IQ.canvasTex = canvasTex;
function rnd(seed){ var x = seed; return function(){ x = x * 16807 % 2147483647; return (x - 1) / 2147483646; }; }
IQ.rnd = rnd;
function woodTex(){ return canvasTex("wood", 512, 512, function(g, w, h){ var R = rnd(5); g.fillStyle = "#8a6038"; g.fillRect(0, 0, w, h);
  for(var i = 0; i < 160; i++){ var y = R() * h, a = 0.04 + R() * 0.12; g.strokeStyle = R() < 0.5 ? "rgba(30,15,5," + a + ")" : "rgba(160,110,60," + a + ")"; g.lineWidth = 1 + R() * 3; g.beginPath(); g.moveTo(0, y);
    for(var x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 4 + Math.sin(x * 0.005 + i * 3) * 8); g.stroke(); }
  for(var k = 0; k < 6; k++){ var cx = R() * w, cy = R() * h; for(var r = 18; r > 2; r -= 3){ g.strokeStyle = "rgba(30,15,5,.18)"; g.beginPath(); g.ellipse(cx, cy, r * 2.2, r, 0, 0, 7); g.stroke(); } } }, [2, 2]); }
IQ.woodTex = woodTex;
function starTex(key, base, line, acc){ return canvasTex(key, 256, 256, function(g, w){ g.fillStyle = base; g.fillRect(0, 0, w, w); var R = rnd(9);
  for(var i = 0; i < 2600; i++){ g.fillStyle = "rgba(255,255,255," + R() * 0.05 + ")"; g.fillRect(R() * w, R() * w, 2, 2); }
  var star = function(cx, cy, r, k){ g.beginPath(); for(var j = 0; j < 16; j++){ var a = Math.PI * j / 8 - Math.PI / 2, rr = j % 2 ? r * k : r; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); };
  g.strokeStyle = line; g.lineWidth = 6; star(w / 2, w / 2, w * 0.42, 0.68); g.stroke(); g.fillStyle = acc; star(w / 2, w / 2, w * 0.2, 0.55); g.fill();
  [[0, 0], [w, 0], [0, w], [w, w]].forEach(function(p){ g.fillStyle = acc; star(p[0], p[1], w * 0.16, 0.5); g.fill(); }); }); }
IQ.starTex = starTex;
// ---------- materials ----------
var M = {};
IQ.mat = {
  glaze:function(c, opt){ return new T.MeshPhysicalMaterial(Object.assign({color:c, roughness:0.22, metalness:0, clearcoat:0.8, clearcoatRoughness:0.12}, opt || {})); },
  brass:function(){ return M.brass || (M.brass = new T.MeshStandardMaterial({color:C.brass, metalness:1, roughness:0.32})); },
  gold:function(){ return M.gold || (M.gold = new T.MeshStandardMaterial({color:0xd8b25a, metalness:1, roughness:0.25})); },
  wood:function(){ return M.wood || (M.wood = new T.MeshStandardMaterial({map:woodTex(), roughness:0.6, metalness:0})); },
  stone:function(c){ return new T.MeshStandardMaterial({color:c || 0xcbb895, roughness:0.85, metalness:0}); },
  glow:function(c, i){ return new T.MeshStandardMaterial({color:c, emissive:c, emissiveIntensity:i == null ? 1.6 : i, roughness:0.4}); },
  glass:function(c, o){ return new T.MeshPhysicalMaterial({color:c, roughness:0.12, metalness:0, transmission:0.85, thickness:0.3, transparent:true, opacity:o == null ? 0.9 : o, clearcoat:1}); },
  plain:function(c, r){ return new T.MeshStandardMaterial({color:c, roughness:r == null ? 0.5 : r}); }};
// text on a plane (numerals, labels)
IQ.label = function(txt, o){ o = o || {}; var key = "lb|" + txt + "|" + (o.fg || "") + "|" + (o.bg || "") + "|" + (o.font || ""); var t = canvasTex(key, 256, 256, function(g, w){ if(o.bg){ g.fillStyle = o.bg; g.fillRect(0, 0, w, w); }
    g.fillStyle = o.fg || "#E4D3B5"; g.font = o.font || "bold 150px 'AmiriL', serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, w / 2 + (o.dy || 8)); });
  var m = new T.Mesh(new T.PlaneGeometry(o.s || 1, o.s || 1), new T.MeshStandardMaterial({map:t, transparent:true, roughness:0.4, metalness:o.metal ? 0.6 : 0})); m.rotation.x = -Math.PI / 2; return m; };
IQ.ar = function(n){ return String(n).replace(/[0-9]/g, function(d){ return "٠١٢٣٤٥٦٧٨٩"[+d]; }); };
// ---------- stage ----------
function Stage(box){ var S = this; S.box = box; S.alive = true; S.tw = []; S.t0 = performance.now(); S.reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var cv = S.cv = box.querySelector(".iqCv"); cv.dataset.ib3d = "own"; var r = S.renderer = new T.WebGLRenderer({canvas:cv, antialias:true, powerPreference:"high-performance"});
  r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.4; r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap; r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  var sc = S.scene = new T.Scene(); sc.background = new T.Color(0x22385f); sc.fog = new T.Fog(0x22385f, 24, 50);
  S.camera = new T.PerspectiveCamera(40, 1, 0.1, 100); S.orb = {az:0, el:0.95, d:11, tAz:0, tEl:0.95, tD:11, cx:0, cz:0};
  var hemi = new T.HemisphereLight(0xfff2dc, 0x6a5a48, 1.35); sc.add(hemi);   // 0.6.38 (owner): brighter: games were too dark
  var key = new T.DirectionalLight(0xfff0dc, 1.15); key.position.set(4, 11, 8); sc.add(key);
  var dir = S.fill = new T.DirectionalLight(0xbfd0ff, 0.55); dir.position.set(-6, 8, 6); sc.add(dir);
  var sp = S.pelita = new T.SpotLight(C.gold, 140, 40, Math.PI / 4.2, 0.55, 1.4); sp.position.set(0.5, 9, 2.5); sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.bias = -0.0006; sp.shadow.radius = 4; sc.add(sp); sc.add(sp.target);
  S.base = 220;
  // bench: wooden top with a darker rim, so the board sits on something real
  var bench = new T.Mesh(new T.BoxGeometry(30, 0.6, 22), IQ.mat.wood()); bench.position.y = -0.32; bench.receiveShadow = true; sc.add(bench);
  // the pelita itself: brass bowl, spout and a flame with a soft halo, hanging above the bench
  var lamp = S.lamp = new T.Group(), pts = []; for(var i = 0; i <= 10; i++){ var t = i / 10; pts.push(new T.Vector2(0.05 + Math.sin(t * Math.PI) * 0.42, -0.25 + t * 0.4)); }
  var bowl = new T.Mesh(new T.LatheGeometry(pts, 28), IQ.mat.brass()); lamp.add(bowl);
  var sp2 = new T.Mesh(new T.ConeGeometry(0.09, 0.5, 12), IQ.mat.brass()); sp2.rotation.z = -1.2; sp2.position.set(0.45, 0.05, 0); lamp.add(sp2);
  var fl = S.flame = new T.Mesh(new T.SphereGeometry(0.12, 16, 12), new T.MeshBasicMaterial({color:0xffd27a})); fl.scale.set(0.7, 1.6, 0.7); fl.position.set(0.68, 0.32, 0); lamp.add(fl);
  var halo = S.halo = new T.Sprite(new T.SpriteMaterial({map:canvasTex("halo", 128, 128, function(g, w){ var gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,220,140,1)"); gr.addColorStop(0.3, "rgba(255,190,90,.45)"); gr.addColorStop(1, "rgba(255,170,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); }), transparent:true, depthWrite:false, blending:T.AdditiveBlending}));
  halo.scale.set(2.2, 2.2, 1); halo.position.copy(fl.position); lamp.add(halo);
  [-0.3, 0.3].forEach(function(x){ var ch = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 4, 4), IQ.mat.brass()); ch.position.set(x, 2.05, 0); lamp.add(ch); });
  lamp.position.set(-3.6, 6.2, -3.2); sc.add(lamp);
  S.root = new T.Group(); sc.add(S.root); S.cl = [];
  S.ray = new T.Raycaster(); S.ptr = new T.Vector2();
  S.resize = function(){ var w = cv.clientWidth || box.clientWidth, h = cv.clientHeight || 300; r.setSize(w, h, false); S.camera.aspect = w / h; S.camera.updateProjectionMatrix(); S.fit(); };
  S.fit = function(){ var o = S.orb, tv = Math.tan(S.camera.fov * Math.PI / 360), sz = S.size || 6, nh = sz * 0.54 / (tv * S.camera.aspect), nv = sz * (0.62 * Math.sin(o.tEl) + 0.2) / tv; o.tD = o.d = Math.max(5, nh, nv); };   // fits width and height, whatever the window shape
  window.addEventListener("resize", S.resize);
  input(S); S.resize();
  var loop = function(t){ if(!S.alive) return; S.af = requestAnimationFrame(loop); tick(S, t); }; S.af = requestAnimationFrame(loop); }
function tick(S, t){ var dt = Math.min(0.05, (t - (S.lt || t)) / 1000); S.lt = t;
  for(var i = S.tw.length - 1; i >= 0; i--){ var w = S.tw[i], k = Math.min(1, (t - w.s) / w.d), e = w.e(k); w.u(e); if(k >= 1){ S.tw.splice(i, 1); if(w.f) w.f(); } }
  var o = S.orb; o.az += (o.tAz - o.az) * 0.12; o.el += (o.tEl - o.el) * 0.12; o.d += (o.tD - o.d) * 0.12;
  var c = S.camera; c.position.set(o.cx + Math.sin(o.az) * Math.cos(o.el) * o.d, Math.sin(o.el) * o.d, o.cz + Math.cos(o.az) * Math.cos(o.el) * o.d); c.lookAt(o.cx, 0, o.cz);
  if(!S.reduce){ var f = 1 + Math.sin(t * 0.013) * 0.04 + Math.sin(t * 0.031) * 0.03; S.flame.scale.set(0.7 * f, 1.6 * (2 - f), 0.7 * f); S.halo.material.opacity = 0.75 + (f - 1) * 3; S.pelita.intensity = S.base * f; }
  if(S.onTick) S.onTick(dt, t);
  S.renderer.render(S.scene, c); }
var EASE = {out:function(k){ return 1 - Math.pow(1 - k, 3); }, io:function(k){ return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }, lin:function(k){ return k; },
  back:function(k){ var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); }};
IQ.EASE = EASE;
Stage.prototype.tween = function(ms, u, f, ease){ if(this.reduce) ms = Math.min(ms, 120); this.tw.push({s:performance.now(), d:Math.max(1, ms), u:u, f:f, e:EASE[ease || "io"] || ease}); };
Stage.prototype.busy = function(){ return this.tw.length > 0; };
// move an object to a position along an arc
Stage.prototype.hop = function(obj, to, h, ms, f){ var fr = obj.position.clone(); this.tween(ms || 380, function(k){ obj.position.lerpVectors(fr, to, k); obj.position.y += Math.sin(k * Math.PI) * (h || 0); }, f, "io"); };
Stage.prototype.clear = function(){ (this.cl || []).forEach(function(f){ try{ f(); }catch(e){} }); this.cl = []; var r = this.root; while(r.children.length){ var c = r.children.pop(); c.traverse(function(o){ if(o.geometry) o.geometry.dispose(); }); } this.tw = []; this.onTick = null; };
Stage.prototype.add = function(o, cast){ o.traverse(function(m){ if(m.isMesh){ m.castShadow = cast !== false; m.receiveShadow = true; } }); this.root.add(o); return o; };
Stage.prototype.dispose = function(){ this.alive = false; cancelAnimationFrame(this.af); window.removeEventListener("resize", this.resize); this.clear(); try{ this.renderer.dispose(); this.renderer.forceContextLoss(); }catch(e){} };
function input(S){ var cv = S.cv, d = null, pts = {};
  var pick = function(x, y){ var r = cv.getBoundingClientRect(); S.ptr.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1); S.ray.setFromCamera(S.ptr, S.camera);
    var hit = S.ray.intersectObjects(S.root.children, true); for(var i = 0; i < hit.length; i++){ var o = hit[i].object; while(o && !(o.userData && o.userData.p)) o = o.parent; if(o){ return {o:o, h:hit[i]}; } } return null; };
  S.pickAt = pick;
  cv.addEventListener("pointerdown", function(e){ pts[e.pointerId] = [e.clientX, e.clientY]; if(Object.keys(pts).length === 1) d = {x:e.clientX, y:e.clientY, az:S.orb.tAz, el:S.orb.tEl, mv:false}; else d = null; try{ cv.setPointerCapture(e.pointerId); }catch(er){} });
  cv.addEventListener("pointermove", function(e){ if(!pts[e.pointerId]) return; var ks = Object.keys(pts);
    if(ks.length === 2){ var a = pts[ks[0]], b = pts[ks[1]], d0 = Math.hypot(a[0] - b[0], a[1] - b[1]); pts[e.pointerId] = [e.clientX, e.clientY]; a = pts[ks[0]]; b = pts[ks[1]]; var d1 = Math.hypot(a[0] - b[0], a[1] - b[1]); S.orb.tD = Math.max(5, Math.min(30, S.orb.tD * d0 / Math.max(1, d1))); return; }
    pts[e.pointerId] = [e.clientX, e.clientY]; if(!d) return; var dx = e.clientX - d.x, dy = e.clientY - d.y; if(Math.abs(dx) + Math.abs(dy) > 8) d.mv = true;
    if(d.mv && S.drag !== false && !(S.onDrag && S.onDrag(e, dx, dy))){ S.orb.tAz = Math.max(-1.1, Math.min(1.1, d.az - dx * 0.006)); S.orb.tEl = Math.max(0.42, Math.min(1.4, d.el + dy * 0.005)); } });
  var up = function(e){ var was = d && !d.mv && Object.keys(pts).length === 1; delete pts[e.pointerId]; if(was && S.onPick && !S.lock){ var p = pick(e.clientX, e.clientY); S.onPick(p ? p.o : null, p ? p.h : null, e); } if(S.onUp) S.onUp(e); d = null; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", function(e){ delete pts[e.pointerId]; d = null; });
  cv.addEventListener("wheel", function(e){ e.preventDefault(); S.orb.tD = Math.max(5, Math.min(30, S.orb.tD * (e.deltaY > 0 ? 1.08 : 0.93))); }, {passive:false}); }
// ---------- the game page ----------
var G = null;   // {S, id, lv, def, inst, moves}
function css(){ if(document.getElementById("iqCss")) return; var l = document.createElement("link"); l.id = "iqCss"; l.rel = "stylesheet"; l.href = "iq/iq.css"; document.head.appendChild(l); }
// 0.6.38 (owner: "too easy"): levels 4-6 = Sangat sukar / Lebih sukar / Ekstrem. Locked until level 3 is solved.
// Move limit from the game's par (fewest moves): 1.5×, 1.2×, exactly par. Hints 3 / 1 / none. Stars: ★★★ = par, ★★ ≤ 1.2× par, ★ solved.
var TIER = [null, null, null, {lim:1.5, hints:3}, {lim:1.2, hints:1}, {lim:1, hints:0}], LVN = [["1","1"],["2","2"],["3","3"],["Sangat sukar","Very hard"],["Lebih sukar","Extra hard"],["Ekstrem","Extreme"]];
IQ.TIER = TIER;
function lvLabel(id, l){ var b = IQ.best(id, l) != null, lock = l > 2 && IQ.best(id, 2) == null, s = IQ.stars(id, l);
  return (lock ? "🔒 " : "") + (l < 3 ? L("Tahap ", "Level ") + (l + 1) : L(LVN[l][0], LVN[l][1])) + (b ? " " + (s ? "★".repeat(s) : "✓") : ""); }
function open(box, id, lv){ var m = IQ.meta(id); if(!m) return; var file = "iq/g_" + id + ".js", hh = 46; try{ hh = +localStorage.getItem("ihsan_iq_h") || 46; }catch(e){}
  box.innerHTML = '<div class="iqGame"><div class="iqTop"><button class="iqB" id="iqBack">‹</button><div class="iqT"><b>' + H.esc(L(m[2], m[3])) + '</b><span dir="rtl">' + m[4] + '</span></div><button class="iqB" id="iqReset" title="Reset">⟲</button></div>' +
    '<div class="iqRule">' + H.esc(L(m[5], m[6])) + '</div><div class="iqLv">' + [0, 1, 2, 3, 4, 5].map(function(l){ return '<button data-iql="' + l + '" class="' + (l > 2 ? "hard t" + l : "") + '">' + lvLabel(id, l) + '</button>'; }).join("") + '</div>' +
    '<div class="iqStage" style="height:' + hh + 'vh"><canvas class="iqCv"></canvas><div class="iqMsg" id="iqMsg"></div><div class="iqWin" id="iqWin"></div></div><div class="iqGrip" id="iqGrip" title="' + L("Seret untuk ubah saiz", "Drag to resize") + '"><i></i></div><div class="iqCtl" id="iqCtl"></div>' +
    '<div class="iqBar"><span>' + L("Langkah", "Moves") + ' <b id="iqMv">0</b><small id="iqLim"></small></span><span>' + L("Terbaik", "Best") + ' <b id="iqBest">–</b></span><button class="iqB" id="iqHint">💡 ' + L("Petunjuk", "Hint") + '<small id="iqHn"></small></button></div></div>';
  // the 3D window starts at about half the screen; drag the grip to make it taller or shorter (remembered)
  var grip = box.querySelector("#iqGrip"), stg = box.querySelector(".iqStage"), y0 = 0, h0 = 0;
  grip.addEventListener("pointerdown", function(e){ y0 = e.clientY; h0 = stg.getBoundingClientRect().height; try{ grip.setPointerCapture(e.pointerId); }catch(er){} grip.classList.add("on"); });
  grip.addEventListener("pointermove", function(e){ if(!grip.classList.contains("on")) return; var nh = Math.max(window.innerHeight * 0.25, Math.min(window.innerHeight * 0.85, h0 + e.clientY - y0)); stg.style.height = nh + "px"; if(G && G.S) G.S.resize(); });
  grip.addEventListener("pointerup", function(){ if(!grip.classList.contains("on")) return; grip.classList.remove("on"); var vh = Math.round(stg.getBoundingClientRect().height / window.innerHeight * 100); stg.style.height = vh + "vh"; try{ localStorage.setItem("ihsan_iq_h", vh); }catch(e){} if(G && G.S) G.S.resize(); });
  var go = function(){ if(!document.body.contains(box)) return; var def = IQ.defs[id]; if(!def){ box.querySelector("#iqMsg").textContent = "…"; return; }
    if(G && G.S) G.S.dispose(); var S = new Stage(box.querySelector(".iqStage")); G = {S:S, id:id, def:def, box:box}; S.game = G;
    box.querySelector("#iqBack").onclick = function(){ close(); list(box); };
    box.querySelector("#iqReset").onclick = function(){ start(G.lv); };
    box.querySelector("#iqHint").onclick = function(){ if(G.won || G.failed) return; if(G.hints === 0){ say(L("Tiada petunjuk pada tahap ini", "No hints at this level"), 2000); return; }
      var h = G.inst && G.inst.hint ? G.inst.hint() : null; if(h){ if(G.hints > 0){ G.hints--; G.usedHint = true; hintN(); } say(h, 2800); } };
    box.querySelectorAll("[data-iql]").forEach(function(b){ b.onclick = function(){ var l = +b.getAttribute("data-iql"); if(l > 2 && IQ.best(id, 2) == null){ say(L("Selesaikan Tahap 3 dahulu", "Solve level 3 first"), 2000); return; } start(l); }; });
    var first = lv == null ? Math.min(2, IQ.solved(id)) : lv; if(lv == null && IQ.best(id, 2) != null){ for(var k = 3; k < 6; k++){ first = k; if(IQ.best(id, k) == null) break; } } start(first); };
  if(IQ.defs[id]) go(); else H.loadJs([file], go, function(){ say(L("Gagal dimuatkan", "Could not load"), 3000); }); }
function hintN(){ var e = G.box.querySelector("#iqHn"); if(e) e.textContent = G.hints == null || G.hints < 0 ? "" : " ×" + G.hints; }
function start(lv){ var S = G.S, box = G.box; G.lv = lv; G.moves = 0; G.won = false; G.failed = false; G.usedHint = false; S.lock = false; S.clear(); S.base = 220; S.onPick = null; S.onDrag = null; S.onUp = null; S.onTick = null; S.drag = true; S.size = 6; S.orb.tAz = 0; S.orb.tEl = 0.95; S.orb.cx = S.orb.cz = 0;
  S.scene.background = new T.Color(0x22385f);
  box.querySelectorAll("[data-iql]").forEach(function(b){ b.classList.toggle("on", +b.getAttribute("data-iql") === lv); });
  box.querySelector("#iqWin").className = "iqWin"; box.querySelector("#iqCtl").innerHTML = ""; var b = IQ.best(G.id, lv); box.querySelector("#iqBest").textContent = b == null ? "–" : b;
  G.inst = G.def.build(S, lv, api) || {}; var t = TIER[lv]; G.par = G.inst.par || null; G.lim = t && G.par ? Math.ceil(G.par * t.lim) : (G.inst.lim || null); G.hints = t ? t.hints : -1; hintN(); mv(0); S.resize(); }
function mv(n){ if(!G) return; G.moves = n; var e = G.box.querySelector("#iqMv"); if(e) e.textContent = n; var l = G.box.querySelector("#iqLim"); if(l) l.textContent = G.lim ? " / " + G.lim : (G.par ? " · " + L("terbaik ", "par ") + G.par : "");
  if(l) l.className = G.lim && n > G.lim * 0.8 ? "warn" : ""; }
function say(t, ms){ if(!G) return; var m = G.box.querySelector("#iqMsg"); if(!m) return; m.textContent = t; m.classList.add("on"); clearTimeout(say.t); say.t = setTimeout(function(){ m.classList.remove("on"); }, ms || 1800); }
function fail(why){ if(G.won || G.failed) return; G.failed = true; G.S.lock = true; var w = G.box.querySelector("#iqWin");
  w.innerHTML = '<b class="no">' + L("Belum", "Not yet") + '</b><span>' + H.esc(why || L("Melebihi had langkah ", "Over the move limit of ") + G.lim) + '</span><button class="iqB gold" id="iqRetry">⟲ ' + L("Cuba lagi", "Try again") + '</button>';
  w.className = "iqWin on"; w.querySelector("#iqRetry").onclick = function(){ start(G.lv); }; }
var api = {
  move:function(d){ mv(G.moves + (d == null ? 1 : d)); if(G.lim && G.moves > G.lim && !G.won) setTimeout(function(){ if(!G.won) fail(); }, 50); return G.moves; },
  moves:function(){ return G.moves; }, say:say, L:L, lv:function(){ return G.lv; }, tier:function(){ return G.lv - 2; }, fail:function(t){ fail(t); },
  ctl:function(html){ var c = G.box.querySelector("#iqCtl"); c.innerHTML = html; return c; },
  win:function(score){ if(G.won || G.failed) return; G.won = true; var S = G.S, id = G.id, lv = G.lv, sc = score == null ? G.moves : score, o = st(), r = o[id] = o[id] || {}, prev = r["b" + lv], better = prev == null || sc < prev;
    var stars = !G.par ? (G.usedHint ? 2 : 3) : sc <= G.par ? 3 : sc <= Math.ceil(G.par * 1.2) ? 2 : 1;
    if(better) r["b" + lv] = sc; r["s" + lv] = Math.max(r["s" + lv] || 0, stars); stSave(o); S.lock = true;
    // the one orchestrated moment: the pelita brightens, the camera makes a slow quarter orbit, pieces settle
    var a0 = S.orb.tAz; S.tween(2400, function(k){ S.base = 220 + 200 * Math.sin(k * Math.PI); if(!S.reduce) S.orb.tAz = a0 + Math.sin(k * Math.PI) * 0.5; }, null, "lin");
    var w = G.box.querySelector("#iqWin"); w.innerHTML = '<b>' + L("Selesai", "Solved") + '</b><span><em class="iqStars">' + "★".repeat(stars) + '<i>' + "★".repeat(3 - stars) + '</i></em> ' + L("Langkah ", "Moves ") + sc + (G.par ? " · " + L("terbaik ", "par ") + G.par : "") + (better && prev != null ? " · " + L("rekod baharu", "new best") : "") + '</span>' +
      (lv < 5 ? '<button class="iqB gold" id="iqNext">' + L("Seterusnya", "Next") + ' ›</button>' : '<button class="iqB gold" id="iqAgain">⟲ ' + L("Lagi", "Again") + '</button>');
    setTimeout(function(){ w.className = "iqWin on"; }, 900);
    var nx = w.querySelector("#iqNext"); if(nx) nx.onclick = function(){ start(lv + 1); }; var ag = w.querySelector("#iqAgain"); if(ag) ag.onclick = function(){ start(lv); };
    G.box.querySelectorAll("[data-iql]").forEach(function(b){ var l = +b.getAttribute("data-iql"); b.textContent = lvLabel(id, l); });
    var bs = G.box.querySelector("#iqBest"); bs.textContent = IQ.best(id, lv); }};
IQ.api = api;
function close(){ if(G && G.S) G.S.dispose(); G = null; }
// ---------- catalogue ----------
function list(box){ css(); var done = IQ.list.filter(function(m){ return IQ.solved(m[0]) > 0; }).length;
  box.innerHTML = '<div class="iqHead"><b>🧠 ' + L("Teka-teki IQ", "IQ puzzles") + '</b><small>' + L("20 permainan warisan Islam, Arab dan Melayu. Mudah dimulakan, mencabar untuk diselesaikan.", "20 games from Islamic, Arab and Malay heritage. Easy to start, hard to master.") + ' · ' + done + '/20</small></div>' +
    '<div class="iqTiles">' + IQ.list.map(function(m){ var n = IQ.solved(m[0]); return '<button class="iqTile" data-iq="' + m[0] + '"><canvas width="200" height="200" data-iqt="' + m[0] + '"></canvas><span class="iqTn">' + H.esc(L(m[2], m[3])) + '</span><span class="iqTd">' + ["", "●○○", "●●○", "●●●"][m[7]] + (n ? ' <i>' + n + '/6</i>' : '') + '</span></button>'; }).join("") + '</div>';
  box.querySelectorAll("[data-iq]").forEach(function(b){ b.onclick = function(){ open(box, b.getAttribute("data-iq")); }; });
  box.querySelectorAll("[data-iqt]").forEach(function(c){ thumb(c, c.getAttribute("data-iqt")); }); }
IQ.thumb = function(c, id){ thumb(c, id); };
// small lit drawings: each tile shows the game's board as an object under the lamp
function thumb(c, id){ var g = c.getContext("2d"), w = c.width, h = c.height, R = rnd(id.length * 97 + id.charCodeAt(0));
  var bg = g.createRadialGradient(w * 0.35, h * 0.2, 10, w / 2, h / 2, w * 0.8); bg.addColorStop(0, "#2a3c66"); bg.addColorStop(1, "#0b1530"); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  var lg = g.createRadialGradient(w * 0.3, h * 0.18, 0, w * 0.3, h * 0.18, w * 0.75); lg.addColorStop(0, "rgba(255,200,110,.35)"); lg.addColorStop(1, "rgba(255,200,110,0)"); g.fillStyle = lg; g.fillRect(0, 0, w, h);
  var col = {b:"#1F5FA8", t:"#2AA198", g:"#D4A544", s:"#E4D3B5", c:"#8E2B2B", w:"#7a5230", d:"#0F1E3A"};
  var tile = function(x, y, s, f, r){ var gr = g.createLinearGradient(x, y, x + s, y + s); gr.addColorStop(0, "rgba(255,255,255,.35)"); gr.addColorStop(0.35, f); gr.addColorStop(1, "rgba(0,0,0,.35)"); g.fillStyle = f; rr(x, y, s, s, r || 4); g.fill(); g.fillStyle = gr; g.globalAlpha = 0.5; g.fill(); g.globalAlpha = 1; };
  var rr = function(x, y, a, b, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + a, y, x + a, y + b, r); g.arcTo(x + a, y + b, x, y + b, r); g.arcTo(x, y + b, x, y, r); g.arcTo(x, y, x + a, y, r); g.closePath(); };
  var ball = function(x, y, r, f){ var gr = g.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r); gr.addColorStop(0, "#fff"); gr.addColorStop(0.25, f); gr.addColorStop(1, "rgba(0,0,0,.7)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  var board = function(x, y, s){ g.fillStyle = "rgba(0,0,0,.35)"; rr(x + 4, y + 8, s, s, 10); g.fill(); var gr = g.createLinearGradient(x, y, x, y + s); gr.addColorStop(0, "#8a5a32"); gr.addColorStop(1, "#4a2c16"); g.fillStyle = gr; rr(x, y, s, s, 10); g.fill(); };
  var star = function(cx, cy, r, k, f){ g.beginPath(); for(var j = 0; j < 16; j++){ var a = Math.PI * j / 8 - Math.PI / 2, q = j % 2 ? r * k : r; g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } g.closePath(); g.fillStyle = f; g.fill(); };
  var glow = function(x, y, r, c2){ var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c2); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
  var X = w * 0.14, Y = h * 0.16, B = w * 0.72, i, j;
  ({mirror:function(){ board(X, Y, B); for(i = 0; i < 4; i++) for(j = 0; j < 4; j++) tile(X + 8 + i * 30, Y + 8 + j * 30, 26, (i + j) % 2 ? col.b : "#18467e"); g.strokeStyle = "#ffe08a"; g.lineWidth = 6; g.shadowColor = "#ffd27a"; g.shadowBlur = 18;
      g.beginPath(); g.moveTo(X - 6, Y + 21); g.lineTo(X + 81, Y + 21); g.lineTo(X + 81, Y + 111); g.lineTo(X + 125, Y + 111); g.stroke(); g.shadowBlur = 0; g.fillStyle = "#c9a35a"; g.save(); g.translate(X + 81, Y + 21); g.rotate(-0.78); g.fillRect(-14, -3, 28, 6); g.restore(); g.save(); g.translate(X + 81, Y + 111); g.rotate(-0.78); g.fillRect(-14, -3, 28, 6); g.restore(); glow(X + 125, Y + 111, 26, "rgba(42,161,152,.9)"); },
   tingkat:function(){ g.fillStyle = "#3b2414"; rr(20, 150, 160, 16, 6); g.fill(); [50, 100, 150].forEach(function(x){ g.fillStyle = "#c9a35a"; g.fillRect(x - 3, 60, 6, 92); }); [[50, 52], [50, 40], [50, 28], [100, 34]].forEach(function(t, k){ var gr = g.createLinearGradient(t[0] - t[1], 0, t[0] + t[1], 0); gr.addColorStop(0, "#7a5a2a"); gr.addColorStop(0.5, "#f3dc9a"); gr.addColorStop(1, "#8a6a30"); g.fillStyle = gr; rr(t[0] - t[1], [136, 120, 104, 136][k], t[1] * 2, 14, 7); g.fill(); }); },
   pelita:function(){ board(X, Y, B); for(i = 0; i < 3; i++) for(j = 0; j < 3; j++){ var on = (i + j * 2) % 3 === 0, x = X + 22 + i * 46, y = Y + 26 + j * 46; tile(x - 18, y - 18, 36, "#18325e", 8); if(on){ glow(x, y, 30, "rgba(255,190,90,.8)"); } ball(x, y + 4, 9, on ? "#ffd27a" : "#5a4a3a"); } },
   zellige:function(){ board(X, Y, B); var n = 0; for(j = 0; j < 3; j++) for(i = 0; i < 3; i++){ n++; if(n === 9) continue; tile(X + 7 + i * 43, Y + 7 + j * 43, 40, n % 2 ? col.b : col.t, 6); g.fillStyle = "#f2e6c8"; g.font = "bold 26px serif"; g.textAlign = "center"; g.fillText("٠١٢٣٤٥٦٧٨"[n], X + 27 + i * 43, Y + 37 + j * 43); } },
   guli:function(){ board(X, Y, B); g.strokeStyle = "#e9d7b0"; g.lineWidth = 6; g.beginPath(); g.moveTo(X + 50, Y + 10); g.lineTo(X + 50, Y + 80); g.moveTo(X + 90, Y + 60); g.lineTo(X + 140, Y + 60); g.stroke(); g.fillStyle = "#050a14"; g.beginPath(); g.arc(X + 120, Y + 115, 13, 0, 7); g.fill(); ball(X + 28, Y + 30, 12, "#4d96ff"); },
   girih:function(){ star(w / 2, h / 2, 70, 0.62, "#18325e"); star(w / 2, h / 2, 46, 0.62, col.t); star(w / 2, h / 2, 24, 0.55, col.g); for(i = 0; i < 8; i++){ g.save(); g.translate(w / 2, h / 2); g.rotate(i * Math.PI / 4); g.fillStyle = i % 2 ? col.b : "#c9a35a"; g.beginPath(); g.moveTo(52, 0); g.lineTo(72, -10); g.lineTo(84, 0); g.lineTo(72, 10); g.fill(); g.restore(); } },
   tikar:function(){ board(X, Y, B); for(i = 0; i < 7; i++) for(j = 0; j < 7; j++){ if((i < 2 || i > 4) && (j < 2 || j > 4)) continue; var x = X + 12 + i * 20, y = Y + 12 + j * 20; g.fillStyle = "#2a160a"; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); if(!(i === 3 && j === 3) && R() < 0.7) ball(x, y - 1, 7, "#d9b77a"); } },
   faras:function(){ for(i = 0; i < 5; i++) for(j = 0; j < 5; j++) tile(X + i * 29, Y + j * 29, 28, (i + j) % 2 ? "#e4d3b5" : "#6b4a2e", 2); g.strokeStyle = "#ffd27a"; g.lineWidth = 5; g.shadowColor = "#ffd27a"; g.shadowBlur = 14; g.beginPath(); g.moveTo(X + 14, Y + 14); g.lineTo(X + 72, Y + 43); g.lineTo(X + 130, Y + 14); g.lineTo(X + 101, Y + 72); g.stroke(); g.shadowBlur = 0; g.fillStyle = "#f2e6c8"; g.font = "38px serif"; g.textAlign = "center"; g.fillText("♞", X + 101, Y + 84); },
   congkak:function(){ g.fillStyle = "#5a3418"; rr(18, 60, 164, 90, 40); g.fill(); [55, 100, 145].forEach(function(x, k){ g.fillStyle = "#2a160a"; g.beginPath(); g.ellipse(x, 105, 22, 26, 0, 0, 7); g.fill(); for(i = 0; i < 3 + k; i++) ball(x - 8 + (i % 3) * 8, 95 + Math.floor(i / 3) * 10, 5, "#c8a070"); }); },
   falaj:function(){ for(i = 0; i < 3; i++) for(j = 0; j < 3; j++) tile(X + i * 48, Y + j * 48, 46, "#b9a382", 4); g.strokeStyle = "#5ad1ff"; g.lineWidth = 9; g.shadowColor = "#5ad1ff"; g.shadowBlur = 14; g.beginPath(); g.moveTo(X + 24, Y); g.lineTo(X + 24, Y + 72); g.lineTo(X + 120, Y + 72); g.lineTo(X + 120, Y + 144); g.moveTo(X + 72, Y + 72); g.lineTo(X + 72, Y + 120); g.stroke(); g.shadowBlur = 0; },
   songket:function(){ var s = 44, cx = w / 2, cy = h / 2 + 6; g.fillStyle = col.b; g.beginPath(); g.moveTo(cx, cy - s); g.lineTo(cx + s, cy - s / 2); g.lineTo(cx, cy); g.lineTo(cx - s, cy - s / 2); g.fill(); g.fillStyle = "#c99a3a"; g.beginPath(); g.moveTo(cx - s, cy - s / 2); g.lineTo(cx, cy); g.lineTo(cx, cy + s); g.lineTo(cx - s, cy + s / 2); g.fill(); g.fillStyle = "#7a1426"; g.beginPath(); g.moveTo(cx + s, cy - s / 2); g.lineTo(cx, cy); g.lineTo(cx, cy + s); g.lineTo(cx + s, cy + s / 2); g.fill(); g.strokeStyle = "#ffe9a8"; g.lineWidth = 2; for(i = 0; i < 4; i++){ g.beginPath(); g.moveTo(cx - s + 6 + i * 10, cy - s / 2 + 8 + i * 5); g.lineTo(cx - s + 6 + i * 10, cy + s / 2 - 6 + i * 5); g.stroke(); } },
   lulu:function(){ for(j = 0; j < 4; j++){ for(i = 0; i < 4; i++) ball(40 + i * 32, 40 + j * 36, 11, ["#f5f0e6", "#e88aa0", "#7ad1ff", "#ffd27a"][(i + j * 2) % 4]); for(i = 0; i < 4; i++){ g.fillStyle = i < 2 - j % 2 ? "#ffd27a" : "#5a6a8a"; g.beginPath(); g.arc(170 + (i % 2) * 10, 34 + j * 36 + Math.floor(i / 2) * 10, 3.5, 0, 7); g.fill(); } } },
   wau:function(){ var sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, "#2a5aa0"); sk.addColorStop(1, "#7ab8e8"); g.fillStyle = sk; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(255,255,255,.85)"; [[40, 150], [140, 60]].forEach(function(p){ for(i = 0; i < 4; i++){ g.beginPath(); g.arc(p[0] + i * 14, p[1] + Math.sin(i) * 4, 14, 0, 7); g.fill(); } });
      g.save(); g.translate(100, 95); g.fillStyle = "#e63946"; g.beginPath(); g.moveTo(0, -45); g.quadraticCurveTo(38, -20, 14, 0); g.quadraticCurveTo(40, 20, 0, 40); g.quadraticCurveTo(-40, 20, -14, 0); g.quadraticCurveTo(-38, -20, 0, -45); g.fill(); g.fillStyle = "#ffd23f"; g.beginPath(); g.moveTo(0, -30); g.lineTo(10, 0); g.lineTo(0, 26); g.lineTo(-10, 0); g.fill(); g.restore(); },
   mihrab:function(){ board(X, Y, B); for(i = 0; i < 4; i++) for(j = 0; j < 4; j++){ var c2 = [col.b, col.t, col.g, null][(Math.min(i, 3 - i) + j) % 4]; if(c2 && (i < 2 || R() < 0.6)) tile(X + 8 + i * 34, Y + 8 + j * 34, 30, c2, 5); } g.fillStyle = "#e9c96a"; g.fillRect(w / 2 - 2, Y, 4, B); },
   mashrabiya:function(){ g.fillStyle = "#cdbb9a"; g.fillRect(110, 20, 80, 160); g.fillStyle = "rgba(20,10,0,.55)"; [[0, 0], [1, 0], [1, 1], [1, 2], [0, 2]].forEach(function(p){ g.fillRect(122 + p[0] * 24, 50 + p[1] * 24, 24, 24); }); g.strokeStyle = "#ffd27a"; g.setLineDash([5, 4]); g.strokeRect(122, 50, 48, 72); g.setLineDash([]);
      for(i = 0; i < 3; i++) for(j = 0; j < 3; j++) if((i + j) % 2 === 0 || i === 1) tile(24 + i * 22, 80 + j * 22, 20, "#8a5a32", 3); },
   kendi:function(){ [[60, 1, 0.6, col.b], [140, 0.75, 0.3, col.t]].forEach(function(k){ var x = k[0], s = k[1]; g.save(); g.translate(x, 110); g.scale(s, s); g.fillStyle = k[3]; g.beginPath(); g.ellipse(0, 10, 40, 46, 0, 0, 7); g.fill(); g.fillRect(-12, -60, 24, 30); g.fillStyle = "rgba(90,200,255,.7)"; g.beginPath(); g.ellipse(0, 10 + 46 * (1 - k[2] * 2), 36, 8, 0, 0, 7); g.fill(); g.restore(); }); },
   fanous:function(){ [["#e63946", 50], ["#2a9d8f", 100], ["#457b9d", 150]].forEach(function(f){ glow(f[1], 70, 40, f[0]); g.fillStyle = f[0]; rr(f[1] - 14, 50, 28, 40, 6); g.fill(); g.fillStyle = "#c9a35a"; g.fillRect(f[1] - 16, 46, 32, 6); g.fillRect(f[1] - 1, 20, 2, 26); }); ball(100, 150, 24, "#b98ad1"); },
   gasing:function(){ board(X, Y, B); [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2]].forEach(function(p, k){ var x = X + 24 + p[0] * 32, y = Y + 28 + p[1] * 36; g.fillStyle = k < 4 ? "#c9a35a" : "#5a4a3a"; g.beginPath(); g.moveTo(x - 13, y); g.lineTo(x + 13, y); g.lineTo(x, y + 18); g.fill(); g.beginPath(); g.ellipse(x, y, 13, 5, 0, 0, 7); g.fill(); if(k < 4){ g.strokeStyle = "rgba(255,220,140,.7)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 18, 7, 0, 0, 7); g.stroke(); } }); },
   pola:function(){ g.fillStyle = "#3b2414"; g.fillRect(14, 120, 172, 10); ball(36, 100, 14, col.b); g.fillStyle = col.t; g.fillRect(64, 86, 26, 26); ball(118, 100, 14, col.b); g.strokeStyle = "#ffd27a"; g.setLineDash([5, 4]); g.lineWidth = 2; g.strokeRect(144, 84, 30, 30); g.setLineDash([]); g.fillStyle = "#ffd27a"; g.font = "bold 22px sans-serif"; g.textAlign = "center"; g.fillText("?", 159, 106); },
   kotak:function(){ board(X, Y, B); g.strokeStyle = "rgba(255,230,160,.6)"; g.setLineDash([6, 5]); g.lineWidth = 3; g.beginPath(); g.moveTo(X + 20, Y + 120); g.lineTo(X + 20, Y + 40); g.lineTo(X + 120, Y + 40); g.lineTo(X + 120, Y + 20); g.stroke(); g.setLineDash([]); tile(X + 8, Y + 108, 24, col.t, 4); g.fillStyle = "#c9a35a"; g.save(); g.translate(X + 20, Y + 40); g.rotate(0.78); g.fillRect(-14, -3, 28, 6); g.restore(); glow(X + 120, Y + 18, 22, "rgba(255,210,120,.9)"); }}[id] || function(){})();
  var vg = g.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.45)"); g.fillStyle = vg; g.fillRect(0, 0, w, h); }
// ---------- shared board: a wooden tray with a carved rim and (optionally) glazed tiles ----------
IQ.tray = function(S, cols, rows, cell, o){ o = o || {}; var g = new T.Group(), W = cols * cell, D = rows * cell, pad = o.pad == null ? 0.35 : o.pad;
  var base = new T.Mesh(new T.BoxGeometry(W + pad * 2, 0.3, D + pad * 2), IQ.mat.wood()); base.position.y = 0.15; g.add(base);
  var rimM = IQ.mat.brass(), rim = function(w, d, x, z){ var m = new T.Mesh(new T.BoxGeometry(w, 0.16, d), rimM); m.position.set(x, 0.36, z); g.add(m); };
  rim(W + pad * 2, 0.08, 0, -(D / 2 + pad)); rim(W + pad * 2, 0.08, 0, D / 2 + pad); rim(0.08, D + pad * 2, -(W / 2 + pad), 0); rim(0.08, D + pad * 2, W / 2 + pad, 0);
  var pos = function(x, z, y){ return new T.Vector3((x - (cols - 1) / 2) * cell, y == null ? 0.3 : y, (z - (rows - 1) / 2) * cell); };
  var tiles = [];
  if(o.tiles !== false){ var geo = new T.BoxGeometry(cell * 0.94, 0.12, cell * 0.94), mats = o.mats || [IQ.mat.glaze(0xffffff, {map:IQ.starTex("tb", "#3a86d6", "#bcdcff", "#e8b84a")}), IQ.mat.glaze(0xffffff, {map:IQ.starTex("tb2", "#2f70bf", "#a6c8f2", "#3cc8b8")})];
    for(var z = 0; z < rows; z++) for(var x = 0; x < cols; x++){ var t = new T.Mesh(geo, mats[(x + z) % mats.length]); t.position.copy(pos(x, z, 0.36)); t.userData = {p:1, cell:[x, z]}; g.add(t); tiles.push(t); } }
  S.add(g); S.size = Math.max(W, D) + pad * 2 + 1; return {g:g, pos:pos, tiles:tiles, W:W, D:D, top:0.42}; };
// "slide until it stops" mover used by Guli and Wau: grid of walls between cells and blocking cells
IQ.slide = function(grid, from, dir, stop){ var x = from[0], y = from[1], path = [[x, y]]; for(var n = 0; n < 99; n++){ var nx = x + dir[0], ny = y + dir[1]; if(stop(x, y, nx, ny)) break; x = nx; y = ny; path.push([x, y]); if(grid.hole && grid.hole(x, y)) break; } return path; };
// ---------- slide maze (Guli marbles, Wau kites): '#' block, S actor (all move together), G hole (one actor each; opens only when every coin c is taken),
// O trap (falls: the board starts again), < > ^ v one-way. The same rules as the offline level generator, so par is the true fewest moves.
IQ.maze = function(S, A, rows, th){ var h = rows.length, w = rows[0].length, cs = 1, OW = {">":[1,0], "<":[-1,0], "v":[0,1], "^":[0,-1]}, B = IQ.tray(S, w, h, cs, {tiles:false, pad:th.pad == null ? 0.35 : th.pad});
  var flo = th.floor(), cell = function(x, z){ return rows[z] ? rows[z][x] : undefined; }, starts = [], coinsAll = [], coinMesh = {}, key = function(p){ return p[0] + "," + p[1]; };
  for(var z = 0; z < h; z++) for(var x = 0; x < w; x++){ var c = cell(x, z), f = new T.Mesh(new T.BoxGeometry(cs * 0.98, 0.08, cs * 0.98), flo[(x + z) % flo.length]); f.position.copy(B.pos(x, z, 0.34)); f.receiveShadow = true; B.g.add(f);
    if(c === "#") B.g.add(th.block(B.pos(x, z, 0.38)));
    else if(c === "G") B.g.add(th.goal(B.pos(x, z, 0.38)));
    else if(c === "O") B.g.add(th.trap(B.pos(x, z, 0.38)));
    else if(c === "c"){ var cm = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.06, 24), IQ.mat.gold()); cm.rotation.x = Math.PI / 2; cm.position.copy(B.pos(x, z, 0.62)); cm.castShadow = true; B.g.add(cm); coinMesh[key([x, z])] = cm; coinsAll.push(key([x, z])); }
    else if(OW[c]){ var ar = new T.Mesh(new T.ConeGeometry(0.24, 0.46, 3), IQ.mat.glow(IQ.C.teal, 1.1)); ar.rotation.x = Math.PI / 2; ar.rotation.z = -Math.atan2(OW[c][0], -OW[c][1]); ar.position.copy(B.pos(x, z, 0.45)); ar.scale.set(1, 1, 0.25); B.g.add(ar); }
    if(c === "S") starts.push([x, z]); }
  var acts = starts.map(function(p, i){ var a = th.actor(i); a.position.copy(B.pos(p[0], p[1], th.ay)); S.add(a); return a; });
  function step(st, d){ var a = st.a.map(function(p){ return p ? p.slice() : null; }), f = Object.assign({}, st.f), cn = Object.assign({}, st.c), order = a.map(function(p, i){ return p ? i : -1; }).filter(function(i){ return i >= 0; }).sort(function(p, q){ return (a[q][0] - a[p][0]) * d[0] + (a[q][1] - a[p][1]) * d[1]; });
    var occ = {}, paths = [], trap = false; a.forEach(function(p){ if(p) occ[key(p)] = 1; });
    order.forEach(function(i){ var p = a[i]; if(!p || trap) return; delete occ[key(p)]; var x = p[0], z = p[1], path = [[x, z]], gone = false;
      for(var k = 0; k < 60; k++){ var nx = x + d[0], nz = z + d[1], ch = cell(nx, nz); if(ch === undefined || ch === "#" || occ[nx + "," + nz]) break; if(OW[ch] && (OW[ch][0] !== d[0] || OW[ch][1] !== d[1])) break;
        x = nx; z = nz; path.push([x, z]); if(ch === "c") cn[x + "," + z] = 1; if(ch === "O"){ trap = true; break; } if(ch === "G" && !f[x + "," + z] && Object.keys(cn).length === coinsAll.length){ f[x + "," + z] = 1; gone = true; break; } }
      paths[i] = {path:path, gone:gone}; a[i] = gone ? null : [x, z]; if(!gone) occ[x + "," + z] = 1; });
    return {a:a, f:f, c:cn, paths:paths, trap:trap}; }
  var st0 = {a:starts.map(function(p){ return p.slice(); }), f:{}, c:{}}, st = JSON.parse(JSON.stringify(st0)), busy = false;
  var sk = function(s){ return s.a.map(function(p){ return p ? key(p) : "-"; }).join("|") + "/" + Object.keys(s.f).sort().join("|") + "/" + Object.keys(s.c).sort().join("|"); };
  function bfs(from){ var D = [[1,0],[-1,0],[0,1],[0,-1]], seen = {}, q = [[from, null, 0]]; seen[sk(from)] = 1;
    while(q.length){ var it = q.shift(); if(it[2] > 40) break; for(var i = 0; i < 4; i++){ var n = step(it[0], D[i]); if(n.trap || sk(n) === sk(it[0])) continue; var first = it[1] || D[i];
        if(n.a.every(function(p){ return !p; })) return {d:first, n:it[2] + 1}; var k = sk(n); if(!seen[k]){ seen[k] = 1; q.push([{a:n.a, f:n.f, c:n.c}, first, it[2] + 1]); } } } return null; }
  var par = (bfs(st0) || {n:0}).n;
  function reset(){ st = JSON.parse(JSON.stringify(st0)); acts.forEach(function(a, i){ a.visible = true; a.scale.setScalar(1); a.position.copy(B.pos(starts[i][0], starts[i][1], th.ay)); }); coinsAll.forEach(function(k){ coinMesh[k].visible = true; }); busy = false; }
  function go(d){ if(busy || S.lock) return; var r = step(st, d); if(r.paths.every(function(p){ return !p || p.path.length < 2; })){ if(th.bump) th.bump(acts[0], d); return; } busy = true; A.move();
    var N = Math.max.apply(null, r.paths.map(function(p){ return p ? p.path.length - 1 : 0; })), ms = 90 * N + 140;
    if(th.tilt){ var g = B.g; S.tween(ms, function(e){ var s = Math.sin(e * Math.PI) * 0.06; g.rotation.z = -d[0] * s; g.rotation.x = d[1] * s; }); }
    S.tween(ms, function(e){ r.paths.forEach(function(p, i){ if(!p) return; var L = p.path.length - 1, f = Math.min(L, e * N); if(L < 1) return; var k = Math.min(L - 1, Math.floor(f)), t = f - k;
        acts[i].position.lerpVectors(B.pos(p.path[k][0], p.path[k][1], th.ay), B.pos(p.path[k + 1][0], p.path[k + 1][1], th.ay), Math.min(1, t)); if(th.roll) th.roll(acts[i], d, f);
        for(var q = 0; q <= Math.floor(f); q++){ var ck = key(p.path[q]); if(coinMesh[ck] && coinMesh[ck].visible){ coinMesh[ck].visible = false; } } }); }, function(){
      if(r.trap){ var who = acts.filter(function(a, i){ return r.paths[i]; }); S.tween(400, function(e){ who.forEach(function(a){ a.position.y = th.ay - e * 1.2; }); }, function(){ A.say(A.L("Jatuh! Mula semula.", "Fell in! Back to the start.")); reset(); }); return; }
      st = {a:r.a, f:r.f, c:r.c}; var sunk = r.paths.map(function(p, i){ return p && p.gone ? acts[i] : null; }).filter(Boolean);
      if(sunk.length) S.tween(450, function(e){ sunk.forEach(function(a){ a.position.y = th.ay - e * (th.sink || 0.5); a.scale.setScalar(1 - e * 0.3); }); }, function(){ sunk.forEach(function(a){ a.visible = false; }); busy = false; if(st.a.every(function(p){ return !p; })) A.win(); });
      else busy = false; }, "lin"); }
  var c = A.ctl('<div class="iqPad"><button class="iqB u" data-d="0,-1">▲</button><button class="iqB l" data-d="-1,0">◀</button><button class="iqB d" data-d="0,1">▼</button><button class="iqB r" data-d="1,0">▶</button></div>' +
    (starts.length > 1 ? '<span class="mut tiny" style="flex-basis:100%;text-align:center">' + A.L("Semua bergerak serentak; setiap lubang muat satu.", "They all move together; each hole takes one.") + '</span>' : '') + (coinsAll.length ? '<span class="mut tiny" style="flex-basis:100%;text-align:center">🪙 ' + A.L("Kutip semua syiling dahulu; lubang terbuka selepas itu.", "Collect every coin first; the hole opens after that.") + '</span>' : ''));
  c.querySelectorAll("[data-d]").forEach(function(b){ b.onclick = function(){ var d = b.getAttribute("data-d").split(",").map(Number); go(d); }; });
  var sx = 0, sy = 0, pd = function(e){ sx = e.clientX; sy = e.clientY; }; S.cv.addEventListener("pointerdown", pd); S.cl.push(function(){ S.cv.removeEventListener("pointerdown", pd); });
  S.onUp = function(e){ var dx = e.clientX - sx, dy = e.clientY - sy; if(Math.max(Math.abs(dx), Math.abs(dy)) > 40 && th.swipe) go(Math.abs(dx) > Math.abs(dy) ? [dx > 0 ? 1 : -1, 0] : [0, dy > 0 ? 1 : -1]); };
  S.drag = !th.swipe; S.orb.tEl = 1.15; S.size = Math.max(w, h) * cs + 1;
  var keyF = function(e){ var m = {ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0]}[e.key]; if(m && S.alive){ e.preventDefault(); go(m); } }; window.addEventListener("keydown", keyF); S.cl.push(function(){ window.removeEventListener("keydown", keyF); });
  return {par:par, hint:function(){ var b = bfs(st); return b ? A.L("Cuba arah ", "Try ") + {"1,0":"▶", "-1,0":"◀", "0,1":"▼", "0,-1":"▲"}[b.d.join(",")] + A.L(" · tinggal ", " · ") + b.n + A.L(" langkah", " moves left") : A.L("Tekan ⟲ untuk mula semula", "Press ⟲ to start again"); }}; };
window.IQView = {render:function(box, h){ H = h; list(box); }, open:function(box, h, id, lv){ H = h; css(); open(box, id, lv); }, stop:close, game:function(){ return G; }};
})();
