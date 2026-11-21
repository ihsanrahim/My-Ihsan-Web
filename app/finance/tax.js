/* My Ihsan 0.6.70 (owner): Kewangan › Belanja › 🧾 Cukai LHDN (personal income tax, Malaysia, resident individual).
   - Reliefs for the year with their limits (YA 2025 list; marked "check with LHDN each year"), what you have claimed against each, receipts.
   - A claim comes from an expense ticked "Claim as tax relief" (the expense's receipt photo goes with it) or is added here directly.
   - Income: salary from the expense tracker (or typed), other income, PCB/MTD already deducted, EPF, SOCSO, zakat (a rebate).
   - Estimate: chargeable income → tax on the resident scale → rebates (RM400, zakat) → minus PCB = to pay or refund.
   - Year-end report (PDF + CSV) with every claim, ready for e-Filing (Form BE: 30 April; e-Filing 15 May). Business owners: Form B summary
     from Business (ihsan_biz) with the 30 June date. Reminders for e-Filing.
   0.6.72: its own Finance tab (FinMore.cukai in expense.js). Storage: inside ihsan_expense: tax {YYYY: {inc, incAuto, other, pcb, epf, socso, spouse, kids:[], claims:[]}}; expense tx.tax = relief id.
   ExpTax.page(api) → html, ExpTax.bind(root, api), ExpTax.pick(t, api) (the expense form's relief picker), ExpTax.CATS. */
