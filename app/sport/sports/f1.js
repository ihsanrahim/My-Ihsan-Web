/* My Ihsan Sports: Formula 1. A procedural circuit (closed Catmull-Rom spline, 13 m wide, ≈ 1.4 km here; real circuits are ≈ 3.3–7 km)
   with kerbs, brake boards, a start/finish line, grid boxes and a pit lane. Car ≈ 5.6 × 2.0 m. FIA Formula 1 Sporting Regulations,
   rules as of 2026 (⚠ the 2026 rules replace DRS with active aerodynamics and an overtake mode: check the current regulations). */
(function(){
"use strict";
var PI=Math.PI, TW=13, STEP=2;
var CP=[[0,-150],[90,-150],[150,-120],[160,-60],[110,-20],[120,40],[170,80],[160,140],[90,150],[20,120],[-40,140],[-120,150],[-170,110],[-160,40],[-100,0],[-150,-60],[-140,-130],[-70,-155]];
// sample the closed spline every STEP metres: C[i] = {x, z, tx, tz, nx, nz, k}
var C=(function(){ var n=CP.length, raw=[], i, j; function cr(a, b, c, d, t){ var t2=t*t, t3=t2*t; return 0.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3); }
  for(i=0;i<n;i++){ var p0=CP[(i-1+n)%n], p1=CP[i], p2=CP[(i+1)%n], p3=CP[(i+2)%n]; for(j=0;j<60;j++){ var t=j/60; raw.push([cr(p0[0],p1[0],p2[0],p3[0],t), cr(p0[1],p1[1],p2[1],p3[1],t)]); } }
  var out=[raw[0]], need=STEP; for(i=0;i<raw.length;i++){ var A0=raw[i], B0=raw[(i+1)%raw.length], d=Math.hypot(B0[0]-A0[0], B0[1]-A0[1]), pos=0; while(d-pos>=need){ pos+=need; out.push([A0[0]+(B0[0]-A0[0])*pos/d, A0[1]+(B0[1]-A0[1])*pos/d]); need=STEP; } need-=(d-pos); }
  if(Math.hypot(out[out.length-1][0]-out[0][0], out[out.length-1][1]-out[0][1])<STEP*0.5) out.pop();
  var N=out.length, R=[]; for(i=0;i<N;i++){ var a=out[(i-1+N)%N], b=out[(i+1)%N], tx=b[0]-a[0], tz=b[1]-a[1], l=Math.hypot(tx,tz)||1; tx/=l; tz/=l; R.push({x:out[i][0], z:out[i][1], tx:tx, tz:tz, nx:tz, nz:-tx}); }
  for(i=0;i<N;i++){ var A=R[(i-4+N)%N], B=R[(i+4)%N], cr2=A.tx*B.tz-A.tz*B.tx, dt=A.tx*B.tx+A.tz*B.tz; R[i].k=Math.atan2(cr2, dt)/(8*STEP); } return R; })();
window.__F1C=C; var N=C.length, LAPM=N*STEP, OUT=C[0].nz<0?1:-1; // OUT: the normal sign pointing to the outside (−z) of the main straight
function S_(s){ return C[((Math.round(s/STEP)%N)+N)%N]; }
function P(s, lat){ var c=S_(s); return [c.x+c.nx*lat, c.z+c.nz*lat, Math.atan2(c.tx, c.tz)]; }
function band(T, o0, o1, col, y, keep){ var Pp=[], I=[], Cc=[], i, n=0, cA=new T.Color(col[0]||col), cB=new T.Color(col[1]||col[0]||col);
  for(i=0;i<N;i++){ var a=C[i], b=C[(i+1)%N]; if(keep && !keep(i)) continue; var cc=(Math.floor(i/2)%2)?cA:cB;
    Pp.push(a.x+a.nx*o0,y,a.z+a.nz*o0, a.x+a.nx*o1,y,a.z+a.nz*o1, b.x+b.nx*o0,y,b.z+b.nz*o0, b.x+b.nx*o1,y,b.z+b.nz*o1); for(var k=0;k<4;k++) Cc.push(cc.r,cc.g,cc.b); I.push(n,n+1,n+2, n+1,n+3,n+2); n+=4; }
  var g=new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(Pp,3)); g.setAttribute("color", new T.Float32BufferAttribute(Cc,3)); g.setIndex(I);
  var po=-Math.round(y*300); return new T.Mesh(g, new T.MeshBasicMaterial({vertexColors:true, side:T.DoubleSide, polygonOffset:true, polygonOffsetFactor:po, polygonOffsetUnits:po})); }
