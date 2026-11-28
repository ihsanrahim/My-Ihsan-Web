/* My Ihsan 0.7.93 · Kids › 🔤 Word games: 10 games, each in BM, English and Arabic (Arabic without harakat, letters joined only inside words).
   1 Teka kata (5 letters, 6 tries; Arabic 4) · 2 Silang kata (crossword, emoji clues) · 3 Cari kata (word search) · 4 Susun huruf · 5 Belon huruf (guess the letters)
   6 Padan gambar · 7 Huruf hilang · 8 Memori · 9 Rantai kata (next word starts with the last letter) · 10 Terjemah (BM ↔ English ↔ Arabic).
   KG.W = word data shared with kg_learn.js (spelling bee, typing). */
(function(){ "use strict";
var KG = window.KG;
// [emoji, English, Malay, Arabic, group]
var W = [["🐱","cat","kucing","قطة","a"],["🐦","bird","burung","طائر","a"],["🐟","fish","ikan","سمكة","a"],["🐴","horse","kuda","حصان","a"],["🐪","camel","unta","جمل","a"],["🐄","cow","lembu","بقرة","a"],["🐑","sheep","biri-biri","خروف","a"],["🐐","goat","kambing","ماعز","a"],
 ["🦁","lion","singa","أسد","a"],["🐘","elephant","gajah","فيل","a"],["🐰","rabbit","arnab","أرنب","a"],["🐒","monkey","monyet","قرد","a"],["🐔","chicken","ayam","دجاجة","a"],["🦆","duck","itik","بطة","a"],["🐝","bee","lebah","نحلة","a"],["🐜","ant","semut","نملة","a"],
 ["🦋","butterfly","rama-rama","فراشة","a"],["🐍","snake","ular","ثعبان","a"],["🐢","turtle","penyu","سلحفاة","a"],["🐸","frog","katak","ضفدع","a"],["🦉","owl","burung hantu","بومة","a"],["🐳","whale","ikan paus","حوت","a"],["🐻","bear","beruang","دب","a"],["🐯","tiger","harimau","نمر","a"],["🐭","mouse","tikus","فأر","a"],
 ["🍎","apple","epal","تفاحة","f"],["🍌","banana","pisang","موزة","f"],["🍇","grapes","anggur","عنب","f"],["🍊","orange","oren","برتقالة","f"],["🍉","watermelon","tembikai","بطيخ","f"],["🥭","mango","mangga","مانجو","f"],["🌴","dates","kurma","تمر","f"],["🥛","milk","susu","حليب","f"],["💧","water","air","ماء","f"],
 ["🍞","bread","roti","خبز","f"],["🍚","rice","nasi","أرز","f"],["🥚","egg","telur","بيضة","f"],["🍯","honey","madu","عسل","f"],["🧀","cheese","keju","جبن","f"],["🍋","lemon","limau","ليمون","f"],
 ["☀️","sun","matahari","شمس","n"],["🌙","moon","bulan","قمر","n"],["⭐","star","bintang","نجمة","n"],["☁️","cloud","awan","سحابة","n"],["🌧️","rain","hujan","مطر","n"],["🌳","tree","pokok","شجرة","n"],["🌸","flower","bunga","زهرة","n"],["🌊","sea","laut","بحر","n"],["⛰️","mountain","gunung","جبل","n"],
 ["🏞️","river","sungai","نهر","n"],["🔥","fire","api","نار","n"],["❄️","snow","salji","ثلج","n"],["🌍","earth","bumi","أرض","n"],["🌬️","wind","angin","ريح","n"],
 ["🏠","house","rumah","بيت","h"],["🚪","door","pintu","باب","h"],["🪟","window","tingkap","نافذة","h"],["🪑","chair","kerusi","كرسي","h"],["🛏️","bed","katil","سرير","h"],["📖","book","buku","كتاب","h"],["🖊️","pen","pen","قلم","h"],["🏫","school","sekolah","مدرسة","h"],["🎒","bag","beg","حقيبة","h"],
 ["🔑","key","kunci","مفتاح","h"],["⏰","clock","jam","ساعة","h"],["📱","phone","telefon","هاتف","h"],["🥤","cup","cawan","كوب","h"],["🥄","spoon","sudu","ملعقة","h"],["👕","shirt","baju","قميص","h"],["👟","shoe","kasut","حذاء","h"],["🧢","hat","topi","قبعة","h"],["☂️","umbrella","payung","مظلة","h"],["🎁","gift","hadiah","هدية","h"],["⚽","ball","bola","كرة","h"],["🕌","mosque","masjid","مسجد","h"],
 ["🚗","car","kereta","سيارة","t"],["🚌","bus","bas","حافلة","t"],["✈️","plane","kapal terbang","طائرة","t"],["🚢","ship","kapal","سفينة","t"],["🚲","bicycle","basikal","دراجة","t"],["🚆","train","kereta api","قطار","t"],
 ["👁️","eye","mata","عين","b"],["👂","ear","telinga","أذن","b"],["👃","nose","hidung","أنف","b"],["👄","mouth","mulut","فم","b"],["✋","hand","tangan","يد","b"],["🦶","foot","kaki","قدم","b"],["❤️","heart","hati","قلب","b"],
 ["🔴","red","merah","أحمر","c"],["🔵","blue","biru","أزرق","c"],["🟢","green","hijau","أخضر","c"],["🟡","yellow","kuning","أصفر","c"],["⚪","white","putih","أبيض","c"],["⚫","black","hitam","أسود","c"],
 ["👨","father","ayah","أب","p"],["👩","mother","ibu","أم","p"],["👶","baby","bayi","طفل","p"],["🧑‍🤝‍🧑","friend","kawan","صديق","p"],["👦","boy","budak lelaki","ولد","p"],["👧","girl","budak perempuan","بنت","p"],["🧑‍🏫","teacher","guru","معلم","p"],["👨‍⚕️","doctor","doktor","طبيب","p"]];
// extra words for the 5-letter puzzle and spelling (length-checked when used)
var X5 = {ms: "RUMAH BUNGA MAKAN MINUM HUJAN BULAN PANAS SEJUK MERAH HIJAU PUTIH HITAM KAPAL PINTU KUNCI BASAH BESAR KECIL MANIS MASAM PEDAS GARAM LAPAR TIDUR MANDI BUKIT PASIR SAYUR TELUR MURID KELAS WARNA SUARA MALAM SIANG TAHUN DUNIA JALAN POLIS SOLAT PUASA ZAKAT SURAU SABAR JUJUR RAJIN SEDIH TAKUT LEMAH CEPAT MUDAH SUSAH BETUL SALAH KAWAN JIRAN ABANG KAKAK NENEK DATUK SINGA GAJAH ARNAB BUMI LEBAH SEMUT KATAK TIKUS KURMA ANGIN KASUT KERUSI".split(" "),
  en: "APPLE HOUSE WATER LIGHT HAPPY SMILE TIGER HORSE CAMEL SHEEP MOUSE GRAPE LEMON MANGO BREAD HONEY CLOUD RIVER BEACH PLANT CHAIR TABLE CLOCK PHONE SHIRT TRAIN PLANE TRUCK PAPER CHALK CLASS LEARN WRITE MUSIC SLEEP DREAM NIGHT EARTH OCEAN STORM SUNNY GREEN BROWN WHITE BLACK PEACE HEART BRAVE SMART QUICK QUIET SWEET FRUIT JUICE SALAD SPOON KNIFE PLATE GLASS BRUSH TOWEL WHALE SNAKE EAGLE ZEBRA SHARK MONEY".split(" "),
  ar: []};
var ABC = {ms: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), ar: "ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ة ء".split(" ")};
function arN(s){ return String(s).replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/[ً-ٰٟ]/g, ""); }
function wd(e, l){ var w = l === "en" ? e[1] : l === "ms" ? e[2] : e[3]; return l === "ar" ? arN(w) : w.toUpperCase(); }
function letters(w){ return Array.from(w); }
function single(l){ return W.filter(function(e){ return !/[\s-]/.test(wd(e, l)); }); }
function five(l){ var n = l === "ar" ? 4 : 5, out = {}; single(l).forEach(function(e){ var w = wd(e, l); if(letters(w).length === n) out[w] = e[0]; }); (X5[l] || []).forEach(function(w){ if(letters(w).length === n && !out[w]) out[w] = ""; }); return Object.keys(out).map(function(w){ return [w, out[w]]; }); }
KG.W = {W: W, ABC: ABC, wd: wd, single: single, five: five, arN: arN, letters: letters};
function dir(l){ return l === "ar" ? ' dir="rtl" lang="ar"' : ''; }
function kb(host, l, onKey, extra){ var rows = l === "ar" ? [ABC.ar.slice(0, 10), ABC.ar.slice(10, 20), ABC.ar.slice(20)] : [ABC.en.slice(0, 10), ABC.en.slice(10, 19), ABC.en.slice(19)];
  var d = document.createElement("div"); d.className = "kgKb" + (l === "ar" ? " ar" : ""); d.innerHTML = rows.map(function(r, i){ return '<div>' + (i === 2 && extra ? '<button data-k="✓" class="w">✓</button>' : '') + r.map(function(c){ return '<button data-k="' + c + '">' + c + '</button>'; }).join("") + (i === 2 ? '<button data-k="⌫" class="w">⌫</button>' : '') + '</div>'; }).join("");
  d.addEventListener("click", function(e){ var b = e.target.closest("[data-k]"); if(b) onKey(b.getAttribute("data-k"), b); }); host.appendChild(d); return d; }
