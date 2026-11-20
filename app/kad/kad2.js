/* Greeting card art v2 (0.6.34): procedural, layered canvas scenes (no images). KadArt.draw(x, W, H, des, C, R) paints the background
   art for a 1080×1350 card and returns {y: where the text starts, fy: lowest line for "From", dark: true on dark art}.
   C = [id, bg1, bg2, accent, text]. Every design reads the chosen colour set, then adds its own natural colours (flames, petals, glass). */
(function(){
var PI = Math.PI, TAU = PI * 2;
function hx(c){ c = c.replace("#", ""); if(c.length === 3) c = c.replace(/./g, "$&$&"); var n = parseInt(c, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, t){ var p = hx(a), q = hx(b); return "rgb(" + p.map(function(v, i){ return Math.round(v + (q[i] - v) * t); }).join(",") + ")"; }
function al(c, a){ if(c.indexOf("rgb(") === 0) return c.replace("rgb(", "rgba(").replace(")", "," + a + ")"); return "rgba(" + hx(c).join(",") + "," + a + ")"; }
function lum(c){ var p = hx(c); return (0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]) / 255; }
function lin(x, x0, y0, x1, y1, st){ var g = x.createLinearGradient(x0, y0, x1, y1); st.forEach(function(s, i){ var A = Array.isArray(s); g.addColorStop(A ? s[1] : i / (st.length - 1), A ? s[0] : s); }); return g; }
function rad(x, cx, cy, r0, r1, st){ var g = x.createRadialGradient(cx, cy, r0, cx, cy, r1); st.forEach(function(s, i){ var A = Array.isArray(s); g.addColorStop(A ? s[1] : i / (st.length - 1), A ? s[0] : s); }); return g; }
function metal(x, a, x0, y0, x1, y1){ return lin(x, x0, y0, x1, y1, [mix(a, "#000000", 0.45), a, mix(a, "#ffffff", 0.6), a, mix(a, "#000000", 0.3), mix(a, "#ffffff", 0.45), mix(a, "#000000", 0.2)]); }
function star(x, cx, cy, r, n, k, rot){ x.beginPath(); for(var i = 0; i < n * 2; i++){ var a = PI * i / n - PI / 2 + (rot || 0), rr = i % 2 ? r * k : r; x.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); } x.closePath(); }
function glow(x, cx, cy, r, c, a){ x.fillStyle = rad(x, cx, cy, 0, r, [al(c, a), al(c, a * 0.35), al(c, 0)]); x.fillRect(cx - r, cy - r, r * 2, r * 2); }
function grain(x, W, H, R, n, a, light){ for(var i = 0; i < n; i++){ x.fillStyle = (light ? "rgba(255,255,255," : "rgba(0,0,0,") + (R() * a) + ")"; x.fillRect(R() * W, R() * H, 1.5, 1.5); } }
function vign(x, W, H, a){ x.fillStyle = rad(x, W / 2, H / 2, W * 0.35, H * 0.78, ["rgba(0,0,0,0)", "rgba(0,0,0," + a + ")"]); x.fillRect(0, 0, W, H); }
function bokeh(x, W, H, R, n, cols, r0, r1, a, zone){ for(var i = 0; i < n; i++){ var cx = R() * W, cy = zone ? zone[0] + R() * (zone[1] - zone[0]) : R() * H, r = r0 + R() * (r1 - r0), c = cols[Math.floor(R() * cols.length)];
    x.fillStyle = rad(x, cx, cy, r * 0.2, r, [al(c, a * (0.5 + R() * 0.5)), al(c, a * 0.4), al(c, 0)]); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); } }
function sparkle(x, cx, cy, r, c){ glow(x, cx, cy, r * 2.2, c, 0.35); x.fillStyle = c; star(x, cx, cy, r, 4, 0.16); x.fill(); x.fillStyle = "#fff"; star(x, cx, cy, r * 0.45, 4, 0.3, PI / 4); x.fill(); }
function leafP(x, l, w){ x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(l * 0.25, -w, l * 0.75, -w * 0.8, l, 0); x.bezierCurveTo(l * 0.75, w * 0.8, l * 0.25, w, 0, 0); }
function leaf(x, cx, cy, a, l, w, c1, c2){ x.save(); x.translate(cx, cy); x.rotate(a); leafP(x, l, w); x.fillStyle = lin(x, 0, -w, 0, w, [c1, c2]); x.fill();
  x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = Math.max(1, w * 0.08); x.beginPath(); x.moveTo(l * 0.05, 0); x.quadraticCurveTo(l * 0.5, -w * 0.1, l * 0.95, 0);
  for(var v = 1; v < 5; v++){ x.moveTo(l * v * 0.18, -w * 0.05); x.lineTo(l * v * 0.18 + l * 0.12, -w * 0.55); x.moveTo(l * v * 0.18, w * 0.02); x.lineTo(l * v * 0.18 + l * 0.12, w * 0.5); } x.stroke(); x.restore(); }
function sky(x, W, H, top, mid, bot){ x.fillStyle = lin(x, 0, 0, 0, H, [top, [mid, 0.55], [bot, 1]]); x.fillRect(0, 0, W, H); }
function stars(x, W, y0, y1, R, n, keep){ for(var i = 0; i < n; i++){ var sx = R() * W, sy = y0 + R() * (y1 - y0); if(keep && sx > keep[0] && sx < keep[2] && sy > keep[1] && sy < keep[3] && R() > 0.2) continue; var r = Math.pow(R(), 3) * 2.8 + 0.4;
    x.fillStyle = "rgba(255,250,235," + (0.25 + R() * 0.7) + ")"; x.beginPath(); x.arc(sx, sy, r, 0, TAU); x.fill(); } }
// silhouettes
function dome(x, cx, base, w, h){ x.beginPath(); x.moveTo(cx - w / 2, base); x.bezierCurveTo(cx - w / 2, base - h * 0.72, cx - w * 0.12, base - h * 0.86, cx, base - h); x.bezierCurveTo(cx + w * 0.12, base - h * 0.86, cx + w / 2, base - h * 0.72, cx + w / 2, base); x.closePath(); }
function minaret(x, cx, base, h, w){ w = w || 26; x.fillRect(cx - w / 2, base - h, w, h); x.fillRect(cx - w * 0.8, base - h * 0.7, w * 1.6, w * 0.35); x.fillRect(cx - w * 0.75, base - h * 0.92, w * 1.5, w * 0.3); x.beginPath(); x.moveTo(cx - w / 2, base - h); x.lineTo(cx, base - h - w * 2.2); x.lineTo(cx + w / 2, base - h); x.fill(); }
function skyline(x, W, base, s, col, lit, R){ x.fillStyle = col; x.fillRect(0, base, W, 2000);
  var cx = W / 2; x.fillRect(cx - 300 * s, base - 120 * s, 600 * s, 120 * s); dome(x, cx, base - 110 * s, 300 * s, 230 * s); x.fill(); dome(x, cx - 220 * s, base - 100 * s, 140 * s, 110 * s); x.fill(); dome(x, cx + 220 * s, base - 100 * s, 140 * s, 110 * s); x.fill();
  minaret(x, cx - 380 * s, base, 420 * s, 26 * s); minaret(x, cx + 380 * s, base, 420 * s, 26 * s); x.fillRect(cx - 2 * s, base - 380 * s, 4 * s, 40 * s);
  if(lit){ for(var i = -4; i <= 4; i++){ x.fillStyle = "rgba(255,206,120," + (0.55 + R() * 0.45) + ")"; var wx = cx + i * 56 * s; x.beginPath(); x.moveTo(wx - 9 * s, base - 20 * s); x.lineTo(wx - 9 * s, base - 62 * s); x.arc(wx, base - 62 * s, 9 * s, PI, 0); x.lineTo(wx + 9 * s, base - 20 * s); x.fill(); } x.fillStyle = col; } }
function palm(x, px, py, h, c, lean){ x.strokeStyle = c; x.fillStyle = c; x.lineWidth = 9; x.lineCap = "round"; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + lean * 0.5, py - h * 0.6, px + lean, py - h); x.stroke();
  var tx = px + lean, ty = py - h; for(var f = 0; f < 7; f++){ var a = -PI + f * PI / 6 + 0.1, L = h * 0.42; x.save(); x.translate(tx, ty); x.rotate(a); x.lineWidth = 4; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(L * 0.5, -L * 0.12, L, L * 0.25); x.stroke();
    for(var k = 1; k < 9; k++){ var t = k / 9, lx = L * t, ly = -L * 0.12 * 4 * t * (1 - t) + L * 0.25 * t * t; x.beginPath(); x.moveTo(lx, ly); x.lineTo(lx + 10, ly + 26 - t * 10); x.lineTo(lx + 16, ly + 2); x.fill(); } x.restore(); } }

