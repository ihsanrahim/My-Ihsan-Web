/* My Ihsan web dashboard (owner spec "Google Drive sync + web dashboard", milestones 3–4 first cut).
   Sign in with Google (Google Identity Services token client, scope drive.appdata) → DriveSync pulls the person's own section files from
   the hidden app folder of THEIR Drive into IndexedDB → every section shows here; Notes can be edited and sync back to the phone.
   Nothing is sent anywhere except the person's own Google Drive. Static files only (GitHub Pages). */
(function(){ "use strict";
var CFG = window.MYIHSAN_CFG || {}, TEST = window.MYIHSAN_TEST || null, DS = window.DriveSync;
var LANG = (function(){ try{ return localStorage.getItem("ihsan_web_lang") || (/^ms|^id/.test(navigator.language) ? "ms" : "en"); }catch(e){ return "en"; } })();
function T(bm, en){ return LANG === "en" ? en : bm; }
function E(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }
function $(s){ return document.querySelector(s); }
function toast(t){ var x = $("#toast"); x.textContent = t; x.style.display = "block"; clearTimeout(toast.t); toast.t = setTimeout(function(){ x.style.display = "none"; }, 2200); }
function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function rm(v, cur){ return (cur || "RM") + " " + (Math.round((+v || 0) * 100) / 100).toLocaleString("en", {minimumFractionDigits:2, maximumFractionDigits:2}); }

// ---------- local cache: IndexedDB (localStorage is too small) ----------
var MEM = {}, DB = null;
function idb(){ return new Promise(function(ok){ if(!window.indexedDB){ ok(null); return; } var r = indexedDB.open("myihsan", 1); r.onupgradeneeded = function(){ r.result.createObjectStore("kv"); }; r.onsuccess = function(){ ok(r.result); }; r.onerror = function(){ ok(null); }; }); }
function idbAll(){ return new Promise(function(ok){ if(!DB){ ok(); return; } var tx = DB.transaction("kv"), os = tx.objectStore("kv"), rq = os.openCursor(); rq.onsuccess = function(){ var c = rq.result; if(c){ MEM[c.key] = c.value; c.continue(); } else ok(); }; rq.onerror = function(){ ok(); }; }); }
function idbPut(k, v){ if(!DB) return; try{ var tx = DB.transaction("kv", "readwrite"); if(v == null) tx.objectStore("kv").delete(k); else tx.objectStore("kv").put(v, k); }catch(e){} }
var STORE = {get:function(k){ return k in MEM ? MEM[k] : null; }, set:function(k, v){ MEM[k] = v; idbPut(k, v); }, del:function(k){ delete MEM[k]; idbPut(k, null); }, keys:function(){ return Object.keys(MEM); }, watchless:true};
function J(k, d){ try{ var v = STORE.get(k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } }
function put(k, v){ STORE.set(k, JSON.stringify(v)); DS.touch(k); }

// ---------- Google sign-in (token in memory only) ----------
var TOK = null, tokenClient = null, waiting = [];
function gisReady(){ return !!(window.google && google.accounts && google.accounts.oauth2); }
function getToken(interactive){ if(TEST) return Promise.resolve(TEST.token);
  if(TOK && TOK.exp > Date.now() + 60000) return Promise.resolve(TOK.t);
  if(!CFG.webClientId || !gisReady()) return Promise.resolve(null);
  if(!interactive && !DS.meta().signed) return Promise.resolve(null);
  return new Promise(function(ok){ waiting.push(ok);
    if(!tokenClient) tokenClient = google.accounts.oauth2.initTokenClient({client_id:CFG.webClientId, scope:CFG.scope, callback:function(r){ var w = waiting; waiting = [];
      if(r && r.access_token){ TOK = {t:r.access_token, exp:Date.now() + (r.expires_in || 3600) * 1000}; w.forEach(function(f){ f(TOK.t); }); } else w.forEach(function(f){ f(null); }); }, error_callback:function(){ var w = waiting; waiting = []; w.forEach(function(f){ f(null); }); }});
    tokenClient.requestAccessToken({prompt:interactive && !DS.meta().signed ? "consent" : ""}); }); }
function signIn(){ getToken(true).then(function(t){ if(!t){ toast(T("Log masuk dibatalkan", "Sign-in cancelled")); return; } DS.signedIn({});
    fetch("https://www.googleapis.com/oauth2/v3/userinfo", {headers:{Authorization:"Bearer " + t}}).then(function(r){ return r.json(); }).then(function(u){ DS.signedIn({email:u.email, name:u.name, photo:u.picture}); }).catch(function(){}).then(function(){ DS.sync({manual:true, full:true}).then(draw); draw(); }); }); }
function signOut(){ if(TOK && gisReady()) try{ google.accounts.oauth2.revoke(TOK.t, function(){}); }catch(e){} TOK = null; DS.signedOut(); MEM = {}; if(DB){ try{ DB.transaction("kv", "readwrite").objectStore("kv").clear(); }catch(e){} } draw(); }

// ---------- pages ----------
var PAGES = [
  ["home", "🏠", "Utama", "Home", "o"], ["conflicts", "⚠️", "Konflik", "Conflicts", "o"],
  ["notes", "📝", "Nota", "Notes", "m"], ["niaga", "📑", "Niaga", "Business", "m"], ["karya", "✒️", "Karya", "Karya", "m"], ["recipes", "🍲", "Resepi", "Recipes", "m"],
  ["ibadah", "🕌", "Ibadah", "Worship", "p"], ["ilmu", "📚", "Ilmu", "Learning", "p"], ["move", "🏃", "Gerak", "Move", "p"],
  ["family", "👨‍👩‍👧", "Keluarga", "Family", "l"], ["finance", "💰", "Kewangan", "Finance", "l"], ["hajj", "🕋", "Haji & Umrah", "Hajj & Umrah", "l"], ["groups", "👥", "Kumpulan", "Groups", "l"], ["misc", "🧭", "Lain-lain", "Other", "l"],
  ["care", "🌸", "Haid & Jaga", "Period & Care", "x"]];
var GROUPS = [["o", "Gambaran", "Overview"], ["m", "Milik saya", "Mine"], ["p", "Kemajuan", "Progress"], ["l", "Kehidupan", "Life"], ["x", "Peribadi", "Private"]];
var PG = (location.hash || "#home").slice(1) || "home", Q = "";
function nav(){ $("#side").innerHTML = GROUPS.map(function(g){ return '<h4>' + T(g[1], g[2]) + '</h4>' + PAGES.filter(function(p){ return p[4] === g[0]; }).map(function(p){ return '<button data-pg="' + p[0] + '" class="' + (PG === p[0] ? "on" : "") + '"><i>' + p[1] + '</i>' + T(p[2], p[3]) + (p[0] === "conflicts" && DS.conflicts().length ? ' <span class="badge p">' + DS.conflicts().length + '</span>' : '') + '</button>'; }).join(""); }).join("");
  $("#bottom").innerHTML = [["home", "🏠", "Utama", "Home"], ["notes", "📝", "Nota", "Notes"], ["niaga", "📑", "Niaga", "Business"], ["ibadah", "📈", "Kemajuan", "Progress"], ["more", "☰", "Lagi", "More"]].map(function(p){ return '<button data-pg="' + p[0] + '" class="' + (PG === p[0] ? "on" : "") + '"><i>' + p[1] + '</i>' + T(p[2], p[3]) + '</button>'; }).join("");
  document.querySelectorAll("[data-pg]").forEach(function(b){ b.onclick = function(){ var p = b.getAttribute("data-pg"); go(p === "more" ? "menu" : p); }; }); }
function go(p){ PG = p; location.hash = p; window.scrollTo(0, 0); draw(); }
function head(){ var st = DS.status(), m = DS.meta(), cls = st.state === "busy" ? "busy" : st.state === "ok" ? (st.pending ? "wait" : "ok") : st.state === "off" ? "" : "bad";
  var ago = function(t){ if(!t) return T("belum", "never"); var mi = Math.round((Date.now() - t) / 60000); return mi < 1 ? T("baru tadi", "just now") : mi < 60 ? mi + T(" min lalu", " min ago") : Math.round(mi / 60) + T(" jam lalu", " h ago"); };
  var txt = st.state === "busy" ? "⟳ " + T("Menyegerak dengan Google Drive…", "Syncing with Google Drive…") : st.state === "off" ? "○ " + T("Belum log masuk", "Not signed in") : st.state === "signin" ? "✕ " + T("Log masuk tamat. Ketik untuk log masuk", "Sign-in expired. Tap to sign in") :
    st.state === "full" ? "✕ " + T("Drive penuh", "Drive is full") : st.state === "err" ? "⚠ " + (navigator.onLine === false ? T("Luar talian", "Offline") : T("Belum dapat sync", "Could not sync")) + (st.pending ? " · " + st.pending + T(" perubahan belum sync", " changes not synced") : "") :
    st.pending ? "⚠ " + st.pending + T(" perubahan menunggu", " changes waiting") : "✓ " + T("Sync · ", "Synced · ") + ago(st.last);
  var s = $("#sync"); s.className = "sync " + cls; s.textContent = txt; s.onclick = st.state === "signin" ? signIn : null;
  $("#auto").checked = !!m.auto; $("#lang").textContent = LANG === "en" ? "EN" : "BM";
  $("#acct").innerHTML = m.signed ? (m.photo ? '<img src="' + E(m.photo) + '" alt="">' : '') + '<span>' + E(m.email || m.name || "") + '</span><button class="chip" id="out">' + T("Log keluar", "Sign out") + '</button>' : '';
  var o = $("#out"); if(o) o.onclick = function(){ if(confirm(T("Log keluar? Salinan dalam pelayar ini dipadam; data dalam Drive kekal.", "Sign out? The copy in this browser is cleared; data in Drive stays."))) signOut(); };
  document.querySelectorAll("[data-t]").forEach(function(x){ var p = x.getAttribute("data-t").split("|"); x.textContent = T(p[0], p[1]); }); }

function draw(){ head(); nav(); var m = DS.meta(), el = $("#main");
  if(!m.signed){ el.innerHTML = '<div class="card signin"><img src="icon.svg" alt="" width="64"><h2>My Ihsan</h2><p>' + T("Lihat dan ubah data My Ihsan anda di mana-mana pelayar. Data datang dari folder tersembunyi aplikasi dalam Google Drive anda sendiri; pembangun tidak dapat melihatnya.", "See and edit your My Ihsan data in any browser. It comes from the hidden app folder in your own Google Drive; the developer cannot see it.") + '</p>' +
      (CFG.webClientId || TEST ? '<button class="btn gold" id="in">G&nbsp; ' + T("Log masuk dengan Google", "Sign in with Google") + '</button>' : '<p class="mut">' + T("Papan pemuka belum disediakan: pemilik perlu menambah Web client ID dalam app/config.js.", "The dashboard is not set up yet: the owner must add the Web client ID in app/config.js.") + '</p>') +
      '<p class="mut tiny">' + T("Mula-mula, dalam aplikasi telefon: ketik ⟳ di bar atas › Log masuk dengan Google.", "First, in the phone app: tap ⟳ in the top bar › Sign in with Google.") + '</p></div>';
    var b = $("#in"); if(b) b.onclick = TEST ? function(){ DS.signedIn({email:"test@example.com"}); DS.sync({manual:true, full:true}).then(draw); draw(); } : signIn; return; }
  if(Q) return search(el);
  var f = {home:home, notes:notes, niaga:niaga, conflicts:conflicts, menu:menu}[PG]; if(f) f(el); else section(el, PG); }

// ---------- Home ----------
function home(el){ var t = ymd(), plog = J("ihsan_prlog", []), solat = {}; (Array.isArray(plog) ? plog : []).forEach(function(r){ if(r && r.d === t && r.s) solat[r.s] = 1; });
  var notesL = J("ihsan_notes", []), biz = J("ihsan_biz", null), runs = J("ihsan_runs", []), wk = Date.now() - 7 * 864e5, km = 0; (Array.isArray(runs) ? runs : []).forEach(function(r){ if((r.t || r.at || 0) > wk) km += +r.km || (+r.dist || 0) / 1000; });
  var exp = J("ihsan_expense", {}), m0 = t.slice(0, 7), spent = 0; ((exp && exp.tx) || []).forEach(function(x){ if(x.t === "out" && String(x.date).slice(0, 7) === m0) spent += (+x.amt || 0) / 100; });
  var nz = niagaSum(biz);
  var tile = function(ic, a, b, v){ return '<div class="tile"><small>' + ic + ' ' + T(a, b) + '</small><b>' + v + '</b></div>'; };
  var h = '<h2>' + T("Hari ini", "Today") + '</h2><div class="tiles">' + tile("🕌", "Solat", "Prayers", Object.keys(solat).length + "/5") + tile("📝", "Nota", "Notes", (Array.isArray(notesL) ? notesL.filter(function(n){ return !n.arch; }).length : 0)) +
    tile("💰", "Kutipan bulan ini", "Collected this month", rm(nz.col)) + tile("⏳", "Belum dibayar", "Unpaid", rm(nz.unpaid)) + tile("💸", "Belanja bulan ini", "Spent this month", rm(spent)) + tile("🏃", "Gerak 7 hari", "Move 7 days", (Math.round(km * 10) / 10) + " km") + '</div>';
  h += '<div class="grid">';
  h += '<div class="card"><h3>📝 ' + T("Nota terkini", "Latest notes") + '</h3>' + (Array.isArray(notesL) && notesL.length ? notesL.filter(function(n){ return !n.arch; }).slice(0, 5).map(function(n){ return '<div class="row"><span>' + (n.p ? "📌 " : "") + E(n.t || (n.b || "").slice(0, 40) || "—") + '</span></div>'; }).join("") : '<div class="mut">—</div>') + '<p><button class="btn alt" data-go="notes">' + T("Buka", "Open") + ' ›</button></p></div>';
  h += '<div class="card"><h3>📑 Niaga</h3>' + (nz.docs.length ? nz.docs.slice(0, 5).map(function(d){ return '<div class="row"><span>' + E(d.no || T("Draf", "Draft")) + ' · ' + E((d.cust || {}).name || "") + '</span><small>' + rm((d.totals || {}).total) + '</small></div>'; }).join("") : '<div class="mut">—</div>') + '<p><button class="btn alt" data-go="niaga">' + T("Buka", "Open") + ' ›</button></p></div>';
  var ev = J("ihsan_events", {}), up = ((ev && ev.list) || []).filter(function(e){ return (e.date || e.d || "") >= t; }).sort(function(a, b){ return String(a.date || a.d).localeCompare(String(b.date || b.d)); }).slice(0, 5);
  h += '<div class="card"><h3>📅 ' + T("Akan datang", "Coming up") + '</h3>' + (up.length ? up.map(function(e){ return '<div class="row"><span>' + E(e.n || e.title || e.name || "—") + '</span><small>' + E(e.date || e.d) + '</small></div>'; }).join("") : '<div class="mut">—</div>') + '</div>';
  var rec = J("ihsan_recipes", []); h += '<div class="card"><h3>🍲 ' + T("Resepi", "Recipes") + '</h3><div class="mut">' + (Array.isArray(rec) ? rec.length : 0) + T(" resepi", " recipes") + '</div><p><button class="btn alt" data-go="recipes">' + T("Buka", "Open") + ' ›</button></p></div>';
  h += '<div class="card"><h3>🔒 ' + T("Peribadi", "Private") + '</h3><div class="mut small">' + T("Haid & Jaga hanya disegerak jika anda hidupkan dalam aplikasi telefon, dan dikunci di sini.", "Period & Care only sync if you turn them on in the phone app, and are locked here.") + '</div></div>';
  el.innerHTML = h + '</div>'; el.querySelectorAll("[data-go]").forEach(function(b){ b.onclick = function(){ go(b.getAttribute("data-go")); }; }); }
function niagaSum(biz){ var o = {col:0, unpaid:0, over:0, quotes:0, docs:[]}, t = ymd(), m0 = t.slice(0, 7); if(!biz || !Array.isArray(biz.docs)) return o;
  var pid = biz.cur || ((biz.profiles || [])[0] || {}).id;
  o.docs = biz.docs.filter(function(d){ return !d.del && (!pid || d.pid === pid); }).sort(function(a, b){ return String(b.date).localeCompare(String(a.date)); });
  o.docs.forEach(function(d){ var tt = d.totals || {}, r = d.cur && d.rate ? +d.rate : 1; if(d.status === "void" || d.status === "draft") return;
    if((d.type === "OR" && String(d.pdate || d.date).slice(0, 7) === m0) || (d.type === "CS" && String(d.date).slice(0, 7) === m0)) o.col += (+tt.total || 0) * r;
    if(d.type === "INV" && +tt.bal > 0){ o.unpaid += tt.bal * r; if(d.due && d.due < t) o.over += tt.bal * r; }
    if(d.type === "QT" && d.status === "sent" && !(d.to || []).length) o.quotes += (+tt.total || 0) * r; }); return o; }

// ---------- Notes (edit) ----------
var EDIT = null;
function notes(el){ var L = J("ihsan_notes", []); L = Array.isArray(L) ? L : [];
  if(EDIT){ return noteEditor(el, L); }
  var show = L.filter(function(n){ return !n.arch; }).sort(function(a, b){ return (b.p ? 1 : 0) - (a.p ? 1 : 0); });
  el.innerHTML = '<h2>📝 ' + T("Nota", "Notes") + ' <span class="badge e">' + T("Ubah", "Edit") + '</span></h2><p><button class="btn gold" id="nn">＋ ' + T("Nota baru", "New note") + '</button></p><div class="grid">' +
    show.map(function(n){ return '<div class="note" data-n="' + E(n.id) + '"' + (n.c ? ' style="background:' + E(n.c) + '"' : '') + '><b>' + (n.p ? "📌 " : "") + E(n.t || "") + '</b><p>' + (n.cl ? n.cl.map(function(x){ return (x.k ? "☑ " : "☐ ") + E(x.x); }).join("\n") : E(n.b || "")) + '</p></div>'; }).join("") + '</div>' + (show.length ? '' : '<div class="card mut">' + T("Tiada nota.", "No notes.") + '</div>');
  $("#nn").onclick = function(){ EDIT = {id:"n" + Date.now().toString(36), t:"", b:"", _new:1}; draw(); };
  el.querySelectorAll("[data-n]").forEach(function(d){ d.onclick = function(){ var n = L.filter(function(x){ return String(x.id) === d.getAttribute("data-n"); })[0]; if(n){ EDIT = JSON.parse(JSON.stringify(n)); draw(); } }; }); }
function noteEditor(el, L){ var n = EDIT, COL = ["", "#5c2b29", "#614a19", "#635d19", "#345920", "#16504b", "#2d555e", "#1e3a5f", "#42275e"];
  el.innerHTML = '<h2>' + (n._new ? T("Nota baru", "New note") : T("Ubah nota", "Edit note")) + '</h2><div class="card edit"><input id="nt" placeholder="' + T("Tajuk", "Title") + '" value="' + E(n.t) + '">' +
    (n.cl ? '<div id="ncl">' + n.cl.map(function(x, i){ return '<div class="cl"><input type="checkbox" data-k="' + i + '"' + (x.k ? " checked" : "") + '><input type="text" data-x="' + i + '" value="' + E(x.x) + '"><button class="chip" data-del="' + i + '">✕</button></div>'; }).join("") + '</div><button class="chip" id="nadd">＋ ' + T("Item", "Item") + '</button>'
      : '<textarea id="nb" placeholder="' + T("Tulis…", "Write…") + '">' + E(n.b || "") + '</textarea>') +
    '<div>' + COL.map(function(c){ return '<button class="chip' + ((n.c || "") === c ? " on" : "") + '" data-c="' + c + '" style="background:' + (c || "var(--card2)") + '">&nbsp;</button>'; }).join(" ") + '</div>' +
    '<label class="sw"><input type="checkbox" id="np"' + (n.p ? " checked" : "") + '>📌 ' + T("Semat", "Pin") + '</label>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn gold" id="ns">✓ ' + T("Simpan", "Save") + '</button><button class="btn alt" id="nmode">' + (n.cl ? T("Jadikan teks", "Make text") : T("Jadikan senarai", "Make checklist")) + '</button><button class="btn alt" id="nx">' + T("Batal", "Cancel") + '</button>' + (n._new ? '' : '<button class="btn alt" id="nd">🗑 ' + T("Padam", "Delete") + '</button>') + '</div></div>';
  var grab = function(){ n.t = $("#nt").value; if(n.cl){ el.querySelectorAll("[data-x]").forEach(function(i){ n.cl[+i.getAttribute("data-x")].x = i.value; }); el.querySelectorAll("[data-k]").forEach(function(i){ n.cl[+i.getAttribute("data-k")].k = i.checked; }); } else n.b = $("#nb").value; n.p = $("#np").checked; };
  el.querySelectorAll("[data-c]").forEach(function(b){ b.onclick = function(){ grab(); n.c = b.getAttribute("data-c"); draw(); }; });
  var a = $("#nadd"); if(a) a.onclick = function(){ grab(); n.cl.push({x:""}); draw(); };
  el.querySelectorAll("[data-del]").forEach(function(b){ b.onclick = function(){ grab(); n.cl.splice(+b.getAttribute("data-del"), 1); draw(); }; });
  $("#nmode").onclick = function(){ grab(); if(n.cl){ n.b = n.cl.map(function(x){ return x.x; }).join("\n"); delete n.cl; } else { n.cl = String(n.b || "").split("\n").filter(Boolean).map(function(x){ return {x:x}; }); delete n.b; } draw(); };
  $("#nx").onclick = function(){ EDIT = null; draw(); };
  $("#ns").onclick = function(){ grab(); var isNew = n._new; delete n._new; n.u = Date.now(); var i = L.map(function(x){ return String(x.id); }).indexOf(String(n.id)); if(i >= 0) L[i] = n; else L.unshift(n); put("ihsan_notes", L); EDIT = null; draw(); toast(T("Disimpan. Akan sync ke telefon.", "Saved. It will sync to the phone.")); };
  var d = $("#nd"); if(d) d.onclick = function(){ if(!confirm(T("Padam nota ini?", "Delete this note?"))) return; put("ihsan_notes", L.filter(function(x){ return String(x.id) !== String(n.id); })); EDIT = null; draw(); }; }

// ---------- Niaga (view; issued documents are never edited here) ----------
function niaga(el){ var biz = J("ihsan_biz", null); if(!biz || !(biz.profiles || []).length){ el.innerHTML = '<h2>📑 Niaga</h2><div class="card mut">' + T("Tiada data perniagaan lagi.", "No business data yet.") + '</div>'; return; }
  var p = (biz.profiles || []).filter(function(x){ return x.id === biz.cur && !x.del; })[0] || biz.profiles[0], s = niagaSum(biz), cur = {MYR:"RM", SGD:"S$", USD:"US$", IDR:"Rp", BND:"B$"}[p.base || "MYR"] || p.base;
  var TY = {QT:T("Sebut harga", "Quotation"), INV:T("Invois", "Invoice"), CS:T("Bil tunai", "Cash sale"), OR:T("Resit", "Receipt"), DO:T("Nota hantaran", "Delivery order"), PF:"Proforma", CN:T("Nota kredit", "Credit note"), DN:T("Nota debit", "Debit note"), PO:T("Pesanan belian", "Purchase order"), PV:T("Baucar bayaran", "Payment voucher")};
  var h = '<h2>📑 ' + E(p.name) + ' <span class="badge">' + T("Lihat", "View") + '</span></h2><div class="tiles">' +
    [["💰", "Kutipan bulan ini", "Collected this month", s.col], ["⏳", "Belum dibayar", "Unpaid", s.unpaid], ["⚠️", "Lewat", "Overdue", s.over], ["📝", "Sebut harga terbuka", "Open quotes", s.quotes]].map(function(x){ return '<div class="tile"><small>' + x[0] + ' ' + T(x[1], x[2]) + '</small><b>' + rm(x[3], cur) + '</b></div>'; }).join("") + '</div>';
  h += '<div class="card"><h3>' + T("Dokumen", "Documents") + '</h3><table><tr><th>' + T("No.", "No.") + '</th><th>' + T("Jenis", "Type") + '</th><th>' + T("Tarikh", "Date") + '</th><th>' + T("Pelanggan", "Customer") + '</th><th class="n">' + T("Jumlah", "Total") + '</th><th class="n">' + T("Baki", "Balance") + '</th><th>Status</th></tr>' +
    s.docs.slice(0, 200).map(function(d){ var tt = d.totals || {}; return '<tr><td>' + E(d.no || T("Draf", "Draft")) + '</td><td>' + E(TY[d.type] || d.type) + '</td><td>' + E(d.date) + '</td><td>' + E((d.cust || {}).name || "") + '</td><td class="n">' + E((+tt.total || 0).toFixed(2)) + '</td><td class="n">' + (d.type === "INV" ? E((+tt.bal || 0).toFixed(2)) : "") + '</td><td>' + E(d.status) + '</td></tr>'; }).join("") + '</table></div>';
  var cs = (biz.customers || []).filter(function(c){ return !c.del && c.pid === p.id; });
  h += '<div class="grid"><div class="card"><h3>👥 ' + T("Pelanggan", "Customers") + ' (' + cs.length + ')</h3>' + cs.slice(0, 30).map(function(c){ return '<div class="row"><span>' + E(c.name) + '</span><small>' + E(c.phone || "") + '</small></div>'; }).join("") + '</div>' +
    '<div class="card"><h3>📦 ' + T("Barang", "Items") + '</h3>' + (biz.items || []).filter(function(x){ return !x.del && x.pid === p.id; }).slice(0, 30).map(function(x){ return '<div class="row"><span>' + E(x.name) + '</span><small>' + rm(x.price, cur) + '</small></div>'; }).join("") + '</div></div>' +
    '<p class="mut tiny">' + T("Nombor dokumen, PDF dan WhatsApp kekal di telefon.", "Document numbers, PDFs and WhatsApp stay on the phone.") + '</p>';
  el.innerHTML = h; }

// ---------- any section: one card per stored key ----------
function label(v){ if(v == null) return ""; if(typeof v !== "object") return String(v).slice(0, 80);
  var f = ["t", "title", "name", "n", "no", "desc", "x", "note", "label"]; for(var i = 0; i < f.length; i++) if(v[f[i]] != null && typeof v[f[i]] !== "object") return String(v[f[i]]).slice(0, 80);
  return JSON.stringify(v).slice(0, 80); }
function section(el, id){ var s = DS.SECTIONS.filter(function(x){ return x[0] === id; })[0]; if(!s){ go("home"); return; }
  var right = s[4], badge = right === "e" ? '<span class="badge e">' + T("Ubah dalam aplikasi", "Edit in the app") + '</span>' : right === "p" ? '<span class="badge p">PIN</span>' : '<span class="badge">' + T("Lihat", "View") + '</span>';
  if(right === "p"){ el.innerHTML = '<h2>' + s[1] + ' ' + T(s[2], s[3]) + ' ' + badge + '</h2><div class="card mut">🔒 ' + T("Bahagian peribadi. Kunci PIN web akan datang; buat masa ini lihat dalam aplikasi telefon.", "Private section. A web PIN lock is coming; for now view it in the phone app.") + '</div>'; return; }
  var keys = STORE.keys().filter(function(k){ return DS.sectionOf(k) === id; }).sort();
  el.innerHTML = '<h2>' + s[1] + ' ' + T(s[2], s[3]) + ' ' + badge + '</h2>' + (keys.length ? '<div class="grid">' + keys.map(function(k){ var it = DS.itemize(STORE.get(k)), ks = Object.keys(it.items);
      return '<div class="card"><h3>' + E(k.replace("ihsan_", "")) + ' <small class="mut">' + ks.length + '</small></h3>' + ks.slice(0, 12).map(function(ik){ return '<div class="row"><span>' + E(label(it.items[ik].v)) + '</span></div>'; }).join("") + (ks.length > 12 ? '<div class="mut tiny">+' + (ks.length - 12) + '</div>' : '') + '</div>'; }).join("") + '</div>'
    : '<div class="card mut">' + T("Tiada data lagi untuk bahagian ini.", "No data for this section yet.") + '</div>'); }
function conflicts(el){ var c = DS.conflicts();
  el.innerHTML = '<h2>⚠️ ' + T("Konflik", "Conflicts") + '</h2><p class="mut">' + T("Bila satu perkara diubah di dua peranti, yang terbaru kekal dan yang lain disimpan di sini.", "When one thing was changed on two devices, the newer one stays and the other is kept here.") + '</p>' +
    (c.length ? c.map(function(x, i){ return '<div class="card"><div class="row"><span><b>' + E(x.key.replace("ihsan_", "")) + '</b> · ' + E(label(x.lost)) + '</span><button class="btn alt" data-r="' + i + '">↺ ' + T("Pulihkan", "Restore") + '</button></div></div>'; }).join("") : '<div class="card mut">' + T("Tiada konflik.", "No conflicts.") + '</div>');
  el.querySelectorAll("[data-r]").forEach(function(b){ b.onclick = function(){ DS.restoreConflict(+b.getAttribute("data-r")); toast("↺"); draw(); }; }); }
function menu(el){ el.innerHTML = '<h2>☰ ' + T("Semua bahagian", "All sections") + '</h2><div class="grid">' + PAGES.map(function(p){ return '<button class="card" data-go="' + p[0] + '" style="text-align:left;color:var(--fg)">' + p[1] + ' ' + T(p[2], p[3]) + '</button>'; }).join("") + '</div>';
  el.querySelectorAll("[data-go]").forEach(function(b){ b.onclick = function(){ go(b.getAttribute("data-go")); }; }); }
function search(el){ var q = Q.toLowerCase(), out = [];
  STORE.keys().forEach(function(k){ var s = DS.sectionOf(k); if(!s || s === "care") return; var it = DS.itemize(STORE.get(k)); Object.keys(it.items).forEach(function(ik){ var t = JSON.stringify(it.items[ik].v); if(t && t.toLowerCase().indexOf(q) >= 0) out.push([s, k, it.items[ik].v]); }); });
  el.innerHTML = '<h2>🔍 "' + E(Q) + '"</h2>' + (out.length ? out.slice(0, 100).map(function(r){ return '<div class="card"><div class="row"><span>' + E(label(r[2])) + '</span><small>' + E(r[0]) + ' · ' + E(r[1].replace("ihsan_", "")) + '</small></div></div>'; }).join("") : '<div class="card mut">' + T("Tiada hasil.", "No results.") + '</div>'); }

// ---------- start ----------
idb().then(function(db){ DB = db; return idbAll(); }).then(function(){
  DS.init({store:STORE, getToken:getToken, invalidate:function(){ TOK = null; }, apiBase:TEST && TEST.apiBase, onStatus:function(){ head(); }, onChanged:function(){ draw(); }});
  $("#syncNow").onclick = function(){ if(!DS.meta().signed){ signIn(); return; } DS.sync({manual:true}).then(draw); };
  $("#auto").onchange = function(){ DS.setAuto(this.checked); };
  $("#lang").onclick = function(){ LANG = LANG === "en" ? "ms" : "en"; try{ localStorage.setItem("ihsan_web_lang", LANG); }catch(e){} draw(); };
  $("#q").oninput = function(){ Q = this.value.trim(); draw(); };
  window.addEventListener("hashchange", function(){ var p = location.hash.slice(1); if(p && p !== PG){ PG = p; draw(); } });
  var tick = function(){ if(DS.meta().signed && document.visibilityState === "visible") DS.auto(); };
  setInterval(tick, 60000); document.addEventListener("visibilitychange", tick); window.addEventListener("online", tick);
  draw(); if(DS.meta().signed) setTimeout(function(){ DS.auto(); }, 800);
  if("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(function(){}); });
window.MyIhsanWeb = {draw:draw, store:STORE};
})();
