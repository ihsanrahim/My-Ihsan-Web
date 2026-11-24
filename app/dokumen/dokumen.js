/* My Ihsan 0.6.60 · Baca › Tulis › Dokumen: an AI document studio next to Karya (owner spec "dokumen-plan.md").
   ① choose one of 50 types → ② fill in (profile fills your details) → ③ AI drafts structured blocks (or the offline template) →
   ④ live A4 preview in 10 themes, tap a block to edit, AI tools, translate, read aloud, export PDF / DOCX / PNG / text / email / WhatsApp / Books.
   Owner answers (2026-11-20): name "Dokumen"; CV stays here; business letterhead = the Business (Niaga) profile; the free AI may be used,
   every AI draft says "check the facts", private types warn before personal details go to the free AI.
   DokumenView.view(el, H) with H = {N, S, L2x, esc, toast, load, save, showSheet, closeOverlay, loadJs, on, off, sharePdf, toBooks, hol, biz, openSettings}. */
(function(){
"use strict";
var H = null, EL = null, T = null, R = null;
var K = {set:"ihsan_dok_set", prof:"ihsan_dok_profile", docs:"ihsan_dok_docs", draft:"ihsan_dok_draft"};
var ST = {pg:"home", cat:"", q:"", id:null, type:null, busy:false, show:null, mq:""};
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function en(){ return H.S.lang === "en"; }
function now(){ return Date.now(); }
function uid(){ return "d" + now().toString(36) + Math.random().toString(36).slice(2, 6); }
function pad(n){ return ("0" + n).slice(-2); }
function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function dOf(k){ var p = String(k || "").split("-"); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null; }
var MON = {ms:["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"], en:["January","February","March","April","May","June","July","August","September","October","November","December"], id:["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]};
function longDate(k, lang){ var d = dOf(k); if(!d) return k || ""; if(lang === "ar") return d.toLocaleDateString("ar", {day:"numeric", month:"long", year:"numeric"}); return d.getDate() + " " + (MON[lang] || MON.ms)[d.getMonth()] + " " + d.getFullYear(); }

// ---------- storage ----------
function set(){ var s = H.load(K.set, null) || {}; s.lang = s.lang || (/^(ms|en|id|ar)$/.test(H.S.ulang || H.S.lang) ? (H.S.ulang || H.S.lang) : "ms"); s.fmt = s.fmt || "my"; s.recent = s.recent || []; s.fav = s.fav || []; s.opt = s.opt || {}; return s; }
function setSave(s){ H.save(K.set, s); }
function profs(){ var p = H.load(K.prof, null) || {}; p.list = p.list || []; if(!p.list.length) p.list.push({id:"me", kind:"me", label:L("Saya", "Me"), name:H.S.name || ""}); p.cur = p.cur || p.list[0].id; return p; }
function profSave(p){ H.save(K.prof, p); }
function curProf(){ var P = profs(), id = P.cur; if(id === "biz"){ var b = H.biz ? H.biz() : null; if(b) return b; } return P.list.filter(function(x){ return x.id === id; })[0] || P.list[0]; }
function docs(){ return H.load(K.docs, null) || []; }
function docsSave(l){ H.save(K.docs, l); }
function docById(id){ return docs().filter(function(d){ return d.id === id; })[0] || null; }
function docPut(d){ var l = docs(), i = l.map(function(x){ return x.id; }).indexOf(d.id); d.updated = now(); if(i >= 0) l[i] = d; else l.unshift(d); docsSave(l.slice(0, 300)); }
function typ(id){ return T.TYPES.filter(function(t){ return t[0] === id; })[0] || null; }
function opts(t){ return t[8] || {}; }
function fieldsOf(t){ return t[7].split(",").map(function(f){ var req = f.charAt(0) === "*"; f = f.replace("*", ""); var d = T.FD[f]; return {k:f, req:req, ms:d[0], en:d[1], kind:d[2], ph:en() ? d[4] : d[3], prof:d[5]}; }); }
function mask(ic){ ic = String(ic || ""); var m = ic.match(/^(\d{4})\d{2}-?\d{2}-?(\d{4})$/); return m ? m[1] + "**-**-" + m[2] : ic; }

// ---------- working days (leave letters) ----------
function weekendOf(){ var st = (H.S.state || "").toUpperCase(); return /^(KDH|KTN|TRG|KEDAH|KELANTAN|TERENGGANU)/.test(st) ? [5, 6] : [0, 6]; }
function workdays(a, b){ var d = dOf(a), e = dOf(b); if(!d || !e || e < d) return 0; var n = 0, we = weekendOf(), g = 0;
  while(d <= e && g++ < 400){ var k = ymd(d), hol = false; try{ var h = H.hol ? H.hol(k) : null; hol = !!(h && h.ph && h.ph.length); }catch(x){}
    if(we.indexOf(d.getDay()) < 0 && !hol) n++; d.setDate(d.getDate() + 1); } return n; }
function addNotice(notice){ var d = new Date(), m = String(notice || "").match(/(\d+)\s*(jam|minggu|bulan|hours?|weeks?|months?)/i); if(!m) return "";
  var n = +m[1], u = m[2].toLowerCase(); if(/jam|hour/.test(u)) d.setDate(d.getDate() + 1); else if(/minggu|week/.test(u)) d.setDate(d.getDate() + 7 * n); else d.setMonth(d.getMonth() + n); return ymd(d); }

// ---------- building a document ----------
var SAL = {ms:["Tuan/Puan,","Sekian, terima kasih.","Yang benar,","Assalamualaikum dan salam sejahtera,"], en:["Dear Sir/Madam,","Thank you.","Yours sincerely,","Dear"], id:["Dengan hormat,","Atas perhatian Bapak/Ibu, saya ucapkan terima kasih.","Hormat saya,","Yth."], ar:["السادة المحترمون،","وتفضلوا بقبول فائق الاحترام.","المخلص،","السلام عليكم ورحمة الله وبركاته،"]};
function val(f, v, lang){ if(f.kind === "d") return longDate(v, lang); return v; }
function fill(tpl, vals, fl, lang){ return String(tpl || "").replace(/\{(\w+)\}/g, function(m, k){ var v = vals[k]; if(v == null || v === ""){ var f = fl.filter(function(x){ return x.k === k; })[0]; return "[" + (lang === "en" ? "fill in: " : "isi: ") + (f ? (lang === "en" ? f.en : f.ms) : k) + "]"; } return v; }); }
function lines(s){ return String(s || "").split(/\n|,\s*(?=\S)/).map(function(x){ return x.trim(); }).filter(Boolean); }
function template(d){ var t = typ(d.type), o = opts(t), lang = d.lang === "ar" ? "en" : d.lang === "id" ? "id" : d.lang, fl = fieldsOf(t), P = d.prof || {}, v = {}, S = SAL[lang] || SAL.ms;
  fl.forEach(function(f){ var x = d.f[f.k]; if((x == null || x === "") && f.prof && P[f.prof]) x = P[f.prof]; if(x != null && x !== "") v[f.k] = val(f, x, lang); });
  if(o.x === "workdays") v.workdays = String(workdays(d.f.date1, d.f.date2) || "[…]");
  if(o.x === "lastday" && !d.f.lastday && d.f.notice) v.lastday = longDate(addNotice(d.f.notice), lang);
  if(d.f.ic) v.ic = mask(d.f.ic); else if(P.ic) v.ic = mask(P.ic);
  var tp = (o.t && (o.t[lang] || o.t.ms)) || "", paras = fill(tp, v, fl, lang).split("|").map(function(x){ return x.trim(); }).filter(function(x){ return x && !/^\[[^\]]*\]\.?$/.test(x); });
  var B = [], title = en() || lang === "en" ? t[4] : t[3];
  if(o.k === "letter"){ B.push({t:"from", lines:[P.name || v.name || "[" + L("isi: nama", "fill in: name") + "]"].concat(lines(P.addr || v.addr))});
    B.push({t:"to", lines:lines(d.f.to || d.f.agency || d.f.toName || d.f.committee || "")}); B.push({t:"date", text:longDate(ymd(new Date()), lang)});
    if(d.f.ref) B.push({t:"ref", text:(lang === "en" ? "Your ref.: " : "Ruj. Tuan: ") + d.f.ref});
    B.push({t:"salute", text:S[0]}); B.push({t:"subject", text:d.f.subj || (d.preset ? title + " (" + d.preset + ")" : title)});
    paras.forEach(function(p){ B.push({t:"p", text:p, n:1}); });
    B.push({t:"close", text:S[1]}); B.push({t:"sign", lines:[S[2], "", "(" + String(P.name || v.name || "").toUpperCase() + ")"].concat(P.ic || d.f.ic ? [(lang === "en" ? "IC: " : "No. K/P: ") + mask(d.f.ic || P.ic)] : [])}); }
  else if(o.k === "email"){ B.push({t:"subject", text:(lang === "en" ? "Subject: " : "Subjek: ") + (d.f.subj || title)}); B.push({t:"salute", text:(d.f.toName ? S[3] + " " + d.f.toName + "," : S[0])});
    paras.forEach(function(p){ B.push({t:"p", text:p}); }); B.push({t:"close", text:S[1]}); B.push({t:"sign", lines:[S[2], P.name || "", [P.job, P.company].filter(Boolean).join(", "), P.phone || ""]}); }
  else if(o.k === "cv"){ B.push({t:"title", text:P.name || v.name || title}); B.push({t:"kv", items:[["", [P.job || v.job].filter(Boolean).join("")], [lang === "en" ? "Phone" : "Telefon", P.phone || v.phone || ""], [lang === "en" ? "Email" : "E-mel", P.email || v.email || ""], [lang === "en" ? "Address" : "Alamat", lines(P.addr || v.addr).join(", ")]].filter(function(x){ return x[1]; })});
    [["work", "Pengalaman Kerja", "Work Experience"], ["edu", "Pendidikan", "Education"], ["skills", "Kemahiran", "Skills"], ["langs", "Bahasa", "Languages"], ["achieve", "Pencapaian", "Achievements"]].forEach(function(s){ var x = d.f[s[0]] || P[s[0]]; if(!x) return; B.push({t:"h", text:lang === "en" ? s[2] : s[1]}); B.push({t:"list", items:lines(x)}); }); }
  else { B.push({t:"title", text:title + (d.preset ? " · " + d.preset : "")});
    if(o.k === "list"){ B.push({t:"check", items:paras.length > 1 ? paras.slice(1) : []}); if(paras[0]) B.unshift({t:"p", text:paras[0]}); }
    else if(o.k === "table" && d.f.items){ B.push({t:"p", text:paras[0] || ""}); B.push({t:"table", head:lang === "en" ? ["No.", "Item", "Note"] : ["Bil.", "Perkara", "Catatan"], rows:lines(d.f.items).map(function(x, i){ return [String(i + 1), x, ""]; })}); }
    else paras.forEach(function(p){ var m = p.match(/^([^:]{2,24}):\s*(.+)$/); if(m && p.length < 160) B.push({t:"p", text:p}); else if(p.length < 40 && !/[.!?]$/.test(p)) B.push({t:"h", text:p}); else B.push({t:"p", text:p}); }); }
  return B; }
function newDoc(typeId, f, extra){ var t = typ(typeId), s = set(), o = opts(t); return Object.assign({id:uid(), type:typeId, title:en() ? t[4] : t[3], lang:s.lang, fmt:s.fmt, tone:(o.tones || "formal").split(",")[0], len:"std", f:f || {}, more:"", preset:"",
  kind:o.k, theme:(s.opt.th && s.opt.th[typeId]) || o.th || "rasmi", opt:{}, blocks:[], tr:{}, ver:[], ai:false, created:now(), updated:now()}, extra || {}); }

// ---------- AI ----------
var SYS = "You are an expert writer of everyday documents in Malay, English, Indonesian and Arabic. You know the Malaysian official letter (surat rasmi) rules, " +
  "international business style and ATS-friendly CVs. Your writing is clear, correct, polite and wholesome, suitable for a Muslim family app. " +
  "NEVER invent facts: no made-up names, dates, qualifications, jobs, results, numbers or addresses. When a fact you need is missing, add a block {\"t\":\"gap\",\"field\":\"what is missing\"} instead. " +
  "Never quote or invent Quran verses or hadith: write a placeholder like [ayat: topic] or [hadis: topic]. No riba in financing; wasiat follows faraid with the one-third limit. " +
  "Reply with ONLY a JSON object: {\"title\":\"...\",\"subject_alts\":[\"...\"],\"blocks\":[...]} and nothing else (no markdown, no code fences). " +
  "Block types: from{lines[]}, to{lines[]}, date{text}, ref{text}, salute{text}, subject{text}, title{text}, h{text}, p{text,n:1 for numbered letter paragraphs}, list{items[],num}, check{items[]}, " +
  "table{head[],rows[[]]}, kv{items[[label,value]]}, quote{text}, close{text}, sign{lines[]}, cc{items[]}, gap{field}, pagebreak{}.";
var LNAME = {ms:"standard Malaysian Malay (Dewan Bahasa spelling)", en:"English", id:"standard Indonesian (EYD)", ar:"Modern Standard Arabic"};
var FMT = {my:"the Malaysian official letter format (sender address top left, receiver address, date, 'Tuan/Puan,', bold uppercase subject, numbered paragraphs, 'Sekian, terima kasih.', signature with the name in brackets)", intl:"the international business letter format (Dear …, Yours sincerely)", idn:"the Indonesian formal letter format (surat resmi: Dengan hormat, Hormat saya)"};
var LEN = {short:"short, about half a page", std:"standard, about one page", long:"detailed, one to two pages"};
function msgsFor(d){ var t = typ(d.type), o = opts(t), fl = fieldsOf(t), P = d.prof || {}, facts = [];
  fl.forEach(function(f){ var v = d.f[f.k]; if((v == null || v === "") && f.prof && P[f.prof]) v = P[f.prof]; if(v == null || v === "") return; if(f.k === "ic") v = mask(v); facts.push("- " + f.en + ": " + (f.kind === "d" ? longDate(v, "en") + " (" + v + ")" : v)); });
  if(o.x === "workdays" && d.f.date1 && d.f.date2) facts.push("- Working days (already counted, weekends and Malaysian public holidays excluded): " + workdays(d.f.date1, d.f.date2));
  if(o.x === "lastday" && d.f.notice && !d.f.lastday) facts.push("- Last working day (from the notice period): " + longDate(addNotice(d.f.notice), "en"));
  if(o.x === "biz" && P.co) facts.push("- Business: " + [P.co, P.reg, P.addr, P.phone].filter(Boolean).join(", "));
  var u = "Write: " + t[4] + (d.preset ? " (" + d.preset + ")" : "") + ".\nIt must contain: " + o.ins + ".\n" +
    "Language: " + LNAME[d.lang] + ". " + (o.k === "letter" ? "Use " + (FMT[d.fmt] || FMT.my) + ". " : "") + "Tone: " + d.tone + ". Length: " + LEN[d.len] + ".\n" +
    "Today's date: " + longDate(ymd(new Date()), d.lang === "ar" ? "en" : d.lang) + ".\n" +
    (o.x === "subjects" ? "Also give 3 alternative subject lines in subject_alts.\n" : "") +
    (o.k === "cv" ? "Layout: title = the person's name; a kv block for contact details; h + list blocks for each section; bullet points start with an action verb and show a result.\n" : "") +
    "Facts (use only these; mask any IC number as given):\n" + (facts.join("\n") || "- (none)") + (d.more ? "\nExtra wishes from the user: " + d.more : "");
  return [{role:"system", content:SYS}, {role:"user", content:u}]; }
var KNOWN = /^(from|to|date|ref|salute|subject|title|h|p|list|check|table|kv|quote|close|sign|cc|gap|pagebreak)$/;
function parse(txt){ var s = String(txt || "").replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim(), m = s.match(/\{[\s\S]*\}/), j = null;
  if(m){ try{ j = JSON.parse(m[0]); }catch(e){ j = null; } }
  if(!j){ var st = s.indexOf("{"); if(st >= 0){ var c2 = s.slice(st), k2 = c2.lastIndexOf("},"); if(k2 > 0) try{ j = JSON.parse(c2.slice(0, k2 + 1) + "]}"); j.cut = true; }catch(e3){} } }
  if(j && !j.blocks && j.body){ j.blocks = String(Array.isArray(j.body) ? j.body.join("\n\n") : j.body).split(/\n\s*\n/).map(function(p){ return {t:"p", text:p.trim()}; }); }
  if(!j || !Array.isArray(j.blocks)){ var ps = s.replace(/^(here is|berikut)[^\n]*\n/i, "").split(/\n\s*\n/).map(function(p){ return p.trim(); }).filter(Boolean); return {title:"", blocks:ps.map(function(p){ return {t:"p", text:p}; }), loose:true}; }
  j.blocks = j.blocks.filter(function(b){ return b && KNOWN.test(b.t); }).map(function(b){ ["lines", "items"].forEach(function(k){ if(b[k] != null && !Array.isArray(b[k])) b[k] = String(b[k]).split("\n"); });
    if(b.t === "table"){ b.head = Array.isArray(b.head) ? b.head.map(String) : []; b.rows = Array.isArray(b.rows) ? b.rows.map(function(r){ return Array.isArray(r) ? r.map(function(x){ return x == null ? "" : String(x); }) : [String(r)]; }) : []; }
    if(b.t === "kv" && Array.isArray(b.items)) b.items = b.items.map(function(x){ return Array.isArray(x) ? [String(x[0] || ""), String(x[1] == null ? "" : x[1])] : ["", String(x)]; });
    if(b.text != null) b.text = String(b.text); return b; });
  return j; }
function aiRun(msgs, maxTok){ var A = window.HalalAI; if(!A || !A.run) return Promise.reject(new Error(L("AI tidak tersedia.", "AI is not available.")));
  return A.run("dokumen", msgs, {temperature:0.4, max_tokens:Math.max(6000, maxTok * 3), limit:60, L2:H.L2x, noRetry:true}).then(function(r){ return {text:r.text, prov:r.provider, model:r.model, finish:r.finish}; }); }
function freeAI(){ try{ return window.HalalAI && HalalAI.featLabel && HalalAI.featLabel("dokumen").prov === "pollinations"; }catch(e){ return false; } }
// missing facts: required short values the AI left out
function missing(d){ var t = typ(d.type), all = JSON.stringify(d.blocks).toLowerCase(), out = []; fieldsOf(t).forEach(function(f){ if(!f.req || f.kind === "a" || /^s:/.test(f.kind)) return; var v = d.f[f.k]; if(!v) return; var s = f.kind === "d" ? null : String(v).toLowerCase().slice(0, 30);
    if(f.kind === "d"){ var dd = dOf(v); if(dd && all.indexOf(String(dd.getDate())) < 0) out.push(en() ? f.en : f.ms); } else if(s && s.length > 2 && all.indexOf(s) < 0) out.push(en() ? f.en : f.ms); }); return out; }
function gapsOf(d){ var out = []; (d.blocks || []).forEach(function(b, i){ if(b.t === "gap") out.push([i, b.field]); var s = JSON.stringify(b); var re = /\[(isi|fill in|ayat|hadis)[^\]]*\]/gi, m; while((m = re.exec(s))) out.push([i, m[0].replace(/^\[|\]$/g, "")]); }); return out; }

function confirmFree(d, go){ var t = typ(d.type); if(!opts(t).priv || !freeAI()){ go(); return; }
  var ov = H.showSheet("⚠️ " + L("Butiran peribadi", "Personal details"), '<div class="small">' + L("Dokumen ini ada butiran peribadi anda. Ia akan dihantar kepada AI percuma (Pollinations), bukan AI dengan kunci anda sendiri. Semak semula hasilnya sebelum menghantar.", "This document has your personal details. It will go to the free AI (Pollinations), not an AI with your own key. Check the result before you send it.") + '</div>' +
    '<div class="btns" style="margin-top:12px;flex-wrap:wrap"><button class="btn gold" id="dfGo">' + L("Teruskan", "Continue") + '</button><button class="btn alt" id="dfKey">🔑 ' + L("Tetapkan kunci AI", "Set my AI key") + '</button><button class="btn alt" id="dfTpl">📄 ' + L("Templat ringkas", "Simple template") + '</button></div>');
  ov.querySelector("#dfGo").onclick = function(){ H.closeOverlay(); go(); };
  ov.querySelector("#dfKey").onclick = function(){ H.closeOverlay(); H.openSettings("ai"); };
  ov.querySelector("#dfTpl").onclick = function(){ H.closeOverlay(); d.blocks = template(d); d.ai = false; docPut(d); openDoc(d.id); }; }
function draft(d){ if(ST.busy) return; if(navigator.onLine === false){ H.toast(L("Tiada internet: templat ringkas digunakan.", "No internet: the simple template is used.")); d.blocks = template(d); d.ai = false; docPut(d); openDoc(d.id); return; }
  confirmFree(d, function(){ ST.busy = true; ST.job = {t0:now()}; draw();
    aiRun(msgsFor(d), {short:1500, std:2500, long:4500}[d.len] || 2500).then(function(r){ ST.busy = false; var j = parse(r.text);
      if(!j.blocks.length){ throw new Error(L("AI tidak memberi hasil.", "The AI gave no result.")); }
      if(d.blocks && d.blocks.length) d.ver = [{t:now(), blocks:d.blocks}].concat(d.ver || []).slice(0, 10);
      d.blocks = j.blocks; if(j.title) d.title = j.title; d.subs = j.subject_alts || []; d.ai = true; d.prov = r.prov; d.miss = missing(d); d.cut = !!j.cut || r.finish === "length"; docPut(d); openDoc(d.id);
      H.toast("✅ " + L("Draf siap", "Draft ready")); })
    .catch(function(e){ ST.busy = false; if(e && e.cancel){ draw(); return; } H.toast("⚠️ " + (e && e.message || e) + " · " + L("templat ringkas digunakan", "simple template used")); d.blocks = template(d); d.ai = false; docPut(d); openDoc(d.id); }); }); }
function aiTool(d, kind, arg){ if(ST.busy) return; var cur = view(d), lang = ST.show || d.lang, ask;
  var js = JSON.stringify({title:d.title, blocks:cur}), tl = LNAME[arg] || LNAME[lang];
  ask = {polish:"Polish this document: better grammar and flow, same meaning, same language, same length and the same block structure.",
    tone:"Rewrite this document to be " + arg + ". Keep the language, the facts and the block structure.",
    check:"Check this document. Reply with ONLY JSON {\"issues\":[\"...\"]}: missing facts (date, reference, signature, names), spelling mistakes, words too casual for its purpose, anything that could cause problems. Use " + LNAME[lang] + ".",
    vary:"Give 3 different openings (first paragraph) for this document. Reply with ONLY JSON {\"options\":[\"...\",\"...\",\"...\"]} in " + LNAME[lang] + ".",
    tr:"Translate this document into " + tl + ". Keep the block structure; switch letter conventions to that language (salutation, closing, subject style). Translate every text field.",
    ats:"Check this CV for ATS (applicant tracking systems). Reply with ONLY JSON {\"score\":0-100,\"tips\":[\"...\"]} in " + LNAME[lang] + ".",
    job:"Match this CV or cover letter to the job ad below. Reply with ONLY JSON {\"score\":0-100,\"missing\":[\"skills or keywords\"],\"blocks\":[the document rewritten so its points match the job ad, never inventing experience]}.\nJOB AD:\n" + (arg || "")}[kind];
  ST.busy = true; draw();
  aiRun([{role:"system", content:SYS}, {role:"user", content:ask + "\n\nDOCUMENT JSON:\n" + js}], 3000).then(function(r){ ST.busy = false; var s = String(r.text || ""), m = s.match(/\{[\s\S]*\}/), j = {}; try{ j = JSON.parse(m ? m[0] : s); }catch(e){ j = parse(s); }
    if(kind === "check"){ sheetList("✅ " + L("Semakan", "Check"), (j.issues || []).length ? j.issues : [L("Tiada masalah ditemui.", "No problems found.")]); draw(); return; }
    if(kind === "ats"){ sheetList("🎯 ATS · " + (j.score != null ? j.score + "/100" : ""), j.tips || []); draw(); return; }
    if(kind === "vary"){ pickVariant(d, j.options || []); return; }
    var pj = j.blocks ? j : parse(s); if(!pj.blocks || !pj.blocks.length){ H.toast(L("AI tidak memberi hasil.", "The AI gave no result.")); draw(); return; }
    pj.blocks = parse(JSON.stringify({blocks:pj.blocks})).blocks;
    if(kind === "tr"){ d.tr = d.tr || {}; d.tr[arg] = {title:pj.title || d.title, blocks:pj.blocks}; ST.show = arg; }
    else { d.ver = [{t:now(), blocks:d.blocks}].concat(d.ver || []).slice(0, 10); if(ST.show && ST.show !== d.lang){ d.tr[ST.show].blocks = pj.blocks; } else d.blocks = pj.blocks; }
    if(kind === "job" && (j.missing || []).length) setTimeout(function(){ sheetList("🎯 " + L("Padanan kerja", "Job match") + (j.score != null ? " · " + j.score + "/100" : ""), [L("Kurang: ", "Missing: ") + j.missing.join(", ")]); }, 300);
    docPut(d); draw(); H.toast("✅"); })
  .catch(function(e){ ST.busy = false; draw(); if(!(e && e.cancel)) H.toast("⚠️ " + (e && e.message || e)); }); }
function sheetList(title, items){ H.showSheet(title, '<ul class="dkUl">' + items.map(function(x){ return '<li>' + E(x) + '</li>'; }).join("") + '</ul>'); }
function pickVariant(d, list){ draw(); if(!list.length){ H.toast(L("Tiada pilihan", "No options")); return; }
  var ov = H.showSheet("🔁 " + L("Pilih pembukaan", "Pick an opening"), list.map(function(x, i){ return '<button class="card dkVar" data-vi="' + i + '">' + E(x) + '</button>'; }).join(""));
  ov.querySelectorAll("[data-vi]").forEach(function(b){ b.onclick = function(){ var bl = view(d), i = bl.map(function(x){ return x.t; }).indexOf("p"); if(i >= 0){ d.ver = [{t:now(), blocks:d.blocks}].concat(d.ver || []).slice(0, 10); bl[i].text = list[+b.getAttribute("data-vi")]; } docPut(d); H.closeOverlay(); draw(); }; }); }
function view(d){ return ST.show && ST.show !== d.lang && d.tr && d.tr[ST.show] ? d.tr[ST.show].blocks : d.blocks; }

// ---------- screens ----------
function draw(){ if(!EL || !document.body.contains(EL)) return; if(ST.busy && window.AIRun){ EL.innerHTML = AIRun.card("dokumen") + '<div class="mut small" style="padding:8px">' + L("AI sedang menyusun dokumen…", "The AI is drafting the document…") + '</div>'; return; }
  ({home:pHome, pick:pPick, form:pForm, doc:pDoc, prof:pProf, mine:pMine}[ST.pg] || pHome)();
  if(window.AIRun && (ST.pg === "home" || ST.pg === "form") && !EL.querySelector(".aiPanel")) EL.insertAdjacentHTML("afterbegin", AIRun.panel("dokumen")); }   // 0.7.28: ✨ AI panel
function go(pg, x){ ST.pg = pg; Object.assign(ST, x || {}); draw(); var v = document.getElementById("view"); if(v) v.scrollTop = 0; }
function card(t){ return '<button class="dkType" data-ty="' + t[0] + '"><span class="dkIc">' + t[2] + '</span><b>' + E(L(t[3], t[4])) + '</b><small>' + E(L(t[5], t[6])) + '</small>' + (opts(t).priv ? '<i class="dkLock">🔒</i>' : '') + '</button>'; }
function bindTypes(){ EL.querySelectorAll("[data-ty]").forEach(function(b){ b.onclick = function(){ openForm(b.getAttribute("data-ty")); }; }); }
function pHome(){ var s = set(), D = docs(), rec = s.recent.map(typ).filter(Boolean).slice(0, 6);
  EL.innerHTML = '<div class="card dkHero"><h3>📄 ' + L("Dokumen", "Documents") + '</h3><div class="mut small">' + L("Surat, e-mel, CV, permohonan, itinerari, minit dan banyak lagi: 50 jenis, siap dicetak.", "Letters, emails, CVs, applications, itineraries, minutes and more: 50 types, ready to print.") + '</div>' +
    '<input id="dkQ" class="rin" type="search" placeholder="🔎 ' + E(L("Cari: surat cuti, CV, aduan…", "Search: leave letter, CV, complaint…")) + '" value="' + E(ST.q) + '"></div>' +
    '<div class="card"><div class="plQ">⚡ ' + L("Tulis cepat", "Quick write") + '</div><textarea id="dkQw" class="rin" rows="2" placeholder="' + E(L("cth. Surat kepada bos mohon cuti 3 hari untuk majlis kahwin adik, 12–14 Dis", "e.g. A letter to my boss asking for 3 days' leave for my sister's wedding, 12–14 Dec")) + '"></textarea><button class="btn gold full" id="dkQgo" style="margin-top:6px">✨ ' + L("Teruskan", "Continue") + '</button></div>' +
    (rec.length ? '<div class="plQ">🕘 ' + L("Terkini", "Recent") + '</div><div class="dkGrid">' + rec.map(card).join("") + '</div>' : '') +
    (s.fav.length ? '<div class="plQ">★ ' + L("Kegemaran", "Favourites") + '</div><div class="dkGrid">' + s.fav.map(typ).filter(Boolean).map(card).join("") + '</div>' : '') +
    '<div class="plQ">📂 ' + L("Kategori", "Categories") + '</div><div class="dkCats">' + T.CATS.map(function(c){ var n = T.TYPES.filter(function(t){ return t[1] === c[0]; }).length; return '<button class="dkCat" data-cat="' + c[0] + '"><span>' + c[1] + '</span><b>' + E(L(c[2], c[3])) + '</b><small>' + n + '</small></button>'; }).join("") + '</div>' +
    '<div class="btns" style="margin-top:10px;flex-wrap:wrap"><button class="btn alt" id="dkMine">🗂 ' + L("Dokumen saya", "My documents") + ' (' + D.length + ')</button><button class="btn alt" id="dkProf">👤 ' + L("Profil saya", "My profile") + '</button></div>' +
    (D.length ? '<div class="plQ">' + L("Dokumen terakhir", "Latest documents") + '</div>' + D.slice(0, 3).map(docRow).join("") : '');
  var q = EL.querySelector("#dkQ"); q.oninput = function(){ ST.q = q.value; if(q.value.trim()){ ST.pg = "pick"; ST.cat = ""; draw(); var n = EL.querySelector("#dkQ"); if(n){ n.focus(); try{ n.setSelectionRange(n.value.length, n.value.length); }catch(e){} } } };
  EL.querySelector("#dkQgo").onclick = function(){ quick(EL.querySelector("#dkQw").value.trim()); };
  EL.querySelectorAll("[data-cat]").forEach(function(b){ b.onclick = function(){ go("pick", {cat:b.getAttribute("data-cat"), q:""}); }; });
  EL.querySelector("#dkMine").onclick = function(){ go("mine"); }; EL.querySelector("#dkProf").onclick = function(){ go("prof"); };
  bindTypes(); bindDocRows(); }
function docRow(d){ var t = typ(d.type) || ["", "", "📄"]; return '<button class="card dkRow" data-dk="' + d.id + '"><span class="dkIc">' + t[2] + '</span><div><b>' + E(d.title) + '</b><small class="mut">' + E(new Date(d.updated).toLocaleDateString(en() ? "en-GB" : "ms-MY", {day:"numeric", month:"short", year:"numeric"})) + ' · ' + E((T.CATS.filter(function(c){ return c[0] === t[1]; })[0] || ["", "", "", ""])[en() ? 3 : 2]) + (d.pin ? ' · 📌' : '') + '</small></div></button>'; }
function bindDocRows(){ EL.querySelectorAll("[data-dk]").forEach(function(b){ b.onclick = function(){ openDoc(b.getAttribute("data-dk")); }; }); }
var ALIAS = {cuti:"leave mc annual sick", berhenti:"resign resignation quit notice", aduan:"complain complaint pbt kpdn", rayuan:"appeal saman ptptn", cv:"resume resume kerja job", cover:"cover letter iringan", itinerari:"itinerary trip travel percutian", minit:"minutes mesyuarat meeting", jemputan:"invitation kahwin walimah kenduri aqiqah", wasiat:"will faraid", emel_rasmi:"email emel"};
function pPick(){ var q = (ST.q || "").toLowerCase().trim(), list = T.TYPES.filter(function(t){ if(ST.cat && t[1] !== ST.cat) return false; if(!q) return true; return (t.slice(3, 7).join(" ") + " " + t[0] + " " + (ALIAS[t[0]] || "")).toLowerCase().indexOf(q) >= 0; });
  EL.innerHTML = '<div class="dkBar"><button class="chip" id="dkBack">‹ ' + L("Dokumen", "Documents") + '</button></div><input id="dkQ" class="rin" type="search" placeholder="🔎 ' + E(L("Cari jenis dokumen", "Search document types")) + '" value="' + E(ST.q) + '">' +
    '<div class="rseg dkCatRow"><button class="chip' + (!ST.cat ? ' on' : '') + '" data-cat="">' + L("Semua", "All") + '</button>' + T.CATS.map(function(c){ return '<button class="chip' + (ST.cat === c[0] ? ' on' : '') + '" data-cat="' + c[0] + '">' + c[1] + ' ' + E(L(c[2], c[3])) + '</button>'; }).join("") + '</div>' +
    '<div class="dkGrid">' + list.map(card).join("") + '</div>' + (list.length ? '' : '<div class="mut small" style="padding:12px">' + L("Tiada padanan. Cuba \"Lain-lain\".", "No match. Try \"Custom\".") + '</div>');
  EL.querySelector("#dkBack").onclick = function(){ go("home", {q:"", cat:""}); };
  var qi = EL.querySelector("#dkQ"); qi.oninput = function(){ ST.q = qi.value; var p = qi.selectionStart; pPick(); var n = EL.querySelector("#dkQ"); n.focus(); try{ n.setSelectionRange(p, p); }catch(e){} };
  EL.querySelectorAll("[data-cat]").forEach(function(b){ b.onclick = function(){ ST.cat = b.getAttribute("data-cat"); pPick(); }; }); bindTypes(); }
function openForm(id, pre){ var s = set(); s.recent = [id].concat(s.recent.filter(function(x){ return x !== id; })).slice(0, 8); setSave(s);
  var dr = H.load(K.draft, null); ST.form = dr && dr.type === id && !pre ? dr : newDoc(id, pre && pre.f, pre); go("form", {type:id}); }
function keepDraft(){ if(ST.form) H.save(K.draft, ST.form); }
function pForm(){ var d = ST.form, t = typ(d.type), o = opts(t), P = profs(), cp = curProf(), fl = fieldsOf(t), s = set();
  var chip = function(list, cur, attr){ return list.map(function(x){ return '<button class="chip' + (cur === x[0] ? ' on' : '') + '" ' + attr + '="' + E(x[0]) + '">' + E(x[1]) + '</button>'; }).join(""); };
  var tones = (o.tones || "formal").split(",").map(function(k){ var x = T.TONES.filter(function(y){ return y[0] === k; })[0]; return [k, L(x[1], x[2])]; });
  var fv = function(f){ var v = d.f[f.k]; if((v == null || v === "") && f.prof && cp[f.prof]) v = cp[f.prof]; return v == null ? "" : v; };
  var fhtml = fl.map(function(f){ var v = fv(f), lab = '<label class="hfld">' + E(L(f.ms, f.en)) + (f.req ? ' <b class="dkReq">*</b>' : '') + (f.prof && cp[f.prof] ? ' <small class="mut">· ' + L("dari profil", "from profile") + '</small>' : '');
    if(f.kind === "a") return lab + '<textarea class="rin" rows="3" data-f="' + f.k + '" placeholder="' + E(f.ph || "") + '">' + E(v) + '</textarea></label>';
    if(f.kind === "d") return lab + '<input class="rin" type="date" data-f="' + f.k + '" value="' + E(v) + '"></label>';
    if(f.kind === "n") return lab + '<input class="rin" type="number" data-f="' + f.k + '" value="' + E(v) + '" placeholder="' + E(f.ph || "") + '"></label>';
    if(/^s:/.test(f.kind)) return lab + '<select class="rin" data-f="' + f.k + '"><option value="">—</option>' + f.kind.slice(2).split("|").map(function(x){ return '<option' + (v === x ? ' selected' : '') + '>' + E(x) + '</option>'; }).join("") + '</select></label>';
    return lab + '<input class="rin" type="text" data-f="' + f.k + '" value="' + E(v) + '" placeholder="' + E(f.ph || "") + '"></label>'; }).join("");
  var extra = "";
  if(o.x === "workdays" && d.f.date1 && d.f.date2) extra = '<div class="dkInfo">📅 ' + workdays(d.f.date1, d.f.date2) + L(" hari bekerja (tanpa hujung minggu dan cuti umum)", " working days (weekends and public holidays left out)") + '</div>';
  if(o.x === "lastday" && d.f.notice && !d.f.lastday) extra = '<div class="dkInfo">📅 ' + L("Hari terakhir: ", "Last day: ") + longDate(addNotice(d.f.notice), en() ? "en" : "ms") + '</div>';
  if(o.x === "agency") extra = '<div class="plQ">🏛 ' + L("Agensi yang betul", "The right agency") + '</div>' + T.AGENCY.map(function(a, i){ return '<button class="chip dkAg" data-ag="' + i + '">' + E(L(a[0], a[1])) + ' → ' + E(a[2]) + '</button>'; }).join("");
  if(o.x === "minutes") extra = '<button class="btn alt full" id="dkMeet" style="margin-top:6px">📋 ' + L("Guna mesyuarat dari Masa › Mesyuarat", "Use a meeting from Time › Meeting") + '</button>';
  var langs = [["ms", "BM"], ["en", "EN"], ["id", "ID"], ["ar", "AR"]], fmts = [["my", L("Malaysia (rasmi)", "Malaysia (official)")], ["intl", L("Antarabangsa", "International")], ["idn", L("Indonesia (resmi)", "Indonesia (formal)")]];
  EL.innerHTML = '<div class="dkBar"><button class="chip" id="dkBack">‹ ' + L("Jenis", "Types") + '</button><button class="chip" id="dkFav">' + (s.fav.indexOf(d.type) >= 0 ? "★" : "☆") + '</button></div>' +
    '<div class="card"><h3>' + t[2] + ' ' + E(L(t[3], t[4])) + '</h3><div class="mut small">' + E(L(t[5], t[6])) + '</div>' +
    (o.note ? '<div class="dkNote">ℹ️ ' + E(L(T.NOTES[o.note][0], T.NOTES[o.note][1])) + '</div>' : '') +
    '<div class="dkWho">✍️ ' + L("Menulis sebagai:", "Writing as:") + ' <select class="rin" id="dkPf">' + P.list.map(function(x){ return '<option value="' + x.id + '"' + (P.cur === x.id ? ' selected' : '') + '>' + E(x.label || x.name || "—") + '</option>'; }).join("") + (H.biz && H.biz() ? '<option value="biz"' + (P.cur === "biz" ? ' selected' : '') + '>🏪 ' + E(H.biz().co || L("Perniagaan", "Business")) + '</option>' : '') + '</select><button class="chip" id="dkPe">✎</button></div>' +
    (o.pre ? '<div class="plQ">' + L("Jenis", "Kind") + '</div><div class="rseg">' + String(o.pre === "ltype" ? T.FD.ltype[2].slice(2) : o.pre).split("|").map(function(x){ return '<button class="chip' + (d.preset === x ? ' on' : '') + '" data-pre="' + E(x) + '">' + E(x) + '</button>'; }).join("") + '</div>' : '') +
    '<button class="chip" id="dkFill" style="margin:8px 0 2px">📝 ' + L("Isi dari mesej atau gambar", "Fill from a message or photo") + '</button>' +
    fhtml + extra + '</div>' +
    '<div class="card"><div class="plQ">🌐 ' + L("Bahasa", "Language") + '</div><div class="rseg">' + chip(langs, d.lang, "data-lg") + '</div>' +
    (o.k === "letter" ? '<div class="plQ">📐 ' + L("Format", "Format") + '</div><div class="rseg">' + chip(fmts, d.fmt, "data-fm") + '</div>' : '') +
    '<div class="plQ">🎚 ' + L("Nada", "Tone") + '</div><div class="rseg">' + chip(tones, d.tone, "data-tn") + '</div>' +
    '<div class="plQ">📏 ' + L("Panjang", "Length") + '</div><div class="rseg">' + chip([["short", L("Pendek", "Short")], ["std", L("Biasa", "Standard")], ["long", L("Terperinci", "Detailed")]], d.len, "data-ln") + '</div>' +
    '<label class="hfld">💬 ' + L("Beritahu AI apa-apa lagi", "Tell the AI anything else") + '<div class="dkMic"><textarea class="rin" rows="2" id="dkMore">' + E(d.more || "") + '</textarea>' + (H.N && H.N.listen ? '<button class="chip" id="dkMic">🎤</button>' : '') + '</div></label></div>' +
    (opts(t).priv ? '<div class="dkNote">🔒 ' + L("Dokumen peribadi: semak semula sebelum menghantar.", "Personal document: check it before you send it.") + '</div>' : '') +
    '<button class="btn gold full g3d" id="dkGo">✨ ' + L("Draf dengan AI", "Draft with AI") + '</button><button class="btn alt full" id="dkTpl" style="margin-top:6px">📄 ' + L("Guna templat ringkas (tanpa AI)", "Use the simple template (no AI)") + '</button>';
  var q = function(x){ return EL.querySelector(x); };
  q("#dkBack").onclick = function(){ keepDraft(); go("pick"); };
  q("#dkFav").onclick = function(){ var s2 = set(), i = s2.fav.indexOf(d.type); if(i >= 0) s2.fav.splice(i, 1); else s2.fav.unshift(d.type); setSave(s2); pForm(); };
  EL.querySelectorAll("[data-f]").forEach(function(x){ var k = x.getAttribute("data-f"); x.oninput = x.onchange = function(){ d.f[k] = x.value; keepDraft(); if(/^(date1|date2|notice)$/.test(k)){ clearTimeout(pForm._t); pForm._t = setTimeout(function(){ var y = document.getElementById("view").scrollTop; pForm(); document.getElementById("view").scrollTop = y; }, 400); } }; });
  q("#dkPf").onchange = function(){ var P2 = profs(); P2.cur = this.value; profSave(P2); pForm(); };
  q("#dkPe").onclick = function(){ keepDraft(); go("prof"); };
  EL.querySelectorAll("[data-pre]").forEach(function(b){ b.onclick = function(){ d.preset = b.getAttribute("data-pre"); if(o.pre === "ltype") d.f.ltype = d.preset; keepDraft(); pForm(); }; });
  EL.querySelectorAll("[data-lg]").forEach(function(b){ b.onclick = function(){ d.lang = b.getAttribute("data-lg"); var s2 = set(); s2.lang = d.lang; setSave(s2); keepDraft(); pForm(); }; });
  EL.querySelectorAll("[data-fm]").forEach(function(b){ b.onclick = function(){ d.fmt = b.getAttribute("data-fm"); var s2 = set(); s2.fmt = d.fmt; setSave(s2); keepDraft(); pForm(); }; });
  EL.querySelectorAll("[data-tn]").forEach(function(b){ b.onclick = function(){ d.tone = b.getAttribute("data-tn"); keepDraft(); pForm(); }; });
  EL.querySelectorAll("[data-ln]").forEach(function(b){ b.onclick = function(){ d.len = b.getAttribute("data-ln"); keepDraft(); pForm(); }; });
  EL.querySelectorAll("[data-ag]").forEach(function(b){ b.onclick = function(){ d.f.agency = T.AGENCY[+b.getAttribute("data-ag")][2]; keepDraft(); pForm(); }; });
  q("#dkMore").oninput = function(){ d.more = this.value; keepDraft(); };
  var mic = q("#dkMic"); if(mic) mic.onclick = function(){ var h = function(r){ if(r && r.t != null && r.final){ H.off("speech", h); var t0 = String(r.t).split(" | ")[0]; d.more = ((d.more || "") + " " + t0).trim(); keepDraft(); pForm(); } else if(r && r.err){ H.off("speech", h); } };
    H.on("speech", h); H.N.listen(d.lang === "en" ? "en-GB" : d.lang === "id" ? "id-ID" : d.lang === "ar" ? "ar-SA" : "ms-MY"); H.toast("🎤 " + L("Bercakap sekarang…", "Speak now…")); };
  var mt = q("#dkMeet"); if(mt) mt.onclick = function(){ meetPick(d); };
  q("#dkFill").onclick = function(){ fillFrom(d); };
  var check = function(){ var miss = fl.filter(function(f){ return f.req && !fv(f); }); if(miss.length){ H.toast("⚠️ " + L("Sila isi: ", "Please fill in: ") + miss.map(function(f){ return L(f.ms, f.en); }).join(", ")); return false; } return true; };
  var commit = function(){ d.prof = profSnap(); fl.forEach(function(f){ if((d.f[f.k] == null || d.f[f.k] === "") && f.prof && d.prof[f.prof]) d.f[f.k] = d.prof[f.prof]; }); H.save(K.draft, null); };
  q("#dkGo").onclick = function(){ if(!check()) return; commit(); docPut(d); draft(d); };
  q("#dkTpl").onclick = function(){ if(!check()) return; commit(); d.blocks = template(d); d.ai = false; docPut(d); openDoc(d.id); }; }
function profSnap(){ var p = curProf() || {}; return {name:p.name || "", ic:p.ic || "", addr:p.addr || "", phone:p.phone || "", email:p.email || "", job:p.job || "", company:p.company || "", co:p.co || "", reg:p.reg || "", logo:p.logo || "", sign:p.sign || "", edu:p.edu || "", work:p.work || "", skills:p.skills || "", langs:p.langs || "", biz:p.biz || ""}; }
function meetPick(d){ var M = (H.load("ihsan_meet", null) || {}).list || []; if(!M.length){ H.toast(L("Tiada mesyuarat lagi", "No meetings yet")); return; }
  var ov = H.showSheet("📋 " + L("Pilih mesyuarat", "Pick a meeting"), M.slice(0, 30).map(function(m, i){ return '<button class="card dkVar" data-mi="' + i + '"><b>' + E(m.title) + '</b></button>'; }).join(""));
  ov.querySelectorAll("[data-mi]").forEach(function(b){ b.onclick = function(){ var m = M[+b.getAttribute("data-mi")]; d.f.meeting = m.title; d.f.notes = [m.aiT || "", (m.lines || []).map(function(l){ return l.x; }).join("\n"), (m.notes || []).map(function(n){ return "• " + n.x; }).join("\n")].filter(Boolean).join("\n").slice(0, 12000);
    if(m.t0) d.f.date = ymd(new Date(m.t0)); if((m.people || []).length) d.f.attend = m.people.map(function(p){ return p.n || p.name || p; }).join(", "); keepDraft(); H.closeOverlay(); pForm(); }; }); }
function fillFrom(d){ var t = typ(d.type), fl = fieldsOf(t);
  var ov = H.showSheet("📝 " + L("Isi dari mesej atau gambar", "Fill from a message or photo"), '<textarea id="dfT" class="rin" rows="6" placeholder="' + E(L("Tampal mesej WhatsApp, e-mel atau notis…", "Paste a WhatsApp message, email or notice…")) + '"></textarea>' +
    '<div class="btns" style="margin-top:8px"><button class="btn gold" id="dfOk">✨ ' + L("Isi borang", "Fill the form") + '</button><button class="btn alt" id="dfPh">📷 ' + L("Gambar", "Photo") + '</button></div>');
  var send = function(content){ H.closeOverlay(); ST.busy = true; draw();
    var u = "From this message or photo, fill in the form fields for a " + t[4] + ". Fields (key: meaning): " + fl.map(function(f){ return f.k + ": " + f.en + (f.kind === "d" ? " (YYYY-MM-DD)" : ""); }).join("; ") + ". Reply with ONLY JSON {\"fields\":{key:value}}; leave out what is not there. Never guess.";
    aiRun([{role:"system", content:"You read messages and forms and extract facts exactly. JSON only."}, {role:"user", content:typeof content === "string" ? u + "\n\nMESSAGE:\n" + content : [{type:"text", text:u}, {type:"image_url", image_url:{url:content.img}}]}], 1500).then(function(r){ ST.busy = false; var m = String(r.text).match(/\{[\s\S]*\}/), j = {}; try{ j = JSON.parse(m[0]); }catch(e){}
      var n = 0; Object.keys(j.fields || {}).forEach(function(k){ if(T.FD[k] && j.fields[k] != null && j.fields[k] !== ""){ d.f[k] = String(j.fields[k]); n++; } }); keepDraft(); draw(); H.toast(n ? "✅ " + n + L(" ruangan diisi: semak", " fields filled: check them") : L("Tiada maklumat ditemui", "Nothing found")); })
    .catch(function(e){ ST.busy = false; draw(); H.toast("⚠️ " + (e && e.message || e)); }); };
  ov.querySelector("#dfOk").onclick = function(){ var v = ov.querySelector("#dfT").value.trim(); if(v) send(v); };
  ov.querySelector("#dfPh").onclick = function(){ var h = function(r){ H.off("image", h); if(r && r.data) send({img:r.data}); }; H.on("image", h); H.N.pickImage("gallery"); }; }
function quick(text){ if(!text){ H.toast(L("Tulis apa yang anda perlukan", "Write what you need")); return; } ST.busy = true; draw();
  var list = T.TYPES.map(function(t){ return t[0] + " = " + t[4] + " [fields: " + t[7].replace(/\*/g, "") + "]"; }).join("\n");
  aiRun([{role:"system", content:"You pick the right document type and extract facts. JSON only."}, {role:"user", content:"Request: " + text + "\nToday is " + ymd(new Date()) + ".\nTypes:\n" + list + "\nReply with ONLY JSON {\"type\":\"id\",\"fields\":{key:value (dates YYYY-MM-DD)},\"lang\":\"ms|en|id|ar\",\"more\":\"anything else from the request\"}. Never invent facts."}], 1500)
  .then(function(r){ ST.busy = false; var m = String(r.text).match(/\{[\s\S]*\}/), j = {}; try{ j = JSON.parse(m[0]); }catch(e){} var t = typ(j.type) ? j.type : "lain"; var f = {};
    Object.keys(j.fields || {}).forEach(function(k){ if(T.FD[k]) f[k] = String(j.fields[k]); }); if(t === "lain") f.custom = text;
    openForm(t, {f:f, lang:/^(ms|en|id|ar)$/.test(j.lang) ? j.lang : set().lang, more:j.more || ""}); H.toast("✅ " + L("Semak borang, kemudian Draf", "Check the form, then Draft")); })
  .catch(function(e){ ST.busy = false; draw(); H.toast("⚠️ " + (e && e.message || e)); }); }

// ---------- the document ----------
function openDoc(id){ ST.id = id; ST.show = null; go("doc"); }
var PREV = {scale:0.5};
function renderPages(d, box){ var o = d.opt || {}, pages = window.DokThemes.layout({blocks:view(d), kind:d.kind, lang:ST.show || d.lang, prof:d.prof, title:d.title}, d.theme, o);
  // drawn at the screen's own resolution so the text is sharp
  var sc = Math.min(1, Math.max(0.35, ((box.clientWidth || 380) * (window.devicePixelRatio || 1)) / (pages[0] ? pages[0].w : 1240)));
  box.innerHTML = ""; pages.forEach(function(p, i){ var cv = document.createElement("canvas"); cv.className = "dkPage"; cv.setAttribute("data-pi", i); box.appendChild(cv); DokThemes.draw(cv, p, sc); });
  DokThemes.ready(pages).then(function(){ box.querySelectorAll("canvas").forEach(function(cv, i){ DokThemes.draw(cv, pages[i], sc); }); });
  box.querySelectorAll("canvas").forEach(function(cv, i){ cv.onclick = function(e){ var r = cv.getBoundingClientRect(), sx = pages[i].w / r.width, bi = DokThemes.hit(pages[i], (e.clientX - r.left) * sx, (e.clientY - r.top) * sx); if(bi != null) editBlock(d, bi); }; });
  return pages; }
function pDoc(){ var d = docById(ST.id); if(!d){ go("home"); return; } var t = typ(d.type) || ["", "", "📄", "", ""], o = opts(t), gaps = gapsOf({blocks:view(d)}), langs = [d.lang].concat(Object.keys(d.tr || {}).filter(function(k){ return k !== d.lang; }));
  var wc = o.x === "count" ? DokThemes.text({blocks:view(d), kind:d.kind}).length : 0;
  EL.innerHTML = '<div class="dkBar"><button class="chip" id="dkBack">‹ ' + L("Dokumen", "Documents") + '</button><input id="dkTi" class="rin dkTi" value="' + E(d.title) + '"></div>' +
    (d.ai ? '<div class="dkWarn">⚠️ ' + L("Draf AI: semak fakta, nama, tarikh dan angka sebelum menghantar.", "AI draft: check the facts, names, dates and numbers before you send it.") + (d.prov ? ' <small class="mut">· ' + E(d.prov) + '</small>' : '') + '</div>' : '') +
    (o.priv ? '<div class="dkNote">🔒 ' + L("Dokumen peribadi.", "Personal document.") + (o.note ? ' ' + E(L(T.NOTES[o.note][0], T.NOTES[o.note][1])) : '') + '</div>' : o.note ? '<div class="dkNote">ℹ️ ' + E(L(T.NOTES[o.note][0], T.NOTES[o.note][1])) + '</div>' : '') +
    ((d.miss || []).length ? '<div class="dkWarn">❓ ' + L("Mungkin tertinggal: ", "May be missing: ") + E(d.miss.join(", ")) + '</div>' : '') +
    (d.cut ? '<div class="dkWarn">✂️ ' + L("Draf mungkin terpotong. Cuba panjang lebih pendek.", "The draft may be cut short. Try a shorter length.") + '</div>' : '') +
    (gaps.length ? '<div class="dkGaps">' + gaps.map(function(g){ return '<button class="chip dkGap" data-gb="' + g[0] + '">✏️ ' + E(g[1]) + '</button>'; }).join("") + '</div>' : '') +
    ((d.subs || []).length && !ST.show ? '<div class="plQ">✉️ ' + L("Pilihan subjek", "Subject options") + '</div><div class="rseg">' + d.subs.map(function(s, i){ return '<button class="chip" data-sb="' + i + '">' + E(s) + '</button>'; }).join("") + '</div>' : '') +
    (langs.length > 1 ? '<div class="rseg">' + langs.map(function(l){ return '<button class="chip' + ((ST.show || d.lang) === l ? ' on' : '') + '" data-vl="' + l + '">' + l.toUpperCase() + '</button>'; }).join("") + '</div>' : '') +
    (wc ? '<div class="dkInfo">🔢 ' + wc + L(" aksara", " characters") + (d.f.limit ? ' / ' + E(d.f.limit) : '') + '</div>' : '') +
    '<div class="dkTools"><button class="chip" data-tl="theme">🎨 ' + L("Tema", "Theme") + '</button><button class="chip" data-tl="ai">✨ AI</button><button class="chip" data-tl="tr">🌐</button><button class="chip" data-tl="say">🗣</button><button class="chip" data-tl="ver">↩️</button><button class="chip" data-tl="more">⋯</button><button class="btn gold" data-tl="exp">⤴ ' + L("Eksport", "Export") + '</button></div>' +
    '<div class="mut tiny">' + L("Ketik mana-mana bahagian halaman untuk mengubahnya.", "Tap any part of the page to edit it.") + '</div><div id="dkPages" class="dkPages"></div>';
  renderPages(d, EL.querySelector("#dkPages"));
  var q = function(x){ return EL.querySelector(x); };
  q("#dkBack").onclick = function(){ ST.show = null; go("home"); };
  q("#dkTi").onchange = function(){ d.title = this.value.trim() || d.title; docPut(d); };
  EL.querySelectorAll("[data-gb]").forEach(function(b){ b.onclick = function(){ editBlock(d, +b.getAttribute("data-gb")); }; });
  EL.querySelectorAll("[data-sb]").forEach(function(b){ b.onclick = function(){ var s = d.subs[+b.getAttribute("data-sb")], i = d.blocks.map(function(x){ return x.t; }).indexOf("subject"); if(i >= 0){ d.blocks[i].text = (d.kind === "email" ? (d.lang === "en" ? "Subject: " : "Subjek: ") : "") + s.replace(/^(subject|subjek)\s*:\s*/i, ""); docPut(d); pDoc(); } }; });
  EL.querySelectorAll("[data-vl]").forEach(function(b){ b.onclick = function(){ var l = b.getAttribute("data-vl"); ST.show = l === d.lang ? null : l; pDoc(); }; });
  EL.querySelectorAll("[data-tl]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-tl");
    if(k === "theme") themeSheet(d); else if(k === "ai") aiSheet(d); else if(k === "tr") trSheet(d); else if(k === "say") say(d); else if(k === "ver") verSheet(d); else if(k === "exp") expSheet(d); else moreSheet(d); }; }); }
