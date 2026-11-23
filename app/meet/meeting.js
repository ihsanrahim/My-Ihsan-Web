/* My Ihsan 0.6.44 (owner, after studying Meetily): Masa › Mesyuarat / Time › Meeting. Offline meeting notes on the phone.
   Three ways to take a meeting:
   - 🎙 Record audio (best): the mic records in 4-minute segments (each saved at once in IndexedDB, so a long meeting is not lost if
     the app closes); ⭐ marks and typed notes with times; afterwards ✨ Transcribe with AI (Gemini, the person's own key in
     Settings › AI) sends one segment at a time as 16 kHz WAV and joins the text, with speaker labels.
   - 📝 Live text (offline draft): the phone's speech-to-text (offline model preferred, Native.speechOffline) writes timed lines live.
     A phone cannot record and transcribe at the same time, so this mode keeps no audio.
   - 📥 Import: paste or open the transcript from Google Meet, Zoom or Teams (.txt / .vtt), since their own transcripts are the most
     accurate for online calls (the phone cannot hear other apps' call audio).
   After: offline summary with no AI (action items with who and when, decisions, questions, numbers, ⭐ key moments), the template's
   headings to fill, ✨ AI summary (optional), action items → Planner, share as text, PIN lock (parent PIN). Nothing leaves the phone
   unless the person taps an AI button. Data: ihsan_meet {list:[meeting], set}; audio IndexedDB "ihsan_meet" store "seg" (id#nn → Blob).
   MeetView.view(el, H)  H = finH() + loadJs, pinAsk, pinHas, keepAwake. */
