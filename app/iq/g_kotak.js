/* IQ 20 · Kotak Cermin: tap the brass mirrors to turn them (/ or \), then Launch. The cube runs until it hits a wall; stop it on the gold corner. The planned path is drawn: fully on level 1, only the start on harder levels. */
(function(){ var T = THREE, IQ = window.IQ;
var LV = [{n:5, k:2, bl:1, show:99}, {n:6, k:4, bl:3, show:2}, {n:7, k:6, bl:5, show:1}, {n:8, k:8, bl:6, show:0}, {n:8, k:6, bl:4, show:1, ow:3, tp:true}, {n:9, k:10, bl:8, show:0, wp:true}];
var OWD = {">":[1,0], "<":[-1,0], "v":[0,1], "^":[0,-1]};
function run(n, blocks, mir, st, X){ X = X || {}; var x = st[0], z = st[1], dx = 1, dz = 0, pts = [[x, z]], seen = {}, vis = {}; vis[x + "," + z] = 1;
  for(var s = 0; s < 200; s++){ var m = mir[x + "," + z]; if(m){ var t = dx; if(m === "/"){ dx = -dz; dz = -t; } else { dx = dz; dz = t; } pts.push([x, z]); }
    var k = x + "," + z + "," + dx + "," + dz; if(seen[k]) return {stop:null, pts:pts}; seen[k] = 1;
    var nx = x + dx, nz = z + dz; if(nx < 0 || nz < 0 || nx >= n || nz >= n || blocks[nx + "," + nz]) break; var ow = X.ow && X.ow[nx + "," + nz]; if(ow && (OWD[ow][0] !== dx || OWD[ow][1] !== dz)) break; x = nx; z = nz; vis[x + "," + z] = 1;
    if(X.tp){ var kk2 = x + "," + z, o2 = X.tp[0] === kk2 ? X.tp[1] : X.tp[1] === kk2 ? X.tp[0] : null; if(o2){ pts.push([x, z]); var q2 = o2.split(",").map(Number); x = q2[0]; z = q2[1]; pts.push([x, z]); vis[o2] = 1; } } }
  pts.push([x, z]); return {stop:[x, z], pts:pts, vis:vis}; }
function gen(D, R){ var n = D.n, key = function(x, z){ return x + "," + z; };
  for(var tr = 0; tr < 2000; tr++){ var st = [0, Math.floor(R() * n)], blocks = {}, cells = [];
    for(var i = 0; i < D.bl; i++){ var b = [1 + Math.floor(R() * (n - 1)), Math.floor(R() * n)]; if(b[1] !== st[1] || b[0] > 2) blocks[key(b[0], b[1])] = 1; }
    var ms = []; while(ms.length < D.k){ var c = [1 + Math.floor(R() * (n - 2)), Math.floor(R() * n)], kk = key(c[0], c[1]); if(!blocks[kk] && ms.indexOf(kk) < 0) ms.push(kk); }
    var X = {}; if(D.ow){ X.ow = {}; for(var oi = 0; oi < D.ow; oi++){ var oc = [1 + Math.floor(R() * (n - 2)), Math.floor(R() * n)], ok2 = oc[0] + "," + oc[1]; if(!blocks[ok2] && ms.indexOf(ok2) < 0) X.ow[ok2] = "<>^v"[Math.floor(R() * 4)]; } }
    if(D.tp){ var ta, tb, tg2 = 0; do { ta = [1 + Math.floor(R() * (n - 2)), Math.floor(R() * n)].join(","); tb = [1 + Math.floor(R() * (n - 2)), Math.floor(R() * n)].join(","); } while((ta === tb || blocks[ta] || blocks[tb] || ms.indexOf(ta) >= 0 || ms.indexOf(tb) >= 0 || (X.ow && (X.ow[ta] || X.ow[tb]))) && tg2++ < 100); X.tp = [ta, tb]; }
    var wp = D.wp ? (function(){ for(var g3 = 0; g3 < 100; g3++){ var w = [Math.floor(R() * n), Math.floor(R() * n)].join(","); if(!blocks[w] && ms.indexOf(w) < 0) return w; } return null; })() : null;
    var stops = {}, init = {}, conf = {}; ms.forEach(function(k){ init[k] = R() < 0.5 ? "/" : "\\"; });
    for(var mask = 0; mask < (1 << D.k); mask++){ var mir = {}; ms.forEach(function(k, j){ mir[k] = mask >> j & 1 ? "/" : "\\"; }); var r = run(n, blocks, mir, st, X); if(!r.stop || (wp && !r.vis[wp])) continue; var sk = r.stop.join(","); stops[sk] = (stops[sk] || 0) + 1; var ham = ms.filter(function(k){ return mir[k] !== init[k]; }).length; conf[sk] = Math.min(conf[sk] == null ? 99 : conf[sk], ham); }
    var i0 = run(n, blocks, init, st, X), cand = Object.keys(stops).filter(function(s){ var p = s.split(",").map(Number), corner = (p[0] === 0 || p[0] === n - 1) && (p[1] === 0 || p[1] === n - 1); return (corner || D.k > 2) && !(i0.stop && i0.stop.join(",") === s) && !(p[0] === st[0] && p[1] === st[1]); })
      .sort(function(a, b){ return stops[a] - stops[b]; });
    if(cand.length){ return {st:st, blocks:blocks, ms:ms, init:init, tgt:cand[0].split(",").map(Number), X:X, wp:wp, par:conf[cand[0]] + 1}; } } return null; }
IQ.def("kotak", {build:function(S, lv, A){ var D = LV[lv], R = IQ.rnd(Date.now() % 44449 + 9), G = null; while(!G) G = gen(D, R); var n = D.n, cs = 0.95, mir = Object.assign({}, G.init), mesh = {}, going = false;
  var glass = IQ.mat.glaze(0xffffff, {map:IQ.starTex("kc", "#3a76c0", "rgba(200,225,255,.35)", "rgba(240,190,80,.45)")}), B = IQ.tray(S, n, n, cs, {mats:[glass, IQ.mat.glaze(0x2f64a8)]});
  Object.keys(G.blocks).forEach(function(k){ var p = k.split(",").map(Number), m = new T.Mesh(new T.BoxGeometry(cs * 0.9, 0.6, cs * 0.9), IQ.mat.stone(0xb9a382)); m.position.copy(B.pos(p[0], p[1], 0.72)); S.add(m); });
  var tg = new T.Group(), ring = new T.Mesh(new T.TorusGeometry(0.34, 0.06, 10, 32), IQ.mat.gold()); ring.rotation.x = Math.PI / 2; tg.add(ring); var gl = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.04, 24), IQ.mat.glow(0xffd27a, 1.6)); tg.add(gl); tg.position.copy(B.pos(G.tgt[0], G.tgt[1], 0.46)); S.add(tg);
  var cube = new T.Mesh(new T.BoxGeometry(0.5, 0.5, 0.5), new T.MeshPhysicalMaterial({color:IQ.C.teal, roughness:0.1, clearcoat:1, transmission:0.3, thickness:0.5})); var home = B.pos(G.st[0], G.st[1], 0.7); cube.position.copy(home); S.add(cube);
  var plate = new T.BoxGeometry(cs * 1.0, 0.5, 0.06);
  G.ms.forEach(function(k){ var p = k.split(",").map(Number), g = new T.Group(), m = new T.Mesh(plate, IQ.mat.gold()); m.position.y = 0.3; g.add(m); var st = new T.Mesh(new T.CylinderGeometry(0.08, 0.12, 0.12, 12), IQ.mat.brass()); st.position.y = 0.04; g.add(st);
    var hit = new T.Mesh(new T.CylinderGeometry(0.45, 0.45, 0.8, 8), new T.MeshBasicMaterial({visible:false})); hit.position.y = 0.3; g.add(hit); g.position.copy(B.pos(p[0], p[1], 0.42)); g.rotation.y = mir[k] === "/" ? Math.PI / 4 : -Math.PI / 4; g.userData = {p:1, mk:k}; S.add(g); mesh[k] = g; });
  var path = new T.Group(); S.add(path, false); var pm = new T.MeshBasicMaterial({color:0xffe9a8, transparent:true, opacity:0.55});
  function preview(){ while(path.children.length) path.remove(path.children[0]); if(!D.show) return; var r = run(n, G.blocks, mir, G.st, G.X), pts = r.pts.slice(0, Math.min(r.pts.length, D.show + 1));
    for(var i = 1; i < pts.length; i++){ var a = B.pos(pts[i - 1][0], pts[i - 1][1], 0.5), b = B.pos(pts[i][0], pts[i][1], 0.5), len = a.distanceTo(b); for(var d = 0.2; d < len; d += 0.34){ var dot = new T.Mesh(new T.SphereGeometry(0.05, 8, 6), pm); dot.position.lerpVectors(a, b, d / len); path.add(dot); } } }
  if(G.X.ow) Object.keys(G.X.ow).forEach(function(k){ var p = k.split(",").map(Number), d = OWD[G.X.ow[k]], ar = new T.Mesh(new T.ConeGeometry(0.26, 0.5, 3), IQ.mat.glow(IQ.C.teal, 1.1)); ar.rotation.x = Math.PI / 2; ar.rotation.z = -Math.atan2(d[0], -d[1]); ar.scale.set(1, 1, 0.25); ar.position.copy(B.pos(p[0], p[1], 0.46)); S.add(ar, false); });
  if(G.X.tp) G.X.tp.forEach(function(k){ var p = k.split(",").map(Number), r2 = new T.Mesh(new T.TorusGeometry(0.3, 0.07, 10, 28), IQ.mat.glow(0xb06aff, 1.6)); r2.rotation.x = Math.PI / 2; r2.position.copy(B.pos(p[0], p[1], 0.48)); S.add(r2, false); });
  if(G.wp){ var wpp = G.wp.split(",").map(Number), wm = new T.Mesh(new T.OctahedronGeometry(0.22), IQ.mat.glow(IQ.C.gold, 1.4)); wm.position.copy(B.pos(wpp[0], wpp[1], 0.75)); S.add(wm, false); A.say(A.L("Kiub mesti melalui permata emas dahulu", "The cube must pass the gold gem on the way"), 2800); }
  if(G.X.tp) A.say(A.L("Cincin ungu: masuk satu, keluar di satu lagi", "Purple rings: go in one, come out of the other"), 2800);
  preview(); S.size = n * cs + 1;
  var ctl = A.ctl('<button class="iqB gold" id="kGo">▶ ' + A.L("Lancar", "Launch") + '</button>');
  ctl.querySelector("#kGo").onclick = function(){ if(going || S.lock) return; going = true; A.move(); var r = run(n, G.blocks, mir, G.st, G.X), pts = r.pts.map(function(p){ return B.pos(p[0], p[1], 0.7); }), segs = [], tot = 0;
    for(var i = 1; i < pts.length; i++){ var L = pts[i - 1].distanceTo(pts[i]); segs.push(L); tot += L; } var ms = Math.max(400, tot * 260);
    S.tween(ms, function(e){ var d = e * tot, i = 0; while(i < segs.length - 1 && d > segs[i]){ d -= segs[i]; i++; } if(!segs.length) return; cube.position.lerpVectors(pts[i], pts[i + 1], segs[i] ? Math.min(1, d / segs[i]) : 1); cube.rotation.y = e * 6; }, function(){
      if(r.stop && r.stop[0] === G.tgt[0] && r.stop[1] === G.tgt[1] && (!G.wp || r.vis[G.wp])){ A.win(); } else { A.say(r.stop ? A.L("Terhenti di tempat lain. Putar cermin dan cuba lagi.", "It stopped somewhere else. Turn the mirrors and try again.") : A.L("Kiub berpusing dalam gelung!", "The cube went round in a loop!"), 2400); setTimeout(function(){ S.hop(cube, home, 1, 450, function(){ going = false; }); }, 500); } }, "lin"); };
  S.onPick = function(o){ if(!o || !o.userData.mk || going) return; var k = o.userData.mk, g = mesh[k], a0 = g.rotation.y; mir[k] = mir[k] === "/" ? "\\" : "/"; A.move(); var a1 = mir[k] === "/" ? Math.PI / 4 : -Math.PI / 4; S.tween(200, function(e){ g.rotation.y = a0 + (a1 - a0) * e; }); preview(); };
  return {par:G.par, hint:function(){ var ms = G.ms; for(var mask = 0; mask < (1 << ms.length); mask++){ var m2 = {}; ms.forEach(function(k, j){ m2[k] = mask >> j & 1 ? "/" : "\\"; }); var r = run(n, G.blocks, m2, G.st, G.X); if(r.stop && r.stop[0] === G.tgt[0] && r.stop[1] === G.tgt[1] && (!G.wp || r.vis[G.wp])){
      for(var j = 0; j < ms.length; j++) if(m2[ms[j]] !== mir[ms[j]]){ var p = ms[j].split(",").map(Number); return A.L("Putar cermin di lajur ", "Turn the mirror at column ") + (p[0] + 1) + A.L(", baris ", ", row ") + (p[1] + 1); } return A.L("Sudah betul: lancar!", "Already right: launch!"); } } return ""; }}; }});
IQ.kotakGen = gen; IQ.kotakRun = run;
})();
