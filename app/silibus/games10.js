/* My Ihsan 0.5.59 · Silibus 🎮 Main: ten fully shaded three.js answer games (owner request: "make answering much more fun").
   🏹 Memanah · ⚽ Sepakan Penalti · 🫧 Pecah Gelembung · 🏃 Lari Syiling · 🚀 Pelancaran Roket · 🕌 Bina Masjidku
   🌱 Taman Ajaib · 🔮 Guli Maze · 🏎️ Kart Kuiz · 🏝️ Pulau Harta Karun.
   Every game uses the same questions and the engine's own card (games.js ask()): marking and progress are the engine's.
   When a question is multiple choice or true/false with short options, the options become things in the 3D scene (targets,
   goal zones, bubbles, gates, track branches...): tapping one presses the matching option button on the card. Other question
   types are answered on the card and the scene reacts. Built from primitives only (no model or image files, no drawings of
   prophets); shadows, ACES tone mapping and standard/physical materials; a lighter mode on small phones; without WebGL the
   picker hides these games. Loaded after games.js; uses its helpers through GAMES._k. */
(function(){
"use strict";
var T = null, K = null;
function esc(x){ return String(x == null ? "" : x).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
function L(ms, en){ return (typeof BAHASA !== "undefined" && BAHASA === "en") || /[?&]ui=en/.test(location.search) ? en : ms; }
function webgl(){ try{ var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }catch(e){ return false; } }
function lowEnd(){ return (navigator.hardwareConcurrency || 4) <= 4 || Math.min(screen.width, screen.height) < 360; }
var rnd = Math.random, PI = Math.PI;
function ease(k){ return k < 0.5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2)/2; }
function out(k){ return 1 - Math.pow(1 - k, 3); }

// ================= toolkit =================
function mat(c, o){ o = o || {}; var M = o.phys ? T.MeshPhysicalMaterial : T.MeshStandardMaterial;
  var m = new M({color: c, roughness: o.r == null ? 0.6 : o.r, metalness: o.m || 0, emissive: o.e || 0, emissiveIntensity: o.ei || 1, transparent: !!o.t, opacity: o.op == null ? 1 : o.op, flatShading: !!o.flat, side: o.ds ? T.DoubleSide : T.FrontSide});
  if(o.phys){ m.clearcoat = o.cc == null ? 1 : o.cc; m.clearcoatRoughness = 0.1; if(o.ir){ m.iridescence = 1; m.iridescenceIOR = 1.3; } } return m; }
function mesh(g, m, sh){ var x = new T.Mesh(g, m); x.castShadow = sh !== false; x.receiveShadow = true; return x; }
function box(w, h, d, c, o){ return mesh(new T.BoxGeometry(w, h, d), mat(c, o)); }
function cyl(rt, rb, h, c, s, o){ return mesh(new T.CylinderGeometry(rt, rb, h, s || 24), mat(c, o)); }
function ball(r, c, o, s){ return mesh(new T.SphereGeometry(r, s || 32, Math.round((s || 32)*0.75)), mat(c, o)); }
function cone(r, h, c, s, o){ return mesh(new T.ConeGeometry(r, h, s || 24), mat(c, o)); }
function torus(r, t, c, o){ return mesh(new T.TorusGeometry(r, t, 16, 48), mat(c, o)); }
function at(o, x, y, z){ o.position.set(x || 0, y || 0, z || 0); return o; }
function grp(){ var g = new T.Group(); for(var i = 0; i < arguments.length; i++) g.add(arguments[i]); return g; }
function emojiTex(e, px){ px = px || 128; var cv = document.createElement("canvas"); cv.width = cv.height = px; var cx = cv.getContext("2d"); cx.font = Math.round(px*0.8) + "px serif"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(e, px/2, px*0.55);
  var t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; return t; }
function emo(e, s){ var sp = new T.Sprite(new T.SpriteMaterial({map: emojiTex(e), transparent: true})); sp.scale.set(s || 1, s || 1, 1); return sp; }
// a readable answer label (canvas text on a rounded tile); .set(text, colours) redraws
function label(w, h, txt, o){ o = o || {}; var cv = document.createElement("canvas"); cv.width = 512; cv.height = Math.round(512*h/w); var tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
  var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false, side: T.DoubleSide}));
  m.set = function(t, fg, bg, edge){ m.txt = t; var cx = cv.getContext("2d"), W = cv.width, H = cv.height, r = H*0.28; cx.clearRect(0, 0, W, H);
    cx.fillStyle = bg || "rgba(255,255,255,0.94)"; cx.beginPath(); cx.moveTo(r, 4); cx.arcTo(W-4, 4, W-4, H-4, r); cx.arcTo(W-4, H-4, 4, H-4, r); cx.arcTo(4, H-4, 4, 4, r); cx.arcTo(4, 4, W-4, 4, r); cx.closePath(); cx.fill();
    if(edge){ cx.lineWidth = 10; cx.strokeStyle = edge; cx.stroke(); }
    cx.fillStyle = fg || "#1b2238"; cx.textAlign = "center"; cx.textBaseline = "middle"; var sz = Math.round(H*0.5), f = function(){ cx.font = "bold " + sz + "px system-ui, 'Noto Naskh Arabic', sans-serif"; }; f();
    while(cx.measureText(t).width > W*0.9 && sz > 14){ sz -= 3; f(); } cx.fillText(t, W/2, H/2 + 2); tex.needsUpdate = true; };
  m.set(txt || "", o.fg, o.bg, o.edge); m.renderOrder = 5; return m; }
function skyTex(stops){ var cv = document.createElement("canvas"); cv.width = 4; cv.height = 512; var cx = cv.getContext("2d"), gr = cx.createLinearGradient(0, 0, 0, 512);
  stops.forEach(function(s, i){ if(typeof s === "string") s = [s]; gr.addColorStop(s[1] == null ? i/(stops.length - 1) : s[1], s[0]); }); cx.fillStyle = gr; cx.fillRect(0, 0, 4, 512); var t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; return t; }
function stars(n, r, size){ var g = new T.BufferGeometry(), p = new Float32Array(n*3); for(var i = 0; i < n; i++){ var u = rnd()*2*PI, v = Math.acos(2*rnd() - 1); p[i*3] = r*Math.sin(v)*Math.cos(u); p[i*3+1] = Math.abs(r*Math.cos(v)); p[i*3+2] = r*Math.sin(v)*Math.sin(u); }
  g.setAttribute("position", new T.BufferAttribute(p, 3)); return new T.Points(g, new T.PointsMaterial({size: size || 0.4, color: 0xffffff, sizeAttenuation: true, transparent: true, opacity: 0.9})); }