function editBlock(d, bi){ var bl = view(d), b = bl[bi]; if(!b) return; var t = b.t, val, rows = 4;
  if(b.lines) val = b.lines.join("\n"); else if(t === "kv") val = (b.items || []).map(function(x){ return (x[0] ? x[0] + ": " : "") + x[1]; }).join("\n"); else if(b.items) val = b.items.join("\n");
  else if(t === "table") val = [(b.head || []).join(" | ")].concat((b.rows || []).map(function(r){ return r.join(" | "); })).join("\n"); else if(t === "gap") val = ""; else val = b.text || "";
  if(t === "table") rows = 8; if(t === "p") rows = 6;
  var hint = t === "table" ? L("Satu baris setiap baris jadual; pisahkan lajur dengan |", "One line per table row; separate columns with |") : b.lines || b.items ? L("Satu perkara setiap baris", "One item per line") : t === "gap" ? L("Tulis maklumat yang perlu diisi", "Type the missing detail") : "";
  var ov = H.showSheet("✏️ " + L("Ubah", "Edit"), (hint ? '<div class="mut tiny">' + hint + '</div>' : '') + '<textarea id="ebT" class="rin" rows="' + rows + '"' + (/[\u0600-\u06FF]/.test(val) ? ' dir="rtl"' : '') + '>' + E(val) + '</textarea>' +
    '<div class="btns" style="margin-top:8px;flex-wrap:wrap"><button class="btn gold" id="ebOk">' + L("Simpan", "Save") + '</button><button class="btn alt" id="ebUp">▲</button><button class="btn alt" id="ebDn">▼</button><button class="btn alt" id="ebAdd">＋ ' + L("Perenggan", "Paragraph") + '</button><button class="btn delb" id="ebDel">🗑 ' + L("Padam", "Delete") + '</button></div>');
  var ta = ov.querySelector("#ebT"), keep = function(){ d.ver = [{t:now(), blocks:JSON.parse(JSON.stringify(d.blocks))}].concat(d.ver || []).slice(0, 10); };
  ov.querySelector("#ebOk").onclick = function(){ keep(); var v = ta.value;
    if(b.lines) b.lines = v.split("\n"); else if(t === "kv") b.items = v.split("\n").filter(Boolean).map(function(l){ var m = l.match(/^([^:]{1,30}):\s*(.*)$/); return m ? [m[1], m[2]] : ["", l]; }); else if(b.items) b.items = v.split("\n").filter(Boolean);
    else if(t === "table"){ var ls = v.split("\n").filter(function(l){ return l.trim(); }).map(function(l){ return l.split("|").map(function(c){ return c.trim(); }); }); b.head = ls.shift() || []; b.rows = ls; }
    else if(t === "gap"){ if(v.trim()){ b.t = "p"; b.text = v.trim(); delete b.field; } } else b.text = v;
    docPut(d); H.closeOverlay(); pDoc(); };
  ov.querySelector("#ebUp").onclick = function(){ if(bi < 1) return; keep(); bl.splice(bi - 1, 0, bl.splice(bi, 1)[0]); docPut(d); H.closeOverlay(); pDoc(); };
  ov.querySelector("#ebDn").onclick = function(){ if(bi >= bl.length - 1) return; keep(); bl.splice(bi + 1, 0, bl.splice(bi, 1)[0]); docPut(d); H.closeOverlay(); pDoc(); };
  ov.querySelector("#ebAdd").onclick = function(){ keep(); bl.splice(bi + 1, 0, {t:"p", text:"…"}); docPut(d); H.closeOverlay(); pDoc(); setTimeout(function(){ editBlock(d, bi + 1); }, 200); };
  ov.querySelector("#ebDel").onclick = function(){ keep(); bl.splice(bi, 1); docPut(d); H.closeOverlay(); pDoc(); }; }
