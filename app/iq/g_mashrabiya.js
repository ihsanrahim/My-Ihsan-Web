/* IQ 15 · Bayang Mashrabiya: turn the carved lattice so its shadow fits the gold outline. Level 1 turns one way, level 2 two ways, level 3 three ways.
   0.6.38 levels 4-6: two shadows at once (back wall + side wall), then all three (back, side and the floor). Par = the fewest turns (breadth-first). */
(function(){ var T = THREE, IQ = window.IQ;
function latTex(){ return IQ.canvasTex("lattice", 128, 128, function(g, w){ g.clearRect(0, 0, w, w); g.fillStyle = "#9a6232"; g.fillRect(0, 0, w, w); g.globalCompositeOperation = "destination-out";
  for(var y = 0; y < 4; y++) for(var x = 0; x < 4; x++){ g.beginPath(); g.arc(16 + x * 32, 16 + y * 32, 9, 0, 7); g.fill(); } g.beginPath(); g.moveTo(64, 30); g.lineTo(98, 64); g.lineTo(64, 98); g.lineTo(30, 64); g.closePath(); g.fill(); g.globalCompositeOperation = "source-over";
  g.strokeStyle = "#5a3416"; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, w - 6); }); }
// rotations on integer voxel coords in {-1,0,1}
var RX = function(v){ return [v[0], -v[2], v[1]]; }, RY = function(v){ return [v[2], v[1], -v[0]]; }, RZ = function(v){ return [-v[1], v[0], v[2]]; }, F = {x:RX, y:RY, z:RZ};
// shadows: B = back wall (along z), S = side wall (along x), G = floor (along y)
var PJ = {B:function(v){ return v[0] + "," + v[1]; }, S:function(v){ return v[2] + "," + v[1]; }, G:function(v){ return v[0] + "," + v[2]; }};
function proj(vs, w){ var o = {}; vs.forEach(function(v){ o[PJ[w](v)] = 1; }); return Object.keys(o).sort().join("|"); }
var LV = [{ax:["y"], n:4, w:["B"]}, {ax:["y","x"], n:5, w:["B"]}, {ax:["y","x","z"], n:7, w:["B"]}, {ax:["y","x"], n:6, w:["B","S"]}, {ax:["y","x","z"], n:7, w:["B","S"]}, {ax:["y","x","z"], n:8, w:["B","S","G"]}];
IQ.def("mashrabiya", {build:function(S, lv, A){ var D = LV[lv], R = IQ.rnd(Date.now() % 40009 + 3), axes = D.ax, vox, tgt, cur, tries = 0;
  var all = function(vs){ return D.w.every(function(w){ return proj(vs, w) === tgt[w]; }); };
  do { vox = [[0,0,0]]; while(vox.length < D.n){ var b = vox[Math.floor(R() * vox.length)], d = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]][Math.floor(R() * 6)], v = [b[0] + d[0], b[1] + d[1], b[2] + d[2]];
      if(Math.max(Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2])) <= 1 && !vox.some(function(q){ return q[0] === v[0] && q[1] === v[1] && q[2] === v[2]; })) vox.push(v); }
    var t = vox, steps = 2 + Math.floor(R() * 3); for(var i = 0; i < steps; i++) t = t.map(F[axes[Math.floor(R() * axes.length)]]); tgt = {}; D.w.forEach(function(w){ tgt[w] = proj(t, w); }); cur = vox; tries++;
  } while((all(vox) || tgt.B.split("|").length < 3) && tries < 300);
  function bfs(from){ var q = [[from, null, 0]], seen = {}; seen[JSON.stringify(from)] = 1; while(q.length){ var it = q.shift(); for(var i = 0; i < axes.length; i++){ var nx = it[0].map(F[axes[i]]), first = it[1] || axes[i]; if(all(nx)) return {first:first, n:it[2] + 1}; var kk = JSON.stringify(nx); if(!seen[kk]){ seen[kk] = 1; q.push([nx, first, it[2] + 1]); } } } return null; }
  var par = (bfs(cur) || {n:0}).n;
  S.scene.background = new T.Color(0x2a3e66);
  var wallTex = IQ.canvasTex("plaster", 256, 256, function(g, w){ g.fillStyle = "#f2e8d4"; g.fillRect(0, 0, w, w); var r = IQ.rnd(3); for(var k = 0; k < 3000; k++){ g.fillStyle = "rgba(120,90,50," + r() * 0.07 + ")"; g.fillRect(r() * w, r() * w, 2, 2); } });
  var wm = new T.MeshStandardMaterial({map:wallTex, roughness:0.95}), cs = 0.8, Y0 = 2.4, Z0 = 0.6, X0 = 0;
  var back = new T.Mesh(new T.BoxGeometry(7, 5, 0.3), wm); back.position.set(0, 2.5, -3.2); back.receiveShadow = true; S.add(back, false);
  var arch = new T.Mesh(new T.TorusGeometry(3.3, 0.12, 10, 40, Math.PI), IQ.mat.wood()); arch.position.set(0, 2.5, -3.0); S.add(arch);
  if(D.w.indexOf("S") >= 0){ var side = new T.Mesh(new T.BoxGeometry(0.3, 5, 7), wm); side.position.set(-3.6, 2.5, 0); side.receiveShadow = true; S.add(side, false); }
  var outl = new T.Group(); S.add(outl, false);
  function cellMark(pos, rot){ var fr = new T.Mesh(new T.PlaneGeometry(cs * 0.98, cs * 0.98), new T.MeshBasicMaterial({color:0xD4A544, transparent:true, opacity:0.3, side:T.DoubleSide})); fr.position.copy(pos); fr.rotation.copy(rot); outl.add(fr);
    var ed = new T.Mesh(new T.RingGeometry(cs * 0.47, cs * 0.5, 4, 1), new T.MeshBasicMaterial({color:0xffa010, side:T.DoubleSide})); ed.position.copy(pos); ed.rotation.copy(rot); ed.rotateZ(Math.PI / 4); outl.add(ed); }
  tgt.B.split("|").forEach(function(k){ var p = k.split(",").map(Number); cellMark(new T.Vector3(X0 + p[0] * cs, Y0 + p[1] * cs, -3.03), new T.Euler(0, 0, 0)); });
  if(tgt.S) tgt.S.split("|").forEach(function(k){ var p = k.split(",").map(Number); cellMark(new T.Vector3(-3.43, Y0 + p[1] * cs, Z0 + p[0] * cs), new T.Euler(0, Math.PI / 2, 0)); });
  if(tgt.G) tgt.G.split("|").forEach(function(k){ var p = k.split(",").map(Number); cellMark(new T.Vector3(X0 + p[0] * cs, 0.005, Z0 + p[1] * cs), new T.Euler(-Math.PI / 2, 0, 0)); });
  // one clean "window" light per wall, each straight at its own wall
  var mk = function(px, py, pz, tx, ty, tz){ var l = new T.DirectionalLight(0xfff0d0, 1.6); l.position.set(px, py, pz); l.target.position.set(tx, ty, tz); l.castShadow = true; l.shadow.mapSize.set(1024, 1024); var c = l.shadow.camera; c.left = -4; c.right = 4; c.top = 4; c.bottom = -4; c.near = 0.5; c.far = 24; S.root.add(l); S.root.add(l.target); };
  mk(0, Y0, 9, 0, Y0, -3.2); if(tgt.S) mk(9, Y0, Z0, -3.6, Y0, Z0); if(tgt.G) mk(X0, 12, Z0, X0, 0, Z0); S.base = 120;
  var lat = new T.Group(), lm = new T.MeshStandardMaterial({map:latTex(), alphaTest:0.5, transparent:false, side:T.DoubleSide, roughness:0.7});
  var holder = new T.Group(); holder.position.set(X0, Y0, Z0); holder.add(lat); S.add(holder);
  function build(){ while(lat.children.length) lat.remove(lat.children[0]); cur.forEach(function(v){ var m = new T.Mesh(new T.BoxGeometry(cs * 0.98, cs * 0.98, cs * 0.98), lm); m.position.set(v[0] * cs, v[1] * cs, v[2] * cs); m.castShadow = true; lat.add(m); }); }
  build(); if(!tgt.G){ var stand = new T.Mesh(new T.CylinderGeometry(0.06, 0.1, 1.4, 10), IQ.mat.brass()); stand.position.set(X0, 0.7, Z0); S.add(stand); }
  S.size = 7.4; S.orb.tEl = tgt.G ? 0.7 : 0.32; S.orb.cz = 0; S.orb.tAz = tgt.S ? 0.55 : 0.28;
  if(D.w.length > 1) A.say(A.L("Padankan ", "Match ") + D.w.length + A.L(" bayang serentak", " shadows at once") + (tgt.G ? A.L(" (dinding belakang, sisi dan lantai)", " (back wall, side wall and floor)") : A.L(" (dinding belakang dan sisi)", " (back and side walls)")), 3000);
  var NM = {x:A.L("Ke depan", "Tip forward"), y:A.L("Pusing", "Spin"), z:A.L("Condong", "Roll")};
  var ctl = A.ctl(axes.map(function(a){ return '<button class="iqB" data-ax="' + a + '">↻ ' + NM[a] + '</button>'; }).join(""));
  ctl.querySelectorAll("[data-ax]").forEach(function(b){ b.onclick = function(){ if(S.busy() || S.lock) return; var a = b.getAttribute("data-ax"), q0 = lat.quaternion.clone(), qa = new T.Quaternion().setFromAxisAngle(new T.Vector3(a === "x" ? 1 : 0, a === "y" ? 1 : 0, a === "z" ? 1 : 0), Math.PI / 2);
    A.move(); S.tween(320, function(e){ lat.quaternion.copy(q0).premultiply(new T.Quaternion().slerp(qa, e)); }, function(){ cur = cur.map(F[a]); lat.quaternion.set(0, 0, 0, 1); build(); if(all(cur)){ outl.children.forEach(function(c){ if(c.material.opacity != null && c.material.transparent) c.material.opacity = 0.55; }); A.win(); } }, "io"); }; });
  return {par:par, hint:function(){ var b = bfs(cur); return b ? A.L("Cuba ", "Try ") + NM[b.first] + A.L(" · tinggal ", " · ") + b.n + A.L(" pusingan", " turns left") : ""; }}; }});
})();
