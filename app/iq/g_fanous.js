/* IQ 17 · Campur Fanus: three lanterns (red, green, blue) light the white dome. Set each one so the dome matches the target colour. */
(function(){ var T = THREE, IQ = window.IQ;
var LV = [{st:2, n:1}, {st:4, n:2}, {st:6, n:2}, {st:10, n:1, hide:true}, {st:10, n:2, hide:true, cmy:true}, {st:10, n:3, hide:true}];
IQ.def("fanous", {build:function(S, lv, A){ var D = LV[lv], R = IQ.rnd(Date.now() % 7919 + 3), val = [0, 0, 0], tgt, round = 0, cols = D.cmy ? [0x20e0e8, 0xf030c8, 0xf8e020] : [0xff3040, 0x30e070, 0x3070ff], par = 0;
  var allT = [], from = [0, 0, 0];
  function newT(){ do { tgt = [0, 1, 2].map(function(){ return Math.floor(R() * (D.st + 1)); }); } while(tgt[0] + tgt[1] + tgt[2] < 2 || (tgt[0] === tgt[1] && tgt[1] === tgt[2])); }
  for(var rr = 0; rr < D.n; rr++){ newT(); allT.push(tgt.slice()); par += tgt.filter(function(v, i){ return v !== from[i]; }).length; from = tgt.slice(); } tgt = allT[0];
  S.scene.background = new T.Color(0x1a2a4a); S.base = 120;
  var tray = new T.Mesh(new T.CylinderGeometry(3.6, 3.8, 0.3, 48), IQ.mat.wood()); tray.position.y = 0.15; S.add(tray);
  var inl = new T.Mesh(new T.CylinderGeometry(3.4, 3.4, 0.02, 48), new T.MeshStandardMaterial({color:0xffffff, map:IQ.starTex("fa", "#3a6eb2", "rgba(190,220,255,.3)", "rgba(240,190,80,.4)")})); inl.position.y = 0.31; S.add(inl);
  var mk = function(x){ var g = new T.Group(), plinth = new T.Mesh(new T.CylinderGeometry(0.6, 0.7, 0.3, 32), IQ.mat.brass()); plinth.position.y = 0.45; g.add(plinth); var d = new T.Mesh(new T.SphereGeometry(0.8, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshPhysicalMaterial({color:0xffffff, roughness:0.25, clearcoat:0.6})); d.position.y = 0.6; g.add(d); g.position.set(x, 0, 0.9); S.add(g); return d; };
  var mine = mk(-1.3), goal = mk(1.3); goal.material = new T.MeshStandardMaterial({color:0x000000, roughness:0.3});
  var tl = IQ.label(A.L("Sasaran", "Target"), {fg:"#D4A544", s:1.2, font:"bold 70px sans-serif"}); tl.position.set(1.3, 0.33, 2.1); S.add(tl, false); var ml = IQ.label(A.L("Anda", "Yours"), {fg:"#E4D3B5", s:1.2, font:"bold 70px sans-serif"}); ml.position.set(-1.3, 0.33, 2.1); S.add(ml, false);
  // three fanous lanterns on arms; each has a coloured glass body, a gold frame and a real coloured light
  var lights = cols.map(function(c, i){ var g = new T.Group(), a = (i - 1) * 0.9, x = Math.sin(a) * 2.6, z = -Math.cos(a) * 2.2 + 0.6;
    var pole = new T.Mesh(new T.CylinderGeometry(0.04, 0.05, 2.6, 8), IQ.mat.brass()); pole.position.y = 1.3; g.add(pole);
    var glass = new T.Mesh(new T.CylinderGeometry(0.28, 0.2, 0.6, 6), new T.MeshPhysicalMaterial({color:c, emissive:c, emissiveIntensity:0.2, transmission:0.4, roughness:0.15, transparent:true, opacity:0.9})); glass.position.y = 2.9; g.add(glass);
    var cap = new T.Mesh(new T.ConeGeometry(0.32, 0.3, 6), IQ.mat.gold()); cap.position.y = 3.35; g.add(cap); var bot = new T.Mesh(new T.ConeGeometry(0.22, 0.2, 6), IQ.mat.gold()); bot.rotation.x = Math.PI; bot.position.y = 2.5; g.add(bot);
    var pl = new T.PointLight(c, 0, 9, 1.6); pl.position.y = 2.9; g.add(pl); g.position.set(x, 0, z); S.add(g); return {pl:pl, glass:glass}; });
  S.size = 8.5; S.orb.tEl = 0.6;
  var ctl = A.ctl(cols.map(function(c, i){ return '<div class="iqSl" style="--c:#' + new T.Color(c).getHexString() + '"><span>' + (D.cmy ? ["C","M","Y"] : ["🔴","🟢","🔵"])[i] + '</span><input type="range" min="0" max="' + D.st + '" step="1" value="0" data-ch="' + i + '"><b id="fv' + i + '">0</b></div>'; }).join("") + '<div class="mut small" id="fMatch" style="flex-basis:100%;text-align:center"></div>');
  function hex(v){ return D.cmy ? new T.Color(1 - v[0] / D.st, 1 - v[1] / D.st, 1 - v[2] / D.st) : new T.Color(v[0] / D.st, v[1] / D.st, v[2] / D.st); }
  function paint(){ lights.forEach(function(l, i){ l.pl.intensity = val[i] / D.st * 9; l.glass.material.emissiveIntensity = 0.15 + val[i] / D.st * 2.2; ctl.querySelector("#fv" + i).textContent = val[i]; });
    var mc = hex(val), tc = hex(tgt); mine.material.emissive = mc; mine.material.emissiveIntensity = 0.9; goal.material.color = tc; goal.material.emissive = tc; goal.material.emissiveIntensity = 0.9;
    var d = Math.abs(val[0] - tgt[0]) + Math.abs(val[1] - tgt[1]) + Math.abs(val[2] - tgt[2]), pc = Math.round(100 * (1 - d / (3 * D.st))); ctl.querySelector("#fMatch").textContent = (D.hide ? A.L("Nilai dengan mata anda", "Judge it by eye") : A.L("Padanan ", "Match ") + pc + "%") + (D.n > 1 ? " · " + A.L("warna ", "colour ") + (round + 1) + "/" + D.n : "");
    if(d === 0){ round++; touched = {}; if(round >= D.n) A.win(); else { A.say(A.L("Sama! Warna seterusnya…", "Matched! Next colour…")); setTimeout(function(){ tgt = allT[round]; paint(); }, 900); } } }
  var touched = {};
  ctl.querySelectorAll("[data-ch]").forEach(function(r){ r.oninput = function(){ val[+r.getAttribute("data-ch")] = +r.value; paint(); }; r.onchange = function(){ var ch = r.getAttribute("data-ch"); if(lv === 5 && touched[ch]){ A.fail(A.L("Tahap ekstrem: setiap lampu hanya boleh diubah sekali bagi setiap warna", "Extreme: each lamp may be set only once per colour")); return; } touched[ch] = 1; A.move(); }; });
  paint();
  if(D.cmy) A.say(A.L("Tahap ini: penapis C, M, Y menolak cahaya (seperti cat)", "This level: C, M, Y filters take light away (like paint)"), 3200); if(lv === 5) A.say(A.L("Ekstrem: setiap lampu sekali sahaja bagi setiap warna", "Extreme: set each lamp only once per colour"), 3000);
  return {par:par, hint:function(){ var nm = D.cmy ? ["C", "M", "Y"] : [A.L("merah", "red"), A.L("hijau", "green"), A.L("biru", "blue")]; for(var i = 0; i < 3; i++) if(val[i] !== tgt[i]) return A.L("Lampu ", "The ") + nm[i] + (val[i] < tgt[i] ? A.L(" perlu lebih terang", " lamp needs to be brighter") : A.L(" perlu lebih malap", " lamp needs to be dimmer")); return ""; }}; }});
})();
