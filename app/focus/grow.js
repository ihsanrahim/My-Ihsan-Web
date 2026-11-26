/* My Ihsan 0.6.41 (owner): Masa › Fokus becomes a self-development hub ("a calm coach in your pocket"), from the owner's
   145-feature list, matched to the app and without repeating what My Ihsan already has (those are links, see ELSEWHERE).
   Five pages in the bottom dock, swipe sideways: Hari ini (Today, with the focus timer of focus/focus.js inside it) · Matlamat (Goals) ·
   Tabiat (Habits) · Bina diri (Grow tools, focus/grow_tools.js) · Saya (Me).
   - Today: greeting + a ring for the day, morning intention, top 3, habits due (with 2-minute versions on hard days), the next thing,
     one nudge, evening review (gratitude and "improve" go into the Muhasabah journal), tomorrow's top 3, weekly review.
   - Goals: SMART goal builder, milestones, countdown, number / percent / yes-no / by-habits progress, 90-day focus, stalled-goal
     rescue, share with a partner (text).
   - Habits: daily / X a week / chosen days, tick, count, minutes or quit, streaks with a monthly repair, habit stacking cue, tiny
     version, why and reward, reminders, templates by life area, routines (step by step with timers), vacation mode, heatmap, insights.
   - Me: level and XP (worked out from what was done, so unticking takes it back), badges, life wheel (radar + history), weekly
     scorecard, rewards store, life areas on/off, reminders, where things live elsewhere in My Ihsan.
   Everything stays on this phone (localStorage ihsan_grow; speech recordings in IndexedDB). Reminders: ihsan_grow_ex, read by
   app.js buildExtras like ihsan_focus_ex. GrowView.view(el, H) H = focusH() + loadJs, openSide. */
(function(){ "use strict";
var H = null, G = null, KEY = "ihsan_grow", PG = null, BODY = null, EL = null, BAD = false, FMORE = false;
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function N(){ return H.N || {}; }
function pad(n){ return ("0" + n).slice(-2); }
function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function dOf(k){ var p = String(k).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function today(){ return ymd(new Date()); }
function dAdd(k, n){ var d = dOf(k); d.setDate(d.getDate() + n); return ymd(d); }
function diffD(a, b){ return Math.round((dOf(b) - dOf(a)) / 864e5); }
function monOf(k){ var d = dOf(k); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return ymd(d); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function loc(){ return H.S && H.S.lang === "en" ? "en-GB" : "ms-MY"; }
function dLabel(k, o){ return dOf(k).toLocaleDateString(loc(), o || {day:"numeric", month:"short"}); }
function clamp(x, a, b){ return Math.max(a, Math.min(b, x)); }

// ---------------- life areas (the life wheel's 8 areas; each has its own colour) ----------------
var AREAS = [["health","💪","Kesihatan","Health","#3fb27f"],["mind","🧠","Minda","Mind","#8e7cf0"],["skills","📚","Kemahiran","Skills","#4a9be8"],["money","💰","Kewangan","Money","#c9a646"],
  ["home","🏠","Rumah","Home","#e39a4f"],["family","💞","Pasangan & keluarga","Marriage & family","#e0708a"],["friends","🤝","Kawan","Friends","#4fc3c9"],["purpose","🌙","Iman & tujuan","Faith & purpose","#1f9d63"]];
function area(k){ return AREAS.filter(function(a){ return a[0] === k; })[0] || AREAS[1]; }
function aCol(k){ return area(k)[4]; }

// ---------------- data ----------------
function db(){ if(G) return G; G = H.load(KEY, null) || {};
  G.set = G.set || {}; G.set.areas = G.set.areas || {}; G.set.rem = G.set.rem || {am:"", pm:""}; G.set.off = G.set.off || {};
  ["day","rev","fz"].forEach(function(k){ G[k] = G[k] || {}; }); ["goals","habits","routines","wheel","rewards","spent","ch"].forEach(function(k){ G[k] = G[k] || []; });
  return G; }
function save(){ H.save(KEY, db()); try{ sched(); }catch(e){} }
function day(k){ var D = db().day; D[k] = D[k] || {}; return D[k]; }
function areaOn(k){ var a = db().set.areas; return !Object.keys(a).length || a[k] !== false; }

// ---------------- habits ----------------
/* habit {id, ic, name, area, k:"tick"|"count"|"min"|"quit", n (target a day), u (unit), fq:{t:"d"} | {t:"w", n} | {t:"s", days:[0..6]},
   cue ("after I …"), tiny, why, rew, rem ("HH:MM"), log:{date:n}, since (quit start), cost (quit: money a day), urges:[{d, t}], arch } */
var HT = [
  ["health","🪥","Gosok gigi pagi & malam","Brush teeth morning and night",{k:"count", n:2, tiny:["Gosok gigi sekali","Brush once"]}],
  ["health","🦷","Flos gigi","Floss",{tiny:["Flos 2 batang gigi","Floss 2 teeth"]}],
  ["health","🧴","Rutin kulit malam","Night skincare",{tiny:["Cuci muka sahaja","Just wash your face"]}],
  ["health","🚿","Mandi & berwangi pagi","Morning shower",{}],
  ["health","🚶","Jalan kaki 20 minit","Walk 20 minutes",{k:"min", n:20, tiny:["Jalan 2 minit","Walk 2 minutes"]}],
  ["health","🛏","Tidur sebelum 11 malam","Lights out by 11 pm",{tiny:["Letak telefon jauh dari katil","Put the phone away from the bed"]}],
  ["health","🥤","Berhenti minuman manis","Quit sugary drinks",{k:"quit", cost:4}],
  ["health","🚭","Berhenti merokok","Quit smoking",{k:"quit", cost:17}],
  ["mind","📖","Baca 10 muka surat","Read 10 pages",{k:"count", n:10, u:["ms","pages"], tiny:["Baca 1 muka surat","Read 1 page"]}],
  ["mind","🌬","Bernafas tenang 5 minit","Calm breathing 5 minutes",{k:"min", n:5, tiny:["3 nafas dalam","3 deep breaths"]}],
  ["mind","📵","Tiada skrol selepas Isyak","No scrolling after Isha",{k:"quit", cost:0}],
  ["skills","🎯","Latih kemahiran 30 minit","Practise a skill 30 minutes",{k:"min", n:30, tiny:["Latih 2 minit","Practise 2 minutes"]}],
  ["skills","📇","Ulang kad imbas","Review flashcards",{tiny:["5 kad sahaja","Just 5 cards"]}],
  ["skills","🎤","Latihan bercakap 60 saat","60-second speaking drill",{}],
  ["money","🧾","Catat belanja hari ini","Log today's spending",{}],
  ["money","🚫","Hari tanpa belanja","No-spend day",{fq:{t:"w", n:2}}],
  ["money","🪙","Simpan RM5","Save RM5",{k:"count", n:5, u:["RM","RM"]}],
  ["home","🛏","Kemas katil","Make the bed",{}],
  ["home","🧹","Kemas 15 minit","15-minute tidy",{k:"min", n:15, tiny:["Kemas satu permukaan","Clear one surface"]}],
  ["home","🍽","Sinki kosong sebelum tidur","Empty sink before bed",{}],
  ["home","🧺","Hari dobi","Laundry day",{fq:{t:"s", days:[3,6]}}],
  ["family","💬","Soalan hubungan harian","Daily connection question",{}],
  ["family","📞","Telefon ibu bapa","Call my parents",{fq:{t:"w", n:2}}],
  ["family","🧸","Main dengan anak 20 minit","Play with the kids 20 minutes",{k:"min", n:20}],
  ["family","🌹","Satu kebaikan kecil untuk pasangan","One small kindness for my spouse",{}],
  ["friends","👋","Mesej seorang kawan","Message a friend",{fq:{t:"w", n:3}}],
  ["friends","🤝","Sapa jiran","Greet a neighbour",{fq:{t:"w", n:2}}]];
function hDue(h, k){ var f = h.fq || {t:"d"}; if(h.arch) return false; if(pausedOn(k)) return false;
  if(f.t === "s") return (f.days || []).indexOf(dOf(k).getDay()) >= 0;
  if(f.t === "w"){ var m = monOf(k), c = 0; for(var i = 0; i < 7; i++){ var x = dAdd(m, i); if(x !== k && hDone(h, x)) c++; } return c < (f.n || 3) || hDone(h, k); }
  return true; }
function hVal(h, k){ return (h.log || {})[k] || 0; }
function hDone(h, k){ if(h.k === "quit") return h.since ? k >= h.since && !((h.slip || {})[k]) : false; return hVal(h, k) >= (h.n || 1) || !!(db().fz[h.id + "|" + k]); }
function pausedOn(k){ var v = db().set.vac; return !!(v && v.from <= k && k <= v.to); }
function streak(h){ var k = today(), n = 0, i = 0;
  if(h.k === "quit") return h.since ? Math.max(0, diffD(lastSlip(h) || h.since, k)) : 0;
  if((h.fq || {}).t === "w"){ var m = monOf(k); if(!wkOk(h, m)) m = dAdd(m, -7); while(wkOk(h, m) && i++ < 200){ n++; m = dAdd(m, -7); } return n; }
  if(!hDone(h, k)) k = dAdd(k, -1);
  while(i++ < 800){ if(pausedOn(k) || !hDue(h, k)){ k = dAdd(k, -1); if(h.made && k < h.made) break; continue; } if(!hDone(h, k)) break; n++; k = dAdd(k, -1); }
  return n; }
function wkOk(h, m){ var c = 0; for(var i = 0; i < 7; i++) if(hDone(h, dAdd(m, i))) c++; return c >= ((h.fq || {}).n || 3); }
function lastSlip(h){ var s = Object.keys(h.slip || {}).sort(); return s.length ? s[s.length - 1] : null; }
function fzLeft(){ var m = today().slice(0, 7), used = Object.keys(db().fz).filter(function(x){ return x.split("|")[1].slice(0, 7) === m; }).length; return Math.max(0, 2 - used); }
function canRepair(h){ var y = dAdd(today(), -1); return h.k !== "quit" && (h.fq || {}).t !== "w" && hDue(h, y) && !hDone(h, y) && fzLeft() > 0 && (!h.made || h.made <= y) && hDone(h, dAdd(y, -1)); }
function rate(h, days){ var due = 0, ok = 0; for(var i = 0; i < days; i++){ var k = dAdd(today(), -i); if(h.made && k < h.made) break; if(!hDue(h, k) && !hDone(h, k)) continue; due++; if(hDone(h, k)) ok++; } return due ? ok / due : 0; }
function hTap(h, k, dlt){ h.log = h.log || {}; var v = hVal(h, k), n = h.n || 1;
  if(h.k === "tick") v = v ? 0 : 1; else if(dlt) v = Math.max(0, v + dlt); else v = v >= n ? 0 : (h.k === "min" ? n : v + 1);
  if(v) h.log[k] = v; else delete h.log[k];
  if(v >= n && dlt !== -1){ try{ if(N().vibrate) N().vibrate(18); }catch(e){} }
  save(); }
function hSub(h){ var f = h.fq || {t:"d"}, s = f.t === "w" ? (f.n || 3) + L("× seminggu", "× a week") : f.t === "s" ? (f.days || []).map(function(d){ return DAYS()[d]; }).join(" ") : L("Setiap hari", "Every day");
  return s + (h.rem ? " · ⏰ " + h.rem : ""); }
function DAYS(){ return L("Ahd,Isn,Sel,Rab,Kha,Jum,Sab", "Sun,Mon,Tue,Wed,Thu,Fri,Sat").split(","); }
function unitOf(h){ return h.u ? L(h.u[0], h.u[1]) : h.k === "min" ? "min" : ""; }

// ---------------- goals ----------------
/* goal {id, ic, name, area, why, m:"num"|"pct"|"yes"|"hab", s, t, u, cur, due, made, ms:[{id, t, due, done}], hab:[habit ids], q (90-day focus), st:"on"|"pause"|"done", last, log:[{d, v}] } */
function gProg(g){ if(g.st === "done") return 1;
  if(g.m === "hab"){ var c = 0; (g.hab || []).forEach(function(id){ var h = hById(id); if(h) Object.keys(h.log || {}).forEach(function(k){ if(k >= g.made && hDone(h, k)) c++; }); }); g._hc = c; return clamp(c / Math.max(1, g.t || 30), 0, 1); }
  if(g.m === "pct") return clamp((g.cur || 0) / 100, 0, 1);
  if(g.m === "yes"){ var M = g.ms || []; return M.length ? M.filter(function(x){ return x.done; }).length / (M.length + 1) : 0; }
  var a = +g.s || 0, b = +g.t || 0; return b === a ? 0 : clamp(((+g.cur || 0) - a) / (b - a), 0, 1); }
function gLeft(g){ return g.due ? diffD(today(), g.due) : null; }
function gStalled(g){ return g.st === "on" && g.m !== "hab" && diffD(g.last || g.made || today(), today()) >= 7; }
function hById(id){ return db().habits.filter(function(h){ return h.id === id; })[0]; }
function gNow(g){ return g.m === "hab" ? (g._hc != null ? g._hc : (gProg(g), g._hc)) + " / " + (g.t || 30) : g.m === "pct" ? (g.cur || 0) + "%" : g.m === "yes" ? ((g.ms || []).filter(function(x){ return x.done; }).length + " / " + (g.ms || []).length + " " + L("langkah", "steps")) : (g.cur != null ? g.cur : g.s || 0) + " / " + g.t + (g.u ? " " + g.u : ""); }

// ---------------- XP, levels, badges (worked out from the data each time) ----------------
function xpAll(){ var D = db(), x = 0, n = {hab:0, top:0, ms:0, gd:0, rev:0, chk:0, sp:0, cards:0, fo:0, room:0, ch:0};
  D.habits.forEach(function(h){ Object.keys(h.log || {}).forEach(function(k){ if(hDone(h, k)) n.hab++; }); if(h.k === "quit" && h.since) n.hab += Math.max(0, diffD(lastSlip(h) || h.since, today())); });
  try{ var PL = H.load("ihsan_planner", null); if(PL && PL.d) Object.keys(PL.d).forEach(function(k2){ (PL.d[k2] || []).forEach(function(x){ if(x && x.done) n.top++; }); }); }catch(e){}   // 0.7.77: Top 3 is gone; ticked planner tasks count instead
  Object.keys(D.day).forEach(function(k){ var d = D.day[k]; (d.top || []).forEach(function(t){ if(t && t.d) n.top++; }); if(d.int) n.chk++; if(d.ev) n.chk++; });
  D.goals.forEach(function(g){ (g.ms || []).forEach(function(m){ if(m.done) n.ms++; }); if(g.st === "done") n.gd++; });
  n.rev = Object.keys(D.rev).length; n.sp = (D.sp || []).length + (D.rec || 0); n.cards = D.cardsDone || 0; n.room = D.cleaned || 0;
  n.ch = D.ch.filter(function(c){ return c.won; }).length;
  var fl = (H.load("ihsan_focus", {}) || {}).log || {}; Object.keys(fl).forEach(function(k){ n.fo += fl[k] || 0; });
  x = n.hab * 10 + n.top * 15 + n.ms * 50 + n.gd * 200 + n.rev * 40 + n.chk * 10 + n.sp * 20 + n.cards * 2 + Math.floor(n.fo / 5) + n.room * 5 + n.ch * 150;
  return {xp:x, n:n}; }
function level(xp){ var l = Math.floor(Math.sqrt(xp / 120)) + 1, a = (l - 1) * (l - 1) * 120, b = l * l * 120; return {l:l, f:(xp - a) / (b - a), next:b - xp}; }
function pointsLeft(){ var s = 0; db().spent.forEach(function(r){ s += r.c || 0; }); return xpAll().xp - s; }
var BADGES = [["first","🌱","Langkah pertama","First step",function(n, b){ return n.hab >= 1; }],["s7","🔥","7 hari berturut","7-day streak",function(n, b){ return b.best >= 7; }],
  ["s30","🏅","30 hari berturut","30-day streak",function(n, b){ return b.best >= 30; }],["s100","💎","100 hari","100 days",function(n, b){ return b.best >= 100; }],
  ["goal","🎯","Matlamat tercapai","Goal reached",function(n){ return n.gd >= 1; }],["goals5","🏆","5 matlamat","5 goals",function(n){ return n.gd >= 5; }],
  ["rev4","🧭","4 semakan mingguan","4 weekly reviews",function(n){ return n.rev >= 4; }],["fo10","⏱","10 jam fokus","10 focus hours",function(n){ return n.fo >= 600; }],
  ["sp5","🎤","5 latihan bercakap","5 speaking practices",function(n){ return n.sp >= 5; }],["c100","📇","100 kad","100 cards",function(n){ return n.cards >= 100; }],
  ["top50","✅","50 tugasan selesai","50 tasks done",function(n){ return n.top >= 50; }],["ch","⭐","Cabaran selesai","Challenge done",function(n){ return n.ch >= 1; }],
  ["home","🧽","20 tugasan rumah","20 home tasks",function(n){ return n.room >= 20; }],["chk30","🌅","30 daftar masuk","30 check-ins",function(n){ return n.chk >= 30; }]];
function badges(){ var a = xpAll(), best = 0; db().habits.forEach(function(h){ best = Math.max(best, streak(h), h.best || 0); }); return BADGES.map(function(b){ return {b:b, on:!!b[4](a.n, {best:best})}; }); }

// ---------------- reminders (read by app.js buildExtras) ----------------
function sched(){ var out = [], D = db(), now = Date.now(), base = today();
  var at = function(k, hm){ var p = String(hm).split(":"), d = dOf(k); d.setHours(+p[0] || 0, +p[1] || 0, 0, 0); return d.getTime(); };
  for(var i = 0; i < 10; i++){ var k = dAdd(base, i);
    D.habits.forEach(function(h){ if(!h.rem || !hDue(h, k) || (i === 0 && hDone(h, k))) return; out.push({t:at(k, h.rem), id:"gh" + h.id + k, title:h.ic + " " + h.name, body:h.cue ? L("Selepas ", "After ") + h.cue + (h.tiny ? " · " + L("Versi kecil: ", "Tiny version: ") + h.tiny : "") : (h.tiny ? L("Hari sukar? Cuba: ", "Hard day? Try: ") + h.tiny : L("Ketik untuk tanda selesai.", "Tap to tick it off.")), open:"side:cal/fokus"}); });
    if(D.set.rem.pm && !(i === 0 && day(k).ev)) out.push({t:at(k, D.set.rem.pm), id:"gpm" + k, title:"🌙 " + L("Semakan malam", "Evening review"), body:L("Apa yang menjadi hari ini? Satu syukur, satu baiki.", "What went well today? One thanks, one fix."), open:"side:cal/fokus"});
    if(D.set.rem.wk && dOf(k).getDay() === 0 && !D.rev[monOf(k)]) out.push({t:at(k, "20:30"), id:"gwk" + k, title:"🧭 " + L("Semakan mingguan", "Weekly review"), body:L("10 minit: kejayaan, terlepas, pengajaran, satu perubahan.", "10 minutes: wins, misses, lessons, one change."), open:"side:cal/fokus"}); }
  (D.people || []).forEach(function(p){ if(!p.every) return; var due = dAdd(p.last || p.made || base, p.every); if(due < base) due = base; if(diffD(base, due) <= 10) out.push({t:at(due, "10:00"), id:"gpp" + p.id + due, title:"🤝 " + L("Hubungi ", "Reach out to ") + p.n, body:p.note ? p.note : L("Sudah lama tidak berhubung. Satu mesej pun cukup.", "It has been a while. One message is enough."), open:"side:cal/fokus"}); });
  (D.renew || []).forEach(function(r){ [30, 7, 1].forEach(function(b){ var k = dAdd(r.date, -b); if(k >= base && diffD(base, k) <= 10) out.push({t:at(k, "09:00"), id:"grn" + r.id + b, title:(r.ic || "🗂") + " " + r.n, body:L("Tamat tempoh dalam " + b + " hari (" + r.date + ").", "Expires in " + b + " days (" + r.date + ")."), open:"side:cal/fokus"}); }); });
  H.save("ihsan_grow_ex", out.filter(function(x){ return x.t > now; }).sort(function(a, b){ return a.t - b.t; }).slice(0, 60));
  if(H.pushSchedule) H.pushSchedule(); }

// ---------------- small UI parts ----------------
function ring(f, sz, col, inner){ var R = sz / 2 - 6, C = 2 * Math.PI * R; return '<svg class="gwRing" viewBox="0 0 ' + sz + ' ' + sz + '" width="' + sz + '" height="' + sz + '"><circle cx="' + sz / 2 + '" cy="' + sz / 2 + '" r="' + R + '" fill="none" stroke="var(--line)" stroke-width="7"/><circle cx="' + sz / 2 + '" cy="' + sz / 2 + '" r="' + R + '" fill="none" stroke="' + (col || "var(--gold)") + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - clamp(f, 0, 1))).toFixed(1) + '" transform="rotate(-90 ' + sz / 2 + ' ' + sz / 2 + ')"/>' + (inner ? '<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" class="gwRingT">' + inner + '</text>' : '') + '</svg>'; }
function bar(f, col){ return '<div class="gwBar"><i style="width:' + Math.round(clamp(f, 0, 1) * 100) + '%;background:' + (col || "var(--gold)") + '"></i></div>'; }
function chipA(k){ var a = area(k); return '<span class="gwA" style="--ac:' + a[4] + '">' + a[1] + ' ' + E(L(a[2], a[3])) + '</span>'; }
function empty(ic, t, btn){ return '<div class="gwEmpty"><div class="gwEmIc">' + ic + '</div><div>' + t + '</div>' + (btn || '') + '</div>'; }
function sheet(title, html){ return H.showSheet(title, html); }
function share(t){ if(N().shareText) N().shareText(t); else if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ H.toast(L("Disalin", "Copied")); }); }
function go(p){ PG = p; db().set.pg = p; H.save(KEY, db()); if(H.onPage && H.onPage(p)) return; draw(); var v = document.getElementById("view"); if(v) v.scrollTop = 0; }

