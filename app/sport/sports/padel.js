/* My Ihsan Sports: Padel. Court 20 × 10 m, fully enclosed: back walls glass 3 m + 1 m mesh, side walls glass for the back 2–4 m, mesh elsewhere (check);
   net 0.88 m centre, 0.92 m posts; service lines 6.95 m from the net. FIP rules, rules as of 2026 (check golden point / Star Point). */
(function(){
"use strict";
var L=20, HL=10, W=10, SV=6.95, NET=0.88, B=0.065;
function pb(S){ return S.st.ball(B*2.2, "#e6f23c"); }
function racket(S, b){ var T=S.T, r=new T.Group(); var h=new T.Mesh(new T.CylinderGeometry(0.016,0.016,0.15,6), new T.MeshLambertMaterial({color:0x222222})); h.position.y=-0.07; r.add(h);
  var f=new T.Mesh(new T.CylinderGeometry(0.13,0.13,0.035,20), new T.MeshLambertMaterial({color:0x2b2b2b})); f.rotation.x=Math.PI/2; f.scale.set(1,1,1.15); f.position.y=-0.3; r.add(f); r.position.y=-0.3; b.userData.J.elR.add(r); return r; }
SPORTS.padel={ id:"padel", v:"2026", H:1.80, cam:[13,9,15], sky:"#2a2f3a", ground:"#3b3f4a",
 field:function(K){ var T=window.THREE; K.rect(W+2, L+2, "#1f4f7a"); K.rect(W, L, "#2d6fb0", 0.002); K.lineW=0.05;
   [-1,1].forEach(function(s){ K.line(-W/2,s*SV,W/2,s*SV,0.05); }); K.line(0,-SV,0,SV,0.05);
   var glass=new T.MeshPhongMaterial({color:0xbfe6ff, transparent:true, opacity:0.18, side:T.DoubleSide, depthWrite:false}), mesh=function(w, h, x, y, z, ry){ var c=document.createElement("canvas"); c.width=c.height=32; var g=c.getContext("2d"); g.strokeStyle="rgba(30,30,30,.8)"; g.lineWidth=2; g.beginPath(); g.moveTo(0,0); g.lineTo(32,32); g.moveTo(32,0); g.lineTo(0,32); g.stroke();
       var tx=new T.CanvasTexture(c); tx.wrapS=tx.wrapT=T.RepeatWrapping; tx.repeat.set(w/0.06, h/0.06); var m=new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({map:tx, transparent:true, side:T.DoubleSide, depthWrite:false})); m.position.set(x, y, z); m.rotation.y=ry||0; K.root.add(m); },
     pane=function(w, h, x, y, z, ry){ var m=new T.Mesh(new T.PlaneGeometry(w, h), glass); m.position.set(x, y, z); m.rotation.y=ry||0; K.root.add(m); };
   [-1,1].forEach(function(s){ pane(W, 3, 0, 1.5, s*HL); mesh(W, 1, 0, 3.5, s*HL);
     [-1,1].forEach(function(x){ pane(4, 3, x*W/2, 1.5, s*(HL-2), Math.PI/2); mesh(6, 3, x*W/2, 1.5, s*(HL-7), Math.PI/2); }); });
   K.post(-W/2,0,0.92,0.04,"#ddd"); K.post(W/2,0,0.92,0.04,"#ddd"); K.net(-W/2,W/2,0,0.02,NET,"rgba(20,20,20,.75)",0.05); return {w:W,l:L}; },
 facts:[[["Gelanggang","Court"],"20 × 10 m"],[["Dinding belakang","Back walls"],"kaca 3 m + jaring 1 m / glass 3 m + 1 m mesh"],[["Jaring (tengah / tiang)","Net (centre / posts)"],"0.88 m / 0.92 m"],[["Garisan servis dari jaring","Service line from the net"],"6.95 m"]],
 zones:[
  {n:["Petak servis","Service box"], d:["Servis menyerong mesti mendarat di sini, antara jaring dan garisan servis.","A diagonal serve must land here, between the net and the service line."], p:[[0,0],[W/2,0],[W/2,SV],[0,SV]]},
  {n:["Dinding kaca belakang","Back glass wall"], d:["Selepas melantun, bola boleh kena dinding dan masih boleh dimainkan.","After the bounce, the ball may hit the wall and stay in play."], p:[[-W/2,HL-0.5],[W/2,HL-0.5],[W/2,HL],[-W/2,HL]]},
  {n:["Kawasan belakang","Back court"], d:["Antara garisan servis dan dinding belakang: tempat server berdiri.","Between the service line and the back wall: where the server stands."], p:[[-W/2,-SV],[W/2,-SV],[W/2,-HL],[-W/2,-HL]]}],
 cards:[
  {t:["Sentiasa beregu","Always doubles"], x:["Padel dimainkan 2 lawan 2 dalam gelanggang berdinding.","Padel is played 2 vs 2 in a walled court."], cam:[[10,10,-14],[0,0,0]], dur:4,
   set:function(S){ [[-2.5,-7],[2.5,-7],[-2.5,7],[2.5,7]].forEach(function(q,i){ var b=S.st.body(S.H,S.team(i<2?0:1)); racket(S,b); S.place(b,q[0],q[1],i<2?0:Math.PI); }); return {}; }, at:function(){}},
  {t:["Servis bawah selepas lantunan","Underhand serve after a bounce"], x:["Lantunkan bola sekali, pukul pada atau di bawah paras pinggang, menyerong ke petak servis lawan.","Bounce the ball once, hit it at or below the waist, diagonally into the opponent's service box."], cam:[[6,2.5,-13],[0,0.8,-4]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); racket(S,a); S.place(a,2,-HL+1,0); return {a:a, b:pb(S), z:S.u.zone(-W/2,0,0,SV,"#CBFA1E",0.3)}; },
   at:function(S, s, p){ if(p<0.25){ s.b.position.set(1.7, 0.9-Math.sin(p/0.25*Math.PI)*0.85, -HL+1.3); } else S.u.arc(s.b,[1.7,0.6,-HL+1.3],[-2.5,0.05,4.5],1.2,S.seg(p,0.3,0.85)); S.pose(s.a,"swing",S.seg(p,0.2,0.35)); }},
  {t:["Lantun dulu, baru dinding","Bounce first, then the walls"], x:["Bola mesti melantun di gelanggang lawan sebelum kena mana-mana dinding.","The ball must bounce in the opponent's court before it touches any wall."], cam:[[8,5,6],[0,1,6]], dur:3,
   set:function(S){ return {b:pb(S)}; }, at:function(S, s, p){ if(p<0.5) S.u.arc(s.b,[0,1.2,-3],[0.5,0.05,7.5],1.5,p/0.5); else S.u.arc(s.b,[0.5,0.05,7.5],[0.7,1.6,HL-0.05],0.5,(p-0.5)/0.5); }},
  {t:["Bola dari dinding masih hidup","Off the walls it stays in"], x:["Selepas melantun, bola boleh kena dinding kaca dan anda masih boleh memukulnya.","After the bounce, the ball can bounce off the glass and you may still play it."], cam:[[7,3,-3],[0,1,-7]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); racket(S,a); S.place(a,0.4,-7,Math.PI); return {a:a, b:pb(S)}; },
   at:function(S, s, p){ if(p<0.35) S.u.arc(s.b,[0,1,2],[0.2,0.05,-8.2],1.4,p/0.35); else if(p<0.6) S.u.arc(s.b,[0.2,0.05,-8.2],[0.3,1.4,-HL+0.05],0.4,(p-0.35)/0.25); else S.u.arc(s.b,[0.3,1.4,-HL+0.05],[0.4,1,-7.6],0.3,(p-0.6)/0.2); S.pose(s.a,"swing",S.seg(p,0.75,0.95)); }},
  {t:["Main dinding sendiri","Use your own walls"], x:["Anda boleh pukul bola ke dinding sendiri supaya ia melantun ke seberang jaring.","You may hit the ball against your own wall so it rebounds over the net."], cam:[[8,4,-6],[0,1.2,-6]], dur:3,
   set:function(S){ return {b:pb(S)}; }, at:function(S, s, p){ if(p<0.4) S.u.arc(s.b,[0,1,-8],[0,2,-HL+0.05],0.2,p/0.4); else S.u.arc(s.b,[0,2,-HL+0.05],[0,0.05,4],3,(p-0.4)/0.6); }},
  {t:["Kesalahan","Faults"], x:["Bola kena jaring dawai atau dinding sebelum melantun (terus), atau melantun dua kali di gelanggang anda = kesalahan.","The ball hitting the mesh or a wall on the full, or bouncing twice in your court, is a fault."], cam:[[8,4,6],[0,1.5,9]], dur:3,
   set:function(S){ return {b:pb(S), lb:S.st.label("FAULT",0,2.6,8,0.8,"#ff6b6b")}; }, at:function(S, s, p){ S.u.arc(s.b,[0,1.2,0],[1,2.2,HL-0.05],0.8,S.seg(p,0,0.6)); S.u.show(s.lb,p>0.6); }},
  {t:["Mata macam tenis","Scoring like tennis"], x:["15, 30, 40, game; set hingga 6 game dengan beza 2, perlawanan 3 set terbaik.","15, 30, 40, game; sets to 6 games with a 2-game lead, matches best of 3 sets."], cam:[[0,4,-15],[0,1.5,0]], dur:4,
   set:function(S){ return {lb:S.st.label("15 - 0",0,2.4,0,1)}; }, at:function(S, s, p){ var seq=["15 - 0","30 - 0","40 - 15","GAME ✓"], i=Math.min(3,Math.floor(p*4)); if(s.k!==i){ s.k=i; s.lb.parent.remove(s.lb); s.lb=S.st.label(seq[i],0,2.4,0,1); } }},
  {t:["Golden point","Golden point"], x:["Dalam kebanyakan kejohanan, pada 40-40 satu mata penentu (golden point) memutuskan game. Sesetengah kejohanan guna Star Point. Semak peraturan kejohanan.","In most events, at 40-40 a single deciding point (golden point) settles the game. Some events use the Star Point instead. Check the event's rules."], cam:[[0,4,-15],[0,1.5,0]], dur:3,
   set:function(S){ return {lb:S.st.label("40 - 40 → ★",0,2.4,0,1)}; }, at:function(){}},
  {t:["Keluar ikut pintu","Playing outside the court"], x:["Di peringkat tinggi, pemain boleh keluar ikut pintu tepi untuk memukul bola yang terkeluar dari gelanggang.","At high level, players may run out through the side doors to play a ball that has bounced out of the court."], cam:[[12,5,0],[W/2,1,-2]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); racket(S,a); return {a:a, b:pb(S)}; }, at:function(S, s, p){ S.u.mv(s.a,2,-4,W/2+2,-1,S.seg(p,0,0.6)); S.u.arc(s.b,[0,1,4],[W/2+2.3,0.5,-1],2,S.seg(p,0,0.6)); }},
  {t:["Pukulan: bandeja, víbora","Shots: bandeja, víbora"], x:["Bandeja (pukulan atas yang dikawal), víbora (dengan putaran), lob (tinggi ke belakang) dan smash.","Bandeja (a controlled overhead), víbora (with spin), lob (high to the back) and the smash."], cam:[[6,3,-9],[0,1.6,-3]], dur:6,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); racket(S,a); S.place(a,0,-4,0); return {a:a, b:pb(S), l:[S.st.label("BANDEJA",0,3.6,-2,0.6),S.st.label("LOB",0,3.6,-2,0.6),S.st.label("SMASH",0,3.6,-2,0.6,"#ff6b6b")]}; },
   at:function(S, s, p){ var k=Math.floor(p*3), q=(p*3)%1; s.l.forEach(function(x,i){ S.u.show(x,i===k); }); S.pose(s.a,k===1?"swing":"smash",q); var to=[[1,0.05,6],[0,0.05,9],[0.5,0.05,3]][k], h=[1,5,0.2][k]; S.u.arc(s.b,[0,2.6,-3.7],to,h,S.seg(q,0.35,0.9)); }}],
 quiz:[
  {q:["Padel dimainkan…","Padel is played…"], a:[["Perseorangan","Singles"],["Beregu","Doubles"]], ok:1, why:["Sentiasa beregu.","Always doubles."]},
  {q:["Bola terus kena dinding tanpa lantunan. Ini…","The ball hits the wall without bouncing first. That is…"], a:[["Masuk","In"],["Kesalahan","A fault"]], ok:1, why:["Mesti melantun dahulu.","It must bounce first."]},
  {q:["Selepas lantunan, bola kena dinding kaca. Masih boleh dimainkan?","After the bounce the ball hits the glass. Still in play?"], a:[["Ya","Yes"],["Tidak","No"]], ok:0, why:["Ya, itu ciri utama padel.","Yes, that is what makes padel special."]},
  {q:["Servis padel dibuat…","A padel serve is hit…"], a:[["Atas kepala","Overhead"],["Di bawah pinggang selepas lantunan","At or below the waist after a bounce"]], ok:1, why:["Servis bawah selepas lantunan.","Underhand after a bounce."]},
  {q:["Pada 40-40 dalam kebanyakan kejohanan…","At 40-40 in most events…"], a:[["Golden point","Golden point"],["Tiebreak","Tiebreak"]], ok:0, why:["Satu mata penentu.","One deciding point."]}],
 game:SportView.rally({ name:["Rali dinding","Wall rally"], help:["Bola melantun di belakang anda, kena kaca, kemudian datang ke bulatan: ketik pada masa itu. Leret untuk menghala. Yang pertama 7 mata.","The ball bounces behind you, hits the glass, then comes to the ring: tap then. Swipe to aim. First to 7 points."],
   icon:"🎾", cam:[0,3.4,-HL+1.2], at:[0,1,1], me:[0,-7], op:[0,7], win:7, ball:pb, gear:racket,
   inPath:function(G){ var x=(Math.random()-0.5)*3; return {pts:[[0,1,7],[x*0.7,0.05,-8.4],[x*0.8,1.5,-HL+0.05],[x,1,-7.4]], hs:[1.6,0.4,0.3], d:Math.max(1.3,1.8-G.rally*0.05)}; },
   outPath:function(G, aim){ var x=aim*3+(Math.random()-0.5); return {pts:[[G.b.position.x,G.b.position.y,G.b.position.z],[x,0.05,7.5],[x,1,8.4]], hs:[1.6,0.4], d:1.1}; },
   ai:function(G, aim){ return 0.12+0.04*G.rally+(aim?0.12:0); } }) };
})();
