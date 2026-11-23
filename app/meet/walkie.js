/* My Ihsan 0.7.13 (owner: "walkie-talkie in Meeting — options for all: Wi-Fi or internet, anyone or host, small to big"):
   Masa › Mesyuarat › 📻 Walkie. Push-to-talk channels; one person talks at a time.
   - 📶 Wi-Fi / hotspot (no internet, app only): one phone HOSTS (native WalkieKit: TCP hub, live voice, runs with the screen off,
     Talk button in the notification, nearby channels found automatically, browsers can listen at http://ip:port/?k=CODE).
   - 🌐 Internet (anywhere, also the web app): free public Nostr relays (the same as Groups / the live class quiz), ephemeral
     events (kind 20779, not stored), AES-GCM with a key made from the channel code. Voice goes as Opus chunks (~0.6 s) and plays
     almost live (MediaSource); the last talks can be replayed. Keep the app open (screen on) while in an internet channel.
   - Who talks: 🗣 Anyone (first come, one at a time) or 👑 Host gives turns (raise hand ✋, host gives / takes back the turn,
     mutes or removes; the host can always cut in). Talk-time limit per press. Hold or tap to talk; volume keys can talk too.
   Data: ihsan_wt {me:{id,sk,pub}, name, set:{hold,keys,beep,bt,loud,max}, recent:[…]}. Walkie.view(el, H) (H = meetH()). */
