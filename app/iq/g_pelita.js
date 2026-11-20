/* IQ 3 · Pelita Malam (lights out): tap a lamp; it and its neighbours change. Put every lamp out; the room dims as you go.
   0.6.38 levels 4-6: 6×6; 7×7 where the diagonals change too; 7×7 with three states (bright → dim → out → bright). Par = the fewest presses (solved exactly). */
(function(){ var T = THREE, IQ = window.IQ;
var LVS = [{n:3},{n:4},{n:5},{n:6},{n:7, diag:true},{n:7, p:3}];
function nbrs(n, i, diag){ var x = i % n, y = (i / n) | 0, o = [], d = [[0,0],[1,0],[-1,0],[0,1],[0,-1]]; if(diag) d = d.concat([[1,1],[1,-1],[-1,1],[-1,-1]]);
  d.forEach(function(q){ var a = x + q[0], b = y + q[1]; if(a >= 0 && b >= 0 && a < n && b < n) o.push(b * n + a); }); return o; }
// presses (0..p-1 each) that clear the board, with the fewest total presses: elimination over GF(p), then the null space is searched
function solve(n, diag, p, on){ var N = n * n, M = [], i, j, k, inv = p === 3 ? [0, 1, 2] : [0, 1];
  for(i = 0; i < N; i++){ var r = new Array(N + 1).fill(0); M.push(r); } for(j = 0; j < N; j++) nbrs(n, j, diag).forEach(function(c){ M[c][j] = 1; });
  for(i = 0; i < N; i++) M[i][N] = (p - on[i]) % p;
  var row = 0, piv = [], pc = {}; for(var c = 0; c < N && row < N; c++){ var pr = -1; for(i = row; i < N; i++) if(M[i][c]){ pr = i; break; } if(pr < 0) continue; var t = M[pr]; M[pr] = M[row]; M[row] = t;
    var f = inv[M[row][c]]; for(k = c; k <= N; k++) M[row][k] = (M[row][k] * f) % p;
    for(i = 0; i < N; i++) if(i !== row && M[i][c]){ var m = M[i][c]; for(k = c; k <= N; k++) M[i][k] = ((M[i][k] - m * M[row][k]) % p + p) % p; } piv.push(c); pc[c] = row; row++; }
  for(i = row; i < N; i++) if(M[i][N]) return null;
  var freeV = []; for(c = 0; c < N; c++) if(pc[c] == null) freeV.push(c);
  var best = null, bw = 1e9, combos = Math.pow(p, Math.min(freeV.length, 9));
  for(var mask = 0; mask < combos; mask++){ var x = new Array(N).fill(0), mm = mask; freeV.forEach(function(fv, q){ if(q < 9){ x[fv] = mm % p; mm = Math.floor(mm / p); } });
    for(var q = piv.length - 1; q >= 0; q--){ var cc = piv[q], rr = pc[cc], v = M[rr][N]; freeV.forEach(function(fv){ v -= M[rr][fv] * x[fv]; }); x[cc] = ((v % p) + p) % p; }
    var wsum = x.reduce(function(a, b){ return a + b; }, 0); if(wsum < bw){ bw = wsum; best = x; } }
  return best; }
IQ.pelitaSolve = solve; IQ.pelitaLV = LVS;
IQ.def("pelita", {build:function(S, lv, A){ var D = LVS[lv], n = D.n, P = D.p || 2, cs = n > 5 ? 1.05 : 1.35, B = IQ.tray(S, n, n, cs, {tiles:false}), on = [], L = [], R = IQ.rnd(Date.now() % 100000 + 7);
  var niche = new T.MeshStandardMaterial({color:0xffffff, roughness:0.55, map:IQ.starTex("pn", "#3a6eb2", "#a6c8f2", "#2c5a9a")}), arch = IQ.mat.brass();
  var halo = IQ.canvasTex("halo2", 64, 64, function(c, w){ var gr = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,210,120,1)"); gr.addColorStop(1, "rgba(255,170,60,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  for(var z = 0; z < n; z++) for(var x = 0; x < n; x++){ var g = new T.Group(), tile = new T.Mesh(new T.BoxGeometry(cs * 0.92, 0.18, cs * 0.92), niche); tile.position.y = 0.09; g.add(tile);
    var bowlPts = []; for(var q = 0; q <= 8; q++){ var t = q / 8; bowlPts.push(new T.Vector2(0.06 + Math.sin(t * Math.PI * 0.9) * 0.3, t * 0.2)); }
    var sc = cs / 1.35, bowl = new T.Mesh(new T.LatheGeometry(bowlPts, 20), arch); bowl.position.y = 0.2; g.add(bowl); var nose = new T.Mesh(new T.ConeGeometry(0.06, 0.3, 8), arch); nose.rotation.z = -1.2; nose.position.set(0.3, 0.34, 0); g.add(nose);
    var fl = new T.Mesh(new T.SphereGeometry(0.09, 12, 10), new T.MeshBasicMaterial({color:0xffd27a})); fl.scale.set(0.8, 1.7, 0.8); fl.position.set(0.44, 0.5, 0); g.add(fl);
    var hs = new T.Sprite(new T.SpriteMaterial({map:halo, transparent:true, depthWrite:false, blending:T.AdditiveBlending})); hs.scale.set(1.3, 1.3, 1); hs.position.copy(fl.position); g.add(hs);
    g.scale.setScalar(sc); g.position.copy(B.pos(x, z, 0.3)); g.userData = {p:1, i:z * n + x}; S.add(g); L.push({g:g, fl:fl, halo:hs}); on.push(0); }
  function press(i, anim){ nbrs(n, i, D.diag).forEach(function(k){ on[k] = (on[k] + 1) % P; }); if(anim) paint(); }
  function paint(){ var lit = 0; on.forEach(function(v, i){ var l = L[i], b = P === 3 ? [0, 0.55, 1][v] : v; l.fl.visible = b > 0; l.halo.visible = b > 0; l.fl.scale.set(0.8 * (0.6 + b * 0.4), 1.7 * (0.6 + b * 0.4), 0.8); l.halo.material.opacity = b; lit += b; });
    S.scene.background = new T.Color(0x22385f).lerp(new T.Color(0x0e1a30), 1 - lit / on.length); S.base = 130 + 120 * lit / on.length; }
  var R2 = R; do { for(var k = 0; k < n * n; k++) on[k] = 0; for(var c = 0; c < n * n; c++){ var r = Math.floor(R2() * P * 1.6); if(r < P) for(var j = 0; j < r; j++) press(c); } } while(on.filter(Boolean).length < n);
  var par = (solve(n, D.diag, P, on) || []).reduce(function(a, b){ return a + b; }, 0);
  paint(); var hl = null;
  if(D.diag) A.say(A.L("Tahap ini: pepenjuru turut bertukar", "This level: the diagonals change too"), 2400); if(P === 3) A.say(A.L("Tahap ini: terang → malap → padam → terang", "This level: bright → dim → out → bright"), 2400);
  S.onPick = function(o){ if(!o || o.userData.i == null) return; if(hl){ hl.scale.setScalar(cs / 1.35); hl = null; } press(o.userData.i, true); A.move(); var g = o; S.tween(200, function(e){ g.position.y = 0.3 + Math.sin(e * Math.PI) * 0.15; }); if(on.every(function(v){ return !v; })){ S.base = 260; A.win(); } };
  return {par:par, hint:function(){ var s = solve(n, D.diag, P, on); if(!s) return ""; var i = s.findIndex(function(v){ return v > 0; }); if(i < 0) return ""; var g = L[i].g; hl = g; g.scale.setScalar(cs / 1.35 * 1.2); return A.L("Ketuk pelita yang membesar. Tinggal ", "Tap the lamp that grew. Presses left: ") + s.reduce(function(a, b){ return a + b; }, 0) + A.L(" ketukan.", "."); }}; }});
})();
