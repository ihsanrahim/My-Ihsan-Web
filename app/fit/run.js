/* My Ihsan 0.5.20: Exercise › Travel (🏃 Run · 🚴 Ride). A Strava-style tracker that uses the location ONLY while the app is
   open (no background location, no foreground service): distance, moving time, pace (run) or speed (ride), current pace or speed,
   km splits with a voice call-out, climb, auto-pause and resume, photos at places along the way, a history of every run and ride
   with personal bests, a satellite map (Esri World Imagery, free tiles with attribution) under the route, and a "brag" video
   (the route drawing itself, photos popping up where they were taken, rest stops, the stats, ending with "Made by My Ihsan").
   FitRun.view(box, H, api)   api: {addLog(o), kg(), type() -> "run"|"ride", redraw()}
   Storage: ihsan_runs [{id,ty,t0,t1,dist,mov,gain,kcal,pts:[[lat,lon,sec,alt]],splits:[sec per km],ph:[{id,lat,lon,s}],pz:[{s,dur,lat,lon}]}]
   (records from before Ride have no ty and count as runs). Photos are kept by the app (Native.photoAdd); only their ids are stored. */
(function(){
"use strict";
var H, L2, E, api, box0, R = null, timer = 0, gpsFn = null, webWatch = null, lastFixAt = 0, gpsInfo = "";
var KEY = "ihsan_runs";
var TY = {run: {ic: "🏃", jump: 12, slow: 0.5, go: 1.0, kcal: 1.0, voice: 1000, pb: [[1000, "1 km"], [5000, "5 km"], [10000, "10 km"], [21097, "21.1 km"]]},
          ride: {ic: "🚴", jump: 30, slow: 1.5, go: 2.5, kcal: 0.28, voice: 5000, pb: [[10000, "10 km"], [20000, "20 km"], [40000, "40 km"], [100000, "100 km"]]}};
function ty(){ return api && api.type ? (api.type() === "ride" ? "ride" : "run") : "run"; }
function tyOf(r){ return r.ty === "ride" ? "ride" : "run"; }
function runs(){ return H.load(KEY, []) || []; }
function saveRuns(l){ H.save(KEY, l.slice(-120)); }
function cfg(){ return H.load("ihsan_run_cfg", {}) || {}; }
function rad(d){ return d*Math.PI/180; }
function hav(a, b){ var R0 = 6371000, dl = rad(b[0]-a[0]), dn = rad(b[1]-a[1]), x = Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dn/2)*Math.sin(dn/2); return 2*R0*Math.atan2(Math.sqrt(x), Math.sqrt(1-x)); }
function hms(s){ s = Math.max(0, Math.round(s)); var h = Math.floor(s/3600), m = Math.floor(s%3600/60), x = s%60; return (h ? h+":"+String(m).padStart(2,"0") : m)+":"+String(x).padStart(2,"0"); }
function pace(sec, m){ if(!m || m < 20) return "–:––"; var p = sec/(m/1000); if(p > 3600) return "–:––"; return Math.floor(p/60)+":"+String(Math.round(p%60)).padStart(2,"0"); }
function kmh(sec, m){ if(!sec || m < 20) return "–"; return (m/sec*3.6).toFixed(1); }
function rate(t, sec, m){ return t === "ride" ? kmh(sec, m) : pace(sec, m); }
function rateU(t){ return t === "ride" ? L2("km/j", "km/h") : "/km"; }
function km(m){ return (m/1000).toFixed(m < 10000 ? 2 : 1); }
function now(){ return Date.now(); }
function hasNative(){ return !!(window.Native && H.N.gpsWatch); }

// ---------------- live tracking ----------------
function newRun(t){ return {id: "r"+now().toString(36), ty: t, t0: now(), t1: 0, dist: 0, mov: 0, gain: 0, kcal: 0, pts: [], splits: [], ph: [], pz: [], st: "run", lastT: now(), lastFix: 0, pauseAt: 0, slow: 0, acc: 0, curP: [], here: null}; }
function onFix(f){ if(!R || R.st === "done") return;
  if(f.err){ if(f.err === "approx"){ stopGps(); preciseHelp(); return; }
    status(f.err === "permission" ? L2("Kebenaran lokasi diperlukan.","Location permission is needed.") : f.err === "disabled" ? L2("Hidupkan Lokasi telefon.","Turn on the phone's Location.") : L2("Lokasi tidak tersedia.","Location is not available.")); return; }
  var T = TY[R.ty], t = f.t || now(), p = [f.lat, f.lon], last = R.pts[R.pts.length-1];
  R.acc = f.acc || 0; R.here = p; lastFixAt = now(); gpsInfo = "±"+Math.round(R.acc)+" m"+(f.p ? " · "+f.p : "");
  if(f.acc > 50){ status(L2("Mencari isyarat lokasi… ","Getting a location fix… ")+gpsInfo+(f.acc > 500 ? " · "+L2("pastikan Lokasi tepat dihidupkan","make sure Precise location is on") : "")); paint(); return; }
  status("📡 "+gpsInfo);
  if(R.st === "pause" && R.auto0 && last && (f.spd > T.go || (f.spd < 0 && hav(last, p) > 15))) resume();   // moving again
  if(R.st !== "run"){ R.lastFix = t; paint(); return; }
  var sec = R.mov;
  if(!last){ R.pts.push([+f.lat.toFixed(6), +f.lon.toFixed(6), Math.round(sec), Math.round(f.alt||0)]); R.lastFix = t; paint(); return; }
  var d = hav(last, p), dt = Math.max(0.5, (t-(R.lastFix||t))/1000);
  if(d/dt > T.jump) return;               // faster than possible: GPS noise
  var spd = f.spd >= 0 ? f.spd : d/dt;
  if(R.auto !== false){ if(spd < T.slow){ R.slow += dt; if(R.slow > 8){ pauseRun(true); return; } } else R.slow = 0; }
  if(d < Math.max(4, Math.min(12, R.acc/3))) { R.lastFix = t; paint(); return; }   // jitter
  var before = R.dist; R.dist += d; R.lastFix = t;
  var alt = Math.round(f.alt||0); if(last[3] && alt && alt-last[3] > 0 && alt-last[3] < 15) R.gain += alt-last[3];
  R.pts.push([+f.lat.toFixed(6), +f.lon.toFixed(6), Math.round(sec), alt]);
  R.curP.push([sec, R.dist]); while(R.curP.length > 2 && R.dist-R.curP[0][1] > (R.ty === "ride" ? 600 : 250)) R.curP.shift();
  if(Math.floor(R.dist/1000) > Math.floor(before/1000)){ var prev = R.splits.reduce(function(a, b){ return a+b; }, 0); R.splits.push(Math.round(sec-prev)); }
  if(Math.floor(R.dist/T.voice) > Math.floor(before/T.voice)){ if(H.N.vibrate) H.N.vibrate([80,60,80]);
    if(H.N.speak && R.voice !== false) try{ var k = Math.floor(R.dist/1000); H.N.speak(k+" km. "+(R.ty === "ride" ? kmh(sec, R.dist)+" "+L2("km sejam","km an hour") : L2("Rentak ","Pace ")+pace(sec, R.dist).replace(":", " min ")+" s"), H.en() ? "en" : "ms"); }catch(e){} }
  paint(); }
function startGps(){ if(gpsFn) return; gpsFn = function(f){ onFix(f); }; H.on("gps", gpsFn);
  if(hasNative()) H.N.gpsWatch(true);
  else if(navigator.geolocation) webWatch = navigator.geolocation.watchPosition(function(p){ onFix({lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy, alt: p.coords.altitude||0, spd: p.coords.speed==null?-1:p.coords.speed, t: p.timestamp}); }, function(){ onFix({err: "permission"}); }, {enableHighAccuracy: true, maximumAge: 0}); }
function stopGps(){ if(gpsFn) H.off("gps", gpsFn); gpsFn = null; if(hasNative()) H.N.gpsWatch(false); if(webWatch != null && navigator.geolocation) navigator.geolocation.clearWatch(webWatch); webWatch = null; }
function tick(){ if(!R || R.st === "done") return; var t = now(); if(R.st === "run") R.mov += (t-R.lastT)/1000; R.lastT = t;
  if(lastFixAt && t-lastFixAt > 15000) status(L2("Tiada isyarat lokasi sejak ","No location signal for ")+Math.round((t-lastFixAt)/1000)+" s");
  paint(); }
function preciseHelp(){ var ov = H.showSheet("📍 "+L2("Lokasi tepat diperlukan","Precise location is needed"),
    '<div class="small" style="line-height:1.6">'+L2("Lokasi ditetapkan kepada <b>Anggaran</b>, jadi setiap kedudukan dikaburkan kira-kira 2 km dan larian tidak dapat dijejak. Pilih <b>Tepat</b> (Precise). Google Maps menjejak dengan baik kerana ia ada kebenaran Tepat.","Location is set to <b>Approximate</b>, so every position is blurred by about 2 km and the route cannot be tracked. Choose <b>Precise</b>. Google Maps tracks fine because it has Precise permission.")+'</div>'+
    '<div class="btns" style="margin-top:10px"><button class="btn gold g3d" id="rnPr">📍 '+L2("Benarkan lokasi tepat","Allow precise location")+'</button><button class="btn alt g3d" id="rnPi">⚙️ '+L2("Maklumat aplikasi","App info")+'</button></div>'+
    '<div class="mut tiny" style="margin-top:8px">'+L2("Jika tiada pilihan muncul: Maklumat aplikasi › Kebenaran › Lokasi › hidupkan \"Gunakan lokasi tepat\".","If no choice appears: App info › Permissions › Location › turn on \"Use precise location\".")+'</div>');
  ov.querySelector("#rnPr").onclick = function(){ H.closeOverlay(); var hp = function(p){ if(p.which !== "location") return; H.off("perm", hp); if(R && H.N.hasPerm("precise")){ startGps(); status(""); } else if(R) preciseHelp(); }; H.on("perm", hp); H.N.requestPerm("location"); };
  ov.querySelector("#rnPi").onclick = function(){ H.closeOverlay(); H.N.requestPerm("appinfo"); var hr = function(){ H.off("resume", hr); if(R && H.N.hasPerm("precise")) startGps(); }; H.on("resume", hr); }; }
function begin(){ var t = ty(), go = function(){ R = newRun(t); var c = cfg(); R.auto = c.auto !== false; R.voice = c.voice !== false;
    startGps(); clearInterval(timer); timer = setInterval(tick, 1000); if(H.N.keepScreenOn) H.N.keepScreenOn(true, -1); draw(); status(L2("Mencari isyarat lokasi…","Getting a location fix…")); };
  if(window.Native && H.N.hasPerm && !H.N.hasPerm("location")){ var hp = function(p){ if(p.which !== "location") return; H.off("perm", hp); if(p.granted) go(); else H.toast(L2("Kebenaran lokasi diperlukan.","Location permission is needed.")); }; H.on("perm", hp); H.N.requestPerm("location"); return; }
  go(); }
function pauseRun(auto){ if(!R || R.st !== "run") return; R.st = "pause"; R.auto0 = !!auto; R.pauseAt = now(); var l = R.pts[R.pts.length-1]; R.pzCur = {s: Math.round(R.mov), lat: l ? l[0] : 0, lon: l ? l[1] : 0}; draw(); }
function resume(){ if(!R || R.st !== "pause") return; if(R.pzCur){ R.pzCur.dur = Math.round((now()-R.pauseAt)/1000); if(R.pzCur.dur >= 5) R.pz.push(R.pzCur); R.pzCur = null; } R.st = "run"; R.slow = 0; R.lastT = now(); draw(); }
function finish(){ if(!R) return; if(R.st === "pause") resume(); stopGps(); clearInterval(timer); if(H.N.keepScreenOn) H.N.keepScreenOn(false, -1);
  R.st = "done"; R.t1 = now(); var kg = api.kg ? api.kg() : 65; R.kcal = Math.round(kg*R.dist/1000*TY[R.ty].kcal);
  var rec = {id: R.id, ty: R.ty, t0: R.t0, t1: R.t1, dist: Math.round(R.dist), mov: Math.round(R.mov), gain: Math.round(R.gain), kcal: R.kcal, pts: R.pts, splits: R.splits, ph: R.ph, pz: R.pz};
  if(R.dist >= 50){ var l = runs(); l.push(rec); saveRuns(l); api.addLog({k: "a", ic: TY[R.ty].ic, n: title(rec)+" "+km(R.dist)+" km", min: Math.round(R.mov/60), kcal: R.kcal, run: R.id}); }
  else H.toast(L2("Terlalu pendek, tidak disimpan.","Too short, not saved."));
  var id = R.id; R = null; openRun = id; if(api.redraw) api.redraw(); else draw(); }
function photo(){ if(!R) return; var l = R.pts[R.pts.length-1] || R.here, at = {lat: l ? l[0] : 0, lon: l ? l[1] : 0, s: Math.round(R.mov)};
  if(!(window.Native && H.N.photoAdd)){ H.toast(L2("Kamera hanya dalam aplikasi telefon.","The camera works in the phone app only.")); return; }
  var tag = "run"+now(), hl = function(r){ if(!r || r.tag !== tag) return; H.off("photos", hl); if(!r.list || !r.list.length || !R) return; r.list.forEach(function(p){ R.ph.push({id: p.id, lat: at.lat, lon: at.lon, s: at.s}); }); H.toast("📷 "+L2("Gambar disimpan pada ","Photo saved at ")+km(R.dist)+" km"); paint(); };
  H.on("photos", hl); H.N.photoAdd("camera", tag); }
function status(t){ var s = box0 && box0.querySelector("#rnSt"); if(s) s.textContent = t; }

// ---------------- map: Web Mercator, satellite tiles, route ----------------
var TILES = {}, tileWait = null;
var SAT_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/", SAT_ATTR = "Imagery © Esri, Maxar, Earthstar Geographics";
function wx(lon, z){ return (lon+180)/360*256*Math.pow(2, z); }
function wy(lat, z){ var s = Math.sin(rad(Math.max(-85, Math.min(85, lat)))); return (0.5-Math.log((1+s)/(1-s))/(4*Math.PI))*256*Math.pow(2, z); }
function view(pts, w, h, pad, zMax){ var la = pts.map(function(p){ return p[0]; }), lo = pts.map(function(p){ return p[1]; });
  var a0 = Math.min.apply(null, la), a1 = Math.max.apply(null, la), o0 = Math.min.apply(null, lo), o1 = Math.max.apply(null, lo);
  var dx = wx(o1, 0)-wx(o0, 0), dy = wy(a0, 0)-wy(a1, 0), z = Math.min(zMax || 17, Math.log2(Math.max(1e-9, Math.min((w-2*pad)/Math.max(dx, 1e-9), (h-2*pad)/Math.max(dy, 1e-9)))));
  z = Math.max(2, Math.min(zMax || 17, isFinite(z) ? z : 16)); var cx = (wx(o0, z)+wx(o1, z))/2, cy = (wy(a0, z)+wy(a1, z))/2;
  return {z: z, P: function(p){ return [wx(p[1], z)-cx+w/2, wy(p[0], z)-cy+h/2]; }, cx: cx, cy: cy}; }
function tile(z, x, y, onload){ var n = Math.pow(2, z); x = ((x%n)+n)%n; if(y < 0 || y >= n) return null; var k = z+"/"+y+"/"+x, t = TILES[k];
  if(t) return t.ok ? t.im : null;
  t = TILES[k] = {im: new Image(), ok: false}; t.im.crossOrigin = "anonymous"; t.im.onload = function(){ t.ok = true; if(onload) onload(); }; t.im.onerror = function(){ t.bad = true; }; t.im.src = SAT_URL+k; return null; }
function drawTiles(cx, v, w, h, onload){ var tz = Math.min(18, Math.floor(v.z)), s = Math.pow(2, v.z-tz), size = 256*s, ox = v.cx-w/2, oy = v.cy-h/2, drawn = 0, miss = 0;
  var x0 = Math.floor(ox/size), y0 = Math.floor(oy/size), x1 = Math.floor((ox+w)/size), y1 = Math.floor((oy+h)/size);
  for(var x = x0; x <= x1; x++) for(var y = y0; y <= y1; y++){ var im = tile(tz, x, y, onload); if(im){ cx.drawImage(im, x*size-ox, y*size-oy, size+0.5, size+0.5); drawn++; } else miss++; }
  return {drawn: drawn, miss: miss}; }
function satOn(){ return cfg().sat !== false && navigator.onLine !== false; }
function drawRoute(cx, pts, w, h, opt){ opt = opt || {}; var pad = opt.pad || 24;
  cx.fillStyle = "#0d2418"; cx.fillRect(0, 0, w, h);
  var list = pts.length ? pts : (opt.here ? [opt.here] : []);
  if(!list.length){ grid(cx, w, h); cx.fillStyle = "rgba(255,255,255,.55)"; cx.font = "14px system-ui"; cx.textAlign = "center"; cx.fillText(opt.empty || "", w/2, h/2); return null; }
  var v = view(list.length > 1 ? list : [[list[0][0]-0.0012, list[0][1]-0.0012], [list[0][0]+0.0012, list[0][1]+0.0012]], w, h, pad, opt.zMax);
  var sat = opt.sat !== false && satOn(), ti = sat ? drawTiles(cx, v, w, h, opt.onTile) : {drawn: 0};
  if(!ti.drawn) grid(cx, w, h); else { cx.fillStyle = "rgba(0,0,0,.18)"; cx.fillRect(0, 0, w, h); }
  var P = v.P, n = opt.upto == null ? pts.length : Math.max(1, Math.min(pts.length, opt.upto));
  cx.lineJoin = cx.lineCap = "round";
  if(pts.length > 1){
    if(opt.ghost){ cx.strokeStyle = "rgba(255,255,255,.35)"; cx.lineWidth = (opt.lw || 4)+2; cx.beginPath(); pts.forEach(function(p, i){ var q = P(p); if(i) cx.lineTo(q[0], q[1]); else cx.moveTo(q[0], q[1]); }); cx.stroke(); }
    cx.strokeStyle = "rgba(0,0,0,.45)"; cx.lineWidth = (opt.lw || 4)+4; cx.beginPath(); for(var i = 0; i < n; i++){ var q = P(pts[i]); if(i) cx.lineTo(q[0], q[1]); else cx.moveTo(q[0], q[1]); } cx.stroke();
    cx.strokeStyle = "#ff8a00"; cx.lineWidth = opt.lw || 4; cx.beginPath(); for(i = 0; i < n; i++){ q = P(pts[i]); if(i) cx.lineTo(q[0], q[1]); else cx.moveTo(q[0], q[1]); } cx.stroke();
    var s0 = P(pts[0]); dot(cx, s0, opt.dot || 6, "#3ddc84"); }
  var endP = pts.length ? pts[n-1] : opt.here; if(opt.here && opt.live) endP = opt.here;
  if(endP){ var e0 = P(endP); if(opt.live){ cx.fillStyle = "rgba(74,155,232,.25)"; cx.beginPath(); cx.arc(e0[0], e0[1], (opt.dot || 6)*2.6, 0, 7); cx.fill(); } dot(cx, e0, opt.dot || 6, opt.live ? "#4a9be8" : (n === pts.length ? "#e0605a" : "#fff")); }
  if(ti.drawn){ cx.fillStyle = "rgba(0,0,0,.45)"; cx.font = Math.max(9, Math.round(w/60))+"px system-ui"; var tw = cx.measureText(SAT_ATTR).width; cx.fillRect(w-tw-10, h-Math.max(14, w/38), tw+10, Math.max(14, w/38)); cx.fillStyle = "#fff"; cx.textAlign = "right"; cx.fillText(SAT_ATTR, w-5, h-Math.max(4, w/140)); }
  return P; }
function dot(cx, p, r, col){ cx.fillStyle = "#fff"; cx.beginPath(); cx.arc(p[0], p[1], r+2, 0, 7); cx.fill(); cx.fillStyle = col; cx.beginPath(); cx.arc(p[0], p[1], r, 0, 7); cx.fill(); }
function grid(cx, w, h){ cx.strokeStyle = "rgba(255,255,255,.05)"; cx.lineWidth = 1; for(var g = 0; g < w; g += 40){ cx.beginPath(); cx.moveTo(g, 0); cx.lineTo(g, h); cx.stroke(); } for(g = 0; g < h; g += 40){ cx.beginPath(); cx.moveTo(0, g); cx.lineTo(w, g); cx.stroke(); } }
function repaintSoon(){ clearTimeout(tileWait); tileWait = setTimeout(paint, 120); }

// ---------------- 0.5.23: interactive map (pan with a finger, pinch or ± to zoom), used by the summary and the route planner ----------------
function unx(x, z){ return x/(256*Math.pow(2, z))*360-180; }
function uny(y, z){ var n = Math.PI-2*Math.PI*y/(256*Math.pow(2, z)); return 180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))); }
function MapCtl(cv, o){ var M = {z: 15, cx: 0, cy: 0, o: o}, cx = cv.getContext("2d"), ptrs = {}, d0 = null, moved = false, tapT = 0;
  M.center = function(lat, lon, z){ if(z != null) M.z = z; M.cx = wx(lon, M.z); M.cy = wy(lat, M.z); };
  M.fit = function(pts){ if(!pts.length) return; var v = view(pts.length > 1 ? pts : [[pts[0][0]-0.002, pts[0][1]-0.002], [pts[0][0]+0.002, pts[0][1]+0.002]], cv.width, cv.height, 40, 18); M.z = v.z; M.cx = v.cx; M.cy = v.cy; };
  M.P = function(p){ return [wx(p[1], M.z)-M.cx+cv.width/2, wy(p[0], M.z)-M.cy+cv.height/2]; };
  M.ll = function(x, y){ var X = M.cx+x-cv.width/2, Y = M.cy+y-cv.height/2; return [uny(Y, M.z), unx(X, M.z)]; };
  M.zoomAt = function(f, x, y){ var nz = Math.max(3, Math.min(19, M.z+Math.log2(f))); if(nz === M.z) return; var ll = M.ll(x, y), k = Math.pow(2, nz-M.z); M.cx = M.cx*k; M.cy = M.cy*k; M.z = nz; var q = M.P(ll); M.cx += q[0]-x; M.cy += q[1]-y; M.draw(); };
  M.draw = function(){ cx.fillStyle = "#0d2418"; cx.fillRect(0, 0, cv.width, cv.height); var ti = satOn() ? drawTiles(cx, {z: M.z, cx: M.cx, cy: M.cy}, cv.width, cv.height, function(){ clearTimeout(M._t); M._t = setTimeout(M.draw, 120); }) : {drawn: 0};
    if(!ti.drawn) grid(cx, cv.width, cv.height); else { cx.fillStyle = "rgba(0,0,0,.15)"; cx.fillRect(0, 0, cv.width, cv.height); }
    if(o.layers) o.layers(cx, M); if(ti.drawn){ cx.fillStyle = "rgba(0,0,0,.45)"; cx.font = "11px system-ui"; var tw = cx.measureText(SAT_ATTR).width; cx.fillRect(cv.width-tw-10, cv.height-16, tw+10, 16); cx.fillStyle = "#fff"; cx.textAlign = "right"; cx.fillText(SAT_ATTR, cv.width-5, cv.height-4); } };
  var pos = function(e){ var r = cv.getBoundingClientRect(); return [(e.clientX-r.left)*cv.width/r.width, (e.clientY-r.top)*cv.height/r.height]; };
  cv.style.touchAction = "none";
  cv.addEventListener("pointerdown", function(e){ ptrs[e.pointerId] = pos(e); moved = false; d0 = null; try{ cv.setPointerCapture(e.pointerId); }catch(x){} });
  cv.addEventListener("pointermove", function(e){ if(!ptrs[e.pointerId]) return; var p = pos(e), ids = Object.keys(ptrs);
    if(ids.length === 1){ var q = ptrs[e.pointerId], dx = p[0]-q[0], dy = p[1]-q[1]; if(Math.abs(dx)+Math.abs(dy) > 3) moved = true; M.cx -= dx; M.cy -= dy; ptrs[e.pointerId] = p; M.draw(); }
    else if(ids.length === 2){ ptrs[e.pointerId] = p; var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a[0]-b[0], a[1]-b[1]); if(d0){ M.zoomAt(d/d0, (a[0]+b[0])/2, (a[1]+b[1])/2); } d0 = d; moved = true; } });
  var up = function(e){ var p = ptrs[e.pointerId]; delete ptrs[e.pointerId]; d0 = null; if(!moved && p && o.onTap && !Object.keys(ptrs).length){ var now = Date.now(); if(now-tapT < 300){ M.zoomAt(2, p[0], p[1]); tapT = 0; return; } tapT = now; o.onTap(M.ll(p[0], p[1])); } };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", function(e){ delete ptrs[e.pointerId]; d0 = null; });
  cv.addEventListener("wheel", function(e){ e.preventDefault(); var p = pos(e); M.zoomAt(e.deltaY < 0 ? 1.25 : 0.8, p[0], p[1]); }, {passive: false});
  return M; }
