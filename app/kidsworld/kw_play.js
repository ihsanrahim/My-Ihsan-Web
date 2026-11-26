/* My Ihsan 0.7.52 · Kids Planet activity player. KW.play(act, ctx): shows one activity inside the planet stage and calls ctx.done(n) when it is finished.
   ctx = {box, H, st, save, finish(act,ok), close()}. H = helpers from app.js (L2x, esc, toast, vib, say, pinAsk, hijri, go for existing pages).
   All activities are plain DOM (big glossy buttons); nothing here needs the network. */
(function(){
var K = window.KW = window.KW || {};
var ctx, H, box, body, act;
function T(s){ s = String(s == null ? "" : s); var i = s.indexOf("|"); return i < 0 ? s : H.L2x(s.slice(0, i), s.slice(i + 1)); }
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
function btn(txt, cls, f){ var b = el("button", "kwBtn" + (cls ? " " + cls : ""), txt); b.type = "button"; if(f) b.onclick = f; return b; }
function shuffle(a){ a = a.slice(); for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function dayNo(){ return Math.floor(Date.now() / 864e5); }
function V(key, def){ ctx.st.v = ctx.st.v || {}; if(ctx.st.v[key] == null) ctx.st.v[key] = def; return ctx.st.v[key]; }
function isAr(s){ return /[؀-ۿ]/.test(s); }
function head(title, sub){ var h = el("div", "kwHd"); h.appendChild(el("b", null, E(title))); if(sub) h.appendChild(el("small", null, E(sub))); var x = btn("✕", "kwX", function(){ ctx.close(); }); x.setAttribute("aria-label", L("Tutup", "Close")); h.appendChild(x); return h; }
function frame(title, sub){ body.textContent = ""; body.appendChild(head(title, sub)); var c = el("div", "kwBd"); body.appendChild(c); return c; }
function finish(ok){ ctx.finish(act, ok !== false); }
function doneBar(c, label){ var r = el("div", "kwRow"); r.appendChild(btn("✓ " + (label || L("Siap", "Done")), "kwGo", function(){ finish(true); })); c.appendChild(r); }

/* ---------- quiz ---------- */
function genTimes(){ var a = 2 + Math.floor(Math.random() * 8), b = 1 + Math.floor(Math.random() * 10), c = a * b, o = [c, c + a, c - a + (c - a === c ? 1 : 0)]; if(o[2] < 0) o[2] = c + 2 * a; return [a + " × " + b + " = ?", shuffle(o).map(String), c]; }
// 0.7.68 (owner): market and caravan generators
function opts3(ans, d){ var o = [ans]; while(o.length < 3){ var v = ans + (Math.random() < 0.5 ? -1 : 1) * d * (1 + Math.floor(Math.random() * 3)); if(v > 0 && o.indexOf(v) < 0) o.push(v); } return shuffle(o).map(String); }
function genWeigh(){ var fr = pick([["epal|apples", 6], ["pisang|bananas", 4], ["tembikai|watermelon", 3], ["anggur|grapes", 12], ["oren|oranges", 5]]), kg = 1 + Math.floor(Math.random() * 3), ans = fr[1] * kg, nm = fr[0].split("|");
  return [L("Harga " + nm[0] + " RM" + fr[1] + " sekilo. Berapa untuk " + kg + " kg?", nm[1].charAt(0).toUpperCase() + nm[1].slice(1) + " cost RM" + fr[1] + " a kilo. How much for " + kg + " kg?"), opts3(ans, fr[1]).map(function(x){ return "RM" + x; }), "RM" + ans]; }
function genChange(){ var price = pick([20, 30, 40, 50, 60, 70, 80]), pay = 100, ans = pay - price; return [L("Kuih harga " + price + " sen. Anda bayar RM1. Baki berapa sen?", "A kuih costs " + price + " sen. You pay RM1. How many sen change?"), opts3(ans, 10).map(function(x){ return x + " sen"; }), ans + " sen"]; }
function genStall(){ var cost = 1 + Math.floor(Math.random() * 3), sell = cost + 1 + Math.floor(Math.random() * 2), n = 2 + Math.floor(Math.random() * 5), ans = (sell - cost) * n;
  return [L("Anda buat air sirap kos RM" + cost + " secawan dan jual RM" + sell + ". Jual " + n + " cawan. Untung?", "Your lemonade costs RM" + cost + " a cup to make and sells for RM" + sell + ". You sell " + n + " cups. Profit?"), opts3(ans, n > 2 ? 2 : 1).map(function(x){ return "RM" + x; }), "RM" + ans]; }
function genCompass(){ var D = [["Utara|North", 0], ["Timur|East", 90], ["Selatan|South", 180], ["Barat|West", 270]], a = pick(D), turn = pick([90, 180, 270]), b = D.filter(function(x){ return x[1] === (a[1] + turn) % 360; })[0], tw = {90: L("ke kanan sekali", "right once"), 180: L("ke belakang", "all the way round"), 270: L("ke kiri sekali", "left once")}[turn];
  return [L("Unta menghadap " + T(a[0]).toLowerCase() + ". Ia pusing " + tw + ". Sekarang ia menghadap?", "The camel faces " + T(a[0]).toLowerCase() + ". It turns " + tw + ". Which way now?"), shuffle(D.map(function(x){ return x[0]; })).slice(0, 4), b[0]]; }
function pad2(n){ return ("0" + n).slice(-2); }
function genClock(){ var h = 1 + Math.floor(Math.random() * 12), m = pick([0, 15, 30, 45]), ans = h + ":" + pad2(m), o = [ans]; while(o.length < 3){ var h2 = 1 + Math.floor(Math.random() * 12), m2 = pick([0, 15, 30, 45]), s = h2 + ":" + pad2(m2); if(o.indexOf(s) < 0) o.push(s); } return {clock:[h, m], q:L("Pukul berapa?", "What time is it?"), o:shuffle(o), a:ans}; }
function genMoney(){ var price = 1 + Math.floor(Math.random() * 8), pay = pick([5, 10, 20]); while(pay <= price) pay += 5; var ch = pay - price, o = [ch, ch + 1, Math.max(0, ch - 1) === ch ? ch + 2 : Math.max(0, ch - 1)]; return {q:L("Anda beli mainan RM", "You buy a toy for RM") + price + L(" dan bayar RM", " and pay RM") + pay + L(". Baki?", ". Change?"), o:shuffle(o.map(function(n){ return "RM " + n; })), a:"RM " + ch}; }
function genPattern(){ var kinds = [function(){ var s = 1 + Math.floor(Math.random() * 5), d = 1 + Math.floor(Math.random() * 4); return [[s, s + d, s + 2 * d, s + 3 * d], s + 4 * d]; },
    function(){ var s = 1 + Math.floor(Math.random() * 3); return [[s, s * 2, s * 4, s * 8], s * 16]; },
    function(){ var d = pick([5, 10]); return [[d, d * 2, d * 3, d * 4], d * 5]; }], k = pick(kinds)(), ans = k[1], o = [ans, ans + 1, ans - 1 > 0 ? ans - 1 : ans + 2];
  return {q:k[0].join(", ") + ", ?", o:shuffle(o.map(String)), a:String(ans)}; }
function drawClock(c, h, m){ var cv = el("canvas", "kwClock"); cv.width = cv.height = 160; var g = cv.getContext("2d"); g.fillStyle = "#fff"; g.beginPath(); g.arc(80, 80, 74, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = "#12908a"; g.stroke(); g.fillStyle = "#2c3a3a"; g.font = "700 15px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  for(var i = 1; i <= 12; i++){ var a = i / 12 * Math.PI * 2 - Math.PI / 2; g.fillText(i, 80 + Math.cos(a) * 60, 80 + Math.sin(a) * 60); }
  function hand(ang, len, w, col){ g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(80, 80); g.lineTo(80 + Math.cos(ang) * len, 80 + Math.sin(ang) * len); g.stroke(); }
  hand(((h % 12) + m / 60) / 12 * Math.PI * 2 - Math.PI / 2, 36, 6, "#2c3a3a"); hand(m / 60 * Math.PI * 2 - Math.PI / 2, 54, 4, "#e8697d"); g.fillStyle = "#e0a82e"; g.beginPath(); g.arc(80, 80, 6, 0, 7); g.fill(); c.appendChild(cv); }
function quiz(){ var c = frame(T(act.n), L("5 soalan", "5 questions")), bank = act.bank, items = [];
  var gen = {times:genTimes, clock:genClock, money:genMoney, pattern:genPattern, weigh:genWeigh, change:genChange, stall:genStall, compass:genCompass};
  if(gen[bank]){ for(var i = 0; i < 5; i++){ var g = gen[bank](); if(g instanceof Array) items.push({q:g[0], o:g[1], a:String(g[2])}); else items.push(g); } }
  else { shuffle(K.BANK[bank]).slice(0, 5).forEach(function(q){ var ans = q[1][q[2]], opts = shuffle(q[1]); items.push({q:q[0], o:opts, a:ans}); }); }
  var n = 0, right = 0;
  function show(){ c.textContent = ""; if(n >= items.length) return result(); var it = items[n], card = el("div", "kwQ");
    card.appendChild(el("div", "kwStep", (n + 1) + " / " + items.length));
    if(it.clock) drawClock(card, it.clock[0], it.clock[1]);
    var q = T(it.q), qe = el("div", "kwQt" + (isAr(q) ? " ar" : ""), E(q).replace("___", "<span class=kwBlank>___</span>")); card.appendChild(qe);
    var opts = el("div", "kwOpts"); it.o.forEach(function(o){ var txt = T(o), b = btn(txt, "kwOpt" + (isAr(txt) ? " ar" : ""), function(){ var ok = o === it.a; if(ok){ right++; H.vib(30); } Array.prototype.forEach.call(opts.children, function(x){ x.disabled = true; }); b.classList.add(ok ? "good" : "bad"); if(!ok) Array.prototype.forEach.call(opts.children, function(x){ if(x._v === it.a) x.classList.add("good"); }); setTimeout(function(){ n++; show(); }, ok ? 650 : 1100); }); b._v = o; opts.appendChild(b); });
    card.appendChild(opts); c.appendChild(card); }
  function result(){ var ok = right >= 3; c.appendChild(el("div", "kwBig", right + " / " + items.length)); c.appendChild(el("p", "kwP", ok ? L("MasyaAllah! Hebat!", "MashaAllah! Great job!") : L("Cuba lagi, anda boleh!", "Try again, you can do it!")));
    var r = el("div", "kwRow"); r.appendChild(btn(L("Main lagi", "Play again"), "alt", function(){ quiz(); })); if(ok) r.appendChild(btn("✓ " + L("Siap", "Done"), "kwGo", function(){ finish(true); })); else r.appendChild(btn(L("Tutup", "Close"), "", function(){ ctx.close(); })); c.appendChild(r); }
  show(); }

/* ---------- tips and cards ---------- */
function tip(){ var list = K.BANK[act.bank], arabic = act.bank === "arabic", daily = (act.daily || act.bank === "sunnah" || act.bank === "arabic" || act.bank === "didyou"), i = daily ? dayNo() % list.length : 0, c = frame(T(act.n), daily ? L("Hari ini", "Today") : (i + 1) + " / " + list.length);
  function show(){ c.textContent = ""; var t = list[i], card = el("div", "kwCard");
    if(arabic){ card.appendChild(el("div", "kwAr ar", t[0])); card.appendChild(el("div", "kwT", E(T(t[1])))); }
    else { card.appendChild(el("div", "kwT", E(T(t[0])))); card.appendChild(el("p", "kwP", E(T(t[1])))); }
    c.appendChild(card);
    var nav = el("div", "kwRow"); nav.appendChild(btn("‹", "alt", function(){ i = (i + list.length - 1) % list.length; show(); })); nav.appendChild(el("span", "kwMid", (i + 1) + " / " + list.length)); nav.appendChild(btn("›", "alt", function(){ i = (i + 1) % list.length; show(); })); c.appendChild(nav);
    doneBar(c, L("Saya sudah tahu", "I got it")); }
  show(); }
function doa(){ var D = window.DOA || [], pool = [], want = act.mode === "sleep" ? ["Sebelum tidur", "Bangun tidur"] : (window.KIDS_DOA || []); want.forEach(function(t){ var it = null; D.forEach(function(g){ g.items.forEach(function(x){ if(!it && x.t_ms === t) it = x; }); }); if(it) pool.push(it); });
  var c = frame(T(act.n)); if(!pool.length){ c.appendChild(el("p", "kwP", L("Doa belum dimuatkan.", "The dua is not loaded."))); return; }
  var i = act.mode === "sleep" ? 0 : dayNo() % pool.length;
  function show(){ c.textContent = ""; var it = pool[i], card = el("div", "kwCard"); card.appendChild(el("div", "kwT", E(H.en() ? it.t_en : it.t_ms))); card.appendChild(el("div", "kwAr ar", it.ar)); card.appendChild(el("p", "kwP", E(H.en() ? it.en : it.ms)));
    var s = btn("🔊 " + L("Dengar", "Listen"), "alt", function(){ H.say(it.ar); }); card.appendChild(s); c.appendChild(card);
    if(pool.length > 1){ var nav = el("div", "kwRow"); nav.appendChild(btn("‹", "alt", function(){ i = (i + pool.length - 1) % pool.length; show(); })); nav.appendChild(btn("›", "alt", function(){ i = (i + 1) % pool.length; show(); })); c.appendChild(nav); }
    doneBar(c, L("Saya sudah baca", "I said it")); }
  show(); }
function asma(){ var A = window.ASMAUL_HUSNA || [], c = frame(T(act.n)); if(!A.length) return; var start = (dayNo() * 7) % A.length, set = []; for(var k = 0; k < 8; k++) set.push(A[(start + k) % A.length]); var i = 0, flip = false;
  function show(){ c.textContent = ""; var a = set[i], card = el("div", "kwCard kwFlip"); if(!flip){ card.appendChild(el("div", "kwAr ar", a[0])); card.appendChild(el("div", "kwT", E(a[1]))); card.appendChild(el("small", "kwMut", L("Ketik untuk lihat maksud", "Tap to see the meaning"))); }
    else { card.appendChild(el("div", "kwT", E(a[1]))); card.appendChild(el("p", "kwP", E(H.en() ? a[3] : a[2]))); } card.onclick = function(){ flip = !flip; show(); }; c.appendChild(card);
    var nav = el("div", "kwRow"); nav.appendChild(btn("🔊", "alt", function(){ H.say(a[0]); })); nav.appendChild(el("span", "kwMid", (i + 1) + " / " + set.length)); nav.appendChild(btn(i + 1 < set.length ? "›" : "✓", "kwGo", function(){ if(i + 1 < set.length){ i++; flip = false; show(); } else finish(true); })); c.appendChild(nav); }
  show(); }

/* ---------- memory ---------- */
function memory(){ var c = frame(T(act.n), L("Cari pasangan", "Find the pairs")), L8 = act.pairs || ["ا", "ب", "ت", "ث", "ج", "ح"], cols = ["#12908a", "#e8697d", "#f2b632", "#4aa3df", "#9775fa", "#51cf66"], deck = shuffle(L8.concat(L8)), open = [], found = 0, moves = 0, lock = false, grid = el("div", "kwMem"), mv = el("div", "kwStep", L("Langkah: ", "Moves: ") + "0");
  deck.forEach(function(ch, idx){ var b = btn("", "kwCardBtn"); b.dataset.v = ch; b.onclick = function(){ if(lock || b.classList.contains("up") || b.classList.contains("hit")) return; b.classList.add("up"); b.innerHTML = '<span class="ar" style="color:' + cols[L8.indexOf(ch)] + '">' + ch + '</span>'; open.push(b);
      if(open.length === 2){ moves++; mv.textContent = L("Langkah: ", "Moves: ") + moves; lock = true; if(open[0].dataset.v === open[1].dataset.v){ open[0].classList.add("hit"); open[1].classList.add("hit"); found++; open = []; lock = false; H.vib(30); if(found === L8.length) setTimeout(function(){ finish(true); }, 600); }
        else setTimeout(function(){ open.forEach(function(x){ x.classList.remove("up"); x.innerHTML = ""; }); open = []; lock = false; }, 800); } }; grid.appendChild(b); });
  c.appendChild(mv); c.appendChild(grid); }

/* ---------- check list (routine, chores) ---------- */
function check(){ var store = V("check", {}), s = store[act.key]; if(!s || s.d !== ymd()) s = store[act.key] = {d:ymd(), t:[], ok:0}; var c = frame(T(act.n), L("Hari ini", "Today"));
  function show(){ c.textContent = ""; var all = act.items.every(function(x, i){ return s.t[i]; }); act.items.forEach(function(it, i){ var lab = el("label", "kwChk"), cb = el("input"); cb.type = "checkbox"; cb.checked = !!s.t[i]; cb.onchange = function(){ s.t[i] = cb.checked ? 1 : 0; ctx.save(); show(); }; lab.appendChild(cb); lab.appendChild(el("span", null, E(T(it)))); c.appendChild(lab); });
    if(all){ if(act.approve && !s.ok){ c.appendChild(el("p", "kwP", L("Minta ibu bapa meluluskan tugasan hari ini.", "Ask a grown-up to approve today's chores."))); var r = el("div", "kwRow"); r.appendChild(btn("🔒 " + L("Ibu bapa meluluskan", "Parent approves"), "kwGo", function(){ H.pinAsk(L("Luluskan tugasan", "Approve chores"), function(){ s.ok = 1; ctx.save(); finish(true); }); })); c.appendChild(r); }
      else doneBar(c); } }
  show(); }

/* ---------- timers, moves, breathing ---------- */
function ring(c){ var w = el("div", "kwRingW"); w.innerHTML = '<svg viewBox="0 0 120 120" class="kwRing"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" id="kwArc" stroke-dasharray="326.7" stroke-dashoffset="0"/></svg><div class="kwRingT" id="kwRt">0:00</div>'; c.appendChild(w); return w; }
function setRing(w, frac, txt){ var a = w.querySelector("#kwArc"); a.style.strokeDashoffset = String(326.7 * (1 - frac)); w.querySelector("#kwRt").textContent = txt; }
function timer(){ var c = frame(T(act.n)), w = ring(c), total = act.secs, left = total, iv = null, go = btn("▶ " + L("Mula", "Start"), "kwGo", start);
  function fmt(s){ return Math.floor(s / 60) + ":" + pad2(s % 60); } setRing(w, 1, fmt(left));
  function start(){ if(iv){ clearInterval(iv); iv = null; go.textContent = "▶ " + L("Sambung", "Resume"); return; } go.textContent = "⏸ " + L("Jeda", "Pause"); iv = setInterval(function(){ if(!document.body.contains(w)){ clearInterval(iv); return; } left--; setRing(w, left / total, fmt(left)); if(left <= 0){ clearInterval(iv); iv = null; H.vib(400); c.appendChild(el("p", "kwBig", "🎉")); finish(true); } }, 1000); }
  var r = el("div", "kwRow"); r.appendChild(go); c.appendChild(r); ctx.onStop = function(){ if(iv) clearInterval(iv); }; }
function moves(){ var c = frame(T(act.n)), w = ring(c), steps = K.BANK[act.bank || "moves"], i = 0, left = 0, iv = null, tx = el("div", "kwBig2"), go = btn("▶ " + L("Mula", "Start"), "kwGo", start); c.insertBefore(tx, w); tx.textContent = L("Sedia?", "Ready?");
  function next(){ if(i >= steps.length){ clearInterval(iv); iv = null; tx.textContent = "🎉"; finish(true); return; } tx.textContent = T(steps[i][0]); left = steps[i][1]; }
  function start(){ if(iv) return; go.style.display = "none"; next(); setRing(w, 1, String(left)); iv = setInterval(function(){ if(!document.body.contains(w)){ clearInterval(iv); return; } left--; setRing(w, Math.max(0, left / steps[i][1]), String(Math.max(0, left))); if(left <= 0){ i++; H.vib(80); next(); } }, 1000); }
  var r = el("div", "kwRow"); r.appendChild(go); c.appendChild(r); ctx.onStop = function(){ if(iv) clearInterval(iv); }; }
function breath(){ var c = frame(T(act.n), L("Tarik nafas dalam-dalam", "Breathe slowly")), b = el("div", "kwBreath"), tx = el("div", "kwBig2"), n = 0, iv = null; c.appendChild(b); c.appendChild(tx); tx.textContent = L("Mula bila sedia", "Start when ready");
  var phases = [[L("Tarik nafas…", "Breathe in…"), 4, 1.25], [L("Tahan…", "Hold…"), 2, 1.25], [L("Hembus perlahan…", "Breathe out…"), 6, 0.8]], round = 0, ph = 0, t = 0;
  function start(){ if(iv) return; r.style.display = "none"; ph = 0; t = 0; round = 0; step(); iv = setInterval(function(){ if(!document.body.contains(b)){ clearInterval(iv); return; } t++; if(t >= phases[ph][1]){ t = 0; ph++; if(ph >= phases.length){ ph = 0; round++; if(round >= 4){ clearInterval(iv); iv = null; tx.textContent = L("Alhamdulillah, tenang.", "Alhamdulillah, calm."); finish(true); return; } } step(); } }, 1000); }
  function step(){ tx.textContent = phases[ph][0]; b.style.transition = "transform " + phases[ph][1] + "s ease-in-out"; b.style.transform = "scale(" + phases[ph][2] + ")"; }
  var r = el("div", "kwRow"); r.appendChild(btn("▶ " + L("Mula", "Start"), "kwGo", start)); c.appendChild(r); ctx.onStop = function(){ if(iv) clearInterval(iv); }; }

/* ---------- counters (water, sleep, savings) ---------- */
function counter(){ var store = V("counter", {}), s = store[act.key] || (store[act.key] = {d:"", n:0}), persistent = act.key === "save" || !!act.keep, goal = act.key === "save" ? (ctx.st.p && ctx.st.p.saveGoal) || act.goal : act.goal;
  if(!persistent && s.d !== ymd()){ s.d = ymd(); s.n = 0; } var c = frame(T(act.n), L("Matlamat: ", "Goal: ") + goal + " " + T(act.unit));
  function show(){ c.textContent = ""; c.appendChild(el("div", "kwBig", s.n + " / " + goal)); var bar = el("div", "kwBar"); bar.innerHTML = '<i style="width:' + Math.min(100, s.n * 100 / goal) + '%"></i>'; c.appendChild(bar);
    var jar = el("div", "kwJar"); for(var i = 0; i < Math.min(s.n, 40); i++) jar.appendChild(el("span", "kwBall")); c.appendChild(jar);
    var r = el("div", "kwRow"); r.appendChild(btn("−", "alt", function(){ s.n = Math.max(0, s.n - 1); ctx.save(); show(); })); r.appendChild(btn("＋ " + T(act.unit), "kwGo", function(){ s.n++; s.d = ymd(); ctx.save(); H.vib(30); if(s.n >= goal || !persistent) ctx.mark(act); show(); if(s.n === goal) H.toast(L("MasyaAllah! Matlamat tercapai 🎉", "MashaAllah! Goal reached 🎉")); })); c.appendChild(r);
    if(s.n >= goal) doneBar(c); }
  show(); }

/* ---------- drawing and colouring ---------- */
var PAL = ["#e03131", "#f08c00", "#fab005", "#2f9e44", "#12908a", "#1c7ed6", "#7048e8", "#e64980", "#8b5a2b", "#212529", "#ffffff"];
function palette(c, st){ var p = el("div", "kwPal"); PAL.forEach(function(col){ var b = el("button", "kwSw", ""); b.type = "button"; b.style.background = col; b.setAttribute("aria-label", col); b.onclick = function(){ st.col = col; Array.prototype.forEach.call(p.children, function(x){ x.classList.remove("on"); }); b.classList.add("on"); }; if(col === st.col) b.classList.add("on"); p.appendChild(b); }); c.appendChild(p); }
function draw(){ var c = frame(T(act.n), act.q ? T(act.q) : ""), st = {col:PAL[5], size:8, strokes:0}, SY = act.sym || 1; palette(c, st); var cv = el("canvas", "kwCv"); cv.width = 320; cv.height = 320; c.appendChild(cv); var g = cv.getContext("2d"); g.fillStyle = "#fffdf8"; g.fillRect(0, 0, 320, 320); g.lineCap = "round"; g.lineJoin = "round"; var down = false, lx = 0, ly = 0;
  function pt(e){ var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 320 / r.width, (e.clientY - r.top) * 320 / r.height]; }
  function sym(fn){ for(var k = 0; k < SY; k++){ g.save(); g.translate(160, 160); g.rotate(k * 2 * Math.PI / SY); g.translate(-160, -160); fn(); g.restore(); if(SY > 1){ g.save(); g.translate(160, 160); g.rotate(k * 2 * Math.PI / SY); g.scale(-1, 1); g.translate(-160, -160); fn(); g.restore(); } } }
  if(SY > 1){ g.strokeStyle = "#e9dcc2"; g.lineWidth = 1; for(var k = 0; k < SY; k++){ g.beginPath(); g.moveTo(160, 160); g.lineTo(160 + Math.cos(k * 2 * Math.PI / SY) * 160, 160 + Math.sin(k * 2 * Math.PI / SY) * 160); g.stroke(); } }
  cv.addEventListener("pointerdown", function(e){ down = true; cv.setPointerCapture(e.pointerId); var p = pt(e); lx = p[0]; ly = p[1]; g.fillStyle = st.col; sym(function(){ g.beginPath(); g.arc(lx, ly, st.size / 2, 0, 7); g.fill(); }); st.strokes++; });
  cv.addEventListener("pointermove", function(e){ if(!down) return; var p = pt(e); g.strokeStyle = st.col; g.lineWidth = st.size; sym(function(){ g.beginPath(); g.moveTo(lx, ly); g.lineTo(p[0], p[1]); g.stroke(); }); lx = p[0]; ly = p[1]; });
  cv.addEventListener("pointerup", function(){ down = false; }); cv.addEventListener("pointercancel", function(){ down = false; });
  var r = el("div", "kwRow"); [4, 8, 16].forEach(function(s){ r.appendChild(btn("●", "alt kwSz", function(){ st.size = s; })); }); r.appendChild(btn("🗑️", "alt", function(){ g.fillStyle = "#fffdf8"; g.fillRect(0, 0, 320, 320); })); c.appendChild(r);
  var r2 = el("div", "kwRow"); r2.appendChild(btn("✓ " + L("Simpan", "Save"), "kwGo", function(){ if(st.strokes < 3){ H.toast(L("Lukis sesuatu dahulu", "Draw something first")); return; } finish(true); })); c.appendChild(r2); }
function colour(){ var c = frame(T(act.n), L("Ketik bahagian untuk mewarna", "Tap a part to colour it")), st = {col:PAL[3]}, svgNS = "http://www.w3.org/2000/svg", s = document.createElementNS(svgNS, "svg"); s.setAttribute("viewBox", "-100 -100 200 200"); s.setAttribute("class", "kwSvg"); var painted = {};
  function part(node, id){ node.setAttribute("class", "kwPart"); node.setAttribute("fill", "#fffdf8"); node.setAttribute("stroke", "#2c3a3a"); node.setAttribute("stroke-width", "1.4"); node.onclick = function(){ node.setAttribute("fill", st.col); painted[id] = 1; }; s.appendChild(node); }
  function mk(tag, attrs){ var n = document.createElementNS(svgNS, tag); for(var k in attrs) n.setAttribute(k, attrs[k]); return n; }
  var id = 0; for(var i = 0; i < 8; i++){ part(mk("ellipse", {cx:0, cy:-62, rx:17, ry:34, transform:"rotate(" + (i * 45) + ")"}), id++); }
  for(var j = 0; j < 8; j++){ part(mk("path", {d:"M -12 -97 L 12 -97 L 0 -80 Z", transform:"rotate(" + (j * 45 + 22.5) + ")"}), id++); }
  for(var k = 0; k < 16; k++){ part(mk("circle", {cx:0, cy:-37, r:4.5, transform:"rotate(" + (k * 22.5) + ")"}), id++); }
  part(mk("circle", {cx:0, cy:0, r:17}), id++); part(mk("circle", {cx:0, cy:0, r:7}), id++);
  palette(c, st); var wrap = el("div", "kwSvgW"); wrap.appendChild(s); c.appendChild(wrap); var r = el("div", "kwRow"); r.appendChild(btn("✓ " + L("Siap", "Done"), "kwGo", function(){ if(Object.keys(painted).length < 8){ H.toast(L("Warnakan sekurang-kurangnya 8 bahagian", "Colour at least 8 parts")); return; } finish(true); })); c.appendChild(r); }

/* ---------- moon, diary, story, plant, feelings, family ---------- */
function moonPhase(d){ var syn = 29.530588853, base = Date.UTC(2000, 0, 6, 18, 14), age = (((d.getTime() - base) / 864e5) % syn + syn) % syn; return age; }
function moon(){ var c = frame(T(act.n)), age = moonPhase(new Date()), idx = Math.floor((age / 29.530588853) * 8 + 0.5) % 8, em = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"][idx], names = [["Bulan baru", "New moon"], ["Sabit naik", "Waxing crescent"], ["Suku pertama", "First quarter"], ["Cembung naik", "Waxing gibbous"], ["Bulan purnama", "Full moon"], ["Cembung susut", "Waning gibbous"], ["Suku akhir", "Last quarter"], ["Sabit susut", "Waning crescent"]][idx];
  c.appendChild(el("div", "kwMoon", em)); c.appendChild(el("div", "kwT", E(L(names[0], names[1])))); var hj = H.hijri(); if(hj) c.appendChild(el("p", "kwP", L("Tarikh Hijrah: ", "Hijri date: ") + E(hj))); c.appendChild(el("p", "kwP", L("Umur bulan: kira-kira ", "Moon age: about ") + Math.round(age) + L(" hari", " days"))); c.appendChild(el("p", "kwMut", L("Bulan baru Hijrah dilihat dengan mata dan pengiraan falak.", "A new Hijri month is set by sighting and astronomical calculation."))); doneBar(c, L("Saya sudah lihat", "I saw it")); }
function diary(){ var key = act.key || (act.mode === "seed" ? "seedDiary" : "diary"), list = V(key, []), stk = act.stk || (act.mode === "seed" ? ["🌰", "🌱", "🌿", "🌻", "💧", "☀️"] : K.BANK.stickers), c = frame(T(act.n), act.q ? T(act.q) : act.mode === "seed" ? L("Apa yang berlaku pada benih anda?", "What happened to your seed?") : L("Bagaimana hari anda?", "How was your day?")), sel = stk[0];
  var row = el("div", "kwStk"); stk.forEach(function(s){ var b = btn(s, "kwStkB", function(){ sel = s; Array.prototype.forEach.call(row.children, function(x){ x.classList.remove("on"); }); b.classList.add("on"); }); if(s === sel) b.classList.add("on"); row.appendChild(b); }); c.appendChild(row);
  var ta = el("textarea", "kwTa"); ta.maxLength = 90; ta.placeholder = act.ph ? T(act.ph) : L("Tulis satu ayat…", "Write one sentence…"); c.appendChild(ta);
  var r = el("div", "kwRow"); r.appendChild(btn("✓ " + L("Simpan", "Save"), "kwGo", function(){ if(!ta.value.trim()){ H.toast(L("Tulis sesuatu dahulu", "Write something first")); return; } list.unshift({d:ymd(), s:sel, t:ta.value.trim()}); if(list.length > 20) list.length = 20; ctx.save(); finish(true); })); c.appendChild(r);
  list.slice(0, 5).forEach(function(e){ c.appendChild(el("div", "kwLog", "<b>" + E(e.d) + "</b> " + E(e.s) + " " + E(e.t))); }); }
function story(){ var C = [["Ali si bola kecil|Ali the little ball"], ["burung kecil|a little bird"], ["unta muda|a young camel"], ["bintang kecil|a little star"]], P = ["di taman|in the garden", "di padang pasir|in the desert", "di hutan|in the forest", "di bandar|in the city"], Q = ["menjumpai sebuah beg hilang|found a lost bag", "melihat kawan yang sedih|saw a friend who was sad", "tersilap memecahkan sesuatu|broke something by mistake", "tidak boleh tidur|could not sleep"], W = [["Dia berkata benar dan mengembalikannya.|He told the truth and gave it back."], ["Dia menolong dan berkongsi.|He helped and shared."], ["Dia meminta maaf dan membaiki.|He said sorry and fixed it."], ["Dia berdoa dan berasa tenang.|He made dua and felt calm."]], c = frame(T(act.n), L("Pilih untuk membina cerita", "Choose to build a story")), s = {a:0, b:0, c:0, d:0};
  function sel(title, arr, key){ var box = el("div", "kwSec"); box.appendChild(el("b", null, E(title))); var r = el("div", "kwChips"); arr.forEach(function(o, i){ var b = btn(T(o instanceof Array ? o[0] : o), "alt kwChip", function(){ s[key] = i; Array.prototype.forEach.call(r.children, function(x){ x.classList.remove("on"); }); b.classList.add("on"); }); if(i === 0) b.classList.add("on"); r.appendChild(b); }); box.appendChild(r); c.appendChild(box); }
  sel(L("Watak", "Character"), C, "a"); sel(L("Tempat", "Place"), P, "b"); sel(L("Apa berlaku", "What happens"), Q, "c"); sel(L("Pengakhiran", "Ending"), W, "d");
  var r = el("div", "kwRow"); r.appendChild(btn("📖 " + L("Bina cerita", "Make my story"), "kwGo", function(){ var tx = L("Pada suatu hari, ", "One day, ") + T(C[s.a][0]) + " " + T(P[s.b]) + " " + T(Q[s.c]) + ". " + T(W[s.d][0]); c.textContent = ""; c.appendChild(el("div", "kwCard", "<p class='kwP'>" + E(tx) + "</p>")); doneBar(c, L("Tamat", "The end")); })); c.appendChild(r); }
function plant(){ var p = V("plant", {kind:"", water:0, last:""}), c = frame(T(act.n)), KS = [["🌴", "Pokok kurma|Date palm"], ["🌻", "Bunga matahari|Sunflower"], ["🍅", "Pokok tomato|Tomato plant"]], stages = ["🌰", "🌱", "🌿", "🪴", "🌳", "🌟"];
  function show(){ c.textContent = ""; if(!p.kind){ c.appendChild(el("p", "kwP", L("Pilih benih untuk ditanam:", "Choose a seed to plant:"))); var r = el("div", "kwRow"); KS.forEach(function(k, i){ r.appendChild(btn(k[0] + " " + T(k[1]), "alt", function(){ p.kind = String(i); ctx.save(); show(); })); }); c.appendChild(r); return; }
    var st = Math.min(5, Math.floor(p.water / 2)), em = st >= 4 ? KS[+p.kind][0] : stages[st]; c.appendChild(el("div", "kwMoon", em)); c.appendChild(el("div", "kwT", E(T(KS[+p.kind][1])))); c.appendChild(el("p", "kwP", L("Disiram: ", "Watered: ") + p.water + L(" hari. Siram sekali sehari untuk membesar.", " days. Water once a day to help it grow.")));
    var r2 = el("div", "kwRow"), today = p.last === ymd(); r2.appendChild(btn(today ? "✓ " + L("Sudah disiram hari ini", "Watered today") : "💧 " + L("Siram", "Water"), today ? "alt" : "kwGo", function(){ if(today) return; p.water++; p.last = ymd(); ctx.save(); H.vib(40); finish(true); })); c.appendChild(r2); }
  show(); }
function feel(){ var c = frame(T(act.n), L("Apa perasaan anda?", "How do you feel?")), r = el("div", "kwFeel"); K.BANK.feel.forEach(function(f){ var b = btn("<span>" + f[0] + "</span><small>" + E(T(f[1])) + "</small>", "kwFeelB", function(){ c.textContent = ""; c.appendChild(el("div", "kwMoon", f[0])); c.appendChild(el("div", "kwT", E(T(f[1])))); c.appendChild(el("p", "kwP", E(T(f[2])))); var l = V("feel", []); l.unshift({d:ymd(), f:f[0]}); if(l.length > 14) l.length = 14; ctx.save(); doneBar(c, L("Terima kasih", "Thank you")); }); r.appendChild(b); }); c.appendChild(r); }
function family(){ var list = V("family", []), c = frame(T(act.n), L("Tulis nama ahli keluarga anda", "Add your family members")), REL = [["Ayah", "Dad"], ["Ibu", "Mum"], ["Atuk", "Grandpa"], ["Nenek", "Grandma"], ["Abang", "Older brother"], ["Kakak", "Older sister"], ["Adik", "Younger sibling"], ["Pak cik", "Uncle"], ["Mak cik", "Aunt"]];
  function show(){ c.textContent = ""; var tree = el("div", "kwTree"); list.forEach(function(m, i){ var b = el("div", "kwMem1"); b.innerHTML = '<span class="kwBall" style="background:' + PAL[(i + 3) % PAL.length] + '"></span><b>' + E(m.n) + '</b><small>' + E(T(REL[m.r][0] + "|" + REL[m.r][1])) + '</small>'; var x = btn("✕", "kwX2", function(){ list.splice(i, 1); ctx.save(); show(); }); x.setAttribute("aria-label", L("Buang", "Remove")); b.appendChild(x); tree.appendChild(b); }); c.appendChild(tree);
    var f = el("div", "kwSec"), inp = el("input", "kwIn"); inp.placeholder = L("Nama", "Name"); inp.maxLength = 24; f.appendChild(inp); var sl = el("div", "kwChips"), rel = 0; REL.forEach(function(r, i){ var b = btn(T(r[0] + "|" + r[1]), "alt kwChip", function(){ rel = i; Array.prototype.forEach.call(sl.children, function(x){ x.classList.remove("on"); }); b.classList.add("on"); }); if(i === 0) b.classList.add("on"); sl.appendChild(b); }); f.appendChild(sl);
    f.appendChild(btn("＋ " + L("Tambah", "Add"), "kwGo", function(){ if(!inp.value.trim()) return; list.push({n:inp.value.trim(), r:rel}); ctx.save(); show(); })); c.appendChild(f); if(list.length >= 2) doneBar(c); }
  show(); }

/* ---------- stickers, tower, soon, launchers ---------- */
function stickers(){ var c = frame(T(act.n), L("Dapat daripada bintang", "Unlocked with stars")), g = el("div", "kwStk2"), stars = ctx.st.stars || 0; K.BANK.stickers.forEach(function(s, i){ var need = i * 4, ok = stars >= need, b = el("div", "kwSticker" + (ok ? "" : " lock"), ok ? s : "🔒"); b.title = need + " ⭐"; b.appendChild(el("small", null, need + "⭐")); g.appendChild(b); }); c.appendChild(g); doneBar(c, L("Cantik!", "Lovely!")); }
function tower(){ var c = frame(T(K.TOWER.n1) + " ⭐", L("Tahap dan bintang anda", "Your level and stars")), stars = ctx.st.stars || 0, lvl = 1 + Math.floor(stars / 15), nx = 15 - (stars % 15);
  c.appendChild(el("div", "kwBig", "⭐ " + stars)); c.appendChild(el("p", "kwP", L("Tahap ", "Level ") + lvl + " · " + nx + L(" bintang lagi untuk tahap seterusnya", " more stars to the next level")));
  var sh = el("div", "kwSec"); sh.appendChild(el("b", null, L("Rak lencana", "Badge shelf"))); var row = el("div", "kwBadges"); K.BANK.badges.forEach(function(b){ var on = stars >= b[2]; row.appendChild(el("div", "kwBadge" + (on ? " on" : ""), "<span>" + (on ? b[0] : "🔒") + "</span><small>" + E(T(b[1])) + "</small>")); }); sh.appendChild(row); c.appendChild(sh);
  var g = ctx.st.goal, week = ctx.weekCount(g ? g.kind : ""); var gs = el("div", "kwSec"); gs.appendChild(el("b", null, L("Matlamat mingguan", "Weekly goal")));
  if(!g || g.w !== ctx.weekId()){ var r = el("div", "kwChips"); K.BANK.goals.forEach(function(x, i){ r.appendChild(btn(T(x[0]), "alt kwChip", function(){ ctx.st.goal = {w:ctx.weekId(), i:i, kind:i < 2 ? "acts" : i === 2 ? "houses" : "doa", t:x[1], got:0}; ctx.save(); tower(); })); }); gs.appendChild(el("p", "kwMut", L("Pilih satu matlamat:", "Pick one goal:"))); gs.appendChild(r); }
  else { var cur = ctx.weekCount(g.kind), pc = Math.min(100, cur * 100 / g.t); gs.appendChild(el("p", "kwP", E(T(K.BANK.goals[g.i][0])) + " · " + Math.min(cur, g.t) + "/" + g.t)); var bar = el("div", "kwBar"); bar.innerHTML = '<i style="width:' + pc + '%"></i>'; gs.appendChild(bar); if(cur >= g.t && !g.paid){ g.paid = 1; ctx.addStars(5); ctx.save(); gs.appendChild(el("p", "kwP", "🎉 +5 ⭐")); } }
  c.appendChild(gs); }
function soon(){ var c = frame(T(act.n)); c.appendChild(el("div", "kwMoon", act.ic || "🚧")); c.appendChild(el("p", "kwP", L("Aktiviti ini akan datang tidak lama lagi, insya-Allah.", "This activity is coming soon, in sha Allah."))); c.appendChild(btn(L("Tutup", "Close"), "alt", function(){ ctx.close(); })); }
/* ---------- 0.7.68 (owner): sort, count, dig, target, note ---------- */
// sort: tap the right box for each thing. act.bank = {bins:["A|A","B|B"], items:[["🍎 apple|apple", 0], ...]}
function sort(){ var B = K.BANK[act.bank], items = shuffle(B.items).slice(0, 8), n = 0, right = 0, c = frame(T(act.n), L("Pilih kotak yang betul", "Pick the right box"));
  function show(){ c.textContent = ""; if(n >= items.length){ c.appendChild(el("div", "kwBig", right + " / " + items.length)); c.appendChild(el("p", "kwP", right >= items.length - 2 ? L("MasyaAllah! Hebat!", "MashaAllah! Great job!") : L("Cuba lagi, anda boleh!", "Try again, you can do it!"))); var r = el("div", "kwRow"); if(right >= items.length - 2) r.appendChild(btn("✓ " + L("Siap", "Done"), "kwGo", function(){ finish(true); })); else r.appendChild(btn("↻ " + L("Cuba lagi", "Try again"), "kwGo", function(){ n = 0; right = 0; items = shuffle(B.items).slice(0, 8); show(); })); c.appendChild(r); return; }
    var it = items[n]; c.appendChild(el("div", "kwStep", (n + 1) + " / " + items.length)); c.appendChild(el("div", "kwSortIt", E(T(it[0]))));
    var row = el("div", "kwSortB"); B.bins.forEach(function(b, i){ var x = btn(E(T(b)), "kwOpt kwBin", function(){ var ok = i === it[1]; if(ok){ right++; H.vib(30); } x.classList.add(ok ? "good" : "bad"); Array.prototype.forEach.call(row.children, function(y){ y.disabled = true; }); if(!ok) row.children[it[1]].classList.add("good"); if(!ok && it[2]) c.appendChild(el("p", "kwP", E(T(it[2])))); setTimeout(function(){ n++; show(); }, ok ? 600 : 1500); }); row.appendChild(x); }); c.appendChild(row); }
  show(); }
// count: how many? act.ic2 = the thing to count
function count(){ var c = frame(T(act.n), L("Kira dengan teliti", "Count carefully")), n = 0, right = 0, things = act.things || ["🐟"];
  function show(){ c.textContent = ""; if(n >= 5){ c.appendChild(el("div", "kwBig", right + " / 5")); var r = el("div", "kwRow"); r.appendChild(btn(right >= 3 ? "✓ " + L("Siap", "Done") : "↻ " + L("Cuba lagi", "Try again"), "kwGo", function(){ if(right >= 3) finish(true); else { n = 0; right = 0; show(); } })); c.appendChild(r); return; }
    var k = 3 + Math.floor(Math.random() * 10), th = pick(things), box2 = el("div", "kwCount"); for(var i = 0; i < k; i++){ var s = el("span", null, th); s.style.transform = "translate(" + (Math.random() * 10 - 5) + "px," + (Math.random() * 10 - 5) + "px) rotate(" + (Math.random() * 30 - 15) + "deg)"; box2.appendChild(s); }
    c.appendChild(el("div", "kwStep", (n + 1) + " / 5")); c.appendChild(box2); if(act.q) c.appendChild(el("p", "kwP", E(T(act.q))));
    var o = [k]; while(o.length < 3){ var v = k + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2)); if(v > 0 && o.indexOf(v) < 0) o.push(v); } var opts = el("div", "kwOpts");
    shuffle(o).forEach(function(v){ var b = btn(String(v), "kwOpt", function(){ var ok = v === k; if(ok){ right++; H.vib(30); } b.classList.add(ok ? "good" : "bad"); Array.prototype.forEach.call(opts.children, function(x){ x.disabled = true; if(+x.textContent === k) x.classList.add("good"); }); setTimeout(function(){ n++; show(); }, ok ? 600 : 1100); }); opts.appendChild(b); }); c.appendChild(opts); }
  show(); }
// dig: brush the sand away (tap squares) to find the hidden fossils
function dig(){ var c = frame(T(act.n), L("Ketik pasir untuk menggali", "Tap the sand to dig")), N = 25, F = act.finds || ["🦴", "🐚", "🦷", "🪨"], hide = {}, found = 0, taps = 0, info = el("div", "kwStep"), grid = el("div", "kwDig");
  shuffle(Array.apply(null, {length:N}).map(function(_, i){ return i; })).slice(0, F.length).forEach(function(i, k){ hide[i] = F[k]; });
  function upd(){ info.textContent = L("Jumpa: ", "Found: ") + found + " / " + F.length + " · " + L("Gali: ", "Digs: ") + taps; }
  for(var i = 0; i < N; i++)(function(i){ var b = btn("", "kwDigC", function(){ if(b.classList.contains("op")) return; b.classList.add("op"); taps++; if(hide[i]){ b.textContent = hide[i]; found++; H.vib(60); } upd(); if(found === F.length){ setTimeout(function(){ c.appendChild(el("p", "kwP", L("Hebat, ahli kaji purba cilik!", "Great, little archaeologist!"))); doneBar(c); }, 300); } }); grid.appendChild(b); })(i);
  upd(); c.appendChild(info); c.appendChild(grid); }
// target: tap the thing as it moves (archery, kite, bee); act.hit = emoji, act.goal
function target(){ var c = frame(T(act.n), act.q ? T(act.q) : L("Ketik bila ia bergerak", "Tap it as it moves")), goal = act.goal || 8, hits = 0, misses = 0, field = el("div", "kwTgtF"), t = btn(act.hit || "🎯", "kwTgt"), info = el("div", "kwStep"), iv = null;
  function upd(){ info.textContent = L("Kena: ", "Hits: ") + hits + " / " + goal; }
  function move(){ t.style.left = (8 + Math.random() * 74) + "%"; t.style.top = (8 + Math.random() * 70) + "%"; }
  t.onclick = function(e){ e.stopPropagation(); hits++; H.vib(30); t.classList.remove("pop"); void t.offsetWidth; t.classList.add("pop"); upd(); move(); if(hits >= goal){ clearInterval(iv); iv = null; field.appendChild(el("div", "kwBig", "🎉")); doneBar(c); } };
  field.onclick = function(){ misses++; }; field.appendChild(t); c.appendChild(info); c.appendChild(field); upd(); move(); iv = setInterval(function(){ if(!document.body.contains(field)){ clearInterval(iv); return; } move(); }, act.speed || 1300); ctx.onStop = function(){ if(iv) clearInterval(iv); }; }
// note: a little card to someone (thank-you, salam); saved and shareable
function note(){ var list = V("notes", []), c = frame(T(act.n), act.q ? T(act.q) : ""), card = el("div", "kwNote"), to = el("input", "kwIn"), ta = el("textarea", "kwTa"), stk = act.stk || ["💌", "🌸", "⭐", "🤲", "🌙"], sel = stk[0];
  to.placeholder = act.to ? T(act.to) : L("Untuk siapa?", "Who is it for?"); to.maxLength = 30; ta.maxLength = 140; ta.placeholder = act.ph ? T(act.ph) : L("Tulis mesej anda…", "Write your message…"); if(act.start) ta.value = T(act.start);
  var row = el("div", "kwStk"); stk.forEach(function(s){ var b = btn(s, "kwStkB", function(){ sel = s; Array.prototype.forEach.call(row.children, function(x){ x.classList.remove("on"); }); b.classList.add("on"); }); if(s === sel) b.classList.add("on"); row.appendChild(b); });
  card.appendChild(row); card.appendChild(to); card.appendChild(ta); c.appendChild(card);
  var r = el("div", "kwRow"); r.appendChild(btn("📤 " + L("Hantar", "Send"), "alt", function(){ var t = sel + " " + (to.value.trim() ? to.value.trim() + ",\n" : "") + ta.value.trim(); if(!ta.value.trim()){ H.toast(L("Tulis sesuatu dahulu", "Write something first")); return; } if(H.share) H.share(T(act.n), t); else if(navigator.share) navigator.share({text:t}).catch(function(){}); }));
  r.appendChild(btn("✓ " + L("Simpan", "Save"), "kwGo", function(){ if(!ta.value.trim()){ H.toast(L("Tulis sesuatu dahulu", "Write something first")); return; } list.unshift({d:ymd(), k:act.id, s:sel, to:to.value.trim(), t:ta.value.trim()}); if(list.length > 30) list.length = 30; ctx.save(); finish(true); })); c.appendChild(r);
  list.filter(function(x){ return x.k === act.id; }).slice(0, 3).forEach(function(e){ c.appendChild(el("div", "kwLog", "<b>" + E(e.d) + "</b> " + E(e.s) + " " + (e.to ? E(e.to) + ": " : "") + E(e.t))); }); }
/* ---------- 0.7.72 (owner): the family's pets inside the planet: the 3D phone pet and a big "my pet" page ---------- */
function petsReady(fn){ var ph = H.pets ? H.pets() : null; if(!ph){ body.appendChild(el("p", "kwP", L("Tidak tersedia.", "Not available."))); return; }
  if(!document.querySelector('link[href="pets/pets.css"]')){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "pets/pets.css"; document.head.appendChild(l); }
  if(window.PetMgr && window.PetData) fn(ph); else H.loadJs(["pets/pets_data.js", "pets/pets.js"], function(){ fn(ph); }, function(){}); }
function vpet(){ var c = frame(T(act.n), L("Beri makan, main, belai, mandikan", "Feed, play, stroke, bathe")), host = el("div"), pp = null; c.appendChild(host);
  var go = function(ph){ pp = window.PhonePets.open(ph, {host: host, compact: true}); };   // 0.7.73: the same phone pets as Tools › Pets, with Meet and Planet
  petsReady(function(ph){ if(window.PhonePets) go(ph); else H.loadJs(["pets/phonepets.js"], function(){ go(ph); }, function(){}); }); doneBar(c, L("Saya sudah jaga pet saya", "I looked after my pet")); ctx.onStop = function(){ if(pp) try{ pp.close(); }catch(e){} }; }
function mypet(){ var c = frame(T(act.n)), host = el("div"); c.appendChild(host);
  petsReady(function(ph){ var d = ph.load("ihsan_pets", null); if(!d || !d.pets || !d.pets.length){ host.appendChild(el("p", "kwP", L("Minta ibu bapa tambah haiwan di Alat › Haiwan.", "Ask a parent to add a pet in Tools › Pets."))); return; } PetMgr.kidsPage(ph, null, host); }); doneBar(c, L("Saya sayang haiwan saya", "I love my pet")); }
function launch(){ ctx.mark(act); if(act.t === "learn") H.learn(act.page); else if(act.t === "sirah") H.sirah(); else if(act.t === "hajj") H.hajj(); else if(act.t === "xquiz" && H.quiz) H.quiz(); }

var TYPES = {vpet:vpet, mypet:mypet, sort:sort, count:count, dig:dig, target:target, note:note, quiz:quiz, tip:tip, doa:doa, asma:asma, memory:memory, check:check, timer:timer, moves:moves, breath:breath, counter:counter, draw:draw, colour:colour, moon:moon, diary:diary, story:story, plant:plant, feel:feel, family:family, stickers:stickers, tower:tower, soon:soon};
K.play = function(a, c){ act = a; ctx = c; H = c.H; box = c.box; body = box; if(ctx.onStop){ try{ ctx.onStop(); }catch(e){} ctx.onStop = null; }
  if(a.t === "xquiz"){ launch(); ctx.close(); return; }
  if(a.t === "learn" || a.t === "sirah" || a.t === "hajj"){ launch(); return; }
  var f = TYPES[a.t] || soon; try{ f(); }catch(e){ console.error(e); body.textContent = ""; body.appendChild(head(T(a.n))); body.appendChild(el("p", "kwP", L("Aktiviti ini gagal dimuatkan.", "This activity could not load."))); } };
K.playTower = function(c){ K.play({t:"tower", id:"tower", n:K.TOWER.n1}, c); };
K.isLive = function(a){ return a.t !== "soon"; };
})();
