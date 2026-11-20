/* 0.5.16 Kumpulan (Groups): private, invite-only notice boards (family, friends, masjid kariah, school, class, neighbourhood,
   club, workplace, Hajj/Umrah group, other). A board, not a chat.
   - No accounts: each phone makes its own random key pair; a member is just a name.
   - End-to-end encrypted: every post is sealed with the group key (AES-256-GCM) on the phone before it leaves. The invite link
     carries the key in its #fragment, which is never sent to any server. Private replies (permission slips, reports) are sealed
     to one person with an ECDH secret.
   - Transport: free public Nostr relays (2-3 per group), plain WebSocket JSON. Relays only see random-looking data and a random tag.
   - No member limit (0.5.18).
   GroupsView.open(el, H), GroupsView.sync(H) (background refresh while the app is open), GroupsView.widget(H) (home card HTML),
   GroupsView.link(H, url) (an invite link opened from outside). H = finH() from app.js. Crypto: groups/nostrkit.js (noble, MIT). */
(function(){
"use strict";
var K = window.NostrKit, H = null;
var KIND = 1777, LINK = "https://ihsanrahim.github.io/My-Ihsan/g/#";
var RELAYS = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net"];
var REACTS = ["👍", "🤲", "❤️", "Aamiin"];
function L(a, b){ return H.L2x(a, b); }
function esc(s){ return H.esc(s==null ? "" : String(s)); }
function now(){ return Math.floor(Date.now()/1000); }

// ---------------- types ----------------
// [id, icon, ms, en, default post kinds, adminsOnly default, comments default]
// 0.5.62 (owner's "group types" design): the type picked at creation sets the home screen, the post sheet, roles and reminders.
// [id, icon, ms, en, preset post kinds (the "New post" grid), adminsOnly default, comments default]
var GTYPES = [
  ["couple","💞","Pasangan","Couple",["todo","grocery","rem","bill","checkin","event","doa","album"],false,true],
  ["kids","👨‍👩‍👧‍👦","Ibu bapa & anak","Parents & kids",["chore","task","rem","reward","event","permit","grocery","alert"],false,true],
  ["family","🏡","Keluarga besar","Extended family",["ann","event","doa","good","bday","death","album","poll","signup"],false,true],
  ["class","📖","Usrah / halaqah / kelas","Usrah / Quran circle / class",["ann","event","task","roster","quran","doc"],true,true],
  ["masjid","🕌","Kariah Masjid / Surau","Masjid / Surau community",["ann","event","death","collect","signup","roster","alert"],true,false],
  ["school","🏫","Sekolah / Tadika / Tahfiz","School / Kindergarten / Tahfiz",["ann","task","event","permit","collect","alert"],true,false],
  ["hood","🏘️","Kejiranan","Neighbourhood",["ann","alert","event","signup","roster"],false,true],
  ["travel","🕋","Jemaah Haji, Umrah & lawatan","Hajj, Umrah & trips",["ann","event","loc","checkin","bill","todo","alert","doc"],true,false],
  ["wedding","💍","Majlis / kenduri","Wedding / kenduri",["todo","event","signup","collect","bill","roster","poll"],false,true],
  ["care","🩺","Penjagaan keluarga","Caregiving",["rem","todo","checkin","roster","event","bill","doc"],false,true],
  ["friends","🤝","Sahabat / rumah sewa","Friends / housemates",["ann","event","poll","bill","grocery","signup","album"],false,true],
  ["club","🎗️","Persatuan / NGO","Club / NGO",["ann","event","collect","signup","poll","doc"],true,true],
  ["work","💼","Pejabat","Workplace",["ann","event","poll","signup"],false,true],
  ["other","✨","Lain-lain","Custom",["ann","event","poll"],false,true]
];
// one-line promise under each type in the picker
var TDESC = {couple:["Berdua sahaja. Tugas, peringatan, status","Just the two of you. Tasks, reminders, check-ins"],
  kids:["Kerja rumah, solat, kerja sekolah, berita daripada anak","Chores, solat, homework, updates from kids"],
  family:["Kenduri, khairat, hari jadi, berita keluarga","Kenduri, khairat, birthdays, family news"],
  class:["Bacaan Quran, giliran tadarus, nota","Quran log, tadarus roster, notes"],
  masjid:["Notis, acara, giliran, kutipan","Notices, events, roster, collections"],
  school:["Kerja sekolah, borang kebenaran, yuran","Homework, permission slips, fees"],
  hood:["Amaran, rondaan, gotong-royong","Alerts, patrol roster, gotong-royong"],
  travel:["Jadual, tempat berkumpul, perbelanjaan","Itinerary, meeting point, expenses"],
  wedding:["Tugas AJK, bajet, RSVP, kiraan hari","Committee tasks, budget, RSVP, countdown"],
  care:["Ubat, giliran lawatan, temujanji klinik","Medicine, visit roster, clinic appointments"],
  friends:["Bahagi bil, barang rumah, undian makan","Split bills, groceries, polls for makan"],
  club:["Acara, kutipan, sukarelawan","Events, collections, volunteers"], work:["Pengumuman, acara, undian","Announcements, events, polls"],
  other:["Mula kosong dan pilih ciri","Start blank and choose features"]};
function gtype(id){ return GTYPES.filter(function(t){ return t[0]===id; })[0] || GTYPES[GTYPES.length-1]; }
// post kinds: [id, icon, ms, en, urgent?]
var PKINDS = [
  ["ann","📢","Pengumuman","Announcement"], ["event","📅","Acara","Event"], ["doa","🤲","Permohonan doa","Doa request"],
  ["death","🕊️","Berita kematian","Death notice",1], ["good","🎉","Berita gembira","Good news"], ["bday","🎂","Hari jadi & ulang tahun","Birthday & anniversary"],
  ["poll","📊","Undian","Poll"], ["signup","✅","Senarai daftar","Sign-up list"], ["collect","💰","Kutipan","Collection"],
  ["task","📝","Kerja","Task / homework"], ["permit","✋","Kebenaran / borang","Permission / RSVP form"], ["loc","📍","Lokasi","Meeting point"],
  ["album","📷","Album","Album"], ["doc","📄","Fail","Document"], ["alert","⚠️","Amaran","Alert",1], ["roster","🗓️","Jadual giliran","Roster"],
  // 0.5.62 everyday kinds for couples, families with kids, trips and caregiving
  ["todo","☑️","Tugasan","To-do"], ["grocery","🛒","Senarai barang","Grocery list"], ["rem","⏰","Peringatan","Reminder"], ["bill","🧾","Bil","Bill"],
  ["checkin","📲","Status / daftar masuk","Status / check-in"], ["solat","🕌","Solat","Solat log"], ["quran","📖","Bacaan Quran","Quran log"],
  ["chore","🧹","Kerja rumah","Chore"], ["reward","🎁","Ganjaran","Reward"], ["help","🙋","Perlu bantuan","Need help",1], ["pnote","🔒","Ibu bapa sahaja","Parents only"]
];
var CHILD_K = ["checkin","solat","quran","help","album","doa"];   // what a child may post in a Parents & kids group
var PRAY = [["subuh","🌅","Subuh","Subuh","S"],["zohor","☀️","Zohor","Zohor","Z"],["asar","🌤️","Asar","Asar","A"],["maghrib","🌇","Maghrib","Maghrib","M"],["isyak","🌙","Isyak","Isyak","I"]];
var STATUS = [["omw","🚗","Dalam perjalanan pulang","On my way home"],["office","🏢","Sudah sampai pejabat","Reached the office"],["late","⏰","Lewat 15 minit","Running late 15 min"],["home","🏠","Sudah sampai rumah","Reached home"],
  ["school","🏫","Sudah sampai sekolah","Reached school"],["tuition","📚","Di tuisyen","At tuition"],["pick","🙋","Tolong ambil saya","Please pick me up"],["ok","👍","Semua okey","All OK"]];
function stLabel(id){ var x = STATUS.filter(function(s){ return s[0]===id; })[0]; return x ? x[1]+" "+L(x[2], x[3]) : id; }
function pk(id){ return PKINDS.filter(function(k){ return k[0]===id; })[0] || PKINDS[0]; }
var COLORS = ["#0b5d3b","#c9a646","#1f4e9c","#7b2d8e","#b23a48","#0f7c7c","#d96b1c","#4a4a4a","#2e7d32","#8d6e63"];

// ---------------- keys and storage ----------------
function hex(b){ return K.bytesToHex(b); }
function unhex(h){ return K.hexToBytes(h); }
function rnd(n){ return K.randomBytes(n); }
function me(){ var k = H.load("ihsan_gkey", null); if(!k || !k.sk){ k = {sk: hex(K.schnorr.utils.randomPrivateKey())}; H.save("ihsan_gkey", k); }
  if(!k.pub){ k.pub = hex(K.schnorr.getPublicKey(unhex(k.sk))); H.save("ihsan_gkey", k); } return k; }
function store(){ var s = H.load("ihsan_groups", null) || {}; s.list = s.list || []; return s; }
function saveStore(s){ H.save("ihsan_groups", s); pushNative(); }
function grp(id){ return store().list.filter(function(g){ return g.id===id; })[0]; }
function putGrp(g){ var s = store(); var i = -1; s.list.forEach(function(x, j){ if(x.id===g.id) i = j; }); if(i<0) s.list.push(g); else s.list[i] = g; saveStore(s); }
function cacheKey(id){ return "ihsan_gposts_"+id; }
function cache(id){ var c = H.load(cacheKey(id), null) || {}; c.ev = c.ev || {}; return c; }
function saveCache(id, c){ var ids = Object.keys(c.ev); if(ids.length > 600){ ids.sort(function(a, b){ return c.ev[a].at - c.ev[b].at; }); ids.slice(0, ids.length-600).forEach(function(k){ delete c.ev[k]; }); } H.save(cacheKey(id), c); }
function tagOf(id, key){ return hex(K.sha256(K.utf8ToBytes("myihsan-g:"+id+":"+key))).slice(0, 32); }
function b64(u8){ var s = ""; for(var i=0;i<u8.length;i++) s += String.fromCharCode(u8[i]); return btoa(s); }
function unb64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i] = b.charCodeAt(i); return u; }
function b64u(s){ return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function unb64u(s){ s = s.replace(/-/g,"+").replace(/_/g,"/"); while(s.length%4) s += "="; return decodeURIComponent(escape(atob(s))); }
function seal(keyHex, obj){ var n = rnd(12), ct = K.gcm(unhex(keyHex), n).encrypt(K.utf8ToBytes(JSON.stringify(obj))); var out = new Uint8Array(12+ct.length); out.set(n); out.set(ct, 12); return b64(out); }
function open_(keyHex, s){ try{ var u = unb64(s), pt = K.gcm(unhex(keyHex), u.slice(0,12)).decrypt(u.slice(12)); return JSON.parse(new TextDecoder().decode(pt)); }catch(e){ return null; } }
// one-to-one: ECDH between my key and theirs (x-only Nostr keys are taken as even-y points)
function dmKey(theirPub){ var sh = K.secp256k1.getSharedSecret(unhex(me().sk), unhex("02"+theirPub)); return hex(K.sha256(sh.slice(1, 33))); }
function sealTo(pub, obj){ return seal(dmKey(pub), obj); }
function openFrom(pub, s){ return open_(dmKey(pub), s); }

// ---------------- Nostr events ----------------
function evId(e){ return hex(K.sha256(K.utf8ToBytes(JSON.stringify([0, e.pubkey, e.created_at, e.kind, e.tags, e.content])))); }
function mkEvent(g, payload){ var m = me(); var e = {pubkey: m.pub, created_at: now(), kind: KIND, tags: [["t", tagOf(g.id, g.key)]], content: seal(g.key, payload)};
  e.id = evId(e); e.sig = hex(K.schnorr.sign(unhex(e.id), unhex(m.sk))); return e; }
function verify(e){ try{ return e && e.kind===KIND && evId(e)===e.id && K.schnorr.verify(unhex(e.sig), unhex(e.id), unhex(e.pubkey)); }catch(x){ return false; } }

// ---------------- relay pool ----------------
var pool = {}, subs = {}, outbox = null, onChange = null, syncT = null;
function relaysAll(){ var r = {}; store().list.forEach(function(g){ if(!g.archived) (g.relays||RELAYS).forEach(function(u){ r[u] = 1; }); }); return Object.keys(r); }
function connect(url){
  var c = pool[url]; if(c && (c.ws.readyState===0 || c.ws.readyState===1)) return c;
  var ws; try{ ws = new WebSocket(url); }catch(e){ return null; }
  c = pool[url] = {ws: ws, url: url, ok: false, tries: (c ? c.tries : 0)};
  ws.onopen = function(){ c.ok = true; c.tries = 0; flushOutbox(); reqAll(c); };
  ws.onclose = function(){ c.ok = false; if(Object.keys(subs).length){ c.tries++; setTimeout(function(){ if(pool[url]===c) connect(url); }, Math.min(60000, 2000*Math.pow(2, c.tries))); } };
  ws.onerror = function(){};
  ws.onmessage = function(m){ var d; try{ d = JSON.parse(m.data); }catch(e){ return; } if(d[0]==="EVENT" && d[2]) ingest(d[2]); else if(d[0]==="OK" && d[2]) markSent(d[1]); };
  return c;
}
function reqAll(c){ var s = store(); s.list.forEach(function(g){ if(g.archived || (g.relays||RELAYS).indexOf(c.url)<0) return;
  var tags = [tagOf(g.id, g.key)].concat((g.old||[]).map(function(k){ return tagOf(g.id, k); }));
  var since = Math.max(0, (cache(g.id).since||0) - 3600);
  try{ c.ws.send(JSON.stringify(["REQ", "g"+g.id.slice(0,8), {kinds:[KIND], "#t":tags, since: since || undefined, limit: 500}])); }catch(e){} }); }
function startSync(cb){ onChange = cb || onChange; subs.main = 1; relaysAll().forEach(connect); Object.keys(pool).forEach(function(u){ var c = pool[u]; if(c.ok) reqAll(c); }); }
function obox(){ if(!outbox) outbox = H.load("ihsan_goutbox", []) || []; return outbox; }
function publish(g, payload){ var e = mkEvent(g, payload); ingest(e, true); var o = obox(); o.push({e: e, r: g.relays||RELAYS}); H.save("ihsan_goutbox", o); flushOutbox(); return e; }
function flushOutbox(){ var o = obox(); o.forEach(function(x){ (x.r||RELAYS).forEach(function(u){ var c = connect(u); if(c && c.ok) try{ c.ws.send(JSON.stringify(["EVENT", x.e])); }catch(e){} }); }); }
function markSent(id){ var o = obox(), n = o.length; outbox = o.filter(function(x){ return x.e.id!==id; }); if(outbox.length!==n) H.save("ihsan_goutbox", outbox); }
function pending(){ return obox().length; }

// decrypt, verify, store; then apply group-level effects (meta, rekey)
function ingest(e, mine){
  if(!mine && !verify(e)) return;
  var t = (e.tags||[]).filter(function(x){ return x[0]==="t"; }).map(function(x){ return x[1]; })[0]; if(!t) return;
  var s = store(), g = null, key = null;
  s.list.forEach(function(x){ if(tagOf(x.id, x.key)===t){ g = x; key = x.key; } else (x.old||[]).forEach(function(k){ if(tagOf(x.id, k)===t){ g = x; key = k; } }); });
  if(!g) return;
  var c = cache(g.id); if(c.ev[e.id]) return;
  var p = open_(key, e.content); if(!p) return;
  var since0 = c.since||0;
  c.ev[e.id] = {id: e.id, pub: e.pubkey, at: e.created_at, p: p}; c.since = Math.max(c.since||0, e.created_at); saveCache(g.id, c);
  // 0.5.70 (owner): every new post from someone else shows as a notification (not on the first sync of a group, not when muted unless urgent)
  if(!mine && p.t==="post" && e.pubkey!==me().pub && since0 > 0 && e.created_at > Date.now()/1000 - 6*3600 && H && H.xrem){
    var f = p.f||{}, urg = p.k==="death" || p.k==="alert" || !!f.imp;
    if(!g.mute || urg){ try{ var x = pk(p.k), who = ""; try{ who = nameOf(state(g), e.pubkey); }catch(er){}
      H.xrem("gnew"+e.id.slice(0, 12), Date.now()+2500, (x[1]||"📢")+" "+(g.name||L("Kumpulan","Group")), (who?who+": ":"")+String(f.title||f.name||f.text||L(x[2], x[3])).slice(0, 120), "kumpulan", urg); }catch(er2){} } }
  if(p.t==="rekey" && p.to===me().pub && isAdmin(g, e.pubkey)){ var nk = openFrom(e.pubkey, p.k); if(nk && nk.k && nk.k!==g.key){ g.old = (g.old||[]).concat([g.key]); g.key = nk.k; putGrp(g); startSync(); } }
  if(onChange) { clearTimeout(syncT); syncT = setTimeout(function(){ if(onChange) onChange(g.id); }, 150); }
}

// ---------------- state (built from events) ----------------
function isAdmin(g, pub){ var st = g._st || state(g); return pub===g.owner || st.admins.indexOf(pub)>=0; }
function state(g){
  var c = cache(g.id), ev = Object.keys(c.ev).map(function(k){ return c.ev[k]; }).sort(function(a, b){ return a.at - b.at || (a.id<b.id ? -1 : 1); });
  var st = {meta: {name: g.name, type: g.type, icon: g.icon, color: g.color, adminsOnly: g.adminsOnly, comments: g.comments, approval: g.approval, desc: "", rules: "", admins: [], posters: [], roles: {}},
    admins: [], members: {}, removed: {}, pendingJ: {}, posts: [], byId: {}, reacts: {}, rsvp: {}, votes: {}, slots: {}, done: {}, doa: {}, replies: {}, forms: {}, tally: {}, reports: [], usedInv: {}, owner: g.owner, jrole: {}, jage: {}, ticks: {}, proof: {}, oks: {}, redeem: []};
  // couples: both partners are equal admins; Parents & kids: parents are admins
  var adm = function(pub){ return pub===g.owner || st.admins.indexOf(pub)>=0 || (st.meta.type==="couple" && !!st.members[pub]) || (st.meta.type==="kids" && roleOf(st, pub)==="parent" && !!st.members[pub]); };
  ev.forEach(function(x){ var p = x.p, pub = x.pub;
    if(p.t==="meta" && adm(pub)){ Object.keys(p.m||{}).forEach(function(k){ st.meta[k] = p.m[k]; }); st.admins = (st.meta.admins||[]).slice(); }
    else if(p.t==="join"){ if(st.removed[pub] && st.removed[pub] > x.at) return;
      if(st.meta.type==="couple" && !st.members[pub] && Object.keys(st.members).length >= 2) return;   // a couple is two people
      if(/^(parent|child|guardian|partner)$/.test(p.rl||"")) st.jrole[pub] = p.rl; if(/^(u7|7-12|13\+)$/.test(p.ag||"")) st.jage[pub] = p.ag;
      if(p.inv && p.single){ if(st.usedInv[p.inv] && st.usedInv[p.inv]!==pub) return; st.usedInv[p.inv] = pub; }
      if(st.meta.approval && !adm(pub) && !(st.members[pub] && st.members[pub].ok)) st.pendingJ[pub] = {n: p.n, at: x.at};
      else st.members[pub] = {n: p.n, at: x.at, ok: true}; if(st.members[pub]) st.members[pub].n = p.n; }
    else if(p.t==="approve" && adm(pub) && st.pendingJ[p.who]){ st.members[p.who] = {n: st.pendingJ[p.who].n, at: x.at, ok: true}; delete st.pendingJ[p.who]; }
    else if(p.t==="remove" && adm(pub)){ delete st.members[p.who]; delete st.pendingJ[p.who]; st.removed[p.who] = x.at; }
    else if(p.t==="leave"){ delete st.members[pub]; }
    else if(p.t==="post"){ if(!st.members[pub] && !adm(pub)) return;
      if((st.meta.adminsOnly || st.meta.ann) && !adm(pub) && (st.meta.ann || (st.meta.posters||[]).indexOf(pub)<0)) return;
      if(st.meta.type==="kids" && roleOf(st, pub)==="child" && CHILD_K.indexOf(p.k)<0) return;
      var po = {id: x.id, pub: pub, at: x.at, k: p.k, f: p.f||{}, pin: !!(p.f && p.f.pin && adm(pub))}; st.posts.push(po); st.byId[x.id] = po; }
    else if(p.t==="edit"){ var e1 = st.byId[p.ref]; if(e1 && e1.pub===pub){ Object.keys(p.f||{}).forEach(function(k){ e1.f[k] = p.f[k]; }); e1.edited = x.at; } }
    else if(p.t==="del"){ var e2 = st.byId[p.ref]; if(e2 && (e2.pub===pub || adm(pub))) e2.gone = true; }
    else if(p.t==="pin" && adm(pub)){ var e3 = st.byId[p.ref]; if(e3) e3.pin = !!p.on; }
    else if(p.t==="react"){ var r = st.reacts[p.ref] = st.reacts[p.ref] || {}; r[p.e] = r[p.e] || {}; if(p.on) r[p.e][pub] = 1; else delete r[p.e][pub]; }
    else if(p.t==="rsvp"){ (st.rsvp[p.ref] = st.rsvp[p.ref] || {})[pub] = p.v; }
    else if(p.t==="vote"){ var po2 = st.byId[p.ref]; if(po2 && (!po2.f.close || x.at <= po2.f.close/1000)) (st.votes[p.ref] = st.votes[p.ref] || {})[pub] = p.o||[]; }
    else if(p.t==="slot"){ var po3 = st.byId[p.ref]; if(!po3) return; var sl = st.slots[p.ref] = st.slots[p.ref] || {}; var arr = sl[p.s] = sl[p.s] || [];
      var lim = ((po3.f.slots||[])[p.s]||{}).n || 1; var i = arr.indexOf(pub); if(p.on){ if(i<0 && arr.length < lim) arr.push(pub); } else if(i>=0) arr.splice(i, 1); }
    else if(p.t==="done"){ var d = st.done[p.ref] = st.done[p.ref] || {}; if(p.on) d[pub] = x.at; else delete d[pub]; }
    else if(p.t==="tick"){ var tk = st.ticks[p.ref] = st.ticks[p.ref] || {}; if(p.on) tk[p.i] = {pub: pub, at: x.at}; else delete tk[p.i]; }
    else if(p.t==="proof" && typeof p.img==="string" && p.img.length < 90000){ (st.proof[p.ref] = st.proof[p.ref] || {})[pub] = {img: p.img, at: x.at}; }
    else if(p.t==="ok" && adm(pub)){ (st.oks[p.ref] = st.oks[p.ref] || {})[p.who] = x.at; }
    else if(p.t==="redeem"){ st.redeem.push({id: x.id, ref: p.ref, pub: pub, at: x.at}); }
    else if(p.t==="doa"){ (st.doa[p.ref] = st.doa[p.ref] || {})[pub] = 1; }
    else if(p.t==="reply" && st.meta.comments && !(st.meta.ann && !adm(pub))){ (st.replies[p.ref] = st.replies[p.ref] || []).push({pub: pub, at: x.at, x: String(p.x||"").slice(0, 300)}); }
    else if(p.t==="form"){ var po4 = st.byId[p.ref]; if(po4 && po4.pub===me().pub){ var a = openFrom(pub, p.c); if(a) (st.forms[p.ref] = st.forms[p.ref] || {})[pub] = a; } else if(po4 && pub===me().pub) (st.forms[p.ref] = st.forms[p.ref] || {})[pub] = {sent: true}; }
    else if(p.t==="tally"){ var po5 = st.byId[p.ref]; if(po5 && (po5.pub===pub || adm(pub))) st.tally[p.ref] = +p.amt || 0; }
    else if(p.t==="report" && p.to===me().pub){ var rp = openFrom(pub, p.c); if(rp) st.reports.push({pub: pub, at: x.at, r: rp}); }
  });
  if(g.owner && !st.members[g.owner] && cache(g.id).ev) { /* owner may not have joined in the cache yet */ }
  g._st = st; return st;
}
function nameOf(st, pub){ var m = st.members[pub] || st.pendingJ[pub]; return m ? m.n : L("Ahli","Member"); }
function blocked(){ return H.load("ihsan_gblock", {}) || {}; }

// ---------------- create / invite / join ----------------
function create(o){
  var m = me(), g = {id: hex(rnd(12)), key: hex(rnd(32)), name: o.name, type: o.type, icon: gtype(o.type)[1], color: o.color || COLORS[0],
    relays: o.relays && o.relays.length ? o.relays : RELAYS.slice(), owner: m.pub, myName: o.myName, joinedAt: now(), adminsOnly: gtype(o.type)[5], comments: gtype(o.type)[6], approval: !!o.approval};
  putGrp(g);
  publish(g, {t: "meta", m: {name: g.name, type: g.type, icon: g.icon, color: g.color, desc: o.desc||"", rules: o.rules||"", adminsOnly: g.adminsOnly, comments: g.comments, approval: g.approval, admins: [m.pub], posters: [], roles: {}}});
  publish(g, {t: "join", n: o.myName, rl: o.type==="kids" ? "parent" : o.type==="couple" ? "partner" : undefined});
  return g;
}
function inviteLink(g, opt){ opt = opt || {}; var st = state(g);
  if(opt.pn) opt = {days: opt.days, single: opt.single, pn: opt.pn, rl: opt.rl, ag: opt.ag};
  var inv = {v: 1, i: g.id, k: g.key, r: g.relays||RELAYS, n: st.meta.name, y: st.meta.type, o: g.owner, c: st.meta.color};
  if(opt.days) inv.x = Date.now() + opt.days*864e5; if(opt.single) inv.s = hex(rnd(6)); if(st.meta.approval) inv.a = 1; if(opt.pn) inv.pn = String(opt.pn).slice(0, 30); if(opt.rl) inv.rl = opt.rl; if(opt.ag) inv.ag = opt.ag;
  return LINK + b64u(JSON.stringify(inv)); }
function parseInvite(s){ s = String(s||"").trim(); var i = s.indexOf("#"); var frag = i>=0 ? s.slice(i+1) : s; if(frag.indexOf("g/")===0) frag = frag.slice(2);
  try{ var o = JSON.parse(unb64u(frag)); return o && o.i && o.k ? o : null; }catch(e){ return null; } }
function join(inv, myName, done){
  if(inv.x && Date.now() > inv.x){ H.toast(L("Jemputan ini sudah tamat tempoh","This invite has expired")); return; }
  if(grp(inv.i)){ H.toast(L("Anda sudah dalam kumpulan ini","You are already in this group")); done(grp(inv.i)); return; }
  var g = {id: inv.i, key: inv.k, name: inv.n || L("Kumpulan","Group"), type: inv.y || "other", icon: gtype(inv.y)[1], color: inv.c || COLORS[0], relays: inv.r || RELAYS.slice(), owner: inv.o, myName: myName, joinedAt: now(), approval: !!inv.a};
  putGrp(g); startSync(onChange);
  // wait briefly for the member list, then check single-use invites before joining
  setTimeout(function(){ var st = state(g);
    if(inv.s && st.usedInv[inv.s]){ H.toast(L("Jemputan sekali guna ini sudah digunakan","This single-use invite has already been used")); var s2 = store(); s2.list = s2.list.filter(function(x){ return x.id!==g.id; }); saveStore(s2); done(null); return; }
    publish(g, {t: "join", n: myName, inv: inv.s, single: !!inv.s, rl: inv.rl, ag: inv.ag}); done(g); }, pool && Object.keys(pool).some(function(u){ return pool[u].ok; }) ? 2500 : 400);
}
function leave(g){ publish(g, {t: "leave"}); var s = store(); s.list = s.list.filter(function(x){ return x.id!==g.id; }); saveStore(s); H.save(cacheKey(g.id), null); }
function removeMember(g, who){ publish(g, {t: "remove", who: who});
  // key rotation: a new group key, sent sealed to each remaining member (and me), so the removed member cannot read new posts
  var st = state(g), nk = hex(rnd(32));
  Object.keys(st.members).concat([me().pub]).forEach(function(pub){ if(pub===who) return; publish(g, {t: "rekey", to: pub, k: sealTo(pub, {k: nk})}); });
  g.old = (g.old||[]).concat([g.key]); g.key = nk; putGrp(g); startSync(); }

// ---------------- native (background check + notifications) ----------------
function pushNative(){ try{ if(!(window.Native && H.N.setGroups)) return; var s = store(), m = me();
  var out = s.list.filter(function(g){ return !g.archived; }).map(function(g){ var st = g._st || null; var evs = [];
    if(st) st.posts.forEach(function(p){ if(p.k==="event" && !p.gone && p.f.when){ var t = new Date(p.f.when).getTime(); if(t > Date.now()) evs.push({t: t, title: p.f.title||"", id: p.id}); } });
    return {id: g.id, key: g.key, tag: tagOf(g.id, g.key), name: g.name, relays: g.relays||RELAYS, mute: !!g.mute, since: cache(g.id).since||0, events: evs.slice(0, 20)}; });
  var gs = H.load("ihsan_gset", {}) || {};
  H.N.setGroups(JSON.stringify({me: m.pub, show: !!gs.showTitle, digest: gs.digest ? {on: true, t: gs.dt || "21:30"} : {on: false}, en: H.en ? !!H.en() : false, groups: out})); }catch(e){} }

// ---------------- UI ----------------
var UI = {g: null, filter: "", q: ""};
function open(el, helpers){ H = helpers; UI.el = el; startSync(function(gid){ if(!document.body.contains(UI.el)) return; if(!UI.g || UI.g===gid) draw(); }); draw(); }
function draw(){ var el = UI.el; if(!el) return; if(UI.g && grp(UI.g)) board(el, grp(UI.g)); else { UI.g = null; home(el); } }
function home(el){
  var s = store(), list = s.list.filter(function(g){ return !g.archived; }), arch = s.list.filter(function(g){ return g.archived; });
  // 0.6.2 (owner): the long explanation hides itself (ⓘ shows it); every group row has ⋮ for its settings menu
  var h = '<div class="card gpHero"><div class="gvh"><span class="gvic">👥</span><div style="flex:1;min-width:0"><b>'+L("Kumpulan","Groups")+'</b><div class="mut small gpInfoT"'+(UI.info?'':' hidden')+'>'+L("Papan kenyataan peribadi untuk keluarga, sahabat, kariah masjid, sekolah dan komuniti. Sertai dengan jemputan sahaja, tanpa had ahli, disulitkan hujung ke hujung. Gunakan WhatsApp untuk berbual; Kumpulan untuk pengumuman, acara, doa, undian dan senarai.","Private notice boards for family, friends, masjid communities, schools and more. Invite only, no member limit, end-to-end encrypted. Use WhatsApp to chat; use Groups for announcements, events, doa, polls and sign-ups.")+'</div></div><button class="gpInfo'+(UI.info?' on':'')+'" id="gpInfo" aria-label="ⓘ">ⓘ</button></div>'+
    '<div class="btns" style="margin-top:8px"><button class="btn gold g3d" id="gpNew">＋ '+L("Buat kumpulan","Create a group")+'</button><button class="btn alt g3d" id="gpJoin">🔗 '+L("Sertai","Join")+'</button>'+(list.length?'<button class="btn alt g3d" id="gpCal">📅 '+L("Semua acara","All events")+'</button>':'')+'</div></div>';
  var clip = clipInvite();
  if(clip) h += '<div class="card gpClip"><b>🔗 '+L("Pautan jemputan disalin: ","Invite link copied: ")+esc(clip.n||"")+'</b><button class="btn gold g3d" id="gpClipJ">'+L("Sertai","Join")+'</button></div>';
  if(!list.length) h += '<div class="card mut small">'+L("Belum ada kumpulan. Buat satu, atau minta pautan jemputan daripada pentadbir kumpulan.","No groups yet. Create one, or ask a group admin for an invite link.")+'<div class="btns" style="margin-top:10px"><button class="btn gold g3d" data-proxy="#gpNew">＋ '+L("Buat kumpulan pertama","Create your first group")+'</button></div></div>';
  list.forEach(function(g){ var st = state(g), ps = st.posts.filter(function(p){ return !p.gone; }), last = ps[ps.length-1], unread = ps.filter(function(p){ return p.at > (g.seen||0) && p.pub!==me().pub; }).length;
    h += '<button class="card gpRow" data-gp="'+g.id+'" style="--gc:'+esc(st.meta.color||g.color)+'"><span class="gpIc">'+esc(st.meta.icon||g.icon)+'</span><span class="gpTx"><b>'+esc(st.meta.name||g.name)+'</b><small>'+esc(L(gtype(st.meta.type)[2], gtype(st.meta.type)[3]))+' · '+Object.keys(st.members).length+' '+L("ahli","members")+(g.mute?' · 🔕':'')+'</small>'+
      (last?'<small class="mut">'+esc(pk(last.k)[1]+" "+(last.f.title||last.f.text||"").slice(0, 70))+'</small>':'')+'</span>'+(unread?'<span class="gpUn">'+unread+'</span>':'')+'<span class="gpDots" role="button" tabindex="0" data-gpm="'+g.id+'" aria-label="'+L("Tetapan","Settings")+'">⋮</span></button>'; });
  if(arch.length) h += '<details class="card"><summary>🗄 '+L("Arkib","Archive")+' ('+arch.length+')</summary>'+arch.map(function(g){ return '<button class="chip" data-gp="'+g.id+'">'+esc(g.icon+" "+g.name)+'</button>'; }).join(" ")+'</details>';
  if(list.length) h += '<div class="btns" style="margin:4px 0"><button class="chip" id="gpNs">🔔 '+L("Makluman & ringkasan harian","Notifications & daily digest")+'</button><button class="chip" id="gpOl">🔗 '+L("Buka pautan jemputan terus dalam My Ihsan","Open invite links directly in My Ihsan")+'</button></div>';
  h += '<div class="mut tiny" style="padding:4px 6px">🔒 '+L("Hanya ahli yang memegang pautan jemputan boleh membaca. Pelayan geganti (relay) hanya membawa data bersulit.","Only members holding the invite link can read. Relay servers only carry encrypted data.")+(pending()?' · ⏳ '+pending()+' '+L("belum dihantar","not sent yet"):'')+'</div>';
  el.innerHTML = h;
  el.querySelector("#gpNew").onclick = createSheet; el.querySelector("#gpJoin").onclick = function(){ var c2 = clipRaw(); joinSheet(parseInvite(c2) ? c2 : ""); };
  var cj = el.querySelector("#gpClipJ"); if(cj) cj.onclick = function(){ joinSheet(clipRaw()); };
  var ca = el.querySelector("#gpCal"); if(ca) ca.onclick = function(){ calSheet(store().list, L("Kalendar semua kumpulan","All groups calendar")); };
  var ns = el.querySelector("#gpNs"); if(ns) ns.onclick = notifSheet;
  var ol = el.querySelector("#gpOl"); if(ol) ol.onclick = openLinksHelp;
  var gi = el.querySelector("#gpInfo"); if(gi) gi.onclick = function(){ UI.info = !UI.info; gi.classList.toggle("on", UI.info); var t = el.querySelector(".gpInfoT"); if(t) t.hidden = !UI.info; };
  el.querySelectorAll("[data-gpm]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); e.preventDefault(); var g = grp(b.getAttribute("data-gpm")); if(g) groupMenu(g); }; });
  el.querySelectorAll("[data-gp]").forEach(function(b){ b.onclick = function(){ UI.g = b.getAttribute("data-gp"); UI.filter = ""; UI.tab = ""; draw(); }; });
}
// a copied invite link (Android clipboard) is offered at once, since links in WhatsApp open the browser unless "Open by default" is set
function clipRaw(){ try{ return (H.N && H.N.clipText) ? String(H.N.clipText()||"") : ""; }catch(e){ return ""; } }
function clipInvite(){ var t = clipRaw(), inv = parseInvite(t); return inv && !grp(inv.i) && !(inv.x && Date.now() > inv.x) ? inv : null; }
function nameIn(){ return (H.S && H.S.uname) || (H.load("ihsan_settings", {})||{}).uname || ""; }
function createSheet(){
  var h = '<label class="mut small">'+L("Kumpulan ini untuk apa?","What is this group for?")+'</label><div class="gtTypes">'+GTYPES.map(function(t, i){ var d = TDESC[t[0]]||["",""]; return '<button class="gtType'+(i===0?' on':'')+'" data-gt="'+t[0]+'"><span class="e">'+t[1]+'</span><span class="gtTx"><b>'+esc(L(t[2], t[3]))+'</b><small>'+esc(L(d[0], d[1]))+'</small></span><i class="gtRad"></i></button>'; }).join("")+'</div>'+
    '<input id="gnN" class="rin" maxlength="50" placeholder="'+L("Nama kumpulan, cth. Keluarga Haji Ahmad","Group name, e.g. Haji Ahmad family")+'">'+
    '<input id="gnD" class="rin" maxlength="140" placeholder="'+L("Penerangan ringkas (pilihan)","Short description (optional)")+'">'+
    '<input id="gnM" class="rin" maxlength="30" placeholder="'+L("Nama anda dalam kumpulan ini","Your name in this group")+'" value="'+esc(nameIn())+'">'+
    '<div class="gpCol">'+COLORS.map(function(c, i){ return '<button class="gpSw'+(i===0?' on':'')+'" data-gc="'+c+'" style="background:'+c+'"></button>'; }).join("")+'</div>'+
    '<label class="obChk"><input type="checkbox" id="gnA"> '+L("Ahli baharu perlu kelulusan pentadbir","New members need admin approval")+'</label>'+
    '<button class="btn gold full g3d" id="gnGo">'+L("Buat kumpulan","Create group")+'</button>';
  var ov = H.showSheet("👥 "+L("Kumpulan baharu","New group"), h), type = GTYPES[0][0], col = COLORS[0];
  ov.querySelectorAll("[data-gt]").forEach(function(b){ b.onclick = function(){ type = b.getAttribute("data-gt"); ov.querySelectorAll("[data-gt]").forEach(function(x){ x.classList.toggle("on", x===b); }); var nm = ov.querySelector("#gnN"); if(nm && !nm.value) nm.placeholder = type==="couple" ? L("Nama, cth. Ihsan & Farah","Name, e.g. Ihsan & Farah") : type==="kids" ? L("Nama, cth. Rumah Kita","Name, e.g. Our Home") : L("Nama kumpulan","Group name"); }; });
  ov.querySelectorAll("[data-gc]").forEach(function(b){ b.onclick = function(){ col = b.getAttribute("data-gc"); ov.querySelectorAll("[data-gc]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  ov.querySelector("#gnGo").onclick = function(){ var n = ov.querySelector("#gnN").value.trim(), mn = ov.querySelector("#gnM").value.trim();
    if(!n || !mn){ H.toast(L("Isi nama kumpulan dan nama anda","Fill in the group name and your name")); return; }
    var g = create({name: n, type: type, color: col, desc: ov.querySelector("#gnD").value.trim(), myName: mn, approval: ov.querySelector("#gnA").checked});
    H.closeOverlay(); UI.g = g.id; UI.tab = ""; draw(); if(type==="couple") inviteSheet(g, {single: true, days: 0, rl: "partner"}); else if(type==="kids") inviteRole(g); else inviteSheet(g); };
}
function joinSheet(pre){
  var inv = parseInvite(pre);
  var h = '<textarea id="gjL" class="rin" rows="3" placeholder="'+L("Tampal pautan jemputan di sini","Paste the invite link here")+'">'+esc(pre||"")+'</textarea>'+
    '<div id="gjInfo" class="mut small" style="margin:4px 0"></div>'+
    '<input id="gjM" class="rin" maxlength="30" placeholder="'+L("Nama anda dalam kumpulan ini","Your name in this group")+'" value="'+esc((inv && inv.pn) || nameIn())+'">'+
    '<div class="mut tiny" style="margin:4px 0">'+L("Dengan menyertai, anda bersetuju dengan peraturan kumpulan dan tidak menghantar dokumen peribadi atau nombor IC.","By joining you agree to the group rules and not to post private documents or IC numbers.")+'</div>'+
    '<div class="btns"><button class="btn alt g3d" id="gjP">📋 '+L("Tampal","Paste")+'</button><button class="btn alt g3d" id="gjQ">📷 '+L("Imbas kod QR","Scan QR code")+'</button><button class="btn gold g3d" id="gjGo">'+L("Sertai","Join")+'</button></div>';
  var ov = H.showSheet("🔗 "+L("Sertai kumpulan","Join a group"), h);
  var info = function(){ inv = parseInvite(ov.querySelector("#gjL").value); var i = ov.querySelector("#gjInfo"), mi = ov.querySelector("#gjM"); if(inv && inv.pn && mi && !mi.value.trim()) mi.value = inv.pn;
    i.innerHTML = inv ? '✅ '+esc(gtype(inv.y)[1]+" "+(inv.n||""))+(inv.a?' · '+L("perlu kelulusan","needs approval"):'')+(inv.x?' · '+L("tamat ","expires ")+new Date(inv.x).toLocaleDateString():'') : (ov.querySelector("#gjL").value.trim()?'⚠️ '+L("Pautan tidak sah","Not a valid invite link"):''); };
  ov.querySelector("#gjL").oninput = info; info();
  ov.querySelector("#gjP").onclick = function(){ var t = clipRaw(); var go = function(x){ if(x){ ov.querySelector("#gjL").value = x; info(); } else H.toast(L("Papan keratan kosong","The clipboard is empty")); };
    if(t) go(t); else try{ navigator.clipboard.readText().then(go, function(){ go(""); }); }catch(e){ go(""); } };
  ov.querySelector("#gjQ").onclick = function(){ scanQR(function(txt){ joinSheet(txt); }); };
  ov.querySelector("#gjGo").onclick = function(){ var mn = ov.querySelector("#gjM").value.trim(); if(!inv){ H.toast(L("Tampal pautan jemputan yang sah","Paste a valid invite link")); return; } if(!mn){ H.toast(L("Isi nama anda","Fill in your name")); return; }
    var b = ov.querySelector("#gjGo"); b.disabled = true; b.textContent = "⏳";
    join(inv, mn, function(g){ H.closeOverlay(); if(g){ UI.g = g.id; draw(); H.toast(L("Disertai: ","Joined: ")+g.name); } }); };
}
function inviteSheet(g, o0){
  var opt = o0 || {days: 7, single: false}, ov;
  var drawI = function(){ var link = inviteLink(g, opt), qr = qrSvg(link);
    var h = (opt.pn||opt.rl?'<div class="small" style="margin-bottom:6px">👤 '+L("Jemputan peribadi: ","Personal invite: ")+'<b>'+esc(opt.pn||"")+'</b>'+(opt.rl?' · '+esc(roleName(opt.rl))+(opt.ag?' · '+esc(opt.ag==="u7"?L("bawah 7","under 7"):opt.ag):''):'')+'</div>':'')+'<div class="gpQr">'+qr+'</div><div class="mut tiny" style="word-break:break-all">'+esc(link)+'</div>'+
      '<div class="set"><span>'+L("Tamat tempoh","Expires")+'</span><span>'+[[1,L("1 hari","1 day")],[7,L("7 hari","7 days")],[0,L("Tidak","Never")]].map(function(x){ return '<button class="chip'+(opt.days===x[0]?' on':'')+'" data-gd="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</span></div>'+
      '<label class="obChk"><input type="checkbox" id="giS"'+(opt.single?' checked':'')+'> '+L("Sekali guna sahaja","Single use only")+'</label>'+
      '<button class="chip" id="giT" style="margin:4px 0">🌳 '+L("Jemput dari salasilah keluarga (pautan peribadi)","Invite from the family tree (personal links)")+'</button>'+
      '<div class="btns"><button class="btn gold g3d" id="giW">💬 '+L("Kongsi ke WhatsApp","Share to WhatsApp")+'</button><button class="btn alt g3d" id="giC">📋 '+L("Salin","Copy")+'</button><button class="btn alt g3d" id="giP">🖨 '+L("Poster QR","QR poster")+'</button></div>'+
      '<div class="mut tiny">🔒 '+L("Sesiapa yang memegang pautan ini boleh membaca kumpulan. Kongsi kepada orang yang dipercayai sahaja.","Anyone holding this link can read the group. Share it only with people you trust.")+'</div>';
    ov = H.showSheet("➕ "+L("Jemput ahli","Invite members"), h);
    ov.querySelectorAll("[data-gd]").forEach(function(b){ b.onclick = function(){ opt.days = +b.getAttribute("data-gd"); drawI(); }; });
    ov.querySelector("#giS").onchange = function(){ opt.single = this.checked; drawI(); };
    var txt = L("Assalamualaikum. Sertai papan kenyataan \"","Assalamualaikum. Join the notice board \"")+g.name+L("\" dalam aplikasi My Ihsan (percuma di Google Play). Salin pautan ini, kemudian buka My Ihsan › Alat › Kumpulan › Sertai dan tampal:\n","\" in the My Ihsan app (free on Google Play). Copy this link, then open My Ihsan › Tools › Groups › Join and paste it:\n")+link;
    ov.querySelector("#giW").onclick = function(){ if(H.N.shareTo) H.N.shareTo("com.whatsapp", txt); else if(H.N.shareText) H.N.shareText(txt); else window.open("https://wa.me/?text="+encodeURIComponent(txt)); };
    ov.querySelector("#giC").onclick = function(){ if(H.N.copyText) H.N.copyText(link); else try{ navigator.clipboard.writeText(link); }catch(e){} H.toast(L("Disalin","Copied")); };
    ov.querySelector("#giP").onclick = function(){ poster(g, link); };
    ov.querySelector("#giT").onclick = function(){ treeInvite(g); }; };
  drawI();
}
function poster(g, link){ var st = state(g);
  var html = '<html><head><meta charset="utf-8"><style>body{font-family:sans-serif;text-align:center;padding:40px}h1{font-size:34px;margin:10px 0}svg{width:70%;max-width:420px;height:auto}p{font-size:18px}</style></head><body>'+
    '<div style="font-size:60px">'+esc(st.meta.icon||"👥")+'</div><h1>'+esc(st.meta.name)+'</h1><p>'+L("Imbas untuk sertai papan kenyataan ini dalam aplikasi My Ihsan","Scan to join this notice board in the My Ihsan app")+'</p>'+qrSvg(link)+'<p style="font-size:13px;color:#555">'+L("Muat turun My Ihsan di Google Play, kemudian buka Alat › Kumpulan › Sertai › Imbas kod QR.","Get My Ihsan on Google Play, then open Tools › Groups › Join › Scan QR code.")+'</p></body></html>';
  if(H.N.printHtml) H.N.printHtml(html, "Kumpulan-"+st.meta.name); else { var w = window.open(""); if(w){ w.document.write(html); w.print(); } } }
function qrSvg(text){ var q = K.qrcode(0, "M"); q.addData(unescape(encodeURIComponent(text))); q.make(); var n = q.getModuleCount(), s = 4, p = '';
  for(var r=0;r<n;r++) for(var c=0;c<n;c++) if(q.isDark(r, c)) p += 'M'+(c*s+s*2)+' '+(r*s+s*2)+'h'+s+'v'+s+'h-'+s+'z';
  var w = n*s+s*4; return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+w+'"><rect width="'+w+'" height="'+w+'" fill="#fff"/><path d="'+p+'" fill="#000"/></svg>'; }
function scanQR(done){
  var go = function(){ if(!H.N.hasPerm("camera")){ var ph = function(r){ if(r.which!=="camera") return; H.off("perm", ph); if(r.granted) go(); }; H.on("perm", ph); H.N.requestPerm("camera"); return; }
    var ov = document.getElementById("overlay"), stream = null, t = null, closed = false;
    ov.className = "bcov"; ov.innerHTML = '<video id="gqV" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover"></video><div class="bcTop"><button class="qcX" id="gqX">✕</button><b>'+L("Imbas kod QR jemputan","Scan the invite QR code")+'</b><span></span></div>';
    var stop = function(){ closed = true; clearTimeout(t); if(stream) stream.getTracks().forEach(function(x){ x.stop(); }); H.closeOverlay(); };
    ov.querySelector("#gqX").onclick = stop; ov._close = stop;
    var v = ov.querySelector("#gqV"), cv = document.createElement("canvas"), cx = cv.getContext("2d", {willReadFrequently: true}), det = ("BarcodeDetector" in window) ? new window.BarcodeDetector({formats: ["qr_code"]}) : null, zx = null;
    var hit = function(txt){ if(closed || !parseInvite(txt)) return false; stop(); done(txt); return true; };
    var tick = function(){ if(closed) return; if(v.videoWidth){ if(det){ det.detect(v).then(function(r){ if(!(r && r[0] && hit(r[0].rawValue))) t = setTimeout(tick, 250); }).catch(function(){ t = setTimeout(tick, 400); }); return; }
        if(zx){ cv.width = v.videoWidth; cv.height = v.videoHeight; cx.drawImage(v, 0, 0); try{ var Z = window.ZXing, img = cx.getImageData(0, 0, cv.width, cv.height), lum = new Z.RGBLuminanceSource(img.data, cv.width, cv.height), r2 = zx.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(lum))); if(hit(r2.getText())) return; }catch(e){} } }
      t = setTimeout(tick, 300); };
    var startCam = function(){ navigator.mediaDevices.getUserMedia({video: {facingMode: "environment"}}).then(function(s){ stream = s; v.srcObject = s; tick(); }).catch(function(){ stop(); H.toast(L("Kamera tidak tersedia","Camera not available")); }); };
    if(det) startCam(); else { var sc = document.createElement("script"); sc.src = "halal/zxing.min.js"; sc.onload = function(){ var Z = window.ZXing; zx = new Z.MultiFormatReader(); var hm = new Map(); hm.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.QR_CODE]); zx.setHints(hm); startCam(); }; sc.onerror = startCam; if(window.ZXing) sc.onload(); else document.body.appendChild(sc); } };
  go();
}

// ---------------- board ----------------
function board(el, g){
  var st = state(g), m = me(), adm = isAdmin(g, m.pub), canPost = adm || (!st.meta.ann && (!st.meta.adminsOnly || (st.meta.posters||[]).indexOf(m.pub)>=0)), bl = blocked();
  if(!st.members[m.pub] && !st.pendingJ[m.pub] && !adm && Object.keys(st.removed).indexOf(m.pub)>=0){ el.innerHTML = '<div class="card">'+L("Anda telah dikeluarkan daripada kumpulan ini.","You were removed from this group.")+' <button class="chip" id="gpLv">'+L("Buang dari telefon","Remove from phone")+'</button></div>'; el.querySelector("#gpLv").onclick = function(){ leave(g); UI.g = null; draw(); }; return; }
  g.seen = now(); putGrp(g);
  var posts = st.posts.filter(function(p){ return !p.gone && !bl[p.pub] && !(p.k==="pnote" && !(p.f.to && p.f.to[m.pub])) && (!p.f.exp || new Date(p.f.exp).getTime() > Date.now()) && (!UI.filter || p.k===UI.filter) &&
    (!UI.q || JSON.stringify(p.f).toLowerCase().indexOf(UI.q.toLowerCase())>=0); });
  posts.sort(function(a, b){ return (b.pin?1:0) - (a.pin?1:0) || (pk(b.k)[4]&&b.at>now()-86400?1:0) - (pk(a.k)[4]&&a.at>now()-86400?1:0) || b.at - a.at; });
  var kinds = {}; st.posts.forEach(function(p){ if(!p.gone) kinds[p.k] = 1; });
  var h = '<div class="card gpHead" style="--gc:'+esc(st.meta.color)+'"><div class="gvh"><button class="chip" id="gpBack">‹</button><span class="gpIc">'+esc(st.meta.icon)+'</span><div style="flex:1;min-width:0"><b>'+esc(st.meta.name)+'</b><div class="mut tiny">'+esc(L(gtype(st.meta.type)[2], gtype(st.meta.type)[3]))+' · '+Object.keys(st.members).length+' '+L("ahli","members")+(adm?' · '+L("pentadbir","admin"):'')+'</div></div><button class="chip gpMoreB" id="gpMore" aria-label="'+L("Tetapan","Settings")+'">⋮</button></div>'+
    (st.meta.desc?'<div class="small" style="margin-top:6px">'+esc(st.meta.desc)+'</div>':'')+
    (Object.keys(st.pendingJ).length && adm?'<button class="chip" id="gpPend" style="margin-top:6px">⏳ '+Object.keys(st.pendingJ).length+' '+L("menunggu kelulusan","waiting for approval")+'</button>':'')+
    (st.pendingJ[m.pub]?'<div class="mut small" style="margin-top:6px">⏳ '+L("Menunggu kelulusan pentadbir.","Waiting for admin approval.")+'</div>':'')+'</div>';
  var TY = typedHome(g, st);
  if(TY){ if(TY.html!==null){ h += '<div class="gtTabRow">'+TY.tabs+(canPost && !st.pendingJ[m.pub]?'<button class="btn gold g3d gtAddB" id="gpPost">＋ '+(st.meta.type==="kids" && myRole(st)==="child"?L("Beritahu","Tell"):L("Tambah","Add"))+'</button>':'')+'</div>'+TY.html;
      el.innerHTML = h; el.querySelector("#gpBack").onclick = function(){ UI.g = null; UI.tab = ""; draw(); }; el.querySelector("#gpMore").onclick = function(){ groupMenu(g); };
      var pp0 = el.querySelector("#gpPost"); if(pp0) pp0.onclick = function(){ composeKind(g); }; var pe0 = el.querySelector("#gpPend"); if(pe0) pe0.onclick = function(){ membersSheet(g); };
      bindTyped(el, g, st); try{ remsSchedule(g, st); }catch(e){} return; } }
  if(TY) h += TY.tabs;
  h += '<div class="gpBar">'+(canPost && !st.pendingJ[m.pub]?'<button class="btn gold g3d" id="gpPost">✏️ '+L("Tulis","Post")+'</button>':'')+'<input id="gpQ" class="rin" type="search" placeholder="🔎 '+L("Cari","Search")+'" value="'+esc(UI.q)+'"><button class="chip" id="gpCal" title="'+L("Kalendar","Calendar")+'">🗓</button></div>'+
    (st.meta.ann?'<div class="gpAnn small">📢 '+(adm?L("Mod pengumuman: hanya pentadbir menulis. Ahli membaca dan memberi reaksi.","Announcement mode: only admins post. Members read and react."):L("Kumpulan pengumuman: hanya pentadbir menulis.","Announcement group: only admins post."))+'</div>':'');
  h += '<div class="gpChips"><button class="chip'+(UI.filter?'':' on')+'" data-gf="">'+L("Semua","All")+'</button>'+PKINDS.filter(function(k){ return kinds[k[0]]; }).map(function(k){ return '<button class="chip'+(UI.filter===k[0]?' on':'')+'" data-gf="'+k[0]+'">'+k[1]+' '+esc(L(k[2], k[3]))+'</button>'; }).join("")+'</div>';
  if(!posts.length) h += '<div class="card mut small">'+(st.posts.length?L("Tiada hantaran sepadan.","No matching posts."):L("Belum ada hantaran. ","No posts yet. ")+(canPost?L("Tekan ✏️ Tulis untuk membuat pengumuman pertama.","Tap ✏️ Post to make the first announcement."):L("Pentadbir akan membuat pengumuman di sini.","Admins will post announcements here.")))+'</div>';
  posts.forEach(function(p){ h += card(g, st, p, adm); });
  if(st.reports.length && adm) h += '<details class="card"><summary>🚩 '+L("Laporan","Reports")+' ('+st.reports.length+')</summary>'+st.reports.map(function(r){ return '<div class="small">'+esc(nameOf(st, r.pub))+': '+esc(r.r.why||"")+' '+(r.r.ref?'('+L("hantaran","post")+')':'')+(r.r.who?'('+esc(nameOf(st, r.r.who))+')':'')+'</div>'; }).join("")+'</details>';
  el.innerHTML = h;
  el.querySelector("#gpBack").onclick = function(){ UI.g = null; UI.tab = ""; draw(); };
  el.querySelector("#gpMore").onclick = function(){ groupMenu(g); };
  var pp = el.querySelector("#gpPost"); if(pp) pp.onclick = function(){ composeKind(g); };
  el.querySelector("#gpCal").onclick = function(){ calSheet([g], st.meta.name); };
  var pe = el.querySelector("#gpPend"); if(pe) pe.onclick = function(){ membersSheet(g); };
  var q = el.querySelector("#gpQ"); q.onchange = function(){ UI.q = q.value; draw(); };
  el.querySelectorAll("[data-gf]").forEach(function(b){ b.onclick = function(){ UI.filter = b.getAttribute("data-gf"); draw(); }; });
  bindCards(el, g, st); if(TY) bindTyped(el, g, st); if(st.meta.type=="couple") try{ remsSchedule(g, st); }catch(e){}
}
function when(at){ var d = new Date(at*1000), t = Date.now()/1000 - at; if(t < 3600) return Math.max(1, Math.round(t/60))+L(" min lalu"," min ago"); if(t < 86400) return Math.round(t/3600)+L(" jam lalu"," h ago"); return d.toLocaleDateString(undefined, {day: "numeric", month: "short"}); }
function fmtDT(s){ if(!s) return ""; var d = new Date(s); if(isNaN(d)) return esc(s); if(/T00:00$/.test(String(s))) return d.toLocaleDateString(undefined, {weekday: "short", day: "numeric", month: "short"});   // date only (time unticked)
  return d.toLocaleString(undefined, {weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}); }
function card(g, st, p, adm){
  var k = pk(p.k), f = p.f, m = me().pub, mine = p.pub===m, urgent = k[4] || f.imp;
  var h = '<div class="card gpPost'+(p.pin?' pin':'')+(urgent?' urg':'')+'" data-pid="'+p.id+'"><div class="gpPh"><span>'+k[1]+'</span><b>'+esc(L(k[2], k[3]))+'</b>'+(p.pin?' 📌':'')+(f.imp?' ❗':'')+'<span class="mut tiny" style="margin-left:auto">'+esc(nameOf(st, p.pub))+(st.meta.roles && st.meta.roles[p.pub]?' ('+esc(st.meta.roles[p.pub])+')':'')+' · '+when(p.at)+(p.edited?' · '+L("disunting","edited"):'')+'</span></div>';
  if(f.title && p.k!=="todo") h += '<h4 class="gpT">'+esc(f.title)+'</h4>';
  if(p.k==="death") h += '<div class="gpDeath"><div class="ar" dir="rtl">إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُوْنَ</div><b>'+esc(f.name||"")+'</b>'+(f.solat?'<div>🕌 '+L("Solat jenazah: ","Funeral prayer: ")+esc(f.solat)+'</div>':'')+(f.burial?'<div>⚰️ '+L("Pengebumian: ","Burial: ")+esc(f.burial)+'</div>':'')+(f.contact?'<div>📞 '+esc(f.contact)+'</div>':'')+'<div class="mut small">'+L("Semoga Allah mengampuninya, merahmatinya dan menempatkannya bersama orang-orang yang soleh.","May Allah forgive them, have mercy on them and place them among the righteous.")+'</div><div class="mut tiny">'+L("Lafaz doa perlu disemak ustaz.","The doa wording needs an ustaz's review.")+'</div></div>';
  if(f.text) h += '<div class="gpX">'+esc(f.text).replace(/\n/g, "<br>")+'</div>';
  if(f.img && f.img.length) h += '<div class="gpImgs">'+f.img.map(function(src){ return '<img src="'+src+'" alt="" data-gimg>'; }).join("")+'</div>';
  if(p.k==="event"){ var rs = st.rsvp[p.id]||{}, cnt = {y:0,m:0,n:0}; Object.keys(rs).forEach(function(x){ cnt[rs[x]]++; });
    h += '<div class="gpEv">📅 '+fmtDT(f.when)+(f.after?' · '+esc(f.after):'')+(f.rep?' · 🔁 '+L("setiap minggu","weekly"):'')+(f.place?'<br>📍 <a href="#" data-gmap="'+esc(f.place)+'">'+esc(f.place)+'</a>':'')+'</div>'+
      '<div class="btns">'+[["y","✅",L("Hadir","Going")],["m","🤔",L("Mungkin","Maybe")],["n","❌",L("Tidak","Not going")]].map(function(o){ return '<button class="chip'+(rs[m]===o[0]?' on':'')+'" data-grsvp="'+o[0]+'">'+o[1]+' '+o[2]+' '+cnt[o[0]]+'</button>'; }).join("")+'<button class="chip'+(remOn(g, p)?' on':'')+'" data-grem>🔔 '+(remOn(g, p)?L("Diingatkan","Reminder on"):L("Ingatkan","Remind me"))+'</button><button class="chip" data-gcal>🗓 '+L("Ke kalendar","To calendar")+'</button></div>'; }
  if(p.k==="poll"){ var vs = st.votes[p.id]||{}, tot = Object.keys(vs).length, cl = f.close && Date.now() > f.close, cnts = (f.opts||[]).map(function(){ return 0; }), myv = vs[m]||[];
    Object.keys(vs).forEach(function(x){ (vs[x]||[]).forEach(function(i){ if(cnts[i]!=null) cnts[i]++; }); });
    var showR = !f.after || cl || mine;
    h += '<div class="gpPoll">'+(f.opts||[]).map(function(o, i){ var pc = tot ? Math.round(cnts[i]*100/tot) : 0; return '<button class="gpOpt'+(myv.indexOf(i)>=0?' on':'')+'" data-gvote="'+i+'"'+(cl?' disabled':'')+'><span class="gpBarF" style="width:'+(showR?pc:0)+'%"></span><span>'+esc(o)+'</span>'+(showR?'<b>'+cnts[i]+'</b>':'')+'</button>'; }).join("")+
      '<div class="mut tiny">'+tot+' '+L("undi","votes")+(f.multi?' · '+L("pilih beberapa","pick several"):'')+(f.named?' · '+L("bernama","named"):' · '+L("tanpa nama","anonymous"))+(f.close?' · '+(cl?L("ditutup","closed"):L("tutup ","closes ")+fmtDT(f.close)):'')+'</div>'+
      (f.named && showR && tot?'<div class="mut tiny">'+Object.keys(vs).map(function(x){ return esc(nameOf(st, x))+': '+(vs[x]||[]).map(function(i){ return esc((f.opts||[])[i]||""); }).join(", "); }).join(" · ")+'</div>':'')+'</div>'; }
  if(p.k==="signup"){ var sl = st.slots[p.id]||{};
    h += '<div class="gpSlots">'+(f.slots||[]).map(function(s, i){ var who = sl[i]||[], full = who.length >= (s.n||1), inS = who.indexOf(m)>=0;
      return '<div class="gpSlot"><span>'+esc(s.l)+' <small class="mut">('+who.length+'/'+(s.n||1)+')</small></span><small class="mut">'+who.map(function(x){ return esc(nameOf(st, x)); }).join(", ")+'</small><button class="chip'+(inS?' on':'')+'" data-gslot="'+i+'"'+(full&&!inS?' disabled':'')+'>'+(inS?L("Batal","Cancel"):full?L("Penuh","Full"):L("Ambil","Take"))+'</button></div>'; }).join("")+'</div>'; }
  if(p.k==="collect"){ var got = st.tally[p.id]||0, tg = +f.target||0, pc2 = tg ? Math.min(100, Math.round(got*100/tg)) : 0;
    h += '<div class="gpCollect"><div class="gpProg"><i style="width:'+pc2+'%"></i></div><div class="small">RM '+got.toLocaleString()+(tg?' / RM '+tg.toLocaleString()+' ('+pc2+'%)':'')+'</div>'+(f.acct?'<div class="small">🏦 '+esc(f.acct)+'</div>':'')+
      '<div class="mut tiny">'+L("Wang tidak melalui aplikasi ini. Bendahari mengemas kini jumlah secara manual.","No money goes through this app. The treasurer updates the total by hand.")+'</div>'+((mine||adm)?'<button class="chip" data-gtally>✏️ '+L("Kemas kini jumlah","Update total")+'</button>':'')+'</div>'; }
  if(p.k==="task"){ var dn = st.done[p.id]||{}; h += '<div class="small">'+(f.due?'⏰ '+fmtDT(f.due)+' · ':'')+(f.who?'👤 '+esc(f.who)+' · ':'')+Object.keys(dn).length+' '+L("selesai","done")+'</div><button class="chip'+(dn[m]?' on':'')+'" data-gdone>'+(dn[m]?'✅ '+L("Selesai","Done"):'☐ '+L("Tanda selesai","Mark done"))+'</button>'; }
  if(p.k==="permit"){ var fm = st.forms[p.id]||{};
    if(mine){ var ans = Object.keys(fm); h += '<div class="small">'+ans.length+' '+L("jawapan (hanya anda nampak)","replies (only you see them)")+'</div>'+(ans.length?'<details><summary class="small">'+L("Lihat jawapan","See replies")+'</summary>'+ans.map(function(x){ return '<div class="small">'+esc(nameOf(st, x))+': <b>'+esc(fm[x].v||"")+'</b> '+esc(fm[x].x||"")+'</div>'; }).join("")+'</details>':''); }
    else h += fm[m] ? '<div class="small">✅ '+L("Jawapan anda telah dihantar secara peribadi.","Your reply was sent privately.")+'</div>' : '<div class="btns"><button class="chip" data-gform="'+esc(L("Ya","Yes"))+'">👍 '+L("Ya","Yes")+'</button><button class="chip" data-gform="'+esc(L("Tidak","No"))+'">👎 '+L("Tidak","No")+'</button><button class="chip" data-gform="?">✍️ '+L("Jawab","Answer")+'</button></div>'; }
  if(p.k==="loc" && f.place) h += '<div class="small">📍 <a href="#" data-gmap="'+esc(f.place)+'">'+esc(f.place)+'</a></div>';
  if(p.k==="doc" && f.file) h += '<button class="chip" data-gdoc>📄 '+esc(f.fname||"PDF")+'</button>';
  if(p.k==="roster" && f.rows) h += '<table class="gpRos">'+f.rows.map(function(r){ return '<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td></tr>'; }).join("")+'</table>';
  if(p.k==="todo") h += todoRow(st, p);
  if(p.k==="grocery"){ var tk0 = st.ticks[p.id]||{}; h += (p.f.items||[]).map(function(x, i){ var t = tk0[i]; return '<div class="gtRow'+(t?' done':'')+'">'+chk(!!t, 'data-gtick="'+p.id+'|'+i+'"', x)+'<span class="gtTx">'+esc(x)+'</span>'+(t?'<small class="gtWho">'+esc(nameOf(st, t.pub))+'</small>':'')+'</div>'; }).join(""); }
  if(p.k==="rem"){ var dr = st.done[p.id]||{}; h += '<div class="small">⏰ '+esc(remWhen(p))+' · 👤 '+whoName(st, p)+(p.f.nudge?' · 🔁 '+L("ingat semula","nudge"):'')+'</div>'+(Object.keys(dr).length?'<div class="small">✅ '+Object.keys(dr).map(function(x){ return esc(nameOf(st, x))+' '+hm(dr[x]*1000); }).join(", ")+'</div>':'')+(forMe(p, m)?'<button class="chip'+(dr[m]&&dkey(dr[m]*1000)===today()?' on':'')+'" data-gdone>'+(dr[m]&&dkey(dr[m]*1000)===today()?'✅ '+L("Selesai hari ini","Done today"):'☐ '+L("Tanda selesai","Mark done"))+'</button>':''); }
  if(p.k==="bill"){ var pb = st.done[p.id]||{}, pw = Object.keys(pb)[0]; h += '<div class="small">💵 RM '+(+f.amt||0).toLocaleString()+(f.due?' · '+L("akhir ","due ")+esc(f.due):'')+' · 👤 '+whoName(st, p)+'</div><button class="chip'+(pw?' on':'')+'" data-gdone>'+(pw?'✅ '+L("Dibayar oleh ","Paid by ")+esc(nameOf(st, pw)):'💳 '+L("Tanda dibayar","Mark paid"))+'</button>'; }
  if(p.k==="checkin") h += '<div class="gtCheck">'+stLabel(f.label)+(f.place?'<br>📍 '+esc(f.place):'')+'</div>';
  if(p.k==="help" && !f.text) h += '<div class="gtCheck">🙋 '+L("Perlu bantuan","Needs help")+'</div>';
  if(p.k==="solat"){ var px = PRAY.filter(function(x){ return x[0]===f.pr; })[0]; h += '<div class="gtCheck">'+(px?px[1]+' '+L(px[2], px[3]):'🕌')+' · '+(f.on?'✅ '+L("tepat waktu","on time"):'✓ '+L("sudah solat","prayed"))+'</div>'; }
  if(p.k==="quran") h += '<div class="gtCheck">📖 '+esc(f.surah||"")+(f.pages?' · '+(+f.pages)+' '+L("muka surat","pages"):'')+((st.oks[p.id]||{})[p.pub]?' · ✅ '+L("disahkan","signed off"):roleOf(st, p.pub)==="child"?' · ⏳':'')+'</div>';
  if(p.k==="chore"){ var cd = st.done[p.id]||{}, ck = st.oks[p.id]||{}; h += '<div class="small">⭐ '+(+f.pts||10)+' '+L("mata","pts")+' · 👤 '+whoName(st, p)+(f.proof?' · 📷':'')+(f.due?' · ⏰ '+fmtDT(f.due):'')+'</div>'+
    Object.keys(cd).map(function(x){ var pr = (st.proof[p.id]||{})[x]; return '<div class="gtRow done"><span>'+(ck[x]?'✅':'⏳')+'</span><span class="gtTx">'+esc(nameOf(st, x))+'</span>'+(pr?'<img class="gpThumb" src="'+pr.img+'" data-gimg alt="">':'')+(adm && !ck[x]?'<button class="chip" data-gok="'+p.id+'|'+x+'">✅ '+L("Lulus","Approve")+'</button>':'')+'</div>'; }).join("")+
    (forMe(p, m) && !cd[m] && roleOf(st, m)==="child"?'<button class="chip" data-gjob="'+p.id+'">☐ '+L("Sudah buat","I did it")+'</button>':''); }
  if(p.k==="reward") h += '<div class="small">🎁 '+(+f.cost||0)+' '+L("mata","points")+' · '+st.redeem.filter(function(r){ return r.ref===p.id; }).length+' '+L("kali ditebus","redeemed")+'</div>'+(roleOf(st, m)==="child" && points(st, m) >= (+f.cost||0)?'<button class="chip" data-gredeem="'+p.id+'">🎁 '+L("Tebus","Redeem")+'</button>':'');
  if(p.k==="pnote"){ var px2 = f.to && f.to[m] ? openFrom(p.pub, f.to[m]) : null; h += '<div class="gpX">🔒 '+(px2?esc(px2.text||"").replace(/\n/g, "<br>"):L("Untuk ibu bapa sahaja","For parents only"))+'</div>'; }
  if(p.k==="doa"){ var dc = Object.keys(st.doa[p.id]||{}).length; h += (f.resolved?'<div class="small">🌿 '+esc(f.resolved)+'</div>':'')+'<button class="chip'+((st.doa[p.id]||{})[m]?' on':'')+'" data-gdoa>🤲 '+L("Saya doakan","I made doa")+' · '+dc+'</button>'+(mine && !f.resolved?' <button class="chip" data-gres>🌿 '+L("Tandakan selesai","Mark resolved")+'</button>':''); }
  // reactions, replies, actions
  var rc = st.reacts[p.id]||{};
  h += '<div class="gpRx">'+REACTS.map(function(e){ var n = Object.keys(rc[e]||{}).length; return '<button class="gpR'+((rc[e]||{})[m]?' on':'')+'" data-greact="'+esc(e)+'">'+esc(e)+(n?' '+n:'')+'</button>'; }).join("")+'<button class="gpR" data-gact>⋯</button></div>';
  if(st.meta.comments && (!st.meta.ann || adm)){ var rp = st.replies[p.id]||[]; h += (rp.length?'<div class="gpRp">'+rp.slice(-5).map(function(r){ return '<div class="small"><b>'+esc(nameOf(st, r.pub))+'</b> '+esc(r.x)+'</div>'; }).join("")+'</div>':'')+'<div class="gpRpIn"><input class="rin" maxlength="300" placeholder="'+L("Balas ringkas…","Short reply…")+'" data-grin><button class="chip" data-greply>➤</button></div>'; }
  return h+'</div>';
}
function bindCards(el, g, st){
  el.querySelectorAll("[data-pid]").forEach(function(c){ var id = c.getAttribute("data-pid"), p = st.byId[id], f = p.f, m = me().pub;
    var q = function(s, fn){ c.querySelectorAll(s).forEach(function(b){ b.onclick = function(e){ e.preventDefault(); fn(b); }; }); };
    q("[data-greact]", function(b){ var e = b.getAttribute("data-greact"); publish(g, {t: "react", ref: id, e: e, on: !((st.reacts[id]||{})[e]||{})[m]}); draw(); });
    q("[data-grsvp]", function(b){ var v = b.getAttribute("data-grsvp"); publish(g, {t: "rsvp", ref: id, v: v}); if(v==="y" && !remOn(g, p)) setRem(g, p, true); if(v==="n" && remOn(g, p)) setRem(g, p, false); draw(); });
    q("[data-grem]", function(){ var on = !remOn(g, p); if(on && !nextWhen(p.f)){ H.toast(L("Acara sudah berlalu","The event has passed")); return; } setRem(g, p, on); H.toast(on?L("Peringatan 1 jam sebelum dan malam sebelumnya","Reminder 1 hour before and the evening before"):L("Peringatan dibuang","Reminder removed")); draw(); });
    q("[data-gvote]", function(b){ var i = +b.getAttribute("data-gvote"), cur = ((st.votes[id]||{})[m]||[]).slice();
      if(f.multi){ var j = cur.indexOf(i); if(j>=0) cur.splice(j, 1); else cur.push(i); } else cur = cur[0]===i ? [] : [i]; publish(g, {t: "vote", ref: id, o: cur}); draw(); });
    q("[data-gslot]", function(b){ var i = +b.getAttribute("data-gslot"); publish(g, {t: "slot", ref: id, s: i, on: ((st.slots[id]||{})[i]||[]).indexOf(m)<0}); draw(); });
    q("[data-gdone]", function(){ var was = (st.done[id]||{})[m], on = p.k==="rem" ? !(was && dkey(was*1000)===today()) : !was; publish(g, {t: "done", ref: id, on: on}); if(p.k==="rem") remsSchedule(g, state(g)); draw(); });
    q("[data-gdoa]", function(){ if((st.doa[id]||{})[m]) return; publish(g, {t: "doa", ref: id}); H.toast(L("Semoga Allah memperkenankan","May Allah accept it")); draw(); });
    q("[data-gres]", function(){ var t = prompt2(L("Kemas kini, cth. Alhamdulillah, sudah sembuh","Update, e.g. Alhamdulillah, recovered"), function(v){ if(v) { publish(g, {t: "edit", ref: id, f: {resolved: v}}); draw(); } }); });
    q("[data-gtally]", function(){ prompt2(L("Jumlah terkumpul (RM)","Total collected (RM)"), function(v){ if(v!==null && v!=="" && !isNaN(+v)){ publish(g, {t: "tally", ref: id, amt: +v}); draw(); } }, String(st.tally[id]||"")); });
    q("[data-gform]", function(b){ var v = b.getAttribute("data-gform"); var send = function(ans, x){ publish(g, {t: "form", ref: id, c: sealTo(p.pub, {v: ans, x: x||""})}); H.toast(L("Dihantar secara peribadi","Sent privately")); draw(); };
      if(v==="?") prompt2(f.title||L("Jawapan anda","Your answer"), function(x){ if(x) send("✍️", x); }); else send(v); });
    q("[data-gmap]", function(b){ var pl = b.getAttribute("data-gmap"); if(H.N.openMaps) H.N.openMaps(pl, 0, 0); else window.open("https://www.google.com/maps/search/"+encodeURIComponent(pl)); });
    q("[data-gcal]", function(){ toCalendar(f); });
    q("[data-gdoc]", function(){ if(H.N.openTextFile && f.file){ H.N.saveFile ? H.N.saveFile(f.fname||"fail.pdf", f.file) : null; } else window.open(f.file); });
    q("[data-greply]", function(){ var i = c.querySelector("[data-grin]"), x = i.value.trim(); if(!x) return; publish(g, {t: "reply", ref: id, x: x}); draw(); });
    q("[data-gimg]", function(b){ var ov = H.showSheet("📷", '<img src="'+b.getAttribute("src")+'" style="width:100%">'); });
    q("[data-gact]", function(){ postMenu(g, st, p); });
  });
  bindTyped(el, g, st);
}
function prompt2(label, cb, val){ var ov = H.showSheet("✏️", '<label class="small">'+esc(label)+'</label><input id="gp2" class="rin" value="'+esc(val||"")+'"><button class="btn gold full g3d" id="gp2Ok">OK</button>'); var i = ov.querySelector("#gp2"); i.focus();
  ov.querySelector("#gp2Ok").onclick = function(){ var v = i.value.trim(); H.closeOverlay(); cb(v); }; }
// ---------------- 0.5.23 reminders and the shared calendar (BAND style) ----------------
// next time an event happens (weekly ones roll forward), in ms, or 0
function nextWhen(f){ var t = new Date(f.when).getTime(); if(isNaN(t)) return 0; if(f.rep) while(t < Date.now()) t += 7*864e5; return t > Date.now() ? t : 0; }
function remId(g, p){ return "grem"+g.id.slice(0, 8)+p.id.slice(0, 10); }
function remOn(g, p){ return H.xremHas ? H.xremHas(remId(g, p)+"a") : false; }
function setRem(g, p, on){ if(!H.xrem) return; var t = on ? nextWhen(p.f) : 0, st = g._st || state(g), id = remId(g, p), ti = "📅 "+(p.f.title||L("Acara","Event"));
  var body = esc(st.meta.icon+" "+st.meta.name)+(p.f.place?" · 📍 "+p.f.place:"");
  H.xrem(id+"a", t ? t-3600000 : 0, ti, L("Dalam 1 jam · ","In 1 hour · ")+body, "kumpulan");
  var ev = t ? new Date(t) : null; if(ev){ ev.setDate(ev.getDate()-1); ev.setHours(20, 30, 0, 0); }
  H.xrem(id+"b", ev && ev.getTime() < t-4*3600000 ? ev.getTime() : 0, ti, L("Esok ","Tomorrow ")+fmtDT(t)+" · "+body, "kumpulan"); }
// keep reminders of events I said I am going to (e.g. after a weekly event rolls over)
function remRefresh(){ if(!H || !H.xrem) return; var m = me().pub; store().list.forEach(function(g){ if(g.archived) return; var st = state(g);
  st.posts.forEach(function(p){ if(p.k==="event" && !p.gone && (st.rsvp[p.id]||{})[m]==="y" && !remOn(g, p) && nextWhen(p.f)) setRem(g, p, true); }); }); }
function evList(gs){ var out = []; gs.forEach(function(g){ if(g.archived) return; var st = state(g);
  st.posts.forEach(function(p){ if(p.k!=="event" || p.gone || !p.f.when) return; var t0 = new Date(p.f.when).getTime(); if(isNaN(t0)) return;
    if(p.f.rep){ for(var i = 0; i < 60; i++) out.push({t: t0+i*7*864e5, p: p, g: g, st: st}); } else out.push({t: t0, p: p, g: g, st: st}); }); });
  return out.sort(function(a, b){ return a.t - b.t; }); }
function calSheet(gs, title){ var cur = new Date(); cur.setDate(1); cur.setHours(0, 0, 0, 0); var sel = null, list = evList(gs), m = me().pub;
  var ov = H.showSheet("🗓 "+title, '<div id="gcalB"></div>');
  var key = function(d){ return d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate(); };
  var paint = function(){ var by = {}; list.forEach(function(x){ var k = key(new Date(x.t)); (by[k] = by[k] || []).push(x); });
    var y = cur.getFullYear(), mo = cur.getMonth(), first = (new Date(y, mo, 1).getDay()+6)%7, days = new Date(y, mo+1, 0).getDate(), td = key(new Date());
    var h = '<div class="gcalH"><button class="chip" data-cm="-1">‹</button><b>'+cur.toLocaleDateString(undefined, {month: "long", year: "numeric"})+'</b><button class="chip" data-cm="1">›</button></div><div class="gcalG">'+
      (H.en() ? ["M","T","W","T","F","S","S"] : ["Is","Se","Ra","Kh","Ju","Sa","Ah"]).map(function(d){ return '<i>'+d+'</i>'; }).join("");
    for(var i = 0; i < first; i++) h += '<span></span>';
    for(var d = 1; d <= days; d++){ var k = y+"-"+mo+"-"+d, ev = by[k] || [];
      h += '<button class="gcalD'+(k===td?' td':'')+(sel===k?' on':'')+(ev.length?' has':'')+'" data-cd="'+k+'">'+d+(ev.length?'<em>'+ev.slice(0, 3).map(function(x){ return '<s style="background:'+esc(x.st.meta.color)+'"></s>'; }).join("")+'</em>':'')+'</button>'; }
    h += '</div>';
    var show = sel ? (by[sel]||[]) : list.filter(function(x){ return x.t > Date.now()-3*3600000; }).slice(0, 12);
    h += '<div class="mut small" style="margin:8px 0 4px">'+(sel?L("Acara hari ini","Events on this day"):L("Akan datang","Coming up"))+'</div>';
    h += show.length ? show.map(function(x){ var rs = x.st.rsvp[x.p.id]||{}, c = {y:0,m:0,n:0}; Object.keys(rs).forEach(function(z){ c[rs[z]]++; });
      return '<div class="gpEvRow" style="border-left:4px solid '+esc(x.st.meta.color)+'"><b>'+esc(x.p.f.title||"")+'</b><div class="small">'+fmtDT(x.t)+(x.p.f.place?' · 📍 '+esc(x.p.f.place):'')+'</div>'+
        (gs.length>1?'<div class="mut tiny">'+esc(x.st.meta.icon+" "+x.st.meta.name)+'</div>':'')+
        '<div class="btns">'+[["y","✅"],["m","🤔"],["n","❌"]].map(function(o){ return '<button class="chip'+(rs[m]===o[0]?' on':'')+'" data-cr="'+o[0]+'" data-cg="'+x.g.id+'" data-cp="'+x.p.id+'">'+o[1]+' '+c[o[0]]+'</button>'; }).join("")+
        '<button class="chip'+(remOn(x.g, x.p)?' on':'')+'" data-crm data-cg="'+x.g.id+'" data-cp="'+x.p.id+'">🔔</button></div></div>'; }).join("") : '<div class="mut small">'+L("Tiada acara.","No events.")+'</div>';
    var B = ov.querySelector("#gcalB"); B.innerHTML = h;
    B.querySelectorAll("[data-cm]").forEach(function(b){ b.onclick = function(){ cur.setMonth(cur.getMonth() + +b.getAttribute("data-cm")); sel = null; paint(); }; });
    B.querySelectorAll("[data-cd]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-cd"); sel = sel===k ? null : k; paint(); }; });
    var find = function(b){ var g = grp(b.getAttribute("data-cg")); if(!g) return null; var st = state(g); return {g: g, p: st.byId[b.getAttribute("data-cp")]}; };
    B.querySelectorAll("[data-cr]").forEach(function(b){ b.onclick = function(){ var o = find(b); if(!o || !o.p) return; var v = b.getAttribute("data-cr"); publish(o.g, {t: "rsvp", ref: o.p.id, v: v});
      if(v==="y" && !remOn(o.g, o.p)) setRem(o.g, o.p, true); if(v==="n") setRem(o.g, o.p, false); list = evList(gs); paint(); }; });
    B.querySelectorAll("[data-crm]").forEach(function(b){ b.onclick = function(){ var o = find(b); if(!o || !o.p) return; setRem(o.g, o.p, !remOn(o.g, o.p)); paint(); }; });
  };
  paint(); }