function themeSheet(d){ var o = d.opt || (d.opt = {}), TH = DokThemes.THEMES, seg = function(k, list){ return '<div class="rseg">' + list.map(function(x){ return '<button class="chip' + (String(o[k] == null ? DokThemes.OPTS[k] : o[k]) === String(x[0]) ? ' on' : '') + '" data-ok="' + k + '" data-ov="' + E(x[0]) + '">' + E(x[1]) + '</button>'; }).join("") + '</div>'; };
  var ov = H.showSheet("🎨 " + L("Tema & format", "Theme & format"), '<div class="dkThs">' + TH.map(function(x){ return '<button class="dkTh' + (d.theme === x.id ? ' on' : '') + '" data-th="' + x.id + '"><canvas width="10" height="10"></canvas><b>' + E(L(x.ms, x.en)) + '</b><small>' + E(L(x.best[0], x.best[1])) + '</small></button>'; }).join("") + '</div>' +
    '<div class="plQ">' + L("Warna", "Colour") + '</div><div class="dkSw">' + DokThemes.ACCENTS.map(function(a){ return '<button class="dkSwc' + ((o.acc || "") === a[0] ? ' on' : '') + '" data-acc="' + a[0] + '" style="background:' + (a[0] || "linear-gradient(135deg,#ccc,#fff)") + '" title="' + E(L(a[1], a[2])) + '"></button>'; }).join("") + '</div>' +
    '<div class="plQ">' + L("Fon", "Font") + '</div>' + seg("font", [["", L("Tema", "Theme")], ["serif", "Serif"], ["sans", "Sans"], ["round", L("Bulat", "Rounded")]]) +
    '<div class="plQ">' + L("Saiz", "Size") + '</div>' + seg("size", [["s", L("Kecil", "Small")], ["n", L("Biasa", "Normal")], ["l", L("Besar", "Large")]]) +
    '<div class="plQ">' + L("Jarak baris", "Line spacing") + '</div>' + seg("lead", [["1", "1.0"], ["1.15", "1.15"], ["1.5", "1.5"]]) +
    '<div class="plQ">' + L("Kertas & margin", "Paper & margins") + '</div>' + seg("paper", [["a4", "A4"], ["letter", "Letter"]]) + seg("margin", [["s", L("Sempit", "Narrow")], ["n", L("Biasa", "Normal")], ["w", L("Lebar", "Wide")]]) +
    '<div class="plQ">' + L("Kepala surat", "Header") + '</div>' + seg("header", [["auto", L("Ikut tema", "Theme")], ["none", L("Tiada", "None")], ["name", L("Nama", "Name")], ["letterhead", L("Kepala surat", "Letterhead")], ["logo", "Logo"]]) +
    '<div class="plQ">' + L("Kaki halaman", "Footer") + '</div>' + seg("footer", [["none", L("Tiada", "None")], ["page", L("No. halaman", "Page no.")], ["pageof", "1 / 2"]]) +
    '<div class="plQ">' + L("Tandatangan", "Signature") + '</div>' + seg("sign", [["none", L("Tiada", "None")], ["typed", L("Taip", "Typed")], ["image", L("Gambar (profil)", "Image (profile)")]]) +
    '<div class="plQ">' + L("Tera air", "Watermark") + '</div>' + seg("wm", [["", L("Tiada", "None")], ["draf", "DRAF"], ["custom", L("Teks sendiri", "Own text")]]) + (o.wm === "custom" ? '<input id="dkWt" class="rin" value="' + E(o.wmText || "") + '">' : ''));
  // live thumbnails of this document in every theme
  ov.querySelectorAll("[data-th]").forEach(function(b){ var p = DokThemes.layout({blocks:view(d), kind:d.kind, lang:d.lang, prof:d.prof}, b.getAttribute("data-th"), o)[0]; DokThemes.draw(b.querySelector("canvas"), p, 0.12);
    b.onclick = function(){ d.theme = b.getAttribute("data-th"); var s = set(); s.opt.th = s.opt.th || {}; s.opt.th[d.type] = d.theme; setSave(s); docPut(d); H.closeOverlay(); pDoc(); }; });
  ov.querySelectorAll("[data-acc]").forEach(function(b){ b.onclick = function(){ o.acc = b.getAttribute("data-acc"); docPut(d); H.closeOverlay(); pDoc(); themeSheet(d); }; });
  ov.querySelectorAll("[data-ok]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-ok"), v = b.getAttribute("data-ov"); o[k] = k === "lead" ? +v : v; if(k === "wm" && v === "draf") o.wm = "draf"; docPut(d); H.closeOverlay(); pDoc(); themeSheet(d); }; });
  var wt = ov.querySelector("#dkWt"); if(wt) wt.onchange = function(){ o.wmText = wt.value; docPut(d); pDoc(); }; }