function kit(host, o){
  o = o || {}; var low = lowEnd(), wrap = document.createElement("div"); wrap.className = "g10stage"; host.innerHTML = ""; host.appendChild(wrap);
  var r = new T.WebGLRenderer({antialias: !low, powerPreference: "high-performance"}); r.setPixelRatio(Math.min(low ? 1.25 : 2, window.devicePixelRatio || 1));
  r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = o.exposure || 1.05;
  r.shadowMap.enabled = !low; r.shadowMap.type = T.PCFSoftShadowMap; wrap.appendChild(r.domElement);
  var scene = new T.Scene(), cam = new T.PerspectiveCamera(o.fov || 50, 1, 0.1, 400);
  scene.background = skyTex(o.sky || ["#7ec8ff", "#d8f1ff"]); if(o.fog) scene.fog = new T.Fog(o.fog[0], o.fog[1], o.fog[2]);
  var hemi = new T.HemisphereLight(o.skyCol || 0xcfe8ff, o.groundCol || 0x4a5a3a, o.hemi == null ? 0.75 : o.hemi); scene.add(hemi);
  var sun = new T.DirectionalLight(o.sunCol || 0xfff1d6, o.sun == null ? 2.2 : o.sun); sun.position.set(o.sunPos ? o.sunPos[0] : 6, o.sunPos ? o.sunPos[1] : 12, o.sunPos ? o.sunPos[2] : 8);
  sun.castShadow = !low; sun.shadow.mapSize.set(1024, 1024); var sc = sun.shadow.camera, ext = o.shadowExt || 14; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 0.5; sc.far = 60; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; scene.add(sun); scene.add(sun.target);
  cam.position.set.apply(cam.position, o.cam || [0, 4, 10]); var look = new T.Vector3().fromArray(o.look || [0, 1, 0]), camGoal = null, lookGoal = null, ticks = [], anims = [], alive = true, shake = 0;
  var size = function(){ var w = Math.max(1, wrap.clientWidth), h = Math.max(1, wrap.clientHeight); r.setSize(w, h, false); r.domElement.style.width = "100%"; r.domElement.style.height = "100%"; cam.aspect = w/h; cam.updateProjectionMatrix(); };
  var ro = window.ResizeObserver ? new ResizeObserver(size) : null; if(ro) ro.observe(wrap); else window.addEventListener("resize", size); size();
  var clock = new T.Clock();
  var loop = function(){ if(!alive) return; if(!wrap.isConnected){ dispose(); return; } requestAnimationFrame(loop); if(document.hidden) return;
    var dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
    ticks.forEach(function(f){ f(dt, t); }); var now = performance.now();
    var cur = anims, fin = []; anims = []; cur.forEach(function(a){ var k = Math.min(1, (now - a.t0)/a.ms); a.fn((a.e || ease)(k), k); if(k >= 1) fin.push(a); else anims.push(a); }); fin.forEach(function(a){ if(a.done) a.done(); });
    if(camGoal) cam.position.lerp(camGoal, 0.05); if(lookGoal) look.lerp(lookGoal, 0.07); cam.lookAt(look);
    if(shake > 0){ cam.position.x += (rnd() - 0.5)*shake; cam.position.y += (rnd() - 0.5)*shake; shake *= 0.86; if(shake < 0.003) shake = 0; }
    r.render(scene, cam); };
  var dispose = function(){ alive = false; if(ro) ro.disconnect(); scene.traverse(function(x){ if(x.geometry) x.geometry.dispose(); if(x.material){ [].concat(x.material).forEach(function(m){ if(m.map) m.map.dispose(); m.dispose(); }); } }); if(scene.background && scene.background.dispose) scene.background.dispose(); r.dispose(); };
  // tap → the nearest object (or ancestor) with userData.pick
  var ray = new T.Raycaster(), nd = new T.Vector2(), pickers = [];
  r.domElement.addEventListener("pointerdown", function(e){ if(!pickers.length) return; var b = r.domElement.getBoundingClientRect(); nd.set((e.clientX - b.left)/b.width*2 - 1, -(e.clientY - b.top)/b.height*2 + 1); ray.setFromCamera(nd, cam);
    pickers.forEach(function(pk){ var hit = ray.intersectObjects(pk.list, true)[0];
      if(!hit){ var best = null, bd = 0.32; pk.list.forEach(function(o){ if(o.userData.pick == null || !o.parent) return; var v = o.getWorldPosition(new T.Vector3()).project(cam), dd = Math.hypot(v.x - nd.x, (v.y - nd.y)*cam.aspect*0.8); if(dd < bd){ bd = dd; best = o; } }); if(best){ pk.cb(best.userData.pick, best, null); } return; } var o2 = hit.object; while(o2 && o2.userData.pick == null) o2 = o2.parent; if(o2) pk.cb(o2.userData.pick, o2, hit.point); }); });
  requestAnimationFrame(loop);
  var S = {T: T, scene: scene, cam: cam, el: wrap, low: low, sun: sun, hemi: hemi,
    add: function(x){ scene.add(x); return x; }, tick: function(f){ ticks.push(f); },
    anim: function(ms, fn, done, e){ anims.push({t0: performance.now(), ms: ms, fn: fn, done: done, e: e}); },
    wait: function(ms, fn){ anims.push({t0: performance.now(), ms: ms, fn: function(){}, done: fn}); },
    camTo: function(p, l){ camGoal = new T.Vector3().fromArray(p); if(l) lookGoal = new T.Vector3().fromArray(l); },
    shake: function(a){ shake = a || 0.25; },
    pick: function(list, cb){ var pk = {list: list, cb: cb}; pickers.push(pk); return function(){ pickers = pickers.filter(function(x){ return x !== pk; }); }; },
    burst: function(pos, colors, n, spd, grav){ n = n || 90; var g = new T.BufferGeometry(), p = new Float32Array(n*3), c = new Float32Array(n*3), v = [], C = (colors || [0xffd400, 0xff2bd6, 0x39ff14, 0x00e5ff, 0xff7a00]).map(function(h){ return new T.Color(h); });
      for(var i = 0; i < n; i++){ p[i*3] = pos.x; p[i*3+1] = pos.y; p[i*3+2] = pos.z; var s = spd || 0.12; v.push(new T.Vector3((rnd() - 0.5)*s, rnd()*s*1.3 + s*0.4, (rnd() - 0.5)*s)); var cc = C[i % C.length]; c[i*3] = cc.r; c[i*3+1] = cc.g; c[i*3+2] = cc.b; }
      g.setAttribute("position", new T.BufferAttribute(p, 3)); g.setAttribute("color", new T.BufferAttribute(c, 3));
      var pts = new T.Points(g, new T.PointsMaterial({size: 0.14, vertexColors: true, transparent: true})); scene.add(pts); var life = 0;
      ticks.push(function f(){ if(life++ > 110){ scene.remove(pts); g.dispose(); pts.material.dispose(); ticks.splice(ticks.indexOf(f), 1); return; }
        for(var i = 0; i < n; i++){ v[i].y -= grav == null ? 0.004 : grav; p[i*3] += v[i].x; p[i*3+1] += v[i].y; p[i*3+2] += v[i].z; } g.attributes.position.needsUpdate = true; pts.material.opacity = 1 - life/110; }); },
    ground: function(c, size, y){ var gm = mesh(new T.PlaneGeometry(size || 80, size || 80), mat(c, {r: 0.95}), false); gm.rotation.x = -PI/2; gm.position.y = y || 0; gm.receiveShadow = true; scene.add(gm); return gm; },
    dispose: dispose};
  return S;
}

// common scenery
function tree(x, z, s, c){ s = s || 1; var g = grp(at(cyl(0.12*s, 0.18*s, 1*s, 0x7a4b2a, 8), 0, 0.5*s, 0), at(ball(0.7*s, c || 0x3fa34d, {r: 0.8, flat: true}, 10), 0, 1.45*s, 0), at(ball(0.5*s, c || 0x4cb85a, {r: 0.8, flat: true}, 10), 0.35*s, 1.85*s, 0.1*s)); return at(g, x, 0, z); }
function palm(x, z, s){ s = s || 1; var g = grp(); for(var i = 0; i < 6; i++){ var seg = at(cyl(0.11*s, 0.14*s, 0.5*s, 0x9c6b3c, 8), 0.06*s*i, 0.25*s + i*0.45*s, 0); seg.rotation.z = -0.06*i; g.add(seg); }
  for(var j = 0; j < 6; j++){ var lf = box(1.4*s, 0.04*s, 0.3*s, 0x2e9d4f, {r: 0.7}); lf.position.set(0.36*s + Math.cos(j/6*2*PI)*0.6*s, 2.9*s, Math.sin(j/6*2*PI)*0.6*s); lf.rotation.y = -j/6*2*PI; lf.rotation.z = -0.35; g.add(lf); }
  g.add(at(ball(0.13*s, 0x6b4423), 0.3*s, 2.75*s, 0.1*s)); return at(g, x, 0, z); }
function cloud(x, y, z, s){ var g = grp(); for(var i = 0; i < 4; i++) g.add(at(ball((0.8 + rnd()*0.5)*s, 0xffffff, {r: 1}, 14), i*0.9*s - 1.3*s, rnd()*0.3*s, rnd()*0.4*s)); g.traverse(function(o){ o.castShadow = false; }); return at(g, x, y, z); }
function person(c, skin, s){ s = s || 1; var g = grp(at(cyl(0.22*s, 0.28*s, 0.7*s, c, 16), 0, 0.55*s, 0), at(ball(0.2*s, skin || 0xf1c27d), 0, 1.1*s, 0), at(cyl(0.08*s, 0.08*s, 0.4*s, 0x24305e, 8), -0.1*s, 0.2*s, 0), at(cyl(0.08*s, 0.08*s, 0.4*s, 0x24305e, 8), 0.1*s, 0.2*s, 0)); return g; }

// ================= game flow shared by all ten =================
function shortChoices(kad, q){ if(q.j !== "mcq" && q.j !== "bs") return null;
  var pils = [].slice.call(kad.querySelectorAll(".pil")); if(pils.length < 2 || pils.length > 4) return null;
  var texts = pils.map(function(b){ return (b.querySelector(".teks") || b).textContent.trim(); });
  if(texts.some(function(t){ return !t || t.length > 22; })) return null;
  var right = q.j === "bs" ? (String(q.a) === "Betul" || String(q.a) === "True" ? 0 : 1) : -1;
  if(right < 0){ var want = document.createElement("span"); want.innerHTML = papar(String(q.a)); var wt = want.textContent.trim(); right = texts.indexOf(wt); }
  return right < 0 ? null : {pils: pils, texts: texts, right: right}; }

