/* My Ihsan 0.6.64 · Tekap › 📄 Paper lock (owner spec tekap-ar-trace-spec.md §5, phase C). The guide sticks to the paper while the phone moves.
   Pure JavaScript (no 9 MB OpenCV download): each frame (≈ 15 a second) a small copy of the camera picture is searched for
   (1) the 4 corner markers of the printed marker sheet (default): adaptive threshold → dark blobs → convex hull → 4-corner quad →
       read a 6×6 grid (black border + 4×4 code, ArUco style, 4 codes that differ by ≥ 6 bits in every rotation);
       any 1–4 markers visible give the page by least squares (a hand over one marker is fine);
   (2) or, with "No markers, use the paper edges", the largest bright blob (Otsu) → hull → quad → each side refitted as a line
       through its middle part, so a hand over one corner does not pull the corner in.
   Page mm → camera px (homography) → screen px (object-fit: cover) → CSS matrix3d on the guide. One-Euro filter on the 8 corner values;
   lost paper: hold 1 s, then fade with "Bring the whole paper into view"; markers unseen for 3 s → offer the paper edges.
   TekapTrack.start(api, CAM, OV, W, V); TekapTrack.sheet(api, p) = marker sheet PDF. Test hooks: TekapTrack._t, CAM.src = a canvas. */
(function(){
"use strict";
var CODES = [0x38af, 0x7483, 0xc657, 0x5d31], MS = 22, MG = 8;   // marker size and margin, mm
function bitsOf(c){ var a = []; for(var i = 15; i >= 0; i--) a.push((c >> i) & 1); return a; }

// ---------- linear algebra ----------
// least squares homography (h33 = 1) from ≥ 4 point pairs
function homLS(src, dst){ var M = [], v = [], i, j, k; for(i = 0; i < 8; i++){ M.push([0, 0, 0, 0, 0, 0, 0, 0]); v.push(0); }
  var add = function(r, b){ for(var a = 0; a < 8; a++){ for(var c = 0; c < 8; c++) M[a][c] += r[a] * r[c]; v[a] += r[a] * b; } };
  for(i = 0; i < src.length; i++){ var x = src[i][0], y = src[i][1], u = dst[i][0], w = dst[i][1]; add([x, y, 1, 0, 0, 0, -u * x, -u * y], u); add([0, 0, 0, x, y, 1, -w * x, -w * y], w); }
  for(k = 0; k < 8; k++){ var mx = k; for(i = k + 1; i < 8; i++) if(Math.abs(M[i][k]) > Math.abs(M[mx][k])) mx = i; var t = M[k]; M[k] = M[mx]; M[mx] = t; var tv = v[k]; v[k] = v[mx]; v[mx] = tv;
    if(Math.abs(M[k][k]) < 1e-12) return null; for(i = k + 1; i < 8; i++){ var f = M[i][k] / M[k][k]; for(j = k; j < 8; j++) M[i][j] -= f * M[k][j]; v[i] -= f * v[k]; } }
  var h = []; for(i = 7; i >= 0; i--){ var s = v[i]; for(j = i + 1; j < 8; j++) s -= M[i][j] * h[j]; h[i] = s / M[i][i]; } return h.concat([1]); }
function hApply(h, x, y){ var z = h[6] * x + h[7] * y + h[8]; return [(h[0] * x + h[1] * y + h[2]) / z, (h[3] * x + h[4] * y + h[5]) / z]; }

// ---------- image helpers ----------
function grayOf(id){ var d = id.data, n = id.width * id.height, g = new Uint8Array(n); for(var i = 0; i < n; i++) g[i] = (d[i * 4] * 77 + d[i * 4 + 1] * 150 + d[i * 4 + 2] * 29) >> 8; return g; }
function integral(g, w, h){ var I = new Float64Array((w + 1) * (h + 1)); for(var y = 0; y < h; y++){ var s = 0; for(var x = 0; x < w; x++){ s += g[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + s; } } return I; }
// connected components (4-connected) of mask==1; returns labels + per-label stats
function components(mask, w, h, minN){ var lab = new Int32Array(w * h), st = [], out = [], id = 0, stack = new Int32Array(w * h);
  for(var p0 = 0; p0 < w * h; p0++){ if(!mask[p0] || lab[p0]) continue; id++; var sp = 0, n = 0, x0 = w, x1 = 0, y0 = h, y1 = 0; stack[sp++] = p0; lab[p0] = id;
    while(sp){ var p = stack[--sp], x = p % w, y = (p / w) | 0; n++; if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y;
      if(x > 0 && mask[p - 1] && !lab[p - 1]){ lab[p - 1] = id; stack[sp++] = p - 1; } if(x < w - 1 && mask[p + 1] && !lab[p + 1]){ lab[p + 1] = id; stack[sp++] = p + 1; }
      if(y > 0 && mask[p - w] && !lab[p - w]){ lab[p - w] = id; stack[sp++] = p - w; } if(y < h - 1 && mask[p + w] && !lab[p + w]){ lab[p + w] = id; stack[sp++] = p + w; } }
    if(n >= minN) out.push({id:id, n:n, x0:x0, x1:x1, y0:y0, y1:y1}); }
  return {lab:lab, list:out}; }
function boundary(lab, w, h, c){ var pts = []; for(var y = c.y0; y <= c.y1; y++) for(var x = c.x0; x <= c.x1; x++){ var p = y * w + x; if(lab[p] !== c.id) continue;
    if(x === 0 || y === 0 || x === w - 1 || y === h - 1 || lab[p - 1] !== c.id || lab[p + 1] !== c.id || lab[p - w] !== c.id || lab[p + w] !== c.id) pts.push([x + 0.5, y + 0.5]); } return pts; }
function hull(P){ if(P.length < 3) return P.slice(); var a = P.slice().sort(function(p, q){ return p[0] - q[0] || p[1] - q[1]; }), cr = function(o, p, q){ return (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]); }, lo = [], up = [], i;
  for(i = 0; i < a.length; i++){ while(lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], a[i]) <= 0) lo.pop(); lo.push(a[i]); }
  for(i = a.length - 1; i >= 0; i--){ while(up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], a[i]) <= 0) up.pop(); up.push(a[i]); }
  lo.pop(); up.pop(); return lo.concat(up); }
