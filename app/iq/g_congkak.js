/* IQ 9 · Nim Biji Congkak: tap seeds in a pit (a seed and every seed above it), then Ambil / Take. You and the robot take turns.
   Levels 1-4: whoever takes the last seed wins. Level 5 (misère): whoever takes the last seed LOSES. Level 6: you may take from up to two pits in one turn.
   Levels 4-6: the robot never makes a mistake. Every start is a won position for you, if you play perfectly. */
(function(){ var T = THREE, IQ = window.IQ;
var LV = [{p:[3,4,5], err:0.55}, {p:[5,7,9], err:0.25}, {p:[3,5,7,9], err:0}, {p:[3,5,7,9,11], err:0}, {p:[2,3,5,6], err:0, mis:true}, {p:[3,5,6,9], err:0, k2:true}];
// exact game search: is the position a win for the player to move? (memo on the sorted piles)
function Game(mis, k){ var memo = {};
  function moves(ps){ var out = [], n = ps.length, i, j, a, b; for(i = 0; i < n; i++) for(a = 1; a <= ps[i]; a++){ out.push([[i, a]]); if(k > 1) for(j = i + 1; j < n; j++) for(b = 1; b <= ps[j]; b++) out.push([[i, a], [j, b]]); } return out; }
  function apply(ps, mv){ var q = ps.slice(); mv.forEach(function(m){ q[m[0]] -= m[1]; }); return q; }
  function win(ps){ var tot = ps.reduce(function(x, y){ return x + y; }, 0); if(!tot) return mis; var key = ps.slice().sort(function(x, y){ return x - y; }).join(","); if(memo[key] != null) return memo[key];
    var ms = moves(ps), r = false; for(var i = 0; i < ms.length; i++){ if(!win(apply(ps, ms[i]))){ r = true; break; } } memo[key] = r; return r; }
  function best(ps){ var ms = moves(ps); for(var i = 0; i < ms.length; i++) if(!win(apply(ps, ms[i]))) return ms[i]; return null; }
  return {win:win, best:best, moves:moves, apply:apply}; }
IQ.congkakGame = Game; IQ.congkakLV = LV;
IQ.def("congkak", {build:function(S, lv, A){ var D = LV[lv], piles = D.p.slice(), k = piles.length, seeds = [], sel = {}, turn = "me", over = false, kmax = D.k2 ? 2 : 1, GM = Game(!!D.mis, kmax), R = IQ.rnd(Date.now() % 7919 + 17);
  var bw = k * 1.7 + 2.4, sh = new T.Shape(); sh.moveTo(-bw / 2, 0); sh.quadraticCurveTo(-bw / 2, -1.1, -bw / 2 + 1.1, -1.1); sh.lineTo(bw / 2 - 1.1, -1.1); sh.quadraticCurveTo(bw / 2, -1.1, bw / 2, 0); sh.quadraticCurveTo(bw / 2, 1.1, bw / 2 - 1.1, 1.1); sh.lineTo(-bw / 2 + 1.1, 1.1); sh.quadraticCurveTo(-bw / 2, 1.1, -bw / 2, 0);
  var body = new T.Mesh(new T.ExtrudeGeometry(sh, {depth:0.45, bevelEnabled:true, bevelSize:0.08, bevelThickness:0.08, bevelSegments:3}), IQ.mat.wood()); body.rotation.x = -Math.PI / 2; S.add(body);
  var carve = new T.Mesh(new T.TorusGeometry(1, 0.03, 6, 64), IQ.mat.brass()); carve.scale.set(bw / 2 - 0.25, 0.95, 1); carve.rotation.x = Math.PI / 2; carve.position.y = 0.56; S.add(carve);
  var px = function(i){ return (i - (k - 1) / 2) * 1.7; }, pitM = IQ.mat.plain(0x4a2c16, 0.95);
  for(var i = 0; i < k; i++){ var pit = new T.Mesh(new T.SphereGeometry(0.7, 28, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), pitM); pit.scale.set(1, 0.5, 0.9); pit.position.set(px(i), 0.56, 0); S.add(pit);
    var hz = new T.Mesh(new T.CylinderGeometry(0.75, 0.75, 1.4, 12), new T.MeshBasicMaterial({visible:false})); hz.position.set(px(i), 0.7, 0); hz.userData = {p:1, pit:i}; S.add(hz, false);
    var lb = IQ.label(IQ.ar(i + 1), {fg:"#D4A544", s:0.5}); lb.position.set(px(i), 0.58, 0.95); S.add(lb); }
  [-1, 1].forEach(function(s){ var st = new T.Mesh(new T.SphereGeometry(0.75, 24, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), pitM); st.scale.set(0.8, 0.5, 1.2); st.position.set(s * (bw / 2 - 0.7), 0.56, 0); S.add(st); });
  var seedG = new T.SphereGeometry(0.19, 20, 14), seedC = [0xd8b080, 0xb8885a, 0xecd09a, 0x9a6a42];
  function spot(i, j){ var a = j * 2.4, r = 0.12 + (j % 5) * 0.08; return new T.Vector3(px(i) + Math.cos(a) * r * 1.4, 0.48 + Math.floor(j / 5) * 0.14, Math.sin(a) * r * 1.2); }
  piles.forEach(function(n, i){ seeds[i] = []; for(var j = 0; j < n; j++){ var m = new T.Mesh(seedG, new T.MeshPhysicalMaterial({color:seedC[Math.floor(R() * 4)], roughness:0.3, clearcoat:0.8})); m.scale.set(1, 0.8, 1.15); m.position.copy(spot(i, j)); m.userData = {p:1, pit:i, j:j}; S.add(m); seeds[i].push(m); } });
  var taken = {me:0, ai:0}; S.size = bw * 0.82; S.orb.tEl = 1.05;
  function selN(){ return Object.keys(sel).reduce(function(a, p){ return a + sel[p]; }, 0); }
  function mark(){ seeds.forEach(function(arr, i){ arr.forEach(function(m, j){ var on = sel[i] && j >= arr.length - sel[i]; m.material.emissive = new T.Color(on ? 0x6a4a10 : 0); m.position.y = spot(i, j).y + (on ? 0.25 : 0); }); }); var b = ctl.querySelector("#cTake"); b.disabled = !(selN() > 0 && turn === "me"); b.textContent = A.L("Ambil ", "Take ") + (selN() || ""); }
  function take(mv, who, done){ var side = who === "me" ? 1 : -1, q = 0; mv.forEach(function(m){ var i = m[0], n = m[1], arr = seeds[i], go = arr.splice(arr.length - n, n); piles[i] -= n;
      go.forEach(function(sd){ var to = new T.Vector3(side * (bw / 2 - 0.7) + (R() - 0.5) * 0.5, 0.5 + taken[who] * 0.03, (R() - 0.5) * 0.9); taken[who]++; sd.material.emissive = new T.Color(0); setTimeout(function(){ S.hop(sd, to, 1.2, 420); }, q++ * 70); sd.userData.p = 0; }); });
    setTimeout(done, q * 70 + 460); }
  function left(){ return piles.reduce(function(a, b){ return a + b; }, 0); }
  function end(lastBy){ over = true; var meWin = D.mis ? lastBy === "ai" : lastBy === "me"; if(meWin) A.win(); else A.say(D.mis ? A.L("Anda ambil biji terakhir dan kalah. Cuba lagi.", "You took the last seed and lost. Try again.") : A.L("Robot ambil biji terakhir. Cuba lagi.", "The robot took the last seed. Try again."), 4000); }
  function aiMove(){ var mv = R() >= D.err ? GM.best(piles) : null; if(!mv){ var ms = GM.moves(piles); mv = ms[Math.floor(R() * Math.min(ms.length, 6))]; }
    A.say(A.L("Robot ambil ", "Robot takes ") + mv.map(function(m){ return m[1] + A.L(" dari lubang ", " from pit ") + (m[0] + 1); }).join(A.L(" dan ", " and ")));
    take(mv, "ai", function(){ if(!left()){ end("ai"); return; } turn = "me"; mark(); }); }
  var ctl = A.ctl('<button class="iqB gold" id="cTake" disabled>' + A.L("Ambil", "Take") + '</button><button class="iqB" id="cClr">✕</button>' +
    (D.mis ? '<span class="mut tiny" style="flex-basis:100%;text-align:center">⚠️ ' + A.L("Tahap ini: yang ambil biji terakhir KALAH", "This level: whoever takes the last seed LOSES") + '</span>' : '') + (D.k2 ? '<span class="mut tiny" style="flex-basis:100%;text-align:center">' + A.L("Tahap ini: boleh ambil dari 1 atau 2 lubang sekali gus", "This level: you may take from 1 or 2 pits at once") + '</span>' : ''));
  ctl.querySelector("#cClr").onclick = function(){ sel = {}; mark(); };
  ctl.querySelector("#cTake").onclick = function(){ if(turn !== "me" || !selN() || over) return; turn = "ai"; var mv = Object.keys(sel).map(function(p){ return [+p, sel[p]]; }); sel = {}; mark(); A.move(); take(mv, "me", function(){ if(!left()){ end("me"); return; } setTimeout(aiMove, 500); }); };
  S.onPick = function(o){ if(!o || o.userData.pit == null || turn !== "me" || over) return; var i = o.userData.pit, arr = seeds[i]; if(!arr.length) return;
    var n = o.userData.j != null ? arr.length - arr.indexOf(o) : (sel[i] ? Math.min(arr.length, sel[i] + 1) : 1);
    if(!sel[i] && Object.keys(sel).length >= kmax){ var first = Object.keys(sel)[0]; delete sel[first]; } sel[i] = n; mark(); };
  mark();
  return {hint:function(){ var mv = GM.best(piles); if(!mv) return A.L("Kedudukan ini kalah jika robot main sempurna. Ambil sedikit dan harap ia tersilap.", "This position loses against perfect play. Take a little and hope for a mistake.");
    return A.L("Ambil ", "Take ") + mv.map(function(m){ return m[1] + A.L(" dari lubang ", " from pit ") + (m[0] + 1); }).join(A.L(" dan ", " and ")); }}; }});
})();