function toCalendar(f){ var d = new Date(f.when); if(isNaN(d)) return; var pad = function(n){ return (n<10?"0":"")+n; };
  var z = function(t){ return t.getUTCFullYear()+pad(t.getUTCMonth()+1)+pad(t.getUTCDate())+"T"+pad(t.getUTCHours())+pad(t.getUTCMinutes())+"00Z"; };
  var e = new Date(d.getTime()+(+f.dur||60)*60000), ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//My Ihsan//Kumpulan//MS","BEGIN:VEVENT","UID:"+Date.now()+"@myihsan","DTSTAMP:"+z(new Date()),"DTSTART:"+z(d),"DTEND:"+z(e),
    "SUMMARY:"+String(f.title||"").replace(/[\r\n,;]/g, " "),"LOCATION:"+String(f.place||"").replace(/[\r\n,;]/g, " ")].concat(f.rep?["RRULE:FREQ=WEEKLY"]:[]).concat(["BEGIN:VALARM","TRIGGER:-PT1H","ACTION:DISPLAY","DESCRIPTION:Reminder","END:VALARM","END:VEVENT","END:VCALENDAR"]).join("\r\n");
  if(H.N.openTextFile) H.N.openTextFile("acara.ics", "text/calendar", ics, false); else { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], {type: "text/calendar"})); a.download = "acara.ics"; a.click(); } }
