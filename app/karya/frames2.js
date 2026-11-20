/* Karya page frames v2 (mockup): procedural canvas art, no images. Layered like a material: base → texture → shading → ornament → highlight.
   KyF2.draw(g, W, H, style) paints the page; KyF2.box[style] gives the text box {t, s, b} (top, side, bottom) and KyF2.pal[style] the ink colours. */
(function(){
var PI = Math.PI, TAU = PI * 2;
function rnd(seed){ var x = seed % 2147483647; if(x <= 0) x += 2147483646; return function(){ x = x * 16807 % 2147483647; return (x - 1) / 2147483646; }; }
function lin(g, x0, y0, x1, y1, st){ var gr = g.createLinearGradient(x0, y0, x1, y1); st.forEach(function(s, i){ var A = Array.isArray(s); gr.addColorStop(A ? s[1] : i / (st.length - 1), A ? s[0] : s); }); return gr; }
function rad(g, x, y, r0, r1, st){ var gr = g.createRadialGradient(x, y, r0, x, y, r1); st.forEach(function(s, i){ gr.addColorStop(i / (st.length - 1), s); }); return gr; }
// metallic gold: banded highlights read as polished leaf
function gold(g, x0, y0, x1, y1){ return lin(g, x0, y0, x1, y1, ["#6e4e14", "#c99a3a", "#f8e3a0", "#b8862e", "#e9c96a", "#7d5a1a", "#d9b35a", "#fff1c2", "#a87a26"]); }
function grain(g, W, H, R, n, rgb, a, sz){ for(var i = 0; i < n; i++){ g.fillStyle = "rgba(" + rgb + "," + (R() * a) + ")"; var s = (sz || 1.6) * (0.5 + R()); g.fillRect(R() * W, R() * H, s, s); } }
function fibres(g, W, H, R, n, rgb, a){ g.lineWidth = 0.7; for(var i = 0; i < n; i++){ var x = R() * W, y = R() * H, l = 6 + R() * 22, an = R() * TAU; g.strokeStyle = "rgba(" + rgb + "," + (R() * a) + ")"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(an + 0.6) * l * 0.5, y + Math.sin(an + 0.6) * l * 0.5, x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke(); } }
function blotch(g, W, H, R, n, rgb, a, r0, r1){ for(var i = 0; i < n; i++){ var x = R() * W, y = R() * H, r = r0 + R() * (r1 - r0); g.fillStyle = rad(g, x, y, 0, r, ["rgba(" + rgb + "," + (a * (0.4 + R() * 0.6)) + ")", "rgba(" + rgb + ",0)"]); g.fillRect(x - r, y - r, r * 2, r * 2); } }
function vignette(g, W, H, rgb, a, k){ g.fillStyle = rad(g, W / 2, H / 2, Math.min(W, H) * (k || 0.35), Math.hypot(W, H) * 0.56, ["rgba(" + rgb + ",0)", "rgba(" + rgb + "," + a + ")"]); g.fillRect(0, 0, W, H); }
function star(g, x, y, r, n, inner, rot){ g.beginPath(); for(var i = 0; i < n * 2; i++){ var a = PI * i / n - PI / 2 + (rot || 0), rr = i % 2 ? r * inner : r; g.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } g.closePath(); }
function poly(g, pts, keep){ if(!keep) g.beginPath(); pts.forEach(function(p, i){ i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); }
// emboss: dark shadow below-right, light rim above-left, then the face
function emboss(g, path, face, d){ d = d || 2; g.save(); g.translate(d, d); path(); g.fillStyle = "rgba(60,35,5,.35)"; g.fill(); g.translate(-2 * d, -2 * d); path(); g.fillStyle = "rgba(255,250,225,.7)"; g.fill(); g.restore(); path(); g.fillStyle = face; g.fill(); }
function rules(g, x, y, w, h, list){ list.forEach(function(r){ g.strokeStyle = r[1]; g.lineWidth = r[2]; g.strokeRect(x + r[0], y + r[0], w - r[0] * 2, h - r[0] * 2); }); }
function corners(W, H, m, fn){ [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(function(c){ fn(c[0], c[1], c[2], c[3]); }); }
function leaf(g, x, y, a, l, w){ g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(l * 0.45, -w, l, 0); g.quadraticCurveTo(l * 0.45, w, 0, 0); g.restore(); }
// a scroll that curls into a spiral, leaves along it: the base of most of the corner work
// tapered stroke along points
function taper(g, pts, w0, w1, col){ g.strokeStyle = col; g.lineCap = "round"; g.lineJoin = "round"; for(var i = 1; i < pts.length; i++){ g.lineWidth = w0 + (w1 - w0) * i / (pts.length - 1); g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke(); } }
// a curl: starts at (x, y) heading a, turns `turns` times, sense k (+1 / -1)
function curl(x, y, a, r0, turns, k, n){ var out = [], c = Math.cos(a), s = Math.sin(a); n = n || 24; for(var i = 0; i <= n; i++){ var t = i / n, an = t * turns * TAU, r = r0 * (1 - t * 0.86), lx = r0 * 1.02 * Math.sin(an * 0) + r * Math.sin(an) + t * r0 * 0.3, ly = k * (r0 - r * Math.cos(an));
    out.push([x + lx * c - ly * s, y + lx * s + ly * c]); } return out; }
// a leaf with a turned-over half (shade), midrib and side veins
function leaf2(g, x, y, a, l, w, fill, line){ g.save(); g.translate(x, y); g.rotate(a);
  g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(l * 0.2, -w * 1.1, l * 0.7, -w * 0.9, l, -w * 0.15); g.bezierCurveTo(l * 0.75, w * 0.7, l * 0.25, w * 0.9, 0, 0); g.fillStyle = fill; g.fill();
  g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(l * 0.25, w * 0.9, l * 0.75, w * 0.7, l, -w * 0.15); g.quadraticCurveTo(l * 0.5, w * 0.05, 0, 0); g.fillStyle = "rgba(40,20,0,.22)"; g.fill();
  g.strokeStyle = line; g.lineWidth = Math.max(0.6, w * 0.09); g.globalAlpha *= 0.75; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(l * 0.5, -w * 0.1, l * 0.95, -w * 0.15);
  for(var v = 1; v <= 3; v++){ var vx = l * v * 0.22; g.moveTo(vx, -w * 0.05); g.lineTo(vx + l * 0.13, -w * 0.62); g.moveTo(vx, -w * 0.02); g.lineTo(vx + l * 0.12, w * 0.45); } g.stroke(); g.restore(); }
function bud(g, x, y, a, r, fill, line){ g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.ellipse(r * 0.9, 0, r * 0.9, r * 0.6, 0, 0, TAU); g.fillStyle = fill; g.fill();
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(r * 0.6, -r * 0.9, r * 0.9, -r * 0.2); g.moveTo(0, 0); g.quadraticCurveTo(r * 0.6, r * 0.9, r * 0.9, r * 0.2); g.strokeStyle = line; g.lineWidth = 1; g.stroke(); g.restore(); }
function bloom(g, x, y, r, fill, line, heart){ g.save(); g.translate(x, y); for(var k = 0; k < 6; k++){ g.rotate(TAU / 6); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(r * 0.3, -r * 0.55, r * 0.95, -r * 0.4, r, 0); g.bezierCurveTo(r * 0.95, r * 0.4, r * 0.3, r * 0.55, 0, 0); g.fillStyle = fill; g.fill(); g.strokeStyle = line; g.lineWidth = 0.8; g.stroke();
    g.beginPath(); g.moveTo(r * 0.2, 0); g.lineTo(r * 0.7, 0); g.stroke(); }
  g.beginPath(); g.arc(0, 0, r * 0.28, 0, TAU); g.fillStyle = heart; g.fill(); for(var d = 0; d < 8; d++){ var an = d * TAU / 8; g.beginPath(); g.arc(Math.cos(an) * r * 0.36, Math.sin(an) * r * 0.36, r * 0.05, 0, TAU); g.fillStyle = line; g.fill(); } g.restore(); }
// the main scroll: tapered spiral stem; tendrils curl off alternately, each with a leaf at its foot and a bud or curl tip; paired small leaves between; a bloom in the eye
function vine(g, x, y, sx, sy, sc, R, leafFill, line, lw, heart){ if(!sc) return; var pts = []; for(var t = 0; t <= 1.0001; t += 1 / 70){ var a = t * 3.6 * PI, r = sc * (1 - t * 0.82); pts.push([x + sx * (sc * 1.05 - r * Math.cos(a) + t * sc * 0.2), y + sy * (r * Math.sin(a) * 0.9 + t * sc * 0.35)]); }
  var n = pts.length, ang = function(i){ var p = pts[Math.max(0, i - 1)], q = pts[Math.min(n - 1, i + 1)]; return Math.atan2(q[1] - p[1], q[0] - p[0]); }, flip = sx * sy;
  for(var i = 5, side = 1; i < n - 10; i += 6, side = -side){ var p = pts[i], an = ang(i), f = 1 - i / n * 0.7;
    var tw = curl(p[0], p[1], an + side * 0.85, sc * 0.21 * f, 1.6, side, 30); taper(g, tw, lw * 0.75 * f + 0.4, 0.4, line);
    var e = tw[tw.length - 1]; if((i / 6) % 2 < 1) bud(g, tw[12][0], tw[12][1], an + side * 2, sc * 0.035 * f + 2, leafFill, line); else { g.beginPath(); g.arc(e[0], e[1], lw * 0.55 + 0.6, 0, TAU); g.fillStyle = line; g.fill(); }
    leaf2(g, p[0], p[1], an - side * (0.75 + R() * 0.3), sc * 0.32 * f, sc * 0.11 * f, leafFill, line); var u = tw[8]; leaf2(g, u[0], u[1], an + side * 1.9, sc * 0.14 * f, sc * 0.05 * f, leafFill, line);
    var m = pts[i + 3]; leaf2(g, m[0], m[1], ang(i + 3) + side * 0.55, sc * 0.15 * f, sc * 0.055 * f, leafFill, line); leaf2(g, m[0], m[1], ang(i + 3) - side * 0.6, sc * 0.12 * f, sc * 0.045 * f, leafFill, line); }
  taper(g, pts, lw * 2.2, lw * 0.5, line);
  for(var h = 3; h < n - 6; h += 4){ var q = pts[h], a2 = ang(h) + PI / 2; g.strokeStyle = "rgba(255,245,220,.35)"; g.lineWidth = 0.6; g.beginPath(); g.moveTo(q[0] + Math.cos(a2) * lw * 0.4, q[1] + Math.sin(a2) * lw * 0.4); g.lineTo(pts[h + 1][0] + Math.cos(a2) * lw * 0.4, pts[h + 1][1] + Math.sin(a2) * lw * 0.4); g.stroke(); }   // highlight on the stem
  var c = pts[n - 1]; bloom(g, c[0], c[1], sc * 0.15, leafFill, line, heart || "#e9c96a"); }

// ---------- 1. Manuskrip: aged parchment, burnt deckle edge, triple ink rule, hand-drawn fleurons ----------
function manuskrip(g, W, H, cp){ var R = rnd(11), vs = cp ? 78 : 130;
  g.fillStyle = lin(g, 0, 0, W, H, ["#f3e4bf", "#ead39f", "#f1deb2", "#dcc08a"]); g.fillRect(0, 0, W, H);
  blotch(g, W, H, R, 26, "150,100,40", 0.10, 60, 260); blotch(g, W, H, R, 40, "255,248,225", 0.18, 40, 160);
  fibres(g, W, H, R, 1600, "120,80,30", 0.16); grain(g, W, H, R, 9000, "90,60,20", 0.10);
  for(var i = 0; i < 70; i++){ var x = R() * W, y = R() * H, r = 1.5 + R() * 7; if(x > 200 && x < W - 200 && y > 260 && y < H - 260 && R() > 0.25) continue; g.fillStyle = rad(g, x, y, 0, r, ["rgba(130,70,20,.45)", "rgba(150,90,30,.12)", "rgba(150,90,30,0)"]); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }   // foxing
  vignette(g, W, H, "120,70,15", 0.38, 0.32);
  // burnt, torn edge: irregular path; outside it darkens to a scorched rim
  var e = []; var walk = function(x0, y0, x1, y1, n){ for(var k = 0; k < n; k++){ var t = k / n; e.push([x0 + (x1 - x0) * t + (R() - 0.5) * 9, y0 + (y1 - y0) * t + (R() - 0.5) * 9]); } };
  var m = 20; walk(m, m, W - m, m, 120); walk(W - m, m, W - m, H - m, 170); walk(W - m, H - m, m, H - m, 120); walk(m, H - m, m, m, 170);
  g.save(); g.beginPath(); g.rect(0, 0, W, H); poly(g, e, 1); g.clip("evenodd"); g.fillStyle = "#2a1a0c"; g.fillRect(0, 0, W, H); g.restore();
  g.save(); poly(g, e); g.clip(); g.lineWidth = 26; g.strokeStyle = "rgba(90,45,10,.35)"; g.filter = "blur(8px)"; poly(g, e); g.stroke(); g.filter = "none"; g.lineWidth = 3; g.strokeStyle = "rgba(60,30,8,.6)"; poly(g, e); g.stroke(); g.restore();
  // ink rules: thick, thin, hairline; drawn twice a hair apart = ink bleed
  var ink = "rgba(70,40,14,.86)"; [0, 0.7].forEach(function(o){ g.save(); g.translate(o, o * 0.6); rules(g, 70, 70, W - 140, H - 140, [[0, ink, 5], [14, ink, 1.6], [22, "rgba(70,40,14,.5)", 0.8]]); g.restore(); });
  corners(W, H, 70, function(x, y, sx, sy){ g.save(); g.translate(x + sx * 22, y + sy * 22);
    g.strokeStyle = ink; g.fillStyle = "rgba(255,245,215,.6)"; g.lineWidth = 2; g.beginPath(); g.arc(sx * 34, sy * 34, 26, 0, TAU); g.fill(); g.stroke();
    star(g, sx * 34, sy * 34, 20, 8, 0.45); g.fillStyle = "rgba(122,40,24,.85)"; g.fill(); g.beginPath(); g.arc(sx * 34, sy * 34, 5, 0, TAU); g.fillStyle = "#e9c96a"; g.fill();
    vine(g, sx * 60, sy * 18, sx, sy, vs, R, "rgba(92,58,22,.85)", ink, cp ? 1.7 : 2.2, "#7a2818");
    g.save(); g.translate(0, 0); g.transform(0, 1, 1, 0, 0, 0); vine(g, sy * 60, sx * 18, sy, sx, vs, R, "rgba(92,58,22,.85)", ink, cp ? 1.7 : 2.2, "#7a2818"); g.restore(); g.restore(); });
  [[W / 2, 92, 0], [W / 2, H - 92, 0], [92, H / 2, 1], [W - 92, H / 2, 1]].forEach(function(p){ g.save(); g.translate(p[0], p[1]); if(p[2]) g.rotate(PI / 2);
    g.fillStyle = "rgba(244,230,196,1)"; g.fillRect(-90, -10, 180, 20); g.strokeStyle = ink; g.lineWidth = 1.6; poly(g, [[-70, 0], [0, -11], [70, 0], [0, 11]]); g.stroke(); poly(g, [[-26, 0], [0, -6], [26, 0], [0, 6]]); g.fillStyle = "rgba(122,40,24,.85)"; g.fill();
    [-1, 1].forEach(function(d){ g.beginPath(); g.arc(d * 84, 0, 4, 0, TAU); g.fillStyle = ink; g.fill(); }); g.restore(); });
}

// ---------- 2. Iluminasi: mushaf-style gold-leaf border, lapis interlace, unwan cartouche, shamsa medallions ----------
function iluminasi(g, W, H){ var R = rnd(23), B = 96;
  g.fillStyle = lin(g, 0, 0, 0, H, ["#fbf6e6", "#f3e9cc"]); g.fillRect(0, 0, W, H); fibres(g, W, H, R, 700, "150,120,60", 0.08); grain(g, W, H, R, 5000, "120,90,40", 0.06); vignette(g, W, H, "160,120,50", 0.16, 0.4);
  // gold-leaf band with crackle
  g.save(); g.beginPath(); g.rect(30, 30, W - 60, H - 60); g.rect(30 + B, 30 + B, W - 60 - B * 2, H - 60 - B * 2); g.clip("evenodd");
  g.fillStyle = gold(g, 0, 0, W, H); g.fillRect(0, 0, W, H); grain(g, W, H, R, 6000, "255,245,200", 0.35, 1.2); grain(g, W, H, R, 4000, "90,60,10", 0.25, 1.4);
  g.strokeStyle = "rgba(110,75,20,.25)"; g.lineWidth = 0.6; for(var c = 0; c < 260; c++){ var x = R() * W, y = R() * H; g.beginPath(); g.moveTo(x, y); for(var s = 0; s < 4; s++){ x += (R() - 0.5) * 40; y += (R() - 0.5) * 40; g.lineTo(x, y); } g.stroke(); }
  // interlaced octagram tiles: lapis ground, white strap, turquoise heart
  var tile = function(cx, cy){ var r = B * 0.4; g.save(); g.translate(cx, cy);
    poly(g, [[-r, -r * 0.42], [-r * 0.42, -r], [r * 0.42, -r], [r, -r * 0.42], [r, r * 0.42], [r * 0.42, r], [-r * 0.42, r], [-r, r * 0.42]]); g.fillStyle = "#17357a"; g.fill();
    star(g, 0, 0, r * 0.98, 8, 0.72); g.strokeStyle = "#fff8e6"; g.lineWidth = 3; g.stroke(); g.strokeStyle = "#7d5a1a"; g.lineWidth = 0.8; g.stroke();
    star(g, 0, 0, r * 0.5, 8, 0.6, PI / 8); g.fillStyle = "#2aa198"; g.fill(); g.beginPath(); g.arc(0, 0, r * 0.14, 0, TAU); g.fillStyle = gold(g, -9, -9, 9, 9); g.fill();
    for(var k = 0; k < 4; k++){ g.rotate(PI / 2); g.beginPath(); g.arc(r * 1.25, 0, 5, 0, TAU); g.fillStyle = "#b8202a"; g.fill(); } g.restore(); };
  var mid = 30 + B / 2, step = B * 1.05, nx = Math.round((W - 60) / step), ny = Math.round((H - 60) / step), sx = (W - 60) / nx, sy = (H - 60) / ny;
  for(var i = 0; i < nx; i++){ tile(30 + sx * (i + 0.5), mid); tile(30 + sx * (i + 0.5), H - mid); }
  for(var j = 1; j < ny - 1; j++){ tile(mid, 30 + sy * (j + 0.5)); tile(W - mid, 30 + sy * (j + 0.5)); }
  g.restore();
  rules(g, 30, 30, W - 60, H - 60, [[-6, "#7d5a1a", 1], [0, "#3a2a10", 2.5], [B, "#3a2a10", 2.5], [B + 8, "#b8202a", 1.4], [B + 16, "#17357a", 0.9]]);
  for(var d = 0; d < (W - 300) / 14; d++){ [[150 + d * 14, 30 + B + 26], [150 + d * 14, H - 30 - B - 26]].forEach(function(p){ g.beginPath(); g.arc(p[0], p[1], 2.2, 0, TAU); g.fillStyle = "#b8202a"; g.fill(); }); }
  // shamsa medallions breaking out of the margin
  [[W / 2, 46], [W / 2, H - 46]].forEach(function(p){ g.save(); g.translate(p[0], p[1]); star(g, 0, 0, 50, 16, 0.78); g.fillStyle = gold(g, -58, -58, 58, 58); g.fill(); g.strokeStyle = "#3a2a10"; g.lineWidth = 1.5; g.stroke();
    g.beginPath(); g.arc(0, 0, 33, 0, TAU); g.fillStyle = "#17357a"; g.fill(); g.strokeStyle = "#fff8e6"; g.lineWidth = 2.5; g.stroke(); star(g, 0, 0, 23, 8, 0.55); g.fillStyle = gold(g, -26, -26, 26, 26); g.fill(); g.restore(); });
  // unwan: lobed cartouche for the title
  var cw = W - 2 * (B + 110), ch = 132, cx = W / 2, cy = 30 + B + 112;
  var cart = function(){ g.beginPath(); g.moveTo(cx - cw / 2 + 60, cy - ch / 2); g.lineTo(cx + cw / 2 - 60, cy - ch / 2); g.bezierCurveTo(cx + cw / 2 - 10, cy - ch / 2, cx + cw / 2 + 30, cy - 20, cx + cw / 2 + 30, cy); g.bezierCurveTo(cx + cw / 2 + 30, cy + 20, cx + cw / 2 - 10, cy + ch / 2, cx + cw / 2 - 60, cy + ch / 2);
    g.lineTo(cx - cw / 2 + 60, cy + ch / 2); g.bezierCurveTo(cx - cw / 2 + 10, cy + ch / 2, cx - cw / 2 - 30, cy + 20, cx - cw / 2 - 30, cy); g.bezierCurveTo(cx - cw / 2 - 30, cy - 20, cx - cw / 2 + 10, cy - ch / 2, cx - cw / 2 + 60, cy - ch / 2); g.closePath(); };
  g.save(); g.shadowColor = "rgba(80,50,10,.35)"; g.shadowBlur = 14; g.shadowOffsetY = 4; cart(); g.fillStyle = gold(g, cx - cw / 2, cy - ch, cx + cw / 2, cy + ch); g.fill(); g.restore();
  g.save(); g.translate(cx, cy); g.scale(0.93, 0.8); g.translate(-cx, -cy); cart(); g.fillStyle = "#17357a"; g.fill(); g.clip();
  g.strokeStyle = "rgba(233,201,106,.55)"; g.lineWidth = 1.2; for(var a = -cw; a < cw; a += 46){ g.beginPath(); for(var t = 0; t <= 1; t += 0.05){ var xx = cx + a + t * 46, yy = cy + Math.sin(t * TAU) * 34; t ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); leaf(g, cx + a + 23, cy, -0.7, 22, 7); g.fillStyle = "rgba(42,161,152,.7)"; g.fill(); }
  g.restore(); cart(); g.strokeStyle = "#3a2a10"; g.lineWidth = 2; g.stroke();
}

// ---------- 3. Kaligrafi Emas: laid cotton paper, embossed gold-foil acanthus corners, filigree rule ----------
function kaligrafi(g, W, H, cp){ var R = rnd(37), vs = cp ? 92 : 160;
  g.fillStyle = lin(g, 0, 0, W, H, ["#fffaf0", "#f7eedb"]); g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(170,140,90,.06)"; for(var y = 0; y < H; y += 7) g.fillRect(0, y, W, 1.4); g.fillStyle = "rgba(170,140,90,.07)"; for(var x = 40; x < W; x += 118) g.fillRect(x, 0, 2, H);   // laid + chain lines
  grain(g, W, H, R, 5000, "140,110,60", 0.05); vignette(g, W, H, "180,140,70", 0.14, 0.45);
  var G = gold(g, 0, 0, W, H);
  // filigree: twisted double line (two sines in counter-phase) with pearls
  var twist = function(x0, y0, x1, y1){ var L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L; [1, -1].forEach(function(s){ g.beginPath(); for(var d = 0; d <= L; d += 4){ var o = s * Math.sin(d / 9) * 3.2; var px = x0 + ux * d - uy * o, py = y0 + uy * d + ux * o; d ? g.lineTo(px, py) : g.moveTo(px, py); } g.strokeStyle = G; g.lineWidth = 1.6; g.stroke(); }); };
  var m = 74; twist(m + 150, m, W - m - 150, m); twist(m + 150, H - m, W - m - 150, H - m); twist(m, m + 150, m, H - m - 150); twist(W - m, m + 150, W - m, H - m - 150);
  g.strokeStyle = "rgba(176,132,48,.55)"; g.lineWidth = 1; g.strokeRect(m + 16, m + 16, W - 2 * m - 32, H - 2 * m - 32);
  for(var p = m + 170; p < W - m - 170; p += 26){ [m + 16, H - m - 16].forEach(function(yy){ g.beginPath(); g.arc(p, yy, 1.8, 0, TAU); g.fillStyle = G; g.fill(); }); }
  // embossed acanthus corners
  corners(W, H, m - 18, function(cx, cy, sx, sy){ g.save(); g.translate(cx, cy); g.scale(sx, sy); var G = gold(g, -20, -40, 170, 150);
    var path = function(){ g.beginPath(); for(var k = 0; k < 7; k++){ var an = 0.08 + k * 0.23, l = 210 - Math.abs(k - 3) * 34; g.moveTo(0, 0); g.save(); g.rotate(an); g.moveTo(0, 0); g.bezierCurveTo(l * 0.3, -l * 0.16, l * 0.75, -l * 0.12, l, 0); g.bezierCurveTo(l * 0.8, l * 0.05, l * 0.85, l * 0.14, l * 0.62, l * 0.1); g.bezierCurveTo(l * 0.5, l * 0.08, l * 0.3, l * 0.06, 0, 0); g.restore(); } };
    var path2 = function(){ g.beginPath(); for(var k = 0; k < 7; k++){ var an = 0.1 + k * 0.225, l = 190 - Math.abs(k - 3) * 30, c = Math.cos(an), s = Math.sin(an); var T = function(x, y){ return [x * c - y * s, x * s + y * c]; };
      var a = T(l * 0.3, -l * 0.085), b = T(l * 0.75, -l * 0.07), e = T(l, 0), f = T(l * 0.86, l * 0.02), h = T(l * 0.9, l * 0.07), i2 = T(l * 0.7, l * 0.05), j = T(l * 0.5, l * 0.04), k2 = T(l * 0.3, l * 0.03);
      g.moveTo(0, 0); g.bezierCurveTo(a[0], a[1], b[0], b[1], e[0], e[1]); g.bezierCurveTo(f[0], f[1], h[0], h[1], i2[0], i2[1]); g.bezierCurveTo(j[0], j[1], k2[0], k2[1], 0, 0); }
      g.moveTo(34, 34); g.arc(26, 26, 22, 0, TAU); };
    if(cp) g.scale(0.62, 0.62); vine(g, 120, 6, 1, 1, vs / (cp ? 0.62 : 1), R, G, "#9a6e1c", 2.4, "#fff3c4"); g.save(); g.transform(0, 1, 1, 0, 0, 0); vine(g, 120, 6, 1, 1, vs / (cp ? 0.62 : 1), R, G, "#9a6e1c", 2.4, "#fff3c4"); g.restore();
    emboss(g, path2, G, 2);
    g.strokeStyle = "rgba(110,75,20,.55)"; g.lineWidth = 0.9; for(var k = 0; k < 7; k++){ var an = 0.1 + k * 0.225, l = 190 - Math.abs(k - 3) * 30; g.save(); g.rotate(an); g.beginPath(); g.moveTo(18, 2); g.quadraticCurveTo(l * 0.5, -l * 0.04, l * 0.9, 0); g.stroke(); g.restore(); }
    g.beginPath(); g.arc(26, 26, 12, 0, TAU); g.fillStyle = "#fff6d8"; g.fill(); g.beginPath(); g.arc(26, 26, 7, 0, TAU); g.fillStyle = G; g.fill(); g.restore(); });
  // foil glints
  g.save(); for(var n = 0; n < 60; n++){ var gx = R() < 0.5 ? m + R() * 200 : W - m - R() * 200, gy = R() < 0.5 ? m + R() * 200 : H - m - R() * 200; g.fillStyle = "rgba(255,255,240," + (0.4 + R() * 0.5) + ")"; star(g, gx, gy, 1.5 + R() * 3, 4, 0.25); g.fill(); } g.restore();
  // top knot ornament
  g.save(); g.translate(W / 2, m); emboss(g, function(){ g.beginPath(); g.ellipse(0, 0, 60, 16, 0, 0, TAU); g.moveTo(26, 0); g.ellipse(0, 0, 26, 30, 0, 0, TAU); }, G, 1.5); g.beginPath(); g.ellipse(0, 0, 9, 9, 0, 0, TAU); g.fillStyle = "#fff6d8"; g.fill(); g.restore();
  g.save(); g.translate(W / 2, H - m); emboss(g, function(){ g.beginPath(); g.ellipse(0, 0, 60, 16, 0, 0, TAU); g.moveTo(26, 0); g.ellipse(0, 0, 26, 30, 0, 0, TAU); }, G, 1.5); g.restore();
}

// ---------- 4. Mihrab: modern editorial, ogee arch window, girih lines outside the arch, hanging lamp ----------
function mihrab(g, W, H){ var R = rnd(41);
  g.fillStyle = "#e9eee9"; g.fillRect(0, 0, W, H); grain(g, W, H, R, 7000, "40,60,50", 0.05);
  var m = 92, top = 330, aw = W - 2 * m;
  var arch = function(keep){ if(!keep) g.beginPath(); g.moveTo(m, H - m); g.lineTo(m, top); g.bezierCurveTo(m, top - 120, W / 2 - 140, top - 150, W / 2, top - 250); g.bezierCurveTo(W / 2 + 140, top - 150, W - m, top - 120, W - m, top); g.lineTo(W - m, H - m); g.closePath(); };
  // girih tessellation outside the arch
  g.save(); g.beginPath(); g.rect(0, 0, W, H); arch(1); g.clip("evenodd"); g.fillStyle = lin(g, 0, 0, W, H, ["#cfdcd3", "#b9cbc0"]); g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 1.3; var s = 64;
  for(var y = -s; y < H + s; y += s * 0.866 * 2){ for(var x = -s; x < W + s; x += s * 1.5){ [[x, y], [x + s * 0.75, y + s * 0.866]].forEach(function(c){ star(g, c[0], c[1], s * 0.5, 6, 0.58); g.stroke(); g.beginPath(); g.arc(c[0], c[1], s * 0.16, 0, TAU); g.stroke(); }); } }
  g.restore();
  // inner shadow of the window, then the paper inside
  g.save(); arch(); g.clip(); g.fillStyle = lin(g, 0, 0, 0, H, ["#fdfdfb", "#f6f7f3"]); g.fillRect(0, 0, W, H); grain(g, W, H, R, 4000, "40,60,50", 0.04);
  g.shadowColor = "rgba(20,50,40,.28)"; g.shadowBlur = 40; g.shadowOffsetY = 12; g.lineWidth = 40; g.strokeStyle = "rgba(0,0,0,1)"; g.save(); g.translate(0, -0.5); arch(); g.restore();
  g.beginPath(); g.rect(-100, -100, W + 200, H + 200); arch(1); g.fillStyle = "#000"; g.fill("evenodd"); g.restore();
  // offset double line (the "print" look) + lamp
  g.save(); g.translate(14, 14); arch(); g.strokeStyle = "rgba(47,125,107,.35)"; g.lineWidth = 2; g.stroke(); g.restore();
  arch(); g.strokeStyle = "#1f5e50"; g.lineWidth = 3; g.stroke();
  var lx = W / 2, ly = top - 240; g.strokeStyle = "#1f5e50"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx, ly + 120); g.stroke();
  g.save(); g.translate(lx, ly + 150); g.fillStyle = rad(g, 0, 10, 0, 120, ["rgba(240,200,110,.45)", "rgba(240,200,110,0)"]); g.fillRect(-120, -110, 240, 240);
  g.beginPath(); g.moveTo(-14, -30); g.lineTo(14, -30); g.lineTo(26, 0); g.quadraticCurveTo(0, 40, -26, 0); g.closePath(); g.fillStyle = lin(g, -26, 0, 26, 0, ["#1f5e50", "#3f9a83", "#1f5e50"]); g.fill();
  g.beginPath(); g.ellipse(0, 4, 9, 14, 0, 0, TAU); g.fillStyle = "#f6d98a"; g.fill(); g.restore();
  g.fillStyle = "#1f5e50"; g.fillRect(m, H - m + 26, 120, 4); g.fillRect(W - m - 120, H - m + 26, 120, 4);
}

// ---------- 5. Lailatulqadar: night sky, nebula, glinting stars, glowing crescent, lanterns, mosque skyline ----------
function lailatul(g, W, H, cp){ var R = rnd(53);
  g.fillStyle = lin(g, 0, 0, 0, H, ["#040a1f", "#0b1940", "#1d2c63", "#3c3f7c", [ "#6b4f7a", 1]]); g.fillRect(0, 0, W, H);
  [[0.2, 0.25, "120,90,200"], [0.8, 0.5, "40,140,170"], [0.4, 0.7, "170,80,150"]].forEach(function(n){ g.fillStyle = rad(g, W * n[0], H * n[1], 0, 520, ["rgba(" + n[2] + ",.16)", "rgba(" + n[2] + ",0)"]); g.fillRect(0, 0, W, H); });
  blotch(g, W, H, R, 30, "150,170,255", 0.05, 80, 220);
  var tb = [200, 420, W - 200, H - 360];   // text block: dimmer, smaller stars
  for(var k = 0; k < 900; k++){ var x = R() * W, y = R() * H * 0.86, inT = x > tb[0] && x < tb[2] && y > tb[1] && y < tb[3]; if(inT && R() > 0.15) continue;
    var r = Math.pow(R(), 3) * 2.6 + 0.3; g.fillStyle = "rgba(255,250,235," + ((inT ? 0.15 : 0.3) + R() * (inT ? 0.2 : 0.7)) + ")"; g.beginPath(); g.arc(x, y, inT ? r * 0.6 : r, 0, TAU); g.fill(); }
  for(var b = 0; b < 16; b++){ var bx = R() * W, by = R() * H * 0.75; if(bx > tb[0] - 40 && bx < tb[2] + 40 && by > tb[1] - 40 && by < tb[3]) continue; g.fillStyle = rad(g, bx, by, 0, 26, ["rgba(255,250,230,.9)", "rgba(200,220,255,.18)", "rgba(200,220,255,0)"]); g.fillRect(bx - 26, by - 26, 52, 52);
    g.fillStyle = "rgba(255,255,255,.8)"; star(g, bx, by, 18, 4, 0.08); g.fill(); }
  // crescent: glow, earthshine disc, lit limb
  var cx = W - 230, cy = 250; g.fillStyle = rad(g, cx, cy, 40, 260, ["rgba(250,225,150,.35)", "rgba(250,225,150,0)"]); g.fillRect(cx - 260, cy - 260, 520, 520);
  g.beginPath(); g.arc(cx, cy, 84, 0, TAU); g.fillStyle = "rgba(160,170,210,.06)"; g.fill();
  g.save(); g.beginPath(); g.arc(cx, cy, 84, 0, TAU); g.clip(); g.beginPath(); g.rect(0, 0, W, H); g.moveTo(cx + 40 + 76, cy - 24); g.arc(cx + 40, cy - 24, 76, 0, TAU); g.clip("evenodd"); g.fillStyle = lin(g, cx - 84, cy, cx + 20, cy, ["#fff6d2", "#f2cf6b", "#c99a3a"]); g.fillRect(cx - 90, cy - 90, 180, 180); g.restore();
  // hanging fanous lanterns
  (cp ? [[200, 130, 0.62], [320, 95, 0.48], [430, 140, 0.4]] : [[230, 210, 1], [400, 150, 0.75], [560, 230, 0.6]]).forEach(function(L){ var lx = L[0], ly = L[1], s = L[2]; g.strokeStyle = "rgba(233,201,106,.75)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx, ly - 70 * s); g.stroke();
    g.save(); g.translate(lx, ly); g.scale(s, s); g.fillStyle = rad(g, 0, 10, 0, 160, ["rgba(255,190,90,.45)", "rgba(255,170,70,0)"]); g.fillRect(-160, -150, 320, 320);
    var G = gold(g, -40, -80, 40, 80); poly(g, [[-14, -78], [14, -78], [6, -68], [-6, -68]]); g.fillStyle = G; g.fill(); poly(g, [[-30, -60], [30, -60], [40, -20], [30, 40], [-30, 40], [-40, -20]]); g.fillStyle = rad(g, 0, -6, 4, 50, ["#fff3c4", "#ffbe5a", "#c96a1a"]); g.fill();
    g.strokeStyle = G; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(-40, -20); g.lineTo(40, -20); g.moveTo(0, -60); g.lineTo(0, 40); g.moveTo(-30, 40); g.lineTo(-40, -20); g.stroke();
    poly(g, [[-30, 40], [30, 40], [14, 62], [-14, 62]]); g.fillStyle = G; g.fill(); g.beginPath(); g.arc(0, 70, 7, 0, TAU); g.fill(); g.restore(); });
  // mosque skyline with lit windows and ground haze
  g.save(); if(cp){ g.fillStyle = "#04081a"; g.beginPath(); g.moveTo(0, H); for(var hx0 = 0; hx0 <= W; hx0 += 40) g.lineTo(hx0, H - 70 - Math.abs(Math.sin(hx0 * 0.011)) * 22); g.lineTo(W, H); g.fill(); g.translate(W / 2, H - 40); g.scale(0.5, 0.5); g.translate(-W / 2, -(H - 40)); }
  var gy = H - 150; g.fillStyle = rad(g, W / 2, H, 0, 700, ["rgba(255,180,110,.25)", "rgba(255,180,110,0)"]); g.fillRect(0, H - 700, W, 700);
  var sil = lin(g, 0, gy - 300, 0, H, ["#0b1230", "#04081a"]); g.fillStyle = sil;
  var dome = function(x, w, h){ g.beginPath(); g.moveTo(x - w / 2, gy); g.bezierCurveTo(x - w / 2, gy - h * 0.7, x - w * 0.1, gy - h * 0.8, x, gy - h); g.bezierCurveTo(x + w * 0.1, gy - h * 0.8, x + w / 2, gy - h * 0.7, x + w / 2, gy); g.fill(); g.fillRect(x - 1.5, gy - h - 26, 3, 26); g.beginPath(); g.arc(x, gy - h - 30, 5, 0, TAU); g.fill(); };
  var minaret = function(x, h){ g.fillRect(x - 12, gy - h, 24, h); g.fillRect(x - 18, gy - h * 0.72, 36, 8); g.beginPath(); g.moveTo(x - 12, gy - h); g.lineTo(x, gy - h - 50); g.lineTo(x + 12, gy - h); g.fill(); };
  g.fillRect(0, gy, W, H - gy); g.fillRect(W / 2 - 300, gy - 110, 600, 110); dome(W / 2, 300, 300); dome(W / 2 - 230, 140, 190); dome(W / 2 + 230, 140, 190); minaret(W / 2 - 390, 380); minaret(W / 2 + 390, 380);
  g.beginPath(); for(var hx = 0; hx <= W; hx += 40) g.lineTo(hx, gy - 20 - Math.abs(Math.sin(hx * 0.013)) * 40 - (hx < 260 || hx > W - 260 ? 50 : 0)); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.fillStyle = "#ffd27a"; for(var w = -4; w <= 4; w++){ g.globalAlpha = 0.55 + R() * 0.45; g.beginPath(); g.moveTo(W / 2 + w * 56 - 9, gy - 24); g.lineTo(W / 2 + w * 56 - 9, gy - 62); g.arc(W / 2 + w * 56, gy - 62, 9, PI, 0); g.lineTo(W / 2 + w * 56 + 9, gy - 24); g.fill(); } g.globalAlpha = 1;
  g.restore();
  // fine gold frame with star corners
  g.strokeStyle = "rgba(242,207,107,.55)"; g.lineWidth = 1.5; g.strokeRect(46, 46, W - 92, H - 92); g.strokeStyle = "rgba(242,207,107,.3)"; g.strokeRect(56, 56, W - 112, H - 112);
  corners(W, H, 51, function(x, y){ g.fillStyle = gold(g, x - 16, y - 16, x + 16, y + 16); star(g, x, y, 16, 8, 0.45); g.fill(); });
}

// ---------- 6. Songket: woven maroon silk, gold-thread pucuk rebung, bunga tabur ----------
function songket(g, W, H){ var R = rnd(67), B = 120;
  g.fillStyle = lin(g, 0, 0, W, H, ["#fff7e8", "#f6e7c9"]); g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(160,110,60,.06)"; g.lineWidth = 1; for(var i = 0; i < W + H; i += 5){ g.beginPath(); g.moveTo(i, 0); g.lineTo(i - H, H); g.stroke(); } grain(g, W, H, R, 4000, "120,70,30", 0.05);
  // woven band: warp/weft ticks give a cloth surface
  g.save(); g.beginPath(); g.rect(0, 0, W, H); g.rect(B, B, W - 2 * B, H - 2 * B); g.clip("evenodd");
  g.fillStyle = lin(g, 0, 0, W, H, ["#5c0c1c", "#7a1426", "#5a0a1a", "#6e1022"]); g.fillRect(0, 0, W, H);
  for(var y = 0; y < H; y += 4) for(var x = (y / 4) % 2 * 3; x < W; x += 6){ if(x > B && x < W - B && y > B && y < H - B) continue; g.fillStyle = R() < 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.08)"; g.fillRect(x, y, 3, 3); }
  // gold-thread fill: horizontal metallic threads inside a motif clip
  var threads = function(path, x0, y0, x1, y1){ g.save(); path(); g.clip(); var G = gold(g, x0, y0, x1, y1); for(var t = y0; t < y1; t += 3){ g.fillStyle = G; g.fillRect(x0, t, x1 - x0, 2); } g.restore(); g.save(); path(); g.strokeStyle = "rgba(60,20,5,.55)"; g.lineWidth = 1; g.stroke(); g.restore(); };
  // pucuk rebung: tall triangles pointing inward, with an inner diamond lattice
  var rebung = function(cx, cy, rot){ g.save(); g.translate(cx, cy); g.rotate(rot);
    var tri = function(){ g.beginPath(); g.moveTo(-34, 0); g.lineTo(0, 92); g.lineTo(34, 0); g.closePath(); }; threads(tri, -34, 0, 34, 92);
    g.strokeStyle = "#5a0a1a"; g.lineWidth = 2; g.beginPath(); g.moveTo(-17, 16); g.lineTo(0, 54); g.lineTo(17, 16); g.moveTo(0, 0); g.lineTo(0, 30); g.stroke();
    g.beginPath(); g.moveTo(0, 26); g.lineTo(7, 36); g.lineTo(0, 46); g.lineTo(-7, 36); g.closePath(); g.fillStyle = "#5a0a1a"; g.fill(); g.restore(); };
  var s2 = 76; for(var px = B + s2 / 2; px < W - B; px += s2){ rebung(px, 18, 0); rebung(px, H - 18, PI); }
  for(var py = B + s2 / 2; py < H - B; py += s2){ rebung(18, py, -PI / 2); rebung(W - 18, py, PI / 2); }
  corners(W, H, B / 2, function(x, y){ threads(function(){ g.beginPath(); for(var k = 0; k < 8; k++){ g.save(); g.translate(x, y); g.rotate(k * PI / 4); g.moveTo(0, 0); g.quadraticCurveTo(14, -18, 0, -44); g.quadraticCurveTo(-14, -18, 0, 0); g.restore(); } }, x - 46, y - 46, x + 46, y + 46);
    g.beginPath(); g.arc(x, y, 8, 0, TAU); g.fillStyle = "#5a0a1a"; g.fill(); });
  g.restore();
  // gigi yu teeth along the inner edge + gold piping
  g.fillStyle = gold(g, 0, 0, W, H); for(var t2 = B; t2 < W - B; t2 += 16){ poly(g, [[t2, B], [t2 + 8, B + 10], [t2 + 16, B]]); g.fill(); poly(g, [[t2, H - B], [t2 + 8, H - B - 10], [t2 + 16, H - B]]); g.fill(); }
  for(var t3 = B; t3 < H - B; t3 += 16){ poly(g, [[B, t3], [B + 10, t3 + 8], [B, t3 + 16]]); g.fill(); poly(g, [[W - B, t3], [W - B - 10, t3 + 8], [W - B, t3 + 16]]); g.fill(); }
  rules(g, B, B, W - 2 * B, H - 2 * B, [[-2, gold(g, 0, 0, W, H), 4], [22, "rgba(122,20,38,.5)", 1.2]]);
  // bunga tabur scattered lightly on the body
  for(var f = 0; f < 160; f++){ var fx = B + 22 + R() * (W - 2 * B - 44), fy = B + 22 + R() * (H - 2 * B - 44); if(fx > B + 52 && fx < W - B - 52 && fy > B + 52 && fy < H - B - 52) continue;   // only in the margin strip, never under text
    g.save(); g.globalAlpha = 0.7; g.translate(fx, fy); g.rotate(R()); g.globalAlpha = 0.55; for(var k = 0; k < 8; k++){ g.rotate(PI / 4); leaf(g, 0, 0, 0, 14, 7); g.fillStyle = gold(g, 0, -6, 16, 6); g.fill(); } g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fillStyle = "#7a1426"; g.fill(); g.restore(); }
}

window.KyF2 = {
  draw: function(g, W, H, s, cp){ ({klasik: manuskrip, qurani: iluminasi, kursif: kaligrafi, moden: mihrab, malam: lailatul, songket: songket}[s] || manuskrip)(g, W, H, cp); },
  // compact: for long pieces the ornament shrinks and the text box grows (tw = title width)
  boxC: {klasik: {t: 250, s: 150, b: 290, f: 116, tw: 760}, kursif: {t: 250, s: 150, b: 290, f: 124, tw: 760}, malam: {t: 260, s: 150, b: 200, f: 60, tw: 640}},
  box: {klasik: {t: 200, s: 170, b: 200, f: 116, tw: 600}, qurani: {t: 300, s: 200, b: 240, f: 168, titleIn: 1}, kursif: {t: 210, s: 170, b: 220, f: 124, tw: 600}, moden: {t: 330, s: 170, b: 160, f: 120}, malam: {t: 420, s: 200, b: 400, f: 70}, songket: {t: 200, s: 190, b: 200, f: 160}},
  pal: {klasik: {ink: "#3a2410", head: "#5a2a10", acc: "#7a2818"}, qurani: {ink: "#1c2a3a", head: "#f8e3a0", acc: "#b8202a"}, kursif: {ink: "#3a2f22", head: "#9a6e1c", acc: "#b98a2e"},
        moden: {ink: "#22302b", head: "#1f5e50", acc: "#2f7d6b"}, malam: {ink: "#eef1fb", head: "#f2cf6b", acc: "#f2cf6b"}, songket: {ink: "#3b1a14", head: "#7a1426", acc: "#a8781e"}},
  names: {klasik: ["Manuskrip", "Manuscript"], qurani: ["Iluminasi", "Illumination"], kursif: ["Kaligrafi emas", "Gold calligraphy"], moden: ["Mihrab", "Mihrab"], malam: ["Lailatulqadar", "Night of Power"], songket: ["Songket tenun", "Woven songket"]}
};
})();
