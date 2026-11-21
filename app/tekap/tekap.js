/* My Ihsan 0.6.63 · Tulis › ✍️ Tekap / Trace (owner spec tekap-ar-trace-spec.md, phases A + B).
   A project = a page (A4, A5, Letter, square, custom mm) with a stack of layers (text, image). Guides come from the font's real metrics
   (baseline, x-height, cap height, ascender, descender), plus slant lines, grid, the blackletter nib ladder and the Naskh dot ladder.
   Trace opens the camera: 📐 Stand (phone fixed above the paper; the guide is moved, pinched, rotated, flipped, warped by its 4 corners,
   locked) — 📄 Paper lock (AR) comes in phase C. Fonts: Old English + Naskh bundled (OFL), any .ttf/.otf/.woff from the phone.
   Storage: ihsan_tekap {projects, fonts, last, set}; font files and pictures in IndexedDB "tekap" (stores fonts, imgs).
   Tekap.view(el, H) with H = {N, S, L2x, esc, toast, load, save, showSheet, closeOverlay, canvasPdf, sharePdf, on, off, loadJs}. */
(function(){
"use strict";
var H = null, EL = null, KEY = "ihsan_tekap";
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function uid(){ return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
var ST = {pg:"home", id:null, sel:null};

// ---------- storage ----------
function db(){ var d = H.load(KEY, null) || {}; d.projects = d.projects || []; d.fonts = d.fonts || []; d.set = d.set || {}; return d; }
function dbSave(d){ H.save(KEY, d); }
function proj(id){ return db().projects.filter(function(p){ return p.id === id; })[0] || null; }
function projPut(p){ var d = db(), i = d.projects.map(function(x){ return x.id; }).indexOf(p.id); p.upd = Date.now(); if(i >= 0) d.projects[i] = p; else d.projects.unshift(p); d.last = p.id; dbSave(d); }
var IDB = null;
function idb(){ if(IDB) return IDB; IDB = new Promise(function(ok){ if(!window.indexedDB){ ok(null); return; } var r = indexedDB.open("tekap", 1);
  r.onupgradeneeded = function(){ ["fonts", "imgs"].forEach(function(s){ if(!r.result.objectStoreNames.contains(s)) r.result.createObjectStore(s); }); }; r.onsuccess = function(){ ok(r.result); }; r.onerror = function(){ ok(null); }; }); return IDB; }
function iget(store, k){ return idb().then(function(d){ return d ? new Promise(function(ok){ try{ var q = d.transaction(store).objectStore(store).get(k); q.onsuccess = function(){ ok(q.result || null); }; q.onerror = function(){ ok(null); }; }catch(e){ ok(null); } }) : MEM[store + k] || null; }); }
function iput(store, k, v){ return idb().then(function(d){ if(!d){ MEM[store + k] = v; return; } return new Promise(function(ok){ try{ var t = d.transaction(store, "readwrite"); t.objectStore(store).put(v, k); t.oncomplete = ok; t.onerror = ok; }catch(e){ ok(); } }); }); }
function idel(store, k){ return idb().then(function(d){ if(d) try{ d.transaction(store, "readwrite").objectStore(store).delete(k); }catch(e){} }); }
var MEM = {};

// ---------- fonts ----------
// bundled (OFL): first set = Old English (blackletter) + Naskh
var BF = [["maguntia","UnifrakturMaguntia","unifrakturmaguntia-latin-400-normal.woff","old"],["cook","UnifrakturCook","unifrakturcook-latin-700-normal.woff","old"],["pirata","Pirata One","pirata-one-latin-400-normal.woff","old"],["grenze","Grenze Gotisch","grenze-gotisch-latin-400-normal.woff","old"],
  ["amiri","Amiri","amiri-arabic-400-normal.woff","naskh"],["scheh","Scheherazade New","scheherazade-new-arabic-400-normal.woff","naskh"],["noto","Noto Naskh Arabic","noto-naskh-arabic-arabic-400-normal.woff","naskh"],
  ["fell","IM Fell English","../../fonts/im-fell-english-latin-400-normal.woff2","serif"],["fraunces","Fraunces","../../fonts/fraunces-latin-400-normal.woff2","serif"],["jakarta","Plus Jakarta Sans","../../fonts/plus-jakarta-sans-latin-400-normal.woff2","sans"],["pinyon","Pinyon Script","../../fonts/pinyon-script-latin-400-normal.woff2","script"]];
function fontList(){ return BF.map(function(b){ return {id:b[0], name:b[1], file:b[2], kind:b[3], bundled:true}; }).concat(db().fonts.map(function(f){ return {id:f.id, name:f.name, kind:"user", user:true, fav:f.fav, lic:f.lic, licNote:f.licNote}; })); }
function fontById(id){ return fontList().filter(function(f){ return f.id === id; })[0] || fontList()[0]; }
var FC = {};   // id → {fam, metrics, ot, ready:Promise}
function xhrBuf(u){ return new Promise(function(ok, no){ var x = new XMLHttpRequest(); x.open("GET", u, true); x.responseType = "arraybuffer"; x.onload = function(){ if(x.status === 0 || (x.status >= 200 && x.status < 300)) ok(x.response); else no(new Error("font " + x.status)); }; x.onerror = function(){ no(new Error("font")); }; x.send(); }); }
function fontLoad(id){ if(FC[id]) return FC[id].ready; var f = fontById(id), fam = "TK_" + f.id, rec = FC[id] = {fam:fam};
  var getBuf = f.bundled ? xhrBuf("tekap/fonts/" + f.file) : iget("fonts", f.id);
  rec.ready = Promise.resolve(getBuf).then(function(buf){ if(!buf) throw new Error("nofont");
    var ff = new FontFace(fam, buf); return ff.load().then(function(x){ document.fonts.add(x); rec.ot = parseOT(buf); rec.m = metrics(rec); return rec; }); }).catch(function(e){ rec.err = String(e && e.message || e); rec.fam = "serif"; rec.m = metrics(rec); return rec; });
  return rec.ready; }
function parseOT(buf){ try{ var sig = String.fromCharCode.apply(null, new Uint8Array(buf.slice(0, 4))); if(window.opentype && sig !== "wOF2") return opentype.parse(buf); }catch(e){} return null; }
// metrics in em units (fraction of the font size): from the font tables, else measured on a canvas
function metrics(rec){ var m = {asc:0.8, desc:0.2, x:0.5, cap:0.7, ital:0, arabic:false, latin:true}, o = rec.ot;
  if(o){ var u = o.unitsPerEm || 1000, os = o.tables.os2 || {}, hh = o.tables.hhea || {}; m.asc = (os.sTypoAscender || o.ascender) / u; m.desc = Math.abs(os.sTypoDescender || o.descender) / u;
    if(os.sxHeight) m.x = os.sxHeight / u; if(os.sCapHeight) m.cap = os.sCapHeight / u; m.ital = (o.tables.post && o.tables.post.italicAngle) || 0;
    try{ m.arabic = !!o.charToGlyph("ب").unicode; m.latin = !!o.charToGlyph("a").unicode; }catch(e){} }
  if(!o || !m.x || !(o.tables.os2 || {}).sxHeight){ var c = document.createElement("canvas").getContext("2d"); c.font = "100px " + rec.fam; var mx = c.measureText("x"), mH = c.measureText("H"), md = c.measureText("d"), mp = c.measureText("p");
    if(mx.actualBoundingBoxAscent){ m.x = mx.actualBoundingBoxAscent / 100; m.cap = mH.actualBoundingBoxAscent / 100; m.asc = Math.max(m.asc, md.actualBoundingBoxAscent / 100); m.desc = Math.max(0.1, mp.actualBoundingBoxDescent / 100); } }
  return m; }

// ---------- pages, projects, layers ----------
var PAGES = [["a4","A4",210,297],["a5","A5",148,210],["letter","Letter",215.9,279.4],["sq","Petak / Square",200,200]];
function newProject(kind){ var p = {id:uid(), name:L("Projek baharu", "New project"), page:{fmt:"a4", w:210, h:297, land:false}, layers:[], guides:{lines:true, grid:"", slant:0, ladder:"", nib:3, labels:true}, stand:null, created:Date.now(), log:[]};
  if(kind === "old"){ p.name = "Old English"; p.layers.push(textLayer("Bismillah", "maguntia", 28)); p.guides.ladder = "nib"; p.guides.slant = 0; }
  else if(kind === "naskh"){ p.name = "Naskh"; p.layers.push(textLayer("بسم الله الرحمن الرحيم", "amiri", 30)); p.guides.ladder = "dot"; }
  else p.layers.push(textLayer(L("Tulisan saya", "My lettering"), "fraunces", 24));
  return p; }
function textLayer(text, font, sizeMm){ return {id:uid(), t:"text", text:text, font:font, size:sizeMm, track:0, word:0, lead:1.4, align:"center", kern:true, style:"ghost", color:"#1a1a1a", op:1, mirror:false, x:15, y:40, w:180, rot:0, vis:true, lock:false, kp:{}}; }
function pageSize(p){ var w = p.page.w, h = p.page.h; return p.page.land ? [h, w] : [w, h]; }

// ---------- drawing a project (units: mm × scale) ----------
var IMGC = {};
function imgEl(key){ if(IMGC[key]) return IMGC[key]; var o = {img:new Image(), ready:false}; IMGC[key] = o;
  o.p = iget("imgs", key).then(function(du){ return new Promise(function(ok){ if(!du){ ok(); return; } o.img.onload = function(){ o.ready = true; ok(); }; o.img.onerror = ok; o.img.src = du; }); }); return o; }
function isRtl(s){ return /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/.test(s); }
function lines(L0){ return String(L0.text || "").split("\n"); }
function draw(ctx, p, k, opt){ opt = opt || {}; var sz = pageSize(p); ctx.save(); ctx.scale(k, k);
  if(!opt.transparent){ ctx.fillStyle = opt.paper || "#ffffff"; ctx.fillRect(0, 0, sz[0], sz[1]); }
  var g = p.guides || {};
  if(g.grid && !opt.noGuides){ ctx.strokeStyle = "rgba(60,110,200,.25)"; ctx.lineWidth = 0.2; if(g.grid === "thirds"){ for(var t = 1; t < 3; t++){ ln(ctx, sz[0] * t / 3, 0, sz[0] * t / 3, sz[1]); ln(ctx, 0, sz[1] * t / 3, sz[0], sz[1] * t / 3); } }
    else { var st = g.grid === "dots" ? 5 : 10; for(var gx = st; gx < sz[0]; gx += st) for(var gy = st; gy < sz[1]; gy += st){ if(g.grid === "dots"){ ctx.fillStyle = "rgba(60,110,200,.35)"; ctx.fillRect(gx - 0.25, gy - 0.25, 0.5, 0.5); } } if(g.grid === "square"){ for(var x = st; x < sz[0]; x += st) ln(ctx, x, 0, x, sz[1]); for(var y = st; y < sz[1]; y += st) ln(ctx, 0, y, sz[0], y); } } }
  p.layers.forEach(function(l){ if(!l.vis) return; ctx.save(); ctx.globalAlpha = l.op == null ? 1 : l.op;
    if(l.t === "img"){ var o = imgEl(l.src); ctx.translate(l.x + l.w / 2, l.y + l.h / 2); ctx.rotate((l.rot || 0) * Math.PI / 180); ctx.scale(l.fh ? -1 : 1, l.fv ? -1 : 1); if(o.ready) ctx.drawImage(o.img, -l.w / 2, -l.h / 2, l.w, l.h); else { ctx.strokeStyle = "#999"; ctx.lineWidth = 0.3; ctx.strokeRect(-l.w / 2, -l.h / 2, l.w, l.h); } }
    else if(l.t === "text") drawText(ctx, l, g, opt);
    ctx.restore(); });
  ctx.restore(); }
function ln(c, a, b, x, y){ c.beginPath(); c.moveTo(a, b); c.lineTo(x, y); c.stroke(); }
function drawText(ctx, l, g, opt){ var rec = FC[l.font], fam = rec && rec.fam || "serif", m = rec && rec.m || {asc:0.8, desc:0.2, x:0.5, cap:0.7}, sz = l.size, rtl = isRtl(l.text), Ls = lines(l), lh = sz * (l.lead || 1.4);
  ctx.translate(l.x + l.w / 2, l.y); ctx.rotate((l.rot || 0) * Math.PI / 180); if(l.mirror) ctx.scale(-1, 1); ctx.translate(-l.w / 2, 0);
  ctx.font = sz + "px " + fam; try{ ctx.fontKerning = l.kern === false ? "none" : "normal"; }catch(e){} try{ ctx.letterSpacing = ((l.track || 0) / 1000 * sz) + "px"; ctx.wordSpacing = ((l.word || 0) / 1000 * sz) + "px"; }catch(e){}
  ctx.textBaseline = "alphabetic"; ctx.direction = rtl ? "rtl" : "ltr";
  var al = l.align || "center", ax = al === "center" ? l.w / 2 : (al === "right") === !rtl ? (al === "right" ? l.w : 0) : (rtl ? l.w : 0); ctx.textAlign = al === "center" ? "center" : al === "right" ? "right" : "left"; if(al === "left" && rtl){ ctx.textAlign = "right"; ax = l.w; }
  Ls.forEach(function(s, i){ var by = m.asc * sz + i * lh;
    // guide lines for this line, from the font's real metrics
    if(g.lines && !opt.noGuides){ var G = [["base", by, "#d0342c", L("garis dasar", "baseline")], ["x", by - m.x * sz, "#2a7de1", L("tinggi-x", "x-height")], ["cap", by - m.cap * sz, "#7b4bd6", L("tinggi huruf besar", "cap height")], ["asc", by - m.asc * sz, "rgba(0,0,0,.35)", L("penaik", "ascender")], ["desc", by + m.desc * sz, "rgba(0,0,0,.35)", L("penurun", "descender")]];
      if(rtl) G = G.filter(function(x){ return x[0] !== "x" && x[0] !== "cap"; });
      ctx.save(); ctx.letterSpacing = "0px"; G.forEach(function(q){ ctx.strokeStyle = q[2]; ctx.lineWidth = Math.max(q[0] === "base" ? 0.35 : 0.22, opt.hair || 0); ctx.setLineDash(q[0] === "asc" || q[0] === "desc" ? [1.2, 1] : []); ln(ctx, -4, q[1], l.w + 4, q[1]);
        if(g.labels){ ctx.setLineDash([]); ctx.fillStyle = q[2]; ctx.font = "2.4px sans-serif"; ctx.textAlign = "left"; ctx.direction = "ltr"; ctx.fillText(q[3], l.w + 5, q[1] + 0.8); } }); ctx.restore();
      ctx.font = sz + "px " + fam; ctx.direction = rtl ? "rtl" : "ltr"; ctx.textAlign = al === "center" ? "center" : (rtl || al === "right") ? "right" : "left"; }
    if(g.slant && !opt.noGuides){ ctx.save(); ctx.strokeStyle = "rgba(42,125,225,.35)"; ctx.lineWidth = 0.18; var a = g.slant * Math.PI / 180, top = by - m.asc * sz, bot = by + m.desc * sz; for(var sx = 0; sx < l.w + 20; sx += sz * 0.6) ln(ctx, sx, bot, sx + Math.tan(a) * (bot - top), top); ctx.restore(); }
    if(g.ladder && !opt.noGuides) ladder(ctx, g, by, m, sz, rtl, l.w);
    var st = l.style || "solid", col = l.color || "#1a1a1a", kp = l.kp || {}, hasKp = !rtl && st !== "skeleton" && Object.keys(kp).some(function(k){ return kp[k]; });
    var paint = function(t, x){ if(st === "solid"){ ctx.fillStyle = col; ctx.fillText(t, x, by); }
      else if(st === "ghost"){ ctx.save(); ctx.globalAlpha *= 0.28; ctx.fillStyle = col; ctx.fillText(t, x, by); ctx.restore(); }
      else if(st === "outline" || st === "dotted"){ ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.18, sz * 0.012); ctx.setLineDash(st === "dotted" ? [sz * 0.02, sz * 0.03] : []); ctx.lineJoin = "round"; ctx.strokeText(t, x, by); ctx.setLineDash([]); } };
    var X = charXs(ctx, s, ax, rtl, hasKp ? kp : null, sz);
    if(st === "skeleton") skeleton(ctx, s, ax, by, sz, fam, col, ctx.textAlign);
    else if(hasKp){ ctx.save(); ctx.textAlign = "left"; for(var ci = 0; ci < s.length; ci++) paint(s[ci], X.x[ci]); ctx.restore(); }
    else paint(s, ax);
    if(l.arrows && !opt.noGuides && window.TekapLearn) arrows(ctx, s, X, by, sz, rtl, opt); });
  }
// where each character starts on the line (left edge for LTR, right edge for RTL); kp = manual pair kerning in 1/1000 em
function charXs(ctx, s, ax, rtl, kp, sz){ var tw = ctx.measureText(s).width, extra = 0, i, acc = [];
  for(i = 0; i < s.length; i++){ if(kp && i > 0) extra += (kp[s[i - 1] + s[i]] || 0) * sz / 1000; acc.push(extra); }
  tw += extra; var al = ctx.textAlign, x0 = rtl ? (al === "right" ? ax : al === "center" ? ax + tw / 2 : ax + tw) : (al === "center" ? ax - tw / 2 : al === "right" ? ax - tw : ax), xs = [];
  for(i = 0; i < s.length; i++){ var pre = i ? ctx.measureText(s.slice(0, i)).width : 0; xs.push(rtl ? x0 - pre : x0 + pre + acc[i]); } return {x:xs, w:tw}; }
// stroke order: numbered start dot + arrow for each stroke, fitted to the letter's ink box (Latin a–z A–Z 0–9, hijaiyah, Jawi)
function arrows(ctx, s, X, by, sz, rtl, opt){ ctx.save(); var lw = Math.max(0.22, sz * 0.016, opt.hair || 0), col = "rgba(220,80,20,.9)";
  for(var i = 0; i < s.length; i++){ var ch = s[i]; if(/\s|\u200D/.test(ch)) continue;
    if(rtl){ var pv = s[i - 1], nx = s[i + 1]; if((pv && !/\s/.test(pv) && pv !== "\u200D") || (nx && !/\s/.test(nx) && nx !== "\u200D")) continue; }   // Arabic: isolated letters only
    var S = TekapLearn.strokesFor(ch); if(!S) continue;
    ctx.save(); ctx.direction = "ltr"; ctx.textAlign = "left"; ctx.letterSpacing = "0px"; var m = ctx.measureText(ch), adv = m.width, ox = rtl ? X.x[i] - adv : X.x[i];
    var x0 = ox - (m.actualBoundingBoxLeft || 0), x1 = ox + (m.actualBoundingBoxRight || adv), y0 = by - (m.actualBoundingBoxAscent || sz * 0.7), y1 = by + (m.actualBoundingBoxDescent || 0); ctx.restore();
    var pts = []; S.s.forEach(function(k){ (k.p || k).forEach(function(q){ pts.push(q); }); }); (S.d || []).forEach(function(q){ pts.push(q); });
    var mnx = Math.min.apply(null, pts.map(function(q){ return q[0]; })), mxx = Math.max.apply(null, pts.map(function(q){ return q[0]; })), mny = Math.min.apply(null, pts.map(function(q){ return q[1]; })), mxy = Math.max.apply(null, pts.map(function(q){ return q[1]; }));
    var fx = function(v){ return mxx - mnx < 5 ? (x0 + x1) / 2 : x0 + (v - mnx) / (mxx - mnx) * (x1 - x0); }, fy = function(v){ return mxy - mny < 5 ? (y0 + y1) / 2 : y0 + (v - mny) / (mxy - mny) * (y1 - y0); };
    ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = ctx.lineJoin = "round"; ctx.setLineDash([]);
    S.s.forEach(function(k, n){ var P = (k.p || k).map(function(q){ return [fx(q[0]), fy(q[1])]; }); if(P.length < 2) return; ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
      if(k.sm){ for(var j = 1; j < P.length - 1; j++){ var mx = (P[j][0] + P[j + 1][0]) / 2, my = (P[j][1] + P[j + 1][1]) / 2; ctx.quadraticCurveTo(P[j][0], P[j][1], mx, my); } ctx.lineTo(P[P.length - 1][0], P[P.length - 1][1]); }
      else for(var j2 = 1; j2 < P.length; j2++) ctx.lineTo(P[j2][0], P[j2][1]);
      ctx.stroke(); var e = P[P.length - 1], f = P[P.length - 2], an = Math.atan2(e[1] - f[1], e[0] - f[0]), ah = Math.max(1, sz * 0.07); ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(e[0] - ah * Math.cos(an - 0.45), e[1] - ah * Math.sin(an - 0.45)); ctx.lineTo(e[0] - ah * Math.cos(an + 0.45), e[1] - ah * Math.sin(an + 0.45)); ctx.closePath(); ctx.fill();
      var r = Math.max(0.9, sz * 0.05); ctx.beginPath(); ctx.arc(P[0][0], P[0][1], r, 0, Math.PI * 2); ctx.fill(); ctx.save(); ctx.fillStyle = "#fff"; ctx.font = "700 " + (r * 1.5) + "px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.direction = "ltr"; ctx.letterSpacing = "0px"; ctx.fillText(String(n + 1), P[0][0], P[0][1] + r * 0.08); ctx.restore(); });
    (S.d || []).forEach(function(q){ ctx.beginPath(); ctx.arc(fx(q[0]), fy(q[1]), Math.max(0.6, sz * 0.03), 0, Math.PI * 2); ctx.stroke(); }); }
  ctx.restore(); }
// the nib ladder (Old English: x-height ≈ 5 nib widths, ascenders/capitals ≈ 2 more) and the Naskh dot ladder (alif ≈ 5 rhombic dots)
function ladder(ctx, g, by, m, sz, rtl, w){ var nib = g.nib || 3, x0 = rtl ? w + 3 : -3 - nib; ctx.save(); ctx.fillStyle = "rgba(0,0,0,.72)";
  if(g.ladder === "nib"){ for(var i = 0; i < 7; i++){ var yy = by - (i + 1) * nib, xx = x0 + (i % 2 ? nib : 0); ctx.fillRect(xx, yy, nib, nib); }
    ctx.strokeStyle = "rgba(200,60,40,.6)"; ctx.lineWidth = 0.3; var a = 35 * Math.PI / 180; ln(ctx, x0 - nib * 2, by + nib, x0 - nib * 2 + Math.cos(a) * nib * 3, by + nib - Math.sin(a) * nib * 3); }
  else if(g.ladder === "dot"){ for(var j = 0; j < 5; j++){ var cy = by - j * nib - nib / 2, cx = x0 + (j % 2 ? nib * 0.5 : 0) + nib / 2; ctx.beginPath(); ctx.moveTo(cx, cy - nib / 2); ctx.lineTo(cx + nib / 2, cy); ctx.lineTo(cx, cy + nib / 2); ctx.lineTo(cx - nib / 2, cy); ctx.closePath(); ctx.fill(); } }
  ctx.restore(); }
// skeleton / centre line: thin the glyph mask (Zhang–Suen) on a small canvas, then draw it back as dots
var SKC = {};
function skeleton(ctx, s, ax, by, sz, fam, col, align){ var key = s + "|" + fam + "|" + align, sk = SKC[key];
  if(!sk){ var px = 6, c = document.createElement("canvas"), x = c.getContext("2d"); x.font = (sz * px) + "px " + fam; var w = Math.ceil(x.measureText(s).width + sz * px * 0.4), h = Math.ceil(sz * px * 1.6); c.width = Math.max(4, Math.min(2400, w)); c.height = h;
    x.font = (sz * px) + "px " + fam; x.textBaseline = "alphabetic"; x.direction = isRtl(s) ? "rtl" : "ltr"; x.textAlign = "left"; if(isRtl(s)){ x.textAlign = "right"; } x.fillText(s, isRtl(s) ? c.width - sz * px * 0.2 : sz * px * 0.2, h * 0.68);
    var d = x.getImageData(0, 0, c.width, c.height), W = c.width, Hh = c.height, a = new Uint8Array(W * Hh); for(var i = 0; i < a.length; i++) a[i] = d.data[i * 4 + 3] > 110 ? 1 : 0;
    thin(a, W, Hh); var pts = []; for(var yy = 0; yy < Hh; yy++) for(var xx = 0; xx < W; xx++) if(a[yy * W + xx]) pts.push(xx, yy);
    sk = SKC[key] = {pts:pts, w:W, h:Hh, px:px, base:h * 0.68, pad:sz * px * 0.2}; }
  var k = 1 / sk.px, ox = align === "center" ? ax - (sk.w * k) / 2 : align === "right" ? ax - sk.w * k : ax; ctx.fillStyle = col;
  for(var q = 0; q < sk.pts.length; q += 2) ctx.fillRect(ox + sk.pts[q] * k, by - sk.base * k + sk.pts[q + 1] * k, k * 1.3, k * 1.3); }
function thin(a, W, Hh){ var ch = true, it = 0, del = [];
  var P = function(x, y){ return x < 0 || y < 0 || x >= W || y >= Hh ? 0 : a[y * W + x]; };
  while(ch && it++ < 60){ ch = false; for(var pass = 0; pass < 2; pass++){ del.length = 0;
      for(var y = 1; y < Hh - 1; y++) for(var x = 1; x < W - 1; x++){ if(!a[y * W + x]) continue; var p2 = P(x, y - 1), p3 = P(x + 1, y - 1), p4 = P(x + 1, y), p5 = P(x + 1, y + 1), p6 = P(x, y + 1), p7 = P(x - 1, y + 1), p8 = P(x - 1, y), p9 = P(x - 1, y - 1);
        var B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9; if(B < 2 || B > 6) continue; var seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2], A = 0; for(var i = 0; i < 8; i++) if(!seq[i] && seq[i + 1]) A++; if(A !== 1) continue;
        if(pass === 0 ? (p2 * p4 * p6 || p4 * p6 * p8) : (p2 * p4 * p8 || p2 * p6 * p8)) continue; del.push(y * W + x); }
      if(del.length){ ch = true; del.forEach(function(i){ a[i] = 0; }); } } } }

// ---------- screens ----------
function render(){ if(!EL || !document.body.contains(EL)) return; ({home:pHome, edit:pEdit, fonts:pFonts}[ST.pg] || pHome)(); }
function go(pg, x){ ST.pg = pg; Object.assign(ST, x || {}); render(); var v = document.getElementById("view"); if(v) v.scrollTop = 0; }
function pHome(){ var d = db();
  EL.innerHTML = '<div class="card tkHero"><h3>✍️ ' + L("Tekap", "Trace") + '</h3><div class="mut small">' + L("Letak huruf, perkataan atau gambar di atas paparan kamera kertas sebenar, dan tekap dengan pen atau berus. Belajar tipografi: Old English dan Naskh dahulu.", "Put letters, words or a picture over the camera view of real paper and trace them with a pen or brush. Learn typography: Old English and Naskh first.") + '</div>' +
    '<div class="tkNew"><button class="btn gold g3d" data-new="">＋ ' + L("Projek baharu", "New project") + '</button><button class="btn alt" data-new="old">𝔄 Old English</button><button class="btn alt" data-new="naskh">ن Naskh</button></div></div>' +
    '<div class="btns tkHb"><button class="btn alt" id="tkFonts">🔤 ' + L("Fon", "Fonts") + ' (' + fontList().length + ')</button>' + (window.TekapLearn ? '<button class="btn alt" id="tkLessons">🎓 ' + L("Pelajaran", "Lessons") + '</button><button class="btn alt" id="tkDrills">🔁 ' + L("Latih tubi", "Drills") + '</button>' : '') + '<button class="btn alt" id="tkImp">📥 ' + L("Import", "Import") + '</button></div>' +
    (window.TekapLearn ? (function(){ var w = TekapLearn.wodToday(); return '<button class="card tkWod" id="tkWod"><div class="mut small">✍️ ' + L("Latihan tekap hari ini", "Today's tracing practice") + '</div><div class="tkWodW' + (w.ar ? ' ar' : '') + '">' + E(w.ar ? w.arab : w.rumi) + '</div><div class="mut small">' + E(w.ar ? w.rumi : w.arab) + (w.en ? ' · ' + E(w.en) : '') + '</div></button>'; })() : '') +
    '<div class="plQ">🗂 ' + L("Projek saya", "My projects") + '</div>' + (d.projects.length ? '<div class="tkGrid">' + d.projects.map(function(p){ return '<button class="tkProj" data-p="' + p.id + '"><canvas width="10" height="10"></canvas><b>' + E(p.name) + '</b><small>' + E(new Date(p.upd || p.created).toLocaleDateString()) + '</small></button>'; }).join("") + '</div>' : '<div class="card mut">' + L("Belum ada projek. Mula dengan Old English atau Naskh.", "No projects yet. Start with Old English or Naskh.") + '</div>');
  EL.querySelectorAll("[data-new]").forEach(function(b){ b.onclick = function(){ var p = newProject(b.getAttribute("data-new")); projPut(p); go("edit", {id:p.id, sel:p.layers[0] && p.layers[0].id}); }; });
  EL.querySelector("#tkFonts").onclick = function(){ go("fonts"); };
  var ls = EL.querySelector("#tkLessons"); if(ls) ls.onclick = function(){ TekapLearn.open(api()); };
  var dr = EL.querySelector("#tkDrills"); if(dr) dr.onclick = function(){ TekapLearn.drills(api()); };
  var wd = EL.querySelector("#tkWod"); if(wd) wd.onclick = function(){ var q = TekapLearn.wodProject(api()); go("edit", {id:q.id, sel:q.layers[0] && q.layers[0].id}); };
  EL.querySelector("#tkImp").onclick = importJson;
  EL.querySelectorAll("[data-p]").forEach(function(b){ var p = proj(b.getAttribute("data-p")); thumb(b.querySelector("canvas"), p); b.onclick = function(){ go("edit", {id:p.id, sel:null}); }; }); }
function thumb(cv, p){ if(!p) return; var sz = pageSize(p), k = 140 / sz[0]; cv.width = Math.round(sz[0] * k); cv.height = Math.round(sz[1] * k);
  Promise.all(p.layers.filter(function(l){ return l.t === "text"; }).map(function(l){ return fontLoad(l.font); })).then(function(){ var c = cv.getContext("2d"); draw(c, p, k, {noGuides:true}); }); }
function pEdit(){ var p = proj(ST.id); if(!p){ go("home"); return; } var sel = p.layers.filter(function(l){ return l.id === ST.sel; })[0];
  EL.innerHTML = '<div class="tkBar"><button class="chip" id="tkBack">‹ ' + L("Tekap", "Trace") + '</button><input id="tkName" class="rin" value="' + E(p.name) + '"></div>' +
    '<div class="tkStage"><canvas id="tkPage"></canvas></div><div class="tkRsz" id="tkRsz" title="' + E(L("Seret untuk ubah saiz", "Drag to resize")) + '"><i></i></div>' +
    '<div class="card tkPanel">' +
    '<div class="tkTools"><button class="tkTb" data-tl="text"><span>🔤</span>' + L("Teks", "Text") + '</button><button class="tkTb" data-tl="img"><span>🖼</span>' + L("Gambar", "Image") + '</button><button class="tkTb" data-tl="guides"><span>📏</span>' + L("Panduan", "Guides") + '</button><button class="tkTb" data-tl="page"><span>📄</span>' + L("Halaman", "Page") + '</button><button class="tkTb go" data-tl="trace"><span>▶</span>' + L("Tekap", "Trace") + '</button></div>' +
    '<div class="plQ">' + L("Lapisan", "Layers") + '</div><div class="tkLayers">' + p.layers.slice().reverse().map(function(l){ var i = p.layers.indexOf(l);
      return '<div class="tkLy' + (l.id === ST.sel ? ' on' : '') + '" data-ly="' + l.id + '"><span class="tkLi">' + (l.t === "text" ? "🔤" : "🖼") + '</span><b>' + E(l.t === "text" ? (l.text || "").split("\n")[0].slice(0, 30) : L("Gambar", "Picture")) + '</b>' +
        '<button class="chip" data-up="' + i + '">▲</button><button class="chip" data-dn="' + i + '">▼</button><button class="chip" data-eye="' + l.id + '">' + (l.vis ? "👁" : "🚫") + '</button><button class="chip" data-lk="' + l.id + '">' + (l.lock ? "🔒" : "🔓") + '</button><button class="btn delb" data-del="' + l.id + '">🗑</button></div>'; }).join("") + '</div>' +
    (sel ? '<button class="btn alt full" id="tkEditSel" style="margin-top:8px">✎ ' + L("Ubah lapisan ini", "Edit this layer") + '</button>' : '') +
    '<div class="btns" style="margin-top:10px;flex-wrap:wrap"><button class="btn alt" id="tkPdf">📄 PDF ' + L("saiz sebenar", "real size") + '</button><button class="btn alt" id="tkDup">⧉ ' + L("Salin", "Duplicate") + '</button><button class="btn alt" id="tkShare">↗ ' + L("Kongsi projek", "Share project") + '</button><button class="btn delb" id="tkDelP">🗑 ' + L("Padam projek", "Delete project") + '</button></div>' +
    (p.note === "ayat" ? '<div class="mut tiny">📖 ' + L("Helaian latihan, bukan mushaf. Berwuduk digalakkan; simpan atau lupuskan kertas dengan hormat.", "A practice sheet, not a mushaf. Wudu is recommended; keep or dispose of the paper with respect.") + '</div>' : '') +
    '<div class="plQ">📒 ' + L("Log latihan", "Practice log") + ' (' + (p.log || []).length + ')</div>' + ((p.log || []).length ? '<div class="tkLog">' + p.log.slice().reverse().map(function(g){ return '<button class="tkLogI" data-lg="' + g.id + '"><img data-li="' + g.img + '" alt=""><small>' + E(new Date(g.at).toLocaleDateString()) + '</small></button>'; }).join("") + '</div>' : '<div class="mut tiny">' + L("Semasa menekap, tekan 📸 untuk bandingkan hasil anda dengan panduan dan simpan di sini.", "While tracing, tap 📸 to compare your work with the guide and save it here.") + '</div>') + '</div>';
  var q = function(s){ return EL.querySelector(s); };
  q("#tkBack").onclick = function(){ go("home"); };
  q("#tkName").onchange = function(){ p.name = this.value.trim() || p.name; projPut(p); };
  stage(p);
  EL.querySelectorAll("[data-ly]").forEach(function(r){ r.onclick = function(ev){ if(ev.target.closest("button")) return; ST.sel = r.getAttribute("data-ly"); pEdit(); }; });
  var swap = function(i, j){ if(j < 0 || j >= p.layers.length) return; var t = p.layers[i]; p.layers[i] = p.layers[j]; p.layers[j] = t; projPut(p); pEdit(); };
  EL.querySelectorAll("[data-up]").forEach(function(b){ b.onclick = function(){ var i = +b.getAttribute("data-up"); swap(i, i + 1); }; });
  EL.querySelectorAll("[data-dn]").forEach(function(b){ b.onclick = function(){ var i = +b.getAttribute("data-dn"); swap(i, i - 1); }; });
  EL.querySelectorAll("[data-eye]").forEach(function(b){ b.onclick = function(){ var l = lay(p, b.getAttribute("data-eye")); l.vis = !l.vis; projPut(p); pEdit(); }; });
  EL.querySelectorAll("[data-lk]").forEach(function(b){ b.onclick = function(){ var l = lay(p, b.getAttribute("data-lk")); l.lock = !l.lock; projPut(p); pEdit(); }; });
  EL.querySelectorAll("[data-del]").forEach(function(b){ b.onclick = function(){ if(!confirm(L("Padam lapisan ini?", "Delete this layer?"))) return; var l = lay(p, b.getAttribute("data-del")); if(l.t === "img") idel("imgs", l.src); p.layers = p.layers.filter(function(x){ return x !== l; }); projPut(p); pEdit(); }; });
  var es = q("#tkEditSel"); if(es) es.onclick = function(){ if(sel.t === "text") textSheet(p, sel); else if(window.TekapImg) TekapImg.sheet(api(), p, sel); };
  EL.querySelectorAll("[data-tl]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-tl");
    if(k === "text"){ var l = textLayer(L("Huruf", "Letters"), (sel && sel.font) || "fraunces", 22); l.y = 30 + 25 * p.layers.length % 200; p.layers.push(l); ST.sel = l.id; projPut(p); textSheet(p, l); }
    else if(k === "img"){ if(window.TekapImg) TekapImg.add(api(), p); }
    else if(k === "guides") guideSheet(p); else if(k === "page") pageSheet(p); else if(k === "trace") trace(p); }; });
  q("#tkPdf").onclick = function(){ pdf(p); };
  q("#tkDup").onclick = function(){ var c = JSON.parse(JSON.stringify(p)); c.id = uid(); c.name += " (2)"; projPut(c); go("edit", {id:c.id}); };
  q("#tkShare").onclick = function(){ shareProject(p); };
  EL.querySelectorAll("[data-li]").forEach(function(im){ iget("imgs", im.getAttribute("data-li")).then(function(du){ if(du) im.src = du; }); });
  EL.querySelectorAll("[data-lg]").forEach(function(b){ b.onclick = function(){ var g = (p.log || []).filter(function(x){ return x.id === b.getAttribute("data-lg"); })[0]; if(g) iget("imgs", g.img).then(function(du){ if(du) checkSheet(p, du, g.q, g); }); }; });
  q("#tkDelP").onclick = function(){ if(!confirm(L("Padam projek ini?", "Delete this project?"))) return; var d = db(); d.projects = d.projects.filter(function(x){ return x.id !== p.id; }); dbSave(d); go("home"); }; }
