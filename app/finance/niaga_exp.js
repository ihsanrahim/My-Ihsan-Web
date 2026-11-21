/* My Ihsan 0.6.28 (owner: "include petty or recurring expenses for tax etc"): Niaga › 💸 Belanja (business expenses).
   - Quick add: amount (calculator), date, category, supplier, method (incl. 💵 petty cash), SST paid, ref no., note, receipt photo,
     or 📷 scan a receipt with the AI chosen in Settings › AI (Receipts row: never the free AI).
   - Petty cash (wang runcit): top-ups and spending from the float, running balance.
   - Recurring (rent, salary, internet…): weekly / monthly / yearly; added automatically when due; "amount changes" ones wait for
     you to confirm the amount; a reminder on the day.
   - Tax summary per year: income, expenses by category with how much is deductible (full / 50% entertainment / capital allowance /
     not deductible / business zakat), estimated adjusted income, SST paid, CSV. A guide only: check with an accountant or LHDN.
   Records live in ihsan_biz.expenses (synced to the Google Sheet "Belanja" tab; receipt photos stay on the phone).
   NiagaExp.view(el, X) · NiagaExp.sum(D, pid, from, to) · NiagaExp.recur(D, pid) · NiagaExp.CATS */
(function(){ "use strict";
var N = window.NiagaDoc, X = null, ST = {ym:"", y:0};
// tax: full = fully deductible, half = 50% (entertainment), cap = capital item (capital allowance, not an expense), no = not deductible, zakat = business zakat (s.44(11A), up to 2.5% of aggregate income)
var CATS = [["stok","📦","Bahan mentah & stok","Raw materials & stock","full"],["bungkus","🎁","Pembungkusan","Packaging","full"],["sewa","🏠","Sewa premis","Rent","full"],
  ["gaji","👥","Gaji & upah","Salaries & wages","full"],["kwsp","🛡","KWSP, PERKESO, SIP majikan","EPF, SOCSO, EIS (employer)","full"],["utiliti","💡","Elektrik & air","Electricity & water","full"],
  ["tel","📱","Telefon & internet","Phone & internet","full"],["minyak","⛽","Minyak, tol & parkir","Fuel, toll & parking","full"],["hantar","🚚","Penghantaran & pos","Delivery & postage","full"],
  ["iklan","📣","Pemasaran & iklan","Marketing & ads","full"],["baiki","🔧","Penyelenggaraan & pembaikan","Repairs & maintenance","full"],["yuran","📑","Akauntan, guaman & profesional","Accounting, legal & professional","full"],
  ["bank","🏦","Caj bank & bayaran","Bank & payment fees","full"],["lesen","🪪","Lesen, permit & SSM","Licences, permits & SSM","full"],["takaful","☂️","Takaful & insurans perniagaan","Business takaful & insurance","full"],
  ["latihan","🎓","Latihan & kursus","Training & courses","full"],["perisian","💻","Perisian & langganan","Software & subscriptions","full"],["alat","🧰","Peralatan kecil","Small tools & supplies","full"],
  ["hiburan","🍽","Makan & hiburan pelanggan","Client meals & entertainment","half"],["aset","🏗","Aset (mesin, kenderaan, komputer)","Assets (machines, vehicles, computers)","cap"],
  ["zakat","💰","Zakat perniagaan","Business zakat","zakat"],["derma","🤲","Derma & sumbangan","Donations","no"],["peribadi","🙋","Peribadi / ambilan pemilik","Personal / owner's drawings","no"],
  ["denda","⛔","Denda & penalti","Fines & penalties","no"],["lain","•","Lain-lain","Others","full"]];
var TX = {full:["Boleh ditolak","Deductible","#15803d"], half:["50% boleh ditolak","50% deductible","#b45309"], cap:["Elaun modal","Capital allowance","#1d4ed8"], no:["Tidak boleh ditolak","Not deductible","#b91c1c"], zakat:["Zakat (had 2.5%)","Zakat (2.5% cap)","#6d28d9"]};
var METH = [["cash","💵","Tunai","Cash"],["petty","👛","Wang runcit","Petty cash"],["bank","🏦","Pindahan bank","Bank transfer"],["card","💳","Kad","Card"],["ewallet","📲","e-Dompet","e-Wallet"],["cheque","🧾","Cek","Cheque"]];
var FREQ = [["w","Mingguan","Weekly"],["m","Bulanan","Monthly"],["y","Tahunan","Yearly"]];
function L(a, b){ return X.H.L2x(a, b); }
function E(s){ return X.H.esc(s == null ? "" : String(s)); }
function cat(id){ for(var i = 0; i < CATS.length; i++) if(CATS[i][0] === id) return CATS[i]; return CATS[CATS.length - 1]; }
function txOf(e){ return e.ded || cat(e.cat)[4]; }
function D(){ return X.D(); }
function MON(i){ return L(["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"][i], ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]); }
function ymName(ym){ return MON(+ym.slice(5, 7) - 1) + " " + ym.slice(0, 4); }
function shiftYm(ym, k){ var d = new Date(+ym.slice(0, 4), +ym.slice(5, 7) - 1 + k, 1); return N.ymd(d).slice(0, 7); }
function counts(e){ return !e.del && !e.rule && !e.pending && e.cat !== "_topup"; }
function mine(e){ return !X.staff() || e.mk === D().dev.id; }
function list(pid){ return N.live(D().expenses).filter(function(e){ return e.pid === pid && mine(e); }); }

// ---------- money summaries (also used by the dashboard) ----------
function sum(Dd, pid, f, to){ var s = 0; N.live(Dd.expenses).forEach(function(e){ if(e.pid === pid && counts(e) && e.date >= f && e.date <= to) s += N.sen(e.amt); }); return s; }
function petty(pid){ var b = 0; list(pid).forEach(function(e){ if(e.del || e.rule || e.pending) return; if(e.cat === "_topup") b += N.sen(e.amt); else if(e.method === "petty") b -= N.sen(e.amt); }); return b; }

// ---------- recurring: add what is due up to today ----------
function nextDate(d, f){ var p = d.split("-"), y = +p[0], m = +p[1] - 1, dd = +p[2];
  if(f === "w") return N.addDays(d, 7);
  if(f === "y") return N.ymd(new Date(y + 1, m, Math.min(dd, new Date(y + 1, m + 1, 0).getDate())));
  return N.ymd(new Date(y, m + 1, Math.min(dd, new Date(y, m + 2, 0).getDate()))); }
function recur(Dd, pid){ var t = N.ymd(), add = 0;
  N.live(Dd.expenses).filter(function(r){ return r.rule && r.pid === pid && r.rep; }).forEach(function(r){ var g = 0;
    while(r.rep.next && r.rep.next <= t && (!r.rep.end || r.rep.next <= r.rep.end) && g++ < 60){
      var e = {id:N.rid(), pid:pid, date:r.rep.next, cat:r.cat, vendor:r.vendor, amt:r.amt, tax:r.tax || "", method:r.method, note:r.note || "", from:r.id, pending:!!r.rep.ask, mk:r.mk || Dd.dev.id, ded:r.ded || ""};
      N.stamp(Dd, e); Dd.expenses.push(e); r.rep.next = nextDate(r.rep.next, r.rep.f); add++; }
    if(g) N.stamp(Dd, r); });
  return add; }
function remindRules(pid){ if(!X.H.xrem) return; N.live(D().expenses).filter(function(r){ return r.rule && r.pid === pid && r.rep; }).forEach(function(r){ var p = (r.rep.next || "").split("-"), t = p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2], 9, 3).getTime() : 0;
  X.H.xrem("ngx" + r.id, r.del ? 0 : t, "🔁 " + (r.vendor || L(cat(r.cat)[2], cat(r.cat)[3])), (r.rep.ask ? L("Sahkan amaun belanja berulang hari ini", "Confirm the amount of today's recurring expense") : L("Belanja berulang ditambah: ", "Recurring expense added: ") + X.money(N.sen(r.amt))), "side:alat/niaga"); }); }

