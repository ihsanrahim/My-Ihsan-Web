/* IQ 11 · Kiub Songket: which flat net folds into the cube shown (turn it by dragging)? Tap a net to fold it. Three cubes per level. */
(function(){ var T = THREE, IQ = window.IQ;
var NETS = [[[1,0],[0,1],[1,1],[2,1],[3,1],[1,2]],[[0,0],[0,1],[1,1],[2,1],[3,1],[0,2]],[[0,0],[0,1],[1,1],[2,1],[3,1],[1,2]],[[0,0],[0,1],[1,1],[2,1],[3,1],[2,2]],[[0,0],[0,1],[1,1],[2,1],[3,1],[3,2]],
  [[1,0],[0,1],[1,1],[2,1],[3,1],[2,2]],[[0,0],[1,0],[1,1],[2,1],[3,1],[3,2]],[[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]],[[0,0],[1,0],[2,0],[2,1],[3,1],[4,1]],[[0,0],[1,0],[1,1],[2,1],[3,1],[2,2]],[[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]]];
// rolling a cube across the net: positions T,B,N,S,E,W hold face labels
var ROLL = {E:{B:"E",E:"T",T:"W",W:"B",N:"N",S:"S"}, W:{B:"W",W:"T",T:"E",E:"B",N:"N",S:"S"}, S:{B:"S",S:"T",T:"N",N:"B",E:"E",W:"W"}, N:{B:"N",N:"T",T:"S",S:"B",E:"E",W:"W"}};
function roll(st, d){ var o = {}; for(var k in ROLL[d]) o[k] = st[ROLL[d][k]]; return o; }
function fold(net){ var st0 = {T:0,B:1,N:2,S:3,E:4,W:5}, out = {}, seen = {}, q = [[net[0], st0]]; seen[net[0]] = 1; out[0] = {face:1, pos:"B"}; var map = {}; map[net[0]] = 1;
  var idx = function(c){ for(var i = 0; i < net.length; i++) if(net[i][0] === c[0] && net[i][1] === c[1]) return i; return -1; }, place = {};
  place[0] = "B"; var res = {}; res[net[0]] = st0;
  while(q.length){ var it = q.shift(), c = it[0], st = it[1]; [["E",1,0],["W",-1,0],["S",0,1],["N",0,-1]].forEach(function(d){ var nc = [c[0] + d[1], c[1] + d[2]], i = idx(nc); if(i < 0 || seen[nc]) return; seen[nc] = 1; var ns = roll(st, d[0]); res[nc] = ns; q.push([nc, ns]); }); }
  // face label under each square = the label at B in that square's state; express it as a position of the starting cube
  var lbl2pos = {}; for(var k in st0) lbl2pos[st0[k]] = k; return net.map(function(c){ return lbl2pos[res[c].B]; }); }
var ROTS = (function(){ var st = {T:"T",B:"B",N:"N",S:"S",E:"E",W:"W"}, seen = {}, q = [st], out = []; while(q.length){ var s = q.shift(), k = JSON.stringify(s); if(seen[k]) continue; seen[k] = 1; out.push(s); ["E","S"].forEach(function(d){ q.push(roll(s, d)); }); } return out; })();
function canon(col){ return ROTS.map(function(r){ return ["T","B","N","S","E","W"].map(function(p){ return col[r[p]]; }).join(""); }).sort()[0]; }   // col: position → colour
function cubeOf(net, cols){ var pos = fold(net), c = {}; pos.forEach(function(p, i){ c[p] = cols[i]; }); return c; }
var PAL = [["#7a1426","#D4A544"],["#1F5FA8","#E4D3B5"],["#2AA198","#0F1E3A"],["#D4A544","#7a1426"],["#E4D3B5","#1F5FA8"],["#5a3e8a","#D4A544"]];
function faceTex(i){ return IQ.canvasTex("sk" + i, 128, 128, function(g, w){ var p = PAL[i]; g.fillStyle = p[0]; g.fillRect(0, 0, w, w); g.fillStyle = p[1]; g.strokeStyle = p[1]; g.lineWidth = 5;
  if(i === 0){ for(var k = 0; k < 4; k++){ g.beginPath(); g.moveTo(8 + k * 30, 120); g.lineTo(23 + k * 30, 40); g.lineTo(38 + k * 30, 120); g.fill(); } }   // pucuk rebung
  else if(i === 1){ for(var a = 0; a < 8; a++){ g.save(); g.translate(64, 64); g.rotate(a * Math.PI / 4); g.beginPath(); g.ellipse(0, -26, 9, 22, 0, 0, 7); g.fill(); g.restore(); } }   // bunga tabur
  else if(i === 2){ for(var y = 0; y < 4; y++) for(var x = 0; x < 4; x++){ g.beginPath(); g.moveTo(16 + x * 32, 4 + y * 32); g.lineTo(28 + x * 32, 16 + y * 32); g.lineTo(16 + x * 32, 28 + y * 32); g.lineTo(4 + x * 32, 16 + y * 32); g.fill(); } }
  else if(i === 3){ g.beginPath(); g.arc(64, 64, 40, 0, 7); g.stroke(); g.beginPath(); g.arc(64, 64, 22, 0, 7); g.fill(); }
  else if(i === 4){ for(var s = 0; s < 6; s++){ g.fillRect(0, 10 + s * 20, w, 6); } }
  else { g.beginPath(); for(var j = 0; j < 16; j++){ var an = Math.PI * j / 8, r = j % 2 ? 22 : 50; g.lineTo(64 + Math.cos(an) * r, 64 + Math.sin(an) * r); } g.fill(); }
  g.strokeStyle = "rgba(255,230,160,.8)"; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, w - 6); }); }
var NRM = {T:[0,1,0],B:[0,-1,0],N:[0,0,-1],S:[0,0,1],E:[1,0,0],W:[-1,0,0]};
IQ.def("songket", {build:function(S, lv, A){ var R = IQ.rnd(Date.now() % 99173 + 7), round = 0, rounds = 3, opts = [], cube = null, nets = [], wrong = 0, folding = false;
  var mats = PAL.map(function(p, i){ return new T.MeshPhysicalMaterial({map:faceTex(i), roughness:0.45, sheen:1, sheenColor:new T.Color(0xffe9a8), clearcoat:0.2}); });
  var dais = new T.Mesh(new T.CylinderGeometry(1.4, 1.6, 0.3, 32), IQ.mat.wood()); dais.position.set(0, 0.15, -2.4); S.add(dais);
  S.size = 7; S.orb.tEl = 0.95; S.orb.cz = 0.4;
  function shuffle(a){ for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function mirror(net){ var mx = Math.max.apply(null, net.map(function(c){ return c[0]; })); return net.map(function(c){ return [mx - c[0], c[1]]; }); }
  function newRound(){ if(cube) S.root.remove(cube); nets.forEach(function(n){ S.root.remove(n.g); }); nets = [];
    var cols = shuffle([0,1,2,3,4,5]), net = NETS[Math.floor(R() * NETS.length)], target = cubeOf(net, cols), tc = canon(target);
    cube = new T.Group(); var box = new T.Mesh(new T.BoxGeometry(1.6, 1.6, 1.6), ["E","W","T","B","S","N"].map(function(p){ return mats[target[p]]; })); box.castShadow = true; cube.add(box); cube.position.set(0, 1.35, -2.2); S.add(cube);
    var cands = [{net:net, cols:cols, ok:true}], tries = 0, n = [3, 4, 4, 6, 6][lv];
    while(cands.length < n && tries++ < 500){ var c;
      if(lv === 2 || (lv >= 3 && cands.length >= 2 && cands.length < 4)){ c = {net:net, cols:shuffle(cols.slice())}; if(lv >= 3){ var a2 = Math.floor(R() * 6), b2 = (a2 + 1 + Math.floor(R() * 5)) % 6; c.cols = cols.slice(); var tt = c.cols[a2]; c.cols[a2] = c.cols[b2]; c.cols[b2] = tt; } } else if((lv === 1 || lv >= 3) && cands.length === 1){ c = {net:mirror(net), cols:cols.slice()}; } else { var nn2 = NETS[Math.floor(R() * NETS.length)]; c = {net:R() < 0.5 ? nn2 : mirror(nn2), cols:shuffle(cols.slice())}; }
      if(canon(cubeOf(c.net, c.cols)) === tc) continue; if(cands.some(function(x){ return JSON.stringify(x) === JSON.stringify(c); })) continue; cands.push(c); }
    var six = cands.length > 4; shuffle(cands).forEach(function(c, i){ var g = new T.Group(), s = six ? 0.36 : 0.46, mx = Math.max.apply(null, c.net.map(function(q){ return q[0]; })), mz = Math.max.apply(null, c.net.map(function(q){ return q[1]; }));
      c.sq = c.net.map(function(q, k){ var m = new T.Mesh(new T.BoxGeometry(s * 0.97, 0.05, s * 0.97), mats[c.cols[k]]); m.position.set((q[0] - mx / 2) * s, 0.03, (q[1] - mz / 2) * s); m.userData.flat = m.position.clone(); g.add(m); return m; });
      var pad = new T.Mesh(new T.BoxGeometry(six ? 1.95 : 2.45, 0.08, six ? 1.6 : 2.0), IQ.mat.plain(0x3a5a8a, 0.6)); pad.position.y = -0.04; g.add(pad);
      g.position.set(six ? ((i % 3) - 1) * 2.15 : cands.length > 3 ? (i % 2 - 0.5) * 2.7 : (i - 1) * 2.6, 0.35, six ? 0.8 + Math.floor(i / 3) * 1.85 : cands.length > 3 ? 0.9 + Math.floor(i / 2) * 2.3 : 1.2); c.s = s; g.userData = {p:1, ci:i}; S.add(g); c.g = g; nets.push(c); });
    A.say(A.L("Kiub ", "Cube ") + (round + 1) + "/" + rounds); if(lv === 4){ cube.visible = true; clearTimeout(hideT); hideT = setTimeout(function(){ cube.visible = false; }, 2200); } }
  var hideT = 0;
  function foldAnim(c, done){ var pos = fold(c.net), s = c.s || 0.46; folding = true;
    var targets = pos.map(function(p){ var nn = NRM[p], v = new T.Vector3(nn[0], nn[1], nn[2]), q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), v); return {p:v.clone().multiplyScalar(s / 2).add(new T.Vector3(0, s / 2 + 0.05, 0)), q:q}; });
    S.tween(900, function(e){ c.sq.forEach(function(m, i){ m.position.lerpVectors(m.userData.flat, targets[i].p, e); m.quaternion.slerpQuaternions(new T.Quaternion(), targets[i].q, e); }); }, function(){ folding = false; done(); }, "io"); }
  function unfold(c){ S.tween(500, function(e){ c.sq.forEach(function(m){ m.position.lerp(m.userData.flat, e); m.quaternion.slerp(new T.Quaternion(), e); }); }); }
  S.onTick = function(dt){ if(cube && !S.reduce) cube.rotation.y += dt * 0.5; };
  if(lv === 5) return buildNet();
  if(lv === 4){ var pc = A.ctl('<button class="iqB" id="skPeek">👁 ' + A.L("Lihat kiub sekali lagi (+1 langkah)", "See the cube again (+1 move)") + '</button>'); pc.querySelector("#skPeek").onclick = function(){ if(!cube || cube.visible) return; A.move(); cube.visible = true; clearTimeout(hideT); hideT = setTimeout(function(){ cube.visible = false; }, 2000); }; S.cl.push(function(){ clearTimeout(hideT); }); }
  newRound();
  S.onPick = function(o){ if(!o || o.userData.ci == null || folding || S.busy()) return; var c = nets[o.userData.ci]; A.move();
    foldAnim(c, function(){ if(c.ok){ round++; if(round >= rounds) A.win(A.moves()); else { A.say(A.L("Betul!", "Correct!")); setTimeout(newRound, 900); } } else { wrong++; A.say(A.L("Tidak sama: bandingkan sisi yang bersebelahan.", "Not the same: compare which faces sit next to each other."), 2400); setTimeout(function(){ unfold(c); }, 1200); } }); };
  // extreme: build the net yourself. Tap a square to cycle its pattern, then Fold. Par = the fewest taps (over all 24 ways the cube can sit) + 1 fold.
  function buildNet(){ var cols = shuffle([0,1,2,3,4,5]), net = NETS[Math.floor(R() * NETS.length)], target = cubeOf(NETS[Math.floor(R() * NETS.length)], cols), tc = canon(target), s = 0.62, mx = Math.max.apply(null, net.map(function(q){ return q[0]; })), mz = Math.max.apply(null, net.map(function(q){ return q[1]; })), cur = net.map(function(){ return -1; });
    cube = new T.Group(); var box = new T.Mesh(new T.BoxGeometry(1.6, 1.6, 1.6), ["E","W","T","B","S","N"].map(function(p){ return mats[target[p]]; })); box.castShadow = true; cube.add(box); cube.position.set(0, 1.35, -2.2); S.add(cube);
    var blank = IQ.mat.plain(0xd8cfbf, 0.7), g = new T.Group(), c = {net:net, s:s}; c.sq = net.map(function(q, k){ var m = new T.Mesh(new T.BoxGeometry(s * 0.97, 0.05, s * 0.97), blank); m.position.set((q[0] - mx / 2) * s, 0.03, (q[1] - mz / 2) * s); m.userData = {p:1, sq:k, flat:m.position.clone()}; g.add(m); return m; });
    g.position.set(0, 0.35, 1.3); S.add(g); A.say(A.L("Bina bentangan untuk kiub ini: ketuk petak untuk tukar corak, kemudian Lipat", "Build the net for this cube: tap squares to change the pattern, then Fold"), 3200);
    var pos = fold(net), par = 1e9; ROTS.forEach(function(r){ var t = 0; pos.forEach(function(p){ t += target[r[p]] + 1; }); par = Math.min(par, t); }); par += 1;
    var ct = A.ctl('<button class="iqB gold" id="skFold">⤴ ' + A.L("Lipat", "Fold") + '</button>');
    ct.querySelector("#skFold").onclick = function(){ if(folding || S.busy()) return; if(cur.some(function(v){ return v < 0; })){ A.say(A.L("Isi semua petak dahulu", "Fill every square first")); return; } A.move();
      foldAnim(c, function(){ if(canon(cubeOf(net, cur)) === tc) A.win(); else { A.say(A.L("Tidak sama. Bandingkan sisi yang bersebelahan.", "Not the same. Compare which faces sit next to each other."), 2400); setTimeout(function(){ unfold(c); }, 1200); } }); };
    S.onPick = function(o){ if(!o || o.userData.sq == null || folding || S.busy()) return; var k = o.userData.sq; cur[k] = (cur[k] + 1) % 6; o.material = mats[cur[k]]; A.move(); };
    return {par:par, hint:function(){ return ""; }}; }
  return {par:rounds, hint:function(){ return A.L("Dua corak yang bertentangan pada kiub tidak pernah bersebelahan dalam bentangan; dalam baris 3 petak, petak pertama dan ketiga bertentangan.", "Two faces that are opposite on the cube are never side by side on the net; in a row of three squares, the first and third are opposite."); }}; }});
IQ.songketFold = {fold:fold, canon:canon, cubeOf:cubeOf, NETS:NETS};
})();
