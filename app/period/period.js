/* Period (haid) tab, 0.3.0: Kalendar › Haid. Tracks bleeding episodes (haid / nifas), classifies them with the Shafi'i rules
   (haid, istihadhah, nifas; mubtada'ah, mu'tadah, mumayyizah), predicts the next period, ovulation and fertile window,
   counts Ramadan days to make up (into the existing Puasa ganti counter), works out prayers to make up at the start and end
   of a period from the day's prayer times, and keeps a daily log (flow, colour, pain, symptoms, pads, hygiene).
   For a woman herself, or a husband tracking his wife; men can hide the tab. Everything stays on the phone (ihsan_period).
   A guide only: religious text pending ustaz/ustazah review (period_data.js). */
(function(){
"use strict";
var H = null, D = window.PERIOD_DATA, KEY = "ihsan_period";
var V = {tab:"today", d:null, m:null, start:false, end:false, study:null, edit:null};
function L2(a,b){ return H.L2x(a,b); }
function tx(p){ return Array.isArray(p) ? L2(p[0], p[1]) : String(p==null ? "" : p); }
function esc(s){ return H.esc(s==null ? "" : String(s)); }
function P(){ var p = H.load(KEY, {}) || {}; p.ep = p.ep || []; p.days = p.days || {}; p.preg = p.preg || {}; p.qada = p.qada || []; p.qy = p.qy || {}; if(p.fert===undefined) p.fert = true; if(p.uzur===undefined) p.uzur = true; return p; }
function save(p){ p.ep.sort(function(a, b){ return a.s < b.s ? -1 : 1; }); H.save(KEY, p); }
function pad(n){ return (n<10 ? "0" : "")+n; }
function ymd(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function dt(s){ if(!s) return null; var m = /^(\d{4})-(\d\d)-(\d\d)(?:T(\d\d):(\d\d))?/.exec(s); return m ? new Date(+m[1], m[2]-1, +m[3], +(m[4]||12), +(m[5]||0)) : null; }
function dts(d){ return ymd(d)+"T"+pad(d.getHours())+":"+pad(d.getMinutes()); }
function addD(d, n){ var x = new Date(d); x.setDate(x.getDate()+n); return x; }
function day0(d){ var x = new Date(d); x.setHours(0,0,0,0); return x; }
function dd(a, b){ return Math.round((day0(b) - day0(a))/864e5); }
function fmtD(d, opt){ try{ return d.toLocaleDateString(ibLoc(H.S.lang==="en"), opt || {day:"numeric", month:"short"}); }catch(e){ return ymd(d); } }
function fmtDT(d){ return fmtD(d, {weekday:"short", day:"numeric", month:"short"})+" "+pad(d.getHours())+":"+pad(d.getMinutes()); }
function spouse(){ return P().who==="spouse"; }
function who(ms, en, msS, enS){ return spouse() ? L2(msS, enS) : L2(ms, en); }

// ---------------- Shafi'i rules engine ----------------
// For each episode: {kind, haid:[from,to] or null, ist:[[from,to]...], why:[ms,en][], pending}
function classifyAll(p){
  var out = [], lastHaidEnd = null, habit = p.habit || 0;
  p.ep.forEach(function(e, i){
    var s = dt(e.s), en = e.e ? dt(e.e) : new Date(), ongoing = !e.e, r = {e:e, i:i, s:s, en:en, ongoing:ongoing, ist:[], why:[]};
    var hours = (en - s)/36e5;
    if(e.t==="nifas"){
      var nEnd = new Date(s.getTime() + D.LIM.nifasMaxD*864e5);
      r.kind = "nifas"; r.haid = [s, en < nEnd ? en : nEnd];
      if(en > nEnd){ r.ist.push([nEnd, en]); r.why.push(["Lebih 60 hari: selebihnya istihadhah.","Over 60 days: the rest is istihadhah."]); }
      r.why.push(["Darah selepas bersalin ialah nifas (paling lama 60 hari).","Blood after childbirth is nifas (at most 60 days)."]);
      lastHaidEnd = r.haid[1]; out.push(r); return;
    }
    var from = s;
    if(lastHaidEnd){
      var okFrom = new Date(lastHaidEnd.getTime() + D.LIM.tuhrMinD*864e5);
      if(s < okFrom){
        var istEnd = en < okFrom ? en : okFrom; r.ist.push([s, istEnd]);
        r.why.push(["Belum cukup 15 hari suci sejak haid lepas ("+fmtD(lastHaidEnd)+"): darah sebelum "+fmtD(okFrom)+" ialah istihadhah.","Less than 15 days of purity since the last haid ("+fmtD(lastHaidEnd)+"): blood before "+fmtD(okFrom)+" is istihadhah."]);
        if(en <= okFrom){ r.kind = "istihadhah"; out.push(r); return; }
        from = okFrom; hours = (en - from)/36e5;
      }
    }
    if(hours < D.LIM.haidMinH){
      if(ongoing){ r.kind = "pending"; r.haid = [from, en]; r.why.push(["Belum cukup 24 jam: anggap haid dahulu (tinggalkan solat). Jika berhenti sebelum 24 jam, ia bukan haid dan solat yang ditinggalkan wajib diqadha.","Under 24 hours so far: treat it as haid for now (leave prayer). If it stops before 24 hours it is not haid, and the missed prayers must be made up."]); }
      else { r.kind = "istihadhah"; r.ist.push([from, en]); r.why.push(["Kurang 24 jam: bukan haid (darah fasad/istihadhah). Qadha solat yang ditinggalkan.","Under 24 hours: not haid (istihadhah). Make up the prayers that were missed."]); }
      out.push(r); return;
    }
    var maxEnd = new Date(from.getTime() + D.LIM.haidMaxD*864e5);
    if(en <= maxEnd){
      r.kind = "haid"; r.haid = [from, en];
      r.why.push(["Antara 24 jam dan 15 hari: semuanya haid (termasuk warna perang/kuning dan hari bersih di celahnya).","Between 24 hours and 15 days: all of it is haid (including brown/yellow and clean days in between)."]);
      if(!ongoing){ var len = (en - from)/864e5; if(len >= 1 && len <= 15) habit = Math.round(len); }
      lastHaidEnd = en; out.push(r); return;
    }
    // over 15 days: mustahadah. Strong blood (tamyiz) first, then habit ('adah), else first-timer (mubtada'ah) one day.
    r.kind = "haid";
    var strong = [], k;
    for(k = day0(from); k <= en; k = addD(k, 1)){ var x = p.days[ymd(k)]; if(x && x.c==="strong") strong.push(new Date(k)); }
    var hEnd;
    if(strong.length >= 1 && strong.length <= 15 && dd(strong[0], strong[strong.length-1]) < 15){
      hEnd = addD(day0(strong[strong.length-1]), 1); if(hEnd > en) hEnd = en;
      r.why.push(["Lebih 15 hari dan ada darah kuat (hitam/pekat): haid ialah hari darah kuat (mumayyizah), selebihnya istihadhah.","Over 15 days with strong (dark/thick) blood: haid is the strong-blood days (mumayyizah), the rest is istihadhah."]);
      r.haid = [from, hEnd];
    } else if(habit){
      hEnd = new Date(from.getTime() + habit*864e5);
      r.why.push(["Lebih 15 hari tanpa beza darah: haid dikira mengikut kebiasaan anda "+habit+" hari (mu'tadah), selebihnya istihadhah.","Over 15 days with no difference in the blood: haid is your usual "+habit+" days (mu'tadah), the rest is istihadhah."]);
      r.haid = [from, hEnd];
    } else {
      hEnd = new Date(from.getTime() + 864e5);
      r.why.push(["Lebih 15 hari, tiada kebiasaan dan tiada beza darah (mubtada'ah): haid sehari semalam, selebihnya istihadhah. Tanya ustazah.","Over 15 days, no habit and no difference in the blood (mubtada'ah): haid is one day and night, the rest istihadhah. Ask an ustazah."]);
      r.haid = [from, hEnd];
    }
    r.ist.push([hEnd, en]); lastHaidEnd = hEnd;
    r.why.push(["Untuk hari istihadhah yang telah berlalu: qadha solat yang ditinggalkan.","For istihadhah days already past: make up the prayers that were missed."]);
    out.push(r);
  });
  return out;
}
function dayMap(cl){
  var m = {};
  cl.forEach(function(r){
    var mark = function(a, b, v){ for(var k = day0(a); k < b || ymd(k)===ymd(b); k = addD(k, 1)){ if(!m[ymd(k)] || v!=="ist") m[ymd(k)] = v; if(k > b) break; } };
    if(r.haid) mark(r.haid[0], r.haid[1], r.kind==="nifas" ? "nifas" : r.kind==="pending" ? "haid" : "haid");
    r.ist.forEach(function(x){ mark(x[0], x[1], "ist"); });
  });
  return m;
}
// ---------------- predictions ----------------
function stats(p, cl){
  var hs = cl.filter(function(r){ return (r.kind==="haid" || r.kind==="pending") && r.haid; }), starts = hs.map(function(r){ return r.haid[0]; });
  var gaps = []; for(var i=1;i<starts.length;i++){ var g = dd(starts[i-1], starts[i]); if(g >= 15 && g <= 90) gaps.push(g); }
  var lens = hs.filter(function(r){ return !r.ongoing; }).map(function(r){ return Math.max(1, Math.round((r.haid[1]-r.haid[0])/864e5)); });
  var avg = function(a){ var l = a.slice(-6); return l.length ? Math.round(l.reduce(function(x, y){ return x+y; }, 0)/l.length) : 0; };
  var cyc = p.len || avg(gaps) || 28, plen = p.plen || avg(lens) || 6;
  var last = starts[starts.length-1] || null, next = last ? addD(day0(last), cyc) : null;
  while(next && dd(next, new Date()) > cyc && !p.preg.on) next = addD(next, cyc);
  var ov = next ? addD(next, -14) : null;
  var spread = gaps.length > 2 ? Math.max.apply(null, gaps.slice(-6)) - Math.min.apply(null, gaps.slice(-6)) : 0;
  return {cyc:cyc, plen:plen, gaps:gaps, lens:lens, last:last, next:next, ov:ov, fert:ov ? [addD(ov,-5), addD(ov,1)] : null, spread:spread, auto:!p.len && gaps.length > 0, n:hs.length};
}
function current(cl){ var r = cl[cl.length-1]; return r && r.ongoing ? r : null; }
function flags(p, cl, st){
  var f = [], teen = !!p.first, hi = teen ? 45 : 35;
  st.gaps.slice(-3).forEach(function(g){ if(g < 21) f.push(["Kitaran pendek ("+g+" hari, kurang 21).","Short cycle ("+g+" days, under 21)."]); else if(g > hi) f.push(["Kitaran panjang ("+g+" hari, lebih "+hi+").","Long cycle ("+g+" days, over "+hi+")."]); });
  cl.slice(-3).forEach(function(r){ if(!r.ongoing && r.haid && r.kind!=="nifas"){ var l = (r.en - r.s)/864e5; if(l > 15) f.push(["Darah lebih 15 hari bermula "+fmtD(r.s)+" (istihadhah): jumpa doktor.","Bleeding over 15 days from "+fmtD(r.s)+" (istihadhah): see a doctor."]); else if(l > 7.5) f.push(["Haid panjang ("+Math.round(l)+" hari, lebih 7).","Long period ("+Math.round(l)+" days, over 7)."]); } });
  if(st.spread > 9) f.push(["Panjang kitaran berubah lebih 9 hari antara bulan.","Cycle length varies by more than 9 days."]);
  var heavy = 0, pain = 0, spot = 0, dm = dayMap(cl); Object.keys(p.days).forEach(function(k){ var x = p.days[k]; if(x.f>=4) heavy++; if(x.p>=3) pain++; if(x.f>=1 && !dm[k]) spot++; });
  if(heavy >= 3) f.push(["Haid sangat banyak direkodkan "+heavy+" hari: semak tanda anemia.","Very heavy flow logged on "+heavy+" days: check for signs of anaemia."]);
  if(pain >= 3) f.push(["Senggugut teruk direkodkan "+pain+" hari: pertimbangkan berjumpa doktor.","Severe cramps logged on "+pain+" days: consider seeing a doctor."]);
  if(spot >= 2) f.push(["Bintik darah di luar haid "+spot+" hari: catat dan rujuk doktor jika berterusan.","Spotting outside periods on "+spot+" days: note it and see a doctor if it continues."]);
  if(st.last && !p.preg.on && !current(cl) && dd(st.last, new Date()) > 90) f.push(["Tiada haid lebih 90 hari.","No period for over 90 days."]);
  return f;
}
// ---------------- prayers at the start and end ----------------
var WIN = [["subuh","syuruk"],["zohor","asar"],["asar","maghrib"],["maghrib","isyak"],["isyak",null]];
var PN = {subuh:"Subuh", zohor:"Zohor", asar:"Asar", maghrib:"Maghrib", isyak:"Isyak"};
function tm(date, hm){ if(!hm) return null; var m = /(\d+):(\d+)/.exec(hm); if(!m) return null; var x = new Date(date); x.setHours(+m[1], +m[2], 0, 0); return x; }
function windowAt(d){
  var t = H.times ? H.times(day0(d)) : null; if(!t) return null;
  for(var i=0;i<WIN.length;i++){ var a = tm(d, t[WIN[i][0]]), b = WIN[i][1] ? tm(d, t[WIN[i][1]]) : null;
    if(WIN[i][0]==="isyak"){ var tn = H.times(addD(day0(d), 1)); b = tm(addD(d, 1), tn && tn.subuh); }
    if(a && d >= a && (!b || d < b)) return {p:WIN[i][0], a:a, b:b}; }
  var t0 = H.times(addD(day0(d), -1)), sub = tm(d, t.subuh);
  if(sub && d < sub) return {p:"isyak", a:tm(addD(d,-1), t0 && t0.isyak), b:sub};
  return null;
}
function startPrayer(d){ var w = windowAt(d); if(!w || (d - w.a) < 10*6e4) return null; return w; }
function endPrayers(d){ var w = windowAt(d); if(!w) return []; if(w.b && (w.b - d) < 6e4) return []; return w.p==="asar" ? ["zohor","asar"] : w.p==="isyak" ? ["maghrib","isyak"] : [w.p]; }
// ---------------- Ramadan days to make up ----------------
function ramadanDays(cl){
  var dm = dayMap(cl), by = {};
  Object.keys(dm).forEach(function(k){ if(dm[k]!=="haid" && dm[k]!=="nifas") return; var h = H.hijri ? H.hijri(dt(k)) : null; if(h && h.m===9){ (by[h.y] = by[h.y] || []).push(k); } });
  return by;
}

// ---------------- screens ----------------
var TABS = [["today","🌸","Hari ini","Today"],["cal","🗓","Kalendar","Calendar"],["rec","📈","Rekod","History"],["fiqh","📖","Hukum","Fiqh"],["health","🩺","Kesihatan","Health"]];
function render(el){
  var p = P();
  if(!p.who){ el.innerHTML = setupHtml(); bind(el); return; }
  var cl = classifyAll(p), st = stats(p, cl), body = bodyFor(V.tab, p, cl, st);
  // 0.5.22: the five pages are a level-3 bar at the bottom (above the sub-tabs), like every other page
  el.innerHTML = '<div class="dock pdtabs"><div class="chips">'+TABS.map(function(t){ return '<button class="chip'+(V.tab===t[0] ? ' on' : '')+'" data-pt="'+t[0]+'">'+t[1]+' '+L2(t[2], t[3])+'</button>'; }).join("")+'</div></div>'+
    (spouse() ? '<div class="pdwho">👤 '+L2("Menjejak isteri","Tracking your wife")+(p.name ? ': <b>'+esc(p.name)+'</b>' : '')+'</div>' : '')+'<div class="pdpg">'+body+'</div>'+
    '<div class="mut tiny pdpriv">🔒 '+L2("Semua data haid disimpan dalam telefon ini sahaja (termasuk dalam sandaran aplikasi). Kunci aplikasi ada dalam Tetapan.","All period data stays on this phone only (it is included in the app backup). App lock is in Settings.")+'</div>';
  bind(el); swipe(el); if(window.ibChips) setTimeout(window.ibChips, 30); if(window.IBH && IBH.dockFix) setTimeout(IBH.dockFix, 0);
}
function bodyFor(tab, p, cl, st){ return tab==="cal" ? calHtml(p, cl, st) : tab==="rec" ? recHtml(p, cl, st) : tab==="fiqh" ? fiqhHtml(p, cl) : tab==="health" ? healthHtml(p, cl, st) : todayHtml(p, cl, st); }
function tabIdx(){ var i = 0; TABS.forEach(function(t, k){ if(t[0]===V.tab) i = k; }); return i; }
// 0.5.4 (Ihsan): swipe left / right between Today, Calendar, History, Fiqh and Health, with the ◀ ▶ arrows at the bottom (the ‹ › button row is gone)
function swipe(el){
  var pg = el.querySelector(".pdpg"); if(!pg || !window.IbSwipe) return;
  IbSwipe(pg, {can:function(s){ var i = tabIdx(); return s<0 ? i<TABS.length-1 : i>0; },
    go:function(s){ V.tab = TABS[tabIdx()+(s<0 ? 1 : -1)][0]; V.start = V.end = false; render(el); var v = document.getElementById("view"); if(v) v.scrollTop = 0; },
    peek:function(s){ var t = TABS[tabIdx()+(s<0 ? 1 : -1)]; if(!t) return null; try{ var p = P(), cl = classifyAll(p); return bodyFor(t[0], p, cl, stats(p, cl)); }catch(e){ return null; } },
    find:function(){ return el.querySelector(".pdpg"); }});
}
function setupHtml(){
  return '<div class="card pdsetup"><h3>🌸 '+L2("Haid & kesihatan wanita","Periods & women's health")+'</h3><div class="small" style="line-height:1.5">'+
    L2("Jejak haid, nifas dan istihadhah mengikut mazhab Syafi'i, ramalan haid dan ovulasi, ganti puasa Ramadan, qadha solat, kesihatan, senggugut dan kebersihan. Untuk siapa?","Track haid, nifas and istihadhah by the Shafi'i school, period and ovulation predictions, Ramadan make-up fasts, prayer make-up, health, cramps and hygiene. Who is it for?")+
    '</div><div class="pdbig"><button class="btn gold" data-who="self">👩 '+L2("Untuk saya","For me")+'</button><button class="btn alt" data-who="spouse">💑 '+L2("Isteri saya (suami menjejak)","My wife (husband tracking)")+'</button><button class="btn alt" data-who="off">🙈 '+L2("Sembunyikan tab ini","Hide this tab")+'</button></div>'+
    '<div class="mut tiny" style="margin-top:8px">'+L2("Boleh ditukar bila-bila masa dalam Tetapan › Warga emas & kanak-kanak › Tab Haid.","You can change this any time in Settings › Seniors & children › Period tab.")+'</div></div>';
}
function statusCard(p, cl, st){
  var c = current(cl), now = new Date(), h = '<div class="card pdst">';
  if(p.preg.on && p.preg.lmp){
    var l = dt(p.preg.lmp), days = dd(l, now), edd = addD(l, 280);
    h += '<div class="pdring preg"><b>'+Math.floor(days/7)+L2("m","w")+' '+(days%7)+L2("h","d")+'</b><span>'+L2("hamil","pregnant")+'</span></div><div><div class="pdh">🤰 '+who("Kehamilan","Pregnancy","Kehamilan isteri","Her pregnancy")+'</div><div class="small">'+L2("Jangkaan bersalin: ","Due date: ")+'<b>'+fmtD(edd, {day:"numeric", month:"long", year:"numeric"})+'</b> · '+L2("Trimester ","Trimester ")+(days < 98 ? 1 : days < 196 ? 2 : 3)+'</div><div class="btns" style="margin-top:8px"><button class="btn gold" data-pa="birth">👶 '+L2("Sudah bersalin (mula nifas)","Gave birth (start nifas)")+'</button><button class="chip" data-pa="pregoff">'+L2("Tamatkan mod hamil","End pregnancy mode")+'</button></div></div>';
  } else if(c){
    var n = dd(c.s, now)+1, k = c.kind, lab = {haid:L2("Haid","Haid"), nifas:L2("Nifas","Nifas"), istihadhah:"Istihadhah", pending:L2("Haid (belum 24 jam)","Haid (under 24 h)")}[k];
    if(k==="haid" && c.ist.length && now > c.ist[c.ist.length-1][0]) lab = "Istihadhah";
    h += '<div class="pdring '+(lab==="Istihadhah" ? "ist" : k)+'"><b>'+n+'</b><span>'+L2("hari","day")+'</span></div><div><div class="pdh">'+esc(lab)+' · '+L2("hari ke-","day ")+n+'</div><div class="small mut">'+L2("Bermula ","Started ")+fmtDT(c.s)+'</div>'+
      '<button class="btn gold full" data-pa="endform" style="margin-top:8px">✓ '+who("Darah berhenti (suci)","Bleeding stopped (pure)","Darah isteri berhenti","Her bleeding stopped")+'</button></div>';
  } else {
    var since = st.last ? dd(st.last, now) + 1 : null, toN = st.next ? dd(now, st.next) : null, fert = st.fert && p.fert && now >= day0(st.fert[0]) && now <= addD(day0(st.fert[1]), 1);
    h += '<div class="pdring clean"><b>'+(toN!=null ? (toN >= 0 ? toN : "+"+(-toN)) : "—")+'</b><span>'+(toN!=null && toN < 0 ? L2("lewat","late") : L2("hari lagi","days to go"))+'</span></div><div><div class="pdh">'+(st.last ? L2("Suci · hari ke-","Pure · cycle day ")+since : L2("Belum ada rekod","Nothing logged yet"))+'</div>'+
      (st.next ? '<div class="small mut">'+L2("Haid seterusnya dijangka ","Next period expected ")+'<b>'+fmtD(st.next, {weekday:"short", day:"numeric", month:"short"})+'</b>'+(st.auto ? "" : L2(" (anggaran 28 hari)"," (28-day estimate)"))+'</div>' : '')+
      (fert ? '<div class="small pdfert">🌱 '+L2("Dalam tempoh subur sekarang","In the fertile window now")+'</div>' : (p.fert && st.ov ? '<div class="small mut">🌱 '+L2("Ovulasi dijangka ","Ovulation expected ")+fmtD(st.ov)+'</div>' : ''))+
      '<button class="btn gold full" data-pa="startform" style="margin-top:8px">🩸 '+who("Haid bermula","Period started","Haid isteri bermula","Her period started")+'</button></div>';
    if(toN!=null && toN <= -7 && !p.preg.on) h += '<div class="pdlate">⏰ '+L2("Haid lewat "+(-toN)+" hari. Jika mungkin hamil, buat ujian kehamilan.","Period "+(-toN)+" days late. If pregnancy is possible, take a pregnancy test.")+'<div class="btns" style="margin-top:6px"><button class="chip" data-pa="pregon">🤰 '+L2("Ujian positif","Test is positive")+'</button><button class="chip" data-pt2="health">🩺 '+L2("Semak kehamilan","Pregnancy check")+'</button></div></div>';
  }
  return h+'</div>';
}
function startForm(p){
  var now = dts(new Date());
  return '<div class="card pdform"><h3>🩸 '+L2("Rekod mula darah","Log when bleeding started")+'</h3><label class="pdl">'+L2("Tarikh & masa","Date & time")+'<input type="datetime-local" id="pdS" class="rin" value="'+now+'"></label>'+
    '<div class="rseg" id="pdT"><button class="chip on" data-ty="haid">'+L2("Haid","Haid")+'</button><button class="chip" data-ty="nifas">'+L2("Nifas (selepas bersalin)","Nifas (after birth)")+'</button></div>'+
    (!spouse() ? '<label class="pdchk"><input type="checkbox" id="pdUz"'+(p.uzur ? ' checked' : '')+'> '+L2("Jeda makluman solat (mod uzur) sehingga suci","Pause prayer alerts (uzur mode) until pure")+'</label>' : '')+
    '<div class="btns" style="margin-top:8px"><button class="btn gold" data-pa="startsave">'+L2("Simpan","Save")+'</button><button class="btn alt" data-pa="cancel">'+L2("Batal","Cancel")+'</button></div></div>';
}
function endForm(){
  return '<div class="card pdform"><h3>✓ '+L2("Rekod darah berhenti","Log when bleeding stopped")+'</h3><label class="pdl">'+L2("Tarikh & masa darah benar-benar berhenti","Date & time the bleeding really stopped")+'<input type="datetime-local" id="pdE" class="rin" value="'+dts(new Date())+'"></label>'+
    '<div class="mut tiny">'+L2("Tanda suci: kapas putih bersih tanpa kesan darah, perang atau kuning.","Sign of purity: a white cotton bud comes out clean, with no blood, brown or yellow.")+'</div>'+
    '<div class="btns" style="margin-top:8px"><button class="btn gold" data-pa="endsave">'+L2("Simpan","Save")+'</button><button class="btn alt" data-pa="cancel">'+L2("Batal","Cancel")+'</button></div></div>';
}
function ibadahCard(p, cl){
  var c = current(cl), last = cl[cl.length-1], h = '';
  if(c && (c.kind!=="haid" || !c.ist.length || new Date() < c.ist[c.ist.length-1][0])){
    h = '<div class="card"><h3>🕌 '+who("Ibadah semasa ","Worship during ","Ibadah isteri semasa ","Her worship during ")+(c.kind==="nifas" ? "nifas" : "haid")+'</h3><div class="pdcols"><div><b class="pdno">✖ '+L2("Ditegah","Not allowed")+'</b><ul class="ul">'+D.FORBID.map(function(x){ return '<li>'+esc(tx(x))+'</li>'; }).join("")+'</ul></div><div><b class="pdok">✔ '+L2("Dibenarkan","Allowed")+'</b><ul class="ul">'+D.ALLOWED.map(function(x){ return '<li>'+esc(tx(x))+'</li>'; }).join("")+'</ul></div></div></div>';
  } else if(c){
    h = '<div class="card pdistc"><h3>💧 '+L2("Istihadhah: wajib solat & puasa","Istihadhah: prayer & fasting are required")+'</h3><ol class="ul">'+D.ISTIHADHAH.map(function(x){ return '<li>'+esc(tx(x))+'</li>'; }).join("")+'</ol></div>';
  } else if(last && last.e.e && dd(dt(last.e.e), new Date()) <= 2){
    var due = endPrayers(dt(last.e.e));
    h = '<div class="card pdghusl"><h3>🚿 '+L2("Selepas suci","After purity")+'</h3>'+(due.length ? '<div class="pddue">🕌 '+L2("Solat yang wajib (suci pada ","Prayers now due (pure at ")+fmtDT(dt(last.e.e))+'): <b>'+due.map(function(x){ return PN[x]; }).join(" + ")+'</b></div>' : '')+
      '<b>'+L2("Mandi wajib","Obligatory bath (ghusl)")+'</b><ol class="ul">'+D.GHUSL.map(function(x){ return '<li>'+esc(tx(x))+'</li>'; }).join("")+'</ol></div>';
  }
  return h;
}
var FLOW = [["0","Tiada","None"],["1","Bintik","Spotting"],["2","Sikit","Light"],["3","Sederhana","Medium"],["4","Banyak","Heavy"]];
var COLOUR = [["strong","Merah pekat / hitam","Dark / thick red"],["red","Merah cair","Light red"],["brown","Perang","Brown"],["yellow","Kuning / keruh","Yellow / cloudy"]];
var PAIN = [["0","Tiada","None"],["1","Ringan","Mild"],["2","Sederhana","Moderate"],["3","Teruk","Severe"]];
var SYM = [["cramp","Senggugut","Cramps"],["back","Sakit belakang","Back pain"],["head","Sakit kepala","Headache"],["bloat","Kembung","Bloating"],["breast","Sakit dada","Breast pain"],["acne","Jerawat","Acne"],["tired","Letih","Tired"],["nausea","Loya","Nausea"],["mood","Emosi","Mood swings"],["crave","Mengidam","Cravings"],["dizzy","Pening","Dizzy"],["discharge","Keputihan","Discharge"]];
function ddItems(list, key, multi){ var l = list.map(function(o){ return [o[0], L2(o[1], o[2])]; }); return (!multi && key==="c") ? [["", "—"]].concat(l) : l; }
var HYG = [["pad","Tukar tuala 4–6 jam","Pad changed every 4–6 h"],["hands","Basuh tangan","Washed hands"],["wash","Cuci depan ke belakang","Washed front to back"],["under","Seluar dalam bersih","Clean underwear"],["water","Minum air cukup","Drank enough water"]];
function logCard(p){
  // 0.5.4 (Ihsan): each field is a dropdown: hold the value and slide up / down to pick (release to choose), or ▾ for the whole list
  var d = V.d || ymd(new Date()), x = p.days[d] || {}, chips = function(list, key, val, multi){ if(!window.IbDrop) return '';
    return window.IbDrop.html("pd"+key, ddItems(list, key, multi), multi ? (x[key]||[]) : val, multi, multi ? L2("Tiada dipilih","None chosen") : L2("Belum dipilih","Not set")); };
  return '<div class="card pdlog"><div class="pdlogh"><h3>📝 '+L2("Catatan harian","Daily log")+'</h3><input type="date" id="pdD" class="rin" value="'+d+'"></div>'+
    '<div class="pdrow"><div class="rlab">'+L2("Aliran","Flow")+'</div>'+chips(FLOW, "f", x.f==null ? "" : x.f)+'</div>'+
    '<div class="pdrow"><div class="rlab">'+L2("Warna darah (untuk hukum istihadhah)","Blood colour (for the istihadhah ruling)")+'</div>'+chips(COLOUR, "c", x.c||"")+'</div>'+
    '<div class="pdrow"><div class="rlab">'+L2("Sakit / senggugut","Pain / cramps")+'</div>'+chips(PAIN, "p", x.p==null ? "" : x.p)+'</div>'+
    '<div class="pdrow"><div class="rlab">'+L2("Simptom","Symptoms")+'</div>'+chips(SYM, "sy", null, true)+'</div>'+
    '<div class="pdrow"><div class="rlab">'+L2("Kebersihan","Hygiene")+'</div>'+chips(HYG, "hy", null, true)+'</div>'+
    '<div class="pdpads"><span>'+L2("Tuala ditukar hari ini","Pads changed today")+'</span><button class="chip" data-pads="-1">−</button><b>'+(x.n||0)+'</b><button class="chip" data-pads="1">+</button></div>'+
    ((x.f>=3 && (x.n||0) && (x.n||0) < 3) ? '<div class="pdtip">💡 '+L2("Aliran banyak: tukar tuala sekurang-kurangnya setiap 4 jam.","Heavy flow: change pads at least every 4 hours.")+'</div>' : '')+
    ((x.f>=4 && (x.n||0) >= 10) ? '<div class="pdwarn">⚠ '+L2("Lebih 10 tuala sehari: tanda haid terlalu banyak. Jumpa doktor jika berulang atau rasa pening.","Over 10 pads a day: a sign of very heavy bleeding. See a doctor if it repeats or you feel dizzy.")+'</div>' : '')+
    ((x.p>=3) ? '<div class="pdtip">💡 '+L2("Senggugut teruk: tuam panas, rehat, ubat tahan sakit ikut label. Lihat Kesihatan › Senggugut.","Severe cramps: warm compress, rest, painkillers as labelled. See Health › Cramps.")+'</div>' : '')+
    '<label class="pdl">'+L2("Nota","Note")+'<input id="pdN" class="rin" value="'+esc(x.note||"")+'" placeholder="'+L2("cth. ketulan darah, demam…","e.g. clots, fever…")+'"></label></div>';
}
function qadaCard(p){
  var l = p.qada.filter(function(q){ return !q.done; }); if(!l.length) return "";
  return '<div class="card"><h3>🕌 '+L2("Solat perlu diqadha","Prayers to make up")+' ('+l.length+')</h3>'+l.map(function(q){ return '<label class="pdq"><input type="checkbox" data-qd="'+q.id+'"> '+PN[q.p]+' · '+fmtD(dt(q.d), {weekday:"short", day:"numeric", month:"short"})+' <span class="mut tiny">'+esc(tx(q.why))+'</span></label>'; }).join("")+'</div>';
}
function todayHtml(p, cl, st){
  var h = partnerCard(p) + statusCard(p, cl, st);
  if(V.start) h += startForm(p); if(V.end) h += endForm();
  if(V.ask) h += '<div class="card pdask"><h3>🕌 '+L2("Solat "+PN[V.ask.p],PN[V.ask.p]+" prayer")+'</h3><div class="small">'+who("Haid bermula selepas masuk waktu "+PN[V.ask.p]+" ("+pad(V.ask.a.getHours())+":"+pad(V.ask.a.getMinutes())+"). Sudahkah anda solat "+PN[V.ask.p]+" sebelum itu?","Your period started after "+PN[V.ask.p]+" time began ("+pad(V.ask.a.getHours())+":"+pad(V.ask.a.getMinutes())+"). Had you prayed "+PN[V.ask.p]+" before it?","Haid isteri bermula selepas masuk waktu "+PN[V.ask.p]+". Sudahkah dia solat sebelum itu?","Her period started after "+PN[V.ask.p]+" time began. Had she prayed it before?")+'</div><div class="btns" style="margin-top:8px"><button class="btn" data-pa="askyes">✓ '+L2("Sudah","Yes")+'</button><button class="btn alt" data-pa="askno">'+L2("Belum: perlu qadha selepas suci","No: make it up after purity")+'</button></div></div>';
  h += ibadahCard(p, cl) + qadaCard(p);
  var f = flags(p, cl, st);
  if(f.length) h += '<div class="card pdflags"><h3>⚠ '+L2("Perlu perhatian","Worth checking")+'</h3><ul class="ul">'+f.map(function(x){ return '<li>'+esc(tx(x))+'</li>'; }).join("")+'</ul><button class="chip" data-pt2="health">🩺 '+L2("Bila perlu jumpa doktor","When to see a doctor")+'</button></div>';
  h += logCard(p) + settingsCard(p);
  return h;
}
function settingsCard(p){
  var seg = function(k, cur, list){ return '<div class="rseg">'+list.map(function(o){ return '<button class="chip'+(String(cur)===o[0] ? ' on' : '')+'" data-ps="'+k+'" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>'; };
  return '<details class="card pdset"'+(V.set ? ' open' : '')+'><summary><b>⚙ '+L2("Tetapan haid","Period settings")+'</b></summary>'+
    '<div class="rlab">'+L2("Untuk siapa","Who is it for")+'</div>'+seg("who", p.who, [["self",L2("Saya","Me")],["spouse",L2("Isteri","My wife")],["off",L2("Sembunyi tab","Hide tab")]])+
    (p.who==="spouse" ? '<label class="pdl">'+L2("Nama isteri (pilihan)","Wife's name (optional)")+'<input id="pdName" class="rin" value="'+esc(p.name||"")+'"></label>' : '')+
    '<div class="r3c pdnums"><label class="pdl">'+L2("Kitaran (hari, 0 = auto)","Cycle (days, 0 = auto)")+'<input type="number" id="pdLen" class="rin" min="0" max="60" value="'+(p.len||0)+'"></label><label class="pdl">'+L2("Tempoh haid (0 = auto)","Period length (0 = auto)")+'<input type="number" id="pdPlen" class="rin" min="0" max="15" value="'+(p.plen||0)+'"></label><label class="pdl">'+L2("Kebiasaan haid / adah (hari)","Usual haid / 'adah (days)")+'<input type="number" id="pdHab" class="rin" min="0" max="15" value="'+(p.habit||0)+'"></label></div>'+
    '<label class="pdchk"><input type="checkbox" id="pdFirst"'+(p.first ? ' checked' : '')+'> '+L2("Remaja / haid pertama (kitaran 21–45 hari dikira normal)","Teen / first periods (21–45 day cycles count as normal)")+'</label>'+
    '<label class="pdchk"><input type="checkbox" id="pdFert"'+(p.fert ? ' checked' : '')+'> '+L2("Tunjuk ovulasi & tempoh subur","Show ovulation & fertile window")+'</label>'+
    (p.who!=="spouse" ? '<label class="pdchk"><input type="checkbox" id="pdUz2"'+(p.uzur ? ' checked' : '')+'> '+L2("Jeda makluman solat secara automatik semasa haid","Pause prayer alerts automatically during haid")+'</label>' : '')+
    '<div class="rlab" style="margin-top:10px">💑 '+L2("Kongsi dengan pasangan (bersulit)","Share with your partner (encrypted)")+'</div>'+
    (p.who==="spouse" ? '<div class="mut tiny">'+L2("Masukkan kod dan PIN dari telefon isteri untuk melihat ramalannya di sini.","Enter the code and PIN from your wife's phone to see her predictions here.")+(p.partner ? ' '+L2("Kemas kini terakhir: ","Last update: ")+esc(p.partner.upd) : '')+'</div><button class="btn alt" data-pa="pimport">📥 '+L2("Masukkan kod pasangan","Enter partner code")+'</button>'
      : '<div class="mut tiny">'+L2("Hantar tarikh ramalan (bukan catatan harian) kepada suami, disulitkan dengan PIN yang anda beritahu sendiri.","Send the predicted dates (not your daily logs) to your husband, encrypted with a PIN you tell him yourself.")+'</div><button class="btn alt" data-pa="pshare">💑 '+L2("Kongsi ramalan","Share predictions")+'</button>')+
    '<div class="btns" style="margin-top:8px"><button class="btn gold" data-pa="setsave">'+L2("Simpan","Save")+'</button><button class="btn alt" data-pa="wipe">🗑️ '+L2("Padam semua data haid","Delete all period data")+'</button></div></details>';
}
function calHtml(p, cl, st){
  var now = new Date(), m = V.m || new Date(now.getFullYear(), now.getMonth(), 1), dm = dayMap(cl), first = new Date(m.getFullYear(), m.getMonth(), 1), off = (first.getDay()+6)%7, nd = new Date(m.getFullYear(), m.getMonth()+1, 0).getDate();
  var pred = {}, fert = {}, ov = null;
  if(st.next && !p.preg.on){ for(var c = 0; c < 3; c++){ var ns = addD(st.next, c*st.cyc); for(var i=0;i<st.plen;i++) pred[ymd(addD(ns, i))] = 1; if(p.fert){ var o = addD(ns, -14); fert[ymd(o)] = 2; for(var j=-5;j<=1;j++) if(!fert[ymd(addD(o, j))]) fert[ymd(addD(o, j))] = 1; } } }
  var h = '<div class="card"><div class="rwk"><button class="chip" data-pm="-1">‹</button><b>'+fmtD(m, {month:"long", year:"numeric"})+'</b><button class="chip" data-pm="1">›</button></div><div class="pdgrid">'+
    ["Isn","Sel","Rab","Kha","Jum","Sab","Ahd"].map(function(x, i){ return '<span class="pdwd">'+L2(x, ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i])+'</span>'; }).join("");
  for(var b=0;b<off;b++) h += '<span></span>';
  for(var d=1; d<=nd; d++){
    var dd0 = new Date(m.getFullYear(), m.getMonth(), d), k = ymd(dd0), s = dm[k], x = p.days[k], hj = H.hijri ? H.hijri(dd0) : null;
    var cls = s ? "pd-"+s : pred[k] ? "pd-pred" : fert[k]===2 ? "pd-ov" : fert[k] ? "pd-fert" : "";
    h += '<button class="pdday '+cls+(k===ymd(now) ? ' tod' : '')+'" data-pday="'+k+'"><b>'+d+'</b>'+(hj && hj.m===9 ? '<i>🌙</i>' : '')+(x && (x.f>=1 || x.p>=2) ? '<em>'+(x.f>=1 ? "•" : "")+(x.p>=2 ? "⚡" : "")+'</em>' : '')+'</button>';
  }
  h += '</div><div class="pdleg"><span class="pd-haid">'+L2("Haid","Haid")+'</span><span class="pd-nifas">Nifas</span><span class="pd-ist">Istihadhah</span><span class="pd-pred">'+L2("Jangkaan","Predicted")+'</span>'+(p.fert ? '<span class="pd-fert">'+L2("Subur","Fertile")+'</span><span class="pd-ov">'+L2("Ovulasi","Ovulation")+'</span>' : '')+'<span>🌙 Ramadan</span></div><div class="mut tiny" style="margin-top:6px">'+L2("Ketik hari untuk catatan harian.","Tap a day for its daily log.")+'</div></div>';
  return h;
}
// 0.5.23 (Flo style): how close past predictions were, and which symptoms come when (before the period, during it, other days)
function insightsHtml(p, cl, st){ var hs = cl.filter(function(r){ return (r.kind==="haid" || r.kind==="pending") && r.haid; }), S0 = hs.map(function(r){ return day0(r.haid[0]); }), errs = [];
  for(var i=3;i<S0.length;i++){ var g = []; for(var j=Math.max(1, i-6); j<i; j++){ var x = dd(S0[j-1], S0[j]); if(x >= 15 && x <= 90) g.push(x); } if(!g.length) continue;
    var avg = Math.round(g.reduce(function(a, b){ return a+b; }, 0)/g.length), err = dd(addD(S0[i-1], avg), S0[i]); errs.push(err); }
  var h = '<div class="card pdins"><h3>🔮 '+L2("Ketepatan ramalan & simptom","Prediction accuracy & symptoms")+'</h3>';
  if(errs.length){ var last = errs.slice(-6), mae = Math.round(last.reduce(function(a, b){ return a+Math.abs(b); }, 0)/last.length*10)/10, ok = last.filter(function(e){ return Math.abs(e) <= 2; }).length;
    h += '<div class="pdacc"><b>±'+mae+'</b><span>'+L2("hari purata beza ramalan","days average miss")+'</span></div><div class="small">'+ok+'/'+last.length+' '+L2("ramalan tepat dalam 2 hari","predictions within 2 days")+'</div>'+
      '<div class="pderr">'+last.map(function(e){ return '<span class="'+(Math.abs(e)<=2?'ok':Math.abs(e)<=5?'mid':'bad')+'">'+(e>0?'+':'')+e+'</span>'; }).join("")+'</div><div class="mut tiny">'+L2("+ bermakna haid datang lewat daripada ramalan; − lebih awal.","+ means the period came later than predicted; − earlier.")+'</div>'; }
  else h += '<div class="mut small">'+L2("Selepas 4 kitaran, ketepatan ramalan ditunjuk di sini.","After 4 cycles, prediction accuracy shows here.")+'</div>';
  var ph = {pre: {}, dur: {}, oth: {}}, nd = {pre: 0, dur: 0, oth: 0}, names = {}; SYM.forEach(function(x){ names[x[0]] = L2(x[1], x[2]); });
  Object.keys(p.days).forEach(function(k){ var x = p.days[k]; if(!x || !(x.sy && x.sy.length) && x.p==null) return; var d = day0(dt(k)), ph0 = "oth";
    hs.forEach(function(r){ var a = day0(r.haid[0]), b = day0(r.haid[1]||r.haid[0]); var dl = dd(d, a); if(d >= a && d <= b) ph0 = "dur"; else if(dl >= 1 && dl <= 5 && ph0 !== "dur") ph0 = "pre"; });
    nd[ph0]++; (x.sy||[]).forEach(function(y){ ph[ph0][y] = (ph[ph0][y]||0)+1; }); if(+x.p >= 2) ph[ph0].__pain = (ph[ph0].__pain||0)+1; });
  var top = function(k){ var o = ph[k], ks = Object.keys(o).sort(function(a, b){ return o[b]-o[a]; }).slice(0, 3); return ks.length && nd[k] ? ks.map(function(y){ return (y==="__pain" ? L2("Sakit sederhana/teruk","Moderate/severe pain") : names[y]||y)+" "+Math.round(o[y]*100/nd[k])+"%"; }).join(" · ") : '<span class="mut">'+L2("belum cukup catatan","not enough logs yet")+'</span>'; };
  h += '<div class="pdph"><div><b>'+L2("5 hari sebelum haid","5 days before")+'</b><div class="small">'+top("pre")+'</div></div><div><b>'+L2("Semasa haid","During the period")+'</b><div class="small">'+top("dur")+'</div></div><div><b>'+L2("Hari lain","Other days")+'</b><div class="small">'+top("oth")+'</div></div></div>'+
    '<div class="mut tiny">'+L2("Dari catatan harian anda. Panduan sahaja, bukan diagnosis.","From your daily logs. A guide only, not a diagnosis.")+'</div></div>';
  return h; }
function recHtml(p, cl, st){
  var h = insightsHtml(p, cl, st)+'<div class="card"><h3>📈 '+L2("Ringkasan","Summary")+'</h3><div class="pdsum"><div><b>'+st.cyc+'</b><span>'+L2("hari kitaran","cycle days")+(p.len ? " ✎" : st.auto ? "" : " ~")+'</span></div><div><b>'+st.plen+'</b><span>'+L2("hari haid","period days")+'</span></div><div><b>'+st.n+'</b><span>'+L2("kitaran direkod","cycles logged")+'</span></div>'+(st.spread ? '<div><b>±'+Math.round(st.spread/2)+'</b><span>'+L2("hari beza","days apart")+'</span></div>' : '')+'</div>';
  if(st.gaps.length){ var mx = Math.max.apply(null, st.gaps.concat([40])); h += '<div class="pdbars">'+st.gaps.slice(-12).map(function(g){ var bad = g < 21 || g > (p.first ? 45 : 35); return '<div class="pdbar'+(bad ? ' bad' : '')+'"><i style="height:'+Math.round(g*100/mx)+'%"></i><small>'+g+'</small></div>'; }).join("")+'</div><div class="mut tiny">'+L2("Panjang kitaran (hijau 21–35 hari normal)","Cycle lengths (green 21–35 days is normal)")+'</div>'; }
  h += '</div><div class="card"><h3>🗂 '+L2("Rekod","Records")+'</h3>';
  if(!cl.length) h += '<div class="mut small">'+L2("Belum ada rekod. Tekan \"Haid bermula\" dalam Hari ini.","Nothing logged yet. Tap \"Period started\" on Today.")+'</div>';
  cl.slice().reverse().forEach(function(r){
    var len = r.e.e ? Math.max(1, Math.round((r.en - r.s)/864e5*10)/10) : null, nm = {haid:"Haid", nifas:"Nifas", istihadhah:"Istihadhah", pending:L2("Belum pasti","Not yet known")}[r.kind];
    h += '<div class="pdrec"><div class="pdrh"><b>'+esc(nm)+'</b> · '+fmtDT(r.s)+' → '+(r.e.e ? fmtDT(r.en) : L2("sedang berlaku","ongoing"))+(len ? ' · '+len+L2(" hari"," days") : '')+'</div>'+
      (r.ist.length ? '<div class="small pdisttxt">💧 Istihadhah: '+r.ist.map(function(x){ return fmtD(x[0])+" – "+fmtD(x[1]); }).join(", ")+'</div>' : '')+
      '<details class="small"><summary>'+L2("Kenapa?","Why?")+'</summary><ul class="ul">'+r.why.map(function(w){ return '<li>'+esc(tx(w))+'</li>'; }).join("")+'</ul></details>'+
      (V.edit===r.i ? '<div class="pdedit"><label class="pdl">'+L2("Mula","Start")+'<input type="datetime-local" class="rin" id="peS" value="'+r.e.s+'"></label><label class="pdl">'+L2("Tamat","End")+'<input type="datetime-local" class="rin" id="peE" value="'+(r.e.e||"")+'"></label><div class="rseg"><button class="chip'+(r.e.t!=="nifas" ? ' on' : '')+'" data-pet="haid">Haid</button><button class="chip'+(r.e.t==="nifas" ? ' on' : '')+'" data-pet="nifas">Nifas</button></div><div class="btns"><button class="btn gold" data-pa="editsave">'+L2("Simpan","Save")+'</button><button class="btn alt" data-pa="editdel">🗑️</button><button class="btn alt" data-pa="cancel">'+L2("Batal","Cancel")+'</button></div></div>' : '<button class="chip" data-pe="'+r.i+'">✏️ '+L2("Ubah","Edit")+'</button>')+'</div>';
  });
  h += '<button class="btn alt full" data-pa="addpast" style="margin-top:8px">＋ '+L2("Tambah rekod lama","Add an earlier record")+'</button></div>';
  return h;
}
function sec(id, title, inner, open){ return '<details class="card pdsec"'+(open || V.open===id ? ' open' : '')+' data-sec="'+id+'"><summary><b>'+title+'</b></summary><div class="pdsb">'+inner+'</div></details>'; }
function ul(list, ol){ return '<'+(ol ? 'ol' : 'ul')+' class="ul">'+list.map(function(x){ return '<li>'+esc(tx(x))+'</li>'; }).join("")+'</'+(ol ? 'ol' : 'ul')+'>'; }
function fiqhHtml(p, cl){
  var by = ramadanDays(cl), yrs = Object.keys(by).sort().reverse(), g = '';
  if(!yrs.length) g = '<div class="mut small">'+L2("Tiada hari haid/nifas direkod dalam bulan Ramadan.","No haid/nifas days logged in Ramadan.")+'</div>';
  yrs.forEach(function(y){ var n = by[y].length, added = p.qy[y]||0;
    g += '<div class="pdry"><b>Ramadan '+y+'H</b>: '+n+L2(" hari perlu diganti"," days to make up")+' <span class="mut tiny">('+by[y].map(function(k){ return dt(k).getDate(); }).join(", ")+')</span>'+
      (added >= n ? '<div class="pdok small">✔ '+L2("Sudah dimasukkan ke Puasa ganti","Already added to Make-up fasts")+'</div>' : '<button class="btn gold full" data-qy="'+y+'" data-qn="'+(n-added)+'" style="margin-top:6px">＋ '+L2("Masukkan "+(n-added)+" hari ke Puasa ganti","Add "+(n-added)+" days to Make-up fasts")+'</button>')+'</div>'; });
  g += '<div class="mut tiny" style="margin-top:6px">'+esc(tx([D.FATWA[7][2], D.FATWA[7][3]]))+'</div>';
  return sec("study", "🔎 "+L2("Tidak pasti haid atau istihadhah? Semak","Not sure if it is haid or istihadhah? Check"), studyHtml(p, cl), true)+
    sec("rules", "📏 "+L2("Hukum asas haid, nifas & istihadhah","Basic rules: haid, nifas & istihadhah"), ul(D.RULES))+
    sec("forbid", "🚫 "+L2("Larangan & yang dibenarkan","Not allowed & allowed"), '<b>✖ '+L2("Ditegah","Not allowed")+'</b>'+ul(D.FORBID)+'<b>✔ '+L2("Dibenarkan","Allowed")+'</b>'+ul(D.ALLOWED))+
    sec("puasa", "🌙 "+L2("Ganti puasa Ramadan","Ramadan make-up fasts"), g)+
    sec("solat", "🕌 "+L2("Solat di awal dan akhir haid","Prayer at the start and end of a period"), ul([[D.FATWA[5][2], D.FATWA[5][3]], [D.FATWA[4][2], D.FATWA[4][3]], ["Aplikasi ini bertanya secara automatik apabila anda merekod masa mula dan berhenti, menggunakan waktu solat zon anda.","This app asks automatically when you log the start and stop times, using your zone's prayer times."]]))+
    sec("ist", "💧 Istihadhah", ul(D.ISTIHADHAH, true))+
    sec("ghusl", "🚿 "+L2("Mandi wajib","Obligatory bath (ghusl)"), ul(D.GHUSL, true))+
    sec("first", "🌷 "+L2("Haid pertama (baligh)","First period (puberty)"), ul(D.FIRST))+
    (p.who==="spouse" ? sec("spouse", "💑 "+L2("Untuk suami","For husbands"), ul(D.SPOUSE), true) : sec("spouse", "💑 "+L2("Untuk suami","For husbands"), ul(D.SPOUSE)))+
    sec("hadith", "📜 "+L2("Ayat & hadis berkaitan","Related ayat & hadith"), D.HADITH.map(function(x){ return '<div class="pdhad"><div>'+esc(L2(x[1], x[2]))+'</div><div class="mut tiny">— '+esc(x[0])+'</div></div>'; }).join(""))+
    sec("fatwa", "⚖️ "+L2("Fatwa & hukum semasa","Fatwas & current rulings"), D.FATWA.map(function(x){ return '<div class="pdhad"><b>'+esc(L2(x[0], x[1]))+'</b><div>'+esc(L2(x[2], x[3]))+'</div></div>'; }).join(""))+
    '<div class="card hdisc"><h3>⚖️ '+L2("Panduan sahaja","A guide only")+'</h3><div class="small">'+L2("Hukum di sini mengikut mazhab Syafi'i dan amalan Malaysia, ditulis untuk panduan dan sedang menunggu semakan ustaz/ustazah. Untuk kes yang rumit, rujuk ustazah, Pejabat Mufti negeri atau JAKIM (e-Fatwa).","The rulings here follow the Shafi'i school and Malaysian practice, written as a guide and pending review by an ustaz/ustazah. For complex cases ask an ustazah, the state Mufti office or JAKIM (e-Fatwa).")+'</div></div>';
}
function studyHtml(p, cl){
  var s = V.study || {}, r = s.res, last = cl.filter(function(x){ return x.e.e && (x.kind==="haid" || x.kind==="nifas"); }).pop();
  var h = '<div class="small" style="line-height:1.45;margin-bottom:8px">'+L2("Isi apa yang anda tahu. Aplikasi menggunakan hukum mazhab Syafi'i untuk menentukan sama ada darah itu haid, istihadhah atau bukan haid, dan apa yang perlu dibuat.","Fill in what you know. The app uses the Shafi'i rules to tell whether the blood is haid, istihadhah or not haid, and what to do.")+'</div>'+
    '<label class="pdl">'+L2("Darah mula","Bleeding started")+'<input type="datetime-local" id="psS" class="rin" value="'+(s.s||"")+'"></label>'+
    '<label class="pdl">'+L2("Darah berhenti (kosongkan jika masih berdarah)","Bleeding stopped (leave empty if still bleeding)")+'<input type="datetime-local" id="psE" class="rin" value="'+(s.e||"")+'"></label>'+
    '<label class="pdl">'+L2("Haid sebelumnya berakhir pada (jika tahu)","The haid before it ended on (if known)")+'<input type="datetime-local" id="psL" class="rin" value="'+(s.l || (last ? (last.e.e||"") : ""))+'"></label>'+
    '<div class="r3c"><label class="pdl">'+L2("Kebiasaan haid (hari, 0 = tiada)","Usual haid (days, 0 = none)")+'<input type="number" id="psH" class="rin" min="0" max="15" value="'+(s.h!=null ? s.h : (p.habit||0))+'"></label><label class="pdl">'+L2("Hari darah kuat (hitam/pekat)","Days of strong (dark/thick) blood")+'<input type="number" id="psK" class="rin" min="0" max="60" value="'+(s.k||0)+'"></label></div>'+
    '<button class="btn gold full" data-pa="study">🔎 '+L2("Semak","Check")+'</button>';
  if(r){ h += '<div class="pdres pd-'+r.kind+'"><div class="pdh">'+esc(r.title)+'</div>'+ul(r.why)+(r.todo.length ? '<b>'+L2("Apa perlu dibuat","What to do")+'</b>'+ul(r.todo) : '')+'</div>'; }
  return h;
}
function runStudy(el){
  var g = function(id){ return (el.querySelector("#"+id)||{}).value || ""; };
  var s = {s:g("psS"), e:g("psE"), l:g("psL"), h:+g("psH")||0, k:+g("psK")||0};
  V.study = s; if(!s.s){ H.toast(L2("Masukkan masa darah mula","Enter when the bleeding started")); return; }
  var fake = {ep:[], days:{}, habit:s.h};
  // the previous haid only counts when it ended before this bleeding began
  if(s.l && dt(s.l) < dt(s.s)){ var le = dt(s.l); fake.ep.push({t:"haid", s:dts(addD(le, -6)), e:s.l}); }
  fake.ep.push({t:"haid", s:s.s, e:s.e||null});
  if(s.k){ for(var i=0;i<s.k;i++) fake.days[ymd(addD(dt(s.s), i))] = {c:"strong"}; }
  var r = classifyAll(fake).pop(), todo = [], title;
  if(r.kind==="pending") { title = L2("Belum pasti (kurang 24 jam setakat ini)","Not yet known (under 24 hours so far)"); todo.push(["Tinggalkan solat buat masa ini. Jika darah berhenti sebelum cukup 24 jam, qadha solat yang ditinggalkan.","Leave prayer for now. If it stops before 24 hours, make up the missed prayers."]); }
  else if(r.kind==="istihadhah"){ title = L2("Bukan haid: istihadhah","Not haid: istihadhah"); todo = D.ISTIHADHAH.slice(); todo.push(["Qadha solat yang ditinggalkan pada hari-hari itu.","Make up the prayers missed on those days."]); }
  else { title = r.ist.length ? L2("Sebahagian haid, selebihnya istihadhah","Partly haid, the rest istihadhah") : "Haid";
    if(r.haid) todo.push(["Haid: "+fmtDT(r.haid[0])+" hingga "+fmtDT(r.haid[1])+". Mandi wajib apabila suci.","Haid: "+fmtDT(r.haid[0])+" to "+fmtDT(r.haid[1])+". Take the obligatory bath when pure."]);
    if(r.ist.length){ todo.push(["Mulai "+fmtDT(r.ist[0][0])+": istihadhah. Mandi, kemudian solat dan puasa seperti biasa.","From "+fmtDT(r.ist[0][0])+": istihadhah. Bathe, then pray and fast as usual."]); todo = todo.concat(D.ISTIHADHAH.slice(1,3)); } }
  todo.push(["Jika masih ragu, tanya ustazah atau Pejabat Mufti negeri.","If still unsure, ask an ustazah or the state Mufti office."]);
  s.res = {kind:r.kind==="pending" ? "haid" : r.ist.length && r.kind==="haid" ? "ist" : r.kind==="istihadhah" ? "ist" : "haid", title:title, why:r.why, todo:todo};
  render(el);
}
function healthHtml(p, cl, st){
  var f = flags(p, cl, st), lmp = p.preg.lmp || (st.last ? ymd(st.last) : ""), edd = lmp ? addD(dt(lmp), 280) : null, wk = lmp ? dd(dt(lmp), new Date()) : 0;
  var preg = '<div class="small" style="margin-bottom:6px">'+ul(D.PREG)+'</div><label class="pdl">'+L2("Hari pertama haid terakhir (LMP)","First day of the last period (LMP)")+'<input type="date" id="pdLmp" class="rin" value="'+lmp+'"></label>'+
    (edd ? '<div class="pdedd">🤰 '+L2("Jika hamil: ","If pregnant: ")+'<b>'+Math.floor(wk/7)+L2(" minggu "," weeks ")+(wk%7)+L2(" hari"," days")+'</b> · '+L2("jangkaan bersalin ","due date ")+'<b>'+fmtD(edd, {day:"numeric", month:"long", year:"numeric"})+'</b></div>' : '')+
    '<div class="btns" style="margin-top:8px">'+(p.preg.on ? '<button class="btn alt" data-pa="pregoff">'+L2("Tamatkan mod hamil","End pregnancy mode")+'</button>' : '<button class="btn gold" data-pa="pregon">🤰 '+L2("Hidupkan mod hamil","Turn on pregnancy mode")+'</button>')+'</div>';
  return (f.length ? '<div class="card pdflags"><h3>⚠ '+L2("Daripada rekod anda","From your records")+'</h3>'+ul(f)+'</div>' : '<div class="card pdok2">✔ '+L2("Tiada tanda tidak normal dalam rekod setakat ini.","No abnormal signs in the records so far.")+'</div>')+
    sec("normal", "✅ "+L2("Kitaran normal","A normal cycle"), ul(D.NORMAL), true)+
    sec("abnormal", "🚩 "+L2("Tidak normal: jumpa doktor jika","Abnormal: see a doctor if"), ul(D.ABNORMAL))+
    sec("cond", "🧬 "+L2("Masalah biasa","Common conditions"), D.CONDITIONS.map(function(x){ return '<div class="pdhad"><b>'+esc(L2(x[0], x[1]))+'</b><div>'+esc(L2(x[2], x[3]))+'</div></div>'; }).join(""))+
    sec("cramps", "🔥 "+L2("Senggugut","Cramps"), ul(D.CRAMPS))+
    sec("hyg", "🧼 "+L2("Kebersihan","Hygiene"), ul(D.HYGIENE))+
    sec("preg", "🤰 "+L2("Semak kehamilan & tarikh bersalin","Pregnancy check & due date"), preg, V.open==="preg")+
    sec("first", "🌷 "+L2("Haid pertama","First period"), ul(D.FIRST))+
    sec("advice", "💡 "+L2("Nasihat","Advice"), ul(D.ADVICE))+
    (p.who==="spouse" ? sec("spouse", "💑 "+L2("Untuk suami","For husbands"), ul(D.SPOUSE)) : '')+
    '<div class="card hdisc"><div class="small">🩺 '+L2("Maklumat umum, bukan nasihat perubatan. Kecemasan (darah sangat banyak, pengsan, sakit perut teruk ketika hamil): hubungi 999 atau ke hospital.","General information, not medical advice. Emergencies (very heavy bleeding, fainting, severe belly pain in pregnancy): call 999 or go to hospital.")+'</div></div>';
}
// ---------------- actions ----------------
function bind(el){
  el.querySelectorAll("[data-pt]").forEach(function(b){ b.onclick = function(){ V.tab = b.getAttribute("data-pt"); V.start = V.end = false; render(el); var v = document.getElementById("view"); if(v) v.scrollTop = 0; }; });
  el.querySelectorAll("[data-pt2]").forEach(function(b){ b.onclick = function(){ V.tab = b.getAttribute("data-pt2"); V.open = "preg"; render(el); }; });
  el.querySelectorAll("[data-who]").forEach(function(b){ b.onclick = function(){ var p = P(); p.who = b.getAttribute("data-who"); save(p); H.toast(p.who==="off" ? L2("Tab Haid disembunyikan. Tunjuk semula dalam Tetapan.","The Period tab is hidden. Show it again in Settings.") : L2("Disimpan","Saved")); if(p.who==="off") H.render(); else render(el); }; });
  el.querySelectorAll("details.pdsec").forEach(function(d){ d.addEventListener("toggle", function(){ if(d.open) V.open = d.getAttribute("data-sec"); }); });
  var set = el.querySelector(".pdset"); if(set) set.addEventListener("toggle", function(){ V.set = set.open; });
  el.querySelectorAll("[data-ps]").forEach(function(b){ b.onclick = function(){ var p = P(); p[b.getAttribute("data-ps")] = b.getAttribute("data-v"); save(p); V.set = true; if(p.who==="off"){ H.toast(L2("Tab Haid disembunyikan. Tunjuk semula dalam Tetapan.","The Period tab is hidden. Show it again in Settings.")); H.render(); return; } render(el); }; });
  el.querySelectorAll("[data-ty]").forEach(function(b){ b.onclick = function(){ el.querySelectorAll("[data-ty]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  el.querySelectorAll("[data-pet]").forEach(function(b){ b.onclick = function(){ el.querySelectorAll("[data-pet]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  el.querySelectorAll("[data-pm]").forEach(function(b){ b.onclick = function(){ var m = V.m || new Date(new Date().getFullYear(), new Date().getMonth(), 1); V.m = new Date(m.getFullYear(), m.getMonth() + (+b.getAttribute("data-pm")), 1); render(el); }; });
  el.querySelectorAll("[data-pday]").forEach(function(b){ b.onclick = function(){ V.d = b.getAttribute("data-pday"); V.tab = "today"; render(el); setTimeout(function(){ var l = el.querySelector(".pdlog"); if(l) l.scrollIntoView({block:"start"}); }, 30); }; });
  el.querySelectorAll("[data-pe]").forEach(function(b){ b.onclick = function(){ V.edit = +b.getAttribute("data-pe"); render(el); }; });
  el.querySelectorAll("[data-qd]").forEach(function(b){ b.onchange = function(){ var p = P(), id = b.getAttribute("data-qd"); p.qada.forEach(function(q){ if(q.id===id) q.done = b.checked; }); save(p); H.toast(L2("Alhamdulillah, dicatat","Alhamdulillah, noted")); render(el); }; });
  el.querySelectorAll("[data-qy]").forEach(function(b){ b.onclick = function(){ var p = P(), y = b.getAttribute("data-qy"), n = +b.getAttribute("data-qn"); if(H.addGanti) H.addGanti(n); p.qy[y] = (p.qy[y]||0) + n; save(p); H.toast(n+L2(" hari dimasukkan ke Kalendar › Puasa › Puasa ganti"," days added to Calendar › Fasting › Make-up fasts")); render(el); }; });
  // daily log
  var dI = el.querySelector("#pdD"); if(dI) dI.onchange = function(){ V.d = dI.value || null; render(el); };
  var setDay = function(fn){ var p = P(), d = V.d || ymd(new Date()); p.days[d] = p.days[d] || {}; fn(p.days[d]); var x = p.days[d]; if(!x.f && !x.c && !x.p && !(x.sy||[]).length && !(x.hy||[]).length && !x.n && !x.note) delete p.days[d]; save(p); };
  if(window.IbDrop) [["f",FLOW],["c",COLOUR],["p",PAIN],["sy",SYM,1],["hy",HYG,1]].forEach(function(q){ var k = q[0], multi = !!q[2];
    window.IbDrop.bind(el, "pd"+k, ddItems(q[1], k, multi), function(){ var x = P().days[V.d || ymd(new Date())] || {}; return multi ? (x[k]||[]) : (x[k]==null ? "" : x[k]); }, multi,
      function(v){ var y = document.getElementById("view"), sy = y ? y.scrollTop : 0; setDay(function(x){ x[k] = multi ? v : (k==="c" ? v : +v); }); render(el); if(y) y.scrollTop = sy; }); });
  el.querySelectorAll("[data-pads]").forEach(function(b){ b.onclick = function(){ setDay(function(x){ x.n = Math.max(0, (x.n||0) + (+b.getAttribute("data-pads"))); }); render(el); }; });
  var nI = el.querySelector("#pdN"); if(nI) nI.onchange = function(){ setDay(function(x){ x.note = nI.value.trim(); }); };
  el.querySelectorAll("[data-pa]").forEach(function(b){ b.onclick = function(){ act(b.getAttribute("data-pa"), el); }; });
}
function qadaAdd(p, d, pr, why){ p.qada.push({id:"q"+Date.now().toString(36)+pr, d:ymd(d), p:pr, why:why, done:false}); }
// 0.5.23 partner mode: predictions sealed with AES-GCM; the key comes from a PIN (4-8 digits) stretched with 5000 rounds of SHA-256
function needKit(cb){ if(window.NostrKit){ cb(); return; } var s0 = document.createElement("script"); s0.src = "groups/nostrkit.js"; s0.onload = cb; s0.onerror = function(){ H.toast(L2("Gagal dimuatkan","Could not load")); }; document.body.appendChild(s0); }
function pkey(pin, salt){ var K = window.NostrKit, h = K.utf8ToBytes("myihsan-period:"+pin); var x = new Uint8Array(salt.length+h.length); x.set(salt); x.set(h, salt.length); var d = K.sha256(x); for(var i=0;i<5000;i++) d = K.sha256(d); return d; }
function b64(u8){ var s0 = ""; for(var i=0;i<u8.length;i++) s0 += String.fromCharCode(u8[i]); return btoa(s0); }
function unb64(s0){ var b = atob(s0), u = new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i] = b.charCodeAt(i); return u; }
function partnerShare(p){ var cl = classifyAll(p), st = stats(p, cl), c = current(cl);
  var ov = H.showSheet("💑 "+L2("Kongsi ramalan","Share predictions"), '<input id="ppin" class="rin" inputmode="numeric" maxlength="8" placeholder="'+L2("PIN 4–8 digit (beritahu suami sendiri)","PIN, 4–8 digits (tell him yourself)")+'"><button class="btn gold full" id="pgo" style="margin-top:10px">🔒 '+L2("Buat kod & kongsi","Make the code & share")+'</button>');
  ov.querySelector("#pgo").onclick = function(){ var pin = ov.querySelector("#ppin").value.replace(/\D/g, ""); if(pin.length < 4){ H.toast(L2("PIN sekurang-kurangnya 4 digit","The PIN needs at least 4 digits")); return; }
    needKit(function(){ var K = window.NostrKit, nx = [], d0 = st.next; for(var i=0;i<3 && d0;i++){ nx.push(ymd(addD(d0, i*st.cyc))); }
      var o = {v:1, upd: ymd(new Date()), cyc: st.cyc, plen: st.plen, next: nx, cur: c ? ymd(c.s) : null, fert: st.fert && p.fert ? [ymd(st.fert[0]), ymd(st.fert[1])] : null, preg: !!(p.preg && p.preg.on)};
      var salt = K.randomBytes(8), n = K.randomBytes(12), ct = K.gcm(pkey(pin, salt), n).encrypt(K.utf8ToBytes(JSON.stringify(o))), all = new Uint8Array(20+ct.length); all.set(salt); all.set(n, 8); all.set(ct, 20);
      var code = "MIP1."+b64(all), t = L2("Kod ramalan haid untuk My Ihsan (Masa › Haid › Tetapan › Masukkan kod pasangan). PIN saya beritahu sendiri.\n\n","Period predictions code for My Ihsan (Time › Period › Settings › Enter partner code). I'll tell you the PIN myself.\n\n")+code;
      H.closeOverlay(); if(H.N.shareText) H.N.shareText(t); else if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ H.toast(L2("Disalin","Copied")); }); }); }; }
function partnerImport(p, el){ var ov = H.showSheet("📥 "+L2("Kod pasangan","Partner code"), '<textarea id="pcode" class="rin" rows="3" placeholder="MIP1.…"></textarea><input id="ppin" class="rin" inputmode="numeric" maxlength="8" placeholder="PIN" style="margin-top:8px"><button class="btn gold full" id="pgo" style="margin-top:10px">🔓 '+L2("Buka","Open")+'</button>');
  ov.querySelector("#pgo").onclick = function(){ var raw = ov.querySelector("#pcode").value, m = /MIP1\.([A-Za-z0-9+\/=]+)/.exec(raw), pin = ov.querySelector("#ppin").value.replace(/\D/g, ""); if(!m){ H.toast(L2("Kod tidak sah","Not a valid code")); return; }
    needKit(function(){ try{ var K = window.NostrKit, u = unb64(m[1]), o = JSON.parse(new TextDecoder().decode(K.gcm(pkey(pin, u.slice(0, 8)), u.slice(8, 20)).decrypt(u.slice(20))));
      p.partner = o; save(p); H.closeOverlay(); H.toast(L2("Ramalan pasangan dikemas kini","Partner predictions updated")); render(el); }catch(e){ H.toast(L2("PIN salah atau kod rosak","Wrong PIN or a damaged code")); } }); }; }
function partnerCard(p){ var o = p.partner; if(!o || p.who!=="spouse") return ''; var nx = (o.next||[])[0];
  return '<div class="card pdpart"><h3>💑 '+L2("Dari telefon isteri","From your wife's phone")+'</h3>'+(o.preg ? '<div>🤰 '+L2("Sedang hamil","Pregnant")+'</div>' : o.cur ? '<div>🩸 '+L2("Haid bermula ","Period started ")+fmtD(dt(o.cur))+'</div>' : nx ? '<div>'+L2("Haid seterusnya dijangka: ","Next period expected: ")+'<b>'+fmtD(dt(nx), {weekday:"short", day:"numeric", month:"short"})+'</b> ('+dd(new Date(), dt(nx))+L2(" hari lagi"," days")+')</div>' : '')+
    (o.fert ? '<div class="small">'+L2("Tempoh subur: ","Fertile window: ")+fmtD(dt(o.fert[0]))+' – '+fmtD(dt(o.fert[1]))+'</div>' : '')+'<div class="mut tiny">'+L2("Kemas kini: ","Updated: ")+esc(o.upd)+' · '+L2("kitaran ","cycle ")+o.cyc+L2(" hari"," days")+'</div></div>'; }
function act(a, el){
  if(a==="pshare"){ partnerShare(P()); return; }
  if(a==="pimport"){ partnerImport(P(), el); return; }
  var p = P(), g = function(id){ return (el.querySelector("#"+id)||{}).value || ""; };
  if(a==="startform"){ V.start = true; V.end = false; render(el); return; }
  if(a==="endform"){ V.end = true; V.start = false; render(el); return; }
  if(a==="cancel"){ V.start = V.end = false; V.edit = null; V.ask = null; render(el); return; }
  if(a==="startsave"){
    var s = g("pdS"); if(!s) return; var ty = (el.querySelector("[data-ty].on")||{}).getAttribute ? el.querySelector("[data-ty].on").getAttribute("data-ty") : "haid";
    if(current(classifyAll(p))){ H.toast(L2("Rekod sebelum ini belum tamat. Rekod darah berhenti dahulu.","The previous record has not ended. Log when it stopped first.")); return; }
    p.ep.push({id:"e"+Date.now().toString(36), t:ty, s:s, e:null}); var uz = el.querySelector("#pdUz"); if(uz){ p.uzur = uz.checked; }
    save(p); V.start = false;
    if(uz && uz.checked && H.pause){ var st = stats(p, classifyAll(p)); H.pause(ty==="nifas" ? 40 : Math.min(15, st.plen + 2)); }
    var w = startPrayer(dt(s)); V.ask = w ? {p:w.p, a:w.a, d:dt(s)} : null;
    H.toast(L2("Dicatat. Semoga dipermudahkan.","Logged. May it be easy for you.")); render(el); return;
  }
  if(a==="askyes"){ V.ask = null; render(el); return; }
  if(a==="askno"){ qadaAdd(p, V.ask.d, V.ask.p, ["Haid datang selepas masuk waktu","Haid began after the time started"]); save(p); V.ask = null; render(el); return; }
  if(a==="endsave"){
    var e = g("pdE"), c = current(classifyAll(p)); if(!e || !c) return;
    if(dt(e) < dt(c.e.s)){ H.toast(L2("Masa berhenti sebelum masa mula","The stop time is before the start time")); return; }
    c.e.e = e; save(p); V.end = false;
    var r = classifyAll(p).filter(function(x){ return x.e.id===c.e.id; })[0];
    if(r && r.kind==="istihadhah"){ H.toast(L2("Kurang 24 jam: bukan haid. Qadha solat yang ditinggalkan.","Under 24 hours: not haid. Make up the missed prayers.")); }
    else { var due = endPrayers(dt(e)); due.forEach(function(x){ qadaAdd(p, dt(e), x, ["Wajib kerana suci dalam waktunya","Due because purity came within its time"]); }); if(due.length) save(p); }
    if(H.pause && p.uzur && !spouse()) H.pause(0);
    H.toast(L2("Dicatat. Jangan lupa mandi wajib.","Logged. Remember the obligatory bath.")); render(el); return;
  }
  if(a==="setsave"){
    p.len = Math.max(0, Math.min(60, +g("pdLen")||0)); p.plen = Math.max(0, Math.min(15, +g("pdPlen")||0)); p.habit = Math.max(0, Math.min(15, +g("pdHab")||0));
    var nm = el.querySelector("#pdName"); if(nm) p.name = nm.value.trim();
    p.first = !!(el.querySelector("#pdFirst")||{}).checked; p.fert = !!(el.querySelector("#pdFert")||{}).checked; var u2 = el.querySelector("#pdUz2"); if(u2) p.uzur = u2.checked;
    save(p); H.toast(L2("Disimpan","Saved")); render(el); return;
  }
  if(a==="wipe"){ if(confirm(L2("Padam semua data haid? Tidak boleh dibatalkan.","Delete all period data? This cannot be undone."))){ H.save(KEY, {who:p.who, name:p.name}); render(el); } return; }
  if(a==="pregon"){ var l = g("pdLmp") || (stats(p, classifyAll(p)).last ? ymd(stats(p, classifyAll(p)).last) : ymd(new Date())); p.preg = {on:true, lmp:l}; save(p); V.tab = "today"; H.toast(L2("Mod hamil dihidupkan. Tahniah!","Pregnancy mode on. Congratulations!")); render(el); return; }
  if(a==="pregoff"){ p.preg = {on:false, lmp:p.preg.lmp}; save(p); render(el); return; }
  if(a==="birth"){ p.preg = {on:false, lmp:p.preg.lmp}; p.ep.push({id:"e"+Date.now().toString(36), t:"nifas", s:dts(new Date()), e:null}); save(p); if(H.pause && p.uzur && !spouse()) H.pause(40); H.toast(L2("Nifas dicatat. Semoga ibu dan bayi sihat.","Nifas logged. May mother and baby be well.")); render(el); return; }
  if(a==="study"){ runStudy(el); return; }
  if(a==="addpast"){ var t0 = addD(new Date(), -30); p.ep.push({id:"e"+Date.now().toString(36), t:"haid", s:dts(t0), e:dts(addD(t0, 6))}); save(p); V.edit = classifyAll(p).filter(function(x){ return dts(x.s)===dts(t0); })[0].i; render(el); return; }
  if(a==="editsave" || a==="editdel"){
    var cl = classifyAll(p), r2 = cl.filter(function(x){ return x.i===V.edit; })[0]; if(!r2) return;
    var idx = p.ep.indexOf(r2.e) >= 0 ? p.ep.indexOf(r2.e) : V.edit;
    if(a==="editdel"){ if(!confirm(L2("Padam rekod ini?","Delete this record?"))) return; p.ep.splice(idx, 1); }
    else { var ns = g("peS"), ne = g("peE"); if(!ns) return; if(ne && dt(ne) < dt(ns)){ H.toast(L2("Masa tamat sebelum masa mula","The end is before the start")); return; } p.ep[idx].s = ns; p.ep[idx].e = ne || null; p.ep[idx].t = (el.querySelector("[data-pet].on")||{getAttribute:function(){ return "haid"; }}).getAttribute("data-pet"); }
    save(p); V.edit = null; render(el); return;
  }
}
// Home widget text (app.js): one line about now.
function widget(){
  var p = P(); if(!p.who || p.who==="off") return null;
  var cl = classifyAll(p), st = stats(p, cl), c = current(cl), now = new Date();
  if(p.preg.on && p.preg.lmp){ var w = dd(dt(p.preg.lmp), now); return "🤰 "+Math.floor(w/7)+L2(" minggu"," weeks"); }
  if(c) return "🌸 "+(c.kind==="nifas" ? "Nifas" : "Haid")+L2(" hari ke-"," day ")+(dd(c.s, now)+1);
  if(st.next){ var n = dd(now, st.next); return n >= 0 ? "🌸 "+L2("Haid dalam "+n+" hari","Period in "+n+" days") : "🌸 "+L2("Lewat "+(-n)+" hari","Late by "+(-n)+" days"); }
  return "🌸 "+L2("Tekan untuk mula","Tap to start");
}
// 0.3.1: items for the phone calendar (Google / Outlook). Private titles by default, since such calendars are often shared.
function syncItems(priv){
  var p = P(); if(!p.who || p.who==="off") return [];
  var cl = classifyAll(p), st = stats(p, cl), out = [], who2 = p.who==="spouse" ? L2(" (isteri)"," (wife)") : "";
  var name = function(full){ return priv ? "🌸" : full+who2; };
  var c = current(cl);
  if(c){ out.push({k:"pd-now-"+c.e.id, day:ymd(c.s), days:Math.max(1, dd(c.s, new Date())+1), t:name(c.kind==="nifas" ? "Nifas" : "Haid"), d:priv ? "" : L2("Direkod dalam My Ihsan","Logged in My Ihsan")}); }
  if(st.next && !p.preg.on){
    for(var i=0;i<3;i++){ var ns = addD(st.next, i*st.cyc); if(c && i===0 && dd(c.s, ns) < st.cyc/2) continue;
      out.push({k:"pd-next-"+i, day:ymd(ns), days:st.plen, t:name(L2("Haid (jangkaan)","Period (expected)")), d:priv ? "" : L2("Anggaran daripada kitaran purata "+st.cyc+" hari","Estimate from an average "+st.cyc+"-day cycle")});
      if(p.fert){ var ov = addD(ns, -14); out.push({k:"pd-fert-"+i, day:ymd(addD(ov, -5)), days:7, t:priv ? "🌱" : L2("Tempoh subur","Fertile window")+who2, d:priv ? "" : L2("Ovulasi dijangka ","Ovulation expected ")+fmtD(ov)}); } }
  }
  if(p.preg.on && p.preg.lmp) out.push({k:"pd-edd", day:ymd(addD(dt(p.preg.lmp), 280)), t:priv ? "👶" : L2("Jangkaan bersalin","Due date")+who2, d:""});
  p.qada.filter(function(q){ return !q.done; }).slice(0, 20).forEach(function(q){ out.push({k:"pd-q-"+q.id, day:ymd(new Date()), t:priv ? "🕌" : L2("Qadha solat ","Make up ")+PN[q.p], d:""}); });
  return out;
}
window.PeriodView = {
  syncItems:function(h, priv){ H = h; try{ return syncItems(priv); }catch(e){ return []; } },
  view:function(el, h){ H = h; render(el); },
  widget:function(h){ H = h; try{ return widget(); }catch(e){ return null; } },
  navGet:function(){ return {k:V.tab, t:V.tab}; },
  navSet:function(s){ if(s && s.t) V.tab = s.t; },
  _h:function(){ return H; },
  _t:{windowAt:windowAt, classifyAll:classifyAll, stats:stats, endPrayers:endPrayers, startPrayer:startPrayer, ramadanDays:ramadanDays, flags:flags, V:V}
};
})();