// ---------- page ----------
function view(el, x){ X = x; var p = X.prof(), Dd = D(); if(!ST.ym) ST.ym = N.ymd().slice(0, 7); if(!ST.y) ST.y = +N.ymd().slice(0, 4);
  if(recur(Dd, p.id)){ X.save(); } remindRules(p.id);
  var all = list(p.id), mon = all.filter(function(e){ return counts(e) && e.date.slice(0, 7) === ST.ym; }).sort(function(a, b){ return b.date.localeCompare(a.date); }), tot = mon.reduce(function(s, e){ return s + N.sen(e.amt); }, 0);
  var pend = all.filter(function(e){ return e.pending && !e.del; }), rules = all.filter(function(e){ return e.rule && !e.del; }), pc = petty(p.id), usesPetty = all.some(function(e){ return e.method === "petty" || e.cat === "_topup"; });
  var h = '<div class="ngMonNav"><button class="ib" id="exP">‹</button><b>' + ymName(ST.ym) + '</b><button class="ib" id="exN">›</button></div>' +
    '<div class="ngTiles"><div class="ngTile bad"><small>💸 ' + (ST.ym === N.ymd().slice(0, 7) ? L("Belanja bulan ini", "Spent this month") : L("Belanja ", "Spent in ") + ymName(ST.ym)) + '</small><b>' + X.money(tot) + '</b><i>' + mon.length + L(" rekod", " records") + '</i></div>' +
    '<button class="ngTile" id="exPC"><small>👛 ' + L("Wang runcit", "Petty cash") + '</small><b' + (pc < 0 ? ' class="bad"' : '') + '>' + X.money(pc) + '</b><i>' + (usesPetty ? L("ketik untuk tambah wang", "tap to top up") : L("ketik untuk mula", "tap to start")) + '</i></button></div>' +
    '<div class="ngShare"><button class="btn gold g3d" id="exAdd">＋ ' + L("Belanja", "Expense") + '</button><button class="btn alt g3d" id="exScan">📷 ' + L("Imbas resit", "Scan receipt") + '</button>' +
    (X.staff() ? '' : '<button class="btn alt g3d" id="exRule">🔁 ' + L("Berulang", "Recurring") + (rules.length ? " (" + rules.length + ")" : "") + '</button><button class="btn alt g3d" id="exTax">🧾 ' + L("Ringkasan cukai", "Tax summary") + '</button>') + '</div>';
  if(pend.length) h += '<div class="card"><h3>⏳ ' + L("Sahkan amaun", "Confirm the amount") + '</h3>' + pend.map(function(e){ return row(e, true); }).join("") + '</div>';
  if(!mon.length) h += '<div class="card mut center">' + L("Tiada belanja bulan ini. Rekod resit supaya untung dan cukai tepat.", "No expenses this month. Record receipts so profit and tax are right.") + '</div>';
  var day = ""; mon.forEach(function(e){ if(e.date !== day){ day = e.date; h += '<div class="ngMon"><b>' + X.TP.dateStr(e.date, X.H.en() ? "en" : "bm") + '</b></div>'; } h += row(e); });
  if(mon.length){ var bc = {}; mon.forEach(function(e){ bc[e.cat] = (bc[e.cat] || 0) + N.sen(e.amt); }); var ks = Object.keys(bc).sort(function(a, b){ return bc[b] - bc[a]; }), mx = bc[ks[0]] || 1;
    h += '<div class="card"><h3>' + L("Ikut kategori", "By category") + '</h3>' + ks.map(function(k){ var c = cat(k); return '<div class="ngCatB"><span>' + c[1] + ' ' + L(c[2], c[3]) + '</span><b>' + X.money(bc[k]) + '</b><i style="width:' + Math.round(bc[k] / mx * 100) + '%"></i></div>'; }).join("") + '</div>'; }
  el.innerHTML = h;
  var on = function(id, f){ var b = el.querySelector(id); if(b) b.onclick = f; };
  on("#exP", function(){ ST.ym = shiftYm(ST.ym, -1); X.draw(); }); on("#exN", function(){ ST.ym = shiftYm(ST.ym, 1); X.draw(); });
  on("#exAdd", function(){ form(null, {}); }); on("#exScan", scan); on("#exRule", rulesSheet); on("#exTax", taxSheet); on("#exPC", pettySheet);
  el.querySelectorAll("[data-ex]").forEach(function(b){ b.onclick = function(){ form(b.getAttribute("data-ex")); }; }); }
