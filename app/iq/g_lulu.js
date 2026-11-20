/* IQ 12 · Kod Lu'lu' (pearl code): pick pearls for the row, then Check. Gold dot = right colour in the right place; pale dot = right colour, wrong place. */
(function(){ var T = THREE, IQ = window.IQ;
var LV = [{n:4, c:4, dup:false}, {n:4, c:6, dup:true}, {n:5, c:6, dup:true}, {n:6, c:8, dup:true}, {n:6, c:8, dup:true, max:7}, {n:6, c:8, dup:true, max:8, exact:true}], MAX = 10;
var PC = [0xf5efe3, 0xe88aa0, 0x7ad1ff, 0xffd27a, 0x8fe3a0, 0xb48cff, 0xff8c42, 0x3a3a48], PN = [["Putih","White"],["Merah jambu","Pink"],["Biru","Blue"],["Emas","Gold"],["Hijau","Green"],["Ungu","Purple"],["Jingga","Orange"],["Hitam","Black"]];
IQ.def("lulu", {build:function(S, lv, A){ var D = LV[lv], MAX = D.max || 10, R = IQ.rnd(Date.now() % 65521 + 1), code = [], rows = [], cur = [], row = 0, done = false;
  while(code.length < D.n){ var c = Math.floor(R() * D.c); if(D.dup || code.indexOf(c) < 0) code.push(c); }
  var pm = PC.map(function(c){ return new T.MeshPhysicalMaterial({color:c, roughness:0.12, clearcoat:1, clearcoatRoughness:0.05, sheen:1, sheenColor:new T.Color(0xffffff), iridescence:0.6, emissive:c, emissiveIntensity:0.08}); });
  var sp = 0.62, W = D.n * sp + 1.6, Hh = MAX * 0.5 + 0.6;
  var board = new T.Mesh(new T.BoxGeometry(W, 0.3, Hh), IQ.mat.wood()); board.position.set(0, 0.15, 0); S.add(board);
  var inl = new T.Mesh(new T.BoxGeometry(W - 0.3, 0.02, Hh - 0.3), new T.MeshStandardMaterial({color:0xffffff, roughness:0.4, map:IQ.starTex("ll", "#3a6eb2", "rgba(190,220,255,.35)", "rgba(240,190,80,.45)")})); inl.position.y = 0.31; S.add(inl);
  var rz = function(r){ return Hh / 2 - 0.55 - r * 0.5; }, sx = function(i){ return -W / 2 + 0.6 + i * sp; }, cup = new T.TorusGeometry(0.17, 0.03, 8, 24), pearl = new T.SphereGeometry(0.2, 32, 24), dotG = new T.SphereGeometry(0.06, 12, 8);
  for(var r = 0; r < MAX; r++){ for(var i = 0; i < D.n; i++){ var cu = new T.Mesh(cup, IQ.mat.brass()); cu.rotation.x = Math.PI / 2; cu.position.set(sx(i), 0.34, rz(r)); S.add(cu, false); if(r === 0){} } }
  var act = new T.Mesh(new T.BoxGeometry(D.n * sp + 0.1, 0.02, 0.44), IQ.mat.glow(IQ.C.teal, 0.5)); act.position.set(sx(0) + (D.n - 1) * sp / 2, 0.33, rz(0)); S.add(act, false);
  // the palette: pearls in a brass dish to the side
  var pal = []; for(var c2 = 0; c2 < D.c; c2++){ var m = new T.Mesh(pearl, pm[c2]); m.position.set(W / 2 + 0.7, 0.45, -Hh / 2 + 0.8 + c2 * 0.62); m.scale.setScalar(1.25); m.userData = {p:1, col:c2}; S.add(m); pal.push(m); }
  var dish = new T.Mesh(new T.BoxGeometry(0.9, 0.12, D.c * 0.62 + 0.3), IQ.mat.brass()); dish.position.set(W / 2 + 0.7, 0.18, -Hh / 2 + 0.8 + (D.c - 1) * 0.31); S.add(dish);
  var secret = new T.Mesh(new T.BoxGeometry(D.n * sp + 0.3, 0.4, 0.5), IQ.mat.wood()); secret.position.set(sx(0) + (D.n - 1) * sp / 2, 0.5, -Hh / 2 - 0.45); S.add(secret);
  S.size = Math.max(W + 2.2, Hh + 0.6); S.orb.tEl = 1.15; S.orb.cx = 0.5;
  var curM = [];
  function draw(){ curM.forEach(function(m){ S.root.remove(m); }); curM = cur.map(function(c, i){ var m = new T.Mesh(pearl, pm[c]); m.position.set(sx(i), 0.45, rz(row)); m.userData = {p:1, slot:i}; S.root.add(m); m.castShadow = true; return m; }); act.position.z = rz(row); var b = ctl.querySelector("#lCk"); b.disabled = cur.length !== D.n; }
  function score(g){ var ex = 0, cl = 0, a = {}, b = {}; g.forEach(function(c, i){ if(c === code[i]) ex++; else { a[c] = (a[c] || 0) + 1; b[code[i]] = (b[code[i]] || 0) + 1; } }); for(var k in a) cl += Math.min(a[k], b[k] || 0); return [ex, cl]; }
  var ctl = A.ctl('<button class="iqB gold" id="lCk" disabled>✓ ' + A.L("Semak", "Check") + '</button><button class="iqB" id="lBk">⌫</button>');
  ctl.querySelector("#lBk").onclick = function(){ if(done) return; cur.pop(); draw(); };
  ctl.querySelector("#lCk").onclick = function(){ if(done || cur.length !== D.n) return; var s = score(cur); A.move(); curM.forEach(function(m){ m.userData.p = 0; }); curM = [];
    if(D.exact) s = [s[0], 0]; for(var k = 0; k < D.n; k++){ var d = new T.Mesh(dotG, k < s[0] ? IQ.mat.glow(IQ.C.gold, 1.5) : k < s[0] + s[1] ? IQ.mat.plain(0xe8e0d0, 0.3) : IQ.mat.plain(0x203050, 0.8)); d.position.set(W / 2 - 0.55 + (k % 3) * 0.17, 0.36, rz(row) - 0.08 + Math.floor(k / 3) * 0.17); S.add(d, false); }
    rows.push(cur); cur = []; if(cur.every(function(c, q){ return c === code[q]; })){ done = true; reveal(); A.win(); return; } row++; if(row >= MAX){ done = true; reveal(); A.say(A.L("Habis giliran. Kod didedahkan.", "Out of guesses. The code is shown."), 3000); return; } draw(); };
  function reveal(){ S.tween(600, function(e){ secret.position.z = -Hh / 2 - 0.45 - e * 0.8; secret.position.y = 0.5 - e * 0.3; }); code.forEach(function(c, i){ var m = new T.Mesh(pearl, pm[c]); m.position.set(sx(i), 0.45, -Hh / 2 - 0.45); S.add(m); }); }
  draw(); A.say(A.L("Cubaan: ", "Guesses: ") + MAX + (D.exact ? A.L(" · petunjuk hanya ● (tepat tempat)", " · clues show only ● (right place)") : ""), 2600);
  S.onPick = function(o){ if(!o || done) return; if(o.userData.col != null){ if(cur.length < D.n){ cur.push(o.userData.col); draw(); } return; } if(o.userData.slot != null){ cur.splice(o.userData.slot, 1); draw(); } };
  return {hint:function(){ // reveal one position the player hasn't pinned down yet
    for(var i = 0; i < D.n; i++){ if(!rows.some(function(g){ return g[i] === code[i]; })) return A.L("Mutiara ke-", "Pearl ") + (i + 1) + A.L(" ialah ", " is ") + A.L(PN[code[i]][0], PN[code[i]][1]); } return A.L("Anda sudah ada semua petunjuk. Susun semula.", "You have every clue; rearrange."); }}; }});
})();
