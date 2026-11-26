/* My Ihsan 0.7.73 (owner): phone pets live on their own, apart from the real-pet manager. Up to 3 (cat, bird, fish, any mix).
   Each has its own home (Astra VPet 2, pets/vpet/vpet.js), they can 🤝 meet (pets/vpet/meet.js), and play in the 🌍 Kids Planet as the walker.
   Storage: ihsan_vpet = {list:[state…], cur:id}. PhonePets.open(H, {host?, compact?, start?}) · PhonePets.list(H) · PhonePets.data(H) */
(function(){ "use strict";
var MAX = 3, KEY = "ihsan_vpet", SP = {cat: "🐈", bird: "🐦", fish: "🐠"}, NAMES = {cat: ["Oyen", "Comel", "Tompok"], bird: ["Kiki", "Ceria", "Nuri"], fish: ["Bubbles", "Gelembung", "Nemo"]};
function uid(){ return "vp" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function data(H){ var d = H.load(KEY, null) || {};
  if(!Array.isArray(d.list)){ var list = []; Object.keys(d).forEach(function(k){ var v = d[k]; if(v && typeof v === "object" && v.sp && list.length < MAX){ v.id = v.id || uid(); list.push(v); } }); d = {list: list, cur: list[0] ? list[0].id : null}; H.save(KEY, d); }
  d.list = d.list.filter(function(x){ return x && SP[x.sp]; }).slice(0, MAX); d.list.forEach(function(x){ if(!x.id) x.id = uid(); }); return d; }
function saveOne(H, st){ var d = data(H), i = d.list.map(function(x){ return x.id; }).indexOf(st.id); if(i >= 0) d.list[i] = st; else if(d.list.length < MAX) d.list.push(st); H.save(KEY, d); }
function css(){ if(document.getElementById("ppCss")) return; var s = document.createElement("style"); s.id = "ppCss"; s.textContent =
  ".ppOv{position:fixed;inset:0;z-index:80;background:#1b1a2b;display:flex;flex-direction:column;padding-top:env(safe-area-inset-top)}.ppIn{position:relative;flex:1;display:flex;flex-direction:column;min-height:0}" +
  ".ppTop{display:flex;align-items:center;gap:6px;padding:8px;overflow-x:auto;scrollbar-width:none;background:#232238}.ppTop::-webkit-scrollbar{display:none}" +
  ".ppChip{flex:none;display:flex;align-items:center;gap:6px;border:0;border-radius:999px;padding:7px 12px;background:#33314f;color:#f4efff;font:700 13px system-ui}.ppChip.on{background:#ffd43b;color:#2b2200}.ppChip i{font-style:normal;font-size:18px}" +
  ".ppExit{position:absolute;left:10px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:20;border:0;border-radius:999px;padding:12px 18px;background:#ffd43b;color:#2b2200;font:800 15px system-ui;box-shadow:0 6px 18px #0006}.ppIn .vp2-bottom,.ppIn .pmBar{padding-left:96px}.ppStage{position:relative;flex:1;min-height:0}" +
  ".ppEmbed{position:relative;height:min(62vh,560px);border-radius:22px;overflow:hidden;background:#1b1a2b;display:flex;flex-direction:column}.ppEmbed .ppTop{border-radius:22px 22px 0 0}" +
  ".ppAdopt{position:absolute;inset:0;overflow:auto;padding:18px;color:#f4efff;background:radial-gradient(circle at 50% 0,#3b3860,#1b1a2b)}.ppAdopt h3{margin:4px 0 12px;font-size:20px}" +
  ".ppKinds{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.ppKinds button{border:2px solid transparent;border-radius:20px;padding:16px 4px;background:#2c2a46;color:#fff;font:800 14px system-ui;display:flex;flex-direction:column;align-items:center;gap:6px}.ppKinds button i{font-style:normal;font-size:44px}.ppKinds button.on{border-color:#ffd43b}" +
  ".ppAdopt input{width:100%;box-sizing:border-box;margin:14px 0;border:2px solid #4a4770;border-radius:14px;padding:12px;font:16px system-ui;background:#26243e;color:#fff}.ppGo{width:100%;border:0;border-radius:16px;padding:13px;font:800 15px system-ui;background:#ffd43b;color:#2b2200}" +
  ".ppNote{color:#b9b3d9;font-size:13px;line-height:1.5;margin-top:12px}.ppMenu{position:absolute;right:8px;top:8px;z-index:5;display:flex;gap:6px}.ppMenu button{border:0;border-radius:999px;padding:6px 10px;background:#fffd;color:#3b2f2f;font:700 12px system-ui;box-shadow:0 3px 10px #0003}";
  document.head.appendChild(s); }

function open(H, o){ o = o || {}; css(); var T = function(a, b){ return H.L2x(a, b); }, lowfx = document.documentElement.classList.contains("lowfx");
  var ov, root, stage, ctl = null, view = o.start || null;
  if(o.host){ root = document.createElement("div"); root.className = "ppEmbed"; o.host.appendChild(root); }
  else { ov = document.createElement("div"); ov.className = "ppOv"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", T("Pet telefon", "Phone pets")); root = document.createElement("div"); root.className = "ppIn"; ov.appendChild(root); document.body.appendChild(ov);
    if(H.N && H.N.setBack) try{ H.N.setBack(true); }catch(e){} ov._back = function(){ close(); }; window.__ppBack = ov._back; }
  function close(){ if(ctl) try{ ctl.stop(); }catch(e){} ctl = null; if(ov && ov.parentNode) ov.parentNode.removeChild(ov); if(window.__ppBack === (ov && ov._back)) window.__ppBack = null; if(o.onClose) o.onClose(); }
  function need(fn){ var list = []; if(!window.THREE) list.push("hajj/three.min.js"); if(!window.VPet || !window.VPetArt) list.push("pets/vpet/vpet.js"); if(!window.PetMeet) list.push("pets/vpet/meet.js"); if(!list.length){ fn(); return; } H.loadJs(list, fn, function(){ stage.innerHTML = '<div class="ppNote" style="padding:16px">' + T("Gagal dimuatkan", "Could not load") + '</div>'; }); }
  function shareImg(url){ if(H.shareImage) H.shareImage(url, T("Pet telefon saya", "My phone pet")); }
  function draw(){ var d = data(H); if(!view) view = d.cur && d.list.some(function(x){ return x.id === d.cur; }) ? d.cur : d.list[0] ? d.list[0].id : "adopt";
    if(ctl) try{ ctl.stop(); }catch(e){} ctl = null;
    root.innerHTML = '<div class="ppTop">' + d.list.map(function(p){ return '<button class="ppChip' + (view === p.id ? " on" : "") + '" data-pp="' + p.id + '"><i>' + SP[p.sp] + '</i>' + H.esc(p.n || "") + '</button>'; }).join("") +
      (d.list.length < MAX ? '<button class="ppChip' + (view === "adopt" ? " on" : "") + '" data-pp="adopt"><i>＋</i>' + T("Ambil", "Adopt") + '</button>' : '') +
      (d.list.length >= 2 ? '<button class="ppChip' + (view === "meet" ? " on" : "") + '" data-pp="meet"><i>🤝</i>' + T("Berjumpa", "Meet") + '</button>' : '') +
      (d.list.length ? '<button class="ppChip" data-pp="planet"><i>🌍</i>' + T("Planet", "Planet") + '</button>' : '') +
      '</div><div class="ppStage" id="ppStage"></div>' + (ov ? '<button class="ppExit" id="ppX" aria-label="' + T("Keluar", "Exit") + '">‹ ' + T("Keluar", "Exit") + '</button>' : '');
    stage = root.querySelector("#ppStage");
    root.querySelectorAll("[data-pp]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-pp"); if(k === "planet"){ planet(); return; } view = k; if(k !== "adopt" && k !== "meet"){ var dd = data(H); dd.cur = k; H.save(KEY, dd); } draw(); }; });
    var x = root.querySelector("#ppX"); if(x) x.onclick = close;
    if(view === "adopt") adopt(d); else if(view === "meet") need(function(){ meet(); }); else need(function(){ home(view); }); }
  function home(id){ var d = data(H), st = d.list.filter(function(x){ return x.id === id; })[0]; if(!st){ view = null; draw(); return; }
    ctl = window.VPet.mount(stage, {state: st, base: "pets/vpet/", lowfx: lowfx, compact: !!o.compact, T: T, vib: function(ms){ try{ if(H.vib) H.vib(ms); }catch(e){} }, save: function(s){ saveOne(H, s); }, onPhoto: function(url){ shareImg(url); }, onEvent: function(n, dd){ if(o.onEvent) o.onEvent(n, dd); }});
    var m = document.createElement("div"); m.className = "ppMenu"; m.innerHTML = '<button id="ppRel">👋 ' + T("Lepaskan", "Release") + '</button>'; stage.appendChild(m);
    m.querySelector("#ppRel").onclick = function(){ if(!confirm(T("Lepaskan " + st.n + "? Kenangannya akan hilang.", "Release " + st.n + "? It will be gone."))) return; var dd = data(H); dd.list = dd.list.filter(function(x){ return x.id !== id; }); dd.cur = dd.list[0] ? dd.list[0].id : null; H.save(KEY, dd); var av = H.load("ihsan_kwav", null); if(av === id) H.save("ihsan_kwav", null); view = null; draw(); }; }
  function meet(){ var d = data(H); ctl = window.PetMeet.mount(stage, {pets: d.list, lowfx: lowfx, T: T, vib: function(ms){ try{ if(H.vib) H.vib(ms); }catch(e){} }, save: function(s){ saveOne(H, s); }, onPhoto: shareImg}); }
  function adopt(d){ var pick = "cat"; ["cat", "bird", "fish"].some(function(k){ if(!d.list.some(function(x){ return x.sp === k; })){ pick = k; return true; } });
    stage.innerHTML = '<div class="ppAdopt"><h3>＋ ' + T("Ambil pet telefon", "Adopt a phone pet") + ' (' + d.list.length + '/' + MAX + ')</h3><div class="ppKinds">' + [["cat", T("Kucing", "Cat")], ["bird", T("Burung", "Bird")], ["fish", T("Ikan", "Fish")]].map(function(k){ return '<button data-k="' + k[0] + '"' + (k[0] === pick ? ' class="on"' : '') + '><i>' + SP[k[0]] + '</i>' + k[1] + '</button>'; }).join("") + '</div>' +
      '<input id="ppName" maxlength="16" value="' + H.esc(NAMES[pick][d.list.length % 3]) + '" aria-label="' + T("Nama", "Name") + '"><button class="ppGo" id="ppGo">💛 ' + T("Ambil", "Adopt") + '</button><div class="ppNote">' + T("Sehingga 3 pet: kucing, burung dan ikan boleh berkawan dan berjumpa. Pet telefon tidak pernah mati, cuma sedih jika dilupakan.", "Up to 3 pets: cats, birds and fish can be friends and meet. Phone pets never die; they just get sad if forgotten.") + '</div></div>';
    var nm = stage.querySelector("#ppName");
    stage.querySelectorAll("[data-k]").forEach(function(b){ b.onclick = function(){ pick = b.getAttribute("data-k"); stage.querySelectorAll("[data-k]").forEach(function(x){ x.classList.toggle("on", x === b); }); nm.value = NAMES[pick][d.list.length % 3]; }; });
    stage.querySelector("#ppGo").onclick = function(){ var dd = data(H); if(dd.list.length >= MAX) return; var st = {id: uid(), sp: pick, n: nm.value.trim() || NAMES[pick][0], born: Date.now(), t: Date.now()}; dd.list.push(st); dd.cur = st.id; H.save(KEY, dd); view = st.id; if(H.vib) try{ H.vib(30); }catch(e){} draw(); }; }
  function planet(){ var d = data(H), ov2 = document.createElement("div"); ov2.className = "ppAdopt"; ov2.style.zIndex = 6; ov2.innerHTML = '<h3>🌍 ' + T("Main di Planet Kanak-kanak", "Play in the Kids Planet") + '</h3><div class="ppKinds">' + d.list.map(function(p){ return '<button data-pl="' + p.id + '"><i>' + SP[p.sp] + '</i>' + H.esc(p.n) + '</button>'; }).join("") + '</div><div class="ppNote">' + T("Pet anda menjadi pemain di planet. Jika ikan, seluruh planet tenggelam di bawah air! 🌊", "Your pet becomes the explorer on the planet. If it is a fish, the whole planet goes under water! 🌊") + '</div><button class="ppGo" id="ppNo" style="margin-top:12px;background:#33314f;color:#fff">✕ ' + T("Batal", "Cancel") + '</button>';
    stage.appendChild(ov2); ov2.querySelector("#ppNo").onclick = function(){ ov2.remove(); };
    ov2.querySelectorAll("[data-pl]").forEach(function(b){ b.onclick = function(){ H.save("ihsan_kwav", b.getAttribute("data-pl")); close(); if(H.openPlanet) H.openPlanet(); }; }); }
  draw(); return {close: close}; }
window.PhonePets = {MAX: MAX, data: data, open: open, list: function(H){ return data(H).list; }, emoji: SP};
})();