function head(host, ctx, opts, redraw){ host.innerHTML = ""; var lb = ctx.langBar(opts || ["ms", "en", "ar"], function(){ redraw(); }); host.appendChild(lb.el); return lb.l; }
function win(ctx, host, id, msg, n){ var st = ctx.get(id); st.n = (st.n || 0) + 1; ctx.put(id, st); ctx.star(n || 1); ctx.confetti(host); ctx.vib(60); var r = document.createElement("div"); r.className = "kgWin"; r.innerHTML = '<b>🌟 ' + msg + '</b><button class="btn gold">🔁 ' + ctx.L("Main lagi", "Play again") + '</button>'; host.appendChild(r); return r.querySelector("button"); }

// 1 ── Teka kata (Wordle-style) ───────────────────────────────────────────
KG.reg.wordle = {hub: "word", o: 1, ic: "🟩", ms: "Teka kata", en: "Word guess", dms: "5 huruf, 6 cubaan", den: "5 letters, 6 tries", run: function(host, ctx){
  var draw = function(practice){ var l = head(host, ctx, null, function(){ draw(false); }), list = five(l), n = l === "ar" ? 4 : 5, day = ctx.today(), r = ctx.seeded(+day.replace(/-/g, "") * 7 + l.length * 131 + (l === "ar" ? 3 : 0));
    var ans = practice ? list[ctx.rnd(list.length)] : list[Math.floor(r() * list.length)], st = ctx.get("wordle"), key = l + day, rows = practice ? [] : ((st.g || {})[key] || []).slice(), cur = [];
    var box = document.createElement("div"); box.innerHTML = '<div class="kgWdl"' + dir(l) + ' style="--n:' + n + '"></div><div class="kgHint">' + (ans[1] ? ctx.L("Petunjuk: ", "Hint: ") + ans[1] : ctx.L("Tiada petunjuk gambar", "No picture hint")) + (practice ? " · " + ctx.L("latihan", "practice") : " · " + ctx.L("kata hari ini", "today's word")) + '</div>'; host.appendChild(box);
    var G = box.querySelector(".kgWdl"), A = letters(ans[0]), done = false, keys = {};
    var score = function(g){ var res = g.map(function(){ return "x"; }), left = {}; A.forEach(function(c, i){ if(g[i] === c) res[i] = "g"; else left[c] = (left[c] || 0) + 1; }); g.forEach(function(c, i){ if(res[i] !== "g" && left[c]){ res[i] = "y"; left[c]--; } }); return res; };
    var paint = function(){ var h = ""; for(var i = 0; i < 6; i++){ var g = rows[i] ? letters(rows[i]) : i === rows.length ? cur : [], sc = rows[i] ? score(g) : null; for(var j = 0; j < n; j++) h += '<span class="' + (sc ? sc[j] : g[j] ? "t" : "") + '">' + (g[j] || "") + '</span>'; } G.innerHTML = h;
      rows.forEach(function(rw){ var g = letters(rw), sc = score(g); g.forEach(function(c, i){ var v = sc[i]; if(keys[c] !== "g") keys[c] = v === "g" ? "g" : keys[c] === "y" ? "y" : v; }); }); if(K) K.querySelectorAll("[data-k]").forEach(function(b){ var k = b.getAttribute("data-k"); b.className = (b.className.indexOf("w") >= 0 ? "w " : "") + (keys[k] || ""); }); };
    var end = function(){ done = true; var ok = rows[rows.length - 1] === ans[0]; if(!practice){ st.g = st.g || {}; st.g[key] = rows; if(ok){ st.n = (st.n || 0) + 1; } ctx.put("wordle", st); }
      var grid = rows.map(function(rw){ return score(letters(rw)).map(function(v){ return v === "g" ? "🟩" : v === "y" ? "🟨" : "⬜"; }).join(""); }).join("\n");
      var m = document.createElement("div"); m.className = "kgWin"; m.innerHTML = '<b>' + (ok ? "🌟 " + ctx.L("Betul! ", "Got it! ") : "🙂 " + ctx.L("Jawapan: ", "Answer: ")) + '<span' + dir(l) + '>' + ans[0] + '</span></b><div class="kgBtns"><button class="btn alt" id="wlS">📤 ' + ctx.L("Kongsi", "Share") + '</button><button class="btn gold" id="wlP">🔁 ' + ctx.L("Latihan", "Practice") + '</button></div>'; host.appendChild(m);
      if(ok && !practice){ ctx.star(2); ctx.confetti(host); }
      m.querySelector("#wlP").onclick = function(){ draw(true); };
      m.querySelector("#wlS").onclick = function(){ var t = "My Ihsan · " + ctx.L("Teka kata", "Word guess") + " " + day + " " + (ok ? rows.length : "X") + "/6\n" + grid; try{ if(navigator.share) navigator.share({text: t}).catch(function(){}); else navigator.clipboard.writeText(t).then(function(){ ctx.toast(ctx.L("Disalin", "Copied")); }); }catch(e){} }; };
    var K = kb(host, l, function(k){ if(done) return; if(k === "⌫") cur.pop(); else if(k === "✓"){ if(cur.length < n){ ctx.toast(ctx.L("Perlu " + n + " huruf", "Needs " + n + " letters")); return; } rows.push(cur.join("")); cur = []; if(!practice){ st.g = st.g || {}; st.g[key] = rows; ctx.put("wordle", st); } paint(); if(rows[rows.length - 1] === ans[0] || rows.length >= 6) end(); return; } else if(cur.length < n) cur.push(k); paint(); }, true);
    paint(); if(rows.length && (rows[rows.length - 1] === ans[0] || rows.length >= 6)) end(); };
  draw(false); }};

