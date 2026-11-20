/* My Ihsan · Huruf (Letters), in Kalendar › Move.
   The front camera finds the child's body or hands on the phone (MediaPipe pose and hand landmarkers, downloaded once
   and checked against fixed SHA-256 hashes). The picture is drawn in a three.js scene: the camera (or a calm background
   behind the child), a glowing target outline made from the letter, and gold sparkles on success.
   Privacy: frames are read from the <video> element in memory only. Nothing is recorded, saved or sent anywhere.
   Modes: body (Gerak Badan), one-hand BIM fingerspelling, two-hand BSL subset (labelled), and tracing with the index finger. */
(function(){
"use strict";
var H=null, L2=null, E=null, D=null, el0=null, HD=null, KEY="ihsan_huruf";
var MODES=[["body","🧍","Gerak Badan","Body moves","Bentuk huruf dengan badan","Shape letters with your body"],
 ["hand1","✋","Isyarat 1 Tangan","1-hand signs","Abjad jari BIM","BIM fingerspelling"],
 ["hand2","🙌","Isyarat 2 Tangan","2-hand signs","Abjad 2 tangan BSL (UK), bukan BIM","Two-handed BSL (UK) alphabet, not BIM"],
 ["trace","☝️","Surih Huruf","Trace","Surih dengan jari telunjuk","Trace with your index finger"]];
var SETS=[["hij","ا","Hijaiyah","Hijaiyah","ا – ي","ا – ي"],["jawi","چ","Jawi","Jawi","Hijaiyah + چ ڠ ڤ ݢ ڽ ۏ","Hijaiyah + چ ڠ ڤ ݢ ڽ ۏ"],["rumi","A","Rumi A–Z","Rumi A–Z","Abjad Bahasa Melayu","Malay alphabet"]];
var BGS=[["normal","📷","Kamera biasa","Normal camera"],["blur","🌫️","Kabur","Blur"],["pattern","✴️","Corak Islamik","Islamic pattern"],["night","🌙","Langit malam","Night sky"],["grad","🎨","Warna tenang","Calm colours"]];
var SNDS=[["off","🔇","Tutup","Off","Tiada muzik (asal)","No music (default)"],["nature","🍃","Bunyi alam","Nature sounds","Angin dan burung","Wind and birds"],["rebana","🥁","Rebana (perkusi)","Rebana (percussion)","Paluan perlahan, tanpa alat muzik lain","A soft beat, no other instruments"]];
var TOLS=[["Mudah","Easy"],["Biasa","Normal"],["Sukar","Hard"]];
function DEF(){ return {mode:"body", set:"hij", bg:"normal", snd:"off", say:true, rand:false, skel:false, tol:1, best:{}, ok:false}; }
function ld(){ D=H.load(KEY,null)||{}; var d=DEF(); for(var k in d) if(D[k]===undefined) D[k]=d[k]; }
function sv(){ H.save(KEY,D); }
function pick(arr, id){ return arr.filter(function(x){ return x[0]===id; })[0]||arr[0]; }
function bestKey(){ return D.mode+"-"+D.set; }
function TT(a){ return L2(a[0],a[1]); }

// ---------------- letters ----------------
function letters(){ var s=HD.sets[D.set]; if(!s) return [];
  if(D.mode==="hand1") return D.set==="rumi"?s.list.filter(function(L){ return HD.hand1[L[0]]; }):[];
  if(D.mode==="hand2") return D.set==="rumi"?s.list.filter(function(L){ return HD.hand2[L[0]]; }):[];
  if(D.mode==="trace") return s.list.filter(function(L){ return HD.trace[L[0]]; });
  return s.list; }

// ---------------- geometry helpers ----------------
var PI=Math.PI, RAD=PI/180;
function dir(a){ return {x:Math.cos(a*RAD), y:-Math.sin(a*RAD)}; }   // screen y is down
function add(p, v, s){ return {x:p.x+v.x*s, y:p.y+v.y*s}; }
function d2(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
function d3(a,b){ return Math.hypot(a.x-b.x, a.y-b.y, (a.z||0)-(b.z||0)); }
function ang(a,b){ return Math.atan2(-(b.y-a.y), b.x-a.x)/RAD; }
function adiff(a,b){ var d=((a-b)%360+540)%360-180; return Math.abs(d); }
function lerp(a,b,t){ return a+(b-a)*t; }
function clamp(v,a,b){ return v<a?a:v>b?b:v; }
function ease(t){ t=clamp(t,0,1); return t*t*(3-2*t); }
// Catmull-Rom through the points, sampled densely
function smooth(p, n){ if(p.length<3) return p.slice(); var out=[], k=n||10;
  for(var i=0;i<p.length-1;i++){ var p0=p[i-1]||p[i], p1=p[i], p2=p[i+1], p3=p[i+2]||p2;
    for(var j=0;j<k;j++){ var t=j/k, t2=t*t, t3=t2*t;
      out.push({x:0.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3), y:0.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3)}); } }
  out.push(p[p.length-1]); return out; }
function plen(p){ var s=0; for(var i=1;i<p.length;i++) s+=d2(p[i-1],p[i]); return s; }
function along(p, t){ var L=plen(p)*clamp(t,0,1), s=0; for(var i=1;i<p.length;i++){ var l=d2(p[i-1],p[i]); if(s+l>=L){ var u=l?(L-s)/l:0; return {x:lerp(p[i-1].x,p[i].x,u), y:lerp(p[i-1].y,p[i].y,u), a:Math.atan2(p[i].y-p[i-1].y, p[i].x-p[i-1].x)}; } s+=l; }
  var q=p[p.length-1], r=p[p.length-2]||q; return {x:q.x, y:q.y, a:Math.atan2(q.y-r.y,q.x-r.x)}; }

// ---------------- outline drawing ----------------
// parts: {t:"chain", p:[pts], w, front, roots:[[pt,r]], col} · {t:"poly", p:[pts]} · {t:"circ", c, r}
// Pass 1 draws the union of all parts as one clean outline (no joints). Front parts are then redrawn on top
// (outline outside their root circle, inside erased), so a limb or finger that crosses the body stays readable.
var OFF={};
function off(k, w, h){ var c=OFF[k]; if(!c){ c=OFF[k]=document.createElement("canvas"); } if(c.width!==w||c.height!==h){ c.width=w; c.height=h; } return c; }
function shape(c, p, g, stroke){
  if(p.t==="chain"){ c.lineWidth=p.w+2*g; c.beginPath(); p.p.forEach(function(q,i){ if(i) c.lineTo(q.x,q.y); else c.moveTo(q.x,q.y); }); if(p.p.length===1) c.lineTo(p.p[0].x+0.01,p.p[0].y); c.stroke(); }
  else if(p.t==="poly"){ c.beginPath(); p.p.forEach(function(q,i){ if(i) c.lineTo(q.x,q.y); else c.moveTo(q.x,q.y); }); c.closePath(); c.fill(); if(g>0){ c.lineWidth=2*g; c.stroke(); } }
  else if(p.t==="circ"){ c.beginPath(); c.arc(p.c.x,p.c.y,Math.max(0.5,p.r+g),0,2*PI); c.fill(); } }
function figure(ctx, parts, o){ var W=ctx.canvas.width, Hh=ctx.canvas.height, ow=o.ow, base=o.col||"#eafcff";
  var oc=off("fo",W,Hh), c=oc.getContext("2d"); c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,W,Hh); c.lineCap=c.lineJoin="round";
  c.globalCompositeOperation="source-over"; c.strokeStyle=c.fillStyle=base; parts.forEach(function(p){ shape(c,p,ow); });
  c.globalCompositeOperation="destination-out"; c.strokeStyle=c.fillStyle="#000"; parts.forEach(function(p){ shape(c,p,0); });
  parts.forEach(function(p){ if(!p.front) return; c.save(); if(p.roots && p.roots.length){ c.beginPath(); c.rect(0,0,W,Hh); p.roots.forEach(function(r){ c.moveTo(r[0].x+r[1], r[0].y); c.arc(r[0].x, r[0].y, r[1], 0, 2*PI, true); }); c.clip("evenodd"); }
    c.globalCompositeOperation="source-over"; c.strokeStyle=c.fillStyle=p.col||base; shape(c,p,ow); c.restore();
    c.globalCompositeOperation="destination-out"; c.strokeStyle=c.fillStyle="#000"; shape(c,p,0); });
  c.globalCompositeOperation="source-over";
  var fc=off("ff",W,Hh), f=fc.getContext("2d"); f.clearRect(0,0,W,Hh); f.lineCap=f.lineJoin="round"; f.strokeStyle=f.fillStyle=o.fill||"#ffffff"; parts.forEach(function(p){ shape(f,p,0); });
  ctx.save(); ctx.globalAlpha=(o.a==null?1:o.a)*(o.fa==null?0.14:o.fa); ctx.drawImage(fc,0,0);
  ctx.globalAlpha=(o.a==null?1:o.a); ctx.shadowColor=o.glow||"rgba(160,240,255,.9)"; ctx.shadowBlur=o.blur||12; ctx.drawImage(oc,0,0); ctx.shadowBlur=0; ctx.drawImage(oc,0,0); ctx.restore(); }

// ---------------- body model ----------------
function bodyJoints(pose, C, S){ var j={}, a=pose;
  j.ls={x:C.x-0.5*S, y:C.y}; j.rs={x:C.x+0.5*S, y:C.y}; j.head={x:C.x, y:C.y-0.66*S}; j.neck={x:C.x, y:C.y-0.2*S};
  j.lh={x:C.x-0.34*S, y:C.y+1.5*S}; j.rh={x:C.x+0.34*S, y:C.y+1.5*S};
  j.le=add(j.ls,dir(a[0]),0.78*S); j.lw=add(j.le,dir(a[1]),0.74*S); j.lt=add(j.lw,dir(a[1]),0.16*S);
  j.re=add(j.rs,dir(a[2]),0.78*S); j.rw=add(j.re,dir(a[3]),0.74*S); j.rt=add(j.rw,dir(a[3]),0.16*S);
  j.lk=add(j.lh,dir(a[4]),1.05*S); j.la=add(j.lk,dir(a[5]),1.0*S); j.lf=add(j.la,{x:-1,y:0},0.2*S);
  j.rk=add(j.rh,dir(a[6]),1.05*S); j.ra=add(j.rk,dir(a[7]),1.0*S); j.rf=add(j.ra,{x:1,y:0},0.2*S);
  return j; }
function bodyParts(j, S, ok){ var g="#ffd34d", base=null;
  var arm=0.25*S, leg=0.31*S;
  return [{t:"poly", p:[j.ls, j.rs, j.rh, j.lh]}, {t:"chain", p:[j.neck, j.head], w:0.26*S}, {t:"circ", c:j.head, r:0.37*S},
    {t:"chain", p:[j.lh, j.lk, j.la, j.lf], w:leg, front:1, roots:[[j.lh,0.3*S]], col:ok&&ok[4]&&ok[5]?g:base},
    {t:"chain", p:[j.rh, j.rk, j.ra, j.rf], w:leg, front:1, roots:[[j.rh,0.3*S]], col:ok&&ok[6]&&ok[7]?g:base},
    {t:"chain", p:[j.ls, j.le, j.lw, j.lt], w:arm, front:1, roots:[[j.ls,0.24*S]], col:ok&&ok[0]&&ok[1]?g:base},
    {t:"chain", p:[j.rs, j.re, j.rw, j.rt], w:arm, front:1, roots:[[j.rs,0.24*S]], col:ok&&ok[2]&&ok[3]?g:base}]; }
// child's segment angles from pose landmarks (screen points); L = screen left = the child's own left in the mirrored view
var SEG=[[11,13],[13,15],[12,14],[14,16],[23,25],[25,27],[24,26],[26,28]];
function matchBody(P, target){ var tol=[40,28,18][D.tol], ok=[], n=0, good=0, legs=D.tol>0 && [23,24,25,26,27,28].every(function(i){ return P[i] && P[i].v>0.5; });
  SEG.forEach(function(s, i){ var a=P[s[0]], b=P[s[1]]; if(i>=4 && !legs){ ok[i]=true; return; } if(!a||!b||a.v<0.4||b.v<0.4){ ok[i]=false; n++; return; }
    var e=adiff(ang(a,b), target[i]); ok[i]=e<=(i>=4?tol+10:tol); n++; if(ok[i]) good++; });
  return {ok:ok, all:ok.every(Boolean), frac:n?good/n:0, legs:legs}; }