function zoomBtns(wrap, M){ var b = document.createElement("div"); b.className = "rnZoom"; b.innerHTML = '<button aria-label="+">＋</button><button aria-label="−">－</button>'; wrap.appendChild(b);
  var c = M.o.cv; b.children[0].onclick = function(){ M.zoomAt(2, c.width/2, c.height/2); }; b.children[1].onclick = function(){ M.zoomAt(0.5, c.width/2, c.height/2); }; }
function line(cx, M, pts, col, w, dash){ if(pts.length < 2) return; cx.save(); cx.lineJoin = cx.lineCap = "round"; if(dash) cx.setLineDash(dash); cx.strokeStyle = "rgba(0,0,0,.45)"; cx.lineWidth = w+3; cx.beginPath(); pts.forEach(function(p, i){ var q = M.P(p); if(i) cx.lineTo(q[0], q[1]); else cx.moveTo(q[0], q[1]); }); cx.stroke();
  cx.strokeStyle = col; cx.lineWidth = w; cx.beginPath(); pts.forEach(function(p, i){ var q = M.P(p); if(i) cx.lineTo(q[0], q[1]); else cx.moveTo(q[0], q[1]); }); cx.stroke(); cx.restore(); }
function pathLen(pts){ var d = 0; for(var i = 1; i < pts.length; i++) d += hav(pts[i-1], pts[i]); return d; }

