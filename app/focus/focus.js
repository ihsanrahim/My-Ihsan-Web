/* 0.5.1 Masa › Fokus: focus sessions for yourself. Quick Focus and Pomodoro with a countdown ring, Do Not Disturb during a session,
   focus plans (time, prayer time, Jumaat) that remind you to start, templates, a focus screen lock (pins My Ihsan on screen with
   the countdown and a zikir counter; unlock by swiping the 🔒 handle 5 times) and Time Nudge (a gentle notification when today's
   use of an app passes your limit). Nothing here stops other apps; it helps you choose. State: localStorage ihsan_focus. */
(function(){
"use strict";
var H = null, F = null, tick = null;
function L(a, b){ return H.L2x(a, b); }
function esc(s){ return H.esc(s==null ? "" : String(s)); }
function N(){ return H.N || {}; }
function st(){ if(F) return F; F = H.load("ihsan_focus", null) || {}; F.sess = F.sess || {on:false}; F.plans = F.plans || []; F.log = F.log || {};
  F.set = F.set || {}; F.set.dnd = F.set.dnd !== false; F.set.pomo = F.set.pomo || {work:25, brk:5, longBrk:15, every:4}; F.set.nudge = F.set.nudge || {on:false, apps:[], mins:30}; return F; }
function save(){ H.save("ihsan_focus", st()); extras(); try{ if(N().focusNudge) N().focusNudge(JSON.stringify(st().set.nudge)); }catch(e){} }
var PRAYERS = [["subuh","Subuh","Fajr"],["zohor","Zohor","Dhuhr"],["asar","Asar","Asr"],["maghrib","Maghrib","Maghrib"],["isyak","Isyak","Isha"]];
function DAYS(){ return L("Ahd,Isn,Sel,Rab,Kha,Jum,Sab","Sun,Mon,Tue,Wed,Thu,Fri,Sat").split(","); }
var TEMPLATES = [
  ["solat","🕌","Waktu Solat","Prayer focus",{type:"prayer", prayers:["subuh","zohor","asar","maghrib","isyak"], after:20}],
  ["jumaat","🕋","Jumaat","Friday prayer",{type:"jumaat", before:30, after:60}],
  ["kerja","💼","Fokus Kerja","Focus at work",{type:"time", days:[1,2,3,4,5], from:"08:00", to:"17:00"}],
  ["belajar","🎒","Belajar","Back to school",{type:"time", days:[1,2,3,4,5], from:"08:00", to:"16:00"}],
  ["ulangkaji","📚","Waktu Ulangkaji","Study time",{type:"time", days:[1,2,3,4,5], from:"16:00", to:"21:00"}],
  ["diri","🌿","Masa Untuk Diri","Time for myself",{type:"time", days:[1,2,3,4,5], from:"17:00", to:"18:00"}],
  ["detoks","🌙","Detoks Digital","Digital detox",{type:"time", days:[0], from:"08:00", to:"20:00"}],
  ["tidur","😴","Sebelum Tidur","Wind down",{type:"time", days:[], from:"22:00", to:"23:30"}],
  ["pagi","🌅","Pagi Berkat","Mindful morning",{type:"prayer", prayers:["subuh"], after:90}]];

function hm(ms){ var m = Math.max(0, Math.round(ms/60000)); return m < 60 ? m+" min" : Math.floor(m/60)+L(" j "," h ")+(m%60)+" min"; }
function clock(t){ return new Date(t).toLocaleTimeString(ibLoc(H.S.lang==="en"), {hour:"numeric", minute:"2-digit"}); }
function pt(){ return H.prayerTimes ? H.prayerTimes() : []; }   // [{t, k, n, ne}] yesterday..next days

// ---------------- session (Quick Focus / Pomodoro) ----------------
/** current phase: {work:bool, end:ms, round} or null when no session */
function phase(now){
  var s = st().sess; if(!s.on) return null; if(s.until && now >= s.until) return null;
  if(!s.pomo) return {work:true, end:s.until||0, round:0};
  var p = st().set.pomo, w = p.work*60000, b = p.brk*60000, lb = p.longBrk*60000, t = s.start, r = 0;
  while(t <= now && r < 400){ if(now < t + w) return {work:true, end:Math.min(t + w, s.until||Infinity), round:r+1}; r++; var br = r % p.every===0 ? lb : b; if(now < t + w + br) return {work:false, end:t + w + br, round:r}; t += w + br; }
  return null;
}
function start(mins, opts){
  var s = st().sess, now = Date.now(); opts = opts || {};
  s.on = true; s.start = now; s.until = mins ? now + mins*60000 : 0; s.pomo = !!opts.pomo; s.name = opts.name || ""; s.ic = opts.ic || "🎯";
  if(st().set.dnd && N().quiet) N().quiet(true);
  save(); H.toast("🎯 "+L("Fokus dimulakan","Focus started")); if(opts.lock) lockScreen();
}
// 0.5.23 (Forest style): a tree grows during each focus session. Finish it (or focus 10+ minutes without a limit) and it is planted in
// your garden; stop before 80% of the time and it withers. Garden: ihsan_focus.trees [{d, k, m, dead}]
var TREES = [["palm", "🌴", "Pokok kurma", "Date palm"], ["olive", "🌳", "Pokok zaitun", "Olive tree"], ["pine", "🌲", "Pokok cemara", "Pine"], ["fig", "🌿", "Pokok tin", "Fig"], ["sakura", "🌸", "Pokok berbunga", "Blossom tree"]];
function treeKind(s){ return TREES[(Math.floor((s.start||0)/60000)) % TREES.length]; }
function treeSvg(f, kind, dead){ f = Math.max(0.05, Math.min(1, f)); var h = 20 + 70*f, cw = 10 + 46*f, col = dead ? "#8a7a5a" : kind[0]==="sakura" ? "#f2a7c3" : kind[0]==="pine" ? "#2e7d5b" : kind[0]==="palm" ? "#3fae6a" : "#4caf50";
  var top = 150 - h, can = kind[0]==="pine" ? '<polygon points="85,'+(top-cw*0.9)+' '+(85-cw*0.8)+','+(top+cw*0.5)+' '+(85+cw*0.8)+','+(top+cw*0.5)+'" fill="'+col+'"/>'
    : kind[0]==="palm" ? [0,1,2,3,4].map(function(i){ var a = -150 + i*30, r = cw; return '<path d="M85 '+top+' q '+(r*0.6*Math.cos(a*Math.PI/180))+' '+(r*0.6*Math.sin(a*Math.PI/180)-8)+' '+(r*Math.cos(a*Math.PI/180))+' '+(r*Math.sin(a*Math.PI/180))+'" stroke="'+col+'" stroke-width="'+(4+3*f)+'" fill="none" stroke-linecap="round"/>'; }).join("")
    : '<circle cx="85" cy="'+top+'" r="'+cw*0.62+'" fill="'+col+'"/><circle cx="'+(85-cw*0.42)+'" cy="'+(top+cw*0.2)+'" r="'+cw*0.42+'" fill="'+col+'"/><circle cx="'+(85+cw*0.42)+'" cy="'+(top+cw*0.2)+'" r="'+cw*0.42+'" fill="'+col+'"/>';
  return '<svg class="foTree" viewBox="0 0 170 170" aria-hidden="true"><ellipse cx="85" cy="152" rx="46" ry="8" fill="rgba(120,90,40,.35)"/><rect x="'+(85-2-2*f)+'" y="'+top+'" width="'+(4+4*f)+'" height="'+h+'" rx="3" fill="'+(dead?"#6b5a3e":"#8a5a2b")+'"/>'+can+'</svg>'; }
function stop(done){
  var s = st().sess, now = Date.now(); if(!s.on) return;
  var mins = Math.round((Math.min(now, s.until||now) - s.start)/60000), d = H.ymd(new Date()); st().log[d] = (st().log[d]||0) + Math.max(0, mins);
  var plan = s.until ? (s.until - s.start)/60000 : 0, full = plan ? mins >= plan*0.8 : mins >= 10, kind = treeKind(s); st().trees = st().trees || [];
  if(mins >= 1){ st().trees.push({d: d, k: kind[0], m: mins, dead: !full}); if(st().trees.length > 400) st().trees = st().trees.slice(-400); }
  s.on = false; if(N().quiet) N().quiet(false); save();
  if(mins >= 1) H.toast(full ? kind[1]+" "+L("Alhamdulillah, "+mins+" minit. "+kind[2]+" ditanam di taman anda.","Well done, "+mins+" minutes. A "+kind[3].toLowerCase()+" is planted in your garden.") : "🥀 "+L("Pokok layu kerana fokus dihentikan awal.","The tree withered because focus stopped early."));
}
/** notifications for the native scheduler: session end, pomodoro breaks, plan starts (read by buildExtras from ihsan_focus_ex) */
function extras(){
  var out = [], now = Date.now(), s = st().sess;
  if(s.on){ var t = now, k = 0;
    while(k < 16){ var p = phase(t + 1000); if(!p || !p.end) break; out.push({t:p.end, id:"fo"+p.end, title:p.work ? "☕ "+L("Masa rehat","Break time") : "🎯 "+L("Kembali fokus","Back to focus"), body:p.work ? L("Rehat sebentar. Regangkan badan atau berzikir.","Take a short break. Stretch or do some zikir.") : L("Sesi fokus seterusnya bermula.","The next focus round starts."), open:"side:cal/fokus"}); t = p.end; k++; }
    if(s.until) out.push({t:s.until, id:"foend", title:"✅ "+L("Sesi fokus selesai","Focus session done"), body:L("Alhamdulillah. Ketik untuk lihat ringkasan.","Well done. Tap to see your summary."), open:"side:cal/fokus"});
  }
  plans().forEach(function(x){ out.push({t:x.t, id:"fp"+x.id+x.t, title:x.ic+" "+x.name, body:L("Masa untuk fokus. Ketik untuk mula sesi.","Time to focus. Tap to start a session."), open:"side:cal/fokus"}); });
  H.save("ihsan_focus_ex", out.filter(function(x){ return x.t > now; }).slice(0, 30));
  if(H.pushSchedule) H.pushSchedule();
}
/** upcoming plan starts for the next 3 days [{t, id, name, ic, end}] */
function plans(){
  var out = [], now = Date.now(), P = pt();
  st().plans.forEach(function(p){ if(p.on===false) return;
    if(p.type==="time"){ for(var i=0;i<3;i++){ var d = new Date(); d.setDate(d.getDate()+i); if(p.days && p.days.length && p.days.indexOf(d.getDay())<0) continue; var a = p.from.split(":"), b = p.to.split(":");
      var s = new Date(d); s.setHours(+a[0], +a[1], 0, 0); var e = new Date(d); e.setHours(+b[0], +b[1], 0, 0); if(e <= s) e.setDate(e.getDate()+1); if(e.getTime() > now) out.push({t:s.getTime(), end:e.getTime(), id:p.id, name:p.name, ic:p.ic}); } }
    else P.forEach(function(x){ var d = new Date(x.t);
      if(p.type==="jumaat" ? (x.k==="zohor" && d.getDay()===5) : (p.prayers||[]).indexOf(x.k)>=0){ var s = x.t - (p.before||0)*60000, e = x.t + (p.after||20)*60000; if(e > now && s < now + 3*864e5) out.push({t:s, end:e, id:p.id, name:p.name+(p.type==="prayer" ? " · "+H.L2x(x.n, x.ne) : ""), ic:p.ic}); } }); });
  return out.sort(function(a, b){ return a.t - b.t; });
}
function activePlan(){ var now = Date.now(); return plans().filter(function(x){ return x.t <= now && x.end > now; })[0] || null; }

// ---------------- page ----------------
function view(el){
  st(); clearInterval(tick); var now = Date.now(), p = phase(now), s = st().sess;
  if(s.on && !p){ stop(true); }
  var h = '<div class="card focard">';
  if(s.on && p){ var total = p.work ? (s.pomo ? st().set.pomo.work*60000 : (s.until ? s.until - s.start : 0)) : 0, left = p.end ? p.end - now : now - s.start;
    h += ring(total, left, p.work)+'<div class="fobtns"><button class="btn alt" id="foLock">🔒 '+L("Kunci skrin fokus","Focus screen lock")+'</button><button class="btn" id="foStop">⏹ '+L("Tamat","End")+'</button></div>';
  } else {
    var ap = activePlan();
    h += '<div class="fobig">🎯</div><b>'+L("Mula fokus","Start focus")+'</b>'+(ap ? '<div class="fonow">'+esc(ap.ic+" "+ap.name)+' · '+L("sekarang hingga ","now until ")+clock(ap.end)+'</div>' : '')+
      '<div class="rseg" id="foDur">'+[["25","25 min"],["45","45 min"],["60",L("1 j","1 h")],["90",L("1½ j","1½ h")],["prayer",L("Hingga solat","Until prayer")],["0",L("Tanpa had","No limit")]].map(function(d, i){ return '<button class="chip'+(i===0 ? ' on' : '')+'" data-dur="'+d[0]+'">'+d[1]+'</button>'; }).join("")+'</div>'+
      '<label class="pdchk"><input type="checkbox" id="foPomo"> 🍅 Pomodoro '+st().set.pomo.work+'/'+st().set.pomo.brk+' min</label><label class="pdchk"><input type="checkbox" id="foDnd"'+(st().set.dnd ? ' checked' : '')+'> 🔕 '+L("Jangan Ganggu semasa fokus","Do Not Disturb during focus")+'</label><label class="pdchk"><input type="checkbox" id="foLk"> 🔒 '+L("Kunci skrin fokus (sapu 5 kali untuk buka)","Focus screen lock (swipe 5 times to unlock)")+'</label>'+
      '<button class="btn gold full" id="foGo">▶ '+L("Mula","Start")+(ap ? ': '+esc(ap.name) : '')+'</button>';
  }
  h += '</div>'+gardenCard()+todayCard()+plansCard()+nudgeCard()+'<div class="mut tiny" style="padding:4px 4px 14px">'+L("Fokus membantu anda memilih: ia tidak menyekat aplikasi lain. Untuk sekatan aplikasi, guna Kesejahteraan Digital telefon (mod fokus, pemasa aplikasi).","Focus helps you choose: it does not stop other apps. To block apps, use the phone's Digital Wellbeing (focus mode, app timers).")+'</div>';
  el.innerHTML = h; bind(el);
  if(s.on && p) tick = setInterval(function(){ if(!document.body.contains(el)){ clearInterval(tick); return; } var q = phase(Date.now()); if(!q || q.work!==p.work){ view(el); return; } var r = el.querySelector(".foring"); if(r) r.outerHTML = ring(p.work ? (s.pomo ? st().set.pomo.work*60000 : (s.until ? s.until - s.start : 0)) : 0, q.end ? q.end - Date.now() : Date.now() - s.start, q.work); }, 1000);
}
function ring(total, left, work){
  var R = 70, C = 2*Math.PI*R, f = total > 0 ? Math.max(0, Math.min(1, left/total)) : 1, sec = Math.max(0, Math.round(left/1000)), s = st().sess;
  var t = (sec >= 3600 ? Math.floor(sec/3600)+":" + ("0"+Math.floor(sec/60%60)).slice(-2) : Math.floor(sec/60)) + ":" + ("0"+sec%60).slice(-2);
  var gf = total > 0 ? 1 - f : Math.min(1, (Date.now() - (s.start||Date.now()))/(25*60000));
  return '<div class="foring">'+(work ? treeSvg(gf, treeKind(s), false) : '')+'<svg viewBox="0 0 170 170" width="190" height="190"><circle cx="85" cy="85" r="'+R+'" fill="none" stroke="var(--line)" stroke-width="10"/><circle cx="85" cy="85" r="'+R+'" fill="none" stroke="'+(work ? 'var(--gold)' : '#3fb27f')+'" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-f)).toFixed(1)+'" transform="rotate(-90 85 85)"/></svg>'+
    '<div class="forin"><b>'+t+'</b><small>'+(work ? (s.name ? esc(s.ic+" "+s.name) : L("Fokus","Focus")) : "☕ "+L("Rehat","Break"))+(s.pomo ? ' · '+L("pusingan ","round ")+(phase(Date.now())||{}).round : '')+'</small></div></div>';
}
function gardenCard(){ var T = st().trees || []; if(!T.length) return '';
  var alive = T.filter(function(t){ return !t.dead; }), wk = 0, d7 = H.ymd(new Date(Date.now() - 6*864e5)); alive.forEach(function(t){ if(t.d >= d7) wk++; });
  var by = {}; TREES.forEach(function(k){ by[k[0]] = k; });
  return '<div class="card foGarden"><h3>🌳 '+L("Taman fokus saya","My focus garden")+'</h3><div class="mut small">'+alive.length+' '+L("pokok","trees")+' · '+wk+' '+L("minggu ini","this week")+(T.length > alive.length ? ' · 🥀 '+(T.length - alive.length) : '')+'</div>'+
    '<div class="foPlot">'+T.slice(-60).map(function(t){ var k = by[t.k] || TREES[0]; return '<span class="noico'+(t.dead ? ' dead' : '')+'" title="'+esc(t.d+" · "+t.m+" min")+'">'+(t.dead ? "🥀" : k[1])+'</span>'; }).join("")+'</div></div>'; }
function todayCard(){
  var d = H.ymd(new Date()), mins = st().log[d]||0, week = 0; for(var i=0;i<7;i++){ var x = new Date(); x.setDate(x.getDate()-i); week += st().log[H.ymd(x)]||0; }
  return '<div class="card"><div class="set"><span>🎯 '+L("Fokus hari ini","Focus today")+'</span><b>'+hm(mins*60000)+'</b></div><div class="set"><span>📅 '+L("7 hari","7 days")+'</span><b>'+hm(week*60000)+'</b></div><button class="chip" data-go="statistik" style="margin-top:6px">📊 '+L("Masa skrin telefon › Statistik","Phone screen time › Stats")+'</button></div>';
}
function plansCard(){
  var P = st().plans;
  return '<div class="card"><div class="row"><h3 style="margin:0">📅 '+L("Pelan fokus","Focus plans")+'</h3><button class="chip" id="foAdd">＋</button></div><div class="mut tiny" style="margin:4px 0 6px">'+L("Peringatan untuk mula fokus pada waktu yang anda pilih.","Reminders to start focusing at times you choose.")+'</div>'+
    (P.length ? P.map(function(p, i){ return '<div class="fosc'+(p.on===false ? ' off' : '')+'" data-pl="'+i+'"><span class="foic">'+esc(p.ic)+'</span><span class="fot"><b>'+esc(p.name)+'</b><small>'+esc(desc(p))+'</small></span><input type="checkbox" data-pon="'+i+'"'+(p.on!==false ? ' checked' : '')+'></div>'; }).join("") : '')+
    '<div class="fotpl">'+TEMPLATES.map(function(t){ return '<button class="chip" data-tpl="'+t[0]+'">'+t[1]+' '+L(t[2], t[3])+'</button>'; }).join("")+'</div></div>';
}
function desc(p){ var d = p.days && p.days.length && p.days.length < 7 ? p.days.map(function(x){ return DAYS()[x]; }).join(" ")+" · " : "";
  return d + (p.type==="time" ? p.from+"–"+p.to : p.type==="jumaat" ? L("Jumaat ","Friday ")+"−"+(p.before||0)+" / +"+(p.after||0)+" min" : (p.prayers||[]).map(function(k){ var x = PRAYERS.filter(function(y){ return y[0]===k; })[0]; return x ? L(x[1], x[2]) : k; }).join(", ")+" +"+(p.after||20)+" min"); }
function nudgeCard(){
  var n = st().set.nudge;
  return '<div class="card"><label class="set"><span>⏳ '+L("Peringatan masa (Time Nudge)","Time Nudge")+'</span><input type="checkbox" id="foNu"'+(n.on ? ' checked' : '')+'></label><div class="mut tiny">'+L("Notifikasi lembut apabila penggunaan hari ini bagi aplikasi pilihan melebihi had anda. Tiada sekatan.","A gentle notification when today's use of the apps you choose passes your limit. Nothing is blocked.")+'</div>'+
    (n.on ? '<div class="rseg" style="margin-top:6px">'+[15,30,45,60,90].map(function(m){ return '<button class="chip'+(n.mins===m ? ' on' : '')+'" data-num="'+m+'">'+m+' min</button>'; }).join("")+'</div><button class="chip" id="foNuApps" style="margin-top:6px">📱 '+L("Aplikasi","Apps")+' ('+n.apps.length+')</button>'+(window.Native && N().hasPerm && !H.usageOk() ? '<div class="mut tiny" style="margin-top:6px">⚠ '+L("Perlukan akses penggunaan (Statistik › Masa skrin).","Needs usage access (Stats › Screen time).")+'</div>' : '') : '')+'</div>';
}
function bind(el){
  el.querySelectorAll("[data-dur]").forEach(function(b){ b.onclick = function(){ el.querySelectorAll("[data-dur]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  var go = el.querySelector("#foGo"); if(go) go.onclick = function(){ var d = el.querySelector("[data-dur].on").getAttribute("data-dur"), mins = +d, ap = activePlan();
    if(d==="prayer"){ var nx = pt().filter(function(x){ return x.t > Date.now(); })[0]; mins = nx ? Math.max(1, Math.round((nx.t - Date.now())/60000)) : 60; }
    if(ap && !mins) mins = Math.max(1, Math.round((ap.end - Date.now())/60000));
    st().set.dnd = el.querySelector("#foDnd").checked; start(mins, {pomo:el.querySelector("#foPomo").checked, lock:el.querySelector("#foLk").checked, name:ap ? ap.name : "", ic:ap ? ap.ic : "🎯"}); view(el); };
  var stp = el.querySelector("#foStop"); if(stp) stp.onclick = function(){ if(confirm(L("Tamatkan sesi fokus?","End the focus session?"))){ stop(true); view(el); } };
  var lk = el.querySelector("#foLock"); if(lk) lk.onclick = lockScreen;
  el.querySelectorAll("[data-go]").forEach(function(b){ b.onclick = function(){ H.setCal(b.getAttribute("data-go")); }; });
  var add = el.querySelector("#foAdd"); if(add) add.onclick = function(){ editPlan(-1, null); };
  el.querySelectorAll("[data-tpl]").forEach(function(b){ b.onclick = function(){ editPlan(-1, TEMPLATES.filter(function(t){ return t[0]===b.getAttribute("data-tpl"); })[0]); }; });
  el.querySelectorAll("[data-pl]").forEach(function(r){ r.onclick = function(e){ if(e.target.matches("input")) return; editPlan(+r.getAttribute("data-pl")); }; });
  el.querySelectorAll("[data-pon]").forEach(function(c){ c.onchange = function(){ st().plans[+c.getAttribute("data-pon")].on = c.checked; save(); }; });
  var nu = el.querySelector("#foNu"); if(nu) nu.onchange = function(){ st().set.nudge.on = nu.checked; save(); view(el); };
  el.querySelectorAll("[data-num]").forEach(function(b){ b.onclick = function(){ st().set.nudge.mins = +b.getAttribute("data-num"); save(); view(el); }; });
  var na = el.querySelector("#foNuApps"); if(na) na.onclick = function(){ pickApps(st().set.nudge.apps, function(l){ st().set.nudge.apps = l; save(); view(el); }); };
}
function editPlan(i, tpl){
  var p = i>=0 ? JSON.parse(JSON.stringify(st().plans[i])) : {id:"p"+Date.now().toString(36), on:true, name:tpl ? L(tpl[2], tpl[3]) : L("Pelan baharu","New plan"), ic:tpl ? tpl[1] : "🎯", type:"time", days:[1,2,3,4,5], from:"09:00", to:"12:00", prayers:["zohor"], before:0, after:20};
  if(tpl) for(var k in tpl[4]) p[k] = JSON.parse(JSON.stringify(tpl[4][k]));
  var ov = H.showSheet(esc(p.ic)+" "+L("Pelan fokus","Focus plan"),
    '<div class="radd"><input id="fpIc" class="rin" style="max-width:56px;text-align:center" value="'+esc(p.ic)+'"><input id="fpNm" class="rin" value="'+esc(p.name)+'"></div>'+
    '<div class="rseg" style="margin:8px 0">'+[["time","🕘 "+L("Masa","Time")],["prayer","🕌 "+L("Waktu solat","Prayer time")],["jumaat","🕋 Jumaat"]].map(function(t){ return '<button class="chip'+(p.type===t[0] ? ' on' : '')+'" data-ty="'+t[0]+'">'+t[1]+'</button>'; }).join("")+'</div><div id="fpB"></div>'+
    '<div class="btns" style="margin-top:10px"><button class="btn gold" id="fpS">'+L("Simpan","Save")+'</button>'+(i>=0 ? '<button class="btn alt" id="fpD">🗑</button>' : '')+'</div>');
  var body = function(){ var b = ov.querySelector("#fpB");
    if(p.type==="time") b.innerHTML = '<div class="rseg">'+DAYS().map(function(d, k){ return '<button class="chip'+((p.days||[]).indexOf(k)>=0 ? ' on' : '')+'" data-dy="'+k+'">'+d+'</button>'; }).join("")+'</div><div class="radd" style="margin-top:8px"><input type="time" id="fpF" class="rin" value="'+esc(p.from)+'"><input type="time" id="fpT" class="rin" value="'+esc(p.to)+'"></div><div class="mut tiny">'+L("Tiada hari dipilih = setiap hari. Boleh melepasi tengah malam.","No day chosen = every day. Can cross midnight.")+'</div>';
    else if(p.type==="prayer") b.innerHTML = '<div class="rseg">'+PRAYERS.map(function(x){ return '<button class="chip'+((p.prayers||[]).indexOf(x[0])>=0 ? ' on' : '')+'" data-pr="'+x[0]+'">'+L(x[1], x[2])+'</button>'; }).join("")+'</div><label class="hfld">'+L("Minit selepas azan","Minutes after azan")+'<input type="number" id="fpA" class="rin" value="'+(p.after||20)+'"></label>';
    else b.innerHTML = '<label class="hfld">'+L("Minit sebelum Zohor (khutbah)","Minutes before Zohor (khutbah)")+'<input type="number" id="fpBe" class="rin" value="'+(p.before||30)+'"></label><label class="hfld">'+L("Minit selepas","Minutes after")+'<input type="number" id="fpA" class="rin" value="'+(p.after||60)+'"></label>';
    b.querySelectorAll("[data-dy]").forEach(function(x){ x.onclick = function(){ var k = +x.getAttribute("data-dy"); p.days = (p.days||[]).filter(function(y){ return y!==k; }); if(!x.classList.contains("on")) p.days.push(k); x.classList.toggle("on"); }; });
    b.querySelectorAll("[data-pr]").forEach(function(x){ x.onclick = function(){ var k = x.getAttribute("data-pr"); p.prayers = (p.prayers||[]).filter(function(y){ return y!==k; }); if(!x.classList.contains("on")) p.prayers.push(k); x.classList.toggle("on"); }; }); };
  ov.querySelectorAll("[data-ty]").forEach(function(x){ x.onclick = function(){ p.type = x.getAttribute("data-ty"); ov.querySelectorAll("[data-ty]").forEach(function(y){ y.classList.toggle("on", y===x); }); body(); }; }); body();
  ov.querySelector("#fpS").onclick = function(){ p.ic = ov.querySelector("#fpIc").value || "🎯"; p.name = ov.querySelector("#fpNm").value.trim() || p.name;
    var f = ov.querySelector("#fpF"), t = ov.querySelector("#fpT"), a = ov.querySelector("#fpA"), be = ov.querySelector("#fpBe"); if(f) p.from = f.value || p.from; if(t) p.to = t.value || p.to; if(a) p.after = +a.value || 0; if(be) p.before = +be.value || 0;
    if(i>=0) st().plans[i] = p; else st().plans.push(p); save(); H.closeOverlay(); refresh(); };
  var del = ov.querySelector("#fpD"); if(del) del.onclick = function(){ st().plans.splice(i, 1); save(); H.closeOverlay(); refresh(); };
}
function pickApps(sel, cb){
  var list = []; try{ list = JSON.parse(N().focusApps ? N().focusApps() : "[]"); }catch(e){} var chosen = sel.slice();
  var ov = H.showSheet("📱 "+L("Pilih aplikasi","Choose apps"), '<input id="fpQ" class="rin" placeholder="🔎" style="margin-bottom:8px"><div id="fpL" style="max-height:52vh;overflow:auto"></div><button class="btn gold full" id="fpOk" style="margin-top:8px">'+L("Simpan","Save")+'</button>');
  var fill = function(){ var q = ov.querySelector("#fpQ").value.toLowerCase(); ov.querySelector("#fpL").innerHTML = (list.length ? list : [["", L("Dalam aplikasi telefon sahaja","In the phone app only"), -1]]).filter(function(a){ return !q || a[1].toLowerCase().indexOf(q)>=0; }).map(function(a){ return a[0] ? '<label class="pdchk"><input type="checkbox" data-ap="'+esc(a[0])+'"'+(chosen.indexOf(a[0])>=0 ? ' checked' : '')+'> '+esc(a[1])+'</label>' : '<div class="mut small">'+esc(a[1])+'</div>'; }).join("");
    ov.querySelectorAll("[data-ap]").forEach(function(c){ c.onchange = function(){ var k = c.getAttribute("data-ap"); chosen = chosen.filter(function(x){ return x!==k; }); if(c.checked) chosen.push(k); }; }); };
  ov.querySelector("#fpQ").oninput = fill; fill(); ov.querySelector("#fpOk").onclick = function(){ H.closeOverlay(); cb(chosen); };
}

// ---------------- focus screen lock ----------------
/** pins My Ihsan on screen (Android screen pinning, which the person confirms) with the countdown and a zikir counter; the 🔒 handle
 *  unlocks after 5 sideways swipes. Calls and the phone's own unpin still work. */
function lockScreen(){
  var ov = document.createElement("div"); ov.className = "folock"; ov.id = "foLockOv"; var z = 0, Z = ["سُبْحَانَ اللّٰه","اَلْحَمْدُ لِلّٰه","اَللّٰهُ أَكْبَر"];
  var draw = function(){ var p = phase(Date.now()), s = st().sess; if(!s.on || !p){ unlock(); return; } var left = p.end ? p.end - Date.now() : Date.now() - s.start, sec = Math.max(0, Math.round(left/1000));
    ov.querySelector(".folt").textContent = (sec >= 3600 ? Math.floor(sec/3600)+":"+("0"+Math.floor(sec/60%60)).slice(-2) : Math.floor(sec/60))+":"+("0"+sec%60).slice(-2); ov.querySelector(".fols").textContent = p.work ? (s.name || L("Masa untuk fokus","Time to focus")) : "☕ "+L("Rehat","Break"); };
  ov.innerHTML = '<div class="folh">'+H.swUnHtml("foUn", "")+'</div><div class="folc"><div class="fols"></div><div class="folt"></div><button class="folz" id="foZ">📿 '+Z[0]+'<br><small>0 / 33</small></button><button class="chip" id="foQ">📖 Al-Quran</button><div class="mut tiny" style="margin-top:14px">'+L("Sapu 🔒 di atas ke kiri dan kanan 5 kali untuk buka.","Swipe the 🔒 at the top left and right 5 times to unlock.")+'</div></div>';
  document.body.appendChild(ov); draw(); var t = setInterval(function(){ if(!document.body.contains(ov)){ clearInterval(t); return; } draw(); }, 1000);
  ov.querySelector("#foZ").onclick = function(){ z++; this.innerHTML = "📿 "+Z[Math.min(2, Math.floor(z/33))]+"<br><small>"+(z >= 99 ? "99 ✓" : (z % 33)+" / 33")+"</small>"; if(N().vibrate) N().vibrate(z % 33===0 ? 120 : 15); };
  // Al-Quran: the lock shrinks to a small timer pill (My Ihsan stays pinned); tap the pill to come back
  ov.querySelector("#foQ").onclick = function(e){ e.stopPropagation(); ov.classList.add("min"); if(H.openQuran) H.openQuran(); };
  ov.addEventListener("click", function(){ if(ov.classList.contains("min")) ov.classList.remove("min"); });
  H.swUnBind(ov.querySelector("#foUn"), unlock); if(H.appPin) H.appPin(true);
  function unlock(){ clearInterval(t); if(H.appPin && !H.S.appLock && !H.S.kidLock) H.appPin(false); if(ov.parentNode) ov.remove(); refresh(); }
}
function refresh(){ var h = document.getElementById("foHost"); if(h) view(h); }
window.FocusView = {
  view:function(el, h){ H = h; F = null; var host = document.createElement("div"); host.id = "foHost"; el.innerHTML = ""; el.appendChild(host); view(host); },
  widget:function(h){ H = h; F = null; var s = st().sess, p = phase(Date.now()), d = H.ymd(new Date()); return {on:!!(s.on && p), work:p ? p.work : false, end:p ? p.end : 0, today:st().log[d]||0, name:s.name||""}; },
  _t:{phase:phase, plans:plans, st:st, start:start, stop:stop, reset:function(){ F = null; }}
};
})();