// ---------- designs ----------
var D = {};
D.geo = function(x, W, H, P, R){ x.fillStyle = rad(x, W / 2, H * 0.45, 60, H * 0.8, [mix(P.a, "#ffffff", P.dk ? 0.12 : 0.3), P.a, P.b]); x.fillRect(0, 0, W, H);
  var s = 150, M = metal(x, P.acc, 0, 0, W, H);
  for(var gy = -s / 2, r = 0; gy < H + s; gy += s * 0.5, r++) for(var gx = (r % 2) * s / 2 - s / 2; gx < W + s; gx += s){
    x.save(); x.translate(gx, gy); star(x, 0, 0, s * 0.48, 8, 0.7); x.fillStyle = al(P.acc, 0.06); x.fill(); x.strokeStyle = M; x.lineWidth = 3.2; x.stroke(); x.strokeStyle = al(P.b, 0.6); x.lineWidth = 1; x.stroke();
    star(x, 0, 0, s * 0.2, 8, 0.55, PI / 8); x.fillStyle = al(r % 2 ? "#2ec4b6" : P.acc, 0.35); x.fill(); x.beginPath(); x.arc(0, 0, 4, 0, TAU); x.fillStyle = M; x.fill(); x.restore(); }
  x.fillStyle = rad(x, W / 2, H * 0.55, 120, 560, [al(P.a, 0.96), al(P.a, 0.86), al(P.a, 0)]); x.fillRect(0, 0, W, H);
  x.save(); x.translate(W / 2, 200); x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 24; x.shadowOffsetY = 8; star(x, 0, 0, 130, 16, 0.8); x.fillStyle = M; x.fill(); x.shadowColor = "transparent";
  x.beginPath(); x.arc(0, 0, 96, 0, TAU); x.fillStyle = P.b; x.fill(); x.strokeStyle = M; x.lineWidth = 4; x.stroke();
  star(x, 0, 0, 86, 8, 0.62); x.fillStyle = al(P.acc, 0.25); x.fill(); x.strokeStyle = M; x.lineWidth = 2.5; x.stroke(); star(x, 0, 0, 44, 8, 0.55, PI / 8); x.fillStyle = "#2ec4b6"; x.fill(); x.beginPath(); x.arc(0, 0, 16, 0, TAU); x.fillStyle = M; x.fill(); x.restore();
  return {y: 420, fy: H - 150}; };
D.sabit = function(x, W, H, P, R){ sky(x, W, H, P.dk ? P.b : mix(P.b, "#0b1240", 0.7), P.dk ? P.a : mix(P.a, "#1d2c63", 0.6), mix(P.dk ? P.a : "#3c3f7c", "#e08a5a", 0.45));
  [[0.2, 0.25, "#7a5cff"], [0.75, 0.45, "#2ec4b6"], [0.35, 0.62, "#ff6fa8"]].forEach(function(n){ glow(x, W * n[0], H * n[1], 480, n[2], 0.16); });
  stars(x, W, 0, H * 0.75, R, 380, [140, 380, W - 140, H - 420]); for(var i = 0; i < 9; i++){ var sx = R() * W, sy = R() * H * 0.6; if(sx > 160 && sx < W - 160 && sy > 360) continue; sparkle(x, sx, sy, 14 + R() * 10, "#fffbe8"); }
  var cx = W - 250, cy = 220; glow(x, cx, cy, 300, mix(P.acc, "#fff3c4", 0.5), 0.45); x.beginPath(); x.arc(cx, cy, 120, 0, TAU); x.fillStyle = "rgba(190,200,240,.08)"; x.fill();
  x.save(); x.beginPath(); x.arc(cx, cy, 120, 0, TAU); x.clip(); x.beginPath(); x.rect(0, 0, W, H); x.moveTo(cx + 52 + 112, cy - 34); x.arc(cx + 52, cy - 34, 112, 0, TAU); x.clip("evenodd");
  x.fillStyle = lin(x, cx - 120, cy - 60, cx + 40, cy + 120, ["#fffbe6", mix(P.acc, "#fff3c4", 0.4), P.acc, mix(P.acc, "#000", 0.25)]); x.fillRect(cx - 130, cy - 130, 260, 260);
  for(var k = 0; k < 7; k++){ x.beginPath(); x.arc(cx - 90 + R() * 70, cy - 50 + R() * 140, 4 + R() * 10, 0, TAU); x.fillStyle = "rgba(120,80,20,.12)"; x.fill(); } x.restore();
  sparkle(x, cx - 170, cy + 120, 20, "#fff6d2");
  var g1 = mix(P.dk ? P.a : "#1d2c63", "#000", 0.25); x.globalAlpha = 0.45; skyline(x, W, H - 250, 0.6, mix(g1, "#e08a5a", 0.25), false, R); x.globalAlpha = 1;
  x.fillStyle = lin(x, 0, H - 330, 0, H - 200, ["rgba(255,200,150,0)", "rgba(255,200,150,.18)", "rgba(255,200,150,0)"]); x.fillRect(0, H - 330, W, 130);
  skyline(x, W, H - 140, 0.85, mix(g1, "#000", 0.45), true, R);
  return {y: 430, fy: H - 360, dark: true}; };
function ketupat(x, cx, cy, s, rot, R){ x.save(); x.translate(cx, cy); x.rotate(rot);
  x.strokeStyle = "rgba(90,70,30,.8)"; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -s); x.lineTo(R() * 20 - 10, -cy - 10); x.stroke();
  x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 18; x.shadowOffsetY = 10; x.beginPath(); x.moveTo(0, -s); x.lineTo(s, 0); x.lineTo(0, s); x.lineTo(-s, 0); x.closePath(); x.fillStyle = "#9cb83f"; x.fill(); x.shadowColor = "transparent"; x.save(); x.clip();
  var n = 5, st = s * 2 / n; x.rotate(PI / 4); var d = s * Math.SQRT2;
  for(var i = 0; i < n; i++) for(var j = 0; j < n; j++){ var px = -d / 2 + i * d / n, py = -d / 2 + j * d / n, up = (i + j) % 2;
    x.fillStyle = up ? lin(x, px, py, px + d / n, py, ["#e8f09a", "#c3d65a", "#94b23a"]) : lin(x, px, py, px, py + d / n, ["#c9dc68", "#8fae34", "#6d8e25"]); x.fillRect(px, py, d / n, d / n);
    x.strokeStyle = "rgba(60,80,10,.45)"; x.lineWidth = 2; x.strokeRect(px, py, d / n, d / n); x.strokeStyle = "rgba(255,255,220,.35)"; x.lineWidth = 1; x.beginPath(); if(up){ x.moveTo(px + 3, py + d / n * 0.3); x.lineTo(px + d / n - 3, py + d / n * 0.3); } else { x.moveTo(px + d / n * 0.3, py + 3); x.lineTo(px + d / n * 0.3, py + d / n - 3); } x.stroke(); }
  x.restore(); x.fillStyle = rad(x, -s * 0.35, -s * 0.35, 4, s * 1.4, ["rgba(255,255,230,.35)", "rgba(255,255,230,0)", "rgba(0,0,0,.28)"]); x.beginPath(); x.moveTo(0, -s); x.lineTo(s, 0); x.lineTo(0, s); x.lineTo(-s, 0); x.closePath(); x.fill();
  [[1, 1.35], [-1, 1.25]].forEach(function(t){ x.beginPath(); x.moveTo(0, s * 0.95); x.bezierCurveTo(t[0] * s * 0.25, s * 1.15, t[0] * s * 0.05, s * 1.3, t[0] * s * 0.22, s * t[1] + s * 0.25); x.lineTo(t[0] * s * 0.3, s * t[1] + s * 0.22); x.bezierCurveTo(t[0] * s * 0.14, s * 1.3, t[0] * s * 0.32, s * 1.12, t[0] * 6, s * 0.95); x.fillStyle = lin(x, 0, s, 0, s * 1.6, ["#a9c445", "#6d8e25"]); x.fill(); });
  x.restore(); }
