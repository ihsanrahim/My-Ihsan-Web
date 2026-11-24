/* My Ihsan 0.7.44 · School › Uniformed bodies: the page for one body (Pengakap, TKRS/KRS or PBSM).
   Tabs: Today (what to do next, the daily 15) · Learn (identity, 8 modules, cheat-sheets) · 3D Lab (Three.js, uniform/lab.js)
   · Quiz (practice with spaced repetition, mini exam) · Levels (ladder, practical stations, rubric, plans).
   Progress is per child in ihsan_uni_<child id> = {<body>: {xp, read, box, ex, st, sign, pass, streak, day}}. Colours only, no emblems.
   UniView.render(el, id, H) with H = {esc, L2x, load, save, toast, kid, back, open, loadJs}. */
window.UniView = (function(){
"use strict";
var D = window.UA, l3 = null, lessonReq = false, H = null, root = null, oid = "", O = null, kid = null, tab = "today", AL = null, S = null, mod = "", qz = null, lvSel = null, shOpen = {}, schReq = false, schU = "pengakap", schSt = "", schB = "", schP = {};
var TABS = [["today", "🏠", "Hari ini|Today"], ["learn", "📘", "Belajar|Learn"], ["lab", "🧪", "Makmal 3D|3D Lab"], ["quiz", "🧠", "Kuiz|Quiz"], ["lvl", "🏆", "Tahap|Levels"]];
var LAB = {pengakap:"Makmal Simpulan & Kompas|Knot & Compass Lab", krs:"Kawad Coach|Kawad Coach", pbsm:"Pelatih CPR & DRSABC|CPR & DRSABC Trainer"};
function L(a, b){ return H.L2x(a, b); }
function T(s){ s = String(s == null ? "" : s); var i = s.indexOf("|"); return i < 0 ? s : L(s.slice(0, i), s.slice(i + 1)); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function key(){ return "ihsan_uni_" + kid.id; }
function ld(){ AL = H.load(key(), {}); var s = AL[oid] = AL[oid] || {};
  s.xp = s.xp || 0; s.read = s.read || {}; s.box = s.box || {}; s.ex = s.ex || {}; s.st = s.st || {}; s.sign = s.sign || {}; s.pass = s.pass || {}; s.streak = s.streak || {d:"", n:0}; s.drills = s.drills || 0;
  if(!s.day || s.day.d !== ymd()) s.day = {d:ymd(), read:0, lab:0, quiz:0, daily:[], dd:0, dx:0};
  S = s; }
function sv(){ H.save(key(), AL); }
function touch(){ var t = ymd(), y = ymd(new Date(Date.now() - 864e5)); if(S.streak.d === t) return; S.streak.n = S.streak.d === y ? S.streak.n + 1 : 1; S.streak.d = t; }
function lvOf(xp){ var i = 0; D.LV.forEach(function(l, k){ if(xp >= l[1]) i = k; }); var nx = D.LV[i + 1], cur = D.LV[i][1]; return {i:i, name:D.LV[i][0], nx:nx ? nx[1] : null, pc:nx ? Math.round((xp - cur) * 100 / (nx[1] - cur)) : 100}; }
function gain(n){ touch(); var b = S.streak.n >= 7 ? Math.round(n * 1.2) : n, was = lvOf(S.xp).i; S.xp += b; var now = lvOf(S.xp);
  H.toast("+" + b + " XP" + (b !== n ? " 🔥" : "") + (now.i > was ? " · " + L("Naik tahap: ", "Level up: ") + T(now.name) + " 🎉" : "")); sv(); return b; }
// ---------- shell ----------
function banner(){ var lv = lvOf(S.xp), c = O.col;
  return '<div class="uaBan"><i class="uaDeco" aria-hidden="true"></i><div class="uaBanT"><button class="uaBk" id="uaBack" aria-label="' + L("Kembali", "Back") + '">‹</button><div class="uaBanN"><b>' + O.ic + ' ' + E(T(O.nn)) + '</b><small>' + E(O.full) + '</small></div><span class="uaMot">' + E(T(O.motto)) + '</span></div>' +
    '<div class="uaLv"><span class="uaLvB">' + L("Tahap ", "Level ") + (lv.i + 1) + ' · ' + E(T(lv.name)) + '</span><span class="uaXp"><i style="width:' + lv.pc + '%"></i></span><small>' + S.xp + (lv.nx ? ' / ' + lv.nx : '') + ' XP</small>' + (S.streak.n > 1 && S.streak.d >= ymd(new Date(Date.now() - 864e5)) ? '<span class="uaStk">🔥 ' + S.streak.n + '</span>' : '') + '</div></div>'; }
function tabList(){ var t = TABS.slice(); if(oid === "pengakap") t.splice(2, 0, ["scheme", "🔰", "Skim PPM|PPM Scheme"]); return t; }
function tabs(){ var tl = tabList(); return '<div class="uaTabs" role="tablist" style="--tn:' + tl.length + '">' + tl.map(function(t){ return '<button role="tab" class="uaTab' + (t[0] === tab ? ' on' : '') + '" data-ut="' + t[0] + '"><span>' + t[1] + '</span><b>' + E(T(t[2])) + '</b></button>'; }).join("") + '</div>'; }
function draw(){ if(!root || !document.body.contains(root)) return; ld(); stopLab();
  root.innerHTML = banner() + tabs() + '<div id="uaBody" class="uaBody"></div>';
  var b = root.querySelector("#uaBody"); ({today:vToday, learn:vLearn, scheme:vScheme, lab:vLab, quiz:vQuiz, lvl:vLvl}[tab] || vToday)(b);
  root.querySelector("#uaBack").onclick = function(){ H.back(); };
  root.querySelectorAll("[data-ut]").forEach(function(x){ x.onclick = function(){ go(x.getAttribute("data-ut")); }; }); }
function go(t, opt){ if(tab === t && !opt) return; tab = t; if(opt && opt.mod) mod = opt.mod; draw(); var v = document.getElementById("view"); if(v) v.scrollTop = 0; }
function card(h, b, cls){ return '<div class="card uaCard' + (cls ? ' ' + cls : '') + '">' + (h ? '<h3 class="uaH">' + h + '</h3>' : '') + b + '</div>'; }
// ---------- TODAY ----------
function vToday(b){ var d = S.day, nm = O.mods.filter(function(m){ return !S.read[m[0]]; })[0], dn = (d.read > 0 ? 1 : 0) + (d.lab > 0 ? 1 : 0) + (d.quiz >= 5 ? 1 : 0);
  var tk = [
    {ok:d.read > 0, ic:"📘", t:nm ? L("Baca kad: ", "Read card: ") + T(nm[2]) : L("Semak semula satu kad", "Review a card"), s:"+10 XP", f:function(){ go("learn", nm ? {mod:nm[0]} : null); }},
    {ok:d.lab > 0, ic:"🧪", t:L("Latihan 3D: ", "3D drill: ") + T(LAB[oid]), s:"+25 XP", f:function(){ go("lab"); }},
    {ok:d.quiz >= 5, ic:"🧠", t:L("Jawab 5 soalan kuiz", "Answer 5 quiz questions") + " (" + Math.min(5, d.quiz) + "/5)", s:"+5 XP / " + L("betul", "correct"), f:function(){ go("quiz"); }}];
  var h = card("🎯 " + L("Hari ini", "Today") + ' <small class="uaSm">' + dn + '/3</small>', '<div class="uaBar"><i style="width:' + Math.round(dn * 100 / 3) + '%"></i></div>' +
    tk.map(function(x, i){ return '<button class="uaTask' + (x.ok ? ' ok' : '') + '" data-tk="' + i + '"><span class="uaTi">' + (x.ok ? '✓' : x.ic) + '</span><span class="uaTt">' + E(x.t) + '</span><small>' + x.s + '</small></button>'; }).join("") +
    (dn === 3 ? '<div class="uaOk">✨ ' + L("Hebat! Tiga tugasan hari ini selesai. Jumpa esok.", "Great! All three tasks done today. See you tomorrow.") + '</div>' : ''), "uaPri");
  var dl = O.daily, dd = d.daily || [];
  h += card("⏱️ " + L("Rutin 15 minit", "The 15-minute routine") + ' <small class="uaSm">' + dd.length + '/' + dl.length + '</small>',
    dl.map(function(x, i){ return '<label class="uaChk"><input type="checkbox" data-dl="' + i + '"' + (dd.indexOf(i) >= 0 ? ' checked' : '') + '><span>' + E(T(x[0])) + '</span></label>'; }).join("") +
    '<div class="mut tiny">' + L("Tanda semua enam untuk +25 XP (sekali sehari). Letakkan peringatan selepas Asar dalam Perancang.", "Tick all six for +25 XP (once a day). Set a reminder after Asar in the Planner.") + '</div>');
  var Lx = (lvSel == null ? Math.min(4, lvOf(S.xp).i) : lvSel), stt = stat(Lx);
  h += card("🏆 " + L("Tahap ", "Level ") + (Lx + 1) + ' · ' + E(T(D.LV[Lx][0])), '<div class="uaBar"><i style="width:' + stt.pc + '%"></i></div><div class="mut tiny">' + L("Teori: ", "Theory: ") + (S.ex["L" + (Lx + 1)] != null ? S.ex["L" + (Lx + 1)] + '%' : '–') + ' · ' + L("Amali: ", "Practical: ") + stt.done + '/' + stt.n + (stt.pass ? ' · ✅' : '') + '</div><button class="btn alt g3d uaGo" data-ut2="lvl">' + L("Buka Tahap & Peperiksaan", "Open Levels & Exam") + ' ›</button>');
  if(oid === "pengakap") h += card("🔰 " + L("Skim Latihan PPM", "PPM Training Scheme"), '<div class="mut small">' + L("Keahlian → Usaha → Kegemaran → Maju → Pengetahuan & Perkhidmatan → Jaya → Rambu. Semak ujian setiap lencana.", "Keahlian → Usaha → Kegemaran → Maju → Pengetahuan & Perkhidmatan → Jaya → Rambu. Check the tests of every badge.") + '</div><button class="btn alt g3d uaGo" data-ut2="scheme">' + L("Buka Skim", "Open the Scheme") + ' ›</button>');
  h += '<div class="uaTwo"><button class="btn alt g3d" data-op="bulan">🗓️ ' + L("Perancang", "Planner") + '</button><button class="btn alt g3d" data-op="fokus">🎯 ' + L("Fokus", "Focus") + '</button></div>';
  h += '<details class="card uaCard uaDet"><summary>📅 ' + L("Gelung seminggu", "The weekly loop") + '</summary>' + D.WEEK.map(function(w){ return '<div class="uaLine"><b>' + E(T(w[0])) + '</b><span>' + E(T(w[1])) + '</span></div>'; }).join("") + '<div class="mut tiny">' + L("15 minit sehari dalam aplikasi + 1 pertemuan unit seminggu.", "15 minutes a day in the app + 1 unit meeting a week.") + '</div></details>';
  b.innerHTML = h;
  b.querySelectorAll("[data-tk]").forEach(function(x){ x.onclick = tk[+x.getAttribute("data-tk")].f; });
  b.querySelectorAll("[data-dl]").forEach(function(x){ x.onchange = function(){ var i = +x.getAttribute("data-dl"), a = S.day.daily, k = a.indexOf(i); if(x.checked && k < 0) a.push(i); if(!x.checked && k >= 0) a.splice(k, 1); touch(); sv();
    if(a.length === dl.length && !S.day.dd){ S.day.dd = 1; S.day.lab = S.day.lab || 0; gain(25); } draw(); }; });
  b.querySelectorAll("[data-ut2]").forEach(function(x){ x.onclick = function(){ go(x.getAttribute("data-ut2")); }; });
  b.querySelectorAll("[data-op]").forEach(function(x){ x.onclick = function(){ H.open("cal", x.getAttribute("data-op")); }; }); }
// ---------- LEARN ----------
function vLearn(b){ if(oid === "pengakap" && !(D.lessons && D.lessons.pengakap) && !lessonReq){ lessonReq = true; H.loadJs(["uniform/pgk_learn.js"], function(){ lessonReq = false; if(tab === "learn" && document.body.contains(root)) draw(); }, function(){ lessonReq = false; }); }
  var h = card("🪪 " + L("Kenali ", "Know ") + E(T(O.nn)), '<div class="uaAbout">' + E(T(O.about)) + '</div>' + O.facts.map(function(f){ return '<div class="uaFact"><b>' + E(T(f[0])) + '</b><span>' + E(T(f[1])) + '</span></div>'; }).join("") + '<div class="uaNote">ℹ️ ' + E(T(O.note)) + '</div>');
  var rd = O.mods.filter(function(m){ return S.read[m[0]]; }).length;
  h += '<div class="uaSec">📘 ' + L("8 modul", "8 modules") + ' <small>' + rd + '/8 ✓</small></div>';
  h += O.mods.map(function(m){ var on = mod === m[0], ok = S.read[m[0]];
    return '<div class="card uaCard uaMod' + (on ? ' open' : '') + (ok ? ' ok' : '') + '"><button class="uaMh" data-md="' + m[0] + '"><span class="uaMi">' + m[1] + '</span><span class="uaMt"><b>' + m[0] + ' · ' + E(T(m[2])) + '</b><small>' + E(T(m[3][0])) + (on ? '' : ' → …') + '</small></span><span class="uaMs">' + (ok ? '✓' : (on ? '⌃' : '›')) + '</span></button>' +
      (on ? '<div class="uaLvs">' + lessonHtml(m) + '<div class="uaSub">' + L("Tahap dalam modul ini", "Levels in this module") + '</div>' + m[3].map(function(c, i){ return '<div class="uaLvr"><span class="uaLn">' + (i < 3 ? 'L' + (i + 1) : 'L4–5') + '</span><span>' + E(T(c)) + '</span></div>'; }).join("") +
        '<button class="btn gold g3d uaGo" data-rd="' + m[0] + '">' + (ok ? '✓ ' + L("Sudah dibaca", "Already read") : L("Faham ✓ (+10 XP)", "Got it ✓ (+10 XP)")) + '</button></div>' : '') + '</div>'; }).join("");
  h += '<div class="uaSec">📋 ' + L("Helaian ringkas", "Cheat-sheets") + '</div>' + O.sheets.map(function(sh, i){ return '<details class="card uaCard uaDet"' + (shOpen[oid + i] ? ' open' : '') + ' data-sh="' + oid + i + '"><summary>' + E(T(sh.t)) + '</summary>' + sheet(sh) + '</details>'; }).join("");
  b.innerHTML = h;
  b.querySelectorAll("[data-md]").forEach(function(x){ x.onclick = function(){ var id = x.getAttribute("data-md"); mod = mod === id ? "" : id; draw(); var el = root.querySelector('[data-md="' + id + '"]'); if(el && mod) el.scrollIntoView({block:"nearest"}); }; });
  b.querySelectorAll("[data-rd]").forEach(function(x){ x.onclick = function(){ var id = x.getAttribute("data-rd"); if(!S.read[id]){ S.read[id] = 1; S.day.read++; gain(10); } draw(); }; });
  b.querySelectorAll("[data-sh]").forEach(function(x){ x.addEventListener("toggle", function(){ shOpen[x.getAttribute("data-sh")] = x.open; }); }); mountL3(b); }
function secBody(s){ var h = ""; if(s.p) h += '<p class="uaP">' + E(T(s.p)) + '</p>';
  if(s.list) h += '<ul class="uaUl">' + s.list.map(function(x){ return '<li>' + E(T(x)) + '</li>'; }).join("") + '</ul>';
  if(s.steps) h += '<ol class="uaUl uaOl">' + s.steps.map(function(x){ return '<li>' + E(T(x)) + '</li>'; }).join("") + '</ol>';
  if(s.rows) h += s.rows.map(function(r){ return '<div class="uaRw"><b>' + E(T(r[0])) + '</b><div class="uaRc"><span>' + E(T(r[1])) + '</span></div></div>'; }).join("");
  if(s.morse && D.MORSE) h += '<div class="uaMorse">' + Object.keys(D.MORSE).map(function(k){ return '<span><b>' + k + '</b>' + D.MORSE[k].replace(/\./g, "·").replace(/-/g, "–") + '</span>'; }).join("") + '</div>';
  if(s.n) h += '<div class="uaNote">ℹ️ ' + E(T(s.n)) + '</div>'; return h; }
function lessonHtml(m){ var ls = D.lessons && D.lessons[oid] && D.lessons[oid][m[0]]; if(!ls) return "";
  return '<div class="uaL3" id="uaL3"></div><div class="uaIntro">' + E(T(ls.intro)) + '</div>' + ls.secs.map(function(s, i){ return '<details class="uaSd"' + (i === 0 ? ' open' : '') + '><summary>' + E(T(s.h)) + '</summary>' + secBody(s) + '</details>'; }).join(""); }
function mountL3(b){ var ls = mod && D.lessons && D.lessons[oid] && D.lessons[oid][mod], host = b.querySelector("#uaL3"); if(!ls || !host) return; var mine = mod;
  H.loadJs((window.THREE ? [] : ["hajj/three.min.js"]).concat(window.UniLab ? [] : ["uniform/lab.js"]).concat(window.UniL3D ? [] : ["uniform/learn3d.js"]), function(){ if(!document.body.contains(host) || tab !== "learn" || mod !== mine) return; stopL3(); host.innerHTML = "";
    try{ l3 = UniL3D.mount(host, ls.d3, {T:T, L:L, E:E}); }catch(e){ console.error(e); host.innerHTML = '<div class="card mut">' + L("3D tidak dapat dimuatkan.", "3D could not load.") + '</div>'; } }, function(){ host.innerHTML = '<div class="card mut">' + L("Gagal memuatkan 3D.", "Could not load 3D.") + '</div>'; }); }
function sheet(sh){ if(sh.list) return '<ul class="uaUl">' + sh.list.map(function(x){ return '<li>' + E(T(x)) + '</li>'; }).join("") + '</ul>';
  var hd = sh.head.map(T); return sh.rows.map(function(r){ return '<div class="uaRw"><b>' + E(T(r[0])) + (r[1] && sh.head[1] && /^(Inggeris|BM|Melayu)/.test(sh.head[0]) ? '' : '') + '</b>' + r.slice(1).map(function(c, i){ return '<div class="uaRc"><small>' + E(hd[i + 1]) + '</small><span>' + E(T(c)) + '</span></div>'; }).join("") + '</div>'; }).join(""); }
// ---------- SCHEME (Pengakap: PPM "Skim Latihan Pengakap Muda") ----------
function SCH(){ return D.scheme && D.scheme[schU] && D.scheme.pengakap && D.scheme.remaja ? D.scheme[schU] : null; }
function bOf(st, id){ var b = null; (st.badges || [st]).forEach(function(x){ if(x.id === id) b = x; }); return b; }
function sc(){ return S.sc = S.sc || {}; }
function sp(){ return S.sp = S.sp || {}; }
function bProg(b){ var c = sc(), rs = b.parts.map(function(p, pi){ var n = p.need || p.items.length, t = 0; p.items.forEach(function(x, ii){ if(c[b.id + "." + pi + "." + ii]) t++; }); return {t:Math.min(t, n), n:n}; });
  if(b.pick && b.pick < rs.length){ rs.sort(function(a, z){ return z.t / z.n - a.t / a.n; }); rs = rs.slice(0, b.pick); }
  var t = 0, n = 0; rs.forEach(function(r){ t += r.t; n += r.n; }); return {t:t, n:n, pc:n ? Math.round(t * 100 / n) : 0}; }
function stDone(st){ var p = sp(); if(!st.badges) return !!p[st.id]; var n = 0; st.badges.forEach(function(b){ if(p[b.id]) n++; }); return n >= st.need && (!st.must || !!p[st.must]); }
function stN(st){ var p = sp(), n = 0; (st.badges || []).forEach(function(b){ if(p[b.id]) n++; }); return n; }
function vScheme(b){ var X = SCH();
  if(!X){ b.innerHTML = '<div class="card mut">' + L("Memuatkan skim…", "Loading the scheme…") + '</div>';
    if(!schReq){ schReq = true; H.loadJs(["uniform/pgk_scheme.js", "uniform/pgk_remaja.js"], function(){ schReq = false; if(tab === "scheme" && document.body.contains(root)) draw(); }, function(){ schReq = false; b.innerHTML = '<div class="card mut">' + L("Gagal memuatkan.", "Could not load.") + '</div>'; }); } return; }
  var list = X.order.map(function(id){ return X[id]; }), cur = null; list.forEach(function(st){ if(!cur && !stDone(st)) cur = st; });
  var sel = X[schSt] || cur || X.rambu, done = list.filter(stDone).length;
  var h = '<div class="uaChips">' + [["pengakap", "Pengakap Muda · 12–15"], ["remaja", "Pengakap Remaja · 15–18"]].map(function(u){ return '<button class="chip' + (schU === u[0] ? ' on' : '') + '" data-su="' + u[0] + '">' + u[1] + '</button>'; }).join("") + '</div>';
  h += card("🔰 " + (schU === "remaja" ? L("Skim Latihan Pengakap Remaja", "Pengakap Remaja Training Scheme") : L("Skim Latihan Pengakap Muda", "Pengakap Muda Training Scheme")), '<div class="uaAbout">' + E(T(X.intro)) + '</div><div class="uaBar"><i style="width:' + Math.round(done * 100 / list.length) + '%"></i></div><div class="mut tiny">' + done + '/' + list.length + ' ' + L("peringkat selesai · Tidak boleh dilangkau: setiap lencana ada ujian dan disahkan Penilai.", "stages done · No skipping: each badge has tests signed by an assessor.") + '</div>');
  h += '<div class="uaLad">' + list.map(function(st, i){ var d = stDone(st), n = stN(st), on = st === sel;
    return '<button class="uaLs' + (d ? ' ok' : '') + (on ? ' on' : '') + (st === cur ? ' cur' : '') + '" data-ss="' + st.id + '"><span class="uaLi">' + (d ? '✓' : st.ic) + '</span><b>' + E(T(st.n).replace(/^Lencana /, "").replace(/Kepandaian · /, "").replace(/^Tanda Cemerlang /, "")) + '</b>' + (st.badges ? '<small>' + n + '/' + st.need + '</small>' : '') + '</button>'; }).join("") + '</div>';
  h += stageHtml(sel, X);
  h += '<div class="uaSec">👕 ' + L("Di mana dipakai", "Where badges are worn") + '</div><div class="card uaCard"><div class="uaL3" id="uaL3"></div>' + X.wear.map(function(w){ return '<div class="uaRw"><b>' + E(T(w[0])) + '</b><div class="uaRc"><span>' + E(T(w[1])) + '</span></div></div>'; }).join("") + '</div>';
  h += '<details class="card uaCard uaDet"><summary>🧭 ' + L("Laluan & umur", "Path & ages") + '</summary>' + X.manage.map(function(w){ return '<div class="uaRw"><b>' + E(T(w[0])) + '</b><div class="uaRc"><span>' + E(T(w[1])) + '</span></div></div>'; }).join("") + '<div class="mut tiny">' + (schU === "remaja" ? L("Sumber: Skim Latihan Pengakap Remaja, PPM (Mac 2010). Sahkan butiran ujian dengan Pemimpin Pengakap dan Penilai anda.", "Source: Skim Latihan Pengakap Remaja, PPM (March 2010). Confirm test details with your Pemimpin Pengakap and assessor.") : L("Sumber: Skim Latihan Pengakap Muda, PPM (Mac 2010). Sahkan butiran ujian dengan Pemimpin Pengakap dan Penilai anda.", "Source: Skim Latihan Pengakap Muda, PPM (March 2010). Confirm test details with your Pemimpin Pengakap and assessor.")) + '</div></details>' +
    (X.info || []).map(function(f){ return '<details class="card uaCard uaDet"><summary>' + E(T(f[0])) + '</summary><ul class="uaUl">' + f[1].map(function(x){ return '<li>' + E(T(x)) + '</li>'; }).join("") + '</ul></details>'; }).join("");
  b.innerHTML = h;
  b.querySelectorAll("[data-su]").forEach(function(x){ x.onclick = function(){ schU = x.getAttribute("data-su"); schSt = ""; schB = ""; schP = {}; draw(); }; });
  b.querySelectorAll("[data-ss]").forEach(function(x){ x.onclick = function(){ schSt = x.getAttribute("data-ss"); schB = ""; draw(); }; });
  b.querySelectorAll("[data-sb]").forEach(function(x){ x.onclick = function(){ schB = schB === x.getAttribute("data-sb") ? "" : x.getAttribute("data-sb"); draw(); }; });
  b.querySelectorAll("[data-sk]").forEach(function(x){ x.onchange = function(){ var k = x.getAttribute("data-sk"); if(x.checked) sc()[k] = 1; else delete sc()[k]; touch(); sv(); draw(); }; });
  b.querySelectorAll("[data-sx]").forEach(function(x){ x.onclick = function(){ var id = x.getAttribute("data-sx"), st = X[schSt] || sel, bd = bOf(st, id), p = sp(); if(p[id]){ delete p[id]; sv(); } else { p[id] = 1; touch(); gain(st.xp || 75); if(stDone(st)) H.toast("🎉 " + T(st.n)); } draw(); }; });
  b.querySelectorAll("[data-sp]").forEach(function(x){ x.onclick = function(){ var k = x.getAttribute("data-sp"); schP[k] = schP[k] === undefined ? 1 : 1 - schP[k]; draw(); }; });
  mountBadges(b); }
function stageHtml(st, X){ var h = '<div class="card uaCard uaSch"><h3 class="uaH">' + st.ic + ' ' + E(T(st.n)) + (stDone(st) ? ' ✅' : '') + '</h3><div class="uaAbout">' + E(T(st.about)) + '</div><div class="uaNote">👕 ' + E(T(st.wear)) + '</div>';
  if(!st.badges){ return h + partsHtml(st) + '</div>'; }
  h += '<div class="uaSub">' + L("Pilih ", "Choose ") + st.need + (st.must ? L(" (wajib: ", " (compulsory: ") + E(T(bOf(st, st.must).n).replace(/ \(.*/, "")) + ")" : "") + ' · ' + stN(st) + '/' + st.need + ' ✓</div><div class="uaBgs">' + st.badges.map(function(bd){ var pr = bProg(bd), ps = sp()[bd.id];
    return '<button class="uaBg' + (ps ? ' ok' : '') + (schB === bd.id ? ' on' : '') + '" data-sb="' + bd.id + '"><span class="uaBi">' + (ps ? '✓' : bd.ic) + '</span><b>' + E(T(bd.n).replace(/ \(.*/, "")) + '</b><small>' + (ps ? L("Lulus", "Passed") : pr.pc + '%') + '</small></button>'; }).join("") + '</div>';
  var bd = bOf(st, schB); if(bd) h += '<div class="uaBdet"><h4 class="uaH2">' + bd.ic + ' ' + E(T(bd.n)) + '</h4>' + partsHtml(bd, st) + '</div>'; else h += '<div class="mut tiny">' + L("Ketik satu lencana untuk melihat ujiannya.", "Tap a badge to see its tests.") + '</div>';
  return h + '</div>'; }
function partsHtml(b, st){ var pr = bProg(b), ps = sp()[b.id], pk = b.pick, h = '<div class="uaBar"><i style="width:' + (ps ? 100 : pr.pc) + '%"></i></div><div class="mut tiny">' + pr.t + '/' + pr.n + ' ' + L("ujian", "tests") + (pk ? ' · ' + L("Pilih ", "Choose ") + pk + ' ' + L("bahagian", "part(s)") : '') + '</div>';
  h += b.parts.map(function(p, pi){ var k = b.id + "." + pi, n = p.need || p.items.length, t = 0; p.items.forEach(function(x, ii){ if(sc()[k + "." + ii]) t++; });
    var op = schP[k] === undefined ? (b.parts.length === 1 || pi === 0 ? 1 : 0) : schP[k], hd = p.h ? '<button class="uaPh" data-sp="' + k + '"><b>' + E(T(p.h)) + '</b><small>' + Math.min(t, n) + '/' + n + '</small><i>' + (op ? '⌃' : '›') + '</i></button>' : '';
    return '<div class="uaPt">' + hd + (op || !p.h ? p.items.map(function(x, ii){ var id = k + "." + ii; return '<label class="uaChk"><input type="checkbox" data-sk="' + id + '"' + (sc()[id] ? ' checked' : '') + '><span>' + E(T(x)) + '</span></label>'; }).join("") : '') + '</div>'; }).join("");
  var ok = pr.pc >= 100;
  return h + '<button class="btn ' + (ps ? 'alt' : 'gold') + ' g3d uaGo" data-sx="' + b.id + '">' + (ps ? '✓ ' + L("Lulus (ketik untuk batal)", "Passed (tap to undo)") : L("Lulus · disahkan Penilai (+", "Passed · signed by assessor (+") + (b.xp || (st && st.xp) || 75) + ' XP)') + '</button>' + (!ps && !ok ? '<div class="mut tiny">' + L("Tandakan ujian apabila anda sudah buat; hanya tekan Lulus selepas Penilai mengesahkan.", "Tick tests as you do them; only press Passed once your assessor signs it off.") + '</div>' : ''); }
function mountBadges(b){ var host = b.querySelector("#uaL3"); if(!host) return;
  H.loadJs((window.THREE ? [] : ["hajj/three.min.js"]).concat(window.UniLab ? [] : ["uniform/lab.js"]).concat(window.UniL3D ? [] : ["uniform/learn3d.js"]), function(){ if(!document.body.contains(host) || tab !== "scheme") return; stopL3(); host.innerHTML = "";
    try{ l3 = UniL3D.mount(host, schU === "remaja" ? "badgesR" : "badges", {T:T, L:L, E:E}); }catch(e){ console.error(e); host.innerHTML = '<div class="card mut">' + L("3D tidak dapat dimuatkan.", "3D could not load.") + '</div>'; } }, function(){ host.innerHTML = '<div class="card mut">' + L("Gagal memuatkan 3D.", "Could not load 3D.") + '</div>'; }); }
// ---------- 3D LAB ----------
var labObj = null;
function stopL3(){ if(l3 && l3.stop) try{ l3.stop(); }catch(e){} l3 = null; }
function stopLab(){ stopL3(); if(labObj && labObj.stop) try{ labObj.stop(); }catch(e){} labObj = null; }
function vLab(b){ b.innerHTML = card("🧪 " + E(T(LAB[oid])), '<div class="mut small">' + (oid === "pengakap" ? L("Putar tali, kemas simpulan langkah demi langkah; latih bearing kompas.", "Turn the rope, build each knot step by step; practise compass bearings.") : oid === "krs" ? L("Skuad 12 kadet mengikut arahan anda. Belajar arahan, kemudian uji sebagai ketua.", "A squad of 12 cadets follows your commands. Learn the commands, then test yourself as commander.") : L("Latih kadar CPR 100–120/min, kemudian susun langkah DRSABC.", "Practise a 100–120/min CPR rhythm, then put the DRSABC steps in order.")) + '</div>') + '<div class="uaLab" id="uaLab"><div class="card mut">' + L("Memuatkan 3D…", "Loading 3D…") + '</div></div>';
  var tb = b.querySelector("#uaLab"), mine = oid;
  H.loadJs((window.THREE ? [] : ["hajj/three.min.js"]).concat(window.UniLab ? [] : ["uniform/lab.js"]), function(){ if(!tb || !document.body.contains(tb) || tab !== "lab" || mine !== oid) return;
    tb.innerHTML = ""; try{ labObj = UniLab.mount(tb, oid, {T:T, L:L, E:E, O:O, toast:H.toast, done:labDone, drill:S.day.lab}); }catch(e){ console.error(e); tb.innerHTML = '<div class="card mut">' + L("3D tidak dapat dimuatkan di peranti ini.", "3D could not load on this device.") + '</div>'; } },
    function(){ if(tb) tb.innerHTML = '<div class="card mut">' + L("Gagal memuatkan.", "Could not load.") + '</div>'; }); }
function labDone(){ S.day.lab++; S.drills++; touch(); if(S.day.dx < 3){ S.day.dx++; gain(25); } else sv(); }
// ---------- QUIZ ----------
function leit(){ return O.quiz.map(function(q, i){ return S.box[i] || 0; }); }
function vQuiz(b){ if(qz) return vQz(b);
  var bx = leit(), mast = bx.filter(function(x){ return x >= 3; }).length, ex = S.ex.best;
  b.innerHTML = card("🧠 " + L("Kuiz", "Quiz"), '<div class="uaMast"><div class="uaBar"><i style="width:' + Math.round(mast * 100 / O.quiz.length) + '%"></i></div><small>' + L("Dikuasai ", "Mastered ") + mast + '/' + O.quiz.length + '</small></div>' +
    '<button class="uaMode g3d" data-qm="p"><span>🎯</span><span><b>' + L("Latihan", "Practice") + '</b><small>' + L("6 soalan, soalan lemah diulang dahulu. +5 XP setiap jawapan betul.", "6 questions, weak ones first. +5 XP per correct answer.") + '</small></span></button>' +
    '<button class="uaMode g3d" data-qm="e"><span>📝</span><span><b>' + L("Peperiksaan mini", "Mini exam") + '</b><small>' + L(Math.min(20, O.quiz.length) + " soalan, 10 minit, tiada petunjuk. Lulus ≥ 60% (+200 XP kali pertama).", Math.min(20, O.quiz.length) + " questions, 10 minutes, no hints. Pass at ≥ 60% (+200 XP the first time).") + '</small>' + (ex != null ? '<em>' + L("Terbaik: ", "Best: ") + ex + '%</em>' : '') + '</span></button>' +
    '<div class="mut tiny">' + O.quiz.length + " " + L("soalan dalam bank. Jawapan salah masuk semula ke atas senarai ulang kaji.", "questions in the bank. Wrong answers go back to the top of your review list.") + '</div>');
  b.querySelectorAll("[data-qm]").forEach(function(x){ x.onclick = function(){ startQ(x.getAttribute("data-qm")); }; }); }
function startQ(m){ var bx = leit(), idx = O.quiz.map(function(q, i){ return i; });
  if(m === "p"){ idx.sort(function(a, b){ return bx[a] - bx[b] || Math.random() - 0.5; }); idx = idx.slice(0, 6); } else { idx.sort(function(){ return Math.random() - 0.5; }); idx = idx.slice(0, Math.min(20, idx.length)); }
  qz = {m:m, idx:idx, i:0, right:0, wrong:[], pick:null, t0:Date.now(), end:Date.now() + 600000}; draw(); }
function vQz(b){ var q = O.quiz[qz.idx[qz.i]], n = qz.idx.length;
  if(qz.m === "e" && Date.now() > qz.end) return finishQ(b);
  var o = q[1], h = '<div class="card uaCard uaQ"><div class="uaQh"><span>' + (qz.m === "e" ? '📝 ' + L("Peperiksaan", "Exam") : '🎯 ' + L("Latihan", "Practice")) + ' · ' + (qz.i + 1) + '/' + n + '</span>' + (qz.m === "e" ? '<span id="uaTm" class="uaTm"></span>' : '') + '<button class="chip" id="uaQx">✕</button></div>' +
    '<div class="uaDots">' + qz.idx.map(function(x, i){ return '<i class="' + (i < qz.i ? 'd' : i === qz.i ? 'c' : '') + '"></i>'; }).join("") + '</div><div class="uaQt">' + E(T(q[0])) + '</div>' +
    o.map(function(x, i){ var cl = ""; if(qz.pick != null){ if(i === q[2]) cl = " good"; else if(i === qz.pick) cl = " bad"; } return '<button class="uaOpt' + cl + '" data-op="' + i + '"' + (qz.pick != null ? ' disabled' : '') + '><i>' + "ABC"[i] + '</i><span>' + E(T(x)) + '</span></button>'; }).join("");
  if(qz.pick != null){ var ok = qz.pick === q[2]; h += '<div class="uaFb ' + (ok ? 'good' : 'bad') + '"><b>' + (ok ? '✓ ' + L("Betul", "Correct") : '✗ ' + L("Belum tepat", "Not quite")) + '</b> ' + E(T(q[3])) + '</div><button class="btn gold g3d uaGo" id="uaNx">' + (qz.i + 1 < n ? L("Seterusnya", "Next") + ' ›' : L("Lihat keputusan", "See result")) + '</button>'; }
  b.innerHTML = h + '</div>';
  b.querySelectorAll("[data-op]").forEach(function(x){ x.onclick = function(){ var p = +x.getAttribute("data-op"), qi = qz.idx[qz.i], ok = p === q[2]; qz.pick = p; S.day.quiz++; S.box[qi] = ok ? Math.min((S.box[qi] || 0) + 1, 5) : 0; if(ok){ qz.right++; if(qz.m === "p") gain(5); else sv(); } else { qz.wrong.push(qi); sv(); } draw(); }; });
  var nx = b.querySelector("#uaNx"); if(nx) nx.onclick = function(){ qz.pick = null; qz.i++; if(qz.i >= n) finishQ(b); else draw(); };
  b.querySelector("#uaQx").onclick = function(){ qz = null; draw(); };
  if(qz.m === "e"){ var tm = b.querySelector("#uaTm"), tick = function(){ if(!qz || !document.body.contains(tm)) return; var s = Math.max(0, Math.round((qz.end - Date.now()) / 1000)); tm.textContent = "⏱ " + Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); if(s <= 0) return vQuiz(root.querySelector("#uaBody")); setTimeout(tick, 1000); }; tick(); } }
function finishQ(b){ var n = qz.idx.length, pc = Math.round(qz.right * 100 / n), m = qz.m, gr = pc >= 85 ? 0 : pc >= 70 ? 1 : pc >= 60 ? 2 : 3, lvl = lvSel == null ? Math.min(4, lvOf(S.xp).i) : lvSel, msg = "";
  if(m === "e"){ if(S.ex.best == null || pc > S.ex.best) S.ex.best = pc; var k = "L" + (lvl + 1); if(S.ex[k] == null || pc > S.ex[k]) S.ex[k] = pc; if(pc >= 60){ var first = !S.ex.passed; S.ex.passed = (S.ex.passed || 0) + 1; touch(); gain(first ? 200 : 50); msg = first ? "+200 XP 🎉" : "+50 XP"; } else sv(); }
  var wr = qz.wrong.slice(); qz = null;
  b.innerHTML = card("🏁 " + (m === "e" ? L("Keputusan peperiksaan", "Exam result") : L("Keputusan latihan", "Practice result")),
    '<div class="uaRes"><b>' + pc + '%</b><span>' + (m === "e" ? E(T(D.GRADES[gr][1])) + ' · ' + E(D.GRADES[gr][0]) : '') + '</span><small>' + msg + '</small></div>' +
    (wr.length ? '<div class="uaSec">' + L("Semak semula", "Review") + '</div>' + wr.map(function(i){ var q = O.quiz[i]; return '<div class="uaRv"><b>' + E(T(q[0])) + '</b><span>✓ ' + E(T(q[1][q[2]])) + '</span><small>' + E(T(q[3])) + '</small></div>'; }).join("") : '<div class="uaOk">✨ ' + L("Semua betul!", "All correct!") + '</div>') +
    '<div class="uaTwo"><button class="btn alt g3d" id="uaAg">↻ ' + L("Lagi", "Again") + '</button><button class="btn gold g3d" id="uaDn">' + L("Selesai", "Done") + '</button></div>');
  b.querySelector("#uaAg").onclick = function(){ startQ(m); }; b.querySelector("#uaDn").onclick = function(){ draw(); }; }
// ---------- LEVELS ----------
function stat(i){ var st = O.stations[i] || [], a = (S.st["L" + (i + 1)] || []), done = a.length, n = st.length, th = S.ex["L" + (i + 1)], ok = done === n && !!S.sign["L" + (i + 1)] && th != null && th >= 60;
  return {done:done, n:n, pc:Math.round((done + (S.sign["L" + (i + 1)] ? 1 : 0) + (th != null && th >= 60 ? 1 : 0)) * 100 / (n + 2)), pass:ok}; }
function vLvl(b){ var cur = lvOf(S.xp).i, Lx = lvSel == null ? Math.min(4, cur) : lvSel, k = "L" + (Lx + 1), st = O.stations[Lx] || [], a = S.st[k] || [], s2 = stat(Lx), th = S.ex[k];
  var h = card("🪜 " + L("Tangga tahap", "Level ladder"), D.LV.map(function(l, i){ return '<div class="uaStep' + (i <= cur ? ' ok' : '') + '"><span>' + (i <= cur ? '✓' : (i + 1)) + '</span><b>' + E(T(l[0])) + '</b><small>' + l[1] + ' XP</small></div>'; }).join("") +
    '<div class="mut tiny">+10 ' + L("kad", "card") + ' · +25 ' + L("latihan bersih", "clean drill") + ' · +200 ' + L("peperiksaan lulus", "exam passed") + ' · 🔥 ×1.2 ' + L("selepas 7 hari berturut-turut", "after 7 days in a row") + '</div>');
  h += '<div class="uaChips">' + D.LV.map(function(l, i){ return '<button class="chip' + (i === Lx ? ' on' : '') + '" data-lx="' + i + '">L' + (i + 1) + (stat(i).pass ? ' ✅' : '') + '</button>'; }).join("") + '</div>';
  h += card("🏅 " + L("Tahap ", "Level ") + (Lx + 1) + ' · ' + E(T(D.LV[Lx][0])) + (s2.pass ? ' ✅' : ''), '<div class="uaBar"><i style="width:' + s2.pc + '%"></i></div>' +
    '<div class="uaSub">🧠 ' + L("Teori (≥ 60%)", "Theory (≥ 60%)") + '</div><div class="uaLine"><span>' + (th != null ? th + '% ' + (th >= 60 ? '✅' : '❌') : L("Belum diambil", "Not taken yet")) + '</span><button class="btn alt g3d" data-qe="1">📝 ' + L("Ambil peperiksaan mini", "Take the mini exam") + '</button></div>' +
    '<div class="uaSub">🛠️ ' + L("Amali (disahkan guru / pemimpin)", "Practical (signed off by teacher / leader)") + '</div>' + st.map(function(x, i){ return '<label class="uaChk"><input type="checkbox" data-sn="' + i + '"' + (a.indexOf(i) >= 0 ? ' checked' : '') + '><span>' + E(T(x)) + '</span></label>'; }).join("") +
    '<div class="uaSub">🤝 ' + L("Sikap & kehadiran (10%)", "Attitude & attendance (10%)") + '</div><label class="uaChk"><input type="checkbox" data-sg="1"' + (S.sign[k] ? ' checked' : '') + '><span>' + L("Hadir ≥ 75%, berpakaian lengkap, ada khidmat; disahkan guru", "Attendance ≥ 75%, full uniform, service done; teacher signed") + '</span></label>' +
    (s2.pass ? '<div class="uaOk">🎉 ' + L("Tahap ini lulus! Lencana: ", "Level passed! Badge: ") + E(T(D.LV[Lx][0])) + '</div>' : ''));
  h += '<details class="card uaCard uaDet"><summary>📊 ' + L("Cara markah", "How it is marked") + '</summary>' + D.BLUE.map(function(r){ return '<div class="uaRw"><b>' + E(T(r[0])) + ' · ' + r[1] + '</b><div class="uaRc"><span>' + E(T(r[2])) + '</span></div><div class="uaRc"><small>' + L("Lulus", "Pass") + '</small><span>' + E(T(r[3])) + '</span></div></div>'; }).join("") +
    '<div class="uaSub">' + L("Rubrik amali (0–4)", "Practical rubric (0–4)") + '</div>' + D.RUBRIC.map(function(r){ return '<div class="uaRw"><b>' + E(T(r[0])) + '</b><div class="uaRc"><small>4</small><span>' + E(T(r[1])) + '</span></div><div class="uaRc"><small>2</small><span>' + E(T(r[2])) + '</span></div><div class="uaRc"><small>0</small><span>' + E(T(r[3])) + '</span></div></div>'; }).join("") +
    '<div class="uaSub">' + L("Gred", "Grades") + '</div><div class="uaGr">' + D.GRADES.map(function(g){ return '<span><b>' + g[0] + '</b> ' + E(T(g[1])) + '</span>'; }).join("") + '</div></details>';
  h += '<details class="card uaCard uaDet"><summary>📅 ' + L("Pelan belajar", "Study plan") + '</summary>' + D.YEAR.map(function(y){ return '<div class="uaRw"><b>' + E(T(y[0])) + '</b><div class="uaRc"><span>' + E(T(y[1])) + '</span></div></div>'; }).join("") + '<div class="uaSub">' + L("Pecut 8 minggu sebelum pertandingan atau peperiksaan", "8-week sprint before a competition or exam") + '</div><ul class="uaUl">' + D.SPRINT.map(function(x){ return '<li>' + E(T(x)) + '</li>'; }).join("") + '</ul></details>';
  h += '<details class="card uaCard uaDet"><summary>🧭 ' + L("Teroka & cemerlang", "Explore & excel") + '</summary><ul class="uaUl">' + O.explore.map(function(x){ return '<li>' + E(T(x)) + '</li>'; }).join("") + '<li>' + L("Simpan portfolio (gambar, sijil, buku log); ambil satu peranan kepimpinan setahun; ajar seorang junior; sertai satu pertandingan setiap penggal. Menyumbang kepada markah PAJSK.", "Keep a portfolio (photos, certificates, logbook); take one leadership role a year; teach a junior; enter one competition a term. Counts towards PAJSK marks.") + '</li></ul></details>';
  b.innerHTML = h;
  b.querySelectorAll("[data-lx]").forEach(function(x){ x.onclick = function(){ lvSel = +x.getAttribute("data-lx"); draw(); }; });
  b.querySelectorAll("[data-sn]").forEach(function(x){ x.onchange = function(){ var i = +x.getAttribute("data-sn"), arr = S.st[k] = S.st[k] || [], j = arr.indexOf(i); if(x.checked && j < 0) arr.push(i); if(!x.checked && j >= 0) arr.splice(j, 1); touch(); sv(); draw(); }; });
  b.querySelectorAll("[data-sg]").forEach(function(x){ x.onchange = function(){ S.sign[k] = x.checked ? 1 : 0; touch(); sv(); draw(); }; });
  b.querySelectorAll("[data-qe]").forEach(function(x){ x.onclick = function(){ tab = "quiz"; startQ("e"); }; }); }
// ---------- public ----------
function render(el, id, helpers){ H = helpers; root = el; oid = id; O = D.orgs[id]; kid = H.kid; stopLab(); el.className = "uaRoot ua-" + id; el.style.cssText = "--u1:" + O.col.p + ";--u2:" + O.col.a + ";--u3:" + O.col.k + ";--ud:" + O.col.d;
  if(!tab || (qz && qz.o !== id)) { tab = "today"; qz = null; } draw(); }
function stop(){ stopLab(); }
function navGet(){ if(!root || !document.body.contains(root)) return null; return {k:oid + ":" + tab, tab:tab}; }
function navSet(o){ if(o && o.tab && root && document.body.contains(root)){ tab = o.tab; qz = null; draw(); } }
return {render:render, stop:stop, navGet:navGet, navSet:navSet, reset:function(){ tab = "today"; qz = null; mod = ""; lvSel = null; schSt = ""; schB = ""; schP = {}; }};
})();
