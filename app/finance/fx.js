/* 0.4.8 Kewangan › Tukaran (currency converter): any two currencies, a rate chart (1W..10Y), favourite pairs with sparklines,
   phone widgets per favourite (CurrencyWidget.java). Data: Frankfurter (free, no key; central-bank daily reference rates), wrapped
   in fxLatest / fxSeries so another provider can be swapped in. Currencies pegged to the US dollar (SAR, AED, QAR, OMR, BHD, JOD)
   and BND (= SGD) are worked out through USD / SGD, because the reference list does not carry them. Cached for offline use. */
(function(){
"use strict";
var H = null, KEY = "ihsan_fx", ST = null, chartPts = [], seq = 0;
var PEG = {SAR:["USD",3.75], AED:["USD",3.6725], QAR:["USD",3.64], OMR:["USD",0.3845], BHD:["USD",0.376], JOD:["USD",0.709], BND:["SGD",1]};
var PEGNAME = {SAR:["Riyal Saudi","Saudi Riyal"], AED:["Dirham UAE","UAE Dirham"], QAR:["Riyal Qatar","Qatari Riyal"], OMR:["Rial Oman","Omani Rial"], BHD:["Dinar Bahrain","Bahraini Dinar"], JOD:["Dinar Jordan","Jordanian Dinar"], BND:["Dolar Brunei","Brunei Dollar"], PKR:["Rupee Pakistan","Pakistani Rupee"]};
// 0.5.69 (owner): Pakistani rupee. Not in the ECB list, so it goes through USD with a free daily USD rate (open.er-api, then the jsDelivr currency-api)
var EXT = {PKR:1};
var BASE_LIST = {AUD:"Australian Dollar",BRL:"Brazilian Real",CAD:"Canadian Dollar",CHF:"Swiss Franc",CNY:"Chinese Renminbi Yuan",CZK:"Czech Koruna",DKK:"Danish Krone",EUR:"Euro",GBP:"British Pound",HKD:"Hong Kong Dollar",HUF:"Hungarian Forint",IDR:"Indonesian Rupiah",ILS:"Israeli New Sheqel",INR:"Indian Rupee",ISK:"Icelandic Króna",JPY:"Japanese Yen",KRW:"South Korean Won",MXN:"Mexican Peso",MYR:"Malaysian Ringgit",NOK:"Norwegian Krone",NZD:"New Zealand Dollar",PHP:"Philippine Peso",PLN:"Polish Złoty",RON:"Romanian Leu",SEK:"Swedish Krona",SGD:"Singapore Dollar",THB:"Thai Baht",TRY:"Turkish Lira",USD:"United States Dollar",ZAR:"South African Rand"};
var RANGES = [["1W",7],["1M",31],["3M",92],["1Y",366],["5Y",1827],["10Y",3653]];
function L(a, b){ return H.L2x(a, b); }
function esc(s){ return H.esc(s==null ? "" : String(s)); }
function st(){ if(ST) return ST; var s = H.load(KEY, null) || {}; /* 0.6.3: abroad or in Arabic, start from the local currency when it is one this page can show */
  var lc = H.cur ? H.cur() : "RM"; lc = lc === "RM" ? "MYR" : lc; if(["MYR","SGD","USD","IDR","SAR","AED","QAR","OMR","BHD","JOD","BND","EUR","GBP","TRY"].indexOf(lc) < 0) lc = "MYR";
  s.favs = s.favs || (lc === "MYR" ? [["MYR","SGD"],["MYR","USD"],["MYR","SAR"],["MYR","IDR"]] : [[lc,"USD"],[lc,"MYR"],[lc,"EUR"],[lc,"GBP"]]); s.recent = s.recent || []; s.set = s.set || {}; s.set.base = s.set.base || lc; s.set.range = s.set.range || "1M"; s.set.fmt = s.set.fmt || "en";
  s.cache = s.cache || {}; s.series = s.series || {}; s.pair = s.pair || [s.set.base, "IDR"]; s.amt = s.amt == null ? 100 : s.amt; ST = s; return s; }
function save(){ var s = st(); var keep = {}; Object.keys(s.series).sort(function(a, b){ return (s.series[b].upd||0) - (s.series[a].upd||0); }).slice(0, 24).forEach(function(k){ keep[k] = s.series[k]; }); s.series = keep; H.save(KEY, s); share(); }
function pk(b, q){ return b+"/"+q; }
function flag(c){ if(c==="EUR") return "🇪🇺"; if(c.length<2) return "🏳"; var a = c.charCodeAt(0)-65, b = c.charCodeAt(1)-65; return String.fromCodePoint(0x1F1E6+a, 0x1F1E6+b); }
function names(){ var s = st(), l = s.curList || BASE_LIST, out = {}; Object.keys(l).forEach(function(k){ out[k] = l[k]; }); Object.keys(PEG).concat(Object.keys(EXT)).forEach(function(k){ out[k] = L(PEGNAME[k][0], PEGNAME[k][1]); }); return out; }
function dec(c, v){ if(c==="JPY"||c==="IDR"||c==="KRW"||c==="HUF"||c==="ISK") return Math.abs(v) >= 100 ? 0 : 2; return Math.abs(v) < 0.01 ? 6 : Math.abs(v) < 1 ? 4 : 2; }
function fmt(v, d, minD){ if(v==null || isNaN(v)) return "–"; return Number(v).toLocaleString(st().set.fmt==="eu" ? "de-DE" : "en-US", {minimumFractionDigits:minD==null ? d : Math.min(minD, d), maximumFractionDigits:d}); }
function ymd(d){ return d.toISOString().slice(0, 10); }

// ---------------- data source (swap here for another provider) ----------------
function getJson(url){ return new Promise(function(res, rej){ H.fetch(url, function(status, body){ if(status>=200 && status<300){ try{ res(JSON.parse(body)); }catch(e){ rej(new Error("bad data")); } } else rej(new Error(status ? "HTTP "+status : L("Tiada internet","No internet"))); }); }); }
// one rate series {date: rate} for real (non-pegged) currencies; tries Frankfurter v1, then v2; parses either shape
function rawSeries(b, q, from, to){
  if(b===q){ var o = {}; o[to] = 1; return Promise.resolve(o); }
  var v1 = "https://api.frankfurter.dev/v1/"+from+".."+to+"?base="+b+"&symbols="+q, v2 = "https://api.frankfurter.dev/v2/rates?base="+b+"&quotes="+q+"&from="+from+"&to="+to;
  return getJson(v1).catch(function(){ return getJson(v2); }).then(function(j){ return parse(j, q); });
}
function parse(j, q){
  var out = {};
  var list = Array.isArray(j) ? j : Array.isArray(j && j.rates) ? j.rates : null;
  if(list){ list.forEach(function(x){ if(x && (x.quote===q || !x.quote) && x.rate!=null) out[x.date] = +x.rate; }); return out; }
  if(j && j.rates){ Object.keys(j.rates).forEach(function(k){ var v = j.rates[k]; if(typeof v==="object") { if(v[q]!=null) out[k] = +v[q]; } else if(k===q) out[j.date||ymd(new Date())] = +v; }); }
  return out;
}
// pegged currencies: through USD / SGD; a series is {date: rate of 1 b in q}
function extRate(c){ var s = st(); s.ext = s.ext || {}; var x = s.ext[c]; if(x && Date.now() - x.upd < 12*3600e3) return Promise.resolve(x.k);
  return getJson("https://open.er-api.com/v6/latest/USD").then(function(j){ var k = j && j.rates && +j.rates[c]; if(!k) throw new Error("no rate"); return k; })
    .catch(function(){ return getJson("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json").then(function(j){ var k = j && j.usd && +j.usd[c.toLowerCase()]; if(!k) throw new Error(L("Tiada kadar","No rate")); return k; }); })
    .then(function(k){ s.ext[c] = {k:k, upd:Date.now()}; return k; }).catch(function(e){ if(x) return x.k; throw e; }); }
function pegOf(c){ if(PEG[c]) return Promise.resolve(PEG[c]); if(EXT[c]) return extRate(c).then(function(k){ return ["USD", k]; }); return Promise.resolve(null); }
function series(b, q, from, to){
  if(!PEG[b] && !PEG[q] && !EXT[b] && !EXT[q]) return rawSeries(b, q, from, to);
  return Promise.all([pegOf(b), pegOf(q)]).then(function(pp){ var pb = pp[0], pq = pp[1];
    var B = pb ? pb[0] : b, Q = pq ? pq[0] : q, kb = pb ? pb[1] : 1, kq = pq ? pq[1] : 1;   // 1 b = (1/kb) B ; 1 Q = kq q
    return rawSeries(B, Q, from, to).then(function(s){ var o = {}; Object.keys(s).forEach(function(d){ o[d] = s[d] / kb * kq; }); return o; }); });
}
function fxLatest(b, q){
  var to = new Date(), from = new Date(Date.now() - 10*864e5);
  return series(b, q, ymd(from), ymd(to)).then(function(s){ var ds = Object.keys(s).sort(); if(!ds.length) throw new Error(L("Tiada kadar","No rate"));
    var r = {r:s[ds[ds.length-1]], prev:ds.length > 1 ? s[ds[ds.length-2]] : null, date:ds[ds.length-1], upd:Date.now()}; st().cache[pk(b, q)] = r; return r; });
}
function fxSeries(b, q, range){
  var days = (RANGES.filter(function(x){ return x[0]===range; })[0]||RANGES[1])[1], to = new Date(), from = new Date(Date.now() - days*864e5), key = pk(b, q)+"|"+range, s = st();
  var c = s.series[key]; if(c && Date.now() - c.upd < 6*3600e3) return Promise.resolve(c.pts);
  return series(b, q, ymd(from), ymd(to)).then(function(o){ var pts = Object.keys(o).sort().map(function(d){ return [d, o[d]]; });
    if(pts.length > 240){ var step = pts.length / 240, k = []; for(var i=0;i<240;i++) k.push(pts[Math.floor(i*step)]); k.push(pts[pts.length-1]); pts = k; }
    s.series[key] = {upd:Date.now(), pts:pts}; return pts; }).catch(function(e){ if(c) return c.pts; throw e; });
}
function fxCurrencies(){
  var s = st(); if(s.curList && Date.now() - (s.curUpd||0) < 30*864e5) return Promise.resolve(s.curList);
  return getJson("https://api.frankfurter.dev/v1/currencies").catch(function(){ return getJson("https://api.frankfurter.dev/v2/currencies"); }).then(function(j){
    var l = {}; if(Array.isArray(j)) j.forEach(function(x){ if(x.iso_code||x.code) l[x.iso_code||x.code] = x.name||x.iso_code||x.code; }); else Object.keys(j||{}).forEach(function(k){ l[k] = typeof j[k]==="string" ? j[k] : (j[k].name||k); });
    if(Object.keys(l).length > 5){ s.curList = l; s.curUpd = Date.now(); save(); } return s.curList || BASE_LIST; }).catch(function(){ return BASE_LIST; });
}
// share favourites, rates and 1-month sparklines with the phone widgets
function share(){
  var N = H.N, s = st(); if(!window.Native || !N.fxSave) return;
  var rates = {}; s.favs.forEach(function(f){ var k = pk(f[0], f[1]), c = s.cache[k]; if(!c) return; var sp = s.series[k+"|1M"]; rates[k] = {r:c.r, prev:c.prev, date:c.date, upd:c.upd, spark:sp ? sp.pts.map(function(p){ return +p[1].toPrecision(6); }) : []}; });
  try{ N.fxSave(JSON.stringify({favs:s.favs, rates:rates, fmt:s.set.fmt, lang:H.S.lang})); }catch(e){}
}

// ---------------- page ----------------
function view(el){
  var s = st(), b = s.pair[0], q = s.pair[1], nm = names(), c = s.cache[pk(b, q)], fav = s.favs.some(function(f){ return f[0]===b && f[1]===q; });
  var h = '<div class="card fxbox"><div class="fxrow"><button class="fxcur" data-pick="0">'+flag(b)+' <b>'+b+'</b> ▾</button><button class="fxswap" id="fxSwap" title="⇄">⇄</button><button class="fxcur" data-pick="1">'+flag(q)+' <b>'+q+'</b> ▾</button><button class="fxmore" id="fxMore">⋮</button></div>'+
    '<div class="fxamt"><input id="fxAmt" type="text" inputmode="decimal" value="'+esc(fmtIn(s.amt))+'"><span>'+b+'</span></div>'+
    '<div class="fxres" id="fxRes"></div><div class="fxrate" id="fxRate"></div>'+
    '<div class="fxchips">'+RANGES.map(function(r){ return '<button class="chip'+(r[0]===(s.range||s.set.range) ? ' on' : '')+'" data-rg="'+r[0]+'">'+r[0]+'</button>'; }).join("")+'<span style="flex:1"></span><button class="chip fxstar'+(fav ? ' on' : '')+'" id="fxStar">'+(fav ? '★' : '☆')+'</button></div>'+
    '<div class="fxchart" id="fxChart"><div class="mut small">…</div></div><div class="mut tiny fxsrc">'+L("Kadar harian (kadar rujukan bank pusat, Frankfurter). Bukan kadar masa nyata; kadar penukar wang berbeza.","Daily rate (central-bank reference rates, Frankfurter). Not live; money changers' rates differ.")+(PEG[b]||PEG[q] ? ' '+L("SAR/AED/QAR/OMR/BHD/JOD ditambat pada USD, BND pada SGD.","SAR/AED/QAR/OMR/BHD/JOD are pegged to USD, BND to SGD.") : '')+(EXT[b]||EXT[q] ? ' '+L("PKR dikira melalui USD dengan kadar harian terkini (open.er-api); carta mengikut pergerakan USD.","PKR goes through USD at the latest daily rate (open.er-api); the chart follows the USD movement.") : '')+'</div></div>'+
    '<div class="card"><h3>🔔 '+L("Amaran kadar","Rate alerts")+'</h3><div id="fxAl"></div></div>'+
    '<div class="card"><h3>⭐ '+L("Pasangan kegemaran","Favourite pairs")+'</h3><div id="fxFavs"></div><div class="mut tiny" style="margin-top:6px">'+L("Ketik untuk buka. Tekan lama untuk alih atau buang. Widget telefon: tekan lama skrin utama › Widget › Kadar mata wang.","Tap to open. Long-press to move or remove. Phone widget: long-press the home screen › Widgets › Currency rate.")+'</div></div>';
  el.innerHTML = h; bind(el); calc(); rateLine(); chart(); favs(); alertsUi();
  if(!c || Date.now() - (c.upd||0) > 3*3600e3) refresh(b, q);
}
function fmtIn(v){ return String(v==null ? "" : v); }
function amount(){ var t = String(document.getElementById("fxAmt").value||"").replace(/\s/g, ""); if(st().set.fmt==="eu") t = t.replace(/\./g, "").replace(",", "."); else t = t.replace(/,/g, ""); var v = parseFloat(t); return isNaN(v) ? 0 : v; }
function calc(){ var s = st(), b = s.pair[0], q = s.pair[1], c = s.cache[pk(b, q)], el = document.getElementById("fxRes"); if(!el) return; var a = amount(); s.amt = a;
  el.innerHTML = c ? '<b>'+fmt(a, dec(b, a), 0)+' '+b+' = '+fmt(a*c.r, dec(q, a*c.r))+' '+q+'</b>' : '<span class="mut">'+L("Memuatkan kadar…","Loading the rate…")+'</span>'; }
function rateLine(){ var s = st(), b = s.pair[0], q = s.pair[1], c = s.cache[pk(b, q)], el = document.getElementById("fxRate"); if(!el) return; if(!c){ el.innerHTML = ''; return; }
  var ch = c.prev ? (c.r - c.prev) / c.prev * 100 : null;
  el.innerHTML = '1 '+b+' = <b>'+fmt(c.r, dec(q, c.r))+' '+q+'</b> '+(ch==null ? '' : '<span class="'+(ch>=0 ? 'fxup' : 'fxdn')+'">'+(ch>=0 ? '▲' : '▼')+Math.abs(ch).toFixed(2)+'%</span>')+
    '<div class="mut tiny">'+L("Kadar harian · ","Daily rate · ")+c.date+' · '+L("Dikemas kini ","Updated ")+new Date(c.upd).toLocaleString(ibLoc(H.S.lang==="en"), {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})+'</div>'; }
function refresh(b, q){ var my = ++seq; fxLatest(b, q).then(function(){ save(); if(my!==seq) return; calc(); rateLine(); favs(); }, function(e){ var el = document.getElementById("fxRate"); if(el && !st().cache[pk(b, q)]) el.innerHTML = '<span class="mut small">⚠ '+esc(e.message||e)+'</span>'; }); }
function chart(){
  var s = st(), b = s.pair[0], q = s.pair[1], rg = s.range || s.set.range, box = document.getElementById("fxChart"), my = seq;
  fxSeries(b, q, rg).then(function(pts){ save(); if(!document.getElementById("fxChart")) return; chartPts = pts; drawChart(box, pts, q); }, function(e){ if(box) box.innerHTML = '<div class="mut small">⚠ '+esc(L("Carta tidak dapat dimuatkan: ","The chart could not load: ")+(e.message||e))+'</div>'; });
}
function drawChart(box, pts, q, hi){
  if(!pts.length){ box.innerHTML = '<div class="mut small">'+L("Tiada data","No data")+'</div>'; return; }
  var W = 320, Hh = 150, pr = 46, vs = pts.map(function(p){ return p[1]; }), mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs), pad = (mx - mn) * 0.08 || mx * 0.01 || 1, lo = mn - pad, up = mx + pad;
  var X = function(i){ return pts.length < 2 ? (W - pr) / 2 : i / (pts.length - 1) * (W - pr); }, Y = function(v){ return 8 + (1 - (v - lo) / (up - lo)) * (Hh - 24); };
  var line = pts.map(function(p, i){ return (i ? "L" : "M")+X(i).toFixed(1)+" "+Y(p[1]).toFixed(1); }).join(" "), last = pts.length - 1, upT = vs[last] >= vs[0], col = upT ? "#3fb27f" : "#e5484d";
  var h = '<svg viewBox="0 0 '+W+' '+Hh+'" class="fxsvg" preserveAspectRatio="none"><defs><linearGradient id="fxg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".35"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>'+
    '<path d="'+line+' L'+X(last).toFixed(1)+' '+(Hh-16)+' L0 '+(Hh-16)+' Z" fill="url(#fxg)"/><path d="'+line+'" fill="none" stroke="'+col+'" stroke-width="2" vector-effect="non-scaling-stroke"/>'+
    '<circle cx="'+X(last)+'" cy="'+Y(vs[last])+'" r="4" fill="'+col+'" stroke="#fff" stroke-width="1.5"/>'+
    '<text x="'+(W-pr+4)+'" y="'+(Y(mx)+4)+'" class="fxax">'+fmt(mx, dec(q, mx))+'</text><text x="'+(W-pr+4)+'" y="'+(Y(mn)+4)+'" class="fxax">'+fmt(mn, dec(q, mn))+'</text>'+
    '<text x="0" y="'+(Hh-2)+'" class="fxax">'+pts[0][0]+'</text><text x="'+(W-pr)+'" y="'+(Hh-2)+'" class="fxax" text-anchor="end">'+pts[last][0]+'</text>';
  if(hi!=null){ h += '<line x1="'+X(hi)+'" x2="'+X(hi)+'" y1="4" y2="'+(Hh-16)+'" stroke="#c9a646" stroke-dasharray="3 3"/><circle cx="'+X(hi)+'" cy="'+Y(vs[hi])+'" r="4" fill="#c9a646"/>'; }
  h += '</svg><div class="fxtip" id="fxTip">'+(hi!=null ? pts[hi][0]+' · <b>'+fmt(vs[hi], dec(q, vs[hi]))+' '+q+'</b>' : L("Tekan dan tahan carta untuk kadar pada tarikh.","Touch and hold the chart for the rate on a date."))+'</div>';
  box.innerHTML = h;
  var svg = box.querySelector("svg"), pick = function(e){ var r = svg.getBoundingClientRect(), t = e.touches ? e.touches[0] : e, f = (t.clientX - r.left) / r.width * W / (W - pr); var i = Math.max(0, Math.min(last, Math.round(f * last))); drawChart(box, pts, q, i); };
  svg.addEventListener("touchstart", function(e){ pick(e); }, {passive:true}); svg.addEventListener("touchmove", function(e){ e.preventDefault(); pick(e); }, {passive:false}); svg.addEventListener("mousedown", pick);
}
function spark(pts, w, h){ if(!pts || pts.length < 2) return ''; var vs = pts.map(function(p){ return p[1]; }), mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs), r = mx - mn || 1, col = vs[vs.length-1] >= vs[0] ? "#3fb27f" : "#e5484d";
  return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'"><path d="'+vs.map(function(v, i){ return (i ? "L" : "M")+(i/(vs.length-1)*w).toFixed(1)+" "+(h - 2 - (v - mn) / r * (h - 4)).toFixed(1); }).join(" ")+'" fill="none" stroke="'+col+'" stroke-width="1.6"/></svg>'; }
