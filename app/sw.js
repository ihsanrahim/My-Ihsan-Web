// My Ihsan web dashboard: caches the app shell only (never user data, which lives in IndexedDB and the user's own Drive)
var C = "myihsan-shell-v1", SHELL = ["./", "index.html", "app.css", "dash.js", "config.js", "sync/drivesync.js", "icon.svg", "manifest.webmanifest"];
self.addEventListener("install", function(e){ e.waitUntil(caches.open(C).then(function(c){ return c.addAll(SHELL); })); self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== C; }).map(function(k){ return caches.delete(k); })); })); });
self.addEventListener("fetch", function(e){ var u = new URL(e.request.url); if(e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function(r){ var cp = r.clone(); caches.open(C).then(function(c){ c.put(e.request, cp); }); return r; }).catch(function(){ return caches.match(e.request); })); });