// 2 ── Silang kata (crossword) ────────────────────────────────────────────
function cross(words, size){ // words: [{w:[letters], e:emoji}] → {cells:{"r,c":ch}, list:[{w,e,r,c,d}]}
  var cells = {}, list = [], at = function(r, c){ return cells[r + "," + c]; };
  var fits = function(w, r, c, d){ var n = w.length, cross = 0; if(r < 0 || c < 0 || (d ? r + n : c + n) > size || (d ? c : r) >= size) return -1;
    var br = d ? r - 1 : r, bc = d ? c : c - 1, ar = d ? r + n : r, ac = d ? c : c + n; if(at(br, bc) || at(ar, ac)) return -1;
    for(var i = 0; i < n; i++){ var rr = d ? r + i : r, cc = d ? c : c + i, h = at(rr, cc); if(h){ if(h !== w[i]) return -1; cross++; } else { if(d ? (at(rr, cc - 1) || at(rr, cc + 1)) : (at(rr - 1, cc) || at(rr + 1, cc))) return -1; } } return cross; };
  var put = function(o, r, c, d){ o.w.forEach(function(ch, i){ cells[(d ? r + i : r) + "," + (d ? c : c + i)] = ch; }); list.push({w: o.w, e: o.e, r: r, c: c, d: d}); };
  words.forEach(function(o, k){ if(!k){ put(o, Math.floor(size / 2), Math.max(0, Math.floor((size - o.w.length) / 2)), 0); return; } var best = null;
    list.forEach(function(p){ p.w.forEach(function(pc, pi){ o.w.forEach(function(oc, oi){ if(pc !== oc) return; var d = p.d ? 0 : 1, r = p.d ? p.r + pi : p.r - oi, c = p.d ? p.c - oi : p.c + pi, f = fits(o.w, r, c, d); if(f > 0 && (!best || f > best[3])) best = [r, c, d, f]; }); }); });
    if(best) put(o, best[0], best[1], best[2]); });
  return {cells: cells, list: list}; }
