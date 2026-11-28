/* My Ihsan 0.7.92 (owner picks #35, #38–#45): Tools › 🧮 Utiliti. Nine small tools on one page:
   📐 Converter (incl. cooking cups, Malay measures, sa'/mud) · 💱 Currency (last rates kept for offline) · 🧮 Quick maths (%, discount, bill + split)
   📏 Spirit level & ruler (card calibration) · 🔍 Magnifier (camera, torch, freeze) · 🔊 Sound meter (mic, estimate) · ⏱️ Stopwatch & laps
   🎲 Random picker (names, teams, gift exchange, coin, dice, number) · ⏳ Countdowns (Hijri presets).
   Everything stays on the phone in ihsan_util. Utility.render(el, H, tool) · Utility.tools · Utility.conv (pure, for tests) */
(function(){ "use strict";
var H = null, root = null, KEY = "ihsan_util", U = {tool: "", cat: "len", calc: "pct", pick: "name"}, live = [], dog = null;
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function T(s){ s = String(s); var i = s.indexOf("|"); return i < 0 ? s : L(s.slice(0, i), s.slice(i + 1)); }
function pad(n){ return (n < 10 ? "0" : "") + n; }
function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function pd(s){ var p = String(s || "").split("-"); return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1); }
function db(){ var d = H.load(KEY, null) || {}; d.names = Array.isArray(d.names) ? d.names : []; d.cd = Array.isArray(d.cd) ? d.cd : []; d.sw = d.sw || {t0: 0, acc: 0, laps: []}; d.cal = d.cal || {}; d.fxs = d.fxs || {a: 100, f: "MYR", t: "SAR"}; return d; }
function put(d){ H.save(KEY, d); }
function num(v){ var n = parseFloat(String(v == null ? "" : v).replace(/,/g, ".")); return isNaN(n) ? null : n; }
function fmt(v, sig){ if(v == null || !isFinite(v)) return "–"; var a = Math.abs(v); if(a !== 0 && (a >= 1e12 || a < 1e-6)) return v.toExponential(4); var r = +v.toPrecision(sig || 6); return r.toLocaleString("en-US", {maximumFractionDigits: 6}); }
function money(v){ return (Math.round(v * 100) / 100).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2}); }
function rnd(n){ var a = new Uint32Array(1); try{ (window.crypto || window.msCrypto).getRandomValues(a); return a[0] % n; }catch(e){ return Math.floor(Math.random() * n); } }
function shuffle(a){ a = a.slice(); for(var i = a.length - 1; i > 0; i--){ var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function stopLive(){ var l = live; live = []; l.forEach(function(f){ try{ f(); }catch(e){} }); }
function keep(f){ live.push(f); if(!dog) dog = setInterval(function(){ if(!root || !document.body.contains(root)){ stopLive(); clearInterval(dog); dog = null; } }, 1000); }
function vib(ms){ try{ if(H.N && H.N.vibrate) H.N.vibrate(ms); }catch(e){} }
function perm(which, ok){ var N = H.N; if(window.Native && N && N.hasPerm && !N.hasPerm(which)){ var hp = function(p){ if(p.which !== which) return; H.off("perm", hp); if(p.granted) ok(); else H.toast(which === "mic" ? L("Kebenaran mikrofon diperlukan", "Microphone permission is needed") : L("Kebenaran kamera diperlukan", "Camera permission is needed")); }; H.on("perm", hp); N.requestPerm(which); return; } ok(); }

var TOOLS = [["conv","📐","Penukar","Converter","Panjang, berat, masak, sukatan Melayu","Length, weight, cooking, Malay measures"],
  ["fx","💱","Matawang","Currency","Kadar terakhir disimpan untuk luar talian","Last rates kept for offline"],
  ["calc","➕","Kira pantas","Quick maths","Peratus, diskaun, bil & kongsi","Percent, discount, bill & split"],
  ["level","📏","Aras & pembaris","Level & ruler","Aras gelembung, pembaris cm / inci","Bubble level, cm / inch ruler"],
  ["lens","👓","Kanta","Magnifier","Besarkan tulisan kecil, lampu, beku","Enlarge small print, light, freeze"],
  ["db","🎚","Desibel","Sound meter","Bunyi bilik dalam dB (anggaran)","Room noise in dB (estimate)"],
  ["sw","⏱","Jam randik","Stopwatch","Pusingan & masa pecahan","Laps & splits"],
  ["pick","🎲","Undi","Random picker","Nama, pasukan, syiling, dadu","Names, teams, coin, dice"],
  ["cd","⏳","Kiraan detik","Countdown","Ramadan, raya, peperiksaan…","Ramadan, Eid, exams…"]];

function render(el, h, tool){ H = h; root = el; if(tool != null) U.tool = tool; if(!document.querySelector('link[href="utility/utility.css"]')){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "utility/utility.css"; document.head.appendChild(l); } draw(); }
function draw(){ stopLive(); if(!root) return;
  if(!U.tool || !FN[U.tool]){ U.tool = "";
    root.innerHTML = '<div class="utGrid">' + TOOLS.map(function(t){ return '<button class="utTile" data-ut="' + t[0] + '"><span>' + t[1] + '</span><b>' + E(L(t[2], t[3])) + '</b><small>' + E(L(t[4], t[5])) + '</small></button>'; }).join("") + '</div>' +
      '<div class="mut tiny utFoot">' + L("Semua alat berfungsi tanpa internet kecuali kemas kini kadar matawang. Data kekal dalam telefon.", "Every tool works offline except updating currency rates. Data stays on the phone.") + '</div>';
    root.querySelectorAll("[data-ut]").forEach(function(b){ b.onclick = function(){ U.tool = b.getAttribute("data-ut"); draw(); var v = document.getElementById("view"); if(v) v.scrollTop = 0; }; });
    return; }
  var t = TOOLS.filter(function(x){ return x[0] === U.tool; })[0];
  root.innerHTML = '<div class="utHead"><button class="chip" id="utBack">‹ ' + E(L("Utiliti", "Utility")) + '</button><b>' + t[1] + ' ' + E(L(t[2], t[3])) + '</b></div><div id="utBody" class="utBody ut-' + t[0] + '"></div>';
  root.querySelector("#utBack").onclick = function(){ U.tool = ""; draw(); };
  FN[U.tool](root.querySelector("#utBody"));
}

/* ---------------- 📐 Converter ---------------- */
// factor = size of one unit in the category's base unit (m, kg, L, m², m/s, s, B). Labels "BM|EN".
var CV = {
  len: ["Panjang|Length", [["mm","mm",0.001],["cm","cm",0.01],["m","m",1],["km","km",1000],["in","inci|inch",0.0254],["ft","kaki|foot",0.3048],["yd","ela|yard",0.9144],["mi","batu|mile",1609.344],["nmi","batu nautika|nautical mile",1852],["jgk","jengkal|span (jengkal)",0.2286],["hst","hasta|cubit (hasta)",0.4572],["dpa","depa|fathom (depa)",1.8288]]],
  wt: ["Berat|Weight", [["mg","mg",1e-6],["g","g",0.001],["kg","kg",1],["t","tan metrik|tonne",1000],["oz","auns|ounce",0.028349523],["lb","paun|pound",0.45359237],["thl","tahil",0.0377994],["kti","kati",0.60479],["pkl","pikul",60.479],["sa","sa' (beras)|sa' (rice)",2.7],["mud","mud (beras)|mudd (rice)",0.675]]],
  vol: ["Isi padu|Volume", [["ml","mL",0.001],["l","L",1],["m3","m³",1000],["tsp","sudu kecil|teaspoon",0.005],["tbsp","sudu besar|tablespoon",0.015],["cup","cawan|cup",0.25],["floz","auns cecair (AS)|fl oz (US)",0.0295735],["pt","pain (UK)|pint (UK)",0.568261],["galus","gelen (AS)|gallon (US)",3.785411],["galuk","gelen (UK)|gallon (UK)",4.54609],["cpk","cupak",1.1365225],["gtg","gantang",4.54609]]],
  temp: ["Suhu|Temperature", [["c","°C"],["f","°F"],["k","K"]]],
  area: ["Luas|Area", [["cm2","cm²",1e-4],["m2","m²",1],["ft2","kaki²|ft²",0.09290304],["km2","km²",1e6],["ha","hektar|hectare",1e4],["ac","ekar|acre",4046.8564],["rlg","relung",2877.6]]],
  spd: ["Laju|Speed", [["ms","m/s",1],["kmh","km/j|km/h",1/3.6],["mph","batu/j|mph",0.44704],["kn","knot",0.5144444]]],
  time: ["Masa|Time", [["s","saat|second",1],["min","minit|minute",60],["h","jam|hour",3600],["d","hari|day",86400],["w","minggu|week",604800],["mo","bulan (30.44 h)|month (30.44 d)",2629746],["y","tahun|year",31556952]]],
  data: ["Data|Data", [["b","B",1],["kb","KB",1024],["mb","MB",1048576],["gb","GB",1073741824],["tb","TB",1099511627776]]],
  cook: ["Masakan|Cooking", [["tsp","sudu kecil|teaspoon",5],["tbsp","sudu besar|tablespoon",15],["cup","cawan|cup",250],["ml","mL",1],["g","gram|grams",0],["kg","kg",0]]]
};
// grams per mL (approximate, spooned & levelled)
var ING = [["air","Air|Water",1],["tepung","Tepung gandum|Plain flour",0.53],["gula","Gula pasir|Sugar",0.85],["gperang","Gula perang|Brown sugar",0.9],["beras","Beras|Rice (raw)",0.8],["mentega","Mentega|Butter",0.96],["susu","Susu|Milk",1.03],["minyak","Minyak masak|Cooking oil",0.92],["garam","Garam|Salt",1.2],["madu","Madu|Honey",1.42],["koko","Serbuk koko|Cocoa powder",0.42],["santan","Santan|Coconut milk",1.0]];
// value v in unit a → unit b, in category c (ing = grams per mL for cooking). Pure.
function conv(c, v, a, b, ing){ if(v == null || isNaN(v)) return null;
  if(c === "temp"){ var k = a === "c" ? v + 273.15 : a === "f" ? (v - 32) * 5 / 9 + 273.15 : v; return b === "c" ? k - 273.15 : b === "f" ? (k - 273.15) * 9 / 5 + 32 : k; }
  var U2 = {}; CV[c][1].forEach(function(u){ U2[u[0]] = u; });
  if(c === "cook"){ var dn = ing || 1, ml = a === "g" ? v / dn : a === "kg" ? v * 1000 / dn : v * U2[a][2]; return b === "g" ? ml * dn : b === "kg" ? ml * dn / 1000 : ml / U2[b][2]; }
  return v * U2[a][2] / U2[b][2]; }
function vConv(el){ var d = db(), s = d.conv = d.conv || {}; var c = CV[U.cat] ? U.cat : "len", units = CV[c][1], from = s[c] && units.some(function(u){ return u[0] === s[c]; }) ? s[c] : units[c === "cook" ? 2 : c === "temp" ? 0 : 2][0];
  var ing = s.ing || "tepung", dn = (ING.filter(function(x){ return x[0] === ing; })[0] || ING[1])[2];
  el.innerHTML = '<div class="chips utCats">' + Object.keys(CV).map(function(k){ return '<button class="chip' + (k === c ? " on" : "") + '" data-uc="' + k + '">' + E(T(CV[k][0])) + '</button>'; }).join("") + '</div>' +
    '<div class="card utIn"><input id="cvV" class="rin" type="text" inputmode="decimal" value="' + E(s.v == null ? "1" : s.v) + '" aria-label="' + E(L("Nilai", "Value")) + '"><select id="cvF" class="rin" aria-label="' + E(L("Unit asal", "From unit")) + '">' + units.map(function(u){ return '<option value="' + u[0] + '"' + (u[0] === from ? " selected" : "") + '>' + E(T(u[1])) + '</option>'; }).join("") + '</select></div>' +
    (c === "cook" ? '<div class="card utIn"><label class="mut small" for="cvI">' + L("Bahan (untuk gram)", "Ingredient (for grams)") + '</label><select id="cvI" class="rin">' + ING.map(function(x){ return '<option value="' + x[0] + '"' + (x[0] === ing ? " selected" : "") + '>' + E(T(x[1])) + '</option>'; }).join("") + '</select></div>' : '') +
    '<div class="card utList" id="cvL"></div>' +
    '<div class="mut tiny utFoot">' + (c === "wt" ? L("Sa' dan mud ialah anggaran beras untuk zakat fitrah (1 sa' ≈ 2.7 kg, 1 mud = ¼ sa'). Ikut kadar majlis agama negeri anda.", "Sa' and mudd are rice estimates for zakat fitrah (1 sa' ≈ 2.7 kg, 1 mudd = ¼ sa'). Follow your state religious council's rate.") + ' ' : '') +
      (c === "cook" ? L("Gram ialah anggaran untuk bahan yang disudu dan diratakan. Cawan = 250 mL.", "Grams are estimates for spooned, levelled ingredients. Cup = 250 mL.") : c === "len" || c === "area" || c === "vol" ? L("Sukatan Melayu lama ialah nilai lazim; ia berbeza sedikit mengikut tempat.", "Old Malay measures use common values; they vary a little by place.") : "") + '</div>';
  var V = el.querySelector("#cvV"), F = el.querySelector("#cvF"), LI = el.querySelector("#cvL");
  var upd = function(){ var v = num(V.value), f = F.value; s.v = V.value; s[c] = f; put(d);
    LI.innerHTML = units.filter(function(u){ return u[0] !== f; }).map(function(u){ var r = conv(c, v, f, u[0], dn); return '<button class="utRow" data-cu="' + u[0] + '"><span>' + E(T(u[1])) + '</span><b>' + fmt(r) + '</b></button>'; }).join("");
    LI.querySelectorAll("[data-cu]").forEach(function(b){ b.onclick = function(){ var u = b.getAttribute("data-cu"), r = conv(c, num(V.value), F.value, u, dn); if(r != null) V.value = String(+r.toPrecision(6)); F.value = u; upd(); }; }); };
  V.oninput = upd; F.onchange = upd;
  if(c === "cook") el.querySelector("#cvI").onchange = function(){ s.ing = this.value; put(d); vConv(el); };
  el.querySelectorAll("[data-uc]").forEach(function(b){ b.onclick = function(){ U.cat = b.getAttribute("data-uc"); vConv(el); }; });
  upd(); }

/* ---------------- 💱 Currency ---------------- */
var CUR = ["MYR","SGD","USD","SAR","AED","QAR","EUR","GBP","IDR","BND","THB","PHP","VND","JPY","KRW","CNY","HKD","TWD","INR","PKR","BDT","LKR","AUD","NZD","CAD","CHF","TRY","EGP","JOD","KWD","OMR","BHD","MAD","ZAR","RUB","SEK","NOK","DKK"];
var CN = {MYR:"Ringgit",SGD:"Singapore $",USD:"US $",SAR:"Riyal Saudi|Saudi riyal",AED:"Dirham UAE|UAE dirham",QAR:"Riyal Qatar|Qatari riyal",EUR:"Euro",GBP:"Paun|Pound",IDR:"Rupiah",BND:"Brunei $",THB:"Baht",PHP:"Peso",VND:"Dong",JPY:"Yen",KRW:"Won",CNY:"Yuan",HKD:"HK $",TWD:"NT $",INR:"Rupee India|Indian rupee",PKR:"Rupee Pakistan|Pakistani rupee",BDT:"Taka",LKR:"Rupee Sri Lanka|Sri Lankan rupee",AUD:"Australia $",NZD:"NZ $",CAD:"Kanada $|Canada $",CHF:"Franc Swiss|Swiss franc",TRY:"Lira",EGP:"Paun Mesir|Egyptian pound",JOD:"Dinar Jordan|Jordanian dinar",KWD:"Dinar Kuwait|Kuwaiti dinar",OMR:"Rial Oman|Omani rial",BHD:"Dinar Bahrain|Bahraini dinar",MAD:"Dirham Maghribi|Moroccan dirham",ZAR:"Rand",RUB:"Rubel|Ruble",SEK:"Krona Sweden|Swedish krona",NOK:"Krone Norway|Norwegian krone",DKK:"Krone Denmark|Danish krone"};
function fxRate(fx, a, b){ if(!fx || !fx.r) return null; var ra = a === fx.base ? 1 : fx.r[a], rb = b === fx.base ? 1 : fx.r[b]; return ra && rb ? rb / ra : null; }
function fxGet(done){ var ok = function(r, date){ var d = db(); d.fx = {base: "USD", r: r, date: date, upd: Date.now()}; put(d); done(true); };
  H.fetch("https://open.er-api.com/v6/latest/USD", function(st, body){ var j = null; try{ j = JSON.parse(body); }catch(e){}
    if(st >= 200 && st < 300 && j && j.rates && j.rates.MYR){ ok(j.rates, String(j.time_last_update_utc || "").slice(5, 16) || ymd(new Date())); return; }
    H.fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json", function(s2, b2){ var k = null; try{ k = JSON.parse(b2); }catch(e){}
      if(s2 >= 200 && s2 < 300 && k && k.usd && k.usd.myr){ var r = {}; Object.keys(k.usd).forEach(function(c){ r[c.toUpperCase()] = +k.usd[c]; }); ok(r, k.date || ymd(new Date())); } else done(false); }); }); }
