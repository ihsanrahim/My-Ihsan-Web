/* My Ihsan · Silibus 🎮 Main (spec §5): 4 game modes on the same questions as the quiz.
   🗡️ Pengembaraan Wira (RPG) · 🔐 Bilik Lolos (escape room) · 📖 Pilih Pengembaraan (story) · 📺 Juara Kuiz (TV quiz show).
   Questions are drawn by the engine's own renderers (isiSoalan), so all 7 types work; answers also fill the bead board
   (jawapan + disemak; `pertama` only if not answered before). Difficulty rises: aras, then question length, in bands.
   Sedia & Tahun 1: no timers by default; RPG HP never hits 0 in the last 3 questions. Records per child in the engine store. */
(function(){
"use strict";
var G = null;   // current game state
function $(h){ var d = document.createElement("div"); d.innerHTML = h; return d.firstElementChild; }
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function kid(){ return /^(sedia|t1-)/.test(PEK); }
// 0.5.20: child settings can switch every game timer off (silibus.<anak>.tetapan.pemasa === false)
function timersOff(){ try{ return JSON.parse(localStorage.getItem("silibus." + ANAK + ".tetapan") || "{}").pemasa === false; }catch(e){ return false; } }
function rec(){ simpan.__main = simpan.__main || {xp:0, wira:"🧒", lencana:{}, rekod:{}, hari:[], subjek:{}}; return simpan.__main; }
function seed(){ var d = new Date(); return benihDari(PEK + d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate()); }

// ---------- question pool ----------
function pool(tid){ var s = DATA.subjek[0], ts = tid ? s.topik.filter(function(t){ return t.id===tid; }) : s.topik, out = [];
  ts.forEach(function(t){ (t.soalan||[]).forEach(function(q){ out.push({t:t, q:q}); }); });
  if(tid && out.length < 24){ var i = s.topik.findIndex(function(t){ return t.id===tid; }); [i+1, i-1, i+2, i-2].forEach(function(j){ var t = s.topik[j]; if(t && out.length < 24) (t.soalan||[]).forEach(function(q){ out.push({t:t, q:q}); }); }); }
  out = kocok(out, seed());
  out.sort(function(a, b){ return (a.q.aras||1) - (b.q.aras||1) || String(a.q.s).length - String(b.q.s).length; });
  return out; }
function bands(list, n){ var out = [], k = Math.ceil(list.length/n); for(var i=0;i<n;i++) out.push(kocok(list.slice(i*k, (i+1)*k), seed()+i)); return out; }
// 0.5.61: questions the child has not answered yet come first, so every game answer adds to the subject's progress
function fresh(x){ var r = simpan[x.t.id]; return !(r && r.jawapan && Object.prototype.hasOwnProperty.call(r.jawapan, x.q.id)); }
function take(band, used, j){ var u = function(x){ return !used[x.q.id]; }, fj = function(x){ return !j || x.q.j===j; };
  var x = band.filter(function(y){ return u(y) && fresh(y) && fj(y); })[0] || band.filter(function(y){ return u(y) && fresh(y); })[0] || band.filter(function(y){ return u(y) && fj(y); })[0] || band.filter(u)[0]; if(x) used[x.q.id] = 1; return x; }
function prog(){ var s = DATA.subjek[0], d = 0, n = 0; (s.topik||[]).forEach(function(t){ var k = kiraTopik(t); d += k.jawab; n += k.jum; }); return {done: d, jum: n, nama: s.nama || document.title}; }

// ---------- one question, drawn by the engine; cb(correct) when the answer is complete ----------
function ask(host, item, cb, opts){
  opts = opts || {}; var t = item.t, q = item.q, r = rekod(t.id), had = Object.prototype.hasOwnProperty.call(r.jawapan, q.id);
  var keep = had ? r.jawapan[q.id] : undefined; delete r.jawapan[q.id]; delete r.disemak[q.id]; delete susunan[q.id];
  var kad = document.createElement("div"); kad.className = "soalKad"; kad.dataset.qid = q.id; host.innerHTML = ""; host.appendChild(kad);
  soalanEls = {}; soalanEls[q.id] = kad; hudEl = null; semakEl = null;
  isiSoalan(kad, t, q, (opts.no || 1) - 1);
  if(opts.hide5050 && (q.j==="mcq") ) hideWrong(kad, q, opts.hide5050);
  var done = false;
  window.GAME_HOOK = function(tt, qq, v){ if(done || qq.id!==q.id) return; if(!siapJawab(q, v)) return; done = true; window.GAME_HOOK = null;
    var ok = betulJawab(q, v); r.disemak[q.id] = true; if(!Object.prototype.hasOwnProperty.call(r.pertama, q.id) && !had) r.pertama[q.id] = ok && !(q.j==="baca" && v==="h"); tulis();
    var mk = document.createElement("p"); mk.className = "maklum " + (ok ? "ok" : "no"); mk.textContent = ok ? (BAHASA==="en" ? "✓ Correct!" : "✓ Betul!") : (BAHASA==="en" ? "✗ The answer: " : "✗ Jawapan: ") + (ok ? "" : jawapanTeks(q));
    kad.appendChild(mk); kad.querySelectorAll("button").forEach(function(b){ b.disabled = true; });
    try{ bunyi(ok ? "betul" : "salah"); }catch(e){}
    setTimeout(function(){ cb(ok); }, ok ? 650 : 1500); };
  if(opts.timer){ var left = opts.timer, tEl = $('<div class="gmLed" style="text-align:center;margin-bottom:6px">⏱ '+left+'</div>'); host.insertBefore(tEl, kad);
    var iv = setInterval(function(){ if(done){ clearInterval(iv); return; } left--; tEl.textContent = "⏱ " + left; if(left <= 0){ clearInterval(iv); done = true; window.GAME_HOOK = null; try{ bunyi("salah"); }catch(e){} cb(false, true); } }, 1000); G.ivs.push(iv); }
  return kad;
}
function jawapanTeks(q){ if(q.j==="susun") return q.susunan.join(" → "); if(q.j==="padankan") return q.pasangan.map(function(p){ return p[0]+"→"+p[1]; }).join(", "); if(q.j==="jadual") return q.baris.map(function(b){ return b.a; }).join(", "); return String(q.a); }
function hideWrong(kad, q, n){ var wrong = [].filter.call(kad.querySelectorAll(".pil"), function(b){ return b.querySelector(".teks").textContent !== String(q.a); }); kocok(wrong, Date.now()%97).slice(0, n).forEach(function(b){ b.style.visibility = "hidden"; }); }
function confetti(){ var c = $('<div class="gmConf"></div>'); for(var i=0;i<60;i++){ var p = document.createElement("i"); p.style.left = Math.random()*100+"%"; p.style.background = ["#ffd400","#ff2bd6","#39ff14","#00e5ff","#ff7a00"][i%5]; p.style.animationDelay = Math.random()*0.8+"s"; c.appendChild(p); } document.body.appendChild(c); setTimeout(function(){ c.remove(); }, 3400); }
function screen(title){ stop(); var app = document.getElementById("app"); app.innerHTML = ""; var g = $('<div class="gm"><div class="gmHud"><button class="x" aria-label="Keluar">‹</button><b>'+title+'</b><span class="hudR"></span></div><div class="gm3dHost"></div><div class="gmSide"><div class="gmTop"></div><div class="gmBody"></div></div></div>');
  g.querySelector(".x").onclick = function(){ stop(); pergi({skrin:"subjek", topik:null}); }; app.appendChild(g); window.scrollTo(0, 0); return g; }
function stop(){ if(G){ (G.ivs||[]).forEach(clearInterval); if(G.v3) try{ G.v3.dispose(); }catch(e){} } window.GAME_HOOK = null; G = {ivs: []}; }
// 0.5.17-dev.7: every game has a three.js 3D stage (games3d.js); without WebGL the 2D stage is used as before
function scene3d(g, kind, opt){ var host = g.querySelector(".gm3dHost"), v = window.G3D ? G3D.mount(kind, host, opt) : null; if(v){ G.v3 = v; g.classList.add("has3d"); } else host.remove(); return v; }
function with3d(fn){ return function(){ var a = arguments, self = this; if(window.G3D) G3D.load(function(){ fn.apply(self, a); }); else fn.apply(self, a); }; }
function badge(id, name){ var R = rec(); if(R.lencana[id]) return ""; R.lencana[id] = Date.now(); tulis(); return '<div>🏅 '+name+'</div>'; }
function played(){ var R = rec(), d = tarikhKunci(new Date()); if(R.hari.indexOf(d)<0){ R.hari.push(d); R.hari = R.hari.slice(-10); }
  try{ var all = JSON.parse(localStorage.getItem("silibus."+ANAK+".main")||"{}"); all[PEK] = 1; localStorage.setItem("silibus."+ANAK+".main", JSON.stringify(all)); }catch(e){} tulis(); }
function streak3(){ var R = rec(), n = 0, d = new Date(); for(var i=0;i<3;i++){ if(R.hari.indexOf(tarikhKunci(d))>=0) n++; d.setDate(d.getDate()-1); } return n===3; }
function explorer(){ try{ return Object.keys(JSON.parse(localStorage.getItem("silibus."+ANAK+".main")||"{}")).length >= 3; }catch(e){ return false; } }

// ---------- picker (Main on the subject screen) ----------
var MODES = [["rpg","🗡️","Pengembaraan Wira","Misi, HP, XP, lencana dan raksasa"],["escape","🔐","Bilik Lolos","3 bilik, kod rahsia, petunjuk"],["story","📖","Pilih Pengembaraan","Cerita bercabang, 3 pengakhiran"],["show","📺","Juara Kuiz","3 pusingan, 50:50, jutawan"]];
function picker(s){ var R = rec(), lvl = level(R.xp);
  var w = $('<div><div class="gmTop"><select id="gmTopik"><option value="">📚 Semua topik</option>'+s.topik.map(function(t){ return '<option value="'+t.id+'">'+esc(t.nama)+'</option>'; }).join("")+'</select></div>'+
    '<p class="kecil" style="margin:8px 2px">'+(NAMA_ANAK?esc(NAMA_ANAK)+' · ':'')+lvl.name+' · '+R.xp+' XP · 🏅 '+Object.keys(R.lencana).length+'</p><div class="gmPick">'+MODES.map(function(m){ return '<button class="gmCard" data-gm="'+m[0]+'"><span>'+m[1]+'</span><b>'+m[2]+'</b><small>'+m[3]+'</small></button>'; }).join("")+'</div></div>');
  var G10 = window.GAMES10 && GAMES10.webgl() ? GAMES10.defs : [], en = /[?&]ui=en/.test(location.search);
  if(G10.length) w.querySelector(".gmPick").insertAdjacentHTML("beforeend", G10.map(function(d){ return '<button class="gmCard g10card" data-gm="'+d.id+'"><span>'+d.ikon+'</span><b>'+esc(en ? d.en : d.ms)+'</b><small>'+esc(en ? d.den : d.dms)+'</small><i class="g10new">3D</i></button>'; }).join(""));
  w.querySelectorAll("[data-gm]").forEach(function(b){ b.onclick = function(){ var tid = w.querySelector("#gmTopik").value, id = b.getAttribute("data-gm"), d = G10.filter(function(x){ return x.id === id; })[0]; if(d) return GAMES10.start(d, tid); ({rpg: rpg, escape: escape, story: story, show: show})[id](tid); }; });
  return w; }
function level(xp){ var L = ["Pelatih","Pengembara","Pahlawan","Wira","Legenda"], i = Math.min(4, Math.floor(xp/100)); return {i:i, name:["🌱","🧭","⚔️","🦸","👑"][i]+" "+L[i], next:(i+1)*100}; }

// ---------- 🗡️ RPG ----------
var HEROES = ["🧒","👧","🧕","🧑‍🚀","🦸"], PLACES = ["🏡","🌳","🏔️","🏰"];
function rpg(tid){ var R = rec();
  var g = screen("🗡️ Pengembaraan Wira"), body = g.querySelector(".gmBody");
  body.innerHTML = '<div class="gmMsg">Pilih wira anda</div><div class="gmBtns">'+HEROES.map(function(h){ return '<button class="btn'+(R.wira===h?' utama':'')+'" data-h="'+h+'" style="font-size:30px">'+h+'</button>'; }).join("")+'</div><div class="gmBtns"><button class="btn utama" id="gmGo">▶ Mula</button></div>';
  body.querySelectorAll("[data-h]").forEach(function(b){ b.onclick = function(){ R.wira = b.getAttribute("data-h"); tulis(); rpg(tid); }; });
  body.querySelector("#gmGo").onclick = function(){ startRpg(tid); }; }
function startRpg(tid){ var R = rec(), P = pool(tid), B = bands(P, 4), used = {}, mission = 0, i = 0, hp = 5, wrong = 0, t0 = Date.now(), boss = null, bossHp = 5, total = 20;
  var g = screen("🗡️ Pengembaraan Wira"), top = g.querySelector(".gmTop"), body = g.querySelector(".gmBody"), hud = g.querySelector(".hudR"), v3 = scene3d(g, "rpg", {hero: R.wira});
  var draw = function(){ var lv = level(R.xp); hud.innerHTML = '❤️'.repeat(Math.max(0, hp))+'🤍'.repeat(Math.max(0, 5-hp))+' · '+R.xp+' XP';
    if(v3){ v3.progress(mission, i); v3.boss(boss ? bossHp : 0); top.innerHTML = '<div class="kecil">'+PLACES[Math.min(3, mission)]+' Misi '+(mission+1)+'/4 · '+(boss?'🐲 Raksasa '+'❤'.repeat(Math.max(0, bossHp)):'soalan '+(i+1)+'/5')+' · '+lv.name+'</div>'; return; }
    top.innerHTML = '<div class="gmMap">'+PLACES.map(function(p){ return '<span>'+p+'</span>'; }).join("")+'<i style="left:'+(4+mission*30+(i/5)*28)+'%">'+R.wira+'</i></div><div class="kecil">Misi '+(mission+1)+'/4 · '+(boss?'🐲 Raksasa':'soalan '+(i+1)+'/5')+' · '+lv.name+'</div>'+
      (boss?'<div class="gmBar gmBoss"><b style="width:'+(bossHp*20)+'%"></b></div>':''); };
  var next = function(){ if(hp <= 0) return rest();
    if(i >= 5){ var perfect = wrong === 0, fast = Date.now()-t0 < 120000, extra = ""; if(perfect) extra += badge("sempurna"+mission, "Misi Sempurna"); if(fast) extra += badge("pantas", "Pantas");
      mission++; i = 0; wrong = 0; t0 = Date.now(); if(mission >= 4){ return win(extra); }
      if(mission === 3) boss = true;
      body.innerHTML = '<div class="gmMsg"><span class="big">'+PLACES[mission]+'</span>Misi '+mission+' selesai!'+extra+'</div><div class="gmBtns"><button class="btn utama" id="gmN">Misi seterusnya ›</button></div>'; body.querySelector("#gmN").onclick = function(){ draw(); next(); }; draw(); return; }
    var band = B[Math.min(3, mission)], item = boss ? (take(B[3].filter(function(x){ return (x.q.aras||1)>=3; }).concat(B[3]), used) || take(P, used)) : take(band, used) || take(P, used);
    if(!item) return win("");
    draw(); var qa = ask(body, item, function(ok){ var aras = item.q.aras||1, firstTry = !Object.prototype.hasOwnProperty.call(rekod(item.t.id).pertama, item.q.id) || rekod(item.t.id).pertama[item.q.id];
      if(v3){ if(ok) v3.good(); else v3.hit(); }
      if(ok){ R.xp += 10*aras + (firstTry ? 5 : 0); if(boss) bossHp--; } else { wrong++; var lastThree = (mission===3 && i>=2); if(!(kid() && lastThree && hp<=1)) hp--; body.classList.add("gmShake"); setTimeout(function(){ body.classList.remove("gmShake"); }, 400); }
      tulis(); i++; next(); }); };
  var rest = function(){ body.innerHTML = '<div class="gmMsg"><span class="big">😴</span>Rehat dahulu. Baca nota sekejap, kemudian cuba misi ini sekali lagi.</div><div class="gmBtns"><button class="btn utama" id="gmR">🔁 Ulang misi '+(mission+1)+'</button></div>';
    body.querySelector("#gmR").onclick = function(){ hp = 5; i = 0; wrong = 0; next(); }; draw(); };
  var win = function(extra){ played(); var ex = extra; if(streak3()) ex += badge("rajin", "Rajin (3 hari)"); if(explorer()) ex += badge("penjelajah", "Penjelajah"); if(!tid) ex += badge("penakluk", "Penakluk Pek");
    if(v3){ v3.boss(0); v3.win(); } else confetti(); body.innerHTML = '<div class="gmMsg"><span class="big">🏆</span>Raksasa ditewaskan! '+R.wira+' kini '+level(R.xp).name+'.'+ex+'</div><div class="gmBtns"><button class="btn utama" id="gmA">🔁 Main lagi</button></div>'; body.querySelector("#gmA").onclick = function(){ startRpg(tid); }; draw(); };
  draw(); next(); }

// ---------- 🔐 escape room ----------
var ROOMS = [["📚","Perpustakaan"],["🧪","Makmal"],["🔒","Bilik Kebal"]];
function digitOf(id){ return parseInt((window.SHA1HEX ? SHA1HEX(id) : String(benihDari(id).toString(16)).padStart(2, "0")).slice(0, 2), 16) % 10; }
function escape(tid){ var R = rec(), P = pool(tid), B = bands(P, 3), used = {}, room = 0, hints = 3, timerMin = timersOff() ? 0 : R.escMin != null ? R.escMin : (kid() ? 0 : 10), t0 = Date.now();
  var g = screen("🔐 Bilik Lolos"), top = g.querySelector(".gmTop"), body = g.querySelector(".gmBody"), hud = g.querySelector(".hudR"), code = [], cur = null, locked = false, v3 = scene3d(g, "escape", {});
  var tick = setInterval(function(){ if(!timerMin) { hud.textContent = "⏱ "+Math.floor((Date.now()-t0)/1000)+" s"; return; } var left = timerMin*60 - Math.floor((Date.now()-t0)/1000); hud.textContent = "⏱ "+Math.floor(Math.max(0,left)/60)+":"+String(Math.max(0,left)%60).padStart(2,"0"); if(left <= 0){ clearInterval(tick); lose(); } }, 1000); G.ivs.push(tick);
  var draw = function(){ if(v3) v3.code(code); top.innerHTML = '<div class="gmDoors'+(v3?' small':'')+'">'+ROOMS.map(function(r, k){ return '<span class="'+(k<room?'on':'')+'">'+(k<room?'🚪':r[0])+'</span>'; }).join("")+'</div><div class="gmCode">'+[0,1,2,3].map(function(k){ return '<b>'+(code[k]!=null?code[k]:'?')+'</b>'; }).join("")+'</div>'+
    '<div class="gmBtns"><button class="btn" id="gmH"'+(hints?'':' disabled')+'>💡 Petunjuk ('+hints+')</button><select id="gmT"><option value="5">5 min</option><option value="10">10 min</option><option value="15">15 min</option><option value="0">Tanpa masa</option></select></div><div class="kecil" style="text-align:center">'+ROOMS[Math.min(2,room)][1]+'</div>';
    var sel = top.querySelector("#gmT"); sel.value = String(timerMin); sel.onchange = function(){ timerMin = +sel.value; R.escMin = timerMin; tulis(); t0 = Date.now(); };
    top.querySelector("#gmH").onclick = hint; };
  var hint = function(){ if(!hints || !cur) return; hints--; var q = cur.q, kad = body.querySelector(".soalKad"), n = 3 - hints;
    if(n===1 && q.j==="mcq") hideWrong(kad, q, 1);
    else if(n===2 || (n===1 && q.j!=="mcq")){ var words = String(jawapanTeks(q)).toLowerCase().split(/\W+/).filter(function(w){ return w.length>2; }), blk = (cur.t.nota||[]).filter(function(b){ return typeof b.t==="string" && words.some(function(w){ return b.t.toLowerCase().indexOf(w)>=0; }); })[0];
      kad.insertAdjacentHTML("beforeend", '<p class="maklum">💡 '+(blk ? tafsir(blk.t, {}) : "Baca semula nota topik ini.")+'</p>'); }
    else kad.insertAdjacentHTML("beforeend", '<p class="maklum">💡 Huruf pertama: <b>'+esc(String(jawapanTeks(q)).charAt(0))+'</b></p>');
    draw(); };
  var next = function(){ if(code.length >= 4) return keypad();
    cur = take(B[Math.min(2, room)], used) || take(P, used); if(!cur){ return keypad(); } locked = false; draw();
    ask(body, cur, function(ok){ if(ok){ code.push(digitOf(cur.q.id)); } next(); }); };
  var keypad = function(){ var typed = ""; draw();
    var drawPad = function(){ body.innerHTML = '<div class="gmMsg">Masukkan kod 4 digit untuk membuka pintu '+ROOMS[Math.min(2,room)][0]+'</div><div class="gmCode">'+[0,1,2,3].map(function(k){ return '<b>'+(typed[k]||'·')+'</b>'; }).join("")+'</div><div class="gmPad">'+[1,2,3,4,5,6,7,8,9,"⌫",0,"✓"].map(function(x){ return '<button data-k="'+x+'">'+x+'</button>'; }).join("")+'</div>';
      body.querySelectorAll("[data-k]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-k"); if(k==="⌫") typed = typed.slice(0, -1); else if(k==="✓"){ if(typed===code.join("")){ room++; code = []; try{ bunyi("betul"); }catch(e){} if(v3) v3.open(); if(room>=3) return win(); body.innerHTML = '<div class="gmMsg"><span class="big">🚪</span>Pintu terbuka!</div>'; setTimeout(function(){ if(v3) v3.room(room); next(); }, v3 ? 1600 : 900); return; } if(v3) v3.wrong(); body.classList.add("gmShake"); setTimeout(function(){ body.classList.remove("gmShake"); }, 400); typed = ""; } else if(typed.length<4) typed += k; drawPad(); }; }); };
    drawPad(); };
  var win = function(){ clearInterval(tick); played(); var sec = Math.floor((Date.now()-t0)/1000), best = R.rekod.escape, nb = !best || sec < best; if(nb){ R.rekod.escape = sec; tulis(); } if(!v3) confetti(); draw();
    body.innerHTML = '<div class="gmMsg"><span class="big">🎉</span>Berjaya lolos dalam '+Math.floor(sec/60)+' min '+(sec%60)+' s!'+(nb?' 🏅 Rekod peribadi baharu':'')+'</div><div class="gmBtns"><button class="btn utama" id="gmA">🔁 Main lagi</button></div>'; body.querySelector("#gmA").onclick = function(){ escape(tid); }; };
  var lose = function(){ body.innerHTML = '<div class="gmMsg"><span class="big">⌛</span>Masa tamat. Cuba lagi!</div><div class="gmBtns"><button class="btn utama" id="gmA">🔁 Cuba lagi</button></div>'; body.querySelector("#gmA").onclick = function(){ escape(tid); }; };
  next(); }

