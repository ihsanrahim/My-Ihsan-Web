/* My Ihsan 0.5.24: Bahagi bil (Split a bill), shared, Splitwise style, with no accounts.
   - A trip ("Umrah Dis", "Makan Jumaat") has a random id and a random key. The invite link carries both in its #fragment,
     which browsers and apps never send to any server. Everyone with the link joins and taps their own name: that is who they are.
   - Every change is a small event ("Ali added RM 60 taxi", "Abu paid Me RM 40"), sealed with AES-256-GCM using the trip key and
     sent to free public Nostr relays (kind 1778, stored), the same ones Groups uses. Relays only see random-looking data.
     Events merge in time order, so phones that were offline catch up without clashes; edits and deletions show in the history.
   - Works offline: changes wait in an outbox and go out when there is internet.
   - The same file runs inside the app (Kewangan › Bahagi bil) and on the web page for friends without the app
     (https://ihsanrahim.github.io/My-Ihsan-Web/split/), each passing a small adapter U.
   SharedSplit.open(el, U, opt) ; SharedSplit.link(el, U, url) ; SharedSplit.parse(url)
   U = {L(ms,en), esc, toast, sheet(title, html) -> element, close(), load(k, def), save(k, v), share(text), copy(text), en(), app: bool,
        names(): [] (optional, e.g. family tree), toDebts([{dir, who, amt, desc}]) (optional), legacy() / legacyDone() (optional)} */