// ---------------- route planner (Strava style): tap to add points, pan/zoom, save, then follow it on a run ----------------
function routes(){ return H.load("ihsan_routes", []) || []; }
function planner(edit){ var R0 = edit ? JSON.parse(JSON.stringify(edit)) : {id: "p"+now().toString(36), name: "", pts: [], ty: ty()}, ov = document.getElementById("overlay");
  ov.className = "rnPlanOv"; ov.classList.remove("hidden");
  ov.innerHTML = '<div class="rnPlanTop"><button class="chip" id="rpX">✕</button><b id="rpD">0.00 km</b><button class="chip" id="rpU">↶</button><button class="chip" id="rpC">🗑</button><button class="btn gold" id="rpS">'+L2("Simpan","Save")+'</button></div><div class="rnPlanMap"><canvas id="rpM"></canvas></div><div class="mut small rnPlanHint">'+L2("Ketik peta untuk menambah titik laluan. Seret untuk alih, cubit atau ± untuk zum, ketik dua kali untuk zum masuk.","Tap the map to add route points. Drag to move, pinch or ± to zoom, double-tap to zoom in.")+'</div>';
  var cv = ov.querySelector("#rpM"), wrap = cv.parentNode, fit = function(){ cv.width = wrap.clientWidth*(window.devicePixelRatio > 1 ? 1.5 : 1); cv.height = wrap.clientHeight*(window.devicePixelRatio > 1 ? 1.5 : 1); };
  fit(); var M = MapCtl(cv, {cv: cv, onTap: function(ll){ R0.pts.push([+ll[0].toFixed(6), +ll[1].toFixed(6)]); upd(); },
    layers: function(c, M2){ line(c, M2, R0.pts, "#4a9be8", 5); R0.pts.forEach(function(p, i){ var q = M2.P(p); dot(c, q, i ? 4 : 7, i ? "#4a9be8" : "#3ddc84"); }); }});
  M.o.cv = cv; zoomBtns(wrap, M);
  var start = R0.pts.length ? null : lastPlace(); if(R0.pts.length) M.fit(R0.pts); else M.center(start[0], start[1], 15);
  var upd = function(){ ov.querySelector("#rpD").textContent = km(pathLen(R0.pts))+" km"; M.draw(); }; upd();
  ov.querySelector("#rpX").onclick = function(){ ov.className = "hidden"; ov.innerHTML = ""; draw(); };
  ov.querySelector("#rpU").onclick = function(){ R0.pts.pop(); upd(); };
  ov.querySelector("#rpC").onclick = function(){ R0.pts = []; upd(); };
  ov.querySelector("#rpS").onclick = function(){ if(R0.pts.length < 2){ H.toast(L2("Tambah sekurang-kurangnya 2 titik","Add at least 2 points")); return; }
    var nm = R0.name || (L2("Laluan ","Route ")+(routes().length+1)), l = routes().filter(function(x){ return x.id !== R0.id; }); R0.name = nm; R0.dist = Math.round(pathLen(R0.pts)); l.push(R0); H.save("ihsan_routes", l.slice(-30));
    var c = cfg(); c.follow = R0.id; H.save("ihsan_run_cfg", c); ov.className = "hidden"; ov.innerHTML = ""; H.toast(L2("Laluan disimpan dan dipilih untuk diikuti","Route saved and chosen to follow")); draw(); }; }
