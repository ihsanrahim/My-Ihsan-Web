/* 0.5.17 Paparan (Display): turns the phone or tablet into a full-screen display, portrait or landscape.
   1. Papan tanda / Billboard: rolling or animated text, many lines, every font, size, colour, background, frame and
      20 animation presets (enter / while showing / exit, mix and match), live fields ({jam}, {hijri}, {solat}...).
   2. Jam paparan / Display clock: clock, Gregorian + Hijri date, prayer times with the next one highlighted and a big countdown,
      iqamah countdown and "solat in progress" (masjid mode), Jumaat, focus and event countdowns, calendar, hadith, Asma ul-Husna,
      zikir counter, battery, ticker, slideshow; 7 layouts and 10 Islamic themes.
   3. Tools: scoreboard, stopwatch / interval timer, queue number, flashlight colour screen, name tag.
   Settings: live preview on top, swipeable setting pages at the bottom (dots), undo/redo, reset, 🔀, big ▶ Mula.
   Presets in localStorage ihsan_displays; share as a code; a schedule (playlist) of presets by time of day.
   No azan audio: only an optional soft chime. No people or prophets in any picture.
   DisplayView.open(el, H). H = finH() + day(date) (prayer times), hijri(date), hadith(), asma. */
(function(){
"use strict";
var H = null, UI = {el: null, cfg: null, hist: [], fut: [], sel: -1, page: 0, prev: null, editing: null};
function L(a, b){ return H.L2x(a, b); }
function esc(s){ return H.esc(s==null ? "" : String(s)); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function pad(n){ return (n<10?"0":"")+n; }
var AR = /[؀-ۿ]/;

// ---------------- catalogues ----------------
var FONTS = [ // [id, label, css family, google font name or ""]
  ["sans","Sans","system-ui,Roboto,sans-serif",""],["serif","Serif","Georgia,'Noto Serif',serif",""],["mono","Mono","'Roboto Mono',monospace",""],
  ["round","Rounded","'Nunito','Baloo 2',system-ui,sans-serif","Nunito:wght@400;800"],["bebas","Bebas","'Bebas Neue',Impact,sans-serif","Bebas Neue"],
  ["anton","Anton","'Anton',Impact,sans-serif","Anton"],["orbit","Orbitron","'Orbitron',sans-serif","Orbitron:wght@500;900"],
  ["pixel","Pixel","'Press Start 2P',monospace","Press Start 2P"],["vt","VT323 (terminal)","'VT323',monospace","VT323"],
  ["seg","Digital","'Share Tech Mono','Roboto Mono',monospace","Share Tech Mono"],["mono2","Monoton (neon)","'Monoton',sans-serif","Monoton"],
  ["righteous","Righteous","'Righteous',sans-serif","Righteous"],["bungee","Bungee","'Bungee',sans-serif","Bungee"],
  ["lobster","Lobster","'Lobster',cursive","Lobster"],["pacifico","Pacifico","'Pacifico',cursive","Pacifico"],["dancing","Dancing Script","'Dancing Script',cursive","Dancing Script:wght@700"],
  ["vibes","Great Vibes","'Great Vibes',cursive","Great Vibes"],["pinyon","Pinyon Script","PinyonL,cursive",""],["fell","IM Fell (vintage)","FellL,serif",""],
  ["playfair","Playfair","'Playfair Display',serif","Playfair Display:wght@700"],
  ["naskh","عربي Naskh","\"Noto Naskh Arabic\",serif",""],["amiri","عربي Amiri","AmiriL,'Amiri',serif",""],["scheh","عربي Scheherazade","ScheherazadeL,serif",""],
  ["kufi","عربي Kufi","'Reem Kufi','Noto Kufi Arabic',sans-serif","Reem Kufi:wght@500;700"],["ruqaa","عربي Ruqaa","'Aref Ruqaa',serif","Aref Ruqaa:wght@700"],
  ["thuluth","عربي Thuluth-style","'Amiri Quran',AmiriL,serif","Amiri Quran"],["diwani","عربي Diwani-style","'Marhey','Aref Ruqaa',serif","Marhey:wght@600"],
  ["cairo","عربي Cairo","'Cairo',sans-serif","Cairo:wght@700"],["led","LED dot-matrix","led",""]
];
function font(id){ return FONTS.filter(function(f){ return f[0]===id; })[0] || FONTS[0]; }
// 0.5.18: every font is bundled (display/fonts.css, SIL OFL), so they work offline
function loadFont(){ if(!document.querySelector('link[href="display/fonts.css"]')){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "display/fonts.css"; document.head.appendChild(l); } }
var PALETTE = ["#ffffff","#000000","#c9a646","#1f9d63","#0b5d3b","#e0605a","#4a9be8","#7b2d8e","#ff7a00","#ffd400","#00e5ff","#ff2bd6","#39ff14","#b23a48","#8d6e63","#e8dcc0"];
// 20 animation presets: [id, icon, ms, en, roles: c=continuous e=enter s=while showing x=exit]
var ANIMS = [
  ["scrollL","⬅️","Tatal kiri","Scroll left","c"],["scrollR","➡️","Tatal kanan","Scroll right","c"],["scrollU","⬆️","Tatal atas (kredit)","Scroll up (credits)","c"],["scrollD","⬇️","Tatal bawah","Scroll down","c"],
  ["type","⌨️","Mesin taip","Typewriter","e"],["fade","🌫","Pudar","Fade","ex"],["breathe","🫁","Bernafas","Breathe","s"],["slide","↔️","Luncur masuk","Slide in","ex"],
  ["zoom","🔍","Zum","Zoom","ex"],["bounce","🏀","Lantun","Bounce","es"],["blink","💡","Kelip","Blink","s"],["wave","🌊","Ombak","Wave","s"],
  ["shake","🫨","Goncang","Shake","s"],["flip","🔄","Balik 3D","Flip 3D","ex"],["spin","🌀","Pusing","Spin","e"],["rainbow","🌈","Pelangi","Rainbow cycle","s"],
  ["neon","⚡","Neon berkelip","Neon flicker","s"],["drop","🍂","Huruf jatuh","Letter drop","e"],["flap","🛫","Papan lapangan terbang","Split-flap board","e"],["shimmer","✨","Kilauan","Shimmer sweep","s"]
];
function anim(id){ return ANIMS.filter(function(a){ return a[0]===id; })[0]; }
var PATTERNS = { // inline SVG tiles (geometric only: no people, no prophets)
  geo: '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><g fill="none" stroke="%COL%" stroke-width="1.2" opacity=".35"><path d="M30 4l7 19 19 7-19 7-7 19-7-19-19-7 19-7z"/><rect x="18" y="18" width="24" height="24" transform="rotate(45 30 30)"/></g></svg>',
  arabesque: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><g fill="none" stroke="%COL%" stroke-width="1.2" opacity=".3"><circle cx="40" cy="40" r="22"/><circle cx="0" cy="0" r="22"/><circle cx="80" cy="0" r="22"/><circle cx="0" cy="80" r="22"/><circle cx="80" cy="80" r="22"/><path d="M40 18c8 10 8 34 0 44M18 40c10-8 34-8 44 0"/></g></svg>',
  tiles: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><g fill="%COL%" opacity=".22"><path d="M24 0l6 18 18 6-18 6-6 18-6-18L0 24l18-6z"/></g></svg>',
  kufi: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><g fill="none" stroke="%COL%" stroke-width="2" opacity=".25"><path d="M0 10h30v20H10V20h10"/></g></svg>',
  songket: '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44"><g fill="%COL%" opacity=".3"><path d="M22 4l6 10h-12zM22 40l-6-10h12zM4 22l10-6v12zM40 22l-10 6V16z"/><circle cx="22" cy="22" r="3"/></g></svg>',
  stars: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><g fill="%COL%"><circle cx="10" cy="20" r="1.2" opacity=".8"/><circle cx="70" cy="12" r="1" opacity=".6"/><circle cx="100" cy="60" r="1.4" opacity=".9"/><circle cx="40" cy="80" r="1" opacity=".5"/><circle cx="90" cy="105" r="1.1" opacity=".7"/><circle cx="20" cy="110" r=".8" opacity=".5"/><circle cx="55" cy="45" r=".9" opacity=".6"/></g></svg>'
};
var SILHOUETTE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice"><g fill="%COL%" opacity=".35"><path d="M0 120V96h40V70h8v26h30V60c0-22 22-38 42-46 20 8 42 24 42 46v36h30V70h8v26h40v24z"/><path d="M200 120V84c0-26 26-44 52-54 26 10 52 28 52 54v36z"/><rect x="330" y="30" width="10" height="90"/><path d="M335 14l6 16h-12z"/><rect x="60" y="40" width="8" height="80"/><path d="M64 26l5 14h-10z"/></g></svg>';
function svgUrl(svg, col){ return 'url("data:image/svg+xml,'+encodeURIComponent(svg.replace(/%COL%/g, col||"#c9a646"))+'")'; }
// 10 Islamic themes for the display clock: [id, ms, en, bg css, fg, accent, font id, motif]
var THEMES = [
  ["nabawi","Hijau Nabawi","Nabawi Green","linear-gradient(160deg,#04301f,#0b5d3b 60%,#063522)","#f3ecd6","#d9b45a","amiri","silhouette"],
  ["haram","Malam Masjidil Haram","Masjidil Haram Night","radial-gradient(circle at 50% 20%,#1c1a12,#050505 70%)","#f5e7c0","#c9a646","serif","geo"],
  ["andalus","Andalusia","Andalusia","linear-gradient(160deg,#7a3b22,#b5603c 50%,#1f6b6b)","#fdf3e3","#7fd3c7","playfair","tiles"],
  ["ottoman","Biru Uthmaniyyah","Ottoman Blue","linear-gradient(160deg,#0b2a6b,#1f4e9c 60%,#e8eef8)","#ffffff","#7fb2ff","serif","arabesque"],
  ["dawn","Fajar Gurun","Desert Dawn","linear-gradient(180deg,#f7c59f,#f3d9b1 45%,#9ecbe8)","#3b2a1a","#b4572e","round",""],
  ["ramadan","Tanglung Ramadan","Ramadan Lantern","radial-gradient(circle at 70% 15%,#24305e,#0b1230 70%)","#f6e7b4","#ffb84d","amiri","stars"],
  ["kufi","Kufi Minimal","Kufi Minimal","#0d0d0d","#f2f2f2","#9a9a9a","sans","kufi"],
  ["songket","Songket Melayu","Malay Songket","linear-gradient(160deg,#4a0d1a,#7a1328 60%,#4a0d1a)","#f7e3b0","#e2b64c","serif","songket"],
  ["qiyam","Qiyam Berbintang","Starry Qiyam","radial-gradient(circle at 30% 10%,#3a2766,#120b26 70%)","#ede6ff","#c7a6ff","serif","stars"],
  ["jannah","Taman Jannah","Garden of Jannah","linear-gradient(160deg,#dff3df,#a8dba8 60%,#6fbf9a)","#123a26","#1f7a4c","round","geo"]
];
function theme(id){ return THEMES.filter(function(t){ return t[0]===id; })[0] || THEMES[0]; }

// ---------------- defaults & templates ----------------
function bbDefault(){ return {mode: "bb", name: L("Papan saya","My board"), lines: [{t: L("Assalamualaikum","Assalamualaikum")}],
  st: {font: "bebas", size: 60, bold: true, italic: false, upper: false, under: false, color: {k: "solid", a: "#ffd400", b: "#ff7a00", c: "#ff2bd6", ang: 90},
    outline: 0, oc: "#000000", shadow: false, glow: false, mirror: false, emboss: false, align: "center", valign: "middle", lh: 1.1, ls: 0},
  bg: {k: "solid", a: "#000000", b: "#1a1a1a", img: "", dark: 40, blur: 0, pat: "", pc: "#c9a646"}, frame: "none",
  an: {enter: "", show: "", exit: "", cont: "scrollL", speed: 5, pause: 1, loop: 0, play: "all", dur: 4}, orient: "landscape", lock: false, bright: -1, strobe: false, cd: ""}; }
function clkDefault(){ return {mode: "clk", name: L("Jam paparan","Display clock"), theme: "nabawi", auto: false, layout: "row",
  show: {clock: true, secs: false, h24: false, analog: false, date: true, hijri: true, arday: false, prayers: true, syuruk: true, imsak: false, countdown: true, iqamah: false, fokus: false, event: false, calendar: false, hadith: false, asma: false, zikir: false, battery: false, weather: false, ticker: false}, tgrp: "",
  iq: {subuh: 20, zohor: 10, asar: 10, maghrib: 5, isyak: 10}, jumaat: true, ev: {n: "", d: ""}, fokus: {w: 25, b: 5}, ticker: "", slide: {on: false, secs: 15},
  chime: false, flash: false, dim: false, burn: true, orient: "landscape", lock: false, bright: -1,
  ss: {on: false, secs: 20, src: {ayat: true, hadith: true, doa: true, asma: false, notes: false, qr: true}, custom: ""}, iqFull: false, qr: {img: "", t: ""}, remote: false}; }
function qrSvg(text){ var q = window.NostrKit.qrcode(0, "M"); q.addData(text); q.make(); var n = q.getModuleCount(), z = 4, p = "";
  for(var r = 0; r < n; r++) for(var c = 0; c < n; c++) if(q.isDark(r, c)) p += "M"+(c*z+z*2)+" "+(r*z+z*2)+"h"+z+"v"+z+"h-"+z+"z";
  var w = n*z+z*4; return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+w+'"><rect width="'+w+'" height="'+w+'" fill="#fff"/><path d="'+p+'" fill="#000"/></svg>'; }
// 0.5.23 runtime state changed by the phone remote (not saved in the preset)
var RT = {ticker: null, ann: null, ssOff: 0, ssPause: false};
// 0.5.23 slideshow pages from the app's own content (ayat, hadith, doa, Asma ul-Husna, notes labelled "paparan"/"display", own text, donation QR)
function slidesOf(cfg){ var ss = cfg.ss || {}, src = ss.src || {}, out = [], en = H.en(), d = Math.floor(Date.now()/864e5);
  var rot = function(a, n){ if(!a.length) return a; var k = d % a.length; return a.slice(k).concat(a.slice(0, k)).slice(0, n); };
  var lists = [];
  if(src.ayat && window.AYAT_DAILY) lists.push(rot(window.AYAT_DAILY, 12).map(function(a){ return {k: "📖 "+L("Ayat","Ayah"), ar: a[3], t: en ? a[4] : "", c: a[5]+" "+a[0]+":"+a[1]}; }));
  if(src.hadith && window.HADITH_DAILY) lists.push(rot(window.HADITH_DAILY, 12).map(function(h){ return {k: "📜 "+L("Hadis","Hadith"), t: en ? h.en : h.ms, c: h.src}; }));
  if(src.doa && window.DOA){ var all = []; window.DOA.forEach(function(c){ (c.items||[]).forEach(function(x){ if(x.ar && String(x.ar).length < 260) all.push(x); }); });
    lists.push(rot(all, 12).map(function(x){ return {k: "🤲 "+(en ? x.t_en : x.t_ms), ar: x.ar, t: en ? x.en : x.ms, c: x.src||""}; })); }
  if(src.asma && window.ASMAUL_HUSNA) lists.push(rot(window.ASMAUL_HUSNA, 12).map(function(a){ return {k: "✨ Asma ul-Husna", ar: a[0], t: a[1]+" · "+(en ? a[3] : a[2]), c: ""}; }));
  if(src.notes){ var N = H.load("ihsan_notes", []) || []; lists.push(N.filter(function(n){ return !n.arch && (n.lb||[]).some(function(l){ return /^(paparan|display|masjid)$/i.test(l); }); }).map(function(n){
    return {k: "📌 "+(n.t||L("Pengumuman","Notice")), t: n.cl ? n.cl.map(function(x){ return "• "+x.x; }).join("\n") : (n.b||""), c: ""}; })); }
  var cu = String(ss.custom||"").split(/\n\s*\n/).map(function(x){ return x.trim(); }).filter(Boolean).map(function(x){ var ln = x.split("\n"); return {k: "📢 "+ln[0], t: ln.slice(1).join("\n"), c: ""}; });
  if(cu.length) lists.unshift(cu);
  // interleave so the kinds take turns
  for(var i = 0, more = true; more; i++){ more = false; lists.forEach(function(l){ if(l[i]){ out.push(l[i]); more = true; } }); }
  if(src.qr && cfg.qr && cfg.qr.img){ var withQr = []; out.forEach(function(x, j){ withQr.push(x); if(j%4===3) withQr.push({qr: 1}); }); if(!out.length) withQr.push({qr: 1}); else if(out.length < 4) withQr.push({qr: 1}); out = withQr; }
  return out; }
function slideHtml(cfg, x){ if(x.qr) return '<div class="dsSlide dsSlQr"><small>💝 '+L("Derma & infaq","Donations")+'</small><img src="'+cfg.qr.img+'" alt="QR"><p>'+esc(cfg.qr.t||L("Imbas dengan aplikasi bank atau e-dompet (DuitNow QR)","Scan with any banking or e-wallet app (DuitNow QR)"))+'</p></div>';
  var len = (x.t||"").length + (x.ar||"").length; return '<div class="dsSlide'+(len > 280 ? ' long' : len < 90 ? ' short' : '')+'"><small>'+esc(x.k)+'</small>'+(x.ar?'<div class="ar" dir="rtl">'+esc(x.ar)+'</div>':'')+(x.t?'<p>'+esc(x.t).replace(/\n/g, "<br>")+'</p>':'')+(x.c?'<cite>'+esc(x.c)+'</cite>':'')+'</div>'; }
var BB_TPL = [
  ["airport","🛬","Sambut di lapangan terbang","Airport pickup",{lines: [{t: "AHMAD BIN ALI"},{t: "Selamat datang!"}], an: {cont: "", enter: "zoom", show: "breathe"}, st: {font: "bebas", color: {k: "solid", a: "#000000"}}, bg: {k: "solid", a: "#ffd400"}}],
  ["wedding","💍","Selamat Pengantin Baru","Wedding welcome",{lines: [{t: "Selamat Pengantin Baru"},{t: "Aisyah & Hakim"}], st: {font: "vibes", color: {k: "grad", a: "#f7e3b0", b: "#c9a646", ang: 90}, bold: false}, bg: {k: "grad", a: "#3a0d1a", b: "#120408"}, frame: "arch", an: {cont: "", enter: "fade", show: "shimmer"}}],
  ["raya","🌙","Selamat Hari Raya","Hari Raya greeting",{lines: [{t: "Selamat Hari Raya Aidilfitri"},{t: "Maaf Zahir & Batin"}], st: {font: "lobster", color: {k: "solid", a: "#ffd400"}}, bg: {k: "pat", a: "#0b3d24", pat: "geo"}, frame: "bulbs", an: {cont: "", enter: "drop", show: "bounce"}}],
  ["bday","🎂","Hari jadi","Birthday",{lines: [{t: "Selamat Hari Jadi 🎉"},{t: "Aisyah"}], st: {font: "pacifico", color: {k: "rainbow"}}, bg: {k: "anim", a: "#ff2bd6", b: "#4a9be8"}, an: {cont: "", enter: "spin", show: "wave"}}],
  ["silent","🤫","Mohon senyap, solat","Silent please, prayer",{lines: [{t: "Mohon senyap"},{t: "Solat sedang berlangsung"}], st: {font: "sans", color: {k: "solid", a: "#ffffff"}}, bg: {k: "pat", a: "#04301f", pat: "kufi"}, an: {cont: "", enter: "fade", show: "breathe"}}],
  ["kuliah","📖","Kuliah malam ini","Kuliah tonight",{lines: [{t: "KULIAH MAGHRIB MALAM INI"},{t: "Ustaz Ahmad · Kitab Riyadhus Solihin"}], st: {font: "anton", color: {k: "solid", a: "#c9a646"}}, bg: {k: "solid", a: "#0b1230"}, an: {cont: "scrollL"}}],
  ["umrah","🕋","Papan kumpulan Umrah","Umrah group sign",{lines: [{t: "KUMPULAN 7"},{t: "Mutawwif: Ustaz Ali"}], st: {font: "bebas", color: {k: "solid", a: "#ffffff"}}, bg: {k: "solid", a: "#1f9d63"}, an: {cont: "", enter: "", show: "blink"}}],
  ["concert","📣","Sepanduk sokongan","Support banner",{lines: [{t: "GO GO GO! 🔥"}], st: {font: "bungee", color: {k: "rainbow"}}, bg: {k: "solid", a: "#000000"}, an: {cont: "scrollL", speed: 8}}],
  ["shop","🏪","Kedai buka / tutup","Shop open / closed",{lines: [{t: "BUKA"}], st: {font: "orbit", color: {k: "solid", a: "#39ff14"}, glow: true}, bg: {k: "solid", a: "#000000"}, an: {cont: "", show: "neon"}}],
  ["car","🚗","Mesej tingkap kereta","Car window message",{lines: [{t: "TERIMA KASIH"}], st: {font: "led"}, bg: {k: "solid", a: "#000000"}, an: {cont: "scrollL"}}],
  ["kids","🧒","Papan nama kanak-kanak","Kids' name board",{lines: [{t: "Adam"}], st: {font: "round", color: {k: "rainbow"}}, bg: {k: "anim", a: "#ffd400", b: "#00e5ff"}, an: {cont: "", enter: "drop", show: "wave"}}],
  ["countdown","⏳","Kiraan detik Raya","Raya countdown",{lines: [{t: "Raya dalam"},{t: "{kiraan}"}], cd: "", st: {font: "orbit", color: {k: "solid", a: "#ffd400"}}, bg: {k: "solid", a: "#0b3d24"}, an: {cont: ""}}]
];
var CLK_TPL = [
  ["masjid","🕌","Paparan masjid","Masjid display",{layout: "masjid", theme: "nabawi", show: {clock: true, secs: true, date: true, hijri: true, prayers: true, syuruk: true, imsak: false, countdown: true, iqamah: true, ticker: true}, ticker: "Selamat datang ke Masjid Al-Falah · Kuliah Maghrib setiap Isnin dan Khamis"}],
  ["night","🌙","Jam sisi katil","Nightstand",{layout: "night", theme: "qiyam", dim: true, show: {clock: true, prayers: false, countdown: true, date: true, hijri: true}}],
  ["focus","🎯","Fokus","Focus",{layout: "focus", theme: "kufi", show: {clock: false, date: false, hijri: false, prayers: false, countdown: false, fokus: true}}],
  ["big","⏰","Jam besar","Big clock",{layout: "big", theme: "haram", show: {clock: true, secs: true, date: true, hijri: true, prayers: false, countdown: false}}],
  ["family","🏠","Ruang keluarga","Family room",{layout: "split", theme: "jannah", show: {clock: true, date: true, hijri: true, prayers: true, countdown: true, hadith: true}}]
];
function merge(a, b){ Object.keys(b||{}).forEach(function(k){ if(b[k] && typeof b[k]==="object" && !Array.isArray(b[k]) && a[k] && typeof a[k]==="object") merge(a[k], b[k]); else a[k] = clone(b[k]); }); return a; }

// ---------------- storage ----------------
function presets(){ return H.load("ihsan_displays", null) || []; }
function savePresets(p){ p.forEach(function(x){ if(!x.id) x.id = Date.now()+Math.floor(Math.random()*1000); }); H.save("ihsan_displays", p);
  try{ if(H.N.setDisplayShortcuts) H.N.setDisplayShortcuts(JSON.stringify(p.slice(0, 4).map(function(x){ return {id: String(x.id), name: x.name}; }))); }catch(e){} }

// ---------------- live fields ----------------
function day(d){ try{ return H.day(d||new Date()) || {}; }catch(e){ return {}; } }
var PKEYS = ["subuh","zohor","asar","maghrib","isyak"];
function pName(k, fri){ if(k==="zohor" && fri) return "Jumaat"; return ({imsak:"Imsak",subuh:"Subuh",syuruk:L("Syuruk","Sunrise"),zohor:"Zohor",asar:"Asar",maghrib:"Maghrib",isyak:"Isyak"})[k]||k; }
function atTime(base, hm){ if(!hm) return null; var p = String(hm).split(":"), d = new Date(base); d.setHours(+p[0], +p[1], 0, 0); return d; }
function nextPrayer(now){ now = now || new Date(); var t = day(now);
  for(var i=0;i<PKEYS.length;i++){ var d = atTime(now, t[PKEYS[i]]); if(d && d > now) return {k: PKEYS[i], t: d}; }
  var tm = new Date(now); tm.setDate(tm.getDate()+1); var t2 = day(tm); return {k: "subuh", t: atTime(tm, t2.subuh)}; }
function lastPrayer(now){ var t = day(now), out = null; PKEYS.forEach(function(k){ var d = atTime(now, t[k]); if(d && d <= now) out = {k: k, t: d}; }); return out; }
function dur(ms){ if(ms < 0) ms = 0; var s = Math.floor(ms/1000), h = Math.floor(s/3600), m = Math.floor(s%3600/60); s = s%60; return (h ? h+":"+pad(m) : m)+":"+pad(s); }
function hm(d, h24){ var h = d.getHours(), m = d.getMinutes(); if(h24) return pad(h)+":"+pad(m); var ap = h>=12 ? "PM" : "AM"; h = h%12 || 12; return h+":"+pad(m)+" "+ap; }
function cdText(target){ var t = new Date(target).getTime() - Date.now(); if(isNaN(t)) return ""; if(t <= 0) return L("Hari ini!","Today!"); var d = Math.floor(t/864e5), h = Math.floor(t%864e5/36e5), m = Math.floor(t%36e5/6e4);
  return (d ? d+L(" hari "," days ") : "")+h+L(" jam "," h ")+m+L(" minit"," min"); }
function fields(s, cfg){ if(!/\{/.test(s)) return s; var now = new Date(), np = nextPrayer(now);
  return s.replace(/\{jam\}/g, hm(now)).replace(/\{tarikh\}/g, now.toLocaleDateString(undefined, {weekday: "long", day: "numeric", month: "long", year: "numeric"}))
    .replace(/\{hijri\}/g, H.hijri ? H.hijri(now) : "").replace(/\{solat( seterusnya)?\}/g, pName(np.k, now.getDay()===5)+" "+hm(np.t)).replace(/\{baki( masa)?\}/g, dur(np.t - now))
    .replace(/\{kiraan\}/g, cfg && cfg.cd ? cdText(cfg.cd) : ""); }
function hasFields(cfg){ return (cfg.lines||[]).some(function(l){ return /\{/.test(l.t); }); }

// ---------------- billboard renderer ----------------
function lineStyle(cfg, i){ var s = clone(cfg.st); if(cfg.lines[i] && cfg.lines[i].s) merge(s, cfg.lines[i].s); return s; }
function textCss(s, px){ var f = font(s.font), c = s.color || {}, css = "font-family:"+f[2]+";font-size:"+px+"px;line-height:"+s.lh+";letter-spacing:"+(s.ls||0)/10+"em;font-weight:"+(s.bold?800:400)+";font-style:"+(s.italic?"italic":"normal")+";";
  if(s.upper) css += "text-transform:uppercase;"; if(s.under) css += "text-decoration:underline;";
  var sh = []; if(s.shadow) sh.push("0.06em 0.06em 0.12em rgba(0,0,0,.75)"); if(s.glow){ var g = c.a||"#fff"; sh.push("0 0 .08em "+g, "0 0 .25em "+g, "0 0 .6em "+g); } if(s.emboss) sh.push("-1px -1px 0 rgba(255,255,255,.45)", "2px 2px 0 rgba(0,0,0,.6)");
  if(sh.length) css += "text-shadow:"+sh.join(",")+";";
  if(s.outline) css += "-webkit-text-stroke:"+(s.outline/20)+"em "+(s.oc||"#000")+";paint-order:stroke fill;";
  if(c.k==="grad") css += "background:linear-gradient("+(c.ang||90)+"deg,"+c.a+","+c.b+(c.c3?","+c.c3:"")+");-webkit-background-clip:text;background-clip:text;color:transparent;";
  else if(c.k==="rainbow") css += "background:linear-gradient(90deg,#ff2b2b,#ffd400,#39ff14,#00e5ff,#4a6bff,#ff2bd6,#ff2b2b);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:dsRainbowBg 4s linear infinite;";
  else css += "color:"+(c.a||"#fff")+";";
  return css; }
function bgCss(bg){ var b = bg||{}, css = "";
  if(b.k==="grad") css = "background:linear-gradient(160deg,"+b.a+","+b.b+");";
  else if(b.k==="anim") css = "background:linear-gradient(270deg,"+b.a+","+b.b+","+b.a+");background-size:400% 400%;animation:dsBgMove 12s ease infinite;";
  else if(b.k==="pat") css = "background:"+svgUrl(PATTERNS[b.pat]||PATTERNS.geo, b.pc)+","+(b.a||"#000")+";";
  else if(b.k==="sil") css = "background:"+svgUrl(SILHOUETTE, b.pc)+" bottom/100% auto no-repeat,"+svgUrl(PATTERNS.stars, "#fff")+","+(b.a||"#0b1230")+";";
  else if(b.k==="img" && b.img) css = "background:#000;";
  else css = "background:"+(b.a||"#000")+";";
  return css; }
function render(box, cfg, opt){
  opt = opt || {}; var timers = [], raf = 0, dead = false, W = box.clientWidth || 360, Hh = box.clientHeight || 200;
  box.innerHTML = ""; box.className = "dsBox"+(cfg.st && cfg.st.mirror ? " dsMirror" : "")+(opt.full ? " dsFull" : ""); box.style.cssText = bgCss(cfg.bg);
  if(cfg.bg && cfg.bg.k==="img" && cfg.bg.img){ var bi = document.createElement("div"); bi.className = "dsBgImg"; bi.style.cssText = "background-image:url("+cfg.bg.img+");filter:blur("+(cfg.bg.blur||0)+"px) brightness("+(100-(cfg.bg.dark||0))/100+")"; box.appendChild(bi); }
  if(cfg.frame && cfg.frame!=="none"){ var fr = document.createElement("div"); fr.className = "dsFrame dsF-"+cfg.frame; if(cfg.frame==="arch") fr.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M3 98V40C3 18 28 4 50 2c22 2 47 16 47 38v58" fill="none" stroke="'+((cfg.st.color||{}).a||"#c9a646")+'" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>'; box.appendChild(fr); }
  if(cfg.strobe && opt.full){ var sb = document.createElement("div"); sb.className = "dsStrobe"; box.appendChild(sb); }
  var stage = document.createElement("div"); stage.className = "dsStage"; box.appendChild(stage);
  var lines = (cfg.lines||[]).filter(function(l){ return l && String(l.t).length; }); if(!lines.length) lines = [{t: " "}];
  var a = cfg.an || {}, n = lines.length, slides = a.play==="slides" && n > 1, per = slides ? 1 : n;
  var v = (cfg.st||{}).valign; stage.style.justifyContent = v==="top" ? "flex-start" : v==="bottom" ? "flex-end" : "center";
  // LED dot-matrix (canvas)
  if((cfg.st||{}).font==="led"){ ledRender(stage, cfg, lines, opt, function(id){ raf = id; }, function(){ return dead; }); return {stop: function(){ dead = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); }}; }
  function mk(i, lineObj){ var s = lineStyle(cfg, cfg.lines.indexOf(lineObj)), px = Math.max(8, Math.round(Hh * (s.size/100) / Math.max(1, per)));
    var wrap = document.createElement("div"); wrap.className = "dsLine"; wrap.style.textAlign = s.align; wrap.setAttribute("data-li", cfg.lines.indexOf(lineObj));
    var t = document.createElement("div"); t.className = "dsT"; t.style.cssText = textCss(s, px); wrap.appendChild(t); stage.appendChild(wrap);
    var txt = fields(String(lineObj.t), cfg); t.setAttribute("data-raw", lineObj.t); t.textContent = txt; t.dir = AR.test(txt) ? "rtl" : "auto";
    if(opt.sel===cfg.lines.indexOf(lineObj)) wrap.classList.add("dsSel");
    return {wrap: wrap, t: t, s: s, px: px, txt: txt}; }
  function fit(o){ if(a.cont) return; var w = o.t.scrollWidth, max = W*0.94; if(w > max) o.t.style.fontSize = Math.max(8, Math.floor(o.px * max / w))+"px"; }
  function letters(o){ if(AR.test(o.txt)) return false; o.t.innerHTML = Array.from(o.txt).map(function(ch, i){ return '<span class="dsCh" style="--i:'+i+'">'+(ch===" " ? "&nbsp;" : esc(ch))+'</span>'; }).join(""); return true; }
  var spd = Math.max(1, +a.speed||5);
  function applyCont(o){ var k = a.cont; if(!k) return false; var dir = k.slice(6);
    if(dir==="L" || dir==="R"){ o.wrap.classList.add("dsClip"); o.t.style.whiteSpace = "nowrap"; o.t.style.display = "inline-block"; var tw = o.t.scrollWidth, d = (tw + W) / (spd*40);
      o.t.style.setProperty("--a", (dir==="L" ? W : -tw)+"px"); o.t.style.setProperty("--b", (dir==="L" ? -tw : W)+"px");
      o.t.style.animation = "dsScrollX "+d.toFixed(2)+"s linear "+(a.loop ? a.loop : "infinite"); return true; }
    o.wrap.classList.add("dsClip"); var th = o.t.scrollHeight, dv = (th + Hh) / (spd*30);
    o.t.style.setProperty("--a", (dir==="U" ? Hh : -th)+"px"); o.t.style.setProperty("--b", (dir==="U" ? -th : Hh)+"px");
    o.t.style.animation = "dsScrollY "+dv.toFixed(2)+"s linear "+(a.loop ? a.loop : "infinite"); return true; }
  function enter(o, cb){ var e = a.enter, d = Math.max(0.3, 1.6 - spd*0.12);
    if(!e){ cb && cb(); return; }
    if(e==="type"){ var full = o.txt, i = 0; o.t.textContent = ""; o.t.classList.add("dsCursor"); var step = function(){ if(dead) return; o.t.textContent = Array.from(full).slice(0, ++i).join(""); if(i < Array.from(full).length) timers.push(setTimeout(step, 60 + (10-spd)*12)); else { o.t.classList.remove("dsCursor"); cb && cb(); } }; step(); return; }
    if(e==="drop"){ if(letters(o)){ o.t.querySelectorAll(".dsCh").forEach(function(c){ c.style.animation = "dsDrop "+d+"s cubic-bezier(.3,1.4,.6,1) both"; c.style.animationDelay = "calc(var(--i) * 0.06s)"; }); timers.push(setTimeout(function(){ cb && cb(); }, (d + o.txt.length*0.06)*1000)); return; } e = "fade"; }
    if(e==="flap"){ var tgt = Array.from(o.txt), cur = tgt.map(function(){ return " "; }), tick = 0, CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      var fl = function(){ if(dead) return; tick++; var done = true; cur = cur.map(function(c, j){ if(tick > 4 + j*1.2 || tgt[j]===" ") return tgt[j]; done = false; return CH.charAt(Math.floor(Math.random()*CH.length)); }); o.t.textContent = cur.join(""); if(!done) timers.push(setTimeout(fl, 55)); else cb && cb(); };
      fl(); return; }
    var map = {fade: "dsFade", slide: "dsSlide", zoom: "dsZoom", bounce: "dsBounceIn", flip: "dsFlip", spin: "dsSpin"};
    o.t.style.animation = (map[e]||"dsFade")+" "+d+"s ease both"; timers.push(setTimeout(function(){ o.t.style.animation = ""; cb && cb(); }, d*1000+30)); }
  function show(o){ var s2 = a.show; if(!s2) return;
    if(s2==="wave"){ if(letters(o)) o.t.querySelectorAll(".dsCh").forEach(function(c){ c.style.animation = "dsWave 1.4s ease-in-out infinite"; c.style.animationDelay = "calc(var(--i) * 0.08s)"; }); else o.t.style.animation = "dsBreathe 2.4s ease-in-out infinite"; return; }
    if(s2==="shimmer"){ o.t.classList.add("dsShimmer"); return; }
    var map = {breathe: "dsBreathe 2.4s ease-in-out infinite", bounce: "dsBounce 1s ease-in-out infinite", blink: "dsBlink 1s steps(1) infinite", shake: "dsShake .5s ease-in-out infinite",
      rainbow: "dsHue 4s linear infinite", neon: "dsNeon 3s linear infinite"};
    o.t.style.animation = map[s2]||""; }
  function exit(o, cb){ var x = a.exit, d = Math.max(0.3, 1.4 - spd*0.1); if(!x){ cb(); return; }
    var map = {fade: "dsFade", slide: "dsSlide", zoom: "dsZoom", flip: "dsFlip"}; o.t.style.animation = (map[x]||"dsFade")+" "+d+"s ease reverse both"; timers.push(setTimeout(cb, d*1000)); }
  function run(o){ fit(o); if(applyCont(o)) return; enter(o, function(){ show(o); }); }
  if(!slides){ lines.forEach(function(l, i){ run(mk(i, l)); }); }
  else { var idx = 0, loops = 0;
    var next = function(){ if(dead) return; stage.innerHTML = ""; var o = mk(idx, lines[idx]); fit(o);
      if(applyCont(o)){ var dd = parseFloat(o.t.style.animation.split(" ")[1])||8; o.t.style.animation = o.t.style.animation.replace("infinite", "1"); timers.push(setTimeout(adv, dd*1000 + (a.pause||0)*1000)); return; }
      enter(o, function(){ show(o); timers.push(setTimeout(function(){ exit(o, adv); }, Math.max(1, +a.dur||4)*1000)); }); };
    var adv = function(){ idx++; if(idx >= lines.length){ idx = 0; loops++; if(a.loop && loops >= a.loop){ idx = lines.length-1; return; } timers.push(setTimeout(next, (a.pause||0)*1000)); return; } next(); };
    next(); }
  if(hasFields(cfg)){ var upd = setInterval(function(){ if(dead){ clearInterval(upd); return; } stage.querySelectorAll(".dsT[data-raw]").forEach(function(t){ if(!t.querySelector(".dsCh") && !t.classList.contains("dsCursor")){ var nt = fields(t.getAttribute("data-raw"), cfg); if(t.textContent!==nt) t.textContent = nt; } }); }, 1000); timers.push(upd); }
  return {stop: function(){ dead = true; timers.forEach(function(t){ clearTimeout(t); clearInterval(t); }); cancelAnimationFrame(raf); }};
}
// LED dot-matrix: text drawn to a small canvas, then each lit pixel drawn as a round LED
function ledRender(stage, cfg, lines, opt, setRaf, isDead){
  var cv = document.createElement("canvas"); cv.className = "dsLed"; stage.appendChild(cv);
  var W = stage.clientWidth || 360, Hh = stage.clientHeight || 200, dpr = Math.min(2, window.devicePixelRatio||1); cv.width = W*dpr; cv.height = Hh*dpr; cv.style.width = W+"px"; cv.style.height = Hh+"px";
  var ctx = cv.getContext("2d"), rows = Math.max(12, Math.min(40, Math.round(16 + (cfg.st.size-50)/4))), cell = Hh*dpr/rows, cols = Math.ceil(W*dpr/cell);
  var off = document.createElement("canvas"), oc = off.getContext("2d", {willReadFrequently: true}), txt = lines.map(function(l){ return fields(l.t, cfg); }).join("   ·   ");
  oc.font = "bold "+Math.round(rows*0.82)+"px "+FONTS[0][2]; var tw = Math.ceil(oc.measureText(txt).width)+2; off.width = tw; off.height = rows; oc.font = "bold "+Math.round(rows*0.82)+"px "+FONTS[0][2]; oc.fillStyle = "#fff"; oc.textBaseline = "middle"; oc.fillText(txt, 1, rows/2+1);
  var px = oc.getImageData(0, 0, tw, rows).data, col = (cfg.st.color||{}).a || "#ff3b2f", x = cfg.an && cfg.an.cont ? cols : Math.max(0, Math.floor((cols - tw)/2)), spd = (cfg.an && +cfg.an.speed)||5, last = 0;
  var dir = cfg.an && cfg.an.cont==="scrollR" ? 1 : -1; if(dir===1) x = -tw;
  var draw = function(t){ if(isDead()) return; if(t - last > 140 - spd*12){ last = t; if(cfg.an && cfg.an.cont){ x += dir; if(dir<0 && x < -tw) x = cols; if(dir>0 && x > cols) x = -tw; } }
    ctx.fillStyle = "#050505"; ctx.fillRect(0, 0, cv.width, cv.height);
    for(var r=0;r<rows;r++) for(var c=0;c<cols;c++){ var sx = c - x, on = sx >= 0 && sx < tw && px[(r*tw+sx)*4+3] > 100;
      ctx.beginPath(); ctx.arc(c*cell+cell/2, r*cell+cell/2, cell*0.38, 0, 6.283); ctx.fillStyle = on ? col : "#1a1a1a"; ctx.fill(); }
    setRaf(requestAnimationFrame(draw)); };
  setRaf(requestAnimationFrame(draw));
}

// ---------------- display clock renderer ----------------
function renderClock(box, cfg, opt){
  opt = opt || {}; var dead = false, timers = [], th = theme(cfg.theme), s = cfg.show || {}, zk = 0, fok = {on: false, end: 0, br: false}, slideI = 0, chimed = {};
  var autoTheme = function(){ if(!cfg.auto) return th; var now = new Date(), t = day(now), sub = atTime(now, t.subuh), syu = atTime(now, t.syuruk), mag = atTime(now, t.maghrib), isy = atTime(now, t.isyak);
    if(sub && syu && now >= sub && now < new Date(syu.getTime()+3600000)) return theme("dawn"); if(mag && isy && now >= new Date(mag.getTime()-1800000) && now < isy) return theme("andalus"); if(isy && now >= isy || sub && now < sub) return theme("qiyam"); return theme("jannah"); };
  var paint = function(){ th = autoTheme();
    var motif = th[7]==="silhouette" ? svgUrl(SILHOUETTE, th[5])+" bottom/100% auto no-repeat," : th[7] ? svgUrl(PATTERNS[th[7]], th[5])+"," : "";
    box.className = "dsBox dsClk dsL-"+cfg.layout+(opt.full ? " dsFull" : "")+(box.classList.contains("dsDim") ? " dsDim" : "")+(box.classList.contains("dsFlash") ? " dsFlash" : "")+(box.classList.contains("dsPaused") ? " dsPaused" : ""); box.style.cssText = "background:"+motif+th[3]+";color:"+th[4]+";--acc:"+th[5]+";font-family:"+font(th[6])[2]+";"; };
  paint(); if(th[6]) loadFont(th[6]);
  var root = document.createElement("div"); root.className = "dsCRoot"; box.innerHTML = ""; box.appendChild(root);
  if(s.zikir) root.onclick = function(e){ if(e.target.closest(".dsZk")){ zk++; if(H.N.vibrate) H.N.vibrate(15); draw(); } };
  var analog = function(now){ var sec = now.getSeconds(), mi = now.getMinutes()+sec/60, hr = now.getHours()%12+mi/60, hand = function(a, l, w, c){ var r = a*Math.PI/180; return '<line x1="50" y1="50" x2="'+(50+l*Math.sin(r)).toFixed(2)+'" y2="'+(50-l*Math.cos(r)).toFixed(2)+'" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"/>'; };
    var ticks = ""; for(var i=0;i<12;i++){ var r = i*30*Math.PI/180; ticks += '<circle cx="'+(50+42*Math.sin(r)).toFixed(2)+'" cy="'+(50-42*Math.cos(r)).toFixed(2)+'" r="'+(i%3?1:2)+'" fill="currentColor"/>'; }
    return '<svg class="dsAna" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="none" stroke="var(--acc)" stroke-width="1.5"/><path d="M50 8l3 7h-6z" fill="var(--acc)"/>'+ticks+hand(hr*30, 24, 3.2, "currentColor")+hand(mi*6, 34, 2, "currentColor")+(s.secs?hand(sec*6, 38, 0.8, "var(--acc)"):"")+'<circle cx="50" cy="50" r="2.2" fill="var(--acc)"/></svg>'; };
  var cal = function(now){ var y = now.getFullYear(), m = now.getMonth(), first = new Date(y, m, 1).getDay(), dn = new Date(y, m+1, 0).getDate(), h = '<div class="dsCal"><b>'+now.toLocaleDateString(undefined, {month: "long", year: "numeric"})+'</b><div class="dsCalG">';
    ["A","I","S","R","K","J","S"].forEach(function(d){ h += '<i>'+d+'</i>'; }); for(var i=0;i<first;i++) h += '<span></span>';
    for(var d=1; d<=dn; d++){ var dt = new Date(y, m, d), wd = dt.getDay(), hj = H.hijriDay ? H.hijriDay(dt) : 0, sun = wd===1 || wd===4 || (hj>=13 && hj<=15);
      h += '<span class="'+(d===now.getDate()?"on ":"")+(sun?"pu":"")+'">'+d+'</span>'; } return h+'</div><small>● '+L("Puasa sunat (Isnin, Khamis, Hari Putih)","Sunnah fasts (Mon, Thu, White Days)")+'</small></div>'; };
  var block = {
    clock: function(now){ if(s.analog) return analog(now); var t = hm(now, s.h24), ap = (t.match(/ (AM|PM)$/)||[])[1]||""; t = t.replace(/ (AM|PM)$/, "");
      return '<div class="dsTime">'+t+(s.secs?'<small class="dsSec">:'+pad(now.getSeconds())+'</small>':'')+(ap?'<small> '+ap+'</small>':'')+'</div>'; },
    date: function(now){ return '<div class="dsDate">'+now.toLocaleDateString(ibLoc(H.en()), {weekday: "long", day: "numeric", month: "long", year: "numeric"})+'</div>'; },
    hijri: function(now){ return '<div class="dsHij">'+esc(H.hijri ? H.hijri(now) : "")+(s.arday?' · <span class="ar">'+["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"][now.getDay()]+'</span>':'')+'</div>'; },
    prayers: function(now){ var t = day(now), np = nextPrayer(now), lp = lastPrayer(now), fri = now.getDay()===5, ks = (s.imsak?["imsak"]:[]).concat(["subuh"]).concat(s.syuruk?["syuruk"]:[]).concat(["zohor","asar","maghrib","isyak"]);
      return '<div class="dsPr">'+ks.map(function(k){ var cur = lp && lp.k===k, nx = np.k===k && np.t.toDateString()===now.toDateString(); return '<div class="dsPt'+(cur?' cur':'')+(nx?' nx':'')+'"><span>'+pName(k, fri)+'</span><b>'+(t[k] ? hm(atTime(now, t[k]), s.h24).replace(/ (AM|PM)/, "") : "--")+'</b></div>'; }).join("")+'</div>'; },
    countdown: function(now){ var np = nextPrayer(now), fri = now.getDay()===5;
      if(s.iqamah){ var lp = lastPrayer(now); if(lp){ var iq = (cfg.iq||{})[lp.k]||10, ie = new Date(lp.t.getTime()+iq*60000), pe = new Date(ie.getTime()+(lp.k==="zohor"&&fri&&cfg.jumaat?40:12)*60000);
        if(now < ie) return '<div class="dsCd iq"><span>'+L("Iqamah ","Iqamah ")+pName(lp.k, fri)+L(" dalam"," in")+'</span><b>'+dur(ie - now)+'</b></div>';
        if(now < pe) return '<div class="dsCd pray"><b>'+(lp.k==="zohor"&&fri&&cfg.jumaat?L("Khutbah & solat Jumaat","Khutbah & Jumu'ah prayer"):L("Solat sedang berlangsung","Prayer in progress"))+'</b><span>'+L("Mohon senyap","Please keep silent")+' 🤫</span></div>'; } }
      return '<div class="dsCd"><span>'+pName(np.k, fri && np.t.getDay()===5)+L(" dalam"," in")+'</span><b>'+dur(np.t - now)+'</b></div>'; },
    iqamah: function(){ return ""; },
    fokus: function(now){ var f = cfg.fokus||{w:25,b:5}; if(!fok.on) return '<div class="dsFok"><button class="dsFkB" data-fk="start">▶ '+L("Mula fokus","Start focus")+' '+f.w+' min</button></div>';
      var left = fok.end - now.getTime(); if(left <= 0){ fok.br = !fok.br; fok.end = now.getTime() + (fok.br ? f.b : f.w)*60000; left = fok.end - now.getTime(); if(cfg.chime) chime(); }
      return '<div class="dsFok '+(fok.br?"br":"wk")+'"><span>'+(fok.br?L("Rehat","Break"):L("Fokus","Focus"))+'</span><b>'+dur(left)+'</b><button class="dsFkB" data-fk="stop">■</button></div>'; },
    event: function(){ var e = cfg.ev||{}; if(!e.d) return ""; return '<div class="dsEv"><span>'+esc(e.n||L("Acara","Event"))+'</span><b>'+cdText(e.d)+'</b></div>'; },
    calendar: function(now){ return cal(now); },
    hadith: function(){ var hd = H.hadith ? H.hadith() : null; return hd ? '<div class="dsHd">“'+esc(H.en() ? hd.en : hd.ms)+'”<small>'+esc(hd.src||"")+'</small></div>' : ""; },
    asma: function(now){ var A = window.ASMAUL_HUSNA||[]; if(!A.length) return ""; var x = A[Math.floor(now.getTime()/20000)%A.length]; return '<div class="dsAs"><span class="ar">'+x[0]+'</span><b>'+esc(x[1])+'</b><small>'+esc(H.en() ? x[3] : x[2])+'</small></div>'; },
    zikir: function(){ return '<div class="dsZk"><b>'+zk+'</b><small>'+L("Ketik skrin untuk mengira","Tap the screen to count")+'</small></div>'; },
    battery: function(){ return bat.l==null ? "" : '<div class="dsBat">'+(bat.c?"⚡":"🔋")+' '+Math.round(bat.l*100)+'%</div>'; },
    weather: function(){ var w = weather(); return w ? '<div class="dsWx"><span>'+w.ic+'</span><b>'+Math.round(w.t)+'°C</b><small>'+esc(w.d)+'</small></div>' : ""; },
    ticker: function(){ return ""; },
    qr: function(){ var q = cfg.qr||{}; return q.img ? '<div class="dsQr"><img src="'+q.img+'" alt="QR"><span>'+esc(q.t||"DuitNow QR")+'</span></div>' : ""; }
  };
  var bat = {l: null, c: false}; try{ if(navigator.getBattery) navigator.getBattery().then(function(b){ var u = function(){ bat.l = b.level; bat.c = b.charging; }; u(); b.onlevelchange = u; b.onchargingchange = u; }); }catch(e){}
  var ORDER = ["clock","date","hijri","countdown","prayers","fokus","event","calendar","hadith","asma","zikir","weather","battery","qr"];
  var slides = null, slidesAt = 0;
  var tickerEl = null;
  var draw = function(){ if(dead) return; var now = new Date(); paint(); if(box.firstChild!==root){ box.innerHTML = ""; box.appendChild(root); }
    var items = ORDER.filter(function(k){ return s[k]; });
    if(cfg.slide && cfg.slide.on && cfg.layout!=="masjid"){ var pages = [["clock","date","hijri","countdown"], ["prayers"], ["hadith","asma","event","calendar"]].map(function(p){ return p.filter(function(k){ return s[k]; }); }).filter(function(p){ return p.length; });
      if(pages.length) items = pages[Math.floor(now.getTime()/((cfg.slide.secs||15)*1000))%pages.length]; }
    if(s.qr===undefined && cfg.qr && cfg.qr.img && items.indexOf("qr")<0 && cfg.layout==="masjid") items = items.concat(["qr"]);
    var h = items.map(function(k){ return '<div class="dsB dsB-'+k+'">'+block[k](now)+'</div>'; }).join("");
    // 0.5.23 phones-off screen: the whole display becomes the iqamah countdown, then "prayer in progress"
    var big = "", fri0 = now.getDay()===5, lp0 = lastPrayer(now), np0 = nextPrayer(now);
    if(s.iqamah && cfg.iqFull && lp0 && lp0.k!=="syuruk" && lp0.k!=="imsak"){ var iq0 = (cfg.iq||{})[lp0.k]||10, ie0 = new Date(lp0.t.getTime()+iq0*60000), jm = lp0.k==="zohor" && fri0 && cfg.jumaat, pe0 = new Date(ie0.getTime()+(jm?40:12)*60000);
      if(now < ie0 && !jm) big = '<div class="dsBig iq"><div class="dsBigI">📵</div><b>'+L("Sila matikan telefon bimbit","Please switch off your phone")+'</b><span>'+L("Iqamah ","Iqamah ")+pName(lp0.k, fri0)+L(" dalam"," in")+'</span><div class="dsBigT">'+dur(ie0 - now)+'</div><small>'+L("Luruskan dan rapatkan saf","Straighten and close the rows")+'</small></div>';
      else if(now < pe0) big = '<div class="dsBig pray"><div class="dsBigI">🤫</div><b>'+(jm?L("Khutbah & solat Jumaat","Khutbah & Jumu'ah prayer"):L("Solat sedang berlangsung","Prayer in progress"))+'</b><span>📵 '+L("Telefon bimbit dimatikan","Phones off, please")+'</span></div>'; }
    // 0.5.23 timed page turn: clock page, then a content page, in turns (paused 10 minutes before each prayer)
    var ss = cfg.ss||{}, slideNow = "";
    if(!big && ss.on && !(np0 && np0.t - now < 600000) && !(lp0 && now - lp0.t < ((cfg.iq||{})[lp0.k]||10)*60000+15*60000)){
      if(!slides || Date.now() - slidesAt > 600000){ slides = slidesOf(cfg); slidesAt = Date.now(); }
      var per = Math.max(5, ss.secs||20)*1000, kk = Math.floor(now.getTime()/per) + RT.ssOff;
      if(slides.length && (kk % 2 !== 0 || RT.ssForce) && !RT.ssPause) slideNow = slideHtml(cfg, slides[Math.floor(kk/2) % slides.length]); }
    root.innerHTML = big ? big : slideNow ? slideNow : '<div class="dsGrid">'+h+'</div>';
    var tkText = RT.ticker ? RT.ticker : s.ticker ? [cfg.tgrp && H.groupTicker ? H.groupTicker(cfg.tgrp) : "", cfg.ticker ? fields(cfg.ticker, cfg) : ""].filter(Boolean).join("   •   ") : "";
    if(tickerEl && tickerEl._t!==tkText){ tickerEl.remove(); tickerEl = null; }
    if(tkText){ if(!tickerEl || !box.contains(tickerEl)){ tickerEl = document.createElement("div"); tickerEl.className = "dsTick"; tickerEl._t = tkText; tickerEl.innerHTML = '<span>'+esc(tkText)+'</span>'; box.appendChild(tickerEl);
      var sp = tickerEl.firstChild, w = sp.scrollWidth, bw = box.clientWidth||360; sp.style.setProperty("--a", bw+"px"); sp.style.setProperty("--b", -w+"px"); sp.style.animation = "dsScrollX "+((w+bw)/80).toFixed(1)+"s linear infinite"; } }
    root.querySelectorAll("[data-fk]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); if(b.getAttribute("data-fk")==="start"){ fok.on = true; fok.br = false; fok.end = Date.now() + (cfg.fokus||{w:25}).w*60000; } else fok.on = false; draw(); }; });
    // alerts: soft chime / flash 5 min before and at prayer time (no azan audio)
    if(opt.full && (cfg.chime || cfg.flash)){ var np = nextPrayer(now), left = np.t - now, key = np.k+np.t.toDateString();
      if(left < 300000 && left > 295000 && !chimed["p"+key]){ chimed["p"+key] = 1; if(cfg.chime) chime(); }
      var lp = lastPrayer(now); if(lp && now - lp.t < 2000 && !chimed["a"+lp.k+lp.t.toDateString()]){ chimed["a"+lp.k+lp.t.toDateString()] = 1; if(cfg.chime) chime(); if(cfg.flash){ box.classList.add("dsFlash"); setTimeout(function(){ box.classList.remove("dsFlash"); }, 3000); } } }
    // night dim between Isyak and Subuh
    if(opt.full && cfg.dim){ var t = day(now), isy = atTime(now, t.isyak), sub = atTime(now, t.subuh); box.classList.toggle("dsDim", !!(isy && sub && (now >= isy || now < sub))); }
  };
  draw(); var iv = setInterval(draw, 1000); timers.push(iv);
  return {stop: function(){ dead = true; timers.forEach(clearInterval); }, redraw: function(){ slides = null; draw(); }};
}
var actx = null;
function chime(){ try{ actx = actx || new (window.AudioContext||window.webkitAudioContext)(); [660, 880].forEach(function(f, i){ var o = actx.createOscillator(), g = actx.createGain(); o.type = "sine"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, actx.currentTime+i*0.35); g.gain.exponentialRampToValueAtTime(0.25, actx.currentTime+i*0.35+0.03); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime+i*0.35+0.9); o.connect(g); g.connect(actx.destination); o.start(actx.currentTime+i*0.35); o.stop(actx.currentTime+i*0.35+1); }); }catch(e){} }

// ---------------- full screen ----------------
var FS = null;
function fullscreen(cfg, onExit){
  var ov = document.getElementById("overlay"); ov.className = "dspov"; ov.innerHTML = '<div class="dsFull" id="dsFull"></div><div class="dsCtl hidden" id="dsCtl"><button data-c="pause">⏯</button><button data-c="rot">🔄</button><input type="range" min="5" max="100" value="'+(cfg.bright>0?Math.round(cfg.bright*100):100)+'" id="dsBr"><button data-c="edit">✏️</button><button data-c="exit">✕</button></div>'+(cfg.lock?'<div class="dsLockH" id="dsLockH">🔒</div>':'');
  var box = ov.querySelector("#dsFull"), ctl = ov.querySelector("#dsCtl"), hideT = null, r = null, paused = false, orient = cfg.orient||"landscape", shiftT = null, swipes = 0, sx = null;
  // 0.5.17-dev: foldables and tablets (smallest side 600 px or more): follow the device posture instead of forcing landscape,
  // and redraw at the new size whenever the phone is folded, unfolded or turned, so the display always fills the screen
  if(bigScreen() && orient==="landscape") orient = "auto";
  try{ if(H.N.setOrientation) H.N.setOrientation(orient==="portrait" ? "portrait" : orient==="auto" ? "sensor" : orient==="rlandscape" ? "rlandscape" : "landscape"); }catch(e){}
  try{ if(H.N.keepScreenOn) H.N.keepScreenOn(true, cfg.bright>0 ? cfg.bright : -1); }catch(e){}
  if(cfg.lock && H.N.lockTask) try{ H.N.lockTask(true); }catch(e){}
  var start = function(){ if(r) r.stop(); r = cfg.mode==="clk" ? renderClock(box, cfg, {full: true}) : render(box, cfg, {full: true}); };
  setTimeout(start, 350);
  // 0.5.23 content for the slideshow, and the phone remote
  RT.ticker = null; RT.ann = null; RT.ssOff = 0; RT.ssPause = false; var rem = null, annT = null;
  if(cfg.mode==="clk" && cfg.ss && cfg.ss.on && (cfg.ss.src||{}).ayat && !window.AYAT_DAILY && H.loadJs) H.loadJs(["quran/ayat_daily.js"], function(){ if(r && r.redraw) r.redraw(); });
  var annShow = function(){ var a = ov.querySelector("#dsAnn"); if(a) a.remove(); clearTimeout(annT); if(!RT.ann) return;
    a = document.createElement("div"); a.id = "dsAnn"; a.className = "dsAnn"; a.innerHTML = '<small>📢 '+L("Pengumuman","Announcement")+'</small><b>'+esc(RT.ann.t).replace(/\n/g, "<br>")+'</b>'; ov.appendChild(a);
    annT = setTimeout(function(){ RT.ann = null; annShow(); }, Math.max(10000, RT.ann.until - Date.now())); };
  if(cfg.remote && H.loadJs) H.loadJs([window.NostrKit?null:"groups/nostrkit.js", window.DsRemote?null:"display/remote.js"].filter(Boolean), function(){ if(!window.DsRemote || FS===null) return;
    var code = H.load("ihsan_dsremote", null); if(!code){ code = DsRemote.newCode(); H.save("ihsan_dsremote", code); }
    rem = DsRemote.tv(code, function(o){ if(o.cmd==="ann"){ RT.ann = o.t ? {t: String(o.t).slice(0, 400), until: Date.now() + Math.max(1, Math.min(240, +o.mins||5))*60000} : null; annShow(); }
      else if(o.cmd==="ticker"){ RT.ticker = o.t ? String(o.t).slice(0, 600) : null; }
      else if(o.cmd==="next"){ RT.ssOff++; } else if(o.cmd==="prev"){ RT.ssOff--; }
      else if(o.cmd==="pause"){ RT.ssPause = !!o.v; }
      else if(o.cmd==="clear"){ RT.ticker = null; RT.ann = null; RT.ssPause = false; annShow(); }
      if(r && r.redraw) r.redraw(); },
      function(){ return {name: cfg.name, ann: RT.ann, ticker: RT.ticker, pause: RT.ssPause, ss: !!(cfg.ss && cfg.ss.on)}; });
    var badge = document.createElement("div"); badge.className = "dsPair"; var qs = ""; try{ qs = qrSvg("MYIHSAN-TV:"+code); }catch(e){}
    badge.innerHTML = qs+'<div><small>📱 '+L("Alat kawalan telefon","Phone remote")+'</small><b>'+esc(code)+'</b><small>'+L("Paparan › 📱 Kawalan jauh","Display › 📱 Remote")+'</small></div>'; ov.appendChild(badge);
    setTimeout(function(){ badge.classList.add("hid"); }, 60000); ov._pair = badge; });
  var onRes = function(){ clearTimeout(onRes.t); onRes.t = setTimeout(start, 250); }; window.addEventListener("resize", onRes);
  try{ if(screen.orientation) screen.orientation.addEventListener("change", onRes); }catch(e){}
  var t0 = Date.now(), au = H.load("ihsan_dsauto", {}) || {};
  if(cfg.burn!==false || au.restart){ var k = 0; shiftT = setInterval(function(){ k++; if(cfg.burn!==false) box.style.transform = "translate("+((k%5)-2)*2+"px,"+((k%3)-1)*2+"px)";
    // daily fresh start at 03:00 for displays left running for days (masjid TV)
    var nw = new Date(); if(au.restart && nw.getHours()===3 && nw.getMinutes()===0 && Date.now()-t0 > 3600000){ try{ sessionStorage.setItem("dsResume", JSON.stringify(cfg)); }catch(e){} location.reload(); } }, 60000); }
  var exit = function(force){ if(cfg.lock && !force){ H.toast(L("Dikunci: leret 🔒 lima kali untuk keluar","Locked: swipe the 🔒 five times to exit")); return; }
    if(r) r.stop(); clearInterval(shiftT); if(rem) rem.stop(); rem = null; clearTimeout(annT); RT.ticker = null; RT.ann = null; window.removeEventListener("resize", onRes); try{ if(screen.orientation) screen.orientation.removeEventListener("change", onRes); }catch(e){} try{ H.N.keepScreenOn(false, -1); H.N.setOrientation("portrait"); if(cfg.lock && H.N.lockTask) H.N.lockTask(false); }catch(e){}
    H.closeOverlay(); FS = null; if(onExit) onExit(); };
  ov._close = function(){ exit(false); };
  box.onclick = function(e){ if(e.target.closest(".dsZk,.dsFkB")) return; ctl.classList.remove("hidden"); if(ov._pair){ ov._pair.classList.remove("hid"); clearTimeout(ov._pairT); ov._pairT = setTimeout(function(){ if(ov._pair) ov._pair.classList.add("hid"); }, 20000); } clearTimeout(hideT); hideT = setTimeout(function(){ ctl.classList.add("hidden"); }, 3000); };
  var lh = ov.querySelector("#dsLockH"); if(lh){ lh.addEventListener("touchstart", function(e){ sx = e.touches[0].clientX; }, {passive: true}); lh.addEventListener("touchend", function(e){ if(sx!=null && Math.abs(e.changedTouches[0].clientX - sx) > 40){ swipes++; if(swipes >= 5) exit(true); else H.toast(swipes+"/5"); } sx = null; });
    lh.onmousedown = function(e){ sx = e.clientX; }; lh.onmouseup = function(e){ if(sx!=null && Math.abs(e.clientX - sx) > 40){ swipes++; if(swipes >= 5) exit(true); } sx = null; }; }
  if(cfg.lock) box.oncontextmenu = function(e){ e.preventDefault(); }; else { var lp = null; box.addEventListener("touchstart", function(){ lp = setTimeout(function(){ exit(false); }, 1200); }, {passive: true}); box.addEventListener("touchend", function(){ clearTimeout(lp); }); }
  ctl.querySelectorAll("[data-c]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); var c = b.getAttribute("data-c");
    if(c==="exit"){ if(cfg.lock) H.toast(L("Dikunci: leret 🔒 lima kali untuk keluar","Locked: swipe the 🔒 five times to exit")); else exit(true); }
    else if(c==="edit"){ if(!cfg.lock){ exit(true); } }
    else if(c==="rot"){ var seq = ["landscape","portrait","rlandscape","auto"]; orient = seq[(seq.indexOf(orient)+1)%seq.length]; try{ H.N.setOrientation(orient==="auto" ? "sensor" : orient); }catch(x){} H.toast(orient); }
    else if(c==="pause"){ paused = !paused; box.classList.toggle("dsPaused", paused); } }; });
  ov.querySelector("#dsBr").oninput = function(){ var v = +this.value/100; try{ H.N.keepScreenOn(true, v); }catch(e){} box.style.filter = H.N.keepScreenOn ? "" : "brightness("+v+")"; };
  FS = {exit: exit, cfg: cfg};
}

function bigScreen(){ try{ return Math.min(screen.width, screen.height) >= 600; }catch(e){ return false; } }
// ---------------- page: home ----------------
function open(el, helpers){ H = helpers; UI.el = el; if(UI.editing) editor(); else home(); }
function home(){ stopPrev(); UI.editing = null; var el = UI.el, ps = presets(); el.classList.remove("dsEdit");
  var h = '<div class="dsModes"><button class="card dsMode" id="dsNewBB"><span>🪧</span><b>'+L("Papan tanda","Billboard")+'</b><small>'+L("Teks bergerak, LED, 20 animasi","Moving text, LED, 20 animations")+'</small></button>'+
    '<button class="card dsMode" id="dsNewClk"><span>🕰️</span><b>'+L("Jam paparan","Display clock")+'</b><small>'+L("Jam, Hijri, waktu solat, iqamah, 10 tema","Clock, Hijri, prayer times, iqamah, 10 themes")+'</small></button></div>';
  if(ps.length) h += '<div class="card"><h3>💾 '+L("Paparan tersimpan","Saved displays")+'</h3>'+ps.map(function(p, i){ return '<div class="dsPre"><div class="dsMini" data-mini="'+i+'"></div><span>'+(p.cfg.mode==="clk"?"🕰️":"🪧")+' <b>'+esc(p.name)+'</b></span><button class="chip gold" data-pp="'+i+'">▶</button><button class="chip" data-pe="'+i+'">✏️</button><button class="chip" data-pm="'+i+'">⋯</button></div>'; }).join("")+
    '<div class="btns" style="margin-top:6px"><button class="chip" id="dsPlay">🗓 '+L("Jadual (playlist)","Schedule (playlist)")+'</button><button class="chip" id="dsImp">📥 '+L("Import kod","Import code")+'</button></div></div>';
  else h += '<div class="btns"><button class="chip" id="dsImp">📥 '+L("Import kod paparan","Import a display code")+'</button></div>';
  h += '<div class="card"><h3>🪧 '+L("Templat papan tanda","Billboard templates")+'</h3><div class="dsTpl">'+BB_TPL.map(function(t, i){ return '<button class="dsTp" data-tb="'+i+'"><span>'+t[1]+'</span>'+esc(L(t[2], t[3]))+'</button>'; }).join("")+'</div></div>';
  h += '<button class="card dsWiz" id="dsWiz"><span>🕌</span><b>'+L("Sediakan paparan TV masjid","Set up a masjid TV display")+'</b><small>'+L("Satu langkah: zon, minit iqamah, pengumuman, tema, kunci, mula automatik","One step: zone, iqamah minutes, announcements, theme, lock, auto start")+'</small></button>'+
    '<button class="card dsWiz" id="dsRem"><span>📱</span><b>'+L("Kawalan jauh TV masjid","Masjid TV remote")+'</b><small>'+L("Hantar pengumuman, tukar teks bergerak dan selak slaid dari telefon anda","Send announcements, change the ticker and turn slides from your phone")+'</small></button>';
  h += '<div class="card"><h3>🕰️ '+L("Templat jam","Clock templates")+'</h3><div class="dsTpl">'+CLK_TPL.map(function(t, i){ return '<button class="dsTp" data-tc="'+i+'"><span>'+t[1]+'</span>'+esc(L(t[2], t[3]))+'</button>'; }).join("")+'</div></div>';
  h += '<div class="card"><h3>🧰 '+L("Alat paparan","Display tools")+'</h3><div class="dsTpl">'+[["score","🏆",L("Papan markah","Scoreboard")],["watch","⏱",L("Jam randik / selang","Stopwatch / interval")],["queue","🔢",L("Nombor giliran","Queue number")],["light","🔦",L("Lampu skrin","Screen light")],["tag","🏷",L("Tanda nama","Name tag")]].map(function(t){ return '<button class="dsTp" data-tool="'+t[0]+'"><span>'+t[1]+'</span>'+esc(t[2])+'</button>'; }).join("")+'</div></div>';
  el.innerHTML = h;
  // 0.6.31 (owner): each saved display plays live in a small preview, so moving text is seen moving
  UI.minis = []; el.querySelectorAll("[data-mini]").forEach(function(b){ var c = ps[+b.getAttribute("data-mini")].cfg; b.style.aspectRatio = c.orient==="portrait" ? "9 / 14" : "16 / 9"; try{ if(c.st) loadFont(c.st.font); UI.minis.push(c.mode==="clk" ? renderClock(b, c, {}) : render(b, c, {})); }catch(e){} b.onclick = function(){ fullscreen(c, home); }; });
  el.querySelector("#dsNewBB").onclick = function(){ edit(bbDefault(), -1); };
  el.querySelector("#dsNewClk").onclick = function(){ edit(clkDefault(), -1); };
  el.querySelectorAll("[data-tb]").forEach(function(b){ b.onclick = function(){ var t = BB_TPL[+b.getAttribute("data-tb")], c = merge(bbDefault(), t[4]); c.name = L(t[2], t[3]); edit(c, -1); }; });
  el.querySelectorAll("[data-tc]").forEach(function(b){ b.onclick = function(){ var t = CLK_TPL[+b.getAttribute("data-tc")], c = clkDefault(); Object.keys(c.show).forEach(function(k){ c.show[k] = false; }); merge(c, t[4]); c.name = L(t[2], t[3]); edit(c, -1); }; });
  el.querySelectorAll("[data-pp]").forEach(function(b){ b.onclick = function(){ fullscreen(ps[+b.getAttribute("data-pp")].cfg, home); }; });
  el.querySelectorAll("[data-pe]").forEach(function(b){ b.onclick = function(){ var i = +b.getAttribute("data-pe"); edit(clone(ps[i].cfg), i); }; });
  el.querySelectorAll("[data-pm]").forEach(function(b){ b.onclick = function(){ presetMenu(+b.getAttribute("data-pm")); }; });
  el.querySelectorAll("[data-tool]").forEach(function(b){ b.onclick = function(){ tool(b.getAttribute("data-tool")); }; });
  el.querySelector("#dsWiz").onclick = masjidWizard; el.querySelector("#dsRem").onclick = remoteSheet;
  var im = el.querySelector("#dsImp"); if(im) im.onclick = importSheet; var pl = el.querySelector("#dsPlay"); if(pl) pl.onclick = playlistSheet;
}
// 0.5.23 phone side of the TV remote
var PH = null;
function remoteSheet(){ var last = H.load("ihsan_dsremote_ph", "") || "";
  var ov = H.showSheet("📱 "+L("Kawalan jauh TV","TV remote"), '<div class="mut small">'+L("Pada TV: Paparan › edit jam › Slaid & TV › hidupkan \"Kawalan dari telefon\". Kod dipaparkan di penjuru skrin TV (ketik skrin untuk melihatnya semula).","On the TV: Display › edit the clock › Slides & TV › turn on \"Phone remote\". The code shows in a corner of the TV (tap the screen to see it again).")+'</div>'+
    '<div class="row" style="gap:6px;margin:8px 0"><input id="rmC" class="rin" placeholder="ABCD-2345" value="'+esc(last)+'" style="flex:1;text-transform:uppercase;letter-spacing:2px"><button class="btn gold g3d" id="rmGo">'+L("Sambung","Connect")+'</button></div><div class="small" id="rmSt"></div><div id="rmP"></div>');
  var st = ov.querySelector("#rmSt"), P = ov.querySelector("#rmP");
  var panel = function(S){ P.innerHTML = '<div class="card" style="margin-top:8px"><b>📺 '+esc(S.name||"TV")+'</b><div class="mut tiny">'+(S.ann?'📢 '+esc(S.ann.t).slice(0, 60)+' · ':'')+(S.ticker?'🔤 '+L("teks bergerak ditukar","ticker changed")+' · ':'')+(S.pause?'⏸ '+L("slaid dijeda","slides paused"):'')+'</div></div>'+
      '<label class="small">📢 '+L("Pengumuman besar","Big announcement")+'</label><textarea id="rmA" class="rin" rows="3" maxlength="400" placeholder="'+L("Cth. Kuliah Maghrib malam ini dibatalkan","E.g. Tonight\'s kuliah is cancelled")+'"></textarea>'+
      '<div class="btns">'+[5,15,30,60].map(function(m){ return '<button class="chip" data-rm="'+m+'">'+m+' min</button>'; }).join("")+'</div>'+
      '<label class="small">🔤 '+L("Teks bergerak","Rolling ticker")+'</label><div class="row" style="gap:6px"><input id="rmT" class="rin" style="flex:1" maxlength="600"><button class="chip" id="rmTs">'+L("Hantar","Send")+'</button></div>'+
      '<label class="small">🖼 '+L("Slaid","Slides")+'</label><div class="btns"><button class="chip" data-rc="prev">◀</button><button class="chip" data-rc="pause">'+(S.pause?'▶ '+L("Sambung","Resume"):'⏸ '+L("Jeda","Pause"))+'</button><button class="chip" data-rc="next">▶</button><button class="chip" data-rc="clear">✕ '+L("Kosongkan semua","Clear all")+'</button></div>';
    P.querySelectorAll("[data-rm]").forEach(function(b){ b.onclick = function(){ var t = P.querySelector("#rmA").value.trim(); if(!t) return; PH.send({cmd: "ann", t: t, mins: +b.getAttribute("data-rm")}); H.toast(L("Dihantar ke TV","Sent to the TV")); }; });
    P.querySelector("#rmTs").onclick = function(){ PH.send({cmd: "ticker", t: P.querySelector("#rmT").value.trim()}); H.toast(L("Dihantar ke TV","Sent to the TV")); };
    P.querySelectorAll("[data-rc]").forEach(function(b){ b.onclick = function(){ var c = b.getAttribute("data-rc"); PH.send(c==="pause" ? {cmd: "pause", v: !S.pause} : {cmd: c}); }; }); };
  var go = function(){ var c = window.DsRemote.norm(ov.querySelector("#rmC").value); if(c.length < 8){ H.toast(L("Masukkan kod 8 aksara dari TV","Enter the 8-character code from the TV")); return; }
    var code = c.slice(0, 4)+"-"+c.slice(4, 8); H.save("ihsan_dsremote_ph", code); if(PH) PH.stop(); st.textContent = "⏳ "+L("Menyambung…","Connecting…"); var got = false;
    PH = window.DsRemote.phone(code, function(S){ got = true; st.textContent = "✅ "+L("Bersambung dengan TV","Connected to the TV"); var a = P.querySelector("#rmA"), t = P.querySelector("#rmT"), av = a ? a.value : "", tv = t ? t.value : (S.ticker||""); panel(S); P.querySelector("#rmA").value = av; P.querySelector("#rmT").value = tv; });
    setTimeout(function(){ if(!got) st.textContent = "⚠️ "+L("TV belum menjawab. Pastikan TV dalam skrin penuh, kawalan dihidupkan dan ada internet.","The TV has not answered. Check it is full screen with the remote on and online."); }, 9000);
    ov._close = function(){ if(PH){ PH.stop(); PH = null; } H.closeOverlay(); }; };
  ov.querySelector("#rmGo").onclick = function(){ if(window.DsRemote && window.NostrKit) go(); else H.loadJs([window.NostrKit?null:"groups/nostrkit.js", "display/remote.js"].filter(Boolean), go); };
}
function code(cfg){ var c = clone(cfg); if(c.bg && c.bg.img && c.bg.img.length > 60000) c.bg.img = ""; return "MYIHSAN-PAPARAN:"+btoa(unescape(encodeURIComponent(JSON.stringify(c)))); }
function uncode(s){ var i = String(s).indexOf("MYIHSAN-PAPARAN:"); if(i<0) return null; try{ var c = JSON.parse(decodeURIComponent(escape(atob(String(s).slice(i+16).trim().split(/\s/)[0])))); return c && (c.mode==="bb"||c.mode==="clk") ? c : null; }catch(e){ return null; } }
function presetMenu(i){ var ps = presets(), p = ps[i];
  var au = H.load("ihsan_dsauto", {}) || {};
  var ov = H.showSheet(esc(p.name), [["pin","📌 "+L("Tambah ke skrin utama telefon","Add to the phone home screen")],["auto", (String(au.id)===String(p.id)?"✅ ":"⏻ ")+L("Mula automatik (selepas hidup semula / bila dicas)","Start automatically (after restart / when charging)")],["ren","✏️ "+L("Namakan semula","Rename")],["dup","⧉ "+L("Salin","Duplicate")],["share","📤 "+L("Kongsi kod","Share code")],["del","🗑 "+L("Padam","Delete")]].map(function(x){ return '<button class="btn alt full g3d" data-x="'+x[0]+'" style="margin-bottom:6px">'+x[1]+'</button>'; }).join(""));
  ov.querySelectorAll("[data-x]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-x"); H.closeOverlay();
    if(a==="pin"){ if(!p.id){ savePresets(ps); } if(H.N.pinShortcut) H.N.pinShortcut(String(p.id), p.name); else H.toast(L("Hanya dalam aplikasi Android","Only in the Android app")); }
    else if(a==="auto") autoSheet(p);
    else if(a==="ren") ask(L("Nama baharu","New name"), p.name, function(v){ if(v){ ps[i].name = v; ps[i].cfg.name = v; savePresets(ps); home(); } });
    else if(a==="dup"){ var c = clone(p); c.name += " 2"; c.cfg.name = c.name; ps.push(c); savePresets(ps); home(); }
    else if(a==="share"){ var t = L("Paparan My Ihsan: ","My Ihsan display: ")+p.name+"\n"+code(p.cfg); if(H.N.shareText) H.N.shareText(t); else if(H.N.copyText) H.N.copyText(t); else try{ navigator.clipboard.writeText(t); }catch(e){} H.toast(L("Kod sedia untuk dikongsi","Code ready to share")); }
    else if(a==="del"){ ps.splice(i, 1); savePresets(ps); home(); } }; }); }
