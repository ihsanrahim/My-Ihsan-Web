/* My Ihsan 0.5.99 (owner): the complete tutorial as a PDF book in Books. Nothing is bundled: when you tap 📘 My Ihsan guide in Books,
   this file loads, takes every step of the Complete tour (tour/tour.js), and draws them chapter by chapter onto framed A4 pages
   (a cover, contents, a page per chapter start, numbered steps with where to find each thing). The PDF is saved in the library once
   per app version and language, so later taps just open it.
   IhsanGuide.build(G) -> Promise<Uint8Array>. G = {en, ver, L2x, steps:[{id,ch,tier,go,ms,en}], chapters:[[id,icon,ms,en]], where(go)} */
(function(){ "use strict";
var W = 1000, H = 1414, GOLD = "#b8912f", INK = "#1f2d27", PAPER = "#fbf7ec", GREEN = "#1f6b45", MUT = "#7a7464";
function pdf(pages){ var PW = (210*72/25.4).toFixed(2), PH = (297*72/25.4).toFixed(2), objs = ["<< /Type /Catalog /Pages 2 0 R >>", null], kids = [];
  pages.forEach(function(cv){ var jb = atob(cv.toDataURL("image/jpeg", 0.82).split(",")[1]), pi = objs.length + 1, cs = "q "+PW+" 0 0 "+PH+" 0 0 cm /Im0 Do Q"; kids.push(pi+" 0 R");
    objs.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+PW+" "+PH+"] /Resources << /XObject << /Im0 "+(pi+1)+" 0 R >> >> /Contents "+(pi+2)+" 0 R >>");
    objs.push("<< /Type /XObject /Subtype /Image /Width "+cv.width+" /Height "+cv.height+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+jb.length+" >>\nstream\n"+jb+"\nendstream");
    objs.push("<< /Length "+cs.length+" >>\nstream\n"+cs+"\nendstream"); });
  objs[1] = "<< /Type /Pages /Kids ["+kids.join(" ")+"] /Count "+pages.length+" >>";
  var out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", off = []; objs.forEach(function(o, i){ off.push(out.length); out += (i+1)+" 0 obj\n"+o+"\nendobj\n"; });
  var xr = out.length; out += "xref\n0 "+(objs.length+1)+"\n0000000000 65535 f \n"+off.map(function(o){ return ("0000000000"+o).slice(-10)+" 00000 n \n"; }).join("")+"trailer\n<< /Size "+(objs.length+1)+" /Root 1 0 R >>\nstartxref\n"+xr+"\n%%EOF";
  var u8 = new Uint8Array(out.length); for(var i = 0; i < out.length; i++) u8[i] = out.charCodeAt(i) & 255; return u8; }
function page(){ var c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d");
  x.fillStyle = PAPER; x.fillRect(0, 0, W, H); x.strokeStyle = GOLD; x.lineWidth = 5; x.strokeRect(32, 32, W-64, H-64); x.lineWidth = 1.5; x.strokeRect(46, 46, W-92, H-92);
  [[39,39],[W-39,39],[39,H-39],[W-39,H-39]].forEach(function(p){ x.save(); x.translate(p[0], p[1]); x.fillStyle = GOLD; for(var k = 0; k < 2; k++){ x.save(); x.rotate(k*Math.PI/4); x.fillRect(-13, -13, 26, 26); x.restore(); } x.fillStyle = PAPER; x.beginPath(); x.arc(0, 0, 8, 0, 7); x.fill(); x.restore(); });
  return {c:c, x:x}; }
function wrap(x, t, w, font){ x.font = font; var out = []; String(t||"").split("\n").forEach(function(par){ var words = par.split(/\s+/), cur = ""; words.forEach(function(wd){ var tt = cur ? cur+" "+wd : wd; if(x.measureText(tt).width > w && cur){ out.push(cur); cur = wd; } else cur = tt; }); out.push(cur); }); return out; }
function foot(p, G, n){ var x = p.x; x.strokeStyle = GOLD; x.lineWidth = 1; x.beginPath(); x.moveTo(90, H-95); x.lineTo(W-90, H-95); x.stroke();
  x.fillStyle = MUT; x.font = "17px sans-serif"; x.textAlign = "left"; x.fillText("My Ihsan "+G.ver+" · "+G.L2x("Panduan lengkap","Complete guide"), 90, H-68); x.textAlign = "right"; x.fillText(String(n), W-90, H-68); x.textAlign = "left"; }
window.IhsanGuide = {build:function(G){ return new Promise(function(res){
  var L = G.L2x, pages = [], chs = G.chapters.filter(function(c){ return G.steps.some(function(s){ return s.ch === c[0]; }); });
  // cover
  var p = page(), x = p.x; x.textAlign = "center";
  x.fillStyle = GREEN; x.beginPath(); x.arc(W/2, 400, 120, 0, 7); x.fill(); x.strokeStyle = GOLD; x.lineWidth = 6; x.stroke();
  x.fillStyle = GOLD; x.font = "bold 92px serif"; x.fillText("☾", W/2 - 4, 432);
  x.fillStyle = INK; x.font = "bold 76px serif"; x.fillText("My Ihsan", W/2, 640);
  x.fillStyle = GOLD; x.font = "bold 34px sans-serif"; x.fillText(L("PANDUAN LENGKAP", "THE COMPLETE GUIDE"), W/2, 700);
  x.fillStyle = MUT; x.font = "26px sans-serif"; wrap(x, L("Setiap halaman, setiap butang, langkah demi langkah. Sama seperti Lawatan Lengkap di dalam aplikasi, untuk dibaca bila-bila masa.", "Every page and every button, step by step. The same as the Complete tour inside the app, to read any time."), 700, "26px sans-serif").forEach(function(l, i){ x.fillText(l, W/2, 790 + i*38); });
  x.fillStyle = GREEN; x.font = "24px sans-serif"; x.fillText(G.steps.length + L(" langkah · ", " steps · ") + chs.length + L(" bab", " chapters") + " · " + L("Versi ", "Version ") + G.ver, W/2, 1000);
  x.fillStyle = MUT; x.font = "20px sans-serif"; x.fillText(L("Cari: ☰ menu kiri · 🔍 carian · ⚙ tetapan", "Find: ☰ left menu · 🔍 search · ⚙ settings"), W/2, 1180);
  x.textAlign = "left"; pages.push(p.c);
  // contents (page numbers filled in after the layout)
  var toc = page(); pages.push(toc.c); var chPage = {};
  // chapters
  var M = 90, CW = W - 2*M, n = 0;
  chs.forEach(function(c, ci){ var st = G.steps.filter(function(s){ return s.ch === c[0]; });
    var pg = page(), y = 130; x = pg.x; chPage[c[0]] = pages.length + 1;
    x.fillStyle = GREEN; x.fillRect(M, y, CW, 120); x.fillStyle = GOLD; x.fillRect(M, y + 116, CW, 4);
    x.fillStyle = "#fff"; x.font = "56px sans-serif"; x.fillText(c[1], M + 26, y + 80); x.font = "bold 22px sans-serif"; x.globalAlpha = .8; x.fillText(L("BAB ", "CHAPTER ") + (ci + 1), M + 120, y + 46); x.globalAlpha = 1;
    x.font = "bold 44px serif"; x.fillText(L(c[2], c[3]), M + 120, y + 94); y += 170;
    st.forEach(function(s){ n++; var txt = L(s.ms, s.en), lines = wrap(x, txt, CW - 70, "24px sans-serif"), wh = G.where(s.go), need = 30 + (wh ? 30 : 0) + lines.length * 34 + 26;
      if(y + need > H - 120){ foot(pg, G, pages.length + 1); pages.push(pg.c); pg = page(); x = pg.x; y = 110;
        x.fillStyle = GOLD; x.font = "bold 20px sans-serif"; x.fillText(c[1] + "  " + L(c[2], c[3]).toUpperCase() + L(" (sambungan)", " (continued)"), M, y); y += 36; }
      x.fillStyle = s.tier === "q" ? GOLD : s.tier === "f" ? GREEN : "#8a8270"; x.beginPath(); x.arc(M + 22, y + 22, 21, 0, 7); x.fill();
      x.fillStyle = "#fff"; x.font = "bold " + (n > 99 ? 16 : 19) + "px sans-serif"; x.textAlign = "center"; x.fillText(String(n), M + 22, y + 29); x.textAlign = "left";
      var ty = y + 4; if(wh){ x.fillStyle = GREEN; x.font = "bold 19px sans-serif"; x.fillText("📍 " + wh, M + 64, ty + 18); ty += 30; }
      x.fillStyle = INK; x.font = "24px sans-serif"; lines.forEach(function(l){ x.fillText(l, M + 64, ty + 24); ty += 34; });
      y = Math.max(ty, y + 46) + 22; x.strokeStyle = "rgba(184,145,47,.25)"; x.lineWidth = 1; x.beginPath(); x.moveTo(M + 64, y - 12); x.lineTo(W - M, y - 12); x.stroke(); });
    foot(pg, G, pages.length + 1); pages.push(pg.c); });
  // contents page
  x = toc.x; x.fillStyle = INK; x.font = "bold 50px serif"; x.textAlign = "center"; x.fillText(L("Kandungan", "Contents"), W/2, 190); x.textAlign = "left";
  var y = 280; chs.forEach(function(c, i){ x.fillStyle = GOLD; x.font = "30px sans-serif"; x.fillText(c[1], M + 10, y); x.fillStyle = INK; x.font = "28px sans-serif"; var t = (i + 1) + ".  " + L(c[2], c[3]); x.fillText(t, M + 70, y);
    var tw = x.measureText(t).width, pn = String(chPage[c[0]]); x.textAlign = "right"; x.fillText(pn, W - M - 10, y); x.textAlign = "left";
    x.fillStyle = "rgba(184,145,47,.6)"; for(var dx = M + 90 + tw; dx < W - M - 60; dx += 14) x.fillRect(dx, y - 6, 3, 3);
    x.fillStyle = MUT; x.font = "18px sans-serif"; var sn = G.steps.filter(function(s){ return s.ch === c[0]; }).length; x.fillText(sn + L(" langkah", sn === 1 ? " step" : " steps"), M + 70, y + 26); y += 82; });
  y += 20; [["q", GOLD, L("Lawatan pantas", "Quick tour")], ["f", GREEN, L("Lawatan penuh", "Full tour")], ["r", "#8a8270", L("Lengkap (selebihnya)", "Complete (the rest)")]].forEach(function(k, i){ x.fillStyle = k[1]; x.beginPath(); x.arc(M + 22 + i*280, y, 12, 0, 7); x.fill(); x.fillStyle = INK; x.font = "20px sans-serif"; x.fillText(k[2], M + 42 + i*280, y + 7); });
  foot(toc, G, 2);
  setTimeout(function(){ res(pdf(pages)); }, 0); }); }};
})();