function corner(i){ for(var d=-3; d<=3; d++){ if(Math.abs(C[(i+d+N)%N].k)>0.012) return true; } return false; }
var TEAM=[["#e10600","#ffffff"],["#00a19c","#111111"],["#ff8000","#2a6fb0"],["#1e41ff","#e10600"],["#006f62","#cedc00"],["#f5f5f5","#e10600"],["#2293d1","#f5f5f5"],["#52e252","#111111"]];
function car(S, ti, o){ o=o||{}; var T=S.T, g=new T.Group(), tm=TEAM[ti%TEAM.length], c1=new T.MeshLambertMaterial({color:new T.Color(tm[0])}), c2=new T.MeshLambertMaterial({color:new T.Color(tm[1])}), bk=new T.MeshLambertMaterial({color:0x15171a}), ty=new T.MeshLambertMaterial({color:0x1b1b1b});
  function bx(w, h, l, x, y, z, m){ var b=new T.Mesh(new T.BoxGeometry(w, h, l), m); b.position.set(x, y, z); g.add(b); return b; }
  bx(1.4,0.06,4.4,0,0.1,0,bk); bx(0.62,0.45,3.0,0,0.42,0.3,c1); bx(1.45,0.42,1.7,0,0.36,-0.45,c1); bx(0.5,0.48,1.7,0,0.72,-1.3,c1); bx(0.18,0.5,0.3,0,1.0,-0.4,c2);
  var nose=new T.Mesh(new T.CylinderGeometry(0.08,0.24,1.5,10), c1); nose.rotation.x=PI/2; nose.position.set(0,0.32,2.4); g.add(nose);
  bx(2.0,0.04,0.55,0,0.14,2.75,c2); bx(0.04,0.28,0.6,-1.0,0.24,2.75,bk); bx(0.04,0.28,0.6,1.0,0.24,2.75,bk); // front wing
  bx(1.0,0.05,0.36,0,0.95,-2.55,c2); var fl=new T.Group(); fl.position.set(0,1.02,-2.38); var fm=new T.Mesh(new T.BoxGeometry(1.0,0.04,0.26), c1); fm.position.z=-0.13; fl.add(fm); g.add(fl); // rear wing + flap
  bx(0.04,0.62,0.62,-0.52,0.78,-2.5,bk); bx(0.04,0.62,0.62,0.52,0.78,-2.5,bk);
  var halo=new T.Mesh(new T.TorusGeometry(0.34,0.03,6,16,PI), bk); halo.rotation.x=-PI/2; halo.position.set(0,0.82,0.45); g.add(halo); bx(0.05,0.3,0.05,0,0.7,0.8,bk);
  var hel=new T.Mesh(new T.SphereGeometry(0.14,12,8), new T.MeshLambertMaterial({color:new T.Color(o.helmet||"#f2c94c")})); hel.position.set(0,0.78,0.25); g.add(hel);
  var W=[], FW=[]; [[0.84,0.36,1.75,0.38,1],[-0.84,0.36,1.75,0.38,1],[0.8,0.36,-1.6,0.46,0],[-0.8,0.36,-1.6,0.46,0]].forEach(function(w){ var pv=new T.Group(); pv.position.set(w[0],w[1],w[2]); var m=new T.Mesh(new T.CylinderGeometry(0.36,0.36,w[3],16), ty); m.rotation.z=PI/2; pv.add(m);
    var rim=new T.Mesh(new T.CylinderGeometry(0.2,0.2,w[3]+0.01,10), new T.MeshLambertMaterial({color:new T.Color(o.tyre||"#c9c9c9")})); rim.rotation.z=PI/2; pv.add(rim); g.add(pv); W.push(m); if(w[4]) FW.push(pv); if(!w[4]) (g.userData.RW=g.userData.RW||[]).push(rim); else (g.userData.FR=g.userData.FR||[]).push(rim); });
  if(o.ghost) g.traverse(function(x){ if(x.material){ x.material=x.material.clone(); x.material.transparent=true; x.material.opacity=0.32; x.material.depthWrite=false; } });
  g.userData.W=W; g.userData.FW=FW; g.userData.flap=fl; S.st.add(g); return g; }