function vFx(el){ var d = db(), s = d.fxs, fx = d.fx;
  var opt = function(sel){ return CUR.map(function(c){ return '<option value="' + c + '"' + (c === sel ? " selected" : "") + '>' + c + ' · ' + E(T(CN[c] || c)) + '</option>'; }).join(""); };
  el.innerHTML = '<div class="card utFx"><input id="fxA" class="rin utBigIn" type="text" inputmode="decimal" value="' + E(s.a) + '" aria-label="' + E(L("Jumlah", "Amount")) + '">' +
    '<div class="utFxRow"><select id="fxF" class="rin" aria-label="' + E(L("Dari", "From")) + '">' + opt(s.f) + '</select><button class="chip" id="fxS" aria-label="' + E(L("Tukar arah", "Swap")) + '">⇄</button><select id="fxT" class="rin" aria-label="' + E(L("Kepada", "To")) + '">' + opt(s.t) + '</select></div>' +
    '<div class="utFxRes" id="fxR"></div><div class="mut tiny" id="fxD"></div></div><div class="card utList" id="fxL"></div>' +
    '<div class="btns"><button class="btn alt" id="fxU">🔄 ' + L("Kemas kini kadar", "Update rates") + '</button></div>' +
    '<div class="mut tiny utFoot">' + L("Kadar rujukan harian (open.er-api / currency-api). Kadar terakhir disimpan, jadi penukar masih berfungsi semasa melancong tanpa internet. Kadar pengurup wang berbeza sedikit.", "Daily reference rates (open.er-api / currency-api). The last rates are kept, so the converter still works while travelling offline. Money changers' rates differ a little.") + '</div>';
  var A = el.querySelector("#fxA"), F = el.querySelector("#fxF"), TT = el.querySelector("#fxT"), R = el.querySelector("#fxR"), D = el.querySelector("#fxD"), LI = el.querySelector("#fxL");
  var upd = function(){ var a = num(A.value), f = F.value, t = TT.value, r = fxRate(fx, f, t); s.a = A.value; s.f = f; s.t = t; put(d);
    if(!fx){ R.innerHTML = '<span class="mut">' + L("Belum ada kadar. Sambung ke internet sekali untuk memuat turun.", "No rates yet. Connect to the internet once to download them.") + '</span>'; LI.innerHTML = ""; D.textContent = ""; return; }
    R.innerHTML = r == null ? "–" : '<b>' + money(a == null ? 0 : a * r) + '</b> ' + t + '<small>1 ' + f + ' = ' + fmt(r, 5) + ' ' + t + '</small>';
    D.textContent = L("Kadar: ", "Rates: ") + fx.date + (Date.now() - fx.upd > 864e5 ? " · " + L("mungkin lama", "may be old") : "");
    LI.innerHTML = ["MYR","USD","SAR","SGD","EUR","GBP","IDR"].filter(function(c){ return c !== f && c !== t; }).map(function(c){ var q = fxRate(fx, f, c); return '<div class="utRow"><span>' + c + ' · ' + E(T(CN[c])) + '</span><b>' + (q == null || a == null ? "–" : money(a * q)) + '</b></div>'; }).join(""); };
  A.oninput = upd; F.onchange = upd; TT.onchange = upd;
  el.querySelector("#fxS").onclick = function(){ var x = F.value; F.value = TT.value; TT.value = x; upd(); };
  var get = function(manual){ D.textContent = L("Memuat turun kadar…", "Downloading rates…"); fxGet(function(ok){ if(!document.body.contains(el)) return; if(ok){ d = db(); fx = d.fx; s = d.fxs; if(manual) H.toast("💱 " + L("Kadar dikemas kini", "Rates updated")); } else if(manual || !fx) H.toast(L("Tiada internet. Kadar terakhir digunakan.", "No internet. Using the last rates.")); upd(); }); };
  el.querySelector("#fxU").onclick = function(){ get(true); };
  upd(); if(!fx || Date.now() - fx.upd > 6 * 36e5) get(false); }

