/* My Ihsan 0.6.7–0.6.8 · Secondary (Form 1) question types for the School engine, plugged into SEDIA (sedia.js) so exam.html needs no new branches.
   nombor: answer box in the card; a floating keyboard + sketch sheet types into it (0.6.8), digits, −, ., /. Marked by value: 1/2 = 0.5 = 2/4 (q.tepat: "simplest" also needs lowest terms;
           q.terima: other accepted answers; q.unit: a unit shown after the box). Touch only: no phone keyboard is opened.
   kumpul: sort each item into one of 2–4 groups (q.kumpulan = group names, q.item = [[text, group index], ...]).
   Every question may carry: sk (KSSM content standard, e.g. "1.2"), tp (1–6 performance level) and h (explanation shown after Check). */
(function(){
"use strict";
if(!window.SEDIA) return;
var S = window.SEDIA;
function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
function en(){ return (typeof BAHASA !== "undefined" && BAHASA === "en"); }
function W(ms, e){ return en() ? e : ms; }

// ---------- exact fractions ----------
function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = a % b; a = b; b = t; } return a || 1; }
function frac(s){ // "−3/4", "-1.25", "7", "2/-3" -> {n, d} or null
  s = String(s == null ? "" : s).replace(/−/g, "-").replace(/\s+/g, "");
  if(!s || !/^-?\d*\.?\d*(\/-?\d*\.?\d*)?$/.test(s)) return null;
  var parts = s.split("/"), dec = function(x){ if(x === "" || x === "-" || x === "." || x === "-.") return null; var neg = x[0] === "-"; x = x.replace("-", "");
    var p = x.split("."), d = p[1] ? Math.pow(10, p[1].length) : 1, n = parseInt((p[0] || "0") + (p[1] || ""), 10); if(isNaN(n)) return null; return {n: neg ? -n : n, d: d}; };
  var a = dec(parts[0]); if(!a) return null;
  if(parts.length === 2){ var b = dec(parts[1]); if(!b || b.n === 0) return null; a = {n: a.n * b.d, d: a.d * b.n}; }
  if(a.d < 0){ a.n = -a.n; a.d = -a.d; } var g = gcd(a.n, a.d); return {n: a.n / g, d: a.d / g}; }
function same(x, y){ var a = frac(x), b = frac(y); return !!(a && b && a.n === b.n && a.d === b.d); }
function lowest(s){ s = String(s).replace(/−/g, "-"); if(s.indexOf("/") < 0) return true; var p = s.split("/"), n = Math.abs(parseInt(p[0], 10)), d = Math.abs(parseInt(p[1], 10)); return gcd(n, d) === 1 && d !== 1; }
function nomborOk(q, v){ if(v == null || v === "") return false; var acc = [q.a].concat(q.terima || []);
  if(!acc.some(function(a){ return same(a, v); })) return false;
  if(q.tepat === "simplest" && !lowest(v)) return false; return true; }

// ---------- number answers: box in the card + floating keyboard / sketch sheet (0.6.8) ----------
// The card shows only the answer box. A ⌨ button (bottom right) opens a sheet that slides up from the bottom with the keyboard;
// swipe (or tap ✏️) to the sketch pad for rough working. Drag the top edge to resize; ✕ closes. Keys type into the selected box.
var TGT = {}, aktif = null, sketsa = {};
function en2(ms, e){ return en() ? e : ms; }
function binaNombor(kad, t, q, i){
  TGT[q.id] = {t: t, q: q, i: i};
  var r = rekod(t.id), v = r.jawapan[q.id] || "", done = sudahSemak(t, q);
  var box = el("button", "f1Ans" + (done ? (nomborOk(q, v) ? " betul" : " salah") : "") + (aktif === q.id && sheetOpen() ? " aktif" : ""));
  box.type = "button"; box.setAttribute("aria-label", en2("Jawapan", "Answer"));
  box.appendChild(el("span", "f1Val" + (v ? "" : " ph"), v ? String(v).replace(/-/g, "−") : en2("⌨ Ketik untuk jawab", "⌨ Tap to answer")));
  if(q.unit) box.appendChild(el("span", "f1Unit", q.unit));
  box.onclick = function(){ pilih(q.id); buka(0); };
  kad.appendChild(box); }
function nilaiBaru(v, k){ var nv = String(v || "");
  if(k === "⌫") return nv.slice(0, -1); if(k === "C") return "";
  if(k === "−"){ return (nv === "" || /\/$/.test(nv)) ? nv + "-" : null; }
  if(k === "."){ var last = nv.split("/").pop(); if(last.indexOf(".") >= 0) return null; return nv + ((last === "" || last === "-") ? "0." : "."); }
  if(k === "/"){ if(!nv || /[\/\-.]$/.test(nv) || nv.indexOf("/") >= 0) return null; return nv + "/"; }
  if(nv.replace(/[^\d]/g, "").length >= 12) return null; return nv + k; }