function spin(g, v, dt, steer){ g.userData.W.forEach(function(w){ w.rotation.x+=v*dt/0.36; }); g.userData.FW.forEach(function(f){ f.rotation.y=(steer||0)*0.35; }); }
function tyre(g, col){ (g.userData.RW||[]).concat(g.userData.FR||[]).forEach(function(r){ r.material.color.set(col); }); }
function at(g, s, lat){ var p=P(s, lat||0); g.position.set(p[0],0,p[1]); g.rotation.set(0,p[2],0); }
function camAt(s, lat, back, up, ahead){ var a=P(s-back, lat), b=P(s+ahead, 0); return [[a[0],up,a[1]],[b[0],0.5,b[1]]]; }
function side(s, lat, h){ var a=P(s,lat), b=P(s,0); return [[a[0],h,a[1]],[b[0],0.5,b[1]]]; }
function flagTex(T){ var c=document.createElement("canvas"); c.width=c.height=64; var x=c.getContext("2d"); for(var i=0;i<8;i++) for(var j=0;j<8;j++){ x.fillStyle=(i+j)%2?"#111":"#fff"; x.fillRect(i*8,j*8,8,8); } return new T.CanvasTexture(c); }
var PIT=-18*OUT; // pit lane centre offset from the track centreline along the main straight
SPORTS.f1={ id:"f1", v:"2026", H:1.75, cam:[0,190,-260], ground:"#4f8a3c", fog:[350,1300], far:1600, near:0.15, groundSize:1400,
 field:function(K){ var T=window.THREE, r=K.root, i;
   r.add(band(T, -TW/2-4, TW/2+4, ["#c9b98f"], 0.005, corner)); // gravel run-off at corners
   r.add(band(T, -TW/2, TW/2, ["#3b3e43"], 0.012)); r.add(band(T, TW/2-0.35, TW/2-0.15, ["#ffffff"], 0.02)); r.add(band(T, -TW/2+0.15, -TW/2+0.35, ["#ffffff"], 0.02));
   r.add(band(T, TW/2, TW/2+1.3, ["#d62d20","#ffffff"], 0.018, corner)); r.add(band(T, -TW/2-1.3, -TW/2, ["#d62d20","#ffffff"], 0.018, corner));
   r.add(band(T, PIT-4, PIT+4, ["#55585e"], 0.012, function(i){ return i<45||i>N-40; }));
   for(i=-36;i<44;i+=8){ var p=P(i*STEP,PIT-3.6), q=P(i*STEP+5,PIT-3.6); K.line(p[0],p[1],q[0],q[1],0.15,"#f2c94c"); } K.label("PIT",P(0,PIT)[0],3,P(0,PIT)[1],1.2,"#f2c94c");
   var a=P(0,-TW/2), b=P(0,TW/2); K.line(a[0],a[1],b[0],b[1],1.0,"#ffffff"); K.post(a[0],a[1],6,0.15,"#888888"); K.post(b[0]+0*1,b[1],6,0.15,"#888888"); K.bar(a[0],6,a[1],b[0],6,b[1],0.2,"#222222"); // start gantry
   for(i=1;i<=8;i++){ var s=-i*8, lat=(i%2?-1:1)*3.2, g1=P(s,lat-1.2), g2=P(s,lat+1.2); K.line(g1[0],g1[1],g2[0],g2[1],0.15,"#ffffff"); } // grid boxes
   for(i=0;i<N;i++){ if(Math.abs(C[i].k)>0.012 && Math.abs(C[(i-25+N)%N].k)<0.008){ [50,100,150].forEach(function(d){ var bp=P((i-d/STEP)*STEP, TW/2+4); K.label(String(d), bp[0], 1.4, bp[1], 0.5, "#ffffff"); }); i+=25; } } // brake boards
   K.label("FINISH", P(0,0)[0], 8, P(0,0)[1], 1.6);
   return {w:360, l:340}; },
 facts:[[["Kereta","Car"],"≈ 5.6 × 2.0 m ⚠"],[["Lebar trek","Track width"],"≈ 12–15 m"],[["Jarak perlumbaan","Race distance"],"≈ 305 km"],[["Masa maksimum","Max time"],"2 h"],[["Had laju lorong pit","Pit-lane limit"],"80 km/h (biasa)"],[["Mata","Points"],"25-18-15-12-10-8-6-4-2-1"],[["Kelajuan tertinggi","Top speed"],"≈ 340 km/h"]],
 zones:[
  {n:["Garisan permulaan/penamat","Start/finish line"], d:["Kereta beratur di grid di belakang garisan ini. Lampu merah padam = perlumbaan bermula.","The cars line up on the grid behind this line. The red lights go out = the race starts."], p:(function(){ var a=P(-70,-TW/2), b=P(-70,TW/2), c=P(6,TW/2), d=P(6,-TW/2); return [[a[0],a[1]],[b[0],b[1]],[c[0],c[1]],[d[0],d[1]]]; })()},
  {n:["Lorong pit","Pit lane"], d:["Untuk menukar tayar dan membaiki kereta. Had laju (biasanya 80 km/j); melanggar had = penalti.","For tyre changes and repairs. There is a speed limit (usually 80 km/h); breaking it = a penalty."], p:(function(){ var a=P(-70,PIT-4), b=P(-70,PIT+4), c=P(80,PIT+4), d=P(80,PIT-4); return [[a[0],a[1]],[b[0],b[1]],[c[0],c[1]],[d[0],d[1]]]; })()},
  {n:["Selekoh & kerb","Corner and kerbs"], d:["Kerb merah-putih di tepi selekoh. Jika keempat-empat tayar keluar dari garisan putih, itu melanggar had trek.","Red-and-white kerbs line the corners. If all four wheels go past the white line, that breaks track limits."], p:[[140,-135],[175,-110],[178,-60],[145,-60],[140,-100]]},
  {n:["Papan brek","Brake boards"], d:["Papan 150, 100, 50 m sebelum selekoh membantu pemandu tahu bila perlu brek.","The 150, 100 and 50 m boards before a corner tell the driver when to brake."], p:[[60,-165],[120,-165],[120,-140],[60,-140]]}],
 cards:[
  {t:["Hujung minggu perlumbaan","The race weekend"], x:["Latihan bebas, kemudian kelayakan dalam 3 bahagian: Q1 dan Q2 menyingkirkan kereta paling perlahan, Q3 menentukan 10 teratas dan pole position ⚠. Ahad: perlumbaan.","Free practice, then qualifying in 3 parts: Q1 and Q2 knock out the slowest cars, Q3 decides the top 10 and pole position ⚠. Sunday: the race."], cam:side(5,-30,9), dur:6,
   set:function(S){ return {g:car(S,0), L:["Q1","Q2","Q3 🏁 POLE"].map(function(q){ var p=P(5,0); return S.st.label(q,p[0],5,p[1],1); })}; },
   at:function(S, s, p){ at(s.g, ((p*3)%1)*130-60, 0); spin(s.g, 60, 0.016); var k=Math.min(2,Math.floor(p*3)); s.L.forEach(function(l,i){ l.visible=i===k; }); }},
  {t:["Grid dan lampu permulaan","The grid and the start lights"], x:["Kereta beratur ikut keputusan kelayakan, 8 m jarak, berselang kiri-kanan. 5 lampu merah menyala satu demi satu; apabila semua padam, perlumbaan bermula. Bergerak awal = penalti.","Cars line up in qualifying order, 8 m apart, staggered left and right. 5 red lights come on one by one; when they all go out, the race starts. Moving early = a penalty."], cam:camAt(-55,-14,-10,9,30), dur:6,
   set:function(S){ var G=[]; for(var i=1;i<=8;i++){ var g=car(S,i); G.push(g); } var p=P(0,0); return {G:G, L:["🔴","🔴🔴","🔴🔴🔴","🔴🔴🔴🔴","🔴🔴🔴🔴🔴","⚫⚫⚫⚫⚫ GO"].map(function(t){ return S.st.label(t,p[0],8.5,p[1],1.1); })}; },
   at:function(S, s, p){ var k=Math.min(5,Math.floor(p*8)), go=p>0.62, q=S.seg(p,0.62,1); s.L.forEach(function(l,i){ l.visible=i===k; }); s.G.forEach(function(g,i){ var s0=-(i+1)*8+2; at(g, s0+(go?q*q*(90-i*6):0), (i%2?1:-1)*3.2*(go?1-q*0.6:1)); spin(g,go?40:0,0.016); }); }},
  {t:["Perlumbaan ≈ 305 km","The race ≈ 305 km"], x:["Bilangan pusingan paling sedikit yang melebihi 305 km (Monaco lebih pendek). Had masa 2 jam. Pertama melepasi bendera berpetak menang.","The fewest laps that cover more than 305 km (Monaco is shorter). A 2-hour time limit. The first past the chequered flag wins."], cam:[[0,160,-60],[0,0,0]], dur:8,
   set:function(S){ var G=[]; for(var i=0;i<5;i++) G.push(car(S,i)); return {G:G}; },
   at:function(S, s, p){ s.G.forEach(function(g,i){ at(g, p*LAPM-i*18, (i%2?1:-1)*1.5); spin(g,70,0.016); }); }},
  {t:["Mata kejuaraan","Championship points"], x:["10 teratas mendapat mata: 25, 18, 15, 12, 10, 8, 6, 4, 2, 1. Kejuaraan pemandu dan kejuaraan pembina (pasukan) dikira sepanjang musim.","The top 10 score points: 25, 18, 15, 12, 10, 8, 6, 4, 2, 1. A Drivers' and a Constructors' (team) championship run across the season."], cam:[[0,3.2,8],[0,1.6,0]], dur:5,
   set:function(S){ var T=S.T, D=[]; [[0,1.2,"25"],[-1.6,0.8,"18"],[1.6,0.5,"15"]].forEach(function(q,i){ var b=new T.Mesh(new T.BoxGeometry(1.4,q[1],1.2), new T.MeshLambertMaterial({color:0xe9e6df})); b.position.set(q[0],q[1]/2,0); S.st.add(b);
     var d=S.st.body(S.H, {top:TEAM[i][0], pants:TEAM[i][0], cap:true, capc:TEAM[i][1]}); S.place(d,q[0],0,0,q[1]); D.push(d); S.st.label(q[2],q[0],q[1]+2.4,0.2,0.7); }); return {D:D}; },
   at:function(S, s, p){ s.D.forEach(function(d,i){ S.pose(d, i===0?"jump":"point", i===0?(p*2)%1:0.5); }); }},
  {t:["Bendera","Flags"], x:["Kuning: bahaya, perlahan, tiada memotong. Hijau: laluan jelas. Biru: beri laluan kepada kereta lebih laju yang memintas pusingan. Merah: sesi dihentikan. Berpetak: tamat.","Yellow: danger, slow down, no overtaking. Green: track clear. Blue: let a faster, lapping car through. Red: session stopped. Chequered: the end."], cam:[[P(30,TW/2+4)[0]+6,2.2,P(30,TW/2+4)[1]+6],[P(30,TW/2+4)[0],1.6,P(30,TW/2+4)[1]]], dur:7,
   set:function(S){ var T=S.T, p=P(30,TW/2+4), m=S.st.body(1.75,{top:"#ff7a1a",pants:"#ff7a1a"}); S.place(m,p[0],p[1],p[2]-PI/2); var f=new T.Mesh(new T.PlaneGeometry(0.9,0.6), new T.MeshBasicMaterial({color:0xffffff, side:T.DoubleSide})); f.position.set(0.45,-0.35,0); m.userData.J.elR.add(f);
     return {m:m, f:f, ch:flagTex(T), L:[["Kuning","Yellow"],["Hijau","Green"],["Biru","Blue"],["Merah","Red"],["Berpetak","Chequered"]].map(function(n){ return S.st.label(S.L2(n[0],n[1]),p[0],3.2,p[1],0.6); })}; },
   at:function(S, s, p){ var k=Math.min(4,Math.floor(p*5)), cols=["#f2d13c","#2ecc71","#2a6fb0","#e74c3c","#ffffff"]; s.f.material.map=k===4?s.ch:null; s.f.material.color.set(cols[k]); s.f.material.needsUpdate=true; s.L.forEach(function(l,i){ l.visible=i===k; });
     var J=s.m.userData.J; J.shR.rotation.set(-2.6+Math.sin(p*PI*20)*0.4,0,0.3); J.elR.rotation.x=-0.2; }},
  {t:["Kereta keselamatan & VSC","Safety car and VSC"], x:["Selepas kemalangan, kereta keselamatan keluar; semua beratur di belakangnya, tiada memotong. Virtual Safety Car (VSC): semua perlu memandu perlahan mengikut masa delta, tanpa kereta sebenar.","After a crash, the safety car comes out; everyone lines up behind it, no overtaking. Virtual Safety Car (VSC): everyone must slow to a set delta time, with no real car."], cam:camAt(120,-14,-10,8,30), dur:6,
   set:function(S){ var T=S.T, sc=new T.Group(), b=new T.Mesh(new T.BoxGeometry(1.95,1.1,4.6), new T.MeshLambertMaterial({color:0xb9bec5})); b.position.y=0.65; sc.add(b); var lb=new T.Mesh(new T.BoxGeometry(1.2,0.12,0.25), new T.MeshBasicMaterial({color:0xf2a20c})); lb.position.y=1.28; sc.add(lb); S.st.add(sc);
     var G=[]; for(var i=0;i<5;i++) G.push(car(S,i)); return {sc:sc, lb:lb, G:G, l:S.st.label("SC",0,0,0,0.9,"#f2a20c")}; },
   at:function(S, s, p){ var d=100+p*90; at(s.sc,d,0); s.lb.visible=Math.floor(p*16)%2===0; s.G.forEach(function(g,i){ at(g,d-12-i*11,0); spin(g,25,0.016); }); s.l.position.set(s.sc.position.x,3,s.sc.position.z); }},
  {t:["Hentian pit dan tayar","Pit stops and tyres"], x:["Tayar kering: lembut (merah), sederhana (kuning), keras (putih). Tayar basah: intermediate (hijau) dan wet (biru). Dalam perlumbaan kering, wajib guna sekurang-kurangnya 2 jenis tayar kering ⚠. Pasukan menukar 4 tayar dalam ≈ 2–3 saat.","Dry tyres: soft (red), medium (yellow), hard (white). Wet tyres: intermediate (green) and wet (blue). In a dry race at least 2 dry compounds must be used ⚠. Teams change all 4 tyres in ≈ 2–3 seconds."], cam:(function(){ var a=P(10,PIT-10), b=P(10,PIT); return [[a[0]+4,4.5,a[1]],[b[0],0.5,b[1]]]; })(), dur:5,
   set:function(S){ var g=car(S,1,{tyre:"#d62d20"}); at(g,10,PIT); var Cw=[]; [[1.6,1.75],[-1.6,1.75],[1.6,-1.6],[-1.6,-1.6],[0,3.6]].forEach(function(o){ var b=S.st.body(1.75,{top:"#111111",pants:"#111111",cap:true,capc:"#00a19c"}); var p=P(10+o[1],PIT+o[0]*OUT*-1); S.place(b,p[0],p[1],0); S.u.face(b,g.position.x,g.position.z); Cw.push(b); });
     return {g:g, Cw:Cw, l:S.st.label("2.4 s",g.position.x,3,g.position.z,0.8,"#7CFC9A")}; },
   at:function(S, s, p){ var k=p<0.35?0:p<0.6?1:2; tyre(s.g,["#d62d20","#d62d20","#f2d13c"][k]); s.Cw.forEach(function(b,i){ S.pose(b,i<4?"ready":"idle",0); }); s.g.position.y=p>0.3&&p<0.65?0.12:0; S.u.show(s.l,p>0.6); if(p>0.7) at(s.g,10+S.ease(S.seg(p,0.7,1))*30,PIT); }},
  {t:["2026: aero aktif & mod potong","2026: active aero and overtake mode"], x:["Mulai 2026, DRS diganti oleh aerodinamik aktif: sayap hadapan dan belakang dibuka di bahagian lurus untuk semua kereta. Pemandu dalam lingkungan 1 saat di belakang boleh guna 'mod potong' (tenaga elektrik tambahan) ⚠.","From 2026, DRS is replaced by active aerodynamics: the front and rear wings open on straights for every car. A driver within 1 second behind can use 'overtake mode' (extra electrical energy) ⚠."], cam:side(10,-26,6), dur:5,
   set:function(S){ return {a:car(S,3), b:car(S,0), l:S.st.label("⚡ OVERTAKE",0,0,0,0.7,"#CBFA1E")}; },
   at:function(S, s, p){ var d=-45+p*100, q=S.seg(p,0.3,0.9); at(s.a,d,0); at(s.b,d-10+q*20,q*3.5*(q<0.95?1:1)); [s.a,s.b].forEach(function(g){ g.userData.flap.rotation.x=0.9; spin(g,80,0.016); }); s.l.position.set(s.b.position.x,2.6,s.b.position.z); S.u.show(s.l,p>0.25&&p<0.8); }},
  {t:["Had trek","Track limits"], x:["Garisan putih menanda tepi trek. Jika keempat-empat tayar melepasinya, masa pusingan kelayakan dibatalkan; dalam perlumbaan, amaran dan kemudian penalti masa.","The white lines mark the track edge. If all four wheels cross it, a qualifying lap time is deleted; in the race, warnings and then a time penalty."], cam:[[155,10,-150],[150,0,-110]], dur:4,
   set:function(S){ return {g:car(S,4), x:S.st.label("✗ TRACK LIMITS",160,4,-115,0.7,"#ff6b6b")}; },
   at:function(S, s, p){ var i0=C.findIndex(function(c){ return c.x>130&&c.z<-120; }), d=i0*STEP-30+p*90, wide=Math.sin(S.seg(p,0.35,0.75)*PI)*(TW/2+2.4); at(s.g,d,-wide*Math.sign(C[(i0+10)%N].k||1)); spin(s.g,45,0.016); S.u.show(s.x,p>0.5&&p<0.8); }},
  {t:["Penalti","Penalties"], x:["Penalti masa 5 atau 10 saat, drive-through atau stop-go di lorong pit, penalti grid untuk perlumbaan seterusnya, dan mata penalti pada lesen: 12 mata dalam 12 bulan = digantung satu perlumbaan.","5 or 10-second time penalties, a drive-through or stop-go in the pit lane, grid penalties for the next race, and penalty points on the licence: 12 points in 12 months = a one-race ban."], cam:(function(){ var a=P(0,PIT-12), b=P(20,PIT); return [[a[0],6,a[1]],[b[0],0.5,b[1]]]; })(), dur:5,
   set:function(S){ var g=car(S,5); return {g:g, L:["+5 s","+10 s","DRIVE-THROUGH","STOP-GO"].map(function(t){ return S.st.label(t,0,0,0,0.8,"#f2c94c"); })}; },
   at:function(S, s, p){ at(s.g,-50+p*130,PIT); spin(s.g,22,0.016); var k=Math.min(3,Math.floor(p*4)); s.L.forEach(function(l,i){ l.visible=i===k; l.position.set(s.g.position.x,3,s.g.position.z); }); }}],
 quiz:[
  {q:["Mata untuk tempat pertama?","Points for 1st place?"], a:[["25","25"],["10","10"],["18","18"]], ok:0, why:["25-18-15-12-10-8-6-4-2-1.","25-18-15-12-10-8-6-4-2-1."]},
  {q:["Bendera biru bermaksud…","A blue flag means…"], a:[["Beri laluan kepada kereta lebih laju","Let a faster car through"],["Bahaya di hadapan","Danger ahead"],["Sesi dihentikan","Session stopped"]], ok:0, why:["Untuk kereta yang dipintas pusingan.","For a car about to be lapped."]},
  {q:["Bila perlumbaan bermula?","When does the race start?"], a:[["Apabila 5 lampu merah padam","When the 5 red lights go out"],["Apabila lampu hijau menyala","When a green light comes on"],["Apabila bendera dikibar","When a flag is waved"]], ok:0, why:["Lampu padam = mula.","Lights out = go."]},
  {q:["Semasa kereta keselamatan, pemandu…","Behind the safety car, drivers…"], a:[["Tidak boleh memotong","May not overtake"],["Boleh memotong","May overtake"],["Mesti masuk pit","Must pit"]], ok:0, why:["Semua beratur di belakangnya.","Everyone queues behind it."]},
  {q:["Tayar lembut berwarna…","Soft tyres are marked…"], a:[["Merah","Red"],["Putih","White"],["Biru","Blue"]], ok:0, why:["Lembut merah, sederhana kuning, keras putih.","Soft red, medium yellow, hard white."]}],
 game:{ name:["Lumba masa satu pusingan","Lap time trial"], help:["Tahan sebelah kiri atau kanan skrin untuk membelok (atau anak panah ←/→). Tahan kedua-dua belah (atau ↓) untuk brek. Kereta memecut sendiri. Brek sebelum selekoh apabila tertulis BRAKE. Keluar trek = +5 s pada pusingan itu. 3 pusingan; kereta lutsinar ialah pusingan terbaik anda. Masa pusingan terbaik paling rendah menang.","Hold the left or right side of the screen to steer (or the ←/→ keys). Hold both sides (or ↓) to brake. The car accelerates by itself. Brake before corners when you see BRAKE. Leaving the track = +5 s on that lap. 3 laps; the see-through car is your best lap. The lowest best lap wins."], unit:["s","s"], lower:true,
  cam:[0,6,-170], at:[20,0,-150],
  start:function(G){ var S=G.S; G.car=car(S,0); G.gh=car(S,0,{ghost:true}); G.gh.visible=false; var p=P(-8,-3.2); G.x=p[0]; G.z=p[1]; G.h=p[2]; G.v=0; G.st=0; G.i=N-4; G.ph=0; G.t=0; G.lap=0; G.lt=0; G.best=null; G.half=false; G.off=false; G.rec=[]; G.ghost=gm0().gh0||null; G.P={}; G.K={}; G.hu(); },
  step:function(G, dt){ var S=G.S; dt=Math.min(Math.max(dt,0),0.05); G.t+=dt;
   if(G.ph===0){ var n=Math.min(5,Math.floor(G.t/0.6)); if(!G.out) G.out=3.0+Math.random()*0.8; if(G.t>=G.out){ G.ph=1; G.lt=0; G.hu("GO!"); S.vib(30); } else G.hu("🔴".repeat(n)+"⚫".repeat(5-n)); G.place(); return; }
   var L=0, R=0, k; for(k in G.P){ if(G.P[k]<0) L++; else R++; } if(G.K.l) L++; if(G.K.r) R++; var brake=(L&&R)||G.K.d, tgt=brake?0:(R?1:L?-1:0); G.st+=(tgt-G.st)*Math.min(1,dt*7);
   var sub=Math.ceil(dt/0.01), h=dt/sub; for(var u=0;u<sub;u++){ var alat=22+0.0045*G.v*G.v, w=G.st*1.25, wmax=alat/Math.max(G.v,3); if(Math.abs(w)>wmax) w=Math.sign(w)*wmax; G.h-=w*h;
     if(brake) G.v=Math.max(0,G.v-40*h); else G.v+=13*(1-G.v/92)*h; G.v-=Math.abs(G.st)*G.v*0.05*h;
     var c=C[G.i], lat=(G.x-c.x)*c.nx+(G.z-c.z)*c.nz; if(Math.abs(lat)>TW/2+0.6){ if(G.v>26) G.v-=28*h; if(!G.off){ G.off=true; G.hu(S.L2("Keluar trek! +5 s","Off track! +5 s")); S.vib(40); } }
     G.x+=Math.sin(G.h)*G.v*h; G.z+=Math.cos(G.h)*G.v*h; }
   var bi=G.i, bd=1e9; for(var d=-10; d<=40; d++){ var j=(G.i+d+N)%N, q=C[j], dd=(q.x-G.x)*(q.x-G.x)+(q.z-G.z)*(q.z-G.z); if(dd<bd){ bd=dd; bi=j; } }
   if(bd>40*40){ var c2=C[G.i]; G.x=c2.x; G.z=c2.z; G.h=Math.atan2(c2.tx,c2.tz); G.v=12; G.lt+=3; G.hu(S.L2("Dipulihkan +3 s","Recovered +3 s")); }
   if(bi<20 && G.i>N-30 && G.half){ G.lapDone(); } if(bi>N/2-20 && bi<N/2+20) G.half=true; G.i=bi; G.lt+=dt;
   G.rt=(G.rt||0)+dt; if(G.rt>=0.1){ G.rt=0; G.rec.push([G.x,G.z,G.h]); }
   if(G.ghost){ var gi=Math.min(G.ghost.length-1,Math.floor(G.lt/0.1)); var gp=G.ghost[gi]; G.gh.visible=G.lap>0; G.gh.position.set(gp[0],0,gp[1]); G.gh.rotation.y=gp[2]; spin(G.gh,60,dt,0); }
   spin(G.car,G.v,dt,G.st); G.place();
   var ahead=0; for(var a2=2;a2<Math.max(20,G.v*2.6/STEP);a2++) ahead=Math.max(ahead,Math.abs(C[(G.i+a2)%N].k)); var vok=ahead>0?Math.sqrt((22+0.0045*G.v*G.v)/ahead):999;
   G.hint=G.v>vok*1.1; if((G.ht=(G.ht||0)+dt)>0.15){ G.ht=0; G.hu(); }
   if(G.t>300) return G.end(G.best!=null?G.best:999.9, G.best!=null?G.best.toFixed(2)+" s":"DNF"); },
  press:function(G, e){ var r=G.S.st.cnv.getBoundingClientRect(); G.P[e.pointerId]=(e.clientX<r.left+r.width/2)?-1:1; },
  tap:function(G, e){ if(e) delete G.P[e.pointerId]; }, swipe:function(){} }};
