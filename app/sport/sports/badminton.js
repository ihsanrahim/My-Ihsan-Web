/* My Ihsan Sports: Badminton. Court 13.4 x 6.1 m (doubles), singles width 5.18 m; net 1.524 m (centre) / 1.55 m (posts). BWF Laws, rules as of 2026. */
(function(){
"use strict";
var L=13.4, HL=6.7, W=6.1, WS=5.18, SSL=1.98, DLS=0.76, NET=1.524;
function shuttle(S){ var T=S.T, g=new T.Group(); var cork=new T.Mesh(new T.SphereGeometry(0.014,10,8), new T.MeshLambertMaterial({color:0xf2efe8})); g.add(cork);
  var sk=new T.Mesh(new T.ConeGeometry(0.033,0.065,12,1,true), new T.MeshLambertMaterial({color:0xffffff, side:T.DoubleSide, transparent:true, opacity:0.9})); sk.position.y=0.04; g.add(sk); g.scale.setScalar(2.2); S.st.add(g); return g; }
function racket(S, b){ var T=S.T, r=new T.Group(); var h=new T.Mesh(new T.CylinderGeometry(0.012,0.012,0.42,6), new T.MeshLambertMaterial({color:0x333333})); h.position.y=-0.2; r.add(h);
  var hd=new T.Mesh(new T.TorusGeometry(0.1,0.008,6,20), new T.MeshLambertMaterial({color:0xc0392b})); hd.scale.y=1.25; hd.position.y=-0.5; r.add(hd); r.position.y=-0.3; b.userData.J.elR.add(r); return r; }
SPORTS.badminton={ id:"badminton", v:"2026", H:1.76, cam:[9,6.5,11], top:[0,19,0.1], sky:"#2a2f3a", ground:"#3b3f4a",
 field:function(K){ K.rect(W+3, L+4, "#2e7d5b"); K.lineW=0.04;
   K.box(-W/2,-HL,W/2,HL,0.04); [-1,1].forEach(function(x){ K.line(x*WS/2,-HL,x*WS/2,HL,0.04); });
   [-1,1].forEach(function(s){ K.line(-W/2,s*SSL,W/2,s*SSL,0.04); K.line(-W/2,s*(HL-DLS),W/2,s*(HL-DLS),0.04); K.line(0,s*SSL,0,s*HL,0.04); });
   K.post(-W/2-0.05,0,1.55,0.02,"#ddd"); K.post(W/2+0.05,0,1.55,0.02,"#ddd"); K.net(-W/2,W/2,0,NET-0.76,NET,"rgba(20,20,20,.8)",0.02); return {w:W,l:L}; },
 facts:[[["Gelanggang (beregu)","Court (doubles)"],"13.4 × 6.1 m"],[["Lebar perseorangan","Singles width"],"5.18 m"],[["Garisan servis pendek","Short service line"],"1.98 m"],[["Garisan servis panjang beregu","Doubles long service line"],"0.76 m"],[["Ketinggian jaring","Net height"],"1.524 m (1.55 m)"]],
 zones:[
  {n:["Petak servis kanan","Right service court"], d:["Servis dari sini bila mata anda genap (0, 2, 4…). Servis menyerong ke petak bertentangan.","Serve from here when your score is even (0, 2, 4…). Serve diagonally into the opposite court."], p:[[0,-SSL],[W/2,-SSL],[W/2,-HL],[0,-HL]]},
  {n:["Petak servis kiri","Left service court"], d:["Servis dari sini bila mata anda ganjil (1, 3, 5…).","Serve from here when your score is odd (1, 3, 5…)."], p:[[-W/2,-SSL],[0,-SSL],[0,-HL],[-W/2,-HL]]},
  {n:["Zon depan jaring","Front of the net"], d:["Servis mesti melepasi garisan servis pendek (1.98 m).","A serve must land beyond the short service line (1.98 m)."], p:[[-W/2,SSL],[W/2,SSL],[W/2,-SSL],[-W/2,-SSL]]},
  {n:["Lorong belakang beregu","Doubles back alley"], d:["Untuk servis beregu sahaja, ini di luar (garisan servis panjang 0.76 m dari belakang). Dalam rali, ia di dalam.","For a doubles serve only, this is out (long service line 0.76 m from the back). In a rally it is in."], p:[[-W/2,HL],[W/2,HL],[W/2,HL-DLS],[-W/2,HL-DLS]]},
  {n:["Lorong tepi","Side alley"], d:["Di dalam untuk beregu, di luar untuk perseorangan.","In for doubles, out for singles."], p:[[WS/2,-HL],[W/2,-HL],[W/2,HL],[WS/2,HL]]}],
 cards:[
  {t:["Perseorangan & beregu","Singles and doubles"], x:["Perseorangan guna lorong dalam (5.18 m lebar). Beregu guna seluruh gelanggang (6.1 m).","Singles uses the inner sidelines (5.18 m wide). Doubles uses the whole court (6.1 m)."], cam:[[0,15,10],[0,0,0]], dur:4,
   set:function(S){ return {s:S.u.zone(-WS/2,-HL,WS/2,HL,"#CBFA1E",0.25), d:S.u.zone(-W/2,-HL,W/2,HL,"#4fc3f7",0.25), ls:S.st.label("SINGLES",0,1,0,0.8), ld:S.st.label("DOUBLES",0,1,0,0.8,"#4fc3f7")}; },
   at:function(S, s, p){ var a=p<0.5; S.u.show(s.s,a); S.u.show(s.ls,a); S.u.show(s.d,!a); S.u.show(s.ld,!a); }},
  {t:["Servis","The serve"], x:["Servis menyerong, di bawah pinggang (seluruh bulu tangkis di bawah 1.15 m dari lantai). Kedua-dua kaki mesti menyentuh lantai.","Serve diagonally, below the waist (the whole shuttle below 1.15 m from the floor). Both feet stay on the floor."], cam:[[5,2.5,-9],[0,1,-2]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)), r=S.st.body(S.H,S.team(1)), sh=shuttle(S); racket(S,a); racket(S,r); S.place(a,0.8,-3,0); S.place(r,-0.9,3,Math.PI); return {a:a,r:r,sh:sh,lb:S.st.label("1.15 m",1.6,1.15,-3,0.5)}; },
   at:function(S, s, p){ S.pose(s.a,"serve",S.seg(p,0,0.3)); S.pose(s.r,"ready",0); S.u.arc(s.sh,[0.9,1.0,-2.7],[-0.9,1.6,2.6],1.4,S.seg(p,0.25,0.85)); }},
  {t:["Mata: 21 rali","Scoring: rally to 21"], x:["Setiap rali memberi satu mata kepada pemenangnya. Permainan hingga 21, menang dengan beza 2; pada 29-29, mata ke-30 menang.","Every rally gives a point to whoever wins it. Games go to 21, win by 2; at 29-29 the 30th point wins."], cam:[[0,4,-11],[0,1.5,0]], dur:5,
   set:function(S){ return {lb:S.st.label("0 - 0",0,2.6,0,1.2)}; },
   at:function(S, s, p){ var seq=["19 - 19","20 - 19","20 - 20","21 - 20","22 - 20 ✓"], i=Math.min(4,Math.floor(p*5)); if(s.k!==i){ s.k=i; s.lb.parent.remove(s.lb); s.lb=S.st.label(seq[i],0,2.6,0,1.2); } }},
  {t:["Tiga set terbaik","Best of 3 games"], x:["Perlawanan dimenangi oleh pemain atau pasangan yang menang 2 set dahulu.","A match is won by the player or pair who wins 2 games first."], cam:[[0,4,-11],[0,1.5,0]], dur:4,
   set:function(S){ return {a:S.st.label("21-18",-1.6,2.4,0,0.8), b:S.st.label("19-21",0,2.4,0,0.8), c:S.st.label("21-15 ✓",1.8,2.4,0,0.8)}; }, at:function(S, s, p){ S.u.show(s.b,p>0.33); S.u.show(s.c,p>0.66); }},
  {t:["Petak servis ikut mata","Service court by score"], x:["Mata server genap = servis dari petak kanan. Ganjil = petak kiri.","Server's score even: serve from the right court. Odd: from the left."], cam:[[0,14,-9],[0,0,-2]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); return {a:a, r:S.u.zone(0,-SSL,W/2,-HL,"#CBFA1E",0.3), l:S.u.zone(-W/2,-SSL,0,-HL,"#4fc3f7",0.3), e:S.st.label("4 = EVEN",1.5,1.6,-4,0.6), o:S.st.label("5 = ODD",-1.5,1.6,-4,0.6,"#4fc3f7")}; },
   at:function(S, s, p){ var ev=p<0.5; S.u.show(s.r,ev); S.u.show(s.e,ev); S.u.show(s.l,!ev); S.u.show(s.o,!ev); S.place(s.a,ev?1.4:-1.4,-3,0); S.pose(s.a,"idle",p); }},
  {t:["Giliran servis beregu","Doubles serving order"], x:["Pasangan yang menang rali terus servis dan server bertukar petak. Pasangan penerima tidak bertukar petak.","The pair that wins the rally keeps serving and the server switches court. The receiving pair does not switch."], cam:[[0,14,-10],[0,0,0]], dur:4,
   set:function(S){ var A=[S.st.body(S.H,S.team(0)),S.st.body(S.H,S.team(0))], B=[S.st.body(S.H,S.team(1)),S.st.body(S.H,S.team(1))]; S.place(B[0],-1.4,3,Math.PI); S.place(B[1],1.4,4,Math.PI); return {A:A}; },
   at:function(S, s, p){ var sw=S.seg(p,0.45,0.7); S.u.mv(s.A[0],1.4,-3,-1.4,-3,sw); S.u.mv(s.A[1],-1.4,-4.5,1.4,-4.5,sw); }},
  {t:["Bulu tangkis atas garisan = masuk","On the line is in"], x:["Jika bulu tangkis mendarat di atas garisan, ia dikira masuk.","If the shuttle lands on the line, it is in."], cam:[[W/2+3,2.2,3.5],[W/2-0.5,0,1]], dur:3,
   set:function(S){ return {sh:shuttle(S), lb:S.st.label("IN",W/2,0.8,1,0.6)}; }, at:function(S, s, p){ S.u.arc(s.sh,[W/2-2,1.5,-1],[W/2-0.01,0.03,1],0.5,S.seg(p,0,0.6)); S.u.show(s.lb,p>0.6); }},
  {t:["Kesalahan","Faults"], x:["Menyentuh jaring, mencapai ke atas gelanggang lawan, memukul dua kali, atau bulu tangkis menyentuh badan = kesalahan.","Touching the net, reaching over to the other side, hitting twice, or the shuttle touching your body are faults."], cam:[[4,2.2,-3],[0,1.3,0]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); racket(S,a); S.place(a,0.3,-0.6,0); return {a:a, lb:S.st.label("FAULT",0,2.4,0,0.8,"#ff6b6b")}; }, at:function(S, s, p){ S.pose(s.a,"smash",p); S.u.show(s.lb,p>0.5); }},
  {t:["Tukar gelanggang","Changing ends"], x:["Pemain bertukar gelanggang selepas setiap set, dan dalam set ketiga bila seorang mencapai 11 mata.","Players change ends after each game, and in game 3 when one side reaches 11 points."], cam:[[8,8,0],[0,0,0]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)), b=S.st.body(S.H,S.team(1)); return {a:a,b:b}; }, at:function(S, s, p){ var q=S.seg(p,0.2,0.8); S.u.mv(s.a,-W/2-0.6,-3,-W/2-0.6,3,q); S.u.mv(s.b,W/2+0.6,3,W/2+0.6,-3,q); }},
  {t:["Pukulan asas","Basic shots"], x:["Clear (tinggi ke belakang), drop (jatuh dekat jaring), smash (kuat ke bawah) dan net shot.","Clear (high to the back), drop (falls near the net), smash (hard and steep) and the net shot."], cam:[[5,2.8,-7],[0,1.4,0]], dur:6,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); racket(S,a); S.place(a,0,-4,0); return {a:a, sh:shuttle(S), l:[S.st.label("CLEAR",0,4,2,0.6),S.st.label("DROP",0,2.4,2,0.6),S.st.label("SMASH",0,2.4,2,0.6,"#ff6b6b")]}; },
   at:function(S, s, p){ var k=Math.floor(p*3), q=(p*3)%1; s.l.forEach(function(x,i){ S.u.show(x,i===k); }); S.pose(s.a,"smash",q);
     var to=[[0,0.05,6],[0.3,0.05,1.2],[0.6,0.05,3]][k], h=[5,0.8,0.1][k]; S.u.arc(s.sh,[0,2.6,-3.7],to,h,S.seg(q,0.35,0.9)); }}],
 quiz:[
  {q:["Permainan badminton dimainkan hingga berapa mata?","A badminton game is played to how many points?"], a:[["11","11"],["15","15"],["21","21"]], ok:2, why:["21, menang dengan beza 2 (maksimum 30).","21, win by 2 (cap at 30)."]},
  {q:["Mata server 6. Dari petak mana dia servis?","The server has 6 points. Which court do they serve from?"], a:[["Kiri","Left"],["Kanan","Right"]], ok:1, why:["Genap = kanan.","Even = right."]},
  {q:["Bulu tangkis jatuh atas garisan. Masuk atau keluar?","The shuttle lands on the line. In or out?"], a:[["Masuk","In"],["Keluar","Out"]], ok:0, why:["Atas garisan = masuk.","On the line is in."]},
  {q:["Lorong tepi luar dalam perseorangan ialah…","In singles, the outer side alley is…"], a:[["Masuk","In"],["Keluar","Out"]], ok:1, why:["Perseorangan guna lebar 5.18 m sahaja.","Singles uses only the 5.18 m width."]},
  {q:["Pada 29-29, mata seterusnya…","At 29-29, the next point…"], a:[["Memenangi set","Wins the game"],["Perlu beza 2","Needs a 2-point lead"]], ok:0, why:["Mata ke-30 memenangi set.","The 30th point wins the game."]}],
 game:{ name:["Rali smash","Smash rally"], help:["Ketik bila bulu tangkis masuk bulatan hijau untuk memukul balik. Leret ke bawah bila ia tinggi untuk smash (2 mata). 3 nyawa.","Tap when the shuttle enters the green ring to hit it back. Swipe down when it is high to smash (2 points). 3 lives."], unit:["mata","pts"],
  cam:[0,2.6,-10.5], at:[0,1.4,0],
  start:function(G){ var S=G.S; G.me=S.st.body(S.H,S.team(0)); racket(S,G.me); G.op=S.st.body(S.H,S.team(1)); racket(S,G.op); S.place(G.me,0,-4.2,0); S.place(G.op,0,4.2,Math.PI);
   G.sh=shuttle(S); G.ring=S.u.strip(-0.4,-4.2,0.4,-4.2,0.8,"#CBFA1E",2.2); G.ring.rotation.x=0; G.ring.material.opacity=0.35; G.lives=3; G.pts=0; G.n=0; G.fly=null; G.serve=function(){ var hi=Math.random()<0.4; G.fly={a:[(Math.random()-0.5)*2,2.4,3.9], b:[0,hi?2.9:2.2,-4.2], h:hi?2.6:1.2, t:0, d:Math.max(0.75,1.5-G.n*0.04), hi:hi, dir:-1}; G.hit=false; }; G.serve(); G.hu(); },
  step:function(G, dt){ var S=G.S, f=G.fly; if(!f) return; f.t+=dt/f.d; var q=Math.min(1.25,f.t);
   if(f.dir<0){ S.u.arc(G.sh,f.a,[f.b[0],f.b[1]-(q>1?(q-1)*6:0),f.b[2]-(q>1?(q-1)*2:0)],f.h,q); var near=q>0.82&&q<1.06; G.ring.material.opacity=near?0.75:0.25; G.ring.position.y=f.b[1]; S.pose(G.me,"ready",0);
     if(q>=1.25){ G.lives--; G.S.vib(60); G.hu(G.S.L2("Terlepas!","Missed!")); G.fly=null; if(G.lives<=0) return G.end(G.pts, G.pts+" "+G.S.L2("mata","points")); setTimeout(function(){ if(!G.over) G.serve(); },700); } }
   else { S.u.arc(G.sh,f.a,f.b,f.h,q); S.pose(G.me,"smash",Math.min(1,f.t*2)); S.pose(G.op,"ready",0); if(q>=1){ G.n++; G.fly=null; setTimeout(function(){ if(!G.over) G.serve(); },300); } } },
  tap:function(G){ G.go(false); }, swipe:function(G, dx, dy){ G.go(dy>0.05); },
  go0:null },
 fieldScene:null };
var gm=SPORTS.badminton.game; var st0=gm.start; gm.start=function(G){ G.hu=function(msg){ G.S.hud('🏸 '+G.pts+'  ·  '+'❤️'.repeat(Math.max(0,G.lives))+(msg?'  ·  '+msg:'')); };
  G.go=function(smash){ var f=G.fly; if(!f||f.dir>0) return; if(f.t>0.8&&f.t<1.08){ var sm=smash&&f.hi; G.pts+=sm?2:1; G.S.vib(25); G.hu(sm?"SMASH!":""); G.fly={a:[G.sh.position.x,G.sh.position.y,G.sh.position.z], b:[(Math.random()-0.5)*4, 0.05, sm?2.5:5.5], h:sm?0.2:2.4, t:0, d:sm?0.45:0.9, dir:1}; } else { G.hu(G.S.L2("Terlalu awal/lewat","Too early/late")); } };
  st0(G); };
})();