function lastPlace(){ var l = runs(); for(var i = l.length-1; i >= 0; i--) if(l[i].pts && l[i].pts.length) return l[i].pts[0]; var S0 = H.load("ihsan_settings", {}) || {}; return S0.lat != null ? [S0.lat, S0.lon] : [3.139, 101.687]; }
function followRoute(){ var id = cfg().follow; return id ? routes().filter(function(r){ return r.id === id; })[0] || null : null; }

// ---------------- segments (Strava style): a stretch you mark once; every run that passes both ends gets a time ----------------
function segs(){ return H.load("ihsan_runsegs", []) || []; }
function segEffort(r, sg){ var p = r.pts, ia = -1, best = null; for(var i = 0; i < p.length; i++){ if(ia < 0){ if(hav(p[i], sg.a) <= 30) ia = i; continue; }
    if(hav(p[i], sg.b) <= 30){ var dist = 0; for(var k = ia+1; k <= i; k++) dist += hav(p[k-1], p[k]); if(dist >= sg.len*0.7 && dist <= sg.len*1.4){ var t = p[i][2]-p[ia][2]; if(t > 0 && (best == null || t < best)) best = t; } ia = -1; } }
  return best; }
function segBoard(sg){ var out = []; runs().forEach(function(r){ if(tyOf(r) !== sg.ty) return; var t = segEffort(r, sg); if(t) out.push({t: t, r: r}); }); return out.sort(function(a, b){ return a.t-b.t; }); }
function segMaker(id){ var r = runs().filter(function(x){ return x.id === id; })[0]; if(!r || r.pts.length < 5) return; var cum = [0]; for(var i = 1; i < r.pts.length; i++) cum.push(cum[i-1]+hav(r.pts[i-1], r.pts[i]));
  var ov = H.showSheet("⭐ "+L2("Buat segmen","Make a segment"), '<canvas id="sgC" class="rnMap" width="600" height="380"></canvas><label class="small">'+L2("Mula","Start")+' <b id="sgAv"></b><input type="range" id="sgA" min="0" max="'+(r.pts.length-2)+'" value="0" style="width:100%"></label>'+
    '<label class="small">'+L2("Tamat","End")+' <b id="sgBv"></b><input type="range" id="sgB" min="1" max="'+(r.pts.length-1)+'" value="'+(r.pts.length-1)+'" style="width:100%"></label><input id="sgN" class="rin" maxlength="40" placeholder="'+L2("Nama segmen (contoh: Bukit taman)","Segment name (e.g. Park hill)")+'"><button class="btn gold full" id="sgOk" style="margin-top:8px">⭐ '+L2("Simpan segmen","Save segment")+'</button>');
  var c = ov.querySelector("#sgC"), A = ov.querySelector("#sgA"), B = ov.querySelector("#sgB"), drawS = function(){ var a = +A.value, b = Math.max(a+1, +B.value); var P0 = drawRoute(c.getContext("2d"), r.pts, c.width, c.height, {pad: 30, lw: 4, sat: false});
      if(P0){ var cx = c.getContext("2d"); cx.strokeStyle = "#ff3d7f"; cx.lineWidth = 7; cx.lineCap = "round"; cx.beginPath(); for(var k = a; k <= b; k++){ var q = P0(r.pts[k]); if(k === a) cx.moveTo(q[0], q[1]); else cx.lineTo(q[0], q[1]); } cx.stroke(); }
      ov.querySelector("#sgAv").textContent = km(cum[a])+" km"; ov.querySelector("#sgBv").textContent = km(cum[b])+" km · "+L2("panjang ","length ")+km(cum[b]-cum[a])+" km"; };
  A.oninput = B.oninput = drawS; drawS();
  ov.querySelector("#sgOk").onclick = function(){ var a = +A.value, b = Math.max(a+1, +B.value); if(cum[b]-cum[a] < 100){ H.toast(L2("Segmen terlalu pendek (min 100 m)","Too short (at least 100 m)")); return; }
    var l = segs(); l.push({id: "s"+now().toString(36), name: ov.querySelector("#sgN").value.trim() || L2("Segmen ","Segment ")+(l.length+1), a: [r.pts[a][0], r.pts[a][1]], b: [r.pts[b][0], r.pts[b][1]], len: Math.round(cum[b]-cum[a]), ty: tyOf(r)});
    H.save("ihsan_runsegs", l); H.closeOverlay(); H.toast(L2("Segmen disimpan","Segment saved")); draw(); }; }

// ---------------- GPX export / import ----------------
function gpxOut(id){ var r = runs().filter(function(x){ return x.id === id; })[0]; if(!r) return;
  var iso = function(sec){ return new Date(r.t0+sec*1000).toISOString(); };
  var g = '<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="My Ihsan" xmlns="http://www.topografix.com/GPX/1/1">\n<trk><name>'+title(r).replace(/[<&]/g, "")+'</name><type>'+(tyOf(r) === "ride" ? "cycling" : "running")+'</type><trkseg>\n'+
    r.pts.map(function(p){ return '<trkpt lat="'+p[0]+'" lon="'+p[1]+'"><ele>'+(p[3]||0)+'</ele><time>'+iso(p[2])+'</time></trkpt>'; }).join("\n")+'\n</trkseg></trk>\n</gpx>\n';
  var nm = "my-ihsan-"+(tyOf(r) === "ride" ? "ride" : "run")+"-"+new Date(r.t0).toISOString().slice(0, 10)+".gpx";
  if(H.N.shareFile) H.N.shareFile(nm, g, "application/gpx+xml", ""); else { var a = document.createElement("a"); a.href = "data:application/gpx+xml,"+encodeURIComponent(g); a.download = nm; document.body.appendChild(a); a.click(); a.remove(); } }
function gpxIn(text){ try{ var doc = new DOMParser().parseFromString(text, "application/xml"), pts = [].slice.call(doc.getElementsByTagName("trkpt")).concat([].slice.call(doc.getElementsByTagName("rtept")));
    if(pts.length < 2){ H.toast(L2("Fail GPX tiada titik laluan","The GPX file has no track points")); return; }
    var t0 = null, out = [], dist = 0, gain = 0, typeTx = (doc.getElementsByTagName("type")[0]||{}).textContent||"";
    pts.forEach(function(e){ var tEl = e.getElementsByTagName("time")[0], t = tEl ? Date.parse(tEl.textContent) : null, el = +((e.getElementsByTagName("ele")[0]||{}).textContent||0); if(t0 == null && t) t0 = t;
      var q = [+(+e.getAttribute("lat")).toFixed(6), +(+e.getAttribute("lon")).toFixed(6), t && t0 ? Math.round((t-t0)/1000) : out.length*5, Math.round(el)];
      if(out.length){ var l = out[out.length-1]; dist += hav(l, q); if(q[3] > l[3] && q[3]-l[3] < 15) gain += q[3]-l[3]; } out.push(q); });
    var mov = out[out.length-1][2]||0, rt = /cycl|bik|ride/i.test(typeTx) ? "ride" : ty(), splits = [], nextK = 1000, d2 = 0, lastT = 0;
    for(var i = 1; i < out.length; i++){ d2 += hav(out[i-1], out[i]); if(d2 >= nextK){ splits.push(out[i][2]-lastT); lastT = out[i][2]; nextK += 1000; } }
    var rec = {id: "r"+now().toString(36), ty: rt, t0: t0 || now(), t1: (t0 || now())+mov*1000, dist: Math.round(dist), mov: mov, gain: Math.round(gain), kcal: Math.round((api.kg ? api.kg() : 65)*dist/1000*TY[rt].kcal), pts: out, splits: splits, ph: [], pz: [], imp: 1};
    var l = runs(); l.push(rec); l.sort(function(a, b){ return a.t0-b.t0; }); saveRuns(l); api.addLog({k: "a", ic: TY[rt].ic, n: title(rec)+" "+km(rec.dist)+" km", min: Math.round(mov/60), kcal: rec.kcal, run: rec.id, d: new Date(rec.t0).toISOString().slice(0, 10)});
    openRun = rec.id; H.toast(L2("GPX diimport","GPX imported")); if(api.redraw) api.redraw(); else draw(); }catch(e){ H.toast(L2("Fail GPX tidak dapat dibaca","Could not read the GPX file")); } }