// ---------- 📖 story ----------
var STORIES = null;
function story(tid){ if(!STORIES){ ambil("games/cerita.json").then(function(d){ STORIES = d.cerita || []; story(tid); }, function(){ STORIES = []; story(tid); }); return; }
  var g = screen("📖 Pilih Pengembaraan"), body = g.querySelector(".gmBody");
  body.innerHTML = '<div class="gmPick">'+STORIES.map(function(c, k){ return '<button class="gmCard" data-st="'+k+'"><span>'+c.ikon+'</span><b>'+esc(c.tajuk)+'</b></button>'; }).join("")+'</div>';
  body.querySelectorAll("[data-st]").forEach(function(b){ b.onclick = function(){ playStory(STORIES[+b.getAttribute("data-st")], tid); }; }); }
function playStory(c, tid){ var P = pool(tid), B = bands(P, 3), used = {}, stars = 0, node = c.mula, seen = 0, est = 7, qn = 0, voice = !!rec().voice;
  var tName = tid ? (DATA.subjek[0].topik.filter(function(t){ return t.id===tid; })[0]||{}).nama : DATA.subjek[0].nama;
  var fill = function(s){ return String(s||"").replace(/\{nama\}/g, NAMA_ANAK || "Wira").replace(/\{subjek\}/g, DATA.subjek[0].nama).replace(/\{topik\}/g, tName||""); };
  var g = screen(c.ikon+" "+c.tajuk), top = g.querySelector(".gmTop"), body = g.querySelector(".gmBody"), hud = g.querySelector(".hudR"), v3 = scene3d(g, "story", {id: c.id, hero: c.watak.wira||"🧒"});
  var say = function(t){ if(voice && window.VIS) VIS.speak(t.replace(/[^\p{L}\p{N}\s.,!?'"-]/gu, ""), "ms"); };
  var draw = function(){ hud.innerHTML = '⭐ '+stars+' <button class="btn" id="gmV" style="padding:2px 8px">'+(voice?'🔊':'🔇')+'</button>'; hud.querySelector("#gmV").onclick = function(){ voice = !voice; rec().voice = voice; tulis(); draw(); };
    top.innerHTML = '<div class="gmDots">'+Array.from({length: est}, function(_, k){ return '<i class="'+(k<seen?'on':'')+'"></i>'; }).join("")+'</div>'; };
  var go = function(id){ if(id==="tamat") return end(); var n = c.nod[id]; if(!n) return end(); seen++; draw(); var who = n.j==="soal" ? (c.watak.lawan||"").split(" ")[0] : (c.watak.pemandu||"").split(" ")[0];
    var txt = fill(n.teks); say(txt); if(v3){ v3.step(seen, est); v3.who(who); }
    if(n.j==="cerita"){ body.innerHTML = '<div class="gmStory"><span class="who">'+(c.watak.wira||"🧒")+' '+who+'</span><div class="gmBubble">'+esc(txt)+'</div><div class="gmBtns"><button class="btn utama" id="gmC">Teruskan ›</button></div></div>'; body.querySelector("#gmC").onclick = function(){ go(n.seterusnya); }; }
    else if(n.j==="pilih"){ body.innerHTML = '<div class="gmStory"><span class="who">'+(c.watak.wira||"🧒")+'</span><div class="gmBubble">'+esc(txt)+'</div><div class="gmBtns">'+n.pilihan.map(function(p, k){ return '<button class="btn" data-p="'+k+'">'+esc(fill(p.t))+'</button>'; }).join("")+'</div></div>';
      body.querySelectorAll("[data-p]").forEach(function(b){ b.onclick = function(){ var p = n.pilihan[+b.getAttribute("data-p")]; stars += p.bintang||0; go(p.ke); }; }); }
    else { body.innerHTML = '<div class="gmStory"><span class="who">'+who+'</span><div class="gmBubble">'+esc(txt)+'</div></div><div class="gmQ"></div>';
      var item = take(B[Math.min(2, Math.floor(qn/2))], used) || take(P, used); qn++;
      if(!item){ go(n.betul); return; }
      ask(body.querySelector(".gmQ"), item, function(ok){ if(ok){ stars += n.bintang||1; if(v3) for(var k=0;k<(n.bintang||1);k++) v3.star(); } else if(v3) v3.wrong(); go(ok ? n.betul : n.salah); }); } };
  var end = function(){ var t = (c.tamat||[]).slice().sort(function(a, b){ return b.min - a.min; }).filter(function(x){ return stars >= x.min; })[0] || {tajuk:"Tamat", teks:""}; played(); if(v3) v3.end(t.min >= 4); else if(t.min >= 4) confetti(); draw();
    body.innerHTML = '<div class="gmStory"><span class="who">'+esc(t.tajuk.split(" ")[0])+'</span><h3>'+esc(t.tajuk)+'</h3><div class="gmBubble">'+esc(fill(t.teks))+'</div><p>⭐ '+stars+'</p><div class="gmBtns"><button class="btn utama" id="gmA">🔁 Main semula</button><button class="btn" id="gmO">📖 Cerita lain</button></div></div>';
    body.querySelector("#gmA").onclick = function(){ playStory(c, tid); }; body.querySelector("#gmO").onclick = function(){ story(tid); }; say(fill(t.teks)); };
  draw(); go(node); }

// ---------- 📺 quiz show ----------
var HOST = {hai:["Selamat datang ke Juara Kuiz! Bersedia?","Assalamualaikum, peserta! Mari mulakan!"], puji:["Hebat!","Bijak sungguh!","Tepat sekali!","Penonton bersorak!"], galak:["Tak apa, cuba lagi!","Hampir tepat!","Jangan putus asa!"]};
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function show(tid){ var R = rec(), P = pool(tid), B = bands(P, 3), used = {}, score = [0,0,0], round = 0, noTimer = timersOff() || (kid() && !R.showTimer);
  var g = screen("📺 Juara Kuiz"), top = g.querySelector(".gmTop"), body = g.querySelector(".gmBody"), hud = g.querySelector(".hudR"), v3 = scene3d(g, "show", {hero: R.wira});
  var host = function(t){ return '<div class="gmHost"><span>🎤🧑</span><p>'+esc(t)+'</p></div>'; };
  var stage = function(inner){ return v3 ? '<div class="gmStage flat">'+inner+'</div>' : '<div class="gmStage"><div class="gmLights">'+'<i></i>'.repeat(8)+'</div>'+inner+'</div>'; };
  var led = function(){ var tot = score[0]+score[1]+score[2]; hud.innerHTML = '<span class="gmLed">'+tot+'</span>'; if(v3) v3.score(tot); };
  var intro = function(t, msg, go){ led(); body.innerHTML = stage(host(msg)+'<div class="gmMsg" style="color:#fff">'+t+'</div><div class="gmBtns"><button class="btn utama" id="gmGo">▶ Mula</button></div>'); body.querySelector("#gmGo").onclick = go; };
  // round 1: 60 s fast quiz, aras 1, +10
  var r1 = function(){ var end = Date.now()+60000, q1 = function(){ var left = Math.ceil((end-Date.now())/1000); if(!noTimer && left <= 0) return r2i(); if(noTimer && used.__r1 >= 8) return r2i();
      var it = take(B[0], used) || take(P, used); if(!it) return r2i(); used.__r1 = (used.__r1||0)+1;
      body.innerHTML = stage(host(noTimer ? "Pusingan 1 · soalan "+used.__r1+"/8" : "Pusingan 1 · ⏱ "+left+" s"))+'<div class="gmQ"></div>';
      ask(body.querySelector(".gmQ"), it, function(ok){ if(ok) score[0] += 10; if(v3){ if(ok) v3.good(); else v3.bad(); } led(); q1(); }); };
    q1(); };
  var r2i = function(){ intro("Pusingan 2 · Cabaran Mata Berganda", pick(HOST.puji)+" Markah ×2! Tekan 💪 Saya Yakin pada satu soalan untuk ×3.", r2); };
  var r2 = function(){ var n = 0, bet = false, betUsed = false, q2 = function(){ if(n >= 6) return r3i(); var it = take(B[1], used) || take(P, used); if(!it) return r3i(); n++;
      body.innerHTML = stage(host("Soalan "+n+"/6"+(betUsed?"":" · 💪 Saya Yakin ×3")))+(betUsed?'':'<div class="gmBtns"><button class="btn" id="gmBet">💪 Saya Yakin '+(bet?'✅':'')+'</button></div>')+'<div class="gmQ"></div>';
      var bb = body.querySelector("#gmBet"); if(bb) bb.onclick = function(){ bet = !bet; bb.textContent = "💪 Saya Yakin "+(bet?"✅":""); };
      ask(body.querySelector(".gmQ"), it, function(ok){ var m = (bet && !betUsed) ? 3 : 2; if(bet && !betUsed) betUsed = true; if(ok) score[1] += 10*m; if(v3){ if(ok) v3.good(); else v3.bad(); } bet = false; led(); q2(); }, {timer: noTimer ? 0 : 20}); };
    q2(); };
  var r3i = function(){ intro("Pusingan 3 · Soalan Jutawan", "Sepuluh anak tangga! Ada 50:50 dan 📖 Intai Nota, sekali sahaja. Tangga selamat di soalan 5.", r3); };
  var LAD = [100, 200, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];
  var r3 = function(){ if(v3) v3.round(3); var step = 0, safe = 0, used5050 = false, usedPeek = false, mcqs = P.filter(function(x){ return x.q.j==="mcq" && !used[x.q.id]; });
    var ladder = function(){ return '<div class="gmLadder">'+LAD.map(function(v, k){ return '<div class="'+(k===step?'on':'')+(k===4?' safe':'')+'">'+(k+1)+'. '+v.toLocaleString()+'</div>'; }).join("")+'</div>'; };
    var q3 = function(){ if(v3) v3.ladder(step); if(step >= 10) return fin(LAD[9]); var band = mcqs.filter(function(x){ return !used[x.q.id] && (x.q.aras||1) >= (step<4?1:step<7?2:3); }), it = band[0] || mcqs.filter(function(x){ return !used[x.q.id]; })[0]; if(!it) return fin(step ? LAD[step-1] : 0); used[it.q.id] = 1;
      body.innerHTML = stage(host("Soalan "+(step+1)+" untuk "+LAD[step].toLocaleString()+" mata")+ladder())+'<div class="gmBtns"><button class="btn" id="gm50"'+(used5050?' disabled':'')+'>50:50</button><button class="btn" id="gmPk"'+(usedPeek?' disabled':'')+'>📖 Intai Nota</button></div><div class="gmQ"></div>';
      var kad = ask(body.querySelector(".gmQ"), it, function(ok){ if(v3){ if(ok) v3.good(); else v3.bad(); } if(ok){ if(step===4) safe = LAD[4]; step++; led(); q3(); } else fin(safe); });
      body.querySelector("#gm50").onclick = function(){ if(used5050) return; used5050 = true; this.disabled = true; hideWrong(kad, it.q, 2); };
      body.querySelector("#gmPk").onclick = function(){ if(usedPeek) return; usedPeek = true; this.disabled = true; lihatNota(it.t); }; };
    q3(); };
  var fin = function(pts){ score[2] = pts; led(); played(); var tot = score[0]+score[1]+score[2], best = R.rekod.show||0, nb = tot > best; if(nb){ R.rekod.show = tot; tulis(); } if(v3) v3.win(); else confetti();
    body.innerHTML = stage(host(nb ? "Rekod baharu! Tahniah!" : pick(HOST.puji))+'<table class="gmScore" style="width:100%;color:#fff;font-size:16px"><tr><td>Pusingan 1</td><td>'+score[0]+'</td></tr><tr><td>Pusingan 2</td><td>'+score[1]+'</td></tr><tr><td>Pusingan 3</td><td>'+score[2].toLocaleString()+'</td></tr><tr><td><b>Jumlah</b></td><td><b>'+tot.toLocaleString()+'</b></td></tr><tr><td>Rekod terbaik</td><td>'+Math.max(best, tot).toLocaleString()+'</td></tr></table>')+
      '<div class="gmBtns"><button class="btn utama" id="gmA">🔁 Main lagi</button></div>'; body.querySelector("#gmA").onclick = function(){ show(tid); }; };
  intro("Pusingan 1 · Kuiz Pantas", pick(HOST.hai)+(noTimer ? " 8 soalan pantas, tanpa masa." : " 60 saat! Jawab seberapa banyak yang boleh."), r1); }

startRpg = with3d(startRpg); escape = with3d(escape); playStory = with3d(playStory); show = with3d(show);
window.GAMES = {picker: picker, rpg: rpg, startRpg: startRpg, escape: escape, story: story, playStory: playStory, show: show, _t: {pool: pool, bands: bands, digitOf: digitOf, level: level},
  _k: {prog: prog, ask: ask, screen: screen, pool: pool, bands: bands, take: take, rec: rec, played: played, stop: stop, G: function(){ return G; }, confetti: confetti, level: level, timersOff: timersOff, kid: kid, esc: esc}};
})();