function lay(p, id){ return p.layers.filter(function(l){ return l.id === id; })[0]; }
// the page on screen: tap a layer to select it, drag to move it (in mm)
function stage(p){ var cv = EL.querySelector("#tkPage"), box = cv.parentNode, sz = pageSize(p), dpr = window.devicePixelRatio || 1, zf = Math.max(0.35, Math.min(1, (db().set || {}).stageZ || 0.8)), cw = Math.round(Math.min((box.clientWidth || 380) - 20, 700) * zf), k = cw / sz[0];
  cv.style.width = cw + "px"; cv.style.height = Math.round(sz[1] * k) + "px"; cv.width = Math.round(cw * dpr); cv.height = Math.round(sz[1] * k * dpr);
  var paint = function(){ var c = cv.getContext("2d"); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); draw(c, p, k * dpr, {hair:1.5 / k});
    var s = lay(p, ST.sel); if(s){ c.save(); c.scale(k * dpr, k * dpr); c.strokeStyle = "#e1a100"; c.lineWidth = 0.5; c.setLineDash([2, 1.5]); var bb = bbox(s); c.strokeRect(bb[0], bb[1], bb[2], bb[3]); c.restore(); } };
  Promise.all(p.layers.map(function(l){ return l.t === "text" ? fontLoad(l.font) : imgEl(l.src).p; })).then(paint); paint();
  var drag = null; cv.onpointerdown = function(e){ var r = cv.getBoundingClientRect(), kk = r.width / sz[0], mx = (e.clientX - r.left) / kk, my = (e.clientY - r.top) / kk, hitL = null;
    p.layers.forEach(function(l){ if(!l.vis) return; var b = bbox(l); if(mx >= b[0] && mx <= b[0] + b[2] && my >= b[1] && my <= b[1] + b[3]) hitL = l; });
    if(!hitL){ ST.sel = null; paint(); return; } var was = ST.sel === hitL.id; ST.sel = hitL.id;
    if(was && (p.guides || {}).lines){ var lk = lineAt(hitL, my); if(lk){ H.toast("📏 " + L(LINEX[lk][0], LINEX[lk][1])); } } if(hitL.lock){ paint(); return; } drag = {l:hitL, x0:mx, y0:my, lx:hitL.x, ly:hitL.y, moved:false}; cv.setPointerCapture(e.pointerId); paint(); };
  cv.onpointermove = function(e){ if(!drag) return; var r = cv.getBoundingClientRect(), kk = r.width / sz[0], mx = (e.clientX - r.left) / kk, my = (e.clientY - r.top) / kk; drag.l.x = Math.round((drag.lx + mx - drag.x0) * 2) / 2; drag.l.y = Math.round((drag.ly + my - drag.y0) * 2) / 2; drag.moved = true; paint(); };
  cv.onpointerup = function(){ if(drag){ var mv = drag.moved; drag = null; projPut(p); if(!mv) pEdit(); else render2(); } };
  var rz = EL.querySelector("#tkRsz"); if(rz){ var y0 = null, z0 = zf, full = Math.min((box.clientWidth || 380) - 20, 700);
    rz.onpointerdown = function(e){ y0 = e.clientY; z0 = zf; rz.setPointerCapture(e.pointerId); rz.classList.add("on"); };
    rz.onpointermove = function(e){ if(y0 == null) return; var nh = (sz[1] * z0 * full / sz[0]) + (e.clientY - y0), z = Math.max(0.35, Math.min(1, nh * sz[0] / sz[1] / full)); if(Math.abs(z - zf) < 0.01) return; zf = z;
      cw = Math.round(full * zf); k = cw / sz[0]; cv.style.width = cw + "px"; cv.style.height = Math.round(sz[1] * k) + "px"; cv.width = Math.round(cw * dpr); cv.height = Math.round(sz[1] * k * dpr); paint(); };
    rz.onpointerup = rz.onpointercancel = function(){ if(y0 == null) return; y0 = null; rz.classList.remove("on"); var d = db(); d.set.stageZ = Math.round(zf * 100) / 100; dbSave(d); }; }
  function render2(){ var y = document.getElementById("view").scrollTop; pEdit(); document.getElementById("view").scrollTop = y; } }
