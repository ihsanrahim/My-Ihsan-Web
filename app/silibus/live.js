/* My Ihsan 0.5.23: Live class quiz (Quizizz / Kahoot style) for Learn › School.
   The host (teacher or parent) picks a subject and topic; the app shows a 6-digit code. Pupils join from their own phones with the code
   and a name. Questions (multiple choice and true/false from the School packs) run with a timer; faster right answers score more;
   a live leaderboard shows after each question and a podium at the end.
   Transport: free public Nostr relays (the same ones Groups uses), ephemeral events (kind 20777, not stored by relays),
   encrypted with AES-GCM using a key made from the code. Nothing is kept on any server. Needs internet on every phone.
   LiveQuiz.open(mode "host"|"join", {H, kid, packs, catalog}) */
(function(){ "use strict";
var K = window.NostrKit, H, ctx, KIND = 20777, RELAYS = window.LQ_RELAYS || ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net"];
function L(a, b){ return H.L2x(a, b); }
function esc(s){ return H.esc(s == null ? "" : String(s)); }
function hex(b){ return K.bytesToHex(b); } function unhex(h){ return K.hexToBytes(h); }
function sha(s){ return hex(K.sha256(K.utf8ToBytes(s))); }
function b64(u8){ var s = ""; for(var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); }
function unb64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function seal(key, o){ var n = K.randomBytes(12), ct = K.gcm(unhex(key), n).encrypt(K.utf8ToBytes(JSON.stringify(o))), out = new Uint8Array(12 + ct.length); out.set(n); out.set(ct, 12); return b64(out); }
function unseal(key, s){ try{ var u = unb64(s), pt = K.gcm(unhex(key), u.slice(0, 12)).decrypt(u.slice(12)); return JSON.parse(new TextDecoder().decode(pt)); }catch(e){ return null; } }
var me = null; function keyMe(){ if(!me){ var sk = K.schnorr.utils.randomPrivateKey(); me = {sk: hex(sk), pub: hex(K.schnorr.getPublicKey(sk))}; } return me; }

// ---------- tiny relay client ----------
var R = {ws: [], seen: {}, key: null, tag: null, onMsg: null, alive: false};
function connect(code, onMsg){ R.key = sha("myihsan-live-key:" + code); R.tag = sha("myihsan-live-tag:" + code).slice(0, 32); R.onMsg = onMsg; R.alive = true; R.seen = {};
  RELAYS.forEach(function(u){ open1(u); }); }
function open1(u){ var ws; try{ ws = new WebSocket(u); }catch(e){ return; } R.ws.push(ws);
  ws.onopen = function(){ try{ ws.send(JSON.stringify(["REQ", "lq" + R.tag.slice(0, 8), {kinds: [KIND], "#t": [R.tag], since: Math.floor(Date.now() / 1000) - 30}])); }catch(e){} };
  ws.onmessage = function(m){ var d; try{ d = JSON.parse(m.data); }catch(e){ return; } if(d[0] !== "EVENT" || !d[2] || R.seen[d[2].id]) return; R.seen[d[2].id] = 1; var o = unseal(R.key, d[2].content); if(o && R.onMsg) R.onMsg(o, d[2].pubkey); };
  ws.onclose = function(){ R.ws = R.ws.filter(function(x){ return x !== ws; }); if(R.alive) setTimeout(function(){ if(R.alive) open1(u); }, 3000); };
  ws.onerror = function(){}; }
function send(o){ var m = keyMe(), e = {pubkey: m.pub, created_at: Math.floor(Date.now() / 1000), kind: KIND, tags: [["t", R.tag]], content: seal(R.key, o)};
  e.id = sha(JSON.stringify([0, e.pubkey, e.created_at, e.kind, e.tags, e.content])); e.sig = hex(K.schnorr.sign(unhex(e.id), unhex(m.sk))); R.seen[e.id] = 1;
  R.ws.forEach(function(ws){ if(ws.readyState === 1) try{ ws.send(JSON.stringify(["EVENT", e])); }catch(x){} }); }
function disconnect(){ R.alive = false; R.ws.forEach(function(ws){ try{ ws.close(); }catch(e){} }); R.ws = []; }

// ---------- screen ----------
var box = null, timers = [];
function shell(title){ close(); box = document.createElement("div"); box.id = "lq"; box.innerHTML = '<div class="lqTop"><b>' + esc(title) + '</b><button class="lqX" aria-label="✕">✕</button></div><div class="lqBody"></div>'; document.body.appendChild(box);
  box.querySelector(".lqX").onclick = function(){ if(confirmLeave()) close(); }; return box.querySelector(".lqBody"); }
var leaveAsk = false; function confirmLeave(){ if(leaveAsk) return true; leaveAsk = true; H.toast(L("Ketik ✕ sekali lagi untuk keluar", "Tap ✕ again to leave")); setTimeout(function(){ leaveAsk = false; }, 2500); return false; }
function close(){ timers.forEach(clearInterval); timers = []; disconnect(); if(box) box.remove(); box = null; }
function visHtml(q){ var v = (q.vis || [])[0]; if(v && v.k === "emoji" && v.n && v.n <= 30) return '<div class="lqVis">' + esc(new Array(v.n + 1).join(v.s)) + '</div>'; return ""; }
var COL = ["#e0605a", "#4a9be8", "#f2b33d", "#3ddc84"], SH = ["▲", "◆", "●", "■"];

// ---------- questions from a pack ----------
function loadPack(id, cb){ var x = new XMLHttpRequest(); x.open("GET", "silibus/packs/" + id + ".kuiz.json"); x.onload = function(){ try{ cb(JSON.parse(x.responseText)); }catch(e){ cb(null); } }; x.onerror = function(){ cb(null); }; x.send(); }
function usable(q){ return (q.j === "mcq" && q.p && q.p.length >= 2 && q.p.length <= 4) || q.j === "bs"; }
function norm(q){ var p = q.j === "bs" ? (q.label || [L("Betul", "True"), L("Salah", "False")]) : q.p.slice(), a = q.j === "bs" ? (q.a === "Betul" || q.a === "True" ? 0 : 1) : p.indexOf(q.a);
  return {s: String(q.s || "").replace(/<[^>]+>/g, " ").slice(0, 300), p: p.map(function(x){ return String(x).replace(/<[^>]+>/g, " ").slice(0, 80); }), a: a, vis: q.vis}; }

// ---------- host ----------
function host(){ var packs = ctx.packs || [], pk = packs[0]; if(!pk){ H.toast(L("Tiada subjek untuk tahap ini", "No subjects for this level")); return; }
  var ov = H.showSheet("🎤 " + L("Buat kuiz kelas", "Host a class quiz"),
    '<label class="small">' + L("Subjek", "Subject") + '</label><select id="lqP" class="rin">' + packs.map(function(p){ return '<option value="' + esc(p.id) + '">' + esc(p.ikon + " " + p.nama) + '</option>'; }).join("") + '</select>' +
    '<label class="small" style="display:block;margin-top:8px">' + L("Topik", "Topic") + '</label><select id="lqT" class="rin"><option value="">' + L("Semua topik", "All topics") + '</option></select>' +
    '<div class="row" style="gap:8px;margin-top:8px"><label class="small" style="flex:1">' + L("Bilangan soalan", "Questions") + '<select id="lqN" class="rin"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></label>' +
    '<label class="small" style="flex:1">' + L("Saat setiap soalan", "Seconds each") + '<select id="lqS" class="rin"><option>10</option><option selected>20</option><option>30</option></select></label></div>' +
    '<button class="btn gold full g3d" id="lqGo" style="margin-top:12px">▶ ' + L("Dapatkan kod", "Get a code") + '</button><div class="mut tiny" style="margin-top:6px">' + L("Setiap telefon perlu internet. Soalan dan jawapan disulitkan dengan kod dan tidak disimpan di mana-mana pelayan.", "Every phone needs internet. Questions and answers are encrypted with the code and not stored on any server.") + '</div>');
  var fill = function(){ var id = ov.querySelector("#lqP").value, p = packs.filter(function(x){ return x.id === id; })[0]; ov.querySelector("#lqT").innerHTML = '<option value="">' + L("Semua topik", "All topics") + '</option>' + (p.topik || []).map(function(t, i){ return '<option value="' + i + '">' + esc(t.tajuk || t) + '</option>'; }).join(""); };
  fill(); ov.querySelector("#lqP").onchange = fill;
  ov.querySelector("#lqGo").onclick = function(){ var id = ov.querySelector("#lqP").value, ti = ov.querySelector("#lqT").value, n = +ov.querySelector("#lqN").value, sec = +ov.querySelector("#lqS").value;
    loadPack(id, function(P){ if(!P){ H.toast(L("Pek gagal dimuatkan", "Could not load the pack")); return; }
      var pool = []; (P.topik || []).forEach(function(t, i){ if(ti !== "" && +ti !== i) return; (t.soalan || []).forEach(function(q){ if(usable(q)) pool.push(norm(q)); }); });
      pool = pool.filter(function(q){ return q.a >= 0; }).sort(function(){ return Math.random() - 0.5; }).slice(0, n);
      if(pool.length < 3){ H.toast(L("Tidak cukup soalan pilihan untuk topik ini", "Not enough multiple-choice questions in this topic")); return; }
      H.closeOverlay(); runHost(pool, sec, id); }); }; }
function runHost(Q, sec, pid){ var code = String(Math.floor(100000 + Math.random() * 900000)), G = {ph: "lobby", qi: -1, pl: {}, ans: {}, endAt: 0};
  var B = shell(L("Kuiz kelas", "Class quiz") + " · " + code);
  connect(code, function(o, pub){ if(o.t === "j" && o.n){ if(!G.pl[pub]) G.pl[pub] = {n: String(o.n).slice(0, 20), sc: 0, st: 0}; draw(); bcast(); }
    if(o.t === "a" && G.ph === "q" && o.qi === G.qi && G.pl[pub] && !G.ans[pub]){ var ok = o.c === Q[G.qi].a, left = Math.max(0, G.endAt - Date.now()); G.ans[pub] = {c: o.c, ok: ok};
      if(ok){ G.pl[pub].sc += 500 + Math.round(500 * left / (sec * 1000)); G.pl[pub].st++; } else G.pl[pub].st = 0;
      draw(); if(Object.keys(G.ans).length >= Object.keys(G.pl).length) reveal(); } });
  var lb = function(){ return Object.keys(G.pl).map(function(k){ return [G.pl[k].n, G.pl[k].sc, k.slice(0, 8)]; }).sort(function(a, b){ return b[1] - a[1]; }); };
  var state = function(){ var q = G.qi >= 0 ? Q[G.qi] : null; return {t: "st", ph: G.ph, qi: G.qi, n: Q.length, q: q && G.ph !== "lobby" ? {s: q.s, p: q.p, vis: q.vis} : null, a: G.ph === "rev" || G.ph === "end" ? (q ? q.a : null) : null,
    rem: G.ph === "q" ? Math.max(0, G.endAt - Date.now()) : 0, lb: lb().slice(0, 10), np: Object.keys(G.pl).length}; };
  var bcast = function(){ send(state()); };
  var next = function(){ G.qi++; if(G.qi >= Q.length){ G.ph = "end"; draw(); bcast(); return; } G.ph = "q"; G.ans = {}; G.endAt = Date.now() + sec * 1000; draw(); bcast(); };
  var reveal = function(){ if(G.ph !== "q") return; G.ph = "rev"; draw(); bcast(); };
  timers.push(setInterval(function(){ if(G.ph === "q" && Date.now() >= G.endAt) reveal(); if(G.ph === "q") drawTimer(); bcast(); }, 2000));
  timers.push(setInterval(function(){ if(G.ph === "q") drawTimer(); }, 250));
  var drawTimer = function(){ var t = B.querySelector(".lqTime"); if(t) t.textContent = Math.ceil(Math.max(0, G.endAt - Date.now()) / 1000) + " s"; };
  var draw = function(){ var np = Object.keys(G.pl).length, L0 = lb();
    if(G.ph === "lobby") B.innerHTML = '<div class="lqCode"><small>' + L("Kod sertai", "Join code") + '</small><b>' + code.slice(0, 3) + " " + code.slice(3) + '</b><small>' + L("Learn › Sekolah › Kuiz kelas langsung › Sertai", "Learn › School › Live class quiz › Join") + '</small></div>' +
      '<div class="lqPl">' + (np ? Object.keys(G.pl).map(function(k){ return '<span>' + esc(G.pl[k].n) + '</span>'; }).join("") : '<span class="mut">' + L("Menunggu murid…", "Waiting for pupils…") + '</span>') + '</div>' +
      '<button class="btn gold full g3d" id="lqStart"' + (np ? '' : ' disabled') + '>▶ ' + L("Mula", "Start") + ' (' + np + ' ' + L("murid", "pupils") + ', ' + Q.length + ' ' + L("soalan", "questions") + ')</button>';
    else if(G.ph === "q"){ var q = Q[G.qi]; B.innerHTML = '<div class="lqHd"><span>' + (G.qi + 1) + "/" + Q.length + '</span><b class="lqTime"></b><span>' + Object.keys(G.ans).length + "/" + np + ' ' + L("jawab", "answered") + '</span></div><div class="lqQ">' + esc(q.s) + '</div>' + visHtml(q) +
      '<div class="lqOpts">' + q.p.map(function(o, i){ return '<div class="lqO" style="--c:' + COL[i] + '"><i>' + SH[i] + '</i>' + esc(o) + '</div>'; }).join("") + '</div><button class="btn alt full" id="lqSkip">⏭ ' + L("Tunjuk jawapan", "Show the answer") + '</button>'; drawTimer(); }
    else if(G.ph === "rev"){ var q2 = Q[G.qi], right = Object.keys(G.ans).filter(function(k){ return G.ans[k].ok; }).length; B.innerHTML = '<div class="lqQ">' + esc(q2.s) + '</div><div class="lqOpts">' + q2.p.map(function(o, i){ return '<div class="lqO' + (i === q2.a ? ' ok' : ' dim') + '" style="--c:' + COL[i] + '"><i>' + SH[i] + '</i>' + esc(o) + '</div>'; }).join("") + '</div>' +
      '<div class="mut small" style="margin:6px 0">✓ ' + right + "/" + np + '</div>' + lbHtml(L0.slice(0, 5)) + '<button class="btn gold full g3d" id="lqNext">' + (G.qi + 1 < Q.length ? '▶ ' + L("Soalan seterusnya", "Next question") : '🏆 ' + L("Keputusan", "Results")) + '</button>'; }
    else B.innerHTML = '<div class="lqPod">' + [1, 0, 2].map(function(i){ var x = L0[i]; return x ? '<div class="lqP' + (i + 1) + '"><span>' + ["🥇", "🥈", "🥉"][i] + '</span><b>' + esc(x[0]) + '</b><small>' + x[1] + '</small><i></i></div>' : ''; }).join("") + '</div>' + lbHtml(L0) + '<button class="btn alt full" id="lqAgain">🔁 ' + L("Kuiz baharu", "New quiz") + '</button>';
    var s0 = B.querySelector("#lqStart"); if(s0) s0.onclick = next; var sk = B.querySelector("#lqSkip"); if(sk) sk.onclick = reveal; var nx = B.querySelector("#lqNext"); if(nx) nx.onclick = next;
    var ag = B.querySelector("#lqAgain"); if(ag) ag.onclick = function(){ close(); host(); }; };
  draw(); bcast(); }
function lbHtml(L0){ return '<ol class="lqLb">' + L0.map(function(x, i){ return '<li><span>' + (i + 1) + '</span><b>' + esc(x[0]) + '</b><em>' + x[1] + '</em></li>'; }).join("") + '</ol>'; }

// ---------- player ----------
function join(){ var nm = (ctx.kid && ctx.kid.id !== "me" ? ctx.kid.n : (H.load("ihsan_settings", {}) || {}).uname) || "";
  var ov = H.showSheet("🙋 " + L("Sertai kuiz kelas", "Join a class quiz"), '<input id="lqC" class="rin" inputmode="numeric" maxlength="7" placeholder="' + L("Kod 6 digit", "6-digit code") + '" style="font-size:24px;text-align:center;letter-spacing:4px">' +
    '<input id="lqNm" class="rin" maxlength="20" value="' + esc(nm) + '" placeholder="' + L("Nama anda", "Your name") + '" style="margin-top:8px"><button class="btn gold full g3d" id="lqJ" style="margin-top:10px">▶ ' + L("Sertai", "Join") + '</button>');
  ov.querySelector("#lqJ").onclick = function(){ var c = ov.querySelector("#lqC").value.replace(/\D/g, ""), n = ov.querySelector("#lqNm").value.trim(); if(c.length !== 6 || !n){ H.toast(L("Masukkan kod 6 digit dan nama", "Enter the 6-digit code and a name")); return; } H.closeOverlay(); runPlayer(c, n); }; }
function runPlayer(code, name){ var B = shell(L("Kuiz kelas", "Class quiz") + " · " + code), P = {st: null, my: {}, endAt: 0, joined: false, myKey: keyMe().pub.slice(0, 8)};
  var draw = function(){ var s = P.st; if(!s){ B.innerHTML = '<div class="lqWait">⏳ ' + L("Menyambung… pastikan kod betul dan ada internet.", "Connecting… check the code and the internet.") + '</div>'; return; }
    var meRow = (s.lb || []).filter(function(x){ return x[2] === P.myKey; })[0], rank = (s.lb || []).indexOf(meRow) + 1;
    if(s.ph === "lobby") B.innerHTML = '<div class="lqWait">✅ ' + L("Anda dalam kuiz, ", "You're in, ") + '<b>' + esc(name) + '</b>.<br>' + L("Tunggu guru mula…", "Wait for the teacher to start…") + '<br><small>' + s.np + ' ' + L("murid", "pupils") + '</small></div>';
    else if(s.ph === "q" && s.q){ var mine = P.my[s.qi]; B.innerHTML = '<div class="lqHd"><span>' + (s.qi + 1) + "/" + s.n + '</span><b class="lqTime"></b><span></span></div><div class="lqQ">' + esc(s.q.s) + '</div>' + visHtml(s.q) +
      '<div class="lqOpts">' + s.q.p.map(function(o, i){ return '<button class="lqO' + (mine != null ? (mine === i ? ' pick' : ' dim') : '') + '" data-lqa="' + i + '" style="--c:' + COL[i] + '"' + (mine != null ? ' disabled' : '') + '><i>' + SH[i] + '</i>' + esc(o) + '</button>'; }).join("") + '</div>' + (mine != null ? '<div class="lqWait">' + L("Jawapan dihantar. Tunggu…", "Answer sent. Wait…") + '</div>' : '');
      B.querySelectorAll("[data-lqa]").forEach(function(b){ b.onclick = function(){ var c = +b.getAttribute("data-lqa"); P.my[s.qi] = c; send({t: "a", qi: s.qi, c: c}); if(H.N.vibrate) H.N.vibrate(30); draw(); }; }); tick(); }
    else if(s.ph === "rev"){ var m2 = P.my[s.qi], ok = m2 === s.a; B.innerHTML = '<div class="lqRes ' + (m2 == null ? 'none' : ok ? 'ok' : 'no') + '">' + (m2 == null ? '⏱ ' + L("Tidak sempat", "Too late") : ok ? '🎉 ' + L("Betul!", "Correct!") : '😅 ' + L("Belum betul", "Not this time")) + '</div>' +
      (s.q ? '<div class="mut small" style="text-align:center">' + L("Jawapan: ", "Answer: ") + '<b>' + esc(s.q.p[s.a]) + '</b></div>' : '') + '<div class="lqMe">' + (meRow ? L("Markah anda: ", "Your score: ") + '<b>' + meRow[1] + '</b> · #' + rank : '') + '</div>' + lbHtml((s.lb || []).slice(0, 5)); }
    else if(s.ph === "end") B.innerHTML = '<div class="lqRes ok">🏆 ' + (rank ? L("Tempat ke-", "Place #") + rank : L("Tamat", "Finished")) + '</div>' + lbHtml(s.lb || []); };
  var tick = function(){ var t = B.querySelector(".lqTime"); if(t) t.textContent = Math.ceil(Math.max(0, P.endAt - Date.now()) / 1000) + " s"; };
  timers.push(setInterval(tick, 250));
  timers.push(setInterval(function(){ var inLb = P.st && (P.st.lb || []).some(function(x){ return x[2] === P.myKey; }); if(!inLb) send({t: "j", n: name}); }, 3000));
  connect(code, function(o){ if(o.t !== "st") return; var changed = !P.st || P.st.ph !== o.ph || P.st.qi !== o.qi; P.st = o; if(o.ph === "q") P.endAt = Date.now() + o.rem; if(changed || o.ph !== "q") draw(); });
  setTimeout(function(){ send({t: "j", n: name}); }, 1200); draw(); }

window.LiveQuiz = {open: function(mode, c){ ctx = c || {}; H = ctx.H; if(!K){ H.toast("NostrKit"); return; }
  if(!document.getElementById("lqCss")){ var l = document.createElement("link"); l.id = "lqCss"; l.rel = "stylesheet"; l.href = "silibus/live.css"; document.head.appendChild(l); }
  if(mode === "host") host(); else join(); }};
})();
