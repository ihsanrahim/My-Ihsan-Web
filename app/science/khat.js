/* My Ihsan 0.5.81 (owner): Explore › Khat coach. Pick a letter or word in khat nasakh, write it on the screen with a finger (over a faint
   guide) or on paper and take a photo, and the online AI (Gemini by default, the person's own key; Settings › Online AI) checks it:
   a score, what is right and what to fix (proportion, curves, dots, baseline, joins), and one thing to practise next.
   Photos are sent only to the chosen AI and never stored; only the scores are kept on this phone.
   KhatCoach.render(box, H)  H = {esc, load, save, en, toast} */
(function(){ "use strict";
var H = null, root = null, st = null, KEY = "ihsan_khat";
var LET = [["ا","alif"],["ب","ba"],["ت","ta"],["ث","tsa"],["ج","jim"],["چ","ca"],["ح","ha"],["خ","kha"],["د","dal"],["ذ","zal"],["ر","ra"],["ز","zai"],
  ["س","sin"],["ش","syin"],["ص","sad"],["ض","dad"],["ط","ta (ط)"],["ظ","za (ظ)"],["ع","ain"],["غ","ghain"],["ڠ","nga"],["ف","fa"],["ڤ","pa"],["ق","qaf"],
  ["ك","kaf"],["ݢ","ga"],["ل","lam"],["م","mim"],["ن","nun"],["و","wau"],["ۏ","va"],["ه","ha (ه)"],["ء","hamzah"],["ي","ya"],["ى","ya (ى)"],["ڽ","nya"]];
var WORDS = [["بسم","bismi"],["الله","Allah"],["محمد","Muhammad"],["سلام","salam"],["ايمان","iman"],["علم","ilmu"],["جاوي","Jawi"],["خط","khat"],["الحمد لله","alhamdulillah"]];
var TIPS = {"ا":"Alif: tegak lurus, setinggi kira-kira 5 titik, sedikit condong ke kiri di hujung atas.|Alif: upright, about 5 dots tall, a slight lean at the top.",
  "ب":"Ba: badan mendatar sepanjang kira-kira 5 titik, hujung kanan sedikit naik, satu titik di bawah tengah.|Ba: a flat body about 5 dots long, the right end turned up, one dot under the middle.",
  "ن":"Nun: mangkuk separuh bulatan di bawah garisan, satu titik di atas tengah mangkuk.|Nun: a half-round bowl below the line, one dot above its middle.",
  "ع":"Ain: kepala kecil terbuka di atas garisan, ekor melengkung lebar di bawah garisan.|Ain: a small open head above the line, a wide curved tail below it.",
  "م":"Mim: kepala bulat kecil di atas garisan, ekor tegak turun ke bawah.|Mim: a small round head on the line, the tail dropping straight down.",
  "ه":"Ha: bulat tertutup, seimbang kiri dan kanan.|Ha: a closed loop, balanced left and right."};
function L(a, b){ return H.en() ? b : a; }
function E(s){ return H.esc(s == null ? "" : String(s)); }
function db(){ var d = H.load(KEY, null) || {}; d.h = d.h || []; return d; }
function saveDb(d){ H.save(KEY, d); }
function cur(){ return st.word ? WORDS[st.i] : LET[st.i]; }
function tipOf(g){ var t = TIPS[g]; return t ? t.split("|")[H.en() ? 1 : 0] : L("Ikut bentuk contoh: perhatikan saiz, lengkung dan kedudukan titik.", "Follow the model: watch the size, the curves and where the dots sit."); }
function draw(){ var c = cur(), d = db(), best = d.h.filter(function(x){ return x.g === c[0]; }).reduce(function(a, x){ return Math.max(a, x.s || 0); }, 0);
  root.innerHTML = '<div class="card khC">' +
    '<div class="khTabs"><button class="chip g3d' + (st.word ? '' : ' on') + '" data-kt="0">' + L("Huruf", "Letters") + '</button><button class="chip g3d' + (st.word ? ' on' : '') + '" data-kt="1">' + L("Perkataan", "Words") + '</button></div>' +
    '<div class="khPick">' + (st.word ? WORDS : LET).map(function(x, i){ return '<button class="khP' + (i === st.i ? ' on' : '') + '" data-ki="' + i + '" dir="rtl">' + E(x[0]) + '</button>'; }).join("") + '</div></div>' +
    '<div class="card khC"><div class="khModel"><div class="khGlyph" dir="rtl">' + E(c[0]) + '</div><div><b>' + E(c[1]) + '</b><small>' + E(tipOf(c[0])) + '</small>' + (best ? '<small>⭐ ' + L("Terbaik", "Best") + ': ' + best + '/100</small>' : '') + '</div></div>' +
    '<div class="khMode"><button class="chip g3d' + (st.mode === "pad" ? ' on' : '') + '" data-km="pad">✍️ ' + L("Tulis di skrin", "Write on screen") + '</button><button class="chip g3d' + (st.mode === "cam" ? ' on' : '') + '" data-km="cam">📷 ' + L("Foto kertas", "Photo of paper") + '</button></div>' +
    (st.mode === "pad" ? '<div class="khPad"><canvas id="khCv"></canvas><div class="khGhost" dir="rtl">' + E(c[0]) + '</div></div><div class="btns"><button class="btn alt g3d" id="khClr">🧽 ' + L("Padam", "Clear") + '</button><button class="btn alt g3d" id="khGh">👻 ' + (st.ghost ? L("Sorok panduan", "Hide guide") : L("Tunjuk panduan", "Show guide")) + '</button></div>'
      : '<button class="khShot" id="khF">' + (st.img ? '<img src="' + st.img + '" alt="">' : '<span>📷<br>' + L("Ketik untuk ambil gambar tulisan anda pada kertas", "Tap to take a photo of your writing on paper") + '</span>') + '</button>' +
      '<div class="khMode"><button class="chip g3d" id="khGal">🖼️ ' + L("Pilih dari galeri", "Pick from the gallery") + '</button></div>') +
    '<button class="btn gold full g3d" id="khGo" style="margin-top:10px">🔍 ' + L("Semak tulisan saya", "Check my writing") + '</button>' +
    '<div class="mut tiny" style="margin-top:6px">' + L("Gambar dihantar hanya kepada AI yang dipilih dalam Tetapan › AI dalam talian, dan tidak disimpan. Panduan latihan sahaja; guru khat tetap rujukan utama.", "The picture goes only to the AI chosen in Settings › Online AI and is not stored. A practice guide only; your khat teacher is still the main reference.") + '</div></div>' +
    '<div class="aiBtnRow">'+(window.AIRun?AIRun.btn("khat"):"")+'</div><div id="khRes">' + (st.res ? resHtml(st.res) : '') + '</div>' +
    (d.h.length ? '<div class="card khC"><h3>📈 ' + L("Latihan terakhir", "Recent practice") + '</h3><div class="khHist">' + d.h.slice(-12).reverse().map(function(x){ return '<span dir="rtl"><b>' + E(x.g) + '</b> ' + x.s + '</span>'; }).join("") + '</div></div>' : '');
  bind(); }
function ring(s){ var r = 26, c = 2*Math.PI*r, k = Math.max(0, Math.min(100, s))/100, col = s >= 80 ? "#2e9d6b" : s >= 55 ? "#e0a21e" : "#c8413b";
  return '<svg viewBox="0 0 64 64" class="khRing"><circle cx="32" cy="32" r="' + r + '" fill="none" stroke="rgba(127,127,127,.25)" stroke-width="7"/><circle cx="32" cy="32" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (k*c).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 32 32)"/><text x="32" y="38" text-anchor="middle" font-size="17" font-weight="700" fill="currentColor">' + Math.round(s) + '</text></svg>'; }
function resHtml(r){
  return '<div class="card khC khR"><div class="khRT">' + ring(r.score) + '<div><b>' + E(r.headline || "") + '</b><small>' + E(r.seen ? L("AI nampak: ", "The AI saw: ") + r.seen : "") + '</small></div></div>' +
    '<ul class="khA">' + (r.aspects || []).map(function(a){ return '<li class="' + (a.ok ? 'ok' : 'no') + '"><i>' + (a.ok ? '✓' : '✗') + '</i><div><b>' + E(a.name) + '</b><small>' + E(a.note || "") + '</small></div></li>'; }).join("") + '</ul>' +
    (r.next ? '<div class="khNext">🎯 <b>' + L("Latih seterusnya", "Practise next") + ':</b> ' + E(r.next) + '</div>' : '') + (r.praise ? '<div class="khPr">🌟 ' + E(r.praise) + '</div>' : '') +
    '<div class="mut tiny">' + E(r.by || "") + '</div></div>'; }
// ---------- writing pad ----------
function pad(){ var cv = root.querySelector("#khCv"); if(!cv) return; var box = cv.parentNode, w = box.clientWidth, h = Math.round(w*0.8), dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = w*dpr; cv.height = h*dpr; cv.style.height = h + "px"; box.style.height = h + "px"; var g = cv.getContext("2d"); g.scale(dpr, dpr);
  g.fillStyle = "#fffdf6"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(160,120,60,.35)"; g.lineWidth = 1; g.beginPath(); g.moveTo(10, h*0.62); g.lineTo(w-10, h*0.62); g.stroke(); // baseline
  if(st.strokes) st.strokes.forEach(function(s){ line(g, s); });
  var gh = root.querySelector(".khGhost"); gh.style.display = st.ghost ? "" : "none"; gh.style.fontSize = Math.round(h*(st.word ? 0.32 : 0.55)) + "px";
  var cur0 = null, pos = function(e){ var r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; return [t.clientX - r.left, t.clientY - r.top]; };
  var down = function(e){ e.preventDefault(); cur0 = [pos(e)]; st.strokes = st.strokes || []; st.strokes.push(cur0); }, move = function(e){ if(!cur0) return; e.preventDefault(); cur0.push(pos(e)); line(g, cur0.slice(-2)); }, up = function(){ cur0 = null; };
  cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move); cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up); cv.addEventListener("pointerleave", up); cv.style.touchAction = "none"; }