function postMenu(g, st, p){ var m = me().pub, adm = isAdmin(g, m), mine = p.pub===m;
  var it = [];
  if(adm) it.push(["pin", p.pin?"📌 "+L("Nyahsemat","Unpin"):"📌 "+L("Semat di atas","Pin to top")]);
  if(mine) it.push(["edit", "✏️ "+L("Sunting","Edit")]);
  if((mine && !(st.meta.type==="kids" && roleOf(st, m)==="child" && (p.k==="checkin"||p.k==="help"||p.k==="solat"))) || adm) it.push(["del", "🗑 "+(mine?L("Padam","Delete"):L("Buang hantaran","Remove post"))]);
  it.push(["share", "💬 "+L("Kongsi teks ke WhatsApp","Share text to WhatsApp")], ["card", "🖼 "+L("Kongsi sebagai gambar","Share as a picture")], ["tr", "🌐 "+L("Terjemah BM ↔ EN","Translate BM ↔ EN")]);
  if(!mine) it.push(["report", "🚩 "+L("Lapor kepada pentadbir","Report to admins")], ["block", "🚫 "+L("Sekat ahli ini (di telefon saya)","Block this member (on my phone)")]);
  var ov = H.showSheet(pk(p.k)[1]+" "+esc(p.f.title||L(pk(p.k)[2], pk(p.k)[3])), it.map(function(x){ return '<button class="btn alt full g3d" data-pm="'+x[0]+'" style="margin-bottom:6px">'+x[1]+'</button>'; }).join(""));
  ov.querySelectorAll("[data-pm]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-pm"); H.closeOverlay();
    if(a==="pin") publish(g, {t: "pin", ref: p.id, on: !p.pin});
    else if(a==="del") publish(g, {t: "del", ref: p.id});
    else if(a==="edit") compose(g, p.k, p);
    else if(a==="share"){ var t = pk(p.k)[1]+" "+(p.f.title||"")+"\n"+(p.f.text||"")+(p.f.when?"\n📅 "+fmtDT(p.f.when):"")+(p.f.place?"\n📍 "+p.f.place:"")+"\n— "+(st.meta.name||""); if(H.N.shareTo) H.N.shareTo("com.whatsapp", t); else if(H.N.shareText) H.N.shareText(t); }
    else if(a==="card") shareCard(g, st, p);
    else if(a==="tr") translate(p);
    else if(a==="report") prompt2(L("Sebab laporan","Reason for the report"), function(v){ if(!v) return; [g.owner].concat(st.admins).filter(function(x, i, arr){ return x && arr.indexOf(x)===i; }).forEach(function(to){ publish(g, {t: "report", to: to, c: sealTo(to, {ref: p.id, why: v})}); }); H.toast(L("Laporan dihantar kepada pentadbir","Report sent to the admins")); });
    else if(a==="block"){ var bl = blocked(); bl[p.pub] = 1; H.save("ihsan_gblock", bl); H.toast(L("Disekat di telefon ini","Blocked on this phone")); }
    draw(); }; });
}
function groupMenu(g){ var st = state(g), adm = isAdmin(g, me().pub), kid = st.meta.type==="kids" && myRole(st)==="child";
  var it = kid ? [] : [["inv","➕ "+L("Jemput ahli","Invite members")],["tree","🌳 "+L("Jemput dari salasilah keluarga","Invite from the family tree")]]; it = it.concat([["mem","👥 "+L("Ahli","Members")+" ("+Object.keys(st.members).length+")"],["mute", g.mute?"🔔 "+L("Hidupkan makluman","Unmute"):"🔕 "+L("Senyapkan","Mute")]]);
  if(adm) it.push(["set","⚙️ "+L("Tetapan kumpulan","Group settings")]);
  if(st.meta.rules) it.push(["rules","📜 "+L("Peraturan","Rules")]);
  it.push(["arch", g.archived?"📂 "+L("Keluarkan dari arkib","Unarchive"):"🗄 "+L("Arkibkan","Archive")],["leave","🚪 "+L("Keluar kumpulan","Leave group")]);
  var ov = H.showSheet(esc(st.meta.icon+" "+st.meta.name), it.map(function(x){ return '<button class="btn alt full g3d" data-gm="'+x[0]+'" style="margin-bottom:6px">'+x[1]+'</button>'; }).join(""));
  ov.querySelectorAll("[data-gm]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-gm"); H.closeOverlay();
    if(a==="inv"){ if(st.meta.type==="kids") inviteRole(g); else if(st.meta.type==="couple") inviteSheet(g, {single: true, days: 0, rl: "partner"}); else inviteSheet(g); } else if(a==="tree") treeInvite(g); else if(a==="mem") membersSheet(g); else if(a==="set") settingsSheet(g);
    else if(a==="rules") H.showSheet("📜", '<div class="small">'+esc(st.meta.rules).replace(/\n/g, "<br>")+'</div>');
    else if(a==="mute"){ g.mute = !g.mute; putGrp(g); draw(); }
    else if(a==="arch"){ g.archived = !g.archived; putGrp(g); UI.g = null; draw(); }
    else if(a==="leave"){ var o2 = H.showSheet("🚪", '<div class="small">'+L("Keluar daripada kumpulan ini? Hantaran akan dibuang dari telefon anda.","Leave this group? Its posts will be removed from your phone.")+'</div><button class="btn full g3d" id="gLvOk" style="margin-top:8px">'+L("Keluar","Leave")+'</button>'); o2.querySelector("#gLvOk").onclick = function(){ H.closeOverlay(); leave(g); UI.g = null; draw(); }; }
  }; });
}
function membersSheet(g){ var st = state(g), m = me().pub, adm = isAdmin(g, m);
  var row = function(pub, x, pend){ var isA = pub===g.owner || st.admins.indexOf(pub)>=0, isP = (st.meta.posters||[]).indexOf(pub)>=0;
    return '<div class="gpMem"><span><b>'+esc(x.n)+'</b>'+(pub===m?' ('+L("anda","you")+')':'')+(st.meta.roles[pub]?' · '+esc(st.meta.roles[pub]):'')+'<br><small class="mut">'+(roleOf(st, pub)?esc(roleName(roleOf(st, pub)))+(roleOf(st, pub)==="child"?' · '+esc(ageOf(st, pub)==="u7"?L("bawah 7","under 7"):ageOf(st, pub)):'')+' · ':'')+(isA?L("Pentadbir","Admin"):isP?L("Penulis","Poster"):L("Ahli","Member"))+'</small></span>'+
      (adm && pend?'<button class="chip" data-gap="'+pub+'">✅ '+L("Lulus","Approve")+'</button><button class="chip" data-grm="'+pub+'">✕</button>':'')+
      (adm && !pend && pub!==m && pub!==g.owner?'<button class="chip" data-grole="'+pub+'">⋯</button>':'')+'</div>'; };
  var h = (Object.keys(st.pendingJ).length?'<div class="mut small">⏳ '+L("Menunggu kelulusan","Waiting for approval")+'</div>'+Object.keys(st.pendingJ).map(function(p){ return row(p, st.pendingJ[p], true); }).join(""):'')+
    Object.keys(st.members).sort(function(a, b){ return st.members[a].n.localeCompare(st.members[b].n); }).map(function(p){ return row(p, st.members[p], false); }).join("")+'<div class="mut tiny">'+Object.keys(st.members).length+' '+L("ahli","members")+'</div>';
  var ov = H.showSheet("👥 "+L("Ahli","Members"), h);
  ov.querySelectorAll("[data-gap]").forEach(function(b){ b.onclick = function(){ publish(g, {t: "approve", who: b.getAttribute("data-gap")}); H.closeOverlay(); membersSheet(g); }; });
  ov.querySelectorAll("[data-grm]").forEach(function(b){ b.onclick = function(){ removeMember(g, b.getAttribute("data-grm")); H.closeOverlay(); membersSheet(g); }; });
  ov.querySelectorAll("[data-grole]").forEach(function(b){ b.onclick = function(){ var pub = b.getAttribute("data-grole"), isA = st.admins.indexOf(pub)>=0, isP = (st.meta.posters||[]).indexOf(pub)>=0;
    var o2 = H.showSheet(esc(nameOf(st, pub)), [["adm", isA?L("Buang pentadbir","Remove admin"):L("Jadikan pentadbir","Make admin")],["post", isP?L("Buang penulis","Remove poster"):L("Jadikan penulis","Make poster")],["label",L("Label peranan (cth. Bendahari)","Role label (e.g. Treasurer)")]].concat(st.meta.type==="kids"?[["asp",L("Jadikan ibu bapa","Make a parent")],["asc",L("Jadikan anak","Make a child")],["age",L("Tukar umur (bawah 7 / 7–12 / 13+)","Change age (under 7 / 7–12 / 13+)")]]:[]).concat([["rm","🚫 "+L("Keluarkan daripada kumpulan","Remove from group")]]).map(function(x){ return '<button class="btn alt full g3d" data-gr="'+x[0]+'" style="margin-bottom:6px">'+x[1]+'</button>'; }).join(""));
    o2.querySelectorAll("[data-gr]").forEach(function(c){ c.onclick = function(){ var a = c.getAttribute("data-gr"), mt = JSON.parse(JSON.stringify(st.meta)); H.closeOverlay();
      if(a==="adm"){ mt.admins = isA ? st.admins.filter(function(x){ return x!==pub; }) : st.admins.concat([pub]); publish(g, {t: "meta", m: {admins: mt.admins}}); }
      else if(a==="post"){ mt.posters = isP ? (mt.posters||[]).filter(function(x){ return x!==pub; }) : (mt.posters||[]).concat([pub]); publish(g, {t: "meta", m: {posters: mt.posters}}); }
      else if(a==="label") prompt2(L("Label peranan","Role label"), function(v){ var r = JSON.parse(JSON.stringify(st.meta.roles||{})); if(v) r[pub] = v.slice(0, 30); else delete r[pub]; publish(g, {t: "meta", m: {roles: r}}); draw(); }, st.meta.roles[pub]||"");
      else if(a==="rm") removeMember(g, pub);
      else if(a==="asp" || a==="asc"){ var mr = JSON.parse(JSON.stringify(st.meta.mrole||{})); mr[pub] = a==="asp" ? "parent" : "child"; publish(g, {t: "meta", m: {mrole: mr}}); }
      else if(a==="age"){ var ag = JSON.parse(JSON.stringify(st.meta.age||{})), cy = ["u7","7-12","13+"]; ag[pub] = cy[(cy.indexOf(ageOf(st, pub))+1)%3]; publish(g, {t: "meta", m: {age: ag}}); H.toast(L("Umur: ","Age: ")+ag[pub]); }
      draw(); }; }); }; });
}
function settingsSheet(g){ var st = state(g), mt = st.meta;
  var h = '<input id="gsN" class="rin" maxlength="50" value="'+esc(mt.name)+'"><input id="gsI" class="rin" maxlength="4" value="'+esc(mt.icon)+'" placeholder="Emoji">'+
    '<textarea id="gsD" class="rin" rows="2" maxlength="140" placeholder="'+L("Penerangan","Description")+'">'+esc(mt.desc||"")+'</textarea>'+
    '<textarea id="gsR" class="rin" rows="3" maxlength="800" placeholder="'+L("Peraturan kumpulan","Group rules")+'">'+esc(mt.rules||"")+'</textarea>'+
    '<div class="gpCol">'+COLORS.map(function(c){ return '<button class="gpSw'+(mt.color===c?' on':'')+'" data-gc="'+c+'" style="background:'+c+'"></button>'; }).join("")+'</div>'+
    '<label class="small mut">'+L("Jenis kumpulan","Group type")+'</label><select id="gsT" class="rin">'+GTYPES.map(function(t){ return '<option value="'+t[0]+'"'+(mt.type===t[0]?' selected':'')+'>'+t[1]+' '+esc(L(t[2], t[3]))+'</option>'; }).join("")+'</select>'+
    '<details><summary class="small">🧩 '+L("Ciri dalam \"Hantaran baharu\"","Features in \"New post\"")+'</summary><div class="gtFeat">'+PKINDS.filter(function(k){ return k[0]!=="pnote"; }).map(function(k){ var on = (mt.feat && mt.feat.length ? mt.feat : gtype(mt.type)[4]).indexOf(k[0])>=0; return '<label class="obChk"><input type="checkbox" data-gfeat="'+k[0]+'"'+(on?' checked':'')+'> '+k[1]+' '+esc(L(k[2], k[3]))+'</label>'; }).join("")+'</div></details>'+
    '<label class="obChk"><input type="checkbox" id="gsAn"'+(mt.ann?' checked':'')+'> 📢 '+L("Mod pengumuman sahaja: hanya pentadbir menulis, ahli membaca dan memberi reaksi (tiada balasan)","Announcement-only: only admins post, members read and react (no replies)")+'</label>'+
    '<label class="obChk"><input type="checkbox" id="gsA"'+(mt.adminsOnly?' checked':'')+'> '+L("Hanya pentadbir dan penulis boleh menghantar","Only admins and posters can post")+'</label>'+
    '<label class="obChk"><input type="checkbox" id="gsC"'+(mt.comments?' checked':'')+'> '+L("Benarkan balasan ringkas","Allow short replies")+'</label>'+
    '<label class="obChk"><input type="checkbox" id="gsP"'+(mt.approval?' checked':'')+'> '+L("Ahli baharu perlu kelulusan","New members need approval")+'</label>'+
    '<div class="mut small">'+L("Pelayan geganti (satu setiap baris)","Relay servers (one per line)")+'</div><textarea id="gsRl" class="rin" rows="3">'+esc((g.relays||RELAYS).join("\n"))+'</textarea>'+
    '<button class="btn gold full g3d" id="gsOk">'+L("Simpan","Save")+'</button>';
  var ov = H.showSheet("⚙️ "+L("Tetapan kumpulan","Group settings"), h), col = mt.color;
  ov.querySelectorAll("[data-gc]").forEach(function(b){ b.onclick = function(){ col = b.getAttribute("data-gc"); ov.querySelectorAll("[data-gc]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  ov.querySelector("#gsOk").onclick = function(){ var rl = ov.querySelector("#gsRl").value.split(/\s+/).filter(function(u){ return /^wss:\/\/[^\s]+$/.test(u); }).slice(0, 5);
    publish(g, {t: "meta", m: {name: ov.querySelector("#gsN").value.trim()||mt.name, icon: ov.querySelector("#gsT").value!==mt.type && ov.querySelector("#gsI").value.trim()===mt.icon ? gtype(ov.querySelector("#gsT").value)[1] : ov.querySelector("#gsI").value.trim()||mt.icon, desc: ov.querySelector("#gsD").value.trim(), rules: ov.querySelector("#gsR").value.trim(), color: col,
      type: ov.querySelector("#gsT").value, feat: ov.querySelector("#gsT").value!==mt.type ? [] : [].map.call(ov.querySelectorAll("[data-gfeat]:checked"), function(x){ return x.getAttribute("data-gfeat"); }),
      ann: ov.querySelector("#gsAn").checked, adminsOnly: ov.querySelector("#gsA").checked || ov.querySelector("#gsAn").checked, comments: ov.querySelector("#gsC").checked, approval: ov.querySelector("#gsP").checked}});
    if(rl.length){ g.relays = rl; } g.name = ov.querySelector("#gsN").value.trim()||mt.name; putGrp(g); startSync(); H.closeOverlay(); draw(); };
}

// ---------------- composer ----------------
// 0.5.62: the "New post" sheet shows the type's preset tiles (or the group's chosen features); "⋯ More" opens the rest for admins.
// A child in a Parents & kids group sees six big tiles to tell their parents something.
function composeKind(g, all){ var st = state(g), m = me().pub, adm = isAdmin(g, m), kid = st.meta.type==="kids" && myRole(st)==="child", ag = ageOf(st, m);
  var grid = kid ? (ag==="u7" ? ["jobs","help","album"] : ["checkin","solat","quran","jobs","help","album"].concat(ag==="13+" ? ["doa"] : [])) : (st.meta.feat && st.meta.feat.length ? st.meta.feat : gtype(st.meta.type)[4]);
  var rest = kid ? [] : PKINDS.map(function(k){ return k[0]; }).filter(function(k){ return grid.indexOf(k)<0 && k!=="pnote" && (st.meta.type==="kids" || ["chore","reward","solat"].indexOf(k)<0); });
  var tile = function(k, cls){ if(k==="jobs") return '<button class="gpKind def" data-gk="jobs"><span>✅</span>'+L("Kerja siap","Job done")+'</button>'; var x = pk(k); return '<button class="gpKind'+(cls||"")+'" data-gk="'+k+'"><span>'+x[1]+'</span>'+esc(L(x[2], x[3]))+'</button>'; };
  var h = '<div class="gpKinds'+(kid?' gtKidK':'')+'">'+grid.map(function(k){ return tile(k, " def"); }).join("")+(adm && rest.length && !all?'<button class="gpKind" id="gkMore"><span>⋯</span>'+L("Lagi","More")+'</button>':'')+(all?rest.map(function(k){ return tile(k); }).join(""):'')+'</div>'+
    (kid?'<div class="mut tiny" style="margin-top:6px">'+L("Ibu dan ayah akan nampak apa yang anda hantar.","Mum and Dad will see what you send.")+'</div>':'');
  var ov = H.showSheet(kid ? "✏️ "+L("Beritahu ibu bapa","Tell Mum & Dad") : "✏️ "+L("Hantaran baharu","New post"), h);
  var mo = ov.querySelector("#gkMore"); if(mo) mo.onclick = function(){ H.closeOverlay(); composeKind(g, true); };
  ov.querySelectorAll("[data-gk]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-gk"); H.closeOverlay(); if(k==="jobs"){ UI.tab = "home"; draw(); H.toast(L("Tandakan kerja dalam senarai \"Kerja saya\"","Tick the job in \"My jobs\"")); } else compose(g, k); }; });
}
// field: [key, type, ms, en]
var FIELDS = {
  ann: [["title","t","Tajuk","Title"],["text","a","Teks","Text"],["img","img","Gambar","Photo"],["pin","pin","Semat di atas","Pin to top"],["imp","b","Penting (makluman walaupun disenyapkan)","Important (notifies even when muted)"],["exp","d","Tamat paparan (pilihan)","Hide after (optional)"]],
  event: [["title","t","Tajuk acara","Event title"],["when","dt","Tarikh & masa","Date & time"],["after","t","Atau ikut waktu solat, cth. selepas Maghrib","Or after a prayer, e.g. after Maghrib"],["place","t","Tempat","Place"],["text","a","Keterangan","Description"],["rep","b","Berulang setiap minggu","Repeats weekly"]],
  doa: [["text","a","Mohon doa untuk…","Please make doa for…"]],
  death: [["name","t","Nama arwah","Name of the deceased"],["solat","t","Masa & tempat solat jenazah","Funeral prayer time & place"],["burial","t","Pengebumian","Burial"],["contact","t","Hubungi keluarga","Family contact"],["text","a","Maklumat lain (pilihan)","Other details (optional)"]],
  good: [["title","t","Tajuk, cth. Kelahiran cucu","Title, e.g. A grandchild is born"],["text","a","Teks","Text"],["img","img","Gambar","Photo"]],
  bday: [["title","t","Siapa & apa, cth. Hari jadi Mak Long","Who & what, e.g. Mak Long's birthday"],["when","d","Tarikh","Date"],["text","a","Ucapan","Message"]],
  poll: [["title","t","Soalan","Question"],["opts","list","Pilihan (satu setiap baris)","Options (one per line)"],["multi","b","Boleh pilih beberapa","Allow several choices"],["named","b","Tunjuk nama pengundi","Show voters' names"],["after","b","Tunjuk keputusan selepas tutup","Show results after closing"],["close","dt","Tutup undian (pilihan)","Closes (optional)"]],
  signup: [["title","t","Tajuk, cth. Bawa lauk","Title, e.g. Potluck"],["slots","slots","Slot: satu setiap baris, cth. Nasi x2","Slots: one per line, e.g. Rice x2"],["text","a","Nota","Notes"]],
  collect: [["title","t","Tujuan kutipan","Purpose"],["target","n","Sasaran (RM)","Target (RM)"],["acct","a","Akaun bank / DuitNow (teks)","Bank account / DuitNow (text)"],["img","img","Gambar kod QR DuitNow (pilihan)","DuitNow QR picture (optional)"],["text","a","Nota","Notes"]],
  task: [["title","t","Tugasan","Task"],["due","dt","Tarikh akhir","Due"],["who","t","Untuk siapa, cth. Kelas 3A","For whom, e.g. Class 3A"],["text","a","Butiran","Details"]],
  permit: [["title","t","Soalan, cth. Benarkan anak ikut lawatan?","Question, e.g. May your child join the trip?"],["text","a","Butiran","Details"]],
  loc: [["title","t","Tajuk, cth. Tempat berkumpul","Title, e.g. Meeting point"],["place","t","Tempat atau koordinat","Place or coordinates"],["text","a","Nota, cth. Tunggu di pintu King Fahd","Note, e.g. Wait at the King Fahd gate"]],
  album: [["title","t","Tajuk album","Album title"],["img","img4","Gambar (hingga 4)","Photos (up to 4)"],["text","a","Nota","Notes"]],
  doc: [["title","t","Tajuk","Title"],["file","pdf","Fail PDF (hingga 90 KB)","PDF file (up to 90 KB)"],["text","a","Nota","Notes"]],
  alert: [["title","t","Amaran","Alert"],["text","a","Butiran","Details"]],
  roster: [["title","t","Tajuk, cth. Giliran imam","Title, e.g. Imam roster"],["rows","rows","Baris: Bila | Siapa (satu setiap baris)","Rows: When | Who (one per line)"],["text","a","Nota","Notes"]],
  todo: [["items","list","Tugasan (satu setiap baris)","To-dos (one per line)"],["due","dt","Bila (pilihan)","When (optional)"]],
  todo1: [["title","t","Tugasan","To-do"],["due","dt","Bila (pilihan)","When (optional)"]],
  grocery: [["title","t","Tajuk, cth. Barang dapur","Title, e.g. Groceries"],["items","list","Barang (satu setiap baris)","Items (one per line)"]],
  rem: [["title","t","Apa, cth. Ambil Aisyah dari tadika","What, e.g. Pick Aisyah up from tadika"],["who","who","Untuk","For"],["pr","pr","Selepas waktu solat","After a prayer time"],["off","n","Minit selepas waktu solat (cth. 15)","Minutes after the prayer time (e.g. 15)"],["at","dt","Atau masa tepat","Or an exact time"],["rep","sel:rep","Ulang","Repeat"],["nudge","b","Ingatkan semula 20 minit kemudian jika belum ditanda","Nudge again in 20 min if not ticked"]],
  bill: [["title","t","Bil, cth. TNB, Unifi, sewa","Bill, e.g. TNB, Unifi, rent"],["amt","n","Jumlah (RM)","Amount (RM)"],["due","d","Tarikh akhir","Due date"],["who","who","Siapa bayar","Who pays"]],
  checkin: [["label","sel:stat","Status","Status"],["text","t","Nota (pilihan), cth. ETA 18 minit","Note (optional), e.g. ETA 18 min"],["place","t","Tempat (pilihan)","Place (optional)"]],
  solat: [["pr","pr","Waktu solat","Prayer"],["on","b","Tepat pada waktunya","On time"]],
  quran: [["surah","t","Surah / Iqra', cth. Al-Mulk 1–10","Surah / Iqra', e.g. Al-Mulk 1–10"],["pages","n","Bilangan muka surat","Number of pages"]],
  chore: [["title","t","Kerja, cth. Kemas bilik","Job, e.g. Tidy your room"],["who","kid","Untuk","For"],["pts","n","Mata (cth. 10)","Points (e.g. 10)"],["proof","b","Perlu gambar sebagai bukti","Needs a photo as proof"],["due","dt","Tarikh akhir (pilihan)","Due (optional)"]],
  reward: [["title","t","Ganjaran, cth. 30 minit main game","Reward, e.g. 30 min extra game time"],["cost","n","Mata diperlukan","Points needed"]],
  help: [["text","a","Apa yang perlu dibantu? (pilihan)","What do you need? (optional)"]],
  pnote: [["text","a","Nota untuk ibu bapa sahaja","Note for parents only"]]
};
var SELS = {rep: [["once","Sekali","Once"],["wd","Hari bekerja","Weekdays"],["daily","Setiap hari","Daily"]], stat: STATUS.map(function(x){ return [x[0], x[1]+" "+x[2], x[1]+" "+x[3]]; })};
// 0.5.70 (owner): a new post is named after its type and today's date unless you type a name
function defTitle(kind){ var x = pk(kind); return L(x[2], x[3])+" · "+new Date().toLocaleDateString(ibLoc(H.en && H.en()), {day:"numeric", month:"short", year:"numeric"}); }
function compose(g, kind, editP){
  var F = (editP && kind==="todo" ? FIELDS.todo1 : FIELDS[kind]) || FIELDS.ann, f0 = editP ? editP.f : (F.some(function(x){ return x[0]==="title" && x[1]==="t"; }) && kind!=="todo" ? {title: defTitle(kind)} : {}), imgs = (f0.img||[]).slice(), file = f0.file || null, fname = f0.fname || "";
  var h = F.map(function(x){ var k = x[0], t = x[1], lb = esc(L(x[2], x[3])), v = f0[k];
    if(t==="t") return '<input class="rin" data-fk="'+k+'" maxlength="120" placeholder="'+lb+'" value="'+esc(v||"")+'">';
    if(t==="a") return '<textarea class="rin" data-fk="'+k+'" rows="3" maxlength="2000" placeholder="'+lb+'">'+esc(v||"")+'</textarea>';
    if(t==="n") return '<input class="rin" type="number" inputmode="decimal" data-fk="'+k+'" placeholder="'+lb+'" value="'+esc(v||"")+'">';
    if(t==="dt") return '<label class="small mut">'+lb+'</label><input class="rin" type="datetime-local" data-fk="'+k+'" value="'+esc(v ? String(typeof v==="number" ? new Date(v - new Date().getTimezoneOffset()*60000).toISOString().slice(0,16) : v) : "")+'">';
    if(t==="d") return '<label class="small mut">'+lb+'</label><input class="rin" type="date" data-fk="'+k+'" value="'+esc(v||"")+'">';
    if(t==="b" || t==="pin") return '<label class="obChk"><input type="checkbox" data-fk="'+k+'"'+(v?' checked':'')+'> '+lb+'</label>';
    if(t==="list") return '<textarea class="rin" data-fk="'+k+'" rows="4" placeholder="'+lb+'">'+esc((v||[]).join("\n"))+'</textarea>';
    if(t==="slots") return '<textarea class="rin" data-fk="'+k+'" rows="4" placeholder="'+lb+'">'+esc((v||[]).map(function(s){ return s.l+(s.n>1?" x"+s.n:""); }).join("\n"))+'</textarea>';
    if(t==="rows") return '<textarea class="rin" data-fk="'+k+'" rows="5" placeholder="'+lb+'">'+esc((v||[]).map(function(r){ return r[0]+" | "+r[1]; }).join("\n"))+'</textarea>';
    if(t==="img" || t==="img4") return '<div class="gpImgPick" data-max="'+(t==="img4"?4:1)+'"><button class="chip" data-pimg>📷 '+lb+'</button><span id="gpImgs"></span></div>';
    if(t==="pdf") return '<button class="chip" data-ppdf>📄 '+lb+'</button> <span class="small" id="gpPdf">'+esc(fname)+'</span>';
    if(t==="who" || t==="kid"){ var stw = state(g), ms = Object.keys(stw.members).filter(function(x){ return t!=="kid" || roleOf(stw, x)==="child"; });
      return '<label class="small mut">'+lb+'</label><select class="rin" data-fk="'+k+'"><option value="all">'+(stw.meta.type==="couple"?L("Sesiapa / berdua","Either / both"):t==="kid"?L("Semua anak","All children"):L("Semua","Everyone"))+'</option>'+ms.map(function(x){ return '<option value="'+x+'"'+(v===x?' selected':'')+'>'+esc(nameOf(stw, x))+(x===me().pub?' ('+L("saya","me")+')':'')+'</option>'; }).join("")+'</select>'; }
    if(t==="pr") return '<label class="small mut">'+lb+'</label><select class="rin" data-fk="'+k+'"><option value="">—</option>'+PRAY.map(function(x){ return '<option value="'+x[0]+'"'+(v===x[0]?' selected':'')+'>'+x[1]+' '+L(x[2], x[3])+'</option>'; }).join("")+'</select>';
    if(t.indexOf("sel:")===0) return '<label class="small mut">'+lb+'</label><select class="rin" data-fk="'+k+'">'+SELS[t.slice(4)].map(function(x){ return '<option value="'+x[0]+'"'+(v===x[0]?' selected':'')+'>'+esc(L(x[1], x[2]))+'</option>'; }).join("")+'</select>';
    return ''; }).join("")+
    '<div class="mut tiny" style="margin:6px 0">⚠️ '+L("Jangan hantar dokumen peribadi atau nombor IC.","Don't post private documents or IC numbers.")+'</div><button class="btn gold full g3d" id="gpSend">'+(editP?L("Simpan","Save"):L("Hantar","Post"))+'</button>';
  var ov = H.showSheet(pk(kind)[1]+" "+esc(L(pk(kind)[2], pk(kind)[3])), h);
  var drawImgs = function(){ var s = ov.querySelector("#gpImgs"); if(s) s.innerHTML = imgs.map(function(src, i){ return '<img src="'+src+'" data-rmi="'+i+'" class="gpThumb">'; }).join("");
    ov.querySelectorAll("[data-rmi]").forEach(function(im){ im.onclick = function(){ imgs.splice(+im.getAttribute("data-rmi"), 1); drawImgs(); }; }); };
  drawImgs();
  var pi = ov.querySelector("[data-pimg]"); if(pi) pi.onclick = function(){ var max = +ov.querySelector(".gpImgPick").getAttribute("data-max"); if(imgs.length >= max){ H.toast(L("Maksimum ","At most ")+max); return; }
    var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = function(){ var fl = inp.files[0]; if(!fl) return; shrink(fl, function(d){ if(d){ imgs.push(d); drawImgs(); } }); }; inp.click(); };
  var pd = ov.querySelector("[data-ppdf]"); if(pd) pd.onclick = function(){ var inp = document.createElement("input"); inp.type = "file"; inp.accept = "application/pdf"; inp.onchange = function(){ var fl = inp.files[0]; if(!fl) return;
    if(fl.size > 90*1024){ H.toast(L("Fail terlalu besar (maksimum 90 KB). Kongsi fail besar melalui WhatsApp.","File too big (90 KB max). Share big files through WhatsApp.")); return; }
    var r = new FileReader(); r.onload = function(){ file = r.result; fname = fl.name; ov.querySelector("#gpPdf").textContent = fname; }; r.readAsDataURL(fl); }; inp.click(); };
  ov.querySelector("#gpSend").onclick = function(){ var f = {};
    F.forEach(function(x){ var k = x[0], t = x[1], e = ov.querySelector('[data-fk="'+k+'"]');
      if(t==="b" || t==="pin"){ if(e && e.checked) f[k] = true; }
      else if(t==="list"){ f[k] = e.value.split("\n").map(function(s){ return s.trim(); }).filter(Boolean).slice(0, 12); }
      else if(t==="slots"){ f[k] = e.value.split("\n").map(function(s){ s = s.trim(); var mm = s.match(/^(.*?)\s*[x×]\s*(\d+)$/i); return s ? {l: (mm?mm[1]:s).slice(0, 60), n: mm ? Math.min(100, +mm[2]) : 1} : null; }).filter(Boolean).slice(0, 40); }
      else if(t==="rows"){ f[k] = e.value.split("\n").map(function(s){ var a = s.split("|"); return s.trim() ? [String(a[0]||"").trim().slice(0, 40), String(a.slice(1).join("|")||"").trim().slice(0, 80)] : null; }).filter(Boolean).slice(0, 40); }
      else if(t==="img" || t==="img4"){ if(imgs.length) f.img = imgs.slice(); }
      else if(t==="pdf"){ if(file){ f.file = file; f.fname = fname; } }
      else if(t==="dt" && kind==="poll" && k==="close"){ if(e.value) f[k] = new Date(e.value).getTime(); }
      else if(t==="who" || t==="kid" || t==="pr" || t.indexOf("sel:")===0){ if(e && e.value) f[k] = e.value; }
      else if(e && e.value.trim()) f[k] = e.value.trim(); });
    if(kind==="pnote" && f.text){ var stp = state(g), to = {}; parentsOf(stp).concat([me().pub]).forEach(function(pub){ to[pub] = sealTo(pub, {text: f.text}); }); f = {to: to}; }
    if(kind==="todo" && !editP){ if(!(f.items && f.items.length)){ H.toast(L("Tulis sekurang-kurangnya satu tugasan","Write at least one to-do")); return; }   // 0.5.63: one to-do per row, each ticked on its own
      f.items.forEach(function(it){ publish(g, {t: "post", k: "todo", f: f.due ? {title: it, due: f.due} : {title: it}}); }); H.closeOverlay(); draw(); return; }
    var need = kind==="pnote" ? f.to : kind==="help" || kind==="checkin" ? true : kind==="solat" ? f.pr : kind==="quran" ? (f.surah || f.pages) : kind==="grocery" ? (f.items && f.items.length) : kind==="rem" ? (f.title && (f.pr || f.at)) : kind==="bill" ? (f.title && f.amt) : kind==="reward" ? (f.title && f.cost) :
      kind==="death" ? f.name : kind==="poll" ? (f.title && f.opts && f.opts.length>=2) : kind==="signup" ? (f.title && f.slots && f.slots.length) : kind==="roster" ? (f.title && f.rows && f.rows.length) : (f.title || f.text || f.img);
    if(!need){ H.toast(L("Lengkapkan butiran dahulu","Fill in the details first")); return; }
    if(!editP && !f.title && kind!=="todo" && kind!=="pnote") f.title = defTitle(kind);
    if(JSON.stringify(f).length > 120000){ H.toast(L("Hantaran terlalu besar. Kurangkan gambar.","The post is too big. Use fewer photos.")); return; }
    if(editP) publish(g, {t: "edit", ref: editP.id, f: f}); else publish(g, {t: "post", k: kind, f: f});
    H.closeOverlay(); draw(); };
}
function shrink(file, cb){ var r = new FileReader(); r.onload = function(){ var im = new Image(); im.onload = function(){ var max = 900, w = im.width, h = im.height, s = Math.min(1, max/Math.max(w, h));
  var cv = document.createElement("canvas"); cv.width = Math.round(w*s); cv.height = Math.round(h*s); cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
  var q = 0.7, d = cv.toDataURL("image/jpeg", q); while(d.length > 60000 && q > 0.3){ q -= 0.1; d = cv.toDataURL("image/jpeg", q); }
  if(d.length > 80000){ cv.width = Math.round(cv.width*0.6); cv.height = Math.round(cv.height*0.6); cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height); d = cv.toDataURL("image/jpeg", 0.5); }
  cb(d); }; im.onerror = function(){ cb(null); }; im.src = r.result; }; r.readAsDataURL(file); }