function kotak(){ return Array.prototype.slice.call(document.querySelectorAll(".soalKad .f1Ans")); }
function qidOf(b){ var c = b.closest(".soalKad"); return c && c.dataset.qid; }
function tekan(k){
  if(!aktif || !TGT[aktif]){ pilihAuto(); if(!aktif) return; }
  if(k === "→"){ var ks = kotak(), ix = ks.map(qidOf).indexOf(aktif), nx = ks[ix + 1]; if(nx){ pilih(qidOf(nx)); nampak(); } return; }
  var g = TGT[aktif], r = rekod(g.t.id), nv = nilaiBaru(r.jawapan[g.q.id], k); if(nv === null) return;
  simpanJawapan(g.t, g.q, g.i, nv === "" ? undefined : nv); segarPapar(); }
function pilih(id){ aktif = id; kotak().forEach(function(b){ b.classList.toggle("aktif", sheetOpen() && qidOf(b) === id); }); segarPapar(); muatSketsa(); }
function pilihAuto(){ var atas = (document.querySelector(".lekat") || {getBoundingClientRect: function(){ return {bottom: 0}; }}).getBoundingClientRect().bottom, ks = kotak(), best = null;
  for(var n = 0; n < ks.length; n++){ var r = ks[n].getBoundingClientRect(); if(r.bottom > atas && r.top < innerHeight){ best = ks[n]; break; } }
  if(!best) best = ks.filter(function(b){ return b.querySelector(".ph"); })[0] || ks[0];
  if(best) pilih(qidOf(best)); }
function nampak(){ var c = aktif && document.querySelector('.soalKad[data-qid="' + aktif + '"] .f1Ans'); if(!c) return;
  var r = c.getBoundingClientRect(), bawah = innerHeight - (sh ? sh.offsetHeight : 0) - 12, atas = (document.querySelector(".lekat") || c).getBoundingClientRect().bottom + 8;
  if(r.bottom > bawah || r.top < atas) scrollBy({top: r.bottom > bawah ? r.bottom - bawah + 8 : r.top - atas, behavior: "smooth"}); }

// sheet
var sh = null, fab = null, trek = null, kanvas = null, ktx = null, alat = "pen", TINGGI = "silibus.f1.sheetH";
function sheetOpen(){ return !!(sh && sh.classList.contains("buka")); }
function segarPapar(){ if(!sh) return; var g = aktif && TGT[aktif], d = sh.querySelector(".f1Disp"), lb = sh.querySelector(".f1Sasar");
  var v = g ? (rekod(g.t.id).jawapan[g.q.id] || "") : "";
  d.innerHTML = v ? String(v).replace(/-/g, "−") + (g.q.unit ? ' <small>' + g.q.unit + '</small>' : "") : '<span class="ph">' + en2("Jawapan", "Answer") + '</span>';
  var no = g ? (kotak().map(qidOf).indexOf(aktif)) : -1, c = g && document.querySelector('.soalKad[data-qid="' + aktif + '"] .soalNo');
  lb.textContent = c ? c.childNodes[0].textContent.trim() : (no >= 0 ? en2("Soalan ", "Question ") + (no + 1) : ""); }
