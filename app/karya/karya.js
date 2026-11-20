/* My Ihsan 0.6.18 · Baca › Karya: an AI writing studio for literature.
   20 forms (sajak, syair, pantun, gurindam … cerpen, hikayat, munajat), any of the 4 app languages, 4 lengths up to one A4 page,
   mood, optional topic and dedication. The result is shown in a framed page; it can be copied (text only), translated into the
   other 3 languages, polished, read aloud, saved to a personal collection and exported in 6 page styles as PNG or A4 PDF
   (or straight into Books › Karya). AI goes through window.HalalAI.chat (the provider set in Settings › Online AI, free fallback).
   KaryaView.view(el, H) with H = {N, S, L2x, esc, toast, load, save, openSettings, canvasPdf, sharePdf, toBooks}. */
(function(){
"use strict";
var H = null, root = null, busy = false, lastY = 0;
var KEY = "ihsan_karya";
function L(a, b){ return H.L2x(a, b); }
function esc(s){ return H.esc(s); }

var LANGS = [["ms", "Bahasa Melayu", "BM", "Bahasa Melayu (Malaysia)"], ["en", "English", "EN", "English"], ["id", "Bahasa Indonesia", "ID", "Bahasa Indonesia"], ["ar", "العربية", "AR", "Arabic (fus-ha)"]];
// [id, icon, BM, EN, prose?, instruction for the AI]
var TYPES = [
  ["sajak", "🌿", "Sajak", "Free-verse poem", 0, "a modern free-verse poem (Malay 'sajak'): vivid imagery, fresh metaphors, stanzas of uneven length, no forced rhyme"],
  ["syair", "📜", "Syair", "Syair", 0, "a 'syair': quatrains, every line 8–12 syllables, all four lines of each stanza end with the same rhyme (a-a-a-a), telling a story or giving advice"],
  ["pantun", "🌺", "Pantun", "Pantun", 0, "several 'pantun' quatrains with rhyme a-b-a-b: lines 1–2 are the 'pembayang' (nature imagery), lines 3–4 the 'maksud' (the real meaning); every line 8–12 syllables; stanzas separated by a blank line"],
  ["gurindam", "⚖️", "Gurindam", "Gurindam", 0, "a 'gurindam': couplets rhyming a-a, the first line states a condition and the second its consequence, wise and moral; couplets separated by a blank line"],
  ["seloka", "🎭", "Seloka", "Seloka (satire)", 0, "a 'seloka': free-form gently satirical, humorous verse with a clear moral lesson, never mean"],
  ["haiku", "🍃", "Haiku", "Haiku", 0, "a sequence of haiku: each 3 lines of 5-7-5 syllables, nature and season imagery, one moment each; haiku separated by a blank line"],
  ["soneta", "🎼", "Soneta", "Sonnet", 0, "a sonnet: 14 lines, rhyme scheme abab cdcd efef gg, with a turn (volta) before the final couplet; for longer lengths write more than one sonnet"],
  ["lagu", "🎵", "Lirik lagu", "Song lyrics", 0, "song lyrics: verses, a memorable repeated chorus and a bridge, singable rhythm and rhyme; label sections in square brackets in the chosen language, e.g. [Korus] / [Chorus]"],
  ["nasyid", "🎙", "Nasyid", "Nasheed", 0, "nasyid (nasheed) lyrics: verses and chorus praising Allah, the Prophet ﷺ or good character, warm and uplifting; label sections in square brackets"],
  ["qasidah", "🌙", "Qasidah", "Qasida (ode)", 0, "a qasidah (classical ode) in couplets with a single rhyme kept through the whole poem (monorhyme), praise, longing and wisdom"],
  ["balada", "🏹", "Balada", "Ballad", 0, "a ballad: a narrative poem in quatrains rhyming a-b-c-b, telling a story with characters, dialogue and a moving ending"],
  ["elegi", "🕯", "Elegi", "Elegy", 0, "an elegy: a reflective poem of remembrance and loss that ends in comfort, gratitude and hope"],
  ["limerik", "😄", "Limerik", "Limerick", 0, "a few limericks: humorous five-line stanzas rhyming a-a-b-b-a with a bouncy rhythm, kind humour"],
  ["kanak", "🧸", "Puisi kanak-kanak", "Children's rhyme", 0, "a children's rhyme: simple words, playful rhythm and rhyme, cheerful and easy to memorise"],
  ["cerpen", "📖", "Cerpen", "Short story", 1, "a short story: a vivid opening, characters, a conflict, a turning point and a meaningful ending, in well-shaped paragraphs with some dialogue"],
  ["fabel", "🦊", "Fabel", "Fable", 1, "a fable with animal characters and a simple plot, ending with one line that states the moral (start that line with 'Pengajaran:' / 'Moral:' / 'Pelajaran:' / 'العبرة:' to suit the language)"],
  ["hikayat", "👑", "Hikayat", "Hikayat (classical tale)", 1, "a 'hikayat'-style classical tale: old-fashioned storyteller narration (in Malay begin with 'Alkisah' and use 'maka'; in other languages an equivalent classical tone), a royal or heroic setting and a wise ending"],
  ["monolog", "🎭", "Monolog", "Monologue", 1, "a dramatic monologue: one character speaks their thoughts aloud, with an emotional arc from struggle to resolve"],
  ["hikmah", "💎", "Kata hikmah", "Words of wisdom", 0, "a set of short, original aphorisms (words of wisdom), one per line, each memorable and complete on its own; do not number them"],
  ["munajat", "🤲", "Munajat", "Munajat (poetic prayer)", 0, "a 'munajat': a heartfelt, humble poetic prayer to Allah in verse lines, full of hope; do not quote Quran verses or hadith"]
];
var MOODS = [["", "✨", "Bebas", "Any"], ["tenang", "🌙", "Tenang", "Calm"], ["gembira", "☀️", "Gembira", "Joyful"], ["sayu", "🍂", "Sayu", "Wistful"], ["semangat", "🔥", "Semangat", "Inspiring"],
             ["kasih", "💞", "Kasih sayang", "Loving"], ["rohani", "🤲", "Kerohanian", "Spiritual"], ["syukur", "🌿", "Syukur", "Grateful"], ["jenaka", "😄", "Jenaka", "Playful"], ["rindu", "🕊", "Rindu", "Longing"]];
var MOOD_EN = {tenang: "calm and peaceful", gembira: "joyful", sayu: "wistful, gently sad", semangat: "inspiring and energetic", kasih: "loving and tender (family, friends, people)", rohani: "spiritual and reflective", syukur: "grateful", jenaka: "playful and funny", rindu: "longing and nostalgic"};
var LENS = [["s", "Pendek", "Short", 80, 900], ["m", "Sederhana", "Medium", 170, 1400], ["l", "Panjang", "Long", 290, 2200], ["xl", "Sangat panjang", "Extra long", 420, 3200]];   // words, max_tokens; xl = one full A4 page
var STYLES = [["klasik", "📜", "Manuskrip", "Manuscript"], ["qurani", "🕌", "Iluminasi", "Illumination"], ["kursif", "🖋", "Kaligrafi emas", "Gold calligraphy"],
              ["moden", "🕍", "Mihrab", "Mihrab"], ["malam", "🏮", "Lailatulqadar", "Night of Power"], ["songket", "🧵", "Songket tenun", "Woven songket"]];   // 0.6.33: frames drawn by karya/frames2.js
var IDEA = {
  ms: ["Hujan pertama selepas kemarau", "Ibu di dapur waktu subuh", "Pelita di kampung lama", "Sahabat yang jauh di rantau", "Laut yang menyimpan rahsia", "Ilmu ialah cahaya", "Kampung halaman di Aidilfitri", "Pokok tua di hadapan sekolah", "Rindu kepada ayah", "Bulan sabit di langit Ramadan", "Jalan pulang", "Secawan teh dan cerita datuk", "Pagi yang baharu", "Burung di dahan cempaka", "Menanam kebaikan"],
  en: ["The first rain after a long drought", "Mother in the kitchen before dawn", "An old lamp in a quiet village", "A friend far away", "The sea that keeps secrets", "Knowledge is light", "Coming home for Eid", "The old tree by the school", "Missing my father", "A crescent moon in Ramadan", "The road home", "A cup of tea and grandfather's stories", "A brand-new morning", "A bird on a jasmine branch", "Planting kindness"],
  id: ["Hujan pertama setelah kemarau", "Ibu di dapur saat subuh", "Pelita di desa lama", "Sahabat di perantauan", "Laut yang menyimpan rahasia", "Ilmu adalah cahaya", "Mudik saat Lebaran", "Pohon tua di depan sekolah", "Rindu kepada ayah", "Bulan sabit di langit Ramadan", "Jalan pulang", "Secangkir teh dan cerita kakek", "Pagi yang baru", "Burung di dahan melati", "Menanam kebaikan"],
  ar: ["المطر الأول بعد الجفاف", "أمي في المطبخ قبل الفجر", "سراج في قرية قديمة", "صديق في الغربة", "البحر الذي يحفظ الأسرار", "العلم نور", "العودة إلى البيت في العيد", "الشجرة العتيقة أمام المدرسة", "الحنين إلى أبي", "هلال رمضان", "طريق العودة", "فنجان شاي وحكايات جدي", "صباح جديد", "طائر على غصن الياسمين", "زرع الخير"]};

var st = null;
function init(){ st = H.load(KEY, null) || {}; var u = H.S.ulang || H.S.lang;
  st.lang = st.lang || (LANGS.some(function(x){ return x[0] === u; }) ? u : "ms"); st.type = st.type || "sajak"; st.mood = st.mood == null ? "" : st.mood; st.len = st.len || "m"; st.style = st.style || "klasik";
  st.topic = st.topic || ""; st.ded = st.ded || {to: "", from: ""}; st.saved = st.saved || []; st.cur = st.cur || null; st.show = st.show || null;
  [st.cur].concat(st.saved).forEach(fix); }
// 0.6.19: pieces saved by 0.6.18 from a cut-off reply hold raw JSON in body; re-read them
function fix(c){ if(!c || !/^\s*\{[\s\S]*"body"\s*:/.test(c.body || "")) return; var p = parse(c.body); if(p.body && p.body !== c.body){ c.body = p.body; if(p.title && !c.title) c.title = p.title; } }
function keep(){ H.save(KEY, st); }
function typ(id){ return TYPES.filter(function(t){ return t[0] === id; })[0] || TYPES[0]; }
function lng(id){ return LANGS.filter(function(t){ return t[0] === id; })[0] || LANGS[0]; }
function lenOf(id){ return LENS.filter(function(t){ return t[0] === id; })[0] || LENS[1]; }

// ---------- AI ----------
var SYS = "You are a master poet and author, fluent and native-level in Malay, English, Indonesian and Arabic, with deep knowledge of Malay and Arabic literary traditions. " +
  "You write original, polished, beautiful literature with perfect grammar, natural rhythm and rich but clear imagery. Content is always wholesome and suitable for a Muslim family app: " +
  "no profanity, no vulgarity, no romance beyond love of family, friends, homeland, nature and Allah; never quote or invent Quran verses or hadith. " +
  "Reply with ONLY a JSON object {\"title\": \"...\", \"body\": \"...\"} and nothing else: no markdown, no code fences, no notes, no explanations. " +
  "In body, put each line of verse on its own line (\\n) and separate stanzas or paragraphs with a blank line (\\n\\n). Do not number stanzas.";
function genMsgs(){ var t = typ(st.type), lg = lng(st.lang), ln = lenOf(st.len), topic = (st.topic || "").trim();
  var u = "Write " + t[5] + ".\nLanguage: write everything, including the title, in " + lg[3] + (st.lang === "ar" ? " (eloquent, with harakat on the verse lines where they help reading)" : st.lang === "id" ? " (standard Indonesian, EYD spelling)" : st.lang === "ms" ? " (standard Malaysian Malay, Dewan Bahasa spelling)" : "") + ".\n" +
    "Topic: " + (topic ? topic : "choose a fresh, meaningful topic yourself (for example nature, faith, family, gratitude, knowledge, homeland, kindness)") + ".\n" +
    (st.mood ? "Mood: " + MOOD_EN[st.mood] + ".\n" : "") +
    "Length: about " + ln[3] + " words" + (st.len === "xl" ? " (a full A4 page, never more than 450 words)" : "") + ". Fixed forms keep their exact form; for longer lengths add stanzas or poems.\n" +
    "Give it a short, beautiful title.";
  return [{role: "system", content: SYS}, {role: "user", content: u}]; }
function clean(s){ return String(s || "").replace(/\r/g, "").replace(/\*\*|__/g, "").replace(/^\s*#+\s*/gm, "").replace(/^[ \t]+|[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim(); }
// 0.6.19: replies can arrive cut off or with stray text around the JSON; pull title and body out field by field
function jstr(raw){ raw = String(raw || "").replace(/\\$/, ""); try{ return JSON.parse('"' + raw + '"'); }catch(e){}
  return raw.replace(/\\n/g, "\n").replace(/\\t/g, " ").replace(/\\"/g, '"').replace(/\\\\/g, "\\"); }
function parse(txt){ var t = String(txt || "").replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim(), m = t.match(/\{[\s\S]*\}/);
  if(m){ try{ var j = JSON.parse(m[0]), b = j.body; if(Array.isArray(b)) b = b.join("\n"); if(b) return {title: clean(j.title).replace(/^["“]|["”]$/g, ""), body: clean(b)}; }catch(e){} }
  if(/"body"\s*:/.test(t)){   // broken or unfinished JSON
    var tm = t.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/), bm = t.match(/"body"\s*:\s*"((?:[^"\\]|\\.)*)\\?("|$)/);
    if(bm) return {title: tm ? clean(jstr(tm[1])) : "", body: clean(jstr(bm[1])), cut: !bm[2]}; }
  var lines = clean(t.replace(/^(here is|berikut|ini adalah|ini ialah)[^\n]*\n/i, "")).split("\n"), title = "";
  if(lines.length > 2 && lines[0].length < 70 && !lines[1].trim()){ title = lines.shift().replace(/^(title|tajuk|judul)\s*:\s*/i, ""); lines.shift(); }
  return {title: title, body: lines.join("\n").trim()}; }
function call(msgs, maxTok, temp, again){ var A = window.HalalAI; if(!A || !A.run) return Promise.reject(new Error(L("AI tidak tersedia.", "AI is not available.")));
  var room = Math.max(8192, maxTok * 3);   // thinking models (Gemini) use part of this before writing
  // 0.6.24: the shared engine: Karya's own AI (Settings › AI), time limit, backup; status in the standard AI card
  return A.run("karya", msgs, {temperature: temp, max_tokens: again ? room * 2 : room, limit: maxTok > 2500 ? 70 : 50, L2: H.L2x, noRetry: true}).then(function(r){ var p = parse(r.text);
    if(job && job.dead) return p;
    if((r.finish === "length" || p.cut) && !again) return call(msgs, maxTok, temp, true);   // cut off: once more with twice the room
    if(!p.body) throw new Error(L("AI tidak memberi hasil. Cuba lagi.", "The AI gave no result. Try again."));
    if(r.finish === "length" || p.cut) H.toast(L("Karya mungkin terpotong. Cuba \"Versi lain\" atau panjang lebih pendek.", "The piece may be cut short. Try \"Another\" or a shorter length."));
    p.prov = r.provider + (r.model && window.AIRun ? " · " + AIRun.shortModel(r.model) : ""); return p; }); }
// 0.6.24: status card, floating button and Cancel come from ai/airun.js (AIRun) like every AI feature
var job = null;
function statHtml(){ return job && window.AIRun ? AIRun.card("karya") : ""; }
function tipHtml(){ return ""; }
function run(kind, arg){
  if(busy) return;
  if(navigator.onLine === false){ errBox(L("Tiada sambungan internet. AI perlukan internet untuk menulis.", "No internet connection. The AI needs the internet to write.")); return; }
  busy = true; var me = job = {kind: kind, t0: Date.now()}; draw();
  var c = st.cur, ln = lenOf(st.len), pr;
  if(kind === "gen") pr = call(genMsgs(), ln[4], 0.9).then(function(p){ if(me.dead) return; st.cur = {id: "k" + Date.now(), t: Date.now(), title: p.title, body: p.body, lang: st.lang, type: st.type, mood: st.mood, len: st.len, topic: st.topic, tr: {}, prov: p.prov}; st.show = st.lang; });
  else if(kind === "tr"){ var from = view(); pr = call([{role: "system", content: SYS}, {role: "user", content: "Translate this " + typ(c.type)[3].toLowerCase() + " from " + lng(st.show).slice(-1)[0] + " into " + lng(arg)[3] + ". Keep the same form: the same line breaks, stanzas and section labels (translated). Re-create rhyme and rhythm naturally so it reads as a beautiful original in " + lng(arg)[3] + ", not a word-for-word copy. Translate the title too.\n\nTITLE: " + from.title + "\n\n" + from.body}], Math.max(lenOf(c.len)[4], 1400), 0.5)
    .then(function(p){ if(me.dead) return; c.tr = c.tr || {}; c.tr[arg] = {title: p.title, body: p.body}; st.show = arg; }); }
  else if(kind === "polish"){ var v = view(); pr = call([{role: "system", content: SYS}, {role: "user", content: "Polish this " + typ(c.type)[3].toLowerCase() + " written in " + lng(st.show)[3] + ": richer imagery, smoother rhythm, exact rhyme where the form needs it, flawless grammar. Keep the language, the form and roughly the same length. Keep or improve the title.\n\nTITLE: " + v.title + "\n\n" + v.body}], lenOf(c.len)[4], 0.6)
    .then(function(p){ if(me.dead) return; if(st.show === c.lang){ c.title = p.title; c.body = p.body; } else c.tr[st.show] = {title: p.title, body: p.body}; }); }
  var end = function(){ job = null; busy = false; };
  pr.then(function(){ if(me.dead) return; var took = Math.max(1, Math.round((Date.now() - me.t0) / 1000)); end(); keep(); draw(); H.toast("✅ " + L("Siap dalam " + took + " saat", "Done in " + took + " s"));
      var r = root && root.querySelector(".kyOut"); if(r) r.scrollIntoView({behavior: "smooth", block: "start"}); })
    .catch(function(e){ if(me.dead) return; end(); draw(); if(e && e.cancel){ H.toast(L("Dibatalkan", "Cancelled")); return; } errBox(String(e && e.message || e)); });
}
function errBox(msg){ var b = root && root.querySelector("#kyErr"); if(!b) return; b.innerHTML = '<div class="kyErr">⚠️ ' + esc(msg) + ' ' + (window.AIRun ? AIRun.btn("karya") : '') + '</div>'; }
function view(){ var c = st.cur; if(!c) return null; if(st.show && st.show !== c.lang && c.tr && c.tr[st.show]) return {title: c.tr[st.show].title, body: c.tr[st.show].body, lang: st.show}; return {title: c.title, body: c.body, lang: c.lang}; }
function plain(v){ return (v.title ? v.title + "\n\n" : "") + v.body; }

// ---------- UI ----------
function chips(list, cur, attr, lab){ return list.map(function(x){ return '<button class="kyChip' + (cur === x[0] ? " on" : "") + '" ' + attr + '="' + x[0] + '">' + (lab ? lab(x) : x[1] + " " + L(x[2], x[3])) + '</button>'; }).join(""); }
function aiPill(){ return window.AIRun ? '<div class="kyAi kyAiW">' + AIRun.btn("karya") + '</div>' : ''; }
function formHtml(){ var t = typ(st.type);
  return '<div class="kyFrame"><i class="kyC tl"></i><i class="kyC tr"></i><i class="kyC bl"></i><i class="kyC br"></i>' +
    '<div class="kyHead"><div class="kyOrn">❦</div><h3>' + L("Studio Karya", "Writing Studio") + '</h3><div class="kySub">' + L("Cipta karya sastera dengan AI: puisi, lagu, cerita dan kata hikmah.", "Create literature with AI: poems, songs, stories and words of wisdom.") + '</div></div>' +
    '<label class="kyLbl">' + L("Topik (pilihan)", "Topic (optional)") + '</label>' +
    '<div class="kyTopic"><textarea id="kyTopic" rows="2" maxlength="300" placeholder="' + L("Contoh: kasih ibu, hujan di kampung… atau biarkan kosong", "e.g. a mother's love, rain in the village… or leave it empty") + '">' + esc(st.topic) + '</textarea><button class="kyDice" id="kyIdea" title="' + L("Ilham", "Inspire me") + '">🔀</button></div>' +
    '<label class="kyLbl">' + L("Bahasa", "Language") + '</label><div class="kyRow">' + chips(LANGS, st.lang, "data-kyl", function(x){ return '<b>' + x[2] + '</b> ' + x[1]; }) + '</div>' +
    '<label class="kyLbl">' + L("Jenis karya", "Form") + ' · <span class="kyNow">' + t[1] + ' ' + esc(L(t[2], t[3])) + '</span></label><div class="kyGrid">' + TYPES.map(function(x){ return '<button class="kyType' + (st.type === x[0] ? " on" : "") + '" data-kyt="' + x[0] + '"><span>' + x[1] + '</span>' + esc(L(x[2], x[3])) + '</button>'; }).join("") + '</div>' +
    '<label class="kyLbl">' + L("Rasa", "Mood") + '</label><div class="kyRow">' + chips(MOODS, st.mood, "data-kym") + '</div>' +
    '<label class="kyLbl">' + L("Panjang", "Length") + '</label><div class="kyRow">' + chips(LENS, st.len, "data-kyn", function(x){ return L(x[1], x[2]) + ' <small>~' + x[3] + '</small>'; }) + '</div>' +
    '<details class="kyDed"' + (st.ded.to || st.ded.from ? " open" : "") + '><summary>💌 ' + L("Dedikasi (pilihan)", "Dedication (optional)") + '</summary><div class="kyDedR"><input id="kyTo" maxlength="40" placeholder="' + L("Untuk", "For") + '" value="' + esc(st.ded.to) + '"><input id="kyFrom" maxlength="40" placeholder="' + L("Daripada", "From") + '" value="' + esc(st.ded.from) + '"></div></details>' +
    '<button class="kyGo" id="kyGo"' + (busy ? " disabled" : "") + '>' + (busy ? '<span class="kyQuill">✒️</span> ' + L("Sedang menulis…", "Writing…") : '✒️ ' + L("Cipta karya", "Create")) + '</button>' +
    '<div class="kyStatBox"' + (job && job.kind !== "gen" ? ' data-off="1"' : '') + '>' + (job && job.kind !== "gen" ? '' : statHtml()) + '</div>' + tipHtml() + '<div id="kyErr"></div><div class="kyOrn kyBot">❦ ❦ ❦</div></div>'; }
function bodyHtml(v, prose){ var rtl = v.lang === "ar";
  return '<div class="kyText' + (prose ? " prose" : "") + '"' + (rtl ? ' dir="rtl"' : '') + '>' + v.body.split(/\n{2,}/).map(function(p){ return '<p>' + p.split("\n").map(function(l){ return /^\[.*\]$/.test(l.trim()) ? '<em class="kySec">' + esc(l.trim().slice(1, -1)) + '</em>' : esc(l); }).join("<br>") + '</p>'; }).join("") + '</div>'; }
function outHtml(){ var c = st.cur; if(!c && !busy) return '';
  if(busy && !c) return '<div class="kyOut kyPaper ky-' + st.style + '"><div class="kyWrite"><span class="kyQuill">✒️</span>' + L("AI sedang menulis karya anda…", "The AI is writing your piece…") + '<i></i><i></i><i></i><i></i></div></div>';
  var v = view(), t = typ(c.type), langs = [c.lang].concat(Object.keys(c.tr || {}).filter(function(k){ return k !== c.lang; })), ded = st.ded;
  return '<div class="kyOut">' +
    (job && job.kind !== "gen" ? '<div class="kyStatBox">' + statHtml() + '</div>' : '') +
    '<div class="kyTabs">' + langs.map(function(k){ return '<button class="kyChip' + (v.lang === k ? " on" : "") + '" data-kyv="' + k + '">' + (k === c.lang ? "✍️ " : "🌐 ") + lng(k)[2] + '</button>'; }).join("") + '<span class="kyMeta">' + t[1] + ' ' + esc(L(t[2], t[3])) + (c.prov ? ' · ✨ ' + esc(c.prov) : '') + '</span></div>' +
    '<div class="kyPaper ky-' + st.style + (busy ? " busy" : "") + '"' + (v.lang === "ar" ? ' dir="rtl"' : '') + '><div class="kyPin">' + (v.title ? '<h2>' + esc(v.title) + '</h2><div class="kyDiv">❦</div>' : '') + bodyHtml(v, t[4]) +
      ((ded.to || ded.from) ? '<div class="kyDedT">' + (ded.to ? L("Untuk ", "For ") + esc(ded.to) : "") + (ded.to && ded.from ? " · " : "") + (ded.from ? L("Daripada ", "From ") + esc(ded.from) : "") + '</div>' : '') + '</div></div>' +
    '<div class="kyTools">' +
      '<button class="kyTool" id="kyCopy">📋 ' + L("Salin", "Copy") + '</button>' +
      '<button class="kyTool" id="kySay">🔊 ' + L("Dengar", "Listen") + '</button>' +
      '<button class="kyTool" id="kyEdit">✏️ ' + L("Sunting", "Edit") + '</button>' +
      '<button class="kyTool" id="kyPol"' + (busy ? " disabled" : "") + '>✨ ' + L("Perindah", "Polish") + '</button>' +
      '<button class="kyTool" id="kyAgain"' + (busy ? " disabled" : "") + '>↻ ' + L("Versi lain", "Another") + '</button>' +
      '<button class="kyTool" id="kySave">⭐ ' + L("Simpan", "Save") + '</button></div>' +
    '<div class="kySect"><b>🌐 ' + L("Terjemah ke", "Translate into") + '</b><div class="kyRow">' + LANGS.filter(function(x){ return x[0] !== v.lang; }).map(function(x){ return '<button class="kyChip" data-kytr="' + x[0] + '"' + (busy ? " disabled" : "") + '>' + x[2] + ' · ' + x[1] + '</button>'; }).join("") + '</div></div>' +
    '<div class="kySect"><b>🎨 ' + L("Gaya halaman", "Page style") + '</b><div class="kyStyles">' + STYLES.map(function(x){ return '<button class="kySty s-' + x[0] + (st.style === x[0] ? " on" : "") + '" data-kys="' + x[0] + '"><span>' + x[1] + '</span>' + esc(L(x[2], x[3])) + '</button>'; }).join("") + '</div>' +
      '<div class="kyRow kyExp"><button class="kyTool gold" id="kyPng">🖼 ' + L("Gambar", "Image") + '</button><button class="kyTool gold" id="kyPdf">📄 PDF A4</button><button class="kyTool gold" id="kyBook">📚 ' + L("Ke Buku", "To Books") + '</button><button class="kyTool" id="kyPrev">👁 ' + L("Pratonton", "Preview") + '</button></div></div>' +
    '</div>'; }
function savedHtml(){ if(!st.saved.length) return '';
  return '<details class="card kySaved"><summary>⭐ ' + L("Karya saya", "My pieces") + ' (' + st.saved.length + ')</summary>' + st.saved.map(function(s, i){ var t = typ(s.type);
    return '<div class="kySv"><button class="kySvO" data-kyo="' + i + '"><b>' + esc(s.title || L("Tanpa tajuk", "Untitled")) + '</b><span>' + t[1] + ' ' + esc(L(t[2], t[3])) + ' · ' + lng(s.lang)[2] + ' · ' + new Date(s.t).toLocaleDateString() + '</span></button><button class="kySvX" data-kyx="' + i + '" aria-label="' + L("Padam", "Delete") + '">🗑</button></div>'; }).join("") + '</details>'; }
function draw(){ if(!root || !document.body.contains(root)){ return; }
  var ta = root.querySelector("#kyTopic"); if(ta) st.topic = ta.value;
  root.innerHTML = aiPill() + formHtml() + outHtml() + savedHtml(); bind(); }
function bindAi(el){ el.querySelectorAll("[data-kyai]").forEach(function(b){ b.onclick = function(){ if(H.openSettings) H.openSettings("ai"); }; }); }
function bind(){ var r = root; bindAi(r);
  var ta = r.querySelector("#kyTopic"); ta.oninput = function(){ st.topic = ta.value; keep(); };
  r.querySelector("#kyIdea").onclick = function(){ var l = IDEA[st.lang] || IDEA.ms; st.topic = l[Math.floor(Math.random() * l.length)]; ta.value = st.topic; keep(); };
  r.querySelectorAll("[data-kyl]").forEach(function(b){ b.onclick = function(){ st.lang = b.getAttribute("data-kyl"); keep(); draw(); }; });
  r.querySelectorAll("[data-kyt]").forEach(function(b){ b.onclick = function(){ st.type = b.getAttribute("data-kyt"); keep(); draw(); }; });
  r.querySelectorAll("[data-kym]").forEach(function(b){ b.onclick = function(){ st.mood = b.getAttribute("data-kym"); keep(); draw(); }; });
  r.querySelectorAll("[data-kyn]").forEach(function(b){ b.onclick = function(){ st.len = b.getAttribute("data-kyn"); keep(); draw(); }; });
  var to = r.querySelector("#kyTo"), fr = r.querySelector("#kyFrom"); to.oninput = fr.oninput = function(){ st.ded = {to: to.value.trim(), from: fr.value.trim()}; keep(); };
  to.onchange = fr.onchange = function(){ draw(); };
  r.querySelector("#kyGo").onclick = function(){ run("gen"); };
  r.querySelectorAll("[data-kyo]").forEach(function(b){ b.onclick = function(){ var s = st.saved[+b.getAttribute("data-kyo")]; st.cur = JSON.parse(JSON.stringify(s)); st.show = s.lang; st.style = s.style || st.style; keep(); draw(); var o = root.querySelector(".kyOut"); if(o) o.scrollIntoView({behavior: "smooth"}); }; });
  r.querySelectorAll("[data-kyx]").forEach(function(b){ b.onclick = function(){ st.saved.splice(+b.getAttribute("data-kyx"), 1); keep(); draw(); }; });
  if(!st.cur) return;
  r.querySelectorAll("[data-kyv]").forEach(function(b){ b.onclick = function(){ st.show = b.getAttribute("data-kyv"); keep(); draw(); }; });
  r.querySelectorAll("[data-kytr]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-kytr"); if(st.cur.tr && st.cur.tr[k]){ st.show = k; keep(); draw(); } else run("tr", k); }; });
  r.querySelectorAll("[data-kys]").forEach(function(b){ b.onclick = function(){ st.style = b.getAttribute("data-kys"); keep(); draw(); }; });
  r.querySelector("#kyCopy").onclick = function(){ copy(plain(view())); };
  r.querySelector("#kySay").onclick = function(){ var v = view(), N = H.N; if(N && N.speak) N.speak(plain(v), v.lang === "id" ? "ms" : v.lang); else try{ speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(plain(v)); u.lang = {ms: "ms-MY", en: "en-GB", id: "id-ID", ar: "ar-SA"}[v.lang]; speechSynthesis.speak(u); }catch(e){} };
  r.querySelector("#kyEdit").onclick = edit;
  r.querySelector("#kyPol").onclick = function(){ run("polish"); };
  r.querySelector("#kyAgain").onclick = function(){ run("gen"); };
  r.querySelector("#kySave").onclick = function(){ var c = JSON.parse(JSON.stringify(st.cur)); c.style = st.style; c.ded = st.ded; st.saved = [c].concat(st.saved.filter(function(s){ return s.id !== c.id; })).slice(0, 60); keep(); H.toast("⭐ " + L("Disimpan dalam Karya saya", "Saved in My pieces")); draw(); };
  r.querySelector("#kyPng").onclick = function(){ exportPng(); };
  r.querySelector("#kyPdf").onclick = function(){ exportPdf(false); };
  r.querySelector("#kyBook").onclick = function(){ exportPdf(true); };
  r.querySelector("#kyPrev").onclick = preview;
}
function copy(t){ var N = H.N; if(N && N.copyText){ N.copyText(t); H.toast("📋 " + L("Disalin", "Copied")); return; }
  if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ H.toast("📋 " + L("Disalin", "Copied")); }, fb); else fb();
  function fb(){ var a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); try{ document.execCommand("copy"); H.toast("📋 " + L("Disalin", "Copied")); }catch(e){} a.remove(); } }