function allEvents(){ var out = []; store().list.forEach(function(g){ if(g.archived) return; var st = state(g); st.posts.forEach(function(p){ if(p.k==="event" && !p.gone && p.f.when){ var t = new Date(p.f.when).getTime(); if(t > Date.now()-86400000) out.push({t: t, p: p, g: g, st: st}); } }); });
  out.sort(function(a, b){ return a.t - b.t; });
  H.showSheet("📅 "+L("Acara semua kumpulan","Events from all groups"), out.length ? out.map(function(x){ return '<div class="gpEvRow" style="border-left:4px solid '+esc(x.st.meta.color)+'"><b>'+esc(x.p.f.title||"")+'</b><div class="small">'+fmtDT(x.p.f.when)+(x.p.f.place?' · 📍 '+esc(x.p.f.place):'')+'</div><div class="mut tiny">'+esc(x.st.meta.icon+" "+x.st.meta.name)+'</div></div>'; }).join("") : '<div class="mut small">'+L("Tiada acara akan datang.","No upcoming events.")+'</div>'); }

// home widget: latest pinned post or next event across groups
function widget(helpers){ H = helpers; var best = null, next = null;
  store().list.forEach(function(g){ if(g.archived) return; var st = state(g); st.posts.forEach(function(p){ if(p.gone) return;
    if(p.k==="event" && p.f.when){ var t = new Date(p.f.when).getTime(); if(t > Date.now() && (!next || t < next.t)) next = {t: t, p: p, st: st}; }
    if(!best || (p.pin && !best.p.pin) || (p.pin===best.p.pin && p.at > best.p.at)) best = {p: p, st: st}; }); });
  if(!best && !next) return '<div class="mut small">'+L("Tiada kumpulan lagi. Buka Alat › Kumpulan.","No groups yet. Open Tools › Groups.")+'</div>';
  var h = ''; if(best) h += '<div class="small"><b>'+pk(best.p.k)[1]+' '+esc(best.p.f.title||best.p.f.name||String(best.p.f.text||"").slice(0, 60))+'</b><div class="mut tiny">'+esc(best.st.meta.icon+" "+best.st.meta.name)+'</div></div>';
  if(next) h += '<div class="small" style="margin-top:4px">📅 '+esc(next.p.f.title||"")+' · '+fmtDT(next.p.f.when)+'</div>'; return h; }