function ask(label, val, cb){ var ov = H.showSheet("✏️", '<label class="small">'+esc(label)+'</label><input id="dsAsk" class="rin" value="'+esc(val||"")+'"><button class="btn gold full g3d" id="dsAskOk">OK</button>'); ov.querySelector("#dsAskOk").onclick = function(){ var v = ov.querySelector("#dsAsk").value.trim(); H.closeOverlay(); cb(v); }; }
function importSheet(){ var ov = H.showSheet("📥 "+L("Import kod paparan","Import a display code"), '<textarea id="dsImC" class="rin" rows="4" placeholder="MYIHSAN-PAPARAN:…"></textarea><button class="btn gold full g3d" id="dsImOk">'+L("Import","Import")+'</button>');
  ov.querySelector("#dsImOk").onclick = function(){ var c = uncode(ov.querySelector("#dsImC").value); if(!c){ H.toast(L("Kod tidak sah","Not a valid code")); return; } var ps = presets(); ps.push({id: Date.now(), name: c.name||"Paparan", cfg: c}); savePresets(ps); H.closeOverlay(); home(); H.toast(L("Diimport","Imported")); }; }
function playlistSheet(){ var ps = presets(), pl = H.load("ihsan_dsplay", []) || [];
  var row = function(x, i){ return '<div class="dsPlR"><select data-pli="'+i+'" data-k="p">'+ps.map(function(p, j){ return '<option value="'+j+'"'+(x.p===j?' selected':'')+'>'+esc(p.name)+'</option>'; }).join("")+'</select><input type="time" data-pli="'+i+'" data-k="f" value="'+esc(x.f||"00:00")+'"><span>→</span><input type="time" data-pli="'+i+'" data-k="t" value="'+esc(x.t||"23:59")+'"><button class="chip" data-plx="'+i+'">✕</button></div>'; };
  var ov = H.showSheet("🗓 "+L("Jadual paparan","Display schedule"), '<div class="mut small">'+L("Paparan berlainan pada waktu berlainan, cth. jam sepanjang hari dan pengumuman kuliah dari Maghrib ke Isyak. Masa yang bertindih: yang di bawah menang.","Different displays at different times, e.g. the clock all day and a kuliah notice from Maghrib to Isyak. Overlapping times: the lower row wins.")+'</div><div id="dsPlL">'+pl.map(row).join("")+'</div><div class="btns"><button class="chip" id="dsPlA">＋ '+L("Tambah","Add")+'</button><button class="btn gold g3d" id="dsPlGo">▶ '+L("Mula jadual","Start schedule")+'</button></div>');
  var sync = function(){ ov.querySelectorAll("[data-pli]").forEach(function(e){ var i = +e.getAttribute("data-pli"), k = e.getAttribute("data-k"); pl[i][k] = k==="p" ? +e.value : e.value; }); H.save("ihsan_dsplay", pl); };
  ov.querySelector("#dsPlA").onclick = function(){ sync(); pl.push({p: 0, f: "00:00", t: "23:59"}); H.save("ihsan_dsplay", pl); H.closeOverlay(); playlistSheet(); };
  ov.querySelectorAll("[data-plx]").forEach(function(b){ b.onclick = function(){ sync(); pl.splice(+b.getAttribute("data-plx"), 1); H.save("ihsan_dsplay", pl); H.closeOverlay(); playlistSheet(); }; });
  ov.querySelectorAll("[data-pli]").forEach(function(e){ e.onchange = sync; });
  ov.querySelector("#dsPlGo").onclick = function(){ sync(); H.closeOverlay(); runPlaylist(); };
}
function playlistPick(){ var ps = presets(), pl = H.load("ihsan_dsplay", []) || [], now = new Date(), m = now.getHours()*60+now.getMinutes(), best = null;
  pl.forEach(function(x){ var f = x.f.split(":"), t = x.t.split(":"), a = +f[0]*60+ +f[1], b = +t[0]*60+ +t[1]; if(a <= b ? (m >= a && m <= b) : (m >= a || m <= b)) best = x; }); return best && ps[best.p] ? best.p : null; }
