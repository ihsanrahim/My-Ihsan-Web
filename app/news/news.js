/* My Ihsan 0.6.61 · Learn › Listen › 📰 World News (Berita Dunia), owner spec global-news-listen.md.
   Headlines from Google News RSS for the focused country (its own editions and languages, or news ABOUT it when Google has no edition),
   sections, Ummah tab, Malaysian papers; every story can be read aloud; ▶ News bulletin plays the top stories in order (Android: spoken into
   files by the phone's voice and played by the background player, so it keeps going with the screen off); live news radio (radio-browser)
   and news podcasts (Apple) for the country through the existing player. Owner answers: default = phone region (else Malaysia), Ummah tab
   with Iran / Yemen / Syria / Lebanon, kids lock hides News, bulletin in the background player, optional Home headlines widget, Malaysian papers,
   web app: headlines need the phone (Google News blocks browsers) but radio and podcasts work, ayah from the app's own Quran text.
   IbNews.render(el) with window.IBH. */
(function(){
"use strict";
var H = window.IBH; if(!H) return;
var D = window.NewsData, N = H.N, esc = H.esc;
function L(a, b){ return H.L2x(a, b); }
var WEB = !window.Native;   // the web app and iPhone build: headlines are blocked by the browser
var K = "ihsan_news";
var ST = H.load(K, null) || {};
function defCC(){ var m = String(navigator.language || "").match(/-([A-Z]{2})$/i), cc = m ? m[1].toUpperCase() : ""; return byCC(cc) ? cc : "MY"; }
ST.cc = ST.cc || defCC(); ST.recent = ST.recent || []; ST.pinned = ST.pinned || []; ST.sec = ST.sec || "top"; ST.saved = ST.saved || []; ST.langBy = ST.langBy || {};
ST.set = Object.assign({follow:true, bulletinN:10, summary:false, pics:true, ticker:true, prayerPause:true, hide:{}, order:null, seenAyah:false}, ST.set || {});
function keep(){ H.save(K, ST); }
function byCC(cc){ if(cc === "WW") return {cc:"WW", en:"Global", ms:"Global", ed:[{hl:"en-US", ce:"en"}], reg:"", oic:false}; for(var i = 0; i < D.C.length; i++) if(D.C[i].cc === cc) return D.C[i]; return null; }
function cname(c){ return c.cc === "WW" ? "🌐 " + L("Global", "Global") : flag(c.cc) + " " + (H.en() ? c.en : c.ms); }
function flag(cc){ if(cc === "WW") return "🌐"; return String.fromCodePoint(127397 + cc.charCodeAt(0)) + String.fromCodePoint(127397 + cc.charCodeAt(1)); }
function curC(){ return byCC(ST.cc) || byCC("MY"); }
function edOf(c){ if(!c.ed.length) return null; var want = ST.langBy[c.cc]; for(var i = 0; i < c.ed.length; i++) if(c.ed[i].hl === want) return c.ed[i]; if(c.cc === "MY" && !want) return H.en() ? c.ed[1] : c.ed[0]; return c.ed[0]; }
function langOf(c){ var e = edOf(c); if(!e) return "en"; var l = D.LANG[e.hl] || D.LANG[e.hl.split("-")[0]]; return l ? l[0] : "en"; }

// ---------- sections and feeds ----------
var SECS = [["top","📰","Utama","Top",""],["nation","🏠","Negara","Nation","NATION"],["world","🌍","Dunia","World","WORLD"],["business","💼","Bisnes","Business","BUSINESS"],["tech","💻","Teknologi","Tech","TECHNOLOGY"],
  ["science","🔬","Sains","Science","SCIENCE"],["health","❤️","Kesihatan","Health","HEALTH"],["sports","⚽","Sukan","Sports","SPORTS"],["ummah","🕌","Ummah","Ummah",""],["papers","🗞","Akhbar","Papers",""],["saved","★","Disimpan","Saved",""]];
function secs(){ var c = curC(), o = ST.set.order || SECS.map(function(s){ return s[0]; }); return o.map(function(id){ return SECS.filter(function(s){ return s[0] === id; })[0]; }).filter(function(s){
  if(!s || ST.set.hide[s[0]]) return false; if(s[0] === "papers") return !!D.PAPERS[c.cc]; if(s[0] === "nation") return c.cc !== "WW"; return true; }); }
function secName(s){ var c = curC(); if(s[0] === "nation") return (H.en() ? c.en : c.ms); return L(s[2], s[3]); }
function gn(path, e, cc){ var hl = e.hl, ce = e.ce; return "https://news.google.com/" + path + (path.indexOf("?") >= 0 ? "&" : "?") + "hl=" + hl + "&gl=" + cc + "&ceid=" + cc + ":" + ce; }
function feeds(sec){ var c = curC(), e = edOf(c), cc = c.cc === "WW" ? "US" : c.cc, s = SECS.filter(function(x){ return x[0] === sec; })[0] || SECS[0], q;
  if(sec === "ummah"){ var ms = langOf(c) === "ms"; q = encodeURIComponent((ms ? D.UMMAH_MS : D.UMMAH) + " when:2d"); return e ? [gn("rss/search?q=" + q, e, cc)] : [gn("rss/search?q=" + q, {hl:"en-US", ce:"en"}, "US")]; }
  if(sec === "papers") return (D.PAPERS[c.cc] || []).map(function(p){ return gn("rss/search?q=" + encodeURIComponent("site:" + p[1] + " when:1d"), {hl:p[2] === "ms" ? "ms" : "en", ce:p[2] === "ms" ? "ms" : "en"}, c.cc); });
  if(!e){   // no Google edition: news ABOUT the country, in English (Arabic for Arab countries)
    var ar = c.reg === "me" && !/^(IR|TR|IL)$/.test(c.cc), base = ar ? {hl:"ar", ce:"ar"} : {hl:"en-US", ce:"en"}, gl = ar ? "SA" : "US", nm = c.en;
    var t = {top:"", nation:"", world:"", business:" business economy", tech:" technology", science:" science", health:" health", sports:" sport"}[sec] || "";
    return [gn("rss/search?q=" + encodeURIComponent('"' + nm + '"' + t + " when:2d"), base, gl)]; }
  if(sec === "top") return [gn("rss", e, cc)];
  return [gn("rss/headlines/section/topic/" + s[4], e, cc), gn("rss/search?q=" + encodeURIComponent(s[3].toLowerCase() + " when:1d"), e, cc)]; }

// ---------- fetch + parse (cache 10 minutes per country, language and section) ----------
var CACHE = {}, BUSY = {};
function key(sec){ var c = curC(); return c.cc + "|" + (edOf(c) || {hl:"-"}).hl + "|" + sec; }
function textOf(n){ return n ? (n.textContent || "").trim() : ""; }
function strip(h){ var d = document.createElement("div"); d.innerHTML = String(h || "").replace(/<script[\s\S]*?<\/script>/gi, ""); return (d.textContent || "").replace(/\s+/g, " ").trim(); }
function parse(xml){ var doc; try{ doc = new DOMParser().parseFromString(xml, "text/xml"); }catch(e){ return []; } if(!doc || doc.getElementsByTagName("parsererror").length) return [];
  var out = []; [].slice.call(doc.getElementsByTagName("item")).slice(0, 40).forEach(function(it){ var t = textOf(it.getElementsByTagName("title")[0]), link = textOf(it.getElementsByTagName("link")[0]), srcEl = it.getElementsByTagName("source")[0], src = textOf(srcEl), su = srcEl ? srcEl.getAttribute("url") || "" : "";
    var k = t.lastIndexOf(" - "); if(!src && k > 0){ src = t.slice(k + 3); } if(k > 0 && t.slice(k + 3) === src) t = t.slice(0, k);
    var desc = textOf(it.getElementsByTagName("description")[0]), img = "", mc = it.getElementsByTagName("media:content")[0] || it.getElementsByTagName("media:thumbnail")[0] || it.getElementsByTagName("enclosure")[0];
    if(mc) img = mc.getAttribute("url") || ""; if(!img){ var m = desc.match(/<img[^>]+src=["']([^"']+)/i); if(m) img = m[1]; }
    var sum = strip(desc); if(src && sum.slice(-src.length) === src) sum = sum.slice(0, -src.length).trim(); if(sum.indexOf(t) === 0 || t.indexOf(sum) === 0 || sum.length < 25) sum = "";
    var pd = Date.parse(textOf(it.getElementsByTagName("pubDate")[0])) || 0;
    if(t) out.push({t:t, link:link, src:src, su:su, img:/^https:\/\//.test(img) ? img : "", sum:sum.slice(0, 400), at:pd}); });
  return out; }
function load(sec, force, done){ var k = key(sec), c = CACHE[k];
  if(c && !force && Date.now() - c.t < 600000){ done(c); return; } if(BUSY[k]){ BUSY[k].push(done); return; } BUSY[k] = [done];
  var urls = feeds(sec), all = [], i = 0, fin = function(err){ var res = all.length ? {t:Date.now(), list:dedupe(all).slice(0, 30)} : (c ? Object.assign({}, c, {stale:true}) : {t:Date.now(), list:[], err:err || "empty"});
    if(all.length) CACHE[k] = res; var cbs = BUSY[k] || []; delete BUSY[k]; cbs.forEach(function(f){ f(res); }); if(sec === "top" && all.length) H.save("ihsan_news_head", {cc:ST.cc, t:Date.now(), list:res.list.slice(0, 5)}); };
  var next = function(){ if(i >= urls.length || (all.length >= 12 && sec !== "papers")){ fin(); return; } var u = urls[i++];
    H.fetch(u, function(status, body){ if(status >= 200 && status < 300){ var l = parse(body); if(sec === "papers"){ var p = D.PAPERS[curC().cc][i - 1]; l.forEach(function(x){ x.src = x.src || (p && p[0]); }); } all = all.concat(l); } next(); }); };
  if(WEB){ fin("web"); return; } next(); }
function dedupe(l){ var seen = {}; return l.filter(function(x){ var k = x.t.toLowerCase().slice(0, 60); if(seen[k]) return false; seen[k] = 1; return true; }).sort(function(a, b){ return (b.at || 0) - (a.at || 0); }); }
function ago(t){ if(!t) return ""; var m = Math.round((Date.now() - t) / 60000); return m < 1 ? L("baru", "now") : m < 60 ? m + L(" min", "m") : m < 1440 ? Math.round(m / 60) + L(" jam", "h") : Math.round(m / 1440) + L(" hari", "d"); }

// ---------- reading aloud + the bulletin ----------
function say(x){ var c = curC(), lg = langOf(c); try{ N.stopSpeak && N.stopSpeak(); N.speak(x.t + (ST.set.summary && x.sum ? ". " + x.sum : "") + (x.src ? ". " + L("Dari ", "From ") + x.src + "." : ""), lg === "ms" || lg === "id" ? "ms" : lg === "ar" ? "ar" : "en"); }catch(e){} }
var NUM = {ms:["Satu","Dua","Tiga","Empat","Lima","Enam","Tujuh","Lapan","Sembilan","Sepuluh","Sebelas","Dua belas","Tiga belas","Empat belas","Lima belas","Enam belas","Tujuh belas","Lapan belas","Sembilan belas","Dua puluh"],
  en:["One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen","Twenty"]};
function bulletin(list, sec){ var c = curC(), lg = langOf(c), ms = lg === "ms" || lg === "id", n = Math.min(list.length, ST.set.bulletinN || 10); if(!n){ H.toast(L("Tiada berita", "No news")); return; }
  var day = new Date().toLocaleDateString(ms ? "ms-MY" : "en-GB", {day:"numeric", month:"long"}), title = (ms ? "Berita " : "News · ") + (H.en() ? c.en : c.ms) + ", " + day + ".";
  var items = list.slice(0, n).map(function(x, i){ return (i === 0 ? title + " " : "") + ((ms ? NUM.ms : NUM.en)[i] || String(i + 1)) + ". " + x.t + "." + (ST.set.summary && x.sum ? " " + x.sum : "") + (x.src ? (ms ? " Dari " : " From ") + x.src + "." : ""); });
  var artist = (ms ? "Buletin berita · " : "News bulletin · ") + flag(c.cc) + " · " + secName(SECS.filter(function(s){ return s[0] === sec; })[0] || SECS[0]);
  if(window.Native && N.ttsFiles && N.playerPlay){ var id = "nb" + Date.now(), h = function(r){ if(!r || r.id !== id) return; H.off("ttsfiles", h);
      if(!r.ok || !(r.files || []).length){ H.toast(L("Suara telefon tidak tersedia; dibaca terus.", "The phone voice is not available; reading it here.")); fgBulletin(items, lg); return; }
      var q = r.files.map(function(f, i){ return {u:"", f:f, t:list[i] ? list[i].t : title, a:artist, k:"nb:" + i}; }); N.playerPlay(JSON.stringify({queue:q, qi:0, rep:1, repAll:1, gap:400, en:H.en()}));
      H.toast("▶ " + L("Buletin dimainkan di latar", "The bulletin plays in the background")); };
    H.on("ttsfiles", h); N.ttsFiles(id, JSON.stringify({lang:lg === "id" ? "id" : ms ? "ms" : lg === "ar" ? "ar" : "en", items:items})); H.toast("⏳ " + L("Menyediakan buletin…", "Preparing the bulletin…")); return; }
  fgBulletin(items, lg); }
var FG = null;
function fgBulletin(items, lg){ var i = 0; FG = {stop:false}; var me = FG, nxt = function(){ if(me.stop || i >= items.length) return; try{ N.speak(items[i++], lg === "ms" || lg === "id" ? "ms" : lg === "ar" ? "ar" : "en"); }catch(e){} };
  var h = function(){ if(me.stop || i >= items.length){ H.off("ttsdone", h); return; } setTimeout(nxt, 400); }; H.on("ttsdone", h); nxt(); }

// ---------- prayer pause (adhan → pause, 15 minutes later → resume) ----------
var PP = {paused:false, until:0};
setInterval(function(){ if(!ST.set.prayerPause || !window.IbMedia || !H.prayNow) return; var near = false; try{ near = H.prayNow(); }catch(e){}
  var st = window.IbMedia.state ? window.IbMedia.state() : {}, k = String(st.key || "");
  if(near && !PP.paused && (st.st === "playing") && (/^nb:/.test(k) || (st.live && /news/i.test(st.artist || "")))){ try{ N.playerCmd("pause", 0); }catch(e){} PP.paused = true; PP.until = Date.now() + 15 * 60000; H.toast("🕌 " + L("Dijeda untuk solat", "Paused for prayer")); }
  if(PP.paused && Date.now() > PP.until){ PP.paused = false; try{ N.playerCmd("resume", 0); }catch(e){} } }, 30000);

// ---------- radio + podcasts for the country ----------
var RAD = {}, POD = {};
function radio(cc, done){ if(RAD[cc]){ done(RAD[cc]); return; } if(cc === "WW"){ done([]); return; }
  H.fetch("https://de1.api.radio-browser.info/json/stations/search?countrycode=" + cc + "&tagList=news&order=votes&reverse=true&hidebroken=true&limit=20", function(st, body){ var l = [];
    try{ JSON.parse(body).forEach(function(s){ var url = s.url_resolved || s.url; if(!/^https?:/i.test(url)) return; l.push({id:s.stationuuid, n:String(s.name || "").trim() || "Radio", url:url, u0:/^https?:/i.test(s.url || "") ? s.url : "", fav:s.favicon || "", cc:s.countrycode || cc, country:s.country || "", tags:String(s.tags || "").split(",").slice(0, 5), live:true}); }); }catch(e){}
    RAD[cc] = l; done(l); }); }
function pods(cc, done){ if(POD[cc]){ done(POD[cc]); return; }
  H.fetch("https://itunes.apple.com/search?media=podcast&entity=podcast&genreId=1489&limit=20&term=news" + (cc !== "WW" ? "&country=" + cc : ""), function(st, body){ var l = [];
    try{ (JSON.parse(body).results || []).forEach(function(r){ if(r.feedUrl) l.push({feed:r.feedUrl, t:r.collectionName || r.trackName, a:r.artistName || "", img:r.artworkUrl600 || r.artworkUrl100 || ""}); }); }catch(e){}
    POD[cc] = l; done(l); }); }

// ---------- the page ----------
var EL = null;
function img(x, cls){ if(ST.set.pics && x.img) return '<img class="' + cls + '" src="' + esc(x.img) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">';
  var dom = (x.su || "").replace(/^https?:\/\//, "").replace(/\/.*$/, ""); return '<span class="' + cls + ' nwPh">' + (dom ? '<img src="https://www.google.com/s2/favicons?sz=64&domain=' + esc(dom) + '" alt="" referrerpolicy="no-referrer" onerror="this.remove()">' : '') + '📰</span>'; }
function meta(x){ return '<small class="nwMeta">' + esc(x.src || "") + (x.at ? ' · ' + ago(x.at) : '') + '</small>'; }
function render(el){ EL = el || EL; if(!EL || !document.body.contains(EL)) return; var c = curC(), S = secs(), sec = S.some(function(s){ return s[0] === ST.sec; }) ? ST.sec : S[0][0], e = edOf(c);
  if(sec !== ST.sec){ ST.sec = sec; keep(); }
  var langs = c.ed.length > 1 ? '<span class="nwLangs">' + c.ed.map(function(x){ var l = D.LANG[x.hl] || D.LANG[x.hl.split("-")[0]] || [x.hl, x.hl.toUpperCase()]; return '<button class="chip' + (e && e.hl === x.hl ? ' on' : '') + '" data-nl="' + x.hl + '">' + esc(l[1]) + '</button>'; }).join("") + '</span>' : '';
  var h = '<div class="nwHead"><h3>📰 ' + L("Berita Dunia", "World News") + '</h3><div class="nwCtl"><button class="chip nwCc" id="nwCc">' + esc(cname(c)) + ' ▾</button>' + langs + '<button class="chip nwSetB" id="nwSet" aria-label="⚙">⚙</button></div></div>' +
    (!e && c.cc !== "WW" ? '<div class="mut tiny">' + L("Google News tiada edisi untuk negara ini: berita tentang " + c.ms + " dalam bahasa Inggeris.", "Google News has no edition for this country: news about " + c.en + " in English.") + '</div>' : '') +
    '<div class="nwSecs" id="nwSecs">' + S.map(function(s){ return '<button class="chip' + (s[0] === sec ? ' on' : '') + '" data-ns="' + s[0] + '">' + s[1] + ' ' + esc(secName(s)) + '</button>'; }).join("") + '</div>' +
    (!ST.set.seenAyah ? '<div class="card nwAyah" id="nwAyah"><div class="mut small">' + L("Sebelum berkongsi berita:", "Before sharing news:") + '</div><div id="nwAyT">…</div><button class="chip" id="nwAyOk">' + L("Faham", "Got it") + '</button></div>' : '') +
    '<div id="nwBody"><div class="card mut">⏳ ' + L("Memuatkan berita…", "Loading the news…") + '</div></div><div id="nwMedia"></div>' +
    '<div class="mut tiny nwFoot">' + L("Tajuk berita daripada Google News dan penerbit masing-masing. My Ihsan tidak menulis atau menyemaknya.", "Headlines are from Google News and each publisher. My Ihsan does not write or check them.") + '</div>';
  EL.innerHTML = h;
  var q = function(s){ return EL.querySelector(s); };
  q("#nwCc").onclick = picker;
  // swipe the country chip through the pinned countries
  (function(){ var b = q("#nwCc"), x0 = null; b.addEventListener("touchstart", function(ev){ x0 = ev.touches[0].clientX; }, {passive:true}); b.addEventListener("touchend", function(ev){ if(x0 == null) return; var dx = ev.changedTouches[0].clientX - x0; x0 = null; if(Math.abs(dx) < 40 || !ST.pinned.length) return; var l = [ST.cc].concat(ST.pinned.filter(function(z){ return z !== ST.cc; })), i = dx < 0 ? 1 : l.length - 1; setCC(l[i % l.length]); }, {passive:true}); })();
  q("#nwSet").onclick = settings;
  EL.querySelectorAll("[data-nl]").forEach(function(b){ b.onclick = function(){ ST.langBy[c.cc] = b.getAttribute("data-nl"); keep(); render(); }; });
  EL.querySelectorAll("[data-ns]").forEach(function(b){ b.onclick = function(){ ST.sec = b.getAttribute("data-ns"); keep(); render(); }; });
  var ok = q("#nwAyOk"); if(ok){ ayah(q("#nwAyT")); ok.onclick = function(){ ST.set.seenAyah = true; keep(); var a = q("#nwAyah"); if(a) a.remove(); }; }
  body(sec, false); media(c); }
function body(sec, force){ var box = EL.querySelector("#nwBody"); if(!box) return;
  if(sec === "saved"){ box.innerHTML = ST.saved.length ? '<div class="nwList">' + ST.saved.map(function(x, i){ return row(x, i, "sv"); }).join("") + '</div>' : '<div class="card mut">' + L("Belum ada. Tekan lama mana-mana berita › Simpan.", "Nothing yet. Long-press any story › Save for later.") + '</div>'; bindRows(box, ST.saved); return; }
  if(WEB){ box.innerHTML = '<div class="card nwWeb">📱 ' + L("Tajuk berita memerlukan aplikasi Android (Google News menyekat pelayar). Radio dan podcast berita di bawah berfungsi di sini.", "Headlines need the Android app (Google News blocks browsers). The news radio and podcasts below work here.") + '</div>'; return; }
  load(sec, force, function(r){ if(!EL || !document.body.contains(box)) return; var l = r.list || [];
    if(!l.length){ box.innerHTML = '<div class="card mut">' + (r.err === "empty" || !navigator.onLine ? L("Tiada berita buat masa ini untuk ", "No news right now for ") + esc(cname(curC())) + '. ' + L("Cuba 🌐 Global atau negara lain.", "Try 🌐 Global or another country.") : L("Tiada sambungan.", "No connection.")) + ' <button class="chip" id="nwRe">↻</button></div>'; var re = box.querySelector("#nwRe"); if(re) re.onclick = function(){ body(sec, true); }; return; }
    var hero = l[0], cards = l.slice(1, 5), more = l.slice(5);
    box.innerHTML = '<div class="nwBar"><button class="btn gold g3d" id="nwBul">▶ ' + L("Dengar tajuk berita", "Listen to the headlines") + ' <small>(' + Math.min(l.length, ST.set.bulletinN) + ')</small></button><small class="mut">' + (r.stale ? L("Luar talian · ", "Offline · ") : "") + L("Dikemas kini ", "Updated ") + ago(r.t) + '</small><button class="chip" id="nwRe">↻</button></div>' +
      '<div class="nwHero" data-ni="0">' + img(hero, "nwHi") + '<div class="nwHt"><b>' + esc(hero.t) + '</b>' + (hero.sum ? '<p>' + esc(hero.sum.slice(0, 200)) + '</p>' : '') + '<div class="nwRow">' + meta(hero) + '<button class="chip" data-say="0">🔊</button><button class="chip" data-go="0">↗</button></div></div></div>' +
      '<div class="nwCards">' + cards.map(function(x, i){ return '<div class="nwCard" data-ni="' + (i + 1) + '">' + img(x, "nwCi") + '<b>' + esc(x.t) + '</b><div class="nwRow">' + meta(x) + '<button class="chip" data-say="' + (i + 1) + '">🔊</button></div></div>'; }).join("") + '</div>' +
      (more.length ? '<div class="plQ">' + L("LAGI TAJUK", "MORE HEADLINES") + '</div><div class="nwList">' + more.map(function(x, i){ return row(x, i + 5, "ni"); }).join("") + '</div>' : '') +
      '';
    var tk = ST.set.ticker ? '<div class="nwTick"><b>' + L("TERKINI", "LATEST") + ' ▸</b><div class="nwTk"><span>' + l.slice(0, 20).map(function(x, i){ return '<a data-go="' + i + '">' + esc(x.t) + '</a>'; }).join(" · ") + '</span></div></div>' : '', slot = document.getElementById("nwTkSlot");
    if(slot){ slot.innerHTML = tk; bindRows(slot, l); } else if(tk) box.insertAdjacentHTML("beforeend", tk);
    box.querySelector("#nwBul").onclick = function(){ bulletin(l, sec); }; box.querySelector("#nwRe").onclick = function(){ body(sec, true); };
    bindRows(box, l); pics(l, box); }); }
// 0.6.62 (owner): Google's headline feed carries no pictures: each top story's photo is looked up by its headline on Bing News (News:Image)
var PIC = {};
function pics(l, box){ if(!ST.set.pics) return; var want = l.slice(0, 9).map(function(x, i){ return [x, i]; }).filter(function(p){ return !p[0].img; }), run = 0, next = function(){
    if(!want.length || !document.body.contains(box)) return; var p = want.shift(), x = p[0], i = p[1], k = x.t.slice(0, 80);
    var put = function(u){ if(!u) return; x.img = u; var el = box.querySelector('[data-ni="' + i + '"] .nwPh'); if(el){ var cls = el.className.replace(" nwPh", ""); el.outerHTML = '<img class="' + cls + '" src="' + esc(u) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">'; } };
    if(PIC[k] !== undefined){ put(PIC[k]); next(); return; } run++;
    H.fetch("https://www.bing.com/news/search?format=rss&q=" + encodeURIComponent(x.t.replace(/["“”]/g, "").slice(0, 120)), function(st, body){ run--; var u = "";
      try{ var d = new DOMParser().parseFromString(body, "text/xml"), it = d.getElementsByTagName("item")[0], im = it && (it.getElementsByTagName("News:Image")[0] || it.getElementsByTagNameNS("*", "Image")[0]);
        if(im) u = (im.textContent || "").trim().replace(/^http:/, "https:"); if(u && /bing\.com\/th\?/.test(u)) u += "&w=640&h=360&c=7"; }catch(e){}
      PIC[k] = /^https:\/\//.test(u) ? u : ""; put(PIC[k]); next(); }); };
  for(var n = 0; n < 3; n++) next(); }
function row(x, i, attr){ return '<div class="nwItem" data-' + attr + '="' + i + '"><div><b>' + esc(x.t) + '</b>' + meta(x) + '</div><button class="chip" data-say="' + i + '">🔊</button></div>'; }
function bindRows(box, l){ var open = function(x){ if(!x || !x.link) return; if(N.openWeb) N.openWeb(x.link, x.src || ""); else window.open(x.link, "_blank"); };
  box.querySelectorAll("[data-say]").forEach(function(b){ b.onclick = function(ev){ ev.stopPropagation(); say(l[+b.getAttribute("data-say")]); }; });
  box.querySelectorAll("[data-go]").forEach(function(b){ b.onclick = function(ev){ ev.stopPropagation(); open(l[+b.getAttribute("data-go")]); }; });
  box.querySelectorAll("[data-ni],[data-sv]").forEach(function(b){ var i = +(b.getAttribute("data-ni") || b.getAttribute("data-sv")), x = l[i], t = null;
    b.onclick = function(){ if(b._lp){ b._lp = 0; return; } open(x); };
    b.addEventListener("touchstart", function(){ t = setTimeout(function(){ b._lp = 1; menu(x); }, 550); }, {passive:true}); b.addEventListener("touchend", function(){ clearTimeout(t); }, {passive:true}); b.addEventListener("touchmove", function(){ clearTimeout(t); }, {passive:true});
    b.oncontextmenu = function(ev){ ev.preventDefault(); menu(x); }; }); }
function menu(x){ if(!x) return; var saved = ST.saved.some(function(s){ return s.link === x.link; });
  var ov = H.showSheet("📰", '<div class="small"><b>' + esc(x.t) + '</b></div><div class="nwVer">⚠️ ' + L("Semak dahulu sebelum berkongsi (Al-Hujurat 49:6).", "Verify before you share (Al-Hujurat 49:6).") + '</div>' +
    '<div class="btns" style="flex-wrap:wrap;margin-top:10px"><button class="btn alt" id="nmSh">📤 ' + L("Kongsi", "Share") + '</button><button class="btn alt" id="nmSay">🔊 ' + L("Baca", "Read aloud") + '</button><button class="btn alt" id="nmSv">' + (saved ? "★ " + L("Buang", "Remove") : "☆ " + L("Simpan", "Save for later")) + '</button></div>');
  ov.querySelector("#nmSh").onclick = function(){ var t = x.t + (x.src ? " (" + x.src + ")" : "") + "\n" + x.link; if(N.shareText) N.shareText(t); else if(navigator.share) navigator.share({text:t}).catch(function(){}); H.closeOverlay(); };
  ov.querySelector("#nmSay").onclick = function(){ say(x); H.closeOverlay(); };
  ov.querySelector("#nmSv").onclick = function(){ if(saved) ST.saved = ST.saved.filter(function(s){ return s.link !== x.link; }); else ST.saved.unshift({t:x.t, link:x.link, src:x.src, su:x.su, img:x.img, at:x.at, sum:x.sum}); ST.saved = ST.saved.slice(0, 100); keep(); H.closeOverlay(); H.toast(saved ? "☆" : "★ " + L("Disimpan", "Saved")); if(ST.sec === "saved") render(); }; }
function media(c){ var box = EL.querySelector("#nwMedia"); if(!box) return; var h = "";
  radio(c.cc, function(rl){ pods(c.cc, function(pl){ if(!document.body.contains(box)) return;
    box.innerHTML = (rl.length ? '<div class="plQ">📻 ' + L("Radio berita langsung · ", "Live news radio · ") + flag(c.cc) + '</div><div class="nwChips">' + rl.slice(0, 12).map(function(s, i){ return '<button class="chip" data-rd="' + i + '">' + esc(s.n.slice(0, 28)) + '</button>'; }).join("") + '</div>' : '') +
      (pl.length ? '<div class="plQ">🎙 ' + L("Podcast berita · ", "News podcasts · ") + flag(c.cc) + '</div><div class="nwPods">' + pl.slice(0, 10).map(function(p, i){ return '<button class="nwPod" data-pd="' + i + '">' + (p.img ? '<img src="' + esc(p.img) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '<span>🎙</span>') + '<small>' + esc(p.t) + '</small></button>'; }).join("") + '</div>' : '');
    box.querySelectorAll("[data-rd]").forEach(function(b){ b.onclick = function(){ var s = rl[+b.getAttribute("data-rd")]; if(window.IbMedia && IbMedia.playRadio) IbMedia.playRadio(s); }; });
    box.querySelectorAll("[data-pd]").forEach(function(b){ b.onclick = function(){ var p = pl[+b.getAttribute("data-pd")]; if(window.IbMedia && IbMedia.openShow) IbMedia.openShow(p); }; }); }); }); }
// the ayah from the app's own Quran text (Arabic + translation)
function ayah(box){ var put = function(){ try{ var M = window.QMETA, idx = 0; for(var s = 0; s < 48; s++) idx += M.s[s][4]; idx += 5;
      var S = window.__QS49, ar = S ? S.t[5].map(function(x){ return typeof x === "string" ? x : x[0]; }).join("") : "", tr = (window.QEN || [])[idx] || "";
      if(!H.en() && N.qRead){ try{ var ms = JSON.parse(N.qRead("quran/tr/ms.json") || "null"); if(ms && ms[idx]) tr = ms[idx]; }catch(e){} }
      box.innerHTML = (ar ? '<div class="nwAr" dir="rtl" lang="ar">' + esc(ar) + '</div>' : '') + '<div class="small">' + esc(tr) + ' <i class="mut">(Al-Hujurat 49:6)</i></div>'; }catch(e){ box.textContent = "Al-Hujurat 49:6"; } };
  var need = []; if(!window.QMETA) need.push("quran/qmeta.js"); if(!window.QEN) need.push("quran/qen.js"); if(!window.__QS49) need.push("quran/qs/s049.js");
  if(!need.length){ put(); return; } var old = window.QSUR; window.QSUR = function(n, o){ if(n === 49) window.__QS49 = o; if(old && old !== window.QSUR) try{ old(n, o); }catch(e){} };
  H.loadJs ? H.loadJs(need, put, put) : (function(){ var i = 0; var nx = function(){ if(i >= need.length){ put(); return; } var sc = document.createElement("script"); sc.src = need[i++]; sc.onload = sc.onerror = nx; document.head.appendChild(sc); }; nx(); })(); }
function setCC(cc){ ST.cc = cc; ST.recent = [cc].concat(ST.recent.filter(function(x){ return x !== cc; })).slice(0, 5); keep(); render(); }
function picker(){ var q0 = "";
  var ov = H.showSheet("🌍 " + L("Pilih negara", "Choose a country"), '<input id="npQ" class="rin" type="search" placeholder="🔍 ' + esc(L("Cari negara…", "Search country…")) + '"><div id="npL"></div>');
  var draw = function(){ var q = q0.toLowerCase(), list = D.C.filter(function(c){ return !q || (c.en + " " + c.ms + " " + c.cc).toLowerCase().indexOf(q) >= 0; }), row = function(c){ var l = c.ed.length ? c.ed.map(function(x){ return (D.LANG[x.hl] || D.LANG[x.hl.split("-")[0]] || [x.hl, x.hl])[1]; }).join(" / ") : L("berita tentangnya (EN)", "news about it (EN)");
      return '<div class="npRow"><button class="npPick" data-cc="' + c.cc + '">' + flag(c.cc) + ' <b>' + esc(H.en() ? c.en : c.ms) + '</b> <small class="mut">' + esc(l) + '</small></button><button class="chip" data-pin="' + c.cc + '">' + (ST.pinned.indexOf(c.cc) >= 0 ? "⭐" : "☆") + '</button></div>'; };
    var h = "";
    if(!q){ if(ST.recent.length) h += '<div class="plQ">' + L("Terkini", "Recent") + '</div><div class="nwChips">' + ST.recent.map(function(cc){ var c = byCC(cc); return c ? '<button class="chip" data-cc="' + cc + '">' + esc(cname(c)) + '</button>' : ''; }).join("") + '</div>';
      if(ST.pinned.length) h += '<div class="plQ">⭐ ' + L("Disemat", "Pinned") + '</div><div class="nwChips">' + ST.pinned.map(function(cc){ var c = byCC(cc); return c ? '<button class="chip" data-cc="' + cc + '">' + esc(cname(c)) + '</button>' : ''; }).join("") + '</div>';
      h += '<button class="npPick npGlobal" data-cc="WW">🌐 <b>' + L("Global (tiada negara)", "Global (no country)") + '</b></button>';
      h += '<div class="plQ">☪️ ' + L("Dunia Islam (OIC)", "Muslim world (OIC)") + '</div>' + list.filter(function(c){ return c.oic; }).map(row).join("");
      D.REG.forEach(function(r){ var rl = list.filter(function(c){ return c.reg === r[0] && !c.oic; }); if(rl.length) h += '<div class="plQ">' + esc(L(r[1], r[2])) + '</div>' + rl.map(row).join(""); }); }
    else h += list.map(row).join("") || '<div class="mut small">—</div>';
    var L0 = ov.querySelector("#npL"); L0.innerHTML = h;
    L0.querySelectorAll("[data-cc]").forEach(function(b){ b.onclick = function(){ H.closeOverlay(); setCC(b.getAttribute("data-cc")); }; });
    L0.querySelectorAll("[data-pin]").forEach(function(b){ b.onclick = function(){ var cc = b.getAttribute("data-pin"), i = ST.pinned.indexOf(cc); if(i >= 0) ST.pinned.splice(i, 1); else if(ST.pinned.length < 8) ST.pinned.push(cc); else H.toast(L("Maksimum 8", "Up to 8")); keep(); draw(); }; }); };
  var qi = ov.querySelector("#npQ"); qi.oninput = function(){ q0 = qi.value; draw(); }; draw(); }
function settings(){ var s = ST.set, tog = function(k, ms, en){ return '<label class="pdchk"><input type="checkbox" data-st="' + k + '"' + (s[k] ? ' checked' : '') + '> ' + L(ms, en) + '</label>'; }, order = ST.set.order || SECS.map(function(x){ return x[0]; });
  var ov = H.showSheet("⚙ " + L("Tetapan berita", "News settings"), '<div class="plQ">' + L("Negara asal", "Default country") + '</div><div class="rseg"><button class="chip' + (s.follow ? ' on' : '') + '" data-fol="1">' + L("Ikut telefon", "Follow phone") + '</button><button class="chip' + (!s.follow ? ' on' : '') + '" data-fol="0">' + L("Tetap: ", "Fixed: ") + esc(cname(curC())) + '</button></div>' +
    '<div class="plQ">' + L("Panjang buletin", "Bulletin length") + '</div><div class="rseg">' + [5, 10, 20].map(function(n){ return '<button class="chip' + (s.bulletinN === n ? ' on' : '') + '" data-bn="' + n + '">' + n + '</button>'; }).join("") + '</div>' +
    tog("summary", "Baca ringkasan juga", "Read the summary too") + tog("pics", "Tunjuk gambar", "Show pictures") + tog("ticker", "Jalur TERKINI", "LATEST strip") + tog("prayerPause", "Jeda waktu solat (azan), sambung selepas 15 minit", "Pause at prayer time (adhan), resume after 15 min") +
    '<div class="plQ">' + L("Bahagian (susun & sembunyi)", "Sections (order & hide)") + '</div>' + order.map(function(id, i){ var x = SECS.filter(function(z){ return z[0] === id; })[0]; if(!x) return ''; return '<div class="npRow"><label class="pdchk" style="flex:1"><input type="checkbox" data-sh="' + id + '"' + (s.hide[id] ? '' : ' checked') + '> ' + x[1] + ' ' + esc(L(x[2], x[3])) + '</label><button class="chip" data-up="' + i + '">▲</button></div>'; }).join(""));
  ov.querySelectorAll("[data-fol]").forEach(function(b){ b.onclick = function(){ s.follow = b.getAttribute("data-fol") === "1"; if(s.follow) ST.cc = defCC(); keep(); H.closeOverlay(); render(); }; });
  ov.querySelectorAll("[data-bn]").forEach(function(b){ b.onclick = function(){ s.bulletinN = +b.getAttribute("data-bn"); keep(); H.closeOverlay(); settings(); }; });
  ov.querySelectorAll("[data-st]").forEach(function(b){ b.onchange = function(){ s[b.getAttribute("data-st")] = b.checked; keep(); render(); }; });
  ov.querySelectorAll("[data-sh]").forEach(function(b){ b.onchange = function(){ var id = b.getAttribute("data-sh"); if(b.checked) delete s.hide[id]; else s.hide[id] = true; keep(); render(); }; });
  ov.querySelectorAll("[data-up]").forEach(function(b){ b.onclick = function(){ var i = +b.getAttribute("data-up"); if(i < 1) return; var o = order.slice(); o.splice(i - 1, 0, o.splice(i, 1)[0]); ST.set.order = o; keep(); H.closeOverlay(); render(); settings(); }; }); }
// Home widget: the focused country's top headlines (from the last load)
function widget(){ var hd = H.load("ihsan_news_head", null); if(!hd || !hd.list || !hd.list.length){ if(!WEB) load("top", false, function(){}); return '<div class="mut small">📰 ' + L("Ketik untuk berita", "Tap for the news") + '</div>'; }
  return '<div class="nwW"><div class="mut tiny">📰 ' + flag(hd.cc) + ' ' + L("Tajuk berita", "Headlines") + ' · ' + ago(hd.t) + '</div>' + hd.list.slice(0, 3).map(function(x){ return '<div class="nwWi">• ' + esc(x.t) + '</div>'; }).join("") + '</div>'; }
window.IbNews = {render:render, widget:widget, navGet:function(){ return {cc:ST.cc, sec:ST.sec, k:ST.cc + "/" + ST.sec}; }, navSet:function(o){ if(o && o.cc){ ST.cc = o.cc; ST.sec = o.sec || ST.sec; } },
  stop:function(){ if(FG) FG.stop = true; }, _t:{parse:parse, feeds:feeds, byCC:byCC, setCC:function(cc){ ST.cc = cc; }, ST:ST, bulletin:bulletin}};
})();