/* ---------------- 🧮 Quick maths ---------------- */
// bill: subtotal → + service % → + tax % (on subtotal + service) + tip % (on subtotal) → split, each rounded up to 5 sen. Pure.
function bill(sub, svc, tax, tip, n){ sub = +sub || 0; var s = sub * (+svc || 0) / 100, t = (sub + s) * (+tax || 0) / 100, p = sub * (+tip || 0) / 100, tot = sub + s + t + p; n = Math.max(1, Math.floor(+n || 1)); var each = Math.ceil(Math.round(tot / n * 1000) / 1000 * 20) / 20; return {svc: s, tax: t, tip: p, total: tot, each: each, n: n}; }
function vCalc(el){ var d = db(), c = d.calc = d.calc || {}, m = U.calc;
  var M = [["pct","%","Peratus","Percent"],["disc","🏷️","Diskaun","Discount"],["bill","🧾","Bil & kongsi","Bill & split"]];
  var inp = function(id, lb, def){ return '<label class="utF"><span>' + lb + '</span><input class="rin" id="' + id + '" type="text" inputmode="decimal" value="' + E(c[id] != null ? c[id] : def) + '"></label>'; };
  var h = '<div class="chips utCats">' + M.map(function(x){ return '<button class="chip' + (x[0] === m ? " on" : "") + '" data-cm="' + x[0] + '">' + x[1] + ' ' + E(L(x[2], x[3])) + '</button>'; }).join("") + '</div><div class="card">';
  if(m === "pct") h += '<div class="utG2">' + inp("pA", L("Peratus (%)", "Percent (%)"), "10") + inp("pB", L("Daripada", "Of"), "250") + '</div><div class="utRes" id="r1"></div><hr class="utHr">' +
    '<div class="utG2">' + inp("pC", L("Nilai", "Value"), "45") + inp("pD", L("Daripada jumlah", "Out of"), "60") + '</div><div class="utRes" id="r2"></div><hr class="utHr">' +
    '<div class="utG2">' + inp("pE", L("Dari", "From"), "80") + inp("pF", L("Kepada", "To"), "100") + '</div><div class="utRes" id="r3"></div>';
  else if(m === "disc") h += '<div class="utG2">' + inp("dP", L("Harga asal", "Original price"), "199") + inp("dA", L("Diskaun (%)", "Discount (%)"), "30") + inp("dB", L("Diskaun tambahan (%)", "Extra discount (%)"), "0") + inp("dT", L("Cukai (%)", "Tax (%)"), "0") + '</div><div class="utRes" id="r1"></div>';
  else h += '<div class="utG2">' + inp("bS", L("Jumlah kecil", "Subtotal"), "120") + inp("bV", L("Caj perkhidmatan (%)", "Service charge (%)"), "10") + inp("bT", L("SST / cukai (%)", "SST / tax (%)"), "6") + inp("bP", L("Tip (%)", "Tip (%)"), "0") + inp("bN", L("Bilangan orang", "People"), "4") + '</div><div class="utRes" id="r1"></div>';
  el.innerHTML = h + '</div>' + (m === "bill" ? '<div class="mut tiny utFoot">' + L("Bahagian setiap orang dibundarkan ke atas kepada 5 sen terdekat. Untuk bil berkongsi yang disimpan, guna Kewangan › Kongsi bil.", "Each share is rounded up to the nearest 5 sen. For a saved shared bill, use Finance › Split bill.") + '</div>' : '');
  var g = function(id){ var x = el.querySelector("#" + id); return x ? num(x.value) : null; }, out = function(id, html){ var x = el.querySelector("#" + id); if(x) x.innerHTML = html; };
  var upd = function(){ el.querySelectorAll("input").forEach(function(i){ c[i.id] = i.value; }); put(d);
    if(m === "pct"){ var a = g("pA"), b = g("pB"), cc = g("pC"), dd = g("pD"), e = g("pE"), f = g("pF");
      out("r1", a == null || b == null ? "–" : fmt(a) + '% ' + L("daripada", "of") + ' ' + fmt(b) + ' = <b>' + fmt(a * b / 100) + '</b>');
      out("r2", cc == null || !dd ? "–" : fmt(cc) + ' ' + L("ialah", "is") + ' <b>' + fmt(cc / dd * 100, 4) + '%</b> ' + L("daripada", "of") + ' ' + fmt(dd));
      out("r3", e == null || !e || f == null ? "–" : L("Perubahan", "Change") + ': <b>' + (f >= e ? "+" : "") + fmt((f - e) / Math.abs(e) * 100, 4) + '%</b> (' + (f >= e ? "+" : "") + fmt(f - e) + ')'); }
    else if(m === "disc"){ var p = g("dP") || 0, a1 = g("dA") || 0, b1 = g("dB") || 0, t1 = g("dT") || 0, af = p * (1 - a1 / 100) * (1 - b1 / 100), fin = af * (1 + t1 / 100);
      out("r1", '<div class="utKV"><span>' + L("Anda jimat", "You save") + '</span><b>' + money(p - af) + '</b></div>' + (t1 ? '<div class="utKV"><span>' + L("Cukai", "Tax") + '</span><b>' + money(fin - af) + '</b></div>' : '') + '<div class="utKV big"><span>' + L("Harga akhir", "Final price") + '</span><b>' + money(fin) + '</b></div>' + (b1 ? '<div class="mut tiny">' + L("Jumlah diskaun sebenar: ", "Real total discount: ") + fmt((1 - (1 - a1 / 100) * (1 - b1 / 100)) * 100, 4) + '%</div>' : '')); }
    else { var r = bill(g("bS"), g("bV"), g("bT"), g("bP"), g("bN"));
      out("r1", '<div class="utKV"><span>' + L("Caj perkhidmatan", "Service charge") + '</span><b>' + money(r.svc) + '</b></div><div class="utKV"><span>' + L("Cukai", "Tax") + '</span><b>' + money(r.tax) + '</b></div>' + (r.tip ? '<div class="utKV"><span>Tip</span><b>' + money(r.tip) + '</b></div>' : '') + '<div class="utKV big"><span>' + L("Jumlah", "Total") + '</span><b>' + money(r.total) + '</b></div><div class="utKV big"><span>' + L("Seorang", "Each") + ' (÷' + r.n + ')</span><b>' + money(r.each) + '</b></div>'); } };
  el.querySelectorAll("input").forEach(function(i){ i.oninput = upd; });
  el.querySelectorAll("[data-cm]").forEach(function(b){ b.onclick = function(){ U.calc = b.getAttribute("data-cm"); vCalc(el); }; });
  upd(); }