// ---------------- hand model ----------------
// Local units: palm width ≈ 1, wrist at (0,0), y up. Right hand, palm to the camera, as seen in the mirrored view (thumb on the left).
var MCP=[{x:-0.36,y:1.0},{x:-0.12,y:1.06},{x:0.12,y:1.02},{x:0.34,y:0.92}], FL=[[0.5,0.3,0.24],[0.56,0.34,0.25],[0.52,0.32,0.24],[0.4,0.25,0.22]], FW=[0.21,0.22,0.2,0.18];
var CMC={x:-0.32,y:0.28}, THL=[0.42,0.32,0.28];
function ldir(a){ return {x:Math.cos(a*RAD), y:Math.sin(a*RAD)}; }                       // local, y up
function ladd(p,v,s){ return {x:p.x+v.x*s, y:p.y+v.y*s}; }
function chainA(p0, A, Ls){ var p=[p0]; for(var i=0;i<A.length;i++) p.push(ladd(p[i], ldir(A[i]), Ls[i])); return p; }
function handLocal(dr, th){ var F=[], ch=dr.split(""), nE=ch.filter(function(c){ return c==="E"; }).length, sp=nE>=3?[18,0,-18,-24]:[14,-10,-14,-18];
  ch.forEach(function(c, i){ var m=MCP[i], L=FL[i], fan=[3,0,-3,-6][i], p;
    if(c==="e") p=chainA(m,[90+fan,90+fan,90+fan],L);
    else if(c==="E") p=chainA(m,[90+sp[i],90+sp[i],90+sp[i]],L);
    else if(c==="c") p=[m, ladd(m,{x:0,y:1},0.16), ladd(m,{x:0,y:-1},0.06), ladd(m,{x:0.02,y:-1},0.26)];
    else if(c==="h") p=chainA(m,[90,90,-60],[L[0],0.12,0.12]);
    else if(c==="b") p=[m, ladd(m,{x:0,y:1},0.24), ladd(m,{x:0,y:1},0.14), ladd(m,{x:0,y:1},0.0)];
    else if(c==="v") p=chainA(m,[100,150,200],[L[0]*0.85,L[1]*0.85,L[2]*0.85]);
    else if(c==="o") p=chainA(m,[100,160,215],[L[0]*0.85,L[1]*0.85,L[2]*0.85]);
    else if(c==="k") p=chainA(m,[80,80,80],L);
    else if(c==="K") p=chainA(m,[100,100,100],L);
    else p=chainA(m,[90,90,90],L);
    F.push(p); });
  var T, tl=THL;
  if(th==="out") T=chainA(CMC,[160,155,150],tl);
  else if(th==="side") T=chainA(CMC,[112,96,92],[0.38,0.3,0.24]);
  else if(th==="across") T=[CMC,{x:-0.18,y:0.52},{x:0.02,y:0.62},{x:0.2,y:0.62}];
  else if(th==="under") T=[CMC,{x:-0.2,y:0.55},{x:-0.05,y:0.72},{x:0.06,y:0.8}];
  else if(th==="over") T=[CMC,{x:-0.24,y:0.58},{x:-0.08,y:0.76},{x:0.08,y:0.82}];
  else if(th==="betw") T=[CMC,{x:-0.44,y:0.6},{x:-0.36,y:0.88},{x:-0.25,y:1.1}];
  else if(th==="curve") T=chainA(CMC,[175,140,105],tl);
  else if(th==="g") T=chainA(CMC,[120,105,95],tl);
  else if(th==="tipI"||th==="tipM"){ var tg=F[th==="tipI"?0:1][3], mc=ladd(CMC,ldir(140),0.4); T=[CMC, mc, {x:(mc.x+tg.x)/2-0.08, y:(mc.y+tg.y)/2+0.04}, tg]; }
  else T=chainA(CMC,[130,120,110],tl);
  return {F:F, T:T, th:th}; }
// local → screen. o: {O wrist, u px per unit, r rotation (deg, anticlockwise), m mirror ±1}
function hx(o, p){ var x=p.x*o.m*o.u, y=p.y*o.u, c=Math.cos(o.r*RAD), s=Math.sin(o.r*RAD); return {x:o.O.x+(x*c-y*s), y:o.O.y-(x*s+y*c)}; }
function handParts(hl, o, okF){ var g="#ffd34d", P=[];
  var wl={x:-0.3,y:-0.04}, wr={x:0.3,y:-0.04}, pk={x:0.42,y:0.84}, ix={x:-0.44,y:0.96};
  P.push({t:"poly", p:[wl,wr,pk,MCP[3],MCP[2],MCP[1],MCP[0],ix].map(function(q){ return hx(o,q); })});
  var thumb={t:"chain", p:hl.T.map(function(q){ return hx(o,q); }), w:0.25*o.u, front:1, roots:[[hx(o,CMC),0.2*o.u]], col:okF&&okF[4]?g:null};
  if(hl.th==="under") P.push(thumb);
  var order=[3,2,1,0]; if(hl.F[0] && hl.F[1] && hl.F[0][1].x>hl.F[1][1].x) order=[3,2,0,1];
  order.forEach(function(i){ var f=hl.F[i]; P.push({t:"chain", p:f.map(function(q){ return hx(o,q); }), w:FW[i]*o.u, front:1, roots:[[hx(o,MCP[i]),FW[i]*0.75*o.u]], col:okF&&okF[i]?g:null}); });
  if(hl.th!=="under") P.push(thumb);
  return P; }
// 21 landmarks (MediaPipe order) from the local model, for self-checks and tests
function handLms(hl){ var L=[{x:0,y:0}], T=hl.T; L.push(T[0],T[1],T[2],T[3]); hl.F.forEach(function(f){ L.push(f[0],f[1],f[2],f[3]); }); return L; }
function fState(lm, i, tol){ var w=lm[0], m=lm[5+4*i], t=lm[8+4*i], r=d3(t,w)/Math.max(1e-6,d3(m,w)); return r; }
function fOk(c, r, tol){ var Ehi=[1.5,1.6,1.7][tol], Clo=[1.45,1.3,1.2][tol];
  if(c==="E") return r>=Ehi; if(c==="C") return r<=Clo; if(c==="M") return r>1.02 && r<Ehi+[0.25,0.1,0.05][tol]; if(c==="!") return r<Ehi+(tol===0?0.1:0); return true; }
// sc: screen points (for direction), w: 3D points (ratios). Returns per-finger ok (0-3 fingers, 4 thumb) and all.
function matchHand(sc, w, spec, tol){ var ok=[], palm=d3(w[0],w[9])||1, r;
  for(var i=0;i<4;i++){ r=fState(w,i); ok[i]=fOk(spec.m[i], r, tol); }
  var dTI=d3(w[4],w[8])/palm, dOut=d3(w[4],w[5])/palm, dIn=Math.min(d3(w[4],w[9]),d3(w[4],w[13]),d3(w[4],w[17]))/palm, t=spec.t||".";
  var thOk=t==="."?true:t==="T"?dTI<[0.5,0.4,0.32][tol]:t==="O"?dOut>[0.6,0.7,0.8][tol]:t==="X"?dIn<[0.75,0.62,0.5][tol]:t==="S"?dOut<=[0.9,0.8,0.7][tol]:true;
  if(tol===0 && t!=="T" && t!=="O") thOk=true; ok[4]=thOk;
  var extra=true;
  if(tol>0 && spec.sp!=null){ var a=adiff(ang(sc[5],sc[8]), ang(sc[9],sc[12])); extra=extra && (spec.sp?a>[8,10,14][tol]:a<[30,20,14][tol]); }
  if(tol>0 && spec.cr){ var sd={x:sc[5].x-sc[17].x, y:sc[5].y-sc[17].y}; var s1=(sc[8].x-sc[12].x)*sd.x+(sc[8].y-sc[12].y)*sd.y, s2=(sc[5].x-sc[9].x)*sd.x+(sc[5].y-sc[9].y)*sd.y; extra=extra && s1*s2<0; }
  if(spec.o && spec.o!=="."){ var oa=ang(sc[0],sc[9]), lim=[65,50,40][tol], o2=adiff(oa,90)<=lim?"u":adiff(oa,-90)<=lim?"d":(adiff(oa,0)<=90-lim/2||adiff(oa,180)<=90-lim/2)?"s":"?"; extra=extra && o2===spec.o; }
  return {ok:ok, all:extra && ok.every(Boolean), frac:ok.filter(Boolean).length/5}; }
function handMirror(sc){ var up={x:sc[9].x-sc[0].x, y:sc[9].y-sc[0].y}, sd={x:sc[5].x-sc[17].x, y:sc[5].y-sc[17].y}; return (up.x*sd.y-up.y*sd.x)<0?1:-1; }
function isOpen(w){ var n=0; for(var i=0;i<4;i++) if(fState(w,i)>=1.5) n++; return n>=3; }
function isFist(w){ var n=0; for(var i=0;i<4;i++) if(fState(w,i)<=1.45) n++; return n>=3; }
function inPoly(p, P){ var c=false; for(var i=0,j=P.length-1;i<P.length;j=i++){ if(((P[i].y>p.y)!==(P[j].y>p.y)) && (p.x<(P[j].x-P[i].x)*(p.y-P[i].y)/(P[j].y-P[i].y)+P[i].x)) c=!c; } return c; }
function segX(a,b,c,d){ function cr(p,q,r){ return (q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x); } return cr(a,b,c)*cr(a,b,d)<0 && cr(c,d,a)*cr(c,d,b)<0; }
function match2(hands, spec, tol){ if(spec.k==="one"){ for(var i=0;i<hands.length;i++){ var r=matchHand(hands[i].sc, hands[i].w, HD.hand1.C, tol); if(r.all) return {all:true, frac:1}; } return {all:false, frac:hands.length?0.3:0}; }
  if(hands.length<2) return {all:false, frac:hands.length?0.25:0};
  var A=hands[0], B=hands[1], k=[0.6,0.45,0.34][tol];
  for(var z=0;z<2;z++){ var dm=z?B:A, pv=z?A:B, palm=d2(pv.sc[0],pv.sc[9])||1;
    if(spec.k==="tip"){ if(isOpen(pv.w) && fState(dm.w,0)>=1.45 && d2(dm.sc[8], pv.sc[[4,8,12,16,20][spec.f]])<k*palm) return {all:true, frac:1}; }
    else if(spec.k==="fist"){ if(isFist(dm.w) && isFist(pv.w) && dm.sc[0].y<pv.sc[0].y && Math.abs(dm.sc[0].x-pv.sc[0].x)<1.3*palm && pv.sc[0].y-dm.sc[0].y<2.4*palm) return {all:true, frac:1}; }
    else if(spec.k==="palm"){ if(!isOpen(pv.w)) continue; var m=spec.m, fine=true; for(var i2=0;i2<4;i2++) if(!fOk(m[i2], fState(dm.w,i2), tol)) fine=false;
      var cx=(pv.sc[0].x+pv.sc[5].x+pv.sc[17].x+pv.sc[1].x)/4, cy=(pv.sc[0].y+pv.sc[5].y+pv.sc[17].y+pv.sc[1].y)/4, poly=[0,1,5,17].map(function(q){ return {x:cx+(pv.sc[q].x-cx)*1.45, y:cy+(pv.sc[q].y-cy)*1.45}; });
      if(fine && inPoly(dm.sc[8], poly)) return {all:true, frac:1}; }
    else if(spec.k==="cross"){ if(fState(dm.w,0)>=1.4 && fState(pv.w,0)>=1.4 && segX(dm.sc[5],dm.sc[8],pv.sc[5],pv.sc[8])) return {all:true, frac:1}; } }
  return {all:false, frac:0.5}; }

// ---------------- state ----------------
var G={run:false}, box=null, raf=0, GL=null, comp=null, over=null, cw=0, ch=0, dpr=1, video=null, stream=null, lastVT=-1, lastTs=0;
var MP={pose:null, hand:null, fs:null, loading:null};
var TR={pose:null, mask:null, hands:[]};
function vdim(){ if(window.__HURUF_FAKE || !video || !video.videoWidth) return {w:640, h:480}; return {w:video.videoWidth, h:video.videoHeight}; }
function vmap(){ var v=vdim(), sc=Math.max(cw/v.w, ch/v.h); return {vw:v.w, vh:v.h, sc:sc, ox:(cw-v.w*sc)/2, oy:(ch-v.h*sc)/2}; }
function toScr(p, m){ return {x:cw-(m.ox+p.x*m.vw*m.sc), y:m.oy+p.y*m.vh*m.sc, v:p.visibility==null?1:p.visibility}; }
function toNorm(p, m){ return {x:(cw-p.x-m.ox)/(m.vw*m.sc), y:(p.y-m.oy)/(m.vh*m.sc), z:0, visibility:0.99}; }

// ---------------- tracking pack (downloaded once, checked, used offline) ----------------
function simdOk(){ try{ return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11])); }catch(e){ return false; } }
function packFiles(){ var s=simdOk()?1:0; return HD.mp.files.filter(function(f){ return f.simd==null || f.simd===s; }); }
function mfile(k){ return packFiles().filter(function(f){ return f.k===k; })[0]; }
function mpBase(){ if(window.__HURUF_BASE) return window.__HURUF_BASE; try{ var p=H.N.photoDir(); if(p) return p.replace(/photos\/?$/,"")+"huruf/mp/"; }catch(e){} return null; }
function packMB(){ return Math.round(packFiles().reduce(function(s,f){ return s+f.n; },0)/1048576); }
function havePack(){ if(window.__HURUF_BASE) return true; try{ var fs=packFiles(); return H.N.qCount(JSON.stringify(fs.map(function(f){ return "huruf/mp/"+f.f; })))===fs.length; }catch(e){ return false; } }
function canDownload(){ return !!(window.Native && H.N && H.N.qDownload && H.N.photoDir); }
function xhr(url){ return new Promise(function(ok,bad){ var x=new XMLHttpRequest(); x.open("GET",url,true); x.responseType="arraybuffer"; x.onload=function(){ if((x.status===200||x.status===0) && x.response && x.response.byteLength) ok(x.response); else bad(new Error("read")); }; x.onerror=function(){ bad(new Error("read")); }; x.send(); }); }
function hex(buf){ return Array.prototype.map.call(new Uint8Array(buf), function(b){ return ("0"+b.toString(16)).slice(-2); }).join(""); }
function checked(f){ return xhr(mpBase()+f.f).then(function(b){ if(b.byteLength!==f.n) throw new Error("size");
    if(!(window.crypto && crypto.subtle)) return b; return crypto.subtle.digest("SHA-256", b).then(function(h){ if(hex(h)!==f.h) throw new Error("hash"); return b; }); })
  .catch(function(e){ try{ if(!window.__HURUF_BASE) H.N.qDelete("huruf/mp/"+f.f); }catch(x){} throw e; }); }
