/* My Ihsan 0.7.93 (owner picks #11, #13, #14): three Iman pages, opened full-screen.
   🛡️ Pelindung (Amal › Doa): Ayat al-Kursi, the three Quls and authentic protection duas for morning/evening, before sleep and when ill, each with a counter and audio for Quran ayat.
   🤲 40 Rabbana (Amal › Doa): the Quranic duas that begin with "Rabbana", one a day. The Arabic is cut from the app's bundled Quran text (quran/qs), from the word "rabbana" on; never typed by hand.
   🫙 Sedekah (Amal › Deeds): a private sadaqah jar with a monthly total; amounts hidden by default.
   Storage: ihsan_pelindung (today's counts), ihsan_rabbana (learned), ihsan_sadaqah (log). All religious text awaits ustaz review like the rest of the app.
   Iman2.open(kind, H) · Iman2._t (pure helpers for tests) */
(function(){ "use strict";
var H = null, SUR = {}, audio = null;
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function pad(n){ return (n < 10 ? "0" : "") + n; }
function pad3(n){ return ("00" + n).slice(-3); }
function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

// ---- bundled Quran text (quran/qs/sNNN.js call QSUR(s, data)); works whether or not the Quran page is loaded ----
function needSur(list, cb){ var todo = list.filter(function(s){ return !SUR[s]; }); if(!todo.length){ cb(); return; }
  var s = todo[0], prev = window.QSUR; window.QSUR = function(n, d){ SUR[n] = d; if(prev) try{ prev(n, d); }catch(e){} };
  var el = document.createElement("script"); el.src = "quran/qs/s" + pad3(s) + ".js";
  el.onload = function(){ window.QSUR = prev; needSur(list, cb); }; el.onerror = function(){ window.QSUR = prev; SUR[s] = SUR[s] || {t: []}; needSur(list, cb); }; document.head.appendChild(el); }
function words(s, a){ var d = SUR[s]; if(!d || !d.t || !d.t[a - 1]) return []; return d.t[a - 1].map(function(x){ return typeof x === "string" ? x : x[0]; }).join("").trim().split(/\s+/); }
function bare(w){ return String(w).replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, "").replace(/[ٱأإآ]/g, "ا"); }
// the part of an ayat from the n-th "rabbana" (0-based) up to the next one (or the end when last / single)
function rabbanaPart(ws, part, total){ var at = []; ws.forEach(function(w, i){ if(bare(w).indexOf("ربنا") >= 0) at.push(i); }); if(!at.length) return ws.join(" ");
  var from = at[Math.min(part, at.length - 1)], to = total > 1 && part + 1 < at.length ? at[part + 1] : ws.length; return ws.slice(from, to).join(" "); }
function play(list){ // list of [s, a]
  try{ if(audio){ audio.pause(); audio = null; } }catch(e){} var i = 0; var nx = function(){ if(i >= list.length) return; var p = list[i++]; audio = new Audio("https://everyayah.com/data/Alafasy_128kbps/" + pad3(p[0]) + pad3(p[1]) + ".mp3"); audio.onended = nx; audio.play().catch(function(){ H.toast(L("Audio perlukan internet", "Audio needs the internet")); }); }; nx(); }
function stopAudio(){ try{ if(audio) audio.pause(); }catch(e){} audio = null; }

// ---------------- 🤲 40 Rabbana ----------------
// [surah, ayat, part, of, title ms, title en]
var RB = [[2,127,0,1,"Terimalah amalan kami","Accept it from us"],[2,128,0,1,"Jadikan kami berserah diri","Make us submit to You"],[2,201,0,1,"Kebaikan dunia dan akhirat","Good in this world and the next"],[2,250,0,1,"Kesabaran dan keteguhan","Patience and firm feet"],
  [2,286,0,3,"Jangan hukum kami kerana lupa","Do not punish us if we forget"],[2,286,1,3,"Jangan bebankan seperti umat dahulu","No burden like those before us"],[2,286,2,3,"Ampuni dan rahmati kami","Pardon us and have mercy on us"],
  [3,8,0,1,"Jangan pesongkan hati kami","Do not let our hearts swerve"],[3,9,0,1,"Engkau menghimpunkan manusia","You will gather mankind"],[3,16,0,1,"Kami telah beriman, ampunilah kami","We have believed, forgive us"],[3,53,0,1,"Catatlah kami bersama para saksi","Write us among the witnesses"],
  [3,147,0,1,"Ampuni dosa dan keterlaluan kami","Forgive our sins and excesses"],[3,191,0,1,"Tidak Engkau cipta dengan sia-sia","You did not create this in vain"],[3,192,0,1,"Sesiapa Engkau masukkan ke neraka","Whoever You admit to the Fire"],[3,193,0,1,"Kami dengar seruan beriman","We heard the call to faith"],
  [3,194,0,1,"Berikan apa yang Engkau janjikan","Give us what You promised"],[5,83,0,1,"Catatlah kami bersama yang menyaksikan","Write us with the witnesses"],[5,114,0,1,"Turunkan hidangan dari langit","Send us a table from heaven"],[7,23,0,1,"Kami telah menzalimi diri","We have wronged ourselves"],
  [7,47,0,1,"Jangan letakkan kami bersama yang zalim","Do not place us with the wrongdoers"],[7,89,0,1,"Berilah keputusan dengan benar","Decide between us in truth"],[7,126,0,1,"Limpahkan kesabaran","Pour patience upon us"],[10,85,0,1,"Jangan jadikan kami fitnah","Do not make us a trial"],
  [10,86,0,1,"Selamatkan kami dengan rahmat-Mu","Save us by Your mercy"],[14,38,0,1,"Engkau mengetahui segalanya","You know what we hide"],[14,40,0,1,"Terimalah doaku","Accept my prayer"],[14,41,0,1,"Ampuni aku, ibu bapaku dan mukminin","Forgive me, my parents and the believers"],
  [18,10,0,1,"Berikan rahmat dan petunjuk","Grant us mercy and right guidance"],[20,45,0,1,"Kami takut dia bertindak keterlaluan","We fear he will hasten against us"],[23,109,0,1,"Kami beriman, ampunilah kami","We believe, so forgive us"],[25,65,0,1,"Jauhkan azab Jahannam","Avert the punishment of Hell"],
  [25,74,0,1,"Pasangan dan zuriat penyejuk mata","Spouses and children as joy of our eyes"],[40,7,0,1,"Rahmat-Mu meliputi segala","Your mercy encompasses all"],[40,8,0,1,"Masukkan mereka ke syurga","Admit them to the Gardens"],[40,9,0,1,"Peliharalah mereka dari keburukan","Protect them from evil deeds"],
  [59,10,0,2,"Ampuni kami dan saudara kami","Forgive us and our brothers"],[59,10,1,2,"Engkau Maha Penyantun","You are Kind and Merciful"],[60,4,0,1,"Kepada-Mu kami bertawakal","Upon You we rely"],[60,5,0,1,"Jangan jadikan kami sasaran","Do not make us a trial for the disbelievers"],[66,8,0,1,"Sempurnakan cahaya kami","Perfect our light for us"]];
function rbToday(){ var d = new Date(), n = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2024, 0, 1)) / 864e5); return ((n % 40) + 40) % 40; }
function vRabbana(host, i){ var st = H.load("ihsan_rabbana", null) || {}, lr = st.l || {}, cur = i == null ? rbToday() : i, x = RB[cur], sNm = function(s){ return window.QMETA && QMETA.s[s - 1] ? QMETA.s[s - 1][1] : "Surah " + s; };
  host.innerHTML = '<div class="i2Card"><div class="i2Top"><span class="badge">' + (cur === rbToday() ? "☀️ " + L("Hari ini", "Today") + " · " : "") + (cur + 1) + '/40</span><button class="chip' + (lr[cur] ? " on" : "") + '" id="rbL">' + (lr[cur] ? "✓ " + L("Sudah hafal", "Learned") : "☆ " + L("Tanda hafal", "Mark learned")) + '</button></div>' +
    '<h3>' + E(L(x[4], x[5])) + '</h3><div class="i2Ar" dir="rtl" lang="ar" id="rbAr">…</div><div class="i2Ref">' + E(sNm(x[0])) + ' ' + x[0] + ':' + x[1] + (x[3] > 1 ? ' · ' + L("bahagian ", "part ") + (x[2] + 1) + '/' + x[3] : '') + '<span id="rbCont"></span></div>' +
    '<div class="i2Tr" id="rbTr"></div><div class="btns"><button class="btn alt" id="rbP">‹</button><button class="btn gold" id="rbA">🔊 ' + L("Dengar", "Listen") + '</button><button class="btn alt" id="rbQ">📖 ' + L("Buka ayat", "Open ayat") + '</button><button class="btn alt" id="rbN">›</button></div></div>' +
    '<div class="i2Grid">' + RB.map(function(r, j){ return '<button class="' + (j === cur ? "on " : "") + (lr[j] ? "ok" : "") + '" data-rb="' + j + '">' + (j + 1) + '</button>'; }).join("") + '</div>' +
    '<div class="mut tiny i2Foot">' + L("Teks Arab daripada mushaf yang dibundel dalam aplikasi; bacaan audio Mishary Alafasy (perlukan internet). Terjemahan penuh ada dalam Al-Quran. ", "Arabic from the mushaf bundled in the app; audio by Mishary Alafasy (needs the internet). The full translation is in the Quran page. ") + L("Hafal: ", "Learned: ") + Object.keys(lr).length + '/40</div>';
  needSur([x[0]], function(){ var a = host.querySelector("#rbAr"); if(a) a.textContent = rabbanaPart(words(x[0], x[1]), x[2], x[3]) || "–"; var ws0 = words(x[0], x[1]), ct = host.querySelector("#rbCont"); if(ct && ws0.length && !ws0.some(function(w){ return bare(w).indexOf("ربنا") >= 0; })) ct.textContent = " · " + L("sambungan doa ayat sebelumnya", "continues the dua of the ayat before");
    if(L("ms", "en") === "en"){ var go = function(){ var t = host.querySelector("#rbTr"); if(t && window.QEN && window.QMETA) t.textContent = QEN[QMETA.sa[x[0] - 1] + x[1] - 1] || ""; }; if(window.QEN && window.QMETA) go(); else H.loadJs(["quran/qmeta.js", "quran/qen.js"], go, function(){}); } });
  host.querySelector("#rbP").onclick = function(){ vRabbana(host, (cur + 39) % 40); };
  host.querySelector("#rbN").onclick = function(){ vRabbana(host, (cur + 1) % 40); };
  host.querySelector("#rbA").onclick = function(){ play([[x[0], x[1]]]); };
  host.querySelector("#rbQ").onclick = function(){ close(); if(H.openQuranAt) H.openQuranAt(x[0], x[1]); };
  host.querySelector("#rbL").onclick = function(){ if(lr[cur]) delete lr[cur]; else lr[cur] = 1; st.l = lr; H.save("ihsan_rabbana", st); vRabbana(host, cur); };
  host.querySelectorAll("[data-rb]").forEach(function(b){ b.onclick = function(){ vRabbana(host, +b.getAttribute("data-rb")); }; });
}

