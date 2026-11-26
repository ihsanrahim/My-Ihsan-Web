/* 0.7.55 TV Display (owner): the masjid / home TV screen built from widgets on a 25 x 14 grid.
   17 widgets (header, digital and analog clock with prayer marks, prayer row / list / table, next prayer + iqamah,
   countdown, slideshow with own photos, hadith / ayat, memo, ticker, live video from a YouTube / Facebook / TikTok /
   Instagram link, QR with title and caption, text, picture, date). Each widget can be moved and resized on the grid,
   with its own background colour, see-through level, corners and text colour. The screen background is a theme,
   a colour, a gradient or a photo. 9 ready layouts (templates). Saved in localStorage ihsan_tvd.
   Played full screen by display.js (lock, remote, burn-in shift, auto start stay the same).
   TVD.render(box, cfg, opt) · TVD.setup(host, api) · TVD.templates(host, api) · TVD.cfg() · TVD.save(cfg) */
(function(){
"use strict";
var H = null, X = null, COLS = 25, ROWS = 14;
function L(a, b){ return H.L2x(a, b); }
function LL(a){ return a ? L(a[0], a[1]) : ""; }
function esc(s){ return H.esc(s==null ? "" : String(s)); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function pad(n){ return (n<10?"0":"")+n; }
function css(){ if(!document.querySelector('link[href="display/tvd.css"]')){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "display/tvd.css"; document.head.appendChild(l); } }
function init(h){ H = h || H; X = window.DisplayView && window.DisplayView._x; css(); }
function rgba(hex, a){ var m = /^#?([0-9a-f]{6})$/i.exec(hex||""); if(!m) return "transparent"; var n = parseInt(m[1], 16); return "rgba("+(n>>16)+","+(n>>8&255)+","+(n&255)+","+a+")"; }

// ---------------- photos (the app's own photo store, or the browser when there is no Android bridge) ----------------
function pdir(){ try{ return (window.Native && H.N.photoDir) ? H.N.photoDir() : ""; }catch(e){ return ""; } }
function imgSrc(id, thumb){ if(!id) return ""; if(/^data:/.test(id)) return id; var d = pdir(); if(d && !/^f/.test(id)) return d+(thumb?"t/":"")+id+".jpg"; try{ return localStorage.getItem("ihsan_phx_"+id) || ""; }catch(e){ return ""; } }
function pickPhotos(mode, done){ var tag = "tvd"+Date.now();
  if(window.Native && H.N.photoAdd){ var hl = function(r){ if(!r || r.tag!==tag) return; H.off("photos", hl); if(r.error) H.toast(L("Gambar gagal disimpan","Could not save the photo")); if(r.list && r.list.length) done(r.list.map(function(x){ return x.id; })); }; H.on("photos", hl); H.N.photoAdd(mode, tag); return; }
  var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; if(mode==="camera") inp.setAttribute("capture", "environment"); if(mode==="gallery") inp.multiple = true;
  inp.onchange = function(){ var fs = [].slice.call(inp.files||[]), out = [], n = fs.length; if(!n) return;
    fs.forEach(function(f){ var rd = new FileReader(); rd.onload = function(){ var im = new Image(); im.onload = function(){ var k = Math.min(1, 1280/Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width*k); c.height = Math.round(im.height*k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          var id = "f"+Date.now().toString(36)+Math.random().toString(36).slice(2, 5); try{ localStorage.setItem("ihsan_phx_"+id, c.toDataURL("image/jpeg", 0.8)); out.push(id); }catch(e){ H.toast(L("Storan pelayar penuh","Browser storage is full")); }
          if(--n===0) done(out); }; im.onerror = function(){ if(--n===0) done(out); }; im.src = rd.result; }; rd.readAsDataURL(f); }); };
  inp.click(); }
function dropPhoto(id){ if(!id || /^data:/.test(id)) return; var used = JSON.stringify(cfg()); if(used.split('"'+id+'"').length > 2) return;
  try{ if(/^f/.test(id)) localStorage.removeItem("ihsan_phx_"+id); else if(H.N.photoDel) H.N.photoDel(id); }catch(e){} }

// ---------------- backgrounds ----------------
var EXTRA = [ // [id, ms, en, bg css, fg, accent, font id, motif]
  ["putih","Putih Moden","Modern White","linear-gradient(160deg,#f7f8fa,#e6eaef)","#1b2430","#0b7a5a","sans",""],
  ["kelabu","Kelabu Lembut","Soft Grey","#eceef1","#20262e","#c0392b","sans",""],
  ["hitam","Hitam Pekat","Pure Black","#000000","#ffffff","#ffd400","sans",""],
  ["emas","Emas Raya","Raya Gold","radial-gradient(circle at 50% 30%,#1d5a33,#0a2a17 70%)","#fff6d8","#f2c94c","amiri","geo"],
  ["kaca","Kaca Biru","Blue Glass","linear-gradient(135deg,#0f2027,#203a43 50%,#2c5364)","#eaf6ff","#5ce1e6","sans","arabesque"]
];
function bgList(){ return (X ? X.THEMES : []).concat(EXTRA); }
function bgTheme(id){ return bgList().filter(function(t){ return t[0]===id; })[0] || bgList()[0] || EXTRA[2]; }
function lum(h){ var m = /^#?([0-9a-f]{6})$/i.exec(h||""); if(!m) return 1; var n = parseInt(m[1], 16); return ((n>>16)*0.299 + (n>>8&255)*0.587 + (n&255)*0.114)/255; }
function isLight(c){ return lum(look(c).fg) < 0.5; }
function look(c){ var b = c.bg || {}, th = bgTheme(b.th || "nabawi"); return {fg: c.fg || th[4], ac: c.ac || th[5], font: X ? X.font(c.font || th[6])[2] : "sans-serif", th: th}; }
function bgLayers(c){ var b = c.bg || {}, lk = look(c), th = lk.th, h = "", base = "";
  if(b.k==="solid") base = b.a || "#000"; else if(b.k==="grad") base = "linear-gradient("+(b.ang||160)+"deg,"+(b.a||"#0b5d3b")+","+(b.b||"#04301f")+")"; else base = th[3];
  h += '<div class="tvBg" style="background:'+esc(base)+'"></div>';
  if(b.k==="img" && b.img) h += '<div class="tvBgI" style="background-image:url(\''+esc(imgSrc(b.img))+'\');filter:blur('+(+b.blur||0)+'px)"></div>';
  if(b.k==="img" && b.img || +b.dark) h += '<div class="tvBgD" style="background:rgba(0,0,0,'+((+b.dark||0)/100)+')"></div>';
  if(b.pat!==false && X && (b.k==="theme" || !b.k)){ if(th[7]==="silhouette") h += '<div class="tvSil" style="background-image:'+X.svgUrl(X.SILHOUETTE, lk.ac)+'"></div>'; else if(th[7] && X.PATTERNS[th[7]]) h += '<div class="tvPat" style="background-image:'+X.svgUrl(X.PATTERNS[th[7]], lk.ac)+'"></div>'; }
  return h; }

// ---------------- prayer helpers ----------------
var SH = ["imsak","subuh","syuruk","zohor","asar","maghrib","isyak"];
function pk(o){ return SH.filter(function(k){ return k==="imsak" ? o.imsak : k==="syuruk" ? o.syuruk!==false : true; }); }
function tOf(ctx, k, d){ var t = (d||ctx.day)[k]; return t ? X.atTime(d===ctx.tmr ? ctx.tmrD : ctx.now, t) : null; }
function tm(ctx, d){ return d ? X.hm(d, ctx.cfg.h24) : "--:--"; }
function pn(ctx, k){ return X.pName(k, ctx.cfg.jum!==false && ctx.now.getDay()===5); }
function iqMin(ctx, k){ var q = ctx.cfg.iq || {}; return q[k]==null ? 10 : +q[k]; }
function phase(ctx){ var out = null; X.PKEYS.forEach(function(k){ var a = tOf(ctx, k); if(!a) return; var iq = new Date(a.getTime()+iqMin(ctx, k)*60000);
  if(ctx.now >= a && ctx.now < iq) out = {p: "iq", k: k, at: iq}; else if(ctx.now >= iq && ctx.now < new Date(iq.getTime()+10*60000)) out = {p: "solat", k: k}; }); return out; }
function mins(ms){ var m = Math.max(0, Math.round(ms/60000)), h = Math.floor(m/60); m = m%60; return h ? h+" "+L("j","h")+(m ? " "+m+" min" : "") : m+" min"; }
function ctxOf(c, rt){ var now = new Date(), key = now.toDateString(), C = ctxOf.c;
  if(!C || C.key!==key){ var td = new Date(now); td.setDate(td.getDate()+1); C = ctxOf.c = {key: key, day: X.day(now), tmrD: td, tmr: X.day(td), hij: H.hijri ? H.hijri(now) : ""}; }
  return {cfg: c, now: now, day: C.day, tmr: C.tmr, tmrD: C.tmrD, hij: C.hij, np: X.nextPrayer(now), rt: rt || {}, lk: look(c)}; }

// ---------------- the widgets ----------------
var MOTD = function(){ return Math.floor((Date.now() - new Date().getTimezoneOffset()*60000)/864e5); };
function hadithOf(src){ var d = MOTD(), en = H.en();
  if(src==="ayat" && window.AYAT_DAILY){ var a = window.AYAT_DAILY[d % window.AYAT_DAILY.length]; return {k: "📖 "+L("Ayat hari ini","Ayah of the day"), ar: a[3], t: en ? a[4] : (a[6] || ""), c: a[5]+" "+a[0]+":"+a[1]}; }
  if(src==="asma" && window.ASMAUL_HUSNA){ var s = window.ASMAUL_HUSNA[d % window.ASMAUL_HUSNA.length]; return {k: "✨ Asma ul-Husna", ar: s[0], t: s[1]+" · "+(en ? s[3] : s[2]), c: ""}; }
  var hd = H.hadith ? H.hadith() : null; return hd ? {k: "📜 "+L("Hadis hari ini","Hadith of the day"), t: en ? hd.en : hd.ms, c: hd.src||""} : {k: "📜", t: L("Sebaik-baik manusia ialah yang paling bermanfaat kepada manusia lain.","The best of people are those most beneficial to others."), c: "Al-Mu'jam al-Awsat"}; }
function cardHtml(x){ return '<div class="tvCard"><small>'+esc(x.k)+'</small>'+(x.ar ? '<div class="tvAr" dir="rtl">'+esc(x.ar)+'</div>' : '')+(x.t ? '<p>'+esc(x.t).replace(/\n/g, "<br>")+'</p>' : '')+(x.c ? '<cite>'+esc(x.c)+'</cite>' : '')+'</div>'; }
function embed(u, mute){ u = String(u||"").trim(); if(!u) return null; if(!/^https?:\/\//i.test(u)) u = "https://"+u; var m, mu = mute===false ? 0 : 1;
  if((m = u.match(/youtu\.be\/([\w-]{6,})/)) || (m = u.match(/youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|shorts\/|embed\/)([\w-]{6,})/))) return {k: "yt", n: "YouTube", src: "https://www.youtube.com/embed/"+m[1]+"?autoplay=1&mute="+mu+"&playsinline=1&rel=0&loop=1&playlist="+m[1], open: u};
  if((m = u.match(/youtube\.com\/channel\/(UC[\w-]+)/))) return {k: "yt", n: "YouTube", src: "https://www.youtube.com/embed/live_stream?channel="+m[1]+"&autoplay=1&mute="+mu, open: u};
  if(/(^|\.)(facebook\.com|fb\.watch|fb\.com)\//i.test(u.replace(/^https?:\/\//, ""))) return {k: "fb", n: "Facebook", src: "https://www.facebook.com/plugins/video.php?href="+encodeURIComponent(u)+"&show_text=false&autoplay=true&mute="+(mu?"true":"false")+"&width=1280", open: u};
  if((m = u.match(/tiktok\.com\/.*video\/(\d+)/))) return {k: "tt", n: "TikTok", src: "https://www.tiktok.com/embed/v2/"+m[1]+"?autoplay=1&muted="+mu, open: u};
  if(/tiktok\.com/i.test(u)) return {k: "tt", n: "TikTok LIVE", src: "", open: u};
  if((m = u.match(/instagram\.com\/(p|reel|tv)\/([\w-]+)/))) return {k: "ig", n: "Instagram", src: "https://www.instagram.com/"+m[1]+"/"+m[2]+"/embed", open: u};
  if(/instagram\.com/i.test(u)) return {k: "ig", n: "Instagram LIVE", src: "", open: u};
  if(/\.(mp4|webm|m3u8|ogg)(\?|$)/i.test(u)) return {k: "vid", n: L("Video","Video"), src: u, open: u};
  return {k: "web", n: L("Laman web","Web page"), src: u, open: u}; }
function qrOf(text){ try{ return window.NostrKit && X.qrSvg ? X.qrSvg(text) : ""; }catch(e){ return ""; } }
function needQr(){ if(!window.NostrKit && H.loadJs && !needQr.busy){ needQr.busy = true; H.loadJs(["groups/nostrkit.js"], function(){ needQr.busy = false; (RENDERS||[]).forEach(function(r){ try{ r.redraw(); }catch(e){} }); }); } }
function analog(ctx, o){ var s = '<svg viewBox="0 0 200 200" class="tvAnS"><circle cx="100" cy="100" r="96" class="tvAnF"/>', i, a;
  for(i = 0; i < 60; i++){ a = i*6*Math.PI/180; var r1 = i%5 ? 88 : 82; s += '<line x1="'+(100+Math.sin(a)*r1).toFixed(1)+'" y1="'+(100-Math.cos(a)*r1).toFixed(1)+'" x2="'+(100+Math.sin(a)*92).toFixed(1)+'" y2="'+(100-Math.cos(a)*92).toFixed(1)+'" class="'+(i%5?'tvAnT':'tvAnT5')+'"/>'; }
  if(o.nums!==false) for(i = 1; i <= 12; i++){ a = i*30*Math.PI/180; s += '<text x="'+(100+Math.sin(a)*70).toFixed(1)+'" y="'+(100-Math.cos(a)*70+5).toFixed(1)+'" class="tvAnN">'+i+'</text>'; }
  if(o.marks!==false){ var npk = ctx.np && ctx.np.k, ang = function(d){ return ((d.getHours()%12)+d.getMinutes()/60)/12*2*Math.PI; };
    if(o.arc!==false && ctx.np && ctx.np.t - ctx.now < 12*3600000){ var a0 = ang(ctx.now), a1 = ang(ctx.np.t); if(a1 < a0) a1 += 2*Math.PI; var big = a1-a0 > Math.PI ? 1 : 0;
      s += '<path d="M'+(100+Math.sin(a0)*96).toFixed(1)+' '+(100-Math.cos(a0)*96).toFixed(1)+' A96 96 0 '+big+' 1 '+(100+Math.sin(a1)*96).toFixed(1)+' '+(100-Math.cos(a1)*96).toFixed(1)+'" class="tvAnArc"/>'; }
    ["subuh","syuruk","zohor","asar","maghrib","isyak"].forEach(function(k){ var d = tOf(ctx, k); if(!d) return; var g = ang(d), on = k===npk;
      s += '<circle cx="'+(100+Math.sin(g)*96).toFixed(1)+'" cy="'+(100-Math.cos(g)*96).toFixed(1)+'" r="'+(on?7:5)+'" class="tvAnM'+(on?' on':'')+'"/>';
      var rr = d.getHours() < 12 ? 34 : 54; // morning names on the inner ring, afternoon and night on the outer ring
      if(o.labels!==false) s += '<text x="'+(100+Math.sin(g)*rr).toFixed(1)+'" y="'+(100-Math.cos(g)*rr+3.5).toFixed(1)+'" class="tvAnL'+(on?' on':'')+(rr<40?' am':'')+'">'+esc(pn(ctx, k).slice(0, 7))+'</text>'; }); }
  s += '<g class="tvHh"><line x1="100" y1="112" x2="100" y2="52"/></g><g class="tvHm"><line x1="100" y1="116" x2="100" y2="26"/></g>'+(o.secs!==false?'<g class="tvHs"><line x1="100" y1="122" x2="100" y2="18"/></g>':'')+'<circle cx="100" cy="100" r="5" class="tvAnC"/></svg>';
  return s; }
function hands(el, now){ var h = now.getHours()%12, m = now.getMinutes(), s = now.getSeconds(), set = function(q, d){ var g = el.querySelector(q); if(g) g.setAttribute("transform", "rotate("+d.toFixed(2)+" 100 100)"); };
  set(".tvHh", (h+m/60)*30); set(".tvHm", (m+s/60)*6); set(".tvHs", s*6); }
function cdParts(ms){ ms = Math.max(0, ms); var s = Math.floor(ms/1000); return [Math.floor(s/86400), Math.floor(s%86400/3600), Math.floor(s%3600/60), s%60]; }
function cdTarget(ctx, o){ if(o.to==="next") return ctx.np && ctx.np.t; if(o.to==="date") return o.at ? new Date(o.at) : null;
  var d = new Date(ctx.now), z; for(var i = 0; i < 8; i++){ if(d.getDay()===5){ var t = X.day(d).zohor; z = t ? X.atTime(d, t) : null; if(z && z > ctx.now - 45*60000) return z; } d.setDate(d.getDate()+1); } return null; }

var WD = { // i icon, n name, g group, d default size, m min size, o options, fs base font in grid cells, key -> redraw when it changes, html, upd every second
  header: {i: "🕌", n: ["Kepala masjid","Masjid header"], g: "m", d: [25, 2], m: [6, 1], o: {name: "", sub: "", logo: true, date: true, hijri: true, al: "split"}, fs: function(w, h){ return Math.min(h*0.42, w/14); },
    key: function(ctx){ return ctx.day.key || ctx.now.toDateString(); },
    html: function(W, ctx){ var o = W.o, M = ctx.cfg.masjid || {}, nm = o.name || M.n || L("Nama Masjid","Masjid Name"), lg = o.logo!==false && M.logo ? '<img class="tvLogo" src="'+esc(imgSrc(M.logo, 1))+'" alt="">' : '';
      var dt = (o.date!==false ? '<b>'+esc(ctx.now.toLocaleDateString(H.en() ? "en-GB" : "ms-MY", {weekday: "long", day: "numeric", month: "long", year: "numeric"}))+'</b>' : '')+(o.hijri!==false && ctx.hij ? '<small>'+esc(ctx.hij)+'</small>' : '');
      return '<div class="tvHead'+(o.al==="center"?' c':'')+'">'+lg+'<div class="tvHn"><b>'+esc(nm)+'</b>'+((o.sub||M.sub) ? '<small>'+esc(o.sub||M.sub)+'</small>' : '')+'</div>'+(dt ? '<div class="tvHd">'+dt+'</div>' : '')+'</div>'; }},
  clock: {i: "⏰", n: ["Jam digital","Digital clock"], g: "t", d: [9, 4], m: [3, 2], o: {secs: true, ampm: true, date: false, hijri: false}, fs: function(w, h){ return Math.min(h*0.55, w/4.2); },
    key: function(ctx, W){ return ctx.now.getSeconds()+"|"+ctx.now.getMinutes(); },
    html: function(W, ctx){ var o = W.o, d = ctx.now, h = d.getHours(), t = ctx.cfg.h24 ? pad(h) : String(h%12||12);
      return '<div class="tvClk"><div class="tvT">'+t+'<i>:</i>'+pad(d.getMinutes())+(o.secs!==false ? '<span class="tvS">'+pad(d.getSeconds())+'</span>' : '')+(!ctx.cfg.h24 && o.ampm!==false ? '<span class="tvAp">'+(h>=12?"PM":"AM")+'</span>' : '')+'</div>'+
        (o.date ? '<small>'+esc(d.toLocaleDateString(H.en() ? "en-GB" : "ms-MY", {weekday: "long", day: "numeric", month: "long"}))+'</small>' : '')+(o.hijri && ctx.hij ? '<small>'+esc(ctx.hij)+'</small>' : '')+'</div>'; }},
  analog: {i: "🕰️", n: ["Jam analog + tanda solat","Analog clock + prayer marks"], g: "t", d: [8, 8], m: [3, 3], o: {marks: true, labels: true, nums: true, secs: true, arc: true}, fs: function(w, h){ return Math.min(w, h)*0.1; },
    key: function(ctx){ return ctx.now.getMinutes()+"|"+(ctx.np && ctx.np.k); }, html: function(W, ctx){ return '<div class="tvAn">'+analog(ctx, W.o)+'</div>'; }, upd: function(el, W, ctx){ hands(el, ctx.now); }},
  date: {i: "📅", n: ["Tarikh & Hijri","Date & Hijri"], g: "t", d: [8, 3], m: [3, 1], o: {wd: true, greg: true, hijri: true}, fs: function(w, h){ return Math.min(h*0.3, w/9); },
    key: function(ctx){ return ctx.now.toDateString(); },
    html: function(W, ctx){ var o = W.o, d = ctx.now, lc = H.en() ? "en-GB" : "ms-MY";
      return '<div class="tvDate">'+(o.wd!==false ? '<small>'+esc(d.toLocaleDateString(lc, {weekday: "long"}))+'</small>' : '')+(o.greg!==false ? '<b>'+esc(d.toLocaleDateString(lc, {day: "numeric", month: "long", year: "numeric"}))+'</b>' : '')+(o.hijri!==false && ctx.hij ? '<span>'+esc(ctx.hij)+'</span>' : '')+'</div>'; }},
  prow: {i: "🕌", n: ["Waktu solat (baris)","Prayer times (row)"], g: "p", d: [25, 3], m: [8, 2], o: {syuruk: true, imsak: false, iq: false}, fs: function(w, h){ return Math.min(h*0.3, w/6/4.4); },
    key: function(ctx){ return ctx.now.getMinutes()+"|"+(ctx.np && ctx.np.k)+(phase(ctx)||{}).p; },
    html: function(W, ctx){ var o = W.o, np = ctx.np && ctx.np.k, ph = phase(ctx);
      return '<div class="tvRow">'+pk(o).map(function(k){ var on = k===np || ph && ph.k===k; return '<div class="tvPc'+(on?' on':'')+'"><small>'+esc(pn(ctx, k))+'</small><b>'+tm(ctx, tOf(ctx, k))+'</b>'+(o.iq && X.PKEYS.indexOf(k)>=0 ? '<em>+'+iqMin(ctx, k)+'</em>' : '')+'</div>'; }).join("")+'</div>'; }},
  plist: {i: "📋", n: ["Waktu solat (senarai)","Prayer times (list)"], g: "p", d: [7, 8], m: [4, 4], o: {syuruk: true, imsak: false, iq: true}, fs: function(w, h){ return Math.min(h/7/1.55, w/9); },
    key: function(ctx){ return ctx.now.getMinutes()+"|"+(ctx.np && ctx.np.k); },
    html: function(W, ctx){ var o = W.o, np = ctx.np && ctx.np.k;
      return '<div class="tvList">'+pk(o).map(function(k){ var a = tOf(ctx, k); return '<div class="tvLi'+(k===np?' on':'')+'"><span>'+esc(pn(ctx, k))+'</span><b>'+tm(ctx, a)+'</b>'+(o.iq ? '<em>'+(X.PKEYS.indexOf(k)>=0 && a ? tm(ctx, new Date(a.getTime()+iqMin(ctx, k)*60000)) : '')+'</em>' : '')+'</div>'; }).join("")+'</div>'; }},
  ptable: {i: "🗓", n: ["Jadual azan · iqamah · esok","Adhan · iqamah · tomorrow table"], g: "p", d: [12, 8], m: [7, 5], o: {syuruk: true, jum: true, tmr: true}, fs: function(w, h){ return Math.min(h/9/1.45, w/17); },
    key: function(ctx){ return ctx.now.getMinutes()+"|"+(ctx.np && ctx.np.k); },
    html: function(W, ctx){ var o = W.o, np = ctx.np && ctx.np.k, fri = ctx.now.getDay()===5;
      var h = '<table class="tvTab"><tr><th></th><th>'+L("Azan","Adhan")+'</th><th>'+L("Iqamah","Iqamah")+'</th>'+(o.tmr!==false ? '<th>'+L("Esok","Tomorrow")+'</th>' : '')+'</tr>';
      X.PKEYS.forEach(function(k){ var a = tOf(ctx, k), b = tOf(ctx, k, ctx.tmr); h += '<tr class="'+(k===np?'on':'')+'"><td>'+esc(pn(ctx, k))+'</td><td>'+tm(ctx, a)+'</td><td>'+(a ? '<b>'+tm(ctx, new Date(a.getTime()+iqMin(ctx, k)*60000))+'</b><small>+'+iqMin(ctx, k)+'</small>' : '')+'</td>'+(o.tmr!==false ? '<td>'+tm(ctx, b)+'</td>' : '')+'</tr>'; });
      var ex = []; if(o.syuruk!==false) ex.push([L("Syuruk","Sunrise"), tm(ctx, tOf(ctx, "syuruk"))]); if(o.jum!==false){ var j = cdTarget(ctx, {to: "jumaat"}); ex.push(["Jumaat", j ? tm(ctx, j) : "--:--"]); }
      if(ex.length) h += '<tr class="tvEx"><td colspan="'+(o.tmr!==false?4:3)+'">'+ex.map(function(e){ return '<span>'+esc(e[0])+' <b>'+esc(e[1])+'</b></span>'; }).join("")+'</td></tr>';
      return h+'</table>'; }},
  next: {i: "⏳", n: ["Solat seterusnya + iqamah","Next prayer + iqamah"], g: "p", d: [8, 4], m: [4, 2], o: {sty: "card", iq: true}, fs: function(w, h){ return W_NEXT(w, h); },
    key: function(ctx, W){ return W.o.sty==="big" ? ctx.now.getMinutes()+"|"+((phase(ctx)||{}).p==="iq" ? ctx.now.getSeconds() : "") : ctx.now.getSeconds()+"|"+ctx.now.getMinutes(); },
    html: function(W, ctx){ var o = W.o, ph = o.iq!==false ? phase(ctx) : null, np = ctx.np;
      if(ph && ph.p==="iq") return '<div class="tvNx iq"><small>'+L("Iqamah ","Iqamah ")+esc(pn(ctx, ph.k))+'</small><b>'+X.dur(ph.at - ctx.now)+'</b><span>'+L("Luruskan dan rapatkan saf","Straighten and close the rows")+'</span></div>';
      if(ph && ph.p==="solat") return '<div class="tvNx sol"><b>🤫 '+L("Solat sedang berlangsung","Prayer in progress")+'</b><span>'+L("Mohon senyap · matikan telefon","Please be silent · phones off")+'</span></div>';
      if(!np || !np.t) return '<div class="tvNx"><small>'+L("Waktu solat belum ditetapkan","Prayer times not set yet")+'</small></div>';
      if(o.sty==="big") return '<div class="tvNx big"><b>'+esc(pn(ctx, np.k))+' '+L("azan dalam","adhan in")+' <em>'+mins(np.t - ctx.now)+'</em></b><span>'+tm(ctx, np.t)+'</span></div>';
      return '<div class="tvNx"><small>'+esc(pn(ctx, np.k))+' '+L("dalam","in")+'</small><b>'+X.dur(np.t - ctx.now)+'</b><span>'+L("Azan ","Adhan ")+tm(ctx, np.t)+(o.iq!==false && X.PKEYS.indexOf(np.k)>=0 ? ' · '+L("Iqamah ","Iqamah ")+'+'+iqMin(ctx, np.k) : '')+'</span></div>'; }},
  countdown: {i: "⏱", n: ["Kiraan detik","Countdown"], g: "p", d: [16, 6], m: [6, 3], o: {title: "", to: "jumaat", at: "", done: ""}, fs: function(w, h){ return Math.min(h/4.4, w/13); },
    key: function(ctx){ return ctx.now.getSeconds()+"|"+ctx.now.getMinutes(); },
    html: function(W, ctx){ var o = W.o, t = cdTarget(ctx, o), title = o.title || (o.to==="jumaat" ? L("Khutbah Jumaat bermula dalam","Friday khutbah starts in") : o.to==="next" ? L("Solat seterusnya dalam","Next prayer in") : L("Kiraan detik","Countdown"));
      if(!t) return '<div class="tvCd"><small>'+esc(title)+'</small><span>'+L("Tetapkan tarikh & masa dalam tetapan widget","Set the date & time in the widget settings")+'</span></div>';
      if(t <= ctx.now) return '<div class="tvCd"><b class="tvCdDone">'+esc(o.done || L("Sudah bermula","It has started"))+'</b></div>';
      var p = cdParts(t - ctx.now), lab = [L("hari","days"), L("jam","hours"), L("minit","min"), L("saat","sec")];
      return '<div class="tvCd"><small>'+esc(title)+'</small><div class="tvCdB">'+p.map(function(v, i){ return (i===0 && !v) ? '' : '<div><b>'+(i ? pad(v) : v)+'</b><i>'+lab[i]+'</i></div>'; }).join("")+'</div><span>'+esc(t.toLocaleString(H.en() ? "en-GB" : "ms-MY", {weekday: "long", hour: "numeric", minute: "2-digit"}))+'</span></div>'; }},
  slides: {i: "🖼", n: ["Tayangan slaid","Slideshow"], g: "c", d: [14, 8], m: [4, 3], o: {ph: true, ayat: false, hadith: false, doa: false, asma: false, secs: 10, fit: "cover"}, fs: function(w, h){ return Math.min(h/9, w/16); }, nofit: true,
    mount: function(c, W, ctx, R, it){ var o = W.o, items = slideItems(W, ctx.cfg); it.u = null;
      if(!items.length){ c.innerHTML = '<div class="tvEmpty">🖼<small>'+L("Tambah gambar di Tetapan › Gambar","Add photos in Settings › Photos")+'</small></div>'; return; }
      c.innerHTML = '<div class="tvSl"></div><div class="tvSl"></div>'+(items.length>1 ? '<div class="tvDots">'+items.map(function(){ return '<i></i>'; }).join("")+'</div>' : '');
      var L2 = c.querySelectorAll(".tvSl"), cur = 0, i = 0, el = 0, off = (ctx.rt.ssOff||0);
      var show = function(n){ var it = items[(n%items.length+items.length)%items.length], lay = L2[cur^1];
        lay.innerHTML = it.img ? '<img src="'+esc(imgSrc(it.img))+'" style="object-fit:'+(o.fit==="contain"?"contain":"cover")+'" alt="">' : cardHtml(it);
        lay.classList.add("on"); L2[cur].classList.remove("on"); cur ^= 1; if(!it.img) fitText(lay.firstChild, lay);
        c.querySelectorAll(".tvDots i").forEach(function(d, j){ d.classList.toggle("on", j===(n%items.length+items.length)%items.length); }); };
      show(0); it.u = function(ctx2){ if(R.mini || items.length < 2) return; var o2 = ctx2.rt.ssOff||0; if(o2!==off){ i += o2-off; off = o2; el = 0; show(i); return; } if(ctx2.rt.ssPause) return; if(++el >= Math.max(3, +o.secs||10)){ el = 0; i++; show(i); } }; },
    upd: function(el, W, ctx, it){ if(it.u) it.u(ctx); }},
  hadith: {i: "📜", n: ["Hadis / ayat","Hadith / ayah"], g: "c", d: [14, 4], m: [5, 2], o: {src: "hadith"}, fs: function(w, h){ return Math.min(h/4.5, w/16); },
    key: function(ctx, W){ return ctx.now.toDateString()+W.o.src+(window.AYAT_DAILY?1:0); }, html: function(W, ctx){ return cardHtml(hadithOf(W.o.src)); }},
  memo: {i: "📌", n: ["Memo & makluman","Memo & notices"], g: "c", d: [8, 9], m: [4, 3], o: {title: "", text: "", num: false}, fs: function(w, h){ return Math.min(h/8, w/11); },
    key: function(){ return 1; }, html: function(W){ var o = W.o, ls = String(o.text || L("Kuliah Maghrib setiap Isnin & Khamis\nKelas fardu ain Sabtu 9 pagi\nGotong-royong Ahad ini","Maghrib talk every Monday & Thursday\nBasic classes Saturday 9 am\nClean-up this Sunday")).split("\n").filter(function(x){ return x.trim(); });
      return '<div class="tvMemo"><b>'+esc(o.title || L("📌 Makluman","📌 Notices"))+'</b><'+(o.num?'ol':'ul')+'>'+ls.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</'+(o.num?'ol':'ul')+'></div>'; }},
  ticker: {i: "🔤", n: ["Teks bergerak","Ticker"], g: "c", d: [25, 2], m: [6, 1], o: {lab: true, label: "", text: "", speed: 5}, fs: function(w, h){ return h*0.42; }, nofit: true,
    key: function(ctx, W){ return (ctx.rt.ticker||"")+"|"+W.o.text; },
    html: function(W, ctx){ var o = W.o, t = ctx.rt.ticker || o.text || L("Sila matikan telefon bimbit semasa solat · Jaga kebersihan masjid · Tabung infaq di pintu utama","Please switch off phones during prayer · Keep the masjid clean · Donation box at the main door"), lab = o.lab===false ? "" : (o.label || L("PERINGATAN","NOTICE"));
      var dur = Math.max(8, t.length*0.22*(10/Math.max(1, Math.min(10, +o.speed||5))));
      return '<div class="tvTk">'+(lab ? '<b>'+esc(lab)+'</b>' : '')+'<div class="tvTkW"><span style="animation-duration:'+dur.toFixed(1)+'s">'+esc(t)+'</span></div></div>'; }},
  live: {i: "📡", n: ["Siaran langsung (pautan)","Live video (link)"], g: "c", d: [16, 9], m: [4, 3], o: {url: "", title: "", mute: true}, fs: function(w, h){ return Math.min(h/8, w/16); }, nofit: true,
    mount: function(c, W, ctx, R){ var o = W.o, e = embed(o.url, o.mute);
      if(!e){ c.innerHTML = '<div class="tvEmpty">📡<small>'+L("Tampal pautan YouTube, Facebook, TikTok atau Instagram","Paste a YouTube, Facebook, TikTok or Instagram link")+'</small></div>'; return; }
      var cap = o.title ? '<div class="tvLvT">🔴 '+esc(o.title)+'</div>' : '';
      if(R.mini){ c.innerHTML = '<div class="tvEmpty">▶<small>'+esc(e.n)+'</small></div>'+cap; return; }
      if(!e.src){ needQr(); var q = qrOf(e.open); c.innerHTML = '<div class="tvLvNo">'+(q ? '<div class="tvQ">'+q+'</div>' : '')+'<div><b>🔴 '+esc(e.n)+'</b><small>'+L("Siaran langsung ini tidak boleh dibenamkan. Imbas untuk menonton.","This live stream cannot be embedded. Scan to watch.")+'</small></div></div>'+cap; return; }
      c.innerHTML = (e.k==="vid" ? '<video src="'+esc(e.src)+'" autoplay loop playsinline'+(o.mute!==false?' muted':'')+'></video>' : '<iframe src="'+esc(e.src)+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>')+cap; }},
  qr: {i: "🔳", n: ["Kod QR + kapsyen","QR code + caption"], g: "c", d: [6, 7], m: [3, 3], o: {img: "", link: "", title: "", cap: ""}, fs: function(w, h){ return Math.min(h/8, w/6.5); },
    key: function(ctx, W){ return W.o.img+"|"+W.o.link+(window.NostrKit?1:0); },
    html: function(W){ var o = W.o, q = o.img ? '<img src="'+esc(imgSrc(o.img))+'" alt="QR">' : (o.link ? (qrOf(o.link) || (needQr(), '')) : '');
      return '<div class="tvQr">'+'<b>'+esc(o.title || L("💝 Tabung infaq","💝 Donations"))+'</b><div class="tvQ">'+(q || '<span>🔳</span>')+'</div><small>'+esc(o.cap || L("Imbas dengan aplikasi bank / e-dompet (DuitNow QR)","Scan with any bank / e-wallet app (DuitNow QR)"))+'</small></div>'; }},
  text: {i: "🔠", n: ["Teks","Text"], g: "c", d: [12, 2], m: [2, 1], o: {text: "", al: "center", bold: true}, fs: function(w, h){ return h*0.5; },
    key: function(ctx, W){ return W.o.text; }, html: function(W){ var o = W.o; return '<div class="tvTxt" style="text-align:'+(o.al||"center")+';justify-content:'+({left: "flex-start", right: "flex-end"}[o.al]||"center")+';font-weight:'+(o.bold!==false?800:500)+'">'+(esc(o.text || L("Selamat datang","Welcome")).replace(/\n/g, "<br>"))+'</div>'; }},
  image: {i: "🏞", n: ["Gambar / poster","Picture / poster"], g: "c", d: [8, 6], m: [2, 2], o: {img: "", fit: "cover"}, fs: function(w, h){ return h/6; }, nofit: true,
    key: function(ctx, W){ return W.o.img+W.o.fit; }, html: function(W){ return W.o.img ? '<img class="tvImg" src="'+esc(imgSrc(W.o.img))+'" style="object-fit:'+(W.o.fit==="contain"?"contain":"cover")+'" alt="">' : '<div class="tvEmpty">🏞<small>'+L("Pilih gambar dalam tetapan widget","Choose a picture in the widget settings")+'</small></div>'; }}
};
function W_NEXT(w, h){ return Math.min(h/3.4, w/9); }
var ORDER = ["header","clock","analog","date","prow","plist","ptable","next","countdown","slides","live","hadith","memo","ticker","qr","text","image"];
var GROUPS = [["t","🕰️",["Jam & tarikh","Clock & date"]],["m","🕌",["Masjid","Masjid"]],["p","🕌",["Solat","Prayer"]],["c","🧩",["Kandungan","Content"]]];
// widget option fields: [key, kind, label, extra]
var FIELDS = {
  header: [["name","txt",["Nama (kosong = nama masjid)","Name (empty = masjid name)"]],["sub","txt",["Baris kedua (alamat)","Second line (address)"]],["al","ch",["Susunan","Layout"],[["split",["Kiri-kanan","Left-right"]],["center",["Tengah","Centre"]]]],["logo","sw",["Logo","Logo"]],["date","sw",["Tarikh","Date"]],["hijri","sw",["Hijri","Hijri"]]],
  clock: [["secs","sw",["Saat","Seconds"]],["ampm","sw",["AM/PM","AM/PM"]],["date","sw",["Tarikh di bawah","Date below"]],["hijri","sw",["Hijri di bawah","Hijri below"]]],
  analog: [["marks","sw",["Tanda waktu solat","Prayer time marks"]],["labels","sw",["Nama solat","Prayer names"]],["arc","sw",["Lengkung ke solat seterusnya","Arc to the next prayer"]],["nums","sw",["Angka","Numbers"]],["secs","sw",["Jarum saat","Second hand"]]],
  date: [["wd","sw",["Hari","Weekday"]],["greg","sw",["Masihi","Gregorian"]],["hijri","sw",["Hijri","Hijri"]]],
  prow: [["syuruk","sw",["Syuruk","Sunrise"]],["imsak","sw",["Imsak","Imsak"]],["iq","sw",["Minit iqamah","Iqamah minutes"]]],
  plist: [["syuruk","sw",["Syuruk","Sunrise"]],["imsak","sw",["Imsak","Imsak"]],["iq","sw",["Waktu iqamah","Iqamah time"]]],
  ptable: [["tmr","sw",["Lajur esok","Tomorrow column"]],["syuruk","sw",["Syuruk","Sunrise"]],["jum","sw",["Jumaat","Jumu'ah"]]],
  next: [["sty","ch",["Gaya","Style"],[["card",["Kad + kiraan","Card + countdown"]],["big",["Ayat besar","Big sentence"]]]],["iq","sw",["Kiraan iqamah & \"solat berlangsung\"","Iqamah countdown & \"prayer in progress\""]]],
  countdown: [["to","ch",["Kira ke","Count to"],[["jumaat",["Khutbah Jumaat","Friday khutbah"]],["next",["Solat seterusnya","Next prayer"]],["date",["Tarikh & masa","Date & time"]]]],["at","dt",["Tarikh & masa (cth. solat Hari Raya)","Date & time (e.g. Eid prayer)"]],["title","txt",["Tajuk","Title"]],["done","txt",["Teks bila tiba masa","Text when the time comes"]]],
  slides: [["ph","sw",["Gambar saya","My photos"]],["ayat","sw",["Ayat","Ayat"]],["hadith","sw",["Hadis","Hadith"]],["doa","sw",["Doa","Duas"]],["asma","sw",["Asma ul-Husna","Asma ul-Husna"]],["secs","sl",["Saat setiap slaid","Seconds per slide"],[3,60]],["fit","ch",["Gambar","Pictures"],[["cover",["Penuh","Fill"]],["contain",["Muat","Fit"]]]],["photos","go",["🖼 Urus gambar","🖼 Manage photos"]]],
  hadith: [["src","ch",["Kandungan","Content"],[["hadith",["Hadis","Hadith"]],["ayat",["Ayat","Ayah"]],["asma",["Asma ul-Husna","Asma ul-Husna"]]]]],
  memo: [["title","txt",["Tajuk","Title"]],["text","area",["Satu baris setiap makluman","One line per notice"]],["num","sw",["Bernombor","Numbered"]]],
  ticker: [["lab","sw",["Tunjuk label","Show the label"]],["label","txt",["Label (cth. PERINGATAN)","Label (e.g. NOTICE)"]],["text","area",["Teks","Text"]],["speed","sl",["Kelajuan","Speed"],[1,10]]],
  live: [["url","txt",["Pautan (YouTube, Facebook, TikTok, Instagram, mp4)","Link (YouTube, Facebook, TikTok, Instagram, mp4)"],"https://"],["title","txt",["Tajuk di bawah (cth. Kuliah Maghrib · Ustaz Ahmad)","Lower title (e.g. Maghrib talk · Ustaz Ahmad)"]],["mute","sw",["Tanpa bunyi","Muted"]]],
  qr: [["img","img",["Gambar QR (muat naik)","QR picture (upload)"]],["link","txt",["… atau buat QR dari pautan / teks","… or make a QR from a link / text"],"https://"],["title","txt",["Tajuk","Title"]],["cap","txt",["Kapsyen","Caption"]]],
  text: [["text","area",["Teks","Text"]],["al","ch",["Jajaran","Align"],[["left",["Kiri","Left"]],["center",["Tengah","Centre"]],["right",["Kanan","Right"]]]],["bold","sw",["Tebal","Bold"]]],
  image: [["img","img",["Gambar","Picture"]],["fit","ch",["Saiz","Size"],[["cover",["Penuh","Fill"]],["contain",["Muat","Fit"]]]]]
};
function slideItems(W, c){ var o = W.o, out = [], d = MOTD(), en = H.en(), rot = function(a, n){ if(!a || !a.length) return []; var k = d % a.length; return a.slice(k).concat(a.slice(0, k)).slice(0, n); };
  var ph = o.ph!==false ? (c.photos||[]).map(function(id){ return {img: id}; }) : [], lists = [];
  if(o.ayat) lists.push(rot(window.AYAT_DAILY, 8).map(function(a){ return {k: "📖 "+L("Ayat","Ayah"), ar: a[3], t: en ? a[4] : (a[6]||""), c: a[5]+" "+a[0]+":"+a[1]}; }));
  if(o.hadith) lists.push(rot(window.HADITH_DAILY, 8).map(function(h){ return {k: "📜 "+L("Hadis","Hadith"), t: en ? h.en : h.ms, c: h.src}; }));
  if(o.doa && window.DOA){ var all = []; window.DOA.forEach(function(g){ (g.items||[]).forEach(function(x){ if(x.ar && String(x.ar).length < 220) all.push(x); }); }); lists.push(rot(all, 8).map(function(x){ return {k: "🤲 "+(en ? x.t_en : x.t_ms), ar: x.ar, t: en ? x.en : x.ms, c: x.src||""}; })); }
  if(o.asma) lists.push(rot(window.ASMAUL_HUSNA, 8).map(function(a){ return {k: "✨ Asma ul-Husna", ar: a[0], t: a[1]+" · "+(en ? a[3] : a[2]), c: ""}; }));
  var txt = []; for(var i = 0, more = true; more; i++){ more = false; lists.forEach(function(l){ if(l[i]){ txt.push(l[i]); more = true; } }); }
  if(!ph.length) return txt; if(!txt.length) return ph;
  var j = 0; txt.forEach(function(t, k){ out.push(ph[j++ % ph.length]); out.push(t); }); return out; }
function over(box){ if(box.scrollHeight > box.clientHeight + 1 || box.scrollWidth > box.clientWidth + 1) return true;
  var k = box.querySelectorAll("div,p,td,li,table"); for(var i = 0; i < k.length; i++){ var e = k[i]; if(e.clientWidth && (e.scrollWidth > e.clientWidth + 1 || e.clientHeight && e.scrollHeight > e.clientHeight + 2 && /hidden|auto/.test(getComputedStyle(e).overflow))) return true; } return false; }
function fitText(c, box){ if(!c || !box) return; var fs = parseFloat(c.style.fontSize) || parseFloat(getComputedStyle(c).fontSize) || 16, n = 0;
  while(n++ < 14 && over(box) && fs > 5){ fs *= 0.9; c.style.fontSize = fs+"px"; } }

// ---------------- the renderer ----------------
var RENDERS = [];
function wStyle(W, c){ var g = c.cols||COLS, r = c.rows||ROWS; return "left:"+(W.x/g*100)+"%;top:"+(W.y/r*100)+"%;width:"+(W.w/g*100)+"%;height:"+(W.h/r*100)+"%"; }
function render(box, c, opt){ opt = opt || {}; init(H); var dead = false, inst = [], timer = null, ro = null, R = {mini: !!opt.mini, edit: !!opt.edit, full: !!opt.full, small: !!opt.small}, rt = opt.rt || {};
  var needAyat = (c.W||[]).some(function(W){ return W.t==="hadith" && W.o.src==="ayat" || W.t==="slides" && (W.o.ayat || W.o.doa || W.o.asma); }) || (c.W||[]).some(function(W){ return W.t==="hadith" && W.o.src==="asma"; });
  box.classList.add("tvBox"); box.classList.toggle("tvEditing", R.edit);
  var one = function(W){ var D = WD[W.t]; if(!D) return null; W.o = W.o || {}; Object.keys(D.o).forEach(function(k){ if(W.o[k]===undefined) W.o[k] = D.o[k]; });
    var el = document.createElement("div"); el.className = "tvW tvW-"+W.t+(R.edit && opt.sel===W.id ? " tvSel" : ""); el.setAttribute("data-wid", W.id); el.style.cssText = wStyle(W, c);
    var op = W.op==null ? 0 : +W.op;
    el.innerHTML = '<div class="tvWb" style="background:'+(W.bg ? rgba(W.bg, (100-op)/100) : 'transparent')+';border-radius:calc(var(--u,10px)*'+((W.rad==null?1:+W.rad)*0.5)+');'+(W.bd ? 'box-shadow:0 0 0 2px '+rgba(W.bd, .9)+' inset;' : '')+(W.bg && op>15 && op<100 ? 'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);' : '')+'"></div><div class="tvWc"'+(W.fg ? ' style="color:'+esc(W.fg)+'"' : '')+'></div>'+(R.edit ? '<div class="tvShield"></div><i class="tvRz"></i>' : '');
    return {W: W, D: D, el: el, c: el.querySelector(".tvWc"), b: el.querySelector(".tvWb"), k: null}; };
  var paint = function(it, ctx, force){ var D = it.D, W = it.W;
    if(D.mount){ if(force || it.k==null){ it.k = 1; D.mount(it.c, W, ctx, R, it); } }
    else { var k = D.key ? D.key(ctx, W) : 1; if(force || k!==it.k){ it.k = k; it.c.innerHTML = D.html(W, ctx); if(!D.nofit) fitOne(it, true); } }
    if(D.upd) D.upd(it.c, W, ctx, it); };
  var fitOne = function(it){ var u = R.u; if(!u) return; it.c.style.fontSize = it.D.fs(it.W.w, it.W.h)*u+"px"; if(!it.D.nofit) fitText(it.c, it.c); else if(it.W.t==="slides"){ var a = it.c.querySelector(".tvSl.on"); if(a && a.firstChild && a.firstChild.className==="tvCard"){ a.firstChild.style.fontSize = ""; fitText(a.firstChild, a); } } };
  var layout = function(){ if(dead) return; var w = box.clientWidth, h = box.clientHeight; if(!w || !h) return; R.u = Math.min(w/(c.cols||COLS), h/(c.rows||ROWS)); box.style.setProperty("--u", R.u+"px"); inst.forEach(function(it){ fitOne(it); }); };
  var build = function(){ if(dead) return; box.innerHTML = '<div class="tvLay">'+bgLayers(c)+'</div>'; var lk = look(c); box.style.color = lk.fg; box.style.setProperty("--ac", lk.ac); box.style.setProperty("--fg", lk.fg); box.style.fontFamily = lk.font;
    box.classList.toggle("tvLight", isLight(c));
    inst = (c.W||[]).map(one).filter(Boolean); inst.forEach(function(it){ box.appendChild(it.el); });
    R.u = 0; var w = box.clientWidth, h = box.clientHeight; if(w && h){ R.u = Math.min(w/(c.cols||COLS), h/(c.rows||ROWS)); box.style.setProperty("--u", R.u+"px"); }
    var ctx = ctxOf(c, rt); inst.forEach(function(it){ it.k = null; try{ paint(it, ctx, true); }catch(e){ it.c.textContent = "⚠️"; } }); layout(); };
  var tick = function(){ if(dead) return; if(!document.body.contains(box)){ stop(); return; } var ctx = ctxOf(c, rt); inst.forEach(function(it){ try{ paint(it, ctx); }catch(e){} }); };
  var stop = function(){ dead = true; clearInterval(timer); if(ro) try{ ro.disconnect(); }catch(e){} RENDERS = RENDERS.filter(function(x){ return x!==api; }); box.querySelectorAll("iframe,video").forEach(function(f){ try{ f.src = "about:blank"; }catch(e){} }); };
  var api = {stop: stop, redraw: build, layout: layout, u: function(){ return R.u; }, el: function(id){ return box.querySelector('[data-wid="'+id+'"]'); },
    one: function(id){ var W = (c.W||[]).filter(function(x){ return x.id===id; })[0], i = -1; inst.forEach(function(it, j){ if(it.W.id===id) i = j; }); if(!W || i<0){ build(); return; }
      var it = one(W); var old = inst[i].el; box.replaceChild(it.el, old); inst[i] = it; try{ paint(it, ctxOf(c, rt), true); }catch(e){} fitOne(it); },
    pos: function(id){ var it = inst.filter(function(x){ return x.W.id===id; })[0]; if(!it) return; it.el.style.cssText = wStyle(it.W, c); fitOne(it); },
    sel: function(id){ inst.forEach(function(it){ it.el.classList.toggle("tvSel", it.W.id===id); }); }};
  if(needAyat && !window.AYAT_DAILY && H.loadJs && !R.mini) H.loadJs(["quran/ayat_daily.js"], function(){ if(!dead) build(); });
  build(); if(!R.mini) timer = setInterval(tick, 1000);
  try{ if(window.ResizeObserver){ ro = new ResizeObserver(function(){ clearTimeout(ro.t); ro.t = setTimeout(layout, 60); }); ro.observe(box); } }catch(e){}
  RENDERS.push(api); return api; }

// ---------------- the 9 ready layouts ----------------
var nid = 0; function wid(){ return "w"+Date.now().toString(36)+(nid++); }
function W(t, x, y, w, h, o, lk){ var r = {id: wid(), t: t, x: x, y: y, w: w, h: h, bg: "", op: 0, rad: 1, fg: "", o: o || {}}; if(lk) Object.keys(lk).forEach(function(k){ r[k] = lk[k]; }); return r; }
var GL = {bg: "#ffffff", op: 82, rad: 1.2}, GD = {bg: "#000000", op: 60, rad: 1.2}, CARD = {bg: "#ffffff", op: 0, rad: 1.2, fg: "#1b2430"};
var TPL = [
  ["nabawi","🕌","Hijau Masjid Nabawi","Nabawi Green",["Kepala, jam, 6 kad solat, hadis, peringatan","Header, clock, 6 prayer cards, hadith, notice ticker"], function(){ return {bg: {k: "theme", th: "nabawi"}, W: [
    W("header", 0, 0, 25, 2, {}), W("clock", 7, 2, 11, 3, {secs: true}), W("prow", 0, 5, 25, 3, {}, GL), W("hadith", 3, 8, 19, 4, {src: "hadith"}, GL), W("ticker", 0, 12, 25, 2, {}, {bg: "#000000", op: 45, rad: 0})]}; }],
  ["memo","📌","Kad Moden & Memo","Modern Cards & Memo",["Memo di kiri, slaid di kanan, waktu solat di bawah","Memo on the left, slideshow on the right, prayer times below"], function(){ return {bg: {k: "theme", th: "putih"}, W: [
    W("header", 0, 0, 25, 2, {}), W("memo", 0, 2, 8, 9, {}, CARD), W("slides", 8, 2, 17, 9, {ph: true, hadith: true}, {rad: 1.2}), W("prow", 0, 11, 25, 3, {}, {bg: "#0b7a5a", op: 0, rad: 1.2, fg: "#ffffff"})]}; }],
  ["sidebar","🪟","Sidebar Elegan","Elegant Sidebar",["Slaid besar, senarai solat di sisi","Big slideshow, prayer list on the side"], function(){ return {bg: {k: "theme", th: "haram"}, W: [
    W("slides", 0, 0, 17, 14, {ph: true, ayat: true}, {rad: 0}), W("clock", 17, 0, 8, 3, {secs: false, date: true}), W("plist", 17, 3, 8, 8, {iq: true}, GD), W("next", 17, 11, 8, 3, {})]}; }],
  ["grid","🔲","Grid Kontemporari","Contemporary Grid",["Jam besar, kiraan solat, slaid, kad solat","Big clock, prayer countdown, slideshow, prayer cards"], function(){ return {bg: {k: "theme", th: "kaca"}, W: [
    W("clock", 0, 0, 9, 5, {date: true}, GD), W("next", 0, 5, 9, 4, {}, GD), W("slides", 9, 0, 16, 9, {ph: true, hadith: true}, {rad: 1.2}), W("prow", 0, 9, 25, 3, {}, GD), W("ticker", 0, 12, 25, 2, {}, {bg: "#000000", op: 40, rad: 0})]}; }],
  ["ultra","✨","Ultra Moden & Memo","Ultra Modern & Memo",["Senarai solat, slaid, memo dan QR infaq","Prayer list, slideshow, memo and donation QR"], function(){ return {bg: {k: "theme", th: "ottoman"}, W: [
    W("plist", 0, 0, 6, 9, {iq: false}, GD), W("next", 0, 9, 6, 5, {}, GD), W("header", 6, 0, 13, 2, {al: "center", date: false}), W("slides", 6, 2, 13, 12, {ph: true, ayat: true}, {rad: 1.2}), W("memo", 19, 0, 6, 8, {}, GD), W("qr", 19, 8, 6, 6, {}, GD)]}; }],
  ["khutbah","🎙","Mod Khutbah Jumaat","Friday Khutbah Mode",["Kiraan ke khutbah, peringatan senyap","Countdown to the khutbah, silent reminder"], function(){ return {bg: {k: "theme", th: "nabawi"}, W: [
    W("header", 0, 0, 25, 2, {al: "center"}), W("countdown", 3, 2, 19, 7, {to: "jumaat"}, GD), W("text", 2, 9, 21, 2, {text: L("📵 Sila matikan telefon bimbit · Dengar khutbah dengan tenang","📵 Please switch off your phone · Listen to the khutbah calmly")}), W("prow", 0, 11, 25, 3, {}, GL)]}; }],
  ["kuliah","📡","Kuliah Live","Live Kuliah",["Video langsung penuh skrin dengan jalur bawah","Full-screen live video with a lower third"], function(){ return {bg: {k: "theme", th: "hitam"}, W: [
    W("live", 0, 0, 25, 14, {url: "", title: ""}, {rad: 0}), W("text", 0, 11, 17, 3, {text: L("Kuliah Maghrib\nUstaz Ahmad · Kitab Riyadhus Solihin","Maghrib Talk\nUstaz Ahmad · Riyadhus Solihin"), al: "left"}, {bg: "#000000", op: 30, rad: 0}), W("next", 17, 11, 8, 3, {}, {bg: "#0b5d3b", op: 10, rad: 0})]}; }],
  ["raya","🌙","Mod Hari Raya","Hari Raya Mode",["Kiraan ke solat sunat Hari Raya","Countdown to the Eid prayer"], function(){ var d = new Date(); d.setDate(d.getDate()+1); d.setHours(8, 30, 0, 0); var at = d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T08:30";
    return {bg: {k: "theme", th: "emas"}, W: [
    W("text", 1, 0, 23, 3, {text: L("Selamat Hari Raya Aidilfitri","Eid Mubarak")}), W("countdown", 3, 3, 19, 7, {to: "date", at: at, title: L("Solat Sunat Aidilfitri dalam","Eid prayer in"), done: L("Solat Hari Raya sedang berlangsung","The Eid prayer is in progress")}, GD), W("text", 3, 10, 19, 2, {text: L("Takbir raya selepas Subuh · Maaf zahir & batin","Takbir after Subuh · Forgive us for any wrongs"), bold: false}), W("clock", 9, 12, 7, 2, {secs: false})]}; }],
  ["analog","🕰️","Analog & Jadual","Analog & Table",["Jam analog dengan tanda solat, azan dalam, jadual iqamah & esok","Analog clock with prayer marks, adhan in, iqamah & tomorrow table"], function(){ return {bg: {k: "theme", th: "kelabu"}, W: [
    W("analog", 1, 1, 11, 12, {}), W("next", 12, 1, 12, 3, {sty: "big"}), W("ptable", 12, 4, 12, 9, {}, CARD)]}; }]
];
function tplCfg(id, keep){ var t = TPL.filter(function(x){ return x[0]===id; })[0] || TPL[0], b = t[5](), c = keep ? clone(keep) : base();
  c.tpl = t[0]; c.bg = b.bg; c.fg = ""; c.ac = ""; c.font = ""; c.W = b.W;
  if(keep){ c.W.forEach(function(w){ if(w.t==="live"){ var old = (keep.W||[]).filter(function(x){ return x.t==="live" && x.o.url; })[0]; if(old) w.o.url = old.o.url; } if(w.t==="qr"){ var q = (keep.W||[]).filter(function(x){ return x.t==="qr" && x.o.img; })[0]; if(q) w.o = clone(q.o); } }); }
  return c; }
function base(){ return {mode: "tvd", v: 1, name: L("TV Display","TV Display"), tpl: "nabawi", bg: {k: "theme", th: "nabawi"}, fg: "", ac: "", font: "", masjid: {n: "", sub: "", logo: ""},
  iq: {subuh: 20, zohor: 10, asar: 10, maghrib: 5, isyak: 10}, h24: false, jum: true, photos: [], W: [], orient: "landscape", lock: false, burn: true, remote: false, bright: -1}; }
function cfg(){ var c = H.load("ihsan_tvd", null); if(!c || !c.W){ c = tplCfg("nabawi"); } var b = base(); Object.keys(b).forEach(function(k){ if(c[k]===undefined) c[k] = b[k]; }); c.mode = "tvd"; return c; }
function save(c){ H.save("ihsan_tvd", c); }

// ---------------- Settings › Set up ----------------
var E = null; // {c, host, api, sel, pan, hist, r}
var PAL = ["#ffffff","#000000","#0b5d3b","#04301f","#1f9d63","#c9a646","#f2c94c","#b4572e","#7a1328","#0b2a6b","#4a9be8","#00e5ff","#7b2d8e","#1b2430","#e0605a","#ff7a00"];
var FONT_IDS = ["","sans","serif","round","playfair","bebas","orbit","seg","amiri","kufi","cairo"];
function commit(fn, how){ E.hist.push(JSON.stringify(E.c)); if(E.hist.length > 60) E.hist.shift(); fn(E.c); save(E.c);
  if(how==="one" && E.sel) E.r.one(E.sel); else if(how==="pos" && E.sel) E.r.pos(E.sel); else if(how!=="none") E.r.redraw(); }
function selW(){ return (E.c.W||[]).filter(function(w){ return w.id===E.sel; })[0]; }
function setup(host, api){ init(H); E = {c: cfg(), host: host, api: api || {}, sel: null, pan: (E && E.pan) || "w", hist: []};
  host.innerHTML = '<div class="tvSet"><div class="tvStageW"><div class="tvStage" id="tvPv"></div><div class="tvGridLab"><span>25 × 14</span><span id="tvHint">'+L("Ketik widget untuk pilih · seret untuk alih · tarik ◢ untuk ubah saiz","Tap a widget to pick it · drag to move · pull ◢ to resize")+'</span><button class="chip" id="tvUndo">↶</button></div></div>'+
    '<div class="tvPills" id="tvPills">'+[["w","🧩",["Widget","Widgets"]],["b","🎨",["Latar","Background"]],["m","🕌",["Masjid","Masjid"]],["p","🖼",["Gambar","Photos"]],["s","📺",["Skrin","Screen"]]].map(function(p){ return '<button data-pan="'+p[0]+'"'+(E.pan===p[0]?' class="on"':'')+'><span>'+p[1]+'</span>'+esc(LL(p[2]))+'</button>'; }).join("")+'</div><div id="tvPan"></div></div>';
  var pv = host.querySelector("#tvPv"); E.r = render(pv, E.c, {edit: true, sel: E.sel, small: true});
  bindStage(pv);
  host.querySelector("#tvUndo").onclick = function(){ if(!E.hist.length){ H.toast(L("Tiada lagi untuk dibuat asal","Nothing more to undo")); return; } E.c = JSON.parse(E.hist.pop()); save(E.c); E.r.stop(); E.r = render(pv, E.c, {edit: true, sel: E.sel, small: true}); if(!selW()) E.sel = null; panel(); };
  host.querySelectorAll("[data-pan]").forEach(function(b){ b.onclick = function(){ E.pan = b.getAttribute("data-pan"); host.querySelectorAll("[data-pan]").forEach(function(x){ x.classList.toggle("on", x===b); }); if(E.pan!=="w"){ E.sel = null; E.r.sel(null); } panel(); }; });
  panel(); }
function select(id){ E.sel = id; E.r.sel(id); if(E.pan!=="w"){ E.pan = "w"; E.host.querySelectorAll("[data-pan]").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-pan")==="w"); }); } panel(); }
function bindStage(pv){ var drag = null;
  pv.addEventListener("pointerdown", function(e){ var w = e.target.closest(".tvW"); if(!w){ if(E.sel){ E.sel = null; E.r.sel(null); panel(); } return; }
    var id = w.getAttribute("data-wid"); if(E.sel!==id) select(id); var W = selW(); if(!W) return; e.preventDefault();
    var u = E.r.u() || 10; drag = {rz: !!e.target.closest(".tvRz"), x0: e.clientX, y0: e.clientY, W: W, s: [W.x, W.y, W.w, W.h], u: [pv.clientWidth/COLS, pv.clientHeight/ROWS], moved: false, snap: JSON.stringify(E.c)};
    try{ pv.setPointerCapture(e.pointerId); }catch(x){} });
  pv.addEventListener("pointermove", function(e){ if(!drag) return; var dx = Math.round((e.clientX-drag.x0)/drag.u[0]), dy = Math.round((e.clientY-drag.y0)/drag.u[1]), W = drag.W, s = drag.s, D = WD[W.t], mn = D.m;
    if(drag.rz){ W.w = Math.max(mn[0], Math.min(COLS - s[0], s[2]+dx)); W.h = Math.max(mn[1], Math.min(ROWS - s[1], s[3]+dy)); }
    else { W.x = Math.max(0, Math.min(COLS - s[2], s[0]+dx)); W.y = Math.max(0, Math.min(ROWS - s[3], s[1]+dy)); }
    if(W.x!==s[0] || W.y!==s[1] || W.w!==s[2] || W.h!==s[3]){ drag.moved = true; E.r.pos(W.id); var hn = E.host.querySelector("#tvHint"); if(hn) hn.textContent = (drag.rz ? "◢ " : "✥ ")+W.w+" × "+W.h+"  @ "+W.x+","+W.y; } });
  var end = function(){ if(!drag) return; if(drag.moved){ E.hist.push(drag.snap); save(E.c); panel(); } drag = null; };
  pv.addEventListener("pointerup", end); pv.addEventListener("pointercancel", end); }
function sw(k, on, lab, attr){ return '<label class="tvSw"><input type="checkbox" '+(attr||"data-o")+'="'+k+'"'+(on?' checked':'')+'><i></i><span>'+esc(lab)+'</span></label>'; }
function swatch(attr, cur, none){ return '<div class="tvSwat">'+(none ? '<button class="tvSc none'+(!cur?' on':'')+'" '+attr+'="" title="'+esc(none)+'">⊘</button>' : '')+PAL.map(function(p){ return '<button class="tvSc'+(String(cur).toLowerCase()===p?' on':'')+'" '+attr+'="'+p+'" style="background:'+p+'"></button>'; }).join("")+'<label class="tvSc pick" title="+"><input type="color" '+attr+'-pick="1" value="'+(/^#[0-9a-f]{6}$/i.test(cur||"")?cur:"#888888")+'">🎨</label></div>'; }
function slider(attr, v, min, max, lab, unit){ return '<label class="tvRg"><span>'+esc(lab)+' <b>'+v+(unit||"")+'</b></span><input type="range" '+attr+' min="'+min+'" max="'+max+'" value="'+v+'"></label>'; }
function tileHost(t){ var D = WD[t]; return '<button class="tvTile'+(E.c.W.some(function(w){ return w.t===t; })?' on':'')+'" data-add="'+t+'"><div class="tvTileF"><div class="tvTileV" data-tv="'+t+'"></div></div><b>'+D.i+' '+esc(LL(D.n))+'</b>'+(function(){ var n = E.c.W.filter(function(w){ return w.t===t; }).length; return n ? '<em>✓'+(n>1?" "+n:"")+'</em>' : ''; })()+'</button>'; }
function panel(){ var P = E.host.querySelector("#tvPan"); if(!P) return; (E.minis||[]).forEach(function(m){ try{ m.stop(); }catch(e){} }); E.minis = []; var c = E.c, h = "";
  if(E.pan==="w"){ var W = selW();
    if(W){ var D = WD[W.t];
      h += '<div class="tvProp"><div class="tvPropH"><b>'+D.i+' '+esc(LL(D.n))+'</b><button class="chip" data-wa="done">✓ '+L("Siap","Done")+'</button></div>'+
        '<div class="tvSize"><div><span>'+L("Lebar","Width")+'</span><button data-wz="w-">−</button><b>'+W.w+'</b><button data-wz="w+">＋</button></div><div><span>'+L("Tinggi","Height")+'</span><button data-wz="h-">−</button><b>'+W.h+'</b><button data-wz="h+">＋</button></div>'+
        '<div class="tvMove"><button data-wz="x-">◀</button><button data-wz="y-">▲</button><button data-wz="y+">▼</button><button data-wz="x+">▶</button></div></div>'+
        '<div class="tvActs"><button data-wa="front">⬆ '+L("Depan","Front")+'</button><button data-wa="back">⬇ '+L("Belakang","Back")+'</button><button data-wa="full">⛶ '+L("Penuh","Fill")+'</button><button data-wa="dup">⧉ '+L("Salin","Copy")+'</button><button data-wa="del" class="red">🗑 '+L("Buang","Remove")+'</button></div>'+
        '<details class="tvSec" open><summary>🎨 '+L("Rupa widget","Widget look")+'</summary><div class="tvLab">'+L("Warna latar","Background colour")+'</div>'+swatch("data-wbg", W.bg, L("Tiada","None"))+
        (W.bg ? slider('data-wop', W.op||0, 0, 100, L("Lut sinar","See-through"), "%") : '')+slider('data-wrad', Math.round((W.rad==null?1:W.rad)*10), 0, 40, L("Bucu bulat","Rounded corners"))+
        '<div class="tvLab">'+L("Warna teks","Text colour")+'</div>'+swatch("data-wfg", W.fg, L("Ikut tema","Theme"))+'<div class="tvLab">'+L("Garis tepi","Border")+'</div>'+swatch("data-wbd", W.bd, L("Tiada","None"))+'</details>'+
        '<details class="tvSec" open><summary>⚙ '+L("Kandungan","Content")+'</summary>'+(FIELDS[W.t]||[]).map(function(f){ return field(W, f); }).join("")+'</details></div>';
    }
    h += '<div class="tvAddH"><b>➕ '+L("Pilih widget untuk paparan","Pick widgets for the display")+'</b><small>'+L("Ketik untuk tambah · ✓ = sudah di paparan (ketik untuk pilih)","Tap to add · ✓ = on the display (tap to pick it)")+'</small></div>'+
      GROUPS.map(function(g){ var ts = ORDER.filter(function(t){ return WD[t].g===g[0]; }); return '<div class="tvGrpH">'+g[1]+' '+esc(LL(g[2]))+'</div><div class="tvTiles">'+ts.map(tileHost).join("")+'</div>'; }).join("");
  } else if(E.pan==="b"){ var b = c.bg || {}, lk = look(c);
    h += '<div class="tvLab">'+L("Tema siap","Ready themes")+'</div><div class="tvBgs">'+bgList().map(function(t){ return '<button class="tvBgT'+(b.k==="theme"&&b.th===t[0]?' on':'')+'" data-bth="'+t[0]+'" style="background:'+esc(t[3])+';color:'+t[4]+'"><b style="color:'+t[5]+'">Aa</b><small>'+esc(L(t[1], t[2]))+'</small></button>'; }).join("")+'</div>'+
      '<div class="tvLab">'+L("Atau sendiri","Or your own")+'</div><div class="tvSeg">'+[["solid",["Warna","Colour"]],["grad",["Gradien","Gradient"]],["img",["Gambar","Photo"]]].map(function(k){ return '<button data-bk="'+k[0]+'"'+(b.k===k[0]?' class="on"':'')+'>'+esc(LL(k[1]))+'</button>'; }).join("")+'</div>';
    if(b.k==="solid") h += swatch("data-ba", b.a);
    if(b.k==="grad") h += '<div class="tvLab">1</div>'+swatch("data-ba", b.a)+'<div class="tvLab">2</div>'+swatch("data-bb", b.b)+slider('data-bang', b.ang||160, 0, 360, L("Arah","Angle"), "°");
    if(b.k==="img") h += '<div class="tvImgPick">'+(b.img ? '<img src="'+esc(imgSrc(b.img, 1))+'" alt="">' : '<span>🏞</span>')+'<button class="btn alt g3d" data-bimg="gallery">🖼 '+L("Pilih gambar","Choose a photo")+'</button><button class="chip" data-bimg="camera">📷</button></div>'+slider('data-bblur', b.blur||0, 0, 20, L("Kabur","Blur"), "px");
    h += slider('data-bdark', b.dark||0, 0, 85, L("Gelapkan latar","Darken the background"), "%")+(b.k==="theme" ? sw("pat", b.pat!==false, L("Corak / siluet tema","Theme pattern / silhouette"), "data-bsw") : '')+
      '<div class="tvLab">'+L("Warna teks utama","Main text colour")+'</div>'+swatch("data-cfg", c.fg, L("Ikut tema","Theme"))+'<div class="tvLab">'+L("Warna sorotan (solat seterusnya)","Highlight colour (next prayer)")+'</div>'+swatch("data-cac", c.ac, L("Ikut tema","Theme"))+
      '<div class="tvLab">'+L("Fon","Font")+'</div><div class="tvFonts">'+FONT_IDS.map(function(f){ var F = f ? X.font(f) : null; return '<button data-font="'+f+'"'+(String(c.font||"")===f?' class="on"':'')+(F?' style="font-family:'+esc(F[2])+'"':'')+'>'+(F ? esc(F[1]) : L("Tema","Theme"))+'</button>'; }).join("")+'</div>';
  } else if(E.pan==="m"){ var M = c.masjid || {};
    h += '<label class="tvF"><span>🕌 '+L("Nama masjid / surau","Masjid / surau name")+'</span><input class="rin" data-m="n" value="'+esc(M.n||"")+'" placeholder="Masjid Al-Ihsan"></label>'+
      '<label class="tvF"><span>📍 '+L("Alamat / baris kedua","Address / second line")+'</span><input class="rin" data-m="sub" value="'+esc(M.sub||"")+'"></label>'+
      '<div class="tvLab">'+L("Logo","Logo")+'</div><div class="tvImgPick">'+(M.logo ? '<img src="'+esc(imgSrc(M.logo, 1))+'" alt="">' : '<span>🕌</span>')+'<button class="btn alt g3d" data-mlogo="one">🖼 '+L("Pilih logo","Choose a logo")+'</button>'+(M.logo ? '<button class="chip" data-mlogo="x">✕</button>' : '')+'</div>'+
      '<div class="tvLab">⏱ '+L("Minit iqamah selepas azan","Iqamah minutes after adhan")+'</div>'+X.PKEYS.map(function(k){ return slider('data-iq="'+k+'"', (c.iq||{})[k]==null?10:c.iq[k], 0, 45, X.pName(k), " min"); }).join("")+
      sw("h24", c.h24, L("Jam 24 jam","24-hour clock"), "data-csw")+sw("jum", c.jum!==false, L("Zohor hari Jumaat ditulis \"Jumaat\"","Call Friday Zohor \"Jumaat\""), "data-csw")+
      '<div class="mut tiny">'+L("Waktu solat ikut zon dalam tetapan Solat aplikasi.","Prayer times follow the zone in the app's Prayer settings.")+'</div>';
  } else if(E.pan==="p"){ var ph = c.photos || [];
    h += '<div class="tvLab">🖼 '+L("Gambar tayangan slaid","Slideshow photos")+' ('+ph.length+')</div><div class="btns"><button class="btn gold g3d" data-padd="gallery">＋ '+L("Muat naik gambar","Upload photos")+'</button><button class="btn alt g3d" data-padd="camera">📷 '+L("Kamera","Camera")+'</button></div>'+
      (ph.length ? '<div class="tvThumbs">'+ph.map(function(id, i){ return '<div class="tvTh"><img src="'+esc(imgSrc(id, 1))+'" alt=""><div><button data-pmv="'+i+'|-1">◀</button><button data-pdel="'+i+'">✕</button><button data-pmv="'+i+'|1">▶</button></div></div>'; }).join("")+'</div>' : '<div class="mut small">'+L("Belum ada gambar. Poster, jadual kuliah, gambar masjid…","No photos yet. Posters, class timetables, masjid pictures…")+'</div>')+
      (c.W.some(function(w){ return w.t==="slides"; }) ? '' : '<button class="btn alt full g3d" data-add="slides" style="margin-top:8px">＋ '+L("Tambah widget tayangan slaid","Add a slideshow widget")+'</button>');
  } else if(E.pan==="s"){
    h += '<div class="tvLab">'+L("Arah skrin","Screen direction")+'</div><div class="tvSeg">'+[["landscape",["Melintang","Landscape"]],["rlandscape",["Melintang terbalik","Landscape flipped"]]].map(function(o){ return '<button data-or="'+o[0]+'"'+(c.orient===o[0]?' class="on"':'')+'>'+esc(LL(o[1]))+'</button>'; }).join("")+'</div>'+
      sw("lock", c.lock, "🔒 "+L("Kunci skrin (leret 🔒 lima kali untuk keluar)","Lock the screen (swipe 🔒 five times to exit)"), "data-csw")+sw("burn", c.burn!==false, "🛡 "+L("Elak kesan terbakar skrin (gerak sedikit setiap minit)","Avoid screen burn-in (shift a little every minute)"), "data-csw")+
      sw("remote", c.remote, "📱 "+L("Benarkan kawalan dari telefon","Allow the phone remote"), "data-csw")+
      '<div class="btns" style="margin-top:8px"><button class="btn alt g3d" data-sa="auto">⏻ '+L("Mula automatik","Auto start")+'</button><button class="btn alt g3d" data-sa="clear">🧹 '+L("Kosongkan semua widget","Clear all widgets")+'</button></div>';
  }
  P.innerHTML = h; bindPanel(P);
  P.querySelectorAll("[data-tv]").forEach(function(v){ var t = v.getAttribute("data-tv"), D = WD[t], f = v.parentNode, fw = 128, fh = 64, ar = D.d[0]/D.d[1], w = fw, hh = fw/ar; if(hh > fh){ hh = fh; w = fh*ar; }
    v.style.width = w+"px"; v.style.height = hh+"px"; var ex = E.c.W.filter(function(x){ return x.t===t; })[0], one = ex ? clone(ex) : {id: "m", t: t, x: 0, y: 0, w: D.d[0], h: D.d[1], bg: "#000000", op: 55, rad: 1, o: {}}; one.x = 0; one.y = 0; one.w = D.d[0]; one.h = D.d[1];
    try{ E.minis.push(render(v, {bg: E.c.bg, fg: E.c.fg, ac: E.c.ac, font: E.c.font, masjid: E.c.masjid, iq: E.c.iq, h24: E.c.h24, jum: E.c.jum, photos: E.c.photos, cols: D.d[0], rows: D.d[1], W: [one]}, {mini: true})); }catch(e){} }); }
function field(W, f){ var k = f[0], t = f[1], lab = LL(f[2]), v = W.o[k];
  if(t==="sw") return sw(k, v, lab);
  if(t==="txt") return '<label class="tvF"><span>'+esc(lab)+'</span><input class="rin" data-o="'+k+'" value="'+esc(v||"")+'" placeholder="'+esc(f[3]||"")+'"></label>';
  if(t==="area") return '<label class="tvF"><span>'+esc(lab)+'</span><textarea class="rin" rows="3" data-o="'+k+'">'+esc(v||"")+'</textarea></label>';
  if(t==="dt") return '<label class="tvF"><span>'+esc(lab)+'</span><input class="rin" type="datetime-local" data-o="'+k+'" value="'+esc(v||"")+'"></label>';
  if(t==="sl") return slider('data-osl="'+k+'"', +v||0, f[3][0], f[3][1], lab);
  if(t==="ch") return '<div class="tvLab">'+esc(lab)+'</div><div class="tvSeg">'+f[3].map(function(o){ return '<button data-och="'+k+'|'+o[0]+'"'+(String(v)===o[0]?' class="on"':'')+'>'+esc(LL(o[1]))+'</button>'; }).join("")+'</div>';
  if(t==="img") return '<div class="tvLab">'+esc(lab)+'</div><div class="tvImgPick">'+(v ? '<img src="'+esc(imgSrc(v, 1))+'" alt="">' : '<span>🔳</span>')+'<button class="btn alt g3d" data-oimg="'+k+'">🖼 '+L("Muat naik","Upload")+'</button>'+(v ? '<button class="chip" data-oimgx="'+k+'">✕</button>' : '')+'</div>';
  if(t==="go") return '<button class="btn alt full g3d" data-go="'+k+'" style="margin-top:6px">'+esc(lab)+'</button>';
  return ""; }
function addWidget(t){ var D = WD[t], c = E.c, best = null;
  for(var y = 0; y <= ROWS - D.d[1] && !best; y++) for(var x = 0; x <= COLS - D.d[0] && !best; x++){ var free = !c.W.some(function(w){ return x < w.x+w.w && x+D.d[0] > w.x && y < w.y+w.h && y+D.d[1] > w.y; }); if(free) best = [x, y]; }
  if(!best) best = [Math.max(0, Math.round((COLS-D.d[0])/2)), Math.max(0, Math.round((ROWS-D.d[1])/2))];
  var n = W(t, best[0], best[1], D.d[0], D.d[1], clone(D.o), isLight(c) ? {bg: "#ffffff", op: 0, rad: 1.2, fg: ""} : {bg: "#000000", op: 55, rad: 1.2});
  commit(function(cc){ cc.W.push(n); }); select(n.id); H.toast(D.i+" "+L("Ditambah. Seret untuk alih, tarik ◢ untuk saiz.","Added. Drag to move, pull ◢ to resize.")); }
function bindPanel(P){ var c = E.c, W = selW(), T = null;
  var on = function(q, fn){ P.querySelectorAll(q).forEach(function(b){ fn(b); }); };
  on("[data-add]", function(b){ b.onclick = function(){ var t = b.getAttribute("data-add"), ex = E.c.W.filter(function(w){ return w.t===t; });
    if(ex.length && !b.classList.contains("btn")){ var i = ex.map(function(w){ return w.id; }).indexOf(E.sel); select(ex[(i+1) % ex.length].id); window.scrollTo && E.host.querySelector("#tvPv").scrollIntoView({block: "nearest"}); return; }
    if(b.classList.contains("btn")) E.pan = "w"; addWidget(t); }; });
  // long press a ✓ tile = add one more of the same kind
  on(".tvTile.on", function(b){ b.addEventListener("contextmenu", function(e){ e.preventDefault(); addWidget(b.getAttribute("data-add")); }); });
  if(W){ var D = WD[W.t];
    on("[data-wz]", function(b){ b.onclick = function(){ var z = b.getAttribute("data-wz"), a = z[0], d = z[1]==="+" ? 1 : -1;
      commit(function(){ if(a==="w") W.w = Math.max(D.m[0], Math.min(COLS-W.x, W.w+d)); if(a==="h") W.h = Math.max(D.m[1], Math.min(ROWS-W.y, W.h+d)); if(a==="x") W.x = Math.max(0, Math.min(COLS-W.w, W.x+d)); if(a==="y") W.y = Math.max(0, Math.min(ROWS-W.h, W.y+d)); }, "pos"); panel(); }; });
    on("[data-wa]", function(b){ b.onclick = function(){ var a = b.getAttribute("data-wa"), i = c.W.indexOf(W);
      if(a==="done"){ E.sel = null; E.r.sel(null); panel(); return; }
      if(a==="del"){ commit(function(cc){ cc.W.splice(i, 1); }); E.sel = null; panel(); return; }
      if(a==="dup"){ var n = clone(W); n.id = wid(); n.x = Math.min(COLS-n.w, n.x+1); n.y = Math.min(ROWS-n.h, n.y+1); commit(function(cc){ cc.W.push(n); }); select(n.id); return; }
      if(a==="full"){ commit(function(){ W.x = 0; W.y = 0; W.w = COLS; W.h = ROWS; }, "one"); E.r.pos(W.id); panel(); return; }
      commit(function(cc){ cc.W.splice(i, 1); if(a==="front") cc.W.push(W); else cc.W.unshift(W); }); E.r.sel(W.id); }; });
    on("[data-wbg]", function(b){ b.onclick = function(){ var v = b.getAttribute("data-wbg"); commit(function(){ W.bg = v; if(v && !W.op && W.op!==0) W.op = 40; }, "one"); panel(); }; });
    on("[data-wbg-pick]", function(b){ b.onchange = function(){ commit(function(){ W.bg = b.value; }, "one"); panel(); }; });
    on("[data-wfg]", function(b){ b.onclick = function(){ commit(function(){ W.fg = b.getAttribute("data-wfg"); }, "one"); panel(); }; });
    on("[data-wfg-pick]", function(b){ b.onchange = function(){ commit(function(){ W.fg = b.value; }, "one"); panel(); }; });
    on("[data-wbd]", function(b){ b.onclick = function(){ commit(function(){ W.bd = b.getAttribute("data-wbd"); }, "one"); panel(); }; });
    on("[data-wbd-pick]", function(b){ b.onchange = function(){ commit(function(){ W.bd = b.value; }, "one"); panel(); }; });
    on("[data-wop]", function(b){ b.oninput = function(){ b.previousSibling.querySelector("b").textContent = b.value+"%"; W.op = +b.value; E.r.one(W.id); }; b.onchange = function(){ commit(function(){ W.op = +b.value; }, "none"); }; });
    on("[data-wrad]", function(b){ b.oninput = function(){ b.previousSibling.querySelector("b").textContent = b.value; W.rad = +b.value/10; E.r.one(W.id); }; b.onchange = function(){ commit(function(){ W.rad = +b.value/10; }, "none"); }; });
    on("input[data-o],textarea[data-o]", function(b){ var k = b.getAttribute("data-o"); if(b.type==="checkbox") b.onchange = function(){ commit(function(){ W.o[k] = b.checked; }, "one"); };
      else { b.oninput = function(){ clearTimeout(T); T = setTimeout(function(){ commit(function(){ W.o[k] = b.value; }, "one"); }, 350); }; b.onchange = function(){ clearTimeout(T); if(W.o[k]!==b.value) commit(function(){ W.o[k] = b.value; }, "one"); }; } });
    on("[data-osl]", function(b){ var k = b.getAttribute("data-osl"); b.oninput = function(){ b.previousSibling.querySelector("b").textContent = b.value; }; b.onchange = function(){ commit(function(){ W.o[k] = +b.value; }, "one"); }; });
    on("[data-och]", function(b){ b.onclick = function(){ var p = b.getAttribute("data-och").split("|"); commit(function(){ W.o[p[0]] = p[1]; }, "one"); panel(); }; });
    on("[data-oimg]", function(b){ b.onclick = function(){ var k = b.getAttribute("data-oimg"); pickPhotos("one", function(ids){ if(!ids.length) return; var old = W.o[k]; commit(function(){ W.o[k] = ids[0]; }, "one"); dropPhoto(old); panel(); }); }; });
    on("[data-oimgx]", function(b){ b.onclick = function(){ var k = b.getAttribute("data-oimgx"), old = W.o[k]; commit(function(){ W.o[k] = ""; }, "one"); dropPhoto(old); panel(); }; });
    on("[data-go]", function(b){ b.onclick = function(){ E.pan = "p"; E.sel = null; E.r.sel(null); E.host.querySelectorAll("[data-pan]").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-pan")==="p"); }); panel(); }; });
  }
  on("[data-bth]", function(b){ b.onclick = function(){ commit(function(cc){ cc.bg.k = "theme"; cc.bg.th = b.getAttribute("data-bth"); }); panel(); }; });
  on("[data-bk]", function(b){ b.onclick = function(){ var k = b.getAttribute("data-bk"); commit(function(cc){ cc.bg.k = k; if(!cc.bg.a) cc.bg.a = "#0b5d3b"; if(!cc.bg.b) cc.bg.b = "#04301f"; }); panel(); if(k==="img" && !c.bg.img) P.querySelector('[data-bimg="gallery"]').click(); }; });
  ["ba","bb"].forEach(function(a){ on("[data-"+a+"]", function(b){ b.onclick = function(){ commit(function(cc){ cc.bg[a[1]] = b.getAttribute("data-"+a); }); panel(); }; }); on("[data-"+a+"-pick]", function(b){ b.onchange = function(){ commit(function(cc){ cc.bg[a[1]] = b.value; }); panel(); }; }); });
  [["bang","ang"],["bblur","blur"],["bdark","dark"]].forEach(function(p){ on("[data-"+p[0]+"]", function(b){ b.oninput = function(){ b.previousSibling.querySelector("b").textContent = b.value+(p[1]==="dark"?"%":p[1]==="ang"?"°":"px"); }; b.onchange = function(){ commit(function(cc){ cc.bg[p[1]] = +b.value; }); }; }); });
  on("[data-bimg]", function(b){ b.onclick = function(){ pickPhotos(b.getAttribute("data-bimg")==="camera" ? "camera" : "one", function(ids){ if(!ids.length) return; var old = c.bg.img; commit(function(cc){ cc.bg.k = "img"; cc.bg.img = ids[0]; if(cc.bg.dark==null) cc.bg.dark = 30; }); dropPhoto(old); panel(); }); }; });
  on("[data-bsw]", function(b){ b.onchange = function(){ commit(function(cc){ cc.bg.pat = b.checked; }); }; });
  on("[data-cfg]", function(b){ b.onclick = function(){ commit(function(cc){ cc.fg = b.getAttribute("data-cfg"); }); panel(); }; }); on("[data-cfg-pick]", function(b){ b.onchange = function(){ commit(function(cc){ cc.fg = b.value; }); panel(); }; });
  on("[data-cac]", function(b){ b.onclick = function(){ commit(function(cc){ cc.ac = b.getAttribute("data-cac"); }); panel(); }; }); on("[data-cac-pick]", function(b){ b.onchange = function(){ commit(function(cc){ cc.ac = b.value; }); panel(); }; });
  on("[data-font]", function(b){ b.onclick = function(){ commit(function(cc){ cc.font = b.getAttribute("data-font"); }); panel(); }; });
  on("[data-m]", function(b){ var k = b.getAttribute("data-m"); b.oninput = function(){ clearTimeout(T); T = setTimeout(function(){ commit(function(cc){ cc.masjid = cc.masjid || {}; cc.masjid[k] = b.value; }); }, 400); }; });
  on("[data-mlogo]", function(b){ b.onclick = function(){ var old = (c.masjid||{}).logo; if(b.getAttribute("data-mlogo")==="x"){ commit(function(cc){ cc.masjid.logo = ""; }); dropPhoto(old); panel(); return; }
    pickPhotos("one", function(ids){ if(!ids.length) return; commit(function(cc){ cc.masjid = cc.masjid || {}; cc.masjid.logo = ids[0]; }); dropPhoto(old); panel(); }); }; });
  on("[data-iq]", function(b){ var k = b.getAttribute("data-iq"); b.oninput = function(){ b.previousSibling.querySelector("b").textContent = b.value+" min"; }; b.onchange = function(){ commit(function(cc){ cc.iq = cc.iq || {}; cc.iq[k] = +b.value; }); }; });
  on("[data-csw]", function(b){ b.onchange = function(){ var k = b.getAttribute("data-csw"); commit(function(cc){ cc[k] = b.checked; }); }; });
  on("[data-or]", function(b){ b.onclick = function(){ commit(function(cc){ cc.orient = b.getAttribute("data-or"); }, "none"); panel(); }; });
  on("[data-padd]", function(b){ b.onclick = function(){ pickPhotos(b.getAttribute("data-padd"), function(ids){ if(!ids.length) return; commit(function(cc){ cc.photos = (cc.photos||[]).concat(ids); }); panel(); H.toast("🖼 +"+ids.length); }); }; });
  on("[data-pdel]", function(b){ b.onclick = function(){ var i = +b.getAttribute("data-pdel"), id = c.photos[i]; commit(function(cc){ cc.photos.splice(i, 1); }); dropPhoto(id); panel(); }; });
  on("[data-pmv]", function(b){ b.onclick = function(){ var p = b.getAttribute("data-pmv").split("|"), i = +p[0], j = i + +p[1]; if(j < 0 || j >= c.photos.length) return; commit(function(cc){ var t = cc.photos[i]; cc.photos[i] = cc.photos[j]; cc.photos[j] = t; }); panel(); }; });
  on("[data-sa]", function(b){ b.onclick = function(){ var a = b.getAttribute("data-sa"); if(a==="auto"){ if(E.api.auto) E.api.auto(); } else if(a==="clear"){ commit(function(cc){ cc.W = []; }); E.sel = null; E.pan = "w"; E.host.querySelectorAll("[data-pan]").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-pan")==="w"); }); panel(); } }; });
}

// ---------------- Settings › Templates ----------------
function templates(host, api){ init(H); api = api || {}; var c = cfg(), minis = [];
  var h = '<div class="tvLab">'+L("Pilih susunan siap. Nama masjid, logo, gambar dan minit iqamah anda kekal.","Pick a ready layout. Your masjid name, logo, photos and iqamah minutes stay.")+'</div><div class="tvTpls">'+TPL.map(function(t){ return '<button class="tvTpl'+(c.tpl===t[0]?' on':'')+'" data-tpl="'+t[0]+'"><div class="tvTplV" data-tplv="'+t[0]+'"></div><b>'+t[1]+' '+esc(L(t[2], t[3]))+'</b><small>'+esc(LL(t[4]))+'</small></button>'; }).join("")+'</div>';
  var mine = api.presets ? api.presets().filter(function(p){ return p.cfg && p.cfg.mode==="tvd"; }) : [];
  h += '<div class="card" style="margin-top:12px"><h3>💾 '+L("Susunan saya","My layouts")+'</h3>'+(mine.length ? mine.map(function(p){ return '<div class="dsPre"><div class="dsMini tvMiniS" data-mymini="'+esc(p.id)+'"></div><span><b>'+esc(p.name)+'</b></span><button class="chip gold" data-myp="'+esc(p.id)+'">▶</button><button class="chip" data-myl="'+esc(p.id)+'">'+L("Guna","Use")+'</button><button class="chip" data-mym="'+esc(p.id)+'">⋯</button></div>'; }).join("") : '<div class="mut small">'+L("Simpan susunan semasa untuk guna semula, jadualkan atau letak di skrin utama telefon.","Save the current layout to reuse it, schedule it or pin it to the phone home screen.")+'</div>')+
    '<button class="btn alt full g3d" id="tvSaveAs" style="margin-top:8px">💾 '+L("Simpan susunan semasa","Save the current layout")+'</button></div>';
  host.innerHTML = h;
  host.querySelectorAll("[data-tplv]").forEach(function(v){ var id = v.getAttribute("data-tplv"), t = tplCfg(id, c); try{ minis.push(render(v, t, {mini: true})); }catch(e){} });
  host.querySelectorAll("[data-mymini]").forEach(function(v){ var p = mine.filter(function(x){ return String(x.id)===v.getAttribute("data-mymini"); })[0]; if(p) try{ minis.push(render(v, p.cfg, {mini: true})); }catch(e){} });
  host.querySelectorAll("[data-tpl]").forEach(function(b){ b.onclick = function(){ var id = b.getAttribute("data-tpl"), t = TPL.filter(function(x){ return x[0]===id; })[0];
    var ov = H.showSheet(t[1]+" "+esc(L(t[2], t[3])), '<div class="tvTplBig" id="tvTB"></div><div class="mut small" style="margin:8px 0">'+L("Susunan semasa akan diganti. Nama masjid, logo, gambar dan minit iqamah kekal. Boleh buat asal dengan ↶.","The current layout will be replaced. Your masjid name, logo, photos and iqamah minutes stay. You can undo with ↶.")+'</div><button class="btn gold full g3d" id="tvTOk">✓ '+L("Guna susunan ini","Use this layout")+'</button>');
    var big = render(ov.querySelector("#tvTB"), tplCfg(id, cfg()), {});
    ov.querySelector("#tvTOk").onclick = function(){ big.stop(); var cur = cfg(); H.save("ihsan_tvd_undo", cur); save(tplCfg(id, cur)); H.closeOverlay(); H.toast("✓ "+L(t[2], t[3])); if(api.done) api.done(); };
    var oc = ov._close; ov._close = function(){ big.stop(); if(oc) oc(); else H.closeOverlay(); }; }; });
  var byId = function(id){ return mine.filter(function(x){ return String(x.id)===String(id); })[0]; };
  host.querySelectorAll("[data-myp]").forEach(function(b){ b.onclick = function(){ var p = byId(b.getAttribute("data-myp")); if(p && api.play) api.play(p.cfg); }; });
  host.querySelectorAll("[data-myl]").forEach(function(b){ b.onclick = function(){ var p = byId(b.getAttribute("data-myl")); if(!p) return; H.save("ihsan_tvd_undo", cfg()); var n = clone(p.cfg); n.mode = "tvd"; save(n); H.toast("✓ "+p.name); if(api.done) api.done(); }; });
  host.querySelectorAll("[data-mym]").forEach(function(b){ b.onclick = function(){ if(api.menu) api.menu(b.getAttribute("data-mym")); }; });
  host.querySelector("#tvSaveAs").onclick = function(){ if(api.saveAs) api.saveAs(cfg()); };
  return {stop: function(){ minis.forEach(function(m){ try{ m.stop(); }catch(e){} }); }}; }

window.TVD = {init: init, render: render, setup: setup, templates: templates, cfg: cfg, save: save, tplCfg: tplCfg, embed: embed, stop: function(){ (E && E.minis || []).forEach(function(m){ try{ m.stop(); }catch(e){} }); if(E && E.r) E.r.stop(); },
  _t: {WD: WD, ORDER: ORDER, TPL: TPL, FIELDS: FIELDS, COLS: COLS, ROWS: ROWS, slideItems: slideItems, phase: phase, bgList: bgList, E: function(){ return E; }}};
})();