(function(){
"use strict";
var A = null;
function L(a, b){ return A.L(a, b); }
function E(s){ return A.E(s); }
// [id, icon, BM, EN, limit RM, matching expense categories, note BM, note EN]
var CATS = [
  ["parents","👵","Perubatan ibu bapa / datuk nenek","Medical for parents / grandparents",8000,["health"],"Rawatan, penjagaan, pergigian, pemeriksaan penuh (1,000).","Treatment, care, dental, full check-up (1,000)."],
  ["disEq","🦽","Peralatan sokongan OKU","Supporting equipment (disabled)",6000,["health"],"Untuk diri, pasangan, anak atau ibu bapa OKU.","For yourself, spouse, child or parent with a disability."],
  ["edu","🎓","Yuran pendidikan (diri sendiri)","Education fees (self)",7000,["edu"],"Ijazah lanjutan, profesional; kursus kemahiran sehingga 2,000.","Postgraduate, professional; upskilling courses up to 2,000."],
  ["medical","🏥","Perubatan diri, pasangan, anak","Medical (self, spouse, child)",10000,["health"],"Penyakit serius, kesuburan, vaksin (1,000), gigi (1,000), pemeriksaan & kesihatan mental (1,000), anak masalah pembelajaran (6,000).","Serious illness, fertility, vaccines (1,000), dental (1,000), check-up & mental health (1,000), child learning disability (6,000)."],
  ["life","📚","Gaya hidup","Lifestyle",2500,["phone","edu","shop"],"Buku, majalah, komputer, telefon, tablet, internet, kursus kemahiran.","Books, magazines, computer, phone, tablet, internet, skill courses."],
  ["sport","🏸","Sukan","Sports",1000,["fun","health"],"Peralatan sukan, sewa gelanggang, yuran pertandingan, gim.","Sports equipment, court rental, competition fees, gym."],
  ["breast","🍼","Peralatan penyusuan","Breastfeeding equipment",1000,["family"],"Sekali setiap 2 tahun, anak 2 tahun ke bawah.","Once every 2 years, child aged 2 or under."],
  ["childcare","🧸","Taska & tadika","Childcare & kindergarten",3000,["family","edu"],"Anak 6 tahun ke bawah, taska/tadika berdaftar.","Child aged 6 or under, registered centre."],
  ["sspn","🏦","SSPN (simpanan bersih)","SSPN (net savings)",8000,[],"Simpanan tolak pengeluaran dalam tahun itu.","Deposits minus withdrawals in the year."],
  ["lifeIns","🛡️","Insurans hayat / takaful","Life insurance / takaful",3000,["takaful"],"Bersama KWSP had 7,000 (KWSP 4,000).","Together with EPF limit 7,000 (EPF 4,000)."],
  ["eduMed","🩺","Insurans pendidikan & perubatan","Education & medical insurance",4000,["takaful"],"",""],
  ["prs","📈","PRS / anuiti tertangguh","PRS / deferred annuity",3000,[],"",""],
  ["ev","🔌","Pengecasan EV & kompos","EV charging & composting",2500,["fuel","home"],"Pemasangan, sewa, langganan pengecas EV; mesin kompos sisa makanan.","Installing, renting or subscribing to EV charging; food-waste composting machine."],
  ["house","🏡","Faedah pinjaman rumah pertama","First home loan interest",7000,["home"],"SPA 2025–2027: 7,000 (rumah ≤ RM500k) atau 5,000 (RM500k–750k).","SPA 2025–2027: 7,000 (home ≤ RM500k) or 5,000 (RM500k–750k)."],
  ["donation","🤝","Derma (institusi diluluskan)","Donations (approved bodies)",0,["give"],"Potongan sehingga 10% pendapatan agregat. Simpan resit dengan nombor kelulusan.","Deduction up to 10% of aggregate income. Keep receipts with the approval number."],
  ["zakat","🌙","Zakat / fitrah","Zakat / fitrah",0,["give"],"Rebat: mengurangkan cukai, ringgit untuk ringgit (tidak melebihi cukai).","Rebate: reduces the tax ringgit for ringgit (not more than the tax)."]];
var CAT = {}; CATS.forEach(function(c){ CAT[c[0]] = c; });
// resident scale YA 2025: [upper bound, rate %, tax on everything below this band]
var SCALE = [[5000,0,0],[20000,1,0],[35000,3,150],[50000,6,600],[70000,11,1500],[100000,19,3700],[400000,25,9400],[600000,26,84400],[2000000,28,136400],[Infinity,30,528400]];
function taxOn(ci){ var lo = 0; for(var i = 0; i < SCALE.length; i++){ var b = SCALE[i]; if(ci <= b[0]) return b[2] + (ci - lo) * b[1] / 100; lo = b[0]; } return 0; }
function rm(n){ return "RM " + (Math.round(n * 100) / 100).toLocaleString("en-MY", {minimumFractionDigits:2, maximumFractionDigits:2}); }
function c2(v){ return Math.round((+String(v || "").replace(/[^0-9.\-]/g, "") || 0) * 100); }
function yr(){ return A.ST.ym.slice(0, 4); }
function Y(d, y){ d.tax = d.tax || {}; var t = d.tax[y] = d.tax[y] || {}; t.claims = t.claims || []; t.kids = t.kids || []; if(t.incAuto == null) t.incAuto = true; return t; }
function claims(d, y){ var T = Y(d, y), out = T.claims.map(function(c){ return {id:c.id, cat:c.cat, amt:c.amt, date:c.date, note:c.note, img:c.img, own:true}; });
  d.tx.forEach(function(t){ if(t.tax && t.t !== "in" && t.date.slice(0, 4) === y) out.push({id:t.id, cat:t.tax, amt:t.amt, date:t.date, note:t.note, img:t.rcpt, tx:true}); });
  return out.sort(function(a, b){ return b.date.localeCompare(a.date); }); }
function salary(d, y){ return d.tx.filter(function(t){ return t.t === "in" && t.cat === "salary" && t.date.slice(0, 4) === y; }).reduce(function(s, t){ return s + t.amt; }, 0); }
function kidRelief(k){ return k.t === "dis" ? (k.study ? 16000 : 8000) : k.t === "uni" ? 8000 : 2000; }
// the estimate (all in ringgit)
function calc(d, y){ var T = Y(d, y), cl = claims(d, y), by = {}; cl.forEach(function(c){ by[c.cat] = (by[c.cat] || 0) + c.amt / 100; });
  var inc = (T.incAuto ? salary(d, y) : (T.inc || 0)) / 100 + (T.other || 0) / 100, R = [], tot = 0, add = function(lab, v){ if(v > 0){ R.push([lab, v]); tot += v; } };
  add(L("Individu (automatik)", "Individual (automatic)"), 9000);
  if(T.spouse) add(L("Pasangan tiada pendapatan", "Spouse with no income"), 4000);
  T.kids.forEach(function(k, i){ add(L("Anak ", "Child ") + (i + 1), kidRelief(k)); });
  var epf = Math.min(4000, (T.epf || 0) / 100), lifeIns = Math.min(3000, by.lifeIns || 0); add(L("KWSP", "EPF"), epf); add(L("Insurans hayat / takaful", "Life insurance / takaful"), lifeIns);
  add("PERKESO (SOCSO/EIS)", Math.min(350, (T.socso || 0) / 100));
  CATS.forEach(function(c){ if(c[4] && c[0] !== "lifeIns" && by[c[0]]) add(L(c[2], c[3]), Math.min(c[4], by[c[0]])); });
  var don = Math.min((by.donation || 0), inc * 0.10), ci = Math.max(0, inc - tot - don), tax = taxOn(ci), reb = ci <= 35000 ? 400 + (T.spouse && ci <= 35000 ? 400 : 0) : 0;
  var zak = by.zakat || 0, after = Math.max(0, tax - reb), afterZ = Math.max(0, after - zak), pcb = (T.pcb || 0) / 100;
  return {inc:inc, rel:R, relTot:tot, don:don, ci:ci, tax:tax, reb:Math.min(reb, tax), zak:Math.min(zak, after), due:afterZ, pcb:pcb, bal:afterZ - pcb, by:by}; }
function bar(v, max){ var p = max ? Math.min(100, v / max * 100) : 0; return '<span class="txBar"><i style="width:' + p + '%' + (v > max && max ? ';background:#c0392b' : '') + '"></i></span>'; }
function page(api){ A = api; var d = A.db(), y = yr(), T = Y(d, y), K = calc(d, y), cl = claims(d, y);
  var h = '<div class="card txHead"><h3>🧾 ' + L("Cukai pendapatan LHDN", "LHDN income tax") + ' · YA ' + y + '</h3><div class="mut tiny">' + L("Anggaran untuk individu pemastautin. Senarai pelepasan YA 2025: semak semula dengan LHDN setiap tahun.", "An estimate for a resident individual. YA 2025 relief list: check with LHDN every year.") + '</div>' +
    '<div class="txBig ' + (K.bal > 0 ? 'pay' : 'ref') + '"><small>' + (K.bal > 0 ? L("Anggaran perlu dibayar", "Estimated to pay") : L("Anggaran bayaran balik", "Estimated refund")) + '</small><b>' + rm(Math.abs(K.bal)) + '</b></div>' +
    '<div class="txRows"><div><span>' + L("Pendapatan", "Income") + '</span><b>' + rm(K.inc) + '</b></div><div><span>' + L("Pelepasan", "Reliefs") + '</span><b>− ' + rm(K.relTot) + '</b></div>' + (K.don ? '<div><span>' + L("Derma", "Donations") + '</span><b>− ' + rm(K.don) + '</b></div>' : '') +
    '<div><span>' + L("Pendapatan bercukai", "Chargeable income") + '</span><b>' + rm(K.ci) + '</b></div><div><span>' + L("Cukai", "Tax") + '</span><b>' + rm(K.tax) + '</b></div>' + (K.reb ? '<div><span>' + L("Rebat RM400", "RM400 rebate") + '</span><b>− ' + rm(K.reb) + '</b></div>' : '') +
    (K.zak ? '<div><span>' + L("Rebat zakat", "Zakat rebate") + '</span><b>− ' + rm(K.zak) + '</b></div>' : '') + '<div><span>' + L("PCB dipotong", "PCB deducted") + '</span><b>− ' + rm(K.pcb) + '</b></div></div>' +
    '<div class="btns"><button class="btn gold g3d" id="txAdd">＋ ' + L("Tuntutan", "Claim") + '</button><button class="btn alt g3d" id="txInc">💼 ' + L("Pendapatan & PCB", "Income & PCB") + '</button><button class="btn alt g3d" id="txRep">📄 ' + L("Laporan", "Report") + '</button></div></div>';
  h += '<div class="card"><h3>📋 ' + L("Pelepasan", "Reliefs") + '</h3><div class="txCats">' + CATS.map(function(c){ var v = K.by[c[0]] || 0;
      return '<button class="txCat" data-txc="' + c[0] + '"><span>' + c[1] + '</span><b>' + E(L(c[2], c[3])) + '</b><small>' + rm(v) + (c[4] ? ' / ' + rm(c[4]) : '') + '</small>' + (c[4] ? bar(v, c[4]) : '') + '</button>'; }).join("") + '</div>' +
    '<div class="mut tiny">' + L("Juga: individu 9,000 (automatik), pasangan 4,000, anak 2,000–8,000, KWSP 4,000, PERKESO 350 (di Pendapatan & PCB).", "Also: individual 9,000 (automatic), spouse 4,000, children 2,000–8,000, EPF 4,000, SOCSO 350 (under Income & PCB).") + '</div></div>';
  h += '<div class="card"><h3>🧾 ' + L("Tuntutan & resit", "Claims & receipts") + ' (' + cl.length + ')</h3>' + (cl.length ? cl.map(function(c){ var k = CAT[c.cat] || ["", "📄", c.cat, c.cat];
      return '<button class="txCl" data-txi="' + c.id + '"' + (c.tx ? ' data-txx="1"' : '') + '><span>' + k[1] + '</span><span class="txClT"><b>' + E(c.note || L(k[2], k[3])) + '</b><small>' + E(L(k[2], k[3])) + ' · ' + E(c.date) + (c.tx ? ' · ' + L("dari Belanja", "from Expense") : '') + '</small></span>' + (c.img ? '<i class="txClR">📎</i>' : '<i class="txClR none" title="' + E(L("Tiada resit", "No receipt")) + '">⚠️</i>') + '<b>' + rm(c.amt / 100) + '</b></button>'; }).join("") :
      '<div class="mut small">' + L("Belum ada tuntutan. Tambah di sini, atau tandakan \"Tuntut pelepasan cukai\" semasa merekod belanja.", "No claims yet. Add one here, or tick \"Claim as tax relief\" when you record an expense.") + '</div>') + '</div>';
  var bz = formB(y); if(bz) h += bz;
  h += '<div class="card"><h3>📅 ' + L("Tarikh penting", "Key dates") + '</h3><div class="txRows"><div><span>' + L("Borang BE (gaji)", "Form BE (salary)") + '</span><b>30 Apr ' + (+y + 1) + ' · e-Filing 15 Mei/May</b></div><div><span>' + L("Borang B (perniagaan)", "Form B (business)") + '</span><b>30 Jun ' + (+y + 1) + ' · e-Filing 15 Jul</b></div></div>' +
    '<label class="pdchk"><input type="checkbox" id="txRem"' + (T.rem ? ' checked' : '') + '> 🔔 ' + L("Ingatkan saya untuk e-Filing (1 Mac dan 20 April)", "Remind me to e-File (1 March and 20 April)") + '</label></div>';
  return h; }
function formB(y){ try{ var B = JSON.parse(localStorage.getItem("ihsan_biz") || "null"); if(!B || !B.profiles || !B.profiles.length) return "";
  var rev = 0, exp = 0; (B.docs || []).forEach(function(x){ if(!x.del && x.date && x.date.slice(0, 4) === y && (x.type === "OR" || x.type === "CS") && x.status !== "void") rev += +((x.totals || {}).total || 0); });
  (B.expenses || []).forEach(function(e){ if(!e.del && e.date && e.date.slice(0, 4) === y) exp += +String(e.amt || 0).replace(/[^0-9.\-]/g, "") || 0; });
  return '<div class="card"><h3>🏪 ' + L("Perniagaan (Borang B)", "Business (Form B)") + '</h3><div class="txRows"><div><span>' + L("Kutipan (resit & bil tunai)", "Collected (receipts & cash sales)") + '</span><b>' + rm(rev) + '</b></div><div><span>' + L("Belanja perniagaan", "Business expenses") + '</span><b>− ' + rm(exp) + '</b></div><div><span>' + L("Untung kasar", "Rough profit") + '</span><b>' + rm(rev - exp) + '</b></div></div><div class="mut tiny">' + L("Daripada Niaga. Anggaran sahaja: semak dengan akauntan. Untung perniagaan ditambah kepada pendapatan anda dalam Borang B.", "From Business. A rough figure only: check with your accountant. Business profit is added to your income on Form B.") + '</div></div>'; }catch(e){ return ""; } }
// add / edit a claim kept in the tax section (an expense claim opens the expense)
function claimForm(c){ var d = A.db(), y = yr(), T = Y(d, y), isNew = !c; c = c || {id:A.rid(), cat:"life", amt:0, date:A.ymd(), note:"", img:""};
  var ov = A.H.showSheet("🧾 " + (isNew ? L("Tuntutan baharu", "New claim") : L("Tuntutan", "Claim")), '<div class="txCats sm">' + CATS.map(function(k){ return '<button class="txCat sm' + (c.cat === k[0] ? ' on' : '') + '" data-cc="' + k[0] + '"><span>' + k[1] + '</span><b>' + E(L(k[2], k[3])) + '</b></button>'; }).join("") + '</div>' +
    '<div class="mut tiny" id="txNote"></div><div class="exAmt"><span>RM</span><input id="txA" inputmode="decimal" placeholder="0.00" value="' + (c.amt ? (c.amt / 100).toFixed(2) : '') + '"></div>' +
    '<input id="txN" class="rin" placeholder="' + E(L("Butiran (cth. Yuran sarjana, Kedai buku)", "Details (e.g. Master's fees, Bookshop)")) + '" value="' + E(c.note) + '"><input type="date" id="txD" class="rin" value="' + c.date + '">' +
    '<div class="txPh" id="txPh"></div><div class="btns"><button class="btn alt g3d" id="txCam">📷 ' + L("Resit", "Receipt") + '</button><button class="btn alt g3d" id="txGal">🖼</button></div>' +
    '<div class="btns"><button class="btn gold g3d" id="txSave" style="flex:1">' + L("Simpan", "Save") + '</button>' + (isNew ? '' : '<button class="btn delb" id="txDel">🗑️</button>') + '</div>');
  var q = function(s){ return ov.querySelector(s); }, img = c.img || "", note = function(){ var k = CAT[c.cat]; q("#txNote").textContent = k ? L(k[6], k[7]) + (k[4] ? " · " + L("Had ", "Limit ") + rm(k[4]) : "") : ""; };
  var ph = function(){ var s = img ? A.imgGet(img) : ""; q("#txPh").innerHTML = s ? '<img src="' + s + '" data-zoom="1" alt="">' : ''; }; note(); ph();
  ov.querySelectorAll("[data-cc]").forEach(function(b){ b.onclick = function(){ c.cat = b.getAttribute("data-cc"); ov.querySelectorAll("[data-cc]").forEach(function(z){ z.classList.toggle("on", z === b); }); note(); }; });
  var pick = function(mode){ A.pickImg(mode, function(du){ A.shrink(du, 1600, 0.82).then(function(s){ var id = "tx" + A.rid(); A.imgPut(id, s); img = id; ph(); }); }); };
  q("#txCam").onclick = function(){ pick("camera"); }; q("#txGal").onclick = function(){ pick("gallery"); };
  q("#txSave").onclick = function(){ var a = c2(q("#txA").value); if(!a){ A.H.toast(L("Masukkan jumlah", "Enter an amount")); return; } c.amt = a; c.note = q("#txN").value.trim(); c.date = q("#txD").value || A.ymd(); c.img = img;
    var dd = A.db(), TT = Y(dd, c.date.slice(0, 4)), i = TT.claims.map(function(x){ return x.id; }).indexOf(c.id); if(i >= 0) TT.claims[i] = c; else TT.claims.push(c); if(c.date.slice(0, 4) !== y){ var T0 = Y(dd, y); T0.claims = T0.claims.filter(function(x){ return x.id !== c.id || c.date.slice(0, 4) === y; }); }
    A.save(dd); A.H.closeOverlay(); A.H.toast("✓ " + L("Disimpan", "Saved")); A.draw(); };
  var dl = q("#txDel"); if(dl) dl.onclick = function(){ if(!confirm(L("Padam tuntutan ini?", "Delete this claim?"))) return; var dd = A.db(), TT = Y(dd, y); TT.claims = TT.claims.filter(function(x){ return x.id !== c.id; }); A.save(dd); A.H.closeOverlay(); A.draw(); }; }
function incomeSheet(){ var d = A.db(), y = yr(), T = Y(d, y), auto = salary(d, y);
  var kid = function(k, i){ return '<div class="txKid"><span>' + L("Anak ", "Child ") + (i + 1) + '</span><select data-kt="' + i + '"><option value="u18"' + (k.t === "u18" ? ' selected' : '') + '>' + L("Bawah 18 (2,000)", "Under 18 (2,000)") + '</option><option value="sch"' + (k.t === "sch" ? ' selected' : '') + '>' + L("18+ sekolah / A-Level (2,000)", "18+ school / A-Level (2,000)") + '</option><option value="uni"' + (k.t === "uni" ? ' selected' : '') + '>' + L("18+ diploma ke atas (8,000)", "18+ diploma or higher (8,000)") + '</option><option value="dis"' + (k.t === "dis" ? ' selected' : '') + '>' + L("OKU (8,000)", "Disabled (8,000)") + '</option></select><button class="chip" data-kx="' + i + '">✕</button></div>'; };
  var ov = A.H.showSheet("💼 " + L("Pendapatan & PCB", "Income & PCB") + " · " + y,
    '<label class="pdchk"><input type="checkbox" id="tiAuto"' + (T.incAuto ? ' checked' : '') + '> ' + L("Gaji daripada Belanja (kategori Gaji): ", "Salary from Expense (Salary category): ") + '<b>' + rm(auto / 100) + '</b></label>' +
    '<label class="fl">' + L("Pendapatan penggajian setahun (RM)", "Yearly employment income (RM)") + '<input id="tiInc" inputmode="decimal" value="' + ((T.incAuto ? auto : T.inc || 0) / 100 || "") + '"' + (T.incAuto ? ' disabled' : '') + '></label>' +
    '<label class="fl">' + L("Pendapatan lain (sewa, dividen…)", "Other income (rent, dividends…)") + '<input id="tiOth" inputmode="decimal" value="' + ((T.other || 0) / 100 || "") + '"></label>' +
    '<label class="fl">' + L("PCB / MTD dipotong setahun (EA)", "PCB / MTD deducted in the year (EA form)") + '<input id="tiPcb" inputmode="decimal" value="' + ((T.pcb || 0) / 100 || "") + '"></label>' +
    '<label class="fl">' + L("Caruman KWSP anda", "Your EPF contributions") + '<input id="tiEpf" inputmode="decimal" value="' + ((T.epf || 0) / 100 || "") + '"></label>' +
    '<label class="fl">' + L("PERKESO (SOCSO + SIP)", "SOCSO + EIS") + '<input id="tiSoc" inputmode="decimal" value="' + ((T.socso || 0) / 100 || "") + '"></label>' +
    '<label class="pdchk"><input type="checkbox" id="tiSp"' + (T.spouse ? ' checked' : '') + '> ' + L("Pasangan tiada pendapatan / taksiran bersama (4,000)", "Spouse with no income / joint assessment (4,000)") + '</label>' +
    '<div class="plQ">👧 ' + L("Anak", "Children") + '</div><div id="tiKids">' + T.kids.map(kid).join("") + '</div><button class="chip" id="tiKAdd">＋ ' + L("Anak", "Child") + '</button>' +
    '<button class="btn gold full g3d" id="tiOk" style="margin-top:10px">✓ ' + L("Simpan", "Save") + '</button>');
  var q = function(s){ return ov.querySelector(s); };
  q("#tiAuto").onchange = function(){ q("#tiInc").disabled = this.checked; if(this.checked) q("#tiInc").value = auto / 100; };
  var kb = function(){ ov.querySelectorAll("[data-kt]").forEach(function(s){ s.onchange = function(){ T.kids[+s.getAttribute("data-kt")].t = s.value; }; }); ov.querySelectorAll("[data-kx]").forEach(function(b){ b.onclick = function(){ T.kids.splice(+b.getAttribute("data-kx"), 1); q("#tiKids").innerHTML = T.kids.map(kid).join(""); kb(); }; }); }; kb();
  q("#tiKAdd").onclick = function(){ T.kids.push({t:"u18"}); q("#tiKids").innerHTML = T.kids.map(kid).join(""); kb(); };
  q("#tiOk").onclick = function(){ T.incAuto = q("#tiAuto").checked; T.inc = c2(q("#tiInc").value); T.other = c2(q("#tiOth").value); T.pcb = c2(q("#tiPcb").value); T.epf = c2(q("#tiEpf").value); T.socso = c2(q("#tiSoc").value); T.spouse = q("#tiSp").checked;
    var dd = A.db(); dd.tax = dd.tax || {}; dd.tax[y] = T; A.save(dd); A.H.closeOverlay(); A.draw(); }; }
// the year-end report: a PDF (summary, reliefs, every claim, receipt pictures) and a CSV
function report(){ var d = A.db(), y = yr(), K = calc(d, y), cl = claims(d, y), H = A.H;
  var W = 1240, PX = W / 210, cv = document.createElement("canvas"), pages = [], cur = null, yy = 0;
  var newPage = function(){ cur = document.createElement("canvas"); cur.width = W; cur.height = Math.round(297 * PX); var x = cur.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, cur.width, cur.height); pages.push(cur); yy = 70; return x; };
  var x = newPage(), line = function(t, sz, b, col, right){ if(yy > cur.height - 80) x = newPage(); x.font = (b ? "700 " : "") + sz + "px sans-serif"; x.fillStyle = col || "#111"; x.fillText(t, 70, yy); if(right){ x.textAlign = "right"; x.fillText(right, W - 70, yy); x.textAlign = "left"; } yy += sz * 1.6; };
  line(L("Ringkasan cukai pendapatan", "Income tax summary") + " · YA " + y, 34, true); line(L("Anggaran daripada My Ihsan. Semak dengan LHDN / e-Filing.", "An estimate from My Ihsan. Check with LHDN / e-Filing."), 20, false, "#666"); yy += 10;
  [[L("Pendapatan", "Income"), rm(K.inc)]].concat(K.rel.map(function(r){ return ["  − " + r[0], rm(r[1])]; })).concat([[L("Derma", "Donations"), rm(K.don)], [L("Pendapatan bercukai", "Chargeable income"), rm(K.ci)], [L("Cukai", "Tax"), rm(K.tax)], [L("Rebat", "Rebates"), rm(K.reb + K.zak)], [L("PCB dipotong", "PCB deducted"), rm(K.pcb)], [K.bal > 0 ? L("Perlu dibayar", "To pay") : L("Bayaran balik", "Refund"), rm(Math.abs(K.bal))]]).forEach(function(r, i, a){ line(r[0], 24, i === a.length - 1, null, r[1]); });
  yy += 20; line(L("Tuntutan", "Claims") + " (" + cl.length + ")", 28, true);
  cl.forEach(function(c){ var k = CAT[c.cat] || ["", "", c.cat, c.cat]; line(c.date + "  " + L(k[2], k[3]) + (c.note ? " · " + c.note : "") + (c.img ? "  📎" : ""), 20, false, null, rm(c.amt / 100)); });
  var withImg = cl.filter(function(c){ return c.img && A.imgGet(c.img); }), done = function(){ var b64 = H.canvasPdf ? null : null;
    var pdfB64 = A.pdfOf(pages); H.sharePdf("cukai-YA" + y + ".pdf", pdfB64, L("Ringkasan cukai YA ", "Tax summary YA ") + y); };
  var chain = Promise.resolve(); withImg.forEach(function(c){ chain = chain.then(function(){ return new Promise(function(ok){ var im = new Image(); im.onload = function(){ x = newPage(); var k = CAT[c.cat] || ["", "", c.cat, c.cat]; line(c.date + " · " + L(k[2], k[3]) + " · " + rm(c.amt / 100), 22, true);
      var mw = W - 140, mh = cur.height - yy - 70, s = Math.min(mw / im.width, mh / im.height); x.drawImage(im, 70, yy, im.width * s, im.height * s); ok(); }; im.onerror = ok; im.src = A.imgGet(c.img); }); }); });
  chain.then(done);
  var rows = [["date", "relief", "amount_rm", "details", "receipt"]].concat(cl.map(function(c){ var k = CAT[c.cat] || ["", "", c.cat, c.cat]; return [c.date, k[3], (c.amt / 100).toFixed(2), c.note || "", c.img ? "yes" : "no"]; }));
  A.csvOut("tax-claims-YA" + y + ".csv", rows); }
function bind(root, api){ A = api; var q = function(s){ return root.querySelector(s); }, y = yr();
  if(!q("#txAdd")) return;
  q("#txAdd").onclick = function(){ claimForm(null); }; q("#txInc").onclick = incomeSheet; q("#txRep").onclick = report;
  root.querySelectorAll("[data-txc]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-txc"); claimForm({id:A.rid(), cat:k, amt:0, date:A.ymd(), note:"", img:""}); }; });
  root.querySelectorAll("[data-txi]").forEach(function(b){ b.onclick = function(){ var id = b.getAttribute("data-txi"), d = A.db();
    if(b.hasAttribute("data-txx")){ var t = d.tx.filter(function(x){ return x.id === id; })[0]; if(t) A.openTx(t); return; }
    var c = Y(d, y).claims.filter(function(x){ return x.id === id; })[0]; if(c) claimForm(JSON.parse(JSON.stringify(c))); }; });
  var rm0 = q("#txRem"); if(rm0) rm0.onchange = function(){ var d = A.db(), T = Y(d, y); T.rem = rm0.checked; A.save(d); var H = A.H, n = +y + 1;
    if(H.xrem){ [["txr1", new Date(n, 2, 1, 9, 0).getTime()], ["txr2", new Date(n, 3, 20, 9, 0).getTime()]].forEach(function(r){ H.xrem(r[0] + y, T.rem && r[1] > Date.now() ? r[1] : 0, "🧾 e-Filing YA " + y, L("Isi Borang BE di MyTax. Laporan cukai ada dalam Kewangan › Cukai.", "File Form BE on MyTax. Your tax report is in Finance › Tax."), "act:q-tax"); }); }
    H.toast(T.rem ? "🔔 " + L("Peringatan ditetapkan", "Reminders set") : L("Peringatan dibuang", "Reminders removed")); }; }
