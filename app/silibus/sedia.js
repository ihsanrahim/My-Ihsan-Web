/* My Ihsan · Silibus spec v3 §4.6–4.8: question types for Sedia ke Tahun 1 and the sample entrance exam.
   eja (letter tiles: missing letters or full spelling, RTL for Jawi/Arabic) · pilihBanyak (tap to "colour" every right card)
   kira bilang (tap each object once, numbers appear) · kira wang (tap coins until the purse holds the amount)
   baca (oral: the tester marks ✓ / ½ / ✗; ½ counts for the beads but never as a first-try correct)
   UJIAN: 8 written subjects × 2 sections × 5 questions (/80) + oral paper (/32), result slip, history graph, Indeks Sedia.
   Uses the engine's globals at call time (rekod, simpanJawapan, papar, sudahSemak, kocok, benihDari, BAHASA). */
(function(){
"use strict";
function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
function chars(s){ return Array.from(String(s)); }
function en(){ return (typeof BAHASA !== "undefined" && BAHASA === "en") || /[?&]ui=en\b/.test(location.search); }
function W(ms, e){ return en() ? e : ms; }
function speak(t, lang){ if(window.VIS) VIS.speak(String(t).replace(/<[^>]+>/g, " "), lang || (en() ? "en" : "ms")); }
var GLYPH = /[؀-ۿ]/;

// ---------- complete / correct ----------
function slots(q){ return q.kosong && q.kosong.length ? q.kosong.length : chars(q.a).length; }
function ejaWord(q, v){ var w = chars(q.a); if(q.kosong && q.kosong.length){ var o = w.slice(); q.kosong.forEach(function(ix, k){ o[ix] = v[k]!=null ? q.huruf[v[k]] : "_"; }); return o.join(""); } return v.map(function(i){ return q.huruf[i]; }).join(""); }
function siap(q, v){ if(v == null) return false;
  if(q.j==="eja") return Array.isArray(v) && v.length === slots(q);
  if(q.j==="pilihBanyak") return !!(v && v.siap && v.p && v.p.length);
  if(q.j==="kira") return !!(v && v.siap);
  if(q.j==="baca") return v==="b" || v==="h" || v==="x";
  return null; }
function betul(q, v){ if(!siap(q, v)) return false;
  if(q.j==="eja") return ejaWord(q, v) === String(q.a);
  if(q.j==="pilihBanyak"){ var a = q.a.slice().sort().join("\u0001"), b = v.p.slice().sort().join("\u0001"); return a === b; }
  if(q.j==="kira" && q.mod==="bilang") return v.n === +q.a;
  if(q.j==="kira") return (v.t||[]).reduce(function(s, i){ return s + (+q.syiling[i]||0); }, 0) === +q.a;
  if(q.j==="baca") return v==="b" || v==="h";
  return null; }
var JENIS = {eja: ["Eja", "Spell"], pilihBanyak: ["Pilih semua", "Pick all"], kira: ["Kira", "Count"], baca: ["Lisan", "Oral"]};

// ---------- eja ----------
function binaEja(kad, t, q, i){ var r = rekod(t.id), v = Array.isArray(r.jawapan[q.id]) ? r.jawapan[q.id].slice() : [], done = sudahSemak(t, q), n = slots(q), w = chars(q.a);
  var row = el("div", "ejaRow" + (q.rtl ? " rtl" : "")); if(q.rtl) row.dir = "rtl";
  var slotEl = function(k){ var b = el("button", "ejaSlot" + (v[k]!=null ? " isi" : "")); b.type = "button"; b.textContent = v[k]!=null ? q.huruf[v[k]] : "";
    if(done && v[k]!=null) b.classList.add(betul(q, v) ? "betul" : "salah");
    b.onclick = function(){ if(v[k]==null) return; var nv = v.slice(0, k).concat(v.slice(k+1)); simpanJawapan(t, q, i, nv.length ? nv : undefined); }; return b; };
  if(q.kosong && q.kosong.length){ var kk = 0; w.forEach(function(ch, ix){ if(q.kosong.indexOf(ix) >= 0) row.appendChild(slotEl(kk++)); else row.appendChild(el("span", "ejaFix", ch)); }); }
  else for(var k=0;k<n;k++) row.appendChild(slotEl(k));
  if(q.rtl && v.length){ kad.appendChild(el("div", "ejaJoin", ejaWord(q, v))); }
  kad.appendChild(row);
  var bank = el("div", "ejaBank" + (q.rtl ? " rtl" : "")); if(q.rtl) bank.dir = "rtl";
  q.huruf.forEach(function(h, ix){ if(v.indexOf(ix) >= 0) return; var b = el("button", "ejaTile", h); b.type = "button"; if(GLYPH.test(h)) b.classList.add("ar");
    b.onclick = function(){ if(v.length >= n) return; simpanJawapan(t, q, i, v.concat([ix])); }; bank.appendChild(b); });
  kad.appendChild(bank); }

// ---------- pilihBanyak ----------
var EMO = {kucing:"🐱",cat:"🐱",goat:"🐐",kambing:"🐐",frog:"🐸",katak:"🐸",lion:"🦁",singa:"🦁",car:"🚗",kereta:"🚗",pencil:"🖊️",pensel:"✏️",cup:"🥤",cawan:"☕",epal:"🍎",apple:"🍎",ikan:"🐟",fish:"🐟",bola:"⚽",ball:"⚽",buku:"📕",book:"📕",rumah:"🏠",house:"🏠",pokok:"🌳",tree:"🌳",bunga:"🌸",flower:"🌸",ayam:"🐔",burung:"🐦",bird:"🐦",dog:"🐶",anjing:"🐶",gajah:"🐘",elephant:"🐘",pisang:"🍌",banana:"🍌",kasut:"👟",shoe:"👟",kerusi:"🪑",chair:"🪑",meja:"🪑",table:"🪑",matahari:"☀️",sun:"☀️",bulan:"🌙",moon:"🌙",bintang:"⭐",star:"⭐",air:"💧",water:"💧",batu:"🪨",rock:"🪨",kereta_api:"🚆",bas:"🚌",bus:"🚌",kapal:"🚢",ship:"🚢",lembu:"🐄",cow:"🐄",itik:"🦆",duck:"🦆",arnab:"🐰",rabbit:"🐰",kuda:"🐴",horse:"🐴",ular:"🐍",snake:"🐍",rama:"🦋",butterfly:"🦋",semut:"🐜",ant:"🐜",beg:"🎒",bag:"🎒",jam:"⏰",clock:"⏰",telefon:"📱",phone:"📱",topi:"🧢",hat:"🧢",baju:"👕",shirt:"👕",nasi:"🍚",rice:"🍚",roti:"🍞",bread:"🍞",susu:"🥛",milk:"🥛",telur:"🥚",egg:"🥚",tomato:"🍅",carrot:"🥕",lobak:"🥕",jagung:"🌽",corn:"🌽"};
function emoFor(s){ var k = String(s).replace(/<[^>]+>/g, "").toLowerCase().trim(); if(EMO[k]) return EMO[k]; var f = k.split(/\s+/)[0]; return EMO[f] || ""; }
function binaPilihBanyak(kad, t, q, i){ var r = rekod(t.id), v = r.jawapan[q.id] || {p: [], siap: false}, done = sudahSemak(t, q);
  var g = el("div", "pbGrid");
  q.p.forEach(function(o){ var on = v.p.indexOf(o) >= 0, e = emoFor(o), b = el("button", "pbCard" + (on ? " on" : ""), (e ? '<span class="pbE">'+e+'</span>' : '') + '<span class="pbT">' + papar(o) + '</span>' + (on ? '<b class="pbOk">✓</b>' : ''));
    b.type = "button"; if(done && on) b.classList.add(q.a.indexOf(o) >= 0 ? "betul" : "salah");
    b.onclick = function(){ var p = v.p.slice(), ix = p.indexOf(o); if(ix >= 0) p.splice(ix, 1); else p.push(o); simpanJawapan(t, q, i, p.length ? {p: p, siap: false} : undefined); }; g.appendChild(b); });
  kad.appendChild(g);
  var go = el("button", "btn utama pbGo", "✓ " + W("Siap", "Done")); go.type = "button"; go.disabled = !v.p.length || v.siap;
  go.onclick = function(){ simpanJawapan(t, q, i, {p: v.p.slice(), siap: true}); }; kad.appendChild(go); }

// ---------- kira (bilang / wang) ----------
function rng(seed){ var x = seed || 1; return function(){ x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; }
function places(q, n){ var R = rng(benihDari(q.id)), out = [], tries = 0; while(out.length < n && tries < 2000){ tries++; var p = {x: 6 + R()*80, y: 8 + R()*74}; if(out.every(function(o){ return Math.abs(o.x-p.x) > 13 || Math.abs(o.y-p.y) > 16; })) out.push(p); }
  while(out.length < n) out.push({x: 6 + (out.length%7)*13, y: 8 + Math.floor(out.length/7)*18}); return out; }
function binaKira(kad, t, q, i){ var r = rekod(t.id), v = r.jawapan[q.id], done = sudahSemak(t, q);
  if(q.mod === "bilang"){ v = v || {k: [], n: 0, siap: false}; var box = el("div", "kiraBox"), pos = places(q, +q.a);
    pos.forEach(function(p, ix){ var at = v.k.indexOf(ix), b = el("button", "kiraObj" + (at >= 0 ? " on" : ""), q.e + (at >= 0 ? '<b>' + (at+1) + '</b>' : '')); b.type = "button"; b.style.left = p.x + "%"; b.style.top = p.y + "%";
      b.onclick = function(){ if(v.siap || at >= 0) return; var k2 = v.k.concat([ix]); simpanJawapan(t, q, i, {k: k2, n: k2.length, siap: false}); }; box.appendChild(b); });
    kad.appendChild(box);
    var bar = el("div", "kiraBar", '<span class="kiraN">' + v.n + '</span>'), rs = el("button", "btn", "↺"), ok = el("button", "btn utama", "✓"); rs.type = ok.type = "button";
    rs.onclick = function(){ simpanJawapan(t, q, i, undefined); }; ok.disabled = !v.n || v.siap; ok.onclick = function(){ simpanJawapan(t, q, i, {k: v.k.slice(), n: v.n, siap: true}); };
    bar.appendChild(rs); bar.appendChild(ok); kad.appendChild(bar);
    if(done) kad.appendChild(el("p", "kecil", W("Bilangan: ", "Count: ") + q.a + " " + q.e));
    return; }
  v = v || {t: [], siap: false}; var sum = v.t.reduce(function(s, ix){ return s + (+q.syiling[ix]||0); }, 0);
  var dompet = el("div", "kiraDompet", '<span>👛</span><b>' + fmtSen(sum) + '</b><small>/ ' + fmtSen(+q.a) + '</small>');
  dompet.querySelector("b").className = done ? (sum === +q.a ? "betul" : "salah") : ""; kad.appendChild(dompet);
  var tray = el("div", "kiraTray"); q.syiling.forEach(function(c, ix){ var used = v.t.indexOf(ix) >= 0, b = el("button", "kiraCoin" + (used ? " used" : ""), coinSvg(c)); b.type = "button";
    b.onclick = function(){ if(v.siap) return; var tt = v.t.slice(), at = tt.indexOf(ix); if(at >= 0) tt.splice(at, 1); else tt.push(ix); simpanJawapan(t, q, i, tt.length ? {t: tt, siap: false} : undefined); }; tray.appendChild(b); });
  kad.appendChild(tray);
  var bar2 = el("div", "kiraBar"), rs2 = el("button", "btn", "↺"), ok2 = el("button", "btn utama", "✓"); rs2.type = ok2.type = "button"; rs2.onclick = function(){ simpanJawapan(t, q, i, undefined); };
  ok2.disabled = !v.t.length || v.siap; ok2.onclick = function(){ simpanJawapan(t, q, i, {t: v.t.slice(), siap: true}); }; bar2.appendChild(rs2); bar2.appendChild(ok2); kad.appendChild(bar2); }
function fmtSen(s){ return s >= 100 ? "RM" + (s/100).toFixed(2).replace(/\.00$/, "") : s + " sen"; }
function coinSvg(c){ var col = {5: "#c9c9c9", 10: "#bdbdbd", 20: "#d4b04c", 50: "#c0c0c0", 100: "#d4b04c"}[c] || "#c0c0c0", lab = c >= 100 ? "RM" + (c/100) : c + "sen";
  return '<svg viewBox="0 0 50 50" width="50" height="50"><circle cx="25" cy="25" r="22" fill="' + col + '" stroke="#777" stroke-width="2"/><circle cx="25" cy="25" r="17" fill="none" stroke="#fff" stroke-opacity=".5"/><text x="25" y="29" font-size="' + (lab.length > 4 ? 10 : 12) + '" font-weight="700" text-anchor="middle" fill="#333">' + lab + '</text></svg>'; }

// ---------- baca (oral) ----------
// Spec v3 §4.7 phase 2: 🎙️ the phone listens (Android SpeechRecognizer through the app's Native bridge) and SUGGESTS a mark.
// The suggestion only outlines a button; the tester still taps ✓ / ½ / ✗. Hidden outside the Android app.
function host(){ try{ var P = window.parent; if(P && P !== window && P.Native && P.IBH && P.Native.listen) return {N: P.Native, on: P.IBH.on, off: P.IBH.off, perm: P.Native.hasPerm, ask: P.Native.requestPerm}; }catch(e){}
  if(window.Native && window.Native.listen && window.IBH) return {N: window.Native, on: IBH.on, off: IBH.off}; return null; }
function norm(s){ return String(s || "").replace(/<[^>]+>/g, " ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g, "")
  .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[^\p{L}\p{N}]+/gu, " ").trim(); }
function lev(a, b){ a = chars(a); b = chars(b); var m = a.length, n = b.length, d = [], i, j; if(!m) return n; if(!n) return m; for(j = 0; j <= n; j++) d[j] = j;
  for(i = 1; i <= m; i++){ var p = d[0]; d[0] = i; for(j = 1; j <= n; j++){ var t = d[j]; d[j] = Math.min(d[j] + 1, d[j-1] + 1, p + (a[i-1] === b[j-1] ? 0 : 1)); p = t; } } return d[n]; }
function mirip(target, heard){ var A = norm(target); if(!A) return 0; var best = 0;
  String(heard || "").split("|").forEach(function(h){ var B = norm(h); if(!B) return; var r = 1 - lev(A, B) / Math.max(A.length, B.length); if(r > best) best = r; }); return best; }
function cadang(r){ return r >= 0.85 ? "b" : r >= 0.55 ? "h" : "x"; }
var LANG = {ms: "ms-MY", en: "en-US", ar: "ar-SA"};
function micButton(q, card){ var H = host(); if(!H) return null; try{ if(H.N.canListen && !H.N.canListen()) return null; }catch(e){}
  var b = el("button", "btn bacaMic", "🎙️ " + W("Dengar bacaan", "Listen")); b.type = "button"; var on = false, fn = null, lang = LANG[q.lang] || (GLYPH.test(q.t) ? "ar-SA" : en() ? "en-US" : "ms-MY");
  var out = function(){ var o = card.querySelector(".bacaDengar"); if(!o){ o = el("div", "bacaDengar"); card.appendChild(o); } return o; };
  var stop = function(){ on = false; if(fn) H.off("speech", fn); fn = null; try{ H.N.stopListen(); }catch(e){} b.classList.remove("rec"); b.innerHTML = "🎙️ " + W("Dengar bacaan", "Listen"); };
  var go = function(){ fn = function(r){ if(!on) return; if(r.err != null){ out().innerHTML = '<span class="kecil">' + W("Tidak dapat mendengar. Cuba lagi, atau tanda sendiri.", "Could not hear. Try again, or mark it yourself.") + '</span>'; stop(); return; }
      if(r.ready){ b.innerHTML = "⏺ " + W("Sedang mendengar…", "Listening…"); return; } if(r.t == null) return;
      var heard = String(r.t).split("|")[0].trim(), sc = mirip(q.a || q.t, r.t), k = cadang(sc);
      out().innerHTML = '<span class="kecil">' + W("Didengar", "Heard") + ':</span> <b' + (GLYPH.test(heard) ? ' dir="rtl"' : '') + '>' + (heard || "…").replace(/</g, "&lt;") + '</b>' + (r.final ? ' <span class="kecil">· ' + W("cadangan", "suggestion") + ': ' + {b: "✓", h: "½", x: "✗"}[k] + ' (' + Math.round(sc * 100) + '%)</span>' : '');
      if(r.final){ var m = card.parentNode && card.parentNode.querySelector(".bacaMarkah"); if(m) Array.prototype.forEach.call(m.children, function(x, ix){ x.classList.toggle("cadang", "bhx"[ix] === k); }); stop(); } };
    H.on("speech", fn); on = true; b.classList.add("rec"); try{ H.N.listen(lang); }catch(e){ stop(); } };
  b.onclick = function(){ if(on){ stop(); return; }
    try{ if(H.perm && !H.perm.call(H.N, "mic")){ var hp = function(p){ if(p.which !== "mic") return; H.off("perm", hp); if(p.granted) go(); else out().innerHTML = '<span class="kecil">' + W("Kebenaran mikrofon ditolak.", "Microphone permission denied.") + '</span>'; }; H.on("perm", hp); H.ask.call(H.N, "mic"); return; } }catch(e){}
    go(); };
  return b; }
function binaBaca(kad, t, q, i){ var r = rekod(t.id), v = r.jawapan[q.id], rtl = GLYPH.test(q.t);
  var card = el("div", "bacaKad" + (rtl ? " rtl" : ""), '<div class="bacaT"' + (rtl ? ' dir="rtl"' : '') + '>' + q.t + '</div>'); kad.appendChild(card);
  var tools = el("div", "bacaAlat"), sp = el("button", "btn", "🔊 " + W("Contoh bacaan", "Hear it")); sp.type = "button"; sp.onclick = function(){ speak(q.t.replace(/<br\s*\/?>/g, ". "), q.lang); }; tools.appendChild(sp);
  if(q.rumi){ var hp = el("button", "btn", "💡 " + W("Bantu", "Help")); hp.type = "button"; hp.onclick = function(){ if(!card.querySelector(".bacaRumi")) card.appendChild(el("div", "bacaRumi", q.rumi)); }; tools.appendChild(hp); }
  var mic = micButton(q, card); if(mic) tools.appendChild(mic);
  kad.appendChild(tools);
  var who = el("div", "kecil bacaPenguji", "👩‍🏫 " + W("Untuk penguji (ibu bapa / guru):", "For the tester (parent / teacher):")); kad.appendChild(who);
  var m = el("div", "bacaMarkah"); [["b", "✓ " + W("Betul", "Correct")], ["h", "½ " + W("Hampir", "Nearly")], ["x", "✗ " + W("Cuba lagi", "Try again")]].forEach(function(o){
    var b = el("button", "btn" + (v === o[0] ? " utama" : ""), o[1]); b.type = "button"; b.onclick = function(){ simpanJawapan(t, q, i, o[0]); }; m.appendChild(b); });
  kad.appendChild(m); }

function bina(kad, t, q, i){ if(q.j==="eja"){ binaEja(kad, t, q, i); return true; } if(q.j==="pilihBanyak"){ binaPilihBanyak(kad, t, q, i); return true; }
  if(q.j==="kira"){ binaKira(kad, t, q, i); return true; } if(q.j==="baca"){ binaBaca(kad, t, q, i); return true; } return false; }

// ---------- 📝 Ujian Contoh ----------
var TULIS = ["sedia-bm", "sedia-bi", "sedia-mat", "sedia-sains", "sedia-pi", "sedia-jawi", "sedia-arab", "sedia-iqra"];
var ARAHAN = {mcq: ["Pilih jawapan yang betul.", "Choose the correct answer."], bs: ["Tandakan betul atau salah.", "Mark true or false."], isi: ["Isi tempat kosong.", "Fill in the blank."],
  padankan: ["Padankan.", "Match them."], jadual: ["Lengkapkan jadual.", "Complete the table."], susun: ["Susun mengikut urutan.", "Put them in order."],
  eja: ["Tulis perkataan berdasarkan gambar.", "Write the word for the picture."], pilihBanyak: ["Warnakan semua yang betul.", "Colour all the correct ones."], kira: ["Bilang dan kira.", "Count."], lajur: ["Kira.", "Work it out."], baca: ["Baca dengan kuat.", "Read aloud."]};
// oral paper: [label, topic indexes in sedia-lisan, marks]
var LISAN = [["BM: bacaan", [0, 1], 5], ["BM: cerita pendek / pantun", [2], 5], ["BI: read aloud (1)", [3], 5], ["BI: read aloud (2)", [3], 5], ["Jawi", [4], 6], ["Iqra'", [5], 6]];
function build(packs, seed){ var R = function(s){ return benihDari(String(seed) + s); }, topik = [], n = 0;
  TULIS.forEach(function(id){ var P = packs[id]; if(!P) return; var ts = kocok(P.topik.map(function(t, k){ return k; }), R(id)).slice(0, 2);
    ts.forEach(function(ti, b){ var src = P.topik[ti], qs = src.soalan || [], by = {};
      qs.forEach(function(q){ (by[q.j] = by[q.j] || []).push(q); });
      var types = Object.keys(by).filter(function(j){ return by[j].length >= 5 && j !== "baca"; }), pick = types.length ? kocok(types, R(id + b))[0] : null;
      var five = pick ? kocok(by[pick], R(id + b + "q")).slice(0, 5) : kocok(qs, R(id + b + "q")).slice(0, 5);
      n++; var ar = ARAHAN[pick || five[0].j] || ARAHAN.mcq;
      topik.push({id: "uj-" + id + "-" + b, nama: P.nama + " · " + W("Bahagian ", "Part ") + (b+1) + " — " + W(ar[0], ar[1]), arahan: W(ar[0], ar[1]), nota: src.nota || [], glosari: src.glosari || [],
        soalan: five.map(function(q){ return Object.assign({}, q); }), petikan: src.petikan || {}, uj: {sub: id, nama: P.nama, ikon: P.ikon, src: src.id, max: 5}}); }); });
  var L = packs["sedia-lisan"]; if(L) LISAN.forEach(function(x, k){ var pool = []; x[1].forEach(function(ti){ (L.topik[ti] && L.topik[ti].soalan || []).forEach(function(q){ pool.push(q); }); });
    var take = kocok(pool, R("lisan" + k)).slice(k===3 ? 5 : 0, (k===3 ? 5 : 0) + x[2]);
    topik.push({id: "uj-lisan-" + k, nama: W("Lisan · ", "Oral · ") + x[0], arahan: W("Baca dengan kuat. Penguji menanda.", "Read aloud. The tester marks."), nota: [], glosari: [], soalan: take, petikan: {}, uj: {sub: "sedia-lisan", nama: x[0], ikon: "🗣️", lisan: true, max: x[2], src: L.topik[x[1][0]] && L.topik[x[1][0]].id}}); });
  return topik; }
function score(topik){ var per = {}, tulis = 0, lisan = 0, mt = 0, ml = 0;
  topik.forEach(function(t){ var r = rekod(t.id), b = 0; t.soalan.forEach(function(q){ if(r.disemak[q.id] || t.uj.lisan){ if(betulJawabSafe(q, r.jawapan[q.id])) b++; } });
    var u = t.uj; if(u.lisan){ lisan += b; ml += u.max; return; } tulis += b; mt += u.max; var p = per[u.sub] = per[u.sub] || {nama: u.nama, ikon: u.ikon, b: 0, max: 0, src: []}; p.b += b; p.max += u.max; p.src.push(u.src); });
  return {per: per, tulis: tulis, lisan: lisan, mt: mt, ml: ml}; }
function betulJawabSafe(q, v){ try{ return betulJawab(q, v); }catch(e){ return false; } }
function history(){ try{ return JSON.parse(localStorage.getItem("silibus." + ANAK + ".ujian") || "[]"); }catch(e){ return []; } }
function saveHistory(sc, seed){ var h = history(), d = new Date(), tk = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"), per = {};
  Object.keys(sc.per).forEach(function(k){ per[k] = Math.round(sc.per[k].b * 100 / sc.per[k].max); });
  var e = {tarikh: tk, kertas: seed, bertulis: sc.tulis, lisan: sc.lisan, perSubjek: per}, ix = h.findIndex(function(x){ return x.kertas === seed; });
  if(ix >= 0) h[ix] = e; else h.push(e); h = h.slice(-30); localStorage.setItem("silibus." + ANAK + ".ujian", JSON.stringify(h)); return h; }
function slip(topik, seed, onNotes){ var sc = score(topik), h = saveHistory(sc, seed), wrap = el("div", "pnl ujSlip");
  wrap.appendChild(el("h3", "", "🧾 " + W("Slip keputusan", "Result slip")));
  wrap.appendChild(el("div", "ujTot", '<div><b>' + sc.tulis + '</b>/' + sc.mt + '<span>' + W("bertulis", "written") + '</span></div><div><b>' + sc.lisan + '</b>/' + sc.ml + '<span>' + W("lisan", "oral") + '</span></div>'));
  var rows = Object.keys(sc.per).map(function(k){ var p = sc.per[k]; return {k: k, p: p, pc: p.max ? p.b / p.max : 0}; }).sort(function(a, b){ return a.pc - b.pc; });
  rows.forEach(function(x, n){ var r = el("div", "ujRow" + (n === 0 ? " lemah" : ""), '<span>' + x.p.ikon + ' ' + x.p.nama + '</span><div class="ujBar"><i style="width:' + Math.round(x.pc*100) + '%;background:' + (x.pc >= 0.8 ? "#4EE0B0" : x.pc >= 0.5 ? "#FFD53D" : "#FF5C7A") + '"></i></div><b>' + x.p.b + '/' + x.p.max + '</b>');
    if(n === 0 && x.pc < 1){ var b = el("button", "btn emas", "📖 " + W("Ulang kaji topik ini", "Revise this topic")); b.type = "button"; b.onclick = function(){ onNotes(x.k, x.p.src[0]); }; r.appendChild(b); }
    wrap.appendChild(r); });
  if(h.length > 1){ var last = h.slice(-10), Wd = 300, Hd = 90, pts = function(f, mx){ return last.map(function(e, k){ return (10 + k*(Wd-20)/Math.max(1, last.length-1)).toFixed(1) + "," + (Hd - 10 - (f(e)/mx)*(Hd-20)).toFixed(1); }).join(" "); };
    wrap.appendChild(el("div", "ujGraf", '<div class="kecil">' + W("Kemajuan ujian", "Test progress") + '</div><svg viewBox="0 0 ' + Wd + ' ' + Hd + '"><polyline fill="none" stroke="#4F7BFF" stroke-width="2.5" points="' + pts(function(e){ return e.bertulis; }, 80) + '"/><polyline fill="none" stroke="#FF9F1C" stroke-width="2.5" points="' + pts(function(e){ return e.lisan; }, 32) + '"/></svg><div class="kecil"><span style="color:#4F7BFF">●</span> ' + W("bertulis", "written") + ' · <span style="color:#FF9F1C">●</span> ' + W("lisan", "oral") + '</div>')); }
  return wrap; }
// 🎯 Indeks Sedia: average of the last 3 tests per subject
function indeks(hist){ var out = {}; TULIS.forEach(function(k){ var v = hist.filter(function(e){ return e.perSubjek && e.perSubjek[k] != null; }).slice(-3).map(function(e){ return e.perSubjek[k]; }); if(v.length) out[k] = Math.round(v.reduce(function(a, b){ return a+b; }, 0) / v.length); }); return out; }

window.SEDIA = {siap: siap, betul: betul, bina: bina, JENIS: JENIS, build: build, score: score, slip: slip, indeks: indeks, TULIS: TULIS, speak: speak};
})();