function bina(){
  if(sh) return;
  sh = el("div", "f1Sheet"); sh.setAttribute("role", "dialog"); sh.setAttribute("aria-label", en2("Papan kekunci", "Keyboard"));
  sh.innerHTML = '<div class="f1Grip" aria-label="' + en2("Seret untuk ubah saiz", "Drag to resize") + '"><span></span></div>' +
    '<div class="f1Head"><div class="f1Tabs"><button type="button" data-f1p="0" class="on">⌨️</button><button type="button" data-f1p="1">✏️</button></div>' +
    '<span class="f1Sasar"></span><button type="button" class="f1X" aria-label="' + en2("Tutup", "Close") + '">✕</button></div>' +
    '<div class="f1Trek"><section class="f1Pane"><div class="f1Disp"></div><div class="f1Pad"></div></section>' +
    '<section class="f1Pane f1Lakar"><div class="f1Alat"><button type="button" data-a="pen" class="on">✏️ ' + en2("Pen", "Pen") + '</button><button type="button" data-a="padam">🧽 ' + en2("Pemadam", "Eraser") + '</button><button type="button" data-a="kosong">🗑 ' + en2("Kosongkan", "Clear") + '</button></div><canvas></canvas></section></div>';
  document.body.appendChild(sh);
  var pad = sh.querySelector(".f1Pad");
  ["7","8","9","⌫","4","5","6","/","1","2","3","−","0",".","C","→"].forEach(function(k){ var b = el("button", "f1Key" + (/[⌫C→]/.test(k) ? " f1Fn" : ""), k === "→" ? en2("Seterus ›", "Next ›") : k); b.type = "button";
    b.onclick = function(){ tekan(k); }; pad.appendChild(b); });
  trek = sh.querySelector(".f1Trek");
  sh.querySelectorAll(".f1Tabs button").forEach(function(b){ b.onclick = function(){ kePane(+b.dataset.f1p, true); }; });
  trek.addEventListener("scroll", function(){ var p = Math.round(trek.scrollLeft / Math.max(1, trek.clientWidth)); sh.querySelectorAll(".f1Tabs button").forEach(function(b){ b.classList.toggle("on", +b.dataset.f1p === p); }); }, {passive: true});
  sh.querySelector(".f1X").onclick = tutup;
  // resize from the top edge
  var grip = sh.querySelector(".f1Grip");
  grip.addEventListener("pointerdown", function(e){ e.preventDefault(); grip.setPointerCapture(e.pointerId); var y0 = e.clientY, h0 = sh.offsetHeight;
    function mv(ev){ setH(h0 + (y0 - ev.clientY)); } function up(){ grip.removeEventListener("pointermove", mv); grip.removeEventListener("pointerup", up); grip.removeEventListener("pointercancel", up); try{ localStorage.setItem(TINGGI, String(sh.offsetHeight)); }catch(x){} saizKanvas(); }
    grip.addEventListener("pointermove", mv); grip.addEventListener("pointerup", up); grip.addEventListener("pointercancel", up); });
  // sketch pad
  kanvas = sh.querySelector("canvas"); ktx = kanvas.getContext("2d");
  sh.querySelectorAll(".f1Alat button").forEach(function(b){ b.onclick = function(){ if(b.dataset.a === "kosong"){ ktx.clearRect(0, 0, kanvas.width, kanvas.height); simpanSketsa(); return; }
    alat = b.dataset.a; sh.querySelectorAll(".f1Alat button").forEach(function(x){ x.classList.toggle("on", x === b); }); }; });
  var lukisan = null;
  kanvas.addEventListener("pointerdown", function(e){ e.preventDefault(); kanvas.setPointerCapture(e.pointerId); var r = kanvas.getBoundingClientRect(), s = kanvas.width / r.width;
    lukisan = {s: s, r: r}; ktx.globalCompositeOperation = alat === "padam" ? "destination-out" : "source-over"; ktx.lineWidth = (alat === "padam" ? 22 : 2.6) * s; ktx.lineCap = ktx.lineJoin = "round";
    ktx.strokeStyle = getComputedStyle(sh).color; ktx.beginPath(); ktx.moveTo((e.clientX - r.left) * s, (e.clientY - r.top) * s); ktx.lineTo((e.clientX - r.left) * s + .1, (e.clientY - r.top) * s); ktx.stroke(); });
  kanvas.addEventListener("pointermove", function(e){ if(!lukisan) return; var r = lukisan.r, s = lukisan.s; ktx.lineTo((e.clientX - r.left) * s, (e.clientY - r.top) * s); ktx.stroke(); });
  ["pointerup", "pointercancel"].forEach(function(ev){ kanvas.addEventListener(ev, function(){ if(lukisan){ lukisan = null; simpanSketsa(); } }); });
  addEventListener("resize", function(){ if(sheetOpen()){ setH(sh.offsetHeight); saizKanvas(); } });
}
function setH(h){ var mx = Math.round(innerHeight * .85); h = Math.max(200, Math.min(mx, Math.round(h))); sh.style.height = h + "px"; document.body.style.paddingBottom = sheetOpen() ? (h + 16) + "px" : ""; }
function kePane(p, lancar){ trek.scrollTo({left: p * trek.clientWidth, behavior: lancar ? "smooth" : "auto"}); if(p === 1) setTimeout(saizKanvas, 30); }
function saizKanvas(){ if(!kanvas) return; var r = kanvas.getBoundingClientRect(); if(r.width < 10) return; var d = Math.min(2, devicePixelRatio || 1), w = Math.round(r.width * d), h = Math.round(r.height * d);
  if(kanvas.width === w && kanvas.height === h) return; kanvas.width = w; kanvas.height = h; muatSketsa(); }
function simpanSketsa(){ if(aktif && kanvas) try{ sketsa[aktif] = kanvas.toDataURL(); }catch(e){} }
function muatSketsa(){ if(!ktx) return; ktx.globalCompositeOperation = "source-over"; ktx.clearRect(0, 0, kanvas.width, kanvas.height); var u = aktif && sketsa[aktif]; if(!u) return;
  var im = new Image(); im.onload = function(){ ktx.drawImage(im, 0, 0, kanvas.width, kanvas.height); }; im.src = u; }
