/* My Ihsan 0.6.63 · Tekap › image layers: attach (camera / gallery), 4-corner crop (straightens a photo taken at an angle),
   automatic background removal (flood from the edges by colour), brush erase / restore, brightness / contrast / threshold,
   sketch filters (line art, pencil, outline, posterize), size, rotate, flip, opacity.
   The original picture is kept (imgs/<orig>), the result is rebuilt from it with the settings in layer.fx and saved as imgs/<src>. */
(function(){
"use strict";
var A = null;
function L(a, b){ return A.L(a, b); }
function loadImg(du){ return new Promise(function(ok){ var i = new Image(); i.onload = function(){ ok(i); }; i.onerror = function(){ ok(null); }; i.src = du; }); }
function add(api, p){ A = api; var H = A.H;
  var ov = H.showSheet("🖼 " + L("Tambah gambar", "Add a picture"), '<div class="btns"><button class="btn gold" id="tiCam">📷 ' + L("Kamera", "Camera") + '</button><button class="btn alt" id="tiGal">🖼 ' + L("Galeri", "Gallery") + '</button></div><div class="mut tiny">' + L("Lukisan, logo atau khat. Latar belakang boleh dibuang dan dijadikan garis untuk ditekap.", "A drawing, a logo or calligraphy. The background can be removed and the picture turned into lines to trace.") + '</div>');
  var pick = function(mode){ var h = function(r){ H.off("image", h); if(!r || !r.data) return; H.closeOverlay(); attach(p, r.data); }; H.on("image", h); H.N.pickImage(mode); };
  ov.querySelector("#tiCam").onclick = function(){ pick("camera"); }; ov.querySelector("#tiGal").onclick = function(){ pick("gallery"); }; }
function attach(p, du){ loadImg(du).then(function(im){ if(!im) return; var sz = A.pageSize(p), w = sz[0] * 0.7, h = w * im.height / im.width; if(h > sz[1] * 0.7){ h = sz[1] * 0.7; w = h * im.width / im.height; }
  var l = {id:A.uid(), t:"img", orig:A.uid(), src:"", x:(sz[0] - w) / 2, y:(sz[1] - h) / 2, w:w, h:h, rot:0, fh:false, fv:false, op:1, vis:true, lock:false, fx:{q:null, br:0, ct:0, thr:0, f:"", bg:0, inv:false}};
  l.src = l.orig + "r"; A.iput("imgs", l.orig, du).then(function(){ return A.iput("imgs", l.src, du); }).then(function(){ p.layers.push(l); A.ST.sel = l.id; A.projPut(p); delete A.IMGC[l.src]; sheet(A, p, l); }); }); }

// ---------- pixel work ----------
function homog(s, d){ return A.homography(s, d); }
function warp(im, q, maxS){ var W0 = im.naturalWidth || im.width, H0 = im.naturalHeight || im.height, sc = document.createElement("canvas"); sc.width = W0; sc.height = H0; var sx = sc.getContext("2d"); sx.drawImage(im, 0, 0);
  var src = q.map(function(pt){ return [pt[0] * W0, pt[1] * H0]; }), wTop = Math.hypot(src[1][0] - src[0][0], src[1][1] - src[0][1]), wBot = Math.hypot(src[2][0] - src[3][0], src[2][1] - src[3][1]), hL = Math.hypot(src[3][0] - src[0][0], src[3][1] - src[0][1]), hR = Math.hypot(src[2][0] - src[1][0], src[2][1] - src[1][1]);
  var w = Math.max(wTop, wBot), h = Math.max(hL, hR), k = Math.min(1, maxS / Math.max(w, h)); w = Math.max(2, Math.round(w * k)); h = Math.max(2, Math.round(h * k));
  var hm = homog([[0, 0], [w, 0], [w, h], [0, h]], src), out = document.createElement("canvas"); out.width = w; out.height = h; if(!hm) return sc;
  var sd = sx.getImageData(0, 0, W0, H0).data, oc = out.getContext("2d"), od = oc.createImageData(w, h), o = od.data;
  for(var y = 0; y < h; y++) for(var x = 0; x < w; x++){ var zz = hm[6] * x + hm[7] * y + 1, u = (hm[0] * x + hm[1] * y + hm[2]) / zz, v = (hm[3] * x + hm[4] * y + hm[5]) / zz, ui = u | 0, vi = v | 0, j = (y * w + x) * 4;
    if(ui < 0 || vi < 0 || ui >= W0 || vi >= H0) continue; var i = (vi * W0 + ui) * 4; o[j] = sd[i]; o[j + 1] = sd[i + 1]; o[j + 2] = sd[i + 2]; o[j + 3] = sd[i + 3]; }
  oc.putImageData(od, 0, 0); return out; }
function scaled(im, maxS){ var W0 = im.naturalWidth || im.width, H0 = im.naturalHeight || im.height, k = Math.min(1, maxS / Math.max(W0, H0)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(W0 * k)); c.height = Math.max(1, Math.round(H0 * k)); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); return c; }
// background: flood fill from the border through pixels close to the border colour
function bgMask(d, w, h, tol){ var m = new Uint8Array(w * h), st = [], n = 0, r = 0, g = 0, b = 0;
  for(var x = 0; x < w; x++){ [x, (h - 1) * w + x].forEach(function(i){ r += d[i * 4]; g += d[i * 4 + 1]; b += d[i * 4 + 2]; n++; }); }
  for(var y = 0; y < h; y++){ [y * w, y * w + w - 1].forEach(function(i){ r += d[i * 4]; g += d[i * 4 + 1]; b += d[i * 4 + 2]; n++; }); }
  r /= n; g /= n; b /= n; var t2 = tol * tol * 3, near = function(i){ var dr = d[i * 4] - r, dg = d[i * 4 + 1] - g, db = d[i * 4 + 2] - b; return dr * dr + dg * dg + db * db <= t2; };
  for(var x2 = 0; x2 < w; x2++){ st.push(x2, (h - 1) * w + x2); } for(var y2 = 0; y2 < h; y2++){ st.push(y2 * w, y2 * w + w - 1); }
  while(st.length){ var i = st.pop(); if(m[i] || !near(i)) continue; m[i] = 1; var xx = i % w, yy = (i / w) | 0; if(xx > 0) st.push(i - 1); if(xx < w - 1) st.push(i + 1); if(yy > 0) st.push(i - w); if(yy < h - 1) st.push(i + w); }
  return m; }
function process(c, fx, brush){ var w = c.width, h = c.height, x = c.getContext("2d"), id = x.getImageData(0, 0, w, h), d = id.data, i;
  var br = (fx.br || 0) * 2.55, ct = fx.ct || 0, cf = (259 * (ct + 255)) / (255 * (259 - ct));
  if(br || ct) for(i = 0; i < d.length; i += 4) for(var k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, cf * (d[i + k] - 128) + 128 + br));
  var bg = fx.bg ? bgMask(d, w, h, fx.bg) : null, gray = new Float32Array(w * h); for(i = 0; i < w * h; i++) gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  var f = fx.f || "";
  if(f === "line" || f === "pencil"){ var e = new Float32Array(w * h), mx = 1; for(var y = 1; y < h - 1; y++) for(var xx = 1; xx < w - 1; xx++){ var p = y * w + xx, gx = -gray[p - w - 1] - 2 * gray[p - 1] - gray[p + w - 1] + gray[p - w + 1] + 2 * gray[p + 1] + gray[p + w + 1], gy = -gray[p - w - 1] - 2 * gray[p - w] - gray[p - w + 1] + gray[p + w - 1] + 2 * gray[p + w] + gray[p + w + 1]; e[p] = Math.hypot(gx, gy); if(e[p] > mx) mx = e[p]; }
    for(i = 0; i < w * h; i++){ var v = e[i] / mx, val; if(f === "line") val = v > (fx.thr ? fx.thr / 100 : 0.18) ? 0 : 255; else val = Math.max(0, 255 - v * 255 * 2.2) * 0.6 + gray[i] * 0.4; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = val; d[i * 4 + 3] = f === "line" ? (val ? 0 : 255) : 255; } }
  else if(f === "outline" || (fx.thr && !f)){ var t = fx.thr || 50; for(i = 0; i < w * h; i++){ var on = gray[i] < t * 2.55; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = on ? 0 : 255; d[i * 4 + 3] = on ? 255 : 0; } }
  else if(f === "poster"){ for(i = 0; i < d.length; i += 4) for(var k2 = 0; k2 < 3; k2++) d[i + k2] = Math.round(d[i + k2] / 64) * 64; }
  else if(f === "gray"){ for(i = 0; i < w * h; i++){ d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = gray[i]; } }
  if(fx.inv) for(i = 0; i < d.length; i += 4){ d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2]; }
  if(bg) for(i = 0; i < w * h; i++) if(bg[i]) d[i * 4 + 3] = 0;
  if(brush){ var bd = brush.getContext("2d").getImageData(0, 0, w, h).data; for(i = 0; i < w * h; i++){ if(bd[i * 4 + 3] > 10){ if(bd[i * 4] > 128) d[i * 4 + 3] = 0; else if(bd[i * 4 + 1] > 128) d[i * 4 + 3] = 255; } } }
  x.putImageData(id, 0, 0); return c; }
