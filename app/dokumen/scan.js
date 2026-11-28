/* My Ihsan 0.7.93 (owner pick #46): Tulis › Dokumen › 📷 Document scanner. Photograph (or pick) a page; the app finds the sheet's four corners
   (largest bright region, its extreme points), you can drag them; the page is straightened (perspective fix by homography) and cleaned
   (colour, grey, black & white with adaptive threshold, or boosted contrast). Several pages → one PDF (A4) to share or save in Books › Documents.
   Nothing leaves the phone. DocScan.open(H) · DocScan._t (pure: corners, homography, warp, threshold) */
(function(){ "use strict";
var H = null, PAGES = [], stream = null;
function L(a, b){ return H.L2x(a, b); }
// ---------- pure image helpers ----------
function gray(d, n){ var g = new Float32Array(n); for(var i = 0; i < n; i++) g[i] = d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114; return g; }
function otsu(g){ var h = new Array(256).fill(0), n = g.length, i; for(i = 0; i < n; i++) h[Math.max(0, Math.min(255, g[i] | 0))]++; var sum = 0; for(i = 0; i < 256; i++) sum += i * h[i];
  var sB = 0, wB = 0, best = 0, th = 128; for(i = 0; i < 256; i++){ wB += h[i]; if(!wB) continue; var wF = n - wB; if(!wF) break; sB += i * h[i]; var mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if(v > best){ best = v; th = i; } } return th; }
// four corners [tl, tr, br, bl] of the largest bright blob in a w×h grey image; falls back to an inset frame
function corners(g, w, h){ var th = otsu(g), lab = new Int32Array(w * h), best = 0, bestId = 0, id = 0, st = [];
  for(var s = 0; s < w * h; s++){ if(lab[s] || g[s] <= th) continue; id++; var cnt = 0; st.push(s); lab[s] = id;
    while(st.length){ var p = st.pop(), x = p % w, y = (p / w) | 0; cnt++; var nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]; for(var k = 0; k < 4; k++){ var q = nb[k]; if(q >= 0 && !lab[q] && g[q] > th){ lab[q] = id; st.push(q); } } }
    if(cnt > best){ best = cnt; bestId = id; } }
  if(best < w * h * 0.08) return [[w * .08, h * .08], [w * .92, h * .08], [w * .92, h * .92], [w * .08, h * .92]];
  var tl = null, tr = null, br = null, bl = null, a = Infinity, b = -Infinity, c = -Infinity, d = Infinity;
  for(var p2 = 0; p2 < w * h; p2++){ if(lab[p2] !== bestId) continue; var x2 = p2 % w, y2 = (p2 / w) | 0, sp = x2 + y2, df = x2 - y2;
    if(sp < a){ a = sp; tl = [x2, y2]; } if(df > b){ b = df; tr = [x2, y2]; } if(sp > c){ c = sp; br = [x2, y2]; } if(df < d){ d = df; bl = [x2, y2]; } }
  return [tl, tr, br, bl]; }
// homography mapping unit-rect corners (0,0),(1,0),(1,1),(0,1) → quad; returns f(u,v) → [x,y]
function homo(q){ var x0 = q[0][0], y0 = q[0][1], x1 = q[1][0], y1 = q[1][1], x2 = q[2][0], y2 = q[2][1], x3 = q[3][0], y3 = q[3][1];
  var dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3, g, hh;
  if(Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9){ g = 0; hh = 0; } else { var den = dx1 * dy2 - dx2 * dy1; g = (sx * dy2 - dx2 * sy) / den; hh = (dx1 * sy - sx * dy1) / den; }
  var a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  return function(u, v){ var w = g * u + hh * v + 1; return [(a * u + b * v + c) / w, (d * u + e * v + f) / w]; }; }
function dist(p, q){ return Math.hypot(p[0] - q[0], p[1] - q[1]); }
function outSize(q){ var w = Math.max(dist(q[0], q[1]), dist(q[3], q[2])), h = Math.max(dist(q[0], q[3]), dist(q[1], q[2])), r = h / (w || 1), W = 1240; if(Math.abs(r - 1.414) < 0.18) r = 1.414; return [W, Math.round(W * Math.max(0.3, Math.min(3, r)))]; }
function warp(src, q, W, Hh){ var sw = src.width, sh = src.height, s = src.getContext("2d").getImageData(0, 0, sw, sh).data, out = document.createElement("canvas"); out.width = W; out.height = Hh;
  var o = out.getContext("2d"), od = o.createImageData(W, Hh), D = od.data, f = homo(q);
  for(var y = 0; y < Hh; y++) for(var x = 0; x < W; x++){ var p = f((x + .5) / W, (y + .5) / Hh), px = p[0] - .5, py = p[1] - .5, x0 = Math.floor(px), y0 = Math.floor(py), fx = px - x0, fy = py - y0, o4 = (y * W + x) * 4;
    if(x0 < 0 || y0 < 0 || x0 >= sw - 1 || y0 >= sh - 1){ D[o4] = D[o4 + 1] = D[o4 + 2] = 255; D[o4 + 3] = 255; continue; }
    var i00 = (y0 * sw + x0) * 4, i10 = i00 + 4, i01 = i00 + sw * 4, i11 = i01 + 4;
    for(var k = 0; k < 3; k++) D[o4 + k] = (s[i00 + k] * (1 - fx) + s[i10 + k] * fx) * (1 - fy) + (s[i01 + k] * (1 - fx) + s[i11 + k] * fx) * fy; D[o4 + 3] = 255; }
  o.putImageData(od, 0, 0); return out; }
function filter(cv, mode){ if(mode === "orig") return cv; var w = cv.width, h = cv.height, c = document.createElement("canvas"); c.width = w; c.height = h; var x = c.getContext("2d"); x.drawImage(cv, 0, 0); var id = x.getImageData(0, 0, w, h), d = id.data, n = w * h, i;
  if(mode === "gray" || mode === "bw"){ var g = gray(d, n);
    if(mode === "bw"){ var I = new Float64Array((w + 1) * (h + 1)), r = Math.max(8, Math.round(w / 40)); for(var yy = 0; yy < h; yy++){ var row = 0; for(var xx = 0; xx < w; xx++){ row += g[yy * w + xx]; I[(yy + 1) * (w + 1) + xx + 1] = I[yy * (w + 1) + xx + 1] + row; } }
      for(var y = 0; y < h; y++) for(var x2 = 0; x2 < w; x2++){ var a0 = Math.max(0, x2 - r), b0 = Math.max(0, y - r), a1 = Math.min(w, x2 + r + 1), b1 = Math.min(h, y + r + 1), cnt = (a1 - a0) * (b1 - b0), m = (I[b1 * (w + 1) + a1] - I[b0 * (w + 1) + a1] - I[b1 * (w + 1) + a0] + I[b0 * (w + 1) + a0]) / cnt, v = g[y * w + x2] < m - 10 ? 0 : 255, o = (y * w + x2) * 4; d[o] = d[o + 1] = d[o + 2] = v; } }
    else for(i = 0; i < n; i++){ d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = g[i]; } }
  else { var lo = 255, hi = 0, gg = gray(d, n); for(i = 0; i < n; i += 7){ lo = Math.min(lo, gg[i]); hi = Math.max(hi, gg[i]); } var k = 255 / Math.max(30, hi - lo - 20); for(i = 0; i < n * 4; i++){ if(i % 4 === 3) continue; d[i] = Math.max(0, Math.min(255, (d[i] - lo - 10) * k)); } }
  x.putImageData(id, 0, 0); return c; }
function rotate(cv){ var c = document.createElement("canvas"); c.width = cv.height; c.height = cv.width; var x = c.getContext("2d"); x.translate(c.width, 0); x.rotate(Math.PI / 2); x.drawImage(cv, 0, 0); return c; }
// ---------- UI ----------
function stopCam(){ if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream = null; } }
function close(){ stopCam(); H.closeOverlay(); }
function shell(inner){ var ov = document.getElementById("overlay"); ov.className = "dsov"; ov.innerHTML = '<div class="dsHead"><button class="chip" id="dsX">‹</button><b>📷 ' + L("Imbas dokumen", "Scan a document") + '</b><span class="mut small">' + (PAGES.length ? PAGES.length + " " + L("halaman", "pages") : "") + '</span></div><div class="dsBody" id="dsB">' + inner + '</div>'; ov._close = close; ov.querySelector("#dsX").onclick = function(){ if(PAGES.length && !confirm(L("Buang halaman yang diimbas?", "Discard the scanned pages?"))) return; PAGES = []; close(); }; return ov.querySelector("#dsB"); }
function capture(){ var b = shell('<div class="dsCam"><video id="dsV" autoplay muted playsinline></video><div class="dsGuide"></div></div><div class="dsBar"><button class="chip" id="dsG">🖼 ' + L("Galeri", "Gallery") + '</button><input type="file" accept="image/*" id="dsF" hidden><button class="dsShut" id="dsS" aria-label="' + L("Ambil gambar", "Take photo") + '"></button>' + (PAGES.length ? '<button class="chip gold" id="dsDone">✓ ' + PAGES.length + '</button>' : '<span style="width:60px"></span>') + '</div><div class="mut tiny dsTip">' + L("Letak kertas di atas permukaan gelap, cahaya rata, tiada bayang.", "Put the page on a dark surface, in even light, with no shadow.") + '</div>');
  var V = b.querySelector("#dsV"), take = function(img){ stopCam(); var k = Math.min(1, 2000 / Math.max(img.width, img.height)), c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); crop(c); };
  b.querySelector("#dsG").onclick = function(){ if(window.ibPickImage && window.Native){ window.ibPickImage("gallery", 2000, function(u){ var im = new Image(); im.onload = function(){ take(im); }; im.src = u; }); } else b.querySelector("#dsF").click(); };
  b.querySelector("#dsF").onchange = function(){ var f = this.files[0]; if(!f) return; var r = new FileReader(); r.onload = function(){ var im = new Image(); im.onload = function(){ take(im); }; im.src = r.result; }; r.readAsDataURL(f); };
  var dn = b.querySelector("#dsDone"); if(dn) dn.onclick = function(){ stopCam(); review(); };
  b.querySelector("#dsS").onclick = function(){ if(!V.videoWidth){ H.toast(L("Kamera belum sedia", "The camera is not ready")); return; } var c = document.createElement("canvas"); c.width = V.videoWidth; c.height = V.videoHeight; c.getContext("2d").drawImage(V, 0, 0); try{ H.N.vibrate(30); }catch(e){} take(c); };
  var start = function(){ if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return; navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: "environment"}, width: {ideal: 1920}, height: {ideal: 1440}}, audio: false}).then(function(s){ stream = s; V.srcObject = s; var p = V.play(); if(p && p.catch) p.catch(function(){}); }, function(){ b.querySelector(".dsCam").innerHTML = '<div class="mut small" style="padding:30px;text-align:center">' + L("Kamera tidak dapat dibuka. Pilih gambar dari galeri.", "The camera could not open. Pick a photo from the gallery.") + '</div>'; }); };
  var N = H.N; if(window.Native && N && N.hasPerm && !N.hasPerm("camera")){ var hp = function(p){ if(p.which !== "camera") return; H.off("perm", hp); if(p.granted) start(); }; H.on("perm", hp); N.requestPerm("camera"); } else start(); }
