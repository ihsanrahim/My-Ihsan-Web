/* My Ihsan 0.7.93 (owner picks #16–#24): Kids games. Four banners in Learn › Kids, each a hub of games, opened full-screen:
   🌍 Bandar & negara (flags, map / globe) · 🔤 Permainan kata (10 word games in BM, English, Arabic) · 🧩 Sudoku & Kakuro · 🎒 Belajar & main (typing, times-table race, experiments, spelling bee).
   Games register in KG.reg[id] = {hub, ic, ms, en, run(host, ctx)} from kg_geo.js, kg_words.js, kg_puzzle.js, kg_learn.js.
   Progress per game in ihsan_kg {id: {...}}; stars go to the current child's Kids Planet stars (H.kidStar). */
(function(){ "use strict";
var KG = window.KG = window.KG || {reg: {}}, H = null, cur = null, stack = [];
var HUBS = {geo: ["🌍","Bandar & negara","Cities & countries","Teka bendera, peta dan glob","Flags, map and globe","linear-gradient(160deg,#36d1dc,#1b6fd8)"],
  word: ["🔤","Permainan kata","Word games","10 permainan · BM · English · عربي","10 games · BM · English · عربي","linear-gradient(160deg,#ffb347,#ff5e62)"],
  num: ["🧩","Sudoku & Kakuro","Sudoku & Kakuro","Nombor, huruf, bentuk, ikon","Numbers, letters, shapes, icons","linear-gradient(160deg,#a18cd1,#5b4bd8)"],
  learn: ["🎒","Belajar & main","Learn & play","Menaip, sifir, uji kaji, ejaan","Typing, times tables, experiments, spelling","linear-gradient(160deg,#56ab2f,#1d8f6a)"]};
var FILES = {geo: ["kids/kg_geo_data.js", "kids/kg_geo.js"], word: ["kids/kg_words.js"], num: ["kids/kg_puzzle.js"], learn: ["kids/kg_words.js", "kids/kg_learn.js"]};
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function db(){ return H.load("ihsan_kg", null) || {}; }
function get(id){ var d = db(); return d[id] || {}; }
function put(id, v){ var d = db(); d[id] = v; H.save("ihsan_kg", d); }
function lang(){ var d = db(); return d._lang || (L("ms", "en") === "en" ? "en" : "ms"); }
function setLang(l){ var d = db(); d._lang = l; H.save("ihsan_kg", d); }
function star(n){ try{ var p = H.load("ihsan_kprof", null), id = p && p.cur; if(H.kidStar && id) H.kidStar(id, n); else { var kw = H.load("ihsan_kw", {}) || {}; kw.stars = (kw.stars || 0) + n; H.save("ihsan_kw", kw); } }catch(e){} var s = document.getElementById("kgStars"); if(s){ s.textContent = "⭐ " + stars(); s.classList.remove("pop"); void s.offsetWidth; s.classList.add("pop"); } }
function stars(){ return (H.load("ihsan_kw", {}) || {}).stars || 0; }
function vib(p){ try{ if(H.N && H.N.vibrate) H.N.vibrate(p); }catch(e){} }
function rnd(n){ return Math.floor(Math.random() * n); }
function shuffle(a){ a = a.slice(); for(var i = a.length - 1; i > 0; i--){ var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function seeded(seed){ var x = seed >>> 0 || 1; return function(){ x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
function pad(n){ return (n < 10 ? "0" : "") + n; }
function today(){ var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function say(t, lg){ if(H.say) H.say(t, lg); }
function confetti(host){ var c = document.createElement("div"); c.className = "kgConf"; for(var i = 0; i < 26; i++){ var s = document.createElement("i"); s.style.left = rnd(100) + "%"; s.style.background = ["#ffd54a","#ff6b6b","#4cc9f0","#7bd389","#c77dff"][i % 5]; s.style.animationDelay = (Math.random() * .4) + "s"; c.appendChild(s); } (host || document.body).appendChild(c); setTimeout(function(){ c.remove(); }, 1800); }
var CTX = {L: L, E: E, get: get, put: put, lang: lang, setLang: setLang, star: star, vib: vib, rnd: rnd, shuffle: shuffle, seeded: seeded, today: today, say: say, confetti: confetti, pad: pad,
  toast: function(t){ H.toast(t); }, H: function(){ return H; }, back: function(){ back(); }, title: function(t){ var b = document.querySelector(".kgHead b"); if(b) b.textContent = t; }};
KG.ctx = CTX;
// language chips for word/learn games: [["ms","BM"],["en","English"],["ar","عربي"]]
CTX.langBar = function(opts, cb){ var l = lang(); if(opts.indexOf(l) < 0) l = opts[0]; var N = {ms: "BM", en: "English", ar: "عربي"};
  var d = document.createElement("div"); d.className = "kgLang"; d.innerHTML = opts.map(function(o){ return '<button class="chip' + (o === l ? " on" : "") + '" data-kl="' + o + '">' + N[o] + '</button>'; }).join("");
  d.querySelectorAll("[data-kl]").forEach(function(b){ b.onclick = function(){ setLang(b.getAttribute("data-kl")); cb(b.getAttribute("data-kl")); }; }); return {el: d, l: l}; };

function shell(title){ var ov = document.getElementById("overlay"); ov.className = "kgov";
  ov.innerHTML = '<div class="kgHead"><button class="kgBk" id="kgBk" aria-label="' + E(L("Kembali", "Back")) + '">‹</button><b>' + E(title) + '</b><span id="kgStars" class="kgSt">⭐ ' + stars() + '</span></div><div class="kgBody" id="kgB"></div>';
  ov._close = function(){ back(); }; ov.querySelector("#kgBk").onclick = function(){ back(); }; return ov.querySelector("#kgB"); }
function stop(){ if(cur && cur.stop) try{ cur.stop(); }catch(e){} cur = null; }
function back(){ stop(); if(stack.length > 1){ stack.pop(); var top = stack.pop(); go(top[0], top[1]); } else { stack = []; H.closeOverlay(); if(H.onClose) H.onClose(); } }
function hub(id){ var h = HUBS[id], games = Object.keys(KG.reg).filter(function(k){ return KG.reg[k].hub === id; }).sort(function(a, b){ return (KG.reg[a].o || 0) - (KG.reg[b].o || 0); });
  var host = shell(L(h[1], h[2])); host.innerHTML = '<div class="kgHubTop" style="background:' + h[5] + '"><span>' + h[0] + '</span><div><b>' + E(L(h[1], h[2])) + '</b><small>' + E(L(h[3], h[4])) + '</small></div></div>' +
    '<div class="kgGrid">' + games.map(function(k){ var g = KG.reg[k], p = get(k); return '<button class="kgTile" data-kg="' + k + '"><span>' + g.ic + '</span><b>' + E(L(g.ms, g.en)) + '</b>' + (p.best != null ? '<small>🏆 ' + E(p.best) + '</small>' : p.n ? '<small>✓ ' + p.n + '</small>' : '<small>' + E(L(g.dms || "", g.den || "")) + '</small>') + '</button>'; }).join("") + '</div>';
  host.querySelectorAll("[data-kg]").forEach(function(b){ b.onclick = function(){ go("game", b.getAttribute("data-kg")); }; }); }
function go(kind, id){ stop(); stack.push([kind, id]);
  if(kind === "hub"){ hub(id); return; }
  var g = KG.reg[id]; if(!g) return; var host = shell(L(g.ms, g.en)); host.classList.add("kg-" + id);
  try{ cur = g.run(host, CTX) || null; }catch(err){ console.error(err); host.innerHTML = '<div class="card">' + L("Permainan gagal dibuka", "The game could not open") + '</div>'; } }
KG.open = function(hubId, h, game){ H = h; if(!document.querySelector('link[href="kids/kg.css"]')){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "kids/kg.css"; document.head.appendChild(l); }
  var need = (FILES[hubId] || []).filter(function(f){ return !document.querySelector('script[data-kgf="' + f + '"]'); }), i = 0;
  var next = function(){ if(i >= need.length){ stack = []; go("hub", hubId); if(game) go("game", game); return; } var f = need[i++], s = document.createElement("script"); s.src = f; s.setAttribute("data-kgf", f); s.onload = next; s.onerror = function(){ H.toast(L("Gagal dimuatkan", "Could not load")); }; document.head.appendChild(s); };
  if(hubId === "geo" && !window.THREE) need.unshift("hajj/three.min.js");
  next(); };
KG.hubs = HUBS;
KG.banners = function(Lx, esc){ return '<div class="kgBans">' + Object.keys(HUBS).map(function(k){ var h = HUBS[k]; return '<button class="kgBan" data-kgh="' + k + '" style="background:' + h[5] + '"><span>' + h[0] + '</span><b>' + esc(Lx(h[1], h[2])) + '</b><small>' + esc(Lx(h[3], h[4])) + '</small></button>'; }).join("") + '</div>'; };
})();
