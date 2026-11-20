/* My Ihsan 0.5.70: chess rules engine + robot. Board: 64 squares, index = r*8+f, r 0 = rank 8 (black's back rank), f 0 = file a.
   Pieces: "PNBRQK" white, "pnbrqk" black, null empty. Full rules: castling, en passant, promotion, check, checkmate, stalemate,
   50-move rule, threefold repetition, insufficient material. Robot: negamax alpha-beta with quiescence (levels 1-3). */
window.ChessEngine = (function(){
var VAL = {p:100, n:320, b:330, r:500, q:900, k:0};
var PST = { // from white's view, index r*8+f (r 0 = rank 8)
 p:[0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
 n:[-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
 b:[-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
 r:[0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
 q:[-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
 k:[-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20]};
var FILES = "abcdefgh";
function isW(p){ return p && p === p.toUpperCase(); }
function col(p){ return p ? (isW(p) ? "w" : "b") : null; }
function name(sq){ return FILES[sq&7] + (8 - (sq>>3)); }
function Game(){ this.reset(); }
Game.prototype.reset = function(){
  var b = new Array(64).fill(null), back = "rnbqkbnr";
  for(var f=0; f<8; f++){ b[f] = back[f]; b[8+f] = "p"; b[48+f] = "P"; b[56+f] = back[f].toUpperCase(); }
  this.b = b; this.turn = "w"; this.cast = {K:true, Q:true, k:true, q:true}; this.ep = -1; this.half = 0; this.full = 1;
  this.hist = []; this.keys = {}; this.keys[this.key()] = 1; this.san = [];
};
Game.prototype.key = function(){ return this.b.map(function(p){ return p || "."; }).join("") + this.turn + (this.cast.K?"K":"") + (this.cast.Q?"Q":"") + (this.cast.k?"k":"") + (this.cast.q?"q":"") + this.ep; };
Game.prototype.attacked = function(sq, by){ var b = this.b, r = sq>>3, f = sq&7, i, rr, ff, p;
  // pawns
  var pr = by === "w" ? r+1 : r-1, pp = by === "w" ? "P" : "p";
  if(pr >= 0 && pr < 8){ if(f > 0 && b[pr*8+f-1] === pp) return true; if(f < 7 && b[pr*8+f+1] === pp) return true; }
  var N = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]], kn = by === "w" ? "N" : "n";
  for(i=0; i<8; i++){ rr = r+N[i][0]; ff = f+N[i][1]; if(rr>=0 && rr<8 && ff>=0 && ff<8 && b[rr*8+ff] === kn) return true; }
  var K = by === "w" ? "K" : "k";
  for(rr=r-1; rr<=r+1; rr++) for(ff=f-1; ff<=f+1; ff++){ if((rr!==r || ff!==f) && rr>=0 && rr<8 && ff>=0 && ff<8 && b[rr*8+ff] === K) return true; }
  var D = [[1,0,"rq"],[-1,0,"rq"],[0,1,"rq"],[0,-1,"rq"],[1,1,"bq"],[1,-1,"bq"],[-1,1,"bq"],[-1,-1,"bq"]];
  for(i=0; i<8; i++){ rr = r+D[i][0]; ff = f+D[i][1];
    while(rr>=0 && rr<8 && ff>=0 && ff<8){ p = b[rr*8+ff]; if(p){ if(col(p) === by && D[i][2].indexOf(p.toLowerCase()) >= 0) return true; break; } rr += D[i][0]; ff += D[i][1]; } }
  return false; };
Game.prototype.kingSq = function(c){ var k = c === "w" ? "K" : "k"; return this.b.indexOf(k); };
Game.prototype.inCheck = function(c){ c = c || this.turn; return this.attacked(this.kingSq(c), c === "w" ? "b" : "w"); };
Game.prototype.pseudo = function(c){ var b = this.b, out = [], self = this, them = c === "w" ? "b" : "w";
  var add = function(from, to, flag){ var p = b[from], m = {from:from, to:to, p:p, cap:b[to], flag:flag||""};
    if(p.toLowerCase() === "p" && ((to>>3) === 0 || (to>>3) === 7)){ ["q","r","b","n"].forEach(function(x){ var m2 = Object.assign({}, m); m2.promo = c === "w" ? x.toUpperCase() : x; out.push(m2); }); return; }
    out.push(m); };
  for(var sq=0; sq<64; sq++){ var p = b[sq]; if(!p || col(p) !== c) continue; var t = p.toLowerCase(), r = sq>>3, f = sq&7, i, rr, ff, to;
    if(t === "p"){ var dir = c === "w" ? -1 : 1, start = c === "w" ? 6 : 1; rr = r+dir;
      if(rr>=0 && rr<8 && !b[rr*8+f]){ add(sq, rr*8+f); if(r === start && !b[(r+2*dir)*8+f]) add(sq, (r+2*dir)*8+f, "double"); }
      [-1, 1].forEach(function(df){ var ff2 = f+df; if(ff2<0 || ff2>7 || rr<0 || rr>7) return; var t2 = rr*8+ff2;
        if(b[t2] && col(b[t2]) === them) add(sq, t2); else if(t2 === self.ep) add(sq, t2, "ep"); });
    } else if(t === "n" || t === "k"){ var L = t === "n" ? [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] : [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
      for(i=0; i<8; i++){ rr = r+L[i][0]; ff = f+L[i][1]; if(rr<0 || rr>7 || ff<0 || ff>7) continue; to = rr*8+ff; if(!b[to] || col(b[to]) === them) add(sq, to); }
      if(t === "k"){ var home = c === "w" ? 60 : 4, ks = c === "w" ? "K" : "k", qs = c === "w" ? "Q" : "q", R = c === "w" ? "R" : "r";
        if(sq === home && !this.attacked(home, them)){
          if(this.cast[ks] && !b[home+1] && !b[home+2] && b[home+3] === R && !this.attacked(home+1, them) && !this.attacked(home+2, them)) add(home, home+2, "castle");
          if(this.cast[qs] && !b[home-1] && !b[home-2] && !b[home-3] && b[home-4] === R && !this.attacked(home-1, them) && !this.attacked(home-2, them)) add(home, home-2, "castle"); } }
    } else { var D = t === "b" ? [[1,1],[1,-1],[-1,1],[-1,-1]] : t === "r" ? [[1,0],[-1,0],[0,1],[0,-1]] : [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
      for(i=0; i<D.length; i++){ rr = r+D[i][0]; ff = f+D[i][1]; while(rr>=0 && rr<8 && ff>=0 && ff<8){ to = rr*8+ff; if(b[to]){ if(col(b[to]) === them) add(sq, to); break; } add(sq, to); rr += D[i][0]; ff += D[i][1]; } } } }
  return out; };
Game.prototype.make = function(m){ var b = this.b, u = {m:m, cast:Object.assign({}, this.cast), ep:this.ep, half:this.half, full:this.full, epCap:null};
  var p = m.p, c = col(p);
  b[m.to] = m.promo || p; b[m.from] = null;
  if(m.flag === "ep"){ var cs = m.to + (c === "w" ? 8 : -8); u.epCap = cs; b[cs] = null; }
  if(m.flag === "castle"){ if(m.to > m.from){ b[m.to-1] = b[m.to+1]; b[m.to+1] = null; } else { b[m.to+1] = b[m.to-2]; b[m.to-2] = null; } }
  if(p === "K"){ this.cast.K = this.cast.Q = false; } if(p === "k"){ this.cast.k = this.cast.q = false; }
  [[63,"K"],[56,"Q"],[7,"k"],[0,"q"]].forEach(function(x){ if(m.from === x[0] || m.to === x[0]) this.cast[x[1]] = false; }, this);
  this.ep = m.flag === "double" ? (m.from + m.to)/2 : -1;
  this.half = (p.toLowerCase() === "p" || m.cap || m.flag === "ep") ? 0 : this.half+1;
  if(c === "b") this.full++; this.turn = c === "w" ? "b" : "w"; return u; };
Game.prototype.unmake = function(u){ var b = this.b, m = u.m;
  b[m.from] = m.p; b[m.to] = m.cap || null;
  if(m.flag === "ep"){ b[u.epCap] = col(m.p) === "w" ? "p" : "P"; }
  if(m.flag === "castle"){ if(m.to > m.from){ b[m.to+1] = b[m.to-1]; b[m.to-1] = null; } else { b[m.to-2] = b[m.to+1]; b[m.to+1] = null; } }
  this.cast = u.cast; this.ep = u.ep; this.half = u.half; this.full = u.full; this.turn = col(m.p); };
Game.prototype.legal = function(c){ c = c || this.turn; var out = [], ms = this.pseudo(c);
  for(var i=0; i<ms.length; i++){ var u = this.make(ms[i]); if(!this.attacked(this.kingSq(c), c === "w" ? "b" : "w")) out.push(ms[i]); this.unmake(u); }
  return out; };
Game.prototype.sanOf = function(m, legal){ if(m.flag === "castle") return m.to > m.from ? "O-O" : "O-O-O";
  var t = m.p.toLowerCase(), s = "";
  if(t !== "p"){ s = m.p.toUpperCase(); var amb = legal.filter(function(x){ return x !== m && x.p === m.p && x.to === m.to && x.from !== m.from; });
    if(amb.length){ var sf = amb.some(function(x){ return (x.from&7) === (m.from&7); }), sr = amb.some(function(x){ return (x.from>>3) === (m.from>>3); });
      s += !sf ? FILES[m.from&7] : !sr ? (8-(m.from>>3)) : name(m.from); } }
  if(m.cap || m.flag === "ep"){ if(t === "p") s += FILES[m.from&7]; s += "x"; }
  s += name(m.to); if(m.promo) s += "=" + m.promo.toUpperCase(); return s; };
// play a legal move for real (records history, SAN, repetition)
Game.prototype.play = function(m){ var legal = this.legal(), mm = legal.filter(function(x){ return x.from === m.from && x.to === m.to && (!x.promo || !m.promo || x.promo.toLowerCase() === m.promo.toLowerCase()); });
  if(!mm.length) return null; var mv = mm.filter(function(x){ return !x.promo || x.promo.toLowerCase() === (m.promo||"q").toLowerCase(); })[0] || mm[0];
  var san = this.sanOf(mv, legal), u = this.make(mv); this.hist.push(u);
  var k = this.key(); this.keys[k] = (this.keys[k]||0)+1;
  var st = this.status(); san += st.mate ? "#" : this.inCheck() ? "+" : ""; this.san.push(san); mv.san = san; return mv; };
Game.prototype.undo = function(){ if(!this.hist.length) return null; var k = this.key(); this.keys[k]--; if(!this.keys[k]) delete this.keys[k]; var u = this.hist.pop(); this.unmake(u); this.san.pop(); return u.m; };
Game.prototype.insufficient = function(){ var ps = this.b.filter(function(p){ return p && p.toLowerCase() !== "k"; });
  if(!ps.length) return true; if(ps.length === 1 && "nb".indexOf(ps[0].toLowerCase()) >= 0) return true;
  if(ps.every(function(p){ return p.toLowerCase() === "b"; })){ var self = this, sq = []; this.b.forEach(function(p, i){ if(p && p.toLowerCase() === "b") sq.push(((i>>3)+(i&7))%2); }); return sq.every(function(x){ return x === sq[0]; }); }
  return false; };
Game.prototype.status = function(){ var lg = this.legal(), ch = this.inCheck();
  if(!lg.length) return ch ? {over:true, mate:true, win:this.turn === "w" ? "b" : "w", why:"mate"} : {over:true, draw:true, why:"stalemate"};
  if(this.half >= 100) return {over:true, draw:true, why:"fifty"};
  if((this.keys[this.key()]||0) >= 3) return {over:true, draw:true, why:"threefold"};
  if(this.insufficient()) return {over:true, draw:true, why:"material"};
  return {over:false, check:ch}; };
// ---------- robot ----------
Game.prototype.evaluate = function(){ var s = 0, b = this.b;
  for(var i=0; i<64; i++){ var p = b[i]; if(!p) continue; var t = p.toLowerCase(); if(isW(p)) s += VAL[t] + PST[t][i]; else s -= VAL[t] + PST[t][(7-(i>>3))*8+(i&7)]; }
  return this.turn === "w" ? s : -s; };
function order(ms){ return ms.sort(function(a, b){ return ((b.cap ? VAL[b.cap.toLowerCase()]*10 - VAL[b.p.toLowerCase()] : 0) + (b.promo ? 800 : 0)) - ((a.cap ? VAL[a.cap.toLowerCase()]*10 - VAL[a.p.toLowerCase()] : 0) + (a.promo ? 800 : 0)); }); }
Game.prototype.quies = function(alpha, beta, d){ var sp = this.evaluate(); if(sp >= beta) return beta; if(sp > alpha) alpha = sp; if(d <= 0) return alpha;
  var c = this.turn, ms = order(this.pseudo(c).filter(function(m){ return m.cap || m.promo; }));
  for(var i=0; i<ms.length; i++){ var u = this.make(ms[i]); if(this.attacked(this.kingSq(c), c === "w" ? "b" : "w")){ this.unmake(u); continue; } var sc = -this.quies(-beta, -alpha, d-1); this.unmake(u);
    if(sc >= beta) return beta; if(sc > alpha) alpha = sc; }
  return alpha; };
Game.prototype.search = function(depth, alpha, beta, ply, q){ if(depth <= 0) return q ? this.quies(alpha, beta, 4) : this.evaluate();
  var c = this.turn, ms = order(this.pseudo(c)), any = false;
  for(var i=0; i<ms.length; i++){ var u = this.make(ms[i]); if(this.attacked(this.kingSq(c), c === "w" ? "b" : "w")){ this.unmake(u); continue; } any = true;
    var sc = -this.search(depth-1, -beta, -alpha, ply+1, q); this.unmake(u); if(sc >= beta) return beta; if(sc > alpha) alpha = sc; }
  if(!any) return this.inCheck(c) ? -100000 + ply : 0;
  return alpha; };
Game.prototype.best = function(level){ var ms = order(this.legal()), best = null, bs = -Infinity, depth = level >= 3 ? 4 : level === 2 ? 2 : 1, q = level >= 2;
  if(!ms.length) return null; if(level <= 1 && Math.random() < 0.25) return ms[Math.floor(Math.random()*ms.length)];
  for(var i=0; i<ms.length; i++){ var u = this.make(ms[i]); var sc = -this.search(depth-1, -Infinity, -bs === Infinity ? Infinity : -bs, 1, q); this.unmake(u);
    if(level <= 1) sc += Math.random()*60 - 30; if(sc > bs){ bs = sc; best = ms[i]; } }
  best.score = bs; return best; };
return {Game:Game, name:name, col:col};
})();