function play(def, tid){
  var k = GAMES._k, R = k.rec(), P = k.pool(tid), B = k.bands(P, 3), used = {}, n = 0, N = def.n || 8, right = 0, streak = 0, best = 0, t0 = Date.now(), finished = false;
  var P0 = k.prog(); var g = k.screen(def.ikon + " " + L(def.ms, def.en)), body = g.querySelector(".gmBody"), top = g.querySelector(".gmTop"), hud = g.querySelector(".hudR"), host = g.querySelector(".gm3dHost");
  g.classList.add("has3d", "g10", "g10-" + def.id);
  var S = kit(host, def.look || {}); k.G().v3 = {dispose: S.dispose}; window.GAMES10._S = S;
  var game = def.build(S, {R: R, N: N, tid: tid});
  var hudDraw = function(){ hud.innerHTML = '<span class="gmLed">' + (game.score ? game.score() : right) + '</span>'; var pn = k.prog(), gain = pn.done - P0.done; top.innerHTML = '<div class="g10bar"><i style="width:' + Math.round(n/N*100) + '%"></i></div><div class="g10sp"><span>📘 ' + esc(pn.nama) + '</span><span>' + P0.done + ' → <b>' + pn.done + '</b> / ' + pn.jum + (gain > 0 ? ' <em>+' + gain + ' ✨</em>' : '') + '</span></div><div class="kecil g10msg">' + (n ? (L("Soalan ", "Question ") + n + "/" + N) : "") + (streak > 1 ? " · 🔥 " + streak : "") + '</div>'; };
  var next = function(){ if(finished) return; if(n >= N || (game.done && game.done())) return end();
    var it = k.take(B[Math.min(2, Math.floor(n*3/N))], used) || k.take(P, used); if(!it) return end(); n++; hudDraw();
    var picked = false, cbOk = null, animDone = false, go = function(){ if(cbOk !== null && animDone){ hudDraw(); next(); } };
    var kad = k.ask(body, it, function(ok){ cbOk = ok; if(ok){ right++; streak++; best = Math.max(best, streak); } else streak = 0; hudDraw();
      if(!picked){ picked = true; var ci = ch && game.choices ? cardIdx : -1; window.GAMES10._ans = ci; game.answer(ci, ok, streak, function(){ animDone = true; go(); }, ch ? ch.right : null); } else go(); }, {no: n});
    var ch = shortChoices(kad, it.q); window.GAMES10._pick = null;
    var cardIdx = -1; kad.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest(".pil"); if(b) cardIdx = [].indexOf.call(kad.querySelectorAll(".pil"), b); }, true);
    if(ch && game.choices){ kad.classList.add("g10hide");
      var hint = document.createElement("p"); hint.className = "g10hint"; hint.textContent = L(def.hintMs || "Pilih jawapan dalam permainan di atas ⬆", def.hintEn || "Choose your answer in the game above ⬆"); kad.appendChild(hint);
      var show = document.createElement("button"); show.className = "g10show"; show.textContent = L("Tunjuk pilihan di sini", "Show the choices here"); show.onclick = function(){ kad.classList.remove("g10hide"); hint.remove(); show.remove(); }; kad.appendChild(show);
      var choose = function(i){ if(picked) return; picked = true; window.GAMES10._pick = null; var ok = i === ch.right; game.answer(i, ok, ok ? streak + 1 : 0, function(){ animDone = true; go(); }, ch.right); ch.pils[i].click(); };
      game.choices(ch.texts, choose); window.GAMES10._pick = choose; window.GAMES10._right = ch.right;
    } else if(game.prompt) game.prompt();
  };
  var end = function(){ if(finished) return; finished = true; k.played(); var secs = Math.round((Date.now() - t0)/1000), Q = Math.max(1, n), xp = right*5 + (right === Q ? 10 : 0); R.xp += xp;
    var rk = def.id, sc = game.score ? game.score() : right, nb = sc > (R.rekod[rk] || 0); if(nb) R.rekod[rk] = sc; if(game.save) game.save(R); tulis();
    var starsN = right >= Q*0.9 ? 3 : right >= Q*0.6 ? 2 : right > 0 ? 1 : 0;
    if(game.finish) game.finish(starsN);
    body.innerHTML = '<div class="g10end"><div class="g10stars">' + "⭐".repeat(starsN) + "☆".repeat(3 - starsN) + '</div><h3>' + (game.endTitle ? game.endTitle(starsN) : L("Tahniah!", "Well done!")) + '</h3>' +
      '<p>' + L("Betul ", "Correct ") + right + "/" + Q + (best > 2 ? " · 🔥 " + best : "") + " · ⏱ " + secs + " s · +" + xp + " XP" + (nb ? " · 🏆 " + L("Rekod baharu!", "New record!") : "") + '</p>' + (game.extra ? game.extra() : "") +
      (function(){ var pn = k.prog(), gain = pn.done - P0.done, p1 = Math.round(P0.done/Math.max(1, pn.jum)*100), p2 = Math.round(pn.done/Math.max(1, pn.jum)*100); return '<div class="g10gain">📈 <b>+' + gain + '</b> ' + L("soalan baharu untuk ", "new questions toward ") + esc(pn.nama) + '<div class="g10pc">' + p1 + '% → <b>' + p2 + '%</b> <small>(' + pn.done + '/' + pn.jum + ')</small></div><div class="g10bar"><i style="width:' + Math.max(p2, 1) + '%"></i></div></div>'; })() +'<div class="gmBtns"><button class="btn utama" id="g10a">🔁 ' + L("Main lagi", "Play again") + '</button><button class="btn" id="g10b">🎮 ' + L("Permainan lain", "Other games") + '</button></div></div>';
    body.querySelector("#g10a").onclick = function(){ start(def, tid); }; body.querySelector("#g10b").onclick = function(){ k.stop(); pergi({skrin: "subjek", topik: null}); };
    hudDraw(); };
  hudDraw(); if(game.intro) game.intro(next); else S.wait(400, next);
}
function start(def, tid){ if(!webgl()) return; var go = function(){ T = window.THREE; play(def, tid); }; if(window.THREE) go(); else if(window.G3D) G3D.load(go); }

// ================= 1. 🏹 Memanah (archery) =================
var ARCHERY = {id: "archery", ikon: "🏹", ms: "Memanah", en: "Archery", dms: "Panah sasaran jawapan yang betul", den: "Shoot the right answer's target", hintMs: "Ketik sasaran jawapan yang betul ⬆", hintEn: "Tap the target with the right answer ⬆", n: 8,
  look: {sky: ["#5aa9ff", "#bfe6ff", "#f3fbff"], cam: [1.3, 2.3, 8.6], look: [0, 2, -6], fog: [0xdff2ff, 25, 60], shadowExt: 18},
  build: function(S, c){ S.ground(0x6fbf4d, 120); for(var i = 0; i < 14; i++) S.add(tree(-14 + rnd()*28, -16 - rnd()*14, 1.2 + rnd(), i % 2 ? 0x2f8f3f : 0x4fae4f)); S.add(cloud(-6, 9, -25, 2)); S.add(cloud(8, 11, -30, 2.4));
    var bowman = S.add(at(person(0x1f6f8b), 0, 0, 5.2)), targets = [], arrows = [], score = 0;
    var bow = at(torus(0.5, 0.03, 0x5d3a1a, {r: 0.5}), 0.35, 1.0, 5.1); bow.scale.x = 0.25; S.add(bow);
    var makeTarget = function(){ var g = grp(); [[0.95, 0xffffff], [0.75, 0x222222], [0.56, 0x1e88e5], [0.38, 0xe53935], [0.18, 0xffd400]].forEach(function(r, i){ var d = cyl(r[0], r[0], 0.12, r[1], 40, {r: 0.5}); d.rotation.x = PI/2; d.position.z = i*0.015; g.add(d); });
      var leg = at(box(0.1, 1.8, 0.1, 0x7a4b2a), 0, -0.9, -0.2); g.add(leg); var hit = new T.Mesh(new T.CircleGeometry(1.5, 20), new T.MeshBasicMaterial({visible: false})); hit.position.z = 0.1; g.add(hit); var lb = label(2.3, 0.7, ""); lb.position.set(0, 1.45, 0.1); g.add(lb); g.userData.lb = lb; return g; };
    return {score: function(){ return score; },
      choices: function(texts, onPick){ targets.forEach(function(t){ S.scene.remove(t); }); targets = []; var n = texts.length, far = c.R.xp > 200 ? 1 : 0;
        texts.forEach(function(tx, i){ var t = makeTarget(), x = (i - (n - 1)/2)*2.6, z = -1.2 - (i % 2)*1.5*far - rnd()*0.8; t.position.set(x, 2.3, z); t.userData.pick = i; t.userData.lb.set(tx); S.add(t); targets.push(t);
          t.scale.set(0.01, 0.01, 0.01); S.anim(450, function(e){ t.scale.setScalar(Math.max(0.01, e)); }, null, out); });
        if(this._off) this._off(); this._off = S.pick(targets, function(i){ onPick(i); }); },
      prompt: function(){ targets.forEach(function(t){ S.scene.remove(t); }); targets = []; var t = makeTarget(); t.position.set(0, 2.3, -1.6); t.userData.lb.set("?"); S.add(t); targets.push(t); },
      answer: function(i, ok, streak, done, right){ var t = targets[i < 0 ? 0 : i] || targets[0]; if(!t){ done(); return; }
        var arrow = grp(at(cyl(0.025, 0.025, 1.2, 0x8d6e63, 6), 0, 0, 0), at(cone(0.06, 0.18, 0x90a4ae, 8), 0, 0.68, 0), at(box(0.16, 0.2, 0.01, ok ? 0xff5252 : 0x9e9e9e), 0, -0.55, 0));
        arrow.rotation.x = -PI/2; S.add(arrow); var from = new T.Vector3(0.35, 1.1, 5), aim = t.position.clone().add(new T.Vector3(ok ? 0 : (rnd() - 0.5)*1.2, ok ? 0 : (rnd() - 0.5)*1.1, 0.12));
        S.anim(700, function(e){ arrow.position.lerpVectors(from, aim, e); arrow.position.y += Math.sin(e*PI)*1.2; arrow.lookAt(aim); arrow.rotateX(PI/2); }, function(){
          if(ok){ score += 10 + Math.min(streak, 5)*2; S.burst(aim, [0xffd400, 0xff7043, 0xffffff]); S.shake(0.08); t.userData.lb.set("🎯 +" + (10 + Math.min(streak, 5)*2), "#fff", "#2e7d32"); }
          else { S.shake(0.25); t.userData.lb.set("✗", "#fff", "#c62828"); if(right != null && targets[right]) targets[right].userData.lb.set("✓ " + (targets[right].userData.lb.txt || ""), "#fff", "#2e7d32"); }
          S.wait(ok ? 650 : 1100, function(){ S.scene.remove(arrow); done(); }); }, function(k){ return k; }); },
      finish: function(st){ S.camTo([0, 3, 4], [0, 2, -5]); targets.forEach(function(t, i){ S.burst(t.position, null, 60); }); }};
  }};