(function(){ "use strict";
var H = null, EL = null, KIND = 20779, RELAYS = window.WT_RELAYS || ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net"];
var W = window.__wt || (window.__wt = {on:false, list:[], near:[], hist:[], log:[], lv:[]});
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function N(){ return H.N || window.Native || {}; }
function K(){ return window.NostrKit; }
function app(){ return !!N().wtStart; }
function st(){ var d = H.load("ihsan_wt", null) || {}; d.set = d.set || {}; var s = d.set; if(s.hold == null) s.hold = true; if(s.beep == null) s.beep = true; if(s.loud == null) s.loud = true; if(!s.max) s.max = 60; d.recent = d.recent || []; return d; }
function sv(d){ H.save("ihsan_wt", d); }
function meId(){ var d = st(); if(!d.me || !d.me.sk){ var k = K(), sk = k.schnorr.utils.randomPrivateKey(); d.me = {sk: k.bytesToHex(sk), pub: k.bytesToHex(k.schnorr.getPublicKey(sk))}; d.me.id = d.me.pub.slice(0, 16); sv(d); } return d.me; }
function pad(n){ return ("0" + n).slice(-2); }
function mmss(s){ s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + pad(s % 60); }
function code8(){ var A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789", s = "", r = K().randomBytes(8); for(var i = 0; i < 8; i++) s += A[r[i] % A.length]; return s.slice(0, 4) + "-" + s.slice(4); }
function pin6(){ var r = K().randomBytes(3); return String(100000 + ((r[0] << 16 | r[1] << 8 | r[2]) % 900000)); }
function normCode(c){ c = String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); return c.length === 8 ? c.slice(0, 4) + "-" + c.slice(4) : c; }
function withKit(cb){ if(K()) cb(); else H.loadJs(["groups/nostrkit.js"], cb, function(){ H.toast(L("Gagal dimuatkan", "Could not load")); }); }

// ---------------------------------------------------------------- page
function view(el, h){ H = h; EL = el; withKit(function(){ evOnce(); if(W.on && W.net === "wifi" && app()) syncNative(); draw(); keysWatch(); if(window.__wtLink){ var c = window.__wtLink; window.__wtLink = null; if(!W.on) joinSheet({net:"net", code:normCode(c)}); } }); }
function draw(){ if(!EL || !document.body.contains(EL)) return; if(W.on) room(); else home(); }
function home(){ var d = st(), wifiOk = app();
  var h = '<div class="card wtHero"><div class="wtBig">📻</div><div><h3>' + L("Walkie-talkie", "Walkie-talkie") + '</h3><div class="mut small">' + L("Tekan untuk bercakap, seorang pada satu masa. Di Wi-Fi yang sama (tanpa internet) atau melalui internet ke mana-mana.", "Push to talk, one person at a time. On the same Wi-Fi (no internet) or over the internet to anywhere.") + '</div></div></div>' +
    '<div class="grp2"><button class="btn gold g3d" id="wtNew">＋ ' + L("Buat saluran", "Create a channel") + '</button><button class="btn alt g3d" id="wtJoin">🔗 ' + L("Sertai", "Join") + '</button></div>';
  if(wifiOk) h += '<div class="card"><h3>📶 ' + L("Saluran berdekatan", "Nearby channels") + ' <span class="mut small">Wi-Fi</span></h3>' + (W.near.length ? W.near.map(function(x, i){ return '<button class="card wtRow" data-near="' + i + '"><span class="wtIc">📻</span><span><b>' + E(x.ch) + '</b><small class="mut">' + (x.mode === "host" ? "👑 " + L("Hos beri giliran", "Host gives turns") : "🗣 " + L("Sesiapa", "Anyone")) + ' · 👥 ' + (x.n || 1) + ' · ' + E(x.ip) + '</small></span><span class="wtGo">›</span></button>'; }).join("") : '<div class="mut small">' + L("Mencari di Wi-Fi ini… Saluran yang dibuat di Wi-Fi atau hotspot yang sama akan muncul di sini.", "Looking on this Wi-Fi… Channels made on the same Wi-Fi or hotspot show here.") + '</div>') + '</div>';
  if(d.recent.length) h += '<div class="card"><h3>🕘 ' + L("Baru-baru ini", "Recent") + '</h3>' + d.recent.map(function(r, i){ return '<button class="card wtRow" data-rec="' + i + '"><span class="wtIc">' + (r.net === "wifi" ? "📶" : "🌐") + '</span><span><b>' + E(r.ch) + '</b><small class="mut">' + (r.host ? "👑 " + L("Hos", "Host") + " · " : "") + E(r.net === "wifi" ? (r.ip ? r.ip + ":" + r.port : "Wi-Fi") : r.code) + '</small></span><span class="wtGo">›</span></button>'; }).join("") + '</div>';
  h += tips();
  EL.innerHTML = h;
  EL.querySelector("#wtNew").onclick = createSheet; EL.querySelector("#wtJoin").onclick = function(){ joinSheet(); };
  EL.querySelectorAll("[data-near]").forEach(function(b){ b.onclick = function(){ var x = W.near[+b.getAttribute("data-near")]; joinSheet({net:"wifi", ip:x.ip, port:x.port, ch:x.ch}); }; });
  EL.querySelectorAll("[data-rec]").forEach(function(b){ b.onclick = function(){ var r = st().recent[+b.getAttribute("data-rec")]; if(r.host) createSheet(r); else joinSheet(r); }; });
  if(wifiOk) try{ N().wtScan(true); }catch(e){} }
function tips(){ return '<details class="card mtTips"><summary><b>💡 ' + L("Cara guna", "How it works") + '</b></summary>' + [
  ["📶", L("Wi-Fi / hotspot", "Wi-Fi / hotspot"), L("Tanpa internet. Semua telefon pada Wi-Fi yang sama, atau sambung ke hotspot telefon hos. Suara langsung, berfungsi walaupun skrin tutup. Sesuai untuk dewan, majlis, rombongan, masjid. Sehingga 80 telefon; orang tanpa aplikasi boleh mendengar dalam pelayar.", "No internet. Every phone on the same Wi-Fi, or joined to the host phone's hotspot. Live voice, works with the screen off. For halls, events, trips, the masjid. Up to 80 phones; people without the app can listen in a browser.")],
  ["🌐", L("Internet", "Internet"), L("Di mana-mana, melalui geganti percuma (disulitkan). Suara dalam ketulan pendek, hampir langsung (lewat ~1–2 s). Biarkan aplikasi terbuka. Tiada had saiz kumpulan.", "Anywhere, through free relays (encrypted). Voice in short chunks, almost live (~1–2 s behind). Keep the app open. No group size limit.")],
  ["🗣", L("Sesiapa boleh bercakap", "Anyone can talk"), L("Siapa tekan dahulu dapat giliran. Yang lain dengar bunyi 'sibuk'.", "Whoever presses first gets the turn. Others hear a 'busy' beep.")],
  ["👑", L("Hos beri giliran", "Host gives turns"), L("Untuk kumpulan besar: ahli angkat tangan ✋, hos beri atau tarik balik giliran, senyapkan atau keluarkan. Hos sentiasa boleh mencelah.", "For big groups: members raise a hand ✋, the host gives or takes back turns, mutes or removes. The host can always cut in.")],
  ["🔉", L("Butang kelantangan", "Volume keys"), L("Hidupkan dalam Pilihan: tekan dan tahan butang kelantangan untuk bercakap.", "Turn on in Options: hold a volume key to talk.")]].map(function(x){ return '<div class="mtTip"><span>' + x[0] + '</span><div><b>' + E(x[1]) + '</b><small>' + E(x[2]) + '</small></div></div>'; }).join("") + '</details>'; }

function seg(name, opts, cur){ return '<div class="rseg wtSeg" data-sg="' + name + '">' + opts.map(function(o){ return '<button class="chip' + (cur === o[0] ? ' on' : '') + '" data-v="' + o[0] + '"' + (o[2] ? ' disabled' : '') + '>' + o[1] + '</button>'; }).join("") + '</div>'; }
function segBind(ov, S){ ov.querySelectorAll("[data-sg]").forEach(function(g){ g.querySelectorAll("[data-v]").forEach(function(b){ b.onclick = function(){ S[g.getAttribute("data-sg")] = b.getAttribute("data-v"); g.querySelectorAll("[data-v]").forEach(function(y){ y.classList.toggle("on", y === b); }); if(S._chg) S._chg(); }; }); }); }
function createSheet(pre){ pre = pre || {}; var d = st(), S = {net: pre.net || (app() ? "wifi" : "net"), mode: pre.mode || "open", max: String(d.set.max || 60)};
  var ov = H.showSheet("＋ " + L("Saluran walkie-talkie baharu", "New walkie-talkie channel"),
    '<input id="wcC" class="rin" placeholder="' + E(L("Nama saluran (cth. Rombongan Umrah)", "Channel name (e.g. Umrah group)")) + '" value="' + E(pre.ch || "") + '">' +
    '<input id="wcN" class="rin" style="margin-top:8px" placeholder="' + E(L("Nama anda", "Your name")) + '" value="' + E(d.name || "") + '">' +
    '<div class="mtQh">' + L("Sambungan", "Connection") + '</div>' + seg("net", [["wifi", "📶 " + L("Wi-Fi / hotspot", "Wi-Fi / hotspot"), !app()], ["net", "🌐 Internet"]], S.net) +
    '<div class="mut small" id="wcNetTx"></div>' +
    '<div class="mtQh">' + L("Siapa boleh bercakap", "Who can talk") + '</div>' + seg("mode", [["open", "🗣 " + L("Sesiapa", "Anyone")], ["host", "👑 " + L("Hos beri giliran", "Host gives turns")]], S.mode) +
    '<div class="mut small" id="wcModeTx"></div>' +
    '<div class="mtQh">' + L("Had masa bercakap setiap kali", "Talk-time limit per press") + '</div>' + seg("max", [["30", "30 s"], ["60", "1 min"], ["120", "2 min"], ["300", "5 min"]], S.max) +
    (app() ? '<label class="pdchk" style="margin-top:8px"><input type="checkbox" id="wcBt"' + (d.set.bt ? ' checked' : '') + '> 🎧 ' + L("Guna earbud Bluetooth (mikrofon dan bunyi) · Wi-Fi", "Use Bluetooth earbuds (mic and sound) · Wi-Fi") + '</label>' : '') +
    '<button class="btn gold full g3d" id="wcGo" style="margin-top:12px">▶ ' + L("Mula saluran", "Start the channel") + '</button>');
  var tx = function(){ ov.querySelector("#wcNetTx").textContent = S.net === "wifi" ? L("Tanpa internet. Yang lain sertai Wi-Fi anda atau hotspot telefon ini. Sehingga 80 telefon.", "No internet. Others join your Wi-Fi or this phone's hotspot. Up to 80 phones.") : L("Di mana-mana. Semua perlukan internet dan aplikasi terbuka. Tiada had saiz.", "Anywhere. Everyone needs internet and the app open. No size limit.");
    ov.querySelector("#wcModeTx").textContent = S.mode === "host" ? L("Sesuai untuk kumpulan besar, kelas, majlis. Ahli angkat tangan; anda beri giliran.", "Best for big groups, classes, events. Members raise a hand; you give turns.") : L("Sesuai untuk kumpulan kecil, keluarga, rakan. Siapa tekan dahulu bercakap.", "Best for small groups, family, friends. Whoever presses first talks."); };
  S._chg = tx; tx(); segBind(ov, S);
  ov.querySelector("#wcGo").onclick = function(){ var ch = ov.querySelector("#wcC").value.trim() || L("Saluran", "Channel") + " " + new Date().toLocaleTimeString([], {hour:"numeric", minute:"2-digit"}), nm = ov.querySelector("#wcN").value.trim();
    if(!nm){ H.toast(L("Tulis nama anda", "Type your name")); ov.querySelector("#wcN").focus(); return; }
    var dd = st(); dd.name = nm; dd.set.max = +S.max; if(ov.querySelector("#wcBt")) dd.set.bt = ov.querySelector("#wcBt").checked; sv(dd); H.closeOverlay();
    if(S.net === "wifi") wifiHost(ch, S.mode, pre.key); else netStart({ch:ch, code:pre.code || code8(), host:true, mode:S.mode}); }; }
function joinSheet(pre){ pre = pre || {}; var d = st(), S = {net: pre.net || (app() ? "wifi" : "net")};
  var ov = H.showSheet("🔗 " + L("Sertai saluran", "Join a channel"),
    '<input id="wjN" class="rin" placeholder="' + E(L("Nama anda", "Your name")) + '" value="' + E(d.name || "") + '">' +
    '<button class="btn gold full g3d" id="wjQ" style="margin-top:10px">📷 ' + L("Imbas QR saluran", "Scan the channel QR") + '</button>' +
    '<div class="mtQh">' + L("Atau taip", "Or type it") + '</div>' + seg("net", [["wifi", "📶 Wi-Fi", !app()], ["net", "🌐 Internet"]], S.net) +
    '<div id="wjWifi"><input id="wjA" class="rin" style="margin-top:8px" inputmode="decimal" placeholder="' + E(L("Alamat, cth. 192.168.43.1:8790", "Address, e.g. 192.168.43.1:8790")) + '" value="' + E(pre.ip ? pre.ip + ":" + (pre.port || 8790) : "") + '">' +
    '<input id="wjP" class="rin" style="margin-top:8px" inputmode="numeric" maxlength="6" placeholder="' + E(L("Kod 6 digit", "6-digit code")) + '" value="' + E(pre.key || "") + '"></div>' +
    '<div id="wjNet"><input id="wjC" class="rin" style="margin-top:8px;text-transform:uppercase" maxlength="9" placeholder="' + E(L("Kod saluran, cth. K7PQ-X2MZ", "Channel code, e.g. K7PQ-X2MZ")) + '" value="' + E(pre.code || "") + '"></div>' +
    '<button class="btn alt full g3d" id="wjGo" style="margin-top:12px">▶ ' + L("Sertai", "Join") + '</button>');
  var sh = function(){ ov.querySelector("#wjWifi").style.display = S.net === "wifi" ? "" : "none"; ov.querySelector("#wjNet").style.display = S.net === "net" ? "" : "none"; }; S._chg = sh; sh(); segBind(ov, S);
  if(pre.ip && !pre.key) setTimeout(function(){ var p = ov.querySelector("#wjP"); if(p) p.focus(); }, 300);
  var name = function(){ var nm = ov.querySelector("#wjN").value.trim(); if(!nm){ H.toast(L("Tulis nama anda", "Type your name")); ov.querySelector("#wjN").focus(); return null; } var dd = st(); dd.name = nm; sv(dd); return nm; };
  ov.querySelector("#wjQ").onclick = function(){ if(!name()) return; H.qrScan(function(x){ return !!parseQr(x); }, function(x){ var p = parseQr(x); H.closeOverlay(); if(p.net === "wifi") wifiJoin(p); else netStart({code:p.code, hostPub:p.hostPub, ch:p.ch || ""}); }, L("Imbas QR saluran", "Scan the channel QR")); };
  ov.querySelector("#wjGo").onclick = function(){ if(!name()) return;
    if(S.net === "wifi"){ var a = ov.querySelector("#wjA").value.trim().replace(/^https?:\/\//, "").split("/")[0], m = /^([\d.]+)(?::(\d+))?$/.exec(a), k = ov.querySelector("#wjP").value.trim();
      if(!m){ H.toast(L("Alamat tidak sah", "Not a valid address")); return; } if(!/^\d{6}$/.test(k)){ H.toast(L("Kod 6 digit diperlukan", "The 6-digit code is needed")); return; }
      H.closeOverlay(); wifiJoin({ip:m[1], port:+(m[2] || 8790), key:k, ch:pre.ch || ""}); }
    else { var c = normCode(ov.querySelector("#wjC").value); if(!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)){ H.toast(L("Kod saluran tidak sah", "Not a valid channel code")); return; } H.closeOverlay(); netStart({code:c, hostPub:pre.hostPub || "", ch:pre.ch || ""}); } }; }
function parseQr(x){ x = String(x || "").trim(); var m = /^https?:\/\/([\d.]+):(\d+)\/\?k=(\d{6})&wt=1/.exec(x); if(m) return {net:"wifi", ip:m[1], port:+m[2], key:m[3]};
  m = /^MIWT:([A-Z0-9]{4}-[A-Z0-9]{4}):([0-9a-f]{64})?(?::(.*))?$/.exec(x); if(m) return {net:"net", code:m[1], hostPub:m[2] || "", ch:m[3] ? decodeURIComponent(m[3]) : ""};
  m = /[#?&]wt=([A-Z0-9]{4}-?[A-Z0-9]{4})/i.exec(x); if(m) return {net:"net", code:normCode(m[1]), hostPub:"", ch:""}; return null; }
function remember(r){ var d = st(); d.recent = [r].concat(d.recent.filter(function(x){ return !(x.net === r.net && (x.net === "wifi" ? x.host === r.host && (r.host || x.ip === r.ip) : x.code === r.code)); })).slice(0, 5); sv(d); }

// ---------------------------------------------------------------- shared state helpers
function reset(net, host){ try{ if(N().wtScan) N().wtScan(false); }catch(e){} W.on = true; W.net = net; W.host = host; W.list = []; W.talker = null; W.talking = false; W.waiting = false; W.turn = false; W.muted = false; W.hand = false; W.conn = net === "wifi" && host; W.web = 0; W.sec = 0; W.hist = []; W.log = []; W.lv = []; W.started = Date.now(); }
function myId(){ return W.net === "wifi" ? meId().id : meId().pub; }
function canTalk(){ return W.host || W.mode !== "host" || W.turn; }
function say(t){ W.log.unshift({t:t, at:Date.now()}); W.log = W.log.slice(0, 30); }

// ---------------------------------------------------------------- 📶 Wi-Fi (native)
function permOk(){ var n = N(); if(n.hasPerm && !n.hasPerm("mic")){ if(n.requestPerm) n.requestPerm("mic"); H.toast(L("Benarkan mikrofon, kemudian cuba lagi.", "Allow the microphone, then try again.")); return false; }
  if(st().set.bt && n.hasPerm && !n.hasPerm("bt") && n.requestPerm) n.requestPerm("bt"); return true; }
function wifiHost(ch, mode, keepKey){ if(!permOk()) return; var d = st(), key = keepKey || pin6(), r;
  try{ r = JSON.parse(N().wtStart(JSON.stringify({host:true, ch:ch, key:key, mode:mode, id:meId().id, name:d.name, bt:!!d.set.bt, beep:d.set.beep, loud:d.set.loud, max:d.set.max})) || "{}"); }catch(e){ r = {}; }
  if(!r.ok){ H.toast("⚠ " + (r.e === "perm" ? L("Benarkan mikrofon dahulu.", "Allow the microphone first.") : L("Tidak dapat memulakan saluran.", "Could not start the channel."))); if(r.e === "perm") try{ N().requestPerm && N().requestPerm("mic"); }catch(e){} return; }
  reset("wifi", true); W.ch = ch; W.key = key; W.mode = mode; W.max = d.set.max; W.port = r.port; W.ips = r.ips || []; W.addr = (W.ips[0] || "?") + ":" + r.port;
  remember({net:"wifi", host:true, ch:ch, key:key, mode:mode}); draw(); }
function wifiJoin(p){ if(!permOk()) return; var d = st(), r; try{ r = JSON.parse(N().wtStart(JSON.stringify({host:false, ip:p.ip, port:p.port, key:p.key, ch:p.ch || "Walkie", id:meId().id, name:d.name, bt:!!d.set.bt, beep:d.set.beep, loud:d.set.loud, max:d.set.max})) || "{}"); }catch(e){ r = {}; }
  if(r.ok === false){ H.toast("⚠ " + (r.e === "perm" ? L("Benarkan mikrofon dahulu.", "Allow the microphone first.") : L("Tidak dapat menyertai.", "Could not join."))); return; }
  reset("wifi", false); W.ch = p.ch || ""; W.key = p.key; W.addr = p.ip + ":" + p.port; W.mode = "open"; W.max = d.set.max;
  remember({net:"wifi", host:false, ch:p.ch || p.ip, ip:p.ip, port:p.port, key:p.key}); draw(); }
function syncNative(){ try{ var s = JSON.parse(N().wtState() || "{}"); if(!s.on){ W.on = false; return; } W.mode = s.mode; W.max = s.max; W.talking = s.talking; W.waiting = !!s.waiting; W.talker = s.talker ? {id:s.talker, name:s.talkerName} : null; if(s.host){ W.ips = s.ips; W.port = s.port; W.addr = (s.ips[0] || "?") + ":" + s.port; } else W.conn = s.conn; }catch(e){} }
var EVON = false;
function evOnce(){ if(EVON || !H.on) return; EVON = true;
  H.on("wt", function(r){ if(!W.on || W.net !== "wifi") { if(r.t === "near"){ W.near = r.list || []; if(!W.on && EL && document.body.contains(EL)) home(); } return; }
    var me = meId().id, t = r.t;
    if(t === "lv"){ if(r.out != null){ W.lv.push(Math.min(1, r.out * 4)); W.sec = r.sec || 0; } else W.lv.push(-Math.min(1, r.in * 4)); if(W.lv.length > 64) W.lv.shift(); meter(); return; }
    if(t === "hi"){ W.ch = r.ch || W.ch; W.mode = r.mode; W.max = r.max; }
    if(t === "who"){ W.list = r.list || []; W.web = r.web || 0; W.mode = r.mode || W.mode; var mine = W.list.filter(function(x){ return x.id === me; })[0]; if(mine && !W.host){ W.turn = !!mine.turn; W.muted = !!mine.mute; W.hand = !!mine.hand; } }
    if(t === "floor"){ W.talker = r.id ? {id:r.id, name:r.name} : null; if(r.id === me){ W.talking = true; W.waiting = false; W.sec = 0; } else if(W.talking && !W.host){ W.talking = false; } if(r.id && r.id !== me) say("🗣 " + r.name); }
    if(t === "deny"){ W.waiting = false; W.talking = false; H.toast(r.why === "busy" ? "⏳ " + L("Sibuk: ", "Busy: ") + (r.by || L("seseorang bercakap", "someone is talking")) : r.why === "turn" ? "✋ " + L("Anda angkat tangan. Tunggu hos beri giliran.", "You raised your hand. Wait for the host to give you a turn.") : r.why === "muted" ? "🔇 " + L("Hos menyenyapkan anda.", "The host muted you.") : L("Belum bersambung.", "Not connected yet.")); if(r.why === "turn") W.hand = true; }
    if(t === "cut"){ W.talking = false; H.toast("✂ " + L("Hos mencelah.", "The host cut in.")); }
    if(t === "timeout"){ W.talking = false; H.toast("⏱ " + L("Had masa bercakap tamat.", "Talk-time limit reached.")); }
    if(t === "turn"){ W.turn = r.on; W.hand = false; H.toast(r.on ? "🎙 " + L("Hos beri anda giliran bercakap.", "The host gave you a turn to talk.") : L("Giliran anda ditarik balik.", "Your turn was taken back.")); try{ if(r.on && navigator.vibrate) navigator.vibrate(120); }catch(e){} }
    if(t === "muted"){ W.muted = r.on; }
    if(t === "conn"){ W.conn = r.on; if(!r.on) W.talker = null; }
    if(t === "join") say("➕ " + r.name); if(t === "left") say("➖ " + r.name);
    if(t === "hand" && W.host){ say("✋ " + r.name); H.toast("✋ " + r.name + " " + L("minta giliran", "asks for a turn")); }
    if(t === "err" && r.e === "mic") H.toast("⚠ " + L("Mikrofon tidak dapat dibuka.", "Could not open the microphone."));
    if(t === "kicked" || t === "end" || t === "bad" || t === "full"){ var msg = t === "kicked" ? L("Hos mengeluarkan anda dari saluran.", "The host removed you from the channel.") : t === "bad" ? L("Kod salah.", "Wrong code.") : t === "full" ? L("Saluran penuh.", "The channel is full.") : r.me ? "" : L("Saluran ditamatkan.", "The channel ended.");
      if(!W.host || r.me){ try{ N().wtLeave(); }catch(e){} W.on = false; if(msg) H.toast("📻 " + msg); } }
    draw(); });
  H.on("wtkey", function(r){ if(!W.on) return; if(r.d) press(); else release(true); }); }

// ---------------------------------------------------------------- 🌐 internet (relays)
var R = {ws: [], seen: {}, key: null, tag: null, alive: false, ping: null};
function hex(b){ return K().bytesToHex(b); } function unhex(h){ return K().hexToBytes(h); }
function sha(s){ return hex(K().sha256(K().utf8ToBytes(s))); }
function b64(u8){ var s = "", n = 0x8000; for(var i = 0; i < u8.length; i += n) s += String.fromCharCode.apply(null, u8.subarray(i, i + n)); return btoa(s); }
function unb64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function seal(o){ var k = K(), n = k.randomBytes(12), ct = k.gcm(unhex(R.key), n).encrypt(k.utf8ToBytes(JSON.stringify(o))), out = new Uint8Array(12 + ct.length); out.set(n); out.set(ct, 12); return b64(out); }
function unseal(s){ try{ var u = unb64(s), pt = K().gcm(unhex(R.key), u.slice(0, 12)).decrypt(u.slice(12)); return JSON.parse(new TextDecoder().decode(pt)); }catch(e){ return null; } }
function rOpen(u){ var ws; try{ ws = new WebSocket(u); }catch(e){ return; } R.ws.push(ws);
  ws.onopen = function(){ try{ ws.send(JSON.stringify(["REQ", "wt" + R.tag.slice(0, 8), {kinds:[KIND], "#t":[R.tag], since:Math.floor(Date.now() / 1000) - 5}])); }catch(e){} netConn(); hello(); };
  ws.onmessage = function(m){ var d; try{ d = JSON.parse(m.data); }catch(e){ return; } if(d[0] !== "EVENT" || !d[2] || R.seen[d[2].id]) return; R.seen[d[2].id] = 1; var o = unseal(d[2].content); if(o) netMsg(o, d[2].pubkey); };
  ws.onclose = function(){ R.ws = R.ws.filter(function(x){ return x !== ws; }); netConn(); if(R.alive) setTimeout(function(){ if(R.alive) rOpen(u); }, 3000); };
  ws.onerror = function(){}; }
function rSend(o){ if(!R.alive) return; var m = meId(), e = {pubkey:m.pub, created_at:Math.floor(Date.now() / 1000), kind:KIND, tags:[["t", R.tag]], content:seal(o)};
  e.id = sha(JSON.stringify([0, e.pubkey, e.created_at, e.kind, e.tags, e.content])); e.sig = hex(K().schnorr.sign(unhex(e.id), unhex(m.sk))); R.seen[e.id] = 1;
  var msg = JSON.stringify(["EVENT", e]); R.ws.forEach(function(ws){ try{ if(ws.readyState === 1) ws.send(msg); }catch(x){} }); }
function netConn(){ var c = R.ws.some(function(ws){ return ws.readyState === 1; }); if(c !== W.conn){ W.conn = c; draw(); } }
var P = {};   // presence: pub -> {name, h, at, hand}
var S = {turns:[], muted:[], kicked:[]};   // host's state
var T = {};   // talks being received: k -> {...}
function netStart(o){ var d = st(); reset("net", !!o.host); W.code = o.code; W.ch = o.ch || ""; W.mode = o.mode || "open"; W.max = d.set.max; W.hostPub = o.host ? meId().pub : (o.hostPub || ""); P = {}; S = {turns:[], muted:[], kicked:[]}; T = {};
  R.key = sha("myihsan-wt-key:" + o.code); R.tag = sha("myihsan-wt-tag:" + o.code).slice(0, 32); R.alive = true; R.seen = {}; R.ws = [];
  RELAYS.forEach(rOpen); R.ping = setInterval(function(){ hello(); prune(); }, 15000);
  try{ if(N().keepAwake) N().keepAwake(true); }catch(e){}
  remember({net:"net", host:!!o.host, ch:W.ch || o.code, code:o.code, hostPub:W.hostPub, mode:W.mode}); draw(); }
function hello(){ if(!R.alive) return; rSend({t:"hi", n:st().name, h:W.host ? 1 : 0, hand:W.hand ? 1 : 0}); if(W.host) rSend(state()); }
function state(){ return {t:"st", ch:W.ch, mode:W.mode, max:W.max, turns:S.turns, muted:S.muted, kicked:S.kicked}; }
function hostChanged(){ if(W.host){ rSend(state()); roster(); draw(); } }
function prune(){ var now = Date.now(); Object.keys(P).forEach(function(k){ if(now - P[k].at > 50000) delete P[k]; }); if(W.talker && W.talker.id !== myId() && now - (W.talker.last || 0) > 8000){ W.talker = null; } roster(); draw(); }
function roster(){ var me = meId().pub, l = [{id:me, name:st().name, h:W.host, turn:S.turns.indexOf(me) >= 0, hand:W.hand, mute:S.muted.indexOf(me) >= 0, talk:W.talking}];
  Object.keys(P).forEach(function(k){ if(k === me) return; var p = P[k]; l.push({id:k, name:p.name, h:k === W.hostPub, turn:S.turns.indexOf(k) >= 0, hand:!!p.hand, mute:S.muted.indexOf(k) >= 0, talk:!!(W.talker && W.talker.id === k)}); });
  l.sort(function(a, b){ return (b.h ? 1 : 0) - (a.h ? 1 : 0); }); W.list = l; }
function allowed(pub){ if(S.kicked.indexOf(pub) >= 0 || S.muted.indexOf(pub) >= 0) return false; return W.mode !== "host" || pub === W.hostPub || S.turns.indexOf(pub) >= 0; }
function netMsg(o, pub){ var me = meId().pub, t = o.t, now = Date.now();
  if(S.kicked.indexOf(pub) >= 0 && pub !== W.hostPub) return;
  if(t === "hi"){ var isNew = !P[pub]; P[pub] = {name:String(o.n || "?").slice(0, 40), at:now, hand:!!o.hand, h:!!o.h}; if(o.h && !W.hostPub && !W.host) W.hostPub = pub; if(isNew){ say("➕ " + P[pub].name); if(W.host) hello(); } if(o.hand && W.host && isNew) H.toast("✋ " + P[pub].name); roster(); draw(); return; }
  if(t === "bye"){ if(P[pub]) say("➖ " + P[pub].name); delete P[pub]; roster(); draw(); return; }
  if(P[pub]) P[pub].at = now;
  if(t === "st" && !W.host && !W.hostPub) W.hostPub = pub;   // typed the code (no QR): the first host-only message tells who the host is
  if(t === "st" && pub === W.hostPub && !W.host){ var wasTurn = S.turns.indexOf(me) >= 0, wasMute = S.muted.indexOf(me) >= 0; S = {turns:o.turns || [], muted:o.muted || [], kicked:o.kicked || []}; W.mode = o.mode; W.max = o.max || W.max; if(o.ch) W.ch = o.ch;
    W.turn = S.turns.indexOf(me) >= 0; W.muted = S.muted.indexOf(me) >= 0; if(W.turn && !wasTurn){ W.hand = false; H.toast("🎙 " + L("Hos beri anda giliran bercakap.", "The host gave you a turn to talk.")); } if(!W.turn && wasTurn) H.toast(L("Giliran anda ditarik balik.", "Your turn was taken back."));
    if(W.muted && !wasMute) H.toast("🔇 " + L("Hos menyenyapkan anda.", "The host muted you."));
    if(S.kicked.indexOf(me) >= 0){ netLeave(true); H.toast("📻 " + L("Hos mengeluarkan anda dari saluran.", "The host removed you from the channel.")); return; }
    if(W.talking && !allowed(me)) stopTalk(true); roster(); draw(); return; }
  if(t === "hand"){ if(P[pub]){ P[pub].hand = !!o.on; if(o.on && W.host){ say("✋ " + P[pub].name); H.toast("✋ " + P[pub].name + " " + L("minta giliran", "asks for a turn")); } } roster(); draw(); return; }
  if(t === "end" && pub === W.hostPub){ netLeave(true); H.toast("📻 " + L("Hos menamatkan saluran.", "The host ended the channel.")); return; }
  if(t === "cut" && pub === W.hostPub && o.id === me){ if(W.talking){ stopTalk(true); H.toast("✂ " + L("Hos mencelah.", "The host cut in.")); } return; }
  if(t === "ts"){ if(!allowed(pub)) return;
    if(W.talking){ var hostWins = pub === W.hostPub && !W.host, earlier = (o.at || 0) < MY.at || ((o.at || 0) === MY.at && pub < me);
      if(hostWins || (earlier && !(W.host && pub !== W.hostPub))){ stopTalk(true); H.toast(hostWins ? "✂ " + L("Hos mencelah.", "The host cut in.") : "⏳ " + L("Sibuk: ", "Busy: ") + (P[pub] ? P[pub].name : "")); } else return; }
    var act = Object.keys(T).map(function(k){ return T[k]; }).filter(function(x){ return !x.done && x.pub !== pub && now - x.at < ((W.max || 60) + 5) * 1000; })[0];
    if(act && pub !== W.hostPub && !(act.pub !== W.hostPub && ((o.at || 0) < act.oat || ((o.at || 0) === act.oat && pub < act.pub)))) return;   // same rule on every phone: the host, else whoever pressed first
    if(act) stopPlay(act);
    T[o.k] = {k:o.k, oat:o.at || 0, pub:pub, name:P[pub] ? P[pub].name : (o.n || "?"), at:now, mt:o.mt, chunks:{}, next:0, end:null, q:[], done:false}; W.talker = {id:pub, name:T[o.k].name, last:now}; say("🗣 " + T[o.k].name); startPlay(T[o.k]); roster(); draw(); return; }
  if(t === "a"){ var tk = T[o.k]; if(!tk || tk.done) return; tk.chunks[o.s] = unb64(o.d); if(W.talker && W.talker.id === pub) W.talker.last = now; pump(tk); return; }
  if(t === "te"){ var te = T[o.k]; if(!te) return; te.end = o.n; pump(te); if(W.talker && W.talker.id === pub) W.talker = null; if(!o.x) beep("end"); roster(); draw(); return; } }
// playback: MediaSource (almost live) or the whole clip at the end
function startPlay(tk){ var mt = tk.mt || "audio/webm;codecs=opus"; tk.audio = new Audio(); tk.audio.autoplay = true;
  if(window.MediaSource && MediaSource.isTypeSupported && MediaSource.isTypeSupported(mt)){ var ms = new MediaSource(); tk.ms = ms; tk.audio.src = URL.createObjectURL(ms);
    ms.addEventListener("sourceopen", function(){ try{ tk.sb = ms.addSourceBuffer(mt); tk.sb.mode = "sequence"; tk.sb.addEventListener("updateend", function(){ feed(tk); }); feed(tk); }catch(e){ tk.ms = null; } }); }
  var pl = tk.audio.play(); if(pl && pl.catch) pl.catch(function(){}); }
function pump(tk){ var got = false; while(tk.chunks[tk.next]){ tk.q.push(tk.chunks[tk.next]); tk.all = (tk.all || []).concat([tk.chunks[tk.next]]); delete tk.chunks[tk.next]; tk.next++; got = true; }
  if(!got && Object.keys(tk.chunks).length && !tk.wait){ tk.wait = setTimeout(function(){ tk.wait = null; if(!tk.chunks[tk.next] && Object.keys(tk.chunks).length){ tk.next = Math.min.apply(null, Object.keys(tk.chunks).map(Number)); pump(tk); } }, 1500); }   // a lost piece: skip it
  feed(tk); if(tk.end != null && tk.next >= tk.end && !tk.done) finish(tk); }
function feed(tk){ if(!tk.sb || tk.sb.updating || !tk.q.length) { if(tk.sb && !tk.sb.updating && tk.done && tk.ms && tk.ms.readyState === "open") try{ tk.ms.endOfStream(); }catch(e){} return; } try{ tk.sb.appendBuffer(tk.q.shift()); }catch(e){} }
function finish(tk){ tk.done = true; var blob = new Blob(tk.all || [], {type:(tk.mt || "audio/webm").split(";")[0]});
  if(!tk.ms){ try{ tk.audio.src = URL.createObjectURL(blob); var p = tk.audio.play(); if(p && p.catch) p.catch(function(){}); }catch(e){} } else feed(tk);
  W.hist.unshift({name:tk.name, at:tk.at, dur:(Date.now() - tk.at) / 1000, blob:blob}); W.hist = W.hist.slice(0, 30); if(EL && document.body.contains(EL)) draw(); }
function stopPlay(tk){ tk.done = true; try{ tk.audio.pause(); }catch(e){} }
// talking: MediaRecorder chunks
var MIC = {stream:null, rec:null, idle:null}, MY = {k:null, at:0, s:0, timer:null};
function mime(){ var c = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm", "audio/mp4"]; for(var i = 0; i < c.length; i++) try{ if(window.MediaRecorder && MediaRecorder.isTypeSupported(c[i])) return c[i]; }catch(e){} return ""; }
function getMic(cb){ clearTimeout(MIC.idle); if(MIC.stream) return cb(MIC.stream);
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ H.toast("⚠ " + L("Mikrofon tidak tersedia.", "No microphone available.")); return cb(null); }
  navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true, autoGainControl:true}}).then(function(s){ MIC.stream = s; cb(s); }).catch(function(){ H.toast("⚠ " + L("Benarkan mikrofon dahulu.", "Allow the microphone first.")); cb(null); }); }
function micIdle(){ clearTimeout(MIC.idle); MIC.idle = setTimeout(function(){ if(MIC.stream && !W.talking){ MIC.stream.getTracks().forEach(function(t){ t.stop(); }); MIC.stream = null; } }, 30000); }
function netTalk(){ var me = meId().pub;
  if(S.muted.indexOf(me) >= 0){ beep("no"); H.toast("🔇 " + L("Hos menyenyapkan anda.", "The host muted you.")); return; }
  if(!canTalk()){ W.hand = true; rSend({t:"hand", on:1}); beep("no"); H.toast("✋ " + L("Anda angkat tangan. Tunggu hos beri giliran.", "You raised your hand. Wait for the host to give you a turn.")); roster(); draw(); return; }
  if(W.talker && W.talker.id !== me && !W.host && Date.now() - (W.talker.last || 0) < 3000){ beep("no"); H.toast("⏳ " + L("Sibuk: ", "Busy: ") + W.talker.name); return; }
  if(!W.conn){ beep("no"); H.toast(L("Belum bersambung ke internet.", "Not connected yet.")); return; }
  W.waiting = true; draw();
  getMic(function(s){ W.waiting = false; if(!s || !W.on){ draw(); return; } if(!HOLD.down && st().set.hold){ draw(); return; }
    var mt = mime(), rec; try{ rec = new MediaRecorder(s, mt ? {mimeType:mt, audioBitsPerSecond:24000} : {audioBitsPerSecond:24000}); }catch(e){ H.toast("⚠ " + L("Rakaman tidak disokong.", "Recording is not supported.")); draw(); return; }
    MY.k = Math.random().toString(36).slice(2, 10); MY.at = Date.now(); MY.s = 0; MIC.rec = rec; W.talking = true; W.sec = 0;
    if(W.host && W.talker && W.talker.id !== me) rSend({t:"cut", id:W.talker.id});
    W.talker = {id:me, name:st().name, last:Date.now()}; rSend({t:"ts", k:MY.k, at:MY.at, n:st().name, mt:rec.mimeType || mt});
    var k0 = MY.k, n0 = 0, pend = [];
    rec.ondataavailable = function(e){ if(!e.data || !e.data.size) return; var s_ = n0++; pend.push(e.data.arrayBuffer().then(function(b){ rSend({t:"a", k:k0, s:s_, d:b64(new Uint8Array(b))}); })); };
    rec.onstop = function(){ Promise.all(pend).then(function(){ rSend({t:"te", k:k0, n:n0, x:rec._cancel ? 1 : 0}); }); };
    rec.start(600); beep("go"); levelOn(s);
    MY.timer = setInterval(function(){ W.sec = (Date.now() - MY.at) / 1000; if(W.sec >= (W.max || 60)){ stopTalk(false); H.toast("⏱ " + L("Had masa bercakap tamat.", "Talk-time limit reached.")); } var e = EL && EL.querySelector("#wtSec"); if(e) e.textContent = mmss(W.sec); }, 250);
    roster(); draw(); }); }
function stopTalk(cancel){ clearInterval(MY.timer); var rec = MIC.rec; MIC.rec = null; W.talking = false; W.waiting = false;
  if(rec && rec.state !== "inactive"){ rec._cancel = !!cancel; try{ rec.requestData(); }catch(e){} try{ rec.stop(); }catch(e){} }
  if(W.talker && W.talker.id === meId().pub) W.talker = null; levelOff(); micIdle(); roster(); draw(); }
var LV = {ctx:null, an:null, raf:null};
function levelOn(s){ try{ var C = window.AudioContext || window.webkitAudioContext; LV.ctx = LV.ctx || new C(); var src = LV.ctx.createMediaStreamSource(s); LV.an = LV.ctx.createAnalyser(); LV.an.fftSize = 512; src.connect(LV.an); var buf = new Uint8Array(512);
  var loop = function(){ if(!LV.an) return; LV.an.getByteTimeDomainData(buf); var a = 0; for(var i = 0; i < buf.length; i++){ var x = (buf[i] - 128) / 128; a += x * x; } W.lv.push(Math.min(1, Math.sqrt(a / buf.length) * 4)); if(W.lv.length > 64) W.lv.shift(); meter(); LV.raf = setTimeout(loop, 120); }; loop(); }catch(e){} }
function levelOff(){ clearTimeout(LV.raf); LV.an = null; }
function beep(kind){ if(!st().set.beep && kind !== "no") return; try{ var C = window.AudioContext || window.webkitAudioContext; LV.ctx = LV.ctx || new C(); var c = LV.ctx, t = c.currentTime, T_ = kind === "go" ? [[1400, .07]] : kind === "end" ? [[1000, .06], [1500, .06]] : [[420, .12], [0, .05], [420, .12]];
  T_.forEach(function(x){ if(x[0]){ var o = c.createOscillator(), g = c.createGain(); o.frequency.value = x[0]; g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + x[1]); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + x[1]); } t += x[1]; }); }catch(e){} }