// ---------------- weekly goal and monthly challenges with badges ----------------
var CHAL = [["km50","🏅","50 km sebulan","50 km in a month",function(m){ return m.km >= 50; },function(m){ return Math.min(1, m.km/50); }],
  ["n8","🔁","8 kali sebulan","8 sessions in a month",function(m){ return m.n >= 8; },function(m){ return Math.min(1, m.n/8); }],
  ["gain300","⛰","Daki 300 m","Climb 300 m",function(m){ return m.gain >= 300; },function(m){ return Math.min(1, m.gain/300); }],
  ["long10","🛣","Satu sesi 10 km","One 10 km session",function(m){ return m.long >= 10000; },function(m){ return Math.min(1, m.long/10000); }],
  ["week4","📅","Aktif 4 minggu","Active 4 weeks",function(m){ return m.wk >= 4; },function(m){ return Math.min(1, m.wk/4); }]];
function monthStats(t, ym){ var m = {km: 0, n: 0, gain: 0, long: 0, wk: 0}, wks = {}; runs().forEach(function(r){ var d = new Date(r.t0); if(tyOf(r) !== t || d.getFullYear()+"-"+(d.getMonth()+1) !== ym) return;
    m.km += r.dist/1000; m.n++; m.gain += r.gain||0; m.long = Math.max(m.long, r.dist); wks[Math.floor((d.getDate()-1)/7)] = 1; }); m.wk = Object.keys(wks).length; return m; }
function badges(){ return H.load("ihsan_runbadges", {}) || {}; }
function goalsHtml(t, wk){ var c = cfg(), g = (c.goal||{})[t] || (t === "ride" ? 50 : 15), pc = Math.min(1, wk/1000/g), C = 2*Math.PI*30, d = new Date(), ym = d.getFullYear()+"-"+(d.getMonth()+1), M0 = monthStats(t, ym), B = badges(), got = 0;
  CHAL.forEach(function(x){ var k = t+":"+ym+":"+x[0]; if(x[4](M0) && !B[k]){ B[k] = 1; got++; } }); if(got){ H.save("ihsan_runbadges", B); H.toast("🏅 "+L2("Lencana baharu!","New badge!")); }
  var all = Object.keys(B).filter(function(k){ return k.indexOf(t+":") === 0; }).length;
  return '<div class="card rnGoal"><div class="rnGoalRow"><svg viewBox="0 0 70 70" class="rnGR"><circle cx="35" cy="35" r="30" fill="none" stroke="var(--line)" stroke-width="7"/><circle cx="35" cy="35" r="30" fill="none" stroke="var(--gold)" stroke-width="7" stroke-linecap="round" stroke-dasharray="'+(C*pc).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 35 35)"/><text x="35" y="40" text-anchor="middle" font-size="14" fill="currentColor">'+Math.round(pc*100)+'%</text></svg>'+
    '<div><b>'+km(wk)+' / '+g+' km</b><div class="mut small">'+L2("Sasaran minggu ini","This week's goal")+'</div><div class="chips"><button class="chip" data-rg="-5">−5</button><button class="chip" data-rg="5">+5</button></div></div></div>'+
    '<h4>🏆 '+L2("Cabaran bulan ini","This month's challenges")+' <span class="mut small">· '+all+' '+L2("lencana","badges")+'</span></h4><div class="rnChal">'+CHAL.map(function(x){ var done = !!B[t+":"+ym+":"+x[0]], p = x[5](M0);
      return '<div class="'+(done ? 'ok' : '')+'"><span class="noico">'+(done ? x[1] : '🔒')+'</span><b>'+E(L2(x[2], x[3]))+'</b><i><em style="width:'+Math.round(p*100)+'%"></em></i></div>'; }).join("")+'</div></div>'; }

// ---------------- page ----------------
var openRun = null;
function view0(box, h, a){ H = h; L2 = h.L2x; E = h.esc; api = a || {}; box0 = box; draw(); }
function draw(){ if(!box0 || !document.body.contains(box0)) return; box0.innerHTML = R ? liveHtml() : openRun ? summaryHtml(openRun) : homeHtml(); bind(); paint(); }
function liveHtml(){ var st = R.st, rd = R.ty === "ride";
  return '<div class="card rnLive'+(st === "pause" ? " paused" : "")+'"><div class="rnBig"><b id="rnD">0.00</b><span>km</span></div>'+
    '<div class="rnRow"><div><b id="rnT">0:00</b><span>'+L2("Masa bergerak","Moving time")+'</span></div><div><b id="rnP">–</b><span>'+(rd ? L2("Purata km/j","Avg km/h") : L2("Rentak purata","Avg pace")+" /km")+'</span></div><div><b id="rnC">–</b><span>'+(rd ? L2("Laju kini","Current speed") : L2("Rentak kini","Current pace"))+'</span></div></div>'+
    '<canvas id="rnMap" class="rnMap" width="680" height="420"></canvas><div class="mut small" id="rnSt"></div>'+
    (st === "pause" ? '<div class="rnPz">⏸ '+(R.auto0 ? L2("Jeda automatik (berhenti)","Auto-paused (stopped)") : L2("Dijeda","Paused"))+'</div>' : '')+
    '<div class="rnBtns">'+(st === "run" ? '<button class="btn alt g3d" id="rnPause">⏸ '+L2("Jeda","Pause")+'</button>' : '<button class="btn gold g3d" id="rnRes">▶ '+L2("Sambung","Resume")+'</button>')+
    '<button class="btn alt g3d" id="rnPh">📷</button><button class="btn alt g3d rnStop" id="rnStop">⏹ '+L2("Tamat","Finish")+'</button></div>'+
    '<div class="rnSplits" id="rnSp"></div></div>'; }