function line(g, s){ if(s.length < 2) return; g.strokeStyle = "#1b1b1b"; g.lineWidth = 7; g.lineCap = g.lineJoin = "round"; g.beginPath(); g.moveTo(s[0][0], s[0][1]); for(var i = 1; i < s.length; i++) g.lineTo(s[i][0], s[i][1]); g.stroke(); }
function padImage(){ var cv = root.querySelector("#khCv"); if(!cv || !st.strokes || !st.strokes.length) return null; return cv.toDataURL("image/jpeg", 0.9); }
function pickImg(mode, cb){ // 0.5.82: the phone app's own picker (a web file input does nothing inside the Android app)
  var N = H.N, Nat = window.Native && N && N.pickImage;
  if(Nat){ var go = function(){ var h = function(r){ H.off("image", h); if(!r || r.cancel) return; if(r.error || !r.data){ H.toast(L("Gambar tidak dapat dibuka", "The image could not be opened")); return; } cb(r.data); }; H.on("image", h); N.pickImage(mode); };
    if(mode === "camera" && N.hasPerm && !N.hasPerm("camera")){ var hp = function(p){ if(!p || p.which !== "camera") return; H.off("perm", hp); if(p.granted) go(); else H.toast(L("Kebenaran kamera diperlukan", "Camera permission is needed")); }; H.on("perm", hp); N.requestPerm("camera"); } else go(); return; }
  var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; if(mode === "camera") inp.setAttribute("capture", "environment");
  inp.onchange = function(){ var f = inp.files && inp.files[0]; if(!f) return; var rd = new FileReader(); rd.onload = function(){ cb(rd.result); }; rd.readAsDataURL(f); }; inp.click(); }
