/* My Ihsan 0.5.97 (owner): Kewangan › Belanja (Expense tracker), Finance level 3.
   - Money in / money out with a category, payment method, date and note; repeat monthly (rent, salary) is added automatically each month.
   - 📷 Scan a receipt: the online AI (Gemini by default, Settings › Online AI) reads the shop, date, total and category, then you check and save.
   - 🏦 Bank statement: a PDF (pages turned into pictures with the bundled pdf.js) or photos; the AI lists every transaction, you tick which
     to import (already-recorded ones are unticked) and they are added in one go.
   - Three pages you swipe through (the same Finance swipe: at the last page it carries on to the next Finance tab):
     Transactions (by day, search, filter) › Month (in/out/balance, spending by category with budgets, day-by-day bars) › Year (12 months, top categories).
   - Budgets per category, CSV export. Everything stays on this phone; only the picture goes to the AI you chose.
   FinMore.belanja(el, A) ; ExpenseView.canPage(sd) / turn(sd) for the Finance swipe. */
(function(){ "use strict";
var H = null, root = null, KEY = "ihsan_expense", ST = {page:0, ym:null, f:"all", q:""}, busy = "";
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
var OUT = [["food","🍽️","Makan","Food"],["groc","🛒","Barang dapur","Groceries"],["trans","🚗","Pengangkutan","Transport"],["fuel","⛽","Minyak & tol","Fuel & toll"],
  ["bills","💡","Bil utiliti","Bills"],["home","🏠","Rumah & sewa","Home & rent"],["phone","📱","Telefon & internet","Phone & internet"],["shop","🛍️","Membeli-belah","Shopping"],
  ["health","💊","Kesihatan","Health"],["edu","🎓","Pendidikan","Education"],["family","👨‍👩‍👧","Keluarga","Family"],["give","🤲","Sedekah & zakat","Charity & zakat"],
  ["fun","🎬","Hiburan","Leisure"],["travel","✈️","Pelancongan","Travel"],["takaful","🛡️","Takaful & insurans","Takaful"],["other","📦","Lain-lain","Other"]];
var IN = [["salary","💼","Gaji","Salary"],["biz","🏪","Perniagaan","Business"],["gift","🎁","Hadiah","Gift"],["refund","↩️","Bayaran balik","Refund"],["invest","📈","Pelaburan","Investment"],["inother","💰","Lain-lain","Other income"]];
var PAY = [["cash","💵","Tunai","Cash"],["card","💳","Kad","Card"],["ewallet","📲","e-Dompet","e-Wallet"],["bank","🏦","Bank","Bank"]];
var MON = [["Jan","Jan"],["Feb","Feb"],["Mac","Mar"],["Apr","Apr"],["Mei","May"],["Jun","Jun"],["Jul","Jul"],["Ogo","Aug"],["Sep","Sep"],["Okt","Oct"],["Nov","Nov"],["Dis","Dec"]];
var PAL = ["#e07a5f","#3d9970","#f2cc8f","#81b29a","#4f7bff","#c0573a","#8a4fc0","#1f8aa8","#c23a7a","#b8862b","#5a7a2a","#2fa69a","#d4a73a","#6b8cce","#a0522d","#888"];
// ---------- data ----------
function db(){ var d = H.load(KEY, null) || {}; d.tx = d.tx || []; d.bud = d.bud || {}; d.cur = d.cur || (H.cur ? H.cur() : "RM"); return d; }
function save(d){ H.save(KEY, d); }
function rid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function c2(n){ return Math.round((+String(n).replace(/[^0-9.\-]/g, "") || 0) * 100); }
function money(c, cur){ var neg = c < 0; c = Math.abs(Math.round(c)); return (neg ? "−" : "") + (cur || db().cur) + " " + Math.floor(c / 100).toLocaleString("en") + "." + ("0" + (c % 100)).slice(-2); }
function catOf(id){ return OUT.concat(IN).filter(function(c){ return c[0] === id; })[0] || ["other","📦","Lain-lain","Other"]; }
function cname(c){ return L(c[2], c[3]); }
function ymName(ym){ var p = ym.split("-"); return L(MON[+p[1] - 1][0], MON[+p[1] - 1][1]) + " " + p[0]; }
function shiftYm(ym, k){ var p = ym.split("-"), d = new Date(+p[0], +p[1] - 1 + k, 1); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2); }
// repeat monthly: add the copies that are due, up to this month
function recurring(){ var d = db(), now = ymd().slice(0, 7), add = 0;
  d.tx.filter(function(t){ return t.rep; }).forEach(function(t){ var last = t.repLast || t.date.slice(0, 7), day = t.date.slice(8, 10);
    while(last < now){ last = shiftYm(last, 1); var dd = Math.min(+day, new Date(+last.slice(0, 4), +last.slice(5, 7), 0).getDate());
      d.tx.push({id:rid(), t:t.t, amt:t.amt, cat:t.cat, note:t.note, pay:t.pay, date:last + "-" + ("0" + dd).slice(-2), src:"repeat", from:t.id}); add++; }
    t.repLast = last; });
  if(add) save(d); }
// ---------- view ----------
function sums(list){ var i = 0, o = 0; list.forEach(function(t){ if(t.t === "in") i += t.amt; else o += t.amt; }); return {i:i, o:o, n:i - o}; }
function draw(){ if(!root) return; C3 = []; var d = db(), ym = ST.ym, inM = d.tx.filter(function(t){ return t.date.slice(0, 7) === ym; }), s = sums(inM);
  var tabs = [["📋", L("Transaksi", "Transactions")], ["📊", L("Bulan", "Month")], ["📅", L("Tahun", "Year")]];
  var h = '<div class="card exHead"><div class="exNav"><button class="chip g3d" data-ym="-1" aria-label="‹">‹</button><b>' + (ST.page === 2 ? ym.slice(0, 4) : ymName(ym)) + '</b><button class="chip g3d" data-ym="1" aria-label="›">›</button></div>';
  var S = ST.page === 2 ? sums(d.tx.filter(function(t){ return t.date.slice(0, 4) === ym.slice(0, 4); })) : s;
  h += '<div class="exSum"><div><small>' + L("Masuk", "In") + '</small><b class="exIn">' + money(S.i, d.cur) + '</b></div><div><small>' + L("Keluar", "Out") + '</small><b class="exOut">' + money(S.o, d.cur) + '</b></div><div><small>' + L("Baki", "Balance") + '</small><b class="' + (S.n < 0 ? 'exOut' : 'exIn') + '">' + money(S.n, d.cur) + '</b></div></div>';
  h += '<div class="exAct"><button class="btn g3d exBO" data-add="out">➖ ' + L("Wang keluar", "Money out") + '</button><button class="btn g3d exBI" data-add="in">➕ ' + L("Wang masuk", "Money in") + '</button>' +
    '<button class="btn alt g3d" id="exScan">📷 ' + L("Imbas resit", "Scan receipt") + '</button><button class="btn alt g3d" id="exStmt">🏦 ' + L("Penyata bank", "Bank statement") + '</button></div>' +
    (window.AIRun ? '<div class="aiBtnRow" style="margin-top:8px">' + AIRun.btn("receipt") + '</div>' : '') +
    (busy ? '<div class="exWait"><span class="exSpin"></span>' + E(busy) + '</div>' + (window.AIRun ? AIRun.card("receipt") : '') : '') + '</div>';
  h += '<div class="exTabs">' + tabs.map(function(t, i){ return '<button class="chip g3d' + (ST.page === i ? ' on' : '') + '" data-pg="' + i + '">' + t[0] + ' ' + t[1] + '</button>'; }).join("") + '</div>' +
    '<div class="exDots">' + tabs.map(function(_, i){ return '<i class="' + (ST.page === i ? 'on' : '') + '"></i>'; }).join("") + '<small>' + L("Leret untuk halaman seterusnya", "Swipe for the next page") + '</small></div>';
  h += ST.page === 0 ? pageList(d, inM) : ST.page === 1 ? pageMonth(d, inM, s) : pageYear(d);
  h += '<div class="exFoot"><button class="chip g3d" id="exCsv">📤 ' + L("Eksport CSV", "Export CSV") + '</button><button class="chip g3d" id="exCur">' + E(d.cur) + ' ' + L("mata wang", "currency") + '</button></div>' +
    '<div class="mut tiny" style="padding:4px 4px 20px">' + L("Semua data disimpan di telefon ini sahaja. Gambar resit atau penyata dihantar hanya kepada AI yang dipilih dalam Tetapan › AI dalam talian, dan tidak disimpan.", "Everything stays on this phone. Receipt and statement pictures go only to the AI chosen in Settings › Online AI, and are not stored.") + '</div>';
  root.innerHTML = h; bind(); paintAll(); }
function row(t, cur){ var c = catOf(t.cat), p = PAY.filter(function(x){ return x[0] === t.pay; })[0];
  return '<button class="exRow" data-tx="' + t.id + '"><span class="exI">' + c[1] + '</span><span class="exT"><b>' + E(t.note || cname(c)) + '</b><small>' + E(cname(c)) + (p ? ' · ' + p[1] + ' ' + E(L(p[2], p[3])) : '') + (t.rep ? ' · 🔁' : '') + (t.src === "receipt" ? ' · 📷' : t.src === "statement" ? ' · 🏦' : '') + '</small></span><b class="' + (t.t === "in" ? 'exIn' : 'exOut') + '">' + (t.t === "in" ? '+' : '−') + money(t.amt, cur).replace(/^−/, "") + '</b></button>'; }
function pageList(d, inM){ var q = ST.q.toLowerCase(), L2 = inM.filter(function(t){ return (ST.f === "all" || t.t === ST.f) && (!q || (t.note + " " + cname(catOf(t.cat))).toLowerCase().indexOf(q) >= 0); });
  L2.sort(function(a, b){ return b.date.localeCompare(a.date) || (b.id > a.id ? 1 : -1); });
  var h = '<div class="exTools"><input type="search" id="exQ" class="rin" placeholder="🔍 ' + L("Cari", "Search") + '" value="' + E(ST.q) + '"><div class="exF">' + [["all", L("Semua", "All")], ["out", L("Keluar", "Out")], ["in", L("Masuk", "In")]].map(function(f){ return '<button class="chip g3d' + (ST.f === f[0] ? ' on' : '') + '" data-f="' + f[0] + '">' + f[1] + '</button>'; }).join("") + '</div></div>';
  if(!L2.length) return h + '<div class="card mut small">' + (inM.length ? L("Tiada padanan.", "Nothing matches.") : L("Belum ada rekod bulan ini. Tambah wang keluar atau masuk, imbas resit, atau baca penyata bank.", "Nothing recorded this month yet. Add money out or in, scan a receipt, or read a bank statement.")) + '</div>';
  var days = {}; L2.forEach(function(t){ (days[t.date] = days[t.date] || []).push(t); });
  return h + Object.keys(days).sort().reverse().map(function(k){ var ds = sums(days[k]), dt = new Date(k + "T12:00");
    return '<div class="exDay"><div class="exDH"><b>' + dt.toLocaleDateString(ibLoc(H.en()), {weekday:"short", day:"numeric", month:"short"}) + '</b><small>' + (ds.o ? '−' + money(ds.o, d.cur).replace(/^−/, "") : '') + (ds.i ? ' · +' + money(ds.i, d.cur) : '') + '</small></div>' + days[k].map(function(t){ return row(t, d.cur); }).join("") + '</div>'; }).join(""); }
// ---------- 0.5.99 (owner): 3D charts for Month and Year (canvas, no library; they grow in when the page opens) ----------
var C3 = [];
function c3(spec){ C3.push(spec); return '<canvas class="ex3d ex3d-' + spec.k + '" data-c3="' + (C3.length - 1) + '"></canvas>'; }
function shade(hex, f){ var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255, m = function(v){ return Math.max(0, Math.min(255, Math.round(f < 1 ? v * f : v + (255 - v) * (f - 1)))); }; return "rgb(" + m(r) + "," + m(g) + "," + m(b) + ")"; }
function paint3d(cv, sp, t){ var dpr = window.devicePixelRatio || 1, w = cv.clientWidth || 300, hh = cv.clientHeight || 180; if(cv.width !== Math.round(w * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr); }
  var x = cv.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, hh);
  var ink = getComputedStyle(cv).color || "#ccc", e = 1 - Math.pow(1 - Math.min(1, t), 3);
  if(sp.k === "pie"){ // tilted donut: layers from the bottom up give the side walls
    var tot = sp.parts.reduce(function(a, p){ return a + p[1]; }, 0); if(!tot) return;
    var cx = w / 2, cy = hh / 2 - 8, rx = Math.min(w / 2 - 10, 150), ry = rx * 0.52, ir = 0.52, dep = Math.round(rx * 0.16), A0 = -Math.PI / 2;
    var ring = function(y0, a, b, col){ x.beginPath(); x.ellipse(cx, y0, rx, ry, 0, a, b); x.ellipse(cx, y0, rx * ir, ry * ir, 0, b, a, true); x.closePath(); x.fillStyle = col; x.fill(); };
    var sweep = Math.PI * 2 * e;
    for(var k = dep; k >= 0; k--){ var a = A0; sp.parts.forEach(function(p){ var s = p[1] / tot * sweep; if(s > 0.002) ring(cy + k, a, a + s, k ? shade(p[2], 0.62) : p[2]); a += s; }); }
    // a soft highlight on the top
    var gr = x.createLinearGradient(0, cy - ry, 0, cy + ry); gr.addColorStop(0, "rgba(255,255,255,.22)"); gr.addColorStop(1, "rgba(255,255,255,0)"); ring(cy, 0, Math.PI * 2, gr);
    // percentage on big slices
    if(e > 0.95){ var a2 = A0; x.font = "bold 11px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
      sp.parts.forEach(function(p){ var s = p[1] / tot * Math.PI * 2, m = a2 + s / 2, pc = Math.round(p[1] * 100 / tot); if(pc >= 7){ var lx = cx + Math.cos(m) * rx * 0.76, ly = cy + Math.sin(m) * ry * 0.76; x.fillStyle = "rgba(0,0,0,.45)"; x.fillText(pc + "%", lx + 0.8, ly + 0.8); x.fillStyle = "#fff"; x.fillText(pc + "%", lx, ly); } a2 += s; }); }
    x.textAlign = "center"; x.fillStyle = ink; x.font = "11px sans-serif"; x.globalAlpha = .75; x.fillText(sp.lab, cx, cy - 7); x.globalAlpha = 1; x.font = "bold 14px sans-serif"; x.fillText(sp.mid, cx, cy + 9);
    return; }
  // bars: an isometric floor, then each bar as a box (front, side, top)
  var n = sp.v.length, ser = sp.v[0].length, padL = 6, padR = 22, padB = 10, padT = 18, dx = 10, dy = 7;
  var floorY = hh - padB, slot = (w - padL - padR) / n, bw = Math.max(2, slot * (ser > 1 ? 0.34 : 0.62)), gap = ser > 1 ? bw * 0.15 : 0, ox = (slot - (bw * ser + gap * (ser - 1))) / 2;
  var mx = 0; sp.v.forEach(function(r){ r.forEach(function(v){ if(v > mx) mx = v; }); }); if(!mx) mx = 1;
  var Hm = floorY - padT - dy;
  x.fillStyle = "rgba(127,127,127,.12)"; x.beginPath(); x.moveTo(padL, floorY); x.lineTo(w - padR, floorY); x.lineTo(w - padR + dx, floorY - dy); x.lineTo(padL + dx, floorY - dy); x.closePath(); x.fill();
  x.strokeStyle = "rgba(127,127,127,.22)"; x.lineWidth = 1; for(var g = 1; g <= 3; g++){ var gy = floorY - dy - Hm * g / 3; x.beginPath(); x.moveTo(padL + dx, gy); x.lineTo(w - padR + dx, gy); x.stroke(); }
  sp.v.forEach(function(r, i){ r.forEach(function(v, j){ var col = sp.col[j], bh = Math.max(v ? 2 : 0.5, v / mx * Hm * e), bx = padL + i * slot + ox + j * (bw + gap), by = floorY - bh, sel = sp.sel === i;
    var bdx = Math.min(dx, bw * 0.8), bdy = bdx * 0.7;
    x.fillStyle = shade(col, sel ? 1.15 : 1); x.fillRect(bx, by, bw, bh);
    x.fillStyle = shade(col, 0.68); x.beginPath(); x.moveTo(bx + bw, by); x.lineTo(bx + bw + bdx, by - bdy); x.lineTo(bx + bw + bdx, floorY - bdy); x.lineTo(bx + bw, floorY); x.closePath(); x.fill();
    x.fillStyle = shade(col, 1.35); x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + bdx, by - bdy); x.lineTo(bx + bw + bdx, by - bdy); x.lineTo(bx + bw, by); x.closePath(); x.fill(); }); });
  if(sp.peak != null && e > 0.95){ var pi = sp.peak, pv = sp.v[pi][0]; if(pv){ var px = padL + pi * slot + slot / 2, py = floorY - pv / mx * Hm - dy - 4; x.fillStyle = ink; x.font = "bold 10px sans-serif"; x.textAlign = "center"; x.fillText(sp.peakLab, Math.min(w - 30, Math.max(24, px)), Math.max(10, py)); } } }