function homeHtml(){ var t = ty(), T = TY[t], all = runs(), l = all.filter(function(r){ return tyOf(r) === t; }), c = cfg(), wk = 0, tot = 0, mon = new Date(); mon.setHours(0,0,0,0); mon.setDate(mon.getDate()-((mon.getDay()+6)%7));
  l.forEach(function(r){ tot += r.dist; if(r.t0 >= mon.getTime()) wk += r.dist; });
  var best = function(m){ var b = null; l.forEach(function(r){ if(r.dist < m) return; var x = bestEffort(r, m); if(x && (!b || x < b)) b = x; }); return b; };
  var pb = T.pb.map(function(x){ var b = best(x[0]); return '<div><b>'+(b ? hms(b) : "–")+'</b><span>'+x[1]+'</span></div>'; }).join("");
  var nm = t === "ride" ? L2("kayuhan","rides") : L2("larian","runs");
  return '<div class="card rnHome"><div class="rnBig"><b>'+km(wk)+'</b><span>km '+L2("minggu ini","this week")+'</span></div>'+
    '<button class="btn gold g3d full rnGo" id="rnGo">▶ '+(t === "ride" ? L2("Mula kayuhan","Start ride") : L2("Mula larian","Start run"))+'</button>'+
    '<label class="obChk"><input type="checkbox" id="rnAuto"'+(c.auto !== false ? " checked" : "")+'> '+L2("Jeda automatik bila berhenti","Auto-pause when you stop")+'</label>'+
    '<label class="obChk"><input type="checkbox" id="rnVoice"'+(c.voice !== false ? " checked" : "")+'> '+(t === "ride" ? L2("Suara setiap 5 km","Voice every 5 km") : L2("Suara setiap 1 km","Voice every 1 km"))+'</label>'+
    '<label class="obChk"><input type="checkbox" id="rnSat"'+(c.sat !== false ? " checked" : "")+'> 🛰 '+L2("Peta satelit (perlu internet)","Satellite map (needs internet)")+'</label>'+
    '<div class="mut tiny">📍 '+L2("Lokasi tepat digunakan hanya semasa aplikasi dibuka. Skrin dibiarkan hidup semasa merekod.","Precise location is used only while the app is open. The screen stays on while recording.")+'</div></div>'+
    goalsHtml(t, wk)+
    '<div class="card"><h3>🗺 '+L2("Laluan","Routes")+'</h3>'+(function(){ var R1 = routes().filter(function(r){ return (r.ty||"run") === t; }), f = cfg().follow;
      return (R1.length ? R1.slice().reverse().map(function(r){ return '<div class="rnRt'+(r.id === f ? ' on' : '')+'"><button class="rnRtB" data-rf="'+r.id+'"><b>'+(r.id === f ? '✓ ' : '')+E(r.name)+'</b><small>'+km(r.dist)+' km'+(r.id === f ? ' · '+L2("diikuti semasa rakaman","followed while recording") : '')+'</small></button><button class="chip" data-re="'+r.id+'">✎</button><button class="chip" data-rx="'+r.id+'">✕</button></div>'; }).join("") : '<div class="mut small">'+L2("Rancang laluan di peta, kemudian ikutinya semasa berlari atau berbasikal.","Plan a route on the map, then follow it while you run or ride.")+'</div>')+
        '<div class="btns" style="margin-top:8px"><button class="btn alt g3d" id="rnPlan">🗺 '+L2("Rancang laluan","Plan a route")+'</button><button class="btn alt g3d" id="rnGpx">📥 '+L2("Import GPX","Import GPX")+'</button></div>'; })()+'</div>'+
    (function(){ var S1 = segs().filter(function(x){ return x.ty === t; }); if(!S1.length) return ''; return '<div class="card"><h3>⭐ '+L2("Segmen","Segments")+'</h3>'+S1.map(function(sg){ var b = segBoard(sg);
      return '<div class="rnSeg"><div><b>'+E(sg.name)+'</b><small>'+km(sg.len)+' km · '+b.length+' '+L2("cubaan","efforts")+'</small></div><div class="rnSegT">'+(b[0] ? '🏆 '+hms(b[0].t)+(b[1] ? '<small>'+L2("ke-2 ","2nd ")+hms(b[1].t)+'</small>' : '') : '–')+'</div><button class="chip" data-sx="'+sg.id+'">✕</button></div>'; }).join("")+'</div>'; })()+
    '<div class="card"><h3>🏆 '+L2("Rekod peribadi","Personal bests")+' · '+T.ic+'</h3><div class="rnRow rn4">'+pb+'</div><div class="mut small" style="margin-top:6px">'+L2("Jumlah ","Total ")+km(tot)+' km · '+l.length+' '+nm+'</div></div>'+
    '<div class="card"><h3>🗂 '+L2("Semua rekod","All records")+'</h3>'+(all.length ? all.slice().reverse().map(function(r){ var d = new Date(r.t0), rt = tyOf(r);
      return '<button class="rnItem" data-rn="'+r.id+'"><canvas class="rnThumb" width="120" height="80" data-rth="'+r.id+'"></canvas><span><b>'+TY[rt].ic+' '+km(r.dist)+' km</b> · '+hms(r.mov)+' · '+rate(rt, r.mov, r.dist)+' '+rateU(rt)+'<small>'+d.toLocaleDateString(H.locTag ? H.locTag() : undefined, {weekday: "short", day: "numeric", month: "short"})+' '+String(d.getHours()).padStart(2,"0")+':'+String(d.getMinutes()).padStart(2,"0")+(r.ph && r.ph.length ? ' · 📷 '+r.ph.length : '')+'</small></span></button>'; }).join("")
      : '<div class="mut small">'+L2("Belum ada rekod.","No records yet.")+'</div><div class="btns" style="margin-top:8px"><button class="btn gold g3d" data-proxy="#rnGo">▶ '+(t === "ride" ? L2("Kayuhan pertama","First ride") : L2("Larian pertama","First run"))+'</button></div>')+'</div>'; }
function bestEffort(r, m){ var p = r.pts, b = null, j = 0, d = [0]; for(var i = 1; i < p.length; i++) d.push(d[i-1]+hav(p[i-1], p[i]));
  for(i = 0; i < p.length; i++){ while(j < p.length && d[j]-d[i] < m) j++; if(j >= p.length) break; var t = p[j][2]-p[i][2]; if(t > 0 && (b == null || t < b)) b = t; } return b; }
function summaryHtml(id){ var r = runs().filter(function(x){ return x.id === id; })[0]; if(!r){ openRun = null; return homeHtml(); }
  var rt = tyOf(r), d = new Date(r.t0), mx = Math.max.apply(null, r.splits.concat([1])), mn = Math.min.apply(null, r.splits.concat([1e9]));
  return '<div class="card rnSum"><div class="rnTop"><button class="chip" id="rnBack">‹ '+L2("Rekod","Records")+'</button><span class="mut small">'+TY[rt].ic+' '+d.toLocaleDateString(H.locTag ? H.locTag() : undefined, {weekday: "long", day: "numeric", month: "long"})+'</span></div>'+
    '<div class="rnMapW"><canvas id="rnSumMap" class="rnMap" width="680" height="460"></canvas></div>'+
    (function(){ var e = segs().filter(function(sg){ return sg.ty === rt; }).map(function(sg){ var t = segEffort(r, sg); if(!t) return ''; var b = segBoard(sg); return '<span class="chip">⭐ '+E(sg.name)+' '+hms(t)+(b[0] && b[0].r.id === r.id ? ' 🏆' : '')+'</span>'; }).join(""); return e ? '<div class="chips" style="flex-wrap:wrap;margin:6px 0">'+e+'</div>' : ''; })()+
    '<div class="rnRow rn4"><div><b>'+km(r.dist)+'</b><span>km</span></div><div><b>'+hms(r.mov)+'</b><span>'+L2("masa","time")+'</span></div><div><b>'+rate(rt, r.mov, r.dist)+'</b><span>'+rateU(rt)+'</span></div><div><b>'+r.gain+' m</b><span>'+L2("naik","climb")+'</span></div></div>'+
    '<div class="mut small">🔥 ≈ '+r.kcal+' kcal'+(r.pz.length ? ' · ⏸ '+r.pz.length+' '+L2("rehat","rests") : '')+(r.ph.length ? ' · 📷 '+r.ph.length : '')+'</div>'+
    (r.splits.length ? '<h4>'+L2("Pecahan setiap km","Splits per km")+'</h4><div class="rnSplits">'+r.splits.map(function(s, i){ return '<div class="rnSpl'+(s === mn ? " best" : "")+'"><span>'+(i+1)+'</span><i style="width:'+Math.round(40+60*s/mx)+'%"></i><b>'+(rt === "ride" ? kmh(s, 1000)+" km/h" : hms(s))+'</b></div>'; }).join("")+'</div>' : '')+
    (r.ph.length && hasPhotos() ? '<div class="rnPhs">'+r.ph.map(function(p){ return '<img src="'+H.N.photoDir()+'t/'+p.id+'.jpg" alt="">'; }).join("")+'</div>' : '')+
    '<div class="btns" style="margin-top:10px"><button class="btn gold g3d" id="rnVid">🎬 '+L2("Video","Video")+'</button><button class="btn alt g3d" id="rnImg">🖼 '+L2("Kongsi gambar","Share picture")+'</button><button class="btn alt g3d" id="rnDel">🗑</button></div><div class="btns" style="margin-top:6px"><button class="btn alt g3d" id="rnSeg">⭐ '+L2("Buat segmen","Make a segment")+'</button><button class="btn alt g3d" id="rnGpxO">📤 GPX</button></div></div>'; }
function hasPhotos(){ return !!(window.Native && H.N.photoDir); }
function bind(){ var q = function(s){ return box0.querySelector(s); }, setC = function(k, v){ var c = cfg(); c[k] = v; H.save("ihsan_run_cfg", c); };
  if(q("#rnGo")) q("#rnGo").onclick = begin;
  if(q("#rnAuto")) q("#rnAuto").onchange = function(){ setC("auto", this.checked); };
  if(q("#rnVoice")) q("#rnVoice").onchange = function(){ setC("voice", this.checked); };
  if(q("#rnSat")) q("#rnSat").onchange = function(){ setC("sat", this.checked); paint(); };
  if(q("#rnPause")) q("#rnPause").onclick = function(){ pauseRun(false); };
  if(q("#rnRes")) q("#rnRes").onclick = resume;
  if(q("#rnPh")) q("#rnPh").onclick = photo;
  if(q("#rnStop")) q("#rnStop").onclick = function(){ if(confirm(L2("Tamatkan rakaman ini?","Finish this recording?"))) finish(); };
  box0.querySelectorAll("[data-rn]").forEach(function(b){ b.onclick = function(){ openRun = b.getAttribute("data-rn"); draw(); var v = document.getElementById("view"); if(v) v.scrollTop = 0; }; });
  if(q("#rnBack")) q("#rnBack").onclick = function(){ openRun = null; draw(); };
  if(q("#rnDel")) q("#rnDel").onclick = function(){ if(!confirm(L2("Padam rekod ini?","Delete this record?"))) return; saveRuns(runs().filter(function(x){ return x.id !== openRun; })); openRun = null; if(api.redraw) api.redraw(); else draw(); };
  if(q("#rnImg")) q("#rnImg").onclick = function(){ shareImage(openRun); };
  if(q("#rnVid")) q("#rnVid").onclick = function(){ makeVideo(openRun); };
  if(q("#rnSeg")) q("#rnSeg").onclick = function(){ segMaker(openRun); };
  if(q("#rnGpxO")) q("#rnGpxO").onclick = function(){ gpxOut(openRun); };
  if(q("#rnPlan")) q("#rnPlan").onclick = function(){ planner(null); };
  if(q("#rnGpx")) q("#rnGpx").onclick = function(){ if(window.Native && H.N.openFile){ window.IbOpenOnce = gpxIn; H.N.openFile(); } else { var i = document.createElement("input"); i.type = "file"; i.accept = ".gpx,application/gpx+xml"; i.onchange = function(){ var f = i.files[0]; if(!f) return; var rd = new FileReader(); rd.onload = function(){ gpxIn(rd.result); }; rd.readAsText(f); }; i.click(); } };
  box0.querySelectorAll("[data-rf]").forEach(function(b){ b.onclick = function(){ var c = cfg(), id = b.getAttribute("data-rf"); c.follow = c.follow === id ? null : id; H.save("ihsan_run_cfg", c); draw(); }; });
  box0.querySelectorAll("[data-re]").forEach(function(b){ b.onclick = function(){ planner(routes().filter(function(r){ return r.id === b.getAttribute("data-re"); })[0]); }; });
  box0.querySelectorAll("[data-rx]").forEach(function(b){ b.onclick = function(){ H.save("ihsan_routes", routes().filter(function(r){ return r.id !== b.getAttribute("data-rx"); })); draw(); }; });
  box0.querySelectorAll("[data-sx]").forEach(function(b){ b.onclick = function(){ H.save("ihsan_runsegs", segs().filter(function(x){ return x.id !== b.getAttribute("data-sx"); })); draw(); }; });
  box0.querySelectorAll("[data-rg]").forEach(function(b){ b.onclick = function(){ var c = cfg(), t = ty(); c.goal = c.goal || {}; c.goal[t] = Math.max(5, ((c.goal[t]) || (t === "ride" ? 50 : 15))+(+b.getAttribute("data-rg"))); H.save("ihsan_run_cfg", c); draw(); }; }); }
