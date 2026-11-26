/* My Ihsan 0.7.73 (owner: "the 3 types can also meet each other"): the phone pets' meeting room. Uses Astra VPet 2's character builders
   (window.VPetArt.cat / bird / fish) so the friends look exactly like their own homes. Up to 3 pets: cats roam the floor, birds share a perch,
   fish share an aquarium on a little table. They notice each other, visit, look up at the bird, press their nose to the glass, and hearts float
   when friends are close. Tap a pet, 🎾 play together, 🍪 treats for everyone, 📸 photo.
   PetMeet.mount(host, {pets:[state…], save(state), T(ms,en), vib(ms), lowfx, onPhoto(dataURL)}) → {stop()} */
(function(){ "use strict";
var THREE = window.THREE;
function clamp(x, a, b){ return Math.max(a, Math.min(b, x)); }
function ease(a, b, dt, k){ return a + (b - a) * (1 - Math.exp(-dt * k)); }
var RATES = {hunger: 6, joy: 4, energy: 3, clean: 2};
function settle(st){ var now = Date.now(), h = st.t ? Math.min(24, Math.max(0, (now - st.t) / 36e5)) : 0; st.s = st.s || {hunger: 80, joy: 80, energy: 80, clean: 85, health: 100};
  if(h > 0){ if(st.sleeping){ st.s.energy = clamp(st.s.energy + 14 * h, 5, 100); st.s.hunger = clamp(st.s.hunger - 2 * h, 5, 100); } else Object.keys(RATES).forEach(function(k){ st.s[k] = clamp((+st.s[k] || 50) - RATES[k] * h, 5, 100); }); } st.t = now; }
function css(){ if(document.getElementById("pmCss")) return; var s = document.createElement("style"); s.id = "pmCss"; s.textContent =
  ".pm{position:absolute;inset:0;overflow:hidden;font-family:system-ui,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none}.pm canvas{position:absolute;inset:0;width:100%!important;height:100%!important}" +
  ".pmTag{position:absolute;transform:translate(-50%,-100%);background:#fffe;border-radius:999px;padding:3px 9px;font:800 12px system-ui;color:#3b2f2f;box-shadow:0 3px 10px #0002;pointer-events:none;white-space:nowrap}" +
  ".pmBar{position:absolute;left:10px;right:10px;bottom:12px;display:flex;justify-content:center;gap:8px}.pmBar button{border:0;border-radius:18px;padding:9px 14px;background:#fffe;box-shadow:0 4px 12px #0002;font:800 13px system-ui;color:#3b2f2f;display:flex;align-items:center;gap:6px}.pmBar button:active{transform:scale(.95)}" +
  ".pmSay{position:absolute;left:50%;top:12px;transform:translateX(-50%);background:#fffe;border-radius:16px;padding:7px 14px;font:700 13px system-ui;color:#3b2f2f;box-shadow:0 4px 12px #0002;transition:opacity .4s;pointer-events:none;max-width:86%;text-align:center}";
  document.head.appendChild(s); }

window.PetMeet = {version: "1.0.0", mount: function(host, opts){
  opts = opts || {}; css(); var T = opts.T || function(a, b){ return b; }, lowfx = !!opts.lowfx, Art = window.VPetArt, alive = true, raf = 0;
  var pets = (opts.pets || []).slice(0, 3); pets.forEach(function(p){ settle(p); p.sleeping = false; });
  var wrap = document.createElement("div"); wrap.className = "pm"; host.appendChild(wrap);
  var W = host.clientWidth || 360, Hh = host.clientHeight || 520;
  var renderer = new THREE.WebGLRenderer({antialias: !lowfx, alpha: false, preserveDrawingBuffer: true, powerPreference: "low-power"}); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowfx ? 1 : 2)); renderer.setSize(W, Hh);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = !lowfx; renderer.shadowMap.type = THREE.PCFSoftShadowMap; wrap.appendChild(renderer.domElement);
  var scene = new THREE.Scene(); scene.background = new THREE.Color("#f3e6d6"); scene.fog = new THREE.Fog("#f3e6d6", 14, 30);
  var cam = new THREE.PerspectiveCamera(38, W / Hh, 0.1, 60); var camT = new THREE.Vector3(0, 1.4, -1.0); function fitCam(){ var half = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect, dist = Math.max(9.5, 3.15 / half - 2.2); cam.position.set(0, 2.2 + dist * 0.3, dist); cam.lookAt(camT); } fitCam();
  scene.add(new THREE.HemisphereLight(0xfff7e9, 0x8a7a66, 1.2)); var sun = new THREE.DirectionalLight(0xffeed9, 2.5); sun.position.set(-4, 7, 5); sun.castShadow = !lowfx; sun.shadow.mapSize.set(1024, 1024); sun.shadow.normalBias = 0.04;
  ["left","bottom"].forEach(function(k){ sun.shadow.camera[k] = -7; }); ["right","top"].forEach(function(k){ sun.shadow.camera[k] = 7; }); sun.shadow.camera.far = 24; scene.add(sun); var rim = new THREE.DirectionalLight(0xd5e9e9, 1.2); rim.position.set(4, 4, -3); scene.add(rim);
  (function(){ var studio = new THREE.Scene(); studio.background = new THREE.Color(0xa8b8b3); var pg = new THREE.PlaneGeometry(6, 4), pm = new THREE.MeshBasicMaterial({color: 0xffffff}), a = new THREE.Mesh(pg, pm); a.position.set(-3, 4, 4); a.lookAt(0, 0, 0); studio.add(a); var b = a.clone(); b.position.set(4, 2, -2); b.lookAt(0, 0, 0); studio.add(b);
    var pmrem = new THREE.PMREMGenerator(renderer), rt = pmrem.fromScene(studio, 0.08, 0.1, 30); scene.environment = rt.texture; scene.userData.rt = rt; pmrem.dispose(); pg.dispose(); pm.dispose(); })();
  function M(c, o){ o = o || {}; return new THREE.MeshStandardMaterial({color: c, roughness: o.r == null ? 0.7 : o.r, metalness: o.m || 0, transparent: !!o.op, opacity: o.op || 1, side: o.ds ? THREE.DoubleSide : THREE.FrontSide, depthWrite: o.op ? false : true}); }
  function mesh(g, m, x, y, z){ var o = new THREE.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); o.castShadow = o.receiveShadow = !lowfx; scene.add(o); return o; }
  // ---- the room
  var floor = mesh(new THREE.CircleGeometry(8, 64), M("#e2c49c", {r: 0.85})); floor.rotation.x = -Math.PI / 2;
  var rug = mesh(new THREE.CircleGeometry(3.2, 64), M("#f7b2b7", {r: 1})); rug.rotation.x = -Math.PI / 2; rug.position.y = 0.01;
  var wall = mesh(new THREE.CylinderGeometry(8, 8, 7, 64, 1, true, Math.PI * 0.62, Math.PI * 0.76), M("#fbf1e4", {r: 0.95, ds: true})); wall.position.y = 3.5; wall.receiveShadow = true; wall.castShadow = false;
  var win = mesh(new THREE.PlaneGeometry(3.2, 2.4), new THREE.MeshBasicMaterial({color: 0xdff3ff})); win.position.set(0, 3.6, -7.6);
  var wframe = mesh(new THREE.TorusGeometry(1.75, 0.08, 8, 40, Math.PI), M("#c8a27a")); wframe.position.set(0, 4.8, -7.55);
  var counts = {cat: 0, bird: 0, fish: 0}; pets.forEach(function(p){ counts[p.sp] = (counts[p.sp] || 0) + 1; });
  var TANK = new THREE.Vector3(1.85, 2.25, -2.3), TANKR = 1.1, PERCH = new THREE.Vector3(-1.95, 2.35, -2.3);
  if(counts.fish){ var wood = M("#a8754a", {r: 0.6}); var top = mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.14, 40), wood); top.position.set(TANK.x, 1.02, TANK.z); [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]].forEach(function(l){ mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 10), wood, TANK.x + l[0] * 0.8, 0.5, TANK.z + l[1] * 0.8); });
    var glass = mesh(new THREE.SphereGeometry(TANKR + 0.07, 48, 32), new THREE.MeshPhysicalMaterial({color: 0xe9f8ff, roughness: 0.03, transmission: 0, transparent: true, opacity: 0.16, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false})); glass.position.copy(TANK); glass.castShadow = false;
    var water = mesh(new THREE.SphereGeometry(TANKR, 48, 32, 0, Math.PI * 2, Math.PI * 0.2, Math.PI * 0.8), M("#5cc8f0", {op: 0.3, r: 0.1, ds: true})); water.position.copy(TANK); water.castShadow = false;
    var sand = mesh(new THREE.SphereGeometry(TANKR * 0.82, 32, 12, 0, Math.PI * 2, Math.PI * 0.72, Math.PI * 0.28), M("#ecd3a0", {r: 1})); sand.position.copy(TANK); sand.position.y += 0.05;
    for(var k = 0; k < 3; k++){ var weed = mesh(new THREE.CapsuleGeometry(0.05, 0.6, 4, 8), M(k % 2 ? "#3aa96b" : "#58c27d")); weed.position.set(TANK.x - 0.5 + k * 0.45, TANK.y - 0.55, TANK.z - 0.4 + (k % 2) * 0.3); weed.userData.sway = k; } }
  if(counts.bird){ var pole = mesh(new THREE.CylinderGeometry(0.07, 0.11, PERCH.y, 12), M("#8a5b36")); pole.position.set(PERCH.x, PERCH.y / 2, PERCH.z); var base = mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.12, 24), M("#8a5b36")); base.position.set(PERCH.x, 0.06, PERCH.z);
    var bar = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.9, 12), M("#a8754a")); bar.rotation.z = Math.PI / 2; bar.position.copy(PERCH); var leaf = mesh(new THREE.SphereGeometry(0.5, 16, 10), M("#6cc07a")); leaf.scale.set(1.4, 0.6, 1); leaf.position.set(PERCH.x + 0.3, PERCH.y + 1.1, PERCH.z - 0.3); }
  var yarn = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), M("#e86a7c", {r: 0.9})); yarn.castShadow = !lowfx; yarn.visible = false; scene.add(yarn); var yarnV = new THREE.Vector3();
  // ---- the friends
  var A = [], H = {cat: 1.55, bird: 1.0, fish: 0.95}, bySp = {cat: 0, bird: 0, fish: 0};
  pets.forEach(function(st, i){ var sp = st.sp, v = Art && Art[sp] ? Art[sp](THREE, Object.assign({}, st.look || {}, {acc: "none"}), lowfx) : null; if(!v) return; v.update(0, 0.016, {});
    v.root.updateMatrixWorld(true); var bb = new THREE.Box3().setFromObject(v.root), size = bb.getSize(new THREE.Vector3()), sc = H[sp] / Math.max(0.01, sp === "fish" ? Math.max(size.x, size.z) : size.y); v.root.scale.setScalar(sc);
    var slot = bySp[sp]++, a = {st: st, sp: sp, v: v, mode: "idle", phase: 0, timer: 1 + Math.random() * 2, speed: 0, gait: 0, target: null, look: new THREE.Vector3(0, 1.5, 6), poke: 0, sc: sc};
    if(sp === "cat") v.root.position.set(-0.8 + slot * 1.6, 0, 0.9 + slot * 0.3);
    else if(sp === "bird") v.root.position.set(PERCH.x - 0.45 + slot * 0.9, PERCH.y + 0.02, PERCH.z);
    else v.root.position.set(TANK.x - 0.3 + slot * 0.5, TANK.y, TANK.z);
    scene.add(v.root); v.root.traverse(function(o){ if(o.isMesh){ o.castShadow = !lowfx; } }); a.tag = document.createElement("div"); a.tag.className = "pmTag"; a.tag.textContent = ({cat: "🐈", bird: "🐦", fish: "🐠"})[sp] + " " + (st.n || ""); wrap.appendChild(a.tag); A.push(a); });
  // ---- hearts
  var fx = [], heartTex = (function(){ var c = document.createElement("canvas"); c.width = c.height = 96; var g = c.getContext("2d"); g.font = "72px serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("💖", 48, 54); var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  function heart(p){ if(fx.length > (lowfx ? 10 : 24)) return; var s = new THREE.Sprite(new THREE.SpriteMaterial({map: heartTex, transparent: true, depthWrite: false})); s.position.copy(p); s.scale.setScalar(0.32); scene.add(s); fx.push({o: s, t: 0, v: new THREE.Vector3((Math.random() - 0.5) * 0.3, 0.7 + Math.random() * 0.4, 0)}); }
  function headOf(a){ var p = new THREE.Vector3(); (a.v.head || a.v.root).getWorldPosition(p); return p; }
  // ---- UI
  var sayEl = document.createElement("div"); sayEl.className = "pmSay"; sayEl.style.opacity = 0; wrap.appendChild(sayEl); var sayT = 0;
  function say(t, s){ sayEl.textContent = t; sayEl.style.opacity = 1; sayT = s || 2.6; }
  var bar = document.createElement("div"); bar.className = "pmBar"; bar.innerHTML = '<button data-pm="play">🎾 ' + T("Main bersama", "Play together") + '</button><button data-pm="treat">🍪 ' + T("Hadiah", "Treats") + '</button><button data-pm="photo">📸</button>'; wrap.appendChild(bar);
  var playT = 0;
  bar.querySelectorAll("[data-pm]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); var k = b.getAttribute("data-pm");
    if(k === "play"){ playT = 7; yarn.visible = !!counts.cat; yarn.position.set(0, 0.22, 1.2); yarnV.set((Math.random() - 0.5) * 3, 0, -1.2 - Math.random() * 1.2); A.forEach(function(a){ a.mode = "play"; a.phase = 0; a.timer = 7; }); say(T("Jom main bersama!", "Let's all play together!")); if(opts.vib) opts.vib(20); }
    else if(k === "treat"){ A.forEach(function(a){ a.st.s.hunger = clamp(a.st.s.hunger + 12, 5, 100); a.st.s.joy = clamp(a.st.s.joy + 4, 5, 100); a.mode = "eat"; a.phase = 0; a.timer = 2.4; heart(headOf(a).add(new THREE.Vector3(0, 0.5, 0))); }); say(T("Bismillah… sedapnya!", "Bismillah… yummy for everyone!")); persist(); }
    else if(k === "photo"){ renderer.render(scene, cam); var url = renderer.domElement.toDataURL("image/png"); if(opts.onPhoto) opts.onPhoto(url); } }; });
  // tap a friend
  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  renderer.domElement.addEventListener("pointerdown", function(e){ var r = renderer.domElement.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, cam);
    var hit = null; A.forEach(function(a){ if(!hit && ray.intersectObject(a.v.root, true).length) hit = a; }); if(!hit) return;
    hit.mode = "poke"; hit.phase = 0; hit.timer = 1.2; hit.st.s.joy = clamp(hit.st.s.joy + 3, 5, 100); for(var i = 0; i < 3; i++) heart(headOf(hit).add(new THREE.Vector3((Math.random() - 0.5) * 0.6, 0.4, 0)));
    A.forEach(function(o){ if(o !== hit) o.look.copy(headOf(hit)); }); say(hit.st.n + " 💖"); if(opts.vib) opts.vib(15); });
  // ---- behaviour
  var catsGoals = function(a){ var g = [new THREE.Vector3((Math.random() - 0.5) * 3.6, 0, -0.6 + Math.random() * 2.2)];
    if(counts.fish) g.push(new THREE.Vector3(TANK.x - 0.3, 0, TANK.z + 1.45)); if(counts.bird) g.push(new THREE.Vector3(PERCH.x + 0.4, 0, PERCH.z + 1.3));
    A.forEach(function(o){ if(o !== a && o.sp === "cat") g.push(o.v.root.position.clone().add(new THREE.Vector3(1.1, 0, 0.3))); }); return g[Math.floor(Math.random() * g.length)]; };
  function nearest(a, sp){ var best = null, bd = 99; A.forEach(function(o){ if(o === a || (sp && o.sp !== sp)) return; var d = o.v.root.position.distanceTo(a.v.root.position); if(d < bd){ bd = d; best = o; } }); return best; }
  var clock = new THREE.Clock(), saveT = 0, elapsed = 0, lastF = 0;
  function frame(now){ if(!alive) return; raf = requestAnimationFrame(frame); if(!document.body.contains(wrap)){ stop(); return; } if(document.hidden) return; if(now - lastF < (lowfx ? 31 : 15)) return; lastF = now;
    var dt = Math.min(0.05, clock.getDelta()); elapsed += dt; var sw = host.clientWidth, sh = host.clientHeight; if(sw && sh && (sw !== W || sh !== Hh)){ W = sw; Hh = sh; renderer.setSize(W, Hh); cam.aspect = W / Hh; cam.updateProjectionMatrix(); fitCam(); }
    if(playT > 0){ playT -= dt; if(yarn.visible){ yarn.position.addScaledVector(yarnV, dt); yarnV.multiplyScalar(Math.pow(0.45, dt)); var rr = Math.hypot(yarn.position.x, yarn.position.z); if(rr > 3.3){ yarn.position.x *= 3.2 / rr; yarn.position.z *= 3.2 / rr; yarnV.multiplyScalar(-0.6); } yarn.rotation.x += yarnV.z * dt * 4; yarn.rotation.z -= yarnV.x * dt * 4; } if(playT <= 0) yarn.visible = false; }
    A.forEach(function(a){ var r = a.v.root, st = a.st; a.timer -= dt; a.phase += dt; var moving = false;
      if(a.sp === "cat"){ if(a.timer <= 0 && a.mode !== "walk"){ a.target = catsGoals(a); a.mode = "walk"; a.timer = 6; }
        var goal = playT > 0 && yarn.visible ? yarn.position : a.mode === "walk" ? a.target : null;
        if(goal){ var dx = goal.x - r.position.x, dz = goal.z - r.position.z, d = Math.hypot(dx, dz);
          if(d > (playT > 0 ? 0.55 : 0.2)){ var want = Math.atan2(dx, dz), turn = Math.atan2(Math.sin(want - r.rotation.y), Math.cos(want - r.rotation.y)); r.rotation.y += turn * Math.min(1, dt * 5); a.speed = ease(a.speed, playT > 0 ? 1.4 : 0.8, dt, 4); moving = true; }
          else if(playT > 0){ yarnV.set((Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5); heart(headOf(a)); st.s.joy = clamp(st.s.joy + 2, 5, 100); }
          else { a.mode = ["idle", "idle", "groom", "roll", "stretch", "play"][Math.floor(Math.random() * 6)]; a.phase = 0; a.timer = 3 + Math.random() * 3; } }
        if(!moving) a.speed = ease(a.speed, 0, dt, 6); r.position.x += Math.sin(r.rotation.y) * a.speed * dt; r.position.z += Math.cos(r.rotation.y) * a.speed * dt;
        var rad = Math.hypot(r.position.x, r.position.z); if(rad > 3.6){ r.position.x *= 3.6 / rad; r.position.z *= 3.6 / rad; }
        if(counts.fish){ var tx = r.position.x - TANK.x, tz = r.position.z - TANK.z, td = Math.hypot(tx, tz); if(td < 1.3){ r.position.x = TANK.x + tx / td * 1.3; r.position.z = TANK.z + tz / td * 1.3; } }
        if(counts.bird){ var bx = r.position.x - PERCH.x, bz = r.position.z - PERCH.z, bd2 = Math.hypot(bx, bz); if(bd2 < 0.9){ r.position.x = PERCH.x + bx / bd2 * 0.9; r.position.z = PERCH.z + bz / bd2 * 0.9; } } }
      else if(a.sp === "bird"){ var cat = nearest(a, "cat"); if(a.timer <= 0){ a.mode = cat && cat.v.root.position.distanceTo(r.position) < 2.6 ? "play" : ["idle", "groom", "idle", "stretch"][Math.floor(Math.random() * 4)]; a.phase = 0; a.timer = 3 + Math.random() * 3; }
        var face = cat ? Math.atan2(cat.v.root.position.x - r.position.x, cat.v.root.position.z - r.position.z) : 0; r.rotation.y = ease(r.rotation.y, clamp(face, -1.2, 1.2), dt, 2); r.position.y = PERCH.y + 0.02 + (a.mode === "play" ? Math.abs(Math.sin(elapsed * 7)) * 0.12 : 0); }
      else { var tgt = a.target; var cat2 = nearest(a, "cat"); var c2 = cat2 && Math.hypot(cat2.v.root.position.x - TANK.x, cat2.v.root.position.z - TANK.z) < 1.9;
        if(c2){ var dir = new THREE.Vector3(cat2.v.root.position.x - TANK.x, 0, cat2.v.root.position.z - TANK.z).normalize(); tgt = TANK.clone().addScaledVector(dir, TANKR * 0.55); }
        else if(!tgt || a.timer <= 0 || r.position.distanceTo(tgt) < 0.15){ tgt = TANK.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.1, (Math.random() - 0.4) * 0.6, (Math.random() - 0.5) * 0.9)); a.timer = 2 + Math.random() * 3; if(a.mode !== "eat" && a.mode !== "poke") a.mode = playT > 0 ? "zoomies" : "idle"; }
        a.target = tgt; var fd = tgt.clone().sub(r.position), fl = fd.length(); if(fl > 0.03){ r.position.addScaledVector(fd.normalize(), Math.min(fl, dt * (playT > 0 ? 0.9 : 0.45))); var yaw = Math.atan2(fd.x, fd.z); r.rotation.y += Math.atan2(Math.sin(yaw - r.rotation.y), Math.cos(yaw - r.rotation.y)) * Math.min(1, dt * 3); a.speed = ease(a.speed, 0.8, dt, 3); } else a.speed = ease(a.speed, 0.1, dt, 3);
        var off = r.position.clone().sub(TANK); if(off.length() > TANKR * 0.62) r.position.copy(TANK).add(off.setLength(TANKR * 0.62)); if(c2 && Math.random() < dt * 0.8) heart(r.position.clone().add(new THREE.Vector3(0, 0.4, 0))); }
      if((a.mode === "poke" || a.mode === "eat" || a.mode === "play" || a.mode === "zoomies") && a.timer <= 0 && a.sp !== "cat"){ a.mode = "idle"; a.phase = 0; }
      if(a.mode === "poke" && a.timer <= 0) a.mode = "idle";
      // look at the closest friend
      var fr = nearest(a); if(fr){ var hp = headOf(fr); a.look.lerp(hp, 1 - Math.exp(-dt * 2)); } var me = headOf(a), lx = a.look.x - me.x, ly = a.look.y - me.y, lz = a.look.z - me.z;
      var rel = Math.atan2(lx, lz) - r.rotation.y; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
      a.gait += dt * (a.speed * 5 + 1); a.v.update(elapsed, dt, {speed: a.speed, gait: a.gait, mode: a.mode === "walk" ? "idle" : a.mode, phase: a.phase, lookX: clamp(rel * 1.2, -1, 1), lookY: clamp(ly / Math.max(1, Math.hypot(lx, lz)), -1, 1), blink: Math.sin(elapsed * 1.7 + a.sc * 9) > 0.985 ? 1 : 0, happy: clamp(st.s.joy / 100, 0, 1), time: elapsed});
      if(fr && fr.sp !== a.sp && r.position.distanceTo(fr.v.root.position) < 2.4 && Math.random() < dt * 0.35){ heart(me.clone().lerp(headOf(fr), 0.5).add(new THREE.Vector3(0, 0.35, 0))); st.s.joy = clamp(st.s.joy + 0.6, 5, 100); }
      var v3 = me.clone().add(new THREE.Vector3(0, a.sp === "fish" ? 0.55 : 0.6, 0)).project(cam); a.tag.style.left = ((v3.x + 1) / 2 * W) + "px"; a.tag.style.top = ((1 - v3.y) / 2 * Hh) + "px"; a.tag.style.opacity = v3.z < 1 ? 1 : 0; });
    scene.traverse(function(o){ if(o.userData.sway != null) o.rotation.z = Math.sin(elapsed * 1.3 + o.userData.sway) * 0.18; });
    for(var i = fx.length - 1; i >= 0; i--){ var f = fx[i]; f.t += dt; f.o.position.addScaledVector(f.v, dt); f.o.material.opacity = 1 - f.t / 1.8; if(f.t > 1.8){ scene.remove(f.o); f.o.material.dispose(); fx.splice(i, 1); } }
    if(sayT > 0){ sayT -= dt; if(sayT <= 0) sayEl.style.opacity = 0; }
    saveT += dt; if(saveT > 15){ saveT = 0; A.forEach(function(a){ a.st.s.joy = clamp(a.st.s.joy + 1, 5, 100); a.st.xp = (a.st.xp || 0) + 1; }); persist(); }
    renderer.render(scene, cam); }
  function persist(){ A.forEach(function(a){ a.st.t = Date.now(); try{ if(opts.save) opts.save(a.st); }catch(e){} }); }
  function stop(){ if(!alive) return; alive = false; cancelAnimationFrame(raf); persist(); scene.traverse(function(o){ if(o.geometry) o.geometry.dispose(); if(o.material){ (Array.isArray(o.material) ? o.material : [o.material]).forEach(function(m){ Object.keys(m).forEach(function(k){ if(m[k] && m[k].isTexture) m[k].dispose(); }); m.dispose(); }); } });
    if(scene.userData.rt) scene.userData.rt.dispose(); heartTex.dispose(); renderer.dispose(); try{ renderer.forceContextLoss(); }catch(e){} if(wrap.parentNode) wrap.parentNode.removeChild(wrap); }
  if(A.length < 2) say(T("Ajak kawan untuk berjumpa!", "Adopt a friend so they can meet!")); else say(A.map(function(a){ return a.st.n; }).join(" · ") + " · " + T("berjumpa!", "meet up!"));
  raf = requestAnimationFrame(frame);
  return {stop: stop, state: function(){ return pets; }, _dbg: {actors: A, scene: scene}}; }};
})();
