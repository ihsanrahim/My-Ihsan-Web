/* IQ 1 · Cermin Ibn al-Haytham: tap a cell to cycle empty → / → \ ; bend the beam into every target. */
(function(){ var T = THREE, IQ = window.IQ;
var LV = [{n:3, row:0, tg:[[2,2]], bk:[], sol:[[2,0,"\\"]]},
  {n:5, row:1, tg:[[3,3],[1,4]], bk:[[1,2],[4,3],[2,3]], sol:[[3,1,"\\"],[3,4,"/"]]},
  {n:6, row:0, tg:[[5,5]], bk:[[5,2],[2,3],[1,5],[4,5],[0,3]], sol:[[3,0,"\\"],[3,3,"\\"],[5,3,"\\"]]}];
// 0.6.38 levels 4-6: a random beam path with k mirrors; only k mirrors may be placed; extreme: targets must be lit in their numbered order
function gen(n, ntg, k, nbk, R){ for(var tr = 0; tr < 3000; tr++){ var row = Math.floor(R() * n), x = -1, z = row, dx = 1, dz = 0, used = {}, path = [], sol = [], ok = true;
    for(var m = 0; m <= k && ok; m++){ var run = m === k ? 99 : 1 + Math.floor(R() * (n - 1)); for(var s = 0; s < run; s++){ var nx = x + dx, nz = z + dz; if(nx < 0 || nz < 0 || nx >= n || nz >= n){ if(m < k) ok = false; break; } x = nx; z = nz; if(used[x + "," + z]){ ok = false; break; } path.push([x, z]); }
      if(!ok || m === k) break; if(x < 0 || path.filter(function(p){ return p[0] === x && p[1] === z; }).length > 1){ ok = false; break; } var t = R() < 0.5 ? "/" : "\\", t0 = dx; if(t === "/"){ dx = -dz; dz = -t0; } else { dx = dz; dz = t0; } used[x + "," + z] = 1; sol.push([x, z, t]); }
    if(!ok || sol.length !== k) continue; var cnt = {}; path.forEach(function(p){ cnt[p] = (cnt[p] || 0) + 1; }); var free = path.filter(function(p){ return !used[p[0] + "," + p[1]] && cnt[p] === 1; }); if(free.length < ntg + 2) continue;
    var tg = []; var step = Math.floor(free.length / ntg); for(var i = 0; i < ntg; i++){ var q = free[Math.min(free.length - 1, (i + 1) * step - 1 + (i === ntg - 1 ? free.length - ntg * step : 0))]; tg.push(q); }
    var onP = {}; path.forEach(function(p){ onP[p[0] + "," + p[1]] = 1; }); var bk = []; for(var b = 0; b < nbk * 4 && bk.length < nbk; b++){ var c = [Math.floor(R() * n), Math.floor(R() * n)]; if(!onP[c[0] + "," + c[1]] && !(c[0] === 0 && c[1] === row)) bk.push(c); }
    return {n:n, row:row, tg:tg, bk:bk, sol:sol, k:k}; } return null; }
IQ.def("mirror", {build:function(S, lv, A){ var D = lv < 3 ? LV[lv] : gen([7, 8, 9][lv - 3], [3, 4, 4][lv - 3], [4, 5, 6][lv - 3], [6, 10, 14][lv - 3], IQ.rnd(Date.now() % 77003 + lv)), n = D.n, ordered = lv === 5, maxM = lv >= 3 ? D.k : 99, cs = 1.2, B = IQ.tray(S, n, n, cs), mir = {}, beam = new T.Group(), tg = {}, blk = {};
  S.add(beam, false);
  D.bk.forEach(function(b){ var p = new T.Mesh(new T.CylinderGeometry(0.34, 0.4, 0.9, 8), IQ.mat.stone(0x9c8a6a)); p.position.copy(B.pos(b[0], b[1], 0.87)); var cap = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.1, 8), IQ.mat.brass()); cap.position.y = 0.48; p.add(cap); S.add(p); blk[b] = 1; });
  D.tg.forEach(function(t, ti){ var g = new T.Group(); if(ordered){ var nl = IQ.label(String(ti + 1), {fg:"#1a1405", s:0.5, font:"bold 150px sans-serif"}); nl.position.y = 0.06; g.add(nl); } var ring = new T.Mesh(new T.TorusGeometry(0.36, 0.06, 10, 32), IQ.mat.brass()); ring.rotation.x = Math.PI / 2; g.add(ring);
    var core = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.06, 24), IQ.mat.glaze(IQ.C.teal)); g.add(core); g.position.copy(B.pos(t[0], t[1], 0.46)); S.add(g); tg[t] = core; });
  var src = new T.Group(), sb = new T.Mesh(new T.BoxGeometry(0.6, 0.5, 0.6), IQ.mat.brass()); src.add(sb); var lens = new T.Mesh(new T.SphereGeometry(0.16, 16, 12), IQ.mat.glow(0xffe08a, 3)); lens.position.x = 0.32; src.add(lens);
  src.position.copy(B.pos(-1, D.row, 0.55)); S.add(src);
  var plateG = new T.BoxGeometry(cs * 1.05, 0.55, 0.06), plateM = IQ.mat.mat || IQ.mat.gold();
  function setMirror(x, z, k){ var key = x + "," + z; if(mir[key]){ S.root.remove(mir[key].m); delete mir[key]; } if(!k) return;
    var m = new T.Mesh(plateG, plateM); m.rotation.y = k === "/" ? Math.PI / 4 : -Math.PI / 4; m.position.copy(B.pos(x, z, 0.7)); var st = new T.Mesh(new T.CylinderGeometry(0.06, 0.1, 0.28, 8), IQ.mat.brass()); st.position.y = -0.3; m.add(st);
    m.castShadow = true; S.root.add(m); mir[key] = {k:k, m:m}; m.scale.set(0.2, 0.2, 0.2); S.tween(220, function(e){ m.scale.setScalar(0.2 + e * 0.8); }, null, "back"); }
  var bm = IQ.mat.glow(0xffe08a, 2.5);
  function trace(){ while(beam.children.length) beam.remove(beam.children[0]); var x = -1, z = D.row, dx = 1, dz = 0, hit = {}, order = [], pts = [B.pos(-1, D.row, 0.6)];
    for(var s = 0; s < 120; s++){ x += dx; z += dz; if(x < 0 || z < 0 || x >= n || z >= n){ pts.push(B.pos(x - dx * 0.5, z - dz * 0.5, 0.6)); break; } if(blk[[x, z]]){ pts.push(B.pos(x - dx * 0.45, z - dz * 0.45, 0.6)); break; }
      if(tg[[x, z]] && !hit[[x, z]]){ hit[[x, z]] = 1; order.push(x + "," + z); } var mm = mir[x + "," + z]; if(mm){ pts.push(B.pos(x, z, 0.6)); var t = dx; if(mm.k === "/"){ dx = -dz; dz = -t; } else { dx = dz; dz = t; } } }
    for(var i = 1; i < pts.length; i++){ var a = pts[i - 1], b = pts[i], len = a.distanceTo(b), c = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, len, 8), bm); c.position.copy(a).add(b).multiplyScalar(0.5); c.lookAt(b); c.rotateX(Math.PI / 2); beam.add(c);
      var gl = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, len, 8), new T.MeshBasicMaterial({color:0xffd27a, transparent:true, opacity:0.18, depthWrite:false})); gl.position.copy(c.position); gl.quaternion.copy(c.quaternion); beam.add(gl); }
    var all = true; D.tg.forEach(function(t){ var on = !!hit[t]; tg[t].material.emissive = new T.Color(on ? 0xffc84a : 0); tg[t].material.emissiveIntensity = on ? 2 : 0; if(!on) all = false; });
    if(all && ordered && order.join("|") !== D.tg.map(function(t){ return t.join(","); }).join("|")){ all = false; A.say(A.L("Semua kena, tetapi bukan mengikut nombor", "All lit, but not in number order")); }
    if(all) A.win(); }
  trace();
  S.onPick = function(o){ if(!o || !o.userData.cell) return; var c = o.userData.cell, k = c[0] + "," + c[1]; if(blk[c] || tg[c]) return; var cur = mir[k] ? mir[k].k : ""; if(!cur && Object.keys(mir).length >= maxM){ A.say(A.L("Hanya ", "Only ") + maxM + A.L(" cermin", " mirrors")); return; } setMirror(c[0], c[1], cur === "" ? "/" : cur === "/" ? "\\" : ""); A.move(); trace(); };
  if(lv >= 3) A.say(A.L("Cermin tersedia: ", "Mirrors available: ") + maxM, 2200);
  return {par:D.sol.reduce(function(a, q){ return a + (q[2] === "/" ? 1 : 2); }, 0), hint:function(){ for(var i = 0; i < D.sol.length; i++){ var s = D.sol[i], m = mir[s[0] + "," + s[1]]; if(!m || m.k !== s[2]){ return A.L("Cuba cermin ", "Try a mirror ") + s[2] + A.L(" di lajur ", " at column ") + (s[0] + 1) + A.L(", baris ", ", row ") + (s[1] + 1); } } return A.L("Buang cermin yang tidak perlu", "Remove the mirrors you don't need"); }}; }});
})();