function loadLib(){ if(window.MPVision) return Promise.resolve();
  return checked(mfile("lib")).then(function(b){ var src="(function(){var module={exports:{}},exports=module.exports;\n"+new TextDecoder().decode(b)+"\n;window.MPVision=module.exports;})();";
    return new Promise(function(ok,bad){ var s=document.createElement("script"); s.src=URL.createObjectURL(new Blob([src],{type:"text/javascript"})); s.onload=function(){ window.MPVision?ok():bad(new Error("lib")); }; s.onerror=function(){ bad(new Error("lib")); }; document.head.appendChild(s); }); }); }
function fileset(){ if(MP.fs) return Promise.resolve(MP.fs);
  return Promise.all([checked(mfile("js")), checked(mfile("wasm"))]).then(function(r){ MP.fs={wasmLoaderPath:URL.createObjectURL(new Blob([r[0]],{type:"text/javascript"})), wasmBinaryPath:URL.createObjectURL(new Blob([r[1]],{type:"application/wasm"}))}; return MP.fs; }); }
function mk(kind, only){ var V=window.MPVision, f=mfile(kind);
  return Promise.all([fileset(), checked(f)]).then(function(r){ var buf=new Uint8Array(r[1]);
    var opt=function(dl){ var o={baseOptions:{modelAssetBuffer:buf, delegate:dl}, runningMode:"VIDEO"}; if(kind==="pose"){ o.numPoses=1; o.outputSegmentationMasks=true; } else { o.numHands=2; o.minHandDetectionConfidence=0.5; } return o; };
    var C=kind==="pose"?V.PoseLandmarker:V.HandLandmarker;
    var cpu=function(){ return C.createFromOptions(r[0], opt("CPU")).then(function(t){ t.__dl="CPU"; return t; }); };
    return only==="CPU"?cpu():C.createFromOptions(r[0], opt("GPU")).then(function(t){ t.__dl="GPU"; return t; }).catch(cpu); }); }
function needPose(){ return D.mode==="body" || D.bg!=="normal"; }
function needHand(){ return D.mode!=="body"; }
function ensureTrackers(){ if(window.__HURUF_FAKE) return Promise.resolve();
  return loadLib().then(function(){ var w=[]; if(needPose() && !MP.pose) w.push(mk("pose").then(function(t){ MP.pose=t; })); if(needHand() && !MP.hand) w.push(mk("hand").then(function(t){ MP.hand=t; })); return Promise.all(w); }); }

// ---------------- tracking each frame ----------------
var maskC=null, maskImg=null, maskF=null;
// 0.5.41: some phones give an empty (all 0) or inside-out mask, which hid the child. Vote each frame: the body (shoulders,
// torso, nose) should be high and the edges low. Inside-out masks are flipped; a mask that stays empty first retries the
// pose tracker on the CPU, then the chosen background is skipped and the plain camera shows.
var MASK={s:{ok:0, inv:0, emp:0}, mode:"ok", cpu:false, told:false};
function maskVote(a, w, h, lm, amax){ function at(x, y){ var xi=clamp(Math.floor(x*w),0,w-1), yi=clamp(Math.floor(y*h),0,h-1); return a[yi*w+xi]; }
  function mid(p, q){ return {x:(p.x+q.x)/2, y:(p.y+q.y)/2, v:Math.min(p.visibility==null?1:p.visibility, q.visibility==null?1:q.visibility)}; }
  var P=[], sh=mid(lm[11],lm[12]), hp=mid(lm[23],lm[24]); if(sh.v>0.5) P.push(sh); if(sh.v>0.5 && hp.v>0.3) P.push(mid(sh,hp)); if(!lm[0].visibility || lm[0].visibility>0.5) P.push(lm[0]);
  if(!P.length) return; var inT=0; P.forEach(function(p){ inT+=at(p.x,p.y); }); inT/=P.length;
  var out=(at(0.03,0.03)+at(0.97,0.03)+at(0.03,0.5)+at(0.97,0.5))/4, S=MASK.s; S.ok*=0.93; S.inv*=0.93; S.emp*=0.93;
  if(amax<0.15) S.emp+=1; else if(inT>0.5 && out<0.4) S.ok+=1; else if(inT<0.4 && out>0.5) S.inv+=1;
  var md=S.emp>S.ok&&S.emp>S.inv&&S.emp>4?"none":S.inv>S.ok&&S.inv>4?"inv":"ok"; MASK.mode=md;
  if(md==="none" && MP.pose && MP.pose.__dl==="GPU" && !MASK.cpu){ MASK.cpu=true; mk("pose","CPU").then(function(t){ var o=MP.pose; MP.pose=t; MASK.s={ok:0,inv:0,emp:0}; MASK.mode="ok"; try{ o.close(); }catch(e){} }).catch(function(){}); }
  if(md==="none" && (MASK.cpu && MP.pose && MP.pose.__dl==="CPU") && !MASK.told){ MASK.told=true; setStatus(L2("Latar belakang tidak disokong pada telefon ini; kamera biasa digunakan.","Backgrounds are not supported on this phone; the plain camera is used.")); } }
function track(now){ var m=vmap();
  if(window.__HURUF_FAKE){ var F=window.__HURUF_FAKE;
    var pl=F.pose?F.pose():null; TR.pose=pl?pl.map(function(p){ return toScr(p,m); }):null; TR.mask=null;
    var hs=F.hands?F.hands():[]; TR.hands=(hs||[]).map(function(h){ return {sc:h.lm.map(function(p){ return toScr(p,m); }), w:h.w||h.lm}; }); return; }
  if(!video || video.readyState<2) return; var vt=video.currentTime; if(vt===lastVT) return; lastVT=vt;
  var ts=Math.max(lastTs+1, Math.round(now)); lastTs=ts; G.fr=(G.fr||0)+1;
  if(MP.pose && (D.mode==="body" || G.fr%2===0)){ try{ MP.pose.detectForVideo(video, ts, function(r){ var lm=r.landmarks && r.landmarks[0]; TR.pose=lm?lm.map(function(p){ return toScr(p,m); }):null;
      if(D.bg!=="normal" && r.segmentationMasks && r.segmentationMasks[0]){ var mk2=r.segmentationMasks[0], a=mk2.getAsFloat32Array(), w=mk2.width, h=mk2.height, amax=0, i, n=w*h;
        for(i=0;i<n;i+=7) if(a[i]>amax) amax=a[i]; if(lm) maskVote(a, w, h, lm, amax);
        if(!maskC){ maskC=document.createElement("canvas"); maskF=document.createElement("canvas"); } if(maskC.width!==w||maskC.height!==h){ maskC.width=maskF.width=w; maskC.height=maskF.height=h; maskImg=null; }
        var cx=maskC.getContext("2d"), inv=MASK.mode==="inv"; if(!maskImg) maskImg=cx.createImageData(w,h); var dd=maskImg.data; for(i=0;i<n;i++){ var v=(inv?1-a[i]:a[i])*255; dd[i*4]=dd[i*4+1]=dd[i*4+2]=dd[i*4+3]=v; } cx.putImageData(maskImg,0,0);
        var fx=maskF.getContext("2d"); fx.clearRect(0,0,w,h); fx.filter="blur(1.5px)"; fx.drawImage(maskC,0,0); fx.filter="none"; TR.mask=maskF; if(GL && GL.mt) GL.mt.needsUpdate=true; }
      else if(D.bg==="normal") TR.mask=null; }); }catch(e){} ts++; lastTs=ts; }
  if(MP.hand && needHand()){ try{ var r=MP.hand.detectForVideo(video, ts); TR.hands=(r.landmarks||[]).map(function(lm,i){ return {sc:lm.map(function(p){ return toScr(p,m); }), w:(r.worldLandmarks&&r.worldLandmarks[i])||lm}; }); }catch(e){ TR.hands=[]; } } }

// ---------------- backgrounds ----------------
var BGC={};
function bgPattern(w,h){ var k="p"+w+"x"+h; if(BGC[k]) return BGC[k]; var c=document.createElement("canvas"); c.width=w; c.height=h; var x=c.getContext("2d");
  var g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,"#0c3b31"); g.addColorStop(1,"#062019"); x.fillStyle=g; x.fillRect(0,0,w,h);
  var s=Math.max(46, Math.min(w,h)/6); x.strokeStyle="rgba(201,166,70,.55)"; x.lineWidth=Math.max(1.2,s/40);
  for(var yy=-s; yy<h+s; yy+=s) for(var xx=-s; xx<w+s; xx+=s){ var cx2=xx+s/2, cy2=yy+s/2, r=s*0.42;
    for(var q=0;q<2;q++){ x.beginPath(); for(var i=0;i<4;i++){ var a=(i*90+q*45+45)*RAD; var px=cx2+Math.cos(a)*r, py=cy2+Math.sin(a)*r; if(i) x.lineTo(px,py); else x.moveTo(px,py); } x.closePath(); x.stroke(); }
    x.beginPath(); x.arc(cx2,cy2,r*0.32,0,2*PI); x.stroke(); }
  BGC[k]=c; return c; }
function bgNight(w,h,t){ var k="n"+w+"x"+h, c=BGC[k]; if(!c){ c=document.createElement("canvas"); c.width=w; c.height=h; var x=c.getContext("2d");
    var g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,"#050b24"); g.addColorStop(1,"#14203f"); x.fillStyle=g; x.fillRect(0,0,w,h);
    var rnd=mul(7); c._st=[]; for(var i=0;i<140;i++){ var sx=rnd()*w, sy=rnd()*h*0.85, sr=rnd()*1.4+0.3; x.fillStyle="rgba(255,255,255,"+(0.35+rnd()*0.5)+")"; x.beginPath(); x.arc(sx,sy,sr,0,2*PI); x.fill(); if(i<18) c._st.push([sx,sy,sr+0.6,rnd()*6]); }
    var mx=w*0.8, my=h*0.16, mr=Math.min(w,h)*0.07; x.fillStyle="#f6e7a8"; x.shadowColor="#f6e7a8"; x.shadowBlur=18; x.beginPath(); x.arc(mx,my,mr,0,2*PI); x.fill(); x.shadowBlur=0;
    x.globalCompositeOperation="destination-out"; x.beginPath(); x.arc(mx+mr*0.42,my-mr*0.18,mr*0.86,0,2*PI); x.fill(); x.globalCompositeOperation="source-over";
    x.fillStyle=g; x.globalCompositeOperation="destination-over"; x.fillRect(0,0,w,h); x.globalCompositeOperation="source-over"; BGC[k]=c; }
  return c; }
