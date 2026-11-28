/* My Ihsan 0.7.90 · Alat › Halal › 🍽️ Kalori: a calorie and nutrition diary with a halal status on every food.
   Ideas and formulas follow openCalory (MIT licence): Mifflin–St Jeor goals, portion scaling, daily summary,
   adaptive TDEE from a smoothed (EMA) weight trend and a weekly check-in. Re-written here in plain ES5; no openCalory code is bundled.
   Meal slots follow the day's prayer times (Sarapan · Tengah hari · Petang · Malam); in Ramadan (and on a sunnah fast day you mark)
   they become Sahur · Iftar · Moreh. Weight, water and workout calories are shared with Senaman (ihsan_fit).
   Storage: ihsan_kal_log {ymd:[entry]}, ihsan_kal_goal {…}, ihsan_kal_fav [food], ihsan_kal_my {barcode:product}.
   Entry: {id, n, por, q, kcal, p, c, f, fb, su, na, slot, hal "H"|"S"|"X"|"?", src "db"|"bc"|"rcp"|"ai"|"quick"|"my"|"fav", ref, t}  (kcal… = for q portions) */
(function(){ "use strict";
var H = null, V = {d:null, eat:false, wk:0}, LOG = "ihsan_kal_log", GOAL = "ihsan_kal_goal", FAV = "ihsan_kal_fav", MY = "ihsan_kal_my";
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function DB(){ return window.KALORI_DB || {rows:[], CAT:{}}; }
function p2(n){ return (n < 10 ? "0" : "") + n; }
function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); }
function dOf(k){ var a = k.split("-"); return new Date(+a[0], +a[1] - 1, +a[2], 12); }
function addD(k, n){ var d = dOf(k); d.setDate(d.getDate() + n); return ymd(d); }
function r1(v){ return Math.round(v * 10) / 10; }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function logAll(){ var l = H.load(LOG, {}); return l && typeof l === "object" ? l : {}; }
function dayLog(k){ var l = logAll()[k]; return Array.isArray(l) ? l : []; }
function setDay(k, arr){ var l = logAll(); if(arr.length) l[k] = arr; else delete l[k]; H.save(LOG, l); }
function goal(){ var g = H.load(GOAL, null); return g && typeof g === "object" ? g : null; }
function setGoal(g){ H.save(GOAL, g); }
function favs(){ var f = H.load(FAV, []); return Array.isArray(f) ? f : []; }
function mine(){ var m = H.load(MY, {}); return m && typeof m === "object" ? m : {}; }
function fit(){ var f = H.load("ihsan_fit", null); return f && typeof f === "object" ? f : null; }
function fitSave(f){ H.save("ihsan_fit", f); }

// ---------------- pure functions (exported in _t for tests) ----------------
/** Mifflin–St Jeor resting energy × activity; goal: lose (rate kg/week) / keep / gain. */
function mifflin(g){ if(!g || !g.w || !g.h || !g.age) return null;
  var bmr = 10 * g.w + 6.25 * g.h - 5 * g.age + (g.sex === "f" ? -161 : 5), tdee = bmr * (g.act || 1.375), d = 0;
  if(g.goal === "lose") d = -Math.round((g.rate || 0.5) * 7700 / 7); else if(g.goal === "gain") d = Math.round((g.rate || 0.25) * 7700 / 7);
  var min = g.sex === "f" ? 1200 : 1500;
  return {bmr:Math.round(bmr), tdee:Math.round(tdee), target:Math.max(min, Math.round((tdee + d) / 10) * 10), delta:d}; }
function targetOn(g, k){ if(!g) return 0; var wd = dOf(k).getDay(); if(g.days && g.days[wd]) return +g.days[wd]; return g.kcal || (mifflin(g) || {}).target || 2000; }
function macroT(kcal, g){ var sp = (g && g.split) || [20, 50, 30]; return {p:Math.round(kcal * sp[0] / 100 / 4), c:Math.round(kcal * sp[1] / 100 / 4), f:Math.round(kcal * sp[2] / 100 / 9), fb:25}; }
function sum(list){ var t = {kcal:0, p:0, c:0, f:0, fb:0, su:0, na:0}; (list || []).forEach(function(e){ for(var k in t) t[k] += +e[k] || 0; }); for(var k in t) t[k] = k === "kcal" || k === "na" ? Math.round(t[k]) : r1(t[k]); return t; }
/** scale a food (per one portion) to q portions */
function scale(f, q){ var o = {}; ["kcal", "p", "c", "f", "fb", "su", "na"].forEach(function(k){ var v = (+f[k] || 0) * q; o[k] = k === "kcal" || k === "na" ? Math.round(v) : r1(v); }); return o; }
/** exponential moving average of daily weights (gaps carried forward), alpha 0.1 */
function ema(wl, from, to){ var ks = Object.keys(wl || {}).filter(function(k){ return +wl[k] > 0; }).sort(); if(!ks.length) return [];
  var start = from && from > ks[0] ? from : ks[0], end = to || ymd(), out = [], last = null, t = null, k = start;
  ks.forEach(function(x){ if(x <= start) last = +wl[x]; });
  for(var i = 0; i < 400 && k <= end; i++, k = addD(k, 1)){ if(wl[k] > 0) last = +wl[k]; if(last == null) continue; t = t == null ? last : t + 0.1 * (last - t); out.push({d:k, w:wl[k] > 0 ? +wl[k] : null, t:r1(t * 10) / 10}); }
  return out; }
/** observed TDEE over the last `span` days: mean intake (logged days) − trend change × 7700 / days. Needs 10 logged days and 4 weigh-ins. */
function adaptive(log, wl, today, span){ span = span || 21; today = today || ymd(); var from = addD(today, -(span - 1)), days = [], kc = 0, wi = 0;
  for(var k = from; k <= today; k = addD(k, 1)){ var l = log[k]; if(Array.isArray(l) && l.length){ var s = sum(l).kcal; if(s > 0){ days.push(k); kc += s; } } if(wl && wl[k] > 0) wi++; }
  var tr = ema(wl, addD(from, -7), today).filter(function(x){ return x.d >= from; });
  var ready = days.length >= 10 && wi >= 4 && tr.length >= 2;
  if(!ready) return {ready:false, days:days.length, weighs:wi};
  var dk = (tr[tr.length - 1].t - tr[0].t), n = Math.max(1, (dOf(tr[tr.length - 1].d) - dOf(tr[0].d)) / 864e5);
  return {ready:true, days:days.length, weighs:wi, intake:Math.round(kc / days.length), perWeek:r1(dk / n * 7), tdee:Math.round(kc / days.length - dk * 7700 / n)}; }
/** prayer-time slots: [{k, ms, en, from "HH:MM", ic}] */
function hm(s){ var m = /(\d{1,2}):(\d{2})/.exec(String(s || "")); return m ? +m[1] * 60 + +m[2] : null; }
function slotsFor(k){ var pt = H.prayDay ? H.prayDay(dOf(k)) || {} : {}, g = goal() || {}, nm = g.names || {}, fast = isFast(k);
  if(fast) return [{k:"sahur", ic:"🌙", ms:nm.sahur || "Sahur", en:nm.sahur || "Sahur", t0:null, t1:pt.imsak || pt.subuh, lab:L("sebelum ", "before ") + (pt.imsak || pt.subuh || "")},
    {k:"iftar", ic:"🌆", ms:nm.iftar || "Iftar", en:nm.iftar || "Iftar", t0:pt.maghrib, t1:pt.isyak, lab:pt.maghrib || ""},
    {k:"moreh", ic:"🌃", ms:nm.moreh || "Moreh", en:nm.moreh || "Moreh", t0:pt.isyak, t1:null, lab:L("selepas Isyak", "after Isyak")}];
  return [{k:"pagi", ic:"🌅", ms:nm.pagi || "Sarapan", en:nm.pagi || "Breakfast", t0:null, t1:pt.zohor, lab:(pt.syuruk ? "Syuruk " : "") + "– Zohor"},
    {k:"tghr", ic:"☀️", ms:nm.tghr || "Tengah hari", en:nm.tghr || "Lunch", t0:pt.zohor, t1:pt.asar, lab:L("selepas Zohor", "after Zohor")},
    {k:"ptg", ic:"🌇", ms:nm.ptg || "Petang", en:nm.ptg || "Afternoon", t0:pt.asar, t1:pt.maghrib, lab:L("selepas Asar", "after Asar")},
    {k:"mlm", ic:"🌙", ms:nm.mlm || "Malam", en:nm.mlm || "Dinner", t0:pt.maghrib, t1:null, lab:L("selepas Maghrib", "after Maghrib")}]; }
function slotNow(k){ var sl = slotsFor(k), d = new Date(), m = d.getHours() * 60 + d.getMinutes(); if(k !== ymd()) return sl[0].k;
  if(sl[0].k === "sahur"){ var im = hm(sl[0].t1), mg = hm(sl[1].t0), is = hm(sl[2].t0); if(im != null && m < im + 60) return "sahur"; if(is != null && m >= is) return "moreh"; if(mg != null && m >= mg - 30) return "iftar"; return "iftar"; }
  for(var i = sl.length - 1; i >= 0; i--){ var a = hm(sl[i].t0); if(a != null && m >= a) return sl[i].k; } return sl[0].k; }
