/* My Ihsan 0.7.67 (owner): Family link. Share each child's planner (and School progress) with a spouse, grandparent or carer, and
   send each other notifications ("Ayah added Sports Day", "homework done", 🔔 nudges).
   - No accounts, no server keeping data: the same free public Nostr relays as Groups; every message is sealed with the link's own
     AES-256-GCM key, which only travels inside the invite code (shared by WhatsApp or shown as a QR).
   - Each phone keeps its own copy. Every planner record carries when it last changed (and deletions are remembered), so two phones merge
     without losing edits; the newest change wins. Photos stay on the phone that took them.
   - Works while the app is open and when it starts (it catches up from the relays); no paid push service.
   FamLink.start(H) · FamLink.open(H, kidId?) (the sheet) · FamLink.changed(kidId, KD) (called by kplan save) · FamLink.nudge(kidId, text)
   Storage: ihsan_famlink {me:{sk,pub,name}, links:[{id,key,tag,peer,kids:{sid:{local,plan,learn}},notify,last,made}]}, ihsan_famsnap {localKid: records}. */
(function(){ "use strict";
var H = null, K = null, KIND = 1779, RELAYS = window.LQ_RELAYS || ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net"];
var STORE = "ihsan_famlink", SNAP = "ihsan_famsnap", conns = {}, started = false, sendT = {}, pending = {};
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function hex(b){ return K.bytesToHex(b); } function unhex(h){ return K.hexToBytes(h); }
function sha(s){ return hex(K.sha256(K.utf8ToBytes(s))); }
function b64(u8){ var s = ""; for(var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); }
function unb64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function seal(key, o){ var n = K.randomBytes(12), ct = K.gcm(unhex(key), n).encrypt(K.utf8ToBytes(JSON.stringify(o))), out = new Uint8Array(12 + ct.length); out.set(n); out.set(ct, 12); return b64(out); }
function unseal(key, s){ try{ var u = unb64(s), pt = K.gcm(unhex(key), u.slice(0, 12)).decrypt(u.slice(12)); return JSON.parse(new TextDecoder().decode(pt)); }catch(e){ return null; } }
function st(){ var s = H.load(STORE, null) || {}; s.links = s.links || []; if(!s.me){ var sk = K.schnorr.utils.randomPrivateKey(); s.me = {sk: hex(sk), pub: hex(K.schnorr.getPublicKey(sk)), name: ""}; H.save(STORE, s); } return s; }
function saveSt(s){ H.save(STORE, s); }
function kids(){ return H.kids ? H.kids() : []; }
function kidName(id){ var k = kids().filter(function(x){ return x.id === id; })[0]; return k ? (k.e ? k.e + " " : "") + k.n : ""; }
function need(fn){ if(window.NostrKit){ K = window.NostrKit; fn(); return; } H.loadJs(["groups/nostrkit.js"], function(){ K = window.NostrKit; fn(); }, function(){ H.toast(L("Tidak dapat memuatkan sambungan", "Could not load the link")); }); }

// ---------------- records: every planner thing as {id → value}, with when it changed ----------------
var ARR = ["ev","hw","home","forms","ach","read","health","fees","tt"], TK = ["terms","hol","exam","ev"];
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function strip(o){ var c = {}; Object.keys(o).forEach(function(k){ if(k !== "img" && k !== "m") c[k] = o[k]; }); return c; }
function records(kd){ var r = {};
  ARR.forEach(function(a){ (kd[a] || []).forEach(function(x){ if(!x.id) x.id = uid(); r[a + ":" + x.id] = strip(x); }); });
  TK.forEach(function(a){ ((kd.tk || {})[a] || []).forEach(function(x){ if(!x.id) x.id = uid(); r["tk." + a + ":" + x.id] = strip(x); }); });
  ((kd.money || {}).log || []).forEach(function(x){ if(!x.id) x.id = uid(); r["mlog:" + x.id] = strip(x); });
  Object.keys(kd.done || {}).forEach(function(k){ if(kd.done[k]) r["done:" + k] = 1; });
  Object.keys(kd.mood || {}).forEach(function(k){ if(kd.mood[k]) r["mood:" + k] = kd.mood[k]; });
  Object.keys(kd.play || {}).forEach(function(k){ r["play:" + k] = kd.play[k]; });
  if(kd.col != null) r["s:col"] = kd.col; if(kd.readGoal) r["s:readGoal"] = kd.readGoal; if(kd.money && kd.money.goal) r["s:goal"] = [kd.money.goal, kd.money.goalN || ""];
  return r; }
function fromRecords(r, kd){ var imgs = {};
  ARR.forEach(function(a){ (kd[a] || []).forEach(function(x){ if(x.img) imgs[a + ":" + x.id] = x.img; }); kd[a] = []; });
  kd.tk = kd.tk || {}; TK.forEach(function(a){ kd.tk[a] = []; }); kd.money = kd.money || {log: []}; kd.money.log = []; kd.done = {}; kd.mood = {}; kd.play = {};
  Object.keys(r).forEach(function(id){ var i = id.indexOf(":"), c = id.slice(0, i), k = id.slice(i + 1), v = r[id];
    if(ARR.indexOf(c) >= 0){ var o = JSON.parse(JSON.stringify(v)); if(imgs[id]) o.img = imgs[id]; kd[c].push(o); }
    else if(c.indexOf("tk.") === 0) kd.tk[c.slice(3)].push(JSON.parse(JSON.stringify(v)));
    else if(c === "mlog") kd.money.log.push(JSON.parse(JSON.stringify(v)));
    else if(c === "done") kd.done[k] = 1; else if(c === "mood") kd.mood[k] = v; else if(c === "play") kd.play[k] = v;
    else if(id === "s:col") kd.col = v; else if(id === "s:readGoal") kd.readGoal = v; else if(id === "s:goal"){ kd.money.goal = v[0]; kd.money.goalN = v[1]; } });
  kd.tt.sort(function(a, b){ return (a.d - b.d) || (a.s < b.s ? -1 : 1); }); kd.hw.sort(function(a, b){ return a.due < b.due ? -1 : 1; }); return kd; }
// stamp what changed since the last snapshot; returns a short human summary of the changes
function stamp(kid, kd, R){ R = R || KR; var snaps = H.load(SNAP, {}) || {}, first = !snaps[kid], prev = snaps[kid] || {}, cur = R.rec(kd), now = Date.now(), meta = kd._sync = kd._sync || {m: {}, del: {}}, said = [];
  Object.keys(cur).forEach(function(id){ var a = JSON.stringify(cur[id]); if(prev[id] === undefined || JSON.stringify(prev[id]) !== a){ meta.m[id] = now; delete meta.del[id]; said.push(R.desc(id, cur[id], prev[id] === undefined)); } });
  Object.keys(prev).forEach(function(id){ if(cur[id] === undefined){ meta.del[id] = now; said.push(R.desc(id, prev[id], false, true)); } });
  snaps[kid] = cur; H.save(SNAP, snaps); return first ? [] : said.filter(Boolean); }
function describe(id, v, added, removed){ var c = id.slice(0, id.indexOf(":")), n = v && (v.n || v.t || "");
  if(c === "done") return removed ? "" : "✓ " + L("ditanda siap", "ticked done");
  if(c === "mood" || c === "play" || c === "s") return "";
  var ic = {ev: "📌", hw: "✏️", home: "🏠", forms: "📄", ach: "🏆", read: "📚", health: "🩺", fees: "🧾", tt: "🗓", mlog: "💰"}[c] || (c.indexOf("tk.") === 0 ? "📅" : "•");
  if(c === "tt") return added ? "🗓 " + L("jadual waktu dikemas kini", "timetable updated") : "";
  if(c === "hw" && v && v.done && !added) return "✅ " + n + " " + L("siap", "done");
  if(c === "forms" && v && v.signed && !added) return "✍️ " + n + " " + L("ditandatangan", "signed");
  return ic + " " + (removed ? L("dibuang: ", "removed: ") : added ? L("ditambah: ", "added: ") : L("diubah: ", "changed: ")) + n; }
function merge(kid, kd, rem, R){ R = R || KR; var snaps = H.load(SNAP, {}) || {}, loc = R.rec(kd), meta = kd._sync = kd._sync || {m: {}, del: {}}, rm = rem.meta || {m: {}, del: {}}, out = {}, ids = {}, news = 0;
  Object.keys(loc).concat(Object.keys(rem.recs || {})).forEach(function(id){ ids[id] = 1; });
  Object.keys(meta.del).concat(Object.keys(rm.del || {})).forEach(function(id){ ids[id] = 1; });
  Object.keys(ids).forEach(function(id){ var lm = meta.m[id] || 0, rmm = (rm.m || {})[id] || 0, dl = Math.max(meta.del[id] || 0, (rm.del || {})[id] || 0), useR = rem.recs && rem.recs[id] !== undefined && rmm > lm, v = useR ? rem.recs[id] : loc[id];
    if(v === undefined && rem.recs) v = rem.recs[id]; var m = Math.max(lm, rmm);
    if(dl && dl >= m){ meta.del[id] = dl; delete meta.m[id]; if(loc[id] !== undefined) news++; return; }
    if(v === undefined) return; out[id] = v; meta.m[id] = m; if(dl) meta.del[id] = dl; if(useR && JSON.stringify(loc[id]) !== JSON.stringify(v)) news++; });
  R.from(out, kd); kd._sync = meta; snaps[kid] = R.rec(kd); H.save(SNAP, snaps); return news; }
var KR = {rec: records, from: fromRecords, desc: describe};
// 0.7.72 (owner): channels: other things a family shares besides a child's planner (🐾 Pets first). A channel module registers
// {label, get(), put(data), rec(data), from(recs, data), desc(id, v, added, removed), reload(), open} with FamLink.channel(name, def).
var CH = {}, CHF = {pets: ["pets/petsync.js"]}, CHN = {pets: ["🐾 Haiwan peliharaan", "🐾 Pets"]};
function chNeed(name, fn){ if(CH[name]){ fn(CH[name]); return; } if(!CHF[name] || !H.loadJs) return; H.loadJs(CHF[name], function(){ if(CH[name]) fn(CH[name]); }, function(){}); }
function payloadCh(link, name, R){ var d = R.get(); stamp("ch:" + name, d, R); R.put(d); return {t: "ch", ch: name, recs: R.rec(d), meta: d._sync || {m: {}, del: {}}}; }

// ---------------- relays ----------------
function conn(link){ if(conns[link.id]) return conns[link.id]; var ws = [], seen = {}, alive = true, s = st();
  var me = s.me;
  var open1 = function(u){ var w; try{ w = new WebSocket(u); }catch(e){ return; } ws.push(w);
    w.onopen = function(){ try{ w.send(JSON.stringify(["REQ", "fl" + link.tag.slice(0, 8), {kinds: [KIND], "#t": [link.tag], since: Math.max(0, (link.last || link.made / 1000 | 0) - 120)}])); }catch(e){} if(!c.hi){ c.hi = 1; send(link, {t: "hello"}); } };
    w.onmessage = function(m){ var d; try{ d = JSON.parse(m.data); }catch(e){ return; } if(d[0] !== "EVENT" || !d[2] || seen[d[2].id]) return; seen[d[2].id] = 1; if(d[2].pubkey === me.pub) return; var o = unseal(link.key, d[2].content); if(o) receive(link, o, d[2].created_at); };
    w.onclose = function(){ ws = ws.filter(function(x){ return x !== w; }); if(alive) setTimeout(function(){ if(alive) open1(u); }, 5000); };
    w.onerror = function(){}; };
  var c = conns[link.id] = {ws: function(){ return ws; }, seen: seen, live: function(){ return ws.filter(function(w){ return w.readyState === 1; }).length; }, stop: function(){ alive = false; ws.forEach(function(w){ try{ w.close(); }catch(e){} }); delete conns[link.id]; }};
  RELAYS.forEach(open1); return c; }
function send(link, o){ var s = st(), me = s.me, c = conns[link.id]; o.from = s.me.name || L("Ibu bapa", "Parent"); o.v = 1;
  var e = {pubkey: me.pub, created_at: Math.floor(Date.now() / 1000), kind: KIND, tags: [["t", link.tag]], content: seal(link.key, o)};
  e.id = sha(JSON.stringify([0, e.pubkey, e.created_at, e.kind, e.tags, e.content])); e.sig = hex(K.schnorr.sign(unhex(e.id), unhex(me.sk)));
  if(c) c.seen[e.id] = 1; var n = 0; if(c) c.ws().forEach(function(w){ if(w.readyState === 1) try{ w.send(JSON.stringify(["EVENT", e])); n++; }catch(x){} });
  if(!n){ (pending[link.id] = pending[link.id] || []).push(e); setTimeout(function(){ flush(link); }, 4000); } return n; }
function flush(link){ var c = conns[link.id], q = pending[link.id]; if(!c || !q || !q.length || !c.live()) { if(q && q.length) setTimeout(function(){ flush(link); }, 6000); return; } pending[link.id] = []; q.forEach(function(e){ c.ws().forEach(function(w){ if(w.readyState === 1) try{ w.send(JSON.stringify(["EVENT", e])); }catch(x){} }); }); }
// the child's planner for the other phone (records + when each changed); School progress if shared
function payload(link, sid){ var m = link.kids[sid], A = H.load("ihsan_kplan", {}) || {}, kd = A[m.local], o = {t: "plan", sid: sid};
  if(m.plan !== false && kd){ stamp(m.local, kd); A[m.local] = kd; H.save("ihsan_kplan", A); var r = records(kd); o.recs = r; o.meta = kd._sync || {m: {}, del: {}}; }
  if(m.learn !== false && H.kidProg){ try{ o.prog = H.kidProg(m.local); }catch(e){} }
  return o; }
function receive(link, o, at){ var s = st(), L0 = s.links.filter(function(x){ return x.id === link.id; })[0]; if(!L0) return; link = L0;
  if(at && at > (link.last || 0)){ link.last = at; saveSt(s); }
  if(o.from && link.peer !== o.from){ link.peer = o.from; saveSt(s); }
  if(o.t === "hello"){ Object.keys(link.kids).forEach(function(sid){ send(link, payload(link, sid)); }); Object.keys(link.ch || {}).forEach(function(n){ if(link.ch[n]) chNeed(n, function(R){ send(link, payloadCh(link, n, R)); }); }); if(o.kids) adopt(link, o.kids); return; }
  if(o.t === "ch"){ if(!link.ch || !link.ch[o.ch]) return; chNeed(o.ch, function(R){ var d = R.get(), news = merge("ch:" + o.ch, d, o, R); R.put(d);
      if(o.said && o.said.length && link.notify !== false) notify(link, null, o.said.join(" · "), false, R.open); if(news && R.reload) R.reload(); }); return; }
  if(o.t === "plan"){ var m = link.kids[o.sid]; if(!m || !m.local) return; var A = H.load("ihsan_kplan", {}) || {}, kd = A[m.local] || {}, news = 0;
    if(o.recs && m.plan !== false){ news = merge(m.local, kd, o); A[m.local] = kd; H.save("ihsan_kplan", A); }
    if(o.prog && m.learn !== false){ var P = H.load("ihsan_famprog", {}) || {}; P[m.local] = {t: Date.now(), who: link.peer || "", s: String(o.prog).slice(0, 300)}; H.save("ihsan_famprog", P); }
    if(o.said && o.said.length && link.notify !== false) notify(link, m.local, o.said.join(" · "));
    if(news && window.KPlan && KPlan.reload) KPlan.reload(); return; }
  if(o.t === "chnudge"){ if(link.ch && link.ch[o.ch] && link.notify !== false) notify(link, null, "🔔 " + o.text, true, CH[o.ch] && CH[o.ch].open); return; }
  if(o.t === "nudge"){ var m2 = link.kids[o.sid]; if(link.notify !== false) notify(link, m2 && m2.local, /^💬/.test(o.text) ? o.text : "🔔 " + o.text, true); return; } }
function notify(link, local, text, urgent, open){ var who = (link.peer || L("Keluarga", "Family")) + (local ? " · " + kidName(local) : ""), id = "fl" + uid();
  H.toast("👨‍👩‍👧 " + who + ": " + String(text).slice(0, 120));
  if(H.xrem) try{ H.xrem(id, Date.now() + 1500, "👨‍👩‍👧 " + who, String(text).slice(0, 180), open || "side:learn/sekolah", !!urgent); }catch(e){}
  var log = H.load("ihsan_famlog", []) || []; log.unshift({t: Date.now(), who: who, text: text}); H.save("ihsan_famlog", log.slice(0, 60)); }

// ---------------- public ----------------
function start(h){ H = h || H; var s = H.load(STORE, null); if(!s || !s.links || !s.links.length) return; need(function(){ st().links.forEach(function(l){ conn(l); }); started = true; }); }
function changed(kid, kd){ if(!H) return; var s = H.load(STORE, null); if(!s || !s.links || !s.links.length) return;
  var links = s.links.filter(function(l){ return Object.keys(l.kids).some(function(sid){ return l.kids[sid].local === kid; }); }); if(!links.length) return;
  need(function(){ var said = stamp(kid, kd), A = H.load("ihsan_kplan", {}) || {}; A[kid] = kd; H.save("ihsan_kplan", A);
    clearTimeout(sendT[kid]); sendT[kid] = setTimeout(function(){ links.forEach(function(l){ conn(l); Object.keys(l.kids).forEach(function(sid){ if(l.kids[sid].local !== kid) return; var p = payload(l, sid); p.said = said.slice(0, 4); send(l, p); }); }); }, 1200); }); }
function chChanged(name, d){ if(!H) return; var s = H.load(STORE, null); if(!s || !s.links) return; var links = s.links.filter(function(l){ return l.ch && l.ch[name]; }); if(!links.length) return;
  need(function(){ chNeed(name, function(R){ d = d || R.get(); var said = stamp("ch:" + name, d, R); R.put(d);
    clearTimeout(sendT["ch:" + name]); sendT["ch:" + name] = setTimeout(function(){ links.forEach(function(l){ conn(l); var p = payloadCh(l, name, R); p.said = said.slice(0, 4); send(l, p); }); }, 1200); }); }); }
function chLinked(name){ var s = H && H.load(STORE, null); return !!(s && s.links && s.links.some(function(l){ return l.ch && l.ch[name]; })); }
function nudge(kid, text){ var s = st(); s.links.forEach(function(l){ Object.keys(l.kids).forEach(function(sid){ if(l.kids[sid].local === kid){ conn(l); send(l, {t: "nudge", sid: sid, text: text}); } }); }); H.toast("🔔 " + L("Dihantar", "Sent")); }
function linked(kid){ var s = H && H.load(STORE, null); return !!(s && s.links && s.links.some(function(l){ return !kid || Object.keys(l.kids).some(function(sid){ return l.kids[sid].local === kid; }); })); }
// invite: the code carries the key, my name and the children I share (their ids become shared ids)
function makeInvite(kidIds, chans){ chans = chans || []; var s = st(), key = hex(K.randomBytes(32)), link = {id: uid(), key: key, tag: sha("myihsan-fam:" + key).slice(0, 32), peer: "", kids: {}, ch: {}, notify: true, last: 0, made: Date.now()}; chans.forEach(function(c){ link.ch[c] = true; });
  kidIds.forEach(function(id){ link.kids[id] = {local: id, plan: true, learn: true}; }); s.links.push(link); saveSt(s); conn(link);
  var ks = kidIds.map(function(id){ var k = kids().filter(function(x){ return x.id === id; })[0] || {}; return {sid: id, n: k.n || "", e: k.e || ""}; });
  return {link: link, code: "MYIHSAN-FAM:" + b64(K.utf8ToBytes(JSON.stringify({k: key, n: s.me.name || "", kids: ks, ch: chans})))}; }
function readInvite(code){ var i = String(code).indexOf("MYIHSAN-FAM:"); if(i < 0) return null; try{ return JSON.parse(new TextDecoder().decode(unb64(String(code).slice(i + 12).trim().split(/\s/)[0]))); }catch(e){ return null; } }
function adopt(link, list){ /* the other side's child list can arrive in hello; nothing to do yet */ }

function open(h, kidHint){ H = h || H; need(function(){ sheet(kidHint); }); }
function sheet(kidHint){ var s = st(), ks = kids(), h = "";
  h += '<label class="small" for="flMe">' + L("Nama saya (dilihat oleh keluarga)", "My name (seen by family)") + '</label><input id="flMe" class="rin" value="' + E(s.me.name) + '" placeholder="' + L("cth. Ummi, Ayah, Tok", "e.g. Ummi, Ayah, Grandma") + '">';
  h += '<div class="snl" style="margin:12px 2px 6px">🔗 ' + L("Dipautkan dengan", "Linked with") + '</div>';
  if(!s.links.length) h += '<div class="mut small">' + L("Belum ada. Pautkan pasangan, datuk nenek atau penjaga untuk berkongsi perancang anak dan saling memaklumkan.", "None yet. Link your spouse, a grandparent or a carer to share the children's planners and notify each other.") + '</div>';
  s.links.forEach(function(l){ var c = conns[l.id], live = c ? c.live() : 0;
    h += '<div class="card" style="margin:6px 0;padding:10px"><div class="row" style="justify-content:space-between;align-items:center"><b>👤 ' + E(l.peer || L("Menunggu pautan…", "Waiting to link…")) + '</b><span class="mut tiny">' + (live ? "🟢 " + L("dalam talian", "online") : "⚪ " + L("luar talian", "offline")) + '</span></div>' +
      Object.keys(l.kids).map(function(sid){ var m = l.kids[sid]; return '<div class="small" style="margin-top:6px"><b>' + E(kidName(m.local) || "?") + '</b> <label><input type="checkbox" data-flp="' + l.id + '|' + sid + '"' + (m.plan !== false ? ' checked' : '') + '> ' + L("perancang", "planner") + '</label> <label><input type="checkbox" data-fll="' + l.id + '|' + sid + '"' + (m.learn !== false ? ' checked' : '') + '> ' + L("kemajuan", "progress") + '</label>' + (function(){ var P = (H.load("ihsan_famprog", {}) || {})[m.local]; return P ? '<div class="mut tiny">📊 ' + E(P.s) + '</div>' : ''; })() + '</div>'; }).join("") +
      Object.keys(CHN).map(function(c){ return '<label class="small" style="display:block;margin-top:6px"><input type="checkbox" data-flch="' + l.id + '|' + c + '"' + (l.ch && l.ch[c] ? ' checked' : '') + '> ' + L(CHN[c][0], CHN[c][1]) + '</label>'; }).join("") +
      '<label class="small" style="display:block;margin-top:6px"><input type="checkbox" data-fln="' + l.id + '"' + (l.notify !== false ? ' checked' : '') + '> 🔔 ' + L("Makluman daripada mereka", "Notifications from them") + '</label>' +
      '<div class="btns" style="margin-top:6px"><button class="chip" data-flsync="' + l.id + '">🔄 ' + L("Segerak sekarang", "Sync now") + '</button><button class="chip" data-flx="' + l.id + '">✕ ' + L("Nyahpaut", "Unlink") + '</button></div></div>'; });
  if(s.links.length && kidHint && !CHN[kidHint]) h += '<div class="snl" style="margin:12px 2px 6px">💬 ' + L("Mesej kepada keluarga tentang ", "Message the family about ") + E(kidName(kidHint)) + '</div><div class="row" style="gap:6px"><input id="flMsg" class="rin" style="flex:1" maxlength="160" placeholder="' + L("cth. Jangan lupa baju sukan esok", "e.g. Don't forget the PE kit tomorrow") + '"><button class="btn gold g3d" id="flSend">➤</button></div>';
  h += '<div class="btns" style="margin-top:10px"><button class="btn gold g3d" id="flNew">＋ ' + L("Pautkan ibu bapa / penjaga", "Link a parent / carer") + '</button><button class="btn alt g3d" id="flJoin">📥 ' + L("Masuk dengan kod", "Join with a code") + '</button></div>';
  var log = H.load("ihsan_famlog", []) || []; if(log.length) h += '<div class="snl" style="margin:12px 2px 6px">🔔 ' + L("Terkini", "Recent") + '</div>' + log.slice(0, 8).map(function(x){ return '<div class="small" style="padding:4px 0;border-bottom:1px solid var(--line)"><b>' + E(x.who) + '</b> · ' + E(x.text) + ' <span class="mut tiny">' + E(new Date(x.t).toLocaleString()) + '</span></div>'; }).join("");
  h += '<div class="mut tiny" style="margin-top:10px;line-height:1.45">🔒 ' + L("Disulitkan hujung ke hujung. Tiada akaun. Data hanya di telefon anda dan telefon yang dipautkan; geganti awam hanya melihat data bercelaru. Gambar kekal di telefon yang mengambilnya. Kemas kini sampai bila aplikasi dibuka.", "End-to-end encrypted. No account. The data lives only on your phone and the linked phones; the public relays see only scrambled data. Photos stay on the phone that took them. Updates arrive when the app is open.") + '</div>';
  var ov = H.showSheet("👨‍👩‍👧 " + L("Pautan keluarga", "Family link"), h);
  var fs = ov.querySelector("#flSend"); if(fs) fs.onclick = function(){ var t = ov.querySelector("#flMsg").value.trim(); if(!t) return; nudge(kidHint, "💬 " + t); ov.querySelector("#flMsg").value = ""; var lg = H.load("ihsan_famlog", []) || []; lg.unshift({t: Date.now(), who: L("Saya", "Me") + " · " + kidName(kidHint), text: t}); H.save("ihsan_famlog", lg.slice(0, 60)); };
  var me = ov.querySelector("#flMe"); me.onchange = function(){ var s2 = st(); s2.me.name = me.value.trim(); saveSt(s2); };
  var upd = function(attr, fn){ ov.querySelectorAll("[" + attr + "]").forEach(function(b){ b.onchange = function(){ var p = b.getAttribute(attr).split("|"), s2 = st(), l = s2.links.filter(function(x){ return x.id === p[0]; })[0]; if(l){ fn(l, p[1], b.checked); saveSt(s2); } }; }); };
  upd("data-flp", function(l, sid, v){ l.kids[sid].plan = v; }); upd("data-fll", function(l, sid, v){ l.kids[sid].learn = v; }); upd("data-fln", function(l, sid, v){ l.notify = v; }); upd("data-flch", function(l, c, v){ l.ch = l.ch || {}; l.ch[c] = v; if(v) setTimeout(function(){ chNeed(c, function(R){ conn(l); send(l, payloadCh(l, c, R)); }); }, 300); });
  ov.querySelectorAll("[data-flsync]").forEach(function(b){ b.onclick = function(){ var l = st().links.filter(function(x){ return x.id === b.getAttribute("data-flsync"); })[0]; if(!l) return; conn(l); send(l, {t: "hello"}); Object.keys(l.kids).forEach(function(sid){ send(l, payload(l, sid)); }); Object.keys(l.ch || {}).forEach(function(c){ if(l.ch[c]) chNeed(c, function(R){ send(l, payloadCh(l, c, R)); }); }); H.toast("🔄 " + L("Dihantar", "Sent")); }; });
  ov.querySelectorAll("[data-flx]").forEach(function(b){ b.onclick = function(){ var s2 = st(), id = b.getAttribute("data-flx"); s2.links = s2.links.filter(function(x){ return x.id !== id; }); saveSt(s2); if(conns[id]) conns[id].stop(); H.closeOverlay(); sheet(kidHint); }; });
  ov.querySelector("#flNew").onclick = function(){ var nm = me.value.trim(); if(!nm){ H.toast(L("Tulis nama anda dahulu", "Type your name first")); me.focus(); return; } var s2 = st(); s2.me.name = nm; saveSt(s2);
    var ov2 = H.showSheet("＋ " + L("Kongsi anak mana?", "Share which children?"), (ks.length ? ks.map(function(k){ return '<label class="small" style="display:block;margin:6px 0"><input type="checkbox" data-flk="' + E(k.id) + '"' + (kidHint !== "pets" && (!kidHint || kidHint === k.id) ? ' checked' : '') + '> ' + E((k.e || "") + " " + k.n) + '</label>'; }).join("") : '<div class="mut small">' + L("Tiada anak lagi (tambah di Sekolah).", "No children yet (add them in School).") + '</div>') +
      Object.keys(CHN).map(function(c){ return '<label class="small" style="display:block;margin:8px 0 6px"><input type="checkbox" data-flc="' + c + '"' + (kidHint === c ? ' checked' : '') + '> <b>' + L(CHN[c][0], CHN[c][1]) + '</b> <span class="mut tiny">' + L("semua haiwan, jadual, kesihatan", "all pets, schedules, health") + '</span></label>'; }).join("") + '<button class="btn gold full g3d" id="flMk">' + L("Buat kod jemputan", "Make the invite code") + '</button>');
    ov2.querySelector("#flMk").onclick = function(){ var ids = [].slice.call(ov2.querySelectorAll("[data-flk]:checked")).map(function(x){ return x.getAttribute("data-flk"); }), chs = [].slice.call(ov2.querySelectorAll("[data-flc]:checked")).map(function(x){ return x.getAttribute("data-flc"); }); if(!ids.length && !chs.length){ H.toast(L("Pilih sekurang-kurangnya satu", "Pick at least one")); return; } var inv = makeInvite(ids, chs), qr = "";
      try{ var q = K.qrcode(0, "L"); q.addData(inv.code); q.make(); qr = q.createSvgTag({cellSize: 3, margin: 2}); }catch(e){}
      var ov3 = H.showSheet("🔗 " + L("Kod jemputan", "Invite code"), '<div class="small" style="line-height:1.5">' + L("Hantar kod ini kepada pasangan anda (cth. WhatsApp). Di telefon mereka: Sekolah › anak › Perancang › 👨‍👩‍👧 › Masuk dengan kod.", "Send this code to your spouse (e.g. WhatsApp). On their phone: School › a child › Planner › 👨‍👩‍👧 › Join with a code.") + '</div>' + (qr ? '<div style="background:#fff;padding:8px;border-radius:12px;margin:10px auto;width:max-content;max-width:100%">' + qr + '</div>' : '') + '<textarea class="rin" rows="3" readonly id="flCode">' + E(inv.code) + '</textarea><div class="btns"><button class="btn gold g3d" id="flShare">📤 ' + L("Kongsi", "Share") + '</button><button class="btn alt g3d" id="flCopy">⧉ ' + L("Salin", "Copy") + '</button></div><div class="mut tiny">' + L("Sesiapa yang ada kod ini boleh melihat anak yang dikongsi. Kongsi dengan keluarga sahaja.", "Anyone with this code can see the shared children. Share it with family only.") + '</div>');
      var txt = L("Pautan keluarga My Ihsan untuk ", "My Ihsan family link for ") + ids.map(kidName).concat(chs.map(function(c){ return L(CHN[c][0], CHN[c][1]); })).join(", ") + "\n" + inv.code;
      ov3.querySelector("#flShare").onclick = function(){ if(H.share) H.share(txt); }; ov3.querySelector("#flCopy").onclick = function(){ try{ if(H.N && H.N.copyText) H.N.copyText(inv.code); else navigator.clipboard.writeText(inv.code); }catch(e){} H.toast(L("Disalin", "Copied")); }; }; };
  ov.querySelector("#flJoin").onclick = function(){ var nm = me.value.trim(); if(!nm){ H.toast(L("Tulis nama anda dahulu", "Type your name first")); me.focus(); return; } var s2 = st(); s2.me.name = nm; saveSt(s2);
    var ov2 = H.showSheet("📥 " + L("Masuk dengan kod", "Join with a code"), '<textarea id="flIn" class="rin" rows="4" placeholder="MYIHSAN-FAM:…"></textarea><button class="btn gold full g3d" id="flRead">' + L("Seterusnya", "Next") + '</button>');
    ov2.querySelector("#flRead").onclick = function(){ var inv = readInvite(ov2.querySelector("#flIn").value); if(!inv || !inv.k){ H.toast(L("Kod tidak sah", "Not a valid code")); return; }
      var opts = function(sel){ return '<option value="+">＋ ' + L("Tambah sebagai anak baharu", "Add as a new child") + '</option>' + ks.map(function(k){ return '<option value="' + E(k.id) + '"' + (sel === k.id ? ' selected' : '') + '>' + E((k.e || "") + " " + k.n) + '</option>'; }).join(""); };
      var ov3 = H.showSheet("👨‍👩‍👧 " + E(inv.n || L("Keluarga", "Family")), ((inv.ch || []).length ? '<div class="small" style="margin-bottom:8px">' + L("Dikongsi: ", "Shared: ") + inv.ch.map(function(c){ return CHN[c] ? L(CHN[c][0], CHN[c][1]) : c; }).join(", ") + '</div>' : '') + (inv.kids.length ? '<div class="small" style="margin-bottom:8px">' + L("Padankan setiap anak dengan anak di telefon ini:", "Match each child with a child on this phone:") + '</div>' : '') + inv.kids.map(function(k, i){ var same = ks.filter(function(x){ return x.n.toLowerCase() === String(k.n).toLowerCase(); })[0]; return '<label class="small" style="display:block;margin:6px 0">' + E((k.e || "") + " " + k.n) + ' →</label><select class="rin" data-flm="' + i + '">' + opts(same ? same.id : "+") + '</select>'; }).join("") + '<button class="btn gold full g3d" id="flGo">✓ ' + L("Pautkan", "Link") + '</button>');
      ov3.querySelector("#flGo").onclick = function(){ var s3 = st(), link = {id: uid(), key: inv.k, tag: sha("myihsan-fam:" + inv.k).slice(0, 32), peer: inv.n || "", kids: {}, ch: {}, notify: true, last: 0, made: Date.now()}; (inv.ch || []).forEach(function(c){ link.ch[c] = true; });
        inv.kids.forEach(function(k, i){ var v = ov3.querySelector('[data-flm="' + i + '"]').value, local = v; if(v === "+" && H.addKid) local = H.addKid(k.n, k.e); if(local && local !== "+") link.kids[k.sid] = {local: local, plan: true, learn: true}; });
        s3.links.push(link); saveSt(s3); conn(link); H.closeOverlay(); H.toast("✓ " + L("Dipautkan. Data akan disegerak sebentar lagi.", "Linked. The data will sync in a moment."));
        setTimeout(function(){ send(link, {t: "hello"}); }, 2500); if(H.refresh) setTimeout(H.refresh, 3500); }; }; }; }

window.FamLink = {_h: function(){ return H; }, start: start, open: open, changed: changed, nudge: nudge, linked: linked, channel: function(n, d){ CH[n] = d; }, chChanged: chChanged, chLinked: chLinked, chNudge: function(n, text){ var s = st(); s.links.forEach(function(l){ if(l.ch && l.ch[n]){ conn(l); send(l, {t: "chnudge", ch: n, text: text}); } }); H.toast("🔔 " + L("Dihantar", "Sent")); }, _t: {records: records, fromRecords: fromRecords, stamp: stamp, merge: merge, readInvite: readInvite, makeInvite: function(ids){ return makeInvite(ids); }, receive: function(l, o){ receive(l, o); }, payload: payload, conns: conns}};
})();