function aiSheet(d){ var t = typ(d.type), o = opts(t), tones = [["more formal", L("Lebih rasmi", "More formal")], ["more polite", L("Lebih sopan", "More polite")], ["friendlier", L("Lebih mesra", "Friendlier")], ["firmer", L("Lebih tegas", "Firmer")], ["shorter", L("Lebih pendek", "Shorter")], ["longer", L("Lebih panjang", "Longer")]];
  var ov = H.showSheet("✨ " + L("Alat AI", "AI tools"), '<button class="card dkVar" data-ai="polish">✨ <b>' + L("Gilap", "Polish") + '</b><small class="mut">' + L("Tatabahasa dan aliran lebih baik", "Better grammar and flow") + '</small></button>' +
    '<div class="plQ">🎚 ' + L("Nada", "Tone") + '</div><div class="rseg">' + tones.map(function(x){ return '<button class="chip" data-tone="' + x[0] + '">' + E(x[1]) + '</button>'; }).join("") + '</div>' +
    '<button class="card dkVar" data-ai="check">✅ <b>' + L("Semak", "Check") + '</b><small class="mut">' + L("Fakta tertinggal, ejaan, perkataan tidak sesuai", "Missing facts, spelling, words that don't fit") + '</small></button>' +
    '<button class="card dkVar" data-ai="vary">🔁 <b>' + L("Variasi pembukaan", "Opening variations") + '</b></button>' +
    (d.type === "cv" ? '<button class="card dkVar" data-ai="ats">🎯 <b>' + L("Semakan ATS", "ATS check") + '</b><small class="mut">' + L("Skor dan cadangan", "Score and tips") + '</small></button>' : '') +
    (d.type === "cv" || d.type === "cover" ? '<button class="card dkVar" data-ai="job">🎯 <b>' + L("Padankan dengan iklan kerja", "Match a job ad") + '</b></button>' : '') +
    '<div class="mut tiny">' + L("Setiap perubahan AI disimpan sebagai versi (↩️).", "Every AI change keeps a version (↩️).") + '</div>');
  ov.querySelectorAll("[data-ai]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-ai"); H.closeOverlay();
    if(k === "job"){ var o2 = H.showSheet("🎯 " + L("Iklan kerja", "Job ad"), '<textarea id="jbT" class="rin" rows="8" placeholder="' + E(L("Tampal iklan kerja", "Paste the job ad")) + '">' + E(d.f.jobad || "") + '</textarea><button class="btn gold full" id="jbGo" style="margin-top:8px">🎯 ' + L("Padankan", "Match") + '</button>');
      o2.querySelector("#jbGo").onclick = function(){ var v = o2.querySelector("#jbT").value.trim(); if(!v) return; d.f.jobad = v; H.closeOverlay(); aiTool(d, "job", v); }; return; }
    aiTool(d, k); }; });
  ov.querySelectorAll("[data-tone]").forEach(function(b){ b.onclick = function(){ H.closeOverlay(); aiTool(d, "tone", b.getAttribute("data-tone")); }; }); }