// ================= 2. ⚽ Sepakan Penalti =================
var PENALTY = {id: "penalty", ikon: "⚽", ms: "Sepakan Penalti", en: "Penalty Shootout", dms: "Sepak bola ke zon jawapan", den: "Kick into the right answer's zone", hintMs: "Ketik zon gol jawapan yang betul ⬆", hintEn: "Tap the goal zone with the right answer ⬆", n: 8,
  look: {sky: ["#0c1633", "#203a6b", "#3a5d8f"], cam: [0, 2.1, 9], look: [0, 1.5, -2], hemi: 0.55, sun: 1.6, sunPos: [3, 14, 10], shadowExt: 14},
  build: function(S, c){ var grass = S.ground(0x2f8f3a, 90); for(var i = -8; i < 8; i++){ var st = at(box(3, 0.01, 90, i % 2 ? 0x2a8434 : 0x349a3f, {r: 0.9}), i*3 + 1.5, 0.005, 0); st.castShadow = false; S.add(st); }
    var post = function(x){ return at(cyl(0.08, 0.08, 2.5, 0xffffff, 12, {r: 0.3}), x, 1.25, -3); }; S.add(post(-3.6)); S.add(post(3.6)); var bar = at(box(7.4, 0.16, 0.16, 0xffffff, {r: 0.3}), 0, 2.5, -3); S.add(bar);
    var net = mesh(new T.PlaneGeometry(7.2, 2.5, 18, 8), new T.MeshStandardMaterial({color: 0xffffff, wireframe: true, transparent: true, opacity: 0.45}), false); at(net, 0, 1.25, -4.1); S.add(net);
    [-12, 12].forEach(function(x){ var stand = at(box(6, 3, 8, 0x3949ab, {r: 0.8}), x, 1.5, -8); S.add(stand); for(var j = 0; j < 30; j++) S.add(at(ball(0.18, [0xffd54f, 0xef5350, 0x66bb6a, 0x42a5f5, 0xffffff][j % 5], {r: 0.6}, 8), x - 2.6 + (j % 10)*0.55, 3.2 + Math.floor(j/10)*0.3, -11 + Math.floor(j/10)*1.1)); });
    [-9, 9].forEach(function(x){ var pole = at(cyl(0.1, 0.1, 9, 0x9e9e9e), x, 4.5, -10); S.add(pole); var lamp = new T.PointLight(0xfff3c4, 40, 30); lamp.position.set(x, 9, -10); S.scene.add(lamp); S.add(at(box(1.6, 0.6, 0.3, 0xffffff, {e: 0xfff3c4, ei: 2}), x, 9, -10)); });
    var keeper = at(person(0xff9800, 0x8d5524, 1.25), 0, 0, -3.1); S.add(keeper); var ballM = at(ball(0.22, 0xffffff, {r: 0.4}), 0, 0.22, 4); S.add(ballM);
    var spots = ballM.clone(); var zones = [], scoreG = 0, scoreK = 0;
    var zone = function(i, n, tx){ var w = 7/n, x = -3.5 + w*(i + 0.5), z = mesh(new T.PlaneGeometry(w - 0.12, 2.3), new T.MeshBasicMaterial({color: [0x42a5f5, 0xef5350, 0xffca28, 0x66bb6a][i], transparent: true, opacity: 0.32, depthWrite: false}), false); z.position.set(x, 1.2, -3.02); z.userData.pick = i;
      var lb = label(Math.min(2.2, w - 0.15), 0.5, tx); lb.position.set(x, 2.95, -2.9); z.userData.lb = lb; z.userData.x = x; S.add(lb); S.add(z); return z; };
    return {score: function(){ return scoreG; },
      choices: function(texts, onPick){ zones.forEach(function(z){ S.scene.remove(z); S.scene.remove(z.userData.lb); }); zones = texts.map(function(t, i){ return zone(i, texts.length, t); }); if(this._off) this._off(); this._off = S.pick(zones, onPick);
        ballM.position.set(0, 0.22, 4); keeper.position.set(0, 0, -3.1); keeper.rotation.z = 0; },
      prompt: function(){ zones.forEach(function(z){ S.scene.remove(z); S.scene.remove(z.userData.lb); }); zones = []; ballM.position.set(0, 0.22, 4); keeper.position.set(0, 0, -3.1); keeper.rotation.z = 0; },
      answer: function(i, ok, streak, done){ var tx = i >= 0 && zones[i] ? zones[i].userData.x : (rnd() - 0.5)*5, ty = 0.6 + rnd()*1.2, from = ballM.position.clone(), to = new T.Vector3(tx, ty, -3.4);
        var kx = ok ? (tx > 0 ? -2.4 : 2.4) : tx; S.anim(560, function(e){ ballM.position.lerpVectors(from, to, e); ballM.position.y += Math.sin(e*PI)*0.8; ballM.rotation.x -= 0.4; keeper.position.x = kx*e; keeper.rotation.z = -Math.sign(kx || 1)*e*1.1; keeper.position.y = Math.sin(e*PI)*0.5; },
          function(){ if(ok){ scoreG++; S.burst(new T.Vector3(tx, ty, -3.6), [0xffffff, 0xffd400, 0x42a5f5], 120); S.anim(500, function(e){ net.position.z = -4.1 - Math.sin(e*PI)*0.4; ballM.position.z = -3.4 - e*0.6; }); }
            else { scoreK++; S.shake(0.2); S.anim(450, function(e){ ballM.position.z = -3.4 + e*2.2; ballM.position.y = Math.max(0.22, ty*(1 - e)); }); }
            S.wait(ok ? 900 : 1200, done); }, function(k){ return k; }); },
      extra: function(){ return '<p class="g10big">⚽ ' + scoreG + ' – ' + scoreK + ' 🧤</p>'; },
      endTitle: function(){ return scoreG > scoreK ? L("Anda menang!", "You win!") : scoreG === scoreK ? L("Seri!", "A draw!") : L("Penjaga gol menang kali ini", "The keeper wins this time"); },
      finish: function(){ S.camTo([0, 4, 6], [0, 1.5, -3]); if(scoreG > scoreK){ S.burst(new T.Vector3(0, 3, -2), null, 200); } }};
  }};

// ================= 3. 🫧 Pecah Gelembung =================
var BUBBLES = {id: "bubbles", ikon: "🫧", ms: "Pecah Gelembung", en: "Bubble Pop", dms: "Pecahkan gelembung jawapan betul", den: "Pop the right answer's bubble", hintMs: "Pecahkan gelembung jawapan yang betul ⬆", hintEn: "Pop the bubble with the right answer ⬆", n: 10,
  look: {sky: ["#08324a", "#0f6b8c", "#4fc3d6"], cam: [0, 3, 9], look: [0, 3, 0], hemi: 0.9, sun: 1.4, exposure: 1.15},
  build: function(S, c){ var sand = S.ground(0xd9c48f, 60); for(var i = 0; i < 18; i++){ var w = cyl(0.04, 0.06, 1.2 + rnd()*1.8, 0x2e7d32, 6); at(w, -8 + rnd()*16, 0.6, -3 - rnd()*5); w.rotation.z = (rnd() - 0.5)*0.4; S.add(w); }
    for(var j = 0; j < 8; j++) S.add(at(ball(0.3 + rnd()*0.5, [0xff7043, 0xab47bc, 0xffca28, 0x26a69a][j % 4], {r: 0.7, flat: true}, 7), -7 + rnd()*14, 0.2, -2 - rnd()*4));
    var fish = []; for(var f = 0; f < 6; f++){ var fs = emo(["🐠", "🐟", "🐡"][f % 3], 0.9); at(fs, -9 + rnd()*18, 1 + rnd()*5, -4 - rnd()*3); fs.userData.v = 0.4 + rnd()*0.6; S.add(fs); fish.push(fs); }
    var rays = new T.SpotLight(0xbff6ff, 60, 30, 0.5, 0.6); rays.position.set(0, 14, 2); S.scene.add(rays);
    var bubs = [], speed = 0.35, score = 0;
    S.tick(function(dt, t){ fish.forEach(function(fs){ fs.position.x += fs.userData.v*dt; if(fs.position.x > 10) fs.position.x = -10; fs.position.y += Math.sin(t + fs.position.x)*0.003; });
      bubs.forEach(function(b){ if(b.userData.dead) return; b.position.y += speed*dt; b.position.x += Math.sin(t*1.4 + b.userData.ph)*0.004; b.rotation.y += dt*0.4; if(b.position.y > 7.2) b.position.y = -0.2; }); });
    var bubble = function(tx, x, y){ var g = grp(), sp = mesh(new T.SphereGeometry(1, 40, 30), mat(0xbfefff, {phys: true, r: 0.05, t: true, op: 0.38, ir: true, cc: 1}), false); g.add(sp);
      var hl = at(ball(0.16, 0xffffff, {e: 0xffffff, ei: 1}), -0.45, 0.5, 0.75); g.add(hl); var lb = label(1.7, 0.5, tx, {bg: "rgba(255,255,255,0.88)"}); lb.position.z = 0.6; g.add(lb); g.userData.lb = lb; g.userData.ph = rnd()*6; at(g, x, y, 0); return g; };
    return {score: function(){ return score; },
      choices: function(texts, onPick){ bubs.forEach(function(b){ S.scene.remove(b); }); var n = texts.length; bubs = texts.map(function(t, i){ var b = bubble(t, (i - (n - 1)/2)*2.3, 0.4 + (i % 2)*1.3); b.userData.pick = i; b.scale.setScalar(0.01); S.add(b); S.anim(400, function(e){ b.scale.setScalar(0.01 + e*0.99); }, null, out); return b; });
        if(this._off) this._off(); this._off = S.pick(bubs, onPick); },
      prompt: function(){ bubs.forEach(function(b){ S.scene.remove(b); }); bubs = [bubble("?", 0, 1)]; S.add(bubs[0]); },
      answer: function(i, ok, streak, done, right){ var b = bubs[i < 0 ? 0 : i];
        if(ok){ score += 10 + streak*2; speed = Math.min(1.4, speed + 0.08); if(b){ S.burst(b.position, [0xbff6ff, 0xffffff, 0x80deea], 140, 0.16, 0.001); b.userData.dead = true; S.anim(220, function(e){ b.scale.setScalar(1 + e*0.5); }, function(){ S.scene.remove(b); }); } S.wait(600, done); }
        else { if(b){ S.burst(b.position, [0x311b92, 0x4a148c, 0x1a237e], 120, 0.1, 0.006); b.userData.lb.set("✗", "#fff", "#4a148c"); } S.shake(0.15); if(right != null && bubs[right]) bubs[right].userData.lb.set("✓", "#fff", "#2e7d32"); S.wait(1100, done); } },
      finish: function(){ for(var i = 0; i < 4; i++) S.burst(new T.Vector3(-4 + i*2.6, 3, 0), [0xbff6ff, 0xffffff], 80, 0.14, 0.0005); }};
  }};