/* ---------------- 📏 Spirit level & ruler ---------------- */
var CARD_MM = 85.6;   // ID-1 bank / IC card width
function vLevel(el){ var d = db(), cal = d.cal, mode = cal.rmode || "level";
  el.innerHTML = '<div class="chips utCats"><button class="chip' + (mode === "level" ? " on" : "") + '" data-lm="level">🫧 ' + L("Aras", "Level") + '</button><button class="chip' + (mode === "ruler" ? " on" : "") + '" data-lm="ruler">📏 ' + L("Pembaris", "Ruler") + '</button></div><div id="lvH"></div>';
  el.querySelectorAll("[data-lm]").forEach(function(b){ b.onclick = function(){ cal.rmode = b.getAttribute("data-lm"); put(d); stopLive(); vLevel(el); }; });
  var host = el.querySelector("#lvH");
  if(mode === "ruler"){ ruler(host, d); return; }
  host.innerHTML = '<div class="card utLvl"><div class="utBub" id="lvB"><i class="utX"></i><i class="utY"></i><em id="lvD"></em></div>' +
    '<div class="utBar" id="lvBar"><em id="lvE"></em><i></i></div>' +
    '<div class="utAng"><div><small>' + L("Rata (X / Y)", "Flat (X / Y)") + '</small><b id="lvXY">–</b></div><div><small>' + L("Tepi (berdiri)", "Edge (upright)") + '</small><b id="lvR">–</b></div></div>' +
    '<div class="btns"><button class="btn alt" id="lvZ">🎯 ' + L("Tetapkan sifar", "Set zero") + '</button><button class="btn alt" id="lvC">↺ ' + L("Set semula", "Reset") + '</button></div>' +
    '<div class="mut tiny" id="lvM">' + L("Letak telefon rata untuk permukaan, atau berdiri pada tepinya untuk bingkai gambar.", "Lay the phone flat for a surface, or stand it on its edge for a picture frame.") + '</div></div>';
  var B = host.querySelector("#lvD"), BE = host.querySelector("#lvE"), XY = host.querySelector("#lvXY"), R = host.querySelector("#lvR"), last = {x: 0, y: 0, r: 0}, was = false, got = false;
  var z = cal.lz || {x: 0, y: 0, r: 0};
  var onM = function(ev){ var g = ev.accelerationIncludingGravity; if(!g || g.x == null) return; if(!got){ var ap = host.querySelector("#lvP"); if(ap) ap.remove(); } got = true;
    var x = Math.atan2(g.x, Math.sqrt(g.y * g.y + g.z * g.z)) * 180 / Math.PI, y = Math.atan2(g.y, Math.sqrt(g.x * g.x + g.z * g.z)) * 180 / Math.PI, r = Math.atan2(g.x, g.y) * 180 / Math.PI;
    last = {x: x, y: y, r: r}; x -= z.x; y -= z.y; r -= z.r; if(r > 180) r -= 360; if(r < -180) r += 360;
    var cx = Math.max(-1, Math.min(1, -x / 20)), cy = Math.max(-1, Math.min(1, y / 20));
    B.style.transform = "translate(" + (cx * 70) + "px," + (cy * 70) + "px)";
    BE.style.transform = "translateX(" + (Math.max(-1, Math.min(1, -r / 15)) * 120) + "px)";
    XY.textContent = Math.abs(x).toFixed(1) + "° / " + Math.abs(y).toFixed(1) + "°"; R.textContent = Math.abs(r).toFixed(1) + "°";
    var lv = Math.abs(x) < 0.5 && Math.abs(y) < 0.5, le = Math.abs(r) < 0.5; host.querySelector("#lvB").classList.toggle("ok", lv); host.querySelector("#lvBar").classList.toggle("ok", le);
    if((lv || le) && !was) vib(30); was = lv || le; };
  var startM = function(){ window.addEventListener("devicemotion", onM); keep(function(){ window.removeEventListener("devicemotion", onM); }); setTimeout(function(){ if(!got && document.body.contains(host)) host.querySelector("#lvM").textContent = L("Sensor gerakan tidak dijumpai pada peranti ini.", "No motion sensor found on this device."); }, 2500); };
  if(window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function"){ host.querySelector("#lvM").innerHTML += ' <button class="chip" id="lvP">' + L("Benarkan sensor", "Allow sensor") + '</button>'; host.querySelector("#lvP").onclick = function(){ DeviceMotionEvent.requestPermission().then(function(){}).catch(function(){}); }; }
  startM();   // listen anyway: Android grants motion without asking, iOS starts sending after Allow
  host.querySelector("#lvZ").onclick = function(){ z = cal.lz = {x: last.x, y: last.y, r: last.r}; put(d); H.toast("🎯 " + L("Sifar ditetapkan", "Zero set")); };
  host.querySelector("#lvC").onclick = function(){ z = {x: 0, y: 0, r: 0}; delete cal.lz; put(d); };
}
function ruler(host, d){ var cal = d.cal, pxmm = +cal.pxmm || 6.299, inch = cal.unit === "in";   // 6.299 px/mm = Android's 160 dp per inch
  var hgt = Math.max(260, Math.min(1400, (window.innerHeight || 700) - 230));
  var draw2 = function(){ var mm = hgt / pxmm, svg = '<svg class="utRul" width="100%" height="' + hgt + '" aria-hidden="true">';
    if(!inch) for(var i = 0; i <= mm; i++){ var y = i * pxmm, w = i % 10 === 0 ? 34 : i % 5 === 0 ? 24 : 14; svg += '<line x1="0" x2="' + w + '" y1="' + y + '" y2="' + y + '"/>' + (i % 10 === 0 && i ? '<text x="40" y="' + (y + 5) + '">' + (i / 10) + '</text>' : ''); }
    else for(var j = 0; j <= mm / 25.4 * 16; j++){ var y2 = j * 25.4 / 16 * pxmm, w2 = j % 16 === 0 ? 34 : j % 8 === 0 ? 26 : j % 4 === 0 ? 20 : 12; svg += '<line x1="0" x2="' + w2 + '" y1="' + y2 + '" y2="' + y2 + '"/>' + (j % 16 === 0 && j ? '<text x="40" y="' + (y2 + 5) + '">' + (j / 16) + '</text>' : ''); }
    host.querySelector("#rlS").innerHTML = svg + '</svg>'; };
  host.innerHTML = '<div class="utRulW"><div id="rlS"></div><div class="utRulSide"><div class="chips"><button class="chip' + (!inch ? " on" : "") + '" data-ru="cm">cm</button><button class="chip' + (inch ? " on" : "") + '" data-ru="in">' + L("inci", "inch") + '</button></div>' +
    '<button class="btn alt" id="rlK">💳 ' + L("Tentukur dengan kad", "Calibrate with a card") + '</button><div class="mut tiny">' + (cal.pxmm ? L("Ditentukur.", "Calibrated.") : L("Belum ditentukur: anggaran. Tentukur dengan kad bank atau IC untuk ketepatan.", "Not calibrated: an estimate. Calibrate with a bank card or IC for accuracy.")) + '</div><div id="rlKal"></div></div></div>';
  draw2();
  host.querySelectorAll("[data-ru]").forEach(function(b){ b.onclick = function(){ cal.unit = b.getAttribute("data-ru"); put(d); ruler(host, d); }; });
  host.querySelector("#rlK").onclick = function(){ var k = host.querySelector("#rlKal"), w = Math.round(CARD_MM * pxmm);
    k.innerHTML = '<div class="mut small">' + L("Letak kad (bank / IC) pada skrin. Laraskan sehingga kotak sama lebar dengan kad.", "Put a card (bank / IC) on the screen. Adjust until the box is as wide as the card.") + '</div><div class="utCard" id="rlC" style="width:' + w + 'px"></div>' +
      '<input type="range" id="rlR" min="200" max="900" value="' + w + '" aria-label="' + E(L("Lebar kad", "Card width")) + '"><div class="btns"><button class="btn gold" id="rlOk">' + L("Simpan", "Save") + '</button></div>';
    var RR = k.querySelector("#rlR"), C = k.querySelector("#rlC"); RR.max = Math.max(900, (host.clientWidth || 360) * 2); RR.oninput = function(){ C.style.width = RR.value + "px"; };
    k.querySelector("#rlOk").onclick = function(){ cal.pxmm = +RR.value / CARD_MM; put(d); H.toast("📏 " + L("Pembaris ditentukur", "Ruler calibrated")); ruler(host, d); }; };
}

/* ---------------- 🔍 Magnifier ---------------- */
function vLens(el){ el.innerHTML = '<div class="card utIntro"><div class="utBigIc">🔍</div><div>' + L("Besarkan tulisan kecil pada label ubat, senarai bahan atau resit. Ada lampu, beku gambar dan kontras tinggi.", "Enlarge small print on medicine labels, ingredient lists or receipts. With a light, freeze-frame and high contrast.") + '</div><button class="btn gold full" id="lnGo">📷 ' + L("Buka kanta", "Open magnifier") + '</button><div class="mut tiny">' + L("Gambar diproses dalam telefon sahaja dan tidak disimpan.", "The picture is processed on the phone only and is not saved.") + '</div></div>';
  el.querySelector("#lnGo").onclick = function(){ perm("camera", lensOpen); }; }
function lensOpen(){ var ov = document.getElementById("overlay"), stream = null, track = null, closed = false, zoom = 2, torch = false, frozen = false, filt = 0, hwZoom = null;
  ov.className = "utLens"; ov.innerHTML = '<div class="utLv"><video id="lnV" autoplay muted playsinline></video><canvas id="lnC" hidden></canvas></div>' +
    '<div class="utLT"><button class="qcX" id="lnX" aria-label="' + E(L("Tutup", "Close")) + '">✕</button><b>' + E(L("Kanta", "Magnifier")) + '</b><span id="lnS" class="mut small"></span></div>' +
    '<div class="utLB"><input type="range" id="lnZ" min="1" max="8" step="0.1" value="2" aria-label="Zoom"><div class="utLBtn"><button class="chip" id="lnT">🔦 ' + E(L("Lampu", "Light")) + '</button><button class="chip" id="lnF">⏸ ' + E(L("Beku", "Freeze")) + '</button><button class="chip" id="lnK">◐ ' + E(L("Kontras", "Contrast")) + '</button></div></div>';
  var V = ov.querySelector("#lnV"), C = ov.querySelector("#lnC"), S = ov.querySelector("#lnS"), Z = ov.querySelector("#lnZ");
  var apply = function(){ var css = hwZoom ? 1 : zoom; V.style.transform = "scale(" + css + ")"; C.style.transform = "scale(" + css + ")"; var f = ["none", "contrast(1.8) grayscale(1)", "invert(1) contrast(1.6) grayscale(1)"][filt]; V.style.filter = f; C.style.filter = f; S.textContent = zoom.toFixed(1) + "×";
    if(hwZoom && track){ try{ track.applyConstraints({advanced: [{zoom: Math.max(hwZoom.min, Math.min(hwZoom.max, zoom))}]}).catch(function(){}); }catch(e){} } };
  var stop = function(){ if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream = null; } track = null; };
  var close = function(){ if(closed) return; closed = true; stop(); H.off("pause", stop); H.closeOverlay(); };
  ov._close = close; ov.querySelector("#lnX").onclick = close; H.on("pause", stop);
  Z.oninput = function(){ zoom = +Z.value; apply(); };
  ov.querySelector("#lnT").onclick = function(){ if(!track) return; torch = !torch; try{ track.applyConstraints({advanced: [{torch: torch}]}).catch(function(){ H.toast(L("Lampu tidak disokong", "Light not supported")); }); }catch(e){} this.classList.toggle("on", torch); };
  ov.querySelector("#lnF").onclick = function(){ frozen = !frozen; this.classList.toggle("on", frozen);
    if(frozen && V.videoWidth){ C.width = V.videoWidth; C.height = V.videoHeight; C.getContext("2d").drawImage(V, 0, 0); C.hidden = false; V.hidden = true; } else { C.hidden = true; V.hidden = false; } };
  ov.querySelector("#lnK").onclick = function(){ filt = (filt + 1) % 3; this.classList.toggle("on", filt > 0); apply(); };
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ S.textContent = L("Kamera tidak tersedia", "Camera not available"); return; }
  navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: "environment"}, width: {ideal: 1920}, height: {ideal: 1080}}, audio: false}).then(function(s){
    if(closed){ s.getTracks().forEach(function(t){ t.stop(); }); return; }
    stream = s; V.srcObject = s; var p = V.play(); if(p && p.catch) p.catch(function(){});
    track = s.getVideoTracks()[0];
    try{ var cap = track.getCapabilities && track.getCapabilities(); if(cap && cap.zoom && cap.zoom.max > 1){ hwZoom = cap.zoom; Z.max = Math.min(10, cap.zoom.max); } if(!(cap && cap.torch)) ov.querySelector("#lnT").hidden = true; }catch(e){}
    try{ track.applyConstraints({advanced: [{focusMode: "continuous"}]}).catch(function(){}); }catch(e){}
    apply(); }, function(){ S.textContent = L("Kamera tidak dapat dibuka", "The camera could not open"); });
}