// ---------------- pages ----------------
// 0.6.41 (owner "merge with focus"): the focus timer, garden, plans and Time Nudge (focus/focus.js) live inside Today; no separate Timer page
var PAGES = [["today","☀️","Hari ini","Today"],["goals","🎯","Matlamat","Goals"],["habits","🔁","Tabiat","Habits"],["grow","🌱","Bina diri","Grow"],["me","👤","Saya","Me"]];
function view(el, h){ H = h; G = null; EL = el; db(); if(H.page) PG = H.page;
  if(!PG){ var fs = (H.load("ihsan_focus", {}) || {}).sess; PG = fs && fs.on ? "today" : (db().set.pg || "today"); }
  if(!PAGES.some(function(p){ return p[0] === PG; }) && PG !== "focus") PG = "today";
  draw(); }
function draw(){ if(!EL || !document.body.contains(EL)) return;
  if(H.hostDock){ EL.innerHTML = '<div id="gwBody"></div>'; BODY = EL.querySelector("#gwBody"); fn(PG)(BODY); return; }   // 0.7.77 (owner): inside Time > Planner, which draws the tabs
  EL.innerHTML = '<div id="gwBody"></div><div class="dock gwdock"><div class="gwg6">' + (window.l3Keep ? l3Keep(PAGES, "cal/fokus", PG) : PAGES).map(function(p){ return '<button class="chip' + (PG === p[0] ? " on" : "") + '" data-gp="' + p[0] + '">' + p[1] + ' ' + L(p[2], p[3]) + '</button>'; }).join("") + '</div></div>';
  BODY = EL.querySelector("#gwBody"); fn(PG)(BODY);
  EL.querySelectorAll("[data-gp]").forEach(function(b){ b.onclick = function(){ if(window.GrowTools) GrowTools.close(); go(b.getAttribute("data-gp")); }; });
  try{ H.dockFix(); }catch(e){}
  if(window.IbSwipe && window.ibWrap){ var ks = (window.l3Keep ? l3Keep(PAGES, "cal/fokus", PG) : PAGES).map(function(x){ return x[0]; }), nb = function(s){ return ks[ks.indexOf(PG) + (s < 0 ? 1 : -1)]; };
    var pg = window.ibWrap(BODY);
    window.IbSwipe(pg, {can:function(s){ return !!nb(s) && !(window.GrowTools && GrowTools.open()); }, go:function(s){ go(nb(s)); }, find:function(){ return document.querySelector("#gwBody .ibpg"); },
      skip:function(){ var a = document.activeElement; return (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) || !!document.querySelector(".gwNoSw"); }}); } }
function redraw(){ var v = document.getElementById("view"), y = v ? v.scrollTop : 0; draw(); if(v) v.scrollTop = y; }
function fn(p){ return {today:pToday, goals:H.hostDock ? pGoalsGrow : pGoals, habits:pHabits, grow:pGrow, me:pMe, focus:pFocus}[p] || pToday; }
// 0.7.77 (owner): Goals carries Grow (self-improvement roadmaps and tools) underneath; Focus is its own page
function pGoalsGrow(b){ b.innerHTML = '<div id="gwGo"></div><div class="snl" style="margin:16px 2px 6px">🌱 ' + L("Bina diri", "Grow") + '</div><div id="gwGr"></div>'; pGoals(b.querySelector("#gwGo")); pGrow(b.querySelector("#gwGr")); }
function pFocus(b){ b.innerHTML = '<div id="gwFocus" class="gwFocus more"></div>'; focusInto(b); }
/** the focus timer (focus/focus.js) inside Today: start card, countdown ring, garden, focus today, plans, Time Nudge */
function focusInto(b){ var host = b.querySelector("#gwFocus"); if(!host) return;
  if(window.FocusView) FocusView.view(host, H); else H.loadJs(["focus/focus.js"], function(){ if(document.body.contains(host)) FocusView.view(host, H); }, function(){}); }
function pGrow(b){ var go_ = function(){ if(document.body.contains(b)) GrowTools.view(b, H, API); };
  if(window.GrowTools) go_(); else { b.innerHTML = '<div class="card mut">' + L("Memuatkan…", "Loading…") + '</div>'; H.loadJs(["focus/grow_tools.js"], go_, function(){ b.innerHTML = '<div class="card">' + L("Gagal dimuatkan", "Could not load") + '</div>'; }); } }

// ---------- Today ----------
function greet(){ var h = new Date().getHours(); return h < 12 ? L("Selamat pagi", "Good morning") : h < 15 ? L("Selamat tengah hari", "Good afternoon") : h < 19 ? L("Selamat petang", "Good evening") : L("Selamat malam", "Good night"); }
function dueToday(){ var k = today(); return db().habits.filter(function(h){ return !h.arch && h.k !== "quit" && hDue(h, k); }); }
function pToday(b){ var D = db(), k = today(), d = day(k), hrs = new Date().getHours(), due = dueToday(), pt = H.dayTasks ? H.dayTasks() : {n:0, k:0};   // 0.7.77 (owner): no Top 3, no intention; planner tasks count instead
  var done = due.filter(function(h){ return hDone(h, k); }).length + pt.k, tot = due.length + pt.n;
  var lv = level(xpAll().xp), best = 0; D.habits.forEach(function(h){ if(!h.arch && h.k !== "quit") best = Math.max(best, streak(h)); });
  var h = '<div class="card gwHero"><div class="gwHeroL"><div class="mut small">' + E(new Date().toLocaleDateString(loc(), {weekday:"long", day:"numeric", month:"long"})) + '</div><h2>' + greet() + '</h2>' +
    '<div class="gwHeroS"><span>⭐ ' + L("Tahap ", "Level ") + lv.l + '</span>' + (best ? '<span>🔥 ' + best + ' ' + L("hari", "days") + '</span>' : '') + '<span>✅ ' + done + '/' + tot + '</span></div>' +
'</div>' + ring(tot ? done / tot : 0, 92, "var(--gold)", tot ? Math.round(done / tot * 100) + "%" : "—") + '</div>';
  if(!D.set.onb && !D.habits.length && !D.goals.length) h += '<div class="card gwStart"><h3>✨ ' + L("Mula dalam 2 minit", "Start in 2 minutes") + '</h3><div class="mut small">' + L("Nilai 8 bahagian hidup anda, pilih 3 untuk diberi tumpuan, dan kami sediakan pelan permulaan: satu matlamat dan beberapa tabiat kecil.", "Rate 8 areas of your life, pick 3 to focus on, and we set up a starter plan: one goal and a few small habits.") + '</div><button class="btn gold full" id="gwOnb">' + L("Mula", "Begin") + ' ›</button></div>';
  if(H.timeline) h += '<div id="gwTl"></div>';
  // habits due
  if(due.length || D.habits.length) h += '<div class="card"><div class="row"><h3 style="margin:0">🔁 ' + L("Tabiat hari ini", "Habits today") + '</h3><label class="gwBad"><input type="checkbox" id="gwBad"' + (BAD ? ' checked' : '') + '> ' + L("Hari sukar", "Hard day") + '</label></div>' +
    (BAD ? '<div class="mut tiny" style="margin:4px 0">💛 ' + L("Tak mengapa. Buat versi 2 minit sahaja; ia tetap dikira.", "That's okay. Do the 2-minute versions; they still count.") + '</div>' : '') +
    (due.length ? due.map(function(x){ return hRow(x, k, true); }).join("") : '<div class="mut small">' + L("Tiada tabiat untuk hari ini. Rehat. 🌿", "No habits due today. Rest. 🌿") + '</div>') + quitMini() + '</div>';
  h += nextCard() + nudge();
  // evening review
  if(d.ev) h += '<div class="card gwDone"><h3>🌙 ' + L("Semakan malam selesai", "Evening review done") + '</h3><div class="mut small">' + MOODS[(d.mood || 3) - 1][0] + ' ' + (d.good ? E(d.good) : '') + '</div><button class="chip" id="gwEv">✏️ ' + L("Ubah", "Edit") + '</button></div>';
  else h += '<div class="card"><h3>🌙 ' + L("Semakan malam", "Evening review") + '</h3><div class="mut small">' + L("Kurang 60 saat: perasaan, apa yang menjadi dan satu syukur.", "Under 60 seconds: mood, what went well and one thanks.") + '</div><button class="btn' + (hrs >= 17 ? ' gold' : ' alt') + ' full" id="gwEv" style="margin-top:8px">🌙 ' + L("Mula semakan", "Start review") + '</button></div>';
  var wk = monOf(k), wd = new Date().getDay(); if(!D.rev[wk] && (D.habits.length || D.goals.length) && (wd === 0 || wd === 6 || (wd === 5 && hrs >= 17))) h += '<div class="card"><h3>🧭 ' + L("Semakan mingguan", "Weekly review") + '</h3><div class="mut small">' + L("4 soalan: kejayaan, terlepas, pengajaran, satu perubahan.", "4 questions: wins, misses, lessons, one change.") + '</div><button class="btn alt full" id="gwRev" style="margin-top:8px">🧭 ' + L("Buat semakan", "Do the review") + '</button></div>';
  b.innerHTML = h; bindToday(b); var tl = b.querySelector("#gwTl"); if(tl && H.timeline) H.timeline(tl, function(){ redraw(); }); }
