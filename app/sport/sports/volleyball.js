/* My Ihsan Sports: Volleyball (indoor). Court 18 × 9 m; attack line 3 m from the centre line; net top 2.43 m (men) / 2.24 m (women); ball Ø ≈ 21 cm.
   FIVB Official Volleyball Rules, rules as of 2026. */
(function(){
"use strict";
var L=18, HL=9, W=9, AL=3, NET=2.43, B=0.21;
function vb(S){ var T=S.T, m=S.st.ball(B, "#f3f0e6"); var r=new T.Mesh(new T.TorusGeometry(B/2*1.002, B*0.04, 4, 24), new T.MeshLambertMaterial({color:0x2a6fd6})); m.add(r); var r2=r.clone(); r2.rotation.y=Math.PI/2; r2.material=new T.MeshLambertMaterial({color:0xf2c94c}); m.add(r2); return m; }
SPORTS.volleyball={ id:"volleyball", v:"2026", H:1.94, cam:[13,9,15], sky:"#2a2f3a", ground:"#3b3f4a",
 field:function(K){ K.rect(W+6, L+8, "#2c5d8a"); K.rect(W, L, "#e29a3b", 0.002); K.lineW=0.05;
   K.box(-W/2,-HL,W/2,HL,0.05); K.line(-W/2,0,W/2,0,0.05); [-1,1].forEach(function(s){ K.line(-W/2,s*AL,W/2,s*AL,0.05); });
   K.post(-W/2-1,0,NET+0.1,0.05,"#ddd"); K.post(W/2+1,0,NET+0.1,0.05,"#ddd"); K.net(-W/2-0.5,W/2+0.5,0,NET-1,NET,"rgba(20,20,20,.8)",0.1);
   [-1,1].forEach(function(x){ K.bar(x*W/2,NET,0,x*W/2,NET+0.8,0,0.012,"#ff5a5a"); }); return {w:W,l:L}; },
 facts:[[["Gelanggang","Court"],"18 × 9 m"],[["Garisan serangan","Attack line"],"3 m dari garisan tengah / 3 m from the centre line"],[["Jaring (lelaki / wanita)","Net (men / women)"],"2.43 m / 2.24 m"],[["Bola","Ball"],"Ø ≈ 21 cm"],[["Pemain","Players"],"6"]],
 zones:[
  {n:["Zon hadapan","Front zone"], d:["Antara jaring dan garisan serangan 3 m. Pemain barisan belakang tidak boleh melompat menyerang dari sini.","Between the net and the 3 m attack line. Back-row players may not jump and attack from here."], p:[[-W/2,-AL],[W/2,-AL],[W/2,0],[-W/2,0]]},
  {n:["Zon belakang","Back zone"], d:["Libero dan pemain barisan belakang bermain di sini.","The libero and back-row players play here."], p:[[-W/2,-AL],[W/2,-AL],[W/2,-HL],[-W/2,-HL]]},
  {n:["Zon servis","Service zone"], d:["Servis dibuat dari belakang garisan hujung.","Serve from behind the end line."], p:[[-W/2,-HL],[W/2,-HL],[W/2,-HL-2],[-W/2,-HL-2]]}],
 cards:[
  {t:["6 pemain, putaran","6 players, rotation"], x:["6 pemain setiap pasukan. Selepas memenangi semula servis, pasukan berputar satu kedudukan mengikut arah jam.","6 players per team. After winning back the serve, the team rotates one position clockwise."], cam:[[0,16,-12],[0,0,-4]], dur:4,
   set:function(S){ var P=[[3,-1.5],[0,-1.5],[-3,-1.5],[-3,-6],[0,-6],[3,-6]], B=P.map(function(q,i){ var b=S.st.body(S.H,S.team(0)); return b; }); return {B:B,P:P}; },
   at:function(S, s, p){ var q=S.seg(p,0.3,0.8), n=s.P.length; s.B.forEach(function(b,i){ var a=s.P[i], c=s.P[(i+5)%n]; b.position.set(S.lerp(a[0],c[0],q),0,S.lerp(a[1],c[1],q)); S.pose(b,q>0&&q<1?"run":"ready",(p*3)%1); }); }},
  {t:["Servis dari belakang garisan","Serve from behind the line"], x:["Servis dibuat dari belakang garisan hujung, dengan satu pukulan.","Serve from behind the end line with one hit."], cam:[[6,3,-14],[0,1.6,-5]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); S.place(a,1,-HL-0.8,0); return {a:a,b:vb(S)}; }, at:function(S, s, p){ S.pose(s.a,"serve",S.seg(p,0,0.3)); S.u.arc(s.b,[1.1,2.4,-HL-0.5],[-1,0.1,5],2.5,S.seg(p,0.25,0.9)); }},
  {t:["Hingga 3 sentuhan","Up to 3 touches"], x:["Setiap pasukan boleh menyentuh bola hingga 3 kali (blok tidak dikira) sebelum menghantarnya ke seberang.","Each team may touch the ball up to 3 times (the block doesn't count) before sending it over."], cam:[[8,5,-9],[0,2,-3]], dur:5,
   set:function(S){ var P=[[1,-6],[-0.5,-1],[2,-1.5]], B=P.map(function(q){ var b=S.st.body(S.H,S.team(0)); S.place(b,q[0],q[1],0); return b; }); return {B:B,P:P,b:vb(S),l:S.st.label("1",0,4,-3,0.7)}; },
   at:function(S, s, p){ var k=Math.min(2,Math.floor(p*3)), q=(p*3)%1, P=s.P, a=P[k], c=k<2?P[k+1]:[0,6]; S.u.arc(s.b,[a[0],1.8,a[1]],[c[0],k<2?1.8:0.1,c[1]],k<2?2.5:0.8,q); s.B.forEach(function(b,i){ S.pose(b,i===k?(k===2?"smash":"ready"):"ready",q); }); s.l.parent.remove(s.l); s.l=S.st.label(String(k+1),0,4,-3,0.7); }},
  {t:["Tiada sentuhan dua kali","No double touch"], x:["Pemain tidak boleh menyentuh bola dua kali berturut-turut (kecuali selepas blok).","A player may not touch the ball twice in a row (except after a block)."], cam:[[5,3,-6],[0,1.8,-3]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); S.place(a,0,-3,0); return {a:a,b:vb(S),lb:S.st.label("✗",0,3.6,-3,1,"#ff6b6b")}; },
   at:function(S, s, p){ var y=1.9+Math.abs(Math.sin(p*Math.PI*2))*1.2; s.b.position.set(0,y,-2.7); S.pose(s.a,"ready",0); S.u.show(s.lb,p>0.6); }},
  {t:["Serangan barisan belakang","Back-row attack"], x:["Pemain barisan belakang boleh menyerang hanya jika melompat dari belakang garisan 3 m.","A back-row player may attack only by jumping from behind the 3 m line."], cam:[[8,4,-7],[0,1,-3]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); return {a:a, z:S.u.zone(-W/2,-AL,W/2,0,"#ff6b6b",0.25), lb:S.st.label("3 m",W/2-0.5,0.6,-AL,0.6)}; },
   at:function(S, s, p){ S.place(s.a,0,-AL-0.8+S.seg(p,0,0.3)*0.3,0); S.pose(s.a,"smash",S.seg(p,0.3,1)); }},
  {t:["Sentuh jaring = kesalahan","Touching the net is a fault"], x:["Menyentuh jaring antara antena semasa bermain, atau kaki melepasi garisan tengah sepenuhnya, adalah kesalahan.","Touching the net between the antennas during play, or a foot fully crossing the centre line, is a fault."], cam:[[5,3,-4],[0,1.8,0]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); S.place(a,0,-0.5,0); return {a:a, lb:S.st.label("NET",0,3.4,0,0.8,"#ff6b6b")}; }, at:function(S, s, p){ S.pose(s.a,"jump",p); S.u.show(s.lb,p>0.4); }},
  {t:["Libero","Libero"], x:["Libero memakai baju berlainan warna, bermain di barisan belakang sahaja, dan tidak boleh menyerang dari atas paras jaring.","The libero wears a different colour, plays only in the back row, and may not attack the ball from above net height."], cam:[[6,5,-12],[0,0.5,-6]], dur:3,
   set:function(S){ var a=S.st.body(S.H,{top:"#f2c94c",pants:"#2b2f3a"}); S.place(a,0,-6,0); return {a:a, lb:S.st.label("LIBERO",0,2.6,-6,0.6)}; }, at:function(S, s, p){ S.pose(s.a,"ready",0); }},
  {t:["Mata rali: set hingga 25","Rally scoring: sets to 25"], x:["Setiap rali memberi mata. Set hingga 25 dengan beza 2; set ke-5 hingga 15.","Every rally scores a point. Sets go to 25 with a 2-point lead; the 5th set goes to 15."], cam:[[0,4,-14],[0,2,0]], dur:4,
   set:function(S){ return {lb:S.st.label("24 - 24",0,3.4,0,1)}; }, at:function(S, s, p){ var seq=["24 - 24","25 - 24","25 - 25","26 - 25","27 - 25 ✓"], i=Math.min(4,Math.floor(p*5)); if(s.k!==i){ s.k=i; s.lb.parent.remove(s.lb); s.lb=S.st.label(seq[i],0,3.4,0,1); } }},
  {t:["5 set terbaik","Best of 5 sets"], x:["Pasukan yang memenangi 3 set dahulu memenangi perlawanan.","The first team to win 3 sets wins the match."], cam:[[0,4,-14],[0,2,0]], dur:4,
   set:function(S){ return {a:S.st.label("25-21",-3,3.2,0,0.7), b:S.st.label("23-25",-1,3.2,0,0.7), c:S.st.label("25-18",1,3.2,0,0.7), d:S.st.label("25-22 ✓",3.2,3.2,0,0.7)}; }, at:function(S, s, p){ S.u.show(s.b,p>0.25); S.u.show(s.c,p>0.5); S.u.show(s.d,p>0.75); }},
  {t:["Atas garisan = masuk","On the line is in"], x:["Bola yang menyentuh garisan dikira masuk.","A ball touching the line is in."], cam:[[W/2+3,2,6],[W/2,0,5]], dur:3,
   set:function(S){ return {b:vb(S), lb:S.st.label("IN",W/2,1.2,5,0.7)}; }, at:function(S, s, p){ S.u.arc(s.b,[0,3,0],[W/2,0.1,5],1.5,S.seg(p,0,0.6)); S.u.show(s.lb,p>0.6); }}],
 quiz:[
  {q:["Berapa sentuhan dibenarkan setiap pasukan?","How many touches does each team get?"], a:[["2","2"],["3","3"],["4","4"]], ok:1, why:["3 sentuhan; blok tidak dikira.","3 touches; the block doesn't count."]},
  {q:["Set biasa dimainkan hingga…","A normal set is played to…"], a:[["15","15"],["21","21"],["25","25"]], ok:2, why:["25 dengan beza 2; set ke-5 hingga 15.","25 with a 2-point lead; the 5th set to 15."]},
  {q:["Selepas memenangi semula servis, pasukan…","After winning back the serve, the team…"], a:[["Berputar mengikut arah jam","Rotates clockwise"],["Bertukar gelanggang","Changes ends"]], ok:0, why:["Satu kedudukan mengikut arah jam.","One position clockwise."]},
  {q:["Libero boleh bermain…","The libero may play…"], a:[["Di mana-mana","Anywhere"],["Barisan belakang sahaja","Back row only"]], ok:1, why:["Barisan belakang sahaja, baju berlainan warna.","Back row only, in a different colour."]},
  {q:["Tinggi jaring lelaki ialah…","The men's net height is…"], a:[["2.24 m","2.24 m"],["2.43 m","2.43 m"],["2.55 m","2.55 m"]], ok:1, why:["2.43 m (wanita 2.24 m).","2.43 m (women 2.24 m)."]}],
 game:{ name:["Masa rejaman","Spike timing"], help:["Penghantar melambung bola ke atas. Ketik bila bola di puncak (bulatan hijau) untuk merejam. Leret kiri atau kanan untuk mengelak penghadang. 10 bola.","The setter lifts the ball. Tap when it is at the top (green ring) to spike. Swipe left or right to beat the blocker. 10 balls."], unit:["mata","pts"],
  cam:[6,3.4,-7.5], at:[0,2.4,0],
  start:function(G){ var S=G.S; G.me=S.st.body(S.H,S.team(0)); G.set=S.st.body(S.H,S.team(0)); G.bl=S.st.body(S.H,S.team(1)); S.place(G.me,0.5,-2.2,0); S.place(G.set,-1.5,-0.8,0.6); S.place(G.bl,0,0.6,Math.PI);
   G.b=vb(S); var T=S.T; G.ring=new T.Mesh(new T.TorusGeometry(0.3,0.035,6,28), new T.MeshBasicMaterial({color:0xCBFA1E, transparent:true, opacity:0.3})); G.ring.position.set(0.5,3.3,-0.7); G.ring.lookAt(6,3.4,-7.5); S.st.add(G.ring); G.n=0; G.pts=0; G.toss(); G.hu(); },
  step:function(G, dt){ var S=G.S, f=G.f; if(!f) return; f.t+=dt/f.d; var q=f.t;
   if(f.k==="toss"){ S.u.arc(G.b,[-1.5,1.9,-0.8],[0.5,3.3,-0.7],1.4,Math.min(q,1)); if(q>1) G.b.position.y=3.3-(q-1)*6; var w=q>0.82&&q<1.08; G.ring.material.opacity=w?0.85:0.25; S.pose(G.set,"ready",0);
     G.bl.position.x=S.lerp(G.bl.position.x,G.blx,0.08); S.pose(G.bl,q>0.8?"jump":"ready",Math.max(0,(q-0.8)*2.5)); S.pose(G.me,"ready",0);
     if(q>1.3){ G.res(false, S.L2("Terlepas","Missed")); } }
   else { S.u.arc(G.b,f.a,f.b,f.h,Math.min(q,1)); S.pose(G.me,"smash",Math.min(1,q*1.5)); if(q>=1){ G.f=null; setTimeout(function(){ if(!G.over) G.toss(); },500); } } },
  tap:function(G){ G.spike(0); }, swipe:function(G, dx){ G.spike(dx<-0.04?-1:dx>0.04?1:0); } }};
