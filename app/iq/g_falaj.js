/* IQ 10 · Saluran Falaj: tap a stone to turn its channel 90°. Water from the spring must reach every garden. */
(function(){ var T = THREE, IQ = window.IQ;
var DIRS = [[0,-1],[1,0],[0,1],[-1,0]];   // bits 1 N, 2 E, 4 S, 8 W
function rotM(m, r){ for(var i = 0; i < r; i++) m = ((m << 1) | (m >> 3)) & 15; return m; }
IQ.def("falaj", {build:function(S, lv, A){ var n = [3, 4, 5, 7, 6, 8][lv], outs = [1, 2, 3, 4, 4, 5][lv], wrap = lv >= 4, R = IQ.rnd(Date.now() % 31337 + 2), cs = 1.15, conn = [], rot = [], src = [Math.floor(n / 2), 0], gardens = [];
  // random spanning tree (DFS) from the spring; gardens are leaves
  for(var tr = 0; tr < 200; tr++){ conn = []; for(var i = 0; i < n * n; i++) conn.push(0); var seen = {}, st = [src]; seen[src] = 1;
    while(st.length){ var c = st[st.length - 1], nb = []; DIRS.forEach(function(d, k){ var q = [c[0] + d[0], c[1] + d[1]]; if(wrap){ q = [(q[0] + n) % n, (q[1] + n) % n]; } if(q[0] >= 0 && q[1] >= 0 && q[0] < n && q[1] < n && !seen[q]) nb.push([q, k]); });
      if(!nb.length){ st.pop(); continue; } var pk = nb[Math.floor(R() * nb.length)], q2 = pk[0], k2 = pk[1]; conn[c[1] * n + c[0]] |= 1 << k2; conn[q2[1] * n + q2[0]] |= 1 << ((k2 + 2) % 4); seen[q2] = 1; st.push(q2); }
    var leaves = []; for(i = 0; i < n * n; i++){ var b = conn[i], cnt = (b & 1) + (b >> 1 & 1) + (b >> 2 & 1) + (b >> 3 & 1); if(cnt === 1 && i !== src[1] * n + src[0]) leaves.push(i); }
    if(leaves.length >= outs){ gardens = []; while(gardens.length < outs){ var l = leaves.splice(Math.floor(R() * leaves.length), 1)[0]; gardens.push(l); } break; } }
  for(i = 0; i < n * n; i++) rot.push(Math.floor(R() * 4));
  var B = IQ.tray(S, n, n, cs, {tiles:false}), stoneM = IQ.mat.stone(0xe2cfa6), chM = IQ.mat.brass(), dryM = IQ.mat.plain(0x6b5236, 0.9), wetM = new T.MeshPhysicalMaterial({color:0x3fb8ff, emissive:0x1a7fd0, emissiveIntensity:0.9, roughness:0.05, clearcoat:1, transmission:0.3});
  var tiles = [];
  for(var z = 0; z < n; z++) for(var x = 0; x < n; x++){ var id = z * n + x, g = new T.Group(), s = new T.Mesh(new T.BoxGeometry(cs * 0.94, 0.35, cs * 0.94), stoneM); s.position.y = 0.17; g.add(s);
    var arms = new T.Group(), water = [], hub = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.06, 16), dryM); hub.position.y = 0.37; arms.add(hub); water.push(hub);
    for(var k = 0; k < 4; k++) if(conn[id] >> k & 1){ var d = DIRS[k], a = new T.Mesh(new T.BoxGeometry(d[0] ? cs * 0.48 : 0.3, 0.05, d[0] ? 0.3 : cs * 0.48), chM); a.position.set(d[0] * cs * 0.24, 0.36, d[1] * cs * 0.24); arms.add(a);
      var wt = new T.Mesh(new T.BoxGeometry(d[0] ? cs * 0.48 : 0.18, 0.06, d[0] ? 0.18 : cs * 0.48), dryM); wt.position.set(d[0] * cs * 0.24, 0.38, d[1] * cs * 0.24); arms.add(wt); water.push(wt); }
    arms.rotation.y = -rot[id] * Math.PI / 2; g.add(arms);
    if(id === src[1] * n + src[0]){ var f = new T.Mesh(new T.CylinderGeometry(0.26, 0.32, 0.4, 16), IQ.mat.glaze(IQ.C.blue)); f.position.y = 0.55; g.add(f); var sp = new T.Mesh(new T.SphereGeometry(0.16, 16, 12), wetM); sp.position.y = 0.8; g.add(sp); }
    if(gardens.indexOf(id) >= 0){ var pl = new T.Mesh(new T.CylinderGeometry(0.3, 0.24, 0.3, 8), IQ.mat.glaze(0x8E2B2B)); pl.position.set(0, 0.55, 0); g.add(pl); var bush = new T.Mesh(new T.SphereGeometry(0.28, 14, 10), IQ.mat.plain(0x2f7a3a, 0.7)); bush.position.y = 0.82; bush.scale.y = 0.75; g.add(bush); g.userData.bush = bush; }
    g.position.copy(B.pos(x, z, 0.3)); g.userData.p = 1; g.userData.id = id; S.add(g); tiles.push({g:g, arms:arms, water:water}); }
  S.size = n * cs + 1;
  function flow(){ var wet = {}, q = [src[1] * n + src[0]]; wet[q[0]] = 1;
    while(q.length){ var id = q.shift(), x = id % n, z = (id / n) | 0, m = rotM(conn[id], rot[id]); for(var k = 0; k < 4; k++){ if(!(m >> k & 1)) continue; var d = DIRS[k], nx = x + d[0], nz = z + d[1]; if(wrap){ nx = (nx + n) % n; nz = (nz + n) % n; } if(nx < 0 || nz < 0 || nx >= n || nz >= n) continue; var j = nz * n + nx;
      if(!wet[j] && (rotM(conn[j], rot[j]) >> ((k + 2) % 4) & 1)){ wet[j] = 1; q.push(j); } } }
    tiles.forEach(function(t, i){ t.water.forEach(function(w){ w.material = wet[i] ? wetM : dryM; }); if(t.g.userData.bush) t.g.userData.bush.material = wet[i] ? IQ.mat.plain(0x3fae4f, 0.6) : IQ.mat.plain(0x6a6a3a, 0.9); });
    return gardens.every(function(gi){ return wet[gi]; }); }
  flow();
  if(wrap){ A.say(A.L("Tahap ini: tepi papan bersambung ke tepi bertentangan", "This level: each edge joins the opposite edge"), 2800); [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function(d){ var m = new T.Mesh(new T.BoxGeometry(d[0] ? 0.12 : n * cs, 0.06, d[0] ? n * cs : 0.12), IQ.mat.glow(IQ.C.teal, 0.9)); m.position.set(d[0] * (n * cs / 2 + 0.2), 0.42, d[1] * (n * cs / 2 + 0.2)); S.add(m, false); }); }
  var par = 0; for(var pi = 0; pi < n * n; pi++){ for(var r0 = 0; r0 < 4; r0++) if(rotM(conn[pi], (rot[pi] + r0) % 4) === conn[pi]){ par += r0; break; } }
  S.onPick = function(o){ if(!o || o.userData.id == null || S.busy()) return; var id = o.userData.id, t = tiles[id], a0 = t.arms.rotation.y; rot[id] = (rot[id] + 1) % 4; A.move();
    S.tween(180, function(e){ t.arms.rotation.y = a0 - e * Math.PI / 2; }, function(){ if(flow()) A.win(); }, "out"); };
  return {par:par, hint:function(){ for(var i = 0; i < n * n; i++){ var want = 0; for(var r = 0; r < 4; r++) if(rotM(conn[i], r) === rotM(conn[i], 0)){ want = r; break; } if(rotM(conn[i], rot[i]) !== conn[i]){ var need = (4 - rot[i]) % 4; for(var r2 = 1; r2 <= 3; r2++) if(rotM(conn[i], (rot[i] + r2) % 4) === conn[i]){ need = r2; break; }
      return A.L("Putar batu di lajur ", "Turn the stone at column ") + (i % n + 1) + A.L(", baris ", ", row ") + (((i / n) | 0) + 1) + " × " + need; } } return ""; }}; }});
})();