function runPlaylist(){ var cur = playlistPick(); if(cur==null){ H.toast(L("Tiada paparan dijadualkan untuk waktu ini","No display is scheduled for now")); return; }
  var ps = presets(), stopped = false; fullscreen(ps[cur].cfg, function(){ stopped = true; clearInterval(iv); home(); });
  var iv = setInterval(function(){ if(stopped || !FS) { clearInterval(iv); return; } var n = playlistPick(); if(n!=null && n!==cur){ cur = n; var keep = FS; keep.exit(true); stopped = false; fullscreen(ps[cur].cfg, function(){ stopped = true; clearInterval(iv); home(); }); } }, 30000); }

// ---------------- editor ----------------
function edit(cfg, idx){ UI.cfg = cfg; UI.idx = idx; UI.hist = []; UI.fut = []; UI.sel = -1; UI.page = 0; UI.editing = true; if(cfg.st) loadFont(cfg.st.font); editor(); }
function stopPrev(){ if(UI.prev){ UI.prev.stop(); UI.prev = null; } (UI.minis || []).forEach(function(m){ try{ m.stop(); }catch(e){} }); UI.minis = []; }
function change(fn, noHist){ if(!noHist){ UI.hist.push(JSON.stringify(UI.cfg)); if(UI.hist.length > 60) UI.hist.shift(); UI.fut = []; } fn(UI.cfg); preview(); pages(true); }
var pvT = null;
function preview(){ clearTimeout(pvT); pvT = setTimeout(function(){ var b = UI.el.querySelector("#dsPv"); if(!b) return; stopPrev(); var c = UI.cfg;
  b.style.aspectRatio = c.orient==="portrait" ? "9 / 14" : "16 / 9"; b.style.maxHeight = c.orient==="portrait" ? "46vh" : ""; if(c.st) loadFont(c.st.font);
  UI.prev = c.mode==="clk" ? renderClock(b, c, {}) : render(b, c, {sel: UI.sel});
  if(c.mode==="bb") b.querySelectorAll(".dsLine").forEach(function(ln){ ln.onclick = function(e){ e.stopPropagation(); var i = +ln.getAttribute("data-li"); UI.sel = UI.sel===i ? -1 : i; preview(); pages(true); }; }); }, 120); }
