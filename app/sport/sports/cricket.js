/* My Ihsan Sports: Cricket. Oval boundary radius ≈ 59–82 m (check per ground; 65 m drawn); pitch 20.12 m (22 yd) between the stumps × 3.05 m;
   stumps 71.1 cm high, wicket 22.86 cm wide; popping crease 1.22 m in front of the stumps; inner circle ≈ 27.4 m; ball Ø ≈ 7.2 cm.
   MCC Laws of Cricket and ICC playing conditions, rules as of 2026. */
(function(){
"use strict";
var PL=20.12, HP=10.06, PW=3.05, ST=0.711, WW=0.2286, PC=1.22, R=65, IC=27.4, B=0.072;
function cb(S){ var T=S.T, m=S.st.ball(B*2.4, "#b3261e"); var r=new T.Mesh(new T.TorusGeometry(B*1.2,B*0.08,4,20), new T.MeshLambertMaterial({color:0xf2efe8})); m.add(r); return m; }
function bat(S, b){ var T=S.T, r=new T.Group(); var h=new T.Mesh(new T.CylinderGeometry(0.018,0.018,0.28,6), new T.MeshLambertMaterial({color:0x333333})); h.position.y=-0.14; r.add(h);
  var bl=new T.Mesh(new T.BoxGeometry(0.108,0.56,0.04), new T.MeshLambertMaterial({color:0xe8d39a})); bl.position.y=-0.56; r.add(bl); r.position.y=-0.3; b.userData.J.elR.add(r); return r; }
function wicket(K, z){ [-1,0,1].forEach(function(i){ K.post(i*WW/2.4, z, ST, 0.017, "#f2e6c8"); }); K.bar(-WW/2, ST+0.01, z, WW/2, ST+0.01, z, 0.008, "#c9a646"); }
SPORTS.cricket={ id:"cricket", v:"2026", H:1.82, cam:[30,28,40], ground:"#3f7f45",
 field:function(K){ var T=window.THREE; var g=new T.Mesh(new T.CircleGeometry(R,64), new T.MeshLambertMaterial({color:0x4c9a4f})); g.rotation.x=-Math.PI/2; g.position.y=0.001; K.root.add(g);
   K.arc(0,0,R,0,Math.PI*2,0.3,"#ffffff"); K.arc(0,0,IC,0,Math.PI*2,0.12,"#ffffff");
   K.rect(PW, PL+2.4, "#c9b27a", 0.003); K.lineW=0.05; [-1,1].forEach(function(s){ var z=s*HP; K.line(-1.32,z,1.32,z,0.05); K.line(-1.8,z-s*PC,1.8,z-s*PC,0.05); K.line(-1.32,z,-1.32,z-s*PC,0.05); K.line(1.32,z,1.32,z-s*PC,0.05); wicket(K, z); }); return {w:2*R,l:2*R}; },
 facts:[[["Padang (jejari sempadan)","Ground (boundary radius)"],"≈ 59–82 m"],[["Pitch","Pitch"],"20.12 m (22 ela / yd) × 3.05 m"],[["Stump","Stumps"],"71.1 cm tinggi / high · wiket 22.86 cm"],[["Garisan popping","Popping crease"],"1.22 m"],[["Bulatan dalam","Inner circle"],"≈ 27.4 m (30 ela / yd)"],[["Bola","Ball"],"Ø ≈ 7.2 cm"]],
 zones:[
  {n:["Pitch","Pitch"], d:["Jalur 20.12 m antara dua set wiket. Pembaling membaling dari satu hujung ke hujung lain.","The 20.12 m strip between the two wickets. The bowler bowls from one end to the other."], p:[[-PW/2,-HP],[PW/2,-HP],[PW/2,HP],[-PW/2,HP]]},
  {n:["Bulatan dalam","Inner circle"], d:["Dalam perlawanan terhad over, bilangan pemadang di luar bulatan ini dihadkan.","In limited-overs games, the number of fielders outside this circle is limited."], p:(function(){ var a=[]; for(var i=0;i<24;i++){ var t=i/24*Math.PI*2; a.push([Math.cos(t)*IC, Math.sin(t)*IC]); } return a; })()},
  {n:["Slip","Slips"], d:["Pemadang di belakang pemukul, sebelah off, untuk menangkap bola yang tersentuh tepi bat.","Fielders behind the batter on the off side, to catch edges off the bat."], p:[[1,-HP-1],[6,-HP-3],[6,-HP-8],[1,-HP-6]]},
  {n:["Kawasan sempadan","Boundary area"], d:["Bola yang sampai ke sini selepas melantun = 4; tanpa melantun = 6.","A ball reaching here after bouncing = 4; without bouncing = 6."], p:(function(){ var a=[]; for(var i=0;i<=12;i++){ var t=i/12*Math.PI; a.push([Math.cos(t)*(R-0.5), Math.sin(t)*(R-0.5)]); } for(var j=12;j>=0;j--){ var t2=j/12*Math.PI; a.push([Math.cos(t2)*(R-8), Math.sin(t2)*(R-8)]); } return a; })()}],
 cards:[
  {t:["Dua pasukan 11, innings","Two teams of 11, innings"], x:["Satu pasukan memukul (2 pemukul di padang), satu lagi membaling dan memadang (11 pemain). Kemudian bertukar: setiap giliran ialah satu innings.","One team bats (2 batters at a time), the other bowls and fields (11 players). Then they swap: each turn is an innings."], cam:[[0,36,30],[0,0,0]], dur:4,
   set:function(S){ [[0,-HP-2],[0,HP],[3,-HP-4],[8,-5],[-12,0],[20,15],[-25,20],[0,40],[-40,-10],[35,-20],[-5,-HP-12]].forEach(function(q){ var b=S.st.body(S.H,S.team(1)); S.place(b,q[0],q[1],0); }); [[0.6,-HP+0.5],[-0.6,HP-0.5]].forEach(function(q){ var b=S.st.body(S.H,S.team(0)); bat(S,b); S.place(b,q[0],q[1],q[1]<0?0:Math.PI); }); return {}; }, at:function(){}},
  {t:["Pitch, crease & wiket","Pitch, creases and wickets"], x:["Pitch 20.12 m. Setiap hujung ada wiket (3 stump + 2 bail) dan garisan popping 1.22 m di hadapannya.","The pitch is 20.12 m. Each end has a wicket (3 stumps + 2 bails) and a popping crease 1.22 m in front of it."], cam:[[3,1.5,-HP-2.5],[0,0.4,-HP+1]], dur:3,
   set:function(S){ return {l:S.st.label("1.22 m",1.6,0.5,-HP+0.6,0.6)}; }, at:function(){}},
  {t:["Over = 6 balingan","An over is 6 balls"], x:["Satu over ialah 6 balingan sah. No-ball dan wide tidak dikira dan memberi 1 larian kepada pasukan pemukul.","An over is 6 legal balls. No-balls and wides don't count and give 1 run to the batting side."], cam:[[0,4,-HP-8],[0,1.5,0]], dur:6,
   set:function(S){ return {lb:S.st.label("●",0,3,-HP,0.8)}; }, at:function(S, s, p){ var n=Math.min(6,1+Math.floor(p*6)); if(s.k!==n){ s.k=n; s.lb.parent.remove(s.lb); s.lb=S.st.label("● ".repeat(n).trim(),0,3,-HP,0.8); } }},
  {t:["Larian: 1, 2, 4, 6","Runs: 1, 2, 4, 6"], x:["Pemukul berlari antara wiket untuk larian. Bola ke sempadan selepas melantun = 4; terus melepasi sempadan tanpa melantun = 6.","Batters run between the wickets for runs. To the boundary after bouncing = 4; over the boundary without bouncing = 6."], cam:[[0,40,-30],[0,0,10]], dur:4,
   set:function(S){ return {b:cb(S), l4:S.st.label("4",30,4,40,2), l6:S.st.label("6",-20,8,55,2)}; },
   at:function(S, s, p){ var a=p<0.5, q=(p*2)%1; if(a) S.u.arc(s.b,[0,0.8,-HP],[30,0.1,R-12],2,q); else S.u.arc(s.b,[0,0.8,-HP],[-22,1,R+3],30,q); S.u.show(s.l4,a&&q>0.8); S.u.show(s.l6,!a&&q>0.8); }},
  {t:["Keluar: bowled, caught, LBW","Out: bowled, caught, LBW"], x:["Bowled (bola kena wiket), caught (ditangkap tanpa melantun), LBW (bola kena kaki yang menghalang wiket).","Bowled (the ball hits the wicket), caught (caught before it bounces), LBW (the ball hits a leg that was blocking the wicket)."], cam:[[2.5,1.6,-HP-3],[0,0.6,-HP]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); bat(S,a); S.place(a,0.45,-HP+0.4,0); return {a:a,b:cb(S),lb:S.st.label("BOWLED",0,2.2,-HP,0.7,"#ff6b6b")}; },
   at:function(S, s, p){ S.u.arc(s.b,[0,2,HP],[0,0.4,-HP],0.4,S.seg(p,0,0.6)); S.pose(s.a,"swing",S.seg(p,0.45,0.75)); S.u.show(s.lb,p>0.6); }},
  {t:["Keluar: run out, stumped","Out: run out, stumped"], x:["Run out: wiket dipecahkan sebelum pemukul sampai ke garisan. Stumped: penjaga wiket memecahkan wiket bila pemukul keluar dari garisan.","Run out: the wicket is broken before the batter reaches the crease. Stumped: the keeper breaks the wicket while the batter is out of the crease."], cam:[[6,3,HP-4],[0,0.5,HP-1]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); bat(S,a); return {a:a,b:cb(S)}; }, at:function(S, s, p){ S.u.mv(s.a,0.6,-2,0.6,HP-1.6,S.seg(p,0,0.9)); S.u.arc(s.b,[15,1,5],[0,0.4,HP],0.8,S.seg(p,0.3,0.8)); }},
  {t:["Cara lain keluar","Other ways out"], x:["Juga: memukul bola dua kali, menghalang pemadang, terlambat masuk (timed out), dan beberapa lagi: ada 10 cara keluar semuanya.","Also: hitting the ball twice, obstructing the field, timed out, and a few more: there are 10 ways to be out in all."], cam:[[0,4,-HP-8],[0,1.5,0]], dur:3,
   set:function(S){ return {lb:S.st.label("10 ×",0,2.6,-HP,1.2)}; }, at:function(){}},
  {t:["LBW dengan laluan bola","LBW with the ball path"], x:["LBW jika bola akan mengena wiket, tetapi kaki pemukul menghalangnya (dengan beberapa syarat tentang tempat bola melantun).","LBW if the ball would have hit the wicket but the batter's leg stopped it (with conditions on where the ball pitched)."], cam:[[3,1.4,-HP-1],[0,0.5,-HP+2]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); bat(S,a); S.place(a,0.1,-HP+0.5,0); return {a:a, b:cb(S), path:S.u.strip(0,-HP+1.2,0,-HP,0.06,"#ff6b6b",0.35)}; },
   at:function(S, s, p){ S.u.arc(s.b,[0,2,HP],[0.05,0.3,-HP+0.7],0.5,S.seg(p,0,0.5)); S.pose(s.a,"ready",0); S.u.show(s.path,p>0.5); }},
  {t:["Format: Test, ODI, T20","Formats: Test, ODI, T20"], x:["Test (hingga 5 hari, 2 innings setiap pasukan), ODI (50 over), T20 (20 over).","Test (up to 5 days, 2 innings each), ODI (50 overs), T20 (20 overs)."], cam:[[0,4,-HP-8],[0,1.5,0]], dur:5,
   set:function(S){ return {a:S.st.label("TEST",-6,3,-HP,1), b:S.st.label("ODI 50",0,3,-HP,1), c:S.st.label("T20",6,3,-HP,1)}; }, at:function(S, s, p){ S.u.show(s.b,p>0.33); S.u.show(s.c,p>0.66); }},
  {t:["Kedudukan pemadang","Fielding positions"], x:["Slip, gully, point, cover, mid-off, mid-on, mid-wicket, square leg, fine leg… Tengok tab Padang untuk kawasannya.","Slip, gully, point, cover, mid-off, mid-on, mid-wicket, square leg, fine leg… See the Field tab for the areas."], cam:[[0,70,-10],[0,0,0]], dur:3,
   set:function(S){ var P=[["SLIP",4,-HP-5],["GULLY",9,-HP-3],["POINT",22,-HP+2],["COVER",22,4],["MID-OFF",9,18],["MID-ON",-9,18],["MID-WICKET",-22,4],["SQ LEG",-22,-HP+2],["FINE LEG",-12,-HP-15]];
     P.forEach(function(q){ var b=S.st.body(S.H,S.team(1)); S.place(b,q[1],q[2],0); S.st.label(q[0],q[1],4,q[2],1.4); }); return {}; }, at:function(){}}],
 quiz:[
  {q:["Satu over ada berapa balingan sah?","How many legal balls in an over?"], a:[["5","5"],["6","6"],["8","8"]], ok:1, why:["6 balingan sah.","6 legal balls."]},
  {q:["Bola melepasi sempadan tanpa melantun memberi…","The ball clears the boundary without bouncing. That is…"], a:[["4","4"],["6","6"]], ok:1, why:["Tanpa melantun = 6, melantun dulu = 4.","Without a bounce = 6, after a bounce = 4."]},
  {q:["Bola mengena wiket terus dari baling. Keluar…","The ball hits the wicket straight from the bowler. Out…"], a:[["Bowled","Bowled"],["Caught","Caught"],["Run out","Run out"]], ok:0, why:["Itu bowled.","That is bowled."]},
  {q:["Panjang pitch ialah…","The pitch is…"], a:[["18 m","18 m"],["20.12 m (22 ela)","20.12 m (22 yd)"],["25 m","25 m"]], ok:1, why:["22 ela = 20.12 m.","22 yards = 20.12 m."]},
  {q:["T20 bermaksud setiap pasukan memukul…","T20 means each side bats for…"], a:[["20 over","20 overs"],["20 minit","20 minutes"]], ok:0, why:["20 over.","20 overs."]}],
 game:{ name:["Memukul","Batting"], help:["Pembaling membaling. Ketik bila bola masuk bulatan hijau untuk memukul; leret kiri atau kanan untuk arah. Masa tepat = 4 atau 6. Terlepas boleh kena wiket. 2 over, 3 wiket.","The bowler bowls. Tap when the ball reaches the green ring to hit; swipe left or right to choose the side. Perfect timing = 4 or 6. A miss may hit the wicket. 2 overs, 3 wickets."], unit:["larian","runs"],
  cam:[0,2.3,-HP-5], at:[0,0.9,-HP+3],
  start:function(G){ var S=G.S; G.me=S.st.body(S.H,S.team(0)); bat(S,G.me); S.place(G.me,0.45,-HP+0.9,0); G.bw=S.st.body(S.H,S.team(1)); S.place(G.bw,0,HP+6,Math.PI);
   G.b=cb(S); var T=S.T; G.ring=new T.Mesh(new T.TorusGeometry(0.28,0.03,6,28), new T.MeshBasicMaterial({color:0xCBFA1E, transparent:true, opacity:0.3})); G.ring.position.set(0,0.8,-HP+0.6); G.ring.lookAt(0,2.3,-HP-5); S.st.add(G.ring); G.balls=0; G.wk=0; G.runs=0; G.next(); },
  step:function(G, dt){ var S=G.S, f=G.f; if(!f) return; f.t+=dt;
   if(f.k==="run"){ var q=Math.min(1,f.t/1.4); S.u.mv(G.bw,0,HP+6,0,HP+0.5,q,"run"); S.pose(G.me,"ready",0); if(q>=1){ f.k="ball"; f.t=0; } }
   else if(f.k==="ball"){ var u=f.t/f.d; if(u<=0.6) S.u.arc(G.b,[0,2.1,HP],[f.x,0.05,f.pz],0.3,u/0.6); else S.u.arc(G.b,[f.x,0.05,f.pz],[f.x*0.5,0.8,-HP+0.6],0.3,(u-0.6)/0.4); S.pose(G.bw,"serve",Math.min(1,f.t*3));
     G.ring.material.opacity=(u>0.86&&u<1.04)?0.85:0.25; if(u>1.12){ G.miss(); } }
   else if(f.k==="hit"){ var v=Math.min(1,f.t/f.d); S.u.arc(G.b,f.a,f.to,f.h,v); S.pose(G.me,"swing",Math.min(1,f.t*3)); if(v>=1){ G.f=null; setTimeout(function(){ if(!G.over) G.next(); },500); } } },
  tap:function(G){ G.hit(0); }, swipe:function(G, dx){ G.hit(dx<-0.04?-1:dx>0.04?1:0); } }};