function crop(src){ var b = shell('<div class="dsCrop" id="dsC"><canvas id="dsI"></canvas><svg id="dsQ"></svg>' + [0, 1, 2, 3].map(function(i){ return '<i class="dsH" data-h="' + i + '"></i>'; }).join("") + '</div><div class="dsBar"><button class="chip" id="dsRe">↺ ' + L("Ambil semula", "Retake") + '</button><button class="chip" id="dsAll">⬜ ' + L("Seluruh gambar", "Whole photo") + '</button><button class="btn gold" id="dsOk">' + L("Luruskan", "Straighten") + ' ›</button></div><div class="mut tiny dsTip">' + L("Seret bulatan ke empat penjuru kertas.", "Drag the circles to the four corners of the page.") + '</div>');
  var box = b.querySelector("#dsC"), I = b.querySelector("#dsI"), maxW = Math.min(box.clientWidth || 360, 720), k = Math.min(maxW / src.width, ((window.innerHeight || 700) * 0.6) / src.height); I.width = Math.round(src.width * k); I.height = Math.round(src.height * k); I.getContext("2d").drawImage(src, 0, 0, I.width, I.height); box.style.width = I.width + "px"; box.style.height = I.height + "px";
  // detect on a small copy
  var sm = document.createElement("canvas"), sk = 320 / Math.max(src.width, src.height); sm.width = Math.round(src.width * sk); sm.height = Math.round(src.height * sk); var sx = sm.getContext("2d"); sx.drawImage(src, 0, 0, sm.width, sm.height);
  var g = gray(sx.getImageData(0, 0, sm.width, sm.height).data, sm.width * sm.height), Q = corners(g, sm.width, sm.height).map(function(p){ return [p[0] / sk, p[1] / sk]; });
  var paint = function(){ b.querySelectorAll(".dsH").forEach(function(h, i){ h.style.left = (Q[i][0] * k) + "px"; h.style.top = (Q[i][1] * k) + "px"; }); b.querySelector("#dsQ").innerHTML = '<polygon points="' + Q.map(function(p){ return (p[0] * k) + "," + (p[1] * k); }).join(" ") + '"/>'; };
  b.querySelectorAll(".dsH").forEach(function(h){ h.addEventListener("pointerdown", function(e){ e.preventDefault(); h.setPointerCapture(e.pointerId); var i = +h.getAttribute("data-h"), r = box.getBoundingClientRect();
    var mv = function(ev){ Q[i] = [Math.max(0, Math.min(src.width, (ev.clientX - r.left) / k)), Math.max(0, Math.min(src.height, (ev.clientY - r.top) / k))]; paint(); };
    var up = function(){ h.removeEventListener("pointermove", mv); h.removeEventListener("pointerup", up); }; h.addEventListener("pointermove", mv); h.addEventListener("pointerup", up); }); });
  b.querySelector("#dsRe").onclick = capture; b.querySelector("#dsAll").onclick = function(){ Q = [[0, 0], [src.width, 0], [src.width, src.height], [0, src.height]]; paint(); };
  b.querySelector("#dsOk").onclick = function(){ var sz = outSize(Q), out = warp(src, Q, sz[0], sz[1]); PAGES.push({raw: out, mode: "bw"}); review(); };
  paint(); DocScan._last = {Q: Q, w: src.width, h: src.height}; }
