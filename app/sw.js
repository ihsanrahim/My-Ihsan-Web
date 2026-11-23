var C = "myihsan-0.7.19";
self.addEventListener("install", function(e){ e.waitUntil(caches.open(C).then(function(c){ return c.addAll(["./", "index.html", "style.css", "app.js", "webbridge.js", "config.js", "data.js", "i18n.js", "icons.js"]).catch(function(){}); })); self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== C; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener("fetch", function(e){ var u = new URL(e.request.url); if(e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function(r){ if(r.ok){ var cp = r.clone(); caches.open(C).then(function(c){ c.put(e.request, cp); }); } return r; }).catch(function(){ return caches.match(e.request, {ignoreSearch:true}).then(function(m){
    // 0.7.14: myihsan.app cannot be reached (e.g. an office firewall) and this page is not saved yet: open the backup copy instead
    if(!m && e.request.mode === "navigate" && location.hostname === "myihsan.app") return Response.redirect("https://ihsanrahim.github.io/My-Ihsan-Wifi/app/" + u.search, 302); return m; }); })); });
