/* My Ihsan 0.6.25 · Kewangan › Niaga: document designs.
   One layout drawn on canvas → (a) the on-screen preview, (b) a multi-page PDF, (c) a picture for WhatsApp.
   A4 portrait at 150 dpi (1240 × 1754). Designs: klasik, moden, minimal, thermal (80 mm shop receipt). */
(function(){ "use strict";
var ND = function(){ return window.NiagaDoc; };
var W = 1240, HH = 1754, M = 78, FOOT = 92;
var DESIGNS = [["moden","Moden","Modern"],["klasik","Klasik","Classic"],["minimal","Minimal","Minimal"],["korporat","Korporat","Corporate"],["songket","Songket","Songket"],["islamik","Islamik","Islamic"],["kreatif","Kreatif","Creative"],["thermal","Resit Kedai","Shop receipt"]];
var COLORS = ["#0f5132","#1d4ed8","#7c2d12","#6d28d9","#be123c","#0e7490","#374151","#b45309","#15803d","#111827"];
var SIGF = [["NgSig1","Pinyon"],["NgSig2","Fell"],["NgSig3","Marcellus"],["NgSig4","Fraunces"]];
var SANS = "NgSans, 'Plus Jakarta Sans', system-ui, sans-serif", SERIF = "NgSerif, Fraunces, Georgia, serif";

function fontsReady(){ if(!document.fonts || !document.fonts.load) return Promise.resolve();
  return Promise.all(["400 20px NgSans","600 20px NgSans","700 20px NgSans","400 20px NgSerif","700 20px NgSerif","20px NgSig1","20px NgSig2","20px NgSig3","20px NgSig4"].map(function(f){ return document.fonts.load(f).catch(function(){}); })).then(function(){}, function(){}); }
function loadImg(src){ return new Promise(function(ok){ if(!src){ ok(null); return; } var im = new Image(); im.onload = function(){ ok(im); }; im.onerror = function(){ ok(null); }; im.src = src; }); }
function hexA(h, a){ h = String(h || "#0f5132").replace("#", ""); if(h.length === 3) h = h.split("").map(function(c){ return c + c; }).join(""); var n = parseInt(h, 16); return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")"; }

// ---------- canvas helpers ----------
function Pen(ctx){ this.c = ctx; }
Pen.prototype.font = function(o){ o = o || {}; this.c.font = (o.it ? "italic " : "") + (o.w || 400) + " " + (o.s || 22) + "px " + (o.f || SANS); };
Pen.prototype.width = function(s, o){ this.font(o); return this.c.measureText(String(s)).width; };
Pen.prototype.text = function(s, x, y, o){ o = o || {}; this.font(o); var c = this.c; c.fillStyle = o.col || "#1f2328"; c.textAlign = o.al || "left"; c.textBaseline = "alphabetic";
  s = String(s == null ? "" : s);
  if(o.fit && o.max){ var sz = o.s || 22; while(sz > (o.s || 22) * .55 && c.measureText(s).width > o.max){ sz -= 1; this.font(Object.assign({}, o, {s:sz})); } }
  if(o.max && c.measureText(s).width > o.max){ while(s.length > 1 && c.measureText(s + "…").width > o.max) s = s.slice(0, -1); s += "…"; }
  if(o.sp){ c.save(); try{ c.letterSpacing = o.sp + "px"; }catch(e){} c.fillText(s, x, y); c.restore(); } else c.fillText(s, x, y); };
Pen.prototype.wrap = function(s, max, o){ this.font(o); var c = this.c, out = [];
  String(s == null ? "" : s).split("\n").forEach(function(par){ var words = par.split(/\s+/), line = "";
    words.forEach(function(w){ var t = line ? line + " " + w : w; if(c.measureText(t).width <= max || !line){ if(c.measureText(t).width > max && !line){ // a single very long word
          var cut = ""; for(var i = 0; i < w.length; i++){ if(c.measureText(cut + w[i]).width > max){ out.push(cut); cut = ""; } cut += w[i]; } line = cut; } else line = t; }
      else { out.push(line); line = w; } });
    out.push(line); }); return out; };
Pen.prototype.lines = function(arr, x, y, lh, o){ var p = this; arr.forEach(function(l, i){ p.text(l, x, y + i * lh, o); }); return arr.length * lh; };
Pen.prototype.rule = function(x1, y, x2, col, w){ var c = this.c; c.strokeStyle = col || "#d0d4da"; c.lineWidth = w || 1.5; c.beginPath(); c.moveTo(x1, y); c.lineTo(x2, y); c.stroke(); };
Pen.prototype.box = function(x, y, w, h, fill, r){ var c = this.c; c.fillStyle = fill; if(r){ c.beginPath(); if(c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); c.fill(); } else c.fillRect(x, y, w, h); };
Pen.prototype.img = function(im, x, y, mw, mh, al){ if(!im) return 0; var k = Math.min(mw / im.width, mh / im.height), w = im.width * k, h = im.height * k; var dx = al === "c" ? x - w / 2 : al === "r" ? x - w : x; this.c.drawImage(im, dx, y, w, h); return {w:w, h:h}; };

// ---------- labels in the document language ----------
function Lfor(lang){ return function(bm, en){ return lang === "en" ? en : lang === "bm" ? bm : bm + " / " + en; }; }
function dateStr(s, lang){ if(!s) return ""; var p = s.split("-"); var MB = ["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"], ME = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return (+p[2]) + " " + (lang === "en" ? ME : MB)[+p[1] - 1] + " " + p[0]; }
function curOf(p, doc){ return ND().sym(ND().docCur(doc, p)); }

// ---------- the model the designs draw ----------
function model(D, doc, p, opt){ var N = ND(); opt = opt || {};
  var lang = doc.lang || p.lang || "both", L = Lfor(lang), T = N.totals(D, doc, p), ty = N.TYPES[doc.type], st = opt.status || N.status(D, doc);
  var title = doc.type === "OR" && doc.dep ? L("Resit Deposit", "Deposit Receipt") : L(ty.bm, ty.en);
  return {D:D, doc:doc, p:p, lang:lang, L:L, T:T, title:title.toUpperCase(), st:st, cur:curOf(p, doc), ccode:ND().docCur(doc, p), color:doc.color || p.color || "#0f5132", design:doc.design || p.design || "moden", sst:!!(p.tax && p.tax.sst), hidePrice:doc.type === "DO" && doc.hidePrice !== false}; }
function money(m, c){ return ND().fmt(c, m.cur); }

function metaRows(m){ var d = m.doc, L = m.L, r = [[L("No.", "No."), d.no || ("DRAF-" + d.id.slice(0, 5).toUpperCase())], [L("Tarikh", "Date"), dateStr(d.date, m.lang)]];
  if(d.type === "INV" && d.due) r.push([L("Tarikh akhir", "Due date"), dateStr(d.due, m.lang)]);
  if(d.type === "QT" && d.valid) r.push([L("Sah hingga", "Valid until"), dateStr(d.valid, m.lang)]);
  if(d.type === "PF" && d.due) r.push([L("Bayar sebelum", "Pay by"), dateStr(d.due, m.lang)]);
  if(d.type === "PO" && d.deliv) r.push([L("Tarikh hantar", "Delivery date"), dateStr(d.deliv, m.lang)]);
  if(d.pterm) r.push([L("Terma", "Terms"), d.pterm]);
  if(d.cur && d.cur !== (m.p.base || "MYR")) r.push([L("Mata wang", "Currency"), d.cur + (d.rate ? " (1 = " + (m.p.base || "MYR") + " " + d.rate + ")" : "")]);
  if(d.ref) r.push([L("Rujukan", "Reference"), d.ref]);
  var fr = d.from && ND().byId(m.D.docs, d.from); if(fr && fr.no && fr.no !== d.ref) r.push([d.type === "CN" || d.type === "DN" ? L("Merujuk invois", "For invoice") : L("Daripada", "From"), fr.no]);
  return r; }
function addrLines(a){ a = a || {}; var l = []; if(a.l1) l.push(a.l1); if(a.l2) l.push(a.l2); var c = [a.pc, a.city].filter(Boolean).join(" "); var s = [c, a.state].filter(Boolean).join(", "); if(s) l.push(s); return l; }
function custLines(c){ c = c || {}; var l = []; if(c.co && c.name) l.push(c.co); if(c.regNo) l.push(c.regNo); (c.addr ? String(c.addr).split("\n") : []).forEach(function(x){ if(x.trim()) l.push(x.trim()); });
  var ct = [c.phone, c.email].filter(Boolean).join(" · "); if(ct) l.push(ct); if(c.att) l.push("u.p. / Attn: " + c.att); return l; }
function bizLines(m){ var p = m.p, L = m.L, l = []; if(p.trade) l.push(p.trade);
  var reg = []; if(p.regNo) reg.push(L("No. Pendaftaran", "Reg. No.") + " " + p.regNo + (p.regOld ? " (" + p.regOld + ")" : "")); if(p.licence) reg.push(p.licence); if(reg.length) l.push(reg.join(" · "));
  addrLines(p.addr).forEach(function(x){ l.push(x); });
  var ct = [p.phone ? "☎ " + p.phone : "", p.email, p.web].filter(Boolean).join("  ·  "); if(ct) l.push(ct);
  var tx = []; if(m.sst && p.sstNo) tx.push("SST " + p.sstNo); if(p.tin) tx.push("TIN " + p.tin); if(tx.length) l.push(tx.join(" · "));
  return l; }

// ---------- A4 page engine ----------
function A4(m){ this.m = m; this.pages = []; this.y = 0; this.newPage(true); }
A4.prototype.newPage = function(first){ var cv = document.createElement("canvas"); cv.width = W; cv.height = HH; var c = cv.getContext("2d"); c.fillStyle = "#fff"; c.fillRect(0, 0, W, HH);
  this.cv = cv; this.P = new Pen(c); this.pages.push(cv); this.y = M;
  if(!first){ var m = this.m, P = this.P; if(m.design === "moden") P.box(0, 0, W, 10, m.color);
    P.text(m.title, M, M + 18, {s:22, w:700, col:m.color}); P.text(m.doc.no || "", W - M, M + 18, {s:20, al:"right", col:"#555"}); P.rule(M, M + 34, W - M, "#e3e6ea"); this.y = M + 64; } };
A4.prototype.need = function(h, onNew){ if(this.y + h > HH - M - FOOT){ this.newPage(false); if(onNew) onNew(); return true; } return false; };

function header(pg, m, im){ var P = pg.P, p = m.p, col = m.color, d = m.design, y = M, bl = bizLines(m);
  if(d === "klasik"){
    if(im.logo){ var s = P.img(im.logo, W / 2, y, 300, 130, "c"); y += s.h + 18; }
    P.text(p.name || "", W / 2, y + 40, {s:44, w:700, f:SERIF, al:"center", col:"#1b1b1b", max:W - 2 * M}); y += 58;
    bl.forEach(function(l){ P.text(l, W / 2, y + 22, {s:19, al:"center", col:"#4b5058", max:W - 2 * M}); y += 27; });
    y += 14; P.rule(M, y, W - M, "#1b1b1b", 2.5); P.rule(M, y + 6, W - M, "#1b1b1b", 1); y += 40;
    P.text(m.title, W / 2, y + 26, {s:34, w:700, f:SERIF, al:"center", col:col, sp:4}); y += 60;
  } else if(d === "minimal"){
    var lx = M; if(im.logo){ var s2 = P.img(im.logo, M, y, 170, 100); lx = M + s2.w + 26; }
    P.text(p.name || "", lx, y + 36, {s:34, w:700, col:"#111", max:620}); var yy = y + 62;
    bl.forEach(function(l){ P.text(l, lx, yy, {s:18, col:"#6b7280", max:640}); yy += 25; });
    P.text(m.title, W - M, y + 40, {s:40, w:300, al:"right", col:"#111", sp:3, max:520, fit:1}); y = Math.max(yy, y + 110) + 34;
  } else if(d === "korporat"){
    P.box(0, 0, W, 230, col); var lx3 = M;
    if(im.logo){ P.box(M - 10, 40, 190, 150, "#fff", 14); var s5 = P.img(im.logo, M + 85, 52, 170, 126, "c"); lx3 = M + 210; }
    P.text(p.name || "", lx3, 92, {s:38, w:800, col:"#fff", max:540}); var y5 = 122;
    bl.slice(0, 4).forEach(function(l){ P.text(l, lx3, y5, {s:17.5, col:"rgba(255,255,255,.85)", max:560}); y5 += 24; });
    P.text(m.title, W - M, 92, {s:36, w:800, al:"right", col:"#fff", max:400, sp:2, fit:1}); y = 270;
  } else if(d === "songket" || d === "islamik"){
    y = M + 40; if(d === "islamik" && p.bismillah !== false){ P.text("بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ", W / 2, y + 30, {s:34, f:"AmiriL, 'Amiri', serif", al:"center", col:col}); y += 56; }
    if(im.logo){ var s6 = P.img(im.logo, W / 2, y, 260, 110, "c"); y += s6.h + 14; }
    P.text(p.name || "", W / 2, y + 40, {s:40, w:700, f:SERIF, al:"center", col:"#1b1b1b", max:W - 2 * M - 80}); y += 56;
    bl.forEach(function(l){ P.text(l, W / 2, y + 20, {s:18, al:"center", col:"#4b5058", max:W - 2 * M - 80}); y += 25; });
    y += 18; ornamentRule(P, y, col); y += 34;
    P.text(m.title, W / 2, y + 26, {s:32, w:700, f:SERIF, al:"center", col:col, sp:4}); y += 58;
  } else if(d === "kreatif"){
    var c2 = P.c; c2.save(); c2.fillStyle = hexA(col, .14); c2.beginPath(); c2.arc(W - 120, 60, 210, 0, 7); c2.fill(); c2.fillStyle = hexA(col, .08); c2.beginPath(); c2.arc(W - 330, 150, 90, 0, 7); c2.fill(); c2.restore();
    P.box(M - 20, M - 20, 640, 190, col, 36); var lx6 = M + 10;
    if(im.logo){ P.box(M + 4, M + 4, 140, 140, "#fff", 28); P.img(im.logo, M + 74, M + 14, 120, 120, "c"); lx6 = M + 168; }
    P.text(p.name || "", lx6, M + 60, {s:36, w:800, col:"#fff", max:620 - (lx6 - M)}); var y6 = M + 92;
    bl.slice(0, 3).forEach(function(l){ P.text(l, lx6, y6, {s:16.5, col:"rgba(255,255,255,.9)", max:610 - (lx6 - M)}); y6 += 23; });
    P.text(m.title, W - M, M + 210, {s:42, w:800, al:"right", col:col, max:460, fit:1}); y = M + 250;
  } else { // moden
    P.box(0, 0, W, 16, col);
    var lx2 = M; if(im.logo){ var s3 = P.img(im.logo, M, y + 6, 190, 120); lx2 = M + s3.w + 26; }
    P.text(p.name || "", lx2, y + 44, {s:38, w:700, col:"#111", max:560}); var y2 = y + 72;
    bl.forEach(function(l){ P.text(l, lx2, y2, {s:18.5, col:"#4b5058", max:600}); y2 += 25; });
    P.text(m.title, W - M, y + 50, {s:44, w:800, al:"right", col:col, max:420, fit:1}); y = Math.max(y2, y + 140) + 26;
  }
  pg.y = y; }

// songket: a woven diamond band; islamik: an eight-point star rule
function ornamentRule(P, y, col){ var c = P.c, n = 22, w = (W - 2 * M) / n; c.save(); c.strokeStyle = col; c.fillStyle = hexA(col, .85); c.lineWidth = 1.5;
  for(var i = 0; i < n; i++){ var cx = M + w * i + w / 2; c.beginPath(); c.moveTo(cx, y - 9); c.lineTo(cx + 9, y); c.lineTo(cx, y + 9); c.lineTo(cx - 9, y); c.closePath(); if(i % 2) c.fill(); else c.stroke(); }
  c.beginPath(); c.moveTo(M, y - 16); c.lineTo(W - M, y - 16); c.moveTo(M, y + 16); c.lineTo(W - M, y + 16); c.stroke(); c.restore(); }
function star8(c, x, y, r, col, fill){ c.save(); c.translate(x, y); c.beginPath(); for(var i = 0; i < 16; i++){ var a = i * Math.PI / 8, rr = i % 2 ? r * .55 : r; c[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath();
  if(fill){ c.fillStyle = fill; c.fill(); } c.strokeStyle = col; c.lineWidth = 2; c.stroke(); c.beginPath(); c.arc(0, 0, r * .3, 0, 7); c.stroke(); c.restore(); }
function frame(cv, m){ var c = cv.getContext("2d"), col = m.color, d = m.design;
  if(d === "songket"){ var b = 26, step = 26; c.save(); c.fillStyle = hexA(col, .9);
    var dia = function(x, y, s){ c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s, y); c.lineTo(x, y + s); c.lineTo(x - s, y); c.closePath(); c.fill(); };
    for(var x = b; x <= W - b; x += step){ dia(x, b, 7); dia(x, HH - b, 7); } for(var y = b + step; y <= HH - b - step; y += step){ dia(b, y, 7); dia(W - b, y, 7); }
    c.strokeStyle = col; c.lineWidth = 2; c.strokeRect(b + 16, b + 16, W - 2 * b - 32, HH - 2 * b - 32); c.lineWidth = 1; c.strokeRect(b + 22, b + 22, W - 2 * b - 44, HH - 2 * b - 44); c.restore(); }
  if(d === "islamik"){ c.save(); c.strokeStyle = col; c.lineWidth = 2.5; c.strokeRect(30, 30, W - 60, HH - 60); c.lineWidth = 1; c.strokeRect(40, 40, W - 80, HH - 80);
    [[46, 46], [W - 46, 46], [46, HH - 46], [W - 46, HH - 46]].forEach(function(q){ star8(c, q[0], q[1], 30, col, "#fff"); star8(c, q[0], q[1], 16, col, hexA(col, .25)); }); c.restore(); }
  if(d === "korporat"){ c.fillStyle = m.color; c.fillRect(0, HH - 14, W, 14); }
  if(d === "kreatif"){ c.save(); c.fillStyle = hexA(m.color, .12); c.beginPath(); c.arc(70, HH - 40, 120, 0, 7); c.fill(); c.restore(); } }
function metaBlock(pg, m){ var P = pg.P, L = m.L, d = m.doc, y = pg.y, col = m.color, minimal = m.design === "minimal";
  var cx = M, cw = 600, rx = 760, rows = metaRows(m);
  var who = d.type === "OR" ? L("Diterima daripada", "Received from") : d.type === "DO" ? L("Hantar kepada", "Deliver to") : d.type === "PO" ? L("Kepada (pembekal)", "To (supplier)") : d.type === "PV" ? L("Dibayar kepada", "Paid to") : L("Kepada", "Bill to");
  P.text(who.toUpperCase(), cx, y + 18, {s:16, w:700, col:minimal ? "#9ca3af" : col, sp:1.5});
  var c = d.cust || {}, yy = y + 52; P.text(c.name || c.co || "—", cx, yy, {s:26, w:700, col:"#111", max:cw}); yy += 10;
  custLines(c).forEach(function(l){ var w = P.wrap(l, cw, {s:19}); yy += P.lines(w, cx, yy + 22, 26, {s:19, col:"#40454d"}); });
  if(d.ship && d.type !== "OR"){ yy += 14; P.text(L("Hantar ke", "Ship to").toUpperCase(), cx, yy + 16, {s:15, w:700, col:"#9ca3af", sp:1}); yy += 20; yy += P.lines(P.wrap(d.ship, cw, {s:18}), cx, yy + 22, 25, {s:18, col:"#40454d"}); }
  var ry = y; if(!minimal && m.design !== "klasik") P.box(rx - 22, y - 8, W - M - rx + 22, rows.length * 36 + 22, hexA(col, .07), 12);
  rows.forEach(function(r){ P.text(r[0], rx, ry + 22, {s:18, col:"#6b7280"}); P.text(r[1], W - M - 8, ry + 22, {s:19, w:600, al:"right", col:"#111", max:250}); ry += 36; });
  pg.y = Math.max(yy, ry) + 36; }

function colsFor(m){ var L = m.L, wide = W - 2 * M, cols;
  if(m.hidePrice) cols = [["no","#",54,"l"],["desc",L("Perkara", "Description"),wide - 54 - 140 - 130,"l"],["qty",L("Kuantiti", "Qty"),140,"r"],["unit",L("Unit", "Unit"),130,"r"]];
  else { var tax = m.sst, disc = (m.doc.lines || []).some(function(l){ return ND().num(l.disc) > 0; });
    cols = [["no","#",50,"l"],["desc",L("Perkara", "Description"),0,"l"],["qty",m.lang === "bm" ? "Kuantiti" : L("Kuan.", "Qty"),120,"r"],["price",L("Harga", "Price"),150,"r"]];
    if(disc) cols.push(["disc",L("Diskaun", "Disc."),110,"r"]); if(tax) cols.push(["tax",L("Cukai", "Tax"),80,"r"]); cols.push(["amt",L("Jumlah", "Amount"),170,"r"]);
    var used = cols.reduce(function(s, c){ return s + c[2]; }, 0); cols[1][2] = wide - used; }
  return cols; }
function tableHead(pg, m, cols){ var P = pg.P, y = pg.y, col = m.color, d = m.design, x = M;
  if(d === "moden" || d === "korporat"){ P.box(M, y, W - 2 * M, 46, col, d === "korporat" ? 0 : 8); }
  else if(d === "kreatif"){ P.box(M, y, W - 2 * M, 46, col, 23); }
  else if(d === "klasik" || d === "songket" || d === "islamik"){ P.rule(M, y, W - M, "#1b1b1b", 2); P.rule(M, y + 46, W - M, "#1b1b1b", 1.2); }
  else P.rule(M, y + 46, W - M, "#111", 1.5);
  cols.forEach(function(c){ var tx = c[3] === "r" ? x + c[2] - 12 : x + 12; P.text(c[1].toUpperCase(), tx, y + 30, {s:15.5, w:700, al:c[3] === "r" ? "right" : "left", col:(d === "moden" || d === "korporat" || d === "kreatif") ? "#fff" : "#374151", max:c[2] - 16, sp:.6}); x += c[2]; });
  pg.y = y + 54; }
function rowMeasure(pg, m, cols, l){ var dc = cols[1][2] - 24; if(l.t === "head") return {h:48, w:[l.desc || ""]};
  var w = pg.P.wrap(l.desc || "", dc, {s:20}); return {h:Math.max(46, w.length * 27 + 22), w:w}; }
function row(pg, m, cols, l, i, k, meas){ var P = pg.P, y = pg.y, x = M, N = ND(), d = m.design;
  if(l.t === "head"){ P.text(l.desc || "", M + 12, y + 32, {s:20, w:700, col:m.color}); pg.y += meas.h; return; }
  if((d === "moden" || d === "korporat") && k % 2) P.box(M, y, W - 2 * M, meas.h, d === "korporat" ? hexA(m.color, .06) : "#f6f7f9");
  var amt = N.lineAmt(l), vals = {no:String(i), desc:"", qty:fq(l.qty) + (m.hidePrice ? "" : (l.unit ? " " + l.unit : "")), unit:l.unit || "", price:N.fmt(N.sen(l.price), ""), disc:N.num(l.disc) ? (l.discT === "%" ? N.num(l.disc) + "%" : N.fmt(N.sen(l.disc), "")) : "", tax:N.num(l.tax) ? N.num(l.tax) + "%" : "", amt:N.fmt(amt, "")};
  cols.forEach(function(c){ if(c[0] === "desc") P.lines(meas.w, x + 12, y + 31, 27, {s:20, col:"#111"}); else P.text(vals[c[0]], c[3] === "r" ? x + c[2] - 12 : x + 12, y + 31, {s:19.5, al:c[3] === "r" ? "right" : "left", col:c[0] === "no" ? "#9ca3af" : "#111", max:c[2] - 14}); x += c[2]; });
  if(d !== "moden" && d !== "korporat") P.rule(M, y + meas.h, W - M, "#e6e8eb", 1); pg.y += meas.h; }
function fq(q){ var n = ND().num(q); return String(Math.round(n * 1000) / 1000); }

function totalsRows(m){ var T = m.T, L = m.L, r = [], d = m.doc;
  r.push([L("Jumlah kecil", "Subtotal"), T.sub]);
  if(T.disc) r.push([L("Diskaun", "Discount") + (d.discT === "%" ? " (" + ND().num(d.disc) + "%)" : ""), -T.disc]);
  Object.keys(T.tax).sort().forEach(function(k){ r.push([(m.p.tax && m.p.tax.inclusive ? L("Termasuk cukai ", "Incl. tax ") : L("Cukai ", "Tax ")) + k + "%", T.tax[k]]); });
  if(T.ship) r.push([L("Penghantaran", "Shipping"), T.ship]); if(T.other) r.push([d.otherLab || L("Caj lain", "Other charges"), T.other]);
  if(T.round) r.push([L("Pelarasan bundar", "Rounding"), T.round]);
  return r; }
function totalsBlock(pg, m){ var P = pg.P, T = m.T, L = m.L, rows = totalsRows(m), x1 = 720, x2 = W - M;
  var pays = (T.pays || []), h = rows.length * 34 + 76 + (pays.length ? pays.length * 32 + 50 : 0) + 110;
  pg.need(h); var y = pg.y + 10;
  rows.forEach(function(r){ P.text(r[0], x1, y + 24, {s:19, col:"#4b5058"}); P.text(ND().fmt(r[1], m.cur), x2, y + 24, {s:19.5, al:"right", col:"#111"}); y += 34; });
  var fill = m.design === "moden" || m.design === "korporat" || m.design === "kreatif";
  if(fill) P.box(x1 - 20, y + 4, x2 - x1 + 20, 58, m.color, m.design === "kreatif" ? 29 : m.design === "korporat" ? 0 : 10); else { P.rule(x1, y + 4, x2, "#111", 2); }
  var tc = fill ? "#fff" : "#111";
  P.text(L("JUMLAH", "TOTAL"), x1, y + 43, {s:21, w:800, col:tc}); P.text(ND().fmt(T.total, m.cur), x2 - (fill ? 14 : 0), y + 44, {s:27, w:800, al:"right", col:tc}); y += 72;
  (T.notes || []).forEach(function(n){ P.text((n.d.type === "CN" ? L("Tolak nota kredit ", "Less credit note ") : L("Tambah nota debit ", "Add debit note ")) + (n.d.no || ""), x1, y + 22, {s:17.5, col:"#4b5058", max:330}); P.text((n.d.type === "CN" ? "−" : "+") + ND().fmt(n.amt, m.cur), x2, y + 22, {s:18.5, al:"right"}); y += 32; });
  if((T.notes || []).length && !pays.length){ P.rule(x1, y + 4, x2, "#d0d4da"); P.text(L("BAKI", "BALANCE DUE"), x1, y + 36, {s:20, w:800, col:m.color}); P.text(ND().fmt(T.bal, m.cur), x2, y + 37, {s:24, w:800, al:"right", col:m.color}); y += 50; }
  if(pays.length && m.doc.type !== "CS"){ pays.forEach(function(p){ P.text((p.dep ? L("Tolak deposit ", "Less deposit ") : L("Tolak bayaran ", "Less payment ")) + (p.r.no || ""), x1, y + 22, {s:17.5, col:"#4b5058", max:330}); P.text("−" + ND().fmt(p.amt, m.cur), x2, y + 22, {s:18.5, al:"right", col:"#111"}); y += 32; });
    P.rule(x1, y + 4, x2, "#d0d4da"); P.text(L("BAKI", "BALANCE DUE"), x1, y + 36, {s:20, w:800, col:m.color}); P.text(ND().fmt(T.bal, m.cur), x2, y + 37, {s:24, w:800, al:"right", col:m.color}); y += 50; }
  // amount in words, left of the totals
  var wy = pg.y + 18, ww = 600; var words = wordsFor(m, T.total);
  P.text(L("Amaun dalam perkataan", "Amount in words").toUpperCase(), M, wy + 14, {s:14.5, w:700, col:"#9ca3af", sp:1}); wy += 22;
  words.forEach(function(w){ var lines = P.wrap(w, ww, {s:18, it:true}); wy += P.lines(lines, M, wy + 22, 25, {s:18, it:true, col:"#374151"}) + 6; });
  pg.y = Math.max(y, wy) + 26; }
function wordsFor(m, c){ var N = ND(), b = m.ccode || (m.p.base || "MYR"); return m.lang === "both" ? [N.words(c, "bm", b), N.words(c, "en", b)] : [N.words(c, m.lang === "en" ? "en" : "bm", b)]; }

function receiptBody(pg, m){ var P = pg.P, L = m.L, d = m.doc, N = ND(), T = m.T, y = pg.y;
  P.box(M, y, W - 2 * M, 130, hexA(m.color, .08), 14);
  P.text((d.type === "PV" ? L("Jumlah dibayar", "Amount paid") : L("Jumlah diterima", "Amount received")).toUpperCase(), M + 28, y + 40, {s:16, w:700, col:m.color, sp:1.2});
  P.text(N.fmt(T.total, m.cur), M + 28, y + 100, {s:52, w:800, col:"#111"});
  var meth = (N.METHODS.filter(function(x){ return x[0] === d.method; })[0] || ["", "", ""]), mx = 760, my = y + 36;
  [[L("Kaedah", "Method"), L(meth[1], meth[2]) + (d.chq ? " · " + d.chq : "")], [L("Tarikh bayar", "Payment date"), dateStr(d.pdate || d.date, m.lang)], [L("Rujukan", "Reference"), d.pref || "—"]].forEach(function(r){ P.text(r[0], mx, my, {s:17, col:"#6b7280"}); P.text(r[1], W - M - 26, my, {s:18.5, w:600, al:"right", col:"#111", max:260}); my += 33; });
  y += 156; wordsFor(m, T.total).forEach(function(w){ var ln = P.wrap(w, W - 2 * M, {s:19, it:true}); y += P.lines(ln, M, y + 22, 27, {s:19, it:true, col:"#374151"}) + 4; });
  y += 24; var ap = (d.apply || []).filter(function(a){ return N.sen(a.amt) > 0; });
  if(ap.length){ P.text(L("Bayaran untuk", "Being payment for").toUpperCase(), M, y + 18, {s:15.5, w:700, col:"#6b7280", sp:1}); y += 34;
    P.rule(M, y, W - M, "#111", 1.5); y += 4;
    [[L("Dokumen", "Document"), M + 12, "left"], [L("Jumlah dokumen", "Document total"), 760, "right"], [L("Dibayar kini", "Paid now"), 960, "right"], [L("Baki", "Balance"), W - M - 12, "right"]].forEach(function(h){ P.text(h[0], h[1], y + 28, {s:16, w:700, al:h[2], col:"#374151"}); });
    y += 42; P.rule(M, y, W - M, "#d0d4da");
    ap.forEach(function(a){ var inv = N.byId(m.D.docs, a.doc), it = inv ? N.totals(m.D, inv, m.p) : null;
      P.text(inv ? (inv.no || "—") + " · " + dateStr(inv.date, m.lang) : "—", M + 12, y + 30, {s:18.5, col:"#111", max:420});
      if(it){ P.text(N.fmt(it.total, ""), 760, y + 30, {s:18.5, al:"right"}); P.text(N.fmt(it.bal, ""), W - M - 12, y + 30, {s:18.5, al:"right", w:600, col:it.bal ? "#b45309" : "#15803d"}); }
      P.text(N.fmt(N.sen(a.amt), ""), 960, y + 30, {s:18.5, al:"right", w:600}); y += 44; P.rule(M, y, W - M, "#eceef1"); });
    y += 10; }
  if(d.type === "PV" && d.purpose){ y += P.lines(P.wrap(L("Tujuan: ", "Purpose: ") + d.purpose, W - 2 * M, {s:20}), M, y + 24, 28, {s:20, col:"#111"}) + 10; }
  if(d.payFor){ y += P.lines(P.wrap(L("Bayaran untuk: ", "Being payment for: ") + d.payFor, W - 2 * M, {s:19}), M, y + 24, 27, {s:19, col:"#111"}) + 10; }
  pg.y = y + 20; }

function payBlock(pg, m, im){ var p = m.p, P = pg.P, L = m.L, banks = (p.bank || []).filter(function(b){ return b.accNo; });
  if(!banks.length && !im.qr && !p.payLink) return;
  var h = Math.max(banks.length * 78 + 60, im.qr ? 230 : 0) + (p.payLink ? 34 : 0); pg.need(h);
  var y = pg.y; P.text(L("Maklumat bayaran", "Payment details").toUpperCase(), M, y + 18, {s:15.5, w:700, col:m.color, sp:1.2}); y += 32;
  banks.forEach(function(b){ P.text(b.bank || "", M, y + 24, {s:19, w:700, col:"#111"}); P.text(String(b.accNo).replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 "), M, y + 52, {s:22, w:600, col:"#111", sp:.5}); P.text(b.accName || "", M + 380, y + 52, {s:18, col:"#4b5058", max:380}); y += 78; });
  if(p.payLink){ P.text("🔗 " + p.payLink, M, y + 22, {s:17.5, col:"#1d4ed8", max:720}); y += 34; }
  if(p.wa || p.phone){ P.text(L("Sila hantar bukti bayaran ke WhatsApp ", "Please send proof of payment to WhatsApp ") + (p.wa || p.phone), M, y + 22, {s:16.5, col:"#6b7280", max:760}); y += 30; }
  if(im.qr){ var s = P.img(im.qr, W - M, pg.y + 4, 210, 210, "r"); P.text("DuitNow QR", W - M - s.w / 2, pg.y + s.h + 30, {s:15, w:700, al:"center", col:"#6b7280"}); y = Math.max(y, pg.y + s.h + 40); }
  pg.y = y + 22; }

function termsBlock(pg, m){ var P = pg.P, L = m.L, d = m.doc; var parts = [];
  if(d.notes) parts.push([L("Nota", "Notes"), d.notes]); if(d.terms) parts.push([L("Terma & syarat", "Terms & conditions"), d.terms]);
  parts.forEach(function(pt){ var ln = P.wrap(pt[1], W - 2 * M, {s:17.5}); pg.need(ln.length * 24 + 44); var y = pg.y;
    P.text(pt[0].toUpperCase(), M, y + 18, {s:15, w:700, col:"#6b7280", sp:1}); P.lines(ln, M, y + 46, 24, {s:17.5, col:"#374151"}); pg.y = y + 46 + ln.length * 24 + 12; }); }

function sigBlock(pg, m, im){ var P = pg.P, L = m.L, d = m.doc, p = m.p, sig = (p.sigs || []).filter(function(s){ return s.id === d.sig; })[0];
  var other = d.type === "DO" ? L("Diterima dalam keadaan baik oleh", "Received in good condition by") : d.type === "QT" ? L("Diterima oleh (pelanggan)", "Accepted by (customer)") : d.type === "PV" ? L("Diterima oleh (penerima bayaran)", "Received by (payee)") : d.type === "PO" ? L("Disahkan oleh pembekal", "Acknowledged by supplier") : "";
  if(!sig && !other){ return; }
  pg.need(250); var y = pg.y + 16, w = 420;
  if(sig){ var top = y + 10;
    if(im.sig) P.img(im.sig, M + 10, top, 340, 130);
    else if(sig.typed){ P.text(sig.typed, M + 14, top + 100, {s:sig.font === "NgSig3" || sig.font === "NgSig4" ? 46 : 64, f:sig.font || "NgSig1", col:sig.ink || "#16309a", max:w}); }
    if(im.stamp && d.stamp){ var c = P.c; c.save(); c.globalAlpha = .82; c.translate(M + 280, top + 70); c.rotate(-0.12); P.img(im.stamp, 0, -80, 190, 160, "c"); c.restore(); }
    P.rule(M, y + 150, M + w, "#111", 1.4);
    P.text(sig.name || p.name || "", M, y + 180, {s:19, w:700, col:"#111", max:w}); P.text((sig.title || "") + (sig.title ? " · " : "") + (p.name || ""), M, y + 206, {s:16.5, col:"#6b7280", max:w}); }
  if(other){ var x = W - M - w; P.text(other, x, y + 20, {s:16.5, w:700, col:"#374151", max:w});
    if(im.csig) P.img(im.csig, x + 10, y + 30, 320, 115);
    P.rule(x, y + 150, W - M, "#111", 1.4);
    var cs = d.csig || {}; P.text(L("Nama", "Name") + ": " + (cs.name || ""), x, y + 180, {s:17, col:"#374151", max:w});
    P.text((d.type === "DO" ? L("IC (4 digit akhir)", "IC (last 4)") + ": " + (cs.ic || "") + "   " : "") + L("Tarikh", "Date") + ": " + (cs.at ? dateStr(cs.at.slice(0, 10), m.lang) : ""), x, y + 206, {s:17, col:"#374151", max:w}); }
  pg.y = y + 236; }

function footer(pages, m){ var L = m.L, p = m.p, n = pages.length;
  pages.forEach(function(cv, i){ var P = new Pen(cv.getContext("2d")), y = HH - M + 6;
    P.rule(M, y - 44, W - M, "#e3e6ea");
    void 0; var left = (p.compGen !== false && !(p.sigs || []).some(function(s){ return s.id === m.doc.sig; })) || m.doc.sig === "none" ? L("Dokumen ini dijana oleh komputer, tandatangan tidak diperlukan.", "This is a computer-generated document. No signature is required.") : (p.footer || "");
    P.text(left, M, y - 14, {s:15, col:"#9ca3af", max:760});
    P.text((m.doc.no || "") + "   " + L("Muka", "Page") + " " + (i + 1) + "/" + n, W - M, y - 14, {s:15, al:"right", col:"#9ca3af"});
    if(p.brand) P.text("Made with My Ihsan", W / 2, y + 14, {s:13, al:"center", col:"#c0c4ca"});
    frame(cv, m); watermark(P, m); }); }
function watermark(P, m){ var st = m.st, t = st === "draft" ? m.L("DRAF", "DRAFT") : st === "void" ? m.L("BATAL", "VOID") : (st === "paid" && (m.doc.type === "INV")) ? m.L("DIBAYAR", "PAID") : "";
  if(!t) return; var c = P.c; c.save(); c.translate(W / 2, HH / 2); c.rotate(-Math.PI / 7); c.globalAlpha = st === "paid" ? .13 : .1;
  P.text(t, 0, 40, {s:t.length > 12 ? 120 : 190, w:800, al:"center", col:st === "paid" ? "#15803d" : st === "void" ? "#b91c1c" : "#111"}); c.restore(); }

function drawA4(m, im){ var pg = new A4(m), d = m.doc;
  header(pg, m, im); metaBlock(pg, m);
  if((d.type === "CN" || d.type === "DN") && d.reason){ pg.P.text(L("Sebab: ", "Reason: ") + d.reason, M, pg.y + 6, {s:19, it:true, col:"#374151", max:W - 2 * M}); pg.y += 36; }
  if(d.type === "OR" || d.type === "PV") receiptBody(pg, m);
  else { var cols = colsFor(m); tableHead(pg, m, cols); var i = 0, k = 0;
    (d.lines || []).forEach(function(l){ var meas = rowMeasure(pg, m, cols, l); pg.need(meas.h, function(){ tableHead(pg, m, cols); }); if(l.t !== "head") i++; row(pg, m, cols, l, i, k++, meas); });
    if(!(d.lines || []).length){ pg.P.text("—", M + 12, pg.y + 30, {col:"#9ca3af"}); pg.y += 46; }
    pg.y += 10; if(!m.hidePrice) totalsBlock(pg, m); else { var q = (d.lines || []).filter(function(l){ return l.t !== "head"; }).reduce(function(s, l){ return s + ND().num(l.qty); }, 0); pg.P.text(m.L("Jumlah kuantiti", "Total quantity") + ": " + fq(q), W - M, pg.y + 30, {s:20, w:700, al:"right"}); pg.y += 60; }
    if(d.type === "INV" || d.type === "PF" || d.type === "QT") payBlock(pg, m, im); }
  termsBlock(pg, m); sigBlock(pg, m, im); footer(pg.pages, m); return pg.pages; }

// ---------- thermal 80 mm (576 px at 183 dpi) ----------
function drawThermal(m, im){ var TW = 576, X = 22, cv = document.createElement("canvas"), ops = [], y = 18, P;
  var meas = new Pen(document.createElement("canvas").getContext("2d")), L = m.L, d = m.doc, p = m.p, N = ND(), T = m.T;
  var add = function(fn, h){ ops.push([fn, y]); y += h; };
  var center = function(s, o){ (meas.wrap(s, TW - 2 * X, o)).forEach(function(l){ add(function(P, yy){ P.text(l, TW / 2, yy + (o.s || 20), Object.assign({al:"center"}, o)); }, (o.s || 20) + 8); }); };
  var lr = function(a, b, o){ o = o || {}; add(function(P, yy){ P.text(a, X, yy + (o.s || 20), Object.assign({max:TW - 2 * X - 170}, o)); P.text(b, TW - X, yy + (o.s || 20), Object.assign({}, o, {al:"right"})); }, (o.s || 20) + 9); };
  var dash = function(){ add(function(P, yy){ var c = P.c; c.strokeStyle = "#111"; c.setLineDash([6, 5]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(X, yy + 8); c.lineTo(TW - X, yy + 8); c.stroke(); c.setLineDash([]); }, 18); };
  if(im.logo){ var k = Math.min(240 / im.logo.width, 110 / im.logo.height); add(function(P, yy){ P.img(im.logo, TW / 2, yy, 240, 110, "c"); }, im.logo.height * k + 10); }
  center(p.name || "", {s:28, w:800}); bizLines(m).forEach(function(l){ center(l, {s:17}); });
  dash(); center(m.title, {s:22, w:800}); lr(d.no || "DRAF", dateStr(d.date, m.lang), {s:18});
  if(d.cust && d.cust.name) lr(L("Pelanggan", "Customer"), d.cust.name, {s:18});
  dash();
  if(d.type === "OR"){ lr(L("Diterima", "Received"), N.fmt(T.total, m.cur), {s:24, w:800}); var mt = N.METHODS.filter(function(x){ return x[0] === d.method; })[0]; if(mt) lr(L("Kaedah", "Method"), L(mt[1], mt[2]), {s:18}); if(d.pref) lr(L("Rujukan", "Ref."), d.pref, {s:18});
    (d.apply || []).forEach(function(a){ var inv = N.byId(m.D.docs, a.doc); if(inv) lr("  " + (inv.no || ""), N.fmt(N.sen(a.amt), ""), {s:17}); }); }
  else { (d.lines || []).forEach(function(l){ if(l.t === "head"){ add(function(P, yy){ P.text(l.desc || "", X, yy + 20, {s:19, w:700}); }, 28); return; }
      meas.wrap(l.desc || "", TW - 2 * X, {s:19}).forEach(function(w){ add(function(P, yy){ P.text(w, X, yy + 19, {s:19}); }, 25); });
      if(!m.hidePrice) lr("  " + fq(l.qty) + " × " + N.fmt(N.sen(l.price), ""), N.fmt(N.lineAmt(l), ""), {s:18, col:"#333"}); else lr("", fq(l.qty) + " " + (l.unit || ""), {s:18}); });
    dash(); if(!m.hidePrice){ totalsRows(m).forEach(function(r){ lr(r[0], N.fmt(r[1], ""), {s:18}); }); lr(L("JUMLAH", "TOTAL"), N.fmt(T.total, m.cur), {s:26, w:800});
      if(d.type === "CS"){ var mt2 = N.METHODS.filter(function(x){ return x[0] === d.method; })[0]; if(mt2) lr(L("Bayaran", "Paid by"), L(mt2[1], mt2[2]), {s:18}); if(N.sen(d.tend) > T.total){ lr(L("Tunai diberi", "Cash given"), N.fmt(N.sen(d.tend), ""), {s:18}); lr(L("Baki", "Change"), N.fmt(N.sen(d.tend) - T.total, ""), {s:20, w:700}); } }
      else if(T.paid && d.type === "INV") lr(L("Baki", "Balance"), N.fmt(T.bal, ""), {s:20, w:700}); } }
  dash(); wordsFor(m, T.total).forEach(function(w){ center(w, {s:15, it:true}); });
  if(d.notes) center(d.notes, {s:16}); if(d.terms) center(d.terms, {s:14, col:"#444"});
  if(im.qr && d.type !== "CS" && d.type !== "OR"){ add(function(P, yy){ P.img(im.qr, TW / 2, yy, 220, 220, "c"); }, 232); }
  center(L("Terima kasih", "Thank you"), {s:20, w:700}); if(p.brand) center("Made with My Ihsan", {s:13, col:"#888"});
  y += 20; cv.width = TW; cv.height = Math.ceil(y); var c = cv.getContext("2d"); c.fillStyle = "#fff"; c.fillRect(0, 0, TW, cv.height); P = new Pen(c);
  ops.forEach(function(o){ o[0](P, o[1]); });
  if(m.st === "draft" || m.st === "void"){ c.save(); c.globalAlpha = .12; c.translate(TW / 2, cv.height / 2); c.rotate(-0.5); P.text(m.st === "void" ? L("BATAL", "VOID") : L("DRAF", "DRAFT"), 0, 0, {s:90, w:800, al:"center"}); c.restore(); }
  return [cv]; }

// ---------- statement of account (one customer, a period, opening balance, running balance, aging) ----------
function drawSOA(m, im, S){ var pg = new A4(m), P, L = m.L, N = ND();
  header(pg, m, im); P = pg.P; var y = pg.y;
  P.text(L("Kepada", "To").toUpperCase(), M, y + 18, {s:16, w:700, col:m.color, sp:1.5}); P.text(S.cust.name || "", M, y + 52, {s:26, w:700, col:"#111", max:600}); var yy = y + 62;
  custLines(S.cust).forEach(function(l){ yy += P.lines(P.wrap(l, 600, {s:19}), M, yy + 22, 26, {s:19, col:"#40454d"}); });
  P.box(760 - 22, y - 8, W - M - 760 + 22, 3 * 36 + 22, hexA(m.color, .07), 12); var ry = y;
  [[L("Tarikh", "Date"), dateStr(S.to, m.lang)], [L("Tempoh", "Period"), dateStr(S.from, m.lang) + " – " + dateStr(S.to, m.lang)], [L("Baki perlu dibayar", "Balance due"), N.fmt(S.close, m.cur)]].forEach(function(r){ P.text(r[0], 760, ry + 22, {s:18, col:"#6b7280"}); P.text(r[1], W - M - 8, ry + 22, {s:18.5, w:600, al:"right", col:"#111", max:280}); ry += 36; });
  pg.y = Math.max(yy, ry) + 40;
  var cols = [["d", L("Tarikh", "Date"), 160, "l"], ["n", L("Dokumen", "Document"), 0, "l"], ["dr", L("Debit", "Debit"), 170, "r"], ["cr", L("Kredit", "Credit"), 170, "r"], ["b", L("Baki", "Balance"), 180, "r"]];
  cols[1][2] = W - 2 * M - 160 - 170 - 170 - 180;
  var head = function(){ tableHead(pg, m, cols); }; head();
  var line = function(r){ pg.need(44, head); var x = M, y2 = pg.y; cols.forEach(function(c){ var v = c[0] === "d" ? dateStr(r.date, m.lang) : c[0] === "n" ? r.label : c[0] === "dr" ? (r.dr ? N.fmt(r.dr, "") : "") : c[0] === "cr" ? (r.cr ? N.fmt(r.cr, "") : "") : N.fmt(r.bal, "");
      P = pg.P; P.text(v, c[3] === "r" ? x + c[2] - 12 : x + 12, y2 + 30, {s:18.5, al:c[3] === "r" ? "right" : "left", col:"#111", w:c[0] === "b" ? 600 : 400, max:c[2] - 16}); x += c[2]; }); pg.P.rule(M, y2 + 44, W - M, "#e6e8eb", 1); pg.y += 44; };
  line({date:S.from, label:L("Baki dibawa ke hadapan", "Balance brought forward"), bal:S.open}); S.rows.forEach(line);
  pg.need(220); P = pg.P; y = pg.y + 24;
  P.text(L("Umur baki", "Aging").toUpperCase(), M, y + 16, {s:15.5, w:700, col:m.color, sp:1}); y += 30;
  var AG = [L("Semasa", "Current"), "1–30", "31–60", "61–90", "90+"], bw = (W - 2 * M) / 5;
  AG.forEach(function(a, i){ P.box(M + i * bw + 4, y, bw - 8, 86, hexA(m.color, i ? .05 + i * .03 : .07), 10); P.text(a + (i ? L(" hari", " days") : ""), M + i * bw + bw / 2, y + 30, {s:16, al:"center", col:"#4b5058"}); P.text(N.fmt(S.age[i], ""), M + i * bw + bw / 2, y + 66, {s:21, w:700, al:"center", col:"#111"}); });
  y += 110; P.text(L("Jumlah perlu dibayar", "Total due") + ": " + N.fmt(S.close, m.cur), W - M, y + 20, {s:24, w:800, al:"right", col:m.color}); pg.y = y + 50;
  payBlock(pg, m, im); footer(pg.pages, m); return pg.pages; }
function renderSOA(D, p, S, getImg){ var doc = {id:"soa", type:"INV", no:"SOA-" + S.to.replace(/-/g, ""), date:S.to, cust:S.cust, lines:[], status:"sent", sig:"none"};
  var m = model(D, doc, p, {status:"sent"}); m.title = m.L("PENYATA AKAUN", "STATEMENT OF ACCOUNT"); if(m.design === "thermal") m.design = "moden";
  return fontsReady().then(function(){ return images(p, doc, getImg); }).then(function(im){ return drawSOA(m, im, S); }); }

// ---------- public ----------
function images(p, doc, getImg){ var sig = (p.sigs || []).filter(function(s){ return s.id === doc.sig; })[0];
  return Promise.all([loadImg(getImg(p.logo)), loadImg(sig && sig.img ? getImg(sig.img) : ""), loadImg(getImg(p.stamp)), loadImg(getImg(p.qr)), loadImg(doc.csig && doc.csig.img ? getImg(doc.csig.img) : "")])
    .then(function(a){ return {logo:a[0], sig:a[1], stamp:a[2], qr:a[3], csig:a[4]}; }); }
function render(D, doc, p, getImg, opt){ var m = model(D, doc, p, opt);
  return fontsReady().then(function(){ return images(p, doc, getImg); }).then(function(im){ var pages = m.design === "thermal" ? drawThermal(m, im) : drawA4(m, im); pages.thermal = m.design === "thermal"; return pages; }); }
// multi-page PDF of JPEG pages (each page sized to its canvas: A4 or 80 mm wide)
function pdf(pages, q){ var objs = ["<< /Type /Catalog /Pages 2 0 R >>", null], kids = [], n = 3;
  pages.forEach(function(cv){ var mmW = pages.thermal ? 80 : 210, mmH = pages.thermal ? 80 * cv.height / cv.width : 297, Wp = (mmW * 72 / 25.4).toFixed(2), Hp = (mmH * 72 / 25.4).toFixed(2);
    var jb = atob(cv.toDataURL("image/jpeg", q || 0.9).split(",")[1]), cs = "q " + Wp + " 0 0 " + Hp + " 0 0 cm /Im0 Do Q";
    kids.push(n + " 0 R");
    objs.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + Wp + " " + Hp + "] /Resources << /XObject << /Im0 " + (n + 1) + " 0 R >> >> /Contents " + (n + 2) + " 0 R >>");
    objs.push("<< /Type /XObject /Subtype /Image /Width " + cv.width + " /Height " + cv.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jb.length + " >>\nstream\n" + jb + "\nendstream");
    objs.push("<< /Length " + cs.length + " >>\nstream\n" + cs + "\nendstream"); n += 3; });
  objs[1] = "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + pages.length + " >>";
  var out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", off = []; objs.forEach(function(o, i){ off.push(out.length); out += (i + 1) + " 0 obj\n" + o + "\nendobj\n"; });
  var xr = out.length; out += "xref\n0 " + (objs.length + 1) + "\n0000000000 65535 f \n" + off.map(function(o){ return ("0000000000" + o).slice(-10) + " 00000 n \n"; }).join("") + "trailer\n<< /Size " + (objs.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xr + "\n%%EOF";
  return btoa(out); }
// one picture (all pages stacked) for WhatsApp
function picture(pages){ if(pages.length === 1) return pages[0].toDataURL("image/jpeg", .9);
  var k = pages.length > 2 ? .6 : .8, w = Math.round(pages[0].width * k), h = 0; pages.forEach(function(p){ h += Math.round(p.height * k) + 12; });
  var cv = document.createElement("canvas"); cv.width = w; cv.height = h; var c = cv.getContext("2d"); c.fillStyle = "#c9ccd1"; c.fillRect(0, 0, w, h); var y = 0;
  pages.forEach(function(p){ c.drawImage(p, 0, y, w, Math.round(p.height * k)); y += Math.round(p.height * k) + 12; }); return cv.toDataURL("image/jpeg", .88); }

// ---------- image clean-up for signatures and stamps ----------
// white/grey paper → transparent, crop to the ink, optional single ink colour
function cleanInk(src, opt){ opt = opt || {}; return loadImg(src).then(function(im){ if(!im) return null;
  var k = Math.min(1, (opt.max || 900) / Math.max(im.width, im.height)), w = Math.round(im.width * k), h = Math.round(im.height * k);
  var cv = document.createElement("canvas"); cv.width = w; cv.height = h; var c = cv.getContext("2d"); c.drawImage(im, 0, 0, w, h);
  var d = c.getImageData(0, 0, w, h), px = d.data, sum = 0, n = 0;
  for(var i = 0; i < px.length; i += 16){ sum += (px[i] + px[i + 1] + px[i + 2]) / 3; n++; }
  var bg = sum / n, th = Math.min(235, bg - 38), minX = w, minY = h, maxX = 0, maxY = 0, rgb = opt.color ? [parseInt(opt.color.slice(1, 3), 16), parseInt(opt.color.slice(3, 5), 16), parseInt(opt.color.slice(5, 7), 16)] : null;
  for(var y = 0; y < h; y++) for(var x = 0; x < w; x++){ var j = (y * w + x) * 4, l = (px[j] + px[j + 1] + px[j + 2]) / 3;
    if(l >= th){ px[j + 3] = 0; continue; } var a = Math.min(255, Math.round((th - l) / th * 255 * 1.6)); px[j + 3] = a; if(rgb){ px[j] = rgb[0]; px[j + 1] = rgb[1]; px[j + 2] = rgb[2]; }
    if(x < minX) minX = x; if(x > maxX) maxX = x; if(y < minY) minY = y; if(y > maxY) maxY = y; }
  if(maxX <= minX || maxY <= minY) return null;
  c.putImageData(d, 0, 0); var pad = 6, cw = Math.min(w, maxX - minX + 2 * pad), ch = Math.min(h, maxY - minY + 2 * pad), out = document.createElement("canvas"); out.width = cw; out.height = ch;
  out.getContext("2d").drawImage(cv, Math.max(0, minX - pad), Math.max(0, minY - pad), cw, ch, 0, 0, cw, ch); return out.toDataURL("image/png"); }); }
// trim a logo's white border, keep at most 600 px
function trimLogo(src){ return loadImg(src).then(function(im){ if(!im) return null; var k = Math.min(1, 600 / Math.max(im.width, im.height)), w = Math.round(im.width * k), h = Math.round(im.height * k);
  var cv = document.createElement("canvas"); cv.width = w; cv.height = h; var c = cv.getContext("2d"); c.drawImage(im, 0, 0, w, h); var px = c.getImageData(0, 0, w, h).data, minX = w, minY = h, maxX = -1, maxY = -1;
  for(var y = 0; y < h; y++) for(var x = 0; x < w; x++){ var j = (y * w + x) * 4; if(px[j + 3] > 20 && (px[j] + px[j + 1] + px[j + 2]) / 3 < 245){ if(x < minX) minX = x; if(x > maxX) maxX = x; if(y < minY) minY = y; if(y > maxY) maxY = y; } }
  if(maxX < 0) return cv.toDataURL("image/png"); var cw = maxX - minX + 1, ch = maxY - minY + 1, o = document.createElement("canvas"); o.width = cw; o.height = ch; o.getContext("2d").drawImage(cv, minX, minY, cw, ch, 0, 0, cw, ch); return o.toDataURL("image/png"); }); }

window.NiagaTpl = {renderSOA:renderSOA, DESIGNS:DESIGNS, COLORS:COLORS, SIGF:SIGF, render:render, pdf:pdf, picture:picture, cleanInk:cleanInk, trimLogo:trimLogo, dateStr:dateStr, fontsReady:fontsReady, W:W, H:HH};
})();
