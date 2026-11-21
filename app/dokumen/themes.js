/* My Ihsan 0.6.60 · Dokumen page themes + renderers. One layout engine turns the document's blocks into pages of draw operations;
   the same pages draw the live preview (canvas), PNG and PDF, so what you see is what you export. DOCX is written straight from the blocks.
   DokThemes = {THEMES, OPTS, layout(doc, theme, opt) → pages, draw(canvas, page, scale), pdf(canvases) → base64, docx(doc, theme, opt) → Uint8Array, text(doc) → plain} */
(function(){
"use strict";
// [id, BM, EN, font, head, subject, numbered, rule, table, accent, ornament, basmalah, note]
var THEMES = [
  {id:"rasmi", ms:"Rasmi", en:"Official", font:"serif", head:"left", subj:"upper", num:1, rule:"none", table:"grid", acc:"#000000", orn:0, best:["Surat rasmi Malaysia","Malaysian official letters"]},
  {id:"bersih", ms:"Bersih", en:"Clean", font:"sans", head:"left", subj:"bold", num:0, rule:"thin", table:"plain", acc:"#3B4A5A", orn:0, best:["E-mel, memo, notis","Emails, memos, notices"]},
  {id:"moden", ms:"Moden", en:"Modern", font:"sans", head:"band", subj:"bold", num:0, rule:"none", table:"striped", acc:"#0F5C4A", orn:0, best:["CV, surat iringan, cadangan","CV, cover letter, proposals"]},
  {id:"klasik", ms:"Klasik", en:"Classic", font:"serif", head:"center", subj:"bold", num:0, rule:"double", table:"grid", acc:"#6B4E16", orn:1, best:["Rujukan, jemputan, penghargaan","References, invitations, thanks"]},
  {id:"korporat", ms:"Korporat", en:"Corporate", font:"sans", head:"letterhead", subj:"upper", num:1, rule:"thin", table:"striped", acc:"#1F3A68", orn:0, best:["Surat perniagaan, sebut harga","Business letters, quotations"]},
  {id:"dua_lajur", ms:"Dua lajur", en:"Two-column", font:"sans", head:"side", subj:"bold", num:0, rule:"none", table:"plain", acc:"#2B4C7E", orn:0, best:["CV (moden)","CV (modern)"]},
  {id:"ats", ms:"ATS Polos", en:"ATS Plain", font:"sans", head:"left", subj:"bold", num:0, rule:"none", table:"plain", acc:"#000000", orn:0, plain:1, best:["CV untuk portal kerja","CV for job portals"]},
  {id:"minimal", ms:"Minimal", en:"Minimal", font:"mono", head:"left", subj:"bold", num:0, rule:"none", table:"plain", acc:"#222222", orn:0, best:["Itinerari, nota, agenda","Itinerary, notes, agenda"]},
  {id:"islami", ms:"Islami", en:"Islamic", font:"serif", head:"center", subj:"bold", num:0, rule:"double", table:"grid", acc:"#0F6B4F", orn:2, bas:1, best:["Surat surau, jemputan, takziah","Surau letters, invitations, condolences"]},
  {id:"jadual", ms:"Jadual", en:"Table", font:"sans", head:"left", subj:"bold", num:0, rule:"thin", table:"band", acc:"#0F5C4A", orn:0, best:["Itinerari, bajet, minit","Itinerary, budget, minutes"]}];
var ACCENTS = [["","Tema","Theme"],["#111111","Dakwat","Ink"],["#1F3A68","Biru laut","Navy"],["#0F6B4F","Zamrud","Emerald"],["#0E6B73","Teal","Teal"],["#7A1F2B","Marun","Maroon"],["#9A7424","Emas","Gold"],["#5B2C6F","Ungu","Plum"],["#44546A","Kelabu","Slate"]];
var FONTS = {serif:'"Times New Roman",Tinos,"Liberation Serif",Georgia,serif', sans:'Arial,"Liberation Sans",Roboto,"Helvetica Neue",sans-serif', mono:'"Courier New","Liberation Mono",monospace', round:'"Nunito","Varela Round",Arial,sans-serif', ar:'"AmiriL","Amiri","Noto Naskh Arabic",serif'};
var OPTS = {acc:"", font:"", size:"n", lead:1.15, paper:"a4", margin:"n", header:"auto", footer:"page", sign:"typed", wm:"", wmText:"DRAF"};
var PX = 150 / 25.4;   // pixels per mm at 150 dpi
var PAPER = {a4:[210, 297], letter:[215.9, 279.4]}, MARG = {s:15, n:25, w:32};
var AR = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
function th(id){ for(var i = 0; i < THEMES.length; i++) if(THEMES[i].id === id) return THEMES[i]; return THEMES[0]; }
function O(opt){ var o = {}; for(var k in OPTS) o[k] = OPTS[k]; for(var j in (opt || {})) if(opt[j] != null) o[j] = opt[j]; return o; }

// ---------- layout ----------
var mc = null; function mctx(){ if(!mc) mc = document.createElement("canvas").getContext("2d"); return mc; }
function fontStr(sz, bold, it, fam){ return (it ? "italic " : "") + (bold ? "700 " : "400 ") + sz.toFixed(1) + "px " + fam; }
function wrap(text, w, font){ var c = mctx(); c.font = font; var out = []; String(text == null ? "" : text).split("\n").forEach(function(para){
    var words = para.split(/(\s+)/), line = ""; if(!para){ out.push(""); return; }
    words.forEach(function(wd){ var t = line + wd; if(c.measureText(t).width > w && line.trim()){ out.push(line.replace(/\s+$/, "")); line = wd.replace(/^\s+/, ""); while(c.measureText(line).width > w && line.length > 1){ var k = line.length; while(k > 1 && c.measureText(line.slice(0, k)).width > w) k--; out.push(line.slice(0, k)); line = line.slice(k); } } else line = t; });
    out.push(line.replace(/\s+$/, "")); }); return out; }
function layout(doc, themeId, opt){
  var T = th(themeId), o = O(opt), pap = PAPER[o.paper] || PAPER.a4, W = Math.round(pap[0] * PX), Hh = Math.round(pap[1] * PX), m = (MARG[o.margin] || 25) * PX;
  var fam = FONTS[o.font || T.font] || FONTS.sans, base = {s:20, n:23, l:27}[o.size] || 23, lead = +o.lead || 1.15, acc = o.acc || T.acc;
  var lh = base * lead * 1.18, pages = [], pg, y, x0 = m, x1 = W - m, side = T.head === "side", sideW = side ? Math.round(W * 0.3) : 0, cx0 = side ? sideW + m * 0.6 : x0, cw = x1 - cx0;
  var gaps = [];
  function newPage(){ pg = {w:W, h:Hh, ops:[], bg:"#ffffff"}; pages.push(pg); y = m;
    if(side){ pg.ops.push({t:"rect", x:0, y:0, w:sideW, h:Hh, c:acc, a:0.09}); }
    if(T.rule === "double"){ pg.ops.push({t:"frame", x:m * 0.45, y:m * 0.45, w:W - m * 0.9, h:Hh - m * 0.9, c:acc}); }
    if(T.orn === 2){ [[m * 0.45, m * 0.45, 1, 1], [W - m * 0.45, m * 0.45, -1, 1], [m * 0.45, Hh - m * 0.45, 1, -1], [W - m * 0.45, Hh - m * 0.45, -1, -1]].forEach(function(p){ pg.ops.push({t:"corner", x:p[0], y:p[1], sx:p[2], sy:p[3], c:acc}); }); }
    if(o.wm){ pg.ops.push({t:"wm", x:W / 2, y:Hh / 2, s:o.wm === "custom" ? (o.wmText || "DRAF") : "DRAF", f:fontStr(base * 5, true, false, fam)}); }
    if(pages.length > 1) y = m * 0.85; }
  function need(h){ if(y + h > Hh - m * (o.footer && o.footer !== "none" ? 1.15 : 1)){ newPage(); return true; } return false; }
  function text(s, opt2){ opt2 = opt2 || {}; var sz = opt2.size || base, bold = !!opt2.bold, f = fontStr(sz, bold, !!opt2.it, AR.test(s) ? FONTS.ar : (opt2.fam || fam)), left = opt2.x != null ? opt2.x : cx0, w = opt2.w || (x1 - left), al = opt2.align || (AR.test(s) ? "right" : "left");
    var lines = wrap(s, w, f), l2 = sz * lead * 1.18; lines.forEach(function(ln){ need(l2); var xx = al === "center" ? left + w / 2 : al === "right" ? left + w : left;
      pg.ops.push({t:"text", x:xx, y:y + sz, s:ln, f:f, c:opt2.c || "#111111", al:al, rtl:AR.test(ln), b:opt2.b}); y += l2; }); return lines.length; }
  function gap(px){ y += px; }
  // header
  newPage();
  var P = doc.prof || {}, hd = o.header === "auto" ? (T.head === "letterhead" ? "letterhead" : "none") : o.header;
  if(T.bas){ text("بسم الله الرحمن الرحيم", {align:"center", size:base * 1.35, c:acc}); gap(base * 0.4); }
  if(T.head === "band" && (doc.kind === "cv" || hd !== "none")){ pg.ops.push({t:"rect", x:0, y:0, w:W, h:m * 0.42, c:acc, a:1}); }
  if(hd === "letterhead" || hd === "logo"){ var lt = P.co || P.name || ""; if(P.logo && hd !== "name") pg.ops.push({t:"img", src:P.logo, x:x0, y:y, w:base * 3.2, h:base * 3.2}); var lx = P.logo ? x0 + base * 3.8 : x0;
    if(lt){ text(lt, {x:lx, w:x1 - lx, size:base * 1.35, bold:true, c:acc}); } var sub = [P.reg ? "(" + P.reg + ")" : "", P.addr, [P.phone, P.email].filter(Boolean).join(" · ")].filter(Boolean).join("\n"); if(sub) text(sub, {x:lx, w:x1 - lx, size:base * 0.78, c:"#444444"});
    gap(base * 0.3); pg.ops.push({t:"line", x1:x0, y1:y, x2:x1, y2:y, c:acc, w:3}); gap(base * 0.9); }
  else if(hd === "name" && (P.name || doc.title)){ text(P.name || doc.title, {size:base * 1.2, bold:true, c:acc}); gap(base * 0.4); }
  // side column (two-column CV): contact and short facts
  if(side){ var sy = m, sx = m * 0.5, sw = sideW - m * 0.8; doc.blocks.forEach(function(b, bi){ if(b.t !== "kv" && b.t !== "side") return;
      (b.items || []).forEach(function(it){ var lines = wrap((it[0] ? it[0] + ": " : "") + it[1], sw, fontStr(base * 0.82, false, false, fam)); lines.forEach(function(ln){ pg.ops.push({t:"text", x:sx, y:sy + base * 0.82, s:ln, f:fontStr(base * 0.82, false, false, fam), c:"#222222", al:"left", b:bi}); sy += base * 0.82 * 1.4; }); sy += base * 0.3; }); }); }
  // blocks
  var pn = 0;
  doc.blocks.forEach(function(b, bi){ var t = b.t, S = function(s, x){ x = x || {}; x.b = bi; return text(s, x); };
    if(side && (t === "kv" || t === "side")) return;
    if(t === "pagebreak"){ newPage(); return; }
    if(t === "title"){ S(b.text, {size:base * (T.head === "band" ? 1.7 : 1.45), bold:true, c:acc, align:T.head === "center" ? "center" : "left"}); if(T.rule === "thin"){ pg.ops.push({t:"line", x1:cx0, y1:y + 4, x2:x1, y2:y + 4, c:"#BBBBBB", w:1.5}); } gap(base * 0.7); return; }
    if(t === "from" || t === "to"){ S((b.lines || []).join("\n"), {size:base, align:T.head === "center" && t === "from" ? "center" : "left"}); gap(base * 0.8); return; }
    if(t === "date"){ S(b.text, {align:doc.kind === "letter" && T.id === "rasmi" ? "left" : "left"}); gap(base * 0.6); return; }
    if(t === "ref"){ S(b.text, {size:base * 0.92}); gap(base * 0.3); return; }
    if(t === "salute"){ S(b.text); gap(base * 0.5); return; }
    if(t === "subject"){ var st = T.subj === "upper" ? String(b.text || "").toUpperCase() : b.text; S(st, {bold:true}); if(T.id === "rasmi") pg.ops.push({t:"line", x1:cx0, y1:y - base * 0.15, x2:Math.min(x1, cx0 + mctx().measureText(st).width), y2:y - base * 0.15, c:"#111111", w:1.5, b:bi}); gap(base * 0.7); return; }
    if(t === "h"){ need(base * 3); gap(base * 0.4); S(T.plain ? String(b.text).toUpperCase() : b.text, {bold:true, size:base * 1.12, c:T.plain ? "#000000" : acc}); if(T.id === "moden" || T.id === "korporat"){ pg.ops.push({t:"line", x1:cx0, y1:y - 2, x2:x1, y2:y - 2, c:acc, w:1.5}); } gap(base * 0.35); return; }
    if(t === "p"){ var numd = T.num && doc.kind === "letter" && b.n; if(numd){ pn++; var ind = base * 1.6; need(lh); pg.ops.push({t:"text", x:cx0, y:y + base, s:pn + ".", f:fontStr(base, false, false, fam), c:"#111111", al:"left", b:bi}); S(b.text, {x:cx0 + ind, w:x1 - cx0 - ind}); } else S(b.text);
      gap(base * 0.55); return; }
    if(t === "list" || t === "check"){ (b.items || []).forEach(function(it, k){ var mk = t === "check" ? "☐" : b.num ? (k + 1) + "." : "•", ind = base * 1.5; need(lh); pg.ops.push({t:"text", x:cx0 + base * 0.3, y:y + base, s:mk, f:fontStr(base, false, false, t === "check" ? 'Arial,"DejaVu Sans",sans-serif' : fam), c:acc, al:"left", b:bi}); S(it, {x:cx0 + ind, w:x1 - cx0 - ind}); gap(base * 0.15); }); gap(base * 0.45); return; }
    if(t === "kv"){ (b.items || []).forEach(function(it){ S((it[0] ? it[0] + ": " : "") + it[1], {size:base * 0.95}); }); gap(base * 0.5); return; }
    if(t === "quote"){ var q0 = y; S(b.text, {x:cx0 + base * 1.2, w:x1 - cx0 - base * 1.2, it:true}); pg.ops.push({t:"rect", x:cx0, y:q0, w:4, h:y - q0, c:acc, a:0.7, b:bi}); gap(base * 0.5); return; }
    if(t === "table"){ var head = b.head || [], rows = b.rows || [], n = Math.max(head.length, rows.reduce(function(a, r){ return Math.max(a, r.length); }, 0)) || 1, cwid = (x1 - cx0) / n, tsz = base * 0.86, tf = fontStr(tsz, false, false, fam), hf = fontStr(tsz, true, false, fam), pad = tsz * 0.45;
      var rowH = function(r, f){ var mx = 1; r.forEach(function(c){ mx = Math.max(mx, wrap(c, cwid - pad * 2, f).length); }); return mx * tsz * 1.32 + pad * 2; };
      var drawRow = function(r, f, hdr, k){ var h = rowH(r, f); if(need(h) && head.length && !hdr) drawRow(head, hf, true, -1);
        if(hdr && T.table !== "plain") pg.ops.push({t:"rect", x:cx0, y:y, w:x1 - cx0, h:h, c:acc, a:T.table === "band" ? 1 : 0.12, b:bi});
        else if(T.table === "striped" && k % 2 === 1) pg.ops.push({t:"rect", x:cx0, y:y, w:x1 - cx0, h:h, c:acc, a:0.06, b:bi});
        for(var i = 0; i < n; i++){ var ls = wrap(r[i] == null ? "" : r[i], cwid - pad * 2, f); ls.forEach(function(ln, li){ var rt = AR.test(ln); pg.ops.push({t:"text", x:rt ? cx0 + cwid * (i + 1) - pad : cx0 + cwid * i + pad, y:y + pad + tsz * (li + 0.95) * 1.32 - tsz * 0.3, s:ln, f:f, c:hdr && T.table === "band" ? "#ffffff" : "#111111", al:rt ? "right" : "left", rtl:rt, b:bi}); });
          if(T.table === "grid") pg.ops.push({t:"box", x:cx0 + cwid * i, y:y, w:cwid, h:h, c:"#777777", b:bi}); }
        if(T.table === "plain" || T.table === "striped") pg.ops.push({t:"line", x1:cx0, y1:y + h, x2:x1, y2:y + h, c:"#CCCCCC", w:1, b:bi});
        y += h; };
      if(head.length) drawRow(head, hf, true, -1); rows.forEach(function(r, k){ drawRow(r, tf, false, k); }); gap(base * 0.8); return; }
    if(t === "close"){ gap(base * 0.2); S(b.text); gap(base * 0.4); return; }
    if(t === "sign"){ need(base * 6); var lines = b.lines || []; if(lines.length) S(lines[0]);
      if(o.sign === "image" && P.sign){ pg.ops.push({t:"img", src:P.sign, x:cx0, y:y + 4, w:base * 6, h:base * 2.6, b:bi}); gap(base * 3); } else gap(base * (o.sign === "none" ? 2.6 : 2.2));
      lines.slice(1).forEach(function(l){ if(l) S(l); }); gap(base * 0.5); return; }
    if(t === "cc"){ S((doc.lang === "en" ? "cc: " : "s.k.: ") + (b.items || []).join(", "), {size:base * 0.9}); gap(base * 0.3); return; }
    if(t === "gap"){ var gy = y; S("[" + (doc.lang === "en" ? "fill in: " : "isi: ") + b.field + "]", {c:"#8A6100"}); pg.ops.push({t:"hl", x:cx0, y:gy + base * 0.15, w:Math.min(x1 - cx0, mctx().measureText("[isi: " + b.field + "]").width + base), h:y - gy, b:bi}); gaps.push(bi); gap(base * 0.3); return; }
    if(b.text) S(b.text); });
  // footer
  if(o.footer && o.footer !== "none"){ pages.forEach(function(p, i){ var s = o.footer === "pageof" ? (i + 1) + " / " + pages.length : String(i + 1); if(pages.length === 1 && o.footer === "page") return;
      p.ops.push({t:"text", x:W / 2, y:Hh - m * 0.5, s:s, f:fontStr(base * 0.75, false, false, fam), c:"#777777", al:"center"}); }); }
  pages.gaps = gaps; return pages; }

// ---------- draw ----------
var IMG = {};
function img(src){ if(IMG[src]) return IMG[src]; var i = new Image(); i.src = src; IMG[src] = i; return i; }
function draw(cv, page, scale){ scale = scale || 1; cv.width = Math.round(page.w * scale); cv.height = Math.round(page.h * scale); var c = cv.getContext("2d"); c.setTransform(scale, 0, 0, scale, 0, 0);
  c.fillStyle = page.bg || "#fff"; c.fillRect(0, 0, page.w, page.h);
  page.ops.forEach(function(o){ c.save();
    if(o.t === "text"){ c.font = o.f; c.fillStyle = o.c; c.textAlign = o.al; c.direction = o.rtl ? "rtl" : "ltr"; c.textBaseline = "alphabetic"; c.fillText(o.s, o.x, o.y); }
    else if(o.t === "rect"){ c.globalAlpha = o.a == null ? 1 : o.a; c.fillStyle = o.c; c.fillRect(o.x, o.y, o.w, o.h); }
    else if(o.t === "line"){ c.strokeStyle = o.c; c.lineWidth = o.w || 1; c.beginPath(); c.moveTo(o.x1, o.y1); c.lineTo(o.x2, o.y2); c.stroke(); }
    else if(o.t === "box"){ c.strokeStyle = o.c; c.lineWidth = 1; c.strokeRect(o.x, o.y, o.w, o.h); }
    else if(o.t === "hl"){ c.fillStyle = "rgba(255,214,0,.32)"; c.fillRect(o.x, o.y, o.w, o.h); }
    else if(o.t === "frame"){ c.strokeStyle = o.c; c.lineWidth = 3; c.strokeRect(o.x, o.y, o.w, o.h); c.lineWidth = 1; c.strokeRect(o.x + 9, o.y + 9, o.w - 18, o.h - 18); }
    else if(o.t === "corner"){ c.strokeStyle = o.c; c.lineWidth = 2; c.translate(o.x, o.y); c.scale(o.sx, o.sy); c.beginPath(); for(var k = 0; k < 3; k++){ var r = 26 + k * 18; c.moveTo(r, 0); c.lineTo(0, 0); c.lineTo(0, r); c.moveTo(r * 0.6, r * 0.6); c.arc(r * 0.6, r * 0.6, 3, 0, Math.PI * 2); } c.stroke(); }
    else if(o.t === "wm"){ c.globalAlpha = 0.07; c.fillStyle = "#000"; c.font = o.f; c.textAlign = "center"; c.translate(o.x, o.y); c.rotate(-Math.PI / 5); c.fillText(o.s, 0, 0); }
    else if(o.t === "img"){ var im = img(o.src); if(im.complete && im.naturalWidth){ var r2 = Math.min(o.w / im.naturalWidth, o.h / im.naturalHeight); c.drawImage(im, o.x, o.y, im.naturalWidth * r2, im.naturalHeight * r2); } }
    c.restore(); }); }
function ready(pages){ var srcs = []; pages.forEach(function(p){ p.ops.forEach(function(o){ if(o.t === "img") srcs.push(o.src); }); });
  return Promise.all(srcs.map(function(s){ var i = img(s); return i.complete ? 1 : new Promise(function(r){ i.onload = i.onerror = r; }); })); }
function hit(page, x, y){ var best = null; page.ops.forEach(function(o){ if(o.b == null) return; var top = o.t === "text" ? o.y - 30 : o.y, bot = o.t === "text" ? o.y + 6 : o.y + (o.h || 0); if(y >= top && y <= bot) best = o.b; }); return best; }

// ---------- PDF (one JPEG per page) ----------
function pdf(cvs, mm){ mm = mm || [210, 297]; var W = (mm[0] * 72 / 25.4).toFixed(2), Hh = (mm[1] * 72 / 25.4).toFixed(2), n = cvs.length, objs = [], kids = [];
  objs.push("<< /Type /Catalog /Pages 2 0 R >>"); objs.push(null);
  cvs.forEach(function(cv, i){ var du = cv.toDataURL("image/jpeg", 0.9), jb = atob(du.split(",")[1]), pi = objs.length + 1, ii = pi + 1, ci = pi + 2, cs = "q " + W + " 0 0 " + Hh + " 0 0 cm /Im0 Do Q";
    kids.push(pi + " 0 R");
    objs.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + W + " " + Hh + "] /Resources << /XObject << /Im0 " + ii + " 0 R >> >> /Contents " + ci + " 0 R >>");
    objs.push("<< /Type /XObject /Subtype /Image /Width " + cv.width + " /Height " + cv.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jb.length + " >>\nstream\n" + jb + "\nendstream");
    objs.push("<< /Length " + cs.length + " >>\nstream\n" + cs + "\nendstream"); });
  objs[1] = "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + n + " >>";
  var out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", off = []; objs.forEach(function(o, i){ off.push(out.length); out += (i + 1) + " 0 obj\n" + o + "\nendobj\n"; });
  var xr = out.length; out += "xref\n0 " + (objs.length + 1) + "\n0000000000 65535 f \n" + off.map(function(o){ return ("0000000000" + o).slice(-10) + " 00000 n \n"; }).join("") + "trailer\n<< /Size " + (objs.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xr + "\n%%EOF";
  return btoa(out); }

// ---------- DOCX (zip, no library) ----------
var CRC = null; function crc32(u8){ if(!CRC){ CRC = []; for(var n = 0; n < 256; n++){ var c = n; for(var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c >>> 0; } }
  var x = 0xFFFFFFFF; for(var i = 0; i < u8.length; i++) x = CRC[(x ^ u8[i]) & 0xFF] ^ (x >>> 8); return (x ^ 0xFFFFFFFF) >>> 0; }
function zip(files){ var enc = new TextEncoder(), parts = [], cen = [], off = 0;
  files.forEach(function(f){ var name = enc.encode(f[0]), data = typeof f[1] === "string" ? enc.encode(f[1]) : f[1], crc = crc32(data), h = new Uint8Array(30 + name.length), dv = new DataView(h.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true); dv.setUint16(8, 0, true); dv.setUint32(14, crc, true); dv.setUint32(18, data.length, true); dv.setUint32(22, data.length, true); dv.setUint16(26, name.length, true); h.set(name, 30);
    var c = new Uint8Array(46 + name.length), cv = new DataView(c.buffer); cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, off, true); c.set(name, 46);
    parts.push(h, data); cen.push(c); off += h.length + data.length; });
  var cl = cen.reduce(function(a, c){ return a + c.length; }, 0), e = new Uint8Array(22), ev = new DataView(e.buffer); ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, cl, true); ev.setUint32(16, off, true);
  var all = parts.concat(cen, [e]), len = all.reduce(function(a, p){ return a + p.length; }, 0), out = new Uint8Array(len), p = 0; all.forEach(function(x){ out.set(x, p); p += x.length; }); return out; }
function xe(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function docx(doc, themeId, opt){ var T = th(themeId), o = O(opt), acc = (o.acc || T.acc).replace("#", ""), font = {serif:"Times New Roman", sans:"Arial", mono:"Courier New", round:"Arial"}[o.font || T.font] || "Arial", sz = ({s:20, n:22, l:26}[o.size] || 22);
  var run = function(t, x){ x = x || {}; var rtl = AR.test(t), rp = '<w:rPr><w:rFonts w:ascii="' + font + '" w:hAnsi="' + font + '" w:cs="' + (rtl ? "Traditional Arabic" : font) + '"/>' + (x.b ? "<w:b/>" : "") + (x.i ? "<w:i/>" : "") + (x.c ? '<w:color w:val="' + x.c + '"/>' : "") + '<w:sz w:val="' + (x.sz || sz) + '"/>' + (rtl ? "<w:rtl/>" : "") + "</w:rPr>";
    return String(t).split("\n").map(function(l, i){ return (i ? "<w:r><w:br/></w:r>" : "") + "<w:r>" + rp + '<w:t xml:space="preserve">' + xe(l) + "</w:t></w:r>"; }).join(""); };
  var par = function(t, x){ x = x || {}; return "<w:p><w:pPr>" + (x.al ? '<w:jc w:val="' + x.al + '"/>' : "") + (AR.test(t) ? "<w:bidi/>" : "") + '<w:spacing w:after="' + (x.after == null ? 160 : x.after) + '" w:line="' + Math.round(240 * (+o.lead || 1.15)) + '" w:lineRule="auto"/>' + (x.ind ? '<w:ind w:left="' + x.ind + '" w:hanging="360"/>' : "") + "</w:pPr>" + run(t, x) + "</w:p>"; };
  var body = [], P = doc.prof || {}, pn = 0;
  if(T.bas) body.push(par("بسم الله الرحمن الرحيم", {al:"center", c:acc}));
  if(T.head === "letterhead" && (P.co || P.name)){ body.push(par(P.co || P.name, {b:1, sz:sz + 8, c:acc, after:0})); body.push(par([P.reg ? "(" + P.reg + ")" : "", P.addr, [P.phone, P.email].filter(Boolean).join(" · ")].filter(Boolean).join("\n"), {sz:sz - 4})); }
  doc.blocks.forEach(function(b){ var t = b.t;
    if(t === "title") body.push(par(b.text, {b:1, sz:sz + 10, c:acc, al:T.head === "center" ? "center" : null}));
    else if(t === "from" || t === "to") body.push(par((b.lines || []).join("\n")));
    else if(t === "subject") body.push(par(T.subj === "upper" ? String(b.text).toUpperCase() : b.text, {b:1}));
    else if(t === "h") body.push(par(b.text, {b:1, sz:sz + 3, c:acc}));
    else if(t === "p"){ if(T.num && doc.kind === "letter" && b.n){ pn++; body.push(par(pn + ".\t" + b.text, {ind:720})); } else body.push(par(b.text)); }
    else if(t === "list" || t === "check") (b.items || []).forEach(function(it, k){ body.push(par((t === "check" ? "☐ " : b.num ? (k + 1) + ". " : "• ") + it, {ind:720, after:60})); });
    else if(t === "kv") (b.items || []).forEach(function(it){ body.push(par((it[0] ? it[0] + ": " : "") + it[1], {after:40})); });
    else if(t === "quote") body.push(par(b.text, {i:1, ind:720}));
    else if(t === "table"){ var head = b.head || [], rows = b.rows || [], n = Math.max(head.length, rows.reduce(function(a, r){ return Math.max(a, r.length); }, 0)) || 1, cell = function(v, hd){ return '<w:tc><w:tcPr><w:tcW w:w="' + Math.floor(9000 / n) + '" w:type="dxa"/>' + (hd ? '<w:shd w:val="clear" w:color="auto" w:fill="' + acc + '"/>' : "") + "</w:tcPr>" + par(v == null ? "" : v, {b:hd, c:hd ? "FFFFFF" : null, after:0}) + "</w:tc>"; };
      body.push('<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>' + ["top", "left", "bottom", "right", "insideH", "insideV"].map(function(s){ return "<w:" + s + ' w:val="single" w:sz="4" w:color="999999"/>'; }).join("") + "</w:tblBorders></w:tblPr>" +
        (head.length ? '<w:tr><w:trPr><w:tblHeader/></w:trPr>' + head.map(function(h){ return cell(h, 1); }).join("") + "</w:tr>" : "") + rows.map(function(r){ var cs = []; for(var i = 0; i < n; i++) cs.push(cell(r[i], 0)); return "<w:tr>" + cs.join("") + "</w:tr>"; }).join("") + "</w:tbl>");
      body.push(par("", {after:120})); }
    else if(t === "sign"){ var ls = b.lines || []; body.push(par(ls[0] || "", {after:720})); body.push(par(ls.slice(1).filter(Boolean).join("\n"))); }
    else if(t === "cc") body.push(par((doc.lang === "en" ? "cc: " : "s.k.: ") + (b.items || []).join(", "), {sz:sz - 2}));
    else if(t === "gap") body.push(par("[" + (doc.lang === "en" ? "fill in: " : "isi: ") + b.field + "]", {c:"8A6100"}));
    else if(t === "pagebreak") body.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    else if(b.text != null) body.push(par(b.text)); });
  var pap = PAPER[o.paper] || PAPER.a4, twip = function(mm){ return Math.round(mm / 25.4 * 1440); }, mg = twip(MARG[o.margin] || 25);
  var docXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body.join("") +
    '<w:sectPr><w:pgSz w:w="' + twip(pap[0]) + '" w:h="' + twip(pap[1]) + '"/><w:pgMar w:top="' + mg + '" w:right="' + mg + '" w:bottom="' + mg + '" w:left="' + mg + '" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>';
  return zip([["[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
    ["_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
    ["word/document.xml", docXml]]); }

// ---------- plain text (copy, email, WhatsApp) ----------
function text(doc){ var out = [], pn = 0; doc.blocks.forEach(function(b){ var t = b.t;
    if(t === "from" || t === "to") out.push((b.lines || []).join("\n")); else if(t === "list") out.push((b.items || []).map(function(x, k){ return (b.num ? (k + 1) + ". " : "• ") + x; }).join("\n"));
    else if(t === "check") out.push((b.items || []).map(function(x){ return "☐ " + x; }).join("\n")); else if(t === "kv") out.push((b.items || []).map(function(x){ return (x[0] ? x[0] + ": " : "") + x[1]; }).join("\n"));
    else if(t === "table") out.push([(b.head || []).join(" | ")].concat((b.rows || []).map(function(r){ return r.join(" | "); })).filter(Boolean).join("\n"));
    else if(t === "sign") out.push((b.lines || []).filter(Boolean).join("\n")); else if(t === "cc") out.push((doc.lang === "en" ? "cc: " : "s.k.: ") + (b.items || []).join(", "));
    else if(t === "gap") out.push("[" + b.field + "]"); else if(t === "subject") out.push(String(b.text || "").toUpperCase());
    else if(t === "p" && b.n && doc.kind === "letter"){ pn++; out.push(pn + ". " + b.text); } else if(b.text) out.push(b.text); });
  return out.join("\n\n"); }
window.DokThemes = {THEMES:THEMES, ACCENTS:ACCENTS, OPTS:OPTS, PAPER:PAPER, th:th, layout:layout, draw:draw, ready:ready, hit:hit, pdf:pdf, docx:docx, zip:zip, crc32:crc32, text:text};
})();