function frond(x, x0, y0, a, L, sgn){ x.save(); x.translate(x0, y0); x.rotate(a); x.strokeStyle = "#5f7d1f"; x.lineWidth = 6; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(L * 0.5, -L * 0.18 * sgn, L, -L * 0.05 * sgn); x.stroke();
  for(var k = 1; k < 22; k++){ var t = k / 22, lx = L * t, ly = -L * 0.18 * sgn * 4 * t * (1 - t) * 0.5 - L * 0.05 * sgn * t * t; [1, -1].forEach(function(sd){ x.save(); x.translate(lx, ly); x.rotate(sd * (0.9 - t * 0.3) + 0.15); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(L * 0.09, -5, L * 0.2 * (1 - t * 0.5), 2); x.quadraticCurveTo(L * 0.09, 7, 0, 0); x.fillStyle = sd > 0 ? "#8fb33a" : "#6f9428"; x.fill(); x.restore(); }); } x.restore(); }
D.ketupat = function(x, W, H, P, R){ x.fillStyle = lin(x, 0, 0, W, H, [mix(P.a, "#ffffff", P.dk ? 0.08 : 0.25), P.a, P.b]); x.fillRect(0, 0, W, H);
  bokeh(x, W, H, R, 40, [P.acc, "#ffffff", "#ffd27a"], 20, 90, 0.16);
  x.strokeStyle = "rgba(120,90,40,.7)"; x.lineWidth = 3; x.beginPath(); x.moveTo(-20, 30); x.quadraticCurveTo(W / 2, 110, W + 20, 30); x.stroke();
  [[150, 220, 92, -0.08], [370, 160, 68, 0.06], [W - 380, 175, 72, -0.05], [W - 160, 235, 98, 0.08], [W / 2, 120, 54, 0]].forEach(function(k){ ketupat(x, k[0], k[1], k[2], k[3], R); });
  frond(x, -30, H + 20, -0.75, 520, 1); frond(x, W + 30, H + 20, -PI + 0.75, 520, -1); frond(x, -40, H - 120, -0.25, 400, 1); frond(x, W + 40, H - 120, -PI + 0.25, 400, -1);
  return {y: 470, fy: H - 220}; };
D.pelita = function(x, W, H, P, R){ sky(x, W, H, mix(P.dk ? P.b : "#0b1430", "#000", 0.2), P.dk ? P.a : "#1b2a55", mix(P.dk ? P.a : "#1b2a55", "#e07a3a", 0.35)); stars(x, W, 0, H * 0.55, R, 220);
  glow(x, W - 220, 200, 200, "#fff3c4", 0.25); x.beginPath(); x.arc(W - 220, 200, 56, 0, TAU); x.fillStyle = "#fff4cf"; x.fill();
  var gnd = H - 210, sil = "#060a14"; x.fillStyle = sil; palm(x, 110, gnd, 380, sil, 40); palm(x, W - 90, gnd, 330, sil, -30);
  x.save(); x.translate(250, gnd); x.fillRect(0, -150, 300, 110); for(var p = 0; p < 6; p++) x.fillRect(10 + p * 55, -40, 10, 40); x.beginPath(); x.moveTo(-30, -150); x.lineTo(150, -290); x.lineTo(330, -150); x.fill(); x.beginPath(); x.moveTo(140, -300); x.lineTo(150, -330); x.lineTo(160, -300); x.fill();
  x.fillStyle = "rgba(255,190,90,.85)"; x.fillRect(60, -125, 40, 50); x.fillRect(200, -125, 40, 50); x.restore();
  x.fillStyle = lin(x, 0, gnd - 30, 0, H, ["#0c1220", "#05070d"]); x.beginPath(); x.moveTo(0, H); x.lineTo(0, gnd); for(var gx = 0; gx <= W; gx += 30) x.lineTo(gx, gnd + Math.sin(gx * 0.01) * 10); x.lineTo(W, H); x.fill();
  for(var i = 0; i < 7; i++){ var px = 90 + i * 150, py = H - 70 - (i % 2) * 30, hgt = 170 + (i % 3) * 30;
    glow(x, px, py - hgt - 30, 170, "#ffb347", 0.45); x.fillStyle = lin(x, px - 9, 0, px + 9, 0, ["#4e5e22", "#a3b04a", "#5e6e28"]); x.fillRect(px - 9, py - hgt, 18, hgt);
    x.fillStyle = "rgba(40,50,15,.8)"; for(var nd = 1; nd < 3; nd++) x.fillRect(px - 10, py - hgt + nd * hgt / 3, 20, 4);
    x.fillStyle = lin(x, px - 16, 0, px + 16, 0, ["#5a4630", "#c9b48a", "#6a5238"]); x.fillRect(px - 16, py - hgt - 18, 32, 20);
    var fx = px, fy = py - hgt - 18; x.beginPath(); x.moveTo(fx, fy - 70); x.bezierCurveTo(fx + 22, fy - 40, fx + 18, fy - 8, fx, fy); x.bezierCurveTo(fx - 18, fy - 8, fx - 22, fy - 40, fx, fy - 70); x.fillStyle = rad(x, fx, fy - 18, 2, 50, ["#ffffff", "#ffe27a", "#ff9a2e", "rgba(255,90,20,.2)"]); x.fill();
    x.fillStyle = "rgba(255,170,80,.12)"; x.beginPath(); x.ellipse(px, py + 6, 70, 12, 0, 0, TAU); x.fill(); }
  for(var f = 0; f < 40; f++){ var ffx = R() * W, ffy = H * 0.45 + R() * H * 0.45; if(ffx > 150 && ffx < W - 150 && ffy < H - 360) continue; glow(x, ffx, ffy, 14, "#d8ff7a", 0.7); }
  return {y: 380, fy: H - 360, dark: true}; };
function hibiscus(x, cx, cy, r, a){ x.save(); x.translate(cx, cy); x.rotate(a);
  for(var k = 0; k < 5; k++){ x.save(); x.rotate(k * TAU / 5); x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-r * 0.55, -r * 0.25, -r * 0.6, -r * 0.95, -r * 0.15, -r); x.quadraticCurveTo(0, -r * 1.08, r * 0.15, -r * 0.98); x.bezierCurveTo(r * 0.62, -r * 0.92, r * 0.5, -r * 0.2, 0, 0);
    x.fillStyle = rad(x, 0, 0, r * 0.05, r, ["#7a0016", "#c1121f", "#ff3d54", "#ff6b7d"]); x.fill(); x.strokeStyle = "rgba(120,0,20,.35)"; x.lineWidth = 1.2; x.stroke();
    x.strokeStyle = "rgba(255,190,200,.35)"; x.lineWidth = 1.4; for(var v = -2; v <= 2; v++){ x.beginPath(); x.moveTo(0, -r * 0.15); x.quadraticCurveTo(v * r * 0.12, -r * 0.55, v * r * 0.18, -r * 0.9); x.stroke(); } x.restore(); }
  x.fillStyle = rad(x, 0, 0, 0, r * 0.3, ["rgba(90,0,10,.8)", "rgba(90,0,10,0)"]); x.beginPath(); x.arc(0, 0, r * 0.3, 0, TAU); x.fill();
  x.strokeStyle = "#ffd1d6"; x.lineWidth = r * 0.05; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(r * 0.2, r * 0.3, r * 0.45, r * 0.75); x.stroke();
  for(var d = 0; d < 12; d++){ x.beginPath(); x.arc(r * 0.32 + Math.cos(d) * r * 0.08, r * 0.55 + Math.sin(d * 2) * r * 0.1 + d * r * 0.012, r * 0.035, 0, TAU); x.fillStyle = d % 3 ? "#ffd23f" : "#ff9f1c"; x.fill(); } x.restore(); }
function frangipani(x, cx, cy, r, a){ x.save(); x.translate(cx, cy); x.rotate(a);
  for(var k = 0; k < 5; k++){ x.save(); x.rotate(k * TAU / 5); x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(r * 0.5, -r * 0.1, r * 0.75, -r * 0.7, r * 0.2, -r * 0.95); x.bezierCurveTo(-r * 0.15, -r * 0.8, -r * 0.1, -r * 0.3, 0, 0);
    x.fillStyle = rad(x, 0, 0, r * 0.05, r, ["#ffc93c", "#ffe9a8", "#fffdf5", "#ffffff"]); x.shadowColor = "rgba(0,0,0,.18)"; x.shadowBlur = 8; x.fill(); x.shadowColor = "transparent"; x.strokeStyle = "rgba(200,170,100,.4)"; x.lineWidth = 1; x.stroke(); x.restore(); }
  x.restore(); }