var resBound = false;
function editor(){ var el = UI.el, c = UI.cfg; el.classList.add("dsEdit");
  if(!resBound){ resBound = true; window.addEventListener("resize", function(){ if(UI.editing && UI.el && document.body.contains(UI.el) && UI.el.querySelector("#dsPv")){ clearTimeout(editor.rt); editor.rt = setTimeout(function(){ preview(); pages(true); }, 250); } }); }
  el.innerHTML = '<div class="dsEdTop"><button class="chip" id="dsBack">‹</button><input id="dsName" class="rin" value="'+esc(c.name)+'"><button class="chip" id="dsUndo" title="Undo">↶</button><button class="chip" id="dsRedo" title="Redo">↷</button><button class="chip" id="dsRnd" title="🔀">🔀</button></div>'+
    '<div class="dsPvWrap"><div id="dsPv" class="dsBox"></div><div class="dsPvHint mut tiny">'+(c.mode==="bb"?L("Ketik satu baris untuk mengubahnya sahaja. Ketik pratonton dua kali untuk skrin penuh.","Tap one line to edit only that line. Double-tap the preview for full screen."):L("Ketik pratonton dua kali untuk skrin penuh.","Double-tap the preview for full screen."))+'</div></div>'+
    '<div class="dsGoBar"><button class="btn gold g3d" id="dsStart">▶ '+L("Mula","Start")+'</button><button class="btn alt g3d" id="dsSave">💾 '+L("Simpan","Save")+'</button><button class="chip" id="dsReset">'+L("Set semula","Reset")+'</button></div>'+
    '<div class="dsPgHead"><span id="dsPgT"></span><span class="dsDots" id="dsDots"></span></div><div class="dsPages" id="dsPages"></div>';
  el.querySelector("#dsBack").onclick = function(){ home(); };
  el.querySelector("#dsName").onchange = function(){ var v = this.value; change(function(x){ x.name = v; }); };
  el.querySelector("#dsUndo").onclick = function(){ if(!UI.hist.length) return; UI.fut.push(JSON.stringify(UI.cfg)); UI.cfg = JSON.parse(UI.hist.pop()); preview(); pages(true); };
  el.querySelector("#dsRedo").onclick = function(){ if(!UI.fut.length) return; UI.hist.push(JSON.stringify(UI.cfg)); UI.cfg = JSON.parse(UI.fut.pop()); preview(); pages(true); };
  el.querySelector("#dsRnd").onclick = function(){ change(surprise); };
  el.querySelector("#dsReset").onclick = function(){ change(function(x){ var d = x.mode==="clk" ? clkDefault() : bbDefault(); var keep = x.mode==="bb" ? x.lines : null; Object.keys(x).forEach(function(k){ delete x[k]; }); merge(x, d); if(keep) x.lines = keep; }); };
  el.querySelector("#dsStart").onclick = function(){ fullscreen(clone(UI.cfg), function(){ editor(); }); };
  el.querySelector("#dsPv").ondblclick = function(){ fullscreen(clone(UI.cfg), function(){ editor(); }); };
  el.querySelector("#dsSave").onclick = function(){ var ps = presets(); if(UI.idx >= 0 && ps[UI.idx]){ ps[UI.idx].cfg = clone(UI.cfg); ps[UI.idx].name = UI.cfg.name; } else { ps.push({id: Date.now(), name: UI.cfg.name, cfg: clone(UI.cfg)}); UI.idx = ps.length-1; } savePresets(ps); H.toast(L("Disimpan","Saved")); };
  preview(); pages(false);
}
function surprise(x){ var r = function(a){ return a[Math.floor(Math.random()*a.length)]; };
  if(x.mode==="clk"){ x.theme = r(THEMES)[0]; x.layout = r(["big","row","masjid","night","split","grid"]); return; }
  var nonLed = FONTS.filter(function(f){ return f[0]!=="led" && !/^عربي/.test(f[1]); }); x.st.font = r(nonLed)[0]; loadFont(x.st.font);
  var pair = r([["#ffd400","#000000"],["#ffffff","#0b5d3b"],["#00e5ff","#0b1230"],["#ff2bd6","#120408"],["#39ff14","#000000"],["#c9a646","#04301f"],["#000000","#ffd400"]]);
  x.st.color = r([{k: "solid", a: pair[0]},{k: "grad", a: pair[0], b: "#ff7a00", ang: 90},{k: "rainbow"}]); x.bg = r([{k: "solid", a: pair[1]},{k: "pat", a: pair[1], pat: r(Object.keys(PATTERNS)), pc: pair[0]},{k: "anim", a: pair[1], b: "#4a9be8"},{k: "grad", a: pair[1], b: "#000000"}]);
  x.st.glow = Math.random() < 0.3; x.st.shadow = Math.random() < 0.5; x.st.outline = Math.random() < 0.25 ? 1 : 0; x.frame = r(["none","none","simple","bulbs","arch"]);
  var c = Math.random() < 0.4; x.an = {cont: c ? r(["scrollL","scrollU"]) : "", enter: c ? "" : r(["fade","slide","zoom","bounce","flip","spin","drop","flap","type"]), show: c ? "" : r(["","breathe","wave","shimmer","neon","bounce","rainbow"]), exit: "", speed: 5, pause: 1, loop: 0, play: x.lines.length > 1 && Math.random() < 0.5 ? "slides" : "all", dur: 4}; }
