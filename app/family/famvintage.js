/* My Ihsan 0.5.8-0.5.10: Salasilah "Vintage": the real family chart (oldest generation on top, couples joined with a heart,
   one stem down to each family's children) drawn as ink branches with calligraphy names on parchment, in front of a faded
   hand-drawn tree whose canopy holds all the names. Landscape, short trunk, me always in the middle across, dark ink for the
   living and half tone for the late. Needs FamChart (family/famchalk.js) for the layout.
   Shown flat with three.js (orthographic camera: drag, pinch, tap a name) like the chalkboard.
   FamVintage.mount(box, people, meId, opt{sel, title, sub, img, onSel}); FamVintage.poster(people, meId, opt) -> canvas (A-size ratio). */
(function(){
"use strict";
var FN = '"PinyonL", "Snell Roundhand", "Apple Chancery", cursive', FS = '"FellL", "IM Fell English", Georgia, serif', FI = '"FellLi", "IM Fell English", Georgia, serif';
var INK = "#3b2a1a", SEPIA = "#6b4a2b", BARK = "#5a3d24", PAPER = "#f1e4c4";
function rnd(s){ var x = Math.sin(s*12.9898+78.233)*43758.5453; return x - Math.floor(x); }
function hash(str){ var h = 0; str = String(str); for(var i=0;i<str.length;i++) h = (h*31 + str.charCodeAt(i))|0; return Math.abs(h)%10000; }
var fontsP = null;
function fonts(){ if(fontsP) return fontsP; if(!document.fonts || !document.fonts.load) return (fontsP = Promise.resolve());
  fontsP = Promise.all(['48px "PinyonL"','24px "FellL"','24px "FellLi"'].map(function(f){ return document.fonts.load(f).catch(function(){}); })).then(function(){}); return fontsP; }

// ---------------- layout: the real family chart (FamChart, oldest on top), fitted into the canopy ----------------
function build(people, meId, o){
  o = o || {}; if(!window.FamChart) return null; var C = FamChart.build(people, meId, "print"); if(!C || !C.W) return null;
  // 0.5.9: landscape; I am always in the middle across (the chart may lean to one side)
  var W = 3394, H = 2400, M = 170, by = 430, bh = H - by - 330, meN = C.N[C.me], mx = meN ? meN.x + meN.w/2 : C.W/2;
  var s = Math.min((W/2 - M)/Math.max(mx, C.W - mx, 1), bh/C.H, 3.4), sy = Math.min(bh/C.H, s*2.1), ch = C.H*sy, ox = W/2 - mx*s, oy = by + Math.max(0, (bh - ch)*0.42) - 110*sy*0.6;
  var N = {}; Object.keys(C.N).forEach(function(id){ var n = C.N[id]; N[id] = {id:id, p:n.p, x:ox + n.x*s, y:oy + n.y*sy, w:n.w*s, h:n.h*s, row:n.row}; });
  var minY = 1e9, maxY = -1e9, minX = 1e9, maxX = -1e9; Object.keys(N).forEach(function(id){ var n = N[id]; minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y + n.h); minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x + n.w); });
  return {W:W, H:H, N:N, P:C.P, C:C, s:s, sy:sy, fs:C.fs*s, start:C.me, title:o.title||"", sub:o.sub||"", img:!!o.img, n:people.length, box:{x0:minX, x1:maxX, y0:minY, y1:maxY}};
}

