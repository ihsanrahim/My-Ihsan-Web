/* My Ihsan 0.7.61 (owner): Learn › School › each child › 📅 Planner and 📊 Report.
   One planner per child: Today (timeline with prayer times woven in, school periods, events, homework, home activities), Week (timetable
   grid + the week's events), Month (calendar with school holidays, exam weeks and stickers), Year (term ribbon, progress rings, achievements),
   Report (week card to share) and More (homework, exams, bag list, ibadah, reading, screen & play, health, money, forms, achievements,
   timetable, takwim). ＋ adds by scanning (AI reads a class timetable, the school takwim or a poster / letter, then a review table before
   anything goes in), by typing a form, or by telling it in one sentence (AI). Parent mode edits; Child mode is today only, big, tick and stars.
   KPlan.render(el, H, kid, tab)  kid = {id, n, e}; tab "plan" | "rep". Data: localStorage ihsan_kplan {kidId: {...}} (see blank()). */
(function(){ "use strict";
var H = null, root = null, K = null, KD = null, KEY = "ihsan_kplan";
var ST = {v: "today", off: 0, mo: 0, mode: "p"};
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function pad(n){ return (n < 10 ? "0" : "") + n; }
function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function pd(s){ var p = String(s || "").split("-"); return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1); }
function addD(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
function today0(){ var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function mins(t){ var m = /^(\d{1,2}):(\d{2})/.exec(t || ""); return m ? (+m[1]) * 60 + (+m[2]) : 9999; }
function fmt(t){ var m = mins(t); if(m >= 9999) return ""; var h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + ":" + pad(mm) + (h >= 12 ? " PM" : " AM"); }
var COLS = ["#14a39a", "#ef6f6c", "#5c7cfa", "#e8a91c", "#9b5de5", "#2a9d8f", "#f15bb5", "#3a86ff"];
// 0.7.62 (owner): each child picks a colour; it is drawn as a gradient of two tones
var GRADS = [["#14a39a","#0b6f8a"],["#ef6f6c","#c0397a"],["#5c7cfa","#7b4fd6"],["#f2a93b","#e0663a"],["#9b5de5","#5a3fc0"],["#2ec27e","#12866b"],["#f15bb5","#9b5de5"],["#3a86ff","#1aa3c9"],["#e0559a","#f08c2e"],["#20b2aa","#5c7cfa"],["#c9962e","#8a5a1c"],["#64748b","#334155"]];
function kidGrad(){ var i = KD && KD.col != null ? KD.col : (function(){ var h = 0; String(K.id).split("").forEach(function(c){ h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return h % GRADS.length; })(); return GRADS[i % GRADS.length]; }
function kidCol(){ return kidGrad()[0]; }
// subjects of Malaysian primary and secondary schools: code → [Malay, English, colour, icon]
var SUB = {BM:["Bahasa Melayu","Malay","#4a8fe7","📘"], BI:["Bahasa Inggeris","English","#8e6be8","📗"], MT:["Matematik","Maths","#f08c2e","🔢"], SN:["Sains","Science","#22a06b","🔬"],
  PI:["Pendidikan Islam","Islamic Studies","#0f8a7a","🕌"], BA:["Bahasa Arab","Arabic","#c0882b","🔤"], SJ:["Sejarah","History","#b5574b","🏛"], PJK:["PJK","PE & Health","#e0559a","🏃"],
  PSV:["Seni Visual","Art","#d6a400","🎨"], MZ:["Muzik","Music","#7a5af8","🎵"], RBT:["RBT","Design & Tech","#5c7cfa","🛠"], TMK:["TMK / ASK","Computing","#3a86ff","💻"],
  PM:["Pendidikan Moral","Moral","#6c8a2b","🤝"], JW:["Jawi","Jawi","#0f6b5c","✒️"], AQ:["Al-Quran","Quran","#13795b","📖"], GEO:["Geografi","Geography","#2a9d8f","🌏"],
  KK:["Kokurikulum","Co-curricular","#ef6f6c","🏅"], BC:["Bahasa Cina","Chinese","#d62828","🀄"], BT:["Bahasa Tamil","Tamil","#9c6644","📜"], PSI:["Pend. Sivik","Civics","#4d908e","🏳"],
  REHAT:["Rehat","Break","#9aa5b1","🥪"], PH:["Perhimpunan","Assembly","#64748b","📣"]};
var SUBRX = [[/rehat|recess|break|istirehat/i,"REHAT"],[/perhimpunan|assembly/i,"PH"],[/arab/i,"BA"],[/jawi/i,"JW"],[/quran|tilawah/i,"AQ"],[/islam|\bpi\b|\bpai\b|agama/i,"PI"],[/moral|\bpm\b/i,"PM"],[/sivik|civic/i,"PSI"],
  [/melayu|\bbm\b|malay/i,"BM"],[/inggeris|english|\bbi\b/i,"BI"],[/cina|mandarin|chinese/i,"BC"],[/tamil/i,"BT"],[/matem|math|\bmt\b|\bmm\b/i,"MT"],[/sains|science|\bsn\b|\bsc\b/i,"SN"],
  [/sejarah|history|\bsj\b/i,"SJ"],[/geografi|geograph/i,"GEO"],[/pjk|jasmani|kesihatan|\bpj\b|\bpk\b|physical|health/i,"PJK"],[/seni|psv|\bart\b|visual/i,"PSV"],[/muzik|music/i,"MZ"],
  [/rbt|reka bentuk|design/i,"RBT"],[/tmk|ask|komputer|computer|digital/i,"TMK"],[/koko|co-?curr|kelab|club|unit beruniform|sukan/i,"KK"]];
function subCode(s){ s = String(s || "").trim(); if(SUB[s.toUpperCase()]) return s.toUpperCase(); for(var i = 0; i < SUBRX.length; i++) if(SUBRX[i][0].test(s)) return SUBRX[i][1]; return s.slice(0, 18) || "?"; }
function subN(c){ var x = SUB[c]; return x ? L(x[0], x[1]) : c; }
function subC(c){ var x = SUB[c]; if(x) return x[2]; var h = 0; String(c).split("").forEach(function(ch){ h = (h * 17 + ch.charCodeAt(0)) >>> 0; }); return COLS[h % COLS.length]; }
function subI(c){ var x = SUB[c]; return x ? x[3] : "📚"; }
var BAG = {PJK:["👕", L2s("Pakaian sukan","PE kit")], PSV:["🎨", L2s("Alat lukisan","Art supplies")], MZ:["🎵", L2s("Alat muzik","Music instrument")], RBT:["🛠", L2s("Bahan RBT","Design & tech kit")], AQ:["📖", L2s("Al-Quran / Iqra","Quran / Iqra")], KK:["🏅", L2s("Uniform kokurikulum","Co-curricular uniform")]};
function L2s(a, b){ return [a, b]; }
var PR = ["subuh","zohor","asar","maghrib","isyak"], PRN = {subuh:"Subuh", zohor:"Zohor", asar:"Asar", maghrib:"Maghrib", isyak:"Isyak"};

// ---------------- data ----------------
function blank(){ return {tt: [], tk: {terms: [], hol: [], exam: [], ev: []}, ev: [], home: [], hw: [], done: {}, mood: {}, read: [], health: [], money: {log: [], goal: 0, goalN: ""}, fees: [], forms: [], ach: [], play: {}, review: [], mode: "p"}; }
function all(){ return H.load(KEY, {}) || {}; }
function load(id){ var a = all(), d = a[id] || blank(), b = blank(); Object.keys(b).forEach(function(k){ if(d[k] == null) d[k] = b[k]; }); ["terms","hol","exam","ev"].forEach(function(k){ d.tk[k] = d.tk[k] || []; }); return d; }
function save(){ var a = all(); a[K.id] = KD; H.save(KEY, a); clearTimeout(save.t); save.t = setTimeout(sched, 600); try{ if(window.FamLink) FamLink.changed(K.id, KD); }catch(e){} }
// 0.7.67 (owner): the Family link merged changes from another phone; redraw if this child is open
function reload(){ if(!root || !K || !document.body.contains(root)) return; KD = load(K.id); draw(); clearTimeout(save.t); save.t = setTimeout(sched, 600); }
// 0.7.62 (owner): phone reminders for every child (the app's own scheduler reads ihsan_kplan_ex): homework and forms the evening before,
// events the evening before and 1 hour before, exams 3 days before. Up to 10 days ahead.
function sched(){ var A = all(), kids = H.kids ? H.kids() : [], name = {}, out = [], now = Date.now(), lim = now + 10 * 864e5;
  kids.forEach(function(k){ name[k.id] = (k.e ? k.e + " " : "") + k.n; });
  var at = function(day, hm, addD2){ var d = pd(day); d.setDate(d.getDate() + (addD2 || 0)); var m = /^(\d{1,2}):(\d{2})/.exec(hm || ""); d.setHours(m ? +m[1] : 20, m ? +m[2] : 0, 0, 0); return d.getTime(); };
  var push = function(t, id, title, body){ if(t > now && t < lim) out.push({t: t, id: id, title: title, body: String(body || "").slice(0, 140), open: "side:learn/sekolah"}); };
  Object.keys(A).forEach(function(id){ var d = A[id] || {}, who = name[id] || "";
    (d.hw || []).forEach(function(h){ if(!h.done && h.due) push(at(h.due, "20:00", -1), "kph" + h.id, "✏️ " + who + ": " + L("kerja rumah esok", "homework due tomorrow"), (h.sub ? h.sub + ": " : "") + h.t); });
    (d.forms || []).forEach(function(f){ if(!f.signed && f.due) push(at(f.due, "20:00", -1), "kpf" + f.id, "📄 " + who + ": " + L("tandatangan esok", "sign by tomorrow"), f.n); });
    (d.ev || []).forEach(function(e){ if(!e.d) return; push(at(e.d, "20:00", -1), "kpe" + e.id, (e.e || "📌") + " " + who + ": " + e.n + " " + L("esok", "tomorrow"), [e.tm, e.place, e.bring ? "🎒 " + e.bring : ""].filter(Boolean).join(" · "));
      if(e.tm) push(at(e.d, e.tm) - 3600000, "kpe1" + e.id, (e.e || "📌") + " " + who + ": " + e.n + " " + L("dalam 1 jam", "in 1 hour"), e.place || ""); });
    ((d.tk || {}).exam || []).forEach(function(x, i){ if(x.f) push(at(x.f, "20:00", -3), "kpx" + id + i, "📝 " + who + ": " + (x.n || L("Peperiksaan", "Exams")) + " " + L("dalam 3 hari", "in 3 days"), L("Masa untuk ulang kaji.", "Time to revise.")); }); });
  H.save("ihsan_kplan_ex", out.sort(function(a, b){ return a.t - b.t; }).slice(0, 60)); try{ if(H.resched) H.resched(); }catch(e){} }

// ---------------- the school calendar ----------------
function inRange(list, s){ return (list || []).filter(function(x){ return x.f && s >= x.f && s <= (x.t || x.f); })[0] || null; }
function holOf(s){ return inRange(KD.tk.hol, s); }
function examOf(s){ return inRange(KD.tk.exam, s); }
function schoolDay(d){ var w = d.getDay(), s = ymd(d); if(w === 0 || w === 6 || holOf(s)) return false; if(KD.tk.terms.length && !inRange(KD.tk.terms, s)) return false; return true; }
function periods(d){ if(!schoolDay(d)) return []; var w = d.getDay(); return KD.tt.filter(function(r){ return +r.d === w; }).sort(function(a, b){ return mins(a.s) - mins(b.s); }); }
function prayers(d){ var t = {}; try{ t = H.day(d) || {}; }catch(e){} return t; }
function resolveT(tm, d){ var m = /^(subuh|zohor|asar|maghrib|isyak)([+-]\d+)?$/.exec(tm || ""); if(!m) return tm || ""; var p = prayers(d)[m[1]]; if(!p) return ""; var x = mins(p) + (+(m[2] || 0)); return pad(Math.floor(x / 60)) + ":" + pad(x % 60); }
function tmLabel(tm){ var m = /^(subuh|zohor|asar|maghrib|isyak)([+-]\d+)?$/.exec(tm || ""); if(!m) return fmt(tm); var n = +(m[2] || 0); return (n ? (n > 0 ? L("selepas ", "after ") : L("sebelum ", "before ")) : "") + PRN[m[1]] + (n ? " " + Math.abs(n) + "m" : ""); }

// everything on one day, sorted by time
function items(d){ var s = ymd(d), w = d.getDay(), out = [], pt = prayers(d);
  PR.forEach(function(k){ if(pt[k]) out.push({id: "p_" + k, k: "pray", t: pt[k], n: PRN[k], ic: "🕌", pk: k}); });
  periods(d).forEach(function(r, i){ out.push({id: "s_" + i, k: "school", t: r.s, te: r.e, n: subN(r.c), ic: subI(r.c), c: subC(r.c)}); });
  KD.ev.forEach(function(e){ if(e.d === s) out.push({id: "e_" + e.id, k: "ev", t: e.tm || "", n: e.n, ic: e.e || "📌", s: [e.place, e.bring ? "🎒 " + e.bring : ""].filter(Boolean).join(" · "), ref: e}); });
  (KD.tk.ev || []).forEach(function(e){ if(e.d === s) out.push({id: "te_" + e.n, k: "ev", t: "", n: e.n, ic: "🏫", s: L("Takwim sekolah", "School takwim")}); });
  var tdy = ymd(today0()), tmr = ymd(addD(d, 1));
  KD.hw.forEach(function(h){ var show = h.done ? h.doneOn === s : (h.due === s || h.due === tmr || (s === tdy && h.due < s));
    if(show) out.push({id: "h_" + h.id, k: "hw", t: h.tm || "15:00", n: (h.sub ? subN(subCode(h.sub)) + ": " : "") + h.t, ic: "✏️", s: h.done ? L("siap", "done") : h.due < s ? "⚠️ " + L("lewat · patut ", "late · was due ") + h.due : h.due === s ? L("hantar hari ini", "due today") : L("hantar esok", "due tomorrow"), ref: h}); });
  KD.home.forEach(function(a){ if((a.days || []).indexOf(w) >= 0 && !(a.until && s > a.until)) out.push({id: "a_" + a.id, k: "home", t: resolveT(a.tm, d), n: a.n, ic: a.ic || "🏠", s: a.tm && !/^\d/.test(a.tm) ? tmLabel(a.tm) : "", ref: a}); });
  KD.forms.forEach(function(f){ if(!f.signed && f.due === s) out.push({id: "f_" + f.id, k: "form", t: "", n: f.n, ic: "📄", s: L("tandatangan hari ini", "sign today"), ref: f}); });
  out.sort(function(a, b){ return mins(a.t) - mins(b.t); }); return out; }
function isDone(it, s){ if(it.k === "hw") return !!it.ref.done; if(it.k === "form") return !!it.ref.signed; return !!KD.done[s + "|" + it.id]; }
function tickable(it){ return it.k !== "school"; }

// ---------------- page ----------------
function render(el, h, kid, tab){ H = h; root = el; K = kid; KD = load(kid.id); css();
  ST.mode = "p"; ST.tab = tab;   // 0.7.62 (owner): no Parent / Child switch; Report is its own tab
  if(tab === "rep") ST.v = "report"; else if(ST.v === "report") ST.v = "today";
  draw(); }
function css(){ if(!document.querySelector('link[href="kplan/kplan.css"]')){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "kplan/kplan.css"; document.head.appendChild(l); } }
function cur(){ return addD(today0(), ST.off); }
function draw(){ var gr = kidGrad(), col = gr[0], d = cur(), s = ymd(d), it = items(d), nm = new Date().getHours() * 60 + new Date().getMinutes(), nx = null, isT = s === ymd(today0());
  if(isT) it.forEach(function(x){ if(!nx && mins(x.t) > nm && mins(x.t) < 9999) nx = x; });
  var VS = ST.tab === "rep" ? [] : [["today", L("Hari ini", "Today")], ["week", L("Minggu", "Week")], ["month", L("Bulan", "Month")], ["year", L("Tahun", "Year")], ["more", L("Lagi", "More")]];
  var h = '<div class="kp" style="--kp:' + col + ';--kp2:' + gr[1] + '"><div class="kpTop"><div class="kpRow"><span class="kpAv">' + E(K.e || "🧒") + '</span><div class="kpWho"><b>' + (ST.mode === "c" ? L("Hai ", "Hi ") + E(K.n) + "! 👋" : E(K.n) + L(": hari ini", "'s day")) + '</b><small>' + dateLabel(d) + '</small></div>' +
    '<button class="kpCol" id="kpFam" aria-label="' + L("Pautan keluarga", "Family link") + '">👨‍👩‍👧</button><button class="kpCol" id="kpCol" aria-label="' + L("Warna", "Colour") + '">🎨</button></div>' +
    (nx ? '<div class="kpNext"><span>' + nx.ic + '</span><div><small>' + L("Seterusnya", "Next") + '</small><b>' + E(nx.n) + '</b></div><em>' + inMin(mins(nx.t) - nm) + '</em></div>' : '') + '</div>' +
    (VS.length ? '<div class="kpViews">' + VS.map(function(v){ return '<button data-kv="' + v[0] + '"' + (ST.v === v[0] ? ' class="on"' : '') + '>' + v[1] + '</button>'; }).join("") + '</div>' : '') + '<div class="kpBody" id="kpBody"></div>' +
    (KD.review.length && ST.mode === "p" ? '<button class="kpTray" id="kpTray">📥 ' + L("Untuk disemak", "To review") + ' · ' + KD.review.length + '</button>' : '') +
    (ST.mode === "p" && ST.tab !== "rep" ? '<button class="kpFab" id="kpFab" aria-label="' + L("Tambah", "Add") + '">＋</button>' : '') + '</div>';
  root.innerHTML = h; var B = root.querySelector("#kpBody");
  ({today: vToday, week: vWeek, month: vMonth, year: vYear, report: vReport, more: vMore}[ST.v] || vToday)(B);
  root.querySelectorAll("[data-kv]").forEach(function(b){ b.onclick = function(){ var v = b.getAttribute("data-kv"); if(v === "today" || v === ST.v) ST.off = 0; ST.mo = 0; ST.sub = null; ST.v = v; draw(); }; });
  root.querySelector("#kpFam").onclick = function(){ var go_ = function(){ FamLink.open(H, K.id); }; if(window.FamLink) go_(); else H.loadJs(["groups/nostrkit.js", "famlink/famlink.js"].filter(function(f){ return !(f === "groups/nostrkit.js" && window.NostrKit); }), go_, function(){ H.toast(L("Gagal dimuatkan", "Could not load")); }); };
  root.querySelector("#kpCol").onclick = function(){ var ov = H.showSheet("🎨 " + L("Warna untuk ", "Colour for ") + E(K.n), '<div class="kpGrads">' + GRADS.map(function(g, i){ return '<button data-gr="' + i + '" style="background:linear-gradient(135deg,' + g[0] + ',' + g[1] + ')"' + (g === kidGrad() ? ' class="on"' : '') + ' aria-label="' + (i + 1) + '"></button>'; }).join("") + '</div>');
    ov.querySelectorAll("[data-gr]").forEach(function(b){ b.onclick = function(){ KD.col = +b.getAttribute("data-gr"); save(); H.closeOverlay(); draw(); }; }); };
  // 0.7.62 (owner): swipe left / right moves between Today › Week › Month › Year › More
  if(ST.tab !== "rep"){ var sx = null, sy = 0, body = root.querySelector("#kpBody"), ids = VS.map(function(v){ return v[0]; });
    ["touchstart","touchmove","touchend","pointerdown","pointermove","pointerup"].forEach(function(t){ body.addEventListener(t, function(e){ e.stopPropagation(); }, false); });   // the School page's own swipe (between children) stays out of the planner
    body.addEventListener("touchstart", function(e){ if(e.touches.length !== 1 || e.target.closest("input,textarea,select,.kpWk,.kpTro")) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive: true});
    body.addEventListener("touchend", function(e){ if(sx == null) return; var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null; if(Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
      var i = ids.indexOf(ST.v), j = Math.max(0, Math.min(ids.length - 1, i + (dx < 0 ? 1 : -1))); if(j === i) return; ST.v = ids[j]; ST.off = 0; ST.mo = 0; ST.sub = null; draw(); }, {passive: true}); }
  var fb = root.querySelector("#kpFab"); if(fb) fb.onclick = addSheet;
  var tr = root.querySelector("#kpTray"); if(tr) tr.onclick = function(){ var r = KD.review[0]; if(r) review(r.kind, r.data, r.img, 0); }; }
function dateLabel(d){ var lc = H.en() ? "en-GB" : "ms-MY", s = d.toLocaleDateString(lc, {weekday: "short", day: "numeric", month: "short"}), hj = ""; try{ hj = H.hijri ? H.hijri(d) : ""; }catch(e){} return E(s) + (hj ? " · " + E(hj) : ""); }
function inMin(m){ m = Math.max(0, m); return (m >= 60 ? Math.floor(m / 60) + L(" j ", " h ") : "") + (m % 60) + " min"; }

// ---------------- Today ----------------
function vToday(B){ var d = cur(), s = ymd(d), it = items(d), isT = s === ymd(today0()), nm = new Date().getHours() * 60 + new Date().getMinutes(), h = "";
  var tk = it.filter(tickable), dn = tk.filter(function(x){ return isDone(x, s); }).length;
  h += '<div class="kpDay"><button data-kd="-1" aria-label="' + L("Semalam", "Previous day") + '">‹</button><b>' + (isT ? L("Hari ini", "Today") : ST.off === 1 ? L("Esok", "Tomorrow") : ST.off === -1 ? L("Semalam", "Yesterday") : dateLabel(d)) + '</b><button data-kd="1" aria-label="' + L("Esok", "Next day") + '">›</button></div>';
  var hol = holOf(s), ex = examOf(s); if(hol) h += '<div class="kpBan hol">🏖 ' + E(hol.n || L("Cuti sekolah", "School holiday")) + '</div>'; if(ex) h += '<div class="kpBan ex">📝 ' + E(ex.n || L("Minggu peperiksaan", "Exam week")) + '</div>';
  if(ST.mode === "c"){ var mine = tk, st = Math.round(dn / Math.max(1, mine.length) * 5);
    h += '<div class="kpStars">' + "⭐".repeat(st) + "☆".repeat(5 - st) + '</div><div class="kpProg"><i style="width:' + (mine.length ? dn / mine.length * 100 : 0) + '%"></i></div><p class="kpMid">' + dn + ' / ' + mine.length + ' ' + L("siap hari ini", "done today") + '</p><div class="kpBig">' +
      mine.map(function(x){ var ok = isDone(x, s); return '<button class="kpBigI' + (ok ? " ok" : "") + '" data-ki="' + x.id + '"><span class="i">' + x.ic + '</span><span class="t">' + E(x.n) + '<small>' + E(x.t ? fmt(x.t) : "") + '</small></span><span class="c">' + (ok ? "✅" : "⬜") + '</span></button>'; }).join("") + '</div>';
  } else {
    if(!it.length) h += '<div class="kpEmpty">' + L("Tiada apa-apa lagi. Tekan ＋ untuk imbas jadual waktu, takwim atau tambah aktiviti.", "Nothing yet. Press ＋ to scan the timetable or takwim, or add an activity.") + '</div>';
    h += '<div class="kpTl">'; var shown = !isT;
    it.forEach(function(x){ var m = mins(x.t); if(!shown && m > nm && m < 9999){ shown = true; h += '<div class="kpNow">' + L("SEKARANG ", "NOW ") + fmt(pad(Math.floor(nm / 60)) + ":" + pad(nm % 60)) + '</div>'; }
      var ok = isDone(x, s); h += '<div class="kpIt k-' + x.k + (ok ? " ok" : "") + '" data-ki="' + x.id + '"' + (x.c ? ' style="--sc:' + x.c + '"' : '') + '><span class="tm">' + (x.t ? fmt(x.t).replace(/ (AM|PM)$/, "<i>$1</i>") : "") + '</span><span class="ic">' + x.ic + '</span><span class="tx"><b>' + E(x.n) + '</b>' + (x.k === "school" && x.te ? '<small>' + fmt(x.t) + ' – ' + fmt(x.te) + '</small>' : x.s ? '<small>' + E(x.s) + '</small>' : '') + '</span>' + (tickable(x) ? '<span class="ck">' + (ok ? "✓" : "") + '</span>' : '') + '</div>'; });
    if(!shown && isT && it.length) h += '<div class="kpNow">' + L("SEKARANG", "NOW") + '</div>';
    h += '</div>';
    h += '<div class="kpSec"><span>' + L("Setakat ini", "So far") + '</span><span>' + dn + ' / ' + tk.length + '</span></div><div class="kpProg"><i style="width:' + (tk.length ? dn / tk.length * 100 : 0) + '%"></i></div>';
    var bag = bagFor(addD(d, 1)); if(bag.length) h += '<div class="kpSec"><span>🎒 ' + L("Bawa esok", "Bring tomorrow") + '</span></div><div class="kpChips">' + bag.map(function(b){ return '<span>' + b + '</span>'; }).join("") + '</div>';
  }
  var md = KD.mood[s]; h += '<div class="kpSec"><span>' + L("Hari ini rasa…", "Today felt…") + '</span></div><div class="kpMood">' + ["😊","😐","😢","😴","🤒"].map(function(m){ return '<button data-mood="' + m + '"' + (md === m ? ' class="on"' : '') + '>' + m + '</button>'; }).join("") + '</div>';
  B.innerHTML = h;
  B.querySelectorAll("[data-kd]").forEach(function(b){ b.onclick = function(){ ST.off += +b.getAttribute("data-kd"); draw(); }; });
  B.querySelectorAll("[data-mood]").forEach(function(b){ b.onclick = function(){ var m = b.getAttribute("data-mood"); KD.mood[s] = KD.mood[s] === m ? "" : m; save(); draw(); }; });
  B.querySelectorAll("[data-ki]").forEach(function(b){ var x = it.filter(function(y){ return y.id === b.getAttribute("data-ki"); })[0]; if(!x || !tickable(x)) return;
    b.onclick = function(e){ if(ST.mode === "p" && x.k !== "pray" && !(e.target.closest && e.target.closest(".ck"))){ itemSheet(x, s); return; } toggle(x, s); }; }); }   // the circle ticks; the rest of the row opens its options
function toggle(x, s){ var was = isDone(x, s);
  if(x.k === "hw"){ x.ref.done = !was; x.ref.doneOn = !was ? s : ""; } else if(x.k === "form"){ x.ref.signed = !was; } else { if(was) delete KD.done[s + "|" + x.id]; else KD.done[s + "|" + x.id] = 1; }
  save(); if(!was){ H.vib && H.vib(40); H.toast((ST.mode === "c" ? "⭐ " + L("Syabas!", "Well done!") : "✓ ") + (x.k === "hw" ? " " + L("Tambah gambar kerja rumah dalam ⋯", "Add a homework photo from ⋯") : "")); var left = items(pd(s)).filter(function(y){ return tickable(y) && !isDone(y, s); }).length; if(!left) confetti(); }
  draw(); }
function confetti(){ var c = document.createElement("div"); c.className = "kpConf"; var cs = ["#e8a91c","#14a39a","#ef6f6c","#8e6be8","#4a8fe7"];
  for(var i = 0; i < 36; i++){ var b = document.createElement("i"); b.style.left = Math.random() * 100 + "%"; b.style.background = cs[i % 5]; b.style.animationDelay = Math.random() * .5 + "s"; c.appendChild(b); }
  document.body.appendChild(c); setTimeout(function(){ c.remove(); }, 2300); H.toast("🎉 " + L("Semua siap hari ini!", "Everything done today!")); }
function bagFor(d){ var out = [], seen = {}; periods(d).forEach(function(r){ var b = BAG[r.c]; if(b && !seen[r.c]){ seen[r.c] = 1; out.push(b[0] + " " + L(b[1][0], b[1][1])); } });
  KD.ev.forEach(function(e){ if(e.d === ymd(d) && e.bring) out.push("📌 " + E(e.bring)); }); KD.forms.forEach(function(f){ if(!f.signed && f.due === ymd(d)) out.push("📄 " + E(f.n)); });
  KD.hw.forEach(function(h){ if(!h.done && h.due === ymd(d)) out.push("✏️ " + E(h.t)); }); return out; }

// ---------------- Week ----------------
function monday(d){ var x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
function vWeek(B){ var m0 = monday(cur()), days = [0,1,2,3,4].map(function(i){ return addD(m0, i); }), starts = {}, h = "";
  days.forEach(function(d){ periods(d).forEach(function(r){ starts[r.s] = 1; }); }); var S = Object.keys(starts).sort(function(a, b){ return mins(a) - mins(b); }), tdy = ymd(today0());
  h += '<div class="kpDay"><button data-kw="-7">‹</button><b>' + E(m0.toLocaleDateString(H.en() ? "en-GB" : "ms-MY", {day: "numeric", month: "short"})) + ' – ' + E(addD(m0, 4).toLocaleDateString(H.en() ? "en-GB" : "ms-MY", {day: "numeric", month: "short"})) + '</b><button data-kw="7">›</button></div>';
  if(!S.length) h += '<div class="kpEmpty">🗓 ' + L("Belum ada jadual waktu. Tekan ＋ › 📷 Jadual waktu untuk mengimbas, atau Lagi › Jadual waktu untuk menaip.", "No timetable yet. Press ＋ › 📷 Timetable to scan it, or More › Timetable to type it.") + '</div>';
  else { h += '<div class="kpWk"><div></div>' + days.map(function(d){ var hl = holOf(ymd(d)); return '<div class="h' + (ymd(d) === tdy ? " now" : "") + '">' + E(d.toLocaleDateString(H.en() ? "en-GB" : "ms-MY", {weekday: "short"})) + (hl ? '<small>🏖</small>' : '') + '</div>'; }).join("");
    S.forEach(function(st){ h += '<div class="tm">' + fmt(st).replace(/ (AM|PM)$/, "") + '</div>'; days.forEach(function(d){ var r = periods(d).filter(function(x){ return x.s === st; })[0];
      h += r ? '<div class="c' + (r.c === "REHAT" ? " rest" : "") + '" style="--sc:' + subC(r.c) + '" title="' + E(subN(r.c)) + '">' + E(r.c === "REHAT" ? L("rehat", "break") : (r.c.length > 5 ? r.c.slice(0, 4) : r.c)) + '</div>' : '<div class="c none"></div>'; }); });
    h += '</div>'; }
  h += listHtml(ymd(m0), ymd(addD(m0, 6)), L("Minggu ini", "This week"));
  B.innerHTML = h; B.querySelectorAll("[data-kw]").forEach(function(b){ b.onclick = function(){ ST.off += +b.getAttribute("data-kw"); draw(); }; }); listBind(B); }

// ---------------- Week / Month list: everything added, each row ✏️ edit or ✕ remove (0.7.63, owner) ----------------
var LST = [];
function entries(f, t){ var out = [], lc = H.en() ? "en-GB" : "ms-MY", dl = function(s){ return s ? pd(s).toLocaleDateString(lc, {weekday: "short", day: "numeric", month: "short"}) : ""; };
  KD.ev.forEach(function(e){ if(e.d >= f && e.d <= t) out.push({d: e.d, ic: e.e || "📌", n: e.n, s: [dl(e.d), e.tm ? fmt(e.tm) : "", e.place, e.bring ? "🎒 " + e.bring : ""].filter(Boolean).join(" · "), k: "ev", ref: e}); });
  KD.hw.forEach(function(x){ if(x.due >= f && x.due <= t) out.push({d: x.due, ic: x.done ? "✅" : "✏️", n: (x.sub ? subN(subCode(x.sub)) + ": " : "") + x.t, s: L("Hantar ", "Due ") + dl(x.due), k: "hw", ref: x}); });
  KD.forms.forEach(function(x){ if(x.due >= f && x.due <= t) out.push({d: x.due, ic: x.signed ? "✅" : "📄", n: x.n, s: L("Tandatangan sebelum ", "Sign by ") + dl(x.due), k: "forms", ref: x}); });
  [["exam","📝",L("Peperiksaan","Exams")],["hol","🏖",L("Cuti sekolah","School holiday")],["terms","📚",L("Penggal","Term")]].forEach(function(g){ (KD.tk[g[0]] || []).forEach(function(x){ if(x.f <= t && (x.t || x.f) >= f) out.push({d: x.f < f ? f : x.f, ic: g[1], n: x.n || g[2], s: dl(x.f) + (x.t && x.t !== x.f ? " → " + dl(x.t) : ""), k: g[0], ref: x}); }); });
  (KD.tk.ev || []).forEach(function(x){ if(x.d >= f && x.d <= t) out.push({d: x.d, ic: "🏫", n: x.n, s: dl(x.d) + " · " + L("takwim", "takwim"), k: "tkev", ref: x}); });
  out.sort(function(a, b){ return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
  var DN = H.en() ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] : ["Ahd","Isn","Sel","Rab","Kha","Jum","Sab"];
  KD.home.forEach(function(a){ out.push({d: "~", ic: a.ic || "🏠", n: a.n, s: "🔁 " + (a.days || []).map(function(d){ return DN[d]; }).join(" ") + (a.tm ? " · " + tmLabel(a.tm) : ""), k: "home", ref: a}); });
  return out; }
function listHtml(f, t, title){ LST = entries(f, t); var once = LST.filter(function(e){ return e.k !== "home"; }), rep = LST.filter(function(e){ return e.k === "home"; });
  var row = function(e){ var i = LST.indexOf(e); return '<div class="kpLi kpEd" data-le="' + i + '"><span>' + e.ic + '</span><div><b>' + E(e.n) + '</b><small>' + E(e.s) + '</small></div><button class="mini" data-lei="' + i + '" aria-label="' + L("Ubah", "Edit") + '">✏️</button><button class="del" data-ldi="' + i + '" aria-label="' + L("Padam", "Remove") + '">✕</button></div>'; };
  return '<div class="kpSec"><span>' + title + '</span><span>' + once.length + '</span></div>' + (once.length ? '<div class="kpList">' + once.map(row).join("") + '</div>' : '<div class="kpEmpty sm">' + L("Tiada acara, kerja rumah atau borang. Tekan ＋ untuk tambah.", "No events, homework or forms. Press ＋ to add.") + '</div>') +
    (rep.length ? '<div class="kpSec"><span>🔁 ' + L("Aktiviti berulang", "Repeating activities") + '</span><span>' + rep.length + '</span></div><div class="kpList">' + rep.map(row).join("") + '</div>' : ''); }
function listBind(B){ B.querySelectorAll("[data-lei],[data-le]").forEach(function(b){ b.onclick = function(ev){ if(ev.target.closest("[data-ldi]")) return; ev.stopPropagation(); var e = LST[+(b.getAttribute("data-lei") || b.getAttribute("data-le"))]; if(e) editE(e); }; });
  B.querySelectorAll("[data-ldi]").forEach(function(b){ b.onclick = function(ev){ ev.stopPropagation(); var e = LST[+b.getAttribute("data-ldi")]; if(e) confirmDel(function(){ removeE(e); save(); draw(); H.toast(L("Dipadam", "Removed")); }); }; }); }
function removeE(e){ var arr = e.k === "ev" ? KD.ev : e.k === "hw" ? KD.hw : e.k === "forms" ? KD.forms : e.k === "home" ? KD.home : e.k === "tkev" ? KD.tk.ev : KD.tk[e.k]; var i = arr.indexOf(e.ref); if(i >= 0) arr.splice(i, 1); }
function editE(e){ var r = e.ref;
  if(e.k === "ev") formEvent(r, r); else if(e.k === "hw") formHw(r, r); else if(e.k === "forms") formForm(r, r); else if(e.k === "home") formHome(null, r);
  else if(e.k === "tkev") form("🏫 " + L("Acara sekolah", "School event"), [["n", L("Nama", "Name"), "text", r.n, 0, 1], ["d", L("Tarikh", "Date"), "date", r.d, 0, 1]], function(v){ r.n = v.n; r.d = v.d; save(); draw(); });
  else formRange(e.k, r); }

// ---------------- Month ----------------
function vMonth(B){ var b0 = new Date(today0().getFullYear(), today0().getMonth() + ST.mo, 1), y = b0.getFullYear(), m = b0.getMonth(), first = (b0.getDay() + 6) % 7, nd = new Date(y, m + 1, 0).getDate(), tdy = ymd(today0()), h = "";
  h += '<div class="kpDay"><button data-km2="-1">‹</button><b>' + E(b0.toLocaleDateString(H.en() ? "en-GB" : "ms-MY", {month: "long", year: "numeric"})) + '</b><button data-km2="1">›</button></div><div class="kpMg">' +
    (H.en() ? ["M","T","W","T","F","S","S"] : ["I","S","R","K","J","S","A"]).map(function(x){ return '<div class="dn">' + x + '</div>'; }).join("");
  for(var i = 0; i < first; i++) h += '<div class="d out"></div>';
  for(var dd = 1; dd <= nd; dd++){ var d = new Date(y, m, dd), s = ymd(d), it = items(d), st = it.filter(function(x){ return x.k === "ev"; })[0], hw = it.filter(function(x){ return x.k === "hw" || x.k === "form"; }).length;
    h += '<button class="d' + (holOf(s) ? " hol" : "") + (examOf(s) ? " ex" : "") + (s === tdy ? " now" : "") + '" data-kday="' + s + '">' + dd + (st ? '<span class="st">' + st.ic + '</span>' : hw ? '<span class="dots">' + '<i></i>'.repeat(Math.min(3, hw)) + '</span>' : '') + '</button>'; }
  h += '</div><div class="kpLeg"><span><i class="hol"></i>' + L("Cuti sekolah", "School holiday") + '</span><span><i class="ex"></i>' + L("Peperiksaan", "Exams") + '</span><span><i class="dot"></i>' + L("Kerja rumah / borang", "Homework / form") + '</span></div>';
  h += listHtml(ymd(b0), ymd(new Date(y, m, nd)), L("Bulan ini", "This month"));
  if(!KD.tk.hol.length && !KD.tk.exam.length) h += '<div class="kpEmpty sm">📄 ' + L("Belum ada takwim. ＋ › 📷 Takwim untuk membaca kalendar sekolah.", "No takwim yet. ＋ › 📷 Takwim reads the school calendar.") + '</div>';
  B.innerHTML = h; listBind(B); B.querySelectorAll("[data-km2]").forEach(function(b){ b.onclick = function(){ ST.mo += +b.getAttribute("data-km2"); draw(); }; });
  B.querySelectorAll("[data-kday]").forEach(function(b){ b.onclick = function(){ ST.off = Math.round((pd(b.getAttribute("data-kday")) - today0()) / 864e5); ST.v = "today"; draw(); }; }); }

// ---------------- Year ----------------
function ring(p, col){ var r = 26, c = 2 * Math.PI * r; p = Math.max(0, Math.min(1, p || 0)); return '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="' + r + '" fill="none" stroke="var(--line)" stroke-width="7"/><circle cx="32" cy="32" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (c * p).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-size="14" font-weight="800" fill="currentColor">' + Math.round(p * 100) + '%</text></svg>'; }
function stats(f, t){ // homework, home activities and prayers between two dates (inclusive)
  var hwT = 0, hwD = 0, hoT = 0, hoD = 0, prT = 0, prD = 0, days = 0, rd = {}, lim = ymd(today0());
  KD.hw.forEach(function(h){ if(h.due >= f && h.due <= t){ hwT++; if(h.done) hwD++; } });
  for(var d = pd(f); ymd(d) <= t && ymd(d) <= lim; d = addD(d, 1)){ var s = ymd(d); days++; items(d).forEach(function(x){ if(x.k === "home"){ hoT++; if(KD.done[s + "|" + x.id]) hoD++; } if(x.k === "pray"){ prT++; if(KD.done[s + "|" + x.id]) prD++; } }); }
  KD.read.forEach(function(r){ if(r.d >= f && r.d <= t) rd[r.d] = 1; });
  return {hwT: hwT, hwD: hwD, hoT: hoT, hoD: hoD, prT: prT, prD: prD, days: days, read: Object.keys(rd).length}; }
function vYear(B){ var y = today0().getFullYear(), h = '<div class="kpSec"><span>' + L("Tahun persekolahan ", "School year ") + y + '</span></div><div class="kpYr">', mn = H.en() ? ["J","F","M","A","M","J","J","A","S","O","N","D"] : ["J","F","M","A","M","J","J","O","S","O","N","D"];
  for(var i = 0; i < 12; i++){ var mid = y + "-" + pad(i + 1) + "-15", tm = KD.tk.terms.map(function(t, j){ return mid >= t.f && mid <= t.t ? j : -1; }).filter(function(j){ return j >= 0; })[0], hl = holOf(mid);
    h += '<div class="' + (tm != null ? "t" + (tm % 4) : hl ? "hl" : "") + (i === today0().getMonth() ? " now" : "") + '">' + mn[i] + '</div>'; }
  h += '</div>' + (KD.tk.terms.length ? '<div class="kpLeg">' + KD.tk.terms.map(function(t, j){ return '<span><i class="t' + (j % 4) + '"></i>' + E(t.n || (L("Penggal ", "Term ") + (j + 1))) + '</span>'; }).join("") + '</div>' : '<div class="kpEmpty sm">' + L("Imbas takwim untuk penggal dan cuti.", "Scan the takwim for terms and holidays.") + '</div>');
  var st = stats(y + "-01-01", y + "-12-31");
  h += '<div class="kpRings"><div>' + ring(st.hwT ? st.hwD / st.hwT : 0, "var(--kp)") + '<b>' + L("Kerja rumah", "Homework") + '</b><small>' + st.hwD + ' / ' + st.hwT + '</small></div><div>' + ring(st.prT ? st.prD / st.prT : 0, "#e8a91c") + '<b>' + L("Solat", "Prayers") + '</b><small>' + st.prD + ' ' + L("ditanda", "ticked") + '</small></div><div>' + ring(st.hoT ? st.hoD / st.hoT : 0, "#2e9d5b") + '<b>' + L("Aktiviti rumah", "Home") + '</b><small>' + st.hoD + ' / ' + st.hoT + '</small></div></div>';
  var ach = KD.ach.filter(function(a){ return String(a.d || "").slice(0, 4) === String(y); });
  h += '<div class="kpSec"><span>🏆 ' + L("Dinding pencapaian", "Achievements wall") + '</span><span>' + ach.length + '</span></div>' + (ach.length ? '<div class="kpTro">' + ach.map(function(a){ return '<div>' + (a.img ? '<img src="' + a.img + '" alt="">' : '<span>' + E(a.e || "🏅") + '</span>') + '<small>' + E(a.n) + '</small></div>'; }).join("") + '</div>' : '<div class="kpEmpty sm">' + L("Sijil, merit, sukan, lencana: Lagi › Pencapaian.", "Certificates, merits, sports, badges: More › Achievements.") + '</div>');
  var books = KD.read.filter(function(r){ return String(r.d).slice(0, 4) === String(y) && r.fin; }).length, goal = KD.readGoal || 30;
  h += '<div class="kpSec"><span>📚 ' + L("Buku dibaca", "Books read") + '</span><span>' + books + ' / ' + goal + '</span></div><div class="kpProg"><i style="width:' + Math.min(100, books / goal * 100) + '%"></i></div>';
  B.innerHTML = h; }

// ---------------- Report ----------------
function vReport(B){ var m0 = monday(cur()), f = ymd(m0), t = ymd(addD(m0, 6)), st = stats(f, t), lc = H.en() ? "en-GB" : "ms-MY", h = "";
  var bar = function(n, c, a, b, txt){ return '<div class="kpBar"><span>' + n + '</span><span class="tr"><i style="width:' + (b ? a / b * 100 : 0) + '%;background:' + c + '"></i></span><span>' + (txt || a + "/" + b) + '</span></div>'; };
  h += '<div class="kpDay"><button data-kw="-7">‹</button><b>' + E(m0.toLocaleDateString(lc, {day: "numeric", month: "short"})) + ' – ' + E(addD(m0, 6).toLocaleDateString(lc, {day: "numeric", month: "short"})) + '</b><button data-kw="7">›</button></div>';
  h += '<div class="kpCard"><h4>📊 ' + E(K.n) + L(": minggu ini", "'s week") + '</h4>' + bar(L("Kerja rumah", "Homework"), "var(--kp)", st.hwD, st.hwT) + bar(L("Aktiviti rumah", "Home activities"), "#8e6be8", st.hoD, st.hoT) + bar(L("Solat", "Prayers"), "#e8a91c", st.prD, st.prT) + bar(L("Membaca", "Reading"), "#22a06b", st.read, 7, st.read + " " + L("hari", "days")) + '</div>';
  var moods = []; for(var i = 0; i < 7; i++){ var d = addD(m0, i); moods.push([KD.mood[ymd(d)] || "·", d.toLocaleDateString(lc, {weekday: "short"})]); }
  h += '<div class="kpCard"><h4>' + L("Perasaan minggu ini", "Mood this week") + '</h4><div class="kpMoodR">' + moods.map(function(m){ return '<span>' + m[0] + '<small>' + E(m[1]) + '</small></span>'; }).join("") + '</div></div>';
  var help = [], late = {}; KD.hw.forEach(function(x){ if(!x.done && x.due < ymd(today0())) late[x.sub || "?"] = (late[x.sub || "?"] || 0) + 1; });
  Object.keys(late).forEach(function(k){ help.push(["⏰", (k === "?" ? L("Kerja rumah", "Homework") : subN(subCode(k))), late[k] + " " + L("kerja rumah lewat", "late homework")]); });
  var wk = H.weak ? H.weak(K.id) : null; if(wk) help.push(["🎯", wk.n, L("Kuiz Sekolah ", "School quiz ") + wk.pc + "% · " + L("ulang kaji 10 minit sehari", "revise 10 min a day")]);
  h += '<div class="kpCard"><h4>' + L("Perlu sedikit bantuan", "Needs a little help") + '</h4>' + (help.length ? help.map(function(x){ return '<div class="kpLi"><span>' + x[0] + '</span><div><b>' + E(x[1]) + '</b><small>' + E(x[2]) + '</small></div></div>'; }).join("") : '<div class="kpEmpty sm">' + L("Semuanya baik minggu ini. 👍", "All good this week. 👍") + '</div>') + '</div>';
  var hi = KD.ach.filter(function(a){ return a.d >= f && a.d <= t; }).map(function(a){ return (a.e || "🏅") + " " + a.n; }).concat(KD.read.filter(function(r){ return r.d >= f && r.d <= t && r.fin; }).map(function(r){ return "📖 " + r.t; }));
  h += '<div class="kpCard"><h4>' + L("Sorotan", "Highlights") + '</h4>' + (hi.length ? '<div class="kpChips">' + hi.map(function(x){ return '<span>' + E(x) + '</span>'; }).join("") + '</div>' : '<div class="kpEmpty sm">' + L("Tambah pencapaian atau buku dari Lagi.", "Add achievements or books from More.") + '</div>') + '</div>';
  h += '<button class="kpBtn" id="kpShare">📤 ' + L("Kongsi laporan", "Share the report") + '</button>';
  B.innerHTML = h; B.querySelectorAll("[data-kw]").forEach(function(b){ b.onclick = function(){ ST.off += +b.getAttribute("data-kw"); draw(); }; });
  B.querySelector("#kpShare").onclick = function(){ var txt = "📊 " + K.n + " · " + f + " → " + t + "\n" + L("Kerja rumah ", "Homework ") + st.hwD + "/" + st.hwT + "\n" + L("Aktiviti rumah ", "Home activities ") + st.hoD + "/" + st.hoT + "\n" + L("Solat ", "Prayers ") + st.prD + "/" + st.prT + "\n" + L("Membaca ", "Reading ") + st.read + L(" hari", " days") + "\n" + L("Perasaan ", "Mood ") + moods.map(function(m){ return m[0]; }).join(" ") + (help.length ? "\n" + L("Perlu bantuan: ", "Needs help: ") + help.map(function(x){ return x[1]; }).join(", ") : "") + (hi.length ? "\n" + L("Sorotan: ", "Highlights: ") + hi.join(", ") : "") + "\n— My Ihsan";
    if(H.share) H.share(txt); }; }

// ---------------- More (the extras) ----------------
var MORE = [["hw","✏️",["Kerja rumah","Homework"]],["exam","📝",["Peperiksaan & ulang kaji","Exams & revision"]],["bag","🎒",["Senarai beg","Pack the bag"]],["ibadah","🕌",["Ibadah","Ibadah"]],["read","📚",["Log bacaan","Reading log"]],
  ["play","⚖️",["Skrin & bermain","Screen & play"]],["health","🩺",["Kesihatan","Health"]],["money","💰",["Wang","Money"]],["forms","📄",["Borang & surat kebenaran","Forms & permission slips"]],["ach","🏆",["Pencapaian","Achievements"]],
  ["tt","🗓",["Jadual waktu","Timetable"]],["tk","📅",["Takwim sekolah","School takwim"]],["home","🏠",["Aktiviti rumah","Home activities"]]];
function moreCount(k){ var td = ymd(today0()); return k === "hw" ? KD.hw.filter(function(x){ return !x.done; }).length : k === "exam" ? KD.tk.exam.filter(function(x){ return (x.t || x.f) >= td; }).length : k === "read" ? KD.read.length : k === "health" ? KD.health.length : k === "forms" ? KD.forms.filter(function(x){ return !x.signed; }).length : k === "ach" ? KD.ach.length : k === "tt" ? KD.tt.length : k === "tk" ? KD.tk.hol.length + KD.tk.exam.length + KD.tk.terms.length : k === "home" ? KD.home.length : ""; }
function vMore(B){ if(ST.sub){ moreOne(B, ST.sub); return; }
  B.innerHTML = '<div class="kpMore">' + MORE.map(function(m){ var n = moreCount(m[0]); return '<button data-ms="' + m[0] + '"><span>' + m[1] + '</span><b>' + E(L(m[2][0], m[2][1])) + '</b>' + (n !== "" && n ? '<em>' + n + '</em>' : '') + '</button>'; }).join("") + '</div>';
  B.querySelectorAll("[data-ms]").forEach(function(b){ b.onclick = function(){ ST.sub = b.getAttribute("data-ms"); draw(); }; }); }
function head(k, add){ var m = MORE.filter(function(x){ return x[0] === k; })[0]; return '<div class="kpSubH"><button id="kpSB" aria-label="' + L("Kembali", "Back") + '">‹</button><b>' + m[1] + ' ' + E(L(m[2][0], m[2][1])) + '</b>' + (add ? '<button id="kpSA" class="add">＋ ' + L("Tambah", "Add") + '</button>' : '') + '</div>'; }
function row(ic, t, s, id, extra){ return '<div class="kpLi"' + (id ? ' data-row="' + id + '"' : '') + '><span>' + ic + '</span><div><b>' + E(t) + '</b>' + (s ? '<small>' + E(s) + '</small>' : '') + '</div>' + (extra || '') + (id ? '<button class="del" data-del="' + id + '" aria-label="' + L("Padam", "Delete") + '">✕</button>' : '') + '</div>'; }
function moreOne(B, k){ var td = ymd(today0()), h = "", list = null, addF = null;
  if(k === "hw"){ h = head(k, 1) + (KD.hw.length ? KD.hw.slice().sort(function(a, b){ return (a.done - b.done) || (a.due < b.due ? -1 : 1); }).map(function(x){ return '<div class="kpLi' + (x.done ? " ok" : "") + '" data-row="' + x.id + '"><span>' + (x.done ? "✅" : x.due < td ? "⏰" : "✏️") + '</span><div><b>' + E((x.sub ? subN(subCode(x.sub)) + ": " : "") + x.t) + '</b><small>' + L("Hantar ", "Due ") + E(x.due) + (x.img ? " · 📷" : "") + '</small></div>' + (x.img ? '<img class="thumb" src="' + x.img + '" alt="">' : '') + '<button class="mini" data-hwp="' + x.id + '">📷</button><button class="mini" data-hwd="' + x.id + '">' + (x.done ? "↺" : "✓") + '</button><button class="del" data-del="' + x.id + '">✕</button></div>'; }).join("") : empty(L("Tiada kerja rumah.", "No homework."))); list = KD.hw; addF = function(){ formHw(); }; }
  else if(k === "exam"){ var ex = KD.tk.exam.filter(function(x){ return (x.t || x.f) >= td; }).sort(function(a, b){ return a.f < b.f ? -1 : 1; }), wk = H.weak ? H.weak(K.id) : null;
    h = head(k, 1) + (ex.length ? ex.map(function(x){ var n = Math.ceil((pd(x.f) - today0()) / 864e5); return '<div class="kpCount"><b>' + (n > 0 ? n : 0) + '</b><span>' + L("hari lagi", "days to go") + '</span><div><b>' + E(x.n || L("Peperiksaan", "Exams")) + '</b><small>' + E(x.f + (x.t && x.t !== x.f ? " → " + x.t : "")) + '</small></div><button class="del" data-delx="' + E(x.f + "|" + x.n) + '">✕</button></div>'; }).join("") : empty(L("Tiada peperiksaan akan datang. Tambah atau imbas takwim.", "No upcoming exams. Add one or scan the takwim."))) +
      '<div class="kpSec"><span>🎯 ' + L("Cadangan ulang kaji", "Revision plan") + '</span></div>' + (wk ? row("📚", wk.n, L("Topik lemah dalam Kuiz Sekolah (", "Weakest in School quizzes (") + wk.pc + "%). " + L("10 minit sehari sebelum peperiksaan.", "10 minutes a day before the exam.")) + '<button class="kpBtn alt" id="kpRev">＋ ' + L("Tambah ulang kaji harian (Isnin–Khamis selepas Asar)", "Add daily revision (Mon–Thu after Asar)") + '</button>' : empty(L("Buat kuiz dalam Sekolah dan cadangan akan muncul di sini.", "Do quizzes in School and suggestions appear here.")));
    addF = function(){ formRange("exam"); }; }
  else if(k === "bag"){ var tm = addD(today0(), 1), bg = bagFor(tm); h = head(k) + '<p class="kpMid">' + L("Dibina dari jadual waktu dan acara esok: ", "Built from tomorrow's timetable and events: ") + dateLabel(tm) + '</p>' + (bg.length ? '<div class="kpBig">' + bg.map(function(b, i){ var ok = KD.done[ymd(tm) + "|bag" + i]; return '<button class="kpBigI sm' + (ok ? " ok" : "") + '" data-bag="' + i + '"><span class="t">' + b + '</span><span class="c">' + (ok ? "✅" : "⬜") + '</span></button>'; }).join("") + '</div>' : empty(L("Tiada yang perlu dibawa esok.", "Nothing special to bring tomorrow."))) + '<div class="kpChips" style="margin-top:8px"><span>💧 ' + L("Botol air", "Water bottle") + '</span><span>🍱 ' + L("Bekal", "Lunch box") + '</span><span>📘 ' + L("Buku latihan", "Exercise books") + '</span></div>'; }
  else if(k === "ibadah"){ var dd = [], pc = 0, tot = 0; for(var i = 6; i >= 0; i--){ var d = addD(today0(), -i), s = ymd(d), r = PR.map(function(p){ var ok = !!KD.done[s + "|p_" + p]; tot++; if(ok) pc++; return ok; }); dd.push([d, r]); }
    h = head(k) + '<p class="kpMid">' + L("Tanda solat di Hari ini. 7 hari: ", "Tick prayers in Today. Last 7 days: ") + pc + ' / ' + tot + '</p><div class="kpIb"><div></div>' + PR.map(function(p){ return '<b>' + PRN[p].slice(0, 3) + '</b>'; }).join("") + dd.map(function(x){ return '<span>' + E(x[0].toLocaleDateString(H.en() ? "en-GB" : "ms-MY", {weekday: "short"})) + '</span>' + x[1].map(function(ok){ return '<i class="' + (ok ? "on" : "") + '">' + (ok ? "⭐" : "·") + '</i>'; }).join(""); }).join("") + '</div>' +
      (H.kidsStars ? '<div class="kpSec"><span>📗 Iqra & Juz Amma</span></div>' + row("📗", H.kidsStars(K.id), L("Dari mod Iqra kanak-kanak", "From the kids' Iqra mode")) : ''); }
  else if(k === "read"){ h = head(k, 1) + '<div class="kpRowF"><label>' + L("Sasaran buku setahun", "Books a year goal") + ' <input id="kpRG" type="number" min="1" max="365" value="' + (KD.readGoal || 30) + '" class="rin" style="width:80px;display:inline-block"></label></div>' + (KD.read.length ? KD.read.slice().reverse().map(function(x){ return row(x.fin ? "📕" : "📖", x.t, x.d + (x.min ? " · " + x.min + " min" : "") + (x.fin ? " · " + L("tamat", "finished") : ""), x.id); }).join("") : empty(L("Tiada bacaan lagi.", "No reading yet."))); list = KD.read; addF = formRead; }
  else if(k === "play"){ var p = KD.play[td] || {}, ps = H.planetMin ? H.planetMin(K.id) : null;
    h = head(k) + '<p class="kpMid">' + L("Hari ini. Seimbangkan skrin, bermain di luar dan tidur.", "Today. Balance screen, outdoor play and sleep.") + '</p><div class="kpBal">' +
      [["scr","📱",L("Skrin (min)","Screen (min)"),p.scr || (ps || 0)],["out","🌳",L("Main di luar (min)","Outdoor play (min)"),p.out || 0],["sl","🛏",L("Tidur malam (jam)","Night sleep (h)"),p.sl || 0]].map(function(x){ return '<label><span>' + x[1] + '</span><b>' + x[2] + '</b><input type="number" min="0" step="' + (x[0] === "sl" ? "0.5" : "5") + '" data-pl="' + x[0] + '" value="' + x[3] + '" class="rin"></label>'; }).join("") + '</div>' +
      (ps != null ? '<div class="mut tiny">🌍 ' + L("Planet Kanak-kanak hari ini: ", "Kids Planet today: ") + ps + ' min</div>' : '') + '<div class="mut tiny">' + L("Panduan: tidur 9–11 jam, skrin kurang 1–2 jam, bermain aktif 60 minit.", "Guide: 9–11 h sleep, under 1–2 h screen, 60 min active play.") + '</div>'; }
  else if(k === "health"){ h = head(k, 1) + (KD.health.length ? KD.health.slice().sort(function(a, b){ return a.d < b.d ? 1 : -1; }).map(function(x){ return row({mc:"🤒", clinic:"🩺", vac:"💉", dental:"🦷", note:"📝"}[x.k] || "📝", x.n, x.d + (x.k === "mc" && x.to ? " → " + x.to : ""), x.id); }).join("") : empty(L("Tiada catatan kesihatan.", "No health notes."))); list = KD.health; addF = formHealth; }
  else if(k === "money"){ var mo = KD.money, bal = mo.log.reduce(function(a, x){ return a + (+x.a || 0); }, 0);
    h = head(k, 1) + '<div class="kpCount"><b>RM ' + bal.toFixed(2) + '</b><span>' + L("simpanan", "saved") + '</span><div><b>' + (mo.goal ? E(mo.goalN || L("Matlamat", "Goal")) + ' · RM ' + (+mo.goal).toFixed(2) : L("Tiada matlamat", "No goal")) + '</b>' + (mo.goal ? '<div class="kpProg"><i style="width:' + Math.min(100, bal / mo.goal * 100) + '%"></i></div>' : '') + '</div></div>' +
      '<button class="kpBtn alt" id="kpGoal">🎯 ' + L("Tetapkan matlamat", "Set a goal") + '</button>' + mo.log.slice().reverse().slice(0, 30).map(function(x){ return row(+x.a >= 0 ? "🪙" : "🛍", (+x.a >= 0 ? "+" : "") + "RM " + (+x.a).toFixed(2) + " · " + x.n, x.d, x.id); }).join("") +
      '<div class="kpSec"><span>🏫 ' + L("Yuran sekolah & PIBG", "School fees & PIBG") + '</span><button class="mini" id="kpFee">＋</button></div>' + (KD.fees.length ? KD.fees.map(function(x){ return '<div class="kpLi' + (x.paid ? " ok" : "") + '"><span>' + (x.paid ? "✅" : "🧾") + '</span><div><b>' + E(x.n) + ' · RM ' + (+x.a || 0).toFixed(2) + '</b><small>' + L("Tarikh akhir ", "Due ") + E(x.due || "–") + '</small></div><button class="mini" data-fee="' + x.id + '">' + (x.paid ? "↺" : L("Bayar", "Paid")) + '</button><button class="del" data-delf="' + x.id + '">✕</button></div>'; }).join("") : empty(L("Tiada yuran.", "No fees."))); list = mo.log; addF = formMoney; }
  else if(k === "forms"){ h = head(k, 1) + (KD.forms.length ? KD.forms.slice().sort(function(a, b){ return (a.signed - b.signed) || (a.due < b.due ? -1 : 1); }).map(function(x){ return '<div class="kpLi' + (x.signed ? " ok" : "") + '"><span>' + (x.signed ? "✅" : x.due && x.due < td ? "⏰" : "📄") + '</span><div><b>' + E(x.n) + '</b><small>' + L("Tandatangan sebelum ", "Sign by ") + E(x.due || "–") + (x.img ? " · 📷" : "") + '</small></div>' + (x.img ? '<img class="thumb" src="' + x.img + '" alt="">' : '') + '<button class="mini" data-fp="' + x.id + '">📷</button><button class="mini" data-fs="' + x.id + '">' + (x.signed ? "↺" : "✍️") + '</button><button class="del" data-del="' + x.id + '">✕</button></div>'; }).join("") : empty(L("Tiada borang.", "No forms."))); list = KD.forms; addF = formForm; }
  else if(k === "ach"){ h = head(k, 1) + (KD.ach.length ? '<div class="kpTro big">' + KD.ach.slice().reverse().map(function(a){ return '<div data-row="' + a.id + '">' + (a.img ? '<img src="' + a.img + '" alt="">' : '<span>' + E(a.e || "🏅") + '</span>') + '<small>' + E(a.n) + '</small><em>' + E(a.d) + '</em><button class="del" data-del="' + a.id + '">✕</button></div>'; }).join("") + '</div>' : empty(L("Tambah sijil, merit, keputusan sukan atau lencana. Ambil gambar sijil.", "Add certificates, merits, sports results or badges. Snap the certificate."))); list = KD.ach; addF = formAch; }
  else if(k === "tt"){ var byD = {}; KD.tt.forEach(function(r){ (byD[r.d] = byD[r.d] || []).push(r); });
    h = head(k, 1) + '<button class="kpBtn alt" id="kpTTs">📷 ' + L("Imbas jadual waktu (ganti yang lama)", "Scan the timetable (replaces the old one)") + '</button>' + ([1,2,3,4,5].map(function(d){ var rs = (byD[d] || []).sort(function(a, b){ return mins(a.s) - mins(b.s); }); return rs.length ? '<div class="kpSec"><span>' + ["", L("Isnin","Monday"), L("Selasa","Tuesday"), L("Rabu","Wednesday"), L("Khamis","Thursday"), L("Jumaat","Friday")][d] + '</span></div>' + rs.map(function(r){ return '<div class="kpLi"><span class="sw" style="background:' + subC(r.c) + '"></span><div><b>' + E(subN(r.c)) + '</b><small>' + fmt(r.s) + ' – ' + fmt(r.e) + '</small></div><button class="del" data-delt="' + KD.tt.indexOf(r) + '">✕</button></div>'; }).join("") : ''; }).join("") || empty(L("Belum ada jadual waktu.", "No timetable yet."))) + (KD.tt.length ? '<button class="kpBtn alt" id="kpTTx">🗑 ' + L("Padam seluruh jadual", "Delete the whole timetable") + '</button>' : ''); addF = formPeriod; }
  else if(k === "tk"){ var tk = KD.tk, sec = function(ic, n, arr, key){ return '<div class="kpSec"><span>' + ic + ' ' + n + '</span></div>' + (arr.length ? arr.map(function(x, i){ return '<div class="kpLi"><span>' + ic + '</span><div><b>' + E(x.n || n) + '</b><small>' + E(x.f + (x.t && x.t !== x.f ? " → " + x.t : "")) + '</small></div><button class="del" data-deltk="' + key + '|' + i + '">✕</button></div>'; }).join("") : empty("–")); };
    h = head(k, 1) + '<button class="kpBtn alt" id="kpTKs">📷 ' + L("Imbas takwim", "Scan the takwim") + '</button>' + sec("📚", L("Penggal", "Terms"), tk.terms, "terms") + sec("🏖", L("Cuti", "Holidays"), tk.hol, "hol") + sec("📝", L("Peperiksaan", "Exams"), tk.exam, "exam") + sec("🏫", L("Acara sekolah", "School events"), (tk.ev || []).map(function(e){ return {n: e.n, f: e.d}; }), "ev"); addF = function(){ formRange("hol"); }; }
  else if(k === "home"){ var DN = H.en() ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] : ["Ahd","Isn","Sel","Rab","Kha","Jum","Sab"];
    h = head(k, 1) + (KD.home.length ? KD.home.map(function(a){ return row(a.ic || "🏠", a.n, (a.days || []).map(function(d){ return DN[d]; }).join(" ") + (a.tm ? " · " + tmLabel(a.tm) : ""), a.id); }).join("") : empty(L("Tiada aktiviti rumah.", "No home activities."))) + '<div class="kpSec"><span>' + L("Templat pantas", "Quick templates") + '</span></div><div class="kpTpl">' + HOME_TPL.map(function(t, i){ return '<button data-tpl="' + i + '">' + t[0] + ' ' + E(L(t[1], t[2])) + '</button>'; }).join("") + '</div>'; list = KD.home; addF = function(){ formHome(); }; }
  B.innerHTML = h;
  var sb = B.querySelector("#kpSB"); if(sb) sb.onclick = function(){ ST.sub = null; draw(); };
  var sa = B.querySelector("#kpSA"); if(sa && addF) sa.onclick = addF;
  if(list) B.querySelectorAll("[data-del]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); var id = b.getAttribute("data-del"); confirmDel(function(){ for(var i = 0; i < list.length; i++) if(list[i].id === id){ list.splice(i, 1); break; } save(); draw(); }); }; });
  B.querySelectorAll("[data-hwd]").forEach(function(b){ b.onclick = function(){ var x = byId(KD.hw, b.getAttribute("data-hwd")); x.done = !x.done; x.doneOn = x.done ? td : ""; save(); draw(); if(x.done) H.toast("✓"); }; });
  B.querySelectorAll("[data-hwp],[data-fp]").forEach(function(b){ b.onclick = function(){ var x = byId(b.hasAttribute("data-hwp") ? KD.hw : KD.forms, b.getAttribute("data-hwp") || b.getAttribute("data-fp")); pick(function(u){ thumb(u, 640, function(t){ x.img = t; save(); draw(); }); }); }; });
  B.querySelectorAll("[data-fs]").forEach(function(b){ b.onclick = function(){ var x = byId(KD.forms, b.getAttribute("data-fs")); x.signed = !x.signed; save(); draw(); }; });
  B.querySelectorAll("[data-fee]").forEach(function(b){ b.onclick = function(){ var x = byId(KD.fees, b.getAttribute("data-fee")); x.paid = !x.paid; save(); draw(); }; });
  B.querySelectorAll("[data-delf]").forEach(function(b){ b.onclick = function(){ confirmDel(function(){ KD.fees = KD.fees.filter(function(x){ return x.id !== b.getAttribute("data-delf"); }); save(); draw(); }); }; });
  B.querySelectorAll("[data-delx]").forEach(function(b){ b.onclick = function(){ var p = b.getAttribute("data-delx").split("|"); confirmDel(function(){ KD.tk.exam = KD.tk.exam.filter(function(x){ return !(x.f === p[0] && x.n === p.slice(1).join("|")); }); save(); draw(); }); }; });
  B.querySelectorAll("[data-delt]").forEach(function(b){ b.onclick = function(){ KD.tt.splice(+b.getAttribute("data-delt"), 1); save(); draw(); }; });
  B.querySelectorAll("[data-deltk]").forEach(function(b){ b.onclick = function(){ var p = b.getAttribute("data-deltk").split("|"); confirmDel(function(){ KD.tk[p[0]].splice(+p[1], 1); save(); draw(); }); }; });
  B.querySelectorAll("[data-bag]").forEach(function(b){ b.onclick = function(){ var key = ymd(addD(today0(), 1)) + "|bag" + b.getAttribute("data-bag"); if(KD.done[key]) delete KD.done[key]; else KD.done[key] = 1; save(); draw(); }; });
  B.querySelectorAll("[data-pl]").forEach(function(i){ i.onchange = function(){ var p = KD.play[td] = KD.play[td] || {}; p[i.getAttribute("data-pl")] = +i.value || 0; save(); }; });
  B.querySelectorAll("[data-tpl]").forEach(function(b){ b.onclick = function(){ formHome(HOME_TPL[+b.getAttribute("data-tpl")]); }; });
  var rg = B.querySelector("#kpRG"); if(rg) rg.onchange = function(){ KD.readGoal = Math.max(1, +rg.value || 30); save(); };
  var rv = B.querySelector("#kpRev"); if(rv) rv.onclick = function(){ var wk = H.weak(K.id); KD.home.push({id: uid(), n: L("Ulang kaji ", "Revise ") + wk.n + " · 10 min", ic: "📚", tm: "asar+30", days: [1,2,3,4]}); save(); H.toast("✓ " + L("Ditambah ke Aktiviti rumah", "Added to Home activities")); draw(); };
  var gl = B.querySelector("#kpGoal"); if(gl) gl.onclick = function(){ form(L("Matlamat simpanan", "Savings goal"), [["n", L("Untuk apa", "What for"), "text", KD.money.goalN || ""], ["a", L("Jumlah (RM)", "Amount (RM)"), "number", KD.money.goal || ""]], function(v){ KD.money.goal = +v.a || 0; KD.money.goalN = v.n; save(); draw(); }); };
  var fe = B.querySelector("#kpFee"); if(fe) fe.onclick = function(){ form(L("Yuran / PIBG", "Fee / PIBG"), [["n", L("Nama", "Name"), "text", "PIBG"], ["a", L("Jumlah (RM)", "Amount (RM)"), "number", ""], ["due", L("Tarikh akhir", "Due date"), "date", ""]], function(v){ KD.fees.push({id: uid(), n: v.n, a: +v.a || 0, due: v.due, paid: false}); save(); draw(); }); };
  var tts = B.querySelector("#kpTTs"); if(tts) tts.onclick = function(){ scan("tt"); };
  var tkS = B.querySelector("#kpTKs"); if(tkS) tkS.onclick = function(){ scan("tk"); };
  var ttx = B.querySelector("#kpTTx"); if(ttx) ttx.onclick = function(){ confirmDel(function(){ KD.tt = []; save(); draw(); }); }; }
function empty(t){ return '<div class="kpEmpty sm">' + t + '</div>'; }
function byId(l, id){ return l.filter(function(x){ return x.id === id; })[0] || {}; }
function confirmDel(fn){ var ov = H.showSheet("🗑 " + L("Padam?", "Delete?"), '<div class="btns"><button class="btn alt g3d" id="kpNo">' + L("Batal", "Cancel") + '</button><button class="btn gold g3d" id="kpYes">' + L("Padam", "Delete") + '</button></div>'); ov.querySelector("#kpNo").onclick = H.closeOverlay; ov.querySelector("#kpYes").onclick = function(){ H.closeOverlay(); fn(); }; }
var HOME_TPL = [["📖","Iqra / Al-Quran selepas Maghrib","Iqra / Quran after Maghrib","maghrib+15",[0,1,2,3,4,5,6]],["✏️","Ulang kaji 20 minit","Revision 20 min","asar+30",[1,2,3,4]],["🧹","Kemas bilik","Tidy the room","10:00",[6]],["⚽","Bersukan","Sports","17:00",[6,0]],["🤲","Doa tidur","Bedtime dua","21:00",[0,1,2,3,4,5,6]],["🍽","Tolong di dapur","Help in the kitchen","isyak+20",[5,6]],["📚","Membaca buku 15 minit","Read a book 15 min","20:30",[0,1,2,3,4,5,6]],["🦷","Gosok gigi","Brush teeth","21:00",[0,1,2,3,4,5,6]]];

// ---------------- forms ----------------
function form(title, fields, done){ var h = fields.map(function(f){ var id = "kpf_" + f[0];
    if(f[2] === "days") return '<label class="small">' + E(f[1]) + '</label><div class="kpDays">' + (H.en() ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] : ["Ahd","Isn","Sel","Rab","Kha","Jum","Sab"]).map(function(n, i){ return '<button type="button" data-dy="' + i + '"' + ((f[3] || []).indexOf(i) >= 0 ? ' class="on"' : '') + '>' + n + '</button>'; }).join("") + '</div>';
    if(f[2] === "sel") return '<label class="small" for="' + id + '">' + E(f[1]) + '</label><select id="' + id + '" class="rin">' + f[4].map(function(o){ return '<option value="' + E(o[0]) + '"' + (o[0] === f[3] ? ' selected' : '') + '>' + E(o[1]) + '</option>'; }).join("") + '</select>';
    if(f[2] === "check") return '<label class="small"><input type="checkbox" id="' + id + '"' + (f[3] ? ' checked' : '') + '> ' + E(f[1]) + '</label>';
    if(f[2] === "photo") return '<button type="button" class="btn alt g3d" id="kpfPh" style="margin:6px 0">📷 ' + E(f[1]) + '</button><img id="kpfPv" class="kpPv" alt="" hidden>';
    return '<label class="small" for="' + id + '">' + E(f[1]) + '</label><input id="' + id + '" class="rin" type="' + f[2] + '" value="' + E(f[3] == null ? "" : f[3]) + '">'; }).join("") + '<button class="btn gold full g3d" id="kpfOk" style="margin-top:10px">' + L("Simpan", "Save") + '</button>';
  var ov = H.showSheet(title, h), img = null;
  ov.querySelectorAll("[data-dy]").forEach(function(b){ b.onclick = function(){ b.classList.toggle("on"); }; });
  var ph = ov.querySelector("#kpfPh"); if(ph) ph.onclick = function(){ pick(function(u){ thumb(u, 640, function(t){ img = t; var pv = ov.querySelector("#kpfPv"); pv.src = t; pv.hidden = false; }); }); };
  ov.querySelector("#kpfOk").onclick = function(){ var v = {}; fields.forEach(function(f){ var e = ov.querySelector("#kpf_" + f[0]); if(f[2] === "days") v[f[0]] = [].slice.call(ov.querySelectorAll("[data-dy].on")).map(function(b){ return +b.getAttribute("data-dy"); }); else if(f[2] === "check") v[f[0]] = !!(e && e.checked); else if(f[2] === "photo") v[f[0]] = img; else v[f[0]] = e ? e.value.trim() : ""; });
    var miss = fields.filter(function(f){ return f[5] && !v[f[0]]; })[0]; if(miss){ H.toast(L("Isi: ", "Fill in: ") + f1(miss)); return; } H.closeOverlay(); done(v); }; return ov; }
function f1(f){ return f[1]; }
var TMSEL = function(){ return [["", L("Masa sendiri", "Own time")]].concat(PR.map(function(p){ return [p + "+15", L("Selepas ", "After ") + PRN[p]]; })); };
function formHome(t, ref){ if(ref) t = [ref.ic || "🏠", ref.n, ref.n, ref.tm || "", ref.days || []]; form("🏠 " + (ref ? L("Ubah aktiviti", "Edit activity") : L("Aktiviti rumah", "Home activity")), [["n", L("Aktiviti", "Activity"), "text", t ? L(t[1], t[2]) : "", 0, 1], ["ic", L("Ikon (emoji)", "Icon (emoji)"), "text", t ? t[0] : "🏠"], ["pt", L("Bila", "When"), "sel", t && !/^\d/.test(t[3]) ? t[3] : "", TMSEL()], ["tm", L("Masa sendiri", "Own time"), "time", t && /^\d/.test(t[3]) ? t[3] : ""], ["days", L("Hari", "Days"), "days", t ? t[4] : [1,2,3,4,5]]],
  function(v){ var o = {n: v.n, ic: v.ic || "🏠", tm: v.pt || v.tm || "", days: v.days}; if(ref) Object.assign(ref, o); else { o.id = uid(); KD.home.push(o); } save(); H.toast("✓ " + (ref ? L("Disimpan", "Saved") : L("Ditambah, berulang ikut hari dipilih", "Added, repeats on the chosen days"))); draw(); }); }
function formHw(pre, ref){ pre = pre || {}; form("✏️ " + (ref ? L("Ubah kerja rumah", "Edit homework") : L("Kerja rumah", "Homework")), [["sub", L("Subjek", "Subject"), "text", pre.sub || ""], ["t", L("Tugasan", "Task"), "text", pre.t || "", 0, 1], ["due", L("Hantar pada", "Due"), "date", pre.due || ymd(addD(today0(), 1)), 0, 1], ["img", L("Gambar tugasan", "Photo of the task"), "photo"]],
  function(v){ if(ref){ ref.sub = v.sub; ref.t = v.t; ref.due = v.due; if(v.img) ref.img = v.img; } else KD.hw.push({id: uid(), sub: v.sub, t: v.t, due: v.due, img: v.img || "", done: false}); save(); H.toast("✓ " + (ref ? L("Disimpan", "Saved") : L("Kerja rumah ditambah", "Homework added"))); draw(); }); }
function formEvent(pre, ref){ pre = pre || {}; form("📌 " + (ref ? L("Ubah acara", "Edit event") : L("Acara", "Event")), [["n", L("Acara", "Event"), "text", pre.n || "", 0, 1], ["e", L("Ikon (emoji)", "Icon (emoji)"), "text", pre.e || "📌"], ["d", L("Tarikh", "Date"), "date", pre.d || ymd(today0()), 0, 1], ["tm", L("Masa", "Time"), "time", pre.tm || ""], ["place", L("Tempat", "Place"), "text", pre.place || ""], ["bring", L("Bawa / pakai", "Bring / wear"), "text", pre.bring || ""]],
  function(v){ var o = {n: v.n, e: v.e || "📌", d: v.d, tm: v.tm, place: v.place, bring: v.bring}; if(ref) Object.assign(ref, o); else { o.id = uid(); o.img = pre.img || ""; KD.ev.push(o); } save(); H.toast("✓ " + (ref ? L("Disimpan", "Saved") : L("Acara ditambah", "Event added"))); draw(); }); }
function formRange(kind, ref){ form(kind === "exam" ? "📝 " + L("Peperiksaan", "Exam") : "🏖 " + L("Cuti / penggal", "Holiday / term"), [["n", L("Nama", "Name"), "text", ref ? ref.n : ""], ["f", L("Dari", "From"), "date", ref ? ref.f : "", 0, 1], ["t", L("Hingga", "To"), "date", ref ? ref.t : ""]].concat(kind === "exam" || ref ? [] : [["k", L("Jenis", "Kind"), "sel", "hol", [["hol", L("Cuti", "Holiday")], ["terms", L("Penggal", "Term")], ["exam", L("Peperiksaan", "Exam")]]]]),
  function(v){ if(ref){ ref.n = v.n; ref.f = v.f; ref.t = v.t || v.f; } else KD.tk[v.k || kind].push({n: v.n, f: v.f, t: v.t || v.f}); save(); draw(); }); }
function formRead(){ form("📚 " + L("Bacaan", "Reading"), [["t", L("Buku", "Book"), "text", "", 0, 1], ["min", L("Minit", "Minutes"), "number", "15"], ["d", L("Tarikh", "Date"), "date", ymd(today0())], ["fin", L("Sudah habis dibaca", "Finished the book"), "check"]], function(v){ KD.read.push({id: uid(), t: v.t, min: +v.min || 0, d: v.d, fin: v.fin}); save(); draw(); }); }
function formHealth(){ form("🩺 " + L("Kesihatan", "Health"), [["k", L("Jenis", "Kind"), "sel", "note", [["mc", L("Cuti sakit (MC)", "Sick day (MC)")], ["clinic", L("Klinik / doktor", "Clinic / doctor")], ["vac", L("Vaksin", "Vaccination")], ["dental", L("Gigi", "Dental")], ["note", L("Catatan", "Note")]]], ["n", L("Butiran", "Details"), "text", "", 0, 1], ["d", L("Tarikh", "Date"), "date", ymd(today0())], ["to", L("Hingga (MC)", "Until (MC)"), "date", ""]], function(v){ KD.health.push({id: uid(), k: v.k, n: v.n, d: v.d, to: v.to}); save(); draw(); }); }
function formMoney(){ form("💰 " + L("Wang", "Money"), [["k", L("Jenis", "Kind"), "sel", "in", [["in", L("Masuk (duit saku, hadiah)", "In (pocket money, gift)")], ["out", L("Keluar (belanja)", "Out (spent)")]]], ["a", L("Jumlah (RM)", "Amount (RM)"), "number", "", 0, 1], ["n", L("Catatan", "Note"), "text", ""], ["d", L("Tarikh", "Date"), "date", ymd(today0())]], function(v){ KD.money.log.push({id: uid(), a: (v.k === "out" ? -1 : 1) * Math.abs(+v.a || 0), n: v.n, d: v.d}); save(); draw(); }); }
function formForm(pre, ref){ pre = pre || {}; form("📄 " + (ref ? L("Ubah borang", "Edit form") : L("Borang / surat", "Form / letter")), [["n", L("Borang", "Form"), "text", pre.n || "", 0, 1], ["due", L("Tandatangan sebelum", "Sign by"), "date", pre.due || ""], ["img", L("Gambar borang", "Photo of the form"), "photo"]], function(v){ if(ref){ ref.n = v.n; ref.due = v.due; if(v.img) ref.img = v.img; } else KD.forms.push({id: uid(), n: v.n, due: v.due, img: v.img || pre.img || "", signed: false}); save(); draw(); }); }
function formAch(){ form("🏆 " + L("Pencapaian", "Achievement"), [["n", L("Pencapaian", "Achievement"), "text", "", 0, 1], ["e", L("Ikon (emoji)", "Icon (emoji)"), "text", "🏅"], ["d", L("Tarikh", "Date"), "date", ymd(today0())], ["img", L("Gambar sijil", "Photo of the certificate"), "photo"]], function(v){ KD.ach.push({id: uid(), n: v.n, e: v.e || "🏅", d: v.d, img: v.img || ""}); save(); H.toast("🏆 " + L("Syabas!", "Well done!")); draw(); }); }
function formPeriod(){ form("🗓 " + L("Waktu kelas", "Class period"), [["d", L("Hari", "Day"), "sel", "1", [["1", L("Isnin","Monday")], ["2", L("Selasa","Tuesday")], ["3", L("Rabu","Wednesday")], ["4", L("Khamis","Thursday")], ["5", L("Jumaat","Friday")]]], ["s", L("Mula", "Start"), "time", "07:30", 0, 1], ["e", L("Tamat", "End"), "time", "08:30"], ["c", L("Subjek", "Subject"), "text", "", 0, 1]],
  function(v){ KD.tt.push({d: +v.d, s: v.s, e: v.e, c: subCode(v.c)}); save(); draw(); }); }

// ---------------- tap an item (parent mode) ----------------
function itemSheet(x, s){ var ok = isDone(x, s), r = x.ref || {}, acts = [["tick", ok ? "↺ " + L("Belum siap", "Not done") : "✓ " + L("Tanda siap", "Mark done")]];
  if(x.k === "hw") acts.push(["photo", "📷 " + L("Gambar kerja rumah", "Homework photo")]);
  if(x.k === "home") acts.push(["skip", "⏭ " + L("Langkau hari ini", "Skip today")]);
  if(r.img) acts.push(["img", "🖼 " + L("Lihat gambar", "See the photo")]);
  if(window.FamLink && FamLink.linked(K.id)) acts.push(["nudge", "🔔 " + L("Ingatkan keluarga", "Nudge the family")]);
  acts.push(["del", "🗑 " + L("Padam", "Delete")]);
  var ov = H.showSheet(x.ic + " " + E(x.n), (x.s ? '<div class="mut small" style="margin-bottom:8px">' + E(x.s) + '</div>' : '') + acts.map(function(a){ return '<button class="btn alt full g3d" data-ia="' + a[0] + '" style="margin-bottom:6px">' + a[1] + '</button>'; }).join(""));
  ov.querySelectorAll("[data-ia]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-ia"); H.closeOverlay();
    if(a === "tick") toggle(x, s);
    else if(a === "nudge") FamLink.nudge(K.id, x.ic + " " + x.n + (x.t ? " · " + fmt(x.t) : ""));
    else if(a === "photo") pick(function(u){ thumb(u, 640, function(t){ r.img = t; if(!r.done){ r.done = true; r.doneOn = s; } save(); H.toast("📷 ✓"); draw(); }); });
    else if(a === "skip"){ KD.done[s + "|" + x.id] = 1; save(); draw(); }
    else if(a === "img"){ H.showSheet(x.ic + " " + E(x.n), '<img src="' + r.img + '" alt="" style="width:100%;border-radius:12px">'); }
    else if(a === "del") confirmDel(function(){ ["hw","ev","home","forms"].forEach(function(k){ var l = KD[k]; for(var i = 0; i < l.length; i++) if(l[i] === r){ l.splice(i, 1); break; } }); save(); draw(); }); }; }); }

// ---------------- ＋ add ----------------
function addSheet(){ var ov = H.showSheet("＋ " + L("Tambah untuk ", "Add for ") + E(K.n),
  '<div class="kpWays"><button data-sc="tt"><span>🗓</span>' + L("Jadual waktu", "Timetable") + '<small>' + L("imbas", "scan") + '</small></button><button data-sc="tk"><span>📅</span>' + L("Takwim", "Takwim") + '<small>' + L("imbas", "scan") + '</small></button><button data-sc="po"><span>🖼</span>' + L("Poster / surat", "Poster / letter") + '<small>' + L("imbas", "scan") + '</small></button></div>' +
  '<div class="kpTell"><textarea id="kpTellT" class="rin" rows="2" placeholder="' + L("Atau taip satu ayat: “Bola sepak setiap Sabtu 5 petang”, “Kerja rumah Sains muka 12 hantar Khamis”", "Or type one sentence: “Football every Saturday at 5 pm”, “Science homework page 12 due Thursday”") + '"></textarea><button class="btn gold g3d" id="kpTellGo">✨ ' + L("Tambah dengan AI", "Add with AI") + '</button></div>' +
  '<div class="kpTypes">' + [["hw","✏️",L("Kerja rumah","Homework")],["home","🏠",L("Aktiviti rumah","Home activity")],["ev","📌",L("Acara","Event")],["forms","📄",L("Borang","Form")],["exam","📝",L("Peperiksaan","Exam")],["read","📚",L("Bacaan","Reading")],["ach","🏆",L("Pencapaian","Achievement")],["health","🩺",L("Kesihatan","Health")],["money","💰",L("Wang","Money")]].map(function(t){ return '<button data-ty="' + t[0] + '"><span>' + t[1] + '</span>' + t[2] + '</button>'; }).join("") + '</div>');
  ov.querySelectorAll("[data-sc]").forEach(function(b){ b.onclick = function(){ H.closeOverlay(); scan(b.getAttribute("data-sc")); }; });
  ov.querySelectorAll("[data-ty]").forEach(function(b){ b.onclick = function(){ H.closeOverlay(); ({hw: formHw, home: function(){ formHome(); }, ev: function(){ formEvent(); }, forms: function(){ formForm(); }, exam: function(){ formRange("exam"); }, read: formRead, ach: formAch, health: formHealth, money: formMoney})[b.getAttribute("data-ty")](); }; });
  ov.querySelector("#kpTellGo").onclick = function(){ var t = ov.querySelector("#kpTellT").value.trim(); if(!t){ H.toast(L("Taip satu ayat dahulu", "Type a sentence first")); return; } H.closeOverlay(); tell(t); }; }

// ---------------- photos ----------------
function pick(cb){ var N = H.N; if(window.Native && N && N.pickImage){ var hh = function(r){ H.off("image", hh); if(!r || r.cancel) return; if(r.error || !r.data){ H.toast(L("Gambar tidak dapat dibuka", "The image could not be opened")); return; } cb(r.data); }; H.on("image", hh); N.pickImage("gallery"); return; }
  var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = function(){ var f = inp.files[0]; if(!f) return; var r = new FileReader(); r.onload = function(){ cb(r.result); }; r.readAsDataURL(f); }; inp.click(); }
function thumb(u, max, cb){ var im = new Image(); im.onload = function(){ var k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL("image/jpeg", max > 1000 ? 0.85 : 0.6)); }; im.onerror = function(){ cb(u); }; im.src = u; }

// ---------------- AI ----------------
function needAI(){ return new Promise(function(res, rej){ if(window.HalalAI){ res(); return; } if(H.loadJs) H.loadJs(["halal/halal_ai.js"], function(){ res(); }, function(){ rej(new Error(L("AI tidak dapat dimuatkan", "Could not load the AI"))); }); else rej(new Error("no loader")); }); }
function pj(t){ t = String(t || "").replace(/```json|```/g, ""); var a = t.indexOf("{"), b = t.lastIndexOf("}"); if(a < 0 || b < a) return null; var s = t.slice(a, b + 1); try{ return JSON.parse(s); }catch(e){} try{ return JSON.parse(s.replace(/,\s*([}\]])/g, "$1").replace(/[“”]/g, '"')); }catch(e){} return null; }
function ai(prompt, img, max){ return needAI().then(function(){ if(!window.HalalAI._on && H.on){ window.HalalAI._on = H.on; window.HalalAI._off = H.off; } var content = img ? [{type: "text", text: prompt}, {type: "image_url", image_url: {url: img}}] : prompt;
    return window.HalalAI.complete([{role: "user", content: content}], max || 3000, function(a, b){ return L(a, b); }, "", "kplan"); })
  .then(function(r){ var j = pj(r && r.text); if(!j) throw new Error(L("Jawapan AI tidak dapat dibaca. Cuba lagi atau taip sendiri.", "The AI's reply could not be read. Try again or type it in.")); return j; }); }
var YEAR = function(){ return today0().getFullYear(); };
var PROMPT = {
  tt: function(){ return "You read a Malaysian school class timetable (jadual waktu kelas) from a photo. Reply ONLY with JSON: {\"rows\":[{\"day\":1,\"start\":\"07:30\",\"end\":\"08:00\",\"subject\":\"Bahasa Melayu\",\"unsure\":false}]}. day: Monday=1 … Friday=5 (Isnin=1, Selasa=2, Rabu=3, Khamis=4, Jumaat=5). Times 24-hour HH:MM. One row per period; merge back-to-back periods of the same subject into one row. Include REHAT (break) and PERHIMPUNAN (assembly) rows. Use the subject name as printed (BM, BI, MT, SN, PI, PJK, RBT, PSV … are fine). unsure=true when you are guessing a cell."; },
  tk: function(){ return "You read a Malaysian school calendar (takwim persekolahan) for " + YEAR() + " from a photo. Reply ONLY with JSON: {\"terms\":[{\"name\":\"Penggal 1\",\"from\":\"YYYY-MM-DD\",\"to\":\"YYYY-MM-DD\"}],\"holidays\":[{\"name\":\"Cuti Penggal 1\",\"from\":\"YYYY-MM-DD\",\"to\":\"YYYY-MM-DD\"}],\"exams\":[{\"name\":\"Peperiksaan Akhir Tahun\",\"from\":\"YYYY-MM-DD\",\"to\":\"YYYY-MM-DD\"}],\"events\":[{\"name\":\"Hari Sukan\",\"date\":\"YYYY-MM-DD\"}]}. Use the year shown on the calendar; if a year is missing use " + YEAR() + ". Leave a list empty if the photo does not show it."; },
  po: function(){ return "You read a school poster, notice, letter or WhatsApp message for a parent in Malaysia. Today is " + ymd(today0()) + ". Reply ONLY with JSON: {\"title\":\"short event name\",\"emoji\":\"one emoji\",\"date\":\"YYYY-MM-DD or empty\",\"time\":\"HH:MM 24-hour or empty\",\"place\":\"\",\"bring\":\"what to bring or wear, short\",\"reply_by\":\"YYYY-MM-DD or empty (form, payment or reply deadline)\",\"fee\":0,\"is_form\":false}. If there is no year, choose the next date from today."; },
  tell: function(t){ return "A parent in Malaysia types a note for their child's planner. Today is " + ymd(today0()) + " (" + today0().toLocaleDateString("en-GB", {weekday: "long"}) + "). Note: \"" + t.replace(/"/g, "'") + "\". Reply ONLY with JSON: {\"kind\":\"home|homework|event|form|exam\",\"title\":\"short\",\"emoji\":\"one emoji\",\"subject\":\"for homework, else empty\",\"date\":\"YYYY-MM-DD for homework due, event, form or exam\",\"time\":\"HH:MM 24-hour or empty\",\"days\":[0-6 weekdays for a repeating home activity, Sunday=0],\"after_prayer\":\"subuh|zohor|asar|maghrib|isyak or empty\",\"place\":\"\",\"bring\":\"\"}."; }};
function scan(kind){ var who = {tt: L("jadual waktu", "class timetable"), tk: L("takwim sekolah", "school takwim"), po: L("poster / surat", "poster / letter")}[kind];
  pick(function(u){ thumb(u, 1600, function(big){ var ov = H.showSheet("📷 " + L("Membaca ", "Reading the ") + who, '<div class="kpScan"><img src="' + big + '" alt=""><i></i></div><div class="kpReading"><span class="d"><i></i><i></i><i></i></span> ' + L("AI sedang membaca…", "The AI is reading…") + '</div>');
    var gone = false, oc = ov._close; ov._close = function(){ gone = true; if(oc) oc(); else H.closeOverlay(); };
    ai(PROMPT[kind](), big, kind === "tt" ? 5000 : 3000).then(function(j){ if(gone) return; H.closeOverlay(); thumb(big, 900, function(sm){ review(kind, j, sm); }); }, function(e){ if(gone) return; H.closeOverlay(); var m = (e && e.message) || String(e); try{ if(window.HalalAI && HalalAI.errMsg) m = HalalAI.errMsg(e) || m; }catch(x){} H.toast("⚠️ " + String(m).slice(0, 160)); }); }); }); }
function tell(t){ H.toast("✨ " + L("AI sedang memahami…", "The AI is reading it…"));
  ai(PROMPT.tell(t), null, 800).then(function(j){ var k = j.kind;
    if(k === "home"){ formHome([j.emoji || "🏠", j.title, j.title, j.after_prayer ? j.after_prayer + "+15" : (j.time || ""), j.days && j.days.length ? j.days : [1,2,3,4,5]]); }
    else if(k === "homework") formHw({sub: j.subject, t: j.title, due: j.date});
    else if(k === "form") formForm({n: j.title, due: j.date});
    else if(k === "exam"){ KD.tk.exam.push({n: j.title, f: j.date, t: j.date}); save(); H.toast("✓ " + j.title); draw(); }
    else formEvent({n: j.title, e: j.emoji, d: j.date, tm: j.time, place: j.place, bring: j.bring}); }, function(e){ H.toast("⚠️ " + String((e && e.message) || e).slice(0, 160)); }); }
// the review table: nothing goes in until Insert
function review(kind, j, img, fromTray){ var h = "", rows;
  if(kind === "tt"){ rows = (j.rows || []).map(function(r){ return {d: +r.day || 1, s: String(r.start || "").slice(0, 5), e: String(r.end || "").slice(0, 5), c: subCode(r.subject), raw: r.subject, u: !!r.unsure}; }).filter(function(r){ return r.d >= 1 && r.d <= 5 && /^\d{1,2}:\d{2}$/.test(r.s); });
    var DN = ["", L("Isn","Mon"), L("Sel","Tue"), L("Rab","Wed"), L("Kha","Thu"), L("Jum","Fri")], un = rows.filter(function(r){ return r.u; }).length;
    h = '<p class="small">' + L("Jumpa ", "Found ") + '<b>' + rows.length + '</b> ' + L("waktu kelas", "periods") + (un ? ' · <span class="kpPill">' + un + ' ' + L("perlu disemak", "to check") + '</span>' : '') + '. ' + L("Ketik untuk betulkan; buang tanda untuk abaikan.", "Tap to fix; untick to skip.") + '</p><div class="kpRvW"><table class="kpRv"><tr><th></th><th>' + L("Hari", "Day") + '</th><th>' + L("Masa", "Time") + '</th><th>' + L("Subjek", "Subject") + '</th></tr>' +
      rows.map(function(r, i){ return '<tr' + (r.u ? ' class="u"' : '') + '><td><input type="checkbox" data-rk="' + i + '" checked></td><td><select data-rd="' + i + '">' + [1,2,3,4,5].map(function(d){ return '<option value="' + d + '"' + (d === r.d ? ' selected' : '') + '>' + DN[d] + '</option>'; }).join("") + '</select></td><td><input data-rs="' + i + '" value="' + E(r.s) + '" size="5"> – <input data-re="' + i + '" value="' + E(r.e) + '" size="5"></td><td><span class="sw" style="background:' + subC(r.c) + '"></span><input data-rc="' + i + '" value="' + E(r.raw || r.c) + '"></td></tr>'; }).join("") + '</table></div><p class="mut tiny">' + L("Berulang setiap minggu persekolahan dan berhenti semasa cuti (dari takwim). Jadual lama diganti.", "Repeats every school week and pauses in the holidays (from the takwim). Replaces the old timetable.") + '</p>'; }
  else if(kind === "tk"){ rows = [].concat((j.terms || []).map(function(x){ return {k: "terms", n: x.name, f: x.from, t: x.to}; }), (j.holidays || []).map(function(x){ return {k: "hol", n: x.name, f: x.from, t: x.to}; }), (j.exams || []).map(function(x){ return {k: "exam", n: x.name, f: x.from, t: x.to}; }), (j.events || []).map(function(x){ return {k: "ev", n: x.name, f: x.date, t: x.date}; })).filter(function(r){ return /^\d{4}-\d{2}-\d{2}$/.test(r.f || ""); });
    var IC = {terms: "📚", hol: "🏖", exam: "📝", ev: "🏫"};
    h = '<p class="small">' + L("Jumpa ", "Found ") + '<b>' + rows.length + '</b> ' + L("perkara", "items") + '.</p><div class="kpRvW"><table class="kpRv"><tr><th></th><th></th><th>' + L("Apa", "What") + '</th><th>' + L("Dari", "From") + '</th><th>' + L("Hingga", "To") + '</th></tr>' + rows.map(function(r, i){ return '<tr><td><input type="checkbox" data-rk="' + i + '" checked></td><td>' + IC[r.k] + '</td><td><input data-rn="' + i + '" value="' + E(r.n) + '"></td><td><input type="date" data-rf="' + i + '" value="' + E(r.f) + '"></td><td><input type="date" data-rt="' + i + '" value="' + E(r.t || r.f) + '"></td></tr>'; }).join("") + '</table></div><label class="small"><input type="checkbox" id="kpAllK" checked> ' + L("Guna untuk semua anak di sekolah yang sama", "Use for all my children at the same school") + '</label>'; }
  else { rows = [j]; h = '<div class="kpFld">' + [["title", L("Acara", "Event")], ["date", L("Tarikh", "Date")], ["time", L("Masa", "Time")], ["place", L("Tempat", "Place")], ["bring", L("Bawa / pakai", "Bring / wear")], ["reply_by", L("Balas / tandatangan sebelum", "Reply / sign by")]].map(function(f){ return '<label for="kpr_' + f[0] + '">' + f[1] + '</label><input id="kpr_' + f[0] + '" class="rin" ' + (f[0] === "date" || f[0] === "reply_by" ? 'type="date" ' : f[0] === "time" ? 'type="time" ' : '') + 'value="' + E(j[f[0]] || "") + '">'; }).join("") + '</div>' + (img ? '<img class="kpPv" src="' + img + '" alt="">' : '') + '<p class="mut tiny">' + L("Gambar disimpan bersama acara.", "The photo is kept with the event.") + '</p>'; }
  var ov = H.showSheet((kind === "tt" ? "🗓 " : kind === "tk" ? "📅 " : "🖼 ") + L("Semak sebelum masuk", "Check before inserting"), h + '<div class="btns" style="margin-top:10px"><button class="btn alt g3d" id="kpLater">📥 ' + L("Simpan untuk semak", "Keep to review") + '</button><button class="btn gold g3d" id="kpIns">✓ ' + L("Masukkan", "Insert") + '</button></div>');
  var dropTray = function(){ if(fromTray != null) KD.review.splice(fromTray, 1); };
  ov.querySelector("#kpLater").onclick = function(){ if(fromTray == null){ KD.review.push({kind: kind, data: j, img: img}); } save(); H.closeOverlay(); draw(); H.toast("📥 " + L("Disimpan untuk disemak", "Kept to review")); };
  ov.querySelector("#kpIns").onclick = function(){ var q = function(s){ return ov.querySelector(s); }, keep = function(i){ var c = q('[data-rk="' + i + '"]'); return !c || c.checked; };
    if(kind === "tt"){ var nr = []; rows.forEach(function(r, i){ if(!keep(i)) return; nr.push({d: +q('[data-rd="' + i + '"]').value, s: q('[data-rs="' + i + '"]').value.trim(), e: q('[data-re="' + i + '"]').value.trim(), c: subCode(q('[data-rc="' + i + '"]').value)}); }); KD.tt = nr; dropTray(); save(); H.closeOverlay(); ST.v = "week"; ST.off = 0; draw(); H.toast("✓ " + nr.length + " " + L("waktu kelas ditambah", "periods added")); }
    else if(kind === "tk"){ var add = {terms: [], hol: [], exam: [], ev: []}; rows.forEach(function(r, i){ if(!keep(i)) return; var n = q('[data-rn="' + i + '"]').value.trim(), f = q('[data-rf="' + i + '"]').value, t = q('[data-rt="' + i + '"]').value || f; if(!f) return; if(r.k === "ev") add.ev.push({n: n, d: f}); else add[r.k].push({n: n, f: f, t: t}); });
      var apply = function(d){ ["terms","hol","exam","ev"].forEach(function(k){ d.tk[k] = (d.tk[k] || []).concat(add[k]); }); };
      apply(KD); dropTray(); save();
      if(q("#kpAllK") && q("#kpAllK").checked && H.kids){ var A = all(); H.kids().forEach(function(k){ if(k.id === K.id) return; var d = A[k.id] || blank(); d.tk = d.tk || {terms: [], hol: [], exam: [], ev: []}; apply(d); A[k.id] = d; }); A[K.id] = KD; H.save(KEY, A); }
      H.closeOverlay(); ST.v = "month"; draw(); H.toast("✓ " + L("Takwim ditambah", "Takwim added")); }
    else { var g = function(id){ return q("#kpr_" + id).value.trim(); }, n = g("title") || L("Acara sekolah", "School event"), d = g("date"), rb = g("reply_by");
      if(d) KD.ev.push({id: uid(), n: n, e: j.emoji || "📌", d: d, tm: g("time"), place: g("place"), bring: g("bring"), img: img || ""});
      if(rb) KD.forms.push({id: uid(), n: L("Balas: ", "Reply: ") + n, due: rb, img: img || "", signed: false});
      if(!d && !rb){ H.toast(L("Isi tarikh dahulu", "Fill in a date first")); return; }
      dropTray(); save(); H.closeOverlay(); ST.v = "week"; ST.off = d ? Math.round((pd(d) - today0()) / 864e5) : 0; draw(); H.toast("✓ " + n + (rb ? " · " + L("peringatan borang ditambah", "form reminder added") : "")); } }; }

// home widget: the child's day in one line
function summary(h, kid){ H = H || h; var save0 = K, kd0 = KD; K = kid; KD = load(kid.id); var d = today0(), s = ymd(d), it = items(d).filter(tickable), dn = it.filter(function(x){ return isDone(x, s); }).length, nm = new Date().getHours() * 60 + new Date().getMinutes(), nx = items(d).filter(function(x){ return mins(x.t) > nm && mins(x.t) < 9999; })[0];
  var out = {done: dn, total: it.length, next: nx ? nx.ic + " " + nx.n + " · " + fmt(nx.t) : "", hw: KD.hw.filter(function(x){ return !x.done; }).length}; K = save0; KD = kd0; return out; }

window.KPlan = {render: render, summary: summary, reload: reload, _t: {subCode: subCode, items: function(kid, d){ K = kid; KD = load(kid.id); return items(d); }, PROMPT: PROMPT, review: function(k, j){ review(k, j, ""); }}};
})();
