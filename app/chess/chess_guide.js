/* My Ihsan 0.6.66 · Explore › 3D chess › 📖 Guide. Reads window.CHESS_GUIDE_MD (en / ms markdown) and shows it chapter by chapter.
   Every ``` move block and every inline `1.…` line gets "▶ Play on board": a flat board with ⏮ ◀ ▶ ⏭ and autoplay, the moves as chips,
   and "carry on in 3D" (2 players or against the robot from that position, through ChessView). Last chapter + read chapters kept in ihsan_chess.guide. */
window.ChessGuide = (function(){
"use strict";
var H = null, en = false, root = null, E = null, onPlay = null, onBack = null, CH = null, cur = 0, LINES = [];
function L(a, b){ return en ? b : a; }
function esc(s){ return H.esc(s == null ? "" : String(s)); }
function cfg(){ return H.load("ihsan_chess", {}) || {}; }
function slug(t){ return String(t).toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-"); }

// ---------- markdown → chapters ----------
// the intro (everything before the first "## Chapter"/"## Bab") is chapter 0; each level-2 chapter heading starts a new one
function chapters(md){ var out = [{t:"", md:""}], lines = md.split("\n"), title = "";
  lines.forEach(function(ln){ var m = ln.match(/^## (.*)$/); if(m && /^(Chapter|Bab) \d/.test(m[1])){ out.push({t:m[1].replace(/\s*\{#[^}]+\}\s*$/, ""), id:(m[1].match(/\{#([^}]+)\}/) || [])[1] || slug(m[1]), md:""}); return; }
    if(/^# /.test(ln) && !title){ title = ln.slice(2); return; } out[out.length - 1].md += ln + "\n"; });
  out[0].t = L("Pengenalan", "Introduction"); out[0].id = "intro"; out.title = title; return out; }
function inline(s){ var h = esc(s);
  h = h.replace(/`([^`]+)`/g, function(_, c){ if(/^1\.\s?\S+\s+\S/.test(c) || /^1\.\S+/.test(c) && /\s/.test(c)){ LINES.push({txt:c}); return '<button class="cgIn" data-ln="' + (LINES.length - 1) + '">' + c + ' ▶</button>'; } return '<code>' + c + '</code>'; });
  h = h.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<i>$2</i>");
  h = h.replace(/\[([^\]]+)\]\(#([^)]+)\)/g, '<a href="#" class="cgLk" data-cgo="$2">$1</a>'); return h; }
function render(md){ var out = [], lines = md.split("\n"), i = 0, para = [];
  var flush = function(){ if(para.length){ out.push('<p>' + inline(para.join(" ")) + '</p>'); para = []; } };
  while(i < lines.length){ var ln = lines[i];
    if(/^```/.test(ln)){ flush(); var code = []; i++; while(i < lines.length && !/^```/.test(lines[i])){ code.push(lines[i]); i++; } i++;
      LINES.push({txt:code.join("\n"), blk:1}); var k = LINES.length - 1; out.push('<div class="cgLine"><pre>' + esc(code.join("\n")) + '</pre><button class="chip cgPl" data-ln="' + k + '">▶ ' + L("Main di papan", "Play on board") + '</button><div class="cgBd" id="cgB' + k + '"></div></div>'); continue; }
    var hm = ln.match(/^(#{2,4}) (.*)$/); if(hm){ flush(); var lv = hm[1].length, tx = hm[2].replace(/\s*\{#[^}]+\}\s*$/, ""), id = (hm[2].match(/\{#([^}]+)\}/) || [])[1] || slug(hm[2]); out.push('<h' + (lv + 1) + ' id="cg-' + esc(id) + '">' + inline(tx) + '</h' + (lv + 1) + '>'); i++; continue; }
    if(/^---\s*$/.test(ln)){ flush(); out.push('<hr>'); i++; continue; }
    if(/^>/.test(ln)){ flush(); var q = []; while(i < lines.length && /^>/.test(lines[i])){ q.push(lines[i].replace(/^>\s?/, "")); i++; } out.push('<blockquote>' + inline(q.join(" ")) + '</blockquote>'); continue; }
    if(/^\|/.test(ln)){ flush(); var rows = []; while(i < lines.length && /^\|/.test(lines[i])){ rows.push(lines[i]); i++; }
      var cells = function(r){ return r.replace(/^\||\|$/g, "").split("|").map(function(c){ return c.trim(); }); }, hd = cells(rows[0]), body = rows.slice(2).map(cells);
      out.push('<div class="cgTw"><table class="cgT"><thead><tr>' + hd.map(function(c){ return '<th>' + inline(c) + '</th>'; }).join("") + '</tr></thead><tbody>' + body.map(function(r){ return '<tr>' + r.map(function(c){ return '<td>' + inline(c) + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div>'); continue; }
    if(/^(\d+\.|-) /.test(ln)){ flush(); var ol = /^\d/.test(ln), it = []; while(i < lines.length && /^(\d+\.|-) /.test(lines[i])){ it.push(lines[i].replace(/^(\d+\.|-) /, "")); i++; } out.push((ol ? '<ol>' : '<ul>') + it.map(function(x){ return '<li>' + inline(x) + '</li>'; }).join("") + (ol ? '</ol>' : '</ul>')); continue; }
    if(!ln.trim()){ flush(); i++; continue; }
    para.push(ln); i++; }
  flush(); return out.join(""); }

// ---------- move lines ----------
function toks(s){ return s.replace(/\d+\.(\.\.)?/g, " ").split(/\s+/).filter(Boolean).map(function(t){ return t.replace(/[!?]+$/, ""); }); }
// a block that starts "5...Na5" continues the previous block from black's 5th move
function prefixFor(k){ var t = LINES[k].txt.trim(), m = t.match(/^(\d+)\.(\.\.)?/); if(!m || m[1] === "1") return []; for(var j = k - 1; j >= 0; j--){ var p = LINES[j].txt.trim(); if(LINES[j].blk && /^1\./.test(p)){ return toks(p).slice(0, 2 * (+m[1] - 1) + (m[2] ? 1 : 0)); } } return []; }
function playAll(list){ var g = new E.Game(), mv = [], sans = []; for(var i = 0; i < list.length; i++){ var lg = g.legal(), want = list[i].replace(/[+#]/g, ""), hit = lg.filter(function(x){ return g.sanOf(x, lg) === want; }); if(hit.length !== 1) break; var m = g.play(hit[0]); mv.push({from:m.from, to:m.to, promo:m.promo}); sans.push(m.san); } return {mv:mv, san:sans}; }
var GLY = {K:"♚", Q:"♛", R:"♜", B:"♝", N:"♞", P:"♟"};
function board(box, k){ var pre = prefixFor(k), line = toks(LINES[k].txt), all = playAll(pre.concat(line)), start = Math.min(pre.length, all.mv.length), n = all.mv.length, pos = n, flip = false, auto = 0;
  var paint = function(){ var g = new E.Game(); for(var i = 0; i < pos; i++) g.play(all.mv[i]); var last = pos ? all.mv[pos - 1] : null, chk = g.inCheck(), ks = -1, st = g.status(); if(chk) g.b.forEach(function(p, s){ if(p === (g.turn === "w" ? "K" : "k")) ks = s; });
    var sq = [], r, f; for(r = 0; r < 8; r++) for(f = 0; f < 8; f++){ var rr = flip ? 7 - r : r, ff = flip ? 7 - f : f, s = rr * 8 + ff, p = g.b[s], light = (rr + ff) % 2 === 0;
      sq.push('<i class="' + (light ? 'l' : 'd') + (last && (s === last.from || s === last.to) ? ' m' : '') + (s === ks ? ' k' : '') + '">' + (p ? '<b class="' + (p === p.toUpperCase() ? 'w' : 'bk') + '">' + GLY[p.toUpperCase()] + '</b>' : '') + (ff === (flip ? 7 : 0) ? '<em class="rk">' + (8 - rr) + '</em>' : '') + (rr === (flip ? 0 : 7) ? '<em class="fl">' + "abcdefgh"[ff] + '</em>' : '') + '</i>'); }
    var chips = all.san.map(function(s, i){ return (i % 2 === 0 ? '<span class="cgNo">' + (i / 2 + 1) + '.</span>' : '') + '<button class="cgMv' + (i + 1 === pos ? ' on' : '') + (i < start ? ' pre' : '') + '" data-p="' + (i + 1) + '">' + esc(s) + '</button>'; }).join("");
    box.innerHTML = '<div class="cgBoard noico">' + sq.join("") + '</div><div class="cgSt">' + (st.mate ? '🏁 ' + L("Mat!", "Checkmate!") : chk ? '⚠️ ' + L("Sah", "Check") : pos ? '' : L("Kedudukan awal", "Start position")) + ' <small class="mut">' + (g.turn === "w" ? L("Giliran putih", "White to move") : L("Giliran hitam", "Black to move")) + '</small></div>' +
      '<div class="cgNav"><button class="chip" data-n="0">⏮</button><button class="chip" data-n="-1">◀</button><button class="chip" data-n="a">' + (auto ? "⏸" : "▶▶") + '</button><button class="chip" data-n="1">▶</button><button class="chip" data-n="9">⏭</button><button class="chip" data-n="f">🔄</button></div>' +
      '<div class="cgMvs">' + chips + '</div><div class="cgGo"><button class="btn alt g3d" data-g="2p">👥 ' + L("Teruskan 2 pemain (3D)", "Carry on, 2 players (3D)") + '</button><button class="btn alt g3d" data-g="ai">🤖 ' + L("Lawan robot dari sini", "Play the robot from here") + '</button></div>';
    box.querySelectorAll("[data-n]").forEach(function(b){ b.onclick = function(){ var v = b.getAttribute("data-n"); if(v === "f"){ flip = !flip; } else if(v === "a"){ if(auto){ clearInterval(auto); auto = 0; } else { if(pos >= n) pos = 0; auto = setInterval(function(){ if(pos >= n || !document.body.contains(box)){ clearInterval(auto); auto = 0; } else pos++; paint(); }, 900); } }
      else if(v === "0") pos = 0; else if(v === "9") pos = n; else pos = Math.max(0, Math.min(n, pos + (+v))); paint(); }; });
    box.querySelectorAll("[data-p]").forEach(function(b){ b.onclick = function(){ pos = +b.getAttribute("data-p"); paint(); }; });
    box.querySelectorAll("[data-g]").forEach(function(b){ b.onclick = function(){ if(auto){ clearInterval(auto); auto = 0; } var mode = b.getAttribute("data-g"), gg = new E.Game(); for(var i = 0; i < pos; i++) gg.play(all.mv[i]); onPlay(all.mv.slice(0, pos), mode, gg.turn); }; }); };
  pos = start; paint(); box._k = k; }

// ---------- screens ----------
function page(){ var c = cfg(), gd = c.guide || {}, read = gd.read || {}, md = (window.CHESS_GUIDE_MD || {})[en ? "en" : "ms"] || "";
  CH = chapters(md); cur = Math.max(0, Math.min(CH.length - 1, gd.ch || 0)); LINES = [];
  var html = render(CH[cur].md);
  root.innerHTML = '<div class="chTop"><button class="chip" id="cgBack">‹ ' + L("Catur", "Chess") + '</button><b>📖 ' + L("Panduan catur", "Chess guide") + '</b></div>' +
    '<div class="cgToc">' + CH.map(function(x, i){ return '<button class="chip' + (i === cur ? ' on' : '') + '" data-ch="' + i + '">' + (i ? i + (read[i] ? " ✓" : "") : "📘") + '</button>'; }).join("") + '</div>' +
    '<div class="card cgBody"><h2 class="cgH">' + esc(i0(CH[cur].t)) + '</h2>' + html + '</div>' +
    '<div class="btns cgPN"><button class="btn alt g3d" id="cgPrev"' + (cur ? '' : ' disabled') + '>‹ ' + L("Sebelum", "Back") + '</button><button class="btn gold g3d" id="cgNext"' + (cur < CH.length - 1 ? '' : ' disabled') + '>' + L("Bab seterusnya", "Next chapter") + ' ›</button></div>';
  root.querySelector("#cgBack").onclick = function(){ onBack(); };
  root.querySelectorAll("[data-ch]").forEach(function(b){ b.onclick = function(){ go(+b.getAttribute("data-ch")); }; });
  root.querySelector("#cgPrev").onclick = function(){ go(cur - 1); }; root.querySelector("#cgNext").onclick = function(){ go(cur + 1); };
  root.querySelectorAll(".cgPl").forEach(function(b){ b.onclick = function(){ var k = +b.getAttribute("data-ln"), box = root.querySelector("#cgB" + k); if(box.innerHTML){ box.innerHTML = ""; b.classList.remove("on"); return; } b.classList.add("on"); board(box, k); }; });
  root.querySelectorAll(".cgIn").forEach(function(b){ b.onclick = function(){ var k = +b.getAttribute("data-ln"), ov = H.showSheet("♟️ " + esc(LINES[k].txt), '<div class="cgBd" id="cgS"></div>'); board(ov.querySelector("#cgS"), k); }; });
  root.querySelectorAll("[data-cgo]").forEach(function(a){ a.onclick = function(e){ e.preventDefault(); var id = a.getAttribute("data-cgo"); for(var i = 0; i < CH.length; i++){ if(CH[i].id === id || id.indexOf(CH[i].id) === 0 && CH[i].id !== "intro"){ go(i); return; } } var el = root.querySelector("#cg-" + CSS.escape(id)); if(el) el.scrollIntoView({behavior:"smooth"}); else go(0); }; });
  if(cur){ read[cur] = 1; } var c2 = cfg(); c2.guide = {ch:cur, read:read}; H.save("ihsan_chess", c2); }
function i0(t){ return t; }
function go(i){ var c = cfg(); c.guide = c.guide || {}; c.guide.ch = i; H.save("ihsan_chess", c); page(); var v = document.getElementById("view"); if(v) v.scrollTop = 0; if(root.scrollIntoView) root.scrollIntoView(); }
function open(el, helpers, opts){ H = helpers; en = !!H.en(); root = el; E = window.ChessEngine; onPlay = opts.play; onBack = opts.back; page(); }
return {open:open, _t:{chapters:function(md){ return chapters(md); }, toks:toks, playAll:function(l){ E = window.ChessEngine; return playAll(l); }, lines:function(){ return LINES; }}};
})();
