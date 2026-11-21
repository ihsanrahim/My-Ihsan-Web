/* My Ihsan 0.6.24 · Settings › ✨ AI: the only place for AI settings.
   🔑 Keys (one row per service) · 🎯 Which AI for what (service + model per feature) · 🔁 Backup. Changes save at once.
   Uses window.HalalAI (halal/halal_ai.js). AISet.render(box, H) with H = {N, S, esc, L2x, toast, load, save, on, off}. */
(function(){
"use strict";
var H = null, box = null, st = {mlist: {}, busy: {}, test: {}, other: {}, more: false};
var MAIN = ["openrouter", "gemini", "groq"], MORE = ["mistral", "qwen", "deepseek", "openai", "anthropic", "xai", "custom"];
var STT = [["auto", "Auto"], ["groq", "Groq"], ["gemini", "Gemini"], ["openai", "OpenAI"], ["free", null], ["off", null]];
function L2(a, b){ return H.L2x(a, b); }
function A(){ return window.HalalAI; }
function esc(s){ return H.esc(s == null ? "" : String(s)); }
function rerender(){ if(box && document.body.contains(box)) render(); }
function render(){ var sc = box.closest(".setpb"), y = sc ? sc.scrollTop : 0; box.innerHTML = html(); bind(box); if(sc) sc.scrollTop = y; if(window.AIRun) AIRun.refresh(); }
function url(u){ if(H.N.openUrl) H.N.openUrl(u); else window.open(u); }
function dot(p){ var c = A().cfg(), t = st.test[p];
  if(A().PROV[p].nokey) return '<span class="aiDotS ok"></span>' + L2("sentiasa ada", "always available");
  if(!c.keys[p]) return '<span class="aiDotS"></span>' + L2("tiada kunci", "no key");
  if(t === true) return '<span class="aiDotS ok"></span>' + L2("berfungsi", "works");
  if(t === false) return '<span class="aiDotS bad"></span>' + L2("kunci ditolak atau tiada sambungan", "key refused or no connection");
  if(st.busy[p]) return '<span class="aiDotS"></span>' + L2("menguji…", "testing…");
  return '<span class="aiDotS ok"></span>' + L2("ada kunci", "key saved"); }
function keyRow(p){ var a = A(), c = a.cfg(), P = a.PROV[p], nm = a.shortName(p);
  if(P.login) return '<div class="aiKey"><b>' + esc(nm) + '</b><button class="btn" data-login="' + p + '">' + (c.keys[p] ? "✅ " + L2("Log masuk · semula", "Signed in · again") : "🔑 " + L2("Log masuk", "Sign in")) + '</button><span></span><div class="st">' + dot(p) + '</div></div>';
  return '<div class="aiKey"><b>' + esc(nm) + '</b><input type="password" autocomplete="off" data-key="' + p + '" value="' + esc(c.keys[p] || "") + '" placeholder="' + L2("Tampal kunci", "Paste key") + '">' +
    (P.keyUrl ? '<a href="#" data-kurl="' + esc(P.keyUrl) + '">' + L2("dapatkan ›", "get ›") + '</a>' : '<span></span>') + '<div class="st">' + dot(p) + '</div></div>' +
    (p === "custom" ? '<div class="aiKey"><b>URL</b><input type="url" id="aiUrl" value="' + esc(c.customUrl || "") + '" placeholder="https://…/v1/chat/completions"><span></span></div>' : ''); }
function services(f){ var a = A(), c = a.cfg(), out = a.ORDER.filter(function(p){ return a.usable(c, p) && !(f.photo && a.PROV[p].vision === false); });
  out.push("pollinations"); return out; }
function models(p, photo){ var a = A(), c = a.cfg(), live = st.mlist[p] || (a.liveIds ? a.liveIds(p).map(function(id){ return {id: id}; }) : []), base = (a.MODELS[p] || []).slice(), cur = a.modelFor(c, p, photo);
  if(p === "groq") base = photo ? ["meta-llama/llama-4-scout-17b-16e-instruct", "meta-llama/llama-4-maverick-17b-128e-instruct"] : ["llama-3.3-70b-versatile", "moonshotai/kimi-k2-instruct", "qwen/qwen3-32b"];
  if(p === "openrouter") base = photo ? ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite", "openai/gpt-4.1-mini", "anthropic/claude-haiku-5-5", "meta-llama/llama-4-scout:free"] :
    ["google/gemini-2.5-flash", "anthropic/claude-sonnet-5-5", "openai/gpt-4.1-mini", "meta-llama/llama-3.3-70b-instruct:free", "qwen/qwen3-235b-a22b:free", "moonshotai/kimi-k2:free", "deepseek/deepseek-chat-v3:free"];
  var ids = base.concat(live.map(function(m){ return m.id; })), seen = {}; ids = ids.filter(function(x){ if(!x || seen[x]) return false; seen[x] = 1; return true; });
  return {ids: ids, cur: cur, starred: base.slice(0, 1)}; }
function tag(id, star){ return (star ? "⭐ " : "") + (window.AIRun ? AIRun.shortModel(id) : id) + (/:free$/.test(id) ? "" : ""); }
function featRow(f){ var a = A(), c = a.cfg(), x = a.featCfg(f.id), sv = services(f), m = x.prov === "pollinations" || x.prov === "custom" ? null : models(x.prov, f.photo), other = st.other[f.id] || (m && m.ids.indexOf(x.model) < 0);
  return '<div class="aiF" id="aiF-' + f.id + '"><div class="aiFh">' + f.ic + ' ' + esc(L2(f.ms, f.en)) + (f.photo ? ' <small>📷</small>' : '') + (f.priv ? ' <small>🔒</small>' : '') + '</div><div class="aiFs">' +
    '<select data-fp="' + f.id + '">' + sv.map(function(p){ return '<option value="' + p + '"' + (p === x.prov ? ' selected' : '') + '>' + esc(p === "pollinations" ? L2("AI percuma", "Free AI") : a.shortName(p)) + '</option>'; }).join("") + '</select>' +
    (m ? '<select data-fm="' + f.id + '">' + m.ids.map(function(id){ return '<option value="' + esc(id) + '"' + (id === x.model && !other ? ' selected' : '') + '>' + esc(tag(id, m.starred.indexOf(id) >= 0)) + '</option>'; }).join("") +
      '<option value="__other"' + (other ? ' selected' : '') + '>✏️ ' + L2("Lain…", "Other…") + '</option></select>' : '<span class="mut tiny" style="align-self:center">' + (x.prov === "pollinations" ? L2("tanpa kunci, boleh perlahan", "no key, can be slow") : "") + '</span>') + '</div>' +
    (other && m ? '<input type="text" data-fmo="' + f.id + '" value="' + esc(x.model) + '" placeholder="' + L2("nama model", "model name") + '" style="margin-top:6px;width:100%">' : '') +
    (f.id === "halal" ? '<label class="hrow"><span>' + L2("Tanya selepas setiap semakan", "Ask after each check") + '</span><input type="checkbox" id="aiAuto"' + (c.auto ? ' checked' : '') + '></label>' : '') + '</div>'; }
function sttRow(){ var s = H.load("ihsan_rcp_set", {}) || {}, v = s.stt || "auto";
  return '<div class="aiF" id="aiF-stt"><div class="aiFh">🎙 ' + L2("Suara video resepi", "Recipe video speech") + '</div><div class="aiFs"><select id="aiStt">' +
    STT.map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === v ? ' selected' : '') + '>' + esc(o[1] || (o[0] === "free" ? L2("Percuma", "Free") : L2("Tutup", "Off"))) + '</option>'; }).join("") + '</select><span class="mut tiny" style="align-self:center">Whisper</span></div></div>'; }
