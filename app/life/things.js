/* My Ihsan 0.7.93 (owner picks #47, #48, #49): three home trackers.
   🧾 Waranti (Tools › Finance): receipts and warranties, photo of the receipt, end date, reminder 30 days before it ends.
   🚗 Kereta (Tools › Life): each car's road tax, insurance, service and tyre dates with reminders, a service log and a fuel log (cost per km, L/100 km).
   🪴 Tanaman (Tools › Life): each plant's watering and feeding rhythm, "needs water today", photos over time.
   Storage: ihsan_vault, ihsan_car, ihsan_plants (synced); photos in ihsan_vault_img / ihsan_plant_img (this phone only). Things.render(el, H, kind) · Things._t */
(function(){ "use strict";
var H = null;
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function pad(n){ return (n < 10 ? "0" : "") + n; }
function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function pd(s){ var p = String(s || "").split("-"); return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1); }
function days(a, b){ return Math.round((pd(b) - pd(a)) / 864e5); }
function addM(s, m){ var d = pd(s), day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + m); d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); return ymd(d); }
function addD(s, n){ var d = pd(s); d.setDate(d.getDate() + n); return ymd(d); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function money(v){ return (H.cur ? H.cur() : "RM") + " " + (Math.round((+v || 0) * 100) / 100).toFixed(2); }
function fmtD(s){ if(!s) return "–"; return pd(s).toLocaleDateString(L("ms-MY", "en-GB"), {day: "numeric", month: "short", year: "numeric"}); }
function left(s){ var n = days(ymd(), s); return n < 0 ? {c: "x", t: L("tamat ", "ended ") + (-n) + L(" hari lalu", " days ago")} : n <= 30 ? {c: "w", t: n + L(" hari lagi", " days left")} : {c: "ok", t: n > 365 ? Math.round(n / 30.4) + L(" bulan lagi", " months left") : n + L(" hari lagi", " days left")}; }
function rem(id, date, title, body, before){ if(!H.xrem) return; var t = pd(date); t.setDate(t.getDate() - (before || 0)); t.setHours(9, 0, 0, 0); H.xrem(id, t.getTime() > Date.now() ? t.getTime() : 0, title, body, "alat"); }
function img(key){ return H.load(key, {}) || {}; }
function putImg(key, id, url){ var m = img(key); if(url) m[id] = url; else delete m[id]; try{ H.save(key, m); return true; }catch(e){ H.toast(L("Ruang storan penuh", "Storage is full")); return false; } }
function field(id, lb, type, val, extra){ return '<label class="thF"><span>' + lb + '</span><input class="rin" id="' + id + '" type="' + type + '" value="' + E(val == null ? "" : val) + '"' + (extra || "") + '></label>'; }

// ---------------- 🧾 Warranty vault ----------------
function vault(el){ var D = H.load("ihsan_vault", null) || {list: []}, q = (vault.q || "").toLowerCase(), M = img("ihsan_vault_img");
  var list = D.list.filter(function(x){ return !q || (x.n + " " + (x.shop || "")).toLowerCase().indexOf(q) >= 0; }).sort(function(a, b){ return (a.end || "9") < (b.end || "9") ? -1 : 1; });
  var act = D.list.filter(function(x){ return x.end && x.end >= ymd(); }), val = act.reduce(function(s, x){ return s + (+x.price || 0); }, 0);
  el.innerHTML = '<div class="card thSum"><div><b>' + act.length + '</b><small>' + L("waranti aktif", "active warranties") + '</small></div><div><b>' + money(val) + '</b><small>' + L("nilai dilindungi", "value covered") + '</small></div><button class="btn gold" id="vaAdd">＋ ' + L("Tambah", "Add") + '</button></div>' +
    (D.list.length > 4 ? '<input class="rin thQ" id="vaQ" type="search" placeholder="🔍 ' + E(L("Cari barang atau kedai", "Search item or shop")) + '" value="' + E(vault.q || "") + '">' : '') +
    (list.length ? list.map(function(x){ var lf = x.end ? left(x.end) : null; return '<button class="card vaRow" data-va="' + x.id + '">' + (M[x.id] ? '<img src="' + M[x.id] + '" alt="">' : '<span class="thIc">🧾</span>') + '<span class="thM"><b>' + E(x.n) + '</b><small>' + E(x.shop || "") + (x.price ? ' · ' + money(x.price) : '') + ' · ' + fmtD(x.date) + '</small></span>' + (lf ? '<span class="thB ' + lf.c + '">' + lf.t + '</span>' : '') + '</button>'; }).join("") : '<div class="card mut small" style="text-align:center">🧾 ' + L("Simpan resit barang elektrik, perabot dan gajet. Anda akan diingatkan 30 hari sebelum waranti tamat.", "Keep receipts for appliances, furniture and gadgets. You get a reminder 30 days before a warranty ends.") + '</div>');
  var qi = el.querySelector("#vaQ"); if(qi) qi.oninput = function(){ vault.q = qi.value; vault(el); var n = el.querySelector("#vaQ"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
  el.querySelector("#vaAdd").onclick = function(){ vaultEdit(el, D, null); };
  el.querySelectorAll("[data-va]").forEach(function(b){ b.onclick = function(){ vaultEdit(el, D, D.list.filter(function(x){ return x.id === b.getAttribute("data-va"); })[0]); }; }); }
function vaultEdit(el, D, x){ var isNew = !x; x = x || {id: uid(), date: ymd(), months: 12}; var M = img("ihsan_vault_img"), photo = M[x.id] || null;
  var body = '<div class="thPh">' + (photo ? '<img src="' + photo + '" id="vaImg" alt="">' : '') + '<button class="chip" data-vp="camera">📷 ' + L("Ambil gambar resit", "Photo the receipt") + '</button><button class="chip" data-vp="gallery">🖼 ' + L("Muat naik", "Upload") + '</button></div>' +
    field("vaN", L("Barang", "Item"), "text", x.n, ' maxlength="60" placeholder="' + E(L("cth. Peti sejuk", "e.g. Fridge")) + '"') + field("vaS", L("Kedai", "Shop"), "text", x.shop, ' maxlength="50"') +
    '<div class="thG2">' + field("vaP", L("Harga", "Price"), "number", x.price, ' inputmode="decimal" step="0.01"') + field("vaD", L("Tarikh beli", "Bought on"), "date", x.date) + '</div>' +
    '<div class="thG2">' + field("vaM", L("Waranti (bulan)", "Warranty (months)"), "number", x.months, ' inputmode="numeric" min="0" max="240"') + field("vaSn", L("No. siri (pilihan)", "Serial no. (optional)"), "text", x.sn, ' maxlength="40"') + '</div>' +
    field("vaNo", L("Nota", "Note"), "text", x.note, ' maxlength="120" placeholder="' + E(L("cth. hubungi 1-300-xx-xxxx untuk servis", "e.g. call 1-300-xx-xxxx for service")) + '"') +
    '<div class="thBtns">' + (isNew ? '' : '<button class="btn alt" id="vaDel">🗑</button>') + '<button class="btn gold" id="vaOk">' + L("Simpan", "Save") + '</button></div>';
  var ov = H.showSheet((isNew ? "＋ " : "🧾 ") + L("Waranti & resit", "Warranty & receipt"), body);
  ov.querySelectorAll("[data-vp]").forEach(function(b){ b.onclick = function(){ if(!window.ibPickImage) return; window.ibPickImage(b.getAttribute("data-vp"), 1000, function(u){ photo = u; var im = ov.querySelector("#vaImg"); if(im) im.src = u; else ov.querySelector(".thPh").insertAdjacentHTML("afterbegin", '<img src="' + u + '" id="vaImg" alt="">'); }); }; });
  var im0 = ov.querySelector("#vaImg"); if(im0) im0.onclick = function(){ var w = window.open(""); if(w) w.document.write('<img src="' + photo + '" style="max-width:100%">'); };
  ov.querySelector("#vaOk").onclick = function(){ var n = ov.querySelector("#vaN").value.trim(); if(!n){ H.toast(L("Isi nama barang", "Fill in the item")); return; }
    x.n = n; x.shop = ov.querySelector("#vaS").value.trim(); x.price = parseFloat(ov.querySelector("#vaP").value) || 0; x.date = ov.querySelector("#vaD").value || ymd(); x.months = Math.max(0, parseInt(ov.querySelector("#vaM").value, 10) || 0); x.sn = ov.querySelector("#vaSn").value.trim(); x.note = ov.querySelector("#vaNo").value.trim();
    x.end = x.months ? addM(x.date, x.months) : ""; if(isNew) D.list.push(x); H.save("ihsan_vault", D); if(photo) putImg("ihsan_vault_img", x.id, photo);
    if(x.end) rem("va_" + x.id, x.end, "🧾 " + L("Waranti hampir tamat: ", "Warranty ending: ") + x.n, L("Tamat pada ", "Ends on ") + fmtD(x.end), 30);
    H.closeOverlay(); H.toast("🧾 " + L("Disimpan", "Saved")); vault(el); };
  var dl = ov.querySelector("#vaDel"); if(dl) dl.onclick = function(){ if(!confirm(L("Padam rekod ini?", "Delete this record?"))) return; D.list = D.list.filter(function(y){ return y.id !== x.id; }); H.save("ihsan_vault", D); putImg("ihsan_vault_img", x.id, null); rem("va_" + x.id, ymd(), "", "", 0); H.closeOverlay(); vault(el); }; }

// ---------------- 🚗 Car care ----------------
var CDATE = [["tax","🧾","Cukai jalan (LKM)","Road tax"],["ins","🛡️","Insurans","Insurance"],["svc","🔧","Servis seterusnya","Next service"],["tyre","🛞","Tayar / bateri","Tyres / battery"]];
function fuelStats(f){ // fuel log sorted by odometer → {km, rm, l, perKm, l100}
  var a = f.filter(function(x){ return +x.odo > 0; }).sort(function(p, q){ return p.odo - q.odo; }); if(a.length < 2) return null; var km = a[a.length - 1].odo - a[0].odo, rm = 0, l = 0; for(var i = 1; i < a.length; i++){ rm += +a[i].rm || 0; l += +a[i].l || 0; }
  return km > 0 ? {km: km, rm: rm, l: l, perKm: rm / km, l100: l ? l / km * 100 : null} : null; }
function car(el){ var D = H.load("ihsan_car", null) || {cars: []}, cur = D.cars.filter(function(c){ return c.id === car.cur; })[0] || D.cars[0];
  if(!cur){ el.innerHTML = '<div class="card thEmpty"><div class="thBig">🚗</div><div>' + L("Simpan tarikh cukai jalan, insurans dan servis, serta log minyak.", "Keep road tax, insurance and service dates, plus a fuel log.") + '</div><button class="btn gold" id="crAdd">＋ ' + L("Tambah kereta", "Add a car") + '</button></div>'; el.querySelector("#crAdd").onclick = function(){ carEdit(el, D, null); }; return; }
  car.cur = cur.id; cur.dates = cur.dates || {}; cur.fuel = cur.fuel || []; cur.svc = cur.svc || []; var fs = fuelStats(cur.fuel);
  el.innerHTML = '<div class="chips thCars">' + D.cars.map(function(c){ return '<button class="chip' + (c.id === cur.id ? " on" : "") + '" data-cr="' + c.id + '">🚗 ' + E(c.n) + '</button>'; }).join("") + '<button class="chip" id="crAdd">＋</button></div>' +
    '<div class="card"><div class="thHead"><b>' + E(cur.n) + '</b><span class="mut small">' + E(cur.plate || "") + (cur.odo ? ' · ' + (+cur.odo).toLocaleString() + ' km' : '') + '</span><button class="chip" id="crEd">✏️</button></div>' +
    CDATE.map(function(c){ var v = cur.dates[c[0]], lf = v ? left(v) : null; return '<div class="thLine"><span>' + c[1] + ' ' + E(L(c[2], c[3])) + '</span><input type="date" class="rin" data-cd="' + c[0] + '" value="' + E(v || "") + '">' + (lf ? '<span class="thB ' + lf.c + '">' + lf.t + '</span>' : '<span></span>') + '</div>'; }).join("") +
    '<div class="mut tiny">' + L("Peringatan 14 hari sebelum setiap tarikh.", "A reminder 14 days before each date.") + '</div></div>' +
    '<div class="card"><h3>⛽ ' + L("Log minyak", "Fuel log") + '</h3>' + (fs ? '<div class="thStats"><div><b>' + money(fs.perKm) + '</b><small>' + L("sekilometer", "per km") + '</small></div><div><b>' + (fs.l100 ? fs.l100.toFixed(1) : "–") + '</b><small>L/100 km</small></div><div><b>' + fs.km.toLocaleString() + '</b><small>km</small></div></div>' : '<div class="mut small">' + L("Isi sekurang-kurangnya 2 kali dengan bacaan odometer untuk kiraan kos.", "Log at least 2 fill-ups with the odometer to see the cost.") + '</div>') +
    '<div class="thG3">' + field("crL", L("Liter", "Litres"), "number", "", ' inputmode="decimal" step="0.01"') + field("crR", L("Harga", "Paid"), "number", "", ' inputmode="decimal" step="0.01"') + field("crO", "Odometer", "number", "", ' inputmode="numeric"') + '</div><button class="btn gold full" id="crF">＋ ' + L("Isi minyak", "Fill-up") + '</button>' +
    (cur.fuel.length ? '<div class="thLog">' + cur.fuel.slice(-6).reverse().map(function(f){ return '<div><span>' + fmtD(f.d) + '</span><span>' + (f.l ? f.l + " L" : "") + '</span><span>' + money(f.rm) + '</span><span>' + (f.odo ? (+f.odo).toLocaleString() + " km" : "") + '</span></div>'; }).join("") + '</div>' : '') + '</div>' +
    '<div class="card"><h3>🔧 ' + L("Rekod servis", "Service log") + '</h3>' + cur.svc.slice(-8).reverse().map(function(s){ return '<div class="thLog1"><b>' + fmtD(s.d) + '</b> · ' + E(s.t) + (s.rm ? ' · ' + money(s.rm) : '') + (s.odo ? ' · ' + (+s.odo).toLocaleString() + ' km' : '') + '</div>'; }).join("") +
    '<div class="thG2">' + field("crSt", L("Kerja", "Work"), "text", "", ' maxlength="60" placeholder="' + E(L("cth. Tukar minyak hitam", "e.g. Oil change")) + '"') + field("crSr", L("Kos", "Cost"), "number", "", ' inputmode="decimal"') + '</div><button class="btn alt full" id="crS">＋ ' + L("Tambah servis", "Add a service") + '</button></div>';
  var save = function(){ H.save("ihsan_car", D); };
  el.querySelectorAll("[data-cr]").forEach(function(b){ b.onclick = function(){ car.cur = b.getAttribute("data-cr"); car(el); }; });
  el.querySelector("#crAdd").onclick = function(){ carEdit(el, D, null); }; el.querySelector("#crEd").onclick = function(){ carEdit(el, D, cur); };
  el.querySelectorAll("[data-cd]").forEach(function(i){ i.onchange = function(){ var k = i.getAttribute("data-cd"), c = CDATE.filter(function(x){ return x[0] === k; })[0]; cur.dates[k] = i.value; save(); if(i.value) rem("car_" + cur.id + "_" + k, i.value, c[1] + " " + L(c[2], c[3]) + " · " + cur.n, L("Pada ", "On ") + fmtD(i.value), 14); car(el); }; });
  el.querySelector("#crF").onclick = function(){ var l = parseFloat(el.querySelector("#crL").value), r = parseFloat(el.querySelector("#crR").value), o = parseFloat(el.querySelector("#crO").value); if(!(r > 0)){ H.toast(L("Isi harga", "Fill in the amount")); return; } cur.fuel.push({d: ymd(), l: l > 0 ? l : 0, rm: r, odo: o > 0 ? o : 0}); if(o > (+cur.odo || 0)) cur.odo = o; cur.fuel = cur.fuel.slice(-300); save(); H.toast("⛽ " + L("Direkod", "Logged")); car(el); };
  el.querySelector("#crS").onclick = function(){ var t = el.querySelector("#crSt").value.trim(); if(!t) return; cur.svc.push({d: ymd(), t: t, rm: parseFloat(el.querySelector("#crSr").value) || 0, odo: +cur.odo || 0}); save(); car(el); }; }
function carEdit(el, D, c){ var isNew = !c; c = c || {id: uid()};
  var ov = H.showSheet("🚗 " + (isNew ? L("Kereta baharu", "New car") : E(c.n)), field("ceN", L("Nama", "Name"), "text", c.n, ' maxlength="30" placeholder="Myvi"') + field("ceP", L("No. pendaftaran", "Plate"), "text", c.plate, ' maxlength="12"') + field("ceO", L("Odometer (km)", "Odometer (km)"), "number", c.odo, ' inputmode="numeric"') +
    '<div class="thBtns">' + (isNew ? '' : '<button class="btn alt" id="ceDel">🗑</button>') + '<button class="btn gold" id="ceOk">' + L("Simpan", "Save") + '</button></div>');
  ov.querySelector("#ceOk").onclick = function(){ var n = ov.querySelector("#ceN").value.trim(); if(!n) return; c.n = n; c.plate = ov.querySelector("#ceP").value.trim().toUpperCase(); c.odo = parseFloat(ov.querySelector("#ceO").value) || c.odo || 0; if(isNew) D.cars.push(c); car.cur = c.id; H.save("ihsan_car", D); H.closeOverlay(); car(el); };
  var dl = ov.querySelector("#ceDel"); if(dl) dl.onclick = function(){ if(!confirm(L("Padam kereta ini dan lognya?", "Delete this car and its logs?"))) return; D.cars = D.cars.filter(function(x){ return x.id !== c.id; }); CDATE.forEach(function(k){ if(H.xrem) H.xrem("car_" + c.id + "_" + k[0], 0); }); H.save("ihsan_car", D); H.closeOverlay(); car.cur = null; car(el); }; }

// ---------------- 🪴 Plants ----------------
var PIC = ["🪴","🌵","🌿","🌺","🌻","🌹","🌶️","🍅","🍋","🌱","🎋","🌼"];
function due(p, kind){ var last = kind === "w" ? p.lw : p.lf, every = kind === "w" ? p.ew : p.ef; if(!every) return null; return last ? addD(last, every) : ymd(); }
function plants(el){ var D = H.load("ihsan_plants", null) || {list: []}, M = img("ihsan_plant_img"), t = ymd();
  var need = D.list.filter(function(p){ var d = due(p, "w"); return d && d <= t; });
  el.innerHTML = '<div class="card thSum"><div><b>' + D.list.length + '</b><small>' + L("pokok", "plants") + '</small></div><div><b>' + need.length + '</b><small>' + L("perlu disiram hari ini", "need water today") + '</small></div><button class="btn gold" id="plAdd">＋ ' + L("Tambah", "Add") + '</button></div>' +
    (need.length > 1 ? '<button class="btn alt full" id="plAll">💧 ' + L("Siram semua yang perlu", "Water all that need it") + '</button>' : '') +
    (D.list.length ? '<div class="thPlants">' + D.list.map(function(p){ var w = due(p, "w"), f = due(p, "f"), dw = w ? days(t, w) : null, ph = (p.ph || []).slice(-1)[0], src = ph && M[ph.k];
      return '<div class="card thPlant' + (dw != null && dw <= 0 ? " need" : "") + '"><button class="thPi" data-pe="' + p.id + '">' + (src ? '<img src="' + src + '" alt="">' : '<span>' + (p.ic || "🪴") + '</span>') + '</button><div class="thPm"><b>' + E(p.n) + '</b><small>💧 ' + (dw == null ? "–" : dw <= 0 ? L("hari ini", "today") : L("dalam ", "in ") + dw + L(" hari", " d")) + (f ? ' · 🧪 ' + (days(t, f) <= 0 ? L("baja hari ini", "feed today") : L("baja ", "feed ") + fmtD(f)) : '') + '</small></div>' +
        '<div class="thPb"><button class="chip' + (dw != null && dw <= 0 ? " gold" : "") + '" data-pw="' + p.id + '">💧</button>' + (p.ef ? '<button class="chip" data-pf="' + p.id + '">🧪</button>' : '') + '<button class="chip" data-pp="' + p.id + '" aria-label="' + E(L("Tambah gambar", "Add a photo")) + '">📷</button></div></div>'; }).join("") + '</div>'
      : '<div class="card mut small" style="text-align:center">🪴 ' + L("Tambah pokok anda: berapa hari sekali disiram dan dibaja. Ambil gambar dari semasa ke semasa untuk lihat ia membesar.", "Add your plants: how often to water and feed. Take photos now and then to watch them grow.") + '</div>');
  var save = function(){ H.save("ihsan_plants", D); D.list.forEach(function(p){ var w = due(p, "w"); if(w){ var tm = pd(w); tm.setHours(8, 0, 0, 0); if(H.xrem) H.xrem("pl_" + p.id, tm.getTime() > Date.now() ? tm.getTime() : 0, "💧 " + L("Siram ", "Water ") + p.n, L("Hari ini jadual siram", "Watering day"), "alat"); } }); };
  var find = function(id){ return D.list.filter(function(p){ return p.id === id; })[0]; };
  el.querySelector("#plAdd").onclick = function(){ plantEdit(el, D, null); };
  var all = el.querySelector("#plAll"); if(all) all.onclick = function(){ need.forEach(function(p){ p.lw = t; }); save(); try{ H.N.vibrate(40); }catch(e){} plants(el); };
  el.querySelectorAll("[data-pe]").forEach(function(b){ b.onclick = function(){ plantEdit(el, D, find(b.getAttribute("data-pe"))); }; });
  el.querySelectorAll("[data-pw]").forEach(function(b){ b.onclick = function(){ var p = find(b.getAttribute("data-pw")); p.lw = t; save(); H.toast("💧 " + p.n); plants(el); }; });
  el.querySelectorAll("[data-pf]").forEach(function(b){ b.onclick = function(){ var p = find(b.getAttribute("data-pf")); p.lf = t; save(); H.toast("🧪 " + p.n); plants(el); }; });
  el.querySelectorAll("[data-pp]").forEach(function(b){ b.onclick = function(){ var p = find(b.getAttribute("data-pp")); if(!window.ibPickImage) return; window.ibPickImage("ask", 600, function(u){ var k = p.id + "_" + Date.now().toString(36); if(!putImg("ihsan_plant_img", k, u)) return; p.ph = (p.ph || []).concat([{d: t, k: k}]); var M2 = img("ihsan_plant_img"); while(p.ph.length > 12){ var o = p.ph.shift(); delete M2[o.k]; } H.save("ihsan_plant_img", M2); save(); plants(el); }); }; }); save(); }
function plantEdit(el, D, p){ var isNew = !p; p = p || {id: uid(), ic: "🪴", ew: 3, ef: 30}; var M = img("ihsan_plant_img");
  var body = '<div class="chips thIcs">' + PIC.map(function(c){ return '<button class="chip' + (p.ic === c ? " on" : "") + '" data-pi="' + c + '">' + c + '</button>'; }).join("") + '</div>' + field("ptN", L("Nama", "Name"), "text", p.n, ' maxlength="30" placeholder="' + E(L("cth. Pokok cili", "e.g. Chilli plant")) + '"') +
    '<div class="thG2">' + field("ptW", L("Siram setiap (hari)", "Water every (days)"), "number", p.ew, ' inputmode="numeric" min="1" max="60"') + field("ptF", L("Baja setiap (hari, 0 = tiada)", "Feed every (days, 0 = none)"), "number", p.ef, ' inputmode="numeric" min="0" max="365"') + '</div>' + field("ptNo", L("Nota", "Note"), "text", p.note, ' maxlength="100" placeholder="' + E(L("cth. suka cahaya pagi", "e.g. likes morning sun")) + '"') +
    ((p.ph || []).length ? '<div class="thGal">' + p.ph.map(function(x){ return M[x.k] ? '<figure><img src="' + M[x.k] + '" alt=""><figcaption>' + fmtD(x.d) + '</figcaption></figure>' : ''; }).join("") + '</div>' : '') +
    '<div class="thBtns">' + (isNew ? '' : '<button class="btn alt" id="ptDel">🗑</button>') + '<button class="btn gold" id="ptOk">' + L("Simpan", "Save") + '</button></div>';
  var ov = H.showSheet((isNew ? "＋ " : "") + (p.ic || "🪴") + " " + (p.n ? E(p.n) : L("Pokok baharu", "New plant")), body), ic = p.ic;
  ov.querySelectorAll("[data-pi]").forEach(function(b){ b.onclick = function(){ ic = b.getAttribute("data-pi"); ov.querySelectorAll("[data-pi]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; });
  ov.querySelector("#ptOk").onclick = function(){ var n = ov.querySelector("#ptN").value.trim(); if(!n){ H.toast(L("Isi nama", "Fill in a name")); return; } p.n = n; p.ic = ic; p.ew = Math.max(1, parseInt(ov.querySelector("#ptW").value, 10) || 3); p.ef = Math.max(0, parseInt(ov.querySelector("#ptF").value, 10) || 0); p.note = ov.querySelector("#ptNo").value.trim(); if(isNew){ p.lw = ymd(); p.lf = ymd(); D.list.push(p); } H.save("ihsan_plants", D); H.closeOverlay(); plants(el); };
  var dl = ov.querySelector("#ptDel"); if(dl) dl.onclick = function(){ if(!confirm(L("Padam pokok ini?", "Delete this plant?"))) return; var M2 = img("ihsan_plant_img"); (p.ph || []).forEach(function(x){ delete M2[x.k]; }); H.save("ihsan_plant_img", M2); D.list = D.list.filter(function(x){ return x.id !== p.id; }); if(H.xrem) H.xrem("pl_" + p.id, 0); H.save("ihsan_plants", D); H.closeOverlay(); plants(el); }; }

window.Things = {render: function(el, h, kind){ H = h; if(!document.querySelector('link[href="life/things.css"]')){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "life/things.css"; document.head.appendChild(l); } (kind === "car" ? car : kind === "plant" ? plants : vault)(el); },
  _t: {addM: addM, fuelStats: fuelStats, due: due, left: left}};
})();