function trSheet(d){ var ov = H.showSheet("🌐 " + L("Terjemah", "Translate"), '<div class="rseg">' + [["ms", "Bahasa Melayu"], ["en", "English"], ["id", "Bahasa Indonesia"], ["ar", "العربية"]].filter(function(x){ return x[0] !== d.lang; }).map(function(x){ return '<button class="chip" data-tr="' + x[0] + '">' + x[1] + (d.tr && d.tr[x[0]] ? ' ✓' : '') + '</button>'; }).join("") + '</div><div class="mut tiny">' + L("Susun atur kekal; adab surat ikut bahasa.", "The layout stays; letter conventions follow the language.") + '</div>');
  ov.querySelectorAll("[data-tr]").forEach(function(b){ b.onclick = function(){ var l = b.getAttribute("data-tr"); H.closeOverlay(); if(d.tr && d.tr[l]){ ST.show = l; pDoc(); return; } aiTool(d, "tr", l); }; }); }
var SAY = null;
function say(d){ var t = DokThemes.text({blocks:view(d), kind:d.kind, lang:ST.show || d.lang}), lang = ST.show || d.lang;
  if(SAY){ try{ H.N.stopSpeak(); }catch(e){} SAY = null; H.toast("⏹"); return; }
  var words = t.split(/\s+/).length, mins = Math.max(1, Math.round(words / 130)); SAY = {t0:now()};
  try{ H.N.speak(t, lang === "en" ? "en" : lang === "ar" ? "ar" : "ms"); }catch(e){}
  H.toast("🗣 " + L("Membaca… anggaran ", "Reading… about ") + mins + L(" minit (ketik 🗣 untuk henti)", " min (tap 🗣 to stop)"));
  var h = function(){ H.off("ttsdone", h); if(SAY){ var s = Math.round((now() - SAY.t0) / 1000); SAY = null; if(d.type === "ucapan") H.toast("⏱ " + Math.floor(s / 60) + ":" + pad(s % 60)); } }; H.on("ttsdone", h); }
