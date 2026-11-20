/* My Ihsan 0.6.35 (owner): Niaga › 🛒 Jual: a simple till for stalls, roadside and small shops.
   - Item tiles (photo, or emoji + colour), tap = +1, hold = change the number; a counter on each tile shows today's sold count.
   - 🔢 Calculator till for things without a tile (amounts add to the basket, × for quantity).
   - Pay: cash with quick notes and change, DuitNow / e-wallet (shows your shop QR to the customer), card. Discount if needed.
   - Receipt only if the customer wants: a picture to photograph or send by WhatsApp, or a QR they scan with their phone camera.
   - ⚡ Tap-to-sell mode: every tap is a finished cash sale (busy stall, one-item sales), with undo.
   - 📅 Day view: go back to any day; totals, by payment, cash in the drawer, items sold, sales by hour, every sale (open, re-ring, void with a reason).
     "Close the day" saves the day as one Cash Sale (Bil Tunai) document so it counts in the Dashboard, reports and the Google Sheet.
   - Park up to 3 baskets, optional stock count per item, categories, tile size, opening cash float.
   Data: ihsan_biz.sales [{id, pid, no, t, day, lines:[{i,n,p,q}], sub, disc, tot, m, cash, chg, void, closed}], ihsan_biz.items (+ img, emo, col, stock, pos),
   profile.pos {float, qr, sz, instant, stock, home, foot}. Basket kept in ihsan_pos_cart so it survives closing the app.
   NiagaPos.view(el, X) · NiagaPos.daySum(D, pid, day) */
