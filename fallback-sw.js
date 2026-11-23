/* myihsan.app (0.7.14): some office / school Wi-Fi firewalls block or intercept this site ("Your connection is not private").
   For people who opened myihsan.app before on a normal network, this helper is already in their browser: when a page here
   cannot be reached, it opens the same page on the backup copy https://ihsanrahim.github.io/My-Ihsan-Wifi/ (copied every hour).
   Only for myihsan.app itself; the web app (/app/) has its own helper (app/sw.js). Best effort: some browsers skip it on certificate errors. */
var ALT = "https://ihsanrahim.github.io/My-Ihsan-Wifi/";
self.addEventListener("install", function(){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function(e){ var u = new URL(e.request.url);
  if(e.request.mode !== "navigate" || u.origin !== location.origin || location.hostname !== "myihsan.app" || u.pathname.indexOf("/app/") === 0) return;
  e.respondWith(fetch(e.request).catch(function(){ return Response.redirect(ALT + u.pathname.replace(/^\//, "") + u.search, 302); })); });