D.bunga = function(x, W, H, P, R){ x.fillStyle = lin(x, 0, 0, W, H, [mix(P.a, "#ffffff", P.dk ? 0.1 : 0.3), P.a, P.b]); x.fillRect(0, 0, W, H);
  for(var r = 0; r < 6; r++){ x.fillStyle = "rgba(255,255,255," + (P.dk ? 0.025 : 0.08) + ")"; x.beginPath(); x.moveTo(W * 0.1 + r * 120, 0); x.lineTo(W * 0.1 + r * 120 + 60, 0); x.lineTo(W * 0.5 + r * 160, H); x.lineTo(W * 0.5 + r * 160 - 120, H); x.fill(); }
  bokeh(x, W, H, R, 26, ["#ff8fa3", "#ffd6a5", "#ffffff"], 20, 70, 0.14);
  var cluster = function(cx, cy, sc, rot){ for(var l = 0; l < 7; l++){ var a = rot + l * 0.9; leaf(x, cx, cy, a, 190 * sc, 52 * sc, "#3f8f4a", "#1f5a2c"); }
    hibiscus(x, cx, cy, 120 * sc, rot); frangipani(x, cx + 140 * sc * Math.cos(rot + 0.8), cy + 140 * sc * Math.sin(rot + 0.8), 70 * sc, rot); frangipani(x, cx + 150 * sc * Math.cos(rot - 0.9), cy + 150 * sc * Math.sin(rot - 0.9), 55 * sc, rot + 1);
    for(var b = 0; b < 3; b++){ var ba = rot + 2.2 + b * 0.5; x.save(); x.translate(cx + 210 * sc * Math.cos(ba), cy + 210 * sc * Math.sin(ba)); x.rotate(ba); leafP(x, 46 * sc, 14 * sc); x.fillStyle = lin(x, 0, -14, 0, 14, ["#ff6b7d", "#c1121f"]); x.fill(); x.restore(); } };
  cluster(110, 130, 1.05, 0.7); cluster(W - 100, H - 130, 1.05, 0.7 + PI); cluster(W - 70, 120, 0.62, 2.3); cluster(70, H - 110, 0.62, -0.9);
  for(var p = 0; p < 12; p++){ var px = 150 + R() * (W - 300), py = R() * H; if(py > 330 && py < H - 300) continue; x.save(); x.translate(px, py); x.rotate(R() * TAU); leafP(x, 34, 12); x.fillStyle = R() < 0.5 ? "rgba(255,90,110,.75)" : "rgba(255,248,230,.85)"; x.fill(); x.restore(); }
  return {y: 420, fy: H - 220}; };
D.kubah = function(x, W, H, P, R){ var hz = H - 290; sky(x, W, H, mix(P.b, "#1b1240", 0.4), mix(P.a, "#ff9a5a", 0.45), mix("#ffd29a", P.acc, 0.2));
  glow(x, W / 2, hz - 120, 520, "#ffd28a", 0.55); x.beginPath(); x.arc(W / 2, hz - 120, 120, 0, TAU); x.fillStyle = rad(x, W / 2, hz - 120, 10, 120, ["#fffbe6", "#ffd27a"]); x.fill();
  for(var c = 0; c < 9; c++){ var cx = R() * W, cy = 120 + R() * 420; x.fillStyle = "rgba(255,230,210," + (0.08 + R() * 0.12) + ")"; for(var k = 0; k < 5; k++){ x.beginPath(); x.ellipse(cx + k * 40 - 80, cy + Math.sin(k) * 8, 70, 18, 0, 0, TAU); x.fill(); } }
  var M = hz, cxm = W / 2, sh = function(cx, w, h){ dome(x, cx, M - 130, w, h); x.fillStyle = rad(x, cx - w * 0.2, M - 130 - h * 0.7, 4, w * 0.8, [mix(P.acc, "#ffffff", 0.55), P.acc, mix(P.acc, "#000", 0.45)]); x.fill(); };
  x.fillStyle = lin(x, cxm - 320, 0, cxm + 320, 0, ["#e8dcc6", "#fff6e6", "#cdbb9c"]); x.fillRect(cxm - 320, M - 140, 640, 140); x.fillRect(cxm - 120, M - 190, 240, 60);
  sh(cxm, 280, 200); sh(cxm - 220, 130, 100); sh(cxm + 220, 130, 100);
  [[cxm - 400], [cxm + 400]].forEach(function(m){ var mx = m[0]; x.fillStyle = lin(x, mx - 16, 0, mx + 16, 0, ["#d8c8a8", "#fff6e6", "#bba886"]); x.fillRect(mx - 16, M - 380, 32, 380); x.fillRect(mx - 26, M - 280, 52, 12); x.fillRect(mx - 24, M - 350, 48, 10);
    x.beginPath(); x.moveTo(mx - 16, M - 380); x.lineTo(mx, M - 445); x.lineTo(mx + 16, M - 380); x.fillStyle = metal(x, P.acc, mx - 16, 0, mx + 16, 0); x.fill(); });
  x.fillStyle = metal(x, P.acc, cxm - 10, 0, cxm + 10, 0); x.fillRect(cxm - 3, M - 372, 6, 44); x.beginPath(); x.arc(cxm, M - 384, 12, 0.6, TAU - 0.6); x.lineWidth = 5; x.strokeStyle = metal(x, P.acc, cxm - 12, 0, cxm + 12, 0); x.stroke();
  for(var a = -2; a <= 2; a++){ var ax = cxm + a * 110; x.beginPath(); x.moveTo(ax - 34, M); x.lineTo(ax - 34, M - 70); x.quadraticCurveTo(ax, M - 125, ax + 34, M - 70); x.lineTo(ax + 34, M); x.fillStyle = lin(x, 0, M - 120, 0, M, ["#ffcf7a", "#c9772e"]); x.fill(); }
  x.fillStyle = lin(x, 0, M, 0, H, [mix(P.b, "#2a3a5a", 0.4), mix(P.b, "#000", 0.4)]); x.fillRect(0, M, W, H - M);
  x.save(); x.beginPath(); x.rect(0, M, W, H - M); x.clip(); x.translate(0, M * 2); x.scale(1, -1); x.globalAlpha = 0.22; sh(cxm, 280, 200); sh(cxm - 220, 130, 100); sh(cxm + 220, 130, 100); x.fillStyle = lin(x, 0, M - 140, 0, M, ["rgba(255,246,230,0)", "rgba(255,246,230,.5)"]); x.fillRect(cxm - 320, M - 140, 640, 140); x.restore();
  for(var w = 0; w < 30; w++){ var wy = M + 10 + R() * (H - M - 20), ww = 40 + R() * 160, wx = R() * W; x.strokeStyle = "rgba(255,220,170," + (0.08 + R() * 0.2) + ")"; x.lineWidth = 2; x.beginPath(); x.moveTo(wx, wy); x.lineTo(wx + ww, wy); x.stroke(); }
  palm(x, 70, M, 260, mix(P.b, "#000", 0.6), 30); palm(x, W - 60, M, 230, mix(P.b, "#000", 0.6), -30);
  return {y: 330, fy: H - 690, dark: true}; };