KG.cross = cross;
KG.reg.cross = {hub: "word", o: 2, ic: "✏️", ms: "Silang kata", en: "Crossword", dms: "Petunjuk gambar", den: "Picture clues", run: function(host, ctx){
  var draw = function(){ var l = head(host, ctx, null, draw), pool = ctx.shuffle(single(l).filter(function(e){ var n = letters(wd(e, l)).length; return n >= 3 && n <= 7; })), size = 9, X = null;
    for(var t = 0; t < 12; t++){ X = cross(ctx.shuffle(pool).slice(0, 10).map(function(e){ return {w: letters(wd(e, l)), e: e[0]}; }), size); if(X.list.length >= 6) break; }
    X.list.forEach(function(p, i){ p.no = i + 1; }); var num = {}; X.list.forEach(function(p){ var k = p.r + "," + p.c; num[k] = num[k] ? num[k] + "/" + p.no : String(p.no); });
    var inp = {}, sel = null, box = document.createElement("div"), h = '<div class="kgCw"' + (l === "ar" ? ' dir="rtl"' : '') + ' style="--n:' + size + '">';
    for(var r = 0; r < size; r++) for(var c = 0; c < size; c++){ var k = r + "," + c; h += X.cells[k] ? '<button data-cw="' + k + '">' + (num[k] ? '<i>' + num[k] + '</i>' : '') + '<b></b></button>' : '<span></span>'; }
    h += '</div><div class="kgClues">' + X.list.map(function(p){ return '<button data-cl="' + p.no + '"><b>' + p.no + '</b> ' + (p.d ? "⬇" : (l === "ar" ? "⬅" : "➡")) + ' ' + p.e + ' <small>(' + p.w.length + ')</small></button>'; }).join("") + '</div>'; box.innerHTML = h; host.appendChild(box);
    var word = null, wi = 0, cellsOf = function(p){ var a = []; for(var i = 0; i < p.w.length; i++) a.push((p.d ? p.r + i : p.r) + "," + (p.d ? p.c : p.c + i)); return a; };
    var mark = function(){ box.querySelectorAll("[data-cw]").forEach(function(b){ var k = b.getAttribute("data-cw"); b.querySelector("b").textContent = inp[k] || ""; b.classList.toggle("sel", k === sel); b.classList.toggle("in", !!word && cellsOf(word).indexOf(k) >= 0); }); };
    var pick = function(p){ word = p; wi = 0; sel = cellsOf(p)[0]; box.querySelectorAll("[data-cl]").forEach(function(b){ b.classList.toggle("on", +b.getAttribute("data-cl") === p.no); }); mark(); };
    box.querySelectorAll("[data-cw]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-cw"), ps = X.list.filter(function(p){ return cellsOf(p).indexOf(k) >= 0; }); var p = ps.length > 1 && word === ps[0] ? ps[1] : ps[0]; word = p; wi = cellsOf(p).indexOf(k); sel = k; box.querySelectorAll("[data-cl]").forEach(function(x){ x.classList.toggle("on", +x.getAttribute("data-cl") === p.no); }); mark(); }; });
    box.querySelectorAll("[data-cl]").forEach(function(b){ b.onclick = function(){ pick(X.list[+b.getAttribute("data-cl") - 1]); }; });
    kb(host, l, function(k){ if(!word) pick(X.list[0]); var cs = cellsOf(word); if(k === "⌫"){ delete inp[cs[wi]]; wi = Math.max(0, wi - 1); sel = cs[wi]; mark(); return; } if(k === "✓") return; inp[cs[wi]] = k; if(wi < cs.length - 1) wi++; sel = cs[wi]; mark();
      if(Object.keys(X.cells).every(function(kk){ return inp[kk] === X.cells[kk]; })) win(ctx, host, "cross", ctx.L("Silang kata selesai!", "Crossword solved!"), 3).onclick = draw;
      else if(X.list.every(function(p){ return cellsOf(p).every(function(kk){ return inp[kk]; }); })) box.querySelectorAll("[data-cw]").forEach(function(b){ var kk = b.getAttribute("data-cw"); b.classList.toggle("bad", inp[kk] !== X.cells[kk]); }); });
    pick(X.list[0]); };
  draw(); }};

