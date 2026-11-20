/* My Ihsan Sports: Basketball. FIBA court 28 x 15 m; hoop 3.05 m high, basket centre 1.575 m from the end line; 3-point line 6.75 m; free-throw line 5.8 m from the end line.
   FIBA rules (NBA differences noted), as of 2026. */
(function(){
"use strict";
var L=28, HL=14, W=15, HB=1.575, R3=6.75, FT=5.8, KEY=4.9, HOOP=3.05, BALL=0.24;
function hoop(K, s){ var z=s*(HL-HB); K.post(0, s*(HL+0.9), 3.4, 0.08, "#555"); K.bar(0,3.4,s*(HL+0.9),0,3.4,s*(HL-1.15),0.05,"#555");
  var T=THREE, bd=new T.Mesh(new T.BoxGeometry(1.8,1.05,0.04), new T.MeshLambertMaterial({color:0xffffff, transparent:true, opacity:0.75})); bd.position.set(0,2.9+0.525,s*(HL-1.2)); K.root.add(bd);
  var sq=new T.Mesh(new T.PlaneGeometry(0.59,0.45), new T.MeshBasicMaterial({color:0xe53935, wireframe:true})); sq.position.set(0,3.2,s*(HL-1.22)); K.root.add(sq);
  var rim=new T.Mesh(new T.TorusGeometry(0.225,0.012,8,24), new T.MeshLambertMaterial({color:0xe8662a})); rim.rotation.x=Math.PI/2; rim.position.set(0,HOOP,z); K.root.add(rim);
  var net=new T.Mesh(new T.CylinderGeometry(0.225,0.15,0.4,12,1,true), new T.MeshBasicMaterial({color:0xffffff, wireframe:true})); net.position.set(0,HOOP-0.2,z); K.root.add(net); }
SPORTS.basketball={ id:"basketball", v:"2026", H:1.98, cam:[14,11,17], top:[0,36,0.1], sky:"#262b35", ground:"#3b3f4a",
 field:function(K){ K.rect(W+4, L+4, "#3b3f4a"); K.rect(W, L, "#c98a4b", 0.002); K.lineW=0.05;
   K.box(-W/2,-HL,W/2,HL,0.05); K.line(-W/2,0,W/2,0,0.05); K.arc(0,0,1.8,0,Math.PI*2,0.05);
   [-1,1].forEach(function(s){ var bz=s*(HL-HB); K.rect(KEY, FT, "#a8643a", 0.003, 0, s*(HL-FT/2)); K.box(-KEY/2,s*HL,KEY/2,s*(HL-FT),0.05); K.arc(0,s*(HL-FT),1.8,0,Math.PI*2,0.05);
     // ring angles: a point at angle a lies at x = r cos a, z = -r sin a; the arcs bulge toward the centre of the court
     var cx=W/2-0.9, a0=Math.acos(cx/R3), zj=bz-s*Math.sqrt(R3*R3-cx*cx); K.line(-cx,s*HL,-cx,zj,0.05); K.line(cx,s*HL,cx,zj,0.05);
     K.arc(0,bz,R3, s>0?a0:Math.PI+a0, s>0?Math.PI-a0:2*Math.PI-a0, 0.05);
     K.arc(0,bz,1.25, s>0?0:Math.PI, s>0?Math.PI:2*Math.PI, 0.05); hoop(K, s); });
   return {w:W,l:L}; },
 facts:[[["Gelanggang (FIBA)","Court (FIBA)"],"28 × 15 m"],[["Ketinggian gelung","Hoop height"],"3.05 m"],[["Garisan 3 mata","3-point line"],"6.75 m"],[["Garisan balingan bebas","Free-throw line"],"5.8 m"],[["Lebar kawasan larangan","Key width"],"4.9 m"],[["Bola (saiz 7)","Ball (size 7)"],"Ø ≈ 24 cm"]],
 zones:[
  {n:["Kawasan 2 mata","2-point area"], d:["Jaringan dari dalam garisan 3 mata = 2 mata.","A basket from inside the 3-point line scores 2."], p:(function(){ var a=[[-W/2+0.9,-HL]]; for(var i=0;i<=16;i++){ var t=-1.35+2.7*i/16; a.push([Math.sin(t)*R3, -(HL-HB)+Math.cos(t)*R3]); } a.push([W/2-0.9,-HL]); return a; })()},
  {n:["Kawasan larangan (key)","The key"], d:["Penyerang tidak boleh berada di sini lebih 3 saat.","An attacker may not stay here more than 3 seconds."], p:[[-KEY/2,HL],[KEY/2,HL],[KEY/2,HL-FT],[-KEY/2,HL-FT]]},
  {n:["Garisan balingan bebas","Free-throw line"], d:["Balingan bebas diambil dari sini, setiap satu bernilai 1 mata.","Free throws are taken from here, each worth 1 point."], p:[[-KEY/2,-(HL-FT)+0.3],[KEY/2,-(HL-FT)+0.3],[KEY/2,-(HL-FT)-0.3],[-KEY/2,-(HL-FT)-0.3]]},
  {n:["Gelanggang belakang","Backcourt"], d:["Pasukan menyerang mesti membawa bola melepasi garisan tengah dalam 8 saat dan tidak boleh kembali.","The attacking team must bring the ball over the centre line within 8 seconds and may not go back."], p:[[-W/2,0],[W/2,0],[W/2,-HL],[-W/2,-HL]]}],
 cards:[
  {t:["5 pemain, 4 suku","5 players, 4 quarters"], x:["5 pemain sepasukan di atas gelanggang. FIBA: 4 × 10 minit (NBA: 4 × 12).","5 players per team on court. FIBA: 4 × 10 minutes (NBA: 4 × 12)."], cam:[[12,14,10],[0,0,0]], dur:5,
   set:function(S){ var P=[]; [[0,-2],[-4,-6],[4,-6],[-2.5,-10],[2.5,-10]].forEach(function(q,i){ [0,1].forEach(function(t){ var b=S.st.body(S.H,Object.assign({num:i+4,short:true,shorts:true},S.team(t))); S.place(b,q[0]*(t?-1:1),q[1]*(t?-1:1),t?Math.PI:0); P.push(b); }); }); return {P:P}; },
   at:function(S, s, p){ s.P.forEach(function(b,i){ S.pose(b,"ready",0); }); }},
  {t:["2 mata, 3 mata, 1 mata","2 points, 3 points, 1 point"], x:["Dalam garisan = 2 mata. Dari luar garisan 3 mata (6.75 m) = 3 mata. Setiap balingan bebas = 1.","Inside the arc: 2 points. From behind the 3-point line (6.75 m): 3 points. Each free throw: 1."], cam:[[7,6,4],[0,2,HL-4]], dur:4,
   set:function(S){ var a=S.st.body(S.H,Object.assign({short:true,shorts:true},S.team(0))); S.place(a,0,HL-HB-7.4,0); return {a:a,b:S.st.ball(BALL,"#e8662a",{seams:"#222"}),l:S.st.label("3!",0,4.5,HL-HB,1)}; },
   at:function(S, s, p){ S.pose(s.a,"shoot",S.seg(p,0,0.3)); S.u.arc(s.b,[0,2.6,HL-HB-7.3],[0,HOOP,HL-HB],2.4,S.seg(p,0.25,0.75)); if(p>0.75) s.b.position.y=HOOP-(p-0.75)*8; S.u.show(s.l,p>0.75); }},
  {t:["Melantun bola","Dribbling"], x:["Gerak dengan bola hanya sambil melantunnya. Melantun dengan dua tangan, atau melantun semula selepas berhenti = double dribble.","Move with the ball only while bouncing it. Bouncing with two hands, or dribbling again after stopping, is a double dribble."], cam:[[4,2.4,4],[0,1,0]], dur:2,
   set:function(S){ var a=S.st.body(S.H,Object.assign({short:true,shorts:true},S.team(0))); return {a:a,b:S.st.ball(BALL,"#e8662a",{seams:"#222"})}; },
   at:function(S, s, p, t){ S.place(s.a,0,-3+((t/2)%1)*0+p*3,0); S.pose(s.a,"run",p*2%1); var bp=Math.abs(Math.sin(p*Math.PI*4)); s.b.position.set(0.35,0.12+bp*0.85,s.a.position.z+0.35); }},
  {t:["Melangkah (travelling)","Travelling"], x:["Memegang bola dan melangkah lebih dari 2 langkah tanpa melantun = travelling; bola diberi kepada lawan.","Holding the ball and taking more than 2 steps without dribbling is travelling; the ball goes to the opponents."], cam:[[4,2.4,4],[0,1,0]], dur:3,
   set:function(S){ var a=S.st.body(S.H,Object.assign({short:true,shorts:true},S.team(0))), b=S.st.ball(BALL,"#e8662a",{seams:"#222"}); a.userData.J.chest.add(b); b.position.set(0,-0.15,0.3); return {a:a,l:S.st.label("1 · 2 · 3 ✗",0,2.6,0,0.7,"#ff6b6b")}; },
   at:function(S, s, p){ S.u.mv(s.a,0,-2,0,2,p); S.u.show(s.l,p>0.6); }},
  {t:["Jam tembakan 24 saat","24-second shot clock"], x:["Pasukan mesti menembak (bola menyentuh gelung) dalam 24 saat. Selepas lantunan serangan, jam ditetapkan semula kepada 14.","A team must shoot (ball touching the rim) within 24 seconds. After an offensive rebound it resets to 14."], cam:[[0,5,HL-11],[0,3,HL]], dur:4,
   set:function(S){ return {l:S.st.label("24",0,4.6,HL-0.9,1.1,"#ff6b6b")}; },
   at:function(S, s, p){ var n=Math.max(0,24-Math.floor(p*25)); if(s.n!==n){ s.n=n; s.l.parent.remove(s.l); s.l=S.st.label(String(n),0,4.6,HL-0.9,1.1,"#ff6b6b"); } }},
  {t:["Peraturan 3 saat","3-second rule"], x:["Penyerang tidak boleh berada dalam kawasan larangan lawan lebih 3 saat ketika pasukannya memegang bola.","An attacker may not stay in the opponents' key for more than 3 seconds while their team has the ball."], cam:[[6,8,HL-12],[0,0,HL-3]], dur:4,
   set:function(S){ var a=S.st.body(S.H,Object.assign({short:true,shorts:true},S.team(0))); S.place(a,0.6,HL-3,0); return {a:a,z:S.u.zone(-KEY/2,HL-FT,KEY/2,HL,"#ff6b6b",0.3),l:S.st.label("3s",0.6,2.6,HL-3,0.8)}; },
   at:function(S, s, p){ S.pose(s.a,"ready",0); s.z.material.opacity=p>0.75?0.5:0.2; }},
  {t:["8 saat & gelanggang belakang","8 seconds and the backcourt"], x:["Bawa bola ke separuh gelanggang depan dalam 8 saat. Selepas itu bola tidak boleh dibawa balik ke belakang.","Bring the ball into the frontcourt within 8 seconds. After that it may not go back into the backcourt."], cam:[[12,12,0],[0,0,0]], dur:4,
   set:function(S){ var a=S.st.body(S.H,Object.assign({short:true,shorts:true},S.team(0))); return {a:a,b:S.st.ball(BALL,"#e8662a"),z:S.u.zone(-W/2,-HL,W/2,0,"#4fc3f7",0.18)}; },
   at:function(S, s, p){ S.u.mv(s.a,2,-11,2,3,S.seg(p,0,0.8)); s.b.position.set(2.35,0.12+Math.abs(Math.sin(p*Math.PI*10))*0.8,s.a.position.z+0.3); }},
  {t:["Kekasaran peribadi","Personal fouls"], x:["Hubungan haram seperti menolak, memegang atau memukul tangan = kekasaran. 5 kekasaran (FIBA) atau 6 (NBA) dan pemain keluar.","Illegal contact such as pushing, holding or hitting the arm is a foul. 5 fouls (FIBA) or 6 (NBA) and the player is out."], cam:[[4,2.4,4],[0,1.2,0]], dur:3,
   set:function(S){ var a=S.st.body(S.H,Object.assign({short:true,shorts:true},S.team(0))), d=S.st.body(S.H,Object.assign({short:true,shorts:true},S.team(1))); S.place(a,0,0,0); S.place(d,0.3,0.9,Math.PI); return {a:a,d:d,l:S.st.label("FOUL",0,2.8,0.4,0.8,"#ff6b6b")}; },
   at:function(S, s, p){ S.pose(s.a,"shoot",S.seg(p,0,0.5)); S.pose(s.d,"jump",S.seg(p,0.1,0.6)); s.d.position.z=0.9-S.seg(p,0.1,0.4)*0.4; S.u.show(s.l,p>0.45); }},
  {t:["Kekasaran pasukan & bonus","Team fouls and the bonus"], x:["Selepas pasukan melakukan 4 kekasaran dalam satu suku (FIBA), setiap kekasaran seterusnya memberi lawan 2 balingan bebas.","After a team commits 4 fouls in a quarter (FIBA), every further foul gives the opponents 2 free throws."], cam:[[0,4,HL-10],[0,3,HL]], dur:4,
   set:function(S){ return {l:S.st.label("FOULS: 5 → 2 FT",0,4.4,HL-0.9,0.8)}; }, at:function(){}},
  {t:["Lompat bola & anak panah","Jump ball and the arrow"], x:["Perlawanan bermula dengan lompat bola di bulatan tengah. Selepas itu, anak panah milikan menentukan siapa dapat bola bila bola dipegang bersama.","The game starts with a jump ball in the centre circle. After that, the possession arrow decides who gets a held ball."], cam:[[5,3,5],[0,2,0]], dur:3,
   set:function(S){ var a=S.st.body(S.H,Object.assign({short:true,shorts:true},S.team(0))), b=S.st.body(S.H,Object.assign({short:true,shorts:true},S.team(1))), r=S.st.body(1.8,{top:"#777",pants:"#111"}); S.place(a,0,-0.5,0); S.place(b,0,0.5,Math.PI); S.place(r,1.4,0,-Math.PI/2); return {a:a,b:b,r:r,bl:S.st.ball(BALL,"#e8662a")}; },
   at:function(S, s, p){ S.u.arc(s.bl,[0.8,1.6,0],[0,3.4,0],0.4,S.seg(p,0,0.35)); if(p>0.35) S.u.arc(s.bl,[0,3.4,0],[0,1.2,-3],0.6,S.seg(p,0.5,0.85)); S.pose(s.a,"jump",S.seg(p,0.25,0.65)); S.pose(s.b,"jump",S.seg(p,0.28,0.68)); }}],
 quiz:[
  {q:["Berapa ketinggian gelung?","How high is the hoop?"], a:[["2.75 m","2.75 m"],["3.05 m","3.05 m"],["3.50 m","3.50 m"]], ok:1, why:["3.05 m (10 kaki).","3.05 m (10 ft)."]},
  {q:["Jaringan dari belakang garisan 6.75 m bernilai…","A basket from behind the 6.75 m line is worth…"], a:[["2","2"],["3","3"],["4","4"]], ok:1, why:["Garisan 3 mata.","It's the 3-point line."]},
  {q:["Berapa lama jam tembakan (FIBA/NBA)?","How long is the shot clock (FIBA/NBA)?"], a:[["14 s","14 s"],["24 s","24 s"],["30 s","30 s"]], ok:1, why:["24 saat; 14 selepas lantunan serangan.","24 seconds; 14 after an offensive rebound."]},
  {q:["Melangkah 3 langkah sambil memegang bola ialah…","Taking 3 steps while holding the ball is…"], a:[["Travelling","Travelling"],["Double dribble","Double dribble"],["Dibenarkan","Allowed"]], ok:0, why:["Lebih 2 langkah tanpa melantun = travelling.","More than 2 steps without dribbling is travelling."]},
  {q:["Berapa kekasaran sebelum pemain keluar (FIBA)?","How many fouls before a player is out (FIBA)?"], a:[["4","4"],["5","5"],["6","6"]], ok:1, why:["5 dalam FIBA, 6 dalam NBA.","5 in FIBA, 6 in the NBA."]}],
 game:{ name:["Balingan bebas & 3 mata","Free throws and threes"], help:["Tekan dan tahan untuk mengisi kuasa, lepaskan bila meter dalam zon hijau. Jarak bertambah setiap 3 jaringan. 10 balingan.","Press and hold to fill the power meter, release in the green zone. The distance grows every 3 baskets. 10 shots."], unit:["mata","pts"],
  cam:[0,2.6,HL-HB-10], at:[0,2.5,HL-HB],
  start:function(G){ var S=G.S; G.me=S.st.body(S.H,Object.assign({short:true,shorts:true},S.team(0))); G.b=S.st.ball(BALL,"#e8662a",{seams:"#222"}); G.n=0; G.pts=0; G.made=0;
   G.reset=function(){ G.dist=G.made>=6?7.2:G.made>=3?5.8:4.2; S.place(G.me,0,HL-HB-G.dist,0); S.st.setCam([0.8,2.6,HL-HB-G.dist-4],[0,2.4,HL-HB]); G.b.position.set(0,1.3,HL-HB-G.dist+0.35); G.charge=null; G.fly=null; G.res=""; }; G.reset(); G.hu(); },
  step:function(G, dt){ var S=G.S; if(G.charge!=null){ G.charge=Math.min(1.2,G.charge+dt*0.75); G.hu(); S.pose(G.me,"shoot",0); return; }
   if(G.fly){ var f=G.fly; f.t+=dt/0.95; var q=Math.min(1.3,f.t); S.pose(G.me,"shoot",Math.min(1,f.t*2.5));
     var end=[0, HOOP+(f.err>0?0.35:-0.1)*Math.abs(f.err)*4, HL-HB+f.err*1.2]; S.u.arc(G.b,[0,2.6,HL-HB-G.dist+0.3],end,1.6+G.dist*0.18,Math.min(1,q)); if(q>1) G.b.position.y-=(q-1)*12*dt*10;
     if(f.t>=1.3 && !G.res){ G.res=f.ok?"in":"out"; G.n++; if(f.ok){ var v=G.dist>6.75?3:2; G.pts+=v; G.made++; } G.S.vib(f.ok?40:15); G.hu(); var nn=G.n; setTimeout(function(){ if(G.over) return; if(nn>=10) G.end(G.pts, G.pts+" "+G.S.L2("mata","points")); else G.reset(); },700); } return; }
   S.pose(G.me,"idle",(performance.now()/1000)%1); },
  press:function(G){ if(G.fly) return; G.charge=0; },
  tap:function(G){ G.rel(); }, swipe:function(G){ G.rel(); },
  hu0:null },
 fieldScene:null };
var gm=SPORTS.basketball.game, st0=gm.start; gm.start=function(G){ var L2=G.S.L2;
  G.zone=function(){ var c=0.62+G.dist*0.025, w=Math.max(0.07,0.16-G.made*0.01); return [c-w/2,c+w/2]; };
  G.hu=function(){ var z=G.zone(), c=G.charge==null?0:G.charge/1.2;
    G.S.hud('🏀 '+G.pts+'  ·  '+G.n+' / 10'+(G.res?'  ·  '+(G.res==="in"?(G.dist>6.75?"3!":"2!"):L2("Terlepas","Missed")):'')+'<div class="spmeter" style="position:relative"><i style="width:'+Math.round(c*100)+'%"></i><b style="position:absolute;top:0;bottom:0;left:'+(z[0]/1.2*100)+'%;width:'+((z[1]-z[0])/1.2*100)+'%;background:rgba(63,185,122,.55)"></b></div>'); };
  G.rel=function(){ if(G.charge==null||G.fly) return; var z=G.zone(), c=G.charge, mid=(z[0]+z[1])/2; G.charge=null; G.fly={t:0, ok:c>=z[0]&&c<=z[1], err:(c-mid)}; };
  st0(G); };
})();
