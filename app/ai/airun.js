/* My Ihsan 0.6.24 · one look for every AI feature.
   AIRun.btn(feat)  small "✨ Service · model ⚙" button; opens Settings › AI at that feature's row
   AIRun.card(feat) status card placeholder; filled while that feature's AI works (stage, seconds, bar, Cancel)
   Floating button (top right) while any AI works; hides when scrolling down. HalalAI.run() reports through AIRun.start(). */
(function(){
"use strict";
var jobs = {}, tick = null, lastY = 0, done = null;
function L(a, b){ return window.L2x ? window.L2x(a, b) : b; }
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function A(){ return window.HalalAI; }
function shortModel(m){ m = String(m || ""); var free = /:free$/.test(m); m = m.replace(/^[a-z-]+\//i, "").replace(/:free$/, "").replace(/-\d{8}$/, "").replace(/-instruct$/, "").replace(/-versatile$/, "");
  m = m.replace(/^gemini-/i, "Gemini ").replace(/^gpt-/i, "GPT-").replace(/^claude-/i, "Claude ").replace(/^llama-/i, "Llama ").replace(/-flash/i, " Flash").replace(/-lite/i, " Lite").replace(/-pro\b/i, " Pro").replace(/-/g, " ");
  return m + (free ? " 🆓" : ""); }
function label(feat){ var a = A(); if(!a || !a.featLabel) return "AI"; var x = a.featLabel(feat); return x.name + (x.prov === "pollinations" ? "" : " · " + shortModel(x.model)); }
function btn(feat){ return '<button type="button" class="aiBtn" data-aiset="' + feat + '" aria-label="' + esc(L("Tetapan AI", "AI settings")) + '">✨ <span class="aiBtnT">' + esc(label(feat)) + '</span> <i>⚙</i></button>'; }
// 0.7.28 (owner): the same "✨ AI · provider · model ⚙" panel on every AI feature; it opens Settings › Online AI
function panel(feat){ return '<div class="card aiPanel"><b>✨ AI</b>' + btn(feat) + '</div>'; }
function card(feat){ return '<div class="aiRun" data-airun="' + feat + '">' + cardHtml(feat) + '</div>'; }
function secs(j){ return Math.floor((Date.now() - j.t0) / 1000); }
function cardHtml(feat){ var j = jobs[feat]; if(!j) return "";
  var s = secs(j), e = j.info || {}, a = j.ta ? (Date.now() - j.ta) / 1000 : 0, who = esc(e.name || label(feat)) + (e.model && e.prov !== "pollinations" ? " · " + esc(shortModel(e.model)) : ""), verb = esc(e.verb || L("bekerja", "working")), msg, cls = "";
  if(e.again) msg = "✂️ " + L("Jawapan terpotong. Meminta semula dengan ruang lebih…", "The reply was cut off. Asking again with more room…");
  else if(e.i > 0 && a < 6) msg = "🔁 " + L("Beralih ke ", "Switching to ") + who + " (" + (e.i + 1) + "/" + e.n + ")…";
  else if(a < 2) msg = "📡 " + L("Menghantar kepada ", "Sending to ") + who + "…";
  else if(a < 25) msg = "✍️ " + who + L(" sedang " + verb + "…", " is " + verb + "…");
  else if(a < 75){ msg = "⏳ " + who + L(" lambat. Akan beralih jika tiada jawapan.", " is slow. Will switch if there is no answer."); cls = " slow"; }
  else { msg = "⚠️ " + L("Tiada jawapan lagi. Semak internet atau tetapan AI.", "No answer yet. Check the internet or the AI settings."); cls = " stuck"; }
  var pct = Math.min(95, 8 + s * 1.5);
  return '<div class="aiSt' + cls + '" role="status" aria-live="polite"><div class="aiStT"><span class="aiDot"></span><span class="aiMsg">' + msg + '</span><b class="aiSec">' + s + 's</b></div>' +
    '<div class="aiBar"><i style="width:' + pct + '%"></i></div><div class="aiStB"><button type="button" class="aiTool" data-aicancel="' + feat + '">✕ ' + L("Batal", "Cancel") + '</button><button type="button" class="aiTool" data-aiset="' + feat + '">⚙ ' + L("Tetapan AI", "AI settings") + '</button></div></div>'; }
function floatEl(){ var f = document.getElementById("aiFloat"); if(!f){ f = document.createElement("button"); f.type = "button"; f.id = "aiFloat"; f.className = "aiFloat"; document.body.appendChild(f); } return f; }
function paint(){ var any = Object.keys(jobs);
  document.querySelectorAll("[data-airun]").forEach(function(el){ el.innerHTML = cardHtml(el.getAttribute("data-airun")); });
  var f = floatEl();
  if(any.length){ var j = jobs[any[any.length - 1]], e = j.info || {}; f.setAttribute("data-aiset", j.feat); f.className = "aiFloat on work";
    f.innerHTML = '<span class="aiDot"></span>✨ ' + esc(e.name || label(j.feat)) + (e.model && e.prov !== "pollinations" ? " · " + esc(shortModel(e.model)) : "") + ' · ' + secs(j) + 's <i>⚙</i>'; }
  else if(done && Date.now() - done.t < 2500){ f.setAttribute("data-aiset", done.feat); f.className = "aiFloat on" + (done.ok ? "" : " err"); f.innerHTML = (done.ok ? "✅ " : "⚠️ ") + esc(done.name) + (done.ok ? " · " + done.s + "s" : "") + ' <i>⚙</i>'; }
  else { f.className = "aiFloat"; if(tick && !any.length){ clearInterval(tick); tick = null; } } }
function start(feat){ var j = {feat: feat, t0: Date.now(), info: null, dead: false};
  j.step = function(e){ j.info = e; j.ta = Date.now(); paint(); };
  j.end = function(ok){ if(jobs[feat] === j) delete jobs[feat]; done = {feat: feat, ok: ok, t: Date.now(), s: secs(j), name: (j.info && j.info.name) || label(feat)}; paint(); setTimeout(paint, 2600); };
  jobs[feat] = j; if(!tick) tick = setInterval(paint, 1000); paint(); return j; }
function cancel(feat){ var j = jobs[feat]; if(!j) return; j.dead = true; if(j.onCancel) j.onCancel(); delete jobs[feat]; paint(); }
function open(feat){ if(window.openSettings) window.openSettings("ai");
  setTimeout(function(){ var r = document.getElementById("aiF-" + feat); if(r){ r.scrollIntoView({behavior: "smooth", block: "center"}); r.classList.add("flash"); setTimeout(function(){ r.classList.remove("flash"); }, 1600); } }, 450); }
document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-aiset],[data-aicancel]"); if(!t) return;
  ev.preventDefault(); ev.stopPropagation();
  if(t.hasAttribute("data-aicancel")) cancel(t.getAttribute("data-aicancel")); else open(t.getAttribute("data-aiset")); }, true);
// the floating button hides while scrolling down and comes back on scrolling up
document.addEventListener("scroll", function(ev){ var sc = ev.target; if(!sc || sc.id !== "view") return; var y = sc.scrollTop, f = document.getElementById("aiFloat"); if(f){ if(y > lastY + 6 && y > 80) f.classList.add("hid"); else if(y < lastY - 6) f.classList.remove("hid"); } lastY = y; }, true);
// refresh every visible ✨ button after the settings change
function refresh(){ document.querySelectorAll(".aiBtn .aiBtnT").forEach(function(t){ var b = t.closest("[data-aiset]"); if(b) t.textContent = label(b.getAttribute("data-aiset")); }); }
window.AIRun = {btn: btn, panel: panel, card: card, start: start, cancel: cancel, open: open, label: label, shortModel: shortModel, refresh: refresh, jobs: function(){ return jobs; }};
})();