function netLeave(quiet){ if(W.talking) stopTalk(true); if(!quiet) rSend({t:W.host ? "end" : "bye"}); else rSend({t:"bye"}); R.alive = false; clearInterval(R.ping); setTimeout(function(){ R.ws.forEach(function(ws){ try{ ws.close(); }catch(e){} }); R.ws = []; }, 400);
  Object.keys(T).forEach(function(k){ stopPlay(T[k]); }); if(MIC.stream){ MIC.stream.getTracks().forEach(function(t){ t.stop(); }); MIC.stream = null; } try{ if(N().keepAwake) N().keepAwake(false); }catch(e){} W.on = false; draw(); }

// ---------------------------------------------------------------- push to talk
var HOLD = {down:false};
function press(){ if(!W.on || HOLD.down) return; HOLD.down = true; if(W.net === "wifi"){ W.waiting = true; try{ N().wtTalk(true); }catch(e){} draw(); } else netTalk(); }
function release(force){ if(!HOLD.down && !force) return; HOLD.down = false; if(W.net === "wifi"){ W.waiting = false; try{ N().wtTalk(false); }catch(e){} draw(); } else if(W.talking) stopTalk(false); else { W.waiting = false; draw(); } }
function pttBind(b){ var hold = st().set.hold;
  if(hold){ b.addEventListener("pointerdown", function(e){ e.preventDefault(); try{ b.setPointerCapture(e.pointerId); }catch(x){} press(); var up = function(){ document.removeEventListener("pointerup", up, true); document.removeEventListener("pointercancel", up, true); release(); }; document.addEventListener("pointerup", up, true); document.addEventListener("pointercancel", up, true); });
    b.addEventListener("contextmenu", function(e){ e.preventDefault(); }); }
  else b.onclick = function(){ if(W.talking || W.waiting || HOLD.down) release(true); else press(); }; }