/* ---------------- 🔊 Sound meter ---------------- */
function dbLabel(v){ return v < 30 ? ["🤫", "Sangat senyap|Very quiet"] : v < 50 ? ["📚", "Senyap (perpustakaan)|Quiet (library)"] : v < 65 ? ["🗣️", "Perbualan|Conversation"] : v < 80 ? ["🚗", "Bising (trafik)|Loud (traffic)"] : v < 85 ? ["📢", "Sangat bising|Very loud"] : ["⚠️", "Bahaya jika lama (>85 dB)|Harmful if long (>85 dB)"]; }
function vDb(el){ var d = db(), off = d.cal.dbo == null ? 94 : +d.cal.dbo;
  el.innerHTML = '<div class="card utDb"><div class="utDbN"><b id="dbN">–</b><span>dB</span></div><div class="utDbL" id="dbL">' + L("Tekan Mula untuk mengukur", "Press Start to measure") + '</div>' +
    '<div class="utDbBar"><em id="dbE"></em></div><canvas id="dbG" class="utDbG" width="600" height="120"></canvas>' +
    '<div class="utAng"><div><small>Min</small><b id="dbMin">–</b></div><div><small>' + L("Purata", "Average") + '</small><b id="dbAvg">–</b></div><div><small>Max</small><b id="dbMax">–</b></div></div>' +
    '<div class="btns"><button class="btn gold" id="dbGo">🎙 ' + L("Mula", "Start") + '</button></div>' +
    '<details class="utDet"><summary>' + L("Tentukur", "Calibrate") + '</summary><div class="utCalRow"><button class="chip" data-do="-1">−1</button><span>' + L("Ofset", "Offset") + ' <b id="dbO">' + off + '</b> dB</span><button class="chip" data-do="1">+1</button></div><div class="mut tiny">' + L("Bandingkan dengan meter bunyi sebenar jika ada, kemudian laraskan ofset.", "Compare with a real sound meter if you have one, then adjust the offset.") + '</div></details></div>' +
    '<div class="mut tiny utFoot">' + L("Anggaran sahaja: mikrofon telefon tidak ditentukur seperti alat profesional. Bunyi tidak dirakam atau disimpan.", "An estimate only: phone microphones are not calibrated like professional meters. Sound is not recorded or saved.") + '</div>';
  var Nn = el.querySelector("#dbN"), Lb = el.querySelector("#dbL"), Eb = el.querySelector("#dbE"), G = el.querySelector("#dbG"), gx = G.getContext("2d"), hist = [], st = null;
  el.querySelectorAll("[data-do]").forEach(function(b){ b.onclick = function(){ off += +b.getAttribute("data-do"); d.cal.dbo = off; put(d); el.querySelector("#dbO").textContent = off; }; });
  var stop = function(){ if(!st) return; clearInterval(st.iv); try{ st.s.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} try{ st.ac.close(); }catch(e){} st = null; var b = el.querySelector("#dbGo"); if(b) b.innerHTML = "🎙 " + L("Mula", "Start"); };
  var start = function(){ if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ Lb.textContent = L("Mikrofon tidak tersedia", "Microphone not available"); return; }
    navigator.mediaDevices.getUserMedia({audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false}, video: false}).then(function(s){
      if(!document.body.contains(el)){ s.getTracks().forEach(function(t){ t.stop(); }); return; }
      var AC = window.AudioContext || window.webkitAudioContext, ac = new AC(), an = ac.createAnalyser(); an.fftSize = 2048; ac.createMediaStreamSource(s).connect(an);
      var buf = new Float32Array(an.fftSize), mn = 999, mx = 0, sum = 0, n = 0, sm = null;
      st = {s: s, ac: ac, iv: setInterval(function(){ if(an.getFloatTimeDomainData) an.getFloatTimeDomainData(buf); else { var bb = new Uint8Array(an.fftSize); an.getByteTimeDomainData(bb); for(var k = 0; k < bb.length; k++) buf[k] = (bb[k] - 128) / 128; }
        var q = 0; for(var i = 0; i < buf.length; i++) q += buf[i] * buf[i]; var rms = Math.sqrt(q / buf.length), v = Math.max(0, 20 * Math.log10(Math.max(rms, 1e-6)) + off);
        sm = sm == null ? v : sm * 0.7 + v * 0.3; mn = Math.min(mn, sm); mx = Math.max(mx, sm); sum += sm; n++;
        Nn.textContent = Math.round(sm); var lb = dbLabel(sm); Lb.textContent = lb[0] + " " + T(lb[1]); Eb.style.width = Math.min(100, sm / 1.2) + "%"; Eb.className = sm >= 85 ? "hi" : sm >= 65 ? "mid" : "";
        el.querySelector("#dbMin").textContent = Math.round(mn); el.querySelector("#dbAvg").textContent = Math.round(sum / n); el.querySelector("#dbMax").textContent = Math.round(mx);
        hist.push(sm); if(hist.length > 150) hist.shift(); gx.clearRect(0, 0, 600, 120); gx.strokeStyle = "#d9a43a"; gx.lineWidth = 3; gx.beginPath(); hist.forEach(function(h2, j){ var y = 120 - Math.min(120, h2 / 120 * 120); if(j) gx.lineTo(j * 4, y); else gx.moveTo(0, y); }); gx.stroke(); }, 200)};
      el.querySelector("#dbGo").innerHTML = "⏹ " + L("Henti", "Stop"); }, function(){ Lb.textContent = L("Mikrofon tidak dapat dibuka", "The microphone could not open"); }); };
  keep(stop); H.on("pause", stop); keep(function(){ H.off("pause", stop); });
  el.querySelector("#dbGo").onclick = function(){ if(st) stop(); else perm("mic", start); };
}

