/* IQ 19 · Peti Pola: the row follows a hidden rule (shape, colour, size, number or turn). Pick what comes next. Five rows open the vault. */
(function(){ var T = THREE, IQ = window.IQ;
var SH = ["box","sphere","cone","torus","cyl"], CO = [IQ.C.blue, IQ.C.teal, IQ.C.gold, IQ.C.crimson], AT = ["shape","color","size","count","turn"];
var AN = {shape:["bentuk","shape"], color:["warna","colour"], size:["saiz","size"], count:["bilangan","number"], turn:["arah putaran","turn"]}, RANGE = {shape:5, color:4, size:3, count:3, turn:4};
function geo(s){ return s === "box" ? new T.BoxGeometry(0.42, 0.42, 0.42) : s === "sphere" ? new T.SphereGeometry(0.25, 24, 16) : s === "cone" ? new T.ConeGeometry(0.26, 0.5, 4) : s === "torus" ? new T.TorusGeometry(0.2, 0.08, 12, 24) : new T.CylinderGeometry(0.2, 0.2, 0.42, 6); }
function item(it){ var g = new T.Group(), sc = [0.8, 1.1, 1.45][it.size], n = it.count + 1;
  for(var i = 0; i < n; i++){ var m = new T.Mesh(geo(SH[it.shape]), IQ.mat.glaze(CO[it.color])); m.scale.setScalar(sc); m.position.set((i - (n - 1) / 2) * 0.32 * sc, 0.25 * sc, (i % 2) * 0.12); m.rotation.y = it.turn * Math.PI / 4; if(SH[it.shape] === "torus") m.rotation.x = Math.PI / 2.4; m.castShadow = true; g.add(m); } return g; }
IQ.def("pola", {build:function(S, lv, A){ var R = IQ.rnd(Date.now() % 39989 + 7), round = 0, rounds = [5, 5, 5, 5, 6, 7][lv], N = lv === 4 ? 5 : lv === 5 ? 6 : 4, ask = lv === 5 ? 2 : N, shown = [], opts = [], answer = null, vary = [];
  var shelf = new T.Mesh(new T.BoxGeometry(7, 0.2, 1.3), IQ.mat.wood()); shelf.position.set(0, 0.9, -0.8); S.add(shelf); [-3.4, 3.4].forEach(function(x){ var l = new T.Mesh(new T.BoxGeometry(0.2, 0.9, 1.2), IQ.mat.wood()); l.position.set(x, 0.45, -0.8); S.add(l); });
  // the vault door behind: a brass disc with a star, it swings open when you win
  var door = new T.Group(), disc = new T.Mesh(new T.CylinderGeometry(1.7, 1.7, 0.2, 48), IQ.mat.brass()); disc.rotation.x = Math.PI / 2; disc.position.x = 1.7; door.add(disc);
  var dstar = new T.Mesh(new T.CylinderGeometry(1.3, 1.3, 0.02, 48), new T.MeshStandardMaterial({map:IQ.starTex("pv", "#6e4e14", "#f3dc9a", "#2AA198"), metalness:0.8, roughness:0.35})); dstar.rotation.x = Math.PI / 2; dstar.position.set(1.7, 0, 0.12); door.add(dstar);
  door.position.set(-1.7, 2.6, -2.1); S.add(door); var gl = new T.Mesh(new T.CircleGeometry(1.6, 40), IQ.mat.glow(0xffd27a, 2)); gl.position.set(0, 2.6, -2.25); S.add(gl, false);
  var q = new T.Mesh(new T.BoxGeometry(0.9, 0.06, 0.9), IQ.mat.glow(IQ.C.teal, 0.6)); S.add(q, false);
  S.size = 6.6; S.orb.tEl = 0.62; S.orb.cz = 0.5;
  function rule(){ var pick = AT.slice().sort(function(){ return R() - 0.5; }), base = {}; AT.forEach(function(a){ base[a] = Math.floor(R() * RANGE[a]); }); base.count = Math.floor(R() * 2);
    var nv = lv === 0 ? 1 : lv === 3 ? 3 : 2; vary = pick.slice(0, nv); var spec = vary.map(function(a, i){ var step = 1 + Math.floor(R() * (RANGE[a] - 1)), every = (lv === 2 || lv === 5) && i === 1 ? 2 : 1, step2 = lv === 4 && i === 0 ? 1 + ((step) % (RANGE[a] - 1)) : step; return {a:a, step:step, step2:step2, every:every, start:base[a]}; });
    return function(k){ var it = Object.assign({}, base); spec.forEach(function(s){ var v = s.start, j; for(j = 1; j <= Math.floor(k / s.every); j++) v += j <= 2 ? s.step : s.step2; it[s.a] = ((v % RANGE[s.a]) + RANGE[s.a]) % RANGE[s.a]; }); return it; }; }
  function clear(){ shown.concat(opts.map(function(o){ return o.g; })).forEach(function(g){ S.root.remove(g); }); shown = []; opts = []; }
  function newRound(){ clear(); var f = rule(), sp = 6.4 / N, x0 = -3.2 + sp / 2; for(var k = 0; k <= N; k++){ if(k === ask) continue; var g = item(f(k)); g.scale.setScalar(N > 4 ? 0.82 : 1); g.position.set(x0 + k * sp, 1.0, -0.8); S.add(g); shown.push(g); } q.position.set(x0 + ask * sp, 1.03, -0.8);
    answer = f(ask); var cands = [answer], tries = 0; while(cands.length < 4 && tries++ < 200){ var c = Object.assign({}, answer), a = vary[Math.floor(R() * vary.length)]; if(R() < 0.3) a = AT[Math.floor(R() * AT.length)]; c[a] = (c[a] + 1 + Math.floor(R() * (RANGE[a] - 1))) % RANGE[a];
      if(!cands.some(function(x){ return JSON.stringify(x) === JSON.stringify(c); })) cands.push(c); }
    cands.sort(function(){ return R() - 0.5; }).forEach(function(c, i){ var g = item(c), pad = new T.Mesh(new T.CylinderGeometry(0.55, 0.6, 0.12, 32), IQ.mat.glaze(0x14284a)); pad.position.y = -0.06; g.add(pad); g.position.set(-2.4 + i * 1.6, 0.12, 1.6); g.userData = {p:1, opt:i}; S.add(g); opts.push({g:g, it:c}); });
    A.say(A.L("Baris ", "Row ") + (round + 1) + "/" + rounds); }
  S.onTick = function(dt){ opts.forEach(function(o){ if(!S.reduce) o.g.rotation.y += dt * 0.4; }); };
  newRound();
  S.onPick = function(o){ if(!o || o.userData.opt == null || S.busy()) return; var c = opts[o.userData.opt]; A.move();
    var bad = AT.filter(function(a){ return c.it[a] !== answer[a]; });
    if(!bad.length){ S.hop(c.g, q.position.clone().add(new T.Vector3(0, 0.05, 0)), 1, 420, function(){ round++; if(round >= rounds){ S.tween(1400, function(e){ door.rotation.y = -e * 1.6; }, null, "io"); A.win(); } else setTimeout(newRound, 500); }); }
    else { A.say(A.L("Hampir: ", "Close: ") + bad.map(function(a){ return A.L(AN[a][0], AN[a][1]); }).join(", ") + A.L(" tidak ikut peraturan", " doesn't follow the rule"), 2400); var x0 = c.g.position.x; S.tween(320, function(e){ c.g.position.x = x0 + Math.sin(e * Math.PI * 6) * 0.1 * (1 - e); }); } };
  if(lv === 4) A.say(A.L("Peraturan bertukar di tengah barisan", "The rule changes partway along the row"), 2600); if(lv === 5) A.say(A.L("Cari yang hilang di tengah", "Find the missing one in the middle"), 2600);
  return {par:rounds, hint:function(){ return A.L("Yang berubah: ", "What changes: ") + vary.map(function(a){ return A.L(AN[a][0], AN[a][1]); }).join(A.L(" dan ", " and ")) + (lv === 2 ? A.L(" (satu berubah setiap dua langkah)", " (one of them every second step)") : ""); }}; }});
})();