function bbox(l){ if(l.t === "img") return [l.x, l.y, l.w, l.h]; var rec = FC[l.font], m = rec && rec.m || {asc:0.8, desc:0.2}, n = lines(l).length; return [l.x, l.y, l.w, m.asc * l.size + (n - 1) * l.size * (l.lead || 1.4) + m.desc * l.size]; }
function textSheet(p, l){ var F = fontList(), st = [["solid", L("Penuh", "Solid")], ["outline", L("Garis luar", "Outline")], ["dotted", L("Titik", "Dotted")], ["ghost", L("Pudar", "Ghost")], ["skeleton", L("Rangka", "Skeleton")]];
  var ov = H.showSheet("🔤 " + L("Teks", "Text"), '<textarea id="ttT" class="rin" rows="3"' + (isRtl(l.text) ? ' dir="rtl"' : '') + '>' + E(l.text) + '</textarea>' +
    '<div class="plQ">' + L("Fon", "Font") + '</div><div class="tkFontRow">' + F.map(function(f){ return '<button class="tkFb' + (l.font === f.id ? ' on' : '') + '" data-f="' + f.id + '"><span data-fp="' + f.id + '">' + E(isRtl(l.text) ? "بسم" : "Aa") + '</span><small>' + E(f.name) + '</small></button>'; }).join("") + '</div>' +
    '<div class="tkG2"><label class="hfld">' + L("Saiz (mm)", "Size (mm)") + '<input id="ttS" class="rin" type="number" min="3" max="200" step="0.5" value="' + l.size + '"></label><label class="hfld">' + L("Jarak huruf", "Letter spacing") + '<input id="ttTr" class="rin" type="number" step="10" value="' + (l.track || 0) + '"></label>' +
      '<label class="hfld">' + L("Jarak perkataan", "Word spacing") + '<input id="ttW" class="rin" type="number" step="10" value="' + (l.word || 0) + '"></label><label class="hfld">' + L("Tinggi baris", "Line height") + '<input id="ttL" class="rin" type="number" step="0.05" min="0.8" max="4" value="' + (l.lead || 1.4) + '"></label>' +
      '<label class="hfld">' + L("Lebar kotak (mm)", "Box width (mm)") + '<input id="ttBw" class="rin" type="number" min="20" value="' + l.w + '"></label><label class="hfld">' + L("Putar (°)", "Rotate (°)") + '<input id="ttR" class="rin" type="number" step="5" value="' + (l.rot || 0) + '"></label></div>' +
    '<div class="plQ">' + L("Gaya untuk menekap", "Style for tracing") + '</div><div class="rseg">' + st.map(function(x){ return '<button class="chip' + (l.style === x[0] ? ' on' : '') + '" data-st="' + x[0] + '">' + E(x[1]) + '</button>'; }).join("") + '</div>' +
    '<div class="plQ">' + L("Jajaran", "Alignment") + '</div><div class="rseg">' + [["left", "⟸"], ["center", "≡"], ["right", "⟹"]].map(function(x){ return '<button class="chip' + (l.align === x[0] ? ' on' : '') + '" data-al="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>' +
    '<label class="pdchk"><input type="checkbox" id="ttK"' + (l.kern !== false ? ' checked' : '') + '> ' + L("Kerning", "Kerning") + '</label><label class="pdchk"><input type="checkbox" id="ttM"' + (l.mirror ? ' checked' : '') + '> ' + L("Cermin (tekap dari belakang kertas)", "Mirror (trace from the back of the paper)") + '</label>' +
    '<label class="pdchk"><input type="checkbox" id="ttA"' + (l.arrows ? ' checked' : '') + '> ' + L("Titik mula + anak panah arah tulisan", "Start dots + stroke arrows") + '</label>' +
    '<div class="btns"><button class="chip" id="ttKp">↔ ' + L("Kerning pasangan", "Pair kerning") + '</button><button class="chip" id="ttAn">🔍 ' + L("Anatomi", "Anatomy") + '</button></div>' +
    '<div class="tkG2"><label class="hfld">' + L("Warna", "Colour") + '<input id="ttC" type="color" value="' + E(l.color || "#1a1a1a") + '" class="rin"></label><label class="hfld">' + L("Kelegapan", "Opacity") + '<input id="ttO" type="range" min="0.1" max="1" step="0.05" value="' + (l.op == null ? 1 : l.op) + '"></label></div>' +
    '<div id="ttWarn" class="mut tiny"></div><button class="btn gold full" id="ttOk">✓ ' + L("Siap", "Done") + '</button>');
  F.forEach(function(f){ fontLoad(f.id).then(function(r){ var s = ov.querySelector('[data-fp="' + f.id + '"]'); if(s) s.style.fontFamily = r.fam; }); });
  var q = function(s){ return ov.querySelector(s); }, warn = function(){ fontLoad(l.font).then(function(r){ var w = q("#ttWarn"); if(!w) return; var ar = isRtl(l.text); w.textContent = ar && r.m && r.m.arabic === false ? "⚠️ " + L("Fon ini tiada huruf Arab/Jawi.", "This font has no Arabic letters.") : !ar && r.m && r.m.latin === false ? "⚠️ " + L("Fon ini tiada huruf Rumi.", "This font has no Latin letters.") : ""; }); };
  var upd = function(){ l.text = q("#ttT").value; l.size = Math.max(3, +q("#ttS").value || l.size); l.track = +q("#ttTr").value || 0; l.word = +q("#ttW").value || 0; l.lead = +q("#ttL").value || 1.4; l.w = Math.max(20, +q("#ttBw").value || l.w); l.rot = +q("#ttR").value || 0;
    l.kern = q("#ttK").checked; l.mirror = q("#ttM").checked; l.arrows = q("#ttA").checked; l.color = q("#ttC").value; l.op = +q("#ttO").value; projPut(p); warn(); };
  ov.querySelectorAll("input,textarea").forEach(function(x){ x.oninput = x.onchange = upd; });
  ov.querySelectorAll("[data-f]").forEach(function(b){ b.onclick = function(){ l.font = b.getAttribute("data-f"); ov.querySelectorAll("[data-f]").forEach(function(z){ z.classList.toggle("on", z === b); }); projPut(p); warn(); }; });
  ov.querySelectorAll("[data-st]").forEach(function(b){ b.onclick = function(){ l.style = b.getAttribute("data-st"); ov.querySelectorAll("[data-st]").forEach(function(z){ z.classList.toggle("on", z === b); }); projPut(p); }; });
  ov.querySelectorAll("[data-al]").forEach(function(b){ b.onclick = function(){ l.align = b.getAttribute("data-al"); ov.querySelectorAll("[data-al]").forEach(function(z){ z.classList.toggle("on", z === b); }); projPut(p); }; });
  q("#ttOk").onclick = function(){ upd(); H.closeOverlay(); pEdit(); }; warn();
  q("#ttKp").onclick = function(){ upd(); kernSheet(p, l); };
  q("#ttAn").onclick = function(){ upd(); if(window.TekapLearn) TekapLearn.anatomy(api(), l.font, l.text); }; ov._close = function(){ H.closeOverlay(); pEdit(); }; ov.querySelector("#shX").onclick = ov._close; }
function kernSheet(p, l){ if(isRtl(l.text)){ H.toast(L("Kerning pasangan untuk tulisan Rumi sahaja", "Pair kerning is for Latin text only")); return; } l.kp = l.kp || {}; var pairs = [], seen = {};
  String(l.text).split("\n").forEach(function(s){ for(var i = 1; i < s.length; i++){ var k = s[i - 1] + s[i]; if(!/\s/.test(k) && !seen[k]){ seen[k] = 1; pairs.push(k); } } });
  var ov = H.showSheet("↔ " + L("Kerning pasangan", "Pair kerning"), '<div class="mut small">' + L("Rapatkan (−) atau jarakkan (+) satu pasangan huruf supaya ruang putih nampak sama. Unit: 1/1000 em.", "Tighten (−) or open (+) one pair so the white space looks even. Units: 1/1000 em.") + '</div><div class="tkKp">' +
    pairs.slice(0, 40).map(function(k){ return '<div class="tkKr"><b>' + E(k) + '</b><button class="chip" data-kd="' + E(k) + '" data-v="-10">−</button><span data-kv="' + E(k) + '">' + (l.kp[k] || 0) + '</span><button class="chip" data-kd="' + E(k) + '" data-v="10">＋</button></div>'; }).join("") + '</div><button class="btn alt" id="kpR">↺ ' + L("Kosongkan", "Reset") + '</button>');
  ov.querySelectorAll("[data-kd]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-kd"); l.kp[k] = (l.kp[k] || 0) + (+b.getAttribute("data-v")); if(!l.kp[k]) delete l.kp[k]; ov.querySelector('[data-kv="' + CSS.escape(k) + '"]').textContent = l.kp[k] || 0; projPut(p); }; });
  ov.querySelector("#kpR").onclick = function(){ l.kp = {}; projPut(p); H.closeOverlay(); kernSheet(p, l); };
  ov._close = function(){ H.closeOverlay(); pEdit(); }; ov.querySelector("#shX").onclick = ov._close; }