// ---------------- drawing ----------------
function parchment(x, L){
  var W = L.W, H = L.H, g = x.createRadialGradient(W/2, H*0.45, W*0.2, W/2, H/2, W*0.95); g.addColorStop(0, "#f6ebcf"); g.addColorStop(0.7, "#ead8ae"); g.addColorStop(1, "#c9a96e");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  for(var i=0;i<260;i++){ var r = rnd(i+3), r2 = rnd(i*7+1), r3 = rnd(i*13+5); x.fillStyle = "rgba(150,100,40,"+(0.006 + r3*0.016)+")"; x.beginPath(); x.ellipse(r*W, r2*H, 30 + r3*160, 24 + r*110, r2*3, 0, Math.PI*2); x.fill(); }
  for(var j=0;j<1400;j++){ x.fillStyle = "rgba(90,60,30,"+(rnd(j+11)*0.12)+")"; x.fillRect(rnd(j*3+2)*W, rnd(j*5+9)*H, 2, 2); }
}
function border(x, L){
  var W = L.W, H = L.H, m = 44; x.strokeStyle = SEPIA; x.lineWidth = 10; x.strokeRect(m, m, W - 2*m, H - 2*m); x.lineWidth = 3; x.strokeRect(m + 22, m + 22, W - 2*m - 44, H - 2*m - 44);
  x.setLineDash([2, 14]); x.lineWidth = 4; x.strokeRect(m + 36, m + 36, W - 2*m - 72, H - 2*m - 72); x.setLineDash([]);
  [[m + 22, m + 22, 1, 1], [W - m - 22, m + 22, -1, 1], [m + 22, H - m - 22, 1, -1], [W - m - 22, H - m - 22, -1, -1]].forEach(function(c){ x.save(); x.translate(c[0], c[1]); x.scale(c[2], c[3]);
    x.strokeStyle = SEPIA; x.lineWidth = 4; x.beginPath(); x.moveTo(0, 150); x.bezierCurveTo(0, 60, 60, 0, 150, 0); x.stroke();
    x.beginPath(); x.moveTo(30, 110); x.bezierCurveTo(30, 60, 60, 30, 110, 30); x.bezierCurveTo(80, 50, 60, 70, 70, 100); x.stroke();
    x.beginPath(); x.arc(62, 62, 14, 0, Math.PI*2); x.stroke(); x.beginPath(); x.arc(62, 62, 5, 0, Math.PI*2); x.fillStyle = SEPIA; x.fill(); x.restore(); });
}
function title(x, L){
  if(!L.title) return; var W = L.W, y = 230; x.save(); x.textAlign = "center"; x.textBaseline = "middle";
  x.fillStyle = "rgba(241,228,196,.85)"; x.strokeStyle = SEPIA; x.lineWidth = 4; var tw = Math.min(W - 400, 1500);
  x.beginPath(); x.moveTo(W/2 - tw/2, y - 85); x.lineTo(W/2 + tw/2, y - 85); x.quadraticCurveTo(W/2 + tw/2 + 60, y, W/2 + tw/2, y + 85); x.lineTo(W/2 - tw/2, y + 85); x.quadraticCurveTo(W/2 - tw/2 - 60, y, W/2 - tw/2, y - 85); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = INK; var f = 118; x.font = f+"px "+FN; while(x.measureText(L.title).width > tw - 80 && f > 50){ f -= 6; x.font = f+"px "+FN; } x.fillText(L.title, W/2, y + 6);
  if(L.sub){ x.font = "38px "+FI; x.fillStyle = SEPIA; x.fillText(L.sub, W/2, y + 130); } x.restore();
}
// a tapered ink branch along a quadratic curve from a to b (control k), drawn to fraction t
function limb(x, a, k, b, w0, w1, t, col, seed){
  var steps = 22, pts = []; for(var i=0;i<=steps;i++){ var u = i/steps*t, iu = 1 - u; pts.push([iu*iu*a[0] + 2*iu*u*k[0] + u*u*b[0], iu*iu*a[1] + 2*iu*u*k[1] + u*u*b[1], w0 + (w1 - w0)*(i/steps)]); }
  var L = [], R = []; for(var j=0;j<pts.length;j++){ var p = pts[j], q = pts[Math.min(pts.length-1, j+1)], r = pts[Math.max(0, j-1)], dx = q[0] - r[0], dy = q[1] - r[1], d = Math.hypot(dx, dy) || 1, nx = -dy/d, ny = dx/d, wob = 1 + (rnd(seed + j)*0.16 - 0.08);
    L.push([p[0] + nx*p[2]/2*wob, p[1] + ny*p[2]/2*wob]); R.push([p[0] - nx*p[2]/2*wob, p[1] - ny*p[2]/2*wob]); }
  x.beginPath(); x.moveTo(L[0][0], L[0][1]); L.forEach(function(p){ x.lineTo(p[0], p[1]); }); for(var m=R.length-1;m>=0;m--) x.lineTo(R[m][0], R[m][1]); x.closePath();
  x.fillStyle = col || BARK; x.fill(); x.strokeStyle = "rgba(40,25,10,.55)"; x.lineWidth = 2; x.stroke();
  if(w0 > 14){ x.strokeStyle = "rgba(30,18,8,.35)"; x.lineWidth = 1.6; for(var s=0;s<3;s++){ x.beginPath(); pts.forEach(function(p, i){ var off = (s - 1)*p[2]*0.22; if(i) x.lineTo(p[0] + off, p[1]); else x.moveTo(p[0] + off, p[1]); }); x.stroke(); } }
}
function leafCluster(x, cx, cy, r, n, seed, t){
  for(var i=0;i<n;i++){ var a = rnd(seed + i)*Math.PI*2, d = Math.sqrt(rnd(seed + i*3 + 1))*r, lx = cx + Math.cos(a)*d, ly = cy + Math.sin(a)*d*0.7, s = (10 + rnd(seed + i*7)*14)*t;
    if(s < 1) continue; x.save(); x.translate(lx, ly); x.rotate(rnd(seed + i*11)*Math.PI*2);
    var gtone = Math.floor(rnd(seed + i*5)*3); x.fillStyle = ["rgba(96,92,48,.80)","rgba(120,104,56,.78)","rgba(78,74,40,.82)"][gtone];
    x.beginPath(); x.moveTo(-s, 0); x.quadraticCurveTo(0, -s*0.55, s, 0); x.quadraticCurveTo(0, s*0.55, -s, 0); x.fill();
    x.strokeStyle = "rgba(40,30,12,.55)"; x.lineWidth = 1.2; x.stroke(); x.beginPath(); x.moveTo(-s*0.8, 0); x.lineTo(s*0.8, 0); x.stroke(); x.restore(); }
}
// the faded tree behind the chart: trunk and roots at the bottom, limbs spreading into a canopy that holds every name
function bgTree(x, L, t){
  // centred under me (the middle of the poster), canopy wide enough for every name, a short trunk just below the lowest names
  var W = L.W, H = L.H, b = L.box, cx = W/2, cyc = (b.y0 + b.y1)/2, rx = Math.max(800, Math.max(cx - b.x0, b.x1 - cx) + 160), ry = Math.max(420, (b.y1 - b.y0)/2 + 140), gy = Math.min(H - 110, b.y1 + 200), top = gy - 230;
  x.save(); x.globalAlpha = 0.32;
  // canopy foliage (more people, denser leaves)
  var nc = 60 + Math.min(140, L.n*5);
  for(var c=0;c<nc;c++){ var a = rnd(c*7+1)*Math.PI*2, d = Math.sqrt(rnd(c*3+2)), lx = cx + Math.cos(a)*rx*d, ly = cyc + Math.sin(a)*ry*d*0.95; leafCluster(x, lx, ly, 70 + rnd(c)*70, 12, 900 + c*31, t); }
  // trunk, limbs and twigs
  var tw = 230; limb(x, [cx, gy + 40], [cx - 40, (gy + top)/2], [cx, gy - (gy - top)*t], tw, tw*0.55, 1, BARK, 3);
  for(var k=0;k<9;k++){ var ang = Math.PI*(0.08 + 0.84*k/8), ex = cx - Math.cos(ang)*rx*0.92, ey = cyc - Math.sin(ang)*ry*0.8 + ry*0.25, sx = cx + (k - 4)*12, sy = top + 30;
    limb(x, [sx, sy], [sx + (ex - sx)*0.35, sy - (sy - ey)*0.7], [ex, ey], 70 - Math.abs(k - 4)*6, 10, t, BARK, 40 + k);
    for(var j=0;j<3;j++){ var u = 0.45 + j*0.18, px = sx + (ex - sx)*u, py = sy + (ey - sy)*u - 30, tx2 = px + (rnd(k*9 + j) - 0.5)*360, ty2 = py - 120 - rnd(k + j*5)*160; limb(x, [px, py], [(px + tx2)/2, py - 40], [tx2, ty2], 16, 3, t, BARK, 70 + k*5 + j); } }
  // roots and ground
  for(var r=0;r<7;r++){ var ra = -1 + r/3, ex2 = cx + ra*330, ey2 = gy + 120 + rnd(r)*90; limb(x, [cx + ra*40, gy + 20], [cx + ra*170, gy + 60], [ex2, ey2], 46, 4, t, "#4d3420", 120 + r); }
  x.strokeStyle = "rgba(70,50,25,.8)"; x.lineWidth = 3; x.beginPath(); for(var g=200; g<=W - 200; g+=18){ var yy = gy + 30 + Math.sin(g*0.013)*8; if(g===200) x.moveTo(g, yy); else x.lineTo(g, yy); } x.stroke();
  x.restore();
}
// a branch-like ink line between two points (slightly bowed, tapering)
function twig(x, a, b, w, seed, t){ var mx = (a[0] + b[0])/2 + (rnd(seed) - 0.5)*Math.min(40, Math.abs(b[1] - a[1])*0.25), my = (a[1] + b[1])/2 + (rnd(seed + 1) - 0.5)*Math.min(30, Math.abs(b[0] - a[0])*0.08);
  limb(x, a, [mx, my], b, w, Math.max(2.5, w*0.55), t==null ? 1 : t, BARK, seed); }