/* ---------------- ⏱️ Stopwatch ---------------- */
function swFmt(ms){ ms = Math.max(0, Math.floor(ms)); var h = Math.floor(ms / 36e5), m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1000) % 60, c = Math.floor(ms / 10) % 100; return (h ? h + ":" + pad(m) : pad(m)) + ":" + pad(s) + "." + pad(c); }
function vSw(el){ var d = db(), w = d.sw, now = function(){ return w.acc + (w.t0 ? Date.now() - w.t0 : 0); };
  var paint = function(){ var laps = w.laps, ls = laps.map(function(t, i){ return t - (i ? laps[i - 1] : 0); }), mx = Math.max.apply(null, ls), mn = Math.min.apply(null, ls);
    el.innerHTML = '<div class="card utSw"><div class="utSwT" id="swT">' + swFmt(now()) + '</div><div class="utSwL" id="swC">' + (w.t0 && laps.length ? L("Pusingan ", "Lap ") + (laps.length + 1) + " · " + swFmt(now() - laps[laps.length - 1]) : "") + '</div>' +
      '<div class="utSwB"><button class="btn alt" id="swL"' + (!w.t0 && !now() ? " disabled" : "") + '>' + (w.t0 ? "🏁 " + L("Pusingan", "Lap") : "↺ " + L("Set semula", "Reset")) + '</button><button class="btn ' + (w.t0 ? "alt" : "gold") + '" id="swS">' + (w.t0 ? "⏸ " + L("Jeda", "Pause") : "▶ " + (now() ? L("Sambung", "Resume") : L("Mula", "Start"))) + '</button></div></div>' +
      (laps.length ? '<div class="card utList">' + laps.map(function(t, i){ return i; }).reverse().map(function(i){ var l = ls[i], cls = laps.length > 2 && l === mn ? " best" : laps.length > 2 && l === mx ? " worst" : ""; return '<div class="utRow' + cls + '"><span>' + L("Pusingan ", "Lap ") + (i + 1) + '</span><b>' + swFmt(l) + '</b><small>' + swFmt(laps[i]) + '</small></div>'; }).join("") + '</div>' +
        '<div class="btns"><button class="btn alt" id="swCp">📋 ' + L("Salin keputusan", "Copy results") + '</button></div>' : '');
    el.querySelector("#swS").onclick = function(){ if(w.t0){ w.acc += Date.now() - w.t0; w.t0 = 0; } else w.t0 = Date.now(); put(d); vib(20); paint(); };
    el.querySelector("#swL").onclick = function(){ if(w.t0){ w.laps.push(now()); if(w.laps.length > 200) w.laps.shift(); } else { w.acc = 0; w.laps = []; } put(d); vib(20); paint(); };
    var cp = el.querySelector("#swCp"); if(cp) cp.onclick = function(){ var txt = laps.map(function(t, i){ return L("Pusingan ", "Lap ") + (i + 1) + "\t" + swFmt(ls[i]) + "\t" + swFmt(t); }).join("\n"); try{ navigator.clipboard.writeText(txt).then(function(){ H.toast(L("Disalin", "Copied")); }, function(){}); }catch(e){} }; };
  paint();
  var iv = setInterval(function(){ if(!w.t0) return; var t = el.querySelector("#swT"), c = el.querySelector("#swC"); if(t) t.textContent = swFmt(now()); if(c && w.laps.length) c.textContent = L("Pusingan ", "Lap ") + (w.laps.length + 1) + " · " + swFmt(now() - w.laps[w.laps.length - 1]); }, 47);
  keep(function(){ clearInterval(iv); }); }