// volume keys talk only while this page is on screen
var KW = null; function keysWatch(){ var on = function(){ return W.on && st().set.keys && EL && document.body.contains(EL) && !document.hidden; }; try{ if(N().wtKeys) N().wtKeys(on()); }catch(e){}
  clearInterval(KW); KW = setInterval(function(){ var v = on(); try{ if(N().wtKeys) N().wtKeys(v); }catch(e){} if(!v && !(W.on && EL && document.body.contains(EL))){ clearInterval(KW); KW = null; try{ if(N().wtScan) N().wtScan(false); }catch(e){} } }, 1000); }

// ---------------------------------------------------------------- the channel screen
function room(){ var me = myId(), d = st(), set = d.set, wifi = W.net === "wifi", other = W.talker && W.talker.id !== me, busy = other && !W.host,
    state = W.talking ? "talk" : W.waiting ? "wait" : W.muted ? "muted" : !W.conn ? "off" : busy ? "busy" : !canTalk() ? "hand" : "free";
  var lbl = {talk:"🔴 " + L("Anda sedang bercakap", "You are talking"), wait:"⏳ " + L("Menunggu…", "Waiting…"), muted:"🔇 " + L("Disenyapkan oleh hos", "Muted by the host"), off:"📡 " + L("Menyambung…", "Connecting…"),
    busy:"🟢 " + E(W.talker ? W.talker.name : "") + " " + L("sedang bercakap", "is talking"), hand:(W.hand ? "✋ " + L("Tangan diangkat · tunggu giliran", "Hand raised · waiting for a turn") : "👑 " + L("Hos beri giliran", "The host gives turns")), free:"⚪ " + L("Saluran lapang", "Channel free")}[state];
  if(W.host && other && !W.talking) lbl = "🟢 " + E(W.talker.name) + " " + L("sedang bercakap", "is talking");
  var btnTx = W.talking ? (set.hold ? L("Lepas untuk berhenti", "Release to stop") : L("Ketik untuk berhenti", "Tap to stop")) : state === "hand" ? (W.hand ? L("Tangan diangkat", "Hand raised") : "✋ " + L("Minta giliran", "Ask for a turn")) : (set.hold ? L("Tahan untuk bercakap", "Hold to talk") : L("Ketik untuk bercakap", "Tap to talk"));
  var n = W.list.length || 1;
  var h = '<div class="card wtRoom"><div class="wtTop"><b>📻 ' + E(W.ch || L("Saluran", "Channel")) + '</b><span class="wtChips"><span class="chip sm">' + (wifi ? "📶 Wi-Fi" : "🌐 Internet") + '</span><span class="chip sm">' + (W.mode === "host" ? "👑 " + L("Hos", "Host") : "🗣 " + L("Sesiapa", "Anyone")) + '</span><span class="chip sm">👥 ' + n + (W.web ? ' + 🌐' + W.web : '') + '</span></span></div>' +
    '<div class="wtStat wt-' + state + '">' + lbl + (W.talking ? ' · <b id="wtSec">' + mmss(W.sec) + '</b>' : '') + '</div>' +
    '<div class="wtPttWrap"><button class="wtPtt wt-' + state + '" id="wtPtt" aria-label="' + E(btnTx) + '"><span class="wtMic">' + (W.talking ? "🎙" : state === "hand" ? "✋" : "🎙") + '</span><small>' + E(btnTx) + '</small></button></div>' +
    '<div class="mtMeter"><canvas id="wtC" width="320" height="56"></canvas></div>' +
    '<div class="mut small wtMax">⏱ ' + L("Had bercakap", "Talk limit") + ' ' + mmss(W.max || 60) + (W.mode === "host" && !W.host ? (W.turn ? ' · 🎙 ' + L("Anda ada giliran", "You have a turn") : '') : '') + '</div></div>';
  if(W.host) h += '<div class="card"><h3>👑 ' + L("Kawalan hos", "Host controls") + '</h3>' + seg("hmode", [["open", "🗣 " + L("Sesiapa", "Anyone")], ["host", "👑 " + L("Hos beri giliran", "Host gives turns")]], W.mode) +
    '<div class="grp2" style="margin-top:8px"><button class="btn alt g3d" id="wtCut"' + (other ? '' : ' disabled') + '>✂ ' + L("Hentikan penutur", "Stop the speaker") + '</button><button class="btn alt g3d" id="wtTakeAll">↩ ' + L("Tarik semua giliran", "Take back all turns") + '</button></div></div>';
  h += '<div class="card"><h3>👥 ' + L("Ahli", "Members") + ' <span class="mut small">' + n + '</span></h3>' + W.list.map(function(p){ var mine = p.id === me;
    return '<div class="wtMem' + (p.talk ? ' talk' : '') + '"><span class="wtAv">' + (p.talk ? "🗣" : p.h ? "👑" : p.hand ? "✋" : p.mute ? "🔇" : p.turn ? "🎙" : "🙂") + '</span><span class="wtNm"><b>' + E(p.name) + (mine ? ' · ' + L("anda", "you") : '') + '</b><small class="mut">' + [p.h ? L("Hos", "Host") : "", p.turn ? L("ada giliran", "has a turn") : "", p.hand ? L("angkat tangan", "hand raised") : "", p.mute ? L("disenyapkan", "muted") : "", p.talk ? L("bercakap", "talking") : ""].filter(Boolean).join(" · ") + '</small></span>' +
      (W.host && !mine ? '<span class="wtAct">' + (W.mode === "host" ? (p.turn ? '<button class="chip sm" data-hc="take" data-id="' + E(p.id) + '" title="' + E(L("Tarik giliran", "Take back the turn")) + '">↩</button>' : '<button class="chip sm gold" data-hc="give" data-id="' + E(p.id) + '" title="' + E(L("Beri giliran", "Give a turn")) + '">🎙</button>') : '') +
        '<button class="chip sm" data-hc="mute" data-on="' + (p.mute ? 0 : 1) + '" data-id="' + E(p.id) + '" title="' + E(p.mute ? L("Nyahsenyap", "Unmute") : L("Senyapkan", "Mute")) + '">' + (p.mute ? "🔈" : "🔇") + '</button><button class="chip sm" data-hc="kick" data-id="' + E(p.id) + '" data-nm="' + E(p.name) + '" title="' + E(L("Keluarkan", "Remove")) + '">🚫</button></span>' : '') + '</div>'; }).join("") +
    (W.mode === "host" && !W.host ? '<button class="btn alt full g3d" id="wtHand" style="margin-top:8px">' + (W.hand ? "✋ " + L("Turunkan tangan", "Lower my hand") : "✋ " + L("Angkat tangan", "Raise my hand")) + '</button>' : '') + '</div>';
  if(W.host || !wifi) h += '<div class="card wtShare"><h3>🔗 ' + L("Ajak orang lain", "Invite others") + '</h3><div class="wtQr" id="wtQr"></div><div class="wtCode">' + (wifi ? E(W.addr) + ' · ' + L("kod", "code") + ' <b>' + E(W.key) + '</b>' : L("Kod", "Code") + ' <b>' + E(W.code) + '</b>') + '</div>' +
    '<div class="mut small">' + (wifi ? L("Imbas dengan My Ihsan › Mesyuarat › 📻 Walkie › Sertai. Kamera biasa membuka halaman dengar dalam pelayar. Mesti pada Wi-Fi yang sama atau hotspot telefon ini.", "Scan with My Ihsan › Meeting › 📻 Walkie › Join. A normal camera opens a listen page in the browser. Must be on the same Wi-Fi or this phone's hotspot.") : L("Imbas dengan My Ihsan, atau beri kod: Mesyuarat › 📻 Walkie › Sertai › Internet.", "Scan with My Ihsan, or give the code: Meeting › 📻 Walkie › Join › Internet.")) + '</div>' +
    '<button class="btn alt full g3d" id="wtShare" style="margin-top:8px">📤 ' + L("Kongsi", "Share") + '</button></div>';
  if(!wifi && W.hist.length) h += '<div class="card"><h3>🕘 ' + L("Ulang dengar", "Replay") + '</h3>' + W.hist.map(function(x, i){ return '<button class="card wtRow" data-hp="' + i + '"><span class="wtIc">▶</span><span><b>' + E(x.name) + '</b><small class="mut">' + new Date(x.at).toLocaleTimeString([], {hour:"numeric", minute:"2-digit"}) + ' · ' + mmss(x.dur) + '</small></span></button>'; }).join("") + '</div>';
  if(W.log.length) h += '<details class="card" data-keep="log"' + (W.open && W.open.log ? ' open' : '') + '><summary><b>📜 ' + L("Aktiviti", "Activity") + '</b></summary>' + W.log.slice(0, 15).map(function(x){ return '<div class="small">' + new Date(x.at).toLocaleTimeString([], {hour:"numeric", minute:"2-digit"}) + ' · ' + E(x.t) + '</div>'; }).join("") + '</details>';
  h += '<details class="card" data-keep="opt"' + (W.open && W.open.opt ? ' open' : '') + '><summary><b>⚙ ' + L("Pilihan", "Options") + '</b></summary>' +
    '<label class="pdchk"><input type="checkbox" id="woHold"' + (set.hold ? ' checked' : '') + '> ✋ ' + L("Tahan untuk bercakap (tutup = ketik untuk mula / berhenti)", "Hold to talk (off = tap to start / stop)") + '</label>' +
    (N().wtKeys ? '<label class="pdchk"><input type="checkbox" id="woKeys"' + (set.keys ? ' checked' : '') + '> 🔉 ' + L("Tahan butang kelantangan untuk bercakap", "Hold a volume key to talk") + '</label>' : '') +
    '<label class="pdchk"><input type="checkbox" id="woBeep"' + (set.beep ? ' checked' : '') + '> 🔔 ' + L("Bunyi mula dan tamat (roger)", "Start and end beeps (roger)") + '</label>' +
    (W.host ? '<div class="mtQh">' + L("Had masa bercakap", "Talk-time limit") + '</div>' + seg("hmax", [["30", "30 s"], ["60", "1 min"], ["120", "2 min"], ["300", "5 min"]], String(W.max || 60)) : '') + '</details>';
  h += '<button class="btn alt full g3d wtLeave" id="wtLeave">' + (W.host ? "⏹ " + L("Tamatkan saluran", "End the channel") : "🚪 " + L("Keluar saluran", "Leave the channel")) + '</button>';
  if(wifi && !W.host && !W.conn) h = '<div class="card mtWarn">📶 ' + L("Menyambung ke ", "Connecting to ") + E(W.addr) + '… ' + L("Pastikan anda pada Wi-Fi yang sama atau hotspot telefon hos.", "Make sure you're on the same Wi-Fi or the host phone's hotspot.") + '</div>' + h;
  EL.innerHTML = h; meter();
  EL.querySelectorAll("details[data-keep]").forEach(function(d_){ d_.addEventListener("toggle", function(){ W.open = W.open || {}; W.open[d_.getAttribute("data-keep")] = d_.open; }); });   // panels stay open when the page redraws
  pttBind(EL.querySelector("#wtPtt"));
  var qr = EL.querySelector("#wtQr"); if(qr) try{ qr.innerHTML = H.qrSvg(wifi ? "http://" + W.addr + "/?k=" + W.key + "&wt=1" : "MIWT:" + W.code + ":" + (W.hostPub || "") + ":" + encodeURIComponent(W.ch || "")); }catch(e){}
  var sh = EL.querySelector("#wtShare"); if(sh) sh.onclick = function(){ var t = "📻 My Ihsan walkie-talkie · " + (W.ch || "") + "\n" + (wifi ? L("Sertai Wi-Fi yang sama, kemudian Mesyuarat › 📻 Walkie › Sertai › Wi-Fi\nAlamat: ", "Join the same Wi-Fi, then Meeting › 📻 Walkie › Join › Wi-Fi\nAddress: ") + W.addr + "\n" + L("Kod: ", "Code: ") + W.key + "\n" + L("Dengar dalam pelayar: ", "Listen in a browser: ") + "http://" + W.addr + "/?k=" + W.key : L("Mesyuarat › 📻 Walkie › Sertai › Internet\nKod: ", "Meeting › 📻 Walkie › Join › Internet\nCode: ") + W.code + "\n" + L("Di web: ", "On the web: ") + "https://ihsanrahim.github.io/My-Ihsan-Wifi/go/?app/#wt=" + W.code.replace("-", ""));   // the smart link: myihsan.app, or the backup when blocked
    try{ if(N().share) N().share(t); else if(navigator.share) navigator.share({text:t}); else { navigator.clipboard.writeText(t); H.toast(L("Disalin", "Copied")); } }catch(e){} };
  EL.querySelector("#wtLeave").onclick = function(){ if(W.net === "wifi"){ try{ N().wtLeave(); }catch(e){} W.on = false; draw(); } else netLeave(false); };
  var hd = EL.querySelector("#wtHand"); if(hd) hd.onclick = function(){ W.hand = !W.hand; if(W.net === "wifi") try{ N().wtCmd(JSON.stringify({t:"hand", on:W.hand})); }catch(e){} else { rSend({t:"hand", on:W.hand ? 1 : 0}); roster(); } draw(); };
  EL.querySelectorAll("[data-hp]").forEach(function(b){ b.onclick = function(){ var x = W.hist[+b.getAttribute("data-hp")]; try{ var a = new Audio(URL.createObjectURL(x.blob)); a.play(); }catch(e){} }; });
  EL.querySelectorAll("[data-hc]").forEach(function(b){ b.onclick = function(){ var c = b.getAttribute("data-hc"), id = b.getAttribute("data-id");
    if(c === "kick" && !confirm(L("Keluarkan ", "Remove ") + b.getAttribute("data-nm") + "?")) return; hostCmd(c, id, b.getAttribute("data-on") !== "0"); }; });
  var cut = EL.querySelector("#wtCut"); if(cut) cut.onclick = function(){ if(W.net === "wifi") try{ N().wtCmd(JSON.stringify({t:"cut"})); }catch(e){} else if(W.talker){ rSend({t:"cut", id:W.talker.id}); } };
  var ta = EL.querySelector("#wtTakeAll"); if(ta) ta.onclick = function(){ if(W.net === "wifi") try{ N().wtCmd(JSON.stringify({t:"takeall"})); }catch(e){} else { S.turns = []; Object.keys(P).forEach(function(k){ P[k].hand = false; }); hostChanged(); } H.toast(L("Semua giliran ditarik balik", "All turns taken back")); };
  var HS = {}; HS._chg = function(){ if(HS.hmode && HS.hmode !== W.mode){ W.mode = HS.hmode; if(W.net === "wifi") try{ N().wtCmd(JSON.stringify({t:"mode", mode:W.mode})); }catch(e){} else hostChanged(); var dd = st(); dd.recent.forEach(function(r){ if(r.host && r.net === W.net) r.mode = W.mode; }); sv(dd); }
    if(HS.hmax && +HS.hmax !== W.max){ W.max = +HS.hmax; var d2 = st(); d2.set.max = W.max; sv(d2); if(W.net === "wifi") try{ N().wtCmd(JSON.stringify({t:"max", max:W.max})); }catch(e){} else hostChanged(); } draw(); }; segBind(EL, HS);
  var opt = function(id, k, after){ var x = EL.querySelector(id); if(x) x.onchange = function(){ var dd = st(); dd.set[k] = x.checked; sv(dd); if(after) after(x.checked); draw(); }; };
  opt("#woHold", "hold"); opt("#woKeys", "keys", function(){ keysWatch(); }); opt("#woBeep", "beep", function(v){ if(W.net === "wifi") try{ N().wtCmd(JSON.stringify({t:"beep", on:v})); }catch(e){} }); }