D.konfeti = function(x, W, H, P, R){ x.fillStyle = rad(x, W / 2, H * 0.4, 50, H, [mix(P.a, "#ffffff", P.dk ? 0.15 : 0.35), P.a, P.b]); x.fillRect(0, 0, W, H);
  var C = ["#ff5d8f", "#ffd23f", "#3bceac", "#4d96ff", "#a06cd5", "#ff8c42", P.acc];
  for(var s = 0; s < 6; s++){ var c = C[s % C.length], y0 = R() * H; x.lineWidth = 16; x.lineCap = "round"; x.strokeStyle = al(c, 0.75); x.beginPath(); x.moveTo(-20, y0); for(var t = 0; t <= 1; t += 0.05) x.lineTo(t * (W + 40) - 20, y0 + Math.sin(t * 9 + s) * 50 + t * 120 * (s % 2 ? -1 : 1)); x.stroke();
    x.lineWidth = 4; x.strokeStyle = "rgba(255,255,255,.35)"; x.stroke(); }
  x.fillStyle = rad(x, W / 2, H * 0.52, 150, 520, [al(P.a, 0.92), al(P.a, 0.75), al(P.a, 0)]); x.fillRect(0, 0, W, H);
  var balloon = function(bx, by, r, c){ x.strokeStyle = "rgba(255,255,255,.6)"; x.lineWidth = 2; x.beginPath(); x.moveTo(bx, by + r * 1.2); for(var k = 0; k < 10; k++) x.lineTo(bx + Math.sin(k) * 10, by + r * 1.2 + k * 26); x.stroke();
    x.beginPath(); x.ellipse(bx, by, r * 0.86, r, 0, 0, TAU); x.fillStyle = rad(x, bx - r * 0.35, by - r * 0.4, r * 0.05, r * 1.3, [mix(c, "#ffffff", 0.6), c, mix(c, "#000000", 0.35)]); x.fill();
    x.beginPath(); x.moveTo(bx - 10, by + r + 14); x.lineTo(bx, by + r - 2); x.lineTo(bx + 10, by + r + 14); x.fill(); x.beginPath(); x.ellipse(bx - r * 0.35, by - r * 0.45, r * 0.12, r * 0.22, -0.5, 0, TAU); x.fillStyle = "rgba(255,255,255,.55)"; x.fill(); };
  [[120, 180, 86, 0], [250, 120, 70, 1], [80, 360, 60, 2], [W - 130, 170, 90, 3], [W - 260, 110, 66, 4], [W - 90, 370, 62, 5]].forEach(function(b){ balloon(b[0], b[1], b[2], C[b[3]]); });
  for(var i = 0; i < 300; i++){ var cx = R() * W, cy = R() * H; if(cy > 380 && cy < H - 260 && cx > 110 && cx < W - 110) continue; x.save(); x.translate(cx, cy); x.rotate(R() * TAU); var cc = C[Math.floor(R() * C.length)], k2 = R();
    if(k2 < 0.45){ x.fillStyle = lin(x, -10, 0, 10, 0, [cc, mix(cc, "#ffffff", 0.4), cc]); x.fillRect(-10, -4, 20, 8); } else if(k2 < 0.75){ x.beginPath(); x.arc(0, 0, 6, 0, TAU); x.fillStyle = cc; x.fill(); } else { x.strokeStyle = cc; x.lineWidth = 3; x.beginPath(); for(var q = 0; q < 12; q++) x.lineTo(q * 2, Math.sin(q) * 4); x.stroke(); } x.restore(); }
  for(var sp = 0; sp < 10; sp++){ var sx = R() * W, sy = R() < 0.5 ? R() * 340 : H - R() * 240; sparkle(x, sx, sy, 12 + R() * 14, "#fffbe8"); }
  return {y: 440, fy: H - 200}; };
D.gelombang = function(x, W, H, P, R){ var hz = H - 430; sky(x, W, H, mix(P.b, "#16206b", 0.3), mix(P.a, "#ff9e6d", 0.35), mix("#ffd29a", "#ff7b54", 0.3));
  glow(x, W / 2, hz, 420, "#ffcf7a", 0.6); x.save(); x.beginPath(); x.rect(0, 0, W, hz); x.clip(); x.beginPath(); x.arc(W / 2, hz + 20, 130, 0, TAU); x.fillStyle = rad(x, W / 2, hz, 10, 140, ["#fffbe6", "#ffd27a", "#ff9a4a"]); x.fill(); x.restore();
  for(var c = 0; c < 7; c++){ var cx = R() * W, cy = 80 + R() * (hz - 300); x.fillStyle = "rgba(255,225,210," + (0.1 + R() * 0.12) + ")"; for(var k = 0; k < 4; k++){ x.beginPath(); x.ellipse(cx + k * 50, cy + Math.cos(k) * 10, 90, 20, 0, 0, TAU); x.fill(); } }
  x.strokeStyle = "rgba(30,20,40,.6)"; x.lineWidth = 3; for(var b = 0; b < 6; b++){ var bx = 140 + R() * 300 + (b > 2 ? W * 0.45 : 0), by = 140 + R() * 160, s = 10 + R() * 10; x.beginPath(); x.moveTo(bx - s, by); x.quadraticCurveTo(bx - s / 2, by - s * 0.6, bx, by); x.quadraticCurveTo(bx + s / 2, by - s * 0.6, bx + s, by); x.stroke(); }
  var sea = [mix(P.a, "#0d6e8a", 0.5), mix(P.b, "#08445e", 0.5)];
  for(var l = 0; l < 8; l++){ var y0 = hz + l * 52, amp = 8 + l * 4, f = 0.008 + l * 0.0015, ph = R() * 6; x.beginPath(); x.moveTo(0, H); for(var wx = 0; wx <= W; wx += 12) x.lineTo(wx, y0 + Math.sin(wx * f + ph) * amp); x.lineTo(W, H); x.closePath();
    x.fillStyle = lin(x, 0, y0 - amp, 0, H, [mix(sea[0], "#ffb38a", 0.35 - l * 0.04), sea[1]]); x.fill();
    x.strokeStyle = "rgba(255,240,220," + (0.5 - l * 0.04) + ")"; x.lineWidth = 2.5; x.beginPath(); for(var wx2 = 0; wx2 <= W; wx2 += 12){ var yy = y0 + Math.sin(wx2 * f + ph) * amp; wx2 ? x.lineTo(wx2, yy) : x.moveTo(wx2, yy); } x.stroke(); }
  for(var s2 = 0; s2 < 60; s2++){ var sy = hz + 10 + Math.pow(R(), 1.5) * (H - hz - 40), sw = (30 + R() * 90) * (1 - (sy - hz) / (H - hz) * 0.4); x.fillStyle = "rgba(255,230,170," + (0.25 + R() * 0.45) + ")"; x.fillRect(W / 2 - sw / 2 + (R() - 0.5) * (sy - hz) * 0.5, sy, sw, 3); }
  return {y: 330, fy: H - 470}; };
D.minimal = function(x, W, H, P, R){ x.fillStyle = lin(x, 0, 0, 0, H, [mix(P.a, "#ffffff", P.dk ? 0.05 : 0.25), P.a]); x.fillRect(0, 0, W, H); grain(x, W, H, R, 9000, 0.05, P.dk);
  var M = metal(x, P.acc, 0, 0, W, H), ar = function(o){ x.beginPath(); x.moveTo(140 + o, H - 140 - o); x.lineTo(140 + o, 470); x.bezierCurveTo(140 + o, 300, W / 2 - 160, 260 + o, W / 2, 150 + o); x.bezierCurveTo(W / 2 + 160, 260 + o, W - 140 - o, 300, W - 140 - o, 470); x.lineTo(W - 140 - o, H - 140 - o); };
  x.save(); x.shadowColor = P.dk ? "rgba(0,0,0,.5)" : "rgba(80,60,20,.25)"; x.shadowBlur = 10; x.shadowOffsetY = 3; ar(0); x.strokeStyle = M; x.lineWidth = 4; x.stroke(); x.restore(); ar(16); x.strokeStyle = al(P.acc, 0.6); x.lineWidth = 1.5; x.stroke();
  x.save(); x.translate(W / 2, 150); star(x, 0, 0, 36, 8, 0.55); x.fillStyle = M; x.fill(); x.beginPath(); x.arc(0, 0, 9, 0, TAU); x.fillStyle = P.a; x.fill(); x.restore();
  for(var d = 0; d < 13; d++){ x.beginPath(); x.arc(W / 2 - 180 + d * 30, H - 100, d % 4 ? 3 : 5, 0, TAU); x.fillStyle = M; x.fill(); }
  return {y: 450, fy: H - 190, noFrame: true}; };