function mul(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function drawVid(x, m, filter){ if(!video || !video.videoWidth) return false; x.save(); if(filter) x.filter=filter; x.translate(cw,0); x.scale(-1,1); x.drawImage(video, m.ox, m.oy, m.vw*m.sc, m.vh*m.sc); x.restore(); return true; }
function drawBg(x, m, t){ var b=D.bg;
  if(b==="blur") return drawVid(x, m, "blur("+Math.round(10*dpr)+"px)");
  if(b==="pattern"){ x.drawImage(bgPattern(cw,ch),0,0); return; }
  if(b==="night"){ var c=bgNight(cw,ch,t); x.drawImage(c,0,0); (c._st||[]).forEach(function(s){ var a=0.4+0.6*Math.abs(Math.sin(t*0.0012+s[3])); x.fillStyle="rgba(255,255,240,"+a.toFixed(2)+")"; x.beginPath(); x.arc(s[0],s[1],s[2],0,2*PI); x.fill(); }); return; }
  if(b==="grad"){ var h1=(170+Math.sin(t*0.00012)*25), g=x.createLinearGradient(0,0,cw,ch); g.addColorStop(0,"hsl("+h1.toFixed(0)+",45%,32%)"); g.addColorStop(1,"hsl("+(h1+60).toFixed(0)+",40%,22%)"); x.fillStyle=g; x.fillRect(0,0,cw,ch); return; } }
function vidTex(m, maskOn){ var T=window.THREE, q=GL.qv, mt=q.material;
  if(!GL.vt || GL.vt.image!==video){ if(GL.vt) GL.vt.dispose(); GL.vt=new T.VideoTexture(video); if(T.SRGBColorSpace) GL.vt.colorSpace=T.SRGBColorSpace; GL.vt.minFilter=T.LinearFilter; GL.vt.generateMipmaps=false; mt.map=GL.vt; mt.needsUpdate=true; }
  var rx=cw/(m.vw*m.sc), ry=ch/(m.vh*m.sc); [GL.vt, GL.mt].forEach(function(tx){ if(!tx) return; tx.repeat.set(-rx, ry); tx.offset.set((1+rx)/2, (1-ry)/2); }); // mirrored, cover-fit
  if(maskOn && !GL.mt){ GL.mt=new T.CanvasTexture(TR.mask); GL.mt.minFilter=T.LinearFilter; GL.mt.generateMipmaps=false; GL.mt.repeat.set(-rx, ry); GL.mt.offset.set((1+rx)/2, (1-ry)/2); }
  if(GL.mt && maskOn && GL.mt.image!==TR.mask){ GL.mt.image=TR.mask; GL.mt.needsUpdate=true; }
  var am=maskOn?GL.mt:null; if(mt.alphaMap!==am){ mt.alphaMap=am; mt.needsUpdate=true; } q.visible=true; }
function vidDrawOK(){ // can this phone copy camera frames into a 2D canvas? (needed only for the blurred background)
  if(G.vchk && performance.now()-G.vchk<3000) return G.vok!==false; G.vchk=performance.now(); try{ var c=off("vck",4,4), x=c.getContext("2d"); x.drawImage(video,0,0,4,4); var d=x.getImageData(0,0,4,4).data, s=0; for(var i=0;i<d.length;i+=4) s+=d[i]+d[i+1]+d[i+2]; G.vok=s>0; }catch(e){ G.vok=false; } return G.vok; }
function paintComp(t){ var x=comp.getContext("2d"), m=vmap(); x.setTransform(1,0,0,1,0,0);
  if(GL && GL.qv && video && video.videoWidth && !window.__HURUF_FAKE){ var maskOn=D.bg!=="normal" && !!TR.mask && MASK.mode!=="none"; vidTex(m, maskOn);
    if(maskOn){ x.fillStyle="#0d241a"; x.fillRect(0,0,cw,ch); if(D.bg==="blur" && !vidDrawOK()){ var b0=D.bg; D.bg="grad"; drawBg(x,m,t); D.bg=b0; } else drawBg(x,m,t); } return; }
  if(GL && GL.qv) GL.qv.visible=false;
  // the chosen background appears behind the child once they are detected; until then the plain camera shows
  if(D.bg==="normal" || !TR.mask || MASK.mode==="none"){ if(!drawVid(x,m)){ x.fillStyle="#0d241a"; x.fillRect(0,0,cw,ch); } return; }
  var pc=off("pp",cw,ch), p=pc.getContext("2d"); p.setTransform(1,0,0,1,0,0); p.clearRect(0,0,cw,ch); p.globalCompositeOperation="source-over"; drawVid(p,m);
  // the mask is already feathered (maskF); a canvas filter together with destination-in erased the child on Chromium, so none here
  p.globalCompositeOperation="destination-in"; p.save(); p.translate(cw,0); p.scale(-1,1); p.drawImage(TR.mask, m.ox, m.oy, m.vw*m.sc, m.vh*m.sc); p.restore(); p.globalCompositeOperation="source-over";
  x.fillStyle="#0d241a"; x.fillRect(0,0,cw,ch); drawBg(x,m,t); x.drawImage(pc,0,0); }

// ---------------- three.js scene ----------------
function makeGL(){ var T=window.THREE; if(!T || window.__HURUF_NOGL) return null;
  try{ var r=new T.WebGLRenderer({antialias:false, alpha:false, preserveDrawingBuffer:false}); r.domElement.dataset.ib3d="off"; r.setPixelRatio(1); r.setSize(cw,ch,false);
    var sc=new T.Scene(), cam=new T.OrthographicCamera(-1,1,1,-1,0,10); cam.position.z=5;
    var t1=new T.CanvasTexture(comp), t2=new T.CanvasTexture(over); [t1,t2].forEach(function(t){ if(T.SRGBColorSpace) t.colorSpace=T.SRGBColorSpace; t.minFilter=T.LinearFilter; t.generateMipmaps=false; });
    var q1=new T.Mesh(new T.PlaneGeometry(2,2), new T.MeshBasicMaterial({map:t1, depthTest:false})); sc.add(q1);
    var qv=new T.Mesh(new T.PlaneGeometry(2,2), new T.MeshBasicMaterial({transparent:true, depthTest:false})); qv.position.z=0.05; qv.visible=false; sc.add(qv);
    var q2=new T.Mesh(new T.PlaneGeometry(2,2), new T.MeshBasicMaterial({map:t2, transparent:true, depthTest:false})); q2.position.z=0.1; sc.add(q2);
    var N=160, pos=new Float32Array(N*3), sp=document.createElement("canvas"); sp.width=sp.height=32; var sx=sp.getContext("2d"), gr=sx.createRadialGradient(16,16,0,16,16,16); gr.addColorStop(0,"rgba(255,244,200,1)"); gr.addColorStop(0.4,"rgba(255,211,77,.9)"); gr.addColorStop(1,"rgba(255,211,77,0)"); sx.fillStyle=gr; sx.fillRect(0,0,32,32);
    var geo=new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos,3)); var pm=new T.PointsMaterial({size:18*dpr, sizeAttenuation:false, map:new T.CanvasTexture(sp), transparent:true, depthTest:false, blending:T.AdditiveBlending, opacity:0});
    var pts=new T.Points(geo, pm); pts.position.z=0.2; sc.add(pts);
    r.domElement.className="hfGL"; return {r:r, sc:sc, cam:cam, t1:t1, t2:t2, qv:qv, pts:pts, pos:pos, vel:new Float32Array(N*3), N:N, life:0}; }catch(e){ return null; } }
function burst(x, y){ if(!GL) return; var P=GL.pos, V=GL.vel, nx=x/cw*2-1, ny=1-y/ch*2; for(var i=0;i<GL.N;i++){ P[i*3]=nx; P[i*3+1]=ny; P[i*3+2]=0; var a=Math.random()*2*PI, s=0.4+Math.random()*1.3; V[i*3]=Math.cos(a)*s*ch/cw; V[i*3+1]=Math.sin(a)*s+0.5; } GL.life=1.4; GL.pts.material.opacity=1; GL.pts.geometry.attributes.position.needsUpdate=true; }
function glFrame(dt){ if(!GL) return; if(GL.life>0){ GL.life-=dt; var P=GL.pos, V=GL.vel; for(var i=0;i<GL.N;i++){ P[i*3]+=V[i*3]*dt; P[i*3+1]+=V[i*3+1]*dt; V[i*3+1]-=1.6*dt; } GL.pts.material.opacity=clamp(GL.life/0.8,0,1); GL.pts.geometry.attributes.position.needsUpdate=true; }
  GL.t1.needsUpdate=true; GL.t2.needsUpdate=true; GL.r.render(GL.sc, GL.cam); }

// ---------------- sizing ----------------
function size(){ if(!box) return; var r=box.getBoundingClientRect(); dpr=Math.min(1.5, window.devicePixelRatio||1); var w=Math.max(160,Math.round(r.width*dpr)), h=Math.max(160,Math.round(r.height*dpr));
  if(w===cw && h===ch) return; cw=w; ch=h; comp.width=over.width=cw; comp.height=over.height=ch; if(GL){ GL.r.setSize(cw,ch,false); GL.pts.material.size=18*dpr; GL.t1.dispose(); GL.t2.dispose(); /* a resized canvas needs a new GPU texture */ } G.traceKey=null; }

// ---------------- rounds ----------------
var bag=[];
function nextLetter(){ var L=letters(); if(!L.length) return null;
  if(D.rand){ if(!bag.length){ bag=L.map(function(x,i){ return i; }); for(var i=bag.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=bag[i]; bag[i]=bag[j]; bag[j]=t; } if(G.cur && L[bag[bag.length-1]][0]===G.cur[0] && bag.length>1){ var t2=bag[0]; bag[0]=bag[bag.length-1]; bag[bag.length-1]=t2; } } return L[bag.pop()]; }
  G.idx=(G.idx==null?-1:G.idx)+1; if(G.idx>=L.length){ G.idx=0; G.lap=true; } return L[G.idx]; }
function startRound(L){ G.cur=L||nextLetter(); G.ph="intro"; G.t0=performance.now(); G.hold=0; G.hint=false; G.win=null; G.traceKey=null; G.paintN=0; G.cov=0; G.fin=null; setMsg(""); if(!G.cur){ unsupported(); } updHud(); }
function unsupported(){ G.ph="none"; var m=D.mode==="hand1"||D.mode==="hand2";
  setMsg('<div class="hfMsgC"><div class="hfMsgI">'+(m?"✋":"🔤")+'</div><b>'+E(m?L2("Isyarat tangan untuk huruf "+(D.set==="jawi"?"Jawi":"Hijaiyah")+" belum tersedia","Hand signs for "+(D.set==="jawi"?"Jawi":"Hijaiyah")+" letters are not available yet"):L2("Tiada huruf","No letters"))+'</b><div class="small mut">'+E(L2("Ia menunggu semakan guru bahasa isyarat. Cuba Rumi A–Z, atau mod Gerak Badan dan Surih Huruf.","They are waiting for a sign-language teacher's review. Try Rumi A–Z, or the Body moves and Trace modes."))+'</div><button class="btn" id="hfToRumi">A '+E(L2("Guna Rumi A–Z","Use Rumi A–Z"))+'</button></div>');
  var b=box.querySelector("#hfToRumi"); if(b) b.onclick=function(){ D.set="rumi"; sv(); refreshCtl(); bag=[]; G.idx=null; startRound(); }; }
function win(){ G.ph="win"; G.t0=performance.now(); G.score=(G.score||0)+1; var bk=bestKey(); if((D.best[bk]||0)<G.score){ D.best[bk]=G.score; sv(); }
  var pr=HD.praise[Math.floor(Math.random()*HD.praise.length)]; G.win=pr; var c=G.center||{x:cw/2,y:ch/2}; burst(c.x,c.y);
  try{ if(H.N && H.N.vibrate) H.N.vibrate(40); }catch(e){}
  sayLetter(G.cur, function(){ if(D.say && G.run) say(pr[0],"ms"); }); updHud(); }

// ---------------- speech and recordings ----------------
function say(t, lang, cb){ var done=false, fin=function(){ if(done) return; done=true; if(cb) cb(); };
  if(window.Native && H.N && H.N.speak){ var td=function(r){ if(r && r.stopped) return; H.off("ttsdone",td); fin(); }; H.on("ttsdone",td); try{ H.N.speak(t, lang); }catch(e){ fin(); } setTimeout(function(){ H.off("ttsdone",td); fin(); }, 4500); return; }
  try{ var ss=window.speechSynthesis; if(!ss){ fin(); return; } ss.cancel(); var u=new SpeechSynthesisUtterance(t); u.lang=lang==="ar"?"ar-SA":lang==="en"?"en-GB":"ms-MY"; u.rate=lang==="ar"?0.75:0.95; u.onend=fin; u.onerror=fin; ss.speak(u); setTimeout(fin, 4500); }catch(e){ fin(); } }
function recUrls(L){ var u=[], f=D.set+"/"+L[0]+".mp3"; try{ var b=mpBase(); if(b && HD.audioBase) u.push(b.replace(/mp\/$/,"")+"audio/"+f); }catch(e){} u.push("huruf/audio/"+f); return u; }
function sayLetter(L, cb){ if(!D.say || !L){ if(cb) cb(); return; } var urls=recUrls(L), i=0;
  var tts=function(){ say(L[3], L[4], cb); };
  var next=function(){ if(i>=urls.length){ tts(); return; } var a=new Audio(), done=false; a.src=urls[i++]; a.onended=function(){ if(!done){ done=true; if(cb) cb(); } }; a.onerror=function(){ if(!done){ done=true; next(); } }; var pl=a.play(); if(pl && pl.catch) pl.catch(function(){ if(!done){ done=true; next(); } }); };
  next(); }

// ---------------- background sound (made in code, no files) ----------------
var AU={c:null, g:null, tm:[], nodes:[]};
function sndStop(){ AU.tm.forEach(function(t){ clearTimeout(t); clearInterval(t); }); AU.tm=[]; AU.nodes.forEach(function(n){ try{ n.stop && n.stop(); }catch(e){} try{ n.disconnect(); }catch(e){} }); AU.nodes=[]; }
function sndStart(){ sndStop(); if(D.snd==="off" || !G.run) return; var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  try{ var c=AU.c||(AU.c=new AC()); if(c.resume) c.resume(); var g=c.createGain(); g.gain.setValueAtTime(0,c.currentTime); g.gain.linearRampToValueAtTime(1,c.currentTime+1.2); g.connect(c.destination); AU.nodes.push(g);
    var nb=c.createBuffer(1, c.sampleRate*2, c.sampleRate), nd=nb.getChannelData(0), last=0; for(var i=0;i<nd.length;i++){ var w=Math.random()*2-1; last=(last+0.02*w)/1.02; nd[i]=last*3.5; }
    if(D.snd==="nature"){ var src=c.createBufferSource(); src.buffer=nb; src.loop=true; var lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=650; var ng=c.createGain(); ng.gain.value=0.05;
      var lfo=c.createOscillator(), lg=c.createGain(); lfo.frequency.value=0.09; lg.gain.value=0.025; lfo.connect(lg); lg.connect(ng.gain); src.connect(lp); lp.connect(ng); ng.connect(g); src.start(); lfo.start(); AU.nodes.push(src,lfo,lp,ng,lg);
      var bird=function(){ if(!G.run) return; var t=c.currentTime, n=2+Math.floor(Math.random()*3), f0=2300+Math.random()*900; for(var k=0;k<n;k++){ var o=c.createOscillator(), og=c.createGain(), s=t+k*0.16; o.frequency.setValueAtTime(f0,s); o.frequency.exponentialRampToValueAtTime(f0*1.45,s+0.1); og.gain.setValueAtTime(0,s); og.gain.linearRampToValueAtTime(0.025,s+0.02); og.gain.linearRampToValueAtTime(0,s+0.12); o.connect(og); og.connect(g); o.start(s); o.stop(s+0.14); }
        AU.tm.push(setTimeout(bird, 3000+Math.random()*5000)); }; AU.tm.push(setTimeout(bird, 1800)); }
    else { var bpm=84, step=60/bpm/2, pat=[1,0,2,2,1,0,2,0], k2=0, nt=c.currentTime+0.2;
      var hit=function(type, t){ if(type===1){ var o=c.createOscillator(), og=c.createGain(); o.type="sine"; o.frequency.setValueAtTime(110,t); o.frequency.exponentialRampToValueAtTime(52,t+0.3); og.gain.setValueAtTime(0.16,t); og.gain.exponentialRampToValueAtTime(0.001,t+0.4); o.connect(og); og.connect(g); o.start(t); o.stop(t+0.42); }
        else { var s2=c.createBufferSource(); s2.buffer=nb; var bp=c.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=1900; bp.Q.value=1.2; var sg=c.createGain(); sg.gain.setValueAtTime(0.09,t); sg.gain.exponentialRampToValueAtTime(0.001,t+0.09); s2.connect(bp); bp.connect(sg); sg.connect(g); s2.start(t, Math.random()); s2.stop(t+0.1); } };
      AU.tm.push(setInterval(function(){ if(!G.run) return; while(nt<c.currentTime+0.15){ var ty=pat[k2%pat.length]; if(ty) hit(ty,nt); nt+=step; k2++; } }, 50)); } }catch(e){} }

