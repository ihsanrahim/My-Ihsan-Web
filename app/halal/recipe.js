/* Recipe builder (0.2.9, share name "My Ihsan Recipe" since 0.2.10), inside the Halal tab: Semak bahan | Resepi | Rancang | Senarai beli.
   Import from a shared link (any recipe website, TikTok, YouTube, Instagram, Facebook, Pinterest), a photo, a video or text,
   turn it into a recipe, and make it halal: every ingredient is checked against the bundled swap table (recipe_subs.js) and the
   ingredient database (halal_db.js); haram and doubtful items get the closest halal swap and the method is rewritten.
   Websites with recipe data (schema.org Recipe) work with no AI; posts, photos and videos are read by the online AI the person
   chose in the Halal tab. Recipes, the meal plan and the shopping list live in localStorage (ihsan_recipes, ihsan_rcp_plan,
   ihsan_rcp_shop), so the app backup carries them. A guide only, not a fatwa. */
(function(){
"use strict";
var H = null, SB = window.RECIPE_SUBS;
var KEY = "ihsan_recipes", PKEY = "ihsan_rcp_plan", SKEY = "ihsan_rcp_shop", CKEY = "ihsan_rcp_set";
(window.__pgNow = window.__pgNow || {}).__rcpPg = function(){ return R.page; };   // 0.6.56
var R = {page:window.__rcpPg||"list", q:"", col:"all", add:false, mode:"", imp:null, view:"H", serves:null, units:null, pw:0, editNew:null, scroll:0};
function L2(a,b){ return H.L2x(a,b); }
function esc(s){ return H.esc(s==null ? "" : String(s)); }
function tx(v){ return Array.isArray(v) ? L2(v[0], v[1]) : (v==null ? "" : String(v)); }
function AI(){ return window.HalalAI; }
// 0.5.5 folders: names kept in the settings (so an empty folder stays) plus any collection used by a recipe
function folders(){ var s = cfgS(), m = {}; (s.folders||[]).forEach(function(c){ m[c] = 1; }); all().forEach(function(r){ (r.col||[]).forEach(function(c){ m[c] = 1; }); }); return Object.keys(m).sort(function(a, b){ return a.localeCompare(b); }); }
function cfgS(){ var s = H.load(CKEY, {}) || {}; s.lang = s.lang || "orig"; s.units = s.units || "orig"; s.stt = s.stt || "auto"; return s; }
function saveS(s){ H.save(CKEY, s); }
function all(){ var l = H.load(KEY, []); return Array.isArray(l) ? l : []; }
function store(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ H.toast(L2("Storan telefon penuh. Padam beberapa resepi bergambar dahulu.","Phone storage for the app is full. Delete some recipes with photos first.")); return false; } }
function get(id){ var l = all(); for(var i=0;i<l.length;i++) if(l[i].id===id) return l[i]; return null; }
function put(r){ var l = all(), i; for(i=0;i<l.length;i++) if(l[i].id===r.id){ l[i]=r; return store(KEY, l); } l.unshift(r); return store(KEY, l); }
function del(id){ store(KEY, all().filter(function(r){ return r.id!==id; })); var p = H.load(PKEY, {}); for(var d in p) p[d] = p[d].filter(function(x){ return x!==id; }); store(PKEY, p); }
function view(){ return document.getElementById("view"); }
function go(p){ R.page = p; R.add = false; R.mode = ""; if(p.indexOf("r:")===0){ R.serves = null; R.mult = 1; R.units = null; R.view = "H"; } draw(); var v = view(); if(v) v.scrollTop = 0; }

// ---------------- quantities and units ----------------
var FRC = {"½":0.5,"⅓":1/3,"⅔":2/3,"¼":0.25,"¾":0.75,"⅛":0.125,"⅜":0.375,"⅝":0.625,"⅞":0.875,"⅕":0.2,"⅙":1/6};
var UNITS = [["cup",/^(cups?|c\.|cawan)\b/i],["tbsp",/^(tablespoons?|tbsps?\.?|tbs\.?|tbl\.?|sudu besar|camca besar|sb)\b/i],["tsp",/^(teaspoons?|tsps?\.?|sudu kecil|camca kecil|sk)\b/i],
  ["floz",/^(fl\.? ?oz\.?|fluid ounces?)\b/i],["kg",/^(kgs?|kilograms?|kilo)\b/i],["g",/^(grams?|gr\.?|gm|g)\b/i],["ml",/^(millilit(?:er|re)s?|ml)\b/i],["l",/^(lit(?:er|re)s?|l)\b/i],
  ["oz",/^(ounces?|oz\.?)\b/i],["lb",/^(pounds?|lbs?\.?)\b/i],["pinch",/^(pinch(?:es)?|secubit|cubit)\b/i],["clove",/^(cloves?|ulas)\b/i],["can",/^(cans?|tins?)\b/i],["stick",/^(sticks?)\b/i],
  ["slice",/^(slices?|keping)\b/i],["piece",/^(pieces?|pcs|biji|ketul)\b/i],["bunch",/^(bunch(?:es)?|ikat)\b/i],["sprig",/^(sprigs?|tangkai)\b/i],["handful",/^(handfuls?|genggam)\b/i],
  ["pack",/^(packets?|packs?|paket|bungkus|sachets?)\b/i],["stalk",/^(stalks?|batang)\b/i],["dash",/^(dash(?:es)?)\b/i]];
var ULAB = {cup:["cawan","cup"], tbsp:["sb","tbsp"], tsp:["sk","tsp"], floz:["fl oz","fl oz"], kg:["kg","kg"], g:["g","g"], ml:["ml","ml"], l:["liter","litre"], oz:["oz","oz"], lb:["lb","lb"],
  pinch:["secubit","pinch"], clove:["ulas","clove"], can:["tin","can"], stick:["batang","stick"], slice:["keping","slice"], piece:["biji","piece"], bunch:["ikat","bunch"], sprig:["tangkai","sprig"],
  handful:["genggam","handful"], pack:["paket","pack"], stalk:["batang","stalk"], dash:["sedikit","dash"]};
var VOL = {ml:1, l:1000, cup:240, tbsp:15, tsp:5, floz:29.57}, WT = {g:1, kg:1000, oz:28.35, lb:453.6, stick:113};
var QRX = /^\s*((?:\d+\s+\d+\/\d+)|(?:\d+\/\d+)|(?:\d+(?:[.,]\d+)?\s*[½⅓⅔¼¾⅛⅜⅝⅞])|(?:\d+(?:[.,]\d+)?)|[½⅓⅔¼¾⅛⅜⅝⅞])(?:\s*(?:-|–|to|hingga|ke)\s*((?:\d+\/\d+)|(?:\d+(?:[.,]\d+)?)|[½⅓⅔¼¾⅛⅜⅝⅞]))?\s*/;
function num(s){
  if(s==null) return null; s = String(s).trim(); if(!s) return null;
  var m;
  if((m = /^(\d+)\s+(\d+)\/(\d+)$/.exec(s))) return +m[1] + m[2]/m[3];
  if((m = /^(\d+)\/(\d+)$/.exec(s))) return m[2]>0 ? m[1]/m[2] : null;
  if((m = /^(\d+(?:[.,]\d+)?)\s*([½⅓⅔¼¾⅛⅜⅝⅞])$/.exec(s))) return parseFloat(m[1].replace(",", ".")) + FRC[m[2]];
  if(FRC[s]!=null) return FRC[s];
  if((m = /^\d+(?:[.,]\d+)?$/.exec(s))) return parseFloat(s.replace(",", "."));
  return null;
}
function unitOf(s){ s = String(s||"").trim(); if(!s) return ["",""]; for(var i=0;i<UNITS.length;i++){ var m = UNITS[i][1].exec(s); if(m && m[0].length >= s.replace(/\.$/,"").length-1) return [UNITS[i][0], s]; } return ["", s]; }
// "2 1/2 cups plain flour, sifted" -> {q:2.5, u:"cup", uw:"cups", name:"plain flour", note:"sifted"}
function parseIng(line){
  var s = String(line||"").replace(/^[\s•\-*–·▪●◦✓✔☐▢□>]+/, "").replace(/\s+/g, " ").trim(), o = {q:null, q2:null, u:"", uw:"", name:"", note:"", raw:s};
  var m = QRX.exec(s);
  if(m && m[0].trim()){ o.q = num(m[1]); o.q2 = m[2] ? num(m[2]) : null; s = s.slice(m[0].length); }
  s = s.replace(/^x\s+/i, "");
  for(var i=0;i<UNITS.length;i++){ var um = UNITS[i][1].exec(s); if(um && (o.q!=null || /^(pinch|dash)/.test(UNITS[i][0]))){ o.u = UNITS[i][0]; o.uw = um[0]; s = s.slice(um[0].length).replace(/^\s*(?:of|\.)\s*/i, " ").trim(); break; } }
  var pm = /\s*\(([^)]*)\)\s*/.exec(s), note = "";
  if(pm){ note = pm[1]; s = (s.slice(0, pm.index) + " " + s.slice(pm.index + pm[0].length)).trim(); }
  var ci = s.indexOf(",");
  if(ci > 1){ note = (s.slice(ci+1).trim() + (note ? "; "+note : "")).trim(); s = s.slice(0, ci).trim(); }
  o.name = s || o.raw; o.note = note; return o;
}
function fmtNum(n, u){
  if(n==null || isNaN(n)) return "";
  if(u==="g" || u==="ml"){ if(n>=100) return String(Math.round(n/5)*5); if(n>=10) return String(Math.round(n)); return String(Math.round(n*10)/10); }
  if(u==="kg" || u==="l") return String(Math.round(n*100)/100);
  var w = Math.floor(n + 1e-9), f = n - w, best = null, bd = 0.045;
  [[0,""],[1/8,"⅛"],[1/4,"¼"],[1/3,"⅓"],[1/2,"½"],[2/3,"⅔"],[3/4,"¾"],[1,""]].forEach(function(x){ var d = Math.abs(f - x[0]); if(d < bd){ bd = d; best = x; } });
  if(best){ if(best[0]===1) return String(w+1); if(!best[1]) return String(w || (n>0 ? "" : "0")) || "0"; return (w ? w : "") + best[1]; }
  return String(Math.round(n*10)/10);
}
function conv(q, u, mode){
  if(q==null || !u || !mode || mode==="orig") return [q, u, false];
  if(mode==="metric"){
    if(VOL[u] && u!=="tbsp" && u!=="tsp" && u!=="ml" && u!=="l"){ var ml = q*VOL[u]; return ml>=1000 ? [ml/1000, "l", true] : [ml, "ml", true]; }
    if(u==="oz" || u==="lb" || u==="stick"){ var g = q*WT[u]; return g>=1000 ? [g/1000, "kg", true] : [g, "g", true]; }
  } else if(mode==="us"){
    if(u==="ml" || u==="l"){ var m2 = q*VOL[u]; if(m2>=60) return [m2/240, "cup", true]; if(m2>=15) return [m2/15, "tbsp", true]; return [m2/5, "tsp", true]; }
    if(u==="g" || u==="kg"){ var g2 = q*WT[u]; return g2>=454 ? [g2/453.6, "lb", true] : [g2/28.35, "oz", true]; }
  }
  return [q, u, false];
}
function ulab(u, n){ var l = ULAB[u]; if(!l) return u||""; var t = L2(l[0], l[1]); if(H.S.lang==="en" && n!=null && n>1 && /^(cup|clove|can|stick|slice|piece|bunch|sprig|handful|pack|stalk|pinch)$/.test(u)) t += u==="bunch"||u==="pinch" ? "es" : "s"; return t; }
// quantity text for an ingredient (q, q2, u, uw), scaled by f, shown in the unit mode
function qtyText(q, q2, u, uw, f, mode){
  if(q==null) return "";
  var a = conv(q*f, u, mode), b = q2!=null ? conv(q2*f, u, mode) : null;
  var unit = a[2] || !uw ? ulab(a[1], a[0]) : (f!==1 && u ? ulab(u, a[0]) : uw);
  return fmtNum(a[0], a[1]) + (b ? "–" + fmtNum(b[0], b[1]) : "") + (unit ? " " + unit : "");
}

