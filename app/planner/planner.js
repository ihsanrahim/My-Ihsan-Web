/* My Ihsan 0.5.99 (owner): Time › Planner (was Month). The first chip, next to Gregorian and Hijri: a planner with Daily, Weekly, Monthly
   and Yearly lists. Tap a preset to fill a list in one go (Muslim day, work day, student, home; weekly sunnah; monthly; yearly goals),
   tick items off, add your own (daily items can have a time), and see progress: the week and month show each day's ticks.
   0.6.44 (owner): edit any item (tap it), repeat (every day, chosen days, weekly, monthly), move unfinished items to tomorrow / today,
   reminders at the item's time, times that follow the real prayer times ("10 min after Asar"), ⭐ add to Focus › Today's top 3,
   reorder, notes and sub-tasks, priority, search across all lists, share a list as text, Hijri date on the day.
   PlannerView.render(el, H)  H = finH() + prayerTimes, hijriStr, ymd. Data: ihsan_planner {d, w, m, y, rep:[rule], skip:{date:{rid:1}}}
   item {id, t, tm, pt ("asar+10"), done, note, sub:[{t, d}], pr:0|1|2, rem, rid (repeat rule), top}. Reminders: ihsan_plan_ex (buildExtras). */
(function(){ "use strict";
var H = null, root = null, KEY = "ihsan_planner", ST = {v:"d", off:0, q:""};
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function db(){ var d = H.load(KEY, null) || {}; ["d","w","m","y"].forEach(function(k){ d[k] = d[k] || {}; }); d.rep = d.rep || []; d.skip = d.skip || {}; return d; }
function save(d){ H.save(KEY, d); try{ sched(d); }catch(e){} }
function pad(n){ return ("0" + n).slice(-2); }
function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function dOf(k){ var p = String(k).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function addD(k, n){ var d = dOf(k); d.setDate(d.getDate() + n); return ymd(d); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function loc(){ return ibLoc(H.en()); }
function monday(d){ var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; }
// the period on screen: its key and label
function period(){ var n = new Date(), v = ST.v, o = ST.off, d, k, lb;
  if(v === "d"){ d = new Date(n.getFullYear(), n.getMonth(), n.getDate() + o); k = ymd(d); lb = d.toLocaleDateString(loc(), {weekday:"long", day:"numeric", month:"long"}); }
  else if(v === "w"){ d = monday(n); d.setDate(d.getDate() + 7 * o); k = ymd(d); var e = new Date(d); e.setDate(e.getDate() + 6); lb = d.getDate() + " – " + e.toLocaleDateString(loc(), {day:"numeric", month:"short"}); }
  else if(v === "m"){ d = new Date(n.getFullYear(), n.getMonth() + o, 1); k = d.getFullYear() + "-" + pad(d.getMonth() + 1); lb = d.toLocaleDateString(loc(), {month:"long", year:"numeric"}); }
  else { d = new Date(n.getFullYear() + o, 0, 1); k = String(d.getFullYear()); lb = k; }
  return {k:k, lb:lb, d:d, today:o === 0}; }
// ---------- prayer-time anchors ("asar+10" = 10 minutes after Asar on that day) ----------
var PRAY = [["subuh","Subuh","Fajr"],["syuruk","Syuruk","Sunrise"],["zohor","Zohor","Dhuhr"],["asar","Asar","Asr"],["maghrib","Maghrib","Maghrib"],["isyak","Isyak","Isha"]];
function prayAt(k, p){ var l = H.prayerTimes ? H.prayerTimes() : []; for(var i = 0; i < l.length; i++){ if(l[i].k === p && ymd(new Date(l[i].t)) === k) return l[i].t; } return 0; }
function ptParse(pt){ var m = /^([a-z]+)([+-]\d+)?$/.exec(pt || ""); return m ? {p:m[1], m:+(m[2] || 0)} : null; }
function ptLabel(pt){ var a = ptParse(pt); if(!a) return ""; var p = PRAY.filter(function(x){ return x[0] === a.p; })[0]; return (p ? L(p[1], p[2]) : a.p) + (a.m ? (a.m > 0 ? " +" : " ") + a.m + "m" : ""); }
function timeOf(x, k){ if(x.pt){ var a = ptParse(x.pt), t = a ? prayAt(k, a.p) : 0; if(t){ var d = new Date(t + a.m * 60000); return pad(d.getHours()) + ":" + pad(d.getMinutes()); } return ""; } return x.tm || ""; }
// ---------- repeat rules ----------
var RR = [["", "Tidak berulang", "Doesn't repeat"], ["d", "Setiap hari", "Every day"], ["wd", "Hari bekerja (Isn–Jum)", "Weekdays (Mon–Fri)"], ["s", "Hari dipilih", "Chosen days"], ["w", "Setiap minggu (hari ini)", "Every week (this day)"], ["m", "Setiap bulan (tarikh ini)", "Every month (this date)"]];
function DAYS(){ return L("Ahd,Isn,Sel,Rab,Kha,Jum,Sab", "Sun,Mon,Tue,Wed,Thu,Fri,Sat").split(","); }
function ruleHits(r, k){ if(k < r.from || (r.to && k > r.to)) return false; var d = dOf(k), w = d.getDay(), u = r.rule || {};
  if(u.t === "d") return true; if(u.t === "wd") return w >= 1 && w <= 5; if(u.t === "s") return (u.days || []).indexOf(w) >= 0;
  if(u.t === "w") return w === dOf(r.from).getDay(); if(u.t === "m") return d.getDate() === dOf(r.from).getDate(); return false; }
function ruleTxt(u){ if(!u || !u.t) return ""; if(u.t === "s") return (u.days || []).map(function(x){ return DAYS()[x]; }).join(" "); var r = RR.filter(function(x){ return x[0] === u.t; })[0]; return r ? L(r[1], r[2]) : ""; }
/** the daily list for k with this day's copies of repeating items added (only for today and later; past days keep what was there) */
function dayList(d, k, fill){ var l = d.d[k] = d.d[k] || [], sk = d.skip[k] || {}, add = 0;
  if(fill !== false && k >= ymd(new Date())) d.rep.forEach(function(r){ if(ruleHits(r, k) && !sk[r.rid] && !l.some(function(x){ return x.rid === r.rid; })){ l.push({id:uid(), t:r.t, tm:r.tm || "", pt:r.pt || "", rid:r.rid, rem:!!r.rem, pr:r.pr || 0, note:r.note || "", done:false}); add++; } });
  return {l:l, add:add}; }
function list(d, p){ if(ST.v === "d") return dayList(d, p.k).l; return (d[ST.v][p.k] = d[ST.v][p.k] || []); }
function prog(items){ var n = items.length, k = items.filter(function(x){ return x.done; }).length; return {n:n, k:k, pc:n ? Math.round(k * 100 / n) : 0}; }
// ---------- reminders (the next 8 days, repeats included) ----------
function sched(d){ var out = [], now = Date.now(), t0 = ymd(new Date());
  for(var i = 0; i < 8; i++){ var k = addD(t0, i), l = (d.d[k] || []).slice(), sk = d.skip[k] || {};
    d.rep.forEach(function(r){ if(r.rem && ruleHits(r, k) && !sk[r.rid] && !l.some(function(x){ return x.rid === r.rid; })) l.push({id:"r" + r.rid, t:r.t, tm:r.tm, pt:r.pt, rem:true, rid:r.rid}); });
    l.forEach(function(x){ if(!x.rem || x.done) return; var hm = timeOf(x, k); if(!hm) return; var p = hm.split(":"), at = dOf(k); at.setHours(+p[0], +p[1], 0, 0); if(at.getTime() > now) out.push({t:at.getTime(), id:"pl" + (x.rid || x.id) + k, title:"📝 " + x.t, body:(x.note || L("Masa untuk perkara ini.", "Time for this.")).slice(0, 140), open:"side:cal/bulan"}); }); }
  H.save("ihsan_plan_ex", out.sort(function(a, b){ return a.t - b.t; }).slice(0, 80)); try{ if(H.resched) H.resched(); }catch(e){} }
// ---------- presets ----------
var PRE = {
  d:[["muslim","🕌",["Hari Muslim","Muslim day"],[["@subuh",["Subuh berjemaah","Subuh in congregation"]],["@subuh+25",["Ma'thurat pagi","Morning Ma'thurat"]],["@subuh+40",["Baca 1 muka surat al-Quran","Read 1 page of the Quran"]],["@syuruk+20",["Solat Dhuha","Dhuha prayer"]],["@zohor",["Zohor","Zohor"]],["@asar",["Asar","Asar"]],["@asar+60",["Ma'thurat petang","Evening Ma'thurat"]],["@maghrib",["Maghrib","Maghrib"]],["@isyak",["Isyak","Isha"]],["@isyak+60",["Tidur awal","Sleep early"]]]],
       ["work","💼",["Hari bekerja","Work day"],[["08:30",["Rancang hari ini","Plan the day"]],["09:00",["Kerja fokus 2 jam","2 hours of focused work"]],["12:30",["Makan & Zohor","Lunch & Zohor"]],["14:00",["Balas emel & mesyuarat","Emails & meetings"]],["17:30",["Senaman 30 minit","Exercise 30 minutes"]],["20:30",["Masa keluarga","Family time"]]]],
       ["study","🎓",["Pelajar","Student"],[["15:00",["Siapkan kerja rumah","Finish homework"]],["16:00",["Ulang kaji 1 subjek","Revise 1 subject"]],["17:00",["Main di luar","Play outside"]],["20:30",["Baca buku 20 minit","Read 20 minutes"]],["21:00",["Mengaji","Quran reading"]],["22:00",["Tidur awal","Sleep early"]]]],
       ["home","🏠",["Rumah","Home chores"],[["",["Beli barang dapur","Groceries"]],["",["Masak","Cooking"]],["",["Basuh baju","Laundry"]],["",["Kemas rumah","Tidy the house"]],["",["Bayar bil","Pay bills"]]]]],
  w:[["sunnah","🌙",["Sunnah mingguan","Weekly sunnah"],[["",["Puasa Isnin","Monday fast"]],["",["Puasa Khamis","Thursday fast"]],["",["Surah al-Kahfi hari Jumaat","Surah al-Kahf on Friday"]],["",["Sedekah","Give charity"]],["",["Ziarah keluarga","Visit family"]]]],
       ["health","💪",["Kesihatan","Health"],[["",["Senaman 3 kali","Exercise 3 times"]],["",["Sediakan makanan seminggu","Meal prep"]],["",["Tidur 7 jam setiap malam","Sleep 7 hours a night"]],["",["Kurangkan gula","Less sugar"]]]],
       ["work","💼",["Kerja","Work"],[["",["Senarai keutamaan minggu ini","This week's priorities"]],["",["Semak kewangan","Check money"]],["",["Belajar perkara baharu","Learn something new"]]]]],
  m:[["ibadah","🕋",["Ibadah bulanan","Monthly worship"],[["",["Khatam 1 juzuk al-Quran","Finish 1 juz of the Quran"]],["",["Puasa Ayyamul Bidh (13-15)","Ayyamul Bidh fasts (13-15)"]],["",["Ziarah ibu bapa","Visit parents"]],["",["Hadiri kuliah","Attend a class"]]]],
       ["money","💰",["Kewangan","Money"],[["",["Bayar bil & komitmen","Pay bills & commitments"]],["",["Simpan 10% gaji","Save 10% of salary"]],["",["Semak bajet","Review the budget"]],["",["Sedekah bulanan","Monthly charity"]]]]],
  y:[["goals","🎯",["Matlamat tahunan","Yearly goals"],[["",["Khatam al-Quran","Finish the whole Quran"]],["",["Bayar zakat","Pay zakat"]],["",["Simpan untuk haji / umrah","Save for Hajj / Umrah"]],["",["Ibadah korban","Qurban"]],["",["Pemeriksaan kesihatan","Health check-up"]],["",["Cuti bersama keluarga","Family holiday"]],["",["Belajar kemahiran baharu","Learn a new skill"]]]]]};
function strip(d, p){ // week: 7 days; month: every day; year: 12 months, each from the daily lists
  var cells = [], lab = [];
  if(ST.v === "w"){ for(var i = 0; i < 7; i++){ var x = new Date(p.d); x.setDate(x.getDate() + i); cells.push(prog(d.d[ymd(x)] || [])); lab.push(x.toLocaleDateString(loc(), {weekday:"narrow"})); } }
  else if(ST.v === "m"){ var nd = new Date(p.d.getFullYear(), p.d.getMonth() + 1, 0).getDate(); for(var j = 1; j <= nd; j++){ cells.push(prog(d.d[p.k + "-" + pad(j)] || [])); lab.push(j % 5 === 1 ? String(j) : ""); } }
  else if(ST.v === "y"){ for(var m = 0; m < 12; m++){ var all = []; Object.keys(d.d).forEach(function(k){ if(k.slice(0, 7) === p.k + "-" + pad(m + 1)) all = all.concat(d.d[k]); }); cells.push(prog(all)); lab.push(new Date(2000, m, 1).toLocaleDateString(loc(), {month:"narrow"})); } }
  if(!cells.length) return "";
  return '<div class="plStrip' + (ST.v === "m" ? ' many' : '') + '">' + cells.map(function(c, i){ return '<span title="' + c.k + '/' + c.n + '"><i style="height:' + Math.max(c.n ? 6 : 2, c.pc) + '%;' + (c.n ? '' : 'opacity:.3') + '"></i><small>' + E(lab[i]) + '</small></span>'; }).join("") + '</div><div class="mut tiny">' + L("Setiap bar: tanda siap dalam senarai harian.", "Each bar: ticks in the daily lists.") + '</div>'; }
function sorted(items, k){ var t = items.map(function(x, i){ return {x:x, i:i, tm:ST.v === "d" ? timeOf(x, k) : ""}; });
  t.sort(function(a, b){ var A = a.tm || "99", B = b.tm || "99"; if(A !== B) return A < B ? -1 : 1; if((b.x.pr || 0) !== (a.x.pr || 0)) return (b.x.pr || 0) - (a.x.pr || 0); return a.i - b.i; }); return t; }
function topKeys(k){ var g = H.load("ihsan_grow", null), t = g && g.day && g.day[k] && g.day[k].top || []; return t.filter(Boolean).map(function(x){ return x.t; }); }
// ---------- page ----------
function draw(){ if(!root) return; var d = db(), p = period(), filled = ST.v === "d" ? dayList(d, p.k).add : 0, items = list(d, p), g = prog(items);
  if(filled) save(d);
  var V = [["d", L("Harian", "Daily")], ["w", L("Mingguan", "Weekly")], ["m", L("Bulanan", "Monthly")], ["y", L("Tahunan", "Yearly")]], tops = ST.v === "d" ? topKeys(p.k) : [];
  var hj = ""; try{ if(ST.v === "d" && H.hijri && H.hijriStr) hj = H.hijriStr(H.hijri(p.d)); }catch(e){}
  var undone = items.filter(function(x){ return !x.done && !x.rid; }).length, todayK = ymd(new Date());
  var h = '<div class="card plC"><div class="plSeg">' + V.map(function(v){ return '<button class="chip g3d' + (ST.v === v[0] ? ' on' : '') + '" data-pv="' + v[0] + '">' + v[1] + '</button>'; }).join("") + '</div>' +
    '<div class="plNav"><button class="chip g3d" data-po="-1">‹</button><div><b>' + E(p.lb) + '</b>' + (hj ? '<small class="mut plHj">' + E(hj) + '</small>' : '') + (p.today ? '' : '<button class="linkb" data-po="0">' + L("Hari ini", "Today") + '</button>') + '</div><button class="chip g3d" data-po="1">›</button></div>' +
    '<div class="plProg"><span><i style="width:' + g.pc + '%"></i></span><b>' + g.k + '/' + g.n + '</b></div>' +
    (items.length ? '<div class="plList">' + sorted(items, p.k).map(function(o){ var x = o.x, sb = (x.sub || []), sd = sb.filter(function(s){ return s.d; }).length;
        return '<div class="plRow' + (x.done ? ' done' : '') + (x.pr === 2 ? ' hi' : x.pr === 1 ? ' mid' : '') + '"><button class="plTk" data-pt="' + x.id + '">' + (x.done ? '✓' : '') + '</button>' + (ST.v === "d" && o.tm ? '<span class="plTm">' + E(o.tm) + '</span>' : '') +
          '<span class="plTx" data-pe="' + x.id + '">' + E(x.t) + '<small>' + [x.pt ? '🕌 ' + E(ptLabel(x.pt)) : '', x.rid ? '🔁' : '', x.rem ? '⏰' : '', sb.length ? '☑ ' + sd + '/' + sb.length : '', x.note ? '📝' : ''].filter(Boolean).join(' ') + '</small></span>' +
          (ST.v === "d" && tops.indexOf(x.t) >= 0 ? '<span class="plStar" title="Top 3">⭐</span>' : '') + '<button class="plX" data-px="' + x.id + '">✕</button></div>'; }).join("") + '</div>'
      : '<div class="mut small plEmpty">' + L("Kosong. Pilih satu pratetap di bawah, atau tambah sendiri.", "Empty. Pick a preset below, or add your own.") + '</div>') +
    (ST.v === "d" && undone && p.k <= todayK ? '<button class="chip g3d plCarry" id="plCar">↪ ' + (p.k < todayK ? L("Pindah " + undone + " yang belum siap ke hari ini", "Move " + undone + " unfinished to today") : L("Pindah " + undone + " yang belum siap ke esok", "Move " + undone + " unfinished to tomorrow")) + '</button>' : '') +
    '<div class="plAdd">' + (ST.v === "d" ? '<input type="time" id="plTm" class="rin">' : '') + '<input id="plIn" class="rin" placeholder="' + L("Tambah perkara…", "Add something…") + '"><button class="btn gold g3d" id="plGo">＋</button></div>' +
    '<div class="plPre"><span class="mut tiny">' + L("Pratetap:", "Presets:") + '</span>' + PRE[ST.v].map(function(x){ return '<button class="chip g3d" data-pp="' + x[0] + '">' + x[1] + ' ' + E(L(x[2][0], x[2][1])) + '</button>'; }).join("") + '</div>' +
    (ST.v !== "d" ? strip(d, p) : '') +
    '<div class="plTools"><input id="plQ" class="rin" placeholder="🔎 ' + L("Cari semua senarai", "Search all lists") + '" value="' + E(ST.q) + '"><button class="chip g3d" id="plSh" aria-label="' + L("Kongsi", "Share") + '">📤</button></div><div id="plRes"></div>' +
    (ST.v === "d" ? '<div class="mut tiny" style="margin-top:6px">' + L("Ketik perkara untuk ubah: masa ikut waktu solat, ulang, peringatan, nota, sub-tugas, ⭐ 3 utama Fokus.", "Tap an item to edit: prayer-based time, repeat, reminder, notes, sub-tasks, ⭐ Focus top 3.") + '</div>' : '') + '</div>';
  root.innerHTML = h; bind(); if(ST.q) search(); }
function search(){ var r = root.querySelector("#plRes"), q = ST.q.trim().toLowerCase(); if(!r) return; if(!q){ r.innerHTML = ""; return; } var d = db(), hits = [];
  [["d", L("Hari", "Day")], ["w", L("Minggu", "Week")], ["m", L("Bulan", "Month")], ["y", L("Tahun", "Year")]].forEach(function(v){ Object.keys(d[v[0]]).sort().reverse().forEach(function(k){ (d[v[0]][k] || []).forEach(function(x){ if((x.t + " " + (x.note || "")).toLowerCase().indexOf(q) >= 0) hits.push({v:v, k:k, x:x}); }); }); });
  r.innerHTML = hits.length ? '<div class="plHits">' + hits.slice(0, 40).map(function(o){ return '<button class="plHit" data-hv="' + o.v[0] + '" data-hk="' + o.k + '"><span>' + (o.x.done ? '✓ ' : '') + E(o.x.t) + '</span><small>' + E(o.v[1] + " · " + o.k) + '</small></button>'; }).join("") + '</div>' : '<div class="mut small">' + L("Tiada padanan", "No matches") + '</div>';
  r.querySelectorAll("[data-hv]").forEach(function(b){ b.onclick = function(){ var v = b.getAttribute("data-hv"), k = b.getAttribute("data-hk"), now = new Date(), o = 0;
    if(v === "d") o = Math.round((dOf(k) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5); else if(v === "w") o = Math.round((dOf(k) - monday(now)) / (7 * 864e5)); else if(v === "m"){ var a = k.split("-"); o = (+a[0] - now.getFullYear()) * 12 + (+a[1] - 1 - now.getMonth()); } else o = +k - now.getFullYear();
    ST.v = v; ST.off = o; ST.q = ""; draw(); }; }); }
function bind(){ var q = function(s){ return root.querySelector(s); };
  root.querySelectorAll("[data-pv]").forEach(function(b){ b.onclick = function(){ ST.v = b.getAttribute("data-pv"); ST.off = 0; H.save(KEY + "_v", ST.v); draw(); }; });
  root.querySelectorAll("[data-po]").forEach(function(b){ b.onclick = function(){ var k = +b.getAttribute("data-po"); ST.off = k ? ST.off + k : 0; draw(); }; });
  var edit = function(fn){ var d = db(), p = period(), l = list(d, p); fn(l, d, p); save(d); draw(); };
  root.querySelectorAll("[data-pt]").forEach(function(b){ b.onclick = function(){ var id = b.getAttribute("data-pt"); edit(function(l, d, p){ l.forEach(function(x){ if(x.id === id){ x.done = !x.done; syncTop(p.k, x); if(x.done && x.sub) x.sub.forEach(function(s){ s.d = true; }); } }); }); }; });
  root.querySelectorAll("[data-px]").forEach(function(b){ b.onclick = function(){ var id = b.getAttribute("data-px"), d = db(), p = period(), x = list(d, p).filter(function(y){ return y.id === id; })[0]; if(x) del(x, d, p); }; });
  root.querySelectorAll("[data-pe]").forEach(function(b){ b.onclick = function(){ var id = b.getAttribute("data-pe"); itemSheet(id); }; });
  var add = function(){ var t = q("#plIn").value.trim(); if(!t){ q("#plIn").focus(); return; } var tm = q("#plTm") ? q("#plTm").value : ""; edit(function(l){ l.push({id:uid(), t:t, tm:tm, done:false}); }); var ni = root.querySelector("#plIn"); if(ni) ni.focus(); };
  q("#plGo").onclick = add; q("#plIn").onkeydown = function(e){ if(e.key === "Enter") add(); };
  root.querySelectorAll("[data-pp]").forEach(function(b){ b.onclick = function(){ var pr = PRE[ST.v].filter(function(x){ return x[0] === b.getAttribute("data-pp"); })[0]; if(!pr) return; var n = 0;
    edit(function(l){ pr[3].forEach(function(it){ var t = L(it[1][0], it[1][1]); if(l.some(function(x){ return x.t === t; })) return; var a = it[0].charAt(0) === "@" ? it[0].slice(1) : ""; l.push({id:uid(), t:t, tm:a ? "" : it[0], pt:a, done:false}); n++; }); });
    H.toast(n ? "✓ " + n + L(" perkara ditambah", " items added") : L("Sudah ada dalam senarai", "Already in the list")); }; });
  var car = q("#plCar"); if(car) car.onclick = function(){ var d = db(), p = period(), t = ymd(new Date()), to = p.k < t ? t : addD(p.k, 1), src = d.d[p.k] || [], dst = dayList(d, to).l, n = 0;
    d.d[p.k] = src.filter(function(x){ if(x.done || x.rid) return true; dst.push(x); n++; return false; }); save(d); H.toast("↪ " + n + " " + L("dipindah", "moved")); draw(); };
  var qi = q("#plQ"); qi.oninput = function(){ ST.q = qi.value; search(); };
  q("#plSh").onclick = function(){ var d = db(), p = period(), l = list(d, p), txt = "📝 " + p.lb + "\n" + sorted(l, p.k).map(function(o){ return (o.x.done ? "✅ " : "⬜ ") + (o.tm ? o.tm + " " : "") + o.x.t + (o.x.sub && o.x.sub.length ? "\n" + o.x.sub.map(function(s){ return "   " + (s.d ? "☑" : "☐") + " " + s.t; }).join("\n") : ""); }).join("\n") + "\n— My Ihsan";
    if(H.N && H.N.shareText) H.N.shareText(txt); else if(navigator.clipboard) navigator.clipboard.writeText(txt).then(function(){ H.toast(L("Disalin", "Copied")); }); }; }
/** delete: a repeating item asks "this day only" or "this and later days" */
function del(x, d, p){ var rm = function(){ var l = list(d, p); for(var i = l.length - 1; i >= 0; i--) if(l[i].id === x.id) l.splice(i, 1); };
  if(ST.v === "d" && x.rid){ var ov = H.showSheet("🔁 " + E(x.t), '<div class="btns" style="flex-direction:column;gap:8px"><button class="btn alt full" id="pdOne">' + L("Hari ini sahaja", "This day only") + '</button><button class="btn alt full" id="pdAll">' + L("Hari ini dan seterusnya", "This and later days") + '</button></div>');
    ov.querySelector("#pdOne").onclick = function(){ d.skip[p.k] = d.skip[p.k] || {}; d.skip[p.k][x.rid] = 1; rm(); save(d); H.closeOverlay(); draw(); };
    ov.querySelector("#pdAll").onclick = function(){ d.rep.forEach(function(r){ if(r.rid === x.rid) r.to = addD(p.k, -1); }); Object.keys(d.d).forEach(function(k){ if(k >= p.k) d.d[k] = (d.d[k] || []).filter(function(y){ return y.rid !== x.rid || y.done; }); }); save(d); H.closeOverlay(); draw(); }; return; }
  rm(); save(d); draw(); }
/** keep Focus › Today's top 3 ticked the same as the planner item */
function syncTop(k, x){ var g = H.load("ihsan_grow", null); if(!g || !g.day || !g.day[k] || !g.day[k].top) return; g.day[k].top.forEach(function(t){ if(t && t.t === x.t) t.d = !!x.done; }); H.save("ihsan_grow", g); }
function toTop(k, x){ var g = H.load("ihsan_grow", null) || {}; g.day = g.day || {}; var dd = g.day[k] = g.day[k] || {}; dd.top = dd.top || [];
  if(dd.top.some(function(t){ return t && t.t === x.t; })){ dd.top = dd.top.map(function(t){ return t && t.t === x.t ? null : t; }); H.save("ihsan_grow", g); return 0; }
  for(var i = 0; i < 3; i++) if(!dd.top[i]){ dd.top[i] = {t:x.t, d:!!x.done}; H.save("ihsan_grow", g); return 1; }
  return -1; }
function itemSheet(id){ var d = db(), p = period(), l = list(d, p), x = l.filter(function(y){ return y.id === id; })[0]; if(!x) return;
  var r = x.rid ? d.rep.filter(function(z){ return z.rid === x.rid; })[0] : null, rule = r ? JSON.parse(JSON.stringify(r.rule)) : {t:""}, pa = ptParse(x.pt), isD = ST.v === "d";
  x.sub = x.sub || [];
  var ov = H.showSheet("✏️ " + L("Ubah", "Edit"), '<input id="peT" class="rin" value="' + E(x.t) + '">' +
    (isD ? '<div class="plQ">' + L("Masa", "Time") + '</div><div class="rseg"><button class="chip' + (!pa ? ' on' : '') + '" data-tk="clock">🕘 ' + L("Jam", "Clock") + '</button><button class="chip' + (pa ? ' on' : '') + '" data-tk="pray">🕌 ' + L("Ikut waktu solat", "By prayer time") + '</button></div>' +
      '<div id="peClock"' + (pa ? ' style="display:none"' : '') + '><input type="time" id="peTm" class="rin" value="' + E(x.tm || "") + '"></div>' +
      '<div id="pePray" class="plPt"' + (pa ? '' : ' style="display:none"') + '><select id="peP" class="rin">' + PRAY.map(function(z){ return '<option value="' + z[0] + '"' + (pa && pa.p === z[0] ? ' selected' : '') + '>' + E(L(z[1], z[2])) + '</option>'; }).join("") + '</select><select id="peM" class="rin">' + [-30, -15, -10, -5, 0, 5, 10, 15, 20, 30, 45, 60, 90, 120].map(function(m){ return '<option value="' + m + '"' + ((pa ? pa.m : 0) === m ? ' selected' : '') + '>' + (m < 0 ? m + " min " + L("sebelum", "before") : m ? "+" + m + " min " + L("selepas", "after") : L("tepat waktu", "on time")) + '</option>'; }).join("") + '</select></div>' +
      '<div class="plQ">🔁 ' + L("Ulang", "Repeat") + '</div><select id="peR" class="rin">' + RR.map(function(z){ return '<option value="' + z[0] + '"' + (rule.t === z[0] ? ' selected' : '') + '>' + E(L(z[1], z[2])) + '</option>'; }).join("") + '</select><div id="peDays" class="rseg"' + (rule.t === "s" ? '' : ' style="display:none"') + '>' + DAYS().map(function(n, i){ return '<button class="chip' + ((rule.days || []).indexOf(i) >= 0 ? ' on' : '') + '" data-dy="' + i + '">' + n + '</button>'; }).join("") + '</div>' +
      '<label class="pdchk"><input type="checkbox" id="peRem"' + (x.rem ? ' checked' : '') + '> ⏰ ' + L("Peringatan pada masa ini", "Remind me at this time") + '</label>' : '') +
    '<div class="plQ">' + L("Keutamaan", "Priority") + '</div><div class="rseg">' + [[0, L("Biasa", "Normal")], [1, "🟡 " + L("Penting", "Important")], [2, "🔴 " + L("Sangat penting", "Urgent")]].map(function(z){ return '<button class="chip' + ((x.pr || 0) === z[0] ? ' on' : '') + '" data-pr="' + z[0] + '">' + z[1] + '</button>'; }).join("") + '</div>' +
    '<div class="plQ">☑ ' + L("Sub-tugas", "Sub-tasks") + '</div><div id="peSub"></div><div class="radd"><input id="peSn" class="rin" placeholder="' + E(L("cth. beras, minyak, telur", "e.g. rice, oil, eggs")) + '"><button class="btn alt" id="peSa">＋</button></div>' +
    '<div class="plQ">📝 ' + L("Nota", "Note") + '</div><textarea id="peN" class="rin" rows="2">' + E(x.note || "") + '</textarea>' +
    '<div class="btns" style="margin-top:10px;flex-wrap:wrap"><button class="btn gold" id="peS">' + L("Simpan", "Save") + '</button>' + (isD ? '<button class="btn alt" id="peTop">⭐ ' + L("3 utama", "Top 3") + '</button>' : '') + '<button class="btn alt" id="peUp">▲</button><button class="btn alt" id="peDn">▼</button>' + (isD ? '<input type="date" id="peMv" class="rin" style="max-width:150px" title="' + E(L("Pindah ke tarikh", "Move to date")) + '">' : '') + '</div>');
  var pr = x.pr || 0, sub = x.sub.slice(), drawSub = function(){ ov.querySelector("#peSub").innerHTML = sub.map(function(s, i){ return '<label class="pdchk"><input type="checkbox" data-sb="' + i + '"' + (s.d ? ' checked' : '') + '> ' + E(s.t) + ' <button class="chip" data-sx="' + i + '" style="margin-left:auto">✕</button></label>'; }).join("");
    ov.querySelectorAll("[data-sb]").forEach(function(c){ c.onchange = function(){ sub[+c.getAttribute("data-sb")].d = c.checked; }; }); ov.querySelectorAll("[data-sx]").forEach(function(c){ c.onclick = function(e){ e.preventDefault(); sub.splice(+c.getAttribute("data-sx"), 1); drawSub(); }; }); };
  drawSub(); ov.querySelector("#peSa").onclick = function(){ var v = ov.querySelector("#peSn").value.trim(); if(!v) return; v.split(/,\s*/).forEach(function(s){ if(s) sub.push({t:s, d:false}); }); ov.querySelector("#peSn").value = ""; drawSub(); };
  ov.querySelectorAll("[data-pr]").forEach(function(b){ b.onclick = function(){ pr = +b.getAttribute("data-pr"); ov.querySelectorAll("[data-pr]").forEach(function(y){ y.classList.toggle("on", y === b); }); }; });
  ov.querySelectorAll("[data-tk]").forEach(function(b){ b.onclick = function(){ var pr_ = b.getAttribute("data-tk") === "pray"; ov.querySelectorAll("[data-tk]").forEach(function(y){ y.classList.toggle("on", y === b); }); ov.querySelector("#peClock").style.display = pr_ ? "none" : ""; ov.querySelector("#pePray").style.display = pr_ ? "" : "none"; }; });
  var rs = ov.querySelector("#peR"); if(rs) rs.onchange = function(){ rule.t = rs.value; ov.querySelector("#peDays").style.display = rule.t === "s" ? "" : "none"; if(rule.t === "s" && !(rule.days || []).length){ rule.days = [dOf(p.k).getDay()]; ov.querySelectorAll("[data-dy]").forEach(function(y){ y.classList.toggle("on", +y.getAttribute("data-dy") === rule.days[0]); }); } };
  ov.querySelectorAll("[data-dy]").forEach(function(b){ b.onclick = function(){ var i = +b.getAttribute("data-dy"); rule.days = rule.days || []; var j = rule.days.indexOf(i); if(j >= 0) rule.days.splice(j, 1); else rule.days.push(i); b.classList.toggle("on", j < 0); }; });
  var grab = function(){ x.t = ov.querySelector("#peT").value.trim() || x.t; x.pr = pr; x.sub = sub; x.note = ov.querySelector("#peN").value.trim();
    if(isD){ var prayOn = ov.querySelector('[data-tk="pray"]').classList.contains("on"); if(prayOn){ var m = +ov.querySelector("#peM").value; x.pt = ov.querySelector("#peP").value + (m ? (m > 0 ? "+" : "") + m : ""); x.tm = ""; } else { x.pt = ""; x.tm = ov.querySelector("#peTm").value; } x.rem = ov.querySelector("#peRem").checked; } };
  var commitRule = function(){ if(!isD) return; if(!rule.t){ if(r){ r.to = addD(p.k, -1); x.rid = null; } return; }
    if(r){ r.t = x.t; r.tm = x.tm; r.pt = x.pt; r.rem = x.rem; r.pr = x.pr; r.note = x.note; r.rule = rule; } else { var rid = uid(); x.rid = rid; d.rep.push({rid:rid, t:x.t, tm:x.tm, pt:x.pt, rem:x.rem, pr:x.pr, note:x.note, rule:rule, from:p.k}); }
    Object.keys(d.d).forEach(function(k){ if(k > p.k) (d.d[k] || []).forEach(function(y){ if(y.rid === x.rid && !y.done){ y.t = x.t; y.tm = x.tm; y.pt = x.pt; y.rem = x.rem; y.pr = x.pr; } }); }); };
  ov.querySelector("#peS").onclick = function(){ grab(); commitRule(); var mv = ov.querySelector("#peMv"); if(mv && mv.value && mv.value !== p.k){ var src = d.d[p.k]; d.d[p.k] = src.filter(function(y){ return y.id !== x.id; }); if(x.rid){ d.skip[p.k] = d.skip[p.k] || {}; d.skip[p.k][x.rid] = 1; x.rid = null; } dayList(d, mv.value).l.push(x); H.toast("📅 " + mv.value); }
    save(d); H.closeOverlay(); draw(); };
  var tp = ov.querySelector("#peTop"); if(tp) tp.onclick = function(){ grab(); save(d); var r2 = toTop(p.k, x); H.toast(r2 === 1 ? "⭐ " + L("Ditambah ke 3 utama Fokus hari ini", "Added to today's Focus top 3") : r2 === 0 ? L("Dibuang dari 3 utama", "Removed from the top 3") : L("3 utama sudah penuh", "The top 3 is already full")); H.closeOverlay(); draw(); };
  var mvI = function(dl){ grab(); var i = l.indexOf(x), j = i + dl; if(j < 0 || j >= l.length) return; l[i] = l[j]; l[j] = x; save(d); H.closeOverlay(); draw(); };
  ov.querySelector("#peUp").onclick = function(){ mvI(-1); }; ov.querySelector("#peDn").onclick = function(){ mvI(1); }; }
/** used by Time › Meeting: add action items to a day's list */
function addItems(k, arr){ var d = db(), l = dayList(d, k).l, n = 0; arr.forEach(function(a){ if(!a || !a.t || l.some(function(x){ return x.t === a.t; })) return; l.push({id:uid(), t:a.t, tm:a.tm || "", note:a.note || "", done:false}); n++; }); save(d); return n; }
window.PlannerView = {render:function(el, h){ H = h; root = el; var v = H.load(KEY + "_v", null); if(v && /^[dwmy]$/.test(v)) ST.v = v; draw(); try{ sched(db()); }catch(e){} },
  addItems:function(h, k, arr){ H = H || h; return addItems(k, arr); }, _st:function(){ return ST; }, _t:{ruleHits:ruleHits, timeOf:timeOf, dayList:dayList, db:db}};
})();
