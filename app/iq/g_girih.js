/* IQ 6 · Jubin Girih: fill the shape with every piece. Tap a piece, ↻ to turn it, then tap where its gold corner should go. Tap a placed piece to lift it again. */
(function(){ var T = THREE, IQ = window.IQ;
function region(lv){ var c = [], x, y; if(lv === 0){ for(y = 0; y < 3; y++) for(x = 0; x < 4; x++) c.push([x, y]); }
  else if(lv === 1){ for(y = 0; y < 5; y++) for(x = 0; x < 5; x++) if(!((x === 0 || x === 4) && (y === 0 || y === 4))) c.push([x, y]); }
  else if(lv === 2){ for(y = 0; y < 7; y++) for(x = 0; x < 7; x++){ var dx = Math.abs(x - 3), dy = Math.abs(y - 3); if(dx + dy <= 4 && !(dx === 3 && dy === 3) || (dx <= 1 || dy <= 1)) c.push([x, y]); } }
  else { var m = lv === 5 ? 9 : 8, ce = (m - 1) / 2; for(y = 0; y < m; y++) for(x = 0; x < m; x++){ var ax = Math.abs(x - ce), ay = Math.abs(y - ce); if(ax + ay <= m * 0.62 || Math.min(ax, ay) <= 1) c.push([x, y]); } } return c; }
function split(cells, k, R){ var key = function(p){ return p[0] + "," + p[1]; }, all = {}; cells.forEach(function(p){ all[key(p)] = 1; });
  for(var tr = 0; tr < 4000; tr++){ var own = {}, gs = [], pool = cells.slice(); for(var i = 0; i < k; i++){ var s = pool.splice(Math.floor(R() * pool.length), 1)[0]; own[key(s)] = i; gs.push([s]); }
    var left = cells.length - k, guard = 0; while(left > 0 && guard++ < 5000){ var gi = Math.floor(R() * k), g = gs[gi], c = g[Math.floor(R() * g.length)], d = [[1,0],[-1,0],[0,1],[0,-1]][Math.floor(R() * 4)], n = [c[0] + d[0], c[1] + d[1]], kk = key(n);
      if(all[kk] && own[kk] == null && g.length < 6){ own[kk] = gi; g.push(n); left--; } }
    if(left === 0 && gs.every(function(g){ return g.length >= 3; })) return gs; } return null; }
function norm(c){ var mx = Math.min.apply(null, c.map(function(p){ return p[0]; })), mz = Math.min.apply(null, c.map(function(p){ return p[1]; })); return c.map(function(p){ return [p[0] - mx, p[1] - mz]; }); }
function rot(c){ return norm(c.map(function(p){ return [-p[1], p[0]]; })); }
function flipS(c){ return norm(c.map(function(p){ return [-p[0], p[1]]; })); }
IQ.def("girih", {build:function(S, lv, A){ var R = IQ.rnd(Date.now() % 77777 + 11), cells = region(lv), k = [3, 5, 8, 10, 10, 14][lv], flip = lv >= 4, decoy = [0, 0, 0, 0, 2, 3][lv], parts = null; while(!parts) parts = split(cells, k, R);
  for(var dq = 0; dq < decoy; dq++){ var dp = [[0, 0]]; while(dp.length < 3 + Math.floor(R() * 3)){ var bq = dp[Math.floor(R() * dp.length)], dd = [[1,0],[-1,0],[0,1],[0,-1]][Math.floor(R() * 4)], nq = [bq[0] + dd[0], bq[1] + dd[1]]; if(!dp.some(function(q){ return q[0] === nq[0] && q[1] === nq[1]; })) dp.push(nq); } parts.push(dp); }
  var W = Math.max.apply(null, cells.map(function(p){ return p[0]; })) + 1, Hh = Math.max.apply(null, cells.map(function(p){ return p[1]; })) + 1, cs = 0.82, key = function(p){ return p[0] + "," + p[1]; }, inR = {}, occ = {};
  cells.forEach(function(p){ inR[key(p)] = 1; });
  var B = IQ.tray(S, W + 1, Hh + 1, cs, {tiles:false, pad:0.3}), slotM = new T.MeshStandardMaterial({color:0x3a5078, roughness:0.85}), edgeM = IQ.mat.brass(), off = 0.5;
  var cpos = function(x, z, y){ return B.pos(x + off, z + off, y); };
  cells.forEach(function(p){ var m = new T.Mesh(new T.BoxGeometry(cs * 0.96, 0.05, cs * 0.96), slotM); m.position.copy(cpos(p[0], p[1], 0.32)); m.userData = {p:1, cell:p}; S.add(m);
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){ if(!inR[key([p[0] + d[0], p[1] + d[1]])]){ var e = new T.Mesh(new T.BoxGeometry(d[0] ? 0.04 : cs, 0.08, d[0] ? cs : 0.04), edgeM); e.position.copy(cpos(p[0] + d[0] * 0.5, p[1] + d[1] * 0.5, 0.36)); S.add(e); } }); });
  var cols = [IQ.C.blue, IQ.C.teal, 0xc9a35a, 0x8E2B2B, 0x5a3e8a, 0x1f7a5a, 0xd97a2a, 0x3a6ab0], tex = function(i){ return IQ.starTex("gp" + i, "#" + new T.Color(cols[i]).getHexString(), "rgba(255,240,210,.55)", "rgba(255,230,160,.85)"); };
  var P = parts.map(function(g, i){ var shape = norm(g), r0 = Math.floor(R() * 4); for(var q = 0; q < r0; q++) shape = rot(shape); if(flip && R() < 0.5) shape = flipS(shape); return {i:i, o:i, shape:shape, at:null, grp:null}; }).sort(function(){ return R() - 0.5; }).map(function(p, i){ p.i = i; return p; });
  var trayZ = (Hh + 1) * cs / 2 + 0.9, ts = 0.6, spots = [], rowW = 0, row = 0, x0 = 0, maxW = Math.max((W + 1) * cs + 1, 6);
  P.forEach(function(p){ var w = (Math.max.apply(null, p.shape.map(function(c){ return c[0]; })) + 1) * cs * ts; if(rowW + w > maxW){ row++; rowW = 0; } spots.push([rowW, row, w]); rowW += w + 0.5; });
  spots = spots.map(function(s){ var rw = 0; spots.forEach(function(t){ if(t[1] === s[1]) rw = Math.max(rw, t[0] + t[2]); }); return new T.Vector3(s[0] - rw / 2, 0.5, trayZ + s[1] * 2.1 * ts * 2); });
  function mesh(p){ if(p.grp) S.root.remove(p.grp); var g = new T.Group(), mt = IQ.mat.glaze(cols[p.i % 8], {map:tex(p.i % 8)});
    p.shape.forEach(function(c, j){ var b = new T.Mesh(new T.BoxGeometry(cs * 0.94, 0.26, cs * 0.94), mt); b.position.set(c[0] * cs, 0, c[1] * cs); b.castShadow = true; g.add(b);
      if(j === 0){ var d = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.05, 16), IQ.mat.gold()); d.position.set(c[0] * cs, 0.15, c[1] * cs); g.add(d); } });
    g.userData = {p:1, piece:p.i}; p.grp = g; S.root.add(g); return g; }
  function home(p, anim){ p.grp.scale.setScalar(ts); var to = spots[p.i].clone(); if(anim) S.hop(p.grp, to, 0.6, 260); else p.grp.position.copy(to); }
  P.forEach(function(p){ mesh(p); home(p); });
  var rowsN = Math.max.apply(null, spots.map(function(v){ return v.z; })) ; S.size = Math.max(W * cs + 2, 7); S.orb.cz = (rowsN - (Hh + 1) * cs / 2) / 2 + 0.3; S.orb.tEl = 1.2; S.size = Math.max(S.size, (rowsN + (Hh + 1) * cs / 2) * 0.9);
  var sel = null;
  function lift(p, on){ var g = p.grp; g.children.forEach(function(b){ if(b.material && b.material.emissive){ b.material.emissive = new T.Color(on ? 0x3a2a08 : 0); } }); var y0 = g.position.y; S.tween(150, function(e){ g.position.y = y0 + ((on ? 0.9 : 0.5) - y0) * e; }); }
  function fits(p, ax, az){ var cl = p.shape.map(function(c){ return [ax + c[0] - p.shape[0][0], az + c[1] - p.shape[0][1]]; }); for(var i = 0; i < cl.length; i++){ var kk = key(cl[i]); if(!inR[kk] || (occ[kk] != null && occ[kk] !== p.i)) return null; } return cl; }
  function free(p){ Object.keys(occ).forEach(function(kk){ if(occ[kk] === p.i) delete occ[kk]; }); p.at = null; }
  var ctl = A.ctl('<button class="iqB" id="gRot">↻ ' + A.L("Putar", "Turn") + '</button>' + (flip ? '<button class="iqB" id="gFlip">⇋ ' + A.L("Terbalikkan", "Flip") + '</button>' : '') + (decoy ? '<span class="mut tiny" style="flex-basis:100%;text-align:center">' + A.L("Ada ", "There are ") + decoy + A.L(" kepingan umpan yang tidak diperlukan.", " decoy pieces you won't need.") + '</span>' : ''));
  var fb = ctl.querySelector("#gFlip"); if(fb) fb.onclick = function(){ if(!sel) return; sel.shape = flipS(sel.shape); var pos = sel.grp.position.clone(); mesh(sel); sel.grp.position.copy(pos); lift(sel, true); };
  ctl.querySelector("#gRot").onclick = function(){ if(!sel) return; sel.shape = rot(sel.shape); var pos = sel.grp.position.clone(); mesh(sel); sel.grp.position.copy(pos); lift(sel, true); };
  S.onPick = function(o){ if(!o || S.busy()) return;
    if(o.userData.piece != null){ var p = P[o.userData.piece]; if(sel === p){ sel.shape = rot(sel.shape); var ps = p.grp.position.clone(); mesh(p); p.grp.position.copy(ps); lift(p, true); return; }
      if(sel) lift(sel, false); if(p.at){ free(p); } sel = p; p.grp.scale.setScalar(1); lift(p, true); return; }
    if(o.userData.cell && sel){ var c = o.userData.cell, cl = fits(sel, c[0], c[1]); if(!cl){ A.say(A.L("Tidak muat di situ", "It doesn't fit there")); return; }
      var p2 = sel; free(p2); cl.forEach(function(q){ occ[key(q)] = p2.i; }); p2.at = cl; sel = null; A.move();
      var to = cpos(cl[0][0], cl[0][1], 0.48); to.x -= 0; S.hop(p2.grp, to, 0.8, 300, function(){ p2.grp.children.forEach(function(b){ if(b.material && b.material.emissive) b.material.emissive = new T.Color(0); });
        if(Object.keys(occ).length === cells.length) A.win(); }); } };
  return {par:k, hint:function(){ var p = P.filter(function(q){ return !q.at && q.i < 999; })[0]; if(!p) return A.L("Semua diletak. Angkat yang salah.", "All placed. Lift any that look wrong."); if(p.o >= k) return A.L("Kepingan pertama di dulang ialah umpan", "The first piece in the tray is a decoy"); var g = parts[p.o]; return A.L("Kepingan ini milik kawasan berhampiran baris ", "This piece belongs near row ") + (g[0][1] + 1) + A.L(", lajur ", ", column ") + (g[0][0] + 1); }}; }});
})();
