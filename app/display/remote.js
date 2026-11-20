/* My Ihsan 0.5.23: phone remote for the masjid TV display (Paparan).
   The TV shows a pairing code (and QR). The committee's phone enters it and can then: send a big announcement for N minutes,
   change the rolling ticker, turn the slideshow pages, pause or resume them, and clear everything.
   Transport: the same free public Nostr relays Groups uses, ephemeral events (kind 20778, not stored by relays),
   AES-GCM encrypted with a key made from the code. Needs internet on both. Nothing is kept on any server.
   DsRemote.tv(code, onCmd) -> {stop}; DsRemote.phone(code, onState) -> {send(cmd), stop} */
(function(){ "use strict";
var K = window.NostrKit, KIND = 20778, RELAYS = window.LQ_RELAYS || ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net"];
function hex(b){ return K.bytesToHex(b); } function unhex(h){ return K.hexToBytes(h); }
function sha(s){ return hex(K.sha256(K.utf8ToBytes(s))); }
function b64(u8){ var s = ""; for(var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); }
function unb64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
function seal(key, o){ var n = K.randomBytes(12), ct = K.gcm(unhex(key), n).encrypt(K.utf8ToBytes(JSON.stringify(o))), out = new Uint8Array(12 + ct.length); out.set(n); out.set(ct, 12); return b64(out); }
function unseal(key, s){ try{ var u = unb64(s), pt = K.gcm(unhex(key), u.slice(0, 12)).decrypt(u.slice(12)); return JSON.parse(new TextDecoder().decode(pt)); }catch(e){ return null; } }
function norm(code){ return String(code||"").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
function newCode(){ var a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", b = K.randomBytes(8), s = ""; for(var i = 0; i < 8; i++) s += a[b[i] % a.length]; return s.slice(0, 4)+"-"+s.slice(4); }
function client(code, onMsg){ var c = norm(code), key = sha("myihsan-tv-key:"+c), tag = sha("myihsan-tv-tag:"+c).slice(0, 32), ws = [], seen = {}, alive = true;
  var sk = K.schnorr.utils.randomPrivateKey(), me = {sk: hex(sk), pub: hex(K.schnorr.getPublicKey(sk))};
  var open1 = function(u){ var w; try{ w = new WebSocket(u); }catch(e){ return; } ws.push(w);
    w.onopen = function(){ try{ w.send(JSON.stringify(["REQ", "tv"+tag.slice(0, 8), {kinds: [KIND], "#t": [tag], since: Math.floor(Date.now()/1000) - 30}])); }catch(e){} if(api.onOpen) api.onOpen(); };
    w.onmessage = function(m){ var d; try{ d = JSON.parse(m.data); }catch(e){ return; } if(d[0] !== "EVENT" || !d[2] || seen[d[2].id] || d[2].pubkey === me.pub) return; seen[d[2].id] = 1; var o = unseal(key, d[2].content); if(o) onMsg(o); };
    w.onclose = function(){ ws = ws.filter(function(x){ return x !== w; }); if(alive) setTimeout(function(){ if(alive) open1(u); }, 4000); };
    w.onerror = function(){}; };
  var api = {send: function(o){ var e = {pubkey: me.pub, created_at: Math.floor(Date.now()/1000), kind: KIND, tags: [["t", tag]], content: seal(key, o)};
      e.id = sha(JSON.stringify([0, e.pubkey, e.created_at, e.kind, e.tags, e.content])); e.sig = hex(K.schnorr.sign(unhex(e.id), unhex(me.sk))); seen[e.id] = 1;
      var n = 0; ws.forEach(function(w){ if(w.readyState === 1) try{ w.send(JSON.stringify(["EVENT", e])); n++; }catch(x){} }); return n; },
    stop: function(){ alive = false; ws.forEach(function(w){ try{ w.close(); }catch(e){} }); ws = []; }, live: function(){ return ws.filter(function(w){ return w.readyState === 1; }).length; }};
  RELAYS.forEach(open1); return api; }
// TV side: answers "hi" with its state so the phone shows what is on screen
function tv(code, onCmd, getState){ var api = client(code, function(o){ if(o.cmd === "hi"){ api.send({st: getState ? getState() : {}}); return; } onCmd(o); if(o.cmd) api.send({ok: o.cmd, st: getState ? getState() : {}}); });
  api.onOpen = function(){ api.send({st: getState ? getState() : {}, up: 1}); }; return api; }
function phone(code, onState){ var api = client(code, function(o){ if(o.st) onState(o.st, o); }); api.onOpen = function(){ api.send({cmd: "hi"}); }; return api; }
window.DsRemote = {tv: tv, phone: phone, newCode: newCode, norm: norm};
})();