// swipeable setting pages
function pages(keep){ var el = UI.el, c = UI.cfg, wrap = el.querySelector("#dsPages"); if(!wrap) return;
  var defs = c.mode==="clk" ? [["show",L("Paparan","Show")],["layout",L("Susun atur","Layout")],["theme",L("Tema","Theme")],["solat",L("Solat & iqamah","Prayer & iqamah")],["cd",L("Kiraan detik","Countdowns")],["slides",L("Slaid & TV","Slides & TV")],["more",L("Lagi","More")]]
    : [["text",L("Teks","Text")],["font",L("Fon","Font")],["color",L("Warna","Colour")],["bg",L("Latar","Background")],["anim",L("Animasi","Animation")],["more",L("Lagi","More")]];
  var x = keep ? wrap.scrollLeft : 0;
  wrap.innerHTML = defs.map(function(d){ return '<section class="dsPg" data-pg="'+d[0]+'">'+pageHtml(d[0], c)+'</section>'; }).join("");
  el.querySelector("#dsDots").innerHTML = defs.map(function(d, i){ return '<i data-dot="'+i+'"></i>'; }).join("");
  var setDot = function(){ var i = Math.round(wrap.scrollLeft / Math.max(1, wrap.clientWidth)); UI.page = i; el.querySelectorAll("[data-dot]").forEach(function(d, j){ d.classList.toggle("on", j===i); }); el.querySelector("#dsPgT").textContent = (defs[i]||defs[0])[1]+(c.mode==="bb" && UI.sel>=0 && i<4 && i>0 ? " · "+L("baris ","line ")+(UI.sel+1) : ""); };
  wrap.onscroll = function(){ clearTimeout(wrap._t); wrap._t = setTimeout(setDot, 60); };
  el.querySelectorAll("[data-dot]").forEach(function(d){ d.onclick = function(){ wrap.scrollTo({left: +d.getAttribute("data-dot")*wrap.clientWidth, behavior: "smooth"}); }; });
  wrap.scrollLeft = keep ? x : UI.page*wrap.clientWidth; setDot(); bindPages(wrap, c);
}
function chips(attr, cur, list){ return '<div class="dsChips">'+list.map(function(o){ return '<button class="chip'+(String(cur)===String(o[0])?' on':'')+'" data-'+attr+'="'+esc(o[0])+'"'+(o[2]?' style="'+o[2]+'"':'')+'>'+o[1]+'</button>'; }).join("")+'</div>'; }
function sw(id, on, lab){ return '<label class="dsSw"><input type="checkbox" data-sw="'+id+'"'+(on?' checked':'')+'> '+lab+'</label>'; }
function sl(id, v, min, max, lab, step){ return '<label class="dsSl"><span>'+lab+' <b>'+v+'</b></span><input type="range" data-sl="'+id+'" min="'+min+'" max="'+max+'" step="'+(step||1)+'" value="'+v+'"></label>'; }
function swatches(attr, cur){ var rec = H.load("ihsan_dscol", []) || []; return '<div class="dsSwat">'+PALETTE.concat(rec.filter(function(r){ return PALETTE.indexOf(r)<0; }).slice(0, 6)).map(function(col){ return '<button class="dsSwc'+(cur===col?' on':'')+'" data-'+attr+'="'+col+'" style="background:'+col+'"></button>'; }).join("")+'<input type="color" data-'+attr+'-pick value="'+(cur||"#ffffff")+'"></div>'; }
function S(){ var c = UI.cfg; return UI.sel>=0 && c.lines[UI.sel] ? merge(clone(c.st), c.lines[UI.sel].s||{}) : c.st; }
function setSt(fn){ change(function(c){ if(UI.sel>=0 && c.lines[UI.sel]){ var s = merge(clone(c.st), c.lines[UI.sel].s||{}); fn(s); var diff = {}; Object.keys(s).forEach(function(k){ if(JSON.stringify(s[k])!==JSON.stringify(c.st[k])) diff[k] = s[k]; }); c.lines[UI.sel].s = diff; } else fn(c.st); }); }
function pageHtml(id, c){ var s = c.st ? S() : null, an = c.an || {}, sh = c.show || {};
  var allBtn = c.mode==="bb" && UI.sel>=0 ? '<button class="chip" data-act="all">'+L("Gunakan untuk semua baris","Apply to all lines")+'</button>' : '';
  switch(id){
  case "text": return '<div class="dsLines">'+c.lines.map(function(l, i){ return '<div class="dsLn'+(UI.sel===i?' on':'')+'"><textarea class="rin" rows="1" data-ln="'+i+'" dir="auto">'+esc(l.t)+'</textarea><button class="chip" data-lsel="'+i+'">🎨</button><button class="chip" data-ldel="'+i+'">✕</button></div>'; }).join("")+'</div>'+
    '<div class="btns"><button class="chip" data-act="addline">＋ '+L("Baris","Line")+'</button><button class="chip" data-act="paste">📋 '+L("Tampal","Paste")+'</button><button class="chip" data-act="speak">🔊 '+L("Sebut","Speak")+'</button></div>'+
    '<div class="mut tiny">'+L("Sisip cepat:","Quick insert:")+'</div><div class="dsChips">'+["Assalamualaikum","Selamat Hari Raya","Selamat Pengantin Baru","Ahlan wa sahlan","Selamat datang jemaah","Mohon senyap, solat sedang berlangsung","سُبْحَانَ اللّٰهِ","اَلْحَمْدُ لِلّٰهِ","اَللّٰهُ أَكْبَرُ","{jam}","{tarikh}","{hijri}","{solat seterusnya}","{baki masa}","{kiraan}"].map(function(q){ return '<button class="chip" data-ins="'+esc(q)+'">'+esc(q)+'</button>'; }).join("")+'</div>'+
    '<div class="mut tiny">'+L("Asma ul-Husna:","Names of Allah:")+'</div><div class="dsChips">'+(window.ASMAUL_HUSNA||[]).slice(0, 12).map(function(a){ return '<button class="chip ar" data-ins="'+esc(a[0])+'">'+esc(a[0])+'</button>'; }).join("")+'</div>';
  case "font": return allBtn+'<div class="dsFonts">'+FONTS.map(function(f){ loadFontLater(f[0]); return '<button class="dsFt'+(s.font===f[0]?' on':'')+'" data-font="'+f[0]+'" style="font-family:'+(f[0]==="led"?"monospace":f[2])+'">'+esc(f[1])+'</button>'; }).join("")+'</div>'+
    sl("size", s.size, 5, 100, L("Saiz (% tinggi)","Size (% of height)"))+sl("lh", s.lh, 0.7, 2, L("Jarak baris","Line spacing"), 0.05)+sl("ls", s.ls, -2, 10, L("Jarak huruf","Letter spacing"))+
    '<div class="dsSws">'+sw("bold", s.bold, "<b>B</b> "+L("Tebal","Bold"))+sw("italic", s.italic, "<i>I</i> "+L("Condong","Italic"))+sw("upper", s.upper, "AA "+L("Huruf besar","Uppercase"))+sw("under", s.under, "<u>U</u> "+L("Garis bawah","Underline"))+'</div>'+
    '<div class="mut tiny">'+L("Jajaran","Alignment")+'</div>'+chips("al", s.align, [["left","⬅"],["center","⬌"],["right","➡"]])+chips("va", s.valign, [["top","⬆ "+L("Atas","Top")],["middle","⬌ "+L("Tengah","Middle")],["bottom","⬇ "+L("Bawah","Bottom")]]);
  case "color": var col = s.color||{}; return allBtn+chips("ck", col.k, [["solid",L("Satu warna","Solid")],["grad",L("Gradien","Gradient")],["rainbow","🌈 "+L("Pelangi","Rainbow")]])+
    '<div class="mut tiny">'+(col.k==="grad"?L("Warna 1","Colour 1"):L("Warna teks","Text colour"))+'</div>'+swatches("ca", col.a)+
    (col.k==="grad"?'<div class="mut tiny">'+L("Warna 2","Colour 2")+'</div>'+swatches("cb", col.b)+sl("ang", col.ang||90, 0, 360, L("Sudut","Angle"), 15):'')+
    '<div class="mut tiny">'+L("Kesan","Effects")+'</div><div class="dsSws">'+sw("shadow", s.shadow, L("Bayang","Shadow"))+sw("glow", s.glow, L("Cahaya neon","Neon glow"))+sw("emboss", s.emboss, L("Timbul 3D","3D emboss"))+sw("mirror", c.st.mirror, L("Cermin (untuk tingkap)","Mirror (for a window)"))+'</div>'+
    sl("outline", s.outline||0, 0, 4, L("Garis luar","Outline"))+(s.outline?'<div class="mut tiny">'+L("Warna garis luar","Outline colour")+'</div>'+swatches("oc", s.oc):'');
  case "bg": var bg = c.bg||{}; return chips("bk", bg.k, [["solid",L("Satu warna","Solid")],["grad",L("Gradien","Gradient")],["anim",L("Gradien bergerak","Moving gradient")],["pat",L("Corak Islamik","Islamic pattern")],["sil",L("Siluet masjid","Mosque silhouette")],["img",L("Gambar","Picture")]])+
    '<div class="mut tiny">'+L("Warna latar","Background colour")+'</div>'+swatches("ba", bg.a)+((bg.k==="grad"||bg.k==="anim")?'<div class="mut tiny">'+L("Warna 2","Colour 2")+'</div>'+swatches("bb", bg.b):'')+
    (bg.k==="pat"?chips("pat", bg.pat||"geo", [["geo",L("Geometri","Geometric")],["arabesque","Arabesque"],["tiles",L("Bintang","Stars")],["kufi","Kufi"],["songket","Songket"],["stars",L("Langit malam","Night sky")]])+'<div class="mut tiny">'+L("Warna corak","Pattern colour")+'</div>'+swatches("pc", bg.pc):'')+
    (bg.k==="sil"?'<div class="mut tiny">'+L("Warna siluet","Silhouette colour")+'</div>'+swatches("pc", bg.pc):'')+
    (bg.k==="img"?'<button class="chip" data-act="img">🖼 '+L("Pilih gambar","Choose a picture")+'</button>'+sl("dark", bg.dark||0, 0, 90, L("Gelapkan","Darken"))+sl("blur", bg.blur||0, 0, 20, L("Kabur","Blur")):'')+
    '<div class="mut tiny">'+L("Bingkai","Frame")+'</div>'+chips("fr", c.frame||"none", [["none",L("Tiada","None")],["simple",L("Ringkas","Simple")],["bulbs",L("Mentol LED","LED bulbs")],["arch",L("Gerbang Islamik","Islamic arch")]]);
  case "anim": var opt = function(role){ return [["",L("Tiada","None")]].concat(ANIMS.filter(function(a){ return a[4].indexOf(role)>=0; }).map(function(a){ return [a[0], a[1]+" "+L(a[2], a[3])]; })); };
    return '<div class="mut tiny">'+L("Bergerak berterusan","Continuous")+'</div>'+chips("acont", an.cont||"", opt("c"))+
      (!an.cont?'<div class="mut tiny">'+L("Masuk","Enter")+'</div>'+chips("aenter", an.enter||"", opt("e"))+'<div class="mut tiny">'+L("Semasa dipaparkan","While showing")+'</div>'+chips("ashow", an.show||"", opt("s"))+'<div class="mut tiny">'+L("Keluar (mod slaid)","Exit (slides mode)")+'</div>'+chips("aexit", an.exit||"", opt("x")):'')+
      sl("speed", an.speed||5, 1, 10, L("Laju","Speed"))+(c.lines.length > 1?'<div class="mut tiny">'+L("Main baris","Play lines")+'</div>'+chips("aplay", an.play||"all", [["all",L("Semua serentak","All at once")],["slides",L("Satu demi satu (slaid)","One after another (slides)")]]):'')+
      (an.play==="slides"?sl("dur", an.dur||4, 1, 20, L("Tempoh setiap baris (s)","Each line (s)")):'')+sl("pause", an.pause||0, 0, 10, L("Jeda antara pusingan (s)","Pause between loops (s)"))+
      '<div class="mut tiny">'+L("Ulang","Loop")+'</div>'+chips("aloop", an.loop||0, [[1,L("Sekali","Once")],[3,"3×"],[0,L("Selamanya","Forever")]])+'<button class="chip" data-act="rndanim">🔀 '+L("Campuran rawak","Random mix")+'</button>';
  case "more": return '<div class="mut tiny">'+L("Orientasi","Orientation")+'</div>'+chips("or", c.orient||"landscape", [["landscape","▭ "+L("Landskap","Landscape")],["portrait","▯ "+L("Potret","Portrait")],["rlandscape","▭↺ "+L("Landskap terbalik","Reverse landscape")],["auto","🔄 Auto"]])+
    '<div class="dsSws">'+sw("lock", c.lock, "🔒 "+L("Kunci (keluar dengan leret 🔒 5 kali)","Lock (exit by swiping 🔒 5 times)"))+(c.mode==="bb"?sw("strobe", c.strobe, "⚡ "+L("Kelipan strob (amaran fotosensitif)","Strobe flash (photosensitivity warning)")):'')+sw("burn", c.burn!==false, L("Lindung skrin (anjak sedikit setiap minit)","Burn-in protection (small shift every minute)"))+'</div>'+
    sl("bright", c.bright>0?Math.round(c.bright*100):100, 5, 100, L("Kecerahan paparan (%)","Display brightness (%)"))+
    (c.mode==="bb"?'<div class="mut tiny">'+L("Sasaran kiraan detik untuk {kiraan}","Countdown target for {kiraan}")+'</div><input class="rin" type="datetime-local" data-cd value="'+esc(c.cd||"")+'">':'')+
    '<div class="btns"><button class="chip" data-act="share">📤 '+L("Kongsi kod","Share code")+'</button><button class="chip" data-act="png">🖼 '+L("Simpan gambar","Save picture")+'</button>'+(c.mode==="bb"?'<button class="chip" data-act="video">🎬 '+L("Video pendek (6 s)","Short video (6 s)")+'</button>':'')+'</div>';
  case "show": return '<div class="dsSws dsGridSw">'+[["clock","🕰 "+L("Jam","Clock")],["secs",L("Saat","Seconds")],["h24","24 "+L("jam","h")],["analog",L("Analog","Analog")],["date","📅 "+L("Tarikh","Date")],["hijri","🌙 Hijri"],["arday",L("Hari (Arab)","Day (Arabic)")],["prayers","🕌 "+L("Waktu solat","Prayer times")],["syuruk",L("Syuruk","Sunrise")],["imsak","Imsak"],["countdown","⏳ "+L("Kiraan ke solat","Prayer countdown")],["iqamah",L("Iqamah (masjid)","Iqamah (masjid)")],["fokus","🎯 "+L("Fokus","Focus")],["event","🎉 "+L("Acara","Event")],["calendar","🗓 "+L("Kalendar","Calendar")],["hadith","📜 "+L("Hadis","Hadith")],["asma","✨ Asma ul-Husna"],["zikir","📿 "+L("Kaunter zikir","Zikir counter")],["battery","🔋 "+L("Bateri","Battery")],["weather","🌤 "+L("Cuaca","Weather")],["ticker","📢 "+L("Teks bergerak","Ticker")]].map(function(x){ return sw("show."+x[0], sh[x[0]], x[1]); }).join("")+'</div>'+
    (sh.ticker?'<input class="rin" data-tick placeholder="'+L("Teks pengumuman bergerak","Rolling announcement text")+'" value="'+esc(c.ticker||"")+'">'+groupPick(c):'');
  case "layout": return chips("lay", c.layout, [["big",L("Jam besar","Big clock")],["row",L("Jam + waktu solat","Clock + prayer row")],["masjid",L("Papan masjid","Masjid board")],["night",L("Sisi katil","Nightstand")],["focus",L("Fokus","Focus")],["split",L("Bahagi dua","Split")],["grid",L("Grid","Grid")]])+
    sw("slide.on", (c.slide||{}).on, L("Tayangan slaid (jam → solat → hadis)","Slideshow (clock → prayers → hadith)"))+((c.slide||{}).on?sl("slide.secs", (c.slide||{}).secs||15, 5, 60, L("Setiap halaman (s)","Each page (s)")):'');
  case "theme": return '<div class="dsThemes">'+THEMES.map(function(t){ return '<button class="dsTh'+(c.theme===t[0]?' on':'')+'" data-theme="'+t[0]+'" style="background:'+t[3]+';color:'+t[4]+'"><b style="color:'+t[5]+'">12:30</b><small>'+esc(L(t[1], t[2]))+'</small></button>'; }).join("")+'</div>'+sw("auto", c.auto, L("Tema ikut waktu (fajar → siang → senja → malam)","Theme by time of day (dawn → day → sunset → night)"));
  case "solat": return '<div class="mut tiny">'+L("Minit dari azan ke iqamah","Minutes from azan to iqamah")+'</div>'+PKEYS.map(function(k){ return sl("iq."+k, (c.iq||{})[k]||10, 0, 40, pName(k)); }).join("")+
    '<div class="dsSws">'+sw("jumaat", c.jumaat, L("Jumaat: masa khutbah","Friday: khutbah time"))+sw("chime", c.chime, "🔔 "+L("Bunyi lembut sebelum solat (bukan azan)","Soft chime before prayer (not azan)"))+sw("flash", c.flash, "💡 "+L("Kelip skrin pada waktu solat","Flash the screen at prayer time"))+sw("dim", c.dim, "🌙 "+L("Malapkan Isyak → Subuh","Dim from Isyak to Subuh"))+'</div>';
  case "slides": var ss = c.ss || {}, sr = ss.src || {}, q = c.qr || {};
    return sw("ss.on", ss.on, "🖼 "+L("Selak halaman bermasa (jam ⇄ kandungan ilmiah)","Timed page turn (clock ⇄ Islamic content)"))+sl("ss.secs", ss.secs||20, 8, 90, L("Setiap halaman (s)","Each page (s)"))+
      '<div class="mut tiny">'+L("Kandungan dari aplikasi","Content from the app")+'</div><div class="dsSws dsGridSw">'+[["ayat","📖 "+L("Ayat hari ini","Ayat of the day")],["hadith","📜 "+L("Hadis","Hadith")],["doa","🤲 Doa"],["asma","✨ Asma ul-Husna"],["notes","📌 "+L("Nota berlabel \"paparan\"","Notes labelled \"display\"")],["qr","💝 "+L("Slaid QR derma","Donation QR slide")]].map(function(o){ return sw("ss.src."+o[0], !!sr[o[0]], o[1]); }).join("")+'</div>'+
      '<div class="mut tiny">'+L("Slaid sendiri: baris pertama tajuk, pisahkan slaid dengan baris kosong","Own slides: first line is the title, separate slides with an empty line")+'</div><textarea class="rin" rows="4" data-sscu>'+esc(ss.custom||"")+'</textarea>'+
      '<div class="mut tiny">💝 DuitNow QR '+L("(gambar QR rasmi dari bank masjid)","(the official QR picture from the masjid\'s bank)")+'</div>'+(q.img?'<img src="'+q.img+'" style="width:110px;display:block;margin:4px 0;background:#fff;border-radius:8px">':'')+
      '<div class="btns"><button class="chip" data-act="qrimg">🖼 '+(q.img?L("Tukar","Change"):L("Pilih gambar QR","Choose the QR picture"))+'</button>'+(q.img?'<button class="chip" data-act="qrdel">✕</button>':'')+'</div><input class="rin" data-qrt maxlength="80" placeholder="'+L("Cth. Tabung Masjid Al-Falah · Maybank","E.g. Masjid Al-Falah fund · Maybank")+'" value="'+esc(q.t||"")+'">'+
      '<div class="dsSws">'+sw("iqFull", c.iqFull, "📵 "+L("Skrin penuh \"matikan telefon\" semasa kiraan iqamah (perlu Iqamah dihidupkan)","Full-screen \"phones off\" during the iqamah countdown (needs Iqamah on)"))+
      sw("remote", c.remote, "📱 "+L("Kawalan dari telefon (melalui internet)","Phone remote (over the internet)"))+'</div>'+
      (c.remote?'<div class="mut tiny">'+L("Kod TV ini: ","This TV\'s code: ")+'<b>'+esc(H.load("ihsan_dsremote", null)||L("dibuat semasa mula","made when it starts"))+'</b> · '+L("Telefon: Paparan › 📱 Kawalan jauh TV masjid","Phone: Display › 📱 Masjid TV remote")+'</div>':'');
  case "cd": return '<div class="mut tiny">'+L("Kiraan detik acara (Ramadan, Raya, majlis, peperiksaan)","Event countdown (Ramadan, Raya, a wedding, an exam)")+'</div><input class="rin" data-evn placeholder="'+L("Nama acara","Event name")+'" value="'+esc((c.ev||{}).n||"")+'"><input class="rin" type="datetime-local" data-evd value="'+esc((c.ev||{}).d||"")+'">'+
    '<div class="mut tiny">'+L("Fokus (Pomodoro)","Focus (Pomodoro)")+'</div>'+sl("fokus.w", (c.fokus||{}).w||25, 5, 90, L("Kerja (min)","Work (min)"))+sl("fokus.b", (c.fokus||{}).b||5, 1, 30, L("Rehat (min)","Break (min)"));
  }
  return "";
}
var lfQ = {}; function loadFontLater(id){ if(lfQ[id]) return; lfQ[id] = 1; setTimeout(function(){ loadFont(id); }, 50); }
function path(o, p, v){ var a = p.split("."), x = o; for(var i=0;i<a.length-1;i++){ x[a[i]] = x[a[i]] || {}; x = x[a[i]]; } if(arguments.length > 2) x[a[a.length-1]] = v; return x[a[a.length-1]]; }
function recent(col){ var r = H.load("ihsan_dscol", []) || []; r = [col].concat(r.filter(function(x){ return x!==col; })).slice(0, 8); H.save("ihsan_dscol", r); }
function bindPages(wrap, c){
  var q = function(sel, fn, ev){ wrap.querySelectorAll(sel).forEach(function(e){ e[ev||"onclick"] = function(x){ fn(e, x); }; }); };
  var colorAttr = function(attr, fn){ q("[data-"+attr+"]", function(e){ var v = e.getAttribute("data-"+attr); recent(v); fn(v); }); q("[data-"+attr+"-pick]", function(e){ recent(e.value); fn(e.value); }, "onchange"); };
  // text
  q("[data-ln]", function(e){ var i = +e.getAttribute("data-ln"), v = e.value; change(function(x){ x.lines[i].t = v; }); }, "onchange");
  q("[data-lsel]", function(e){ var i = +e.getAttribute("data-lsel"); UI.sel = UI.sel===i ? -1 : i; preview(); pages(true); });
  q("[data-ldel]", function(e){ var i = +e.getAttribute("data-ldel"); if(c.lines.length < 2) return; change(function(x){ x.lines.splice(i, 1); }); UI.sel = -1; });
  q("[data-ins]", function(e){ var v = e.getAttribute("data-ins"); change(function(x){ var i = UI.sel>=0 ? UI.sel : x.lines.length-1; x.lines[i].t = (x.lines[i].t ? x.lines[i].t+" " : "")+v; }); });
  // style
  q("[data-font]", function(e){ var v = e.getAttribute("data-font"); loadFont(v); setSt(function(s){ s.font = v; }); });
  q("[data-al]", function(e){ var v = e.getAttribute("data-al"); setSt(function(s){ s.align = v; }); });
  q("[data-va]", function(e){ var v = e.getAttribute("data-va"); change(function(x){ x.st.valign = v; }); });
  q("[data-ck]", function(e){ var v = e.getAttribute("data-ck"); setSt(function(s){ s.color = s.color||{}; s.color.k = v; if(v==="grad" && !s.color.b) s.color.b = "#ff7a00"; }); });
  colorAttr("ca", function(v){ setSt(function(s){ s.color = s.color||{k: "solid"}; s.color.a = v; if(s.color.k==="rainbow") s.color.k = "solid"; }); });
  colorAttr("cb", function(v){ setSt(function(s){ s.color.b = v; }); });
  colorAttr("oc", function(v){ setSt(function(s){ s.oc = v; }); });
  colorAttr("ba", function(v){ change(function(x){ x.bg.a = v; }); });
  colorAttr("bb", function(v){ change(function(x){ x.bg.b = v; }); });
  colorAttr("pc", function(v){ change(function(x){ x.bg.pc = v; }); });
  q("[data-bk]", function(e){ var v = e.getAttribute("data-bk"); change(function(x){ x.bg.k = v; if(v==="anim" && !x.bg.b) x.bg.b = "#4a9be8"; }); });
  q("[data-pat]", function(e){ var v = e.getAttribute("data-pat"); change(function(x){ x.bg.pat = v; }); });
  q("[data-fr]", function(e){ var v = e.getAttribute("data-fr"); change(function(x){ x.frame = v; }); });
  ["acont","aenter","ashow","aexit","aplay","aloop"].forEach(function(k){ q("[data-"+k+"]", function(e){ var v = e.getAttribute("data-"+k), key = k.slice(1); change(function(x){ x.an[key] = key==="loop" ? +v : v; }); }); });
  q("[data-or]", function(e){ var v = e.getAttribute("data-or"); change(function(x){ x.orient = v; }); });
  q("[data-lay]", function(e){ var v = e.getAttribute("data-lay"); change(function(x){ x.layout = v; if(v==="masjid"){ x.show.iqamah = true; x.show.prayers = true; x.show.countdown = true; } if(v==="focus") x.show.fokus = true; }); });
  q("[data-theme]", function(e){ var v = e.getAttribute("data-theme"); change(function(x){ x.theme = v; x.auto = false; }); });
  q("[data-sw]", function(e){ var k = e.getAttribute("data-sw"), v = e.checked;
    if(c.mode==="bb" && ["bold","italic","upper","under","shadow","glow","emboss"].indexOf(k)>=0) setSt(function(s){ s[k] = v; });
    else if(k==="mirror") change(function(x){ x.st.mirror = v; });
    else if(k==="strobe" && v){ var ov = H.showSheet("⚠️", '<div class="small">'+L("Kelipan strob boleh mencetuskan sawan bagi orang yang sensitif cahaya. Hidupkan hanya jika selamat.","Strobe flashes can trigger seizures in people with photosensitive epilepsy. Turn it on only if it is safe.")+'</div><button class="btn full g3d" id="dsStrOk" style="margin-top:8px">'+L("Faham, hidupkan","I understand, turn on")+'</button>');
      ov.querySelector("#dsStrOk").onclick = function(){ H.closeOverlay(); change(function(x){ x.strobe = true; }); }; e.checked = false; }
    else change(function(x){ path(x, k, v); }); }, "onchange");
  q("[data-sl]", function(e){ var k = e.getAttribute("data-sl"), v = +e.value; e.parentNode.querySelector("b").textContent = v;
    if(["size","lh","ls","outline"].indexOf(k)>=0) setSt(function(s){ s[k] = v; });
    else if(k==="ang") setSt(function(s){ s.color.ang = v; });
    else if(k==="bright") change(function(x){ x.bright = v>=100 ? -1 : v/100; });
    else if(["speed","pause","dur"].indexOf(k)>=0) change(function(x){ x.an[k] = v; });
    else if(k==="dark"||k==="blur") change(function(x){ x.bg[k] = v; });
    else change(function(x){ path(x, k, v); }); }, "onchange");
  q("[data-sl]", function(e){ e.parentNode.querySelector("b").textContent = e.value; }, "oninput");
  q("[data-cd]", function(e){ var v = e.value; change(function(x){ x.cd = v; }); }, "onchange");
  q("[data-sscu]", function(e){ var v = e.value; change(function(x){ x.ss = x.ss||{}; x.ss.custom = v; }); }, "onchange");
  q("[data-qrt]", function(e){ var v = e.value; change(function(x){ x.qr = x.qr||{}; x.qr.t = v; }); }, "onchange");
  q("[data-tick]", function(e){ var v = e.value; change(function(x){ x.ticker = v; }); }, "onchange");
  q("[data-tgrp]", function(e){ var v = e.value; change(function(x){ x.tgrp = v; }); }, "onchange");
  q("[data-evn]", function(e){ var v = e.value; change(function(x){ x.ev = x.ev||{}; x.ev.n = v; }); }, "onchange");
  q("[data-evd]", function(e){ var v = e.value; change(function(x){ x.ev = x.ev||{}; x.ev.d = v; }); }, "onchange");
  q("[data-act]", function(e){ var a = e.getAttribute("data-act");
    if(a==="all"){ change(function(x){ var s = merge(clone(x.st), x.lines[UI.sel].s||{}); x.st = s; x.lines.forEach(function(l){ delete l.s; }); }); UI.sel = -1; }
    else if(a==="addline") change(function(x){ x.lines.push({t: L("Baris baharu","New line")}); });
    else if(a==="paste"){ try{ navigator.clipboard.readText().then(function(t){ if(t) change(function(x){ x.lines = t.split(/\n/).filter(Boolean).slice(0, 8).map(function(l){ return {t: l}; }); }); }).catch(function(){ H.toast(L("Tampal dalam kotak teks","Paste into the text box")); }); }catch(x){ H.toast(L("Tampal dalam kotak teks","Paste into the text box")); } }
    else if(a==="speak"){ var t = c.lines.map(function(l){ return fields(l.t, c); }).join(". "); if(H.N.speak) H.N.speak(t, AR.test(t) ? "ar" : (H.en() ? "en" : "ms")); else try{ speechSynthesis.speak(new SpeechSynthesisUtterance(t)); }catch(x){} }
    else if(a==="img"){ var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = function(){ var f = inp.files[0]; if(!f) return; var r = new FileReader(); r.onload = function(){ var im = new Image(); im.onload = function(){ var s = Math.min(1, 1280/Math.max(im.width, im.height)), cv = document.createElement("canvas"); cv.width = im.width*s; cv.height = im.height*s; cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height); var d = cv.toDataURL("image/jpeg", 0.7); change(function(x){ x.bg.img = d; x.bg.k = "img"; }); }; im.src = r.result; }; r.readAsDataURL(f); }; inp.click(); }
    else if(a==="rndanim") change(function(x){ var r = function(arr){ return arr[Math.floor(Math.random()*arr.length)]; }; var c2 = Math.random() < 0.3; x.an.cont = c2 ? r(["scrollL","scrollR","scrollU","scrollD"]) : ""; x.an.enter = c2 ? "" : r(ANIMS.filter(function(a){ return /e/.test(a[4]); }))[0]; x.an.show = c2 ? "" : r(ANIMS.filter(function(a){ return /s/.test(a[4]); }))[0]; x.an.exit = r(["","fade","slide","zoom","flip"]); });
    else if(a==="qrdel") change(function(x){ x.qr = {img: "", t: (x.qr||{}).t||""}; });
    else if(a==="qrimg"){ var qi = document.createElement("input"); qi.type = "file"; qi.accept = "image/*"; qi.onchange = function(){ var f = qi.files[0]; if(!f) return; var rd = new FileReader(); rd.onload = function(){ var im = new Image(); im.onload = function(){
        var k = Math.min(1, 640/Math.max(im.width, im.height)), cv = document.createElement("canvas"); cv.width = Math.round(im.width*k); cv.height = Math.round(im.height*k); var g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(im, 0, 0, cv.width, cv.height);
        var u = cv.toDataURL("image/png"); if(u.length > 140000) u = cv.toDataURL("image/jpeg", 0.9); change(function(x){ x.qr = x.qr||{}; x.qr.img = u; x.ss = x.ss||{src: {}}; x.ss.src = x.ss.src||{}; x.ss.src.qr = true; }); }; im.src = rd.result; }; rd.readAsDataURL(f); }; qi.click(); }
    else if(a==="png") exportPng(c);
    else if(a==="video") exportVideo(c);
    else if(a==="share"){ var t = L("Paparan My Ihsan: ","My Ihsan display: ")+c.name+"\n"+code(c); if(H.N.shareText) H.N.shareText(t); else if(H.N.copyText) H.N.copyText(t); H.toast(L("Kod sedia untuk dikongsi","Code ready to share")); }
  });
}