(function(){ "use strict";
var N = window.NiagaDoc, X = null, H = null, ST = {tab:"sell", cat:"", day:"", calc:"", q:""};
var EMO = ["🍗","🍚","🍜","🍲","🍛","🥘","🍢","🍡","🥟","🍞","🥐","🍩","🍰","🧁","🍪","🍌","🍉","🥥","🥭","🧃","🥤","☕","🍵","🧋","🍦","🍧","🌽","🥚","🐟","🦐","🌶️","🥬","🍎","🍊","🍓","🥭","🍍","🧇","🥪","🌯","🍔","🍟","🍕","📦","👕","🧴","🧼","🔧","✂️","🌸","🎈","⛽"];
var COL = ["#c0392b","#d35400","#b7950b","#1e8449","#117a65","#1f618d","#6c3483","#a93226","#5d6d7e","#7b4a12"];
var METH = [["cash","💵","Tunai","Cash"],["qr","📱","DuitNow QR","DuitNow QR"],["ewallet","👛","e-Dompet","e-Wallet"],["card","💳","Kad","Card"]];
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function D(){ return X.D(); }
function P(){ return X.prof(); }
function cfg(){ var p = P(); p.pos = p.pos || {}; return p.pos; }
function m(c){ return X.money(c); }
function vib(){ try{ if(window.Native && H.N.vibrate) H.N.vibrate(10); }catch(e){} }
function now(){ return new Date(); }
function today(){ return N.ymd(now()); }
function hm(t){ var d = new Date(t); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
// ---------- data ----------
function sales(){ var d = D(); if(!Array.isArray(d.sales)) d.sales = []; return d.sales; }
function items(){ var p = P(); return N.live(D().items).filter(function(x){ return x.pid === p.id && x.pos !== false; }).sort(function(a, b){ return (+a.ord || 0) - (+b.ord || 0) || (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || String(a.name).localeCompare(b.name); }); }
function cats(){ var s = {}; items().forEach(function(x){ if(x.cat) s[x.cat] = 1; }); return Object.keys(s).sort(); }
function daySales(day, pid){ pid = pid || P().id; return N.live(sales()).filter(function(s){ return s.pid === pid && s.day === day; }).sort(function(a, b){ return a.t < b.t ? 1 : -1; }); }
function daySum(Dd, pid, day){ var o = {tot:0, n:0, by:{}, items:{}, hrs:[], voids:0}; for(var h = 0; h < 24; h++) o.hrs.push(0);
  N.live(Dd.sales || []).forEach(function(s){ if(s.pid !== pid || s.day !== day) return; if(s.void){ o.voids++; return; } o.tot += s.tot; o.n++; o.by[s.m] = (o.by[s.m] || 0) + s.tot; o.hrs[new Date(s.t).getHours()] += s.tot;
    (s.lines || []).forEach(function(l){ var k = l.i || ("~" + l.n); var it = o.items[k] = o.items[k] || {n:l.n, q:0, a:0}; it.q += l.q; it.a += l.p * l.q; }); });
  return o; }
function soldToday(){ var o = {}; daySales(today()).forEach(function(s){ if(s.void) return; (s.lines || []).forEach(function(l){ if(l.i) o[l.i] = (o[l.i] || 0) + l.q; }); }); return o; }
// basket (kept on the phone); held baskets too
function cart(){ var c = H.load("ihsan_pos_cart", null); if(!c || !Array.isArray(c.lines)) c = {lines:[], held:[]}; if(!Array.isArray(c.held)) c.held = []; return c; }
function keepCart(c){ H.save("ihsan_pos_cart", c); }
function cartTot(c){ return c.lines.reduce(function(a, l){ return a + l.p * l.q; }, 0); }
function cartN(c){ return c.lines.reduce(function(a, l){ return a + l.q; }, 0); }
function addLine(c, it, q){ var l = it.id ? c.lines.filter(function(x){ return x.i === it.id; })[0] : null; if(l) l.q += q; else c.lines.push({i:it.id || "", n:it.name, p:it.id ? N.sen(it.price) : it.p, q:q}); c.lines = c.lines.filter(function(x){ return x.q > 0; }); }
function nextNo(day){ var p = P(), n = sales().filter(function(s){ return s.pid === p.id && s.day === day; }).length + 1; return "J" + day.slice(2).replace(/-/g, "") + "-" + ("00" + n).slice(-3); }
function record(lines, o){ var p = P(), t = now(), day = N.ymd(t), sub = lines.reduce(function(a, l){ return a + l.p * l.q; }, 0), disc = Math.min(sub, o.disc || 0), tot = sub - disc;
  if(p.round5 && o.m === "cash") tot = Math.round(tot / 5) * 5;
  var s = {id:N.rid(), pid:p.id, no:nextNo(day), t:t.toISOString(), day:day, lines:lines.map(function(l){ return {i:l.i, n:l.n, p:l.p, q:l.q}; }), sub:sub, disc:disc, tot:tot, m:o.m || "cash", cash:o.cash || 0, chg:o.cash ? Math.max(0, o.cash - tot) : 0, cust:o.cust || "", void:null, closed:""};
  N.stamp(D(), s); sales().push(s); stockMove(s, -1); X.sv(); return s; }
function stockMove(s, dir){ if(!cfg().stock) return; (s.lines || []).forEach(function(l){ var it = l.i && N.byId(D().items, l.i); if(it && it.stock !== "" && it.stock != null){ it.stock = Math.round((+it.stock + dir * l.q) * 1000) / 1000; N.stamp(D(), it); } }); }
function voidSale(s, why){ s.void = {t:now().toISOString(), why:why || ""}; stockMove(s, 1); N.stamp(D(), s); X.sv(); }
// ---------- view ----------
function view(el, x){ X = x; H = x.H; css(); if(!ST.day) ST.day = today(); var tabs = [["sell","🛒","Jual","Sell"],["calc","🔢","Kalkulator","Calculator"],["day","📅","Hari ini","Today"],["set","⚙️","Barang","Items"]];
  el.innerHTML = '<div class="psTabs">' + tabs.map(function(t){ return '<button class="' + (ST.tab === t[0] ? "on" : "") + '" data-pst="' + t[0] + '">' + t[1] + ' ' + L(t[2], t[3]) + '</button>'; }).join("") + '</div><div id="psBody"></div>';
  el.querySelectorAll("[data-pst]").forEach(function(b){ b.onclick = function(){ ST.tab = b.getAttribute("data-pst"); if(ST.tab === "day") ST.day = today(); view(el, x); }; });
  var b = el.querySelector("#psBody"); ({sell:vSell, calc:vCalc, day:vDay, set:vSet}[ST.tab] || vSell)(b, el); }
function bar(c, el){ var n = cartN(c), held = c.held.length;
  return '<div class="psBar' + (n ? "" : " empty") + '"><button class="psCartB" id="psCart"><b>🧺 ' + n + '</b><span>' + m(cartTot(c)) + '</span></button>' +
    (n ? '<button class="psSm" id="psHold" title="' + L("Tahan", "Park") + '">⏸</button><button class="psSm" id="psClr" title="' + L("Kosongkan", "Clear") + '">✕</button>' : (held ? '<button class="psSm" id="psHeld">⏸ ' + held + '</button>' : '')) +
    '<button class="psPay" id="psPay"' + (n ? '' : ' disabled') + '>💰 ' + L("Bayar", "Pay") + '</button></div>'; }
var pinT = 0;
function notchTop(){ var n = document.getElementById("notch"); if(n && !n.classList.contains("hidden") && !n.classList.contains("none") && n.getClientRects().length) return Math.max(0, window.innerHeight - n.getBoundingClientRect().top); return 6; }
function pin(){ clearInterval(pinT); var place = function(){ var b = document.querySelector(".psBar"); if(!b || !document.body.contains(b)){ clearInterval(pinT); return; } var bot = notchTop() + 6; if(b.style.bottom !== bot + "px") b.style.bottom = bot + "px";
    var u = document.getElementById("psUndo"); if(u) u.style.bottom = (bot + b.offsetHeight + 8) + "px"; }; place(); pinT = setInterval(place, 300); }
function bindBar(root, el){ pin(); var c = cart(), on = function(id, f){ var b = root.querySelector(id); if(b) b.onclick = f; };
  on("#psPay", function(){ checkout(el); }); on("#psCart", function(){ if(cartN(cart())) cartSheet(el); });
  on("#psClr", function(){ var cc = cart(), old = JSON.stringify(cc.lines); cc.lines = []; keepCart(cc); view(el, X); undoToast(L("Troli dikosongkan", "Basket cleared"), function(){ var c2 = cart(); c2.lines = JSON.parse(old); keepCart(c2); view(el, X); }); });
  on("#psHold", function(){ var cc = cart(); if(cc.held.length >= 3){ H.toast(L("Maksimum 3 troli ditahan", "Up to 3 parked baskets")); return; } cc.held.push({t:now().toISOString(), lines:cc.lines}); cc.lines = []; keepCart(cc); H.toast("⏸ " + L("Troli ditahan", "Basket parked")); view(el, X); });
  on("#psHeld", function(){ heldSheet(el); }); }
function vSell(b, el){ var c = cart(), list = items(), cs = cats(), sold = soldToday(), q = (ST.q || "").toLowerCase(), cf = cfg(), sz = cf.sz || "m", inst = !!cf.instant;
  if(ST.cat && cs.indexOf(ST.cat) < 0) ST.cat = "";
  var show = list.filter(function(x){ return (!ST.cat || x.cat === ST.cat) && (!q || String(x.name).toLowerCase().indexOf(q) >= 0); });
  var inC = {}; c.lines.forEach(function(l){ if(l.i) inC[l.i] = l.q; });
  var h = '<div class="psHead">' + (list.length > 8 ? '<input id="psQ" class="ilq" placeholder="🔍 ' + L("Cari barang", "Find an item") + '" value="' + E(ST.q) + '">' : '') +
    '<button class="chip' + (inst ? " on" : "") + '" id="psInst" title="' + L("Setiap ketukan = satu jualan tunai", "Every tap = one cash sale") + '">⚡ ' + L("Ketuk-jual", "Tap-to-sell") + '</button></div>' +
    (cs.length ? '<div class="psCats"><button class="chip' + (!ST.cat ? " on" : "") + '" data-psc="">' + L("Semua", "All") + '</button>' + cs.map(function(k){ return '<button class="chip' + (ST.cat === k ? " on" : "") + '" data-psc="' + E(k) + '">' + E(k) + '</button>'; }).join("") + '</div>' : '') +
    (inst ? '<div class="psInstN">⚡ ' + L("Mod ketuk-jual: setiap ketukan direkod sebagai jualan tunai. Tekan lama untuk bilangan lain.", "Tap-to-sell: every tap is saved as a cash sale. Hold for another number.") + '</div>' : '') +
    '<div class="psGrid sz-' + sz + '">' + show.map(function(x){ var img = x.img ? X.imgGet(x.img) : "", out = cf.stock && x.stock !== "" && x.stock != null && +x.stock <= 0, col = x.col || COL[Math.abs(hash(x.name)) % COL.length];
      return '<button class="psT' + (out ? " out" : "") + '" data-psi="' + x.id + '" style="--c:' + col + '">' + (img ? '<img src="' + img + '" alt="">' : '<i>' + E(x.emo || initials(x.name)) + '</i>') +
        '<span class="psTn">' + E(x.name) + '</span><span class="psTp">' + m(N.sen(x.price)) + '</span>' + (inC[x.id] ? '<em class="psQ">' + inC[x.id] + '</em>' : '') +
        (sold[x.id] ? '<small class="psS">' + sold[x.id] + '</small>' : '') + (cf.stock && x.stock !== "" && x.stock != null ? '<small class="psK' + (+x.stock <= (+x.low || 3) ? " low" : "") + '">' + L("Stok ", "Stock ") + (+x.stock) + '</small>' : '') + '</button>'; }).join("") +
    '<button class="psT add" id="psAdd"><i>＋</i><span class="psTn">' + L("Barang baharu", "New item") + '</span></button></div>' +
    (!list.length ? '<div class="card mut small">' + L("Tambah barang yang anda jual (nama, harga, gambar atau emoji). Untuk jualan tanpa barang, guna 🔢 Kalkulator.", "Add what you sell (name, price, a photo or emoji). For sales without an item, use 🔢 Calculator.") + '</div>' : '') +
    bar(c, el);
  b.innerHTML = h; bindBar(b, el);
  var qi = b.querySelector("#psQ"); if(qi) qi.oninput = function(){ ST.q = qi.value; var p0 = qi.selectionStart; vSell(b, el); var n2 = b.querySelector("#psQ"); n2.focus(); try{ n2.setSelectionRange(p0, p0); }catch(e){} };
  b.querySelector("#psInst").onclick = function(){ cfg().instant = !cfg().instant; N.stamp(D(), P()); X.sv(); vSell(b, el); };
  b.querySelectorAll("[data-psc]").forEach(function(x){ x.onclick = function(){ ST.cat = x.getAttribute("data-psc"); vSell(b, el); }; });
  b.querySelector("#psAdd").onclick = function(){ itemSheet({}, function(){ vSell(b, el); }); };
  b.querySelectorAll("[data-psi]").forEach(function(t){ var id = t.getAttribute("data-psi"), it = N.byId(D().items, id), tm = null, long = false;
    var down = function(){ long = false; tm = setTimeout(function(){ long = true; vib(); qtySheet(it, el); }, 480); };
    var cancel = function(){ clearTimeout(tm); };
    t.addEventListener("pointerdown", down); t.addEventListener("pointerup", cancel); t.addEventListener("pointerleave", cancel); t.addEventListener("pointercancel", cancel);
    t.oncontextmenu = function(e){ e.preventDefault(); };
    t.onclick = function(){ if(long) return; vib(); tapItem(it, 1, el); }; }); }
function tapItem(it, q, el){ if(cfg().instant){ var s = record([{i:it.id, n:it.name, p:N.sen(it.price), q:q}], {m:"cash"}); view(el, X); if(prnCfg().auto && prnCfg().addr) printSale(s);
    undoToast("⚡ " + it.name + " × " + q + " · " + m(s.tot), function(){ voidSale(s, L("Dibatalkan segera", "Undone")); view(el, X); }); return; }
  var c = cart(); addLine(c, it, q); keepCart(c); view(el, X); }
function hash(s){ var h = 0; s = String(s || ""); for(var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
function initials(n){ return String(n || "?").split(/\s+/).slice(0, 2).map(function(w){ return w.charAt(0).toUpperCase(); }).join(""); }
function undoToast(msg, undo){ var o = document.getElementById("psUndo"); if(o) o.remove(); o = document.createElement("div"); o.id = "psUndo"; o.className = "psUndo";
  o.innerHTML = '<span>' + E(msg) + '</span><button>↶ ' + L("Batal", "Undo") + '</button>'; document.body.appendChild(o);
  o.querySelector("button").onclick = function(){ o.remove(); undo(); }; var b = document.querySelector(".psBar"); o.style.bottom = ((b ? parseInt(b.style.bottom || "0", 10) + b.offsetHeight : notchTop()) + 10) + "px"; clearTimeout(undoToast.t); undoToast.t = setTimeout(function(){ if(o.parentNode) o.remove(); }, 6000); }
function qtySheet(it, el){ var c = cart(), l = c.lines.filter(function(x){ return x.i === it.id; })[0], q = l ? l.q : 0, inst = cfg().instant;
  var ov = H.showSheet((it.emo || "📦") + " " + E(it.name), '<div class="psQty"><button class="btn alt" data-qd="-1">−</button><input id="psQn" type="number" inputmode="numeric" min="0" value="' + (inst ? 1 : q || 1) + '"><button class="btn alt" data-qd="1">＋</button></div>' +
    '<div class="psQuick">' + [2, 3, 5, 10, 20].map(function(n){ return '<button class="chip" data-qs="' + n + '">× ' + n + '</button>'; }).join("") + '</div>' +
    '<div class="btns"><button class="btn gold" id="psQok" style="flex:1">✓ ' + (inst ? L("Jual", "Sell") : L("Tetapkan", "Set")) + '</button>' + (l && !inst ? '<button class="btn alt" id="psQx">🗑</button>' : '') + '<button class="btn alt" id="psQe">✏️</button></div>');
  var inp = ov.querySelector("#psQn");
  ov.querySelectorAll("[data-qd]").forEach(function(b){ b.onclick = function(){ inp.value = Math.max(0, (+inp.value || 0) + +b.getAttribute("data-qd")); }; });
  ov.querySelectorAll("[data-qs]").forEach(function(b){ b.onclick = function(){ inp.value = b.getAttribute("data-qs"); }; });
  ov.querySelector("#psQok").onclick = function(){ var n = Math.max(0, Math.round(+inp.value || 0)); H.closeOverlay(); if(inst){ if(n) tapItem(it, n, el); return; } var cc = cart(), ln = cc.lines.filter(function(x){ return x.i === it.id; })[0];
    if(ln) ln.q = n; else if(n) cc.lines.push({i:it.id, n:it.name, p:N.sen(it.price), q:n}); cc.lines = cc.lines.filter(function(x){ return x.q > 0; }); keepCart(cc); view(el, X); };
  var x = ov.querySelector("#psQx"); if(x) x.onclick = function(){ var cc = cart(); cc.lines = cc.lines.filter(function(z){ return z.i !== it.id; }); keepCart(cc); H.closeOverlay(); view(el, X); };
  ov.querySelector("#psQe").onclick = function(){ H.closeOverlay(); itemSheet(it, function(){ view(el, X); }); }; }
function cartSheet(el){ var c = cart();
  var ov = H.showSheet("🧺 " + L("Troli", "Basket"), c.lines.map(function(l, i){ return '<div class="psCl"><span><b>' + E(l.n) + '</b><small>' + m(l.p) + '</small></span><button class="psSm" data-cl="' + i + '" data-d="-1">−</button><b class="psClq">' + l.q + '</b><button class="psSm" data-cl="' + i + '" data-d="1">＋</button><b class="psCla">' + m(l.p * l.q) + '</b></div>'; }).join("") +
    '<div class="psClT"><span>' + L("Jumlah", "Total") + '</span><b>' + m(cartTot(c)) + '</b></div><button class="btn gold full" id="psCp">💰 ' + L("Bayar", "Pay") + '</button>');
  ov.querySelectorAll("[data-cl]").forEach(function(b){ b.onclick = function(){ var cc = cart(), l = cc.lines[+b.getAttribute("data-cl")]; if(!l) return; l.q += +b.getAttribute("data-d"); cc.lines = cc.lines.filter(function(z){ return z.q > 0; }); keepCart(cc); H.closeOverlay(); view(el, X); if(cc.lines.length) cartSheet(el); }; });
  ov.querySelector("#psCp").onclick = function(){ H.closeOverlay(); checkout(el); }; }
function heldSheet(el){ var c = cart();
  var ov = H.showSheet("⏸ " + L("Troli ditahan", "Parked baskets"), c.held.map(function(h, i){ return '<button class="ngRow card" data-hb="' + i + '"><span><b>' + hm(h.t) + ' · ' + m(cartTot(h)) + '</b><small>' + E(h.lines.map(function(l){ return l.n + " ×" + l.q; }).join(", ")) + '</small></span><span>›</span></button>'; }).join("") + '<div class="mut tiny">' + L("Ketik untuk sambung. Troli semasa akan ditahan pula.", "Tap to continue. The current basket is parked instead.") + '</div>');
  ov.querySelectorAll("[data-hb]").forEach(function(b){ b.onclick = function(){ var cc = cart(), i = +b.getAttribute("data-hb"), hb = cc.held.splice(i, 1)[0]; if(cc.lines.length) cc.held.push({t:now().toISOString(), lines:cc.lines}); cc.lines = hb.lines; keepCart(cc); H.closeOverlay(); view(el, X); }; }); }
// ---------- calculator till ----------
function vCalc(b, el){ var c = cart(), v = ST.calc, val = N.calc(v), keys = ["7","8","9","÷","4","5","6","×","1","2","3","−","0","00",".","+"];
  b.innerHTML = '<div class="psCalc"><div class="psDisp"><small>' + E(v || " ") + '</small><b>' + (val === null ? "?" : m(Math.round((+val || 0) * 100))) + '</b></div>' +
    '<div class="psKeys">' + keys.map(function(k){ return '<button data-k="' + k + '"' + (/[÷×−+]/.test(k) ? ' class="op"' : '') + '>' + k + '</button>'; }).join("") +
    '<button data-k="C" class="cl">C</button><button data-k="⌫" class="cl">⌫</button><button data-k="add" class="add">＋ ' + L("Ke troli", "To basket") + '</button></div>' +
    '<div class="psCalcN mut tiny">' + L("Contoh: 3.50 × 4 lalu ＋ Ke troli. Boleh campur dengan barang dari 🛒 Jual.", "Example: 3.50 × 4 then ＋ To basket. Mixes with items from 🛒 Sell.") + '</div>' +
    (c.lines.length ? '<div class="psMini">' + c.lines.slice(-4).map(function(l){ return '<span>' + E(l.n) + ' ×' + l.q + ' · ' + m(l.p * l.q) + '</span>'; }).join("") + '</div>' : '') + '</div>' + bar(c, el);
  bindBar(b, el);
  b.querySelectorAll("[data-k]").forEach(function(k){ k.onclick = function(){ var a = k.getAttribute("data-k"); vib();
    if(a === "C") ST.calc = ""; else if(a === "⌫") ST.calc = ST.calc.slice(0, -1);
    else if(a === "add"){ var r = N.calc(ST.calc); if(r === null || !(+r > 0)){ H.toast(L("Masukkan amaun", "Type an amount")); return; }
      var mm = String(ST.calc).replace(/[x×]/g, "*").match(/^\s*([0-9.]+)\s*\*\s*([0-9]+)\s*$/), cc = cart();
      if(mm) cc.lines.push({i:"", n:L("Jualan", "Sale") + " " + m(N.sen(mm[1])), p:N.sen(mm[1]), q:+mm[2]}); else cc.lines.push({i:"", n:L("Jualan", "Sale"), p:Math.round(+r * 100), q:1});
      keepCart(cc); ST.calc = ""; H.toast("＋ " + m(Math.round(+r * 100))); }
    else ST.calc += {"÷":"/","×":"*","−":"-"}[a] || a;
    vCalc(b, el); }; }); }
// ---------- checkout ----------
function checkout(el){ var c = cart(); if(!c.lines.length) return; var sub = cartTot(c), p = P(), st = {m:"cash", disc:0, cash:0};
  var ov = H.showSheet("💰 " + L("Bayaran", "Payment"), '<div id="psCo"></div>');
  var draw = function(){ var tot = sub - st.disc; if(p.round5 && st.m === "cash") tot = Math.round(tot / 5) * 5;
    var notes = [], cand = [100, 500, 1000, 2000, 5000, 10000]; notes.push(tot); cand.forEach(function(n){ var up = Math.ceil(tot / n) * n; if(up > tot && notes.indexOf(up) < 0 && notes.length < 6) notes.push(up); });
    var qr = cfg().qr ? X.imgGet(cfg().qr) : "";
    ov.querySelector("#psCo").innerHTML = '<div class="psTot"><small>' + (st.disc ? m(sub) + " − " + m(st.disc) : L("Jumlah", "Total")) + '</small><b>' + m(tot) + '</b></div>' +
      '<div class="psMeth">' + METH.map(function(x){ return '<button class="' + (st.m === x[0] ? "on" : "") + '" data-pm="' + x[0] + '"><span>' + x[1] + '</span>' + L(x[2], x[3]) + '</button>'; }).join("") + '</div>' +
      (st.m === "cash" ? '<div class="mut tiny">' + L("Wang diterima", "Cash received") + '</div><div class="psNotes">' + notes.map(function(n, i){ return '<button class="' + (st.cash === n ? "on" : "") + '" data-pn="' + n + '">' + (i === 0 ? L("Tepat", "Exact") : m(n)) + '</button>'; }).join("") +
        '<input id="psCash" inputmode="decimal" placeholder="' + L("Lain", "Other") + '" value="' + (st.cash && notes.indexOf(st.cash) < 0 ? (st.cash / 100).toFixed(2) : "") + '"></div>' +
        (st.cash >= tot && st.cash ? '<div class="psChg"><small>' + L("Baki", "Change") + '</small><b>' + m(st.cash - tot) + '</b></div>' : (st.cash ? '<div class="psChg short"><small>' + L("Kurang", "Short by") + '</small><b>' + m(tot - st.cash) + '</b></div>' : '')) : '') +
      ((st.m === "qr" || st.m === "ewallet") ? (qr ? '<div class="psQrImg"><img src="' + qr + '" alt=""><small>' + L("Minta pelanggan imbas, kemudian semak duit masuk.", "Ask the customer to scan, then check the money arrived.") + '</small></div>' : '<div class="card mut small">' + L("Tambah gambar kod QR DuitNow kedai anda di ⚙️ Barang › Tetapan, supaya ia keluar di sini untuk diimbas.", "Add your shop's DuitNow QR picture in ⚙️ Items › Settings so it shows here for scanning.") + '</div>') : '') +
      '<details class="psDisc"><summary>🏷 ' + L("Diskaun", "Discount") + (st.disc ? " · " + m(st.disc) : "") + '</summary><div class="psNotes">' + [0, 5, 10, 20].map(function(pc){ return '<button data-pd="' + pc + '">' + (pc ? pc + "%" : L("Tiada", "None")) + '</button>'; }).join("") + '<input id="psDr" inputmode="decimal" placeholder="RM"></div></details>' +
      '<button class="btn gold full g3d psDone" id="psOk"' + (st.m === "cash" && st.cash && st.cash < tot ? " disabled" : "") + '>✓ ' + L("Selesai", "Done") + ' · ' + m(tot) + '</button>';
    var q = function(s){ return ov.querySelector(s); };
    ov.querySelectorAll("[data-pm]").forEach(function(b){ b.onclick = function(){ st.m = b.getAttribute("data-pm"); st.cash = 0; draw(); }; });
    ov.querySelectorAll("[data-pn]").forEach(function(b){ b.onclick = function(){ st.cash = +b.getAttribute("data-pn"); draw(); }; });
    var ci = q("#psCash"); if(ci) ci.onchange = function(){ st.cash = N.sen(N.calc(ci.value) || 0); draw(); };
    ov.querySelectorAll("[data-pd]").forEach(function(b){ b.onclick = function(){ st.disc = Math.round(sub * +b.getAttribute("data-pd") / 100); draw(); }; });
    var dr = q("#psDr"); dr.onchange = function(){ st.disc = Math.min(sub, N.sen(N.calc(dr.value) || 0)); draw(); };
    q("#psOk").onclick = function(){ var cc = cart(), s = record(cc.lines, {m:st.m, disc:st.disc, cash:st.m === "cash" ? (st.cash || tot) : 0}); cc.lines = []; keepCart(cc); H.closeOverlay(); view(el, X); doneSheet(s, el); }; };
  draw(); }
function doneSheet(s, el){ var ov = H.showSheet("✅ " + L("Jualan direkod", "Sale saved"), '<div class="psTot"><small>' + E(s.no) + ' · ' + hm(s.t) + '</small><b>' + m(s.tot) + '</b></div>' +
    (s.m === "cash" && s.chg ? '<div class="psChg"><small>' + L("Baki kepada pelanggan", "Change to give") + '</small><b>' + m(s.chg) + '</b></div>' : '') +
    '<div class="mut tiny center">' + L("Resit hanya jika pelanggan mahu:", "Receipt only if the customer wants one:") + '</div>' +
    '<div class="psRc psRc4"><button class="btn alt" id="psRp">🖨 ' + L("Cetak", "Print") + '</button><button class="btn alt" id="psRi">🖼 ' + L("Gambar", "Picture") + '</button><button class="btn alt" id="psRq">🔳 QR</button><button class="btn alt" id="psRw">💬</button></div>' +
    '<div class="btns"><button class="btn gold" id="psNx" style="flex:1">➡ ' + L("Pelanggan seterusnya", "Next customer") + '</button><button class="btn alt" id="psUv">↶</button></div>');
  ov.querySelector("#psNx").onclick = function(){ H.closeOverlay(); };
  ov.querySelector("#psUv").onclick = function(){ voidSale(s, L("Dibatalkan selepas jualan", "Undone after sale")); H.closeOverlay(); view(el, X); H.toast("↶ " + L("Jualan dibatalkan", "Sale undone")); };
  ov.querySelector("#psRi").onclick = function(){ receiptPic(s); }; ov.querySelector("#psRq").onclick = function(){ receiptQr(s); }; ov.querySelector("#psRw").onclick = function(){ receiptShare(s, "com.whatsapp"); };
  ov.querySelector("#psRp").onclick = function(){ printSale(s); }; if(prnCfg().auto && prnCfg().addr) printSale(s); }
// ---------- receipts ----------
function rText(s){ var p = P(), w = 32, pad = function(a, b){ a = String(a); b = String(b); return a + new Array(Math.max(1, w - a.length - b.length) + 1).join(" ") + b; };
  var t = [p.name || "", p.phone || ""].filter(Boolean).join("\n") + "\n" + s.no + "  " + s.day + " " + hm(s.t) + "\n" + new Array(w + 1).join("-") + "\n";
  (s.lines || []).forEach(function(l){ t += l.n + "\n" + pad("  " + l.q + " x " + (l.p / 100).toFixed(2), (l.p * l.q / 100).toFixed(2)) + "\n"; });
  t += new Array(w + 1).join("-") + "\n"; if(s.disc) t += pad(L("Diskaun", "Discount"), "-" + (s.disc / 100).toFixed(2)) + "\n";
  t += pad(L("JUMLAH", "TOTAL"), m(s.tot)) + "\n" + pad(L(mName(s.m)[0], mName(s.m)[1]), s.cash ? m(s.cash) : "") + "\n"; if(s.chg) t += pad(L("Baki", "Change"), m(s.chg)) + "\n";
  if(s.void) t += "** " + L("DIBATALKAN", "VOID") + " **\n"; t += (cfg().foot || L("Terima kasih!", "Thank you!")); return t; }
function mName(k){ var x = METH.filter(function(z){ return z[0] === k; })[0] || METH[0]; return [x[2], x[3]]; }
function rCanvas(s){ var p = P(), lines = s.lines || [], W = 640, Hh = 420 + lines.length * 62 + (s.disc ? 40 : 0) + (s.chg ? 40 : 0), cv = document.createElement("canvas"); cv.width = W; cv.height = Hh;
  var g = cv.getContext("2d"); g.fillStyle = "#fffdf7"; g.fillRect(0, 0, W, Hh); for(var z = 0; z < W; z += 16){ g.fillStyle = "#e9e3d3"; g.beginPath(); g.moveTo(z, Hh); g.lineTo(z + 8, Hh - 8); g.lineTo(z + 16, Hh); g.fill(); }
  var y = 56, c = function(t, f, col, al){ g.font = f; g.fillStyle = col || "#1d1d1d"; g.textAlign = al || "center"; g.fillText(t, al === "left" ? 40 : al === "right" ? W - 40 : W / 2, y); };
  var logo = p.logo ? X.imgGet(p.logo) : ""; c(p.name || L("Kedai", "Shop"), "700 34px Georgia, serif"); y += 34; if(p.phone){ c(p.phone, "22px sans-serif", "#555"); y += 30; }
  c(s.no + " · " + s.day + " " + hm(s.t), "20px monospace", "#555"); y += 22; g.strokeStyle = "#bbb"; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(30, y); g.lineTo(W - 30, y); g.stroke(); y += 40;
  lines.forEach(function(l){ c(l.n, "600 24px sans-serif", "#1d1d1d", "left"); y += 28; c(l.q + " × " + (l.p / 100).toFixed(2), "21px monospace", "#666", "left"); c((l.p * l.q / 100).toFixed(2), "22px monospace", "#1d1d1d", "right"); y += 34; });
  g.beginPath(); g.moveTo(30, y - 14); g.lineTo(W - 30, y - 14); g.stroke(); g.setLineDash([]); y += 16;
  if(s.disc){ c(L("Diskaun", "Discount"), "22px sans-serif", "#555", "left"); c("−" + (s.disc / 100).toFixed(2), "22px monospace", "#555", "right"); y += 40; }
  c(L("JUMLAH", "TOTAL"), "700 30px sans-serif", "#111", "left"); c(m(s.tot), "700 30px monospace", "#111", "right"); y += 40;
  var mn = mName(s.m); c(L(mn[0], mn[1]), "22px sans-serif", "#555", "left"); if(s.cash) c(m(s.cash), "22px monospace", "#555", "right"); y += 34;
  if(s.chg){ c(L("Baki", "Change"), "22px sans-serif", "#555", "left"); c(m(s.chg), "22px monospace", "#555", "right"); y += 40; }
  y += 20; c(cfg().foot || L("Terima kasih! Datang lagi.", "Thank you! Come again."), "italic 24px Georgia, serif", "#333"); y += 34; c("My Ihsan", "16px sans-serif", "#aaa");
  if(s.void){ g.save(); g.translate(W / 2, Hh / 2); g.rotate(-0.4); g.font = "800 90px sans-serif"; g.fillStyle = "rgba(200,30,30,.35)"; g.textAlign = "center"; g.fillText(L("BATAL", "VOID"), 0, 0); g.restore(); }
  if(logo){ var im = new Image(); im.src = logo; try{ g.drawImage(im, 30, 20, 60, 60); }catch(e){} } return cv; }
function receiptPic(s){ var cv = rCanvas(s), url = cv.toDataURL("image/png");
  var ov = H.showSheet("🖼 " + L("Resit", "Receipt"), '<div class="psRimg"><img src="' + url + '" alt=""></div><div class="mut tiny center">' + L("Pelanggan boleh ambil gambar skrin ini.", "The customer can take a photo of this screen.") + '</div><div class="btns"><button class="btn alt" id="psRp2">🖨</button><button class="btn alt" id="psRs" style="flex:1">↗ ' + L("Kongsi", "Share") + '</button><button class="btn alt" id="psRw2">💬 WhatsApp</button></div>');
  ov.querySelector("#psRp2").onclick = function(){ printSale(s); };
  ov.querySelector("#psRs").onclick = function(){ receiptShare(s, ""); }; ov.querySelector("#psRw2").onclick = function(){ receiptShare(s, "com.whatsapp"); }; }
function receiptShare(s, pkg){ var url = rCanvas(s).toDataURL("image/png"), txt = (P().name || "") + " · " + s.no + " · " + m(s.tot), N2 = H.N;
  if(window.Native && pkg && N2.shareTo) N2.shareTo(pkg, url, txt); else if(window.Native && N2.shareImage) N2.shareImage(url, txt);
  else { var a = document.createElement("a"); a.href = url; a.download = s.no + ".png"; document.body.appendChild(a); a.click(); a.remove(); } }
function receiptQr(s){ var show = function(){ var svg = ""; try{ var q = window.NostrKit.qrcode(0, "L"); q.addData(unescape(encodeURIComponent(rText(s)))); q.make(); var n = q.getModuleCount(), k = 6, d = "";
      for(var r = 0; r < n; r++) for(var c = 0; c < n; c++) if(q.isDark(r, c)) d += "M" + (c * k + 16) + " " + (r * k + 16) + "h" + k + "v" + k + "h-" + k + "z";
      svg = '<svg viewBox="0 0 ' + (n * k + 32) + ' ' + (n * k + 32) + '" style="width:100%;max-width:340px;background:#fff;border-radius:12px"><path d="' + d + '" fill="#111"/></svg>'; }catch(e){ svg = '<div class="mut">QR —</div>'; }
    H.showSheet("🔳 " + L("Resit QR", "QR receipt"), '<div class="center">' + svg + '</div><div class="mut tiny center">' + L("Pelanggan imbas dengan kamera telefon untuk simpan resit sebagai teks.", "The customer scans it with their phone camera to keep the receipt as text.") + '</div><pre class="psRt">' + E(rText(s)) + '</pre>'); };
  if(window.NostrKit) show(); else { var sc = document.createElement("script"); sc.src = "groups/nostrkit.js"; sc.onload = show; sc.onerror = show; document.body.appendChild(sc); } }

// ---------- 0.6.36 Bluetooth thermal printer (ESC/POS) ----------
function prnCfg(){ var c = cfg(); c.prn = c.prn || {}; return c.prn; }
function asc(t){ try{ t = String(t).normalize("NFD").replace(/[̀-ͯ]/g, ""); }catch(e){} return String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—−]/g, "-").replace(/×/g, "x").replace(/[^\x20-\x7e\n]/g, "?"); }
function Bytes(){ var a = []; return {raw:function(){ for(var i = 0; i < arguments.length; i++) a.push(arguments[i]); return this; }, txt:function(t){ t = asc(t); for(var i = 0; i < t.length; i++) a.push(t.charCodeAt(i) & 255); return this; },
  arr:function(u){ for(var i = 0; i < u.length; i++) a.push(u[i]); return this; }, b64:function(){ var s = ""; for(var i = 0; i < a.length; i += 8192) s += String.fromCharCode.apply(null, a.slice(i, i + 8192)); return btoa(s); }, len:function(){ return a.length; }}; }
function escText(s){ var p = P(), w = (prnCfg().w || 58) === 80 ? 48 : 32, B = Bytes(), line = new Array(w + 1).join("-") + "\n", pad = function(a, b){ a = asc(a); b = asc(b); var sp = w - a.length - b.length; if(sp < 1){ a = a.slice(0, Math.max(1, w - b.length - 1)); sp = w - a.length - b.length; } return a + new Array(sp + 1).join(" ") + b + "\n"; };
  B.raw(27, 64).raw(27, 97, 1).raw(29, 33, 17).txt((p.name || L("Kedai", "Shop")).slice(0, w / 2) + "\n").raw(29, 33, 0);
  var ad = p.addr && typeof p.addr === "object" ? [[p.addr.l1, p.addr.l2].filter(Boolean).join(", "), [p.addr.pc, p.addr.city].filter(Boolean).join(" ")].filter(Boolean) : (p.addr ? String(p.addr).split("\n") : []);
  ad.slice(0, 2).forEach(function(l){ B.txt(asc(l).slice(0, w) + "\n"); }); if(p.phone) B.txt(p.phone + "\n");
  B.txt(s.no + "  " + s.day + " " + hm(s.t) + "\n").raw(27, 97, 0).txt(line);
  (s.lines || []).forEach(function(l){ B.txt(asc(l.n).slice(0, w) + "\n").txt(pad("  " + l.q + " x " + (l.p / 100).toFixed(2), (l.p * l.q / 100).toFixed(2))); });
  B.txt(line); if(s.disc) B.txt(pad(L("Diskaun", "Discount"), "-" + (s.disc / 100).toFixed(2)));
  B.raw(27, 69, 1).raw(29, 33, 1).txt(pad(L("JUMLAH", "TOTAL"), m(s.tot))).raw(29, 33, 0).raw(27, 69, 0);
  var mn = mName(s.m); B.txt(pad(L(mn[0], mn[1]), s.cash ? m(s.cash) : "")); if(s.chg) B.txt(pad(L("Baki", "Change"), m(s.chg)));
  if(s.void) B.raw(27, 97, 1).raw(27, 69, 1).txt("*** " + L("DIBATALKAN", "VOID") + " ***\n").raw(27, 69, 0);
  B.raw(27, 97, 1).txt("\n" + (cfg().foot || L("Terima kasih! Datang lagi.", "Thank you! Come again.")) + "\n").raw(27, 100, 4).raw(29, 86, 66, 0); return B; }
// any canvas → GS v 0 raster bands (works on almost every ESC/POS printer, any language / logo)
function escImage(cv){ var dots = (prnCfg().w || 58) === 80 ? 576 : 384, sc = dots / cv.width, h = Math.round(cv.height * sc), c2 = document.createElement("canvas"); c2.width = dots; c2.height = h;
  var g = c2.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, dots, h); g.drawImage(cv, 0, 0, dots, h); var px = g.getImageData(0, 0, dots, h).data, bw = dots / 8, B = Bytes().raw(27, 64);
  for(var y0 = 0; y0 < h; y0 += 128){ var bh = Math.min(128, h - y0); B.raw(29, 118, 48, 0, bw & 255, bw >> 8, bh & 255, bh >> 8); var row = new Uint8Array(bw * bh);
    for(var y = 0; y < bh; y++) for(var x = 0; x < dots; x++){ var i = ((y0 + y) * dots + x) * 4; if(px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11 < 150) row[y * bw + (x >> 3)] |= 128 >> (x & 7); }
    B.arr(row); }
  return B.raw(27, 100, 4).raw(29, 86, 66, 0); }
function sendPrint(B, label){ var N2 = H.N, pc = prnCfg();
  if(!(window.Native && N2.btPrint)){ H.toast(L("Cetak terus perlukan aplikasi Android. Kongsi gambar ke aplikasi pencetak (contoh RawBT).", "Direct printing needs the Android app. Share the picture to a printer app (e.g. RawBT).")); return false; }
  if(!pc.addr){ printerSheet(function(){ sendPrint(B, label); }); return false; }
  var tag = "p" + Date.now(), h = function(r){ if(r.tag !== tag) return; H.off("btprint", h); H.toast(r.ok ? "🖨 " + L("Dicetak", "Printed") + (label ? " · " + label : "") : "⚠️ " + prnErr(r.err)); };
  H.on("btprint", h); H.toast("🖨 " + L("Menghantar ke ", "Sending to ") + (pc.name || L("pencetak", "printer")) + "…"); N2.btPrint(pc.addr, B.b64(), tag); return true; }
function prnErr(e){ e = String(e || ""); if(e === "off") return L("Bluetooth tertutup. Hidupkan dan cuba lagi.", "Bluetooth is off. Turn it on and try again."); if(e === "perm") return L("Benarkan kebenaran Peranti berdekatan (Bluetooth).", "Allow the Nearby devices (Bluetooth) permission.");
  return L("Tidak dapat bersambung. Pastikan pencetak hidup, dekat dan dipasangkan (pair) dalam tetapan Bluetooth.", "Could not connect. Make sure the printer is on, nearby and paired in Bluetooth settings."); }
function printSale(s){ var pc = prnCfg(); return sendPrint(pc.mode === "img" ? escImage(rCanvas(s)) : escText(s), s.no); }
function withBt(go){ var N2 = H.N; if(!(window.Native && N2.hasPerm)) { go(); return; } if(N2.hasPerm("bt")){ go(); return; }
  var hp = function(r){ if(r.which !== "bt") return; H.off("perm", hp); if(r.granted) go(); else H.toast(prnErr("perm")); }; H.on("perm", hp); N2.requestPerm("bt"); }
function printerSheet(after){ var N2 = H.N;
  if(!(window.Native && N2.btPrinters)){ H.showSheet("🖨 " + L("Pencetak resit", "Receipt printer"), '<div class="mut small">' + L("Cetak terus melalui Bluetooth tersedia dalam aplikasi Android. Di sini, guna ↗ Kongsi gambar resit ke aplikasi pencetak.", "Direct Bluetooth printing is available in the Android app. Here, use ↗ Share on the receipt picture to a printer app.") + '</div>'); return; }
  withBt(function(){ var r = {}; try{ r = JSON.parse(N2.btPrinters() || "{}"); }catch(e){} var l = (r.list || []).sort(function(a, b){ return (b.printer ? 1 : 0) - (a.printer ? 1 : 0); }), pc = prnCfg();
    var ov = H.showSheet("🖨 " + L("Pilih pencetak", "Choose a printer"), (r.none ? '<div class="mut">' + L("Telefon ini tiada Bluetooth.", "This phone has no Bluetooth.") + '</div>' : (r.on === false ? '<div class="warnbox">' + L("Bluetooth tertutup.", "Bluetooth is off.") + '</div>' : '')) +
      (l.length ? l.map(function(d){ return '<button class="ngRow card" data-bt="' + E(d.addr) + '" data-bn="' + E(d.name) + '"><span><b>' + (d.printer ? "🖨 " : "📶 ") + E(d.name) + '</b><small>' + E(d.addr) + '</small></span>' + (pc.addr === d.addr ? '<span>✓</span>' : '<span>›</span>') + '</button>'; }).join("") :
        '<div class="mut small">' + L("Tiada peranti dipasangkan. Hidupkan pencetak, buka tetapan Bluetooth, pasangkan (PIN biasanya 0000 atau 1234), kemudian kembali ke sini.", "No paired devices. Turn the printer on, open Bluetooth settings, pair it (PIN is usually 0000 or 1234), then come back here.") + '</div>') +
      '<button class="btn alt full" id="btSet" style="margin-top:8px">⚙️ ' + L("Buka tetapan Bluetooth (pasangkan)", "Open Bluetooth settings (pair)") + '</button>');
    ov.querySelectorAll("[data-bt]").forEach(function(b){ b.onclick = function(){ pc.addr = b.getAttribute("data-bt"); pc.name = b.getAttribute("data-bn"); N.stamp(D(), P()); X.sv(); H.closeOverlay(); H.toast("🖨 " + pc.name); if(after) after(); }; });
    ov.querySelector("#btSet").onclick = function(){ if(N2.btSettings) N2.btSettings(); }; }); }
function testPrint(){ var p = P(), B = Bytes().raw(27, 64).raw(27, 97, 1).raw(29, 33, 17).txt("My Ihsan\n").raw(29, 33, 0).txt(L("Ujian pencetak", "Printer test") + "\n" + (p.name || "") + "\n" + new Date().toLocaleString() + "\n").raw(27, 97, 0)
    .txt(new Array(((prnCfg().w || 58) === 80 ? 48 : 32) + 1).join("=") + "\n" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ\n0123456789 RM 12.50\n").raw(27, 97, 1).txt("\n" + L("Berjaya!", "It works!") + "\n").raw(27, 100, 4); sendPrint(B, L("ujian", "test")); }
// ---------- day view (backtrack) ----------
function vDay(b, el){ var p = P(), day = ST.day, o = daySum(D(), p.id, day), list = daySales(day), cf = cfg(), fl = +cf.float || 0, isT = day === today();
  var strip = [], mx = 1; for(var i = 13; i >= 0; i--){ var d0 = N.addDays(today(), -i), s0 = daySum(D(), p.id, d0).tot; strip.push([d0, s0]); mx = Math.max(mx, s0); }
  var closed = list.filter(function(s){ return s.closed; })[0], doc = closed ? N.byId(D().docs, closed.closed) : null, open = list.some(function(s){ return !s.void && !s.closed; });
  var top = Object.keys(o.items).map(function(k){ return o.items[k]; }).sort(function(a, c){ return c.q - a.q; });
  var h = '<div class="psDayNav"><button class="psSm" id="psDp">‹</button><b>' + (isT ? L("Hari ini", "Today") : new Date(day + "T00:00:00").toLocaleDateString(H.en() ? "en-GB" : "ms-MY", {weekday:"short", day:"numeric", month:"short"})) + '</b><button class="psSm" id="psDn"' + (isT ? " disabled" : "") + '>›</button></div>' +
    '<div class="psStrip">' + strip.map(function(x){ return '<button class="' + (x[0] === day ? "on" : "") + '" data-psd="' + x[0] + '"><i style="height:' + Math.max(3, Math.round(x[1] / mx * 48)) + 'px"></i><small>' + +x[0].slice(8) + '</small></button>'; }).join("") + '</div>' +
    '<div class="psKpi"><div><small>' + L("Jualan", "Sales") + '</small><b>' + m(o.tot) + '</b></div><div><small>' + L("Transaksi", "Sales count") + '</small><b>' + o.n + '</b></div><div><small>' + L("Purata", "Average") + '</small><b>' + m(o.n ? Math.round(o.tot / o.n) : 0) + '</b></div></div>' +
    '<div class="card psBy">' + METH.map(function(x){ return '<div class="row"><span>' + x[1] + ' ' + L(x[2], x[3]) + '</span><b>' + m(o.by[x[0]] || 0) + '</b></div>'; }).join("") +
    '<div class="row psDrawer"><span>🗄 ' + L("Tunai dalam laci", "Cash in the drawer") + ' <small class="mut">(' + L("modal ", "float ") + m(fl) + ')</small></span><b>' + m(fl + (o.by.cash || 0)) + '</b></div>' + (o.voids ? '<div class="mut tiny">' + o.voids + L(" jualan dibatalkan (tidak dikira)", " voided (not counted)") + '</div>' : '') + '</div>';
  if(o.n){ var hm2 = Math.max.apply(null, o.hrs.concat([1])), hs = o.hrs.map(function(v, i){ return [i, v]; }).filter(function(x, i){ return i >= 6 && i <= 23; });
    h += '<div class="card"><b class="small">⏰ ' + L("Ikut jam", "By hour") + '</b><div class="psHrs">' + hs.map(function(x){ return '<span title="' + x[0] + ':00"><i style="height:' + Math.round(x[1] / hm2 * 60) + 'px"></i><small>' + (x[0] % 3 ? "" : x[0]) + '</small></span>'; }).join("") + '</div></div>';
    h += '<div class="card"><b class="small">📊 ' + L("Barang terjual", "Items sold") + '</b>' + top.map(function(t){ return '<div class="row"><span>' + E(t.n) + '</span><span><b>× ' + Math.round(t.q * 100) / 100 + '</b> · ' + m(t.a) + '</span></div>'; }).join("") + '</div>'; }
  h += '<div class="btns">' + (o.n ? '<button class="btn alt" id="psZ">📤 ' + L("Kongsi ringkasan", "Share summary") + '</button><button class="btn alt" id="psZp">🖨</button>' : '') + (open ? '<button class="btn gold" id="psClose">📄 ' + L("Tutup hari → Bil Tunai", "Close day → Cash Sale") + '</button>' : '') + '</div>' +
    (doc ? '<div class="mut tiny">✓ ' + L("Disimpan sebagai ", "Saved as ") + E(doc.no || "") + '</div>' : '');
  h += '<div class="psList">' + (list.length ? list.map(function(s){ return '<button class="psRow' + (s.void ? " void" : "") + '" data-pss="' + s.id + '"><span class="psRt1">' + hm(s.t) + '</span><span class="psRt2"><b>' + E((s.lines || []).map(function(l){ return l.n + (l.q > 1 ? " ×" + l.q : ""); }).join(", ")) + '</b><small>' + E(s.no) + ' · ' + METH.filter(function(x){ return x[0] === s.m; }).map(function(x){ return x[1]; }).join("") + (s.void ? " · " + L("dibatalkan", "void") : "") + '</small></span><b>' + m(s.tot) + '</b></button>'; }).join("") : '<div class="card mut center">' + L("Tiada jualan pada hari ini.", "No sales on this day.") + '</div>') + '</div>';
  b.innerHTML = h;
  var go = function(d){ ST.day = d; vDay(b, el); };
  b.querySelector("#psDp").onclick = function(){ go(N.addDays(day, -1)); }; var dn = b.querySelector("#psDn"); dn.onclick = function(){ if(!isT) go(N.addDays(day, 1)); };
  b.querySelectorAll("[data-psd]").forEach(function(x){ x.onclick = function(){ go(x.getAttribute("data-psd")); }; });
  b.querySelectorAll("[data-pss]").forEach(function(x){ x.onclick = function(){ saleSheet(N.byId(sales(), x.getAttribute("data-pss")), function(){ vDay(b, el); }, el); }; });
  var z = b.querySelector("#psZ"); if(z) z.onclick = function(){ var t = (p.name || "") + "\n" + L("Ringkasan jualan ", "Sales summary ") + day + "\n" + L("Jumlah: ", "Total: ") + m(o.tot) + " (" + o.n + ")\n" + METH.filter(function(x){ return o.by[x[0]]; }).map(function(x){ return L(x[2], x[3]) + ": " + m(o.by[x[0]]); }).join("\n") + "\n\n" + top.map(function(t){ return t.n + " × " + t.q + " = " + m(t.a); }).join("\n");
    if(window.Native && H.N.shareText) H.N.shareText(t); else if(navigator.share) navigator.share({text:t}).catch(function(){}); else { try{ navigator.clipboard.writeText(t); H.toast("📋"); }catch(e){} } };
  var zp = b.querySelector("#psZp"); if(zp) zp.onclick = function(){ var w = (prnCfg().w || 58) === 80 ? 48 : 32, pad = function(a, c){ a = asc(a); c = asc(c); return a + new Array(Math.max(1, w - a.length - c.length) + 1).join(" ") + c + "\n"; }, B = Bytes().raw(27, 64).raw(27, 97, 1).raw(27, 69, 1).txt((p.name || "") + "\n" + L("RINGKASAN JUALAN", "SALES SUMMARY") + "\n").raw(27, 69, 0).txt(day + "\n").raw(27, 97, 0).txt(new Array(w + 1).join("-") + "\n");
    B.txt(pad(L("Jumlah", "Total") + " (" + o.n + ")", m(o.tot))); METH.forEach(function(x){ if(o.by[x[0]]) B.txt(pad(L(x[2], x[3]), m(o.by[x[0]]))); }); B.txt(pad(L("Tunai dalam laci", "Cash in drawer"), m(fl + (o.by.cash || 0)))).txt(new Array(w + 1).join("-") + "\n");
    top.forEach(function(t){ B.txt(pad(t.n + " x" + Math.round(t.q * 100) / 100, m(t.a))); }); B.raw(27, 100, 4); sendPrint(B, L("ringkasan", "summary")); };
  var cl = b.querySelector("#psClose"); if(cl) cl.onclick = function(){ closeDay(day); vDay(b, el); }; }
function saleSheet(s, back, el){ if(!s) return;
  var ov = H.showSheet("🧾 " + E(s.no), '<div class="psTot"><small>' + s.day + ' · ' + hm(s.t) + (s.void ? ' · ' + L("DIBATALKAN", "VOID") : '') + '</small><b' + (s.void ? ' style="text-decoration:line-through"' : '') + '>' + m(s.tot) + '</b></div>' +
    (s.lines || []).map(function(l){ return '<div class="row"><span>' + E(l.n) + ' × ' + l.q + '</span><b>' + m(l.p * l.q) + '</b></div>'; }).join("") + (s.disc ? '<div class="row"><span>' + L("Diskaun", "Discount") + '</span><b>−' + m(s.disc) + '</b></div>' : '') +
    (s.void ? '<div class="mut small">' + L("Sebab: ", "Reason: ") + E(s.void.why || "—") + '</div>' : '') +
    '<div class="psRc psRc4"><button class="btn alt" id="psRp">🖨</button><button class="btn alt" id="psRi">🖼</button><button class="btn alt" id="psRq">🔳 QR</button><button class="btn alt" id="psAg">🔁 ' + L("Jual semula", "Ring again") + '</button>' + (!s.void && !s.closed ? '<button class="btn alt" id="psVd">⛔ ' + L("Batal", "Void") + '</button>' : '') + '</div>' + (s.closed ? '<div class="mut tiny">' + L("Hari ini sudah ditutup ke Bil Tunai; batalkan dalam dokumen itu jika perlu.", "This day is already closed into a Cash Sale; change that document if needed.") + '</div>' : ''));
  ov.querySelector("#psRi").onclick = function(){ receiptPic(s); }; ov.querySelector("#psRq").onclick = function(){ receiptQr(s); }; ov.querySelector("#psRp").onclick = function(){ printSale(s); };
  ov.querySelector("#psAg").onclick = function(){ var c = cart(); (s.lines || []).forEach(function(l){ c.lines.push({i:l.i, n:l.n, p:l.p, q:l.q}); }); keepCart(c); H.closeOverlay(); ST.tab = "sell"; view(el, X); };
  var v = ov.querySelector("#psVd"); if(v) v.onclick = function(){ var why = prompt(L("Sebab batal (contoh: salah tekan, pulang barang)", "Reason (e.g. wrong item, returned)"), ""); if(why === null) return; voidSale(s, why); H.closeOverlay(); back(); }; }
function closeDay(day){ var p = P(), list = daySales(day).filter(function(s){ return !s.void && !s.closed; }); if(!list.length) return;
  var agg = {}, disc = 0; list.forEach(function(s){ disc += s.disc + (s.sub - s.disc - s.tot); (s.lines || []).forEach(function(l){ var k = (l.i || "") + "|" + l.n + "|" + l.p; agg[k] = agg[k] || {n:l.n, p:l.p, q:0, i:l.i}; agg[k].q += l.q; }); });
  var d = N.blankDoc(D(), p, "CS"); d.date = day; d.cust = {name:L("Jualan kaunter ", "Counter sales ") + day}; d.method = "cash";
  d.lines = Object.keys(agg).map(function(k){ var a = agg[k]; return {t:"item", desc:a.n, qty:a.q, unit:"pcs", price:(a.p / 100).toFixed(2), item:a.i || "", tax:0}; });
  if(disc > 0){ d.disc = (disc / 100).toFixed(2); d.discT = "rm"; } else if(disc < 0){ d.other = (-disc / 100).toFixed(2); }
  d.notes = L("Ringkasan ", "Summary of ") + list.length + L(" jualan kaunter (🛒 Jual).", " counter sales (🛒 Sell).");
  d.no = N.takeNo(D(), p, "CS", day); d.status = "sent"; N.stamp(D(), d); N.cache(D(), d, p); D().docs.push(d); N.log(D(), d.id, "issue");
  list.forEach(function(s){ s.closed = d.id; N.stamp(D(), s); }); X.sv(); H.toast("📄 " + (d.no || "") + " · " + m(Math.round((d.totals ? d.totals.total : 0) * 100))); }
// ---------- items & settings ----------
function vSet(b, el){ var list = items(), cf = cfg(), all = N.live(D().items).filter(function(x){ return x.pid === P().id; }), hid = all.filter(function(x){ return x.pos === false; });
  var qr = cf.qr ? X.imgGet(cf.qr) : "";
  b.innerHTML = '<div class="btns"><button class="btn gold g3d" id="psNi">＋ ' + L("Barang", "Item") + '</button></div>' +
    '<div class="psIl">' + list.map(function(x, i){ var img = x.img ? X.imgGet(x.img) : ""; return '<div class="ngRow card"><span class="psIi" style="--c:' + (x.col || COL[Math.abs(hash(x.name)) % COL.length]) + '">' + (img ? '<img src="' + img + '" alt="">' : E(x.emo || initials(x.name))) + '</span><span data-pse="' + x.id + '"><b>' + E(x.name) + '</b><small>' + m(N.sen(x.price)) + (x.cat ? ' · ' + E(x.cat) : '') + (cf.stock && x.stock !== "" && x.stock != null ? ' · ' + L("stok ", "stock ") + x.stock : '') + '</small></span><button class="ib" data-psu="' + i + '"' + (i ? '' : ' disabled') + '>▲</button><button class="ib" data-psh="' + x.id + '" title="' + L("Sembunyi dari Jual", "Hide from Sell") + '">🙈</button></div>'; }).join("") + '</div>' +
    (hid.length ? '<details class="card"><summary>🙈 ' + L("Tersembunyi dari Jual", "Hidden from Sell") + ' (' + hid.length + ')</summary>' + hid.map(function(x){ return '<button class="chip" data-psv="' + x.id + '">' + E(x.name) + ' ↺</button>'; }).join("") + '</details>' : '') +
    '<div class="card"><h3>⚙️ ' + L("Tetapan kaunter", "Till settings") + '</h3>' +
    '<div class="set"><span>' + L("Saiz petak", "Tile size") + '</span><span class="chips">' + [["s", "S"], ["m", "M"], ["l", "L"]].map(function(z){ return '<button class="chip' + ((cf.sz || "m") === z[0] ? " on" : "") + '" data-psz="' + z[0] + '">' + z[1] + '</button>'; }).join("") + '</span></div>' +
    '<div class="set"><span>' + L("Kira stok (tolak bila dijual)", "Track stock (count down on each sale)") + '</span><input type="checkbox" id="psStk"' + (cf.stock ? " checked" : "") + '></div>' +
    '<div class="set"><span>' + L("Buka Niaga terus ke 🛒 Jual", "Open Business straight to 🛒 Sell") + '</span><input type="checkbox" id="psHome"' + (cf.home ? " checked" : "") + '></div>' +
    '<div class="set"><span>' + L("Bundarkan tunai ke 5 sen", "Round cash to 5 sen") + '</span><input type="checkbox" id="psR5"' + (P().round5 ? " checked" : "") + '></div>' +
    '<label class="kL">' + L("Modal tunai awal hari (laci)", "Opening cash float (drawer)") + '</label><input id="psFl" class="ilq" inputmode="decimal" value="' + (cf.float ? (cf.float / 100).toFixed(2) : "") + '" placeholder="0.00">' +
    '<label class="kL">' + L("Ayat bawah resit", "Receipt footer") + '</label><input id="psFt" class="ilq" maxlength="60" value="' + E(cf.foot || "") + '" placeholder="' + L("Terima kasih! Datang lagi.", "Thank you! Come again.") + '">' +
    '<label class="kL">📱 ' + L("Kod QR DuitNow / e-dompet kedai", "Shop DuitNow / e-wallet QR") + '</label><div class="psQrSet">' + (qr ? '<img src="' + qr + '" alt="">' : '<span class="mut small">' + L("Ambil gambar standee QR anda. Ia ditunjuk kepada pelanggan semasa bayar.", "Take a photo of your QR standee. It is shown to the customer at payment.") + '</span>') +
    '<button class="btn alt" id="psQrC">📷</button><button class="btn alt" id="psQrG">🖼</button>' + (qr ? '<button class="btn alt" id="psQrX">🗑</button>' : '') + '</div></div>' +
    '<div class="card"><h3>🖨 ' + L("Pencetak resit Bluetooth", "Bluetooth receipt printer") + '</h3><div class="mut tiny">' + L("Untuk pencetak terma mudah alih 58 / 80 mm (ESC/POS) melalui Bluetooth.", "For portable 58 / 80 mm thermal printers (ESC/POS) over Bluetooth.") + '</div>' +
    '<button class="ngRow card" id="psPrn"><span><b>' + (prnCfg().addr ? "🖨 " + E(prnCfg().name || prnCfg().addr) : L("Pilih pencetak", "Choose a printer")) + '</b><small>' + (prnCfg().addr ? E(prnCfg().addr) : L("Pasangkan dahulu dalam tetapan Bluetooth", "Pair it first in Bluetooth settings")) + '</small></span><span>›</span></button>' +
    '<div class="set"><span>' + L("Lebar kertas", "Paper width") + '</span><span class="chips">' + [58, 80].map(function(w){ return '<button class="chip' + ((prnCfg().w || 58) === w ? " on" : "") + '" data-pw="' + w + '">' + w + ' mm</button>'; }).join("") + '</span></div>' +
    '<div class="set"><span>' + L("Cetak sebagai", "Print as") + '</span><span class="chips"><button class="chip' + (prnCfg().mode !== "img" ? " on" : "") + '" data-pmo="txt">' + L("Teks (laju)", "Text (fast)") + '</button><button class="chip' + (prnCfg().mode === "img" ? " on" : "") + '" data-pmo="img">' + L("Gambar", "Picture") + '</button></span></div>' +
    '<div class="mut tiny">' + L("Gambar: ikut rupa resit di skrin, termasuk logo dan tulisan Jawi / Cina.", "Picture: prints the receipt as it looks on screen, including the logo and non-Latin text.") + '</div>' +
    '<div class="set"><span>' + L("Cetak automatik selepas setiap jualan", "Print automatically after each sale") + '</span><input type="checkbox" id="psAuto"' + (prnCfg().auto ? " checked" : "") + '></div>' +
    '<button class="btn alt full" id="psTest">🧪 ' + L("Cetak ujian", "Test print") + '</button></div>';
  var save = function(){ N.stamp(D(), P()); X.sv(); };
  b.querySelector("#psNi").onclick = function(){ itemSheet({}, function(){ vSet(b, el); }); };
  b.querySelectorAll("[data-pse]").forEach(function(x){ x.onclick = function(){ itemSheet(N.byId(D().items, x.getAttribute("data-pse")), function(){ vSet(b, el); }); }; });
  b.querySelectorAll("[data-psu]").forEach(function(x){ x.onclick = function(){ var i = +x.getAttribute("data-psu"), l = items(); l.forEach(function(it, k){ it.ord = k; }); var a = l[i], c = l[i - 1]; a.ord = i - 1; c.ord = i; N.stamp(D(), a); N.stamp(D(), c); X.sv(); vSet(b, el); }; });
  b.querySelectorAll("[data-psh]").forEach(function(x){ x.onclick = function(){ var it = N.byId(D().items, x.getAttribute("data-psh")); it.pos = false; N.stamp(D(), it); X.sv(); vSet(b, el); }; });
  b.querySelectorAll("[data-psv]").forEach(function(x){ x.onclick = function(){ var it = N.byId(D().items, x.getAttribute("data-psv")); delete it.pos; N.stamp(D(), it); X.sv(); vSet(b, el); }; });
  b.querySelectorAll("[data-psz]").forEach(function(x){ x.onclick = function(){ cfg().sz = x.getAttribute("data-psz"); save(); vSet(b, el); }; });
  b.querySelector("#psStk").onchange = function(){ cfg().stock = this.checked; save(); };
  b.querySelector("#psHome").onchange = function(){ cfg().home = this.checked; save(); };
  b.querySelector("#psR5").onchange = function(){ P().round5 = this.checked; save(); };
  b.querySelector("#psFl").onchange = function(){ cfg().float = N.sen(N.calc(this.value) || 0); save(); };
  b.querySelector("#psFt").onchange = function(){ cfg().foot = this.value.trim(); save(); };
  var qp = function(mode){ X.pickImg(mode, function(d){ X.shrinkJ(d, 900, function(j){ var id = "posqr_" + P().id; X.imgPut(id, j); cfg().qr = id; save(); vSet(b, el); }); }); };
  b.querySelector("#psQrC").onclick = function(){ qp("camera"); }; b.querySelector("#psQrG").onclick = function(){ qp("gallery"); };
  var qx = b.querySelector("#psQrX"); if(qx) qx.onclick = function(){ delete cfg().qr; save(); vSet(b, el); };
  b.querySelector("#psPrn").onclick = function(){ printerSheet(function(){ vSet(b, el); }); };
  b.querySelectorAll("[data-pw]").forEach(function(x){ x.onclick = function(){ prnCfg().w = +x.getAttribute("data-pw"); save(); vSet(b, el); }; });
  b.querySelectorAll("[data-pmo]").forEach(function(x){ x.onclick = function(){ prnCfg().mode = x.getAttribute("data-pmo"); save(); vSet(b, el); }; });
  b.querySelector("#psAuto").onchange = function(){ prnCfg().auto = this.checked; save(); };
  b.querySelector("#psTest").onclick = testPrint; }
function itemSheet(it, done){ var isNew = !it.id, cf = cfg(), st = {emo:it.emo || "", col:it.col || "", img:it.img || ""};
  var ov = H.showSheet((isNew ? "＋ " : "✏️ ") + L("Barang", "Item"), '<div id="psIs"></div>');
  var draw = function(){ var img = st.img ? X.imgGet(st.img) : "";
    ov.querySelector("#psIs").innerHTML = '<div class="psIsTop"><span class="psIi big" style="--c:' + (st.col || COL[0]) + '">' + (img ? '<img src="' + img + '" alt="">' : E(st.emo || "＋")) + '</span><span class="psIsB"><button class="btn alt" id="psPc">📷</button><button class="btn alt" id="psPg">🖼</button>' + (img ? '<button class="btn alt" id="psPx">🗑</button>' : '') + '</span></div>' +
      '<label class="kL">' + L("Nama", "Name") + '</label><input id="psN" class="ilq" maxlength="40" value="' + E(it.name || "") + '">' +
      '<div class="f2"><div><label class="kL">' + L("Harga (RM)", "Price (RM)") + '</label><input id="psP" class="ilq" inputmode="decimal" value="' + E(it.price || "") + '"></div><div><label class="kL">' + L("Kategori", "Category") + '</label><input id="psC" class="ilq" maxlength="20" list="psCl" value="' + E(it.cat || "") + '"><datalist id="psCl">' + cats().map(function(k){ return '<option value="' + E(k) + '">'; }).join("") + '</datalist></div></div>' +
      (cf.stock ? '<div class="f2"><div><label class="kL">' + L("Stok", "Stock") + '</label><input id="psK" class="ilq" inputmode="decimal" value="' + (it.stock == null ? "" : it.stock) + '"></div><div><label class="kL">' + L("Amaran bila tinggal", "Warn when below") + '</label><input id="psLw" class="ilq" inputmode="decimal" value="' + (it.low || "") + '" placeholder="3"></div></div>' : '') +
      '<label class="kL">' + L("Emoji (jika tiada gambar)", "Emoji (when there is no photo)") + '</label><div class="psEmo">' + EMO.map(function(e){ return '<button class="' + (st.emo === e ? "on" : "") + '" data-pe="' + e + '">' + e + '</button>'; }).join("") + '</div>' +
      '<label class="kL">' + L("Warna petak", "Tile colour") + '</label><div class="psCol">' + COL.map(function(c){ return '<button class="' + (st.col === c ? "on" : "") + '" data-pco="' + c + '" style="background:' + c + '"></button>'; }).join("") + '</div>' +
      '<div class="btns"><button class="btn gold" id="psSv" style="flex:1">✓ ' + L("Simpan", "Save") + '</button>' + (!isNew ? '<button class="btn alt" id="psDl">🗑</button>' : '') + '</div>';
    var q = function(s){ return ov.querySelector(s); }, keepF = function(){ it.name = q("#psN").value; it.price = q("#psP").value; it.cat = q("#psC").value; if(q("#psK")){ it.stock = q("#psK").value === "" ? "" : +N.calc(q("#psK").value); it.low = q("#psLw").value; } };
    ov.querySelectorAll("[data-pe]").forEach(function(b){ b.onclick = function(){ keepF(); st.emo = b.getAttribute("data-pe"); draw(); }; });
    ov.querySelectorAll("[data-pco]").forEach(function(b){ b.onclick = function(){ keepF(); st.col = b.getAttribute("data-pco"); draw(); }; });
    var pk = function(mode){ keepF(); X.pickImg(mode, function(d){ X.shrinkJ(d, 360, function(j){ var id = "posi_" + N.rid(10); X.imgPut(id, j); st.img = id; draw(); }); }); };
    q("#psPc").onclick = function(){ pk("camera"); }; q("#psPg").onclick = function(){ pk("gallery"); }; var px = q("#psPx"); if(px) px.onclick = function(){ keepF(); st.img = ""; draw(); };
    q("#psSv").onclick = function(){ keepF(); var nm = (it.name || "").trim(), pr = N.calc(it.price); if(!nm){ H.toast(L("Isi nama", "Type a name")); return; } if(pr === null || pr === ""){ H.toast(L("Isi harga", "Type a price")); return; }
      it.name = nm; it.price = String(Math.round(+pr * 100) / 100); it.emo = st.emo; it.col = st.col; it.img = st.img; if(isNew){ it.pid = P().id; it.unit = "pcs"; it.fav = true; it.ord = items().length; D().items.push(it); }
      N.stamp(D(), it); X.sv(); H.closeOverlay(); done(); };
    var dl = q("#psDl"); if(dl) dl.onclick = function(){ if(!confirm(L("Padam barang ini?", "Delete this item?"))) return; it.del = true; N.stamp(D(), it); X.sv(); H.closeOverlay(); done(); }; };
  draw(); }
function css(){ if(document.getElementById("psCss")) return; var l = document.createElement("link"); l.id = "psCss"; l.rel = "stylesheet"; l.href = "finance/niaga_pos.css"; document.head.appendChild(l); }
window.NiagaPos = {view:view, daySum:daySum, rText:rText, escText:escText, escImage:escImage, rCanvas:rCanvas};
})();