// ================= 4. 🏃 Lari Syiling (coin runner) =================
var RUNNER = {id: "runner", ikon: "🏃", ms: "Lari Syiling", en: "Coin Runner", dms: "Lari melalui pintu jawapan", den: "Run through the right answer's gate", hintMs: "Ketik pintu jawapan yang betul ⬆", hintEn: "Tap the gate with the right answer ⬆", n: 10,
  look: {sky: ["#ff9a5a", "#ffd39a", "#bfe3ff"], cam: [0, 3.2, 6.5], look: [0, 1.2, -6], fog: [0xffe0b5, 18, 55], shadowExt: 16},
  build: function(S, c){ S.ground(0x7cb342, 160); var road = at(box(7.5, 0.05, 160, 0x5d5d66, {r: 0.9}), 0, 0.02, -60); road.castShadow = false; S.add(road);
    var stripes = [], props = [], speed = 6, coins = 0;
    for(var i = 0; i < 24; i++){ var st = at(box(0.15, 0.06, 1.4, 0xffffff, {r: 0.6}), 0, 0.05, -i*4); st.castShadow = false; stripes.push(S.add(st)); }
    for(var j = 0; j < 16; j++){ var side = j % 2 ? 1 : -1, h = j % 4 < 2 ? tree(side*(6 + rnd()*3), -j*7, 1 + rnd()*0.6) : (function(){ var g = grp(at(box(2, 1.6, 2, [0xffcc80, 0xa5d6a7, 0x90caf9, 0xf48fb1][j % 4], {r: 0.8}), 0, 0.8, 0)), r = cone(1.7, 1.1, 0xb23a48, 4); r.rotation.y = PI/4; g.add(at(r, 0, 2.1, 0)); g.add(at(box(0.5, 0.9, 0.05, 0x5d4037), 0, 0.45, side < 0 ? 1.02 : -1.02)); return at(g, side*(7 + rnd()*2), 0, -j*7); })(); props.push(S.add(h)); }
    var runner = at(person(0xe53935, 0xf1c27d, 1.1), 0, 0, 2.5); S.add(runner); var lanes = [], gates = [], target = 0, stumble = 0;
    S.tick(function(dt, t){ var v = speed*dt; stripes.forEach(function(s){ s.position.z += v; if(s.position.z > 6) s.position.z -= 96; }); props.forEach(function(p){ p.position.z += v; if(p.position.z > 8) p.position.z -= 112; });
      gates.forEach(function(g){ g.position.z += v*0.35; }); runner.position.x += (target - runner.position.x)*0.12; runner.position.y = Math.abs(Math.sin(t*10))*0.12; runner.rotation.z = stumble ? Math.sin(t*20)*0.4 : 0; });
    var gate = function(tx, x){ var g = grp(at(box(0.18, 2.4, 0.18, 0xffffff, {r: 0.4}), -0.95, 1.2, 0), at(box(0.18, 2.4, 0.18, 0xffffff, {r: 0.4}), 0.95, 1.2, 0)), arch = at(box(2.1, 0.5, 0.2, [0x42a5f5, 0xef5350, 0xffca28, 0x66bb6a][gates.length % 4], {r: 0.5}), 0, 2.4, 0); g.add(arch);
      var lb = label(1.9, 0.48, tx); lb.position.set(0, 2.4, 0.12); g.add(lb); g.userData.lb = lb; var pane = mesh(new T.PlaneGeometry(1.7, 2.1), new T.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.12, depthWrite: false}), false); at(pane, 0, 1.1, 0); g.add(pane); return at(g, x, 0, -9); };
    return {score: function(){ return coins; },
      choices: function(texts, onPick){ gates.forEach(function(g){ S.scene.remove(g); }); var n = texts.length; lanes = texts.map(function(_, i){ return (i - (n - 1)/2)*(n > 3 ? 1.85 : 2.4); });
        gates = texts.map(function(t, i){ var g = gate(t, lanes[i]); g.userData.pick = i; return S.add(g); }); if(this._off) this._off(); this._off = S.pick(gates, onPick); },
      prompt: function(){ gates.forEach(function(g){ S.scene.remove(g); }); lanes = [0]; gates = [S.add(gate("?", 0))]; },
      answer: function(i, ok, streak, done){ var gi = i < 0 ? 0 : i, g = gates[gi]; target = lanes[gi] || 0; var z0 = g ? g.position.z : -9;
        S.anim(800, function(e){ if(g) g.position.z = z0 + (2.6 - z0)*e; }, function(){
          if(ok){ coins += 5 + streak; speed = Math.min(14, speed + 0.9); for(var k = 0; k < 5; k++){ (function(k){ var cn = cyl(0.25, 0.25, 0.06, 0xffc107, 24, {m: 0.9, r: 0.25}); cn.rotation.x = PI/2; at(cn, target, 1.4, 2.5); S.add(cn); S.anim(500 + k*80, function(e){ cn.position.y = 1.4 + e*1.6; cn.rotation.y = e*8; cn.position.x = target + (k - 2)*0.3*e; }, function(){ S.scene.remove(cn); }); })(k); } S.burst(new T.Vector3(target, 1.5, 2.4), [0xffd400, 0xffffff], 70); }
          else { speed = Math.max(4, speed - 2); stumble = 1; S.shake(0.2); S.wait(700, function(){ stumble = 0; }); }
          S.wait(ok ? 400 : 900, function(){ if(g) S.scene.remove(g); done(); }); }); },
      extra: function(){ return '<p class="g10big">🪙 ' + coins + '</p>'; },
      finish: function(){ speed = 2; S.burst(new T.Vector3(0, 2, 2), [0xffd400, 0xffc107, 0xffffff], 200); }};
  }};

// ================= 5. 🚀 Pelancaran Roket =================
var ROCKET = {id: "rocket", ikon: "🚀", ms: "Pelancaran Roket", en: "Rocket Launch", dms: "Bina roket, lancar ke angkasa", den: "Build a rocket, launch into space", n: 8,
  look: {sky: ["#2b65c9", "#7fb8ff", "#e6f4ff"], cam: [5, 3.4, 8], look: [0, 2.4, 0], fog: [0xcfe6ff, 30, 120], shadowExt: 10},
  build: function(S, c){ S.ground(0x9e9e9e, 140); var pad = at(cyl(2.4, 2.6, 0.4, 0x616161, 40, {r: 0.7}), 0, 0.2, 0); S.add(pad); var tower = grp(); for(var i = 0; i < 9; i++){ tower.add(at(box(0.7, 0.08, 0.7, 0xd32f2f, {m: 0.4}), 0, i*0.7, 0)); }
    [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]].forEach(function(p){ tower.add(at(box(0.07, 6.3, 0.07, 0xd32f2f, {m: 0.4}), p[0], 3.15, p[1])); }); S.add(at(tower, -2.6, 0, 0)); S.add(cloud(-10, 12, -30, 3)); S.add(cloud(12, 15, -40, 3.5));
    var rocket = grp(); S.add(at(rocket, 0, 0.4, 0)); var built = 0, wob = 0, launching = false;
    var parts = [function(){ var g = grp(); [0, 1, 2, 3].forEach(function(k){ var f = box(0.08, 1.1, 0.9, 0xe53935, {m: 0.3, r: 0.4}); f.position.set(Math.cos(k*PI/2)*0.62, 0.55, Math.sin(k*PI/2)*0.62); f.rotation.y = -k*PI/2; g.add(f); }); g.add(at(cone(0.5, 0.6, 0x37474f, 24, {m: 0.8, r: 0.3}), 0, 0.2, 0)); return g; },
      function(){ return at(cyl(0.55, 0.55, 1.6, 0xeceff1, 40, {m: 0.6, r: 0.25}), 0, 1.1 + 0.8, 0); },
      function(){ return at(cyl(0.56, 0.56, 0.22, 0x1565c0, 40, {m: 0.5, r: 0.3}), 0, 2.81, 0); },
      function(){ return at(cyl(0.55, 0.55, 1.3, 0xffffff, 40, {m: 0.5, r: 0.3}), 0, 3.57, 0); },
      function(){ var g = grp(at(cyl(0.18, 0.18, 0.06, 0x80deea, 24, {phys: true, r: 0.05, e: 0x4dd0e1, ei: 0.4}), 0, 3.7, 0.53)); g.children[0].rotation.x = PI/2; var fl = label(0.9, 0.3, "MY IHSAN", {bg: "rgba(0,0,0,0)", fg: "#c62828"}); fl.position.set(0, 3.25, 0.57); g.add(fl); return g; },
      function(){ return at(cone(0.55, 1.2, 0xe53935, 40, {m: 0.4, r: 0.3}), 0, 4.82, 0); }];
    var flame = at(cone(0.35, 1.2, 0xffa000, 24, {e: 0xff6f00, ei: 3, t: true, op: 0.9}), 0, -0.6, 0); flame.rotation.x = PI; flame.visible = false; rocket.add(flame);
    S.tick(function(dt, t){ rocket.rotation.z = wob ? Math.sin(t*18)*0.05*wob : 0; flame.scale.y = 1 + Math.sin(t*40)*0.15; });
    var addPart = function(){ if(built >= parts.length) return; var p = parts[built++](); rocket.add(p); var y0 = p.position.y; p.position.y += 5; S.anim(650, function(e){ p.position.y = y0 + 5*(1 - e); }, function(){ S.burst(rocket.position.clone().add(new T.Vector3(0, y0, 0)), [0xffffff, 0x90caf9], 40); S.shake(0.08); }, out); };
    return {score: function(){ return built; }, prompt: function(){},
      answer: function(i, ok, streak, done){ if(ok){ addPart(); S.wait(750, done); } else { wob = 1; S.shake(0.15); S.wait(800, function(){ wob = 0; done(); }); } },
      done: function(){ return false; },
      endTitle: function(){ return built >= 6 ? L("Pelancaran berjaya! 🚀", "Lift-off! 🚀") : L("Roket hampir siap!", "Almost ready to fly!"); },
      extra: function(){ return '<p class="g10big">🚀 ' + built + '/6</p>'; },
      finish: function(){ while(built < 3) addPart(); launching = true; flame.visible = true; var smoke = []; S.tick(function(){ if(!launching) return; S.burst(rocket.position.clone(), [0xeeeeee, 0xbdbdbd, 0xffa000], 6, 0.05, -0.0005); });
        S.scene.add(stars(800, 120, 0.6)); var sky2 = skyTex(["#000010", "#0b1033", "#1b2a6b"]), p1 = at(ball(6, 0xff8a65, {r: 0.8}), 30, 60, -60), p2 = at(ball(3, 0x4fc3f7, {r: 0.6}), -25, 70, -40), ring = at(torus(9, 0.6, 0xffe0b2, {r: 0.6}), 30, 60, -60); ring.rotation.x = 1.2; S.add(p1); S.add(p2); S.add(ring);
        S.anim(5200, function(e){ rocket.position.y = 0.4 + e*e*60; S.camTo([6 - e*4, 4 + e*e*58, 9], [0, rocket.position.y + 2, 0]); if(e > 0.45 && S.scene.background !== sky2){ S.scene.background = sky2; S.scene.fog = null; } S.shake(0.05*(1 - e)); }, function(){ launching = false; S.burst(rocket.position.clone(), null, 200); }, function(k){ return k; }); }};
  }};