function paint(){ if(!box0 || !document.body.contains(box0)) return; var q = function(s){ return box0.querySelector(s); };
  if(R){ var rd = R.ty === "ride"; if(q("#rnD")) q("#rnD").textContent = km(R.dist); if(q("#rnT")) q("#rnT").textContent = hms(R.mov); if(q("#rnP")) q("#rnP").textContent = rate(R.ty, R.mov, R.dist);
    if(q("#rnC")){ var c = R.curP; q("#rnC").textContent = c.length > 1 ? rate(R.ty, c[c.length-1][0]-c[0][0], c[c.length-1][1]-c[0][1]) : "–"; }
    var cv = q("#rnMap"), fr = followRoute(); if(cv){ var Pl = drawRoute(cv.getContext("2d"), fr && R.pts.length < 2 ? fr.pts.map(function(p){ return [p[0], p[1], 0, 0]; }) : R.pts, cv.width, cv.height, {live: true, here: R.here, zMax: 17, pad: 40, onTile: repaintSoon, upto: fr && R.pts.length < 2 ? 0 : null, empty: L2("Laluan akan dilukis di sini","Your route draws here")});
      if(fr && Pl){ var c2 = cv.getContext("2d"); c2.save(); c2.setLineDash([10, 8]); c2.strokeStyle = "#4a9be8"; c2.lineWidth = 4; c2.beginPath(); fr.pts.forEach(function(p, i){ var w = Pl(p); if(i) c2.lineTo(w[0], w[1]); else c2.moveTo(w[0], w[1]); }); c2.stroke(); c2.restore(); } }
    var sp = q("#rnSp"); if(sp) sp.innerHTML = R.splits.map(function(s, i){ return '<span class="chip">'+(i+1)+' km · '+(rd ? kmh(s, 1000)+" km/h" : hms(s))+'</span>'; }).join(""); return; }
  box0.querySelectorAll("[data-rth]").forEach(function(c){ var r = runs().filter(function(x){ return x.id === c.getAttribute("data-rth"); })[0]; if(r) drawRoute(c.getContext("2d"), r.pts, c.width, c.height, {pad: 8, lw: 2.5, dot: 3, sat: false}); });
  var sm = q("#rnSumMap"); if(sm && !sm._map){ var r = runs().filter(function(x){ return x.id === openRun; })[0]; if(r && r.pts.length){
    var M = MapCtl(sm, {cv: sm, layers: function(cx, M2){ line(cx, M2, r.pts, "#ff8a00", 5); dot(cx, M2.P(r.pts[0]), 6, "#3ddc84"); dot(cx, M2.P(r.pts[r.pts.length-1]), 6, "#e0605a");
      r.ph.forEach(function(p){ var x = M2.P([p.lat, p.lon]); cx.fillStyle = "#fff"; cx.beginPath(); cx.arc(x[0], x[1], 10, 0, 7); cx.fill(); cx.font = "13px system-ui"; cx.textAlign = "center"; cx.fillText("📷", x[0], x[1]+5); }); }});
    sm._map = M; M.fit(r.pts); zoomBtns(sm.parentNode, M); M.draw(); } } }

// ---------------- share: picture and "brag" video ----------------
function share(name, dataUrl, mime, text){ var b64 = dataUrl.slice(dataUrl.indexOf(",")+1);
  if(H.N.shareBinary) H.N.shareBinary(name, b64, mime, text||""); else { var a = document.createElement("a"); a.href = dataUrl; a.download = name; document.body.appendChild(a); a.click(); a.remove(); } }
function rr(cx, x, y, w, h, r){ cx.beginPath(); cx.moveTo(x+r, y); cx.arcTo(x+w, y, x+w, y+h, r); cx.arcTo(x+w, y+h, x, y+h, r); cx.arcTo(x, y+h, x, y, r); cx.arcTo(x, y, x+w, y, r); cx.closePath(); }
function statsCard(cx, r, w, h, y0, k){ var rt = tyOf(r), items = [[km(r.dist), "km"], [hms(r.mov), L2("masa","time")], [rate(rt, r.mov, r.dist), rateU(rt)], [r.gain+" m", L2("naik","climb")]];
  cx.save(); cx.globalAlpha = k == null ? 1 : k; cx.fillStyle = "rgba(10,28,19,.86)"; rr(cx, 40, y0, w-80, 190, 26); cx.fill();
  items.forEach(function(it, i){ var x = 40+(w-80)/4*(i+.5); cx.fillStyle = "#f2c94c"; cx.font = "700 40px system-ui"; cx.textAlign = "center"; cx.fillText(it[0], x, y0+92); cx.fillStyle = "rgba(255,255,255,.75)"; cx.font = "24px system-ui"; cx.fillText(it[1], x, y0+134); });
  cx.restore(); }
function title(r){ var d = new Date(r.t0), hr = d.getHours(), ride = tyOf(r) === "ride", part = hr < 12 ? 0 : hr < 16 ? 1 : hr < 19 ? 2 : 3;
  return ride ? [L2("Kayuhan pagi","Morning ride"), L2("Kayuhan tengah hari","Midday ride"), L2("Kayuhan petang","Afternoon ride"), L2("Kayuhan malam","Evening ride")][part]
              : [L2("Larian pagi","Morning run"), L2("Larian tengah hari","Midday run"), L2("Larian petang","Afternoon run"), L2("Larian malam","Evening run")][part]; }
// preload the satellite tiles a whole-route view needs (up to 4 s) so the picture and video have the map under the route
function preload(r, w, h, pad, done){ if(!satOn() || r.pts.length < 2){ done(); return; } var cv = document.createElement("canvas"); cv.width = w; cv.height = h; var cx = cv.getContext("2d"), t0 = now();
  var chk = function(){ var v = view(r.pts, w, h, pad, 17), res = drawTiles(cx, v, w, h, null); if(!res.miss || now()-t0 > 4000) done(); else setTimeout(chk, 200); }; chk(); }
function shareImage(id){ var r = runs().filter(function(x){ return x.id === id; })[0]; if(!r) return; var w = 1080, h = 1350;
  preload(r, w, h, 140, function(){ var cv = document.createElement("canvas"); cv.width = w; cv.height = h; var cx = cv.getContext("2d");
    drawRoute(cx, r.pts, w, h, {pad: 140, lw: 10, dot: 14}); var g = cx.createLinearGradient(0, 0, 0, 220); g.addColorStop(0, "rgba(0,0,0,.6)"); g.addColorStop(1, "rgba(0,0,0,0)"); cx.fillStyle = g; cx.fillRect(0, 0, w, 220);
    cx.fillStyle = "#fff"; cx.font = "700 54px system-ui"; cx.textAlign = "left"; cx.fillText(TY[tyOf(r)].ic+" "+title(r), 60, 110); cx.fillStyle = "rgba(255,255,255,.8)"; cx.font = "30px system-ui"; cx.fillText(new Date(r.t0).toLocaleDateString(), 60, 158);
    statsCard(cx, r, w, h, h-320); cx.fillStyle = "rgba(255,255,255,.75)"; cx.font = "26px system-ui"; cx.textAlign = "center"; cx.fillText(L2("Dibuat oleh My Ihsan","Made by My Ihsan"), w/2, h-70);
    try{ share("perjalanan.png", cv.toDataURL("image/png"), "image/png", title(r)+" · "+km(r.dist)+" km"); }catch(e){ H.toast(L2("Gambar gagal dibuat","Could not make the picture")); } }); }
