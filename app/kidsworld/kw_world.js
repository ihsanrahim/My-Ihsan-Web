/* My Ihsan 0.7.52 · Kids Planet: the world shell. A small round planet made of glossy balls with four areas (City, Desert, Forest, Garden),
   ten houses (each holds activities from kw_data.js), a Star Tower and a Parent Tower. The ball-kid roams; walking up to a building shows Visit.
   KW.render(host, H) builds the stage inside `host` and returns {stop}. Progress is saved per child in "ihsan_kw" (swapped with the child profile).
   Look: physical clearcoat materials, a generated studio reflection map, filmic tone mapping, soft shadows, instanced spheres. All geometry is spheres. */
(function(){
var K = window.KW = window.KW || {};
var T = window.THREE;
var R = 28, BALL = 0.95;
function V(x, y, z){ return new T.Vector3(x, y, z); }
function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function weekId(){ var d = new Date(), m = new Date(d.getFullYear(), d.getMonth(), d.getDate()); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return ymd(m); }
function mulberry(a){ return function(){ var t = a += 0x6D2B79F5; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function smooth(a, b, x){ var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

/* ---------- planet layout ---------- */
function sp(th, ph){ return V(Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)).normalize(); }
var BI = {city:{c:V(0, 0, 1), col:new T.Color(0xd9c08f), dot:"#12908a"}, desert:{c:sp(1.08, 0.35), col:new T.Color(0xefb455), dot:"#e0a82e"}, forest:{c:sp(1.08, 0.35 + 2.094), col:new T.Color(0x3f9f52), dot:"#4fa65c"}, garden:{c:sp(1.08, 0.35 + 4.189), col:new T.Color(0x8fd16d), dot:"#e8697d"}};
var BK = ["city", "desert", "forest", "garden"];
function tang(c){ var t1 = new T.Vector3().crossVectors(c, V(0, 1, 0)); if(t1.lengthSq() < 1e-4) t1.crossVectors(c, V(1, 0, 0)); t1.normalize(); var t2 = new T.Vector3().crossVectors(c, t1).normalize(); return [t1, t2]; }
function around(b, e, n){ var t = tang(BI[b].c); return BI[b].c.clone().addScaledVector(t[0], e).addScaledVector(t[1], n).normalize(); }
function weights(d){ var w = {}, s = 0; BK.forEach(function(k){ var a = d.angleTo(BI[k].c), v = Math.exp(-Math.pow(a / 0.62, 2) * 2.6); w[k] = v; s += v; }); BK.forEach(function(k){ w[k] /= s; }); return w; }

K.render = function(host, H){
  if(!T){ host.textContent = ""; return {stop:function(){}}; }
  if(K.cur && K.cur.stop){ try{ K.cur.stop(); }catch(e){} }
  function L(a, b){ return H.L2x(a, b); }
  function TT(s){ s = String(s == null ? "" : s); var i = s.indexOf("|"); return i < 0 ? s : L(s.slice(0, i), s.slice(i + 1)); }
  function E(s){ return H.esc(s == null ? "" : String(s)); }
  var lowfx = document.documentElement.classList.contains("lowfx"), PV = !!H.preview;   // 0.7.56: PV = the moving clip on the Kids mode banner (no HUD, no input, the camera circles)
  // ----- progress state (per child)
  var st = H.load("ihsan_kw", {}) || {}; st.done = st.done || {}; st.stars = st.stars || 0; st.v = st.v || {}; st.log = st.log || []; st.p = st.p || {}; st.day = st.day && st.day.d === ymd() ? st.day : {d:ymd(), secs:0, ext:0, bedOk:0};
  function save(){ H.save("ihsan_kw", st); }
  var HOUSES = K.HOUSES.filter(function(h){ return true; });
  var BUILDINGS = HOUSES.concat([K.TOWER, K.PARENT]);
  BUILDINGS.forEach(function(h){ h.dir = around(h.biome, h.e, h.n); });
  var HIDE1 = {n_times:1, n_money:1, s_geo:1, l_peri:1, g_pat:1, v_cook:1, h_tree:1};   // age 4-6 hides the harder ones
  function visible(a){ var age = st.p.age || 2; return !(age === 1 && HIDE1[a.id]); }
  function liveActs(h){ return h.acts.filter(function(a){ return a.t !== "soon" && visible(a); }); }
  function doneCount(h){ return liveActs(h).filter(function(a){ return st.done[a.id]; }).length; }
  function lvOf(h){ var n = liveActs(h).length, d = doneCount(h); if(!n) return 0; var r = d / n; return r >= 1 ? 3 : r >= 2 / 3 ? 2 : r >= 1 / 3 ? 1 : 0; }
  function addStars(n){ var was = Math.floor(st.stars / 15); st.stars += n; var now = Math.floor(st.stars / 15); if(now > was) H.toast(L("Naik tahap! Tahap ", "Level up! Level ") + (1 + now) + " 🎉"); hud(); }
  function award(a){ var d = st.done[a.id], today = ymd(), gain = 0; if(!d){ st.done[a.id] = {n:1, first:Date.now(), last:today}; gain = 3; } else if(d.last !== today){ d.n++; d.last = today; gain = 1; } if(gain){ st.log.unshift([Date.now(), a.id, weekId(), a.house]); if(st.log.length > 200) st.log.length = 200; addStars(gain); } save(); return gain; }
  function weekCount(kind){ var w = weekId(), n = 0, seen = {}; (st.log || []).forEach(function(e){ if(e[2] !== w) return; if(kind === "acts") n++; else if(kind === "houses"){ if(!seen[e[3]]){ seen[e[3]] = 1; n++; } } else if(kind === "doa"){ if(e[1] === "m_doa" || e[1] === "m_sleep"){ if(!seen[e[0] - e[0] % 864e5]){ seen[e[0] - e[0] % 864e5] = 1; n++; } } } }); return n; }

  // ----- stage DOM
  host.textContent = ""; var stage = el("div", "kwStage"); host.appendChild(stage);
  stage.innerHTML = '<div class="kwHud"><div class="kwR1"><span class="kwHudChip" id="kwLv">Lv 1</span><div class="kwXp"><i id="kwXp"></i></div><span class="kwHudChip" id="kwSt">⭐ 0</span></div><div class="kwBiomes" id="kwBm"></div></div>' +
    '<div class="kwNear" id="kwNear" hidden></div><div class="kwPad" id="kwPad" role="application" aria-label="' + L("Pad berjalan", "Walking pad") + '"><i id="kwKnob"></i></div>' +
    '<div class="kwSb"><div class="kwTpL" id="kwTpL" hidden></div><button class="kwBtn alt kwRound" id="kwTp" type="button" title="' + L("Teleport", "Teleport") + '" aria-label="' + L("Teleport ke rumah", "Teleport to a house") + '">✨</button>' + (PV ? '' : '<div class="kwTpL" id="kwAvL" hidden></div><button class="kwBtn alt kwRound" id="kwAv" type="button" title="' + L("Siapa berjalan", "Who walks") + '" aria-label="' + L("Pilih pet yang berjalan", "Choose who walks") + '">🐾</button>') + '<button class="kwBtn alt kwRound" id="kwOver" type="button" title="' + L("Seluruh planet", "Whole planet") + '" aria-label="' + L("Seluruh planet", "Whole planet") + '">🌍</button><button class="kwBtn" id="kwVisit" type="button" hidden>' + L("Lawat", "Visit") + '</button></div>' +
    '<div class="kwOrbH" id="kwOrbH" hidden>' + L("Seret untuk pusing · cubit untuk zum · dua jari untuk alih", "Drag to turn · pinch to zoom · two fingers to move") + '</div><div id="kwPop"></div><div id="kwOv" class="kwOv" hidden></div>';
  if(PV) stage.classList.add("kwPv");
  function $(id){ return stage.querySelector("#" + id); }
  var hh = host.getBoundingClientRect(), nav = document.getElementById("nav"), navH = nav ? nav.offsetHeight : 60; var baseH = Math.max(380, window.innerHeight - Math.max(0, hh.top) - navH - 8), hf = Math.max(0.45, Math.min(1.15, +H.load("ihsan_kwh", 0.9) || 0.9));
  stage.style.height = PV ? "100%" : Math.round(baseH * hf) + "px";   // 0.7.60 (owner): 10% lower by default, and the notch below resizes it
  if(!PV){ var grip = el("div", "kwGrip"); grip.setAttribute("role", "slider"); grip.setAttribute("aria-label", L("Saiz planet", "Planet size")); grip.innerHTML = "<i></i>"; host.appendChild(grip); var gy = null, gh = 0;
    grip.addEventListener("pointerdown", function(e){ e.preventDefault(); gy = e.clientY; gh = stage.offsetHeight; try{ grip.setPointerCapture(e.pointerId); }catch(x){} grip.classList.add("on"); });
    grip.addEventListener("pointermove", function(e){ if(gy == null) return; var h2 = Math.max(baseH * 0.45, Math.min(baseH * 1.15, gh + e.clientY - gy)); stage.style.height = Math.round(h2) + "px"; });
    var gEnd = function(){ if(gy == null) return; gy = null; grip.classList.remove("on"); H.save("ihsan_kwh", Math.round(stage.offsetHeight / baseH * 100) / 100); }; grip.addEventListener("pointerup", gEnd); grip.addEventListener("pointercancel", gEnd); }
  var renderer;
  try{ renderer = new T.WebGLRenderer({antialias:!lowfx, alpha:true, powerPreference:"high-performance"}); }catch(e){ stage.appendChild(el("div", "kwFail", L("Planet memerlukan WebGL. Guna paparan ringkas.", "The planet needs WebGL. Use the simple view."))); if(H.noGL) H.noGL(); return {stop:function(){}}; }
  renderer.domElement.setAttribute("data-ib3d", "off"); renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92; renderer.shadowMap.enabled = !lowfx; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowfx || PV ? 1 : 1.6)); stage.insertBefore(renderer.domElement, stage.firstChild);
  var scene = new T.Scene(), camera = new T.PerspectiveCamera(44, 1, 0.1, 280);
  var hemi = new T.HemisphereLight(0xf2f8ff, 0xb9a97f, 1.45), sun = new T.DirectionalLight(0xfff0d6, 2.8), fill = new T.DirectionalLight(0xcfe3ff, 0.7);
  if(!lowfx){ sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.08; sun.shadow.radius = 3; var sc = sun.shadow.camera; sc.left = -36; sc.right = 36; sc.top = 36; sc.bottom = -36; sc.near = 1; sc.far = 150; }
  scene.add(hemi, sun, sun.target, fill);
  (function(){ var env = new T.Scene(), shell = new T.Mesh(new T.SphereGeometry(45, 24, 12), new T.MeshBasicMaterial({color:0xdbe8f4, side:T.BackSide})); env.add(shell);
    [[-13, 19, 10, 13, 18, 5, 0xffffff], [18, 9, -12, 10, 15, 3, 0xdbeaff], [3, -12, 14, 15, 8, 2, 0xffe6c8]].forEach(function(c){ var m = new T.Mesh(new T.PlaneGeometry(c[3], c[4]), new T.MeshBasicMaterial({color:new T.Color(c[6]).multiplyScalar(c[5]), side:T.DoubleSide})); m.position.set(c[0], c[1], c[2]); m.lookAt(0, 0, 0); env.add(m); });
    var g = new T.PMREMGenerator(renderer); scene.environment = g.fromScene(env, 0.04, 0.1, 100).texture; g.dispose(); })();
  function PM(o){ return new T.MeshPhysicalMaterial(o); }
  var M = {matte:PM({color:0xffffff, roughness:0.55, clearcoat:0.28, clearcoatRoughness:0.3, envMapIntensity:0.5}), glossy:PM({color:0xffffff, roughness:0.27, clearcoat:0.85, clearcoatRoughness:0.18, envMapIntensity:0.75}),
    gold:PM({color:0xffffff, roughness:0.22, metalness:0.35, clearcoat:1, clearcoatRoughness:0.1, envMapIntensity:1.0}), water:PM({color:0xffffff, roughness:0.12, metalness:0.04, clearcoat:1, envMapIntensity:1.1}), glow:PM({color:0xffffff, roughness:0.2, clearcoat:1, emissive:0xffd27a, emissiveIntensity:0.9})};
  var GEO = {lo:new T.SphereGeometry(1, 12, 8), mid:new T.SphereGeometry(1, lowfx ? 14 : 20, lowfx ? 10 : 14), hi:new T.SphereGeometry(1, lowfx ? 24 : 40, lowfx ? 16 : 28), half:new T.SphereGeometry(1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2)};
  var UP = V(0, 1, 0), batch = {}, tmpM = new T.Matrix4(), IQ = new T.Quaternion();
  function add(f, mat, geo, color, x, y, z, sx, sy, sz){ var key = mat + "|" + geo, b = batch[key] || (batch[key] = {mat:mat, geo:geo, m:[], c:[]}); tmpM.compose(V(x, y, z), IQ, V(sx, sy == null ? sx : sy, sz == null ? sx : sz)); b.m.push(f.clone().multiply(tmpM)); b.c.push(new T.Color(color)); }
  function rawH(d, w){ return w.desert * (0.8 * Math.sin(d.x * 13 + d.y * 5) * Math.cos(d.z * 11) + 0.3 * Math.sin(d.x * 27 + d.z * 9)) + w.forest * 0.35 * Math.sin(d.y * 9 + d.x * 3) * Math.cos(d.x * 8) + w.garden * 0.18 * Math.sin(d.z * 10) * Math.cos(d.y * 9) + w.city * 0.05 * Math.sin(d.x * 12); }
  function siteMask(d){ var m = 0; for(var i = 0; i < BUILDINGS.length; i++){ var a = d.angleTo(BUILDINGS[i].dir) * R; m = Math.max(m, 1 - smooth(4.5, 11, a)); } return m; }
  function terrainH(d){ return rawH(d, weights(d)) * (1 - siteMask(d)); }
  function frameAt(dir, spin, sink){ var p = dir.clone().multiplyScalar(R + terrainH(dir) - (sink == null ? 0.05 : sink)), q = new T.Quaternion().setFromUnitVectors(UP, dir); q.multiply(new T.Quaternion().setFromAxisAngle(UP, spin || 0)); return new T.Matrix4().compose(p, q, V(1, 1, 1)); }
  // planet
  var seg = lowfx ? [72, 50] : [120, 84], pg = new T.SphereGeometry(R, seg[0], seg[1]), pp = pg.attributes.position, col = new Float32Array(pp.count * 3), dv = V(0, 0, 0), cc = new T.Color(), plaza = new T.Color(0xfff3d6), tile = new T.Color(0x9fd8cc);
  for(var i = 0; i < pp.count; i++){ dv.set(pp.getX(i), pp.getY(i), pp.getZ(i)).normalize(); var w = weights(dv), mask = siteMask(dv), h = rawH(dv, w) * (1 - mask); pp.setXYZ(i, dv.x * (R + h), dv.y * (R + h), dv.z * (R + h)); cc.setRGB(0, 0, 0); BK.forEach(function(k){ cc.r += BI[k].col.r * w[k]; cc.g += BI[k].col.g * w[k]; cc.b += BI[k].col.b * w[k]; });
    var nz = Math.sin(dv.x * 40 + dv.y * 31) * Math.cos(dv.z * 37 - dv.x * 11); cc.multiplyScalar(1 + nz * 0.035 + h * 0.04); cc.lerp(w.city > 0.45 ? plaza : (w.garden > 0.45 ? tile : cc), mask * 0.3 * Math.max(w.city, w.garden)); col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b; }
  pg.setAttribute("color", new T.BufferAttribute(col, 3)); pg.computeVertexNormals();
  var planet = new T.Mesh(pg, PM({vertexColors:true, roughness:0.78, clearcoat:0.08, envMapIntensity:0.35})); planet.receiveShadow = true; scene.add(planet);

  // ----- house builders (spheres only). Local frame: y up, +z is the front door.
  var CREAM = 0xfff1da, TEAL = 0x12908a, GOLD = 0xf2b632;
  var BUILD = {
   masjid:function(f){ add(f, "glossy", "mid", CREAM, 0, 1.6, 0, 2.5, 1.5, 2.2); add(f, "gold", "half", TEAL, 0, 2.2, 0, 1.9, 1.9, 1.9); add(f, "gold", "mid", GOLD, 0, 4.15, 0, 0.22); add(f, "gold", "mid", GOLD, 0, 4.45, 0, 0.12);
     [-3, 3].forEach(function(x){ add(f, "glossy", "mid", CREAM, x, 1.1, 0, 0.75, 1.1, 0.75); add(f, "glossy", "mid", CREAM, x, 2.5, 0, 0.62, 0.95, 0.62); add(f, "glossy", "mid", CREAM, x, 3.6, 0, 0.52, 0.8, 0.52); add(f, "gold", "half", TEAL, x, 4.1, 0, 0.62, 0.9, 0.62); add(f, "gold", "mid", GOLD, x, 4.95, 0, 0.2); });
     add(f, "matte", "mid", 0x0d6d68, 0, 0.9, 2.05, 0.7, 1.05, 0.28); [-1.3, 1.3].forEach(function(x){ add(f, "glow", "lo", 0xffe3a0, x, 1.7, 1.95, 0.3, 0.5, 0.15); }); add(f, "matte", "mid", 0xe9dcc2, 0, 0.1, 3.3, 2.2, 0.12, 1.6); },
   letter:function(f){ add(f, "glossy", "mid", 0xe6dcff, 0, 1.5, 0, 2.4, 1.45, 2.0); add(f, "glossy", "half", 0x9775fa, 0, 2.2, 0, 2.2, 1.0, 1.9); add(f, "gold", "mid", GOLD, 0, 3.3, 0, 0.22);
     [-1.2, 0, 1.2].forEach(function(x){ add(f, "glow", "lo", 0xffe3a0, x, 1.7, 1.85, 0.34, 0.6, 0.15); }); add(f, "matte", "mid", 0x6741d9, 0, 0.85, 1.9, 0.6, 0.95, 0.25); [0, 1, 2].forEach(function(i){ add(f, "glossy", "mid", [0xff8787, 0xffd43b, 0x74c0fc][i], 2.8, 0.35 + i * 0.5, 1.4, 0.5, 0.22, 0.4); }); },
   number:function(f){ add(f, "glossy", "mid", 0xffe0b3, 0, 1.5, 0, 2.4, 1.4, 2.0); add(f, "glossy", "half", 0xf08c00, 0, 2.1, 0, 2.1, 0.85, 1.9); for(var i = 0; i < 5; i++){ add(f, "glossy", "mid", i % 2 ? 0xffffff : 0xe03131, -2 + i * 1.0, 2.1, 2.15, 0.62, 0.3, 1.0); } add(f, "matte", "mid", 0x8a5a2b, 0, 0.7, 2.0, 1.7, 0.55, 0.45);
     [-0.6, 0, 0.6].forEach(function(x, k){ add(f, "gold", "mid", GOLD, x, 1.45 + k * 0.12, 2.05, 0.26, 0.1, 0.26); }); add(f, "gold", "mid", GOLD, 0, 3.0, 0, 0.3); },
   obs:function(f){ add(f, "glossy", "mid", 0xd9e0ff, 0, 1.4, 0, 2.3, 1.3, 2.3); add(f, "gold", "half", 0x5c7cfa, 0, 2.1, 0, 1.9, 1.9, 1.9); add(f, "gold", "mid", GOLD, 0, 4.1, 0, 0.2); [[0.9, 3.0, 0.9, 0.5], [1.6, 3.5, 1.5, 0.42], [2.3, 4.0, 2.1, 0.34]].forEach(function(p){ add(f, "glossy", "mid", 0xffffff, p[0], p[1], p[2], p[3]); });
     [[-2.6, 4.8, 0], [2.6, 5.4, -1], [-1, 6.2, 1.5]].forEach(function(p){ add(f, "glow", "lo", 0xffe08a, p[0], p[1], p[2], 0.26); }); add(f, "matte", "mid", 0x364fc7, 0, 0.8, 2.1, 0.65, 1.0, 0.28); },
   tent:function(f){ var cs = [0xe8697d, 0xffffff, 0xe8697d, 0xffffff]; [[2.6, 0.9, 0.7], [2.1, 2.0, 0.7], [1.5, 3.0, 0.65], [0.9, 3.8, 0.6]].forEach(function(p, i){ add(f, "glossy", "mid", cs[i], 0, p[1], 0, p[0], p[2], p[0]); }); add(f, "gold", "mid", GOLD, 0, 4.55, 0, 0.28); add(f, "gold", "mid", GOLD, 0, 4.95, 0, 0.14);
     add(f, "matte", "mid", 0x7a1f35, 0, 0.85, 2.0, 0.8, 1.1, 0.4); add(f, "matte", "mid", 0x12908a, 0, 0.08, 3.5, 1.6, 0.08, 1.5); add(f, "matte", "mid", GOLD, 0, 0.14, 3.5, 0.9, 0.05, 0.8); [[-2.4, 0.5, 1.8], [2.4, 0.5, 1.8]].forEach(function(p){ add(f, "glossy", "mid", 0xf7a8b8, p[0], p[1], p[2], 0.55, 0.5, 0.55); }); },
   tree:function(f){ [[1.0, 1.0, 1.7], [0.9, 2.9, 1.6], [0.8, 4.4, 1.5]].forEach(function(p){ add(f, "matte", "mid", 0x8b5a2b, 0, p[1], 0, p[0], p[2], p[0]); }); add(f, "matte", "mid", 0x2f9e44, 0, 6.6, 0, 3.6, 2.6, 3.6); add(f, "matte", "mid", 0x51cf66, -2.4, 5.9, 0.8, 2.0); add(f, "matte", "mid", 0x69db7c, 2.4, 6.0, -0.6, 2.1); add(f, "matte", "mid", 0x40c057, 0.6, 8.1, 0.3, 2.0);
     add(f, "glossy", "mid", 0xffa94d, 0, 4.7, 2.0, 1.3, 1.0, 1.1); add(f, "glossy", "half", 0xe03131, 0, 5.3, 2.0, 1.45, 0.8, 1.25); add(f, "matte", "mid", 0x6b3f1d, 0, 4.5, 3.05, 0.42, 0.7, 0.2); for(var k = 0; k < 4; k++){ add(f, "matte", "mid", 0xb78a54, 0, 0.7 + k * 0.8, 2.5 + k * 0.15, 0.28, 0.18, 0.28); } add(f, "glow", "lo", 0xffe3a0, -0.9, 4.8, 2.95, 0.2, 0.3, 0.1); },
   sports:function(f){ add(f, "matte", "mid", 0x69db7c, 0, 0.1, 0, 3.6, 0.1, 3.0); add(f, "matte", "mid", 0xffffff, 0, 0.2, 0, 0.6, 0.04, 0.6); [-2.2, 2.2].forEach(function(x){ [0.5, 1.3, 2.1].forEach(function(y){ add(f, "glossy", "mid", 0xffffff, x, y, -0.6, 0.3); }); }); [-1.6, -0.8, 0, 0.8, 1.6].forEach(function(x){ add(f, "glossy", "mid", 0xffffff, x, 2.3, -0.6, 0.28); });
     add(f, "glossy", "mid", 0xf08c00, 1.0, 0.6, 1.2, 0.6); add(f, "glossy", "mid", 0x4dabf7, -1.0, 0.45, 1.0, 0.45); add(f, "glossy", "mid", 0xe03131, 0.2, 0.35, 1.8, 0.35); add(f, "matte", "mid", 0x8b5a2b, 2.7, 0.5, 1.6, 0.9, 0.35, 0.4); add(f, "glossy", "half", 0x4dabf7, 0, 3.1, -3.0, 1.2, 0.8, 1.2); },
   studio:function(f){ add(f, "glossy", "mid", 0xffd6e3, 0, 1.45, 0, 2.4, 1.4, 2.1); add(f, "glossy", "half", 0xf783ac, 0, 2.05, 0, 2.2, 0.9, 1.95); [0xff6b6b, 0xffd43b, 0x4dabf7, 0x51cf66, 0x9775fa].forEach(function(c, i){ var a = -0.8 + i * 0.4; add(f, "glossy", "lo", c, Math.sin(a) * 1.4, 2.85 + Math.cos(a) * 0.35, 0.5, 0.3); });
     add(f, "matte", "mid", 0x8a5a2b, 2.9, 0.9, 1.2, 0.12, 1.0, 0.12); add(f, "matte", "mid", 0x8a5a2b, 3.3, 0.9, 1.5, 0.12, 1.0, 0.12); add(f, "glossy", "mid", 0xffffff, 3.1, 1.7, 1.35, 0.55, 0.45, 0.1); add(f, "matte", "mid", 0x7a4a21, 0, 0.85, 2.0, 0.62, 0.95, 0.26); add(f, "glow", "lo", 0xffe3a0, 1.4, 1.7, 1.85, 0.34, 0.5, 0.15); },
   pav:function(f){ add(f, "matte", "mid", 0xfff1da, 0, 0.12, 0, 3.0, 0.14, 3.0); [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(function(p){ [0.55, 1.35, 2.15].forEach(function(y, k){ add(f, "glossy", "mid", CREAM, p[0], y, p[1], 0.52 - k * 0.06, 0.5, 0.52 - k * 0.06); }); add(f, "gold", "mid", GOLD, p[0], 2.75, p[1], 0.3); });
     add(f, "gold", "half", 0x20c997, 0, 2.85, 0, 3.1, 1.7, 3.1); add(f, "gold", "mid", GOLD, 0, 4.7, 0, 0.24); add(f, "matte", "mid", 0xffb8c9, 0, 0.35, 0, 0.9, 0.35, 0.9); add(f, "matte", "mid", 0xffd8a8, 1.1, 0.35, 0.5, 0.5, 0.35, 0.5); },
   home:function(f){ add(f, "glossy", "mid", 0xffd8a8, 0, 1.5, 0, 2.3, 1.4, 2.0); add(f, "glossy", "half", 0xc92a2a, 0, 2.2, 0, 2.2, 1.0, 1.9); add(f, "matte", "mid", 0x8a5a2b, 1.2, 3.3, -0.4, 0.45, 0.9, 0.45); add(f, "matte", "mid", 0xffffff, 1.2, 4.3, -0.4, 0.45); add(f, "matte", "mid", 0xffffff, 1.5, 4.9, -0.4, 0.32);
     add(f, "matte", "mid", 0x7a4a21, 0, 0.85, 1.95, 0.62, 0.95, 0.26); [-1.2, 1.2].forEach(function(x){ add(f, "glow", "lo", 0xffe3a0, x, 1.7, 1.85, 0.34, 0.5, 0.15); }); for(var k = -3; k <= 3; k++){ add(f, "glossy", "mid", 0xffffff, k * 0.7, 0.4, 3.3, 0.22, 0.4, 0.22); } },
   // 0.7.68 (owner): 13 more buildings (ideas 91-190)
   lib:function(f){ add(f, "glossy", "mid", 0xfff1da, 0, 1.5, 0, 2.5, 1.5, 2.1); add(f, "glossy", "half", 0x8a5a2b, 0, 2.3, 0, 2.3, 1.1, 2.0); [[-0.9, 0xe03131], [-0.3, 0x1c7ed6], [0.3, 0x2f9e44], [0.9, 0xf08c00]].forEach(function(b){ add(f, "glossy", "mid", b[1], b[0], 3.75, 0, 0.26, 0.75, 0.6); });
     add(f, "matte", "mid", 0x6b3f1d, 0, 0.85, 2.0, 0.66, 1.0, 0.26); [-1.4, 1.4].forEach(function(x){ add(f, "glow", "lo", 0xffe3a0, x, 1.7, 1.9, 0.34, 0.55, 0.15); }); [[-2.8, 0x9775fa], [2.8, 0x12908a]].forEach(function(b){ for(var k = 0; k < 4; k++) add(f, "glossy", "mid", k % 2 ? 0xffffff : b[1], b[0], 0.25 + k * 0.42, 1.4, 0.75, 0.2, 0.55); }); add(f, "gold", "mid", GOLD, 0, 4.7, 0, 0.22); },
   fire:function(f){ add(f, "glossy", "mid", 0xe03131, 0, 1.45, 0, 2.5, 1.45, 2.0); add(f, "glossy", "mid", 0xffffff, 0, 1.55, 0.02, 2.55, 0.18, 2.05); add(f, "glossy", "half", 0xa61e1e, 0, 2.2, 0, 2.3, 0.8, 1.9); add(f, "glossy", "mid", 0xe03131, -1.6, 3.4, -0.4, 0.6, 1.6, 0.6); add(f, "glow", "mid", 0x74c0fc, -1.6, 5.2, -0.4, 0.4);
     add(f, "matte", "mid", 0x495057, 0.6, 0.9, 2.0, 1.2, 1.0, 0.25); [-0.2, 0.2, 0.6, 1.0, 1.4].forEach(function(x){ add(f, "matte", "mid", 0xadb5bd, x, 0.9, 2.15, 0.06, 0.85, 0.06); });
     add(f, "glossy", "mid", 0xe03131, 0, 0.75, 4.0, 1.6, 0.6, 0.8); add(f, "glossy", "mid", 0xffffff, 1.0, 1.2, 4.0, 0.5, 0.4, 0.6); [-1.0, 1.0].forEach(function(x){ [3.4, 4.6].forEach(function(z){ add(f, "matte", "mid", 0x212529, x, 0.3, z, 0.32); }); }); for(var k = 0; k < 5; k++) add(f, "matte", "mid", 0xdee2e6, -1.2 + k * 0.5, 1.45, 4.0, 0.12); },
   pasar:function(f){ [[-2.3, 0xe8697d], [0, 0xfab005], [2.3, 0x12908a]].forEach(function(st, i){ var x = st[0]; add(f, "glossy", "half", st[1], x, 2.3, 0, 1.15, 0.55, 1.15); add(f, "glossy", "mid", 0xffffff, x, 2.3, 0, 1.18, 0.08, 1.18); [-0.8, 0.8].forEach(function(z){ add(f, "matte", "mid", 0x8a5a2b, x - 0.85, 1.2, z, 0.1, 1.15, 0.1); add(f, "matte", "mid", 0x8a5a2b, x + 0.85, 1.2, z, 0.1, 1.15, 0.1); });
       add(f, "matte", "mid", 0xc49a6c, x, 1.0, 0, 1.0, 0.15, 0.9); var fr = [[0xff6b6b, 0xffd43b, 0x51cf66], [0x8b5a2b, 0x2f9e44, 0xf08c00], [0x9775fa, 0xe03131, 0xfab005]][i]; fr.forEach(function(c, k){ add(f, "glossy", "mid", c, x - 0.45 + k * 0.45, 1.3, 0.2 - (k % 2) * 0.35, 0.24); }); }); add(f, "matte", "mid", 0xe9dcc2, 0, 0.08, 0.4, 3.8, 0.08, 1.8); },
   clinic:function(f){ add(f, "glossy", "mid", 0xffffff, 0, 1.5, 0, 2.4, 1.5, 2.0); add(f, "glossy", "half", 0x63e6be, 0, 2.3, 0, 2.2, 0.9, 1.9);
     for(var k = 0; k < 9; k++){ var a = 0.6 + k / 8 * 4.0; add(f, "glossy", "mid", 0xe03131, Math.cos(a) * 0.55, 2.2 + Math.sin(a) * 0.55, 1.95, 0.16); } add(f, "glossy", "mid", 0xffffff, 0.22, 2.32, 2.02, 0.42, 0.46, 0.1);
     add(f, "matte", "mid", 0x96f2d7, 0, 0.85, 2.0, 0.66, 1.0, 0.26); [-1.4, 1.4].forEach(function(x){ add(f, "glow", "lo", 0xe6fcf5, x, 1.3, 1.9, 0.34, 0.5, 0.15); }); add(f, "matte", "mid", 0xdee2e6, 0, 0.1, 3.2, 1.4, 0.08, 1.0); },
   oasis:function(f){ add(f, "glossy", "mid", 0x4dabf7, 0, 0.12, 1.2, 2.6, 0.12, 1.8); add(f, "glossy", "mid", 0xa5d8ff, 0.4, 0.2, 1.0, 1.3, 0.06, 0.8); for(var k = 0; k < 14; k++){ var a = k / 14 * 6.283; add(f, "matte", "mid", 0xd9c08f, Math.cos(a) * 2.7, 0.2, 1.2 + Math.sin(a) * 1.9, 0.4, 0.28, 0.4); }
     [[-2.4, -1.2], [2.2, -1.6], [0.3, -2.4]].forEach(function(p, j){ for(var k = 0; k < 6; k++) add(f, "matte", "mid", 0x8b5a2b, p[0] + k * 0.08, 0.4 + k * 0.75, p[1], 0.28, 0.45, 0.28); for(var m = 0; m < 6; m++){ var a = m / 6 * 6.283 + j; add(f, "glossy", "mid", 0x2f9e44, p[0] + 0.48 + Math.cos(a) * 1.0, 4.65, p[1] + Math.sin(a) * 1.0, 1.0, 0.22, 0.38); } add(f, "glossy", "mid", 0x8b5a2b, p[0] + 0.5, 4.3, p[1] + 0.3, 0.22); add(f, "glossy", "mid", 0x8b5a2b, p[0] + 0.3, 4.2, p[1] - 0.2, 0.2); });
     for(var k = 0; k < 10; k++){ var a = k / 10 * 6.283; add(f, "matte", "mid", 0xadb5bd, -2.8 + Math.cos(a) * 0.75, 0.55, 3.5 + Math.sin(a) * 0.75, 0.3); } add(f, "matte", "mid", 0x8b5a2b, -2.8, 1.8, 3.5, 0.1, 1.2, 0.1); add(f, "matte", "half", 0xc92a2a, -2.8, 2.8, 3.5, 1.0, 0.5, 1.0); },
   caravan:function(f){ var cs = [0xf08c00, 0xffe8cc]; [[2.4, 0.9], [1.9, 1.9], [1.2, 2.8]].forEach(function(p, i){ add(f, "glossy", "mid", cs[i % 2], 0, p[1], -0.6, p[0], 0.7, p[0] * 0.9); }); add(f, "gold", "mid", GOLD, 0, 3.6, -0.6, 0.2); add(f, "matte", "mid", 0x7a3a00, 0, 0.8, 1.4, 0.7, 0.9, 0.3);
     [[-2.4, 2.4, 0.4], [2.6, 2.0, -0.4]].forEach(function(c){ var x = c[0], z = c[1], r = c[2]; add(f, "matte", "mid", 0xd4a373, x, 1.6, z, 0.9, 0.6, 0.55); add(f, "matte", "mid", 0xc08552, x, 2.25, z, 0.45, 0.45, 0.4); add(f, "matte", "mid", 0xd4a373, x + 0.95, 2.1, z, 0.22, 0.65, 0.22); add(f, "matte", "mid", 0xd4a373, x + 1.25, 2.75, z, 0.36, 0.24, 0.24);
       [[-0.5, -0.3], [-0.5, 0.3], [0.5, -0.3], [0.5, 0.3]].forEach(function(l){ add(f, "matte", "mid", 0xc08552, x + l[0], 0.6, z + l[1], 0.13, 0.65, 0.13); }); add(f, "glossy", "mid", 0xe03131, x, 2.15, z, 0.55, 0.12, 0.6); });
     [[-1.6, -2.4], [-1.0, -2.6], [-1.3, -2.0]].forEach(function(p, k){ add(f, "matte", "mid", 0xa0522d, p[0] + 3.0, 0.45 + (k === 2 ? 0.7 : 0), p[1] + 4.2, 0.5, 0.4, 0.5); }); },
   fossil:function(f){ add(f, "matte", "mid", 0xe0b46a, 0, 0.3, 0.3, 3.4, 0.6, 2.6); add(f, "matte", "mid", 0xc9973f, 0, 0.5, 0.3, 2.2, 0.45, 1.6); [[-1.2, 0], [-0.4, 0.2], [0.4, 0.1], [1.2, -0.1]].forEach(function(p){ add(f, "glossy", "mid", 0xfff9db, p[0], 0.95, p[1], 0.18, 0.12, 0.9); }); add(f, "glossy", "mid", 0xfff9db, 0, 0.95, 0.05, 1.7, 0.14, 0.14); add(f, "glossy", "mid", 0xfff9db, 1.95, 1.0, 0, 0.5, 0.35, 0.35);
     [[-3.2, -2.2], [3.2, -2.2], [3.2, 2.8], [-3.2, 2.8]].forEach(function(p){ add(f, "matte", "mid", 0x8b5a2b, p[0], 0.9, p[1], 0.12, 0.9, 0.12); add(f, "gold", "mid", GOLD, p[0], 1.85, p[1], 0.16); }); [[-3.2, -2.2, 3.2, -2.2], [3.2, -2.2, 3.2, 2.8], [3.2, 2.8, -3.2, 2.8], [-3.2, 2.8, -3.2, -2.2]].forEach(function(r){ for(var k = 1; k < 8; k++){ var t = k / 8; add(f, "matte", "lo", 0xfab005, r[0] + (r[2] - r[0]) * t, 1.5, r[1] + (r[3] - r[1]) * t, 0.08); } });
     add(f, "matte", "mid", 0x8b5a2b, -2.2, 0.9, -1.2, 0.08, 0.8, 0.08); add(f, "matte", "mid", 0xffd43b, -2.2, 1.85, -1.2, 0.22, 0.28, 0.22); add(f, "glossy", "mid", 0xadb5bd, 2.4, 0.6, 1.8, 0.5, 0.35, 0.4); },
   lab:function(f){ [[0.9, 0.9], [0.8, 2.6], [0.7, 4.0]].forEach(function(p){ add(f, "matte", "mid", 0x8b5a2b, 0, p[1], 0, p[0], 0.95, p[0]); }); add(f, "matte", "mid", 0xb78a54, 0, 4.8, 0, 2.6, 0.18, 2.4); add(f, "glossy", "mid", 0xe7f5ff, 0, 5.7, 0, 1.6, 0.9, 1.4); add(f, "glossy", "half", 0x74c0fc, 0, 6.3, 0, 1.5, 1.2, 1.3);
     [-1.6, 1.6].forEach(function(x){ add(f, "matte", "mid", 0x2f9e44, x * 1.3, 6.4, -1.0, 1.2, 1.0, 1.1); }); add(f, "glow", "mid", 0x8ce99a, 0.6, 5.9, 1.3, 0.25, 0.35, 0.25); add(f, "glow", "mid", 0xffa8a8, -0.6, 5.8, 1.3, 0.22, 0.3, 0.22); add(f, "glow", "lo", 0xffe3a0, 0, 7.6, 0, 0.18);
     for(var k = 0; k < 6; k++) add(f, "matte", "mid", 0xb78a54, 1.3, 0.5 + k * 0.75, 1.2 + k * 0.05, 0.4, 0.07, 0.15); add(f, "matte", "mid", 0x8b5a2b, 1.0, 2.5, 1.2, 0.06, 2.4, 0.06); add(f, "matte", "mid", 0x8b5a2b, 1.6, 2.5, 1.2, 0.06, 2.4, 0.06); },
   ranger:function(f){ for(var k = 0; k < 5; k++){ add(f, "matte", "mid", k % 2 ? 0x8b5a2b : 0x9c6644, 0, 0.35 + k * 0.55, 0, 2.6, 0.3, 1.9); } add(f, "glossy", "half", 0x2b8a3e, 0, 3.0, 0, 2.6, 1.3, 2.1); add(f, "matte", "mid", 0x6b3f1d, 0, 0.9, 1.9, 0.6, 0.95, 0.25); add(f, "glow", "lo", 0xffe3a0, -1.4, 1.7, 1.8, 0.32, 0.4, 0.15);
     add(f, "matte", "mid", 0x8b5a2b, 2.9, 2.4, -1.0, 0.12, 2.4, 0.12); add(f, "matte", "mid", 0x8b5a2b, 3.7, 2.4, -1.0, 0.12, 2.4, 0.12); add(f, "matte", "mid", 0xb78a54, 3.3, 4.8, -1.0, 0.8, 0.15, 0.8); add(f, "glossy", "half", 0x2b8a3e, 3.3, 5.0, -1.0, 0.9, 0.6, 0.9);
     add(f, "matte", "mid", 0xd9480f, -2.6, 1.2, 2.4, 0.55, 0.5, 0.45); add(f, "matte", "mid", 0xd9480f, -2.6, 1.85, 2.5, 0.38); add(f, "matte", "mid", 0x343a40, -2.45, 1.9, 2.85, 0.08); add(f, "matte", "mid", 0x343a40, -2.75, 1.9, 2.85, 0.08); },
   river:function(f){ for(var k = 0; k < 9; k++){ add(f, "glossy", "mid", k % 2 ? 0x4dabf7 : 0x339af0, -3.2 + k * 0.8, 0.1, 1.6 + Math.sin(k * 0.9) * 0.6, 0.8, 0.08, 0.9); }
     [[0, 0.8, 1.4], [-0.9, 1.6, 1.0], [0.9, 1.4, 1.1], [0, 2.6, 1.2], [-0.6, 3.5, 0.9], [0.6, 3.4, 0.95], [0, 4.4, 0.8]].forEach(function(r){ add(f, "matte", "mid", 0x868e96, r[0], r[1], -1.2, r[2], r[2] * 0.8, r[2]); }); for(var k = 0; k < 6; k++) add(f, "glossy", "mid", 0xe7f5ff, 0, 4.2 - k * 0.75, -0.25, 0.45, 0.5, 0.2); for(var k = 0; k < 5; k++) add(f, "glossy", "lo", 0xffffff, -0.8 + k * 0.4, 0.3, 0.4, 0.25);
     add(f, "glossy", "mid", 0xf08c00, 2.0, 0.35, 2.4, 0.9, 0.3, 0.4); add(f, "matte", "mid", 0x8b5a2b, 2.0, 1.0, 2.4, 0.05, 0.6, 0.05); add(f, "glossy", "mid", 0xffffff, 2.2, 1.0, 2.4, 0.3, 0.45, 0.05); add(f, "glossy", "mid", 0xfab005, -2.0, 0.25, 1.9, 0.3, 0.15, 0.15); },
   farm:function(f){ add(f, "glossy", "mid", 0xc92a2a, 0, 1.6, 0, 2.4, 1.6, 2.0); add(f, "glossy", "half", 0x862e2e, 0, 2.6, 0, 2.3, 1.2, 2.0); add(f, "glossy", "mid", 0xffffff, 0, 1.0, 2.0, 0.9, 1.0, 0.12); add(f, "matte", "mid", 0x7a1f1f, 0, 0.9, 2.05, 0.7, 0.85, 0.1);
     add(f, "matte", "mid", 0xfcc419, -3.0, 0.8, 0.8, 0.9, 0.8, 0.9); add(f, "matte", "mid", 0xfab005, -3.0, 1.6, 0.8, 0.6, 0.45, 0.6);
     add(f, "glossy", "mid", 0xffffff, 2.6, 1.3, 2.4, 0.9, 0.55, 0.5); [[2.3, 1.45, 2.85], [2.9, 1.2, 2.0]].forEach(function(p){ add(f, "matte", "mid", 0x212529, p[0], p[1], p[2], 0.22, 0.18, 0.1); }); add(f, "glossy", "mid", 0xffffff, 3.55, 1.6, 2.4, 0.38, 0.32, 0.3); add(f, "glossy", "mid", 0xffc9c9, 3.85, 1.5, 2.4, 0.16); [[-0.5, -0.25], [-0.5, 0.25], [0.5, -0.25], [0.5, 0.25]].forEach(function(l){ add(f, "matte", "mid", 0xffffff, 2.6 + l[0], 0.45, 2.4 + l[1], 0.12, 0.45, 0.12); });
     [[-1.6, 3.2], [-0.9, 3.6], [0.8, 3.3]].forEach(function(c){ add(f, "glossy", "mid", 0xffffff, c[0], 0.35, c[1], 0.3, 0.28, 0.25); add(f, "glossy", "mid", 0xffffff, c[0] + 0.25, 0.62, c[1], 0.17); add(f, "glossy", "mid", 0xe03131, c[0] + 0.25, 0.82, c[1], 0.08); add(f, "glossy", "mid", 0xfab005, c[0] + 0.42, 0.6, c[1], 0.07); }); },
   bee:function(f){ [[1.5, 0.6], [1.45, 1.3], [1.3, 1.95], [1.05, 2.55], [0.7, 3.05], [0.35, 3.4]].forEach(function(p){ add(f, "gold", "mid", 0xf2b632, 0, p[1], 0, p[0], 0.4, p[0]); }); add(f, "matte", "mid", 0x5c3b0b, 0, 0.5, 1.4, 0.4, 0.35, 0.2);
     for(var k = 0; k < 10; k++){ var a = k / 10 * 6.283, x = Math.cos(a) * 3.0, z = Math.sin(a) * 2.6 + 0.3, c = [0xff8787, 0xf783ac, 0xffd43b, 0xb197fc, 0xffffff][k % 5]; add(f, "matte", "mid", 0x2f9e44, x, 0.4, z, 0.06, 0.45, 0.06); for(var m = 0; m < 5; m++){ var b = m / 5 * 6.283; add(f, "glossy", "lo", c, x + Math.cos(b) * 0.2, 0.9, z + Math.sin(b) * 0.2, 0.15, 0.1, 0.15); } add(f, "glossy", "lo", 0xfab005, x, 0.92, z, 0.1); }
     [[1.2, 3.0, 1.3], [-1.4, 2.4, 1.0], [0.3, 4.1, -0.6]].forEach(function(b){ add(f, "glossy", "mid", 0xffd43b, b[0], b[1], b[2], 0.28, 0.22, 0.22); add(f, "matte", "mid", 0x212529, b[0] - 0.1, b[1], b[2], 0.1, 0.23, 0.23); add(f, "glow", "lo", 0xe7f5ff, b[0], b[1] + 0.25, b[2], 0.2, 0.08, 0.14); }); },
   post:function(f){ add(f, "glossy", "mid", 0x74c0fc, 0, 1.5, 0, 2.4, 1.5, 2.0); add(f, "glossy", "half", 0x1971c2, 0, 2.3, 0, 2.2, 1.0, 1.9); add(f, "glossy", "mid", 0xffffff, 0, 2.3, 1.95, 1.0, 0.65, 0.12); add(f, "glossy", "mid", 0xe64980, 0, 2.3, 2.05, 0.2); add(f, "matte", "mid", 0x1864ab, 0, 0.85, 2.0, 0.62, 0.95, 0.25);
     add(f, "glossy", "mid", 0xe03131, 2.9, 1.0, 1.8, 0.5, 1.0, 0.45); add(f, "glossy", "half", 0xe03131, 2.9, 1.95, 1.8, 0.5, 0.4, 0.45); add(f, "matte", "mid", 0x212529, 2.9, 1.5, 2.25, 0.3, 0.06, 0.05);
     [[-0.9, 4.1, 0.6], [0.6, 4.6, 0.2], [-0.2, 5.2, -0.3]].forEach(function(e){ add(f, "glossy", "mid", 0xfff9db, e[0], e[1], e[2], 0.45, 0.3, 0.06); add(f, "glossy", "lo", 0xe64980, e[0], e[1], e[2] + 0.05, 0.09); }); },
   tower:function(f){ [[1.9, 0.9, 0.9], [1.5, 2.2, 0.8], [1.1, 3.4, 0.7], [0.8, 4.4, 0.6]].forEach(function(p, i){ add(f, "gold", "mid", i % 2 ? 0xffe08a : 0xf2b632, 0, p[1], 0, p[0], p[2], p[0]); }); add(f, "glow", "mid", 0xffd166, 0, 5.5, 0, 0.7); for(var k = 0; k < 8; k++){ var a = k / 8 * 6.283; add(f, "glow", "lo", 0xffe9a8, Math.cos(a) * 1.3, 5.5 + Math.sin(k * 1.7) * 0.2, Math.sin(a) * 1.3, 0.18); } add(f, "matte", "mid", 0xe9dcc2, 0, 0.1, 0, 2.6, 0.12, 2.6); },
   parent:function(f){ add(f, "glossy", "mid", 0xc5d1e8, 0, 1.4, 0, 2.2, 1.3, 2.0); add(f, "gold", "mid", GOLD, 0, 2.0, 1.9, 1.0, 0.9, 0.35); for(var k = 0; k < 9; k++){ var a = -0.2 + k / 8 * (Math.PI + 0.4); add(f, "gold", "lo", GOLD, Math.cos(a) * 0.75, 2.7 + Math.sin(a) * 0.95, 1.9, 0.2); } add(f, "matte", "mid", 0x364fc7, 0, 2.0, 2.2, 0.16, 0.3, 0.1); add(f, "glossy", "half", 0x5c7cfa, 0, 2.2, 0, 2.0, 1.0, 1.8); add(f, "matte", "mid", 0xe9dcc2, 0, 0.1, 3.0, 2.0, 0.12, 1.4); }
  };
  // scenery
  var rand = mulberry(11);
  function rdir(){ var v; do{ v = V(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1); }while(v.lengthSq() > 1 || v.lengthSq() < 0.05); return v.normalize(); }
  function nearB(d){ var m = 99; BUILDINGS.forEach(function(h){ m = Math.min(m, d.angleTo(h.dir) * R); }); return m; }
  function dominant(d){ var w = weights(d), b = "city", m = 0; BK.forEach(function(k){ if(w[k] > m){ m = w[k]; b = k; } }); return {b:b, w:w}; }
  var counts = {city:0, desert:0, forest:0, garden:0}, sc2 = lowfx ? 0.6 : 1, want = {city:Math.round(34 * sc2), desert:Math.round(46 * sc2), forest:Math.round(62 * sc2), garden:Math.round(90 * sc2)}, guard = 0;
  while(guard++ < 12000 && (counts.city < want.city || counts.desert < want.desert || counts.forest < want.forest || counts.garden < want.garden)){
    var dd = rdir(), dm = dominant(dd), b = dm.b; if(counts[b] >= want[b] || dm.w[b] < 0.5 || nearB(dd) < 8) continue; counts[b]++;
    var f = frameAt(dd, rand() * 6.28), s = 0.8 + rand() * 0.6, r2 = rand();
    if(b === "city"){ if(r2 < 0.55){ var ci = counts.city % 3; add(f, "glossy", "mid", [0xfff1da, 0xffe3c2, 0xd8f3ee][ci], 0, 1.0 * s, 0, 1.3 * s, 1.0 * s, 1.2 * s); add(f, "glossy", "half", [0x12908a, 0xf08c00, 0x9775fa][ci], 0, 1.75 * s, 0, 1.35 * s, 0.8 * s, 1.25 * s); add(f, "matte", "mid", 0x7a4a21, 0, 0.5 * s, 0.95 * s, 0.3 * s, 0.5 * s, 0.14); }
      else { add(f, "matte", "mid", 0x6c757d, 0, 0.5, 0, 0.12, 0.5, 0.12); add(f, "matte", "mid", 0x6c757d, 0, 1.0, 0, 0.1, 0.5, 0.1); add(f, "glow", "lo", 0xffe3a0, 0, 1.7, 0, 0.3); } }
    else if(b === "desert"){ if(r2 < 0.4){ [0, 1, 2, 3].forEach(function(k){ add(f, "matte", "mid", 0x7a5a35, Math.sin(k * 0.7) * 0.4, 0.7 + k * 0.85, 0, 0.28, 0.5, 0.28); }); [0, 1, 2, 3, 4].forEach(function(k){ var a = k * 1.26; add(f, "matte", "mid", k % 2 ? 0x37b24d : 0x2f9e44, Math.cos(a) * 0.8, 3.5 - Math.abs(Math.sin(a)) * 0.2, Math.sin(a) * 0.8, 0.8, 0.18, 0.35); }); }
      else if(r2 < 0.7){ add(f, "matte", "mid", 0x51cf66, 0, 0.9, 0, 0.4, 1.0, 0.4); add(f, "matte", "mid", 0x51cf66, 0.55, 1.1, 0, 0.22, 0.5, 0.22); add(f, "matte", "mid", 0xffa8c8, 0, 1.95, 0, 0.16); }
      else { add(f, "matte", "mid", 0xe8b86a, 0, 0.3, 0, 1.0 * s, 0.45 * s, 0.9 * s); add(f, "matte", "mid", 0xf2cc8a, 0.7, 0.2, 0.3, 0.6 * s, 0.3 * s, 0.5 * s); } }
    else if(b === "forest"){ if(r2 < 0.78){ var gc = [0x2f9e44, 0x40c057, 0x69db7c]; add(f, "matte", "mid", 0x8b5a2b, 0, 0.7 * s, 0, 0.4 * s, 1.3 * s, 0.4 * s); add(f, "matte", "mid", gc[0], 0, 2.3 * s, 0, 1.4 * s); add(f, "matte", "mid", gc[1], 0.55 * s, 3.1 * s, 0.2 * s, 0.95 * s); add(f, "matte", "mid", gc[2], -0.4 * s, 3.4 * s, -0.1 * s, 0.8 * s); }
      else { add(f, "matte", "mid", 0xfff1da, 0, 0.35, 0, 0.22, 0.4, 0.22); add(f, "glossy", "half", 0xe03131, 0, 0.6, 0, 0.6, 0.45, 0.6); [[0.2, 0.95, 0.2], [-0.25, 0.9, 0.1], [0.05, 1.0, -0.3]].forEach(function(p){ add(f, "matte", "lo", 0xffffff, p[0], p[1], p[2], 0.08); }); } }
    else { if(r2 < 0.7){ var fc = [0xff6b6b, 0xffd43b, 0xf783ac, 0xffffff, 0xb197fc][counts.garden % 5]; add(f, "matte", "lo", 0x2f9e44, 0, 0.28, 0, 0.07, 0.55, 0.07); add(f, "glossy", "mid", fc, 0, 0.75, 0, 0.34); add(f, "matte", "lo", 0xffd43b, 0, 0.78, 0.22, 0.1); add(f, "matte", "lo", 0x40c057, 0.2, 0.15, 0, 0.22, 0.12, 0.22); }
      else { add(f, "matte", "mid", [0x37b24d, 0x51cf66][counts.garden % 2], 0, 0.7, 0, 1.3, 0.7, 0.8); add(f, "glossy", "mid", 0xff8787, 0.4, 1.2, 0.5, 0.14); add(f, "glossy", "mid", 0xffd43b, -0.5, 1.1, 0.4, 0.14); } } }
  (function(){ var od = around("desert", 0.2, 0.0), fo = frameAt(od, 0, -0.02); add(fo, "water", "hi", 0x5cc8e6, 0, 0.1, 0, 3.2, 0.1, 3.2); add(fo, "matte", "mid", 0xe8b86a, 0, 0.1, 0, 3.7, 0.09, 3.7); [[2.4, 0.2], [-2.3, -0.6], [0.4, 2.6]].forEach(function(p){ add(fo, "matte", "mid", 0x7a5a35, p[0], 0.5, p[1], 0.3, 1.2, 0.3); add(fo, "matte", "mid", 0x2f9e44, p[0], 1.8, p[1], 0.9, 0.2, 0.9); });
    var gd = around("garden", 0.1, -0.05), ff = frameAt(gd, 0, 0); add(ff, "matte", "mid", 0xfff1da, 0, 0.2, 0, 3.3, 0.3, 3.3); add(ff, "water", "hi", 0x5cc8e6, 0, 0.5, 0, 2.7, 0.12, 2.7); add(ff, "glossy", "mid", CREAM, 0, 1.1, 0, 0.6, 1.0, 0.6); add(ff, "glossy", "mid", CREAM, 0, 2.0, 0, 0.45, 0.5, 0.45); add(ff, "gold", "mid", GOLD, 0, 2.65, 0, 0.28);
    for(var k = 0; k < 8; k++){ var a = k / 8 * 6.283; add(ff, "water", "lo", 0x9be1f2, Math.cos(a) * 1.0, 1.55 - Math.abs(Math.sin(k * 1.7)) * 0.2, Math.sin(a) * 1.0, 0.16); } })();
  // 0.7.68: with 25 buildings, turn a door away from its neighbours when the usual turn puts it close to another building
  function doorGap(h, spin){ var d = V(0, 0, 7.4).applyMatrix4(frameAt(h.dir, spin, 0.08)).normalize(), m = 99; BUILDINGS.forEach(function(o){ if(o !== h) m = Math.min(m, d.angleTo(o.dir) * R); }); return m; }
  BUILDINGS.forEach(function(h, i){ var spin = 0.4 + i * 0.9; if(doorGap(h, spin) < 9.5){ var best = spin, bg = -1; for(var k = 0; k < 24; k++){ var sp2 = k / 24 * 6.2832, g = doorGap(h, sp2); if(g > bg){ bg = g; best = sp2; } } spin = best; }
    var f = frameAt(h.dir, spin, 0.08); BUILD[h.b || h.id](f); h.frame = f; h.door = V(0, 0, 7.4).applyMatrix4(f).normalize(); });
  Object.keys(batch).forEach(function(k){ var bt = batch[k], im = new T.InstancedMesh(GEO[bt.geo], M[bt.mat], bt.m.length); for(var j = 0; j < bt.m.length; j++){ im.setMatrixAt(j, bt.m[j]); im.setColorAt(j, bt.c[j]); } im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.castShadow = !lowfx; im.receiveShadow = !lowfx; im.frustumCulled = false; scene.add(im); });

  // ----- dynamic bits: pearls, labels, clouds, kid
  function labelMake(text, o){ o = o || {}; var c = document.createElement("canvas"); c.width = 512; c.height = 128; var g = c.getContext("2d"); g.font = "800 54px system-ui,sans-serif"; var tw = Math.min(480, g.measureText(text).width + 64), x = (512 - tw) / 2;
    g.fillStyle = o.bg || "rgba(255,253,248,.97)"; g.beginPath(); g.moveTo(x + 34, 14); g.arcTo(x + tw, 14, x + tw, 114, 38); g.arcTo(x + tw, 114, x, 114, 38); g.arcTo(x, 114, x, 14, 38); g.arcTo(x, 14, x + tw, 14, 38); g.fill(); g.fillStyle = o.fg || "#2c3a3a"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 256, 68);
    var tx = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace; var spr = new T.Sprite(new T.SpriteMaterial({map:tx, transparent:true, depthTest:false, toneMapped:false})); spr.scale.set((o.s || 1) * 4, (o.s || 1), 1); spr.renderOrder = 10; return spr; }
  function relabel(spr, text, o){ var n = labelMake(text, o); spr.material.map.dispose(); spr.material.map = n.material.map; n.material.dispose(); }
  function colorOf(h){ return h.col || "#f2b632"; }
  BUILDINGS.forEach(function(h, i){ var g = new T.Group(); g.matrixAutoUpdate = false; g.matrix.copy(h.frame); g.matrixWorldNeedsUpdate = true; scene.add(g); h.group = g; h.pop = 0; h.pearls = [];
    if(h.acts){ var n = Math.max(1, Math.min(10, liveActs(h).length)); for(var k = 0; k < n; k++){ var a = k / n * Math.PI * 2, m = new T.Mesh(GEO.mid, PM({color:0xd9dde0, roughness:0.15, metalness:0.1, clearcoat:1, emissive:0x000000, envMapIntensity:1})); m.scale.setScalar(0.34); m.position.set(Math.cos(a) * 4.8, 0.38, Math.sin(a) * 4.8); m.castShadow = !lowfx; g.add(m); h.pearls.push(m); }
      h.flag = labelMake("Lv 0", {s:0.6, bg:"rgba(255,244,214,.98)"}); h.flag.position.set(0, 7.9, 0); g.add(h.flag); }
    h.tag = labelMake(TT(h.n1), {s:0.7}); h.tag.position.set(0, h.acts ? 6.9 : 7.0, 0); g.add(h.tag); });
  function refreshHouse(h){ if(!h.acts) return; var n = h.pearls.length, live = liveActs(h), done = 0; h.pearls.forEach(function(m, i){ var a = live[i], on = a && st.done[a.id]; if(on) done++; m.material.color.set(on ? colorOf(h) : "#d9dde0"); m.material.emissive.set(on ? colorOf(h) : "#000000"); m.material.emissiveIntensity = on ? 0.35 : 0; });
    var lv = lvOf(h); if(lv !== h.lv || !h.flagSet){ h.lv = lv; h.flagSet = 1; var stars = ""; for(var q = 0; q < lv; q++) stars += "★"; relabel(h.flag, lv ? "Lv " + lv + " " + stars : "Lv 0", {s:0.6, bg:"rgba(255,244,214,.98)"}); } }
  var cloudMat = PM({color:0xf3f9ff, transparent:true, opacity:0.34, roughness:0.12, metalness:0.03, clearcoat:1, clearcoatRoughness:0.1, envMapIntensity:1.1, depthWrite:false}), clouds = [];
  for(var ci = 0; ci < (lowfx ? 9 : 16); ci++){ var cg = new T.Group(), cn = 3 + Math.floor(rand() * 3); for(var q = 0; q < cn; q++){ var cm = new T.Mesh(GEO.mid, cloudMat); cm.scale.set(1.6 + rand() * 1.4, 1.2 + rand() * 0.6, 1.4 + rand() * 0.8); cm.position.set(q * 1.9 - cn * 0.9, rand() * 0.8, rand() * 1.2 - 0.6); cg.add(cm); }
    var pivot = new T.Group(), cd = rdir(); cg.position.set(0, R + 11 + rand() * 5, 0); pivot.add(cg); pivot.quaternion.setFromUnitVectors(UP, cd); pivot.userData.axis = new T.Vector3().crossVectors(cd, V(0.3, 1, 0.2)).normalize(); pivot.userData.spd = 0.012 + rand() * 0.015; scene.add(pivot); clouds.push(pivot); }
  var player = new T.Group(), ballMat = PM({color:0x14b8a6, roughness:0.13, metalness:0.025, clearcoat:1, clearcoatRoughness:0.055, envMapIntensity:1.2}), body = new T.Mesh(GEO.hi, ballMat); body.scale.setScalar(BALL); body.castShadow = !lowfx;
  var ink = PM({color:0x3b2f45, roughness:0.19, clearcoat:1}), white = new T.MeshBasicMaterial({color:0xfff9ef}), cheek = PM({color:0xff7f9a, roughness:0.5, clearcoat:0.4}), face = new T.Group();
  function fb(m, x, y, z, sx, sy, sz){ var bb = new T.Mesh(GEO.lo, m); bb.position.set(x, y, z); bb.scale.set(sx, sy, sz); face.add(bb); return bb; }
  [-1, 1].forEach(function(s){ fb(ink, s * 0.19, 0.08, 0.54, 0.055, 0.085, 0.04); fb(white, s * 0.19 - 0.012, 0.11, 0.575, 0.015, 0.024, 0.011); fb(cheek, s * 0.32, -0.07, 0.47, 0.09, 0.045, 0.025); });
  for(var u = 0; u < 7; u++){ var ang = Math.PI * 0.15 + u / 6 * Math.PI * 0.7; fb(ink, Math.cos(ang) * 0.09, -0.05 - Math.sin(ang) * 0.05, 0.575, 0.013, 0.013, 0.012); }
  var cap = new T.Mesh(GEO.half, PM({color:0xffffff, roughness:0.4, clearcoat:0.7})); cap.scale.set(0.62, 0.34, 0.62); cap.position.set(0, 0.78, 0.02); cap.rotation.x = -0.18; var capBall = new T.Mesh(GEO.lo, PM({color:0xf2b632, roughness:0.2, metalness:0.3, clearcoat:1})); capBall.scale.setScalar(0.07); capBall.position.set(0, 1.1, -0.02);
  var faceG = new T.Group(); faceG.add(face); faceG.scale.setScalar(BALL); var capG = new T.Group(); capG.add(cap, capBall); capG.scale.setScalar(BALL); player.add(body, faceG, capG); scene.add(player);
  // 0.7.73 (owner): a phone pet (Astra VPet 2 builders) can walk the planet instead of the ball. A fish turns the planet into a water world.
  var AVS = !PV && H.avatar ? H.avatar() : null, AV = null, WATER = false, bubbles = null;
  if(AVS && window.VPetArt && window.VPetArt[AVS.sp]){ try{ AV = window.VPetArt[AVS.sp](T, Object.assign({}, AVS.look || {}, {acc:"none"}), lowfx); AV.update(0, 0.016, {}); AV.root.updateMatrixWorld(true);
      var abb = new T.Box3().setFromObject(AV.root), asz = abb.getSize(new T.Vector3()), want = AVS.sp === "cat" ? 2.9 : AVS.sp === "fish" ? 3.0 : 2.5; AV.sc = want / Math.max(0.01, AVS.sp === "fish" ? Math.max(asz.x, asz.z) : asz.y); AV.root.scale.setScalar(AV.sc);
      AV.base = -BALL * 0.98; AV.root.position.y = AV.base + (AVS.sp === "fish" ? 1.6 : 0); AV.root.traverse(function(o){ if(o.isMesh){ o.castShadow = !lowfx; (Array.isArray(o.material) ? o.material : [o.material]).forEach(function(m){ if(m){ m.fog = false; m.needsUpdate = true; } }); } }); AV.gait = 0; player.add(AV.root); body.visible = faceG.visible = capG.visible = false; WATER = AVS.sp === "fish"; }catch(e){ AV = null; } }
  if(WATER){ stage.classList.add("kwWater"); scene.background = new T.Color(0x0b4f6c); scene.fog = new T.FogExp2(0x0e6585, 0.026); hemi.color.set(0x9fe7ff); hemi.groundColor.set(0x1b6e8a); sun.color.set(0xc9f4ff); fill.color.set(0x7fd8ff);
    clouds.forEach(function(c){ c.visible = false; });
    var shell = new T.Mesh(new T.SphereGeometry(R + 18, 48, 32), new T.MeshPhysicalMaterial({color:0x5fd3ff, transparent:true, opacity:0.13, roughness:0.08, side:T.DoubleSide, depthWrite:false})); scene.add(shell); WATER = {shell:shell};
    var bn = lowfx ? 16 : 36; bubbles = new T.InstancedMesh(new T.SphereGeometry(0.09, 10, 8), new T.MeshPhysicalMaterial({color:0xeaffff, transparent:true, opacity:0.55, roughness:0.05, clearcoat:1, depthWrite:false}), bn); bubbles.frustumCulled = false; scene.add(bubbles);
    bubbles.userData.b = []; for(var bi = 0; bi < bn; bi++) bubbles.userData.b.push({x:(Math.random() - 0.5) * 22, z:(Math.random() - 0.5) * 22, h:Math.random() * 14, s:0.3 + Math.random() * 0.7, v:0.8 + Math.random() * 1.4}); }

  // ----- HUD
  function hud(){ var lvl = 1 + Math.floor(st.stars / 15); $("kwLv").textContent = L("Tahap ", "Level ") + lvl; $("kwXp").style.width = ((st.stars % 15) / 15 * 100) + "%"; $("kwSt").textContent = "⭐ " + st.stars;
    var bm = $("kwBm"); bm.textContent = ""; BK.forEach(function(k){ var tot = 0, dn = 0; HOUSES.forEach(function(h){ if(h.biome === k){ tot += liveActs(h).length; dn += doneCount(h); } }); var sp2 = el("span", "kwBm"); var dot = el("span", "kwGb"); dot.style.setProperty("--c", BI[k].dot); sp2.appendChild(dot); sp2.appendChild(document.createTextNode(TT(K.BIOMES[k][0]) + " " + (tot ? Math.round(dn * 100 / tot) : 0) + "%")); bm.appendChild(sp2); }); }
  BUILDINGS.forEach(refreshHouse); hud();

  // ----- input
  var pos = around("city", 0.0, -0.08), fwd = V(0, 0, 1), up = V(0, 0, 0), right = V(0, 0, 0), basis = new T.Matrix4(), q1 = new T.Quaternion(), ax = V(0, 0, 0), tmp = V(0, 0, 0), tmp2 = V(0, 0, 0), camP = V(0, 0, 0), camL = V(0, 0, 0), sunDir = V(0, 0, 0);
  var overview = false, near = null, roll = 0, input = {x:0, y:0}, keys = {}, raf = 0, last = 0, bursts = [], stopped = false, paused = false, modal = false;
  fwd.sub(tmp.copy(pos).multiplyScalar(fwd.dot(pos))).normalize();
  var pad = $("kwPad"), knob = $("kwKnob"), act2 = false;
  function padMove(e){ var r = pad.getBoundingClientRect(), x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2), l = Math.hypot(x, y); if(l > 1){ x /= l; y /= l; } input.x = x; input.y = y; knob.style.transform = "translate(" + (x * 38) + "px," + (y * 38) + "px)"; }
  function padEnd(){ act2 = false; input.x = 0; input.y = 0; knob.style.transform = ""; }
  pad.addEventListener("pointerdown", function(e){ act2 = true; try{ pad.setPointerCapture(e.pointerId); }catch(x){} padMove(e); }); pad.addEventListener("pointermove", function(e){ if(act2) padMove(e); }); pad.addEventListener("pointerup", padEnd); pad.addEventListener("pointercancel", padEnd);
  function kd(e){ keys[e.key] = 1; } function ku(e){ keys[e.key] = 0; } window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
  // 0.7.56 (owner): the whole planet is a globe button; in it the planet turns, zooms and pans with the fingers (orbit), and ✨ teleports to any house
  var orb = {dir:V(0, 0, 1), upv:V(0, 1, 0), dist:86, tgt:V(0, 0, 0)}, snap = false, camYaw = 0, camPitch = 0, camHeld = false, bk = V(0, 0, 0);
  function setOver(on){ overview = on; var b = $("kwOver"); b.textContent = on ? "⚽" : "🌍"; b.classList.toggle("on", on); b.title = on ? L("Kembali ke bola", "Back to ball") : L("Seluruh planet", "Whole planet"); $("kwOrbH").hidden = !on;
    if(on){ orb.dir.copy(pos).normalize(); orb.upv.copy(fwd); orb.dist = fitDist(); orb.tgt.set(0, 0, 0); clearTimeout(setOver.t); setOver.t = setTimeout(function(){ $("kwOrbH").hidden = true; }, 4000); } }
  $("kwOver").onclick = function(){ tpShow(false); setOver(!overview); };
  // 0.7.73: choose who walks the planet: the ball or one of the phone pets
  if($("kwAv")) $("kwAv").onclick = function(){ var L2 = $("kwAvL"); if(!L2.hidden){ L2.hidden = true; return; } tpShow(false); var list = H.phonePets ? H.phonePets() : [], cur = AVS ? AVS.id : null, em = {cat:"🐈", bird:"🐦", fish:"🐠"};
    L2.textContent = ""; var add = function(id, ic, nm, sub){ var b = el("button", "kwTpI"); b.type = "button"; b.innerHTML = '<span class="kwTpE">' + ic + '</span><span class="kwTpN"><b>' + E(nm) + '</b><small>' + E(sub) + '</small></span>' + (cur === id ? '<em>✓</em>' : ''); b.onclick = function(){ L2.hidden = true; if(cur === id) return; H.setAvatar(id); var again = function(){ K.render(host, H); }; if(id && !window.VPetArt && H.loadJs) H.loadJs(["pets/vpet/vpet.js"], again, again); else again(); }; L2.appendChild(b); };
    add(null, "⚽", L("Bola", "The ball"), L("Asal", "Classic"));
    list.forEach(function(p){ add(p.id, em[p.sp] || "🐾", p.n, p.sp === "fish" ? L("Planet air 🌊", "Water planet 🌊") : p.sp === "bird" ? L("Terbang bila bergerak", "Flies as it goes") : L("Berjalan", "Walks")); });
    if(!list.length){ var n0 = el("div", "kwTpI"); n0.innerHTML = '<span class="kwTpN"><small>' + E(L("Ambil pet telefon di Alat › Haiwan › 🎮", "Adopt a phone pet in Tools › Pets › 🎮")) + '</small></span>'; L2.appendChild(n0); }
    L2.hidden = false; };
  var cv = renderer.domElement, ptr = {}, oq = new T.Quaternion(), oR = V(0, 0, 0);
  function orbTurn(dx, dy){ oR.crossVectors(orb.upv, orb.dir).normalize(); oq.setFromAxisAngle(orb.upv, -dx * 0.006); orb.dir.applyQuaternion(oq); oq.setFromAxisAngle(oR, -dy * 0.006); orb.dir.applyQuaternion(oq).normalize(); orb.upv.applyQuaternion(oq);
    orb.upv.sub(tmp.copy(orb.dir).multiplyScalar(orb.upv.dot(orb.dir))).normalize(); }
  function orbPan(dx, dy){ oR.crossVectors(orb.upv, orb.dir).normalize(); var k = orb.dist * 0.0014; orb.tgt.addScaledVector(oR, -dx * k).addScaledVector(orb.upv, dy * k); if(orb.tgt.length() > 30) orb.tgt.setLength(30); }
  function orbZoom(f){ orb.dist = Math.max(36, Math.min(Math.max(150, fitDist() * 1.4), orb.dist * f)); }
  function fitDist(){ var v = camera.fov * Math.PI / 360, h = Math.atan(Math.tan(v) * camera.aspect), a = Math.min(v, h); return (R + 6) / Math.sin(a) * 1.04; }   // the whole planet fits the screen width and height
  // 0.7.60 (owner): while walking, a finger on the 3D space (even a second finger next to the joystick) turns the camera around the ball; a tap there closes an open house card
  cv.addEventListener("pointerdown", function(e){ if(PV) return; ptr[e.pointerId] = {x:e.clientX, y:e.clientY, x0:e.clientX, y0:e.clientY, t0:Date.now()}; try{ cv.setPointerCapture(e.pointerId); }catch(x){} });
  cv.addEventListener("pointermove", function(e){ var p0 = ptr[e.pointerId]; if(!p0) return;
    if(!overview){ camYaw -= (e.clientX - p0.x) * 0.009; camPitch = Math.max(-0.4, Math.min(0.75, camPitch + (e.clientY - p0.y) * 0.005)); p0.x = e.clientX; p0.y = e.clientY; camHeld = true; return; }
    var ids = Object.keys(ptr);
    if(ids.length === 1){ orbTurn(e.clientX - p0.x, e.clientY - p0.y); p0.x = e.clientX; p0.y = e.clientY; return; }
    var o = ptr[ids[0] == e.pointerId ? ids[1] : ids[0]], d0 = Math.hypot(p0.x - o.x, p0.y - o.y), cx0 = (p0.x + o.x) / 2, cy0 = (p0.y + o.y) / 2;
    p0.x = e.clientX; p0.y = e.clientY; var d1 = Math.hypot(p0.x - o.x, p0.y - o.y), cx1 = (p0.x + o.x) / 2, cy1 = (p0.y + o.y) / 2; if(d1 > 10) orbZoom(d0 / d1); orbPan(cx1 - cx0, cy1 - cy0); });
  function pend(e){ var p0 = ptr[e.pointerId]; delete ptr[e.pointerId]; camHeld = Object.keys(ptr).length > 0 && !overview;
    if(p0 && e.type === "pointerup" && Math.abs(e.clientX - p0.x0) < 9 && Math.abs(e.clientY - p0.y0) < 9 && Date.now() - p0.t0 < 400 && openB && !modal) closePop(); } cv.addEventListener("pointerup", pend); cv.addEventListener("pointercancel", pend);
  cv.addEventListener("wheel", function(e){ if(!overview) return; e.preventDefault(); if(e.shiftKey) orbPan(-e.deltaX || -e.deltaY, 0); else orbZoom(1 + Math.max(-0.3, Math.min(0.3, e.deltaY * 0.0012))); }, {passive:false});
  // ✨ teleport: a list that drops up from the button, every house stacked
  function tpShow(on){ var l = $("kwTpL"); if(on == null) on = l.hidden; l.hidden = !on; $("kwTp").classList.toggle("on", on); if(!on) return; l.textContent = "";
    BUILDINGS.forEach(function(h){ var b = el("button", "kwTpI"); b.type = "button"; var lv = h.acts ? lvOf(h) : -1, live = h.acts ? liveActs(h) : [];
      b.innerHTML = '<span class="kwTpE">' + E(h.ic || "🏠") + '</span><span class="kwTpN"><b>' + E(TT(h.n1)) + '</b><small>' + (h.acts ? E(TT(K.BIOMES[h.biome][0])) + ' · ' + L("Tahap ", "Level ") + lv + ' · ' + doneCount(h) + '/' + live.length : E(TT(K.BIOMES[h.biome][0]))) + '</small></span>' + (h.acts ? '<span class="kwTpS">' + "★★★".slice(0, lv) + '<i>' + "☆☆☆".slice(0, 3 - lv) + '</i></span>' : '');
      b.style.setProperty("--c", colorOf(h)); b.onclick = function(){ teleport(h); }; l.appendChild(b); }); }
  function teleport(h){ tpShow(false); closePop(); var door = V(0, 0, 7.4).applyMatrix4(h.frame).normalize(); pos.copy(door); fwd.copy(h.dir).sub(tmp.copy(pos).multiplyScalar(h.dir.dot(pos))).normalize(); if(overview) setOver(false); snap = true; H.vib(40);
    for(var i = 0; i < 14; i++){ var m = new T.Mesh(GEO.lo, PM({color:[0xffd166, 0x74c0fc, 0xe8697d, 0x9775fa][i % 4], roughness:0.2, clearcoat:1, emissive:0xffe3a0, emissiveIntensity:0.4})); m.scale.setScalar(0.22); m.position.copy(pos).multiplyScalar(R + terrainH(pos) + 1); scene.add(m); bursts.push({m:m, v:V((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6).add(pos.clone().multiplyScalar(6)), t:0}); }
    if(h.acts) setTimeout(function(){ if(!stopped && !modal) showPop(h); }, 450); }
  $("kwTp").onclick = function(){ tpShow(); };

  // ----- pop-ups
  var popEl = $("kwPop"), ov = $("kwOv"), openB = null;
  function burst(h){ for(var i = 0; i < 16; i++){ var m = new T.Mesh(GEO.lo, PM({color:[0xffd166, 0x12908a, 0xe8697d, 0x74c0fc, 0x9775fa][i % 5], roughness:0.2, clearcoat:1})); m.scale.setScalar(0.26); m.position.copy(V(0, 5.5, 0).applyMatrix4(h.frame)); scene.add(m); bursts.push({m:m, v:V((Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5).add(h.dir.clone().multiplyScalar(5 + Math.random() * 4)), t:0}); } }
  function closePop(){ popEl.textContent = ""; openB = null; }
  function closeOv(){ if(pctx.onStop){ try{ pctx.onStop(); }catch(e){} pctx.onStop = null; } ov.hidden = true; ov.textContent = ""; modal = false; if(openB && openB.acts) showPop(openB); }
  var pctx = {H:H, box:ov, st:st, save:save, weekId:weekId, weekCount:weekCount, addStars:addStars, all:K.ALL, houses:HOUSES, onStop:null,
    close:closeOv,
    mark:function(a){ var g = award(a); if(g) H.toast("+" + g + " ⭐"); var h = HOUSES.filter(function(x){ return x.id === a.house; })[0]; if(h){ refreshHouse(h); h.pop = 1; } },
    finish:function(a, ok){ if(!ok){ closeOv(); return; } var g = award(a); var h = HOUSES.filter(function(x){ return x.id === a.house; })[0]; if(h){ refreshHouse(h); h.pop = 1; burst(h); } hud(); H.vib(80); setTimeout(function(){ if(g) H.toast(g ? "+" + g + " ⭐ " + L("MasyaAllah!", "MashaAllah!") : ""); closeOv(); }, 350); },
    reset:function(){ st.done = {}; st.stars = 0; st.v = {}; st.log = []; save(); BUILDINGS.forEach(refreshHouse); hud(); }};
  function playAct(a){ modal = true; ov.hidden = false; ov.textContent = ""; pctx.box = ov; var inner = el("div", "kwSheet"); ov.appendChild(inner); pctx.box = inner; closePop(); K.play(a, pctx); }
  function showPop(h){ openB = h; popEl.textContent = ""; var c = el("div", "kwPop3"); var x = el("button", "kwX", "✕"); x.type = "button"; x.setAttribute("aria-label", L("Tutup", "Close")); x.onclick = closePop; c.appendChild(x);
    c.appendChild(el("h4", null, E(h.ic + " " + TT(h.n1)))); var live = liveActs(h), dn = doneCount(h), lv = lvOf(h); c.appendChild(el("div", "kwSub2", TT(K.BIOMES[h.biome][0]) + " · " + L("Tahap ", "Level ") + lv + " / 3 · " + dn + "/" + live.length));
    var pr = el("div", "kwBar"); pr.innerHTML = '<i style="width:' + (live.length ? dn * 100 / live.length : 0) + '%"></i>'; c.appendChild(pr); var ring = el("div", "kwRing2"); live.forEach(function(a){ var b = el("span", "kwGb" + (st.done[a.id] ? "" : " off")); b.style.setProperty("--c", colorOf(h)); b.style.setProperty("--s", "18px"); ring.appendChild(b); }); c.appendChild(ring);
    var closed = (st.p.off || {})[h.id]; if(closed){ c.appendChild(el("p", "kwP", "🔒 " + L("Rumah ini ditutup oleh ibu bapa.", "This house is closed by a parent."))); popEl.appendChild(c); return; }
    var all = h.acts.filter(visible); all.forEach(function(a){ var r = el("div", "kwAct"); r.appendChild(el("span", "kwAi", a.ic || "•")); var nm = el("b", null, E(TT(a.n))); r.appendChild(nm);
      if(a.t === "soon"){ r.appendChild(el("span", "kwSoon", L("Tidak lama lagi", "Coming soon"))); r.classList.add("soon"); }
      else { var d = st.done[a.id]; if(d) r.appendChild(el("span", "kwOk", "✓")); var b = el("button", "kwBtn kwSm", d ? L("Main lagi", "Again") : L("Main", "Play")); b.type = "button"; b.onclick = function(){ playAct(a); }; r.appendChild(b); }
      c.appendChild(r); }); popEl.appendChild(c); }
  function showTower(){ closePop(); modal = true; ov.hidden = false; ov.textContent = ""; var inner = el("div", "kwSheet"); ov.appendChild(inner); pctx.box = inner; K.playTower(pctx); }
  function showParent(){ H.pinAsk(L("Menara ibu bapa", "Parent Tower"), function(){ closePop(); modal = true; ov.hidden = false; ov.textContent = ""; var inner = el("div", "kwSheet kwParent"); ov.appendChild(inner); K.parent(inner, pctx); }); }
  $("kwVisit").onclick = function(){ if(!near) return; if(near.id === "tower") showTower(); else if(near.id === "parent") showParent(); else showPop(near); };

  // ----- time limit and bedtime (parent settings)
  var brk = null, lastTick = 0;
  function bedNow(){ if(!st.p.bed || st.day.bedOk) return false; var p = (st.p.bedAt || "20:30").split(":"), n = new Date(), m = n.getHours() * 60 + n.getMinutes(), b = (+p[0]) * 60 + (+p[1]); return m >= b || m < 5 * 60; }
  function breakScreen(kind){ if(brk) return; modal = true; brk = el("div", "kwBreak"); brk.innerHTML = '<div class="kwBig2">' + (kind === "bed" ? "🌙" : "⏰") + '</div><p class="kwP">' + (kind === "bed" ? L("Sudah waktu tidur. Selamat malam!", "It is bedtime. Good night!") : L("Masa bermain hari ini sudah habis. Terima kasih!", "Today's play time is finished. Thank you!")) + '</p>';
    var b = el("button", "kwBtn alt", "🔒 " + L("Ibu bapa", "Parent")); b.type = "button"; b.onclick = function(){ H.pinAsk(L("Buka planet", "Reopen the planet"), function(){ if(kind === "bed") st.day.bedOk = 1; else st.day.ext = (st.day.ext || 0) + 15; save(); if(brk && brk.parentNode) brk.parentNode.removeChild(brk); brk = null; modal = false; }); }; brk.appendChild(b); stage.appendChild(brk); }
  function tick(t){ if(document.hidden || t - lastTick < 5) return; var dt = lastTick ? t - lastTick : 5; lastTick = t; if(ymd() !== st.day.d) st.day = {d:ymd(), secs:0, ext:0, bedOk:0}; if(!ov.hidden || brk) return; st.day.secs += Math.min(dt, 10);
    var lim = (st.p.limit == null ? 60 : st.p.limit); if(lim > 0 && st.day.secs >= (lim + (st.day.ext || 0)) * 60){ save(); breakScreen("time"); } else if(bedNow()){ breakScreen("bed"); } else save(); }

  // ----- loop
  function fit(){ var w = stage.clientWidth || 300, h2 = stage.clientHeight || 400; renderer.setSize(w, h2, false); camera.aspect = w / h2; camera.updateProjectionMatrix(); }
  fit(); var ro = null; if(window.ResizeObserver){ ro = new ResizeObserver(fit); ro.observe(stage); }
  function step(dt, t){ var tx = input.x, ty = -input.y; if(PV){ tx = Math.sin(t * 0.45) * 0.35; ty = 0.75; } if(keys.ArrowLeft || keys.a) tx -= 1; if(keys.ArrowRight || keys.d) tx += 1; if(keys.ArrowUp || keys.w) ty += 1; if(keys.ArrowDown || keys.s) ty -= 1; if(overview || modal){ tx = 0; ty = 0; }
    if(Math.abs(tx) > 0.05){ q1.setFromAxisAngle(pos, -tx * 2.3 * dt); fwd.applyQuaternion(q1).normalize(); }
    var mv = 0; if(Math.abs(ty) > 0.05){ mv = ty > 0 ? 7 * ty : 3 * ty; ax.crossVectors(pos, fwd).normalize(); q1.setFromAxisAngle(ax, mv * dt / R); pos.applyQuaternion(q1).normalize(); fwd.applyQuaternion(q1); }
    BUILDINGS.forEach(function(h){ var ang = pos.angleTo(h.dir), min = 5.2 / R; if(ang < min){ ax.crossVectors(pos, h.dir); if(ax.lengthSq() < 1e-8) ax.set(1, 0, 0).cross(pos); ax.normalize(); q1.setFromAxisAngle(ax, -(min - ang)); pos.applyQuaternion(q1).normalize(); fwd.applyQuaternion(q1); } });
    fwd.sub(tmp.copy(pos).multiplyScalar(fwd.dot(pos))).normalize(); up.copy(pos); right.crossVectors(up, fwd).normalize(); basis.makeBasis(right, up, fwd);
    var hh2 = terrainH(pos), hop = 0,   /* 0.7.60 (owner): no bounce, the ball only rolls */ P = tmp2.copy(pos).multiplyScalar(R + hh2 + BALL * 0.98 + hop); player.position.copy(P); player.quaternion.setFromRotationMatrix(basis); roll += mv * dt / BALL; body.rotation.x = roll;
    player.scale.set(1, 1, 1);
    if(AV){ var spd = Math.min(2, Math.abs(mv) / 3.5), flying = AVS.sp === "bird" && Math.abs(mv) > 0.2; AV.gait += dt * (spd * 5 + 1);
      AV.update(t, dt, {speed:spd, gait:AV.gait, mode:flying ? "play" : "idle", phase:t, lookX:Math.max(-1, Math.min(1, tx * 0.8)), lookY:0, happy:0.7, time:t, blink:(Math.sin(t * 1.3) > 0.985) ? 1 : 0});
      var ay = AV.base + (AVS.sp === "fish" ? 1.6 + Math.sin(t * 1.6) * 0.18 : flying ? 0.9 + Math.sin(t * 6) * 0.12 : 0); AV.root.position.y += (ay - AV.root.position.y) * Math.min(1, dt * 6); AV.root.rotation.z = AVS.sp === "fish" ? -tx * 0.25 : 0; }
    if(WATER){ scene.fog.density = overview ? 0.0035 : 0.026; sun.intensity = 2.0 + Math.sin(t * 2.6) * 0.25 + Math.sin(t * 4.1) * 0.12; WATER.shell.rotation.y += dt * 0.01;
      if(bubbles){ var bm = bubbles.userData.b, mm = new T.Matrix4(), bq = new T.Quaternion(), bs = new T.Vector3(); for(var bj = 0; bj < bm.length; bj++){ var b = bm[bj]; b.h += b.v * dt; if(b.h > 14){ b.h = 0; b.x = (Math.random() - 0.5) * 22; b.z = (Math.random() - 0.5) * 22; }
          tmp.copy(P).addScaledVector(right, b.x).addScaledVector(fwd, b.z).addScaledVector(up, b.h - 1 + Math.sin(t * 2 + bj) * 0.1); bs.setScalar(b.s); mm.compose(tmp, bq, bs); bubbles.setMatrixAt(bj, mm); } bubbles.instanceMatrix.needsUpdate = true; } }
    if(PV){ var pa = t * 0.22, fd = fitDist() * 0.92; tmp.set(Math.sin(pa) * fd, fd * 0.22 + Math.sin(t * 0.3) * 8, Math.cos(pa) * fd); camera.position.copy(tmp); camera.up.set(0, 1, 0); camera.lookAt(0, -2, 0); }
    else if(overview){ tmp.copy(orb.tgt).addScaledVector(orb.dir, orb.dist); camP.lerp(tmp, 1 - Math.pow(0.0005, dt)); camera.position.copy(camP); camera.up.copy(orb.upv); camera.lookAt(orb.tgt); }
    else { if(!camHeld && mv){ camYaw *= Math.pow(0.25, dt); camPitch *= Math.pow(0.4, dt); }   // the view eases back behind the ball once walking without the second finger
      bk.copy(fwd).multiplyScalar(Math.cos(camYaw)).addScaledVector(right, Math.sin(camYaw)).normalize();
      tmp.copy(P).addScaledVector(up, 12.5 + camPitch * 13).addScaledVector(bk, -17 * (1 - camPitch * 0.35)); camP.lerp(tmp, snap ? 1 : 1 - Math.pow(camHeld ? 0.00002 : 0.0006, dt)); snap = false; camera.position.copy(camP); camera.up.copy(up); camL.copy(P).addScaledVector(bk, 3.5).addScaledVector(up, 1.2); camera.lookAt(camL); }
    sunDir.copy(up).multiplyScalar(0.85).addScaledVector(right, 0.45).addScaledVector(fwd, 0.25).normalize(); sun.position.copy(P).addScaledVector(sunDir, 55); sun.target.position.copy(P); sun.target.updateMatrixWorld(); fill.position.copy(P).addScaledVector(right, -30).addScaledVector(up, 10);
    clouds.forEach(function(c){ c.rotateOnWorldAxis(c.userData.axis, c.userData.spd * dt); });
    var best = null, bd = 99; BUILDINGS.forEach(function(h){ var d2 = Math.min(pos.angleTo(h.dir) * R, h.door ? pos.angleTo(h.door) * R + 1.5 : 99); if(d2 < bd){ bd = d2; best = h; } }); var nn = (bd < 9.2 && !overview && !modal) ? best : null;
    if(nn !== near){ near = nn; $("kwVisit").hidden = !near; var ne = $("kwNear"); ne.hidden = !near; if(near){ var closed = near.acts && (st.p.off || {})[near.id]; ne.textContent = TT(near.n1) + (near.acts ? " · " + L("Tahap ", "Level ") + lvOf(near) : "") + (closed ? " 🔒" : ""); } if(!near && openB) closePop(); }
    BUILDINGS.forEach(function(h, i){ if(h.flag) h.flag.position.y = 7.9 + Math.sin(t * 2 + i) * 0.15; if(h.pop > 0){ h.pop = Math.max(0, h.pop - dt * 1.8); var live = liveActs(h); h.pearls.forEach(function(m, k){ var a = live[k], on = a && st.done[a.id]; m.scale.setScalar(0.34 * (on && h.pop > 0.2 ? 1 + Math.sin(h.pop * Math.PI) * 0.6 : 1)); }); } });
    for(var bi = bursts.length - 1; bi >= 0; bi--){ var bb = bursts[bi]; bb.t += dt; bb.v.addScaledVector(tmp.copy(bb.m.position).normalize(), -9 * dt); bb.m.position.addScaledVector(bb.v, dt); bb.m.scale.setScalar(Math.max(0.01, 0.26 * (1 - bb.t / 1.6))); if(bb.t > 1.6){ scene.remove(bb.m); bursts.splice(bi, 1); } }
    if(!PV) tick(t); }
  function frame(now){ if(stopped) return; if(!document.body.contains(stage)){ api.stop(); return; } raf = requestAnimationFrame(frame); if(paused) return; var t = now / 1000, dt = Math.min(0.05, (t - last) || 0.016); last = t; step(dt, t); renderer.render(scene, camera); }
  up.copy(pos); camP.copy(pos).multiplyScalar(R + 12.5).addScaledVector(fwd, -17);
  var vis = function(){ paused = document.hidden; last = 0; }; document.addEventListener("visibilitychange", vis);
  raf = requestAnimationFrame(frame);
  var api = {stop:function(){ stopped = true; if(raf) cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); document.removeEventListener("visibilitychange", vis); if(ro) ro.disconnect(); if(pctx.onStop){ try{ pctx.onStop(); }catch(e){} } save();
      try{ scene.traverse(function(o){ if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } }); renderer.dispose(); if(renderer.forceContextLoss) renderer.forceContextLoss(); }catch(e){} K.cur = null; },
    state:function(){ return st; }, cam:function(){ return {yaw:camYaw, pitch:camPitch}; }, popOpen:function(){ return !!openB; }, teleport:function(id){ var h = BUILDINGS.filter(function(x){ return x.id === id; })[0]; if(h) teleport(h); }, over:function(on){ setOver(on); }, orbit:function(){ return {dist:orb.dist, dir:orb.dir.toArray(), tgt:orb.tgt.toArray()}; }, tpOpen:function(){ tpShow(true); }, parent:showParent, tower:showTower, openHouse:function(id){ var h = BUILDINGS.filter(function(x){ return x.id === id; })[0]; if(h) showPop(h); }, play:playAct};
  K.cur = api; return api;
};
})();
