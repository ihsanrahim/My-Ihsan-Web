/* My Ihsan · Silibus: visuals for questions without image files (spec §3.4).
   VIS.render(list, {lang}) -> element. Kinds: emoji, say, clock, money, shape2d, shape3d (three.js, lazy), frac, numline,
   pictograph, bar, pie, grid, blocks, ar/jawi, img/audio (only if the file exists in silibus/media/). */
(function(){
"use strict";
var NS = "http://www.w3.org/2000/svg";
function el(t, cls, html){ var e = document.createElement(t); if(cls) e.className = cls; if(html!=null) e.innerHTML = html; return e; }
function esc(s){ return String(s==null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function svg(w, h, body, cls){ return '<svg class="'+(cls||"")+'" xmlns="'+NS+'" viewBox="0 0 '+w+' '+h+'" role="img">'+body+'</svg>'; }
var COL = ["#4F7BFF","#FF9F1C","#4EE0B0","#FF4FA3","#B48CFF","#FFD53D","#35D0F0","#FF7A5C"];

function speak(t, lang){
  try{ var N = window.parent && window.parent.Native ? window.parent.Native : window.Native; if(N && N.speak){ N.speak(t, lang||"ms"); return; } }catch(e){}
  try{ var u = new SpeechSynthesisUtterance(t); u.lang = lang==="en" ? "en-GB" : lang==="ar" ? "ar-SA" : "ms-MY"; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(e){}
}
var R = {
  emoji: function(v){ var n = Math.max(1, Math.min(60, +v.n||1)); var d = el("div", "vEmoji"+(n>1?" vGrid":"")); for(var i=0;i<n;i++) d.appendChild(el("span", "", esc(v.s))); return d; },
  say: function(v){ var b = el("button", "vSay", "🔊 <span>"+(v.lang==="en"?"Listen":v.lang==="ar"?"استمع":"Dengar")+"</span>"); b.type = "button"; b.onclick = function(e){ e.stopPropagation(); speak(v.t, v.lang); }; return b; },
  clock: function(v){ var h = +v.h||12, m = +v.m||0, ha = ((h%12)+m/60)*30, ma = m*6, t = "";
    for(var i=1;i<=12;i++){ var a = i*30*Math.PI/180; t += '<text x="'+(50+38*Math.sin(a)).toFixed(1)+'" y="'+(53.5-38*Math.cos(a)).toFixed(1)+'" font-size="9" text-anchor="middle" fill="currentColor">'+i+'</text>'; }
    for(var k=0;k<60;k++){ var b = k*6*Math.PI/180, r1 = k%5 ? 45 : 43; t += '<line x1="'+(50+r1*Math.sin(b)).toFixed(1)+'" y1="'+(50-r1*Math.cos(b)).toFixed(1)+'" x2="'+(50+47*Math.sin(b)).toFixed(1)+'" y2="'+(50-47*Math.cos(b)).toFixed(1)+'" stroke="currentColor" stroke-width="'+(k%5?0.5:1.2)+'"/>'; }
    var hand = function(ang, len, w, c){ var r = ang*Math.PI/180; return '<line x1="50" y1="50" x2="'+(50+len*Math.sin(r)).toFixed(1)+'" y2="'+(50-len*Math.cos(r)).toFixed(1)+'" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"/>'; };
    return el("div", "vBox", svg(100, 100, '<circle cx="50" cy="50" r="48" fill="#fff" stroke="#333" stroke-width="2"/><g style="color:#222">'+t+'</g>'+hand(ha, 24, 3.5, "#1f2a6b")+hand(ma, 36, 2.2, "#d33")+'<circle cx="50" cy="50" r="2.5" fill="#222"/>', "vClock")); },
  money: function(v){ var d = el("div", "vMoney");
    (v.items||[]).forEach(function(it){ var s = String(it), sen = /sen/i.test(s), val = parseFloat(s.replace(/[^0-9.]/g, ""))||0;
      if(sen){ var c = {5:"#c9c9c9",10:"#bdbdbd",20:"#d4b04c",50:"#bfbfbf"}[val]||"#c0c0c0"; d.insertAdjacentHTML("beforeend", svg(44, 44, '<circle cx="22" cy="22" r="20" fill="'+c+'" stroke="#777" stroke-width="2"/><text x="22" y="26" font-size="11" font-weight="700" text-anchor="middle" fill="#333">'+val+'sen</text>', "vCoin")); }
      else { var nc = {1:"#3b6fd8",5:"#2e9d4f",10:"#d64545",20:"#e08a1e",50:"#2aa5a5",100:"#7b4bc4"}[val]||"#3b6fd8"; d.insertAdjacentHTML("beforeend", svg(96, 46, '<rect x="2" y="2" width="92" height="42" rx="5" fill="'+nc+'"/><rect x="8" y="8" width="80" height="30" rx="3" fill="none" stroke="#fff" stroke-opacity=".6"/><text x="48" y="30" font-size="16" font-weight="800" text-anchor="middle" fill="#fff">RM'+val+'</text>', "vNote")); } });
    return d; },
  shape2d: function(v){ var s = String(v.s||"").toLowerCase(), p = "", f = "#4F7BFF";
    var poly = function(n, r, rot){ var o = []; for(var i=0;i<n;i++){ var a = (rot||-90)*Math.PI/180 + i*2*Math.PI/n; o.push((50+r*Math.cos(a)).toFixed(1)+","+(50+r*Math.sin(a)).toFixed(1)); } return '<polygon points="'+o.join(" ")+'" fill="'+f+'" stroke="#1d2b6b" stroke-width="2"/>'; };
    if(/bulat|circle/.test(s)) p = '<circle cx="50" cy="50" r="38" fill="'+f+'" stroke="#1d2b6b" stroke-width="2"/>';
    else if(/segi tiga|triangle/.test(s)) p = poly(3, 42);
    else if(/sama|square/.test(s)) p = '<rect x="15" y="15" width="70" height="70" fill="'+f+'" stroke="#1d2b6b" stroke-width="2"/>';
    else if(/tepat|rectangle/.test(s)) p = '<rect x="6" y="28" width="88" height="44" fill="'+f+'" stroke="#1d2b6b" stroke-width="2"/>';
    else if(/pentagon/.test(s)) p = poly(5, 42); else if(/heksagon|hexagon/.test(s)) p = poly(6, 42, 0);
    else if(/bintang|star/.test(s)){ var o = []; for(var i=0;i<10;i++){ var a = -Math.PI/2 + i*Math.PI/5, r = i%2 ? 18 : 42; o.push((50+r*Math.cos(a)).toFixed(1)+","+(50+r*Math.sin(a)).toFixed(1)); } p = '<polygon points="'+o.join(" ")+'" fill="#FFD53D" stroke="#a07800" stroke-width="2"/>'; }
    else if(/hati|heart/.test(s)) p = '<path d="M50 84 C10 58 12 22 34 22 C44 22 50 30 50 36 C50 30 56 22 66 22 C88 22 90 58 50 84Z" fill="#FF4FA3" stroke="#9b1d5f" stroke-width="2"/>';
    else p = '<rect x="15" y="15" width="70" height="70" fill="'+f+'"/>';
    return el("div", "vBox", svg(100, 100, p, "vShape")); },
  shape3d: function(v){ var box = el("div", "vBox v3d"), s = String(v.s||"").toLowerCase();
    box.innerHTML = iso(s); // SVG fallback first; three.js replaces it when available
    var go = function(){ try{ three3d(box, s); }catch(e){} };
    if(window.THREE) setTimeout(go, 30); else { var sc = document.createElement("script"); sc.src = "../hajj/three.min.js"; sc.onload = go; document.head.appendChild(sc); }
    return box; },
  frac: function(v){ var n = +v.n||0, d = Math.max(1, +v.d||1), sh = String(v.shape||"bulat"), b = "";
    if(/bulat|circle/.test(sh)){ for(var i=0;i<d;i++){ var a0 = (i/d)*2*Math.PI - Math.PI/2, a1 = ((i+1)/d)*2*Math.PI - Math.PI/2;
        var x0 = 50+40*Math.cos(a0), y0 = 50+40*Math.sin(a0), x1 = 50+40*Math.cos(a1), y1 = 50+40*Math.sin(a1);
        b += d===1 ? '<circle cx="50" cy="50" r="40" fill="'+(i<n?"#FF9F1C":"#fff")+'" stroke="#333" stroke-width="1.5"/>' : '<path d="M50 50 L'+x0.toFixed(1)+' '+y0.toFixed(1)+' A40 40 0 '+(1/d>0.5?1:0)+' 1 '+x1.toFixed(1)+' '+y1.toFixed(1)+'Z" fill="'+(i<n?"#FF9F1C":"#fff")+'" stroke="#333" stroke-width="1.5"/>'; }
      return el("div", "vBox", svg(100, 100, b, "vFrac")); }
    var w = 90/d; for(var j=0;j<d;j++) b += '<rect x="'+(5+j*w).toFixed(1)+'" y="'+(/bar|jalur/.test(sh)?40:10)+'" width="'+w.toFixed(1)+'" height="'+(/bar|jalur/.test(sh)?20:80)+'" fill="'+(j<n?"#FF9F1C":"#fff")+'" stroke="#333" stroke-width="1.5"/>';
    return el("div", "vBox", svg(100, 100, b, "vFrac")); },
  numline: function(v){ var a = +v.from, z = +v.to, st = +v.step||1, n = Math.round((z-a)/st), W = 320, b = '<line x1="10" y1="30" x2="'+(W-10)+'" y2="30" stroke="#333" stroke-width="2"/>', mk = v.mark||[];
    for(var i=0;i<=n;i++){ var x = 10+i*(W-20)/n, val = a+i*st, m = mk.indexOf(val)>=0; b += '<line x1="'+x.toFixed(1)+'" y1="22" x2="'+x.toFixed(1)+'" y2="38" stroke="#333" stroke-width="1.5"/>'+
      '<text x="'+x.toFixed(1)+'" y="54" font-size="'+(n>10?8:10)+'" text-anchor="middle" fill="'+(m?"#d33":"#222")+'" font-weight="'+(m?800:400)+'">'+(m?"?":val)+'</text>'; }
    return el("div", "vBox vWide", svg(W, 62, b, "vNum")); },
  pictograph: function(v){ var t = '<div class="vPicT">'+esc(v.title||"")+'</div><table class="vPic">';
    (v.labels||[]).forEach(function(l, i){ var c = Math.round((+v.values[i]||0)/(+v.key||1)), ic = (v.icon||[])[i] || (v.icon||["⭐"])[0]; t += '<tr><td>'+esc(l)+'</td><td>'+new Array(c+1).join(ic)+'</td></tr>'; });
    t += '</table>'+(+v.key>1 ? '<div class="vKey">'+((v.icon||["⭐"])[0])+' = '+v.key+'</div>' : ''); return el("div", "vBox vWide", t); },
  bar: function(v){ var vals = (v.values||[]).map(Number), max = Math.max.apply(null, vals.concat([1])), step = max<=10 ? 1 : max<=50 ? 5 : max<=100 ? 10 : Math.ceil(max/10/10)*10, top = Math.ceil(max/step)*step, W = 320, Hh = 190, x0 = 34, y0 = 160, cw = (W-x0-10)/vals.length, b = "";
    for(var g=0; g<=top; g+=step){ var y = y0 - g*(y0-20)/top; b += '<line x1="'+x0+'" y1="'+y.toFixed(1)+'" x2="'+(W-6)+'" y2="'+y.toFixed(1)+'" stroke="#ddd"/><text x="'+(x0-4)+'" y="'+(y+3).toFixed(1)+'" font-size="9" text-anchor="end" fill="#444">'+g+'</text>'; }
    vals.forEach(function(val, i){ var h = val*(y0-20)/top, x = x0+i*cw+cw*0.18; b += '<rect x="'+x.toFixed(1)+'" y="'+(y0-h).toFixed(1)+'" width="'+(cw*0.64).toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+COL[i%COL.length]+'"/><text x="'+(x+cw*0.32).toFixed(1)+'" y="'+(y0+13)+'" font-size="9" text-anchor="middle" fill="#222">'+esc((v.labels||[])[i])+'</text>'; });
    b += '<line x1="'+x0+'" y1="'+y0+'" x2="'+(W-6)+'" y2="'+y0+'" stroke="#333" stroke-width="1.5"/><line x1="'+x0+'" y1="16" x2="'+x0+'" y2="'+y0+'" stroke="#333" stroke-width="1.5"/>';
    return el("div", "vBox vWide", '<div class="vPicT">'+esc(v.title||"")+'</div>'+svg(W, Hh, b, "vBar")); },
  pie: function(v){ var vals = (v.values||[]).map(Number), tot = vals.reduce(function(a, c){ return a+c; }, 0) || 1, a0 = -Math.PI/2, b = "", lg = "";
    vals.forEach(function(val, i){ var a1 = a0 + val/tot*2*Math.PI, x0 = 60+50*Math.cos(a0), y0 = 60+50*Math.sin(a0), x1 = 60+50*Math.cos(a1), y1 = 60+50*Math.sin(a1);
      b += vals.length===1 ? '<circle cx="60" cy="60" r="50" fill="'+COL[0]+'"/>' : '<path d="M60 60 L'+x0.toFixed(1)+' '+y0.toFixed(1)+' A50 50 0 '+((a1-a0)>Math.PI?1:0)+' 1 '+x1.toFixed(1)+' '+y1.toFixed(1)+'Z" fill="'+COL[i%COL.length]+'" stroke="#fff" stroke-width="1.5"/>';
      lg += '<rect x="128" y="'+(14+i*18)+'" width="11" height="11" fill="'+COL[i%COL.length]+'"/><text x="144" y="'+(23+i*18)+'" font-size="10" fill="#222">'+esc((v.labels||[])[i])+' ('+val+')</text>'; a0 = a1; });
    return el("div", "vBox vWide", '<div class="vPicT">'+esc(v.title||"")+'</div>'+svg(240, Math.max(122, 22+vals.length*18), b+lg, "vPie")); },
  grid: function(v){ var w = +v.w||5, h = +v.h||5, c = 26, W = (w+1)*c+20, Hh = (h+1)*c+20, b = "";
    for(var x=0;x<=w;x++) b += '<line x1="'+(20+x*c)+'" y1="'+(10)+'" x2="'+(20+x*c)+'" y2="'+(10+h*c)+'" stroke="#ccc"/><text x="'+(20+x*c)+'" y="'+(24+h*c)+'" font-size="9" text-anchor="middle" fill="#333">'+x+'</text>';
    for(var y=0;y<=h;y++) b += '<line x1="20" y1="'+(10+y*c)+'" x2="'+(20+w*c)+'" y2="'+(10+y*c)+'" stroke="#ccc"/><text x="12" y="'+(13+(h-y)*c)+'" font-size="9" text-anchor="middle" fill="#333">'+y+'</text>';
    (v.pts||[]).forEach(function(p){ b += '<text x="'+(20+p.x*c)+'" y="'+(16+(h-p.y)*c)+'" font-size="16" text-anchor="middle">'+esc(p.e)+'</text>'; });
    return el("div", "vBox vWide", svg(W, Hh, b, "vGridC")); },
  blocks: function(v){ var d = el("div", "vBlocks"), add = function(n, cls, lab){ if(!n) return; var g = el("div", "vBg"); for(var i=0;i<n;i++) g.appendChild(el("i", cls)); g.appendChild(el("small", "", lab)); d.appendChild(g); };
    add(+v.th||0, "bTh", "ribu"); add(+v.h||0, "bH", "ratus"); add(+v.t||0, "bT", "puluh"); add(+v.o||0, "bO", "sa"); return d; },
  ar: function(v){ return el("div", "vAr", esc(v.t)); }, jawi: function(v){ return el("div", "vAr", esc(v.t)); },
  img: function(v){ var i = el("img", "vImg"); i.alt = ""; i.onerror = function(){ i.remove(); }; i.src = "media/"+v.src; return i; },
  audio: function(v){ var a = el("audio"); a.controls = true; a.onerror = function(){ a.remove(); }; a.src = "media/"+v.src; return a; }
};
// isometric SVG fallback for 3D shapes
function iso(s){ var f = "#4F7BFF", f2 = "#3a5fd0", f3 = "#2b4bb0", b = "";
  if(/kubus|cube/.test(s)) b = '<polygon points="50,15 85,32 50,49 15,32" fill="'+f+'"/><polygon points="15,32 50,49 50,88 15,71" fill="'+f2+'"/><polygon points="85,32 50,49 50,88 85,71" fill="'+f3+'"/>';
  else if(/kuboid|cuboid/.test(s)) b = '<polygon points="40,18 92,34 60,48 8,32" fill="'+f+'"/><polygon points="8,32 60,48 60,86 8,70" fill="'+f2+'"/><polygon points="92,34 60,48 60,86 92,72" fill="'+f3+'"/>';
  else if(/silinder|cylinder/.test(s)) b = '<rect x="22" y="22" width="56" height="58" fill="'+f2+'"/><ellipse cx="50" cy="80" rx="28" ry="9" fill="'+f2+'"/><ellipse cx="50" cy="22" rx="28" ry="9" fill="'+f+'"/>';
  else if(/kon|cone/.test(s)) b = '<polygon points="50,10 22,78 78,78" fill="'+f2+'"/><ellipse cx="50" cy="78" rx="28" ry="9" fill="'+f3+'"/>';
  else if(/sfera|sphere/.test(s)) b = '<defs><radialGradient id="sg" cx="35%" cy="35%"><stop offset="0" stop-color="#9fb7ff"/><stop offset="1" stop-color="'+f3+'"/></radialGradient></defs><circle cx="50" cy="50" r="38" fill="url(#sg)"/>';
  else b = '<polygon points="50,10 15,78 60,90" fill="'+f2+'"/><polygon points="50,10 60,90 88,70" fill="'+f3+'"/>';
  return svg(100, 100, b, "vShape"); }
function three3d(box, s){ var T = window.THREE; if(!T) return; var w = box.clientWidth || 180, h = 180;
  var r = new T.WebGLRenderer({antialias: true, alpha: true}); r.domElement.dataset.ib3d="no1"; r.setPixelRatio(Math.min(2, window.devicePixelRatio||1)); r.setSize(w, h);
  var sc = new T.Scene(), cam = new T.PerspectiveCamera(40, w/h, 0.1, 100); cam.position.set(2.6, 2.1, 3.2); cam.lookAt(0, 0, 0);
  sc.add(new T.AmbientLight(0xffffff, 0.6)); var dl = new T.DirectionalLight(0xffffff, 0.9); dl.position.set(3, 5, 4); sc.add(dl);
  var g = /kuboid|cuboid/.test(s) ? new T.BoxGeometry(1.8, 1, 1.1) : /kubus|cube/.test(s) ? new T.BoxGeometry(1.3, 1.3, 1.3) : /silinder|cylinder/.test(s) ? new T.CylinderGeometry(0.7, 0.7, 1.5, 40) :
    /kon|cone/.test(s) ? new T.ConeGeometry(0.8, 1.6, 40) : /sfera|sphere/.test(s) ? new T.SphereGeometry(0.9, 40, 24) : new T.ConeGeometry(0.95, 1.4, 4);
  var m = new T.Mesh(g, new T.MeshStandardMaterial({color: 0x4f7bff, roughness: 0.5, metalness: 0.1})); sc.add(m);
  var ed = new T.LineSegments(new T.EdgesGeometry(g), new T.LineBasicMaterial({color: 0x1d2b6b})); m.add(ed);
  box.innerHTML = ""; box.appendChild(r.domElement); r.domElement.style.touchAction = "none";
  var drag = null, ry = 0.6, rx = 0.3, alive = true;
  r.domElement.addEventListener("pointerdown", function(e){ drag = [e.clientX, e.clientY]; });
  window.addEventListener("pointerup", function(){ drag = null; });
  r.domElement.addEventListener("pointermove", function(e){ if(!drag) return; ry += (e.clientX-drag[0])*0.01; rx += (e.clientY-drag[1])*0.01; drag = [e.clientX, e.clientY]; });
  var loop = function(){ if(!alive) return; if(!box.isConnected){ alive = false; r.dispose(); return; } if(!drag) ry += 0.004; m.rotation.set(rx, ry, 0);
    var nw = box.clientWidth || w; if(Math.abs(nw - w) > 2){ w = nw; r.setSize(w, h); cam.aspect = w/h; cam.updateProjectionMatrix(); } r.render(sc, cam); requestAnimationFrame(loop); };
  loop(); }
function render(list, opt){ var wrap = el("div", "vis"); (list||[]).forEach(function(v){ var f = R[v.k]; if(!f) return; try{ wrap.appendChild(f(v, opt||{})); }catch(e){} }); return wrap; }
/* 0.6.7: Form 1 diagrams (angles, triangles, Venn, polygons) come as ready SVG built by the pack generator (trusted pack data) */
R.svg = function(v){ var d = el("div", "vSvg"); d.innerHTML = v.d; return d; };
window.VIS = {render: render, speak: speak, KINDS: Object.keys(R)};
})();