function verSheet(d){ if(!(d.ver || []).length){ H.toast(L("Tiada versi lama", "No earlier versions")); return; }
  var ov = H.showSheet("↩️ " + L("Versi", "Versions"), d.ver.map(function(v, i){ return '<button class="card dkVar" data-vr="' + i + '">' + E(new Date(v.t).toLocaleString(en() ? "en-GB" : "ms-MY", {day:"numeric", month:"short", hour:"numeric", minute:"2-digit"})) + ' · ' + E((v.blocks.filter(function(b){ return b.t === "p"; })[0] || {text:""}).text.slice(0, 60)) + '…</button>'; }).join(""));
  ov.querySelectorAll("[data-vr]").forEach(function(b){ b.onclick = function(){ var v = d.ver.splice(+b.getAttribute("data-vr"), 1)[0]; d.ver.unshift({t:now(), blocks:d.blocks}); d.blocks = v.blocks; docPut(d); H.closeOverlay(); pDoc(); H.toast("↩️ " + L("Dipulihkan", "Restored")); }; }); }
function moreSheet(d){ var ov = H.showSheet("⋯", '<button class="card dkVar" id="mmEdit">📝 ' + L("Ubah borang dan draf semula", "Edit the form and draft again") + '</button><button class="card dkVar" id="mmDup">📄 ' + L("Guna sebagai templat (salin)", "Use as template (duplicate)") + '</button>' +
    '<button class="card dkVar" id="mmPin">📌 ' + (d.pin ? L("Nyahsemat", "Unpin") : L("Semat", "Pin")) + '</button><button class="card dkVar" id="mmTpl">📄 ' + L("Tukar ke templat ringkas", "Switch to the simple template") + '</button><button class="btn delb full" id="mmDel">🗑 ' + L("Padam dokumen", "Delete document") + '</button>');
  ov.querySelector("#mmEdit").onclick = function(){ H.closeOverlay(); ST.form = JSON.parse(JSON.stringify(d)); go("form", {type:d.type}); };
  ov.querySelector("#mmDup").onclick = function(){ var c = JSON.parse(JSON.stringify(d)); c.id = uid(); c.title = d.title + " (2)"; c.created = now(); c.pin = false; docPut(c); H.closeOverlay(); openDoc(c.id); };
  ov.querySelector("#mmPin").onclick = function(){ d.pin = !d.pin; docPut(d); H.closeOverlay(); pDoc(); };
  ov.querySelector("#mmTpl").onclick = function(){ d.ver = [{t:now(), blocks:d.blocks}].concat(d.ver || []).slice(0, 10); d.blocks = template(d); d.ai = false; docPut(d); H.closeOverlay(); pDoc(); };
  ov.querySelector("#mmDel").onclick = function(){ if(!confirm(L("Padam dokumen ini?", "Delete this document?"))) return; docsSave(docs().filter(function(x){ return x.id !== d.id; })); H.closeOverlay(); go("home"); }; }
