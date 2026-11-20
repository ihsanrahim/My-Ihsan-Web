/* My Ihsan 0.5.25: Falak / Astronomy (Panduan › 🪐 Falak). Ten playful tools on one space-themed screen:
   1 Hilal map + tonight's crescent  2 Sky (point your phone)  3 Rasd al-Qibla + qibla from the sun  4 Shadow prayer clock
   5 Dawn & dusk sky  6 Eclipses + solat gerhana  7 Hilal reports from everyone  8 Hijri & moon calendar  9 Astrolabe & sundial
   10 Stories of Muslim astronomers. Engine: falak/astro.js. Map: falak/land.js (Natural Earth, public domain).
   Falak.open(H): H = finH() + loc() [lat, lon], tz(), hijri(date) {d,m,y}, getDay(date), openGerhana(), loadJs. No people in any picture. */
(function(){ "use strict";
var A = window.Astro, H = null, root = null, body = null, scr = "home", timers = [], cleanup = [], ST = {};
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function loc(){ var p = H.loc ? H.loc() : null; return p && p[0] != null ? p : [3.139, 101.687]; }
function tz(){ return H.tz ? H.tz() : -new Date().getTimezoneOffset()/60; }
function tm(d){ return d ? d.toLocaleTimeString(ibLoc(H.en()), {hour: "2-digit", minute: "2-digit"}) : "–"; }
function dt(d, wd){ return d ? d.toLocaleDateString(ibLoc(H.en()), {weekday: wd ? "short" : undefined, day: "numeric", month: "short", year: "numeric"}) : "–"; }
function dtm(d){ return d ? dt(d, true) + " · " + tm(d) : "–"; }
function f1(x){ return (Math.round(x*10)/10).toFixed(1); }
function cvs(el, w, h){ var c = document.createElement("canvas"), r = Math.min(2, window.devicePixelRatio || 1); c.width = Math.round(w*r); c.height = Math.round(h*r); c.style.width = w + "px"; c.style.height = h + "px"; el.appendChild(c); var g = c.getContext("2d"); g.scale(r, r); return {c: c, g: g, w: w, h: h}; }
function data(){ return H.load("ihsan_falak", null) || {}; }
function saveData(d){ H.save("ihsan_falak", d); }
function seen(id){ var d = data(); d.seen = d.seen || {}; if(!d.seen[id]){ d.seen[id] = Date.now(); saveData(d); } }
function clear(){ timers.forEach(function(t){ clearInterval(t); clearTimeout(t); }); timers = []; cleanup.forEach(function(f){ try{ f(); }catch(e){} }); cleanup = []; }
var TOOLS = [
  ["hilal","🌙","Peta hilal","Hilal map","Boleh nampak anak bulan malam ini?","Can the new moon be seen tonight?","#3b2a8f","#7b5cff"],
  ["bumi3d","🌍","Bumi, Bulan & Matahari","Earth, Moon & Sun","Fasa bulan & gerhana dalam 3D","Moon phases & eclipses in 3D","#06466b","#12b5cb"],
  ["langit","🔭","Langit","Sky view","Halakan telefon ke langit","Point your phone at the sky","#0b3b6b","#2b8cff"],
  ["rasd","🕋","Kiblat matahari","Qibla by the sun","Rasd al-Qiblah & bayang-bayang","Rasd al-Qibla & shadows","#7a4a00","#ffb300"],
  ["bayang","🕰️","Jam bayang","Shadow clock","Zohor & Asar dari bayang kayu","Zohor & Asar from a stick's shadow","#8a3b12","#ff7a3d"],
  ["senja","🌅","Fajar & senja","Dawn & dusk","Bila Subuh & Isyak bermula","When Subuh & Isyak begin","#6a1b4d","#ff5fa2"],
  ["gerhana","🌑","Gerhana","Eclipses","Gerhana akan datang + solat gerhana","Coming eclipses + the eclipse prayer","#1d1d3b","#8e7dff"],
  ["laporan","📡","Laporan hilal","Hilal reports","Siapa nampak anak bulan?","Who saw the new moon?","#0d5b4f","#2ee6b0"],
  ["kalendar","📅","Kalendar bulan","Moon calendar","Hijri, fasa bulan & bulan hari lahir","Hijri, moon phases & your birthday moon","#0f4c75","#3fc5f0"],
  ["astrolab","🧭","Astrolab & jam matahari","Astrolabe & sundial","Putar langit & cetak jam matahari","Spin the sky & print a sundial","#4a2c0f","#d9a441"],
  ["kisah","📜","Kisah ahli falak","Astronomer stories","Al-Battani, Al-Sufi, Al-Biruni…","Al-Battani, Al-Sufi, Al-Biruni…","#3a0f4a","#c86bff"]];

// ---------- moon picture ----------
function moonDraw(g, x, y, r, phase, glow){ // phase: elongation 0..360 (0 new, 180 full)
  var k = (1 - Math.cos(phase*Math.PI/180))/2, wax = phase < 180;
  if(glow){ var gr = g.createRadialGradient(x, y, r*0.8, x, y, r*1.9); gr.addColorStop(0, "rgba(255,244,200,.35)"); gr.addColorStop(1, "rgba(255,244,200,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r*1.9, 0, 7); g.fill(); }
  g.fillStyle = "#2c2f45"; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip();
  g.fillStyle = "#fff4cf"; g.beginPath(); var s = wax ? 1 : -1;
  g.arc(x, y, r, -Math.PI/2, Math.PI/2, !wax);           // lit half edge
  g.ellipse(x, y, Math.abs(1 - 2*k)*r, r, 0, Math.PI/2, -Math.PI/2, (k < 0.5) === wax ? true : false);
  g.fill();
  g.fillStyle = "rgba(180,170,140,.25)"; [[-0.3,-0.25,0.18],[0.25,0.2,0.13],[-0.1,0.35,0.1],[0.35,-0.3,0.08]].forEach(function(c){ g.beginPath(); g.arc(x + c[0]*r, y + c[1]*r, c[2]*r, 0, 7); g.fill(); });
  g.restore(); }

// ---------- shell ----------
function open(h, opt){ H = h; opt = opt || {}; close(true);
  root = document.createElement("div"); root.id = "falak"; root.innerHTML = '<div class="fkSpace"><i class="fkStars"></i><i class="fkStars b"></i><i class="fkP p1"></i><i class="fkP p2"></i><i class="fkP p3"></i></div><div class="fkTop"><button class="fkBtn" id="fkBack">‹</button><b id="fkTitle">🪐 ' + L("Falak", "Astronomy") + '</b><span class="fkLoc" id="fkLoc"></span></div><div class="fkBody" id="fkBody"></div>';
  document.body.appendChild(root); body = root.querySelector("#fkBody");
  root.querySelector("#fkBack").onclick = function(){ if(scr === "home") close(); else go("home"); };
  var p = loc(); root.querySelector("#fkLoc").textContent = "📍 " + p[0].toFixed(2) + ", " + p[1].toFixed(2);
  go(opt.tool || "home", opt); }
function close(quiet){ clear(); if(root){ root.remove(); root = null; } if(!quiet && H && H.onClose) H.onClose(); }
function go(s, opt){ clear(); scr = s; opt = opt || {}; body.scrollTop = 0; body.innerHTML = ""; var t = TOOLS.filter(function(x){ return x[0] === s; })[0];
  root.querySelector("#fkTitle").textContent = t ? t[1] + " " + L(t[2], t[3]) : "🪐 " + L("Falak", "Astronomy");
  root.className = "fk-" + s; if(t) seen(s);
  ({home: home, bumi3d: vEarth3D, hilal: vHilal, langit: vSky, rasd: vRasd, bayang: vShadow, senja: vTwilight, gerhana: vEclipse, laporan: vReports, kalendar: vCalendar, astrolab: vAstrolabe, kisah: vStories}[s] || home)(opt); }
function card(cls, html){ var d = document.createElement("div"); d.className = "fkCard " + (cls || ""); d.innerHTML = html; body.appendChild(d); return d; }

// ---------- home ----------
function home(){ var p = loc(), now = new Date(), mi = A.moonInfo(now), nm = A.nextPhase(now, 0), fm = A.nextPhase(now, 180), d = data(), n = Object.keys(d.seen || {}).length;
  var hero = card("fkHero", '<div class="fkHeroM"></div><div class="fkHeroT"><small>' + L("Bulan malam ini", "Tonight's moon") + '</small><b>' + phaseName(mi) + '</b><span>' + Math.round(mi.illum*100) + '% ' + L("bercahaya", "lit") + ' · ' + L("umur ", "age ") + f1(mi.age) + L(" hari", " days") + '</span>' +
    '<span>🌑 ' + L("Bulan baru: ", "New moon: ") + dtm(nm) + '</span><span>🌕 ' + L("Purnama: ", "Full moon: ") + dt(fm) + '</span></div>');
  var hm = hero.querySelector(".fkHeroM"), flat = function(){ hm.innerHTML = ""; var c = cvs(hm, 110, 110); moonDraw(c.g, 55, 55, 40, mi.phaseAngle, true); };
  flat(); need3d(function(){ if(scr !== "home" || !document.body.contains(hm) || !window.Falak3D.ok()) return; hm.innerHTML = ""; var m3 = window.Falak3D.moon(hm, 110, now); if(m3) cleanup.push(m3.stop); else flat(); });
  card("fkBadge", '<span>🏅 ' + L("Penjelajah angkasa", "Space explorer") + ' <b>' + n + '/' + TOOLS.length + '</b></span><span class="fkBar"><i style="width:' + Math.round(n*100/TOOLS.length) + '%"></i></span>');
  var g = document.createElement("div"); g.className = "fkGrid"; body.appendChild(g);
  TOOLS.forEach(function(t, i){ var b = document.createElement("button"); b.className = "fkTool" + ((d.seen || {})[t[0]] ? " seen" : ""); b.style.cssText = "--a:" + t[6] + ";--b:" + t[7] + ";animation-delay:" + (i*40) + "ms";
    b.innerHTML = '<span class="fkTi">' + t[1] + '</span><b>' + E(L(t[2], t[3])) + '</b><small>' + E(L(t[4], t[5])) + '</small>' + ((d.seen || {})[t[0]] ? '<em>⭐</em>' : ''); b.onclick = function(){ go(t[0]); }; g.appendChild(b); });
  card("fkNote", '<small>' + L("Semua kiraan dibuat pada telefon anda (formula Jean Meeus). Keputusan rasmi awal bulan Islam tetap oleh pihak berkuasa agama.", "Everything is worked out on your phone (Jean Meeus's formulas). The official start of each Islamic month is still decided by the religious authorities.") + '</small>'); }
function phaseName(mi){ var a = mi.phaseAngle; return a < 10 || a > 350 ? L("Bulan baru", "New moon") : a < 80 ? L("Anak bulan (sabit)", "Waxing crescent") : a < 100 ? L("Separuh awal", "First quarter") : a < 170 ? L("Bulan cembung", "Waxing gibbous") : a < 190 ? L("Purnama", "Full moon") : a < 260 ? L("Cembung susut", "Waning gibbous") : a < 280 ? L("Separuh akhir", "Last quarter") : L("Sabit tua", "Waning crescent"); }

// ---------- 3D (three.js, loaded only when needed) ----------
function need3d(cb){ if(window.THREE && window.Falak3D) return cb(); if(!H.loadJs) return; H.loadJs([window.THREE ? null : "hajj/three.min.js", "falak/f3d.js"].filter(Boolean), cb, function(){}); }
function vEarth3D(opt){ var p = loc(), wrap = card("fk3d", '<div class="fk3dBox" id="o3"><div class="fkMut">⏳ ' + L("Memuatkan 3D…", "Loading 3D…") + '</div></div>' +
    '<div class="fkChips"><button class="fkChip on" data-m="space">🚀 ' + L("Angkasa", "Space") + '</button><button class="fkChip" data-m="earth">🔭 ' + L("Dari Bumi (lokasi anda)", "From Earth (your place)") + '</button></div>' +
    '<div class="fkChips"><button class="fkChip on" data-s="0">⏸</button><button class="fkChip" data-s="3600">▶ ' + L("1 jam/s", "1 h/s") + '</button><button class="fkChip" data-s="86400">⏩ ' + L("1 hari/s", "1 day/s") + '</button><button class="fkChip" data-s="-86400">⏪</button></div>' +
    '<div class="fkChips"><button class="fkChip" data-j="now">🕐 ' + L("Sekarang", "Now") + '</button><button class="fkChip" data-j="new">🌑 ' + L("Bulan baru", "New moon") + '</button><button class="fkChip" data-j="full">🌕 ' + L("Purnama", "Full moon") + '</button><button class="fkChip" data-j="ecl">✨ ' + L("Gerhana seterusnya", "Next eclipse") + '</button></div>' +
    '<div class="fkRead" id="o3t"></div><div class="fkMut">' + L("Seret untuk berpusing, cubit untuk zum. Saiz dan jarak tidak mengikut skala: Bulan sebenarnya 60 kali jejari Bumi jauhnya. Titik merah ialah lokasi anda.", "Drag to turn, pinch to zoom. Sizes and distances are not to scale: the Moon is really 60 Earth radii away. The red dot is where you are.") + '</div>');
  var O = null, tEl = wrap.querySelector("#o3t"), lastK = "";
  var info = function(t){ var k = Math.floor(t.getTime()/60000); if(k === lastK) return; lastK = k; var mi = A.moonInfo(t), m = A.moon(t), el = mi.phaseAngle, ecl = "";
    if(Math.abs(m.lat) < 1.5 && (el < 3 || el > 357)) ecl = '<span class="fkOk">🌑 ' + L("Bayang Bulan jatuh pada Bumi: gerhana matahari!", "The Moon's shadow falls on Earth: a solar eclipse!") + '</span>';
    else if(Math.abs(m.lat) < 1.6 && Math.abs(el - 180) < 3) ecl = '<span class="fkOk">🌕 ' + L("Bulan memasuki bayang Bumi: gerhana bulan!", "The Moon enters Earth's shadow: a lunar eclipse!") + '</span>';
    tEl.innerHTML = '<b>🕐 ' + dtm(t) + '</b><span>' + phaseName(mi) + ' · ' + Math.round(mi.illum*100) + '% · ' + L("umur ", "age ") + f1(mi.age) + L(" hari", " days") + '</span>' + ecl +
      (O && O.mode() === "earth" ? '<small>' + L("Inilah rupa Bulan dari tempat anda (jika di atas ufuk).", "This is how the Moon looks from your place (when it is above the horizon).") + '</small>' : ''); };
  need3d(function(){ var box = wrap.querySelector("#o3"); if(!document.body.contains(box)) return; box.innerHTML = "";
    if(!window.Falak3D.ok()){ box.innerHTML = '<div class="fkMut">' + L("Telefon ini tidak menyokong 3D (WebGL).", "This phone does not support 3D (WebGL).") + '</div>'; return; }
    O = window.Falak3D.orrery(box, {loc: p, date: opt && opt.date, onTime: info, labels: {moon: L("Bulan", "Moon"), earth: L("Bumi", "Earth"), sun: L("Matahari", "Sun")}, w: Math.min(body.clientWidth - 30, 700)}); if(!O) return; cleanup.push(O.stop);
    var chips = function(attr, b){ wrap.querySelectorAll("[" + attr + "]").forEach(function(x){ x.classList.toggle("on", x === b); }); };
    wrap.querySelectorAll("[data-m]").forEach(function(b){ b.onclick = function(){ O.setMode(b.getAttribute("data-m")); chips("data-m", b); lastK = ""; }; });
    wrap.querySelectorAll("[data-s]").forEach(function(b){ b.onclick = function(){ O.setSpeed(+b.getAttribute("data-s")); chips("data-s", b); }; });
    wrap.querySelectorAll("[data-j]").forEach(function(b){ b.onclick = function(){ var j = b.getAttribute("data-j"), t = O.time(), x = j === "now" ? new Date() : j === "new" ? A.nextPhase(new Date(t.getTime() + 3600000), 0) : j === "full" ? A.nextPhase(new Date(t.getTime() + 3600000), 180) : (A.eclipses(new Date(t.getTime() + 86400000), 1)[0] || {}).t;
      if(x){ O.setSpeed(0); chips("data-s", wrap.querySelector('[data-s="0"]')); O.setTime(x); lastK = ""; } }; }); }); }

// ---------- 1. hilal map ----------
var CRIT = [["mabims","MABIMS","Malaysia, Indonesia, Brunei, Singapura (3° · 6.4°)","Malaysia, Indonesia, Brunei, Singapore (3° · 6.4°)"],["odeh","Odeh","Kriteria Odeh 2004 (ICOP)","Odeh 2004 (ICOP)"],["yallop","Yallop","Kriteria Yallop 1997 (UK)","Yallop 1997 (UK)"],["istanbul","Istanbul","Turki, 1978 (5° · 8°)","Turkey, 1978 (5° · 8°)"]];
var ZC = {A: "rgba(46,230,140,.62)", B: "rgba(255,214,64,.6)", C: "rgba(255,140,60,.5)", D: "rgba(0,0,0,0)"};
function vHilal(){ var p = loc(), now = new Date(), nm0 = A.newMoonBefore(now), conj = (now - nm0) < 2.5*86400000 ? nm0 : A.nextPhase(now, 0);
  var cd = A.localMidnight(conj, tz()), days = [0, 1, 2].map(function(i){ return new Date(cd.getTime() + i*86400000 + 12*3600000); });
  ST.hd = ST.hd != null ? ST.hd : (now > new Date(cd.getTime() + 86400000) ? 1 : 0); ST.hc = ST.hc || "mabims";
  var top = card("", '<div class="fkRow"><span>🌑 ' + L("Ijtimak (bulan baru): ", "Conjunction (new moon): ") + '<b>' + dtm(conj) + '</b></span></div><div class="fkChips" id="hD">' + days.map(function(d, i){ return '<button class="fkChip' + (ST.hd === i ? ' on' : '') + '" data-i="' + i + '">' + L("Petang ", "Evening ") + dt(d, true).replace(/ \d{4}$/, "") + '</button>'; }).join("") + '</div>' +
    '<div class="fkChips" id="hC">' + CRIT.map(function(c){ return '<button class="fkChip' + (ST.hc === c[0] ? ' on' : '') + '" data-c="' + c[0] + '">' + c[1] + '</button>'; }).join("") + '</div><div class="fkMut" id="hCx"></div>');
  var mapCard = card("fkMapC", '<div class="fkMap" id="hM"></div><div class="fkLeg"><span><i style="background:' + ZC.A + '"></i>' + L("Mudah dilihat", "Easily seen") + '</span><span><i style="background:' + ZC.B + '"></i>' + L("Mungkin dengan mata", "Maybe by eye") + '</span><span><i style="background:' + ZC.C + '"></i>' + L("Perlu teleskop", "Needs a telescope") + '</span><span><i style="background:#334"></i>' + L("Tidak kelihatan", "Not visible") + '</span></div>');
  var here = card("fkHere", '');
  var draw = function(){ top.querySelector("#hCx").textContent = L(CRIT.filter(function(c){ return c[0] === ST.hc; })[0][2], CRIT.filter(function(c){ return c[0] === ST.hc; })[0][3]);
    drawHilalMap(mapCard.querySelector("#hM"), days[ST.hd], conj, ST.hc); hereCard(here, days[ST.hd], conj); };
  top.querySelectorAll("[data-i]").forEach(function(b){ b.onclick = function(){ ST.hd = +b.getAttribute("data-i"); top.querySelectorAll("[data-i]").forEach(function(x){ x.classList.toggle("on", x === b); }); draw(); }; });
  top.querySelectorAll("[data-c]").forEach(function(b){ b.onclick = function(){ ST.hc = b.getAttribute("data-c"); top.querySelectorAll("[data-c]").forEach(function(x){ x.classList.toggle("on", x === b); }); draw(); }; });
  draw(); }
function drawHilalMap(el, day, conj, crit){ el.innerHTML = ""; var w = Math.min(el.clientWidth || 340, 900), h = Math.round(w*0.5), c = cvs(el, w, h), g = c.g, p = loc();
  var X = function(lon){ return (lon + 180)/360*w; }, Y = function(lat){ return (75 - lat)/135*h; }; // lat 75 .. -60
  g.fillStyle = "#0a1630"; g.fillRect(0, 0, w, h);
  var land = function(fill){ (window.FALAK_LAND || []).forEach(function(r){ g.beginPath(); for(var i = 0; i < r.length; i += 2){ var x = X(r[i]), y = Y(r[i+1]); if(i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); if(fill){ g.fillStyle = "#24365e"; g.fill(); } else { g.strokeStyle = "rgba(220,235,255,.55)"; g.lineWidth = 0.7; g.stroke(); } }); };
  land(true);
  var dlon = 3, dlat = 2.5, lat = 72.5, tok = (drawHilalMap.tok = (drawHilalMap.tok || 0) + 1), dd = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
  var row = function(){ if(tok !== drawHilalMap.tok || !document.body.contains(el)) return; var t0 = Date.now();
    while(lat > -60 && Date.now() - t0 < 30){ for(var lon = -178.5; lon < 180; lon += dlon){ var r = A.hilalFast(dd, lat, lon), z = A.gradeFast(r, crit, conj); if(z !== "D"){ g.fillStyle = ZC[z]; g.fillRect(X(lon - dlon/2), Y(lat + dlat/2), X(dlon) - X(0) + 0.6, Y(0) - Y(dlat) + 0.6); } } lat -= dlat; }
    if(lat > -60) timers.push(setTimeout(row, 0)); else { land(false); g.fillStyle = "#ff4d6d"; g.beginPath(); g.arc(X(p[1]), Y(p[0]), 4.5, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.stroke(); } };
  row(); }
function hereCard(el, day, conj){ var p = loc(), h = A.hilal(day, p[0], p[1], tz());
  if(!h){ el.innerHTML = '<div class="fkMut">' + L("Tiada matahari terbenam di sini pada tarikh ini.", "No sunset here on this date.") + '</div>'; return; }
  var a = h.atSunset, ok = h.crit[ST.hc] !== "D", big = {A: L("Boleh dilihat 👀", "Visible 👀"), B: L("Mungkin dengan mata kasar", "Maybe with the naked eye"), C: L("Hanya dengan teleskop / binokular", "Only with a telescope / binoculars"), D: L("Tidak kelihatan", "Not visible")}[h.crit[ST.hc]];
  el.innerHTML = '<div class="fkHereH"><div id="hHz"></div><div><small>📍 ' + L("Di lokasi anda, petang ", "At your location, evening of ") + dt(day, true) + '</small><b class="' + (ok ? "fkOk" : "fkNo") + '">' + big + '</b></div></div>' +
    '<div class="fkStats">' + [["🌇", L("Matahari terbenam", "Sunset"), tm(h.sunset)], ["🌙", L("Bulan terbenam", "Moonset"), tm(h.moonset)], ["⏱", L("Bulan kekal selepas matahari", "Moon stays after sunset"), h.lag > 0 ? Math.round(h.lag) + " min" : L("terbenam dahulu", "sets first")],
      ["📐", L("Tinggi bulan", "Moon altitude"), f1(a.altTopo) + "°"], ["↔️", L("Elongasi", "Elongation"), f1(a.elongGeo) + "°"], ["🎂", L("Umur bulan", "Moon age"), h.before ? f1(h.age) + L(" jam", " h") : L("belum ijtimak", "before conjunction")],
      ["🧭", L("Arah bulan", "Moon direction"), Math.round(a.az) + "° (" + (a.daz >= 0 ? L("kanan matahari ", "right of the sun ") : L("kiri matahari ", "left of the sun ")) + f1(Math.abs(a.daz)) + "°)"], ["✨", L("Cahaya", "Lit"), f1(a.illum*100) + "%"]].map(function(x){ return '<div><span>' + x[0] + '</span><small>' + x[1] + '</small><b>' + x[2] + '</b></div>'; }).join("") + '</div>' +
    '<div class="fkCrit">' + CRIT.map(function(c){ var z = h.crit[c[0]]; return '<span class="z' + z + '">' + c[1] + ' ' + (z === "D" ? "✗" : "✓") + '</span>'; }).join("") + '<span class="z' + h.crit.uq + '">Umm al-Qura ' + (h.crit.uq === "D" ? "✗" : "✓") + '</span></div>' +
    (h.lag > 0 && h.before ? '<button class="fkBig" id="hRem">🔔 ' + L("Ingatkan saya untuk melihat hilal", "Remind me to look for the hilal") + '</button><div class="fkMut">' + L("Tip: lihat ke arah barat sedikit ", "Tip: look a little ") + (a.daz >= 0 ? L("ke kanan", "to the right") : L("ke kiri", "to the left")) + L(" tempat matahari terbenam, kira-kira 10–20 minit selepas matahari terbenam.", " of where the sun set, about 10–20 minutes after sunset.") + '</div>' : '');
  var c = cvs(el.querySelector("#hHz"), 120, 90), g = c.g; var gr = g.createLinearGradient(0, 0, 0, 90); gr.addColorStop(0, "#1b2a6b"); gr.addColorStop(1, "#ff9a5a"); g.fillStyle = gr; g.fillRect(0, 0, 120, 90);
  g.fillStyle = "#1b3a2a"; g.fillRect(0, 70, 120, 20); var sx = 60, mx = 60 + Math.max(-50, Math.min(50, a.daz*3)), my = 70 - Math.max(-6, Math.min(64, a.altTopo*5));
  g.fillStyle = "#ffcf5a"; g.beginPath(); g.arc(sx, 76, 6, 0, 7); g.fill(); if(a.altTopo > -2) moonDraw(g, mx, my, 7, Math.max(8, a.elongGeo), true);
  var b3 = document.createElement("button"); b3.className = "fkBig alt"; b3.textContent = "🌍 " + L("Lihat ijtimak dalam 3D", "See the conjunction in 3D"); b3.onclick = function(){ go("bumi3d", {date: conj}); }; el.appendChild(b3);
  var rb = el.querySelector("#hRem"); if(rb) rb.onclick = function(){ if(H.xrem) H.xrem("fkhilal" + day.toISOString().slice(0, 10), h.sunset.getTime() - 10*60000, "🌙 " + L("Lihat hilal sekarang", "Look for the hilal now"), L("Matahari terbenam ", "Sunset at ") + tm(h.sunset) + L(". Lihat ke barat.", ". Look west."), "learn"); H.toast("🔔 " + tm(new Date(h.sunset.getTime() - 10*60000))); }; }

// ---------- 2. sky view ----------
function vSky(opt){ var p = loc(), W = Math.min(body.clientWidth - 24, 900), Hh = Math.round(Math.min(window.innerHeight*0.62, W*1.25));
  var v = ST.sky = ST.sky || {az: 270, alt: 30, fov: 90, dt: 0, follow: false, cam: false}; if(opt && opt.find){ v.find = opt.find; }
  var wrap = card("fkSkyC", '<div class="fkSky" id="sk"><video id="skV" playsinline muted autoplay></video></div><div class="fkChips"><button class="fkChip" id="skF">📱 ' + L("Ikut telefon", "Follow phone") + '</button><button class="fkChip" id="skC">📷 ' + L("Kamera", "Camera") + '</button><button class="fkChip" id="skN">🕐 ' + L("Sekarang", "Now") + '</button><button class="fkChip" id="skQ">🕋 ' + L("Kiblat", "Qibla") + '</button></div>' +
    '<label class="fkSl"><span id="skT"></span><input type="range" id="skR" min="-720" max="720" step="10" value="' + v.dt + '"></label><div class="fkInfo" id="skI">' + L("Seret untuk melihat sekeliling, cubit untuk zum, ketik objek untuk kisahnya.", "Drag to look around, pinch to zoom, tap an object for its story.") + '</div>');
  var box = wrap.querySelector("#sk"), c = cvs(box, W, Hh), g = c.g, objs = [], vid = wrap.querySelector("#skV"), stream = null;
  var qb = A.qibla(p[0], p[1]);
  if(v.find){ var t0 = new Date(Date.now() + v.dt*60000), s0 = A.STARS.filter(function(s){ return s[0] === v.find; })[0], hz = null;
    if(s0) hz = A.horiz({ra: s0[4]*15, dec: s0[5]}, t0, p[0], p[1]); else if(v.find === "moon") hz = A.horiz(A.topo(A.moon(t0), t0, p[0], p[1]), t0, p[0], p[1]); else if(v.find === "sun") hz = A.horiz(A.sun(t0), t0, p[0], p[1]);
    if(hz){ v.az = hz.az; v.alt = Math.max(5, hz.alt); } }
  var proj = function(az, alt){ // stereographic around the view centre
    var a0 = v.az*Math.PI/180, h0 = v.alt*Math.PI/180, a = az*Math.PI/180, h = alt*Math.PI/180;
    var cosc = Math.sin(h0)*Math.sin(h) + Math.cos(h0)*Math.cos(h)*Math.cos(a - a0); if(cosc < -0.2) return null;
    var k = 2/(1 + cosc), x = k*Math.cos(h)*Math.sin(a - a0), y = k*(Math.cos(h0)*Math.sin(h) - Math.sin(h0)*Math.cos(h)*Math.cos(a - a0)), sc = (W/2)/(2*Math.tan(v.fov*Math.PI/360));
    return [W/2 + x*sc, Hh/2 - y*sc]; };
  var draw = function(){ var t = new Date(Date.now() + v.dt*60000), sn = A.sun(t), sh = A.horiz(sn, t, p[0], p[1]); objs = [];
    wrap.querySelector("#skT").textContent = "🕐 " + dtm(t) + (v.dt ? " (" + (v.dt > 0 ? "+" : "") + f1(v.dt/60) + L(" jam)", " h)") : "");
    g.clearRect(0, 0, W, Hh);
    if(!v.cam){ var day = Math.max(0, Math.min(1, (sh.alt + 8)/14)), gr = g.createLinearGradient(0, 0, 0, Hh); gr.addColorStop(0, day > 0.5 ? "#3d8bff" : day > 0.05 ? "#1b2a6b" : "#03051a"); gr.addColorStop(1, day > 0.5 ? "#bfe3ff" : day > 0.05 ? "#ff8a5c" : "#101a3d"); g.fillStyle = gr; g.fillRect(0, 0, W, Hh); }
    // grid
    g.strokeStyle = "rgba(255,255,255,.12)"; g.lineWidth = 1; [0, 30, 60].forEach(function(al){ g.beginPath(); var st = false; for(var az = 0; az <= 360; az += 3){ var q = proj(az, al); if(q){ if(st) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); st = true; } else st = false; } g.stroke(); });
    // ground
    g.fillStyle = v.cam ? "rgba(10,40,20,.25)" : "rgba(14,46,30,.92)"; g.beginPath(); var first = true; for(var az2 = 0; az2 <= 360; az2 += 2){ var q2 = proj(az2, 0); if(q2){ if(first){ g.moveTo(q2[0], q2[1]); first = false; } else g.lineTo(q2[0], q2[1]); } }
    var qq = proj(v.az, -89); if(qq && !first){ g.lineTo(W, Hh); g.lineTo(0, Hh); g.closePath(); g.fill(); }
    g.strokeStyle = "rgba(140,255,190,.7)"; g.lineWidth = 1.5; g.beginPath(); first = true; for(var az3 = 0; az3 <= 360; az3 += 2){ var q3 = proj(az3, 0); if(q3){ if(first){ g.moveTo(q3[0], q3[1]); first = false; } else g.lineTo(q3[0], q3[1]); } else first = true; } g.stroke();
    g.font = "bold 14px system-ui"; g.textAlign = "center"; [["U", "N", 0], ["T", "E", 90], ["S", "S", 180], ["B", "W", 270]].forEach(function(d){ var q = proj(d[2], 1); if(q){ g.fillStyle = "#9cffc7"; g.fillText(H.en() ? d[1] : d[0], q[0], q[1] - 6); } });
    var qk = proj(qb, 2); if(qk){ g.font = "22px system-ui"; g.fillText("🕋", qk[0], qk[1]); g.font = "bold 11px system-ui"; g.fillStyle = "#ffe08a"; g.fillText(L("Kiblat ", "Qibla ") + Math.round(qb) + "°", qk[0], qk[1] + 14); }
    // constellation lines
    var spos = {}; A.STARS.forEach(function(s){ var hz = A.horiz({ra: s[4]*15, dec: s[5]}, t, p[0], p[1]); spos[s[0]] = hz; });
    var dark = v.cam ? 1 : Math.max(0, Math.min(1, (-sh.alt - 2)/10));
    if(dark > 0){ g.strokeStyle = "rgba(160,200,255," + 0.35*dark + ")"; g.lineWidth = 1; A.LINES.forEach(function(l){ var a = spos[l[0]], b = spos[l[1]]; if(!a || !b || a.alt < 0 || b.alt < 0) return; var pa = proj(a.az, a.alt), pb = proj(b.az, b.alt); if(pa && pb){ g.beginPath(); g.moveTo(pa[0], pa[1]); g.lineTo(pb[0], pb[1]); g.stroke(); } });
      A.STARS.forEach(function(s){ var hz = spos[s[0]]; if(hz.alt < -1) return; var q = proj(hz.az, hz.alt); if(!q) return; var r = Math.max(1.2, 4.2 - s[6]*1.1);
        g.fillStyle = "rgba(255,255,240," + dark + ")"; g.beginPath(); g.arc(q[0], q[1], r, 0, 7); g.fill(); objs.push({x: q[0], y: q[1], k: "star", s: s, hz: hz});
        if(s[6] < 1.3 || v.find === s[0]){ g.fillStyle = "rgba(255,255,255," + 0.8*dark + ")"; g.font = "11px system-ui"; g.fillText(s[0], q[0], q[1] - r - 3); }
        if(v.find === s[0]){ g.strokeStyle = "#ffe08a"; g.lineWidth = 2; g.beginPath(); g.arc(q[0], q[1], 14, 0, 7); g.stroke(); } }); }
    A.PLANETS.forEach(function(pl){ var pp = A.planet(pl[0], t), hz = A.horiz(pp, t, p[0], p[1]); if(hz.alt < -1) return; var q = proj(hz.az, hz.alt); if(!q) return;
      g.fillStyle = pl[4]; g.beginPath(); g.arc(q[0], q[1], 4.5, 0, 7); g.fill(); g.font = "bold 12px system-ui"; g.fillText(pl[1] + " " + L(pl[2], pl[3]), q[0], q[1] - 9); objs.push({x: q[0], y: q[1], k: "planet", pl: pl, hz: hz}); });
    var mo = A.topo(A.moon(t), t, p[0], p[1]), mh = A.horiz(mo, t, p[0], p[1]), mi = A.moonInfo(t); if(mh.alt > -2){ var qm = proj(mh.az, mh.alt); if(qm){ moonDraw(g, qm[0], qm[1], 13*90/v.fov, mi.phaseAngle, true); g.fillStyle = "#fff4cf"; g.font = "bold 12px system-ui"; g.fillText(L("Bulan", "Moon"), qm[0], qm[1] + 13*90/v.fov + 14); objs.push({x: qm[0], y: qm[1], k: "moon", hz: mh, mi: mi}); } }
    if(sh.alt > -2){ var qs = proj(sh.az, sh.alt); if(qs){ var gl = g.createRadialGradient(qs[0], qs[1], 4, qs[0], qs[1], 40); gl.addColorStop(0, "rgba(255,230,120,.9)"); gl.addColorStop(1, "rgba(255,200,80,0)"); g.fillStyle = gl; g.beginPath(); g.arc(qs[0], qs[1], 40, 0, 7); g.fill(); g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(qs[0], qs[1], 11, 0, 7); g.fill(); objs.push({x: qs[0], y: qs[1], k: "sun", hz: sh}); } }
    g.fillStyle = "rgba(255,255,255,.85)"; g.font = "bold 12px system-ui"; g.textAlign = "left"; g.fillText("🧭 " + Math.round(A.nrm(v.az)) + "°  ↕ " + Math.round(v.alt) + "°", 8, Hh - 10); g.textAlign = "center"; };
  // touch: drag / pinch / tap
  var pts = {}, last = null, pinch0 = null, moved = false;
  c.c.addEventListener("pointerdown", function(e){ c.c.setPointerCapture(e.pointerId); pts[e.pointerId] = [e.clientX, e.clientY]; moved = false; last = [e.clientX, e.clientY]; if(Object.keys(pts).length === 2){ var k = Object.keys(pts); pinch0 = {d: Math.hypot(pts[k[0]][0] - pts[k[1]][0], pts[k[0]][1] - pts[k[1]][1]), f: v.fov}; } });
  c.c.addEventListener("pointermove", function(e){ if(!pts[e.pointerId]) return; pts[e.pointerId] = [e.clientX, e.clientY]; var k = Object.keys(pts);
    if(k.length === 2 && pinch0){ var d = Math.hypot(pts[k[0]][0] - pts[k[1]][0], pts[k[0]][1] - pts[k[1]][1]); v.fov = Math.max(20, Math.min(150, pinch0.f*pinch0.d/Math.max(10, d))); moved = true; draw(); return; }
    if(v.follow) return; var dx = e.clientX - last[0], dy = e.clientY - last[1]; if(Math.abs(dx) + Math.abs(dy) > 3) moved = true; last = [e.clientX, e.clientY];
    var deg = v.fov/W; v.az = A.nrm(v.az - dx*deg); v.alt = Math.max(-30, Math.min(89, v.alt + dy*deg)); draw(); });
  var up = function(e){ var r = c.c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; delete pts[e.pointerId]; if(Object.keys(pts).length < 2) pinch0 = null; if(!moved) tap(x, y); };
  c.c.addEventListener("pointerup", up); c.c.addEventListener("pointercancel", function(e){ delete pts[e.pointerId]; pinch0 = null; });
  c.c.addEventListener("wheel", function(e){ e.preventDefault(); v.fov = Math.max(20, Math.min(150, v.fov*(e.deltaY > 0 ? 1.1 : 0.9))); draw(); }, {passive: false});
  var info = wrap.querySelector("#skI");
  var tap = function(x, y){ var best = null, bd = 30; objs.forEach(function(o){ var d = Math.hypot(o.x - x, o.y - y); if(d < bd){ bd = d; best = o; } }); if(!best) return;
    var t = new Date(Date.now() + v.dt*60000), pos = L("Tinggi ", "Altitude ") + Math.round(best.hz.alt) + "° · " + L("arah ", "direction ") + Math.round(best.hz.az) + "°";
    if(best.k === "star"){ var s = best.s; info.innerHTML = '<b>⭐ ' + E(s[0]) + (s[1] ? ' <span class="fkAr">' + s[1] + '</span>' : '') + '</b><div>' + E(L(s[2], s[3])) + '</div><small>' + pos + ' · ' + L("kecerahan ", "magnitude ") + s[6] + '</small>'; }
    else if(best.k === "planet"){ var pl = best.pl; info.innerHTML = '<b>' + pl[1] + ' ' + E(L(pl[2], pl[3])) + '</b><div>' + E(L("Planet. Nama Melayu " + pl[2] + " berasal daripada bahasa Arab.", "A planet. Its Malay name " + pl[2] + " comes from Arabic.")) + '</div><small>' + pos + '</small>'; }
    else if(best.k === "moon"){ info.innerHTML = '<b>🌙 ' + L("Bulan", "Moon") + ' · ' + phaseName(best.mi) + '</b><div>' + Math.round(best.mi.illum*100) + '% · ' + L("umur ", "age ") + f1(best.mi.age) + L(" hari", " days") + '</div><small>' + pos + '</small>'; }
    else info.innerHTML = '<b>☀️ ' + L("Matahari", "Sun") + '</b><div>' + L("Jangan sekali-kali melihat terus ke matahari.", "Never look straight at the sun.") + '</div><small>' + pos + '</small>'; };
  wrap.querySelector("#skR").oninput = function(){ v.dt = +this.value; draw(); };
  wrap.querySelector("#skN").onclick = function(){ v.dt = 0; wrap.querySelector("#skR").value = 0; draw(); };
  wrap.querySelector("#skQ").onclick = function(){ v.az = qb; v.alt = 10; draw(); };
  // follow the phone: native compass in camera mode (pitch gives how high the camera points)
  var hh = function(r){ if(r.deg == null) return; v.az = r.deg; if(r.pitch != null) v.alt = Math.max(-30, Math.min(89, -r.pitch)); draw(); };
  var stopF = function(){ if(!v.follow) return; v.follow = false; H.off("heading", hh); try{ if(H.N.setCompassCam) H.N.setCompassCam(false); H.N.stopCompass(); }catch(e){} wrap.querySelector("#skF").classList.remove("on"); };
  wrap.querySelector("#skF").onclick = function(){ if(v.follow){ stopF(); return; } if(!(window.Native && H.N.startCompass)){ H.toast(L("Perlu aplikasi pada telefon", "Needs the app on a phone")); return; }
    v.follow = true; this.classList.add("on"); H.on("heading", hh); try{ if(H.N.setCompassCam) H.N.setCompassCam(true); H.N.startCompass(p[0], p[1]); }catch(e){} H.toast(L("Pegang telefon tegak dan halakan ke langit", "Hold the phone upright and point it at the sky")); };
  var camOff = function(){ if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream = null; } v.cam = false; vid.style.display = "none"; wrap.querySelector("#skC").classList.remove("on"); };
  wrap.querySelector("#skC").onclick = function(){ var btn = this; if(v.cam){ camOff(); draw(); return; }
    var go2 = function(){ navigator.mediaDevices.getUserMedia({video: {facingMode: "environment"}}).then(function(s){ stream = s; vid.srcObject = s; vid.style.display = "block"; v.cam = true; btn.classList.add("on"); if(!v.follow) wrap.querySelector("#skF").click(); draw(); }).catch(function(){ H.toast(L("Kamera tidak tersedia", "Camera not available")); }); };
    if(H.N.hasPerm && !H.N.hasPerm("camera")){ var ph = function(r){ if(r.which !== "camera") return; H.off("perm", ph); if(r.granted) go2(); }; H.on("perm", ph); H.N.requestPerm("camera"); } else go2(); };
  cleanup.push(stopF, camOff); draw(); timers.push(setInterval(function(){ if(!v.follow) draw(); }, 30000)); }

// ---------- 3. Rasd al-Qibla ----------
function vRasd(){ var p = loc(), now = new Date(), y = now.getFullYear(), list = A.rasd(y).concat(A.rasd(y + 1)).filter(function(t){ return t > new Date(now.getTime() - 86400000); }).slice(0, 4), qb = A.qibla(p[0], p[1]);
  var nx = list[0], cd = card("fkRasd", '<div class="fkBigNum" id="rC"></div><div>' + L("Matahari tepat di atas Kaabah pada ", "The sun is straight above the Kaaba on ") + '<b>' + dtm(nx) + '</b></div><div class="fkMut">' + L("Pada saat itu, bayang-bayang setiap objek tegak di tempat yang matahari kelihatan membelakangi arah kiblat. Ikut garis bayang ke arah bertentangan.", "At that moment every upright object's shadow, wherever the sun is up, points straight away from the qibla. Follow the shadow line the other way.") + '</div>' +
    '<div class="fkList">' + list.map(function(t){ var alt = A.horiz(A.sun(t), t, p[0], p[1]).alt; return '<div><span>☀️ ' + dtm(t) + '</span><small>' + (alt > 3 ? L("matahari kelihatan di sini ✓", "sun is up here ✓") : L("matahari di bawah ufuk di sini", "sun is down here")) + '</small></div>'; }).join("") + '</div><button class="fkBig" id="rR">🔔 ' + L("Ingatkan saya (10 minit awal)", "Remind me (10 minutes before)") + '</button>');
  var tick = function(){ var s = Math.max(0, (nx - new Date())/1000), d = Math.floor(s/86400), h = Math.floor(s%86400/3600), m = Math.floor(s%3600/60), x = Math.floor(s%60); cd.querySelector("#rC").textContent = (d ? d + L(" hari ", "d ") : "") + [h, m, x].map(function(n){ return (n < 10 ? "0" : "") + n; }).join(":"); };
  tick(); timers.push(setInterval(tick, 1000));
  cd.querySelector("#rR").onclick = function(){ list.forEach(function(t, i){ if(H.xrem) H.xrem("fkrasd" + t.toISOString().slice(0, 10), t.getTime() - 600000, "🕋 Rasd al-Qiblah", L("Dalam 10 minit matahari tepat di atas Kaabah. Sediakan objek tegak.", "In 10 minutes the sun is straight above the Kaaba. Get an upright stick ready."), "learn"); }); H.toast("🔔 " + list.length + L(" peringatan", " reminders")); };
  // any sunny day: qibla from the sun's direction right now
  var sc = card("fkSunQ", '<h3>☀️ ' + L("Kiblat dari matahari, sekarang", "Qibla from the sun, right now") + '</h3><div id="rS"></div><div class="fkMut" id="rT"></div><button class="fkBig alt" id="rP">📷 ' + L("Guna gambar bayang-bayang", "Use a photo of a shadow") + '</button><div id="rPh"></div>');
  var draw = function(){ var t = new Date(), s = A.horiz(A.sun(t), t, p[0], p[1]), el = sc.querySelector("#rS"); el.innerHTML = "";
    if(s.alt < 5){ sc.querySelector("#rT").textContent = L("Matahari terlalu rendah atau sudah terbenam. Cuba ketika matahari terang.", "The sun is too low or has set. Try when the sun is bright."); return; }
    var shadow = A.nrm(s.az + 180), ang = A.nrm(qb - shadow), c = cvs(el, 240, 240), g = c.g, X = 120, Y = 120;
    g.fillStyle = "rgba(255,255,255,.08)"; g.beginPath(); g.arc(X, Y, 110, 0, 7); g.fill(); g.strokeStyle = "rgba(255,255,255,.3)"; g.stroke();
    var arrow = function(az, len, col, w, lab){ var r = (az - shadow)*Math.PI/180, ex = X + Math.sin(r)*len, ey = Y - Math.cos(r)*len; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(X, Y); g.lineTo(ex, ey); g.stroke(); g.fillStyle = col; g.font = "bold 13px system-ui"; g.textAlign = "center"; g.fillText(lab, X + Math.sin(r)*(len + 14), Y - Math.cos(r)*(len + 14) + 4); };
    arrow(shadow, 95, "#555b7a", 9, L("bayang", "shadow")); arrow(s.az, 60, "#ffd23f", 3, "☀️"); arrow(qb, 95, "#2ee6b0", 5, "🕋");
    g.fillStyle = "#fff"; g.beginPath(); g.arc(X, Y, 6, 0, 7); g.fill();
    sc.querySelector("#rT").innerHTML = L("Pacak sebatang kayu tegak. Kiblat ialah <b>", "Stand a stick upright. The qibla is <b>") + Math.round(ang) + L("° ikut arah jam</b> dari garis bayang (gambar di atas: bayang menghala ke atas).", "° clockwise</b> from its shadow (in the picture the shadow points up)."); };
  draw(); timers.push(setInterval(draw, 30000));
  sc.querySelector("#rP").onclick = function(){ var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.setAttribute("capture", "environment");
    inp.onchange = function(){ var f = inp.files[0]; if(!f) return; var rd = new FileReader(); rd.onload = function(){ var im = new Image(); im.onload = function(){ photoQibla(sc.querySelector("#rPh"), im, qb); }; im.src = rd.result; }; rd.readAsDataURL(f); }; inp.click(); }; }
function photoQibla(el, im, qb){ el.innerHTML = '<div class="fkMut">' + L("Ambil gambar terus dari atas. Seret jari dari pangkal kayu sepanjang bayang-bayang.", "Take the photo straight down from above. Drag from the foot of the stick along its shadow.") + '</div>';
  var W = Math.min(el.clientWidth || 320, 600), Hh = Math.round(W*im.height/im.width), c = cvs(el, W, Hh), g = c.g, a = null, b = null;
  var draw = function(){ g.drawImage(im, 0, 0, W, Hh); if(!a || !b) return; g.strokeStyle = "#555b7a"; g.lineWidth = 6; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    var t = new Date(), s = A.horiz(A.sun(t), t, loc()[0], loc()[1]), shadow = A.nrm(s.az + 180), ang = (qb - shadow)*Math.PI/180, base = Math.atan2(b[0] - a[0], -(b[1] - a[1])), L2 = Math.hypot(b[0] - a[0], b[1] - a[1]) + 40;
    var ex = a[0] + Math.sin(base + ang)*L2, ey = a[1] - Math.cos(base + ang)*L2; g.strokeStyle = "#2ee6b0"; g.lineWidth = 6; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(ex, ey); g.stroke(); g.font = "28px system-ui"; g.fillText("🕋", ex - 14, ey); };
  var pt = function(e){ var r = c.c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  c.c.addEventListener("pointerdown", function(e){ c.c.setPointerCapture(e.pointerId); a = pt(e); b = null; draw(); });
  c.c.addEventListener("pointermove", function(e){ if(a && e.buttons !== 0 || (a && e.pointerType === "touch")){ b = pt(e); draw(); } });
  draw(); }

// ---------- 4. shadow clock ----------
function vShadow(){ var p = loc(), today = new Date(), z = tz(), sr = A.sunrise(today, p[0], p[1], z), ss = A.sunset(today, p[0], p[1], z), noon = A.solarNoon(today, p[0], p[1], z), sn = A.sun(noon);
  var s0 = Math.tan(Math.abs(p[0] - sn.dec)*Math.PI/180), asar = function(k){ var alt = Math.atan(1/(k + s0))*180/Math.PI; return A.cross("sun", noon, p[0], p[1], alt, false, 10); };
  var aS = asar(1), aH = asar(2), cur = Math.max(sr.getTime(), Math.min(ss.getTime(), Date.now()));
  var cd = card("fkShadow", '<div id="shS"></div><label class="fkSl"><span id="shT"></span><input type="range" id="shR" min="' + sr.getTime() + '" max="' + ss.getTime() + '" step="60000" value="' + cur + '"></label><div class="fkRead" id="shV"></div>' +
    '<div class="fkList">' + [["🌄", L("Matahari terbit", "Sunrise"), sr], ["☀️", L("Zohor: bayang paling pendek, mula condong ke timur", "Zohor: shortest shadow, starts to turn east"), noon], ["🌤", L("Asar (Syafi'i): bayang = panjang kayu + bayang tengah hari", "Asar (Shafi'i): shadow = stick + noon shadow"), aS], ["⛅", L("Asar (Hanafi): bayang = 2× kayu + bayang tengah hari", "Asar (Hanafi): shadow = 2× stick + noon shadow"), aH], ["🌇", L("Maghrib: matahari terbenam", "Maghrib: sunset"), ss]].map(function(x){ return '<div><span>' + x[0] + ' ' + x[1] + '</span><b>' + tm(x[2]) + '</b></div>'; }).join("") + '</div>');
  var draw = function(){ var t = new Date(+cd.querySelector("#shR").value), hz = A.horiz(A.sun(t), t, p[0], p[1]), el = cd.querySelector("#shS"); el.innerHTML = "";
    var W = Math.min(body.clientWidth - 40, 520), Hh = 200, c = cvs(el, W, Hh), g = c.g, gr = g.createLinearGradient(0, 0, 0, Hh); gr.addColorStop(0, "#7cc8ff"); gr.addColorStop(1, "#d8f0ff"); g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
    g.fillStyle = "#7bc96f"; g.fillRect(0, 150, W, 50); var X = W/2, stick = 70, ratio = hz.alt > 0.5 ? 1/Math.tan(hz.alt*Math.PI/180) : 9, dir = (hz.az > 180 ? 1 : -1); // shadow points away from the sun (east in the afternoon)
    var sl = Math.min(W/2 - 10, stick*ratio); g.fillStyle = "rgba(30,40,60,.55)"; g.beginPath(); g.moveTo(X, 150); g.lineTo(X + dir*sl, 150); g.lineTo(X + dir*sl, 156); g.lineTo(X, 156); g.fill();
    g.fillStyle = "#8b5a2b"; g.fillRect(X - 3, 150 - stick, 6, stick); var sx = X - dir*Math.cos(hz.alt*Math.PI/180)*120, sy = 150 - Math.sin(hz.alt*Math.PI/180)*130;
    g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(sx, sy, 14, 0, 7); g.fill(); g.strokeStyle = "rgba(255,210,63,.5)"; g.lineWidth = 2; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(sx, sy); g.lineTo(X + dir*sl, 150); g.stroke(); g.setLineDash([]);
    cd.querySelector("#shT").textContent = "🕐 " + tm(t);
    var phase = t < noon ? L("Pagi: bayang memendek", "Morning: the shadow gets shorter") : t < aS ? L("Waktu Zohor", "Zohor time") : t < ss ? L("Waktu Asar", "Asar time") : "";
    cd.querySelector("#shV").innerHTML = '<b>' + L("Bayang = ", "Shadow = ") + f1(ratio) + L("× panjang kayu", "× the stick") + '</b><span>' + phase + '</span>'; };
  cd.querySelector("#shR").oninput = draw; draw();
  var m = card("", '<h3>📏 ' + L("Ukur sendiri", "Measure it yourself") + '</h3><div class="fkRow2"><label>' + L("Panjang kayu (cm)", "Stick length (cm)") + '<input id="mK" type="number" inputmode="decimal" value="30"></label><label>' + L("Panjang bayang (cm)", "Shadow length (cm)") + '<input id="mB" type="number" inputmode="decimal"></label></div><div class="fkRead" id="mR"></div>');
  var calc = function(){ var k = +m.querySelector("#mK").value, b = +m.querySelector("#mB").value, r = m.querySelector("#mR"); if(!(k > 0 && b >= 0)){ r.innerHTML = ""; return; } var x = b/k, aft = Date.now() > noon.getTime();
    r.innerHTML = '<b>' + f1(x) + '× ' + L("panjang kayu", "the stick") + '</b><span>' + (!aft ? L("Masih pagi: Zohor belum masuk.", "Still morning: Zohor has not started.") : x >= 2 + s0 ? L("Asar sudah masuk (Syafi'i dan Hanafi).", "Asar has started (Shafi'i and Hanafi).") : x >= 1 + s0 ? L("Asar sudah masuk (Syafi'i).", "Asar has started (Shafi'i).") : L("Masih waktu Zohor.", "Still Zohor time.")) + '</span><small>' + L("Bayang tengah hari hari ini: ", "Noon shadow today: ") + f1(s0) + '×</small>'; };
  m.querySelectorAll("input").forEach(function(i){ i.oninput = calc; }); }

// ---------- 5. dawn & dusk ----------
var METHODS = [["JAKIM (Malaysia)", 20, 18], ["MUIS (Singapura)", 20, 18], ["Kemenag (Indonesia)", 20, 18], ["Muslim World League", 18, 17], ["Umm al-Qura (Makkah)", 18.5, "90 min"], ["Mesir / Egypt", 19.5, 17.5], ["ISNA (Amerika Utara)", 15, 15]];
function vTwilight(){ var p = loc(), z = tz(), d = new Date(); ST.tw = ST.tw || "pm"; ST.dep = ST.dep != null ? ST.dep : 12;
  var cd = card("fkTw", '<div class="fkChips"><button class="fkChip' + (ST.tw === "am" ? ' on' : '') + '" data-t="am">🌄 ' + L("Fajar (Subuh)", "Dawn (Subuh)") + '</button><button class="fkChip' + (ST.tw === "pm" ? ' on' : '') + '" data-t="pm">🌆 ' + L("Senja (Maghrib → Isyak)", "Dusk (Maghrib → Isyak)") + '</button></div><div id="twS"></div>' +
    '<label class="fkSl"><span id="twL"></span><input type="range" id="twR" min="0" max="24" step="0.5" value="' + ST.dep + '"></label><div class="fkRead" id="twV"></div><div class="fkList" id="twT"></div>');
  var draw = function(){ var dep = ST.dep, el = cd.querySelector("#twS"); el.innerHTML = ""; var W = Math.min(body.clientWidth - 40, 560), Hh = 210, c = cvs(el, W, Hh), g = c.g;
    var k = Math.min(1, dep/18), top = mix([96, 160, 235], [3, 5, 20], k), mid = mix([255, 170, 110], [10, 16, 45], Math.min(1, dep/14)), hor = mix([255, 120, 70], [12, 18, 40], Math.min(1, dep/19));
    var gr = g.createLinearGradient(0, 0, 0, Hh*0.8); gr.addColorStop(0, rgb(top)); gr.addColorStop(0.65, rgb(mid)); gr.addColorStop(1, rgb(hor)); g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
    var nst = Math.round(Math.max(0, dep - 6)*14); for(var i = 0; i < nst; i++){ var x = (i*97.13)%W, y = (i*53.71)%(Hh*0.7); g.fillStyle = "rgba(255,255,255," + Math.min(1, (dep - 6)/10)*(0.4 + (i%5)/8) + ")"; g.fillRect(x, y, 1.6, 1.6); }
    if(ST.tw === "pm" && dep < 18){ var rg = g.createRadialGradient(W*0.5, Hh*0.82, 5, W*0.5, Hh*0.82, W*0.6); rg.addColorStop(0, "rgba(255,70,50," + 0.7*(1 - dep/18) + ")"); rg.addColorStop(1, "rgba(255,70,50,0)"); g.fillStyle = rg; g.fillRect(0, 0, W, Hh); }
    if(ST.tw === "am" && dep < 20){ g.fillStyle = "rgba(255,255,255," + 0.5*(1 - dep/20) + ")"; g.beginPath(); g.moveTo(W*0.42, Hh*0.8); g.lineTo(W*0.5, Hh*0.15); g.lineTo(W*0.58, Hh*0.8); g.fill(); }
    g.fillStyle = "#0b1a12"; g.beginPath(); g.moveTo(0, Hh*0.8); for(var x2 = 0; x2 <= W; x2 += 20) g.lineTo(x2, Hh*0.8 - 6 - 8*Math.abs(Math.sin(x2/60))); g.lineTo(W, Hh); g.lineTo(0, Hh); g.fill();
    g.fillStyle = "#e9c46a"; g.fillRect(W*0.7, Hh*0.8 - 40, 18, 34); g.beginPath(); g.arc(W*0.7 + 9, Hh*0.8 - 40, 9, Math.PI, 0); g.fill(); g.fillRect(W*0.7 + 30, Hh*0.8 - 58, 4, 52);
    cd.querySelector("#twL").textContent = L("Matahari ", "Sun ") + dep + L("° di bawah ufuk", "° below the horizon");
    var tw = A.twilight(d, p[0], p[1], z, dep), when = ST.tw === "am" ? tw.am : tw.pm;
    var say = ST.tw === "am" ? (dep >= 18 ? L("Masih gelap malam. Fajar sadiq belum muncul.", "Still night. True dawn has not appeared.") : dep >= 15 ? L("Fajar sadiq: cahaya putih melintang di ufuk timur. Ramai ulama: Subuh bermula sekitar sini.", "True dawn: a white light spreads along the eastern horizon. Many scholars: Subuh starts around here.") : dep >= 6 ? L("Langit makin cerah. Waktu Subuh masih berjalan.", "The sky brightens. Subuh time continues.") : L("Hampir syuruk: waktu Subuh hampir tamat.", "Nearly sunrise: Subuh time is almost over."))
      : (dep < 4 ? L("Waktu Maghrib bermula sejurus matahari terbenam.", "Maghrib starts as soon as the sun sets.") : dep < 17 ? L("Syafaq merah masih kelihatan di barat: masih waktu Maghrib.", "The red glow is still in the west: still Maghrib time.") : L("Syafaq merah hilang: waktu Isyak bermula (JAKIM 18°).", "The red glow has gone: Isyak begins (JAKIM 18°)."));
    cd.querySelector("#twV").innerHTML = '<b>🕐 ' + tm(when) + '</b><span>' + say + '</span>';
    cd.querySelector("#twT").innerHTML = METHODS.map(function(m){ var dg = ST.tw === "am" ? m[1] : m[2], t = typeof dg === "number" ? A.twilight(d, p[0], p[1], z, dg)[ST.tw] : new Date(A.sunset(d, p[0], p[1], z).getTime() + 90*60000); return '<div><span>' + m[0] + ' · ' + (typeof dg === "number" ? dg + "°" : dg) + '</span><b>' + tm(t) + '</b></div>'; }).join("") +
      (H.getDay ? (function(){ var t = H.getDay(d) || {}, v = ST.tw === "am" ? t.subuh : t.isyak; return v ? '<div class="me"><span>📱 ' + L("Waktu dalam aplikasi", "Time in the app") + '</span><b>' + v + '</b></div>' : ""; })() : ""); };
  cd.querySelectorAll("[data-t]").forEach(function(b){ b.onclick = function(){ ST.tw = b.getAttribute("data-t"); cd.querySelectorAll("[data-t]").forEach(function(x){ x.classList.toggle("on", x === b); }); draw(); }; });
  cd.querySelector("#twR").oninput = function(){ ST.dep = +this.value; draw(); }; draw();
  card("fkNote", '<small>' + L("Waktu solat yang berbeza antara negara datang daripada sudut matahari yang berbeza untuk fajar dan syafaq. Sentiasa ikut waktu rasmi di tempat anda.", "Prayer times differ between countries because each uses a different sun angle for dawn and dusk. Always follow your local official times.") + '</small>'); }
function mix(a, b, k){ return [0, 1, 2].map(function(i){ return Math.round(a[i] + (b[i] - a[i])*k); }); }
function rgb(c){ return "rgb(" + c.join(",") + ")"; }

// ---------- 6. eclipses ----------
function vEclipse(){ var p = loc(), list = A.eclipses(new Date(), 10, p[0], p[1]);
  card("fkWarn", '⚠️ ' + L("Jangan sekali-kali melihat matahari dengan mata kasar, teropong atau kamera tanpa penapis suria yang sah, walaupun ketika gerhana.", "Never look at the sun with bare eyes, binoculars or a camera without a proper solar filter, even during an eclipse."));
  var names = {total: L("penuh", "total"), annular: L("cincin", "annular"), hybrid: L("hibrid", "hybrid"), partial: L("separa", "partial"), penumbral: L("penumbra", "penumbral")};
  list.forEach(function(e){ var solar = e.type === "solar", vis = solar ? !!e.local : !!(e.local && e.local.any);
    var c = card("fkEcl" + (vis ? " vis" : ""), '<div class="fkEclH"><span class="fkEclI">' + (solar ? (e.kind === "annular" ? "💍" : "🌑") : "🌕") + '</span><div><b>' + (solar ? L("Gerhana matahari ", "Solar eclipse, ") : L("Gerhana bulan ", "Lunar eclipse, ")) + names[e.kind] + '</b><small>' + dtm(e.t) + '</small></div><span class="fkTag">' + (vis ? L("Kelihatan di sini", "Visible here") : L("Tidak kelihatan di sini", "Not visible here")) + '</span></div>' +
      (solar && e.local ? '<div class="fkRead"><b>' + Math.round(e.local.obsc*100) + L("% matahari tertutup", "% of the sun covered") + '</b><span>' + tm(e.local.start) + ' → ' + tm(e.local.max) + ' → ' + tm(e.local.end) + '</span></div>' : '') +
      (!solar ? '<div class="fkRead"><span>' + [["P1", e.P1], [L("Separa mula", "Partial starts"), e.U1], [L("Penuh mula", "Total starts"), e.U2], [L("Maksimum", "Maximum"), e.t], [L("Penuh tamat", "Total ends"), e.U3], [L("Separa tamat", "Partial ends"), e.U4], ["P4", e.P4]].filter(function(x){ return x[1]; }).map(function(x){ return x[0] + " " + tm(x[1]); }).join(" · ") + '</span>' + (e.local ? '<small>' + L("Bulan pada maksimum: ", "Moon at maximum: ") + Math.round(e.local.altMax) + L("° di atas ufuk", "° above the horizon") + '</small>' : '') + '</div>' : '') +
      '<button class="fkBig alt" data-3d>🌍 ' + L("Lihat dalam 3D", "See it in 3D") + '</button>' +
      (vis ? '<div class="fkBtns"><button class="fkBig" data-pray>🕌 ' + L("Cara solat gerhana", "How to pray the eclipse prayer") + '</button><button class="fkBig alt" data-rem>🔔 ' + L("Ingatkan", "Remind me") + '</button></div>' : ''));
    c.querySelector("[data-3d]").onclick = function(){ go("bumi3d", {date: e.t}); };
    var pr = c.querySelector("[data-pray]"); if(pr) pr.onclick = function(){ close(); if(H.openGerhana) H.openGerhana(); };
    var rm = c.querySelector("[data-rem]"); if(rm) rm.onclick = function(){ var st = solar ? e.local.start : (e.U1 || e.P1); if(H.xrem) H.xrem("fkecl" + e.t.toISOString().slice(0, 10), st.getTime() - 30*60000, (solar ? "🌑 " : "🌕 ") + L("Gerhana bermula dalam 30 minit", "Eclipse starts in 30 minutes"), L("Solat gerhana disunatkan ketika gerhana.", "The eclipse prayer is sunnah during the eclipse."), "learn"); H.toast("🔔 " + dtm(new Date(st.getTime() - 30*60000))); }; });
  if(!list.length) card("", L("Tiada gerhana ditemui.", "No eclipses found.")); }

// ---------- 7. hilal reports from everyone (public, approximate location) ----------
var RKIND = 1779, RRELAYS = window.SPLIT_RELAYS || ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net"];
function vReports(){ var now = new Date(), nm0 = A.newMoonBefore(now), conj = (now - nm0) < 3*86400000 ? nm0 : A.nextPhase(now, 0), tag = "myihsan-hilal-" + conj.toISOString().slice(0, 10), hj = H.hijri ? H.hijri(new Date(conj.getTime() + 5*86400000)) : null;
  var cd = card("fkRep", '<div><b>' + (hj ? E((window.HIJRI_MONTHS || [])[hj.m - 1] || "") + " " + hj.y + "H" : "") + '</b> · ' + L("ijtimak ", "conjunction ") + dtm(conj) + '</div><div class="fkMap" id="rpM"></div><div class="fkLeg"><span><i style="background:#2ee6b0"></i>' + L("Nampak", "Seen") + '</span><span><i style="background:#ff6b6b"></i>' + L("Tidak nampak", "Not seen") + '</span><span id="rpN"></span></div>' +
    '<button class="fkBig" id="rpAdd">📡 ' + L("Saya sudah cerap", "I looked for it") + '</button><div class="fkMut">' + L("Laporan awam dan tanpa nama. Lokasi dibundarkan kepada ~50 km. Ini untuk minat dan pembelajaran, bukan keputusan rasmi.", "Reports are public and anonymous. Location is rounded to about 50 km. For interest and learning, not an official decision.") + '</div><div class="fkList" id="rpL"></div>');
  var reps = {}, socks = [], alive = true;
  var draw = function(){ var el = cd.querySelector("#rpM"); el.innerHTML = ""; var w = Math.min(el.clientWidth || 340, 900), h = Math.round(w*0.5), c = cvs(el, w, h), g = c.g, X = function(lon){ return (lon + 180)/360*w; }, Y = function(lat){ return (75 - lat)/135*h; };
    g.fillStyle = "#0a1630"; g.fillRect(0, 0, w, h); (window.FALAK_LAND || []).forEach(function(r){ g.beginPath(); for(var i = 0; i < r.length; i += 2){ if(i) g.lineTo(X(r[i]), Y(r[i+1])); else g.moveTo(X(r[i]), Y(r[i+1])); } g.closePath(); g.fillStyle = "#24365e"; g.fill(); });
    var L0 = Object.keys(reps).map(function(k){ return reps[k]; }).sort(function(a, b){ return b.at - a.at; });
    L0.forEach(function(r){ g.fillStyle = r.seen ? "#2ee6b0" : "#ff6b6b"; g.beginPath(); g.arc(X(r.lon), Y(r.lat), 5, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 1; g.stroke(); });
    cd.querySelector("#rpN").textContent = L0.length + L(" laporan", " reports");
    cd.querySelector("#rpL").innerHTML = L0.slice(0, 30).map(function(r){ return '<div><span>' + (r.seen ? "✅ " + L("Nampak", "Seen") : "❌ " + L("Tidak nampak", "Not seen")) + ' · ' + ({clear: "☀️", haze: "🌫", cloud: "☁️"}[r.sky] || "") + ' ' + E(r.note || "") + '</span><small>' + r.lat + ", " + r.lon + ' · ' + tm(new Date(r.at*1000)) + '</small></div>'; }).join("") || '<div class="fkMut">' + L("Belum ada laporan untuk bulan ini.", "No reports for this month yet.") + '</div>'; };
  var ingest = function(e){ if(reps[e.id]) return; var o; try{ o = JSON.parse(e.content); }catch(x){ return; } if(!o || typeof o.lat !== "number" || typeof o.lon !== "number") return;
    reps[e.id] = {seen: !!o.seen, sky: String(o.sky || ""), note: String(o.note || "").slice(0, 60), lat: Math.round(o.lat*2)/2, lon: Math.round(o.lon*2)/2, at: e.created_at}; clearTimeout(draw.t); draw.t = setTimeout(draw, 150); };
  var start = function(){ var K = window.NostrKit; if(!K){ draw(); return; }
    RRELAYS.forEach(function(u){ var ws; try{ ws = new WebSocket(u); }catch(e){ return; } socks.push(ws); ws.onopen = function(){ try{ ws.send(JSON.stringify(["REQ", "hl", {kinds: [RKIND], "#t": [tag], limit: 500}])); }catch(e){} };
      ws.onmessage = function(m){ var d; try{ d = JSON.parse(m.data); }catch(e){ return; } if(d[0] === "EVENT" && d[2] && d[2].kind === RKIND) ingest(d[2]); }; ws.onerror = function(){}; });
    cd.querySelector("#rpAdd").onclick = function(){ var p = loc(), ov = H.showSheet("📡 " + L("Laporan cerapan hilal", "Hilal sighting report"), '<div class="fkChips" id="rS"><button class="fkChip on" data-v="1">✅ ' + L("Nampak", "Seen") + '</button><button class="fkChip" data-v="0">❌ ' + L("Tidak nampak", "Not seen") + '</button></div>' +
        '<div class="fkChips" id="rK"><button class="fkChip on" data-v="clear">☀️ ' + L("Cerah", "Clear") + '</button><button class="fkChip" data-v="haze">🌫 ' + L("Berjerebu", "Hazy") + '</button><button class="fkChip" data-v="cloud">☁️ ' + L("Berawan", "Cloudy") + '</button></div>' +
        '<input id="rN" class="ilq" maxlength="60" placeholder="' + L("Catatan ringkas (pilihan), cth. binokular", "Short note (optional), e.g. binoculars") + '"><div class="mut small">' + L("Lokasi dihantar: ", "Location sent: ") + (Math.round(p[0]*2)/2) + ", " + (Math.round(p[1]*2)/2) + '</div><button class="btn gold full g3d" id="rOk">' + L("Hantar laporan awam", "Send public report") + '</button>');
      var pick = function(id){ ov.querySelectorAll("#" + id + " [data-v]").forEach(function(b){ b.onclick = function(){ ov.querySelectorAll("#" + id + " [data-v]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; }); }; pick("rS"); pick("rK");
      ov.querySelector("#rOk").onclick = function(){ var d = data(); if(!d.sk){ d.sk = K.bytesToHex(K.schnorr.utils.randomPrivateKey()); saveData(d); }
        var sk = K.hexToBytes(d.sk), pub = K.bytesToHex(K.schnorr.getPublicKey(sk)), c0 = {v: 1, seen: ov.querySelector("#rS .on").getAttribute("data-v") === "1", sky: ov.querySelector("#rK .on").getAttribute("data-v"), note: ov.querySelector("#rN").value.trim().slice(0, 60), lat: Math.round(p[0]*2)/2, lon: Math.round(p[1]*2)/2};
        var e = {pubkey: pub, created_at: Math.floor(Date.now()/1000), kind: RKIND, tags: [["t", tag]], content: JSON.stringify(c0)};
        e.id = K.bytesToHex(K.sha256(K.utf8ToBytes(JSON.stringify([0, e.pubkey, e.created_at, e.kind, e.tags, e.content])))); e.sig = K.bytesToHex(K.schnorr.sign(K.hexToBytes(e.id), sk));
        var n = 0; socks.forEach(function(ws){ if(ws.readyState === 1){ try{ ws.send(JSON.stringify(["EVENT", e])); n++; }catch(x){} } }); ingest(e); H.closeOverlay(); H.toast(n ? L("Terima kasih! Laporan dihantar.", "Thank you! Report sent.") : L("Tiada internet: cuba lagi nanti.", "No internet: try again later.")); }; };
    draw(); };
  cleanup.push(function(){ alive = false; socks.forEach(function(ws){ try{ ws.close(); }catch(e){} }); });
  if(window.NostrKit) start(); else if(H.loadJs) H.loadJs(["groups/nostrkit.js"], start, start); else start(); }

// ---------- 8. moon & Hijri calendar ----------
var MY_SITES = [[6.35, 99.8], [3.14, 101.69], [5.98, 116.07], [1.55, 110.34]];
function monthStarts(n){ var out = [], t = A.newMoonBefore(new Date());
  for(var i = 0; i < n; i++){ var conj = i ? A.nextPhase(new Date(t.getTime() + 86400000), 0) : t; t = conj;
    var d0 = A.localMidnight(conj, 8), ev = new Date(d0.getTime() + 12*3600000), my = MY_SITES.some(function(s){ var h = A.hilal(ev, s[0], s[1], 8); return h && h.crit.mabims !== "D"; });
    var startMY = new Date(d0.getTime() + (my ? 1 : 2)*86400000);
    var dm = A.localMidnight(conj, 3), em = new Date(dm.getTime() + 12*3600000), hm = A.hilal(em, A.KAABA[0], A.KAABA[1], 3), startUQ = new Date(dm.getTime() + (hm && hm.crit.uq !== "D" ? 1 : 2)*86400000);
    var hj = H.hijri ? H.hijri(new Date(conj.getTime() + 10*86400000)) : null;
    out.push({conj: conj, my: startMY, uq: startUQ, hj: hj}); }
  return out; }
function vCalendar(){ var c1 = card("fkCal", '<h3>🌒 ' + L("Fasa bulan bulan ini", "This month's moon phases") + '</h3><div class="fkMoonGrid" id="cG"></div><div class="fkMut">' + L("⭐ = Hari Putih (13, 14, 15 Hijri): puasa sunat", "⭐ = the White Days (13, 14, 15 Hijri): sunnah fasts") + '</div>');
  var now = new Date(), y = now.getFullYear(), m = now.getMonth(), days = new Date(y, m + 1, 0).getDate(), first = (new Date(y, m, 1).getDay() + 6)%7, G = c1.querySelector("#cG");
  G.innerHTML = (H.en() ? ["M","T","W","T","F","S","S"] : ["Is","Se","Ra","Kh","Ju","Sa","Ah"]).map(function(d){ return '<i>' + d + '</i>'; }).join("") + new Array(first + 1).join("<span></span>");
  for(var d = 1; d <= days; d++){ var dd = new Date(y, m, d, 21), mi = A.moonInfo(dd), hj = H.hijri ? H.hijri(new Date(y, m, d)) : null, white = hj && hj.d >= 13 && hj.d <= 15;
    var cell = document.createElement("div"); cell.className = "fkMd" + (d === now.getDate() ? " td" : "") + (white ? " wh" : ""); cell.innerHTML = '<b>' + d + '</b>' + (hj ? '<small>' + hj.d + (white ? "⭐" : "") + '</small>' : ''); G.appendChild(cell); var c = cvs(cell, 26, 26); moonDraw(c.g, 13, 13, 10, mi.phaseAngle, false); }
  var c2 = card("", '<h3>📅 ' + L("Awal bulan Hijri (kiraan)", "Start of each Hijri month (calculated)") + '</h3><div class="fkTbl" id="cT"><div class="fkMut">…</div></div><div class="fkMut">' + L("Malaysia: kriteria MABIMS di Langkawi, Kuala Lumpur, Kota Kinabalu dan Kuching. Umm al-Qura: ijtimak sebelum matahari terbenam dan bulan terbenam selepasnya di Makkah. Tarikh rasmi ditentukan oleh pihak berkuasa.", "Malaysia: the MABIMS criteria at Langkawi, Kuala Lumpur, Kota Kinabalu and Kuching. Umm al-Qura: conjunction before sunset and moonset after sunset at Makkah. Official dates are decided by the authorities.") + '</div>');
  timers.push(setTimeout(function(){ var L0 = monthStarts(12), MN = window.HIJRI_MONTHS || [];
    c2.querySelector("#cT").innerHTML = '<div class="h"><span>' + L("Bulan", "Month") + '</span><span>' + L("Ijtimak", "Conjunction") + '</span><span>🇲🇾</span><span>🇸🇦</span></div>' + L0.map(function(x){ var same = x.my.toDateString() === x.uq.toDateString();
      return '<div><span><b>' + (x.hj ? E(MN[x.hj.m - 1] || "") + " " + x.hj.y : "") + '</b></span><span>' + dt(x.conj).replace(/ \d{4}$/, "") + '</span><span>' + dt(x.my).replace(/ \d{4}$/, "") + '</span><span class="' + (same ? "" : "diff") + '">' + dt(x.uq).replace(/ \d{4}$/, "") + '</span></div>'; }).join(""); }, 60));
  var c3 = card("fkBday", '<h3>🎂 ' + L("Bulan pada hari lahir anda", "The moon on your birthday") + '</h3><input type="date" id="cB" class="fkInp"><div class="fkHereH"><div id="cBm"></div><div id="cBt" class="fkRead"></div></div>');
  var bd = function(){ var v = c3.querySelector("#cB").value; if(!v) return; var dd = new Date(v + "T20:00:00"), mi = A.moonInfo(dd), el = c3.querySelector("#cBm"); el.innerHTML = ""; var c = cvs(el, 100, 100); moonDraw(c.g, 50, 50, 38, mi.phaseAngle, true); var hj = H.hijri ? H.hijri(new Date(v + "T12:00:00")) : null;
    c3.querySelector("#cBt").innerHTML = '<b>' + phaseName(mi) + '</b><span>' + Math.round(mi.illum*100) + '% · ' + L("umur ", "age ") + f1(mi.age) + L(" hari", " days") + '</span>' + (hj ? '<span>🌙 ' + hj.d + " " + E((window.HIJRI_MONTHS || [])[hj.m - 1] || "") + " " + hj.y + 'H</span>' : ''); var d0 = data(); d0.bday = v; saveData(d0); };
  c3.querySelector("#cB").onchange = bd; if(data().bday){ c3.querySelector("#cB").value = data().bday; bd(); } }

// ---------- 9. astrolabe & sundial ----------
function vAstrolabe(){ ST.ab = ST.ab || "astro"; var t0 = card("", '<div class="fkChips"><button class="fkChip' + (ST.ab === "astro" ? ' on' : '') + '" data-a="astro">🧭 ' + L("Astrolab", "Astrolabe") + '</button><button class="fkChip' + (ST.ab === "dial" ? ' on' : '') + '" data-a="dial">☀️ ' + L("Jam matahari", "Sundial") + '</button></div>');
  var box = document.createElement("div"); body.appendChild(box);
  t0.querySelectorAll("[data-a]").forEach(function(b){ b.onclick = function(){ ST.ab = b.getAttribute("data-a"); t0.querySelectorAll("[data-a]").forEach(function(x){ x.classList.toggle("on", x === b); }); clear(); box.innerHTML = ""; (ST.ab === "astro" ? astro : dial)(box); }; });
  (ST.ab === "astro" ? astro : dial)(box); }
function astro(box){ var p = loc(), S = Math.min(body.clientWidth - 40, 420), wrap = document.createElement("div"); wrap.className = "fkCard fkAstro"; box.appendChild(wrap);
  wrap.innerHTML = '<div class="fkMut">' + L("Pusing piring bintang (rete) dengan jari untuk melihat langit pada sebarang masa, seperti astrolab ahli falak Muslim.", "Turn the star plate (the rete) with your finger to see the sky at any time, like the astrolabes of Muslim astronomers.") + '</div><div id="abC"></div><div class="fkRead" id="abT"></div>';
  var c = cvs(wrap.querySelector("#abC"), S, S), g = c.g, R0 = S/2 - 8, X = S/2, Y = S/2, dt0 = 0;
  var draw = function(){ var t = new Date(Date.now() + dt0*60000); g.clearRect(0, 0, S, S);
    var gr = g.createRadialGradient(X, Y, 10, X, Y, R0 + 6); gr.addColorStop(0, "#1a2a5c"); gr.addColorStop(1, "#070b22"); g.fillStyle = gr; g.beginPath(); g.arc(X, Y, R0 + 6, 0, 7); g.fill();
    g.strokeStyle = "#d9a441"; g.lineWidth = 6; g.beginPath(); g.arc(X, Y, R0 + 3, 0, 7); g.stroke();
    g.fillStyle = "#f5d98b"; g.font = "bold 10px system-ui"; g.textAlign = "center";
    for(var hh = 0; hh < 24; hh++){ var a = (hh/24)*Math.PI*2; g.fillText(String(hh), X + Math.sin(a)*(R0 - 8), Y - Math.cos(a)*(R0 - 8) + 4); }
    var pr = function(alt, az){ if(alt < 0) return null; var r = R0*0.86*Math.tan((90 - alt)*Math.PI/360)/Math.tan(Math.PI/4), a = az*Math.PI/180; return [X + Math.sin(a)*r, Y - Math.cos(a)*r]; };
    [30, 60].forEach(function(al){ g.strokeStyle = "rgba(217,164,65,.35)"; g.lineWidth = 1; g.beginPath(); for(var az = 0; az <= 360; az += 5){ var q = pr(al, az); if(az) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); } g.stroke(); });
    g.strokeStyle = "rgba(217,164,65,.8)"; g.lineWidth = 1.5; g.beginPath(); g.arc(X, Y, R0*0.86, 0, 7); g.stroke();
    ["U", "T", "S", "B"].forEach(function(d, i){ var q = pr(0, i*90); g.fillStyle = "#9cffc7"; g.font = "bold 12px system-ui"; g.fillText(H.en() ? "NESW"[i] : d, X + (q[0] - X)*1.07, Y + (q[1] - Y)*1.07 + 4); });
    var qb = A.qibla(p[0], p[1]), qq = pr(0, qb); g.font = "16px system-ui"; g.fillText("🕋", X + (qq[0] - X)*0.97, Y + (qq[1] - Y)*0.97);
    var vis = 0; A.STARS.forEach(function(s){ var hz = A.horiz({ra: s[4]*15, dec: s[5]}, t, p[0], p[1]), q = pr(hz.alt, hz.az); if(!q) return; vis++; g.fillStyle = "#fff8e0"; g.beginPath(); g.arc(q[0], q[1], Math.max(1.2, 3.6 - s[6]), 0, 7); g.fill(); if(s[6] < 1.2){ g.fillStyle = "rgba(255,248,224,.85)"; g.font = "9px system-ui"; g.fillText(s[0], q[0], q[1] - 5); } });
    A.PLANETS.forEach(function(pl){ var hz = A.horiz(A.planet(pl[0], t), t, p[0], p[1]), q = pr(hz.alt, hz.az); if(!q) return; g.fillStyle = pl[4]; g.beginPath(); g.arc(q[0], q[1], 4, 0, 7); g.fill(); g.font = "bold 11px system-ui"; g.fillText(pl[1], q[0], q[1] - 7); });
    var mh = A.horiz(A.moon(t), t, p[0], p[1]), qm = pr(mh.alt, mh.az); if(qm) moonDraw(g, qm[0], qm[1], 8, A.moonInfo(t).phaseAngle, true);
    var sh = A.horiz(A.sun(t), t, p[0], p[1]), qs = pr(sh.alt, sh.az); if(qs){ g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(qs[0], qs[1], 9, 0, 7); g.fill(); }
    var ha = (t.getHours() + t.getMinutes()/60)/24*Math.PI*2; g.strokeStyle = "#ff7a52"; g.lineWidth = 3; g.beginPath(); g.moveTo(X, Y); g.lineTo(X + Math.sin(ha)*(R0 - 18), Y - Math.cos(ha)*(R0 - 18)); g.stroke();
    wrap.querySelector("#abT").innerHTML = '<b>🕐 ' + dtm(t) + '</b><span>' + vis + L(" bintang terang di atas ufuk · ", " bright stars above the horizon · ") + (sh.alt > 0 ? L("siang", "daytime") : sh.alt > -18 ? L("senja/fajar", "twilight") : L("malam", "night")) + '</span>'; };
  var ang0 = null, dt1 = 0; c.c.addEventListener("pointerdown", function(e){ c.c.setPointerCapture(e.pointerId); var r = c.c.getBoundingClientRect(); ang0 = Math.atan2(e.clientX - r.left - X, -(e.clientY - r.top - Y)); dt1 = dt0; });
  c.c.addEventListener("pointermove", function(e){ if(ang0 == null) return; var r = c.c.getBoundingClientRect(), a = Math.atan2(e.clientX - r.left - X, -(e.clientY - r.top - Y)), d = a - ang0; if(d > Math.PI) d -= 2*Math.PI; if(d < -Math.PI) d += 2*Math.PI; dt0 = dt1 + d/(2*Math.PI)*1440; draw(); });
  c.c.addEventListener("pointerup", function(){ ang0 = null; }); draw(); }
function dial(box, back){ var p = loc(), lat = p[0], lon = p[1], z = tz(), eq = Math.abs(lat) < 20, wrap = document.createElement("div"); wrap.className = "fkCard"; box.appendChild(wrap);
  wrap.innerHTML = '<div class="fkMut">' + (eq ? L("Dekat khatulistiwa, jam matahari khatulistiwa paling sesuai: dail diletakkan condong ", "Near the equator an equatorial sundial works best: tilt the dial ") + Math.abs(lat).toFixed(1) + L("° menghadap ", "° facing ") + (lat >= 0 ? L("utara", "north") : L("selatan", "south")) + L(", dengan batang menembusi tengah dan selari dengan paksi bumi.", ", with a rod through the centre parallel to Earth's axis.") : L("Jam matahari mendatar untuk latitud anda. Letak di tempat rata, garis 12 menghala ke utara benar.", "A horizontal sundial for your latitude. Place it flat, with the 12 line pointing to true north.")) + '</div>' + (eq ? '<div class="fkChips"><button class="fkChip' + (back ? '' : ' on') + '" data-f="0">⬆ ' + L("Muka atas (Mac–Sep)", "Top face (Mar–Sep)") + '</button><button class="fkChip' + (back ? ' on' : '') + '" data-f="1">⬇ ' + L("Muka bawah (Sep–Mac)", "Back face (Sep–Mar)") + '</button></div>' : '') + '<div id="dC"></div><div class="fkBtns"><button class="fkBig" id="dP">🖨 ' + L("Cetak / kongsi PDF", "Print / share PDF") + '</button></div><div class="fkList" id="dE"></div>';
  var S = 1000, cv = document.createElement("canvas"); cv.width = S; cv.height = Math.round(S*1.414); var g = cv.getContext("2d"), X = S/2, Y = eq ? 560 : 760, corr = (lon - z*15)/15;
  g.fillStyle = "#fffaf0"; g.fillRect(0, 0, S, cv.height); g.fillStyle = "#3a2a10"; g.textAlign = "center"; g.font = "bold 44px Georgia"; g.fillText(L("Jam Matahari", "Sundial") + " · My Ihsan", X, 80); g.font = "24px system-ui"; if(eq){ g.font = "bold 26px system-ui"; g.fillText(back ? L("Muka BAWAH (akhir Sep – Mac)", "BACK face (late Sep – Mar)") : L("Muka ATAS (akhir Mac – Sep)", "TOP face (late Mar – Sep)"), X, 160); g.font = "24px system-ui"; }
  g.fillText(L("Untuk ", "For ") + lat.toFixed(2) + "°, " + lon.toFixed(2) + "° · " + (eq ? L("dail khatulistiwa", "equatorial dial") : L("dail mendatar", "horizontal dial")), X, 120);
  g.strokeStyle = "#9c6c12"; g.lineWidth = 4; g.beginPath(); g.arc(X, Y, 400, 0, 7); g.stroke(); g.lineWidth = 2;
  for(var hh = 5; hh <= 19; hh += 0.5){ var Hh = (hh - 12 + corr)*15; if(Math.abs(Hh) > 100) continue; var th = eq ? Hh*Math.PI/180 : Math.atan(Math.sin(Math.abs(lat)*Math.PI/180)*Math.tan(Hh*Math.PI/180)); if(!eq && Math.abs(Hh) > 90) th = (Hh > 0 ? 1 : -1)*Math.PI - th;
    var sg = (lat >= 0 ? 1 : -1)*(back ? -1 : 1), ex = X + Math.sin(th)*sg*380, ey = Y - Math.cos(th)*380; g.strokeStyle = hh%1 ? "rgba(156,108,18,.45)" : "#9c6c12"; g.beginPath(); g.moveTo(X, Y); g.lineTo(ex, ey); g.stroke();
    if(hh%1 === 0){ g.fillStyle = "#3a2a10"; g.font = "bold 30px Georgia"; g.fillText(String(hh > 12 ? hh - 12 : hh), X + Math.sin(th)*sg*440, Y - Math.cos(th)*440 + 10); } }
  var qb = A.qibla(lat, lon), qa = (qb)*Math.PI/180; if(!eq){ g.strokeStyle = "#0b5d3b"; g.lineWidth = 5; g.setLineDash([18, 10]); g.beginPath(); g.moveTo(X, Y); g.lineTo(X + Math.sin(qa)*360, Y - Math.cos(qa)*360); g.stroke(); g.setLineDash([]); }
  if(!eq){ g.fillStyle = "#0b5d3b"; g.font = "bold 26px system-ui"; g.fillText("🕋 " + L("Kiblat", "Qibla"), X + Math.sin(qa)*300, Y - Math.cos(qa)*300 - 12); g.fillStyle = "#b23a48"; g.fillText("↑ " + L("UTARA BENAR", "TRUE NORTH"), X, Y - 470); }
  g.fillStyle = "#3a2a10"; g.font = "22px system-ui"; g.textAlign = "left";
  var tips = eq ? [L("1. Cetak, lekat pada kadbod dan tebuk lubang di tengah.", "1. Print, glue onto card and pierce the centre."), L("2. Masukkan lidi/batang melalui lubang, tegak lurus pada dail.", "2. Push a rod through the hole, square to the dial."), L("3. Condongkan dail ", "3. Tilt the dial ") + Math.abs(lat).toFixed(1) + L("° dari menegak, batang menghala ke ", "° from vertical, rod pointing to ") + (lat >= 0 ? L("utara benar.", "true north.") : L("selatan benar.", "true south.")), L("4. Bayang batang menunjuk waktu tempatan (sudah dibetulkan untuk longitud anda).", "4. The rod's shadow shows local clock time (already corrected for your longitude).")]
    : [L("1. Cetak dan lekat pada papan.", "1. Print and glue onto a board."), L("2. Buat segi tiga (gnomon) bersudut ", "2. Make a triangle (gnomon) with an angle of ") + Math.abs(lat).toFixed(1) + L("°, berdiri di atas garis 12.", "°, standing on the 12 line."), L("3. Halakan garis 12 ke utara benar.", "3. Point the 12 line to true north.")];
  tips.forEach(function(t, i){ g.fillText(t, 70, cv.height - 330 + i*40); });
  g.fillText(L("Tambah pembetulan (persamaan masa) di bawah untuk ketepatan minit.", "Add the correction (equation of time) below for minute accuracy."), 70, cv.height - 160);
  var eot = function(m){ var d = new Date(Date.UTC(new Date().getFullYear(), m, 15)), n = A.solarNoon(d, 0, 0, 0); return Math.round((12*60 - (n.getUTCHours()*60 + n.getUTCMinutes() + n.getUTCSeconds()/60))); };
  var MN = H.en() ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] : ["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"], row = MN.map(function(mn, i){ var e = -eot(i); return mn + " " + (e > 0 ? "+" : "") + e; });
  g.font = "20px system-ui"; g.fillText(row.slice(0, 6).join("   "), 70, cv.height - 110); g.fillText(row.slice(6).join("   "), 70, cv.height - 80);
  var view = wrap.querySelector("#dC"), w = Math.min(body.clientWidth - 40, 420); cv.style.width = w + "px"; cv.style.height = Math.round(w*1.414) + "px"; cv.style.borderRadius = "12px"; view.appendChild(cv);
  wrap.querySelector("#dE").innerHTML = '<div><span>' + L("Pembetulan longitud", "Longitude correction") + '</span><b>' + (corr > 0 ? "-" : "+") + Math.abs(Math.round(corr*60)) + ' min</b></div>';
  wrap.querySelectorAll("[data-f]").forEach(function(b){ b.onclick = function(){ box.innerHTML = ""; dial(box, b.getAttribute("data-f") === "1"); }; });
  wrap.querySelector("#dP").onclick = function(){ if(H.canvasPdf && H.sharePdf){ H.sharePdf("jam-matahari.pdf", H.canvasPdf(cv, 210, 297, 0.92), L("Jam matahari saya", "My sundial")); } else { var a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = "sundial.png"; a.click(); } }; }

// ---------- 10. stories ----------
var STORIES = [
  ["al-Battani","🌞","Al-Battani (858–929)","Harran & Raqqa","Mengukur panjang setahun sebagai 365 hari 5 jam 46 minit 24 saat, hanya 2 minit lebih daripada nilai moden. Jadual bintangnya digunakan di Eropah berkurun lamanya.","Measured the year as 365 days 5 hours 46 minutes 24 seconds, only about 2 minutes off the modern value. His star tables were used in Europe for centuries.","sun"],
  ["al-Sufi","✨","Abd al-Rahman al-Sufi (903–986)","Isfahan","Menulis Kitab Suwar al-Kawakib (Buku Bintang Tetap) dengan lukisan setiap buruj, dan rekod pertama 'awan kecil' yang kini dikenali sebagai galaksi Andromeda, dekat bintang Mirach.","Wrote the Book of Fixed Stars with drawings of every constellation, and the first record of the 'little cloud' we now know as the Andromeda Galaxy, near the star Mirach.","Mirach"],
  ["al-Biruni","⛰️","Abu Rayhan al-Biruni (973–1048)","Ghazni","Mengukur jejari bumi dari puncak bukit menggunakan sudut ufuk: kira-kira 6,339 km, sangat hampir dengan nilai sebenar 6,371 km.","Measured the Earth's radius from a hilltop using the dip of the horizon: about 6,339 km, very close to the real 6,371 km.","sun"],
  ["al-Khwarizmi","📐","Muhammad ibn Musa al-Khwarizmi (780–850)","Baghdad, Bait al-Hikmah","Menyusun Zij al-Sindhind, jadual kedudukan matahari, bulan dan planet. Namanya menjadi perkataan 'algoritma'.","Compiled the Zij al-Sindhind, tables of the sun, moon and planets. His name gave us the word 'algorithm'.","moon"],
  ["Maryam al-Ijliya","🧭","Maryam al-Ijliya (abad ke-10)","Aleppo","Seorang pembuat astrolab yang mahir, berkhidmat di istana Sayf al-Dawla. Sebuah asteroid (7060 Al-'Ijliya) dinamakan sempena beliau.","A skilled astrolabe maker at the court of Sayf al-Dawla. An asteroid, 7060 Al-'Ijliya, is named after her.","Vega"],
  ["Ibn al-Haytham","👁️","Ibn al-Haytham (965–1040)","Basrah & Kaherah","Bapa optik: menerangkan bagaimana kita melihat melalui cahaya yang masuk ke mata, dan menulis 'Keraguan terhadap Ptolemy' yang mengajar kita menyemak teori dengan cerapan.","The father of optics: explained that we see because light enters the eye, and wrote 'Doubts about Ptolemy', teaching us to test theories against observation.","moon"],
  ["Ulugh Beg","🏛️","Ulugh Beg (1394–1449)","Samarkand","Membina balai cerap besar dengan sekstan setinggi bangunan tiga tingkat, dan menyusun katalog 1,018 bintang yang sangat tepat.","Built a great observatory with a sextant as tall as a three-storey building, and catalogued 1,018 stars with great accuracy.","Polaris"],
  ["Ibn al-Shatir","🔭","Ibn al-Shatir (1304–1375)","Damsyik, Masjid Umayyah","Muwaqqit (penjaga waktu solat) Masjid Umayyah. Model bulannya sama dengan model Copernicus kemudian, dan beliau membina jam matahari yang masih ada hari ini.","Timekeeper (muwaqqit) of the Umayyad Mosque. His lunar model matches the one Copernicus used later, and he built a sundial that still exists today.","sun"],
  ["al-Zarqali","⚙️","Al-Zarqali (1029–1087)","Toledo, Andalus","Mencipta astrolab universal 'Safiha' yang boleh digunakan di mana-mana latitud, dan Jadual Toledo yang terkenal.","Invented the universal 'Safiha' astrolabe that works at any latitude, and the famous Toledan Tables.","Arcturus"],
  ["Taqi al-Din","🕰️","Taqi al-Din (1526–1585)","Istanbul","Membina balai cerap Istanbul dan jam mekanikal untuk mencerap bintang dengan masa yang tepat hingga saat.","Built the Istanbul observatory and mechanical clocks to time star observations to the second.","Sirius"]];
function vStories(){ card("fkNote", '<small>' + L("Ketik 'Cari malam ini' untuk melihat objek berkaitan di langit.", "Tap 'Find it tonight' to see a related object in the sky.") + '</small>');
  STORIES.forEach(function(s, i){ var c = card("fkStory", '<div class="fkStH" style="--h:' + (i*36) + '"><span>' + s[1] + '</span><div><b>' + E(s[2]) + '</b><small>' + E(s[3]) + '</small></div></div><p>' + E(L(s[4], s[5])) + '</p><button class="fkBig alt">🔭 ' + L("Cari malam ini: ", "Find it tonight: ") + E(s[6] === "sun" ? L("Matahari", "the Sun") : s[6] === "moon" ? L("Bulan", "the Moon") : s[6]) + '</button>');
    c.querySelector("button").onclick = function(){ ST.sky = null; go("langit", {find: s[6]}); }; });
  // tiny quiz for fun
  var Q = [[L("Bintang Sirius disebut dalam surah apa?", "Which surah names the star Sirius?"), [L("An-Najm", "Al-Najm"), L("Al-Mulk", "Al-Mulk"), L("Yasin", "Yasin")], 0], [L("Siapa mengukur jejari bumi dari puncak bukit?", "Who measured Earth's radius from a hilltop?"), ["Al-Biruni", "Ulugh Beg", "Al-Sufi"], 0], [L("Nama Melayu planet Venus?", "Venus's Malay name?"), ["Marikh", "Zuhrah", "Utarid"], 1]];
  var qi = 0, sc = 0, qc = card("fkQuiz", ""); var paint = function(){ if(qi >= Q.length){ qc.innerHTML = '<b>🏆 ' + sc + '/' + Q.length + '</b> ' + (sc === Q.length ? L("Hebat! Anda ahli falak cilik!", "Brilliant! You're a young astronomer!") : L("Bagus! Cuba lagi.", "Good! Try again.")) + ' <button class="fkChip" id="qA">↺</button>'; qc.querySelector("#qA").onclick = function(){ qi = 0; sc = 0; paint(); }; return; }
    var q = Q[qi]; qc.innerHTML = '<b>❓ ' + q[0] + '</b><div class="fkChips">' + q[1].map(function(o, i){ return '<button class="fkChip" data-q="' + i + '">' + E(o) + '</button>'; }).join("") + '</div>';
    qc.querySelectorAll("[data-q]").forEach(function(b){ b.onclick = function(){ var ok = +b.getAttribute("data-q") === q[2]; if(ok) sc++; b.classList.add(ok ? "ok" : "no"); setTimeout(function(){ qi++; paint(); }, 600); }; }); };
  paint(); }

window.Falak = {open: open, close: close, back: function(){ if(!root) return false; if(scr !== "home") go("home"); else close(); return true; }, _t: {monthStarts: monthStarts, go: function(s, o){ go(s, o); }, scr: function(){ return scr; }}};
})();