function buka(p){ bina(); if(!aktif || !TGT[aktif] || !document.querySelector('.soalKad[data-qid="' + aktif + '"] .f1Ans')) pilihAuto();
  var h = 0; try{ h = +localStorage.getItem(TINGGI) || 0; }catch(e){}
  sh.classList.add("buka"); setH(h || Math.round(innerHeight * .42)); pilih(aktif); segarFab(); kePane(p || 0, false); if(p === 1) setTimeout(saizKanvas, 60); setTimeout(nampak, 220); }
function tutup(){ if(!sh) return; simpanSketsa(); sh.classList.remove("buka"); document.body.style.paddingBottom = ""; kotak().forEach(function(b){ b.classList.remove("aktif"); }); segarFab(); }
function segarFab(){
  var ada = !!document.querySelector(".soalKad .f1Ans");
  if(!fab){ fab = el("div", "f1Fabs"); fab.innerHTML = '<button type="button" data-f1p="1" aria-label="' + en2("Lakar jawapan", "Sketch your working") + '">✏️</button><button type="button" data-f1p="0" class="utama" aria-label="' + en2("Papan kekunci", "Keyboard") + '">⌨️</button>';
    fab.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ buka(+b.dataset.f1p); }; }); document.body.appendChild(fab); }
  fab.hidden = !ada || sheetOpen();
  if(!ada && sheetOpen()) tutup(); }
// the engine redraws #app on every screen change: keep the buttons and the selected box in step
(function(){ var t = 0; new MutationObserver(function(ms){ if(ms.every(function(m){ return (sh && sh.contains(m.target)) || (fab && fab.contains(m.target)); })) return; clearTimeout(t); t = setTimeout(function(){ segarFab(); if(sheetOpen()){ if(!document.querySelector('.soalKad[data-qid="' + aktif + '"] .f1Ans')) pilihAuto(); else pilih(aktif); } }, 60); })
  .observe(document.documentElement, {childList: true, subtree: true}); })();
window.F1PAD = {buka: buka, tutup: tutup, tekan: tekan, pilih: pilih, aktif: function(){ return aktif; }};

// ---------- sort into groups ----------
function binaKumpul(kad, t, q, i){
  var r = rekod(t.id), v = Array.isArray(r.jawapan[q.id]) ? r.jawapan[q.id].slice() : q.item.map(function(){ return null; }), done = sudahSemak(t, q);
  var list = el("div", "f1Grp");
  q.item.forEach(function(it, k){ var row = el("div", "f1GrpRow"); row.appendChild(el("span", "f1GrpT", papar(it[0])));
    var chips = el("div", "f1GrpC");
    q.kumpulan.forEach(function(g, gi){ var on = v[k] === gi, b = el("button", "f1Chip" + (on ? " on" : ""), papar(g)); b.type = "button";
      if(done && on) b.classList.add(gi === it[1] ? "betul" : "salah");
      b.onclick = function(){ var nv = v.slice(); nv[k] = on ? null : gi; simpanJawapan(t, q, i, nv.every(function(x){ return x == null; }) ? undefined : nv); };
      chips.appendChild(b); });
    row.appendChild(chips); list.appendChild(row); });
  kad.appendChild(list); }

// ---------- plug into SEDIA ----------
var siap0 = S.siap, betul0 = S.betul, bina0 = S.bina;
S.JENIS.nombor = ["Kira jawapan", "Work it out"]; S.JENIS.kumpul = ["Kelaskan", "Sort"];
S.siap = function(q, v){ if(q.j === "nombor") return v != null && !!frac(v); if(q.j === "kumpul") return Array.isArray(v) && v.length === q.item.length && v.every(function(x){ return x != null; }); return siap0(q, v); };
S.betul = function(q, v){ if(q.j === "nombor") return nomborOk(q, v); if(q.j === "kumpul") return S.siap(q, v) && q.item.every(function(it, k){ return v[k] === it[1]; }); return betul0(q, v); };
S.bina = function(kad, t, q, i){ if(q.j === "nombor") return binaNombor(kad, t, q, i); if(q.j === "kumpul") return binaKumpul(kad, t, q, i); return bina0(kad, t, q, i); };
window.F1Q = {frac: frac, same: same, nomborOk: nomborOk};

// ---------- explanation after Check, and the standard / level chip ----------
// exam.html calls window.F1_AFTER(kad, q, marked, right) at the end of each card (see isiSoalan).
window.F1_AFTER = function(kad, q, marked){
  if(q.sk || q.tp){ var c = el("div", "f1Tag", (q.sk ? "SK " + q.sk : "") + (q.sk && q.tp ? " · " : "") + (q.tp ? "TP" + q.tp : "")); kad.insertBefore(c, kad.firstChild.nextSibling); }
  if(marked && q.h) kad.appendChild(el("div", "f1Why", "💡 " + papar(q.h)));
};
})();
