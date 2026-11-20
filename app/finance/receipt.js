/* My Ihsan 0.5.81 (owner): Split bill › Split a receipt. One receipt, no accounts:
   1. Photo of the receipt (camera or gallery). The online AI (Gemini by default, Settings › Online AI) lists every item with its price,
      plus the charges (service charge, SST/tax, rounding, discount) and the total. Everything stays editable; you can also type it in.
   2. How many people (names optional).
   3. Tick who had each item (one tap = everyone). A shared item is split evenly between the people ticked.
   4. Each person's total: their items + their part of the tax and charges (in proportion to what they had, or equally: a switch).
      Cents are shared with the largest-remainder rule so the totals add up exactly to the receipt. Share as text.
   The photo goes only to the chosen AI and is not stored; the list is kept on this phone until "New receipt".
   ReceiptSplit.open(H)  H = {esc, load, save, en, toast, share(text)} */
(function(){ "use strict";
var H = null, ov = null, R = null, KEY = "ihsan_receipt", busy = false, img = null, err = "";
function L(a, b){ return H.en() ? b : a; }
function E(s){ return H.esc(s == null ? "" : String(s)); }
// 0.5.83 (owner): a gallery: every receipt with items is kept in ihsan_receipts (newest first), with a small picture of the receipt
var KEYL = "ihsan_receipts";
function rid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function blank(){ return {id:rid(), t:Date.now(), shop:"", cur:"RM", items:[], ch:[], total:null, ppl:[L("Saya", "Me"), L("Orang 2", "Person 2")], mode:"prop"}; }
function list(){ var l = H.load(KEYL, null); return Array.isArray(l) ? l : []; }
function fix(r){ r.items = (r.items || []).map(function(it){ if(it.all === undefined && r.ppl && (it.who || []).length === r.ppl.length && it.who.length){ it.all = true; it.who = []; } return it; }); r.ch = r.ch || []; r.ppl = r.ppl && r.ppl.length ? r.ppl : blank().ppl; r.mode = r.mode || "prop"; if(!r.id) r.id = rid(); if(!r.t) r.t = Date.now(); return r; }
function load(id){ if(id === "new"){ var old = H.load(KEY, null); R = blank(); if(old && old.ppl) R.ppl = old.ppl.slice(); return; }
  if(id){ var x = list().filter(function(r){ return r.id === id; })[0]; if(x){ R = fix(JSON.parse(JSON.stringify(x))); return; } }
  R = fix(H.load(KEY, null) || blank()); }
function save(){ H.save(KEY, R); if(!R.items.length) return; var l = list().filter(function(r){ return r.id !== R.id; }), C = calc();
  R.u = Date.now(); R.sum = C.grand; l.unshift(JSON.parse(JSON.stringify(R))); H.save(KEYL, l.slice(0, 60)); }
function thumb(url){ return new Promise(function(res){ var im = new Image(); im.onload = function(){ var k = Math.min(1, 240/Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(im.naturalWidth*k); c.height = Math.round(im.naturalHeight*k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.6)); }; im.onerror = function(){ res(""); }; im.src = url; }); }
function c2(n){ return Math.round((+n || 0) * 100); }
function money(c){ var neg = c < 0; c = Math.abs(c); return (neg ? "−" : "") + R.cur + " " + (Math.floor(c / 100)).toLocaleString("en") + "." + ("0" + (c % 100)).slice(-2); }
function num(c){ return (c / 100).toFixed(2); }
// ---------- maths ----------
function spread(totalC, weights){ // largest remainder: integer cents that add up exactly to totalC, in proportion to weights
  var sw = weights.reduce(function(a, b){ return a + b; }, 0), n = weights.length; if(!n) return [];
  if(!sw) weights = weights.map(function(){ return 1; }), sw = n;
  var sign = totalC < 0 ? -1 : 1, T = Math.abs(totalC), raw = weights.map(function(w){ return T * w / sw; }), fl = raw.map(Math.floor), left = T - fl.reduce(function(a, b){ return a + b; }, 0);
  raw.map(function(r, i){ return [r - fl[i], i]; }).sort(function(a, b){ return b[0] - a[0] || a[1] - b[1]; }).slice(0, left).forEach(function(x){ fl[x[1]]++; });
  return fl.map(function(v){ return v * sign; }); }
function calc(){ var rot = 0, n = R.ppl.length, sub = R.ppl.map(function(){ return 0; }), lines = R.ppl.map(function(){ return []; }), unassigned = 0;
  R.items.forEach(function(it){ var who = it.all ? R.ppl.map(function(_, i){ return i; }) : (it.who || []).filter(function(i){ return i < n; }); if(!who.length){ unassigned += it.p; return; }
    var parts = spread(it.p, who.map(function(){ return 1; })), off = rot++ % who.length; who.forEach(function(i, k){ var pk = parts[(k - off + who.length) % who.length]; sub[i] += pk; lines[i].push([it.n + (who.length > 1 ? " (1/" + who.length + ")" : ""), pk]); }); });   // the odd cent moves round, item by item
  var chTot = R.ch.reduce(function(a, c){ return a + c.a; }, 0), chs = spread(chTot, R.mode === "eq" ? sub.map(function(){ return 1; }) : sub);
  var itemsTot = R.items.reduce(function(a, it){ return a + it.p; }, 0);
  return {sub:sub, ch:chs, tot:sub.map(function(s, i){ return s + (chs[i] || 0); }), lines:lines, unassigned:unassigned, itemsTot:itemsTot, chTot:chTot, grand:itemsTot + chTot}; }
// ---------- AI ----------
function prompt(){ return "Read this shop or restaurant receipt. Reply ONLY with JSON: {\"shop\": \"name\", \"currency\": \"RM or the code shown\", " +
  "\"items\": [{\"name\": \"item as printed, tidy capitalisation\", \"qty\": 1, \"amount\": 12.50}], \"charges\": [{\"name\": \"Service charge 10% | SST 6% | Rounding | Discount\", \"amount\": 1.25}], \"total\": 45.60}. " +
  "qty is the quantity column (a whole number, 1 if none). amount is the final line amount for that row (already multiplied by qty). " +
  "Put every service charge, service tax, SST, GST, VAT, tip, rounding adjustment and discount (negative) in charges, never in items, wherever it is printed: before or after the subtotal, before or after the total, or in a tax summary box. " +
  "Include a tax line even when its percentage is printed separately. If a tax is only stated as already included in the item prices, leave it out of charges. Do not include subtotal, cash paid or change due. Use numbers, not strings, for amounts."; }
function parseJson(t){ var m = String(t || "").replace(/```json|```/g, "").match(/\{[\s\S]*\}/); if(!m) return null; try{ return JSON.parse(m[0]); }catch(e){ return null; } }
function needAI(cb){ if(window.HalalAI){ cb(); return; } var s = document.createElement("script"); s.src = "halal/halal_ai.js"; s.onload = cb; s.onerror = function(){ H.toast(L("AI tidak dapat dimuatkan", "Could not load the AI")); }; document.head.appendChild(s); }
function shrink(url){ return new Promise(function(res){ var im = new Image(); im.onload = function(){ var k = Math.min(1, 1800/Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(im.naturalWidth*k); c.height = Math.round(im.naturalHeight*k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.85)); }; im.onerror = function(){ res(url); }; im.src = url; }); }
function pickImg(mode, cb){ // 0.5.82: the phone app's own picker (a web file input does nothing inside the Android app)
  var N = H.N, Nat = window.Native && N && N.pickImage;
  if(Nat){ var go = function(){ var h = function(r){ H.off("image", h); if(!r || r.cancel) return; if(r.error || !r.data){ H.toast(L("Gambar tidak dapat dibuka", "The image could not be opened")); return; } cb(r.data); }; H.on("image", h); N.pickImage(mode); };
    if(mode === "camera" && N.hasPerm && !N.hasPerm("camera")){ var hp = function(p){ if(!p || p.which !== "camera") return; H.off("perm", hp); if(p.granted) go(); else H.toast(L("Kebenaran kamera diperlukan", "Camera permission is needed")); }; H.on("perm", hp); N.requestPerm("camera"); } else go(); return; }
  var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; if(mode === "camera") inp.setAttribute("capture", "environment");
  inp.onchange = function(){ var f = inp.files && inp.files[0]; if(!f) return; var rd = new FileReader(); rd.onload = function(){ cb(rd.result); }; rd.readAsDataURL(f); }; inp.click(); }
function scan(dataUrl){ img = dataUrl; busy = true; err = ""; draw();
  needAI(function(){ shrink(dataUrl).then(function(u){ return window.HalalAI.complete([{role:"user", content:[{type:"text", text:prompt()}, {type:"image_url", image_url:{url:u}}]}], 2500, function(a, b){ return L(a, b); }, "", "receipt"); }).then(function(r){
    var j = parseJson(r.text); if(!j || !(j.items || []).length) throw new Error(L("Tiada item dijumpai. Cuba gambar yang lebih jelas, atau taip sendiri.", "No items found. Try a clearer photo, or type them in."));
    var all = R.ppl.map(function(_, i){ return i; });
    R.shop = j.shop || ""; R.cur = String(j.currency || R.cur || "RM").slice(0, 4);
    R.items = j.items.map(function(x){ return {n:String(x.name || "?"), q:Math.max(1, Math.round(+x.qty || 1)), p:c2(x.amount), all:true, who:[]}; }).filter(function(x){ return x.p !== 0; });   /* 0.5.85 (owner): All on, names off */
    R.ch = (j.charges || []).map(function(x){ return {n:String(x.name || ""), a:c2(x.amount)}; }).filter(function(x){ return x.a !== 0; });
    R.total = j.total != null ? c2(j.total) : null; var itT = R.items.reduce(function(a, it){ return a + it.p; }, 0);
    R.incl = "";
    var chT = R.ch.reduce(function(a, c){ return a + c.a; }, 0);
    if(R.total != null && R.ch.length && Math.abs(R.total - itT) <= 1 && Math.abs(R.total - itT - chT) > 1){   // the item prices already add up to the total: the tax printed is already inside them
      R.incl = R.ch.map(function(c){ return c.n + " " + money(c.a); }).join(", "); R.ch = []; }
    if(R.total != null && !R.ch.length && R.total - itT > 1) R.ch.push({n:L("Cukai & caj (dari jumlah resit)", "Tax & charges (from the receipt total)"), a:R.total - itT});   /* 0.5.85: tax printed anywhere still counts */
    R.total = j.total != null ? c2(j.total) : null; R.by = r.provider + " · " + r.model; busy = false; return thumb(dataUrl).then(function(th){ R.thumb = th; save(); return keepBig(dataUrl); }).then(function(){ draw();
    H.toast(L("Resit dibaca: ", "Receipt read: ") + R.items.length + L(" item", " items")); }); }).catch(function(e){ busy = false; err = String(e && e.message || e); draw(); }); }); }
// ---------- view ----------
function chips(it, idx){ var all = !!it.all;
  return '<div class="rcWho"><button class="rcAll' + (all ? ' on' : '') + '" data-all="' + idx + '">' + L("Semua", "All") + '</button>' + R.ppl.map(function(p, i){ var on = !all && (it.who || []).indexOf(i) >= 0;
    return '<button class="rcP c' + (i % 8) + (on ? ' on' : '') + '" data-tog="' + idx + '|' + i + '">' + (on ? '✓ ' : '') + E(p) + '</button>'; }).join("") + '</div>'; }
// 0.5.86 (owner): the receipt picture sits at the top (tap = full screen). A medium copy is kept per receipt (last 15) beside the small one.
function bigKey(id){ return "ihsan_rcimg_" + id; }
function keepBig(url){ return new Promise(function(res){ var im = new Image(); im.onload = function(){ var k = Math.min(1, 1100/Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(im.naturalWidth*k); c.height = Math.round(im.naturalHeight*k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
  var d = c.toDataURL("image/jpeg", 0.62), keep = list().slice(0, 15).map(function(r){ return r.id; }).concat([R.id]);
  try{ for(var i = localStorage.length - 1; i >= 0; i--){ var kk = localStorage.key(i); if(kk && kk.indexOf("ihsan_rcimg_") === 0 && keep.indexOf(kk.slice(12)) < 0) localStorage.removeItem(kk); } localStorage.setItem(bigKey(R.id), d); }catch(e){}
  res(); }; im.onerror = function(){ res(); }; im.src = url; }); }
function bigOf(){ try{ return localStorage.getItem(bigKey(R.id)) || img || R.thumb || ""; }catch(e){ return img || R.thumb || ""; } }
function zoom(){ var src = bigOf(); if(!src) return; var z = document.createElement("div"); z.className = "rcZoom"; z.innerHTML = '<img src="' + src + '" alt=""><button class="chip g3d">✕</button>'; z.onclick = function(){ z.remove(); }; ov.appendChild(z); }
// 0.5.86 (owner): no AI key yet: three easy steps to get a free Google Gemini key and paste it here
function aiKey(){ try{ var c = JSON.parse(localStorage.getItem("ihsan_halal_ai") || "{}") || {}; return !!(c.keys && Object.keys(c.keys).some(function(k){ return c.keys[k]; })); }catch(e){ return false; } }
function keyHtml(){ return '<div class="rcKey"><b>🔑 ' + L("Hidupkan kamera AI dalam 3 langkah (percuma)", "Turn on the AI camera in 3 steps (free)") + '</b><ol>' +
  '<li>' + L("Buka Google AI Studio:", "Open Google AI Studio:") + ' <button class="chip g3d" id="rcKeyGo">🌐 aistudio.google.com/apikey</button></li>' +
  '<li>' + L("Log masuk dengan akaun Google, ketik <b>Create API key</b>, kemudian <b>Copy</b>.", "Sign in with your Google account, tap <b>Create API key</b>, then <b>Copy</b>.") + '</li>' +
  '<li>' + L("Tampal di sini dan simpan:", "Paste it here and save:") + '<div class="rcRow"><input id="rcKeyIn" class="rcIn rcName" placeholder="AIza…" autocomplete="off"><button class="chip g3d" id="rcKeyPaste">📋</button><button class="btn gold g3d" id="rcKeySave">' + L("Simpan", "Save") + '</button></div></li></ol>' +
  '<div class="mut tiny">' + L("Kunci disimpan di telefon ini sahaja dan juga digunakan oleh ciri AI lain (Tetapan › AI dalam talian).", "The key stays on this phone and is also used by the other AI features (Settings › Online AI).") + '</div></div>'; }
function draw(){ if(!ov) return; var C = calc(), has = R.items.length > 0, diff = R.total != null ? R.total - C.grand : 0;
  var h = '<div class="rcTop"><button class="chip g3d" id="rcX">‹</button><b>🧾 ' + L("Bahagi resit", "Split a receipt") + '</b><button class="chip g3d" id="rcNew">＋ ' + L("Resit baharu", "New receipt") + '</button></div><div class="rcBody">';
  var pic = img || R.thumb; if(pic) h += '<button class="rcPic" id="rcPic"><img src="' + pic + '" alt=""><span>🔍 ' + L("Ketik untuk besarkan", "Tap to enlarge") + '</span></button>';
  // 1. receipt
  h += '<div class="card rcC"><div class="rcH"><span class="rcN">1</span><b>' + L("Resit", "Receipt") + '</b>' + (R.shop ? '<small>' + E(R.shop) + '</small>' : '') + '</div>';
  if(!aiKey()) h += keyHtml();
  if(window.AIRun) h += '<div class="aiBtnRow">' + AIRun.btn("receipt") + '</div>';
  if(busy) h += '<div class="rcWait"><span class="rcSpin"></span>' + L("AI sedang membaca resit…", "The AI is reading the receipt…") + '</div>' + (window.AIRun ? AIRun.card("receipt") : '');
  h += '<div class="rcScan"><button class="btn gold g3d" data-pick="camera">📷 ' + (has ? L("Imbas semula", "Scan again") : L("Ambil gambar resit", "Photo of the receipt")) + '</button>' +
    '<button class="btn alt g3d" data-pick="gallery">🖼️ ' + L("Galeri", "Gallery") + '</button></div>';
  if(err) h += '<div class="rcErr">⚠️ ' + E(err) + (window.AIRun ? '<div class="aiBtnRow" style="margin-top:8px;justify-content:flex-start">' + AIRun.btn("receipt") + '</div>' : '') + '</div>';
  if(img && !has) h += '<img class="rcImg" src="' + img + '" alt="">';
  if(has || !busy) h += '<div class="rcItems">' + R.items.map(function(it, i){ return '<div class="rcIt' + (it.all || (it.who || []).length ? '' : ' none') + '"><div class="rcRow"><input class="rcIn rcName" data-n="' + i + '" value="' + E(it.n) + '" placeholder="' + L("Item", "Item") + '">' +
      '<span class="rcCur">' + E(R.cur) + '</span><input class="rcIn rcAmt" data-p="' + i + '" inputmode="decimal" value="' + num(it.p) + '"><button class="rcDel" data-del="' + i + '" aria-label="✕">✕</button></div>' +
      (it.q > 1 ? '<div class="rcQty">' + it.q + ' × ' + money(Math.round(it.p / it.q)) + '<button class="chip g3d" data-unit="' + i + '">✂️ ' + L("Pecah kepada ", "Split into ") + it.q + ' ' + L("unit", "units") + '</button></div>' : '') + chips(it, i) + '</div>'; }).join("") +
    '<button class="btn alt g3d full" id="rcAdd">＋ ' + L("Tambah item", "Add an item") + '</button></div>';
  // charges
  h += '<div class="rcCh"><b>' + L("Cukai & caj", "Tax & charges") + '</b>' + R.ch.map(function(c, i){ return '<div class="rcRow"><input class="rcIn rcName" data-cn="' + i + '" value="' + E(c.n) + '"><span class="rcCur">' + E(R.cur) + '</span><input class="rcIn rcAmt" data-ca="' + i + '" inputmode="decimal" value="' + num(c.a) + '"><button class="rcDel" data-cdel="' + i + '">✕</button></div>'; }).join("") +
    '<div class="rcAddCh"><button class="chip g3d" data-qc="sst">＋ SST 6%</button><button class="chip g3d" data-qc="svc">＋ ' + L("Caj servis 10%", "Service 10%") + '</button><button class="chip g3d" data-qc="oth">＋ ' + L("Lain", "Other") + '</button></div></div>';
  if(R.incl) h += '<div class="rcIncl">ℹ️ ' + L("Sudah termasuk dalam harga item: ", "Already included in the item prices: ") + E(R.incl) + '</div>';
  h += '<div class="rcSum"><span>' + L("Item", "Items") + '</span><b>' + money(C.itemsTot) + '</b><span>' + L("Cukai & caj", "Tax & charges") + '</span><b>' + money(C.chTot) + '</b><span>' + L("Jumlah", "Total") + '</span><b class="big">' + money(C.grand) + '</b></div>' +
    (R.total != null && Math.abs(diff) > 1 ? '<div class="rcWarn">⚠️ ' + L("Resit tertulis ", "The receipt says ") + money(R.total) + L(", beza ", ", a difference of ") + money(diff) + L(". Semak item atau caj.", ". Check the items or charges.") + ' <button class="chip g3d" id="rcDiff">＋ ' + L("Tambah beza sebagai caj", "Add the difference as a charge") + '</button></div>' : (R.total != null && has ? '<div class="rcOk">✓ ' + L("Sama dengan jumlah resit", "Matches the receipt total") + '</div>' : '')) +
    (R.by ? '<div class="mut tiny">' + L("Dibaca oleh ", "Read by ") + E(R.by) + '</div>' : '') + '</div>';
  // 2. people
  h += '<div class="card rcC"><div class="rcH"><span class="rcN">2</span><b>' + L("Berapa orang?", "How many people?") + '</b></div><div class="rcStep"><button class="rcSB" id="rcMinus">−</button><b>' + R.ppl.length + '</b><button class="rcSB" id="rcPlus">＋</button></div>' +
    '<div class="rcNames">' + R.ppl.map(function(p, i){ return '<input class="rcIn rcPN c' + (i % 8) + '" data-pn="' + i + '" value="' + E(p) + '" maxlength="16">'; }).join("") + '</div><div class="mut tiny">' + L("Ketik nama untuk tukar.", "Tap a name to change it.") + '</div></div>';
  // 3. hint
  if(has) h += '<div class="card rcC rcHint"><div class="rcH"><span class="rcN">3</span><b>' + L("Siapa makan apa?", "Who had what?") + '</b></div><div class="small">' + L("Di setiap item di atas, ketik nama orang yang berkongsi item itu. Item yang dikongsi dibahagi sama rata. ", "On each item above, tap the people who had it. A shared item is split evenly. ") +
    (C.unassigned ? '<b class="rcBad">' + L("Belum ditanda: ", "Not ticked yet: ") + money(C.unassigned) + '</b>' : '<b class="rcGood">✓ ' + L("Semua item sudah ditanda", "Every item is ticked") + '</b>') + '</div>' +
    '<div class="rcMode"><span>' + L("Cukai & caj dibahagi", "Share tax & charges") + '</span><button class="chip g3d' + (R.mode === "prop" ? ' on' : '') + '" data-mode="prop">' + L("ikut nilai item", "by what each had") + '</button><button class="chip g3d' + (R.mode === "eq" ? ' on' : '') + '" data-mode="eq">' + L("sama rata", "equally") + '</button></div></div>';
  // 4. result
  if(has) h += '<div class="card rcC"><div class="rcH"><span class="rcN">4</span><b>' + L("Setiap orang bayar", "Each person pays") + '</b></div><div class="rcRes">' + R.ppl.map(function(p, i){
      return '<details class="rcPer c' + (i % 8) + '"><summary><span>' + E(p) + '</span><b>' + money(C.tot[i]) + '</b></summary><div class="rcLines">' + C.lines[i].map(function(l){ return '<div><span>' + E(l[0]) + '</span><span>' + money(l[1]) + '</span></div>'; }).join("") +
        (C.ch[i] ? '<div class="rcChL"><span>' + L("Cukai & caj", "Tax & charges") + '</span><span>' + money(C.ch[i]) + '</span></div>' : '') + '</div></details>'; }).join("") + '</div>' +
    '<button class="btn gold full g3d" id="rcShare" style="margin-top:10px">📤 ' + L("Kongsi ke WhatsApp / chat", "Share to WhatsApp / chat") + '</button></div>';
  if(has) h += '<div class="rcSaved">✓ ' + L("Disimpan dalam galeri resit", "Saved in the receipt gallery") + ' · <button class="chip" id="rcDelR">🗑️ ' + L("Padam", "Delete") + '</button></div>';
  h += '<div class="mut tiny" style="padding:8px 4px 30px">' + L("Gambar resit dihantar hanya kepada AI yang dipilih dalam Tetapan › AI dalam talian, dan tidak disimpan.", "The receipt photo goes only to the AI chosen in Settings › Online AI and is not stored.") + '</div></div>';
  var y = ov.querySelector(".rcBody") ? ov.querySelector(".rcBody").scrollTop : 0; ov.innerHTML = h; var nb = ov.querySelector(".rcBody"); if(nb) nb.scrollTop = y; bind(); }
function shareText(){ var C = calc(); return "🧾 " + (R.shop || L("Resit", "Receipt")) + " · " + L("Jumlah ", "Total ") + money(C.grand) + "\n" +
  R.ppl.map(function(p, i){ return "• " + p + ": " + money(C.tot[i]); }).join("\n") + "\n(" + L("Cukai & caj dibahagi ", "Tax & charges shared ") + (R.mode === "eq" ? L("sama rata", "equally") : L("ikut nilai item", "by what each had")) + ")\nMy Ihsan · " + L("Bahagi resit", "Split a receipt"); }
function bind(){ var q = function(s){ return ov.querySelector(s); }, all = function(s, f){ ov.querySelectorAll(s).forEach(f); };
  q("#rcX").onclick = close;
  q("#rcNew").onclick = function(){ var ppl = R.ppl; R = blank(); R.ppl = ppl.slice(); img = null; err = ""; save(); draw(); };
  if(q("#rcDelR")) q("#rcDelR").onclick = function(){ var b = q("#rcDelR"); if(!b.classList.contains("sure")){ b.classList.add("sure"); b.textContent = "🗑️ " + L("Ketik sekali lagi untuk padam", "Tap again to delete"); return; } H.save(KEYL, list().filter(function(r){ return r.id !== R.id; })); H.save(KEY, null); close(); };
  all("[data-pick]", function(x){ x.onclick = function(){ if(busy) return; pickImg(x.getAttribute("data-pick"), scan); }; });
  all("[data-n]", function(x){ x.onchange = function(){ R.items[+x.getAttribute("data-n")].n = x.value; save(); }; });
  all("[data-p]", function(x){ x.onchange = function(){ R.items[+x.getAttribute("data-p")].p = c2(x.value.replace(",", ".")); save(); draw(); }; });
  all("[data-del]", function(x){ x.onclick = function(){ R.items.splice(+x.getAttribute("data-del"), 1); save(); draw(); }; });
  all("[data-cn]", function(x){ x.onchange = function(){ R.ch[+x.getAttribute("data-cn")].n = x.value; save(); }; });
  all("[data-ca]", function(x){ x.onchange = function(){ R.ch[+x.getAttribute("data-ca")].a = c2(x.value.replace(",", ".")); save(); draw(); }; });
  all("[data-cdel]", function(x){ x.onclick = function(){ R.ch.splice(+x.getAttribute("data-cdel"), 1); save(); draw(); }; });
  all("[data-qc]", function(x){ x.onclick = function(){ var k = x.getAttribute("data-qc"), base = R.items.reduce(function(a, it){ return a + it.p; }, 0), svc = R.ch.filter(function(c){ return /servi/i.test(c.n); }).reduce(function(a, c){ return a + c.a; }, 0);
    if(k === "svc") R.ch.push({n:L("Caj servis 10%", "Service charge 10%"), a:Math.round(base*0.10)});
    else if(k === "sst") R.ch.push({n:"SST 6%", a:Math.round((base + svc)*0.06)});
    else R.ch.push({n:L("Caj lain", "Other charge"), a:0}); save(); draw(); }; });
  all("[data-tog]", function(x){ x.onclick = function(){ var a = x.getAttribute("data-tog").split("|"), it = R.items[+a[0]], p = +a[1];
    if(it.all){ it.all = false; it.who = [p]; } else { it.who = it.who || []; var k = it.who.indexOf(p); if(k >= 0) it.who.splice(k, 1); else it.who.push(p); it.who.sort(); }   // 0.5.85: the first name picked replaces "All"
    save(); draw(); }; });
  all("[data-all]", function(x){ x.onclick = function(){ var it = R.items[+x.getAttribute("data-all")]; it.all = !it.all; it.who = []; save(); draw(); }; });
  all("[data-unit]", function(x){ x.onclick = function(){ var i = +x.getAttribute("data-unit"), it = R.items[i], q = it.q, parts = spread(it.p, Array.apply(null, Array(q)).map(function(){ return 1; }));
    var units = parts.map(function(pc, k){ return {n:it.n + " (" + (k + 1) + "/" + q + ")", q:1, p:pc, all:it.all, who:(it.who || []).slice(), unit:1}; });
    R.items.splice.apply(R.items, [i, 1].concat(units)); save(); draw(); }; });   // 0.5.85: 5 × Nasi putih -> five rows, each given to anyone
  if(q("#rcDiff")) q("#rcDiff").onclick = function(){ var C = calc(); R.ch.push({n:L("Beza dengan jumlah resit", "Difference to the receipt total"), a:R.total - C.grand}); save(); draw(); };
  if(q("#rcAdd")) q("#rcAdd").onclick = function(){ R.items.push({n:"", q:1, p:0, all:true, who:[]}); save(); draw(); var ins = ov.querySelectorAll("[data-n]"); if(ins.length) ins[ins.length - 1].focus(); };
  q("#rcMinus").onclick = function(){ if(R.ppl.length <= 1) return; var gone = R.ppl.length - 1; R.ppl.pop(); R.items.forEach(function(it){ it.who = (it.who || []).filter(function(i){ return i !== gone; }); }); save(); draw(); };
  q("#rcPlus").onclick = function(){ if(R.ppl.length >= 30) return; R.ppl.push(L("Orang ", "Person ") + (R.ppl.length + 1)); save(); draw(); };   // items on "All" include the new person
  all("[data-pn]", function(x){ var i = +x.getAttribute("data-pn");   // 0.5.86 (owner): tap a name and the box empties for typing; left empty, the name stays
    x.onfocus = function(){ x.placeholder = R.ppl[i]; x.value = ""; };
    x.onkeydown = function(e){ if(e.key === "Enter") x.blur(); };
    x.onblur = function(){ var v = x.value.trim(); if(v && v !== R.ppl[i]){ R.ppl[i] = v; save(); draw(); } else x.value = R.ppl[i]; }; });
  if(q("#rcPic")) q("#rcPic").onclick = zoom;
  if(q("#rcKeyGo")) q("#rcKeyGo").onclick = function(){ var u = "https://aistudio.google.com/apikey", N = H.N; if(window.Native && N && N.openWeb) N.openWeb(u, "Google AI Studio"); else if(N && N.openUrl) N.openUrl(u); else window.open(u, "_blank"); };
  if(q("#rcKeyPaste")) q("#rcKeyPaste").onclick = function(){ var inp = q("#rcKeyIn"), done = function(t){ if(t) inp.value = String(t).trim(); };
    try{ if(H.N && H.N.getClipboard){ done(H.N.getClipboard()); return; } navigator.clipboard.readText().then(done, function(){ inp.focus(); }); }catch(e){ inp.focus(); } };
  if(q("#rcKeySave")) q("#rcKeySave").onclick = function(){ var k = (q("#rcKeyIn").value || "").trim();
    if(!/^AIza[\w-]{20,}$/.test(k)){ H.toast(L("Kunci Google bermula dengan AIza…, tampal semula", "A Google key starts with AIza…, paste it again")); return; }
    try{ var c = JSON.parse(localStorage.getItem("ihsan_halal_ai") || "{}") || {}; c.prov = "gemini"; c.on = true; c.keys = c.keys || {}; c.keys.gemini = k; localStorage.setItem("ihsan_halal_ai", JSON.stringify(c)); }catch(e){}
    H.toast("✓ " + L("Kamera AI dihidupkan", "AI camera turned on")); draw(); };
  all("[data-mode]", function(x){ x.onclick = function(){ R.mode = x.getAttribute("data-mode"); save(); draw(); }; });
  if(q("#rcShare")) q("#rcShare").onclick = function(){ H.share(shareText()); }; }
function notches(on){ document.body.classList.toggle("rcOpen", on); document.querySelectorAll(".edgeN").forEach(function(b){ if(on && !b._rc){ b._rc = function(){ if(ov) close(); }; b.addEventListener("click", b._rc, true); } }); }
function close(){ notches(false); var o = ov; ov = null; if(H.close) H.close(); else if(o){ o.innerHTML = ""; o.className = "hidden"; } if(H.onClose) try{ H.onClose(); }catch(e){} }
window.ReceiptSplit = {list:function(h){ if(h) H = h; return list(); }, open:function(h, id){ H = h; img = null; err = ""; load(id); ov = document.getElementById("overlay"); ov.className = "rcov"; ov._close = close; notches(true); draw(); },
  _calc:function(){ return calc(); }, _spread:spread, _scan:scan, _set:function(r){ R = r; save(); draw(); }};
})();