function shrink(url){ return new Promise(function(res){ var im = new Image(); im.onload = function(){ var k = Math.min(1, 1280/Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(im.naturalWidth*k); c.height = Math.round(im.naturalHeight*k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.85)); }; im.onerror = function(){ res(url); }; im.src = url; }); }
// ---------- AI ----------
function prompt(c){ var lang = H.en() ? "English" : "Bahasa Melayu (simple, for a child)";
  return "You are a kind, expert teacher of Arabic calligraphy (khat nasakh) for Malaysian children learning Jawi. The child tried to write: \"" + c[0] + "\" (" + c[1] + "). " +
    "Look at the handwriting in the image and judge it against correct khat nasakh proportions (measured in rhombic dots), curves, baseline position, dot count and placement, and joins between letters. " +
    "Be encouraging but honest. If the image does not show this letter or word, say so with a low score. Reply ONLY with JSON: {\"score\": 0-100, \"seen\": \"what letter or word you see\", " +
    "\"headline\": \"one short sentence\", \"aspects\": [{\"name\": \"Proportion|Curve|Baseline|Dots|Joins|Neatness\", \"ok\": true|false, \"note\": \"one short sentence\"}] (4 to 6 items), " +
    "\"next\": \"one concrete thing to practise next\", \"praise\": \"one short encouraging line\"}. Write every text value in " + lang + "."; }
