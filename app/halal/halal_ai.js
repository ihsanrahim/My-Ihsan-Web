/* Halal checker: OPTIONAL online AI. Off by default. Uses the person's own free API key, stored only on
   this phone. Reads labels in any language straight from the photo and gives a short assessment.
   All providers speak the same OpenAI-style chat API. A guide only, not a fatwa. */
(function(){
"use strict";
var KEY = "ihsan_halal_ai";
// g: group (free = no key, login = sign in, key = own API key). vision:false = text only.
var PROV = {
  pollinations: {g:"free", name:"Pollinations (percuma, tanpa kunci / free, no key)", url:"https://text.pollinations.ai/openai", model:"openai", nokey:true, keyUrl:"",
    ms:"Perkhidmatan komuniti percuma tanpa akaun. Boleh perlahan atau sibuk; jangan hantar maklumat peribadi.", en:"A free community service, no account. Can be slow or busy; do not send personal information."},
  openrouter: {g:"login", name:"OpenRouter (log masuk / sign in · semua model / all models)", url:"https://openrouter.ai/api/v1/chat/completions", model:"google/gemini-2.5-flash", keyUrl:"https://openrouter.ai/keys", login:true,
    ms:"Log masuk dengan akaun OpenRouter anda dan pilih mana-mana model: GPT, Claude, Gemini, Grok, Llama, Qwen, Mistral. Model bertanda PERCUMA tidak perlu bayar.", en:"Sign in with your OpenRouter account and choose any model: GPT, Claude, Gemini, Grok, Llama, Qwen, Mistral. Models marked FREE cost nothing."},
  gemini: {g:"key", name:"Google Gemini", url:"https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", model:"gemini-4-hydrogen", keyUrl:"https://aistudio.google.com/apikey",
    ms:"Tepat membaca label pelbagai bahasa. Kunci percuma (akaun Google).", en:"Accurate on labels in many languages. Free key (Google account)."},
  groq: {g:"key", name:"Groq · Meta Llama 4", url:"https://api.groq.com/openai/v1/chat/completions", model:"meta-llama/llama-4-scout-17b-16e-instruct", keyUrl:"https://console.groq.com/keys",
    ms:"Model terbuka Meta Llama, sangat pantas. Kunci percuma.", en:"Meta's open Llama model, very fast. Free key."},
  openai: {g:"key", name:"OpenAI · ChatGPT (GPT)", url:"https://api.openai.com/v1/chat/completions", model:"gpt-4.1-mini", keyUrl:"https://platform.openai.com/api-keys",
    ms:"Kunci API berbayar (berasingan daripada langganan ChatGPT).", en:"Paid API key (separate from a ChatGPT subscription)."},
  anthropic: {g:"key", name:"Anthropic · Claude", url:"https://api.anthropic.com/v1/chat/completions", model:"claude-haiku-5-5", keyUrl:"https://console.anthropic.com/settings/keys",
    ms:"Kunci API berbayar (berasingan daripada langganan Claude).", en:"Paid API key (separate from a Claude subscription)."},
  xai: {g:"key", name:"xAI · Grok", url:"https://api.x.ai/v1/chat/completions", model:"grok-4", keyUrl:"https://console.x.ai",
    ms:"Kunci API berbayar.", en:"Paid API key."},
  mistral: {g:"key", name:"Mistral · Le Chat", url:"https://api.mistral.ai/v1/chat/completions", model:"mistral-small-latest", keyUrl:"https://console.mistral.ai/api-keys",
    ms:"Ada pelan percuma untuk percubaan.", en:"Has a free plan for trying it out."},
  qwen: {g:"key", name:"Alibaba · Qwen", url:"https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", model:"qwen-vl-max", keyUrl:"https://modelstudio.console.alibabacloud.com/",
    ms:"Kuota percuma untuk akaun baharu.", en:"Free quota for new accounts."},
  deepseek: {g:"key", name:"DeepSeek (teks sahaja / text only)", url:"https://api.deepseek.com/chat/completions", model:"deepseek-chat", keyUrl:"https://platform.deepseek.com/api_keys", vision:false,
    ms:"Murah, tetapi tidak membaca gambar: hanya teks yang dibaca telefon dihantar.", en:"Cheap, but cannot read images: only the text read by the phone is sent."},
  custom: {g:"key", name:"Lain-lain / Other (OpenAI-compatible)", url:"", model:"", keyUrl:"", ms:"Masukkan alamat API dan nama model sendiri.", en:"Enter your own API address and model name."}
};
// AI apps the person may already be signed in to (free or paid). We send the photo + a prompt to them.
var APPS = [["ChatGPT","com.openai.chatgpt","https://chatgpt.com"],["Gemini","com.google.android.apps.bard","https://gemini.google.com"],["Claude","com.anthropic.claude","https://claude.ai"],
  ["Copilot","com.microsoft.copilot","https://copilot.microsoft.com"],["Grok","ai.x.grok","https://grok.com"],["DeepSeek","com.deepseek.chat","https://chat.deepseek.com"],
  ["Perplexity","ai.perplexity.app.android","https://www.perplexity.ai"],["Le Chat","ai.mistral.chat","https://chat.mistral.ai"]];
// 0.5.71 (owner): the default AI is Google Gemini 4 Hydrogen (gemini-4-hydrogen); without a Gemini key the free no-key service is still used (chatCfg)
function cfg(){ var c; try{ c=JSON.parse(localStorage.getItem(KEY)||"{}"); }catch(e){ c={}; } if(!PROV[c.prov]) c.prov="gemini"; c.keys=c.keys||{}; c.models=c.models||{};
  if(!c.m571){ c.m571=1; if(!c.models.gemini || /^gemini-(3\.8|2\.)/.test(c.models.gemini)) c.models.gemini="gemini-4-hydrogen"; if(c.prov==="pollinations" && c.keys.gemini) c.prov="gemini"; try{ localStorage.setItem(KEY, JSON.stringify(c)); }catch(e){} }
  return c; }
function saveCfg(c){ try{ localStorage.setItem(KEY, JSON.stringify(c)); }catch(e){} }
function ready(){ var c=cfg(); return !!c.on; }   // 0.6.24: on/off only; each feature finds its own AI (featCfg), the free one at worst
function urlOf(c){ return c.prov==="custom" ? (c.customUrl||"") : PROV[c.prov].url; }
function modelOf(c){ return cleanModel(c.prov, c.models[c.prov]) || PROV[c.prov].model; }
// 0.2.12: tidy a model name the way each service expects it ("Gemini 2.5 Flash" or "models/gemini-2.5-flash" -> "gemini-2.5-flash")
function cleanModel(prov, m){
  m = String(m||"").trim(); if(!m) return "";
  if(prov==="gemini"){ m = m.replace(/^models\//i, "").replace(/^google\//i, "").toLowerCase().replace(/\s+/g, "-"); }
  else if(prov!=="openrouter" && prov!=="custom" && !/\//.test(PROV[prov] ? PROV[prov].model : "")) m = m.replace(/\s+/g, "-");
  return m;
}
// Models offered in the dropdown before the live list is loaded (the live list comes from the provider's own /models).
var MODELS = {
  gemini:["gemini-4-hydrogen","gemini-3.8-flash","gemini-2.5-flash","gemini-2.5-flash-lite","gemini-2.5-pro"],
  groq:["meta-llama/llama-4-scout-17b-16e-instruct","meta-llama/llama-4-maverick-17b-128e-instruct","llama-3.3-70b-versatile"],
  openai:["gpt-4.1-mini","gpt-4.1","gpt-4o-mini","gpt-4o"],
  anthropic:["claude-haiku-5-5","claude-sonnet-5-5","claude-opus-5-5"],
  xai:["grok-4","grok-3-mini"],
  mistral:["mistral-small-latest","mistral-medium-latest","pixtral-large-latest"],
  qwen:["qwen-vl-max","qwen-vl-plus","qwen-max"],
  deepseek:["deepseek-chat","deepseek-reasoner"],
  openrouter:["google/gemini-2.5-flash","openai/gpt-4.1-mini","anthropic/claude-haiku-5-5","meta-llama/llama-4-scout:free"]
};
var NOT_CHAT = /embed|tts|whisper|transcri|audio|dall-?e|imagen|image-(gen|preview)|moderation|realtime|computer|veo|aqa|guard|learnlm|gemma-3n|search|rerank|ocr/i;
// Live list from the provider (GET <base>/models with the key). Resolves [{id, name}] or [].
function listModels(prov, key){
  var P = PROV[prov]; if(!P || !P.url) return Promise.resolve([]);
  if(prov==="openrouter") return orModels().then(function(l){ return l.map(function(m){ return {id:m.id, name:(m.free?"🆓 ":"")+m.name}; }); });
  var url = P.url.replace(/\/chat\/completions$/, "/models"), h = {};
  if(key){ h.Authorization = "Bearer "+key; if(prov==="anthropic"){ h["x-api-key"] = key; h["anthropic-version"] = "2023-06-01"; } }
  return new Promise(function(res){
    var done = function(st, body){ try{ var j = JSON.parse(body), d = j.data || j.models || [];
      res(d.map(function(m){ var id = cleanModel(prov, m.id || m.name || ""); return {id:id, name:m.display_name || id}; })
        .filter(function(m){ return m.id && !NOT_CHAT.test(m.id); }).sort(function(a, b){ return a.id.localeCompare(b.id); })); }catch(e){ res([]); } };
    var N = window.Native;
    if(N && N.getJson){ var id = "gm"+Date.now(), hh = function(r){ if(r.id!==id) return; window.HalalAI._off("get", hh); done(r.status, r.body); }; window.HalalAI._on("get", hh); N.getJson(id, url, JSON.stringify(h)); }
    else fetch(url, {headers:h}).then(function(r){ return r.text().then(function(t){ done(r.status, t); }); }, function(){ res([]); });
  });
}

function shrink(dataUrl){
  return new Promise(function(res){
    if(!dataUrl){ res(null); return; }
    var im=new Image(); im.onload=function(){ var k=Math.min(1, 1400/Math.max(im.naturalWidth, im.naturalHeight)); var c=document.createElement("canvas"); c.width=Math.round(im.naturalWidth*k); c.height=Math.round(im.naturalHeight*k); c.getContext("2d").drawImage(im,0,0,c.width,c.height); try{ res(c.toDataURL("image/jpeg",0.85)); }catch(e){ res(dataUrl); } };
    im.onerror=function(){ res(null); }; im.src=dataUrl;
  });
}
function prompt(lang){
  var out = lang==="en" ? "English" : "Bahasa Melayu (Malaysian Malay)";
  return "You check food and product ingredient labels for Muslims in Malaysia, following JAKIM halal practice and the Shafi'i school. "+
  "The label may be in ANY language or script: read it yourself from the image. If ingredient text is also given (typed by the user or from a product database), use it as a hint. "+
  "Rules: pork and pig derivatives, lard, blood, carrion, animals haram in the Shafi'i school, wine and any intoxicating drink (khamr), and ingredients made from them = haram. "+
  "Source-dependent or critical ingredients (gelatine, collagen, E471 and other fatty-acid emulsifiers, glycerol, whey, cheese, rennet, enzymes, L-cysteine, carmine/E120, shellac, flavourings, unspecified emulsifiers, meat or animal fat without a halal logo, alcohol used as a carrier) = syubhah, unless the label states a halal source (plant, fish, microbial, halal certified). "+
  "Plant, mineral, synthetic, dairy milk, eggs, honey, seafood = halal. If you cannot read the ingredients, verdict = unclear. Never invent ingredients that are not on the label. "+
  "Note any halal logo you can see and which body it is from (JAKIM or other) without claiming it is valid. "+
  "Reply with ONLY one JSON object, no markdown: {\"language\":\"language of the label\",\"product\":\"product name or empty\",\"verdict\":\"halal|haram|syubhah|unclear\","+
  "\"summary\":\"at most 2 short sentences explaining the verdict\",\"items\":[{\"name\":\"ingredient in "+out+"\",\"original\":\"as written on the label\",\"status\":\"halal|haram|syubhah\",\"reason\":\"at most 12 words\"}],"+
  "\"logo\":\"halal logo seen, or empty\",\"advice\":\"one short practical sentence\"}. "+
  "List haram items first, then syubhah, then halal; group trivial halal items (e.g. 'sugar, salt, water') into one row. Write name, summary, reason and advice in "+out+". "+
  "This is a guide only, not a fatwa: do not call it a fatwa.";
}
function parse(txt){
  var a=txt.indexOf("{"), b=txt.lastIndexOf("}");
  if(a<0||b<a) throw new Error("bad");
  var j=JSON.parse(txt.slice(a,b+1));
  var v=String(j.verdict||"").toLowerCase(); j.verdict = v.indexOf("haram")===0?"X":v.indexOf("syub")===0||v.indexOf("doubt")===0||v.indexOf("mushbooh")===0?"S":v.indexOf("halal")===0?"H":"?";
  j.items=(j.items||[]).map(function(i){ var s=String(i.status||"").toLowerCase(); return {name:i.name||i.original||"", original:i.original||"", reason:i.reason||"", st: s.indexOf("haram")===0?"X":s.indexOf("halal")===0?"H":"S"}; });
  return j;
}
// 0.2.13: models of the same provider to fall back to, in order (free-tier friendly ones first).
var FALLBACK = {
  gemini:["gemini-4-hydrogen","gemini-3.8-flash","gemini-2.5-flash","gemini-2.5-flash-lite"],
  groq:["meta-llama/llama-4-scout-17b-16e-instruct","meta-llama/llama-4-maverick-17b-128e-instruct"],
  openrouter:["google/gemini-2.5-flash","meta-llama/llama-4-scout:free","google/gemma-3-27b-it:free"],
  openai:["gpt-4.1-mini","gpt-4o-mini"], mistral:["mistral-small-latest","pixtral-12b-2409"], xai:["grok-4","grok-3-mini"],
  anthropic:["claude-haiku-5-5"], qwen:["qwen-vl-plus","qwen-vl-max"], deepseek:["deepseek-chat"]
};
function fallbacks(prov, used){ var l = liveIds(prov).concat([PROV[prov] ? PROV[prov].model : ""], FALLBACK[prov]||[]); return l.filter(function(m, i){ return m && m!==used && l.indexOf(m)===i; }); }
// 0.2.13: the models this key really has (from the provider's /models), best first; kept for a day in the settings.
// Built-in names go out of date when a provider retires models, so the live list always wins.
function rankModels(prov, ids){
  var part = function(re, id){ return new RegExp("(^|[-/.:_])("+re+")([-/.:_]|$)", "i").test(id); };
  var score = function(id){ var v = parseFloat((/(\d+(?:\.\d+)?)/.exec(id)||[0,0])[1]) || 0, s = v;
    if(part("flash|mini|small|scout|haiku|chat|turbo|instant", id)) s += 100;   // fast, cheap, biggest free allowance
    if(part("lite|nano", id)) s -= 5;                                          // a step below the plain fast model
    if(part("preview|exp|experimental|latest|thinking|live|native|robotics|computer|deep-research|tts|image|audio", id) || /-\d{4}/.test(id)) s -= 60;
    if(part("pro|opus|large|max|ultra|maverick", id)) s -= 20;
    if(!part("flash|lite|pro|mini|nano|small|medium|large|scout|maverick|haiku|sonnet|opus|chat|turbo|versatile|instant|plus|max|reasoner|vl|it", id)) s -= 30;   // codenames (e.g. "-argon") are usually previews
    return s; };
  return ids.slice().sort(function(a, b){ return score(b) - score(a); });
}
function liveIds(prov){ var c = cfg(), l = c.live && c.live[prov]; return l && l.ids && Date.now() - l.t < 864e5 ? l.ids : []; }
function rememberLive(prov, list){ if(!list || !list.length) return; var c = cfg(); c.live = c.live || {}; c.live[prov] = {t:Date.now(), ids:rankModels(prov, list.map(function(m){ return m.id; })).slice(0, 12)}; saveCfg(c); }
// best model to use for a provider: the person's choice when that provider is theirs, else the best live one, else the default
function bestModel(prov){ var c = cfg(); if(c.prov===prov && c.models[prov]) return modelOf(c); return liveIds(prov)[0] || (PROV[prov] ? PROV[prov].model : ""); }
function retryAfter(body){ var m = /retry(?:Delay| in)["\s:]*"?(\d+(?:\.\d+)?)\s*s/i.exec(String(body||"")); return m ? parseFloat(m[1]) : 0; }
function wait(sec){ return new Promise(function(r){ setTimeout(r, sec*1000); }); }
// One request with automatic recovery:
// - model name the service does not know (400/404): next model; the bad name is cleared from the settings.
// - free limit / busy (429, 503): if the service asks to wait a few seconds, wait and repeat once; otherwise the next
//   model of the same provider (free limits are per model, so another model usually still has some). The person's choice is kept.
function post(c, body){
  var first = body.model, tried = 0, waited = false, list = null, why = "";
  var go = function(){ return post0(c, body).then(function(d){
    d.model = body.model;
    var bad = (d.status===400 || d.status===404) && /model/i.test(String(d.body||"")), busy = d.status===429 || d.status===503 || d.status===529;
    d.tried = triedSet.slice();
    // 0.2.16: a slow answer (timeout) is repeated once; a provider that does not take reasoning_effort is asked again without it
    if(d.status===0 && /timeout|timed out/i.test(String(d.body||"")) && !timedOut){ timedOut = true; return go(); }
    if(d.status===400 && body.reasoning_effort && /reasoning/i.test(String(d.body||""))){ delete body.reasoning_effort; return go(); }
    // 0.2.14: no credit / billing on the whole account: another model cannot help, stop here
    // (Gemini's per-model limit also says "check your plan and billing", so it is NOT matched here: other models may still work)
    if(d.status===402 || (c.prov!=="gemini" && busy && /insufficient_quota|insufficient[_ ]balance|credit balance is too low|purchase credits|payment required/i.test(String(d.body||"")))){ d.account = "nocredit"; return d; }
    if(!bad && !busy) { if(body.model!==first){ d.fixedModel = body.model; d.fixedWhy = why; d.firstModel = first; } return d; }
    if(busy && !waited){ var ra = retryAfter(d.body); if(ra > 0 && ra <= 15){ waited = true; return wait(ra + 0.5).then(go); } }
    if(bad && body.model===first){ var c2 = cfg(); if(c2.prov===c.prov && cleanModel(c.prov, c2.models[c.prov])===first){ c2.models[c.prov] = ""; saveCfg(c2); } }
    if(!why) why = bad ? "name" : "limit";
    var tryNext = function(){ list = list || fallbacks(c.prov, first);
      list = list.filter(function(m){ return m!==body.model && triedSet.indexOf(m)<0; });
      if(tried >= 4 || !list.length) return null;
      tried++; body.model = list.shift(); triedSet.push(body.model); waited = false; return go(); };
    if(!fetched && (bad || !list || !list.length) && !PROV[c.prov].nokey){
      fetched = true;
      return listModels(c.prov, c.keys[c.prov]).then(function(l){ if(l.length){ rememberLive(c.prov, l); list = null; } return tryNext() || d; });
    }
    return tryNext() || d;
  }); };
  var fetched = false, triedSet = [first], timedOut = false;
  return go();
}
function post0(c, body){
  return post1(c, body).then(function(d){ d.prov = c.prov; d.model = body.model; return d; });
}
function post1(c, body){
  var url=urlOf(c), headers={}; if(c.keys[c.prov]) headers["Authorization"]="Bearer "+c.keys[c.prov];
  if(c.prov==="openrouter"){ headers["HTTP-Referer"]="https://my.ihsan.app"; headers["X-Title"]="My Ihsan"; }
  var N=window.Native;
  if(N && N.postJson){
    return new Promise(function(res){ var id="ai"+Date.now(); var h=function(d){ if(d.id!==id) return; window.HalalAI._off("post",h); res(d); }; window.HalalAI._on("post",h); N.postJson(id, url, JSON.stringify(headers), JSON.stringify(body)); });
  }
  headers["Content-Type"]="application/json";
  return fetch(url,{method:"POST",headers:headers,body:JSON.stringify(body)}).then(function(r){ return r.text().then(function(t){ return {status:r.status, body:t}; }); }, function(e){ return {status:0, body:String(e)}; });
}
function errMsg(d, L2){
  var s=d.status, b=String(d.body||"").slice(0,300);
  if(s===0 && /timeout|timed out/i.test(b)) return L2("AI mengambil masa terlalu lama untuk menjawab (dicuba dua kali). Cuba lagi, atau pilih model yang lebih pantas (⭐ \"flash\" atau \"lite\").","The AI took too long to answer (tried twice). Try again, or choose a faster model (⭐ \"flash\" or \"lite\").");
  if(s===0) return L2("Tiada sambungan internet atau pelayan tidak dapat dihubungi.","No internet connection, or the server could not be reached.");
  if(s===401||s===403) return L2("Kunci API ditolak. Semak kunci dalam tetapan AI.","The API key was refused. Check the key in the AI settings.");
  if(s===404) return L2("Model tidak dijumpai. Tukar nama model dalam tetapan AI.","Model not found. Change the model name in the AI settings.");
  var who = d.prov ? (PROV[d.prov]||{}).name || d.prov : "";
  if(d.account==="nocredit"){
    if(d.prov==="openai") return L2("Akaun API OpenAI anda tiada kredit. Langganan ChatGPT Plus TIDAK termasuk penggunaan API (dibayar berasingan). Tambah kredit di platform.openai.com › Billing, atau tekan \"Guna aplikasi ChatGPT / Gemini saya\" untuk guna langganan anda.","Your OpenAI API account has no credit. A ChatGPT Plus subscription does NOT include API use (it is billed separately). Add credit at platform.openai.com › Billing, or tap \"Use my ChatGPT / Gemini app\" to use your subscription.");
    if(d.prov==="anthropic") return L2("Akaun API Anthropic anda tiada kredit. Langganan Claude tidak termasuk API. Tambah kredit di console.anthropic.com, atau guna aplikasi AI anda.","Your Anthropic API account has no credit. A Claude subscription does not include the API. Add credit at console.anthropic.com, or use your AI app.");
    return L2("Akaun API "+who+" anda tiada kredit atau perlu pengebilan. Langganan aplikasi tidak termasuk API. Tambah kredit, guna kunci Groq percuma, atau guna aplikasi AI anda.","Your "+who+" API account has no credit or needs billing. An app subscription does not include the API. Add credit, use a free Groq key, or use your AI app.");
  }
  if(s===429 && d.prov==="gemini") return L2("Had percuma API Gemini untuk model ini sudah habis buat masa ini"+(d.tried?" (dicuba: "+d.tried.join(", ")+")":"")+". Langganan Gemini Advanced / Google One TIDAK menambah had API. Tunggu sebentar, guna kunci Groq percuma, atau tekan \"Guna aplikasi ChatGPT / Gemini saya\".","Gemini's free API allowance for these models is used up for now"+(d.tried?" (tried: "+d.tried.join(", ")+")":"")+". A Gemini Advanced / Google One subscription does NOT add API allowance. Wait a while, use a free Groq key, or tap \"Use my ChatGPT / Gemini app\".");
  if(s===429) return L2("Had percuma telah dicapai"+(d.model?" ("+d.model+" dan model sandaran)":"")+". Cuba sebentar lagi, pilih model lain, atau guna AI percuma.","The free limit was reached"+(d.model?" ("+d.model+" and the backup models)":"")+". Try again later, choose another model, or use the free AI.");
  if(s===503 || s===529) return L2("Pelayan AI sibuk sekarang. Cuba sebentar lagi atau guna AI percuma.","The AI service is busy right now. Try again soon or use the free AI.");
  if(s===400 && /image|vision|multimodal/i.test(b)) return L2("Model ini tidak boleh membaca gambar. Pilih model lain.","This model cannot read images. Choose another model.");
  return L2("Ralat AI ","AI error ")+s+": "+b.slice(0,120);
}
function ask(imgUrl, ocrText, lang, L2, step){
  var hasT=!!(ocrText && ocrText.trim());
  return shrink(imgUrl).then(function(img){
    if(!img && !hasT) return Promise.reject(new Error(L2("Tiada gambar atau teks untuk dihantar.","There is no photo or text to send.")));
    var mk=function(useImg){ var content=[{type:"text", text:(useImg ? "Assess the ingredient label in this photo." : "Assess this ingredient list.")+(hasT ? "\n\nIngredient text"+(useImg?" given with the photo (may differ from it)":"")+":\n"+ocrText.slice(0,3000) : "")}];
      if(useImg) content.push({type:"image_url", image_url:{url:img}}); return [{role:"system", content:prompt(lang)},{role:"user", content:content}]; };
    var fin=function(r, useImg){ var o=parse(r.text); o.model=r.model; o.provider=r.provider+(useImg ? "" : L2(" (teks sahaja)"," (text only)")); o.hops=r.hops; o.ms=r.ms; return o; };
    var go=function(useImg){ return run("halal", mk(useImg), {max_tokens:1800, L2:L2, validate:parse}, step).then(function(r){ return fin(r, useImg); }); };
    return img ? go(true).catch(function(e){ if(e && e.cancel || !hasT) throw e; return go(false); }) : go(false);
  });
}
// compatibility for tests and Karya: the order run() would try
function writeChain(){ return runChain("karya", false); }
function askChain(hasImg, hasText){ var a=runChain("halal", hasImg).map(function(e){ e.text=false; return e; }); if(hasImg && hasText) a=a.concat(runChain("halal", false).map(function(e){ e.text=true; return e; })); return a; }
// Ask AI page (0.12.0): plain chat. Uses the provider set up in the Halal tab when it has what it needs (even if the
// halal AI switch is off); otherwise the free Pollinations service. Never sends anything about the person except the question.
function chatCfg(){ var c=cfg(); if(PROV[c.prov] && (PROV[c.prov].nokey || c.keys[c.prov]) && urlOf(c) && modelOf(c)) return c; return {prov:"pollinations", keys:{}, models:{}}; }
function chat(messages, L2, opt){ opt=opt||{}; return run(opt.feat||"ask", messages, {temperature:opt.temperature!=null?opt.temperature:0.3, max_tokens:opt.max_tokens||1200, L2:L2}); }
function chatChain(messages, L2, opt, step){ opt=opt||{}; return run(opt.feat||"karya", messages, {temperature:opt.temperature, max_tokens:opt.max_tokens, limit:opt.limit, L2:L2, noRetry:true}, step); }
function chatProvider(){ var c=chatCfg(); return [c.prov, PROV[c.prov].name.replace(/ \(.*$/,"")]; }
function sharePrompt(lang, text, hasImg){
  var ms = "Tolong semak sama ada produk ini halal, haram atau syubhah, mengikut amalan halal JAKIM dan mazhab Syafi'i. "+(hasImg?"Baca senarai ramuan dalam gambar (apa-apa bahasa). ":"")+
    "Beri: 1) keputusan ringkas, 2) jadual ramuan dengan status (halal/haram/syubhah) dan sebab ringkas, 3) logo halal jika ada, 4) satu nasihat. Jawab dalam Bahasa Melayu, ringkas. Ini panduan sahaja, bukan fatwa.";
  var en = "Please check whether this product is halal, haram or syubhah (doubtful), following JAKIM halal practice and the Shafi'i school. "+(hasImg?"Read the ingredient list in the photo (any language). ":"")+
    "Give: 1) a short verdict, 2) a table of ingredients with status (halal/haram/syubhah) and a brief reason, 3) any halal logo seen, 4) one tip. Answer in English, concisely. This is a guide only, not a fatwa.";
  var p = lang==="en" ? en : ms;
  if(text && text.trim()) p += "\n\n"+(lang==="en"?"Ingredients":"Ramuan")+(hasImg?(lang==="en"?" (read by phone, may have errors)":" (dibaca telefon, mungkin ada silap)"):"")+":\n"+text.trim().slice(0,2500);
  return p;
}
function b64url(buf){ var s="", u=new Uint8Array(buf); for(var i=0;i<u.length;i++) s+=String.fromCharCode(u[i]); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
// OpenRouter sign-in (OAuth PKCE): the person logs in, OpenRouter gives this phone its own key.
var CB = "https://my.ihsan.app/openrouter-callback";
function login(L2){
  var N=window.Native, arr=new Uint8Array(32); crypto.getRandomValues(arr); var ver=b64url(arr);
  var sub = window.crypto && crypto.subtle ? crypto.subtle.digest("SHA-256", new TextEncoder().encode(ver)).then(function(h){ return [b64url(h),"S256"]; }) : Promise.resolve([ver,"plain"]);
  return sub.then(function(ch){
    var url="https://openrouter.ai/auth?callback_url="+encodeURIComponent(CB)+"&code_challenge="+ch[0]+"&code_challenge_method="+ch[1];
    if(!N || !N.openAuth) { window.open(url); return Promise.reject(new Error(L2("Log masuk hanya dalam aplikasi Android.","Sign-in works in the Android app only."))); }
    return new Promise(function(res, rej){
      var h=function(d){ window.HalalAI._off("authCode",h); if(d.cancel||!d.code){ rej(new Error(L2("Log masuk dibatalkan.","Sign-in was cancelled."))); return; }
        var id="ork"+Date.now(), hp=function(r){ if(r.id!==id) return; window.HalalAI._off("post",hp);
          try{ var j=JSON.parse(r.body); if(j.key){ res(j.key); return; } }catch(e){}
          rej(new Error(L2("OpenRouter tidak memberi kunci (","OpenRouter did not return a key (")+r.status+")")); };
        window.HalalAI._on("post",hp); N.postJson(id, "https://openrouter.ai/api/v1/auth/keys", "{}", JSON.stringify({code:d.code, code_verifier:ver, code_challenge_method:ch[1]})); };
      window.HalalAI._on("authCode",h); N.openAuth(url, CB);
    });
  });
}
// Live list of OpenRouter models that can read images, free ones first.
function orModels(){
  var N=window.Native;
  return new Promise(function(res){
    var done=function(body){ try{ var d=JSON.parse(body).data||[]; res(d.filter(function(m){ var a=m.architecture||{}; return (a.input_modalities||[]).indexOf("image")>=0 || /image/.test(a.modality||""); })
      .map(function(m){ var free=/:free$/.test(m.id) || (m.pricing && +m.pricing.prompt===0 && +m.pricing.completion===0); return {id:m.id, name:m.name||m.id, free:free}; })
      .sort(function(a,b){ return (b.free-a.free) || a.name.localeCompare(b.name); })); }catch(e){ res([]); } };
    if(N && N.fetchUrl){ var id="orm"+Date.now(), h=function(r){ if(r.id!==id) return; window.HalalAI._off("fetch",h); done(r.body); }; window.HalalAI._on("fetch",h); N.fetchUrl(id,"https://openrouter.ai/api/v1/models"); }
    else fetch("https://openrouter.ai/api/v1/models").then(function(r){ return r.text(); }).then(done, function(){ res([]); });
  });
}
// 0.2.9 recipe builder: one free-form request (text + optional images) with the provider set up in the Halal tab.
// Models that cannot read images get the text only. Resolves {text, provider, model, vision}.
// ============ 0.6.24: one AI engine for every feature ============
// Each feature has its own service and model (Settings › AI › Which AI for what); run() tries it, then (backup on) every other
// service with a key, then the free one (not for private items). Each try has a time limit; a reply cut off is asked again with
// more room; progress goes to window.AIRun (ai/airun.js) for the standard status card and floating button.
var FEATS = [   // id, icon, BM, EN, reads photos, private (no free fallback), verb BM, verb EN
  ["halal","🏷️","Label halal","Halal label",1,0,"membaca label","reading the label"],
  ["recipe","🍲","Import resepi","Recipe import",1,0,"membaca resepi","reading the recipe"],
  ["ask","💬","Tanya AI","Ask AI",0,0,"menjawab","answering"],
  ["karya","✒️","Karya","Karya",0,0,"menulis","writing"],
  ["receipt","🧾","Resit & penyata","Receipts & statements",1,1,"membaca resit","reading the receipt"],
  ["khat","✍️","Jurulatih khat","Khat coach",1,0,"menyemak tulisan","checking the writing"],
  ["bookocr","📚","Halaman buku ke teks","Book page to text",1,1,"membaca halaman","reading the page"],
  ["translate","🌐","Terjemah hantaran","Translate posts",0,0,"menterjemah","translating"],
  ["niaga","📑","Niaga: isi dari chat","Business: fill from chat",0,1,"membaca chat","reading the chat"]];   // 0.6.29: WhatsApp order chat → document lines (private: customer data)
var FEAT = {}; FEATS.forEach(function(f){ FEAT[f[0]] = {id:f[0], ic:f[1], ms:f[2], en:f[3], photo:!!f[4], priv:!!f[5], vms:f[6], ven:f[7]}; });
var ORDER = ["openrouter","gemini","groq","mistral","qwen","deepseek","openai","anthropic","xai","custom"];
var VISION_MODEL = {groq:"meta-llama/llama-4-scout-17b-16e-instruct", qwen:"qwen-vl-max", mistral:"mistral-small-latest", pollinations:"openai", openrouter:"google/gemini-2.5-flash"};
var TEXT_MODEL = {groq:"llama-3.3-70b-versatile"};
function usable(c, p){ return !!(PROV[p] && (PROV[p].nokey || c.keys[p]) && (p!=="custom" || c.customUrl)); }
function shortName(p){ return (PROV[p]||{name:p}).name.replace(/ \(.*$/,"").replace(/ ·.*$/,""); }
function modelFor(c, p, photo){ var m = c.models[p] ? cleanModel(p, c.models[p]) : "";
  if(p==="groq"){ if(photo) return m && /llama-4|scout|maverick|vision/i.test(m) ? m : VISION_MODEL.groq; return m && !/llama-4|scout|maverick|vision/i.test(m) ? m : TEXT_MODEL.groq; }
  return m || (photo && VISION_MODEL[p]) || PROV[p].model; }
// the feature's own choice; without one: the service chosen before 0.6.24 (with its model), else the first with a key, else free
function featCfg(id){ var c=cfg(), f=FEAT[id]||{}, x=c.feat && c.feat[id];
  if(x && usable(c, x.prov) && !(f.photo && PROV[x.prov].vision===false)) return {prov:x.prov, model:x.model ? cleanModel(x.prov, x.model) : modelFor(c, x.prov, f.photo), set:true};
  if(usable(c, c.prov) && !(f.photo && PROV[c.prov].vision===false)) return {prov:c.prov, model:modelFor(c, c.prov, f.photo)};
  for(var i=0;i<ORDER.length;i++){ var p=ORDER[i]; if(usable(c, p) && !(f.photo && PROV[p].vision===false)) return {prov:p, model:modelFor(c, p, f.photo)}; }
  return {prov:"pollinations", model:"openai"}; }
function featLabel(id){ var x=featCfg(id); return {prov:x.prov, name:shortName(x.prov), model:x.model}; }
function hasImg(m){ return m.some(function(x){ return Array.isArray(x.content) && x.content.some(function(p){ return p.type==="image_url"; }); }); }
function textOnly(m){ return m.map(function(x){ if(!Array.isArray(x.content)) return x; return {role:x.role, content:x.content.filter(function(p){ return p.type==="text"; }).map(function(p){ return p.text; }).join("\n")}; }); }
function runChain(id, img, only){ var c=cfg(), f=FEAT[id]||{}, out=[], seen={};
  var add=function(p, m){ if(seen[p] || !usable(c, p)) return; if(img && PROV[p].vision===false) return; seen[p]=1; out.push({prov:p, name:shortName(p), model:m}); };
  if(only){ add(only, modelFor(c, only, img)); return out; }
  var first=featCfg(id); add(first.prov, first.model);
  if(c.backup!==false){ ORDER.forEach(function(p){ add(p, modelFor(c, p, img)); }); if(!f.priv) add("pollinations", "openai"); }
  return out; }
function run(id, messages, opt, step){ opt=opt||{}; var f=FEAT[id]||FEAT.ask, img=hasImg(messages), list=runChain(id, img, opt.only), i=0, errs=[], t0=Date.now(), L2=opt.L2||function(a,b){ return b; };
  var job=window.AIRun && window.AIRun.start ? window.AIRun.start(id) : null;
  var fin=function(ok){ if(job) job.end(ok); };
  if(!list.length){ fin(false); return Promise.reject(new Error(L2("Tiada AI yang sesuai. Tambah kunci dalam Tetapan › AI.","No suitable AI. Add a key in Settings › AI."))); }
  var tryOne=function(e, k, again){
    if(job && job.dead) return Promise.reject(Object.assign(new Error(L2("Dibatalkan","Cancelled")), {cancel:true}));
    var cc={prov:e.prov, keys:cfg().keys, models:{}, customUrl:cfg().customUrl}; cc.models[e.prov]=e.model;
    var msgs=messages; if(e.prov==="groq") msgs=msgs.map(function(m){ if(!Array.isArray(m.content)) return m; var n=0; return {role:m.role, content:m.content.filter(function(p){ return p.type!=="image_url" || ++n<=5; })}; });
    var mt=opt.max_tokens||3000; if(e.prov==="gemini" || /gemini/i.test(e.model)) mt=Math.max(mt, 6000); if(again) mt*=2;
    var body={model:e.model, temperature:opt.temperature!=null?opt.temperature:0, max_tokens:mt, messages:msgs};
    if(e.prov==="gemini") body.reasoning_effort="low";
    var info={i:k, n:list.length, prov:e.prov, name:e.name, model:e.model, again:!!again, verb:L2(f.vms, f.ven)};
    if(step) step(info); if(job) job.step(info);
    var lim=(opt.limit || (img ? 45 : 50))*1000*(e.prov==="pollinations"?1.4:1)*(window.HalalAI.__lim||1), timer;
    var t=new Promise(function(res){ timer=setTimeout(function(){ res({status:-1}); }, lim); });
    var c2=job ? new Promise(function(res){ job.onCancel=function(){ res({status:-2}); }; }) : null;
    return Promise.race([post(cc, body), t].concat(c2?[c2]:[])).then(function(d){ clearTimeout(timer);
      if(d.status===-2) throw Object.assign(new Error(L2("Dibatalkan","Cancelled")), {cancel:true});
      if(d.status===-1) return {err:L2(e.name+" tidak menjawab dalam "+Math.round(lim/1000)+" saat.", e.name+" did not answer within "+Math.round(lim/1000)+" s.")};
      if(d.status<200 || d.status>=300) return {err:e.name+": "+errMsg(d, L2), detail:"HTTP "+d.status+" · "+e.name+" · "+(d.tried||[body.model]).join(" → ")+"\n"+String(d.body||"").slice(0,400)};
      var j; try{ j=JSON.parse(d.body); }catch(x){ return {err:e.name+": "+L2("jawapan tidak dapat dibaca","unreadable reply")}; }
      var ch=j && j.choices && j.choices[0], txt=ch && ch.message ? ch.message.content : "";
      if(Array.isArray(txt)) txt=txt.map(function(q){ return q.text||""; }).join(""); txt=String(txt||"").trim();
      var fr=ch && ch.finish_reason || "";
      if(fr==="length" && !again && !opt.noRetry) return tryOne(e, k, true);
      if(!txt) return {err:e.name+": "+L2("jawapan kosong","empty reply")};
      if(opt.validate){ try{ opt.validate(txt); }catch(x){ if(fr==="length" && !again) return tryOne(e, k, true); return {err:e.name+": "+L2("jawapan tidak lengkap","incomplete reply")}; } }
      return {text:txt, provider:e.name, prov:e.prov, model:d.fixedModel||e.model, finish:fr, hops:k, ms:Date.now()-t0, vision:img, fixedModel:d.fixedModel||"", fixedWhy:d.fixedWhy||"", firstModel:d.firstModel||""};
    }); };
  // when all fail, the reason given is the chosen AI's (the backups' reasons go into detail)
  var next=function(){ if(i>=list.length){ var er=new Error(errs.length ? errs[0].err.replace(/^[^:]+: /, "")+(errs.length>1 ? L2(" (AI sandaran juga tidak berjaya)"," (the backup AIs did not work either)") : "") : L2("Tiada AI yang menjawab.","No AI answered.")); if(errs.length) er.detail=errs.map(function(x){ return x.detail||x.err; }).join("\n"); return Promise.reject(er); }
    var k=i++; return tryOne(list[k], k, false).then(function(r){ if(r.err){ errs.push(r); return next(); } return r; }); };
  return next().then(function(r){ fin(true); return r; }, function(e){ fin(false, e); throw e; }); }
// older entry points keep their shape
function complete(messages, maxTok, L2, prov, feat){ return run(feat || "ask", messages, {max_tokens:maxTok||3000, only:prov||"", L2:L2}); }
window.HalalAI = {APPS:APPS, complete:complete, errMsg:errMsg, MODELS:MODELS, FALLBACK:FALLBACK, listModels:listModels, rememberLive:rememberLive, rankModels:rankModels, bestModel:bestModel, liveIds:liveIds, cleanModel:cleanModel, sharePrompt:sharePrompt, login:login, orModels:orModels, PROV:PROV, cfg:cfg, saveCfg:saveCfg, ready:ready, ask:ask, chat:chat, chatChain:chatChain, writeChain:writeChain, askChain:askChain, run:run, runChain:runChain, featCfg:featCfg, featLabel:featLabel, FEATS:FEATS, FEAT:FEAT, ORDER:ORDER, usable:usable, shortName:shortName, modelFor:modelFor, chatProvider:chatProvider, urlOf:urlOf, modelOf:modelOf, _on:null, _off:null};
})();