// 3 ── Cari kata (word search) ────────────────────────────────────────────
KG.reg.search = {hub: "word", o: 3, ic: "🔍", ms: "Cari kata", en: "Word search", dms: "Seret atau ketik 2 hujung", den: "Tap both ends", run: function(host, ctx){
  var draw = function(){ var l = head(host, ctx, null, draw), n = 9, g = [], used = [], dirs = l === "ar" ? [[0, -1], [1, 0], [1, -1]] : [[0, 1], [1, 0], [1, 1]];
    for(var i = 0; i < n; i++){ g.push([]); for(var j = 0; j < n; j++) g[i].push(""); }
    ctx.shuffle(single(l).filter(function(e){ var m = letters(wd(e, l)).length; return m >= 3 && m <= 7; })).some(function(e){ if(used.length >= 7) return true; var w = letters(wd(e, l));
      for(var t = 0; t < 60; t++){ var d = dirs[ctx.rnd(dirs.length)], r = ctx.rnd(n), c = ctx.rnd(n), ok = true; for(var k = 0; k < w.length; k++){ var rr = r + d[0] * k, cc = c + d[1] * k; if(rr < 0 || cc < 0 || rr >= n || cc >= n || (g[rr][cc] && g[rr][cc] !== w[k])){ ok = false; break; } }
        if(ok){ var pos = []; for(var k2 = 0; k2 < w.length; k2++){ g[r + d[0] * k2][c + d[1] * k2] = w[k2]; pos.push((r + d[0] * k2) + "," + (c + d[1] * k2)); } used.push({e: e, w: w.join(""), pos: pos}); break; } } return false; });
    var A = ABC[l]; for(var a = 0; a < n; a++) for(var b = 0; b < n; b++) if(!g[a][b]) g[a][b] = A[ctx.rnd(A.length)];
    var box = document.createElement("div"); box.innerHTML = '<div class="kgWs" style="--n:' + n + '"' + (l === "ar" ? ' lang="ar"' : '') + '>' + g.map(function(row, r){ return row.map(function(ch, c){ return '<button data-ws="' + r + "," + c + '">' + ch + '</button>'; }).join(""); }).join("") + '</div><div class="kgWsL">' + used.map(function(u, i){ return '<span data-wl="' + i + '">' + u.e[0] + ' <b' + dir(l) + '>' + u.w + '</b></span>'; }).join("") + '</div>'; host.appendChild(box);
    var first = null, found = 0;
    box.querySelectorAll("[data-ws]").forEach(function(btn){ btn.onclick = function(){ var k = btn.getAttribute("data-ws"); if(!first){ first = k; btn.classList.add("a"); return; } var p = first.split(",").map(Number), q = k.split(",").map(Number); box.querySelector('[data-ws="' + first + '"]').classList.remove("a"); first = null;
      var dr = Math.sign(q[0] - p[0]), dc = Math.sign(q[1] - p[1]), len = Math.max(Math.abs(q[0] - p[0]), Math.abs(q[1] - p[1])) + 1, path = []; for(var s = 0; s < len; s++) path.push((p[0] + dr * s) + "," + (p[1] + dc * s));
      used.forEach(function(u, i){ if(u.f) return; var same = u.pos.join("|") === path.join("|") || u.pos.slice().reverse().join("|") === path.join("|"); if(same){ u.f = 1; found++; u.pos.forEach(function(kk){ box.querySelector('[data-ws="' + kk + '"]').classList.add("f"); }); box.querySelector('[data-wl="' + i + '"]').classList.add("f"); ctx.vib(30); } });
      if(found === used.length) win(ctx, host, "search", ctx.L("Semua kata dijumpai!", "All words found!"), 2).onclick = draw; }; }); };
  draw(); }};