var LINEX = {base:["Garis dasar: semua huruf 'duduk' di atas garis ini.", "Baseline: every letter 'sits' on this line."], x:["Tinggi-x: tinggi huruf kecil tanpa penaik (x, a, n). Inilah saiz sebenar yang dilihat mata.", "x-height: the height of lower case letters without ascenders (x, a, n). It is the size the eye really sees."],
  cap:["Tinggi huruf besar: bahagian atas huruf seperti H dan E.", "Cap height: the top of capitals such as H and E."], asc:["Penaik: bahagian huruf yang naik melebihi tinggi-x (b, d, h, k, l).", "Ascender: the part of a letter that rises above the x-height (b, d, h, k, l)."],
  desc:["Penurun: bahagian huruf yang turun di bawah garis dasar (g, p, q, y).", "Descender: the part of a letter that drops below the baseline (g, p, q, y)."]};
function lineAt(l, my){ var rec = FC[l.font], m = rec && rec.m; if(!m || l.t !== "text") return null; var sz = l.size, lh = sz * (l.lead || 1.4), n = lines(l).length, best = null, bd = Math.max(1.2, sz * 0.06);
  for(var i = 0; i < n; i++){ var by = l.y + m.asc * sz + i * lh; [["base", by], ["x", by - m.x * sz], ["cap", by - m.cap * sz], ["asc", by - m.asc * sz], ["desc", by + m.desc * sz]].forEach(function(q){ var d = Math.abs(my - q[1]); if(d < bd){ bd = d; best = q[0]; } }); } return best; }