function edit(){ var v = view(), p = root.querySelector(".kyPaper"); if(!p) return;
  p.innerHTML = '<input class="kyEdT" value="' + esc(v.title) + '"' + (v.lang === "ar" ? ' dir="rtl"' : '') + '><textarea class="kyEdB" rows="14"' + (v.lang === "ar" ? ' dir="rtl"' : '') + '>' + esc(v.body) + '</textarea><div class="kyRow"><button class="kyTool gold" id="kyEdOk">✔ ' + L("Simpan suntingan", "Save edits") + '</button><button class="kyTool" id="kyEdNo">✕ ' + L("Batal", "Cancel") + '</button></div>';
  p.querySelector("#kyEdOk").onclick = function(){ var t = p.querySelector(".kyEdT").value.trim(), b = clean(p.querySelector(".kyEdB").value), c = st.cur;
    if(v.lang === c.lang){ c.title = t; c.body = b; } else c.tr[v.lang] = {title: t, body: b}; keep(); draw(); };
  p.querySelector("#kyEdNo").onclick = draw; }

// ---------- page drawing (A4 at 150 dpi: 1240 × 1754) ----------
var FONTS = ['32px FellL', 'italic 32px FellLi', '32px PinyonL', '32px MarcellusT', '600 32px FrauncesW', '32px FigtreeT', '32px AmiriL', '32px ScheherazadeL'];
function fontsReady(){ try{ return Promise.all(FONTS.map(function(f){ return document.fonts.load(f, "Aa ب"); })).catch(function(){}); }catch(e){ return Promise.resolve(); } }
var PAL = {
  klasik: {bg: ["#f7eed6", "#e6d3a6"], ink: "#3d2a14", head: "#5a3510", acc: "#8a5a22", tf: 'italic {s}px FellLi, Georgia, serif', bf: '{s}px FellL, Georgia, serif'},
  qurani: {bg: ["#fbf7ea", "#f1e7cc"], ink: "#1c3a2c", head: "#0f5137", acc: "#b8902f", tf: '{s}px AmiriL, Georgia, serif', bf: '{s}px MarcellusT, Georgia, serif'},
  kursif: {bg: ["#fffdf6", "#f8efdc"], ink: "#3a2f22", head: "#a6781e", acc: "#c9a24a", tf: '{s}px PinyonL, cursive', bf: '{s}px PinyonL, cursive', big: 1.3},
  moden: {bg: ["#ffffff", "#f4f5f7"], ink: "#22262c", head: "#111418", acc: "#2f7d6b", tf: '600 {s}px FrauncesW, Georgia, serif', bf: '{s}px FigtreeT, Arial, sans-serif'},
  malam: {bg: ["#0b1736", "#22335f"], ink: "#eef1fb", head: "#f2cf6b", acc: "#f2cf6b", tf: '{s}px MarcellusT, Georgia, serif', bf: '{s}px MarcellusT, Georgia, serif'},
  songket: {bg: ["#fff8ec", "#f5e6c8"], ink: "#3b1a14", head: "#7a1426", acc: "#c9a24a", tf: '600 {s}px FrauncesW, Georgia, serif', bf: '{s}px FellL, Georgia, serif'}};
