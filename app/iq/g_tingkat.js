/* IQ 2 · Tingkat Tembaga (Tower of Hanoi): tap a peg to lift its top tray, tap another to put it down. */
(function(){ var T = THREE, IQ = window.IQ;
IQ.def("tingkat", {build:function(S, lv, A){ var n = lv < 3 ? lv + 3 : [6, 7, 7][lv - 3], PX = n > 5 ? [-3.1, 0, 3.1] : [-2.6, 0, 2.6], st = [[], [], []], held = null, trays = [];
  var base = new T.Mesh(new T.BoxGeometry(n > 5 ? 9.6 : 8.2, 0.35, 2.6), IQ.mat.wood()); base.position.y = 0.17; S.add(base);
  var inlay = new T.Mesh(new T.BoxGeometry(n > 5 ? 9.3 : 7.9, 0.02, 2.3), IQ.mat.glaze(0xffffff, {map:IQ.starTex("tk", "#3a78c0", "#a8ccf2", "#e8b84a")})); inlay.position.y = 0.36; S.add(inlay);
  var pegs = PX.map(function(x, i){ var g = new T.Group(), p = new T.Mesh(new T.CylinderGeometry(0.09, 0.11, 2.6, 16), IQ.mat.brass()); p.position.y = 1.65; g.add(p);
    var k = new T.Mesh(new T.SphereGeometry(0.16, 16, 12), IQ.mat.gold()); k.position.y = 3.0; g.add(k); var ft = new T.Mesh(new T.CylinderGeometry(0.4, 0.5, 0.12, 24), IQ.mat.brass()); ft.position.y = 0.42; g.add(ft);
    var hit = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 3.4, 12), new T.MeshBasicMaterial({visible:false})); hit.position.y = 1.7; g.add(hit);
    g.position.x = x; g.userData = {p:1, peg:i}; S.add(g); return g; });
  var cols = [0xb08d57, 0x1F5FA8, 0x2AA198, 0x8E2B2B, 0xD4A544];
  for(var i = 0; i < n; i++){ var r = 0.38 + (n - 1 - i) * (n > 5 ? 0.145 : 0.17), pts = [], h = 0.26; pts.push(new T.Vector2(0.12, 0)); pts.push(new T.Vector2(r, 0)); pts.push(new T.Vector2(r + 0.05, h * 0.6)); pts.push(new T.Vector2(r - 0.02, h)); pts.push(new T.Vector2(0.14, h * 0.85));
    var m = new T.Mesh(new T.LatheGeometry(pts, 40), i % 2 ? IQ.mat.glaze(cols[(i + 1) % 5], {metalness:0.1}) : new T.MeshStandardMaterial({color:cols[i % 5], metalness:0.9, roughness:0.3}));
    var band = new T.Mesh(new T.TorusGeometry(r + 0.02, 0.025, 8, 48), IQ.mat.gold()); band.rotation.x = Math.PI / 2; band.position.y = h * 0.62; m.add(band);
    m.userData = {size:n - i}; st[0].push(m); trays.push(m); S.add(m); }
  function place(m, p, k){ return new T.Vector3(PX[p], 0.42 + k * 0.27, 0); }
  if(lv === 5){ var R = IQ.rnd(Date.now() % 9973 + 5), all = st[0]; st = [[], [], []]; do { st = [[], [], []]; all.forEach(function(m){ st[Math.floor(R() * 3)].push(m); }); } while(st[2].length === n || st[0].length === n); }   // extreme: a scrambled start
  st.forEach(function(s, p){ s.forEach(function(m, k){ m.position.copy(place(m, p, k)); }); });
  S.size = n > 5 ? 9 : 7.4; S.orb.tEl = 0.72;
  function shake(o){ var x0 = o.position.x; S.tween(300, function(e){ o.position.x = x0 + Math.sin(e * Math.PI * 6) * 0.08 * (1 - e); }); }
  S.onPick = function(o){ if(!o || o.userData.peg == null || S.busy()) return; var p = o.userData.peg;
    if(held === null){ if(!st[p].length) return; held = p; var m = st[p][st[p].length - 1]; S.hop(m, new T.Vector3(PX[p], 3.6, 0), 0, 220); return; }
    var m2 = st[held][st[held].length - 1], top = st[p][st[p].length - 1];
    if(p !== held && top && top.userData.size < m2.userData.size){ A.say(A.L("Dulang besar tidak boleh di atas yang kecil", "A big tray can't sit on a smaller one")); shake(m2); return; }
    if(p === held){ S.hop(m2, place(m2, p, st[p].length - 1), 0, 200); held = null; return; }
    st[held].pop(); st[p].push(m2); var from = held; held = null; A.move();
    S.tween(420, function(e){ var a = new T.Vector3(PX[from], 3.6, 0), b = place(m2, p, st[p].length - 1), mid = new T.Vector3((PX[from] + PX[p]) / 2, 4.1, 0); var q = 1 - e; m2.position.set(q * q * a.x + 2 * q * e * mid.x + e * e * b.x, q * q * a.y + 2 * q * e * mid.y + e * e * b.y, 0); }, function(){ if(st[2].length === n) A.win(); }); };
  // optimal next move from any position
  function next(){ var where = []; st.forEach(function(s, p){ s.forEach(function(m){ where[m.userData.size] = p; }); }); var tgt = 2;
    for(var k = n; k >= 1; k--){ if(where[k] === tgt) continue; var other = 3 - where[k] - tgt; var blocked = false; for(var j = k - 1; j >= 1; j--){ if(where[j] !== other){ blocked = true; break; } }
      if(!blocked) return [where[k], tgt]; tgt = other; } return null; }
  var par = (function(){ var keep = st.map(function(s){ return s.slice(); }), c = 0, mv; while((mv = next()) && c < 300){ st[mv[1]].push(st[mv[0]].pop()); c++; } st = keep; return c; })();
  return {par:par, hint:function(){ if(held !== null) return A.L("Letakkan dulang yang diangkat dahulu", "Put the lifted tray down first"); var mv = next(); return mv ? A.L("Pindah dari tiang ", "Move from peg ") + (mv[0] + 1) + A.L(" ke tiang ", " to peg ") + (mv[1] + 1) : ""; }}; }});
})();