D.fanus = function(x, W, H, P, R){ x.fillStyle = lin(x, 0, 0, 0, H, [mix(P.dk ? P.b : "#140b2a", "#000", 0.15), P.dk ? P.a : "#2a1650", mix(P.dk ? P.b : "#140b2a", "#3a0f30", 0.4)]); x.fillRect(0, 0, W, H);
  bokeh(x, W, H, R, 50, ["#ffb347", "#ff6f91", "#ffd27a", "#7ad1ff"], 14, 70, 0.22); stars(x, W, 0, H, R, 120);
  var lantern = function(lx, ly, s, glass){ x.strokeStyle = metal(x, P.acc, lx - 3, 0, lx + 3, 0); x.lineWidth = 3; x.setLineDash([7, 5]); x.beginPath(); x.moveTo(lx, 0); x.lineTo(lx, ly - 120 * s); x.stroke(); x.setLineDash([]);
    glow(x, lx, ly, 260 * s, glass, 0.4); x.save(); x.translate(lx, ly); x.scale(s, s); var G = metal(x, P.acc, -60, -130, 60, 130);
    x.beginPath(); x.arc(0, -126, 14, PI, 0); x.lineWidth = 5; x.strokeStyle = G; x.stroke(); dome(x, 0, -80, 110, 46); x.fillStyle = G; x.fill(); x.fillRect(-58, -82, 116, 10);
    var body = [[-52, -72], [52, -72], [62, 30], [36, 70], [-36, 70], [-62, 30]]; x.beginPath(); body.forEach(function(p, i){ i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); }); x.closePath();
    x.fillStyle = rad(x, 0, -6, 6, 80, ["#fffbe0", mix(glass, "#ffffff", 0.35), glass, mix(glass, "#000", 0.45)]); x.fill(); x.lineWidth = 5; x.strokeStyle = G; x.stroke();
    x.lineWidth = 3; x.beginPath(); x.moveTo(-22, -72); x.lineTo(-24, 70); x.moveTo(22, -72); x.lineTo(24, 70); x.moveTo(-62, 30); x.lineTo(62, 30); x.stroke();
    x.beginPath(); x.moveTo(-8, -50); x.quadraticCurveTo(0, -64, 8, -50); x.quadraticCurveTo(0, -20, -8, -50); x.moveTo(-6, 0); x.arc(0, 0, 6, PI, TAU); x.lineWidth = 2; x.stroke();
    for(var d = 0; d < 6; d++){ x.beginPath(); x.arc(-45 + d * 18, 30, 3, 0, TAU); x.fillStyle = G; x.fill(); }
    x.beginPath(); x.moveTo(-36, 70); x.lineTo(36, 70); x.lineTo(10, 104); x.lineTo(-10, 104); x.closePath(); x.fillStyle = G; x.fill(); x.beginPath(); x.arc(0, 116, 9, 0, TAU); x.fill();
    x.fillStyle = "rgba(255,255,255,.35)"; x.beginPath(); x.moveTo(-46, -64); x.lineTo(-32, -64); x.lineTo(-40, 24); x.lineTo(-54, 24); x.fill(); x.restore(); };
  [[130, 330, 0.95, "#e63946"], [330, 230, 0.75, "#2a9d8f"], [540, 160, 0.62, "#f4a261"], [W - 330, 250, 0.8, "#457b9d"], [W - 130, 360, 1, "#9b5de5"]].forEach(function(l){ lantern(l[0], l[1], l[2], l[3]); });
  return {y: 560, fy: H - 160, dark: true}; };
D.kaabah = function(x, W, H, P, R){ sky(x, W, H, mix(P.dk ? P.b : "#0b1430", "#000", 0.2), P.dk ? P.a : "#1d2c55", mix("#3a3a6a", "#ffcf8a", 0.35)); stars(x, W, 0, H * 0.5, R, 160, [140, 300, W - 140, H]);
  var base = H - 150, top = base - 330; glow(x, W / 2, top + 60, 600, "#ffe2a8", 0.35);
  x.fillStyle = "rgba(255,240,215,.16)"; for(var a = 0; a < 10; a++){ var ax = 40 + a * 112, ay = top + 40; x.beginPath(); x.moveTo(ax, base - 120); x.lineTo(ax, ay + 40); x.quadraticCurveTo(ax + 46, ay - 20, ax + 92, ay + 40); x.lineTo(ax + 92, base - 120); x.fill(); }
  x.fillStyle = "rgba(255,210,140,.5)"; for(var l = 0; l < 10; l++){ glow(x, 86 + l * 112, top + 70, 30, "#ffd28a", 0.6); }
  [[90, 470], [W - 90, 470], [250, 420], [W - 250, 420]].forEach(function(m){ x.fillStyle = "rgba(230,220,200,.35)"; minaret(x, m[0], base - 110, m[1], 22); glow(x, m[0], base - 110 - m[1] * 0.92, 22, "#9fffb0", 0.8); });
  x.fillStyle = lin(x, 0, base - 120, 0, H, ["#d9d2c4", "#f4efe6", "#bdb4a4"]); x.beginPath(); x.moveTo(0, base - 110); x.lineTo(W, base - 110); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  for(var r = 0; r < 6; r++){ x.strokeStyle = "rgba(160,150,130,.35)"; x.lineWidth = 1.5; x.beginPath(); x.ellipse(W / 2 + 40, base + 10, 260 + r * 90, 40 + r * 22, 0, 0, TAU); x.stroke(); }
  var fx0 = W / 2 - 170, fx1 = W / 2 + 90, sx1 = W / 2 + 200, sk = 26;
  x.fillStyle = lin(x, fx0, 0, fx1, 0, ["#141414", "#2b2b2b", "#111"]); x.beginPath(); x.moveTo(fx0, top); x.lineTo(fx1, top - 6); x.lineTo(fx1, base + 6); x.lineTo(fx0, base); x.fill();
  x.fillStyle = lin(x, fx1, 0, sx1, 0, ["#0d0d0d", "#050505"]); x.beginPath(); x.moveTo(fx1, top - 6); x.lineTo(sx1, top + sk); x.lineTo(sx1, base - 10); x.lineTo(fx1, base + 6); x.fill();
  var bandY = top + 70, G = metal(x, "#d9b252", fx0, 0, sx1, 0); x.fillStyle = G; x.beginPath(); x.moveTo(fx0, bandY); x.lineTo(fx1, bandY - 5); x.lineTo(sx1, bandY + 30); x.lineTo(sx1, bandY + 66); x.lineTo(fx1, bandY + 41); x.lineTo(fx0, bandY + 46); x.fill();
  x.strokeStyle = "#1a1a1a"; x.lineWidth = 2; for(var q = fx0 + 8; q < fx1 - 8; q += 18){ x.beginPath(); x.moveTo(q, bandY + 30); x.quadraticCurveTo(q + 5, bandY + 8, q + 9, bandY + 28); x.quadraticCurveTo(q + 13, bandY + 40, q + 16, bandY + 18); x.stroke(); }
  x.fillStyle = metal(x, "#d9b252", fx1 - 110, 0, fx1 - 30, 0); x.fillRect(fx1 - 110, base - 170, 76, 150); x.strokeStyle = "rgba(60,40,10,.6)"; x.lineWidth = 2; x.strokeRect(fx1 - 102, base - 160, 60, 130); x.beginPath(); x.moveTo(fx1 - 72, base - 160); x.lineTo(fx1 - 72, base - 30); x.stroke();
  x.strokeStyle = "rgba(255,255,255,.05)"; x.lineWidth = 1; for(var v = fx0 + 20; v < fx1; v += 28){ x.beginPath(); x.moveTo(v, top); x.lineTo(v, base); x.stroke(); }
  x.fillStyle = "rgba(0,0,0,.25)"; x.beginPath(); x.ellipse(W / 2 + 20, base + 8, 220, 18, 0, 0, TAU); x.fill();
  return {y: 300, fy: H - 540, dark: true}; };
function scroll(x, cx, cy, s, flip, G, R){ x.save(); x.translate(cx, cy); x.scale(flip * s, s);
  var path = function(){ x.beginPath(); for(var t = 0; t <= 1.0001; t += 0.02){ var a = t * 3.2 * PI, r = 120 * (1 - t * 0.8); x.lineTo(130 - r * Math.cos(a) + t * 30, r * Math.sin(a) * 0.85 + t * 40); } };
  [[3, "rgba(0,0,0,.35)", 12], [-2, "rgba(255,255,255,.35)", 12], [0, G, 10]].forEach(function(L){ x.save(); x.translate(L[0], L[0]); path(); x.strokeStyle = L[1]; x.lineWidth = L[2]; x.lineCap = "round"; x.stroke(); x.restore(); });
  for(var k = 0; k < 9; k++){ var t = 0.06 + k * 0.1, a = t * 3.2 * PI, r = 120 * (1 - t * 0.8), px = 130 - r * Math.cos(a) + t * 30, py = r * Math.sin(a) * 0.85 + t * 40, an = a + (k % 2 ? 0.9 : -0.9) + PI / 2;
    x.save(); x.translate(px, py); x.rotate(an); [[2, "rgba(0,0,0,.3)"], [-1, "rgba(255,255,255,.3)"], [0, G]].forEach(function(L){ x.save(); x.translate(L[0], L[0]); leafP(x, 46 - k * 3, 14 - k); x.fillStyle = L[1]; x.fill(); x.restore(); });
    x.beginPath(); x.moveTo(4, 0); x.lineTo(36 - k * 3, 0); x.strokeStyle = "rgba(0,0,0,.25)"; x.lineWidth = 1.5; x.stroke(); x.restore(); } x.restore(); }
