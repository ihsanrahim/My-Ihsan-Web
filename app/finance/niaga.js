/* My Ihsan 0.6.25 (owner spec 2026-11-17): Kewangan › Niaga (business documents), phase 1.
   Quotation · Invoice · Cash sale · Official receipt · Delivery order, with a letterhead, signature and company stamp.
   Pages: 📊 Papan (dashboard) · 📄 Dokumen · 👥 Pelanggan · 📦 Barang · ⚙️ Profil. Big ＋ Baru on every page.
   Data: ihsan_biz (NiagaDoc), images in app files biz/<id>.txt. Everything works offline; the PDF / picture are made on the phone.
   Move & import: .ihsanbiz file (optional password, AES-GCM), merge / replace / copy as a new profile, CSV and contacts.
   FinMore.niaga(el, A) */
(function(){ "use strict";
(window.__pgNow = window.__pgNow || {}).__niagaPg = function(){ return ST.pg; };   // 0.6.56: the app remembers the open tab
var N = window.NiagaDoc, TP = window.NiagaTpl, H, root, D, ST = {pg:"papan", seg:"all", q:"", per:"month", all:false, ed:null, vw:null, cust:null, wiz:0, prev:false};
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function ld(){ D = N.fix(H.load(N.KEY, null)); return D; }
function sv(){ H.save(N.KEY, D); if(window.NiagaSheet && D.cur) NiagaSheet.kick(D.cur); }
function NS(){ return window.NiagaSheet || null; }
function staff(){ var p = prof(); return !!(p && NS() && NS().role(p.id) === "staff"); }
function profs(){ return N.live(D.profiles); }
function prof(){ var a = profs(), p = N.byId(a, D.cur) || a[0] || null; if(p) D.cur = p.id; return p; }
function pidsNow(){ return ST.all ? profs().map(function(p){ return p.id; }) : (prof() ? [prof().id] : []); }
function cur(p){ var b = (p && p.base) || "MYR"; return {MYR:"RM", SGD:"S$", USD:"US$", IDR:"Rp", BND:"B$"}[b] || b; }
function money(c, p){ return N.fmt(c, cur(p || prof())); }
function dm(c, d, p){ return N.fmt(c, N.sym(N.docCur(d, p || N.profOf(D, d)))); }
function scaleT(T, r){ if(r === 1) return T; var o = Object.assign({}, T); ["total","bal","paid","taxSum","sub","disc","credit","debit"].forEach(function(k){ if(o[k]) o[k] = Math.round(o[k] * r); }); return o; }
function tname(t){ var x = N.TYPES[t]; return x ? L(x.bm, x.en) : t; }
function vib(){ try{ if(window.Native && H.N.vibrate) H.N.vibrate(12); }catch(e){} }
function css(){ if(document.getElementById("ngCss")) return; var l = document.createElement("link"); l.id = "ngCss"; l.rel = "stylesheet"; l.href = "finance/niaga.css"; document.head.appendChild(l); }

// ---------- images (app files) ----------
var IMC = {};
function imgPut(id, data){ IMC[id] = data; if(window.Native && H.N.qWrite) H.N.qWrite("biz/" + id + ".txt", data); else try{ localStorage.setItem("ihsan_bizimg_" + id, data); }catch(e){ H.toast(L("Storan penuh", "Storage is full")); } }
function imgGet(id){ if(!id) return ""; if(IMC[id] != null) return IMC[id]; var v = ""; if(window.Native && H.N.qRead){ try{ v = H.N.qRead("biz/" + id + ".txt") || ""; }catch(e){} } else v = localStorage.getItem("ihsan_bizimg_" + id) || ""; IMC[id] = v; return v; }
function shrink(data, max, type, cb){ var im = new Image(); im.onload = function(){ var s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL(type || "image/png", .85)); }; im.onerror = function(){ cb(null); }; im.src = data; }
function pickImg(mode, cb){ var got = function(d){ if(d) shrink(d, 1400, "image/png", function(x){ if(x) cb(x); else H.toast(L("Gambar tidak dapat dibuka", "The image could not be opened")); }); };
  if(window.Native && H.N.pickImage){ var go = function(){ var h = function(r){ H.off("image", h); if(r.cancel) return; if(r.error || !r.data){ H.toast(L("Gambar tidak dapat dibuka", "The image could not be opened")); return; } got(r.data); }; H.on("image", h); H.N.pickImage(mode); };
    if(mode === "camera" && H.N.hasPerm && !H.N.hasPerm("camera")){ var hp = function(p){ if(p.which !== "camera") return; H.off("perm", hp); if(p.granted) go(); }; H.on("perm", hp); H.N.requestPerm("camera"); } else go(); return; }
  var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = function(){ var f = inp.files[0]; if(!f) return; var r = new FileReader(); r.onload = function(){ got(r.result); }; r.readAsDataURL(f); }; inp.click(); }
function openText(accept, cb){ if(window.Native && H.N.openFile){ window.IbOpenOnce = cb; H.N.openFile(); return; }
  var inp = document.createElement("input"); inp.type = "file"; inp.accept = accept || "*/*"; inp.onchange = function(){ var f = inp.files[0]; if(!f) return; var r = new FileReader(); r.onload = function(){ cb(r.result); }; r.readAsText(f); }; inp.click(); }
function saveText(name, text, mime){ if(window.Native && H.N.saveFile) H.N.saveFile(name, text);
  else { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], {type:mime || "application/json"})); a.download = name; document.body.appendChild(a); a.click(); a.remove(); } }

