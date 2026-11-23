/* My Ihsan 0.6.71 (owner): Majlis › 🪑 Susun meja / Seating. 0.7.17: table grid (rows × columns, table type, spacing, ＋/− a row or column) and adjustable grid lines. For an event in a hall or space:
   - the space in metres (width × length), with the pelamin/stage, door, buffet and PA as blocks you drag into place;
   - round tables (8 or 10 seats) and long tables (6–12 seats), dragged into place (snaps to 25 cm), turned 90°, named, deleted;
   - guests (from the event's guest list, a whole party stays together) put at a table; a table over its seats turns red;
   - ✨ Auto seats everyone coming / not yet replied who has no table, party by party, family groups together;
   - share the plan as a picture or PDF, and the list of who sits where (WhatsApp).
   Storage: event.seat = {w, l, items:[{id, k:"table"|"stage"|"door"|"buffet"|"pa", sh:"round"|"long", x, y, r, seats, name}], at:{guestId: tableId}}.
   EvSeat.page(el, e, ctx) with ctx = {H, L2, E, sv, draw}. */
(function(){
"use strict";
var C = null, selId = null;
function L(a, b){ return C.L2(a, b); }
function E(s){ return C.E(s == null ? "" : String(s)); }
function uid(){ return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
var KINDS = {stage:["💐", "Pelamin / pentas", "Stage", 6, 3], door:["🚪", "Pintu", "Door", 2, 0.4], buffet:["🍛", "Bufet", "Buffet", 6, 1], pa:["🔊", "PA", "PA", 1.5, 1]};
function S(e){ var s = e.seat = e.seat || {}; if(!s.w) s.w = 20; if(!s.l) s.l = 15; s.items = s.items || []; s.at = s.at || {}; return s; }
function tables(s){ return s.items.filter(function(i){ return i.k === "table"; }); }
function gpax(g){ return g.st === "yes" && g.cp != null && g.cp !== "" ? +g.cp : (+g.pax || 1); }
function seated(e, t){ var s = S(e), o = (s.ord || {})[t.id] || []; return e.g.filter(function(g){ return s.at[g.id] === t.id; }).sort(function(a, b){ var i = o.indexOf(a.id), j = o.indexOf(b.id); return (i < 0 ? 999 : i) - (j < 0 ? 999 : j); }); }
// 0.6.75 (owner): zoom + full screen for the plan, tables lined up in rows or columns, the whole list by table under the plan
var Z = {z:1, cx:null, cy:null, full:false};
function vb(s){ var M = 0.6, W = s.w + 2 * M, H = s.l + 2 * M, w = W / Z.z, h = H / Z.z; if(Z.cx == null){ Z.cx = s.w / 2; Z.cy = s.l / 2; }
  var x = Math.max(-M, Math.min(-M + W - w, Z.cx - w / 2)), y = Math.max(-M, Math.min(-M + H - h, Z.cy - h / 2)); return [x, y, w, h]; }
function boxOf(i){ var z = size(i); return [i.x, i.y, i.r ? z[1] : z[0], i.r ? z[0] : z[1]]; }
function arrange(s, dir){ var T = tables(s), blocks = s.items.filter(function(i){ return i.k !== "table"; }).map(boxOf), placed = [], gap = 0.9, m = 0.5;
  var free = function(x, y, w, h){ return !blocks.concat(placed).some(function(b){ return x < b[0] + b[2] + gap && x + w + gap > b[0] && y < b[1] + b[3] + gap && y + h + gap > b[1]; }); };
  T.forEach(function(t){ var z = size(t), w = t.r ? z[1] : z[0], h = t.r ? z[0] : z[1], done = false;
    if(dir === "row"){ for(var y = m; y + h <= s.l - m && !done; y += 0.25) for(var x = m; x + w <= s.w - m; x += 0.25){ if(free(x, y, w, h)){ t.x = x; t.y = y; done = true; break; } } }
    else { for(var x2 = m; x2 + w <= s.w - m && !done; x2 += 0.25) for(var y2 = m; y2 + h <= s.l - m; y2 += 0.25){ if(free(x2, y2, w, h)){ t.x = x2; t.y = y2; done = true; break; } } }
    placed.push([t.x, t.y, w, h]); }); }
function used(e, t){ return seated(e, t).reduce(function(a, g){ return a + gpax(g); }, 0); }
function size(i){ if(i.k === "table") return i.sh === "round" ? [i.seats > 8 ? 1.8 : 1.6, i.seats > 8 ? 1.8 : 1.6] : [Math.max(1.2, i.seats / 2 * 0.6), 0.8]; var k = KINDS[i.k]; return [i.w || k[3], i.h || k[4]]; }
// grid: lines every 0.5 m (bold every 1 m); when on, tables snap to it. Off = the old 0.25 m snap.
var GRID = 0.5;
function gridOn(s){ return s.grid !== false; }
function gstep(s){ return [0.25, 0.5, 1, 2].indexOf(+s.gs) >= 0 ? +s.gs : GRID; }   // 0.7.17 (owner): adjustable grid size
// 0.7.17 (owner): a table grid of R rows × C columns. Grid tables carry gi (their place in the grid); the rest of the plan is left alone.
// Fewer cells keeps the first tables (with their names and guests); more cells adds new tables; the space grows when the grid does not fit.
var TT = {round8:["round", 8], round10:["round", 10], long:["long", 8], long10:["long", 10]};
function tgOf(s){ var g = s.tg = s.tg || {}; if(!g.r) g.r = 3; if(!g.c) g.c = 3; if(!TT[g.t]) g.t = "round10"; if(!(g.gap >= 0.5)) g.gap = 1.2; return g; }
function tgTables(s){ return tables(s).filter(function(t){ return t.gi != null; }).sort(function(a, b){ return a.gi - b.gi; }); }
function tgApply(e, s, opt){ opt = opt || {}; var g = tgOf(s), N = g.r * g.c, have = tgTables(s), tt = TT[g.t];
  if(!have.length && !opt.fresh) have = [];
  var drop = have.slice(N), lost = drop.reduce(function(a, t){ return a + seated(e, t).length; }, 0);
  if(lost && !opt.ok && !confirm(L("Meja yang dibuang ada ", "The tables being removed have ") + lost + L(" tetamu. Mereka akan tiada meja. Teruskan?", " guests. They will have no table. Carry on?"))) return false;
  drop.forEach(function(t){ Object.keys(s.at).forEach(function(k){ if(s.at[k] === t.id) delete s.at[k]; }); s.items = s.items.filter(function(i){ return i !== t; }); });
  have = have.slice(0, N);
  var n0 = tables(s).length;
  while(have.length < N){ var t = {id:uid(), k:"table", sh:tt[0], seats:tt[1], name:L("Meja ", "Table ") + (++n0), r:0, x:0, y:0}; s.items.push(t); have.push(t); }
  have.forEach(function(t, i){ t.gi = i; if(opt.retype){ t.sh = tt[0]; t.seats = tt[1]; } });
  // cell = the biggest grid table + the gap; the grid sits under any stage/door block at the top, centred left to right
  var cw = 0, ch = 0; have.forEach(function(t){ var z = size(t), w = t.r ? z[1] : z[0], h = t.r ? z[0] : z[1]; cw = Math.max(cw, w); ch = Math.max(ch, h); });
  cw += g.gap; ch += g.gap;
  var top = 0.6; s.items.forEach(function(i){ if(i.k !== "table" && i.y < s.l / 3){ var b = boxOf(i); top = Math.max(top, b[1] + b[3] + g.gap); } });
  var needW = g.c * cw - g.gap + 1.2, needH = top + g.r * ch - g.gap + 0.6, grew = false;
  if(needW > s.w){ s.w = Math.ceil(needW * 2) / 2; grew = true; } if(needH > s.l){ s.l = Math.ceil(needH * 2) / 2; grew = true; }
  var x0 = Math.max(0.6, (s.w - (g.c * cw - g.gap)) / 2);
  have.forEach(function(t, i){ var r = Math.floor(i / g.c), c = i % g.c, z = size(t), w = t.r ? z[1] : z[0], h = t.r ? z[0] : z[1];
    t.x = Math.round((x0 + c * cw + (cw - g.gap - w) / 2) * 100) / 100; t.y = Math.round((top + r * ch + (ch - g.gap - h) / 2) * 100) / 100; });
  return {grew:grew}; }
function svg(e, opt){ opt = opt || {}; var s = S(e), M = 0.6, h = '<svg class="stPlan" viewBox="' + (-M) + ' ' + (-M) + ' ' + (s.w + 2 * M) + ' ' + (s.l + 2 * M) + '" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="0" y="0" width="' + s.w + '" height="' + s.l + '" rx="0.2" fill="' + (opt.print ? "#fff" : "rgba(255,255,255,.04)") + '" stroke="' + (opt.print ? "#333" : "var(--gold,#c9a646)") + '" stroke-width="0.08"/>';
  if(gridOn(s)){ var gc = function(m){ return opt.print ? (m ? "#bbb" : "#ddd") : (m ? "rgba(255,255,255,.30)" : "rgba(255,255,255,.14)"); }, gw = function(m){ return m ? 0.03 : 0.015; };
    var GS = gstep(s); for(var gx = GS; gx < s.w; gx += GS){ var mj = Math.abs(gx - Math.round(gx)) < 1e-9; h += '<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="' + s.l + '" stroke="' + gc(mj) + '" stroke-width="' + gw(mj) + '"/>'; }
    for(var gy = GS; gy < s.l; gy += GS){ var mj2 = Math.abs(gy - Math.round(gy)) < 1e-9; h += '<line x1="0" y1="' + gy + '" x2="' + s.w + '" y2="' + gy + '" stroke="' + gc(mj2) + '" stroke-width="' + gw(mj2) + '"/>'; } }
  s.items.forEach(function(i){ var z = size(i), w = i.r ? z[1] : z[0], hh = i.r ? z[0] : z[1], x = i.x, y = i.y, sel = i.id === selId && !opt.print, col = opt.print ? "#333" : "#e8e2cf";
    h += '<g class="stIt" data-it="' + i.id + '" transform="translate(' + x + ' ' + y + ')">';
    if(i.k === "table"){ var u = used(e, i), over = u > i.seats, fill = over ? "rgba(192,57,43,.55)" : u ? "rgba(201,166,70,.55)" : "rgba(255,255,255,.14)";
      if(opt.print) fill = over ? "#f3c1bb" : u ? "#f6e7b8" : "#f5f5f5";
      // chairs
      for(var c = 0; c < i.seats; c++){ var cx, cy; if(i.sh === "round"){ var a = c / i.seats * Math.PI * 2, R = w / 2 + 0.28; cx = w / 2 + Math.cos(a) * R; cy = hh / 2 + Math.sin(a) * R; }
        else { var per = Math.ceil(i.seats / 2), side = c < per ? 0 : 1, k2 = side ? c - per : c, n2 = side ? i.seats - per : per; if(i.r){ cx = side ? w + 0.25 : -0.25; cy = (k2 + 0.5) * hh / n2; } else { cx = (k2 + 0.5) * w / n2; cy = side ? hh + 0.25 : -0.25; } }
        h += '<circle cx="' + cx.toFixed(2) + '" cy="' + cy.toFixed(2) + '" r="0.17" fill="' + (c < u ? (opt.print ? "#b8862b" : "#c9a646") : (opt.print ? "#ddd" : "rgba(255,255,255,.25)")) + '"/>'; }
      h += i.sh === "round" ? '<circle cx="' + w / 2 + '" cy="' + hh / 2 + '" r="' + w / 2 + '" fill="' + fill + '" stroke="' + (sel ? "#ffd400" : col) + '" stroke-width="' + (sel ? 0.1 : 0.05) + '"/>' : '<rect width="' + w + '" height="' + hh + '" rx="0.08" fill="' + fill + '" stroke="' + (sel ? "#ffd400" : col) + '" stroke-width="' + (sel ? 0.1 : 0.05) + '"/>';
      h += '<text x="' + w / 2 + '" y="' + (hh / 2 - 0.02) + '" text-anchor="middle" font-size="0.36" font-weight="700" fill="' + (opt.print ? "#111" : "#fff") + '">' + E(i.name) + '</text><text x="' + w / 2 + '" y="' + (hh / 2 + 0.38) + '" text-anchor="middle" font-size="0.3" fill="' + (opt.print ? "#444" : "#eee") + '">' + u + '/' + i.seats + '</text>'; }
    else { var K = KINDS[i.k]; h += '<rect width="' + w + '" height="' + hh + '" rx="0.1" fill="' + (opt.print ? "#e8eef7" : "rgba(80,140,220,.35)") + '" stroke="' + (sel ? "#ffd400" : col) + '" stroke-width="' + (sel ? 0.1 : 0.04) + '"/><text x="' + w / 2 + '" y="' + (hh / 2 + 0.12) + '" text-anchor="middle" font-size="' + Math.min(0.42, hh * 0.6) + '" fill="' + (opt.print ? "#123" : "#fff") + '">' + K[0] + ' ' + E(L(K[1], K[2])) + '</text>'; }
    h += '</g>'; });
  return h + '</svg>'; }
function tgHtml(s){ var g = tgOf(s), n = tgTables(s).length, st = function(id, lab, v){ return '<div class="stTgS"><span>' + lab + '</span><button class="chip" data-tg="' + id + '" data-d="-1">−</button><b>' + v + '</b><button class="chip" data-tg="' + id + '" data-d="1">＋</button></div>'; };
  return '<details class="stTg"' + (n ? ' open' : '') + '><summary>▦ ' + L("Grid meja: baris × lajur", "Table grid: rows × columns") + (n ? ' · <b>' + g.r + ' × ' + g.c + '</b>' : '') + '</summary>' +
    '<div class="stTgR">' + st("r", L("Baris", "Rows"), g.r) + st("c", L("Lajur", "Columns"), g.c) + '</div>' +
    '<div class="chips stTgT">' + [["round8", "⭕ " + L("Bulat 8", "Round 8")], ["round10", "⭕ " + L("Bulat 10", "Round 10")], ["long", "▭ " + L("Panjang 8", "Long 8")], ["long10", "▭ " + L("Panjang 10", "Long 10")]].map(function(x){ return '<button class="chip' + (g.t === x[0] ? ' on' : '') + '" data-tgt="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>' +
    '<div class="stTgR">' + st("gap", L("Jarak (m)", "Spacing (m)"), g.gap.toFixed(1)) + '<div class="stTgS"><span>' + L("Garis grid", "Grid lines") + '</span>' + [0.25, 0.5, 1, 2].map(function(v){ return '<button class="chip' + (gstep(s) === v ? ' on' : '') + '" data-gs="' + v + '">' + v + ' m</button>'; }).join("") + '</div></div>' +
    '<button class="btn gold g3d" id="stTgGo">▦ ' + (n ? L("Susun semula grid", "Re-lay the grid") : L("Buat grid ", "Make the grid ") + g.r + ' × ' + g.c + ' (' + g.r * g.c + L(" meja)", " tables)")) + '</button>' +
    '<div class="mut tiny">' + L("Nama dan tetamu setiap meja kekal. Ruang dibesarkan jika grid tidak muat.", "Each table keeps its name and guests. The space grows if the grid does not fit.") + '</div></details>'; }
function page(el, e, ctx){ C = ctx; var s = S(e), T = tables(s), seats = T.reduce(function(a, t){ return a + t.seats; }, 0), come = e.g.filter(function(g){ return g.st !== "no"; }), seatP = come.filter(function(g){ return s.at[g.id]; }).reduce(function(a, g){ return a + gpax(g); }, 0), allP = come.reduce(function(a, g){ return a + gpax(g); }, 0), sel = s.items.filter(function(i){ return i.id === selId; })[0];
  var h = '<div class="card"><div class="fsum bb4"><div><small>' + L("Meja", "Tables") + '</small><b>' + T.length + '</b></div><div><small>' + L("Kerusi", "Seats") + '</small><b>' + seats + '</b></div><div><small>' + L("Ditempatkan", "Seated") + '</small><b class="evok">' + seatP + '</b><small>/ ' + allP + '</small></div></div>' +
    '<div class="btns" style="flex-wrap:wrap;margin-top:6px"><button class="chip" data-add="round8">⭕ ' + L("Bulat 8", "Round 8") + '</button><button class="chip" data-add="round10">⭕ ' + L("Bulat 10", "Round 10") + '</button><button class="chip" data-add="long">▭ ' + L("Panjang", "Long") + '</button>' +
    Object.keys(KINDS).map(function(k){ return '<button class="chip" data-add="' + k + '">' + KINDS[k][0] + ' ' + E(L(KINDS[k][1], KINDS[k][2])) + '</button>'; }).join("") + '</div>' +
    '<div class="stRoom"><label>' + L("Ruang (m)", "Space (m)") + ' <input id="stW" class="rin" inputmode="decimal" value="' + s.w + '"> × <input id="stL" class="rin" inputmode="decimal" value="' + s.l + '"></label>' +
    '<div class="stBtns"><button class="chip" id="stRows" title="' + E(L("Susun mendatar", "Line up in rows")) + '">⇔ ' + L("Baris", "Rows") + '</button><button class="chip" id="stCols" title="' + E(L("Susun menegak", "Line up in columns")) + '">⇕ ' + L("Lajur", "Columns") + '</button><button class="chip" id="stGrid">▦ ' + (gridOn(s) ? L("Grid on", "Grid on") : L("Grid off", "Grid off")) + '</button><button class="chip stFs" id="stFs">⛶</button></div></div>' + tgHtml(s) +
    '<div class="stWrap noswipe' + (Z.full ? ' full' : '') + '" id="stWrap"><button class="chip stFs stFsX">✕</button>' + svg(e) + '</div><div class="mut tiny">' + L("Seret meja ke tempatnya. Ketik meja untuk letak tetamu.", "Drag the tables into place. Tap a table to seat guests.") + '</div></div>' +
    (sel ? '<div class="card stSel"><b>' + (sel.k === "table" ? "🪑 " + E(sel.name) + ' · ' + used(e, sel) + '/' + sel.seats : KINDS[sel.k][0] + ' ' + E(L(KINDS[sel.k][1], KINDS[sel.k][2]))) + '</b><div class="btns" style="flex-wrap:wrap">' +
      (sel.k === "table" ? '<button class="btn gold g3d" id="stSeat">👥 ' + L("Tetamu di meja ini", "Guests at this table") + '</button><button class="chip" id="stName">✎ ' + L("Nama", "Name") + '</button><button class="chip" id="stSeats">🪑 ' + L("Kerusi", "Seats") + '</button>' : '') +
      '<button class="chip" id="stRot">⟳ 90°</button><button class="chip" id="stDup">⧉</button><button class="btn delb" id="stDel">🗑</button></div></div>' : '') +
    listHtml(e) +
    '<div class="btns" style="flex-wrap:wrap"><button class="btn gold g3d" id="stAuto">✨ ' + L("Susun automatik", "Auto seat") + '</button><button class="btn alt g3d" id="stList">📋 ' + L("Senarai meja", "Table list") + '</button><button class="btn alt g3d" id="stPdf">📄 PDF</button></div>';
  el.innerHTML = h;
  var q = function(x){ return el.querySelector(x); }, save = function(){ C.sv(); }, redraw = function(){ page(el, e, ctx); };
  el.querySelectorAll("[data-add]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-add"), n = tables(s).length + 1, pos = freeSpot(s), it;
    if(k === "round8" || k === "round10") it = {id:uid(), k:"table", sh:"round", seats:k === "round10" ? 10 : 8, name:L("Meja ", "Table ") + n};
    else if(k === "long") it = {id:uid(), k:"table", sh:"long", seats:8, name:L("Meja ", "Table ") + n};
    else it = {id:uid(), k:k};
    it.x = pos[0]; it.y = pos[1]; it.r = 0; if(k === "stage"){ it.x = Math.max(0, s.w / 2 - 3); it.y = 0.3; } if(k === "door"){ it.x = s.w / 2 - 1; it.y = s.l - 0.4; }
    s.items.push(it); selId = it.id; save(); redraw(); }; });
  var rw = function(){ var w = parseFloat(q("#stW").value), l = parseFloat(q("#stL").value); if(w >= 3 && w <= 200) s.w = w; if(l >= 3 && l <= 200) s.l = l; save(); redraw(); };
  q("#stW").onchange = rw; q("#stL").onchange = rw;
  // drag on the plan (metres, snaps to 25 cm); a tap selects
  var sv0 = q(".stPlan"), drag = null;
  sv0.addEventListener("pointerdown", function(ev){ var g = ev.target.closest("[data-it]"); if(!g){ if(selId){ selId = null; redraw(); } return; } ev.preventDefault(); var it = s.items.filter(function(i){ return i.id === g.getAttribute("data-it"); })[0], pt = toM(sv0, ev);
    drag = {it:it, dx:pt[0] - it.x, dy:pt[1] - it.y, g:g, moved:false}; try{ sv0.setPointerCapture(ev.pointerId); }catch(x){} });
  sv0.addEventListener("pointermove", function(ev){ if(!drag) return; var pt = toM(sv0, ev), z = size(drag.it), w = drag.it.r ? z[1] : z[0], hh = drag.it.r ? z[0] : z[1];
    var stp = gridOn(s) ? gstep(s) : 0.25, nx = Math.round((pt[0] - drag.dx) / stp) * stp, ny = Math.round((pt[1] - drag.dy) / stp) * stp; nx = Math.max(0, Math.min(s.w - w, nx)); ny = Math.max(0, Math.min(s.l - hh, ny));
    if(nx !== drag.it.x || ny !== drag.it.y){ drag.moved = true; drag.it.x = nx; drag.it.y = ny; drag.g.setAttribute("transform", "translate(" + nx + " " + ny + ")"); } });
  var up = function(){ if(!drag) return; var d = drag; drag = null; if(d.moved){ save(); } else if(Z.full && d.it.k === "table"){ selId = d.it.id; seatSheet(e, d.it, redraw); } else { selId = d.it.id; redraw(); if(d.it.k === "table") setTimeout(function(){ var b = el.querySelector("#stSel, .stSel"); if(b && b.scrollIntoView) b.scrollIntoView({block:"nearest"}); }, 0); } };
  sv0.addEventListener("pointerup", up); sv0.addEventListener("pointercancel", up);
  if(sel){ var bd = function(id, fn){ var x = q(id); if(x) x.onclick = fn; };
    bd("#stRot", function(){ sel.r = sel.r ? 0 : 1; save(); redraw(); });
    bd("#stDup", function(){ var c = JSON.parse(JSON.stringify(sel)); c.id = uid(); c.x = Math.min(s.w - 1, sel.x + 0.5); c.y = Math.min(s.l - 1, sel.y + 0.5); if(c.k === "table") c.name = L("Meja ", "Table ") + (tables(s).length + 1); s.items.push(c); selId = c.id; save(); redraw(); });
    bd("#stDel", function(){ if(!confirm(L("Padam ", "Delete ") + (sel.name || L(KINDS[sel.k][1], KINDS[sel.k][2])) + "?")) return; Object.keys(s.at).forEach(function(g){ if(s.at[g] === sel.id) delete s.at[g]; }); s.items = s.items.filter(function(i){ return i !== sel; }); selId = null; save(); redraw(); });
    bd("#stName", function(){ var n = prompt(L("Nama meja (cth. VIP, Keluarga pengantin)", "Table name (e.g. VIP, Bride's family)"), sel.name); if(n){ sel.name = n.slice(0, 24); save(); redraw(); } });
    bd("#stSeats", function(){ var n = parseInt(prompt(L("Bilangan kerusi", "Number of seats"), sel.seats), 10); if(n >= 2 && n <= 30){ sel.seats = n; save(); redraw(); } });
    bd("#stSeat", function(){ seatSheet(e, sel, redraw); }); }
  q("#stAuto").onclick = function(){ var n = auto(e); save(); redraw(); C.H.toast("✨ " + (n ? L("Ditempatkan: ", "Seated: ") + n + L(" jemputan", " parties") : L("Semua sudah ada meja, atau tiada kerusi kosong", "Everyone already has a table, or no free seats"))); };
  q("#stList").onclick = function(){ share(e); };
  q("#stPdf").onclick = function(){ pdf(e); };
  // zoom (± buttons, pinch, wheel), pan when zoomed (drag on empty floor), full screen
  var apv = function(){ var v = vb(s); sv0.setAttribute("viewBox", v.join(" ")); }; apv();
  el.querySelectorAll("[data-z]").forEach(function(b){ b.onclick = function(){ var k = +b.getAttribute("data-z"); Z.z = k ? Math.max(1, Math.min(5, Z.z * (k > 0 ? 1.4 : 1 / 1.4))) : 1; if(!k){ Z.cx = Z.cy = null; } apv(); }; });
  el.querySelectorAll(".stFs").forEach(function(b){ b.onclick = function(){ Z.full = !Z.full; redraw(); }; });
  var gb = q("#stGrid"); if(gb) gb.onclick = function(){ s.grid = !gridOn(s); save(); redraw(); };
  var tgRun = function(o){ var r = tgApply(e, s, o); if(r === false) return false; save(); redraw(); if(r.grew) C.H.toast("📐 " + L("Ruang dibesarkan ke ", "Space made bigger: ") + s.w + " × " + s.l + " m"); return true; };
  el.querySelectorAll("[data-tg]").forEach(function(b){ b.onclick = function(){ var g = tgOf(s), k = b.getAttribute("data-tg"), d = +b.getAttribute("data-d"), was = g[k];
    if(k === "gap") g.gap = Math.max(0.5, Math.min(4, Math.round((g.gap + d * 0.1) * 10) / 10)); else g[k] = Math.max(1, Math.min(20, g[k] + d));
    if(tgTables(s).length){ if(!tgRun()) { g[k] = was; } } else { save(); redraw(); } }; });
  el.querySelectorAll("[data-tgt]").forEach(function(b){ b.onclick = function(){ tgOf(s).t = b.getAttribute("data-tgt"); if(tgTables(s).length) tgRun({retype:true}); else { save(); redraw(); } }; });
  el.querySelectorAll("[data-gs]").forEach(function(b){ b.onclick = function(){ s.gs = +b.getAttribute("data-gs"); s.grid = true; save(); redraw(); }; });
  var tgo = q("#stTgGo"); if(tgo) tgo.onclick = function(){ tgRun(); };
  q("#stRows").onclick = function(){ arrange(s, "row"); save(); redraw(); }; q("#stCols").onclick = function(){ arrange(s, "col"); save(); redraw(); };
  var pts = {}, pz = null;
  sv0.addEventListener("pointerdown", function(ev){ pts[ev.pointerId] = [ev.clientX, ev.clientY]; var ids = Object.keys(pts); if(ids.length === 2){ drag = null; var a = pts[ids[0]], b = pts[ids[1]]; pz = {d:Math.hypot(b[0] - a[0], b[1] - a[1]), z:Z.z}; }
    else if(!ev.target.closest("[data-it]") && Z.z > 1){ pz = {pan:true, x:ev.clientX, y:ev.clientY, cx:Z.cx, cy:Z.cy}; } }, true);
  sv0.addEventListener("pointermove", function(ev){ if(!pts[ev.pointerId]) return; pts[ev.pointerId] = [ev.clientX, ev.clientY]; var ids = Object.keys(pts);
    if(ids.length >= 2 && pz && pz.d){ var a = pts[ids[0]], b = pts[ids[1]]; Z.z = Math.max(1, Math.min(5, pz.z * Math.hypot(b[0] - a[0], b[1] - a[1]) / pz.d)); apv(); }
    else if(pz && pz.pan){ var r = sv0.getBoundingClientRect(), v = vb(s); Z.cx = pz.cx - (ev.clientX - pz.x) / r.width * v[2]; Z.cy = pz.cy - (ev.clientY - pz.y) / r.height * v[3]; apv(); } }, true);
  var pend = function(ev){ delete pts[ev.pointerId]; if(Object.keys(pts).length < 2 && pz && pz.d) pz = null; if(!Object.keys(pts).length) pz = null; };
  sv0.addEventListener("pointerup", pend, true); sv0.addEventListener("pointercancel", pend, true);
  sv0.addEventListener("wheel", function(ev){ ev.preventDefault(); Z.z = Math.max(1, Math.min(5, Z.z * (ev.deltaY < 0 ? 1.15 : 0.87))); apv(); }, {passive:false});
  window.EvSeatBack = Z.full ? function(){ Z.full = false; redraw(); return true; } : null;
  // the list: guests by table, reorder ▲▼, extra pax − ＋, move to another table, take off
  var gOf = function(id){ return e.g.filter(function(g){ return g.id === id; })[0]; };
  el.querySelectorAll("[data-lu],[data-ld]").forEach(function(b){ b.onclick = function(){ var up = b.hasAttribute("data-lu"), gid = b.getAttribute(up ? "data-lu" : "data-ld"), tid = s.at[gid], list = seated(e, {id:tid}).map(function(g){ return g.id; }), i = list.indexOf(gid), j = i + (up ? -1 : 1);
    if(j < 0 || j >= list.length) return; list.splice(i, 1); list.splice(j, 0, gid); s.ord = s.ord || {}; s.ord[tid] = list; save(); redraw(); }; });
  el.querySelectorAll("[data-px]").forEach(function(b){ b.onclick = function(){ var p = b.getAttribute("data-px").split("|"), g = gOf(p[0]); if(!g) return; var d = +p[1];
    if(g.st === "yes" && g.cp != null && g.cp !== ""){ g.cp = Math.max(1, +g.cp + d); if(+g.cp > (+g.pax || 1)) g.pax = g.cp; } else g.pax = Math.max(1, (+g.pax || 1) + d); save(); redraw(); }; });
  el.querySelectorAll("[data-mv]").forEach(function(sl){ sl.onchange = function(){ var gid = sl.getAttribute("data-mv"); if(sl.value) s.at[gid] = sl.value; else delete s.at[gid]; save(); redraw(); }; });
  if(Z.full){ var fw = q("#stWrap"); if(fw) fw.scrollTop = 0; } }
function listHtml(e){ var s = S(e), T = tables(s), opts = function(cur){ return '<option value="">' + E(L("— tiada meja —", "— no table —")) + '</option>' + T.map(function(t){ return '<option value="' + t.id + '"' + (t.id === cur ? ' selected' : '') + '>' + E(t.name) + '</option>'; }).join(""); };
  var row = function(g, i, n){ return '<div class="stLr"><span class="stLo"><button class="chip" data-lu="' + g.id + '"' + (i ? '' : ' disabled') + '>▲</button><button class="chip" data-ld="' + g.id + '"' + (i < n - 1 ? '' : ' disabled') + '>▼</button></span><b>' + E(g.n) + (g.st === "yes" ? ' <small class="evok">✓</small>' : '') + '</b>' +
    '<span class="stLp"><button class="chip" data-px="' + g.id + '|-1">−</button><i>' + gpax(g) + '</i><button class="chip" data-px="' + g.id + '|1">＋</button></span><select data-mv="' + g.id + '">' + opts(s.at[g.id]) + '</select></div>'; };
  var h = '<div class="card stList"><h3>📋 ' + L("Senarai mengikut meja", "List by table") + '</h3>';
  T.forEach(function(t){ var g = seated(e, t), u = used(e, t); h += '<div class="stLh' + (u > t.seats ? ' over' : '') + '"><b>🪑 ' + E(t.name) + '</b><span>' + u + ' / ' + t.seats + '</span></div>' + (g.length ? g.map(function(x, i){ return row(x, i, g.length); }).join("") : '<div class="mut tiny">—</div>'); });
  var un = e.g.filter(function(g){ return g.st !== "no" && !s.at[g.id]; }); if(un.length) h += '<div class="stLh un"><b>⚠ ' + L("Belum ada meja", "No table yet") + '</b><span>' + un.reduce(function(a, g){ return a + gpax(g); }, 0) + '</span></div>' + un.map(function(x){ return row(x, 0, 1); }).join("");
  return h + '<div class="mut tiny">' + L("▲▼ susun nama · − ＋ tambah orang (pax) · pilih meja untuk pindah", "▲▼ reorder names · − ＋ extra people (pax) · pick a table to move") + '</div></div>'; }
function toM(svgEl, ev){ var r = svgEl.getBoundingClientRect(), vb = svgEl.viewBox.baseVal; return [vb.x + (ev.clientX - r.left) / r.width * vb.width, vb.y + (ev.clientY - r.top) / r.height * vb.height]; }
function freeSpot(s){ for(var y = 1; y < s.l - 1; y += 2.6) for(var x = 0.5; x < s.w - 1.5; x += 2.6){ var hit = s.items.some(function(i){ var z = size(i), w = i.r ? z[1] : z[0], h = i.r ? z[0] : z[1]; return x < i.x + w + 0.6 && x + 1.8 > i.x - 0.6 && y < i.y + h + 0.6 && y + 1.8 > i.y - 0.6; }); if(!hit) return [x, y]; } return [0.5, 0.5]; }
// whole parties in order: coming first, then no reply; family groups together; the table with the most room that fits, else any with room
function auto(e){ var s = S(e), T = tables(s), n = 0, free = {}; T.forEach(function(t){ free[t.id] = t.seats - used(e, t); });
  var list = e.g.filter(function(g){ return g.st !== "no" && !(s.at[g.id] && free[s.at[g.id]] != null); }).sort(function(a, b){ return (a.st === "yes" ? 0 : 1) - (b.st === "yes" ? 0 : 1) || String(a.grp || "").localeCompare(String(b.grp || "")) || gpax(b) - gpax(a); });
  var gNeed = {}; list.forEach(function(g){ if(g.grp) gNeed[g.grp] = (gNeed[g.grp] || 0) + gpax(g); });
  // the first of a family group takes a table with room for the whole group (if there is one), the rest join it
  var lastGrp = {}, fit = function(need){ var best = null; T.forEach(function(t){ if(free[t.id] >= need && (!best || free[t.id] < free[best])) best = t.id; }); return best; },
    pick = function(g){ var need = gpax(g), pref = lastGrp[g.grp || ""]; if(pref && free[pref] >= need) return pref; if(g.grp && !pref){ var whole = fit(gNeed[g.grp]); if(whole) return whole; } return fit(need); };
  list.forEach(function(g){ var t = pick(g); if(!t) return; s.at[g.id] = t; free[t] -= gpax(g); if(g.grp) lastGrp[g.grp] = t; n++; }); return n; }
function seatSheet(e, t, redraw){ var s = S(e);
  var body = function(){ var here = seated(e, t), others = e.g.filter(function(g){ return g.st !== "no" && s.at[g.id] !== t.id; });
    return '<div class="mut small">' + used(e, t) + ' / ' + t.seats + ' ' + L("kerusi", "seats") + (used(e, t) > t.seats ? ' · <b style="color:#e0705f">' + L("terlebih!", "over!") + '</b>' : '') + '</div>' +
      '<div class="plQ">🪑 ' + L("Di meja ini", "At this table") + '</div>' + (here.length ? here.map(function(g){ return '<div class="stG"><span>' + E(g.n) + ' <small class="mut">· ' + gpax(g) + '</small></span><button class="chip" data-out="' + g.id + '">✕</button></div>'; }).join("") : '<div class="mut small">—</div>') +
      '<div class="plQ">＋ ' + L("Tambah", "Add") + '</div>' + (others.length ? others.map(function(g){ var at = s.at[g.id] && tables(s).filter(function(x){ return x.id === s.at[g.id]; })[0];
        return '<button class="stG add" data-in="' + g.id + '"><span>' + E(g.n) + ' <small class="mut">· ' + gpax(g) + (g.st === "yes" ? " ✓" : "") + (at ? " · " + E(at.name) : "") + '</small></span><b>＋</b></button>'; }).join("") : '<div class="mut small">' + L("Semua tetamu sudah ada meja.", "All guests have a table.") + '</div>'); };
  var ov = C.H.showSheet("🪑 " + E(t.name), '<div id="stSb">' + body() + '</div>'), bind = function(){ var b = ov.querySelector("#stSb");
    b.querySelectorAll("[data-in]").forEach(function(x){ x.onclick = function(){ s.at[x.getAttribute("data-in")] = t.id; C.sv(); b.innerHTML = body(); bind(); }; });
    b.querySelectorAll("[data-out]").forEach(function(x){ x.onclick = function(){ delete s.at[x.getAttribute("data-out")]; C.sv(); b.innerHTML = body(); bind(); }; }); };
  bind(); ov._close = function(){ C.H.closeOverlay(); redraw(); }; ov.querySelector("#shX").onclick = ov._close; }
function listText(e){ var s = S(e), out = ["🪑 " + (e.n || L("Majlis", "Event")) + " · " + L("Susunan meja", "Seating")];
  tables(s).forEach(function(t){ var g = seated(e, t); out.push("", "▪ " + t.name + " (" + used(e, t) + "/" + t.seats + ")"); g.forEach(function(x){ out.push("  - " + x.n + (gpax(x) > 1 ? " (" + gpax(x) + ")" : "")); }); });
  var un = e.g.filter(function(g){ return g.st !== "no" && !s.at[g.id]; }); if(un.length){ out.push("", "⚠ " + L("Belum ada meja", "No table yet") + ":"); un.forEach(function(x){ out.push("  - " + x.n); }); }
  return out.join("\n"); }
function share(e){ var t = listText(e), N = C.H.N; if(N && N.shareText) N.shareText(t); else { try{ navigator.clipboard.writeText(t); }catch(x){} C.H.toast(L("Disalin", "Copied")); } }
// a landscape A4 PDF: the plan on page 1, the table list on page 2
function pdf(e){ var s = S(e), W = 1754, Hh = 1240, img = new Image(), x = null, H = C.H;
  img.onload = function(){ var p1 = document.createElement("canvas"); p1.width = W; p1.height = Hh; x = p1.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, W, Hh); x.fillStyle = "#111"; x.font = "700 40px sans-serif"; x.fillText("🪑 " + (e.n || "") + " · " + s.w + " × " + s.l + " m", 60, 80);
    var k = Math.min((W - 120) / img.width, (Hh - 160) / img.height); x.drawImage(img, 60, 120, img.width * k, img.height * k);
    var p2 = document.createElement("canvas"); p2.width = W; p2.height = Hh; var y = p2.getContext("2d"); y.fillStyle = "#fff"; y.fillRect(0, 0, W, Hh); y.fillStyle = "#111"; var col = 0, yy = 80, lines = listText(e).split("\n");
    lines.forEach(function(ln){ y.font = (/^▪|^🪑|^⚠/.test(ln) ? "700 " : "") + "26px sans-serif"; if(yy > Hh - 60){ col++; yy = 80; } y.fillText(ln, 60 + col * 560, yy); yy += 36; });
    var b64 = H.canvasPdf([p1, p2], 297, 210, 0.9); H.sharePdf("susun-meja.pdf", b64, e.n || ""); };
  var str = svg(e, {print:true}), vb = (str.match(/viewBox="([^"]+)"/) || [])[1].split(" "), ar = +vb[2] / +vb[3], w = 1600, h = Math.round(w / ar);
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(str.replace("<svg ", '<svg width="' + w + '" height="' + h + '" ')); }
window.EvSeat = {page:page, _t:{auto:auto, listText:listText, S:S, used:used}};
})();