function guideSheet(p){ var g = p.guides, seg = function(k, list){ return '<div class="rseg">' + list.map(function(x){ return '<button class="chip' + (String(g[k] || "") === String(x[0]) ? ' on' : '') + '" data-gk="' + k + '" data-gv="' + x[0] + '">' + E(x[1]) + '</button>'; }).join("") + '</div>'; };
  var ov = H.showSheet("📏 " + L("Panduan", "Guides"), '<label class="pdchk"><input type="checkbox" id="gL"' + (g.lines ? ' checked' : '') + '> ' + L("Garis dari metrik fon: garis dasar, tinggi-x, huruf besar, penaik, penurun", "Lines from the font's metrics: baseline, x-height, cap height, ascender, descender") + '</label>' +
    '<label class="pdchk"><input type="checkbox" id="gLb"' + (g.labels ? ' checked' : '') + '> ' + L("Label garis", "Line labels") + '</label>' +
    '<details class="tkLx"><summary>' + L("Apa maksud garis-garis ini?", "What do the lines mean?") + '</summary>' + Object.keys(LINEX).map(function(k){ return '<p>' + E(L(LINEX[k][0], LINEX[k][1])) + '</p>'; }).join("") + '<p class="mut tiny">' + L("Ketik garis pada halaman untuk penerangan.", "Tap a line on the page for its meaning.") + '</p></details>' +
    '<div class="plQ">' + L("Grid", "Grid") + '</div>' + seg("grid", [["", L("Tiada", "None")], ["square", L("Petak", "Square")], ["dots", L("Titik", "Dotted")], ["thirds", "3×3"]]) +
    '<div class="plQ">' + L("Garis condong (°)", "Slant guides (°)") + '</div>' + seg("slant", [[0, L("Tiada", "None")], [5, "5°"], [10, "10°"], [15, "15°"], [20, "20°"], [30, "30°"]]) +
    '<div class="plQ">' + L("Tangga", "Ladder") + '</div>' + seg("ladder", [["", L("Tiada", "None")], ["nib", L("Mata pena (Old English)", "Nib widths (Old English)")], ["dot", L("Titik rombus (Naskh)", "Rhombic dots (Naskh)")]]) +
    '<label class="hfld">' + L("Lebar mata pena / titik (mm)", "Nib / dot width (mm)") + '<input id="gN" class="rin" type="number" min="0.5" max="20" step="0.5" value="' + (g.nib || 3) + '"></label>' +
    '<div class="mut tiny">' + L("Old English: tinggi-x ≈ 5 lebar mata pena, penaik/huruf besar ≈ 2 lagi, sudut pena 35–40°. Naskh: alif ≈ 5 titik rombus. (Disemak ustaz/guru khat.)", "Old English: x-height ≈ 5 nib widths, ascenders/capitals ≈ 2 more, pen angle 35–40°. Naskh: alif ≈ 5 rhombic dots. (Pending review by a calligraphy teacher.)") + '</div>');
  var q = function(s){ return ov.querySelector(s); };
  q("#gL").onchange = function(){ g.lines = this.checked; projPut(p); }; q("#gLb").onchange = function(){ g.labels = this.checked; projPut(p); }; q("#gN").onchange = function(){ g.nib = Math.max(0.5, +this.value || 3); projPut(p); };
  ov.querySelectorAll("[data-gk]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-gk"), v = b.getAttribute("data-gv"); g[k] = k === "slant" ? +v : v; projPut(p); ov.querySelectorAll('[data-gk="' + k + '"]').forEach(function(z){ z.classList.toggle("on", z === b); }); }; });
  ov._close = function(){ H.closeOverlay(); pEdit(); }; ov.querySelector("#shX").onclick = ov._close; }
function pageSheet(p){ var ov = H.showSheet("📄 " + L("Halaman", "Page"), '<div class="rseg">' + PAGES.map(function(x){ return '<button class="chip' + (p.page.fmt === x[0] ? ' on' : '') + '" data-pf="' + x[0] + '">' + E(x[1]) + '</button>'; }).join("") + '<button class="chip' + (p.page.fmt === "custom" ? ' on' : '') + '" data-pf="custom">' + L("Sendiri", "Custom") + '</button></div>' +
    '<div class="tkG2"><label class="hfld">' + L("Lebar (mm)", "Width (mm)") + '<input id="pgW" class="rin" type="number" value="' + p.page.w + '"></label><label class="hfld">' + L("Tinggi (mm)", "Height (mm)") + '<input id="pgH" class="rin" type="number" value="' + p.page.h + '"></label></div>' +
    '<label class="pdchk"><input type="checkbox" id="pgL"' + (p.page.land ? ' checked' : '') + '> ' + L("Melintang", "Landscape") + '</label>');
  ov.querySelectorAll("[data-pf]").forEach(function(b){ b.onclick = function(){ var f = b.getAttribute("data-pf"), x = PAGES.filter(function(z){ return z[0] === f; })[0]; p.page.fmt = f; if(x){ p.page.w = x[2]; p.page.h = x[3]; } projPut(p); H.closeOverlay(); pageSheet(p); }; });
  ov.querySelector("#pgW").onchange = function(){ p.page.w = Math.max(30, +this.value || 210); p.page.fmt = "custom"; projPut(p); };
  ov.querySelector("#pgH").onchange = function(){ p.page.h = Math.max(30, +this.value || 297); p.page.fmt = "custom"; projPut(p); };
  ov.querySelector("#pgL").onchange = function(){ p.page.land = this.checked; projPut(p); };
  ov._close = function(){ H.closeOverlay(); pEdit(); }; ov.querySelector("#shX").onclick = ov._close; }