/** Ramadan from the Hijri date, or a day the user marked as a sunnah fast */
function hij(k){ return H.hijri ? H.hijri(dOf(k)) : null; }
function isRamadan(k){ var h = hij(k); return !!(h && h.m === 9); }
function isFast(k){ var g = goal() || {}; if(g.fast && g.fast[k] === 0) return false; return isRamadan(k) || !!(g.fast && g.fast[k]); }
/** sunnah fast days: Monday, Thursday, 13–15 of a Hijri month, 9 Zulhijjah, 9–10 Muharram, Shawwal (not the 1st) */
function sunnahFast(k){ var h = hij(k), wd = dOf(k).getDay(); if(!h) return wd === 1 || wd === 4 ? L("Isnin / Khamis", "Monday / Thursday") : "";
  if(h.m === 9) return ""; if(h.m === 10 && h.d === 1) return ""; if(h.m === 12 && h.d >= 10 && h.d <= 13) return "";
  if(h.m === 12 && h.d === 9) return "Arafah"; if(h.m === 1 && (h.d === 9 || h.d === 10)) return h.d === 9 ? "Tasu'a" : "Asyura"; if(h.d >= 13 && h.d <= 15) return L("Hari Putih", "White Days"); if(h.m === 10) return L("Syawal", "Shawwal");
  return wd === 1 ? L("Isnin", "Monday") : wd === 4 ? L("Khamis", "Thursday") : ""; }
/** search the food list (Malay and English, every word must match), my products and favourites */
function norm(s){ return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " "); }
function search(q, lim){ var ws = norm(q).split(/\s+/).filter(Boolean), out = [], seen = {};
  var add = function(f){ var key = f.id || f.n; if(seen[key]) return; seen[key] = 1; out.push(f); };
  var hit = function(txt){ txt = norm(txt); return ws.every(function(w){ return txt.indexOf(w) >= 0; }); };
  favs().forEach(function(f){ if(!ws.length || hit(f.n)) add(f); });
  var my = mine(); Object.keys(my).forEach(function(c){ var f = my[c]; if(!ws.length || hit(f.n + " " + (f.brand || "") + " " + c)) add(f); });
  if(ws.length) DB().rows.forEach(function(r){ if(hit(r.ms + " " + r.en)) add(food(r)); });
  return out.slice(0, lim || 40); }
function food(r){ return {id:r.id, n:L(r.ms, r.en), por:L(r.pms, r.pen), g:r.g, kcal:r.kcal, p:r.p, c:r.c, f:r.f, fb:r.fb, su:r.su, na:r.na, hal:"H", src:"db", cat:r.cat}; }
/** a product from the barcode lookup → a food (one serving, or 100 g when the pack gives no serving) */
function fromOff(p, verdict){ var n = p.nut || {}, per = n.serv || n.per100, g = n.serv ? (n.servG || null) : 100;
  if(!per) return null;
  return {id:"b_" + p.code, code:p.code, n:(p.name || L("Produk", "Product")) + (p.brand ? " · " + p.brand : ""), por:n.serv ? (n.servTxt || L("1 hidangan", "1 serving")) : "100 g", g:g,
    kcal:per.kcal, p:per.p, c:per.c, f:per.f, fb:per.fb, su:per.su, na:per.na, hal:verdict || (p.halal ? "H" : "?"), src:"bc", img:p.img || "", pack:n.packG || null, per100:n.per100 || null}; }

// ---------------- screens ----------------
var HAL = {H:["✔", "Halal", "Halal", "kH"], S:["!", "Syubhah", "Doubtful", "kS"], X:["✖", "Haram", "Haram", "kX"], "?":["?", "Belum disemak", "Not checked", "kQ"]};
function badge(h){ var x = HAL[h] || HAL["?"]; return '<span class="klB ' + x[3] + '">' + (h === "?" ? "?" : L(x[1], x[2])) + '</span>'; }
function ring(eat, tgt, exs){ var left = tgt + exs - eat, pct = Math.max(0, Math.min(1, eat / Math.max(1, tgt + exs))), R = 52, C = 2 * Math.PI * R, over = left < 0;
  return '<button class="klRing" data-k="ring" aria-label="' + E(L("Tukar paparan baki / dimakan", "Switch left / eaten")) + '"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="' + R + '" class="klRb"/><circle cx="60" cy="60" r="' + R + '" class="klRf' + (over ? " over" : "") + '" stroke-dasharray="' + (C * pct).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 60 60)"/></svg>' +
    '<span><b>' + (V.eat ? eat : Math.abs(left)).toLocaleString() + '</b><small>' + (V.eat ? L("dimakan", "eaten") : over ? L("melebihi", "over") : L("baki kcal", "kcal left")) + '</small></span></button>'; }
function bar(lab, v, t, u){ var pc = Math.min(100, Math.round(v / Math.max(1, t) * 100)); return '<div class="klBar"><div class="klBl"><span>' + lab + '</span><b>' + Math.round(v) + '/' + t + u + '</b></div><i><em style="width:' + pc + '%"' + (v > t ? ' class="over"' : '') + '></em></i></div>'; }
function exKcal(k){ var f = fit(); if(!f || !Array.isArray(f.log)) return 0; return Math.round(f.log.filter(function(x){ return x.d === k; }).reduce(function(a, x){ return a + (+x.kcal || 0); }, 0)); }
function setupHtml(){ var f = fit() || {}, g = goal() || {}, age = g.age || (f.by ? new Date().getFullYear() - f.by : ""), sel = function(id, opts, v){ return '<select id="' + id + '" class="rin">' + opts.map(function(o){ return '<option value="' + o[0] + '"' + (String(v) === String(o[0]) ? " selected" : "") + '>' + E(o[1]) + '</option>'; }).join("") + '</select>'; };
  return '<div class="card klSet"><h3>🎯 ' + L("Tetapkan sasaran harian", "Set your daily target") + '</h3><div class="mut small">' + L("Empat soalan. Berat dan tinggi dari Senaman diisi untuk anda.", "Four questions. Weight and height from Senaman are filled in for you.") + '</div>' +
    '<div class="klG2"><label>' + L("Jantina", "Sex") + sel("kgS", [["m", L("Lelaki", "Male")], ["f", L("Perempuan", "Female")]], g.sex || f.sex || "m") + '</label><label>' + L("Umur", "Age") + '<input id="kgA" type="number" class="rin" min="12" max="100" value="' + E(age) + '"></label>' +
    '<label>' + L("Tinggi (cm)", "Height (cm)") + '<input id="kgH" type="number" class="rin" min="100" max="230" value="' + E(g.h || f.h || "") + '"></label><label>' + L("Berat (kg)", "Weight (kg)") + '<input id="kgW" type="number" step="0.1" class="rin" min="25" max="300" value="' + E(g.w || f.w || "") + '"></label></div>' +
    '<label>' + L("Aktiviti", "Activity") + sel("kgAct", [[1.2, L("Kebanyakan duduk", "Mostly sitting")], [1.375, L("Ringan (1–3 hari senaman)", "Light (1–3 workout days)")], [1.55, L("Sederhana (3–5 hari)", "Moderate (3–5 days)")], [1.725, L("Aktif (6–7 hari)", "Active (6–7 days)")]], g.act || f.act || 1.375) + '</label>' +
    '<label>' + L("Matlamat", "Goal") + sel("kgGo", [["lose|0.25", L("Turun 0.25 kg seminggu", "Lose 0.25 kg a week")], ["lose|0.5", L("Turun 0.5 kg seminggu", "Lose 0.5 kg a week")], ["keep|0", L("Kekalkan berat", "Keep my weight")], ["gain|0.25", L("Naik 0.25 kg seminggu", "Gain 0.25 kg a week")]], (g.goal || f.goal || "keep") + "|" + (g.goal === "keep" || !g.goal ? 0 : (g.rate || (g.goal === "gain" ? 0.25 : 0.5)))) + '</label>' +
    '<button class="btn gold full" data-k="setgo" style="margin-top:10px">' + L("Kira sasaran", "Work out my target") + '</button><div class="mut tiny" style="margin-top:6px">' + L("Formula Mifflin–St Jeor. Ini anggaran; ikut nasihat doktor atau pakar diet jika anda ada keadaan kesihatan.", "Mifflin–St Jeor formula. This is an estimate; follow your doctor or dietitian if you have a health condition.") + '</div></div>'; }