/* ---------------- 🎲 Random picker ---------------- */
// gift exchange: everyone gives to someone else (a shuffled cycle, so nobody draws themself). Pure apart from rnd.
function giftPairs(names){ var a = shuffle(names); return a.map(function(n, i){ return [n, a[(i + 1) % a.length]]; }); }
function teams(names, k){ var a = shuffle(names), t = []; for(var i = 0; i < k; i++) t.push([]); a.forEach(function(n, i){ t[i % k].push(n); }); return t; }
function vPick(el){ var d = db(), m = U.pick, P = d.pk = d.pk || {};
  var M = [["name","👥","Nama","Names"],["coin","🪙","Syiling","Coin"],["dice","🎲","Dadu","Dice"],["num","🔢","Nombor","Number"]];
  var h = '<div class="chips utCats">' + M.map(function(x){ return '<button class="chip' + (x[0] === m ? " on" : "") + '" data-pm="' + x[0] + '">' + x[1] + ' ' + E(L(x[2], x[3])) + '</button>'; }).join("") + '</div><div class="card">';
  if(m === "name") h += '<textarea id="pkN" class="rin utTa" rows="5" placeholder="' + E(L("Satu nama setiap baris", "One name per line")) + '">' + E(d.names.join("\n")) + '</textarea>' +
    '<div class="utPkB"><button class="btn gold" data-pa="one">🎯 ' + L("Pilih seorang", "Pick one") + '</button><button class="btn alt" data-pa="order">🔀 ' + L("Susun giliran", "Random order") + '</button><button class="btn alt" data-pa="team">👥 ' + L("Pasukan", "Teams") + '</button><button class="btn alt" data-pa="gift">🎁 ' + L("Tukar hadiah", "Gift exchange") + '</button></div>' +
    '<label class="utF utF1"><span>' + L("Bilangan pasukan", "Number of teams") + '</span><input class="rin" id="pkK" type="number" inputmode="numeric" min="2" max="20" value="' + E(P.k || 2) + '"></label>';
  else if(m === "coin") h += '<div class="utCoin" id="pkC">🪙</div><div class="btns"><button class="btn gold" data-pa="coin">' + L("Lambung", "Flip") + '</button></div>';
  else if(m === "dice") h += '<label class="utF utF1"><span>' + L("Bilangan dadu", "Number of dice") + '</span><input class="rin" id="pkD" type="number" inputmode="numeric" min="1" max="6" value="' + E(P.d || 1) + '"></label><div class="btns"><button class="btn gold" data-pa="dice">' + L("Baling", "Roll") + '</button></div>';
  else h += '<div class="utG2"><label class="utF"><span>Min</span><input class="rin" id="pkA" type="number" inputmode="numeric" value="' + E(P.a == null ? 1 : P.a) + '"></label><label class="utF"><span>Max</span><input class="rin" id="pkB" type="number" inputmode="numeric" value="' + E(P.b == null ? 100 : P.b) + '"></label></div><div class="btns"><button class="btn gold" data-pa="num">' + L("Cabut", "Draw") + '</button></div>';
  el.innerHTML = h + '<div class="utPkR" id="pkR" aria-live="polite"></div></div>';
  var R = el.querySelector("#pkR");
  el.querySelectorAll("[data-pm]").forEach(function(b){ b.onclick = function(){ U.pick = b.getAttribute("data-pm"); vPick(el); }; });
  var ta = el.querySelector("#pkN"); if(ta) ta.oninput = function(){ d.names = ta.value.split("\n").map(function(s){ return s.trim(); }).filter(Boolean).slice(0, 200); put(d); };
  var spin = function(list, done){ var n = 0, iv = setInterval(function(){ R.innerHTML = '<div class="utPkBig spin">' + E(list[rnd(list.length)]) + '</div>'; if(++n > 10){ clearInterval(iv); done(); } }, 60); keep(function(){ clearInterval(iv); }); };
  el.querySelectorAll("[data-pa]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-pa"), names = d.names; vib(25);
    if(a === "one" || a === "order" || a === "team" || a === "gift"){ if(names.length < (a === "one" ? 1 : 2)){ H.toast(L("Tambah sekurang-kurangnya 2 nama", "Add at least 2 names")); return; } }
    if(a === "one") spin(names, function(){ R.innerHTML = '<div class="utPkBig">🎯 ' + E(names[rnd(names.length)]) + '</div>'; });
    else if(a === "order") R.innerHTML = '<ol class="utOl">' + shuffle(names).map(function(n){ return '<li>' + E(n) + '</li>'; }).join("") + '</ol>';
    else if(a === "team"){ var k = Math.max(2, Math.min(names.length, Math.floor(num(el.querySelector("#pkK").value) || 2))); P.k = k; put(d); R.innerHTML = '<div class="utTeams">' + teams(names, k).map(function(t, i){ return '<div><b>' + L("Pasukan ", "Team ") + (i + 1) + '</b>' + t.map(function(n){ return '<span>' + E(n) + '</span>'; }).join("") + '</div>'; }).join("") + '</div>'; }
    else if(a === "gift") R.innerHTML = '<div class="utList">' + giftPairs(names).map(function(p){ return '<div class="utRow"><span>🎁 ' + E(p[0]) + '</span><b>→ ' + E(p[1]) + '</b></div>'; }).join("") + '</div>';
    else if(a === "coin"){ var c = el.querySelector("#pkC"), heads = rnd(2) === 0; c.classList.remove("flip"); void c.offsetWidth; c.classList.add("flip"); R.innerHTML = ""; setTimeout(function(){ R.innerHTML = '<div class="utPkBig">' + (heads ? L("Kepala", "Heads") : L("Bunga", "Tails")) + '</div>'; }, 700); }
    else if(a === "dice"){ var n = Math.max(1, Math.min(6, Math.floor(num(el.querySelector("#pkD").value) || 1))), r = [], tot = 0; P.d = n; put(d); for(var i = 0; i < n; i++){ var v = rnd(6) + 1; r.push(v); tot += v; } R.innerHTML = '<div class="utDice">' + r.map(function(v){ return '<span>' + "⚀⚁⚂⚃⚄⚅".charAt(v - 1) + '</span>'; }).join("") + '</div>' + (n > 1 ? '<div class="utPkBig">' + L("Jumlah ", "Total ") + tot + '</div>' : '<div class="utPkBig">' + r[0] + '</div>'); }
    else { var lo = Math.floor(num(el.querySelector("#pkA").value)), hi = Math.floor(num(el.querySelector("#pkB").value)); if(isNaN(lo) || isNaN(hi) || hi < lo){ H.toast(L("Semak min dan max", "Check min and max")); return; } P.a = lo; P.b = hi; put(d); R.innerHTML = '<div class="utPkBig">' + (lo + rnd(hi - lo + 1)) + '</div>'; } }; });
}