// The video: intro, the route drawing itself over the satellite map with a moving dot and a km counter, each photo pops up where it
// was taken, each rest stop shows a short "⏸" badge, then the stats and an ending card "Made by My Ihsan". About 12-25 s.
function makeVideo(id){ var r = runs().filter(function(x){ return x.id === id; })[0]; if(!r || r.pts.length < 2) return;
  var w = 720, h = 1280, cv = document.createElement("canvas"); cv.width = w; cv.height = h; var cx = cv.getContext("2d");
  if(!cv.captureStream || !window.MediaRecorder){ H.toast(L2("Telefon ini tidak boleh merakam video. Kongsi gambar sebagai ganti.","This phone cannot record video. Share a picture instead.")); return; }
  var mime = ["video/mp4;codecs=avc1","video/mp4","video/webm;codecs=vp9","video/webm"].filter(function(m){ try{ return MediaRecorder.isTypeSupported(m); }catch(e){ return false; } })[0];
  if(!mime){ H.toast(L2("Format video tidak disokong","Video format not supported")); return; }
  var imgs = {}, need = (r.ph||[]).slice(0, 12), left = need.length;
  var go = function(){ var ev = [];
    var idxAt = function(s){ var b = 0; r.pts.forEach(function(p, i){ if(p[2] <= s) b = i; }); return b; };
    need.forEach(function(p){ if(imgs[p.id]) ev.push({i: idxAt(p.s), k: "ph", p: p}); });
    (r.pz||[]).forEach(function(z){ ev.push({i: idxAt(z.s), k: "pz", z: z}); }); ev.sort(function(a, b){ return a.i-b.i; });
    var T_IN = 2, T_RT = 9, T_EV = ev.reduce(function(a, e){ return a+(e.k === "ph" ? 1.8 : 0.9); }, 0), T_ST = 3, T_END = 2.2, TOT = T_IN+T_RT+T_EV+T_ST+T_END;
    var seg = [], last = 0, per = T_RT/Math.max(1, r.pts.length-1); ev.forEach(function(e){ seg.push({a: last, b: e.i, d: (e.i-last)*per}); seg.push({ev: e, d: e.k === "ph" ? 1.8 : 0.9}); last = e.i; }); seg.push({a: last, b: r.pts.length-1, d: (r.pts.length-1-last)*per});
    var ov = H.showSheet("🎬 "+L2("Membuat video","Making the video"), '<div class="small" id="rnVs">⏺ 0 / '+Math.ceil(TOT)+' s</div><canvas id="rnVp" width="180" height="320" style="display:block;margin:10px auto;border-radius:12px"></canvas>');
    var pv = ov.querySelector("#rnVp").getContext("2d");
    var stream = cv.captureStream(30), rec = new MediaRecorder(stream, {mimeType: mime, videoBitsPerSecond: 3500000}), chunks = [], t0 = performance.now(), raf = 0;
    rec.ondataavailable = function(e){ if(e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = function(){ cancelAnimationFrame(raf); var blob = new Blob(chunks, {type: mime.split(";")[0]}), fr = new FileReader(); fr.onload = function(){ H.closeOverlay(); share("perjalanan."+(/mp4/.test(mime) ? "mp4" : "webm"), fr.result, mime.split(";")[0], title(r)+" · "+km(r.dist)+" km · My Ihsan"); }; fr.readAsDataURL(blob); };
    var cum = [0]; for(var i = 1; i < r.pts.length; i++) cum.push(cum[i-1]+hav(r.pts[i-1], r.pts[i]));
    var frame = function(){ var t = (performance.now()-t0)/1000, ease = function(x){ return 1-Math.pow(1-Math.min(1, Math.max(0, x)), 3); };
      cx.clearRect(0, 0, w, h);
      if(t < T_IN){ drawRoute(cx, r.pts, w, h, {pad: 90, lw: 8, dot: 10, upto: 1, ghost: true}); var k = ease(t/0.8);
        cx.fillStyle = "rgba(0,0,0,"+(0.5*(1-ease((t-1.2)/0.8)))+")"; cx.fillRect(0, 0, w, h);
        cx.globalAlpha = k; cx.fillStyle = "#fff"; cx.font = "800 58px system-ui"; cx.textAlign = "center"; cx.fillText(TY[tyOf(r)].ic+" "+title(r), w/2, h/2-30); cx.font = "30px system-ui"; cx.fillStyle = "#f2c94c"; cx.fillText(new Date(r.t0).toLocaleDateString(), w/2, h/2+20); cx.globalAlpha = 1; }
      else if(t < T_IN+T_RT+T_EV){ var tt = t-T_IN, upto = 0, evNow = null, evK = 0;
        for(var s = 0, acc = 0; s < seg.length; s++){ var sg = seg[s]; if(tt < acc+sg.d){ if(sg.ev){ evNow = sg.ev; evK = (tt-acc)/sg.d; upto = sg.ev.i; } else upto = sg.a+(sg.b-sg.a)*((tt-acc)/Math.max(.001, sg.d)); break; } acc += sg.d; upto = sg.ev ? sg.ev.i : sg.b; }
        var ui = Math.max(1, Math.floor(upto)+1), P = drawRoute(cx, r.pts, w, h, {pad: 90, lw: 8, dot: 10, upto: ui, ghost: true});
        var dNow = cum[Math.min(cum.length-1, ui-1)];
        cx.fillStyle = "rgba(10,28,19,.85)"; rr(cx, 40, 50, w-80, 120, 24); cx.fill(); cx.fillStyle = "#f2c94c"; cx.font = "800 64px system-ui"; cx.textAlign = "left"; cx.fillText(km(dNow), 70, 135); cx.fillStyle = "#fff"; cx.font = "28px system-ui"; cx.fillText("km", 70+cx.measureText(km(dNow)).width+16, 135);
        cx.textAlign = "right"; cx.fillText(hms(r.pts[Math.min(r.pts.length-1, ui-1)][2]), w-70, 125);
        if(evNow && P){ var at = P(r.pts[evNow.i]), pop = ease(evK/0.25)*(1-ease((evK-0.82)/0.18));
          if(evNow.k === "ph"){ var im = imgs[evNow.p.id], iw = 440, ih = im ? iw*im.height/im.width : 330; ih = Math.min(ih, 560);
            cx.save(); cx.globalAlpha = pop; cx.translate(w/2, h/2); cx.scale(0.6+0.4*pop, 0.6+0.4*pop); cx.fillStyle = "#fff"; rr(cx, -iw/2-12, -ih/2-12, iw+24, ih+70, 18); cx.fill(); if(im) cx.drawImage(im, -iw/2, -ih/2, iw, ih);
            cx.fillStyle = "#123"; cx.font = "26px system-ui"; cx.textAlign = "center"; cx.fillText("📍 "+km(cum[evNow.i])+" km", 0, ih/2+42); cx.restore();
            cx.strokeStyle = "rgba(255,255,255,"+pop*0.6+")"; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(at[0], at[1]); cx.lineTo(w/2, h/2); cx.stroke(); }
          else { cx.save(); cx.globalAlpha = pop; cx.fillStyle = "rgba(10,28,19,.9)"; rr(cx, at[0]-110, at[1]-90, 220, 64, 20); cx.fill(); cx.fillStyle = "#fff"; cx.font = "700 28px system-ui"; cx.textAlign = "center"; cx.fillText("⏸ "+L2("Rehat ","Rest ")+hms(evNow.z.dur), at[0], at[1]-48); cx.restore(); } } }
      else if(t < T_IN+T_RT+T_EV+T_ST){ var k2 = ease((t-T_IN-T_RT-T_EV)/0.6); drawRoute(cx, r.pts, w, h, {pad: 90, lw: 8, dot: 10}); statsCard(cx, r, w, h, h-330+(1-k2)*120, k2);
        cx.fillStyle = "#fff"; cx.font = "800 46px system-ui"; cx.textAlign = "center"; cx.globalAlpha = k2; cx.fillText(title(r), w/2, 130); cx.globalAlpha = 1; }
      else { var k3 = ease((t-T_IN-T_RT-T_EV-T_ST)/0.6); cx.fillStyle = "#07130d"; cx.fillRect(0, 0, w, h); cx.globalAlpha = k3; cx.fillStyle = "#f2c94c"; cx.font = "800 64px system-ui"; cx.textAlign = "center"; cx.fillText("My Ihsan", w/2, h/2);
        cx.fillStyle = "rgba(255,255,255,.8)"; cx.font = "30px system-ui"; cx.fillText(L2("Dibuat oleh My Ihsan","Made by My Ihsan"), w/2, h/2+56); cx.fillText(km(r.dist)+" km · "+hms(r.mov), w/2, h/2+104); cx.globalAlpha = 1; }
      try{ pv.drawImage(cv, 0, 0, 180, 320); }catch(e){}
      var s2 = document.getElementById("rnVs"); if(s2) s2.textContent = "⏺ "+Math.min(Math.ceil(TOT), Math.floor(t))+" / "+Math.ceil(TOT)+" s";
      if(t < TOT) raf = requestAnimationFrame(frame); else rec.stop(); };
    rec.start(250); frame(); };
  var ready = function(){ if(!left) preload(r, w, h, 90, go); };
  if(!left) ready(); else need.forEach(function(p){ var src = H.N.photoThumb ? H.N.photoThumb(p.id) : ""; if(!src){ left--; ready(); return; } var im = new Image(); im.onload = function(){ imgs[p.id] = im; left--; ready(); }; im.onerror = function(){ left--; ready(); }; im.src = src; }); }
window.FitRun = {view: view0, active: function(){ return !!R; }, activeType: function(){ return R ? R.ty : null; }, _fix: onFix, _hav: hav, _pace: pace, _tiles: TILES};
})();