// ---------------- tools ----------------
function tool(k){
  if(k==="tag"){ var c = merge(bbDefault(), {name: L("Tanda nama","Name tag"), orient: "portrait", lines: [{t: "AHMAD"},{t: L("Sukarelawan","Volunteer")}], st: {font: "anton", color: {k: "solid", a: "#ffffff"}}, bg: {k: "solid", a: "#0b5d3b"}, frame: "simple", an: {cont: ""}}); edit(c, -1); return; }
  var ov = document.getElementById("overlay"); ov.className = "dspov"; var st = {a: 0, b: 0, n: H.load("ihsan_dsqueue", 1)||1, run: false, t0: 0, acc: 0, laps: [], col: "#ffffff", iw: 30, ir: 10, iv: false, phase: 0, pend: 0};
  try{ H.N.keepScreenOn(true, k==="light" ? 1 : -1); H.N.setOrientation(k==="score" ? "landscape" : "portrait"); }catch(e){}
  var timer = null, close = function(){ clearInterval(timer); try{ H.N.keepScreenOn(false, -1); H.N.setOrientation("portrait"); }catch(e){} H.closeOverlay(); };
  ov._close = close;
  var draw = function(){ var h = '<button class="dsToolX" id="dtX">✕</button>';
    if(k==="score") h += '<div class="dsScore"><button class="dsTeam" data-t="a" style="background:#1f4e9c"><small>'+L("Pasukan A","Team A")+'</small><b>'+st.a+'</b></button><button class="dsTeam" data-t="b" style="background:#b23a48"><small>'+L("Pasukan B","Team B")+'</small><b>'+st.b+'</b></button></div><div class="dsToolHint">'+L("Ketik untuk +1, tekan lama untuk −1","Tap for +1, long-press for −1")+' · <button class="chip" id="dtR">'+L("Set semula","Reset")+'</button></div>';
    else if(k==="watch"){ var ms = st.acc + (st.run ? Date.now() - st.t0 : 0), txt;
      if(st.iv){ var cyc = (st.iw+st.ir)*1000, inC = ms % cyc, work = inC < st.iw*1000; txt = '<div class="dsIv '+(work?"wk":"rs")+'"><small>'+(work?L("KERJA","WORK"):L("REHAT","REST"))+' · '+(Math.floor(ms/cyc)+1)+'</small><b>'+dur((work ? st.iw*1000 - inC : cyc - inC))+'</b></div>'; var ph = work ? 1 : 2; if(st.run && ph!==st.phase){ st.phase = ph; if(H.N.vibrate) H.N.vibrate(300); chime(); } }
      else txt = '<div class="dsSW"><b>'+dur(ms)+'<small>.'+Math.floor(ms%1000/100)+'</small></b></div>';
      h += txt+'<div class="btns" style="justify-content:center"><button class="btn gold g3d" id="dtS">'+(st.run?"⏸":"▶")+'</button>'+(st.iv?'':'<button class="btn alt g3d" id="dtL">'+L("Pusingan","Lap")+'</button>')+'<button class="btn alt g3d" id="dtR">↺</button><button class="chip" id="dtI">'+(st.iv?L("Jam randik","Stopwatch"):L("Selang","Interval"))+'</button></div>'+
        (st.iv?'<div class="dsToolHint">'+L("Kerja ","Work ")+st.iw+'s · '+L("Rehat ","Rest ")+st.ir+'s <button class="chip" id="dtIw">±</button></div>':'<div class="dsLaps">'+st.laps.map(function(l, i){ return '<div>#'+(i+1)+' '+dur(l)+'</div>'; }).join("")+'</div>'); }
    else if(k==="queue") h += '<div class="dsQ"><small>'+L("Nombor giliran","Now serving")+'</small><b>'+st.n+'</b></div><div class="btns" style="justify-content:center"><button class="btn alt g3d" id="dtQm">−</button><button class="btn gold g3d" id="dtQ">'+L("Seterusnya","Next")+' ›</button><button class="chip" id="dtQr">↺</button></div>';
    else if(k==="light") h += '<div class="dsLight" style="background:'+st.col+'"></div><div class="dsLightC">'+["#ffffff","#fff4d6","#ffd400","#ff3b2f","#39ff14","#00e5ff","#ff2bd6"].map(function(c2){ return '<button class="dsSwc" data-lc="'+c2+'" style="background:'+c2+'"></button>'; }).join("")+'</div>';
    ov.innerHTML = '<div class="dsTool">'+h+'</div>';
    var g = function(id){ return ov.querySelector("#"+id); };
    g("dtX").onclick = close;
    ov.querySelectorAll("[data-t]").forEach(function(b){ var lp = null, longp = false; b.onpointerdown = function(){ longp = false; lp = setTimeout(function(){ longp = true; st[b.getAttribute("data-t")] = Math.max(0, st[b.getAttribute("data-t")]-1); draw(); }, 600); }; b.onpointerup = function(){ clearTimeout(lp); if(!longp){ st[b.getAttribute("data-t")]++; if(H.N.vibrate) H.N.vibrate(20); draw(); } }; });
    if(g("dtR")) g("dtR").onclick = function(){ st.a = st.b = 0; st.acc = 0; st.run = false; st.laps = []; st.phase = 0; draw(); };
    if(g("dtS")) g("dtS").onclick = function(){ if(st.run){ st.acc += Date.now() - st.t0; st.run = false; } else { st.t0 = Date.now(); st.run = true; } draw(); };
    if(g("dtL")) g("dtL").onclick = function(){ if(st.run) st.laps.unshift(st.acc + Date.now() - st.t0); draw(); };
    if(g("dtI")) g("dtI").onclick = function(){ st.iv = !st.iv; st.acc = 0; st.run = false; st.phase = 0; draw(); };
    if(g("dtIw")) g("dtIw").onclick = function(){ var ch = [[30,10],[40,20],[20,10],[45,15],[60,30]], i = ch.findIndex(function(x){ return x[0]===st.iw && x[1]===st.ir; }); var n2 = ch[(i+1)%ch.length]; st.iw = n2[0]; st.ir = n2[1]; draw(); };
    if(g("dtQ")) g("dtQ").onclick = function(){ st.n++; H.save("ihsan_dsqueue", st.n); chime(); draw(); };
    if(g("dtQm")) g("dtQm").onclick = function(){ st.n = Math.max(1, st.n-1); H.save("ihsan_dsqueue", st.n); draw(); };
    if(g("dtQr")) g("dtQr").onclick = function(){ st.n = 1; H.save("ihsan_dsqueue", 1); draw(); };
    ov.querySelectorAll("[data-lc]").forEach(function(b){ b.onclick = function(){ st.col = b.getAttribute("data-lc"); draw(); }; });
  };
  draw(); if(k==="watch") timer = setInterval(function(){ if(st.run) draw(); }, 100);
}