function parseJson(t){ var m = String(t || "").replace(/```json|```/g, "").match(/\{[\s\S]*\}/); if(!m) return null; try{ return JSON.parse(m[0]); }catch(e){ return null; } }
function needAI(cb){ if(window.HalalAI){ cb(); return; } var s = document.createElement("script"); s.src = "halal/halal_ai.js"; s.onload = cb; s.onerror = function(){ H.toast(L("AI tidak dapat dimuatkan", "Could not load the AI")); }; document.head.appendChild(s); }
function check(){ var c = cur(), raw = st.mode === "pad" ? padImage() : st.img;
  if(!raw){ H.toast(st.mode === "pad" ? L("Tulis dahulu di kotak", "Write in the box first") : L("Ambil gambar dahulu", "Take a photo first")); return; }
  var box = root.querySelector("#khRes"); box.innerHTML = '<div class="card khC khWait"><span class="khSpin"></span>' + L("Guru AI sedang menyemak…", "The AI teacher is checking…") + '</div>' + (window.AIRun ? AIRun.card("khat") : ''); box.scrollIntoView({block:"nearest", behavior:"smooth"});
  needAI(function(){ shrink(raw).then(function(img){ var L2 = function(a, b){ return L(a, b); };
    return window.HalalAI.complete([{role:"user", content:[{type:"text", text:prompt(c)}, {type:"image_url", image_url:{url:img}}]}], 1200, L2, "", "khat"); }).then(function(r){
    var j = parseJson(r.text); if(!j || j.score == null) throw new Error(L("Jawapan AI tidak lengkap. Cuba lagi.", "The AI reply was incomplete. Try again."));
    j.score = Math.max(0, Math.min(100, +j.score || 0)); j.by = r.provider + " · " + r.model; st.res = j;
    var d = db(); d.h.push({g:c[0], s:Math.round(j.score), t:Date.now()}); d.h = d.h.slice(-100); saveDb(d); draw();
    var rb = root.querySelector("#khRes"); if(rb) rb.scrollIntoView({block:"start", behavior:"smooth"}); }).catch(function(e){
    box.innerHTML = '<div class="card khC">⚠️ ' + E(e && e.message || e) + (window.AIRun ? '<div class="aiBtnRow" style="margin-top:8px;justify-content:flex-start">' + AIRun.btn("khat") + '</div>' : '') + '</div>'; }); }); }
function bind(){ var q = function(s){ return root.querySelector(s); };
  root.querySelectorAll("[data-kt]").forEach(function(b){ b.onclick = function(){ st.word = b.getAttribute("data-kt") === "1"; st.i = 0; st.strokes = null; st.res = null; draw(); }; });
  root.querySelectorAll("[data-ki]").forEach(function(b){ b.onclick = function(){ st.i = +b.getAttribute("data-ki"); st.strokes = null; st.res = null; st.img = null; draw(); }; });
  root.querySelectorAll("[data-km]").forEach(function(b){ b.onclick = function(){ st.mode = b.getAttribute("data-km"); st.res = null; draw(); }; });
  if(q("#khClr")) q("#khClr").onclick = function(){ st.strokes = null; st.res = null; draw(); };
  if(q("#khGh")) q("#khGh").onclick = function(){ st.ghost = !st.ghost; draw(); };
  var got = function(d){ st.img = d; st.res = null; draw(); };
  if(q("#khF")) q("#khF").onclick = function(){ pickImg("camera", got); }; if(q("#khGal")) q("#khGal").onclick = function(){ pickImg("gallery", got); };
  q("#khGo").onclick = check; pad(); }
window.KhatCoach = {render:function(box, h){ H = h; root = box; st = st || {word:false, i:0, mode:"pad", ghost:true}; draw(); },
  stop:function(){ root = null; }, _st:function(){ return st; }};
})();