function review(){ var MODES = [["orig", L("Asal", "Original")], ["gray", L("Kelabu", "Grey")], ["bw", L("Hitam putih", "B&W")], ["boost", L("Terang", "Boost")]], cur = PAGES.length - 1;
  var draw = function(){ var p = PAGES[cur], b = shell('<div class="dsPrev"><canvas id="dsP"></canvas></div><div class="chips dsModes">' + MODES.map(function(m){ return '<button class="chip' + (p.mode === m[0] ? " on" : "") + '" data-dm="' + m[0] + '">' + m[1] + '</button>'; }).join("") + '<button class="chip" id="dsRot">⟳</button><button class="chip" id="dsDel">🗑</button></div>' +
      '<div class="dsThumbs">' + PAGES.map(function(q, i){ return '<button class="' + (i === cur ? "on" : "") + '" data-pg="' + i + '"><span>' + (i + 1) + '</span></button>'; }).join("") + '<button id="dsAdd">＋</button></div>' +
      '<div class="dsBar"><button class="btn alt" id="dsBk">📚 ' + L("Simpan ke Buku", "Save to Books") + '</button><button class="btn gold" id="dsSh">📤 ' + L("Kongsi PDF", "Share PDF") + '</button></div>');
    var out = p.cv || (p.cv = filter(p.raw, p.mode)), P = b.querySelector("#dsP"), k = Math.min(((b.clientWidth || 360) - 24) / out.width, ((window.innerHeight || 700) * 0.52) / out.height); P.width = Math.round(out.width * k); P.height = Math.round(out.height * k); P.getContext("2d").drawImage(out, 0, 0, P.width, P.height);
    b.querySelectorAll("[data-dm]").forEach(function(x){ x.onclick = function(){ p.mode = x.getAttribute("data-dm"); p.cv = null; draw(); }; });
    b.querySelector("#dsRot").onclick = function(){ p.raw = rotate(p.raw); p.cv = null; draw(); };
    b.querySelector("#dsDel").onclick = function(){ PAGES.splice(cur, 1); if(!PAGES.length){ capture(); return; } cur = Math.max(0, cur - 1); draw(); };
    b.querySelectorAll("[data-pg]").forEach(function(x){ x.onclick = function(){ cur = +x.getAttribute("data-pg"); draw(); }; });
    b.querySelector("#dsAdd").onclick = capture;
    var pdf = function(){ var cvs = PAGES.map(function(q){ return q.cv || (q.cv = filter(q.raw, q.mode)); }); return H.canvasPdf(cvs, 210, 297, 0.82); }, name = "Scan-" + new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-") + ".pdf";
    b.querySelector("#dsSh").onclick = function(){ H.sharePdf(name, pdf(), L("Dokumen diimbas dengan My Ihsan", "Scanned with My Ihsan")); };
    b.querySelector("#dsBk").onclick = function(){ var b64 = pdf(), bin = atob(b64), u8 = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); if(H.toBooks) H.toBooks(u8, name); PAGES = []; close(); }; };
  draw(); }
window.DocScan = {open: function(h){ H = h; PAGES = []; if(!document.querySelector('link[href="dokumen/scan.css"]')){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "dokumen/scan.css"; document.head.appendChild(l); } capture(); },
  _t: {corners: corners, homo: homo, otsu: otsu, outSize: outSize, warp: warp, filter: filter, gray: gray}, pages: function(){ return PAGES; }};
})();
