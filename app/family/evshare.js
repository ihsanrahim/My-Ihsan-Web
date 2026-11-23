/* My Ihsan 0.7.17 (owner: "event: share all information with a group, any update of guest / table also updates everyone").
   Majlis › 🔗 Kongsi langsung / Share live. One event, many phones: details, guests, RSVP, seating (tables, who sits where),
   food, vendors, budget, itinerary and checklist stay the same for everyone who joined; anyone can change them.
   How: the event is flattened into paths ("n", "g#<guestId>", "seat.items#<tableId>", "seat.at.<guestId>", "food.dish#<id>" …).
   Every save compares with the last synced copy and publishes only the changed paths as one encrypted Nostr event (kind 1780,
   stored, the same free relays and AES-GCM as Split bill / Groups; the key and a random tag come from the share link, so relays
   see nothing readable). Phones apply changes in time order and the newest change to a path wins. Reminders stay per phone.
   Offline changes wait in an outbox. Invite: link / QR (myihsan://e#… and https://myihsan.app/e/#… with an "open in app" page).
   Storage: event.sh = {id, key, r:[relays], by}; ihsan_evsh_<shareId> = {seen:{eventId:1}, ver:{path:[t, pub]}, snap:{path:json}};
   ihsan_evshare = {sk, pub, name}; ihsan_evshout = [outbox]. Updates by others call window.IbNote (notification centre) if present.
   EvShare.start(H) · EvShare.changed() (from events.js sv) · EvShare.shareSheet(e, H, redraw) · EvShare.joinSheet(H, url) · EvShare.parse(url) */