(function(){ "use strict";
var H = null, EL = null, CUR = null, TAB = "sum", Q = "", REC = null, LIVE = null, OPEN = {};
var SEG_MS = 240000;   // 4-minute segments: each is a self-contained file (WAV for the AI stays under the inline size limit)
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function N(){ return H.N || {}; }
function pad(n){ return ("0" + n).slice(-2); }
function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function mmss(s){ s = Math.max(0, Math.round(s)); var h = Math.floor(s / 3600); return (h ? h + ":" + pad(Math.floor(s / 60) % 60) : Math.floor(s / 60)) + ":" + pad(s % 60); }
function loc(){ return ibLoc(H.en()); }
function db(){ var d = H.load("ihsan_meet", null) || {}; d.list = d.list || []; d.set = d.set || {}; return d; }
function put(m){ var d = db(), i = d.list.map(function(x){ return x.id; }).indexOf(m.id); if(i >= 0) d.list[i] = m; else d.list.unshift(m); H.save("ihsan_meet", d); }
function get(id){ return db().list.filter(function(x){ return x.id === id; })[0] || null; }
// ---------- IndexedDB (audio segments) ----------
function idb(cb){ try{ var r = indexedDB.open("ihsan_meet", 1); r.onupgradeneeded = function(){ r.result.createObjectStore("seg"); }; r.onsuccess = function(){ cb(r.result); }; r.onerror = function(){ cb(null); }; }catch(e){ cb(null); } }
function segPut(k, b, done){ idb(function(x){ if(!x){ if(done) done(false); return; } var t = x.transaction("seg", "readwrite"); t.objectStore("seg").put(b, k); t.oncomplete = function(){ if(done) done(true); }; t.onerror = function(){ if(done) done(false); }; }); }
function segGet(k, done){ idb(function(x){ if(!x) return done(null); var q = x.transaction("seg").objectStore("seg").get(k); q.onsuccess = function(){ done(q.result || null); }; q.onerror = function(){ done(null); }; }); }
function segDel(id, n){ idb(function(x){ if(!x) return; var s = x.transaction("seg", "readwrite").objectStore("seg"); for(var i = 0; i < n; i++) s.delete(id + "#" + pad(i)); }); }

// ---------- templates ----------
var TPL = [["gen","📋","Mesyuarat umum","General meeting",[["Agenda","Agenda"],["Perbincangan","Discussion"],["Keputusan","Decisions"],["Tindakan","Action items"]]],
  ["standup","☀️","Standup harian","Daily standup",[["Semalam","Yesterday"],["Hari ini","Today"],["Halangan","Blockers"]]],
  ["proj","📈","Projek","Project sync",[["Kemajuan","Progress"],["Risiko","Risks"],["Keputusan","Decisions"],["Langkah seterusnya","Next steps"]]],
  ["client","🤝","Pelanggan / jualan","Client / sales call",[["Keperluan pelanggan","Client needs"],["Cadangan & harga","Proposal & price"],["Kebimbangan","Concerns"],["Susulan","Follow-up"]]],
  ["intv","🧑‍💼","Temu duga","Interview",[["Calon","Candidate"],["Kekuatan","Strengths"],["Kebimbangan","Concerns"],["Keputusan","Verdict"]]],
  ["kuliah","🕌","Kuliah / usrah / khutbah","Talk / usrah / khutbah",[["Isi penting","Key points"],["Ayat & hadis","Ayat & hadith"],["Yang saya akan amalkan","What I will practise"],["Soalan","Questions"]]],
  ["class","🎓","Kuliah kelas / webinar","Lecture / webinar",[["Isi penting","Key points"],["Istilah","Key terms"],["Masuk peperiksaan","For the exam"],["Soalan","Questions"]]],
  ["family","👨‍👩‍👧","Mesyuarat keluarga","Family meeting",[["Perkara","Topics"],["Dipersetujui","Agreed"],["Siapa buat apa","Who does what"],["Wang","Money"]]],
  ["cmte","🏛","Jawatankuasa (masjid, PIBG, persatuan)","Committee (masjid, PTA, residents)",[["Agenda","Agenda"],["Laporan","Reports"],["Keputusan","Decisions"],["Tindakan","Action items"]]]];
function tpl(k){ return TPL.filter(function(t){ return t[0] === k; })[0] || TPL[0]; }

// ---------- offline summary (no AI): action items, decisions, questions, numbers, key moments ----------
var DAYN = {isnin:1, monday:1, selasa:2, tuesday:2, rabu:3, wednesday:3, khamis:4, thursday:4, jumaat:5, friday:5, sabtu:6, saturday:6, ahad:0, sunday:0};
var RX = {act:/\b(will|i'll|we'll|going to|need to|needs to|must|have to|has to|should|let's|action|to-?do|follow[- ]up|assign(ed)?|responsible|deadline|send|prepare|finish|submit|call|email|akan|perlu|mesti|kena|tolong|sila|jangan lupa|tindakan|hantar|siapkan|sediakan|selesaikan|uruskan|bertanggungjawab|sebelum|hubungi|telefon|beli|bayar)\b/i,
  dec:/\b(decided|decision|agreed|agree|approved?|confirm(ed)?|final|resolved|setuju|bersetuju|dipersetujui|diputuskan|keputusan|lulus|diluluskan|muktamad|sepakat)\b/i,
  q:/^(apa|bila|siapa|kenapa|mengapa|bagaimana|macam mana|berapa|boleh|adakah|what|when|who|why|how|can|could|should|is|are|do|does)\b/i};
function sentences(m){ var out = [];
  (m.lines || []).forEach(function(l){ String(l.x).split(/(?<=[.!?])\s+/).forEach(function(x){ if(x.trim()) out.push({s:l.s, x:x.trim(), sp:l.sp}); }); });
  (m.notes || []).forEach(function(n){ out.push({s:n.s, x:n.x, note:1}); });
  if(m.aiT){ m.aiT.split(/\n+/).forEach(function(line){ var mm = /^\[?(\d+):(\d\d)\]?\s*(?:([^:]{1,24}):)?\s*(.*)$/.exec(line.trim()), s0 = mm ? +mm[1] * 60 + +mm[2] : null, sp = mm ? (mm[3] || "") : "", body = mm ? mm[4] : line;
    String(body).split(/(?<=[.!?])\s+/).forEach(function(x){ if(x.trim()) out.push({s:s0, x:x.trim(), sp:sp.trim()}); }); }); }
  return out; }
function dueOf(x, base){ var t = x.toLowerCase(), d = new Date(base || Date.now()), k = null;
  if(/\b(hari ini|today)\b/.test(t)) k = ymd(d);
  else if(/\b(esok|tomorrow)\b/.test(t)){ d.setDate(d.getDate() + 1); k = ymd(d); }
  else if(/\b(lusa)\b/.test(t)){ d.setDate(d.getDate() + 2); k = ymd(d); }
  else if(/\b(minggu depan|next week)\b/.test(t)){ d.setDate(d.getDate() + 7); k = ymd(d); }
  else if(/\b(bulan depan|next month)\b/.test(t)){ d.setMonth(d.getMonth() + 1); k = ymd(d); }
  else { var w = Object.keys(DAYN).filter(function(n){ return new RegExp("\\b" + n + "\\b").test(t); })[0]; if(w != null){ var add = (DAYN[w] - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + add); k = ymd(d); }
    else { var dm = /\b(\d{1,2})[\/.](\d{1,2})(?:[\/.](\d{2,4}))?\b/.exec(t); if(dm){ var y = dm[3] ? (+dm[3] < 100 ? 2000 + +dm[3] : +dm[3]) : d.getFullYear(), dt = new Date(y, +dm[2] - 1, +dm[1]); if(!isNaN(dt)) k = ymd(dt); } } }
  return k; }
function whoOf(x, m){ var t = x.toLowerCase(), p = (m.people || []).filter(function(n){ return n && t.indexOf(n.toLowerCase()) >= 0; })[0]; if(p) return p; if(/\b(saya|aku|i|i'll|i will)\b/.test(t)) return L("Saya", "Me"); return ""; }
function extract(m){ var S = sentences(m), base = m.t0 || Date.now(), act = [], dec = [], q = [], num = [], key = [], seen = {};
  S.forEach(function(o){ var x = o.x; if(x.length < 6 || seen[x]) return; seen[x] = 1;
    if(RX.dec.test(x)) dec.push(o); else if(RX.act.test(x) && !/\?$/.test(x)) act.push({t:x, who:o.sp && !/^speaker|^penutur/i.test(o.sp) ? o.sp : whoOf(x, m), due:dueOf(x, base), s:o.s});
    if(/\?$/.test(x) || RX.q.test(x) && x.length < 140 && /\?/.test(x)) q.push(o);
    var nm = x.match(/(RM ?[\d,.]+(?:\s?(?:k|juta|ribu|million|thousand))?|\b\d+(?:[.,]\d+)?\s?%|\b\d{1,2}[\/.]\d{1,2}(?:[\/.]\d{2,4})?\b)/gi); if(nm) nm.forEach(function(v){ num.push({v:v, x:x}); }); });
  (m.marks || []).forEach(function(mk){ var near = S.filter(function(o){ return o.s != null && Math.abs(o.s - mk.s) <= 20; }).map(function(o){ return o.x; }).filter(function(x, i, a){ return a.indexOf(x) === i; }).join(" "); key.push({s:mk.s, x:(mk.n ? mk.n + " · " : "") + (near || L("(tiada teks pada masa ini)", "(no text at this time)"))}); });
  return {act:act.slice(0, 40), dec:dec.slice(0, 30), q:q.slice(0, 30), num:num.slice(0, 30), key:key}; }

// ---------- list ----------
function view(el, h){ H = h; EL = el; if(window.__meetPg){ PGM = window.__meetPg; CUR = null; window.__meetPg = null; } draw(); recover(); }
// 0.6.48 (owner): Meeting has three sub-tabs: 📋 Meetings · 🔊 Speaker · 👂 Listen
var PGM = "list"; (window.__pgNow = window.__pgNow || {}).__meetPg = function(){ return PGM; };   // 0.6.56: the app remembers the open tab
function subTabs(){ var T = [["list", "📋 " + L("Mesyuarat", "Meetings")], ["spk", "🔊 " + L("Pembesar suara", "Speaker")], ["lis", "👂 " + L("Dengar", "Listen")], ["wt", "📻 Walkie"]]; if(window.l3Keep) T = l3Keep(T, "cal/mesyuarat", PGM);
  return '<div class="dock mtDock"><div class="grp' + (T.length === 2 ? '2' : T.length === 4 ? '3 grp4' : '3') + '">' + T.map(function(x){ return '<button class="chip g3d' + (PGM === x[0] ? ' on' : '') + '" data-mtp="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div></div>'; }
function bindTabs(){ try{ if(H.dockFix) setTimeout(H.dockFix, 0); }catch(e){} EL.querySelectorAll("[data-mtp]").forEach(function(b){ b.onclick = function(){ SEEN_NOW = {}; PGM = b.getAttribute("data-mtp"); draw(); var v = document.getElementById("view"); if(v) v.scrollTop = 0; }; }); }
function draw(){ if(!EL || !document.body.contains(EL)) return; if(CUR){ detail(); return; }
  evOnce();
  if(PGM === "spk"){ EL.innerHTML = '<div id="mtSp" class="mtPg"></div>' + subTabs(); bindTabs(); spkPage(EL.querySelector("#mtSp")); return; }
  if(PGM === "wt"){ EL.innerHTML = '<div id="mtWt" class="mtPg"><div class="card mut">' + L("Memuatkan…", "Loading…") + '</div></div>' + subTabs(); bindTabs(); var wel = EL.querySelector("#mtWt"), go_ = function(){ if(document.body.contains(wel)) Walkie.view(wel, H); };
    if(window.Walkie) go_(); else H.loadJs(["meet/walkie.js"], go_, function(){ wel.innerHTML = '<div class="card">' + L("Gagal dimuatkan", "Could not load") + '</div>'; }); return; }
  if(PGM === "lis"){ EL.innerHTML = '<div id="mtLs" class="mtPg"></div>' + subTabs(); bindTabs(); lisPage(EL.querySelector("#mtLs")); return; }
  var D = db(), list = D.list.filter(function(m){ return !Q || (m.title + " " + (m.lines || []).map(function(l){ return l.x; }).join(" ") + " " + (m.aiT || "") + " " + (m.notes || []).map(function(n){ return n.x; }).join(" ")).toLowerCase().indexOf(Q.toLowerCase()) >= 0; });
  var h = '<div class="card mtHero"><div><h3>📋 ' + L("Mesyuarat", "Meeting") + '</h3><div class="mut small">' + L("Nota mesyuarat luar talian: rakam, tanda detik penting, dapat tindakan & keputusan.", "Offline meeting notes: record, mark key moments, get action items and decisions.") + '</div></div><button class="btn gold full g3d" id="mtNew">＋ ' + L("Mesyuarat baharu", "New meeting") + '</button></div>';
  if(D.list.length) h += '<input id="mtQ" class="rin" style="margin:0 0 10px" placeholder="🔎 ' + E(L("Cari tajuk, teks, nota…", "Search titles, text, notes…")) + '" value="' + E(Q) + '">';
  h += list.length ? list.map(function(m){ var t = tpl(m.tpl), s = m.sum || extract(m); return '<button class="card mtRow" data-mo="' + m.id + '"><span class="mtIc">' + t[1] + '</span><span class="mtTx"><b>' + E(m.title) + (m.lock ? ' 🔒' : '') + '</b><small>' + E(new Date(m.t0).toLocaleDateString(loc(), {day:"numeric", month:"short", year:"numeric"})) + ' · ' + mmss(m.dur || 0) + ' · ' + ({rec:"🎙", live:"📝", imp:"📥"}[m.mode] || "") + (s.act.length ? ' · ✅ ' + s.act.length : '') + '</small></span><span class="shGo">›</span></button>'; }).join("")
    : (D.list.length ? '<div class="mut small" style="padding:10px">' + L("Tiada padanan", "No matches") + '</div>' : '');
  h += '<details class="card mtTips"' + (D.list.length ? '' : ' open') + '><summary><b>💡 ' + L("Cara guna", "How to use it") + '</b></summary>' + TIPS().map(function(x){ return '<div class="mtTip"><span>' + x[0] + '</span><div><b>' + E(x[1]) + '</b><small>' + E(x[2]) + '</small></div></div>'; }).join("") + '</details>';
  EL.innerHTML = '<div class="mtPg">' + h + '</div>' + subTabs(); bindTabs();
  EL.querySelector("#mtNew").onclick = newSheet;
  var qi = EL.querySelector("#mtQ"); if(qi) qi.oninput = function(){ Q = qi.value; var p = qi.selectionStart; draw(); var n = EL.querySelector("#mtQ"); if(n){ n.focus(); try{ n.setSelectionRange(p, p); }catch(e){} } };
  EL.querySelectorAll("[data-mo]").forEach(function(b){ b.onclick = function(){ var m = get(b.getAttribute("data-mo")); if(!m) return; var go = function(){ OPEN[m.id] = 1; CUR = m.id; TAB = "sum"; draw(); if(document.getElementById("view")) document.getElementById("view").scrollTop = 0; }; if(m.lock && !OPEN[m.id] && H.pinAsk) H.pinAsk(L("Buka mesyuarat", "Open meeting"), go); else go(); }; }); }
function TIPS(){ return [["🏢", L("Mesyuarat dalam bilik", "Meetings in a room"), L("Rakam audio, letak telefon di tengah meja. Ketik ⭐ pada detik penting.", "Record audio with the phone in the middle of the table. Tap ⭐ at key moments.")],
  ["💻", L("Panggilan Meet / Zoom / Teams", "Meet / Zoom / Teams calls"), L("Telefon tidak boleh mendengar audio panggilan aplikasi lain. Hidupkan transkrip dalam aplikasi itu, kemudian 📥 Import.", "The phone cannot hear other apps' call audio. Turn on the transcript in that app, then 📥 Import.")],
  ["🕌", L("Kuliah, usrah, khutbah, kelas", "Talks, usrah, khutbah, classes"), L("Templat Kuliah: isi penting, ayat & hadis, apa yang saya akan amalkan.", "The Talk template: key points, ayat & hadith, what I will practise.")],
  ["✅", L("Selepas mesyuarat", "After the meeting"), L("Tindakan dan keputusan dikesan tanpa AI. Hantar tindakan ke Perancang.", "Action items and decisions are found without AI. Send actions to the Planner.")],
  ["🤝", L("Adab", "Good manners"), L("Minta izin semua orang sebelum merakam.", "Ask everyone's permission before recording.")]]; }
function newSheet(){ var D = db(), st = {tpl:D.set.tpl || "gen", mode:D.set.mode || "rec", lang:D.set.lang || (H.en() ? "en" : "ms")};
  var ov = H.showSheet("＋ " + L("Mesyuarat baharu", "New meeting"), '<input id="mnT" class="rin" placeholder="' + E(L("Tajuk (cth. Mesyuarat keluarga)", "Title (e.g. Family meeting)")) + '">' +
    '<div class="mtQh">' + L("Templat", "Template") + '</div><div class="mtTpl">' + TPL.map(function(t){ return '<button class="chip' + (st.tpl === t[0] ? ' on' : '') + '" data-nt="' + t[0] + '">' + t[1] + ' ' + E(L(t[2], t[3])) + '</button>'; }).join("") + '</div>' +
    '<div class="mtQh">' + L("Cara", "How") + '</div><div class="mtModes">' + [["rec","🎙",L("Rakam audio","Record audio"),L("Terbaik. Teks dibuat selepas (✨ AI) · ⭐ & nota semasa","Best. Text made after (✨ AI) · ⭐ & notes during")],["live","📝",L("Teks langsung","Live text"),L("Draf luar talian semasa bercakap · tiada audio","Offline draft as people speak · no audio")]].concat(N().capOk && N().capOk() ? [["cap","🎧",L("Audio telefon","Phone audio"),L("Kuliah YouTube, webinar · boleh guna fon telinga","YouTube talks, webinars · works with earphones")]] : []).concat([["imp","📥",L("Import transkrip","Import transcript"),L("Dari Meet / Zoom / Teams","From Meet / Zoom / Teams")]]).map(function(x){ return '<button class="mtMode' + (st.mode === x[0] ? ' on' : '') + '" data-nm="' + x[0] + '"><span>' + x[1] + '</span><b>' + x[2] + '</b><small>' + x[3] + '</small></button>'; }).join("") + '</div>' +
    '<div class="mtQh">' + L("Bahasa", "Language") + '</div><div class="rseg">' + [["ms","Bahasa Melayu"],["en","English"],["mix",L("Campur BM + English","Mixed Malay + English")]].map(function(x){ return '<button class="chip' + (st.lang === x[0] ? ' on' : '') + '" data-nl="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>' +
    '<input id="mnP" class="rin" style="margin-top:10px" placeholder="' + E(L("Peserta (pilihan): Ali, Siti, Encik Rahman", "People (optional): Ali, Siti, Mr Rahman")) + '" value="' + E((D.set.people || []).join(", ")) + '">' +
    '<label class="pdchk" style="margin-top:8px"><input type="checkbox" id="mnOk"> 🤝 ' + L("Semua orang sudah izinkan rakaman", "Everyone agreed to be recorded") + '</label>' +
    '<button class="btn gold full g3d" id="mnGo" style="margin-top:10px">▶ ' + L("Mula", "Start") + '</button>');
  var sel = function(a, k){ ov.querySelectorAll("[" + a + "]").forEach(function(b){ b.onclick = function(){ st[k] = b.getAttribute(a); ov.querySelectorAll("[" + a + "]").forEach(function(y){ y.classList.toggle("on", y === b); }); ov.querySelector("#mnOk").parentNode.style.display = st.mode === "imp" ? "none" : ""; }; }); };
  sel("data-nt", "tpl"); sel("data-nm", "mode"); sel("data-nl", "lang");
  ov.querySelector("#mnGo").onclick = function(){ if(st.mode !== "imp" && !ov.querySelector("#mnOk").checked){ H.toast("🤝 " + L("Minta izin semua orang dahulu, kemudian tanda kotak.", "Ask everyone's permission first, then tick the box.")); return; }
    var t = tpl(st.tpl), ppl = ov.querySelector("#mnP").value.split(",").map(function(x){ return x.trim(); }).filter(Boolean),
      m = {id:uid(), title:ov.querySelector("#mnT").value.trim() || L(t[2], t[3]) + " · " + new Date().toLocaleDateString(loc(), {day:"numeric", month:"short"}), tpl:st.tpl, mode:st.mode, lang:st.lang, people:ppl, t0:Date.now(), dur:0, marks:[], notes:[], lines:[], sec:{}, segs:0};
    D.set.tpl = st.tpl; D.set.mode = st.mode; D.set.lang = st.lang; D.set.people = ppl; H.save("ihsan_meet", D); put(m); H.closeOverlay();
    if(st.mode === "imp"){ CUR = m.id; TAB = "txt"; draw(); importSheet(m); } else session(m); }; }

// ---------- live session (record or live text) ----------
function session(m){ var ov = document.createElement("div"); ov.className = "mtLive gwNoSw"; document.body.appendChild(ov);
  var t0 = Date.now(), pausedAt = 0, pausedMs = 0, el = function(){ return ((pausedAt || Date.now()) - t0 - pausedMs) / 1000; }, tick = null, ended = false;
  ov.innerHTML = '<div class="mtLh"><span class="mtDot"></span><b id="mlT">0:00</b><small>' + E(m.title) + '</small></div>' +
    (m.mode === "rec" || m.mode === "cap" ? '<div class="mtMeter"><canvas id="mlC" width="320" height="64"></canvas></div><div class="mut small mtHint">' + L("Merakam. Skrin boleh malap; biarkan aplikasi terbuka.", "Recording. The screen may dim; keep the app open.") + '</div>' : '<div class="mtLines" id="mlL"><div class="mut small">' + L("Mendengar… bercakaplah seperti biasa.", "Listening… speak as usual.") + '</div></div><div class="mtPart" id="mlP"></div>') +
    '<div class="mtMarks" id="mlM"></div><div class="radd mtNoteIn"><input id="mlN" class="rin" placeholder="' + E(L("Nota pantas (bertarikh masa)…", "Quick note (time-stamped)…")) + '"><button class="btn alt" id="mlNs">＋</button></div>' +
    '<div class="mtLb"><button class="mtBig" id="mlStar">⭐<small>' + L("Tanda", "Mark") + '</small></button><button class="mtBig" id="mlPause">⏸<small>' + L("Jeda", "Pause") + '</small></button><button class="mtBig stop" id="mlStop">⏹<small>' + L("Tamat", "End") + '</small></button></div>';
  try{ if(N().keepAwake) N().keepAwake(true); }catch(e){}
  var marks = function(){ ov.querySelector("#mlM").innerHTML = m.marks.concat(m.notes).sort(function(a, b){ return a.s - b.s; }).slice(-4).map(function(x){ return '<div class="small">' + (x.x != null ? "📝 " : "⭐ ") + mmss(x.s) + ' ' + E(x.x != null ? x.x : (x.n || "")) + '</div>'; }).join(""); };
  ov.querySelector("#mlStar").onclick = function(){ m.marks.push({s:Math.round(el()), n:""}); put(m); marks(); try{ if(N().vibrate) N().vibrate(25); }catch(e){} H.toast("⭐ " + mmss(el())); };
  var addNote = function(){ var i = ov.querySelector("#mlN"), v = i.value.trim(); if(!v) return; m.notes.push({s:Math.round(el()), x:v}); i.value = ""; put(m); marks(); };
  ov.querySelector("#mlNs").onclick = addNote; ov.querySelector("#mlN").onkeydown = function(e){ if(e.key === "Enter") addNote(); };
  var finish = function(){ if(ended) return; ended = true; clearInterval(tick); try{ if(N().keepAwake) N().keepAwake(false); }catch(e){} m.dur = Math.round(el()); m.rec = false;
    var after = function(){ put(m); ov.remove(); CUR = m.id; TAB = m.mode === "rec" ? "txt" : "sum"; draw(); H.toast("✅ " + L("Disimpan", "Saved") + " · " + mmss(m.dur)); };
    if(m.mode === "cap"){ capStopThen(function(){ importNative(m, after); }); return; }
    if(m.mode === "rec") recStop(after); else { liveStop(); after(); } };
  ov.querySelector("#mlStop").onclick = function(){ if(confirm(L("Tamatkan dan simpan?", "End and save?"))) finish(); };
  ov.querySelector("#mlPause").onclick = function(){ var b = this; if(pausedAt){ pausedMs += Date.now() - pausedAt; pausedAt = 0; b.innerHTML = '⏸<small>' + L("Jeda", "Pause") + '</small>'; ov.classList.remove("paused"); if(m.mode === "rec") recPause(false); else liveGo(); }
    else { pausedAt = Date.now(); b.innerHTML = '▶<small>' + L("Sambung", "Resume") + '</small>'; ov.classList.add("paused"); if(m.mode === "rec") recPause(true); else liveStop(); } };
  tick = setInterval(function(){ if(!document.body.contains(ov)){ clearInterval(tick); return; } ov.querySelector("#mlT").textContent = mmss(el()); if(!pausedAt){ m.dur = Math.round(el()); } }, 500);
  var fail = function(msg){ H.toast(msg); ended = true; clearInterval(tick); ov.remove(); try{ if(N().keepAwake) N().keepAwake(false); }catch(e){} if(!m.marks.length && !m.notes.length && !m.lines.length && !m.segs){ var d = db(); d.list = d.list.filter(function(x){ return x.id !== m.id; }); H.save("ihsan_meet", d); } draw(); };
  if(N().hasPerm && !N().hasPerm("mic")){ if(N().requestPerm) N().requestPerm("mic"); fail(L("Benarkan mikrofon, kemudian mula semula.", "Allow the microphone, then start again.")); return; }
  if(m.mode === "cap"){ ov.querySelector("#mlPause").style.display = "none"; capInit(m, ov, fail); marks(); return; }
  if(m.mode === "rec") recStart(m, ov, fail); else { liveInit(m, ov, el); if(!LIVE) fail(L("Pengecaman suara tiada pada telefon ini. Guna 🎙 Rakam audio.", "Speech recognition is not available on this phone. Use 🎙 Record audio.")); }
  marks(); }
// recording in 4-minute segments; each finished segment is saved straight away
function recStart(m, ov, fail){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder){ fail(L("Telefon ini tidak boleh merakam di sini.", "This phone cannot record here.")); return; }
  navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false, noiseSuppression:true, autoGainControl:true}}).then(function(stream){
    REC = {m:m, stream:stream, mr:null, paused:false, segT:null, stopCb:null, pending:0};
    m.rec = true; put(m);
    var mime = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm", "audio/mp4"].filter(function(x){ try{ return MediaRecorder.isTypeSupported(x); }catch(e){ return false; } })[0] || "";
    var startSeg = function(){ if(!REC) return; var ch = [], mr = new MediaRecorder(stream, mime ? {mimeType:mime, audioBitsPerSecond:32000} : undefined), n = m.segs;
      REC.mr = mr; REC.pending++;
      mr.ondataavailable = function(e){ if(e.data && e.data.size) ch.push(e.data); };
      mr.onstop = function(){ var b = new Blob(ch, {type:mr.mimeType || mime || "audio/webm"}); m.segs = Math.max(m.segs, n + 1); m.mime = b.type; put(m);
        segPut(m.id + "#" + pad(n), b, function(){ if(!REC) return; REC.pending--; if(REC.stopCb && !REC.pending){ var cb = REC.stopCb; recRelease(); cb(); } }); };
      mr.start(1000); m.segs = n + 1; put(m);
      clearTimeout(REC.segT); REC.segT = setTimeout(function(){ if(REC && REC.mr === mr && mr.state === "recording"){ mr.stop(); startSeg(); } }, SEG_MS); };
    startSeg(); meter(stream, ov);
  }).catch(function(){ fail(L("Mikrofon tidak dapat dibuka.", "The microphone could not open.")); }); }
function recPause(on){ if(!REC || !REC.mr) return; try{ if(on && REC.mr.state === "recording") REC.mr.pause(); else if(!on && REC.mr.state === "paused") REC.mr.resume(); }catch(e){} }
function recStop(cb){ if(!REC){ cb(); return; } clearTimeout(REC.segT); REC.stopCb = cb; try{ if(REC.mr && REC.mr.state !== "inactive") REC.mr.stop(); else if(!REC.pending){ recRelease(); cb(); } }catch(e){ recRelease(); cb(); } }
function recRelease(){ if(!REC) return; try{ REC.stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} try{ if(REC.ac) REC.ac.close(); }catch(e){} REC = null; }
function meter(stream, ov){ try{ var AC = window.AudioContext || window.webkitAudioContext, ac = new AC(), src = ac.createMediaStreamSource(stream), an = ac.createAnalyser(); an.fftSize = 256; src.connect(an); REC.ac = ac;
  var cv = ov.querySelector("#mlC"), c = cv.getContext("2d"), buf = new Uint8Array(an.frequencyBinCount), hist = [];
  var loop = function(){ if(!REC || !document.body.contains(cv)) return; an.getByteTimeDomainData(buf); var mx = 0; for(var i = 0; i < buf.length; i++) mx = Math.max(mx, Math.abs(buf[i] - 128)); hist.push(mx / 128); if(hist.length > 64) hist.shift();
    c.clearRect(0, 0, 320, 64); c.fillStyle = "#c9a646"; hist.forEach(function(v, j){ var hh = Math.max(2, v * 60); c.fillRect(j * 5, 32 - hh / 2, 3, hh); }); requestAnimationFrame(loop); }; loop(); }catch(e){} }
// a meeting still marked as recording when the app reopens (it was closed mid-meeting): keep the segments already saved
function recover(){ var d = db(), ch = false; d.list.forEach(function(m){ if(m.rec && !(REC && REC.m.id === m.id)){ m.rec = false; m.cut = true; ch = true; } }); if(ch){ H.save("ihsan_meet", d); H.toast("🎙 " + L("Rakaman yang terhenti disimpan setakat bahagian terakhir.", "An interrupted recording was kept up to its last saved part.")); } }
// live text through the phone's speech-to-text, restarted after each pause (offline model preferred)
function liveInit(m, ov, el){ if(!(N().canListen && N().canListen())) return; var lc = m.lang === "en" ? "en-US" : "ms-MY", part = ov.querySelector("#mlP"), box = ov.querySelector("#mlL");
  try{ if(N().speechOffline) N().speechOffline(true); }catch(e){}
  LIVE = {m:m, lc:lc, fn:function(r){ if(!LIVE || LIVE.off) return; if(r.err != null){ setTimeout(function(){ if(LIVE && !LIVE.off) try{ N().listen(lc); }catch(e){} }, 300); return; } if(r.ready || r.t == null) return;
    var t = String(r.t).split(" | ")[0].trim(); if(!r.final){ part.textContent = t ? "… " + t : ""; return; } part.textContent = "";
    if(t){ m.lines.push({s:Math.round(el()), x:t}); put(m); if(box.querySelector(".mut")) box.innerHTML = ""; var dv = document.createElement("div"); dv.className = "mtLn"; dv.innerHTML = '<i>' + mmss(el()) + '</i> ' + E(t); box.appendChild(dv); box.scrollTop = box.scrollHeight; }
    try{ N().listen(lc); }catch(e){} }};
  H.on("speech", LIVE.fn); liveGo(); }
function liveGo(){ if(!LIVE) return; LIVE.off = false; try{ N().listen(LIVE.lc); }catch(e){} }
function liveStop(){ if(!LIVE) return; LIVE.off = true; try{ N().stopListen(); }catch(e){} if(LIVE.m && LIVE.m.dur && document.querySelector(".mtLive") === null){ H.off("speech", LIVE.fn); try{ if(N().speechOffline) N().speechOffline(false); }catch(e){} LIVE = null; } }

// ---------- 🎧 phone audio (other apps' playback; native AudioKit writes 16 kHz WAV parts) ----------
var CAP = null;
function capInit(m, ov, fail){ var cv = null; ov.querySelector(".mtHint") && (ov.querySelector(".mtHint").textContent = L("Mainkan video / kuliah dalam aplikasi lain. Fon telinga boleh digunakan. Audio panggilan (Zoom, Meet, WhatsApp) tidak dapat dirakam.", "Play the video / talk in another app. Earphones are fine. Call audio (Zoom, Meet, WhatsApp) cannot be recorded."));
  CAP = {m:m, fn:function(r){ if(r.err){ var e = r.err === "denied" ? L("Kebenaran ditolak.", "Permission was refused.") : L("Audio telefon tidak dapat dirakam: ", "Phone audio could not be recorded: ") + r.err; H.off("cap", CAP.fn); CAP = null; fail(e); return; }
    if(r.on === false && CAP && CAP.then){ var t = CAP.then; H.off("cap", CAP.fn); CAP = null; t(); return; }
    if(r.lv != null){ if(!cv) cv = ov.querySelector("#mlC"); if(cv){ var c = cv.getContext("2d"); CAP.h = (CAP.h || []).concat([Math.min(1, r.lv * 4)]).slice(-64); c.clearRect(0, 0, 320, 64); c.fillStyle = "#4fc3c9"; CAP.h.forEach(function(v, j){ var hh = Math.max(2, v * 60); c.fillRect(j * 5, 32 - hh / 2, 3, hh); }); } } }};
  H.on("cap", CAP.fn); m.rec = true; put(m); if(!N().capStart(m.id)){ H.off("cap", CAP.fn); CAP = null; fail(L("Benarkan mikrofon dahulu (Android perlukannya untuk audio telefon).", "Allow the microphone first (Android needs it for phone audio).")); } }
function capStopThen(cb){ if(!CAP){ cb(); return; } CAP.then = cb; try{ N().capStop(); }catch(e){} setTimeout(function(){ if(CAP && CAP.then === cb){ H.off("cap", CAP.fn); CAP = null; cb(); } }, 4000); }
/** copy the native WAV parts (files/meet/<id>_nn.wav) into the meeting's IndexedDB parts, then delete the files */
function importNative(m, done){ var L0 = []; try{ L0 = JSON.parse(N().recFiles(m.id) || "[]"); }catch(e){} var i = 0; m.segs = 0; m.rec = false;
  var next = function(){ if(i >= L0.length){ try{ N().recDel(m.id); }catch(e){} m.mime = "audio/wav"; put(m); done(); return; }
    var f = L0[i], b = ""; try{ b = N().recFile(f.n) || ""; }catch(e){} if(!b || f.bytes <= 44){ i++; next(); return; }
    var bin = atob(b), u = new Uint8Array(bin.length); for(var k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k);
    segPut(m.id + "#" + pad(m.segs), new Blob([u], {type:"audio/wav"}), function(){ m.segs++; i++; setTimeout(next, 0); }); };
  next(); }

// ---------- 🔊 Speaker: the phone as a small PA (native AudioKit: any mic in, loudspeaker or connected speaker out) ----------
// State lives here so the page can be left and opened again while the speaker keeps running (AudioService).
var SP = {on:false, CS:null, nL:0, m:null, hist:[], howl:""}, LS = {on:false, hist:[]}, EVON = false;
function evOnce(){ if(EVON || !H.on) return; EVON = true;
  H.on("spk", function(r){ if(r.err){ H.toast("⚠ " + (r.err === "bt" ? L("Mikrofon earbud tidak dapat dihidupkan. Pastikan earbud bersambung (dan bukan dalam panggilan), kemudian cuba lagi. Sesetengah earbud tidak membenarkannya.", "Could not switch on the earbuds' mic. Make sure they're connected (and not in a call), then try again. Some earbuds don't allow it.") : L("Pembesar suara: ", "Speaker: ") + r.err)); }
    if(r.on === true){ SP.on = true; repaint("spk"); }
    if(r.on === false){ var was = SP.on; SP.on = false; if(SP.CS){ try{ N().castStop(); }catch(e){} SP.CS = null; } try{ if(N().keepAwake) N().keepAwake(false); }catch(e){}
      if(was && SP.m){ var mm = SP.m; SP.m = null; mm.dur = Math.round((Date.now() - mm.t0) / 1000); importNative(mm, function(){ PGM = "list"; CUR = mm.id; TAB = "txt"; draw(); H.toast("✅ " + L("Rakaman disimpan dalam Mesyuarat", "Recording saved in Meeting"));
        if(SP.tr){ SP.tr = false; var tb = EL && EL.querySelector("#mtTr"); if(tb) tb.click(); } }); } else repaint("spk"); }
    if(r.lv != null){ SP.hist.push(Math.min(1, r.lv * 3)); if(SP.hist.length > 64) SP.hist.shift(); meterDraw("#spC", SP.hist, true); }
    if(r.howl){ SP.howl = "🔇 " + L("Dengung dikesan: kuat dikurangkan. Jauhkan mikrofon dari speaker.", "Howling detected: volume lowered. Keep the mic away from the speaker."); var h = document.getElementById("spH"); if(h) h.textContent = SP.howl;
      setTimeout(function(){ SP.howl = ""; var h2 = document.getElementById("spH"); if(h2) h2.textContent = ""; }, 5000);
      if(r.gain){ var st = spkSet(); st.gain = r.gain; spkSave(st); var g = document.getElementById("spG"); if(g){ g.value = r.gain; document.getElementById("spGv").textContent = Math.round(r.gain * 10) / 10 + "×"; } } } });
  H.on("cast", function(r){ if(r.n != null){ SP.nL = r.n; var e = document.getElementById("spN"); if(e) e.textContent = SP.nL; } });
  H.on("lis", function(r){ if(r.err) H.toast("⚠ " + (r.err === "code" ? L("Kod siaran salah atau sudah tamat.", "Wrong or ended broadcast code.") : L("Tidak dapat sambung. Wi-Fi yang sama?", "Could not connect. Same Wi-Fi?")));
    if(r.on === true){ LS.on = true; repaint("lis"); } if(r.on === false){ LS.on = false; repaint("lis"); }
    if(r.lv != null){ LS.hist.push(Math.min(1, r.lv * 4)); if(LS.hist.length > 64) LS.hist.shift(); meterDraw("#lsC", LS.hist, false); } }); }
function repaint(pg){ if(CUR || PGM !== pg || !EL || !document.body.contains(EL)) return; var host = EL.querySelector(pg === "spk" ? "#mtSp" : "#mtLs"); if(host) (pg === "spk" ? spkPage : lisPage)(host); }
function meterDraw(sel, hist, warn){ var cv = document.querySelector(sel); if(!cv) return; var c = cv.getContext("2d"); c.clearRect(0, 0, 320, 64); hist.forEach(function(v, j){ c.fillStyle = warn && v > 0.85 ? "#e0605a" : warn ? "#c9a646" : "#4fc3c9"; var hh = Math.max(2, v * 60); c.fillRect(j * 5, 32 - hh / 2, 3, hh); }); }
/** "how to" help opens the first time a page is used, then stays folded (owner, 0.6.49) */
var SEEN_NOW = {};   // open during the whole first visit, even when the page redraws
function seen(k){ if(SEEN_NOW[k]) return false; var D = db(); D.set.seen = D.set.seen || {}; if(D.set.seen[k]) return true; D.set.seen[k] = 1; H.save("ihsan_meet", D); SEEN_NOW[k] = 1; return false; }
function spkSet(){ var st = db().set.spk || {gain:2, loud:true, auto:true, echo:false, rec:false, in:0, cast:false, play:true}; if(st.play == null) st.play = true; return st; }
function spkSave(st){ var D = db(); D.set.spk = st; H.save("ihsan_meet", D); }
var INS = null;
function spkPage(el){ if(!N().spkStart){ el.innerHTML = '<div class="card mut">' + L("Pembesar suara hanya dalam aplikasi Android.", "Speaker is only in the Android app.") + '</div>'; return; }
  if(!INS){ try{ INS = JSON.parse(N().audioInputs() || "[]"); }catch(e){ INS = []; } }
  var st = spkSet(), on = SP.on, bts = INS.filter(function(x){ return x.k === "bt"; }), others = INS.filter(function(x){ return x.k !== "phone" && x.k !== "bt"; });
  if(st.in && !INS.some(function(x){ return x.id === st.in; })) st.in = 0;
  // 0.6.56 (owner): the phone's own mic is not offered (a phone mic next to its own loudspeaker only howls); pick the first other mic
  if(!st.in){ var f0 = others.concat(bts)[0]; if(f0) st.in = f0.id; }
  var IN = {usb:["🎙", L("Mikrofon USB / tanpa wayar", "USB / wireless mic")], wired:["🎧", L("Mikrofon fon kepala", "Headset mic")], line:["🔌", L("Input kabel", "Line in")], other:["🎙", L("Mikrofon lain", "Other mic")]};
  var chip = function(id, label, dis){ return '<button class="chip' + ((st.in || 0) === id ? ' on' : '') + '" data-si="' + id + '"' + (on || dis ? ' disabled' : '') + '>' + label + '</button>'; };
  el.innerHTML = '<div class="card"><div class="mtLh"><span class="mtDot' + (on ? '' : ' off') + '"></span><b>🔊 ' + L("Pembesar suara", "Speaker") + '</b><small>' + (on ? L("Sedang bercakap", "Live") : L("Sedia", "Ready")) + '</small></div>' +
      '<div class="mtMeter"><canvas id="spC" width="320" height="64"></canvas></div><div class="mtHowl" id="spH">' + E(SP.howl) + '</div>' +
      '<div class="mtQh">🎙 ' + L("Mikrofon", "Microphone") + '</div><div class="mtTpl">' +
        '<div class="mtBtRow">' + (bts.length ? bts.map(function(x){ return chip(x.id, "🎧 Bluetooth · " + E(x.name || L("earbud", "earbuds"))); }).join("") : '<button class="chip mtNoBt" id="spBt">🎧 Bluetooth · ' + L("Tiada mikrofon disambung", "No mic connected") + '</button>') +
        (on ? '' : '<button class="btn alt g3d mtFind" id="spRf">↻ ' + L("Cari mikrofon", "Find mic") + '</button>') + '</div>' +
        others.map(function(x){ var t = IN[x.k] || IN.other; return chip(x.id, t[0] + ' ' + E(t[1]) + (x.name ? ' · ' + E(x.name) : '')); }).join("") + '</div>' +
      '<div class="mtQh">📢 ' + L("Keluar", "Output") + '</div><div class="rseg"><button class="chip' + (st.loud ? ' on' : '') + '" data-so="1"' + (on ? ' disabled' : '') + '>📱 ' + L("Pembesar suara telefon", "Phone loudspeaker") + '</button><button class="chip' + (!st.loud ? ' on' : '') + '" data-so="0"' + (on ? ' disabled' : '') + '>🔌 ' + L("Speaker bersambung", "Connected speaker") + '</button></div>' +
      '<div class="gwSl"><span>🔈 ' + L("Kuat", "Volume") + '</span><input type="range" id="spG" min="0.5" max="6" step="0.1" value="' + st.gain + '"><b id="spGv">' + Math.round(st.gain * 10) / 10 + '×</b></div>' +
      '<label class="pdchk"><input type="checkbox" id="spA"' + (st.auto ? ' checked' : '') + '> 🛡 ' + L("Anti-dengung (kurangkan kuat bila berdengung)", "Anti-feedback (lowers the volume when it howls)") + '</label>' +
      '<label class="pdchk"><input type="checkbox" id="spE"' + (st.echo ? ' checked' : '') + (on ? ' disabled' : '') + '> 🌫 ' + L("Kurangkan gema & bising", "Reduce echo & noise") + '</label>' +
      '<label class="pdchk"><input type="checkbox" id="spR"' + (st.rec ? ' checked' : '') + (on ? ' disabled' : '') + '> ⏺ ' + L("Simpan rakaman untuk nota mesyuarat", "Save a recording for meeting notes") + '</label>' +
      '<label class="pdchk"><input type="checkbox" id="spT"' + (st.tr ? ' checked' : '') + (on ? ' disabled' : '') + '> 📝 ' + L("Transkrip selepas henti (✨ AI, perlukan internet)", "Transcribe after stopping (✨ AI, needs internet)") + '</label>' +
      '<label class="pdchk"><input type="checkbox" id="spB"' + (st.cast ? ' checked' : '') + (on ? ' disabled' : '') + '> 📡 ' + L("Siarkan ke telefon lain (Wi-Fi / hotspot yang sama)", "Broadcast to other phones (same Wi-Fi / hotspot)") + '</label>' +
      (st.cast ? '<label class="pdchk"><input type="checkbox" id="spP"' + (st.play ? ' checked' : '') + (on ? ' disabled' : '') + '> 📢 ' + L("Juga mainkan pada speaker ini", "Also play on this speaker") + '</label>' : '') +
      (!on && !st.in ? '<div class="mtNoMic">🎙 ' + L("Sambungkan mikrofon tanpa wayar, USB atau earbud Bluetooth dahulu, kemudian ↻ Cari mikrofon.", "Connect a wireless, USB or Bluetooth earbud mic first, then ↻ Find mic.") + '</div>' : '') +
      '<button class="btn ' + (on ? 'alt' : 'gold') + ' full g3d mtSpkGo' + (!on && !st.in ? ' dis' : '') + '" id="spGo">' + (on ? '⏹ ' + L("Henti", "Stop") : '▶ ' + L("Mula", "Start")) + '</button></div>' +
      (on && SP.CS ? '<div class="card mtCast"><div class="mtQh">📡 ' + L("Imbas untuk mendengar", "Scan to listen") + ' · 👥 <b id="spN">' + SP.nL + '</b></div><div class="mtQr" id="spQ"></div><div class="mtUrl">' + E(SP.CS.url) + '</div><div class="mut tiny">' + L("Telefon pendengar mesti di Wi-Fi yang sama atau hotspot telefon ini. Dengan My Ihsan: Mesyuarat › 👂 Dengar › Imbas. Tanpa aplikasi (iPhone juga): imbas dengan kamera dan buka pautan.", "Listeners must be on the same Wi-Fi or this phone's hotspot. With My Ihsan: Meeting › 👂 Listen › Scan. Without the app (iPhone too): scan with the camera and open the link.") + '</div><button class="chip" id="spSh">📤 ' + L("Kongsi pautan", "Share link") + '</button></div>' : '') +
      '<div class="card"><details class="gwRv mtTips"' + (seen("spk") ? '' : ' open') + '><summary><b>💡 ' + L("Cara guna", "How to use it") + '</b></summary><div class="small">• ' + L("Mikrofon tanpa wayar USB-C (lavalier) paling jelas dan bebas bergerak.", "A USB-C wireless (lapel) mic is the clearest and lets you walk around.") + '<br>• ' + L("Earbud Bluetooth: sambungkan dahulu, kemudian ↻. Kualiti seperti panggilan telefon.", "Bluetooth earbuds: connect them first, then ↻. Phone-call quality.") + '<br>• ' + L("Dewan besar: sambung kabel ke amplifier / speaker. Speaker Bluetooth lewat ~0.2 s, jadi gema dalam bilik yang sama.", "A big hall: cable into an amplifier / speaker. Bluetooth speakers lag ~0.2 s, so you hear an echo in the same room.") + '<br>• ' + L("Jauhkan mikrofon dari speaker untuk elak dengung.", "Keep the mic away from the speaker to avoid howling.") + '<br>• ' + L("Skrin boleh dimatikan; pemberitahuan ada butang Henti.", "The screen can go off; the notification has a Stop button.") + '<br>• ' + L("Jaga pendengaran: mula perlahan.", "Protect hearing: start low.") + '</div></details></div>';
  meterDraw("#spC", SP.hist, true);
  var q = function(x){ return el.querySelector(x); }, re = function(){ spkPage(el); };
  el.querySelectorAll("[data-si]").forEach(function(b){ b.onclick = function(){ var id = +b.getAttribute("data-si"), x = INS.filter(function(y){ return y.id === id; })[0];
    if(x && x.k === "bt" && N().hasPerm && !N().hasPerm("bt")){ if(N().requestPerm) N().requestPerm("bt"); H.toast(L("Benarkan Peranti berdekatan (Bluetooth), kemudian pilih lagi.", "Allow Nearby devices (Bluetooth), then pick it again.")); return; }
    st.in = id; spkSave(st); re(); if(x && x.k === "bt") H.toast("🎧 " + L("Mikrofon earbud berkualiti panggilan telefon. Untuk suara paling jelas, guna mikrofon tanpa wayar USB-C.", "Earbud mics are phone-call quality. For the clearest voice, use a USB-C wireless mic.")); }; });
  var bt0 = q("#spBt"); if(bt0) bt0.onclick = function(){ if(N().hasPerm && !N().hasPerm("bt") && N().requestPerm){ N().requestPerm("bt"); }
    INS = null; spkPage(el); if(!INS.some(function(x){ return x.k === "bt"; })) H.toast("🎧 " + L("Tiada earbud bersambung. Sambungkan dalam Tetapan Bluetooth telefon, kemudian ketik ↻.", "No earbuds connected. Connect them in the phone's Bluetooth settings, then tap ↻.")); };
  var rf = q("#spRf"); if(rf) rf.onclick = function(){ if(N().hasPerm && !N().hasPerm("bt") && N().requestPerm) N().requestPerm("bt"); INS = null; spkPage(el); var n = (INS || []).filter(function(x){ return x.k !== "phone"; }).length; H.toast(n ? "🎙 " + L(n + " mikrofon dijumpai", n + " mic(s) found") : L("Tiada mikrofon lain dijumpai. Sambungkan earbud / mikrofon, kemudian cuba lagi.", "No other mic found. Connect your earbuds / mic, then try again.")); };
  el.querySelectorAll("[data-so]").forEach(function(b){ b.onclick = function(){ st.loud = b.getAttribute("data-so") === "1"; spkSave(st); re(); }; });
  q("#spG").oninput = function(){ st.gain = +this.value; q("#spGv").textContent = Math.round(st.gain * 10) / 10 + "×"; if(SP.on) try{ N().spkSet(JSON.stringify({gain:st.gain})); }catch(e){} };
  q("#spG").onchange = function(){ spkSave(st); };
  q("#spA").onchange = function(){ st.auto = this.checked; spkSave(st); if(SP.on) try{ N().spkSet(JSON.stringify({auto:st.auto})); }catch(e){} };
  q("#spE").onchange = function(){ st.echo = this.checked; spkSave(st); };
  q("#spR").onchange = function(){ st.rec = this.checked; if(!st.rec) st.tr = false; spkSave(st); re(); };
  q("#spT").onchange = function(){ st.tr = this.checked; if(st.tr && !st.rec){ st.rec = true; H.toast("⏺ " + L("Rakaman dihidupkan: transkrip dibuat daripada rakaman.", "Recording turned on: the transcript is made from the recording.")); } spkSave(st); re(); };
  q("#spB").onchange = function(){ st.cast = this.checked; spkSave(st); re(); };
  var pp = q("#spP"); if(pp) pp.onchange = function(){ st.play = this.checked; spkSave(st); };
  var qr = q("#spQ"); if(qr && SP.CS){ var put_ = function(){ try{ qr.innerHTML = H.qrSvg(SP.CS.url); }catch(e){} }; if(window.NostrKit) put_(); else H.loadJs(["groups/nostrkit.js"], put_, function(){}); }
  var sh = q("#spSh"); if(sh) sh.onclick = function(){ var t = "📡 " + L("Dengar siaran langsung (Wi-Fi yang sama): ", "Listen live (same Wi-Fi): ") + SP.CS.url; if(N().shareText) N().shareText(t); };
  q("#spGo").onclick = function(){ if(SP.on){ try{ N().spkStop(); }catch(e){} return; }
    if(!st.in){ H.toast("🎙 " + L("Sambungkan mikrofon dahulu (bukan mikrofon telefon).", "Connect a mic first (not the phone's own mic).")); return; }
    if(N().hasPerm && !N().hasPerm("mic")){ if(N().requestPerm) N().requestPerm("mic"); H.toast(L("Benarkan mikrofon, kemudian tekan lagi", "Allow the microphone, then tap again")); return; }
    SP.m = null; SP.tr = !!(st.rec && st.tr); if(st.rec){ SP.m = {id:uid(), title:"🔊 " + L("Pembesar suara", "Speaker") + " · " + new Date().toLocaleString(loc(), {day:"numeric", month:"short", hour:"numeric", minute:"2-digit"}), tpl:"gen", mode:"rec", lang:H.en() ? "en" : "ms", people:[], t0:Date.now(), dur:0, marks:[], notes:[], lines:[], sec:{}, segs:0, spk:true}; put(SP.m); }
    try{ if(N().keepAwake) N().keepAwake(true); }catch(e){}
    SP.CS = null; SP.nL = 0; if(st.cast){ var key = Math.random().toString(36).slice(2, 8), r = {}; try{ r = JSON.parse(N().castStart(JSON.stringify({key:key, title:L("Siaran My Ihsan", "My Ihsan live")})) || "{}"); }catch(e){}
      if(!r.ok || !(r.ips || []).length){ H.toast("📡 " + L("Sambung ke Wi-Fi atau hidupkan hotspot dahulu.", "Connect to Wi-Fi or turn on the hotspot first.")); try{ N().castStop(); }catch(e){} try{ if(N().keepAwake) N().keepAwake(false); }catch(e){} SP.m = null; return; }
      SP.CS = {url:"http://" + r.ips[0] + ":" + r.port + "/?k=" + key}; }
    if(!N().spkStart(JSON.stringify({gain:st.gain, loud:st.loud, auto:st.auto, limit:true, echo:st.echo, in:st.in || 0, rec:SP.m ? SP.m.id : "", play:st.cast ? st.play : true}))){ H.toast(L("Benarkan mikrofon dahulu", "Allow the microphone first")); SP.m = null; if(SP.CS){ try{ N().castStop(); }catch(e){} SP.CS = null; } } }; }

// ---------- 👂 Listen to a broadcast on the same Wi-Fi / hotspot ----------
function lisPage(el){ if(!N().listenStart){ el.innerHTML = '<div class="card mut">' + L("Buka pautan siaran dalam pelayar.", "Open the broadcast link in the browser.") + '</div>'; return; }
  var on = LS.on;
  el.innerHTML = '<div class="card"><div class="mtLh"><span class="mtDot' + (on ? '' : ' off') + '"></span><b>👂 ' + L("Dengar siaran", "Listen") + '</b><small>' + (on ? L("Sedang mendengar", "Listening") : "") + '</small></div>' +
    '<div class="mtMeter"><canvas id="lsC" width="320" height="64"></canvas></div>' +
    (on ? '<button class="btn alt full g3d mtSpkGo" id="lsStop">⏹ ' + L("Berhenti", "Stop") + '</button>' : '<button class="btn gold full g3d mtSpkGo" id="lsScan">📷 ' + L("Imbas QR siaran", "Scan the broadcast QR") + '</button><div class="radd" style="margin-top:10px"><input id="lsU" class="rin" placeholder="http://192.168.…:8765/?k=…" value="' + E(db().set.lastCast || "") + '"><button class="btn alt" id="lsGo">▶</button></div>') +
    '<div class="mut small" style="margin-top:10px">🎧 ' + L("Sambung ke Wi-Fi yang sama, atau ke hotspot telefon penyampai. Guna fon telinga. Tiada internet diperlukan.", "Join the same Wi-Fi, or the speaker phone's hotspot. Use earphones. No internet needed.") + '</div></div>' +
    '<details class="card mtTips"' + (seen("lis") ? '' : ' open') + '><summary><b>❓ ' + L("Di mana QR?", "Where is the QR?") + '</b></summary>' +
    [["1", L("QR ada pada telefon penyampai (orang yang bercakap).", "The QR is on the speaker's phone (the person talking).")],
     ["2", L("Pada telefon itu: Mesyuarat › 🔊 Pembesar suara › tanda 📡 Siarkan ke telefon lain › ▶ Mula.", "On that phone: Meeting › 🔊 Speaker › tick 📡 Broadcast to other phones › ▶ Start.")],
     ["3", L("QR dan pautan muncul di bawah butang Henti. Imbas di sini dengan 📷, atau taip pautan.", "The QR and link appear below the Stop button. Scan it here with 📷, or type the link.")],
     ["📶", L("Kedua-dua telefon mesti pada Wi-Fi yang sama, atau sambung ke hotspot telefon penyampai.", "Both phones must be on the same Wi-Fi, or connected to the speaker phone's hotspot.")]].map(function(x){ return '<div class="mtTip"><span>' + x[0] + '</span><div><small>' + E(x[1]) + '</small></div></div>'; }).join("") + '</details>';
  meterDraw("#lsC", LS.hist, false);
  var go = function(u){ var D = db(); D.set.lastCast = u; H.save("ihsan_meet", D); N().listenStart(u.replace(/\/\?k=/, "/live.wav?k=")); };
  var st_ = el.querySelector("#lsStop"); if(st_) st_.onclick = function(){ try{ N().listenStop(); }catch(e){} };
  var sc = el.querySelector("#lsScan"); if(sc) sc.onclick = function(){ H.qrScan(function(x){ return /^https?:\/\/[\d.]+:\d+\/\?k=\w+/.test(x); }, function(x){ go(x); }, L("Imbas QR siaran", "Scan the broadcast QR")); };
  var g = el.querySelector("#lsGo"); if(g) g.onclick = function(){ var u = el.querySelector("#lsU").value.trim(); if(/^https?:\/\/[\d.]+:\d+\/\?k=\w+/.test(u)) go(u); else H.toast(L("Pautan tidak sah", "Not a valid link")); }; }

// ---------- detail ----------
function detail(){ var m = get(CUR); if(!m){ CUR = null; draw(); return; } if(LIVE && !document.querySelector(".mtLive")){ H.off("speech", LIVE.fn); try{ if(N().speechOffline) N().speechOffline(false); }catch(e){} LIVE = null; }
  var t = tpl(m.tpl), s = extract(m), hasTxt = (m.lines || []).length || m.aiT;
  var h = '<div class="mtTop"><button class="chip g3d" id="mtBack">‹ ' + L("Semua", "All") + '</button><b>' + t[1] + ' ' + E(m.title) + '</b><button class="chip g3d" id="mtMore">⋯</button></div>' +
    '<div class="mut small mtMeta">' + E(new Date(m.t0).toLocaleString(loc(), {weekday:"short", day:"numeric", month:"short", hour:"numeric", minute:"2-digit"})) + ' · ' + mmss(m.dur || 0) + (m.people && m.people.length ? ' · 👥 ' + E(m.people.join(", ")) : '') + (m.cut ? ' · ⚠ ' + L("rakaman terhenti awal", "recording stopped early") : '') + '</div>' +
    '<div class="rseg mtTabs">' + [["sum", "✅ " + L("Ringkasan", "Summary")], ["txt", "📝 " + L("Transkrip", "Transcript")], ["mk", "⭐ " + L("Tanda & nota", "Marks & notes")]].concat(m.segs ? [["aud", "🎧 Audio"]] : []).map(function(x){ return '<button class="chip' + (TAB === x[0] ? ' on' : '') + '" data-mt="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div><div id="mtB"></div>';
  EL.innerHTML = h; var B = EL.querySelector("#mtB");
  EL.querySelector("#mtBack").onclick = function(){ CUR = null; draw(); };
  EL.querySelector("#mtMore").onclick = function(){ moreSheet(m); };
  EL.querySelectorAll("[data-mt]").forEach(function(b){ b.onclick = function(){ TAB = b.getAttribute("data-mt"); detail(); }; });
  if(TAB === "txt") tabTxt(B, m); else if(TAB === "mk") tabMk(B, m); else if(TAB === "aud") tabAud(B, m); else tabSum(B, m, s, t, hasTxt); }
function tabSum(B, m, s, t, hasTxt){ m.sec = m.sec || {}; m.done = m.done || {};
  var sect = function(ic, title, arr, f){ return arr.length ? '<div class="card"><h3>' + ic + ' ' + title + ' <span class="mut small">' + arr.length + '</span></h3>' + arr.map(f).join("") + '</div>' : ''; };
  var h = (!hasTxt && !(m.notes || []).length ? '<div class="card mtWarn">💡 ' + (m.mode === "rec" ? L("Buat teks dahulu dalam 📝 Transkrip (✨ AI), atau tulis nota, supaya tindakan & keputusan dapat dikesan.", "Make the text first in 📝 Transcript (✨ AI), or add notes, so action items and decisions can be found.") : L("Tiada teks lagi.", "No text yet.")) + '</div>' : '') +
    sect("✅", L("Tindakan", "Action items"), s.act, function(a, i){ var k = "a" + i; return '<div class="mtAct' + (m.done[k] ? ' ok' : '') + '"><input type="checkbox" data-ad="' + k + '"' + (m.done[k] ? ' checked' : '') + '><div><span>' + E(a.t) + '</span><small>' + [a.who ? '👤 ' + E(a.who) : '', a.due ? '📅 ' + E(a.due) : '', a.s != null ? '⏱ ' + mmss(a.s) : ''].filter(Boolean).join(' · ') + '</small></div></div>'; }) +
    (s.act.length ? '<div class="card"><button class="btn alt full" id="mtPl">📝 ' + L("Hantar tindakan ke Perancang", "Send action items to the Planner") + '</button></div>' : '') +
    sect("🏛", L("Keputusan", "Decisions"), s.dec, function(o){ return '<div class="mtLi">• ' + E(o.x) + '</div>'; }) +
    sect("❓", L("Soalan", "Questions"), s.q, function(o){ return '<div class="mtLi">• ' + E(o.x) + '</div>'; }) +
    sect("⭐", L("Detik penting", "Key moments"), s.key, function(o){ return '<div class="mtLi"><b>' + mmss(o.s) + '</b> ' + E(o.x) + '</div>'; }) +
    sect("🔢", L("Angka & tarikh", "Numbers & dates"), s.num, function(o){ return '<div class="mtLi"><b>' + E(o.v) + '</b> <span class="mut">' + E(o.x.slice(0, 90)) + '</span></div>'; }) +
    '<div class="card"><h3>' + t[1] + ' ' + E(L(t[2], t[3])) + '</h3>' + t[4].map(function(x, i){ return '<div class="mtQh">' + E(L(x[0], x[1])) + '</div><textarea class="rin mtSec" data-sec="' + i + '" rows="2">' + E(m.sec[i] || "") + '</textarea>'; }).join("") + '</div>' +
    '<div class="card"><h3>✨ ' + L("Ringkasan AI (pilihan)", "AI summary (optional)") + '</h3>' + (m.ai ? '<div class="mtAI">' + E(m.ai).replace(/\n/g, "<br>") + '</div>' : '<div class="mut small">' + L("Hanya teks dihantar kepada AI dalam Tetapan › AI, bila anda tekan. Tiada audio.", "Only the text is sent to the AI in Settings › AI, when you tap. No audio.") + '</div>') + '<button class="btn alt full" id="mtAI" style="margin-top:8px"' + (hasTxt || (m.notes || []).length ? '' : ' disabled') + '>✨ ' + (m.ai ? L("Buat semula", "Make again") : L("Ringkaskan dengan AI", "Summarise with AI")) + '</button><div id="mtAIs" class="mut small"></div></div>' +
    '<div class="mut tiny" style="padding:4px 6px 14px">' + L("Tindakan, keputusan dan soalan dikesan di telefon tanpa AI daripada perkataan seperti “akan”, “perlu”, “setuju”, “will”, “agreed”. Semak dan betulkan.", "Action items, decisions and questions are found on the phone without AI, from words like “akan”, “perlu”, “setuju”, “will”, “agreed”. Check and correct them.") + '</div>';
  B.innerHTML = h;
  B.querySelectorAll("[data-ad]").forEach(function(c){ c.onchange = function(){ m.done[c.getAttribute("data-ad")] = c.checked; put(m); c.parentNode.classList.toggle("ok", c.checked); }; });
  B.querySelectorAll("[data-sec]").forEach(function(x){ x.onchange = function(){ m.sec[x.getAttribute("data-sec")] = x.value; put(m); }; });
  var pl = B.querySelector("#mtPl"); if(pl) pl.onclick = function(){ toPlanner(m, s); };
  B.querySelector("#mtAI").onclick = function(){ aiSummary(m, B.querySelector("#mtAIs")); }; }
function toPlanner(m, s){ var go = function(){ var by = {}, today = ymd(new Date()); s.act.forEach(function(a, i){ if(m.done["a" + i]) return; var k = a.due && a.due >= today ? a.due : today; (by[k] = by[k] || []).push({t:a.t.slice(0, 120), note:"📋 " + m.title + (a.who ? " · 👤 " + a.who : "")}); });
    var n = 0; Object.keys(by).forEach(function(k){ n += PlannerView.addItems(H, k, by[k]); }); H.toast("📝 " + n + " " + L("tindakan ditambah ke Perancang", "action items added to the Planner")); };
  if(window.PlannerView) go(); else H.loadJs(["planner/planner.js"], go, function(){}); }
function tabTxt(B, m){
  var txt = m.aiT || (m.lines || []).map(function(l){ return "[" + mmss(l.s) + "] " + (l.sp ? l.sp + ": " : "") + l.x; }).join("\n");
  B.innerHTML = (m.mode === "rec" ? '<div class="card"><h3>✨ ' + L("Buat teks daripada audio", "Make text from the audio") + '</h3><div class="mut small">' + L("Setiap bahagian 4 minit dihantar kepada Google Gemini (kunci anda dalam Tetapan › AI). Lebih tepat untuk BM + English bercampur, dengan label penutur. Perlukan internet.", "Each 4-minute part is sent to Google Gemini (your key in Settings › AI). More accurate for mixed Malay + English, with speaker labels. Needs the internet.") + '</div><button class="btn gold full g3d" id="mtTr" style="margin-top:8px">✨ ' + (m.aiT ? L("Transkrip semula", "Transcribe again") : L("Transkrip dengan AI", "Transcribe with AI")) + ' (' + m.segs + ' ' + L("bahagian", "parts") + ')</button><div id="mtTrS" class="mut small" style="margin-top:6px"></div></div>' : '') +
    '<div class="card"><textarea id="mtTx" class="rin mtTxt" rows="14" placeholder="' + E(L("Teks mesyuarat. Boleh ditaip, ditampal atau diperbaiki di sini.", "The meeting text. Type, paste or correct it here.")) + '">' + E(txt) + '</textarea><div class="btns" style="margin-top:8px;flex-wrap:wrap"><button class="btn alt" id="mtTs">💾 ' + L("Simpan", "Save") + '</button><button class="btn alt" id="mtImp">📥 ' + L("Import", "Import") + '</button></div>' +
    ((m.people || []).length && (m.lines || []).length && !m.aiT ? '<div class="mut tiny" style="margin-top:6px">👤 ' + L("Label penutur: tulis “Nama: ” di awal baris.", "Speaker labels: write “Name: ” at the start of a line.") + '</div>' : '') + '</div>';
  B.querySelector("#mtTs").onclick = function(){ saveTxt(m, B.querySelector("#mtTx").value); H.toast("💾 " + L("Disimpan", "Saved")); };
  B.querySelector("#mtImp").onclick = function(){ importSheet(m); };
  var tr = B.querySelector("#mtTr"); if(tr) tr.onclick = function(){ transcribe(m, B.querySelector("#mtTrS"), tr); }; }
function saveTxt(m, v){ if(m.aiT != null && m.aiT !== ""){ m.aiT = v; } else { m.lines = v.split(/\n+/).filter(function(x){ return x.trim(); }).map(function(line){ var mm = /^\[(\d+):(\d\d)(?::(\d\d))?\]\s*(?:([^:]{1,24}):\s)?(.*)$/.exec(line.trim()); if(mm){ var s0 = mm[3] != null ? +mm[1] * 3600 + +mm[2] * 60 + +mm[3] : +mm[1] * 60 + +mm[2]; return {s:s0, sp:mm[4] || "", x:mm[5]}; } return {s:null, x:line.trim()}; }); } put(m); }
function importSheet(m){ var ov = H.showSheet("📥 " + L("Import transkrip", "Import transcript"), '<div class="mut small">' + L("Dari Google Meet (Docs transkrip), Zoom (.vtt / .txt) atau Teams (.vtt / .docx disalin sebagai teks): tampal di sini atau buka fail.", "From Google Meet (the transcript Doc), Zoom (.vtt / .txt) or Teams (.vtt / .docx copied as text): paste here or open a file.") + '</div><textarea id="imT" class="rin" rows="10" style="margin-top:8px"></textarea><input type="file" id="imF" accept=".txt,.vtt,.srt,text/plain" style="margin-top:8px"><button class="btn gold full g3d" id="imGo" style="margin-top:10px">' + L("Guna teks ini", "Use this text") + '</button>');
  ov.querySelector("#imF").onchange = function(){ var f = this.files && this.files[0]; if(!f) return; var r = new FileReader(); r.onload = function(){ ov.querySelector("#imT").value = String(r.result || ""); }; r.readAsText(f); };
  ov.querySelector("#imGo").onclick = function(){ var v = cleanVtt(ov.querySelector("#imT").value); if(!v.trim()) return; m.aiT = ""; m.lines = parseImport(v); if(!m.dur){ var last = m.lines.filter(function(l){ return l.s != null; }).pop(); m.dur = last ? last.s : 0; } put(m); H.closeOverlay(); TAB = "sum"; draw(); H.toast("📥 " + m.lines.length + " " + L("baris", "lines")); }; }
function cleanVtt(t){ var out = [], cue = null; String(t).replace(/\r/g, "").split("\n").forEach(function(line){ var x = line.trim(), tm = /^(\d{1,2}:)?(\d{1,2}):(\d{2})[.,]\d{3}\s*-->/.exec(x);
    if(/^WEBVTT/.test(x) || /^\d+$/.test(x) && !cue || /^NOTE\b/.test(x)) return; if(tm){ cue = (tm[1] ? +tm[1].slice(0, -1) * 3600 : 0) + +tm[2] * 60 + +tm[3]; return; }
    if(!x){ return; } x = x.replace(/<v\s+([^>]+)>/g, "$1: ").replace(/<[^>]+>/g, ""); out.push(cue != null ? "[" + mmss(cue) + "] " + x : x); cue = null; }); return out.join("\n"); }
function parseImport(v){ return v.split(/\n+/).filter(function(x){ return x.trim(); }).map(function(line){ var mm = /^\[(\d+):(\d\d)(?::(\d\d))?\]\s*(?:([^:]{1,30}):\s)?(.*)$/.exec(line.trim()); if(mm){ var s0 = mm[3] != null ? +mm[1] * 3600 + +mm[2] * 60 + +mm[3] : +mm[1] * 60 + +mm[2]; return {s:s0, sp:(mm[4] || "").trim(), x:mm[5]}; }
    var sp = /^([A-Z][\w .'-]{1,28}):\s(.+)$/.exec(line.trim()); return sp ? {s:null, sp:sp[1], x:sp[2]} : {s:null, x:line.trim()}; }); }
function tabMk(B, m){ var all = (m.marks || []).map(function(x, i){ return {s:x.s, x:x.n, k:"m", i:i}; }).concat((m.notes || []).map(function(x, i){ return {s:x.s, x:x.x, k:"n", i:i}; })).sort(function(a, b){ return a.s - b.s; });
  B.innerHTML = '<div class="card">' + (all.length ? all.map(function(o){ return '<div class="mtMk"><button class="chip" data-seek="' + o.s + '">' + (o.k === "m" ? "⭐" : "📝") + ' ' + mmss(o.s) + '</button><input class="rin" data-mke="' + o.k + o.i + '" value="' + E(o.x || "") + '" placeholder="' + E(L("Label…", "Label…")) + '"><button class="chip" data-mkx="' + o.k + o.i + '">✕</button></div>'; }).join("") : '<div class="mut small">' + L("Tiada tanda atau nota.", "No marks or notes.") + '</div>') +
    '<div class="radd" style="margin-top:10px"><input id="mkN" class="rin" placeholder="' + E(L("Tambah nota…", "Add a note…")) + '"><button class="btn alt" id="mkA">＋</button></div></div>';
  B.querySelectorAll("[data-mke]").forEach(function(i){ i.onchange = function(){ var a = i.getAttribute("data-mke"), k = a[0], n = +a.slice(1); if(k === "m") m.marks[n].n = i.value; else m.notes[n].x = i.value; put(m); }; });
  B.querySelectorAll("[data-mkx]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-mkx"), k = a[0], n = +a.slice(1); if(k === "m") m.marks.splice(n, 1); else m.notes.splice(n, 1); put(m); tabMk(B, m); }; });
  B.querySelectorAll("[data-seek]").forEach(function(b){ b.onclick = function(){ if(!m.segs) return; TAB = "aud"; detail(); setTimeout(function(){ seek(m, +b.getAttribute("data-seek")); }, 150); }; });
  B.querySelector("#mkA").onclick = function(){ var v = B.querySelector("#mkN").value.trim(); if(!v) return; m.notes.push({s:m.dur || 0, x:v}); put(m); tabMk(B, m); }; }
// audio: the segments play one after another; marks jump to their time
var PLAY = null;
function tabAud(B, m){ B.innerHTML = '<div class="card"><div class="mtSegs">' + Array.apply(null, {length:m.segs}).map(function(_, i){ return '<button class="chip" data-sg="' + i + '">' + mmss(i * SEG_MS / 1000) + '</button>'; }).join("") + '</div><audio id="mtA" controls style="width:100%;margin-top:8px"></audio><div class="mut tiny" id="mtAs"></div>' +
    ((m.marks || []).length ? '<div class="mtQh">⭐ ' + L("Lompat ke tanda", "Jump to a mark") + '</div><div class="mtSegs">' + m.marks.map(function(x){ return '<button class="chip" data-seek="' + x.s + '">⭐ ' + mmss(x.s) + (x.n ? ' ' + E(x.n) : '') + '</button>'; }).join("") + '</div>' : '') + '</div>';
  B.querySelectorAll("[data-sg]").forEach(function(b){ b.onclick = function(){ playSeg(m, +b.getAttribute("data-sg"), 0); }; });
  B.querySelectorAll("[data-seek]").forEach(function(b){ b.onclick = function(){ seek(m, +b.getAttribute("data-seek")); }; });
  playSeg(m, 0, 0, true); }
function seek(m, s){ var i = Math.min(m.segs - 1, Math.floor(s * 1000 / SEG_MS)); playSeg(m, i, Math.max(0, s - i * SEG_MS / 1000 - 3)); }
function playSeg(m, i, off, quiet){ var a = document.getElementById("mtA"); if(!a || i >= m.segs) return; segGet(m.id + "#" + pad(i), function(b){ if(!b){ var st = document.getElementById("mtAs"); if(st) st.textContent = "⚠ " + L("Bahagian audio tiada", "Audio part missing"); return; }
  if(PLAY) try{ URL.revokeObjectURL(PLAY); }catch(e){} PLAY = URL.createObjectURL(b); a.src = PLAY; a.onloadedmetadata = function(){ try{ a.currentTime = off || 0; }catch(e){} }; a.onended = function(){ playSeg(m, i + 1, 0); };
  var st = document.getElementById("mtAs"); if(st) st.textContent = L("Bahagian ", "Part ") + (i + 1) + "/" + m.segs;
  document.querySelectorAll("[data-sg]").forEach(function(x){ x.classList.toggle("on", +x.getAttribute("data-sg") === i); }); if(!quiet) a.play().catch(function(){}); }); }

// ---------- AI: transcribe the audio (Gemini, segment by segment) ----------
function ai(cb){ var go = function(){ var A = window.HalalAI; if(A && !A._on){ A._on = H.on; A._off = H.off; } cb(); }; if(window.HalalAI) go(); else H.loadJs(["halal/halal_ai.js"], go, function(){ H.toast("⚠ AI"); }); }
function toWav(f32, rate){ var n = f32.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf), w = function(o, s){ for(var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
  for(var i = 0, o = 44; i < n; i++, o += 2){ var x = Math.max(-1, Math.min(1, f32[i])); v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7fff, true); } return buf; }
function b64(buf){ var b = new Uint8Array(buf), s = "", CH = 0x8000; for(var i = 0; i < b.length; i += CH) s += String.fromCharCode.apply(null, b.subarray(i, i + CH)); return btoa(s); }
function segWav(blob){ return blob.arrayBuffer().then(function(ab){ var AC = window.AudioContext || window.webkitAudioContext, ac = new AC(); return new Promise(function(res, rej){ ac.decodeAudioData(ab, function(dec){ try{ ac.close(); }catch(e){}
  var len = Math.ceil(dec.duration * 16000), oc = new OfflineAudioContext(1, Math.max(1, len), 16000), src = oc.createBufferSource(); src.buffer = dec; src.connect(oc.destination); src.start(0);
  oc.startRendering().then(function(r){ res(b64(toWav(r.getChannelData(0), 16000))); }, rej); }, rej); }); }); }
function transcribe(m, st, btn){ ai(function(){ var A = window.HalalAI, c = A.cfg();
  if(!A.usable(c, "gemini")){ st.innerHTML = '⚠ ' + L("Perlukan kunci Google Gemini (percuma) dalam Tetapan › AI. Tanpa kunci, guna 📝 Teks langsung atau 📥 Import.", "Needs a Google Gemini key (free) in Settings › AI. Without a key, use 📝 Live text or 📥 Import."); return; }
  btn.disabled = true; var out = [], i = 0, lang = m.lang === "en" ? "English" : m.lang === "mix" ? "Malay and English (mixed; keep each word in the language spoken)" : "Malay (Bahasa Melayu)";
  var next = function(){ if(i >= m.segs){ m.aiT = out.join("\n"); put(m); btn.disabled = false; st.textContent = "✅ " + L("Siap", "Done"); TAB = "sum"; detail(); H.toast("✨ " + L("Transkrip siap", "Transcript ready")); return; }
    st.textContent = "✨ " + L("Bahagian ", "Part ") + (i + 1) + "/" + m.segs + "…";
    var off = i * SEG_MS / 1000;
    segGet(m.id + "#" + pad(i), function(blob){ if(!blob){ i++; next(); return; }
      segWav(blob).then(function(w){ var prev = out.length ? out[out.length - 1].slice(-300) : "";
        return A.run("ask", [{role:"system", content:"You transcribe meeting audio faithfully in " + lang + ". Output only the transcript, one line per speaker turn, in the form [m:ss] Speaker N: text, where the time is from the start of THIS clip. Use 'Speaker 1', 'Speaker 2'… consistently" + ((m.people || []).length ? " (or the real names if they are said or obvious: " + m.people.join(", ") + ")" : "") + ". Add punctuation. Do not summarise, translate or invent words; mark unclear parts as [unclear]." + (prev ? " The previous part ended with: «" + prev + "»; keep the same speaker labels." : "")},
          {role:"user", content:[{type:"text", text:"Transcribe this part of the meeting \"" + m.title + "\"."}, {type:"input_audio", input_audio:{data:w, format:"wav"}}]}], {only:"gemini", max_tokens:8000, temperature:0, limit:150, L2:H.L2x}); })
      .then(function(r){ var t = String(r.text || "").replace(/^```\w*\n?|```$/g, "").trim().split("\n").map(function(line){ var mm = /^\[(\d+):(\d\d)\]\s*(.*)$/.exec(line.trim()); return mm ? "[" + mmss(off + +mm[1] * 60 + +mm[2]) + "] " + mm[3] : line; }).join("\n"); out.push(t); i++; next(); })
      .catch(function(e){ btn.disabled = false; st.textContent = "⚠ " + L("Bahagian ", "Part ") + (i + 1) + ": " + (e && e.message || "AI") + (out.length ? " · " + L("bahagian yang siap disimpan", "finished parts kept") : ""); if(out.length){ m.aiT = out.join("\n"); put(m); } }); }); };
  next(); }); }
function aiSummary(m, st){ ai(function(){ var t = tpl(m.tpl), txt = (m.aiT || (m.lines || []).map(function(l){ return (l.sp ? l.sp + ": " : "") + l.x; }).join("\n")) + ((m.notes || []).length ? "\n\nNotes typed during the meeting:\n" + m.notes.map(function(n){ return "- [" + mmss(n.s) + "] " + n.x; }).join("\n") : "");
  st.textContent = "✨ " + L("Sedang meringkaskan…", "Summarising…");
  window.HalalAI.chat([{role:"system", content:"You write clear meeting minutes in " + (m.lang === "en" ? "English" : "Bahasa Melayu") + ". Use these headings in order: " + t[4].map(function(x){ return m.lang === "en" ? x[1] : x[0]; }).join(", ") + ", then Action items (one per line: - task — who — when). Short bullet points. Only what was said; no invented facts. Plain text, headings on their own line."}, {role:"user", content:"Meeting: " + m.title + "\nPeople: " + (m.people || []).join(", ") + "\n\n" + txt.slice(0, 60000)}], H.L2x, {max_tokens:2500, temperature:0.2})
    .then(function(r){ m.ai = String(r.text || "").trim(); put(m); detail(); }).catch(function(e){ st.textContent = "⚠ " + (e && e.message || "AI"); }); }); }

// ---------- share / lock / delete ----------
function exportText(m, full){ var t = tpl(m.tpl), s = extract(m), L2 = function(a, b){ return L(a, b); };
  var out = ["📋 " + m.title, new Date(m.t0).toLocaleString(loc(), {day:"numeric", month:"long", year:"numeric", hour:"numeric", minute:"2-digit"}) + " · " + mmss(m.dur || 0)];
  if((m.people || []).length) out.push("👥 " + m.people.join(", "));
  t[4].forEach(function(x, i){ if((m.sec || {})[i]) out.push("\n" + L2(x[0], x[1]) + ":\n" + m.sec[i]); });
  if(m.ai) out.push("\n✨ " + L2("Ringkasan", "Summary") + ":\n" + m.ai);
  if(s.act.length) out.push("\n✅ " + L2("Tindakan", "Action items") + ":\n" + s.act.map(function(a){ return "- " + a.t + (a.who ? " — " + a.who : "") + (a.due ? " — " + a.due : ""); }).join("\n"));
  if(s.dec.length) out.push("\n🏛 " + L2("Keputusan", "Decisions") + ":\n" + s.dec.map(function(o){ return "- " + o.x; }).join("\n"));
  if(full){ var tx = m.aiT || (m.lines || []).map(function(l){ return (l.s != null ? "[" + mmss(l.s) + "] " : "") + (l.sp ? l.sp + ": " : "") + l.x; }).join("\n"); if(tx) out.push("\n📝 " + L2("Transkrip", "Transcript") + ":\n" + tx); }
  return out.join("\n") + "\n— My Ihsan"; }
function moreSheet(m){ var ov = H.showSheet("⋯ " + E(m.title), '<div class="btns" style="flex-direction:column;gap:8px"><button class="btn alt full" id="msS">📤 ' + L("Kongsi ringkasan", "Share the summary") + '</button><button class="btn alt full" id="msF">📤 ' + L("Kongsi dengan transkrip", "Share with the transcript") + '</button><button class="btn alt full" id="msR">✏️ ' + L("Tukar tajuk", "Rename") + '</button><button class="btn alt full" id="msL">' + (m.lock ? '🔓 ' + L("Buang kunci PIN", "Remove PIN lock") : '🔒 ' + L("Kunci dengan PIN ibu bapa", "Lock with the parent PIN")) + '</button><button class="btn alt full" id="msD">🗑 ' + L("Padam", "Delete") + '</button></div>');
  var sh = function(full){ var t = exportText(m, full); H.closeOverlay(); if(N().shareText) N().shareText(t); else if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ H.toast(L("Disalin", "Copied")); }); };
  ov.querySelector("#msS").onclick = function(){ sh(false); }; ov.querySelector("#msF").onclick = function(){ sh(true); };
  ov.querySelector("#msR").onclick = function(){ var v = prompt(L("Tajuk", "Title"), m.title); if(v && v.trim()){ m.title = v.trim(); put(m); H.closeOverlay(); detail(); } };
  ov.querySelector("#msL").onclick = function(){ var want = !m.lock, flip = function(){ m.lock = want; put(m); H.closeOverlay(); detail(); H.toast(m.lock ? "🔒 " + L("Dikunci", "Locked") : "🔓 " + L("Kunci dibuang", "Lock removed")); };
    if(m.lock) H.pinAsk(L("Buang kunci", "Remove lock"), flip); else if(H.pinHas && H.pinHas()) flip(); else if(H.pinSet) H.pinSet(flip); else flip(); };
  ov.querySelector("#msD").onclick = function(){ if(!confirm(L("Padam mesyuarat ini dan audionya?", "Delete this meeting and its audio?"))) return; var go = function(){ segDel(m.id, m.segs || 0); var d = db(); d.list = d.list.filter(function(x){ return x.id !== m.id; }); H.save("ihsan_meet", d); H.closeOverlay(); CUR = null; draw(); };
    if(m.lock) H.pinAsk(L("Padam", "Delete"), go); else go(); }; }

window.MeetView = {view:view, active:function(){ return !!(REC || CAP || SP.on || LS.on || (window.Walkie && Walkie.active()) || (LIVE && document.querySelector(".mtLive"))); }, back:function(){ if(document.querySelector(".mtLive")) return true; if(!CUR && PGM !== "list"){ PGM = "list"; draw(); return true; } if(CUR){ CUR = null; draw(); return true; } return false; },
  _t:{importNative:importNative, extract:extract, dueOf:dueOf, cleanVtt:cleanVtt, parseImport:parseImport, toWav:toWav, db:db, get:get, SEG:function(v){ SEG_MS = v; }}};
})();