// ---------- small form helpers ----------
function fld(id, lab, val, type, ex){ return '<label class="fl">' + lab + '<input id="' + id + '" type="' + (type || "text") + '" value="' + E(val == null ? "" : val) + '"' + (ex || "") + '></label>'; }
function area(id, lab, val, rows, ex){ return '<label class="fl">' + lab + '<textarea id="' + id + '" rows="' + (rows || 3) + '"' + (ex || "") + '>' + E(val || "") + '</textarea></label>'; }
function sel(id, lab, val, opts, ex){ return '<label class="fl">' + lab + '<select id="' + id + '"' + (ex || "") + '>' + opts.map(function(o){ return '<option value="' + E(o[0]) + '"' + (String(o[0]) === String(val) ? " selected" : "") + '>' + E(o[1]) + '</option>'; }).join("") + '</select></label>'; }
function tog(id, lab, on, sub){ return '<label class="ngTog"><input type="checkbox" id="' + id + '"' + (on ? " checked" : "") + '><span><b>' + lab + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span></label>'; }
function gv(box, id){ var e = box.querySelector("#" + id); return e ? (e.type === "checkbox" ? e.checked : e.value) : ""; }
function pill(st){ var s = N.ST_LAB[st] || N.ST_LAB.draft; return '<span class="ngPill" style="--pc:' + s[2] + '">' + L(s[0], s[1]) + '</span>'; }
function calcBind(box){ box.querySelectorAll("[data-calc]").forEach(function(i){ i.addEventListener("blur", function(){ var v = N.calc(i.value); if(v === null){ i.classList.add("bad"); return; } i.classList.remove("bad"); if(v !== "" && String(v) !== i.value){ i.value = v; i.dispatchEvent(new Event("input", {bubbles:true})); } }); }); }

// ---------- view shell ----------
var NAV = [["papan","📊","Papan","Summary"],["pos","🛒","Jual","Sell"],["book","📅","Tempahan","Bookings"],["dok","📄","Dokumen","Records"],["exp","💸","Belanja","Expenses"],["cust","👥","Pelanggan","Customers"],["item","📦","Barang","Items"],["prof","⚙️","Profil","Profile"]];
function draw(){ if(!root || !document.body.contains(root)) return; var v = document.getElementById("view"), y = v ? v.scrollTop : 0; render(); if(v && !draw.top) v.scrollTop = y; draw.top = false; }
function goTop(){ draw.top = true; }
function render(){ ld(); var p = prof(); if(window.__niagaPg){ ST.pg = window.__niagaPg; ST.vw = null; ST.cust = null; ST.ed = null; window.__niagaPg = null; } if(p && p.pos && p.pos.home && !render.ph){ render.ph = 1; ST.pg = "pos"; }
  if(p && !ST.ed && !render.rc){ render.rc = 1; var made = N.recurInv(D, p.id); if(made.length){ made.forEach(function(x){ var s0 = N.byId(D.docs, x.recurFrom); if(s0) recRemind(s0); }); H.save(N.KEY, D); setTimeout(function(){ H.toast("🔁 " + made.length + L(" invois berulang sedia (draf)", " recurring invoices ready (drafts)")); }, 400); } }
  if(!p){ welcome(root); return; }
  if(ST.wiz){ wizard(root); return; }
  if(ST.ed){ vEdit(root); return; }
  var h = '<div class="ngTop"><button class="ngPS" id="ngPS">' + logoChip(p) + '<b>' + E(ST.all ? L("Semua perniagaan", "All businesses") : p.name || L("Perniagaan", "Business")) + '</b> ▾</button><button class="btn gold g3d ngNew" id="ngNew">＋ ' + L("Baru", "New") + '</button></div>' +
    (NS() ? NS().chip(p.id) : '') + (letterNote(p) ? '<div class="card ngNote">🔤 ' + L("Mulai sekarang nombor dokumen ada huruf telefon (A, B…). Dokumen lama tidak berubah.", "From now on document numbers carry the phone letter (A, B…). Old documents do not change.") + ' <button class="chip" id="ngLN">OK</button></div>' : '') + '<div id="ngBody"></div>';
  // 0.6.50 (owner): the pages are tabs in a bottom bar, like Planner
  var NV = window.l3Keep ? l3Keep(NAV, "alat/niaga", ST.pg) : NAV;
  h += '<div class="dock ngDock"><div class="ngNav" style="grid-template-columns:repeat(' + NV.length + ',minmax(0,1fr))">' + NV.map(function(n){ return '<button class="' + (ST.pg === n[0] && !ST.vw && !ST.cust ? "on" : "") + '" data-ngp="' + n[0] + '"><span>' + n[1] + '</span>' + L(n[2], n[3]) + '</button>'; }).join("") + '</div></div>';
  root.innerHTML = h; var b = root.querySelector("#ngBody"); try{ if(H.dockFix) setTimeout(H.dockFix, 0); }catch(e){}
  root.querySelectorAll("[data-ngp]").forEach(function(x){ x.onclick = function(){ ST.pg = x.getAttribute("data-ngp"); ST.vw = null; ST.cust = null; goTop(); draw(); }; });
  root.querySelector("#ngNew").onclick = function(){ newDoc(); };
  root.querySelector("#ngPS").onclick = switcher; if(NS()) NS().bind();
  var ln = root.querySelector("#ngLN"); if(ln) ln.onclick = function(){ var l = NS().link(p.id); if(l) l.letterNote = 2; H.save(N.KEY, D); draw(); };
  if(ST.vw) vDoc(b); else if(ST.cust) vCust(b); else ({papan:vDash, pos:vPos, book:vBook, dok:vDocs, exp:vExp, cust:vCusts, item:vItems, prof:vProf}[ST.pg] || vDash)(b); }
// 0.6.35: 🛒 Jual (finance/niaga_pos.js): a quick till for stalls and small shops
function vPos(el){ if(window.NiagaPos) NiagaPos.view(el, expX()); else el.innerHTML = '<div class="card mut">…</div>'; }
// 0.6.28: 💸 Belanja (finance/niaga_exp.js): petty cash, recurring, receipts, tax summary
function expX(){ return {qr:function(t){ return qr(t); }, H:H, D:function(){ return D; }, save:function(){ H.save(N.KEY, D); }, sv:sv, prof:prof, money:function(c){ return money(c); }, draw:function(){ draw(); }, staff:staff, imgGet:imgGet, imgPut:imgPut, pickImg:pickImg,
  shrinkJ:function(d, mx, cb){ shrink(d, mx, "image/jpeg", cb); }, fld:fld, area:area, sel:sel, tog:tog, gv:gv, calcBind:calcBind, TP:TP, saveText:saveText}; }
// 0.6.50: 📅 Tempahan (finance/niaga_book.js): rooms, halls, cars, photo sessions, service slots
function vBook(el){ if(window.NiagaBook){ var x = expX(); x.newDocFrom = docFromBooking; x.openDoc = function(id){ ST.vw = id; ST.cust = null; goTop(); draw(); }; NiagaBook.view(el, x); } else el.innerHTML = '<div class="card mut">…</div>'; }
function docFromBooking(type, o){ var p = prof(), d = N.blankDoc(D, p, type); var c = o.custId ? N.byId(D.customers, o.custId) : null;
  d.cust = c ? {name:c.name || "", co:c.co || "", addr:c.addr || "", phone:c.phone || "", email:c.email || "", regNo:c.regNo || "", tin:c.tin || "", att:c.att || ""} : (o.cust || {}); d.custId = o.custId || ""; d.ref = o.ref || "";
  if(o.lines && o.lines.length) d.lines = o.lines.map(function(l){ return Object.assign({t:"item", desc:"", qty:1, unit:"lot", price:"", tax:""}, l); });
  if(type === "OR" && o.amt != null){ d.amt = o.amt; } if(o.note) d.notes = (d.notes ? d.notes + "\n" : "") + o.note;
  N.stamp(D, d); D.docs.push(d); N.log(D, d.id, "create"); sv(); ST.pg = "dok"; ST.ed = d.id; ST.vw = null; goTop(); draw(); }
function vExp(el){ if(window.NiagaExp) NiagaExp.view(el, expX()); else el.innerHTML = '<div class="card mut">…</div>'; }
function letterNote(p){ var l = NS() && NS().link(p.id); return !!(l && l.letterNote === 1); }
function logoChip(p){ var s = imgGet(p.logo); return s ? '<img src="' + s + '" alt="">' : '<i>🏪</i>'; }
function switcher(){ var a = profs(); var ov = H.showSheet("🏪 " + L("Perniagaan", "Business"), a.map(function(p){ return '<button class="ngRow" data-sp="' + p.id + '">' + logoChip(p) + '<span><b>' + E(p.name || "—") + '</b><small>' + E(p.trade || "") + '</small></span>' + (p.id === D.cur && !ST.all ? "✓" : "") + '</button>'; }).join("") +
    (a.length > 1 ? '<button class="ngRow" data-sp="*"><i>🗂</i><span><b>' + L("Semua perniagaan (papan sahaja)", "All businesses (dashboard only)") + '</b></span>' + (ST.all ? "✓" : "") + '</button>' : '') +
    '<button class="btn alt full g3d" id="ngPAdd" style="margin-top:10px">＋ ' + L("Tambah perniagaan", "Add a business") + '</button>');
  ov.querySelectorAll("[data-sp]").forEach(function(b){ b.onclick = function(){ var id = b.getAttribute("data-sp"); if(id === "*"){ ST.all = true; ST.pg = "papan"; } else { ST.all = false; D.cur = id; sv(); } H.closeOverlay(); ST.vw = null; ST.cust = null; draw(); }; });
  ov.querySelector("#ngPAdd").onclick = function(){ H.closeOverlay(); addProfile(); }; }
function addProfile(){ var p = N.stamp(D, N.newProfile("")); D.profiles.push(p); D.cur = p.id; sv(); ST.wiz = 1; ST.all = false; goTop(); draw(); }

// ---------- first run ----------
function welcome(el){ el.innerHTML = '<div class="card ngHero"><div class="ngHi">📑</div><h2>' + L("Niaga: dokumen perniagaan", "Niaga: business documents") + '</h2>' +
  '<p class="mut">' + L("Sebut harga, invois, resit, bil tunai dan nota hantaran dengan kepala surat, tandatangan dan cop. Simpan setiap rekod dan lihat kutipan anda.", "Quotations, invoices, receipts, cash sales and delivery orders with your letterhead, signature and stamp. Keep every record and see what you have collected.") + '</p>' +
  '<button class="btn gold full g3d" id="ngStart">🚀 ' + L("Sediakan perniagaan saya", "Set up my business") + '</button>' +
  '<div class="mut small" style="margin:14px 0 6px">' + L("Ada data di telefon lama?", "Have data from an old phone?") + '</div><button class="btn alt full g3d" id="ngImp">📥 ' + L("Import fail Niaga (.ihsanbiz)", "Import a Niaga file (.ihsanbiz)") + '</button>' +
  '<button class="btn alt full g3d" id="ngP2p">📲 ' + L("Terima dari telefon lama (tanpa internet)", "Receive from the old phone (no internet)") + '</button>' +
  '<button class="btn alt full g3d" id="ngJoin">📗 ' + L("Sambung ke Google Sheet sedia ada", "Join an existing Google Sheet") + '</button>' +
  '<div class="mut tiny" style="margin-top:12px">🔒 ' + L("Semua data kekal di telefon ini dan dalam sandaran My Ihsan.", "All data stays on this phone and in your My Ihsan backup.") + '</div></div>';
  el.querySelector("#ngStart").onclick = addProfile; el.querySelector("#ngImp").onclick = importBiz; el.querySelector("#ngJoin").onclick = function(){ NS().join(); }; el.querySelector("#ngP2p").onclick = p2pRecv; }

// ---------- profile sections (shared by the wizard and Profil) ----------
var SECS = [["biz","🏪","Perniagaan & logo","Business & logo"],["reg","🏛","Pendaftaran & alamat","Registration & address"],["contact","☎️","Hubungan & bayaran","Contact & payment"],["sig","✍️","Tandatangan & cop","Signature & stamp"],["look","🎨","Reka bentuk","Design"],["tax","🧮","Cukai & bundar","Tax & rounding"],["num","🔢","Penomboran","Numbering"],["terms","📃","Terma, nota & mesej","Terms, notes & message"]];
function imgSlot(key, lab, id, hint){ var s = imgGet(id); return '<div class="ngImg"><div class="ngImgP">' + (s ? '<img src="' + s + '" alt="">' : '<span>' + lab + '</span>') + '</div><div class="ngImgB"><b>' + lab + '</b>' + (hint ? '<small class="mut">' + hint + '</small>' : '') +
  '<div class="btns"><button class="btn alt sm" data-pk="' + key + '|gallery">🖼 ' + L("Galeri", "Gallery") + '</button><button class="btn alt sm" data-pk="' + key + '|camera">📷</button>' + (s ? '<button class="btn alt sm" data-pkx="' + key + '">✕</button>' : '') + '</div></div></div>'; }
function secHtml(k, p){ var a = p.addr || {}, b = (p.bank || [])[0] || {};
  if(k === "biz") return fld("pName", L("Nama perniagaan *", "Business name *"), p.name, "text", ' placeholder="Sedap Bakery"') + fld("pTrade", L("Nama dagang / milik (pilihan)", "Trade name / owned by (optional)"), p.trade, "text", ' placeholder="milik Farah Enterprise"') +
    imgSlot("logo", "Logo", p.logo, L("PNG lutsinar paling cantik. Tepi putih dipotong.", "A transparent PNG looks best. White edges are trimmed."));
  if(k === "reg") return '<div class="f2">' + fld("pReg", L("No. SSM (12 digit)", "SSM no. (12 digits)"), p.regNo, "text", ' inputmode="numeric" placeholder="202301012345"') + fld("pRegO", L("No. lama (pilihan)", "Old no. (optional)"), p.regOld) + '</div>' +
    fld("pLic", L("Lesen PBT (jika tiada SSM)", "Council licence (if no SSM)"), p.licence) +
    '<div class="f2">' + fld("pTin", "TIN (e-Invois)", p.tin, "text", ' placeholder="C1234567890 / IG…"') + fld("pMsic", L("Kod MSIC", "MSIC code"), p.msic, "text", ' inputmode="numeric"') + '</div>' +
    fld("pA1", L("Alamat baris 1", "Address line 1"), a.l1) + fld("pA2", L("Alamat baris 2", "Address line 2"), a.l2) +
    '<div class="f2">' + fld("pPc", L("Poskod", "Postcode"), a.pc, "text", ' inputmode="numeric"') + fld("pCity", L("Bandar", "City"), a.city) + '</div>' + fld("pState", L("Negeri", "State"), a.state, "text", ' list="ngStates"') +
    '<datalist id="ngStates">' + ["Johor","Kedah","Kelantan","Melaka","Negeri Sembilan","Pahang","Perak","Perlis","Pulau Pinang","Sabah","Sarawak","Selangor","Terengganu","W.P. Kuala Lumpur","W.P. Putrajaya","W.P. Labuan"].map(function(s){ return '<option value="' + s + '">'; }).join("") + '</datalist>';
  if(k === "contact") return '<div class="f2">' + fld("pPh", L("Telefon", "Phone"), p.phone, "tel") + fld("pWa", "WhatsApp", p.wa, "tel") + '</div><div class="f2">' + fld("pEm", "E-mel", p.email, "email") + fld("pWeb", L("Laman web / media sosial", "Website / social"), p.web) + '</div>' +
    '<div class="snl">🏦 ' + L("Akaun bank", "Bank account") + '</div>' + fld("pBank", "Bank", b.bank, "text", ' list="ngBanks" placeholder="Maybank"') + '<div class="f2">' + fld("pAccN", L("Nama akaun", "Account name"), b.accName) + fld("pAcc", L("No. akaun", "Account no."), b.accNo, "text", ' inputmode="numeric"') + '</div>' +
    '<datalist id="ngBanks">' + ["Maybank","CIMB Bank","Public Bank","RHB Bank","Hong Leong Bank","AmBank","Bank Islam","Bank Muamalat","Bank Rakyat","BSN","Affin Bank","Alliance Bank","OCBC","UOB","HSBC","Standard Chartered","Agrobank","MBSB Bank","Al Rajhi","Kuwait Finance House","GXBank","AEON Bank","Boost Bank"].map(function(s){ return '<option value="' + s + '">'; }).join("") + '</datalist>' +
    fld("pLink", L("Pautan bayaran (pilihan)", "Payment link (optional)"), p.payLink, "url", ' placeholder="https://toyyibpay.com/…"') +
    imgSlot("qr", "DuitNow QR", p.qr, L("Simpan QR dari aplikasi bank anda, kemudian pilih di sini.", "Save the QR from your bank app, then choose it here."));
  if(k === "sig") return sigHtml(p);
  if(k === "look") return '<div class="snl">' + L("Reka bentuk", "Design") + '</div><div class="ngDes">' + TP.DESIGNS.map(function(d){ return '<button class="' + (p.design === d[0] ? "on" : "") + '" data-des="' + d[0] + '"><i class="ngDi ngDi-' + d[0] + '"></i>' + L(d[1], d[2]) + '</button>'; }).join("") + '</div>' +
    '<div class="snl">' + L("Warna jenama", "Brand colour") + '</div><div class="ngCols">' + TP.COLORS.map(function(c){ return '<button style="background:' + c + '" class="' + (p.color === c ? "on" : "") + '" data-col="' + c + '"></button>'; }).join("") + '<label class="ngColP" title="' + L("Pilih", "Pick") + '"><input type="color" id="pCol" value="' + E(p.color) + '">＋</label></div>' +
    '<div class="snl">' + L("Bahasa dokumen", "Document language") + '</div><div class="chips">' + [["both","BM + EN"],["bm","Bahasa Melayu"],["en","English"]].map(function(o){ return '<button class="chip' + (p.lang === o[0] ? " on" : "") + '" data-dl="' + o[0] + '">' + o[1] + '</button>'; }).join("") + '</div>' +
    '<label class="ngTog"><input type="checkbox" id="pBis"' + (p.bismillah !== false ? " checked" : "") + '><span><b>' + L("Baris Bismillah (reka bentuk Islamik)", "Bismillah line (Islamic design)") + '</b></span></label>' +
    '<div class="ngPrevBox"><div class="mut tiny">' + L("Pratonton dengan contoh", "Preview with sample data") + '</div><div id="ngPv" class="ngPv"></div></div>';
  if(k === "tax") return tog("pSst", L("Berdaftar SST", "SST registered"), p.tax && p.tax.sst, L("Baris cukai hanya muncul bila berdaftar.", "Tax lines only show when registered.")) +
    '<div class="f2">' + fld("pSstNo", L("No. pendaftaran SST", "SST registration no."), p.sstNo) + sel("pRate", L("Kadar biasa", "Usual rate"), (p.tax || {}).rate || 8, N.TAXES.filter(function(t){ return t[0]; }).map(function(t){ return [t[0], L(t[1], t[2])]; })) + '</div>' +
    tog("pIncl", L("Harga sudah termasuk cukai", "Prices include tax"), p.tax && p.tax.inclusive) +
    tog("pR5", L("Bundar 5 sen (bil tunai & resit)", "5-sen rounding (cash sale & receipt)"), p.round5 !== false) +
    sel("pBase", L("Mata wang", "Currency"), p.base || "MYR", [["MYR","RM · Ringgit"],["SGD","S$ · Singapore"],["BND","B$ · Brunei"],["IDR","Rp · Rupiah"],["USD","US$ · Dollar"]]) +
    '<div class="mut tiny">ⓘ ' + L("Kadar SST boleh berubah dalam bajet. Aplikasi menjumlahkan cukai sahaja, tidak menghantar SST-02.", "SST rates change in budgets. The app only totals tax; it does not file SST-02.") + '</div>';
  if(k === "num") return '<div class="mut small">' + L("Token: {YYYY} {YY} {MM} {DD} {N} nombor, {P} huruf telefon.", "Tokens: {YYYY} {YY} {MM} {DD} {N} number, {P} phone letter.") + '</div>' + N.ORDER.map(function(t){ var c = N.numCfg(p, t);
      return '<div class="ngNumR"><b>' + N.TYPES[t].ic + ' ' + tname(t) + '</b><div class="f3">' + fld("nP" + t, L("Format", "Format"), c.pre) + sel("nR" + t, L("Mula semula", "Reset"), c.reset, [["year", L("Setiap tahun", "Yearly")], ["month", L("Setiap bulan", "Monthly")], ["never", L("Tidak", "Never")]]) + fld("nS" + t, L("Mula dari", "Start at"), c.start, "number", ' min="1"') + '</div><small class="mut">' + L("Seterusnya: ", "Next: ") + E(N.peekNo(D, p, t, N.ymd()).no) + '</small></div>'; }).join("") +
    tog("nAL", L("Sentiasa guna huruf telefon", "Always use the phone letter"), N.numCfg(p, "INV").alwaysLetter, L("Contoh INV-2026-A0013. Dokumen lama tidak berubah.", "E.g. INV-2026-A0013. Old documents do not change."));
  if(k === "terms") return '<div class="f2">' + fld("pDue", L("Tempoh bayar invois (hari)", "Invoice due in (days)"), p.due, "number", ' min="0"') + fld("pValid", L("Sebut harga sah (hari)", "Quotation valid (days)"), p.valid, "number", ' min="1"') + '</div>' +
    N.ORDER.map(function(t){ return area("tT" + t, N.TYPES[t].ic + " " + L("Terma ", "Terms: ") + tname(t), (p.terms || {})[t], 2, ' placeholder="' + E(TERM_EG[t] ? L(TERM_EG[t][0], TERM_EG[t][1]) : "") + '"'); }).join("") +
    area("tNote", L("Nota kepada pelanggan (semua dokumen)", "Note to customers (all documents)"), (p.notes || {}).all, 2, ' placeholder="' + L("Terima kasih atas sokongan anda", "Thank you for your support") + '"') +
    area("tWa", L("Mesej WhatsApp", "WhatsApp message"), p.waTpl || WA_DEF(), 3) + '<div class="mut tiny">{nama} {jenis} {no} {jumlah} {tarikh} {perniagaan}</div>' +
    tog("pCG", L("Baris \"dijana oleh komputer\" bila tiada tandatangan", "\"Computer-generated\" line when there is no signature"), p.compGen !== false) + tog("pBr", L("Tulisan kecil \"Made with My Ihsan\"", "Small \"Made with My Ihsan\""), !!p.brand);
  return ""; }
var TERM_EG = {QT:["Harga sah 30 hari. Deposit 50% untuk sahkan tempahan.", "Prices valid for 30 days. 50% deposit to confirm the order."], INV:["Bayaran dalam 14 hari. Barang yang dijual tidak boleh dipulangkan.", "Payment within 14 days. Goods sold are not returnable."], CS:["Terima kasih. Sila datang lagi.", "Thank you. Please come again."], OR:["", ""], DO:["Sila periksa barang semasa penghantaran.", "Please check the goods on delivery."]};
function WA_DEF(){ return L("Assalamualaikum {nama}, berikut {jenis} {no} berjumlah {jumlah}{tarikh}. Terima kasih. — {perniagaan}", "Assalamualaikum {nama}, here is {jenis} {no} for {jumlah}{tarikh}. Thank you. — {perniagaan}"); }
function secRead(k, p, box){ var a = p.addr = p.addr || {}; p.bank = p.bank && p.bank.length ? p.bank : [{}]; var b = p.bank[0];
  var g = function(id){ return gv(box, id); };
  if(k === "biz"){ p.name = g("pName").trim(); p.trade = g("pTrade").trim(); }
  if(k === "reg"){ p.regNo = g("pReg").trim(); p.regOld = g("pRegO").trim(); p.licence = g("pLic").trim(); p.tin = g("pTin").trim().toUpperCase(); p.msic = g("pMsic").trim(); a.l1 = g("pA1"); a.l2 = g("pA2"); a.pc = g("pPc"); a.city = g("pCity"); a.state = g("pState"); }
  if(k === "contact"){ p.phone = g("pPh"); p.wa = g("pWa"); p.email = g("pEm"); p.web = g("pWeb"); b.bank = g("pBank"); b.accName = g("pAccN"); b.accNo = g("pAcc"); p.payLink = g("pLink").trim(); }
  if(k === "tax"){ p.tax = {sst:!!g("pSst"), rate:+g("pRate") || 8, inclusive:!!g("pIncl")}; p.sstNo = g("pSstNo").trim(); p.round5 = !!g("pR5"); p.base = g("pBase") || "MYR"; }
  if(k === "num"){ p.num = p.num || {}; var al = !!g("nAL"); N.ORDER.forEach(function(t){ var pre = g("nP" + t).trim() || N.DEF_FMT[t]; if(pre.indexOf("{N}") < 0) pre += "{N}"; p.num[t] = {pre:pre, pad:4, reset:g("nR" + t) || "year", start:Math.max(1, +g("nS" + t) || 1), alwaysLetter:al}; }); }
  if(k === "terms"){ p.due = Math.max(0, +g("pDue") || 0); p.valid = Math.max(1, +g("pValid") || 30); p.terms = p.terms || {}; N.ORDER.forEach(function(t){ p.terms[t] = g("tT" + t); }); p.notes = p.notes || {}; p.notes.all = g("tNote"); p.waTpl = g("tWa"); p.compGen = !!g("pCG"); p.brand = !!g("pBr"); } }
function secBind(k, p, box, redraw){
  box.querySelectorAll("[data-pk]").forEach(function(b){ b.onclick = function(){ var q = b.getAttribute("data-pk").split("|"); secRead(k, p, box);
    pickImg(q[1], function(data){ var fin = function(x){ if(!x) return; var id = N.rid(); imgPut(id, x); if(q[0] === "logo") p.logo = id; else if(q[0] === "qr") p.qr = id; else if(q[0] === "stamp") p.stamp = id; N.stamp(D, p); sv(); redraw(); };
      if(q[0] === "logo") TP.trimLogo(data).then(fin); else if(q[0] === "stamp") TP.cleanInk(data, {color:p.stampCol || "", max:700}).then(function(x){ if(!x) H.toast(L("Cop tidak jelas. Cuba gambar yang lebih terang.", "The stamp is not clear. Try a brighter photo.")); fin(x); }); else fin(data); }); }; });
  box.querySelectorAll("[data-pkx]").forEach(function(b){ b.onclick = function(){ secRead(k, p, box); var q = b.getAttribute("data-pkx"); p[q] = ""; N.stamp(D, p); sv(); redraw(); }; });
  if(k === "sig") sigBind(p, box, redraw);
  if(k === "look"){ var pv = function(){ var el = box.querySelector("#ngPv"); if(el) preview(el, sample(p), p); };
    box.querySelectorAll("[data-des]").forEach(function(b){ b.onclick = function(){ p.design = b.getAttribute("data-des"); box.querySelectorAll("[data-des]").forEach(function(x){ x.classList.toggle("on", x === b); }); N.stamp(D, p); sv(); pv(); }; });
    box.querySelectorAll("[data-col]").forEach(function(b){ b.onclick = function(){ p.color = b.getAttribute("data-col"); box.querySelectorAll("[data-col]").forEach(function(x){ x.classList.toggle("on", x === b); }); N.stamp(D, p); sv(); pv(); }; });
    var cp = box.querySelector("#pCol"); if(cp) cp.onchange = function(){ p.color = cp.value; N.stamp(D, p); sv(); pv(); };
    var bi = box.querySelector("#pBis"); if(bi) bi.onchange = function(){ p.bismillah = bi.checked; N.stamp(D, p); sv(); pv(); };
    box.querySelectorAll("[data-dl]").forEach(function(b){ b.onclick = function(){ p.lang = b.getAttribute("data-dl"); box.querySelectorAll("[data-dl]").forEach(function(x){ x.classList.toggle("on", x === b); }); N.stamp(D, p); sv(); pv(); }; });
    pv(); } }
function sample(p){ var d = N.blankDoc(D, p, "INV"); d.no = N.peekNo(D, p, "INV", d.date).no; d.status = "sent"; d.cust = {name:"Puan Aisyah binti Ahmad", co:"", addr:"No. 12, Jalan Melati 3\n43000 Kajang, Selangor", phone:"012-345 6789"};
  d.lines = [{t:"item", desc:L("Kek coklat moist 2 kg", "Moist chocolate cake 2 kg"), qty:2, unit:"pcs", price:85, tax:p.tax && p.tax.sst ? p.tax.rate : 0}, {t:"item", desc:L("Cupcake hiasan (kotak 12)", "Decorated cupcakes (box of 12)"), qty:3, unit:L("kotak", "box"), price:48, tax:p.tax && p.tax.sst ? p.tax.rate : 0}, {t:"item", desc:L("Penghantaran Kajang", "Delivery to Kajang"), qty:1, unit:"lot", price:15}];
  d.notes = (p.notes || {}).all || ""; d._sample = 1; return d; }

// ---------- signatures & stamp ----------
function sigHtml(p, noStamp){ var s = p.sigs || [];
  return '<div class="mut small">' + L("Penandatangan muncul di bawah dokumen. Cop bertindih dengan tandatangan seperti di atas kertas.", "Signatories show at the bottom of documents. The stamp overlaps the signature like on paper.") + '</div>' +
    s.map(function(g, i){ var im = g.img ? imgGet(g.img) : ""; return '<div class="ngSig"><div class="ngSigP">' + (im ? '<img src="' + im + '" alt="">' : g.typed ? '<span style="font-family:' + (g.font || "NgSig1") + ';color:' + (g.ink || "#16309a") + '">' + E(g.typed) + '</span>' : '—') + '</div><div><b>' + E(g.name || "—") + '</b><small class="mut">' + E(g.title || "") + '</small></div><button class="ib" data-sgx="' + i + '">✕</button></div>'; }).join("") +
    '<div class="btns"><button class="btn alt g3d" data-sga="draw">✍️ ' + L("Lukis", "Draw") + '</button><button class="btn alt g3d" data-sga="up">🖼 ' + L("Muat naik", "Upload") + '</button><button class="btn alt g3d" data-sga="type">Aa ' + L("Taip", "Type") + '</button></div>' + (noStamp ? '' :
    '<div class="snl">🔵 ' + L("Cop syarikat", "Company stamp") + '</div>' + imgSlot("stamp", L("Cop", "Stamp"), p.stamp, L("Ambil gambar cop di atas kertas putih. Latar dibuang.", "Photograph the stamp on white paper. The background is removed.")) +
    '<div class="chips">' + [["", L("Warna asal", "Original")], ["#1d3fb8", L("Biru", "Blue")], ["#b91c1c", L("Merah", "Red")], ["#6b21a8", L("Ungu", "Purple")]].map(function(c){ return '<button class="chip' + ((p.stampCol || "") === c[0] ? " on" : "") + '" data-stc="' + c[0] + '">' + c[1] + '</button>'; }).join("") + '</div>'); }
function sigBind(p, box, redraw){
  box.querySelectorAll("[data-sgx]").forEach(function(b){ b.onclick = function(){ if(!confirm(L("Buang tandatangan ini?", "Remove this signature?"))) return; p.sigs.splice(+b.getAttribute("data-sgx"), 1); N.stamp(D, p); sv(); redraw(); }; });
  box.querySelectorAll("[data-stc]").forEach(function(b){ b.onclick = function(){ p.stampCol = b.getAttribute("data-stc"); N.stamp(D, p); sv(); redraw(); H.toast(L("Warna dipakai pada cop yang dimuat naik seterusnya", "The colour applies to the next stamp you upload")); }; });
  box.querySelectorAll("[data-sga]").forEach(function(b){ b.onclick = function(){ var m = b.getAttribute("data-sga");
    var add = function(sig){ sigMeta(p, sig, function(){ p.sigs = p.sigs || []; p.sigs.push(sig); N.stamp(D, p); sv(); redraw(); }); };
    if(m === "draw") pad(L("Tandatangan", "Signature"), false, function(png){ var id = N.rid(); imgPut(id, png); add({id:N.rid(8), img:id}); });
    else if(m === "up") pickImg("gallery", function(d){ TP.cleanInk(d, {max:900}).then(function(x){ if(!x){ H.toast(L("Tandatangan tidak jelas", "The signature is not clear")); return; } var id = N.rid(); imgPut(id, x); add({id:N.rid(8), img:id}); }); });
    else typedSig(function(t, f, ink){ add({id:N.rid(8), typed:t, font:f, ink:ink}); }); }; }); }
function sigMeta(p, sig, done){ var ov = H.showSheet("✍️ " + L("Penandatangan", "Signatory"), fld("sgN", L("Nama", "Name"), p.sigs && p.sigs.length ? "" : (p.owner || ""), "text") + fld("sgT", L("Jawatan", "Title"), L("Pengurus", "Manager"), "text", ' list="sgTl"') +
    '<datalist id="sgTl">' + ["Pemilik / Owner","Pengurus / Manager","Pengarah / Director","Kerani / Clerk","Juruwang / Cashier"].map(function(s){ return '<option value="' + s + '">'; }).join("") + '</datalist><button class="btn gold full g3d" id="sgOk" style="margin-top:10px">✓ ' + L("Simpan", "Save") + '</button>');
  setTimeout(function(){ var i = ov.querySelector("#sgN"); if(i) i.focus(); }, 200);
  ov.querySelector("#sgOk").onclick = function(){ sig.name = gv(ov, "sgN").trim() || sig.typed || ""; sig.title = gv(ov, "sgT").trim(); H.closeOverlay(); done(); }; }
function typedSig(cb){ var ink = "#16309a", font = "NgSig1";
  var ov = H.showSheet("Aa " + L("Tandatangan bertaip", "Typed signature"), fld("tsN", L("Nama", "Name"), "", "text") + '<div class="ngTS" id="tsL"></div><div class="chips">' + [["#111111", L("Hitam", "Black")], ["#16309a", L("Biru", "Blue")]].map(function(c){ return '<button class="chip' + (c[0] === ink ? " on" : "") + '" data-ink="' + c[0] + '">' + c[1] + '</button>'; }).join("") + '</div><button class="btn gold full g3d" id="tsOk" style="margin-top:10px">✓ ' + L("Guna", "Use") + '</button>');
  var paint = function(){ var n = gv(ov, "tsN") || L("Nama Anda", "Your Name"); ov.querySelector("#tsL").innerHTML = TP.SIGF.map(function(f){ return '<button class="' + (f[0] === font ? "on" : "") + '" data-tsf="' + f[0] + '" style="font-family:' + f[0] + ';color:' + ink + '">' + E(n) + '</button>'; }).join("");
    ov.querySelectorAll("[data-tsf]").forEach(function(b){ b.onclick = function(){ font = b.getAttribute("data-tsf"); paint(); }; }); };
  ov.querySelector("#tsN").oninput = paint; ov.querySelectorAll("[data-ink]").forEach(function(b){ b.onclick = function(){ ink = b.getAttribute("data-ink"); ov.querySelectorAll("[data-ink]").forEach(function(x){ x.classList.toggle("on", x === b); }); paint(); }; });
  paint(); ov.querySelector("#tsOk").onclick = function(){ var n = gv(ov, "tsN").trim(); if(!n){ H.toast(L("Taip nama dahulu", "Type a name first")); return; } H.closeOverlay(); TP.fontsReady().then(function(){ cb(n, font, ink); }); }; }
// full-screen signing pad (its own layer, so it can sit above a sheet). withName: also ask name (+ IC last 4)
function pad(title, withName, done){ var lay = document.createElement("div"); lay.className = "ngPad";
  lay.innerHTML = '<div class="ngPadT"><b>' + title + '</b><span class="chips"><button class="chip on" data-pi="#111111">⚫</button><button class="chip" data-pi="#16309a">🔵</button></span><button class="chip" id="pdU">↶</button><button class="chip" id="pdC">' + L("Padam", "Clear") + '</button><button class="chip" id="pdX">✕</button></div>' +
    '<canvas id="pdCv"></canvas>' + (withName ? '<div class="ngPadN">' + fld("pdN", L("Nama", "Name"), "", "text") + (withName === "ic" ? fld("pdI", L("IC (4 digit akhir)", "IC (last 4 digits)"), "", "text", ' inputmode="numeric" maxlength="4"') : '') + '</div>' : '') +
    '<div class="ngPadB"><span class="mut small">' + L("Tandatangan di ruang putih", "Sign in the white area") + '</span><button class="btn gold g3d" id="pdOk">✓ ' + L("Siap", "Done") + '</button></div>';
  document.body.appendChild(lay);
  var cv = lay.querySelector("#pdCv"), dpr = 2, ink = "#111111", strokes = [], curS = null;
  var size = function(){ var r = cv.getBoundingClientRect(); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); paint(); };
  var paint = function(){ var c = cv.getContext("2d"); c.clearRect(0, 0, cv.width, cv.height); c.lineCap = "round"; c.lineJoin = "round";
    strokes.forEach(function(s){ c.strokeStyle = s.ink; for(var i = 1; i < s.p.length; i++){ var a = s.p[i - 1], b = s.p[i], m0 = i > 1 ? mid(s.p[i - 2], a) : a, m1 = mid(a, b); c.lineWidth = (2.2 + 3.2 * (b.w || .5)) * dpr; c.beginPath(); c.moveTo(m0.x, m0.y); c.quadraticCurveTo(a.x, a.y, m1.x, m1.y); c.stroke(); }
      if(s.p.length === 1){ c.fillStyle = s.ink; c.beginPath(); c.arc(s.p[0].x, s.p[0].y, 2.5 * dpr, 0, 7); c.fill(); } }); };
  var mid = function(a, b){ return {x:(a.x + b.x) / 2, y:(a.y + b.y) / 2}; };
  var pt = function(e){ var r = cv.getBoundingClientRect(); return {x:(e.clientX - r.left) * dpr, y:(e.clientY - r.top) * dpr, w:e.pressure && e.pressure !== .5 ? e.pressure : .5}; };
  cv.onpointerdown = function(e){ e.preventDefault(); cv.setPointerCapture(e.pointerId); curS = {ink:ink, p:[pt(e)]}; strokes.push(curS); paint(); };
  cv.onpointermove = function(e){ if(!curS) return; e.preventDefault(); var q = pt(e), l = curS.p[curS.p.length - 1]; if(Math.abs(q.x - l.x) + Math.abs(q.y - l.y) < 2) return; curS.p.push(q); paint(); };
  cv.onpointerup = cv.onpointercancel = function(){ curS = null; };
  lay.querySelectorAll("[data-pi]").forEach(function(b){ b.onclick = function(){ ink = b.getAttribute("data-pi"); lay.querySelectorAll("[data-pi]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; });
  lay.querySelector("#pdU").onclick = function(){ strokes.pop(); paint(); }; lay.querySelector("#pdC").onclick = function(){ strokes = []; paint(); };
  lay.querySelector("#pdX").onclick = function(){ lay.remove(); };
  lay.querySelector("#pdOk").onclick = function(){ if(!strokes.length){ H.toast(L("Belum ditandatangan", "Not signed yet")); return; } var png = cropAlpha(cv); var nm = withName ? {name:gv(lay, "pdN").trim(), ic:(gv(lay, "pdI") || "").replace(/\D/g, "").slice(-4)} : null; lay.remove(); done(png, nm); };
  setTimeout(size, 30); }
function cropAlpha(cv){ var c = cv.getContext("2d"), w = cv.width, h = cv.height, px = c.getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = 0, y1 = 0;
  for(var y = 0; y < h; y += 2) for(var x = 0; x < w; x += 2) if(px[(y * w + x) * 4 + 3] > 10){ if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; }
  var pad2 = 10; x0 = Math.max(0, x0 - pad2); y0 = Math.max(0, y0 - pad2); x1 = Math.min(w, x1 + pad2); y1 = Math.min(h, y1 + pad2);
  var o = document.createElement("canvas"), k = Math.min(1, 900 / (x1 - x0)); o.width = Math.max(1, Math.round((x1 - x0) * k)); o.height = Math.max(1, Math.round((y1 - y0) * k)); o.getContext("2d").drawImage(cv, x0, y0, x1 - x0, y1 - y0, 0, 0, o.width, o.height); return o.toDataURL("image/png"); }

// ---------- wizard ----------
var WIZ = ["biz","reg","contact","sig","look"];
function wizard(el){ var p = prof(), k = WIZ[ST.wiz - 1], s = SECS.filter(function(x){ return x[0] === k; })[0];
  el.innerHTML = '<div class="card ngWiz"><div class="ngWizS">' + WIZ.map(function(w, i){ return '<i class="' + (i < ST.wiz ? "on" : "") + '"></i>'; }).join("") + '</div><div class="mut tiny">' + L("Langkah ", "Step ") + ST.wiz + "/5 · " + L("boleh langkau", "you can skip") + '</div>' +
    '<h3>' + s[1] + ' ' + L(s[2], s[3]) + '</h3><div id="ngWB">' + secHtml(k, p) + '</div>' +
    '<div class="btns ngWizB">' + (ST.wiz > 1 ? '<button class="btn alt g3d" id="wzB">‹ ' + L("Kembali", "Back") + '</button>' : '') + '<button class="btn alt g3d" id="wzS">' + L("Langkau", "Skip") + '</button><button class="btn gold g3d" id="wzN">' + (ST.wiz === 5 ? "✓ " + L("Siap", "Finish") : L("Seterusnya", "Next") + " ›") + '</button></div></div>';
  var box = el.querySelector("#ngWB"); secBind(k, p, box, function(){ draw(); });
  var next = function(read){ if(read){ secRead(k, p, box); if(k === "biz" && !p.name){ H.toast(L("Isi nama perniagaan", "Enter the business name")); return; } N.stamp(D, p); sv(); }
    if(ST.wiz >= 5){ ST.wiz = 0; ST.pg = "papan"; if(!p.name){ p.name = L("Perniagaan saya", "My business"); sv(); } H.toast("✅ " + L("Siap! Tekan ＋ Baru untuk dokumen pertama.", "Done! Tap ＋ New for your first document.")); } else ST.wiz++; goTop(); draw(); };
  el.querySelector("#wzN").onclick = function(){ next(true); }; el.querySelector("#wzS").onclick = function(){ if(k === "biz"){ secRead(k, p, box); if(!p.name) p.name = L("Perniagaan saya", "My business"); sv(); } next(false); };
  var bb = el.querySelector("#wzB"); if(bb) bb.onclick = function(){ secRead(k, p, box); sv(); ST.wiz--; draw(); }; }
function complete(p){ var c = [["name", 15], ["logo", 10], ["regNo", 15, "licence"], ["addr", 12], ["phone", 8], ["email", 5], ["bank", 15], ["qr", 5], ["sigs", 10], ["stamp", 5]], got = 0, miss = [];
  var lab = {name:L("nama", "name"), logo:"logo", regNo:L("no. SSM", "SSM no."), addr:L("alamat", "address"), phone:L("telefon", "phone"), email:"e-mel", bank:L("akaun bank", "bank account"), qr:"DuitNow QR", sigs:L("tandatangan", "signature"), stamp:L("cop", "stamp")};
  c.forEach(function(x){ var v = p[x[0]]; var ok = x[0] === "addr" ? !!(p.addr && p.addr.l1) : x[0] === "bank" ? (p.bank || []).some(function(b){ return b.accNo; }) : x[0] === "sigs" ? (p.sigs || []).length > 0 : !!(v || (x[2] && p[x[2]])); if(ok) got += x[1]; else miss.push(lab[x[0]]); });
  return {pc:got, miss:miss}; }

// ---------- dashboard ----------
function period(){ var t = N.ymd(), y = +t.slice(0, 4), m = +t.slice(5, 7), f, to = t, pad = function(n){ return ("0" + n).slice(-2); };
  if(ST.per === "month") f = t.slice(0, 7) + "-01";
  else if(ST.per === "last"){ var lm = m === 1 ? 12 : m - 1, ly = m === 1 ? y - 1 : y; f = ly + "-" + pad(lm) + "-01"; to = ly + "-" + pad(lm) + "-" + pad(new Date(ly, lm, 0).getDate()); }
  else if(ST.per === "quarter"){ var q = Math.floor((m - 1) / 3) * 3 + 1; f = y + "-" + pad(q) + "-01"; }
  else f = y + "-01-01"; return [f, to]; }
function stats(pids, f, to){ var t = N.ymd(), S = {mine:staff() ? D.dev.id : "", byL:{}, col:0, billed:0, out:0, over:0, overN:0, qOpen:0, qN:0, qAcc:0, qIss:0, tax:0, age:[0, 0, 0, 0, 0], act:[], cust:{}, meth:{}};
  N.live(D.docs).forEach(function(d){ if(pids.indexOf(d.pid) < 0 || d.status === "void") return; var p = N.profOf(D, d);
    if(d.voidReq && d.status !== "void" && !S.mine) S.act.push([d, L("Minta batal", "Void requested")]);
    if(d.discReq && d.status === "draft" && !(d.discOk >= d.discReq.pct)) S.act.push([d, (S.mine ? L("Menunggu kelulusan diskaun ", "Waiting for discount approval ") : L("Minta diskaun ", "Discount asked ")) + d.discReq.pct + "%"]);
    if(S.mine && d.mk !== S.mine) return;
    if(d.status === "draft"){ if(d.recurFrom) S.act.push([d, L("Invois berulang sedia untuk dihantar", "Recurring invoice ready to send")]); else if(N.daysBetween(String(d.created || d.date).slice(0, 10), t) > 3) S.act.push([d, L("Draf lebih 3 hari", "Draft older than 3 days")]); return; }
    var T = scaleT(N.totals(D, d, p), N.rate(d, p)), inP = d.date >= f && d.date <= to;
    if(d.type === "CN" || d.type === "DN"){ if(inP){ S.billed += d.type === "CN" ? -T.total : T.total; } if(d.refAmt){ var rd = d.rdate || d.date; if(rd >= f && rd <= to) S.col -= N.sen(d.refAmt); } return; }   // 0.6.52: booking refunds paid out
    if(d.type === "PO" || d.type === "PV") return;
    if(d.type === "OR"){ var pd = d.pdate || d.date; if(d.cr) return; if(pd >= f && pd <= to){ S.col += T.total; S.meth[d.method || "other"] = (S.meth[d.method || "other"] || 0) + T.total; var cn = (d.cust || {}).name || "—"; S.cust[cn] = (S.cust[cn] || 0) + T.total; } return; }
    if(d.type === "CS"){ if(inP){ S.col += T.total; S.billed += T.total; S.tax += T.taxSum; S.meth[d.method || "cash"] = (S.meth[d.method || "cash"] || 0) + T.total; var cn2 = (d.cust || {}).name || L("Tunai", "Walk-in"); S.cust[cn2] = (S.cust[cn2] || 0) + T.total; } return; }
    if(inP && (d.type === "INV" || d.type === "CS")){ var lt = (/-([A-Z])\d+$/.exec(d.no || "") || [0, "A"])[1]; S.byL[lt] = (S.byL[lt] || 0) + T.total; }
    if(d.type === "INV"){ if(inP){ S.billed += T.total; S.tax += T.taxSum; } if(T.bal > 0){ S.out += T.bal; var late = d.due ? N.daysBetween(d.due, t) : 0;
        S.age[late <= 0 ? 0 : late <= 30 ? 1 : late <= 60 ? 2 : late <= 90 ? 3 : 4] += T.bal; if(late > 0){ S.over += T.bal; S.overN++; S.act.push([d, L("Lewat ", "Overdue ") + late + L(" hari", " days")]); } } return; }
    if(d.type === "QT"){ var s = N.status(D, d); if(inP){ S.qIss++; if(s === "accepted") S.qAcc++; } if(s === "sent"){ S.qOpen += T.total; S.qN++; if(d.valid && N.daysBetween(t, d.valid) <= 7) S.act.push([d, L("Tamat ", "Expires ") + TP.dateStr(d.valid, H.en() ? "en" : "bm")]); } } });
  return S; }
function months12(pids){ var out = [], now = new Date(); for(var i = 11; i >= 0; i--){ var d = new Date(now.getFullYear(), now.getMonth() - i, 1), k = N.ymd(d).slice(0, 7); out.push({k:k, b:0, c:0}); }
  var at = function(k){ for(var i = 0; i < out.length; i++) if(out[i].k === k) return out[i]; return null; };
  N.live(D.docs).forEach(function(d){ if(pids.indexOf(d.pid) < 0 || d.status === "void" || d.status === "draft") return; var pp = N.profOf(D, d), T = scaleT(N.totals(D, d, pp), N.rate(d, pp));
    if(d.type === "CN" || d.type === "DN"){ var an = at(d.date.slice(0, 7)); if(an) an.b += d.type === "CN" ? -T.total : T.total; if(d.refAmt){ var ar = at((d.rdate || d.date).slice(0, 7)); if(ar) ar.c -= N.sen(d.refAmt); } return; }
    if(d.type === "INV" || d.type === "CS"){ var a = at(d.date.slice(0, 7)); if(a) a.b += T.total; }
    if((d.type === "OR" && !d.cr) || d.type === "CS"){ var b = at((d.pdate || d.date).slice(0, 7)); if(b) b.c += T.total; } });
  return out; }
function vDash(el){ var pids = pidsNow(), pr = period(), p = prof(), cp = complete(p);
  if(window.NiagaExp){ var ad = 0; pids.forEach(function(id){ ad += NiagaExp.recur(D, id); }); if(ad) sv(); }
  var S = stats(pids, pr[0], pr[1]); S.exp = window.NiagaExp ? pids.reduce(function(s, id){ return s + NiagaExp.sum(D, id, pr[0], pr[1]); }, 0) : 0;
  var tile = function(k, ic, a, b, v, sub, tone){ return '<button class="ngTile' + (tone ? " " + tone : "") + '" data-tl="' + k + '"><small>' + ic + ' ' + L(a, b) + '</small><b>' + v + '</b>' + (sub ? '<i>' + sub + '</i>' : '') + '</button>'; };
  if(S.mine){ el.innerHTML = '<div class="chips ngPer">' + [["month", L("Bulan ini", "This month")], ["last", L("Bulan lepas", "Last month")], ["year", L("Tahun ini", "This year")]].map(function(o){ return '<button class="chip' + (ST.per === o[0] ? " on" : "") + '" data-per="' + o[0] + '">' + o[1] + '</button>'; }).join("") + '</div><div class="mut small">👤 ' + L("Jualan dan kutipan anda", "Your own sales and collections") + '</div><div class="ngTiles">' + tile("col", "💰", "Kutipan saya", "My collections", money(S.col, p), "", "good") + tile("billed", "📄", "Jualan saya", "My sales", money(S.billed, p), "") + '</div>' + (S.act.length ? '<div class="card"><h3>🔔 ' + L("Perlu tindakan", "Needs action") + '</h3>' + S.act.slice(0, 12).map(function(a){ return docRow(a[0], a[1]); }).join("") + '</div>' : '');
    el.querySelectorAll("[data-per]").forEach(function(b){ b.onclick = function(){ ST.per = b.getAttribute("data-per"); draw(); }; }); bindRows(el); return; }
  var conv = S.qIss ? Math.round(S.qAcc / S.qIss * 100) + "% " + L("diterima", "accepted") : "";
  var h = '<div class="chips ngPer">' + [["month", L("Bulan ini", "This month")], ["last", L("Bulan lepas", "Last month")], ["quarter", L("Suku ini", "This quarter")], ["year", L("Tahun ini", "This year")]].map(function(o){ return '<button class="chip' + (ST.per === o[0] ? " on" : "") + '" data-per="' + o[0] + '">' + o[1] + '</button>'; }).join("") + '</div>' +
    '<div class="ngTiles">' + tile("col", "💰", "Kutipan", "Collected", money(S.col, p), "", "good") + tile("out", "⏳", "Belum dibayar", "Outstanding", money(S.out, p), L("semua masa", "all time")) +
    tile("over", "⚠️", "Lewat", "Overdue", money(S.over, p), S.overN + " " + L("invois", "invoices"), S.over ? "bad" : "") + tile("billed", "📄", "Jualan", "Billed", money(S.billed, p), "") + tile("exp", "💸", "Belanja", "Expenses", money(S.exp, p), "") + tile("profit", "📈", "Untung kasar", "Simple profit", money(S.col - S.exp, p), L("kutipan − belanja (anggaran)", "collected − expenses (estimate)"), S.col - S.exp < 0 ? "bad" : "good") +
    tile("qt", "📝", "Sebut harga terbuka", "Open quotations", money(S.qOpen, p), S.qN + " · " + conv) + ((p.tax && p.tax.sst) || S.tax ? tile("tax", "🧮", "SST dikutip", "SST collected", money(S.tax, p), "") : "") + '</div>';
  var M12 = months12(pids), mx = Math.max.apply(null, M12.map(function(x){ return Math.max(x.b, x.c); }).concat([1]));
  h += '<div class="card ngChart"><h3>' + L("Kutipan berbanding jualan", "Collected vs billed") + '</h3><div class="ngLeg"><span><i class="lb"></i>' + L("Jualan", "Billed") + '</span><span><i class="lc"></i>' + L("Kutipan", "Collected") + '</span></div>' + barsSvg(M12, mx) + '</div>';
  var at = S.age.reduce(function(s, x){ return s + x; }, 0);
  if(at){ var AG = [[L("Semasa", "Current"), "#7aa98c"], ["1–30", "#e5b04a"], ["31–60", "#e08a3c"], ["61–90", "#d0602f"], ["90+", "#b3261e"]];
    h += '<div class="card ngChart"><h3>' + L("Umur hutang belum bayar", "Aging of outstanding") + '</h3><div class="ngAge">' + S.age.map(function(v, i){ return v ? '<i style="flex:' + v + ';background:' + AG[i][1] + '" title="' + AG[i][0] + '"></i>' : ''; }).join("") + '</div><div class="ngAgeL">' + S.age.map(function(v, i){ return '<span><i style="background:' + AG[i][1] + '"></i>' + AG[i][0] + '<b>' + money(v, p) + '</b></span>'; }).join("") + '</div></div>'; }
  var top = Object.keys(S.cust).map(function(k){ return [k, S.cust[k]]; }).sort(function(a, b){ return b[1] - a[1]; }).slice(0, 5);
  if(top.length) h += '<div class="card"><h3>' + L("Pelanggan utama (kutipan)", "Top customers (collected)") + '</h3>' + top.map(function(t){ return '<div class="ngKV"><span>' + E(t[0]) + '</span><b>' + money(t[1], p) + '</b></div>'; }).join("") + '</div>';
  var bl = Object.keys(S.byL).sort(); if(bl.length > 1) h += '<div class="card"><h3>📱 ' + L("Jualan ikut telefon", "Sales by phone") + '</h3>' + bl.map(function(k){ return '<div class="ngKV"><span>' + L("Telefon ", "Phone ") + E(k) + '</span><b>' + money(S.byL[k], p) + '</b></div>'; }).join("") + '</div>';
  if(S.act.length) h += '<div class="card"><h3>🔔 ' + L("Perlu tindakan", "Needs action") + '</h3>' + S.act.slice(0, 12).map(function(a){ return docRow(a[0], a[1]); }).join("") + '</div>';
  if(!ST.all && cp.pc < 100) h += '<button class="card ngComp" data-ngp2="prof"><div class="row"><b>' + L("Profil ", "Profile ") + cp.pc + "% " + L("lengkap", "complete") + '</b><span>›</span></div><div class="ngMeter"><i style="width:' + cp.pc + '%"></i></div><small class="mut">' + L("Tambah: ", "Add: ") + E(cp.miss.slice(0, 3).join(", ")) + '</small></button>';
  if(!N.live(D.docs).some(function(d){ return pids.indexOf(d.pid) >= 0; })) h += '<div class="card mut center">' + L("Belum ada dokumen. Tekan ＋ Baru.", "No documents yet. Tap ＋ New.") + '</div>';
  el.innerHTML = h;
  el.querySelectorAll("[data-per]").forEach(function(b){ b.onclick = function(){ ST.per = b.getAttribute("data-per"); draw(); }; });
  el.querySelectorAll("[data-tl]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-tl"); ST.pg = "dok"; if(k === "exp" || k === "profit"){ ST.pg = "exp"; ST.all = false; goTop(); draw(); return; } ST.seg = {out:"unpaid", over:"over", qt:"QT", col:"OR", billed:"INV"}[k] || "all"; ST.all = false; goTop(); draw(); }; });
  var c = el.querySelector("[data-ngp2]"); if(c) c.onclick = function(){ ST.pg = "prof"; goTop(); draw(); };
  bindRows(el); }
function barsSvg(M12, mx){ var w = 340, h = 150, bw = w / 12, s = function(v){ return h - 18 - (v / mx) * (h - 30); };
  var MB = ["J","F","M","A","M","J","J","O","S","O","N","D"], ME = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  var bars = M12.map(function(x, i){ var y = s(x.b); return '<rect x="' + (i * bw + bw * .2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw * .6).toFixed(1) + '" height="' + Math.max(0, h - 18 - y).toFixed(1) + '" rx="3" class="ngBarB"><title>' + x.k + '</title></rect><text x="' + (i * bw + bw / 2).toFixed(1) + '" y="' + (h - 4) + '" class="ngAx">' + (H.en() ? ME : MB)[+x.k.slice(5) - 1] + '</text>'; }).join("");
  var pts = M12.map(function(x, i){ return (i * bw + bw / 2).toFixed(1) + "," + s(x.c).toFixed(1); });
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="ngSvg" role="img">' + '<line x1="0" x2="' + w + '" y1="' + (h - 18) + '" y2="' + (h - 18) + '" class="ngBase"/>' + bars + '<polyline points="' + pts.join(" ") + '" class="ngLine"/>' + M12.map(function(x, i){ return '<circle cx="' + (i * bw + bw / 2).toFixed(1) + '" cy="' + s(x.c).toFixed(1) + '" r="3" class="ngDot"/>'; }).join("") + '</svg>'; }

// ---------- documents list ----------
function docRow(d, note){ var p = N.profOf(D, d), T = N.totals(D, d, p), st = N.status(D, d);
  return '<button class="ngDoc" data-dv="' + d.id + '"><span class="ngDI">' + N.TYPES[d.type].ic + '</span><span class="ngDM"><b>' + E(d.no || L("Draf", "Draft")) + ' · ' + E((d.cust || {}).name || "—") + '</b><small>' + TP.dateStr(d.date, H.en() ? "en" : "bm") + (note ? ' · <em>' + E(note) + '</em>' : '') + (d.imported ? ' · ' + L("diimport", "imported") : '') + '</small></span>' +
    '<span class="ngDA"><b>' + (d.type === "DO" ? "" : (d.type === "CN" ? "−" : "") + dm(T.total, d, p)) + '</b>' + (d.type === "INV" && T.bal && T.bal !== T.total ? '<small>' + L("baki ", "bal. ") + dm(T.bal, d, p) + '</small>' : '') + pill(st) + '</span></button>'; }
function bindRows(el){ el.querySelectorAll("[data-dv]").forEach(function(b){ b.onclick = function(){ ST.vw = b.getAttribute("data-dv"); goTop(); draw(); }; }); }
var SEGS = [["all","Semua","All"],["QT","Sebut harga","Quotations"],["INV","Invois","Invoices"],["OR","Resit","Receipts"],["CS","Bil tunai","Cash sales"],["DO","Nota hantaran","Delivery"],["PF","Proforma","Proforma"],["note","Nota K/D","Credit/debit"],["buy","Pembelian","Purchases"],["draft","Draf","Drafts"],["unpaid","Belum bayar","Unpaid"],["over","Lewat","Overdue"]];
function vDocs(el){ var p = prof(), q = ST.q.toLowerCase(), t = N.ymd();
  var list = N.live(D.docs).filter(function(d){ if(d.pid !== p.id) return false; var st = N.status(D, d);
    if(ST.seg === "draft" && st !== "draft") return false; if(ST.seg === "unpaid" && !(d.type === "INV" && (st === "sent" || st === "partial" || st === "overdue"))) return false; if(ST.seg === "over" && st !== "overdue") return false;
    if(N.TYPES[ST.seg] && d.type !== ST.seg) return false; if(ST.seg === "note" && d.type !== "CN" && d.type !== "DN") return false; if(ST.seg === "buy" && d.type !== "PO" && d.type !== "PV") return false;
    if(q){ var hay = [d.no, (d.cust || {}).name, (d.cust || {}).co, (d.cust || {}).phone, d.ref, (d.lines || []).map(function(l){ return l.desc; }).join(" "), (d.totals || {}).total].join(" ").toLowerCase(); if(hay.indexOf(q) < 0) return false; } return true; })
    .sort(function(a, b){ return (b.date + (b.no || "")).localeCompare(a.date + (a.no || "")); });
  var h = '<div class="ngSearch"><input id="ngQ" type="search" placeholder="🔍 ' + L("Cari nombor, pelanggan, barang, amaun", "Search number, customer, item, amount") + '" value="' + E(ST.q) + '"></div><div class="chips ngSeg">' + SEGS.map(function(s){ return '<button class="chip' + (ST.seg === s[0] ? " on" : "") + '" data-sg="' + s[0] + '">' + L(s[1], s[2]) + '</button>'; }).join("") + '</div>';
  var last = ""; if(!list.length) h += '<div class="card mut center">' + L("Tiada dokumen di sini.", "No documents here.") + '</div>';
  list.forEach(function(d){ var m = d.date.slice(0, 7); if(m !== last){ last = m; var sum = list.filter(function(x){ return x.date.slice(0, 7) === m && x.type !== "DO" && x.type !== "QT" && x.status !== "void" && x.status !== "draft" && x.type !== "OR"; }).reduce(function(s, x){ return s + N.totals(D, x, p).total; }, 0);
      h += '<div class="ngMon"><b>' + TP.dateStr(m + "-01", H.en() ? "en" : "bm").replace(/^1 /, "") + '</b>' + (sum ? '<span>' + money(sum, p) + '</span>' : '') + '</div>'; } h += docRow(d); });
  h += '<div class="btns" style="margin-top:12px"><button class="btn alt g3d" id="ngCsvD">⬇️ CSV</button><button class="btn alt g3d" id="ngXls">📊 Excel</button><button class="btn alt g3d" id="ngMyi">🧾 MyInvois</button></div>';
  el.innerHTML = h; bindRows(el);
  var qi = el.querySelector("#ngQ"); qi.oninput = function(){ ST.q = qi.value; clearTimeout(vDocs.t); vDocs.t = setTimeout(function(){ draw(); var i = root.querySelector("#ngQ"); if(i){ i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 250); };
  el.querySelectorAll("[data-sg]").forEach(function(b){ b.onclick = function(){ ST.seg = b.getAttribute("data-sg"); draw(); }; });
  el.querySelector("#ngCsvD").onclick = function(){ exportCsv(list, p); };
  el.querySelector("#ngXls").onclick = function(){ exportXlsx(p); }; el.querySelector("#ngMyi").onclick = function(){ myInvois(p); }; }
// 0.6.26: Excel workbook for the accountant (same tabs as the Google Sheet), written on the phone
function exportXlsx(p){ var docs = N.live(D.docs).filter(function(d){ return d.pid === p.id && d.status !== "draft"; }).sort(function(a, b){ return a.date.localeCompare(b.date); }), byId = {}; docs.forEach(function(d){ byId[d.id] = d; });
  var S1 = [["Jenis / Type","No.","Tarikh / Date","Tarikh akhir / Due","Pelanggan / Customer","Jumlah kecil / Subtotal","Diskaun / Discount","Cukai / Tax","Jumlah / Total","Dibayar / Paid","Baki / Balance","Status"]],
    S2 = [["No. dokumen","Jenis","Tarikh","Perkara / Item","Kuantiti / Qty","Unit","Harga / Price","Amaun / Amount"]], S3 = [["No.","Tarikh / Date","Pelanggan / Customer","Kaedah / Method","Rujukan / Ref","Amaun / Amount","Untuk / For"]],
    S4 = [["Nama / Name","Syarikat / Company","Telefon / Phone","E-mel","Alamat / Address"]], S5 = [["Nama / Name","Unit","Harga / Price","SKU","Kategori / Category"]], S6 = [["Tarikh / Date","Kategori / Category","Pembekal / Supplier","Amaun / Amount","SST","Kaedah / Method","No. resit / Receipt no.","Layanan cukai / Tax treatment","Boleh ditolak / Deductible","Nota / Note"]];
  if(window.NiagaExp) N.live(D.expenses).filter(function(e){ return e.pid === p.id && NiagaExp.counts(e); }).sort(function(a, b){ return a.date.localeCompare(b.date); }).forEach(function(e){ var c = NiagaExp.cat(e.cat), t = NiagaExp.txOf(e), a = N.sen(e.amt), TXL = NiagaExp.TX[t];
    S6.push([xd(e.date), L(c[2], c[3]), e.vendor || "", N.rm(a), N.num(e.tax), e.method || "", e.ref || "", L(TXL[0], TXL[1]), N.rm(t === "full" ? a : t === "half" ? Math.round(a / 2) : 0), e.note || ""]); });
  docs.forEach(function(d){ var T = N.totals(D, d, p);
    S1.push([d.type, d.no, xd(d.date), xd(d.due), (d.cust || {}).name || "", N.rm(T.sub), N.rm(T.disc), N.rm(T.taxSum), N.rm(T.total), N.rm(T.paid), d.type === "INV" ? N.rm(T.bal) : 0, N.status(D, d)]);
    if(d.type !== "OR") (d.lines || []).forEach(function(l){ if(l.t !== "head") S2.push([d.no, d.type, xd(d.date), l.desc || "", N.num(l.qty), l.unit || "", N.num(l.price), d.type === "DO" ? 0 : N.rm(N.lineAmt(l))]); });
    if(d.status !== "void" && (d.type === "OR" || d.type === "CS")) S3.push([d.no, xd(d.pdate || d.date), (d.cust || {}).name || "", d.method || "", d.pref || "", N.rm(T.total), (d.apply || []).map(function(a){ return (byId[a.doc] || {}).no || ""; }).join(", ")]); });
  N.live(D.customers).forEach(function(c){ if(c.pid === p.id) S4.push([c.name, c.co || "", c.phone || "", c.email || "", c.addr || ""]); });
  N.live(D.items).forEach(function(x){ if(x.pid === p.id) S5.push([x.name, x.unit || "", N.num(x.price), x.sku || "", x.cat || ""]); });
  var b64 = window.NiagaXlsx([["Dokumen", S1], ["Butiran", S2], ["Bayaran", S3], ["Pelanggan", S4], ["Barang", S5], ["Belanja", S6]]), name = "niaga-" + (p.name || "biz").replace(/[^A-Za-z0-9]+/g, "-") + "-" + N.ymd() + ".xlsx", mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if(window.Native && H.N.shareBinary) H.N.shareBinary(name, b64, mime, ""); else { var a = document.createElement("a"); a.href = "data:" + mime + ";base64," + b64; a.download = name; document.body.appendChild(a); a.click(); a.remove(); } }
function xd(s){ return s ? {d:s} : ""; }
function exportCsv(list, p){ var rows = [[L("Jenis", "Type"), L("No.", "No."), L("Tarikh", "Date"), L("Tarikh akhir", "Due"), L("Pelanggan", "Customer"), L("Jumlah kecil", "Subtotal"), L("Diskaun", "Discount"), L("Cukai", "Tax"), L("Jumlah", "Total"), L("Dibayar", "Paid"), L("Baki", "Balance"), "Status", L("Kaedah", "Method")]];
  list.forEach(function(d){ var T = N.totals(D, d, p); rows.push([tname(d.type), d.no || "", d.date, d.due || "", (d.cust || {}).name || "", N.rm(T.sub), N.rm(T.disc), N.rm(T.taxSum), N.rm(T.total), N.rm(T.paid), N.rm(T.bal), N.status(D, d), d.method || ""]); });
  var name = "niaga-" + (p.name || "biz").replace(/[^A-Za-z0-9]+/g, "-") + "-" + N.ymd() + ".csv", txt = N.csvMake(rows);
  if(window.Native && H.N.openTextFile) H.N.openTextFile(name, "text/csv", txt, true); else saveText(name, txt, "text/csv"); }

// ---------- one document ----------
// 0.6.26: this phone's own signatures (staff sign with their own name) are added when drawing; they never leave the phone
function rp(p){ var my = D.mySigs || []; if(!my.length) return p; var q = Object.assign({}, p); q.sigs = (p.sigs || []).concat(my); return q; }
function mySigs(){ return D.mySigs = D.mySigs || []; }
function discPct(d, p){ var g = 0; (d.lines || []).forEach(function(l){ if(l.t !== "head") g += Math.round(N.num(l.qty) * N.sen(l.price)); }); if(!g) return 0; var T = N.totals(D, d, p); return Math.round((g - (T.sub - T.disc)) / g * 1000) / 10; }
function preview(el, d, p, opt){ el.innerHTML = '<div class="ngLoad">⏳</div>';
  return TP.render(D, d, rp(p), imgGet, opt).then(function(pages){ if(!document.body.contains(el)) return pages; el.innerHTML = ""; pages.forEach(function(cv){ var im = document.createElement("img"); im.src = cv.toDataURL("image/jpeg", .85); im.className = pages.thermal ? "ngPg th" : "ngPg"; im.onclick = function(){ zoom(im.src); }; el.appendChild(im); }); return pages; })
    .catch(function(e){ console.error(e); el.innerHTML = '<div class="mut">' + L("Pratonton gagal", "Preview failed") + '</div>'; }); }
function zoom(src){ var z = document.createElement("div"); z.className = "ngZoom"; z.innerHTML = '<img src="' + src + '" alt=""><button class="chip">✕</button>'; z.onclick = function(){ z.remove(); }; document.body.appendChild(z); }
function vDoc(el){ var d = N.byId(D.docs, ST.vw); if(!d || d.del){ ST.vw = null; vDocs(el); return; } var p = N.profOf(D, d) || prof(), st = N.status(D, d), T = N.totals(D, d, p), ty = N.TYPES[d.type];
  var act = []; var A = function(k, ic, a, b, cls){ act.push('<button class="btn ' + (cls || "alt") + ' g3d" data-da="' + k + '">' + ic + ' ' + L(a, b) + '</button>'); };
  if(st === "draft"){ A("edit", "✎", "Sambung", "Continue", "gold"); if(d.discReq && !staff() && !(d.discOk >= d.discReq.pct)) A("dok", "✅", L("Luluskan diskaun ", "Approve discount ") + d.discReq.pct + "%", L("Luluskan diskaun ", "Approve discount ") + d.discReq.pct + "%"); A("del", "🗑", "Padam draf", "Delete draft"); }
  else { A("share", "📤", "Kongsi", "Share", "gold");
    if(d.type === "INV" && T.bal > 0 && st !== "void" && !(staff() && p.perms && p.perms.staffPay === false)) A("pay", "💵", "Rekod bayaran", "Record payment");
    if(d.type === "QT" && st !== "void"){ if(st !== "accepted") A("acc", "✅", "Diterima", "Accepted"); if(st === "sent" || st === "expired") A("rej", "✖", "Ditolak", "Rejected"); A("dep", "💵", "Terima deposit", "Take deposit"); A("csig", "✍️", "Pelanggan tandatangan", "Customer signs"); }
    if(d.type === "DO" && st !== "void") A("recv", "✍️", "Penerima tandatangan", "Receiver signs");
    if(st !== "void") ty.to.forEach(function(t){ var sub = N.TYPES[t].sub; A("cv" + t, sub ? "＋" : "➜", (sub ? "" : L("Jadikan ", "Make ")) + tname(t), (sub ? "" : L("Jadikan ", "Make ")) + tname(t)); });
    if(d.type === "INV" && st !== "void" && !staff()) A("rec", "🔁", d.recur ? L("Berulang: ", "Repeats: ") + recLabel(d.recur) : L("Ulang invois", "Repeat invoice"), d.recur ? L("Berulang: ", "Repeats: ") + recLabel(d.recur) : L("Ulang invois", "Repeat invoice"));
    if(d.type === "PO" && st !== "void"){ if(!d.recv) A("porecv", "📦", "Barang diterima", "Goods received"); if(!d.expId) A("poexp", "💸", "Rekod sebagai belanja", "Record as expense"); }
    if(st !== "void"){ if(staff()){ if(!d.voidReq) A("vreq", "⛔", "Minta batal", "Ask to void"); } else { if(d.voidReq){ A("vok", "✅", "Luluskan batal", "Approve void"); A("vno", "✖", "Tolak permintaan batal", "Refuse void request"); } A("void", "⛔", "Batal", "Void"); } } }
  A("dup", "⧉", "Salin", "Duplicate");
  var links = [], fr = d.from && N.byId(D.docs, d.from); if(fr && !fr.del) links.push(fr); (d.to || []).forEach(function(id){ var x = N.byId(D.docs, id); if(x && !x.del) links.push(x); });
  var pays = (T.pays || []);
  var h = '<div class="row ngVH"><button class="chip" id="ngBk">‹ ' + L("Kembali", "Back") + '</button>' + pill(st) + '</div>' +
    '<div class="card ngVS"><div><small>' + ty.ic + ' ' + tname(d.type) + '</small><b>' + E(d.no || L("Draf", "Draft")) + '</b><small>' + E((d.cust || {}).name || "—") + '</small></div><div class="ngVT">' + (d.type === "DO" ? "" : '<b>' + dm(T.total, d, p) + '</b>') + (d.type === "INV" ? '<small>' + L("Baki ", "Balance ") + dm(T.bal, d, p) + '</small>' : '') + '</div></div>' +
    '<div class="ngActs">' + act.join("") + '</div>' + (d.voidReq && st !== "void" ? '<div class="card small">⏳ ' + L("Permintaan batal: ", "Void requested: ") + E(d.voidReq.reason || "") + '</div>' : '') + (d.voidReason ? '<div class="card mut small">⛔ ' + E(d.voidReason) + '</div>' : '') +
    '<div id="ngPv" class="ngPv"></div>';
  if(pays.length) h += '<div class="card"><h3>💵 ' + L("Bayaran", "Payments") + '</h3>' + pays.map(function(x){ return '<button class="ngKV" data-dv="' + x.r.id + '"><span>' + E(x.r.no) + ' · ' + TP.dateStr(x.r.pdate || x.r.date, H.en() ? "en" : "bm") + (x.dep ? ' · deposit' : '') + '</span><b>' + money(x.amt, p) + '</b></button>'; }).join("") + '</div>';
  if(d.type === "OR") h += '<div class="card"><h3>' + L("Untuk", "For") + '</h3>' + (d.apply || []).map(function(a){ var x = N.byId(D.docs, a.doc); return x ? '<button class="ngKV" data-dv="' + x.id + '"><span>' + E(x.no) + '</span><b>' + money(N.sen(a.amt), p) + '</b></button>' : ''; }).join("") + '</div>';
  if(links.length) h += '<div class="card"><h3>🔗 ' + L("Dokumen berkaitan", "Linked documents") + '</h3>' + links.map(function(x){ return docRow(x); }).join("") + '</div>';
  var lg = D.log.filter(function(x){ return x.doc === d.id; });
  if(lg.length) h += '<div class="card"><h3>🕘 ' + L("Sejarah", "History") + '</h3>' + lg.map(function(x){ return '<div class="ngKV"><span>' + E(ACTS[x.act] ? L(ACTS[x.act][0], ACTS[x.act][1]) : x.act) + '</span><small>' + E(x.at.slice(0, 16).replace("T", " ")) + '</small></div>'; }).join("") + '</div>';
  el.innerHTML = h; bindRows(el);
  preview(el.querySelector("#ngPv"), d, p);
  el.querySelector("#ngBk").onclick = function(){ ST.vw = null; draw(); };
  el.querySelectorAll("[data-da]").forEach(function(b){ b.onclick = function(){ docAct(d, b.getAttribute("data-da")); }; }); }
var ACTS = {recur:["Dibuat daripada invois berulang", "Made from a recurring invoice"], poexp:["Direkod sebagai belanja", "Recorded as an expense"], dreq:["Minta kelulusan diskaun", "Discount approval asked"], dok:["Diskaun diluluskan", "Discount approved"], vreq:["Minta batal", "Void requested"], vno:["Permintaan batal ditolak", "Void request refused"], create:["Dibuat", "Created"], issue:["Dikeluarkan", "Issued"], sent:["Dikongsi", "Shared"], pay:["Bayaran direkod", "Payment recorded"], void:["Dibatalkan", "Voided"], accept:["Diterima pelanggan", "Accepted by customer"], reject:["Ditolak", "Rejected"], recv:["Diterima penerima", "Received"], edit:["Diubah", "Edited"], import:["Diimport", "Imported"]};
function touch(d, act){ N.stamp(D, d); N.cache(D, d, N.profOf(D, d)); if(act) N.log(D, d.id, act); sv(); }
function docAct(d, a){ var p = N.profOf(D, d);
  if(a === "edit"){ ST.ed = d.id; ST.vw = null; goTop(); draw(); }
  else if(a === "del"){ if(!confirm(L("Padam draf ini?", "Delete this draft?"))) return; d.del = true; unlink(d); touch(d); ST.vw = null; draw(); }
  else if(a === "share") share(d);
  else if(a === "pay" || a === "dep") payment(d, a === "dep");
  else if(a === "acc"){ d.status = "accepted"; touch(d, "accept"); draw(); }
  else if(a === "rej"){ d.status = "rejected"; touch(d, "reject"); draw(); }
  else if(a === "csig") pad(L("Diterima oleh (pelanggan)", "Accepted by (customer)"), "name", function(png, nm){ var id = N.rid(); imgPut(id, png); d.csig = {img:id, name:(nm && nm.name) || (d.cust || {}).name || "", at:N.iso()}; d.status = "accepted"; touch(d, "accept"); draw(); });
  else if(a === "recv") pad(L("Diterima dalam keadaan baik oleh", "Received in good condition by"), "ic", function(png, nm){ var id = N.rid(); imgPut(id, png); d.csig = {img:id, name:(nm && nm.name) || "", ic:(nm && nm.ic) || "", at:N.iso()}; d.recv = true; touch(d, "recv"); draw(); });
  else if(a === "rec") recurSheet(d);
  else if(a === "porecv"){ d.recv = true; touch(d, "recv"); draw(); }
  else if(a === "poexp"){ var T0 = N.totals(D, d, p), ex = {id:N.rid(), pid:p.id, mk:D.dev.id, date:N.ymd(), cat:"stok", vendor:(d.cust || {}).name || "", amt:N.rm(Math.round(T0.total * N.rate(d, p))), method:"bank", ref:d.no, note:L("Pesanan belian ", "Purchase order ") + d.no, poId:d.id, created:N.iso()}; N.stamp(D, ex); D.expenses.push(ex); d.expId = ex.id; d.recv = true; touch(d, "poexp"); H.toast("💸 " + L("Direkod dalam Belanja", "Recorded in Expenses")); draw(); }
  else if(a.indexOf("cv") === 0){ var t = a.slice(2), n = N.makeFrom(D, d, t); if(N.TYPES[t].sub && !(n.lines || []).length) n.lines = [{t:"item", desc:"", qty:1, unit:"lot", price:"", tax:p.tax && p.tax.sst ? p.tax.rate : 0}]; N.stamp(D, n); D.docs.push(n); d.to = d.to || []; d.to.push(n.id); if(d.type === "QT" && d.status === "sent") d.status = "accepted"; touch(d); N.log(D, n.id, "create"); sv(); ST.ed = n.id; ST.vw = null; goTop(); draw(); }
  else if(a === "dup"){ var c = N.blankDoc(D, p, d.type), keep = ["cust","custId","lines","disc","discT","ship","other","notes","terms","sig","stamp","design","color","lang","hidePrice","method","pterm"]; keep.forEach(function(k){ if(d[k] != null) c[k] = N.clone(d[k]); });
    N.stamp(D, c); D.docs.push(c); N.log(D, c.id, "create"); sv(); ST.ed = c.id; ST.vw = null; goTop(); draw(); }
  else if(a === "dok"){ d.discOk = d.discReq.pct; touch(d, "dok"); draw(); }
  else if(a === "vreq"){ var rq = prompt(L("Sebab minta batal (pemilik akan luluskan):", "Why should it be voided? (the owner approves):"), ""); if(rq === null) return; d.voidReq = {reason:rq, at:N.iso(), dev:D.dev.id}; touch(d, "vreq"); draw(); }
  else if(a === "vok"){ d.status = "void"; d.voidReason = (d.voidReq || {}).reason || ""; delete d.voidReq; touch(d, "void"); remind(d); draw(); }
  else if(a === "vno"){ delete d.voidReq; touch(d, "vno"); draw(); }
  else if(a === "void"){ var r = prompt(L("Sebab batal (nombor tidak akan digunakan semula):", "Reason for voiding (the number is never reused):"), ""); if(r === null) return; d.status = "void"; d.voidReason = r; touch(d, "void"); remind(d); draw(); } }
function unlink(d){ if(!d.from) return; var f = N.byId(D.docs, d.from); if(f && f.to){ f.to = f.to.filter(function(x){ return x !== d.id; }); N.stamp(D, f); } }

// ---------- 0.6.29 recurring invoices ----------
function recLabel(r){ return ({w:L("mingguan", "weekly"), m:L("bulanan", "monthly"), y:L("tahunan", "yearly")})[r.f] + " · " + TP.dateStr(r.next, H.en() ? "en" : "bm"); }
function recurSheet(d){ var r = d.recur || {f:"m", next:N.nextD(d.date, "m"), end:""}, f = r.f;
  var ov = H.showSheet("🔁 " + L("Invois berulang", "Recurring invoice"), '<div class="mut small">' + L("Satu draf baharu disediakan pada tarikh itu (pelanggan, barang dan harga yang sama). Anda semak dan tekan Siap & Kongsi.", "A new draft is made on that date (same customer, items and prices). You check it and tap Done & share.") + '</div>' +
    '<div class="chips">' + [["w", L("Mingguan", "Weekly")], ["m", L("Bulanan", "Monthly")], ["y", L("Tahunan", "Yearly")]].map(function(o){ return '<button class="chip' + (f === o[0] ? " on" : "") + '" data-rf="' + o[0] + '">' + o[1] + '</button>'; }).join("") + '</div>' +
    '<div class="f2">' + fld("rcN", L("Seterusnya", "Next"), r.next, "date") + fld("rcE", L("Tamat (pilihan)", "Ends (optional)"), r.end || "", "date") + '</div><div class="btns" style="margin-top:10px">' + (d.recur ? '<button class="btn alt g3d" id="rcX">⏹ ' + L("Henti", "Stop") + '</button>' : '') + '<button class="btn gold g3d" id="rcOk" style="flex:1">✓ ' + L("Simpan", "Save") + '</button></div>');
  ov.querySelectorAll("[data-rf]").forEach(function(b){ b.onclick = function(){ f = b.getAttribute("data-rf"); ov.querySelectorAll("[data-rf]").forEach(function(x){ x.classList.toggle("on", x === b); }); var n = ov.querySelector("#rcN"); n.value = N.nextD(d.date, f); n.dispatchEvent(new Event("change", {bubbles:true})); }; });
  ov.querySelector("#rcOk").onclick = function(){ d.recur = {f:f, next:gv(ov, "rcN") || N.nextD(d.date, f), end:gv(ov, "rcE")}; touch(d); recRemind(d); H.closeOverlay(); draw(); };
  var x = ov.querySelector("#rcX"); if(x) x.onclick = function(){ delete d.recur; touch(d); recRemind(d); H.closeOverlay(); draw(); }; }
function recRemind(d){ if(!H.xrem) return; var r = d.recur, t = 0; if(r && r.next){ var q = r.next.split("-"); t = new Date(+q[0], +q[1] - 1, +q[2], 9, 5).getTime(); }
  H.xrem("ngr" + d.id, t, "🔁 " + L("Invois berulang sedia", "Recurring invoice ready"), ((d.cust || {}).name || "") + " · " + L("semak dan hantar", "check and send"), "side:alat/niaga"); }

// ---------- record a payment (makes an official receipt) ----------
function payment(d, dep){ var p = N.profOf(D, d), T = N.totals(D, d, p), amt = dep ? Math.round(T.total * .5) : T.bal;
  var ov = H.showSheet("💵 " + (dep ? L("Terima deposit", "Take a deposit") : L("Rekod bayaran", "Record a payment")), '<div class="mut small">' + E(d.no) + ' · ' + E((d.cust || {}).name || "") + (dep ? '' : ' · ' + L("baki ", "balance ") + money(T.bal, p)) + '</div>' +
    '<div class="f2">' + fld("pyA", L("Amaun", "Amount") + " (" + N.sym(N.docCur(d, p)) + ")", N.rm(amt).toFixed(2), "text", ' inputmode="decimal" data-calc="1"') + fld("pyD", L("Tarikh", "Date"), N.ymd(), "date") + '</div>' +
    sel("pyM", L("Kaedah", "Method"), "bank", N.METHODS.map(function(m){ return [m[0], L(m[1], m[2])]; })) + fld("pyR", L("Rujukan / ID transaksi / no. cek", "Reference / transaction ID / cheque no."), "") +
    tog("pyRc", L("Keluarkan resit rasmi", "Issue an official receipt"), true, L("Matikan untuk rekod sahaja.", "Turn off to only record it.")) +
    '<button class="btn gold full g3d" id="pyOk" style="margin-top:10px">✓ ' + L("Simpan", "Save") + '</button>');
  calcBind(ov);
  ov.querySelector("#pyOk").onclick = function(){ var a = N.sen(N.calc(gv(ov, "pyA"))); if(!(a > 0)){ H.toast(L("Masukkan amaun", "Enter an amount")); return; }
    if(!dep && a > T.bal && !confirm(L("Amaun melebihi baki. Teruskan?", "The amount is more than the balance. Continue?"))) return;
    var r = N.blankDoc(D, p, "OR"); r.cust = N.clone(d.cust || {}); r.custId = d.custId; r.pdate = gv(ov, "pyD") || N.ymd(); r.date = r.pdate; r.method = gv(ov, "pyM"); r.pref = gv(ov, "pyR"); r.apply = [{doc:d.id, amt:N.rm(a)}]; r.dep = !!dep; r.round = false; r.silent = !gv(ov, "pyRc"); if(d.cur){ r.cur = d.cur; r.rate = d.rate; }
    r.no = N.takeNo(D, p, "OR", r.date); r.status = "sent"; r.sig = d.sig; r.stamp = d.stamp; N.stamp(D, r); N.cache(D, r, p); D.docs.push(r); N.log(D, r.id, "issue"); N.log(D, d.id, "pay"); touch(d); remind(d); H.closeOverlay(); vib();
    H.toast("✅ " + L("Bayaran direkod: ", "Payment recorded: ") + r.no); if(!r.silent){ ST.vw = r.id; goTop(); draw(); setTimeout(function(){ share(r); }, 300); } else draw(); }; }

// payment reminders: 3 days before, on the day, 7 days after (cleared when paid or void)
function remind(d){ if(!H.xrem || d.type !== "INV") return; var T = N.totals(D, d, N.profOf(D, d)), on = d.status !== "void" && d.status !== "draft" && T.bal > 0 && d.due;
  [[-3, "b"], [0, "d"], [7, "a"]].forEach(function(x){ var id = "ng" + d.id + x[1], t = 0; if(on){ var p = N.addDays(d.due, x[0]).split("-"); t = new Date(+p[0], +p[1] - 1, +p[2], 9, 7).getTime(); }
    H.xrem(id, on ? t : 0, "📄 " + d.no + " · " + ((d.cust || {}).name || ""), x[0] < 0 ? L("Tarikh akhir dalam 3 hari. Baki ", "Due in 3 days. Balance ") + money(T.bal) : x[0] === 0 ? L("Tarikh akhir hari ini. Baki ", "Due today. Balance ") + money(T.bal) : L("Lewat 7 hari. Hantar peringatan yang baik. Baki ", "7 days overdue. Send a polite reminder. Balance ") + money(T.bal), "side:alat/niaga"); }); }

// ---------- share ----------
function fillWa(d, p){ var T = N.totals(D, d, p), t = p.waTpl || WA_DEF(), c = d.cust || {};
  return t.replace(/\{nama\}/g, c.att || c.name || "").replace(/\{jenis\}/g, tname(d.type).toLowerCase()).replace(/\{no\}/g, d.no || "").replace(/\{jumlah\}/g, dm(d.type === "INV" && T.bal ? T.bal : T.total, d, p))
    .replace(/\{tarikh\}/g, d.type === "INV" && d.due ? L(", tarikh akhir ", ", due ") + TP.dateStr(d.due, H.en() ? "en" : "bm") : d.type === "QT" && d.valid ? L(", sah hingga ", ", valid until ") + TP.dateStr(d.valid, H.en() ? "en" : "bm") : "").replace(/\{perniagaan\}/g, p.name || "").replace(/\s+\./g, "."); }
function drivePdf(d, p, b64){ if(!p.drivePdf || !NS() || !NS().link(p.id) || d.pdfRev === d.rev) return; NS().pdf(p.id, (d.no || "doc") + ".pdf", b64 || "", d.date.slice(0, 4)).then(function(r){ var x = N.byId(D.docs, d.id); if(x && r.url){ x.pdfUrl = r.url; x.pdfRev = x.rev + 1; N.stamp(D, x); sv(); } }, function(){}); }
function waNum(s){ s = String(s || "").replace(/\D/g, ""); if(!s) return ""; if(s[0] === "0") s = "6" + s; return s; }
function share(d){ var p = N.profOf(D, d), fname = (d.no || "draf") + ".pdf", text = fillWa(d, p), pages = null;
  var ov = H.showSheet("📤 " + L("Kongsi ", "Share ") + E(d.no || ""), '<div id="shPv" class="ngPv sm"></div><div class="ngShare">' +
    '<button class="btn gold g3d" data-sh="pdf">📄 PDF</button><button class="btn alt g3d" data-sh="img">🖼 ' + L("Gambar", "Picture") + '</button>' +
    '<button class="btn alt g3d" data-sh="wa">💬 WhatsApp</button><button class="btn alt g3d" data-sh="print">🖨 ' + L("Cetak", "Print") + '</button><button class="btn alt g3d" data-sh="txt">📋 ' + L("Salin mesej", "Copy message") + '</button></div>' +
    area("shT", L("Mesej", "Message"), text, 3));
  preview(ov.querySelector("#shPv"), d, p).then(function(pg){ pages = pg; });
  var mark = function(via){ d.sent = d.sent || []; d.sent.push({at:N.iso(), via:via}); N.log(D, d.id, "sent"); N.stamp(D, d); sv(); };
  var withPages = function(fn){ if(pages) fn(pages); else TP.render(D, d, rp(p), imgGet).then(function(pg){ pages = pg; fn(pg); }); };
  ov.querySelectorAll("[data-sh]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-sh"), msg = gv(ov, "shT");
    if(k === "txt"){ try{ navigator.clipboard.writeText(msg); }catch(e){} H.toast(L("Disalin", "Copied")); return; }
    withPages(function(pg){
      if(k === "pdf"){ var b64 = TP.pdf(pg); if(H.sharePdf) H.sharePdf(fname, b64, msg); mark("pdf"); drivePdf(d, p, b64); }
      else if(k === "img"){ var du = TP.picture(pg); if(window.Native && H.N.shareImage) H.N.shareImage(du, msg); else { var a = document.createElement("a"); a.href = du; a.download = (d.no || "doc") + ".jpg"; a.click(); } mark("img"); }
      else if(k === "wa"){ var du2 = TP.picture(pg); if(window.Native && H.N.shareTo) H.N.shareTo("com.whatsapp", du2, msg); else { var n = waNum((d.cust || {}).phone); H.openWeb ? H.openWeb("https://wa.me/" + n + "?text=" + encodeURIComponent(msg)) : window.open("https://wa.me/" + n + "?text=" + encodeURIComponent(msg)); } mark("wa"); }
      else if(k === "print"){ var html = '<html><head><style>@page{margin:0}body{margin:0}img{width:100%;display:block;page-break-after:always}</style></head><body>' + pg.map(function(c){ return '<img src="' + c.toDataURL("image/jpeg", .92) + '">'; }).join("") + '</body></html>';
        if(window.Native && H.N.printHtml) H.N.printHtml(html, d.no || "Niaga"); else { var w = window.open(""); if(w){ w.document.write(html); w.document.close(); setTimeout(function(){ w.print(); }, 400); } } } }); }; }); }

// ---------- new document ----------
function newDoc(type, cust){ var p = prof(); if(ST.all){ ST.all = false; }
  if(!type){ var ov = H.showSheet("＋ " + L("Dokumen baru", "New document"), '<div class="ngTypes">' + N.ORDER.map(function(t){ var x = N.TYPES[t]; return '<button data-nt="' + t + '"><span>' + x.ic + '</span><b>' + L(x.bm, x.en) + '</b><small>' + L(TDESC[t][0], TDESC[t][1]) + '</small></button>'; }).join("") + '</div>');
    ov.querySelectorAll("[data-nt]").forEach(function(b){ b.onclick = function(){ H.closeOverlay(); newDoc(b.getAttribute("data-nt"), cust); }; }); return; }
  var d = N.blankDoc(D, p, type); d.mk = D.dev.id; if(staff()){ d.sig = mySigs()[0] ? mySigs()[0].id : "none"; d.stamp = !!(p.perms && p.perms.staffStamp); } if(cust){ d.cust = snap(cust); d.custId = cust.id; }
  if(type !== "OR" && type !== "DO" && (p.notes || {}).all) d.notes = p.notes.all;
  if(type === "CS" && !d.cust.name) d.cust = {name:L("Pelanggan tunai", "Walk-in customer")};
  if(type !== "OR" && type !== "PV") d.lines = [{t:"item", desc:"", qty:1, unit:"pcs", price:"", tax:p.tax && p.tax.sst && type !== "PO" ? p.tax.rate : 0}];
  N.stamp(D, d); D.docs.push(d); N.log(D, d.id, "create"); sv(); ST.ed = d.id; ST.vw = null; goTop(); draw(); }
var TDESC = {PF:["Minta bayaran/deposit sebelum kerja (bukan invois cukai)", "Ask for payment before the work (not a tax invoice)"], PO:["Pesan barang daripada pembekal", "Order goods from a supplier"], PV:["Rekod wang keluar tanpa invois pembekal", "Record money paid out without a supplier invoice"], CN:["Kurangkan invois (pulangan, diskaun, silap)", "Reduce an invoice (return, discount, error)"], DN:["Tambah caj pada invois", "Add a charge to an invoice"], QT:["Tawaran harga, ada tarikh sah", "Price offer with a validity date"], INV:["Bil dengan tarikh akhir bayar", "Bill with a due date"], CS:["Jualan dibayar terus (invois + resit)", "Paid on the spot (invoice + receipt)"], OR:["Bukti bayaran diterima", "Proof of payment received"], DO:["Barang dihantar, penerima tandatangan", "Goods delivered, receiver signs"]};
function snap(c){ return {name:c.name || "", co:c.co || "", regNo:c.regNo || "", tin:c.tin || "", addr:c.addr || "", phone:c.phone || "", email:c.email || "", att:c.att || ""}; }

// ---------- editor ----------
function vEdit(el){ var d = N.byId(D.docs, ST.ed); if(!d || d.del || d.status !== "draft"){ ST.ed = null; draw(); return; }
  var p = N.profOf(D, d) || prof(), sst = !!(p.tax && p.tax.sst), c = d.cust || {}, ty = N.TYPES[d.type], pk = N.peekNo(D, p, d.type, d.date || N.ymd());
  var h = '<div class="row ngVH"><button class="chip" id="edBk">‹ ' + L("Simpan & keluar", "Save & close") + '</button><b>' + ty.ic + ' ' + tname(d.type) + '</b><button class="chip" id="edPv">👁 ' + L("Pratonton", "Preview") + '</button></div>';
  // 1 number + dates
  h += '<div class="card ngEdC"><div class="f2">' + fld("edNo", L("No. (automatik)", "No. (automatic)"), d.noMan || "", "text", ' placeholder="' + E(pk.no) + '"') + fld("edDt", L("Tarikh", "Date"), d.date, "date") + '</div>';
  if(d.type === "INV") h += '<div class="f2">' + sel("edTerm", L("Terma bayaran", "Payment terms"), d.pterm || "", [["", "—"], ["COD", "COD"], [L("Bayar semasa terima", "Due on receipt"), L("Bayar semasa terima", "Due on receipt")], ["Net 7", "Net 7"], ["Net 14", "Net 14"], ["Net 30", "Net 30"], ["Net 60", "Net 60"]]) + fld("edDue", L("Tarikh akhir", "Due date"), d.due || "", "date") + '</div>';
  if(d.type === "QT") h += fld("edVal", L("Sah hingga", "Valid until"), d.valid || "", "date");
  if(d.type === "PF") h += fld("edPfd", L("Bayar sebelum", "Pay by"), d.due || "", "date");
  if(d.type === "PO") h += fld("edDlv", L("Tarikh hantar", "Delivery date"), d.deliv || "", "date");
  if(d.type === "CN" || d.type === "DN"){ var fi = d.from && N.byId(D.docs, d.from); h += '<div class="mut small">' + L("Untuk invois ", "For invoice ") + '<b>' + E(fi ? fi.no : "—") + '</b></div>' + fld("edRs", L("Sebab", "Reason"), d.reason || "", "text", ' placeholder="' + (d.type === "CN" ? L("cth. barang dipulangkan, diskaun selepas jualan", "e.g. goods returned, discount after sale") : L("cth. caj tambahan, kurang caj", "e.g. extra charge, undercharged")) + '"'); }
  h += fld("edRef", L("Rujukan (PO pelanggan, projek)", "Reference (customer PO, project)"), d.ref || "");
  if(d.type !== "DO" && !(d.type === "CN" || d.type === "DN" || d.type === "OR")){ var bc = p.base || "MYR", dc = d.cur || bc;
    h += '<div class="f2">' + sel("edCur", L("Mata wang", "Currency"), dc, N.CURS.map(function(c){ return [c[0], c[1] + " · " + c[0]]; })) + (dc !== bc ? fld("edRate", "1 " + dc + " = " + bc, d.rate || fxGuess(dc, bc), "text", ' inputmode="decimal"') : '<span></span>') + '</div>'; }
  h += '</div>';
  // 2 customer
  h += '<div class="card ngEdC"><div class="snl">👤 ' + (d.type === "OR" ? L("Diterima daripada", "Received from") : d.type === "PO" ? L("Pembekal", "Supplier") : d.type === "PV" ? L("Dibayar kepada", "Paid to") : L("Pelanggan", "Customer")) + '</div>';
  if(c.name || c.co){ h += '<div class="ngCust"><div><b>' + E(c.name || c.co) + '</b><small>' + E([c.co && c.name ? c.co : "", c.phone, c.email].filter(Boolean).join(" · ")) + '</small><small>' + E((c.addr || "").replace(/\n/g, ", ")) + '</small></div><button class="chip" id="edCE">✎</button><button class="chip" id="edCX">✕</button></div>';
    var lastD = N.live(D.docs).filter(function(x){ return x.id !== d.id && x.pid === p.id && x.type === d.type && x.status !== "draft" && ((d.custId && x.custId === d.custId) || ((x.cust || {}).name === c.name)); }).sort(function(a, b){ return b.date.localeCompare(a.date); })[0];
    if(lastD && d.type !== "OR" && !(d.lines || []).some(function(l){ return l.desc; })) h += '<button class="btn alt full g3d" id="edRep" data-rep="' + lastD.id + '">↺ ' + L("Ulang yang lepas (", "Repeat the last one (") + E(lastD.no) + ')</button>'; }
  else { h += '<input id="edCq" type="search" placeholder="🔍 ' + L("Cari pelanggan atau taip nama baru", "Find a customer or type a new name") + '"><div id="edCl" class="ngCl"></div><div class="btns"><button class="btn alt g3d" id="edCN">＋ ' + L("Pelanggan baru", "New customer") + '</button>' + (window.Native && H.N.pickContact ? '<button class="btn alt g3d" id="edCK">📇 ' + L("Dari kenalan", "From contacts") + '</button>' : '') + '</div>'; }
  h += '</div>';
  // 3 lines / receipt body
  if(d.type === "OR") h += receiptEd(d, p);
  else if(d.type === "PV") h += pvEd(d, p);
  else { h += '<div class="card ngEdC"><div class="snl">📦 ' + (d.type === "DO" ? L("Barang dihantar", "Items delivered") : L("Perkara", "Items")) + '</div><div id="edLines">' + (d.lines || []).map(function(l, i){ return lineHtml(d, l, i, sst); }).join("") + '</div>';
    var fav = N.live(D.items).filter(function(x){ return x.pid === p.id && x.fav; }).slice(0, 12);
    if(fav.length) h += '<div class="chips ngFav">' + fav.map(function(x){ return '<button class="chip" data-fav="' + x.id + '">⭐ ' + E(x.name) + '</button>'; }).join("") + '</div>';
    if(d.type !== "DO" && window.AIRun) h += '<div class="ngAIrow"><button class="btn alt g3d" id="edAI">✨ ' + L("Isi dari chat WhatsApp", "Fill from a WhatsApp chat") + '</button>' + AIRun.btn("niaga") + '</div>';
    h += '<div class="btns"><button class="btn alt g3d" id="edAL">＋ ' + L("Baris", "Line") + '</button><button class="btn alt g3d" id="edAH">＋ ' + L("Tajuk seksyen", "Section header") + '</button>' + (N.live(D.items).some(function(x){ return x.pid === p.id; }) ? '<button class="btn alt g3d" id="edAC">📦 ' + L("Dari katalog", "From catalogue") + '</button>' : '') + '</div>' +
      '<datalist id="ngUnits">' + N.UNITS.map(function(u){ return '<option value="' + u + '">'; }).join("") + '</datalist><datalist id="ngItems">' + N.live(D.items).filter(function(x){ return x.pid === p.id; }).map(function(x){ return '<option value="' + E(x.name) + '">'; }).join("") + '</datalist></div>';
    // 4 discount etc.
    if(d.type === "DO") h += '<div class="card ngEdC">' + tog("edHP", L("Sembunyikan harga", "Hide prices"), d.hidePrice !== false) + fld("edShip", L("Hantar ke (alamat lain)", "Ship to (another address)"), d.ship || "") + '</div>';
    else { h += '<div class="card ngEdC"><div class="snl">➖ ' + L("Diskaun, penghantaran, bundar", "Discount, shipping, rounding") + '</div><div class="ngDisc">' + fld("edDs", L("Diskaun dokumen", "Document discount"), d.disc || "", "text", ' inputmode="decimal" data-calc="1"') + '<span class="seg" id="edDsT"><button class="' + (d.discT !== "%" ? "on" : "") + '" data-dt="rm">' + cur(p) + '</button><button class="' + (d.discT === "%" ? "on" : "") + '" data-dt="%">%</button></span></div>' +
        '<div class="f2">' + fld("edSh", L("Penghantaran", "Shipping"), d.ship || "", "text", ' inputmode="decimal" data-calc="1"') + fld("edOt", L("Caj lain", "Other charges"), d.other || "", "text", ' inputmode="decimal" data-calc="1"') + '</div>' +
        tog("edRd", L("Bundar 5 sen", "5-sen rounding"), !!d.round);
      if(d.type === "CS") h += '<div class="f2">' + sel("edMt", L("Bayaran", "Paid by"), d.method || "cash", N.METHODS.map(function(m){ return [m[0], L(m[1], m[2])]; })) + fld("edTd", L("Tunai diberi (untuk baki)", "Cash given (for change)"), d.tend || "", "text", ' inputmode="decimal" data-calc="1"') + '</div>';
      h += '</div>'; } }
  // 5 notes & terms, 6 signature & look
  var sigs = staff() ? mySigs() : (p.sigs || []).concat(mySigs());
  h += '<div class="card ngEdC"><details' + (d.notes || d.terms ? " open" : "") + '><summary class="snl">📃 ' + L("Nota & terma", "Notes & terms") + '</summary>' + area("edNt", L("Nota kepada pelanggan", "Note to customer"), d.notes, 2) + area("edTm", L("Terma & syarat", "Terms & conditions"), d.terms, 3) + '</details></div>' +
    '<div class="card ngEdC"><details><summary class="snl">✍️ ' + L("Tandatangan, cop & rupa", "Signature, stamp & look") + '</summary>' +
    sel("edSg", L("Penandatangan", "Signatory"), d.sig || "none", sigs.map(function(s){ return [s.id, (s.name || "—") + (s.title ? " · " + s.title : "")]; }).concat([["none", L("Tidak perlu tandatangan (dijana komputer)", "No signature (computer-generated)")]])) +
    (p.stamp ? tog("edSt", L("Letak cop", "Add the stamp"), !!d.stamp) : '') +
    '<div class="f2">' + sel("edDe", L("Reka bentuk", "Design"), d.design || "", [["", L("Ikut profil", "Profile default")]].concat(TP.DESIGNS.map(function(x){ return [x[0], L(x[1], x[2])]; }))) + sel("edLg", L("Bahasa", "Language"), d.lang || "", [["", L("Ikut profil", "Profile default")], ["both", "BM + EN"], ["bm", "BM"], ["en", "EN"]]) + '</div>' +
    (!sigs.length && !staff() ? '<button class="btn alt full g3d" id="edSigAdd">＋ ' + L("Tambah tandatangan di Profil", "Add a signature in Profile") + '</button>' : '') + '</details></div>';
  h += '<div class="ngBar"><div><small>' + L("Jumlah", "Total") + '</small><b id="edTot"></b></div><button class="btn alt g3d" id="edSave">' + L("Simpan draf", "Save draft") + '</button><button class="btn gold g3d" id="edIss">✓ ' + L("Siap & Kongsi", "Done & share") + '</button></div>';
  el.innerHTML = '<div class="ngEd">' + h + '</div>';
  edBind(el.querySelector(".ngEd"), d, p); barPin(); }   // 0.6.29: listeners on the fresh editor node (the page root is reused, so binding there piled up stale handlers)
// 0.6.26 (owner): the Total · Save draft · Done & share bar sits right on top of the middle notch, no gap under it
var barT = null;
function barPin(){ clearInterval(barT); var place = function(){ var b = root && root.querySelector(".ngBar"); if(!b || !document.body.contains(b)){ clearInterval(barT); return; }
    var n = document.getElementById("notch"), bot = 6; if(n && !n.classList.contains("hidden") && !n.classList.contains("none") && n.getClientRects().length){ var r = n.getBoundingClientRect(); bot = Math.max(0, window.innerHeight - r.top); }
    if(b.style.bottom !== bot + "px") b.style.bottom = bot + "px"; var ed = root.querySelector(".ngEd"); if(ed) ed.style.paddingBottom = (b.offsetHeight + 14) + "px"; };
  place(); barT = setInterval(place, 300); }
function lineHtml(d, l, i, sst){ var mv = '<span class="ngLnM"><button class="ib" data-lm="' + i + '|-1">↑</button><button class="ib" data-lm="' + i + '|1">↓</button><button class="ib" data-lx="' + i + '">✕</button></span>';
  if(l.t === "head") return '<div class="ngLn hd" data-li="' + i + '"><input data-lf="desc" value="' + E(l.desc) + '" placeholder="' + L("Tajuk seksyen (cth. Bahan, Upah)", "Section header (e.g. Materials, Labour)") + '">' + mv + '</div>';
  var hide = d.type === "DO";
  return '<div class="ngLn" data-li="' + i + '"><div class="ngLnT"><span class="ngLnN">' + (i + 1) + '</span><textarea data-lf="desc" rows="1" list="ngItems" placeholder="' + L("Perkara / keterangan", "Item / description") + '">' + E(l.desc) + '</textarea>' + mv + '</div>' +
    '<div class="ngLnR"><label>' + L("Kuantiti", "Qty") + '<input data-lf="qty" inputmode="decimal" data-calc="1" value="' + E(l.qty) + '"></label><label>' + L("Unit", "Unit") + '<input data-lf="unit" list="ngUnits" value="' + E(l.unit || "") + '"></label>' +
    (hide ? '' : '<label>' + L("Harga", "Price") + '<input data-lf="price" inputmode="decimal" data-calc="1" value="' + E(l.price) + '"></label><b class="ngLnA" data-la="' + i + '"></b>') + '</div>' +
    (hide ? '' : '<div class="ngLnX"><label>' + L("Diskaun", "Disc.") + '<input data-lf="disc" inputmode="decimal" data-calc="1" value="' + E(l.disc || "") + '"></label><span class="seg"><button class="' + (l.discT !== "%" ? "on" : "") + '" data-ldt="' + i + '|rm">RM</button><button class="' + (l.discT === "%" ? "on" : "") + '" data-ldt="' + i + '|%">%</button></span>' +
      (sst ? '<label>' + L("Cukai", "Tax") + '<select data-lf="tax">' + N.TAXES.map(function(t){ return '<option value="' + t[0] + '"' + (N.num(l.tax) === t[0] ? " selected" : "") + '>' + (t[0] ? t[0] + "%" : L("Tiada", "None")) + '</option>'; }).join("") + '</select></label>' : '') + '</div>') + '</div>'; }
function fxGuess(a, b){ try{ var F = H.load("ihsan_fx", {}) || {}, c = F.cache || {}, x = c[a + "/" + b] || c[a + b]; if(x && x.r) return Math.round(x.r * 10000) / 10000; var y = c[b + "/" + a]; if(y && y.r) return Math.round(10000 / y.r) / 10000; }catch(e){} return ""; }
function pvEd(d, p){ var C2 = window.NiagaExp ? NiagaExp.CATS : [["lain", "•", "Lain-lain", "Others"]];
  return '<div class="card ngEdC"><div class="snl">💸 ' + L("Bayaran keluar", "Money paid out") + '</div><div class="f2">' + fld("pvA", L("Amaun", "Amount"), d.amt || "", "text", ' inputmode="decimal" data-calc="1"') + fld("pvD", L("Tarikh bayar", "Payment date"), d.pdate || d.date, "date") + '</div>' +
    '<div class="f2">' + sel("pvM", L("Kaedah", "Method"), d.method || "bank", N.METHODS.map(function(m){ return [m[0], L(m[1], m[2])]; })) + fld("pvR", L("Rujukan / no. cek", "Reference / cheque no."), d.pref || "") + '</div>' +
    fld("pvP", L("Tujuan bayaran", "Purpose of payment"), d.purpose || "", "text", ' placeholder="' + L("cth. upah tukang, sewa khemah", "e.g. contractor wages, tent rental") + '"') +
    sel("pvC", L("Kategori belanja", "Expense category"), d.cat || "lain", C2.map(function(c){ return [c[0], c[1] + " " + L(c[2], c[3])]; })) + '<div class="mut tiny">' + L("Bila dikeluarkan, ia juga direkod dalam 💸 Belanja.", "When issued it is also recorded in 💸 Expenses.") + '</div></div>'; }
function receiptEd(d, p){ var c = d.cust || {}, open = N.live(D.docs).filter(function(x){ if(x.pid !== p.id || x.status === "draft" || x.status === "void") return false; if(!((d.custId && x.custId === d.custId) || (c.name && (x.cust || {}).name === c.name))) return false;
    if(x.type === "INV") return N.totals(D, x, p).bal > 0 || (d.apply || []).some(function(a){ return a.doc === x.id; }); return x.type === "QT" && N.status(D, x) !== "rejected"; });
  var h = '<div class="card ngEdC"><div class="snl">💵 ' + L("Bayaran", "Payment") + '</div><div class="f2">' + fld("orA", L("Amaun diterima", "Amount received"), d.amt || "", "text", ' inputmode="decimal" data-calc="1"') + fld("orD", L("Tarikh bayar", "Payment date"), d.pdate || d.date, "date") + '</div>' +
    '<div class="f2">' + sel("orM", L("Kaedah", "Method"), d.method || "bank", N.METHODS.map(function(m){ return [m[0], L(m[1], m[2])]; })) + fld("orR", L("Rujukan / ID transaksi", "Reference / transaction ID"), d.pref || "") + '</div>' + (d.method === "cheque" ? fld("orC", L("No. cek & bank", "Cheque no. & bank"), d.chq || "") : '');
  if(open.length){ h += '<div class="snl">' + L("Untuk dokumen", "For documents") + ' <button class="chip" id="orAuto">⚡ ' + L("Agih automatik", "Auto-allocate") + '</button></div>';
    open.forEach(function(x){ var T = N.totals(D, x, p), a = (d.apply || []).filter(function(y){ return y.doc === x.id; })[0]; h += '<div class="ngAp"><span><b>' + E(x.no) + '</b><small>' + tname(x.type) + ' · ' + L("baki ", "balance ") + money(x.type === "QT" ? T.total - T.paid : T.bal, p) + '</small></span><input data-ap="' + x.id + '" data-bal="' + N.rm(x.type === "QT" ? T.total - T.paid : T.bal) + '" inputmode="decimal" placeholder="0.00" value="' + E(a ? a.amt : "") + '"></div>'; }); }
  else h += fld("orF", L("Bayaran untuk", "Being payment for"), d.payFor || "", "text", ' placeholder="' + L("cth. Tempahan kek 12 Dis", "e.g. Cake order 12 Dec") + '"');
  return h + '</div>'; }
function edRead(el, d, p){ var g = function(id){ return gv(el, id); };
  if(el.querySelector("#edNo")) d.noMan = g("edNo").trim(); if(el.querySelector("#edDt")) d.date = g("edDt") || N.ymd();
  if(el.querySelector("#edDue")){ d.due = g("edDue"); d.pterm = g("edTerm"); } if(el.querySelector("#edVal")) d.valid = g("edVal");
  if(el.querySelector("#edRef")) d.ref = g("edRef");
  if(el.querySelector("#edPfd")) d.due = g("edPfd"); if(el.querySelector("#edDlv")) d.deliv = g("edDlv"); if(el.querySelector("#edRs")) d.reason = g("edRs");
  if(el.querySelector("#edCur")){ var cc = g("edCur"); if(cc === (p.base || "MYR")){ delete d.cur; delete d.rate; } else { d.cur = cc; if(el.querySelector("#edRate")) d.rate = N.num(g("edRate")) || ""; } }
  if(el.querySelector("#pvA")){ d.amt = g("pvA"); d.pdate = g("pvD"); d.date = d.pdate || d.date; d.method = g("pvM"); d.pref = g("pvR"); d.purpose = g("pvP"); d.cat = g("pvC"); }
  el.querySelectorAll("[data-li]").forEach(function(r){ var l = d.lines[+r.getAttribute("data-li")]; if(!l) return; r.querySelectorAll("[data-lf]").forEach(function(f){ var k = f.getAttribute("data-lf"); l[k] = f.value; }); });
  if(el.querySelector("#edDs")){ d.disc = g("edDs"); d.ship = g("edSh"); d.other = g("edOt"); d.round = !!g("edRd"); }
  if(el.querySelector("#edHP")){ d.hidePrice = !!g("edHP"); d.ship = g("edShip"); }
  if(el.querySelector("#edMt")){ d.method = g("edMt"); d.tend = g("edTd"); }
  if(el.querySelector("#orA")){ d.amt = g("orA"); d.pdate = g("orD"); d.date = d.pdate || d.date; d.method = g("orM"); d.pref = g("orR"); if(el.querySelector("#orC")) d.chq = g("orC"); if(el.querySelector("#orF")) d.payFor = g("orF");
    var ap = []; el.querySelectorAll("[data-ap]").forEach(function(i){ if(N.num(i.value) > 0) ap.push({doc:i.getAttribute("data-ap"), amt:N.num(i.value)}); }); if(el.querySelector("[data-ap]")) d.apply = ap;
    var qt = ap.map(function(a){ return N.byId(D.docs, a.doc); }).filter(function(x){ return x && x.type === "QT"; }); d.dep = qt.length > 0; }
  d.notes = g("edNt"); d.terms = g("edTm"); if(el.querySelector("#edSg")) d.sig = g("edSg"); if(el.querySelector("#edSt")) d.stamp = !!g("edSt"); d.design = g("edDe"); d.lang = g("edLg"); }
function edTotals(el, d, p){ var T = N.totals(D, d, p), t = el.querySelector("#edTot");
  if(d.type === "OR"){ var a = (d.apply || []).reduce(function(s, x){ return s + N.sen(x.amt); }, 0), amt = N.sen(d.amt); if(t) t.textContent = dm(amt || a, d, p); var w = el.querySelector("#orA"); if(w && a && amt && a !== amt) w.classList.add("warn"); else if(w) w.classList.remove("warn"); return; }
  if(d.type === "PV"){ if(t) t.textContent = dm(N.sen(d.amt), d, p); return; }
  if(t) t.textContent = d.type === "DO" ? (d.lines || []).filter(function(l){ return l.t !== "head"; }).length + " " + L("perkara", "items") : dm(T.total, d, p);
  el.querySelectorAll("[data-la]").forEach(function(b){ var l = d.lines[+b.getAttribute("data-la")]; b.textContent = l ? N.fmt(N.lineAmt(l), "") : ""; }); }
function edBind(el, d, p){ var save = function(){ N.stamp(D, d); N.cache(D, d, p); sv(); };
  var rerender = function(){ edRead(el, d, p); save(); draw(); };
  var t = null; el.addEventListener("input", function(e){ if(e.target.closest("#edCq")) return; edRead(el, d, p); edTotals(el, d, p); clearTimeout(t); t = setTimeout(save, 400); });
  el.addEventListener("change", function(e){ var f = e.target; edRead(el, d, p);
    if(f.getAttribute && f.getAttribute("data-lf") === "desc"){ var r = f.closest("[data-li]"), l = d.lines[+r.getAttribute("data-li")], it = N.live(D.items).filter(function(x){ return x.pid === p.id && x.name === f.value; })[0];
      if(it && l){ l.price = it.price; l.unit = it.unit || l.unit; if(it.desc) l.desc = it.name + "\n" + it.desc; if(it.tax != null && p.tax && p.tax.sst) l.tax = it.tax; save(); draw(); return; } }
    if(f.id === "edDt" || f.id === "edTerm"){ var m = /Net (\d+)/.exec(d.pterm || ""); if(d.type === "INV" && f.id === "edTerm" && m){ d.due = N.addDays(d.date, +m[1]); var du = el.querySelector("#edDue"); if(du) du.value = d.due; } }
    if(f.id === "orM" || f.id === "edCur"){ save(); draw(); return; }
    edTotals(el, d, p); save(); });
  calcBind(el); edTotals(el, d, p);
  el.querySelectorAll("textarea[data-lf]").forEach(function(a){ var fit = function(){ a.style.height = "auto"; a.style.height = Math.min(160, a.scrollHeight) + "px"; }; a.addEventListener("input", fit); setTimeout(fit, 0); });
  var on = function(id, fn){ var x = el.querySelector(id); if(x) x.onclick = fn; };
  on("#edBk", function(){ edRead(el, d, p); save(); ST.ed = null; ST.vw = isEmpty(d) ? null : d.id; if(isEmpty(d)){ d.del = true; unlink(d); save(); } goTop(); draw(); });
  on("#edPv", function(){ edRead(el, d, p); save(); var ov = H.showSheet("👁 " + L("Pratonton", "Preview"), '<div id="pvB" class="ngPv"></div>'); preview(ov.querySelector("#pvB"), d, p); });
  on("#edSave", function(){ edRead(el, d, p); save(); H.toast("💾 " + L("Draf disimpan", "Draft saved")); ST.ed = null; ST.vw = d.id; goTop(); draw(); });
  on("#edIss", function(){ edRead(el, d, p); save(); issue(d, p); });
  on("#edAL", function(){ edRead(el, d, p); d.lines.push({t:"item", desc:"", qty:1, unit:"pcs", price:"", tax:p.tax && p.tax.sst ? p.tax.rate : 0}); save(); draw(); setTimeout(function(){ var a = root.querySelectorAll("textarea[data-lf=desc]"); if(a.length) a[a.length - 1].focus(); }, 60); });
  on("#edAI", function(){ edRead(el, d, p); save(); chatFill(d, p); });
  on("#edAH", function(){ edRead(el, d, p); d.lines.push({t:"head", desc:""}); save(); draw(); });
  on("#edAC", function(){ edRead(el, d, p); save(); catalogPick(p, function(it){ d.lines.push(itemLine(it, p)); save(); draw(); }); });
  on("#edSigAdd", function(){ edRead(el, d, p); save(); ST.ed = null; ST.pg = "prof"; draw(); setTimeout(function(){ editSec("sig"); }, 100); });
  on("#edRep", function(){ var src = N.byId(D.docs, el.querySelector("#edRep").getAttribute("data-rep")); if(!src) return; d.lines = N.clone(src.lines || []); ["disc","discT","ship","other","notes","terms","pterm"].forEach(function(k){ if(src[k] != null) d[k] = N.clone(src[k]); }); save(); draw(); });
  el.querySelectorAll("[data-fav]").forEach(function(b){ b.onclick = function(){ edRead(el, d, p); var it = N.byId(D.items, b.getAttribute("data-fav")); if(!it) return; var ex = d.lines.filter(function(l){ return l.item === it.id; })[0];
    if(ex) ex.qty = N.num(ex.qty) + 1; else { var e0 = d.lines.length === 1 && !d.lines[0].desc && !N.num(d.lines[0].price); if(e0) d.lines = []; d.lines.push(itemLine(it, p)); } vib(); save(); draw(); }; });
  el.querySelectorAll("[data-lm]").forEach(function(b){ b.onclick = function(){ edRead(el, d, p); var q = b.getAttribute("data-lm").split("|"), i = +q[0], j = i + (+q[1]); if(j < 0 || j >= d.lines.length) return; var x = d.lines[i]; d.lines[i] = d.lines[j]; d.lines[j] = x; save(); draw(); }; });
  el.querySelectorAll("[data-lx]").forEach(function(b){ b.onclick = function(){ edRead(el, d, p); d.lines.splice(+b.getAttribute("data-lx"), 1); save(); draw(); }; });
  el.querySelectorAll("[data-ldt]").forEach(function(b){ b.onclick = function(){ edRead(el, d, p); var q = b.getAttribute("data-ldt").split("|"); d.lines[+q[0]].discT = q[1]; save(); draw(); }; });
  el.querySelectorAll("[data-dt]").forEach(function(b){ b.onclick = function(){ edRead(el, d, p); d.discT = b.getAttribute("data-dt"); save(); draw(); }; });
  on("#orAuto", function(){ edRead(el, d, p); var left = N.sen(d.amt); el.querySelectorAll("[data-ap]").forEach(function(i){ var b = N.sen(i.getAttribute("data-bal")), a = Math.min(b, Math.max(0, left)); i.value = a ? N.rm(a).toFixed(2) : ""; left -= a; }); edRead(el, d, p); if(!N.sen(d.amt)){ d.amt = N.rm(d.apply.reduce(function(s, x){ return s + N.sen(x.amt); }, 0)).toFixed(2); } save(); draw(); });
  // customer
  on("#edCE", function(){ edRead(el, d, p); custForm(d.cust, function(c){ d.cust = snap(c); save(); draw(); }, true); });
  on("#edCX", function(){ edRead(el, d, p); d.cust = {}; d.custId = ""; save(); draw(); });
  on("#edCN", function(){ edRead(el, d, p); custForm({name:gv(el, "edCq")}, function(c){ c = saveCust(c, p); d.cust = snap(c); d.custId = c.id; save(); draw(); }); });
  on("#edCK", function(){ edRead(el, d, p); contact(function(n, tel){ var c = saveCust({name:n, phone:tel}, p); d.cust = snap(c); d.custId = c.id; save(); draw(); }); });
  var cq = el.querySelector("#edCq"); if(cq){ var paint = function(){ var q = cq.value.toLowerCase().trim(), L0 = N.live(D.customers).filter(function(c){ return c.pid === p.id && (!q || [c.name, c.co, c.phone].join(" ").toLowerCase().indexOf(q) >= 0); }).slice(0, 8);
      el.querySelector("#edCl").innerHTML = L0.map(function(c){ return '<button class="ngRow" data-pc="' + c.id + '"><i>👤</i><span><b>' + E(c.name) + '</b><small>' + E([c.co, c.phone].filter(Boolean).join(" · ")) + '</small></span></button>'; }).join("") + (q && !L0.some(function(c){ return c.name.toLowerCase() === q; }) ? '<button class="ngRow" data-pcn="1"><i>＋</i><span><b>' + L("Guna \"", "Use \"") + E(cq.value.trim()) + '"</b><small>' + L("pelanggan baru", "new customer") + '</small></span></button>' : '');
      el.querySelectorAll("[data-pc]").forEach(function(b){ b.onclick = function(){ var c = N.byId(D.customers, b.getAttribute("data-pc")); d.cust = snap(c); d.custId = c.id; save(); draw(); }; });
      var nb = el.querySelector("[data-pcn]"); if(nb) nb.onclick = function(){ d.cust = {name:cq.value.trim()}; d.custId = ""; save(); draw(); }; };
    cq.oninput = paint; paint(); } }
function isEmpty(d){ return !(d.cust && d.cust.name) && !(d.lines || []).some(function(l){ return l.desc || N.num(l.price); }) && !N.num(d.amt); }
function itemLine(it, p){ return {t:"item", item:it.id, desc:it.name + (it.desc ? "\n" + it.desc : ""), qty:1, unit:it.unit || "pcs", price:it.price, tax:p.tax && p.tax.sst ? (it.tax != null ? it.tax : p.tax.rate) : 0}; }
function catalogPick(p, cb){ var list = N.live(D.items).filter(function(x){ return x.pid === p.id; });
  var ov = H.showSheet("📦 " + L("Katalog", "Catalogue"), '<input id="cpQ" type="search" placeholder="🔍"><div id="cpL"></div>');
  var paint = function(){ var q = gv(ov, "cpQ").toLowerCase(); ov.querySelector("#cpL").innerHTML = list.filter(function(x){ return !q || (x.name + " " + (x.sku || "") + " " + (x.cat || "")).toLowerCase().indexOf(q) >= 0; }).map(function(x){ return '<button class="ngRow" data-cp="' + x.id + '"><i>' + (x.fav ? "⭐" : "📦") + '</i><span><b>' + E(x.name) + '</b><small>' + money(N.sen(x.price), p) + ' / ' + E(x.unit || "") + '</small></span></button>'; }).join("");
    ov.querySelectorAll("[data-cp]").forEach(function(b){ b.onclick = function(){ H.closeOverlay(); cb(N.byId(D.items, b.getAttribute("data-cp"))); }; }); };
  ov.querySelector("#cpQ").oninput = paint; paint(); }
function issue(d, p){ var T = N.totals(D, d, p), warn = [], c = d.cust || {};
  if(!(c.name || c.co) && d.type !== "CS"){ H.toast(d.type === "PO" ? L("Isi nama pembekal", "Enter the supplier name") : d.type === "PV" ? L("Isi nama penerima bayaran", "Enter who was paid") : L("Isi nama pelanggan", "Enter the customer name")); return; }
  if(d.type === "PV" && !(N.sen(d.amt) > 0)){ H.toast(L("Masukkan amaun", "Enter the amount")); return; }
  if(d.cur && d.cur !== (p.base || "MYR") && !(N.num(d.rate) > 0)){ H.toast(L("Masukkan kadar tukaran", "Enter the exchange rate")); return; }
  if(d.type === "PV"){} else if(d.type === "OR"){ var ap = (d.apply || []).reduce(function(s, x){ return s + N.sen(x.amt); }, 0); if(!N.sen(d.amt) && ap) d.amt = N.rm(ap); if(!(N.sen(d.amt) > 0)){ H.toast(L("Masukkan amaun diterima", "Enter the amount received")); return; } if(ap && ap !== N.sen(d.amt)) warn.push(L("Jumlah agihan tidak sama dengan amaun diterima.", "The allocation does not equal the amount received.")); }
  else { if(!(d.lines || []).some(function(l){ return l.t !== "head" && l.desc; })){ H.toast(L("Tambah sekurang-kurangnya satu perkara", "Add at least one item")); return; }
    if(d.type !== "DO" && !(T.total > 0)){ H.toast(L("Jumlah mesti lebih daripada 0", "The total must be more than 0")); return; } }
  if(staff() && d.type !== "OR" && d.type !== "DO" && d.type !== "PV" && d.type !== "PO"){ var mx = p.perms && p.perms.staffDiscMax != null ? +p.perms.staffDiscMax : 10, pc = discPct(d, p);
    if(pc > mx && !(d.discOk >= pc)){ d.discReq = {pct:pc, at:N.iso(), dev:D.dev.id}; N.stamp(D, d); N.log(D, d.id, "dreq"); sv(); H.toast("⏳ " + L("Diskaun ", "Discount ") + pc + L("% melebihi had ", "% is over the limit of ") + mx + L("%. Dihantar kepada pemilik untuk kelulusan.", "%. Sent to the owner for approval.")); ST.ed = null; ST.vw = d.id; goTop(); draw(); return; } }
  var no = d.noMan ? d.noMan.trim() : ""; if(no && N.usedNo(D, p.id, d.type, no, d.id)){ H.toast(L("Nombor ini sudah digunakan", "This number is already used")); return; }
  if(!p.regNo && !p.licence && !N.TYPES[d.type].buy) warn.push(L("Tiada no. SSM atau lesen dalam profil.", "No SSM no. or licence in the profile."));
  if(d.type === "INV" && !(p.bank || []).some(function(b){ return b.accNo; }) && !p.qr) warn.push(L("Tiada akaun bank untuk bayaran.", "No bank account for payment."));
  if(d.type === "INV" && d.due && d.due < d.date) warn.push(L("Tarikh akhir sebelum tarikh invois.", "The due date is before the invoice date."));
  if(warn.length && !confirm("⚠️ " + warn.join("\n") + "\n\n" + L("Teruskan juga?", "Continue anyway?"))) return;
  d.no = no || N.takeNo(D, p, d.type, d.date); d.status = "sent"; delete d.noMan; if(d.type === "CN" || d.type === "DN") d.status = "sent";
  if(!d.custId && c.name && d.type !== "CS" && !N.TYPES[d.type].buy){ var nc = saveCust(c, p); d.custId = nc.id; }
  if(d.type === "PV" && window.NiagaExp){ var ex = {id:N.rid(), pid:p.id, mk:D.dev.id, date:d.pdate || d.date, cat:d.cat || "lain", vendor:c.name || "", amt:N.rm(Math.round(N.sen(d.amt) * N.rate(d, p))), method:d.method === "cash" ? "cash" : d.method === "card" ? "card" : d.method === "ewallet" ? "ewallet" : "bank", ref:d.no || "", note:d.purpose || "", pvId:d.id, created:N.iso()}; N.stamp(D, ex); D.expenses.push(ex); d.expId = ex.id; }
  N.stamp(D, d); N.cache(D, d, p); N.log(D, d.id, "issue");
  if(d.from){ var f = N.byId(D.docs, d.from); if(f && (f.type === "QT" || f.type === "PF") && f.status === "sent"){ f.status = "accepted"; N.stamp(D, f); } if(f && f.type === "INV" && (d.type === "CN" || d.type === "DN")){ N.cache(D, f, p); N.stamp(D, f); remind(f); } }
  sv(); remind(d); (d.apply || []).forEach(function(a){ var x = N.byId(D.docs, a.doc); if(x) remind(x); }); vib();
  ST.ed = null; ST.vw = d.id; goTop(); draw(); setTimeout(function(){ share(d); }, 250); }

// ---------- customers ----------
function saveCust(c, p){ var ex = c.id ? N.byId(D.customers, c.id) : N.live(D.customers).filter(function(x){ return x.pid === p.id && x.name.toLowerCase() === String(c.name || "").toLowerCase(); })[0];
  if(ex){ ["name","co","regNo","tin","addr","phone","email","att","note"].forEach(function(k){ if(c[k] != null && c[k] !== "") ex[k] = c[k]; }); N.stamp(D, ex); return ex; }
  var n = {id:N.rid(), pid:p.id, name:c.name || "", co:c.co || "", regNo:c.regNo || "", tin:c.tin || "", addr:c.addr || "", phone:c.phone || "", email:c.email || "", att:c.att || "", tags:"", note:c.note || "", created:N.iso()}; N.stamp(D, n); D.customers.push(n); return n; }
function custForm(c, done, snapOnly){ c = c || {};
  var ov = H.showSheet("👤 " + L("Pelanggan", "Customer"), fld("cfN", L("Nama *", "Name *"), c.name) + fld("cfCo", L("Syarikat (pilihan)", "Company (optional)"), c.co) + '<div class="f2">' + fld("cfPh", L("Telefon", "Phone"), c.phone, "tel") + fld("cfEm", "E-mel", c.email, "email") + '</div>' +
    area("cfA", L("Alamat", "Address"), c.addr, 3) + '<div class="f2">' + fld("cfR", L("No. pendaftaran", "Reg. no."), c.regNo) + fld("cfT", "TIN", c.tin) + '</div>' + fld("cfAt", L("U.p. (orang dihubungi)", "Attention (contact person)"), c.att) + (snapOnly ? '' : area("cfNo", L("Nota dalaman", "Internal note"), c.note, 2)) +
    '<button class="btn gold full g3d" id="cfOk" style="margin-top:10px">✓ ' + L("Simpan", "Save") + '</button>');
  ov.querySelector("#cfOk").onclick = function(){ var g = function(i){ return gv(ov, i).trim(); }; var o = {id:c.id, name:g("cfN"), co:g("cfCo"), phone:g("cfPh"), email:g("cfEm"), addr:gv(ov, "cfA").trim(), regNo:g("cfR"), tin:g("cfT"), att:g("cfAt"), note:snapOnly ? c.note : gv(ov, "cfNo")};
    if(!o.name && !o.co){ H.toast(L("Isi nama", "Enter a name")); return; } if(!o.name) o.name = o.co; H.closeOverlay(); done(o); }; }
function contact(cb){ if(!(window.Native && H.N.pickContact)){ H.toast(L("Kenalan hanya dalam aplikasi telefon", "Contacts work in the phone app only")); return; }
  var hl = function(r){ H.off("contact", hl); if(r && !r.cancel && !r.error && (r.n || r.tel)) cb(r.n || r.tel, r.tel || ""); }; H.on("contact", hl); H.N.pickContact(); }
function custStats(c, p){ var docs = N.live(D.docs).filter(function(x){ return x.pid === p.id && x.status !== "draft" && x.status !== "void" && (x.custId === c.id || (!x.custId && (x.cust || {}).name === c.name)); }), S = {billed:0, paid:0, bal:0, days:[], docs:docs};
  docs.forEach(function(x){ var T = N.totals(D, x, p); if(x.type === "INV" || x.type === "CS"){ S.billed += T.total; S.bal += T.bal; } if(x.type === "OR" || x.type === "CS") S.paid += T.total;
    if(x.type === "INV" && T.total && !T.bal && T.pays && T.pays.length){ var last = T.pays.map(function(y){ return y.r.pdate || y.r.date; }).sort().pop(); S.days.push(Math.max(0, N.daysBetween(x.date, last))); } });
  S.avg = S.days.length ? Math.round(S.days.reduce(function(a, b){ return a + b; }, 0) / S.days.length) : null; return S; }
function vCusts(el){ var p = prof(), q = (ST.cq || "").toLowerCase(), list = N.live(D.customers).filter(function(c){ return c.pid === p.id && (!q || [c.name, c.co, c.phone, c.email].join(" ").toLowerCase().indexOf(q) >= 0); }).sort(function(a, b){ return a.name.localeCompare(b.name); });
  var h = '<div class="ngSearch"><input id="ngCQ" type="search" placeholder="🔍 ' + L("Cari pelanggan", "Search customers") + '" value="' + E(ST.cq || "") + '"></div><div class="btns"><button class="btn gold g3d" id="cuAdd">＋ ' + L("Pelanggan", "Customer") + '</button>' + (window.Native && H.N.pickContact ? '<button class="btn alt g3d" id="cuK">📇 ' + L("Kenalan", "Contacts") + '</button>' : '') + '<button class="btn alt g3d" id="cuCsv">📥 CSV</button></div>';
  if(!list.length) h += '<div class="card mut center">' + L("Belum ada pelanggan. Mereka ditambah automatik bila anda mengeluarkan dokumen.", "No customers yet. They are added automatically when you issue documents.") + '</div>';
  list.forEach(function(c){ var S = custStats(c, p); h += '<button class="ngRow card" data-cu="' + c.id + '"><i>👤</i><span><b>' + E(c.name) + '</b><small>' + E([c.co, c.phone].filter(Boolean).join(" · ")) + '</small></span><span class="ngDA">' + (S.bal ? '<b class="bad">' + money(S.bal, p) + '</b><small>' + L("belum bayar", "unpaid") + '</small>' : S.billed ? '<small>' + money(S.billed, p) + '</small>' : '') + '</span></button>'; });
  el.innerHTML = h;
  var qi = el.querySelector("#ngCQ"); qi.oninput = function(){ ST.cq = qi.value; clearTimeout(vCusts.t); vCusts.t = setTimeout(function(){ draw(); var i = root.querySelector("#ngCQ"); if(i){ i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 250); };
  el.querySelector("#cuAdd").onclick = function(){ custForm({}, function(c){ saveCust(c, p); sv(); draw(); }); };
  var k = el.querySelector("#cuK"); if(k) k.onclick = function(){ contact(function(n, tel){ saveCust({name:n, phone:tel}, p); sv(); draw(); H.toast("✅ " + n); }); };
  el.querySelector("#cuCsv").onclick = function(){ csvImport("cust"); };
  el.querySelectorAll("[data-cu]").forEach(function(b){ b.onclick = function(){ ST.cust = b.getAttribute("data-cu"); goTop(); draw(); }; }); }
function vCust(el){ var p = prof(), c = N.byId(D.customers, ST.cust); if(!c || c.del){ ST.cust = null; vCusts(el); return; } var S = custStats(c, p);
  var h = '<div class="row ngVH"><button class="chip" id="cuBk">‹ ' + L("Pelanggan", "Customers") + '</button><button class="chip" id="cuE">✎ ' + L("Ubah", "Edit") + '</button></div>' +
    '<div class="card"><h3>' + E(c.name) + '</h3><div class="mut small">' + E([c.co, c.phone, c.email].filter(Boolean).join(" · ")) + '</div>' + (c.addr ? '<div class="small">' + E(c.addr).replace(/\n/g, "<br>") + '</div>' : '') +
    '<div class="ngTiles sm"><div class="ngTile"><small>' + L("Jumlah dibil", "Total billed") + '</small><b>' + money(S.billed, p) + '</b></div><div class="ngTile good"><small>' + L("Dibayar", "Paid") + '</small><b>' + money(S.paid, p) + '</b></div><div class="ngTile' + (S.bal ? " bad" : "") + '"><small>' + L("Baki", "Balance") + '</small><b>' + money(S.bal, p) + '</b></div><div class="ngTile"><small>' + L("Purata hari bayar", "Avg. days to pay") + '</small><b>' + (S.avg == null ? "—" : S.avg) + '</b></div></div>' +
    '<div class="btns"><button class="btn gold g3d" data-cn="INV">＋ ' + tname("INV") + '</button><button class="btn alt g3d" data-cn="QT">＋ ' + tname("QT") + '</button><button class="btn alt g3d" data-cn="OR">＋ ' + tname("OR") + '</button>' + (c.phone ? '<button class="btn alt g3d" id="cuWa">💬 WhatsApp</button>' : '') + '<button class="btn alt g3d" id="cuSoa">📄 ' + L("Penyata akaun", "Statement") + '</button></div></div>';
  h += S.docs.sort(function(a, b){ return b.date.localeCompare(a.date); }).map(function(d){ return docRow(d); }).join("") || '<div class="card mut center">' + L("Belum ada dokumen", "No documents yet") + '</div>';
  if(!staff()) h += '<button class="btn alt full g3d" id="cuDel" style="margin-top:12px">🗑 ' + L("Padam pelanggan", "Delete customer") + '</button>';
  el.innerHTML = h; bindRows(el);
  el.querySelector("#cuBk").onclick = function(){ ST.cust = null; draw(); };
  el.querySelector("#cuE").onclick = function(){ custForm(c, function(o){ saveCust(o, p); sv(); draw(); }); };
  el.querySelectorAll("[data-cn]").forEach(function(b){ b.onclick = function(){ var t = b.getAttribute("data-cn"); ST.cust = null; newDoc(t, c); }; });
  el.querySelector("#cuSoa").onclick = function(){ soaSheet(c, p); };
  var wa = el.querySelector("#cuWa"); if(wa) wa.onclick = function(){ var msg = S.bal ? L("Assalamualaikum " + c.name + ", peringatan mesra: baki belum dibayar ", "Assalamualaikum " + c.name + ", a friendly reminder: the unpaid balance is ") + money(S.bal, p) + L(". Terima kasih.", ". Thank you.") : L("Assalamualaikum ", "Assalamualaikum ") + c.name + ",";
    var u = "https://wa.me/" + waNum(c.phone) + "?text=" + encodeURIComponent(msg); if(window.Native && H.N.openUrl) H.N.openUrl(u); else window.open(u); };
  if(el.querySelector("#cuDel")) el.querySelector("#cuDel").onclick = function(){ if(!confirm(L("Padam pelanggan ini? Dokumen lama tidak berubah.", "Delete this customer? Old documents do not change."))) return; c.del = true; N.stamp(D, c); sv(); ST.cust = null; draw(); }; }

// ---------- 0.6.29 statement of account ----------
function soaData(c, p, from, to){ var mine = function(x){ return x.pid === p.id && x.status !== "draft" && x.status !== "void" && (x.custId === c.id || (!x.custId && (x.cust || {}).name === c.name)); }, ev = [];
  N.live(D.docs).filter(mine).forEach(function(x){ var T = N.totals(D, x, p), r = N.rate(x, p), amt = Math.round(T.total * r);
    if(x.type === "INV" || x.type === "DN") ev.push({date:x.date, label:tname(x.type) + " " + x.no, dr:amt, cr:0});
    if(x.type === "OR") ev.push({date:x.pdate || x.date, label:tname("OR") + " " + x.no + (x.dep ? " (deposit)" : ""), dr:0, cr:amt});
    if(x.type === "CN") ev.push({date:x.date, label:tname("CN") + " " + x.no, dr:0, cr:amt}); });
  ev.sort(function(a, b){ return a.date.localeCompare(b.date); }); var open = 0, rows = [], bal;
  ev.forEach(function(e){ if(e.date < from) open += e.dr - e.cr; }); bal = open;
  ev.forEach(function(e){ if(e.date >= from && e.date <= to){ bal += e.dr - e.cr; e.bal = bal; rows.push(e); } });
  var age = [0, 0, 0, 0, 0]; N.live(D.docs).filter(mine).forEach(function(x){ if(x.type !== "INV" || x.date > to) return; var T = N.totals(D, x, p); if(T.bal <= 0) return; var late = x.due ? N.daysBetween(x.due, to) : 0; age[late <= 0 ? 0 : late <= 30 ? 1 : late <= 60 ? 2 : late <= 90 ? 3 : 4] += Math.round(T.bal * N.rate(x, p)); });
  return {cust:snap(c), from:from, to:to, open:open, rows:rows, close:bal, age:age}; }
function soaSheet(c, p){ var t = N.ymd(), f = t.slice(0, 4) + "-01-01", pages = null;
  var ov = H.showSheet("📄 " + L("Penyata akaun", "Statement of account"), '<div class="f2">' + fld("soF", L("Dari", "From"), f, "date") + fld("soT", L("Hingga", "To"), t, "date") + '</div><div id="soPv" class="ngPv sm"></div><div class="ngShare"><button class="btn gold g3d" id="soPdf">📄 PDF</button><button class="btn alt g3d" id="soImg">🖼 ' + L("Gambar", "Picture") + '</button></div>');
  var paint = function(){ var S = soaData(c, p, gv(ov, "soF") || f, gv(ov, "soT") || t), box = ov.querySelector("#soPv"); box.innerHTML = '<div class="ngLoad">⏳</div>';
    TP.renderSOA(D, rp(p), S, imgGet).then(function(pg){ pages = pg; box.innerHTML = ""; pg.forEach(function(cv){ var im = document.createElement("img"); im.src = cv.toDataURL("image/jpeg", .85); im.className = "ngPg"; im.onclick = function(){ zoom(im.src); }; box.appendChild(im); }); }); };
  ov.querySelector("#soF").addEventListener("change", paint); ov.querySelector("#soT").addEventListener("change", paint); paint();
  ov.querySelector("#soPdf").onclick = function(){ if(pages && H.sharePdf) H.sharePdf("Penyata-" + (c.name || "").replace(/[^A-Za-z0-9]+/g, "-") + ".pdf", TP.pdf(pages), ""); };
  ov.querySelector("#soImg").onclick = function(){ if(!pages) return; var du = TP.picture(pages); if(window.Native && H.N.shareImage) H.N.shareImage(du, ""); }; }

// ---------- 0.6.29 AI fill from a WhatsApp order chat (Settings › AI row "Business: fill from chat"; private: never the free AI) ----------
function chatFill(d, p){ var ov = H.showSheet("✨ " + L("Isi dari chat", "Fill from a chat"), '<div class="aiBtnRow">' + AIRun.btn("niaga") + '</div><div class="mut small">' + L("Salin perbualan tempahan dari WhatsApp (tekan lama › Salin) dan tampal di sini. AI mengisi pelanggan dan barang; anda semak sebelum hantar.", "Copy the order chat from WhatsApp (long-press › Copy) and paste it here. The AI fills the customer and items; you check before sending.") + '</div>' +
    '<textarea id="cfT" rows="8" style="width:100%;box-sizing:border-box;margin:8px 0;padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--well);color:var(--fg)"></textarea><div id="cfC" class="aiRun"></div><button class="btn gold full g3d" id="cfGo">✨ ' + L("Isi", "Fill") + '</button>');
  ov.querySelector("#cfGo").onclick = function(){ var txt = gv(ov, "cfT").trim(); if(!txt){ H.toast(L("Tampal chat dahulu", "Paste the chat first")); return; }
    var go = function(){ var A = window.HalalAI; if(!A || !A.ready()){ AIRun.open("niaga"); return; } var b = ov.querySelector("#cfGo"); b.disabled = true; ov.querySelector("#cfC").innerHTML = AIRun.card("niaga");
      var items = N.live(D.items).filter(function(x){ return x.pid === p.id; }).slice(0, 80).map(function(x){ return x.name + " = " + x.price; }).join("; ");
      A.complete([{role:"user", content:"From this WhatsApp order chat between a small business and a customer, extract the order. Reply ONLY with JSON: {\"customer\": {\"name\": \"\", \"phone\": \"\", \"address\": \"\"}, \"lines\": [{\"desc\": \"item\", \"qty\": 1, \"unit\": \"pcs\", \"price\": 0}], \"notes\": \"delivery date or other notes\"}. Use prices from the chat; if missing, use this price list: " + (items || "none") + ". Unit price per item, not the line total. Chat:\n" + txt.slice(0, 6000)}], 1500, function(a, b2){ return L(a, b2); }, "", "niaga")
        .then(function(r){ var m = String(r.text || "").replace(/```json|```/g, "").match(/\{[\s\S]*\}/), j = null; try{ j = m && JSON.parse(m[0]); }catch(e){} if(!j || !(j.lines || []).length) throw new Error(L("Tiada pesanan dijumpai dalam chat", "No order found in the chat"));
          var c = j.customer || {}; if(!(d.cust && d.cust.name) && c.name){ d.cust = {name:c.name, phone:c.phone || "", addr:c.address || ""}; var ex = N.live(D.customers).filter(function(x){ return x.pid === p.id && x.name.toLowerCase() === String(c.name).toLowerCase(); })[0]; if(ex){ d.cust = snap(ex); d.custId = ex.id; } }
          d.lines = (d.lines || []).filter(function(l){ return l.desc || N.num(l.price); }).concat(j.lines.map(function(l){ return {t:"item", desc:String(l.desc || ""), qty:N.num(l.qty) || 1, unit:l.unit || "pcs", price:N.num(l.price) || "", tax:p.tax && p.tax.sst ? p.tax.rate : 0}; }));
          if(j.notes && !d.notes) d.notes = String(j.notes); N.stamp(D, d); N.cache(D, d, p); sv(); H.closeOverlay(); draw(); H.toast("✨ " + j.lines.length + L(" baris diisi. Sila semak.", " lines filled. Please check.")); })
        .catch(function(e){ var c2 = ov.querySelector("#cfC"); if(c2) c2.innerHTML = ""; b.disabled = false; if(!(e && e.cancel)) H.toast("⚠️ " + (e && e.message || e)); }); };
    if(window.HalalAI) go(); else { var sc = document.createElement("script"); sc.src = "halal/halal_ai.js"; sc.onload = go; document.head.appendChild(sc); } }; }

// ---------- 0.6.29 MyInvois (LHDN e-Invoice) export: a CSV + JSON with the fields the portal asks for; upload or give to your accountant ----------
function myInvois(p){ var ym = N.ymd().slice(0, 7);
  var ov = H.showSheet("🧾 MyInvois", '<div class="mut small">' + L("Eksport invois, bil tunai, nota kredit dan nota debit sebulan dengan medan e-Invois LHDN (TIN, BRN, MSIC, SST, kod cukai, kod klasifikasi). Muat naik melalui portal MyInvois (atau beri kepada akauntan). Semak templat terkini LHDN dan tarikh fasa anda.", "Export a month's invoices, cash sales, credit and debit notes with the LHDN e-Invoice fields (TIN, BRN, MSIC, SST, tax type, classification). Upload them in the MyInvois portal (or give them to your accountant). Check LHDN's latest template and your phase date.") + '</div>' +
    fld("miM", L("Bulan", "Month"), ym, "month") + '<div id="miW" class="small"></div><div class="ngShare"><button class="btn gold g3d" id="miCsv">⬇️ CSV</button><button class="btn alt g3d" id="miJson">⬇️ JSON</button></div>');
  var build = function(){ var m = gv(ov, "miM") || ym, docs = N.live(D.docs).filter(function(d){ return d.pid === p.id && ["INV","CS","CN","DN"].indexOf(d.type) >= 0 && d.status !== "draft" && d.status !== "void" && d.date.slice(0, 7) === m; }), warn = [];
    if(!p.tin) warn.push(L("TIN perniagaan belum diisi (Profil › Pendaftaran)", "Business TIN missing (Profile › Registration)")); if(!p.regNo) warn.push(L("No. pendaftaran (BRN) belum diisi", "Registration no. (BRN) missing")); if(!p.msic) warn.push(L("Kod MSIC belum diisi", "MSIC code missing"));
    var TT = function(r){ r = N.num(r); return !r ? "06" : (r === 5 || r === 10) ? "01" : "02"; }, UOM = {kg:"KGM", g:"GRM", jam:"HUR", hour:"HUR", hari:"DAY", day:"DAY", m:"MTR", "m²":"MTK", set:"SET", kotak:"XBX", box:"XBX", botol:"XBO", pek:"XPK", lot:"XLT", bulan:"MON"};
    var rows = [], json = [];
    docs.forEach(function(d){ var T = N.totals(D, d, p), c = d.cust || {}, fr = d.from && N.byId(D.docs, d.from), code = {INV:"01", CS:"01", CN:"02", DN:"03"}[d.type], buyerTin = c.tin || "EI00000000010";
      var lines = (d.lines || []).filter(function(l){ return l.t !== "head"; }).map(function(l){ var amt = N.lineAmt(l), tx = Math.round(amt * N.num(l.tax) / 100);
        return {desc:l.desc || "", cls:"022", qty:N.num(l.qty), uom:UOM[String(l.unit || "").toLowerCase()] || "C62", price:N.num(l.price), sub:N.rm(amt), taxType:TT(l.tax), taxRate:N.num(l.tax), tax:N.rm(tx), total:N.rm(amt + tx)}; });
      json.push({type:code, no:d.no, date:d.date, currency:N.docCur(d, p), rate:d.cur ? N.num(d.rate) : 1, original:fr ? fr.no : "",
        supplier:{name:p.name, tin:p.tin || "", brn:p.regNo || "", sst:p.sstNo || "NA", msic:p.msic || "", address:[p.addr.l1, p.addr.l2, p.addr.pc, p.addr.city, p.addr.state].filter(Boolean).join(", "), phone:p.phone || "", email:p.email || ""},
        buyer:{name:c.name || "", tin:buyerTin, brn:c.regNo || "NA", address:String(c.addr || "").replace(/\n/g, ", ") || "NA", phone:c.phone || "NA", email:c.email || ""},
        lines:lines, totalExcl:N.rm(T.sub - T.disc), tax:N.rm(T.taxSum), total:N.rm(T.total)});
      lines.forEach(function(l, i){ rows.push([code, d.no, d.date, N.docCur(d, p), fr ? fr.no : "", p.tin || "", p.regNo || "", p.sstNo || "NA", p.msic || "", c.name || "", buyerTin, c.regNo || "NA", String(c.addr || "").replace(/\n/g, ", ") || "NA", c.phone || "NA", i + 1, l.desc, l.cls, l.qty, l.uom, l.price, l.sub, l.taxType, l.taxRate, l.tax, l.total]); }); });
    if(docs.some(function(d){ return !(d.cust || {}).tin; })) warn.push(L("Pembeli tanpa TIN memakai TIN umum EI00000000010 (orang awam). Semak dengan LHDN.", "Buyers without a TIN use the general TIN EI00000000010 (general public). Check with LHDN."));
    ov.querySelector("#miW").innerHTML = '<div class="mut">' + docs.length + L(" dokumen", " documents") + '</div>' + warn.map(function(w){ return '<div>⚠️ ' + E(w) + '</div>'; }).join("");
    return {m:m, rows:[["InvoiceType","InvoiceNo","IssueDate","Currency","OriginalInvoiceNo","SupplierTIN","SupplierBRN","SupplierSST","SupplierMSIC","BuyerName","BuyerTIN","BuyerBRN","BuyerAddress","BuyerPhone","LineNo","Description","Classification","Quantity","UnitCode","UnitPrice","Subtotal","TaxType","TaxRate","TaxAmount","LineTotal"]].concat(rows), json:json}; };
  build(); ov.querySelector("#miM").addEventListener("change", build);
  var out = function(name, txt, mime){ if(window.Native && H.N.openTextFile) H.N.openTextFile(name, mime, txt, true); else saveText(name, txt, mime); };
  ov.querySelector("#miCsv").onclick = function(){ var b = build(); out("myinvois-" + b.m + ".csv", N.csvMake(b.rows), "text/csv"); };
  ov.querySelector("#miJson").onclick = function(){ var b = build(); out("myinvois-" + b.m + ".json", JSON.stringify(b.json, null, 1), "application/json"); }; }

// ---------- items ----------
function vItems(el){ var p = prof(), list = N.live(D.items).filter(function(x){ return x.pid === p.id; }).sort(function(a, b){ return (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || a.name.localeCompare(b.name); });
  var sold = {}; N.live(D.docs).forEach(function(d){ if(d.pid !== p.id || d.status === "draft" || d.status === "void" || (d.type !== "INV" && d.type !== "CS")) return; (d.lines || []).forEach(function(l){ if(l.item){ sold[l.item] = sold[l.item] || [0, 0]; sold[l.item][0] += N.num(l.qty); sold[l.item][1] += N.lineAmt(l); } }); });
  var h = '<div class="btns"><button class="btn gold g3d" id="itAdd">＋ ' + L("Barang / perkhidmatan", "Item / service") + '</button><button class="btn alt g3d" id="itCsv">📥 CSV</button></div><div class="mut small">' + L("⭐ kegemaran muncul sebagai butang cepat dalam dokumen.", "⭐ favourites show as quick buttons in documents.") + '</div>';
  if(!list.length) h += '<div class="card mut center">' + L("Simpan barang yang selalu dijual supaya dokumen cepat dibuat.", "Save what you often sell so documents are quick to make.") + '</div>';
  list.forEach(function(x){ var s = sold[x.id]; h += '<div class="ngRow card"><button class="ib" data-itf="' + x.id + '">' + (x.fav ? "⭐" : "☆") + '</button><span data-ite="' + x.id + '"><b>' + E(x.name) + '</b><small>' + money(N.sen(x.price), p) + ' / ' + E(x.unit || "") + (x.sku ? ' · ' + E(x.sku) : '') + (s ? ' · ' + L("terjual ", "sold ") + Math.round(s[0] * 100) / 100 : '') + '</small></span></div>'; });
  el.innerHTML = h;
  el.querySelector("#itAdd").onclick = function(){ itemForm({}, p); }; el.querySelector("#itCsv").onclick = function(){ csvImport("item"); };
  el.querySelectorAll("[data-itf]").forEach(function(b){ b.onclick = function(){ var x = N.byId(D.items, b.getAttribute("data-itf")); x.fav = !x.fav; N.stamp(D, x); sv(); draw(); }; });
  el.querySelectorAll("[data-ite]").forEach(function(b){ b.onclick = function(){ itemForm(N.byId(D.items, b.getAttribute("data-ite")), p); }; }); }
function itemForm(x, p){ var sst = p.tax && p.tax.sst;
  var ov = H.showSheet("📦 " + L("Barang", "Item"), fld("ifN", L("Nama *", "Name *"), x.name) + area("ifD", L("Keterangan (pilihan)", "Description (optional)"), x.desc, 2) +
    '<div class="f2">' + fld("ifP", L("Harga jual", "Price"), x.price, "text", ' inputmode="decimal" data-calc="1"') + fld("ifU", L("Unit", "Unit"), x.unit || "pcs", "text", ' list="ifUl"') + '</div><datalist id="ifUl">' + N.UNITS.map(function(u){ return '<option value="' + u + '">'; }).join("") + '</datalist>' +
    '<div class="f2">' + fld("ifC", L("Kos (pilihan)", "Cost (optional)"), x.cost, "text", ' inputmode="decimal" data-calc="1"') + fld("ifS", "SKU", x.sku) + '</div>' + fld("ifK", L("Kategori", "Category"), x.cat) +
    (sst ? sel("ifT", L("Cukai", "Tax"), x.tax != null ? x.tax : p.tax.rate, N.TAXES.map(function(t){ return [t[0], L(t[1], t[2])]; })) : '') + tog("ifF", "⭐ " + L("Kegemaran", "Favourite"), !!x.fav) +
    '<div class="btns" style="margin-top:10px">' + (x.id && !staff() ? '<button class="btn alt g3d" id="ifX">🗑</button>' : '') + '<button class="btn gold g3d" id="ifOk" style="flex:1">✓ ' + L("Simpan", "Save") + '</button></div>');
  calcBind(ov);
  ov.querySelector("#ifOk").onclick = function(){ var n = gv(ov, "ifN").trim(); if(!n){ H.toast(L("Isi nama", "Enter a name")); return; } var o = x.id ? N.byId(D.items, x.id) : {id:N.rid(), pid:p.id};
    o.name = n; o.desc = gv(ov, "ifD"); o.price = N.num(N.calc(gv(ov, "ifP"))); o.unit = gv(ov, "ifU"); o.cost = gv(ov, "ifC") === "" ? "" : N.num(N.calc(gv(ov, "ifC"))); o.sku = gv(ov, "ifS"); o.cat = gv(ov, "ifK"); if(sst) o.tax = +gv(ov, "ifT"); o.fav = !!gv(ov, "ifF");
    N.stamp(D, o); if(!x.id) D.items.push(o); sv(); H.closeOverlay(); draw(); };
  var dx = ov.querySelector("#ifX"); if(dx) dx.onclick = function(){ if(!confirm(L("Padam?", "Delete?"))) return; var o = N.byId(D.items, x.id); o.del = true; N.stamp(D, o); sv(); H.closeOverlay(); draw(); }; }

// ---------- profile page ----------
function vProf(el){ var p = prof(), cp = complete(p);
  var h = '<div class="card ngPH">' + logoChip(p) + '<div><b>' + E(p.name) + '</b><small class="mut">' + E(p.trade || "") + '</small><div class="ngMeter"><i style="width:' + cp.pc + '%"></i></div><small class="mut">' + L("Profil ", "Profile ") + cp.pc + "% " + L("lengkap", "complete") + (cp.miss.length ? " · " + L("tambah ", "add ") + E(cp.miss.slice(0, 3).join(", ")) : "") + '</small></div></div>';
  var gl = NS() && NS().link(p.id);
  h += '<button class="ngRow card ngGsRow" id="prGs"><i>📗</i><span><b>Google Sheet</b><small>' + (gl && gl.url ? E(gl.name || "") + ' · ' + L("telefon ", "phone ") + E(gl.letter || "A") + (gl.role === "staff" ? " · " + L("staf", "staff") : "") : L("Buku akaun penuh dalam Google Sheet anda, dan kongsi dengan telefon lain.", "A full account book in your own Google Sheet, shared with other phones.")) + '</small></span>›</button>';
  if(staff()){ h += '<div class="snl">✍️ ' + L("Tandatangan saya", "My signature") + '</div><div class="card" id="prMy">' + sigHtml({sigs:mySigs()}, true) + '</div>' + '<div class="card mut small">👤 ' + L("Telefon staf: profil, tetapan, import dan eksport diurus oleh pemilik.", "Staff phone: the profile, settings, import and export are managed by the owner.") + '</div>'; el.innerHTML = h; el.querySelector("#prGs").onclick = function(){ NS().open(p.id); }; var pm = {sigs:mySigs()}; sigBind(pm, el.querySelector("#prMy"), function(){ D.mySigs = pm.sigs; H.save(N.KEY, D); draw(); }); return; }
  h += SECS.map(function(s){ return '<button class="ngRow card" data-sec="' + s[0] + '"><i>' + s[1] + '</i><span><b>' + L(s[2], s[3]) + '</b><small>' + secSum(s[0], p) + '</small></span>›</button>'; }).join("");
  h += '<div class="snl">📦 ' + L("Pindah & import", "Move & import") + '</div>' +
    '<button class="ngRow card" id="prExp"><i>📤</i><span><b>' + L("Eksport fail Niaga (.ihsanbiz)", "Export a Niaga file (.ihsanbiz)") + '</b><small>' + L("Untuk telefon baharu. Termasuk logo, tandatangan, cop dan QR.", "For a new phone. Includes logo, signatures, stamp and QR.") + '</small></span>›</button>' +
    '<button class="ngRow card" id="prImp"><i>📥</i><span><b>' + L("Import fail Niaga", "Import a Niaga file") + '</b><small>' + L("Gabung, ganti atau salin sebagai profil baru. Pratonton dahulu.", "Merge, replace or copy as a new profile. Preview first.") + '</small></span>›</button>' +
    '<button class="ngRow card" id="prCsv"><i>📊</i><span><b>' + L("Import CSV (Excel)", "Import CSV (Excel)") + '</b><small>' + L("Pelanggan, barang atau dokumen lama.", "Customers, items or past documents.") + '</small></span>›</button>' +
    '<button class="ngRow card" id="prP2p"><i>📲</i><span><b>' + L("Telefon ke telefon", "Phone to phone") + '</b><small>' + L("Tanpa internet: QR + Quick Share / Bluetooth, disulitkan.", "No internet: QR + Quick Share / Bluetooth, encrypted.") + '</small></span>›</button>' +
    ((D.restore || []).length ? '<button class="ngRow card" id="prUndo"><i>↶</i><span><b>' + L("Batal import terakhir", "Undo the last import") + '</b><small>' + E(D.restore[D.restore.length - 1].at.slice(0, 16).replace("T", " ")) + '</small></span>›</button>' : '') +
    '<div class="snl">🏪 ' + L("Perniagaan", "Businesses") + '</div><div class="btns"><button class="btn alt g3d" id="prAdd">＋ ' + L("Tambah perniagaan", "Add a business") + '</button><button class="btn alt g3d" id="prDel">🗑 ' + L("Padam perniagaan ini", "Delete this business") + '</button></div>' +
    '<div class="mut tiny" style="margin-top:10px">ⓘ ' + L("Rekod perniagaan perlu disimpan 7 tahun. Buat sandaran My Ihsan atau eksport fail Niaga setiap tahun.", "Business records should be kept for 7 years. Back up My Ihsan or export a Niaga file every year.") + '</div>';
  el.innerHTML = h;
  el.querySelectorAll("[data-sec]").forEach(function(b){ b.onclick = function(){ editSec(b.getAttribute("data-sec")); }; });
  el.querySelector("#prGs").onclick = function(){ NS().open(p.id); };
  el.querySelector("#prExp").onclick = exportBiz; el.querySelector("#prImp").onclick = importBiz; el.querySelector("#prCsv").onclick = function(){ csvImport(); };
  var u = el.querySelector("#prUndo"); if(u) u.onclick = undoImport; el.querySelector("#prP2p").onclick = p2pSend;
  el.querySelector("#prAdd").onclick = addProfile;
  el.querySelector("#prDel").onclick = function(){ var n = prompt(L("Ini akan membuang perniagaan dan semua rekodnya dari telefon ini. Taip nama perniagaan untuk sahkan:", "This removes the business and all its records from this phone. Type the business name to confirm:") + "\n" + p.name, ""); if(n === null) return;
    if(n.trim() !== p.name){ H.toast(L("Nama tidak sama", "The name does not match")); return; } p.del = true; N.stamp(D, p); ["customers","items","docs","expenses"].forEach(function(k){ D[k].forEach(function(r){ if(r.pid === p.id && !r.del){ r.del = true; N.stamp(D, r); } }); }); D.cur = ""; sv(); draw(); }; }
function secSum(k, p){ var a = p.addr || {};
  if(k === "biz") return E(p.name || "—") + (p.logo ? " · logo ✓" : "");
  if(k === "reg") return E([p.regNo ? "SSM " + p.regNo : p.licence, a.city].filter(Boolean).join(" · ") || L("belum diisi", "not filled"));
  if(k === "contact") return E([p.phone, ((p.bank || [])[0] || {}).bank, p.qr ? "QR ✓" : ""].filter(Boolean).join(" · ") || L("belum diisi", "not filled"));
  if(k === "sig") return (p.sigs || []).length + " " + L("tandatangan", "signatures") + (p.stamp ? " · " + L("cop ✓", "stamp ✓") : "");
  if(k === "look") return E((TP.DESIGNS.filter(function(d){ return d[0] === p.design; })[0] || ["", "", ""])[H.en() ? 2 : 1]) + ' · <i class="ngSw" style="background:' + E(p.color) + '"></i> · ' + ({both:"BM + EN", bm:"BM", en:"EN"}[p.lang] || "");
  if(k === "tax") return p.tax && p.tax.sst ? "SST " + p.tax.rate + "%" : L("Tidak berdaftar SST", "Not SST registered");
  if(k === "num") return E(N.peekNo(D, p, "INV", N.ymd()).no);
  if(k === "terms") return L("Invois ", "Invoice ") + (p.due || 0) + L(" hari", " days");
  return ""; }
function editSec(k){ var p = prof(), s = SECS.filter(function(x){ return x[0] === k; })[0];
  var ov = H.showSheet(s[1] + " " + L(s[2], s[3]), '<div id="esB">' + secHtml(k, p) + '</div><button class="btn gold full g3d" id="esOk" style="margin-top:12px">✓ ' + L("Simpan", "Save") + '</button>');
  var box = ov.querySelector("#esB"), again = function(){ editSec(k); };
  secBind(k, p, box, again);
  ov.querySelector("#esOk").onclick = function(){ secRead(k, p, box); if(k === "biz" && !p.name){ H.toast(L("Isi nama perniagaan", "Enter the business name")); return; } N.stamp(D, p); sv(); H.closeOverlay(); draw(); }; }

// ---------- .ihsanbiz export / import ----------
function b64(buf){ var s = "", b = new Uint8Array(buf); for(var i = 0; i < b.length; i += 32768) s += String.fromCharCode.apply(null, b.subarray(i, i + 32768)); return btoa(s); }
function unb64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function canCrypt(){ return !!(window.crypto && crypto.subtle && window.TextEncoder); }
function keyFrom(pw, salt){ return crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]).then(function(k){ return crypto.subtle.deriveKey({name:"PBKDF2", salt:salt, iterations:150000, hash:"SHA-256"}, k, {name:"AES-GCM", length:256}, false, ["encrypt", "decrypt"]); }); }
function encrypt(txt, pw){ var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  return keyFrom(pw, salt).then(function(k){ return crypto.subtle.encrypt({name:"AES-GCM", iv:iv}, k, new TextEncoder().encode(txt)); }).then(function(ct){ return {salt:b64(salt), iv:b64(iv), ct:b64(ct)}; }); }
function decrypt(enc, pw){ return keyFrom(pw, unb64(enc.salt)).then(function(k){ return crypto.subtle.decrypt({name:"AES-GCM", iv:unb64(enc.iv)}, k, unb64(enc.ct)); }).then(function(b){ return new TextDecoder().decode(b); }); }
function packOf(pids){ var data = {profiles:[], customers:[], items:[], docs:[], expenses:[], ctr:{}}, img = {}, want = function(id){ if(id && !img[id]){ var v = imgGet(id); if(v) img[id] = v; } };
  D.profiles.forEach(function(p){ if(pids.indexOf(p.id) >= 0){ data.profiles.push(p); want(p.logo); want(p.stamp); want(p.qr); (p.sigs || []).forEach(function(s){ want(s.img); }); } });
  ["customers","items","docs","expenses"].forEach(function(k){ D[k].forEach(function(r){ if(pids.indexOf(r.pid) >= 0){ data[k].push(r); if(r.csig) want(r.csig.img); if(r.photo) want(r.photo); } }); });
  Object.keys(D.ctr).forEach(function(k){ if(pids.indexOf(k.split("|")[0]) >= 0) data.ctr[k] = D.ctr[k]; });
  return {data:data, img:img, dev:{letter:D.dev.letter}}; }
function exportBiz(){ var a = profs(), p = prof();
  var ov = H.showSheet("📤 " + L("Eksport fail Niaga", "Export a Niaga file"), (a.length > 1 ? '<div class="chips">' + [["one", E(p.name)], ["all", L("Semua perniagaan", "All businesses")]].map(function(o, i){ return '<button class="chip' + (i ? "" : " on") + '" data-ew="' + o[0] + '">' + o[1] + '</button>'; }).join("") + '</div>' : '') +
    (canCrypt() ? fld("exPw", L("Kata laluan (disyorkan, fail ada tandatangan & cop)", "Password (recommended: the file holds signatures & the stamp)"), "", "password", ' autocomplete="new-password"') : '') +
    '<div class="mut small">' + L("Simpan ke Drive / Muat turun, atau hantar kepada diri sendiri. Di telefon baharu: Niaga › Import.", "Save to Drive / Downloads, or send it to yourself. On the new phone: Niaga › Import.") + '</div><button class="btn gold full g3d" id="exOk" style="margin-top:10px">📤 ' + L("Eksport", "Export") + '</button>');
  var which = "one"; ov.querySelectorAll("[data-ew]").forEach(function(b){ b.onclick = function(){ which = b.getAttribute("data-ew"); ov.querySelectorAll("[data-ew]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; });
  ov.querySelector("#exOk").onclick = function(){ var pids = which === "all" ? a.map(function(x){ return x.id; }) : [p.id], pack = packOf(pids), pw = gv(ov, "exPw");
    var man = {app:"My Ihsan", kind:"niaga", v:1, at:N.iso(), counts:{profiles:pack.data.profiles.length, customers:pack.data.customers.length, items:pack.data.items.length, docs:pack.data.docs.length, images:Object.keys(pack.img).length}};
    var name = "MyIhsan-Niaga-" + (which === "all" ? "semua" : (p.name || "biz")).replace(/[^A-Za-z0-9]+/g, "-") + "-" + N.ymd() + ".ihsanbiz", body = JSON.stringify(pack);
    var out = function(o){ saveText(name, JSON.stringify(o)); H.closeOverlay(); H.toast("✅ " + L("Fail disediakan", "File ready")); };
    if(pw) encrypt(body, pw).then(function(enc){ man.enc = enc; out(man); }, function(){ H.toast(L("Penyulitan gagal", "Encryption failed")); }); else { man.pack = pack; out(man); } }; }
function importBiz(){ openText(".ihsanbiz,.json,application/json", function(body){ var j = null; try{ j = JSON.parse(body); }catch(e){}
  if(!j || j.app !== "My Ihsan" || j.kind !== "niaga"){ H.toast(L("Ini bukan fail Niaga", "This is not a Niaga file")); return; }
  if(j.enc){ var pw = prompt(L("Kata laluan fail:", "File password:"), ""); if(pw === null) return; if(!canCrypt()){ H.toast(L("Telefon ini tidak boleh membuka fail berkata laluan", "This phone cannot open password files")); return; }
    decrypt(j.enc, pw).then(function(t){ importPreview(JSON.parse(t), j); }, function(){ H.toast("🔒 " + L("Kata laluan salah", "Wrong password")); }); }
  else importPreview(j.pack, j); }); }
function importPreview(pack, man){ if(!pack || !pack.data){ H.toast(L("Fail rosak", "The file is damaged")); return; } var d = pack.data, dates = d.docs.map(function(x){ return x.date; }).sort(), col = 0;
  d.docs.forEach(function(x){ if(!x.del && x.status !== "void" && ((x.type === "OR" && !x.cr) || x.type === "CS")) col += N.sen((x.totals || {}).total); if(!x.del && x.status !== "void" && x.type === "CN" && x.refAmt) col -= N.sen(x.refAmt); });
  var exist = d.profiles.some(function(p){ return N.byId(D.profiles, p.id) && !N.byId(D.profiles, p.id).del; });
  var ov = H.showSheet("📥 " + L("Import fail Niaga", "Import a Niaga file"), '<div class="card ngImpS">' + d.profiles.map(function(p){ return '<b>🏪 ' + E(p.name) + '</b>'; }).join("<br>") + '<div class="ngKV"><span>' + L("Pelanggan", "Customers") + '</span><b>' + d.customers.length + '</b></div><div class="ngKV"><span>' + L("Barang", "Items") + '</span><b>' + d.items.length + '</b></div><div class="ngKV"><span>' + L("Dokumen", "Documents") + '</span><b>' + d.docs.length + '</b></div><div class="ngKV"><span>' + L("Gambar", "Images") + '</span><b>' + Object.keys(pack.img || {}).length + '</b></div>' +
    (dates.length ? '<div class="ngKV"><span>' + L("Tempoh", "Period") + '</span><b>' + dates[0] + ' → ' + dates[dates.length - 1] + '</b></div>' : '') + '<div class="ngKV"><span>' + L("Jumlah kutipan", "Total collected") + '</span><b>' + N.fmt(col) + '</b></div><small class="mut">' + E(String(man.at || "").slice(0, 10)) + '</small></div>' +
    '<button class="btn gold full g3d" data-im="merge">⇄ ' + L("Gabung", "Merge") + '<small>' + L("Tambah yang baru, kemas kini yang lebih baru. Tiada pendua.", "Add what is new, update what is newer. No duplicates.") + '</small></button>' +
    (exist ? '<button class="btn alt full g3d" data-im="replace">♻ ' + L("Ganti", "Replace") + '<small>' + L("Ganti perniagaan ini sepenuhnya.", "Replace this business completely.") + '</small></button>' : '') +
    '<button class="btn alt full g3d" data-im="copy">⧉ ' + L("Salin sebagai profil baru", "Copy as a new profile") + '<small>' + L("Rekod berasingan dengan id baru.", "Separate records with new ids.") + '</small></button>');
  ov.querySelectorAll("[data-im]").forEach(function(b){ b.onclick = function(){ var m = b.getAttribute("data-im");
    if(m === "replace"){ var nm = d.profiles.map(function(p){ return p.name; }).join(", "), t = prompt(L("Taip nama perniagaan untuk ganti:", "Type the business name to replace:") + "\n" + nm, ""); if(t === null) return; if(d.profiles.every(function(p){ return p.name !== t.trim(); })){ H.toast(L("Nama tidak sama", "The name does not match")); return; } }
    restorePoint(); Object.keys(pack.img || {}).forEach(function(id){ imgPut(id, pack.img[id]); });
    var n = {add:0, upd:0};
    if(m === "merge") n = N.mergeInto(D, d);
    else if(m === "replace"){ var pids = d.profiles.map(function(p){ return p.id; }); ["profiles","customers","items","docs","expenses","bkcfg","bookings"].forEach(function(k){ D[k] = (D[k] || []).filter(function(r){ return pids.indexOf(k === "profiles" ? r.id : r.pid) < 0; }); }); Object.keys(D.ctr).forEach(function(k){ if(pids.indexOf(k.split("|")[0]) >= 0) delete D.ctr[k]; }); n = N.mergeInto(D, d); }
    else n = copyAsNew(d);
    if(d.profiles[0]) D.cur = m === "copy" ? D.cur : d.profiles[0].id; d.profiles.forEach(function(p){ N.log(D, p.id, "import"); });
    sv(); H.closeOverlay(); ST.wiz = 0; ST.pg = "papan"; ST.vw = null; draw(); H.toast("✅ " + L("Diimport: ", "Imported: ") + n.add + L(" baru, ", " new, ") + n.upd + L(" dikemas kini", " updated")); }; }); }
// ---------- 0.6.29 phone to phone: the old phone shows a QR with a one-time key and sends the encrypted .ihsanbiz by Quick Share / Bluetooth ----------
function p2pSend(){ if(!canCrypt()){ H.toast(L("Telefon ini tidak boleh menyulitkan", "This phone cannot encrypt")); return; } var key = N.rid(20), pack = packOf(profs().map(function(x){ return x.id; }));
  var man = {app:"My Ihsan", kind:"niaga", v:1, at:N.iso(), p2p:true, counts:{profiles:pack.data.profiles.length, docs:pack.data.docs.length}}, file = null;
  var ov = H.showSheet("📲 " + L("Telefon ke telefon", "Phone to phone"), '<div class="ngStep"><i>1</i><div><b>' + L("Di telefon baharu: Niaga › Terima dari telefon lama › Imbas", "On the new phone: Business › Receive from the old phone › Scan") + '</b></div></div><div class="ngQr" id="p2Q">⏳</div><div class="center mut small">' + L("Kod: ", "Code: ") + '<b class="ngCode" style="font-size:18px">' + key + '</b></div>' +
    '<div class="ngStep"><i>2</i><div><b>' + L("Hantar fail", "Send the file") + '</b><small class="mut">' + L("Pilih Quick Share / Nearby Share / Bluetooth ke telefon baharu.", "Choose Quick Share / Nearby Share / Bluetooth to the new phone.") + '</small><button class="btn gold g3d" id="p2S">📤 ' + L("Hantar fail", "Send the file") + '</button></div></div>' +
    '<div class="mut tiny">🔒 ' + L("Fail disulitkan dengan kod dalam QR; tanpa QR ia tidak boleh dibuka.", "The file is encrypted with the code in the QR; without the QR it cannot be opened.") + '</div>');
  var show = function(){ var q = ov.querySelector("#p2Q"); if(!q) return; try{ q.innerHTML = qr("ihsanmove:" + key); }catch(e){ q.textContent = key; } };
  if(window.NostrKit) show(); else { var sc = document.createElement("script"); sc.src = "groups/nostrkit.js"; sc.onload = show; sc.onerror = show; document.body.appendChild(sc); }
  encrypt(JSON.stringify(pack), key).then(function(enc){ man.enc = enc; file = JSON.stringify(man); });
  ov.querySelector("#p2S").onclick = function(){ if(!file){ H.toast("⏳"); return; } var name = "MyIhsan-Niaga-pindah-" + N.ymd() + ".ihsanbiz";
    if(window.Native && H.N.shareFile) H.N.shareFile(name, file, "application/octet-stream", ""); else saveText(name, file); }; }
function qr(text){ var q = window.NostrKit.qrcode(0, "M"); q.addData(text); q.make(); var n = q.getModuleCount(), s2 = 4, d = "";
  for(var r = 0; r < n; r++) for(var c = 0; c < n; c++) if(q.isDark(r, c)) d += "M" + (c * s2 + s2 * 2) + " " + (r * s2 + s2 * 2) + "h" + s2 + "v" + s2 + "h-" + s2 + "z";
  var w = n * s2 + s2 * 4; return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + w + '"><rect width="' + w + '" height="' + w + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>'; }
function p2pRecv(){ var key = "";
  var ov = H.showSheet("📲 " + L("Terima dari telefon lama", "Receive from the old phone"), '<div class="mut small">' + L("Di telefon lama: Niaga › Profil › Telefon ke telefon.", "On the old phone: Business › Profile › Phone to phone.") + '</div>' +
    '<div class="ngStep"><i>1</i><div><b>' + L("Imbas QR", "Scan the QR") + '</b><button class="btn gold g3d" id="p2Scan">📷 ' + L("Imbas", "Scan") + '</button><input id="p2K" type="text" placeholder="' + L("atau taip kod", "or type the code") + '"></div></div>' +
    '<div class="ngStep"><i>2</i><div><b>' + L("Buka fail yang diterima", "Open the file you received") + '</b><small class="mut">' + L("Biasanya dalam folder Download.", "Usually in the Download folder.") + '</small><button class="btn alt g3d" id="p2Open">📂 ' + L("Buka fail", "Open the file") + '</button></div></div><div id="p2M" class="mut small"></div>');
  ov.querySelector("#p2Scan").onclick = function(){ NS().scan(function(t){ key = t.slice(10); p2pRecv(); setTimeout(function(){ var k = document.querySelector("#p2K"); if(k) k.value = key; }, 200); }, function(t){ return /^ihsanmove:\w{8,}$/.test(t); }, L("Imbas QR telefon lama", "Scan the old phone's QR")); };
  ov.querySelector("#p2Open").onclick = function(){ var k = (gv(ov, "p2K") || key).trim(); if(!k){ ov.querySelector("#p2M").textContent = L("Imbas QR dahulu", "Scan the QR first"); return; }
    openText(".ihsanbiz,*/*", function(body){ var j = null; try{ j = JSON.parse(body); }catch(e){} if(!j || j.kind !== "niaga" || !j.enc){ H.toast(L("Ini bukan fail pindah Niaga", "This is not a Niaga transfer file")); return; }
      decrypt(j.enc, k).then(function(t){ importPreview(JSON.parse(t), j); }, function(){ H.toast("🔒 " + L("Kod tidak sepadan dengan fail", "The code does not match the file")); }); }); }; }
function copyAsNew(d){ var map = {}, nid = function(id){ if(!id) return id; if(!map[id]) map[id] = N.rid(); return map[id]; }, n = {add:0, upd:0}, last = "";
  d.profiles.forEach(function(p){ var q = N.clone(p); q.id = nid(p.id); q.name = p.name + L(" (salinan)", " (copy)"); q.rev = 0; N.stamp(D, q); D.profiles.push(q); n.add++; last = q.id; });
  ["customers","items","docs","expenses"].forEach(function(k){ d[k].forEach(function(r){ var x = N.clone(r); x.id = nid(r.id); x.pid = nid(r.pid); if(x.custId) x.custId = nid(x.custId); if(x.from) x.from = nid(x.from); if(x.to) x.to = x.to.map(nid); if(x.apply) x.apply.forEach(function(a){ a.doc = nid(a.doc); }); (x.lines || []).forEach(function(l){ if(l.item) l.item = nid(l.item); }); x.rev = 0; N.stamp(D, x); D[k].push(x); n.add++; }); });
  Object.keys(d.ctr || {}).forEach(function(k){ var q = k.split("|"); q[0] = nid(q[0]); D.ctr[q.join("|")] = d.ctr[k]; }); if(last) D.cur = last; return n; }
function restorePoint(){ var at = N.iso(), id = "restore-" + at.replace(/[^0-9]/g, "").slice(0, 14); imgPut(id, JSON.stringify(Object.assign({}, D, {restore:undefined})));
  D.restore = (D.restore || []).concat([{at:at, id:id}]).slice(-5); }
function undoImport(){ var r = (D.restore || []).pop(); if(!r) return; if(!confirm(L("Kembalikan Niaga seperti sebelum import pada ", "Return Niaga to how it was before the import on ") + r.at.slice(0, 16).replace("T", " ") + "?")) { D.restore.push(r); return; }
  var t = imgGet(r.id), j = null; try{ j = JSON.parse(t); }catch(e){} if(!j){ H.toast(L("Titik pulih tiada", "The restore point is missing")); return; } var keep = D.restore; D = N.fix(j); D.restore = keep; sv(); draw(); H.toast("↶ " + L("Dikembalikan", "Restored")); }

// ---------- CSV import (customers / items / past documents) ----------
var CSVF = {cust:[["name", "Nama", "Name", /nama|name|pelanggan|customer/i, 1], ["co", "Syarikat", "Company", /syarikat|company|co\b/i], ["phone", "Telefon", "Phone", /tel|phone|hp|mobile|whatsapp/i], ["email", "E-mel", "Email", /mail/i], ["addr", "Alamat", "Address", /alamat|address/i], ["regNo", "No. pendaftaran", "Reg. no.", /ssm|reg/i]],
  item:[["name", "Nama", "Name", /nama|name|item|barang|produk|product/i, 1], ["price", "Harga", "Price", /harga|price|rate/i, 1], ["unit", "Unit", "Unit", /unit|uom/i], ["desc", "Keterangan", "Description", /keterangan|desc/i], ["cost", "Kos", "Cost", /kos|cost/i], ["sku", "SKU", "SKU", /sku|kod|code/i], ["cat", "Kategori", "Category", /kategori|category/i]],
  doc:[["no", "No. dokumen", "Document no.", /no|number|invois|invoice/i, 1], ["date", "Tarikh", "Date", /tarikh|date/i, 1], ["cust", "Pelanggan", "Customer", /pelanggan|customer|nama|name|client/i, 1], ["total", "Jumlah", "Total", /jumlah|total|amount|amaun/i, 1], ["paid", "Dibayar", "Paid", /bayar|paid|terima|received/i], ["due", "Tarikh akhir", "Due date", /akhir|due/i], ["type", "Jenis", "Type", /jenis|type/i]]};
function csvImport(kind, src){ var lk = NS() && NS().link(prof().id);
  if(kind && !src && lk && lk.url){ var ov0 = H.showSheet("📊 " + L("Dari mana?", "From where?"), '<button class="ngRow card" data-src="file"><i>📄</i><span><b>' + L("Fail CSV", "A CSV file") + '</b></span>›</button><div class="snl">📗 ' + L("Tab dalam Google Sheet yang disambung", "A tab in the linked Google Sheet") + '</div><div id="tbL" class="mut">⏳</div>');
    ov0.querySelector('[data-src="file"]').onclick = function(){ H.closeOverlay(); csvImport(kind, "file"); };
    NS().tabs(prof().id).then(function(r){ var b = ov0.querySelector("#tbL"); if(!b) return; b.classList.remove("mut"); b.innerHTML = (r.tabs || []).length ? r.tabs.map(function(t){ return '<button class="ngRow card" data-tab="' + E(t) + '"><i>📗</i><span><b>' + E(t) + '</b></span>›</button>'; }).join("") : '<div class="mut small">' + L("Tiada tab lain. Salin data lama anda ke tab baharu dalam Sheet yang sama.", "No other tabs. Copy your old data into a new tab in the same Sheet.") + '</div>';
      b.querySelectorAll("[data-tab]").forEach(function(x){ x.onclick = function(){ NS().readtab(prof().id, x.getAttribute("data-tab")).then(function(rr){ H.closeOverlay(); var rows = (rr.rows || []).filter(function(r2){ return r2.some(function(v){ return String(v).trim(); }); }); if(rows.length < 2){ H.toast(L("Tiada baris data", "No data rows")); return; } csvMap(kind, rows); }, function(e){ H.toast("⚠️ " + (e && e.message || e)); }); }; }); }, function(e){ var b = ov0.querySelector("#tbL"); if(b) b.textContent = "⚠️ " + (e && e.message || e) + L(" (kemas kini skrip?)", " (update the script?)"); });
    return; }
  if(!kind){ var ov = H.showSheet("📊 " + L("Import CSV", "Import CSV"), '<div class="mut small">' + L("Dalam Excel atau Google Sheets: Fail › Simpan sebagai / Muat turun › CSV. Baris pertama ialah tajuk lajur.", "In Excel or Google Sheets: File › Save as / Download › CSV. The first row holds the column titles.") + '</div>' +
    [["cust", "👥", L("Pelanggan", "Customers")], ["item", "📦", L("Barang", "Items")], ["doc", "📄", L("Dokumen lama (invois & bayaran)", "Past documents (invoices & payments)")]].map(function(k){ return '<button class="ngRow card" data-ck="' + k[0] + '"><i>' + k[1] + '</i><span><b>' + k[2] + '</b></span>›</button>'; }).join("") +
    '<button class="btn alt full g3d" id="ckT">⬇️ ' + L("Muat turun templat CSV", "Download CSV templates") + '</button>');
    ov.querySelectorAll("[data-ck]").forEach(function(b){ b.onclick = function(){ H.closeOverlay(); csvImport(b.getAttribute("data-ck")); }; });
    ov.querySelector("#ckT").onclick = function(){ var rows = [["No. Invois","Tarikh","Pelanggan","Jumlah","Dibayar","Tarikh akhir","Jenis"],["INV-2025-0101","31/12/2025","Puan Aisyah","1250.50","500","14/01/2026","INV"]]; saveText("niaga-templat-dokumen.csv", N.csvMake(rows), "text/csv"); }; return; }
  openText(".csv,text/csv,text/plain", function(txt){ if(/^PK/.test(txt)){ H.toast(L("Fail Excel (.xlsx): simpan sebagai CSV dahulu", "Excel file (.xlsx): save it as CSV first")); return; } var rows = N.csvParse(txt); if(rows.length < 2){ H.toast(L("Tiada baris data", "No data rows")); return; } csvMap(kind, rows); }); }
function csvMap(kind, rows){ var F = CSVF[kind], head = rows[0], sav = (D.csvMap || {})[kind] || {}, mp = {};
  F.forEach(function(f){ var g = sav[f[0]] != null && head[sav[f[0]]] != null ? sav[f[0]] : head.findIndex(function(h){ return f[3].test(h); }); mp[f[0]] = g; });
  var ov = H.showSheet("📊 " + L("Padankan lajur", "Match the columns"), '<div class="mut small">' + (rows.length - 1) + L(" baris. Semak tekaan aplikasi.", " rows. Check the app's guesses.") + '</div>' +
    F.map(function(f){ return sel("cm_" + f[0], L(f[1], f[2]) + (f[4] ? " *" : ""), mp[f[0]], [[-1, "—"]].concat(head.map(function(h, i){ return [i, h || ("#" + (i + 1))]; }))); }).join("") + '<div id="cmPv"></div><button class="btn gold full g3d" id="cmOk" style="margin-top:10px">📥 ' + L("Import", "Import") + '</button>');
  var read = function(){ F.forEach(function(f){ mp[f[0]] = +gv(ov, "cm_" + f[0]); }); };
  var parse = function(){ read(); var p = prof(), out = []; rows.slice(1).forEach(function(r, i){ var g = function(k){ return mp[k] >= 0 ? String(r[mp[k]] == null ? "" : r[mp[k]]).trim() : ""; }, o = {row:i + 2, err:""};
      F.forEach(function(f){ o[f[0]] = g(f[0]); });
      if(kind === "cust" && !o.name) o.err = L("tiada nama", "no name");
      if(kind === "item"){ if(!o.name) o.err = L("tiada nama", "no name"); o.price = N.num(String(o.price).replace(/[^0-9.\-]/g, "")); }
      if(kind === "doc"){ o.date = N.pDate(o.date); o.due = N.pDate(o.due); o.total = N.num(String(o.total).replace(/[^0-9.\-]/g, "")); o.paid = N.num(String(o.paid).replace(/[^0-9.\-]/g, ""));
        o.type = /^(QT|INV|CS|OR|DO)$/i.test(o.type) ? o.type.toUpperCase() : "INV";
        if(!o.date) o.err = L("tarikh salah", "bad date"); else if(!(o.total > 0)) o.err = L("tiada jumlah", "no total"); else if(!o.no) o.err = L("tiada nombor", "no number");
        else if(N.usedNo(D, p.id, o.type, o.no) || out.some(function(x){ return x.no === o.no && x.type === o.type; })) o.err = L("nombor pendua", "duplicate number"); }
      out.push(o); }); return out; };
  var pv = function(){ var L0 = parse(), bad = L0.filter(function(o){ return o.err; }); ov.querySelector("#cmPv").innerHTML = '<div class="ngCsvPv">' + L0.slice(0, 20).map(function(o){ return '<div class="' + (o.err ? "bad" : "") + '"><span>' + o.row + '</span><b>' + E(o.name || o.no || "") + '</b><small>' + E(o.err || (kind === "doc" ? o.date + " · " + o.cust + " · " + o.total : kind === "item" ? o.price : o.phone)) + '</small></div>'; }).join("") + '</div><div class="mut small">' + (L0.length - bad.length) + L(" sah, ", " valid, ") + bad.length + L(" akan dilangkau", " will be skipped") + '</div>'; };
  ov.querySelectorAll("select").forEach(function(s){ s.addEventListener("change", pv); }); pv();
  ov.querySelector("#cmOk").onclick = function(){ var L0 = parse().filter(function(o){ return !o.err; }), p = prof(); D.csvMap = D.csvMap || {}; D.csvMap[kind] = N.clone(mp);
    L0.forEach(function(o){
      if(kind === "cust") saveCust({name:o.name, co:o.co, phone:o.phone, email:o.email, addr:o.addr, regNo:o.regNo}, p);
      else if(kind === "item"){ var it = {id:N.rid(), pid:p.id, name:o.name, desc:o.desc, unit:o.unit || "pcs", price:o.price, cost:o.cost, sku:o.sku, cat:o.cat}; N.stamp(D, it); D.items.push(it); }
      else { var c = saveCust({name:o.cust || "—"}, p), d = N.blankDoc(D, p, o.type); d.no = o.no; d.date = o.date; if(o.type === "INV") d.due = o.due || o.date; d.cust = snap(c); d.custId = c.id; d.status = "sent"; d.imported = true;
        d.lines = [{t:"item", desc:L("Diimport", "Imported") + " " + o.no, qty:1, unit:"lot", price:o.total}]; d.round = false; N.stamp(D, d); N.cache(D, d, p); D.docs.push(d); N.log(D, d.id, "import");
        var m = /(\d+)\s*$/.exec(o.no); if(m){ var cfg = N.numCfg(p, o.type), k = p.id + "|" + o.type + "|" + (cfg.reset === "month" ? o.date.slice(0, 7) : cfg.reset === "never" ? "all" : o.date.slice(0, 4)); if(N.fmtNo(cfg, +m[1], o.date, "") === o.no) D.ctr[k] = Math.max(D.ctr[k] || 0, +m[1]); }
        if(o.paid > 0 && o.type === "INV"){ var r = N.blankDoc(D, p, "OR"); r.no = "IMP-" + o.no; r.cust = d.cust; r.custId = c.id; r.date = r.pdate = o.date; r.method = "other"; r.apply = [{doc:d.id, amt:Math.min(o.paid, o.total)}]; r.status = "sent"; r.imported = true; r.silent = true; N.stamp(D, r); N.cache(D, r, p); D.docs.push(r); } } });
    sv(); H.closeOverlay(); draw(); H.toast("✅ " + L0.length + L(" diimport", " imported")); }; }

// ---------- entry ----------
window.FinMore = window.FinMore || {};
window.FinMore.niaga = function(el, A){ H = A.H; root = el; css(); render.rc = 0; render.ph = 0; if(!H.en) H.en = function(){ return false; }; ld();
  if(window.NiagaOpen){ var o = window.NiagaOpen; window.NiagaOpen = null; if(o.doc){ ST.vw = o.doc; ST.ed = null; } if(o.pg) ST.pg = o.pg; }
  if(NS()){ NS().init({H:H, D:function(){ return D; }, save:function(){ H.save(N.KEY, D); }, redraw:function(){ draw(); }, editing:function(){ return !!ST.ed; }, imgGet:function(id){ return imgGet(id); }, imgPut:function(id, v){ imgPut(id, v); }, alive:function(){ return !!(root && document.body.contains(root)); }, ver:window.APP_VER || "",
    loadJs:function(list, ok, bad){ var i = 0, nx = function(){ if(i >= list.length){ ok(); return; } var sc = document.createElement("script"); sc.src = list[i++]; sc.onload = nx; sc.onerror = bad || ok; document.body.appendChild(sc); }; nx(); },
    afterJoin:function(pid){ ld(); D.cur = pid; ST.wiz = 0; ST.pg = "papan"; ST.vw = null; ST.ed = null; H.save(N.KEY, D); draw(); }});
    var p0 = prof(); if(p0 && NS().link(p0.id)) setTimeout(function(){ NS().sync(p0.id); }, 600); }
  render(); };
window.NiagaView = {state:ST, data:function(){ return D; }, imgGet:function(id){ return imgGet(id); }, reload:function(){ ld(); draw(); }};
})();