function sync(helpers){ H = helpers; if(store().list.length){ startSync(); try{ remRefresh(); store().list.forEach(function(g){ if(!g.archived) remsSchedule(g, state(g)); }); }catch(e){} } }
function link(helpers, url){ H = helpers; if(parseInvite(url)) joinSheet(url); }

// ---------------- 0.5.18: invite from the family tree ----------------
// Pick people (one by one, everyone, or everyone under a person). Each gets their own link with their name filled in,
// sent to their WhatsApp number when the tree has one. Joined people are ticked (matched by name).
function treeInvite(g){
  var F = H.load("ihsan_family", null) || {}, P = (F.p||[]).filter(function(p){ return p && p.n && !p.dd; }), sel = {}, q = "", spouses = true;
  if(!P.length){ H.toast(L("Salasilah keluarga masih kosong. Tambah ahli dalam Alat › Keluarga.","The family tree is empty. Add people in Tools › Family.")); return; }
  var byId = {}; P.forEach(function(p){ byId[p.id] = p; });
  var kids = function(id){ return P.filter(function(p){ return p.f===id || p.m===id; }); };
  var under = function(id){ var out = {}, stack = [id]; while(stack.length){ var x = stack.pop(); kids(x).forEach(function(c){ if(!out[c.id]){ out[c.id] = 1; stack.push(c.id); } }); }
    if(spouses) Object.keys(out).forEach(function(k){ (byId[k] && byId[k].sp || []).forEach(function(sid){ if(byId[sid]) out[sid] = 1; }); }); return out; };
  var st = state(g), joined = {}; Object.keys(st.members).forEach(function(pub){ joined[String(st.members[pub].n).trim().toLowerCase()] = 1; });
  var me0 = F.me;
  var draw = function(){ var list = P.filter(function(p){ return !q || p.n.toLowerCase().indexOf(q)>=0; }).sort(function(a, b){ return a.n.localeCompare(b.n); });
    var n = Object.keys(sel).length;
    var h = '<input id="gtQ" class="rin" placeholder="🔎 '+L("Cari nama","Search names")+'" value="'+esc(q)+'">'+
      '<div class="btns"><button class="chip" id="gtAll">'+L("Pilih semua","Select all")+' ('+P.length+')</button><button class="chip" id="gtNone">'+L("Kosongkan","Clear")+'</button></div>'+
      '<div class="gpUnder"><span class="small">'+L("Pilih semua di bawah:","Select everyone under:")+'</span><select id="gtU"><option value="">—</option>'+P.slice().sort(function(a, b){ return a.n.localeCompare(b.n); }).map(function(p){ return '<option value="'+esc(p.id)+'">'+esc(p.n)+(p.id===me0?' ('+L("saya","me")+')':'')+'</option>'; }).join("")+'</select>'+
      '<label class="small"><input type="checkbox" id="gtSp"'+(spouses?' checked':'')+'> '+L("termasuk pasangan","include spouses")+'</label></div>'+
      '<div class="gpTree">'+list.map(function(p){ var j = joined[p.n.trim().toLowerCase()]; return '<label class="gpTp"><input type="checkbox" data-tp="'+esc(p.id)+'"'+(sel[p.id]?' checked':'')+'> <span>'+(p.g==="f"?"👩":"👨")+' '+esc(p.n)+'</span>'+(j?'<small>✅ '+L("sudah sertai","joined")+'</small>':p.tel?'<small>📱</small>':'<small class="mut">'+L("tiada nombor","no number")+'</small>')+'</label>'; }).join("")+'</div>'+
      '<button class="btn gold full g3d" id="gtGo"'+(n?'':' disabled')+'>'+L("Sediakan jemputan","Prepare invites")+' ('+n+')</button>';
    var ov = H.showSheet("🌳 "+L("Jemput dari salasilah","Invite from the family tree"), h);
    var tq = ov.querySelector("#gtQ"); tq.oninput = function(){ q = tq.value.toLowerCase(); var pos = tq.selectionStart; draw(); var t2 = document.querySelector("#gtQ"); if(t2){ t2.focus(); t2.setSelectionRange(pos, pos); } };
    ov.querySelector("#gtAll").onclick = function(){ P.forEach(function(p){ if(p.id!==me0) sel[p.id] = 1; }); draw(); };
    ov.querySelector("#gtNone").onclick = function(){ sel = {}; draw(); };
    ov.querySelector("#gtSp").onchange = function(){ spouses = this.checked; };
    ov.querySelector("#gtU").onchange = function(){ var id = this.value; if(!id) return; var u = under(id); Object.keys(u).forEach(function(k){ if(k!==me0) sel[k] = 1; }); if(!Object.keys(u).length) H.toast(L("Tiada keturunan direkodkan di bawah nama ini","No descendants recorded under this name")); draw(); };
    ov.querySelectorAll("[data-tp]").forEach(function(c){ c.onchange = function(){ var id = c.getAttribute("data-tp"); if(c.checked) sel[id] = 1; else delete sel[id]; var b = ov.querySelector("#gtGo"), k = Object.keys(sel).length; b.disabled = !k; b.textContent = L("Sediakan jemputan","Prepare invites")+" ("+k+")"; }; });
    ov.querySelector("#gtGo").onclick = function(){ var people = Object.keys(sel).map(function(id){ return byId[id]; }).filter(Boolean); g.invited = people.map(function(p){ return {n: p.n, tel: p.tel||""}; }); putGrp(g); sendList(g); };
  };
  draw();
}
function waNum(t){ var n = String(t||"").replace(/[^0-9+]/g, ""); if(!n) return ""; if(n.charAt(0)==="+") return n.slice(1); if(n.charAt(0)==="0") return (H.cc ? String(H.cc()).replace(/\D/g, "") : "60")+n.slice(1); return n; }
function sendList(g){ var st = state(g), joined = {}; Object.keys(st.members).forEach(function(pub){ joined[String(st.members[pub].n).trim().toLowerCase()] = 1; });
  var inv = g.invited || [], sent = g.sent || {};
  var h = '<div class="mut small">'+L("Setiap orang mendapat pautan sendiri dengan nama mereka sudah diisi. Ketik untuk menghantar.","Each person gets their own link with their name filled in. Tap to send.")+'</div>'+
    inv.map(function(p, i){ var j = joined[p.n.trim().toLowerCase()]; return '<div class="gpMem"><span><b>'+esc(p.n)+'</b><br><small class="mut">'+(j?'✅ '+L("sudah sertai","joined"):sent[p.n]?'📨 '+L("dihantar","sent"):p.tel?esc(p.tel):L("tiada nombor: kongsi","no number: share"))+'</small></span>'+(j?'':'<button class="chip" data-gsend="'+i+'">'+(p.tel?'💬 WhatsApp':'📤 '+L("Kongsi","Share"))+'</button>')+'</div>'; }).join("");
  var ov = H.showSheet("📨 "+L("Hantar jemputan","Send invites")+" ("+inv.length+")", h);
  ov.querySelectorAll("[data-gsend]").forEach(function(b){ b.onclick = function(){ var p = inv[+b.getAttribute("data-gsend")], link = inviteLink(g, {days: 30, pn: p.n});
    var txt = L("Assalamualaikum ","Assalamualaikum ")+p.n+". "+L("Jom sertai papan kenyataan \"","Please join the notice board \"")+st.meta.name+L("\" dalam aplikasi My Ihsan (percuma di Google Play). Salin pautan ini, kemudian buka My Ihsan › Alat › Kumpulan › Sertai dan tampal:\n","\" in the My Ihsan app (free on Google Play). Copy this link, then open My Ihsan › Tools › Groups › Join and paste it:\n")+link;
    var num = waNum(p.tel); if(num) H.N.openUrl ? H.N.openUrl("https://wa.me/"+num+"?text="+encodeURIComponent(txt)) : window.open("https://wa.me/"+num+"?text="+encodeURIComponent(txt));
    else if(H.N.shareText) H.N.shareText(txt); else window.open("https://wa.me/?text="+encodeURIComponent(txt));
    g.sent = g.sent || {}; g.sent[p.n] = now(); putGrp(g); b.textContent = "✓"; }; });
}
// ---------------- 0.5.18: notifications, digest, open links ----------------
function notifSheet(){ var gs = H.load("ihsan_gset", {}) || {};
  var h = '<label class="obChk"><input type="checkbox" id="gnT"'+(gs.showTitle?' checked':'')+'> '+L("Tunjuk tajuk hantaran dalam makluman","Show the post title in notifications")+'</label>'+
    '<label class="obChk"><input type="checkbox" id="gnD"'+(gs.digest?' checked':'')+'> '+L("Ringkasan harian sahaja (satu makluman sehari; yang penting tetap segera)","Daily digest only (one notification a day; urgent posts still come at once)")+'</label>'+
    '<label class="small">'+L("Masa ringkasan","Digest time")+'</label><input id="gnDt" class="rin" type="time" value="'+esc(gs.dt||"21:30")+'">'+
    '<div class="mut tiny">'+L("Telefon memeriksa kumpulan setiap 30 minit. Masa sebenar mungkin lewat sedikit.","The phone checks groups every 30 minutes, so the exact time can be a little late.")+'</div><button class="btn gold full g3d" id="gnOk">'+L("Simpan","Save")+'</button>';
  var ov = H.showSheet("🔔 "+L("Makluman Kumpulan","Group notifications"), h);
  ov.querySelector("#gnOk").onclick = function(){ gs.showTitle = ov.querySelector("#gnT").checked; gs.digest = ov.querySelector("#gnD").checked; gs.dt = ov.querySelector("#gnDt").value || "21:30"; H.save("ihsan_gset", gs); pushNative(); H.closeOverlay(); H.toast(L("Disimpan","Saved")); }; }