var MOODS = [["😞","Teruk","Awful"],["🙁","Kurang baik","Not great"],["😐","Biasa","Okay"],["🙂","Baik","Good"],["😄","Hebat","Great"]];
function hRow(x, k, today_){ var v = hVal(x, k), ok = hDone(x, k), n = x.n || 1, st = streak(x), fz = db().fz[x.id + "|" + k], u = unitOf(x);
  var sub = (BAD && x.tiny && !ok ? '💛 ' + E(x.tiny) : (x.cue ? '↪ ' + L("Selepas ", "After ") + E(x.cue) : hSub(x))) + (x.k === "count" || x.k === "min" ? ' · ' + v + '/' + n + (u ? ' ' + E(u) : '') : '');
  return '<div class="gwH' + (ok ? ' ok' : '') + '" style="--ac:' + aCol(x.area) + '"><button class="gwTick big" data-ht="' + x.id + '" data-k="' + k + '" aria-label="' + E(x.name) + '">' + (ok ? (fz ? '❄' : '✓') : (x.k === "count" && v ? v : x.ic)) + '</button>' +
    '<div class="gwHx" data-hd="' + x.id + '"><b>' + E(x.name) + '</b><small>' + sub + '</small></div>' + (x.k === "count" && v ? '<button class="chip" data-hm="' + x.id + '" data-k="' + k + '">−</button>' : '') + (st ? '<span class="gwSt">🔥' + st + '</span>' : '') +
    (today_ && canRepair(x) ? '<button class="chip gwRep" data-rp="' + x.id + '" title="' + E(L("Baiki semalam", "Repair yesterday")) + '">❄</button>' : '') + '</div>'; }
function quitMini(){ var Q = db().habits.filter(function(h){ return h.k === "quit" && !h.arch; }); if(!Q.length) return '';
  return Q.map(function(h){ var d = streak(h), sv = (h.cost || 0) * d; return '<div class="gwH ok" style="--ac:' + aCol(h.area) + '"><span class="gwTick big">' + h.ic + '</span><div class="gwHx" data-hd="' + h.id + '"><b>' + E(h.name) + '</b><small>' + L(d + " hari bebas", d + " days clean") + (sv ? ' · ' + L("jimat RM", "saved RM") + sv : '') + '</small></div><button class="chip" data-urge="' + h.id + '">🌊 ' + L("Desakan", "Urge") + '</button></div>'; }).join(""); }
function nextCard(){ var now = Date.now(), items = [];
  try{ var p = (H.prayerTimes ? H.prayerTimes() : []).filter(function(x){ return x.t > now; })[0]; if(p) items.push(["🕌", L(p.n, p.ne), new Date(p.t).toLocaleTimeString(loc(), {hour:"numeric", minute:"2-digit"}), "solat/waktu"]); }catch(e){}
  db().goals.filter(function(g){ return g.st === "on"; }).forEach(function(g){ (g.ms || []).filter(function(m){ return !m.done && m.due; }).slice(0, 1).forEach(function(m){ items.push(["🚩", m.t, dLabel(m.due), null]); }); if(g.due && gLeft(g) >= 0 && gLeft(g) <= 30) items.push([g.ic, g.name, L(gLeft(g) + " hari lagi", gLeft(g) + " days left"), null]); });
  (db().people || []).forEach(function(pp){ if(pp.every && dAdd(pp.last || pp.made || today(), pp.every) <= today()) items.push(["🤝", L("Hubungi ", "Reach out: ") + pp.n, L("hari ini", "today"), "grow:people"]); });
  if(!items.length) return ''; return '<div class="card"><h3>⏭ ' + L("Seterusnya", "Next up") + '</h3>' + items.slice(0, 4).map(function(x){ return '<div class="set"' + (x[3] ? ' data-nx="' + x[3] + '"' : '') + '><span>' + x[0] + ' ' + E(x[1]) + '</span><b class="small">' + E(x[2]) + '</b></div>'; }).join("") + '</div>'; }
function nudge(){ var D = db(), k = today(), t = null, act = null;
  var st = D.goals.filter(gStalled)[0];
  if(st){ t = L("“" + st.name + "” tiada kemajuan 7 hari. Kecilkan, rehatkan atau anjak tarikh?", "“" + st.name + "” has had no progress for 7 days. Shrink it, pause it or move the date?"); act = '<button class="chip" data-gopen="' + st.id + '">🛟 ' + L("Selamatkan", "Rescue") + '</button>'; }
  else if(D.habits.some(function(h){ return canRepair(h); })) t = L("Terlepas semalam? Ketik ❄ untuk baiki streak (" + fzLeft() + " baki bulan ini).", "Missed yesterday? Tap ❄ to repair the streak (" + fzLeft() + " left this month).");
  else { var tips = [L("Mula kecil: versi 2 minit lebih baik daripada tiada.", "Start tiny: a 2-minute version beats nothing."), L("Gandingkan tabiat baharu dengan yang sedia ada: selepas solat Subuh, saya akan…", "Stack a new habit on an old one: after Fajr, I will…"),
      L("Fokus 25 minit untuk perkara utama #1 sebelum buka media sosial.", "Focus 25 minutes on top thing #1 before opening social media."), L("Terlepas sehari tidak memadam kemajuan. Sambung semula hari ini.", "Missing one day doesn't erase progress. Pick it up again today."),
      L("Ceritakan satu matlamat kepada seseorang yang anda percaya.", "Tell one goal to someone you trust."), L("Hargai pasangan atau keluarga dengan satu ayat hari ini.", "Appreciate your spouse or family in one sentence today.")];
    t = tips[(dOf(k).getDate() + dOf(k).getMonth()) % tips.length]; }
  return '<div class="card gwNudge"><span>💡</span><div><div class="small">' + E(t) + '</div>' + (act || '') + '</div></div>'; }
function bindToday(b){ var k = today(), d = day(k);
  var on = b.querySelector("#gwOnb"); if(on) on.onclick = onboard;
  var is = b.querySelector("#gwIntS"); if(is) is.onclick = function(){ var v = b.querySelector("#gwIntI").value.trim(); if(!v) return; d.int = v; save(); H.toast("🌅 " + L("Niat disimpan. Semoga dipermudahkan.", "Intention saved. May it be made easy.")); redraw(); };
  b.querySelectorAll("[data-ti]").forEach(function(i){ i.onchange = function(){ var n = +i.getAttribute("data-ti"); d.top = d.top || []; var v = i.value.trim(); d.top[n] = v ? {t:v, d:(d.top[n] || {}).d && (d.top[n] || {}).t === v} : null; save(); redraw(); }; });
  b.querySelectorAll("[data-tt]").forEach(function(x){ x.onclick = function(){ var n = +x.getAttribute("data-tt"); if(!d.top || !d.top[n]) return; d.top[n].d = !d.top[n].d; save(); if(d.top[n].d) celebrate(L("Satu perkara utama selesai!", "One top thing done!")); redraw(); }; });
  bindHabits(b);
  var bd = b.querySelector("#gwBad"); if(bd) bd.onchange = function(){ BAD = bd.checked; redraw(); };
  b.querySelectorAll("[data-urge]").forEach(function(x){ x.onclick = function(){ urge(hById(x.getAttribute("data-urge"))); }; });
  b.querySelectorAll("[data-side]").forEach(function(x){ x.onclick = function(){ H.openSide(x.getAttribute("data-side")); }; });
  b.querySelectorAll("[data-nx]").forEach(function(x){ x.onclick = function(){ var v = x.getAttribute("data-nx"); if(v.indexOf("grow:") === 0){ db().set.tool = v.slice(5); H.save(KEY, db()); go("grow"); } else H.openSide(v); }; });
  b.querySelectorAll("[data-gopen]").forEach(function(x){ x.onclick = function(){ goalSheet(db().goals.filter(function(g){ return g.id === x.getAttribute("data-gopen"); })[0]); }; });
  var ev = b.querySelector("#gwEv"); if(ev) ev.onclick = evening;
  var fm = b.querySelector("#gwFoM"); if(fm) fm.onclick = function(){ FMORE = !FMORE; b.querySelector("#gwFocus").classList.toggle("more", FMORE); fm.textContent = FMORE ? "▲ " + L("Tutup", "Hide") : "🌳 " + L("Taman, pelan fokus & peringatan masa", "Garden, focus plans & Time Nudge"); };
  var rv = b.querySelector("#gwRev"); if(rv) rv.onclick = weekly; }
function bindHabits(b){
  b.querySelectorAll("[data-ht]").forEach(function(x){ x.onclick = function(){ var h = hById(x.getAttribute("data-ht")), k = x.getAttribute("data-k"), was = hDone(h, k); hTap(h, k); if(!was && hDone(h, k)){ var s = streak(h); celebrate(s > 1 ? "🔥 " + s + " " + L("hari berturut!", "days in a row!") : L("Bagus! Teruskan.", "Nice! Keep going."), h.rew); } redraw(); }; });
  b.querySelectorAll("[data-hm]").forEach(function(x){ x.onclick = function(){ hTap(hById(x.getAttribute("data-hm")), x.getAttribute("data-k"), -1); redraw(); }; });
  b.querySelectorAll("[data-hd]").forEach(function(x){ x.onclick = function(){ habitSheet(hById(x.getAttribute("data-hd"))); }; });
  b.querySelectorAll("[data-rp]").forEach(function(x){ x.onclick = function(){ var h = hById(x.getAttribute("data-rp")); if(!canRepair(h)) return; db().fz[h.id + "|" + dAdd(today(), -1)] = 1; save(); H.toast("❄ " + L("Streak dibaiki. Teruskan hari ini!", "Streak repaired. Keep it going today!")); redraw(); }; }); }
function celebrate(t, rew){ H.toast("✨ " + t + (rew ? " 🎁 " + rew : "")); var c = document.createElement("div"); c.className = "gwConf"; for(var i = 0; i < 14; i++){ var s = document.createElement("i"); s.style.left = (8 + Math.random() * 84) + "%"; s.style.animationDelay = (Math.random() * 0.25) + "s"; s.style.background = AREAS[i % 8][4]; c.appendChild(s); } document.body.appendChild(c); setTimeout(function(){ c.remove(); }, 1400); }
function urge(h){ var ov = sheet("🌊 " + L("Desakan datang", "An urge came"), '<div class="mut small">' + L("Desakan biasanya reda dalam 10 minit. Tarik nafas, minum air, beralih tempat. Catat apa yang mencetuskannya.", "Urges usually pass in about 10 minutes. Breathe, drink water, change place. Note what set it off.") + '</div><input id="guT" class="rin" style="margin:8px 0" placeholder="' + E(L("Pencetus (bosan, tekanan, kawan…)", "Trigger (bored, stress, friends…)")) + '"><div class="btns"><button class="btn gold" id="guOk">💪 ' + L("Saya tahan", "I resisted") + '</button><button class="btn alt" id="guSl">' + L("Saya terlepas", "I slipped") + '</button></div>' +
    ((h.urges || []).length ? '<div class="mut tiny" style="margin-top:10px">' + L("Catatan lepas: ", "Past notes: ") + h.urges.slice(-5).reverse().map(function(u){ return E(dLabel(u.d) + " " + (u.ok ? "💪" : "↩") + " " + (u.t || "")); }).join(" · ") + '</div>' : ''));
  var put = function(ok){ h.urges = h.urges || []; h.urges.push({d:today(), t:ov.querySelector("#guT").value.trim(), ok:ok}); if(!ok){ h.slip = h.slip || {}; h.slip[today()] = 1; } save(); H.closeOverlay(); H.toast(ok ? "💪 " + L("Hebat. Satu kemenangan kecil.", "Well done. A small win.") : "💛 " + L("Tak mengapa. Mula semula hari ini; tiada malu.", "That's okay. Start again today; no shame.")); redraw(); };
  ov.querySelector("#guOk").onclick = function(){ put(true); }; ov.querySelector("#guSl").onclick = function(){ put(false); }; }

// evening review: mood, what went well, gratitude + improve (into the Muhasabah journal), tomorrow's top 3
function evening(){ var k = today(), d = day(k), J = H.load("ihsan_muhasabah", {d:{}, lock:false}) || {d:{}}; J.d = J.d || {}; var je = J.d[k] || {}, tm = day(dAdd(k, 1)).top || [];
  var ov = sheet("🌙 " + L("Semakan malam", "Evening review"),
    '<div class="gwQ">' + L("Bagaimana hari ini?", "How was today?") + '</div><div class="gwMoods">' + MOODS.map(function(m, i){ return '<button class="gwMood' + (d.mood === i + 1 ? ' on' : '') + '" data-md="' + (i + 1) + '">' + m[0] + '<small>' + L(m[1], m[2]) + '</small></button>'; }).join("") + '</div>' +
    '<div class="gwQ">' + L("Apa yang menjadi hari ini?", "What went well today?") + '</div><input id="evG" class="rin" value="' + E(d.good || "") + '">' +
    (J.lock ? '<div class="mut tiny" style="margin-top:8px">🔒 ' + L("Jurnal Muhasabah dikunci; syukur ditulis di sana.", "The Muhasabah journal is locked; write your thanks there.") + '</div>' :
      '<div class="gwQ">🤲 ' + L("Saya bersyukur kerana…", "I am grateful for…") + '</div><input id="evT" class="rin" value="' + E(je.g || "") + '"><div class="gwQ">🌱 ' + L("Esok saya ingin memperbaiki…", "Tomorrow I want to improve…") + '</div><input id="evI" class="rin" value="' + E(je.i || "") + '">') +
    '<button class="btn gold full" id="evS" style="margin-top:10px">' + L("Simpan", "Save") + '</button><div class="mut tiny" style="margin-top:6px">' + L("Syukur dan perkara untuk diperbaiki disimpan dalam jurnal Muhasabah (Masa › Perancang).", "Thanks and things to improve are kept in the Muhasabah journal (Time › Planner).") + '</div>');
  ov.querySelectorAll("[data-md]").forEach(function(x){ x.onclick = function(){ d.mood = +x.getAttribute("data-md"); ov.querySelectorAll("[data-md]").forEach(function(y){ y.classList.toggle("on", y === x); }); }; });
  ov.querySelector("#evS").onclick = function(){ d.good = ov.querySelector("#evG").value.trim(); d.ev = 1; d.mood = d.mood || 3;
    if(!J.lock){ var g = ov.querySelector("#evT").value.trim(), im = ov.querySelector("#evI").value.trim(); if(g || im){ J.d[k] = J.d[k] || {}; if(g) J.d[k].g = g; if(im) J.d[k].i = im; H.save("ihsan_muhasabah", J); } }
    save(); H.closeOverlay(); celebrate(L("Semakan selesai. Rehat yang baik.", "Review done. Rest well.")); redraw(); }; }

// weekly review wizard (5 questions) with this week's numbers first
function weekStats(m){ var D = db(), hd = 0, hdue = 0, fo = 0, top = 0, moods = [], fl = (H.load("ihsan_focus", {}) || {}).log || {};
  for(var i = 0; i < 7; i++){ var k = dAdd(m, i); if(k > today()) break; D.habits.forEach(function(h){ if(h.k === "quit" || h.arch || (h.made && k < h.made)) return; if(hDue(h, k) || hDone(h, k)){ hdue++; if(hDone(h, k)) hd++; } }); fo += fl[k] || 0; var d = D.day[k] || {}; (d.top || []).forEach(function(t){ if(t && t.d) top++; }); if(d.mood) moods.push(d.mood); }
  return {hab:hdue ? hd / hdue : 0, hd:hd, hdue:hdue, fo:fo, top:top, mood:moods.length ? moods.reduce(function(a, b){ return a + b; }, 0) / moods.length : 0}; }