// ---------------- halal engine ----------------
var RANK = {H:0, S:1, X:2};
function matchSub(t){ t = String(t||"").toLowerCase(); var L = SB.SUBS; for(var i=0;i<L.length;i++){ var e = L[i]; if(e.rx.test(t) && !(e.not && e.not.test(t))) return e; } return null; }
function pickSw(e, t){ for(var i=0;i<e.sw.length;i++) if(!e.sw[i].when || e.sw[i].when.test(t)) return e.sw[i]; return e.sw[e.sw.length-1]; }
function swapOf(e, t){ var s = pickSw(e, t); return {name:[s.ms, s.en], s:s.s, k:s.k||1, why:e.why, src:"db", key:e.k}; }
// offline verdict for one ingredient: {st, tip, swap, key}
function offline(g){
  var t = ((g.name||"") + " " + (g.note||"")).toLowerCase(), e = matchSub(t);
  if(e){ if(e.st==="T") return {st:"H", tip:e.tip, key:e.k}; return {st:e.st, swap:swapOf(e, t), key:e.k}; }
  if(window.HalalCheck){
    var r = HalalCheck.analyse(g.name||"");
    if(r.verdict==="X" || r.verdict==="S"){
      var it = r.items.filter(function(x){ return x.st===r.verdict; })[0] || {};
      if(r.verdict==="S" && /^(Meat|Whey)/.test(it.en||"")) return {st:"H", tip:/^Meat/.test(it.en||"") ? ["Gunakan yang berlogo halal JAKIM.","Use one with a JAKIM halal logo."] : ["Pilih jenama berlogo halal.","Choose a halal-certified brand."]};
      return {st:r.verdict, swap:{name:r.verdict==="X" ? ["tinggalkan, atau guna versi berlogo halal","leave it out, or use a halal-certified version"] : ["versi berlogo halal","a halal-certified version"], s:["versi halal","halal version"], k:1, why:it.note||["",""], src:"db"}};
    }
  }
  return {st:"H"};
}
function reEsc(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
// Rewrite the method for the swaps: swapped words are replaced, alcohol-only phrases fixed. Changed steps are flagged.
function subIdx(k){ var L = SB.SUBS; for(var i=0;i<L.length;i++) if(L[i].k===k) return i; return 999; }
function rewrite(steps, list){
  list = list.slice().sort(function(a, b){ return subIdx(a.key) - subIdx(b.key); });
  return (steps||[]).map(function(st){
    if(/^§/.test(st)) return st;
    var t = st;
    list.forEach(function(x){
      var rx = x.key ? findRx(x.key) : null, rep = tx(x.swap.s || x.swap.name);
      if(rx) t = t.replace(new RegExp(rx.source, "gi"), function(m){ return /\b(cuka|vinegar)\b/i.test(m) && x.key!=="winevin" && x.key!=="balsamic" ? m : rep; });
      else if(x.name && x.name.length > 2) t = t.replace(new RegExp("\\b" + reEsc(x.name) + "\\b", "gi"), rep);
    });
    SB.STEP_FIX.forEach(function(f){ t = t.replace(f[0], function(m){ return f[1](m, L2); }); });
    return t;
  });
}
function findRx(k){ var L = SB.SUBS; for(var i=0;i<L.length;i++) if(L[i].k===k) return L[i].rx; return null; }
// Make the recipe's halal version: keeps the AI's swaps, adds or overrides from the offline rules when they are stricter.
function enforce(rec){
  var swapped = [];
  rec.ing.forEach(function(g){
    if(g.h) return;
    var o = offline(g); g.st = g.st || "H";
    if(RANK[o.st] > RANK[g.st]){ g.st = o.st; g.swap = o.swap; g.forced = true; }
    else if(g.st!=="H" && !g.swap) g.swap = o.swap || {name:["versi berlogo halal","a halal-certified version"], s:["versi halal","halal version"], k:1, why:["",""], src:"db"};
    if(g.st==="H") g.swap = null;
    if(!g.tip && o.tip) g.tip = o.tip;
    if(g.swap && o.key && !g.swap.key && g.swap.src==="db") g.swap.key = o.key;
    if(g.swap) swapped.push({name:g.name, key:g.swap.key || o.key || "", swap:g.swap});
  });
  // haram or doubtful things named only in the method ("deglaze with a splash of wine")
  rec.extra = [];
  var seen = {}; swapped.forEach(function(x){ if(x.key) seen[x.key] = 1; });
  var body = (rec.steps||[]).join("\n").toLowerCase();
  SB.SUBS.forEach(function(e){
    if(e.st==="T" || seen[e.k] || e.k==="spirit" || e.k==="blood") return;
    var m = new RegExp(e.rx.source, "i").exec(body);
    if(m && !(e.not && e.not.test(body.slice(Math.max(0, m.index-25), m.index+m[0].length+25)))){ var sw = swapOf(e, m[0]); rec.extra.push({word:m[0], st:e.st, swap:sw}); swapped.push({name:m[0], key:e.k, swap:sw}); seen[e.k] = 1; }
  });
  if(!rec.hsteps || !rec.hsteps.length || rec.hAuto){ rec.hsteps = rewrite(rec.steps, swapped); rec.hAuto = true; }
  else if(swapped.some(function(x){ return x.swap.src==="db"; })) rec.hsteps = rewrite(rec.hsteps, swapped.filter(function(x){ return x.swap.src==="db"; }));
  else rec.hsteps = rewrite(rec.hsteps, []);
  return rec;
}
function verdict(rec){
  var o = "H", nX = 0, nS = 0, tips = 0;
  rec.ing.forEach(function(g){ if(g.h) return; if(g.st==="X") nX++; else if(g.st==="S") nS++; if(g.tip) tips++; if(RANK[g.st] > RANK[o]) o = g.st; });
  (rec.extra||[]).forEach(function(x){ if(x.st==="X") nX++; else nS++; if(RANK[x.st] > RANK[o]) o = x.st; });
  return {o:o, nX:nX, nS:nS, tips:tips, n:nX+nS};
}

// ---------------- reading pages ----------------
function page(url){
  return new Promise(function(res){
    var N = H.N;
    if(N.fetchPage){ var id = "rp" + Date.now() + Math.random().toString(36).slice(2,6);
      var h = function(d){ if(d.id!==id) return; H.off("page", h); res(d); }; H.on("page", h); N.fetchPage(id, url); return; }
    fetch(url).then(function(r){ return r.text().then(function(t){ res({status:r.status, url:r.url||url, body:t}); }); }, function(e){ res({status:0, url:url, body:String(e)}); });
  });
}
function dom(html){ try{ return new DOMParser().parseFromString(html||"", "text/html"); }catch(e){ return null; } }
function meta(doc, p){ if(!doc) return ""; var m = doc.querySelector('meta[property="'+p+'"],meta[name="'+p+'"]'); return m ? (m.getAttribute("content")||"").trim() : ""; }
var DEC = null;
function dec(s){ if(s==null) return ""; if(!DEC) DEC = document.createElement("textarea"); DEC.innerHTML = String(s).replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " "); return DEC.value.replace(/[ \t ]+/g, " ").replace(/ *\n */g, "\n").trim(); }
function findLD(doc){
  if(!doc) return null; var out = null;
  var walk = function(o){
    if(!o || out) return;
    if(Array.isArray(o)){ o.forEach(walk); return; }
    if(typeof o!=="object") return;
    var t = o["@type"]; if(t==="Recipe" || (Array.isArray(t) && t.indexOf("Recipe")>=0)){ out = o; return; }
    if(o["@graph"]) walk(o["@graph"]); if(o.mainEntity) walk(o.mainEntity);
  };
  doc.querySelectorAll('script[type="application/ld+json"]').forEach(function(s){
    if(out) return; var t = s.textContent || "";
    try{ walk(JSON.parse(t)); }catch(e){ try{ walk(JSON.parse(t.replace(/[\u0000-\u001f]+/g, " "))); }catch(e2){} }
  });
  return out;
}
function isoMin(s){ var m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i.exec(String(s||"")); if(!m) return 0; return (+m[1]||0)*1440 + (+m[2]||0)*60 + (+m[3]||0); }
function firstStr(x){ if(Array.isArray(x)) x = x[0]; if(x && typeof x==="object") x = x.url || x.name || x["@id"] || ""; return x==null ? "" : String(x); }
function steps(x){
  var out = [];
  var add = function(s){ s = dec(s); if(s) s.split(/\n+/).forEach(function(p){ p = p.replace(/^\s*(?:step\s*)?\d+[.):]\s*/i, "").trim(); if(p) out.push(p); }); };
  var walk = function(o){
    if(!o) return;
    if(typeof o==="string"){ add(o); return; }
    if(Array.isArray(o)){ o.forEach(walk); return; }
    if(o["@type"]==="HowToSection" || o.itemListElement){ if(o.name) out.push("§ " + dec(o.name)); walk(o.itemListElement); return; }
    add(o.text || o.name || "");
  };
  walk(x); return out;
}
function fromLD(ld, url){
  var tags = [].concat(ld.recipeCategory||[], ld.recipeCuisine||[]).map(function(t){ return dec(t); }).filter(Boolean);
  var au = ld.author; if(Array.isArray(au)) au = au[0]; au = au && typeof au==="object" ? au.name : au;
  return {title:dec(ld.name)||"", author:dec(au||""), serves:parseInt(firstStr(ld.recipeYield).replace(/[^\d]+/g," ").trim(), 10)||0,
    prep:isoMin(ld.prepTime), cook:isoMin(ld.cookTime), total:isoMin(ld.totalTime), tags:tags.slice(0,6),
    ing:[].concat(ld.recipeIngredient||ld.ingredients||[]).map(function(s){ return parseIng(dec(s)); }).filter(function(g){ return g.name; }),
    steps:steps(ld.recipeInstructions), img:firstStr(ld.image), nut:nutOf(ld.nutrition), nutSrc:"web", src:{kind:"web", url:url}};
}
function readable(doc){
  if(!doc || !doc.body) return "";
  doc.querySelectorAll("script,style,noscript,svg,nav,header,footer,aside,form,iframe,button").forEach(function(n){ n.remove(); });
  var root = doc.querySelector("article") || doc.querySelector("main") || doc.body;
  root.querySelectorAll("p,li,h1,h2,h3,h4,h5,br,div,tr,section").forEach(function(n){ n.appendChild(doc.createTextNode("\n")); });
  return (root.textContent||"").replace(/[ \t ]+/g, " ").replace(/ *\n[\n ]*/g, "\n").trim().slice(0, 14000);
}
function host(u){ var m = /^https?:\/\/(?:www\.|m\.)?([^\/?#]+)/i.exec(u||""); return m ? m[1].toLowerCase() : ""; }
function kindOf(u){
  var h = host(u);
  if(/(^|\.)tiktok\.com$/.test(h)) return "tiktok";
  if(/(^|\.)(youtube\.com|youtu\.be)$/.test(h)) return "youtube";
  if(/(^|\.)(instagram\.com|instagr\.am)$/.test(h)) return "instagram";
  if(/(^|\.)(facebook\.com|fb\.watch|fb\.com)$/.test(h)) return "facebook";
  if(/(^|\.)(pinterest\.[a-z.]+|pin\.it)$/.test(h)) return "pinterest";
  return "web";
}
var KIND = {tiktok:["🎵","TikTok"], youtube:["▶️","YouTube"], instagram:["📸","Instagram"], facebook:["📘","Facebook"], pinterest:["📌","Pinterest"], web:["🌐","Web"], image:["🖼️","Gambar|Photo"], video:["🎬","Video|Video"], text:["⌨️","Teks|Text"]};
function kindName(k){ var x = KIND[k] || KIND.web, n = x[1].split("|"); return x[0] + " " + L2(n[0], n[1]||n[0]); }
// any link in the shared text: full links first, then bare ones like "www.site.com/x" or "vt.tiktok.com/x"
function firstUrl(t){ t = String(t||""); var m = /https?:\/\/[^\s<>"'\]]+/i.exec(t);
  if(!m) m = /\b(?:www\.[\w-]+(?:\.[\w-]+)+|[\w-]+(?:\.[\w-]+)*\.(?:com|my|net|org|co|io|app|me|tv|id|sg|uk|au|be|it|gl|ly|ee|cc)(?:\.[a-z]{2})?)\/[^\s<>"'\]]*/i.exec(t);
  if(!m) return ""; var u = m[0].replace(/[),.;!?]+$/, ""); return /^https?:/i.test(u) ? u : "https://"+u; }
function ingLike(t){ return String(t||"").split(/\n/).filter(function(l){ return /^\s*[-•*▪●]?\s*(\d|[½¼¾⅓⅔⅛])/.test(l) || /\b(cups?|tbsp|tsp|grams?|ml|cawan|sudu)\b/i.test(l); }).length; }
function igCaption(d){ var m = /^[\d,.\sKkMmJjRrBb]+(?:likes?|suka)[^:]*?:\s*["“]?([\s\S]*?)["”]?\.?\s*$/i.exec(d||""); return m ? m[1] : (d||""); }

// ---------------- 0.2.11: the post's own video ----------------
// Video file links in a page (Facebook playable_url/sd_src, Instagram video_url/video_versions, TikTok playAddr, og:video, <video src>).
function videoUrls(html){
  var out = [], b = String(html||"");
  var add = function(u, raw){ if(!u) return; if(raw){ try{ u = JSON.parse('"'+u+'"'); }catch(e){ return; } } u = u.replace(/&amp;/g, "&");
    if(!/^https?:\/\//i.test(u) || /\.(m3u8|mpd)(\?|$)/i.test(u) || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(u)) return; if(out.indexOf(u)<0) out.push(u); };
  ["browser_native_sd_url","playable_url","sd_src_no_ratelimit","sd_src","browser_native_hd_url","playable_url_quality_hd","hd_src","video_url","downloadAddr","playAddr","contentUrl"].forEach(function(k){
    var re = new RegExp('"'+k+'"\\s*:\\s*"((?:[^"\\\\]|\\\\.)+)"', "g"), m; while((m = re.exec(b)) && out.length < 8) add(m[1], true); });
  var re2 = /"video_versions"\s*:\s*\[\s*\{[^\]]*?"url"\s*:\s*"((?:[^"\\]|\\.)+)"/g, m2; while((m2 = re2.exec(b))) add(m2[1], true);
  var re3 = /<meta[^>]+(?:property|name)=["'](?:og:video(?::secure_url|:url)?|twitter:player:stream)["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:video(?::secure_url|:url)?|twitter:player:stream)["']/gi, m3;
  while((m3 = re3.exec(b))) add(m3[1]||m3[2]);
  var re4 = /<video[^>]+src=["']([^"']+)["']/gi, m4; while((m4 = re4.exec(b))) add(m4[1]);
  return out.slice(0, 5);
}
// Download the first video that works and take its frames + sound (Android only). Resolves the parts or null.
function watch(urls, ref){
  var N = H.N; if(!N.fetchVideo || !urls || !urls.length){ if(N.fetchVideo) note(L2("Tiada pautan video pada halaman ini (perlu log masuk?)","No video link on this page (sign-in needed?)"), false); return Promise.resolve(null); }
  busy(L2("Memuat turun video untuk ditonton dan didengar…","Downloading the video to watch and listen to it…"));
  var i = 0;
  return new Promise(function(res){
    var next = function(){ if(i >= urls.length){ res(null); return; }
      var id = "v" + Date.now() + "_" + i, u = urls[i++];
      var h = function(d){ if(d.id!==id) return; H.off("vid", h);
        if(d.err || (!(d.frames||[]).length && !d.audio)){ note(L2("Video ","Video ")+i+L2(" tidak dapat dimuat turun: "," could not be downloaded: ")+(d.err||L2("tiada gambar atau bunyi","no pictures or sound")), false); next(); return; }
        timerAdd(Math.min(60000, (d.audioSec||0)*300));
        note(L2("Video dimuat turun: ","Video downloaded: ")+Math.round((d.dur||0)/1000)+" s, "+(d.frames||[]).length+L2(" gambar, bunyi "," pictures, sound ")+(d.audio ? (d.audioSec||"?")+" s" : L2("tiada","none"))); res(d); };
      H.on("vid", h); N.fetchVideo(id, u, ref||""); };
    next();
  });
}

// ---------------- import ----------------
// 0.2.14: every import keeps a step log, shown while it works and in the error card ("Copy details" for a report)
var LOG = [];
function logReset(){ LOG = []; }
function logStep(m, st){ LOG.forEach(function(x){ if(x.s==="run") x.s = "ok"; }); LOG.push({m:m, s:st||"run", t:Date.now()}); if(LOG.length > 40) LOG.shift(); }
function note(m, good){ var run = null; LOG.forEach(function(x){ if(x.s==="run") run = x; }); var e = {m:m, s:good===false ? "warn" : "info", t:Date.now()}; if(run){ LOG.splice(LOG.indexOf(run)+1, 0, e); } else LOG.push(e); }
function logHtml(){ if(!LOG.length) return ""; var ic = {run:"⏳", ok:"✅", info:"·", warn:"⚠️", x:"❌"};
  return '<ol class="rlog">'+LOG.map(function(x){ return '<li class="'+x.s+'"><span>'+ic[x.s]+'</span><span>'+esc(x.m)+'</span></li>'; }).join("")+'</ol>'; }
// 0.3.2: countdown + bar while importing. The estimate is learned per kind of source (how long it really took on this phone),
// plus 10 s of headroom; when the recipe is ready early the bar jumps to the end. Over time it says "almost done" and counts up.
var EST = {offline:2000, web:9000, text:15000, image:25000, tiktok:45000, instagram:50000, facebook:50000, youtube:35000, pinterest:15000, video:55000, ai:22000};
var TM = null;
function estOf(kind){ var a = (cfgS().avg||{})[kind]; return a ? a : (EST[kind] || 30000); }
function timerStart(kind){ if(kind==="ai_resume") kind = "ai"; TM = {kind:kind, t0:Date.now(), est:estOf(kind)+10000}; }
function timerAdd(ms){ if(TM) TM.est += ms; }
function timerLearn(){ if(!TM) return; var s = cfgS(), took = Date.now()-TM.t0; s.avg = s.avg || {}; var a = s.avg[TM.kind]; s.avg[TM.kind] = Math.round(a ? a*0.6 + took*0.4 : took); saveS(s); }
function mmss(ms){ var x = Math.max(0, Math.round(ms/1000)); return Math.floor(x/60)+":"+("0"+(x%60)).slice(-2); }
function timerHtml(){ if(!TM) return ""; return '<div class="rtm"><div class="rtmn"><b id="rtmV">'+mmss(TM.est)+'</b><span id="rtmL">'+L2("anggaran masa lagi","estimated time left")+'</span></div><div class="rtmb"><i id="rtmB" style="width:0%"></i></div><div class="mut tiny" id="rtmE"></div></div>'; }
function timerTick(){
  if(!TM) return; var v = document.getElementById("rtmV"), b = document.getElementById("rtmB"), l = document.getElementById("rtmL"), e = document.getElementById("rtmE"); if(!v) return;
  var el = Date.now()-TM.t0, left = TM.est-el;
  if(TM.done){ v.textContent = "0:00"; b.style.width = "100%"; l.textContent = L2("siap!","done!"); return; }
  if(left > 0){ v.textContent = mmss(left); l.textContent = L2("anggaran masa lagi","estimated time left"); b.style.width = Math.min(95, el*100/TM.est).toFixed(1)+"%"; b.parentNode.classList.remove("over"); }
  else { v.textContent = "+"+mmss(-left); l.textContent = L2("hampir siap… lebih masa daripada biasa","almost done… taking longer than usual"); b.style.width = "96%"; b.parentNode.classList.add("over"); }
  if(e) e.textContent = L2("Masa berlalu ","Elapsed ")+mmss(el);
}
setInterval(timerTick, 250);
function busy(msg){ logStep(msg); if(!TM) timerStart("ai_resume"); R.imp = {busy:true, msg:msg}; draw(); timerTick(); }
function needAI(src){ var e = new Error("needai"); e.needAI = true; e.src = src; return e; }
function viaAI(src){ if(!AI().ready()) return Promise.reject(needAI(src)); var via = R.useFree ? "Pollinations" : (window.AIRun ? AIRun.label("recipe") : AI().chatProvider()[1]);
  busy(L2("AI menyusun resepi dan menyemak halal (","The AI is building the recipe and checking it is halal (")+via+")…"); note(L2("Dihantar: ","Sent: ")+Math.round((src.text||"").length/100)/10+L2(" ribu aksara teks"," thousand characters of text")+((src.images||[]).length ? ", "+src.images.length+L2(" gambar"," pictures") : "")); return aiRecipe(src); }
function start(inp){
  if(R.imp && R.imp.busy){ H.toast(L2("Tunggu, resepi sebelum ini masih diproses","Please wait, the last recipe is still being read")); return; }
  R.page = "list"; R.add = false; R.mode = ""; logReset(); R.last = inp;
  var u0 = inp.url || firstUrl(inp.text||"");
  timerStart(inp.kind==="video" ? "video" : inp.kind==="images" ? "image" : u0 ? kindOf(u0) : (AI().ready() ? "text" : "offline"));
  busy(L2("Membaca…","Reading…"));
  var v = view(); if(v) v.scrollTop = 0;
  var p;
  try{
    if(inp.kind==="video") p = fromVideo(inp);
    else if(inp.kind==="images") p = viaAI({kind:"image", text:(inp.text ? "Text shared with the photos:\n"+inp.text+"\n\n" : "")+"Recipe photo(s), screenshot(s) or cookbook page(s) are attached in order.", images:inp.images.slice(0,6), thumb:inp.images[0]});
    else { var u = inp.url || firstUrl(inp.text); p = u ? fromUrl(u, (inp.text||"").replace(u, "").trim()) : fromText(inp.text||"", inp.subject||""); }
  }catch(e){ p = Promise.reject(e); }
  p.then(finish, fail);
}
function fail(e){
  TM = null;
  LOG.forEach(function(x){ if(x.s==="run") x.s = "x"; });
  if(e && e.needAI){ R.imp = {need:"ai", src:e.src}; draw(); return; }
  if(e && e.needWeb){ R.imp = {need:"web", url:e.url, kind:e.kind, extra:e.extra||""}; draw(); return; }
  R.imp = {err:String(e && e.message || e), src:e && e.src, detail:e && e.detail || "", account:e && e.account || ""}; draw();
}
function fromUrl(u, extra){
  var k = kindOf(u);
  busy(L2("Membuka ","Opening ")+kindName(k)+"…");
  if(k==="tiktok") return tiktok(u, extra);
  if(k==="youtube") return youtube(u, extra);
  if(k==="instagram" || k==="facebook") return social(u, k, extra);
  if(k==="pinterest") return pinterest(u, extra);
  return web(u, extra, null);
}
function web(u, extra, srcKind){
  return page(u).then(function(r){
    if(!r.status || r.status>=400){ var e = new Error(L2("Laman tidak dapat dibuka (","The page could not be opened (")+(r.status||L2("tiada sambungan","no connection"))+L2("). Cuba buka dan baca dalam aplikasi.","). Try opening and reading it in the app.")); e.needWeb = true; e.url = u; e.kind = "web"; e.extra = extra; throw e; }
    var doc = dom(r.body), ld = findLD(doc), fu = r.url || u;
    if(ld){ var rec = fromLD(ld, fu); if(rec.ing.length){ rec.src.site = host(fu); if(srcKind) rec.src = srcKind; return rec; } }
    var title = meta(doc, "og:title") || (doc && doc.title) || "", img = meta(doc, "og:image");
    var text = readable(doc);
    if(text.length < 80 && !extra){ var e2 = new Error(L2("Tiada resepi ditemui di laman ini.","No recipe was found on this page.")); throw e2; }
    return viaAI({kind:srcKind ? srcKind.kind : "web", url:fu, title:title, img:img, text:"Web page: "+fu+"\nTitle: "+title+"\n\nPage text:\n"+text+(extra ? "\n\nShared text:\n"+extra : "")});
  });
}
function tiktok(u, extra){
  return page(u).then(function(r){
    var fu = r.url && kindOf(r.url)==="tiktok" ? r.url.split("?")[0] : u;
    return page("https://www.tiktok.com/oembed?url="+encodeURIComponent(fu)).then(function(o){
      var j = {}; try{ j = JSON.parse(o.body||"{}"); }catch(e){}
      var doc = dom(r.body), cap = j.title || meta(doc, "og:description") || meta(doc, "description") || "";
      var au = j.author_unique_id || j.author_name || "";
      return watch(videoUrls(r.body), fu).then(function(v){
      if(v) return fromVideo({frames:v.frames, dur:v.dur, audio:v.audio, audioSec:v.audioSec, from:"TikTok video"+(au ? " by @"+au : ""), text:(cap ? "Caption:\n"+cap : "")+(extra ? "\n\nShared text:\n"+extra : ""), src:{kind:"tiktok", url:fu, author:au ? "@"+String(au).replace(/^@/,"") : "", img:j.thumbnail_url||""}});
      if(cap.length < 15 && !extra){ var e = new Error(L2("Kapsyen TikTok tidak dapat dibaca.","The TikTok caption could not be read.")); e.needWeb = true; e.url = fu; e.kind = "tiktok"; e.extra = extra; throw e; }
      return viaAI({kind:"tiktok", url:fu, author:au ? "@"+String(au).replace(/^@/,"") : "", img:j.thumbnail_url||meta(doc,"og:image"), video:true,
        text:"TikTok video"+(au ? " by @"+au : "")+"\nCaption:\n"+cap+(extra ? "\n\nShared text:\n"+extra : "")});
      });
    });
  });
}
function ytId(u){ var m = /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/live\/|\/embed\/)([\w-]{11})/.exec(u||""); return m ? m[1] : ""; }
function jstr(body, key){ var m = new RegExp('"'+key+'":"((?:[^"\\\\]|\\\\.)*)"').exec(body||""); if(!m) return ""; try{ return JSON.parse('"'+m[1]+'"'); }catch(e){ return ""; } }
function youtube(u, extra){
  var id = ytId(u); if(!id) return web(u, extra, null);
  var wu = "https://www.youtube.com/watch?v="+id;
  return page(wu+"&hl=en").then(function(r){
    var b = r.body||"", doc = dom(b);
    var title = jstr(b, "title") || meta(doc, "og:title"), desc = jstr(b, "shortDescription") || meta(doc, "og:description"), au = jstr(b, "author") || jstr(b, "ownerChannelName");
    var src = {kind:"youtube", url:wu, author:au}, img = "https://i.ytimg.com/vi/"+id+"/hqdefault.jpg";
    // a recipe link in the description is the best source: use its recipe data when it has some
    var links = (desc.match(/https?:\/\/[^\s)]+/g)||[]).filter(function(l){ var k = kindOf(l); return k==="web" && !/(amzn|amazon|patreon|bit\.ly\/merch|linktr\.ee|spotify|apple\.co|shop|store|discord|twitter|x\.com|threads)/i.test(l); });
    var tryLink = links.length && ingLike(desc) < 3 ? page(links[0]).then(function(p){ var ld = findLD(dom(p.body)); return ld ? fromLD(ld, p.url||links[0]) : null; }, function(){ return null; }) : Promise.resolve(null);
    return tryLink.then(function(rec){
      if(rec && rec.ing.length){ rec.src = {kind:"youtube", url:wu, author:au, site:host(links[0]), link:links[0]}; if(!rec.img) rec.img = img; return rec; }
      busy(L2("Membaca sari kata video…","Reading the video captions…"));
      return captions(b).then(function(cap){
        note(L2("Tajuk: ","Title: ")+(title||"—")+" · "+L2("huraian ","description ")+desc.length+L2(" aksara · sari kata "," chars · captions ")+cap.length+L2(" aksara"," chars"), (desc+cap).length > 40);
        // 0.2.15: YouTube's public still frames of the video (taken at about 25%, 50% and 75%) + the cover, so the AI can see the cooking
        busy(L2("Mengambil gambar daripada video…","Getting pictures from the video…"));
        return ytFrames(id).then(function(fr){
          note(fr.length+L2(" gambar daripada video"," pictures from the video"), fr.length > 0);
          return viaAI({kind:"youtube", url:wu, author:au, title:title, img:img, video:true, images:fr, thumb:fr[0]||"",
            text:"YouTube video: "+title+(au ? " by "+au : "")+(fr.length ? "\n"+fr.length+" still pictures from the video are attached (cover first, then frames in time order): use what they show." : "")+"\nDescription:\n"+desc+(cap ? "\n\nCaptions (what is said in the video):\n"+cap : "")+(extra ? "\n\nShared text:\n"+extra : "")});
        });
      });
    });
  });
}
// public YouTube thumbnails as data URLs (the app reads them on the phone; providers that cannot fetch links still get them)
function ytFrames(id){
  var N = H.N, names = ["hqdefault","hq1","hq2","hq3"];
  if(!N.fetchImage) return Promise.resolve([]);
  return Promise.all(names.map(function(n){ return new Promise(function(res){
    var rid = "yi"+Date.now()+n, h = function(d){ if(d.id!==rid) return; H.off("img", h); res(d.data||""); };
    H.on("img", h); N.fetchImage(rid, "https://i.ytimg.com/vi/"+id+"/"+n+".jpg"); }); })).then(function(l){ return l.filter(Boolean); });
}
// 0.5.29: a picture from the web as a data URL, read on the phone (Facebook / Instagram picture links expire and refuse other apps)
function fetchData(url){ var N = H.N; if(!url || !N.fetchImage || !/^https?:/.test(url)) return Promise.resolve("");
  return new Promise(function(res){ var rid = "ri"+Date.now()+Math.random().toString(36).slice(2, 6), done = false, h = function(d){ if(d.id!==rid || done) return; done = true; H.off("img", h); res(d.data||""); };
    H.on("img", h); N.fetchImage(rid, url); setTimeout(function(){ if(!done){ done = true; H.off("img", h); res(""); } }, 15000); }); }
// the best picture a social page offers, even without og:image (Facebook often hides it from apps)
// 0.5.50: also video thumbnails in the page data and video posters; the Facebook logo (rsrc.php / static.xx.fbcdn) is never used
function badImg(u){ return !u || /rsrc\.php|static\.xx\.fbcdn|\/images\/logos?\//.test(u); }
function pageImg(doc, body){ var m = [meta(doc, "og:image"), meta(doc, "twitter:image"), meta(doc, "og:image:url")].filter(function(x){ return x && !badImg(x); })[0]; if(m) return m;
  var pv = doc && doc.querySelector ? doc.querySelector("video[poster]") : null; if(pv && /^https?:/.test(pv.getAttribute("poster")||"") && !badImg(pv.getAttribute("poster"))) return pv.getAttribute("poster");
  var b = String(body||""), x = /"(?:preferred_thumbnail|thumbnailImage|first_frame_thumbnail|image)"\s*:\s*\{[^{}]*?"uri"\s*:\s*"(https:[^"]+)"/.exec(b) || /"(?:thumbnailUrl|thumbnail_url|thumbnailImageUrl)"\s*:\s*"(https:[^"]+)"/.exec(b) || /(https:\\?\/\\?\/scontent[^"'\s]+?\.(?:jpg|jpeg|png|webp)[^"'\s]*)/.exec(b);
  if(!x) return ""; try{ return JSON.parse('"'+x[1].replace(/"/g, '\\"')+'"').replace(/&amp;/g, "&"); }catch(e){ return x[1].replace(/\\\//g, "/").replace(/&amp;/g, "&"); } }
function captions(b){
  var m = /"captionTracks":(\[[^\]]*\])/.exec(b||""), tr = null;
  try{ var l = JSON.parse(m[1]); tr = l.filter(function(t){ return /^(en|ms|id)/.test(t.languageCode); })[0] || l[0]; }catch(e){}
  if(!tr || !tr.baseUrl) return Promise.resolve("");
  return page(tr.baseUrl.replace(/\\u0026/g, "&")+"&fmt=json3").then(function(r){
    try{ var j = JSON.parse(r.body); return (j.events||[]).map(function(e){ return (e.segs||[]).map(function(s){ return s.utf8||""; }).join(""); }).join(" ").replace(/\s+/g, " ").slice(0, 12000); }catch(e){ return ""; }
  }, function(){ return ""; });
}
function social(u, k, extra){
  return page(u).then(function(r){
    var doc = dom(r.body), d = meta(doc, "og:description") || meta(doc, "description"), t = meta(doc, "og:title"), img = pageImg(doc, r.body);
    note(L2("Halaman dibuka: HTTP ","Page opened: HTTP ")+(r.status||"—")+" · "+host(r.url||u)+" · "+L2("kapsyen ","caption ")+(d||"").length+L2(" aksara"," chars")+" · "+videoUrls(r.body).length+L2(" pautan video"," video links"), !!r.status && r.status < 400);
    var cap = k==="instagram" ? igCaption(d) : d;
    var fu = r.url && kindOf(r.url)===k ? r.url : u;
    var name = k==="instagram" ? "Instagram post" : "Facebook post";
    return watch(videoUrls(r.body), fu).then(function(v){
      if(v) return fromVideo({frames:v.frames, dur:v.dur, audio:v.audio, audioSec:v.audioSec, from:name, text:(cap && cap.length > 15 ? "Caption:\n"+cap : "")+(extra ? "\n\nShared text:\n"+extra : ""), src:{kind:k, url:fu, title:t, img:img}});
      if((cap||"").length < 60 && (extra||"").length < 60){ var e = new Error(""); e.needWeb = true; e.url = fu; e.kind = k; e.extra = extra; throw e; }
      return viaAI({kind:k, url:fu, title:t, img:img, video:/\/(reel|reels|watch|videos?|share\/[rv])\//.test(fu), text:name+"\nTitle: "+t+"\nCaption:\n"+cap+(extra ? "\n\nShared text:\n"+extra : "")});
    });
  });
}
function pinterest(u, extra){
  return page(u).then(function(r){
    var b = r.body||"", doc = dom(b), ld = findLD(doc);
    if(ld){ var rec = fromLD(ld, r.url||u); if(rec.ing.length){ rec.src = {kind:"pinterest", url:r.url||u}; return rec; } }
    var m = /"link":"(https?:[^"]+)"/.exec(b), link = "";
    if(m){ try{ link = JSON.parse('"'+m[1]+'"'); }catch(e){} }
    if(link && kindOf(link)==="web" && !/pinterest\./.test(link)) return web(link, extra, {kind:"pinterest", url:r.url||u, site:host(link), link:link});
    if(link && kindOf(link)!=="web" && kindOf(link)!=="pinterest") return fromUrl(link, extra);
    var d = meta(doc, "og:description") || meta(doc, "description");
    return viaAI({kind:"pinterest", url:r.url||u, title:meta(doc,"og:title"), img:meta(doc,"og:image"), text:"Pinterest pin\nTitle: "+meta(doc,"og:title")+"\nDescription:\n"+d+(extra ? "\n\nShared text:\n"+extra : "")});
  });
}
// in-app browser: the person can sign in (Instagram, Facebook) and send the page text back
function readWeb(url, kind, extra){
  var N = H.N;
  if(!N.readWeb){ if(N.openUrl) N.openUrl(url); else window.open(url); R.mode = "paste"; draw(); return; }
  var id = "rw" + Date.now(), h = function(d){
    if(d.id!==id) return; H.off("webtext", h);
    if(d.cancel){ return; }
    var j = {}; try{ j = typeof d.data==="string" ? JSON.parse(d.data) : (d.data||{}); }catch(e){}
    var doc = dom("<html><head></head><body></body></html>"), ld = null;
    (j.ld||[]).forEach(function(s){ if(ld) return; var sc = doc.createElement("script"); sc.type = "application/ld+json"; sc.textContent = s; doc.head.appendChild(sc); });
    ld = findLD(doc);
    var fu = j.url || d.url || url, k = kindOf(fu)==="web" ? (kind||"web") : kindOf(fu);
    if(ld){ var rec = fromLD(ld, fu); if(rec.ing.length){ rec.src.kind = k; finish(rec); return; } }
    var cap = k==="instagram" ? igCaption(j.d||"") : (j.d||"");
    var body = String(j.body||"").slice(0, 14000);
    var vids = (j.v||[]).filter(function(x){ return /^https?:/.test(x); }).concat(videoUrls(j.html||"")).filter(function(x, i, a){ return a.indexOf(x)===i; }).slice(0, 5);
    // 0.5.50: Facebook hides og:image from the in-app page, so the picture comes from the playing video's frame, its poster, the page data or the largest picture
    var fr0 = /^data:image\//.test(j.f||"") ? j.f : "", im0 = [j.i, (j.p||[])[0]].filter(function(x){ return x && !badImg(x); })[0] || pageImg(dom(j.html||""), j.html||"") || (badImg(j.im) ? "" : (j.im||""));
    watch(vids, fu).then(function(v){
      if(v) return fromVideo({frames:v.frames, dur:v.dur, audio:v.audio, audioSec:v.audioSec, from:kindName(k).replace(/^\S+ /,"")+" post", text:(cap ? "Post text:\n"+cap+"\n\n" : "")+"Visible page text (may include comments):\n"+body.slice(0, 5000)+(extra ? "\n\nShared text:\n"+extra : ""), src:{kind:k, url:fu, title:j.t||"", img:im0, thumb:fr0}});
      R.imp = null;
      return viaAI({kind:k, url:fu, title:j.t||"", img:im0, thumb:fr0, video:k!=="web", text:"Page: "+fu+"\nTitle: "+(j.t||"")+(cap ? "\nPost text:\n"+cap : "")+"\n\nVisible page text:\n"+body+(extra ? "\n\nShared text:\n"+extra : "")});
    }).then(finish, fail);
  };
  H.on("webtext", h);
  N.readWeb(id, url, kindName(kind||kindOf(url)), L2("✓ Guna hantaran ini (video & teks)","✓ Use this post (video & text)"));
}
function fromText(text, subject){
  text = String(text||"").trim();
  if(text.length < 20){ return Promise.reject(new Error(L2("Teks terlalu pendek untuk dijadikan resepi.","The text is too short to make a recipe."))); }
  if(AI().ready()) return viaAI({kind:"text", title:subject, text:"Recipe text:\n"+(subject ? subject+"\n" : "")+text});
  return Promise.resolve(offlineText(text, subject));
}
// No AI: split typed or pasted text into ingredients and steps using the usual headings.
function offlineText(text, subject){
  var lines = text.split(/\n/).map(function(l){ return l.trim(); }).filter(Boolean), ing = [], st = [], title = subject || "", mode = "";
  var IH = /^(ingredients?|bahan(?:-bahan)?|bahan(?:an)?|ramuan)\b[\s:]*$/i, MH = /^(method|directions?|instructions?|steps?|preparation|cara(?:\s+\w+)?|langkah(?:-langkah)?)\b[\s:]*$/i;
  var hasHead = lines.some(function(l){ return IH.test(l); });
  lines.forEach(function(l, i){
    if(IH.test(l)){ mode = "i"; return; } if(MH.test(l)){ mode = "s"; return; }
    if(!title && i===0 && l.length < 80 && !QRX.test(l)){ title = l; return; }
    if(hasHead){ if(mode==="i"){ if(/:$/.test(l) && l.length < 40) ing.push({h:l.replace(/:$/,"")}); else ing.push(parseIng(l)); } else if(mode==="s") st.push(l.replace(/^\s*(?:step\s*)?\d+[.):]\s*/i, "")); return; }
    var looks = (QRX.test(l) && l.length < 90) || /^[-•*▪●]\s/.test(l) && l.length < 60;
    if(looks && !/^\d+[.)]\s/.test(l)) ing.push(parseIng(l)); else st.push(l.replace(/^\s*(?:step\s*)?\d+[.):]\s*/i, ""));
  });
  return {title:title || L2("Resepi tanpa nama","Untitled recipe"), ing:ing, steps:st, src:{kind:"text"}, review:true, missing:L2("Disusun tanpa AI: semak ramuan dan langkah.","Sorted without the AI: check the ingredients and steps.")};
}
// ---------------- video ----------------
// 0.2.11: who listens to the video's sound, in order. Whisper (Groq/OpenAI) takes the WAV file; Gemini and the free
// Pollinations "openai-audio" model take it inside a chat message. "auto" tries each one that is set up, then the free one.
function sttList(){
  var s = cfgS(), k = AI().cfg().keys || {}, mode = s.stt;
  var W = function(n){
    if(n==="groq" && k.groq) return {kind:"w", url:"https://api.groq.com/openai/v1/audio/transcriptions", key:k.groq, model:"whisper-large-v3-turbo", name:"Groq Whisper"};
    if(n==="openai" && k.openai) return {kind:"w", url:"https://api.openai.com/v1/audio/transcriptions", key:k.openai, model:"gpt-4o-mini-transcribe", name:"OpenAI"};
    if(n==="gemini" && k.gemini) return {kind:"c", url:"https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", key:k.gemini, model:AI().bestModel("gemini"), name:"Gemini", max:600};
    if(n==="free") return {kind:"c", url:"https://text.pollinations.ai/openai", key:"", model:"openai-audio", name:L2("percuma","free"), max:180};
    return null; };
  if(mode==="off") return [];
  if(mode!=="auto") return [W(mode), mode!=="free" ? W("free") : null].filter(Boolean);
  return ["groq","gemini","openai","free"].map(W).filter(Boolean);
}
function listenOnce(c, path){
  var N = H.N;
  return new Promise(function(res){
    var id = "au" + Date.now() + Math.random().toString(36).slice(2,5), h = function(d){ if(d.id!==id) return; H.off("post", h);
      if(d.status>=200 && d.status<300){ try{ var j = JSON.parse(d.body), t = c.kind==="w" ? j.text : (j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : ""); if(Array.isArray(t)) t = t.map(function(p){ return p.text||""; }).join(""); res({text:String(t||"").trim().slice(0, 12000)}); }catch(e){ res({text:"", err:c.name+": ?"}); } }
      else res({text:"", err:c.name+": "+AI().errMsg(d, L2)}); };
    H.on("post", h);
    if(c.kind==="w") N.postAudio(id, c.url, c.key, path, c.model);
    else N.postAudioChat(id, c.url, c.key, path, c.model, "Transcribe all the speech in this audio exactly, in the language it is spoken. Reply with the transcript only. If there is no speech, reply with nothing.", c.max);
  });
}
function transcribe(path){
  var L = sttList(), N = H.N, errs = [], i = 0;
  if(!path || !N.postAudio) return Promise.resolve({text:"", skipped:"noaudio"});
  if(!L.length) return Promise.resolve({text:"", skipped:"off"});
  return new Promise(function(res){
    var next = function(){ if(i >= L.length){ res({text:"", err:errs.join(" · ")}); return; }
      var c = L[i++]; busy(L2("Mendengar suara dalam video (","Listening to the video's speech (")+c.name+")…");
      listenOnce(c, path).then(function(r){ if(r.text && r.text.length > 3){ note(L2("Didengar oleh ","Heard by ")+c.name+": "+r.text.split(/\s+/).length+L2(" patah perkataan"," words")); res({text:r.text, by:c.name}); return; } note(c.name+": "+(r.err||L2("tiada suara","no speech")), false); if(r.err) errs.push(r.err); next(); }); };
    next();
  });
}
// A video (shared file, picked file, or downloaded from a post): watch the frames, listen to the speech, then the AI
// works out the recipe from everything together, estimating amounts that are only shown or implied.
function fromVideo(inp){
  var fr = (inp.frames||[]).slice(0, 6), src = inp.src || {kind:"video"};
  if(!fr.length && !inp.audio && !inp.text) return Promise.reject(new Error(L2("Video tidak dapat dibaca.","The video could not be read.")));
  if(!AI().ready()) return Promise.reject(needAI({retry:function(){ return fromVideo(inp); }}));
  return transcribe(inp.audio).then(function(t){
    var note = t.text ? "" : t.skipped==="noaudio" ? (inp.audio===undefined ? "" : L2("Video ini tiada suara; resepi dibaca daripada gambar video dan teks.","This video has no sound; the recipe was read from its pictures and text.")) : t.skipped==="off" ? L2("Mendengar video ditutup dalam Tetapan resepi.","Listening to videos is off in Recipe settings.")
      : L2("Suara video tidak dapat didengar (perkhidmatan percuma mungkin sibuk). Tambah kunci percuma Groq atau Gemini dalam Tetapan › AI supaya ia sentiasa didengar. ","The video's speech could not be heard (the free service may be busy). Add a free Groq or Gemini key in Settings › AI so it is always heard. ")+(t.err ? "("+t.err+")" : "");
    var text = (inp.from || "A cooking video")+(inp.dur ? " ("+Math.round(inp.dur/1000)+" s)" : "")+(src.url ? "\nLink: "+src.url : "")+"\n"+
      (fr.length ? fr.length+" frames from the video are attached in time order: read the on-screen text and watch what is added, how much, and in what order.\n" : "")+
      (inp.text ? "\n"+inp.text+"\n" : "")+(t.text ? "\nWhat is said in the video (automatic transcript):\n"+t.text+"\n" : "")+
      "\nWork out the full recipe from the frames, the speech and the text together. If nothing is said or written, work it out from what the frames show (the dish, what is added and in what order). When an amount is neither said nor shown, estimate a sensible amount for this dish, write 'estimated' in that ingredient's note, and mention it in missing.";
    return viaAI({kind:src.kind||"video", url:src.url||"", author:src.author||"", title:src.title||inp.subject||"", img:src.img||"", text:text, images:fr, thumb:fr[Math.floor(fr.length/2)]||src.thumb||"", note:note, heard:t.by||""});
  });
}
// Web preview / in-app pick fallback: grab frames from a local video file with a <video> element.
function framesFromFile(file){
  return new Promise(function(res, rej){
    var v = document.createElement("video"), url = URL.createObjectURL(file), out = [], times = [], i = 0;
    v.muted = true; v.preload = "auto"; v.src = url;
    v.onloadedmetadata = function(){ var d = v.duration || 0, n = d < 20 ? 4 : 6; for(var k=0;k<n;k++) times.push(d*(k+0.5)/n); next(); };
    v.onerror = function(){ rej(new Error(L2("Video tidak dapat dibuka.","The video could not be opened."))); };
    v.onseeked = function(){ var s = Math.min(1, 720/Math.max(v.videoWidth, v.videoHeight)), c = document.createElement("canvas"); c.width = Math.round(v.videoWidth*s); c.height = Math.round(v.videoHeight*s); c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); try{ out.push(c.toDataURL("image/jpeg", 0.72)); }catch(e){} next(); };
    function next(){ if(i >= times.length){ URL.revokeObjectURL(url); res({kind:"video", frames:out, dur:(v.duration||0)*1000}); return; } v.currentTime = times[i++]; }
  });
}

// ---------------- AI ----------------
function prompt(){
  var s = cfgS(), en = H.S.lang==="en";
  var lang = s.lang==="ms" ? "Write all text in Bahasa Melayu (Malaysian Malay)." : s.lang==="en" ? "Write all text in English." : "Write all text in the language of the source; if it mixes languages, use "+(en ? "English" : "Bahasa Melayu (Malaysian Malay)")+".";
  return "You turn food posts, video transcripts, video frames, web pages and recipe photos into one clean recipe, and make it halal for Muslims in Malaysia, following JAKIM practice and the Shafi'i school. "+
  "Use only what the sources show or say. Never invent ingredients, amounts or steps. If an amount is not given, leave qty empty. Read on-screen text in the images. Merge the caption, the spoken words and the frames into one recipe without repeating items. Ignore hashtags, greetings and adverts. "+
  "Halal status of each ingredient: haram = pork and anything from pigs (bacon, ham, lard, pork gelatine), blood, animals not eaten in the Shafi'i school (frog, land snail, crocodile, turtle), and every alcoholic drink or cooking alcohol (wine, beer, rum, brandy, mirin, sake, Shaoxing wine, liqueur), even when it is 'cooked off'. "+
  "syubhah = depends on the source: gelatine, vanilla extract and other alcohol-based extracts, wine vinegar, balsamic, cheeses made with animal rennet (parmesan, pecorino, gruyere), marshmallows, sausages of unknown meat. "+
  "halal = everything else. Meat, poultry, stock and cheese are halal when bought halal-certified: say so in tip. "+
  "For every haram or syubhah ingredient give the closest halal swap that keeps the taste and texture, with qty and unit for the same servings, and a short why. Prefer a halal-certified version of the same thing where one exists (halal gelatine, halal beef bacon, halal beef chorizo, halal mirin-style seasoning); otherwise a natural substitute (grape juice + stock for wine, rice vinegar + sugar for mirin, ghee for lard, agar-agar for gelatine, sparkling water for beer in batter). Never suggest non-alcoholic beer or wine, or 'rum flavour'. "+
  "nutrition = your estimate per serving for the halal version. "+
  "halal_steps = the full method rewritten for the swaps; change the cooking where needed (no flambe, add oil when there is no bacon fat, boil agar-agar, no 'until the alcohol cooks off'). If nothing changes, repeat the steps. "+
  "Reply with ONLY one JSON object, no markdown: {\"is_recipe\":true,\"title\":\"\",\"author\":\"\",\"serves\":0,\"prep_min\":0,\"cook_min\":0,\"cuisine\":\"\",\"tags\":[\"\"],"+
  "\"ingredients\":[{\"group\":\"section name or empty\",\"qty\":\"number or fraction or empty\",\"unit\":\"\",\"name\":\"\",\"note\":\"preparation, e.g. finely chopped\",\"status\":\"halal|haram|syubhah\",\"tip\":\"\",\"swap\":null}],"+
  "\"steps\":[\"\"],\"halal_steps\":[\"\"],\"summary\":\"one sentence: what was changed to make it halal, or that nothing needed changing\",\"nutrition\":{\"kcal\":0,\"protein_g\":0,\"carbs_g\":0,\"fat_g\":0,\"fiber_g\":0},\"missing\":\"what is unclear or missing (e.g. amounts were not given), or empty\"}. "+
  "For a swapped ingredient, swap = {\"qty\":\"\",\"unit\":\"\",\"name\":\"\",\"why\":\"at most 15 words\"}. If the sources hold no recipe, reply {\"is_recipe\":false,\"missing\":\"why\"}. "+
  lang+" This is a guide only, not a fatwa: never call it a fatwa.";
}
function aiRecipe(src){
  var content = [{type:"text", text:src.text.slice(0, 24000)}];
  (src.images||[]).forEach(function(im){ content.push({type:"image_url", image_url:{url:im}}); });
  var free = R.useFree; R.useFree = false;
  return AI().complete([{role:"system", content:prompt()}, {role:"user", content:content}], 4000, L2, free ? "pollinations" : "", "recipe").then(function(r){
    var j = parseJson(r.text);
    if(!j){ var e = new Error(L2("Jawapan AI tidak lengkap. Cuba lagi.","The AI reply was incomplete. Try again.")); e.src = src; throw e; }
    if(j.is_recipe===false || !(j.ingredients||[]).length){
      // 0.2.15: a video that shows the cooking without saying it (music only, little caption): identify the dish from the title and
      // pictures and write its usual recipe, clearly marked as worked out, rather than giving up.
      if(!src.recon && ((src.images||[]).length || (src.title||"").length > 3)){
        note(L2("Tiada resepi bertulis: AI mengenal pasti hidangan daripada tajuk dan gambar","No written recipe: the AI works out the dish from the title and pictures"), false);
        var s2 = {}; for(var k in src) s2[k] = src[k]; s2.recon = true;
        s2.text = src.text+"\n\nRECONSTRUCT: the sources do not spell out the recipe. This overrides the rule against inventing: identify the dish from the title, the pictures and any text, list the ingredients you can see being used first, then any usual ones for this dish, with sensible amounts, and write the method as the pictures and title suggest. Put 'estimated' in each ingredient note whose amount you estimated, and set missing to say the recipe was worked out from the video.";
        busy(L2("AI mengenal pasti hidangan daripada video…","The AI is working out the dish from the video…"));
        return aiRecipe(s2);
      }
      var e2 = new Error(L2("Tiada resepi ditemui. ","No recipe was found. ")+(j.missing||"")); e2.src = src; e2.noRecipe = true; throw e2; }
    if(src.images && src.images.length && !r.vision) src.note = (src.note ? src.note+" " : "")+L2("Model AI ini tidak membaca gambar, jadi hanya teks digunakan.","This AI model cannot read images, so only the text was used.");
    if(r.fixedModel) H.toast(r.fixedWhy==="limit" ? L2("Had percuma "+r.firstModel+" telah dicapai; ","The free limit of "+r.firstModel+" was reached; ")+L2("guna ","used ")+r.model : L2("Nama model tidak dikenali; guna ","The model name was not recognised; used ")+r.model);
    return fromAI(j, src, r);
  }, function(e){ if(e && !e.src) e.src = src; throw e; });
}
function parseJson(t){
  t = String(t||"").replace(/```(?:json)?/g, ""); var a = t.indexOf("{"), b = t.lastIndexOf("}"); if(a<0 || b<a) return null;
  var s = t.slice(a, b+1); try{ return JSON.parse(s); }catch(e){ try{ return JSON.parse(s.replace(/,\s*([}\]])/g, "$1")); }catch(e2){ return null; } }
}
function stOf(s){ s = String(s||"").toLowerCase(); return s.indexOf("haram")===0 ? "X" : (s.indexOf("syub")===0 || s.indexOf("doubt")===0 || s.indexOf("mash")===0 || s.indexOf("mush")===0) ? "S" : "H"; }
function fromAI(j, src, r){
  var lastG = null, ing = [];
  (j.ingredients||[]).forEach(function(x){
    if(!x || !(x.name||"").trim()) return;
    var g = String(x.group||"").trim(); if(g && g!==lastG){ ing.push({h:g}); } lastG = g;
    var qs = String(x.qty==null ? "" : x.qty).trim(), q = null, q2 = null, rm = /^(.+?)\s*(?:-|–|to)\s*(.+)$/.exec(qs);
    if(rm && num(rm[1])!=null){ q = num(rm[1]); q2 = num(rm[2]); } else q = num(qs);
    var u = unitOf(x.unit), it = {q:q, q2:q2, u:u[0], uw:u[1], name:String(x.name).trim(), note:String(x.note||"").trim(), st:stOf(x.status), tip:String(x.tip||"").trim()||null, raw:[qs, x.unit, x.name].join(" ").replace(/\s+/g, " ").trim()};
    if(it.st!=="H" && x.swap && (x.swap.name||"").trim()){ var su = unitOf(x.swap.unit); it.swap = {name:String(x.swap.name).trim(), s:String(x.swap.name).trim(), q:num(x.swap.qty), u:su[0]||su[1], uw:su[1], why:String(x.swap.why||"").trim(), src:"ai"}; if(it.swap.q==null) it.swap.k = 1; }
    if(qs && q==null && !it.note) it.note = qs;
    ing.push(it);
  });
  var clean = function(a){ return (a||[]).map(function(s){ return String(s||"").replace(/^\s*(?:step\s*)?\d+[.):]\s*/i, "").trim(); }).filter(Boolean); };
  return {title:String(j.title||src.title||"").trim() || L2("Resepi tanpa nama","Untitled recipe"), author:String(j.author||src.author||"").trim(), serves:parseInt(j.serves,10)||0,
    prep:parseInt(j.prep_min,10)||0, cook:parseInt(j.cook_min,10)||0, cuisine:String(j.cuisine||""), tags:(j.tags||[]).filter(Boolean).slice(0,6),
    ing:ing, steps:clean(j.steps), hsteps:clean(j.halal_steps), hAuto:false, summary:String(j.summary||""),
    missing:[src.recon ? L2("Resepi ini dikenal pasti oleh AI daripada video (tiada resepi bertulis); sukatan ialah anggaran. Bandingkan dengan video.","This recipe was worked out by the AI from the video (no written recipe); amounts are estimates. Compare it with the video.") : "", String(j.missing||"").trim(), src.note||""].filter(Boolean).join(" "), review:!!(j.missing && String(j.missing).trim()) || !!src.note || !!src.recon,
    nut:nutOf(j.nutrition), img:src.img||"", thumb:src.thumb||"", src:{kind:src.kind, url:src.url||"", author:src.author||"", video:!!src.video && !src.heard && !(src.images||[]).length}, ai:{p:r.provider, m:r.model, heard:src.heard||""}};
}
function nutOf(n){ if(!n || typeof n!=="object") return null; var g = function(v){ var x = parseFloat(String(v==null ? "" : v).replace(",", ".")); return isNaN(x) || x<=0 ? 0 : Math.round(x); };
  var o = {kcal:g(n.kcal||n.calories), p:g(n.protein_g||n.proteinContent||n.protein), c:g(n.carbs_g||n.carbohydrateContent||n.carbs), f:g(n.fat_g||n.fatContent||n.fat), fb:g(n.fiber_g||n.fiberContent||n.fiber)};
  return o.kcal || o.p || o.c ? o : null; }
function thumb(dataUrl, max){
  return new Promise(function(res){
    if(!dataUrl || dataUrl.indexOf("data:")!==0){ res(""); return; }
    var im = new Image(); im.onload = function(){ var k = Math.min(1, (max||360)/Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(im.naturalWidth*k); c.height = Math.round(im.naturalHeight*k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); try{ res(c.toDataURL("image/jpeg", 0.7)); }catch(e){ res(""); } };
    im.onerror = function(){ res(""); }; im.src = dataUrl;
  });
}
function finish(rec){
  // keep the picture inside the recipe: a web picture is read now and stored (small), so it still shows after the link expires
  var keep = rec.thumb ? Promise.resolve(rec.thumb) : (rec.img && /^https?:/.test(rec.img) ? fetchData(rec.img) : Promise.resolve(""));
  return keep.then(function(d){ return thumb(d, 360); }).then(function(t){
    delete rec.thumb; if(t) rec.img = t;
    rec.id = rec.id || ("r" + Date.now().toString(36)); rec.t = rec.t || Date.now(); rec.col = rec.col || []; rec.src = rec.src || {kind:"text"};
    if(rec.src.kind!=="web" && rec.src.kind!=="text" && !rec.src.url) rec.src.url = "";
    if(rec.src.video && rec.src.kind!=="video" && /amount|sukatan|quantit|jumlah/i.test(rec.missing||"")) rec.missing += " " + L2("Petua: dalam aplikasi itu tekan Kongsi → Simpan video, kemudian kongsi fail video ke My Ihsan Recipe supaya sukatan yang disebut atau dipaparkan turut dibaca.","Tip: in that app tap Share → Save video, then share the saved video to My Ihsan Recipe so amounts that are spoken or shown are read too.");
    if(!rec.ing.some(function(g){ return !g.h && g.q!=null; })) rec.review = true;
    enforce(rec);
    if(!put(rec)){ R.imp = null; draw(); return; }
    timerLearn(); if(TM){ TM.done = true; timerTick(); } var t1 = TM ? 350 : 0; TM = null;
    setTimeout(function(){ R.imp = null; logReset(); H.toast(L2("Resepi disimpan","Recipe saved")); go("r:" + rec.id); }, t1);
  });
}

// 0.2.14: a plain-text report for "Copy details" (no keys or personal data)
function report(m){
  var c = AI().cfg(), info = {}; try{ info = JSON.parse(H.N.info ? H.N.info() : "{}"); }catch(e){}
  var src = R.last || {}, u = src.url || firstUrl(src.text||"") || "";
  return ["My Ihsan "+(info.version||"")+" · Android SDK "+(info.sdk||"?")+" · "+(info.model||""), L2("Laporan import resepi","Recipe import report")+" · "+new Date().toISOString().slice(0,16).replace("T"," "),
    L2("Sumber: ","Source: ")+(src.kind||"")+(u ? " · "+u.replace(/[?#].*$/,"") : "")+(src.frames ? " · "+src.frames.length+" frames" : ""),
    "AI: "+AI().chatProvider()[1]+" · "+AI().modelOf(c)+(AI().ready() ? "" : " (off)")+" · "+L2("Dengar: ","Listening: ")+cfgS().stt,
    "", L2("Langkah:","Steps:")].concat(LOG.map(function(x){ return ({run:"…", ok:"✓", info:"·", warn:"!", x:"✗"})[x.s]+" "+x.m; }))
    .concat(["", L2("Ralat: ","Error: ")+(m.err||""), m.detail ? "Detail: "+m.detail : ""]).join("\n").trim();
}
// "Use my ChatGPT / Gemini app": the person's own subscription in that app does the reading; the answer comes back by copy-paste.
function appPrompt(src, video){
  return prompt()+"\n\n"+(video ? "The cooking video is attached: watch it and listen to it carefully.\n" : "")+
    ((src.images||[]).length && !video ? "A picture from the post is attached.\n" : "")+(src.url ? "Video / post link (open it if you can watch it): "+src.url+"\n" : "")+"SOURCE:\n"+String(src.text||"").slice(0, 7000)+"\n\nReply with the JSON object only, so it can be copied in one go.";
}
function appSheet(src){
  var A = AI().APPS.filter(function(x){ return /ChatGPT|Gemini|Claude|Copilot|Grok|DeepSeek|Perplexity|Le Chat/.test(x[0]); });
  var ov = H.showSheet("📲 "+L2("Guna aplikasi AI saya","Use my AI app"), '<div class="small mut" style="margin-bottom:10px;line-height:1.45">'+
    L2("Video (jika ada) dan arahan dihantar ke aplikasi itu. Langganan anda di sana yang membaca resepi; tiada kunci API diperlukan. Gemini dan ChatGPT boleh menonton video.","The video (if there is one) and the instructions go to that app. Your subscription there reads the recipe; no API key is needed. Gemini and ChatGPT can watch videos.")+
    '</div><div class="rpd">'+A.map(function(x, i){ return '<button class="chip" data-app2="'+i+'">'+esc(x[0])+'</button>'; }).join("")+'<button class="chip" data-app2="-1">'+L2("Lain…","Other…")+'</button></div>');
  ov.querySelectorAll("[data-app2]").forEach(function(b){ b.onclick = function(){ var i = +b.getAttribute("data-app2"), x = A[i] || ["AI","",""]; H.closeOverlay(); sendToApp({name:i<0 ? L2("aplikasi AI","the AI app") : x[0], pkg:x[1], url:x[2]}, src); }; });
}
function sendToApp(app, src){
  var N = H.N, video = !!(N.hasRecipeVideo && N.hasRecipeVideo() && (src.video || (src.images||[]).length > 1)), p = appPrompt(src, video);
  if(N.copyText) N.copyText(p); else { try{ navigator.clipboard.writeText(p); }catch(e){} }
  if(video && N.shareVideoTo) N.shareVideoTo(app.pkg, p);
  else if(N.shareTo) N.shareTo(app.pkg, (src.images||[])[0] || "", p);
  else if(app.url) window.open(app.url);
  logStep(L2("Dihantar ke ","Sent to ")+app.name+(video ? L2(" bersama video"," with the video") : ""), "info");
  R.imp = {need:"app", app:app, src:src, video:video}; draw();
}
function useAppAnswer(t, m){
  t = String(t||"").trim(); if(t.length < 20){ H.toast(L2("Jawapan terlalu pendek. Salin jawapan penuh.","The answer is too short. Copy the whole answer.")); return; }
  var j = parseJson(t), src = m.src || {};
  if(j && j.is_recipe!==false && (j.ingredients||[]).length){ finish(fromAI(j, src, {provider:m.app.name, model:L2("aplikasi","app"), vision:true})); return; }
  var rec = offlineText(t.replace(/[*#`]+/g, ""), src.title||""); rec.src = {kind:src.kind||"text", url:src.url||""}; rec.ai = {p:m.app.name, m:L2("aplikasi","app")};
  if(!rec.ing.length){ H.toast(L2("Resepi tidak ditemui dalam jawapan itu.","No recipe was found in that answer.")); return; }
  finish(rec);
}

// ---------------- screens ----------------
function tabs(){
  var p = R.page.split(":")[0], on = function(k){ return (k==="list" ? (p==="list"||p==="r"||p==="edit") : p===k) ? " on" : ""; };
  // 0.5.4 (Ihsan): Resepi first (the default page), Semak at the far right
  // 0.5.69: the recipe row is the level-3 dock at the bottom, just above the level-2 bar
  // 0.7.96 (owner): label under the icon; pages unticked in the left bar (Suite › Halal) are left out
  var T = [["list","🍲","Resepi","Recipes"],["kal","🥗","Kalori","Calories"],["plan","🍱","Rancang","Plan"],["shop","🛒","Beli","Shop"],["check","🔍","Semak","Check"]].filter(function(x){ return !window.l3On || window.l3On("alat/halal/"+x[0]) || on(x[0]); });
  return '<div class="dock rtabs"><div class="lfNav" style="grid-template-columns:repeat('+T.length+',minmax(0,1fr))">'+T.map(function(x){ return '<button data-rtab="'+x[0]+'" class="'+on(x[0]).trim()+'"><span>'+x[1]+'</span>'+L2(x[2],x[3])+'</button>'; }).join("")+'</div></div>';
}
var PGS = ["list","kal","plan","shop","check"];   // 0.7.90: Kalori second
function pgIdx(){ var p = R.page; if(p.indexOf("r:")===0 || p.indexOf("edit:")===0) return -1; var i = PGS.indexOf(p); return i<0 ? 0 : i; }
function openPg(t){ if(t==="check"){ R.page = "check"; H.appRender(); var v = view(); if(v) v.scrollTop = 0; return; } go(t); }
function bindTabs(el){ el.querySelectorAll("[data-rtab]").forEach(function(b){ b.onclick = function(){ openPg(b.getAttribute("data-rtab")); }; }); swipePg(el); if(window.IBH && IBH.dockFix) IBH.dockFix(); if(window.ibChips) setTimeout(window.ibChips, 30); }
/** 0.5.4: swipe left / right (and the ◀ ▶ arrows at the bottom) between Resepi, Rancang, Beli and Semak */
function swipePg(el){
  if(!window.IbSwipe) return; var w = el.querySelector(".rcp");
  if(!w){ w = document.createElement("div"); w.className = "rcpck"; [].slice.call(el.childNodes).forEach(function(c){ if(!(c.classList && c.classList.contains("rtabs"))) w.appendChild(c); }); el.appendChild(w); }
  IbSwipe(w, {can:function(s){ var i = pgIdx(); return i>=0 && (s<0 ? i<PGS.length-1 : i>0); }, go:function(s){ var i = pgIdx(); openPg(PGS[i+(s<0 ? 1 : -1)]); var n = view() && view().querySelector(".rcp, .rcpck"); if(n && window.IbSwipe) IbSwipe.inFrom(n, s); }});
}
function draw(){
  var el = view(); if(!el || !el.querySelector(".rtabs")) return;
  if(R.page==="check"){ H.appRender(); return; }
  render(el);
}
// 0.5.29: recipes saved before with a web picture link (Facebook / Instagram links expire): read the picture once and keep it inside
var fixT = 0; function fixImgs(){ if(fixT) return; fixT = 1; var l = all().filter(function(r){ return r.img && /^https?:/.test(r.img) && !r.imgTried; }).slice(0, 6);
  l.reduce(function(pr, r){ return pr.then(function(){ return fetchData(r.img).then(function(d){ return thumb(d, 360); }).then(function(t){ var x = get(r.id); if(!x) return; x.imgTried = 1; if(t) x.img = t; put(x); if(t) draw(); }); }); }, Promise.resolve()); }
function render(el){
  if(!fixT) setTimeout(fixImgs, 1500);
  var p = R.page, body = "";
  if(p.indexOf("r:")===0){ var r = get(p.slice(2)); body = r ? detailHtml(r) : listHtml(); if(!r) R.page = "list"; }
  else if(p.indexOf("edit:")===0) body = editHtml(p.slice(5)==="new" ? null : get(p.slice(5)));
  else if(p==="plan") body = planHtml();
  else if(p==="shop") body = shopHtml();
  else if(p==="kal") body = window.Kalori ? Kalori.html(H) : "";
  else body = listHtml();
  el.innerHTML = tabs() + '<div class="rcp">'+body+'</div>';
  bindTabs(el); if(p==="kal"){ if(window.Kalori) Kalori.bind(el, H, function(){ render(el); }); } else bindAll(el);
}
function impHtml(){
  var m = R.imp; if(!m) return "";
  if(m.busy) return '<div class="card rimp">'+(window.AIRun?'<div class="aiBtnRow">'+AIRun.btn("recipe")+'</div>':'')+timerHtml()+'<div class="hbusy"><div class="hspin"></div><div>'+esc(m.msg)+'</div></div>'+(window.AIRun?AIRun.card("recipe"):'')+logHtml()+'<div class="mut tiny" style="text-align:center">'+L2("Biasanya 10–60 saat. Jangan tutup aplikasi.","Usually 10–60 seconds. Keep the app open.")+'</div></div>';
  if(m.need==="app") return '<div class="card rimp"><h3>📲 '+esc(m.app.name)+'</h3><div class="small" style="line-height:1.5">'+
    L2("1. Dalam "+m.app.name+", hantar mesej yang telah diisi"+(m.video ? " bersama video" : "")+" (jika kosong, tampal: arahan sudah disalin).<br>2. Apabila jawapan siap, tekan <b>Salin</b> pada jawapan itu.<br>3. Kembali ke sini dan tekan <b>Tampal jawapan</b>.","1. In "+m.app.name+", send the message that was filled in"+(m.video ? " with the video" : "")+" (if it is empty, paste: the instructions were copied).<br>2. When the answer is ready, tap <b>Copy</b> on it.<br>3. Come back here and tap <b>Paste the answer</b>.")+
    '</div><button class="btn gold full" data-ri="apppaste" style="margin-top:10px">📋 '+L2("Tampal jawapan","Paste the answer")+'</button><textarea id="rAppAns" class="htxt" rows="3" style="margin-top:8px" placeholder="'+L2("…atau tampal jawapan di sini","…or paste the answer here")+'"></textarea>'+
    '<div class="btns" style="margin-top:8px"><button class="btn" data-ri="appgo">'+L2("Guna jawapan ini","Use this answer")+'</button><button class="btn alt" data-ri="appagain">↗ '+L2("Buka semula aplikasi","Open the app again")+'</button><button class="btn alt" data-ri="close">'+L2("Batal","Cancel")+'</button></div>'+
    '<div class="mut tiny" style="margin-top:8px;line-height:1.4">'+L2("Ini menggunakan langganan anda sendiri dalam aplikasi itu; tiada kunci API diperlukan. My Ihsan kemudian menyemak halal dan menukar bahan di dalam telefon.","This uses your own subscription in that app; no API key is needed. My Ihsan then checks halal and swaps ingredients on the phone.")+'</div></div>';
  if(m.need==="ai") return '<div class="card rimp"><h3>✨ '+L2("Perlukan AI dalam talian","Needs the online AI")+'</h3><div class="small mut" style="line-height:1.45">'+
    L2("Hantaran media sosial, gambar dan video dibaca oleh AI dalam talian yang dipilih dalam tab Semak bahan. Pilihan lalai percuma dan tanpa kunci. Teks dan gambar dihantar kepada penyedia AI. Laman resepi biasa tidak memerlukan AI.","Social posts, photos and videos are read by the online AI chosen in the Check tab. The default choice is free with no key. The text and pictures are sent to the AI provider. Ordinary recipe websites do not need the AI.")+
    '</div><button class="btn gold full" data-ri="aion" style="margin-top:10px">✨ '+L2("Hidupkan AI percuma dan teruskan","Turn on the free AI and continue")+'</button><div class="btns" style="margin-top:8px">'+(m.src && !m.src.retry ? '<button class="btn alt" data-ri="app">📲 '+L2("Guna aplikasi ChatGPT / Gemini saya","Use my ChatGPT / Gemini app")+'</button>' : '')+'<button class="btn alt" data-ri="aiset">⚙ '+L2("Pilih penyedia lain","Choose another provider")+'</button><button class="btn alt" data-ri="close">'+L2("Batal","Cancel")+'</button></div></div>';
  if(m.need==="web"){
    var nm = kindName(m.kind);
    return '<div class="card rimp"><h3>'+esc(nm)+'</h3><div class="small mut" style="line-height:1.45">'+
      (m.kind==="instagram" || m.kind==="facebook" ? L2("Video dan teks hantaran ini hanya dapat dibaca selepas log masuk. Buka dalam pelayar aplikasi, log masuk sekali (jika diminta), main video sebentar, kemudian tekan \"Guna hantaran ini\": aplikasi akan menonton dan mendengar video itu. Atau tampal kapsyen di bawah.","This post's video and text can only be read after signing in. Open it in the app's browser, sign in once (if asked), play the video for a moment, then tap \"Use this post\": the app will watch and listen to the video. Or paste the caption below.")
        : L2("Halaman ini tidak dapat dibaca terus. Buka dalam pelayar aplikasi dan tekan \"Guna hantaran ini\", atau tampal teksnya di bawah.","This page could not be read directly. Open it in the app's browser and tap \"Use this post\", or paste its text below."))+
      '</div><button class="btn gold full" data-ri="web" style="margin-top:10px">🌐 '+L2("Buka & baca dalam aplikasi","Open & read in the app")+'</button>'+
      '<textarea id="rPasteCap" class="htxt" rows="4" style="margin-top:10px" placeholder="'+L2("Tampal kapsyen atau resepi di sini","Paste the caption or recipe here")+'"></textarea><div class="btns" style="margin-top:8px"><button class="btn" data-ri="capgo">'+L2("Guna teks ini","Use this text")+'</button><button class="btn alt" data-ri="close">'+L2("Batal","Cancel")+'</button></div></div>';
  }
  if(m.err!=null) return '<div class="card rimp"><h3>⚠ '+L2("Tidak berjaya","Did not work")+'</h3><div class="small" style="line-height:1.45">'+esc(m.err)+'</div>'+
    (LOG.length ? '<details class="rlogd"'+(LOG.length < 9 ? ' open' : '')+'><summary>'+L2("Apa yang berlaku","What happened")+'</summary>'+logHtml()+'</details>' : '')+
    (m.src ? '<button class="btn gold full" data-ri="app" style="margin-top:10px">📲 '+L2("Guna aplikasi ChatGPT / Gemini saya (langganan)","Use my ChatGPT / Gemini app (subscription)")+'</button>' : '')+
    '<div class="btns" style="margin-top:10px">'+(m.src ? '<button class="btn" data-ri="retry">'+L2("Cuba lagi","Try again")+'</button>' : '')+(m.src && /had|limit|sibuk|busy|AI|kredit|credit/i.test(m.err) && AI().cfg().prov!=="pollinations" ? '<button class="btn alt" data-ri="free">✨ '+L2("Cuba dengan AI percuma","Try with the free AI")+'</button>' : '')+(/AI|model|kunci|key|had|limit/i.test(m.err) ? '<button class="btn alt" data-ri="aiset">⚙ '+L2("Tetapan AI","AI settings")+'</button>' : '')+'<button class="btn alt" data-ri="paste">⌨️ '+L2("Tampal teks","Paste text")+'</button><button class="btn alt" data-ri="copy">📋 '+L2("Salin butiran","Copy details")+'</button><button class="btn alt" data-ri="close">'+L2("Tutup","Close")+'</button></div></div>';
  return "";
}
function addHtml(){
  var opt = function(k, ic, ms, en){ return '<button class="hOpt" data-radd="'+k+'"><span>'+ic+'</span>'+L2(ms, en)+'</button>'; };
  // 0.5.99 (owner): Add a recipe sits right under the title and is smaller; the long how-to text hides itself once there are recipes (ⓘ shows it)
  var many = all().length > 0, info = R.info || !many;
  var h = '<div class="card hhero rhero rhero2"><div class="hhTop"><div class="hhIc">🍲</div><div class="rhT"><div class="rhRow"><b>'+L2("Pembina resepi halal","Halal recipe builder")+'</b>'+(many ? '<button class="rInfo'+(info ? ' on' : '')+'" data-ra="info" aria-label="'+L2("Cara guna","How it works")+'">ⓘ</button>' : '')+'</div>'+
    '<button class="btn gold g3d rAddS" data-ra="add">'+(R.add ? '▲ ' : '➕ ')+L2("Tambah resepi","Add a recipe")+'</button>'+(info ? '<div class="mut rhD">' : '<div class="mut rhD" hidden>')+
    L2("Dari TikTok, Instagram, YouTube, Facebook, Pinterest atau mana-mana laman resepi: tekan Kongsi › My Ihsan Recipe. Resepi disusun, bahan haram atau syubhah ditukar kepada pilihan halal yang paling hampir, dan cara memasak ditulis semula.","From TikTok, Instagram, YouTube, Facebook, Pinterest or any recipe website: tap Share › My Ihsan Recipe. The recipe is laid out, haram or doubtful ingredients are swapped for the closest halal choice, and the method is rewritten.")+
    '</div></div></div>'+
    '<div class="hDrop'+(R.add ? ' open' : '')+'"><div class="hOpts r3">'+opt("link","🔗","Tampal pautan","Paste a link")+opt("cam","📷","Kamera","Camera")+opt("img","🖼️","Gambar","Photo")+opt("vid","🎬","Video","Video")+opt("text","⌨️","Taip / tampal","Type / paste")+opt("new","✏️","Tulis sendiri","Write my own")+'</div></div>'+
    '<input type="file" accept="image/*" multiple id="rFile" style="display:none"><input type="file" accept="video/*" id="rVid" style="display:none"></div>';
  if(R.mode==="link") h += '<div class="card"><h3>🔗 '+L2("Pautan resepi atau hantaran","Recipe or post link")+'</h3><input id="rUrl" type="url" class="rin" placeholder="https://…" autocomplete="off"><button class="btn gold full" data-ra="linkgo" style="margin-top:8px">'+L2("Import","Import")+'</button><div class="mut tiny" style="margin-top:6px">'+L2("Laman resepi, TikTok, YouTube, Instagram, Facebook atau Pinterest.","A recipe website, TikTok, YouTube, Instagram, Facebook or Pinterest.")+'</div></div>';
  if(R.mode==="paste") h += '<div class="card"><h3>⌨️ '+L2("Taip atau tampal resepi","Type or paste a recipe")+'</h3><textarea id="rTxt" class="htxt" rows="8" placeholder="'+L2("Tajuk\nBahan-bahan:\n2 cawan tepung\n…\nCara:\n1. …","Title\nIngredients:\n2 cups flour\n…\nMethod:\n1. …")+'"></textarea><button class="btn gold full" data-ra="textgo" style="margin-top:8px">'+L2("Jadikan resepi","Make the recipe")+'</button><div class="mut tiny" style="margin-top:6px">'+(AI().ready() ? L2("Disusun oleh AI dalam talian.","Laid out by the online AI.") : L2("AI dalam talian tutup: teks disusun di dalam telefon mengikut tajuk Bahan dan Cara.","Online AI is off: the text is sorted on the phone by its Ingredients and Method headings."))+'</div></div>';
  return h;
}
function srcIcon(r){ return (KIND[(r.src||{}).kind] || KIND.web)[0]; }
function listHtml(){
  var l = all(), cols = {}, q = R.q.toLowerCase();
  l.forEach(function(r){ (r.col||[]).forEach(function(c){ cols[c] = (cols[c]||0) + 1; }); });
  var f = l.filter(function(r){
    if(R.col==="fav" && !r.fav) return false; if(R.col!=="all" && R.col!=="fav" && (r.col||[]).indexOf(R.col)<0) return false;
    if(q && (r.title + " " + (r.tags||[]).join(" ") + " " + r.ing.map(function(g){ return g.name||""; }).join(" ")).toLowerCase().indexOf(q)<0) return false; return true; });
  var h = addHtml() + impHtml();
  if(l.length){
    // 0.5.5: folder sidebar (All, Favourites, your folders) beside the recipes; grid / list and card size like Books
    var cs = cfgS(), fold = folders(), lv = cs.lview==="list", nc = cs.cols || 2;
    R.selShown = f.map(function(r){ return r.id; });
    if(R.sel){ var ns = Object.keys(R.sel).filter(function(k){ return R.sel[k]; }).length; h += '<div class="card rSelBar"><div class="small"><b>📄 '+L2("Eksport PDF berbingkai","Export a framed PDF")+'</b><div class="mut tiny">'+L2("Tekan resepi untuk pilih. Satu resepi satu muka surat.","Tap recipes to pick them. One recipe per page.")+'</div></div>'+
      '<div class="btns"><button class="btn alt" data-ra="pdfall">'+L2("Semua","All")+'</button><button class="btn alt" data-ra="pdfsel">'+L2("Batal","Cancel")+'</button><button class="btn gold g3d" data-ra="pdfgo">📄 '+L2("Eksport ","Export ")+ns+'</button></div></div>'; }
    h += '<div class="rsearch"><input id="rQ" class="rin" type="search" placeholder="🔎 '+L2("Cari resepi atau bahan","Search recipes or ingredients")+'" value="'+esc(R.q)+'"></div>'+
      '<div class="rtool"><span class="mut tiny">'+f.length+L2(" resepi"," recipes")+'</span><span style="flex:1"></span><button class="chip'+(R.sel ? ' on' : '')+'" data-ra="pdfsel" title="'+L2("Eksport PDF","Export PDF")+'">📄 PDF</button><button class="chip" data-rlv="1" title="'+L2("Grid / senarai","Grid / list")+'">'+(lv ? "▦" : "☰")+'</button>'+(lv ? '' : '<button class="chip" data-rcs="1" title="'+L2("Saiz kad","Card size")+'">'+["","▪","▪▪","▪▪▪","▪▪▪▪"][nc]+'</button>')+'</div>';
    var card = function(r){ var v = verdict(r), img = '<div class="rimg rnoimg">'+srcIcon(r)+(r.img ? '<img src="'+esc(r.img)+'" alt="" loading="lazy" onerror="this.remove()">' : '')+'</div>',
      meta = '<div class="rcm">'+srcIcon(r)+' '+(v.n ? '<span class="hp H">✔ '+L2("Ditukar ","Swapped ")+v.n+'</span>' : '<span class="hp H">✔ Halal</span>')+(r.fav ? ' ⭐' : '')+(r.review ? ' <span class="hp S">'+L2("Semak","Review")+'</span>' : '')+'</div>';
      // 0.5.71 (owner): ⋮ on every recipe opens Start cooking and the other actions
      var more = '<span class="rmore" role="button" tabindex="0" data-rmore="'+r.id+'" aria-label="'+L2("Pilihan","Options")+'">⋮</span>';
      if(R.sel){ more = '<span class="rTick'+(R.sel[r.id] ? ' on' : '')+'">'+(R.sel[r.id] ? '✓' : '')+'</span>'; }
      return lv ? '<button class="rrow" data-rid="'+r.id+'">'+img+'<div class="rct"><b>'+esc(r.title)+'</b>'+meta+'</div>'+more+'</button>' : '<button class="rcard" data-rid="'+r.id+'">'+img+more+'<div class="rct"><b>'+esc(r.title)+'</b>'+meta+'</div></button>'; };
    var g = (lv ? '<div class="rlist">' : '<div class="rgrid" style="grid-template-columns:repeat('+nc+',minmax(0,1fr))">')+(f.length ? f.map(card).join("") : '<div class="mut small" style="padding:10px">'+L2("Tiada resepi yang sepadan.","No matching recipes.")+'</div>')+'</div>';
    h += H.IbFold ? H.IbFold.html({open:cs.fold!==false, cur:R.col, body:g, items:[{k:"all", ic:"🍲", n:L2("Semua","All"), c:l.length}, {k:"fav", ic:"⭐", n:L2("Kegemaran","Favourites"), c:l.filter(function(r){ return r.fav; }).length}]
      .concat(fold.map(function(c){ return {k:c, ic:"📁", n:c, c:cols[c]||0, menu:true}; }))}) : g;
  } else if(!R.imp) h += '<div class="card rempty"><div style="font-size:34px">🍳</div><b>'+L2("Belum ada resepi","No recipes yet")+'</b><div class="mut small" style="margin-top:6px;line-height:1.5">'+
    L2("Cuba: buka video resepi di TikTok atau Instagram › Kongsi › My Ihsan Recipe. Atau tampal pautan mana-mana laman resepi.","Try it: open a recipe video on TikTok or Instagram › Share › My Ihsan Recipe. Or paste a link to any recipe website.")+'</div><div class="btns" style="margin-top:10px"><button class="btn gold g3d" data-radd="link">🔗 '+L2("Tampal pautan resepi","Paste a recipe link")+'</button><button class="btn alt g3d" data-radd="text">⌨️ '+L2("Taip resepi","Type a recipe")+'</button></div></div>';
  h += settingsHtml();
  h += '<div class="card hdisc"><h3>⚖️ '+L2("Panduan sahaja, bukan fatwa","A guide only, not a fatwa")+'</h3><div class="small">'+
    L2("Tukaran dicadangkan oleh komputer menggunakan jadual tukaran halal di dalam aplikasi (amalan Malaysia, mazhab Syafi'i) dan AI yang anda pilih. Ia boleh tersilap. Beli bahan berlogo halal JAKIM; jika ragu, tinggalkan atau tanya pihak berautoriti agama.","Swaps are suggested by the computer using the halal swap table inside the app (Malaysian practice, Shafi'i school) and the AI you choose. It can be wrong. Buy ingredients with a JAKIM halal logo; if in doubt, leave it or ask a religious authority.")+'</div></div>';
  return h;
}
function settingsHtml(){
  var s = cfgS(), c = AI().cfg(), k = c.keys||{}, seg = function(id, cur, opts){ return '<div class="rseg">'+opts.map(function(o){ return '<button class="chip'+(cur===o[0] ? ' on' : '')+'" data-rset="'+id+'" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>'; };
  var stt = s.stt, sk = stt==="auto" ? "groq" : (stt==="groq"||stt==="gemini"||stt==="openai") ? stt : "";
  return '<details class="card haiset" id="rSet"'+(R.setOpen ? ' open' : '')+'><summary><b>⚙ '+L2("Tetapan resepi","Recipe settings")+'</b></summary>'+
    '<div class="rlab">'+L2("Bahasa resepi yang diimport","Language of imported recipes")+'</div>'+seg("lang", s.lang, [["orig",L2("Ikut sumber","As the source")],["ms","Bahasa Melayu"],["en","English"]])+
    '<div class="rlab">'+L2("Unit sukatan lalai","Default units")+'</div>'+seg("units", s.units, [["orig",L2("Asal","Original")],["metric",L2("Metrik (g, ml)","Metric (g, ml)")],["us",L2("Cawan (AS)","Cups (US)")]])+
    '<div class="rlab">✨ AI</div>'+(window.AIRun?'<div class="aiBtnRow" style="justify-content:flex-start">'+AIRun.btn("recipe")+'</div>':'')+
    '<div class="rlab">'+L2("Sandaran","Backup")+'</div><div class="btns"><button class="btn alt" data-ra="exp">📤 '+L2("Eksport","Export")+'</button><button class="btn alt" data-ra="imp">📥 '+L2("Import fail","Import file")+'</button></div><div class="mut tiny" style="margin-top:6px">'+L2("Resepi, rancangan dan senarai beli juga termasuk dalam sandaran aplikasi (Tetapan).","Recipes, the plan and the shopping list are also in the app backup (Settings).")+'</div></details>';
}
function curServes(r){ return R.serves || r.serves || 0; }
// 0.5.23 scale factor: by servings when the recipe gives them, else by a multiplier (½× 1× 2× 3×)
function scaleF(r){ return r.serves && curServes(r) ? curServes(r)/r.serves : (R.mult || 1); }
function detailHtml(r){
  var v = verdict(r), mode = R.view, units = R.units || cfgS().units, base = r.serves || 0, sv = curServes(r), f = scaleF(r);
  var h = '<div class="rtop"><button class="chip" data-ra="back">‹ '+L2("Resepi","Recipes")+'</button></div>';
  if(r.img) h += '<img class="rhimg" src="'+esc(r.img)+'" alt="" onerror="this.remove()">';
  var meta = [];
  if(r.author) meta.push(esc(r.author));
  if(r.prep || r.cook || r.total) meta.push("⏱ "+(r.total || (r.prep + r.cook))+" min");
  if(r.cuisine) meta.push(esc(r.cuisine));
  h += '<div class="card rhead"><h2>'+esc(r.title)+(r.fav ? ' ⭐' : '')+'</h2><div class="mut small">'+kindName((r.src||{}).kind)+(meta.length ? ' · '+meta.join(' · ') : '')+'</div>'+
    ((r.src||{}).url ? '<button class="chip" data-ra="src" style="margin-top:8px">↗ '+L2("Buka sumber asal","Open the original")+'</button>' : '')+
    ((r.col||[]).length ? '<div class="rcols" style="margin-top:6px">'+r.col.map(function(c){ return '<span class="badge">📁 '+esc(c)+'</span>'; }).join(" ")+'</div>' : '')+'</div>';
  if(r.nut){ var nf = r.serves && curServes(r) ? 1 : 1, chip = function(v, ms, en){ return v ? '<span class="rnut"><b>'+v+'</b>'+L2(ms, en)+'</span>' : ''; };
    h += '<div class="rnuts">'+chip(r.nut.kcal*nf,"kcal","kcal")+chip(r.nut.p*nf,"g protein","g protein")+chip(r.nut.c*nf,"g karbo","g carbs")+chip(r.nut.f*nf,"g lemak","g fat")+chip(r.nut.fb*nf,"g serat","g fibre")+'<span class="mut tiny">'+(r.nutSrc==="web" ? L2("sehidangan, daripada sumber","per serving, from the source") : L2("sehidangan, anggaran AI","per serving, AI estimate"))+'</span></div>'; }
  if(r.review) h += '<div class="card rrev">⚠ <b>'+L2("Perlu disemak","Please check")+'</b><div class="small" style="margin-top:4px;line-height:1.45">'+esc(r.missing || L2("Sesetengah sukatan tiada dalam sumber.","Some amounts were not in the source."))+'</div><button class="chip" data-ra="edit" style="margin-top:8px">✏️ '+L2("Sunting","Edit")+'</button> <button class="chip" data-ra="revok" style="margin-top:8px">✔ '+L2("Sudah disemak","Checked")+'</button></div>';
  // halal summary
  var nm = function(st){ return {X:"✖ Haram", S:"⚠ "+L2("Syubhah","Doubtful"), H:"✔ Halal"}[st]; };
  h += '<div class="hv '+(v.n ? 'H' : 'H')+' rhv"><div class="hAiTag">🏷️ '+L2("Semakan halal","Halal check")+'</div>';
  if(!v.n) h += '<div class="hvH">✔ '+L2("Halal seperti asal","Halal as it is")+'</div><div class="hvS">'+L2("Tiada bahan haram atau syubhah dikesan.","No haram or doubtful ingredient was found.")+(v.tips ? ' '+L2("Beli bahan berlogo halal (lihat petua 🟢).","Buy the ingredients with a halal logo (see the 🟢 tips).") : '')+'</div>';
  else {
    h += '<div class="rvrow"><span class="hp '+v.o+'">'+L2("Asal: ","Original: ")+nm(v.o)+'</span><span class="rarr">→</span><span class="hp H">✔ '+L2("Versi halal","Halal version")+'</span></div><div class="hvS">'+
      (v.nX ? v.nX+L2(" bahan haram"," haram") : '')+(v.nX && v.nS ? ', ' : '')+(v.nS ? v.nS+L2(" syubhah"," doubtful") : '')+L2(" ditukar. "," swapped. ")+esc(r.summary||"")+'</div><div class="rswl">';
    r.ing.forEach(function(g){ if(g.h || g.st==="H" || !g.swap) return; h += swapRow(g.name, g); });
    (r.extra||[]).forEach(function(x){ h += swapRow(x.word, x, true); });
    h += '</div>';
  }
  h += '<div class="rseg rvt"><button class="chip'+(mode==="H" ? ' on' : '')+'" data-rv="H">✔ '+L2("Versi halal","Halal version")+'</button><button class="chip'+(mode==="O" ? ' on' : '')+'" data-rv="O">'+L2("Asal","Original")+'</button></div>'+
    '<div class="mut tiny">'+L2("Panduan sahaja, bukan fatwa.","A guide only, not a fatwa.")+(r.ai ? ' '+L2("AI: ","AI: ")+esc(r.ai.p) : '')+'</div></div>';
  // servings + units
  h += '<div class="card"><div class="rsv"><span>🍽️ '+L2("Hidangan","Servings")+'</span>'+(base ? '<button class="chip" data-rsv="-1">−</button><b>'+sv+'</b><button class="chip" data-rsv="1">+</button>' : '<span class="mut small">'+L2("tidak dinyatakan","not given")+'</span>')+'</div>'+
    '<div class="rseg">'+(base ? [[0.5,"½×"],[1,"1×"],[2,"2×"],[3,"3×"]].map(function(o){ return '<button class="chip'+(Math.abs(sv/base-o[0])<0.01 ? ' on' : '')+'" data-rmul="'+o[0]+'">'+o[1]+'</button>'; }).join("")
      : [[0.5,"½×"],[1,"1×"],[1.5,"1½×"],[2,"2×"],[3,"3×"],[4,"4×"]].map(function(o){ return '<button class="chip'+((R.mult||1)===o[0] ? ' on' : '')+'" data-rmul="'+o[0]+'">'+o[1]+'</button>'; }).join(""))+'</div>'+
    '<div class="rseg">'+[["orig",L2("Asal","Original")],["metric",L2("Metrik","Metric")],["us",L2("Cawan","Cups")]].map(function(o){ return '<button class="chip'+(units===o[0] ? ' on' : '')+'" data-ru="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>';
  h += '<h3 style="margin-top:12px">'+L2("Bahan","Ingredients")+'</h3><div class="ril">'+r.ing.map(function(g){ return ingRow(g, f, mode, units); }).join("")+'</div></div>';
  var stp = mode==="H" ? (r.hsteps && r.hsteps.length ? r.hsteps : r.steps) : r.steps, n = 0;
  h += '<div class="card"><h3>'+L2("Cara memasak","Method")+'</h3>'+(stp.length ? '<ol class="rst">'+stp.map(function(s, i){
      if(/^§/.test(s)) return '<li class="rsh">'+esc(s.replace(/^§\s*/,""))+'</li>';
      n++; var ch = mode==="H" && r.steps[i]!=null && s!==r.steps[i];
      var tz = timersIn(s); return '<li'+(ch ? ' class="rch"' : '')+'><span class="rsn">'+n+'</span><span>'+esc(s)+(ch ? ' <span class="hp H" title="">🔄 '+L2("diubah","changed")+'</span>' : '')+(tz.length ? '<span class="rtz">'+tz.map(function(x, k){ return '<button class="chip" data-rtz="'+(n-1)+'|'+k+'">⏱ '+esc(x.lab)+'</button>'; }).join("")+'</span>' : '')+'</span></li>'; }).join("")+'</ol>' : '<div class="mut small">'+L2("Tiada langkah dalam sumber.","The source has no steps.")+'</div>')+'</div>';
  if(r.notes) h += '<div class="card"><h3>📝 '+L2("Nota","Notes")+'</h3><div class="small" style="white-space:pre-wrap">'+esc(r.notes)+'</div></div>';
  var b = function(a, ic, ms, en, cls){ return '<button class="btn '+(cls||'alt')+'" data-ra="'+a+'">'+ic+' '+L2(ms, en)+'</button>'; };
  h += '<div class="ract">'+b("cook","👨‍🍳","Mula masak","Start cooking","gold")+b("shop","🛒","Ke senarai beli","To shopping list")+b("plan","📅","Rancang","Plan")+b("fav", r.fav ? "★" : "☆", r.fav ? "Buang kegemaran" : "Kegemaran", r.fav ? "Unfavourite" : "Favourite")+
    b("col","📁","Koleksi","Collection")+b("edit","✏️","Sunting","Edit")+b("share","📤","Kongsi teks","Share text")+b("card","🖼️","Kad resepi","Recipe card")+b("ai","✨","Semak semula dengan AI","Re-check with AI")+b("del","🗑️","Padam","Delete")+'</div>';
  return h;
}
function swapRow(name, g, step){
  var sw = g.swap;
  return '<div class="rsw"><div><span class="hp '+g.st+'">'+(g.st==="X" ? "Haram" : L2("Syubhah","Doubtful"))+'</span> <s>'+esc(name)+'</s>'+(step ? ' <span class="mut tiny">('+L2("dalam cara memasak","in the method")+')</span>' : '')+'</div>'+
    '<div class="rswto">→ <b>'+esc(tx(sw.name))+'</b></div>'+(tx(sw.why) ? '<div class="mut tiny">'+esc(tx(sw.why))+'</div>' : '')+'</div>';
}
function ingRow(g, f, mode, units){
  if(g.h) return '<div class="rih">'+esc(g.h)+'</div>';
  var sw = mode==="H" && g.swap && g.st!=="H", q = g.q, q2 = g.q2, u = g.u, uw = g.uw, name = g.name;
  if(sw){ name = tx(g.swap.name); if(g.swap.q!=null){ q = g.swap.q; q2 = null; u = g.swap.u; uw = g.swap.uw||g.swap.u; } else if(q!=null){ q = q*(g.swap.k||1); q2 = q2!=null ? q2*(g.swap.k||1) : null; } }
  var qt = qtyText(q, q2, u, uw, f, units);
  return '<div class="ri r'+(sw ? 'W' : g.st)+'"><span class="rq">'+esc(qt)+'</span><span class="rn">'+esc(name)+(g.note && !sw ? '<small>, '+esc(g.note)+'</small>' : '')+
    (sw ? '<div class="ro">'+L2("ganti ","instead of ")+'<s>'+esc(g.name)+'</s></div>' : (g.st!=="H" ? ' <span class="hp '+g.st+'">'+(g.st==="X" ? "Haram" : L2("Syubhah","Doubtful"))+'</span>' : ''))+
    (g.tip ? '<div class="rtip">🟢 '+esc(tx(g.tip))+'</div>' : '')+'</span></div>';
}
function ingLine(g){ if(g.h) return g.h + ":"; return [g.q!=null ? fmtNum(g.q, g.u)+(g.q2!=null ? "-"+fmtNum(g.q2, g.u) : "") : "", g.uw || (g.u ? ulab(g.u, g.q) : ""), g.name].filter(Boolean).join(" ") + (g.note ? ", "+g.note : ""); }
function editHtml(r){
  r = r || R.editNew || {title:"", serves:0, prep:0, cook:0, ing:[], steps:[], col:[], notes:"", src:{kind:"text"}};
  var f = function(id, lab, val, type){ return '<label class="hfld">'+lab+'<input id="'+id+'" class="rin" type="'+(type||"text")+'" value="'+esc(val)+'"></label>'; };
  return '<div class="rtop"><button class="chip" data-ra="'+(r.id ? 'back2' : 'back')+'">‹ '+L2("Batal","Cancel")+'</button></div><div class="card"><h3>✏️ '+(r.id ? L2("Sunting resepi","Edit recipe") : L2("Resepi baharu","New recipe"))+'</h3>'+
    f("eT", L2("Tajuk","Title"), r.title)+'<div class="r3c">'+f("eS", L2("Hidangan","Servings"), r.serves||"", "number")+f("eP", L2("Sedia (min)","Prep (min)"), r.prep||"", "number")+f("eC", L2("Masak (min)","Cook (min)"), r.cook||"", "number")+'</div>'+
    '<label class="hfld">'+L2("Bahan (satu baris satu bahan; baris berakhir dengan \":\" ialah tajuk bahagian)","Ingredients (one per line; a line ending in \":\" is a section heading)")+'<textarea id="eI" class="htxt" rows="9">'+esc(r.ing.map(ingLine).join("\n"))+'</textarea></label>'+
    '<label class="hfld">'+L2("Cara memasak (satu langkah satu baris)","Method (one step per line)")+'<textarea id="eM" class="htxt" rows="9">'+esc((r.steps||[]).join("\n"))+'</textarea></label>'+
    f("eCol", L2("Koleksi (pisahkan dengan koma)","Collections (separate with commas)"), (r.col||[]).join(", "))+f("eU", L2("Pautan sumber","Source link"), (r.src||{}).url||"", "url")+
    '<label class="hfld">'+L2("Nota","Notes")+'<textarea id="eN" class="htxt" rows="3">'+esc(r.notes||"")+'</textarea></label>'+
    '<button class="btn gold full" data-ra="esave">'+L2("Simpan & semak halal","Save & check halal")+'</button><div class="mut tiny" style="margin-top:6px">'+L2("Semakan halal dibuat semula di dalam telefon selepas disimpan.","The halal check runs again on the phone after saving.")+'</div></div>';
}
function saveEdit(el){
  var id = R.page.slice(5), old = id==="new" ? null : get(id), r = old ? JSON.parse(JSON.stringify(old)) : {id:"r"+Date.now().toString(36), t:Date.now(), src:{kind:"text"}, col:[]};
  var v = function(i){ return (el.querySelector("#"+i)||{}).value || ""; };
  r.title = v("eT").trim() || L2("Resepi tanpa nama","Untitled recipe"); r.serves = parseInt(v("eS"),10)||0; r.prep = parseInt(v("eP"),10)||0; r.cook = parseInt(v("eC"),10)||0; r.total = 0;
  var prev = {}; (old ? old.ing : []).forEach(function(g){ if(!g.h) prev[ingLine(g)] = g; });
  r.ing = v("eI").split(/\n/).map(function(l){ return l.trim(); }).filter(Boolean).map(function(l){ if(/:$/.test(l) && l.length < 50 && !QRX.test(l)) return {h:l.replace(/:$/,"")}; return prev[l] ? prev[l] : parseIng(l); });
  var ns = v("eM").split(/\n/).map(function(l){ return l.trim().replace(/^\s*(?:step\s*)?\d+[.):]\s*/i, ""); }).filter(Boolean);
  if(!old || ns.join("\n")!==(old.steps||[]).join("\n")){ r.steps = ns; r.hsteps = []; r.hAuto = true; }
  r.col = v("eCol").split(",").map(function(c){ return c.trim(); }).filter(Boolean); r.notes = v("eN");
  var u = v("eU").trim(); r.src = r.src || {kind:"text"}; if(u){ r.src.url = u; if(r.src.kind==="text") r.src.kind = kindOf(u); }
  if(!r.ing.length){ H.toast(L2("Tambah sekurang-kurangnya satu bahan","Add at least one ingredient")); return; }
  r.ing.forEach(function(g){ if(!g.h && !prev[ingLine(g)]){ g.st = "H"; g.swap = null; g.tip = null; } });
  enforce(r); if(put(r)){ R.editNew = null; H.toast(L2("Disimpan","Saved")); go("r:"+r.id); }
}
// ---------- plan ----------
var DN = [["Isn","Mon"],["Sel","Tue"],["Rab","Wed"],["Kha","Thu"],["Jum","Fri"],["Sab","Sat"],["Ahd","Sun"]];
function ymd(d){ return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); }
function monday(off){ var t = new Date(); t.setHours(12,0,0,0); t.setDate(t.getDate() - ((t.getDay()+6)%7) + 7*(off||0)); return t; }
function planHtml(){
  var p = H.load(PKEY, {}), m = monday(R.pw), today = ymd(new Date()), h = '<div class="card"><div class="rwk"><button class="chip" data-rpw="-1">‹</button><b>'+(R.pw===0 ? L2("Minggu ini","This week") : R.pw===1 ? L2("Minggu depan","Next week") : R.pw===-1 ? L2("Minggu lepas","Last week") : m.getDate()+"/"+(m.getMonth()+1))+'</b><button class="chip" data-rpw="1">›</button></div>';
  for(var i=0;i<7;i++){
    var d = new Date(m); d.setDate(m.getDate()+i); var k = ymd(d), ids = (p[k]||[]).filter(function(id){ return get(id); });
    h += '<div class="rday'+(k===today ? ' tod' : '')+'"><div class="rdl"><b>'+L2(DN[i][0], DN[i][1])+'</b><span>'+d.getDate()+'/'+(d.getMonth()+1)+'</span></div><div class="rdr">'+
      ids.map(function(id, j){ var r = get(id); return '<div class="rpi"><button class="rpn" data-rid="'+id+'">'+esc(r.title)+'</button><button class="chip" data-rpx="'+k+'|'+j+'">✕</button></div>'; }).join("")+
      '<button class="chip" data-rpadd="'+k+'">＋ '+L2("Tambah","Add")+'</button></div></div>';
  }
  h += '<button class="btn gold full" data-ra="weekshop" style="margin-top:10px">🛒 '+L2("Masukkan bahan minggu ini ke senarai beli","Add this week's ingredients to the shopping list")+'</button></div>';
  if(!all().length) h += '<div class="card mut small">'+L2("Simpan beberapa resepi dahulu, kemudian rancang menu seminggu di sini.","Save a few recipes first, then plan the week's menu here.")+'</div>';
  return h;
}
function pickRecipe(title, cb){
  var l = all(); if(!l.length){ H.toast(L2("Belum ada resepi","No recipes yet")); return; }
  var ov = H.showSheet(esc(title), '<div class="rpk">'+l.map(function(r){ return '<button class="hhist" data-pk="'+r.id+'">'+srcIcon(r)+' <span class="hhs">'+esc(r.title)+'</span></button>'; }).join("")+'</div>');
  ov.querySelectorAll("[data-pk]").forEach(function(b){ b.onclick = function(){ H.closeOverlay(); cb(b.getAttribute("data-pk")); }; });
}
function planSheet(r){
  var p = H.load(PKEY, {}), m = monday(0), body = '<div class="mut small" style="margin-bottom:8px">'+L2("Pilih hari (dua minggu):","Choose days (two weeks):")+'</div><div class="rpd">';
  for(var i=0;i<14;i++){ var d = new Date(m); d.setDate(m.getDate()+i); var k = ymd(d), on = (p[k]||[]).indexOf(r.id)>=0; body += '<button class="chip'+(on ? ' on' : '')+'" data-pd="'+k+'">'+L2(DN[i%7][0], DN[i%7][1])+' '+d.getDate()+'/'+(d.getMonth()+1)+'</button>'; }
  body += '</div><button class="btn gold full" id="rpOk" style="margin-top:12px">'+L2("Siap","Done")+'</button>';
  var ov = H.showSheet("📅 "+esc(r.title), body);
  ov.querySelectorAll("[data-pd]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-pd"), q = H.load(PKEY, {}); q[k] = q[k]||[]; var j = q[k].indexOf(r.id); if(j>=0) q[k].splice(j,1); else q[k].push(r.id); if(!q[k].length) delete q[k]; store(PKEY, q); b.classList.toggle("on"); }; });
  ov.querySelector("#rpOk").onclick = function(){ H.closeOverlay(); H.toast(L2("Rancangan disimpan","Plan saved")); };
}
// ---------- shopping ----------
var AISLE = [["beku",/\b(frozen|beku|ice cream|aiskrim)\b/i,"❄️","Sejuk beku","Frozen"],["minum",/\b(juice|jus|coffee|kopi|tea\b|teh\b|soda|sparkling)/i,"🧃","Minuman","Drinks"],
  ["sayur0",/\b(bell pepper|capsicum|lada benggala)\b/i,"🥬","Sayur & buah","Veg & fruit"],
  ["rempah",/\b(salt|pepper|spice|cumin|paprika|cinnamon|turmeric|chilli powder|curry|sauce|soy|vinegar|oil|sugar|honey|stock|broth|bouillon|powder|essence|extract|vanilla|garam|lada|rempah|jintan|kayu manis|kunyit|serbuk|kicap|sos|cuka|minyak|gula|madu|esen|stok|ketumbar biji|bunga lawang|cengkih|buah pelaga|baking|yeast|yis|agar)\b/i,"🧂","Rempah, sos & perasa","Spices, sauces & seasoning"],
  ["tenusu",/\b(milk|butter|cream|cheese|yogh?urt|egg|eggs|ghee|susu|mentega|krim|keju|dadih|telur|minyak sapi|mozzarella|cheddar|parmesan)\b/i,"🥚","Tenusu & telur","Dairy & eggs"],
  ["laut",/\b(fish|salmon|tuna|cod|prawns?|shrimps?|squid|crab|clams?|mussels?|anchov|oysters?|scallops?|ikan|udang|sotong|ketam|kerang|bilis|tiram)\b/i,"🐟","Ikan & makanan laut","Fish & seafood"],
  ["daging",/\b(beef|steak|lamb|mutton|chicken|turkey|duck|mince|meat|bacon|sausages?|chorizo|ham|veal|goat|daging|ayam|lembu|kambing|itik|sosej|bekon)\b/i,"🥩","Daging & ayam","Meat & poultry"],
  ["tin",/\b(can|canned|tin|beans|lentils?|chickpeas?|coconut milk|santan|kacang|nuts?|almonds?|raisins?|dried|kering|tomato paste|puree|pes)\b/i,"🥫","Tin & barang kering","Tins & dry goods"],
  ["bijirin",/\b(bread|flour|rice|pasta|spaghetti|noodles?|oats|tortillas?|breadcrumbs|roti|tepung|beras|nasi|mee|bihun|kuey ?teow|couscous|quinoa)\b/i,"🍞","Roti, beras & tepung","Bread, rice & flour"],
  ["sayur",/./,"🥬","Sayur, buah & lain-lain","Veg, fruit & other"]];
function aisleOf(n){ for(var i=0;i<AISLE.length;i++) if(AISLE[i][1].test(n)) return AISLE[i][0]==="sayur0" ? "sayur" : AISLE[i][0]; return "sayur"; }
function shopAdd(r, f){
  var l = H.load(SKEY, []), n = 0;
  r.ing.forEach(function(g){
    if(g.h) return;
    var sw = g.swap && g.st!=="H", name = sw ? tx(g.swap.s || g.swap.name) : g.name, q = g.q, u = g.u, uw = g.uw;
    if(sw){ if(g.swap.q!=null){ q = g.swap.q; u = g.swap.u; uw = g.swap.uw||g.swap.u; } else if(q!=null) q = q*(g.swap.k||1); }
    if(q!=null) q = q*f;
    var key = name.toLowerCase().trim()+"|"+(u||uw||""), ex = null;
    for(var i=0;i<l.length;i++) if(!l[i].d && l[i].k===key){ ex = l[i]; break; }
    if(ex){ if(ex.q!=null && q!=null) ex.q += q; else if(q!=null && ex.q==null) ex.q = q; if(ex.r.indexOf(r.title)<0) ex.r.push(r.title); }
    else l.push({id:"s"+Date.now().toString(36)+n, k:key, n:name, q:q, u:u, uw:uw, a:aisleOf(name), d:false, r:[r.title], h:!!(g.tip || sw)});
    n++;
  });
  store(SKEY, l); return n;
}
function shopHtml(){
  var l = H.load(SKEY, []), h = '<div class="card"><div class="radd"><input id="sNew" class="rin" placeholder="'+L2("Tambah barang…","Add an item…")+'"><button class="btn gold" data-ra="sadd">＋</button></div></div>';
  if(!l.length) return h + '<div class="card rempty"><div style="font-size:34px">🛒</div><b>'+L2("Senarai beli kosong","The shopping list is empty")+'</b><div class="mut small" style="margin-top:6px">'+L2("Buka resepi › Ke senarai beli, atau Rancang › masukkan bahan minggu ini.","Open a recipe › To shopping list, or Plan › add this week's ingredients.")+'</div></div>';
  var done = l.filter(function(x){ return x.d; }).length;
  AISLE.forEach(function(a){
    if(a[0]==="sayur0") return;
    var it = l.filter(function(x){ return (x.a==="sayur0" ? "sayur" : x.a)===a[0]; }); if(!it.length) return;
    h += '<div class="card rshop"><h3>'+a[2]+' '+L2(a[3], a[4])+'</h3>'+it.map(function(x){
      var qt = x.q!=null ? qtyText(x.q, null, x.u, x.uw, 1, "orig") : "";
      return '<label class="rsi'+(x.d ? ' dn' : '')+'"><input type="checkbox" data-sck="'+x.id+'"'+(x.d ? ' checked' : '')+'><span><b>'+esc(x.n)+'</b>'+(qt ? ' <span class="mut">· '+esc(qt)+'</span>' : '')+
        (x.h ? '<div class="rtip">🟢 '+L2("Cari logo halal JAKIM","Look for the JAKIM halal logo")+'</div>' : '')+(x.r && x.r.length ? '<div class="mut tiny">'+esc(x.r.join(", "))+'</div>' : '')+'</span></label>'; }).join("")+'</div>';
  });
  h += '<div class="btns"><button class="btn alt" data-ra="sshare">📤 '+L2("Kongsi","Share")+'</button>'+(done ? '<button class="btn alt" data-ra="sdone">🧹 '+L2("Buang yang ditanda","Remove ticked")+' ('+done+')</button>' : '')+'<button class="btn alt" data-ra="sclr">🗑️ '+L2("Kosongkan","Clear all")+'</button></div>';
  return h;
}
function shopText(){
  var l = H.load(SKEY, []), out = ["🛒 "+L2("Senarai beli","Shopping list")+" · My Ihsan"];
  AISLE.forEach(function(a){ var it = l.filter(function(x){ return !x.d && (x.a==="sayur0" ? "sayur" : x.a)===a[0]; }); if(!it.length) return; out.push("", a[2]+" "+L2(a[3], a[4])); it.forEach(function(x){ out.push("☐ "+x.n+(x.q!=null ? " — "+qtyText(x.q, null, x.u, x.uw, 1, "orig") : "")+(x.h ? " (halal ✓)" : "")); }); });
  return out.join("\n");
}
// ---------- cook mode ----------
var CK = null;
function speakLang(t){ return /\b(dan|dengan|masukkan|kacau|sehingga|biarkan|goreng|tumis|masak|air|garam)\b/i.test(t) ? "ms" : "en"; }
function timersIn(t){ var out = [], re = /(\d+(?:[.,]\d+)?)(?:\s*(?:-|–|to|hingga|ke)\s*(\d+(?:[.,]\d+)?))?\s*(minutes?|mins?|minit|hours?|hrs?|jam|seconds?|secs?|saat)\b/gi, m;
  while((m = re.exec(t))){ var n = parseFloat((m[2]||m[1]).replace(",", ".")), u = m[3].toLowerCase(), sec = /^(h|jam)/.test(u) ? n*3600 : /^(s|saat)/.test(u) ? n : n*60; if(sec>0 && sec<=6*3600) out.push({sec:Math.round(sec), lab:m[0]}); } return out; }
function cook(r, at){
  var stp = (R.view==="H" && r.hsteps && r.hsteps.length ? r.hsteps : r.steps).filter(function(s){ return !/^§/.test(s); });
  if(!stp.length){ H.toast(L2("Resepi ini tiada langkah","This recipe has no steps")); return; }
  var ov = document.getElementById("overlay"), N = H.N;
  CK = {r:r, s:stp, i:Math.max(0, Math.min(stp.length-1, at||0)), tm:[], iv:null, say:!!cfgS().read};
  ov.className = "rckov"; ov.classList.remove("hidden");
  if(N.keepScreenOn) N.keepScreenOn(true, -1);
  CK.iv = setInterval(tick, 1000);
  ov._close = function(){ stopCook(); };
  drawCook();
}
// 0.5.23 every kitchen timer is also a notification, so it rings when the phone is locked or the app is in the background
function addTimer(lab, sec){ var end = Date.now()+sec*1000, id = "rct"+end; CK.tm.push({lab:lab, end:end, id:id}); if(H.xrem) H.xrem(id, end, "⏰ "+L2("Masa tamat: ","Time's up: ")+lab, CK.r.title, "halal", true); H.toast("⏱ "+lab); }
function dropTimer(t){ if(t && t.id && H.xrem) H.xrem(t.id, 0); }
function stopCook(){ if(!CK) return; clearInterval(CK.iv); CK.tm.forEach(function(t){ if(!t.done) dropTimer(t); }); var N = H.N; if(N.keepScreenOn) N.keepScreenOn(false, -1); if(N.stopSpeak) try{ N.stopSpeak(); }catch(e){} CK = null; H.closeOverlay(); }
// 0.5.4 (Ihsan): every reading starts with Bismillah
function sayStep(){ var N = H.N, t = "Bismillah. "+CK.s[CK.i]; if(N.speak) N.speak(t, speakLang(CK.s[CK.i])); else if(window.speechSynthesis){ try{ speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(t)); }catch(e){} } }
function fmtT(s){ s = Math.max(0, Math.round(s)); var h = Math.floor(s/3600), m = Math.floor(s%3600/60), x = s%60; return (h ? h+":"+("0"+m).slice(-2) : m)+":"+("0"+x).slice(-2); }
function tick(){
  if(!CK) return; var now = Date.now(), N = H.N;
  CK.tm.forEach(function(t){ if(!t.done && now >= t.end){ t.done = true; if(N.vibrate) N.vibrate(1500); H.toast("⏰ "+L2("Masa tamat: ","Time's up: ")+t.lab); if(N.speak) N.speak(L2("Masa tamat","Time is up"), H.S.lang==="en" ? "en" : "ms"); } });
  var b = document.getElementById("ckTm"); if(b) b.innerHTML = timersHtml();
}
function timersHtml(){ return CK.tm.filter(function(t){ return !t.gone; }).map(function(t, i){ return '<span class="cktm'+(t.done ? ' dn' : '')+'">⏱ '+esc(t.lab)+' · <b>'+(t.done ? L2("Tamat","Done") : fmtT((t.end-Date.now())/1000))+'</b> <button data-ckx="'+CK.tm.indexOf(t)+'">✕</button></span>'; }).join(""); }
function drawCook(){
  var ov = document.getElementById("overlay"), r = CK.r, t = CK.s[CK.i], last = CK.i===CK.s.length-1, tms = timersIn(t);
  var mode = R.view, f = scaleF(r), units = R.units || cfgS().units;
  ov.innerHTML = '<div class="ckw"><div class="ckTop"><button class="chip" id="ckX">✕</button><div class="ckT">'+esc(r.title)+'</div><button class="chip'+(CK.say ? ' on' : '')+'" id="ckRd">🔊</button></div>'+
    (CK.i===0 ? '<div class="ckBis"><span class="ar">بِسْمِ اللَّهِ</span><span>'+L2("Mulakan dengan Bismillah","Begin with Bismillah")+'</span></div>' : '')+
    '<div class="ckN">'+L2("Langkah ","Step ")+(CK.i+1)+' / '+CK.s.length+'</div><div class="ckBar"><i style="width:'+Math.round((CK.i+1)*100/CK.s.length)+'%"></i></div>'+
    '<div class="ckS">'+esc(t)+'</div>'+
    (tms.length ? '<div class="ckTs">'+tms.map(function(x, i){ return '<button class="chip" data-cks="'+i+'">⏱ '+esc(x.lab)+'</button>'; }).join("")+'</div>' : '')+
    '<div class="ckTs"><button class="chip" id="ckAddT">＋ ⏱ '+L2("Pemasa sendiri","Own timer")+'</button></div><div id="ckTm" class="ckTmL">'+timersHtml()+'</div>'+
    (last ? '<div class="ckDone">🤲 '+L2("Alhamdulillah, siap! Selamat menjamu selera.","Alhamdulillah, done! Enjoy your meal.")+'</div>' : '')+
    '<details class="ckIng"><summary>🧺 '+L2("Bahan","Ingredients")+'</summary><div class="ril">'+r.ing.map(function(g){ return ingRow(g, f, mode, units); }).join("")+'</div></details>'+
    '<div class="ckNav"><button class="btn alt" id="ckP"'+(CK.i===0 ? ' disabled' : '')+'>‹ '+L2("Sebelum","Back")+'</button><button class="btn alt" id="ckSay">🔈 '+L2("Baca","Read")+'</button><button class="btn gold" id="ckNx">'+(last ? L2("Tutup","Close") : L2("Seterusnya","Next")+' ›')+'</button></div></div>';
  ov.querySelector("#ckX").onclick = stopCook;
  ov.querySelector("#ckP").onclick = function(){ if(CK.i>0){ CK.i--; drawCook(); if(CK.say) sayStep(); } };
  ov.querySelector("#ckNx").onclick = function(){ if(last){ stopCook(); return; } CK.i++; drawCook(); if(CK.say) sayStep(); };
  ov.querySelector("#ckSay").onclick = sayStep;
  // 0.5.4: swipe left for the next step, right for the previous one
  var ckw = ov.querySelector(".ckw"); if(window.IbSwipe && ckw) IbSwipe(ckw, {can:function(s){ return CK && (s<0 ? CK.i<CK.s.length-1 : CK.i>0); }, go:function(s){ if(!CK) return; CK.i += s<0 ? 1 : -1; drawCook(); if(CK.say) sayStep(); var n = document.querySelector("#overlay .ckw"); if(n) IbSwipe.inFrom(n, s); }});
  ov.querySelector("#ckRd").onclick = function(){ CK.say = !CK.say; var s = cfgS(); s.read = CK.say; saveS(s); drawCook(); if(CK.say) sayStep(); };
  ov.querySelectorAll("[data-cks]").forEach(function(b){ b.onclick = function(){ var x = tms[+b.getAttribute("data-cks")]; addTimer(x.lab, x.sec); var el = document.getElementById("ckTm"); if(el) el.innerHTML = timersHtml(); bindTm(ov); }; });
  var ca = ov.querySelector("#ckAddT"); if(ca) ca.onclick = function(){ var v = prompt(L2("Pemasa berapa minit?","Timer for how many minutes?"), "10"); var m = parseFloat(String(v||"").replace(",", ".")); if(!(m > 0)) return; addTimer(m+" min", Math.round(m*60)); var el = document.getElementById("ckTm"); if(el) el.innerHTML = timersHtml(); bindTm(ov); };
  bindTm(ov);
}
function bindTm(ov){ ov.querySelectorAll("[data-ckx]").forEach(function(b){ b.onclick = function(){ var t = CK.tm[+b.getAttribute("data-ckx")]; if(t){ t.gone = true; if(!t.done) dropTimer(t); } document.getElementById("ckTm").innerHTML = timersHtml(); bindTm(ov); }; }); }
// ---------- sharing ----------
function recipeText(r){
  var mode = R.view, f = scaleF(r), units = R.units || cfgS().units, out = ["🍲 "+r.title];
  if(r.serves) out.push(L2("Hidangan: ","Serves: ")+curServes(r));
  out.push("", L2("BAHAN","INGREDIENTS"));
  r.ing.forEach(function(g){ if(g.h){ out.push("", g.h+":"); return; } var sw = mode==="H" && g.swap && g.st!=="H", q = g.q, u = g.u, uw = g.uw, q2 = g.q2;
    if(sw){ if(g.swap.q!=null){ q = g.swap.q; u = g.swap.u; uw = g.swap.uw||g.swap.u; q2 = null; } else if(q!=null){ q = q*(g.swap.k||1); } }
    out.push("• "+[qtyText(q, q2, u, uw, f, units), sw ? tx(g.swap.name) : g.name].filter(Boolean).join(" ")+(g.note && !sw ? ", "+g.note : "")+(sw ? " ("+L2("ganti ","instead of ")+g.name+")" : "")); });
  var stp = mode==="H" && r.hsteps && r.hsteps.length ? r.hsteps : r.steps, n = 0;
  out.push("", L2("CARA","METHOD")); stp.forEach(function(s){ if(/^§/.test(s)) out.push("", s.replace(/^§\s*/,"")+":"); else out.push((++n)+". "+s); });
  if((r.src||{}).url) out.push("", L2("Sumber: ","Source: ")+r.src.url);
  out.push("", "— My Ihsan · "+(mode==="H" ? L2("versi halal (panduan sahaja, bukan fatwa)","halal version (a guide only, not a fatwa)") : L2("resepi asal","original recipe")));
  return out.join("\n");
}
function cardImage(r){
  var W = 1080, P = 70, c = document.createElement("canvas"), x = c.getContext("2d"), mode = R.view;
  var items = r.ing.filter(function(g){ return !g.h; }).map(function(g){ var sw = mode==="H" && g.swap && g.st!=="H", q = g.q, u = g.u, uw = g.uw; if(sw){ if(g.swap.q!=null){ q = g.swap.q; u = g.swap.u; uw = g.swap.uw||g.swap.u; } else if(q!=null) q = q*(g.swap.k||1); } return {t:[qtyText(q, null, u, uw, 1, "orig"), sw ? tx(g.swap.s||g.swap.name) : g.name].filter(Boolean).join(" "), sw:sw}; });
  var wrap = function(t, w, font){ x.font = font; var words = String(t).split(" "), lines = [], cur = ""; words.forEach(function(wd){ var tt = cur ? cur+" "+wd : wd; if(x.measureText(tt).width > w && cur){ lines.push(cur); cur = wd; } else cur = tt; }); if(cur) lines.push(cur); return lines; };
  var tl = wrap(r.title, W-2*P, "bold 64px sans-serif"), il = []; items.slice(0, 22).forEach(function(it){ wrap("• "+it.t, W-2*P, "36px sans-serif").forEach(function(l, i){ il.push({t:i ? "   "+l : l, sw:it.sw}); }); });
  var Hh = 230 + tl.length*76 + 60 + il.length*50 + 170; c.width = W; c.height = Hh;
  x.fillStyle = "#0b2a1e"; x.fillRect(0, 0, W, Hh); x.fillStyle = "#123d2c"; x.fillRect(30, 30, W-60, Hh-60);
  x.fillStyle = "#c9a646"; x.font = "bold 30px sans-serif"; x.fillText("MY IHSAN · "+(mode==="H" ? L2("RESEPI VERSI HALAL","HALAL VERSION RECIPE") : L2("RESEPI","RECIPE")), P, 110);
  var y = 200; x.fillStyle = "#ffffff"; x.font = "bold 64px sans-serif"; tl.forEach(function(l){ x.fillText(l, P, y); y += 76; });
  y += 20; x.fillStyle = "#c9a646"; x.font = "bold 34px sans-serif"; x.fillText(L2("Bahan","Ingredients")+(r.serves ? " · "+curServes(r)+L2(" hidangan"," servings") : ""), P, y); y += 56;
  il.forEach(function(l){ x.fillStyle = l.sw ? "#7fe0a8" : "#e8efe9"; x.font = "36px sans-serif"; x.fillText(l.t, P, y); y += 50; });
  x.fillStyle = "#9fb8aa"; x.font = "28px sans-serif"; y = Hh - 80; x.fillText((mode==="H" ? "🟢 "+L2("Hijau = tukaran halal. Panduan sahaja, bukan fatwa.","Green = halal swap. A guide only, not a fatwa.") : ""), P, y);
  return c.toDataURL("image/png");
}
// ---------- 0.5.99 (owner): framed PDF, one recipe per A4 page ----------
function pdfMulti(pages, mmW, mmH){ // canvases -> one PDF (a JPEG per page), base64
  var W = (mmW*72/25.4).toFixed(2), Hh = (mmH*72/25.4).toFixed(2), objs = ["<< /Type /Catalog /Pages 2 0 R >>", null], kids = [];
  pages.forEach(function(cv){ var jb = atob(cv.toDataURL("image/jpeg", 0.9).split(",")[1]), pi = objs.length + 1, cs = "q "+W+" 0 0 "+Hh+" 0 0 cm /Im0 Do Q"; kids.push(pi+" 0 R");
    objs.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+W+" "+Hh+"] /Resources << /XObject << /Im0 "+(pi+1)+" 0 R >> >> /Contents "+(pi+2)+" 0 R >>");
    objs.push("<< /Type /XObject /Subtype /Image /Width "+cv.width+" /Height "+cv.height+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+jb.length+" >>\nstream\n"+jb+"\nendstream");
    objs.push("<< /Length "+cs.length+" >>\nstream\n"+cs+"\nendstream"); });
  objs[1] = "<< /Type /Pages /Kids ["+kids.join(" ")+"] /Count "+pages.length+" >>";
  var out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", off = []; objs.forEach(function(o, i){ off.push(out.length); out += (i+1)+" 0 obj\n"+o+"\nendobj\n"; });
  var xr = out.length; out += "xref\n0 "+(objs.length+1)+"\n0000000000 65535 f \n"+off.map(function(o){ return ("0000000000"+o).slice(-10)+" 00000 n \n"; }).join("")+"trailer\n<< /Size "+(objs.length+1)+" /Root 1 0 R >>\nstartxref\n"+xr+"\n%%EOF";
  return btoa(out); }
function loadImg(src){ return new Promise(function(res){ if(!src) return res(null); var im = new Image(); if(!/^data:|^blob:|^file:/.test(src)) im.crossOrigin = "anonymous"; var t = setTimeout(function(){ res(null); }, 4000);
  im.onload = function(){ clearTimeout(t); try{ var c = document.createElement("canvas"); c.width = c.height = 2; c.getContext("2d").drawImage(im, 0, 0, 2, 2); c.toDataURL(); res(im); }catch(e){ res(null); } }; im.onerror = function(){ clearTimeout(t); res(null); }; im.src = src; }); }
function pdfPage(r, im, pg, tot){
  var W = 1240, Hh = 1754, c = document.createElement("canvas"); c.width = W; c.height = Hh; var x = c.getContext("2d"), mode = R.view;
  var GOLD = "#b8912f", INK = "#20302a", PAPER = "#fbf7ec", GREEN = "#1f6b45";
  x.fillStyle = PAPER; x.fillRect(0, 0, W, Hh);
  // frame: a thick gold line, a thin inner line, eight-point stars in the corners, diamonds top and bottom
  x.strokeStyle = GOLD; x.lineWidth = 6; x.strokeRect(40, 40, W-80, Hh-80); x.lineWidth = 2; x.strokeRect(58, 58, W-116, Hh-116);
  var star = function(cx, cy, R1){ x.save(); x.translate(cx, cy); x.fillStyle = GOLD; for(var k = 0; k < 2; k++){ x.save(); x.rotate(k*Math.PI/4); x.fillRect(-R1*0.7, -R1*0.7, R1*1.4, R1*1.4); x.restore(); } x.fillStyle = PAPER; x.beginPath(); x.arc(0, 0, R1*0.45, 0, 7); x.fill(); x.fillStyle = GOLD; x.beginPath(); x.arc(0, 0, R1*0.2, 0, 7); x.fill(); x.restore(); };
  [[49,49],[W-49,49],[49,Hh-49],[W-49,Hh-49]].forEach(function(p){ star(p[0], p[1], 22); });
  [[W/2,49],[W/2,Hh-49]].forEach(function(p){ x.save(); x.translate(p[0], p[1]); x.rotate(Math.PI/4); x.fillStyle = GOLD; x.fillRect(-9, -9, 18, 18); x.restore(); });
  var P = 110, CW = W - 2*P, y = 125;
  x.textAlign = "center"; x.fillStyle = GOLD; x.font = "bold 24px sans-serif"; x.fillText("MY IHSAN  ·  "+(mode==="H" ? L2("RESEPI VERSI HALAL","HALAL VERSION RECIPE") : L2("RESEPI","RECIPE")), W/2, y);
  var wrap = function(t, w, font){ x.font = font; var words = String(t||"").split(/\s+/), lines = [], cur = ""; words.forEach(function(wd){ var tt = cur ? cur+" "+wd : wd; if(x.measureText(tt).width > w && cur){ lines.push(cur); cur = wd; } else cur = tt; }); if(cur) lines.push(cur); return lines; };
  y += 70; x.fillStyle = INK; var tl = wrap(r.title, CW, "bold 54px serif").slice(0, 3); x.font = "bold 54px serif"; tl.forEach(function(l){ x.fillText(l, W/2, y); y += 64; });
  var v = verdict(r), meta = [r.serves ? curServes(r)+L2(" hidangan"," servings") : "", v.n ? "✔ "+L2("Ditukar ","Swapped ")+v.n : "✔ Halal"].filter(Boolean).join("   ·   ");
  x.fillStyle = GREEN; x.font = "26px sans-serif"; x.fillText(meta, W/2, y); y += 22;
  x.strokeStyle = GOLD; x.lineWidth = 2; x.beginPath(); x.moveTo(W/2-160, y); x.lineTo(W/2+160, y); x.stroke(); y += 30;
  x.textAlign = "left";
  if(im && im.width && im.height){ var ih = 330, iw = Math.max(CW*0.5, Math.min(CW, im.width*ih/im.height)), tr = iw/ih, sw = im.width, sh = im.height, ix = (W-iw)/2;
    x.save(); x.beginPath(); x.rect(ix, y, iw, ih); x.clip();
    if(sw/sh > tr){ var nsw = sh*tr; x.drawImage(im, (sw-nsw)/2, 0, nsw, sh, ix, y, iw, ih); } else { var nsh = sw/tr; x.drawImage(im, 0, (sh-nsh)/2, sw, nsh, ix, y, iw, ih); }
    x.restore(); x.strokeStyle = GOLD; x.lineWidth = 3; x.strokeRect(ix, y, iw, ih); y += ih + 40; }
  var items = (r.ing||[]).map(function(g){ if(g.h) return {h:g.h}; var sw = mode==="H" && g.swap && g.st!=="H", q = g.q, u = g.u, uw = g.uw; if(sw){ if(g.swap.q!=null){ q = g.swap.q; u = g.swap.u; uw = g.swap.uw||g.swap.u; } else if(q!=null) q = q*(g.swap.k||1); } return {t:[qtyText(q, null, u, uw, 1, "orig"), sw ? tx(g.swap.s||g.swap.name) : g.name].filter(Boolean).join(" "), sw:sw}; });
  var stp = ((mode==="H" && r.hsteps && r.hsteps.length ? r.hsteps : r.steps) || []).filter(function(s){ return s && !/^§/.test(s); });
  var foot = Hh - 120, avail = foot - y;
  // fit: shrink the text until the ingredients (two columns) and the method fit on the page
  var lay = function(fs){ var lh = fs*1.38, colW = (CW-40)/2, il = []; items.forEach(function(it){ if(it.h){ il.push({t:it.h, hd:1}); return; } wrap("•  "+it.t, colW, fs+"px sans-serif").forEach(function(l, i){ il.push({t:i ? "    "+l : l, sw:it.sw}); }); });
    var half = Math.ceil(il.length/2), ingH = fs*1.6 + half*lh + 30, sl = []; stp.forEach(function(s, i){ wrap(s, CW-50, fs+"px sans-serif").forEach(function(l, j){ sl.push({n:j ? "" : String(i+1), t:l}); }); });
    return {fs:fs, lh:lh, colW:colW, il:il, half:half, sl:sl, tot:ingH + fs*1.6 + sl.length*lh}; };
  var L0 = null; for(var fs = 30; fs >= 17; fs--){ L0 = lay(fs); if(L0.tot <= avail) break; }
  var hd = function(t){ x.fillStyle = GOLD; x.font = "bold "+Math.round(L0.fs*1.05)+"px sans-serif"; x.fillText(t.toUpperCase(), P, y + L0.fs); y += L0.fs*1.6; };
  hd(L2("Bahan-bahan","Ingredients"));
  var y0 = y; L0.il.forEach(function(l, i){ var col = i < L0.half ? 0 : 1, yy = y0 + (col ? i - L0.half : i)*L0.lh + L0.fs; if(yy > foot - 10) return; x.fillStyle = l.hd ? GOLD : l.sw ? GREEN : INK; x.font = (l.hd || l.sw ? "bold " : "")+L0.fs+"px sans-serif"; x.fillText(l.t, P + col*(L0.colW+40), yy); });
  y = y0 + L0.half*L0.lh + 30;
  if(L0.sl.length && y < foot - 60){ hd(L2("Cara memasak","Method"));
    for(var i = 0; i < L0.sl.length; i++){ var l = L0.sl[i], yy = y + L0.fs; if(yy > foot - 10){ x.fillStyle = INK; x.fillText("…", P+50, yy - L0.lh); break; }
      if(l.n){ x.fillStyle = GOLD; x.beginPath(); x.arc(P+16, yy - L0.fs*0.35, L0.fs*0.62, 0, 7); x.fill(); x.fillStyle = "#fff"; x.font = "bold "+Math.round(L0.fs*0.7)+"px sans-serif"; x.textAlign = "center"; x.fillText(l.n, P+16, yy - L0.fs*0.1); x.textAlign = "left"; }
      x.fillStyle = INK; x.font = L0.fs+"px sans-serif"; x.fillText(l.t, P+50, yy); y += L0.lh; } }
  x.strokeStyle = GOLD; x.lineWidth = 1.5; x.beginPath(); x.moveTo(P, foot+20); x.lineTo(W-P, foot+20); x.stroke();
  x.fillStyle = "#7a7464"; x.font = "20px sans-serif"; x.fillText(mode==="H" ? L2("Hijau = tukaran halal. Panduan sahaja, bukan fatwa.","Green = halal swap. A guide only, not a fatwa.") : "My Ihsan", P, foot+55);
  x.textAlign = "right"; x.fillText(pg+" / "+tot, W-P, foot+55); x.textAlign = "left";
  return c; }
function exportPdf(list, done){
  H.toast(L2("Menyediakan PDF…","Making the PDF…"));
  Promise.all(list.map(function(r){ return loadImg(r.img); })).then(function(ims){
    var pages = list.map(function(r, i){ return pdfPage(r, ims[i], i+1, list.length); }), b64 = pdfMulti(pages, 210, 297);
    var nm = (list.length === 1 ? String(list[0].title||"resepi").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").slice(0, 40) || "resepi" : "resepi-"+list.length)+".pdf";
    window.__rcpPdf = {name:nm, pages:pages.length, b64:b64, shot:pages[0].toDataURL("image/jpeg", 0.8)};
    if(H.sharePdf) H.sharePdf(nm, b64, list.length === 1 ? list[0].title : list.length+L2(" resepi"," recipes"));
    else { var a = document.createElement("a"); a.href = "data:application/pdf;base64,"+b64; a.download = nm; document.body.appendChild(a); a.click(); a.remove(); }
    if(done) done(); }); }
// ---------- events ----------
function pickPhoto(mode){
  var N = H.N;
  if(N.pickImage){
    var go2 = function(){ var h = function(d){ H.off("image", h); if(d.cancel) return; if(d.error || !d.data){ H.toast(L2("Gambar tidak dapat dibuka","The image could not be opened")); return; } start({kind:"images", images:[d.data]}); }; H.on("image", h); N.pickImage(mode); };
    if(mode==="camera" && !N.hasPerm("camera")){ var hp = function(p){ if(p.which!=="camera") return; H.off("perm", hp); if(p.granted) go2(); }; H.on("perm", hp); N.requestPerm("camera"); } else go2();
    return;
  }
  var inp = document.getElementById("rFile"); if(!inp) return;
  inp.onchange = function(){ var fs = [].slice.call(inp.files||[], 0, 6); if(!fs.length) return; Promise.all(fs.map(function(f){ return new Promise(function(res){ var fr = new FileReader(); fr.onload = function(){ res(fr.result); }; fr.readAsDataURL(f); }); })).then(function(l){ start({kind:"images", images:l}); }); };
  inp.click();
}
function pickVideo(){
  var N = H.N;
  if(N.pickVideo){ N.pickVideo(); return; }
  var inp = document.getElementById("rVid"); if(!inp) return;
  inp.onchange = function(){ var f = inp.files && inp.files[0]; if(!f) return; busy(L2("Membaca video…","Reading the video…")); framesFromFile(f).then(start, fail); };
  inp.click();
}
function bindAll(el){
  var q = el.querySelector("#rQ"); if(q) q.oninput = function(){ R.q = q.value; var p = q.selectionStart; render(view()); var q2 = document.getElementById("rQ"); if(q2){ q2.focus(); try{ q2.setSelectionRange(p, p); }catch(e){} } };
  var set = el.querySelector("#rSet"); if(set) set.addEventListener("toggle", function(){ R.setOpen = set.open; });
  el.querySelectorAll("[data-rcol]").forEach(function(b){ b.onclick = function(){ R.col = b.getAttribute("data-rcol"); draw(); }; });
  var rl = el.querySelector("[data-rlv]"); if(rl) rl.onclick = function(){ var s = cfgS(); s.lview = s.lview==="list" ? "grid" : "list"; saveS(s); draw(); };
  var rc = el.querySelector("[data-rcs]"); if(rc) rc.onclick = function(){ var s = cfgS(); s.cols = (s.cols||2)>=4 ? 1 : (s.cols||2)+1; saveS(s); draw(); };
  if(H.IbFold) H.IbFold.bind(el, {pick:function(k){ R.col = k; draw(); }, toggle:function(o){ var s = cfgS(); s.fold = o; saveS(s); draw(); },
    add:function(){ H.IbFold.ask("📁 "+L2("Folder baharu","New folder"), "", function(n){ var s = cfgS(); s.folders = s.folders || []; if(s.folders.indexOf(n)<0) s.folders.push(n); saveS(s); R.col = n; draw(); }); },
    menu:function(k){ H.IbFold.menu(k, function(n){ var s = cfgS(); s.folders = (s.folders||[]).filter(function(x){ return x!==k; }); if(s.folders.indexOf(n)<0) s.folders.push(n); saveS(s);
        all().forEach(function(r){ var i = (r.col||[]).indexOf(k); if(i>=0){ r.col[i] = n; r.col = r.col.filter(function(c, j, a){ return a.indexOf(c)===j; }); put(r); } }); if(R.col===k) R.col = n; draw(); },
      function(){ var s = cfgS(); s.folders = (s.folders||[]).filter(function(x){ return x!==k; }); saveS(s); all().forEach(function(r){ if((r.col||[]).indexOf(k)>=0){ r.col = r.col.filter(function(c){ return c!==k; }); put(r); } }); if(R.col===k) R.col = "all"; draw(); }); }});
  el.querySelectorAll("[data-rid]").forEach(function(b){ b.onclick = function(){ var id = b.getAttribute("data-rid"); if(R.sel){ R.sel[id] = !R.sel[id]; draw(); return; } go("r:"+id); }; });
  el.querySelectorAll("[data-rmore]").forEach(function(m){ m.onclick = function(e){ e.stopPropagation(); e.preventDefault(); var r = get(m.getAttribute("data-rmore")); if(r) moreSheet(r, el); }; });
  el.querySelectorAll("[data-radd]").forEach(function(b){ b.onclick = function(){
    var k = b.getAttribute("data-radd"); R.add = false;
    if(k==="link"){ R.mode = "link"; draw(); setTimeout(function(){ var i = document.getElementById("rUrl"); if(i) i.focus(); }, 60); }
    else if(k==="text"){ R.mode = "paste"; draw(); setTimeout(function(){ var i = document.getElementById("rTxt"); if(i) i.focus(); }, 60); }
    else if(k==="cam"){ R.mode = ""; draw(); pickPhoto("camera"); }
    else if(k==="img"){ R.mode = ""; draw(); pickPhoto("gallery"); }
    else if(k==="vid"){ R.mode = ""; draw(); pickVideo(); }
    else if(k==="new"){ R.editNew = null; go("edit:new"); } }; });
  el.querySelectorAll("[data-rset]").forEach(function(b){ b.onclick = function(){ var s = cfgS(); s[b.getAttribute("data-rset")] = b.getAttribute("data-v"); saveS(s); R.setOpen = true; R.units = null; draw(); }; });
  el.querySelectorAll("[data-rv]").forEach(function(b){ b.onclick = function(){ R.view = b.getAttribute("data-rv"); draw(); }; });
  el.querySelectorAll("[data-ru]").forEach(function(b){ b.onclick = function(){ R.units = b.getAttribute("data-ru"); draw(); }; });
  el.querySelectorAll("[data-rmul]").forEach(function(b){ b.onclick = function(){ var r = get(R.page.slice(2)); if(!r) return; var m = +b.getAttribute("data-rmul"); if(r.serves) R.serves = Math.max(1, Math.round(r.serves*m)); else R.mult = m; draw(); }; });
  el.querySelectorAll("[data-rtz]").forEach(function(b){ b.onclick = function(){ var r = get(R.page.slice(2)); if(!r) return; var p = b.getAttribute("data-rtz").split("|"); cook(r, +p[0]); var x = timersIn(CK.s[CK.i])[+p[1]]; if(x) addTimer(x.lab, x.sec); drawCook(); }; });
  el.querySelectorAll("[data-rsv]").forEach(function(b){ b.onclick = function(){ var r = get(R.page.slice(2)); if(!r) return; R.serves = Math.max(1, Math.min(60, curServes(r) + (+b.getAttribute("data-rsv")))); draw(); }; });
  el.querySelectorAll("[data-rpw]").forEach(function(b){ b.onclick = function(){ R.pw += +b.getAttribute("data-rpw"); draw(); }; });
  el.querySelectorAll("[data-rpx]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-rpx").split("|"), p = H.load(PKEY, {}); if(p[a[0]]){ p[a[0]].splice(+a[1], 1); if(!p[a[0]].length) delete p[a[0]]; store(PKEY, p); } draw(); }; });
  el.querySelectorAll("[data-rpadd]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-rpadd"); pickRecipe(L2("Pilih resepi","Choose a recipe"), function(id){ var p = H.load(PKEY, {}); p[k] = p[k]||[]; p[k].push(id); store(PKEY, p); draw(); }); }; });
  el.querySelectorAll("[data-sck]").forEach(function(b){ b.onchange = function(){ var l = H.load(SKEY, []), id = b.getAttribute("data-sck"); l.forEach(function(x){ if(x.id===id) x.d = b.checked; }); store(SKEY, l); var lab = b.closest(".rsi"); if(lab) lab.classList.toggle("dn", b.checked); }; });
  el.querySelectorAll("[data-ri]").forEach(function(b){ b.onclick = function(){
    var a = b.getAttribute("data-ri"), m = R.imp || {};
    if(a==="close"){ R.imp = null; draw(); }
    else if(a==="aion"){ var c = AI().cfg(); c.on = true; if(!AI().PROV[c.prov].nokey && !c.keys[c.prov]) c.prov = "pollinations"; AI().saveCfg(c); var src = m.src; R.imp = null; logStep("— "+L2("AI percuma dihidupkan","Free AI turned on")+" —", "info"); if(src && src.retry) src.retry().then(finish, fail); else if(src) viaAI(src).then(finish, fail); else draw(); }
    else if(a==="aiset"){ R.imp = null; if(window.openSettings) window.openSettings("ai"); }
    else if(a==="web"){ readWeb(m.url, m.kind, m.extra); }
    else if(a==="capgo"){ var t = (document.getElementById("rPasteCap")||{}).value || ""; if(t.trim().length < 20){ H.toast(L2("Tampal kapsyen atau resepi dahulu","Paste the caption or recipe first")); return; }
      var src2 = {kind:m.kind||"text", url:m.url||"", text:"Post caption / recipe text:\n"+t+(m.extra ? "\n\nShared text:\n"+m.extra : ""), video:m.kind!=="web"}; R.imp = null;
      (AI().ready() ? viaAI(src2) : Promise.resolve(offlineText(t, ""))).then(function(rec){ if(m.url && rec.src){ rec.src.url = m.url; rec.src.kind = m.kind||rec.src.kind; } return finish(rec); }, fail); }
    else if(a==="retry"){ var s3 = m.src; R.imp = null; LOG.push({m:"— "+L2("cuba lagi","try again")+" —", s:"info"}); if(s3) viaAI(s3).then(finish, fail); }
    else if(a==="free"){ var s4 = m.src; R.imp = null; LOG.push({m:"— "+L2("AI percuma","free AI")+" —", s:"info"}); if(s4){ R.useFree = true; viaAI(s4).then(finish, fail); } }
    else if(a==="copy"){ var rep0 = report(m); if(H.N.copyText) H.N.copyText(rep0); else { try{ navigator.clipboard.writeText(rep0); }catch(e){} } H.toast(L2("Butiran disalin. Tampal dalam mesej.","Details copied. Paste them in a message.")); }
    else if(a==="app"){ appSheet(m.src); }
    else if(a==="apppaste"){ var tx0 = (H.N.clipText ? H.N.clipText() : "") || ""; if(!tx0.trim()){ try{ navigator.clipboard.readText().then(function(t){ useAppAnswer(t, m); }, function(){ H.toast(L2("Papan keratan kosong. Salin jawapan dalam aplikasi AI dahulu.","The clipboard is empty. Copy the answer in the AI app first.")); }); }catch(e){} return; } useAppAnswer(tx0, m); }
    else if(a==="appgo"){ useAppAnswer((document.getElementById("rAppAns")||{}).value||"", m); }
    else if(a==="appagain"){ sendToApp(m.app, m.src); }
    else if(a==="paste"){ R.imp = null; R.mode = "paste"; draw(); }
  }; });
  el.querySelectorAll("[data-ra]").forEach(function(b){ b.onclick = function(){ act(b.getAttribute("data-ra"), el); }; });
}
function moreSheet(r, el){ var A = [["cook","👨‍🍳","Mula masak","Start cooking"],["shop","🛒","Ke senarai beli","To shopping list"],["plan","🍱","Rancang","Plan"],["fav", r.fav ? "★" : "☆", r.fav ? "Buang kegemaran" : "Kegemaran", r.fav ? "Unfavourite" : "Favourite"],
    ["col","📁","Koleksi","Collection"],["edit","✏️","Sunting","Edit"],["share","📤","Kongsi teks","Share text"],["card","🖼️","Kad resepi","Recipe card"],["pdf","📄","PDF berbingkai","Framed PDF"],["ai","✨","Semak semula dengan AI","Re-check with AI"],["del","🗑️","Padam","Delete"]];
  var ov = H.showSheet("⋮ "+esc(r.title), '<div class="rmoreL">'+A.map(function(x, i){ return '<button class="btn '+(i ? 'alt' : 'gold')+' g3d" data-rma="'+x[0]+'">'+x[1]+' '+L2(x[2], x[3])+'</button>'; }).join("")+'</div>');
  ov.querySelectorAll("[data-rma]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-rma"); H.closeOverlay(); setTimeout(function(){ act(a, el, r); }, 30); }; }); }