function openLinksHelp(){ var h = '<div class="small" style="line-height:1.5">'+L("Supaya pautan jemputan yang ditekan dalam WhatsApp terus membuka My Ihsan:","So invite links tapped in WhatsApp open My Ihsan straight away:")+'<ol><li>'+L("Tekan butang di bawah (tetapan aplikasi My Ihsan).","Tap the button below (My Ihsan app settings).")+'</li><li>'+L("Buka \"Buka secara lalai\" / \"Open by default\".","Open \"Open by default\".")+'</li><li>'+L("Hidupkan \"Buka pautan yang disokong\" dan tambah pautan ihsanrahim.github.io.","Turn on \"Open supported links\" and add the ihsanrahim.github.io link.")+'</li></ol>'+L("Tanpa ini, pautan juga boleh ditampal dalam Kumpulan › Sertai, atau imbas kod QR.","Without this, a link can also be pasted in Groups › Join, or scan the QR code.")+'</div><button class="btn gold full g3d" id="gOlGo">⚙️ '+L("Buka tetapan","Open settings")+'</button>';
  var ov = H.showSheet("🔗 "+L("Buka pautan terus","Open links directly"), h);
  ov.querySelector("#gOlGo").onclick = function(){ if(H.N.openLinkSettings) H.N.openLinkSettings(); else H.toast(L("Hanya dalam aplikasi Android","Only in the Android app")); }; }