function area(q){ var s = 0; for(var i = 0; i < q.length; i++){ var a = q[i], b = q[(i + 1) % q.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
// the largest-area 4 corners among the hull points (hull is small after thinning the list)
function quadOf(H0){ var H = H0; if(H.length < 4) return null; if(H.length > 60){ var st = H.length / 60, T = []; for(var t = 0; t < H.length; t += st) T.push(H[Math.floor(t)]); H = T; }
  var n = H.length, best = null, ba = 0, i, j, k, l;
  // diameter pair, then the best of the rest by area (O(n²) with the two fixed sweeps)
  for(i = 0; i < n; i++) for(k = i + 2; k < n; k++){ var bj = -1, bjA = 0, bl = -1, blA = 0;
      for(j = i + 1; j < k; j++){ var a1 = Math.abs(area([H[i], H[j], H[k]])); if(a1 > bjA){ bjA = a1; bj = j; } }
      for(l = k + 1; l < n + i; l++){ var a2 = Math.abs(area([H[k], H[l % n], H[i]])); if(a2 > blA){ blA = a2; bl = l % n; } }
      if(bj >= 0 && bl >= 0 && bjA + blA > ba){ ba = bjA + blA; best = [H[i], H[bj], H[k], H[bl]]; } }
  if(best && area(best) < 0) best = [best[0], best[3], best[2], best[1]];   // clockwise on screen (y down)
  return best; }
function lineFit(pts){ var n = pts.length, mx = 0, my = 0, i; for(i = 0; i < n; i++){ mx += pts[i][0]; my += pts[i][1]; } mx /= n; my /= n; var sxx = 0, syy = 0, sxy = 0;
  for(i = 0; i < n; i++){ var dx = pts[i][0] - mx, dy = pts[i][1] - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; } var th = 0.5 * Math.atan2(2 * sxy, sxx - syy); return {p:[mx, my], d:[Math.cos(th), Math.sin(th)]}; }
function meet(a, b){ var det = a.d[0] * b.d[1] - a.d[1] * b.d[0]; if(Math.abs(det) < 1e-9) return null; var t = ((b.p[0] - a.p[0]) * b.d[1] - (b.p[1] - a.p[1]) * b.d[0]) / det; return [a.p[0] + a.d[0] * t, a.p[1] + a.d[1] * t]; }
// refine a quad: each side becomes a line fitted to boundary points near the middle of that side, then corners = intersections
function refine(q, pts){ var L = [], i;
  for(i = 0; i < 4; i++){ var a = q[i], b = q[(i + 1) % 4], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, tol = Math.max(2, len * 0.03), sel = [];
    for(var k = 0; k < pts.length; k++){ var px = pts[k][0] - a[0], py = pts[k][1] - a[1], t = px * ux + py * uy, d = Math.abs(px * uy - py * ux); if(t > len * 0.2 && t < len * 0.8 && d < tol) sel.push(pts[k]); }
    if(sel.length < 6) return q; var ln = lineFit(sel);
    // second pass along the whole side, close to the fitted line
    var sel2 = []; for(var k2 = 0; k2 < pts.length; k2++){ var qx = pts[k2][0] - ln.p[0], qy = pts[k2][1] - ln.p[1], d2 = Math.abs(qx * ln.d[1] - qy * ln.d[0]), t2 = (pts[k2][0] - a[0]) * ux + (pts[k2][1] - a[1]) * uy; if(d2 < 1.5 && t2 > len * 0.05 && t2 < len * 0.95) sel2.push(pts[k2]); }
    L.push(sel2.length > sel.length ? lineFit(sel2) : ln); }
  var out = []; for(i = 0; i < 4; i++){ var c = meet(L[(i + 3) % 4], L[i]); if(!c) return q; out.push(c); } return out; }

// ---------- markers ----------
function readMarker(g, w, h, q){ var best = null;
  for(var s = 0; s < 4; s++){ var qq = [q[s], q[(s + 1) % 4], q[(s + 2) % 4], q[(s + 3) % 4]], hm = homLS([[0, 0], [6, 0], [6, 6], [0, 6]], qq); if(!hm) return null; var v = [], mn = 255, mx = 0;
    for(var cy = 0; cy < 6; cy++) for(var cx = 0; cx < 6; cx++){ var sum = 0, n = 0; for(var oy = -1; oy <= 1; oy++) for(var ox = -1; ox <= 1; ox++){ var pt = hApply(hm, cx + 0.5 + ox * 0.18, cy + 0.5 + oy * 0.18), x = Math.round(pt[0]), y = Math.round(pt[1]); if(x < 0 || y < 0 || x >= w || y >= h) continue; sum += g[y * w + x]; n++; }
      var val = n ? sum / n : 255; v.push(val); if(val < mn) mn = val; if(val > mx) mx = val; }
    if(mx - mn < 40) return null; var th = (mn + mx) / 2, bad = 0, bits = [];
    for(var i = 0; i < 36; i++){ var x6 = i % 6, y6 = (i / 6) | 0, dark = v[i] < th; if(x6 === 0 || y6 === 0 || x6 === 5 || y6 === 5){ if(!dark) bad++; } else bits.push(dark ? 1 : 0); }
    if(bad > 1) return null;
    for(var c = 0; c < CODES.length; c++){ var cb = bitsOf(CODES[c]), hd = 0; for(var b = 0; b < 16; b++) if(cb[b] !== bits[b]) hd++; if(hd <= 1 && (!best || hd < best.hd)) best = {id:c, hd:hd, q:qq}; } }
  return best; }
function markerPos(id, pw, ph){ var x = id === 1 || id === 2 ? pw - MG - MS : MG, y = id >= 2 ? ph - MG - MS : MG; return [[x, y], [x + MS, y], [x + MS, y + MS], [x, y + MS]]; }
function detectMarkers(id, pw, ph){ var w = id.width, h = id.height, g = grayOf(id), I = integral(g, w, h), r = Math.max(4, Math.round(Math.min(w, h) / 16)), mask = new Uint8Array(w * h);
  for(var y = 0; y < h; y++){ var ya = Math.max(0, y - r), yb = Math.min(h, y + r + 1); for(var x = 0; x < w; x++){ var xa = Math.max(0, x - r), xb = Math.min(w, x + r + 1), W1 = w + 1;
      var s = I[yb * W1 + xb] - I[ya * W1 + xb] - I[yb * W1 + xa] + I[ya * W1 + xa], m = s / ((yb - ya) * (xb - xa)); mask[y * w + x] = g[y * w + x] < m - 10 ? 1 : 0; } }
  var cc = components(mask, w, h, 40), found = {}, src = [], dst = [];
  cc.list.forEach(function(c){ var bw = c.x1 - c.x0 + 1, bh = c.y1 - c.y0 + 1; if(bw < 8 || bh < 8 || bw > w * 0.4 || bh > h * 0.4 || bw > bh * 4 || bh > bw * 4) return;
    var P = boundary(cc.lab, w, h, c), q = quadOf(hull(P)); if(!q) return; var A = area(q); if(A < 40 || c.n / A < 0.45 || c.n / A > 1.05) return;
    var mk = readMarker(g, w, h, q); if(mk && (!found[mk.id] || found[mk.id].hd > mk.hd)) found[mk.id] = mk; });
  var ids = Object.keys(found); if(!ids.length) return null;
  ids.forEach(function(k){ var mp = markerPos(+k, pw, ph); for(var i = 0; i < 4; i++){ src.push(mp[i]); dst.push(found[k].q[i]); } });
  var hm = homLS(src, dst); if(!hm) return null;
  return {n:ids.length, ids:ids.map(Number), h:hm, corners:[[0, 0], [pw, 0], [pw, ph], [0, ph]].map(function(p){ return hApply(hm, p[0], p[1]); })}; }
// plain paper: Otsu → biggest bright blob → quad → refit sides
function otsu(g){ var hist = new Float64Array(256), n = g.length, i; for(i = 0; i < n; i++) hist[g[i]]++; var sum = 0; for(i = 0; i < 256; i++) sum += i * hist[i]; var sB = 0, wB = 0, best = 0, th = 128;
  for(i = 0; i < 256; i++){ wB += hist[i]; if(!wB) continue; var wF = n - wB; if(!wF) break; sB += i * hist[i]; var mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if(v > best){ best = v; th = i; } } return th; }
function detectPaper(id, pw, ph, prev){ var w = id.width, h = id.height, g = grayOf(id), th = otsu(g), mask = new Uint8Array(w * h), D = id.data;
  // paper = bright and nearly colourless (a hand or a wooden table is bright but coloured)
  for(var i = 0; i < w * h; i++){ var r = D[i * 4], gg = D[i * 4 + 1], bb = D[i * 4 + 2], mx = Math.max(r, gg, bb), mn = Math.min(r, gg, bb); mask[i] = g[i] > th && mx - mn < Math.max(28, mx * 0.2) ? 1 : 0; }
  var cc = components(mask, w, h, w * h * 0.04); if(!cc.list.length) return null; var c = cc.list.sort(function(a, b){ return b.n - a.n; })[0], P = boundary(cc.lab, w, h, c), q = quadOf(hull(P)); if(!q) return null;
  var A = area(q); if(c.n / A < 0.75) return null; q = refine(q, P); if(area(q) < w * h * 0.03) return null;
  // which corner is the page's top-left: keep the order closest to the last frame, else short side first for a portrait page
  var ratio = pw / ph, bestS = 0, bestV = 1e18; for(var s = 0; s < 4; s++){ var qq = [q[s], q[(s + 1) % 4], q[(s + 2) % 4], q[(s + 3) % 4]], v;
    if(prev){ v = 0; for(var k = 0; k < 4; k++) v += Math.hypot(qq[k][0] - prev[k][0], qq[k][1] - prev[k][1]); }
    else { var l01 = Math.hypot(qq[1][0] - qq[0][0], qq[1][1] - qq[0][1]), l12 = Math.hypot(qq[2][0] - qq[1][0], qq[2][1] - qq[1][1]); v = Math.abs(Math.log((l01 / l12) / ratio)) * 1000 + qq[0][1] + qq[0][0] * 0.5; }
    if(v < bestV){ bestV = v; bestS = s; } }
  var Q = [q[bestS], q[(bestS + 1) % 4], q[(bestS + 2) % 4], q[(bestS + 3) % 4]], hm = homLS([[0, 0], [pw, 0], [pw, ph], [0, ph]], Q);
  return hm ? {n:1, h:hm, corners:Q} : null; }

// ---------- One-Euro filter ----------
function OneEuro(minCut, beta){ this.mc = minCut; this.b = beta; this.x = null; this.dx = 0; }
OneEuro.prototype.f = function(v, dt){ var al = function(c){ var tau = 1 / (2 * Math.PI * c); return 1 / (1 + tau / dt); };
  if(this.x == null){ this.x = v; return v; } var d = (v - this.x) / dt, ad = al(1); this.dx = ad * d + (1 - ad) * this.dx; var c = this.mc + this.b * Math.abs(this.dx), a = al(c); this.x = a * v + (1 - a) * this.x; return this.x; };

// ---------- marker sheet (PDF) ----------
function drawSheet(c, pw, ph, k, label){ c.fillStyle = "#fff"; c.fillRect(0, 0, pw * k, ph * k);
  for(var id = 0; id < 4; id++){ var mp = markerPos(id, pw, ph), x0 = mp[0][0] * k, y0 = mp[0][1] * k, cs = MS / 6 * k, bits = bitsOf(CODES[id]); c.fillStyle = "#000"; c.fillRect(x0, y0, MS * k, MS * k); c.fillStyle = "#fff";
    for(var i = 0; i < 16; i++) if(!bits[i]) c.fillRect(x0 + ((i % 4) + 1) * cs, y0 + (((i / 4) | 0) + 1) * cs, cs + 0.5, cs + 0.5); }
  if(label){ c.fillStyle = "#999"; c.font = (3 * k) + "px sans-serif"; c.textAlign = "center"; c.fillText(label, pw * k / 2, (MG + 3) * k); } }
function sheet(api, p){ var H = api.H, sz = api.pageSize(p), k = 150 / 25.4, cv = document.createElement("canvas"); cv.width = Math.round(sz[0] * k); cv.height = Math.round(sz[1] * k);
  drawSheet(cv.getContext("2d"), sz[0], sz[1], k, "My Ihsan · Tekap · " + (p.page.fmt || "").toUpperCase() + " — " + api.L("cetak 100%, jangan 'muat ke halaman'", "print at 100%, not 'fit to page'"));
  H.sharePdf("tekap-marker-" + (p.page.fmt || "page") + ".pdf", H.canvasPdf(cv, sz[0], sz[1], 0.95), api.L("Helaian penanda Tekap", "Tekap marker sheet")); }

// ---------- the live loop ----------
var RUN = null;
function start(api, CAM, OV, W, V){ var H = api.H, L = api.L, p = CAM.p, d = api.db(), set = d.set || {};
  if(RUN) stop();
  var ov = CAM.ov, begin = function(edges){ set.paperAsked = true; set.edges = !!edges; d = api.db(); d.set = Object.assign(d.set || {}, set); api.dbSave(d); H.closeOverlay(); run(api, CAM, OV, W, V); };
  if(!set.paperAsked){ var sh = H.showSheet("📄 " + L("Kunci kertas", "Paper lock"), '<div class="mut small">' + L("Panduan melekat pada kertas walaupun telefon bergerak. Paling stabil dengan helaian penanda: 4 petak kecil di bucu kertas.", "The guide sticks to the paper even when the phone moves. Steadiest with the marker sheet: 4 small squares in the paper's corners.") + '</div>' +
      '<button class="btn gold full" id="tpPrint">🖨 ' + L("Cetak helaian penanda (PDF)", "Print the marker sheet (PDF)") + '</button><button class="btn alt full" id="tpHave" style="margin-top:8px">✓ ' + L("Sudah ada, mula", "I have it, start") + '</button>' +
      '<button class="btn alt full" id="tpEdge" style="margin-top:8px">▭ ' + L("Tiada penanda, guna tepi kertas", "No markers, use the paper edges") + '</button><div class="mut tiny">' + L("Kertas mesti rata dan kelihatan penuh pada mulanya. Tanpa penanda: kertas putih di atas meja gelap paling baik.", "The paper must be flat and fully in view at the start. Without markers: white paper on a dark table works best.") + '</div>');
    sh.style.zIndex = 9500; sh.querySelector("#tpPrint").onclick = function(){ sheet(api, p); }; sh.querySelector("#tpHave").onclick = function(){ begin(false); }; sh.querySelector("#tpEdge").onclick = function(){ begin(true); }; return; }
  run(api, CAM, OV, W, V); }
function run(api, CAM, OV, W, V){ var H = api.H, L = api.L, p = CAM.p, sz = api.pageSize(p), ov = CAM.ov, cv = document.createElement("canvas"), cx = cv.getContext("2d", {willReadFrequently:true});
  var R = RUN = {on:true, edges:!!(api.db().set || {}).edges, last:0, seen:0, lastMarker:Date.now(), F:[], prev:null, frames:0, hits:0};
  for(var i = 0; i < 8; i++) R.F.push(new OneEuro(1.2, 0.02));
  CAM.mode = "paper"; ov.classList.add("paper"); ov.querySelectorAll("[data-md]").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-md") === "paper"); });
  var bar = document.createElement("div"); bar.className = "tkPbar"; bar.innerHTML = '<button class="chip" id="tpMode"></button><button class="chip" id="tpSheet">🖨 ' + L("Helaian", "Sheet") + '</button><span id="tpSt" class="tkPst"></span>'; ov.appendChild(bar);
  var modeLbl = function(){ bar.querySelector("#tpMode").textContent = R.edges ? "▭ " + L("Tepi kertas", "Paper edges") : "◰ " + L("Penanda", "Markers"); };
  modeLbl(); bar.querySelector("#tpMode").onclick = function(){ R.edges = !R.edges; var d = api.db(); d.set.edges = R.edges; api.dbSave(d); R.prev = null; R.F.forEach(function(f){ f.x = null; }); modeLbl(); };
  bar.querySelector("#tpSheet").onclick = function(){ sheet(api, p); };
  var hint = function(t){ var h = ov.querySelector("#tkHint"); if(!h) return; h.textContent = t; h.classList.add("on"); clearTimeout(hint._t); hint._t = setTimeout(function(){ h.classList.remove("on"); }, 2500); };
  W.style.transformOrigin = "0 0"; W.style.opacity = 0;
  var place = function(C){ // camera px corners → screen px; the guide canvas (page × PX) onto them
    var src = CAM.src || V, vw = src.videoWidth || src.width, vh = src.videoHeight || src.height, sw = ov.clientWidth || window.innerWidth, shh = ov.clientHeight || window.innerHeight, s = Math.max(sw / vw, shh / vh) * (CAM.S.zoom || 1), ox = (sw - vw * s) / 2, oy = (shh - vh * s) / 2;
    var S2 = C.map(function(c){ return [ox + c[0] * s, oy + c[1] * s]; }), hm = api.homography([[0, 0], [OV.width, 0], [OV.width, OV.height], [0, OV.height]], S2);
    if(hm) W.style.transform = api.matrix3d(hm); R.screen = S2; };
  var tick = function(){ if(!R.on) return; R.raf = requestAnimationFrame(tick); var now = performance.now(); if(now - R.last < 66) return; var dt = R.last ? (now - R.last) / 1000 : 1 / 15; R.last = now;
    var src = CAM.src || V, vw = src.videoWidth || src.width, vh = src.videoHeight || src.height; if(!vw || !vh) return;
    var k = Math.min(1, 480 / Math.max(vw, vh)); cv.width = Math.round(vw * k); cv.height = Math.round(vh * k); try{ cx.drawImage(src, 0, 0, cv.width, cv.height); }catch(e){ return; }
    var id = cx.getImageData(0, 0, cv.width, cv.height), res = window.__TEKAP_FAKE ? {corners:window.__TEKAP_FAKE.map(function(c){ return [c[0] * k, c[1] * k]; }), n:4} : R.edges ? detectPaper(id, sz[0], sz[1], R.prev) : detectMarkers(id, sz[0], sz[1]);
    R.frames++;
    if(res){ R.hits++; R.seen = now; if(!R.edges) R.lastMarker = Date.now(); R.prev = res.corners; var C = [], j = 0; res.corners.forEach(function(c){ C.push([R.F[j++].f(c[0] / k, dt), R.F[j++].f(c[1] / k, dt)]); }); R.cam = C; R.n = res.n;
      place(C); W.style.transition = "opacity .2s"; W.style.opacity = CAM.S.view === "cam" ? 0 : CAM.S.op; bar.querySelector("#tpSt").textContent = R.edges ? "✓" : "✓ " + res.n + "/4"; }
    else { if(R.seen && now - R.seen > 1000){ W.style.transition = "opacity .6s"; W.style.opacity = 0.12; hint(L("Bawa seluruh kertas ke dalam paparan", "Bring the whole paper into view")); R.F.forEach(function(f){ f.x = null; }); R.prev = null; } bar.querySelector("#tpSt").textContent = "…";
      if(!R.edges && Date.now() - R.lastMarker > 3000){ R.lastMarker = Date.now(); hint(L("Penanda tidak kelihatan. Tekan ◰ untuk guna tepi kertas.", "No markers seen. Tap ◰ to use the paper edges.")); } } };
  R.raf = requestAnimationFrame(tick);
  R.stop = function(){ R.on = false; cancelAnimationFrame(R.raf); if(bar.parentNode) bar.parentNode.removeChild(bar); ov.classList.remove("paper"); CAM.mode = "stand"; W.style.opacity = ""; W.style.transition = "";
    ov.querySelectorAll("[data-md]").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-md") === "stand"); }); if(CAM.apply) CAM.apply(); };
  CAM.stopTrack = function(){ if(RUN) RUN.stop(); RUN = null; }; }
function stop(){ if(RUN){ RUN.stop(); RUN = null; } }
window.TekapTrack = {start:start, stop:stop, sheet:sheet, _t:{detectMarkers:detectMarkers, detectPaper:detectPaper, drawSheet:drawSheet, homLS:homLS, hApply:hApply, OneEuro:OneEuro, CODES:CODES, MS:MS, MG:MG, run:function(){ return RUN; }}};
})();