// ================= 6. 🕌 Bina Masjidku (persistent) =================
var MASJID = {id: "masjid", ikon: "🕌", ms: "Bina Masjidku", en: "Build My Masjid", dms: "Setiap jawapan betul menambah binaan", den: "Every right answer adds a part", n: 8,
  look: {sky: ["#3b2a6b", "#ff7e5f", "#feb47b"], cam: [7, 5, 10], look: [0, 2, 0], sunCol: 0xffb36b, sun: 2.4, sunPos: [-10, 6, 6], hemi: 0.6, skyCol: 0xffc4a1, shadowExt: 12, exposure: 1.1},
  build: function(S, c){ var R = c.R; R.masjid = R.masjid || {n: 0, done: 0}; if(R.masjid.n >= 12){ R.masjid.done++; R.masjid.n = 0; }
    S.ground(0xc2b280, 120); for(var i = 0; i < 10; i++) S.add(palm(-12 + rnd()*24, -10 - rnd()*8, 0.9 + rnd()*0.5));
    var W = 0xf5f0e6, G = 0x2e7d32, GOLD = 0xd4af37, parts = [
      function(){ return at(box(8, 0.3, 6, 0xbcaaa4, {r: 0.9}), 0, 0.15, 0); },
      function(){ return at(box(7.4, 0.06, 5.4, 0x8d6e63, {r: 0.5}), 0, 0.33, 0); },
      function(){ var g = grp(); [[-3.3, -2.3], [3.3, -2.3], [-3.3, 2.3], [3.3, 2.3], [0, 2.3], [0, -2.3]].forEach(function(p){ g.add(at(cyl(0.18, 0.2, 2.6, W, 16, {r: 0.5}), p[0], 1.6, p[1])); }); return g; },
      function(){ var g = grp(at(box(7, 2.6, 0.2, W, {r: 0.7}), 0, 1.6, -2.4), at(box(0.2, 2.6, 4.8, W, {r: 0.7}), -3.4, 1.6, 0), at(box(0.2, 2.6, 4.8, W, {r: 0.7}), 3.4, 1.6, 0)); return g; },
      function(){ var g = grp(at(box(2.6, 2.6, 0.2, W, {r: 0.7}), -2.2, 1.6, 2.4), at(box(2.6, 2.6, 0.2, W, {r: 0.7}), 2.2, 1.6, 2.4)), arch = torus(0.9, 0.12, GOLD, {m: 0.8, r: 0.3}); arch.position.set(0, 2.2, 2.45); g.add(arch); g.add(at(box(1.8, 0.6, 0.2, W), 0, 2.8, 2.4)); return g; },
      function(){ return at(box(7.2, 0.25, 5.2, 0xe0d7c6, {r: 0.6}), 0, 3.0, 0); },
      function(){ var d = mesh(new T.SphereGeometry(1.8, 48, 24, 0, 2*PI, 0, PI/2), mat(G, {m: 0.3, r: 0.35})); d.position.y = 3.12; return grp(d, at(cyl(1.85, 1.85, 0.4, W, 48), 0, 3.2, 0)); },
      function(){ var g = grp(); [-2.6, 2.6].forEach(function(x){ var d = mesh(new T.SphereGeometry(0.7, 32, 16, 0, 2*PI, 0, PI/2), mat(G, {m: 0.3, r: 0.35})); d.position.set(x, 3.12, 1.4); g.add(d); }); return g; },
      function(){ return grp(at(cyl(0.38, 0.45, 6.5, W, 16, {r: 0.5}), -4.6, 3.25, -2.6), at(cyl(0.55, 0.55, 0.25, GOLD, 16, {m: 0.8}), -4.6, 5.2, -2.6), at(cone(0.45, 1.1, G, 16, {m: 0.3}), -4.6, 7.05, -2.6)); },
      function(){ return grp(at(cyl(0.38, 0.45, 6.5, W, 16, {r: 0.5}), 4.6, 3.25, -2.6), at(cyl(0.55, 0.55, 0.25, GOLD, 16, {m: 0.8}), 4.6, 5.2, -2.6), at(cone(0.45, 1.1, G, 16, {m: 0.3}), 4.6, 7.05, -2.6)); },
      function(){ var g = grp(); [[0, 5.2, 0], [-4.6, 7.9, -2.6], [4.6, 7.9, -2.6]].forEach(function(p){ var cr = torus(0.25, 0.05, GOLD, {m: 0.9, r: 0.2, e: 0x6b5600, ei: 0.5}); cr.position.set(p[0], p[1], p[2]); g.add(cr); g.add(at(cyl(0.03, 0.03, 0.5, GOLD, 8, {m: 0.9}), p[0], p[1] - 0.45, p[2])); }); return g; },
      function(){ var g = grp(); for(var k = 0; k < 6; k++){ var lm = at(ball(0.16, 0xfff3c4, {e: 0xffe082, ei: 3}), -2.5 + k, 2.4, 2.6); g.add(lm); } var pl = new T.PointLight(0xffd180, 30, 14); pl.position.set(0, 2.6, 3); g.add(pl); g.add(at(box(3, 0.08, 1.2, 0x4fc3f7, {phys: true, r: 0.05}), 0, 0.06, 4.6)); return g; }];
    var meshes = []; for(var i2 = 0; i2 < R.masjid.n; i2++) meshes.push(S.add(parts[i2]()));
    var add = function(){ if(R.masjid.n >= parts.length) return false; var p = S.add(parts[R.masjid.n++]()); var y0 = p.position.y; p.position.y += 6; S.anim(700, function(e){ p.position.y = y0 + 6*(1 - e); }, function(){ S.burst(new T.Vector3(0, 2, 2), [0xffd700, 0xffffff, 0x81c784], 60); S.shake(0.06); }, out); return true; };
    return {score: function(){ return R.masjid.n; }, prompt: function(){},
      answer: function(i, ok, streak, done){ if(ok) add(); else S.shake(0.1); S.wait(ok ? 800 : 600, done); },
      save: function(R2){ R2.masjid = R.masjid; },
      endTitle: function(){ return R.masjid.n >= 12 ? L("Masjid siap! MasyaAllah 🕌", "Your masjid is finished! MasyaAllah 🕌") : L("Masjid bertambah indah", "Your masjid is growing"); },
      extra: function(){ return '<p class="g10big">🕌 ' + R.masjid.n + '/12' + (R.masjid.done ? ' · 🏆 ' + R.masjid.done : '') + '</p><p class="kecil">' + L("Binaan disimpan. Sambung esok!", "Your building is saved. Carry on tomorrow!") + '</p>'; },
      finish: function(){ S.camTo([9, 6, 12], [0, 3, 0]); if(R.masjid.n >= 12){ S.scene.background = skyTex(["#050a24", "#1a2a6c", "#3b2a6b"]); S.sun.intensity = 0.4; S.hemi.intensity = 0.3; S.scene.add(stars(500, 80, 0.5)); S.burst(new T.Vector3(0, 6, 0), [0xffd700, 0xffffff], 200); } }};
  }};