function weekly(){ var m = monOf(today()), S = weekStats(m), R = db().rev[m] || {}, step = 0, nx = dAdd(m, 7);
  var Q = [["wins","🏆","Apa kejayaan minggu ini?","What were this week's wins?"],["miss","🌧","Apa yang terlepas, dan kenapa?","What was missed, and why?"],["lesson","💡","Apa pengajarannya?","What is the lesson?"],["chg","🔧","Satu perubahan untuk minggu depan","One change for next week"]];
  var ov = sheet("🧭 " + L("Semakan mingguan", "Weekly review"), '<div id="wrB"></div>');
  var draw_ = function(){ var B = ov.querySelector("#wrB"), q = Q[step];
    B.innerHTML = (step === 0 ? '<div class="gwWkS"><div><b>' + Math.round(S.hab * 100) + '%</b><small>' + L("tabiat", "habits") + '</small></div><div><b>' + Math.round(S.fo / 6) / 10 + L(" j", " h") + '</b><small>' + L("fokus", "focus") + '</small></div><div><b>' + (S.mood ? MOODS[Math.round(S.mood) - 1][0] : "—") + '</b><small>' + L("perasaan", "mood") + '</small></div></div>' : '') +
      '<div class="gwStep">' + (step + 1) + ' / ' + Q.length + '</div><div class="gwQ">' + q[1] + ' ' + L(q[2], q[3]) + '</div>' +
      (q[0] === "top" ? [0, 1, 2].map(function(i){ return '<input class="rin wrT" style="margin-bottom:4px" value="' + E((R.top || [])[i] || "") + '" placeholder="' + (i + 1) + '">'; }).join("") : '<textarea id="wrA" class="rin" rows="3">' + E(R[q[0]] || "") + '</textarea>') +
      '<div class="btns" style="margin-top:10px">' + (step ? '<button class="btn alt" id="wrP">‹</button>' : '') + '<button class="btn gold" id="wrN">' + (step < Q.length - 1 ? L("Seterusnya", "Next") + ' ›' : '✓ ' + L("Selesai", "Finish")) + '</button></div>';
    var grab = function(){ if(q[0] === "top"){ R.top = []; B.querySelectorAll(".wrT").forEach(function(i){ R.top.push(i.value.trim()); }); } else R[q[0]] = B.querySelector("#wrA").value.trim(); };
    var p = B.querySelector("#wrP"); if(p) p.onclick = function(){ grab(); step--; draw_(); };
    B.querySelector("#wrN").onclick = function(){ grab(); if(step < Q.length - 1){ step++; draw_(); return; } R.d = today(); R.hab = S.hab; R.fo = S.fo; db().rev[m] = R;
      save(); H.closeOverlay(); celebrate(L("Semakan mingguan selesai! +40 XP", "Weekly review done! +40 XP")); redraw(); }; };
  draw_(); }

// first run: life wheel → pick 3 areas → starter plan
function onboard(){ var v = AREAS.map(function(){ return 5; }), pick = [], step = 0;
  var ov = sheet("✨ " + L("Mula", "Begin"), '<div id="obB"></div>');
  var draw_ = function(){ var B = ov.querySelector("#obB");
    if(step === 0){ B.innerHTML = '<div class="gwStep">1 / 2</div><div class="gwQ">' + L("Nilai setiap bahagian hidup, 1 hingga 10", "Rate each area of life, 1 to 10") + '</div>' + AREAS.map(function(a, i){ return '<div class="gwSl" style="--ac:' + a[4] + '"><span>' + a[1] + ' ' + E(L(a[2], a[3])) + '</span><input type="range" min="1" max="10" value="' + v[i] + '" data-wv="' + i + '"><b>' + v[i] + '</b></div>'; }).join("") + '<button class="btn gold full" id="obN" style="margin-top:10px">' + L("Seterusnya", "Next") + ' ›</button>';
      B.querySelectorAll("[data-wv]").forEach(function(r){ r.oninput = function(){ v[+r.getAttribute("data-wv")] = +r.value; r.nextSibling.textContent = r.value; }; });
      B.querySelector("#obN").onclick = function(){ pick = AREAS.map(function(a, i){ return [a[0], v[i]]; }).sort(function(a, b){ return a[1] - b[1]; }).slice(0, 3).map(function(x){ return x[0]; }); step = 1; draw_(); }; }
    else { B.innerHTML = '<div class="gwStep">2 / 2</div><div class="gwQ">' + L("Pilih hingga 3 bahagian untuk diberi tumpuan (yang terendah dipilih dahulu)", "Pick up to 3 areas to focus on (the lowest are picked first)") + '</div><div class="gwAreas">' + AREAS.map(function(a){ return '<button class="gwAreaB' + (pick.indexOf(a[0]) >= 0 ? ' on' : '') + '" style="--ac:' + a[4] + '" data-ap="' + a[0] + '">' + a[1] + '<small>' + E(L(a[2], a[3])) + '</small></button>'; }).join("") + '</div><button class="btn gold full" id="obS" style="margin-top:10px">' + L("Bina pelan saya", "Build my plan") + '</button><div class="mut tiny" style="margin-top:6px">' + L("Bahagian lain boleh dihidupkan kemudian dalam Saya.", "Other areas can be turned on later in Me.") + '</div>';
      B.querySelectorAll("[data-ap]").forEach(function(x){ x.onclick = function(){ var k = x.getAttribute("data-ap"), i = pick.indexOf(k); if(i >= 0) pick.splice(i, 1); else if(pick.length < 3) pick.push(k); else { H.toast(L("Pilih hingga 3", "Pick up to 3")); return; } x.classList.toggle("on", pick.indexOf(k) >= 0); }; });
      B.querySelector("#obS").onclick = function(){ if(!pick.length) return; var D = db(); D.wheel.push({d:today(), v:v.slice()}); D.set.onb = 1; D.set.focus = pick.slice();
        pick.forEach(function(k){ var hs = HT.filter(function(t){ return t[0] === k && (t[4].k || "tick") !== "quit"; }).slice(0, 2), ids = [];
          hs.forEach(function(t){ var h = mkHabit(t); D.habits.push(h); ids.push(h.id); });
          var GT = STARTER[k]; if(GT) D.goals.push({id:uid(), ic:area(k)[1], name:L(GT[0], GT[1]), area:k, why:"", m:"hab", t:GT[2], hab:ids, made:today(), due:dAdd(today(), 30), q:true, st:"on", ms:[], log:[]}); });
        save(); H.closeOverlay(); celebrate(L("Pelan permulaan anda sedia!", "Your starter plan is ready!")); redraw(); }; } };
  draw_(); }
var STARTER = {health:["Bina rutin badan sihat 30 hari","Build a healthy-body routine for 30 days",40], mind:["Minda lebih tenang bulan ini","A calmer mind this month",30], skills:["Latih kemahiran 20 kali bulan ini","Practise a skill 20 times this month",20],
  money:["Urus wang dengan sedar 30 hari","Mindful money for 30 days",25], home:["Rumah kemas setiap hari","A tidy home every day",40], family:["Rapatkan hubungan keluarga","Grow closer as a family",30], friends:["Hubungi kawan secara tetap","Keep in touch with friends",12], purpose:["Hidup dengan tujuan","Live with purpose",20]};
function mkHabit(t){ var o = t[4] || {}; return {id:uid(), ic:t[1], name:L(t[2], t[3]), area:t[0], k:o.k || "tick", n:o.n || 1, u:o.u || null, fq:o.fq || {t:"d"}, tiny:o.tiny ? L(o.tiny[0], o.tiny[1]) : "", cost:o.cost || 0, since:o.k === "quit" ? today() : null, log:{}, made:today()}; }