function pdf(p){ var sz = pageSize(p), k = 150 / 25.4, cv = document.createElement("canvas"); cv.width = Math.round(sz[0] * k); cv.height = Math.round(sz[1] * k);
  Promise.all(p.layers.map(function(l){ return l.t === "text" ? fontLoad(l.font) : imgEl(l.src).p; })).then(function(){ draw(cv.getContext("2d"), p, k, {}); H.sharePdf((p.name || "tekap").replace(/[^\w\- ]+/g, "") + ".pdf", H.canvasPdf(cv, sz[0], sz[1], 0.92), p.name); }); }

// ---------- fonts screen ----------
// a font file (base64) from the picker, Google Fonts or "Open with My Ihsan" → IndexedDB + the list
function addFontB64(b64, fname){ var bin = atob(b64), u8 = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  var sig = String.fromCharCode(u8[0], u8[1], u8[2], u8[3]); if(!/^(\x00\x01\x00\x00|OTTO|wOFF|wOF2|true)$/.test(sig)){ H.toast("⚠️ " + L("Bukan fail fon", "Not a font file")); return Promise.resolve(null); }
  var id = "u" + Date.now().toString(36), name = fname ? String(fname).replace(/\.(ttf|otf|woff2?)$/i, "") : "", ot = null; try{ if(sig !== "wOF2" && window.opentype) ot = opentype.parse(u8.buffer); }catch(e){}
  var lic = ""; if(ot) try{ name = (ot.names.fullName && (ot.names.fullName.en || Object.values(ot.names.fullName)[0])) || name; var lc = ot.names.license || ot.names.licenseURL; lic = lc ? String(lc.en || Object.values(lc)[0] || "").slice(0, 160) : ""; }catch(e){}
  return iput("fonts", id, u8.buffer).then(function(){ var d = db(); d.fonts.push({id:id, name:name || L("Fon saya", "My font"), at:Date.now(), licNote:lic}); dbSave(d); H.toast("🔤 " + L("Fon ditambah", "Font added")); if(ST.pg === "fonts") pFonts(); return id; }); }
function pFonts(){ var F = fontList();
  EL.innerHTML = '<div class="tkBar"><button class="chip" id="tkBack">‹ ' + L("Tekap", "Trace") + '</button><b>🔤 ' + L("Fon", "Fonts") + '</b></div>' +
    '<button class="btn gold full g3d" id="tkAddF">＋ ' + L("Muat fon dari telefon (.ttf .otf .woff)", "Load a font from the phone (.ttf .otf .woff)") + '</button>' +
    (window.TekapLearn ? '<button class="btn alt full" id="tkGf" style="margin-top:8px">🌐 Google Fonts</button>' : '') +
    '<div class="tkFonts">' + F.map(function(f){ return '<div class="card tkFont"><div class="tkFprev" data-fp="' + f.id + '">' + (f.kind === "naskh" ? "بِسْمِ اللّٰهِ · ڤاڠݢيل" : "Bismillah · Jalan Terus 123") + '</div><div class="tkFrow"><b>' + E(f.name) + '</b><small class="mut">' + (f.bundled ? "OFL · " + L("terbina", "bundled") : f.lic ? E(f.lic) + " · Google Fonts" : L("dari telefon anda", "from your phone") + (f.licNote ? " · " + E(f.licNote) : "")) + '</small>' +
      (f.user ? '<button class="chip" data-ren="' + f.id + '">✎</button><button class="chip" data-fav="' + f.id + '">' + (f.fav ? "★" : "☆") + '</button><button class="btn delb" data-fdel="' + f.id + '">🗑</button>' : '') + '</div></div>'; }).join("") + '</div>' +
    '<div class="mut tiny">' + L("Fon dari telefon kekal dalam telefon ini dan tidak dikongsi.", "Fonts from your phone stay on this phone and are never shared.") + '</div>';
  F.forEach(function(f){ fontLoad(f.id).then(function(r){ var s = EL.querySelector('[data-fp="' + f.id + '"]'); if(s) s.style.fontFamily = r.fam; }); });
  EL.querySelector("#tkBack").onclick = function(){ go("home"); };
  var gf = EL.querySelector("#tkGf"); if(gf) gf.onclick = function(){ TekapLearn.gfonts(api()); };
  EL.querySelector("#tkAddF").onclick = function(){ var h = function(r){ H.off("binfile", h); if(!r || !r.b64) return; addFontB64(r.b64, r.name); }; H.on("binfile", h); if(H.N.pickAny) H.N.pickAny(); else H.N.pickBin(); };
  EL.querySelectorAll("[data-ren]").forEach(function(b){ b.onclick = function(){ var d = db(), f = d.fonts.filter(function(x){ return x.id === b.getAttribute("data-ren"); })[0], n = prompt(L("Nama fon", "Font name"), f.name); if(n){ f.name = n; dbSave(d); pFonts(); } }; });
  EL.querySelectorAll("[data-fav]").forEach(function(b){ b.onclick = function(){ var d = db(), f = d.fonts.filter(function(x){ return x.id === b.getAttribute("data-fav"); })[0]; f.fav = !f.fav; dbSave(d); pFonts(); }; });
  EL.querySelectorAll("[data-fdel]").forEach(function(b){ b.onclick = function(){ if(!confirm(L("Padam fon ini?", "Delete this font?"))) return; var id = b.getAttribute("data-fdel"), d = db(); d.fonts = d.fonts.filter(function(x){ return x.id !== id; }); dbSave(d); idel("fonts", id); delete FC[id]; pFonts(); }; }); }

// ---------- 📐 Stand mode (camera lucida) ----------
// the overlay canvas sits on the camera picture; one finger moves, two fingers pinch + rotate, double tap = fit;
// 4-corner warp drags the guide's corners onto the paper's corners (keystone, a homography shown as CSS matrix3d)
function homography(src, dst){ var A = [], b = []; for(var i = 0; i < 4; i++){ var x = src[i][0], y = src[i][1], u = dst[i][0], v = dst[i][1];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); }
  for(var c = 0; c < 8; c++){ var mx = c; for(var r = c + 1; r < 8; r++) if(Math.abs(A[r][c]) > Math.abs(A[mx][c])) mx = r; var t = A[c]; A[c] = A[mx]; A[mx] = t; var tb = b[c]; b[c] = b[mx]; b[mx] = tb;
    if(Math.abs(A[c][c]) < 1e-12) return null; for(var r2 = c + 1; r2 < 8; r2++){ var f = A[r2][c] / A[c][c]; for(var k = c; k < 8; k++) A[r2][k] -= f * A[c][k]; b[r2] -= f * b[c]; } }
  var h = new Array(8); for(var i2 = 7; i2 >= 0; i2--){ var s = b[i2]; for(var j = i2 + 1; j < 8; j++) s -= A[i2][j] * h[j]; h[i2] = s / A[i2][i2]; } return h.concat([1]); }