if(window.KyF2) Object.keys(KyF2.pal).forEach(function(k){ var q = KyF2.pal[k]; PAL[k].ink = q.ink; PAL[k].head = q.head; PAL[k].acc = q.acc; });
function rnd(seed){ var x = seed % 2147483647; if(x <= 0) x += 2147483646; return function(){ x = x * 16807 % 2147483647; return (x - 1) / 2147483646; }; }
function star(g, x, y, r, n, inner){ g.beginPath(); for(var i = 0; i < n * 2; i++){ var a = Math.PI * i / n - Math.PI / 2, rr = i % 2 ? r * (inner || 0.5) : r; g.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } g.closePath(); }
function frame(g, W, Hh, s, P, cp){ if(window.KyF2){ KyF2.draw(g, W, Hh, s, cp); return; }
  var gr = g.createLinearGradient(0, 0, W, Hh); gr.addColorStop(0, P.bg[0]); gr.addColorStop(1, P.bg[1]); g.fillStyle = gr; g.fillRect(0, 0, W, Hh); }
function wrap(g, text, maxW){ var out = [], words = text.split(/\s+/), line = "";
  words.forEach(function(w){ var t = line ? line + " " + w : w; if(g.measureText(t).width > maxW && line){ out.push(line); line = w; } else line = t; }); out.push(line); return out; }