function html(h){ H = h; if(!V.d) V.d = ymd();
  var g = goal(); if(!g || !g.kcal) return '<div class="klw">' + setupHtml() + '</div>';
  var k = V.d, today = ymd(), list = dayLog(k), t = sum(list), tgt = targetOn(g, k), exs = g.addEx ? exKcal(k) : 0, mt = macroT(tgt, g), sl = slotsFor(k), fast = isFast(k), hj = hij(k);
  var nH = list.filter(function(e){ return e.hal === "H"; }).length;
  var hd = '<div class="klDay"><button class="chip" data-k="prev" aria-label="' + L("Semalam", "Previous day") + '">‹</button><div><b>' + E(dOf(k).toLocaleDateString(H.S.lang === "en" ? "en-GB" : "ms-MY", {weekday:"long", day:"numeric", month:"short"})) + '</b><small>' + (hj && H.hijriStr ? E(H.hijriStr(hj)) : "") + (fast ? ' · ' + (isRamadan(k) ? L("Mod Ramadan", "Ramadan mode") : L("Puasa sunat", "Sunnah fast")) : '') + '</small></div><button class="chip" data-k="next"' + (k >= today ? ' disabled' : '') + ' aria-label="' + L("Esok", "Next day") + '">›</button></div>';
  var h2 = '<div class="klw">' + hd;
  // Ramadan / fast countdown
  if(fast && k === today){ var pt = H.prayDay(new Date()) || {}, now = new Date(), m = now.getHours() * 60 + now.getMinutes(), mg = hm(pt.maghrib), im = hm(pt.imsak || pt.subuh);
    if(mg != null && m < mg && (im == null || m >= im)){ var left = mg - m; h2 += '<div class="card klFast"><div><small>' + L("Berbuka dalam", "Iftar in") + '</small><b>' + Math.floor(left / 60) + ' j ' + (left % 60) + ' m</b></div><div class="mut small">Maghrib ' + E(pt.maghrib || "") + ' · Imsak ' + E(pt.imsak || "") + '</div></div>'; } }
  else if(!fast && k === today){ var sf = sunnahFast(addD(k, 1)); if(sf) h2 += '<div class="klHint">🌙 ' + L("Esok hari puasa sunat (" + sf + "). ", "Tomorrow is a sunnah fast day (" + sf + "). ") + '<button class="chip" data-k="fastnext">' + L("Guna slot Sahur & Iftar esok", "Use Sahur & Iftar slots tomorrow") + '</button></div>'; }
  h2 += '<div class="card klSum">' + ring(t.kcal, tgt, exs) + '<div class="klNums"><div><small>' + L("Sasaran", "Target") + '</small><b>' + tgt.toLocaleString() + '</b></div><div><small>' + L("Dimakan", "Eaten") + '</small><b>' + t.kcal.toLocaleString() + '</b></div><div><small>' + L("Senaman", "Exercise") + '</small><b>+' + (g.addEx ? exs : 0) + '</b>' + (!g.addEx && exKcal(k) ? '<small class="mut">(' + exKcal(k) + ' ' + L("tidak dicampur", "not added") + ')</small>' : '') + '</div><div><small>' + L("Halal hari ini", "Halal today") + '</small><b class="klHal">✔ ' + nH + '/' + list.length + '</b></div></div>' +
    '<div class="klBars">' + bar(L("Protein", "Protein"), t.p, mt.p, "g") + bar(L("Karbo", "Carbs"), t.c, mt.c, "g") + bar(L("Lemak", "Fat"), t.f, mt.f, "g") + bar(L("Serat", "Fibre"), t.fb, mt.fb, "g") + '</div></div>';
  // slots
  sl.forEach(function(s){ var es = list.filter(function(e){ return e.slot === s.k; }), st = sum(es);
    h2 += '<div class="card klSlot"><div class="klSh"><b>' + s.ic + ' ' + E(L(s.ms, s.en)) + '</b><small class="mut">' + E(s.lab) + '</small><span>' + (es.length ? st.kcal : '') + '</span><button class="chip" data-add="' + s.k + '">＋ ' + L("Tambah", "Add") + '</button></div>' +
      es.map(function(e){ return '<button class="klE" data-e="' + e.id + '"><span class="klEn">' + E(e.n) + (e.q && e.q !== 1 ? ' <small>×' + r1(e.q) + '</small>' : '') + '<small class="mut">' + E(e.por || "") + '</small></span>' + badge(e.hal) + '<b>' + e.kcal + '</b></button>'; }).join("") +
      (s.k === "iftar" || s.k === "tghr" || s.k === "mlm" ? planHint(k, s.k) : '') + '</div>'; });
  // water (shared with Senaman)
  var f = fit(), gl = f && f.water ? (f.water[k] || 0) : 0, gT = 8;
  h2 += '<div class="card klWat"><span>💧 ' + L("Air: ", "Water: ") + '<b>' + gl + ' / ' + gT + '</b> ' + L("gelas", "glasses") + (fast && gl < gT ? ' · ' + L("baki " + (gT - gl) + " gelas antara Iftar dan Imsak", (gT - gl) + " glasses left between Iftar and Imsak") : '') + '<small class="mut"> · ' + L("dikongsi dengan Senaman", "shared with Senaman") + '</small></span><span><button class="chip" data-k="wm">−</button><button class="chip on" data-k="wp">＋</button></span></div>';
  // tools
  h2 += '<div class="klTools"><button class="chip" data-k="copyy">⧉ ' + L("Salin semalam", "Copy yesterday") + '</button><button class="chip" data-k="fast">' + (fast ? '☀️ ' + L("Slot biasa", "Normal slots") : '🌙 ' + L("Saya berpuasa", "I'm fasting")) + '</button><button class="chip" data-k="sunnah">🍽️ ⅓ ⅓ ⅓</button><button class="chip" data-k="goal">⚙ ' + L("Sasaran", "Target") + '</button></div>';
  if(V.sun) h2 += sunnahHtml();
  h2 += microHtml(list) + trendHtml(g) + heatHtml() + '<div class="mut tiny klFoot">' + L("Nilai senarai makanan ialah anggaran biasa; ia berbeza ikut gerai dan resepi. Data kod bar dari Open Food Facts (ODbL). Idea dan formula diilhamkan oleh openCalory (MIT).", "Food list values are typical estimates; they vary by stall and recipe. Barcode data from Open Food Facts (ODbL). Ideas and formulas inspired by openCalory (MIT).") + '</div>';
  h2 += '<button class="klFab" data-add="" aria-label="' + L("Tambah makanan", "Add food") + '">＋</button><div class="klUndo" hidden></div></div>';
  return h2; }
function planHint(k, slot){ var p = H.load("ihsan_rcp_plan", {}), ids = (p && p[k]) || [], rs = H.load("ihsan_recipes", []); if(!ids.length || !Array.isArray(rs)) return "";
  var got = ids.map(function(id){ return rs.filter(function(r){ return r.id === id; })[0]; }).filter(function(r){ return r && r.nut && r.nut.kcal; }); if(!got.length) return "";
  if(slot !== (isFast(k) ? "iftar" : "tghr")) return "";
  return '<button class="chip klPlan" data-k="plan">📅 ' + L("Ikut Rancang: ", "From your plan: ") + E(got.map(function(r){ return r.title; }).join(", ").slice(0, 60)) + ' · ' + got.reduce(function(a, r){ return a + (+r.nut.kcal || 0); }, 0) + ' kcal</button>'; }
function sunnahHtml(){ return '<div class="card klSun"><h3>🍽️ ' + L("Sepertiga makanan, sepertiga minuman, sepertiga udara", "A third food, a third drink, a third air") + '</h3><div class="klThirds"><span>🍚<b>⅓</b>' + L("makanan", "food") + '</span><span>💧<b>⅓</b>' + L("minuman", "drink") + '</span><span>🌬️<b>⅓</b>' + L("udara", "air") + '</span></div>' +
  '<div class="small" style="line-height:1.5">' + L("“Anak Adam tidak memenuhi satu bekas yang lebih buruk daripada perutnya… sepertiga untuk makanannya, sepertiga untuk minumannya dan sepertiga untuk nafasnya.” (Riwayat at-Tirmizi, hasan sahih)", "“No human fills a vessel worse than his stomach… a third for his food, a third for his drink and a third for his breath.” (Narrated by at-Tirmidhi, hasan sahih)") + '</div><div class="mut tiny" style="margin-top:6px">⏳ ' + L("Menunggu semakan ustaz.", "Awaiting review by an ustaz.") + '</div></div>'; }
function microHtml(list){ if(!list.length) return ""; var t = sum(list), top = function(k){ var x = list.slice().sort(function(a, b){ return (+b[k] || 0) - (+a[k] || 0); }).filter(function(e){ return +e[k] > 0; }).slice(0, 2); return x.map(function(e){ return E(e.n.split(" · ")[0]) + " " + (k === "na" ? e[k] + " mg" : r1(e[k]) + " g"); }).join(", "); };
  return '<details class="card klMic"><summary>🧂 ' + L("Natrium & gula", "Sodium & sugar") + ' · ' + t.na + ' mg · ' + t.su + ' g</summary>' + bar(L("Natrium", "Sodium"), t.na, 2000, " mg") + '<div class="mut tiny">' + top("na") + '</div>' + bar(L("Gula", "Sugar"), t.su, 50, " g") + '<div class="mut tiny">' + top("su") + '</div><div class="mut tiny" style="margin-top:4px">' + L("Had harian KKM / WHO: natrium < 2000 mg, gula tambahan < 50 g.", "Daily limits (MOH / WHO): sodium under 2,000 mg, added sugar under 50 g.") + '</div></details>'; }