function fname(d, ext){ return (d.title || "dokumen").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").slice(0, 60) + "." + ext; }
function canvases(d){ var pages = DokThemes.layout({blocks:view(d), kind:d.kind, lang:ST.show || d.lang, prof:d.prof, title:d.title}, d.theme, d.opt || {}); return DokThemes.ready(pages).then(function(){ return pages.map(function(p){ var cv = document.createElement("canvas"); DokThemes.draw(cv, p, 1); return cv; }); }); }
function b64(u8){ var s = "", i; for(i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
function expSheet(d){ var gaps = gapsOf({blocks:view(d)}), em = d.kind === "email";
  var ov = H.showSheet("⤴ " + L("Eksport", "Export"), (gaps.length ? '<div class="dkWarn">⚠️ ' + gaps.length + L(" ruangan belum diisi: ", " details still to fill in: ") + E(gaps.map(function(g){ return g[1]; }).join(", ")) + '</div>' : '') +
    '<div class="dkExp"><button class="card" data-ex="pdf">📄 PDF</button><button class="card" data-ex="docx">📝 Word (DOCX)</button><button class="card" data-ex="png">🖼 ' + L("Gambar", "Picture") + ' (PNG)</button><button class="card" data-ex="copy">📋 ' + L("Salin teks", "Copy text") + '</button>' +
    (em ? '<button class="card" data-ex="csub">✉️ ' + L("Salin subjek", "Copy subject") + '</button><button class="card" data-ex="cbody">✉️ ' + L("Salin isi", "Copy body") + '</button><button class="card" data-ex="mail">📧 ' + L("Buka aplikasi e-mel", "Open the email app") + '</button>' : '') +
    '<button class="card" data-ex="wa">💬 WhatsApp</button><button class="card" data-ex="books">📚 ' + L("Simpan ke Buku", "Save to Books") + '</button></div>');
  ov.querySelectorAll("[data-ex]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-ex"), txt = DokThemes.text({blocks:view(d), kind:d.kind, lang:ST.show || d.lang}), bl = view(d);
    var subj = ((bl.filter(function(x){ return x.t === "subject"; })[0] || {}).text || d.title).replace(/^(subject|subjek)\s*:\s*/i, ""), body = DokThemes.text({blocks:bl.filter(function(x){ return x.t !== "subject"; }), kind:d.kind, lang:d.lang});
    var copy = function(t){ try{ if(H.N && H.N.copyText) H.N.copyText(t); else navigator.clipboard.writeText(t); }catch(e){} H.toast("📋 " + L("Disalin", "Copied")); };
    if(k === "copy") copy(txt); else if(k === "csub") copy(subj); else if(k === "cbody") copy(body);
    else if(k === "mail"){ var u = "mailto:?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body); if(u.length > 2000){ copy(body); H.toast(L("Terlalu panjang: isi disalin, tampal dalam e-mel", "Too long: the body is copied, paste it in the email")); } else if(H.N && H.N.openUrl) H.N.openUrl(u); else location.href = u; }
    else if(k === "wa"){ var wa = txt.length > 1500 ? null : txt; if(wa){ if(H.N && H.N.shareText) H.N.shareText(wa); else copy(wa); } else canvases(d).then(function(cvs){ if(H.N && H.N.shareImage) H.N.shareImage(cvs[0].toDataURL("image/png"), d.title); }); }
    else if(k === "png"){ canvases(d).then(function(cvs){ cvs.forEach(function(cv, i){ var du = cv.toDataURL("image/png"); if(H.N && H.N.shareImage && i === 0) H.N.shareImage(du, d.title); else if(H.N && H.N.imageSave) H.N.imageSave(fname(d, "png").replace(".png", "-" + (i + 1) + ".png"), du); }); }); }
    else if(k === "pdf" || k === "books"){ canvases(d).then(function(cvs){ var mm = DokThemes.PAPER[(d.opt || {}).paper] || DokThemes.PAPER.a4, b = DokThemes.pdf(cvs, mm);
      if(k === "books" && H.toBooks){ var bin = atob(b), u8 = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); H.toBooks(u8, fname(d, "pdf")); } else H.sharePdf(fname(d, "pdf"), b, d.title); }); }
    else if(k === "docx"){ var u8 = DokThemes.docx({blocks:view(d), kind:d.kind, lang:ST.show || d.lang, prof:d.prof}, d.theme, d.opt || {}), b2 = b64(u8);
      if(H.N && H.N.shareBinary) H.N.shareBinary(fname(d, "docx"), b2, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", d.title); else { var a = document.createElement("a"); a.href = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64," + b2; a.download = fname(d, "docx"); document.body.appendChild(a); a.click(); a.remove(); } }
    H.closeOverlay(); }; }); }