// ---------------- 🛡️ Pelindung ----------------
function doaFind(cat, needle){ var out = null; (window.DOA || []).forEach(function(c){ if(out || String(c.cat).indexOf(cat) !== 0) return; c.items.forEach(function(it){ if(!out && String(it.ar).indexOf(needle) >= 0) out = it; }); }); return out; }
function doaCat(cat){ var out = []; (window.DOA || []).forEach(function(c){ if(String(c.cat).indexOf(cat) === 0) out = out.concat(c.items); }); return out; }
// section → items: q = Quran ayat [[s, from, to]], d = a doa object from data.js, n = times
function pelSecs(){
  var bism = doaFind("Perlindungan", "لَا يَضُرُّ"), auz = doaFind("Perlindungan", "التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ"), quls = [["ikh", "Al-Ikhlas", [[112, 1, 4]]], ["fal", "Al-Falaq", [[113, 1, 5]]], ["nas", "An-Nas", [[114, 1, 6]]]];
  var Q = function(id, nm, ref, n, src){ return {id: id, t: [nm, nm], q: ref, n: n, src: src}; }, D = function(id, d, n){ return d ? {id: id, t: [d.t_ms, d.t_en], d: d, n: n, src: d.src} : null; };
  return [
    ["pe", "🌅", "Pagi & petang", "Morning & evening", [Q("pk", "Ayat al-Kursi", [[2, 255, 255]], 1, "an-Nasa'i, as-Sunan al-Kubra")].concat(quls.map(function(x){ return Q("p" + x[0], x[1], x[2], 3, "Sunan Abi Dawud 5082, Jami' at-Tirmidhi 3575"); })).concat([D("pb", bism, 3), D("pa", auz, 3)]).filter(Boolean)],
    ["sl", "🌙", "Sebelum tidur", "Before sleep", [Q("sk", "Ayat al-Kursi", [[2, 255, 255]], 1, "Sahih al-Bukhari 2311"), Q("sb", L("2 ayat akhir Al-Baqarah", "Last 2 ayat of Al-Baqarah"), [[2, 285, 286]], 1, "Sahih al-Bukhari 5009")].concat(quls.map(function(x){ return Q("s" + x[0], x[1], x[2], 3, "Sahih al-Bukhari 5017"); }))],
    ["sk", "🩺", "Ruqyah ketika sakit", "Ruqyah when ill", [Q("rf", "Al-Fatihah", [[1, 1, 7]], 1, "Sahih al-Bukhari 5736")].concat(doaCat("Kesihatan").map(function(d, i){ return D("rh" + i, d, 1); }))],
    ["ch", "🧒", "Anak & keluarga", "Children & family", doaCat("Perlindungan").map(function(d, i){ return D("rp" + i, d, 1); })]];
}
function vPel(host, sec){ var S2 = pelSecs(), cur = sec || "pe", cs = S2.filter(function(x){ return x[0] === cur; })[0] || S2[0], st = H.load("ihsan_pelindung", null) || {}; if(st.d !== ymd()) st = {d: ymd(), c: {}};
  var surs = []; cs[4].forEach(function(it){ (it.q || []).forEach(function(r){ if(surs.indexOf(r[0]) < 0) surs.push(r[0]); }); });
  host.innerHTML = '<div class="chips i2Tabs">' + S2.map(function(x){ return '<button class="chip' + (x[0] === cs[0] ? " on" : "") + '" data-ps="' + x[0] + '">' + x[1] + ' ' + E(L(x[2], x[3])) + '</button>'; }).join("") + '</div>' +
    '<div class="i2Note">⏳ ' + L("Kandungan ini menunggu semakan ustaz. Ruqyah ialah bacaan Al-Quran dan doa yang sahih; ia tidak menggantikan rawatan doktor.", "This content is awaiting ustaz review. Ruqyah is reciting the Quran and authentic duas; it does not replace medical treatment.") + '</div>' +
    cs[4].map(function(it){ var c = st.c[it.id] || 0, done = c >= it.n;
      return '<div class="i2Card i2Pel' + (done ? " done" : "") + '" data-pid="' + it.id + '"><div class="i2Top"><b>' + E(L(it.t[0], it.t[1])) + '</b>' + (it.q ? '<button class="chip" data-pp="' + it.id + '" aria-label="' + E(L("Dengar", "Listen")) + '">🔊</button>' : '') + '</div>' +
        '<div class="i2Ar" dir="rtl" lang="ar">' + (it.d ? E(it.d.ar) : '…') + '</div>' + (it.d ? '<div class="i2Tr">' + E(L(it.d.ms, it.d.en)) + '</div>' : '') +
        '<div class="i2Bot"><span class="mut tiny">' + E(it.src || "") + '</span><button class="i2Cnt" data-pc="' + it.id + '">' + c + ' / ' + it.n + '</button></div></div>'; }).join("");
  needSur(surs, function(){ cs[4].forEach(function(it){ if(!it.q) return; var el = host.querySelector('[data-pid="' + it.id + '"] .i2Ar'); if(!el) return; var t = [];
    it.q.forEach(function(r){ for(var a = r[1]; a <= r[2]; a++) t.push(words(r[0], a).join(" ") + " ﴿" + a + "﴾"); }); el.textContent = t.join(" "); }); });
  host.querySelectorAll("[data-ps]").forEach(function(b){ b.onclick = function(){ stopAudio(); vPel(host, b.getAttribute("data-ps")); }; });
  host.querySelectorAll("[data-pc]").forEach(function(b){ b.onclick = function(){ var id = b.getAttribute("data-pc"), it = cs[4].filter(function(x){ return x.id === id; })[0], c = (st.c[id] || 0) + 1; if(c > it.n) c = 0; st.c[id] = c; H.save("ihsan_pelindung", st);
    b.textContent = c + " / " + it.n; var card = b.closest(".i2Pel"); card.classList.toggle("done", c >= it.n); try{ if(H.N && H.N.vibrate) H.N.vibrate(c >= it.n ? 80 : 15); }catch(e){} }; });
  host.querySelectorAll("[data-pp]").forEach(function(b){ b.onclick = function(){ var it = cs[4].filter(function(x){ return x.id === b.getAttribute("data-pp"); })[0], l = []; it.q.forEach(function(r){ for(var a = r[1]; a <= r[2]; a++) l.push([r[0], a]); }); play(l); }; });
}