/* ---------------- ⏳ Countdown ---------------- */
var HPRE = [["ramadan","🌙","1 Ramadan","1 Ramadan",9,1],["fitri","🕌","Aidilfitri","Eid al-Fitr",10,1],["arafah","⛰️","Hari Arafah","Day of Arafah",12,9],["adha","🐑","Aidiladha","Eid al-Adha",12,10],["muharram","🌒","Awal Muharram","Islamic New Year",1,1],["maulid","✨","Maulidur Rasul","Mawlid",3,12]];
// next Gregorian date (today or later) whose Hijri date is m/d, using the app's Hijri calendar
function nextHijri(m, dd){ var t = new Date(); t.setHours(12, 0, 0, 0); for(var i = 0; i < 400; i++){ var x = new Date(t.getTime() + i * 864e5), h = H.hijri && H.hijri(x); if(h && h.m === m && h.d === dd) return ymd(x); } return null; }
function cdLeft(c, nowMs){ var p = String(c.tm || "00:00").split(":"), dt = pd(c.d); dt.setHours(+p[0] || 0, +p[1] || 0, 0, 0); return dt.getTime() - nowMs; }
function cdText(ms){ var past = ms < 0, a = Math.abs(ms), dd = Math.floor(a / 864e5), hh = Math.floor(a / 36e5) % 24, mm = Math.floor(a / 6e4) % 60, ss = Math.floor(a / 1000) % 60;
  return {big: dd >= 2 ? dd + "" : pad(dd * 24 + hh) + ":" + pad(mm) + ":" + pad(ss), unit: dd >= 2 ? L("hari", "days") : "", past: past, sub: dd >= 14 ? Math.floor(dd / 7) + " " + L("minggu", "weeks") + " " + (dd % 7) + " " + L("hari", "days") : dd >= 2 ? hh + " " + L("jam", "hours") : ""}; }
function vCd(el){ var d = db(), list = d.cd.slice().sort(function(a, b){ var pa = cdLeft(a, Date.now()) < 0, pb = cdLeft(b, Date.now()) < 0; return pa !== pb ? (pa ? 1 : -1) : (a.d + (a.tm || "")).localeCompare(b.d + (b.tm || "")); });
  el.innerHTML = (list.length ? list.map(function(c){ return '<div class="card utCd" data-id="' + E(c.id) + '"><span class="utCdI">' + E(c.ic || "⏳") + '</span><div class="utCdM"><b>' + E(c.t) + '</b><small>' + E(c.d) + (c.tm ? " · " + E(c.tm) : "") + '</small></div><div class="utCdN"><b data-cl></b><small data-cs></small></div><button class="utCdX" data-cx="' + E(c.id) + '" aria-label="' + E(L("Padam", "Delete")) + '">✕</button></div>'; }).join("") : '<div class="card mut small" style="text-align:center">⏳ ' + L("Belum ada kiraan detik. Pilih satu di bawah atau tambah sendiri.", "No countdowns yet. Pick one below or add your own.") + '</div>') +
    '<div class="card"><div class="snl">🌙 ' + L("Tarikh Hijrah seterusnya", "Next Hijri dates") + '</div><div class="chips utWrap">' + HPRE.map(function(p){ return '<button class="chip" data-cp="' + p[0] + '">' + p[1] + ' ' + E(L(p[2], p[3])) + '</button>'; }).join("") + '</div>' +
    '<div class="snl" style="margin-top:10px">➕ ' + L("Tambah sendiri", "Add your own") + '</div><input id="cdT" class="rin" type="text" maxlength="60" placeholder="' + E(L("Contoh: Peperiksaan SPM", "e.g. Final exam")) + '"><div class="utG2"><input id="cdD" class="rin" type="date" value="' + ymd(new Date(Date.now() + 7 * 864e5)) + '" aria-label="' + E(L("Tarikh", "Date")) + '"><input id="cdM" class="rin" type="time" aria-label="' + E(L("Masa (pilihan)", "Time (optional)")) + '"></div>' +
    '<div class="chips utWrap" id="cdIc">' + ["⏳","🎓","💍","✈️","🕋","🎂","👶","🏠","📝","🏁"].map(function(x, i){ return '<button class="chip' + (i ? "" : " on") + '" data-ci="' + x + '">' + x + '</button>'; }).join("") + '</div><div class="btns"><button class="btn gold" id="cdAdd">' + L("Tambah", "Add") + '</button></div></div>' +
    '<div class="mut tiny utFoot">' + L("Tarikh Hijrah ikut kalendar Hijrah aplikasi (anggaran; tarikh rasmi ikut rukyah dan pengumuman).", "Hijri dates follow the app's Hijri calendar (an estimate; official dates follow the moon sighting and announcements).") + '</div>';
  var ic = "⏳", add = function(c){ c.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5); d.cd.push(c); if(d.cd.length > 50) d.cd.shift(); put(d); vCd(el); H.toast("⏳ " + L("Ditambah", "Added")); };
  el.querySelectorAll("[data-ci]").forEach(function(b){ b.onclick = function(){ ic = b.getAttribute("data-ci"); el.querySelectorAll("[data-ci]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; });
  el.querySelector("#cdAdd").onclick = function(){ var t = el.querySelector("#cdT").value.trim(), dd = el.querySelector("#cdD").value, tm = el.querySelector("#cdM").value; if(!t || !/^\d{4}-\d{2}-\d{2}$/.test(dd)){ H.toast(L("Isi nama dan tarikh", "Fill in a name and date")); return; } add({t: t, d: dd, tm: tm, ic: ic}); };
  el.querySelectorAll("[data-cp]").forEach(function(b){ b.onclick = function(){ var p = HPRE.filter(function(x){ return x[0] === b.getAttribute("data-cp"); })[0], dt = nextHijri(p[4], p[5]); if(!dt){ H.toast(L("Tarikh Hijrah tidak dapat dikira", "Could not work out the Hijri date")); return; } add({t: L(p[2], p[3]), d: dt, tm: "", ic: p[1], h: p[0]}); }; });
  el.querySelectorAll("[data-cx]").forEach(function(b){ b.onclick = function(){ if(!confirm(L("Padam kiraan detik ini?", "Delete this countdown?"))) return; var id = b.getAttribute("data-cx"); d.cd = d.cd.filter(function(c){ return c.id !== id; }); put(d); vCd(el); }; });
  var tick = function(){ var n = Date.now(); el.querySelectorAll(".utCd").forEach(function(r){ var c = d.cd.filter(function(x){ return x.id === r.getAttribute("data-id"); })[0]; if(!c) return; var t = cdText(cdLeft(c, n)); r.classList.toggle("past", t.past); r.querySelector("[data-cl]").textContent = (t.past ? "−" : "") + t.big; r.querySelector("[data-cs]").textContent = t.past ? L("sudah lepas", "passed") : (t.unit ? t.unit + (t.sub ? " · " + t.sub : "") : L("lagi", "to go")); }); };
  tick(); var iv = setInterval(tick, 1000); keep(function(){ clearInterval(iv); }); }
// the next upcoming countdown (for the Home widget later): {t, ic, ms} or null
function nextCd(h){ if(h) H = h; var d = db(), n = Date.now(), best = null; d.cd.forEach(function(c){ var ms = cdLeft(c, n); if(ms >= 0 && (!best || ms < best.ms)) best = {t: c.t, ic: c.ic, ms: ms}; }); return best; }

var FN = {conv: vConv, fx: vFx, calc: vCalc, level: vLevel, lens: vLens, db: vDb, sw: vSw, pick: vPick, cd: vCd};
window.Utility = {render: render, tools: TOOLS, conv: conv, bill: bill, giftPairs: giftPairs, teams: teams, fxRate: fxRate, swFmt: swFmt, cdText: cdText, nextCd: nextCd, stop: stopLive};
})();