var gm=SPORTS.volleyball.game, st0=gm.start; gm.start=function(G){ var S=G.S;
  G.hu=function(msg){ S.hud('🏐 '+G.pts+' / '+G.n+(msg?'  ·  '+msg:'')); };
  G.toss=function(){ if(G.n>=10) return G.end(G.pts, G.pts+" / 10"); G.n++; G.blx=[-2,0,2][Math.floor(Math.random()*3)]; G.f={k:"toss", t:0, d:1.2}; };
  G.res=function(ok, msg){ if(ok){ G.pts++; S.vib(25); } G.hu(msg); G.f=null; setTimeout(function(){ if(!G.over) G.toss(); }, 600); };
  G.spike=function(aim){ var f=G.f; if(!f||f.k!=="toss") return; if(f.t<0.8||f.t>1.1) return G.res(false, S.L2("Terlalu awal / lewat","Too early / late"));
    var x=aim*2.6, blocked=Math.abs(G.blx-x)<1.2; G.f={k:"hit", t:0, d:0.45, a:[G.b.position.x,G.b.position.y,G.b.position.z], b:blocked?[G.blx,1.2,-1.5]:[x,0.1,4+Math.random()*3], h:blocked?0.4:0.2};
    if(blocked){ G.hu(S.L2("Diblok!","Blocked!")); } else { G.pts++; S.vib(25); G.hu(S.L2("Mata!","Point!")); } };
  st0(G); };
})();