// ---------------- camera ----------------
function camStart(){ if(window.__HURUF_FAKE) return Promise.resolve();
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error("nocam"));
  return navigator.mediaDevices.getUserMedia({video:{facingMode:"user", width:{ideal:640}, height:{ideal:480}}, audio:false}).then(function(s){ stream=s;
    if(!video){ video=document.createElement("video"); video.setAttribute("playsinline",""); video.muted=true; }
    video.srcObject=s; var p=video.play(); return p && p.catch?p.catch(function(){}):null; }); }
function camStop(){ if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream=null; } if(video){ try{ video.pause(); }catch(e){} video.srcObject=null; } lastVT=-1; }
function permThen(go){ if(window.__HURUF_FAKE || !window.Native || !H.N || !H.N.hasPerm){ go(); return; }
  if(H.N.hasPerm("camera")){ go(); return; }
  var hp=function(p){ if(p.which!=="camera") return; H.off("perm",hp); if(p.granted) go(); else { setStatus(L2("Perlu kebenaran kamera untuk bermain.","Camera permission is needed to play.")); refreshCtl(); } };
  H.on("perm",hp); H.N.requestPerm("camera"); }

// ---------------- start / stop ----------------
function parentSheet(onOk){ var ov=H.showSheet("🔒 "+E(L2("Untuk ibu bapa","For parents")),
  '<div class="hfPar"><p>📷 '+E(L2("Huruf guna kamera depan untuk melihat kedudukan badan dan tangan anak.","Letters uses the front camera to see where your child's body and hands are."))+'</p>'+
  '<p>📱 '+E(L2("Semuanya diproses di dalam telefon ini. Tiada video atau gambar dirakam, disimpan atau dihantar ke mana-mana.","Everything is processed on this phone. No video or picture is recorded, saved or sent anywhere."))+'</p>'+
  '<p>⬇️ '+E(L2("Kali pertama sahaja, aplikasi memuat turun pakej penjejak (≈ "+packMB()+" MB): model MediaPipe dari pelayan Google dan pustakanya dari jsDelivr. Fail disemak sebelum digunakan. Tiada data anak dihantar.","The first time only, the app downloads the tracking pack (≈ "+packMB()+" MB): MediaPipe models from Google's server and the library from jsDelivr. The files are checked before use. No data about your child is sent."))+'</p>'+
  '<p>⏹ '+E(L2("Kamera berhenti apabila anda tekan Henti, keluar dari halaman ini atau menutup aplikasi.","The camera stops when you press Stop, leave this page or close the app."))+'</p>'+
  '<p>👀 '+E(L2("Sila awasi anak dan pastikan ruang lapang yang selamat untuk bergerak.","Please supervise your child and make sure there is safe, clear space to move."))+'</p>'+
  (onOk?'<div class="btns"><button class="btn" id="hfParOk">✅ '+E(L2("Faham, teruskan","I understand, continue"))+'</button><button class="btn alt" id="hfParNo">'+E(L2("Batal","Cancel"))+'</button></div>':'')+'</div>');
  if(onOk){ ov.querySelector("#hfParOk").onclick=function(){ D.ok=true; sv(); H.closeOverlay(); onOk(); }; ov.querySelector("#hfParNo").onclick=function(){ H.closeOverlay(); }; } }
function dlSheet(onDone){ var ov=H.showSheet("⬇️ "+E(L2("Pakej penjejak","Tracking pack")),
  '<div class="hfPar"><p>'+E(L2("Muat turun sekali sahaja, kira-kira "+packMB()+" MB. Guna Wi-Fi jika boleh.","A one-time download of about "+packMB()+" MB. Use Wi-Fi if you can."))+'</p><div class="hfBar"><i id="hfDlBar"></i></div><div class="small mut" id="hfDlTx"></div>'+
  '<div class="btns"><button class="btn" id="hfDlGo">⬇️ '+E(L2("Muat turun","Download"))+'</button><button class="btn alt" id="hfDlNo">'+E(L2("Nanti","Later"))+'</button></div></div>');
  var go=ov.querySelector("#hfDlGo"), bar=ov.querySelector("#hfDlBar"), tx=ov.querySelector("#hfDlTx");
  ov.querySelector("#hfDlNo").onclick=function(){ H.closeOverlay(); };
  go.onclick=function(){ go.disabled=true; tx.textContent=L2("Memulakan…","Starting…"); var fs=packFiles(), id="huruf"+Date.now();
    var h=function(r){ if(r.id!==id) return; bar.style.width=Math.round(100*r.done/Math.max(1,r.total))+"%"; tx.textContent=r.done+" / "+r.total;
      if(r.end){ H.off("qdl",h); if(!r.fail && r.done===r.total){ H.closeOverlay(); onDone(); } else { tx.textContent=L2("Muat turun tidak lengkap. Semak internet dan cuba lagi.","The download did not finish. Check the internet and try again."); go.disabled=false; } } };
    H.on("qdl",h); H.N.qDownload(id, JSON.stringify(fs.map(function(f){ return {u:f.u, f:"huruf/mp/"+f.f}; }))); }; }
var WL=null;
function awake(on){ try{ if(H.N && H.N.keepAwake) H.N.keepAwake(!!on); }catch(e){}
  try{ if(on && navigator.wakeLock && !WL){ navigator.wakeLock.request("screen").then(function(l){ if(G.run) WL=l; else l.release(); }).catch(function(){}); } else if(!on && WL){ WL.release(); WL=null; } }catch(e){} }
function pause(){ if(!G.run) return; if(!G.paused){ G.paused=true; G.pt=performance.now(); cancelAnimationFrame(raf); sndStop(); try{ if(video) video.pause(); }catch(e){}
    setMsg('<div class="hfMsgC"><div class="hfMsgI">⏸</div><b>'+E(L2("Dijeda","Paused"))+'</b></div>'); }
  else { G.paused=false; G.t0+=performance.now()-(G.pt||performance.now()); try{ if(video){ var pr=video.play(); if(pr&&pr.catch) pr.catch(function(){}); } }catch(e){} setMsg(""); sndStart(); lastT=performance.now(); cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); }
  refreshCtl(); }
function start(){ if(G.run) return; if(!D.ok){ parentSheet(start); return; }
  if(!window.__HURUF_FAKE && !havePack()){ if(canDownload()) dlSheet(start); else setStatus(L2("Huruf berfungsi dalam aplikasi telefon.","Letters works in the phone app.")); return; }
  permThen(function(){ setStatus(L2("Menyediakan kamera…","Starting the camera…")); G.run=true; G.paused=false; awake(true); MASK.s={ok:0,inv:0,emp:0}; MASK.mode="ok"; refreshCtl();
    Promise.all([camStart(), ensureTrackers()]).then(function(){ if(!G.run){ camStop(); return; } G.score=0; G.idx=null; bag=[]; startRound(); sndStart(); lastT=performance.now(); cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); refreshCtl(); })
    .catch(function(e){ G.run=false; awake(false); camStop(); refreshCtl(); var m=String(e&&e.message||e);
      setStatus(/hash|size|read|lib/.test(m)?L2("Pakej penjejak rosak. Tekan Mula untuk memuat turun semula.","The tracking pack is damaged. Press Start to download it again."):/nocam|NotAllowed|Permission/i.test(m)?L2("Kamera tidak dapat dibuka.","The camera could not be opened."):L2("Tidak dapat bermula. Cuba lagi.","Could not start. Try again.")); }); }); }
function stop(){ G.run=false; G.paused=false; awake(false); if(GL && GL.qv) GL.qv.visible=false; cancelAnimationFrame(raf); camStop(); sndStop(); TR.pose=null; TR.hands=[]; TR.mask=null; G.ph="none"; setMsg(""); refreshCtl(); updHud(); setStatus(L2("Tekan ▶ Mula","Press ▶ Start"));
  if(comp){ var x=over.getContext("2d"); x.clearRect(0,0,cw,ch); var c=comp.getContext("2d"); c.fillStyle="#0d241a"; c.fillRect(0,0,cw,ch); idleArt(); if(GL) glFrame(0); } }

// ---------------- per-frame ----------------
var lastT=0;
function loop(now){ if(!G.run || G.paused) return; if(!el0 || !document.body.contains(box)){ stop(); return; } raf=requestAnimationFrame(loop);
  var dt=Math.min(0.1,(now-lastT)/1000); lastT=now; if((G.fc=(G.fc||0)+1)%20===0) fitRun(); size(); track(now); paintComp(now); var x=over.getContext("2d"); x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,cw,ch);
  if(D.skel) skeleton(x); if(G.cur) play(x, now, dt); glFrame(dt); }
function skeleton(x){ x.save(); x.strokeStyle="rgba(120,230,255,.9)"; x.fillStyle="#7fe6ff"; x.lineWidth=2.2*dpr; x.lineCap="round";
  var P=TR.pose; if(P){ [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]].forEach(function(s){ var a=P[s[0]], b=P[s[1]]; if(a&&b&&a.v>0.4&&b.v>0.4){ x.beginPath(); x.moveTo(a.x,a.y); x.lineTo(b.x,b.y); x.stroke(); } }); if(P[0]&&P[0].v>0.4){ x.beginPath(); x.arc(P[0].x,P[0].y,5*dpr,0,2*PI); x.fill(); } }
  TR.hands.forEach(function(h){ var s=h.sc; [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]].forEach(function(q){ x.beginPath(); x.moveTo(s[q[0]].x,s[q[0]].y); x.lineTo(s[q[1]].x,s[q[1]].y); x.stroke(); }); });
  x.restore(); }
function glyphFont(L, px){ return (HD.sets[D.set].rtl?'"ScheherazadeL","AmiriL",serif':'"IhsanDisplay",Georgia,serif'); }
function drawGlyph(x, L, cx, cy, sz, a, col){ x.save(); x.globalAlpha=a; x.font=(HD.sets[D.set].rtl?"":"700 ")+Math.round(sz)+"px "+glyphFont(L); x.textAlign="center"; x.textBaseline="middle"; x.fillStyle=col||"#ffffff"; x.shadowColor="rgba(255,211,77,.85)"; x.shadowBlur=18*dpr; x.fillText(L[1],cx,cy+(HD.sets[D.set].rtl?-sz*0.08:0)); x.restore(); }
function play(x, now, dt){ var L=G.cur, t=(now-G.t0)/1000, intro=G.ph==="intro", k=intro?ease((t-1.0)/0.7):1, a=intro?k:1;
  if(intro && t>1.7){ G.ph="play"; G.t0=now; G.playT=now; }
  var res=null, mode=D.mode, gold=G.ph==="win";
  // build the target outline, check the match
  if(mode==="body") res=playBody(x, L, a, k, gold);
  else if(mode==="hand1") res=playHand1(x, L, a, k, gold);
  else if(mode==="hand2") res=playHand2(x, L, a, k, gold);
  else res=playTrace(x, L, a, k, gold, dt);
  // the real letter first, then it fades into the outline
  if(intro){ var c=G.center||{x:cw/2,y:ch/2}, sz=Math.min(cw,ch)*0.62; drawGlyph(x, L, cw/2+(c.x-cw/2)*k, ch/2+(c.y-ch/2)*k, sz*(1+0.15*k), 1-k); }
  else { badge(x, L); }
  if(G.ph==="play" && res){ if(res.all){ G.hold+=dt; if(G.hold>=(mode==="trace"?0:0.5)) win(); } else G.hold=Math.max(0,G.hold-dt*2);
    var pt=(now-G.playT)/1000; if(pt>20 && !G.hint){ G.hint=true; } }
  if(G.ph==="win"){ var wt=(now-G.t0)/1000; praiseArt(x, wt); if(wt>2.1) startRound(); }
  if(G.hint && G.ph==="play") hintArt(x);
  status(res); }