function favs(){
  var s = st(), box = document.getElementById("fxFavs"); if(!box) return;
  box.innerHTML = s.favs.length ? s.favs.map(function(f, i){ var c = s.cache[pk(f[0], f[1])], sp = s.series[pk(f[0], f[1])+"|1M"], ch = c && c.prev ? (c.r - c.prev) / c.prev * 100 : null;
    return '<div class="fxfav" data-fv="'+i+'"><span class="fxfp">'+flag(f[0])+' '+f[0]+' → '+flag(f[1])+' '+f[1]+'</span><span class="fxsp">'+spark(sp ? sp.pts : null, 64, 22)+'</span><span class="fxfr"><b>'+(c ? fmt(c.r, dec(f[1], c.r)) : '…')+'</b>'+(ch==null ? '' : '<small class="'+(ch>=0 ? 'fxup' : 'fxdn')+'">'+(ch>=0 ? '▲' : '▼')+Math.abs(ch).toFixed(2)+'%</small>')+'</span></div>'; }).join("") : '<div class="mut small">'+L("Tiada kegemaran. Tekan ☆ untuk menambah.","No favourites. Tap ☆ to add one.")+'</div>';
  box.querySelectorAll("[data-fv]").forEach(function(r){ var i = +r.getAttribute("data-fv"), t = null, long = false;
    r.onclick = function(){ if(long) return; s.pair = s.favs[i].slice(); save(); view(document.getElementById("fxHost")); };
    r.oncontextmenu = function(e){ e.preventDefault(); long = true; favMenu(i); setTimeout(function(){ long = false; }, 400); };
    r.addEventListener("touchstart", function(){ long = false; t = setTimeout(function(){ long = true; favMenu(i); }, 550); }, {passive:true}); r.addEventListener("touchend", function(){ clearTimeout(t); }); r.addEventListener("touchmove", function(){ clearTimeout(t); }, {passive:true}); });
  // fill missing rates / sparklines for favourites (one at a time)
  var need = s.favs.filter(function(f){ var c = s.cache[pk(f[0], f[1])]; return !c || Date.now() - (c.upd||0) > 3*3600e3 || !s.series[pk(f[0], f[1])+"|1M"]; });
  if(need.length && !favs.busy){ favs.busy = true; var f = need[0]; fxLatest(f[0], f[1]).then(function(){ return fxSeries(f[0], f[1], "1M"); }).then(function(){ save(); favs.busy = false; favs(); }, function(){ favs.busy = false; }); }
}
function favMenu(i){
  var s = st(), f = s.favs[i];
  var ov = H.showSheet(flag(f[0])+' '+f[0]+' → '+flag(f[1])+' '+f[1], '<div class="btns" style="flex-direction:column"><button class="btn alt" data-fm="up">▲ '+L("Alih ke atas","Move up")+'</button><button class="btn alt" data-fm="down">▼ '+L("Alih ke bawah","Move down")+'</button><button class="btn alt" data-fm="del">🗑 '+L("Buang","Remove")+'</button></div>');
  ov.querySelectorAll("[data-fm]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-fm"), j = a==="up" ? i-1 : i+1;
    if(a==="del") s.favs.splice(i, 1); else if(j>=0 && j<s.favs.length){ var t = s.favs[i]; s.favs[i] = s.favs[j]; s.favs[j] = t; }
    save(); H.closeOverlay(); favs(); var star = document.getElementById("fxStar"); if(star) view(document.getElementById("fxHost")); }; });
}
function pickCur(side){
  var s = st(), nm = names(), codes = Object.keys(nm).sort(), top = [];
  s.favs.forEach(function(f){ [f[0], f[1]].forEach(function(c){ if(top.indexOf(c)<0) top.push(c); }); }); s.recent.forEach(function(c){ if(top.indexOf(c)<0) top.unshift(c); });
  var ov = H.showSheet("💱 "+L("Pilih mata wang","Choose a currency"), '<input id="fxQ" class="rin" placeholder="'+L("Taip untuk cari","Type to search")+'" style="margin-bottom:8px"><div id="fxL" class="fxlist"></div>');
  var row = function(c){ return '<button class="hhist" data-cc="'+c+'"><span style="font-size:20px">'+flag(c)+'</span><span class="hhs"><b>'+c+'</b> · '+esc(nm[c]||c)+'</span></button>'; };
  var ALIAS = {riyal:"SAR", rial:"SAR", ringgit:"MYR", rupiah:"IDR", dolar:"USD", dollar:"USD", baht:"THB", yen:"JPY", euro:"EUR", pound:"GBP", paun:"GBP", yuan:"CNY", won:"KRW", dirham:"AED", rupee:"INR", rupi:"PKR", pakistan:"PKR", dinar:"JOD"};
  var fill = function(){ var t = ov.querySelector("#fxQ").value.trim().toLowerCase(), list;
    if(!t) list = top.filter(function(c){ return nm[c]; }).concat(['—']).concat(codes.filter(function(c){ return top.indexOf(c)<0; }));
    else list = codes.filter(function(c){ return c.toLowerCase().indexOf(t)>=0 || String(nm[c]).toLowerCase().indexOf(t)>=0 || Object.keys(ALIAS).some(function(a){ return a.indexOf(t)===0 && ALIAS[a]===c; }); });
    ov.querySelector("#fxL").innerHTML = list.map(function(c){ return c==='—' ? '<div class="fxsep"></div>' : row(c); }).join("") || '<div class="mut small">'+L("Tiada padanan","No match")+'</div>';
    ov.querySelectorAll("[data-cc]").forEach(function(b){ b.onclick = function(){ var c = b.getAttribute("data-cc"); s.pair[side] = c; s.recent = [c].concat(s.recent.filter(function(x){ return x!==c; })).slice(0, 6); save(); H.closeOverlay(); view(document.getElementById("fxHost")); }; }); };
  ov.querySelector("#fxQ").oninput = fill; fill(); fxCurrencies().then(function(){ nm = names(); codes = Object.keys(nm).sort(); fill(); });
  setTimeout(function(){ try{ ov.querySelector("#fxQ").focus(); }catch(e){} }, 80);
}
function settings(){
  var s = st(), seg = function(k, list){ return '<div class="rseg">'+list.map(function(o){ return '<button class="chip'+(s.set[k]===o[0] ? ' on' : '')+'" data-fs="'+k+'" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>'; };
  var ov = H.showSheet("⋮ "+L("Tetapan tukaran","Currency settings"), '<div class="rlab">'+L("Mata wang asas","Base currency")+'</div>'+seg("base", [["MYR","🇲🇾 MYR"],["SGD","🇸🇬 SGD"],["USD","🇺🇸 USD"],["IDR","🇮🇩 IDR"],["SAR","🇸🇦 SAR"],["AED","🇦🇪 AED"],["QAR","🇶🇦 QAR"],["OMR","🇴🇲 OMR"],["BHD","🇧🇭 BHD"],["BND","🇧🇳 BND"]])+
    '<div class="rlab">'+L("Julat carta lalai","Default chart range")+'</div>'+seg("range", RANGES.map(function(r){ return [r[0], r[0]]; }))+
    '<div class="rlab">'+L("Format nombor","Number format")+'</div>'+seg("fmt", [["en","1,234.56"],["eu","1.234,56"]])+
    '<button class="btn alt full" id="fxRef" style="margin-top:12px">↻ '+L("Muat semula semua kadar","Refresh all rates")+'</button>');
  ov.querySelectorAll("[data-fs]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-fs"), v = b.getAttribute("data-v"); s.set[k] = v; if(k==="base") s.pair[0] = v; if(k==="range") s.range = v; save(); H.closeOverlay(); view(document.getElementById("fxHost")); }; });
  ov.querySelector("#fxRef").onclick = function(){ s.series = {}; Object.keys(s.cache).forEach(function(k){ s.cache[k].upd = 0; }); save(); H.closeOverlay(); view(document.getElementById("fxHost")); };
}
function bind(el){
  var s = st();
  el.querySelector("#fxAmt").oninput = function(){ calc(); clearTimeout(bind.t); bind.t = setTimeout(save, 500); };
  el.querySelector("#fxSwap").onclick = function(){ s.pair = [s.pair[1], s.pair[0]]; var c = s.cache[pk(s.pair[1], s.pair[0])]; if(c && !s.cache[pk(s.pair[0], s.pair[1])]) s.cache[pk(s.pair[0], s.pair[1])] = {r:1/c.r, prev:c.prev ? 1/c.prev : null, date:c.date, upd:c.upd}; save(); view(el); };
  el.querySelectorAll("[data-pick]").forEach(function(b){ b.onclick = function(){ pickCur(+b.getAttribute("data-pick")); }; });
  el.querySelectorAll("[data-rg]").forEach(function(b){ b.onclick = function(){ s.range = b.getAttribute("data-rg"); el.querySelectorAll("[data-rg]").forEach(function(x){ x.classList.toggle("on", x===b); }); document.getElementById("fxChart").innerHTML = '<div class="mut small">…</div>'; chart(); }; });
  el.querySelector("#fxStar").onclick = function(){ var b = s.pair[0], q = s.pair[1], i = -1; s.favs.forEach(function(f, k){ if(f[0]===b && f[1]===q) i = k; }); if(i>=0) s.favs.splice(i, 1); else s.favs.push([b, q]); save(); H.toast(i>=0 ? L("Dibuang dari kegemaran","Removed from favourites") : L("Ditambah ke kegemaran","Added to favourites")); view(el); };
  el.querySelector("#fxMore").onclick = settings;
}
// 0.5.23 rate alerts (e.g. tell me when 1 SAR costs less than RM 1.15). Checked when the app opens and every 3 hours while it is open;
// the rates are daily reference rates, so one alert a day at most. The notification goes through the app's reminder list (ihsan_xrem).
function alertsUi(){ var box = document.getElementById("fxAl"); if(!box) return; var s = st(), A = s.alerts = s.alerts || [], b = s.pair[0], q = s.pair[1], c = s.cache[pk(b, q)];
  box.innerHTML = (A.length ? A.map(function(a, i){ var cc = s.cache[pk(a.b, a.q)], hit = cc && (a.op===">" ? cc.r >= a.v : cc.r <= a.v);
      return '<div class="fxAlR'+(hit ? ' hit' : '')+'"><span>'+flag(a.b)+' 1 '+a.b+' '+(a.op===">" ? "≥" : "≤")+' <b>'+fmt(a.v, dec(a.q, a.v))+'</b> '+a.q+(cc ? ' <small class="mut">('+L("kini ","now ")+fmt(cc.r, dec(a.q, cc.r))+')</small>' : '')+'</span><button class="chip'+(a.on!==false ? ' on' : '')+'" data-alon="'+i+'">'+(a.on!==false ? '🔔' : '🔕')+'</button><button class="chip" data-alx="'+i+'">✕</button></div>'; }).join("") : '<div class="mut small">'+L("Tiada amaran. Contoh: beritahu apabila 1 SAR kurang daripada RM 1.15.","No alerts. For example: tell me when 1 SAR is less than RM 1.15.")+'</div>')+
    '<div class="fxAlAdd"><span>1 '+b+'</span><select id="fxAlOp"><option value="<">≤ '+L("turun ke","drops to")+'</option><option value=">">≥ '+L("naik ke","rises to")+'</option></select><input id="fxAlV" type="text" inputmode="decimal" value="'+(c ? fmt(c.r, dec(q, c.r)).replace(/,/g, "") : "")+'"><span>'+q+'</span><button class="chip gold" id="fxAlOk">＋</button></div>';
  box.querySelectorAll("[data-alon]").forEach(function(x){ x.onclick = function(){ var a = A[+x.getAttribute("data-alon")]; a.on = a.on===false; save(); alertsUi(); }; });
  box.querySelectorAll("[data-alx]").forEach(function(x){ x.onclick = function(){ A.splice(+x.getAttribute("data-alx"), 1); save(); alertsUi(); }; });
  box.querySelector("#fxAlOk").onclick = function(){ var v = parseFloat(String(box.querySelector("#fxAlV").value).replace(/[^0-9.,]/g, "").replace(",", ".")); if(!(v > 0)){ H.toast(L("Isi kadar","Fill in a rate")); return; }
    A.push({id: Date.now().toString(36), b: b, q: q, op: box.querySelector("#fxAlOp").value, v: v, on: true}); save(); alertsUi(); H.toast("🔔 "+L("Amaran ditetapkan","Alert set")); checkAlerts(); }; }