var gm=SPORTS.cricket.game, st0=gm.start; gm.start=function(G){ var S=G.S;
  G.hu=function(msg){ S.hud('🏏 '+G.runs+'/'+G.wk+'  ·  '+S.L2("Over ","Over ")+Math.floor(G.balls/6)+'.'+(G.balls%6)+(msg?'  ·  '+msg:'')); };
  G.next=function(){ if(G.balls>=12||G.wk>=3) return G.end(G.runs, G.runs+" "+S.L2("larian","runs")+" / "+G.wk+" "+S.L2("wiket","wkts")); G.f={k:"run", t:0, d:Math.max(0.75,1.0-G.balls*0.015), x:(Math.random()-0.5)*0.4, pz:-HP+3+Math.random()*3}; G.bw.position.set(0,0,HP+6); G.hu(); };
  G.miss=function(){ var f=G.f; G.f=null; G.balls++; var out=Math.abs(f.x)<0.15||Math.random()<0.25; if(out){ G.wk++; S.vib(70); G.hu(S.L2("Keluar! Bowled","Out! Bowled")); } else G.hu(S.L2("Tiada larian","Dot ball")); setTimeout(function(){ if(!G.over) G.next(); },900); };
  G.hit=function(aim){ var f=G.f; if(!f||f.k!=="ball") return; var u=f.t/f.d; if(u<0.8||u>1.08){ return G.miss(); } G.balls++; var e=Math.abs(u-0.95), r=e<0.03?6:e<0.06?4:e<0.1?2:1, ang=aim*0.9+(Math.random()-0.5)*0.5, dist=r===6?R+5:r===4?R-2:r===2?35:18;
    G.runs+=r; S.vib(25); G.hu(r===6?"SIX!":r===4?"FOUR!":"+"+r); G.f={k:"hit", t:0, d:r>=4?1.4:1.0, a:[G.b.position.x,G.b.position.y,G.b.position.z], to:[Math.sin(ang)*dist, r===6?2:0.1, -HP+Math.cos(ang)*dist], h:r===6?25:r===4?2:4}; };
  st0(G); };
})();
