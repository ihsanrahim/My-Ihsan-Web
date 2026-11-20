/* My Ihsan 0.6.1 (owner): Time › Stats › Month as a three.js 3D line chart: six coloured lines (steps, active, screen, app, prayers,
   Quran), one per lane, against the days of the month. Each line is scaled to its own best day, with its number at both ends.
   Drag to turn it; the selected stat is bright, the others soft. Stats3D.mount(box, {days, series:[{ic, nm, col, v:[...], f(v)}], sel}) */
(function(){ "use strict";
var cur = null;
function label(T, txt, col, big){ var c = document.createElement("canvas"), g = c.getContext("2d"), f = big ? 44 : 36; g.font = "700 " + f + "px system-ui,sans-serif";
  var w = Math.ceil(g.measureText(txt).width) + 28; c.width = w; c.height = f + 22; g.font = "700 " + f + "px system-ui,sans-serif";
  g.fillStyle = "rgba(10,20,16,.78)"; var r = 14; g.beginPath(); g.moveTo(r, 0); g.arcTo(w, 0, w, c.height, r); g.arcTo(w, c.height, 0, c.height, r); g.arcTo(0, c.height, 0, 0, r); g.arcTo(0, 0, w, 0, r); g.fill();
  g.strokeStyle = col; g.lineWidth = 4; g.stroke(); g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(txt, 14, c.height / 2 + 1);
  var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; var s = new T.Sprite(new T.SpriteMaterial({map:t, depthTest:false, transparent:true}));
  var hh = big ? 0.42 : 0.34; s.scale.set(hh * c.width / c.height, hh, 1); s.renderOrder = 5; return s; }
function stop(){ if(!cur) return; cur.dead = true; try{ cur.ren.dispose(); cur.ren.forceContextLoss && cur.ren.forceContextLoss(); }catch(e){} if(cur.ren.domElement.parentNode) cur.ren.domElement.remove(); cur = null; }
function mount(box, o){ stop(); var T = window.THREE; if(!T || !box) return;
  var W = box.clientWidth || 320, H = box.clientHeight || 260, ren;
  try{ ren = new T.WebGLRenderer({antialias:true, alpha:true}); }catch(e){ box.innerHTML = '<div class="mut small" style="padding:20px">3D ✕</div>'; return; }
  ren.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); ren.setSize(W, H); box.appendChild(ren.domElement);
  var sc = new T.Scene(), cam = new T.PerspectiveCamera(38, W / H, 0.1, 100), grp = new T.Group(); sc.add(grp);
  sc.add(new T.AmbientLight(0xffffff, 0.75)); var dl = new T.DirectionalLight(0xffffff, 1.1); dl.position.set(3, 8, 6); sc.add(dl);
  var n = o.series.length, LW = 10, HT = 2.6, GAP = 1.3, D = Math.max(2, o.days), z0 = -(n - 1) * GAP / 2;
  var X = function(i){ return -LW / 2 + i * LW / (D - 1); };
  // floor and day ticks
  var fl = new T.Mesh(new T.PlaneGeometry(LW + 0.6, n * GAP + 0.6), new T.MeshBasicMaterial({color:0x7f8f88, transparent:true, opacity:0.12, side:T.DoubleSide})); fl.rotation.x = -Math.PI / 2; grp.add(fl);
  var gm = new T.LineBasicMaterial({color:0x8a9a92, transparent:true, opacity:0.35}), gp = [];
  for(var d = 0; d < D; d += (D > 20 ? 5 : 1)){ gp.push(new T.Vector3(X(d), 0.001, z0 - GAP / 2), new T.Vector3(X(d), 0.001, -z0 + GAP / 2)); }
  grp.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(gp), gm));
  [1, 10, 20, D].forEach(function(dd){ if(dd > D) return; var s = label(T, String(dd), "#888"); s.scale.multiplyScalar(0.7); s.position.set(X(dd - 1), 0.02, -z0 + GAP * 0.95); grp.add(s); });
  var lines = [];
  o.series.forEach(function(se, k){ var z = z0 + k * GAP, vs = se.v, last = vs.length - 1; while(last > 0 && vs[last] == null) last--;
    var mx = Math.max.apply(null, vs.map(function(v){ return v || 0; }).concat([1e-9])), pts = [];
    for(var i = 0; i <= last; i++) pts.push(new T.Vector3(X(i), 0.06 + (vs[i] || 0) / mx * HT, z));
    if(pts.length < 2) pts.push(new T.Vector3(X(1), pts[0] ? pts[0].y : 0.06, z));
    var col = new T.Color(se.col), on = se.id === o.sel;
    var tube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts, false, "centripetal", 0.3), Math.max(24, pts.length * 6), on ? 0.075 : 0.05, 8, false), new T.MeshStandardMaterial({color:col, emissive:col, emissiveIntensity:on ? 0.45 : 0.15, roughness:0.45, transparent:true, opacity:on ? 1 : 0.55}));
    grp.add(tube);
    // a soft wall under the line
    var sh = new T.Shape(); sh.moveTo(pts[0].x, 0); pts.forEach(function(p){ sh.lineTo(p.x, p.y); }); sh.lineTo(pts[pts.length - 1].x, 0); sh.lineTo(pts[0].x, 0);
    var wall = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshBasicMaterial({color:col, transparent:true, opacity:on ? 0.22 : 0.08, side:T.DoubleSide, depthWrite:false})); wall.position.z = z; grp.add(wall);
    // numbers at each end
    var a = label(T, se.ic + " " + se.f(vs[0] || 0), se.col, on), b = label(T, se.f(vs[last] || 0), se.col, on);
    a.position.set(pts[0].x - 0.15, pts[0].y + 0.32, z); a.center.set(1, 0.5); b.position.set(pts[pts.length - 1].x + 0.15, pts[pts.length - 1].y + 0.32, z); b.center.set(0, 0.5);
    grp.add(a); grp.add(b); lines.push(tube); });
  var yaw = -0.3, pit = 0.62, dist = 16, auto = true, t0 = performance.now();
  var place = function(){ cam.position.set(Math.sin(yaw) * Math.cos(pit) * dist, Math.sin(pit) * dist + 1.4, Math.cos(yaw) * Math.cos(pit) * dist); cam.lookAt(-0.7, 0.8, 0); };
  var el = ren.domElement, px = null, py = 0;
  el.addEventListener("pointerdown", function(e){ px = e.clientX; py = e.clientY; auto = false; el.setPointerCapture && el.setPointerCapture(e.pointerId); });
  el.addEventListener("pointermove", function(e){ if(px == null) return; yaw -= (e.clientX - px) * 0.008; pit = Math.max(0.08, Math.min(1.2, pit + (e.clientY - py) * 0.006)); px = e.clientX; py = e.clientY; });
  var up = function(){ px = null; }; el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
  el.style.touchAction = "none";
  var me = cur = {ren:ren, dead:false};
  var loop = function(t){ if(me.dead) return; if(!document.body.contains(box)){ stop(); return; }
    if(auto) yaw = -0.35 + Math.sin((t - t0) / 4000) * 0.28; place();
    var nw = box.clientWidth, nh = box.clientHeight; if(nw && (nw !== W || nh !== H)){ W = nw; H = nh; ren.setSize(W, H); cam.aspect = W / H; cam.updateProjectionMatrix(); }
    ren.render(sc, cam); requestAnimationFrame(loop); };
  requestAnimationFrame(loop); return me; }
window.Stats3D = {mount:mount, stop:stop};
})();