function matrix3d(h){ return "matrix3d(" + [h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, h[8]].join(",") + ")"; }
var CAM = null;
function trace(p){ if(CAM) stopCam();
  var ov = document.createElement("div"); ov.className = "tkCam"; ov.innerHTML = '<video id="tkV" playsinline muted autoplay></video><canvas id="tkFz" class="tkFz"></canvas><div id="tkOvW" class="tkOvW"><canvas id="tkOv"></canvas></div><div id="tkWarpH"></div>' +
    '<div class="tkCtop"><button class="chip on" data-md="stand">📐 ' + L("Dirian", "Stand") + '</button><button class="chip" data-md="paper">📄 ' + L("Kunci kertas", "Paper lock") + '</button><button class="chip" id="tkTorch">🔦</button><button class="chip" id="tkLvl">⊙</button><button class="chip tkX" id="tkStop">✕</button></div>' +
    '<div class="tkCbot" id="tkCbot"><div class="tkRow"><span>◐</span><input type="range" id="tkOp" min="0.1" max="1" step="0.05" value="0.6"><span id="tkOpV">60%</span></div>' +
      '<div class="tkRow tkBtns"><button class="chip" data-a="fh">⇋</button><button class="chip" data-a="fv">⇵</button><button class="chip" data-a="r90">⟳90</button><button class="chip" data-a="fit">⤢</button><button class="chip" data-a="warp">⬚ ' + L("4 sudut", "4 corners") + '</button><button class="chip" data-a="view">👁</button><button class="chip" data-a="grid">#</button><button class="chip" data-a="zoom">🔍</button><button class="chip" data-a="freeze">⏸</button><button class="chip" data-a="snap">📸</button><button class="chip" data-a="tl">⏱</button><button class="chip" data-a="lock">🔒</button></div></div>' +
    '<div class="tkLockH hidden" id="tkLockH">🔒 ' + L("Leret 5 kali untuk buka", "Swipe 5 times to unlock") + ' <b id="tkLockN">0/5</b></div><div class="tkHint" id="tkHint"></div>';
  document.body.appendChild(ov);
  var V = ov.querySelector("#tkV"), OV = ov.querySelector("#tkOv"), W = ov.querySelector("#tkOvW"), sz = pageSize(p), PX = 4;
  var S = Object.assign({tx:0, ty:0, s:1, r:0, fh:false, fv:false, op:0.6, warp:null, grid:false, view:"both", zoom:1, locked:false, frozen:false}, p.stand || {});
  CAM = {ov:ov, p:p, S:S, stream:null};
  OV.width = Math.round(sz[0] * PX); OV.height = Math.round(sz[1] * PX);
  Promise.all(p.layers.map(function(l){ return l.t === "text" ? fontLoad(l.font) : imgEl(l.src).p; })).then(function(){ var c = OV.getContext("2d"); c.clearRect(0, 0, OV.width, OV.height); draw(c, p, PX, {transparent:true, hair:0.5}); });
  var fit = function(){ var vw = window.innerWidth, vh = window.innerHeight, k = Math.min(vw * 0.9 / OV.width, vh * 0.7 / OV.height); S.s = k; S.tx = (vw - OV.width * k) / 2; S.ty = (vh - OV.height * k) / 2; S.r = 0; };
  if(!p.stand) fit();
  var apply = function(){ W.style.opacity = S.view === "cam" ? 0 : S.op; V.style.opacity = S.view === "ovl" ? 0 : 1; ov.querySelector("#tkOpV").textContent = Math.round(S.op * 100) + "%"; ov.classList.toggle("grid", S.grid); V.style.transform = "scale(" + S.zoom + ")";
    if(CAM.mode === "paper"){ W.style.opacity = W.style.opacity; ov.querySelector("#tkLockH").classList.toggle("hidden", !S.locked); ov.querySelector("#tkCbot").classList.toggle("dim", S.locked); ov.querySelector("#tkWarpH").innerHTML = ""; return; }
    if(S.warp){ var hm = homography([[0, 0], [OV.width, 0], [OV.width, OV.height], [0, OV.height]], S.warp); W.style.transform = hm ? matrix3d(hm) : ""; }
    else W.style.transform = "translate(" + S.tx + "px," + S.ty + "px) rotate(" + S.r + "deg) scale(" + (S.s * (S.fh ? -1 : 1)) + "," + (S.s * (S.fv ? -1 : 1)) + ")";
    W.style.transformOrigin = S.warp ? "0 0" : "0 0"; if(!S.warp && (S.fh || S.fv || S.r)) W.style.transformOrigin = (OV.width / 2) + "px " + (OV.height / 2) + "px";
    ov.querySelector("#tkLockH").classList.toggle("hidden", !S.locked); ov.querySelector("#tkCbot").classList.toggle("dim", S.locked); warpHandles(); };
  var keep = function(){ S.mode = CAM.mode; p.stand = JSON.parse(JSON.stringify(S)); projPut(p); };
  // camera (back camera); the phone stays awake until Stop
  try{ if(H.N.keepAwake) H.N.keepAwake(true); }catch(e){}
  var startCam = function(){ if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ hint(L("Kamera tidak tersedia", "No camera available")); return; }
    navigator.mediaDevices.getUserMedia({video:{facingMode:"environment", width:{ideal:1920}, height:{ideal:1080}}, audio:false}).then(function(s){ CAM.stream = s; V.srcObject = s; V.play().catch(function(){}); }, function(){ hint(L("Benarkan kamera untuk menekap", "Allow the camera to trace")); }); };
  if(H.N.hasPerm && !H.N.hasPerm("camera") && H.N.requestPerm){ var ph = function(r){ if(r.which !== "camera") return; H.off("perm", ph); if(r.granted) startCam(); else hint(L("Kamera tidak dibenarkan", "Camera not allowed")); }; H.on("perm", ph); H.N.requestPerm("camera"); } else startCam();
  function hint(t){ var h = ov.querySelector("#tkHint"); h.textContent = t; h.classList.add("on"); clearTimeout(hint._t); hint._t = setTimeout(function(){ h.classList.remove("on"); }, 3000); }
  // gestures on the guide
  var pts = {}, g0 = null, lastTap = 0;
  ov.addEventListener("pointerdown", function(e){ if(e.target.closest(".tkCtop,.tkCbot,.tkLockH,.tkWh,.tkPbar")) return; if(S.locked){ e.preventDefault(); return; } pts[e.pointerId] = [e.clientX, e.clientY]; ov.setPointerCapture(e.pointerId); g0 = snap();
    if(Object.keys(pts).length === 1){ var t = Date.now(); if(t - lastTap < 300){ fit(); S.warp = null; apply(); keep(); } lastTap = t; } });
  ov.addEventListener("pointermove", function(e){ if(!pts[e.pointerId] || S.locked || S.warp || CAM.mode === "paper") return; pts[e.pointerId] = [e.clientX, e.clientY]; var ids = Object.keys(pts);
    if(ids.length === 1 && g0.n === 1){ S.tx = g0.tx + (e.clientX - g0.c[0][0]); S.ty = g0.ty + (e.clientY - g0.c[0][1]); }
    else if(ids.length >= 2 && g0.n >= 2){ var a = pts[ids[0]], b = pts[ids[1]], d1 = Math.hypot(b[0] - a[0], b[1] - a[1]), d0 = Math.hypot(g0.c[1][0] - g0.c[0][0], g0.c[1][1] - g0.c[0][1]) || 1;
      var an1 = Math.atan2(b[1] - a[1], b[0] - a[0]), an0 = Math.atan2(g0.c[1][1] - g0.c[0][1], g0.c[1][0] - g0.c[0][0]); S.s = Math.max(0.05, g0.s * d1 / d0); S.r = g0.r + (an1 - an0) * 180 / Math.PI;
      S.tx = g0.tx + ((a[0] + b[0]) / 2 - (g0.c[0][0] + g0.c[1][0]) / 2); S.ty = g0.ty + ((a[1] + b[1]) / 2 - (g0.c[0][1] + g0.c[1][1]) / 2); }
    apply(); });
  var up = function(e){ delete pts[e.pointerId]; g0 = snap(); if(!Object.keys(pts).length) keep(); };
  ov.addEventListener("pointerup", up); ov.addEventListener("pointercancel", up);
  function snap(){ var ids = Object.keys(pts); return {n:ids.length, c:ids.map(function(i){ return pts[i].slice(); }), tx:S.tx, ty:S.ty, s:S.s, r:S.r}; }
  // 4-corner warp handles
  function warpHandles(){ var box = ov.querySelector("#tkWarpH"); box.innerHTML = ""; if(!S.warp || S.locked) return;
    S.warp.forEach(function(pt, i){ var hd = document.createElement("div"); hd.className = "tkWh"; hd.style.left = pt[0] + "px"; hd.style.top = pt[1] + "px"; box.appendChild(hd);
      hd.onpointerdown = function(e){ e.stopPropagation(); hd.setPointerCapture(e.pointerId); hd.onpointermove = function(ev){ S.warp[i] = [ev.clientX, ev.clientY]; hd.style.left = ev.clientX + "px"; hd.style.top = ev.clientY + "px"; var hm = homography([[0, 0], [OV.width, 0], [OV.width, OV.height], [0, OV.height]], S.warp); if(hm) W.style.transform = matrix3d(hm); }; hd.onpointerup = function(){ hd.onpointermove = null; keep(); }; }; }); }
  // buttons
  ov.querySelector("#tkOp").value = S.op; ov.querySelector("#tkOp").oninput = function(){ S.op = +this.value; apply(); }; ov.querySelector("#tkOp").onchange = keep;
  ov.querySelectorAll("[data-a]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-a");
    if(a === "fh") S.fh = !S.fh; else if(a === "fv") S.fv = !S.fv; else if(a === "r90") S.r = (Math.round(S.r / 90) * 90 + 90) % 360; else if(a === "fit"){ fit(); S.warp = null; }
    else if(a === "warp"){ if(S.warp) S.warp = null; else { var c = [[0, 0], [OV.width, 0], [OV.width, OV.height], [0, OV.height]].map(function(q){ var x = q[0] * S.s + S.tx, y = q[1] * S.s + S.ty; return [x, y]; }); S.r = 0; S.fh = S.fv = false; S.warp = c; hint(L("Seret 4 bulatan ke 4 sudut kertas", "Drag the 4 dots onto the 4 corners of the paper")); } }
    else if(a === "view") S.view = S.view === "both" ? "cam" : S.view === "cam" ? "ovl" : "both"; else if(a === "grid") S.grid = !S.grid; else if(a === "zoom") S.zoom = S.zoom >= 2 ? 1 : S.zoom + 0.5;
    else if(a === "freeze"){ S.frozen = !S.frozen; var fz = ov.querySelector("#tkFz"); if(S.frozen){ fz.width = V.videoWidth || 1; fz.height = V.videoHeight || 1; try{ fz.getContext("2d").drawImage(V, 0, 0); }catch(e){} fz.classList.add("on"); } else fz.classList.remove("on"); b.textContent = S.frozen ? "▶" : "⏸"; }
    else if(a === "snap"){ snapCheck(); return; }
    else if(a === "tl"){ timelapse(b); return; }
    else if(a === "lock"){ S.locked = true; lockN = 0; ov.querySelector("#tkLockN").textContent = "0/5"; hint(L("Dikunci: sentuhan tangan tidak menggerakkan panduan", "Locked: a resting hand won't move the guide")); }
    apply(); keep(); }; });
  // unlock: 5 swipes on the handle
  var lockN = 0, sx = null, lh = ov.querySelector("#tkLockH");
  lh.addEventListener("pointerdown", function(e){ sx = e.clientX; }); lh.addEventListener("pointerup", function(e){ if(sx != null && Math.abs(e.clientX - sx) > 30){ lockN++; ov.querySelector("#tkLockN").textContent = lockN + "/5"; if(lockN >= 5){ S.locked = false; apply(); keep(); } } sx = null; });
  ov.querySelector("[data-md=paper]").onclick = function(){ if(CAM.mode === "paper") return; if(window.TekapTrack) TekapTrack.start(api(), CAM, OV, W, V); else hint(L("Kunci kertas belum dimuatkan", "Paper lock is not loaded")); };
  ov.querySelector("[data-md=stand]").onclick = function(){ if(CAM.stopTrack) CAM.stopTrack(); CAM.mode = "stand"; apply(); };
  CAM.apply = apply; CAM.mode = "stand";
  ov.querySelector("#tkTorch").onclick = function(){ try{ var tr = CAM.stream && CAM.stream.getVideoTracks()[0]; CAM.torch = !CAM.torch; tr.applyConstraints({advanced:[{torch:CAM.torch}]}).catch(function(){ hint(L("Lampu suluh tidak disokong", "Torch not supported")); }); }catch(e){} };
  // level: shows how flat the phone is (for a stand)
  ov.querySelector("#tkLvl").onclick = function(){ var on = !ov.classList.contains("lvl"); ov.classList.toggle("lvl", on); if(on){ CAM.lv = function(e){ var b = Math.round(e.beta || 0), g = Math.round(e.gamma || 0); hint("⊙ " + L("Condong ", "Tilt ") + b + "° / " + g + "°" + (Math.abs(b) < 3 && Math.abs(g) < 3 ? " ✓ " + L("rata", "flat") : "")); }; window.addEventListener("deviceorientation", CAM.lv); } else window.removeEventListener("deviceorientation", CAM.lv); };
  ov.querySelector("#tkStop").onclick = stopCam;
  // 📸 Check: the camera frame + where the guide sits on it (camera px), then the Check sheet
  function frameCanvas(max){ var src = CAM.src || V, vw = src.videoWidth || src.width, vh = src.videoHeight || src.height; if(!vw) return null; var k = Math.min(1, max / Math.max(vw, vh)), c = document.createElement("canvas"); c.width = Math.round(vw * k); c.height = Math.round(vh * k); c.getContext("2d").drawImage(S.frozen ? ov.querySelector("#tkFz") : src, 0, 0, c.width, c.height); return {c:c, k:k, vw:vw, vh:vh}; }
  function guideCam(fr){ var R = CAM.mode === "paper" && window.TekapTrack && TekapTrack._t.run(); if(R && R.cam) return R.cam.map(function(c){ return [c[0] / fr.vw, c[1] / fr.vh]; });
    var sw = ov.clientWidth || innerWidth, shh = ov.clientHeight || innerHeight, sc = Math.max(sw / fr.vw, shh / fr.vh) * (S.zoom || 1), ox = (sw - fr.vw * sc) / 2, oy = (shh - fr.vh * sc) / 2, cs = getComputedStyle(W), M = new DOMMatrix(cs.transform === "none" ? undefined : cs.transform), org = (cs.transformOrigin || "0 0").split(" ").map(parseFloat);
    return [[0, 0], [OV.width, 0], [OV.width, OV.height], [0, OV.height]].map(function(c){ var q = M.transformPoint(new DOMPoint(c[0] - org[0], c[1] - org[1], 0, 1)), x = q.x / q.w + org[0], y = q.y / q.w + org[1]; return [(x - ox) / sc / fr.vw, (y - oy) / sc / fr.vh]; }); }
  function snapCheck(){ var fr = frameCanvas(1100); if(!fr){ hint(L("Kamera belum sedia", "The camera is not ready")); return; } var q = guideCam(fr); checkSheet(p, fr.c.toDataURL("image/jpeg", 0.85), q, null); }
  // ⏱ timelapse: one camera frame every 3 s, made into a short video when stopped
  function timelapse(b){ if(CAM.tl){ var T = CAM.tl; CAM.tl = null; clearInterval(T.iv); b.classList.remove("on"); b.textContent = "⏱"; makeTimelapse(T.frames); return; }
    var T = CAM.tl = {frames:[], iv:0}; b.classList.add("on"); var grab = function(){ var fr = frameCanvas(640); if(fr && T.frames.length < 900){ T.frames.push(fr.c); b.textContent = "⏱ " + T.frames.length; } };
    grab(); T.iv = setInterval(grab, (db().set || {}).tlSec * 1000 || 3000); hint(L("Selang masa: satu gambar setiap 3 saat. Tekan ⏱ lagi untuk siap.", "Timelapse: one picture every 3 seconds. Tap ⏱ again to finish.")); }
  apply(); if(p.stand && p.stand.mode === "paper" && window.TekapTrack && (db().set || {}).paperAsked) TekapTrack.start(api(), CAM, OV, W, V); }