// ---------------- 0.5.18: share a post as a picture card ----------------
function wrapText(cx, t, w){ var out = []; String(t||"").split(/\n/).forEach(function(par){ var line = ""; par.split(/\s+/).forEach(function(word){ var tst = line ? line+" "+word : word; if(cx.measureText(tst).width > w && line){ out.push(line); line = word; } else line = tst; }); out.push(line); }); return out; }
function cardImage(st, p){ var W = 1080, k = pk(p.k), f = p.f, cv = document.createElement("canvas"), cx = cv.getContext("2d"), col = st.meta.color || "#0b5d3b";
  cx.font = "40px sans-serif"; var body = wrapText(cx, (p.k==="death" ? (f.name||"")+"\n"+(f.solat?"🕌 "+f.solat+"\n":"")+(f.burial?"⚰️ "+f.burial:"") : f.text||""), W-160).slice(0, 18);
  var extra = []; if(f.when) extra.push("📅 "+fmtDT(f.when)); if(f.place) extra.push("📍 "+f.place); if(p.k==="poll") (f.opts||[]).forEach(function(o){ extra.push("◻ "+o); });
  var Hh = 330 + body.length*54 + extra.length*52 + (f.title?90:0); cv.width = W; cv.height = Math.max(640, Hh);
  cx.fillStyle = "#0f2219"; cx.fillRect(0, 0, W, cv.height); cx.fillStyle = col; cx.fillRect(0, 0, W, 150);
  cx.fillStyle = "#fff"; cx.font = "bold 46px sans-serif"; cx.fillText((st.meta.icon||"👥")+"  "+String(st.meta.name||"").slice(0, 34), 60, 92);
  var y = 230; cx.fillStyle = "#c9a646"; cx.font = "bold 36px sans-serif"; cx.fillText(k[1]+" "+L(k[2], k[3]), 80, y); y += 70;
  if(f.title){ cx.fillStyle = "#fff"; cx.font = "bold 52px sans-serif"; wrapText(cx, f.title, W-160).slice(0, 2).forEach(function(l){ cx.fillText(l, 80, y); y += 62; }); y += 10; }
  cx.fillStyle = "#eef5ef"; cx.font = "40px sans-serif"; body.forEach(function(l){ cx.fillText(l, 80, y); y += 54; });
  cx.fillStyle = "#9db5a5"; extra.forEach(function(l){ cx.fillText(l, 80, y); y += 52; });
  cx.fillStyle = "#9db5a5"; cx.font = "28px sans-serif"; cx.fillText("My Ihsan · "+L("Kumpulan","Groups")+" · "+new Date(p.at*1000).toLocaleDateString(), 80, cv.height-50);
  return cv.toDataURL("image/png"); }
function shareCard(g, st, p){ var d = cardImage(st, p), t = (p.f.title||L(pk(p.k)[2], pk(p.k)[3]))+" — "+st.meta.name;
  if(H.N.shareImage) H.N.shareImage(d, t); else { var a = document.createElement("a"); a.href = d; a.download = "kumpulan.png"; a.click(); } }
// ---------------- 0.5.18: translate a post with the online AI chosen in Settings ----------------
function translate(p){ var f = p.f, src = [f.title, f.name, f.text, f.place, (f.opts||[]).join("\n")].filter(Boolean).join("\n\n");
  if(!src){ H.toast(L("Tiada teks untuk diterjemah","No text to translate")); return; }
  var ov = H.showSheet("🌐 "+L("Terjemahan","Translation"), (window.AIRun?'<div class="aiBtnRow">'+AIRun.btn("translate")+'</div>':'')+'<div class="mut small" id="gTr">⏳ '+L("Menterjemah…","Translating…")+'</div>'+(window.AIRun?AIRun.card("translate"):''));
  var go = function(){ window.HalalAI.complete([{role: "system", content: "You translate short community notice-board posts. If the text is Malay, translate it to English; otherwise translate it to Malay. Keep names, numbers, dates and Islamic terms. Reply with the translation only."}, {role: "user", content: src}], 800, function(a, b){ return L(a, b); }, "", "translate")
    .then(function(r){ var el = document.getElementById("gTr"); if(el){ el.className = "small"; el.innerHTML = esc(r.text).replace(/\n/g, "<br>")+'<div class="mut tiny" style="margin-top:6px">'+esc(r.provider||"")+'</div>'; } })
    .catch(function(e){ var el = document.getElementById("gTr"); if(el) el.innerHTML = '⚠️ '+esc(e && e.message || String(e)); }); };
  if(window.HalalAI) go(); else if(H.loadJs) H.loadJs(["halal/halal_ai.js"], go, function(){ ov.querySelector("#gTr").textContent = L("AI tidak dapat dimuatkan","The AI could not load"); }); }