(function(){ "use strict";
var K = window.NostrKit, KIND = 1778, RELAYS = window.SPLIT_RELAYS || ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net"];
var LINK = "https://ihsanrahim.github.io/My-Ihsan-Web/split/#";
var CURS = ["RM","SAR","USD","SGD","IDR","THB","BND","EUR","GBP","AUD","JPY","KRW","TRY","EGP","AED","QAR","CNY","INR"];
var CATS = [["food","🍽️","Makan","Food"],["taxi","🚕","Pengangkutan","Transport"],["hotel","🏨","Penginapan","Stay"],["shop","🛒","Barang","Shopping"],["fuel","⛽","Minyak / tol","Fuel / toll"],["ticket","🎟️","Tiket","Tickets"],["gift","🎁","Hadiah","Gift"],["other","🧾","Lain-lain","Other"]];
var U = null, host = null, cur = null, live = null, opt = {};
function L(a, b){ return U.L(a, b); }
function E(s){ return U.esc(s == null ? "" : String(s)); }
function now(){ return Math.floor(Date.now()/1000); }
function hex(b){ return K.bytesToHex(b); } function unhex(h){ return K.hexToBytes(h); }
function sha(s){ return hex(K.sha256(K.utf8ToBytes(s))); }
function rid(n){ return hex(K.randomBytes(n || 8)); }
function b64(u8){ var s = ""; for(var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); }
function unb64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function b64u(s){ return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function unb64u(s){ s = s.replace(/-/g, "+").replace(/_/g, "/"); while(s.length % 4) s += "="; return decodeURIComponent(escape(atob(s))); }
function seal(key, o){ var n = K.randomBytes(12), ct = K.gcm(unhex(key), n).encrypt(K.utf8ToBytes(JSON.stringify(o))), out = new Uint8Array(12 + ct.length); out.set(n); out.set(ct, 12); return b64(out); }
function unseal(key, s){ try{ var u = unb64(s), pt = K.gcm(unhex(key), u.slice(0, 12)).decrypt(u.slice(12)); return JSON.parse(new TextDecoder().decode(pt)); }catch(e){ return null; } }
function r2(n){ return Math.round((+n || 0) * 100) / 100; }

// ---------- storage ----------
function db(){ var s = U.load("ihsan_split", null) || {}; s.trips = s.trips || []; if(!s.sk){ s.sk = hex(K.schnorr.utils.randomPrivateKey()); } if(!s.pub){ s.pub = hex(K.schnorr.getPublicKey(unhex(s.sk))); U.save("ihsan_split", s); } return s; }
function saveDb(s){ U.save("ihsan_split", s); }
function trip(id){ return db().trips.filter(function(t){ return t.id === id; })[0]; }
function putTrip(t){ var s = db(), i = -1; s.trips.forEach(function(x, j){ if(x.id === t.id) i = j; }); if(i < 0) s.trips.push(t); else s.trips[i] = t; saveDb(s); }
function evs(id){ return U.load("ihsan_splitev_" + id, null) || {}; }
function saveEvs(id, m){ U.save("ihsan_splitev_" + id, m); }
function outbox(){ return U.load("ihsan_splitout", []) || []; }
function saveOut(o){ U.save("ihsan_splitout", o); }
function tagOf(t){ return sha("myihsan-split:" + t.id + ":" + t.key).slice(0, 32); }

// ---------- events ----------
function evId(e){ return sha(JSON.stringify([0, e.pubkey, e.created_at, e.kind, e.tags, e.content])); }
function verify(e){ try{ return e && e.kind === KIND && evId(e) === e.id && K.schnorr.verify(unhex(e.sig), unhex(e.id), unhex(e.pubkey)); }catch(x){ return false; } }
function ingest(t, e){ var m = evs(t.id); if(m[e.id]) return false; var p = unseal(t.key, e.content); if(!p) return false;
  m[e.id] = {at: e.created_at, pub: e.pubkey, p: p}; saveEvs(t.id, m); return true; }
var seq = 0;
function publish(t, payload){ payload.ms = Date.now() * 1000 + (seq++ % 1000); var s = db(), e = {pubkey: s.pub, created_at: now(), kind: KIND, tags: [["t", tagOf(t)]], content: seal(t.key, payload)};
  e.id = evId(e); e.sig = hex(K.schnorr.sign(unhex(e.id), unhex(s.sk))); ingest(t, e);
  var o = outbox(); o.push({e: e, r: t.relays || RELAYS, trip: t.id}); saveOut(o); if(live && live.t.id === t.id) live.flush(); return e.id; }

// ---------- state: replay the events in time order ----------
function state(t){ var m = evs(t.id), list = Object.keys(m).map(function(k){ var x = m[k]; return {id: k, at: x.at, pub: x.pub, p: x.p}; }).sort(function(a, b){ return a.at - b.at || ((a.p.ms || 0) - (b.p.ms || 0)) || (a.id < b.id ? -1 : 1); });
  var st = {name: t.name || "", cur: t.cur || "RM", ppl: {}, order: [], bills: {}, pays: {}, hist: [], n: list.length};
  var who = function(pid){ return st.ppl[pid] ? st.ppl[pid].n : "?"; };
  list.forEach(function(x){ var p = x.p, by = x.pub;
    if(p.t === "meta"){ if(p.name) st.name = String(p.name).slice(0, 60); if(p.cur) st.cur = String(p.cur).slice(0, 4); }
    else if(p.t === "person" && p.pid && p.n){ if(!st.ppl[p.pid]){ st.ppl[p.pid] = {pid: p.pid, n: String(p.n).slice(0, 30), at: x.at}; st.order.push(p.pid); st.hist.push({at: x.at, x: "👤 " + L("Ditambah: ", "Added: ") + p.n}); } }
    else if(p.t === "rename" && st.ppl[p.pid] && p.n){ st.hist.push({at: x.at, x: "✏️ " + who(p.pid) + " → " + p.n}); st.ppl[p.pid].n = String(p.n).slice(0, 30); }
    else if(p.t === "payinfo" && st.ppl[p.pid]){ st.ppl[p.pid].pay = String(p.x || "").slice(0, 120); }
    else if(p.t === "bill" && p.bid && p.d){ var old = st.bills[p.bid], d = cleanBill(p.d);
      st.bills[p.bid] = {bid: p.bid, d: d, at: old ? old.at : x.at, ed: old ? x.at : 0, gone: false};
      st.hist.push({at: x.at, x: (old ? "✏️ " : "➕ ") + who(d.by) + ": " + (d.what || L("Bil", "Bill")) + " " + money(st.cur, d.amt)}); }
    else if(p.t === "del" && st.bills[p.ref]){ st.bills[p.ref].gone = true; st.hist.push({at: x.at, x: "🗑 " + (st.bills[p.ref].d.what || L("Bil", "Bill")) + " " + money(st.cur, st.bills[p.ref].d.amt)}); }
    else if(p.t === "pay" && p.id && st.ppl[p.f] && st.ppl[p.to]){ st.pays[p.id] = {id: p.id, f: p.f, to: p.to, amt: r2(p.amt), at: x.at, gone: false}; st.hist.push({at: x.at, x: "✓ " + who(p.f) + " → " + who(p.to) + " " + money(st.cur, p.amt)}); }
    else if(p.t === "unpay" && st.pays[p.ref]){ st.pays[p.ref].gone = true; st.hist.push({at: x.at, x: "↺ " + L("Bayaran dibatalkan", "Payment undone")}); }
  });
  return st; }
function cleanBill(d){ var o = {what: String(d.what || "").slice(0, 60), cat: d.cat || "other", amt: r2(d.amt), by: d.by, mode: d.mode === "amt" || d.mode === "shr" ? d.mode : "eq", date: d.date || "", w: {}, for: []};
  if(d.w) Object.keys(d.w).forEach(function(k){ o.w[k] = Math.max(0, +d.w[k] || 0); }); if(Array.isArray(d.for)) o.for = d.for.slice(0, 200); return o; }
function money(c, n){ n = +n || 0; var z = c === "IDR" || c === "JPY" || c === "KRW" ? 0 : 2; return c + " " + n.toLocaleString("en-MY", {minimumFractionDigits: z, maximumFractionDigits: z}); }
// what each person's share of a bill is
function shares(st, b){ var d = b.d, out = {}, ids = st.order;
  ids.forEach(function(p){ out[p] = 0; });
  if(d.mode === "amt"){ Object.keys(d.w).forEach(function(p){ if(p in out) out[p] = +d.w[p] || 0; }); }
  else if(d.mode === "shr"){ var tw = 0; Object.keys(d.w).forEach(function(p){ if(p in out) tw += +d.w[p] || 0; }); if(tw > 0) Object.keys(d.w).forEach(function(p){ if(p in out) out[p] = d.amt * (+d.w[p] || 0) / tw; }); }
  else { var who = d.for.filter(function(p){ return p in out; }); if(!who.length) who = ids.slice(); who.forEach(function(p){ out[p] = d.amt / who.length; }); }
  return out; }
function balances(st){ var bal = {}; st.order.forEach(function(p){ bal[p] = 0; });
  Object.keys(st.bills).forEach(function(k){ var b = st.bills[k]; if(b.gone || !(b.d.by in bal)) return; bal[b.d.by] += b.d.amt; var s = shares(st, b); Object.keys(s).forEach(function(p){ bal[p] -= s[p]; }); });
  Object.keys(st.pays).forEach(function(k){ var p = st.pays[k]; if(p.gone) return; bal[p.f] += p.amt; bal[p.to] -= p.amt; });
  Object.keys(bal).forEach(function(p){ bal[p] = r2(bal[p]); }); return bal; }
// fewest payments: the biggest debtor pays the biggest creditor, repeat
function settle(st){ var bal = balances(st), dr = [], cr = [], out = [];
  Object.keys(bal).forEach(function(p){ if(bal[p] < -0.009) dr.push([p, -bal[p]]); else if(bal[p] > 0.009) cr.push([p, bal[p]]); });
  dr.sort(function(a, b){ return b[1] - a[1]; }); cr.sort(function(a, b){ return b[1] - a[1]; });
  var i = 0, j = 0; while(i < dr.length && j < cr.length){ var x = Math.min(dr[i][1], cr[j][1]); out.push({f: dr[i][0], to: cr[j][0], amt: r2(x)}); dr[i][1] -= x; cr[j][1] -= x; if(dr[i][1] < 0.01) i++; if(cr[j][1] < 0.01) j++; }
  return out.filter(function(p){ return p.amt >= 0.01; }); }

// ---------- relays (only for the trip that is open, plus the outbox) ----------
function Live(t, onChange){ var self = this, socks = {}, alive = true; self.t = t; self.n = 0;
  var tg = tagOf(t), rs = t.relays || RELAYS;
  var open1 = function(u){ var ws; try{ ws = new WebSocket(u); }catch(e){ return; } socks[u] = ws;
    ws.onopen = function(){ self.n++; onChange("net"); try{ ws.send(JSON.stringify(["REQ", "sp" + tg.slice(0, 8), {kinds: [KIND], "#t": [tg], limit: 3000}])); }catch(e){} self.flush(); };
    ws.onmessage = function(m){ var d; try{ d = JSON.parse(m.data); }catch(e){ return; }
      if(d[0] === "EVENT" && d[2] && verify(d[2])){ if(ingest(t, d[2])){ clearTimeout(self.tm); self.tm = setTimeout(function(){ onChange("ev"); }, 120); } }
      else if(d[0] === "EOSE"){ self.synced = true; onChange("eose"); }
      else if(d[0] === "OK" && d[2]){ var o = outbox().filter(function(x){ return x.e.id !== d[1]; }); saveOut(o); onChange("sent"); } };
    ws.onclose = function(){ if(socks[u] === ws){ delete socks[u]; self.n = Math.max(0, self.n - 1); onChange("net"); } if(alive) setTimeout(function(){ if(alive) open1(u); }, 5000); };
    ws.onerror = function(){}; };
  self.flush = function(){ outbox().forEach(function(x){ (x.r || RELAYS).forEach(function(u){ var ws = socks[u]; if(ws && ws.readyState === 1) try{ ws.send(JSON.stringify(["EVENT", x.e])); }catch(e){} }); }); };
  self.stop = function(){ alive = false; Object.keys(socks).forEach(function(u){ try{ socks[u].close(); }catch(e){} }); socks = {}; };
  rs.forEach(open1);
  setTimeout(function(){ if(!self.synced){ self.synced = true; onChange("eose"); } }, 7000); }
function goLive(t){ if(live && live.t.id === t.id) return; if(live) live.stop(); live = new Live(t, function(why){ if(cur === t.id && host && document.body.contains(host)) draw(why); }); }
function stopLive(){ if(live){ live.stop(); live = null; } }

// ---------- invite links ----------
function link(t){ return LINK + b64u(JSON.stringify({v: 1, i: t.id, k: t.key, n: t.name, r: (t.relays && t.relays.join() !== RELAYS.join()) ? t.relays : undefined})); }
function parse(s){ s = String(s || "").trim(); var i = s.indexOf("#"); if(i < 0) return null; try{ var o = JSON.parse(unb64u(s.slice(i + 1))); return o && o.i && /^[0-9a-f]{64}$/.test(o.k) ? o : null; }catch(e){ return null; } }
function qrSvg(text){ var q = K.qrcode(0, "M"); q.addData(text); q.make(); var n = q.getModuleCount(), z = 4, p = "";
  for(var r = 0; r < n; r++) for(var c = 0; c < n; c++) if(q.isDark(r, c)) p += "M" + (c*z + z*2) + " " + (r*z + z*2) + "h" + z + "v" + z + "h-" + z + "z";
  var w = n*z + z*4; return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + w + '" style="width:220px;max-width:70vw;background:#fff;border-radius:10px"><rect width="' + w + '" height="' + w + '" fill="#fff"/><path d="' + p + '" fill="#000"/></svg>'; }

// ---------- screens ----------
function draw(why){ if(!host) return; if(!cur){ home(); return; } var t = trip(cur); if(!t){ cur = null; home(); return; } if(why === "net" || why === "sent"){ var b = host.querySelector(".ssNet"); if(b){ b.outerHTML = netHtml(t); return; } } tripView(t); }
function netHtml(t){ var pend = outbox().filter(function(x){ return x.trip === t.id; }).length, n = live && live.t.id === t.id ? live.n : 0;
  return '<span class="ssNet ' + (n ? 'on' : 'off') + '">' + (n ? '● ' + L("Dalam talian", "Online") : '○ ' + L("Luar talian", "Offline")) + (pend ? ' · ⏳ ' + pend + ' ' + L("menunggu dihantar", "waiting to send") : '') + '</span>'; }
function myBal(t){ var st = state(t), b = balances(st); return t.me && (t.me in b) ? {v: b[t.me], st: st} : {v: null, st: st}; }
function home(){ stopLive(); var s = db();
  var h = '<div class="card"><h3>🧾 ' + L("Bahagi bil", "Split a bill") + '</h3><div class="mut small">' + L("Kongsi satu pautan. Setiap orang masukkan apa yang dia bayar dari telefon sendiri, tanpa akaun. Aplikasi kira siapa bayar siapa.", "Share one link. Everyone adds what they paid from their own phone, with no accounts. The app works out who pays whom.") + '</div>' +
    '<div class="btns" style="margin-top:8px"><button class="btn gold g3d" id="ssNew" style="flex:1">＋ ' + L("Trip baharu", "New trip") + '</button><button class="btn alt g3d" id="ssJoin">🔗 ' + L("Sertai", "Join") + '</button></div></div>';
  s.trips.slice().reverse().forEach(function(t){ var mb = myBal(t), st = mb.st, tot = 0; Object.keys(st.bills).forEach(function(k){ if(!st.bills[k].gone) tot += st.bills[k].d.amt; });
    h += '<button class="card ssTrip" data-st="' + E(t.id) + '"><b>' + E(st.name || t.name) + '</b><span class="mut small">' + st.order.length + ' ' + L("orang", "people") + ' · ' + money(st.cur, tot) + '</span>' +
      (mb.v == null ? '' : '<span class="small ' + (mb.v < 0 ? 'fneg' : mb.v > 0 ? 'fpos' : '') + '">' + (mb.v < -0.009 ? L("Anda perlu bayar ", "You owe ") + money(st.cur, -mb.v) : mb.v > 0.009 ? L("Anda akan terima ", "You get back ") + money(st.cur, mb.v) : '✓ ' + L("Selesai", "Settled")) + '</span>') + '</button>'; });
  host.innerHTML = h;
  host.querySelector("#ssNew").onclick = newTrip;
  host.querySelector("#ssJoin").onclick = function(){ var ov = U.sheet("🔗 " + L("Sertai trip", "Join a trip"), '<div class="mut small">' + L("Tampal pautan jemputan yang dihantar kawan anda.", "Paste the invite link your friend sent you.") + '</div><textarea id="ssJL" class="ilq" rows="3"></textarea><button class="btn gold full g3d" id="ssJOk" style="margin-top:8px">' + L("Sertai", "Join") + '</button>');
    ov.querySelector("#ssJOk").onclick = function(){ var v = ov.querySelector("#ssJL").value; if(!parse(v)){ U.toast(L("Pautan tidak sah", "That link is not valid")); return; } U.close(); join(v); }; };
  host.querySelectorAll("[data-st]").forEach(function(b){ b.onclick = function(){ cur = b.getAttribute("data-st"); draw(); }; }); }
function newTrip(){ var nm = (opt.myName || ""), fam = U.names ? U.names() : [];
  var ov = U.sheet("＋ " + L("Trip baharu", "New trip"), '<label class="small">' + L("Nama trip", "Trip name") + '</label><input id="ssN" class="ilq" maxlength="60" placeholder="' + L("cth. Umrah Disember", "e.g. Umrah December") + '">' +
    '<label class="small">' + L("Nama anda", "Your name") + '</label><input id="ssMe" class="ilq" maxlength="30" value="' + E(nm) + '">' +
    '<label class="small">' + L("Orang lain (satu setiap baris, boleh tambah kemudian)", "Other people (one per line, you can add more later)") + '</label><textarea id="ssP" class="ilq" rows="4"></textarea>' +
    (fam.length ? '<div class="ssChips">' + fam.slice(0, 40).map(function(n){ return '<button class="chip" data-fn="' + E(n) + '">＋ ' + E(n) + '</button>'; }).join("") + '</div>' : '') +
    '<label class="small">' + L("Mata wang", "Currency") + '</label><select id="ssC" class="ilq">' + CURS.map(function(c){ return '<option>' + c + '</option>'; }).join("") + '</select>' +
    '<button class="btn gold full g3d" id="ssOk" style="margin-top:10px">✓ ' + L("Buat dan jemput", "Create and invite") + '</button>');
  ov.querySelectorAll("[data-fn]").forEach(function(b){ b.onclick = function(){ var ta = ov.querySelector("#ssP"); ta.value = (ta.value.trim() ? ta.value.trim() + "\n" : "") + b.getAttribute("data-fn"); b.disabled = true; }; });
  ov.querySelector("#ssOk").onclick = function(){ var me = ov.querySelector("#ssMe").value.trim(), pp = ov.querySelector("#ssP").value.split("\n").map(function(x){ return x.trim().slice(0, 30); }).filter(Boolean);
    if(!me){ U.toast(L("Tulis nama anda", "Type your name")); return; }
    var t = create(ov.querySelector("#ssN").value.trim() || L("Bil bersama", "Shared bills"), ov.querySelector("#ssC").value, me, pp);
    U.close(); cur = t.id; draw(); invite(t); }; }
function create(name, c, me, others, id, key){ var t = {id: id || rid(8), key: key || rid(32), name: name, cur: c || "RM", at: Date.now()};
  putTrip(t); publish(t, {t: "meta", name: name, cur: t.cur}); var mp = rid(6); publish(t, {t: "person", pid: mp, n: me}); t.me = mp; putTrip(t);
  var seen = {}; seen[me.toLowerCase()] = 1; (others || []).forEach(function(n){ if(seen[n.toLowerCase()]) return; seen[n.toLowerCase()] = 1; publish(t, {t: "person", pid: rid(6), n: n}); });
  goLive(t); return t; }
function join(url){ var o = parse(url); if(!o) return; var t = trip(o.i);
  if(!t){ t = {id: o.i, key: o.k, name: o.n || "", relays: o.r, at: Date.now()}; putTrip(t); }
  cur = t.id; goLive(t); draw(); if(!t.me) setTimeout(function(){ pickMe(t, true); }, 50); }
function pickMe(t, first){ var render = function(ov){ var st = state(t), box = ov.querySelector("#ssMeL"); if(!box) return false;
    box.innerHTML = st.order.length ? st.order.map(function(p){ return '<button class="chip' + (t.me === p ? ' on' : '') + '" data-me="' + p + '">' + E(st.ppl[p].n) + '</button>'; }).join("") : '<div class="mut small">⏳ ' + L("Memuatkan senarai nama…", "Loading the names…") + '</div>';
    ov.querySelectorAll("[data-me]").forEach(function(b){ b.onclick = function(){ t.me = b.getAttribute("data-me"); putTrip(t); clearInterval(iv); U.close(); draw(); }; }); return true; };
  var ov = U.sheet("👋 " + L("Siapa anda?", "Which one are you?"), '<div class="mut small">' + (first ? L("Ketik nama anda dalam trip ini. Tiada akaun diperlukan.", "Tap your name in this trip. No account needed.") : L("Tukar siapa anda pada telefon ini.", "Change who you are on this phone.")) + '</div><div class="ssChips" id="ssMeL"></div>' +
    '<label class="small">' + L("Tiada dalam senarai? Tambah nama anda", "Not on the list? Add your name") + '</label><div class="row" style="gap:6px"><input id="ssMeN" class="ilq" style="flex:1" maxlength="30" value="' + E(opt.myName || "") + '"><button class="btn gold g3d" id="ssMeA">＋</button></div>');
  var iv = setInterval(function(){ if(!document.body.contains(ov) || !render(ov)) clearInterval(iv); }, 1500); render(ov);
  ov.querySelector("#ssMeA").onclick = function(){ var n = ov.querySelector("#ssMeN").value.trim(); if(!n) return; var st = state(t), ex = st.order.filter(function(p){ return st.ppl[p].n.toLowerCase() === n.toLowerCase(); })[0];
    if(ex){ t.me = ex; } else { t.me = rid(6); publish(t, {t: "person", pid: t.me, n: n}); } putTrip(t); clearInterval(iv); U.close(); draw(); }; }
function invite(t){ var u = link(t), st = state(t);
  var msg = L("Jom catat perbelanjaan bersama \"", "Let's track our shared costs for \"") + (st.name || t.name) + L("\". Buka pautan ini, ketik nama anda dan masukkan apa yang anda bayar (tiada akaun diperlukan):\n", "\". Open this link, tap your name and add what you paid (no account needed):\n") + u;
  var ov = U.sheet("📤 " + L("Jemput", "Invite"), '<div style="text-align:center">' + qrSvg(u) + '</div><div class="mut small" style="margin:8px 0">' + L("Sesiapa yang ada pautan ini boleh melihat dan menambah bil. Hantar hanya kepada ahli trip.", "Anyone with this link can see and add bills. Send it only to the people on the trip.") + '</div>' +
    '<div class="btns"><button class="btn gold g3d" id="ssWa" style="flex:1">💬 ' + L("Hantar ke WhatsApp", "Send to WhatsApp") + '</button><button class="btn alt g3d" id="ssCp">📋 ' + L("Salin", "Copy") + '</button></div>');
  ov.querySelector("#ssWa").onclick = function(){ U.share(msg, "com.whatsapp"); };
  ov.querySelector("#ssCp").onclick = function(){ U.copy(u); U.toast(L("Pautan disalin", "Link copied")); }; }

function tripView(t){ goLive(t); var st = state(t), bal = balances(st), pays = settle(st), me = t.me, nm = function(p){ return st.ppl[p] ? E(st.ppl[p].n) : "?"; }, c = st.cur;
  var bills = Object.keys(st.bills).map(function(k){ return st.bills[k]; }).filter(function(b){ return !b.gone; }).sort(function(a, b){ return (b.d.date || "").localeCompare(a.d.date || "") || b.at - a.at; });
  var tot = bills.reduce(function(s, b){ return s + b.d.amt; }, 0);
  var h = '<div class="card ssHead"><div class="row" style="gap:6px;align-items:center">' + (opt.noBack ? '' : '<button class="chip" id="ssBack">‹</button>') + '<h3 style="flex:1;margin:0">🧾 ' + E(st.name || t.name) + '</h3><button class="chip" id="ssInv">📤 ' + L("Jemput", "Invite") + '</button><button class="chip" id="ssMore">⋯</button></div>' +
    '<div class="small" style="margin-top:4px">' + L("Jumlah ", "Total ") + '<b>' + money(c, tot) + '</b> · ' + st.order.length + ' ' + L("orang", "people") + ' · ' + netHtml(t) + '</div>' +
    '<button class="chip ssWho" id="ssWho">👤 ' + (me && st.ppl[me] ? L("Saya: ", "Me: ") + nm(me) : L("Pilih nama anda", "Pick your name")) + ' ▾</button>' +
    '<button class="btn gold full g3d ssPaid" id="ssAdd">＋ ' + L("Saya bayar…", "I paid…") + '</button></div>';
  if(!st.order.length) h += '<div class="card mut small">⏳ ' + L("Memuatkan trip dari pelayan geganti… Perlu internet kali pertama.", "Loading the trip from the relays… Needs internet the first time.") + '</div>';
  h += '<div class="card"><h3>🤝 ' + L("Siapa bayar siapa", "Who pays whom") + '</h3>' + (pays.length ? pays.map(function(p, k){ var info = st.ppl[p.to] && st.ppl[p.to].pay;
      return '<div class="ssPay' + (p.f === me || p.to === me ? ' mine' : '') + '"><div class="row" style="gap:6px;align-items:center"><span style="flex:1"><b>' + nm(p.f) + '</b> → <b>' + nm(p.to) + '</b></span><b class="fneg">' + money(c, p.amt) + '</b><button class="chip" data-pd="' + k + '">✓ ' + L("Dibayar", "Paid") + '</button></div>' +
        (info ? '<div class="mut tiny">💳 ' + nm(p.to) + ': ' + E(info) + ' <button class="linkb" data-cp="' + E(info) + '">📋</button></div>' : '') + '</div>'; }).join("") : '<div class="fpos small">✓ ' + L("Semua sudah selesai", "Everyone is settled") + '</div>') +
    (pays.length ? '<button class="chip" id="ssShare" style="margin-top:6px">💬 ' + L("Kongsi ringkasan", "Share the summary") + '</button>' + (U.toDebts && pays.some(function(p){ return p.f === me || p.to === me; }) ? ' <button class="chip" id="ssDebt">➕ ' + L("Bahagian saya ke Hutang", "My part to Debts") + '</button>' : '') : '') + '</div>';
  h += '<div class="card"><h3>⚖️ ' + L("Baki", "Balances") + '</h3>' + st.order.map(function(p){ var v = bal[p]; return '<div class="ssBal"><span>' + nm(p) + (p === me ? ' <span class="mut tiny">(' + L("saya", "me") + ')</span>' : '') + '</span><b class="' + (v < 0 ? 'fneg' : v > 0 ? 'fpos' : '') + '">' + (v > 0 ? '+' : '') + money(c, v) + '</b></div>'; }).join("") +
    '<div class="mut tiny">' + L("+ akan menerima, − perlu membayar", "+ gets money back, − needs to pay") + '</div></div>';
  h += '<div class="card"><h3>📋 ' + L("Bil", "Bills") + ' (' + bills.length + ')</h3>' + (bills.length ? bills.map(function(b){ var cat = CATS.filter(function(x){ return x[0] === b.d.cat; })[0] || CATS[7], s = shares(st, b), mine = me && s[me] ? s[me] : 0;
      return '<button class="ssBill" data-sb="' + b.bid + '"><span class="ssIc">' + cat[1] + '</span><span style="flex:1;min-width:0"><b>' + E(b.d.what || L(cat[2], cat[3])) + '</b><small class="mut"> · ' + nm(b.d.by) + ' ' + L("bayar", "paid") + (b.ed ? ' · ' + L("disunting", "edited") : '') + (mine ? ' · ' + L("bahagian saya ", "my share ") + money(c, mine) : '') + '</small></span><b>' + money(c, b.d.amt) + '</b></button>'; }).join("") : '<div class="mut small">' + L("Belum ada bil. Tekan \"Saya bayar…\".", "No bills yet. Tap \"I paid…\".") + '</div>') + '</div>';
  h += '<details class="card"><summary>🕘 ' + L("Sejarah", "History") + ' (' + st.hist.length + ')</summary>' + st.hist.slice().reverse().slice(0, 80).map(function(x){ return '<div class="mut small">' + new Date(x.at * 1000).toLocaleString(U.en() ? "en-GB" : "ms-MY", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}) + ' · ' + E(x.x) + '</div>'; }).join("") + '</details>';
  host.innerHTML = h;
  var q = function(s, f){ var e = host.querySelector(s); if(e) e.onclick = f; };
  q("#ssBack", function(){ cur = null; draw(); });
  q("#ssInv", function(){ invite(t); });
  q("#ssWho", function(){ pickMe(t, false); });
  q("#ssAdd", function(){ if(!me || !st.ppl[me]){ pickMe(t, true); return; } bill(t, null); });
  q("#ssMore", function(){ more(t); });
  q("#ssShare", function(){ U.share("🧾 " + (st.name || t.name) + "\n" + L("Jumlah ", "Total ") + money(c, tot) + "\n\n" + pays.map(function(p){ var i = st.ppl[p.to].pay; return "• " + st.ppl[p.f].n + " → " + st.ppl[p.to].n + ": " + money(c, p.amt) + (i ? " (" + i + ")" : ""); }).join("\n") + "\n\n" + link(t), ""); });
  q("#ssDebt", function(){ var L2 = []; pays.forEach(function(p){ if(p.f !== me && p.to !== me) return; L2.push({dir: p.f === me ? "owe" : "owed", who: st.ppl[p.f === me ? p.to : p.f].n, amt: p.amt, desc: "🧾 " + (st.name || t.name)}); }); U.toDebts(L2); U.toast(L2.length + " " + L("rekod ditambah ke Hutang", "records added to Debts")); });
  host.querySelectorAll("[data-pd]").forEach(function(b){ b.onclick = function(){ var p = pays[+b.getAttribute("data-pd")]; if(!confirm(st.ppl[p.f].n + " → " + st.ppl[p.to].n + " " + money(c, p.amt) + "\n" + L("Tandakan sebagai sudah dibayar?", "Mark as paid?"))) return; publish(t, {t: "pay", id: rid(6), f: p.f, to: p.to, amt: p.amt}); draw(); }; });
  host.querySelectorAll("[data-cp]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); U.copy(b.getAttribute("data-cp")); U.toast(L("Disalin", "Copied")); }; });
  host.querySelectorAll("[data-sb]").forEach(function(b){ b.onclick = function(){ bill(t, st.bills[b.getAttribute("data-sb")]); }; }); }

function more(t){ var st = state(t), me = t.me;
  var ov = U.sheet("⋯ " + E(st.name || t.name), '<label class="small">' + L("Tambah orang", "Add a person") + '</label><div class="row" style="gap:6px"><input id="ssAP" class="ilq" style="flex:1" maxlength="30"><button class="btn gold g3d" id="ssAPo">＋</button></div>' +
    (me && st.ppl[me] ? '<label class="small">💳 ' + L("Cara bayar kepada saya (cth. DuitNow 012-3456789, Maybank 1234…)", "How to pay me (e.g. DuitNow 012-3456789, bank account…)") + '</label><div class="row" style="gap:6px"><input id="ssPI" class="ilq" style="flex:1" maxlength="120" value="' + E(st.ppl[me].pay || "") + '"><button class="btn gold g3d" id="ssPIo">✓</button></div>' : '') +
    '<label class="small">' + L("Nama orang (ketik untuk tukar)", "People (tap to rename)") + '</label><div class="ssChips">' + st.order.map(function(p){ return '<button class="chip" data-rn="' + p + '">✏️ ' + E(st.ppl[p].n) + '</button>'; }).join("") + '</div>' +
    '<label class="small">' + L("Nama trip dan mata wang", "Trip name and currency") + '</label><div class="row" style="gap:6px"><input id="ssTN" class="ilq" style="flex:1" maxlength="60" value="' + E(st.name) + '"><select id="ssTC" class="ilq" style="width:90px">' + CURS.map(function(c){ return '<option' + (c === st.cur ? ' selected' : '') + '>' + c + '</option>'; }).join("") + '</select><button class="btn gold g3d" id="ssTo">✓</button></div>' +
    '<button class="btn alt full g3d" id="ssLeave" style="margin-top:12px">🗑 ' + L("Buang trip dari telefon ini", "Remove this trip from this phone") + '</button>');
  ov.querySelector("#ssAPo").onclick = function(){ var n = ov.querySelector("#ssAP").value.trim(); if(!n) return; if(st.order.some(function(p){ return st.ppl[p].n.toLowerCase() === n.toLowerCase(); })){ U.toast(L("Nama sudah ada", "That name is already there")); return; } publish(t, {t: "person", pid: rid(6), n: n}); U.close(); draw(); };
  var pi = ov.querySelector("#ssPIo"); if(pi) pi.onclick = function(){ publish(t, {t: "payinfo", pid: me, x: ov.querySelector("#ssPI").value.trim()}); U.close(); draw(); };
  ov.querySelectorAll("[data-rn]").forEach(function(b){ b.onclick = function(){ var p = b.getAttribute("data-rn"), n = prompt(L("Nama baharu", "New name"), st.ppl[p].n); if(n && n.trim()){ publish(t, {t: "rename", pid: p, n: n.trim()}); U.close(); draw(); } }; });
  ov.querySelector("#ssTo").onclick = function(){ publish(t, {t: "meta", name: ov.querySelector("#ssTN").value.trim() || st.name, cur: ov.querySelector("#ssTC").value}); t.name = ov.querySelector("#ssTN").value.trim() || st.name; putTrip(t); U.close(); draw(); };
  ov.querySelector("#ssLeave").onclick = function(){ if(!confirm(L("Buang trip ini dari telefon ini? Orang lain masih boleh melihatnya. Anda boleh sertai semula dengan pautan.", "Remove this trip from this phone? The others still have it. You can rejoin with the link."))) return;
    var s = db(); s.trips = s.trips.filter(function(x){ return x.id !== t.id; }); saveDb(s); U.save("ihsan_splitev_" + t.id, null); stopLive(); cur = null; U.close(); draw(); }; }

// add or edit a bill: amount first, then what for, paid by, split (everyone ticked by default: 3 taps for the usual case)
function bill(t, b0){ var st = state(t), ids = st.order, c = st.cur, isNew = !b0;
  var d = b0 ? JSON.parse(JSON.stringify(b0.d)) : {what: "", cat: "food", amt: "", by: t.me, mode: "eq", for: ids.slice(), w: {}, date: new Date().toISOString().slice(0, 10)};
  var ov = U.sheet((isNew ? "＋ " : "✏️ ") + (isNew ? L("Saya bayar", "I paid") : L("Bil", "Bill")),
    '<div class="ssAmt"><span>' + E(c) + '</span><input id="sbA" type="text" inputmode="decimal" placeholder="0.00" value="' + (d.amt || "") + '"></div>' +
    '<div class="ssChips" id="sbC">' + CATS.map(function(x){ return '<button class="chip' + (d.cat === x[0] ? ' on' : '') + '" data-c="' + x[0] + '">' + x[1] + ' ' + L(x[2], x[3]) + '</button>'; }).join("") + '</div>' +
    '<input id="sbT" class="ilq" maxlength="60" placeholder="' + L("Untuk apa (pilihan)", "What for (optional)") + '" value="' + E(d.what) + '">' +
    '<label class="small">' + L("Dibayar oleh", "Paid by") + '</label><div class="ssChips" id="sbBy">' + ids.map(function(p){ return '<button class="chip' + (d.by === p ? ' on' : '') + '" data-v="' + p + '">' + E(st.ppl[p].n) + '</button>'; }).join("") + '</div>' +
    '<label class="small">' + L("Dikongsi oleh", "Shared by") + ' <span class="mut tiny" id="sbM"></span></label><div id="sbW"></div>' +
    '<div class="ssChips" style="margin-top:4px"><button class="chip' + (d.mode === "eq" ? ' on' : '') + '" data-m="eq">' + L("Sama rata", "Equally") + '</button><button class="chip' + (d.mode === "amt" ? ' on' : '') + '" data-m="amt">' + L("Ikut jumlah", "By amount") + '</button><button class="chip' + (d.mode === "shr" ? ' on' : '') + '" data-m="shr">' + L("Ikut bahagian", "By shares") + '</button></div>' +
    '<input id="sbD" class="ilq" type="date" value="' + E(d.date) + '">' +
    '<button class="btn gold full g3d" id="sbOk" style="margin-top:10px">✓ ' + L("Simpan", "Save") + '</button>' + (isNew ? '' : '<button class="btn alt full g3d" id="sbDel" style="margin-top:6px">🗑 ' + L("Padam bil", "Delete bill") + '</button>'));
  var A = ov.querySelector("#sbA"), W = ov.querySelector("#sbW");
  var amt = function(){ return r2(String(A.value).replace(/[^0-9.,]/g, "").replace(",", ".")); };
  var grab = function(){ d.amt = amt(); d.what = ov.querySelector("#sbT").value.trim(); d.date = ov.querySelector("#sbD").value;
    if(d.mode !== "eq") W.querySelectorAll("[data-w]").forEach(function(i){ d.w[i.getAttribute("data-w")] = r2(i.value); }); };
  var info = function(){ grab(); var m = ov.querySelector("#sbM"), s = shares(st, {d: cleanBill(d)}), sum = 0; Object.keys(s).forEach(function(k){ sum += s[k]; });
    if(d.mode === "amt") m.textContent = Math.abs(sum - d.amt) < 0.01 ? "✓" : "⚠️ " + money(c, sum) + " / " + money(c, d.amt);
    else { var n = d.mode === "eq" ? d.for.length : 0; m.textContent = d.mode === "eq" && n ? "· " + money(c, d.amt / n) + " " + L("seorang", "each") : ""; } };
  var paint = function(){ if(d.mode === "eq") W.innerHTML = '<div class="ssChips">' + ids.map(function(p){ return '<button class="chip' + (d.for.indexOf(p) >= 0 ? ' on' : '') + '" data-f="' + p + '">' + (d.for.indexOf(p) >= 0 ? '✓ ' : '') + E(st.ppl[p].n) + '</button>'; }).join("") + '<button class="chip" data-all>' + L("Semua", "All") + '</button></div>';
    else W.innerHTML = ids.map(function(p){ return '<label class="ssW"><span>' + E(st.ppl[p].n) + '</span><input class="ilq" type="text" inputmode="decimal" data-w="' + p + '" value="' + (d.w[p] || "") + '" placeholder="' + (d.mode === "amt" ? c : "1") + '"></label>'; }).join("");
    W.querySelectorAll("[data-f]").forEach(function(b){ b.onclick = function(){ var p = b.getAttribute("data-f"), i = d.for.indexOf(p); if(i >= 0) d.for.splice(i, 1); else d.for.push(p); paint(); }; });
    var al = W.querySelector("[data-all]"); if(al) al.onclick = function(){ d.for = d.for.length === ids.length ? [] : ids.slice(); paint(); };
    W.querySelectorAll("[data-w]").forEach(function(i){ i.oninput = info; }); info(); };
  paint(); A.oninput = info; setTimeout(function(){ if(isNew) A.focus(); }, 60);
  ov.querySelectorAll("#sbC [data-c]").forEach(function(b){ b.onclick = function(){ d.cat = b.getAttribute("data-c"); ov.querySelectorAll("#sbC [data-c]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; });
  ov.querySelectorAll("#sbBy [data-v]").forEach(function(b){ b.onclick = function(){ d.by = b.getAttribute("data-v"); ov.querySelectorAll("#sbBy [data-v]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; });
  ov.querySelectorAll("[data-m]").forEach(function(b){ b.onclick = function(){ grab(); d.mode = b.getAttribute("data-m"); if(d.mode === "shr" && !Object.keys(d.w).some(function(k){ return d.w[k] > 0; })) ids.forEach(function(p){ d.w[p] = 1; });
    ov.querySelectorAll("[data-m]").forEach(function(x){ x.classList.toggle("on", x === b); }); paint(); }; });
  ov.querySelector("#sbOk").onclick = function(){ grab();
    if(d.mode === "amt"){ var sum = 0; ids.forEach(function(p){ sum += +d.w[p] || 0; }); if(!d.amt) d.amt = r2(sum); if(Math.abs(sum - d.amt) >= 0.01){ U.toast(L("Jumlah bahagian tidak sama dengan bil", "The parts do not add up to the bill")); return; } }
    if(!(d.amt > 0)){ U.toast(L("Isi jumlah", "Fill in the amount")); A.focus(); return; }
    if(d.mode === "eq" && !d.for.length){ U.toast(L("Pilih sekurang-kurangnya seorang", "Pick at least one person")); return; }
    if(d.mode === "eq") d.w = {}; else d.for = [];
    publish(t, {t: "bill", bid: b0 ? b0.bid : rid(6), d: d}); U.close(); draw(); U.toast("✓ " + L("Disimpan dan dikongsi", "Saved and shared")); };
  var dl = ov.querySelector("#sbDel"); if(dl) dl.onclick = function(){ if(!confirm(L("Padam bil ini untuk semua orang?", "Delete this bill for everyone?"))) return; publish(t, {t: "del", ref: b0.bid}); U.close(); draw(); }; }

// 0.5.23 local bill groups move into shared trips (once), keeping people, bills and recorded payments
function migrate(){ if(!U.legacy) return; var old = U.legacy() || []; if(!old.length) return;
  old.forEach(function(g){ var t = {id: rid(8), key: rid(32), name: g.name, cur: "RM", at: Date.now()}; putTrip(t);
    publish(t, {t: "meta", name: g.name, cur: "RM"}); var pid = g.ppl.map(function(n, i){ var p = rid(6); publish(t, {t: "person", pid: p, n: n}); return p; }); t.me = pid[g.me || 0]; putTrip(t);
    (g.bills || []).forEach(function(b){ var w = {}, f = []; (b.w || []).forEach(function(v, i){ if(pid[i] && v) w[pid[i]] = v; }); (b.for || []).forEach(function(v, i){ if(v && pid[i]) f.push(pid[i]); });
      publish(t, {t: "bill", bid: rid(6), d: {what: b.t, cat: "other", amt: b.amt, by: pid[b.by], mode: b.mode || "eq", w: w, for: f, date: b.d}}); });
    (g.paid || []).forEach(function(p){ if(pid[p.f] && pid[p.t]) publish(t, {t: "pay", id: rid(6), f: pid[p.f], to: pid[p.t], amt: p.amt}); }); });
  if(U.legacyDone) U.legacyDone(); }

window.SharedSplit = {
  open: function(el, u, o){ U = u; host = el; opt = o || {}; el.classList.add("ssv"); migrate(); if(opt.trip && trip(opt.trip)) cur = opt.trip; draw(); },
  link: function(el, u, url, o){ U = u; host = el; opt = o || {}; el.classList.add("ssv"); join(url); },
  parse: parse, close: stopLive,
  _t: {state: state, balances: balances, settle: settle, shares: shares, link: link, create: create, publish: publish, trip: trip, db: db, outbox: outbox, cur: function(){ return cur; }}
};
window.FinMore = window.FinMore || {};
// inside the app: Kewangan › Bahagi bil
window.FinMore.bahagi = function(el, A){ var H = A.H;
  var u = {L: H.L2x, esc: H.esc, toast: H.toast, en: H.en, app: true, load: H.load, save: function(k, v){ if(v === null){ try{ localStorage.removeItem(k); }catch(e){} return; } H.save(k, v); },
    sheet: function(t, h){ return H.showSheet(t, h); }, close: H.closeOverlay,
    share: function(text, pkg){ var N = H.N; if(window.Native && N.shareTo) N.shareTo(pkg || "", "", text); else if(N.shareText) N.shareText(text); else if(navigator.share) navigator.share({text: text}).catch(function(){}); },
    copy: function(x){ try{ if(H.N.copyText) H.N.copyText(x); else navigator.clipboard.writeText(x); }catch(e){} },
    names: function(){ var F = H.load("ihsan_family", null) || {}; return (F.p || []).filter(function(p){ return p && p.n && !p.dd; }).map(function(p){ return p.n; }); },
    toDebts: function(list){ list.forEach(function(x){ A.D.debts.push({id: A.uid(), dir: x.dir, who: x.who, desc: x.desc, amt: x.amt, date: A.ymd(new Date()), due: "", tel: "", rem: true, pays: [], done: false}); }); A.sv(); },
    legacy: function(){ return A.D.splitMig ? [] : (A.D.split || []); }, legacyDone: function(){ A.D.splitMig = true; A.sv(); } };
  if(!K){ el.innerHTML = '<div class="card mut">…</div>'; return; }
  var pend = window.__splitLink, myName = (H.S && H.S.uname) || ((H.load("ihsan_settings", {}) || {}).uname) || ""; window.__splitLink = null;
  if(pend) window.SharedSplit.link(el, u, pend, {myName: myName}); else window.SharedSplit.open(el, u, {myName: myName}); };
})();