D.awan = function(x, W, H, P, R){ x.fillStyle = rad(x, W / 2, H / 2, 100, H * 0.8, [mix(P.a, "#ffffff", P.dk ? 0.1 : 0.2), P.a, P.b]); x.fillRect(0, 0, W, H); grain(x, W, H, R, 7000, 0.06);
  x.strokeStyle = "rgba(0,0,0,.05)"; x.lineWidth = 2; for(var g = 0; g < 70; g++){ x.beginPath(); var gy = R() * H; x.moveTo(0, gy); x.bezierCurveTo(W * 0.3, gy + 20, W * 0.6, gy - 20, W, gy + R() * 20); x.stroke(); }
  var G = metal(x, P.acc, -150, -150, 250, 250);
  scroll(x, W / 2 - 30, 130, 1, -1, G, R); scroll(x, W / 2 + 30, 130, 1, 1, G, R); x.save(); x.translate(0, H); x.scale(1, -1); scroll(x, W / 2 + 30, 130, 0.9, 1, G, R); scroll(x, W / 2 - 30, 130, 0.9, -1, G, R); x.restore();
  x.save(); x.translate(W / 2, 130); [[3, "rgba(0,0,0,.35)"], [-2, "rgba(255,255,255,.35)"], [0, G]].forEach(function(L){ x.save(); x.translate(L[0], L[0]); for(var k = 0; k < 8; k++){ x.rotate(PI / 4); leafP(x, 52, 18); x.fillStyle = L[1]; x.fill(); } x.restore(); });
  x.beginPath(); x.arc(0, 0, 14, 0, TAU); x.fillStyle = P.b; x.fill(); x.restore();
  x.save(); x.translate(W / 2, H - 130); [[3, "rgba(0,0,0,.35)"], [-2, "rgba(255,255,255,.35)"], [0, G]].forEach(function(L){ x.save(); x.translate(L[0], L[0]); for(var k = 0; k < 8; k++){ x.rotate(PI / 4); leafP(x, 44, 15); x.fillStyle = L[1]; x.fill(); } x.restore(); }); x.beginPath(); x.arc(0, 0, 12, 0, TAU); x.fillStyle = P.b; x.fill(); x.restore();
  [[90, 90, 1, 1], [W - 90, 90, -1, 1], [90, H - 90, 1, -1], [W - 90, H - 90, -1, -1]].forEach(function(c){ x.save(); x.translate(c[0], c[1]); x.scale(c[2] * 0.45, c[3] * 0.45); x.rotate(PI / 4); scroll(x, -60, 0, 1, 1, G, R); x.restore(); });
  return {y: 420, fy: H - 260}; };
D.batik = function(x, W, H, P, R){ x.fillStyle = lin(x, 0, 0, W, H, [P.a, P.b]); x.fillRect(0, 0, W, H);
  x.strokeStyle = "rgba(0,0,0,.12)"; x.lineWidth = 1; for(var c = 0; c < 90; c++){ var px = R() * W, py = R() * H; x.beginPath(); x.moveTo(px, py); for(var s = 0; s < 6; s++){ px += (R() - 0.5) * 70; py += (R() - 0.5) * 70; x.lineTo(px, py); } x.stroke(); }
  var C = [P.acc, "#e76f51", "#2a9d8f", "#e9c46a", "#8338ec", "#ff006e"], wax = P.dk ? "rgba(255,248,230,.9)" : "rgba(255,255,255,.95)";
  var flower = function(cx, cy, r, c1, c2, rot){ x.save(); x.translate(cx, cy); x.rotate(rot); for(var k = 0; k < 6; k++){ x.save(); x.rotate(k * TAU / 6); x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(r * 0.6, -r * 0.2, r * 0.7, -r * 0.9, 0, -r); x.bezierCurveTo(-r * 0.7, -r * 0.9, -r * 0.6, -r * 0.2, 0, 0);
      x.fillStyle = lin(x, 0, 0, 0, -r, [c2, c1]); x.fill(); x.strokeStyle = wax; x.lineWidth = 3; x.stroke(); x.lineWidth = 1.6; x.beginPath(); x.moveTo(0, -r * 0.18); x.bezierCurveTo(r * 0.35, -r * 0.3, r * 0.35, -r * 0.7, 0, -r * 0.8); x.bezierCurveTo(-r * 0.35, -r * 0.7, -r * 0.35, -r * 0.3, 0, -r * 0.18); x.stroke();
      for(var d = 0; d < 5; d++){ x.beginPath(); x.arc(0, -r * (0.3 + d * 0.11), 2.2, 0, TAU); x.fillStyle = wax; x.fill(); } x.restore(); }
    x.beginPath(); x.arc(0, 0, r * 0.22, 0, TAU); x.fillStyle = C[3]; x.fill(); x.strokeStyle = wax; x.lineWidth = 3; x.stroke(); for(var e = 0; e < 10; e++){ x.beginPath(); x.arc(Math.cos(e) * r * 0.1, Math.sin(e) * r * 0.1, 2, 0, TAU); x.fillStyle = "#6b2d0c"; x.fill(); } x.restore(); };
  var bleaf = function(cx, cy, a, l, c){ x.save(); x.translate(cx, cy); x.rotate(a); leafP(x, l, l * 0.3); x.fillStyle = c; x.fill(); x.strokeStyle = wax; x.lineWidth = 2.5; x.stroke(); x.lineWidth = 1.2; for(var k = 1; k < 9; k++){ x.beginPath(); x.moveTo(l * k / 10, -l * 0.2 + k * 0.5); x.lineTo(l * k / 10, l * 0.2 - k * 0.5); x.stroke(); } x.restore(); };
  var spots = [[120, 140, 120], [W - 120, 150, 110], [110, H - 150, 110], [W - 120, H - 140, 125], [W / 2, 110, 70], [W / 2, H - 100, 64], [60, H / 2, 70], [W - 60, H / 2, 70]];
  spots.forEach(function(s, i){ for(var l = 0; l < 4; l++) bleaf(x, s[0], s[1], i + l * 1.6, s[2] * 1.5, C[2]); });
  spots.forEach(function(s, i){ flower(s[0], s[1], s[2], C[(i + 1) % 6 === 3 ? 0 : (i + 1) % 6], mix(C[i % 6] === P.acc ? "#e76f51" : C[i % 6], "#ffffff", 0.35), i * 0.4); });
  for(var dd = 0; dd < 260; dd++){ var dx = R() * W, dy = R() * H; if(dx > 180 && dx < W - 180 && dy > 260 && dy < H - 250) continue; x.beginPath(); x.arc(dx, dy, 2.4, 0, TAU); x.fillStyle = al(wax.indexOf("248") > 0 ? "#fff8e6" : "#ffffff", 0.7); x.fill(); }
  x.fillStyle = rad(x, W / 2, H / 2, 150, 520, [al(P.a, 0.85), al(P.a, 0.6), al(P.a, 0)]); x.fillRect(0, 0, W, H);
  return {y: 400, fy: H - 230}; };
D.bayi = function(x, W, H, P, R){ var A = mix(P.a, "#ffffff", 0.45), B = mix(P.b, "#ffffff", 0.3); x.fillStyle = lin(x, 0, 0, 0, H, [A, B]); x.fillRect(0, 0, W, H);
  glow(x, 220, 230, 260, "#fff3b0", 0.6); x.save(); x.beginPath(); x.arc(220, 230, 100, 0, TAU); x.clip(); x.beginPath(); x.rect(0, 0, W, H); x.moveTo(265 + 92, 195); x.arc(265, 195, 92, 0, TAU); x.clip("evenodd"); x.fillStyle = lin(x, 120, 130, 320, 330, ["#fff8d6", "#ffe07a", "#f2b84b"]); x.fillRect(110, 120, 220, 220); x.restore();
  var mob = [[W / 2 - 300, 200, "#ffadc6", 0], [W / 2 - 120, 260, "#a0d8ff", 1], [W / 2 + 70, 180, "#ffe07a", 0], [W / 2 + 250, 270, "#c3b1ff", 1], [W - 120, 210, "#b6f0c8", 0]];
  x.strokeStyle = "rgba(120,110,140,.45)"; x.lineWidth = 2; x.beginPath(); x.moveTo(W / 2 - 340, 70); x.quadraticCurveTo(W / 2, 110, W - 80, 70); x.stroke();
  mob.forEach(function(m){ x.beginPath(); x.moveTo(m[0], 86); x.lineTo(m[0], m[1] - 40); x.stroke(); x.save(); x.translate(m[0], m[1]); x.shadowColor = "rgba(80,60,120,.25)"; x.shadowBlur = 14; x.shadowOffsetY = 6;
    if(m[3]){ x.beginPath(); x.moveTo(0, 32); x.bezierCurveTo(-46, 0, -30, -40, 0, -18); x.bezierCurveTo(30, -40, 46, 0, 0, 32); } else star(x, 0, 0, 40, 5, 0.48);
    x.fillStyle = rad(x, -10, -12, 2, 50, [mix(m[2], "#ffffff", 0.6), m[2], mix(m[2], "#000", 0.15)]); x.fill(); x.shadowColor = "transparent"; x.fillStyle = "rgba(255,255,255,.6)"; x.beginPath(); x.ellipse(-12, -12, 7, 11, -0.6, 0, TAU); x.fill(); x.restore(); });
  for(var s = 0; s < 30; s++){ var sx = R() * W, sy = R() * H; if(sx > 120 && sx < W - 120 && sy > 330 && sy < H - 330) continue; sparkle(x, sx, sy, 6 + R() * 8, "#ffffff"); }
  [[H - 40, 1, 0.95], [H - 110, 0.8, 0.75], [H - 170, 0.6, 0.55]].reverse().forEach(function(c, i){ x.fillStyle = "rgba(255,255,255," + c[2] + ")"; for(var k = -1; k < 9; k++){ x.beginPath(); x.arc(k * 150 + (i * 60), c[0], 110 * c[1] + (k % 2) * 30, 0, TAU); x.fill(); } });
  return {y: 430, fy: H - 300}; };
