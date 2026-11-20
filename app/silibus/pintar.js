/* My Ihsan 0.5.23 Sekolah engine add-on (loaded after the engine script):
   1. Daily activity per child: silibus.<anak>.hari = {"YYYY-MM-DD": {j: answers checked, b: right first time, n: notes read, s: seconds, x: game XP}}
      (read by Learn › School for the parent weekly report, XP and streak, and the daily path).
   2. 🎯 Smart practice (Pandai style): 10 questions picked mostly from the topics this child gets wrong most, plus ones never tried. */
(function(){ "use strict";
if(typeof ANAK === "undefined" || typeof simpan === "undefined") return;
var KH = "silibus." + ANAK + ".hari";
function today(){ var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function hari(){ var o = {}; try{ o = JSON.parse(localStorage.getItem(KH) || "{}") || {}; }catch(e){} return o; }
function bump(k, n){ if(!n) return; var o = hari(), t = today(); o[t] = o[t] || {}; o[t][k] = (o[t][k] || 0) + n;
  var ks = Object.keys(o).sort(); if(ks.length > 120) ks.slice(0, ks.length - 120).forEach(function(x){ delete o[x]; });
  try{ localStorage.setItem(KH, JSON.stringify(o)); }catch(e){} }
function counts(){ var j = 0, b = 0, n = 0, x = 0;
  Object.keys(simpan).forEach(function(tid){ var r = simpan[tid]; if(!r || typeof r !== "object") return;
    if(tid === "__main"){ x = r.xp || 0; return; }
    if(r.pertama) Object.keys(r.pertama).forEach(function(q){ j++; if(r.pertama[q]) b++; });
    if(r.baca) n++; });
  return {j: j, b: b, n: n, x: x}; }
var last = counts();
var tulis0 = window.tulis;
if(typeof tulis0 === "function") window.tulis = function(){ var r = tulis0.apply(this, arguments);
  try{ var c = counts(); if(MOD !== "ujian"){ bump("j", Math.max(0, c.j - last.j)); bump("b", Math.max(0, c.b - last.b)); bump("n", Math.max(0, c.n - last.n)); } bump("x", Math.max(0, c.x - last.x)); last = c; }catch(e){}
  return r; };
// time spent: counted while the page is visible
setInterval(function(){ if(!document.hidden) bump("s", 15); }, 15000);

// ---------- smart practice ----------
function qTopic(){ var m = {}; (DATA.subjek[0].topik || []).forEach(function(t){ (t.soalan || []).forEach(function(q){ m[q.id] = t.id; }); }); return m; }
function weakness(){ var map = qTopic(), w = {};
  (DATA.subjek[0].topik || []).forEach(function(t){ w[t.id] = {r: 0, a: 0}; });
  Object.keys(simpan).forEach(function(tid){ var r = simpan[tid]; if(!r || !r.pertama) return;
    Object.keys(r.pertama).forEach(function(qid){ var t = map[qid]; if(!t || !w[t]) return; w[t].a++; if(r.pertama[qid]) w[t].r++; }); });
  return w; }
function seenFirst(){ var s = {}; Object.keys(simpan).forEach(function(tid){ var r = simpan[tid]; if(r && r.pertama) Object.keys(r.pertama).forEach(function(q){ s[q] = r.pertama[q]; }); }); return s; }
function buildPintar(){ var T = (DATA.subjek[0].topik || []).filter(function(t){ return (t.soalan || []).length && !(t.uj && t.uj.lisan); }), w = weakness(), seen = seenFirst();
  if(!T.length) return null;
  // weight: accuracy below 100% weighs more; untried topics weigh like 50%
  var score = function(t){ var x = w[t.id] || {r: 0, a: 0}; return x.a ? 1 - x.r / x.a : 0.5; };
  var order = T.slice().sort(function(a, b){ return score(b) - score(a); }), pick = [], used = {};
  var take = function(t, n){ var qs = (t.soalan || []).filter(function(q){ return !used[q.id] && seen[q.id] !== true; });
    if(qs.length < n) qs = qs.concat((t.soalan || []).filter(function(q){ return !used[q.id] && seen[q.id] === true; }));
    qs.slice().sort(function(){ return Math.random() - 0.5; }).slice(0, n).forEach(function(q){ used[q.id] = 1; pick.push(q); }); };
  take(order[0], 4); if(order[1]) take(order[1], 3); if(order[2]) take(order[2], 2);
  for(var i = 3; pick.length < 10 && i < order.length + 3; i++) take(order[i % order.length], 1);
  var base = T[0], en = typeof BAHASA !== "undefined" && BAHASA === "en" || /[?&]ui=en(&|$)/.test(location.search);
  var o = {}; Object.keys(base).forEach(function(k){ o[k] = base[k]; });
  o.id = "pintar"; o.tajuk = en ? "🎯 Smart practice" : "🎯 Latihan pintar"; o.soalan = pick.slice(0, 10);
  o.nota = en ? "<p>Ten questions, mostly from the topics you got wrong most often.</p>" : "<p>Sepuluh soalan, kebanyakannya daripada topik yang paling kerap silap.</p>";
  o.weak = order.slice(0, 3).map(function(t){ return t.tajuk; });
  // answers here start fresh each time
  delete simpan.pintar; last = counts();
  return o; }
window.PINTAR = null;
var topikKini0 = window.topikKini;
if(typeof topikKini0 === "function") window.topikKini = function(){ var t = topikKini0.apply(this, arguments); if(!t && window.PINTAR && laluan.topik === "pintar") return window.PINTAR; return t; };
function addButton(){ if(MOD !== "kuiz" || laluan.skrin !== "subjek") return; var app = document.getElementById("app"); if(!app || app.querySelector(".pintarBtn")) return;
  var en = typeof BAHASA !== "undefined" && BAHASA === "en" || /[?&]ui=en(&|$)/.test(location.search), w = weakness(), any = Object.keys(w).some(function(k){ return w[k].a; });
  var b = document.createElement("button"); b.className = "btn utama pintarBtn"; b.type = "button";
  b.innerHTML = "🎯 " + (en ? "Smart practice: 10 questions from weak topics" : "Latihan pintar: 10 soalan dari topik lemah") + (any ? "" : "<small>" + (en ? "Answer a few quizzes first so it knows your weak topics" : "Jawab beberapa kuiz dahulu supaya ia tahu topik lemah") + "</small>");
  b.onclick = function(){ window.PINTAR = buildPintar(); if(!window.PINTAR) return; pergi({skrin: "topik", topik: "pintar", tab: "kuiz"}); };
  var anchor = app.querySelector(".topik"); if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(b, anchor); else app.appendChild(b); }
var lukis0 = window.lukis;
if(typeof lukis0 === "function") window.lukis = function(){ var r = lukis0.apply(this, arguments); try{ addButton(); }catch(e){} return r; };
try{ addButton(); }catch(e){}
})();