function build(im, fx, brush, magic){ var c = fx.q ? warp(im, fx.q, 1400) : scaled(im, 1400); process(c, fx, brush);
  if(magic && magic.width === c.width && magic.height === c.height){ var x = c.getContext("2d"), id = x.getImageData(0, 0, c.width, c.height), md = magic.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    for(var i = 3; i < md.length; i += 4) if(md[i] < 128) id.data[i] = 0; x.putImageData(id, 0, 0); }
  return c; }
// ---------- 🪄 magic tap: MediaPipe InteractiveSegmenter (magic_touch), the same tasks-vision pack Letters downloads (files/huruf/mp/) ----------
var MAGIC = {k:"magic", f:"magic_touch.tflite", u:"https://storage.googleapis.com/mediapipe-models/interactive_segmenter/magic_touch/float32/1/magic_touch.tflite", h:"e24338a717c1b7ad8d159666677ef400babb7f33b8ad60c4d96db4ecf694cd25", n:6227884}, SEG = null;
function simdOk(){ try{ return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11])); }catch(e){ return false; } }
function mpFiles(){ var HD = window.HurufData; if(!HD) return []; var sm = simdOk() ? 1 : 0; return HD.mp.files.filter(function(f){ return /lib|js|wasm/.test(f.k) && (f.simd == null || f.simd === sm); }).concat([MAGIC]); }
function mpBase(){ try{ var p = A.H.N.photoDir(); if(p) return p.replace(/photos\/?$/, "") + "huruf/mp/"; }catch(e){} return null; }
function havePack(){ try{ var fs = mpFiles(); return fs.length > 1 && A.H.N.qCount(JSON.stringify(fs.map(function(f){ return "huruf/mp/" + f.f; }))) === fs.length; }catch(e){ return false; } }
function xhrB(u){ return new Promise(function(ok, no){ var x = new XMLHttpRequest(); x.open("GET", u, true); x.responseType = "arraybuffer"; x.onload = function(){ if((x.status === 200 || x.status === 0) && x.response && x.response.byteLength) ok(x.response); else no(new Error("read")); }; x.onerror = function(){ no(new Error("read")); }; x.send(); }); }
function hex(b){ return Array.prototype.map.call(new Uint8Array(b), function(v){ return ("0" + v.toString(16)).slice(-2); }).join(""); }
function checked(f){ return xhrB(mpBase() + f.f).then(function(b){ if(b.byteLength !== f.n) throw new Error("size"); if(!(window.crypto && crypto.subtle)) return b; return crypto.subtle.digest("SHA-256", b).then(function(h){ if(hex(h) !== f.h) throw new Error("hash"); return b; }); })
  .catch(function(e){ try{ A.H.N.qDelete("huruf/mp/" + f.f); }catch(x){} throw e; }); }