// ---------------- 0.5.18: weather (Open-Meteo, free, no key), group list for the ticker ----------------
var WX = {at: 0, v: null, busy: false};
var WCODE = function(c){ return c===0 ? ["☀️", L("Cerah","Clear")] : c<=2 ? ["🌤", L("Sebahagian berawan","Partly cloudy")] : c===3 ? ["☁️", L("Mendung","Overcast")] : c<=48 ? ["🌫", L("Berkabus","Fog")] : c<=67 ? ["🌧", L("Hujan","Rain")] : c<=77 ? ["🌨", L("Salji","Snow")] : c<=82 ? ["🌦", L("Hujan lebat","Showers")] : ["⛈", L("Ribut petir","Thunderstorm")]; };
function weather(){ if(WX.v && Date.now()-WX.at < 1800000) return WX.v; if(WX.busy || !H.fetch) return WX.v; WX.busy = true;
  var S0 = H.S || {}, la = S0.lat || 3.139, lo = S0.lon || 101.687;
  H.fetch("https://api.open-meteo.com/v1/forecast?latitude="+(+la).toFixed(3)+"&longitude="+(+lo).toFixed(3)+"&current=temperature_2m,weather_code&timezone=auto", function(st, body){ WX.busy = false; WX.at = Date.now();
    try{ var j = JSON.parse(body), cu = j.current; if(cu){ var w = WCODE(cu.weather_code); WX.v = {t: cu.temperature_2m, ic: w[0], d: w[1]}; } }catch(e){} });
  return WX.v; }