function gm0(){ return SPORTS.f1.game; }
var gm=SPORTS.f1.game, st0=gm.start, sp0=gm.step; gm.step=function(G, dt, t){ if(!G.h0){ G.h0=1; G.hu(); } if(!G.over) sp0(G, dt, t); };
gm.start=function(G){ var S=G.S, st=S.st, cnv=st.cnv; G.game=gm; st.__f1=G;
  G.hu=function(msg){ if(G.ph===0 && !msg) msg="🔴"; S.hud('🏎️ '+S.L2("Pusingan ","Lap ")+Math.min(3,G.lap+1)+'/3 · '+(G.lt||0).toFixed(1)+' s'+(G.best!=null?' · '+S.L2("Terbaik ","Best ")+G.best.toFixed(2):'')+' · '+Math.round((G.v||0)*3.6)+' km/h'+(G.off?' · ⚠ +5 s':'')+(G.hint?'  ·  🟥 BRAKE!':'')+(msg?'  ·  '+msg:'')); };
  G.place=function(){ G.car.position.set(G.x,0,G.z); G.car.rotation.y=G.h; var fx=Math.sin(G.h), fz=Math.cos(G.h); st.setCam([G.x-fx*10, 3.6, G.z-fz*10],[G.x+fx*10, 0.8, G.z+fz*10], G.ph===0); };
  G.lapDone=function(){ var tm=G.lt+(G.off?5:0); G.lap++; G.half=false; if(G.best==null||tm<G.best){ G.best=Math.round(tm*100)/100; G.ghost=G.rec; gm.gh0=G.rec; } G.hu(S.L2("Pusingan ","Lap ")+tm.toFixed(2)+" s"+(G.off?" (+5)":"")); S.vib(30);
    G.lt=0; G.off=false; G.rec=[]; if(G.lap>=3) G.end(G.best, G.best.toFixed(2)+" s "+S.L2("pusingan terbaik","best lap")); };
  function alive(){ return st.__f1===G && !G.over && document.body.contains(cnv); }
  function up(e){ if(!alive()){ off(); return; } delete G.P[e.pointerId]; }
  function key(e, on){ if(!alive()){ off(); return; } var k=e.key; if(k==="ArrowLeft") G.K.l=on; else if(k==="ArrowRight") G.K.r=on; else if(k==="ArrowDown"||k===" ") G.K.d=on; else return; e.preventDefault&&e.preventDefault(); }
  function kd(e){ key(e,true); } function ku(e){ key(e,false); }
  function off(){ cnv.removeEventListener("pointerup",up); cnv.removeEventListener("pointercancel",up); cnv.removeEventListener("pointerleave",up); window.removeEventListener("keydown",kd); window.removeEventListener("keyup",ku); }
  cnv.addEventListener("pointerup",up); cnv.addEventListener("pointercancel",up); cnv.addEventListener("pointerleave",up); window.addEventListener("keydown",kd); window.addEventListener("keyup",ku);
  var e0=G.end; G.end=function(a,b){ off(); e0(a,b); };
  st0(G); };
})();