// ---------------- 🫙 Sedekah jar ----------------
var KINDS = [["wang","💵","Wang","Money"],["makan","🍲","Makanan","Food"],["masa","⏳","Masa & tenaga","Time & effort"],["senyum","😊","Senyuman & kata baik","A smile & kind words"],["lain","🌱","Lain-lain","Other"]];
function sdq(){ var d = H.load("ihsan_sadaqah", null) || {}; d.log = Array.isArray(d.log) ? d.log : []; if(d.hide == null) d.hide = true; return d; }
function monthSum(log, ym){ var n = 0, amt = 0; log.forEach(function(e){ if(String(e.d).slice(0, 7) === ym){ n++; amt += +e.a || 0; } }); return {n: n, amt: Math.round(amt * 100) / 100}; }
function vSdq(host, ym){ var d = sdq(), now = ymd().slice(0, 7); ym = ym || now; var m = monthSum(d.log, ym), fill = Math.min(100, m.n * 100 / 30), y = +ym.slice(0, 4), mo = +ym.slice(5, 7);
  var mName = new Date(y, mo - 1, 1).toLocaleDateString(L("ms-MY", "en-GB"), {month: "long", year: "numeric"}), cur = H.cur ? H.cur() : "RM";
  var list = d.log.filter(function(e){ return String(e.d).slice(0, 7) === ym; }).sort(function(a, b){ return a.d < b.d ? 1 : -1; });
  host.innerHTML = '<div class="i2Card i2Jar"><div class="i2JarV" aria-hidden="true"><i style="height:' + fill + '%"></i><span>' + m.n + '</span></div><div class="i2JarT"><div class="i2Mon"><button class="chip" id="sqP">‹</button><b>' + E(mName) + '</b><button class="chip" id="sqN"' + (ym >= now ? " disabled" : "") + '>›</button></div>' +
    '<div>' + L("Sedekah bulan ini: ", "Sadaqah this month: ") + '<b>' + m.n + '</b></div><div>' + L("Jumlah wang: ", "Money given: ") + '<b id="sqAmt">' + (d.hide ? "•••" : cur + " " + m.amt.toFixed(2)) + '</b> <button class="linkb" id="sqH">' + (d.hide ? "👁 " + L("tunjuk", "show") : "🙈 " + L("sorok", "hide")) + '</button></div></div></div>' +
    '<div class="i2Card"><h3>＋ ' + L("Sedekah hari ini", "Today's sadaqah") + '</h3><div class="chips i2Wrap">' + KINDS.map(function(k, i){ return '<button class="chip' + (i ? "" : " on") + '" data-sk="' + k[0] + '">' + k[1] + ' ' + E(L(k[2], k[3])) + '</button>'; }).join("") + '</div>' +
    '<div class="i2Row"><input class="rin" id="sqA" type="text" inputmode="decimal" placeholder="' + E(cur) + ' 1.00"><input class="rin" id="sqT" type="text" maxlength="60" placeholder="' + E(L("Nota (pilihan): tabung masjid", "Note (optional): masjid box")) + '"></div>' +
    '<button class="btn gold full" id="sqAdd">🫙 ' + L("Masukkan ke balang", "Add to the jar") + '</button></div>' +
    (list.length ? '<div class="i2Card i2List">' + list.map(function(e){ var k = KINDS.filter(function(x){ return x[0] === e.k; })[0] || KINDS[4]; return '<div class="i2Li"><span>' + k[1] + '</span><span class="i2LiN">' + E(e.t || L(k[2], k[3])) + '<small>' + E(e.d) + '</small></span><b>' + (e.a ? (d.hide ? "•••" : (+e.a).toFixed(2)) : "") + '</b><button class="i2X" data-sx="' + E(e.id) + '" aria-label="' + E(L("Padam", "Delete")) + '">✕</button></div>'; }).join("") + '</div>' : '') +
    '<div class="i2Card i2Had"><div>“' + L("…seorang lelaki yang bersedekah lalu menyembunyikannya sehingga tangan kirinya tidak mengetahui apa yang diberikan oleh tangan kanannya.", "…a man who gives in charity and hides it, so that his left hand does not know what his right hand has given.") + '”</div><small>' + L("Antara tujuh golongan yang dinaungi Allah · Sahih al-Bukhari 1423, Sahih Muslim 1031", "Among the seven whom Allah will shade · Sahih al-Bukhari 1423, Sahih Muslim 1031") + '</small>' +
    '<div style="margin-top:8px">“' + L("Senyumanmu kepada saudaramu adalah sedekah.", "Your smile for your brother is charity.") + '”</div><small>Jami\' at-Tirmidhi 1956</small></div>' +
    '<div class="mut tiny i2Foot">🔒 ' + L("Peribadi: hanya dalam telefon anda (dan sandaran Drive anda jika dihidupkan). Tiada siapa melihatnya.", "Private: only on your phone (and your Drive backup if it is on). Nobody else sees it.") + '</div>';
  var kind = "wang";
  host.querySelectorAll("[data-sk]").forEach(function(b){ b.onclick = function(){ kind = b.getAttribute("data-sk"); host.querySelectorAll("[data-sk]").forEach(function(x){ x.classList.toggle("on", x === b); }); host.querySelector("#sqA").style.display = kind === "wang" || kind === "makan" ? "" : "none"; }; });
  host.querySelector("#sqAdd").onclick = function(){ var a = parseFloat(String(host.querySelector("#sqA").value).replace(",", ".")), t = host.querySelector("#sqT").value.trim();
    if(kind === "wang" && !(a > 0)){ H.toast(L("Masukkan jumlah", "Enter an amount")); return; }
    d.log.push({id: Date.now().toString(36), d: ymd(), k: kind, a: a > 0 ? Math.round(a * 100) / 100 : 0, t: t}); if(d.log.length > 3000) d.log.shift(); H.save("ihsan_sadaqah", d);
    try{ if(H.N && H.N.vibrate) H.N.vibrate(30); }catch(e){} H.toast("🫙 " + L("Semoga diterima Allah", "May Allah accept it")); vSdq(host, now); };
  host.querySelector("#sqH").onclick = function(){ d.hide = !d.hide; H.save("ihsan_sadaqah", d); vSdq(host, ym); };
  host.querySelector("#sqP").onclick = function(){ var p = new Date(y, mo - 2, 1); vSdq(host, p.getFullYear() + "-" + pad(p.getMonth() + 1)); };
  host.querySelector("#sqN").onclick = function(){ var p = new Date(y, mo, 1); vSdq(host, p.getFullYear() + "-" + pad(p.getMonth() + 1)); };
  host.querySelectorAll("[data-sx]").forEach(function(b){ b.onclick = function(){ if(!confirm(L("Padam catatan ini?", "Delete this entry?"))) return; var id = b.getAttribute("data-sx"); d.log = d.log.filter(function(e){ return e.id !== id; }); H.save("ihsan_sadaqah", d); vSdq(host, ym); }; });
}