function segmenter(){ if(window.__TEKAP_SEG) return Promise.resolve(window.__TEKAP_SEG); if(SEG) return SEG;
  var F = mpFiles(), get = function(k){ return F.filter(function(f){ return f.k === k; })[0]; };
  SEG = (window.MPVision ? Promise.resolve() : checked(get("lib")).then(function(b){ var src = "(function(){var module={exports:{}},exports=module.exports;\n" + new TextDecoder().decode(b) + "\n;window.MPVision=module.exports;})();";
      return new Promise(function(ok, no){ var sc = document.createElement("script"); sc.src = URL.createObjectURL(new Blob([src], {type:"text/javascript"})); sc.onload = function(){ window.MPVision ? ok() : no(new Error("lib")); }; sc.onerror = function(){ no(new Error("lib")); }; document.head.appendChild(sc); }); }))
    .then(function(){ return Promise.all([checked(get("js")), checked(get("wasm")), checked(MAGIC)]); })
    .then(function(r){ var fs = {wasmLoaderPath:URL.createObjectURL(new Blob([r[0]], {type:"text/javascript"})), wasmBinaryPath:URL.createObjectURL(new Blob([r[1]], {type:"application/wasm"}))};
      return MPVision.InteractiveSegmenter.createFromOptions(fs, {baseOptions:{modelAssetBuffer:new Uint8Array(r[2]), delegate:"CPU"}, outputCategoryMask:true, outputConfidenceMasks:false}); })
    .then(function(sg){ return function(canvas, nx, ny){ return new Promise(function(ok){ sg.segment(canvas, {keypoint:{x:nx, y:ny}}, function(res){ var m = res.categoryMask, w = m.width, h = m.height, a = m.getAsUint8Array(), v = a[Math.min(h - 1, Math.round(ny * (h - 1))) * w + Math.min(w - 1, Math.round(nx * (w - 1)))], out = new Uint8Array(w * h);
        for(var i = 0; i < a.length; i++) out[i] = a[i] === v ? 1 : 0; ok({w:w, h:h, m:out}); }); }); }; })
    .catch(function(e){ SEG = null; throw e; });
  return SEG; }