// 4 ── Susun huruf (scramble) ─────────────────────────────────────────────
function tilesGame(host, ctx, id, pickWord, title){ var score = 0, round = 0;
  var draw = function(){ var l = head(host, ctx, null, draw), e = pickWord(l), w = letters(wd(e, l)), mix = w.slice(); do { mix = ctx.shuffle(w); } while(mix.join("") === w.join("") && w.length > 1);
    var got = [], box = document.createElement("div"); box.innerHTML = '<div class="kgPic">' + e[0] + '</div><div class="kgSlots"' + dir(l) + '>' + w.map(function(){ return '<span></span>'; }).join("") + '</div><div class="kgTiles"' + dir(l) + '>' + mix.map(function(c, i){ return '<button data-t="' + i + '">' + c + '</button>'; }).join("") + '</div><div class="kgBtns"><button class="btn alt" id="tgU">↺</button><button class="btn alt" id="tgS">⏭ ' + ctx.L("Langkau", "Skip") + '</button></div><div class="mut small kgSc">✓ ' + score + ' / ' + round + '</div>'; host.appendChild(box);
    var S = box.querySelectorAll(".kgSlots span"), paint = function(){ S.forEach(function(s, i){ s.textContent = got[i] != null ? mix[got[i]] : ""; }); box.querySelectorAll("[data-t]").forEach(function(b){ b.disabled = got.indexOf(+b.getAttribute("data-t")) >= 0; }); };
    box.querySelectorAll("[data-t]").forEach(function(b){ b.onclick = function(){ got.push(+b.getAttribute("data-t")); paint(); if(got.length === w.length){ var ok = got.map(function(i){ return mix[i]; }).join("") === w.join(""); box.querySelector(".kgSlots").classList.add(ok ? "ok" : "no"); round++; if(ok){ score++; ctx.vib(30); var st = ctx.get(id); st.n = (st.n || 0) + 1; ctx.put(id, st); if(score % 5 === 0){ ctx.star(1); ctx.confetti(host); } setTimeout(draw, 900); } else { ctx.vib([30, 40, 30]); setTimeout(function(){ got = []; box.querySelector(".kgSlots").classList.remove("no"); paint(); }, 700); } } }; });
    box.querySelector("#tgU").onclick = function(){ got.pop(); paint(); }; box.querySelector("#tgS").onclick = function(){ round++; draw(); }; };
  draw(); }
KG.reg.scramble = {hub: "word", o: 4, ic: "🔀", ms: "Susun huruf", en: "Unscramble", dms: "Susun ikut gambar", den: "Match the picture", run: function(host, ctx){ tilesGame(host, ctx, "scramble", function(l){ var p = single(l).filter(function(e){ var n = letters(wd(e, l)).length; return n >= 3 && n <= 8; }); return p[ctx.rnd(p.length)]; }); }};

// 5 ── Belon huruf (guess the letters; a balloon pops for each wrong letter) ─
KG.reg.balloon = {hub: "word", o: 5, ic: "🎈", ms: "Belon huruf", en: "Balloon letters", dms: "Teka huruf, 6 belon", den: "Guess letters, 6 balloons", run: function(host, ctx){
  var draw = function(){ var l = head(host, ctx, null, draw), p = single(l).filter(function(e){ return letters(wd(e, l)).length >= 4; }), e = p[ctx.rnd(p.length)], w = letters(wd(e, l)), got = {}, miss = 0, done = false;
    var box = document.createElement("div"); host.appendChild(box);
    var paint = function(){ box.innerHTML = '<div class="kgBal">' + [0, 1, 2, 3, 4, 5].map(function(i){ return '<span class="' + (i < miss ? "pop" : "") + '">' + (i < miss ? "💥" : "🎈") + '</span>'; }).join("") + '</div><div class="kgPic sm">' + e[0] + '</div><div class="kgSlots"' + dir(l) + '>' + w.map(function(c){ return '<span>' + (got[c] || done ? c : "") + '</span>'; }).join("") + '</div>'; };
    paint(); var K = kb(host, l, function(k, b){ if(done || k === "⌫" || k === "✓" || b.disabled) return; b.disabled = true; if(w.indexOf(k) >= 0){ got[k] = 1; b.className = "g"; ctx.vib(20); } else { miss++; b.className = "x"; ctx.vib([30, 40, 30]); }
      if(w.every(function(c){ return got[c]; })){ done = true; paint(); win(ctx, host, "balloon", ctx.L("Betul!", "Correct!"), 1).onclick = draw; } else if(miss >= 6){ done = true; paint(); var m = document.createElement("div"); m.className = "kgWin"; m.innerHTML = '<b>🙂 ' + ctx.L("Kata: ", "The word: ") + '<span' + dir(l) + '>' + w.join("") + '</span></b><button class="btn gold">🔁</button>'; host.appendChild(m); m.querySelector("button").onclick = draw; } else paint(); }); };
  draw(); }};

// 6 ── Padan gambar (match picture ↔ word) ────────────────────────────────
KG.reg.match = {hub: "word", o: 6, ic: "🧷", ms: "Padan gambar", en: "Match pictures", dms: "Gambar ↔ kata", den: "Picture ↔ word", run: function(host, ctx){
  var draw = function(){ var l = head(host, ctx, null, draw), set = ctx.shuffle(W).slice(0, 6), L1 = ctx.shuffle(set), R1 = ctx.shuffle(set), a = null, ok = 0, box = document.createElement("div");
    box.innerHTML = '<div class="kgMatch"><div>' + L1.map(function(e){ return '<button data-ma="' + e[1] + '" class="em">' + e[0] + '</button>'; }).join("") + '</div><div>' + R1.map(function(e){ return '<button data-mb="' + e[1] + '"' + dir(l) + '>' + ctx.E(wd(e, l)) + '</button>'; }).join("") + '</div></div>'; host.appendChild(box);
    box.querySelectorAll("[data-ma]").forEach(function(b){ b.onclick = function(){ if(b.classList.contains("ok")) return; box.querySelectorAll("[data-ma]").forEach(function(x){ x.classList.remove("a"); }); b.classList.add("a"); a = b; }; });
    box.querySelectorAll("[data-mb]").forEach(function(b){ b.onclick = function(){ if(!a || b.classList.contains("ok")) return; if(a.getAttribute("data-ma") === b.getAttribute("data-mb")){ a.classList.add("ok"); b.classList.add("ok"); a.classList.remove("a"); a = null; ok++; ctx.vib(25); if(ok === 6) win(ctx, host, "match", ctx.L("Semua padan!", "All matched!"), 1).onclick = draw; } else { b.classList.add("no"); ctx.vib([30, 40, 30]); setTimeout(function(){ b.classList.remove("no"); }, 500); } }; }); };
  draw(); }};