function nameplate(x, n, L, hl, imgs){
  var p = n.p, X = n.x - 10, Y = n.y - 4, w = n.w + 20, h = n.h + 8, r = h/2, me = p.id===L.start, dead = !!(p.dd || p.dead);
  x.save(); x.shadowColor = "rgba(60,40,15,.35)"; x.shadowBlur = 8; x.shadowOffsetY = 3; x.fillStyle = "rgba(244,233,204,.94)";
  x.beginPath(); x.moveTo(X + r, Y); x.lineTo(X + w - r, Y); x.arc(X + w - r, Y + r, r, -Math.PI/2, Math.PI/2); x.lineTo(X + r, Y + h); x.arc(X + r, Y + r, r, Math.PI/2, Math.PI*1.5); x.closePath(); x.fill(); x.restore();
  x.strokeStyle = hl===p.id ? "#b8860b" : me ? "#a07a20" : SEPIA; x.lineWidth = hl===p.id || me ? 5 : 2.5; x.stroke();
  if(L.img && p.img){ var im = imgs && imgs[p.id], R = L.pr, icx = X + w/2, icy = Y - R*0.92; x.save(); x.beginPath(); x.arc(icx, icy, R, 0, Math.PI*2); x.closePath(); x.fillStyle = "#e3d2a8"; x.fill(); x.clip();
    if(im && im.complete && im.naturalWidth){ var k = Math.max(2*R/im.naturalWidth, 2*R/im.naturalHeight); x.filter = "sepia(.5)"; x.drawImage(im, icx - im.naturalWidth*k/2, icy - im.naturalHeight*k/2, im.naturalWidth*k, im.naturalHeight*k); x.filter = "none"; }
    x.restore(); x.beginPath(); x.arc(icx, icy, R, 0, Math.PI*2); x.strokeStyle = SEPIA; x.lineWidth = 2.5; x.stroke(); }
  var f = n.h*0.92, yr = years(p); x.font = f+"px "+FN; while(x.measureText(p.n).width > n.w + 6 && f > 10){ f -= 1; x.font = f+"px "+FN; }
  x.textAlign = "center"; x.textBaseline = "middle"; x.globalAlpha = dead ? 0.5 : 1; x.fillStyle = p.g==="f" ? "#5c0f1f" : "#0e2140"; x.fillText(p.n, n.x + n.w/2, n.y + n.h*(yr ? 0.42 : 0.52));
  if(yr){ x.font = Math.max(9, n.h*0.34)+"px "+FI; x.fillStyle = "#4a3320"; x.fillText(yr, n.x + n.w/2, n.y + n.h*0.93); } x.globalAlpha = 1;
}
function years(p){ var b = p.b ? String(p.b).slice(0, 4) : "", d = p.dd ? String(p.dd).slice(0, 4) : ""; if(!b && !d) return p.dead ? "✝" : ""; return (b || "?")+(d || p.dead ? " – "+(d || "?") : ""); }
function draw(cv, L, hl, t, imgs){
  var x = cv.getContext("2d"), k = cv.width/L.W; x.setTransform(k, 0, 0, k, 0, 0); t = t==null ? 1 : t;
  parchment(x, L); border(x, L); title(x, L); bgTree(x, L, Math.min(1, t*1.5));
  if(t < 0.45) return; x.globalAlpha = Math.min(1, (t - 0.45)/0.4);
  var N = L.N, C = L.C, s = L.s, sy = L.sy, hasI = L.img && Object.keys(N).some(function(id){ return N[id].p.img; }), drop = C.RH*sy*(hasI ? 0.5 : 0.26);
  L.pr = Math.min(Math.max.apply(null, Object.keys(N).map(function(id){ return N[id].h; }))*0.85, C.RH*sy*0.2); var mid = function(id){ return N[id].x + N[id].w/2; }, cyy = function(id){ return N[id].y + N[id].h/2; }, lw = Math.max(5, 7*s);
  // husband and wife joined by a short branch with a heart
  C.rows.forEach(function(units){ units.forEach(function(u){ for(var i=1;i<u.m.length;i++){ var a = N[u.m[i-1]], b = N[u.m[i]], y = a.y + a.h/2; twig(x, [a.x + a.w + 6, y], [b.x - 6, y], lw*0.8, i*13 + Math.round(a.x));
    x.font = Math.round(a.h*0.8)+"px "+FS; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "#8b1e2b"; x.fillText("♥", (a.x + a.w + b.x)/2, y - a.h*0.55); } }); });
  // parents to children: one stem down, a bough across, a twig to each child
  Object.keys(C.groups).forEach(function(key, gi){ var pr = key.split("|").filter(Boolean), kids = C.groups[key]; if(!pr.length) return;
    var px = pr.reduce(function(a, id){ return a + mid(id); }, 0)/pr.length, py = Math.max.apply(null, pr.map(cyy)) + (pr.length > 1 ? 0 : N[pr[0]].h/2), ky = N[kids[0]].y, by = ky - drop - (C.lane[key]||0)*C.RH*sy*0.07;
    var xs = kids.map(mid), x1 = Math.min.apply(null, xs.concat([px])), x2 = Math.max.apply(null, xs.concat([px]));
    twig(x, [px, py + 4], [px, by], lw*1.25, gi*31 + 1); if(x2 - x1 > 4) twig(x, [x1, by], [x2, by], lw, gi*31 + 2);
    kids.forEach(function(kd, ki){ twig(x, [mid(kd), by], [mid(kd), N[kd].y - 6], lw*0.8, gi*31 + ki*7 + 3); leafCluster(x, mid(kd) + 18, by + 4, 22, 3, gi*91 + ki, 1); }); });
  Object.keys(N).forEach(function(id){ nameplate(x, N[id], L, hl, imgs); });
  x.globalAlpha = 1;
}
function hitAt(L, bx, by){ var f = null; Object.keys(L.N).forEach(function(id){ var n = L.N[id]; if(bx >= n.x - 12 && bx <= n.x + n.w + 12 && by >= n.y - 10 && by <= n.y + n.h + 10) f = id; }); return f; }
function loadImgs(people, done){ var m = {}, left = 0; people.forEach(function(p){ if(!p.img) return; left++; var im = new Image(); im.onload = im.onerror = function(){ if(--left===0) done(m); }; im.src = p.img; m[p.id] = im; }); if(!left) done(m); }