function magicReady(){ if(window.__TEKAP_SEG || havePack()) return Promise.resolve(true); var H = A.H; if(!(window.Native && H.N.qDownload && H.N.photoDir)){ H.toast(L("Sentuhan ajaib perlukan aplikasi Android", "Magic tap needs the Android app")); return Promise.resolve(false); }
  var mb = Math.round(mpFiles().reduce(function(s, f){ return s + f.n; }, 0) / 1048576);
  return new Promise(function(done){ var ov = document.createElement("div"); ov.className = "tkDl card"; ov.innerHTML = '<b>🪄 ' + L("Sentuhan ajaib", "Magic tap") + '</b><div class="small">' + L("Muat turun sekali sahaja, kira-kira " + mb + " MB (dikongsi dengan Gerak Huruf). Guna Wi-Fi jika boleh.", "A one-time download of about " + mb + " MB (shared with Letter Moves). Use Wi-Fi if you can.") + '</div><div class="hfBar"><i></i></div><div class="btns"><button class="btn gold">⬇️ ' + L("Muat turun", "Download") + '</button><button class="btn alt">' + L("Nanti", "Later") + '</button></div>';
    var host = document.querySelector("#overlay .shb") || document.body; host.insertBefore(ov, host.firstChild); var bs = ov.querySelectorAll("button"), bar = ov.querySelector(".hfBar i");
    bs[1].onclick = function(){ ov.remove(); done(false); };
    bs[0].onclick = function(){ bs[0].disabled = true; var id = "tkmg" + Date.now(), fs = mpFiles(), h = function(r){ if(r.id !== id) return; bar.style.width = Math.round(100 * r.done / Math.max(1, r.total)) + "%";
        if(r.end){ H.off("qdl", h); var ok = !r.fail && r.done === r.total; ov.remove(); if(!ok) H.toast("⚠️ " + L("Muat turun tidak lengkap", "The download did not finish")); done(ok); } };
      H.on("qdl", h); H.N.qDownload(id, JSON.stringify(fs.map(function(f){ return {u:f.u, f:"huruf/mp/" + f.f}; }))); }; }); }