// ---------------- full-screen page ----------------
var TITLES = {pel: ["🛡️", "Pelindung & ruqyah", "Protection & ruqyah"], rb: ["🤲", "40 doa Rabbana", "40 Rabbana duas"], sdq: ["🫙", "Balang sedekah", "Sadaqah jar"]};
function close(){ stopAudio(); H.closeOverlay(); }
function open(kind, h){ H = h; if(!document.querySelector('link[href="iman/iman2.css"]')){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "iman/iman2.css"; document.head.appendChild(l); }
  var t = TITLES[kind] || TITLES.pel, ov = document.getElementById("overlay"); ov.className = "i2ov";
  ov.innerHTML = '<div class="i2Head"><button class="chip" id="i2X" aria-label="' + E(L("Tutup", "Close")) + '">‹</button><b>' + t[0] + ' ' + E(L(t[1], t[2])) + '</b></div><div class="i2Body" id="i2B"></div>';
  ov._close = close; ov.querySelector("#i2X").onclick = close;
  var b = ov.querySelector("#i2B"); if(kind === "rb") vRabbana(b); else if(kind === "sdq") vSdq(b); else vPel(b); }
// 0.7.95 (owner #11): Pelindung and Rabbana also render inline as Doa sub tabs
function mount(kind, el, h){ H = h; if(!document.querySelector('link[href="iman/iman2.css"]')){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "iman/iman2.css"; document.head.appendChild(l); } el.classList.add("i2In"); if(kind === "rb") vRabbana(el); else vPel(el); }
window.Iman2 = {open: open, mount: mount, stop: stopAudio, _t: {rabbanaPart: rabbanaPart, bare: bare, RB: RB, rbToday: rbToday, monthSum: monthSum, needSur: needSur, words: words}};
})();