function hostCmd(c, id, on){ if(W.net === "wifi"){ try{ N().wtCmd(JSON.stringify({t:c, id:id, on:on})); }catch(e){} return; }
  var rm = function(a, x){ var i = a.indexOf(x); if(i >= 0) a.splice(i, 1); };
  if(c === "give"){ if(S.turns.indexOf(id) < 0) S.turns.push(id); if(P[id]) P[id].hand = false; }
  if(c === "take"){ rm(S.turns, id); if(W.talker && W.talker.id === id) rSend({t:"cut", id:id}); }
  if(c === "mute"){ if(on){ if(S.muted.indexOf(id) < 0) S.muted.push(id); if(W.talker && W.talker.id === id) rSend({t:"cut", id:id}); } else rm(S.muted, id); }
  if(c === "kick"){ if(S.kicked.indexOf(id) < 0) S.kicked.push(id); rm(S.turns, id); delete P[id]; }
  hostChanged(); }
function meter(){ var cv = EL && EL.querySelector("#wtC"); if(!cv) return; var c = cv.getContext("2d"), w = cv.width, h = cv.height, n = 64, bw = w / n; c.clearRect(0, 0, w, h);
  W.lv.forEach(function(v, i){ var a = Math.abs(v), bh = Math.max(2, a * h); c.fillStyle = v < 0 ? "#3fb27f" : "#e5484d"; c.fillRect(i * bw + 1, (h - bh) / 2, bw - 2, bh); }); }

// a web link https://myihsan.app/app/#wt=CODE opens the join sheet
function linkJoin(code){ withKit(function(){ if(W.on) return; joinSheet({net:"net", code:normCode(code)}); }); }
window.Walkie = {view:view, active:function(){ return !!W.on; }, link:linkJoin, parse:function(x){ return parseQr(x); }};
})();
