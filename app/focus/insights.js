/* 0.5.2 Masa › Statistik: screen-time insights for the person's own phone (Usage access). Day or week: hourly screen-on bars,
   peak hour, pickups, longest use, top apps with share of time (warning when one app takes over half), productive / neutral /
   distracting balance (tap an app to change its group), ibadah link (prayers, Quran, focus), mood check-in, weekly report
   notification and a share card. Reads only; nothing is blocked or changed. State: localStorage ihsan_insights {rep, cat, mood}. */
(function(){
"use strict";
var H = null, mode = "d";
function L(a, b){ return H.L2x(a, b); }
function esc(s){ return H.esc(s==null ? "" : String(s)); }
function st(){ var s = H.load("ihsan_insights", null) || {}; s.cat = s.cat || {}; s.mood = s.mood || {}; if(s.rep===undefined) s.rep = true; return s; }
function put(s){ H.save("ihsan_insights", s); }
function hm(ms){ var m = Math.round((ms||0)/60000); return m >= 60 ? Math.floor(m/60)+L("j ","h ")+(m%60)+"m" : m+"m"; }
function shift(day, n){ var p = day.split("-"), d = new Date(+p[0], +p[1]-1, +p[2]); d.setDate(d.getDate()+n); return H.ymd(d); }
function data(from, to){ try{ return JSON.parse(H.N.focusInsights ? H.N.focusInsights(from, to) : "{}") || {}; }catch(e){ return {}; } }

// productive / neutral / distracting: the person's choice first, then simple rules
var PROD = /quran|muslim|ihsan|salah|prayer|azan|hadith|zikir|dhikr|docs|office|notion|keep|calendar|classroom|duolingo|kindle|books/i;
/** group of an app: "p" productive, "n" neutral, "d" distracting */
function group(pkg, label, cat){ var c = st().cat[pkg]; if(c) return c;
  if(PROD.test(pkg) || PROD.test(label||"")) return "p";
  if(cat===7) return "p";                       // CATEGORY_PRODUCTIVITY
  if(cat===0 || cat===2 || cat===4) return "d"; // GAME, VIDEO, SOCIAL
  return "n"; }
var GN = {p:["Produktif","Productive","#3fb27f"], n:["Neutral","Neutral","#8a9a90"], d:["Mengganggu","Distracting","#e58a4d"]};

/** sums one day or several: {scr, pk, long, h[24], apps:[[pkg,label,ms,cat]], g:{p,n,d}, days} */
function sum(D, days){
  var o = {scr:0, pk:0, long:0, h:[], apps:[], g:{p:0, n:0, d:0}, days:0}, A = {};
  for(var i=0;i<24;i++) o.h.push(0);
  days.forEach(function(k){ var x = D[k]; if(!x) return; o.days++; o.scr += x.scr||0; o.pk += x.pk||0; o.long = Math.max(o.long, x.long||0);
    (x.h||[]).forEach(function(v, i){ o.h[i] += v; });
    (x.apps||[]).forEach(function(a){ var r = A[a[0]] || (A[a[0]] = [a[0], a[1], 0, a[3]]); r[2] += a[2]; }); });
  o.apps = Object.keys(A).map(function(k){ return A[k]; }).sort(function(a, b){ return b[2] - a[2]; });
  o.apps.forEach(function(a){ o.g[group(a[0], a[1], a[3])] += a[2]; });
  return o;
}
function peak(h){ var b = 0; for(var i=1;i<24;i++) if(h[i] > h[b]) b = i; return h[b] ? b : -1; }
function hr(i){ return ("0"+i).slice(-2)+":00"; }

function render(box, h, day){
  H = h; var today = H.ymd(new Date()); day = day || today;
  var from = mode==="w" ? shift(day, -13) : day, D = data(from, day);
  var days = mode==="w" ? [0,1,2,3,4,5,6].map(function(i){ return shift(day, -6+i); }) : [day];
  var prev = mode==="w" ? [0,1,2,3,4,5,6].map(function(i){ return shift(day, -13+i); }) : [];
  var o = sum(D, days), tot = o.apps.reduce(function(s, a){ return s + a[2]; }, 0) || 1, pk = peak(o.h), mx = Math.max.apply(null, o.h) || 1;
  var x = '<div class="card insc"><div class="row"><h3 style="margin:0">🧭 '+L("Wawasan masa skrin","Screen-time insights")+'</h3><div class="chips">'+
    [["d","Hari","Day"],["w","Minggu","Week"]].map(function(m){ return '<button class="chip'+(mode===m[0] ? ' on' : '')+'" data-insm="'+m[0]+'">'+L(m[1], m[2])+'</button>'; }).join("")+'</div></div>';
  if(!o.days){ box.innerHTML = x+'<div class="mut small" style="margin-top:6px">'+L("Tiada data penggunaan untuk tempoh ini.","No usage data for this period.")+'</div></div>'; bind(box, day); return; }
  // headline numbers
  var avg = o.scr / Math.max(1, o.days);
  x += '<div class="urow3" style="margin-top:8px"><div><b>'+hm(mode==="w" ? avg : o.scr)+'</b><span class="mut tiny">'+(mode==="w" ? L("purata sehari","daily average") : L("skrin hidup","screen on"))+'</span></div>'+
    '<div><b>'+Math.round(mode==="w" ? o.pk/Math.max(1, o.days) : o.pk)+'</b><span class="mut tiny">'+L("kali buka telefon","pickups")+(mode==="w" ? L(" sehari"," a day") : "")+'</span></div>'+
    '<div><b>'+hm(o.long)+'</b><span class="mut tiny">'+L("guna paling lama","longest use")+'</span></div></div>';
  if(mode==="w"){ var po = sum(D, prev);
    if(po.days){ var pa = po.scr/po.days, ch = pa ? Math.round((avg - pa)*100/pa) : 0;
      x += '<div class="instr '+(ch > 0 ? 'up' : 'down')+'">'+(ch > 0 ? '▲ ' : '▼ ')+Math.abs(ch)+'% '+L("berbanding minggu lepas","vs last week")+'</div>'; }
    var wm = Math.max.apply(null, days.map(function(k){ return (D[k]||{}).scr||0; })) || 1, WD = L("Ahd,Isn,Sel,Rab,Kha,Jum,Sab","Sun,Mon,Tue,Wed,Thu,Fri,Sat").split(",");
    x += '<div class="inswk">'+days.map(function(k){ var v = (D[k]||{}).scr||0, p = k.split("-"); return '<div><i style="height:'+Math.round(v*100/wm)+'%"></i><small>'+WD[new Date(+p[0], +p[1]-1, +p[2]).getDay()]+'</small><em>'+hm(v)+'</em></div>'; }).join("")+'</div>';
  }
  // hourly bars and peak hour
  x += '<div class="mut tiny" style="margin-top:10px">'+L("Ikut jam","By hour")+(pk >= 0 ? ' · '+L("paling sibuk ","busiest ")+'<b>'+hr(pk)+'–'+hr((pk+1)%24)+'</b>' : '')+'</div><div class="inshr">'+o.h.map(function(v, i){ return '<i class="'+(i===pk ? 'pk' : '')+'" style="height:'+Math.max(2, Math.round(v*100/mx))+'%" title="'+hr(i)+'"></i>'; }).join("")+'</div><div class="inshl"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>';
  // balance
  x += '<div class="mut tiny" style="margin-top:10px">'+L("Keseimbangan","Balance")+'</div><div class="insbal">'+["p","n","d"].map(function(g){ return o.g[g] ? '<i style="flex:'+o.g[g]+';background:'+GN[g][2]+'"></i>' : ''; }).join("")+'</div>'+
    '<div class="inslg">'+["p","n","d"].map(function(g){ return '<span><i style="background:'+GN[g][2]+'"></i>'+L(GN[g][0], GN[g][1])+' '+hm(o.g[g])+'</span>'; }).join("")+'</div>';
  // top apps
  var top = o.apps.slice(0, 8), big = top[0] && top[0][2]/tot > 0.5 ? top[0] : null;
  x += '<div class="mut tiny" style="margin-top:10px">'+L("Aplikasi utama (ketik untuk tukar kumpulan)","Top apps (tap to change group)")+'</div>'+
    top.map(function(a){ var g = group(a[0], a[1], a[3]), pc = Math.round(a[2]*100/tot); return '<button class="insap" data-insap="'+esc(a[0])+'"><span class="insn">'+esc(a[1])+'</span><span class="insb"><i style="width:'+pc+'%;background:'+GN[g][2]+'"></i></span><span class="inst">'+hm(a[2])+' · '+pc+'%</span></button>'; }).join("")+
    (big ? '<div class="inswarn">⚠ '+esc(big[1])+L(" mengambil lebih separuh masa aplikasi anda. Mungkin cuba Time Nudge dalam Fokus?"," takes more than half of your app time. Maybe try Time Nudge in Focus?")+'</div>' : '');
  // ibadah link
  var pr = 0, qm = 0, fm = 0; days.forEach(function(k){ pr += H.prCount ? H.prCount(k) : 0; qm += H.quranSec ? H.quranSec(k) : 0; fm += H.focusMin ? H.focusMin(k) : 0; });
  x += '<div class="insib">🕌 '+pr+'/'+(5*days.length)+' '+L("solat","prayers")+' · 🎧 '+Math.round(qm/60)+' min Al-Quran · 🎯 '+fm+' min '+L("fokus","focus")+'<br><span class="mut tiny">'+L("Masa skrin "+hm(o.scr)+". Setiap 15 minit dikurangkan cukup untuk membaca satu muka surat Al-Quran.","Screen time "+hm(o.scr)+". Every 15 minutes saved is enough to read a page of the Quran.")+'</span></div>';
  // mood check-in (today only)
  var S0 = st();
  if(day===today) x += '<div class="mut tiny" style="margin-top:10px">'+L("Bagaimana perasaan anda tentang penggunaan telefon hari ini?","How do you feel about your phone use today?")+'</div><div class="insmd">'+["😣","🙁","😐","🙂","😊"].map(function(e, i){ return '<button class="'+(S0.mood[today]===i+1 ? 'on' : '')+'" data-insmd="'+(i+1)+'">'+e+'</button>'; }).join("")+'</div>';
  if(mode==="w"){ var ms = days.map(function(k){ return S0.mood[k] ? ["😣","🙁","😐","🙂","😊"][S0.mood[k]-1] : "·"; }); x += '<div class="mut tiny" style="margin-top:4px">'+L("Perasaan minggu ini: ","Mood this week: ")+ms.join(" ")+'</div>'; }
  x += '<div class="btns" style="margin-top:10px"><button class="btn alt" id="insSh">📤 '+L("Kongsi ringkasan","Share summary")+'</button></div>'+
    '<label class="set" style="margin-top:6px"><span>🔔 '+L("Laporan mingguan (Ahad, 8 malam)","Weekly report (Sunday, 8 pm)")+'</span><input type="checkbox" id="insRep"'+(S0.rep ? ' checked' : '')+'></label></div>';
  box.innerHTML = x; bind(box, day, o, days);
}
function bind(box, day, o, days){
  box.querySelectorAll("[data-insm]").forEach(function(b){ b.onclick = function(){ mode = b.getAttribute("data-insm"); render(box, H, day); }; });
  box.querySelectorAll("[data-insap]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-insap"), s = st(), a = o.apps.filter(function(x){ return x[0]===k; })[0], g = group(k, a[1], a[3]);
    s.cat[k] = {p:"n", n:"d", d:"p"}[g]; put(s); H.toast(esc(a[1])+" → "+L(GN[s.cat[k]][0], GN[s.cat[k]][1])); render(box, H, day); }; });
  box.querySelectorAll("[data-insmd]").forEach(function(b){ b.onclick = function(){ var s = st(); s.mood[H.ymd(new Date())] = +b.getAttribute("data-insmd"); put(s); render(box, H, day); }; });
  var rp = box.querySelector("#insRep"); if(rp) rp.onchange = function(){ var s = st(); s.rep = rp.checked; put(s); if(H.pushSchedule) H.pushSchedule(); };
  var sh = box.querySelector("#insSh"); if(sh) sh.onclick = function(){ share(o, days); };
}
/** share card: a PNG of the summary through the phone's share sheet */
function share(o, days){
  var W = 1080, Hh = 1350, cv = document.createElement("canvas"); cv.width = W; cv.height = Hh; var x = cv.getContext("2d");
  var g = x.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, "#0b3d2a"); g.addColorStop(1, "#06261a"); x.fillStyle = g; x.fillRect(0, 0, W, Hh);
  x.textAlign = "center"; x.fillStyle = "#c9a646"; x.font = "600 46px sans-serif"; x.fillText("🧭 "+L("Masa skrin saya","My screen time"), W/2, 120);
  x.fillStyle = "#c9d8cd"; x.font = "30px sans-serif"; x.fillText(days.length > 1 ? days[0]+" – "+days[days.length-1] : days[0], W/2, 175);
  x.fillStyle = "#fff"; x.font = "700 120px sans-serif"; x.fillText(hm(o.scr/Math.max(1, o.days)), W/2, 340);
  x.fillStyle = "#a9b8ae"; x.font = "30px sans-serif"; x.fillText(days.length > 1 ? L("purata sehari","daily average") : L("skrin hidup","screen on"), W/2, 390);
  var mx = Math.max.apply(null, o.h) || 1; for(var i=0;i<24;i++){ var bh = Math.round(o.h[i]*260/mx); x.fillStyle = "#c9a646"; x.fillRect(120 + i*35, 720 - bh, 26, bh); }
  x.fillStyle = "#a9b8ae"; x.font = "24px sans-serif"; ["0","6","12","18","24"].forEach(function(t, i){ x.fillText(t, 120 + i*6*35 + (i===4 ? -10 : 13), 760); });
  var tot = o.g.p + o.g.n + o.g.d || 1, bx = 120; ["p","n","d"].forEach(function(k){ var w = Math.round(o.g[k]*840/tot); x.fillStyle = GN[k][2]; x.fillRect(bx, 820, w, 36); bx += w; });
  x.font = "28px sans-serif"; x.textAlign = "left"; ["p","n","d"].forEach(function(k, i){ x.fillStyle = GN[k][2]; x.fillRect(120 + i*290, 890, 24, 24); x.fillStyle = "#fff"; x.fillText(L(GN[k][0], GN[k][1])+" "+hm(o.g[k]), 156 + i*290, 912); });
  x.textAlign = "center"; x.fillStyle = "#fff"; x.font = "34px sans-serif"; x.fillText("📱 "+o.pk+" "+L("kali buka telefon","pickups")+"  ·  ⏱ "+L("paling lama ","longest ")+hm(o.long), W/2, 1020);
  x.fillStyle = "#c9d8cd"; x.font = "italic 30px sans-serif"; x.fillText(L("“Dua nikmat yang ramai manusia terpedaya: kesihatan dan masa lapang.”","“Two blessings many people lose out on: health and free time.”"), W/2, 1130);
  x.font = "24px sans-serif"; x.fillText("(HR Bukhari)", W/2, 1170);
  x.fillStyle = "#c9a646"; x.font = "600 34px sans-serif"; x.fillText("My Ihsan", W/2, Hh - 70);
  var url = cv.toDataURL("image/png"), txt = L("Masa skrin saya","My screen time")+" · My Ihsan";
  if(H.shareImage) H.shareImage(url, txt);
}
window.InsightsView = {render:render, week:function(){ mode = "w"; }, _t:{group:group, sum:sum, peak:peak}};
})();
