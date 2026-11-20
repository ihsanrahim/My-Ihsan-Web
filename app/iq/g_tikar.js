/* IQ 7 · Tikar Mengkuang (peg solitaire): tap a seed, then the empty hole two steps away; the seed jumped over is removed. Leave one seed in the centre. */
(function(){ var T = THREE, IQ = window.IQ;
var FR = false;   // French (37-hole) board for level 5
function inB(x, y){ if(x < 0 || y < 0 || x > 6 || y > 6) return false; if(FR && (x === 1 || x === 5) && (y === 1 || y === 5)) return true; return !((x < 2 || x > 4) && (y < 2 || y > 4)); }
var DIR = [[1,0],[-1,0],[0,1],[0,-1]];
function gen(k, R, fin){ fin = fin || "3,3"; for(var t = 0; t < 3000; t++){ var b = {}; b[fin] = 1; var seq = [], ok = true;
  for(var s = 0; s < k; s++){ var opts = []; Object.keys(b).forEach(function(kk){ var p = kk.split(",").map(Number); DIR.forEach(function(d){ var a = [p[0] + d[0], p[1] + d[1]], c = [p[0] + 2 * d[0], p[1] + 2 * d[1]]; if(inB(a[0], a[1]) && inB(c[0], c[1]) && !b[a] && !b[c]) opts.push([p, a, c]); }); });
    if(!opts.length){ ok = false; break; } var o = opts[Math.floor(R() * opts.length)]; delete b[o[0]]; b[o[1]] = 1; b[o[2]] = 1; seq.push(o); }   // reverse jump: the peg goes back over, the middle one returns
  if(ok) return b; } return null; }
var FIN = "3,3";
function solve(b, n){ var memo = {}; function rec(b, n){ if(n === 1) return b[FIN] ? [] : null; var k = Object.keys(b).sort().join("|"); if(memo[k]) return null;
    for(var kk in b){ var p = kk.split(",").map(Number); for(var i = 0; i < 4; i++){ var d = DIR[i], a = [p[0] + d[0], p[1] + d[1]], c = [p[0] + 2 * d[0], p[1] + 2 * d[1]]; if(b[a] && inB(c[0], c[1]) && !b[c]){ var nb = Object.assign({}, b); delete nb[kk]; delete nb[a]; nb[c] = 1; var r = rec(nb, n - 1); if(r) return [[p, c]].concat(r); } } }
    memo[k] = 1; return null; } return rec(b, n); }
IQ.def("tikar", {build:function(S, lv, A){ var R = IQ.rnd(Date.now() % 54321 + 5), b = {}, cs = 0.86, pegs = {}; FR = lv === 4; FIN = "3,3";
  if(lv === 5){ var opts = ["3,1","1,3","5,3","3,5","3,0","0,3","2,3","3,2"]; FIN = opts[Math.floor(R() * opts.length)]; }
  if(lv >= 3){ b = null; for(var tk = lv === 3 ? 27 : 28; !b && tk > 16; tk--) b = gen(tk, R, FIN); } else if(lv === 2){ for(var y = 0; y < 7; y++) for(var x = 0; x < 7; x++) if(inB(x, y) && !(x === 3 && y === 3)) b[x + "," + y] = 1; } else b = gen(lv ? 13 : 6, R);
  var mat = IQ.canvasTex("tikar", 512, 512, function(g, w){ g.fillStyle = "#c9a46a"; g.fillRect(0, 0, w, w); var s = 32; for(var y = 0; y < w; y += s) for(var x = 0; x < w; x += s){ var o = ((x + y) / s) % 2; g.fillStyle = o ? "#d8b67c" : "#b88f55"; g.fillRect(x + 2, y + 2, s - 4, s - 4);
      g.fillStyle = "rgba(0,0,0,.12)"; for(var k = 0; k < 4; k++) o ? g.fillRect(x + 2, y + 4 + k * 7, s - 4, 1.5) : g.fillRect(x + 4 + k * 7, y + 2, 1.5, s - 4); }
    g.strokeStyle = "#7a1426"; g.lineWidth = 10; g.strokeRect(16, 16, w - 32, w - 32); g.strokeStyle = "#1F5FA8"; g.lineWidth = 4; g.strokeRect(34, 34, w - 68, w - 68); });
  var mat2 = new T.Mesh(new T.BoxGeometry(7 * cs + 0.8, 0.12, 7 * cs + 0.8), new T.MeshStandardMaterial({map:mat, roughness:0.85})); mat2.position.y = 0.06; S.add(mat2);
  var pos = function(x, y, h){ return new T.Vector3((x - 3) * cs, h == null ? 0.12 : h, (y - 3) * cs); };
  var hole = new T.CylinderGeometry(0.22, 0.22, 0.04, 20), holeM = IQ.mat.plain(0x3a2310, 0.9), seedG = new T.SphereGeometry(0.27, 24, 18), seedM = new T.MeshPhysicalMaterial({color:0x8a5a2a, roughness:0.25, clearcoat:0.9, sheen:0.5}), hit = new T.CylinderGeometry(0.4, 0.4, 0.3, 8), inv = new T.MeshBasicMaterial({visible:false});
  for(y = 0; y < 7; y++) for(x = 0; x < 7; x++) if(inB(x, y)){ var h = new T.Mesh(hole, (x + "," + y) === FIN ? IQ.mat.glow(IQ.C.gold, 0.9) : holeM); h.position.copy(pos(x, y, 0.13)); S.add(h); var hz = new T.Mesh(hit, inv); hz.position.copy(pos(x, y, 0.2)); hz.userData = {p:1, cell:[x, y]}; S.add(hz, false); }
  Object.keys(b).forEach(function(kk){ var p = kk.split(",").map(Number), m = new T.Mesh(seedG, seedM); m.scale.set(1, 0.8, 1); m.position.copy(pos(p[0], p[1], 0.32)); m.userData = {p:1, cell:p}; S.add(m); pegs[kk] = m; });
  S.size = 7 * cs + 1.5; var sel = null, mark = new T.Mesh(new T.TorusGeometry(0.32, 0.04, 8, 28), IQ.mat.glow(IQ.C.teal, 1.2)); mark.rotation.x = Math.PI / 2; mark.visible = false; S.add(mark, false);
  function left(){ return Object.keys(pegs).length; }
  function stuck(){ for(var kk in pegs){ var p = kk.split(",").map(Number); for(var i = 0; i < 4; i++){ var d = DIR[i]; if(pegs[(p[0] + d[0]) + "," + (p[1] + d[1])] && inB(p[0] + 2 * d[0], p[1] + 2 * d[1]) && !pegs[(p[0] + 2 * d[0]) + "," + (p[1] + 2 * d[1])]) return false; } } return true; }
  S.onPick = function(o){ if(!o || !o.userData.cell || S.busy()) return; var c = o.userData.cell, kk = c.join(",");
    if(pegs[kk]){ sel = c; mark.visible = true; mark.position.copy(pos(c[0], c[1], 0.16)); return; }
    if(!sel) return; var dx = c[0] - sel[0], dy = c[1] - sel[1]; if(!((Math.abs(dx) === 2 && dy === 0) || (Math.abs(dy) === 2 && dx === 0))){ A.say(A.L("Lompat dua petak, atas satu biji", "Jump two spaces, over one seed")); return; }
    var mid = [sel[0] + dx / 2, sel[1] + dy / 2]; if(!pegs[mid.join(",")]){ A.say(A.L("Mesti ada biji untuk dilompati", "There must be a seed to jump over")); return; }
    var m = pegs[sel.join(",")], gone = pegs[mid.join(",")]; delete pegs[sel.join(",")]; delete pegs[mid.join(",")]; pegs[kk] = m; m.userData.cell = c; mark.visible = false; sel = null; A.move();
    S.hop(m, pos(c[0], c[1], 0.32), 0.9, 360); S.tween(360, function(e){ gone.scale.setScalar(1 - e); gone.position.y = 0.32 + e * 0.6; }, function(){ S.root.remove(gone); });
    setTimeout(function(){ if(left() === 1 && pegs[FIN]) A.win(); else if(left() === 1) A.say(A.L("Satu biji tinggal, tetapi bukan di lubang emas", "One seed left, but not on the gold hole"), 3000); else if(stuck()) A.say(A.L("Tiada langkah lagi. Tekan ⟲ untuk cuba lagi.", "No moves left. Press ⟲ to try again."), 3000); }, 400); };
  if(FIN !== "3,3") A.say(A.L("Tahap ini: biji terakhir mesti di lubang emas", "This level: the last seed must end on the gold hole"), 2600); else if(FR) A.say(A.L("Papan Perancis, 37 lubang", "French board, 37 holes"), 2200);
  return {par:Object.keys(b).length - 1, hint:function(){ var n = left(); if(n > 16) return A.L("Mulakan dari tepi dan kosongkan lengan salib dahulu, simpan pusat untuk akhir.", "Work from the edges and clear the arms of the cross first; keep the centre for last.");
    var b2 = {}; Object.keys(pegs).forEach(function(k){ b2[k] = 1; }); var s = solve(b2, n); if(!s) return A.L("Kedudukan ini tidak boleh selesai. Tekan ⟲.", "This position can't be solved. Press ⟲."); var f = s[0]; return A.L("Lompat biji di lajur ", "Jump the seed at column ") + (f[0][0] + 1) + A.L(", baris ", ", row ") + (f[0][1] + 1) + A.L(" ke lajur ", " to column ") + (f[1][0] + 1) + A.L(", baris ", ", row ") + (f[1][1] + 1); }}; }});
})();