function html(){ var a = A(), c = a.cfg();
  return '<div class="card cmp aisetc aiS" id="aiSetCard"><h3>✨ AI <span class="badge' + (c.on ? '' : ' warn') + '">' + (c.on ? L2("Hidup", "On") : L2("Tutup", "Off")) + '</span></h3>' +
    '<label class="hrow"><span>' + L2("Guna AI dalam talian", "Use online AI") + '</span><input type="checkbox" id="aiOn"' + (c.on ? ' checked' : '') + '></label>' +
    '<h4>🔑 ' + L2("Kunci", "Keys") + '</h4>' + MAIN.map(keyRow).join("") +
    '<details' + (st.more ? ' open' : '') + ' id="aiMoreK"><summary class="mut small">' + L2("Lagi", "More") + ' (Mistral, Qwen, DeepSeek, OpenAI, Claude, Grok, ' + L2("lain", "custom") + ')</summary>' + MORE.map(keyRow).join("") + '</details>' +
    '<div class="aiKey"><b>' + L2("AI percuma", "Free AI") + '</b><span class="mut tiny">' + L2("tanpa kunci", "no key") + '</span><span></span><div class="st">' + dot("pollinations") + '</div></div>' +
    '<button class="btn gold full" id="aiKeys">' + L2("Simpan & uji kunci", "Save & test keys") + '</button>' +
    '<h4>🎯 ' + L2("AI untuk setiap ciri", "Which AI for what") + '</h4>' +
    '<label class="hrow"><span>' + L2("Satu tetapan untuk semua ciri", "One setting for every feature") + '</span><input type="checkbox" id="aiOne"' + (c.one && c.one.on ? ' checked' : '') + '></label>' +
    (c.one && c.one.on ? featRow({id:"__all", ic:"✨", ms:"Semua ciri", en:"Every feature", photo:false}) + '<div class="mut tiny">' + L2("Ciri yang membaca gambar memakai AI lain jika yang ini tidak boleh membaca gambar.", "Features that read photos use another AI if this one cannot read photos.") + '</div>' : a.FEATS.map(function(f){ return featRow(a.FEAT[f[0]]); }).join("")) + sttRow() +
    '<div class="mut tiny">📷 ' + L2("membaca gambar", "reads photos") + ' · 🔒 ' + L2("peribadi: AI percuma tidak dipakai sebagai sandaran", "private: the free AI is never used as backup") + ' · 🆓 ' + L2("model percuma", "free model") + '</div>' +
    '<h4>🔁 ' + L2("Sandaran", "Backup") + '</h4><label class="hrow"><span>' + L2("Jika gagal atau lambat, cuba AI lain", "If it fails or is slow, try another AI") + '</span><input type="checkbox" id="aiBk"' + (c.backup !== false ? ' checked' : '') + '></label>' +
    '<div class="mut tiny" style="margin-top:8px;line-height:1.45">🔒 ' + L2("Kunci disimpan dalam telefon ini sahaja. Gambar dan teks dihantar hanya kepada AI yang dipakai.", "Keys stay on this phone. Photos and text go only to the AI in use.") + '</div></div>'; }