function badge(x, L){ var s=Math.round(Math.min(cw,ch)*0.1); x.save(); x.fillStyle="rgba(5,20,14,.55)"; var w=s*1.5; rr(x, cw/2-w/2, 8*dpr, w, s*1.18, 12*dpr); x.fill(); x.restore(); drawGlyph(x, L, cw/2, 8*dpr+s*0.6, s*0.86, 1); }
function rr(x, X, Y, w, h, r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }
function praiseArt(x, t){ var pr=G.win; if(!pr) return; var a=clamp(t*3,0,1)*clamp((2.1-t)*3,0,1), s=Math.min(cw,ch)*0.1*(1+0.08*Math.sin(t*6));
  x.save(); x.globalAlpha=a; x.textAlign="center"; x.textBaseline="middle"; x.font="800 "+Math.round(s)+"px system-ui,sans-serif"; var mw=x.measureText(pr[0]+" ✨").width; if(mw>cw*0.9){ s=s*cw*0.9/mw; x.font="800 "+Math.round(s)+"px system-ui,sans-serif"; } x.fillStyle="#ffd34d"; x.shadowColor="rgba(0,0,0,.6)"; x.shadowBlur=10*dpr; x.fillText(pr[0]+" ✨", cw/2, ch*0.82);
  if(H.S && H.S.lang==="en"){ x.font="600 "+Math.round(s*0.42)+"px system-ui,sans-serif"; x.fillStyle="#fff"; x.fillText(pr[1], cw/2, ch*0.82+s*0.8); } x.restore(); }
function hintArt(x){ var s=Math.round(Math.min(cw,ch)*0.045); x.save(); x.textAlign="center"; x.font="700 "+s+"px system-ui,sans-serif"; x.fillStyle="rgba(5,20,14,.6)"; var tx=L2("Cuba lagi! Hampir berjaya 💪","Keep trying! Almost there 💪"), w=x.measureText(tx).width+s*1.4; rr(x, cw/2-w/2, ch-s*2.6, w, s*1.9, s*0.9); x.fill(); x.fillStyle="#fff"; x.textBaseline="middle"; x.fillText(tx, cw/2, ch-s*1.65); x.restore(); }
function dotsArt(x, j, S, dots, a){ if(!dots) return; var pos=dots[0], n=+dots[1]||1, y=pos==="a"?j.head.y-0.95*S:pos==="b"?Math.max(j.la.y,j.ra.y)+0.55*S:j.lh.y-0.1*S, cx=pos==="m"?j.lh.x-0.7*S:j.head.x;
  x.save(); x.globalAlpha=a; x.fillStyle="#ffd34d"; x.shadowColor="#ffd34d"; x.shadowBlur=14*dpr;
  var P=n===1?[[0,0]]:n===2?[[-0.32,0],[0.32,0]]:[[-0.32,0.16],[0.32,0.16],[0,-0.26]]; if(pos==="b") P=P.map(function(q){ return [q[0],-q[1]]; });
  P.forEach(function(q){ x.beginPath(); x.arc(cx+q[0]*S, y+q[1]*S, 0.17*S, 0, 2*PI); x.fill(); }); x.restore(); }
function playBody(x, L, a, k, gold){ var P=TR.pose, C, S;
  var seen=P && P[11] && P[12] && P[11].v>0.5 && P[12].v>0.5;
  if(seen){ var c={x:(P[11].x+P[12].x)/2, y:(P[11].y+P[12].y)/2}, s=Math.max(20*dpr, d2(P[11],P[12])); G.bC=G.bC?{x:lerp(G.bC.x,c.x,0.25), y:lerp(G.bC.y,c.y,0.25)}:c; G.bS=G.bS?lerp(G.bS,s,0.2):s; }
  C=G.bC||{x:cw/2, y:ch*0.3}; S=G.bS||Math.min(cw*0.2, ch*0.12);
  var res=seen?matchBody(P, L[5]):null; var j=bodyJoints(L[5], C, S); G.center={x:C.x, y:C.y+0.6*S};
  figure(x, bodyParts(j, S, gold?[1,1,1,1,1,1,1,1]:res&&res.ok), {ow:Math.max(2,0.07*S), a:a, col:gold?"#ffd34d":"#eafcff", glow:gold?"rgba(255,211,77,1)":null, blur:gold?26*dpr:12*dpr});
  dotsArt(x, j, S, L[6], a);
  G.st=!seen?L2("🔍 Berdiri depan kamera, 2 langkah ke belakang","🔍 Stand in front of the camera, 2 steps back"):(D.tol>0 && res && !res.legs)?L2("🦵 Undur sedikit supaya kaki kelihatan","🦵 Step back a little so your feet show"):res&&res.frac>=0.6&&!res.all?L2("✨ Hampir!","✨ Almost!"):L2("🧍 Ikut bentuk bercahaya","🧍 Copy the glowing shape");
  return res; }
function handTarget(spec, sc){ var hl=handLocal(spec.d, spec.th), o;
  if(sc){ var u=d2(sc[0],sc[9])/1.067, m=handMirror(sc); G.hO=G.hO?{x:lerp(G.hO.x,sc[0].x,0.3), y:lerp(G.hO.y,sc[0].y,0.3)}:{x:sc[0].x,y:sc[0].y}; G.hU=G.hU?lerp(G.hU,u,0.25):u; G.hM=m; }
  var M=G.hM||1, rot=spec.o==="s"?90*M:spec.o==="d"?180:0;
  o={O:G.hO||{x:cw*0.55, y:ch*0.86}, u:G.hU||Math.min(cw,ch)*0.21, r:rot, m:M}; return {hl:hl, o:o}; }
function mvArt(x, spec, o, a){ if(!spec.mv) return; var t=(performance.now()%1600)/1600, tip=hx(o, {x:-0.36, y:2.6}), s=o.u*0.9, path=spec.mv==="J"?[{x:0,y:0},{x:0,y:0.7},{x:-0.25,y:1},{x:-0.5,y:0.8}]:[{x:-0.5,y:0},{x:0.5,y:0},{x:-0.5,y:1},{x:0.5,y:1}];
  var pts=path.map(function(q){ return {x:tip.x+q.x*s, y:tip.y-1.2*s+q.y*s}; }); x.save(); x.globalAlpha=a*0.9; x.strokeStyle="#ffd34d"; x.setLineDash([6*dpr,6*dpr]); x.lineWidth=3*dpr; x.beginPath(); pts.forEach(function(q,i){ if(i) x.lineTo(q.x,q.y); else x.moveTo(q.x,q.y); }); x.stroke(); x.setLineDash([]);
  var p=along(pts, t); x.fillStyle="#ffd34d"; x.beginPath(); x.arc(p.x,p.y,6*dpr,0,2*PI); x.fill(); x.restore(); }
function bestHand(){ var hs=TR.hands; if(!hs.length) return null; var b=hs[0]; hs.forEach(function(h){ if(d2(h.sc[0],h.sc[9])>d2(b.sc[0],b.sc[9])) b=h; }); return b; }
function playHand1(x, L, a, k, gold){ var spec=HD.hand1[L[0]], h=bestHand(), tg=handTarget(spec, h&&h.sc), res=h?matchHand(h.sc, h.w, spec, D.tol):null;
  G.center=hx(tg.o,{x:0,y:1.4});
  figure(x, handParts(tg.hl, tg.o, gold?[1,1,1,1,1]:res&&res.ok), {ow:Math.max(2,0.06*tg.o.u), a:a, col:gold?"#ffd34d":"#eafcff", glow:gold?"rgba(255,211,77,1)":null, blur:gold?26*dpr:12*dpr});
  mvArt(x, spec, tg.o, a);
  G.st=!h?L2("✋ Tunjukkan tapak tangan ke kamera","✋ Show your palm to the camera"):res.frac>=0.6&&!res.all?L2("✨ Hampir!","✨ Almost!"):spec.mv?L2("✋ Buat bentuk, kemudian lukis "+spec.mv+" di udara","✋ Make the shape, then draw "+spec.mv+" in the air"):L2("✋ Ikut bentuk tangan","✋ Copy the hand shape");
  return res; }
function aimHand(dr, th, tipIdx, target, from, u, m){ var hl=handLocal(dr, th), tip=hl.F[tipIdx][3], la=Math.atan2(tip.y, tip.x*m)/RAD, v={x:target.x-from.x, y:target.y-from.y}, ga=Math.atan2(-v.y, v.x)/RAD, len=Math.hypot(tip.x,tip.y)*u;
  var r=ga-la, O={x:target.x-Math.cos(ga*RAD)*len, y:target.y+Math.sin(ga*RAD)*len}; return {hl:hl, o:{O:O, u:u, r:r, m:m}}; }
function hand2Geo(spec, u){ var Op={x:cw*0.36, y:ch*0.84}, out=[];
  if(spec.k==="one"){ var b=bestHand(), tg=handTarget(HD.hand1.C, b&&b.sc); out.push(tg); return {g:out, c:hx(tg.o,{x:0,y:1.4})}; }
  if(spec.k==="fist"){ out.push({hl:handLocal("cccc","side"), o:{O:Op, u:u, r:0, m:-1}}, {hl:handLocal("cccc","side"), o:{O:{x:Op.x+0.15*u, y:Op.y-1.35*u}, u:u, r:0, m:1}}); return {g:out, c:{x:Op.x, y:Op.y-1.2*u}}; }
  if(spec.k==="cross"){ var X={x:cw/2, y:ch*0.86-1.5*u}; out.push(aimHand("eccc","across",0,{x:X.x+0.42*u, y:X.y-0.35*u},{x:X.x-1.6*u, y:X.y+1.35*u},u,-1), aimHand("eccc","across",0,{x:X.x-0.42*u, y:X.y-0.35*u},{x:X.x+1.6*u, y:X.y+1.35*u},u,1)); return {g:out, c:X}; }
  var po={O:Op, u:u, r:0, m:-1}, open=handLocal("EEEE","out"), tgt, from; out.push({hl:open, o:po});
  if(spec.k==="tip"){ tgt=hx(po, spec.f===0?open.T[3]:open.F[spec.f-1][3]); from={x:cw*0.86, y:tgt.y+u*0.9}; }
  else { tgt=hx(po,{x:-0.02, y:0.55}); from={x:cw*0.95, y:tgt.y}; }
  out.push(aimHand(spec.k==="tip"?"eccc":spec.d, "across", 0, tgt, from, u, 1)); return {g:out, c:tgt}; }
function playHand2(x, L, a, k, gold){ var spec=HD.hand2[L[0]], hs=TR.hands, u=hs.length?d2(hs[0].sc[0],hs[0].sc[9])/1.067:Math.min(cw,ch)*0.15; u=G.h2U=G.h2U?lerp(G.h2U,u,0.2):u;
  var res=match2(hs, spec, D.tol), geo=hand2Geo(spec, u), parts=[]; geo.g.forEach(function(q){ parts=parts.concat(handParts(q.hl, q.o)); }); G.center=geo.c;
  figure(x, parts, {ow:Math.max(2,0.06*u), a:a, col:gold?"#ffd34d":"#eafcff", glow:gold?"rgba(255,211,77,1)":null, blur:gold?26*dpr:12*dpr});
  G.st=hs.length<(spec.k==="one"?1:2)?L2("🙌 Tunjukkan dua tangan ke kamera","🙌 Show both hands to the camera"):res.all?"":L2("🙌 Ikut bentuk dua tangan","🙌 Copy the two-hand shape");
  return res; }
// tracing: strokes drawn thick; the finger paints soft colours that only show inside the letter
function traceGeo(L){ var key=L[0]+cw+"x"+ch; if(G.traceKey===key) return G.tg; var B=Math.min(cw*0.84, ch*0.74), X0=(cw-B)/2, Y0=(ch-B)/2+ch*0.03, sw=B*0.13;
  var str=HD.trace[L[0]].map(function(s){ var p=(s.p||s).map(function(q){ return {x:q[0], y:q[1]}; }); return (s.sm?smooth(p,12):dense(p)); }), dots=HD.tdot[L[0]]||[];
  var toS=function(q){ return {x:X0+q.x*B/100, y:Y0+q.y*B/100}; };
  var mk2=off("tm",100,100), mx=mk2.getContext("2d"); mx.clearRect(0,0,100,100); mx.lineCap=mx.lineJoin="round"; mx.strokeStyle=mx.fillStyle="#fff"; mx.lineWidth=13; str.forEach(function(p){ mx.beginPath(); p.forEach(function(q,i){ if(i) mx.lineTo(q.x,q.y); else mx.moveTo(q.x,q.y); }); mx.stroke(); }); dots.forEach(function(d){ mx.beginPath(); mx.arc(d[0],d[1],6.5,0,2*PI); mx.fill(); });
  var md=mx.getImageData(0,0,100,100).data, tot=0; for(var i=3;i<md.length;i+=4) if(md[i]>127) tot++;
  var md2=off("tmd",cw,ch), mdx=md2.getContext("2d"); mdx.clearRect(0,0,cw,ch); mdx.lineCap=mdx.lineJoin="round"; mdx.strokeStyle=mdx.fillStyle="#fff"; mdx.lineWidth=sw; str.forEach(function(p){ mdx.beginPath(); p.map(toS).forEach(function(q,i){ if(i) mdx.lineTo(q.x,q.y); else mdx.moveTo(q.x,q.y); }); mdx.stroke(); }); dots.forEach(function(d){ var q=toS({x:d[0],y:d[1]}); mdx.beginPath(); mdx.arc(q.x,q.y,B*0.065,0,2*PI); mdx.fill(); });
  var parts=str.map(function(p, i){ var s=p.map(toS); return {t:"chain", p:s, w:sw, front:i>0?1:0, roots:[[s[0],sw*0.62],[s[s.length-1],sw*0.62]]}; }).concat(dots.map(function(d){ return {t:"circ", c:toS({x:d[0],y:d[1]}), r:B*0.065}; }));
  var pc=off("tpc",100,100); pc.getContext("2d").clearRect(0,0,100,100); var pd=off("tpd",cw,ch); pd.getContext("2d").clearRect(0,0,cw,ch);
  G.tg={B:B, X0:X0, Y0:Y0, sw:sw, str:str, dots:dots, parts:parts, md:md, tot:tot, toS:toS}; G.traceKey=key; G.lastF=null; G.paintN=0; G.cov=0; return G.tg; }