// the expense form: "Claim as tax relief" + relief chips (suggested by the expense category)
function pick(t, api){ A = api; var sug = CATS.filter(function(c){ return c[5].indexOf(t.cat) >= 0; });
  return '<div class="txPick"><label class="pdchk"><input type="checkbox" id="exTax"' + (t.tax ? ' checked' : '') + '> 🧾 ' + L("Tuntut pelepasan cukai (LHDN)", "Claim as tax relief (LHDN)") + '</label>' +
    '<div class="txCats sm" id="exTaxC"' + (t.tax ? '' : ' hidden') + '>' + (sug.length ? sug : CATS).concat(sug.length ? [["__all", "⋯", "Lain-lain", "Other"]] : []).map(function(k){ return '<button class="txCat sm' + (t.tax === k[0] ? ' on' : '') + '" data-xt="' + k[0] + '"><span>' + k[1] + '</span><b>' + E(L(k[2], k[3])) + '</b></button>'; }).join("") + '</div></div>'; }
function bindPick(ov, t, api){ A = api; var cb = ov.querySelector("#exTax"), box = ov.querySelector("#exTaxC"); if(!cb) return;
  var b2 = function(){ box.querySelectorAll("[data-xt]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-xt"); if(k === "__all"){ box.innerHTML = CATS.map(function(c){ return '<button class="txCat sm' + (t.tax === c[0] ? ' on' : '') + '" data-xt="' + c[0] + '"><span>' + c[1] + '</span><b>' + E(L(c[2], c[3])) + '</b></button>'; }).join(""); b2(); return; }
    t.tax = k; box.querySelectorAll("[data-xt]").forEach(function(z){ z.classList.toggle("on", z === b); }); }; }); };
  cb.onchange = function(){ box.hidden = !cb.checked; if(!cb.checked) t.tax = ""; else if(!t.tax){ var f = box.querySelector("[data-xt]:not([data-xt='__all'])"); if(f){ t.tax = f.getAttribute("data-xt"); f.classList.add("on"); } } }; b2(); }
window.ExpTax = {page:page, bind:bind, pick:pick, bindPick:bindPick, CATS:CATS, _t:{taxOn:taxOn, calc:function(api, d, y){ A = api; return calc(d, y); }}};
})();
