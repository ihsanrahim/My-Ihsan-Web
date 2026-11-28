/* My Ihsan 0.7.93 (owner pick #34): Time › Track › 💊 My meds. Your own medicines (times, tick when taken, snooze, stock and refill warning)
   and an adult vaccine record (flu, tetanus, meningococcal ACWY for Hajj & Umrah, COVID-19, pneumococcal, hepatitis B, others) with the next due date.
   Reminders use the app's own alarm list (xrem). A personal record and reminder only: it gives no medical advice (stated on screen).
   Storage: ihsan_meds {meds:[{id,n,dose,times:[],stock,low}], log:{ymd:{"id@HH:MM":1}}, vax:{key:[ymd…]}}. MyMeds.render(el, H, dockHtml, bindDock) */
(function(){ "use strict";
var H = null, KEY = "ihsan_meds";
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function pad(n){ return (n < 10 ? "0" : "") + n; }
function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function pd(s){ var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function db(){ var d = H.load(KEY, null) || {}; d.meds = Array.isArray(d.meds) ? d.meds : []; d.log = d.log || {}; d.vax = d.vax || {}; return d; }
function put(d){ var ks = Object.keys(d.log).sort(); while(ks.length > 120) delete d.log[ks.shift()]; H.save(KEY, d); }
// [key, icon, ms, en, years until the next dose (0 = no fixed interval), note ms, note en]
var VAX = [["flu","🤧","Influenza","Influenza (flu)",1,"Setiap tahun; digalakkan sebelum haji/umrah dan untuk warga emas.","Every year; advised before Hajj/Umrah and for older adults."],
  ["acwy","🕋","Meningokokal ACWY","Meningococcal ACWY",5,"Diwajibkan oleh Arab Saudi untuk haji dan umrah. Tempoh sah ikut jenis vaksin (semak sijil).","Required by Saudi Arabia for Hajj and Umrah. How long it is valid depends on the vaccine type (check the certificate)."],
  ["td","🩹","Tetanus (Td/Tdap)","Tetanus (Td/Tdap)",10,"Dos penggalak kira-kira setiap 10 tahun.","A booster about every 10 years."],
  ["covid","🦠","COVID-19","COVID-19",0,"Ikut nasihat terkini KKM.","Follow the latest Ministry of Health advice."],
  ["pneumo","🫁","Pneumokokal","Pneumococcal",0,"Biasanya untuk umur 65+ atau penyakit kronik; tanya doktor.","Usually for age 65+ or long-term illness; ask your doctor."],
  ["hepb","🧪","Hepatitis B","Hepatitis B",0,"Siri 3 dos jika belum pernah lengkap.","A 3-dose series if never completed."],
  ["hpv","🎗️","HPV","HPV",0,"Ikut jadual doktor.","As your doctor schedules."],
  ["yf","🌍","Demam kuning","Yellow fever",0,"Untuk perjalanan ke negara tertentu; sijil antarabangsa.","For travel to some countries; international certificate."]];
function addYears(s, y){ var d = pd(s); d.setFullYear(d.getFullYear() + y); return ymd(d); }
function dueOf(key, dates){ var v = VAX.filter(function(x){ return x[0] === key; })[0]; if(!v || !v[4] || !dates || !dates.length) return null; return addYears(dates.slice().sort().pop(), v[4]); }
function at(s, hm){ var d = pd(s), p = hm.split(":"); d.setHours(+p[0], +p[1], 0, 0); return d.getTime(); }
// schedule the next 48 h of doses + vaccine due reminders (2 weeks before); xrem replaces by id
function sched(d){ if(!H.xrem) return; var now = Date.now(); [0, 1].forEach(function(o){ var day = ymd(new Date(now + o * 864e5));
    d.meds.forEach(function(m){ if(m.off) return; (m.times || []).forEach(function(t){ var id = "med_" + m.id + "_" + day + "_" + t.replace(":", ""), tm = at(day, t), done = d.log[day] && d.log[day][m.id + "@" + t];
      if(!done && tm > now) H.xrem(id, tm, "💊 " + m.n, (m.dose || "") + " · " + t, "cal"); else H.xrem(id, 0); }); }); });
  VAX.forEach(function(v){ var due = dueOf(v[0], d.vax[v[0]]); if(due){ var t = at(due, "09:00") - 14 * 864e5; H.xrem("vax_" + v[0], t > now ? t : 0, "💉 " + L(v[2], v[3]), L("Dos seterusnya pada ", "Next dose due ") + due, "cal"); } }); }
function render(el, h, dock, bindDock){ H = h; var d = db(), today = ymd(), lg = d.log[today] || {}, now = new Date(), hm = pad(now.getHours()) + ":" + pad(now.getMinutes());
  var doses = []; d.meds.forEach(function(m){ if(!m.off) (m.times || []).forEach(function(t){ doses.push({m: m, t: t, k: m.id + "@" + t}); }); }); doses.sort(function(a, b){ return a.t.localeCompare(b.t); });
  var low = d.meds.filter(function(m){ return !m.off && m.stock != null && m.low != null && m.stock <= m.low; });
  var h2 = '<div class="mdNote">ℹ️ ' + L("Rekod & peringatan peribadi sahaja, bukan nasihat perubatan. Ikut arahan doktor atau ahli farmasi anda.", "A personal record and reminder only, not medical advice. Follow your doctor's or pharmacist's instructions.") + '</div>';
  h2 += '<div class="card"><h3>💊 ' + L("Hari ini", "Today") + ' <small class="mut">' + Object.keys(lg).length + '/' + doses.length + '</small></h3>' + (doses.length ? doses.map(function(x){ var ok = !!lg[x.k], late = !ok && x.t < hm; return '<div class="mdD' + (ok ? " ok" : late ? " late" : "") + '"><span class="mdT">' + x.t + '</span><span class="mdN"><b>' + E(x.m.n) + '</b><small>' + E(x.m.dose || "") + '</small></span>' + (ok ? '<button class="chip on" data-un="' + E(x.k) + '">✓</button>' : '<button class="chip" data-sn="' + E(x.k) + '">⏰ 10m</button><button class="chip gold" data-tk="' + E(x.k) + '">' + L("Ambil", "Take") + '</button>') + '</div>'; }).join("") : '<div class="mut small">' + L("Tiada ubat lagi. Tambah di bawah.", "No medicines yet. Add one below.") + '</div>') + '</div>';
  if(low.length) h2 += '<div class="card mdLow">⚠️ ' + L("Stok rendah: ", "Running low: ") + low.map(function(m){ return '<b>' + E(m.n) + '</b> (' + m.stock + ')'; }).join(", ") + '</div>';
  h2 += '<div class="card"><h3>📋 ' + L("Ubat saya", "My medicines") + '</h3>' + d.meds.map(function(m){ return '<div class="mdM' + (m.off ? " off" : "") + '"><span><b>' + E(m.n) + '</b><small>' + E(m.dose || "") + ' · ' + E((m.times || []).join(", ")) + (m.stock != null ? ' · ' + L("stok ", "stock ") + m.stock : '') + '</small></span><button class="chip" data-rf="' + E(m.id) + '">＋ ' + L("Isi semula", "Refill") + '</button><button class="chip" data-of="' + E(m.id) + '">' + (m.off ? "▶" : "⏸") + '</button><button class="mdX" data-dm="' + E(m.id) + '">✕</button></div>'; }).join("") +
    '<details class="mdAdd"' + (d.meds.length ? '' : ' open') + '><summary>＋ ' + L("Tambah ubat", "Add a medicine") + '</summary><input class="rin" id="mdN" maxlength="50" placeholder="' + E(L("Nama ubat", "Medicine name")) + '"><input class="rin" id="mdS" maxlength="40" placeholder="' + E(L("Dos, cth. 1 biji selepas makan", "Dose, e.g. 1 tablet after food")) + '">' +
    '<div class="medRow"><input class="rin" id="mdT1" type="time" value="08:00"><input class="rin" id="mdT2" type="time"><input class="rin" id="mdT3" type="time"></div><div class="medRow"><input class="rin" id="mdK" type="number" inputmode="numeric" placeholder="' + E(L("Stok (biji)", "Stock (pills)")) + '"><input class="rin" id="mdL" type="number" inputmode="numeric" placeholder="' + E(L("Amaran bila tinggal", "Warn when left")) + '"></div><button class="btn gold full" id="mdGo">' + L("Simpan", "Save") + '</button></details></div>';
  h2 += '<div class="card"><h3>💉 ' + L("Vaksin dewasa", "Adult vaccines") + '</h3>' + VAX.map(function(v){ var ds = (d.vax[v[0]] || []).slice().sort(), last = ds[ds.length - 1], due = dueOf(v[0], ds), overdue = due && due < today;
      return '<div class="mdV' + (overdue ? " due" : "") + '"><span class="mdVi">' + v[1] + '</span><span class="mdN"><b>' + E(L(v[2], v[3])) + '</b><small>' + (last ? L("Terakhir: ", "Last: ") + last + (due ? ' · ' + (overdue ? "⚠️ " + L("lepas tarikh ", "was due ") : L("seterusnya ", "next ")) + due : '') : E(L(v[5], v[6]))) + '</small></span><input type="date" class="rin mdVd" data-vx="' + v[0] + '" aria-label="' + E(L("Tarikh suntikan", "Date given")) + '" max="' + today + '"></div>'; }).join("") +
    '<div class="mut tiny">' + L("Masukkan tarikh suntikan untuk menyimpan rekod. Peringatan dihantar 2 minggu sebelum tarikh dos seterusnya.", "Enter the date given to keep a record. A reminder comes 2 weeks before the next dose is due.") + '</div></div>';
  el.innerHTML = '<div class="mdW">' + h2 + '</div>' + (dock || ''); if(bindDock) bindDock(el);
  var re = function(){ put(d); sched(d); render(el, H, dock, bindDock); };
  el.querySelectorAll("[data-tk]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-tk"), id = k.split("@")[0], m = d.meds.filter(function(x){ return x.id === id; })[0]; d.log[today] = d.log[today] || {}; d.log[today][k] = Date.now(); if(m && m.stock != null) m.stock = Math.max(0, m.stock - 1); try{ H.N.vibrate(30); }catch(e){} re(); }; });
  el.querySelectorAll("[data-un]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-un"), id = k.split("@")[0], m = d.meds.filter(function(x){ return x.id === id; })[0]; if(d.log[today]) delete d.log[today][k]; if(m && m.stock != null) m.stock++; re(); }; });
  el.querySelectorAll("[data-sn]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-sn"), id = k.split("@")[0], m = d.meds.filter(function(x){ return x.id === id; })[0]; if(!m) return; H.xrem("medsn_" + id, Date.now() + 10 * 60000, "💊 " + m.n, L("Peringatan semula", "Reminder again"), "cal"); H.toast("⏰ " + L("10 minit lagi", "In 10 minutes")); }; });
  el.querySelectorAll("[data-rf]").forEach(function(b){ b.onclick = function(){ var m = d.meds.filter(function(x){ return x.id === b.getAttribute("data-rf"); })[0], n = parseInt(prompt(L("Tambah berapa biji?", "How many to add?"), "30"), 10); if(!m || !(n > 0)) return; m.stock = (m.stock || 0) + n; re(); }; });
  el.querySelectorAll("[data-of]").forEach(function(b){ b.onclick = function(){ var m = d.meds.filter(function(x){ return x.id === b.getAttribute("data-of"); })[0]; if(m){ m.off = !m.off; re(); } }; });
  el.querySelectorAll("[data-dm]").forEach(function(b){ b.onclick = function(){ if(!confirm(L("Padam ubat ini?", "Delete this medicine?"))) return; var id = b.getAttribute("data-dm"); d.meds = d.meds.filter(function(x){ return x.id !== id; }); re(); }; });
  var go = el.querySelector("#mdGo"); if(go) go.onclick = function(){ var n = el.querySelector("#mdN").value.trim(); if(!n){ H.toast(L("Isi nama ubat", "Fill in the medicine name")); return; }
    var times = ["#mdT1", "#mdT2", "#mdT3"].map(function(s){ return el.querySelector(s).value; }).filter(Boolean).sort(), k = parseInt(el.querySelector("#mdK").value, 10), lw = parseInt(el.querySelector("#mdL").value, 10);
    d.meds.push({id: Date.now().toString(36), n: n.slice(0, 50), dose: el.querySelector("#mdS").value.trim().slice(0, 40), times: times, stock: k >= 0 ? k : null, low: lw >= 0 ? lw : null}); H.toast("💊 " + L("Disimpan", "Saved")); re(); };
  el.querySelectorAll("[data-vx]").forEach(function(i){ i.onchange = function(){ if(!i.value) return; var k = i.getAttribute("data-vx"); d.vax[k] = (d.vax[k] || []).concat([i.value]).filter(function(x, j, a){ return a.indexOf(x) === j; }).slice(-10); H.toast("💉 " + L("Direkod", "Recorded")); re(); }; });
  sched(d); }
window.MyMeds = {render: render, _t: {dueOf: dueOf, VAX: VAX}};
})();
