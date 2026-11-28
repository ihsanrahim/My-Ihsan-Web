/* My Ihsan 0.7.95 (owner #18): Suite › Business › 🧑‍💼 Staff.
   👥 Staff: add / edit / remove (kept as "left" for past records), role, phone, pay per hour / day / week / month, overtime ×, commission % on sales.
   📅 Roster: a week of shifts per person, copy last week, hours per person, share the roster on WhatsApp.
   ⏱ Clock: clock in / out per person (who is on duty now), corrections.
   💰 Pay: a period (this week, last week, this month, last month): hours from the clock (else the roster), base pay, overtime over 8 h/day,
      commission on the sales they served, minus advances; a payslip to share. Advances are recorded here.
   📈 Sales: by staff (POS sales carry st = the person on the till) and by hour of day / day of week.
   Data (ihsan_biz, per business profile pid): staffL, roster, clock, adv, staffCur {pid: staff id on the till}. Money in sen like the rest of Business.
   A phone whose role is "staff" sees the roster and the clock only. NiagaStaff.view(el, X) · NiagaStaff._t (pure maths for tests) */
(function(){ "use strict";
var X = null, H = null, ST = {tab: "list", wk: 0, per: "tm"};
var PAY = [["h","sejam","per hour"],["d","sehari","per day"],["w","seminggu","per week"],["m","sebulan","per month"]];
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function D(){ return X.D(); }
function P(){ return X.prof(); }
function pad(n){ return (n < 10 ? "0" : "") + n; }
function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function pd(s){ var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function add(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
function uid(){ return "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function m(c){ return X.money(c); }
function arr(k){ var d = D(); if(!Array.isArray(d[k])) d[k] = []; return d[k]; }
function mine(k){ var p = P(); return arr(k).filter(function(x){ return x.pid === p.id; }); }
function people(all){ return mine("staffL").filter(function(s){ return all || !s.left; }); }
function byId(id){ return arr("staffL").filter(function(s){ return s.id === id; })[0]; }
function save(){ X.sv(); }
function mins(hm){ var p = String(hm || "0:0").split(":"); return (+p[0] || 0) * 60 + (+p[1] || 0); }
function shiftH(s){ var a = mins(s.s), b = mins(s.e); if(b <= a) b += 1440; return (b - a) / 60; }
function monday(off){ var t = new Date(); t.setHours(0, 0, 0, 0); return add(t, -((t.getDay() + 6) % 7) + (off || 0) * 7); }
function hrs(h){ return (Math.round(h * 100) / 100).toLocaleString("en-US", {maximumFractionDigits: 2}); }
// ---------- pure pay maths ----------
// hours per day for a person in [from, to] (ymd strings): clock entries win, else roster shifts
function dayHours(sid, from, to, clock, roster){ var o = {};
  clock.forEach(function(c){ if(c.sid !== sid || !c.out) return; var a = new Date(c.in), b = new Date(c.out), d = ymd(a); if(d < from || d > to) return; o[d] = (o[d] || 0) + Math.max(0, (b - a) / 36e5); });
  roster.forEach(function(r){ if(r.sid !== sid || r.d < from || r.d > to || o["c" + r.d]) return; if(clock.some(function(c){ return c.sid === sid && c.out && ymd(new Date(c.in)) === r.d; })) return; o[r.d] = (o[r.d] || 0) + shiftH(r); });
  Object.keys(o).forEach(function(k){ if(k.charAt(0) === "c") delete o[k]; }); return o; }
// pay for a period: {hours, days, base, ot, comm, adv, net} in sen
function payOf(s, from, to, dh, salesSen, advSen){ var days = Object.keys(dh).length, hours = 0, otH = 0, base = 0, rate = +s.rate || 0, span = Math.round((pd(to) - pd(from)) / 864e5) + 1;
  Object.keys(dh).forEach(function(d){ hours += dh[d]; otH += Math.max(0, dh[d] - 8); });
  if(s.pay === "h") base = Math.round((hours - otH) * rate); else if(s.pay === "d") base = Math.round(days * rate); else if(s.pay === "w") base = Math.round(rate * span / 7); else base = Math.round(rate * span / new Date(pd(from).getFullYear(), pd(from).getMonth() + 1, 0).getDate());
  var hr = s.pay === "h" ? rate : s.pay === "d" ? rate / 8 : s.pay === "w" ? rate / 40 : rate / 173.33, ot = s.pay === "h" || s.pay === "d" ? Math.round(otH * hr * (+s.ot || 1.5)) : 0;
  if(s.pay === "h") ot = Math.round(otH * hr * (+s.ot || 1.5));
  var comm = Math.round((salesSen || 0) * (+s.comm || 0) / 100), adv = advSen || 0;
  return {hours: hours, days: days, otH: otH, base: base, ot: ot, comm: comm, adv: adv, net: base + ot + comm - adv}; }
function period(k){ var t = new Date(); t.setHours(0, 0, 0, 0); var a, b;
  if(k === "tw"){ a = monday(0); b = add(a, 6); } else if(k === "lw"){ a = monday(-1); b = add(a, 6); } else if(k === "lm"){ a = new Date(t.getFullYear(), t.getMonth() - 1, 1); b = new Date(t.getFullYear(), t.getMonth(), 0); } else { a = new Date(t.getFullYear(), t.getMonth(), 1); b = new Date(t.getFullYear(), t.getMonth() + 1, 0); }
  return [ymd(a), ymd(b)]; }
function salesIn(from, to){ var p = P(); return (D().sales || []).filter(function(s){ return s.pid === p.id && !s.void && !s.del && s.day >= from && s.day <= to; }); }
// ---------- pages ----------
function view(el, x){ X = x; H = x.H; var lim = X.staff && X.staff(); if(lim && ["roster", "clock"].indexOf(ST.tab) < 0) ST.tab = "roster";
  var T = [["list","👔","Staf","Staff"],["roster","📅","Jadual","Roster"],["clock","⏱","Masa","Clock"],["pay","💰","Gaji","Pay"],["sales","📈","Jualan","Sales"]].filter(function(t){ return !lim || t[0] === "roster" || t[0] === "clock"; });
  el.innerHTML = '<div class="stTabs">' + T.map(function(t){ return '<button class="' + (ST.tab === t[0] ? "on" : "") + '" data-stt="' + t[0] + '">' + t[1] + ' ' + L(t[2], t[3]) + '</button>'; }).join("") + '</div><div id="stB"></div>';
  el.querySelectorAll("[data-stt]").forEach(function(b){ b.onclick = function(){ ST.tab = b.getAttribute("data-stt"); view(el, x); }; });
  var b = el.querySelector("#stB"), redraw = function(){ view(el, x); };
  if(!people(true).length && ST.tab !== "list"){ b.innerHTML = '<div class="card mut small">' + L("Tambah staf dahulu di tab Staf.", "Add staff first in the Staff tab.") + '</div>'; return; }
  ({list: pList, roster: pRoster, clock: pClock, pay: pPay, sales: pSales}[ST.tab] || pList)(b, redraw); }
function pList(el, re){ var L0 = people(true);
  el.innerHTML = (L0.length ? L0.map(function(s){ var pt = PAY.filter(function(p){ return p[0] === s.pay; })[0] || PAY[0]; return '<button class="card stRow' + (s.left ? " left" : "") + '" data-se="' + s.id + '"><span class="stAv">' + E((s.n || "?").charAt(0).toUpperCase()) + '</span><span class="stM"><b>' + E(s.n) + (s.left ? ' · ' + L("sudah berhenti", "left") : '') + '</b><small>' + E(s.role || "") + (s.role ? " · " : "") + m(+s.rate || 0) + " " + L(pt[1], pt[2]) + (s.comm ? " · " + s.comm + "% " + L("komisen", "commission") : "") + '</small></span>' + (s.phone ? '<span class="mut tiny">📞</span>' : '') + '</button>'; }).join("") : '<div class="card mut small">' + L("Belum ada staf.", "No staff yet.") + '</div>') +
    '<button class="btn gold full" id="stAdd">＋ ' + L("Tambah staf", "Add staff") + '</button><div class="mut tiny" style="margin-top:8px">' + L("Kadar gaji dan komisen hanya untuk kiraan anda. Semak keperluan KWSP, PERKESO dan EIS sendiri.", "Pay rates and commission are for your own sums. Check EPF, SOCSO and EIS duties yourself.") + '</div>';
  el.querySelector("#stAdd").onclick = function(){ edit(null, re); };
  el.querySelectorAll("[data-se]").forEach(function(b){ b.onclick = function(){ edit(byId(b.getAttribute("data-se")), re); }; }); }
function edit(s, re){ var isNew = !s; s = s || {id: uid(), pid: P().id, pay: "h", rate: 0, ot: 1.5, comm: 0};
  var f = function(id, lb, type, v, ex){ return '<label class="stF"><span>' + lb + '</span><input class="rin" id="' + id + '" type="' + type + '" value="' + E(v == null ? "" : v) + '"' + (ex || "") + '></label>'; };
  var body = f("seN", L("Nama", "Name"), "text", s.n, ' maxlength="40"') + '<div class="stG2">' + f("seR", L("Jawatan", "Role"), "text", s.role, ' maxlength="30" placeholder="' + E(L("cth. Juruwang", "e.g. Cashier")) + '"') + f("seP", L("Telefon", "Phone"), "tel", s.phone, ' maxlength="20"') + '</div>' +
    '<div class="stF"><span>' + L("Gaji", "Pay") + '</span><div class="chips">' + PAY.map(function(p){ return '<button class="chip' + (s.pay === p[0] ? " on" : "") + '" data-sp="' + p[0] + '">' + L(p[1], p[2]) + '</button>'; }).join("") + '</div></div>' +
    '<div class="stG3">' + f("seA", L("Kadar (RM)", "Rate (RM)"), "number", s.rate ? (s.rate / 100).toFixed(2) : "", ' inputmode="decimal" step="0.01"') + f("seO", L("Lebih masa ×", "Overtime ×"), "number", s.ot, ' inputmode="decimal" step="0.1"') + f("seC", L("Komisen %", "Commission %"), "number", s.comm, ' inputmode="decimal" step="0.1"') + '</div>' +
    '<div class="stBtns">' + (isNew ? '' : '<button class="btn alt" id="seX">' + (s.left ? "↩ " + L("Kembali bekerja", "Rejoined") : "🚪 " + L("Berhenti", "Left")) + '</button><button class="btn alt" id="seDel">🗑</button>') + '<button class="btn gold" id="seOk">' + L("Simpan", "Save") + '</button></div>';
  var ov = H.showSheet("👔 " + (isNew ? L("Staf baharu", "New staff") : E(s.n)), body), pay = s.pay;
  ov.querySelectorAll("[data-sp]").forEach(function(b){ b.onclick = function(){ pay = b.getAttribute("data-sp"); ov.querySelectorAll("[data-sp]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; });
  ov.querySelector("#seOk").onclick = function(){ var n = ov.querySelector("#seN").value.trim(); if(!n){ H.toast(L("Isi nama", "Fill in the name")); return; }
    s.n = n; s.role = ov.querySelector("#seR").value.trim(); s.phone = ov.querySelector("#seP").value.trim(); s.pay = pay; s.rate = Math.round((parseFloat(ov.querySelector("#seA").value) || 0) * 100); s.ot = parseFloat(ov.querySelector("#seO").value) || 1.5; s.comm = Math.max(0, Math.min(100, parseFloat(ov.querySelector("#seC").value) || 0));
    if(isNew) arr("staffL").push(s); save(); H.closeOverlay(); re(); };
  var lx = ov.querySelector("#seX"); if(lx) lx.onclick = function(){ s.left = s.left ? null : ymd(new Date()); save(); H.closeOverlay(); re(); };
  var dl = ov.querySelector("#seDel"); if(dl) dl.onclick = function(){ if(!confirm(L("Padam staf ini? Jadual dan rekod masa mereka juga dipadam. (Pilih Berhenti untuk simpan rekod.)", "Delete this person? Their roster and clock records go too. (Choose Left to keep records.)"))) return;
    ["staffL", "roster", "clock", "adv"].forEach(function(k){ D()[k] = arr(k).filter(function(x){ return k === "staffL" ? x.id !== s.id : x.sid !== s.id; }); }); save(); H.closeOverlay(); re(); }; }
function pRoster(el, re){ var a = monday(ST.wk), days = [0, 1, 2, 3, 4, 5, 6].map(function(i){ return add(a, i); }), R = mine("roster"), ppl = people(), lim = X.staff && X.staff(), tot = {};
  R.forEach(function(r){ if(r.d >= ymd(days[0]) && r.d <= ymd(days[6])) tot[r.sid] = (tot[r.sid] || 0) + shiftH(r); });
  el.innerHTML = '<div class="card stWk"><button class="chip" id="rwP">‹</button><b>' + days[0].toLocaleDateString(L("ms-MY", "en-GB"), {day: "numeric", month: "short"}) + ' – ' + days[6].toLocaleDateString(L("ms-MY", "en-GB"), {day: "numeric", month: "short"}) + '</b><button class="chip" id="rwN">›</button></div>' +
    days.map(function(d){ var k = ymd(d), sh = R.filter(function(r){ return r.d === k; }).sort(function(x, y){ return x.s < y.s ? -1 : 1; });
      return '<div class="card stDay' + (k === ymd(new Date()) ? " now" : "") + '"><div class="stDh"><b>' + d.toLocaleDateString(L("ms-MY", "en-GB"), {weekday: "long", day: "numeric", month: "short"}) + '</b>' + (lim ? '' : '<button class="chip" data-ra="' + k + '">＋</button>') + '</div>' +
        (sh.length ? sh.map(function(r){ var s = byId(r.sid); return '<div class="stSh"><span class="stAv sm">' + E(s ? s.n.charAt(0) : "?") + '</span><span class="stM"><b>' + E(s ? s.n : "?") + '</b><small>' + E(r.s) + '–' + E(r.e) + ' · ' + hrs(shiftH(r)) + ' j' + (r.note ? ' · ' + E(r.note) : '') + '</small></span>' + (lim ? '' : '<button class="stX" data-rx="' + r.id + '">✕</button>') + '</div>'; }).join("") : '<div class="mut tiny">' + L("Tiada syif", "No shifts") + '</div>') + '</div>'; }).join("") +
    '<div class="card"><b>' + L("Jam minggu ini", "Hours this week") + '</b>' + ppl.map(function(s){ return '<div class="stKV"><span>' + E(s.n) + '</span><b>' + hrs(tot[s.id] || 0) + ' j</b></div>'; }).join("") + '</div>' +
    '<div class="stBtns">' + (lim ? '' : '<button class="btn alt" id="rwC">⧉ ' + L("Salin minggu lepas", "Copy last week") + '</button>') + '<button class="btn alt" id="rwS">📤 ' + L("Kongsi jadual", "Share roster") + '</button></div>';
  el.querySelector("#rwP").onclick = function(){ ST.wk--; re(); }; el.querySelector("#rwN").onclick = function(){ ST.wk++; re(); };
  el.querySelectorAll("[data-ra]").forEach(function(b){ b.onclick = function(){ var d = b.getAttribute("data-ra"), last = R[R.length - 1] || {s: "09:00", e: "17:00"};
    var ov = H.showSheet("📅 " + d, '<div class="chips">' + ppl.map(function(s, i){ return '<button class="chip' + (i ? "" : " on") + '" data-rs="' + s.id + '">' + E(s.n) + '</button>'; }).join("") + '</div><div class="stG2"><label class="stF"><span>' + L("Mula", "Start") + '</span><input class="rin" id="rsS" type="time" value="' + E(last.s) + '"></label><label class="stF"><span>' + L("Tamat", "End") + '</span><input class="rin" id="rsE" type="time" value="' + E(last.e) + '"></label></div><input class="rin" id="rsN" maxlength="40" style="width:100%;margin-top:8px" placeholder="' + E(L("Nota (pilihan): kaunter, dapur…", "Note (optional): counter, kitchen…")) + '"><button class="btn gold full" id="rsOk" style="margin-top:10px">' + L("Tambah syif", "Add shift") + '</button>'), sid = ppl[0] && ppl[0].id;
    ov.querySelectorAll("[data-rs]").forEach(function(x){ x.onclick = function(){ sid = x.getAttribute("data-rs"); ov.querySelectorAll("[data-rs]").forEach(function(y){ y.classList.toggle("on", y === x); }); }; });
    ov.querySelector("#rsOk").onclick = function(){ if(!sid) return; arr("roster").push({id: uid(), pid: P().id, sid: sid, d: d, s: ov.querySelector("#rsS").value || "09:00", e: ov.querySelector("#rsE").value || "17:00", note: ov.querySelector("#rsN").value.trim()}); save(); H.closeOverlay(); re(); }; }; });
  el.querySelectorAll("[data-rx]").forEach(function(b){ b.onclick = function(){ var id = b.getAttribute("data-rx"); D().roster = arr("roster").filter(function(r){ return r.id !== id; }); save(); re(); }; });
  var cp = el.querySelector("#rwC"); if(cp) cp.onclick = function(){ var from = ymd(add(a, -7)), to = ymd(add(a, -1)), n = 0; mine("roster").filter(function(r){ return r.d >= from && r.d <= to; }).forEach(function(r){ var nd = ymd(add(pd(r.d), 7)); if(!arr("roster").some(function(x){ return x.pid === r.pid && x.sid === r.sid && x.d === nd && x.s === r.s; })){ arr("roster").push({id: uid(), pid: r.pid, sid: r.sid, d: nd, s: r.s, e: r.e, note: r.note}); n++; } }); save(); H.toast(n + L(" syif disalin", " shifts copied")); re(); };
  el.querySelector("#rwS").onclick = function(){ var t = "📅 " + L("Jadual kerja ", "Work roster ") + (P().name || "") + "\n" + days.map(function(d){ var sh = R.filter(function(r){ return r.d === ymd(d); }); return "\n" + d.toLocaleDateString(L("ms-MY", "en-GB"), {weekday: "short", day: "numeric", month: "short"}) + (sh.length ? sh.map(function(r){ var s = byId(r.sid); return "\n  " + r.s + "–" + r.e + "  " + (s ? s.n : "?") + (r.note ? " (" + r.note + ")" : ""); }).join("") : "\n  –"); }).join("");
    if(H.N && H.N.shareText) H.N.shareText(t); else { try{ navigator.clipboard.writeText(t); }catch(e){} H.toast(L("Disalin", "Copied")); } }; }
function pClock(el, re){ var C = mine("clock"), now = Date.now(), open = function(sid){ return C.filter(function(c){ return c.sid === sid && !c.out; })[0]; }, today = ymd(new Date());
  el.innerHTML = people().map(function(s){ var o = open(s.id), tdH = 0; C.forEach(function(c){ if(c.sid === s.id && ymd(new Date(c.in)) === today) tdH += ((c.out ? new Date(c.out) : new Date()) - new Date(c.in)) / 36e5; });
      return '<div class="card stCl' + (o ? " on" : "") + '"><span class="stAv">' + E(s.n.charAt(0)) + '</span><span class="stM"><b>' + E(s.n) + '</b><small>' + (o ? "🟢 " + L("bertugas sejak ", "on duty since ") + new Date(o.in).toLocaleTimeString(L("ms-MY", "en-GB"), {hour: "2-digit", minute: "2-digit"}) : L("tidak bertugas", "off duty")) + ' · ' + L("hari ini ", "today ") + hrs(tdH) + ' j</small></span><button class="btn ' + (o ? "alt" : "gold") + '" data-ck="' + s.id + '">' + (o ? "⏹ " + L("Keluar", "Clock out") : "▶ " + L("Masuk", "Clock in")) + '</button></div>'; }).join("") +
    '<div class="card"><b>' + L("Rekod terkini", "Latest records") + '</b>' + C.slice(-12).reverse().map(function(c){ var s = byId(c.sid), a = new Date(c.in), b = c.out ? new Date(c.out) : null; return '<div class="stKV"><span>' + E(s ? s.n : "?") + ' · ' + a.toLocaleDateString(L("ms-MY", "en-GB"), {day: "numeric", month: "short"}) + ' ' + a.toTimeString().slice(0, 5) + '–' + (b ? b.toTimeString().slice(0, 5) : "…") + '</span><b>' + (b ? hrs((b - a) / 36e5) + " j" : "") + '</b>' + (X.staff && X.staff() ? '' : '<button class="stX" data-cx="' + c.id + '">✕</button>') + '</div>'; }).join("") + '</div>';
  el.querySelectorAll("[data-ck]").forEach(function(b){ b.onclick = function(){ var sid = b.getAttribute("data-ck"), o = open(sid); if(o) o.out = new Date().toISOString(); else arr("clock").push({id: uid(), pid: P().id, sid: sid, in: new Date().toISOString(), out: null}); try{ H.N.vibrate(30); }catch(e){} save(); re(); }; });
  el.querySelectorAll("[data-cx]").forEach(function(b){ b.onclick = function(){ if(!confirm(L("Padam rekod masa ini?", "Delete this time record?"))) return; var id = b.getAttribute("data-cx"); D().clock = arr("clock").filter(function(c){ return c.id !== id; }); save(); re(); }; }); }
function pPay(el, re){ var pr = period(ST.per), sales = salesIn(pr[0], pr[1]), A = mine("adv"), rows = people(true).map(function(s){ var dh = dayHours(s.id, pr[0], pr[1], mine("clock"), mine("roster")), sv = sales.filter(function(x){ return x.st === s.id; }).reduce(function(t, x){ return t + x.tot; }, 0), av = A.filter(function(a){ return a.sid === s.id && a.d >= pr[0] && a.d <= pr[1]; }).reduce(function(t, a){ return t + a.amt; }, 0); return {s: s, p: payOf(s, pr[0], pr[1], dh, sv, av), sales: sv}; }).filter(function(r){ return !r.s.left || r.p.hours || r.p.adv; }), all = rows.reduce(function(t, r){ return t + r.p.net; }, 0);
  el.innerHTML = '<div class="chips stPer">' + [["tw","Minggu ini","This week"],["lw","Minggu lepas","Last week"],["tm","Bulan ini","This month"],["lm","Bulan lepas","Last month"]].map(function(x){ return '<button class="chip' + (ST.per === x[0] ? " on" : "") + '" data-pp="' + x[0] + '">' + L(x[1], x[2]) + '</button>'; }).join("") + '</div>' +
    '<div class="card stSum"><span>' + pr[0] + ' → ' + pr[1] + '</span><b>' + m(all) + '</b><small>' + L("jumlah gaji", "total pay") + '</small></div>' +
    rows.map(function(r){ var p = r.p; return '<div class="card stPay"><div class="stDh"><b>' + E(r.s.n) + '</b><b class="stNet">' + m(p.net) + '</b></div><div class="stKV"><span>' + L("Jam / hari", "Hours / days") + '</span><span>' + hrs(p.hours) + ' j · ' + p.days + ' ' + L("hari", "days") + '</span></div><div class="stKV"><span>' + L("Gaji asas", "Base") + '</span><span>' + m(p.base) + '</span></div>' +
      (p.ot ? '<div class="stKV"><span>' + L("Lebih masa ", "Overtime ") + hrs(p.otH) + ' j</span><span>' + m(p.ot) + '</span></div>' : '') + (p.comm ? '<div class="stKV"><span>' + L("Komisen ", "Commission ") + (r.s.comm || 0) + '% × ' + m(r.sales) + '</span><span>' + m(p.comm) + '</span></div>' : '') + (p.adv ? '<div class="stKV"><span>' + L("Pendahuluan", "Advances") + '</span><span>−' + m(p.adv) + '</span></div>' : '') +
      '<div class="stBtns"><button class="chip" data-av="' + r.s.id + '">＋ ' + L("Pendahuluan", "Advance") + '</button><button class="chip" data-ps="' + r.s.id + '">📤 ' + L("Slip gaji", "Payslip") + '</button></div></div>'; }).join("") +
    '<div class="mut tiny">' + L("Jam diambil dari rekod Masa; jika tiada, dari Jadual. Lebih masa = lebih 8 jam sehari. Mingguan/bulanan dikira ikut bilangan hari dalam tempoh.", "Hours come from the Clock records, else from the Roster. Overtime = over 8 hours a day. Weekly/monthly pay is prorated by the days in the period.") + '</div>';
  el.querySelectorAll("[data-pp]").forEach(function(b){ b.onclick = function(){ ST.per = b.getAttribute("data-pp"); re(); }; });
  el.querySelectorAll("[data-av]").forEach(function(b){ b.onclick = function(){ var v = parseFloat(prompt(L("Jumlah pendahuluan (RM)", "Advance amount (RM)"), "")); if(!(v > 0)) return; arr("adv").push({id: uid(), pid: P().id, sid: b.getAttribute("data-av"), d: ymd(new Date()), amt: Math.round(v * 100)}); save(); re(); }; });
  el.querySelectorAll("[data-ps]").forEach(function(b){ b.onclick = function(){ var r = rows.filter(function(x){ return x.s.id === b.getAttribute("data-ps"); })[0], p = r.p;
    var t = "💰 " + L("Slip gaji", "Payslip") + " · " + (P().name || "") + "\n" + r.s.n + (r.s.role ? " (" + r.s.role + ")" : "") + "\n" + pr[0] + " → " + pr[1] + "\n\n" + L("Jam: ", "Hours: ") + hrs(p.hours) + " · " + L("Hari: ", "Days: ") + p.days + "\n" + L("Gaji asas: ", "Base: ") + m(p.base) + (p.ot ? "\n" + L("Lebih masa: ", "Overtime: ") + m(p.ot) : "") + (p.comm ? "\n" + L("Komisen: ", "Commission: ") + m(p.comm) : "") + (p.adv ? "\n" + L("Pendahuluan: ", "Advances: ") + "−" + m(p.adv) : "") + "\n" + L("Bersih: ", "Net: ") + m(p.net);
    if(H.N && H.N.shareText) H.N.shareText(t); else { try{ navigator.clipboard.writeText(t); }catch(e){} H.toast(L("Disalin", "Copied")); } }; }); }
function pSales(el, re){ var pr = period(ST.per), S = salesIn(pr[0], pr[1]), by = {}, hr = [], wd = [0, 0, 0, 0, 0, 0, 0], tot = 0; for(var i = 0; i < 24; i++) hr.push(0);
  S.forEach(function(s){ var k = s.st || "_"; by[k] = by[k] || {n: 0, t: 0}; by[k].n++; by[k].t += s.tot; tot += s.tot; var d = new Date(s.t); hr[d.getHours()] += s.tot; wd[(d.getDay() + 6) % 7] += s.tot; });
  var mxH = Math.max.apply(null, hr) || 1, mxW = Math.max.apply(null, wd) || 1, WD = L("Isn Sel Rab Kha Jum Sab Ahd", "Mon Tue Wed Thu Fri Sat Sun").split(" ");
  el.innerHTML = '<div class="chips stPer">' + [["tw","Minggu ini","This week"],["lw","Minggu lepas","Last week"],["tm","Bulan ini","This month"],["lm","Bulan lepas","Last month"]].map(function(x){ return '<button class="chip' + (ST.per === x[0] ? " on" : "") + '" data-pp="' + x[0] + '">' + L(x[1], x[2]) + '</button>'; }).join("") + '</div>' +
    '<div class="card stSum"><span>' + S.length + ' ' + L("jualan", "sales") + '</span><b>' + m(tot) + '</b></div>' +
    '<div class="card"><b>👥 ' + L("Ikut staf", "By staff") + '</b>' + Object.keys(by).sort(function(a, b){ return by[b].t - by[a].t; }).map(function(k){ var s = byId(k); return '<div class="stBar"><span>' + E(s ? s.n : L("Tidak ditanda", "Not set")) + ' <small>(' + by[k].n + ')</small></span><i><em style="width:' + Math.round(by[k].t / (tot || 1) * 100) + '%"></em></i><b>' + m(by[k].t) + '</b></div>'; }).join("") + (S.length ? '' : '<div class="mut small">' + L("Tiada jualan dalam tempoh ini.", "No sales in this period.") + '</div>') + '</div>' +
    '<div class="card"><b>🕐 ' + L("Ikut jam", "By hour") + '</b><div class="stHr">' + hr.map(function(v, h){ return '<i title="' + h + ':00 ' + m(v) + '" style="height:' + Math.max(2, Math.round(v / mxH * 100)) + '%"' + (v === mxH && v ? ' class="pk"' : '') + '></i>'; }).join("") + '</div><div class="stHrL"><span>0</span><span>6</span><span>12</span><span>18</span><span>23</span></div>' + (tot ? '<div class="mut small">' + L("Jam paling sibuk: ", "Busiest hour: ") + hr.indexOf(mxH) + ':00</div>' : '') + '</div>' +
    '<div class="card"><b>📅 ' + L("Ikut hari", "By day") + '</b>' + wd.map(function(v, i){ return '<div class="stBar"><span>' + WD[i] + '</span><i><em style="width:' + Math.round(v / mxW * 100) + '%"></em></i><b>' + m(v) + '</b></div>'; }).join("") + '</div>' +
    '<div class="mut tiny">' + L("Pilih staf di kaunter Jual (👔) supaya setiap jualan ditanda dengan nama mereka.", "Pick the staff member at the Sell till (👔) so each sale carries their name.") + '</div>';
  el.querySelectorAll("[data-pp]").forEach(function(b){ b.onclick = function(){ ST.per = b.getAttribute("data-pp"); re(); }; }); }
// the till: who is serving now (a sale records st)
function tillBar(x){ X = x; H = x.H; var ppl = people(); if(!ppl.length) return ""; var cur = (D().staffCur || {})[P().id] || "";
  return '<div class="stTill">👔 <select class="rin" id="stTill">' + '<option value="">' + L("Siapa di kaunter?", "Who is serving?") + '</option>' + ppl.map(function(s){ return '<option value="' + s.id + '"' + (s.id === cur ? " selected" : "") + '>' + E(s.n) + '</option>'; }).join("") + '</select></div>'; }
function tillBind(el){ var s = el.querySelector("#stTill"); if(s) s.onchange = function(){ var d = D(); d.staffCur = d.staffCur || {}; d.staffCur[P().id] = s.value; save(); }; }
window.NiagaStaff = {view: view, tillBar: tillBar, tillBind: tillBind, _t: {payOf: payOf, dayHours: dayHours, shiftH: shiftH, period: period}};
})();