(function(){ "use strict";
var KIND = 1780, RELAYS = window.EVSHARE_RELAYS || ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net"];
var LINK = "https://ihsanrahim.github.io/My-Ihsan-Wifi/go/?e/#", H = null   /* the smart link: myihsan.app/e/, or the backup when blocked */, live = null, busy = false;
var IDARR = {"g":1, "vd":1, "tk":1, "iti":1, "food.dish":1, "bud.it":1, "seat.items":1};
var LOCAL = {sh:1, rem:1, pre:1, at:1};   // per phone: sharing info, reminders on/off and when
function K(){ return window.NostrKit; }
function kit(cb){ if(K()) return cb(); if(H && H.loadJs) return H.loadJs(["groups/nostrkit.js"], cb, function(){}); var s = document.createElement("script"); s.src = "groups/nostrkit.js"; s.onload = cb; document.head.appendChild(s); }
function L(a, b){ return H.L2x ? H.L2x(a, b) : (H.en && H.en() ? b : a); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function ld(k, d){ try{ var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } }
function sv(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function hex(b){ return K().bytesToHex(b); } function unhex(h){ return K().hexToBytes(h); }
function sha(s){ return hex(K().sha256(K().utf8ToBytes(s))); }
function b64(u8){ var s = "", n = 0x8000; for(var i = 0; i < u8.length; i += n) s += String.fromCharCode.apply(null, u8.subarray(i, i + n)); return btoa(s); }
function unb64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function b64u(s){ return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function unb64u(s){ s = s.replace(/-/g, "+").replace(/_/g, "/"); while(s.length % 4) s += "="; return decodeURIComponent(escape(atob(s))); }
function seal(key, o){ var n = K().randomBytes(12), ct = K().gcm(unhex(key), n).encrypt(K().utf8ToBytes(JSON.stringify(o))), out = new Uint8Array(12 + ct.length); out.set(n); out.set(ct, 12); return b64(out); }
function unseal(key, s){ try{ var u = unb64(s), pt = K().gcm(unhex(key), u.slice(0, 12)).decrypt(u.slice(12)); return JSON.parse(new TextDecoder().decode(pt)); }catch(e){ return null; } }
function me(){ var d = ld("ihsan_evshare", {}) || {}; if(!d.sk){ d.sk = hex(K().schnorr.utils.randomPrivateKey()); d.pub = hex(K().schnorr.getPublicKey(unhex(d.sk))); sv("ihsan_evshare", d); } return d; }
function tagOf(sh){ return sha("myihsan-event:" + sh.id + ":" + sh.key).slice(0, 32); }
function st(sh){ var s = ld("ihsan_evsh_" + sh.id, null) || {}; s.seen = s.seen || {}; s.ver = s.ver || {}; return s; }
function putSt(sh, s){ sv("ihsan_evsh_" + sh.id, s); }
function evDb(){ var d = ld("ihsan_events", null) || {}; d.list = d.list || []; return d; }
function shared(){ return evDb().list.filter(function(e){ return e.sh && e.sh.id && e.sh.key; }); }

// ---------- the event as paths ----------
function flat(e){ var out = {};
  var walk = function(p, v, d){
    if(IDARR[p] && Array.isArray(v)){ v.forEach(function(x){ if(x && x.id != null) out[p + "#" + x.id] = JSON.stringify(x); }); return; }
    if(v && typeof v === "object" && !Array.isArray(v) && d < 3 && Object.keys(v).length){ Object.keys(v).forEach(function(k){ walk(p + "." + k, v[k], d + 1); }); return; }
    out[p] = JSON.stringify(v === undefined ? null : v); };
  Object.keys(e).forEach(function(k){ if(!LOCAL[k]) walk(k, e[k], 1); }); return out; }
function setPath(e, path, val){ var hash = path.indexOf("#"), base = hash >= 0 ? path.slice(0, hash) : path, id = hash >= 0 ? path.slice(hash + 1) : null, seg = base.split("."), o = e;
  for(var i = 0; i < seg.length - 1; i++){ if(!o[seg[i]] || typeof o[seg[i]] !== "object" || Array.isArray(o[seg[i]])) o[seg[i]] = {}; o = o[seg[i]]; }
  var last = seg[seg.length - 1];
  if(id != null){ if(!Array.isArray(o[last])) o[last] = []; var a = o[last], j = -1; for(var k = 0; k < a.length; k++) if(String(a[k].id) === id){ j = k; break; }
    if(val == null){ if(j >= 0) a.splice(j, 1); } else { var x = JSON.parse(val); if(j >= 0) a[j] = x; else a.push(x); } return; }
  if(val == null) delete o[last]; else o[last] = JSON.parse(val); }
function newer(v, t, pub){ return !v || t > v[0] || (t === v[0] && pub > v[1]); }
// make sure a joined (or half-synced) event has everything the Majlis pages expect
function fill(e){ e.g = e.g || []; e.vd = e.vd || []; e.tk = e.tk || []; e.iti = e.iti || []; e.food = e.food || {}; e.food.dish = e.food.dish || []; e.food.cat = e.food.cat || {};
  e.bud = e.bud || {}; e.bud.it = e.bud.it || []; if(e.rem == null) e.rem = true; e.pre = e.pre || [7, 1]; e.n = e.n || "…"; return e; }

// ---------- publish my changes ----------
var seq = 0;
function evId(e){ return sha(JSON.stringify([0, e.pubkey, e.created_at, e.kind, e.tags, e.content])); }
function verify(e){ try{ return e && e.kind === KIND && evId(e) === e.id && K().schnorr.verify(unhex(e.sig), unhex(e.id), unhex(e.pubkey)); }catch(x){ return false; } }
function publish(sh, payload){ var m = me(), ev = {pubkey:m.pub, created_at:Math.floor(Date.now() / 1000), kind:KIND, tags:[["t", tagOf(sh)]], content:seal(sh.key, payload)};
  ev.id = evId(ev); ev.sig = hex(K().schnorr.sign(unhex(ev.id), unhex(m.sk))); var s = st(sh); s.seen[ev.id] = 1; putSt(sh, s);
  var o = ld("ihsan_evshout", []) || []; o.push({e:ev, r:sh.r || RELAYS}); sv("ihsan_evshout", o); if(live) live.flush(); }
function summary(ops){ var c = {}; ops.forEach(function(o){ var k = o[0].split(/[.#]/)[0]; c[k] = (c[k] || 0) + 1; });
  var N = {g:["tetamu", "guests"], seat:["susun meja", "seating"], food:["makanan", "food"], vd:["vendor", "vendors"], bud:["bajet", "budget"], iti:["atur cara", "itinerary"], tk:["semakan", "checklist"]};
  var parts = Object.keys(c).map(function(k){ return N[k] ? N[k] : ["butiran", "details"]; }).filter(function(x, i, a){ return a.indexOf(x) === i; });
  return {ms:parts.map(function(x){ return x[0]; }).join(", "), en:parts.map(function(x){ return x[1]; }).join(", ")}; }
// called after every save of ihsan_events (events.js sv): publish what changed in each shared event
function changed(){ if(busy || !K()) return; var d = evDb(), name = (ld("ihsan_evshare", {}) || {}).name || "";
  d.list.forEach(function(e){ if(!e.sh || !e.sh.key) return; var s = st(e.sh), f = flat(e), old = s.snap || {}, t = Date.now() * 1000 + (seq++ % 1000), pub = me().pub, ops = [];
    Object.keys(f).forEach(function(p){ if(old[p] !== f[p]) ops.push([p, f[p]]); });
    Object.keys(old).forEach(function(p){ if(!(p in f)) ops.push([p, null]); });
    if(!ops.length) return;
    ops.forEach(function(o){ s.ver[o[0]] = [t, pub]; }); s.snap = f; putSt(e.sh, s);
    var sm = summary(ops);
    for(var i = 0; i < ops.length; i += 150) publish(e.sh, {o:ops.slice(i, i + 150), t:t, by:name, n:e.n, sm:sm}); });
  pushNative(); }

// ---------- receive ----------
function ingest(sh, ev){ var s = st(sh); if(s.seen[ev.id]) return null; s.seen[ev.id] = 1; putSt(sh, s); var p = unseal(sh.key, ev.content); if(!p || !Array.isArray(p.o)) return null; p.pub = ev.pubkey; p.at = ev.created_at; return p; }
function apply(sh, list){ if(!list.length) return; list.sort(function(a, b){ return a.t - b.t; }); var d = evDb(), e = d.list.filter(function(x){ return x.sh && x.sh.id === sh.id; })[0]; if(!e) return;
  var s = st(sh), n = 0, mine = me().pub, from = {};
  list.forEach(function(p){ p.o.forEach(function(o){ if(newer(s.ver[o[0]], p.t, p.pub)){ setPath(e, o[0], o[1]); s.ver[o[0]] = [p.t, p.pub]; n++; } }); if(p.pub !== mine) from[p.by || "?"] = p.sm || from[p.by || "?"]; });
  fill(e); s.snap = flat(e); putSt(sh, s); busy = true; try{ localStorage.setItem("ihsan_events", JSON.stringify(d)); }finally{ busy = false; }
  if(n && window.EventView && EventView._reload) EventView._reload();
  Object.keys(from).forEach(function(by){ var sm = from[by] || {}; if(window.IbNote) IbNote.add({src:"event", id:sh.id, title:"🎊 " + e.n, body:(by || L("Seseorang", "Someone")) + " " + L("mengemas kini ", "updated ") + (L(sm.ms || "", sm.en || "") || L("majlis", "the event")), go:"side:alat/majlis", ev:e.id}); }); }

// ---------- live connection (all shared events at once) ----------
function Live(){ var self = this, socks = {}, alive = true, sh = shared().map(function(e){ return e.sh; }), byTag = {}; self.n = 0;
  sh.forEach(function(x){ byTag[tagOf(x)] = x; });
  var tags = Object.keys(byTag), relays = []; sh.forEach(function(x){ (x.r || RELAYS).forEach(function(u){ if(relays.indexOf(u) < 0) relays.push(u); }); });
  var pend = {}, tm = null, flushIn = function(){ clearTimeout(tm); tm = setTimeout(function(){ Object.keys(pend).forEach(function(tg){ apply(byTag[tg], pend[tg]); }); pend = {}; }, 250); };
  var open1 = function(u){ var ws; try{ ws = new WebSocket(u); }catch(e){ return; } socks[u] = ws;
    ws.onopen = function(){ self.n++; if(tags.length) try{ ws.send(JSON.stringify(["REQ", "ev" + tags[0].slice(0, 6), {kinds:[KIND], "#t":tags, limit:5000}])); }catch(e){} self.flush(); };
    ws.onmessage = function(m){ var d; try{ d = JSON.parse(m.data); }catch(e){ return; }
      if(d[0] === "EVENT" && d[2] && verify(d[2])){ var tg = ((d[2].tags || []).filter(function(t){ return t[0] === "t"; })[0] || [])[1], x = byTag[tg]; if(!x) return; var p = ingest(x, d[2]); if(p){ (pend[tg] = pend[tg] || []).push(p); flushIn(); } }
      else if(d[0] === "OK" && d[2]){ sv("ihsan_evshout", (ld("ihsan_evshout", []) || []).filter(function(o){ return o.e.id !== d[1]; })); } };
    ws.onclose = function(){ if(socks[u] === ws){ delete socks[u]; self.n = Math.max(0, self.n - 1); } if(alive) setTimeout(function(){ if(alive) open1(u); }, 5000); };
    ws.onerror = function(){}; };
  self.flush = function(){ (ld("ihsan_evshout", []) || []).forEach(function(o){ (o.r || RELAYS).forEach(function(u){ var ws = socks[u]; if(ws && ws.readyState === 1) try{ ws.send(JSON.stringify(["EVENT", o.e])); }catch(e){} }); }); };
  self.stop = function(){ alive = false; Object.keys(socks).forEach(function(u){ try{ socks[u].close(); }catch(e){} }); socks = {}; };
  self.tags = tags.join(",");
  relays.forEach(open1); }
function goLive(){ var have = shared().map(function(e){ return tagOf(e.sh); }).join(","); if(live && live.tags === have) return; if(live) live.stop(); live = have ? new Live() : null; }
// background notifications (GroupSync, every ~30 min): the phone needs each shared event's tag, key and relays
function pushNative(){ try{ var N = window.Native; if(!(N && N.setFeeds)) return; var m = ld("ihsan_evshare", {}) || {};
  N.setFeeds(JSON.stringify({me:m.pub || "", en:!!(H && H.en && H.en()), feeds:shared().map(function(e){ return {id:e.sh.id, src:"event", kind:KIND, tag:tagOf(e.sh), key:e.sh.key, relays:e.sh.r || RELAYS, name:e.n, ev:e.id}; })})); }catch(e){} }
function start(h){ H = h || H; kit(function(){ goLive(); pushNative(); }); }

// ---------- share / join ----------
function qrSvg(text){ var q = K().qrcode(0, "M"); q.addData(text); q.make(); var n = q.getModuleCount(), s2 = 4, d = ""; for(var r = 0; r < n; r++) for(var c = 0; c < n; c++) if(q.isDark(r, c)) d += "M" + (c * s2 + s2 * 2) + " " + (r * s2 + s2 * 2) + "h" + s2 + "v" + s2 + "h-" + s2 + "z";
  var w = n * s2 + s2 * 4; return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + w + '" style="width:220px;max-width:100%;height:auto;display:inline-block"><rect width="' + w + '" height="' + w + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>'; }
function link(sh, name){ return LINK + b64u(JSON.stringify({v:1, i:sh.id, k:sh.key, n:name, r:(sh.r && sh.r.join() !== RELAYS.join()) ? sh.r : undefined})); }
function parse(u){ u = String(u || "").trim(); var i = u.indexOf("#"), d = i >= 0 ? u.slice(i + 1) : (/^myihsan:\/\/e\/([\w-]+)/.exec(u) || [])[1]; if(!d) return null;   // …#data, or myihsan://e/data from the web page's "open in the app" button
  try{ var o = JSON.parse(unb64u(d)); return o && o.i && /^[0-9a-f]{64}$/.test(o.k) ? o : null; }catch(e){ return null; } }
function askName(cb){ var d = ld("ihsan_evshare", {}) || {}; if(d.name) return cb(d.name); var n = prompt(L("Nama anda (ditunjuk kepada yang lain bila anda mengemas kini)", "Your name (shown to the others when you update)"), ""); if(!n) return; d.name = n.trim().slice(0, 30); sv("ihsan_evshare", d); cb(d.name); }
function shareSheet(e, h, redraw){ H = h || H; kit(function(){ askName(function(){
  if(!e.sh){ e.sh = {id:hex(K().randomBytes(16)), key:hex(K().randomBytes(32)), by:me().pub};
    var d = evDb(); d.list.forEach(function(x, i){ if(x.id === e.id) d.list[i] = e; }); busy = true; localStorage.setItem("ihsan_events", JSON.stringify(d)); busy = false;
    var s = st(e.sh); s.snap = {}; putSt(e.sh, s); changed(); start(); }
  var u = link(e.sh, e.n), msg = L("Jom urus majlis \"", "Let's plan \"") + e.n + L("\" bersama dalam My Ihsan. Buka pautan ini untuk menyertai (semua kemas kini tetamu, meja dan lain-lain dikongsi):\n", "\" together in My Ihsan. Open this link to join (every update to guests, tables and more is shared):\n") + u;
  var ov = H.showSheet("🔗 " + L("Kongsi langsung", "Share live"), '<div class="mut small">' + L("Sesiapa yang menyertai melihat dan boleh mengubah semua butiran majlis ini. Setiap perubahan sampai kepada semua.", "Everyone who joins sees and can change everything in this event. Every change reaches everyone.") + '</div>' +
    '<div style="text-align:center;margin:10px 0" id="esQr"></div>' +
    '<div class="btns"><button class="btn gold g3d" id="esWa" style="flex:1">💬 ' + L("Hantar (WhatsApp / kumpulan)", "Send (WhatsApp / group)") + '</button><button class="btn alt g3d" id="esCp">📋 ' + L("Salin", "Copy") + '</button></div>' +
    '<div class="mut tiny" style="margin-top:8px">🔒 ' + L("Disulitkan; hanya yang ada pautan boleh membaca. Hantar kepada orang yang dipercayai sahaja.", "Encrypted; only people with the link can read it. Send it only to people you trust.") + '</div>' +
    '<button class="btn alt full g3d" id="esStop" style="margin-top:10px">⛔ ' + L("Berhenti berkongsi pada telefon ini", "Stop sharing on this phone") + '</button>');
  try{ ov.querySelector("#esQr").innerHTML = qrSvg(u); }catch(x){}
  ov.querySelector("#esWa").onclick = function(){ try{ if(window.Native && Native.shareText) Native.shareText(msg); else if(navigator.share) navigator.share({text:msg}); }catch(x){} };
  ov.querySelector("#esCp").onclick = function(){ try{ if(window.Native && Native.copyText) Native.copyText(u); else navigator.clipboard.writeText(u); }catch(x){} H.toast(L("Pautan disalin", "Link copied")); };
  ov.querySelector("#esStop").onclick = function(){ if(!confirm(L("Berhenti menerima dan menghantar kemas kini untuk majlis ini? Salinan pada telefon ini kekal.", "Stop getting and sending updates for this event? The copy on this phone stays."))) return;
    var d = evDb(); d.list.forEach(function(x){ if(x.id === e.id){ try{ localStorage.removeItem("ihsan_evsh_" + x.sh.id); }catch(z){} delete x.sh; } }); busy = true; localStorage.setItem("ihsan_events", JSON.stringify(d)); busy = false; delete e.sh;
    start(); H.closeOverlay(); if(redraw) redraw(); };
  if(redraw) redraw(); }); }); }
function joinSheet(h, url, done){ H = h || H; kit(function(){ var o = parse(url); if(!o){ H.toast(L("Pautan majlis tidak sah", "Not a valid event link")); return; }
  var d = evDb(), have = d.list.filter(function(x){ return x.sh && x.sh.id === o.i; })[0]; if(have){ H.toast(L("Sudah disertai", "Already joined")); if(done) done(have.id); return; }
  askName(function(){ var e = fill({id:"e" + Date.now().toString(36), n:o.n || L("Majlis", "Event"), ty:"lain", sh:{id:o.i, key:o.k, r:o.r}});
    d.list.push(e); busy = true; localStorage.setItem("ihsan_events", JSON.stringify(d)); busy = false; var s = st(e.sh); s.snap = flat(e); putSt(e.sh, s);
    if(live){ live.stop(); live = null; } start(); H.toast("🎊 " + L("Disertai. Butiran sedang dimuatkan…", "Joined. Loading the details…")); if(done) done(e.id); }); }); }
window.EvShare = {start:start, changed:changed, shareSheet:shareSheet, joinSheet:joinSheet, parse:parse, link:function(e){ return e.sh ? link(e.sh, e.n) : ""; }, live:function(){ return live; }, _flat:flat, _set:setPath};
})();