// ---------------- three.js view ----------------
var st = null, raf = 0, timers = [];
function stop(){ cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers = []; if(st){ try{ if(st.ro) st.ro.disconnect(); st.tex.dispose(); st.mesh.geometry.dispose(); st.mesh.material.dispose(); st.rn.dispose(); if(st.rn.domElement.parentNode) st.rn.domElement.parentNode.removeChild(st.rn.domElement); }catch(e){} st = null; } }
function mount(box, people, meId, opt){
  var T = window.THREE; stop(); opt = opt || {};
  var L = build(people, meId, opt); if(!L){ box.innerHTML = ""; return; }
  var k = Math.min(1, 4096/Math.max(L.W, L.H)), cv = document.createElement("canvas"); cv.width = Math.round(L.W*k); cv.height = Math.round(L.H*k);
  var W = box.clientWidth || 360, Hh = box.clientHeight || 360, rn = new T.WebGLRenderer({antialias:true}); rn.domElement.dataset.ib3d="own"; rn.setPixelRatio(Math.min(2, window.devicePixelRatio||1)); rn.setSize(W, Hh); rn.outputColorSpace = T.SRGBColorSpace;
  box.innerHTML = ""; box.appendChild(rn.domElement);
  var sc = new T.Scene(); sc.background = new T.Color(0x2a1f14);
  var tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4; tex.minFilter = T.LinearMipmapLinearFilter;
  var mesh = new T.Mesh(new T.PlaneGeometry(L.W, L.H), new T.MeshBasicMaterial({map:tex})); sc.add(mesh);
  var cam = new T.OrthographicCamera(-W/2, W/2, Hh/2, -Hh/2, -10, 10), view = {x:0, y:0, z:Math.min(W/L.W, Hh/L.H)*0.98};
  var apply = function(){ var hw = W/2/view.z, hh = Hh/2/view.z; cam.left = view.x - hw; cam.right = view.x + hw; cam.top = view.y + hh; cam.bottom = view.y - hh; cam.updateProjectionMatrix(); }; apply();
  var hl = opt.sel || null, imgs = {}, tNow = 0;
  var paint = function(t){ tNow = t; draw(cv, L, hl, t, imgs); tex.needsUpdate = true; };
  // grow in: the tree draws itself, then the names appear
  var growIn = function(){ var steps = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]; steps.forEach(function(t, i){ timers.push(setTimeout(function(){ if(st) paint(t); }, 90*i)); }); };
  fonts().then(function(){ if(!st) return; if(opt.img) loadImgs(people, function(m){ imgs = m; if(st && tNow>=1) paint(1); }); growIn(); });
  var el = rn.domElement, pts = {}, moved = 0, multi = false, pinch0 = 0, z0 = 1, mid0 = null;
  var down = function(e){ el.setPointerCapture && el.setPointerCapture(e.pointerId); pts[e.pointerId] = {x:e.clientX, y:e.clientY}; var k2 = Object.keys(pts); if(k2.length===1){ moved = 0; multi = false; } if(k2.length===2){ multi = true; var a = pts[k2[0]], b = pts[k2[1]]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); z0 = view.z; mid0 = {x:(a.x + b.x)/2, y:(a.y + b.y)/2}; } };
  var mv = function(e){ var p = pts[e.pointerId]; if(!p) return; var k2 = Object.keys(pts), dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if(k2.length===2){ var a = pts[k2[0]], b = pts[k2[1]], d = Math.hypot(a.x - b.x, a.y - b.y), m = {x:(a.x + b.x)/2, y:(a.y + b.y)/2}; if(pinch0) view.z = Math.max(0.05, Math.min(4, z0*d/pinch0)); if(mid0){ view.x -= (m.x - mid0.x)/view.z; view.y += (m.y - mid0.y)/view.z; } mid0 = m; moved += 5; }
    else { view.x -= dx/view.z; view.y += dy/view.z; moved += Math.abs(dx) + Math.abs(dy); } apply(); e.preventDefault(); };
  var toBoard = function(cx, cy){ var r = el.getBoundingClientRect(), wx = view.x + (cx - r.left - r.width/2)/view.z, wy = view.y - (cy - r.top - r.height/2)/view.z; return {x:wx + L.W/2, y:L.H/2 - wy}; };
  var up = function(e){ var p = pts[e.pointerId]; delete pts[e.pointerId]; if(Object.keys(pts).length < 2) mid0 = null; if(p && moved < 16 && !multi && !Object.keys(pts).length){ var b = toBoard(e.clientX, e.clientY), id = hitAt(L, b.x, b.y); setHl(id); if(opt.onSel) opt.onSel(id); } };
  var wheel = function(e){ view.z = Math.max(0.05, Math.min(4, view.z*(e.deltaY > 0 ? 0.9 : 1.1))); apply(); e.preventDefault(); };
  el.style.touchAction = "none"; el.addEventListener("pointerdown", down); el.addEventListener("pointermove", mv); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); el.addEventListener("wheel", wheel, {passive:false});
  var setHl = function(id){ hl = id; paint(1); };
  var ro = null; if(window.ResizeObserver){ ro = new ResizeObserver(function(){ var w = box.clientWidth, h = box.clientHeight; if(!w || !h) return; W = w; Hh = h; rn.setSize(w, h); apply(); }); ro.observe(box); }
  function frame(){ raf = requestAnimationFrame(frame); rn.render(sc, cam); } frame();
  st = {rn:rn, tex:tex, mesh:mesh, ro:ro, L:L, setHl:setHl, focus:function(id){ var n = L.N[id]; if(!n) return; view.x = n.x + n.w/2 - L.W/2; view.y = L.H/2 - (n.y + n.h/2); view.z = Math.max(view.z, 0.5); apply(); }};
}
/** the full poster (A-paper ratio) as a canvas, for the PDF; done(canvas) */
function poster(people, meId, opt, done){ var L = build(people, meId, opt); if(!L){ done(null); return; }
  fonts().then(function(){ var go = function(imgs){ var cv = document.createElement("canvas"); cv.width = L.W; cv.height = L.H; draw(cv, L, null, 1, imgs); done(cv); }; if(opt && opt.img) loadImgs(people, go); else go({}); }); }
window.FamVintage = {mount:mount, stop:stop, poster:poster, build:build, highlight:function(id){ if(st) st.setHl(id); }, focus:function(id){ if(st) st.focus(id); }, resize:function(){}};
})();
