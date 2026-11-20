/* IQ 14 · Cermin Mihrab: the pattern must be symmetric across the brass axis (level 2: the diagonal, level 3: both axes). Tiles with a brass rim are given; tap the others to cycle colours. Each mirrored set has exactly one given tile, so look for it. */
(function(){ var T = THREE, IQ = window.IQ;
var COLS = [null, IQ.C.blue, IQ.C.teal, IQ.C.gold, IQ.C.crimson];
// 0.6.38 levels 4-6: full 8-way symmetry (both axes + diagonals); 5-6 add a row rule (each row holds every colour exactly twice) and give only as many tiles as needed for one answer
function rowSolve(orbs, n, k, fixed, limit){ var quota = n / k, cnt = [], i, sols = 0, first = null, val = orbs.map(function(o, i){ return fixed[i] == null ? 0 : fixed[i]; }); for(i = 0; i < n; i++){ cnt.push(new Array(k + 1).fill(0)); }
  var addO = function(oi, c, d){ orbs[oi].forEach(function(p){ cnt[p[1]][c] += d; }); }, okO = function(oi, c){ var per = {}; orbs[oi].forEach(function(p){ per[p[1]] = (per[p[1]] || 0) + 1; }); for(var r in per) if(cnt[r][c] + per[r] > quota) return false; return true; };
  orbs.forEach(function(o, oi){ if(val[oi]) addO(oi, val[oi], 1); });
  (function rec(oi){ if(sols >= limit) return; if(oi === orbs.length){ sols++; if(!first) first = val.slice(); return; } if(fixed[oi] != null){ rec(oi + 1); return; }
    var order = []; for(var c = 1; c <= k; c++) order.push(c); if(fixed.rnd) order.sort(function(){ return fixed.rnd() - 0.5; });
    order.forEach(function(c){ if(sols >= limit || !okO(oi, c)) return; val[oi] = c; addO(oi, c, 1); rec(oi + 1); addO(oi, c, -1); val[oi] = 0; }); })(0);
  return {n:sols, first:first}; }
IQ.mihrabSolve = rowSolve;
IQ.def("mihrab", {build:function(S, lv, A){ var n = [6, 6, 6, 8, 8, 10][lv], R = IQ.rnd(Date.now() % 50021 + 9), cs = n > 8 ? 0.78 : n > 6 ? 0.85 : 0.95, key = function(x, z){ return x + "," + z; }, d4 = lv >= 3, rule = lv >= 4, K = lv === 5 ? 5 : 4;
  var COLS = [null, IQ.C.blue, IQ.C.teal, IQ.C.gold, IQ.C.crimson, 0x6a4ab0];
  function orbit(x, z){ var o = {}; o[key(x, z)] = [x, z]; if(d4){ [[x, z], [z, x]].forEach(function(q){ [[q[0], q[1]], [n - 1 - q[0], q[1]], [q[0], n - 1 - q[1]], [n - 1 - q[0], n - 1 - q[1]]].forEach(function(r){ o[key(r[0], r[1])] = r; }); }); }
    else if(lv === 0) o[key(n - 1 - x, z)] = [n - 1 - x, z]; else if(lv === 1) o[key(z, x)] = [z, x]; else { o[key(n - 1 - x, z)] = [n - 1 - x, z]; o[key(x, n - 1 - z)] = [x, n - 1 - z]; o[key(n - 1 - x, n - 1 - z)] = [n - 1 - x, n - 1 - z]; } return Object.keys(o).map(function(k){ return o[k]; }); }
  var target = {}, given = {}, cur = {}, done = {}, orbs = [];
  for(var z = 0; z < n; z++) for(var x = 0; x < n; x++){ if(done[key(x, z)]) continue; var ob = orbit(x, z); ob.forEach(function(p){ done[key(p[0], p[1])] = 1; }); orbs.push(ob); }
  if(rule){ var fx = {rnd:R}, sol = rowSolve(orbs, n, K, fx, 1).first, keep = orbs.map(function(o, i){ return i; });
    orbs.forEach(function(o, i){ o.forEach(function(p){ target[key(p[0], p[1])] = sol[i]; }); });
    var fixedNow = {}; keep.forEach(function(i){ fixedNow[i] = sol[i]; }); keep.sort(function(){ return R() - 0.5; }).forEach(function(i){ var t = fixedNow[i]; delete fixedNow[i]; if(rowSolve(orbs, n, K, fixedNow, 2).n !== 1) fixedNow[i] = t; });
    Object.keys(fixedNow).forEach(function(i){ var o = orbs[i], g = o[Math.floor(R() * o.length)]; given[key(g[0], g[1])] = 1; }); }
  else orbs.forEach(function(o){ var col = R() < 0.3 ? 0 : 1 + Math.floor(R() * 4); o.forEach(function(p){ target[key(p[0], p[1])] = col; }); var g = o[Math.floor(R() * o.length)]; given[key(g[0], g[1])] = 1; });
  for(var kk in target) cur[kk] = given[kk] ? target[kk] : 0;
  var NC = rule ? K + 1 : 5;
  if(rule) A.say(A.L("Peraturan: setiap baris ada setiap warna tepat dua kali. Simetri pada kedua-dua paksi dan pepenjuru.", "Rule: every row holds each colour exactly twice. Symmetric on both axes and both diagonals."), 4000); else if(d4) A.say(A.L("Simetri pada kedua-dua paksi dan kedua-dua pepenjuru", "Symmetric on both axes and both diagonals"), 2600);
  var B = IQ.tray(S, n, n, cs, {tiles:false}), tiles = {}, geo = new T.BoxGeometry(cs * 0.92, 0.18, cs * 0.92), base = new T.MeshStandardMaterial({color:0x4a5d80, roughness:0.85}), M = COLS.slice(0, rule ? K + 1 : 5).map(function(c, i){ return c == null ? base : IQ.mat.glaze(c, {map:IQ.starTex("mh" + i, "#" + new T.Color(c).getHexString(), "rgba(255,240,210,.4)", "rgba(255,255,255,.3)")}); });
  var k; for(z = 0; z < n; z++) for(x = 0; x < n; x++){ k = key(x, z); var m = new T.Mesh(geo, M[cur[k]]); m.position.copy(B.pos(x, z, 0.4)); m.userData = {p:given[k] ? 0 : 1, cell:[x, z]}; S.add(m); tiles[k] = m;
    if(given[k]){ var rim = new T.Mesh(new T.TorusGeometry(cs * 0.36, 0.04, 6, 4), IQ.mat.brass()); rim.rotation.x = Math.PI / 2; rim.rotation.z = Math.PI / 4; rim.position.copy(B.pos(x, z, 0.51)); S.add(rim, false); m.position.y = 0.44;
      if(!cur[k]){ var dot = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.03, 12), IQ.mat.brass()); dot.position.copy(B.pos(x, z, 0.54)); S.add(dot, false); } } }
  // the brass axis (and a small niche at its head)
  var ax = function(a, b){ var pa = B.pos(a[0], a[1], 0.55), pb = B.pos(b[0], b[1], 0.55), len = pa.distanceTo(pb), c = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, len, 8), IQ.mat.gold()); c.position.copy(pa).add(pb).multiplyScalar(0.5); c.lookAt(pb); c.rotateX(Math.PI / 2); S.add(c, false);
    var ni = new T.Mesh(new T.TorusGeometry(0.22, 0.05, 8, 16, Math.PI), IQ.mat.gold()); ni.position.copy(pa); ni.position.y += 0.2; ni.lookAt(pb.x, pa.y + 0.2, pb.z); S.add(ni, false); };
  if(lv === 0 || lv === 2 || d4) ax([(n - 1) / 2, -0.7], [(n - 1) / 2, n - 0.3]); if(lv === 1 || d4) ax([-0.7, -0.7], [n - 0.3, n - 0.3]); if(lv === 2 || d4) ax([-0.7, (n - 1) / 2], [n - 0.3, (n - 1) / 2]); if(d4) ax([n - 0.3, -0.7], [-0.7, n - 0.3]);
  S.size = n * cs + 1.2;
  function solved(){ for(var k in target) if(cur[k] !== target[k]) return false; return true; }
  S.onPick = function(o){ if(!o || !o.userData.cell) return; var c = o.userData.cell, k = key(c[0], c[1]); cur[k] = (cur[k] + 1) % NC; o.material = M[cur[k]]; A.move(); S.tween(160, function(e){ o.position.y = 0.4 + Math.sin(e * Math.PI) * 0.12; });
    if(solved()) A.win(); };
  var par = 0; for(var kp in target) if(!given[kp]) par += target[kp];
  return {par:par, hint:function(){ for(var k in target){ if(cur[k] !== target[k] && !given[k]){ var p = k.split(",").map(Number), src = orbit(p[0], p[1]).filter(function(q){ return given[key(q[0], q[1])]; })[0];
    if(!src) return A.L("Petak lajur ", "The tile at column ") + (p[0] + 1) + A.L(", baris ", ", row ") + (p[1] + 1) + A.L(" ialah warna ke-", " is colour no. ") + target[k] + A.L(" (ikut peraturan baris)", " (from the row rule)");
    return A.L("Petak lajur ", "The tile at column ") + (p[0] + 1) + A.L(", baris ", ", row ") + (p[1] + 1) + A.L(" mencerminkan jubin berbingkai di lajur ", " mirrors the rimmed tile at column ") + (src[0] + 1) + A.L(", baris ", ", row ") + (src[1] + 1); } } return ""; }}; }});
})();