function row(e, conf){ var c = cat(e.cat), t = txOf(e);
  return '<button class="ngRow card" data-ex="' + e.id + '"><i>' + (e.photo ? "🧾" : c[1]) + '</i><span><b>' + E(e.vendor || L(c[2], c[3])) + '</b><small>' + E(L(c[2], c[3])) + (e.method === "petty" ? " · 👛" : "") + (e.from ? " · 🔁" : "") + ' · <em style="color:' + TX[t][2] + '">' + L(TX[t][0], TX[t][1]) + '</em>' + (conf ? ' · ' + X.TP.dateStr(e.date, X.H.en() ? "en" : "bm") : '') + '</small></span><span class="ngDA"><b>' + X.money(N.sen(e.amt)) + '</b>' + (conf ? '<small>' + L("ketik untuk sahkan", "tap to confirm") + '</small>' : '') + '</span></button>'; }

// ---------- add / edit ----------
function form(id, pre){ var Dd = D(), p = X.prof(), e = id ? N.byId(Dd.expenses, id) : null, o = e ? N.clone(e) : Object.assign({date:N.ymd(), cat:"stok", method:"cash", amt:"", vendor:"", tax:"", ref:"", note:""}, pre || {}), photo = o.photo || "", newPhoto = pre && pre._photo || "";
  var rule = o.from ? N.byId(Dd.expenses, o.from) : null;
  var ov = X.H.showSheet((e ? "✎ " : "＋ ") + L("Belanja perniagaan", "Business expense"),
    '<div class="f2">' + X.fld("exA", L("Amaun", "Amount"), o.amt, "text", ' inputmode="decimal" data-calc="1" placeholder="0.00"') + X.fld("exD", L("Tarikh", "Date"), o.date, "date") + '</div>' +
    '<div class="snl">' + L("Kategori", "Category") + '</div><div class="ngCats">' + CATS.map(function(c){ return '<button class="' + (o.cat === c[0] ? "on" : "") + '" data-ct="' + c[0] + '"><span>' + c[1] + '</span>' + L(c[2], c[3]) + '</button>'; }).join("") + '</div><div class="mut tiny" id="exTx"></div>' +
    X.fld("exV", L("Pembekal / kedai", "Supplier / shop"), o.vendor, "text", ' list="exVl"') + '<datalist id="exVl">' + uniq(list(p.id).map(function(x){ return x.vendor; })).map(function(v){ return '<option value="' + E(v) + '">'; }).join("") + '</datalist>' +
    '<div class="snl">' + L("Dibayar dengan", "Paid with") + '</div><div class="chips">' + METH.map(function(m){ return '<button class="chip' + (o.method === m[0] ? " on" : "") + '" data-mt="' + m[0] + '">' + m[1] + ' ' + L(m[2], m[3]) + '</button>'; }).join("") + '</div>' +
    '<div class="f2">' + X.fld("exT", L("SST / cukai dibayar (jika ada)", "SST / tax paid (if any)"), o.tax, "text", ' inputmode="decimal" data-calc="1"') + X.fld("exR", L("No. resit / invois", "Receipt / invoice no."), o.ref) + '</div>' +
    X.area("exNo", L("Nota", "Note"), o.note, 2) +
    '<div class="snl">🧾 ' + L("Resit", "Receipt") + '</div><div class="ngExPh" id="exPh"></div><div class="btns"><button class="btn alt sm g3d" data-ph="camera">📷 ' + L("Kamera", "Camera") + '</button><button class="btn alt sm g3d" data-ph="gallery">🖼 ' + L("Galeri", "Gallery") + '</button></div>' +
    (!e && !X.staff() ? '<div class="snl">🔁 ' + L("Ulang", "Repeat") + '</div><div class="chips" id="exRp"><button class="chip on" data-rp="">' + L("Sekali", "Once") + '</button>' + FREQ.map(function(f){ return '<button class="chip" data-rp="' + f[0] + '">' + L(f[1], f[2]) + '</button>'; }).join("") + '</div>' +
      '<label class="ngTog" id="exAskW" style="display:none"><input type="checkbox" id="exAsk"><span><b>' + L("Amaun berubah setiap kali", "The amount changes each time") + '</b><small>' + L("cth. bil elektrik: ditambah sebagai \"sahkan amaun\"", "e.g. electricity: added as \"confirm the amount\"") + '</small></span></label>' : '') +
    (rule ? '<div class="mut small">🔁 ' + L("Daripada belanja berulang", "From a recurring expense") + '</div>' : '') +
    '<div class="btns" style="margin-top:10px">' + (e ? '<button class="btn alt g3d" id="exDel">🗑</button>' : '') + '<button class="btn gold g3d" id="exOk" style="flex:1">✓ ' + (o.pending ? L("Sahkan", "Confirm") : L("Simpan", "Save")) + '</button></div>');
  X.calcBind(ov); var rep = "";
  var showTx = function(){ var t = cat(o.cat)[4], hint = {full:L("Belanja ini biasanya boleh ditolak daripada pendapatan perniagaan.", "Usually deductible from business income."), half:L("Makan & hiburan pelanggan: biasanya hanya 50% boleh ditolak.", "Client meals & entertainment: usually only 50% is deductible."), cap:L("Aset: tidak ditolak terus, tetapi layak elaun modal (tanya akauntan).", "Assets: not deducted directly, but may get capital allowance (ask your accountant)."), no:L("Biasanya tidak boleh ditolak untuk cukai.", "Usually not deductible for tax."), zakat:L("Zakat perniagaan: potongan sehingga 2.5% pendapatan agregat (s.44(11A)).", "Business zakat: deduction up to 2.5% of aggregate income (s.44(11A)).")}[t];
    ov.querySelector("#exTx").innerHTML = '<span style="color:' + TX[t][2] + '">● ' + L(TX[t][0], TX[t][1]) + '</span> · ' + hint; };
  var showPh = function(){ var s = newPhoto || (photo ? X.imgGet(photo) : ""); ov.querySelector("#exPh").innerHTML = s ? '<img src="' + s + '" alt="" data-zoom="1" data-drive="' + E(photo && X.driveOf ? X.driveOf(photo) || "" : "") + '"><button class="chip" id="exPx">✕</button>' : '<span class="mut small">' + L("Tiada gambar. Simpan resit untuk audit 7 tahun.", "No photo. Keep receipts for the 7-year audit.") + '</span>';
    var x = ov.querySelector("#exPx"); if(x) x.onclick = function(){ newPhoto = ""; photo = ""; showPh(); }; };
  showTx(); showPh();
  ov.querySelectorAll("[data-ct]").forEach(function(b){ b.onclick = function(){ o.cat = b.getAttribute("data-ct"); ov.querySelectorAll("[data-ct]").forEach(function(x){ x.classList.toggle("on", x === b); }); showTx(); }; });
  ov.querySelectorAll("[data-mt]").forEach(function(b){ b.onclick = function(){ o.method = b.getAttribute("data-mt"); ov.querySelectorAll("[data-mt]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; });
  ov.querySelectorAll("[data-rp]").forEach(function(b){ b.onclick = function(){ rep = b.getAttribute("data-rp"); ov.querySelectorAll("[data-rp]").forEach(function(x){ x.classList.toggle("on", x === b); }); ov.querySelector("#exAskW").style.display = rep ? "" : "none"; }; });
  ov.querySelectorAll("[data-ph]").forEach(function(b){ b.onclick = function(){ X.pickImg(b.getAttribute("data-ph"), function(d){ X.shrinkJ(d, 1400, function(j){ newPhoto = j; showPh(); }); }); }; });
  ov.querySelector("#exOk").onclick = function(){ var g = function(i){ return X.gv(ov, i); }, a = N.calc(g("exA")); if(!(N.num(a) > 0)){ X.H.toast(L("Masukkan amaun", "Enter the amount")); return; }
    var Dd2 = D(), rec = e ? N.byId(Dd2.expenses, e.id) : {id:N.rid(), pid:p.id, mk:Dd2.dev.id, created:N.iso()};
    rec.amt = N.num(a); rec.date = g("exD") || N.ymd(); rec.cat = o.cat; rec.vendor = g("exV").trim(); rec.method = o.method; rec.tax = g("exT") === "" ? "" : N.num(N.calc(g("exT"))); rec.ref = g("exR").trim(); rec.note = g("exNo");
    if(newPhoto){ var pid2 = N.rid(); X.imgPut(pid2, newPhoto); rec.photo = pid2; } else if(!photo) delete rec.photo;
    if(rec.pending){ delete rec.pending; var r0 = rec.from && N.byId(Dd2.expenses, rec.from); if(r0){ r0.amt = rec.amt; N.stamp(Dd2, r0); } }
    N.stamp(Dd2, rec); if(!e) Dd2.expenses.push(rec);
    if(rep){ var rl = {id:N.rid(), pid:p.id, mk:Dd2.dev.id, rule:true, cat:rec.cat, vendor:rec.vendor, amt:rec.amt, method:rec.method, tax:rec.tax, note:rec.note, rep:{f:rep, ask:!!g("exAsk"), next:nextDate(rec.date, rep)}, created:N.iso()};
      N.stamp(Dd2, rl); Dd2.expenses.push(rl); rec.from = rl.id; N.stamp(Dd2, rec); }
    X.sv(); X.H.closeOverlay(); ST.ym = rec.date.slice(0, 7); X.draw(); X.H.toast("✅ " + L("Disimpan", "Saved")); };
  var dx = ov.querySelector("#exDel"); if(dx) dx.onclick = function(){ if(!confirm(L("Padam belanja ini?", "Delete this expense?"))) return; var r = N.byId(D().expenses, e.id); r.del = true; N.stamp(D(), r); X.sv(); X.H.closeOverlay(); X.draw(); }; }
function uniq(a){ var s = {}, o = []; a.forEach(function(v){ v = String(v || "").trim(); if(v && !s[v.toLowerCase()]){ s[v.toLowerCase()] = 1; o.push(v); } }); return o.slice(0, 50); }

// ---------- receipt scan with the chosen AI ----------
function scan(){ X.pickImg("camera", function(img){ var go = function(){ var A = window.HalalAI; if(!A || !(A.ready && A.ready())){ if(window.AIRun) AIRun.open("receipt"); else X.H.toast(L("Sediakan AI di Tetapan › AI", "Set up an AI in Settings › AI")); return; }
    X.H.toast("✨ " + L("Membaca resit…", "Reading the receipt…"));
    X.shrinkJ(img, 1600, function(u){ A.complete([{role:"user", content:[{type:"text", text:"Read this business purchase receipt. Reply ONLY with JSON: {\"shop\": \"supplier name\", \"date\": \"YYYY-MM-DD or empty\", \"total\": 12.34 (final amount paid), \"tax\": 0.00 (SST or service tax amount shown, else 0), \"ref\": \"receipt or invoice number or empty\", \"category\": one of " + CATS.map(function(c){ return c[0] + " (" + c[3] + ")"; }).join(", ") + ", \"payment\": cash|card|ewallet|bank or empty}."}, {type:"image_url", image_url:{url:u}}]}], 700, function(a, b){ return L(a, b); }, "", "receipt")
      .then(function(r){ var m = String(r.text || "").replace(/```json|```/g, "").match(/\{[\s\S]*\}/), j = null; try{ j = m && JSON.parse(m[0]); }catch(e){}
        if(!j || !j.total) throw new Error(L("Jumlah tidak dijumpai. Cuba gambar yang lebih jelas.", "No total found. Try a clearer photo."));
        X.shrinkJ(img, 1400, function(ph){ form(null, {amt:+j.total, vendor:String(j.shop || ""), date:/^\d{4}-\d{2}-\d{2}$/.test(j.date || "") ? j.date : N.ymd(), tax:+j.tax || "", ref:String(j.ref || ""), cat:CATS.some(function(c){ return c[0] === j.category; }) ? j.category : "lain",
          method:METH.some(function(x){ return x[0] === j.payment; }) ? j.payment : "cash", _photo:ph}); }); })
      .catch(function(e){ X.H.toast("⚠️ " + (e && e.message || e)); }); }); };
  if(window.HalalAI) go(); else { var s = document.createElement("script"); s.src = "halal/halal_ai.js"; s.onload = go; document.head.appendChild(s); } }); }

// ---------- petty cash ----------
function pettySheet(){ var p = X.prof(), all = list(p.id).filter(function(e){ return !e.del && !e.rule && !e.pending && (e.cat === "_topup" || e.method === "petty"); }).sort(function(a, b){ return b.date.localeCompare(a.date); });
  var ov = X.H.showSheet("👛 " + L("Wang runcit", "Petty cash"), '<div class="card center"><small class="mut">' + L("Baki", "Balance") + '</small><div class="ngBig">' + X.money(petty(p.id)) + '</div></div>' +
    '<div class="f2">' + X.fld("pcA", L("Tambah wang (top-up)", "Add money (top-up)"), "", "text", ' inputmode="decimal" data-calc="1"') + X.fld("pcD", L("Tarikh", "Date"), N.ymd(), "date") + '</div><button class="btn gold full g3d" id="pcOk">＋ ' + L("Tambah ke wang runcit", "Add to petty cash") + '</button>' +
    '<div class="mut small" style="margin:8px 0">' + L("Belanja kecil: pilih \"👛 Wang runcit\" sebagai cara bayar.", "Small spending: choose \"👛 Petty cash\" as the payment method.") + '</div>' +
    all.slice(0, 40).map(function(e){ return '<div class="ngKV"><span>' + X.TP.dateStr(e.date, X.H.en() ? "en" : "bm") + ' · ' + E(e.cat === "_topup" ? L("Tambah wang", "Top-up") : (e.vendor || L(cat(e.cat)[2], cat(e.cat)[3]))) + '</span><b' + (e.cat === "_topup" ? ' class="fpos"' : '') + '>' + (e.cat === "_topup" ? "+" : "−") + X.money(N.sen(e.amt)) + '</b></div>'; }).join(""));
  X.calcBind(ov);
  ov.querySelector("#pcOk").onclick = function(){ var a = N.num(N.calc(X.gv(ov, "pcA"))); if(!(a > 0)){ X.H.toast(L("Masukkan amaun", "Enter the amount")); return; } var Dd = D(), r = {id:N.rid(), pid:p.id, mk:Dd.dev.id, cat:"_topup", amt:a, date:X.gv(ov, "pcD") || N.ymd(), method:"cash", created:N.iso()}; N.stamp(Dd, r); Dd.expenses.push(r); X.sv(); X.H.closeOverlay(); X.draw(); }; }

// ---------- recurring list ----------
function rulesSheet(){ var p = X.prof(), rs = list(p.id).filter(function(e){ return e.rule && !e.del; });
  var ov = X.H.showSheet("🔁 " + L("Belanja berulang", "Recurring expenses"), (rs.length ? rs.map(function(r){ var c = cat(r.cat), f = FREQ.filter(function(x){ return x[0] === r.rep.f; })[0];
      return '<div class="ngRow card"><i>' + c[1] + '</i><span><b>' + E(r.vendor || L(c[2], c[3])) + '</b><small>' + L(f[1], f[2]) + ' · ' + X.money(N.sen(r.amt)) + (r.rep.ask ? L(" · sahkan amaun", " · confirm amount") : "") + ' · ' + L("seterusnya ", "next ") + X.TP.dateStr(r.rep.next, X.H.en() ? "en" : "bm") + '</small></span><button class="chip" data-rx="' + r.id + '">' + L("Henti", "Stop") + '</button></div>'; }).join("")
    : '<div class="mut">' + L("Tiada lagi. Tambah belanja dan pilih Ulang: Mingguan / Bulanan / Tahunan (sewa, gaji, internet, langganan).", "None yet. Add an expense and choose Repeat: Weekly / Monthly / Yearly (rent, salary, internet, subscriptions).") + '</div>') +
    '<button class="btn gold full g3d" id="rlAdd" style="margin-top:10px">＋ ' + L("Belanja berulang baharu", "New recurring expense") + '</button>');
  ov.querySelectorAll("[data-rx]").forEach(function(b){ b.onclick = function(){ if(!confirm(L("Hentikan? Rekod lama kekal.", "Stop it? Past records stay."))) return; var r = N.byId(D().expenses, b.getAttribute("data-rx")); r.del = true; N.stamp(D(), r); X.sv(); remindRules(p.id); X.H.closeOverlay(); X.draw(); }; });
  ov.querySelector("#rlAdd").onclick = function(){ X.H.closeOverlay(); form(null, {cat:"sewa"}); setTimeout(function(){ var b = document.querySelector('#exRp [data-rp="m"]'); if(b) b.click(); }, 50); }; }

// ---------- tax summary (a guide for Borang B / BE / P; check with an accountant or LHDN) ----------
function taxData(pid, y){ var f = y + "-01-01", to = y + "-12-31", Dd = D(), p = N.byId(Dd.profiles, pid), T = {billed:0, col:0, sstOut:0, exp:0, ded:0, half:0, cap:0, no:0, zakat:0, sstIn:0, by:{}, caps:[]};
  N.live(Dd.docs).forEach(function(d){ if(d.pid !== pid || d.status === "draft" || d.status === "void") return; var t = N.totals(Dd, d, p);
    if((d.type === "INV" || d.type === "CS") && d.date >= f && d.date <= to){ T.billed += t.total - (p.tax && p.tax.inclusive ? 0 : t.taxSum); T.sstOut += t.taxSum; }
    if((d.type === "OR" && !d.cr && (d.pdate || d.date) >= f && (d.pdate || d.date) <= to) || (d.type === "CS" && d.date >= f && d.date <= to)) T.col += t.total;
    if(d.type === "CN" && d.refAmt && (d.rdate || d.date) >= f && (d.rdate || d.date) <= to) T.col -= N.sen(d.refAmt); });
  N.live(Dd.expenses).forEach(function(e){ if(e.pid !== pid || !counts(e) || e.date < f || e.date > to) return; var a = N.sen(e.amt), tx = txOf(e); T.exp += a; T.sstIn += N.sen(e.tax);
    var b = T.by[e.cat] = T.by[e.cat] || {a:0, d:0, n:0}; b.a += a; b.n++;
    if(tx === "full"){ T.ded += a; b.d += a; } else if(tx === "half"){ T.ded += Math.round(a / 2); T.half += a; b.d += Math.round(a / 2); } else if(tx === "cap"){ T.cap += a; T.caps.push(e); } else if(tx === "zakat") T.zakat += a; else T.no += a; });
  T.adj = T.billed - T.ded; return T; }
function taxSheet(){ var p = X.prof(), y = ST.y, T = taxData(p.id, y), ks = Object.keys(T.by).sort(function(a, b){ return T.by[b].a - T.by[a].a; });
  var kv = function(a, b, cls){ return '<div class="ngKV"><span>' + a + '</span><b' + (cls ? ' class="' + cls + '"' : '') + '>' + b + '</b></div>'; };
  var ov = X.H.showSheet("🧾 " + L("Ringkasan cukai ", "Tax summary ") + y, '<div class="ngMonNav"><button class="ib" id="txP">‹</button><b>' + y + '</b><button class="ib" id="txN">›</button></div>' +
    '<div class="card"><h3>' + L("Pendapatan", "Income") + '</h3>' + kv(L("Jualan (invois + bil tunai, tanpa SST)", "Sales (invoices + cash sales, excl. SST)"), X.money(T.billed)) + kv(L("Kutipan diterima", "Collected"), X.money(T.col)) + (T.sstOut ? kv(L("SST dikutip (bukan pendapatan)", "SST collected (not income)"), X.money(T.sstOut)) : '') + '</div>' +
    '<div class="card"><h3>' + L("Belanja ikut kategori", "Expenses by category") + '</h3>' + (ks.length ? ks.map(function(k){ var c = cat(k), t = c[4]; return '<div class="ngKV"><span>' + c[1] + ' ' + L(c[2], c[3]) + ' <em style="color:' + TX[t][2] + ';font-style:normal;font-size:11px">' + L(TX[t][0], TX[t][1]) + '</em></span><b>' + X.money(T.by[k].a) + '</b></div>'; }).join("") : '<div class="mut">' + L("Tiada belanja tahun ini", "No expenses this year") + '</div>') + '</div>' +
    '<div class="card"><h3>' + L("Anggaran untuk borang cukai", "Estimate for the tax form") + '</h3>' +
      kv(L("Jumlah belanja", "Total expenses"), X.money(T.exp)) + kv(L("Belanja boleh ditolak", "Deductible expenses"), X.money(T.ded), "fpos") + (T.half ? kv(L("Hiburan (50% sahaja)", "Entertainment (50% only)"), X.money(T.half)) : '') +
      (T.no ? kv(L("Tidak boleh ditolak", "Not deductible"), X.money(T.no), "bad") : '') + (T.cap ? kv(L("Aset (tuntut elaun modal)", "Assets (claim capital allowance)"), X.money(T.cap)) : '') + (T.zakat ? kv(L("Zakat perniagaan dibayar", "Business zakat paid"), X.money(T.zakat)) : '') +
      (T.sstIn ? kv(L("SST dibayar atas belian", "SST paid on purchases"), X.money(T.sstIn)) : '') +
      kv('<b>' + L("Anggaran pendapatan larasan", "Estimated adjusted income") + '</b>', X.money(T.adj), T.adj < 0 ? "bad" : "") +
      '<div class="mut tiny" style="margin-top:6px">ⓘ ' + L("Panduan sahaja (Borang B untuk perniagaan individu, P untuk perkongsian, C untuk Sdn Bhd). Elaun modal, zakat (had 2.5%) dan pelepasan peribadi dikira berasingan. Semak dengan akauntan atau LHDN. Simpan resit 7 tahun.", "A guide only (Form B for sole proprietors, P for partnerships, C for Sdn Bhd). Capital allowance, zakat (2.5% cap) and personal reliefs are worked out separately. Check with an accountant or LHDN. Keep receipts for 7 years.") + '</div></div>' +
    '<div class="ngShare"><button class="btn alt g3d" id="txCsv">⬇️ CSV ' + y + '</button><button class="btn alt g3d" id="txSh">📤 ' + L("Kongsi ringkasan", "Share summary") + '</button></div>');
  ov.querySelector("#txP").onclick = function(){ ST.y--; X.H.closeOverlay(); taxSheet(); }; ov.querySelector("#txN").onclick = function(){ ST.y++; X.H.closeOverlay(); taxSheet(); };
  ov.querySelector("#txCsv").onclick = function(){ var rows = [[L("Tarikh", "Date"), L("Kategori", "Category"), L("Pembekal", "Supplier"), L("Amaun", "Amount"), "SST", L("Kaedah", "Method"), L("No. resit", "Receipt no."), L("Layanan cukai", "Tax treatment"), L("Boleh ditolak", "Deductible"), L("Nota", "Note")]];
    N.live(D().expenses).filter(function(e){ return e.pid === p.id && counts(e) && e.date.slice(0, 4) === String(y); }).sort(function(a, b){ return a.date.localeCompare(b.date); }).forEach(function(e){ var t = txOf(e), a = N.sen(e.amt), d = t === "full" ? a : t === "half" ? Math.round(a / 2) : 0;
      rows.push([e.date, L(cat(e.cat)[2], cat(e.cat)[3]), e.vendor || "", N.rm(a), e.tax || "", e.method || "", e.ref || "", L(TX[t][0], TX[t][1]), N.rm(d), e.note || ""]); });
    var name = "belanja-" + (p.name || "biz").replace(/[^A-Za-z0-9]+/g, "-") + "-" + y + ".csv", txt = N.csvMake(rows); if(window.Native && X.H.N.openTextFile) X.H.N.openTextFile(name, "text/csv", txt, true); else X.saveText(name, txt, "text/csv"); };
  ov.querySelector("#txSh").onclick = function(){ var t = p.name + " · " + L("Ringkasan cukai ", "Tax summary ") + y + "\n" + L("Jualan: ", "Sales: ") + X.money(T.billed) + "\n" + L("Belanja: ", "Expenses: ") + X.money(T.exp) + "\n" + L("Boleh ditolak: ", "Deductible: ") + X.money(T.ded) + "\n" + (T.cap ? L("Aset (elaun modal): ", "Assets (capital allowance): ") + X.money(T.cap) + "\n" : "") + (T.zakat ? L("Zakat perniagaan: ", "Business zakat: ") + X.money(T.zakat) + "\n" : "") + L("Anggaran pendapatan larasan: ", "Estimated adjusted income: ") + X.money(T.adj) + "\n" + ks.map(function(k){ return "• " + L(cat(k)[2], cat(k)[3]) + ": " + X.money(T.by[k].a); }).join("\n");
    if(window.Native && X.H.N.shareText) X.H.N.shareText(t); else { try{ navigator.clipboard.writeText(t); }catch(e){} X.H.toast(L("Disalin", "Copied")); } }; }

window.NiagaExp = {view:view, sum:sum, recur:recur, petty:function(x, pid){ X = x; return petty(pid); }, taxData:function(x, pid, y){ X = x; return taxData(pid, y); }, CATS:CATS, TX:TX, cat:cat, txOf:txOf, counts:counts};
})();
