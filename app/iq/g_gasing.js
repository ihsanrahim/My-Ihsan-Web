/* IQ 18 · Rantai Gasing: place exactly the number of tops shown so they touch in one line from the spinning top (S) to the last top (E), then Spin.
   Level 3 must pass the gold square. 0.6.38: level 4 9×9 long chain; level 5 two chains that must not touch each other; level 6 three gold squares in order 1, 2, 3. */
(function(){ var T = THREE, IQ = window.IQ;
var LV = [{n:5, len:[8]}, {n:6, len:[12]}, {n:7, len:[15], cp:1}, {n:9, len:[24]}, {n:8, len:[12, 11]}, {n:8, len:[22], cp:3}];
var DD = [[1,0],[-1,0],[0,1],[0,-1]];
function gen(D, R){ var n = D.n, key = function(p){ return p[0] + "," + p[1]; };
  function walk(len, avoid){ for(var tr = 0; tr < 400; tr++){ var s, guard = 0; do { s = [Math.floor(R() * n), Math.floor(R() * n)]; } while((avoid[key(s)] || DD.some(function(d){ return avoid[key([s[0] + d[0], s[1] + d[1]])]; })) && guard++ < 200);
      var path = [s], seen = {}; seen[key(s)] = 1;
      while(path.length < len){ var c = path[path.length - 1], nb = DD.map(function(d){ return [c[0] + d[0], c[1] + d[1]]; }).filter(function(q){ return q[0] >= 0 && q[1] >= 0 && q[0] < n && q[1] < n && !seen[key(q)] && !avoid[key(q)] && !DD.some(function(d){ return avoid[key([q[0] + d[0], q[1] + d[1]])]; }); });
        nb = nb.filter(function(q){ return DD.every(function(d){ var r = [q[0] + d[0], q[1] + d[1]]; return (r[0] === c[0] && r[1] === c[1]) || !seen[key(r)]; }); });   // a clean line: a new cell touches only the previous one
        if(!nb.length) break; var q2 = nb[Math.floor(R() * nb.length)]; path.push(q2); seen[key(q2)] = 1; }
      if(path.length === len) return path; } return null; }
  for(var tr = 0; tr < 2000; tr++){ var used = {}, chains = [], ok = true;
    D.len.forEach(function(L){ if(!ok) return; var p = walk(L, used); if(!p){ ok = false; return; } p.forEach(function(c){ used[key(c)] = 1; }); chains.push(p); }); if(!ok) continue;
    var blocks = {}; for(var i = 0; i < n * n * 0.16; i++){ var b = [Math.floor(R() * n), Math.floor(R() * n)]; if(!used[key(b)]) blocks[key(b)] = 1; }
    // each chain's shortest route must be shorter than its wanted length, so the count matters
    var shortOk = chains.every(function(p){ var s = p[0], e = p[p.length - 1], dist = {}, qq = [s]; dist[key(s)] = 0; while(qq.length){ var cc = qq.shift(); DD.forEach(function(d){ var r = [cc[0] + d[0], cc[1] + d[1]], k = key(r); if(r[0] < 0 || r[1] < 0 || r[0] >= n || r[1] >= n || blocks[k] || dist[k] != null) return; dist[k] = dist[key(cc)] + 1; qq.push(r); }); }
      return dist[key(e)] != null && dist[key(e)] < p.length - 1; });
    if(!shortOk) continue;
    var cps = []; if(D.cp){ var p0 = chains[0]; for(var c = 1; c <= D.cp; c++) cps.push(p0[Math.round(c * (p0.length - 1) / (D.cp + 1))]); }
    return {chains:chains, blocks:blocks, cps:cps}; } return null; }
IQ.gasingGen = gen; IQ.gasingLV = LV;
IQ.def("gasing", {build:function(S, lv, A){ var D = LV[lv], R = IQ.rnd(Date.now() % 61001 + 13), G = null; while(!G) G = gen(D, R); var n = D.n, cs = n > 7 ? 0.82 : 0.95, key = function(p){ return p[0] + "," + p[1]; }, tops = {}, spinning = false;
  var need = D.len.reduce(function(a, l){ return a + l - 2; }, 0), ends = {}, chainCol = [[0xD4A544, 0x2AA198], [0x8a7ad8, 0xe07a4a]];
  var B = IQ.tray(S, n, n, cs, {mats:[IQ.mat.plain(0xc9a878, 0.8), IQ.mat.plain(0xb8966a, 0.8)]});
  Object.keys(G.blocks).forEach(function(k){ var p = k.split(",").map(Number), m = new T.Mesh(new T.BoxGeometry(cs * 0.8, 0.45, cs * 0.8), IQ.mat.stone(0x7f7060)); m.position.copy(B.pos(p[0], p[1], 0.62)); S.add(m); });
  G.cps.forEach(function(c, i){ var cp = new T.Mesh(new T.CylinderGeometry(0.38 * cs, 0.38 * cs, 0.03, 24), IQ.mat.glow(IQ.C.gold, 0.9)); cp.position.copy(B.pos(c[0], c[1], 0.43)); S.add(cp, false);
    if(G.cps.length > 1){ var lb = IQ.label(String(i + 1), {fg:"#1a1405", s:0.36, font:"bold 150px sans-serif"}); lb.position.copy(B.pos(c[0], c[1], 0.45)); lb.position.x += 0.24 * cs; lb.position.z -= 0.24 * cs; S.add(lb, false); } });
  function top(colr){ var g = new T.Group(), pts = []; for(var i = 0; i <= 14; i++){ var t = i / 14; pts.push(new T.Vector2(t < 0.55 ? 0.05 + t * 0.62 : 0.39 * (1 - (t - 0.55) / 0.45) + 0.04, t * 0.5)); }
    var body = new T.Mesh(new T.LatheGeometry(pts, 32), new T.MeshStandardMaterial({color:colr, roughness:0.35, metalness:0.2, map:IQ.canvasTex("gs" + colr, 64, 64, function(c, w){ c.fillStyle = "#" + new T.Color(colr).getHexString(); c.fillRect(0, 0, w, w); c.fillStyle = "rgba(255,230,160,.85)"; for(var k = 0; k < 8; k++) c.fillRect(k * 8, 0, 3, w); })}));
    var tip = new T.Mesh(new T.ConeGeometry(0.06, 0.14, 12), IQ.mat.brass()); tip.rotation.x = Math.PI; tip.position.y = -0.03; var knob = new T.Mesh(new T.CylinderGeometry(0.05, 0.07, 0.16, 12), IQ.mat.brass()); knob.position.y = 0.56; g.add(body); g.add(tip); g.add(knob); g.scale.setScalar(cs / 0.95); g.traverse(function(o){ if(o.isMesh) o.castShadow = true; }); return g; }
  var starts = G.chains.map(function(p, ci){ var sT = top(chainCol[ci][0]), eT = top(chainCol[ci][1]), s = p[0], e = p[p.length - 1]; sT.position.copy(B.pos(s[0], s[1], 0.5)); eT.position.copy(B.pos(e[0], e[1], 0.5)); S.add(sT); S.add(eT);
    var tag = G.chains.length > 1 ? String(ci + 1) : ""; [["S", s], ["E", e]].forEach(function(x){ var l = IQ.label(x[0] + tag, {fg:x[0] === "S" ? "#1a1405" : "#ffffff", s:0.36, font:"bold 120px sans-serif"}); l.position.copy(B.pos(x[1][0], x[1][1], 0.44)); l.position.z += cs * 0.33; S.add(l, false); });
    ends[key(s)] = {ci:ci, t:"s", m:sT}; ends[key(e)] = {ci:ci, t:"e", m:eT}; return {s:s, e:e, sT:sT, eT:eT}; });
  S.size = n * cs + 1;
  var ctl = A.ctl('<button class="iqB gold" id="gSpin">🌀 ' + A.L("Putar!", "Spin!") + '</button><span class="mut small" id="gCnt" style="flex-basis:100%;text-align:center"></span>');
  function cnt(){ ctl.querySelector("#gCnt").textContent = A.L("Gasing diletak: ", "Tops placed: ") + Object.keys(tops).length + " / " + need + (G.chains.length > 1 ? A.L(" · dua rantai tidak boleh bersentuh", " · the two chains must not touch") : ""); }
  cnt(); var spinT = {};
  S.onTick = function(dt){ for(var k in spinT){ spinT[k].rotation.y += dt * 18; spinT[k].rotation.z = Math.sin(performance.now() / 120) * 0.05; } };
  S.onPick = function(o){ if(!o || !o.userData.cell || spinning) return; var c = o.userData.cell, k = key(c); if(G.blocks[k] || ends[k]) return;
    if(tops[k]){ S.root.remove(tops[k]); delete tops[k]; } else { if(Object.keys(tops).length >= need){ A.say(A.L("Hanya ", "Only ") + need + A.L(" gasing", " tops")); return; } var t = top(0x8E2B2B); t.position.copy(B.pos(c[0], c[1], 1.4)); S.add(t); tops[k] = t; S.tween(260, function(e){ t.position.y = 1.4 - e * 0.9; }, null, "back"); }
    A.move(); cnt(); };
  ctl.querySelector("#gSpin").onclick = function(){ if(spinning) return; spinning = true; spinT = {}; var all = {}; Object.keys(tops).forEach(function(k){ all[k] = tops[k]; }); Object.keys(ends).forEach(function(k){ all[k] = ends[k].m; });
    var reach = G.chains.map(function(){ return {}; }), maxD = 0, why = "";
    G.chains.forEach(function(ch, ci){ var s = ch[0], seen = reach[ci], q = [[s, 0]]; seen[key(s)] = 0; setTimeout(function(){ spinT[key(s)] = all[key(s)]; }, 0);
      while(q.length){ var it = q.shift(); DD.forEach(function(d){ var r = [it[0][0] + d[0], it[0][1] + d[1]], k = key(r); if(all[k] && seen[k] == null){ seen[k] = it[1] + 1; maxD = Math.max(maxD, it[1] + 1); q.push([r, it[1] + 1]); (function(kk, dd){ setTimeout(function(){ spinT[kk] = all[kk]; }, dd * 260); })(k, it[1] + 1); } }); } });
    var placed = Object.keys(tops), deg = function(k){ var p = k.split(",").map(Number); return DD.filter(function(d){ return all[key([p[0] + d[0], p[1] + d[1]])]; }).length; };
    G.chains.forEach(function(ch, ci){ var e = key(ch[ch.length - 1]); if(reach[ci][e] == null && !why) why = A.L("Putaran terhenti sebelum E", "The spin stopped before E") + (G.chains.length > 1 ? ci + 1 : "") + "."; G.chains.forEach(function(ch2, cj){ if(cj !== ci && reach[ci][key(ch2[0])] != null && !why) why = A.L("Dua rantai bersentuh.", "The two chains touch."); }); });
    if(!why && placed.length !== need) why = A.L("Guna tepat ", "Use exactly ") + need + A.L(" gasing.", " tops.");
    if(!why && !placed.every(function(k){ return deg(k) === 2; })) why = A.L("Rantai mesti satu barisan, tanpa cabang atau sentuhan.", "Each chain must be one line, with no branches or touching.");
    if(!why && !placed.every(function(k){ return reach.some(function(r){ return r[k] != null; }); })) why = A.L("Ada gasing yang tidak berputar.", "Some tops didn't spin.");
    if(!why && G.cps.length){ var dd = G.cps.map(function(c){ return reach[0][key(c)]; }); if(dd.some(function(v){ return v == null || !tops[key(G.cps[0])] && false; }) || dd.some(function(v){ return v == null; })) why = A.L("Rantai mesti melalui petak emas.", "The chain must pass the gold squares."); else if(dd.length > 1 && !dd.every(function(v, i){ return !i || v > dd[i - 1]; })) why = A.L("Petak emas mesti dilalui mengikut urutan 1, 2, 3.", "The gold squares must be passed in order 1, 2, 3."); }
    setTimeout(function(){ if(!why) A.win(); else { A.say(why, 2800); setTimeout(function(){ spinT = {}; spinning = false; Object.keys(all).forEach(function(k){ all[k].rotation.set(0, 0, 0); }); }, 1800); } }, maxD * 260 + 700); };
  return {par:need, hint:function(){ var miss = []; G.chains.forEach(function(p){ p.slice(1, -1).forEach(function(c){ if(!tops[key(c)]) miss.push(c); }); }); if(!miss.length) return A.L("Buang gasing yang tidak di laluan", "Remove tops that are off the route"); var c = miss[0]; return A.L("Satu laluan melalui lajur ", "One route goes through column ") + (c[0] + 1) + A.L(", baris ", ", row ") + (c[1] + 1); }}; }});
})();