function dense(p){ var out=[]; for(var i=0;i<p.length-1;i++){ var n=Math.max(2,Math.round(d2(p[i],p[i+1])/3)); for(var j=0;j<n;j++) out.push({x:lerp(p[i].x,p[i+1].x,j/n), y:lerp(p[i].y,p[i+1].y,j/n)}); } out.push(p[p.length-1]); return out; }
function guideArt(x, g, a, t){ var rtl=!!HD.sets[D.set].rtl; x.save(); x.globalAlpha=a; x.fillStyle="rgba(255,211,77,.9)"; x.strokeStyle="rgba(255,211,77,.9)";
  g.str.forEach(function(p, i){ var s=p.map(g.toS), L=plen(s), n=Math.max(1,Math.floor(L/(g.B*0.2)));
    for(var k=1;k<=n;k++){ var q=along(s, k/(n+1)), r=g.B*0.022; x.save(); x.translate(q.x,q.y); x.rotate(q.a); x.beginPath(); x.moveTo(r,0); x.lineTo(-r*0.8,r*0.75); x.lineTo(-r*0.8,-r*0.75); x.closePath(); x.globalAlpha=a*0.55; x.fill(); x.restore(); }
    var st=s[0]; x.font="800 "+Math.round(g.B*0.05)+"px system-ui,sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillStyle="#0b2a1b"; x.beginPath(); x.arc(st.x,st.y,g.B*0.034,0,2*PI); x.fillStyle="#ffd34d"; x.fill(); x.fillStyle="#0b2a1b"; x.fillText(String(i+1), st.x, st.y+1); x.fillStyle="rgba(255,211,77,.9)"; });
  // a moving dot shows the order and direction
  var tot=g.str.length, cyc=(t%((tot*1.6)+0.8))/1.6, si=Math.floor(cyc); if(si<tot){ var s2=g.str[si].map(g.toS), q2=along(s2, cyc-si); x.globalAlpha=a; x.shadowColor="#ffd34d"; x.shadowBlur=14*dpr; x.fillStyle="#fff5c8"; x.beginPath(); x.arc(q2.x,q2.y,g.B*0.03,0,2*PI); x.fill(); }
  x.restore();
  if(rtl){ x.save(); x.globalAlpha=a*0.85; x.font="700 "+Math.round(g.B*0.045)+"px system-ui,sans-serif"; x.fillStyle="#ffd34d"; x.textAlign="center"; x.fillText(L2("← kanan ke kiri","← right to left"), cw/2, g.Y0+g.B+g.B*0.06); x.restore(); } }
function playTrace(x, L, a, k, gold, dt){ var g=traceGeo(L), h=bestHand(), f=null, pen=false, hue=(performance.now()/40)%360;
  G.center={x:cw/2, y:g.Y0+g.B/2};
  if(h){ var tip=h.sc[8]; G.fP=G.fP?{x:lerp(G.fP.x,tip.x,0.55), y:lerp(G.fP.y,tip.y,0.55)}:{x:tip.x,y:tip.y}; f=G.fP; pen=fState(h.w,0)>=1.45; } else G.fP=null;
  var inside=false; if(f){ var lx=Math.round((f.x-g.X0)/g.B*100), ly=Math.round((f.y-g.Y0)/g.B*100); inside=lx>=0&&ly>=0&&lx<100&&ly<100&&g.md[(ly*100+lx)*4+3]>127; }
  if(f && pen && G.ph==="play"){ var pd=off("tpd",cw,ch).getContext("2d"), pc=off("tpc",100,100).getContext("2d"), lf=G.lastF||f;
    pd.lineCap="round"; pd.strokeStyle="hsla("+hue.toFixed(0)+",75%,72%,.95)"; pd.lineWidth=g.B*0.13; pd.beginPath(); pd.moveTo(lf.x,lf.y); pd.lineTo(f.x+0.01,f.y); pd.stroke();
    pc.lineCap="round"; pc.strokeStyle="#fff"; pc.lineWidth=13; pc.beginPath(); pc.moveTo((lf.x-g.X0)/g.B*100,(lf.y-g.Y0)/g.B*100); pc.lineTo((f.x-g.X0)/g.B*100+0.01,(f.y-g.Y0)/g.B*100); pc.stroke(); G.lastF={x:f.x,y:f.y};
    if((G.paintN=(G.paintN||0)+1)%8===0){ var pdat=pc.getImageData(0,0,100,100).data, hit=0; for(var i=3;i<pdat.length;i+=4) if(pdat[i]>127 && g.md[i]>127) hit++; G.cov=hit/Math.max(1,g.tot); } }
  else G.lastF=null;
  // colour shows only inside the letter
  var tmp=off("tpt",cw,ch), tx=tmp.getContext("2d"); tx.globalCompositeOperation="source-over"; tx.clearRect(0,0,cw,ch); tx.drawImage(off("tpd",cw,ch),0,0); tx.globalCompositeOperation="destination-in"; tx.drawImage(off("tmd",cw,ch),0,0); tx.globalCompositeOperation="source-over";
  x.save(); x.globalAlpha=a; x.drawImage(tmp,0,0); x.restore();
  figure(x, g.parts, {ow:Math.max(2,g.sw*0.1), a:a, col:gold?"#ffd34d":"#eafcff", glow:gold?"rgba(255,211,77,1)":null, blur:gold?26*dpr:12*dpr, fa:0.1});
  if(G.ph!=="win") guideArt(x, g, a*(G.cov>0.15?0.45:1), performance.now()/1000);
  if(f){ var r=g.B*(inside?0.075:0.055), gr=x.createRadialGradient(f.x,f.y,0,f.x,f.y,r); gr.addColorStop(0,"rgba(255,255,240,"+(pen?(inside?1:0.55):0.35)+")"); gr.addColorStop(0.45,"rgba(255,220,120,"+(inside&&pen?0.75:0.3)+")"); gr.addColorStop(1,"rgba(255,211,77,0)");
    x.save(); x.globalCompositeOperation="lighter"; x.fillStyle=gr; x.beginPath(); x.arc(f.x,f.y,r,0,2*PI); x.fill(); x.restore(); }
  var need=[0.6,0.75,0.86][D.tol];
  G.st=!h?L2("☝️ Tunjukkan jari telunjuk ke kamera","☝️ Show your index finger to the camera"):!pen?L2("✊ Genggam = berhenti. Angkat telunjuk untuk melukis","✊ Fist = pause. Point your index finger to draw"):L2("🎨 Warnakan huruf: ","🎨 Colour the letter: ")+Math.round(Math.min(1,G.cov/need)*100)+"%";
  return {all:G.cov>=need, frac:G.cov/need}; }
function status(res){ setStatus(G.ph==="win"?"":(G.st||"")); }

// ---------------- idle art (before Start) ----------------
function idleArt(){ if(!over) return; var x=over.getContext("2d"); x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,cw,ch); var L=letters()[0]; if(!L) return; G.center={x:cw/2,y:ch/2};
  var c=comp.getContext("2d"); var g=c.createLinearGradient(0,0,0,ch); g.addColorStop(0,"#0f3324"); g.addColorStop(1,"#081a12"); c.fillStyle=g; c.fillRect(0,0,cw,ch);
  if(D.mode==="body"){ var S=Math.min(cw*0.16, ch*0.105), j=bodyJoints(L[5], {x:cw/2, y:ch*0.3}, S); figure(x, bodyParts(j,S), {ow:Math.max(2,0.07*S), a:0.9}); dotsArt(x, j, S, L[6], 0.9); }
  else if(D.mode==="hand1"){ var tg=handTarget(HD.hand1[L[0]], null); figure(x, handParts(tg.hl, tg.o), {ow:Math.max(2,0.06*tg.o.u), a:0.9}); }
  else if(D.mode==="hand2"){ var u=Math.min(cw,ch)*0.15, gq=hand2Geo(HD.hand2[L[0]], u), pp=[]; gq.g.forEach(function(q){ pp=pp.concat(handParts(q.hl,q.o)); }); figure(x, pp, {ow:Math.max(2,0.06*u), a:0.9}); }
  else { G.traceKey=null; var gg=traceGeo(L); figure(x, gg.parts, {ow:Math.max(2,gg.sw*0.1), a:0.9, fa:0.1}); guideArt(x, gg, 0.9, 0.5); }
  drawGlyph(x, L, cw*0.86, ch*0.1, Math.min(cw,ch)*0.12, 0.9); }

// ---------------- UI ----------------
function setStatus(t){ var s=box&&box.querySelector("#hfSt"); if(s && s.textContent!==t){ s.textContent=t; s.style.display=t?"":"none"; } }
function setMsg(h){ var m=box&&box.querySelector("#hfMsg"); if(m){ m.innerHTML=h; m.style.display=h?"":"none"; } }
function updHud(){ if(!el0) return; var s=el0.querySelector("#hfScore"), b=el0.querySelector("#hfBest"), sc=box&&box.querySelector("#hfSc"); if(s) s.textContent=G.score||0; if(b) b.textContent=D.best[bestKey()]||0; if(sc){ sc.textContent="⭐ "+(G.score||0); sc.style.display=G.run?"":"none"; }
  var sk=box&&box.querySelector("#hfSkip"); if(sk) sk.style.display=G.run&&G.cur?"":"none"; }
function ddBtn(k, it, sub){ return '<button class="hfDd" data-dd="'+k+'" aria-haspopup="true"><span class="hfDdI">'+it[1]+'</span><span class="hfDdT"><b>'+E(L2(it[2],it[3]))+'</b>'+(sub?'<small>'+E(sub)+'</small>':'')+'</span><span class="hfDdA">▾</span></button>'; }
function tgBtn(k, ic, ms, en){ return '<button class="hfTg'+(D[k]?' on':'')+'" data-tg="'+k+'" role="switch" aria-checked="'+(!!D[k])+'"><span>'+ic+' '+E(L2(ms,en))+'</span><i class="hfSw"></i></button>'; }
function ctlHtml(){ var md=pick(MODES,D.mode), st=pick(SETS,D.set), bg=pick(BGS,D.bg), sd=pick(SNDS,D.snd), n=letters().length;
  return '<div class="hfRow hfTop"><button class="btn hfGo" id="hfGo"'+(G.run?' disabled':'')+'>▶ '+E(L2("Mula","Start"))+'</button><button class="btn alt hfPause" id="hfPause"'+(G.run?'':' disabled')+'>'+(G.paused?'▶ '+E(L2("Sambung","Resume")):'⏸ '+E(L2("Jeda","Pause")))+'</button><button class="btn alt hfStop" id="hfStop"'+(G.run?'':' disabled')+'>■ '+E(L2("Henti","Stop"))+'</button>'+
    '<div class="hfNum"><b id="hfScore">'+(G.score||0)+'</b><span>'+E(L2("Markah","Score"))+'</span></div><div class="hfNum"><b id="hfBest">'+(D.best[bestKey()]||0)+'</b><span>⭐ '+E(L2("Terbaik","Best"))+'</span></div></div><div class="hfSet">'+
   '<div class="hfRow hfG2">'+ddBtn("mode", md, L2(md[4],md[5]))+ddBtn("set", st, n+" "+L2("huruf","letters"))+'</div>'+
   '<div class="hfRow hfG2">'+ddBtn("bg", bg)+ddBtn("snd", sd, D.say?L2("🗣 Sebut huruf: hidup","🗣 Letter voice: on"):L2("🗣 Sebut huruf: tutup","🗣 Letter voice: off"))+'</div>'+
   '<div class="hfRow hfG3">'+tgBtn("rand","🔀","Rawak","Random")+tgBtn("skel","🦴","Rangka","Stick figure")+
    '<label class="hfTol"><span class="hfTolH">🎯 '+E(L2("Toleransi","Tolerance"))+': <b id="hfTolV">'+E(TT(TOLS[D.tol]))+'</b></span><input type="range" id="hfTol" min="0" max="2" step="1" value="'+D.tol+'" aria-label="'+E(L2("Toleransi","Tolerance"))+'"><span class="hfTolL">'+TOLS.map(function(t){ return '<i>'+E(TT(t))+'</i>'; }).join("")+'</span></label></div>'+
   '<div class="hfFoot">'+(D.mode==="hand2"?'<span class="hfNote">ⓘ '+E(L2("Abjad 2 tangan ialah BSL (UK), bukan BIM. 12 huruf sahaja; huruf lain perlu disemak oleh guru bahasa isyarat.","The two-hand alphabet is BSL (UK), not BIM. 12 letters only; the others need review by a sign-language teacher."))+'</span>':D.mode==="hand1"?'<span class="hfNote">ⓘ '+E(L2("Abjad jari BIM (1 tangan). Sila semak dengan guru BIM.","BIM fingerspelling (one hand). Please check with a BIM teacher."))+'</span>':'')+
    '<button class="hfLnk" id="hfPriv">🔒 '+E(L2("Privasi & kamera","Privacy & camera"))+'</button></div></div>'; }
function refreshCtl(){ if(!el0) return; var c=el0.querySelector("#hfCtl"); if(!c) return; c.innerHTML=ctlHtml(); wire(c);
  var st=c.querySelector(".hfSet"), hf=el0.querySelector(".hf"), was=!!G.wasRun; G.wasRun=!!G.run; if(st) st.classList.toggle("hide", was);
  if(!G.run && box) box.style.height=""; requestAnimationFrame(function(){ if(st) st.classList.toggle("hide", !!G.run); if(hf) hf.classList.toggle("run", !!G.run); setTimeout(function(){ if(box && document.body.contains(box)){ fitRun(); size(); if(!G.run){ idleArt(); if(GL) glFrame(0); } } }, 380); }); }
// 0.5.42: while playing, grow the game box so the Start / Pause / Stop row sits right above the middle notch (or the mode dock if the notch is hidden)
function fitRun(){ if(!box || !el0) return; if(!G.run){ box.style.height=""; return; } var row=el0.querySelector(".hfTop"); if(!row) return;
  var n=document.getElementById("notch"), lim=0, r; if(n && !n.classList.contains("hidden") && (r=n.getBoundingClientRect()).height>0 && r.top>0) lim=r.top;
  if(!lim){ var dk=document.querySelector(".fitmodes"); if(dk && (r=dk.getBoundingClientRect()).height>0) lim=r.top; } if(!lim) lim=window.innerHeight;
  var gap=lim-4-row.getBoundingClientRect().bottom, bh=box.getBoundingClientRect().height; if(Math.abs(gap)<2) return;
  box.style.height=Math.round(clamp(bh+gap, 230, 1400))+"px"; }
function optSheet(title, items, cur, onPick, extra){ var ov=H.showSheet(title, '<div class="hfOpts">'+items.map(function(it){ return '<button class="hfOpt'+(it[0]===cur?' on':'')+'" data-o="'+it[0]+'"><span class="hfOptI">'+it[1]+'</span><span class="hfOptT"><b>'+E(L2(it[2],it[3]))+'</b>'+(it[4]?'<small>'+E(L2(it[4],it[5]))+'</small>':'')+'</span><span class="hfOptC">'+(it[0]===cur?'✓':'')+'</span></button>'; }).join("")+'</div>'+(extra||""));
  ov.querySelectorAll("[data-o]").forEach(function(b){ b.onclick=function(){ H.closeOverlay(); onPick(b.getAttribute("data-o")); }; }); return ov; }
function changed(reTrack){ sv(); refreshCtl(); bag=[]; G.idx=null; G.traceKey=null;
  if(G.run){ if(reTrack){ ensureTrackers().then(function(){ if(G.run) startRound(); }).catch(function(){ stop(); setStatus(L2("Pakej penjejak rosak. Tekan Mula untuk memuat turun semula.","The tracking pack is damaged. Press Start to download it again.")); }); } else startRound(); }
  else { setMsg(""); idleArt(); if(GL) glFrame(0); } }
function wire(c){
  c.querySelector("#hfGo").onclick=start; c.querySelector("#hfStop").onclick=stop; c.querySelector("#hfPause").onclick=pause;
  c.querySelectorAll("[data-dd]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-dd");
    if(k==="mode") optSheet("🎮 "+E(L2("Mod permainan","Game mode")), MODES, D.mode, function(v){ D.mode=v; changed(true); });
    else if(k==="set") optSheet("🔤 "+E(L2("Set huruf","Letter set")), SETS, D.set, function(v){ D.set=v; changed(false); });
    else if(k==="bg") optSheet("🖼 "+E(L2("Latar belakang","Background")), BGS.map(function(x){ return x.concat(x[0]==="normal"?["",""]:["Di belakang anak apabila dikesan","Behind your child once detected"]); }), D.bg, function(v){ D.bg=v; changed(true); });
    else { var ov=optSheet("🔊 "+E(L2("Bunyi","Sound")), SNDS, D.snd, function(v){ D.snd=v; sv(); refreshCtl(); sndStart(); }, '<div class="hfOptX">'+tgBtn("say","🗣","Sebut huruf selepas berjaya","Say the letter on success")+'</div>');
      var sb=ov.querySelector('[data-tg="say"]'); sb.onclick=function(){ D.say=!D.say; sv(); sb.classList.toggle("on",D.say); sb.setAttribute("aria-checked",D.say); refreshCtl(); }; } }; });
  c.querySelectorAll("[data-tg]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-tg"); D[k]=!D[k]; sv(); b.classList.toggle("on",D[k]); b.setAttribute("aria-checked",D[k]); if(k==="rand"){ bag=[]; } }; });
  var tl=c.querySelector("#hfTol"); tl.oninput=function(){ D.tol=+tl.value; sv(); c.querySelector("#hfTolV").textContent=TT(TOLS[D.tol]); };
  c.querySelector("#hfPriv").onclick=function(){ parentSheet(null); }; }
