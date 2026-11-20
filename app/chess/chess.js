/* My Ihsan 0.5.70: Science › 3D chess. Robot (3 levels) or 2 players, play white or black, clocks, undo, draw offer, resign, flip,
   move list, captured pieces, saved game. Themes: "classic" (wooden board, glossy ivory & ebony set, oak table in a library) and
   "malay" (Sultan, Permaisuri, Bendahara, Laksamana, Hulubalang and Pesilat pawns, a finishing move for each, on a gelanggang in a kampung).
   Orbit / zoom / pan / ⟲ / ⛶ come from IB3D in app.js. Storage: ihsan_chess {set, saved}. */
window.ChessView = (function(){
var H = null, T = null, en = false, E = null, root = null, G = null, S3 = null, raf = 0, st = null, sel = -1, busy = false, clk = null, over = null, anims = [], tmr = 0;
function L(a, b){ return en ? b : a; }
function esc(s){ return H.esc(s == null ? "" : String(s)); }
var DEF = {mode:"ai", level:2, side:"w", time:"10+0", theme:"classic", view2p:"default"};
function cfg(){ var c = H.load("ihsan_chess", {}) || {}; c.set = Object.assign({}, DEF, c.set||{}); return c; }
function saveCfg(c){ H.save("ihsan_chess", c); }
var NM = {classic:{k:["Raja","King"], q:["Menteri","Queen"], b:["Gajah","Bishop"], n:["Kuda","Knight"], r:["Tir","Rook"], p:["Bidak","Pawn"]},
          malay:{k:["Sultan","Sultan"], q:["Permaisuri","Permaisuri (Queen)"], b:["Bendahara","Bendahara (Bishop)"], n:["Hulubalang","Hulubalang (Knight)"], r:["Laksamana","Laksamana (Rook)"], p:["Pesilat","Pesilat (Pawn)"]}};
var FIN = {k:["Tikaman keris diraja","Royal keris thrust"], q:["Pusaran selendang","Selendang whirl"], b:["Titah Bendahara","The Bendahara's decree"], n:["Lompatan kuda perang","War-horse leap"], r:["Serbuan perahu Laksamana","The Laksamana's boat charge"], p:["Tendangan silat","Silat kick"]};

// ---------------- setup screen ----------------
function setupHtml(c){ var s = c.set, seg = function(k, list){ return '<div class="chSeg">'+list.map(function(x){ return '<button class="chip g3d'+(String(s[k])===String(x[0])?' on':'')+'" data-cs="'+k+'|'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>'; };
  return '<div class="card chSet"><h3>♟️ '+L("Catur 3D","3D chess")+'</h3>'+
    '<div class="chL">'+L("Lawan","Opponent")+'</div>'+seg("mode", [["ai","🤖 "+L("Robot","Robot")],["2p","👥 "+L("2 pemain","2 players")]])+
    (s.mode==="ai" ? '<div class="chL">'+L("Tahap robot","Robot level")+'</div>'+seg("level", [[1,"1 · "+L("Mudah","Easy")],[2,"2 · "+L("Sederhana","Medium")],[3,"3 · "+L("Sukar","Hard")]])+
      '<div class="chL">'+L("Saya main","I play")+'</div>'+seg("side", [["w","⚪ "+L("Putih","White")],["b","⚫ "+L("Hitam","Black")],["r","🔀 "+L("Rawak","Random")]]) :
      '<div class="chL">📱 '+L("Pandangan 2 pemain","2-player view")+'</div>'+seg("view2p", [["default",L("Biasa","Default")],["rotate","🔄 "+L("Pusing 180° ikut giliran","Turn 180° each move")],["tilt","↕️ "+L("Telefon rata: hitam baca dari atas","Phone flat: black reads from the top")],["plan","🗺 "+L("Pelan atas, tidak bergerak","Top plan view, no moving")]])+
      '<div class="mut tiny" style="margin:4px 0">'+({"default":L("Papan tetap dari sisi putih. Butang Pusing papan bila perlu.","The board stays on white's side; use Flip board when needed."), rotate:L("Kamera berpusing ke sisi pemain yang akan bergerak.","The camera swings round to the player whose turn it is."), tilt:L("Letak telefon rata di antara pemain. Giliran hitam, papan terbalik supaya hitam di hujung atas telefon membacanya dengan betul.","Lay the phone flat between you. On black's turn the view turns upside down so black, at the top end of the phone, reads it the right way up."), plan:L("Pandangan atas yang rata dan tetap, seperti papan sebenar.","A flat, fixed top-down view, like a real board.")}[s.view2p||"default"])+'</div>')+
    '<div class="chL">⏱ '+L("Masa (minit + saat setiap langkah)","Clock (minutes + seconds per move)")+'</div>'+seg("time", [["none",L("Tiada","None")],["3+2","3+2"],["5+0","5+0"],["10+0","10+0"],["15+10","15+10"],["30+0","30+0"]])+
    '<div class="chL">🎨 '+L("Tema","Theme")+'</div>'+seg("theme", [["classic","📚 "+L("Klasik: perpustakaan","Classic: library")],["malay","👑 "+L("Istana Melayu: kampung","Malay court: kampung")]])+
    '<div class="mut tiny" style="margin:6px 0">'+(s.theme==="malay" ? L("Sultan (raja), Permaisuri (menteri), Bendahara (gajah), Hulubalang (kuda), Laksamana (tir) dan Pesilat (bidak). Setiap buah ada gerakan penamat apabila menangkap.","Sultan (king), Permaisuri (queen), Bendahara (bishop), Hulubalang (knight), Laksamana (rook) and Pesilat (pawns). Each piece has a finishing move when it captures.") : L("Papan kayu, buah gading dan kayu hitam berkilat di atas meja oak dalam perpustakaan.","A wooden board with glossy ivory and ebony pieces on an oak table in a library."))+'</div>'+
    '<button class="btn gold full g3d" id="chStart">▶ '+L("Mula permainan baharu","Start a new game")+'</button>'+(c.saved ? '<button class="btn alt full g3d" id="chResume" style="margin-top:8px">↩ '+L("Sambung permainan tersimpan","Resume the saved game")+'</button>' : '')+
    '</div><div class="card mut small">'+L("Peraturan penuh: istana (castling), en passant, kenaikan pangkat, sah/mat, buntu, peraturan 50 langkah, ulangan tiga kali dan bahan tidak cukup. Seret untuk pusing, cubit untuk zum, dua jari untuk anjak, ⟲ untuk asal, ⛶ untuk skrin penuh.","Full rules: castling, en passant, promotion, check and mate, stalemate, the 50-move rule, threefold repetition and insufficient material. Drag to turn, pinch to zoom, two fingers to pan, ⟲ to reset, ⛶ for full screen.")+'</div>'; }
function render(el, helpers){ H = helpers; T = window.THREE; en = !!H.en(); E = window.ChessEngine; stop(); root = el; var c = cfg();
  el.innerHTML = setupHtml(c);
  el.querySelectorAll("[data-cs]").forEach(function(b){ b.onclick = function(){ var p = b.getAttribute("data-cs").split("|"), c2 = cfg(); c2.set[p[0]] = p[0]==="level" ? +p[1] : p[1]; saveCfg(c2); render(el, H); }; });
  el.querySelector("#chStart").onclick = function(){ var c2 = cfg(); c2.saved = null; saveCfg(c2); start(c2.set, null); };
  var rs = el.querySelector("#chResume"); if(rs) rs.onclick = function(){ var c2 = cfg(); start(c2.saved.set, c2.saved); };
}

// ---------------- game ----------------
function tc(t){ if(t==="none") return null; var p = t.split("+"); return {base:+p[0]*60000, inc:+p[1]*1000}; }
function start(set, saved){ G = new E.Game(); var side = set.side==="r" ? (Math.random()<0.5 ? "w" : "b") : set.side;
  st = {set:set, side:set.mode==="ai" ? side : "w", tc:tc(set.time), caps:{w:[], b:[]}}; over = null; sel = -1; anims = [];
  clk = st.tc ? {w:st.tc.base, b:st.tc.base, last:0, run:false} : null;
  if(saved && saved.moves){ st.side = saved.side; saved.moves.forEach(function(m){ var mv = G.play(m); if(mv && (mv.cap || mv.flag==="ep")) st.caps[E.col(mv.p)].push(mv.flag==="ep" ? (E.col(mv.p)==="w" ? "p" : "P") : mv.cap); }); if(clk && saved.clk){ clk.w = saved.clk.w; clk.b = saved.clk.b; } }
  draw(); build3d(); sync3d(); if(set.mode==="ai" && G.turn!==st.side) setTimeout(robot, 600); }
function persist(){ var c = cfg(); c.saved = over ? null : {set:st.set, side:st.side, moves:G.hist.map(function(u){ return {from:u.m.from, to:u.m.to, promo:u.m.promo}; }), clk:clk ? {w:clk.w, b:clk.b} : null}; saveCfg(c); }
function ask(t, yes){ var ov = H.showSheet("♟️", '<div style="margin:4px 0 12px;font-weight:600">'+esc(t)+'</div><div class="btns"><button class="btn alt g3d" id="chNo">'+L("Tidak","No")+'</button><button class="btn gold g3d" id="chYes">'+L("Ya","Yes")+'</button></div>');
  ov.querySelector("#chNo").onclick = function(){ H.closeOverlay(); }; ov.querySelector("#chYes").onclick = function(){ H.closeOverlay(); yes(); }; }
function fmtT(ms){ ms = Math.max(0, ms); var s = Math.ceil(ms/1000), m = Math.floor(s/60); return m+":"+("0"+(s%60)).slice(-2); }
function nmOf(p){ var t = p.toLowerCase(); return L(NM[st.set.theme][t][0], NM[st.set.theme][t][1]); }
function draw(){ var el = root; if(!el) return; var s = st.set, flipTxt = L("Pusing papan","Flip board");
  el.innerHTML = '<div class="chTop"><button class="chip" id="chBack">‹ '+L("Tetapan","Setup")+'</button><b>♟️ '+(s.mode==="ai" ? "🤖 "+L("Robot tahap ","Robot level ")+s.level : "👥 "+L("2 pemain","2 players"))+'</b><span class="chip" id="chTurn"></span></div>'+
    '<div class="ch3d" id="ch3d"><div class="chClk chClkT" id="chCT"></div><div class="chClk chClkB" id="chCB"></div><div class="chMsg hidden" id="chMsg"></div></div>'+
    '<div class="chCap" id="chCap"></div>'+
    '<div class="chBtns"><button class="btn alt g3d" id="chUndo">↶ '+L("Undur","Undo")+'</button><button class="btn alt g3d" id="chDraw">🤝 '+L("Seri?","Draw?")+'</button><button class="btn alt g3d" id="chResign">🏳 '+L("Menyerah","Resign")+'</button><button class="btn alt g3d" id="chFlip">🔄 '+flipTxt+'</button></div>'+
    '<div class="card chMoves"><h3>📜 '+L("Langkah","Moves")+'</h3><div id="chList" class="chList"></div></div>'+
    '<button class="btn gold full g3d" id="chNew" style="margin-bottom:12px">＋ '+L("Permainan baharu","New game")+'</button>';
  var q = function(x){ return el.querySelector(x); };
  q("#chBack").onclick = function(){ persist(); render(root, H); };
  q("#chNew").onclick = function(){ var c = cfg(); c.saved = null; saveCfg(c); start(st.set, null); };
  q("#chUndo").onclick = function(){ if(busy || anims.length) return; if(st.set.mode==="2p" && (st.set.view2p==="rotate" || st.set.view2p==="tilt")) setTimeout(function(){ camHome(true); }, 60); var n = st.set.mode==="ai" ? (G.turn===st.side ? 2 : 1) : 1; if(over){ over = null; }
    for(var i=0; i<n; i++){ var m = G.undo(); if(!m) break; if(m.cap || m.flag==="ep"){ st.caps[E.col(m.p)].pop(); } } sel = -1; persist(); sync3d(); ui(); };
  q("#chDraw").onclick = function(){ if(over) return; if(st.set.mode==="2p"){ var who = G.turn==="w" ? L("Hitam","Black") : L("Putih","White"); ask(who+": "+L("terima tawaran seri?","accept the draw offer?"), function(){ finish({draw:true, why:"agreed"}); }); return; }
    var ev = G.evaluate()*(G.turn===st.side ? -1 : 1); if(ev < -150 || G.full > 60) finish({draw:true, why:"agreed"}); else H.toast(L("Robot menolak tawaran seri","The robot declines the draw")); };
  q("#chResign").onclick = function(){ if(over) return; ask(L("Menyerah kalah?","Resign this game?"), function(){ var loser = st.set.mode==="ai" ? st.side : G.turn; finish({win:loser==="w" ? "b" : "w", why:"resign"}); }); };
  q("#chFlip").onclick = function(){ st.flip = !st.flip; camHome(true); ui(); if(S3 && S3.malay && !anims.length) sync3d(); };
  ui(); }
function ui(){ if(!root) return; var q = function(x){ return root.querySelector(x); }; if(!q("#chList")) return;
  var rows = []; for(var i=0; i<G.san.length; i+=2) rows.push('<span class="chN">'+(i/2+1)+'.</span><span>'+esc(G.san[i])+'</span><span>'+esc(G.san[i+1]||"")+'</span>');
  q("#chList").innerHTML = rows.join("") || '<span class="mut small">'+L("Belum ada langkah","No moves yet")+'</span>'; q("#chList").scrollTop = 99999;
  var stt = G.status(); q("#chTurn").textContent = over ? "🏁" : (G.turn==="w" ? "⚪ " : "⚫ ")+(stt.check ? L("Sah!","Check!") : L("Giliran","to move"));
  var sym = function(p){ return {k:"♚", q:"♛", r:"♜", b:"♝", n:"♞", p:"♟"}[p.toLowerCase()]; };
  q("#chCap").innerHTML = '<span>⚪ '+st.caps.w.map(sym).join("")+'</span><span>⚫ '+st.caps.b.map(sym).join("")+'</span>';
  var bottom = viewSide(), top = bottom==="w" ? "b" : "w";
  var cl = function(c){ return (c==="w" ? "⚪ " : "⚫ ")+(st.set.mode==="ai" ? (c===st.side ? L("Anda","You") : "🤖") : (c==="w" ? L("Putih","White") : L("Hitam","Black")))+(clk ? " · "+fmtT(clk[c]) : ""); };
  q("#chCT").textContent = cl(top); q("#chCB").textContent = cl(bottom); q("#chCT").classList.toggle("on", G.turn===top && !over); q("#chCB").classList.toggle("on", G.turn===bottom && !over);
  var msg = q("#chMsg"); if(over){ msg.classList.remove("hidden"); msg.innerHTML = '<b>'+over.t+'</b><small>'+over.s+'</small>'; } else msg.classList.add("hidden"); }
function viewSide(){ var s = st.set.mode==="ai" ? st.side : (st.set.view2p==="rotate" && G ? G.turn : "w"); return st.flip ? (s==="w" ? "b" : "w") : s; }
function finish(r){ var W = function(c){ return c==="w" ? L("Putih menang","White wins") : L("Hitam menang","Black wins"); };
  var why = {mate:L("Mat","Checkmate"), resign:L("Menyerah","Resignation"), time:L("Masa tamat","Time ran out"), stalemate:L("Buntu (stalemate)","Stalemate"), fifty:L("Peraturan 50 langkah","50-move rule"), threefold:L("Ulangan tiga kali","Threefold repetition"), material:L("Bahan tidak cukup untuk mat","Not enough material to mate"), agreed:L("Dipersetujui","Agreed")}[r.why]||"";
  over = {t:r.draw ? "🤝 "+L("Seri","Draw") : "🏆 "+W(r.win), s:why}; if(st.set.mode==="ai" && r.win){ var s = H.load("ihsan_chess_stats", {w:0, l:0, d:0}); if(r.win===st.side) s.w++; else s.l++; H.save("ihsan_chess_stats", s); } else if(st.set.mode==="ai" && r.draw){ var s2 = H.load("ihsan_chess_stats", {w:0, l:0, d:0}); s2.d++; H.save("ihsan_chess_stats", s2); }
  persist(); ui(); }
function afterMove(mv){ if(clk){ var c = E.col(mv.p); if(clk.run) clk[c] += st.tc.inc; clk.run = true; clk.last = performance.now(); }
  if(mv.cap || mv.flag==="ep") st.caps[E.col(mv.p)].push(mv.flag==="ep" ? (E.col(mv.p)==="w" ? "p" : "P") : mv.cap);
  var s = G.status(); if(s.over) finish(s); persist(); ui();
  if(!over && st.set.mode==="2p" && (st.set.view2p==="rotate" || st.set.view2p==="tilt")) setTimeout(function(){ camHome(true); }, 520);
  if(!over && st.set.mode==="ai" && G.turn!==st.side) setTimeout(robot, 350); }
function robot(){ if(over || !G || G.turn===st.side || st.set.mode!=="ai") return; if(anims.length){ setTimeout(robot, 200); return; } busy = true;
  setTimeout(function(){ var m = G.best(st.set.level); busy = false; if(!m || over) return; doMove(m); }, 60); }
function doMove(m){ var mv = G.play(m); if(!mv) return; sel = -1; animMove(mv, function(){ sync3d(); }); afterMove(mv); }
function tryMove(from, to){ var lg = G.legal().filter(function(m){ return m.from===from && m.to===to; }); if(!lg.length) return false;
  if(lg[0].promo){ var ov = H.showSheet("⭐ "+L("Naik pangkat","Promote"), '<div class="chPromo">'+["q","r","b","n"].map(function(x){ return '<button class="btn alt g3d" data-pr="'+x+'">'+{q:"♛",r:"♜",b:"♝",n:"♞"}[x]+' '+esc(nmOf(x))+'</button>'; }).join("")+'</div>');
    ov.querySelectorAll("[data-pr]").forEach(function(b){ b.onclick = function(){ H.closeOverlay(); doMove({from:from, to:to, promo:b.getAttribute("data-pr")}); }; }); return true; }
  doMove({from:from, to:to}); return true; }

// ---------------- 3D ----------------
function M(c, o){ return new T.MeshStandardMaterial(Object.assign({color:c, roughness:0.5, metalness:0.05}, o||{})); }
function P(c, o){ return new T.MeshPhysicalMaterial(Object.assign({color:c, roughness:0.22, metalness:0.0, clearcoat:1, clearcoatRoughness:0.08}, o||{})); }
function mk(g, m, x, y, z){ var k = new T.Mesh(g, m); k.position.set(x||0, y||0, z||0); k.castShadow = true; k.receiveShadow = true; return k; }
function woodTex(a, b, seed){ var c = document.createElement("canvas"); c.width = 256; c.height = 256; var g = c.getContext("2d"); g.fillStyle = a; g.fillRect(0, 0, 256, 256);
  var r = seed||7; var rnd = function(){ r = (r*16807)%2147483647; return r/2147483647; };
  for(var i=0; i<70; i++){ g.strokeStyle = b; g.globalAlpha = 0.08+rnd()*0.18; g.lineWidth = 1+rnd()*3; g.beginPath(); var y = rnd()*256; g.moveTo(0, y); for(var x=0; x<=256; x+=16) g.lineTo(x, y+Math.sin(x*0.03+i)*4+rnd()*2); g.stroke(); }
  var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; return t; }
function sqPos(sq){ return new T.Vector3((sq&7)-3.5, 0, (sq>>3)-3.5); }
// classic Staunton-like pieces from lathe profiles
function lathe(pts, mat){ return mk(new T.LatheGeometry(pts.map(function(p){ return new T.Vector2(p[0], p[1]); }), 40), mat); }
var BASE = [[0,0],[0.36,0],[0.37,0.06],[0.33,0.1],[0.3,0.14],[0.24,0.17]];
function classicPiece(t, mat){ var g = new T.Group(), add = function(m){ g.add(m); return m; };
  if(t==="p"){ add(lathe(BASE.concat([[0.16,0.24],[0.12,0.42],[0.17,0.46],[0.11,0.5],[0,0.5]]), mat)); add(mk(new T.SphereGeometry(0.14, 24, 16), mat, 0, 0.6, 0)); }
  else if(t==="r"){ add(lathe(BASE.concat([[0.22,0.22],[0.2,0.62],[0.27,0.66],[0.27,0.82],[0,0.82]]), mat)); for(var i=0;i<4;i++){ var a = i*Math.PI/2+Math.PI/4, cr = add(mk(new T.BoxGeometry(0.12, 0.1, 0.1), mat, Math.cos(a)*0.2, 0.87, Math.sin(a)*0.2)); cr.rotation.y = -a; } }
  else if(t==="n"){ add(lathe(BASE.concat([[0.24,0.22],[0.2,0.32],[0,0.32]]), mat)); var nk = add(mk(new T.BoxGeometry(0.22, 0.42, 0.3), mat, 0, 0.5, 0.02)); nk.rotation.x = -0.25;
    var hd = add(mk(new T.BoxGeometry(0.2, 0.18, 0.4), mat, 0, 0.72, -0.12)); hd.rotation.x = 0.35; add(mk(new T.ConeGeometry(0.05, 0.12, 8), mat, -0.06, 0.88, 0.06)); add(mk(new T.ConeGeometry(0.05, 0.12, 8), mat, 0.06, 0.88, 0.06)); add(mk(new T.BoxGeometry(0.06, 0.3, 0.08), mat, 0, 0.62, 0.17)); }
  else if(t==="b"){ add(lathe(BASE.concat([[0.17,0.24],[0.11,0.6],[0.18,0.64],[0.1,0.68],[0.15,0.74],[0.15,0.86],[0.08,0.98],[0,1.0]]), mat)); add(mk(new T.SphereGeometry(0.045, 12, 8), mat, 0, 1.03, 0)); var sl = add(mk(new T.BoxGeometry(0.02, 0.14, 0.32), M("#111"), 0.04, 0.86, 0)); sl.rotation.z = 0.6; }
  else if(t==="q"){ add(lathe(BASE.concat([[0.19,0.24],[0.12,0.74],[0.2,0.78],[0.12,0.82],[0.2,0.98],[0.22,1.04],[0,1.02]]), mat)); for(var j=0;j<8;j++){ var b2 = j/8*Math.PI*2; add(mk(new T.SphereGeometry(0.04, 10, 8), mat, Math.cos(b2)*0.19, 1.07, Math.sin(b2)*0.19)); } add(mk(new T.SphereGeometry(0.07, 14, 10), mat, 0, 1.1, 0)); }
  else if(t==="k"){ add(lathe(BASE.concat([[0.2,0.24],[0.13,0.8],[0.21,0.84],[0.13,0.88],[0.2,1.05],[0.18,1.1],[0,1.1]]), mat)); // 0.5.71 (owner): a crescent on the king instead of a cross
    add(mk(new T.CylinderGeometry(0.025, 0.025, 0.08, 10), mat, 0, 1.13, 0)); var cres = add(mk(new T.TorusGeometry(0.1, 0.028, 10, 28, Math.PI*1.35), mat, 0, 1.27, 0)); cres.rotation.z = Math.PI*0.5+Math.PI*0.175; }
  return g; }
// Malay court figures
function malayPiece(t, side){ var g = new T.Group(), W = side==="w", baju = M(W ? "#f2e6c8" : "#1f2a44", {roughness:0.6}), acc = M(W ? "#d4af37" : "#c9ced6", {metalness:0.7, roughness:0.3}),
    sampin = M(W ? "#b8862b" : "#5a2a6e", {roughness:0.55}), skin = M("#c68e5e", {roughness:0.65}), dark = M("#2a1a10"), add = function(m){ g.add(m); return m; };
  add(mk(new T.CylinderGeometry(0.34, 0.37, 0.08, 32), M(W ? "#e9dcc0" : "#141a2c", {roughness:0.35}), 0, 0.04, 0));
  // 0.5.79 (owner): every figure wears a simple baju Melayu (long tunic, trousers) with a sampin; headwear tells them apart:
  // Sultan a large tengkolok, Permaisuri a tudung, Bendahara / Laksamana / Pesilat three different tanjak, every pawn a songkok.
  var seluar = M(W ? "#efe2c2" : "#1b2540", {roughness:0.65}), black = M("#121212", {roughness:0.5}), kain = M(W ? "#c9a227" : "#6b3a8a", {roughness:0.5});
  var person = function(h, y0, wide){ var p = new T.Group(); p.position.y = y0||0.08; g.add(p); var bw = wide||0.2;
    p.add(mk(new T.CylinderGeometry(0.065, 0.07, h*0.34, 10), seluar, -0.06, h*0.17, 0)); p.add(mk(new T.CylinderGeometry(0.065, 0.07, h*0.34, 10), seluar, 0.06, h*0.17, 0)); // seluar
    p.add(mk(new T.CylinderGeometry(bw*0.72, bw*0.95, h*0.46, 18), baju, 0, h*0.6, 0)); // baju Melayu (long tunic)
    p.add(mk(new T.CylinderGeometry(bw*0.98, bw*1.05, h*0.2, 18), sampin, 0, h*0.43, 0)); // sampin round the hips
    p.add(mk(new T.CylinderGeometry(bw*0.99, bw*0.99, h*0.025, 18), acc, 0, h*0.53, 0)); // sampin edge
    p.add(mk(new T.CylinderGeometry(0.03, 0.035, h*0.06, 10), baju, 0, h*0.835, 0)); // collar (cekak musang)
    var ar1 = mk(new T.CapsuleGeometry(0.045, h*0.3, 4, 8), baju, -bw*0.88, h*0.62, 0), ar2 = mk(new T.CapsuleGeometry(0.045, h*0.3, 4, 8), baju, bw*0.88, h*0.62, 0); ar1.rotation.z = 0.12; ar2.rotation.z = -0.12; p.add(ar1); p.add(ar2);
    var hr = h*0.11, hy = h*0.95; p.add(mk(new T.SphereGeometry(hr, 20, 14), skin, 0, hy, 0)); var eye = M("#1a1008"); [-1, 1].forEach(function(sx){ p.add(mk(new T.SphereGeometry(h*0.016, 8, 6), eye, sx*h*0.04, hy+h*0.015, hr*0.92)); });
    p.userData = {h:h, hr:hr, hy:hy}; return p; };
  // headwear, placed on a person p
  var songkok = function(p){ var s = mk(new T.CylinderGeometry(p.userData.hr*1.02, p.userData.hr*1.05, p.userData.hr*0.85, 24), black, 0, p.userData.hy+p.userData.hr*0.62, 0); s.scale.z = 0.86; p.add(s); };
  var band = function(p, mat, k){ var r = p.userData.hr, b = mk(new T.CylinderGeometry(r*1.06, r*1.1, r*(k||0.55), 20), mat, 0, p.userData.hy+r*0.55, 0); p.add(b); return r; };
  var tanjak = function(p, style){ var r = band(p, kain), y = p.userData.hy+r*0.8, tip;
    if(style===1){ tip = mk(new T.ConeGeometry(r*0.55, r*1.5, 4), kain, -r*0.35, y+r*0.6, r*0.25); tip.rotation.set(0.15, 0.6, 0.25); p.add(tip); } // tall upright point (Dendam Tak Sudah)
    else if(style===2){ tip = mk(new T.ConeGeometry(r*0.5, r*1.6, 4), kain, 0, y+r*0.35, -r*0.5); tip.rotation.set(-1.0, 0, 0); p.add(tip); } // point swept back (Helang Menyongsong Angin)
    else { [-1, 1].forEach(function(sx){ var w2 = mk(new T.ConeGeometry(r*0.42, r*1.2, 4), kain, sx*r*0.7, y+r*0.25, 0); w2.rotation.z = -sx*1.0; p.add(w2); }); } // two side folds (Ayam Patah Kepak)
    p.add(mk(new T.CylinderGeometry(r*1.11, r*1.11, r*0.08, 20), acc, 0, p.userData.hy+r*0.3, 0)); };
  var tengkolok = function(p){ var r = band(p, kain, 0.8), y = p.userData.hy+r*1.0;
    var top = mk(new T.BoxGeometry(r*2.5, r*1.3, r*0.35), kain, r*0.25, y+r*0.55, -r*0.1); top.rotation.set(0, 0, -0.3); p.add(top); // large folded crest
    var fold = mk(new T.ConeGeometry(r*0.6, r*1.4, 4), kain, -r*0.85, y+r*0.5, 0); fold.rotation.z = 0.7; p.add(fold);
    p.add(mk(new T.CylinderGeometry(r*1.12, r*1.12, r*0.12, 20), acc, 0, p.userData.hy+r*0.3, 0)); p.add(mk(new T.SphereGeometry(r*0.2, 10, 8), acc, 0, p.userData.hy+r*0.75, r*1.05)); }; // gold edge and a brooch
  var tudung = function(p){ var r = p.userData.hr, hy = p.userData.hy, tm = M(W ? "#f7f1e3" : "#2c3a66", {roughness:0.6});
    var cap = mk(new T.SphereGeometry(r*1.14, 22, 16, 0, Math.PI*2, 0, Math.PI*0.55), tm, 0, hy+r*0.05, -r*0.06); p.add(cap); // over the head
    var back = mk(new T.SphereGeometry(r*1.12, 22, 16, Math.PI*0.75, Math.PI*1.5, 0, Math.PI), tm, 0, hy, -r*0.05); p.add(back); // round the back and sides, the face open
    p.add(mk(new T.CylinderGeometry(r*1.0, r*2.1, r*1.7, 22, 1, true), tm, 0, hy-r*1.45, 0)); }; // falls over the shoulders
  if(t==="p"){ songkok(person(0.62)); }
  else if(t==="b"){ tanjak(person(0.92), 1); }
  else if(t==="q"){ tudung(person(1.0, 0.08, 0.24)); }
  else if(t==="k"){ tengkolok(person(1.12, 0.08, 0.25)); }
  else if(t==="r"){ var hull = mk(new T.CylinderGeometry(0.28, 0.28, 0.6, 20, 1, false, 0, Math.PI), M(W ? "#8a5a2c" : "#3a2412", {roughness:0.6}), 0, 0.2, 0); hull.rotation.set(Math.PI, 0, Math.PI/2); g.add(hull); // perahu
    tanjak(person(0.85, 0.22), 3); }
  else if(t==="n"){ var horse = new T.Group(); horse.position.y = 0.08; g.add(horse); var hc = M(W ? "#d9c3a0" : "#3b2a20", {roughness:0.55});
    var body = mk(new T.CapsuleGeometry(0.12, 0.28, 6, 12), hc, 0, 0.38, 0); body.rotation.x = Math.PI/2; horse.add(body);
    [[-0.08,-0.13],[0.08,-0.13],[-0.08,0.13],[0.08,0.13]].forEach(function(l){ horse.add(mk(new T.CylinderGeometry(0.03, 0.025, 0.3, 8), hc, l[0], 0.16, l[1])); });
    var neck = mk(new T.CylinderGeometry(0.06, 0.08, 0.26, 10), hc, 0, 0.54, 0.2); neck.rotation.x = 0.6; horse.add(neck); var hh = mk(new T.BoxGeometry(0.09, 0.09, 0.2), hc, 0, 0.66, 0.3); hh.rotation.x = -0.4; horse.add(hh);
    tanjak(person(0.55, 0.42, 0.16), 2); }
  g.userData.malay = true; return g; }
function build3d(){ var box = root.querySelector("#ch3d"); if(!box || !T) return; var w = box.clientWidth || 360, h = Math.round(Math.min(window.innerHeight*0.62, Math.max(300, w*1.0)));
  box.style.height = h+"px"; var r = new T.WebGLRenderer({antialias:true}); r.setPixelRatio(Math.min(2, window.devicePixelRatio||1)); r.setSize(w, h); r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
  r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.0; box.insertBefore(r.domElement, box.firstChild);
  var sc = new T.Scene(), cam = new T.PerspectiveCamera(40, w/h, 0.1, 300), malay = st.set.theme==="malay";
  S3 = {r:r, sc:sc, cam:cam, pieces:{}, sq:[], hl:[], malay:malay}; camHome();
  // lights
  sc.add(new T.HemisphereLight(malay ? 0xdff3ff : 0xfff0dc, malay ? 0x6b8f3a : 0x5a3a24, malay ? 0.9 : 1.05));
  if(!malay){ r.toneMappingExposure = 1.18; [[0, 7, 9, 0.9], [0, 7, -9, 0.9], [-9, 5, 0, 0.45]].forEach(function(l){ var d = new T.DirectionalLight(0xfff4e4, l[3]); d.position.set(l[0], l[1], l[2]); sc.add(d); }); }   // 0.6.37 (owner): classic was too dark; rim lights from both ends outline the black pieces
  var sun = new T.DirectionalLight(malay ? 0xfff4dd : 0xffe2b0, malay ? 2.4 : 2.5); sun.position.set(malay ? 8 : 4, 14, malay ? 6 : 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  var c2 = sun.shadow.camera; c2.left = -8; c2.right = 8; c2.top = 8; c2.bottom = -8; c2.near = 1; c2.far = 40; sun.shadow.bias = -0.0006; sc.add(sun);
  // board
  var light = malay ? M("#e9d8a6", {roughness:0.95}) : P("#e6c895", {map:woodTex("#e6c895", "#b98a4e", 3), roughness:0.3, clearcoat:0.7});
  var darkM = malay ? M("#5f8a34", {roughness:1}) : P("#a06a3c", {map:woodTex("#a06a3c", "#6a3e1c", 9), roughness:0.3, clearcoat:0.7});
  for(var i=0; i<64; i++){ var light2 = (((i>>3)+(i&7))%2)===0; var sq = mk(new T.BoxGeometry(1, 0.1, 1), light2 ? light : darkM, (i&7)-3.5, -0.05, (i>>3)-3.5); sq.castShadow = false; sq.userData.sq = i; sc.add(sq); S3.sq.push(sq); }
  var frameM = malay ? M("#8a6a44", {roughness:0.9}) : P("#4a2612", {map:woodTex("#4a2612", "#200c04", 5), roughness:0.35, clearcoat:0.8});
  [[0, -4.35, 9.4, 0.7],[0, 4.35, 9.4, 0.7],[-4.35, 0, 0.7, 8],[4.35, 0, 0.7, 8]].forEach(function(f){ sc.add(mk(new T.BoxGeometry(f[2], 0.22, f[3]), frameM, f[0], -0.04, f[1])); });
  // file and rank letters on the frame
  for(var k=0; k<8; k++){ ["abcdefgh"[k], String(8-k)].forEach(function(t, n){ var cv = document.createElement("canvas"); cv.width = cv.height = 64; var g = cv.getContext("2d"); g.fillStyle = malay ? "#fff6dc" : "#e8cfa0"; g.font = "bold 40px serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, 32, 34);
    var pl = new T.Mesh(new T.PlaneGeometry(0.34, 0.34), new T.MeshBasicMaterial({map:new T.CanvasTexture(cv), transparent:true})); pl.rotation.x = -Math.PI/2; if(n===0) pl.position.set(k-3.5, 0.08, 4.35); else pl.position.set(-4.35, 0.08, k-3.5); sc.add(pl); }); }
  if(malay) kampung(sc); else library(sc);
  // highlight markers
  var hm = new T.MeshBasicMaterial({color:0xffd56b, transparent:true, opacity:0.55, depthWrite:false});
  S3.hlm = hm; S3.dot = new T.MeshBasicMaterial({color:0x3fb27f, transparent:true, opacity:0.75, depthWrite:false}); S3.chk = new T.MeshBasicMaterial({color:0xe5484d, transparent:true, opacity:0.6, depthWrite:false});
  // picking
  var ray = new T.Raycaster(), nd = new T.Vector2();
  r.domElement.addEventListener("click", function(e){ if(over || busy || anims.length) return; if(st.set.mode==="ai" && G.turn!==st.side) return;
    var b = r.domElement.getBoundingClientRect(); nd.set((e.clientX-b.left)/b.width*2-1, -(e.clientY-b.top)/b.height*2+1); ray.setFromCamera(nd, cam);
    var objs = S3.sq.slice(); Object.keys(S3.pieces).forEach(function(k2){ objs.push(S3.pieces[k2]); });
    var hit = ray.intersectObjects(objs, true)[0]; if(!hit) return; var o = hit.object; while(o && o.userData.sq==null && o.parent) o = o.parent; var s = o.userData.sq; if(s==null) return; click(s); });
  var t0 = performance.now(), last = t0;
  var loop = function(now){ if(!S3 || !document.body.contains(r.domElement)){ stop(); return; } raf = requestAnimationFrame(loop); var dt = Math.max(0, Math.min(0.05, (now-last)/1000)); last = Math.max(last, now);
    if(anims.length){ var a = anims[0], p = Math.max(0, Math.min(1, (now-a.t0)/a.dur)); a.fn(p); if(p>=1){ anims.shift(); if(a.done) a.done(); if(anims.length) anims[0].t0 = now; } }
    if(clk && clk.run && !over){ var c = G.turn; clk[c] -= (now-clk.last); clk.last = now; if(clk[c] <= 0){ clk[c] = 0; finish({win:c==="w" ? "b" : "w", why:"time"}); } else if(Math.floor(now/250)!==tmr){ tmr = Math.floor(now/250); ui(); } }
    if(S3.camA){ var ca = S3.camA, kk = Math.min(1, (now-ca.t0)/ca.dur); ca.f(kk); if(kk>=1) S3.camA = null; }
    if(S3.idle) S3.idle(Math.max(0, (now-t0)/1000)); r.render(sc, cam); };
  raf = requestAnimationFrame(loop); }
function camTarget(){ var v = st.set.mode==="2p" ? (st.set.view2p||"default") : "default", s = viewSide(), z = s==="w" ? 1 : -1, up = new T.Vector3(0, 1, 0), pos, look;
  if(v==="plan"){ pos = new T.Vector3(0, 15.5, 0.001*(st.flip ? -1 : 1)); look = new T.Vector3(0, 0, 0); up = new T.Vector3(0, 0, st.flip ? 1 : -1); }
  else if(v==="tilt" && G && G.turn==="b" && !st.flip){ pos = new T.Vector3(0, 9.2, -8.6); look = new T.Vector3(0, 0, -0.6); up = new T.Vector3(0, -1, 0); }   // black's view, turned upside down for the player at the top of the phone
  else { pos = new T.Vector3(0, 9.2, 8.6*z); look = new T.Vector3(0, 0, 0.6*z); }
  var tmp = new T.PerspectiveCamera(); tmp.position.copy(pos); tmp.up.copy(up); tmp.lookAt(look); return {pos:pos, q:tmp.quaternion.clone()}; }
function camHome(anim){ if(!S3) return; var t = camTarget(), cam = S3.cam; if(window.IB3D && S3.r) IB3D.reset(S3.r);
  if(!anim){ cam.position.copy(t.pos); cam.quaternion.copy(t.q); S3.camA = null; return; }
  var p0 = cam.position.clone(), q0 = cam.quaternion.clone(), a0 = Math.atan2(p0.x, p0.z), a1 = Math.atan2(t.pos.x, t.pos.z), r0 = Math.hypot(p0.x, p0.z), r1 = Math.hypot(t.pos.x, t.pos.z);
  if(Math.abs(a1 - a0) > Math.PI) a1 += a1 < a0 ? Math.PI*2 : -Math.PI*2; if(Math.abs(Math.abs(a1 - a0) - Math.PI) < 0.01) a1 = a0 + Math.PI;   // swing round the side, not through the board
  S3.camA = {t0:performance.now(), dur:900, f:function(k){ var e = k<0.5 ? 2*k*k : 1-Math.pow(-2*k+2, 2)/2, a = a0 + (a1 - a0)*e, r = r0 + (r1 - r0)*e; cam.position.set(Math.sin(a)*r, p0.y + (t.pos.y - p0.y)*e + Math.sin(e*Math.PI)*1.2, Math.cos(a)*r); cam.quaternion.slerpQuaternions(q0, t.q, e); }}; }
function library(sc){ var oak = P("#8a5a2c", {map:woodTex("#8a5a2c", "#4a2a10", 11), roughness:0.45, clearcoat:0.5});
  sc.background = new T.Color("#3a2818"); sc.fog = new T.Fog("#3a2818", 22, 48);
  sc.add(mk(new T.BoxGeometry(16, 0.5, 12), oak, 0, -0.42, 0)); [[-7.4,-5.4],[7.4,-5.4],[-7.4,5.4],[7.4,5.4]].forEach(function(l){ sc.add(mk(new T.BoxGeometry(0.6, 6, 0.6), oak, l[0], -3.6, l[1])); });
  var edge = mk(new T.BoxGeometry(16.3, 0.18, 12.3), P("#5a3418", {roughness:0.4, clearcoat:0.6}), 0, -0.72, 0); sc.add(edge);
  sc.add(mk(new T.BoxGeometry(40, 0.2, 40), M("#3a1e14", {roughness:1}), 0, -6.7, 0)); var rug = mk(new T.BoxGeometry(18, 0.05, 14), M("#7a1f24", {roughness:1}), 0, -6.58, 0); sc.add(rug);
  // bookshelves behind
  var shelfM = M("#4a2a14", {roughness:0.8}); for(var sx=-2; sx<=2; sx++){ var x0 = sx*4.2; sc.add(mk(new T.BoxGeometry(4, 13, 0.8), shelfM, x0, 0, -12));
    for(var row=0; row<6; row++){ var y = -5.3+row*2.1; sc.add(mk(new T.BoxGeometry(4, 0.12, 1.1), shelfM, x0, y, -11.5)); var bx = x0-1.85;
      while(bx < x0+1.8){ var bw = 0.18+Math.random()*0.2, bh = 1.2+Math.random()*0.6; var bk = mk(new T.BoxGeometry(bw, bh, 0.7), M(["#7a1f24","#1f4a7a","#2f6b3a","#8a6a2c","#4a2a5a","#a8642a","#1d1d1d"][Math.floor(Math.random()*7)], {roughness:0.7}), bx+bw/2, y+0.06+bh/2, -11.4); sc.add(bk); bx += bw+0.02; } } }
  // reading lamp with warm light, and a teacup
  var lampM = P("#c9973a", {metalness:0.8, roughness:0.25}); sc.add(mk(new T.CylinderGeometry(0.5, 0.6, 0.15, 24), lampM, 6.2, -0.1, -3.6)); sc.add(mk(new T.CylinderGeometry(0.06, 0.06, 3, 10), lampM, 6.2, 1.4, -3.6));
  sc.add(mk(new T.ConeGeometry(0.9, 0.8, 24, 1, true), M("#2f6b3a", {side:T.DoubleSide, roughness:0.6}), 6.2, 2.9, -3.6)); var lp = new T.PointLight(0xffc070, 2.2, 18); lp.position.set(6.2, 2.5, -3.6); sc.add(lp);
  sc.add(mk(new T.CylinderGeometry(0.35, 0.28, 0.45, 20), P("#f3ead8"), -6.2, 0.2, 3.4)); sc.add(mk(new T.CylinderGeometry(0.55, 0.55, 0.04, 24), P("#f3ead8"), -6.2, 0.0, 3.4));
  var book = mk(new T.BoxGeometry(1.6, 0.3, 2.1), M("#7a1f24"), -6, 0.1, -3.4); book.rotation.y = 0.3; sc.add(book); }
function kampung(sc){ var cv = document.createElement("canvas"); cv.width = 2; cv.height = 256; var g = cv.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#5aa8e6"); gr.addColorStop(0.7, "#cfe9f5"); gr.addColorStop(1, "#f4e7c3"); g.fillStyle = gr; g.fillRect(0, 0, 2, 256);
  sc.background = new T.CanvasTexture(cv); sc.fog = new T.Fog("#d8ecf2", 26, 70);
  sc.add(mk(new T.CylinderGeometry(60, 60, 0.4, 48), M("#6b9a3a", {roughness:1}), 0, -0.6, 0));
  sc.add(mk(new T.BoxGeometry(10.2, 0.4, 10.2), M("#c9a46a", {roughness:0.95}), 0, -0.32, 0)); // gelanggang (raised ground)
  [[-5.4,-5.4],[5.4,-5.4],[-5.4,5.4],[5.4,5.4]].forEach(function(p){ sc.add(mk(new T.CylinderGeometry(0.12, 0.14, 1.6, 10), M("#6b4221"), p[0], 0.4, p[1])); var fl = mk(new T.SphereGeometry(0.22, 12, 10), M("#ffd56b", {emissive:"#ff9a20", emissiveIntensity:0.6}), p[0], 1.3, p[1]); sc.add(fl); });
  var wood = M("#8a5a2c", {roughness:0.8}), roofM = M("#6b3a1a", {roughness:0.9});
  var house = function(x, z, ry, s){ var hg = new T.Group(); hg.position.set(x, -0.4, z); hg.rotation.y = ry; hg.scale.setScalar(s); sc.add(hg);
    [[-1.6,-1.2],[1.6,-1.2],[-1.6,1.2],[1.6,1.2],[0,-1.2],[0,1.2]].forEach(function(p){ hg.add(mk(new T.CylinderGeometry(0.1, 0.1, 1.4, 8), wood, p[0], 0.7, p[1])); }); // stilts
    hg.add(mk(new T.BoxGeometry(3.6, 1.6, 2.8), M("#c99a5a", {roughness:0.85}), 0, 2.2, 0));
    var roof = new T.Mesh(new T.CylinderGeometry(0.01, 2.6, 1.6, 4, 1), roofM); roof.position.y = 3.8; roof.rotation.y = Math.PI/4; roof.scale.set(1.3, 1, 0.9); roof.castShadow = true; hg.add(roof);
    hg.add(mk(new T.BoxGeometry(0.6, 1, 0.05), M("#5a3418"), 0, 2.0, 1.43)); [-1.1, 1.1].forEach(function(wx){ hg.add(mk(new T.BoxGeometry(0.5, 0.5, 0.05), M("#3a2412"), wx, 2.4, 1.43)); });
    var st2 = mk(new T.BoxGeometry(0.6, 0.1, 1.2), wood, 0, 0.7, 1.9); st2.rotation.x = 0.6; hg.add(st2); };
  house(-11, -12, 0.3, 1.3); house(10, -13, -0.4, 1.2); house(-16, 2, 1.3, 1.1); house(16, 0, -1.4, 1.15);
  var palm = function(x, z, h, lean){ var pg = new T.Group(); pg.position.set(x, -0.4, z); sc.add(pg); var tm = M("#8a6a44", {roughness:0.9}), prev = new T.Vector3(0, 0, 0);
    for(var i=0; i<8; i++){ var t2 = (i+1)/8, p2 = new T.Vector3(Math.sin(t2*1.2)*lean, t2*h, 0), seg = mk(new T.CylinderGeometry(0.16-0.08*t2, 0.18-0.08*t2, prev.distanceTo(p2)+0.05, 8), tm, (prev.x+p2.x)/2, (prev.y+p2.y)/2, 0);
      seg.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), p2.clone().sub(prev).normalize()); /* 0.5.79: upright trunk (lookAt ran before the segment had a parent) */ pg.add(seg); prev = p2; }
    var lf = M("#2f7a2a", {roughness:0.7, side:T.DoubleSide}); for(var k=0; k<8; k++){ var leaf = mk(new T.BoxGeometry(0.4, 0.04, 2.6), lf, prev.x, prev.y, 0); leaf.geometry.translate(0, 0, 1.3); leaf.rotation.set(0.5, k/8*Math.PI*2, 0); pg.add(leaf); }
    for(var c=0; c<3; c++) pg.add(mk(new T.SphereGeometry(0.16, 10, 8), M("#6b4a1a"), prev.x+Math.cos(c*2)*0.2, prev.y-0.25, Math.sin(c*2)*0.2)); return pg; };
  S3.palms = [palm(-8, -7, 7, 1.2), palm(8.5, -6, 8, -1.4), palm(-9, 6, 6.5, 0.9), palm(9.5, 7, 7.5, -1), palm(-14, -9, 8.5, 1.5), palm(14, -10, 7, -0.8), palm(0, -16, 9, 0.6)];
  var hills = M("#4f7a3a", {roughness:1}); [[-25,-35,12],[0,-40,16],[25,-34,13]].forEach(function(h2){ var hl = new T.Mesh(new T.SphereGeometry(h2[2], 24, 12, 0, Math.PI*2, 0, Math.PI/2), hills); hl.position.set(h2[0], -0.5, h2[1]); sc.add(hl); });
  S3.idle = function(t){ S3.palms.forEach(function(p, i){ p.rotation.z = Math.sin(t*0.8+i)*0.02; }); }; }
// 0.5.71 (owner): Kampung figures face forward, towards the player looking at the board
function faceY(side){ return side==="w" ? Math.PI : 0; }   // 0.5.80 (owner): the two armies face each other (white towards black, black towards white), whichever side you view from
function pieceMesh(p){ var t = p.toLowerCase(), side = E.col(p), m;
  if(S3.malay){ m = malayPiece(t, side); m.rotation.y = faceY(side); m.userData.malay = true; m.userData.side = side; }
  else { var mat = side==="w" ? P("#f3ead8", {roughness:0.18}) : P("#2b211b", {roughness:0.16, sheen:1, sheenRoughness:0.35, sheenColor:new T.Color("#c89a6a"), clearcoat:1, clearcoatRoughness:0.05}); m = classicPiece(t, mat); m.scale.setScalar(1.15); if(t==="n") m.rotation.y = side==="w" ? 0 : Math.PI; }
  m.traverse(function(o){ if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; } }); return m; }
function sync3d(){ if(!S3) return; var sc = S3.sc; Object.keys(S3.pieces).forEach(function(k){ sc.remove(S3.pieces[k]); }); S3.pieces = {};
  G.b.forEach(function(p, i){ if(!p) return; var m = pieceMesh(p); m.position.copy(sqPos(i)); m.userData.sq = i; m.userData.p = p; sc.add(m); S3.pieces[i] = m; });
  marks(); }
function marks(){ var sc = S3.sc; S3.hl.forEach(function(m){ sc.remove(m); }); S3.hl = [];
  var add = function(sq, mat, small){ var g = small ? new T.CircleGeometry(0.16, 24) : new T.PlaneGeometry(0.96, 0.96), m = new T.Mesh(g, mat); m.rotation.x = -Math.PI/2; m.position.copy(sqPos(sq)); m.position.y = 0.011; m.userData.sq = sq; sc.add(m); S3.hl.push(m); };
  var lu = G.hist[G.hist.length-1]; if(lu){ add(lu.m.from, S3.hlm); add(lu.m.to, S3.hlm); }
  if(G.inCheck()) add(G.kingSq(G.turn), S3.chk);
  if(sel >= 0){ add(sel, S3.dot); G.legal().filter(function(m){ return m.from===sel; }).forEach(function(m){ add(m.to, S3.dot, true); }); } }
function click(s){ var p = G.b[s];
  if(sel >= 0 && s !== sel){ if(tryMove(sel, s)) return; }
  if(p && E.col(p)===G.turn){ sel = s===sel ? -1 : s; marks(); if(sel>=0 && S3.pieces[sel]){ var pm = S3.pieces[sel], y0 = 0; anims.push({t0:performance.now(), dur:220, fn:function(k){ pm.position.y = Math.sin(k*Math.PI)*0.25; }}); } return; }
  sel = -1; marks(); }
// move + finishing-move animations
function animMove(mv, done){ var pm = S3.pieces[mv.from], victim = mv.flag==="ep" ? S3.pieces[mv.to+(E.col(mv.p)==="w" ? 8 : -8)] : S3.pieces[mv.to]; if(!pm){ done(); return; }
  var a = sqPos(mv.from), b = sqPos(mv.to), t = mv.p.toLowerCase(), now = performance.now(), arc = t==="n" ? 1.4 : 0.25, malay = S3.malay;
  var approach = victim ? 0.62 : 1;
  anims.push({t0:now, dur:t==="n" ? 520 : 420, fn:function(k){ var e = k<0.5 ? 2*k*k : 1-Math.pow(-2*k+2, 2)/2, kk = e*approach; pm.position.lerpVectors(a, b, kk); pm.position.y = Math.sin(kk*Math.PI/Math.max(0.01, approach))*arc*(approach<1 ? 0.6 : 1); }});
  if(victim){ var vp = victim.position.clone(), dir = b.clone().sub(a).setY(0).normalize(), side = new T.Vector3(-dir.z, 0, dir.x);
    var fin = malay ? t : "classic", dur = malay ? 900 : 520;
    anims.push({t0:0, dur:dur, fn:function(k){
      if(fin==="classic"){ pm.position.lerpVectors(a.clone().lerp(b, approach), b, k); victim.rotation.x = k*Math.PI/2*(dir.z>0 ? 1 : -1); victim.rotation.z = -k*Math.PI/2*dir.x; victim.position.copy(vp).addScaledVector(dir, k*0.6); victim.position.y = 0.2*k; victim.scale.setScalar(1-k*0.6); return; }
      var mid = a.clone().lerp(b, approach);
      if(fin==="p"){ // silat: spin and flying kick
        pm.rotation.y += 0.35; pm.position.lerpVectors(mid, b, Math.min(1, k*1.4)); pm.position.y = Math.sin(Math.min(1, k*1.4)*Math.PI)*0.7;
        if(k>0.45){ var j = (k-0.45)/0.55; victim.position.copy(vp).addScaledVector(dir, j*4).addScaledVector(side, j*0.8); victim.position.y = Math.sin(j*Math.PI)*2.2; victim.rotation.x += 0.4; } }
      else if(fin==="n"){ // war-horse leap and stomp
        pm.position.lerpVectors(mid, b, k); pm.position.y = Math.sin(k*Math.PI)*1.8; if(k>0.7){ var j2 = (k-0.7)/0.3; victim.scale.set(1+j2*0.6, Math.max(0.02, 1-j2), 1+j2*0.6); } }
      else if(fin==="b"){ // decree: the victim bows and sinks into the ground
        pm.position.lerpVectors(mid, b, k*0.2); var j3 = k; victim.rotation.x = Math.min(1, j3*2)*0.9*(dir.z>0 ? 1 : -1); victim.position.y = -Math.max(0, j3-0.4)/0.6*1.6; if(k>0.95) pm.position.copy(b); }
      else if(fin==="r"){ // boat charge: rush through, the victim spins off the board
        pm.position.lerpVectors(mid, b, Math.min(1, k*2)); var j4 = Math.max(0, k*2-0.6)/1.4; victim.position.copy(vp).addScaledVector(dir, j4*7); victim.rotation.y += 0.5; victim.position.y = j4*1.2; }
      else if(fin==="q"){ // selendang whirl: the victim spins, shrinks and is gone
        pm.rotation.y += 0.25; pm.position.lerpVectors(mid, b, k*0.3); victim.rotation.y += 0.6; victim.position.y = k*1.4; victim.scale.setScalar(Math.max(0.01, 1-k)); if(k>0.95) pm.position.copy(b); }
      else if(fin==="k"){ // royal keris thrust
        var kr = pm.userData && null; var lunge = k<0.5 ? k*2 : 1; pm.position.lerpVectors(mid, mid.clone().lerp(b, 0.6), lunge); if(k>0.45){ var j5 = (k-0.45)/0.55; victim.rotation.x = -j5*Math.PI/2*(dir.z>0 ? -1 : 1); victim.rotation.z = j5*Math.PI/2*dir.x; victim.position.copy(vp).addScaledVector(dir, j5*0.5); }
        if(k>0.9) pm.position.lerpVectors(mid.clone().lerp(b, 0.6), b, (k-0.9)/0.1); } },
      done:function(){ pm.rotation.y = pm.userData.malay ? faceY(pm.userData.side) : pm.rotation.y; pm.position.copy(b); pm.position.y = 0; }});
    if(malay && (H.toast)) H.toast("⚔️ "+L(FIN[t][0], FIN[t][1])); }
  if(mv.flag==="castle"){ var rf = mv.to>mv.from ? mv.to+1 : mv.to-2, rt = mv.to>mv.from ? mv.to-1 : mv.to+1, rm = S3.pieces[rf], ra = sqPos(rf), rb = sqPos(rt);
    if(rm) anims.push({t0:0, dur:360, fn:function(k){ rm.position.lerpVectors(ra, rb, k); rm.position.y = Math.sin(k*Math.PI)*0.4; }}); }
  anims[anims.length-1].done = (function(prev){ return function(){ if(prev) prev(); done(); }; })(anims[anims.length-1].done);
  if(anims.length && !anims[0].t0) anims[0].t0 = performance.now(); }
function stop(){ cancelAnimationFrame(raf); raf = 0; if(S3){ try{ S3.r.dispose(); S3.r.forceContextLoss(); }catch(e){} } S3 = null; anims = []; }
function leave(){ if(G && st && !over) try{ persist(); }catch(e){} stop(); }
return {render:render, stop:leave, _g:function(){ return G; }, _click:function(s){ click(s); }, _st:function(){ return st; }, _cam:function(){ return S3 && S3.cam; }};
})();