// 7 ── Huruf hilang (missing letter) ──────────────────────────────────────
KG.reg.missing = {hub: "word", o: 7, ic: "❓", ms: "Huruf hilang", en: "Missing letter", dms: "Pilih huruf yang betul", den: "Pick the right letter", run: function(host, ctx){ var score = 0, n = 0;
  var draw = function(){ var l = head(host, ctx, null, draw), p = single(l).filter(function(e){ return letters(wd(e, l)).length >= 3; }), e = p[ctx.rnd(p.length)], w = letters(wd(e, l)), at = ctx.rnd(w.length), A = ABC[l], opts = [w[at]];
    while(opts.length < 4){ var c = A[ctx.rnd(A.length)]; if(opts.indexOf(c) < 0) opts.push(c); } opts = ctx.shuffle(opts);
    var box = document.createElement("div"); box.innerHTML = '<div class="kgPic">' + e[0] + '</div><div class="kgSlots"' + dir(l) + '>' + w.map(function(c, i){ return '<span class="' + (i === at ? "q" : "") + '">' + (i === at ? "?" : c) + '</span>'; }).join("") + '</div><div class="kgOpts four">' + opts.map(function(c){ return '<button class="btn alt" data-ml="' + c + '">' + c + '</button>'; }).join("") + '</div><div class="mut small kgSc">✓ ' + score + ' / ' + n + '</div>'; host.appendChild(box);
    box.querySelectorAll("[data-ml]").forEach(function(b){ b.onclick = function(){ var ok = b.getAttribute("data-ml") === w[at]; n++; b.classList.add(ok ? "ok" : "no"); box.querySelector(".q").textContent = w[at]; if(ok){ score++; ctx.vib(25); var st = ctx.get("missing"); st.n = (st.n || 0) + 1; ctx.put("missing", st); if(score % 8 === 0){ ctx.star(1); ctx.confetti(host); } } else ctx.vib([30, 40, 30]); setTimeout(draw, ok ? 700 : 1300); }; }); };
  draw(); }};

// 8 ── Memori (flip pairs: picture ↔ word) ───────────────────────────────
KG.reg.memory = {hub: "word", o: 8, ic: "🃏", ms: "Memori", en: "Memory", dms: "Cari pasangan", den: "Find the pairs", run: function(host, ctx){
  var draw = function(){ var l = head(host, ctx, null, draw), set = ctx.shuffle(W).slice(0, 6), cards = ctx.shuffle(set.map(function(e){ return {k: e[1], t: e[0], em: 1}; }).concat(set.map(function(e){ return {k: e[1], t: wd(e, l)}; }))), open = [], ok = 0, tries = 0, lock = false;
    var box = document.createElement("div"); box.innerHTML = '<div class="kgMem">' + cards.map(function(c, i){ return '<button data-mc="' + i + '"><span class="' + (c.em ? "em" : "") + '"' + (c.em ? "" : dir(l)) + '>' + ctx.E(c.t) + '</span></button>'; }).join("") + '</div><div class="mut small kgSc" id="mmT"></div>'; host.appendChild(box);
    box.querySelectorAll("[data-mc]").forEach(function(b){ b.onclick = function(){ if(lock || b.classList.contains("up")) return; b.classList.add("up"); open.push(b); if(open.length < 2) return; tries++; var x = cards[+open[0].getAttribute("data-mc")], y = cards[+open[1].getAttribute("data-mc")];
      if(x.k === y.k && x.em !== y.em){ open.forEach(function(o){ o.classList.add("ok"); }); open = []; ok++; ctx.vib(25); if(ok === 6){ var st = ctx.get("memory"); if(st.b == null || tries < st.b){ st.b = tries; st.best = tries + " " + ctx.L("cubaan", "tries"); } ctx.put("memory", st); win(ctx, host, "memory", ctx.L("Selesai dalam ", "Done in ") + tries + ctx.L(" cubaan", " tries"), 2).onclick = draw; } }
      else { lock = true; setTimeout(function(){ open.forEach(function(o){ o.classList.remove("up"); }); open = []; lock = false; }, 800); } box.querySelector("#mmT").textContent = ctx.L("Cubaan: ", "Tries: ") + tries; }; }); };
  draw(); }};