function view(el, h){ H=h; L2=h.L2x; E=h.esc; HD=window.HurufData; el0=el; ld();
  if(!document.getElementById("hfCss")){ var lk=document.createElement("link"); lk.id="hfCss"; lk.rel="stylesheet"; lk.href="huruf/huruf.css"; lk.onload=function(){ if(box && document.body.contains(box) && !G.run){ size(); idleArt(); if(GL) glFrame(0); } }; document.head.appendChild(lk); }
  if(G.run) stop();
  el.innerHTML='<div class="hf"><div class="hfBox" id="hfBox"><div class="hfSt" id="hfSt"></div><div class="hfSc" id="hfSc" style="display:none"></div><button class="hfSkip" id="hfSkip" style="display:none" aria-label="'+E(L2("Huruf seterusnya","Next letter"))+'">⏭</button><div class="hfMsg" id="hfMsg" style="display:none"></div></div><div class="hfCtl" id="hfCtl"></div></div>';
  box=el.querySelector("#hfBox"); comp=document.createElement("canvas"); over=document.createElement("canvas"); cw=ch=0;
  if(GL){ try{ GL.r.dispose(); }catch(e){} } GL=null; size(); GL=makeGL();
  if(GL) box.insertBefore(GL.r.domElement, box.firstChild); else { comp.className=over.className="hfGL"; box.insertBefore(over, box.firstChild); box.insertBefore(comp, box.firstChild); }
  box.querySelector("#hfSkip").onclick=function(){ if(G.run && !G.paused) startRound(); };
  refreshCtl(); setStatus(L2("Tekan ▶ Mula","Press ▶ Start")); idleArt(); if(GL) glFrame(0);
  if(!view._vis){ view._vis=true; document.addEventListener("visibilitychange", function(){ if(document.hidden && G.run) stop(); }); window.addEventListener("resize", function(){ if(box && document.body.contains(box)){ if(G.run){ box.style.height=""; requestAnimationFrame(function(){ fitRun(); size(); }); } else { size(); idleArt(); if(GL) glFrame(0); } } }); } }

window.HurufView={view:view, pause:pause, stop:function(){ if(G.run) stop(); }, active:function(){ return !!G.run; },
 _t:{ G:G, fitRun:fitRun, MASK:MASK, maskVote:maskVote, glo:function(){ return GL; }, D:function(){ return D; }, letters:letters, start:start, stop:stop, pause:pause, win:win, round:startRound,
  // test helpers: landmarks made from the target shapes, so a perfect copy must match
  targetPose:function(){ var L=G.cur, C=G.bC||{x:cw/2,y:ch*0.3}, S=G.bS||Math.min(cw*0.2,ch*0.12), j=bodyJoints(L[5],C,S), m=vmap(), lm=[]; for(var i=0;i<33;i++) lm.push({x:0.5,y:0.5,z:0,visibility:0});
    var map={0:j.head,11:j.ls,12:j.rs,13:j.le,14:j.re,15:j.lw,16:j.rw,23:j.lh,24:j.rh,25:j.lk,26:j.rk,27:j.la,28:j.ra}; for(var k in map) lm[k]=toNorm(map[k],m); return lm; },
  targetHand:function(){ var spec=HD.hand1[G.cur[0]], tg=handTarget(spec,null), hl=tg.hl, m=vmap(); var loc=handLms(hl); return {lm:loc.map(function(q){ return toNorm(hx(tg.o,q),m); }), w:loc.map(function(q){ return {x:q.x, y:q.y, z:0}; })}; },
  handFor:function(dr, th, o){ var hl=handLocal(dr, th), m=vmap(), loc=handLms(hl); return {lm:loc.map(function(q){ return toNorm(hx(o,q),m); }), w:loc.map(function(q){ return {x:q.x, y:q.y, z:0}; })}; },
  fingerAt:function(px, py){ var hl=handLocal("eccc","across"), u=Math.min(cw,ch)*0.12, o={O:{x:0,y:0},u:u,r:0,m:1}, tip=hx(o,hl.F[0][3]); o.O={x:px-tip.x, y:py-tip.y}; var m=vmap(), loc=handLms(hl); return {lm:loc.map(function(q){ return toNorm(hx(o,q),m); }), w:loc.map(function(q){ return {x:q.x,y:q.y,z:0}; })}; },
  target2:function(){ var u=G.h2U||Math.min(cw,ch)*0.15, m=vmap(); return hand2Geo(HD.hand2[G.cur[0]], u).g.map(function(q){ var loc=handLms(q.hl); return {lm:loc.map(function(p){ return toNorm(hx(q.o,p),m); }), w:loc.map(function(p){ return {x:p.x,y:p.y,z:0}; })}; }); },
  crossBody:function(tol){ var a=HD.sets.rumi.list, n=0, bad=0; a.forEach(function(L){ a.forEach(function(M){ if(L===M || String(L[5])===String(M[5])) return; n++; var j=bodyJoints(M[5],{x:300,y:200},80), P=[], map={11:j.ls,12:j.rs,13:j.le,14:j.re,15:j.lw,16:j.rw,23:j.lh,24:j.rh,25:j.lk,26:j.rk,27:j.la,28:j.ra}; for(var i=0;i<33;i++) P.push(map[i]?{x:map[i].x,y:map[i].y,v:1}:{x:0,y:0,v:0}); var t0=D.tol; D.tol=tol; if(matchBody(P,L[5]).all) bad++; D.tol=t0; }); }); return bad/n; },
  crossHand:function crossHand(tol){ var ks=Object.keys(HD.hand1), n=0, bad=0, pairs=[]; ks.forEach(function(a){ ks.forEach(function(b){ if(a===b) return; var sa=HD.hand1[a], sb=HD.hand1[b]; if(sa.d===sb.d && sa.th===sb.th && sa.o===sb.o) return; n++; var hl=handLocal(sb.d,sb.th), loc=handLms(hl), o={O:{x:200,y:400},u:100,r:sb.o==="s"?90:sb.o==="d"?180:0,m:1}; if(matchHand(loc.map(function(q){ return hx(o,q); }), loc.map(function(q){ return {x:q.x,y:q.y,z:0}; }), sa, tol).all){ bad++; pairs.push(b+"→"+a); } }); }); crossHand.pairs=pairs; return bad/n; },
  match2Self:function(k, tol){ var spec=HD.hand2[k], u=Math.min(cw,ch)*0.15; var hs=hand2Geo(spec,u).g.map(function(q){ var loc=handLms(q.hl); return {sc:loc.map(function(p){ return hx(q.o,p); }), w:loc.map(function(p){ return {x:p.x,y:p.y,z:0}; })}; }); return match2(hs,spec,tol).all; },
  traceGeo:function(){ return traceGeo(G.cur); }, size:function(){ return {w:cw,h:ch}; }, gl:function(){ return !!GL; },
  matchHandLocal:function(k, tol){ var spec=HD.hand1[k], hl=handLocal(spec.d, spec.th), loc=handLms(hl), o={O:{x:200,y:400},u:100,r:spec.o==="s"?90:spec.o==="d"?180:0,m:1}; return matchHand(loc.map(function(q){ return hx(o,q); }), loc.map(function(q){ return {x:q.x,y:q.y,z:0}; }), spec, tol); },
  matchBodySelf:function(pose, tol){ var j=bodyJoints(pose,{x:300,y:200},80), P=[]; var map={0:j.head,11:j.ls,12:j.rs,13:j.le,14:j.re,15:j.lw,16:j.rw,23:j.lh,24:j.rh,25:j.lk,26:j.rk,27:j.la,28:j.ra}; for(var i=0;i<33;i++) P.push(map[i]?{x:map[i].x,y:map[i].y,v:1}:{x:0,y:0,v:0}); var t0=D.tol; D.tol=tol; var r=matchBody(P,pose); D.tol=t0; return r; } } };
})();