// ---------------- 0.5.18: events by day for Masa › Bulan, ticker text for Paparan ----------------
function byDay(helpers){ H = helpers || H; var out = {}; store().list.forEach(function(g){ if(g.archived) return; var st = state(g);
  st.posts.forEach(function(p){ if(p.gone || !(p.k==="event" || p.k==="bday") || !p.f.when) return; var d = new Date(p.f.when); if(isNaN(d)) return;
    var add = function(dt){ var ds = dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0"); (out[ds] = out[ds] || []).push({title: p.f.title||"", when: p.f.when, place: p.f.place||"", color: st.meta.color, group: st.meta.icon+" "+st.meta.name, gid: g.id}); };
    add(d); if(p.f.rep) for(var i=1;i<=26;i++){ var d2 = new Date(d.getTime()+i*7*864e5); add(d2); } }); }); return out; }
function tickerText(helpers, gid){ H = helpers || H; var g = grp(gid); if(!g) return ""; var st = state(g), ps = st.posts.filter(function(p){ return !p.gone && (p.k==="ann"||p.k==="alert"||p.k==="event"||p.k==="death") && (!p.f.exp || new Date(p.f.exp).getTime() > Date.now()); });
  ps.sort(function(a, b){ return (b.pin?1:0) - (a.pin?1:0) || b.at - a.at; });
  return ps.slice(0, 5).map(function(p){ return pk(p.k)[1]+" "+(p.f.title||p.f.name||String(p.f.text||"").slice(0, 80))+(p.f.when?" · "+fmtDT(p.f.when):""); }).join("   •   "); }
function list(helpers){ H = helpers || H; return store().list.filter(function(g){ return !g.archived; }).map(function(g){ var st = state(g); return {id: g.id, name: st.meta.name, icon: st.meta.icon}; }); }

// ================= 0.5.62 group types: roles, points, reminders, typed home screens =================
function roleOf(st, pub){ var r = (st.meta.mrole||{})[pub] || (st.jrole||{})[pub]; if(r) return r; var t = st.meta.type;
  if(t==="couple") return "partner"; if(t==="kids") return (pub===st.owner || (st.meta.admins||[]).indexOf(pub)>=0) ? "parent" : "child"; return ""; }
function ageOf(st, pub){ return (st.meta.age||{})[pub] || (st.jage||{})[pub] || "7-12"; }
function myRole(st){ return roleOf(st, me().pub); }
function kidsOf(st){ return Object.keys(st.members).filter(function(p){ return roleOf(st, p)==="child"; }); }
function parentsOf(st){ return Object.keys(st.members).filter(function(p){ return roleOf(st, p)==="parent" || roleOf(st, p)==="guardian"; }); }
function roleName(r){ return {partner: L("Pasangan","Partner"), parent: L("Ibu bapa","Parent"), child: L("Anak","Child"), guardian: L("Penjaga","Guardian")}[r] || ""; }
function dkey(ms){ var d = new Date(ms); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
function today(){ return dkey(Date.now()); }
function hm(ms){ return new Date(ms).toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"}); }
function live(st, k){ return st.posts.filter(function(p){ return p.k===k && !p.gone; }); }
function forMe(p, pub){ var w = p.f.who || p.f["for"] || "all"; return w==="all" || w===pub || (w==="me" && p.pub===pub); }
function whoName(st, p){ var w = p.f.who || p.f["for"] || "all"; return w==="all" ? (st.meta.type==="couple" ? L("sesiapa","either") : L("semua","everyone")) : esc(nameOf(st, w)); }
// points (Parents & kids): approved chores (+their points), approved Quran logs (+5), on-time solat (+2), minus redeemed rewards
function points(st, pub){ var n = 0;
  live(st, "chore").forEach(function(p){ if((st.oks[p.id]||{})[pub]) n += +p.f.pts || 10; });
  live(st, "quran").forEach(function(p){ if(p.pub===pub && (st.oks[p.id]||{})[pub]) n += 5; });
  live(st, "solat").forEach(function(p){ if(p.pub===pub && p.f.on) n += 2; });
  st.redeem.forEach(function(r){ if(r.pub===pub){ var rw = st.byId[r.ref]; if(rw) n -= +rw.f.cost || 0; } });
  return n; }
function solatToday(st, pub){ var o = {}; live(st, "solat").forEach(function(p){ if(p.pub===pub && dkey(p.at*1000)===today()) o[p.f.pr] = p.f.on ? "y" : "m"; }); return o; }
function lastCheck(st, pub, hrs){ var c = st.posts.filter(function(p){ return !p.gone && (p.k==="checkin" || p.k==="help") && p.pub===pub && p.at > now()-(hrs||12)*3600; }); return c[c.length-1]; }
function waiting(st){ var out = []; // things a parent should approve
  live(st, "chore").forEach(function(p){ Object.keys(st.done[p.id]||{}).forEach(function(who){ if(!(st.oks[p.id]||{})[who] && roleOf(st, who)==="child") out.push({ref: p.id, who: who, ic: "🧹", t: p.f.title, img: ((st.proof[p.id]||{})[who]||{}).img}); }); });
  live(st, "quran").forEach(function(p){ if(roleOf(st, p.pub)==="child" && !(st.oks[p.id]||{})[p.pub]) out.push({ref: p.id, who: p.pub, ic: "📖", t: (p.f.surah||"")+(p.f.pages?" · "+p.f.pages+" "+L("ms","pg"):"")}); });
  st.redeem.forEach(function(r){ var rw = st.byId[r.ref]; if(rw && !(st.oks[r.id]||{})[r.pub]) out.push({ref: r.id, who: r.pub, ic: "🎁", t: rw.f.title+" ("+(+rw.f.cost||0)+" "+L("mata","pts")+")"}); });
  return out; }
// reminders: an exact time, or a prayer time + minutes; once, weekdays or daily. Returns the next time in ms, or 0.
function remNext(p, from){ var f = p.f, base = from || Date.now(), made = p.at*1000;
  for(var i = 0; i < 9; i++){ var d = new Date(base); d.setHours(0, 0, 0, 0); d.setDate(d.getDate()+i); var dow = d.getDay(), t = 0;
    if(f.rep==="wd" && (dow===0 || dow===6)) continue;
    if(f.pr){ t = H.ptime ? H.ptime(f.pr, d) : 0; if(t) t += (+f.off||0)*60000; }
    else if(f.at){ var a = new Date(f.at); if(isNaN(a)) return 0; if(!f.rep || f.rep==="once") return a.getTime() > base ? a.getTime() : 0; t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), a.getHours(), a.getMinutes()).getTime(); }
    if(!t) continue; if((!f.rep || f.rep==="once") && dkey(t)!==dkey(made) && dkey(t)!==dkey(made+864e5)) return 0;
    if(t > base) return t; }
  return 0; }
function remWhen(p){ var f = p.f, rp = {wd: L("hari bekerja","weekdays"), daily: L("setiap hari","daily")}[f.rep]||"";
  var s = f.pr ? L("Selepas ","After ")+L(PRAY.filter(function(x){ return x[0]===f.pr; })[0][2], PRAY.filter(function(x){ return x[0]===f.pr; })[0][3])+(+f.off?" + "+(+f.off)+" min":"") : f.at ? fmtDT(f.at) : "";
  var n = remNext(p); return s+(rp?" · 🔁 "+rp:"")+(n?" · "+L("seterusnya ","next ")+hm(n):""); }
function remsSchedule(g, st){ if(!H || !H.xrem) return; var m = me().pub;
  live(st, "rem").forEach(function(p){ var id = "grr"+g.id.slice(0, 6)+p.id.slice(0, 10); if(!forMe(p, m)){ H.xrem(id, 0); H.xrem(id+"n", 0); return; }
    var dn = (st.done[p.id]||{})[m], t = remNext(p, dn && dkey(dn*1000)===today() ? new Date().setHours(23, 59, 0, 0) : 0);
    if(dn && (!p.f.rep || p.f.rep==="once")) t = 0;
    var body = esc(st.meta.icon+" "+st.meta.name)+" · "+L("daripada ","from ")+nameOf(st, p.pub);
    H.xrem(id, t, "⏰ "+(p.f.title||""), body, "kumpulan"); H.xrem(id+"n", t && p.f.nudge ? t+20*60000 : 0, "⏰ "+(p.f.title||""), L("Belum ditanda selesai · ","Not ticked yet · ")+body, "kumpulan"); }); }
// ---------- typed home screens ----------
function tabs(st, list){ return '<div class="gpChips gtTabs">'+list.map(function(t){ return '<button class="chip'+(UI.tab===t[0]?' on':'')+'" data-gtab="'+t[0]+'">'+t[1]+'</button>'; }).join("")+'</div>'; }
function chk(on, attr, lab){ return '<button class="gtChk'+(on?' on':'')+'" '+attr+' aria-label="'+esc(lab||"")+'">'+(on?'✓':'')+'</button>'; }
function todoRow(st, p){ var dn = st.done[p.id]||{}, by = Object.keys(dn)[0];
  return '<div class="gtRow'+(by?' done':'')+'">'+chk(!!by, 'data-gtodo="'+p.id+'"', p.f.title)+'<span class="gtTx">'+esc(p.f.title||"")+(p.f.after?' · '+esc(L("selepas ","after ")+p.f.after):p.f.due?' · '+fmtDT(p.f.due):'')+'</span><small class="gtWho">'+(by?esc(nameOf(st, by))+' · '+hm(dn[by]*1000):whoName(st, p))+'</small></div>'; }
function groceryCard(st, p){ var tk = st.ticks[p.id]||{}, it = p.f.items||[], left = it.filter(function(x, i){ return !tk[i]; }).length;
  return '<div class="card gtCard"><div class="gtH"><b>🛒 '+esc(p.f.title||L("Barang","Groceries"))+'</b><span>'+left+' '+L("lagi","left")+'</span></div>'+it.map(function(x, i){ var t = tk[i];
    return '<div class="gtRow'+(t?' done':'')+'">'+chk(!!t, 'data-gtick="'+p.id+'|'+i+'"', x)+'<span class="gtTx">'+esc(x)+'</span>'+(t?'<small class="gtWho">'+esc(nameOf(st, t.pub))+'</small>':'')+'</div>'; }).join("")+'</div>'; }
function statusBtns(list){ return '<div class="gtQuick">'+list.map(function(id){ return '<button class="btn alt g3d" data-gstat="'+id+'">'+stLabel(id)+'</button>'; }).join("")+'</div>'; }
function coupleHome(g, st){ var m = me().pub, other = Object.keys(st.members).filter(function(p){ return p!==m; })[0], h = '';
  var lc = other && lastCheck(st, other, 6); if(lc) h += '<div class="gtStatus">'+(lc.k==="help"?"🙋":stLabel(lc.f.label).split(" ")[0])+' <div><b>'+esc(nameOf(st, other))+'</b> · '+esc(lc.k==="help"?(lc.f.text||L("perlu bantuan","needs help")):stLabel(lc.f.label).replace(/^\S+\s/, ""))+(lc.f.text&&lc.k!=="help"?' · '+esc(lc.f.text):'')+'<small> · '+when(lc.at)+'</small></div></div>';
  if(!other) h += '<div class="card small">💌 '+L("Jemput pasangan anda untuk mula berkongsi.","Invite your partner to start sharing.")+' <button class="chip" id="gtInv">➕ '+L("Jemput pasangan","Invite partner")+'</button></div>';
  var td = live(st, "todo").filter(function(p){ var dn = st.done[p.id]||{}, by = Object.keys(dn)[0]; return !by || dkey(dn[by]*1000)===today(); }), dc = td.filter(function(p){ return Object.keys(st.done[p.id]||{}).length; }).length;
  h += '<div class="card gtCard"><div class="gtH"><b>'+L("Hari ini bersama","Today together")+'</b><span>'+dc+' / '+td.length+' '+L("selesai","done")+'</span></div><div class="gtBar"><i style="width:'+(td.length?Math.round(dc*100/td.length):0)+'%"></i></div>'+
    (td.length?td.map(function(p){ return todoRow(st, p); }).join(""):'<div class="mut small">'+L("Tiada tugasan. Tekan ＋ untuk tambah.","No to-dos. Tap ＋ to add one.")+'</div>')+'</div>';
  live(st, "grocery").slice(-2).forEach(function(p){ var tk = st.ticks[p.id]||{}; if((p.f.items||[]).some(function(x, i){ return !tk[i]; })) h += groceryCard(st, p); });
  var mo = new Date().getMonth(), yr = new Date().getFullYear(), bills = live(st, "bill").filter(function(p){ var d = new Date(p.f.due||p.at*1000); return d.getMonth()===mo && d.getFullYear()===yr; }),
    tot = bills.reduce(function(a, p){ return a + (+p.f.amt||0); }, 0), unpaid = bills.filter(function(p){ return !Object.keys(st.done[p.id]||{}).length; });
  var wk = now()-7*86400, qp = {}; live(st, "quran").forEach(function(p){ if(p.at > wk) qp[p.pub] = (qp[p.pub]||0) + (+p.f.pages||0); });
  h += '<div class="gtSplit"><div class="gtMini"><span class="l">'+L("Bil bulan ini","Bills this month")+'</span><span class="n">RM '+tot.toLocaleString()+'</span>'+(unpaid.length?'<span class="gtPill warn">'+unpaid.length+' '+L("belum bayar","unpaid")+'</span>':'<span class="gtPill ok">'+L("semua dibayar","all paid")+'</span>')+'</div>'+
    '<div class="gtMini"><span class="l">'+L("Quran minggu ini","Quran this week")+'</span><span class="n">'+Object.keys(qp).reduce(function(a, k){ return a+qp[k]; }, 0)+' '+L("ms","pg")+'</span><span class="l">'+Object.keys(st.members).map(function(k){ return esc(nameOf(st, k))+' '+(qp[k]||0); }).join(" · ")+'</span></div></div>';
  var nx = null; st.posts.forEach(function(p){ if(p.gone || !(p.k==="event"||p.k==="bday") || !p.f.when) return; var t = nextWhen(p.f) || new Date(p.f.when).getTime(); if(p.k==="bday"){ var d = new Date(p.f.when); d.setFullYear(new Date().getFullYear()); if(d.getTime() < Date.now()-864e5) d.setFullYear(d.getFullYear()+1); t = d.getTime(); } if(t > Date.now()-864e5 && (!nx || t < nx.t)) nx = {t: t, p: p}; });
  if(nx){ var dd = Math.max(0, Math.ceil((nx.t-Date.now())/864e5)); h += '<div class="card gtCard"><div class="gtH"><b>'+(nx.p.k==="bday"?"💍":"📅")+' '+esc(nx.p.f.title||"")+'</b><span>'+(dd===0?L("hari ini","today"):L("dalam ","in ")+dd+L(" hari"," days"))+'</span></div></div>'; }
  var rs = live(st, "rem").filter(function(p){ return forMe(p, m) && remNext(p); }).sort(function(a, b){ return remNext(a)-remNext(b); }).slice(0, 3);
  if(rs.length) h += '<div class="card gtCard"><div class="gtH"><b>⏰ '+L("Peringatan untuk saya","My reminders")+'</b></div>'+rs.map(function(p){ return '<div class="gtRow">'+chk(false, 'data-gdonep="'+p.id+'"', p.f.title)+'<span class="gtTx">'+esc(p.f.title)+'<small class="mut"> · '+esc(remWhen(p))+'</small></span><small class="gtWho">'+esc(nameOf(st, p.pub))+'</small></div>'; }).join("")+'</div>';
  h += statusBtns(["omw","office","late","home"]);
  return h; }
function kidFace(st, pub){ var a = ageOf(st, pub); return a==="u7" ? "👶" : a==="13+" ? "🧑" : "🧒"; }
function parentHome(g, st){ var h = '', kids = kidsOf(st), wt = waiting(st);
  if(UI.tab==="appr"){ h += wt.length ? wt.map(function(w){ return '<div class="card gtAppr">'+(w.img?'<img src="'+w.img+'" data-gimg alt="">':'<span class="gtBig">'+w.ic+'</span>')+'<div class="gtTx"><b>'+esc(nameOf(st, w.who))+'</b><div class="small">'+esc(w.t||"")+'</div></div><button class="btn gold g3d" data-gok="'+w.ref+'|'+w.who+'">✅ '+L("Lulus","Approve")+'</button></div>'; }).join("") : '<div class="card mut small">'+L("Tiada yang menunggu. 👍","Nothing waiting. 👍")+'</div>'; return h; }
  if(UI.tab==="par"){ var pn = live(st, "pnote").filter(function(p){ return p.f.to && p.f.to[me().pub]; }).reverse();
    h += '<div class="gpAnn small">🔒 '+L("Hanya ibu bapa boleh membaca. Setiap nota disulitkan kepada setiap ibu bapa; anak-anak tidak dapat membukanya.","Only parents can read these. Each note is sealed to each parent; the children cannot open it.")+'</div><button class="btn gold g3d" id="gtPn">✏️ '+L("Nota ibu bapa","Parents' note")+'</button>';
    pn.forEach(function(p){ var x = openFrom(p.pub, p.f.to[me().pub]) || {}; h += '<div class="card gpPost"><div class="gpPh"><span>🔒</span><b>'+esc(nameOf(st, p.pub))+'</b><span class="mut tiny" style="margin-left:auto">'+when(p.at)+'</span></div><div class="gpX">'+esc(x.text||"").replace(/\n/g, "<br>")+'</div></div>'; }); return h; }
  if(!kids.length) h += '<div class="card small">👧 '+L("Belum ada anak dalam kumpulan. Jemput anak dengan pautan peribadi mereka.","No children in the group yet. Invite each child with their own link.")+'</div>';
  kids.forEach(function(k){ var lc = lastCheck(st, k, 12), sd = solatToday(st, k), ch = live(st, "chore").concat(live(st, "task")).filter(function(p){ return forMe(p, k); }),
      over = ch.filter(function(p){ var d = p.f.due && new Date(p.f.due).getTime(); return d && d < Date.now() && !(st.done[p.id]||{})[k]; }).length, open = ch.filter(function(p){ return !(st.done[p.id]||{})[k]; }).length;
    h += '<div class="card gtKid"><div class="gtKidT"><span class="gtFace">'+kidFace(st, k)+'</span><div class="gtTx"><b>'+esc(nameOf(st, k))+'</b><small>'+(lc?esc((lc.k==="help"?"🙋 "+(lc.f.text||L("Perlu bantuan","Needs help")):stLabel(lc.f.label))+" · "+hm(lc.at*1000)):L("Tiada status hari ini","No status today"))+'</small></div>'+
      '<span class="gtPill '+(over?'bad':open?'warn':'ok')+'">'+(over?over+' '+L("lewat","overdue"):open?open+' '+L("belum siap","to do"):L("Beres","On track"))+'</span></div>'+
      (ageOf(st, k)!=="u7"?'<div class="gtDots">'+PRAY.map(function(x){ return '<i class="'+(sd[x[0]]==="y"?'y':sd[x[0]]==="m"?'m':'')+'" title="'+x[2]+'">'+x[4]+'</i>'; }).join("")+'<span class="gtWho">⭐ '+points(st, k)+' '+L("mata","pts")+'</span></div>':'<div class="gtWho">⭐ '+points(st, k)+' '+L("mata","pts")+'</div>')+'</div>'; });
  if(wt.length) h += '<div class="card gtCard"><div class="gtH"><b>'+L("Menunggu anda","Waiting for you")+'</b><span>'+wt.length+'</span></div>'+wt.slice(0, 3).map(function(w){ return '<div class="gtRow"><span>'+w.ic+'</span><span class="gtTx">'+esc(nameOf(st, w.who))+': '+esc(w.t||"")+'</span><button class="chip" data-gok="'+w.ref+'|'+w.who+'">✅</button></div>'; }).join("")+'</div>';
  h += '<div class="btns"><button class="btn alt g3d" id="gtWeek">📊 '+L("Laporan mingguan","Weekly report")+'</button><button class="btn alt g3d" id="gtInvK">➕ '+L("Jemput anak / ibu bapa","Invite child / parent")+'</button></div>';
  return h; }
function kidHome(g, st){ var m = me().pub, a = ageOf(st, m), pts = points(st, m), sd = solatToday(st, m), cur = H.curPrayer ? H.curPrayer() : "", h = '';
  h += '<div class="gtHi"><b>'+L("Hai ","Hi ")+esc(nameOf(st, m))+'! 👋</b><span class="gtPill ok">⭐ '+pts+' '+L("mata","pts")+'</span></div>';
  if(a!=="u7") h += '<div class="card gtSolat"><div class="gtH"><b>'+L("Solat saya hari ini","My solat today")+'</b><span>'+Object.keys(sd).length+' / 5</span></div><div class="gtTiles">'+PRAY.map(function(x){ return '<button class="gtTile'+(sd[x[0]]?' on':'')+(cur===x[0]&&!sd[x[0]]?' now':'')+'" data-gsol="'+x[0]+'"><span>'+x[1]+'</span>'+x[2]+'</button>'; }).join("")+'</div>'+
    (cur && !sd[cur] && PRAY.some(function(x){ return x[0]===cur; })?'<div class="small gtNow">'+L("Waktu ","")+L(PRAY.filter(function(x){ return x[0]===cur; })[0][2], PRAY.filter(function(x){ return x[0]===cur; })[0][3])+L(" sekarang! Ketik bila selesai ✋"," now! Tap when done ✋")+'</div>':'')+'</div>';
  var jobs = live(st, "chore").concat(live(st, "task")).filter(function(p){ return forMe(p, m); });
  h += '<div class="card gtCard"><div class="gtH"><b>'+L("Kerja saya","My jobs")+'</b><span>'+L("+mata setiap satu","+points each")+'</span></div>'+(jobs.length?jobs.map(function(p){ var dn = (st.done[p.id]||{})[m], okd = (st.oks[p.id]||{})[m];
    return '<div class="gtRow'+(dn?' done':'')+'">'+chk(!!dn, (dn?'':'data-gjob="'+p.id+'"'), p.f.title)+'<span class="gtTx">'+esc(p.f.title||"")+'</span><small class="gtWho">'+(okd?'✅ +'+(p.k==="chore"?(+p.f.pts||10):0):dn?'⏳ '+L("ibu bapa menyemak","parent checking"):p.f.proof?'📷 '+L("perlu gambar","photo needed"):p.f.due?fmtDT(p.f.due):'')+'</small></div>'; }).join(""):'<div class="mut small">'+L("Tiada kerja. 🎉","No jobs. 🎉")+'</div>')+'</div>';
  var rw = live(st, "reward").slice().sort(function(x, y){ return (+x.f.cost||0)-(+y.f.cost||0); });
  if(rw.length){ var nx = rw.filter(function(p){ return (+p.f.cost||0) > pts; })[0] || rw[rw.length-1], can = rw.filter(function(p){ return (+p.f.cost||0) <= pts; });
    h += '<div class="card gtCard"><div class="gtH"><b>'+L("Ganjaran seterusnya","Next reward")+'</b><span>'+pts+' / '+(+nx.f.cost||0)+'</span></div><div class="gtBar"><i style="width:'+Math.min(100, Math.round(pts*100/Math.max(1, +nx.f.cost||1)))+'%"></i></div><div class="small mut">🎁 '+esc(nx.f.title||"")+'</div>'+
      can.map(function(p){ return '<button class="chip" data-gredeem="'+p.id+'">🎁 '+esc(p.f.title)+' · '+(+p.f.cost||0)+'</button>'; }).join(" ")+'</div>'; }
  h += statusBtns(["school","home","pick"]);
  return h; }
function weekly(g, st){ var wk = now()-7*86400, lines = [];
  var h = kidsOf(st).map(function(k){ var sol = live(st, "solat").filter(function(p){ return p.pub===k && p.at > wk; }), on = sol.filter(function(p){ return p.f.on; }).length,
      ch = live(st, "chore").filter(function(p){ var t = (st.oks[p.id]||{})[k]; return t && t > wk; }).length, qp = live(st, "quran").filter(function(p){ return p.pub===k && p.at > wk; }).reduce(function(a, p){ return a+(+p.f.pages||0); }, 0);
    var t = nameOf(st, k)+": 🕌 "+sol.length+"/35 "+L("solat","solat")+" ("+on+" "+L("tepat waktu","on time")+") · 🧹 "+ch+" "+L("kerja diluluskan","jobs approved")+" · 📖 "+qp+" "+L("muka surat","pages")+" · ⭐ "+points(st, k);
    lines.push(t); return '<div class="gpEvRow small">'+esc(t)+'</div>'; }).join("") || '<div class="mut small">'+L("Tiada anak.","No children.")+'</div>';
  var ov = H.showSheet("📊 "+L("Laporan 7 hari","7-day report"), h+'<button class="btn gold full g3d" id="gtWs">💬 '+L("Kongsi kepada pasangan","Share with your spouse")+'</button>');
  ov.querySelector("#gtWs").onclick = function(){ var t = "📊 "+st.meta.name+" · "+L("7 hari","7 days")+"\n"+lines.join("\n"); if(H.N.shareTo) H.N.shareTo("com.whatsapp", t); else if(H.N.shareText) H.N.shareText(t); }; }
function inviteRole(g){ var st = state(g), h = '<input id="grN" class="rin" maxlength="30" placeholder="'+L("Nama, cth. Umar","Name, e.g. Umar")+'">'+
    '<div class="gpTypes"><button class="chip on" data-grl="child">🧒 '+L("Anak","Child")+'</button><button class="chip" data-grl="parent">🧑 '+L("Ibu bapa","Parent")+'</button><button class="chip" data-grl="guardian">🧓 '+L("Penjaga","Guardian")+'</button></div>'+
    '<div class="gpTypes" id="grAg"><button class="chip" data-gag="u7">'+L("Bawah 7","Under 7")+'</button><button class="chip on" data-gag="7-12">7–12</button><button class="chip" data-gag="13+">13+</button></div>'+
    '<div class="mut tiny">'+L("Umur menentukan apa yang anak nampak. Anak bawah 7 tahun hanya nampak kerja dan bintang.","Age decides what the child sees. Under-7s only see their jobs and stars.")+'</div><button class="btn gold full g3d" id="grGo">'+L("Buat pautan jemputan","Make the invite link")+'</button>';
  var ov = H.showSheet("➕ "+L("Jemput ke ","Invite to ")+esc(st.meta.name), h), rl = "child", ag = "7-12";
  ov.querySelectorAll("[data-grl]").forEach(function(b){ b.onclick = function(){ rl = b.getAttribute("data-grl"); ov.querySelectorAll("[data-grl]").forEach(function(x){ x.classList.toggle("on", x===b); }); ov.querySelector("#grAg").style.display = rl==="child" ? "" : "none"; }; });
  ov.querySelectorAll("[data-gag]").forEach(function(b){ b.onclick = function(){ ag = b.getAttribute("data-gag"); ov.querySelectorAll("[data-gag]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  ov.querySelector("#grGo").onclick = function(){ var n = ov.querySelector("#grN").value.trim(); if(!n){ H.toast(L("Isi nama","Fill in the name")); return; } H.closeOverlay(); inviteSheet(g, {pn: n, rl: rl, ag: rl==="child" ? ag : "", days: 30, single: true}); }; }
// the typed home sits above the board; tabs switch between it and the full board
function typedHome(g, st){ var t = st.meta.type, r = myRole(st);
  // 0.5.70 (owner): a couple group has no Today tab, only All posts
  if(t==="couple"){ UI.tab = "board"; return null; }
  if(t==="kids" && r==="child"){ UI.tab = UI.tab==="board" ? "board" : "home"; return {tabs: tabs(st, [["home","⭐ "+L("Saya","Me")],["board","📋 "+L("Papan","Board")]]), html: UI.tab==="home" ? kidHome(g, st) : null}; }
  if(t==="kids"){ if(["home","appr","par","board"].indexOf(UI.tab)<0) UI.tab = "home"; var n = waiting(st).length;
    return {tabs: tabs(st, [["home","🏠 "+L("Hari ini","Today")],["appr","✅ "+L("Kelulusan","Approvals")+(n?" · "+n:"")],["par","🔒 "+L("Ibu bapa","Parents only")],["board","📋 "+L("Papan","Board")]]), html: UI.tab==="board" ? null : parentHome(g, st)}; }
  return null; }
function bindTyped(el, g, st){ var m = me().pub, q = function(sel, fn){ el.querySelectorAll(sel).forEach(function(b){ b.onclick = function(e){ e.preventDefault(); fn(b); }; }); };
  q("[data-gtab]", function(b){ UI.tab = b.getAttribute("data-gtab"); draw(); });
  q("[data-gtodo]", function(b){ var id = b.getAttribute("data-gtodo"), dn = st.done[id]||{}, by = Object.keys(dn)[0]; publish(g, {t: "done", ref: id, on: !by}); if(by && by!==m) publish(g, {t: "done", ref: id, on: false}); draw(); });
  q("[data-gdonep]", function(b){ publish(g, {t: "done", ref: b.getAttribute("data-gdonep"), on: true}); remsSchedule(g, state(g)); H.toast(L("Ditanda selesai","Marked done")); draw(); });
  q("[data-gtick]", function(b){ var a = b.getAttribute("data-gtick").split("|"); publish(g, {t: "tick", ref: a[0], i: +a[1], on: !(st.ticks[a[0]]||{})[a[1]]}); draw(); });
  q("[data-gstat]", function(b){ var id = b.getAttribute("data-gstat"); publish(g, id==="pick" ? {t: "post", k: "help", f: {text: stLabel("pick")}} : {t: "post", k: "checkin", f: {label: id}}); H.toast(L("Status dihantar","Status sent")); draw(); });
  q("[data-gok]", function(b){ var a = b.getAttribute("data-gok").split("|"); publish(g, {t: "ok", ref: a[0], who: a[1]}); H.toast(L("Diluluskan","Approved")); draw(); });
  q("[data-gsol]", function(b){ var pr = b.getAttribute("data-gsol"); if(solatToday(st, m)[pr]) return; var cur = H.curPrayer ? H.curPrayer() : "";
    publish(g, {t: "post", k: "solat", f: {pr: pr, on: cur===pr}}); H.toast(cur===pr ? L("MasyaAllah! +2 mata","MasyaAllah! +2 points") : L("Direkodkan","Logged")); draw(); });
  q("[data-gjob]", function(b){ var id = b.getAttribute("data-gjob"), p = st.byId[id]; var fin = function(img){ if(img) publish(g, {t: "proof", ref: id, img: img}); publish(g, {t: "done", ref: id, on: true}); H.toast(L("Bagus! Ibu bapa akan semak","Great! A parent will check it")); draw(); };
    if(p && p.f.proof){ var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.capture = "environment"; inp.onchange = function(){ var fl = inp.files[0]; if(!fl) return; shrink(fl, function(d){ if(d) fin(d); }); }; inp.click(); } else fin(null); });
  q("[data-gredeem]", function(b){ publish(g, {t: "redeem", ref: b.getAttribute("data-gredeem")}); H.toast(L("Permintaan dihantar kepada ibu bapa","Request sent to your parents")); draw(); });
  q("#gtInv", function(){ inviteSheet(g, {single: true, days: 0, rl: "partner"}); });
  q("#gtInvK", function(){ inviteRole(g); });
  q("#gtWeek", function(){ weekly(g, st); });
  q("#gtPn", function(){ compose(g, "pnote"); });
  q("[data-gimg]", function(b){ H.showSheet("📷", '<img src="'+b.getAttribute("src")+'" style="width:100%">'); }); }

// 0.5.72 (owner): the open group and its tab join the app's Back history (Back goes to the page seen before)
window.GroupsView = {navGet: function(){ var o = {g: UI.g||"", tab: UI.tab||""}; o.k = o.g+"|"+o.tab; return o; }, navSet: function(o){ UI.g = o.g || null; UI.tab = o.tab || ""; }, byDay: byDay, tickerText: tickerText, list: list, open: open, sync: sync, widget: widget, link: link, _t: {parseInvite: parseInvite, inviteLink: inviteLink, seal: seal, open_: open_, tagOf: tagOf, mkEvent: mkEvent, verify: verify, state: state, store: store, create: create, publish: publish, me: me, relays: RELAYS, KIND: KIND}};
})();