function layout(g, v, prose, P, s, fs, maxW){ var bf = P.bf.replace("{s}", Math.round(fs * (P.big || 1))); if(v.lang === "ar") bf = Math.round(fs * 1.15) + "px AmiriL, serif";
  g.font = bf; var lines = [], lh = fs * (P.big ? 1.62 : 1.5) * (v.lang === "ar" ? 1.2 : 1);
  v.body.split(/\n{2,}/).forEach(function(par, pi){ if(pi) lines.push({gap: 1});
    par.split("\n").forEach(function(l){ var sec = /^\[.*\]$/.test(l.trim()); (prose ? wrap(g, l, maxW) : wrap(g, l, maxW)).forEach(function(x, xi){ lines.push({t: sec ? l.trim().slice(1, -1) : x, sec: sec, cont: xi > 0}); }); }); });
  var hgt = lines.reduce(function(a, x){ return a + (x.gap ? lh * 0.6 : lh); }, 0); return {lines: lines, lh: lh, font: bf, h: hgt}; }
function render(cv, v, s, meta){ var W = 1240, Hh = 1754, g = cv.getContext("2d"), P = PAL[s] || PAL.klasik, prose = meta.prose, rtl = v.lang === "ar";
  cv.width = W; cv.height = Hh;
  var BX = (window.KyF2 && KyF2.box[s]) || {t: 170, s: 140, b: 170, f: 92}, cp = false;
  // 0.6.33: a long piece switches the frame to compact (smaller ornament, bigger text box) when it would not fit at a readable size
  if(window.KyF2 && KyF2.boxC[s]){ var t0 = layout(g, v, prose, P, s, prose ? 25 : 30, W - BX.s * 2); if(t0.h > Hh - BX.t - BX.b - 230){ cp = true; BX = KyF2.boxC[s]; } }
  frame(g, W, Hh, s, P, cp);
  var top = BX.t, bot = Hh - BX.b, side = BX.s, maxW = W - side * 2;
  g.textBaseline = "alphabetic"; g.fillStyle = P.head; g.textAlign = "center";
  var ts = (s === "kursif" ? 96 : 66) * (cp ? 0.78 : 1); if(rtl){ g.font = Math.round(ts * 0.95) + "px AmiriL, serif"; } else g.font = P.tf.replace("{s}", ts);
  var tl = v.title ? wrap(g, v.title, BX.tw || maxW) : [], y = top + ts;
  if(BX.titleIn && v.title){   // Illumination: the title sits in the gold cartouche
    var cs = ts; for(; cs > 30; cs -= 2){ g.font = rtl ? Math.round(cs * 0.95) + "px AmiriL, serif" : P.tf.replace("{s}", cs); if(g.measureText(v.title).width < W - 520) break; }
    g.fillStyle = "#fbe9a6"; g.textBaseline = "middle"; g.fillText(v.title, W / 2, 238); g.textBaseline = "alphabetic"; tl = []; y = top; }
  tl.forEach(function(l){ g.fillText(l, W / 2, y); y += ts * 1.15; });
  if(v.title && !BX.titleIn){ g.fillStyle = P.acc; g.font = '40px FellL, serif'; g.fillText(s === "qurani" ? "۞" : s === "malam" ? "✦  ☾  ✦" : s === "moden" ? "—" : "❦", W / 2, y + 6); y += 66; }
  var avail = bot - y - (meta.ded ? 70 : 20), fs = s === "kursif" ? 50 : 44, L0;   // grows for short pieces, shrinks to fit a full page
  for(; fs >= 15; fs -= 1){ L0 = layout(g, v, prose, P, s, fs, maxW); if(L0.h <= avail) break; }
  g.font = L0.font; g.fillStyle = P.ink; g.direction = rtl ? "rtl" : "ltr";
  var x = prose ? (rtl ? W - side : side) : W / 2; g.textAlign = prose ? (rtl ? "right" : "left") : "center";
  if(!prose) y += Math.max(0, (avail - L0.h) / 2.2);
  y += L0.lh * 0.8;
  L0.lines.forEach(function(l){ if(l.gap){ y += L0.lh * 0.6; return; }
    if(l.sec){ g.save(); g.fillStyle = P.acc; g.font = "italic " + Math.round(L0.lh / 1.7) + "px FellLi, serif"; g.fillText(l.t, prose ? x : W / 2, y); g.restore(); }
    else g.fillText(l.t, x, y); y += L0.lh; });
  g.direction = "ltr"; g.textAlign = "center"; g.fillStyle = P.acc;
  if(meta.ded){ g.font = 'italic 30px FellLi, serif'; g.fillText(meta.ded, W / 2, bot - 18); }
  g.font = '22px FigtreeT, sans-serif'; g.globalAlpha = 0.75; g.fillText(meta.foot, W / 2, Hh - BX.f); g.globalAlpha = 1;
  return cv; }
