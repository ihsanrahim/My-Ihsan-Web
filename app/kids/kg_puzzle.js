/* My Ihsan 0.7.93 · Kids › 🧩 Sudoku & Kakuro.
   Sudoku: sizes 4, 6, 8, 9, 12, 16 (boxes 2×2, 2×3, 2×4, 3×3, 3×4, 4×4); easy / medium / hard; numbers, letters, shapes or an icon set (fruit, animals, sky).
   Up to 9×9 the puzzle has exactly one answer (a solver checks each removal); bigger grids are checked by the rules, so any correct filling wins.
   Kakuro: 6×6 or 8×8, every run adds up to its clue with no repeated digit; easy shows some digits. The game in progress is kept (ihsan_kg.sudoku.cur / kakuro.cur). */
(function(){ "use strict";
var KG = window.KG;
var SIZES = [[4, 2, 2], [6, 2, 3], [8, 2, 4], [9, 3, 3], [12, 3, 4], [16, 4, 4]];
var SETS = {num: "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16".split(" "), abc: "A B C D E F G H I J K L M N O P".split(" "), shape: "● ▲ ■ ◆ ★ ♥ ✚ ⬟ ⬢ ☾ ☀ ✿ ♣ ♠ ⬣ ⯃".split(" "),
  fruit: "🍎 🍌 🍇 🍊 🍉 🥭 🍓 🍒 🍐 🍑 🍍 🥝 🍋 🥥 🫐 🍈".split(" "), animal: "🐱 🐦 🐟 🐴 🐪 🐄 🐑 🐐 🦁 🐘 🐰 🐒 🐔 🦆 🐝 🐢".split(" "), sky: "☀️ 🌙 ⭐ ☁️ 🌈 ❄️ 🔥 💧 🌍 🪐 ⚡ 🌸 🍀 🌊 ⛰️ 🌵".split(" ")};
var SETN = [["num","1","Nombor","Numbers"],["abc","A","Huruf","Letters"],["shape","▲","Bentuk","Shapes"],["fruit","🍎","Buah","Fruit"],["animal","🐱","Haiwan","Animals"],["sky","⭐","Langit","Sky"]];
var LVL = [["e","🙂","Mudah","Easy",0.42],["m","😊","Sederhana","Medium",0.55],["h","😎","Sukar","Hard",0.64]];
function rng(){ return Math.random(); }
function shuf(a){ a = a.slice(); for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
// full solution by the base pattern + shuffles (valid for any box shape)
function solution(N, br, bc){ var rows = [], cols = [], i;
  shuf(range(N / br)).forEach(function(b){ shuf(range(br)).forEach(function(r){ rows.push(b * br + r); }); });
  shuf(range(N / bc)).forEach(function(s){ shuf(range(bc)).forEach(function(c){ cols.push(s * bc + c); }); });
  var sym = shuf(range(N)), g = [];
  for(i = 0; i < N; i++){ g.push([]); for(var j = 0; j < N; j++){ var r = rows[i], c = cols[j]; g[i].push(sym[(bc * (r % br) + Math.floor(r / br) + c) % N]); } } return g; }
function range(n){ var a = []; for(var i = 0; i < n; i++) a.push(i); return a; }
function ok(g, N, br, bc, r, c, v){ for(var k = 0; k < N; k++){ if(g[r][k] === v || g[k][c] === v) return false; } var r0 = r - r % br, c0 = c - c % bc; for(var a = 0; a < br; a++) for(var b = 0; b < bc; b++) if(g[r0 + a][c0 + b] === v) return false; return true; }
function count(g, N, br, bc, lim){ var n = 0; (function go(){ if(n >= lim) return; var best = null, bc2 = null;
    for(var r = 0; r < N; r++) for(var c = 0; c < N; c++) if(g[r][c] < 0){ var cand = []; for(var v = 0; v < N; v++) if(ok(g, N, br, bc, r, c, v)) cand.push(v); if(!best || cand.length < best.length){ best = cand; bc2 = [r, c]; } if(!cand.length) return; }
    if(!bc2){ n++; return; } best.forEach(function(v){ if(n >= lim) return; g[bc2[0]][bc2[1]] = v; go(); g[bc2[0]][bc2[1]] = -1; }); })(); return n; }
function puzzle(N, br, bc, frac){ var sol = solution(N, br, bc), g = sol.map(function(r){ return r.slice(); }), cells = shuf(range(N * N)), want = Math.round(N * N * frac), gone = 0, uniq = N <= 9;
  for(var i = 0; i < cells.length && gone < want; i++){ var r = Math.floor(cells[i] / N), c = cells[i] % N, v = g[r][c]; g[r][c] = -1; if(uniq && count(g.map(function(x){ return x.slice(); }), N, br, bc, 2) !== 1) g[r][c] = v; else gone++; }
  return {sol: sol, giv: g}; }
function valid(g, N, br, bc){ for(var r = 0; r < N; r++) for(var c = 0; c < N; c++){ var v = g[r][c]; if(v < 0) return false; g[r][c] = -1; var k = ok(g, N, br, bc, r, c, v); g[r][c] = v; if(!k) return false; } return true; }
KG.sudoku = {solution: solution, puzzle: puzzle, count: count, valid: valid, SIZES: SIZES};

KG.reg.sudoku = {hub: "num", o: 1, ic: "🔢", ms: "Sudoku", en: "Sudoku", dms: "Saiz, tahap, simbol", den: "Size, level, symbols", run: function(host, ctx){
  var st = ctx.get("sudoku"), sz = st.sz || 4, lv = st.lv || "e", set = st.set || "num", sel = null, t0 = Date.now(), tick = null;
  var fresh = function(){ var S = SIZES.filter(function(x){ return x[0] === sz; })[0], P = puzzle(S[0], S[1], S[2], LVL.filter(function(x){ return x[0] === lv; })[0][4] * (S[0] <= 6 ? 1.05 : 1)); st.cur = {n: S[0], br: S[1], bc: S[2], giv: P.giv, sol: P.sol, val: P.giv.map(function(r){ return r.slice(); }), lv: lv, set: set, t: 0, h: 0}; ctx.put("sudoku", st); t0 = Date.now(); };
  if(!st.cur) fresh();
  var draw = function(){ var G = st.cur, N = G.n, sym = SETS[G.set] || SETS.num, emo = G.set === "fruit" || G.set === "animal" || G.set === "sky";
    host.innerHTML = '<div class="kgSet"><div class="chips">' + SIZES.map(function(x){ return '<button class="chip' + (x[0] === sz ? " on" : "") + '" data-sz="' + x[0] + '">' + x[0] + '×' + x[0] + '</button>'; }).join("") + '</div>' +
      '<div class="chips">' + LVL.map(function(x){ return '<button class="chip' + (x[0] === lv ? " on" : "") + '" data-lv="' + x[0] + '">' + x[1] + ' ' + ctx.L(x[2], x[3]) + '</button>'; }).join("") + '</div>' +
      '<div class="chips">' + SETN.map(function(x){ return '<button class="chip' + (x[0] === set ? " on" : "") + '" data-st="' + x[0] + '">' + x[1] + ' ' + ctx.L(x[2], x[3]) + '</button>'; }).join("") + '</div></div>' +
      '<div class="kgSu' + (emo ? " emo" : "") + '" style="--n:' + N + ';--br:' + G.br + ';--bc:' + G.bc + '">' + G.val.map(function(row, r){ return row.map(function(v, c){ var giv = G.giv[r][c] >= 0, cls = (giv ? "g" : "") + (c % G.bc === G.bc - 1 && c < N - 1 ? " suR" : "") + (r % G.br === G.br - 1 && r < N - 1 ? " suB" : ""); return '<button data-su="' + r + ',' + c + '" class="' + cls + '">' + (v >= 0 ? sym[v] : "") + '</button>'; }).join(""); }).join("") + '</div>' +
      '<div class="kgPad' + (emo ? " emo" : "") + '" style="--n:' + Math.min(N, 9) + '">' + sym.slice(0, N).map(function(s, i){ return '<button data-pv="' + i + '">' + s + '</button>'; }).join("") + '<button data-pv="-1">⌫</button></div>' +
      '<div class="kgBtns"><button class="btn alt" id="suH">💡 ' + ctx.L("Bantuan", "Hint") + '</button><button class="btn alt" id="suN">🆕 ' + ctx.L("Baharu", "New") + '</button><span class="kgTime" id="suT"></span></div>';
    var cells = host.querySelectorAll("[data-su]");
    var mark = function(){ cells.forEach(function(b){ var p = b.getAttribute("data-su").split(",").map(Number), v = G.val[p[0]][p[1]]; b.textContent = v >= 0 ? sym[v] : ""; b.classList.toggle("sel", sel && sel[0] === p[0] && sel[1] === p[1]);
      b.classList.toggle("same", !!sel && v >= 0 && v === G.val[sel[0]][sel[1]]); var bad = false; if(v >= 0 && G.giv[p[0]][p[1]] < 0){ G.val[p[0]][p[1]] = -1; bad = !ok(G.val, N, G.br, G.bc, p[0], p[1], v); G.val[p[0]][p[1]] = v; } b.classList.toggle("bad", bad); }); };
    cells.forEach(function(b){ b.onclick = function(){ var p = b.getAttribute("data-su").split(",").map(Number); sel = p; mark(); }; });
    host.querySelectorAll("[data-pv]").forEach(function(b){ b.onclick = function(){ if(!sel || G.giv[sel[0]][sel[1]] >= 0) return; G.val[sel[0]][sel[1]] = +b.getAttribute("data-pv"); ctx.put("sudoku", st); ctx.vib(10); mark();
      if(valid(G.val.map(function(r){ return r.slice(); }), N, G.br, G.bc)){ var secs = Math.round((Date.now() - t0) / 1000) + (G.t || 0), k = N + G.lv; st.bt = st.bt || {}; if(!st.bt[k] || secs < st.bt[k]) st.bt[k] = secs; st.best = N + "×" + N + " " + Math.floor(secs / 60) + ":" + ctx.pad(secs % 60); st.n = (st.n || 0) + 1; st.cur = null; ctx.put("sudoku", st); ctx.star(N >= 9 ? 3 : 2); ctx.confetti(host);
        var w = document.createElement("div"); w.className = "kgWin"; w.innerHTML = '<b>🌟 ' + ctx.L("Selesai! ", "Solved! ") + Math.floor(secs / 60) + ':' + ctx.pad(secs % 60) + '</b><button class="btn gold">🆕 ' + ctx.L("Main lagi", "Play again") + '</button>'; host.appendChild(w); w.querySelector("button").onclick = function(){ fresh(); draw(); }; } }; });
    host.querySelector("#suH").onclick = function(){ var empty = []; G.val.forEach(function(row, r){ row.forEach(function(v, c){ if(v !== G.sol[r][c] && G.giv[r][c] < 0 && N <= 9) empty.push([r, c]); }); }); if(N > 9){ G.val.forEach(function(row, r){ row.forEach(function(v, c){ if(v < 0) empty.push([r, c]); }); }); }
      if(!empty.length) return; var p = sel && empty.some(function(e){ return e[0] === sel[0] && e[1] === sel[1]; }) ? sel : empty[Math.floor(rng() * empty.length)]; G.val[p[0]][p[1]] = G.sol[p[0]][p[1]]; G.h++; sel = p; ctx.put("sudoku", st); mark(); };
    host.querySelector("#suN").onclick = function(){ fresh(); draw(); };
    host.querySelectorAll("[data-sz]").forEach(function(b){ b.onclick = function(){ sz = st.sz = +b.getAttribute("data-sz"); fresh(); draw(); }; });
    host.querySelectorAll("[data-lv]").forEach(function(b){ b.onclick = function(){ lv = st.lv = b.getAttribute("data-lv"); fresh(); draw(); }; });
    host.querySelectorAll("[data-st]").forEach(function(b){ b.onclick = function(){ set = st.set = b.getAttribute("data-st"); G.set = set; ctx.put("sudoku", st); draw(); }; });
    mark(); };
  draw(); tick = setInterval(function(){ var e = host.querySelector("#suT"); if(e && st.cur){ var s = Math.round((Date.now() - t0) / 1000) + (st.cur.t || 0); e.textContent = "⏱ " + Math.floor(s / 60) + ":" + ctx.pad(s % 60); } }, 1000);
  return {stop: function(){ clearInterval(tick); if(st.cur){ st.cur.t = (st.cur.t || 0) + Math.round((Date.now() - t0) / 1000); ctx.put("sudoku", st); } }}; }};

// ---------- Kakuro ----------
function kakuro(n){ for(var tries = 0; tries < 80; tries++){ var B = [], r, c, i;
    for(r = 0; r < n; r++){ B.push([]); for(c = 0; c < n; c++) B[r].push(r === 0 || c === 0 || rng() < 0.18); }
    for(var pass = 0; pass < 40; pass++){ var changed = false;
      for(r = 1; r < n; r++) for(c = 1; c < n; c++){ if(B[r][c]) continue; var h = 1, v = 1; for(i = c - 1; i > 0 && !B[r][i]; i--) h++; for(i = c + 1; i < n && !B[r][i]; i++) h++; for(i = r - 1; i > 0 && !B[i][c]; i--) v++; for(i = r + 1; i < n && !B[i][c]; i++) v++; if(h === 1 || v === 1){ B[r][c] = true; changed = true; } }
      if(!changed) break; }
    var whites = 0; for(r = 1; r < n; r++) for(c = 1; c < n; c++) if(!B[r][c]) whites++; if(whites < (n - 1) * (n - 1) * 0.5) continue;
    var V = B.map(function(row){ return row.map(function(){ return 0; }); }), list = []; for(r = 1; r < n; r++) for(c = 1; c < n; c++) if(!B[r][c]) list.push([r, c]);
    var can = function(r, c, d){ for(var k = c - 1; k > 0 && !B[r][k]; k--) if(V[r][k] === d) return false; for(k = c + 1; k < n && !B[r][k]; k++) if(V[r][k] === d) return false; for(k = r - 1; k > 0 && !B[k][c]; k--) if(V[k][c] === d) return false; for(k = r + 1; k < n && !B[k][c]; k++) if(V[k][c] === d) return false; return true; };
    var steps = 0, fill = function(i){ if(i >= list.length) return true; if(++steps > 20000) return false; var p = list[i], ds = shuf([1, 2, 3, 4, 5, 6, 7, 8, 9]); for(var k = 0; k < 9; k++){ if(can(p[0], p[1], ds[k])){ V[p[0]][p[1]] = ds[k]; if(fill(i + 1)) return true; V[p[0]][p[1]] = 0; } } return false; };
    if(!fill(0)) continue;
    var clue = B.map(function(row){ return row.map(function(){ return null; }); });
    for(r = 0; r < n; r++) for(c = 0; c < n; c++){ if(!B[r][c]) continue; var a = 0, d = 0; for(i = c + 1; i < n && !B[r][i]; i++) a += V[r][i]; for(i = r + 1; i < n && !B[i][c]; i++) d += V[i][c]; if(a || d) clue[r][c] = [d, a]; }
    return {n: n, B: B, V: V, clue: clue}; } return null; }
function kkCheck(K, val){ var n = K.n, r, c, i; for(r = 0; r < n; r++) for(c = 0; c < n; c++){ if(!K.clue[r][c]) continue; var d = K.clue[r][c][0], a = K.clue[r][c][1], seen, s;
    if(a){ s = 0; seen = {}; for(i = c + 1; i < n && !K.B[r][i]; i++){ var v = val[r][i]; if(!v || seen[v]) return false; seen[v] = 1; s += v; } if(s !== a) return false; }
    if(d){ s = 0; seen = {}; for(i = r + 1; i < n && !K.B[i][c]; i++){ var w = val[i][c]; if(!w || seen[w]) return false; seen[w] = 1; s += w; } if(s !== d) return false; } } return true; }
KG.kakuro = {make: kakuro, check: kkCheck};
KG.reg.kakuro = {hub: "num", o: 2, ic: "➕", ms: "Kakuro", en: "Kakuro", dms: "Jumlah setiap baris", den: "Make every run add up", run: function(host, ctx){
  var st = ctx.get("kakuro"), sz = st.sz || 6, lv = st.lv || "e", sel = null;
  var fresh = function(){ var K = kakuro(sz); var val = K.V.map(function(row, r){ return row.map(function(v, c){ return K.B[r][c] ? 0 : (lv === "e" && rng() < 0.35 ? -v : 0); }); }); st.cur = {K: K, val: val}; ctx.put("kakuro", st); };
  if(!st.cur) fresh();
  var draw = function(){ var K = st.cur.K, val = st.cur.val, n = K.n;
    host.innerHTML = '<div class="kgSet"><div class="chips"><button class="chip' + (sz === 6 ? " on" : "") + '" data-kz="6">6×6</button><button class="chip' + (sz === 8 ? " on" : "") + '" data-kz="8">8×8</button>' + LVL.slice(0, 2).map(function(x){ return '<button class="chip' + (x[0] === lv ? " on" : "") + '" data-kl="' + x[0] + '">' + x[1] + ' ' + ctx.L(x[2], x[3]) + '</button>'; }).join("") + '</div></div>' +
      '<div class="kgKk" style="--n:' + n + '">' + K.B.map(function(row, r){ return row.map(function(b, c){ if(b){ var cl = K.clue[r][c]; return '<span class="bk">' + (cl ? (cl[0] ? '<i class="d">' + cl[0] + '</i>' : '') + (cl[1] ? '<i class="a">' + cl[1] + '</i>' : '') : '') + '</span>'; }
        var v = val[r][c]; return '<button data-kk="' + r + ',' + c + '" class="' + (v < 0 ? "g" : "") + '">' + (v ? Math.abs(v) : "") + '</button>'; }).join(""); }).join("") + '</div>' +
      '<div class="kgPad" style="--n:5">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(d){ return '<button data-kd="' + d + '">' + d + '</button>'; }).join("") + '<button data-kd="0">⌫</button></div>' +
      '<div class="kgBtns"><button class="btn alt" id="kkN">🆕 ' + ctx.L("Baharu", "New") + '</button></div><div class="mut tiny">' + ctx.L("Nombor di atas garis: jumlah ke kanan. Di bawah garis: jumlah ke bawah. Tiada nombor berulang dalam satu baris.", "Number above the line: the sum to the right. Below the line: the sum downwards. No digit repeats in a run.") + '</div>';
    var mark = function(){ host.querySelectorAll("[data-kk]").forEach(function(b){ var p = b.getAttribute("data-kk").split(",").map(Number); b.classList.toggle("sel", !!sel && sel[0] === p[0] && sel[1] === p[1]); var v = val[p[0]][p[1]]; b.textContent = v ? Math.abs(v) : ""; }); };
    host.querySelectorAll("[data-kk]").forEach(function(b){ b.onclick = function(){ sel = b.getAttribute("data-kk").split(",").map(Number); mark(); }; });
    host.querySelectorAll("[data-kd]").forEach(function(b){ b.onclick = function(){ if(!sel || val[sel[0]][sel[1]] < 0) return; val[sel[0]][sel[1]] = +b.getAttribute("data-kd"); ctx.put("kakuro", st); ctx.vib(10); mark();
      if(kkCheck(K, val.map(function(row){ return row.map(Math.abs); }))){ st.n = (st.n || 0) + 1; st.cur = null; ctx.put("kakuro", st); ctx.star(3); ctx.confetti(host); var w = document.createElement("div"); w.className = "kgWin"; w.innerHTML = '<b>🌟 ' + ctx.L("Kakuro selesai!", "Kakuro solved!") + '</b><button class="btn gold">🆕</button>'; host.appendChild(w); w.querySelector("button").onclick = function(){ fresh(); draw(); }; } }; });
    host.querySelector("#kkN").onclick = function(){ fresh(); draw(); };
    host.querySelectorAll("[data-kz]").forEach(function(b){ b.onclick = function(){ sz = st.sz = +b.getAttribute("data-kz"); fresh(); draw(); }; });
    host.querySelectorAll("[data-kl]").forEach(function(b){ b.onclick = function(){ lv = st.lv = b.getAttribute("data-kl"); fresh(); draw(); }; }); };
  draw(); }};
})();
