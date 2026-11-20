/* IQ 4 · Gelongsor Zellige (sliding tiles): tap a tile in line with the gap to slide; order them ١٢٣… Level 3 is a zellige star cut into tiles. */
(function(){ var T = THREE, IQ = window.IQ;
function picTex(){ return IQ.canvasTex("zpic", 512, 512, function(g, w){ var gr = g.createRadialGradient(w / 2, w / 2, 20, w / 2, w / 2, w * 0.7); gr.addColorStop(0, "#2AA198"); gr.addColorStop(1, "#0f3a6e"); g.fillStyle = gr; g.fillRect(0, 0, w, w);
  var star = function(r, k, rot, f, s){ g.beginPath(); for(var j = 0; j < 16; j++){ var a = Math.PI * j / 8 + rot, q = j % 2 ? r * k : r; g.lineTo(w / 2 + Math.cos(a) * q, w / 2 + Math.sin(a) * q); } g.closePath(); if(f){ g.fillStyle = f; g.fill(); } if(s){ g.strokeStyle = s; g.lineWidth = 8; g.stroke(); } };
  star(240, 0.72, 0, "#1F5FA8", "#E4D3B5"); star(170, 0.7, Math.PI / 8, "#D4A544", "#7a5a20"); star(110, 0.66, 0, "#8E2B2B", "#E4D3B5"); star(55, 0.6, Math.PI / 8, "#E4D3B5", null);
  for(var i = 0; i < 16; i++){ var a = i * Math.PI / 8; g.fillStyle = i % 2 ? "#E4D3B5" : "#D4A544"; g.beginPath(); g.arc(w / 2 + Math.cos(a) * 205, w / 2 + Math.sin(a) * 205, 10, 0, 7); g.fill(); } }); }
IQ.def("zellige", {build:function(S, lv, A){ var n = [3, 4, 4, 5, 5, 6][lv], pic = lv === 2 || lv >= 4, nums = lv < 4, cs = n > 4 ? 1.0 : 1.25, B = IQ.tray(S, n, n, cs, {tiles:false}), board = [], tiles = {}, R = IQ.rnd(Date.now() % 99991 + 3);
  var geo = new T.BoxGeometry(cs * 0.95, 0.3, cs * 0.95), side = IQ.mat.glaze(0x123a6a), pt = pic ? picTex() : null;
  for(var i = 1; i < n * n; i++){ var x = (i - 1) % n, z = ((i - 1) / n) | 0, top;
    if(pic){ var t = pt.clone(); t.needsUpdate = true; t.repeat.set(1 / n, 1 / n); t.offset.set(x / n, 1 - (z + 1) / n); top = new T.MeshPhysicalMaterial({map:t, roughness:0.25, clearcoat:0.8}); }
    else top = IQ.mat.glaze(0xffffff, {map:IQ.starTex("zt" + (i % 2), i % 2 ? "#3a86d6" : "#2fb8ac", "rgba(255,245,225,.45)", "rgba(240,190,80,.75)")});
    var m = new T.Mesh(geo, [side, side, top, side, side, side]); m.userData = {p:1, v:i};
    if(nums){ var lb = IQ.label(IQ.ar(i), {fg:pic ? "rgba(255,255,255,.85)" : "#F4E9CF", s:pic ? 0.38 : 0.9 * cs / 1.25, font:"bold " + (pic ? 120 : 160) + "px 'AmiriL', serif"}); lb.position.set(pic ? -cs * 0.3 : 0, 0.16, pic ? -cs * 0.3 : 0); m.add(lb); }
    tiles[i] = m; S.add(m); }
  for(i = 0; i < n * n; i++) board.push(i < n * n - 1 ? i + 1 : 0);
  function gap(){ return board.indexOf(0); }
  function nb(g){ var x = g % n, z = (g / n) | 0, o = []; if(x > 0) o.push(g - 1); if(x < n - 1) o.push(g + 1); if(z > 0) o.push(g - n); if(z < n - 1) o.push(g + n); return o; }
  var last = -1, steps = [60, 160, 160, 80, 100, 140][lv]; for(var s = 0; s < steps; s++){ var gp = gap(), ns = nb(gp).filter(function(k){ return k !== last; }), k = ns[Math.floor(R() * ns.length)]; board[gp] = board[k]; board[k] = 0; last = gp; }
  if(solved()){ var g0 = gap(), k0 = nb(g0)[0]; board[g0] = board[k0]; board[k0] = 0; }
  function place(anim){ board.forEach(function(v, i){ if(!v) return; var to = B.pos(i % n, (i / n) | 0, 0.45), m = tiles[v]; if(anim){ var fr = m.position.clone(); S.tween(170, function(e){ m.position.lerpVectors(fr, to, e); }, null, "out"); } else m.position.copy(to); }); }
  function solved(){ for(var i = 0; i < n * n - 1; i++) if(board[i] !== i + 1) return false; return true; }
  place(false);
  S.onPick = function(o){ if(!o || !o.userData.v || S.busy()) return; var i = board.indexOf(o.userData.v), g = gap(), xi = i % n, zi = (i / n) | 0, xg = g % n, zg = (g / n) | 0, step;
    if(xi === xg) step = zi < zg ? n : -n; else if(zi === zg) step = xi < xg ? 1 : -1; else return;
    for(var k = g; k !== i; k -= step){ board[k] = board[k - step]; } board[i] = 0; A.move(); place(true); if(solved()){ setTimeout(function(){ A.win(); }, 200); } };
  if(!nums) A.say(A.L("Tiada nombor: susun mengikut gambar bintang", "No numbers: rebuild the star picture"), 2600);
  return {par:lv >= 3 ? steps : null, hint:function(){ for(var i = 0; i < n * n - 1; i++) if(board[i] !== i + 1){ return A.L("Petak ", "Spot ") + (i + 1) + A.L(" perlukan jubin ", " needs tile ") + IQ.ar(i + 1) + " (" + (i + 1) + ")" + A.L(". Selesaikan baris atas dahulu.", ". Finish the top row first."); } return ""; }}; }});
})();
