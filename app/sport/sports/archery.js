/* My Ihsan Sports: Archery (outdoor target, recurve). Olympic distance 70 m; target face Ø 122 cm, 10 scoring rings + inner X; centre 1.30 m above the ground.
   World Archery Constitution and Rules, Book 3 (target archery), rules as of 2026.
   The Sunnah note is placeholder text until the ustaz adds the reviewed hadith and reference (notes/MEMORY.md: religious text needs review). */
(function(){
"use strict";
var D=70, HZ=35, FACE=1.22, RW=FACE/20, CY=1.30, TZ=HZ;
var COLS=["#f7f7f2","#f7f7f2","#2b2b2b","#2b2b2b","#3a8fd6","#3a8fd6","#e23b3b","#e23b3b","#f6d21a","#f6d21a"];
function face(K){ var T=window.THREE, g=new T.Group();
  var boss=new T.Mesh(new T.BoxGeometry(1.35,1.35,0.35), new T.MeshLambertMaterial({color:0xc9b27a})); boss.position.z=0.2; g.add(boss);
  for(var i=0;i<10;i++){ var r0=(9-i)*RW, r1=(10-i)*RW; var m=new T.Mesh(new T.RingGeometry(r0, r1, 48), new T.MeshBasicMaterial({color:new T.Color(COLS[i]), side:T.DoubleSide})); m.position.z=-0.001*i; g.add(m);
    var e=new T.Mesh(new T.RingGeometry(r1-0.003, r1, 48), new T.MeshBasicMaterial({color:new T.Color(i<2?"#333":"#fff"), side:T.DoubleSide})); e.position.z=-0.012; g.add(e); }
  var x=new T.Mesh(new T.RingGeometry(RW/2-0.002, RW/2, 32), new T.MeshBasicMaterial({color:0x333333, side:T.DoubleSide})); x.position.z=-0.013; g.add(x);
  g.position.set(0, CY, TZ); g.rotation.x=-0.17; K.root.add(g);
  [-0.55,0.55].forEach(function(s){ K.bar(s, 0, TZ+0.9, s*0.9, CY+0.6, TZ+0.15, 0.03, "#8a6a3d"); }); K.bar(0, 0, TZ+0.9, 0, CY+0.6, TZ+0.2, 0.03, "#8a6a3d"); return g; }
function bow(S, b){ var T=S.T, g=new T.Group(); var lim=new T.Mesh(new T.TorusGeometry(0.62, 0.012, 4, 24, Math.PI*0.85), new T.MeshLambertMaterial({color:0x2b2f3a})); lim.rotation.z=Math.PI/2+Math.PI*0.075; lim.position.x=-0.55; g.add(lim);
  var str=new T.Mesh(new T.CylinderGeometry(0.002,0.002,1.1,4), new T.MeshBasicMaterial({color:0xdddddd})); str.position.x=-0.02; g.add(str); g.rotation.y=Math.PI/2; g.position.y=-0.33; b.userData.J.elL.add(g); return g; }
function arrow(S){ var T=S.T, g=new T.Group(); var sh=new T.Mesh(new T.CylinderGeometry(0.007,0.007,0.75,6), new T.MeshLambertMaterial({color:0x2b2f3a})); sh.rotation.x=Math.PI/2; g.add(sh);
  var f=new T.Mesh(new T.BoxGeometry(0.002,0.03,0.07), new T.MeshLambertMaterial({color:0xff5a5a})); f.position.z=-0.33; g.add(f); var f2=f.clone(); f2.rotation.z=Math.PI/2; g.add(f2); S.st.add(g); return g; }
function score(r){ if(r<=RW/2) return {s:10, x:true}; var s=10-Math.floor(r/RW); return {s:s<1?0:s, x:false}; }
SPORTS.archery={ id:"archery", v:"2026", H:1.76, cam:[12,6,-42], ground:"#4c9a4f",
 field:function(K){ K.rect(24, D+12, "#58a85a"); K.lineW=0.08; K.line(-10,-HZ,10,-HZ,0.1); K.line(-10,-HZ-5,10,-HZ-5,0.06,"#f2c94c");
   [-1,1].forEach(function(s){ K.line(s*2.5,-HZ,s*2.5,TZ,0.04,"#cfe8cf"); }); [-30,-20,-10,0,10,20].forEach(function(z){ K.label((z+HZ)+" m",-4,0.3,z,0.5); });
   face(K); return {w:24,l:D+8}; },
 zoneY:0,
 facts:[[["Jarak (Olimpik, recurve)","Distance (Olympic, recurve)"],"70 m"],[["Muka sasaran","Target face"],"Ø 122 cm · 10 gelang / rings + X"],[["Tinggi pusat","Centre height"],"1.30 m"],[["Busur kompaun","Compound"],"50 m · Ø 80 cm"],[["Masa (luar)","Time (outdoor)"],"4 min / 6 anak panah · arrows"]],
 zones:[
  {n:["Garisan menembak","Shooting line"], d:["Pemanah berdiri mengangkangi garisan ini semasa menembak.","Archers stand astride this line while shooting."], p:[[-10,-HZ-0.6],[10,-HZ-0.6],[10,-HZ+0.6],[-10,-HZ+0.6]]},
  {n:["Garisan menunggu","Waiting line"], d:["Tunggu di belakang garisan ini (5 m di belakang) sehingga isyarat wisel.","Wait behind this line (5 m back) until the whistle."], p:[[-10,-HZ-8],[10,-HZ-8],[10,-HZ-4.5],[-10,-HZ-4.5]]},
  {n:["Lorong sasaran","Target lane"], d:["Jangan masuk ke lorong ini semasa tembakan berjalan.","Never walk into the range while shooting is on."], p:[[-2.5,-HZ+1],[2.5,-HZ+1],[2.5,TZ-1],[-2.5,TZ-1]]},
  {n:["Zon keselamatan","Safety zone"], d:["Kawasan kosong di belakang sasaran untuk anak panah yang terlepas.","Clear ground behind the targets for arrows that miss."], p:[[-10,TZ+1],[10,TZ+1],[10,TZ+5],[-10,TZ+5]]}],
 cards:[
  {t:["🕌 Sukan sunnah","🕌 A Sunnah sport"], x:["Memanah termasuk sukan yang digalakkan dalam tradisi Islam, bersama berenang dan menunggang kuda. (Teks hadis dan rujukan akan ditambah selepas disemak oleh ustaz.)","Archery is among the sports encouraged in the Islamic tradition, together with swimming and horse riding. (The hadith text and reference will be added after review by the ustaz.)"], cam:[[4,2.2,-HZ-4],[0,1.4,-HZ+2]], dur:6,
   set:function(S){ var a=S.st.body(S.H,S.team(2)); bow(S,a); S.place(a,0,-HZ,Math.PI/2); return {a:a}; }, at:function(S, s, p){ S.pose(s.a,"point",0); s.a.userData.J.shL.rotation.set(0,0,-1.55); }},
  {t:["Sasaran 10 gelang","A 10-ring target"], x:["Muka sasaran 122 cm ada 10 gelang: kuning 10 dan 9, merah 8 dan 7, biru 6 dan 5, hitam 4 dan 3, putih 2 dan 1.","The 122 cm face has 10 rings: gold 10 and 9, red 8 and 7, blue 6 and 5, black 4 and 3, white 2 and 1."], cam:[[0,CY,TZ-3],[0,CY,TZ]], dur:4,
   set:function(S){ return {l:S.st.label("10",0,CY+0.15,TZ-0.3,0.25)}; }, at:function(){}},
  {t:["Kena garisan = mata tinggi","On the line scores higher"], x:["Jika anak panah menyentuh garisan antara dua gelang, ia diberi mata gelang yang lebih tinggi.","If an arrow touches the line between two rings, it scores the higher ring."], cam:[[0.4,CY+0.2,TZ-1.2],[0.2,CY,TZ]], dur:4,
   set:function(S){ var a=arrow(S); a.position.set(3*RW,CY,TZ-0.35); a.rotation.x=-0.17; return {a:a, l:S.st.label("9",0.3,CY+0.35,TZ-0.2,0.2)}; }, at:function(S, s, p){ S.u.show(s.l,p>0.4); }},
  {t:["X untuk seri","The X breaks ties"], x:["Gelang X di tengah tetap 10 mata, tetapi bilangan X digunakan untuk memutuskan seri.","The inner X still scores 10, but the number of X's is used to break ties."], cam:[[0,CY,TZ-1.4],[0,CY,TZ]], dur:4,
   set:function(S){ var a=arrow(S); a.position.set(0.01,CY,TZ-0.35); a.rotation.x=-0.17; return {l:S.st.label("X",0,CY+0.25,TZ-0.2,0.25)}; }, at:function(){}},
  {t:["Isyarat wisel","Whistle signals"], x:["2 wisel: ke garisan menembak. 1 wisel: mula menembak. 3 wisel: pergi ambil anak panah. 5 atau lebih: berhenti segera!","2 whistles: go to the shooting line. 1 whistle: start shooting. 3 whistles: go and collect arrows. 5 or more: stop at once!"], cam:[[6,3,-HZ-6],[0,1,-HZ]], dur:6,
   set:function(S){ var j=S.st.body(1.75,S.team(3)); S.place(j,6,-HZ-2,-Math.PI/2); return {j:j, lb:S.st.label("📯",6,2.6,-HZ-2,0.7)}; }, at:function(S, s, p){ S.pose(s.j,"whistle",0); var n=[2,1,3,5][Math.min(3,Math.floor(p*4))]; if(s.n!==n){ s.n=n; s.lb.parent.remove(s.lb); s.lb=S.st.label("📯 ×"+n,6,2.6,-HZ-2,0.7); } }},
  {t:["Satu set = 3 anak panah","An end of arrows"], x:["Tembakan dibuat dalam 'end': 6 anak panah dalam 4 minit (luar). Dalam pertandingan set Olimpik, setiap set 3 anak panah.","Shooting is done in ends: 6 arrows in 4 minutes (outdoors). In Olympic set matches, each set is 3 arrows."], cam:[[0,CY,TZ-3],[0,CY,TZ]], dur:4,
   set:function(S){ var A=[[0.05,0.02],[-0.12,0.08],[0.2,-0.15]].map(function(q){ var a=arrow(S); a.position.set(q[0],CY+q[1],TZ-0.35); a.rotation.x=-0.17; a.visible=false; return a; }); return {A:A}; }, at:function(S, s, p){ s.A.forEach(function(a,i){ a.visible=p>i*0.25+0.1; }); }},
  {t:["Sistem set: 2, 1, 0","Set points: 2, 1, 0"], x:["Recurve: menang set = 2 mata, seri = 1, kalah = 0. Yang pertama ke 6 mata set menang. Seri 5–5: satu anak panah paling hampir ke tengah.","Recurve: win a set = 2 points, draw = 1, lose = 0. First to 6 set points wins. At 5–5: one arrow each, closest to the centre wins."], cam:[[0,3,TZ-10],[0,2,TZ]], dur:5,
   set:function(S){ return {lb:S.st.label("0 – 0",0,3,TZ-2,1)}; }, at:function(S, s, p){ var q=["0 – 0","2 – 0","3 – 1","5 – 1","7 – 1 ✓"], i=Math.min(4,Math.floor(p*5)); if(s.k!==i){ s.k=i; s.lb.parent.remove(s.lb); s.lb=S.st.label(q[i],0,3,TZ-2,1); } }},
  {t:["Tarik, sauh, lepas","Draw, anchor, release"], x:["Berdiri tegak sisi ke sasaran, tarik tali ke titik sauh yang sama di muka setiap kali, tahan, kemudian lepas dengan lembut.","Stand side-on to the target, draw the string to the same anchor point on your face every time, hold, then release smoothly."], cam:[[3,1.8,-HZ+2.5],[0,1.4,-HZ]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(2)); bow(S,a); S.place(a,0,-HZ,Math.PI/2); return {a:a}; },
   at:function(S, s, p){ var J=s.a.userData.J, q=S.seg(p,0.1,0.6); S.pose(s.a,"idle",0); J.shL.rotation.set(0,0,-1.55); J.shR.rotation.set(0,0,S.lerp(-1.5,-1.4,q)); J.elR.rotation.set(0,S.lerp(0,-2.4,q),0); if(p>0.8) J.elR.rotation.set(0,-1.5,0); }},
  {t:["Angin","Wind"], x:["Pada 70 m, angin boleh menolak anak panah beberapa sentimeter. Pemanah membidik sedikit ke arah angin datang.","At 70 m the wind can push an arrow several centimetres. Archers aim a little into the wind."], cam:[[8,6,-10],[0,1,10]], dur:4,
   set:function(S){ var a=arrow(S); return {a:a, lb:S.st.label("💨 →",-4,4,0,1)}; }, at:function(S, s, p){ var q=S.seg(p,0,0.8); s.a.position.set(S.lerp(-0.2,0.15,q*q),CY+Math.sin(q*Math.PI)*1.2,S.lerp(-HZ,TZ-0.4,q)); }},
  {t:["Keselamatan dahulu","Safety first"], x:["Tarik busur hanya di garisan menembak dan hala ke sasaran. Jangan sekali-kali menembak ke atas atau bila ada orang di lorong.","Draw only on the shooting line, pointing at the target. Never shoot upwards or when anyone is on the range."], cam:[[10,5,-HZ-6],[0,1,-HZ+10]], dur:3,
   set:function(S){ return {lb:S.st.label("⚠️",0,3,-HZ+12,1.4)}; }, at:function(){}}],
 quiz:[
  {q:["Jarak Olimpik recurve ialah…","The Olympic recurve distance is…"], a:[["50 m","50 m"],["70 m","70 m"],["90 m","90 m"]], ok:1, why:["70 m, sasaran 122 cm.","70 m, 122 cm target."]},
  {q:["Anak panah menyentuh garisan antara 8 dan 9 diberi…","An arrow touching the line between 8 and 9 scores…"], a:[["8","8"],["9","9"]], ok:1, why:["Gelang yang lebih tinggi.","The higher ring."]},
  {q:["Gelang kuning tengah bernilai…","The centre gold ring is worth…"], a:[["5","5"],["10","10"],["100","100"]], ok:1, why:["10, dan X di dalamnya juga 10.","10, and the X inside it is also 10."]},
  {q:["5 wisel atau lebih bermaksud…","5 or more whistles means…"], a:[["Mula menembak","Start shooting"],["Berhenti segera","Stop at once"]], ok:1, why:["Kecemasan: berhenti segera.","An emergency: stop at once."]},
  {q:["Dalam sistem set, menang satu set memberi…","In the set system, winning a set gives…"], a:[["1 mata","1 point"],["2 mata","2 points"],["10 mata","10 points"]], ok:1, why:["2 mata set; seri 1.","2 set points; a draw gives 1."]}],
 game:{ name:["Tarik & lepas","Draw and release"], help:["Tekan dan tahan untuk menarik busur: goyangan berkurang selepas sebentar. Gerakkan jari ke kiri atau kanan untuk melawan angin, kemudian angkat jari untuk melepas. 3 set × 3 anak panah.","Press and hold to draw: the sway settles after a moment. Slide your finger left or right to beat the wind, then lift to release. 3 ends × 3 arrows."], unit:["mata","pts"],
  cam:[0,CY+0.05,TZ-4.2], at:[0,CY,TZ],
  start:function(G){ var S=G.S; G.T=S.T; G.end_=0; G.n=0; G.tot=0; G.xs=0; G.A=[]; var T=S.T;
   var rm=new T.MeshBasicMaterial({color:0x00e5ff, side:T.DoubleSide, transparent:true, opacity:0.95, depthTest:false}); G.ret=new T.Group(); var rg=new T.Mesh(new T.RingGeometry(0.075,0.1,32), rm); rg.renderOrder=9; G.ret.add(rg); [[0.22,0.018],[0.018,0.22]].forEach(function(d){ var c=new T.Mesh(new T.PlaneGeometry(d[0],d[1]), rm); c.renderOrder=9; G.ret.add(c); }); S.st.add(G.ret); G.ret.rotation.x=-0.17; G.ret.visible=false;
   G.newEnd(); },
  step:function(G, dt, t){ var S=G.S; G.tm=(G.tm||0)+dt;
   if(G.dr!=null){ var h=G.tm-G.dr, A=h<1.2?S.lerp(0.32,0.05,h/1.2):h<3?0.05:Math.min(0.35,0.05+(h-3)*0.12); G.amp=A; var k=G.tm;
     G.ax=Math.sin(k*1.3+G.ph)*A*0.9+Math.sin(k*3.1)*A*0.25+G.nx; G.ay=Math.sin(k*1.7+G.ph*2)*A*0.8+Math.cos(k*2.6)*A*0.2;
     G.ret.visible=true; G.ret.position.set(G.ax, CY+G.ay, TZ-0.4); }
   var f=G.fly; if(f){ f.t+=dt/0.4; var q=Math.min(1,f.t); f.a.position.set(S.lerp(0,f.x,q), S.lerp(CY-0.1,f.y,q), S.lerp(TZ-4.2,TZ-0.36,q)); if(q>=1){ G.fly=null; G.land(f); } } },
  press:function(G, e){ if(G.fly||G.dr!=null||G.wait) return; G.dr=G.tm||0; G.ph=Math.random()*6; G.nx=0; G.x0=e.clientX; var c=G.S.st.cnv, w=c.getBoundingClientRect().width||300;
   c.onpointermove=function(ev){ if(G.dr!=null) G.nx=Math.max(-0.6,Math.min(0.6,(ev.clientX-G.x0)/w*1.2)); }; },
  tap:function(G){ G.rel(); }, swipe:function(G){ G.rel(); } }};
var gm=SPORTS.archery.game, st0=gm.start; gm.start=function(G){ var S=G.S;
  G.hu=function(msg){ var w=G.wind, ws=(w<0?"← ":"→ ")+Math.abs(w).toFixed(1)+" m/s"; S.hud('🏹 '+S.L2("Set ","End ")+(G.end_)+'/3 · '+S.L2("Anak panah ","Arrow ")+Math.min(3,G.n+1)+'/3 · '+G.tot+' '+S.L2("mata","pts")+' · 💨 '+ws+(msg?'  ·  '+msg:'')); };
  G.newEnd=function(){ G.A.forEach(function(a){ if(a.parent) a.parent.remove(a); }); G.A=[]; G.end_++; G.n=0; G.wind=Math.round((Math.random()*6-3)*10)/10; G.hu(); };
  G.rel=function(){ if(G.dr==null) return; var h=(G.tm||0)-G.dr; G.dr=null; G.ret.visible=false; if(S.st.cnv) S.st.cnv.onpointermove=null;
    var drop=h<0.5?-(0.5-h)*1.6:0, x=G.ax-G.wind*0.09+(Math.random()-0.5)*0.03, y=CY+G.ay+drop+(Math.random()-0.5)*0.03; var a=arrow(S); a.rotation.x=-0.17; G.A.push(a); G.fly={a:a, t:0, x:x, y:y}; S.vib(15); };
  G.land=function(f){ var r=Math.hypot(f.x, f.y-CY), sc=score(r), T=S.T; var mk=new T.Mesh(new T.CircleGeometry(0.03,16), new T.MeshBasicMaterial({color:0x111111, side:T.DoubleSide, depthTest:false})); mk.renderOrder=8; mk.position.set(f.x, f.y, TZ-0.37); mk.rotation.x=-0.17; S.st.add(mk); G.A.push(mk); G.tot+=sc.s; if(sc.x) G.xs++; G.n++; S.vib(sc.s>=9?40:15);
    G.hu(sc.s===0?S.L2("Terlepas","Miss"):(sc.x?"X!":sc.s)); if(G.n>=3){ G.wait=true; setTimeout(function(){ G.wait=false; if(G.over) return; if(G.end_>=3) return G.end(G.tot, G.tot+" / 90"+(G.xs?"  ·  "+G.xs+" X":"")); G.newEnd(); }, 1300); } };
  st0(G); };
})();