function groupPick(c){ var gl = H.groupList ? H.groupList() : []; if(!gl.length) return '<div class="mut tiny">'+L("Sertai atau buat Kumpulan untuk memaparkan pengumumannya di sini secara automatik.","Join or create a Group to show its announcements here automatically.")+'</div>';
  return '<label class="small">'+L("Pengumuman dari Kumpulan (dikemas kini dari telefon lain)","Announcements from a Group (updated from another phone)")+'</label><select class="rin" data-tgrp><option value="">—</option>'+gl.map(function(g){ return '<option value="'+esc(g.id)+'"'+(c.tgrp===g.id?' selected':'')+'>'+esc(g.icon+" "+g.name)+'</option>'; }).join("")+'</select>'; }

// ---------------- 0.5.18: export a picture or a short video ----------------
function drawBB(cx, W, Hh, cfg, t){ // t = seconds since start, for the video
  var bg = cfg.bg||{};
  if(bg.k==="grad" || bg.k==="anim"){ var gr = cx.createLinearGradient(0, 0, W, Hh); gr.addColorStop(0, bg.a||"#000"); gr.addColorStop(1, bg.b||"#222"); cx.fillStyle = gr; } else cx.fillStyle = bg.a||"#000";
  cx.fillRect(0, 0, W, Hh);
  if(bg.k==="img" && drawBB.img){ cx.globalAlpha = 1-(bg.dark||0)/100; cx.drawImage(drawBB.img, 0, 0, W, Hh); cx.globalAlpha = 1; }
  if((bg.k==="pat" || bg.k==="sil") && drawBB.pat){ cx.fillStyle = cx.createPattern(drawBB.pat, "repeat"); cx.fillRect(0, 0, W, Hh); }
  var lines = cfg.lines.filter(function(l){ return String(l.t).length; }), n = Math.max(1, lines.length), a = cfg.an||{};
  lines.forEach(function(l, i){ var st = lineStyle(cfg, cfg.lines.indexOf(l)), f = font(st.font), px = Math.round(Hh*(st.size/100)/n), txt = fields(String(l.t), cfg); if(st.upper) txt = txt.toUpperCase();
    cx.font = (st.italic?"italic ":"")+(st.bold?"800 ":"400 ")+px+"px "+(f[0]==="led" ? "monospace" : f[2]); cx.textBaseline = "middle";
    var tw = cx.measureText(txt).width, y = Hh*(i+0.5)/n, x;
    if(a.cont==="scrollL" || a.cont==="scrollR"){ var span = W + tw, sp = Math.max(1, +a.speed||5)*40, off = (t*sp) % span; x = a.cont==="scrollL" ? W - off : off - tw; }
    else { if(tw > W*0.94){ px = Math.floor(px*W*0.94/tw); cx.font = cx.font.replace(/\d+px/, px+"px"); tw = cx.measureText(txt).width; } x = st.align==="left" ? W*0.04 : st.align==="right" ? W*0.96-tw : (W-tw)/2; }
    if(a.cont==="scrollU" || a.cont==="scrollD"){ var sp2 = Math.max(1, +a.speed||5)*30, offY = (t*sp2) % (Hh+px*n); y = a.cont==="scrollU" ? Hh - offY + i*px*1.2 : offY - px*n + i*px*1.2; }
    var c = st.color||{}, fill = c.a||"#fff";
    if(c.k==="grad"){ var g2 = cx.createLinearGradient(x, 0, x+tw, 0); g2.addColorStop(0, c.a); g2.addColorStop(1, c.b||c.a); fill = g2; }
    else if(c.k==="rainbow"){ var g3 = cx.createLinearGradient(x, 0, x+tw, 0); ["#ff2b2b","#ffd400","#39ff14","#00e5ff","#4a6bff","#ff2bd6"].forEach(function(cc, j){ g3.addColorStop(j/5, cc); }); fill = g3; }
    if(!a.cont && a.enter && t < 1.2){ cx.globalAlpha = Math.min(1, t/1.2); }
    if(st.glow){ cx.shadowColor = c.a||"#fff"; cx.shadowBlur = px*0.35; } else if(st.shadow){ cx.shadowColor = "rgba(0,0,0,.75)"; cx.shadowBlur = px*0.12; cx.shadowOffsetX = cx.shadowOffsetY = px*0.05; }
    if(st.outline){ cx.lineWidth = px*st.outline/20; cx.strokeStyle = st.oc||"#000"; cx.strokeText(txt, x, y); }
    cx.fillStyle = fill; cx.fillText(txt, x, y); cx.shadowBlur = 0; cx.shadowOffsetX = cx.shadowOffsetY = 0; cx.globalAlpha = 1; });
}
function prepAssets(cfg, done){ var bg = cfg.bg||{}, wait = 0, fin = function(){ if(--wait <= 0) done(); }; drawBB.img = null; drawBB.pat = null;
  if(bg.k==="img" && bg.img){ wait++; var im = new Image(); im.onload = function(){ drawBB.img = im; fin(); }; im.onerror = fin; im.src = bg.img; }
  if(bg.k==="pat" || bg.k==="sil"){ wait++; var pi = new Image(); pi.onload = function(){ drawBB.pat = pi; fin(); }; pi.onerror = fin; pi.src = svgUrl(PATTERNS[bg.k==="sil" ? "stars" : (bg.pat||"geo")], bg.pc).slice(5, -2); }
  if(!wait) done(); }
function shareData(name, dataUrl, mime, text){ var b64 = dataUrl.slice(dataUrl.indexOf(",")+1);
  if(H.N.shareBinary) H.N.shareBinary(name, b64, mime, text||""); else if(mime.indexOf("image")===0 && H.N.shareImage) H.N.shareImage(dataUrl, text||""); else { var a = document.createElement("a"); a.href = dataUrl; a.download = name; document.body.appendChild(a); a.click(); a.remove(); } }
function exportSize(cfg){ return cfg.orient==="portrait" ? [720, 1280] : [1280, 720]; }
function exportPng(cfg){ var sz = exportSize(cfg), cv = document.createElement("canvas"); cv.width = sz[0]; cv.height = sz[1]; var cx = cv.getContext("2d");
  if(cfg.mode==="clk"){ drawClockStill(cx, sz[0], sz[1], cfg); shareData("paparan.png", cv.toDataURL("image/png"), "image/png", cfg.name); return; }
  loadFont(); document.fonts && document.fonts.ready ? document.fonts.ready.then(function(){ prepAssets(cfg, function(){ drawBB(cx, sz[0], sz[1], cfg, 3); shareData("papan.png", cv.toDataURL("image/png"), "image/png", cfg.name); }); }) : prepAssets(cfg, function(){ drawBB(cx, sz[0], sz[1], cfg, 3); shareData("papan.png", cv.toDataURL("image/png"), "image/png", cfg.name); }); }
function drawClockStill(cx, W, Hh, cfg){ var th = theme(cfg.theme), now = new Date(), np = nextPrayer(now), t = day(now);
  var gr = cx.createLinearGradient(0, 0, W, Hh); gr.addColorStop(0, "#04301f"); gr.addColorStop(1, "#0b1230"); cx.fillStyle = /^#/.test(th[3]) ? th[3] : gr; cx.fillRect(0, 0, W, Hh);
  cx.textAlign = "center"; cx.fillStyle = th[4]; cx.font = "700 "+Math.round(Hh*0.22)+"px "+font(th[6])[2]; cx.fillText(hm(now, (cfg.show||{}).h24), W/2, Hh*0.32);
  cx.font = Math.round(Hh*0.05)+"px sans-serif"; cx.fillText(now.toLocaleDateString(undefined, {weekday: "long", day: "numeric", month: "long", year: "numeric"}), W/2, Hh*0.44);
  cx.fillStyle = th[5]; cx.fillText(H.hijri ? H.hijri(now) : "", W/2, Hh*0.52);
  cx.font = Math.round(Hh*0.045)+"px sans-serif"; cx.fillStyle = th[4]; PKEYS.forEach(function(k, i){ var x = W*(0.14+i*0.18); cx.fillText(pName(k, now.getDay()===5), x, Hh*0.7); cx.font = "700 "+Math.round(Hh*0.06)+"px sans-serif"; cx.fillStyle = np.k===k ? th[5] : th[4]; cx.fillText(t[k] ? hm(atTime(now, t[k])).replace(/ (AM|PM)/, "") : "--", x, Hh*0.8); cx.font = Math.round(Hh*0.045)+"px sans-serif"; cx.fillStyle = th[4]; });
  cx.fillStyle = th[5]; cx.font = Math.round(Hh*0.035)+"px sans-serif"; cx.fillText("My Ihsan · Paparan", W/2, Hh*0.94); }
function exportVideo(cfg){ var sz = exportSize(cfg), cv = document.createElement("canvas"); cv.width = sz[0]; cv.height = sz[1]; var cx = cv.getContext("2d");
  if(!cv.captureStream || !window.MediaRecorder){ H.toast(L("Telefon ini tidak boleh merakam video. Simpan gambar sebagai ganti.","This phone cannot record video. Save a picture instead.")); return; }
  var mime = ["video/mp4;codecs=avc1","video/mp4","video/webm;codecs=vp9","video/webm"].filter(function(m){ try{ return MediaRecorder.isTypeSupported(m); }catch(e){ return false; } })[0];
  if(!mime){ H.toast(L("Format video tidak disokong","Video format not supported")); return; }
  var ov = H.showSheet("🎬 "+L("Merakam video","Recording video"), '<div class="small" id="dsVidS">⏺ 0 / 6 s</div>');
  loadFont(); prepAssets(cfg, function(){ var stream = cv.captureStream(30), rec = new MediaRecorder(stream, {mimeType: mime, videoBitsPerSecond: 2500000}), chunks = [], t0 = performance.now(), raf = 0;
    rec.ondataavailable = function(e){ if(e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = function(){ cancelAnimationFrame(raf); var blob = new Blob(chunks, {type: mime.split(";")[0]}), fr = new FileReader();
      fr.onload = function(){ H.closeOverlay(); shareData("papan."+(/mp4/.test(mime) ? "mp4" : "webm"), fr.result, mime.split(";")[0], cfg.name); }; fr.readAsDataURL(blob); };
    var frame = function(){ var t = (performance.now()-t0)/1000; drawBB(cx, sz[0], sz[1], cfg, t); var s2 = document.getElementById("dsVidS"); if(s2) s2.textContent = "⏺ "+Math.min(6, Math.floor(t))+" / 6 s"; if(t < 6) raf = requestAnimationFrame(frame); else rec.stop(); };
    rec.start(250); frame(); }); }

// ---------------- 0.5.18: masjid TV wizard + automatic start ----------------
function masjidWizard(){ var c = clkDefault(), iq = c.iq;
  var h = '<input id="mwN" class="rin" maxlength="60" placeholder="'+L("Nama masjid / surau","Masjid / surau name")+'">'+
    '<div class="mut tiny">'+L("Zon waktu solat ikut tetapan aplikasi (Tetapan › Lokasi & waktu).","Prayer zone follows the app setting (Settings › Location & times).")+'</div>'+
    '<div class="mut small" style="margin-top:6px">'+L("Minit dari azan ke iqamah","Minutes from azan to iqamah")+'</div>'+PKEYS.map(function(k){ return '<label class="dsSl"><span>'+pName(k)+' <b id="mwv_'+k+'">'+iq[k]+'</b></span><input type="range" min="0" max="40" value="'+iq[k]+'" data-mwi="'+k+'"></label>'; }).join("")+
    '<textarea id="mwT" class="rin" rows="2" placeholder="'+L("Pengumuman bergerak, cth. Kuliah Maghrib setiap Isnin","Rolling announcement, e.g. Kuliah Maghrib every Monday")+'"></textarea>'+
    (H.groupList && H.groupList().length ? groupPick({}) : '')+
    '<div class="mut small">'+L("Tema","Theme")+'</div><div class="dsChips">'+["nabawi","haram","ottoman","songket","kufi"].map(function(id, i){ var t = theme(id); return '<button class="chip'+(i===0?' on':'')+'" data-mwt="'+id+'">'+esc(L(t[1], t[2]))+'</button>'; }).join("")+'</div>'+
    '<label class="obChk"><input type="checkbox" id="mwL" checked> 🔒 '+L("Kunci paparan","Lock the display")+'</label>'+
    '<label class="obChk"><input type="checkbox" id="mwB" checked> ⏻ '+L("Selepas telefon hidup semula: makluman untuk mula","After the phone restarts: a notification to start")+'</label>'+
    '<label class="obChk"><input type="checkbox" id="mwC" checked> 🔌 '+L("Mula sendiri bila dicas (semasa My Ihsan dibuka)","Start by itself when charging (while My Ihsan is open)")+'</label>'+
    '<label class="obChk"><input type="checkbox" id="mwR" checked> 🔄 '+L("Mula semula setiap hari pukul 3 pagi","Fresh restart every day at 3 am")+'</label>'+
    '<button class="btn gold full g3d" id="mwGo">▶ '+L("Simpan & mula","Save & start")+'</button>';
  var ov = H.showSheet("🕌 "+L("Paparan TV masjid","Masjid TV display"), h), th = "nabawi";
  ov.querySelectorAll("[data-mwi]").forEach(function(r){ r.oninput = function(){ ov.querySelector("#mwv_"+r.getAttribute("data-mwi")).textContent = r.value; }; });
  ov.querySelectorAll("[data-mwt]").forEach(function(b){ b.onclick = function(){ th = b.getAttribute("data-mwt"); ov.querySelectorAll("[data-mwt]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  ov.querySelector("#mwGo").onclick = function(){ var nm = ov.querySelector("#mwN").value.trim() || L("Masjid","Masjid");
    Object.keys(c.show).forEach(function(k){ c.show[k] = false; }); ["clock","secs","date","hijri","prayers","syuruk","countdown","iqamah","ticker"].forEach(function(k){ c.show[k] = true; });
    c.layout = "masjid"; c.theme = th; c.name = nm; c.lock = ov.querySelector("#mwL").checked; c.chime = false; c.dim = false; c.burn = true;
    ov.querySelectorAll("[data-mwi]").forEach(function(r){ c.iq[r.getAttribute("data-mwi")] = +r.value; });
    c.ticker = L("Selamat datang ke ","Welcome to ")+nm+(ov.querySelector("#mwT").value.trim() ? " · "+ov.querySelector("#mwT").value.trim() : "");
    var tg = ov.querySelector("[data-tgrp]"); if(tg) c.tgrp = tg.value;
    var ps = presets(), id = Date.now(); ps.push({id: id, name: nm, cfg: c}); savePresets(ps);
    setAuto({id: id, name: nm, boot: ov.querySelector("#mwB").checked, charge: ov.querySelector("#mwC").checked, restart: ov.querySelector("#mwR").checked});
    H.closeOverlay(); fullscreen(c, home); };
}
function setAuto(a){ H.save("ihsan_dsauto", a); try{ if(H.N.setDisplayAuto) H.N.setDisplayAuto(JSON.stringify({id: String(a.id||""), name: a.name||"", boot: !!a.boot})); }catch(e){} }
function autoSheet(p){ var au = H.load("ihsan_dsauto", {}) || {}, mine = String(au.id)===String(p.id);
  var h = '<label class="obChk"><input type="checkbox" id="asB"'+(mine&&au.boot?' checked':'')+'> ⏻ '+L("Selepas telefon hidup semula: makluman untuk mula","After the phone restarts: a notification to start")+'</label>'+
    '<label class="obChk"><input type="checkbox" id="asC"'+(mine&&au.charge?' checked':'')+'> 🔌 '+L("Mula sendiri bila dicas (semasa My Ihsan dibuka)","Start by itself when charging (while My Ihsan is open)")+'</label>'+
    '<label class="obChk"><input type="checkbox" id="asR"'+(mine&&au.restart?' checked':'')+'> 🔄 '+L("Mula semula setiap hari pukul 3 pagi","Fresh restart every day at 3 am")+'</label>'+
    '<div class="mut tiny">'+L("Satu paparan sahaja boleh mula automatik. Android tidak membenarkan aplikasi membuka skrinnya sendiri selepas hidup semula, jadi satu ketikan pada makluman diperlukan.","Only one display can start automatically. Android does not let apps open their own screen after a restart, so one tap on the notification is needed.")+'</div><button class="btn gold full g3d" id="asOk">'+L("Simpan","Save")+'</button>';
  var ov = H.showSheet("⏻ "+esc(p.name), h);
  ov.querySelector("#asOk").onclick = function(){ var b = ov.querySelector("#asB").checked, c2 = ov.querySelector("#asC").checked, r = ov.querySelector("#asR").checked;
    if(b || c2 || r) setAuto({id: p.id, name: p.name, boot: b, charge: c2, restart: r}); else if(mine) setAuto({}); H.closeOverlay(); H.toast(L("Disimpan","Saved")); home(); }; }
function play(id){ var p = presets().filter(function(x){ return String(x.id)===String(id); })[0]; if(p){ fullscreen(p.cfg, home); return true; } return false; }
function resume(cfg){ fullscreen(cfg, home); }
// the home widget: first saved billboard's text, or the next prayer countdown
function widget(helpers){ H = helpers || H; var ps = presets(), bb = ps.filter(function(p){ return p.cfg.mode==="bb"; })[0], np = nextPrayer(new Date());
  return (bb ? '<div class="small"><b>'+esc(bb.cfg.lines.map(function(l){ return fields(l.t, bb.cfg); }).join(" · ").slice(0, 90))+'</b></div>' : '')+'<div class="small">🕌 '+pName(np.k, np.t.getDay()===5)+' '+L("dalam ","in ")+dur(np.t - new Date()).replace(/:\d\d$/, "")+'</div>'; }

window.DisplayView = {play: play, resume: resume, widget: widget, open: open, render: render, renderClock: renderClock, _t: {drawBB: drawBB, weather: weather, setAuto: setAuto, fields: fields, nextPrayer: nextPrayer, code: code, uncode: uncode, ANIMS: ANIMS, THEMES: THEMES, FONTS: FONTS, BB_TPL: BB_TPL}};
})();