function paintAll(){ var cs = root ? root.querySelectorAll("canvas[data-c3]") : []; if(!cs.length) return; var t0 = null;
  var step = function(ts){ if(t0 === null) t0 = ts; var t = (ts - t0) / 650; [].forEach.call(cs, function(cv){ var sp = C3[+cv.getAttribute("data-c3")]; if(sp && cv.isConnected) paint3d(cv, sp, t); }); if(t < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step); }
function donut(parts){ var tot = parts.reduce(function(a, p){ return a + p[1]; }, 0); if(!tot) return ''; var R = 54, C = 2 * Math.PI * R, off = 0;
  return '<svg viewBox="0 0 140 140" class="exDonut">' + parts.map(function(p, i){ var len = p[1] / tot * C, s = '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="' + p[2] + '" stroke-width="20" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 70 70)"/>'; off += len; return s; }).join("") + '</svg>'; }
function pageMonth(d, inM, s){ var by = {}; inM.filter(function(t){ return t.t !== "in"; }).forEach(function(t){ by[t.cat] = (by[t.cat] || 0) + t.amt; });
  var cats = OUT.map(function(c, i){ return [c, by[c[0]] || 0, PAL[i % PAL.length]]; }).filter(function(x){ return x[1] || d.bud[x[0][0]]; }).sort(function(a, b){ return b[1] - a[1]; });
  var h = '<div class="card"><h3>📊 ' + L("Perbelanjaan ikut kategori", "Spending by category") + '</h3>';
  if(!s.o) h += '<div class="mut small">' + L("Tiada perbelanjaan bulan ini.", "No spending this month.") + '</div>';
  else h += c3({k:"pie", parts:cats.filter(function(x){ return x[1]; }).map(function(x){ return [x[0], x[1], x[2]]; }), lab:L("Keluar", "Out"), mid:money(s.o, d.cur)});
  h += cats.map(function(x){ var b = d.bud[x[0][0]] || 0, pc = b ? Math.min(100, Math.round(x[1] * 100 / b)) : (s.o ? Math.round(x[1] * 100 / s.o) : 0), over = b && x[1] > b;
    return '<button class="exCat" data-bud="' + x[0][0] + '"><span class="exI" style="background:' + x[2] + '33">' + x[0][1] + '</span><span class="exT"><b>' + E(cname(x[0])) + '</b><span class="exBar"><i style="width:' + pc + '%;background:' + (over ? '#c8413b' : x[2]) + '"></i></span><small>' +
      (b ? money(x[1], d.cur) + ' / ' + money(b, d.cur) + ' ' + L("bajet", "budget") + (over ? ' · ⚠️ ' + L("lebih ", "over by ") + money(x[1] - b, d.cur) : ' · ' + money(b - x[1], d.cur) + ' ' + L("lagi", "left")) : pc + '% · ' + L("ketik untuk letak bajet", "tap to set a budget")) + '</small></span><b>' + money(x[1], d.cur) + '</b></button>'; }).join("");
  h += '<button class="chip g3d" id="exBudAll" style="margin-top:8px">🎯 ' + L("Letak bajet kategori", "Set a category budget") + '</button></div>';
  // day by day
  var p = ST.ym.split("-"), nd = new Date(+p[0], +p[1], 0).getDate(), per = []; for(var i = 1; i <= nd; i++) per.push(0);
  inM.forEach(function(t){ if(t.t !== "in") per[+t.date.slice(8, 10) - 1] += t.amt; }); var mx = Math.max.apply(null, per.concat([1]));
  h += '<div class="card"><h3>📆 ' + L("Setiap hari", "Day by day") + '</h3>' + c3({k:"bars", v:per.map(function(v){ return [v]; }), col:["#e07a5f"], peak:per.indexOf(Math.max.apply(null, per)), peakLab:money(Math.max.apply(null, per), d.cur)}) + '<div class="exDaysL"><small>1</small><small>' + Math.ceil(nd / 2) + '</small><small>' + nd + '</small></div>' +
    '<div class="mut small">' + L("Purata sehari: ", "Daily average: ") + money(s.o / nd, d.cur) + ' · ' + L("Hari paling tinggi: ", "Highest day: ") + (per.indexOf(Math.max.apply(null, per)) + 1) + '</div></div>';
  return h; }
function pageYear(d){ var y = ST.ym.slice(0, 4), m = []; for(var i = 0; i < 12; i++) m.push({i:0, o:0});
  var by = {}; d.tx.filter(function(t){ return t.date.slice(0, 4) === y; }).forEach(function(t){ var k = +t.date.slice(5, 7) - 1; if(t.t === "in") m[k].i += t.amt; else { m[k].o += t.amt; by[t.cat] = (by[t.cat] || 0) + t.amt; } });
  var mx = Math.max.apply(null, m.map(function(x){ return Math.max(x.i, x.o); }).concat([1]));
  var h = '<div class="card"><h3>📅 ' + L("Tahun ", "Year ") + y + '</h3>' + c3({k:"bars", v:m.map(function(x){ return [x.i, x.o]; }), col:["#3fb37f", "#e07a5f"], sel:+ST.ym.slice(5, 7) - 1}) + '<div class="exYr exYr3">' + m.map(function(x, k){ return '<button class="exYm' + (y + "-" + ("0" + (k + 1)).slice(-2) === ST.ym ? ' on' : '') + '" data-mo="' + k + '"><small>' + E(L(MON[k][0], MON[k][1])) + '</small></button>'; }).join("") + '</div>' +
    '<div class="exLeg"><span><i class="exYi"></i>' + L("Masuk", "In") + '</span><span><i class="exYo"></i>' + L("Keluar", "Out") + '</span></div></div>';
  var top = OUT.map(function(c, i){ return [c, by[c[0]] || 0, PAL[i % PAL.length]]; }).filter(function(x){ return x[1]; }).sort(function(a, b){ return b[1] - a[1]; }), tot = top.reduce(function(a, x){ return a + x[1]; }, 0);
  h += '<div class="card"><h3>🏷️ ' + L("Kategori utama tahun ini", "Top categories this year") + '</h3>' + (top.length ? top.slice(0, 8).map(function(x){ return '<div class="exTop"><span>' + x[0][1] + ' ' + E(cname(x[0])) + '</span><span class="exBar"><i style="width:' + Math.round(x[1] * 100 / tot) + '%;background:' + x[2] + '"></i></span><b>' + money(x[1], d.cur) + '</b></div>'; }).join("") : '<div class="mut small">' + L("Tiada perbelanjaan tahun ini.", "No spending this year.") + '</div>') + '</div>';
  h += '<div class="card"><h3>🧾 ' + L("Ikut bulan", "Month by month") + '</h3><div class="exTbl">' + m.map(function(x, k){ if(!x.i && !x.o) return ''; return '<div><span>' + E(L(MON[k][0], MON[k][1])) + '</span><span class="exIn">+' + money(x.i, d.cur) + '</span><span class="exOut">−' + money(x.o, d.cur).replace(/^−/, "") + '</span><b class="' + (x.i - x.o < 0 ? 'exOut' : 'exIn') + '">' + money(x.i - x.o, d.cur) + '</b></div>'; }).join("") + '</div></div>';
  return h; }
// ---------- add / edit ----------
function form(tx, pre){ var d = db(), isNew = !tx, t = tx || Object.assign({id:rid(), t:"out", amt:0, cat:"food", note:"", pay:"card", date:ymd(), src:"manual"}, pre || {});
  var catsHtml = function(){ return (t.t === "in" ? IN : OUT).map(function(c){ return '<button class="exCc' + (t.cat === c[0] ? ' on' : '') + '" data-c="' + c[0] + '"><span>' + c[1] + '</span><small>' + E(cname(c)) + '</small></button>'; }).join(""); };
  var ov = H.showSheet((isNew ? "＋ " : "✏️ ") + (t.t === "in" ? L("Wang masuk", "Money in") : L("Wang keluar", "Money out")),
    (t.img ? '<img class="exPv" src="' + t.img + '" alt="">' : '') +
    '<div class="exTT"><button class="chip g3d" data-tt="out">➖ ' + L("Keluar", "Out") + '</button><button class="chip g3d" data-tt="in">➕ ' + L("Masuk", "In") + '</button></div>' +
    '<div class="exAmt"><span>' + E(d.cur) + '</span><input id="exA" inputmode="decimal" placeholder="0.00" value="' + (t.amt ? (t.amt / 100).toFixed(2) : '') + '"></div>' +
    '<input id="exN" class="rin" placeholder="' + L("Nota (cth. Nasi lemak, Tesco)", "Note (e.g. Nasi lemak, Tesco)") + '" value="' + E(t.note) + '">' +
    '<div class="exCg" id="exCg">' + catsHtml() + '</div>' +
    '<div class="exPay">' + PAY.map(function(p){ return '<button class="chip g3d' + (t.pay === p[0] ? ' on' : '') + '" data-p="' + p[0] + '">' + p[1] + ' ' + E(L(p[2], p[3])) + '</button>'; }).join("") + '</div>' +
    '<div class="exDR"><input type="date" id="exD" class="rin" value="' + t.date + '"><label class="exRep"><input type="checkbox" id="exR"' + (t.rep ? ' checked' : '') + '> 🔁 ' + L("Ulang setiap bulan", "Repeat monthly") + '</label></div>' +
    '<div class="btns"><button class="btn gold g3d" id="exSave" style="flex:1">' + L("Simpan", "Save") + '</button>' + (isNew ? '' : '<button class="btn alt g3d" id="exDel">🗑️</button>') + '</div>');
  var q = function(s){ return ov.querySelector(s); }, mark = function(){ ov.querySelectorAll("[data-tt]").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-tt") === t.t); }); };
  var bindC = function(){ ov.querySelectorAll("[data-c]").forEach(function(b){ b.onclick = function(){ t.cat = b.getAttribute("data-c"); ov.querySelectorAll("[data-c]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; }); };
  mark(); bindC();
  ov.querySelectorAll("[data-tt]").forEach(function(b){ b.onclick = function(){ t.t = b.getAttribute("data-tt"); if((t.t === "in") !== IN.some(function(c){ return c[0] === t.cat; })) t.cat = t.t === "in" ? "salary" : "food"; q("#exCg").innerHTML = catsHtml(); bindC(); mark(); }; });
  ov.querySelectorAll("[data-p]").forEach(function(b){ b.onclick = function(){ t.pay = b.getAttribute("data-p"); ov.querySelectorAll("[data-p]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; });
  q("#exSave").onclick = function(){ var a = c2(q("#exA").value); if(!a){ H.toast(L("Masukkan jumlah", "Enter an amount")); q("#exA").focus(); return; }
    t.amt = Math.abs(a); t.note = q("#exN").value.trim(); t.date = q("#exD").value || ymd(); t.rep = q("#exR").checked; if(t.rep && !t.repLast) t.repLast = t.date.slice(0, 7); delete t.img;
    var dd = db(), i = dd.tx.map(function(x){ return x.id; }).indexOf(t.id); if(i >= 0) dd.tx[i] = t; else dd.tx.push(t); save(dd); H.closeOverlay();
    ST.ym = t.date.slice(0, 7); H.toast("✓ " + L("Disimpan", "Saved")); draw(); };
  if(q("#exDel")) q("#exDel").onclick = function(){ var b = q("#exDel"); if(!b.classList.contains("sure")){ b.classList.add("sure"); b.textContent = L("Ketik lagi untuk padam", "Tap again to delete"); return; }
    var dd = db(); dd.tx = dd.tx.filter(function(x){ return x.id !== t.id; }); save(dd); H.closeOverlay(); draw(); };
  if(isNew && !t.amt) setTimeout(function(){ try{ q("#exA").focus(); }catch(e){} }, 150); }
// ---------- AI ----------
function aiKey(){ try{ var c = JSON.parse(localStorage.getItem("ihsan_halal_ai") || "{}") || {}; return !!(c.keys && Object.keys(c.keys).some(function(k){ return c.keys[k]; })); }catch(e){ return false; } }
function keySheet(then){ var ov = H.showSheet("🔑 " + L("Hidupkan AI (percuma)", "Turn on the AI (free)"), '<ol class="exKey"><li>' + L("Buka Google AI Studio:", "Open Google AI Studio:") + ' <button class="chip g3d" id="exKG">🌐 aistudio.google.com/apikey</button></li><li>' +
    L("Log masuk dengan akaun Google, ketik <b>Create API key</b>, kemudian <b>Copy</b>.", "Sign in with your Google account, tap <b>Create API key</b>, then <b>Copy</b>.") + '</li><li>' + L("Tampal di sini:", "Paste it here:") + '<input id="exKI" class="rin" placeholder="AIza…" autocomplete="off"></li></ol><button class="btn gold full g3d" id="exKS">' + L("Simpan dan teruskan", "Save and continue") + '</button>');
  ov.querySelector("#exKG").onclick = function(){ var u = "https://aistudio.google.com/apikey"; if(window.Native && H.N.openWeb) H.N.openWeb(u, "Google AI Studio"); else if(H.N.openUrl) H.N.openUrl(u); else window.open(u, "_blank"); };
  ov.querySelector("#exKS").onclick = function(){ var k = ov.querySelector("#exKI").value.trim(); if(!/^AIza[\w-]{20,}$/.test(k)){ H.toast(L("Kunci Google bermula dengan AIza…", "A Google key starts with AIza…")); return; }
    try{ var c = JSON.parse(localStorage.getItem("ihsan_halal_ai") || "{}") || {}; c.prov = "gemini"; c.on = true; c.keys = c.keys || {}; c.keys.gemini = k; localStorage.setItem("ihsan_halal_ai", JSON.stringify(c)); }catch(e){}
    H.closeOverlay(); H.toast("✓ " + L("AI dihidupkan", "AI turned on")); then(); }; }
function needAI(cb){ var go = function(){ if(window.HalalAI){ cb(); return; } var s = document.createElement("script"); s.src = "halal/halal_ai.js"; s.onload = cb; s.onerror = function(){ H.toast(L("AI tidak dapat dimuatkan", "Could not load the AI")); }; document.head.appendChild(s); };
  if(aiKey()) go(); else keySheet(go); }
function parseJson(t){ var m = String(t || "").replace(/```json|```/g, "").match(/[\[{][\s\S]*[\]}]/); if(!m) return null; try{ return JSON.parse(m[0]); }catch(e){ return null; } }
function shrink(url, max, q){ return new Promise(function(res){ var im = new Image(); im.onload = function(){ var k = Math.min(1, (max || 1600)/Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(im.naturalWidth*k); c.height = Math.round(im.naturalHeight*k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", q || 0.85)); }; im.onerror = function(){ res(url); }; im.src = url; }); }
function pickImg(mode, cb){ var N = H.N;
  if(window.Native && N && N.pickImage){ var go = function(){ var h = function(r){ H.off("image", h); if(!r || r.cancel) return; if(r.error || !r.data){ H.toast(L("Gambar tidak dapat dibuka", "The image could not be opened")); return; } cb(r.data); }; H.on("image", h); N.pickImage(mode); };
    if(mode === "camera" && N.hasPerm && !N.hasPerm("camera")){ var hp = function(p){ if(!p || p.which !== "camera") return; H.off("perm", hp); if(p.granted) go(); }; H.on("perm", hp); N.requestPerm("camera"); } else go(); return; }
  var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; if(mode === "camera") inp.setAttribute("capture", "environment");
  inp.onchange = function(){ var f = inp.files && inp.files[0]; if(!f) return; var r = new FileReader(); r.onload = function(){ cb(r.result); }; r.readAsDataURL(f); }; inp.click(); }
var CATS_EN = OUT.map(function(c){ return c[0] + " (" + c[3] + ")"; }).join(", "), INC_EN = IN.map(function(c){ return c[0] + " (" + c[3] + ")"; }).join(", ");
function scanReceipt(){ var ov = H.showSheet("📷 " + L("Imbas resit", "Scan a receipt"), '<div class="btns"><button class="btn gold g3d" data-sm="camera" style="flex:1">📷 ' + L("Kamera", "Camera") + '</button><button class="btn alt g3d" data-sm="gallery" style="flex:1">🖼️ ' + L("Galeri", "Gallery") + '</button></div>');
  ov.querySelectorAll("[data-sm]").forEach(function(b){ b.onclick = function(){ H.closeOverlay(); needAI(function(){ pickImg(b.getAttribute("data-sm"), function(img){ busy = L("AI sedang membaca resit…", "The AI is reading the receipt…"); draw();
    shrink(img, 1600).then(function(u){ return window.HalalAI.complete([{role:"user", content:[{type:"text", text:"Read this receipt. Reply ONLY with JSON: {\"shop\": \"merchant name\", \"date\": \"YYYY-MM-DD or empty\", \"total\": 12.34 (the final amount paid, a number), \"category\": one of " + CATS_EN + " (use the id), \"payment\": cash|card|ewallet|bank or empty}."}, {type:"image_url", image_url:{url:u}}]}], 600, L, "", "receipt"); }).then(function(r){
      busy = ""; var j = parseJson(r.text); if(!j || !j.total) throw new Error(L("Jumlah tidak dijumpai. Cuba gambar yang lebih jelas.", "No total found. Try a clearer photo."));
      draw(); shrink(img, 320, 0.6).then(function(th){ form(null, {t:"out", amt:c2(j.total), note:String(j.shop || ""), cat:OUT.some(function(c){ return c[0] === j.category; }) ? j.category : "other",
        date:/^\d{4}-\d{2}-\d{2}$/.test(j.date || "") ? j.date : ymd(), pay:PAY.some(function(p){ return p[0] === j.payment; }) ? j.payment : "card", src:"receipt", img:th}); }); }).catch(function(e){ busy = ""; draw(); H.toast("⚠️ " + (e && e.message || e)); }); }); }); }; }); }
// bank statement: PDF (pages -> pictures) or photos
function pdfPages(b64){ var LIB = "books/lib/"; var ld = function(src){ return new Promise(function(res, rej){ if(src.indexOf("worker") < 0 && window.pdfjsLib){ res(); return; } var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); };
  return ld(LIB + "pdf.min.js").then(function(){ var P = window.pdfjsLib; P.GlobalWorkerOptions.workerSrc = LIB + "pdf.worker.min.js"; var raw = atob(b64), u8 = new Uint8Array(raw.length); for(var i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
    return P.getDocument({data:u8}).promise; }).then(function(doc){ var n = Math.min(doc.numPages, 8), out = [], chain = Promise.resolve();
    for(var k = 1; k <= n; k++) (function(k){ chain = chain.then(function(){ return doc.getPage(k); }).then(function(pg){ var vp = pg.getViewport({scale:1.6}), c = document.createElement("canvas"); c.width = vp.width; c.height = vp.height;
      return pg.render({canvasContext:c.getContext("2d"), viewport:vp}).promise.then(function(){ out.push(c.toDataURL("image/jpeg", 0.8)); }); }); })(k);
    return chain.then(function(){ return out; }); }); }
function statement(){ var ov = H.showSheet("🏦 " + L("Baca penyata bank", "Read a bank statement"), '<div class="small">' + L("Pilih PDF penyata bulanan (sehingga 8 muka surat) atau ambil gambar setiap muka surat. AI akan senaraikan setiap transaksi untuk anda semak.", "Choose your monthly statement PDF (up to 8 pages) or photograph each page. The AI lists every transaction for you to check.") + '</div>' +
    '<div class="btns" style="margin-top:10px"><button class="btn gold g3d" id="exPdf" style="flex:1">📄 ' + L("PDF atau gambar", "PDF or picture") + '</button><button class="btn alt g3d" id="exPh" style="flex:1">📷 ' + L("Ambil gambar", "Take photos") + '</button></div>');
  ov.querySelector("#exPdf").onclick = function(){ H.closeOverlay(); needAI(function(){ var N = H.N;
    if(window.Native && N && N.pickBin){ var h = function(r){ H.off("binfile", h); if(!r || r.cancel) return; if(r.error || !r.b64){ H.toast(L("Fail tidak dapat dibuka", "The file could not be opened")); return; }
      if(/pdf/.test(r.mime)){ busy = L("Membuka PDF…", "Opening the PDF…"); draw(); pdfPages(r.b64).then(readPages).catch(function(e){ busy = ""; draw(); H.toast("⚠️ " + (e && e.message || e)); }); } else readPages(["data:" + r.mime + ";base64," + r.b64]); };
      H.on("binfile", h); N.pickBin(); return; }
    var inp = document.createElement("input"); inp.type = "file"; inp.accept = "application/pdf,image/*"; inp.onchange = function(){ var f = inp.files && inp.files[0]; if(!f) return; var rd = new FileReader();
      rd.onload = function(){ var u = rd.result; if(/^data:application\/pdf/.test(u)){ busy = L("Membuka PDF…", "Opening the PDF…"); draw(); pdfPages(u.split(",")[1]).then(readPages).catch(function(e){ busy = ""; draw(); H.toast("⚠️ " + (e && e.message || e)); }); } else readPages([u]); }; rd.readAsDataURL(f); }; inp.click(); }); };
  ov.querySelector("#exPh").onclick = function(){ H.closeOverlay(); needAI(function(){ var pages = [], more = function(){ pickImg("camera", function(img){ pages.push(img);
    var o2 = H.showSheet("🏦 " + pages.length + " " + L("muka surat", "page(s)"), '<div class="btns"><button class="btn alt g3d" id="exMore" style="flex:1">📷 ' + L("Tambah muka surat", "Add a page") + '</button><button class="btn gold g3d" id="exGo" style="flex:1">✓ ' + L("Baca sekarang", "Read now") + '</button></div>');
    o2.querySelector("#exMore").onclick = function(){ H.closeOverlay(); more(); }; o2.querySelector("#exGo").onclick = function(){ H.closeOverlay(); readPages(pages); }; }); }; more(); }); }; }
function readPages(pages){ if(!pages.length) return; busy = L("AI sedang membaca penyata (", "The AI is reading the statement (") + pages.length + L(" muka surat)…", " page(s))…"); draw();
  var all = [], chain = Promise.resolve();
  for(var i = 0; i < pages.length; i += 2) (function(grp){ chain = chain.then(function(){ return Promise.all(grp.map(function(p){ return shrink(p, 1800, 0.82); })); }).then(function(us){
    return window.HalalAI.complete([{role:"user", content:[{type:"text", text:"These are pages of a bank or card statement. List EVERY transaction row. Reply ONLY with JSON: {\"transactions\": [{\"date\": \"YYYY-MM-DD\", \"description\": \"short, tidy\", \"amount\": 12.34 (positive number), \"direction\": \"in\" or \"out\", \"category\": for out one of " + CATS_EN + "; for in one of " + INC_EN + " (use the id)}]}. Skip opening/closing balance lines and totals."}].concat(us.map(function(u){ return {type:"image_url", image_url:{url:u}}; })) }], 6000, L, "", "receipt"); }).then(function(r){
    var j = parseJson(r.text), l = j && (j.transactions || (Array.isArray(j) ? j : null)); if(l) all = all.concat(l); }); })(pages.slice(i, i + 2));
  chain.then(function(){ busy = ""; draw(); if(!all.length){ H.toast(L("Tiada transaksi dijumpai.", "No transactions found.")); return; } review(all); }).catch(function(e){ busy = ""; draw(); H.toast("⚠️ " + (e && e.message || e)); }); }
function review(list){ var d = db(), rows = list.map(function(x){ var t = x.direction === "in" ? "in" : "out", cats = t === "in" ? IN : OUT, cat = cats.some(function(c){ return c[0] === x.category; }) ? x.category : (t === "in" ? "inother" : "other");
    var dt = /^\d{4}-\d{2}-\d{2}$/.test(x.date || "") ? x.date : ymd(), amt = Math.abs(c2(x.amount));
    var dup = d.tx.some(function(y){ return y.date === dt && y.amt === amt && y.t === t; }); return {t:t, cat:cat, date:dt, amt:amt, note:String(x.description || "").slice(0, 60), on:!dup && amt > 0, dup:dup}; }).filter(function(r){ return r.amt; });
  var tot = sums(rows), ov = H.showSheet("🏦 " + rows.length + " " + L("transaksi dijumpai", "transactions found"), '<div class="small">' + L("Masuk ", "In ") + money(tot.i, d.cur) + ' · ' + L("Keluar ", "Out ") + money(tot.o, d.cur) + ' · ' + L("Nyahtanda yang tidak mahu disimpan.", "Untick any you do not want.") + '</div><div class="exRv">' +
    rows.map(function(r, i){ var c = catOf(r.cat); return '<label class="exRvR' + (r.dup ? ' dup' : '') + '"><input type="checkbox" data-rv="' + i + '"' + (r.on ? ' checked' : '') + '><span class="exI">' + c[1] + '</span><span class="exT"><b>' + E(r.note || cname(c)) + '</b><small>' + r.date + ' · ' + E(cname(c)) + (r.dup ? ' · ' + L("sudah ada", "already recorded") : '') + '</small></span><b class="' + (r.t === "in" ? 'exIn' : 'exOut') + '">' + (r.t === "in" ? '+' : '−') + money(r.amt, d.cur).replace(/^−/, "") + '</b></label>'; }).join("") +
    '</div><button class="btn gold full g3d" id="exImp" style="margin-top:10px">' + L("Simpan yang ditanda", "Save the ticked ones") + '</button>');
  ov.querySelector("#exImp").onclick = function(){ var dd = db(), n = 0; ov.querySelectorAll("[data-rv]").forEach(function(cb){ if(!cb.checked) return; var r = rows[+cb.getAttribute("data-rv")]; dd.tx.push({id:rid(), t:r.t, amt:r.amt, cat:r.cat, note:r.note, pay:"bank", date:r.date, src:"statement"}); n++; });
    save(dd); H.closeOverlay(); if(n){ var ms = rows.filter(function(r){ return r.on; }).map(function(r){ return r.date.slice(0, 7); }).sort(); if(ms.length) ST.ym = ms[ms.length - 1]; } H.toast("✓ " + n + " " + L("transaksi disimpan", "transactions saved")); draw(); }; }
// ---------- budgets, export ----------
function budget(cat){ var d = db(), cats = cat ? [catOf(cat)] : OUT;
  var ov = H.showSheet("🎯 " + L("Bajet bulanan", "Monthly budget"), cats.map(function(c){ return '<div class="exBR"><span>' + c[1] + ' ' + E(cname(c)) + '</span><input class="rin" inputmode="decimal" data-bc="' + c[0] + '" placeholder="0.00" value="' + (d.bud[c[0]] ? (d.bud[c[0]] / 100).toFixed(2) : '') + '"></div>'; }).join("") + '<button class="btn gold full g3d" id="exBS" style="margin-top:10px">' + L("Simpan", "Save") + '</button>');
  ov.querySelector("#exBS").onclick = function(){ var dd = db(); ov.querySelectorAll("[data-bc]").forEach(function(i){ var v = c2(i.value); if(v) dd.bud[i.getAttribute("data-bc")] = v; else delete dd.bud[i.getAttribute("data-bc")]; }); save(dd); H.closeOverlay(); draw(); }; }
function csv(){ var d = db(), rows = [["date","type","amount","category","payment","note"]].concat(d.tx.slice().sort(function(a, b){ return a.date.localeCompare(b.date); }).map(function(t){ return [t.date, t.t, (t.amt / 100).toFixed(2), cname(catOf(t.cat)), t.pay || "", (t.note || "").replace(/"/g, "'")]; }));
  var text = rows.map(function(r){ return r.map(function(x){ return /[",\n]/.test(x) ? '"' + x + '"' : x; }).join(","); }).join("\n");
  if(window.Native && H.N.shareFile) H.N.shareFile("my-ihsan-expenses.csv", text, "text/csv", ""); else { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], {type:"text/csv"})); a.download = "my-ihsan-expenses.csv"; a.click(); } }
function bind(){ var q = function(s){ return root.querySelector(s); };
  root.querySelectorAll("[data-ym]").forEach(function(b){ b.onclick = function(){ ST.ym = shiftYm(ST.ym, (ST.page === 2 ? 12 : 1) * +b.getAttribute("data-ym")); draw(); }; });
  root.querySelectorAll("[data-pg]").forEach(function(b){ b.onclick = function(){ ST.page = +b.getAttribute("data-pg"); draw(); }; });
  root.querySelectorAll("[data-add]").forEach(function(b){ b.onclick = function(){ var t = b.getAttribute("data-add"); form(null, {t:t, cat:t === "in" ? "salary" : "food", date:ST.ym === ymd().slice(0, 7) ? ymd() : ST.ym + "-01"}); }; });
  root.querySelectorAll("[data-tx]").forEach(function(b){ b.onclick = function(){ var t = db().tx.filter(function(x){ return x.id === b.getAttribute("data-tx"); })[0]; if(t) form(JSON.parse(JSON.stringify(t))); }; });
  root.querySelectorAll("[data-f]").forEach(function(b){ b.onclick = function(){ ST.f = b.getAttribute("data-f"); draw(); }; });
  root.querySelectorAll("[data-bud]").forEach(function(b){ b.onclick = function(){ budget(b.getAttribute("data-bud")); }; });
  root.querySelectorAll("[data-mo]").forEach(function(b){ b.onclick = function(){ ST.ym = ST.ym.slice(0, 4) + "-" + ("0" + (+b.getAttribute("data-mo") + 1)).slice(-2); ST.page = 1; draw(); }; });
  var qi = q("#exQ"); if(qi) qi.oninput = function(){ ST.q = qi.value; var pos = qi.selectionStart; draw(); var q2 = root.querySelector("#exQ"); if(q2){ q2.focus(); try{ q2.setSelectionRange(pos, pos); }catch(e){} } };
  if(q("#exBudAll")) q("#exBudAll").onclick = function(){ budget(null); };
  q("#exScan").onclick = scanReceipt; q("#exStmt").onclick = statement; q("#exCsv").onclick = csv;
  q("#exCur").onclick = function(){ var d = db(), ov = H.showSheet("💱 " + L("Mata wang", "Currency"), '<div class="exPay">' + ["RM","SAR","AED","QAR","KWD","BHD","OMR","JOD","EGP","MAD","TRY","SGD","USD","IDR","BND","EUR","GBP"].map(function(c){ return '<button class="chip g3d' + (d.cur === c ? ' on' : '') + '" data-cu="' + c + '">' + c + '</button>'; }).join("") + '</div>');
    ov.querySelectorAll("[data-cu]").forEach(function(b){ b.onclick = function(){ var dd = db(); dd.cur = b.getAttribute("data-cu"); save(dd); H.closeOverlay(); draw(); }; }); }; }
window.ExpenseView = {canPage:function(sd){ return root && document.body.contains(root) ? (sd < 0 ? ST.page < 2 : ST.page > 0) : false; }, turn:function(sd){ ST.page = Math.max(0, Math.min(2, ST.page + (sd < 0 ? 1 : -1))); draw(); },
  _st:function(){ return ST; }, _review:review, _read:readPages, _db:function(){ return db(); }};
window.FinMore = window.FinMore || {};
window.FinMore.belanja = function(el, A){ H = A.H; root = el; if(!ST.ym) ST.ym = ymd().slice(0, 7); recurring(); draw(); };
})();