// ---------- the editor sheet ----------
function sheet(api, p, l){ A = api; var H = A.H, fx = l.fx = l.fx || {}, brush = null, mode = "", im = null, magic = null;
  var F = [["", L("Asal", "Original")], ["gray", L("Kelabu", "Grey")], ["line", L("Garis", "Line art")], ["pencil", L("Pensel", "Pencil")], ["outline", L("Hitam-putih", "Black & white")], ["poster", L("Poster", "Posterize")]];
  var ov = H.showSheet("🖼 " + L("Gambar", "Picture"), '<div class="tiWrap"><canvas id="tiC"></canvas><div id="tiQ"></div></div>' +
    '<div class="rseg" id="tiF">' + F.map(function(x){ return '<button class="chip' + ((fx.f || "") === x[0] ? ' on' : '') + '" data-f="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>' +
    '<div class="btns" style="flex-wrap:wrap"><button class="chip" id="tiCrop">⬚ ' + L("Potong 4 sudut", "4-corner crop") + '</button><button class="chip" id="tiBg">✂ ' + L("Buang latar", "Remove background") + '</button><button class="chip" id="tiEr">🧽 ' + L("Padam", "Erase") + '</button><button class="chip" id="tiRs">🖌 ' + L("Pulih", "Restore") + '</button><button class="chip" id="tiInv">◑ ' + L("Songsang", "Invert") + '</button><button class="chip" id="tiMg">🪄 ' + L("Sentuhan ajaib", "Magic tap") + '</button></div>' +
    '<div class="tkG2"><label class="hfld">' + L("Kecerahan", "Brightness") + '<input type="range" id="tiBr" min="-60" max="60" value="' + (fx.br || 0) + '"></label><label class="hfld">' + L("Kontras", "Contrast") + '<input type="range" id="tiCt" min="-80" max="120" value="' + (fx.ct || 0) + '"></label>' +
      '<label class="hfld">' + L("Ambang garis", "Line threshold") + '<input type="range" id="tiThr" min="0" max="90" value="' + (fx.thr || 0) + '"></label><label class="hfld">' + L("Kepekaan latar", "Background tolerance") + '<input type="range" id="tiTol" min="0" max="90" value="' + (fx.bg || 0) + '"></label>' +
      '<label class="hfld">' + L("Lebar (mm)", "Width (mm)") + '<input class="rin" type="number" id="tiW" min="5" value="' + Math.round(l.w) + '"></label><label class="hfld">' + L("Putar (°)", "Rotate (°)") + '<input class="rin" type="number" id="tiR" step="5" value="' + (l.rot || 0) + '"></label>' +
      '<label class="hfld">' + L("Kelegapan", "Opacity") + '<input type="range" id="tiO" min="0.1" max="1" step="0.05" value="' + (l.op == null ? 1 : l.op) + '"></label></div>' +
    '<div class="btns"><button class="chip" id="tiFh">⇋ ' + L("Balik", "Flip") + '</button><button class="chip" id="tiFv">⇵</button><button class="chip" id="tiReset">↺ ' + L("Asal semula", "Reset") + '</button></div>' +
    '<button class="btn gold full" id="tiOk">✓ ' + L("Siap", "Done") + '</button>');
  var q = function(s){ return ov.querySelector(s); }, cv = q("#tiC"), busy = 0;
  var redraw = function(){ if(!im) return; var my = ++busy; setTimeout(function(){ if(my !== busy) return; var out = build(im, fx, brush, magic); cv.width = out.width; cv.height = out.height; var cx = cv.getContext("2d"); cx.clearRect(0, 0, cv.width, cv.height); cx.drawImage(out, 0, 0); cv._out = out; if(mode === "crop") handles(); }, 30); };
  A.iget("imgs", l.orig).then(function(du){ return loadImg(du); }).then(function(x){ im = x; if(!im) return; var w0 = fx.q ? null : scaled(im, 1400); if(w0){ brush = document.createElement("canvas"); brush.width = w0.width; brush.height = w0.height; } if(fx.magic) A.iget("imgs", l.id + "g").then(function(mg){ if(mg) loadImg(mg).then(function(gi){ if(!gi) return; var w1 = fx.q ? null : scaled(im, 1400), c = document.createElement("canvas"); c.width = w1 ? w1.width : gi.width; c.height = w1 ? w1.height : gi.height; c.getContext("2d").drawImage(gi, 0, 0, c.width, c.height); magic = c; redraw(); }); });
    A.iget("imgs", l.id + "m").then(function(mk){ if(mk && brush) loadImg(mk).then(function(bi){ if(bi) brush.getContext("2d").drawImage(bi, 0, 0, brush.width, brush.height); redraw(); }); else redraw(); }); });
  var ensureBrush = function(){ if(!brush || !cv._out || brush.width !== cv._out.width || brush.height !== cv._out.height){ brush = document.createElement("canvas"); brush.width = cv._out ? cv._out.width : 2; brush.height = cv._out ? cv._out.height : 2; } };
  ov.querySelectorAll("#tiF [data-f]").forEach(function(b){ b.onclick = function(){ fx.f = b.getAttribute("data-f"); ov.querySelectorAll("#tiF [data-f]").forEach(function(z){ z.classList.toggle("on", z === b); }); redraw(); }; });
  q("#tiBr").oninput = function(){ fx.br = +this.value; redraw(); }; q("#tiCt").oninput = function(){ fx.ct = +this.value; redraw(); };
  q("#tiThr").oninput = function(){ fx.thr = +this.value; redraw(); }; q("#tiTol").oninput = function(){ fx.bg = +this.value; redraw(); };
  q("#tiBg").onclick = function(){ fx.bg = fx.bg ? 0 : 28; q("#tiTol").value = fx.bg; this.classList.toggle("on", !!fx.bg); redraw(); };
  q("#tiInv").onclick = function(){ fx.inv = !fx.inv; this.classList.toggle("on", fx.inv); redraw(); };
  q("#tiFh").onclick = function(){ l.fh = !l.fh; this.classList.toggle("on", l.fh); }; q("#tiFv").onclick = function(){ l.fv = !l.fv; this.classList.toggle("on", l.fv); };
  q("#tiReset").onclick = function(){ l.fx = fx = {q:null, br:0, ct:0, thr:0, f:"", bg:0, inv:false}; brush = null; magic = null; A.idel("imgs", l.id + "m"); A.idel("imgs", l.id + "g"); H.closeOverlay(); sheet(A, p, l); };
  // 4-corner crop: drag the four dots onto the corners of the drawing / paper in the photo
  var handles = function(){ var box = q("#tiQ"); box.innerHTML = ""; if(mode !== "crop" || !im) return; var r = cv.getBoundingClientRect(), br0 = box.getBoundingClientRect(), qq = fx._qe;
    qq.forEach(function(pt, i){ var d = document.createElement("div"); d.className = "tkWh"; d.style.position = "absolute"; d.style.left = (r.left - br0.left + pt[0] * r.width) + "px"; d.style.top = (r.top - br0.top + pt[1] * r.height) + "px"; box.appendChild(d);
      d.onpointerdown = function(e){ e.preventDefault(); d.setPointerCapture(e.pointerId); d.onpointermove = function(ev){ var rr = cv.getBoundingClientRect(); qq[i] = [Math.max(0, Math.min(1, (ev.clientX - rr.left) / rr.width)), Math.max(0, Math.min(1, (ev.clientY - rr.top) / rr.height))]; d.style.left = (rr.left - br0.left + qq[i][0] * rr.width) + "px"; d.style.top = (rr.top - br0.top + qq[i][1] * rr.height) + "px"; }; d.onpointerup = function(){ d.onpointermove = null; }; }; }); };
  q("#tiCrop").onclick = function(){ if(mode !== "crop"){ mode = "crop"; this.classList.add("on"); this.textContent = "✓ " + L("Guna potongan", "Apply crop"); var keep = fx.q; fx.q = null; fx._qe = keep ? keep.map(function(x){ return x.slice(); }) : [[0.05, 0.05], [0.95, 0.05], [0.95, 0.95], [0.05, 0.95]]; brush = null; redraw(); }
    else { mode = ""; fx.q = fx._qe; delete fx._qe; magic = null; fx.magic = false; this.classList.remove("on"); this.textContent = "⬚ " + L("Potong 4 sudut", "4-corner crop"); q("#tiQ").innerHTML = ""; brush = null; redraw(); } };
  // brush: red = erase, green = restore, painted on a mask the size of the result
  var setMode = function(m, b){ mode = mode === m ? "" : m; q("#tiEr").classList.toggle("on", mode === "er"); q("#tiRs").classList.toggle("on", mode === "rs"); if(mode) ensureBrush(); };
  q("#tiMg").onclick = function(){ var b = this; if(mode === "magic"){ mode = ""; b.classList.remove("on"); return; } magicReady().then(function(ok){ if(!ok) return; mode = "magic"; b.classList.add("on"); q("#tiEr").classList.remove("on"); q("#tiRs").classList.remove("on"); H.toast("🪄 " + L("Ketik benda yang mahu disimpan", "Tap the thing you want to keep")); }); };
  q("#tiEr").onclick = function(){ setMode("er"); }; q("#tiRs").onclick = function(){ setMode("rs"); };
  var painting = false, paint = function(e){ if(!brush) return; var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * brush.width, y = (e.clientY - r.top) / r.height * brush.height, bx = brush.getContext("2d"); bx.fillStyle = mode === "er" ? "rgb(255,0,0)" : "rgb(0,255,0)"; bx.beginPath(); bx.arc(x, y, Math.max(4, brush.width / 40), 0, Math.PI * 2); bx.fill(); };
  cv.addEventListener("pointerdown", function(e){ if(mode !== "magic" || !im) return; var r = cv.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height, base = fx.q ? warp(im, fx.q, 1400) : scaled(im, 1400);
    H.toast("🪄 …"); segmenter().then(function(seg){ return seg(base, nx, ny); }).then(function(res){ var c = magic && magic.width === base.width ? magic : document.createElement("canvas"); if(c !== magic){ c.width = base.width; c.height = base.height; }
      var mc = document.createElement("canvas"); mc.width = res.w; mc.height = res.h; var mx = mc.getContext("2d"), id = mx.createImageData(res.w, res.h); for(var i = 0; i < res.m.length; i++) if(res.m[i]){ id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = 255; id.data[i * 4 + 3] = 255; } mx.putImageData(id, 0, 0);
      c.getContext("2d").drawImage(mc, 0, 0, c.width, c.height); magic = c; fx.magic = true; redraw(); }).catch(function(){ H.toast("⚠️ " + L("Sentuhan ajaib gagal", "Magic tap failed")); }); });
  cv.onpointerdown = function(e){ if(mode !== "er" && mode !== "rs") return; painting = true; cv.setPointerCapture(e.pointerId); paint(e); redraw(); };
  cv.onpointermove = function(e){ if(painting){ paint(e); redraw(); } }; cv.onpointerup = function(){ painting = false; };
  q("#tiOk").onclick = function(){ if(mode === "crop") q("#tiCrop").click(); l.w = Math.max(5, +q("#tiW").value || l.w); l.rot = +q("#tiR").value || 0; l.op = +q("#tiO").value;
    var fin = function(){ var out = im ? build(im, fx, brush, magic) : null; if(magic) A.iput("imgs", l.id + "g", magic.toDataURL("image/png")); else if(fx.magic){ fx.magic = false; } if(!out){ H.closeOverlay(); return; } l.h = l.w * out.height / out.width; var du = out.toDataURL("image/png");
      var sv = brush ? A.iput("imgs", l.id + "m", brush.toDataURL("image/png")) : Promise.resolve(); sv.then(function(){ return A.iput("imgs", l.src, du); }).then(function(){ delete A.IMGC[l.src]; A.projPut(p); H.closeOverlay(); A.go("edit", {id:p.id, sel:l.id}); }); };
    setTimeout(fin, 40); };
  ov._close = function(){ H.closeOverlay(); A.go("edit", {id:p.id, sel:l.id}); }; ov.querySelector("#shX").onclick = ov._close; }
window.TekapImg = {add:add, sheet:sheet, _t:{MAGIC:MAGIC, mpFiles:mpFiles, bgMask:bgMask, process:process, warp:warp, attach:function(api, p, du){ A = api; attach(p, du); }}};
})();