function meta(){ var c = st.cur, t = typ(c.type), d = st.ded;
  return {prose: !!t[4], ded: (d.to ? L("Untuk ", "For ") + d.to : "") + (d.to && d.from ? "  ·  " : "") + (d.from ? L("Daripada ", "From ") + d.from : ""), foot: L(t[2], t[3]) + "  ·  " + new Date().toLocaleDateString() + "  ·  My Ihsan"}; }
function canvas(){ var cv = document.createElement("canvas"); return fontsReady().then(function(){ return render(cv, view(), st.style, meta()); }); }
function fname(ext){ var v = view(); return (String(v.title || "karya").replace(/[^\wÀ-ɏ؀-ۿ -]+/g, "").trim().replace(/\s+/g, "-").slice(0, 40) || "karya") + "." + ext; }
function exportPng(){ canvas().then(function(cv){ var url = cv.toDataURL("image/png"), N = H.N, v = view();
  if(N && N.shareBinary) N.shareBinary(fname("png"), url.slice(url.indexOf(",") + 1), "image/png", v.title || "");
  else if(N && N.shareImage) N.shareImage(url, v.title || ""); else { var a = document.createElement("a"); a.href = url; a.download = fname("png"); document.body.appendChild(a); a.click(); a.remove(); } }); }