// ================= 7. 🌱 Taman Ajaib =================
var GARDEN = {id: "garden", ikon: "🌱", ms: "Taman Ajaib", en: "Magic Garden", dms: "Siram benih hingga berbuah", den: "Water a seed until it fruits", n: 8,
  look: {sky: ["#8fd3ff", "#d7f3ff", "#fffde7"], cam: [0, 3, 8], look: [0, 2, 0], shadowExt: 10, exposure: 1.1},
  build: function(S, c){ S.ground(0x8bc34a, 100); var pot = at(cyl(1.4, 1.1, 0.6, 0x8d6e63, 32, {r: 0.8}), 0, 0.3, 0); S.add(pot); S.add(at(cyl(1.3, 1.3, 0.05, 0x5d4037, 32), 0, 0.6, 0));
    for(var i = 0; i < 20; i++){ var fl = grp(at(cyl(0.02, 0.02, 0.4, 0x388e3c, 6), 0, 0.2, 0), at(ball(0.1, [0xff80ab, 0xffeb3b, 0xffffff, 0xce93d8][i % 4], {r: 0.6}, 10), 0, 0.42, 0)); S.add(at(fl, -8 + rnd()*16, 0, -2 - rnd()*6)); }
    S.add(tree(-6, -6, 1.6)); S.add(tree(6.5, -7, 1.8)); S.add(cloud(-5, 7, -10, 1.6)); S.add(cloud(6, 8, -14, 2));
    var plant = grp(); S.add(at(plant, 0, 0.6, 0)); var stage = 0, streakRain = false, birds = [], rainbow = null, drops = null;
    var stages = [function(){ return at(ball(0.18, 0x8d6e63, {r: 0.7}, 12), 0, 0.1, 0); },
      function(){ var g = grp(at(cyl(0.04, 0.05, 0.5, 0x66bb6a, 8), 0, 0.25, 0)); [-1, 1].forEach(function(s){ var lf = ball(0.18, 0x81c784, {r: 0.6}, 12); lf.scale.set(1, 0.3, 0.6); lf.position.set(0.16*s, 0.5, 0); g.add(lf); }); return g; },
      function(){ return at(cyl(0.12, 0.18, 1.6, 0x795548, 12, {r: 0.8}), 0, 0.8, 0); },
      function(){ return at(ball(0.9, 0x43a047, {r: 0.8, flat: true}, 12), 0, 2.1, 0); },
      function(){ var g = grp(at(ball(0.7, 0x4caf50, {r: 0.8, flat: true}, 12), -0.8, 2.4, 0.2), at(ball(0.7, 0x388e3c, {r: 0.8, flat: true}, 12), 0.8, 2.5, -0.1), at(ball(0.8, 0x66bb6a, {r: 0.8, flat: true}, 12), 0, 3.0, 0)); return g; },
      function(){ var g = grp(); for(var k = 0; k < 8; k++){ g.add(at(ball(0.13, 0xffffff, {e: 0xf8bbd0, ei: 0.3}, 10), Math.cos(k)*1.1, 2.4 + Math.sin(k*2)*0.6, Math.sin(k)*0.8 + 0.4)); } return g; },
      function(){ var g = grp(); for(var k = 0; k < 9; k++){ g.add(at(ball(0.17, k % 2 ? 0xe53935 : 0xff9800, {r: 0.35}, 14), Math.cos(k*0.7)*1.0, 2.2 + Math.sin(k*1.3)*0.7, Math.sin(k*0.7)*0.7 + 0.5)); } return g; },
      function(){ var g = grp(); ["🐦", "🦋", "🐝", "🦋"].forEach(function(e, k){ var b = emo(e, 0.6); b.position.set(Math.cos(k)*2, 3.2 + k*0.2, Math.sin(k)*1.5); b.userData.ph = k; birds.push(b); g.add(b); }); return g; }];
    S.tick(function(dt, t){ birds.forEach(function(b){ b.position.x = Math.cos(t*0.8 + b.userData.ph)*2.2; b.position.z = Math.sin(t*0.8 + b.userData.ph)*1.6 + 0.4; b.position.y = 3.2 + Math.sin(t*3 + b.userData.ph)*0.3; }); plant.rotation.y = Math.sin(t*0.5)*0.08; });
    var grow = function(){ if(stage >= stages.length) return; var p = stages[stage++](); plant.add(p); p.scale.setScalar(0.01); S.anim(700, function(e){ p.scale.setScalar(0.01 + e*0.99); }, null, out); S.burst(new T.Vector3(0, 1.4, 0), [0x81c784, 0xffffff, 0xfff176], 50, 0.08); };
    var rain = function(){ if(drops) return; var n = 300, g = new T.BufferGeometry(), p = new Float32Array(n*3); for(var i = 0; i < n; i++){ p[i*3] = (rnd() - 0.5)*12; p[i*3+1] = rnd()*9; p[i*3+2] = (rnd() - 0.5)*8; }
      g.setAttribute("position", new T.BufferAttribute(p, 3)); drops = new T.Points(g, new T.PointsMaterial({color: 0x90caf9, size: 0.08, transparent: true, opacity: 0.8})); S.add(drops); var life = 0;
      S.tick(function(){ if(!drops) return; for(var i = 0; i < n; i++){ p[i*3+1] -= 0.18; if(p[i*3+1] < 0) p[i*3+1] = 9; } g.attributes.position.needsUpdate = true; if(++life > 160){ S.scene.remove(drops); drops = null; } });
      if(!rainbow){ rainbow = grp(); [0xe53935, 0xff9800, 0xffeb3b, 0x4caf50, 0x2196f3, 0x9c27b0].forEach(function(cc, k){ var tr = mesh(new T.TorusGeometry(7 - k*0.25, 0.12, 8, 64, PI), new T.MeshBasicMaterial({color: cc, transparent: true, opacity: 0.6}), false); rainbow.add(tr); }); at(rainbow, 0, 0, -12); S.add(rainbow); } };
    return {score: function(){ return stage; }, prompt: function(){},
      answer: function(i, ok, streak, done){ if(ok){ var can = emo("🚿", 0.8); can.position.set(1.4, 2.6, 0.5); S.add(can); S.anim(600, function(e){ can.position.x = 1.4 - e*0.6; }, function(){ S.scene.remove(can); grow(); if(streak >= 3) rain(); S.wait(500, done); }); }
        else { S.anim(500, function(e){ plant.rotation.z = Math.sin(e*PI*3)*0.08; }, function(){ plant.rotation.z = 0; done(); }); } },
      endTitle: function(){ return stage >= 8 ? L("Taman anda mekar! 🌳", "Your garden is blooming! 🌳") : L("Pokok anda sedang membesar", "Your plant is growing"); },
      extra: function(){ return '<p class="g10big">🌱 ' + stage + '/8</p>'; },
      finish: function(){ S.camTo([3, 4, 7], [0, 2.5, 0]); if(stage >= 6) S.burst(new T.Vector3(0, 3, 0), [0xff80ab, 0xffeb3b, 0xffffff], 160, 0.1, 0.001); }};
  }};

// ================= 8. 🔮 Guli Maze (marble track with answer forks) =================
var MARBLE = {id: "marble", ikon: "🔮", ms: "Guli Maze", en: "Marble Maze", dms: "Pilih laluan jawapan, lawan masa terbaik", den: "Pick the answer path, beat your best time", hintMs: "Ketik laluan jawapan yang betul ⬆", hintEn: "Tap the path with the right answer ⬆", n: 8,
  look: {sky: ["#1d1135", "#3b1f6e", "#7b4fd1"], cam: [0, 4.5, 6], look: [0, 0, -4], hemi: 0.55, sun: 2.0, sunPos: [4, 12, 6], shadowExt: 14, exposure: 1.15},
  build: function(S, c){ var R = c.R, t0 = Date.now(), penalty = 0, base = new T.Vector3(0, 0, 0), forks = [];
    var marble = ball(0.32, 0x7c4dff, {phys: true, r: 0.05, m: 0.1, cc: 1, ir: true}, 48); S.add(at(marble, 0, 0.32, 0));
    var glow = new T.PointLight(0xb388ff, 6, 4); marble.add(glow);
    var plank = function(a, b, col){ var d = b.clone().sub(a), len = d.length(), m = box(1.1, 0.12, len, col || 0xa1887f, {r: 0.6}); m.position.copy(a).add(b).multiplyScalar(0.5); m.position.y -= 0.06; m.lookAt(b.x, b.y - 0.06, b.z);
      var g = grp(m); [-0.55, 0.55].forEach(function(s){ var rl = box(0.08, 0.16, len, 0xffd54f, {m: 0.6, r: 0.3}); rl.position.copy(m.position); rl.quaternion.copy(m.quaternion); rl.translateX(s); rl.translateY(0.12); g.add(rl); }); return S.add(g); };
    plank(new T.Vector3(0, 0, 3), new T.Vector3(0, 0, 0));
    for(var i = 0; i < 40; i++){ var crystal = cone(0.3 + rnd()*0.4, 1 + rnd()*2, [0x7c4dff, 0x18ffff, 0xff4081][i % 3], 6, {e: [0x311b92, 0x006064, 0x880e4f][i % 3], ei: 0.6, flat: true}); at(crystal, (rnd() < 0.5 ? -1 : 1)*(4 + rnd()*6), -6 - rnd()*20, -rnd()*60); S.add(crystal); }
    var follow = function(){ S.camTo([marble.position.x*0.6, marble.position.y + 4.5, marble.position.z + 6], [marble.position.x, marble.position.y, marble.position.z - 4]); };
    S.tick(function(dt){ marble.rotation.x -= dt*4; });
    return {score: function(){ var s = Math.round((Date.now() - t0)/1000) + penalty; return Math.max(0, 300 - s*2); },
      choices: function(texts, onPick){ forks.forEach(function(f){ S.scene.remove(f); }); var n = texts.length; forks = texts.map(function(tx, i){ var end = base.clone().add(new T.Vector3((i - (n - 1)/2)*2.2, -1.2, -4.5)), g = plank(base, end, [0x64b5f6, 0xef9a9a, 0xfff59d, 0xa5d6a7][i]);
          var lb = label(1.9, 0.5, tx); lb.position.copy(end).add(new T.Vector3(0, 0.75, 0)); g.add(lb); g.userData.lb = lb; g.userData.end = end; g.userData.pick = i; return g; });
        if(this._off) this._off(); this._off = S.pick(forks, onPick); follow(); },
      prompt: function(){ forks.forEach(function(f){ S.scene.remove(f); }); var end = base.clone().add(new T.Vector3(0, -1.2, -4.5)), g = plank(base, end); g.userData.end = end; forks = [g]; follow(); },
      answer: function(i, ok, streak, done){ var f = forks[i < 0 ? 0 : i], end = f.userData.end, from = marble.position.clone(), to = end.clone().add(new T.Vector3(0, 0.32, 0));
        S.anim(ok ? 700 : 1100, function(e){ marble.position.lerpVectors(from, to, e); follow(); }, function(){
          if(ok){ S.burst(marble.position, [0xb388ff, 0x18ffff, 0xffffff], 80); }
          else { penalty += 6; var loop = to.clone(); S.anim(900, function(e){ marble.position.set(loop.x + Math.sin(e*2*PI)*1.2, loop.y + Math.sin(e*PI)*0.4, loop.z - Math.sin(e*PI)*1.4); follow(); }); S.shake(0.12); }
          var nb = to.clone().add(new T.Vector3(0, -0.32, 0)), nxt = nb.clone().add(new T.Vector3(-nb.x*0.6, -0.8, -3)); S.wait(ok ? 200 : 1000, function(){ plank(nb, nxt, 0xa1887f); var f2 = marble.position.clone(), t2 = nxt.clone().add(new T.Vector3(0, 0.32, 0));
            S.anim(600, function(e){ marble.position.lerpVectors(f2, t2, e); follow(); }, function(){ base = nxt; forks.forEach(function(x){ if(x !== f) S.scene.remove(x); }); forks = []; done(); }); }); }, function(k){ return k*k; }); },
      save: function(R2){ var secs = Math.round((Date.now() - t0)/1000) + penalty; R2.rekod.marbleT = Math.min(R2.rekod.marbleT || 9999, secs); this._secs = secs; },
      extra: function(){ return '<p class="g10big">⏱ ' + (this._secs || 0) + ' s · 👻 ' + (R.rekod.marbleT || "–") + ' s</p>'; },
      finish: function(){ S.burst(marble.position, null, 200); }};
  }};