function testKeys(list){ var a = A(), c = a.cfg();
  list.forEach(function(p){ if(!c.keys[p] || a.PROV[p].nokey || p === "custom") return; st.busy[p] = 1; st.test[p] = null;
    a.listModels(p, c.keys[p]).then(function(l){ st.busy[p] = 0; st.test[p] = !!(l && l.length); if(l && l.length){ st.mlist[p] = l; a.rememberLive(p, l); } rerender(); }, function(){ st.busy[p] = 0; st.test[p] = false; rerender(); }); }); }
function bind(el){ var a = A();
  el.querySelectorAll("[data-kurl]").forEach(function(x){ x.onclick = function(e){ e.preventDefault(); url(x.getAttribute("data-kurl")); }; });
  var mk = el.querySelector("#aiMoreK"); if(mk) mk.addEventListener("toggle", function(){ st.more = mk.open; });
  var on = el.querySelector("#aiOn"); on.onchange = function(){ var c = a.cfg(); c.on = on.checked; a.saveCfg(c); rerender(); };
  el.querySelector("#aiKeys").onclick = function(){ var c = a.cfg(), ch = [];
    el.querySelectorAll("[data-key]").forEach(function(i){ var p = i.getAttribute("data-key"), v = i.value.trim(); if((c.keys[p] || "") !== v){ c.keys[p] = v; ch.push(p); } });
    var u = el.querySelector("#aiUrl"); if(u) c.customUrl = u.value.trim();
    if(Object.keys(c.keys).some(function(k){ return c.keys[k]; })) c.on = true;
    a.saveCfg(c); H.toast(L2("Kunci disimpan", "Keys saved")); testKeys(Object.keys(c.keys).filter(function(k){ return c.keys[k]; })); rerender(); };
  el.querySelectorAll("[data-login]").forEach(function(b){ b.onclick = function(){ a.login(L2).then(function(key){ var c = a.cfg(); c.keys.openrouter = key; c.on = true; a.saveCfg(c); H.toast(L2("Log masuk berjaya", "Signed in")); testKeys(["openrouter"]); rerender(); }, function(e){ H.toast(String(e && e.message || e)); }); }; });
  var one = el.querySelector("#aiOne"); if(one) one.onchange = function(){ var c = a.cfg(), d = a.featCfg("ask"); c.one = c.one || {prov:d.prov, model:d.model}; c.one.on = one.checked; a.saveCfg(c); rerender(); };
  var save = function(id, prov, model){ var c = a.cfg(); if(id === "__all"){ c.one = {on:true, prov:prov, model:model || ""}; a.saveCfg(c); H.toast(L2("Disimpan untuk semua ciri", "Saved for every feature")); rerender(); return; } c.feat = c.feat || {}; c.feat[id] = {prov: prov, model: model || ""}; a.saveCfg(c); H.toast(L2("Disimpan", "Saved")); rerender(); };
  el.querySelectorAll("[data-fp]").forEach(function(s){ s.onchange = function(){ var id = s.getAttribute("data-fp"), f = a.FEAT[id] || {photo:false}; st.other[id] = false; save(id, s.value, s.value === "pollinations" ? "openai" : a.modelFor(a.cfg(), s.value, f.photo));
    if(!st.mlist[s.value] && a.cfg().keys[s.value] && s.value !== "custom") testKeys([s.value]); }; });
  el.querySelectorAll("[data-fm]").forEach(function(s){ s.onchange = function(){ var id = s.getAttribute("data-fm"); if(s.value === "__other"){ st.other[id] = true; rerender(); var i = el.querySelector('[data-fmo="' + id + '"]'); if(i) i.focus(); return; }
    st.other[id] = false; save(id, a.featCfg(id).prov, s.value); }; });
  el.querySelectorAll("[data-fmo]").forEach(function(i){ i.onchange = function(){ var id = i.getAttribute("data-fmo"), p = a.featCfg(id).prov; save(id, p, a.cleanModel(p, i.value)); }; });
  var au = el.querySelector("#aiAuto"); if(au) au.onchange = function(){ var c = a.cfg(); c.auto = au.checked; a.saveCfg(c); };
  var bk = el.querySelector("#aiBk"); bk.onchange = function(){ var c = a.cfg(); c.backup = bk.checked; a.saveCfg(c); };
  var stt = el.querySelector("#aiStt"); stt.onchange = function(){ var s = H.load("ihsan_rcp_set", {}) || {}; s.stt = stt.value; H.save("ihsan_rcp_set", s); H.toast(L2("Disimpan", "Saved")); };
}
window.AISet = {render: function(el, h){ H = h; box = el; if(A()){ A()._on = A()._on || h.on; A()._off = A()._off || h.off; }
  // each saved key is checked once per session (green/red dot) and its live model list loaded for the model dropdowns
  var c = A().cfg(); testKeys(Object.keys(c.keys).filter(function(k){ return c.keys[k] && !st.mlist[k] && !st.busy[k] && st.test[k] == null; })); render(); }};
})();
