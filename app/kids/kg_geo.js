/* My Ihsan 0.7.93 · Kids › 🌍 Cities & countries: 🏳 Guess the flag (a waving 3D flag, pick then type) and 🗺 Where is it? (an empty map or globe: tap where a capital or country is).
   Data: kg_geo_data.js (KG_GEO.c rows, KG_GEO.land outline). Levels: ASEAN · OIC · Asia · Europe · Africa · Americas · Oceania · World. */
(function(){ "use strict";
var KG = window.KG, G = window.KG_GEO, T = window.THREE;
var LV = [["asean","🇲🇾","ASEAN","ASEAN"],["oic","🕌","OIC","OIC"],["Asia","🌏","Asia","Asia"],["Europe","🏰","Eropah","Europe"],["Africa","🦁","Afrika","Africa"],["Americas","🗽","Amerika","Americas"],["Oceania","🏝","Oceania","Oceania"],["world","🌍","Dunia","World"]];
var ASEAN = ["MY","SG","ID","BN","TH","PH","VN","KH","LA","MM","TL"];
function C(r){ return {iso: r[0], flag: r[1], ms: r[2], en: r[3], ar: r[4], cap: r[5], capMs: r[6], lat: r[7], lon: r[8], reg: r[9], oic: !!r[10], clat: r[11], clon: r[12]}; }
function pool(lv){ return G.c.map(C).filter(function(c){ return lv === "world" ? true : lv === "asean" ? ASEAN.indexOf(c.iso) >= 0 : lv === "oic" ? c.oic : c.reg === lv; }); }
function norm(s){ return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9؀-ۿ]+/g, ""); }
function km(a1, o1, a2, o2){ var r = Math.PI / 180, d = Math.sin((a2 - a1) * r / 2), e = Math.sin((o2 - o1) * r / 2), h = d * d + Math.cos(a1 * r) * Math.cos(a2 * r) * e * e; return Math.round(12742 * Math.asin(Math.min(1, Math.sqrt(h)))); }
KG.geo = {pool: pool, km: km, norm: norm};
function lvBar(ctx, cur, cb){ return '<div class="kgLv">' + LV.map(function(l){ return '<button class="chip' + (l[0] === cur ? " on" : "") + '" data-lv="' + l[0] + '">' + l[1] + ' ' + ctx.E(ctx.L(l[2], l[3])) + '</button>'; }).join("") + '</div>'; }

// ---------- 🏳 Guess the flag ----------
function flagTex(emoji){ var c = document.createElement("canvas"); c.width = 512; c.height = 352; var g = c.getContext("2d"); g.fillStyle = "#eef2f6"; g.fillRect(0, 0, 512, 352);
  g.font = "300px 'Noto Color Emoji','Apple Color Emoji','Segoe UI Emoji',sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.save(); g.translate(256, 190); g.scale(1.62, 1.4); g.fillText(emoji, 0, 0); g.restore(); return c; }
function flag3d(host){ if(!T){ host.innerHTML = '<div class="kgFlat"></div>'; return {set: function(e){ host.querySelector(".kgFlat").textContent = e; }, stop: function(){}}; }
  var w = host.clientWidth || 320, h = Math.round(w * 0.62), r = new T.WebGLRenderer({antialias: true, alpha: true}); r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.setSize(w, h); host.appendChild(r.domElement);
  var sc = new T.Scene(), cam = new T.PerspectiveCamera(38, w / h, 0.1, 50); cam.position.set(0, 0, 5.2);
  sc.add(new T.AmbientLight(0xffffff, 1.6)); var dl = new T.DirectionalLight(0xffffff, 1.6); dl.position.set(2, 3, 4); sc.add(dl);
  var geo = new T.PlaneGeometry(3.4, 2.34, 40, 20), tex = new T.CanvasTexture(flagTex("🏳")); if(T.SRGBColorSpace) tex.colorSpace = T.SRGBColorSpace;
  var mat = new T.MeshStandardMaterial({map: tex, side: T.DoubleSide, roughness: .7}), m = new T.Mesh(geo, mat); sc.add(m);
  var pole = new T.Mesh(new T.CylinderGeometry(.05, .05, 4, 12), new T.MeshStandardMaterial({color: 0xb8a070, metalness: .6, roughness: .3})); pole.position.set(-1.75, -0.6, 0); sc.add(pole);
  var base = geo.attributes.position.array.slice(), t0 = performance.now(), raf = 0, spin = 0, alive = true;
  var loop = function(){ if(!alive) return; var t = (performance.now() - t0) / 1000, p = geo.attributes.position.array;
    for(var i = 0; i < p.length; i += 3){ var x = base[i], k = (x + 1.7) / 3.4; p[i + 2] = Math.sin(x * 2.2 - t * 4) * 0.18 * k + Math.sin(base[i + 1] * 1.5 + t * 2) * 0.05 * k; }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); spin += (0 - spin) * 0.06; m.rotation.y = spin + Math.sin(t * 0.7) * 0.25; pole.rotation.y = m.rotation.y;
    r.render(sc, cam); raf = requestAnimationFrame(loop); };
  loop();
  return {set: function(e){ tex.image = flagTex(e); tex.needsUpdate = true; spin = Math.PI * 2; }, stop: function(){ alive = false; cancelAnimationFrame(raf); try{ r.dispose(); geo.dispose(); tex.dispose(); }catch(e){} }}; }