// ---------- profile + my documents ----------
var PF = [["label","Nama profil","Profile name"],["name","Nama penuh","Full name"],["ic","No. K/P","IC number"],["addr","Alamat","Address","a"],["phone","Telefon","Phone"],["email","E-mel","Email"],["job","Jawatan","Job title"],["company","Syarikat","Company"],
  ["edu","Pendidikan (satu setiap baris)","Education (one per line)","a"],["work","Pengalaman kerja (satu setiap baris)","Work experience (one per line)","a"],["skills","Kemahiran","Skills","a"],["langs","Bahasa","Languages"],["co","Nama organisasi / surau (kepala surat)","Organisation / surau (letterhead)"],["reg","No. pendaftaran (SSM / ROS)","Registration no. (SSM / ROS)"]];
function pProf(){ var P = profs(), p = P.list.filter(function(x){ return x.id === (ST.pid || P.cur); })[0] || P.list[0]; if(P.cur === "biz" && !ST.pid) p = P.list[0];
  EL.innerHTML = '<div class="dkBar"><button class="chip" id="dkBack">‹ ' + L("Kembali", "Back") + '</button></div><div class="rseg">' + P.list.map(function(x){ return '<button class="chip' + (x.id === p.id ? ' on' : '') + '" data-pid="' + x.id + '">' + E(x.label || x.name || "—") + '</button>'; }).join("") + '<button class="chip" id="dkPadd">＋</button></div>' +
    '<div class="card">' + PF.map(function(f){ var v = p[f[0]] || ""; return '<label class="hfld">' + E(L(f[1], f[2])) + (f[3] ? '<textarea class="rin" rows="3" data-pf="' + f[0] + '">' + E(v) + '</textarea>' : '<input class="rin" type="text" data-pf="' + f[0] + '" value="' + E(v) + '">') + '</label>'; }).join("") +
    '<div class="plQ">' + L("Gambar", "Pictures") + '</div><div class="btns" style="flex-wrap:wrap"><button class="btn alt" data-pim="sign">✍️ ' + L("Tandatangan", "Signature") + (p.sign ? " ✓" : "") + '</button><button class="btn alt" data-pim="logo">🏷 Logo' + (p.logo ? " ✓" : "") + '</button><button class="btn alt" data-pim="photo">👤 ' + L("Foto (CV)", "Photo (CV)") + (p.photo ? " ✓" : "") + '</button></div>' +
    '<div class="mut tiny">' + L("Disimpan dalam telefon ini (dan Google Drive anda jika sync dihidupkan). No. K/P disembunyikan dalam dokumen: 9001**-**-1234.", "Kept on this phone (and your Google Drive if sync is on). The IC number is masked in documents: 9001**-**-1234.") + '</div>' +
    (p.id !== "me" ? '<button class="btn delb full" id="dkPdel" style="margin-top:10px">🗑 ' + L("Padam profil", "Delete profile") + '</button>' : '') + '</div>';
  EL.querySelector("#dkBack").onclick = function(){ ST.pid = null; go(ST.form ? "form" : "home"); };
  EL.querySelectorAll("[data-pid]").forEach(function(b){ b.onclick = function(){ ST.pid = b.getAttribute("data-pid"); pProf(); }; });
  EL.querySelector("#dkPadd").onclick = function(){ var n = prompt(L("Nama profil (cth. Isteri, Anak, Surau)", "Profile name (e.g. Spouse, Child, Surau)")); if(!n) return; var P2 = profs(), x = {id:"p" + now().toString(36), kind:"other", label:n}; P2.list.push(x); profSave(P2); ST.pid = x.id; pProf(); };
  EL.querySelectorAll("[data-pf]").forEach(function(x){ x.onchange = function(){ var P2 = profs(), q = P2.list.filter(function(y){ return y.id === p.id; })[0]; q[x.getAttribute("data-pf")] = x.value.trim(); profSave(P2); }; });
  EL.querySelectorAll("[data-pim]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-pim"), h = function(r){ H.off("image", h); if(!r || !r.data) return; shrink(r.data, 400, k === "sign").then(function(u){ var P2 = profs(), q = P2.list.filter(function(y){ return y.id === p.id; })[0]; q[k] = u; profSave(P2); pProf(); }); }; H.on("image", h); H.N.pickImage("gallery"); }; });
  var del = EL.querySelector("#dkPdel"); if(del) del.onclick = function(){ if(!confirm(L("Padam profil ini?", "Delete this profile?"))) return; var P2 = profs(); P2.list = P2.list.filter(function(y){ return y.id !== p.id; }); if(P2.cur === p.id) P2.cur = "me"; profSave(P2); ST.pid = null; pProf(); }; }
function shrink(du, max, png){ return new Promise(function(res){ var im = new Image(); im.onload = function(){ var s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL(png ? "image/png" : "image/jpeg", 0.85)); }; im.onerror = function(){ res(du); }; im.src = du; }); }
function pMine(){ var q = (ST.mq || "").toLowerCase(), D = docs().filter(function(d){ return !q || (d.title + " " + d.type).toLowerCase().indexOf(q) >= 0; }).sort(function(a, b){ return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.updated - a.updated; });
  EL.innerHTML = '<div class="dkBar"><button class="chip" id="dkBack">‹ ' + L("Dokumen", "Documents") + '</button></div><input id="dkMq" class="rin" type="search" placeholder="🔎 ' + E(L("Cari dokumen saya", "Search my documents")) + '" value="' + E(ST.mq || "") + '">' +
    (D.length ? D.map(docRow).join("") : '<div class="card mut">' + L("Belum ada dokumen. Pilih jenis untuk mula.", "No documents yet. Pick a type to start.") + '</div>');
  EL.querySelector("#dkBack").onclick = function(){ go("home"); };
  var mq = EL.querySelector("#dkMq"); mq.oninput = function(){ ST.mq = mq.value; var p = mq.selectionStart; pMine(); var n = EL.querySelector("#dkMq"); n.focus(); try{ n.setSelectionRange(p, p); }catch(e){} }; bindDocRows(); }

// ---------- module ----------
function view_(el, h){ H = h; EL = el; T = window.DokTypes; draw(); }
window.DokumenView = {view:view_, back:function(){ if(ST.pg === "home") return false; if(ST.pg === "doc" || ST.pg === "mine" || ST.pg === "pick") go("home"); else if(ST.pg === "form") { keepDraft(); go("pick"); } else if(ST.pg === "prof") go(ST.form ? "form" : "home"); return true; },
  navGet:function(){ return {pg:ST.pg, id:ST.id, type:ST.type, cat:ST.cat, k:ST.pg + "/" + (ST.id || ST.type || ST.cat || "")}; },
  navSet:function(o){ if(!o) return; ST.pg = o.pg || "home"; ST.id = o.id || null; ST.cat = o.cat || ""; if(ST.pg === "form"){ var dr = H && H.load(K.draft, null); if(dr && dr.type === o.type) ST.form = dr; else if(o.type) ST.form = newDoc(o.type); else ST.pg = "home"; } if(EL) draw(); },
  _t:{template:template, parse:parse, workdays:workdays, msgsFor:msgsFor, newDoc:newDoc, gapsOf:gapsOf, missing:missing, ST:ST, docs:docs}};
})();