D.bokeh = function(x, W, H, P, R){ x.fillStyle = rad(x, W * 0.5, H * 0.4, 60, H * 0.85, [mix(P.a, "#ffffff", P.dk ? 0.12 : 0.2), P.a, mix(P.b, "#000", P.dk ? 0.3 : 0)]); x.fillRect(0, 0, W, H);
  var C = [P.acc, mix(P.acc, "#ff6f91", 0.5), "#ffd27a", mix(P.acc, "#7ad1ff", 0.5), "#ffffff"];
  bokeh(x, W, H, R, 30, C, 80, 200, 0.18);
  for(var h = 0; h < 40; h++){ var cx = R() * W, cy = R() * H, r = 20 + R() * 55, c = C[Math.floor(R() * C.length)]; if(cx > 160 && cx < W - 160 && cy > 360 && cy < H - 300 && R() > 0.3) continue;
    x.save(); x.translate(cx, cy); x.rotate(R()); x.beginPath(); for(var k = 0; k < 6; k++) x.lineTo(Math.cos(k * PI / 3) * r, Math.sin(k * PI / 3) * r); x.closePath(); x.fillStyle = al(c, 0.12 + R() * 0.15); x.fill(); x.strokeStyle = al(c, 0.35); x.lineWidth = 2; x.stroke(); x.restore(); }
  for(var l = 0; l < 5; l++){ var y0 = R() * H; x.strokeStyle = lin(x, 0, y0, W, y0 - 300, ["rgba(255,255,255,0)", al(P.acc, 0.35), "rgba(255,255,255,0)"]); x.lineWidth = 2 + R() * 3; x.beginPath(); x.moveTo(0, y0); x.lineTo(W, y0 - 300); x.stroke(); }
  for(var d = 0; d < 400; d++){ var dx = R() * W, dy = R() * H; x.fillStyle = al(P.acc, 0.3 + R() * 0.6); x.fillRect(dx, dy, 2, 2); }
  for(var s = 0; s < 14; s++){ var sx = R() * W, sy = R() * H; if(sx > 150 && sx < W - 150 && sy > 360 && sy < H - 300) continue; sparkle(x, sx, sy, 10 + R() * 18, mix(P.acc, "#ffffff", 0.6)); }
  return {y: 420, fy: H - 200}; };
D.songket = function(x, W, H, P, R){ x.fillStyle = lin(x, 0, 0, W, H, [mix(P.a, "#ffffff", 0.06), P.a, mix(P.a, "#ffffff", 0.1), P.b]); x.fillRect(0, 0, W, H);
  for(var s = -H; s < W; s += 26){ x.strokeStyle = "rgba(255,255,255,.035)"; x.lineWidth = 12; x.beginPath(); x.moveTo(s, 0); x.lineTo(s + H, H); x.stroke(); }
  var band = function(y0, h, flip){ var dark = mix(P.b, "#000", 0.35); x.fillStyle = dark; x.fillRect(0, y0, W, h);
    for(var yy = y0; yy < y0 + h; yy += 4) for(var xx = (yy / 4 % 2) * 3; xx < W; xx += 6){ x.fillStyle = R() < 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.1)"; x.fillRect(xx, yy, 3, 3); }
    var G = metal(x, P.acc, 0, y0, 0, y0 + h), thread = function(path, x0, ya, x1, yb){ x.save(); path(); x.clip(); for(var t = ya; t < yb; t += 3){ x.fillStyle = G; x.fillRect(x0, t, x1 - x0, 2); } x.restore(); path(); x.strokeStyle = "rgba(40,15,5,.6)"; x.lineWidth = 1; x.stroke(); };
    for(var px = 0; px < W; px += 72){ var tip = flip ? y0 : y0 + h, bs = flip ? y0 + h : y0; thread(function(){ x.beginPath(); x.moveTo(px, bs); x.lineTo(px + 36, tip + (flip ? 18 : -18)); x.lineTo(px + 72, bs); x.closePath(); }, px, Math.min(y0, tip), px + 72, y0 + h);
      x.fillStyle = dark; x.beginPath(); x.moveTo(px + 36, bs + (flip ? -26 : 26)); x.lineTo(px + 46, bs + (flip ? -46 : 46)); x.lineTo(px + 36, bs + (flip ? -66 : 66)); x.lineTo(px + 26, bs + (flip ? -46 : 46)); x.fill(); }
    x.fillStyle = G; x.fillRect(0, flip ? y0 - 6 : y0 + h, W, 6); for(var t2 = 0; t2 < W; t2 += 14){ x.beginPath(); x.moveTo(t2, flip ? y0 - 6 : y0 + h + 6); x.lineTo(t2 + 7, flip ? y0 - 16 : y0 + h + 16); x.lineTo(t2 + 14, flip ? y0 - 6 : y0 + h + 6); x.fill(); } };
  band(0, 190, false); band(H - 190, 190, true);
  for(var f = 0; f < 26; f++){ var fx = 60 + R() * (W - 120), fy = 240 + R() * (H - 480); if(fx > 150 && fx < W - 150) continue; x.save(); x.translate(fx, fy); x.rotate(R()); for(var k = 0; k < 8; k++){ x.rotate(PI / 4); leafP(x, 18, 7); x.fillStyle = metal(x, P.acc, -18, -18, 18, 18); x.fill(); } x.restore(); }
  return {y: 330, fy: H - 280, noFrame: true}; };

// common finish: a soft veil behind the text and a fine metallic double frame with corner stars
function finish(x, W, H, P, o){ var cy = (o.y + o.fy) / 2 + 40; x.fillStyle = rad(x, W / 2, cy, 60, 600, [al(o.dark ? "#000000" : P.a, o.dark ? 0.32 : 0.45), al(o.dark ? "#000000" : P.a, 0)]); x.fillRect(0, 0, W, H);
  if(o.noFrame) return; var M = metal(x, P.acc, 0, 0, W, H); x.strokeStyle = M; x.lineWidth = 4; x.strokeRect(30, 30, W - 60, H - 60); x.lineWidth = 1.5; x.strokeRect(44, 44, W - 88, H - 88);
  [[37, 37], [W - 37, 37], [37, H - 37], [W - 37, H - 37]].forEach(function(c){ x.fillStyle = M; star(x, c[0], c[1], 18, 8, 0.45); x.fill(); }); }

window.KadArt = {
  des: [["ketupat", "Ketupat", "Ketupat"], ["fanus", "Tanglung", "Lanterns"], ["sabit", "Bulan sabit", "Crescent"], ["kubah", "Masjid senja", "Mosque at dusk"], ["kaabah", "Kaabah", "Kaaba"], ["pelita", "Pelita", "Oil lamps"],
        ["bunga", "Bunga raya", "Hibiscus"], ["batik", "Batik", "Batik"], ["songket", "Songket", "Songket"], ["awan", "Awan larat", "Malay scroll"], ["geo", "Geometri", "Geometric"], ["gelombang", "Laut senja", "Sunset sea"],
        ["konfeti", "Konfeti & belon", "Confetti & balloons"], ["bokeh", "Kerlipan", "Sparkle"], ["bayi", "Si kecil", "Little one"], ["minimal", "Ringkas", "Minimal"]],
  draw: function(x, W, H, des, C, R){ var P = {a: C[1], b: C[2], acc: C[3], fg: C[4], dk: lum(C[1]) < 0.5}; x.save(); var o = (D[des] || D.geo)(x, W, H, P, R) || {y: 400, fy: H - 130}; x.restore(); x.save(); finish(x, W, H, P, o); x.restore(); return o; }
};
})();