KG.reg.flag = {hub: "geo", o: 1, ic: "🏳", ms: "Teka bendera", en: "Guess the flag", dms: "Pilih, kemudian taip", den: "Pick, then type", run: function(host, ctx){
  var st = ctx.get("flag"), lv = st.lv || "asean", mode = st.mode || "pick", fl = null, Q = null, qi = 0, score = 0, list = [];
  var start = function(){ var P = pool(lv); list = ctx.shuffle(P).slice(0, Math.min(10, P.length)); qi = 0; score = 0; draw(); };
  var draw = function(){ if(fl){ fl.stop(); fl = null; } var P = pool(lv);
    if(qi >= list.length){ var b = st["b_" + lv] || 0; if(score > b){ st["b_" + lv] = score; st.best = score + "/" + list.length; } ctx.put("flag", st); ctx.star(score >= list.length - 1 ? 3 : score >= list.length / 2 ? 2 : 1); if(score === list.length) ctx.confetti(host);
      host.innerHTML = lvBar(ctx, lv) + '<div class="kgEnd"><div class="kgBig">' + score + '/' + list.length + '</div><div>' + (score === list.length ? "🌟 " + ctx.L("Hebat! Semua betul!", "Brilliant! All right!") : "👍 " + ctx.L("Bagus! Cuba lagi?", "Nice! Again?")) + '</div><button class="btn gold" id="fgA">🔁 ' + ctx.L("Main lagi", "Play again") + '</button></div>'; bind(); host.querySelector("#fgA").onclick = start; return; }
    Q = list[qi]; var opts = ctx.shuffle([Q].concat(ctx.shuffle(P.filter(function(c){ return c.iso !== Q.iso; })).slice(0, 3)));
    host.innerHTML = lvBar(ctx, lv) + '<div class="kgMode"><button class="chip' + (mode === "pick" ? " on" : "") + '" data-md="pick">👆 ' + ctx.L("Pilih", "Pick") + '</button><button class="chip' + (mode === "type" ? " on" : "") + '" data-md="type">⌨️ ' + ctx.L("Taip", "Type") + '</button><span class="kgQn">' + (qi + 1) + '/' + list.length + ' · ✓ ' + score + '</span></div>' +
      '<div class="kgFlag" id="fgF"></div>' + (mode === "pick" ? '<div class="kgOpts">' + opts.map(function(o){ return '<button class="btn alt" data-fo="' + o.iso + '">' + ctx.E(ctx.L(o.ms, o.en)) + '</button>'; }).join("") + '</div>'
      : '<div class="kgType"><input class="rin" id="fgT" autocomplete="off" placeholder="' + ctx.E(ctx.L("Nama negara…", "Country name…")) + '"><button class="btn gold" id="fgGo">' + ctx.L("Jawab", "Answer") + '</button></div><div class="mut tiny">' + ctx.L("Petunjuk: ", "Hint: ") + ctx.E(ctx.L(Q.ms, Q.en).charAt(0)) + '… (' + ctx.L(Q.ms, Q.en).length + ')</div>') + '<div id="fgR"></div>';
    bind(); fl = flag3d(host.querySelector("#fgF")); fl.set(Q.flag);
    var answer = function(ok, btn){ if(Q.done) return; Q.done = 1; if(ok){ score++; ctx.vib(25); } else ctx.vib([30, 40, 30]);
      host.querySelectorAll("[data-fo]").forEach(function(b){ var c = b.getAttribute("data-fo"); b.classList.add(c === Q.iso ? "ok" : b === btn ? "no" : "dim"); });
      host.querySelector("#fgR").innerHTML = '<div class="kgFact ' + (ok ? "ok" : "no") + '"><b>' + (ok ? "✓ " : "✗ ") + ctx.E(ctx.L(Q.ms, Q.en)) + '</b> <span dir="rtl">' + ctx.E(Q.ar) + '</span><div>🏛 ' + ctx.L("Ibu negara: ", "Capital: ") + ctx.E(ctx.L(Q.capMs, Q.cap)) + (Q.oic ? ' · 🕌 ' + ctx.L("Anggota OIC", "OIC member") : '') + '</div></div><button class="btn gold full" id="fgN">' + ctx.L("Seterusnya", "Next") + ' ›</button>';
      host.querySelector("#fgN").onclick = function(){ qi++; draw(); }; };
    host.querySelectorAll("[data-fo]").forEach(function(b){ b.onclick = function(){ answer(b.getAttribute("data-fo") === Q.iso, b); }; });
    var ti = host.querySelector("#fgT"); if(ti){ var sub = function(){ var v = ctx.geoNorm(ti.value); if(!v) return; answer([Q.ms, Q.en, Q.ar].some(function(n){ return ctx.geoNorm(n) === v; })); }; host.querySelector("#fgGo").onclick = sub; ti.onkeydown = function(e){ if(e.key === "Enter") sub(); }; }
  };
  var bind = function(){ host.querySelectorAll("[data-lv]").forEach(function(b){ b.onclick = function(){ lv = st.lv = b.getAttribute("data-lv"); ctx.put("flag", st); start(); }; });
    host.querySelectorAll("[data-md]").forEach(function(b){ b.onclick = function(){ mode = st.mode = b.getAttribute("data-md"); ctx.put("flag", st); Q.done = 0; var keep = qi; draw(); qi = keep; }; }); };
  ctx.geoNorm = norm; start();
  return {stop: function(){ if(fl) fl.stop(); }}; }};