function trendHtml(g){ var f = fit() || {}, wl = f.wl || {}, a = adaptive(logAll(), wl), tr = ema(wl, addD(ymd(), -27)), today = ymd();
  var h = '<div class="card klTr"><div class="klSh"><b>📉 ' + L("Trend berat · 4 minggu", "Weight trend · 4 weeks") + '</b>' + (a.ready ? '<span>TDEE ≈ ' + a.tdee.toLocaleString() + '</span>' : '') + '</div>';
  if(tr.length >= 2){ var ws = tr.map(function(x){ return x.w || x.t; }), mn = Math.min.apply(null, ws) - 0.5, mx = Math.max.apply(null, ws) + 0.5, W = 300, Hh = 90, X = function(i){ return 6 + i * (W - 12) / Math.max(1, tr.length - 1); }, Y = function(v){ return Hh - 8 - (v - mn) / (mx - mn) * (Hh - 16); };
    h += '<svg class="klTrS" viewBox="0 0 ' + W + ' ' + Hh + '"><polyline points="' + tr.map(function(x, i){ return X(i).toFixed(1) + "," + Y(x.t).toFixed(1); }).join(" ") + '" class="klTl"/>' + tr.map(function(x, i){ return x.w ? '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(x.w).toFixed(1) + '" r="2.6" class="klTd"/>' : ''; }).join("") + '</svg><div class="mut tiny">● ' + L("timbangan", "weigh-in") + ' · — ' + L("trend", "trend") + ' · ' + tr[tr.length - 1].t + ' kg</div>'; }
  else h += '<div class="mut small">' + L("Timbang berat beberapa kali seminggu untuk melihat trend.", "Weigh yourself a few times a week to see the trend.") + '</div>';
  h += '<div class="klWi"><input id="klW" type="number" step="0.1" class="rin" placeholder="' + L("Berat hari ini (kg)", "Today's weight (kg)") + '" value="' + E(wl[today] || "") + '"><button class="btn alt" data-k="weigh">⚖️ ' + L("Simpan", "Save") + '</button></div>';
  if(a.ready){ var nt = Math.max(g.sex === "f" ? 1200 : 1500, Math.round((a.tdee + ((mifflin(g) || {}).delta || 0)) / 10) * 10), due = !g.chk || g.chk <= addD(today, -7);
    h += '<div class="small" style="margin-top:6px">' + L("Purata makan ", "Average intake ") + '<b>' + a.intake.toLocaleString() + '</b> kcal · ' + L("trend ", "trend ") + '<b>' + (a.perWeek > 0 ? "+" : "") + a.perWeek + ' kg/' + L("minggu", "week") + '</b></div>' +
      (due && Math.abs(nt - g.kcal) >= 50 ? '<div class="klChk"><b>' + L("Semakan mingguan: ", "Weekly check-in: ") + '</b>' + L("sasaran baharu dicadangkan " + nt.toLocaleString() + " kcal (kini " + g.kcal.toLocaleString() + ").", "a new target of " + nt.toLocaleString() + " kcal is suggested (now " + g.kcal.toLocaleString() + ").") + '<div class="btns"><button class="btn alt" data-k="keep">' + L("Kekal", "Keep") + '</button><button class="btn gold" data-k="use" data-v="' + nt + '">' + L("Ubah", "Change") + '</button></div></div>'
        : due ? '<div class="klChk">' + L("Semakan mingguan: trend seperti dirancang. Kekalkan " + g.kcal.toLocaleString() + " kcal.", "Weekly check-in: on track. Keep " + g.kcal.toLocaleString() + " kcal.") + ' <button class="chip" data-k="keep">✓</button></div>' : ''); }
  else h += '<div class="mut tiny" style="margin-top:6px">' + L("TDEE sebenar sedia selepas 10 hari direkod dan 4 timbangan dalam 3 minggu (kini " + a.days + " hari, " + a.weighs + " timbangan).", "Your real TDEE is ready after 10 logged days and 4 weigh-ins within 3 weeks (now " + a.days + " days, " + a.weighs + " weigh-ins).") + '</div>';
  return h + '</div>'; }
function heatHtml(){ var l = logAll(), g = goal(), today = ymd(), cells = "", n = 0;
  for(var i = 29; i >= 0; i--){ var k = addD(today, -i), s = Array.isArray(l[k]) ? sum(l[k]).kcal : 0, t = targetOn(g, k), lv = !s ? 0 : s < t * 0.5 ? 1 : s <= t * 1.05 ? 2 : 3; if(s) n++;
    cells += '<i class="lv' + lv + '" title="' + k + ' · ' + s + ' kcal"></i>'; }
  return '<details class="card klHeat"><summary>🗓️ ' + L("30 hari · " + n + " hari direkod", "30 days · " + n + " days logged") + '</summary><div class="klHm">' + cells + '</div><div class="mut tiny">' + L("Kosong · sedikit · dalam sasaran · melebihi (emas, bukan merah)", "Empty · a little · within target · over (gold, not red)") + '</div><button class="chip" data-k="csv" style="margin-top:8px">⬇ CSV</button></details>'; }

// ---------------- actions ----------------
var REDRAW = null;
function redraw(){ if(REDRAW) REDRAW(); }
function bind(el, h, rd){ H = h; REDRAW = rd || REDRAW;
  var w = el.querySelector(".klw"); if(!w) return;
  setTimeout(function(){ var v = document.getElementById("view"); if(v) document.documentElement.style.setProperty("--klfab", Math.max(84, (parseInt(getComputedStyle(v).paddingBottom, 10) || 150) - 70) + "px"); }, 80);
  w.querySelectorAll("[data-k]").forEach(function(b){ b.onclick = function(ev){ ev.stopPropagation(); act(b.getAttribute("data-k"), b, el); }; });
  w.querySelectorAll("[data-add]").forEach(function(b){ b.onclick = function(ev){ ev.stopPropagation(); addSheet(b.getAttribute("data-add") || slotNow(V.d)); }; });
  w.querySelectorAll("[data-e]").forEach(function(b){ var lp = null;
    b.onclick = function(){ editSheet(b.getAttribute("data-e")); };
    b.addEventListener("contextmenu", function(e){ e.preventDefault(); editSheet(b.getAttribute("data-e")); }); }); }
function act(a, b, el){ var g = goal() || {}, k = V.d;
  if(a === "setgo"){ var q = function(id){ return el.querySelector(id); }, go = q("#kgGo").value.split("|");
    var ng = {sex:q("#kgS").value, age:+q("#kgA").value, h:+q("#kgH").value, w:+q("#kgW").value, act:+q("#kgAct").value, goal:go[0], rate:+go[1] || 0};
    if(!(ng.age >= 12 && ng.h >= 100 && ng.w >= 25)){ H.toast(L("Isi umur, tinggi dan berat", "Fill in age, height and weight")); return; }
    var m = mifflin(ng); for(var x in g) if(ng[x] === undefined) ng[x] = g[x]; ng.kcal = m.target; setGoal(ng);
    var f = fit(); if(f){ if(!f.h) f.h = ng.h; if(!f.w) f.w = ng.w; if(!f.sex) f.sex = ng.sex; fitSave(f); }
    H.toast("🎯 " + L("Sasaran ", "Target ") + m.target.toLocaleString() + " kcal"); redraw(); return; }
  if(a === "ring"){ V.eat = !V.eat; redraw(); return; }
  if(a === "prev"){ V.d = addD(k, -1); redraw(); return; }
  if(a === "next"){ if(k < ymd()){ V.d = addD(k, 1); redraw(); } return; }
  if(a === "wp" || a === "wm"){ var f2 = fit() || {water:{}}; f2.water = f2.water || {}; f2.water[k] = Math.max(0, (f2.water[k] || 0) + (a === "wp" ? 1 : -1)); fitSave(f2); if(H.N && H.N.vibrate) H.N.vibrate(15); redraw(); return; }
  if(a === "copyy"){ var y = dayLog(addD(k, -1)); if(!y.length){ H.toast(L("Semalam kosong", "Yesterday is empty")); return; } var cur = dayLog(k); y.forEach(function(e){ var c = JSON.parse(JSON.stringify(e)); c.id = uid(); c.t = Date.now(); if(!slotsFor(k).some(function(s){ return s.k === c.slot; })) c.slot = slotNow(k); cur.push(c); }); setDay(k, cur); undoBar(y.length + L(" makanan disalin", " foods copied"), function(){ setDay(k, cur.slice(0, cur.length - y.length)); }); redraw(); return; }
  if(a === "fast" || a === "fastnext"){ var kk = a === "fastnext" ? addD(k, 1) : k; g.fast = g.fast || {}; if(isFast(kk)){ if(isRamadan(kk)) g.fast[kk] = 0; else delete g.fast[kk]; } else g.fast[kk] = 1; setGoal(g); H.toast(isFast(kk) ? "🌙 " + L("Slot Sahur · Iftar · Moreh", "Sahur · Iftar · Moreh slots") : "☀️ " + L("Slot biasa", "Normal slots")); redraw(); return; }
  if(a === "sunnah"){ V.sun = !V.sun; redraw(); return; }
  if(a === "goal"){ goalSheet(); return; }
  if(a === "weigh"){ var v = parseFloat(el.querySelector("#klW").value); if(!(v >= 25 && v <= 300)){ H.toast(L("Masukkan berat dalam kg", "Enter your weight in kg")); return; } var f3 = fit() || {}; f3.wl = f3.wl || {}; f3.wl[ymd()] = r1(v); f3.w = r1(v); fitSave(f3); H.toast("⚖️ " + r1(v) + " kg"); redraw(); return; }
  if(a === "keep" || a === "use"){ if(a === "use") g.kcal = +b.getAttribute("data-v"); g.chk = ymd(); setGoal(g); H.toast(a === "use" ? "🎯 " + g.kcal.toLocaleString() + " kcal" : "✓"); redraw(); return; }
  if(a === "plan"){ var p = H.load("ihsan_rcp_plan", {}), rs = H.load("ihsan_recipes", []), cur2 = dayLog(k), sl = isFast(k) ? "iftar" : "tghr", n = 0;
    ((p && p[k]) || []).forEach(function(id){ var r = (rs || []).filter(function(x){ return x.id === id; })[0]; if(r && r.nut && r.nut.kcal){ cur2.push(entry(recipeFood(r), 1, sl)); n++; } }); setDay(k, cur2); undoBar(n + L(" resepi dari Rancang", " recipes from your plan"), function(){ setDay(k, cur2.slice(0, cur2.length - n)); }); redraw(); return; }
  if(a === "csv"){ exportCsv(); return; } }
function entry(f, q, slot){ var s = scale(f, q); return {id:uid(), n:f.n, por:f.por, g:f.g, q:q, kcal:s.kcal, p:s.p, c:s.c, f:s.f, fb:s.fb, su:s.su, na:s.na, slot:slot, hal:f.hal || "?", src:f.src || "db", ref:f.id || "", unit:{kcal:f.kcal, p:f.p, c:f.c, f:f.f, fb:f.fb, su:f.su, na:f.na}, t:Date.now()}; }
function recipeFood(r){ var n = r.nut || {}, v = r.verdict || (r.review ? "S" : "H"); return {id:"r_" + r.id, n:r.title, por:L("1 hidangan", "1 serving"), kcal:Math.round(+n.kcal || 0), p:+n.p || 0, c:+n.c || 0, f:+n.f || 0, fb:+n.fb || 0, su:0, na:0, hal:v === "X" ? "X" : v === "S" ? "S" : "H", src:"rcp"}; }
function undoBar(msg, undo){ var u = document.querySelector(".klUndo"); if(!u){ H.toast(msg); return; }
  setTimeout(function(){ var u2 = document.querySelector(".klUndo"); if(!u2) return; u2.hidden = false; u2.innerHTML = '<span>' + E(msg) + '</span><button class="chip">' + L("Buat asal", "Undo") + '</button>'; u2.querySelector("button").onclick = function(){ undo(); u2.hidden = true; redraw(); }; clearTimeout(undoBar.t); undoBar.t = setTimeout(function(){ var u3 = document.querySelector(".klUndo"); if(u3) u3.hidden = true; }, 5000); }, 60); }

// ---------------- add sheet: search · barcode · photo · quick · recipes · favourites ----------------
var A = {tab:null, q:"", slot:null, pick:null, qty:1, ai:null};
function addSheet(slot, pre){ var g = goal() || {}; A.slot = slot || slotNow(V.d); A.tab = pre ? A.tab || "cari" : g.tab || "cari"; A.pick = pre || null; A.qty = 1; A.ai = null; drawSheet(); }
function drawSheet(){ var sl = slotsFor(V.d), cur = sl.filter(function(s){ return s.k === A.slot; })[0] || sl[0];
  var tabs = [["cari", "🔎", "Cari", "Search"], ["kod", "▥", "Kod bar", "Barcode"], ["gambar", "📷", "Gambar", "Photo"], ["pantas", "✍️", "Pantas", "Quick"], ["resepi", "🍲", "Resepi", "Recipes"]];
  var body = A.pick ? pickHtml() : tabBody(A.tab);
  var ov = H.showSheet("＋ " + L("Tambah ke ", "Add to ") + E(L(cur.ms, cur.en)), (A.pick ? '' : '<div class="klTabs">' + tabs.map(function(t){ return '<button class="chip' + (A.tab === t[0] ? " on" : "") + '" data-at="' + t[0] + '">' + t[1] + ' ' + L(t[2], t[3]) + '</button>'; }).join("") + '</div>') + '<div class="klAdd">' + body + '</div>');
  ov.querySelector(".sheet").classList.add("klSheet");
  bindSheet(ov); return ov; }
function tabBody(t){
  if(t === "cari"){ var res = search(A.q), cats = DB().CAT;
    return '<input id="klQ" class="rin" placeholder="' + L("Cari: nasi lemak, teh tarik, roti canai…", "Search: nasi lemak, teh tarik, roti canai…") + '" value="' + E(A.q) + '" autocomplete="off">' +
      (A.q ? '' : '<div class="klCats">' + Object.keys(cats).map(function(c){ return '<button class="chip" data-cat="' + c + '">' + cats[c][0] + ' ' + L(cats[c][1], cats[c][2]) + '</button>'; }).join("") + '</div>' + (res.length ? '<div class="klSec">⭐ ' + L("Kegemaran & produk saya", "Favourites & my products") + '</div>' : '')) +
      '<div class="klRes">' + res.map(resRow).join("") + (A.q && !res.length ? '<div class="mut small" style="padding:10px 2px">' + L("Tiada padanan. Cuba ✍️ Pantas, atau imbas kod bar.", "No match. Try ✍️ Quick, or scan the barcode.") + '</div>' : '') + '</div>'; }
  if(t === "kod") return '<div class="klBig"><button class="btn gold full" data-ak="scan">▥ ' + L("Imbas kod bar", "Scan a barcode") + '</button><div class="mut small" style="margin-top:8px">' + L("Satu imbasan memberi status halal dan nutrisi produk (Open Food Facts).", "One scan gives the product's halal status and its nutrition (Open Food Facts).") + '</div>' + (A.miss ? missHtml() : '') + '</div>';
  if(t === "gambar"){ if(A.ai && A.ai.busy) return '<div class="hbusy"><div class="hspin"></div><div>' + E(A.ai.msg || L("AI sedang membaca…", "The AI is reading…")) + '</div></div>';
    if(A.ai && A.ai.items) return aiReviewHtml();
    return '<div class="klBig"><button class="btn gold full" data-ak="meal">📷 ' + L("Gambar hidangan", "Photo of a meal") + '</button><button class="btn alt full" data-ak="label" style="margin-top:8px">🏷️ ' + L("Gambar label nutrisi", "Photo of a nutrition label") + '</button><div class="mut small" style="margin-top:8px;line-height:1.45">' + L("AI pilihan anda (Tetapan › AI) memecahkan hidangan kepada ramuan dan berat, dan menanda bahan yang meragukan seperti gelatin atau mirin. Anda semak dan betulkan setiap baris sebelum direkod. Gambar dihantar kepada penyedia AI itu.", "The AI you chose (Settings › AI) breaks the meal into ingredients and grams, and flags doubtful items such as gelatin or mirin. You check and fix every line before it is saved. The photo is sent to that AI provider.") + '</div>' + (A.ai && A.ai.err ? '<div class="klErr">⚠ ' + E(A.ai.err) + '</div>' : '') + '<input type="file" accept="image/*" id="klPh" style="display:none"></div>'; }
  if(t === "pantas") return '<input id="klQn" class="rin" placeholder="' + L("Nama (pilihan)", "Name (optional)") + '"><div class="klG4"><label>kcal<input id="klQk" type="number" class="rin" inputmode="numeric"></label><label>' + L("Protein g", "Protein g") + '<input id="klQp" type="number" class="rin"></label><label>' + L("Karbo g", "Carbs g") + '<input id="klQc" type="number" class="rin"></label><label>' + L("Lemak g", "Fat g") + '<input id="klQf" type="number" class="rin"></label></div><button class="btn gold full" data-ak="quick" style="margin-top:10px">' + L("Tambah", "Add") + '</button><div class="mut tiny" style="margin-top:6px">' + L("Makanan yang ditaip tanda kelabu “?” (belum disemak halal).", "Typed foods get a grey “?” (halal not checked).") + '</div>';
  if(t === "resepi"){ var rs = (H.load("ihsan_recipes", []) || []).filter(function(r){ return r.nut && r.nut.kcal; });
    return rs.length ? '<div class="klRes">' + rs.map(function(r){ return resRow(recipeFood(r)); }).join("") + '</div>' : '<div class="mut small">' + L("Tiada resepi dengan nutrisi lagi. Resepi yang diimport dengan AI menyimpan kcal sehidangan.", "No recipes with nutrition yet. Recipes imported with the AI keep kcal per serving.") + '</div>'; }
  return ""; }
function resRow(f){ return '<button class="klR" data-pick="' + E(f.id || "") + '"><span><b>' + E(f.n) + '</b><small class="mut">' + E(f.por || "") + '</small></span>' + badge(f.hal) + '<em>' + f.kcal + '</em></button>'; }
function findFood(id){ if(!id) return null; var f = favs().filter(function(x){ return x.id === id; })[0]; if(f) return f; var my = mine(); for(var c in my) if(my[c].id === id) return my[c];
  var r = DB().rows.filter(function(x){ return x.id === id; })[0]; if(r) return food(r);
  if(id.indexOf("r_") === 0){ var rc = (H.load("ihsan_recipes", []) || []).filter(function(x){ return "r_" + x.id === id; })[0]; if(rc) return recipeFood(rc); }
  return A.found && A.found.id === id ? A.found : null; }
function pickHtml(){ var f = A.pick, q = A.qty, s = scale(f, q), sl = slotsFor(V.d), isFav = favs().some(function(x){ return x.id === f.id; });
  var chips = [0.5, 1, 2].map(function(v){ return '<button class="chip' + (q === v ? " on" : "") + '" data-q="' + v + '">' + (v === 0.5 ? "½" : v) + ' × ' + E(f.por) + '</button>'; }).join("") + (f.g ? '<button class="chip' + (q === 100 / f.g ? " on" : "") + '" data-q="' + (100 / f.g) + '">100 ' + (f.cat === "minum" ? "ml" : "g") + '</button>' : '') + (f.pack && f.g ? '<button class="chip" data-q="' + (f.pack / f.g) + '">' + L("1 pek", "1 pack") + '</button>' : '');
  return '<div class="klPick">' + (f.img ? '<img src="' + E(f.img) + '" alt="" onerror="this.remove()">' : '') + '<b>' + E(f.n) + '</b>' + (f.code ? '<small class="mut">' + E(f.code) + ' · Open Food Facts</small>' : '') +
    '<div class="klHalRow">' + badge(f.hal) + '<span class="small">' + (f.hal === "H" ? (f.src === "db" ? L("Hidangan biasa, dianggap halal jika dari sumber halal.", "A common dish, halal when made from halal sources.") : L("Semua ramuan dikenal pasti halal.", "All ingredients identified as halal.")) : f.hal === "S" ? L("Ada ramuan syubhah. Semak logo halal.", "Has doubtful ingredients. Check for a halal logo.") : f.hal === "X" ? L("Ada ramuan haram.", "Has haram ingredients.") : L("Belum disemak.", "Not checked.")) + '</span></div>' +
    '<div class="klNut"><div><b>' + s.kcal + '</b>kcal</div><div><b>' + s.p + 'g</b>protein</div><div><b>' + s.c + 'g</b>' + L("karbo", "carbs") + '</div><div><b>' + s.f + 'g</b>' + L("lemak", "fat") + '</div></div>' +
    '<div class="klStep"><button class="chip" data-qs="-1">−</button><div><b>' + (q === Math.round(q) ? q : r1(q)) + ' × ' + E(f.por) + '</b>' + (f.g ? '<small class="mut">≈ ' + Math.round(f.g * q) + (f.cat === "minum" ? " ml" : " g") + '</small>' : '') + '</div><button class="chip" data-qs="1">＋</button></div><div class="klChips">' + chips + '</div>' +
    '<div class="klChips">' + sl.map(function(x){ return '<button class="chip' + (A.slot === x.k ? " on" : "") + '" data-sl="' + x.k + '">' + x.ic + ' ' + E(L(x.ms, x.en)) + '</button>'; }).join("") + '</div>' +
    '<button class="btn gold full" data-ak="add" style="margin-top:10px">' + L("Tambah · ", "Add · ") + s.kcal + ' kcal</button><div class="btns" style="margin-top:6px"><button class="btn alt" data-ak="fav">' + (isFav ? '★ ' + L("Kegemaran", "Favourite") : '☆ ' + L("Simpan sebagai kegemaran", "Save as a favourite")) + '</button><button class="btn alt" data-ak="back">‹ ' + L("Kembali", "Back") + '</button></div></div>'; }
function missHtml(){ var m = A.miss; return '<div class="card klMiss"><b>' + L("Produk tiada nutrisi dalam Open Food Facts", "No nutrition for this product in Open Food Facts") + '</b><div class="mut small">' + E(m.code) + (m.name ? ' · ' + E(m.name) : '') + '. ' + L("Taip nilai dari label (sehidangan):", "Type the label values (per serving):") + '</div>' +
  '<input id="klMn" class="rin" placeholder="' + L("Nama produk", "Product name") + '" value="' + E(m.name || "") + '"><input id="klMs" class="rin" placeholder="' + L("Hidangan, cth. 1 bungkus 30 g", "Serving, e.g. 1 pack 30 g") + '" style="margin-top:6px"><div class="klG4"><label>kcal<input id="klMk" type="number" class="rin"></label><label>Protein g<input id="klMp" type="number" class="rin"></label><label>' + L("Karbo g", "Carbs g") + '<input id="klMc" type="number" class="rin"></label><label>' + L("Lemak g", "Fat g") + '<input id="klMf" type="number" class="rin"></label></div><button class="btn gold full" data-ak="savemiss" style="margin-top:8px">' + L("Simpan produk & pilih", "Save the product & pick it") + '</button></div>'; }
function aiReviewHtml(){ var it = A.ai.items;
  return '<div class="small">' + L("Semak setiap baris. Betulkan berat atau kcal, nyahtanda yang salah.", "Check every line. Fix grams or kcal, untick what is wrong.") + '</div>' + it.map(function(x, i){ return '<div class="klAi' + (x.flag ? ' flag' : '') + '"><label><input type="checkbox" data-ai="' + i + '"' + (x.on !== false ? " checked" : "") + '> <b>' + E(x.n) + '</b>' + (x.flag ? '<small class="klFlag">⚠ ' + E(x.flag) + '</small>' : '') + '</label><span><input type="number" class="rin" data-aig="' + i + '" value="' + (x.g || "") + '" aria-label="g">g<input type="number" class="rin" data-aik="' + i + '" value="' + x.kcal + '" aria-label="kcal">kcal</span></div>'; }).join("") +
    '<button class="btn gold full" data-ak="aiadd" style="margin-top:10px">' + L("Rekod yang ditanda", "Log the ticked items") + '</button><div class="mut tiny" style="margin-top:6px">' + E(A.ai.via || "") + '</div>'; }
function bindSheet(ov){ var q = function(s){ return ov.querySelector(s); };
  ov.querySelectorAll("[data-at]").forEach(function(b){ b.onclick = function(){ A.tab = b.getAttribute("data-at"); A.miss = null; var g = goal() || {}; g.tab = A.tab; setGoal(g); drawSheet(); }; });
  var qi = q("#klQ"); if(qi){ qi.oninput = function(){ A.q = qi.value; var r = q(".klRes"), res = search(A.q); r.innerHTML = res.map(resRow).join("") + (A.q && !res.length ? '<div class="mut small" style="padding:10px 2px">' + L("Tiada padanan. Cuba ✍️ Pantas, atau imbas kod bar.", "No match. Try ✍️ Quick, or scan the barcode.") + '</div>' : ''); var cs = q(".klCats"); if(cs) cs.style.display = A.q ? "none" : ""; bindPicks(ov); }; if(!A.pick) setTimeout(function(){ try{ qi.focus(); }catch(e){} }, 150); }
  ov.querySelectorAll("[data-cat]").forEach(function(b){ b.onclick = function(){ var c = b.getAttribute("data-cat"), r = q(".klRes"); r.innerHTML = DB().rows.filter(function(x){ return x.cat === c; }).map(function(x){ return resRow(food(x)); }).join(""); bindPicks(ov); }; });
  bindPicks(ov);
  ov.querySelectorAll("[data-q]").forEach(function(b){ b.onclick = function(){ A.qty = r1(+b.getAttribute("data-q") * 100) / 100; drawSheet(); }; });
  ov.querySelectorAll("[data-qs]").forEach(function(b){ b.onclick = function(){ var d = +b.getAttribute("data-qs"), v = A.qty; v = d > 0 ? (v < 1 ? v + 0.25 : v + 0.5) : (v <= 1 ? v - 0.25 : v - 0.5); A.qty = Math.max(0.25, Math.round(v * 100) / 100); drawSheet(); }; });
  ov.querySelectorAll("[data-sl]").forEach(function(b){ b.onclick = function(){ A.slot = b.getAttribute("data-sl"); drawSheet(); }; });
  ov.querySelectorAll("[data-ak]").forEach(function(b){ b.onclick = function(){ sheetAct(b.getAttribute("data-ak"), ov); }; });
  var ph = q("#klPh"); if(ph) ph.onchange = function(){ var f = ph.files && ph.files[0]; if(f) photo(f, ph._mode || "meal"); ph.value = ""; }; }
function bindPicks(ov){ ov.querySelectorAll("[data-pick]").forEach(function(b){ b.onclick = function(){ var f = findFood(b.getAttribute("data-pick")); if(!f) return; A.pick = f; A.qty = 1; drawSheet(); }; }); }
function sheetAct(a, ov){ var q = function(s){ return ov.querySelector(s); };
  if(a === "back"){ A.pick = null; drawSheet(); return; }
  if(a === "add"){ var e = entry(A.pick, A.qty, A.slot), k = V.d, cur = dayLog(k); cur.push(e); setDay(k, cur); H.closeOverlay(); A.pick = null; undoBar(e.n.split(" · ")[0] + " · " + e.kcal + " kcal", function(){ setDay(k, dayLog(k).filter(function(x){ return x.id !== e.id; })); }); redraw(); return; }
  if(a === "fav"){ var fs = favs(), f = A.pick, i = -1; fs.forEach(function(x, j){ if(x.id === f.id) i = j; }); if(i >= 0) fs.splice(i, 1); else { var c = JSON.parse(JSON.stringify(f)); c.src = c.src === "db" ? "db" : c.src; fs.unshift(c); } H.save(FAV, fs.slice(0, 60)); drawSheet(); return; }
  if(a === "quick"){ var kc = +q("#klQk").value; if(!(kc > 0)){ H.toast(L("Masukkan kcal", "Enter the kcal")); return; } var qf = {id:"", n:q("#klQn").value.trim() || L("Tambahan pantas", "Quick add"), por:"", kcal:Math.round(kc), p:+q("#klQp").value || 0, c:+q("#klQc").value || 0, f:+q("#klQf").value || 0, fb:0, su:0, na:0, hal:"?", src:"quick"}; A.pick = qf; sheetAct("add", ov); return; }
  if(a === "scan"){ if(!window.HalalBarcode){ H.toast(L("Pengimbas tidak tersedia", "Scanner not available")); return; } H.closeOverlay(); HalalBarcode.scan(H, function(code){ lookupCode(code); }); return; }
  if(a === "savemiss"){ var kc2 = +q("#klMk").value, nm = q("#klMn").value.trim(); if(!(kc2 > 0) || !nm){ H.toast(L("Isi nama dan kcal", "Fill in the name and kcal")); return; }
    var mf = {id:"b_" + A.miss.code, code:A.miss.code, n:nm, por:q("#klMs").value.trim() || L("1 hidangan", "1 serving"), kcal:Math.round(kc2), p:+q("#klMp").value || 0, c:+q("#klMc").value || 0, f:+q("#klMf").value || 0, fb:0, su:0, na:0, hal:A.miss.hal || "?", src:"my"};
    var my = mine(); my[A.miss.code] = mf; H.save(MY, my); A.miss = null; A.pick = mf; A.qty = 1; drawSheet(); return; }
  if(a === "meal" || a === "label"){ var ph = q("#klPh"); ph._mode = a; ph.click(); return; }
  if(a === "aiadd"){ var k2 = V.d, cur2 = dayLog(k2), n = 0; ov.querySelectorAll("[data-ai]").forEach(function(cb){ var i = +cb.getAttribute("data-ai"), x = A.ai.items[i]; if(!cb.checked) return; var kc3 = +ov.querySelector('[data-aik="' + i + '"]').value || x.kcal, g = +ov.querySelector('[data-aig="' + i + '"]').value || x.g, r = x.kcal ? kc3 / x.kcal : 1;
      cur2.push({id:uid(), n:x.n, por:g ? g + " g" : "", g:g, q:1, kcal:Math.round(kc3), p:r1(x.p * r), c:r1(x.c * r), f:r1(x.f * r), fb:r1((x.fb || 0) * r), su:r1((x.su || 0) * r), na:Math.round((x.na || 0) * r), slot:A.slot, hal:x.flag ? "S" : "?", src:"ai", t:Date.now()}); n++; });
    setDay(k2, cur2); H.closeOverlay(); A.ai = null; undoBar(n + L(" item dari gambar", " items from the photo"), function(){ setDay(k2, cur2.slice(0, cur2.length - n)); }); redraw(); return; } }
function lookupCode(code){ var my = mine(); if(my[code]){ A.tab = "kod"; A.pick = my[code]; A.qty = 1; drawSheet(); return; }
  H.toast(L("Mencari ", "Looking up ") + code + "…");
  HalalBarcode.lookup(H, code, function(r){ var verdict = null; if(r.found && r.ingr && window.HalalCheck){ try{ verdict = HalalCheck.analyse(r.ingr).verdict; }catch(e){} } if(verdict === "?" && r.halal) verdict = "H"; if(!verdict && r.halal) verdict = "H";
    if(r.error){ H.toast(L("Tiada internet", "No internet")); return; }
    var f = r.found ? fromOff(r, verdict) : null; A.tab = "kod";
    if(!f){ A.miss = {code:code, name:r.found ? ((r.name || "") + (r.brand ? " · " + r.brand : "")) : "", hal:verdict || "?"}; A.pick = null; drawSheet(); return; }
    A.found = f; A.pick = f; A.qty = 1; A.miss = null; drawSheet(); }); }
/** from the Halal › Semak page: the product just scanned goes straight to the add sheet */
function fromScan(p, verdict, h){ if(h) H = h; if(!H) return; if(!V.d) V.d = ymd(); A.slot = slotNow(V.d); A.tab = "kod";
  var f = p && p.found ? fromOff(p, verdict === "?" ? (p.halal ? "H" : "?") : verdict) : null;
  if(!f){ A.miss = {code:p && p.code || "", name:p && p.found ? ((p.name || "") + (p.brand ? " · " + p.brand : "")) : "", hal:verdict || "?"}; A.pick = null; drawSheet(); return; }
  A.found = f; A.pick = f; A.qty = 1; A.miss = null; drawSheet(); }
// ---------------- AI photo (meal or nutrition label) ----------------
function shrink(file){ return new Promise(function(ok, no){ var u = URL.createObjectURL(file), im = new Image(); im.onload = function(){ var m = 1280, k = Math.min(1, m / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok(c.toDataURL("image/jpeg", 0.85)); }; im.onerror = function(){ URL.revokeObjectURL(u); no(new Error("img")); }; im.src = u; }); }
function jsonIn(t){ var s = String(t || ""), a = s.indexOf("{"), b = s.lastIndexOf("}"); if(a < 0 || b < a) throw new Error("json"); return JSON.parse(s.slice(a, b + 1)); }
function photo(file, mode){ var AI = window.HalalAI; if(!AI || !AI.run){ A.ai = {err:L("AI tidak tersedia", "The AI is not available")}; drawSheet(); return; }
  A.ai = {busy:true, msg:mode === "label" ? L("AI sedang membaca label…", "The AI is reading the label…") : L("AI sedang memecahkan hidangan…", "The AI is breaking down the meal…")}; drawSheet();
  var prompt = mode === "label" ?
    'Read this food product photo. Return ONLY JSON: {"name":"product name","serving":"serving size text","serving_g":0,"kcal":0,"protein_g":0,"carbs_g":0,"fat_g":0,"fiber_g":0,"sugar_g":0,"sodium_mg":0,"ingredients":"full ingredient list as printed"}. Values per serving (if only per 100 g is printed, use 100 g as the serving). Use 0 when not shown.'
    : 'You are a nutrition assistant for Malaysian Muslims. Identify each food and drink in this meal photo, estimate the grams and the nutrition of what is visible. Flag anything that may not be halal or is doubtful (pork, lard, alcohol, mirin, wine, gelatin of unknown source, rum, etc.) in "flag" with a short reason, else "". Return ONLY JSON: {"items":[{"name":"food name in ' + (H.S.lang === "en" ? "English" : "Malay") + '","grams":0,"kcal":0,"protein_g":0,"carbs_g":0,"fat_g":0,"fiber_g":0,"sugar_g":0,"sodium_mg":0,"flag":""}]}';
  shrink(file).then(function(d){ return AI.run("kalori", [{role:"user", content:[{type:"text", text:prompt}, {type:"image_url", image_url:{url:d}}]}], {max_tokens:1500, L2:L, validate:jsonIn}); }).then(function(r){ var j = jsonIn(r.text);
    if(mode === "label"){ var hal = "?"; if(j.ingredients && window.HalalCheck){ try{ hal = HalalCheck.analyse(j.ingredients).verdict; }catch(e){} }
      var f = {id:"l_" + uid(), n:String(j.name || L("Produk berlabel", "Labelled product")), por:String(j.serving || L("1 hidangan", "1 serving")), g:+j.serving_g || null, kcal:Math.round(+j.kcal || 0), p:+j.protein_g || 0, c:+j.carbs_g || 0, f:+j.fat_g || 0, fb:+j.fiber_g || 0, su:+j.sugar_g || 0, na:Math.round(+j.sodium_mg || 0), hal:hal || "?", src:"my"};
      if(!f.kcal) throw new Error(L("Label nutrisi tidak dapat dibaca", "The nutrition label could not be read"));
      var my = mine(); my[f.id] = f; H.save(MY, my); A.ai = null; A.pick = f; A.qty = 1; drawSheet(); return; }
    var items = (j.items || []).map(function(x){ return {n:String(x.name || "?"), g:Math.round(+x.grams || 0), kcal:Math.round(+x.kcal || 0), p:+x.protein_g || 0, c:+x.carbs_g || 0, f:+x.fat_g || 0, fb:+x.fiber_g || 0, su:+x.sugar_g || 0, na:+x.sodium_mg || 0, flag:String(x.flag || "").trim()}; }).filter(function(x){ return x.kcal > 0; });
    if(!items.length) throw new Error(L("Tiada makanan dikenal pasti dalam gambar", "No food was recognised in the photo"));
    A.ai = {items:items, via:"✨ " + (r.provider || "AI") + " · " + L("anggaran AI, sila semak", "AI estimate, please check")}; drawSheet(); })
  .catch(function(e){ A.ai = {err:(e && e.message) || L("Tidak berjaya", "Did not work")}; drawSheet(); }); }

// ---------------- edit an entry: portion, move, copy to today, delete ----------------
function editSheet(id){ var k = V.d, list = dayLog(k), e = list.filter(function(x){ return x.id === id; })[0]; if(!e) return; var sl = slotsFor(k);
  var ov = H.showSheet("✎ " + E(e.n), '<div class="klPick">' + badge(e.hal) + '<div class="klNut"><div><b>' + e.kcal + '</b>kcal</div><div><b>' + e.p + 'g</b>protein</div><div><b>' + e.c + 'g</b>' + L("karbo", "carbs") + '</div><div><b>' + e.f + 'g</b>' + L("lemak", "fat") + '</div></div>' +
    (e.unit ? '<div class="klStep"><button class="chip" data-eq="-1">−</button><div><b>' + r1(e.q || 1) + ' × ' + E(e.por || L("hidangan", "serving")) + '</b></div><button class="chip" data-eq="1">＋</button></div>' : '<label class="small">kcal<input id="klEk" type="number" class="rin" value="' + e.kcal + '"></label>') +
    '<div class="klSec">' + L("Pindah ke", "Move to") + '</div><div class="klChips">' + sl.map(function(x){ return '<button class="chip' + (e.slot === x.k ? " on" : "") + '" data-em="' + x.k + '">' + x.ic + ' ' + E(L(x.ms, x.en)) + '</button>'; }).join("") + '</div>' +
    '<div class="btns" style="margin-top:10px">' + (k !== ymd() ? '<button class="btn alt" data-ea="copy">⧉ ' + L("Salin ke hari ini", "Copy to today") + '</button>' : '<button class="btn alt" data-ea="dup">⧉ ' + L("Salin", "Duplicate") + '</button>') + '<button class="btn delb" data-ea="del">🗑 ' + L("Padam", "Delete") + '</button></div><button class="btn gold full" data-ea="ok" style="margin-top:8px">' + L("Selesai", "Done") + '</button></div>');
  var save = function(){ setDay(k, list); };
  ov.querySelectorAll("[data-eq]").forEach(function(b){ b.onclick = function(){ var d = +b.getAttribute("data-eq"), q = e.q || 1; q = d > 0 ? (q < 1 ? q + 0.25 : q + 0.5) : (q <= 1 ? q - 0.25 : q - 0.5); e.q = Math.max(0.25, q); var s = scale(e.unit, e.q); for(var x in s) e[x] = s[x]; save(); H.closeOverlay(); editSheet(id); redraw(); }; });
  ov.querySelectorAll("[data-em]").forEach(function(b){ b.onclick = function(){ e.slot = b.getAttribute("data-em"); save(); H.closeOverlay(); redraw(); }; });
  ov.querySelectorAll("[data-ea]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-ea");
    if(a === "del"){ var keep = list.filter(function(x){ return x.id !== id; }); setDay(k, keep); H.closeOverlay(); undoBar(L("Dipadam", "Deleted"), function(){ setDay(k, list); }); redraw(); return; }
    if(a === "copy" || a === "dup"){ var t = a === "copy" ? ymd() : k, c = JSON.parse(JSON.stringify(e)); c.id = uid(); c.t = Date.now(); if(!slotsFor(t).some(function(s){ return s.k === c.slot; })) c.slot = slotNow(t); var l2 = a === "copy" ? dayLog(t) : list; l2.push(c); setDay(t, l2); H.closeOverlay(); H.toast("⧉ " + L("Disalin", "Copied")); redraw(); return; }
    var ek = ov.querySelector("#klEk"); if(ek && +ek.value > 0 && +ek.value !== e.kcal){ var r = +ek.value / Math.max(1, e.kcal); e.kcal = Math.round(+ek.value); ["p", "c", "f", "fb", "su"].forEach(function(x){ e[x] = r1((+e[x] || 0) * r); }); e.na = Math.round((+e.na || 0) * r); save(); }
    H.closeOverlay(); redraw(); }; }); }
// ---------------- target settings ----------------
function goalSheet(){ var g = goal() || {}, m = mifflin(g) || {}, DN = [L("Ahd", "Sun"), L("Isn", "Mon"), L("Sel", "Tue"), L("Rab", "Wed"), L("Kha", "Thu"), L("Jum", "Fri"), L("Sab", "Sat")], nm = g.names || {};
  var ov = H.showSheet("⚙ " + L("Sasaran & tetapan Kalori", "Kalori target & settings"), '<div class="klGoal">' + setupHtml() +
    '<label class="small">' + L("Sasaran harian (kcal)", "Daily target (kcal)") + '<input id="kgK" type="number" class="rin" value="' + (g.kcal || m.target || "") + '"></label><div class="mut tiny">' + (m.tdee ? L("Formula: BMR ", "Formula: BMR ") + m.bmr + ' · TDEE ' + m.tdee + (m.delta ? ' · ' + (m.delta > 0 ? "+" : "") + m.delta : '') : '') + '</div>' +
    '<details class="klDays"' + (g.days ? ' open' : '') + '><summary>' + L("Sasaran berbeza ikut hari (pilihan)", "Different targets by weekday (optional)") + '</summary><div class="klG7">' + DN.map(function(d, i){ return '<label>' + d + '<input type="number" class="rin" data-wd="' + i + '" value="' + E(g.days && g.days[i] || "") + '" placeholder="–"></label>'; }).join("") + '</div></details>' +
    '<label class="pdchk"><input type="checkbox" id="kgEx"' + (g.addEx ? " checked" : "") + '> ' + L("Tambah kalori senaman (Senaman) ke sasaran", "Add workout calories (Senaman) to the target") + '</label>' +
    '<details class="klDays"><summary>' + L("Nama slot makan", "Meal slot names") + '</summary><div class="klG4">' + [["pagi", "Sarapan"], ["tghr", "Tengah hari"], ["ptg", "Petang"], ["mlm", "Malam"], ["sahur", "Sahur"], ["iftar", "Iftar"], ["moreh", "Moreh"]].map(function(x){ return '<label>' + x[1] + '<input class="rin" data-nm="' + x[0] + '" value="' + E(nm[x[0]] || "") + '" placeholder="' + x[1] + '"></label>'; }).join("") + '</div></details>' +
    '<button class="btn gold full" data-gs="save" style="margin-top:10px">' + L("Simpan", "Save") + '</button><div class="btns" style="margin-top:6px"><button class="btn alt" data-gs="csv">⬇ ' + L("Eksport CSV", "Export CSV") + '</button></div></div>');
  ov.querySelector("[data-k=setgo]").onclick = function(){ act("setgo", null, ov); H.closeOverlay(); goalSheet(); };
  ov.querySelector('[data-gs="csv"]').onclick = exportCsv;
  ov.querySelector('[data-gs="save"]').onclick = function(){ var g2 = goal() || {}; var kc = +ov.querySelector("#kgK").value; if(kc >= 800 && kc <= 6000) g2.kcal = Math.round(kc);
    var ds = {}, any = false; ov.querySelectorAll("[data-wd]").forEach(function(i){ var v = +i.value; if(v >= 800){ ds[i.getAttribute("data-wd")] = Math.round(v); any = true; } }); if(any) g2.days = ds; else delete g2.days;
    g2.addEx = ov.querySelector("#kgEx").checked; var n2 = {}; ov.querySelectorAll("[data-nm]").forEach(function(i){ var v = i.value.trim(); if(v) n2[i.getAttribute("data-nm")] = v.slice(0, 20); }); g2.names = n2;
    setGoal(g2); H.closeOverlay(); redraw(); }; }
function exportCsv(){ var l = logAll(), rows = [["date", "slot", "food", "portion", "qty", "kcal", "protein_g", "carbs_g", "fat_g", "fibre_g", "sugar_g", "sodium_mg", "halal"]];
  Object.keys(l).sort().forEach(function(k){ (l[k] || []).forEach(function(e){ rows.push([k, e.slot, e.n, e.por || "", e.q || 1, e.kcal, e.p, e.c, e.f, e.fb || 0, e.su || 0, e.na || 0, e.hal]); }); });
  var csv = rows.map(function(r){ return r.map(function(v){ v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(","); }).join("\n"), name = "kalori-" + ymd() + ".csv";
  if(window.Native && H.N && H.N.openTextFile) H.N.openTextFile(name, "text/csv", csv, true);
  else { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"})); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
  H.toast("⬇ " + name); }
/** for the Home widget (app.js): today's eaten / target / halal count */
function today(h){ if(h) H = h; if(!H) return null; var g = goal(); if(!g || !g.kcal) return null; var k = ymd(), l = dayLog(k), t = sum(l); return {eaten:t.kcal, target:targetOn(g, k), n:l.length, halal:l.filter(function(e){ return e.hal === "H"; }).length}; }
window.Kalori = {html:html, bind:bind, fromScan:fromScan, today:today, _t:{mifflin:mifflin, scale:scale, sum:sum, ema:ema, adaptive:adaptive, macroT:macroT, slotsFor:function(k, h){ if(h) H = h; return slotsFor(k); }, slotNow:slotNow, search:function(q, h){ if(h) H = h; return search(q); }, fromOff:fromOff, sunnahFast:sunnahFast, V:V, A:A}};
})();
