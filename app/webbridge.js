/* My Ihsan · web bridge (0.6.56). The full app in a browser (My-Ihsan-Web/app/): app.js calls IhsanWeb.patch(N) after its own web
   fallbacks, so the phone calls the app makes (Native.*) use what a browser can do instead:
   Google sign-in for Drive sync (Google Identity Services token client, scope drive.appdata = the person's own hidden app folder),
   speech (speechSynthesis / SpeechRecognition), location + GPS watch, compass (DeviceOrientation), camera / photos / files (file
   pickers), share, copy, save + print, keep the screen on (Wake Lock), notifications while the page is open, web requests (fetch).
   Things a browser cannot do at all (app usage, screen time, the phone home screen, step sensor, the speaker / broadcast audio engine,
   calendar sync, widgets) stay greyed out in the app with "📱 Android app" (see WEB_PHONE in app.js). Nothing is sent anywhere except
   the person's own Google Drive and the sites the app already uses. */
(function(){ "use strict";
var CFG = window.MYIHSAN_CFG || {}, emit = function(t, d){ try{ window.onNative(t, d); }catch(e){} };
function pick(accept, capture, cb){ var i = document.createElement("input"); i.type = "file"; i.accept = accept || "*/*"; if(capture) i.setAttribute("capture", capture);
  i.style.display = "none"; document.body.appendChild(i); var done = false;
  i.onchange = function(){ done = true; var f = i.files && i.files[0]; i.remove(); cb(f || null); };
  // a closed picker without a file: the next focus tells
  window.addEventListener("focus", function f2(){ window.removeEventListener("focus", f2); setTimeout(function(){ if(!done){ i.remove(); cb(null); } }, 800); });
  i.click(); }
function readAs(f, how){ return new Promise(function(ok, no){ var r = new FileReader(); r.onload = function(){ ok(r.result); }; r.onerror = no; r[how](f); }); }
function shrink(dataUrl, max, q){ return new Promise(function(ok){ var im = new Image(); im.onload = function(){ var s = Math.min(1, (max || 1600) / Math.max(im.width, im.height)), c = document.createElement("canvas");
  c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL("image/jpeg", q || .85)); }; im.onerror = function(){ ok(dataUrl); }; im.src = dataUrl; }); }
function download(name, blob){ var a = document.createElement("a"), u = URL.createObjectURL(blob); a.href = u; a.download = name || "my-ihsan.txt"; document.body.appendChild(a); a.click(); setTimeout(function(){ a.remove(); URL.revokeObjectURL(u); }, 2000); }
function b64Blob(b64, mime){ var s = atob(b64 || ""), a = new Uint8Array(s.length); for(var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return new Blob([a], {type:mime || "application/octet-stream"}); }
function shareFiles(files, text){ try{ if(navigator.canShare && navigator.canShare({files:files})) return navigator.share({files:files, text:text || undefined}); }catch(e){} return Promise.reject(new Error("noshare")); }
function lang(l){ return !l ? "ms-MY" : l === "en" ? "en-GB" : l === "ar" ? "ar-SA" : l === "ms" ? "ms-MY" : l; }
function fetchTo(evt, id, url, opt){ fetch(url, opt || {}).then(function(r){ return r.text().then(function(t){ emit(evt, {id:id, status:r.status, body:t}); }); }).catch(function(e){ emit(evt, {id:id, status:0, body:String(e && e.message || e)}); }); }
function hdrs(j){ try{ return JSON.parse(j || "{}") || {}; }catch(e){ return {}; } }

// ---------- Google sign-in (token in memory only; Drive appdata scope) ----------
var TOK = null, tc = null, waiting = [], EMAIL = "";
function gis(){ return !!(window.google && google.accounts && google.accounts.oauth2); }
function loadGis(){ return new Promise(function(ok){ if(gis()){ ok(true); return; } var s = document.querySelector('script[data-gis]');
  if(!s){ s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.setAttribute("data-gis", "1"); document.head.appendChild(s); }
  var n = 0, t = setInterval(function(){ if(gis() || ++n > 100){ clearInterval(t); ok(gis()); } }, 100); }); }
function token(interactive){
  if(TOK && TOK.exp > Date.now() + 60000) return Promise.resolve(TOK);
  if(!CFG.webClientId) return Promise.resolve({err:"config"});
  return loadGis().then(function(ok){ if(!ok) return {err:"offline"}; return new Promise(function(done){ waiting.push(done);
    if(!tc) tc = google.accounts.oauth2.initTokenClient({client_id:CFG.webClientId, scope:CFG.scope || "https://www.googleapis.com/auth/drive.appdata openid email profile",
      callback:function(r){ var w = waiting; waiting = []; if(r && r.access_token){ TOK = {t:r.access_token, exp:Date.now() + (r.expires_in || 3600) * 1000}; w.forEach(function(f){ f(TOK); }); } else w.forEach(function(f){ f({err:(r && r.error) || "signin"}); }); },
      error_callback:function(e){ var w = waiting; waiting = []; w.forEach(function(f){ f({err:e && e.type === "popup_closed" ? "cancel" : "signin"}); }); }});
    if(waiting.length > 1) return;
    try{ tc.requestAccessToken({prompt:interactive ? "select_account" : "", hint:EMAIL || undefined}); }catch(e){ var w = waiting; waiting = []; w.forEach(function(f){ f({err:"signin"}); }); } }); }); }

// ---------- notifications while the page is open ----------
var NT = [];
function schedule(timesJson, setJson){ NT.forEach(clearTimeout); NT = []; if(!("Notification" in window) || Notification.permission !== "granted") return;
  var times = [], st = {}; try{ times = JSON.parse(timesJson) || []; st = JSON.parse(setJson) || {}; }catch(e){ return; }
  var on = st.notif || {}, bm = st.lang !== "en", now = Date.now();
  times.forEach(function(x){ var k = x.k === "jumaat" ? "zohor" : x.k; if(on[k] === false || !x.t || x.t <= now || x.t - now > 864e5) return;
    NT.push(setTimeout(function(){ try{ new Notification((x.n || x.k) + " · " + new Date(x.t).toLocaleTimeString([], {hour:"numeric", minute:"2-digit"}), {body:bm ? "Telah masuk waktu " + (x.n || x.k) + "." : "It's time for " + (x.ne || x.n || x.k) + ".", icon:"icon-192.png"}); }catch(e){} }, x.t - now)); }); }

var compassFn = null, gpsId = null, rec = null, wake = null, voices = [];
function patch(N, A){ A = A || {};
  N.info = function(){ return JSON.stringify({sdk:0, version:"web", platform:"web"}); };
  N.hasPerm = function(w){ if(/notif/.test(w)) return "Notification" in window && Notification.permission === "granted"; return true; };
  N.requestPerm = function(w){ if(/notif/.test(w) && "Notification" in window){ Notification.requestPermission().then(function(p){ emit("perm", {which:w, granted:p === "granted"}); }); return; }
    if(/mic|audio|record/.test(w) && navigator.mediaDevices){ navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){ s.getTracks().forEach(function(t){ t.stop(); }); emit("perm", {which:w, granted:true}); }, function(){ emit("perm", {which:w, granted:false}); }); return; }
    if(/cam/.test(w) && navigator.mediaDevices){ navigator.mediaDevices.getUserMedia({video:true}).then(function(s){ s.getTracks().forEach(function(t){ t.stop(); }); emit("perm", {which:w, granted:true}); }, function(){ emit("perm", {which:w, granted:false}); }); return; }
    setTimeout(function(){ emit("perm", {which:w, granted:true}); }, 30); };
  N.playServicesOk = function(){ return true; };
  // Google Drive sync: the same "drive" answers as the Android app
  N.driveSignIn = function(){ token(true).then(function(t){ if(t.err){ emit("drive", {id:"signin", ok:false, err:t.err === "access_denied" ? "consent" : t.err}); return; }
    fetch("https://www.googleapis.com/oauth2/v3/userinfo", {headers:{Authorization:"Bearer " + t.t}}).then(function(r){ return r.json(); }).then(function(u){ EMAIL = u.email || ""; emit("drive", {id:"signin", ok:true, token:t.t, exp:t.exp, email:EMAIL}); },
      function(){ emit("drive", {id:"signin", ok:true, token:t.t, exp:t.exp, email:""}); }); }); };
  N.driveToken = function(id, interactive){ token(!!interactive).then(function(t){ if(t.err) emit("drive", {id:id, ok:false, err:t.err === "config" ? "signin" : t.err}); else emit("drive", {id:id, ok:true, token:t.t, exp:t.exp, email:EMAIL}); }); };
  N.driveInvalidate = function(){ TOK = null; };
  N.driveSignOut = function(t){ try{ if(gis() && (t || TOK)) google.accounts.oauth2.revoke(t || TOK.t, function(){}); }catch(e){} TOK = null; };
  N.driveAccountName = function(){ return EMAIL; };
  // location, GPS watch, compass
  N.getLocation = function(){ if(!navigator.geolocation){ emit("location", {error:"none"}); return; }
    navigator.geolocation.getCurrentPosition(function(p){ emit("location", {lat:p.coords.latitude, lon:p.coords.longitude, acc:p.coords.accuracy}); }, function(e){ emit("location", {error:String(e && e.message || "denied")}); }, {enableHighAccuracy:false, timeout:15000, maximumAge:600000}); };
  N.gpsWatch = function(on){ if(gpsId != null){ navigator.geolocation.clearWatch(gpsId); gpsId = null; } if(!on || !navigator.geolocation) return;
    gpsId = navigator.geolocation.watchPosition(function(p){ var c = p.coords; emit("gps", {lat:c.latitude, lon:c.longitude, acc:c.accuracy, alt:c.altitude || 0, spd:c.speed == null ? -1 : c.speed, t:p.timestamp, p:"gps"}); },
      function(e){ emit("gps", {err:e && e.code === 1 ? "denied" : "disabled"}); }, {enableHighAccuracy:true, maximumAge:0, timeout:30000}); };
  N.startCompass = function(){ N.stopCompass(); var got = false, go = function(){ compassFn = function(e){ var h = e.webkitCompassHeading; if(h == null && (e.absolute || e.type === "deviceorientationabsolute") && e.alpha != null) h = 360 - e.alpha;
        if(h != null){ got = true; emit("heading", {deg:(h + 360) % 360, acc:3}); } };
      window.addEventListener("deviceorientationabsolute", compassFn, true); window.addEventListener("deviceorientation", compassFn, true);
      setTimeout(function(){ if(!got && compassFn) emit("heading", {error:"nosensor"}); }, 3000); };
    var D = window.DeviceOrientationEvent; if(!D){ emit("heading", {error:"nosensor"}); return; }
    if(typeof D.requestPermission === "function") D.requestPermission().then(function(s){ if(s === "granted") go(); else emit("heading", {error:"denied"}); }, function(){ var once = function(){ document.removeEventListener("click", once, true); D.requestPermission().then(function(s){ if(s === "granted") go(); }, function(){}); }; document.addEventListener("click", once, true); });
    else go(); };
  N.stopCompass = function(){ if(compassFn){ window.removeEventListener("deviceorientationabsolute", compassFn, true); window.removeEventListener("deviceorientation", compassFn, true); } compassFn = null; };
  N.setCompassCam = function(){};
  // speech out
  var loadV = function(){ try{ voices = speechSynthesis.getVoices() || []; }catch(e){ voices = []; } return voices; };
  try{ speechSynthesis.onvoiceschanged = loadV; loadV(); }catch(e){}
  var VO = {};
  N.speak = function(text, l){ try{ speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text), L = lang(l), pref = VO[l] || VO._;
      u.lang = L; var v = loadV().filter(function(x){ return pref && x.name === pref.n; })[0] || loadV().filter(function(x){ return x.lang && x.lang.replace("_", "-").toLowerCase().indexOf(L.slice(0, 2).toLowerCase()) === 0; })[0]; if(v) u.voice = v;
      if(pref){ if(pref.p) u.pitch = pref.p; if(pref.r) u.rate = pref.r; }
      u.onend = function(){ emit("ttsdone", {}); emit("speakDone", {}); }; u.onerror = function(){ emit("tts", {err:"web"}); emit("ttsdone", {}); };
      u.onboundary = function(e){ emit("ttsrange", {s:e.charIndex, e:e.charIndex + (e.charLength || 1)}); }; speechSynthesis.speak(u); }catch(e){ emit("ttsdone", {}); } };
  N.stopSpeak = function(){ try{ speechSynthesis.cancel(); }catch(e){} };
  var vlist = function(f){ return loadV().filter(f || function(x){ return /^ar/i.test(x.lang); }).map(function(x){ return {n:x.name, male:/male|man|\bm\b/i.test(x.name) && !/female/i.test(x.name), net:!x.localService, loc:x.lang}; }); };
  N.getVoices = function(){ setTimeout(function(){ emit("voices", vlist()); }, loadV().length ? 0 : 600); };
  N.getVoicesFor = function(l){ var L = lang(l).slice(0, 2).toLowerCase(); setTimeout(function(){ emit("voices", vlist(function(x){ return (x.lang || "").toLowerCase().indexOf(L) === 0; })); }, loadV().length ? 0 : 600); };
  N.setVoice = function(n, p){ VO._ = {n:n, p:p}; VO.ar = VO._; };
  N.setVoiceFor = function(l, n, p, r){ VO[l] = {n:n, p:p, r:r}; };
  // speech in (Chrome / Edge / Safari)
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  N.canListen = function(){ return !!SR; };
  N.listen = function(l){ N.stopListen(); if(!SR){ emit("speech", {err:"none"}); return; }
    try{ rec = new SR(); rec.lang = l || "ar-SA"; rec.interimResults = true; rec.maxAlternatives = 5; rec.continuous = false;
      rec.onstart = function(){ emit("speech", {ready:true}); };
      rec.onresult = function(e){ var r = e.results[e.results.length - 1], t = ""; for(var i = 0; i < r.length; i++) t += r[i].transcript + " | "; emit("speech", {t:t, final:!!r.isFinal}); };
      rec.onerror = function(e){ emit("speech", {err:e.error === "no-speech" ? 6 : e.error === "not-allowed" ? 9 : 7}); };
      rec.start(); }catch(e){ emit("speech", {err:"start"}); } };
  N.stopListen = function(){ if(rec){ try{ rec.abort(); }catch(e){} rec = null; } };
  N.speechOffline = function(){};
  // pictures, files, contacts
  N.pickImage = function(mode){ pick("image/*", mode === "camera" ? "environment" : "", function(f){ if(!f){ emit("image", {cancel:true}); return; } readAs(f, "readAsDataURL").then(function(d){ return shrink(d, 1600, .85); }).then(function(d){ emit("image", {data:d}); }, function(){ emit("image", {error:"read"}); }); }); };
  N.pickBin = function(){ pick("*/*", "", function(f){ if(!f){ emit("binfile", {cancel:true}); return; } readAs(f, "readAsDataURL").then(function(d){ emit("binfile", {mime:f.type || "application/octet-stream", b64:String(d).split(",")[1] || "", name:f.name}); }, function(e){ emit("binfile", {error:String(e)}); }); }); };
  N.openFile = function(){ pick(".json,.ihsan,.ihsanbiz,.txt,application/json,text/*", "", function(f){ if(!f) return; readAs(f, "readAsText").then(function(t){ emit("opened", {body:t, name:f.name}); }, function(e){ emit("fileError", {error:String(e)}); }); }); };
  N.pickContact = function(){ if(navigator.contacts && navigator.contacts.select){ navigator.contacts.select(["name", "tel"], {multiple:false}).then(function(a){ var c = a && a[0]; if(!c){ emit("contact", {cancel:true}); return; } emit("contact", {n:(c.name || [""])[0], tel:(c.tel || [""])[0]}); }, function(){ emit("contact", {cancel:true}); }); } else emit("contact", {cancel:true}); };
  N.saveFile = function(name, content){ download(name, new Blob([content], {type:"application/json"})); emit("saved", {}); };
  N.saveBackupZip = function(name, json){ download(String(name || "my-ihsan").replace(/\.zip$/, ".json"), new Blob([json], {type:"application/json"})); emit("saved", {}); };
  N.backupFilesSize = function(){ return 0; };
  N.openTextFile = function(name, mime, content, share){ var b = new Blob([content], {type:mime || "text/plain"}); if(share) shareFiles([new File([b], name, {type:mime || "text/plain"})]).catch(function(){ download(name, b); }); else download(name, b); };
  N.shareFile = function(name, content, mime){ var b = new Blob([content], {type:mime || "text/plain"}); shareFiles([new File([b], name, {type:mime || "text/plain"})]).catch(function(){ download(name, b); }); };
  N.shareBinary = function(name, b64, mime, text){ var b = b64Blob(b64, mime); shareFiles([new File([b], name, {type:mime})], text).catch(function(){ download(name, b); }); };
  N.imageSave = function(name, dataUrl){ download(name || "my-ihsan.png", b64Blob(String(dataUrl).split(",")[1], "image/png")); return true; };
  // share, copy, open
  N.shareText = function(t){ if(navigator.share) navigator.share({text:t}).catch(function(){}); else { N.copyText(t); if(A.toast) A.toast("📋 " + (A.en && A.en() ? "Copied" : "Disalin")); } };
  N.shareImage = function(dataUrl, text){ var b = b64Blob(String(dataUrl).split(",")[1], "image/png"); shareFiles([new File([b], "my-ihsan.png", {type:"image/png"})], text).catch(function(){ download("my-ihsan.png", b); }); };
  N.shareTo = function(pkg, dataUrl, text){ if(dataUrl) N.shareImage(dataUrl, text); else N.shareText(text); };
  N.copyText = function(t){ try{ navigator.clipboard.writeText(t); }catch(e){ var x = document.createElement("textarea"); x.value = t; document.body.appendChild(x); x.select(); try{ document.execCommand("copy"); }catch(e2){} x.remove(); } };
  N.clipText = function(){ return ""; };
  N.openUrl = function(u){ window.open(u, "_blank", "noopener"); };
  N.openWeb = function(u){ window.open(u, "_blank", "noopener"); };
  N.openMaps = function(q, la, lo){ window.open("https://www.google.com/maps/search/" + encodeURIComponent(q || "") + (la ? "/@" + la + "," + lo + ",14z" : ""), "_blank", "noopener"); };
  // print
  N.printPage = function(){ window.print(); emit("printed", {}); };
  N.printHtml = function(html, title){ var f = document.createElement("iframe"); f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0"; document.body.appendChild(f);
    var d = f.contentWindow.document; d.open(); d.write(html); d.close(); d.title = title || "My Ihsan"; setTimeout(function(){ try{ f.contentWindow.focus(); f.contentWindow.print(); }catch(e){} emit("printed", {}); setTimeout(function(){ f.remove(); }, 60000); }, 600); };
  // screen, feel, notifications
  N.keepScreenOn = function(on){ try{ if(on && navigator.wakeLock && !wake) navigator.wakeLock.request("screen").then(function(w){ wake = w; w.addEventListener("release", function(){ wake = null; }); }, function(){}); else if(!on && wake){ wake.release(); wake = null; } }catch(e){} };
  N.keepAwake = function(on){ N.keepScreenOn(on); };
  N.vibrate = function(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms || 30); }catch(e){} };
  N.setSchedule = function(t, s){ clearTimeout(N._sc); N._sc = setTimeout(function(){ schedule(t, s); }, 1200); };
  N.testNotification = function(){ if(!("Notification" in window)){ if(A.toast) A.toast("—"); return; } Notification.requestPermission().then(function(p){ if(p === "granted") setTimeout(function(){ try{ new Notification("My Ihsan", {body:"Notifikasi ujian / Test notification", icon:"icon-192.png"}); }catch(e){} }, 1500); }); };
  // web requests: straight from the browser (sites that do not allow browsers answer status 0)
  N.fetchUrl = function(id, url){ fetchTo("fetch", id, url); };
  N.fetchText = N.fetchUrl;
  N.fetchPage = function(id, url){ fetchTo("fetch", id, url); };
  N.getJson = function(id, url, h){ fetchTo("get", id, url, {headers:hdrs(h)}); };
  N.postJson = function(id, url, h, body){ var hh = hdrs(h); if(!hh["Content-Type"] && !hh["content-type"]) hh["Content-Type"] = "application/json"; fetchTo("post", id, url, {method:"POST", headers:hh, body:body}); };
  N.postText = function(id, url, body){ fetchTo("post", id, url, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:body}); };
  N.fetchImage = function(id, url){ fetch(url).then(function(r){ return r.blob(); }).then(function(b){ return readAs(b, "readAsDataURL"); }).then(function(d){ emit("img", {id:id, data:d}); }, function(){ emit("img", {id:id, error:"fetch"}); }); };
  // Back key: the browser's own back button walks the app's history
  try{ history.replaceState({ih:1}, ""); history.pushState({ih:2}, ""); window.addEventListener("popstate", function(){ var used = false; try{ used = window.onBack && window.onBack(); }catch(e){} if(used !== false) history.pushState({ih:2}, ""); }); }catch(e){}
  return N; }
// AI keys typed by the person: Anthropic asks browsers to say so in a header
try{ var f0 = window.fetch; window.fetch = function(u, o){ try{ if(/^https:\/\/api\.anthropic\.com\//.test(String(u && u.url || u))){ o = o || {}; var h = o.headers || {}; if(h instanceof Headers) h.set("anthropic-dangerous-direct-browser-access", "true"); else { h = Object.assign({}, h); h["anthropic-dangerous-direct-browser-access"] = "true"; } o.headers = h; } }catch(e){} return f0.call(this, u, o); }; }catch(e){}
window.IhsanWeb = {patch:patch, token:token};
})();
