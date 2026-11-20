/* IQ 16 · Kendi Air: tap a jug to pick it up, then Fill, Empty, or tap another jug to pour into it. Measure the amount shown on the brass plate. */
(function(){ var T = THREE, IQ = window.IQ;
var LV = [{c:[3,5], t:4}, {c:[3,7,10], t:5, start:[0,0,10], noTap:true}, {c:[9,14,23], t:11, start:[0,0,23], noTap:true},
  {c:[7,14,19,26], t:13, start:[0,0,0,26], noTap:true}, {c:[3,6,30], t:1, start:[0,0,30], noTap:true, leak:2}, {c:[11,15,39], t:2, t2:11, start:[0,0,39], noTap:true}];   // fewest moves 6, 8, 16, 18, 20, 25 (searched offline)
function goal(D, s){ return D.t2 != null ? s.some(function(v, i){ return v === D.t && s.some(function(w, j){ return j !== i && w === D.t2; }); }) : s.indexOf(D.t) >= 0; }
function act(D, s, a){ var n = s.slice(), cap = D.c; if(a[0] === "fill") n[a[1]] = cap[a[1]]; else if(a[0] === "empty") n[a[1]] = 0; else { var m = Math.min(n[a[1]], cap[a[2]] - n[a[2]]); n[a[1]] -= m; n[a[2]] += m; } if(D.leak != null && n[D.leak] > 0) n[D.leak]--; return n; }
function bfs(D, st){ var key = function(s){ return s.join(","); }, seen = {}, q = [[st, null, 0]]; seen[key(st)] = 1;
  while(q.length){ var it = q.shift(), s = it[0]; if(goal(D, s)) return {first:it[1] || ["done"], n:it[2]};
    var acts = []; for(var i = 0; i < s.length; i++){ if(!D.noTap){ acts.push(["fill", i]); acts.push(["empty", i]); } for(var j = 0; j < s.length; j++) if(i !== j) acts.push(["pour", i, j]); }
    for(var a = 0; a < acts.length; a++){ var n = act(D, s, acts[a]); if(!seen[key(n)]){ seen[key(n)] = 1; q.push([n, it[1] || acts[a], it[2] + 1]); } } } return null; }
IQ.def("kendi", {build:function(S, lv, A){ var D = LV[lv], cap = D.c, k = cap.length, par = (bfs(D, (D.start || cap.map(function(){ return 0; })).slice()) || {n:0}).n, amt = (D.start || cap.map(function(){ return 0; })).slice(), sel = -1, J = [], maxC = Math.max.apply(null, cap);
  var glassM = new T.MeshPhysicalMaterial({color:0xcfe6f0, roughness:0.08, transmission:0.92, thickness:0.15, transparent:true, opacity:0.45, clearcoat:1, side:T.DoubleSide, depthWrite:false});
  var waterM = new T.MeshPhysicalMaterial({color:0x2a8fd8, roughness:0.05, transmission:0.25, transparent:true, opacity:0.88, clearcoat:1, emissive:0x0a3a6a, emissiveIntensity:0.4});
  function profile(h, w){ var p = []; for(var i = 0; i <= 18; i++){ var t = i / 18, r = w * (0.55 + 0.45 * Math.sin(Math.min(1, t * 1.25) * Math.PI)); if(t > 0.78) r = w * 0.32; p.push(new T.Vector2(Math.max(0.04, r), t * h)); } return p; }
  var plate = new T.Mesh(new T.CylinderGeometry(0.75, 0.75, 0.08, 32), IQ.mat.brass()); plate.position.set(0, 0.04, -2.2); S.add(plate);
  var tl = IQ.label(D.t2 != null ? D.t + " & " + D.t2 : IQ.ar(D.t) + " ← " + D.t, {fg:"#1a1405", s:1.2, font:"bold 90px 'AmiriL', serif"}); tl.position.set(0, 0.09, -2.2); S.add(tl);
  cap.forEach(function(c, i){ var h = 0.6 + c / maxC * 2.2, w = 0.45 + c / maxC * 0.45, g = new T.Group(), prof = profile(h, w);
    var body = new T.Mesh(new T.LatheGeometry(prof, 40), glassM); g.add(body); var rim = new T.Mesh(new T.TorusGeometry(prof[prof.length - 1].x, 0.03, 8, 32), IQ.mat.brass()); rim.rotation.x = Math.PI / 2; rim.position.y = h; g.add(rim);
    var foot = new T.Mesh(new T.CylinderGeometry(w * 0.5, w * 0.55, 0.06, 32), IQ.mat.brass()); g.add(foot);
    var sp = new T.Mesh(new T.CylinderGeometry(0.05, 0.08, w * 0.9, 10), glassM); sp.rotation.z = -1; sp.position.set(w * 0.75, h * 0.62, 0); g.add(sp);   // the kendi's spout
    var water = new T.Mesh(new T.BufferGeometry(), waterM); g.add(water);
    var lab = IQ.label(IQ.ar(c), {fg:"#E4D3B5", s:0.7}); lab.rotation.x = -Math.PI / 2.6; lab.position.set(0, 0.04, w + 0.4); g.add(lab);
    var hit = new T.Mesh(new T.CylinderGeometry(w + 0.2, w + 0.2, h + 0.4, 10), new T.MeshBasicMaterial({visible:false})); hit.position.y = h / 2; g.add(hit);
    var cnt = new T.Sprite(new T.SpriteMaterial({transparent:true, depthTest:false})); cnt.scale.set(0.9, 0.9, 1); cnt.position.set(0, h + 0.55, 0); g.add(cnt);
    g.position.set((i - (k - 1) / 2) * 2.4, 0, 0.4); g.userData = {p:1, jug:i}; S.add(g); J.push({g:g, water:water, prof:prof, h:h, cnt:cnt, lvl:amt[i] / c}); });
  function setWater(i, frac){ var j = J[i], h = j.h * 0.97 * frac; j.lvl = frac; if(frac <= 0.001){ j.water.visible = false; return; } j.water.visible = true; var p = []; for(var a = 0; a < j.prof.length; a++){ var pt = j.prof[a]; if(pt.y > h){ var prev = j.prof[a - 1], t = (h - prev.y) / (pt.y - prev.y); p.push(new T.Vector2((prev.x + (pt.x - prev.x) * t) * 0.93, h)); break; } p.push(new T.Vector2(pt.x * 0.93, Math.max(0.02, pt.y))); }
    p.push(new T.Vector2(0, h)); j.water.geometry.dispose(); j.water.geometry = new T.LatheGeometry(p, 36); }
  function cntTex(v){ return IQ.canvasTex("kn" + v, 128, 128, function(g, w){ g.fillStyle = "rgba(15,30,58,.85)"; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill(); g.strokeStyle = "#D4A544"; g.lineWidth = 6; g.stroke(); g.fillStyle = "#E4D3B5"; g.font = "bold 64px 'AmiriL', serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(v), 64, 70); }); }
  function show(anim){ J.forEach(function(j, i){ var to = amt[i] / cap[i], fr = j.lvl; j.cnt.material.map = cntTex(amt[i]); j.cnt.material.needsUpdate = true; if(anim) S.tween(500, function(e){ setWater(i, fr + (to - fr) * e); }); else setWater(i, to); }); }
  show(false); S.size = k * 2.7; S.orb.tEl = 0.55; S.orb.cz = -0.3;
  function lift(i, on){ var g = J[i].g; S.tween(180, function(e){ g.position.y = on ? e * 0.5 : 0.5 - e * 0.5; }); }
  function leak(){ if(D.leak != null && amt[D.leak] > 0) amt[D.leak]--; }
  function check(){ if(goal(D, amt)) setTimeout(function(){ A.win(); }, 500); }
  var ctl = A.ctl((D.noTap ? '' : '<button class="iqB" id="kFill">💧 ' + A.L("Isi penuh", "Fill") + '</button><button class="iqB" id="kEmp">⤵ ' + A.L("Kosongkan", "Empty") + '</button>') + '<span class="mut tiny" style="flex-basis:100%;text-align:center">' + (D.noTap ? A.L("Tiada paip: hanya tuang antara kendi.", "No tap: you can only pour between jugs.") : A.L("Pilih kendi, kemudian Isi / Kosongkan, atau ketuk kendi lain untuk tuang.", "Pick a jug, then Fill / Empty, or tap another jug to pour.")) + '</span>');
  var doAct = function(f){ if(sel < 0){ A.say(A.L("Pilih kendi dahulu", "Pick a jug first")); return; } f(sel); leak(); lift(sel, false); sel = -1; A.move(); show(true); check(); };
  if(!D.noTap){ ctl.querySelector("#kFill").onclick = function(){ doAct(function(i){ amt[i] = cap[i]; }); }; ctl.querySelector("#kEmp").onclick = function(){ doAct(function(i){ amt[i] = 0; }); }; }
  S.onPick = function(o){ if(!o || o.userData.jug == null || S.busy()) return; var i = o.userData.jug; if(sel < 0){ sel = i; lift(i, true); return; } if(sel === i){ lift(i, false); sel = -1; return; }
    var a = sel, m = Math.min(amt[a], cap[i] - amt[i]); lift(a, false); sel = -1; if(!m){ A.say(A.L("Tiada yang boleh dituang", "Nothing can be poured")); return; } amt[a] -= m; amt[i] += m; leak(); A.move();
    var g = J[a].g, x0 = g.position.x; S.tween(380, function(e){ g.rotation.z = (J[i].g.position.x > x0 ? -1 : 1) * Math.sin(e * Math.PI) * 0.6; }); show(true); check(); };
  if(D.leak != null){ var dr = new T.Mesh(new T.SphereGeometry(0.09, 12, 10), new T.MeshPhysicalMaterial({color:0x2a8fd8, roughness:0.05, clearcoat:1})); dr.scale.y = 1.4; dr.position.set(0, 0.12, 0.2); J[D.leak].g.add(dr); A.say(A.L("Kendi ", "Jug ") + cap[D.leak] + A.L(" bocor: hilang 1 selepas setiap langkah", " leaks: it loses 1 after every move"), 3000); }
  if(D.t2 != null) A.say(A.L("Dapatkan ", "Get ") + D.t + A.L(" dan ", " and ") + D.t2 + A.L(" dalam dua kendi berlainan, serentak", " in two different jugs at the same time"), 3000);
  return {par:par, hint:function(){ var b = bfs(D, amt); if(!b) return ""; var h = b.first; if(h[0] === "fill") return A.L("Isi penuh kendi ", "Fill jug ") + cap[h[1]]; if(h[0] === "empty") return A.L("Kosongkan kendi ", "Empty jug ") + cap[h[1]]; if(h[0] === "pour") return A.L("Tuang kendi ", "Pour jug ") + cap[h[1]] + A.L(" ke kendi ", " into jug ") + cap[h[2]]; return ""; }}; }});
IQ.kendiBfs = bfs; IQ.kendiLV = LV; IQ.kendiAct = act; IQ.kendiGoal = goal;
})();