// ---------- 🗺 Where is it? (map / globe) ----------
var BOX = {asean: [-12, 92, 25, 142], oic: [-15, -20, 50, 100], Asia: [-12, 25, 60, 150], Europe: [34, -25, 71, 45], Africa: [-36, -20, 38, 52], Americas: [-56, -170, 72, -30], Oceania: [-48, 110, 5, 180], world: [-60, -180, 80, 180]};
function landCanvas(w, h, ocean, land, grid){ var c = document.createElement("canvas"); c.width = w; c.height = h; var g = c.getContext("2d"); g.fillStyle = ocean; g.fillRect(0, 0, w, h);
  if(grid){ g.strokeStyle = grid; g.lineWidth = 1; for(var lo = -180; lo <= 180; lo += 30){ var x = (lo + 180) / 360 * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for(var la = -60; la <= 60; la += 30){ var y = (90 - la) / 180 * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }
  g.fillStyle = land; G.land.forEach(function(r){ g.beginPath(); for(var i = 0; i < r.length; i += 2){ var x = (r[i] + 180) / 360 * w, y = (90 - r[i + 1]) / 180 * h; if(i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); g.fill(); }); return c; }
function mapView(host, box, onTap){ // flat map with drag-to-pan and +/- zoom; tap → (lat, lon)
  var cv = document.createElement("canvas"), W = host.clientWidth || 340, Hh = Math.round(W * 0.66), dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = W * dpr; cv.height = Hh * dpr; cv.style.width = W + "px"; cv.style.height = Hh + "px"; cv.className = "kgMap"; host.appendChild(cv);
  var base = landCanvas(2048, 1024, "#bfe3f5", "#7bc47f", "rgba(255,255,255,.5)"), g = cv.getContext("2d"), marks = [];
  var v = {cx: (box[1] + box[3]) / 2, cy: (box[0] + box[2]) / 2, s: Math.min(W / ((box[3] - box[1]) || 1), Hh / ((box[2] - box[0]) || 1))}; // s = px per degree
  var toXY = function(la, lo){ return [W / 2 + (lo - v.cx) * v.s, Hh / 2 - (la - v.cy) * v.s]; }, toLL = function(x, y){ return [v.cy - (y - Hh / 2) / v.s, v.cx + (x - W / 2) / v.s]; };
  var draw = function(){ g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = "#bfe3f5"; g.fillRect(0, 0, W, Hh); var tl = toXY(90, -180), br = toXY(-90, 180); g.imageSmoothingEnabled = true; g.drawImage(base, tl[0], tl[1], br[0] - tl[0], br[1] - tl[1]);
    marks.forEach(function(m){ if(m.line){ var a = toXY(m.line[0], m.line[1]), b = toXY(m.line[2], m.line[3]); g.strokeStyle = "#e0605a"; g.setLineDash([5, 4]); g.lineWidth = 2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.setLineDash([]); return; }
      var p = toXY(m.la, m.lo); g.fillStyle = m.c; g.strokeStyle = "#fff"; g.lineWidth = 2; g.beginPath(); g.arc(p[0], p[1], 7, 0, 7); g.fill(); g.stroke(); if(m.t){ g.font = "bold 12px sans-serif"; g.fillStyle = "#123"; g.fillText(m.t, p[0] + 9, p[1] - 8); } }); };
  var x0 = 0, y0 = 0, moved = 0, down = false, pts = {}, pd0 = 0, s0 = 0;
  cv.addEventListener("pointerdown", function(e){ cv.setPointerCapture(e.pointerId); pts[e.pointerId] = [e.offsetX, e.offsetY]; down = true; moved = 0; x0 = e.offsetX; y0 = e.offsetY; var k = Object.keys(pts); if(k.length === 2){ var a = pts[k[0]], b = pts[k[1]]; pd0 = Math.hypot(a[0] - b[0], a[1] - b[1]); s0 = v.s; } });
  cv.addEventListener("pointermove", function(e){ if(!down) return; var k = Object.keys(pts), prev = pts[e.pointerId]; if(!prev) return; pts[e.pointerId] = [e.offsetX, e.offsetY];
    if(k.length === 2){ var a = pts[k[0]], b = pts[k[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if(pd0) v.s = Math.max(W / 360, Math.min(W / 4, s0 * d / pd0)); moved = 99; draw(); return; }
    var dx = e.offsetX - prev[0], dy = e.offsetY - prev[1]; moved += Math.abs(dx) + Math.abs(dy); v.cx -= dx / v.s; v.cy += dy / v.s; v.cy = Math.max(-80, Math.min(85, v.cy)); draw(); });
  var up = function(e){ var k = Object.keys(pts).length; delete pts[e.pointerId]; if(k === 1 && moved < 8 && down){ var ll = toLL(e.offsetX, e.offsetY); onTap(ll[0], ll[1]); } if(!Object.keys(pts).length) down = false; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", function(e){ delete pts[e.pointerId]; down = false; });
  var zb = document.createElement("div"); zb.className = "kgZoom"; zb.innerHTML = '<button data-z="1.5">＋</button><button data-z="0.667">−</button>'; host.appendChild(zb);
  zb.querySelectorAll("[data-z]").forEach(function(b){ b.onclick = function(){ v.s = Math.max(W / 360, Math.min(W / 4, v.s * +b.getAttribute("data-z"))); draw(); }; });
  draw();
  return {mark: function(m){ marks.push(m); draw(); }, clear: function(){ marks = []; draw(); }, fit: function(bx){ v.cx = (bx[1] + bx[3]) / 2; v.cy = (bx[0] + bx[2]) / 2; v.s = Math.min(W / ((bx[3] - bx[1]) || 1), Hh / ((bx[2] - bx[0]) || 1)); draw(); }, stop: function(){}, tap: function(la, lo){ onTap(la, lo); }}; }
function globeView(host, box, onTap){ if(!T) return mapView(host, box, onTap);
  var W = host.clientWidth || 340, Hh = Math.round(W * 0.9), r = new T.WebGLRenderer({antialias: true, alpha: true}); r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.setSize(W, Hh); r.domElement.className = "kgGlobe"; host.appendChild(r.domElement);
  var sc = new T.Scene(), cam = new T.PerspectiveCamera(40, W / Hh, 0.1, 50); cam.position.set(0, 0, 3.4); sc.add(new T.AmbientLight(0xffffff, 1.5)); var dl = new T.DirectionalLight(0xffffff, 1.4); dl.position.set(3, 2, 4); sc.add(dl);
  var tex = new T.CanvasTexture(landCanvas(2048, 1024, "#3d8fd1", "#6dbb6f", "rgba(255,255,255,.25)")); if(T.SRGBColorSpace) tex.colorSpace = T.SRGBColorSpace;
  var globe = new T.Group(); sc.add(globe); var earth = new T.Mesh(new T.SphereGeometry(1, 64, 48), new T.MeshStandardMaterial({map: tex, roughness: .85})); globe.add(earth);
  var pos = function(la, lo, rr){ var ph = (lo + 180) / 360 * Math.PI * 2, t = la * Math.PI / 180; rr = rr || 1.01; return new T.Vector3(-rr * Math.cos(ph) * Math.cos(t), rr * Math.sin(t), rr * Math.sin(ph) * Math.cos(t)); };
  // a point at longitude lo sits at angle ph from -x towards +z; yaw π/2 − ph brings it to +z (the camera), then pitch by its latitude
  var look = function(la, lo){ var ph = (lo + 180) / 360 * Math.PI * 2; globe.rotation.order = "XYZ"; globe.rotation.y = Math.PI / 2 - ph; globe.rotation.x = la * Math.PI / 180; };
  look((box[0] + box[2]) / 2, (box[1] + box[3]) / 2);
  var marks = new T.Group(); globe.add(marks); var raf = 0, alive = true;
  var loop = function(){ if(!alive) return; r.render(sc, cam); raf = requestAnimationFrame(loop); }; loop();
  var ray = new T.Raycaster(), down = null, moved = 0, pts = {}, pd0 = 0, z0 = 3.4;
  var cvs = r.domElement;
  cvs.addEventListener("pointerdown", function(e){ cvs.setPointerCapture(e.pointerId); pts[e.pointerId] = [e.offsetX, e.offsetY]; down = [e.offsetX, e.offsetY]; moved = 0; var k = Object.keys(pts); if(k.length === 2){ var a = pts[k[0]], b = pts[k[1]]; pd0 = Math.hypot(a[0] - b[0], a[1] - b[1]); z0 = cam.position.z; } });
  cvs.addEventListener("pointermove", function(e){ var prev = pts[e.pointerId]; if(!prev || !down) return; pts[e.pointerId] = [e.offsetX, e.offsetY]; var k = Object.keys(pts);
    if(k.length === 2){ var a = pts[k[0]], b = pts[k[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if(pd0) cam.position.z = Math.max(1.3, Math.min(6, z0 * pd0 / d)); moved = 99; return; }
    var dx = e.offsetX - prev[0], dy = e.offsetY - prev[1], k2 = (cam.position.z - 1) / 3.4 * 0.012; moved += Math.abs(dx) + Math.abs(dy); globe.rotation.y += dx * k2; globe.rotation.x = Math.max(-1.4, Math.min(1.4, globe.rotation.x + dy * k2)); });
  cvs.addEventListener("pointerup", function(e){ var k = Object.keys(pts).length; delete pts[e.pointerId]; if(k === 1 && moved < 8){ var rc = cvs.getBoundingClientRect(), nv = new T.Vector2(e.offsetX / rc.width * 2 - 1, -(e.offsetY / rc.height) * 2 + 1); ray.setFromCamera(nv, cam); var hit = ray.intersectObject(earth)[0];
      if(hit){ var p = earth.worldToLocal(hit.point.clone()).normalize(), la = Math.asin(p.y) * 180 / Math.PI, ph = Math.atan2(p.z, -p.x); if(ph < 0) ph += Math.PI * 2; onTap(la, ph / (Math.PI * 2) * 360 - 180); } } if(!Object.keys(pts).length) down = null; });
  var zb = document.createElement("div"); zb.className = "kgZoom"; zb.innerHTML = '<button data-z="0.8">＋</button><button data-z="1.25">−</button>'; host.appendChild(zb);
  zb.querySelectorAll("[data-z]").forEach(function(b){ b.onclick = function(){ cam.position.z = Math.max(1.3, Math.min(6, cam.position.z * +b.getAttribute("data-z"))); }; });
  return {mark: function(m){ if(m.line){ var g = new T.BufferGeometry().setFromPoints([0, .25, .5, .75, 1].map(function(f){ var a = pos(m.line[0], m.line[1]), b = pos(m.line[2], m.line[3]); return a.clone().lerp(b, f).normalize().multiplyScalar(1.015); })); marks.add(new T.Line(g, new T.LineBasicMaterial({color: 0xe0605a}))); return; }
      var s = new T.Mesh(new T.SphereGeometry(.028, 12, 10), new T.MeshBasicMaterial({color: m.c})); s.position.copy(pos(m.la, m.lo)); marks.add(s); },
    clear: function(){ while(marks.children.length) marks.remove(marks.children[0]); }, fit: function(bx){ look((bx[0] + bx[2]) / 2, (bx[1] + bx[3]) / 2); }, look: look,
    stop: function(){ alive = false; cancelAnimationFrame(raf); try{ r.dispose(); tex.dispose(); }catch(e){} }, tap: function(la, lo){ onTap(la, lo); }, pos: pos, globe: globe}; }
KG.reg.mapq = {hub: "geo", o: 2, ic: "🗺", ms: "Di mana?", en: "Where is it?", dms: "Peta atau glob", den: "Map or globe", run: function(host, ctx){
  var st = ctx.get("mapq"), lv = st.lv || "asean", view = st.view || "map", what = st.what || "city", W = null, list = [], qi = 0, pts = 0, Q = null;
  var start = function(){ var P = pool(lv); list = ctx.shuffle(P).slice(0, Math.min(10, P.length)); qi = 0; pts = 0; draw(); };
  var draw = function(){ if(W){ W.stop(); W = null; }
    if(qi >= list.length){ var avg = Math.round(pts / list.length); if(avg > (st["b_" + lv] || 0)){ st["b_" + lv] = avg; st.best = avg + "%"; } ctx.put("mapq", st); ctx.star(avg >= 80 ? 3 : avg >= 50 ? 2 : 1); if(avg >= 90) ctx.confetti(host);
      host.innerHTML = top() + '<div class="kgEnd"><div class="kgBig">' + avg + '%</div><div>' + ctx.L("Purata ketepatan", "Average accuracy") + '</div><button class="btn gold" id="mqA">🔁 ' + ctx.L("Main lagi", "Play again") + '</button></div>'; bind(); host.querySelector("#mqA").onclick = start; return; }
    Q = list[qi]; var nm = what === "city" ? ctx.L(Q.capMs, Q.cap) + " (" + ctx.L(Q.ms, Q.en) + ")" : ctx.L(Q.ms, Q.en);
    host.innerHTML = top() + '<div class="kgAsk">📍 ' + ctx.L("Di manakah ", "Where is ") + '<b>' + ctx.E(nm) + '</b>? <span class="kgQn">' + (qi + 1) + '/' + list.length + '</span></div><div class="kgMapW" id="mqW"></div><div id="mqR" class="mut small">' + ctx.L("Seret untuk gerak, ＋ − untuk zum, ketik untuk jawab.", "Drag to move, ＋ − to zoom, tap to answer.") + '</div>';
    bind(); var box = BOX[lv] || BOX.world;
    W = (view === "globe" ? globeView : mapView)(host.querySelector("#mqW"), box, function(la, lo){ if(Q.done) return; Q.done = 1; var tla = what === "city" ? Q.lat : Q.clat, tlo = what === "city" ? Q.lon : Q.clon, d = km(la, lo, tla, tlo), full = what === "city" ? 150 : 500, zero = what === "city" ? 2500 : 3500, sc = d <= full ? 100 : Math.max(0, Math.round(100 * (zero - d) / (zero - full)));
      pts += sc; W.mark({la: la, lo: lo, c: "#e0605a"}); W.mark({line: [la, lo, tla, tlo]}); W.mark({la: tla, lo: tlo, c: "#2e9e5b", t: what === "city" ? Q.cap : Q.en}); ctx.vib(sc >= 70 ? 25 : [30, 40, 30]);
      host.querySelector("#mqR").innerHTML = '<div class="kgFact ' + (sc >= 70 ? "ok" : sc >= 30 ? "" : "no") + '"><b>' + (sc >= 90 ? "🎯 " : sc >= 50 ? "👍 " : "🙂 ") + d.toLocaleString() + ' km</b> · ' + sc + ' ' + ctx.L("mata", "points") + '<div>' + Q.flag + ' ' + ctx.E(ctx.L(Q.ms, Q.en)) + ' · 🏛 ' + ctx.E(ctx.L(Q.capMs, Q.cap)) + (Q.oic ? ' · 🕌 OIC' : '') + '</div></div><button class="btn gold full" id="mqN">' + ctx.L("Seterusnya", "Next") + ' ›</button>';
      host.querySelector("#mqN").onclick = function(){ qi++; draw(); }; });
    ctx.mapW = W; };
  var top = function(){ return lvBar(ctx, lv) + '<div class="kgMode"><button class="chip' + (view === "map" ? " on" : "") + '" data-vw="map">🗺 ' + ctx.L("Peta", "Map") + '</button><button class="chip' + (view === "globe" ? " on" : "") + '" data-vw="globe">🌐 ' + ctx.L("Glob", "Globe") + '</button><button class="chip' + (what === "city" ? " on" : "") + '" data-wh="city">🏛 ' + ctx.L("Ibu negara", "Capital") + '</button><button class="chip' + (what === "country" ? " on" : "") + '" data-wh="country">🏳 ' + ctx.L("Negara", "Country") + '</button></div>'; };
  var bind = function(){ host.querySelectorAll("[data-lv]").forEach(function(b){ b.onclick = function(){ lv = st.lv = b.getAttribute("data-lv"); ctx.put("mapq", st); start(); }; });
    host.querySelectorAll("[data-vw]").forEach(function(b){ b.onclick = function(){ view = st.view = b.getAttribute("data-vw"); ctx.put("mapq", st); if(Q) Q.done = 0; draw(); }; });
    host.querySelectorAll("[data-wh]").forEach(function(b){ b.onclick = function(){ what = st.what = b.getAttribute("data-wh"); ctx.put("mapq", st); if(Q) Q.done = 0; draw(); }; }); };
  start();
  return {stop: function(){ if(W) W.stop(); }}; }};
})();