function exportPdf(toBooks){ canvas().then(function(cv){ var b64 = H.canvasPdf(cv, 210, 297, 0.92), v = view();
  if(toBooks && H.toBooks){ var bin = atob(b64), u8 = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); H.toBooks(u8, fname("pdf")); }
  else H.sharePdf(fname("pdf"), b64, v.title || ""); }); }
function preview(){ canvas().then(function(cv){ var ov = document.createElement("div"); ov.className = "kyPrevOv"; ov.innerHTML = '<button class="kyPrevX" aria-label="✕">✕</button><div class="kyPrevS"></div>';
  var img = new Image(); img.src = cv.toDataURL("image/jpeg", 0.9); img.alt = view().title || ""; ov.querySelector(".kyPrevS").appendChild(img);
  ov.onclick = function(e){ if(e.target === ov || e.target.classList.contains("kyPrevX")) ov.remove(); }; document.body.appendChild(ov); }); }

// AI settings shortcut: shows at the top, hides while scrolling down, comes back when scrolling up
function autohide(){ var sc = document.getElementById("view"); if(!sc || sc._kyAh) return; sc._kyAh = 1; lastY = sc.scrollTop;
  sc.addEventListener("scroll", function(){ var p = document.querySelector(".kyAi"); if(!p){ return; } var y = sc.scrollTop; if(y > lastY + 6 && y > 80) p.classList.add("hid"); else if(y < lastY - 6 || y < 40) p.classList.remove("hid"); lastY = y; }, {passive: true}); }

window.KaryaView = {
  view: function(el, h){ H = h; root = el; root.classList.add("kyRoot"); init(); draw(); autohide(); fontsReady(); },
  _test: {job: function(){ return job; }, parse: parse, TYPES: TYPES, LANGS: LANGS, STYLES: STYLES, LENS: LENS, render: render, genMsgs: function(){ return genMsgs(); }, st: function(){ return st; }, set: function(o){ for(var k in o) st[k] = o[k]; keep(); draw(); }}
};
})();