function stopCam(){ if(!CAM) return; if(CAM.tl){ clearInterval(CAM.tl.iv); var fr0 = CAM.tl.frames; CAM.tl = null; if(fr0.length > 1) makeTimelapse(fr0); } try{ (CAM.stream && CAM.stream.getTracks() || []).forEach(function(t){ t.stop(); }); }catch(e){} try{ if(H.N.keepAwake) H.N.keepAwake(false); }catch(e){} if(CAM.lv) window.removeEventListener("deviceorientation", CAM.lv); if(CAM.stopTrack) try{ CAM.stopTrack(); }catch(e){}
  if(CAM.ov && CAM.ov.parentNode) CAM.ov.parentNode.removeChild(CAM.ov); CAM = null; if(ST.pg === "edit" && EL && document.body.contains(EL)) render(); }

// ---------- 📸 Check: your work vs the guide (onion skin / side by side), saved to the practice log ----------
function guideImage(p){ var sz = pageSize(p), PX = 4, c = document.createElement("canvas"); c.width = Math.round(sz[0] * PX); c.height = Math.round(sz[1] * PX);
  return Promise.all(p.layers.map(function(l){ return l.t === "text" ? fontLoad(l.font) : imgEl(l.src).p; })).then(function(){ draw(c.getContext("2d"), p, PX, {transparent:true, hair:0.5}); return c; }); }
function warpOnto(guide, w, h, q){ // the guide page drawn where it sits on the photo (corners q, 0–1 of the photo)
  var out = document.createElement("canvas"); out.width = w; out.height = h; if(!q) return out; var dst = q.map(function(c){ return [c[0] * w, c[1] * h]; }), hm = homography(dst, [[0, 0], [guide.width, 0], [guide.width, guide.height], [0, guide.height]]); if(!hm) return out;
  var gd = guide.getContext("2d").getImageData(0, 0, guide.width, guide.height).data, ox = out.getContext("2d"), od = ox.createImageData(w, h), o = od.data, GW = guide.width, GH = guide.height;
  for(var y = 0; y < h; y++) for(var x = 0; x < w; x++){ var z = hm[6] * x + hm[7] * y + 1, u = (hm[0] * x + hm[1] * y + hm[2]) / z, v = (hm[3] * x + hm[4] * y + hm[5]) / z; if(u < 0 || v < 0 || u >= GW || v >= GH) continue; var i = ((v | 0) * GW + (u | 0)) * 4, j = (y * w + x) * 4; o[j] = gd[i]; o[j + 1] = gd[i + 1]; o[j + 2] = gd[i + 2]; o[j + 3] = gd[i + 3]; }
  ox.putImageData(od, 0, 0); return out; }
function checkSheet(p, du, q, saved){ var ov = H.showSheet("📸 " + L("Semak", "Check"), '<div class="rseg"><button class="chip on" data-cm="onion">◐ ' + L("Lapisan", "Onion skin") + '</button><button class="chip" data-cm="side">◫ ' + L("Sebelah", "Side by side") + '</button></div>' +
    '<div class="tkChk"><canvas id="ckC"></canvas></div><div class="tkRow"><span>📷</span><input type="range" id="ckO" min="0" max="1" step="0.05" value="0.5"><span>✍️</span></div>' +
    '<div class="btns">' + (saved ? '' : '<button class="btn gold" id="ckSave">📒 ' + L("Simpan ke log", "Save to the log") + '</button>') + '<button class="btn alt" id="ckShare">↗ ' + L("Kongsi", "Share") + '</button>' + (saved ? '<button class="btn delb" id="ckDel">🗑</button>' : '') + '</div>');
  ov.style.zIndex = 9500; var cv = ov.querySelector("#ckC"), mode = "onion", photo = new Image(), G = null, WG = null;
  var paint = function(){ if(!photo.width || !G) return; var a = +ov.querySelector("#ckO").value, c = cv.getContext("2d");
    if(mode === "onion"){ cv.width = photo.width; cv.height = photo.height; c.drawImage(photo, 0, 0); if(!WG) WG = warpOnto(G, photo.width, photo.height, q); c.globalAlpha = a; c.drawImage(WG, 0, 0); c.globalAlpha = 1; }
    else { var hh = 560, gw = Math.round(G.width * hh / G.height), rect = q && window.TekapImg ? TekapImg._t.warp(photo, q, 900) : photo, pw = Math.round(gw); cv.width = gw + pw + 12; cv.height = hh; c.fillStyle = "#fff"; c.fillRect(0, 0, cv.width, cv.height); c.drawImage(rect, 0, 0, pw, hh); c.drawImage(G, pw + 12, 0, gw, hh); } };
  photo.onload = function(){ guideImage(p).then(function(g){ G = g; paint(); }); }; photo.src = du;
  ov.querySelector("#ckO").oninput = paint;
  ov.querySelectorAll("[data-cm]").forEach(function(b){ b.onclick = function(){ mode = b.getAttribute("data-cm"); ov.querySelectorAll("[data-cm]").forEach(function(z){ z.classList.toggle("on", z === b); }); paint(); }; });
  var sv = ov.querySelector("#ckSave"); if(sv) sv.onclick = function(){ var id = uid(), key = "log" + id; iput("imgs", key, du).then(function(){ var P = proj(p.id) || p; P.log = P.log || []; P.log.push({id:id, at:Date.now(), img:key, q:q}); projPut(P); p.log = P.log; H.toast("📒 " + L("Disimpan ke log latihan", "Saved to the practice log")); sv.disabled = true; }); };
  ov.querySelector("#ckShare").onclick = function(){ try{ var b64 = cv.toDataURL("image/jpeg", 0.88).split(",")[1]; H.N.shareBinary("tekap-" + new Date().toISOString().slice(0, 10) + ".jpg", b64, "image/jpeg", p.name || ""); }catch(e){} };
  var dl = ov.querySelector("#ckDel"); if(dl) dl.onclick = function(){ if(!confirm(L("Padam dari log?", "Delete from the log?"))) return; var P = proj(p.id); P.log = (P.log || []).filter(function(x){ return x.id !== saved.id; }); projPut(P); idel("imgs", saved.img); H.closeOverlay(); pEdit(); };
  ov._close = function(){ H.closeOverlay(); ov.style.zIndex = ""; if(!CAM) pEdit(); }; ov.querySelector("#shX").onclick = ov._close; }
function makeTimelapse(frames){ if(!frames || frames.length < 2){ H.toast(L("Terlalu sedikit gambar", "Too few pictures")); return; }
  var c = document.createElement("canvas"); c.width = frames[0].width; c.height = frames[0].height; var x = c.getContext("2d"); x.drawImage(frames[0], 0, 0);
  var done = function(blob, ext, mime){ var r = new FileReader(); r.onload = function(){ H.N.shareBinary("tekap-timelapse." + ext, String(r.result).split(",")[1], mime, L("Selang masa tekap", "Tracing timelapse")); }; r.readAsDataURL(blob); };
  if(!window.MediaRecorder || !c.captureStream){ c.toBlob(function(b){ done(b, "jpg", "image/jpeg"); }, "image/jpeg", 0.85); return; }
  H.toast("🎞 " + L("Menyediakan video…", "Making the video…")); var st = c.captureStream(10), mt = MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm", rec = new MediaRecorder(st, {mimeType:mt}), parts = [];
  rec.ondataavailable = function(e){ if(e.data && e.data.size) parts.push(e.data); }; rec.onstop = function(){ done(new Blob(parts, {type:"video/webm"}), "webm", "video/webm"); };
  rec.start(); var i = 0, step = function(){ if(i >= frames.length){ setTimeout(function(){ rec.stop(); }, 150); return; } x.drawImage(frames[i++], 0, 0); setTimeout(step, 100); }; step(); }
// share a project as .tekap.json (pictures inside; fonts by name only, the files are never shared)
function shareProject(p){ var o = {tekap:1, v:1, project:JSON.parse(JSON.stringify(p)), imgs:{}, fonts:{}}; delete o.project.log; delete o.project.stand;
  var ks = []; p.layers.forEach(function(l){ if(l.t === "img"){ ks.push(l.src); ks.push(l.orig); } if(l.t === "text"){ var f = fontById(l.font); o.fonts[l.font] = f.name; } });
  Promise.all(ks.map(function(k){ return iget("imgs", k).then(function(v){ if(v) o.imgs[k] = v; }); })).then(function(){ var js = JSON.stringify(o), b64 = btoa(unescape(encodeURIComponent(js)));
    H.N.shareBinary((p.name || "tekap").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") + ".tekap.json", b64, "application/json", L("Projek Tekap: buka dengan My Ihsan", "A Trace project: open with My Ihsan")); }); }
function importObj(o){ if(!o || !o.tekap || !o.project) return false; var p = o.project, map = {}; p.id = uid(); p.log = []; p.stand = null;
  var have = {}; fontList().forEach(function(f){ have[f.id] = 1; }); var missing = [];
  p.layers.forEach(function(l){ l.id = uid(); if(l.t === "text" && !have[l.font]){ missing.push((o.fonts || {})[l.font] || l.font); l.font = isRtl(l.text) ? "amiri" : "fraunces"; } if(l.t === "img"){ var a = l.src, b = l.orig; l.src = uid() + "r"; l.orig = uid(); map[l.src] = a; map[l.orig] = b; } });
  return Promise.all(Object.keys(map).map(function(k){ var v = (o.imgs || {})[map[k]]; return v ? iput("imgs", k, v) : null; })).then(function(){ projPut(p); H.toast("📥 " + L("Projek diimport", "Project imported") + (missing.length ? " · " + L("fon tiada: ", "missing fonts: ") + missing.join(", ") : "")); go("edit", {id:p.id}); return true; }); }
function importJson(){ var h = function(r){ H.off("binfile", h); if(!r || !r.b64) return; try{ var o = JSON.parse(decodeURIComponent(escape(atob(r.b64)))); if(!importObj(o)) H.toast("⚠️ " + L("Bukan projek Tekap", "Not a Trace project")); }catch(e){ H.toast("⚠️ " + L("Bukan projek Tekap", "Not a Trace project")); } };
  H.on("binfile", h); if(H.N.pickAny) H.N.pickAny(); else H.N.pickBin(); }

// ---------- module ----------
function api(){ return {fontById:fontById, H:H, L:L, E:E, db:db, dbSave:dbSave, proj:proj, projPut:projPut, iget:iget, iput:iput, idel:idel, uid:uid, draw:draw, fontLoad:fontLoad, imgEl:imgEl, IMGC:IMGC, pageSize:pageSize, homography:homography, matrix3d:matrix3d, go:go, render:render, ST:ST, newProject:newProject, textLayer:textLayer, trace:trace}; }
window.Tekap = {view:function(el, h){ H = h; EL = el; render(); var q = window.__tkIn; if(q){ window.__tkIn = null; if(q.font){ ST.pg = "fonts"; render(); addFontB64(q.font, q.name); } else if(q.json) try{ importObj(JSON.parse(q.json)); }catch(e){} } }, back:function(){ if(CAM){ stopCam(); return true; } if(ST.pg !== "home"){ go("home"); return true; } return false; },
  navGet:function(){ return {pg:ST.pg, id:ST.id, k:ST.pg + "/" + (ST.id || "")}; }, navSet:function(o){ if(o){ ST.pg = o.pg || "home"; ST.id = o.id || null; if(ST.pg === "edit" && !proj(ST.id)) ST.pg = "home"; if(EL && document.body.contains(EL)) render(); } },
  _t:{lineAt:function(a, b){ return lineAt(a, b); }, api:api, addFontB64:function(b, n){ return addFontB64(b, n); }, importObj:function(o){ return importObj(o); }, warpOnto:warpOnto, metrics:function(id){ return fontLoad(id).then(function(r){ return r.m; }); }, homography:homography, matrix3d:matrix3d, ST:ST, cam:function(){ return CAM; }, stop:stopCam, thin:thin}};
})();