// 9 ── Rantai kata (pick the word that starts with the last letter) ───────
KG.reg.chain = {hub: "word", o: 9, ic: "🔗", ms: "Rantai kata", en: "Word chain", dms: "Huruf akhir → huruf awal", den: "Last letter → first letter", run: function(host, ctx){ var chain = 0;
  var draw = function(prev){ var l = head(host, ctx, null, function(){ chain = 0; draw(null); }), p = single(l).filter(function(e){ return letters(wd(e, l)).length >= 3; }), by = {};
    p.forEach(function(e){ var f = letters(wd(e, l))[0]; (by[f] = by[f] || []).push(e); });
    var cur = prev || p[ctx.rnd(p.length)], last = letters(wd(cur, l)).slice(-1)[0], good = (by[last] || []).filter(function(e){ return e !== cur; });
    if(!good.length){ chain = chain; draw(p[ctx.rnd(p.length)]); return; }
    var right = good[ctx.rnd(good.length)], wrong = ctx.shuffle(p.filter(function(e){ return letters(wd(e, l))[0] !== last; })).slice(0, 3), opts = ctx.shuffle([right].concat(wrong));
    var box = document.createElement("div"); box.innerHTML = '<div class="kgChain"><span>' + cur[0] + '</span><b' + dir(l) + '>' + ctx.E(wd(cur, l)).replace(new RegExp(last + "$"), '<u>' + last + '</u>') + '</b></div><div class="mut small" style="text-align:center">' + ctx.L("Pilih kata yang bermula dengan ", "Pick the word that starts with ") + '<b class="kgBigL">' + last + '</b></div>' +
      '<div class="kgOpts">' + opts.map(function(e){ return '<button class="btn alt" data-ch="' + e[1] + '">' + e[0] + ' <span' + dir(l) + '>' + ctx.E(wd(e, l)) + '</span></button>'; }).join("") + '</div><div class="mut small kgSc">🔗 ' + chain + '</div>'; host.appendChild(box);
    box.querySelectorAll("[data-ch]").forEach(function(b){ b.onclick = function(){ var e = p.filter(function(x){ return x[1] === b.getAttribute("data-ch"); })[0], ok = letters(wd(e, l))[0] === last; b.classList.add(ok ? "ok" : "no");
      if(ok){ chain++; ctx.vib(25); var st = ctx.get("chain"); if(chain > (st.b || 0)){ st.b = chain; st.best = "🔗 " + chain; ctx.put("chain", st); } if(chain % 6 === 0){ ctx.star(1); ctx.confetti(host); } setTimeout(function(){ draw(e); }, 600); } else { ctx.vib([30, 40, 30]); chain = 0; setTimeout(function(){ draw(null); }, 1200); } }; }); };
  draw(null); }};

// 10 ── Terjemah (BM ↔ English ↔ Arabic) ─────────────────────────────────
KG.reg.trans = {hub: "word", o: 10, ic: "🌐", ms: "Terjemah", en: "Translate", dms: "BM ↔ English ↔ عربي", den: "BM ↔ English ↔ عربي", run: function(host, ctx){ var score = 0, n = 0, pair = ctx.get("trans").p || "ms-ar";
  var draw = function(){ host.innerHTML = ""; var PR = [["ms-en", "BM → English"], ["en-ms", "English → BM"], ["ms-ar", "BM → عربي"], ["ar-ms", "عربي → BM"], ["en-ar", "English → عربي"], ["ar-en", "عربي → English"]];
    var bar = document.createElement("div"); bar.className = "kgLang"; bar.innerHTML = PR.map(function(x){ return '<button class="chip' + (x[0] === pair ? " on" : "") + '" data-tp="' + x[0] + '">' + x[1] + '</button>'; }).join(""); host.appendChild(bar);
    bar.querySelectorAll("[data-tp]").forEach(function(b){ b.onclick = function(){ pair = b.getAttribute("data-tp"); var st = ctx.get("trans"); st.p = pair; ctx.put("trans", st); draw(); }; });
    var a = pair.split("-")[0], z = pair.split("-")[1], e = W[ctx.rnd(W.length)], opts = ctx.shuffle([e].concat(ctx.shuffle(W.filter(function(x){ return x !== e; })).slice(0, 3)));
    var box = document.createElement("div"); box.innerHTML = '<div class="kgAskW"' + dir(a) + '>' + ctx.E(a === "ar" ? e[3] : a === "en" ? e[1] : e[2]) + '</div><button class="chip kgSay" id="trS">🔊</button><div class="kgOpts">' + opts.map(function(o){ return '<button class="btn alt" data-tr="' + o[1] + '"' + dir(z) + '>' + ctx.E(z === "ar" ? o[3] : z === "en" ? o[1] : o[2]) + '</button>'; }).join("") + '</div><div class="mut small kgSc">✓ ' + score + ' / ' + n + '</div>'; host.appendChild(box);
    box.querySelector("#trS").onclick = function(){ ctx.say(a === "ar" ? e[3] : a === "en" ? e[1] : e[2], a); };
    box.querySelectorAll("[data-tr]").forEach(function(b){ b.onclick = function(){ var ok = b.getAttribute("data-tr") === e[1]; n++; b.classList.add(ok ? "ok" : "no"); if(!ok) box.querySelector('[data-tr="' + e[1] + '"]').classList.add("ok"); else { score++; ctx.vib(25); var st = ctx.get("trans"); st.n = (st.n || 0) + 1; ctx.put("trans", st); if(score % 8 === 0){ ctx.star(1); ctx.confetti(host); } }
      var f = document.createElement("div"); f.className = "kgPic sm"; f.textContent = e[0]; box.appendChild(f); setTimeout(draw, ok ? 800 : 1500); }; }); };
  draw(); }};
})();