function act(a, el, rr){
  var r = rr || (R.page.indexOf("r:")===0 ? get(R.page.slice(2)) : null), N = H.N;
  if(a==="add"){ R.add = !R.add; R.mode = ""; draw(); return; }
  if(a==="info"){ R.info = !R.info; draw(); return; }
  if(a==="pdfsel"){ R.sel = R.sel ? null : {}; draw(); return; }
  if(a==="pdfall"){ var ids = R.selShown || []; var allOn = ids.length && ids.every(function(i){ return R.sel[i]; }); R.sel = {}; if(!allOn) ids.forEach(function(i){ R.sel[i] = 1; }); draw(); return; }
  if(a==="pdfgo"){ var pick = all().filter(function(x){ return R.sel && R.sel[x.id]; }); if(!pick.length){ H.toast(L2("Pilih sekurang-kurangnya satu resepi","Pick at least one recipe")); return; } exportPdf(pick, function(){ R.sel = null; draw(); }); return; }
  if(a==="pdf" && rr){ exportPdf([rr]); return; }
  if(a==="linkgo"){ var u = ((el.querySelector("#rUrl")||{}).value||"").trim(); if(!/^https?:\/\//i.test(u)){ u = firstUrl(u) || (/^[\w-]+(\.[\w-]+)+/.test(u) ? "https://"+u : ""); } if(!u){ H.toast(L2("Tampal pautan yang bermula dengan https://","Paste a link that starts with https://")); return; } start({kind:"text", url:u, text:""}); return; }
  if(a==="textgo"){ var t = ((el.querySelector("#rTxt")||{}).value||""); if(t.trim().length < 20){ H.toast(L2("Taip atau tampal resepi dahulu","Type or paste a recipe first")); return; } start({kind:"text", text:t}); return; }
  if(a==="back"){ go("list"); return; }
  if(a==="back2"){ go("r:"+R.page.slice(5)); return; }
  if(a==="esave"){ saveEdit(el); return; }
  if(a==="exp"){ var data = JSON.stringify({app:"My Ihsan", type:"recipes", v:1, t:Date.now(), recipes:all(), plan:H.load(PKEY, {}), shop:H.load(SKEY, [])}); if(N.saveFile) N.saveFile("my-ihsan-resepi.json", data); else { var aa = document.createElement("a"); aa.href = URL.createObjectURL(new Blob([data], {type:"application/json"})); aa.download = "my-ihsan-resepi.json"; aa.click(); } return; }
  if(a==="imp"){ var take = function(body){ try{ var j = JSON.parse(body); if(j.type!=="recipes" || !Array.isArray(j.recipes)) throw 0; var l = all(), have = {}; l.forEach(function(x){ have[x.id] = 1; }); var n = 0; j.recipes.forEach(function(x){ if(x && x.id && !have[x.id]){ l.push(x); n++; } }); store(KEY, l); H.toast(n+L2(" resepi diimport"," recipes imported")); draw(); }catch(e){ H.toast(L2("Fail ini bukan sandaran resepi My Ihsan","This file is not a My Ihsan recipe backup")); } };
    if(N.openFile){ window.IbOpenOnce = take; N.openFile(); } else { var fi = document.createElement("input"); fi.type = "file"; fi.accept = ".json,application/json"; fi.onchange = function(){ var f = fi.files[0]; if(f) f.text().then(take); }; fi.click(); } return; }
  if(a==="sttsave"){ var key = ((el.querySelector("#rSttKey")||{}).value||"").trim(), s = cfgS(), c = AI().cfg(), sk = (s.stt==="gemini"||s.stt==="openai") ? s.stt : "groq"; c.keys[sk] = key; AI().saveCfg(c);  H.toast(key ? L2("Kunci disimpan","Key saved") : L2("Kunci dipadam","Key removed")); R.setOpen = true; draw(); return; }
  if(a==="sttkey"){ var gu = cfgS().stt==="gemini" ? "https://aistudio.google.com/apikey" : "https://console.groq.com/keys"; if(N.openUrl) N.openUrl(gu); else window.open(gu); return; }
  if(a==="sadd"){ var nv = ((el.querySelector("#sNew")||{}).value||"").trim(); if(!nv) return; var p0 = parseIng(nv), l0 = H.load(SKEY, []); l0.push({id:"s"+Date.now().toString(36), k:p0.name.toLowerCase()+"|"+(p0.u||p0.uw), n:p0.name, q:p0.q, u:p0.u, uw:p0.uw, a:aisleOf(p0.name), d:false, r:[], h:offline(p0).st!=="H" || !!offline(p0).tip}); store(SKEY, l0); draw(); setTimeout(function(){ var i = document.getElementById("sNew"); if(i) i.focus(); }, 50); return; }
  if(a==="sshare"){ var st = shopText(); if(N.shareText) N.shareText(st); else { try{ navigator.clipboard.writeText(st); }catch(e){} H.toast(L2("Disalin","Copied")); } return; }
  if(a==="sdone"){ store(SKEY, H.load(SKEY, []).filter(function(x){ return !x.d; })); draw(); return; }
  if(a==="sclr"){ if(confirm(L2("Kosongkan senarai beli?","Clear the shopping list?"))){ store(SKEY, []); draw(); } return; }
  if(a==="weekshop"){ var p = H.load(PKEY, {}), m = monday(R.pw), n = 0; for(var i=0;i<7;i++){ var d = new Date(m); d.setDate(m.getDate()+i); (p[ymd(d)]||[]).forEach(function(id){ var rr = get(id); if(rr){ shopAdd(rr, 1); n++; } }); }
    H.toast(n ? n+L2(" resepi dimasukkan ke senarai beli", n===1 ? " recipe added to the shopping list" : " recipes added to the shopping list") : L2("Tiada resepi dirancang minggu ini","No recipes planned this week")); if(n) go("shop"); return; }
  if(!r) return;
  if(a==="src"){ var su = r.src.link || r.src.url; if(N.openUrl) N.openUrl(su); else window.open(su); return; }
  if(a==="revok"){ r.review = false; put(r); draw(); return; }
  if(a==="cook"){ cook(r); return; }
  if(a==="shop"){ var f = r.serves && curServes(r) ? curServes(r)/r.serves : 1, c2 = shopAdd(r, f); H.toast(c2+L2(" bahan dimasukkan ke senarai beli"," items added to the shopping list")); return; }
  if(a==="plan"){ planSheet(r); return; }
  if(a==="fav"){ r.fav = !r.fav; put(r); draw(); return; }
  if(a==="col"){ var cols = {}; folders().forEach(function(c){ cols[c] = 1; });
    var ov = H.showSheet("📁 "+L2("Koleksi","Collections"), '<div class="rpd">'+Object.keys(cols).sort().map(function(c){ return '<button class="chip'+(r.col.indexOf(c)>=0 ? ' on' : '')+'" data-pc="'+esc(c)+'">'+esc(c)+'</button>'; }).join("")+'</div><div class="radd" style="margin-top:10px"><input id="rcNew" class="rin" placeholder="'+L2("Koleksi baharu (cth. Sarapan, Raya)","New collection (e.g. Breakfast, Raya)")+'"><button class="btn gold" id="rcAdd">＋</button></div>', function(){ draw(); });
    ov.querySelectorAll("[data-pc]").forEach(function(b){ b.onclick = function(){ var c = b.getAttribute("data-pc"), j = r.col.indexOf(c); if(j>=0) r.col.splice(j, 1); else r.col.push(c); put(r); b.classList.toggle("on"); }; });
    ov.querySelector("#rcAdd").onclick = function(){ var c = ov.querySelector("#rcNew").value.trim(); if(c && r.col.indexOf(c)<0){ r.col.push(c); put(r); } H.closeOverlay(); draw(); };
    return; }
  if(a==="edit"){ go("edit:"+r.id); return; }
  if(a==="share"){ var t2 = recipeText(r); if(N.shareText) N.shareText(t2); else { try{ navigator.clipboard.writeText(t2); }catch(e){} H.toast(L2("Disalin","Copied")); } return; }
  if(a==="card"){ var img = cardImage(r); if(N.shareImage) N.shareImage(img, r.title); else { var a2 = document.createElement("a"); a2.href = img; a2.download = "resepi.png"; a2.click(); } return; }
  if(a==="ai"){ if(!AI().ready()){ R.page = "list"; R.imp = {need:"ai", src:null}; draw(); return; }
    var srcT = {kind:r.src.kind, url:r.src.url, author:r.author, title:r.title, img:r.img, text:"Recipe to check and make halal:\n"+recipeTextPlain(r)};
    busy(L2("AI sedang menyemak semula…","The AI is re-checking…")); R.page = "list"; draw();
    aiRecipe(srcT).then(function(n2){ n2.id = r.id; n2.t = r.t; n2.col = r.col; n2.fav = r.fav; n2.notes = r.notes; n2.img = r.img; n2.src = r.src; n2.title = r.title; n2.review = false; n2.missing = ""; enforce(n2); put(n2); R.imp = null; H.toast(L2("Disemak semula","Re-checked")); go("r:"+r.id); }, fail);
    return; }
  if(a==="del"){ if(confirm(L2("Padam resepi ini?","Delete this recipe?"))){ del(r.id); go("list"); } return; }
}
function recipeTextPlain(r){ return r.title+(r.serves ? "\nServes "+r.serves : "")+"\n\nIngredients:\n"+r.ing.map(ingLine).join("\n")+"\n\nMethod:\n"+(r.steps||[]).map(function(s, i){ return (i+1)+". "+s; }).join("\n"); }

// ---------------- entry points ----------------
window.HalalRecipe = {
  init:function(h){ H = h; },
  page:function(){ return R.page; },
  tabs:tabs, bindTabs:bindTabs, render:function(el, h){ if(h) H = h; render(el); },
  open:function(p){ R.page = p || "list"; },
  // a share from another app (stored by app.js in window.__rcpShare)
  take:function(){
    var d = window.__rcpShare; if(!d) return false;
    if(d.kind==="start"){ R.page = "list"; R.imp = {busy:true, msg:L2("Menerima daripada aplikasi lain…","Receiving from the other app…")}; return true; }
    window.__rcpShare = null; R.imp = null;
    if(d.error){ R.page = "list"; R.imp = {err:L2("Fail yang dikongsi tidak dapat dibaca.","The shared file could not be read.")}; return true; }
    setTimeout(function(){ start(d); }, 30); R.page = "list"; return true;
  },
  navGet:function(){ return {k:R.page, p:R.page}; },
  navSet:function(s){ if(s && s.p){ R.page = s.p; R.imp = R.imp && R.imp.busy ? R.imp : null; } },
  // for tests
  _h:function(){ return H; },
  _t:{videoUrls:videoUrls, sttList:sttList, parseIng:parseIng, fmtNum:fmtNum, conv:conv, offline:offline, enforce:enforce, verdict:verdict, findLD:findLD, fromLD:fromLD, dom:dom, offlineText:offlineText, parseJson:parseJson, fromAI:fromAI, igCaption:igCaption, kindOf:kindOf, ytId:ytId, timersIn:timersIn, aisleOf:aisleOf, qtyText:qtyText}
};
})();