// ================= 9. 🏎️ Kart Kuiz =================
var KART = {id: "kart", ikon: "🏎️", ms: "Kart Kuiz", en: "Quiz Kart", dms: "Jawapan betul = pecut! 3 pusingan", den: "Right answers boost you. 3 laps", n: 30,
  look: {sky: ["#4a90e2", "#9fd0ff", "#e8f6ff"], cam: [0, 14, 14], look: [0, 0, 0], shadowExt: 18},
  build: function(S, c){ S.ground(0x66bb6a, 160); var RX = 7, RZ = 4.5;
    var track = mesh(new T.RingGeometry(3.4, 5.6, 96), mat(0x424242, {r: 0.85}), false); track.rotation.x = -PI/2; track.position.y = 0.02; track.scale.set(RX/4.5, RZ/4.5, 1); track.receiveShadow = true; S.add(track);
    var line = at(box(0.3, 0.03, 2.4, 0xffffff), RX, 0.04, 0); S.add(line); for(var i = 0; i < 16; i++){ var a = i/16*2*PI; S.add(tree(Math.cos(a)*(RX + 3.5), Math.sin(a)*(RZ + 3.5), 0.8 + rnd()*0.5)); }
    S.add(at(box(1.4, 1.2, 0.6, 0xff7043), 0, 0.6, 0)); S.add(cloud(-8, 9, -12, 2));
    var kart = function(col){ var g = grp(at(box(0.9, 0.3, 0.55, col, {m: 0.4, r: 0.3}), 0, 0.3, 0), at(box(0.35, 0.28, 0.45, 0x263238), -0.1, 0.55, 0), at(ball(0.16, 0xf1c27d), -0.1, 0.85, 0)); [[-0.32, 0.3], [0.32, 0.3], [-0.32, -0.3], [0.32, -0.3]].forEach(function(p){ var w = cyl(0.14, 0.14, 0.1, 0x111111, 16); w.rotation.x = PI/2; w.position.set(p[0], 0.14, p[1]); g.add(w); }); return S.add(g); };
    var me = kart(0xe53935), ai = [[0x1e88e5, 0.064], [0xfdd835, 0.06], [0x8e24aa, 0.056]].map(function(a, k){ return {k: kart(a[0]), p: -0.02*(k + 1), v: a[1]}; }), p = 0, v = 0.06, boost = 0, spin = 0, fin = false, place = 0, fx = 0;
    var put = function(o, u, lane){ var a = u*2*PI, r = 1 + lane*0.08; o.position.set(Math.cos(a)*RX*r, 0, Math.sin(a)*RZ*r); o.rotation.y = -a - PI/2; };
    S.tick(function(dt){ if(fin) return; var sp = spin > 0 ? 0 : v*(boost > 0 ? 1.7 : 1); p += sp*dt; boost -= dt; if(spin > 0){ spin -= dt; me.rotation.y += dt*14; }
      ai.forEach(function(a, k){ a.p += a.v*dt*(0.95 + 0.1*Math.sin(Date.now()/900 + k)); put(a.k, a.p, (k - 1)*0.9); }); if(spin <= 0) put(me, p, 0.4); else { var a2 = p*2*PI; me.position.set(Math.cos(a2)*RX*1.03, 0, Math.sin(a2)*RZ*1.03); }
      if(boost > 0 && (fx = (fx + 1) % 5) === 0) S.burst(me.position.clone().add(new T.Vector3(0, 0.3, 0)), [0xff9800, 0xffeb3b], 3, 0.03, 0); if(p >= 3 && !fin){ fin = true; place = 1 + ai.filter(function(a){ return a.p >= 3; }).length; }
      S.camTo([Math.cos(p*2*PI)*RX*1.9, 6, Math.sin(p*2*PI)*RZ*1.9 + 2], [me.position.x, 0, me.position.z]); });
    var lap = function(){ return Math.min(3, Math.floor(p) + 1); };
    return {score: function(){ return fin ? [0, 100, 60, 40, 20][place] : Math.round(p*20); }, prompt: function(){}, done: function(){ return fin; },
      answer: function(i, ok, streak, done){ if(ok){ boost = 3; S.burst(me.position.clone().add(new T.Vector3(0, 0.5, 0)), [0xffd400, 0xffffff], 50); } else { spin = 1.2; S.shake(0.1); } S.wait(500, done); },
      endTitle: function(){ return fin ? ["", L("Tempat pertama! 🏆", "First place! 🏆"), L("Tempat kedua! 🥈", "Second place! 🥈"), L("Tempat ketiga! 🥉", "Third place! 🥉"), L("Tempat keempat", "Fourth place")][place] : L("Perlumbaan tamat", "Race over"); },
      extra: function(){ return '<p class="g10big">🏁 ' + (fin ? place + '/4' : L("Pusingan ", "Lap ") + lap() + '/3') + '</p>'; },
      finish: function(){ fin = true; S.burst(me.position.clone().add(new T.Vector3(0, 1, 0)), null, 180); }};
  }};

// ================= 10. 🏝️ Pulau Harta Karun =================
var TREASURE = {id: "treasure", ikon: "🏝️", ms: "Pulau Harta Karun", en: "Treasure Island", dms: "Gali harta, elak ketam!", den: "Dig for treasure, mind the crab!", n: 8,
  look: {sky: ["#3aa0ff", "#9ad6ff", "#e9f8ff"], cam: [0, 5, 9], look: [0, 0.8, 0], shadowExt: 12, exposure: 1.1},
  build: function(S, c){ var sea = mesh(new T.PlaneGeometry(200, 200, 40, 40), mat(0x1e88e5, {phys: true, r: 0.15, m: 0.1, op: 0.92, t: true}), false); sea.rotation.x = -PI/2; sea.position.y = 0.05; S.add(sea);
    var isl = mesh(new T.CylinderGeometry(6, 7.5, 1.2, 48), mat(0xf4d58d, {r: 0.95})); isl.position.y = -0.2; S.add(isl); S.add(palm(-3.5, -2, 1.1)); S.add(palm(3.8, -2.5, 1)); S.add(palm(-4.5, 2, 0.9)); for(var i = 0; i < 6; i++) S.add(at(ball(0.3 + rnd()*0.3, 0x9e9e9e, {r: 0.9, flat: true}, 6), -4 + rnd()*8, 0.45, -4 + rnd()*2));
    var X = grp(at(box(1.3, 0.02, 0.22, 0xc62828), 0, 0.41, 0), at(box(1.3, 0.02, 0.22, 0xc62828), 0, 0.41, 0)); X.children[0].rotation.y = PI/4; X.children[1].rotation.y = -PI/4; S.add(at(X, 0, 0, 1));
    var hole = mesh(new T.CylinderGeometry(0.9, 0.7, 0.02, 32), mat(0x6d4c41, {r: 1}), false); at(hole, 0, 0.41, 1); hole.scale.setScalar(0.01); S.add(hole);
    var digger = at(person(0x00897b, 0xc68642), 1.6, 0.4, 1.6); S.add(digger); var shovel = at(box(0.08, 1.1, 0.08, 0x8d6e63), 1.25, 1.1, 1.5); S.add(shovel);
    var crab = emo("🦀", 0.9); crab.position.set(-6, 0.8, 3); S.add(crab); var depth = 0, need = 5, found = false, gold = 0;
    S.tick(function(dt, t){ var pa = sea.geometry.attributes.position; for(var k = 0; k < pa.count; k++) pa.setZ(k, Math.sin(t*1.2 + pa.getX(k)*0.3 + pa.getY(k)*0.2)*0.08); pa.needsUpdate = true; });
    var chest = grp(at(box(1.1, 0.6, 0.7, 0x8d5524, {r: 0.6}), 0, 0.3, 0), at(box(1.14, 0.08, 0.74, 0xd4af37, {m: 0.9, r: 0.3}), 0, 0.42, 0)), lid = at(box(1.1, 0.25, 0.7, 0x8d5524, {r: 0.6}), 0, 0.72, 0); chest.add(lid); chest.visible = false; S.add(at(chest, 0, -0.8, 1));
    return {score: function(){ return gold; }, prompt: function(){},
      answer: function(i, ok, streak, done){ if(ok){ depth++; gold += 10; S.anim(500, function(e){ shovel.rotation.z = Math.sin(e*PI)*0.9; }, function(){ hole.scale.setScalar(Math.min(1, depth/need)); S.burst(new T.Vector3(0, 0.6, 1), [0xf4d58d, 0xd7b46a, 0xffffff], 60, 0.1); S.wait(300, done); }); }
        else { S.anim(900, function(e){ crab.position.x = -6 + 7*Math.sin(e*PI); crab.position.z = 3 - Math.sin(e*PI)*1.2; }, function(){ S.shake(0.15); done(); }); S.wait(450, function(){ S.shake(0.2); }); } },
      endTitle: function(){ return depth >= need ? L("Harta karun ditemui! 💰", "Treasure found! 💰") : L("Hampir jumpa harta!", "Nearly found the treasure!"); },
      extra: function(){ return '<p class="g10big">💰 ' + gold + '</p>'; },
      finish: function(){ S.camTo([2, 3.5, 5.5], [0, 0.8, 1]); if(depth >= Math.min(need, 3)){ chest.visible = true; S.anim(900, function(e){ chest.position.y = -0.8 + e*1.25; }, function(){ S.anim(600, function(e){ lid.rotation.x = -e*1.2; lid.position.z = -e*0.25; lid.position.y = 0.72 + e*0.15; });
            for(var k = 0; k < 24; k++){ (function(k){ var cn = cyl(0.12, 0.12, 0.03, 0xffc107, 20, {m: 0.95, r: 0.2, e: 0x5d4300, ei: 0.4}); S.add(at(cn, 0, 0.9, 1)); var vx = (rnd() - 0.5)*0.12, vz = (rnd() - 0.5)*0.12, vy = 0.12 + rnd()*0.08, y = 0.9;
              S.anim(1400, function(e){ y += vy; vy -= 0.006; cn.position.set(cn.position.x + vx, Math.max(0.42, y), cn.position.z + vz); cn.rotation.x += 0.3; }); })(k); } S.burst(new T.Vector3(0, 1.2, 1), [0xffd700, 0xffffff], 160); }, out); } }};
  }};

window.GAMES10 = {defs: [ARCHERY, PENALTY, BUBBLES, RUNNER, ROCKET, MASJID, GARDEN, MARBLE, KART, TREASURE], start: start, webgl: webgl, _kit: {kit: kit, label: label, mat: mat, box: box, cyl: cyl, ball: ball, cone: cone, torus: torus, at: at, grp: grp, emo: emo, tree: tree, palm: palm, cloud: cloud, person: person, stars: stars, skyTex: skyTex, out: out, ease: ease, L: L, setT: function(t){ T = t; }}};
})();