// ---------- Goals ----------
var GF = "on";
function pGoals(b){ var D = db(), L0 = D.goals.filter(function(g){ return GF === "q" ? g.q && g.st === "on" : GF === "done" ? g.st === "done" : g.st !== "done"; });
  var h = '<div class="card gwHead"><div class="row"><h3 style="margin:0">🎯 ' + L("Matlamat", "Goals") + '</h3><button class="btn gold" id="gwGAdd">＋ ' + L("Matlamat", "Goal") + '</button></div>' +
    '<div class="rseg" style="margin-top:8px">' + [["on", L("Aktif", "Active")], ["q", L("Fokus 90 hari", "90-day focus")], ["done", L("Tercapai", "Reached")]].map(function(x){ return '<button class="chip' + (GF === x[0] ? ' on' : '') + '" data-gf="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>' +
    (GF === "q" ? '<div class="mut tiny" style="margin-top:6px">' + L("Pilih 1–3 sasaran besar setiap suku tahun. Semak separuh jalan pada hari ke-45.", "Pick 1–3 big targets each quarter. Check in halfway, on day 45.") + '</div>' : '') + '</div>';
  if(!L0.length) h += empty("🎯", GF === "done" ? L("Belum ada yang tercapai. Ia akan sampai.", "Nothing reached yet. It will come.") : L("Matlamat yang jelas mengalahkan yang kabur. Apa, berapa banyak, bila, dan kenapa.", "Clear goals beat vague ones. What, how much, by when, and why."), GF !== "done" ? '<button class="btn gold" id="gwGAdd2">＋ ' + L("Bina matlamat pertama", "Build your first goal") + '</button>' : '');
  h += L0.map(function(g){ var p = gProg(g), lf = gLeft(g), nm = (g.ms || []).filter(function(m){ return !m.done; })[0];
    return '<div class="card gwG" data-go="' + g.id + '" style="--ac:' + aCol(g.area) + '"><div class="gwGT">' + ring(p, 58, aCol(g.area), Math.round(p * 100) + "%") + '<div class="gwGx"><b>' + E(g.ic + " " + g.name) + '</b><div class="small">' + E(gNow(g)) + '</div>' +
      '<div class="tiny mut">' + chipA(g.area) + (lf != null && g.st !== "done" ? ' · ' + (lf >= 0 ? '⏳ ' + L(lf + " hari lagi", lf + " days left") : '⚠ ' + L("lewat " + (-lf) + " hari", (-lf) + " days late")) : '') + (g.q ? ' · 🗓 90' : '') + (g.st === "pause" ? ' · ⏸' : '') + '</div></div></div>' +
      (nm ? '<div class="tiny gwNm">🚩 ' + E(nm.t) + (nm.due ? ' · ' + dLabel(nm.due) : '') + '</div>' : '') + (gStalled(g) ? '<div class="tiny gwWarn">🛟 ' + L("Tiada kemajuan 7 hari: ketik untuk pilihan", "No progress for 7 days: tap for options") + '</div>' : '') + '</div>'; }).join("");
  if(D.goals.length) h += '<div class="card"><button class="btn alt full" id="gwRev2">🧭 ' + L("Semakan mingguan", "Weekly review") + '</button></div>';
  b.innerHTML = h;
  b.querySelectorAll("[data-gf]").forEach(function(x){ x.onclick = function(){ GF = x.getAttribute("data-gf"); redraw(); }; });
  ["#gwGAdd", "#gwGAdd2"].forEach(function(s){ var x = b.querySelector(s); if(x) x.onclick = function(){ goalBuilder(null); }; });
  b.querySelectorAll("[data-go]").forEach(function(x){ x.onclick = function(e){ if(e) e.stopPropagation(); goalSheet(D.goals.filter(function(g){ return g.id === x.getAttribute("data-go"); })[0]); }; });
  var r2 = b.querySelector("#gwRev2"); if(r2) r2.onclick = weekly; }
function goalBuilder(g0){ var g = g0 ? JSON.parse(JSON.stringify(g0)) : {id:uid(), ic:"🎯", name:"", area:(db().set.focus || ["skills"])[0], why:"", m:"num", s:0, t:10, u:"", cur:0, due:dAdd(today(), 90), made:today(), ms:[], hab:[], q:false, st:"on", log:[]}, step = 0;
  var ov = sheet("🎯 " + (g0 ? L("Ubah matlamat", "Edit goal") : L("Pembina matlamat", "Goal builder")), '<div id="gbB"></div>');
  var S4 = [L("Apa?", "What?"), L("Berapa banyak?", "How much?"), L("Bila?", "By when?"), L("Kenapa?", "Why?")];
  var draw_ = function(){ var B = ov.querySelector("#gbB"), x = '<div class="gwSteps">' + S4.map(function(s, i){ return '<span class="' + (i === step ? 'on' : i < step ? 'ok' : '') + '">' + (i + 1) + '. ' + s + '</span>'; }).join("") + '</div>';
    if(step === 0) x += '<div class="radd"><input id="gbI" class="rin" style="max-width:56px;text-align:center" value="' + E(g.ic) + '"><input id="gbN" class="rin" value="' + E(g.name) + '" placeholder="' + E(L("cth. Turun 5 kg, Habis 12 buku, Simpan RM3000", "e.g. Lose 5 kg, Finish 12 books, Save RM3000")) + '"></div><div class="gwQ">' + L("Bahagian hidup", "Life area") + '</div><div class="gwAreas sm">' + AREAS.map(function(a){ return '<button class="gwAreaB' + (g.area === a[0] ? ' on' : '') + '" style="--ac:' + a[4] + '" data-ga="' + a[0] + '">' + a[1] + '<small>' + E(L(a[2], a[3])) + '</small></button>'; }).join("") + '</div>';
    else if(step === 1){ x += '<div class="rseg">' + [["num", "🔢 " + L("Nombor", "Number")], ["pct", "％ " + L("Peratus", "Percent")], ["yes", "✅ " + L("Ya/tidak + langkah", "Yes/no + steps")], ["hab", "🔁 " + L("Melalui tabiat", "By habits")]].map(function(m){ return '<button class="chip' + (g.m === m[0] ? ' on' : '') + '" data-gm="' + m[0] + '">' + m[1] + '</button>'; }).join("") + '</div>';
      if(g.m === "num") x += '<div class="gwGrid3"><label class="hfld">' + L("Mula", "Start") + '<input id="gbS" type="number" class="rin" value="' + E(g.s) + '"></label><label class="hfld">' + L("Sasaran", "Target") + '<input id="gbT" type="number" class="rin" value="' + E(g.t) + '"></label><label class="hfld">' + L("Unit", "Unit") + '<input id="gbU" class="rin" value="' + E(g.u) + '" placeholder="kg, RM, ' + L("buku", "books") + '"></label></div>';
      else if(g.m === "hab"){ var hs = db().habits.filter(function(h){ return !h.arch && h.k !== "quit"; }); x += '<label class="hfld">' + L("Bilangan kali selesai", "Times done") + '<input id="gbT" type="number" class="rin" value="' + E(g.t || 30) + '"></label><div class="gwQ">' + L("Tabiat yang menyumbang", "Habits that count") + '</div>' + (hs.length ? hs.map(function(h){ return '<label class="pdchk"><input type="checkbox" data-gh="' + h.id + '"' + ((g.hab || []).indexOf(h.id) >= 0 ? ' checked' : '') + '> ' + E(h.ic + " " + h.name) + '</label>'; }).join("") : '<div class="mut small">' + L("Belum ada tabiat. Tambah dalam Tabiat, kemudian pautkan.", "No habits yet. Add them in Habits, then link them.") + '</div>'); }
      else if(g.m === "yes") x += '<div class="mut small" style="margin-top:6px">' + L("Pecahkan kepada langkah kecil selepas disimpan. Kemajuan naik setiap langkah.", "Break it into small steps after saving. Progress rises with each step.") + '</div>';
      else x += '<div class="mut small" style="margin-top:6px">' + L("Kemas kini peratus bila ada kemajuan.", "Update the percent as you go.") + '</div>'; }
    else if(step === 2) x += '<div class="rseg">' + [[30, L("30 hari", "30 days")], [90, L("90 hari", "90 days")], [180, L("6 bulan", "6 months")], [365, L("1 tahun", "1 year")]].map(function(d){ return '<button class="chip" data-gd="' + d[0] + '">' + d[1] + '</button>'; }).join("") + '</div><input type="date" id="gbD" class="rin" style="margin-top:8px" value="' + E(g.due) + '"><label class="pdchk" style="margin-top:8px"><input type="checkbox" id="gbQ"' + (g.q ? ' checked' : '') + '> 🗓 ' + L("Fokus 90 hari (suku tahun ini)", "90-day focus (this quarter)") + '</label>';
    else x += '<div class="gwQ">' + L("Kenapa ia penting? (dibaca semula bila semangat menurun)", "Why does it matter? (read again when motivation drops)") + '</div><textarea id="gbW" class="rin" rows="3">' + E(g.why) + '</textarea>';
    x += '<div class="btns" style="margin-top:12px">' + (step ? '<button class="btn alt" id="gbP">‹</button>' : '') + '<button class="btn gold" id="gbX">' + (step < 3 ? L("Seterusnya", "Next") + ' ›' : '✓ ' + L("Simpan", "Save")) + '</button></div>';
    B.innerHTML = x;
    B.querySelectorAll("[data-ga]").forEach(function(y){ y.onclick = function(){ grab(); g.area = y.getAttribute("data-ga"); if(g.ic === "🎯" || AREAS.some(function(a){ return a[1] === g.ic; })) g.ic = area(g.area)[1]; draw_(); }; });
    B.querySelectorAll("[data-gm]").forEach(function(y){ y.onclick = function(){ grab(); g.m = y.getAttribute("data-gm"); if(g.m === "hab" && (!g.t || g.t < 5)) g.t = 30; draw_(); }; });
    B.querySelectorAll("[data-gd]").forEach(function(y){ y.onclick = function(){ g.due = dAdd(today(), +y.getAttribute("data-gd")); B.querySelector("#gbD").value = g.due; if(+y.getAttribute("data-gd") === 90) B.querySelector("#gbQ").checked = true; }; });
    var p = B.querySelector("#gbP"); if(p) p.onclick = function(){ grab(); step--; draw_(); };
    B.querySelector("#gbX").onclick = function(){ grab(); if(step === 0 && !g.name.trim()){ H.toast(L("Namakan matlamat anda", "Name your goal")); return; } if(step < 3){ step++; draw_(); return; }
      var D = db(), i = D.goals.map(function(x){ return x.id; }).indexOf(g.id); if(g.m === "num" && g.cur == null) g.cur = g.s; if(i >= 0) D.goals[i] = g; else D.goals.push(g); save(); H.closeOverlay(); if(!g0) celebrate(L("Matlamat dibina. Langkah pertama?", "Goal built. First step?")); redraw(); if(!g0 && g.m === "yes") setTimeout(function(){ goalSheet(g); }, 300); }; };
  var grab = function(){ var B = ov.querySelector("#gbB"), q = function(s){ return B.querySelector(s); };
    if(q("#gbI")) g.ic = q("#gbI").value.trim() || "🎯"; if(q("#gbN")) g.name = q("#gbN").value.trim(); if(q("#gbS")) g.s = +q("#gbS").value || 0; if(q("#gbT")) g.t = +q("#gbT").value || 0; if(q("#gbU")) g.u = q("#gbU").value.trim();
    if(B.querySelector("[data-gh]")){ g.hab = []; B.querySelectorAll("[data-gh]").forEach(function(c){ if(c.checked) g.hab.push(c.getAttribute("data-gh")); }); }
    if(q("#gbD")) g.due = q("#gbD").value || g.due; if(q("#gbQ")) g.q = q("#gbQ").checked; if(q("#gbW")) g.why = q("#gbW").value.trim(); };
  draw_(); }
function goalSheet(g){ if(!g) return; var p = gProg(g), lf = gLeft(g);
  var ov = sheet(E(g.ic + " " + g.name), '<div class="gwGS">' + ring(p, 110, aCol(g.area), Math.round(p * 100) + "%") + '<div><div><b>' + E(gNow(g)) + '</b></div><div class="small">' + chipA(g.area) + '</div>' + (g.due ? '<div class="small">📅 ' + dLabel(g.due, {day:"numeric", month:"long", year:"numeric"}) + (lf != null ? ' · ' + (lf >= 0 ? L(lf + " hari lagi", lf + " days left") : L("lewat", "late")) : '') + '</div>' : '') + '</div></div>' +
    (g.why ? '<div class="gwWhy">💭 ' + E(g.why) + '</div>' : '') +
    (gStalled(g) ? '<div class="card gwRescue"><b>🛟 ' + L("Tersekat? Pilih satu:", "Stuck? Pick one:") + '</b><div class="btns" style="margin-top:6px"><button class="chip" data-rs="shrink">🔽 ' + L("Kecilkan", "Shrink it") + '</button><button class="chip" data-rs="pause">⏸ ' + L("Rehatkan", "Pause it") + '</button><button class="chip" data-rs="move">📅 ' + L("Anjak tarikh", "Move the date") + '</button></div></div>' : '') +
    (g.m === "num" || g.m === "pct" ? '<div class="gwQ">' + L("Kemas kini kemajuan", "Update progress") + '</div><div class="radd"><input id="gsV" type="number" class="rin" value="' + E(g.m === "pct" ? g.cur || 0 : (g.cur != null ? g.cur : g.s)) + '"><button class="btn gold" id="gsU">✓</button></div>' : '') +
    (g.m === "hab" ? '<div class="mut small" style="margin:6px 0">🔁 ' + L("Naik sendiri bila tabiat dipautkan selesai: ", "Rises by itself as linked habits are done: ") + (g.hab || []).map(function(id){ var h = hById(id); return h ? E(h.ic + " " + h.name) : ""; }).filter(Boolean).join(", ") + '</div>' : '') +
    '<div class="gwQ">🚩 ' + L("Langkah & sub-matlamat", "Milestones") + '</div><div id="gsM">' + (g.ms || []).map(function(m, i){ return '<div class="gwMs' + (m.done ? ' ok' : '') + '"><button class="gwTick" data-mt="' + i + '">' + (m.done ? '✓' : '') + '</button><span>' + E(m.t) + (m.due ? ' <small class="mut">' + dLabel(m.due) + '</small>' : '') + '</span><button class="chip" data-mx="' + i + '">✕</button></div>'; }).join("") + '</div>' +
    '<div class="radd"><input id="gsMt" class="rin" placeholder="' + E(L("Langkah seterusnya…", "Next step…")) + '"><input id="gsMd" type="date" class="rin" style="max-width:150px"><button class="btn alt" id="gsMa">＋</button></div>' +
    '<div class="btns" style="margin-top:12px;flex-wrap:wrap">' + (g.st !== "done" ? '<button class="btn gold" id="gsDone">🏁 ' + L("Tercapai", "Reached") + '</button>' : '<button class="btn alt" id="gsOpen">↩ ' + L("Buka semula", "Reopen") + '</button>') + '<button class="btn alt" id="gsEd">✏️</button><button class="btn alt" id="gsSh">📤</button><button class="btn alt" id="gsPs">' + (g.st === "pause" ? '▶' : '⏸') + '</button><button class="btn alt" id="gsDel">🗑</button></div>' +
    '<div class="mut tiny" style="margin-top:6px">📤 ' + L("Kongsi dengan rakan akauntabiliti: mereka nampak kemajuan dan boleh memberi semangat.", "Share with an accountability partner: they see your progress and can cheer you on.") + '</div>');
  var upd = function(){ g.last = today(); g.log = g.log || []; g.log.push({d:today(), v:g.cur}); save(); };
  var u = ov.querySelector("#gsU"); if(u) u.onclick = function(){ g.cur = +ov.querySelector("#gsV").value || 0; upd(); if(gProg(g) >= 1){ g.st = "done"; save(); celebrate("🏁 " + L("Matlamat tercapai! Alhamdulillah.", "Goal reached! Alhamdulillah.")); } else H.toast("📈 " + L("Kemajuan disimpan", "Progress saved")); H.closeOverlay(); redraw(); };
  ov.querySelectorAll("[data-mt]").forEach(function(x){ x.onclick = function(){ var m = g.ms[+x.getAttribute("data-mt")]; m.done = !m.done; upd(); H.closeOverlay(); if(m.done) celebrate("🚩 " + L("Langkah selesai! +50 XP", "Milestone done! +50 XP")); goalSheet(g); redraw(); }; });
  ov.querySelectorAll("[data-mx]").forEach(function(x){ x.onclick = function(){ g.ms.splice(+x.getAttribute("data-mx"), 1); save(); H.closeOverlay(); goalSheet(g); }; });
  ov.querySelector("#gsMa").onclick = function(){ var t = ov.querySelector("#gsMt").value.trim(); if(!t) return; g.ms = g.ms || []; g.ms.push({id:uid(), t:t, due:ov.querySelector("#gsMd").value || "", done:false}); g.last = today(); save(); H.closeOverlay(); goalSheet(g); redraw(); };
  var dn = ov.querySelector("#gsDone"); if(dn) dn.onclick = function(){ g.st = "done"; g.doneOn = today(); upd(); H.closeOverlay(); celebrate("🏁 " + L("Matlamat tercapai! Alhamdulillah.", "Goal reached! Alhamdulillah.")); redraw(); };
  var op = ov.querySelector("#gsOpen"); if(op) op.onclick = function(){ g.st = "on"; save(); H.closeOverlay(); redraw(); };
  ov.querySelector("#gsEd").onclick = function(){ H.closeOverlay(); goalBuilder(g); };
  ov.querySelector("#gsPs").onclick = function(){ g.st = g.st === "pause" ? "on" : "pause"; g.last = today(); save(); H.closeOverlay(); redraw(); };
  ov.querySelector("#gsSh").onclick = function(){ share("🎯 " + g.name + "\n" + L("Kemajuan: ", "Progress: ") + Math.round(gProg(g) * 100) + "% (" + gNow(g) + ")" + (g.due ? "\n📅 " + g.due : "") + "\n" + L("Doakan dan beri semangat ya! — My Ihsan", "Cheer me on! — My Ihsan")); };
  ov.querySelector("#gsDel").onclick = function(){ if(!confirm(L("Padam matlamat ini?", "Delete this goal?"))) return; db().goals = db().goals.filter(function(x){ return x.id !== g.id; }); save(); H.closeOverlay(); redraw(); };
  ov.querySelectorAll("[data-rs]").forEach(function(x){ x.onclick = function(){ var r = x.getAttribute("data-rs"); g.last = today();
    if(r === "pause") g.st = "pause"; else if(r === "move") g.due = dAdd(g.due || today(), 30);
    else { if(g.m === "num") g.t = Math.round(((+g.s || 0) + ((+g.t || 0) - (+g.s || 0)) / 2) * 10) / 10; else if(g.m === "hab") g.t = Math.max(1, Math.round(g.t / 2)); else g.ms = (g.ms || []).concat([{id:uid(), t:L("Langkah kecil 10 minit", "A 10-minute small step"), due:dAdd(today(), 1), done:false}]); }
    save(); H.closeOverlay(); H.toast("🛟 " + L("Dikemas kini. Sedikit pun tetap maju.", "Updated. A little is still progress.")); redraw(); }; }); }

// ---------- Habits ----------
var HV = "list";
function pHabits(b){ var D = db(), k = today(), A = D.habits.filter(function(h){ return !h.arch; }), wk = [];
  for(var i = 6; i >= 0; i--){ var dk = dAdd(k, -i), due = 0, ok = 0; A.forEach(function(h){ if(h.k === "quit" || (h.made && dk < h.made)) return; if(hDue(h, dk)){ due++; if(hDone(h, dk)) ok++; } }); wk.push({k:dk, f:due ? ok / due : 0, due:due}); }
  var h = '<div class="card gwHead"><div class="row"><h3 style="margin:0">🔁 ' + L("Tabiat", "Habits") + '</h3><button class="btn gold" id="gwHAdd">＋ ' + L("Tabiat", "Habit") + '</button></div>' +
    '<div class="gwWk">' + wk.map(function(d){ return '<div class="gwWkD' + (d.k === k ? ' now' : '') + '">' + ring(d.f, 34, "#3fb27f", "") + '<small>' + dOf(d.k).toLocaleDateString(loc(), {weekday:"narrow"}) + '</small></div>'; }).join("") + '</div>' +
    '<div class="rseg">' + [["list", L("Hari ini", "Today")], ["all", L("Semua", "All")], ["rt", L("Rutin", "Routines")], ["ins", L("Wawasan", "Insights")]].map(function(x){ return '<button class="chip' + (HV === x[0] ? ' on' : '') + '" data-hv="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>' +
    (D.set.vac && D.set.vac.to >= k ? '<div class="gwVac">🏖 ' + L("Mod cuti hingga ", "Vacation mode until ") + dLabel(D.set.vac.to) + ' <button class="chip" id="gwVacX">' + L("Tamat", "End") + '</button></div>' : '') + '</div>';
  if(HV === "rt") h += routinesHtml();
  else if(HV === "ins") h += insightsHtml(A);
  else { var list = HV === "all" ? A : A.filter(function(x){ return x.k === "quit" || hDue(x, k); });
    if(!A.length) h += empty("🌱", L("Mula kecil. Satu tabiat 2 minit lebih kuat daripada sepuluh rancangan besar.", "Start tiny. One 2-minute habit beats ten big plans."), '<button class="btn gold" id="gwHAdd2">＋ ' + L("Pilih daripada templat", "Pick from templates") + '</button>');
    else { var byA = {}; list.forEach(function(x){ (byA[x.area] = byA[x.area] || []).push(x); });
      h += AREAS.filter(function(a){ return byA[a[0]]; }).map(function(a){ return '<div class="card gwAc" style="--ac:' + a[4] + '"><div class="gwAh">' + a[1] + ' ' + E(L(a[2], a[3])) + '</div>' + byA[a[0]].map(function(x){ return x.k === "quit" ? quitRow(x) : hRow(x, k, true); }).join("") + '</div>'; }).join(""); }
    if(A.length) h += '<div class="card"><div class="btns" style="flex-wrap:wrap"><button class="chip" id="gwVac">🏖 ' + L("Mod cuti / sakit", "Vacation / sick mode") + '</button>' + (D.habits.some(function(x){ return x.arch; }) ? '<button class="chip" id="gwArc">🗄 ' + L("Arkib", "Archive") + '</button>' : '') + '</div><div class="mut tiny" style="margin-top:6px">❄ ' + L("Terlepas sehari? Baiki streak dengan ❄ (2 kali sebulan). Mod cuti menjeda semua tanpa memutuskan streak.", "Missed a day? Repair the streak with ❄ (twice a month). Vacation mode pauses everything without breaking streaks.") + '</div></div>'; }
  b.innerHTML = h; bindHabits(b);
  b.querySelectorAll("[data-hv]").forEach(function(x){ x.onclick = function(){ HV = x.getAttribute("data-hv"); redraw(); }; });
  ["#gwHAdd", "#gwHAdd2"].forEach(function(s){ var x = b.querySelector(s); if(x) x.onclick = habitPicker; });
  var vc = b.querySelector("#gwVac"); if(vc) vc.onclick = vacation; var vx = b.querySelector("#gwVacX"); if(vx) vx.onclick = function(){ db().set.vac = null; save(); redraw(); };
  var ar = b.querySelector("#gwArc"); if(ar) ar.onclick = archive;
  b.querySelectorAll("[data-urge]").forEach(function(x){ x.onclick = function(){ urge(hById(x.getAttribute("data-urge"))); }; });
  bindRoutines(b); }
function quitRow(h){ var d = streak(h), sv = (h.cost || 0) * d, nx = [1, 3, 7, 14, 30, 60, 90, 180, 365].filter(function(x){ return x > d; })[0] || d + 100;
  return '<div class="gwQuit"><div class="gwHx" data-hd="' + h.id + '"><b>' + E(h.ic + " " + h.name) + '</b><small>' + L("Sasaran seterusnya: ", "Next milestone: ") + nx + ' ' + L("hari", "days") + '</small></div><div class="gwQn"><b>' + d + '</b><small>' + L("hari bebas", "days clean") + '</small></div>' + (sv ? '<div class="gwQn"><b>RM' + sv + '</b><small>' + L("dijimat", "saved") + '</small></div>' : '') + '<button class="chip" data-urge="' + h.id + '">🌊</button></div>' + bar(d / nx, aCol(h.area)); }
function habitPicker(){ var tab = (db().set.focus || [])[0] || "health";
  var ov = sheet("＋ " + L("Tabiat baharu", "New habit"), '<button class="btn gold full" id="hpC">✏️ ' + L("Bina sendiri", "Make my own") + '</button><div class="gwQ">' + L("Atau pilih templat (satu ketik)", "Or pick a template (one tap)") + '</div><div class="rseg gwScroll" id="hpA"></div><div id="hpL"></div>' +
    '<div class="mut tiny" style="margin-top:8px">' + L("Air, tidur dan senaman dijejak dalam Masa › Gerak; amalan ibadah dalam Amalan › Amal.", "Water, sleep and workouts are tracked in Time › Move; worship deeds in Practice › Deeds.") + '</div>');
  var fill = function(){ ov.querySelector("#hpA").innerHTML = AREAS.map(function(a){ return '<button class="chip' + (tab === a[0] ? ' on' : '') + '" data-hpa="' + a[0] + '">' + a[1] + ' ' + E(L(a[2], a[3])) + '</button>'; }).join("");
    var T = HT.filter(function(t){ return t[0] === tab; }), have = db().habits.map(function(h){ return h.name; });
    ov.querySelector("#hpL").innerHTML = tab === "purpose" ? '<div class="gwLinkC"><div class="small">' + L("Matlamat ibadah (Al-Quran, Dhuha, sedekah, istighfar) sudah ada dalam Amalan › Amal, dengan peringatan dan laporan mingguan.", "Worship goals (Quran, Dhuha, charity, istighfar) already live in Practice › Deeds, with reminders and a weekly report.") + '</div><button class="chip" data-hside="sunat/amal">🌱 ' + L("Buka Amal", "Open Deeds") + ' ›</button></div>' :
      T.map(function(t, i){ var on = have.indexOf(L(t[2], t[3])) >= 0; return '<button class="gwTpl' + (on ? ' on' : '') + '" data-hpt="' + HT.indexOf(t) + '"' + (on ? ' disabled' : '') + '><span>' + t[1] + '</span><b>' + E(L(t[2], t[3])) + '</b><small>' + (t[4].k === "quit" ? L("Berhenti", "Quit") : t[4].tiny ? '💛 ' + E(L(t[4].tiny[0], t[4].tiny[1])) : '') + (on ? ' ✓' : '') + '</small></button>'; }).join("");
    ov.querySelectorAll("[data-hpa]").forEach(function(x){ x.onclick = function(){ tab = x.getAttribute("data-hpa"); fill(); }; });
    ov.querySelectorAll("[data-hside]").forEach(function(x){ x.onclick = function(){ H.closeOverlay(); H.openSide(x.getAttribute("data-hside")); }; });
    ov.querySelectorAll("[data-hpt]").forEach(function(x){ x.onclick = function(){ var h = mkHabit(HT[+x.getAttribute("data-hpt")]); db().habits.push(h); save(); H.toast("✓ " + h.name); x.classList.add("on"); x.disabled = true; redraw(); }; }); };
  fill(); ov.querySelector("#hpC").onclick = function(){ H.closeOverlay(); habitEdit(null); }; }
function habitEdit(h0){ var h = h0 ? JSON.parse(JSON.stringify(h0)) : {id:uid(), ic:"✨", name:"", area:(db().set.focus || ["health"])[0], k:"tick", n:1, fq:{t:"d"}, tiny:"", cue:"", why:"", rew:"", rem:"", log:{}, made:today()};
  var ov = sheet(h0 ? "✏️ " + L("Ubah tabiat", "Edit habit") : "✏️ " + L("Tabiat baharu", "New habit"), '<div id="heB"></div>');
  var draw_ = function(){ var f = h.fq || {t:"d"};
    ov.querySelector("#heB").innerHTML = '<div class="radd"><input id="heI" class="rin" style="max-width:56px;text-align:center" value="' + E(h.ic) + '"><input id="heN" class="rin" value="' + E(h.name) + '" placeholder="' + E(L("Nama tabiat", "Habit name")) + '"></div>' +
      '<div class="gwQ">' + L("Jenis", "Type") + '</div><div class="rseg">' + [["tick", "✓ " + L("Tanda", "Tick")], ["count", "🔢 " + L("Kira", "Count")], ["min", "⏱ " + L("Minit", "Minutes")], ["quit", "🚭 " + L("Berhenti", "Quit")]].map(function(t){ return '<button class="chip' + (h.k === t[0] ? ' on' : '') + '" data-hk="' + t[0] + '">' + t[1] + '</button>'; }).join("") + '</div>' +
      (h.k === "count" || h.k === "min" ? '<div class="gwGrid3"><label class="hfld">' + L("Sasaran sehari", "Daily target") + '<input id="heNn" type="number" class="rin" value="' + (h.n || 1) + '"></label>' + (h.k === "count" ? '<label class="hfld">' + L("Unit", "Unit") + '<input id="heU" class="rin" value="' + E(h.u ? L(h.u[0], h.u[1]) : "") + '" placeholder="' + E(L("cawan, ms, kali", "cups, pages, times")) + '"></label>' : '') + '</div>' : '') +
      (h.k === "quit" ? '<div class="gwGrid3"><label class="hfld">' + L("Bebas sejak", "Clean since") + '<input id="heSi" type="date" class="rin" value="' + E(h.since || today()) + '"></label><label class="hfld">' + L("RM sehari dijimat", "RM saved a day") + '<input id="heCo" type="number" class="rin" value="' + (h.cost || 0) + '"></label></div>' :
      '<div class="gwQ">' + L("Kekerapan", "How often") + '</div><div class="rseg">' + [["d", L("Setiap hari", "Every day")], ["w", L("X kali seminggu", "X times a week")], ["s", L("Hari dipilih", "Chosen days")]].map(function(t){ return '<button class="chip' + (f.t === t[0] ? ' on' : '') + '" data-hf="' + t[0] + '">' + t[1] + '</button>'; }).join("") + '</div>' +
      (f.t === "w" ? '<div class="rseg">' + [1, 2, 3, 4, 5, 6].map(function(n){ return '<button class="chip' + ((f.n || 3) === n ? ' on' : '') + '" data-hfn="' + n + '">' + n + '×</button>'; }).join("") + '</div>' : f.t === "s" ? '<div class="rseg">' + DAYS().map(function(d, i){ return '<button class="chip' + ((f.days || []).indexOf(i) >= 0 ? ' on' : '') + '" data-hfd="' + i + '">' + d + '</button>'; }).join("") + '</div>' : '') +
      '<div class="gwQ">↪ ' + L("Gandingan: selepas saya…", "Stack it: after I…") + '</div><input id="heC" class="rin" value="' + E(h.cue || "") + '" placeholder="' + E(L("cth. solat Subuh, minum kopi pagi", "e.g. pray Fajr, have my morning coffee")) + '">' +
      '<div class="gwQ">💛 ' + L("Versi 2 minit (untuk hari sukar)", "2-minute version (for hard days)") + '</div><input id="heT" class="rin" value="' + E(h.tiny || "") + '">' +
      '<div class="gwGrid3"><label class="hfld">⏰ ' + L("Peringatan", "Reminder") + '<input id="heR" type="time" class="rin" value="' + E(h.rem || "") + '"></label></div>') +
      '<div class="gwQ">' + L("Bahagian hidup", "Life area") + '</div><div class="rseg gwScroll">' + AREAS.map(function(a){ return '<button class="chip' + (h.area === a[0] ? ' on' : '') + '" data-har="' + a[0] + '">' + a[1] + ' ' + E(L(a[2], a[3])) + '</button>'; }).join("") + '</div>' +
      '<div class="gwQ">💭 ' + L("Kenapa ia penting", "Why it matters") + '</div><input id="heW" class="rin" value="' + E(h.why || "") + '"><div class="gwQ">🎁 ' + L("Ganjaran untuk diri", "My reward") + '</div><input id="heRw" class="rin" value="' + E(h.rew || "") + '" placeholder="' + E(L("cth. secawan teh kegemaran", "e.g. my favourite tea")) + '">' +
      '<div class="btns" style="margin-top:12px"><button class="btn gold" id="heS">' + L("Simpan", "Save") + '</button>' + (h0 ? '<button class="btn alt" id="heA">🗄</button><button class="btn alt" id="heD">🗑</button>' : '') + '</div>';
    var B = ov.querySelector("#heB");
    B.querySelectorAll("[data-hk]").forEach(function(x){ x.onclick = function(){ grab(); h.k = x.getAttribute("data-hk"); if(h.k === "min" && h.n < 2) h.n = 10; if(h.k === "quit" && !h.since) h.since = today(); draw_(); }; });
    B.querySelectorAll("[data-hf]").forEach(function(x){ x.onclick = function(){ grab(); h.fq = {t:x.getAttribute("data-hf"), n:3, days:[1, 3, 5]}; draw_(); }; });
    B.querySelectorAll("[data-hfn]").forEach(function(x){ x.onclick = function(){ grab(); h.fq.n = +x.getAttribute("data-hfn"); draw_(); }; });
    B.querySelectorAll("[data-hfd]").forEach(function(x){ x.onclick = function(){ grab(); var d = +x.getAttribute("data-hfd"), a = h.fq.days || []; h.fq.days = a.indexOf(d) >= 0 ? a.filter(function(y){ return y !== d; }) : a.concat([d]); draw_(); }; });
    B.querySelectorAll("[data-har]").forEach(function(x){ x.onclick = function(){ grab(); h.area = x.getAttribute("data-har"); draw_(); }; });
    B.querySelector("#heS").onclick = function(){ grab(); if(!h.name){ H.toast(L("Namakan tabiat", "Name the habit")); return; } var D = db(), i = D.habits.map(function(x){ return x.id; }).indexOf(h.id); if(i >= 0) D.habits[i] = h; else D.habits.push(h); save(); H.closeOverlay(); redraw(); };
    var a = B.querySelector("#heA"); if(a) a.onclick = function(){ grab(); h.arch = true; var D = db(), i = D.habits.map(function(x){ return x.id; }).indexOf(h.id); D.habits[i] = h; save(); H.closeOverlay(); H.toast("🗄 " + L("Diarkibkan. Sejarah disimpan.", "Archived. History kept.")); redraw(); };
    var dl = B.querySelector("#heD"); if(dl) dl.onclick = function(){ if(!confirm(L("Padam tabiat dan sejarahnya?", "Delete the habit and its history?"))) return; db().habits = db().habits.filter(function(x){ return x.id !== h.id; }); save(); H.closeOverlay(); redraw(); }; };
  var grab = function(){ var B = ov.querySelector("#heB"), q = function(s){ return B.querySelector(s); };
    if(q("#heI")) h.ic = q("#heI").value.trim() || "✨"; if(q("#heN")) h.name = q("#heN").value.trim(); if(q("#heNn")) h.n = Math.max(1, +q("#heNn").value || 1); if(q("#heU")){ var u = q("#heU").value.trim(); h.u = u ? [u, u] : null; }
    if(q("#heSi")) h.since = q("#heSi").value || today(); if(q("#heCo")) h.cost = +q("#heCo").value || 0; if(q("#heC")) h.cue = q("#heC").value.trim(); if(q("#heT")) h.tiny = q("#heT").value.trim(); if(q("#heR")) h.rem = q("#heR").value;
    if(q("#heW")) h.why = q("#heW").value.trim(); if(q("#heRw")) h.rew = q("#heRw").value.trim(); if(h.k === "tick") h.n = 1; };
  draw_(); }
function habitSheet(h){ if(!h) return; if(h.k === "quit"){ habitEdit(h); return; }
  var s = streak(h), r30 = rate(h, 30), best = Math.max(h.best || 0, s), wd = [0, 0, 0, 0, 0, 0, 0], wdn = [0, 0, 0, 0, 0, 0, 0];
  for(var i = 0; i < 120; i++){ var k = dAdd(today(), -i); if(h.made && k < h.made) break; if(!hDue(h, k)) continue; var g = dOf(k).getDay(); wdn[g]++; if(hDone(h, k)) wd[g]++; }
  var bw = -1, bv = -1; wd.forEach(function(v, j){ var f = wdn[j] ? v / wdn[j] : -1; if(f > bv){ bv = f; bw = j; } });
  var ov = sheet(E(h.ic + " " + h.name), '<div class="gwStats"><div><b>🔥 ' + s + '</b><small>' + L("streak", "streak") + '</small></div><div><b>🏅 ' + best + '</b><small>' + L("terbaik", "best") + '</small></div><div><b>' + Math.round(r30 * 100) + '%</b><small>' + L("30 hari", "30 days") + '</small></div><div><b>' + (bv > 0 ? DAYS()[bw] : "—") + '</b><small>' + L("hari terbaik", "best day") + '</small></div></div>' +
    heat(h) + (h.why ? '<div class="gwWhy">💭 ' + E(h.why) + '</div>' : '') + (h.cue ? '<div class="small">↪ ' + L("Selepas ", "After ") + E(h.cue) + ', ' + L("saya akan ", "I will ") + E(h.name.toLowerCase()) + '</div>' : '') + (h.tiny ? '<div class="small">💛 ' + E(h.tiny) + '</div>' : '') +
    '<div class="btns" style="margin-top:12px"><button class="btn alt" id="hsE">✏️ ' + L("Ubah", "Edit") + '</button></div>');
  if(best > (h.best || 0)){ h.best = best; H.save(KEY, db()); }
  ov.querySelector("#hsE").onclick = function(){ H.closeOverlay(); habitEdit(h); };
  ov.querySelectorAll("[data-hk2]").forEach(function(x){ x.onclick = function(){ var k = x.getAttribute("data-hk2"); if(k > today()) return; hTap(h, k); x.className = "gwHc l" + (hDone(h, k) ? 4 : 0); }; }); }
function heat(h){ var end = today(), st = dAdd(monOf(end), -7 * 25), cells = '', k = dAdd(st, -1); // 26 weeks; tap a day to fix it
  for(var i = 0; i < 26 * 7; i++){ k = dAdd(st, i); var f = k > end ? -1 : hDone(h, k) ? 4 : hVal(h, k) ? Math.max(1, Math.round(hVal(h, k) / (h.n || 1) * 3)) : 0; cells += '<i class="gwHc l' + (f < 0 ? 'x' : f) + '" data-hk2="' + k + '" title="' + k + '"></i>'; }
  return '<div class="gwQ">' + L("6 bulan terakhir (ketik hari untuk betulkan)", "Last 6 months (tap a day to fix it)") + '</div><div class="gwHeat">' + cells + '</div>'; }
function insightsHtml(A){ var T = A.filter(function(h){ return h.k !== "quit"; }); if(!T.length) return empty("📊", L("Wawasan muncul selepas beberapa hari menanda.", "Insights appear after a few days of ticking."));
  var rs = T.map(function(h){ return {h:h, r:rate(h, 30)}; }).sort(function(a, b){ return b.r - a.r; }), wd = [0, 0, 0, 0, 0, 0, 0], wn = [0, 0, 0, 0, 0, 0, 0];
  for(var i = 0; i < 60; i++){ var k = dAdd(today(), -i), g = dOf(k).getDay(); T.forEach(function(h){ if(h.made && k < h.made) return; if(hDue(h, k)){ wn[g]++; if(hDone(h, k)) wd[g]++; } }); }
  var pairs = []; for(var a = 0; a < T.length; a++) for(var c = a + 1; c < T.length; c++){ var both = 0, any = 0; for(var j = 0; j < 30; j++){ var kk = dAdd(today(), -j), x = hDone(T[a], kk), y = hDone(T[c], kk); if(x || y) any++; if(x && y) both++; } if(any >= 5) pairs.push({a:T[a], b:T[c], f:both / any}); }
  pairs.sort(function(p, q){ return q.f - p.f; });
  return '<div class="card"><h3>📊 ' + L("Kadar selesai (30 hari)", "Completion rate (30 days)") + '</h3>' + rs.map(function(x){ return '<div class="gwIr"><span>' + E(x.h.ic + " " + x.h.name) + '</span><b>' + Math.round(x.r * 100) + '%</b></div>' + bar(x.r, aCol(x.h.area)); }).join("") + '</div>' +
    '<div class="card"><h3>📅 ' + L("Hari terbaik dalam seminggu", "Best day of the week") + '</h3><div class="gwBars">' + DAYS().map(function(d, j){ var f = wn[j] ? wd[j] / wn[j] : 0; return '<div><i style="height:' + Math.max(4, Math.round(f * 100)) + '%"></i><small>' + d + '</small></div>'; }).join("") + '</div></div>' +
    (pairs.length && pairs[0].f >= 0.5 ? '<div class="card"><h3>🤝 ' + L("Tabiat yang berjaya bersama", "Habits that succeed together") + '</h3>' + pairs.slice(0, 3).map(function(p){ return '<div class="small">' + E(p.a.ic + " " + p.a.name) + ' + ' + E(p.b.ic + " " + p.b.name) + ' · ' + Math.round(p.f * 100) + '%</div>'; }).join("") + '<div class="mut tiny" style="margin-top:6px">' + L("Gandingkan mereka dalam satu rutin.", "Chain them in one routine.") + '</div></div>' : ''); }
function vacation(){ var v = db().set.vac || {from:today(), to:dAdd(today(), 7)};
  var ov = sheet("🏖 " + L("Mod cuti / sakit", "Vacation / sick mode"), '<div class="mut small">' + L("Tabiat dijeda dan streak tidak putus. Untuk musafir, sakit atau cuti.", "Habits pause and streaks don't break. For travel, illness or a break.") + '</div><div class="gwGrid3"><label class="hfld">' + L("Dari", "From") + '<input type="date" id="vF" class="rin" value="' + v.from + '"></label><label class="hfld">' + L("Hingga", "Until") + '<input type="date" id="vT" class="rin" value="' + v.to + '"></label></div><button class="btn gold full" id="vS" style="margin-top:10px">' + L("Hidupkan", "Turn on") + '</button>');
  ov.querySelector("#vS").onclick = function(){ db().set.vac = {from:ov.querySelector("#vF").value || today(), to:ov.querySelector("#vT").value || today()}; save(); H.closeOverlay(); redraw(); }; }
function archive(){ var A = db().habits.filter(function(h){ return h.arch; });
  var ov = sheet("🗄 " + L("Arkib", "Archive"), A.map(function(h){ return '<div class="set"><span>' + E(h.ic + " " + h.name) + '</span><button class="chip" data-un="' + h.id + '">↩ ' + L("Pulihkan", "Restore") + '</button></div>'; }).join(""));
  ov.querySelectorAll("[data-un]").forEach(function(x){ x.onclick = function(){ hById(x.getAttribute("data-un")).arch = false; save(); H.closeOverlay(); redraw(); }; }); }
// routines: morning / evening sequences played step by step with a timer
var RT_TPL = [["🌅","Pagi berkat","Blessed morning",[["Solat Subuh & zikir","Fajr & zikir",10],["Minum segelas air","A glass of water",1],["Regangan","Stretch",5],["Mandi & berpakaian","Shower & dress",10],["Semak 3 utama","Check the top 3",2]]],
  ["🌙","Malam tenang","Calm night",[["Kemas 10 minit","10-minute tidy",10],["Gosok gigi & flos","Brush & floss",4],["Rutin kulit","Skincare",3],["Muhasabah & syukur","Reflect & give thanks",3],["Zikir sebelum tidur","Bedtime zikir",5]]],
  ["💼","Tutup kerja","Work shutdown",[["Senaraikan kerja belum siap","List unfinished work",3],["Rancang 3 utama esok","Plan tomorrow's top 3",3],["Kemas meja","Clear the desk",2],["Tutup e-mel & notifikasi kerja","Close email and work alerts",1]]]];
function routinesHtml(){ var R = db().routines;
  return '<div class="card"><div class="row"><h3 style="margin:0">▶ ' + L("Rutin", "Routines") + '</h3><button class="chip" id="rtNew">＋</button></div><div class="mut tiny" style="margin:2px 0 8px">' + L("Urutan langkah dengan pemasa. Satu ketik untuk mula.", "A sequence of steps with timers. One tap to start.") + '</div>' +
    R.map(function(r, i){ var m = r.steps.reduce(function(a, s){ return a + (+s.m || 0); }, 0); return '<div class="gwRt"><span class="gwRtI">' + E(r.ic) + '</span><div class="gwHx" data-rte="' + i + '"><b>' + E(r.name) + '</b><small>' + r.steps.length + ' ' + L("langkah", "steps") + ' · ' + m + ' min' + (r.last ? ' · ✓ ' + dLabel(r.last) : '') + '</small></div><button class="btn gold" data-rtp="' + i + '">▶</button></div>'; }).join("") +
    '<div class="fotpl">' + RT_TPL.filter(function(t){ return !R.some(function(r){ return r.name === L(t[1], t[2]); }); }).map(function(t){ return '<button class="chip" data-rtt="' + RT_TPL.indexOf(t) + '">' + t[0] + ' ' + E(L(t[1], t[2])) + '</button>'; }).join("") + '</div></div>'; }
function bindRoutines(b){ var R = db().routines;
  b.querySelectorAll("[data-rtt]").forEach(function(x){ x.onclick = function(){ var t = RT_TPL[+x.getAttribute("data-rtt")]; R.push({id:uid(), ic:t[0], name:L(t[1], t[2]), steps:t[3].map(function(s){ return {t:L(s[0], s[1]), m:s[2]}; })}); save(); redraw(); }; });
  var nw = b.querySelector("#rtNew"); if(nw) nw.onclick = function(){ rtEdit(-1); };
  b.querySelectorAll("[data-rte]").forEach(function(x){ x.onclick = function(){ rtEdit(+x.getAttribute("data-rte")); }; });
  b.querySelectorAll("[data-rtp]").forEach(function(x){ x.onclick = function(){ rtPlay(R[+x.getAttribute("data-rtp")]); }; }); }
function rtEdit(i){ var R = db().routines, r = i >= 0 ? JSON.parse(JSON.stringify(R[i])) : {id:uid(), ic:"▶", name:"", steps:[{t:"", m:5}]};
  var ov = sheet("▶ " + L("Rutin", "Routine"), '<div class="radd"><input id="reI" class="rin" style="max-width:56px;text-align:center" value="' + E(r.ic) + '"><input id="reN" class="rin" value="' + E(r.name) + '" placeholder="' + E(L("Nama rutin", "Routine name")) + '"></div><div id="reS"></div><button class="chip" id="reA" style="margin-top:6px">＋ ' + L("Langkah", "Step") + '</button><div class="btns" style="margin-top:12px"><button class="btn gold" id="reOk">' + L("Simpan", "Save") + '</button>' + (i >= 0 ? '<button class="btn alt" id="reD">🗑</button>' : '') + '</div>');
  var grab = function(){ r.steps = []; ov.querySelectorAll(".reRow").forEach(function(x){ var t = x.querySelector(".reT").value.trim(); if(t) r.steps.push({t:t, m:+x.querySelector(".reM").value || 0}); }); };
  var fill = function(){ ov.querySelector("#reS").innerHTML = r.steps.map(function(s){ return '<div class="radd reRow"><input class="rin reT" value="' + E(s.t) + '" placeholder="' + E(L("Langkah", "Step")) + '"><input class="rin reM" type="number" style="max-width:70px" value="' + (s.m || 0) + '"><span class="mut small">min</span></div>'; }).join(""); };
  fill(); ov.querySelector("#reA").onclick = function(){ grab(); r.steps.push({t:"", m:5}); fill(); };
  ov.querySelector("#reOk").onclick = function(){ grab(); r.ic = ov.querySelector("#reI").value || "▶"; r.name = ov.querySelector("#reN").value.trim() || L("Rutin saya", "My routine"); if(!r.steps.length) return; if(i >= 0) R[i] = r; else R.push(r); save(); H.closeOverlay(); redraw(); };
  var d = ov.querySelector("#reD"); if(d) d.onclick = function(){ R.splice(i, 1); save(); H.closeOverlay(); redraw(); }; }
function rtPlay(r){ var i = 0, end = 0, t = null, pausedLeft = 0;
  var ov = document.createElement("div"); ov.className = "gwPlay gwNoSw"; document.body.appendChild(ov);
  var close = function(){ clearInterval(t); ov.remove(); redraw(); };
  var startStep = function(){ end = Date.now() + (r.steps[i].m || 0) * 60000; pausedLeft = 0; paint(); };
  var paint = function(){ var s = r.steps[i], left = pausedLeft || Math.max(0, end - Date.now()), sec = Math.round(left / 1000), tot = (s.m || 0) * 60000;
    ov.innerHTML = '<button class="gwPx" id="rpX">✕</button><div class="gwPc"><div class="mut small">' + E(r.ic + " " + r.name) + ' · ' + (i + 1) + ' / ' + r.steps.length + '</div><h2>' + E(s.t) + '</h2>' +
      (tot ? ring(tot ? left / tot : 0, 200, "var(--gold)", Math.floor(sec / 60) + ":" + pad(sec % 60)) : '<div style="height:40px"></div>') +
      '<div class="gwDots">' + r.steps.map(function(x, j){ return '<i class="' + (j < i ? 'ok' : j === i ? 'on' : '') + '"></i>'; }).join("") + '</div>' +
      '<div class="btns"><button class="btn alt" id="rpP">' + (pausedLeft ? '▶' : '⏸') + '</button><button class="btn gold" id="rpN">' + (i < r.steps.length - 1 ? L("Selesai, seterusnya", "Done, next") + ' ›' : '🏁 ' + L("Tamat rutin", "Finish routine")) + '</button></div></div>';
    ov.querySelector("#rpX").onclick = close;
    ov.querySelector("#rpP").onclick = function(){ if(pausedLeft){ end = Date.now() + pausedLeft; pausedLeft = 0; } else pausedLeft = Math.max(1, end - Date.now()); paint(); };
    ov.querySelector("#rpN").onclick = function(){ if(i < r.steps.length - 1){ i++; startStep(); } else { r.last = today(); save(); close(); celebrate(L("Rutin selesai!", "Routine done!")); } }; };
  startStep(); t = setInterval(function(){ if(!document.body.contains(ov)){ clearInterval(t); return; } if(!pausedLeft && r.steps[i].m && Date.now() >= end && !ov._buzz){ ov._buzz = 1; try{ if(N().vibrate) N().vibrate(300); }catch(e){} } if(Date.now() < end) ov._buzz = 0; if(!pausedLeft) paint(); }, 1000); }

// ---------- Me ----------
function pMe(b){ var D = db(), a = xpAll(), lv = level(a.xp), B = badges(), pts = pointsLeft(), W = D.wheel, cur = W[W.length - 1], first = W[0];
  var h = '<div class="card gwLv"><div class="gwLvT">' + ring(lv.f, 96, "var(--gold)", "⭐" + lv.l) + '<div><h3 style="margin:0">' + L("Tahap ", "Level ") + lv.l + '</h3><div class="small">' + a.xp + ' XP · ' + L(lv.next + " lagi ke tahap " + (lv.l + 1), lv.next + " to level " + (lv.l + 1)) + '</div><div class="mut tiny">🪙 ' + pts + ' ' + L("mata untuk ganjaran", "points for rewards") + '</div></div></div>' +
    '<div class="gwBadges">' + B.map(function(x){ return '<div class="gwBd' + (x.on ? ' on' : '') + '" title="' + E(L(x.b[2], x.b[3])) + '"><span>' + x.b[1] + '</span><small>' + E(L(x.b[2], x.b[3])) + '</small></div>'; }).join("") + '</div></div>';
  // life wheel
  h += '<div class="card"><div class="row"><h3 style="margin:0">🎡 ' + L("Roda kehidupan", "Life wheel") + '</h3><button class="chip" id="gwWh">' + (cur ? '↻ ' + L("Nilai semula", "Re-rate") : '＋ ' + L("Nilai", "Rate")) + '</button></div>' +
    (cur ? radar(cur.v, first !== cur ? first.v : null) + '<div class="mut tiny" style="text-align:center">' + (first !== cur ? L("Garis putus: ", "Dashed: ") + dLabel(first.d) + ' · ' : '') + L("Terkini: ", "Latest: ") + dLabel(cur.d) + ' · ' + L("Purata ", "Average ") + (cur.v.reduce(function(x, y){ return x + y; }, 0) / 8).toFixed(1) + '</div>' + lowest(cur.v) : '<div class="mut small">' + L("Nilai 8 bahagian hidup untuk melihat di mana untuk bermula.", "Rate 8 areas of life to see where to start.") + '</div>') + '</div>';
  // weekly scorecard
  var wks = []; for(var i = 3; i >= 0; i--){ var m = dAdd(monOf(today()), -7 * i); wks.push({m:m, s:weekStats(m)}); }
  h += '<div class="card"><h3>📈 ' + L("Kad skor mingguan", "Weekly scorecard") + '</h3><div class="gwSc"><div class="gwScH"><span></span>' + wks.map(function(w){ return '<small>' + dLabel(w.m) + '</small>'; }).join("") + '</div>' +
    [["🔁", L("Tabiat", "Habits"), function(s){ return Math.round(s.hab * 100) + "%"; }], ["⏱", L("Fokus", "Focus"), function(s){ return Math.round(s.fo / 6) / 10 + L("j", "h"); }], ["⭐", L("Utama", "Top 3"), function(s){ return s.top; }], ["🙂", L("Perasaan", "Mood"), function(s){ return s.mood ? MOODS[Math.round(s.mood) - 1][0] : "—"; }], ["🧭", L("Semakan", "Review"), null]].map(function(r){ return '<div class="gwScR"><span>' + r[0] + ' ' + r[1] + '</span>' + wks.map(function(w){ return '<b>' + (r[2] ? r[2](w.s) : (D.rev[w.m] ? "✓" : "·")) + '</b>'; }).join("") + '</div>'; }).join("") + '</div></div>';
  // rewards store
  h += '<div class="card"><div class="row"><h3 style="margin:0">🎁 ' + L("Kedai ganjaran saya", "My rewards store") + '</h3><button class="chip" id="gwRwA">＋</button></div><div class="mut tiny" style="margin:2px 0 6px">' + L("Tetapkan hadiah sendiri dan tebus dengan mata.", "Set your own prizes and spend points on them.") + '</div>' +
    (D.rewards.length ? D.rewards.map(function(r, i){ return '<div class="set"><span>' + E(r.ic + " " + r.n) + ' <small class="mut">🪙 ' + r.c + '</small></span><span><button class="chip" data-rwb="' + i + '"' + (pts < r.c ? ' disabled' : '') + '>' + L("Tebus", "Redeem") + '</button> <button class="chip" data-rwx="' + i + '">✕</button></span></div>'; }).join("") : '<div class="fotpl">' + [["☕", "Kopi di kafe kegemaran", "Coffee at my favourite cafe", 300], ["📚", "Buku baharu", "A new book", 1200], ["🎮", "1 jam permainan tanpa rasa bersalah", "1 guilt-free hour of games", 500], ["🍰", "Pencuci mulut istimewa", "A special dessert", 400]].map(function(r, i){ return '<button class="chip" data-rwt="' + i + '">' + r[0] + ' ' + E(L(r[1], r[2])) + ' · ' + r[3] + '</button>'; }).join("") + '</div>') +
    (D.spent.length ? '<div class="mut tiny" style="margin-top:6px">' + L("Ditebus: ", "Redeemed: ") + D.spent.slice(-4).reverse().map(function(s){ return E(s.n) + ' (' + dLabel(s.d) + ')'; }).join(", ") + '</div>' : '') + '</div>';
  // reviews history
  var RV = Object.keys(D.rev).sort().reverse(); if(RV.length) h += '<div class="card"><h3>🧭 ' + L("Semakan lepas", "Past reviews") + '</h3>' + RV.slice(0, 6).map(function(k){ var r = D.rev[k]; return '<details class="gwRv"><summary>' + L("Minggu ", "Week of ") + dLabel(k) + ' · ' + Math.round((r.hab || 0) * 100) + '%</summary>' + [["🏆", r.wins], ["🌧", r.miss], ["💡", r.lesson], ["🔧", r.chg]].filter(function(x){ return x[1]; }).map(function(x){ return '<div class="small">' + x[0] + ' ' + E(x[1]) + '</div>'; }).join("") + '</details>'; }).join("") + '</div>';
  // year in colours (mood)
  h += moodYear();
  // settings: areas, reminders
  var ar = D.set.areas, rem = D.set.rem;
  h += '<div class="card"><h3>⚙️ ' + L("Tetapan", "Settings") + '</h3><div class="gwQ">' + L("Bahagian hidup yang ditunjukkan (yang lain disembunyikan dalam Bina diri)", "Life areas shown (others stay hidden in Grow)") + '</div><div class="gwAreas sm">' + AREAS.map(function(a){ return '<button class="gwAreaB' + (areaOn(a[0]) ? ' on' : '') + '" style="--ac:' + a[4] + '" data-aon="' + a[0] + '">' + a[1] + '<small>' + E(L(a[2], a[3])) + '</small></button>'; }).join("") + '</div>' +
    '<div class="gwQ">⏰ ' + L("Peringatan", "Reminders") + '</div><label class="set"><span>🌅 ' + L("Niat pagi", "Morning intention") + '</span><input type="time" id="rAm" class="rin" style="max-width:120px" value="' + E(rem.am || "") + '"></label><label class="set"><span>🌙 ' + L("Semakan malam", "Evening review") + '</span><input type="time" id="rPm" class="rin" style="max-width:120px" value="' + E(rem.pm || "") + '"></label><label class="set"><span>🧭 ' + L("Semakan mingguan (Ahad 8:30 malam)", "Weekly review (Sunday 8:30 pm)") + '</span><input type="checkbox" id="rWk"' + (rem.wk ? ' checked' : '') + '></label>' +
    '<div class="mut tiny" style="margin-top:8px">🔒 ' + L("Semua data kekal di telefon ini. Sandaran: Tetapan › Sandaran & pulih. Kunci aplikasi: Tetapan › Khas.", "All data stays on this phone. Backup: Settings › Backup & restore. App lock: Settings › Special.") + '</div></div>';
  h += elsewhere();
  b.innerHTML = h;
  b.querySelector("#gwWh").onclick = wheelSheet;
  b.querySelectorAll("[data-aon]").forEach(function(x){ x.onclick = function(){ var k = x.getAttribute("data-aon"), A = db().set.areas; if(!Object.keys(A).length) AREAS.forEach(function(a){ A[a[0]] = true; }); A[k] = !(A[k] !== false); save(); redraw(); }; });
  b.querySelector("#rAm").onchange = function(){ rem.am = this.value; save(); }; b.querySelector("#rPm").onchange = function(){ rem.pm = this.value; save(); }; b.querySelector("#rWk").onchange = function(){ rem.wk = this.checked; save(); };
  var ra = b.querySelector("#gwRwA"); ra.onclick = function(){ rewardAdd(null); };
  b.querySelectorAll("[data-rwt]").forEach(function(x){ var r = [["☕", "Kopi di kafe kegemaran", "Coffee at my favourite cafe", 300], ["📚", "Buku baharu", "A new book", 1200], ["🎮", "1 jam permainan tanpa rasa bersalah", "1 guilt-free hour of games", 500], ["🍰", "Pencuci mulut istimewa", "A special dessert", 400]][+x.getAttribute("data-rwt")]; x.onclick = function(){ db().rewards.push({ic:r[0], n:L(r[1], r[2]), c:r[3]}); save(); redraw(); }; });
  b.querySelectorAll("[data-rwb]").forEach(function(x){ x.onclick = function(){ var r = db().rewards[+x.getAttribute("data-rwb")]; if(pointsLeft() < r.c) return; db().spent.push({n:r.n, c:r.c, d:today()}); save(); celebrate("🎁 " + L("Nikmati: ", "Enjoy: ") + r.n); redraw(); }; });
  b.querySelectorAll("[data-rwx]").forEach(function(x){ x.onclick = function(){ db().rewards.splice(+x.getAttribute("data-rwx"), 1); save(); redraw(); }; });
  b.querySelectorAll("[data-side]").forEach(function(x){ x.onclick = function(){ H.openSide(x.getAttribute("data-side")); }; }); }
function rewardAdd(){ var ov = sheet("🎁 " + L("Ganjaran", "Reward"), '<div class="radd"><input id="rwI" class="rin" style="max-width:56px;text-align:center" value="🎁"><input id="rwN" class="rin" placeholder="' + E(L("Hadiah", "Prize")) + '"></div><label class="hfld">🪙 ' + L("Kos (mata)", "Cost (points)") + '<input id="rwC" type="number" class="rin" value="500"></label><button class="btn gold full" id="rwS" style="margin-top:10px">' + L("Simpan", "Save") + '</button>');
  ov.querySelector("#rwS").onclick = function(){ var n = ov.querySelector("#rwN").value.trim(); if(!n) return; db().rewards.push({ic:ov.querySelector("#rwI").value || "🎁", n:n, c:Math.max(1, +ov.querySelector("#rwC").value || 100)}); save(); H.closeOverlay(); redraw(); }; }
function radar(v, v0){ var S = 260, c = S / 2, R = 92, pt = function(i, x){ var a = -Math.PI / 2 + i * Math.PI / 4, r = R * x / 10; return [c + r * Math.cos(a), c + r * Math.sin(a)]; };
  var poly = function(vv){ return vv.map(function(x, i){ return pt(i, x).map(function(n){ return n.toFixed(1); }).join(","); }).join(" "); };
  var g = [2, 4, 6, 8, 10].map(function(l){ return '<polygon points="' + poly([l, l, l, l, l, l, l, l]) + '" fill="none" stroke="var(--line)" stroke-width="1"/>'; }).join("");
  var ax = AREAS.map(function(a, i){ var p = pt(i, 10), q = pt(i, 12.2); return '<line x1="' + c + '" y1="' + c + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="var(--line)"/><text x="' + q[0].toFixed(1) + '" y="' + q[1].toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="16">' + a[1] + '</text><circle cx="' + pt(i, v[i])[0].toFixed(1) + '" cy="' + pt(i, v[i])[1].toFixed(1) + '" r="4" fill="' + a[4] + '"/>'; }).join("");
  return '<svg class="gwRadar" viewBox="0 0 ' + S + ' ' + S + '">' + g + ax + (v0 ? '<polygon points="' + poly(v0) + '" fill="none" stroke="var(--mut)" stroke-dasharray="4 4" stroke-width="1.5"/>' : '') + '<polygon points="' + poly(v) + '" fill="rgba(201,166,70,.22)" stroke="var(--gold)" stroke-width="2"/></svg>'; }
function lowest(v){ var i = v.indexOf(Math.min.apply(null, v)), a = AREAS[i]; return '<div class="gwNudge" style="margin-top:8px"><span>' + a[1] + '</span><div class="small">' + L("Mulakan dengan <b>" + E(a[2]) + "</b> (" + v[i] + "/10). Satu tabiat kecil di sini memberi kesan paling besar.", "Start with <b>" + E(a[3]) + "</b> (" + v[i] + "/10). One small habit here makes the biggest difference.") + '</div></div>'; }
function wheelSheet(){ var W = db().wheel, v = (W[W.length - 1] || {v:[5, 5, 5, 5, 5, 5, 5, 5]}).v.slice();
  var ov = sheet("🎡 " + L("Roda kehidupan", "Life wheel"), '<div class="gwQ">' + L("Sejujurnya, 1 hingga 10", "Honestly, 1 to 10") + '</div>' + AREAS.map(function(a, i){ return '<div class="gwSl" style="--ac:' + a[4] + '"><span>' + a[1] + ' ' + E(L(a[2], a[3])) + '</span><input type="range" min="1" max="10" value="' + v[i] + '" data-wv="' + i + '"><b>' + v[i] + '</b></div>'; }).join("") + '<button class="btn gold full" id="whS" style="margin-top:10px">' + L("Simpan", "Save") + '</button><div class="mut tiny" style="margin-top:6px">' + L("Nilai semula setiap bulan untuk melihat perubahan.", "Re-rate every month to see the change.") + '</div>');
  ov.querySelectorAll("[data-wv]").forEach(function(r){ r.oninput = function(){ v[+r.getAttribute("data-wv")] = +r.value; r.nextSibling.textContent = r.value; }; });
  ov.querySelector("#whS").onclick = function(){ var D = db(); if(D.wheel.length && D.wheel[D.wheel.length - 1].d === today()) D.wheel.pop(); D.wheel.push({d:today(), v:v}); D.set.onb = 1; save(); H.closeOverlay(); redraw(); }; }
function moodYear(){ var D = db().day, ks = Object.keys(D).filter(function(k){ return D[k].mood; }); if(ks.length < 3) return '';
  var y = new Date().getFullYear(), st = y + "-01-01", n = diffD(st, y + "-12-31") + 1, C = ["#5a3a4a", "#8a5a5a", "#7a7a5a", "#3f8f6a", "#2fbf7f"], cells = '', low = 0, cnt = 0;
  for(var i = 0; i < n; i++){ var k = dAdd(st, i), m = (D[k] || {}).mood; cells += '<i style="background:' + (m ? C[m - 1] : 'var(--card2)') + '"></i>'; }
  for(var j = 0; j < 14; j++){ var mm = (D[dAdd(today(), -j)] || {}).mood; if(mm){ cnt++; if(mm <= 2) low++; } }
  return '<div class="card"><h3>🎨 ' + L("Tahun dalam warna", "Year in colours") + ' ' + y + '</h3><div class="gwYear">' + cells + '</div><div class="mut tiny">' + MOODS.map(function(m, i){ return '<span style="color:' + C[i] + '">■</span> ' + m[0]; }).join(" ") + '</div>' +
    (cnt >= 7 && low / cnt >= 0.6 ? '<div class="gwHelp">💚 ' + L("Perasaan anda rendah sejak beberapa minggu. Anda tidak perlu menanggungnya seorang diri. Bercakap dengan seseorang yang dipercayai, atau hubungi Befrienders (03-7627 2929, 24 jam) atau Talian Kasih 15999.", "Your mood has been low for a few weeks. You don't have to carry it alone. Talk to someone you trust, or call Befrienders (03-7627 2929, 24 hours) or Talian Kasih 15999.") + '</div>' : '') + '</div>'; }
// what My Ihsan already does elsewhere (not repeated here)
var ELSEWHERE = [["cal/senaman","🏃","Air, tidur, senaman, langkah","Water, sleep, workouts, steps"],["cal/bulan","📝","Senarai tugasan harian–tahunan, jurnal Muhasabah","Daily to yearly to-do lists, Muhasabah journal"],["cal/statistik","📊","Masa skrin & laporan mingguan","Screen time & weekly report"],
  ["fin/belanja","💸","Bajet, belanja, simpanan","Budget, spending, savings"],["fin/komitmen","📆","Bil & komitmen bulanan","Bills & monthly commitments"],["fin/hutang","🤝","Hutang & pelan bayar","Debts & payoff plan"],
  ["sunat/amal","🌱","Matlamat ibadah harian","Daily worship goals"],["sunat/quran","📖","Pelan bacaan Al-Quran","Quran reading plan"],["solat/zikir","📿","Kaunter zikir","Zikir counter"],["cal/puasa","🍽","Puasa sunat & ganti","Voluntary & make-up fasts"],
  ["alat/keluarga","👨‍👩‍👧","Hari lahir, salasilah, Jaga (warga emas), Bayi","Birthdays, family tree, Care (elders), Baby"],["alat/kumpulan","👥","Kalendar & notis keluarga","Family calendar & notices"],["learn/buku","📚","Buku & sorotan","Books & highlights"],["alat/nota","✍️","Nota & senarai","Notes & lists"]];
function elsewhere(){ return '<div class="card"><h3>🧩 ' + L("Juga dalam My Ihsan", "Also in My Ihsan") + '</h3><div class="mut tiny" style="margin-bottom:6px">' + L("Sudah ada di tempat lain, jadi tidak diulang di sini.", "Already elsewhere in the app, so not repeated here.") + '</div><div class="gwElse">' + ELSEWHERE.map(function(x){ return '<button data-side="' + x[0] + '"><span>' + x[1] + '</span><small>' + E(L(x[2], x[3])) + '</small></button>'; }).join("") + '</div></div>'; }

// API for the Grow tools file
var API = {db:db, save:save, today:today, dAdd:dAdd, diffD:diffD, dOf:dOf, dLabel:dLabel, uid:uid, ring:ring, bar:bar, empty:empty, celebrate:celebrate, share:share, areaOn:areaOn, AREAS:AREAS, aCol:aCol, redraw:function(){ redraw(); }, MOODS:MOODS, habits:function(){ return db().habits; }, hDone:hDone, pad:pad};
window.GrowView = {view:view, _t:{db:db, reset:function(){ G = null; PG = null; }, streak:streak, hDone:hDone, hDue:hDue, gProg:gProg, xpAll:xpAll, level:level, sched:sched, weekStats:weekStats, canRepair:canRepair, monOf:monOf}};
})();
