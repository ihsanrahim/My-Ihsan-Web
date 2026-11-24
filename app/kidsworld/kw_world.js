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
  var lowfx = document.documentElement.classList.contains("lowfx");
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
    '<div class="kwSb"><button class="kwBtn alt" id="kwOver" type="button">' + L("Seluruh planet", "Whole planet") + '</button><button class="kwBtn" id="kwVisit" type="button" hidden>' + L("Lawat", "Visit") + '</button></div><div id="kwPop"></div><div id="kwOv" class="kwOv" hidden></div>';
  function $(id){ return stage.querySelector("#" + id); }
  var hh = host.getBoundingClientRect(), nav = document.getElementById("nav"), navH = nav ? nav.offsetHeight : 60; stage.style.height = Math.max(380, window.innerHeight - Math.max(0, hh.top) - navH - 8) + "px";
  var renderer;
  try{ renderer = new T.WebGLRenderer({antialias:!lowfx, alpha:true, powerPreference:"high-performance"}); }catch(e){ stage.appendChild(el("div", "kwFail", L("Planet memerlukan WebGL. Guna paparan ringkas.", "The planet needs WebGL. Use the simple view."))); if(H.noGL) H.noGL(); return {stop:function(){}}; }
  renderer.domElement.setAttribute("data-ib3d", "off"); renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92; renderer.shadowMap.enabled = !lowfx; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowfx ? 1 : 1.6)); stage.insertBefore(renderer.domElement, stage.firstChild);
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
  BUILDINGS.forEach(function(h, i){ var f = frameAt(h.dir, 0.4 + i * 0.9, 0.08); BUILD[h.b || h.id](f); h.frame = f; });
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
  $("kwOver").onclick = function(){ overview = !overview; $("kwOver").textContent = overview ? L("Kembali ke bola", "Back to ball") : L("Seluruh planet", "Whole planet"); };

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
  function step(dt, t){ var tx = input.x, ty = -input.y; if(keys.ArrowLeft || keys.a) tx -= 1; if(keys.ArrowRight || keys.d) tx += 1; if(keys.ArrowUp || keys.w) ty += 1; if(keys.ArrowDown || keys.s) ty -= 1; if(overview || modal){ tx = 0; ty = 0; }
    if(Math.abs(tx) > 0.05){ q1.setFromAxisAngle(pos, -tx * 2.3 * dt); fwd.applyQuaternion(q1).normalize(); }
    var mv = 0; if(Math.abs(ty) > 0.05){ mv = ty > 0 ? 7 * ty : 3 * ty; ax.crossVectors(pos, fwd).normalize(); q1.setFromAxisAngle(ax, mv * dt / R); pos.applyQuaternion(q1).normalize(); fwd.applyQuaternion(q1); }
    BUILDINGS.forEach(function(h){ var ang = pos.angleTo(h.dir), min = 5.2 / R; if(ang < min){ ax.crossVectors(pos, h.dir); if(ax.lengthSq() < 1e-8) ax.set(1, 0, 0).cross(pos); ax.normalize(); q1.setFromAxisAngle(ax, -(min - ang)); pos.applyQuaternion(q1).normalize(); fwd.applyQuaternion(q1); } });
    fwd.sub(tmp.copy(pos).multiplyScalar(fwd.dot(pos))).normalize(); up.copy(pos); right.crossVectors(up, fwd).normalize(); basis.makeBasis(right, up, fwd);
    var hh2 = terrainH(pos), hop = mv ? Math.abs(Math.sin(t * 9)) * 0.28 : Math.sin(t * 2) * 0.04, P = tmp2.copy(pos).multiplyScalar(R + hh2 + BALL * 0.98 + hop); player.position.copy(P); player.quaternion.setFromRotationMatrix(basis); roll += mv * dt / BALL; body.rotation.x = roll;
    var sq = 1 + (mv ? 0.035 * Math.sin(t * 16) : 0); player.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    if(overview){ tmp.copy(pos).multiplyScalar(86).addScaledVector(fwd, -10); camP.lerp(tmp, 1 - Math.pow(0.002, dt)); camera.position.copy(camP); camera.up.copy(fwd); camera.lookAt(0, 0, 0); }
    else { tmp.copy(P).addScaledVector(up, 12.5).addScaledVector(fwd, -17); camP.lerp(tmp, 1 - Math.pow(0.0006, dt)); camera.position.copy(camP); camera.up.copy(up); camL.copy(P).addScaledVector(fwd, 3.5).addScaledVector(up, 1.2); camera.lookAt(camL); }
    sunDir.copy(up).multiplyScalar(0.85).addScaledVector(right, 0.45).addScaledVector(fwd, 0.25).normalize(); sun.position.copy(P).addScaledVector(sunDir, 55); sun.target.position.copy(P); sun.target.updateMatrixWorld(); fill.position.copy(P).addScaledVector(right, -30).addScaledVector(up, 10);
    clouds.forEach(function(c){ c.rotateOnWorldAxis(c.userData.axis, c.userData.spd * dt); });
    var best = null, bd = 99; BUILDINGS.forEach(function(h){ var d2 = pos.angleTo(h.dir) * R; if(d2 < bd){ bd = d2; best = h; } }); var nn = (bd < 9.2 && !overview && !modal) ? best : null;
    if(nn !== near){ near = nn; $("kwVisit").hidden = !near; var ne = $("kwNear"); ne.hidden = !near; if(near){ var closed = near.acts && (st.p.off || {})[near.id]; ne.textContent = TT(near.n1) + (near.acts ? " · " + L("Tahap ", "Level ") + lvOf(near) : "") + (closed ? " 🔒" : ""); } if(!near && openB) closePop(); }
    BUILDINGS.forEach(function(h, i){ if(h.flag) h.flag.position.y = 7.9 + Math.sin(t * 2 + i) * 0.15; if(h.pop > 0){ h.pop = Math.max(0, h.pop - dt * 1.8); var live = liveActs(h); h.pearls.forEach(function(m, k){ var a = live[k], on = a && st.done[a.id]; m.scale.setScalar(0.34 * (on && h.pop > 0.2 ? 1 + Math.sin(h.pop * Math.PI) * 0.6 : 1)); }); } });
    for(var bi = bursts.length - 1; bi >= 0; bi--){ var bb = bursts[bi]; bb.t += dt; bb.v.addScaledVector(tmp.copy(bb.m.position).normalize(), -9 * dt); bb.m.position.addScaledVector(bb.v, dt); bb.m.scale.setScalar(Math.max(0.01, 0.26 * (1 - bb.t / 1.6))); if(bb.t > 1.6){ scene.remove(bb.m); bursts.splice(bi, 1); } }
    tick(t); }
  function frame(now){ if(stopped) return; if(!document.body.contains(stage)){ api.stop(); return; } raf = requestAnimationFrame(frame); if(paused) return; var t = now / 1000, dt = Math.min(0.05, (t - last) || 0.016); last = t; step(dt, t); renderer.render(scene, camera); }
  up.copy(pos); camP.copy(pos).multiplyScalar(R + 12.5).addScaledVector(fwd, -17);
  var vis = function(){ paused = document.hidden; last = 0; }; document.addEventListener("visibilitychange", vis);
  raf = requestAnimationFrame(frame);
  var api = {stop:function(){ stopped = true; if(raf) cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); document.removeEventListener("visibilitychange", vis); if(ro) ro.disconnect(); if(pctx.onStop){ try{ pctx.onStop(); }catch(e){} } save();
      try{ scene.traverse(function(o){ if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } }); renderer.dispose(); if(renderer.forceContextLoss) renderer.forceContextLoss(); }catch(e){} K.cur = null; },
    state:function(){ return st; }, parent:showParent, tower:showTower, openHouse:function(id){ var h = BUILDINGS.filter(function(x){ return x.id === id; })[0]; if(h) showPop(h); }, play:playAct};
  K.cur = api; return api;
};
})();