function checkAlerts(){ var s = st(), A = (s.alerts||[]).filter(function(a){ return a.on!==false; }); if(!A.length) return;
  A.forEach(function(a){ var c = s.cache[pk(a.b, a.q)], fresh = c && Date.now() - (c.upd||0) < 3*3600e3;
    (fresh ? Promise.resolve(c) : fxLatest(a.b, a.q)).then(function(r){ var hit = a.op===">" ? r.r >= a.v : r.r <= a.v;
      if(hit && a.last !== r.date){ a.last = r.date; save(); var t = "💱 1 "+a.b+" = "+fmt(r.r, dec(a.q, r.r))+" "+a.q;
        if(H.xrem) H.xrem("fxa"+a.id+r.date, Date.now()+20000, t, L("Amaran kadar anda tercapai (","Your rate alert was reached (")+(a.op===">" ? "≥ " : "≤ ")+fmt(a.v, dec(a.q, a.v))+")", "fx:"+a.b+"/"+a.q); H.toast(t); }
      if(!hit && a.last && a.last !== r.date){ a.last = null; save(); } }, function(){}); }); }
window.FxView = {
  alerts:function(h){ H = h; ST = null; checkAlerts(); },
  view:function(el, h, pair){ H = h; ST = null; var s = st(); if(pair){ var p = String(pair).split("/"); if(p.length===2) s.pair = p; } var host = document.createElement("div"); host.id = "fxHost"; el.innerHTML = ""; el.appendChild(host); view(host); },
  // a small summary for the in-app home widget
  card:function(h){ H = h; ST = null; var s = st(); return s.favs.slice(0, 4).map(function(f){ var c = s.cache[pk(f[0], f[1])], ch = c && c.prev ? (c.r - c.prev) / c.prev * 100 : null; return {p:f[0]+" → "+f[1], r:c ? fmt(c.r, dec(f[1], c.r)) : "…", ch:ch}; }); },
  _t:{parse:parse, series:series, dec:dec, fmt:fmt, flag:flag, PEG:PEG, st:st, fxLatest:fxLatest, fxSeries:fxSeries, reset:function(){ ST = null; }}
};
})();
