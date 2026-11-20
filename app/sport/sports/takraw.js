/* My Ihsan Sports: Sepak takraw. Court 13.4 x 6.1 m (as badminton doubles); net 1.52 m men / 1.42 m women; service circle r 0.30 m; ball circumference ~42-44 cm.
   ISTAF laws; rules as of 2026. Items marked "check" in docs/specs/sports-guide.md need a final check against the current ISTAF laws. */
(function(){
"use strict";
var L=13.4, HL=6.7, W=6.1, NET=1.52, SC=0.30, BALL=0.137;
function tball(S){ var T=S.T, m=new T.Mesh(new T.IcosahedronGeometry(BALL/2,1), new T.MeshLambertMaterial({color:0xf2c94c, wireframe:false, flatShading:true})); var w=new T.Mesh(new T.IcosahedronGeometry(BALL/2*1.01,1), new T.MeshBasicMaterial({color:0x8a5a1a, wireframe:true})); m.add(w); S.st.add(m); return m; }
var REGU=[["tekong","#f1efe9"],["feeder","#f1efe9"],["striker","#f1efe9"]];
SPORTS.takraw={ id:"takraw", v:"2026", H:1.71, cam:[9,6,11], top:[0,19,0.1], sky:"#2a2f3a", ground:"#3b3f4a",
 field:function(K){ K.rect(W+3, L+4, "#1f5f8b"); K.lineW=0.04; K.box(-W/2,-HL,W/2,HL,0.04); K.line(-W/2,0,W/2,0,0.04);
   [-1,1].forEach(function(s){ K.arc(0, s*(HL-2.45), SC, 0, Math.PI*2, 0.04); K.arc(-W/2, 0, 0.9, s>0?-Math.PI/2:0, s>0?0:Math.PI/2, 0.04); K.arc(W/2, 0, 0.9, s>0?Math.PI:Math.PI/2, s>0?Math.PI*1.5:Math.PI, 0.04); });
   K.post(-W/2-0.3,0,1.6,0.03,"#ddd"); K.post(W/2+0.3,0,1.6,0.03,"#ddd"); K.net(-W/2-0.3,W/2+0.3,0,NET-0.7,NET,"rgba(20,20,20,.8)",0.05); return {w:W,l:L}; },
 facts:[[["Gelanggang","Court"],"13.4 × 6.1 m"],[["Jaring (lelaki / wanita)","Net (men / women)"],"1.52 m / 1.42 m"],[["Bulatan servis","Service circle"],"r 0.30 m"],[["Bola (lilitan)","Ball (circumference)"],"≈ 42–44 cm"],[["Pemain setiap regu","Players per regu"],"3"]],
 zones:[
  {n:["Bulatan servis","Service circle"], d:["Tekong mesti meletakkan sebelah kaki dalam bulatan ini semasa servis.","The tekong must keep one foot inside this circle while serving."], p:(function(){ var a=[]; for(var i=0;i<16;i++){ var t=i/16*Math.PI*2; a.push([Math.cos(t)*0.6, -(HL-2.45)+Math.sin(t)*0.6]); } return a; })()},
  {n:["Suku bulatan","Quarter circles"], d:["Pemain hadapan (feeder dan striker) berdiri dalam suku bulatan di tepi jaring semasa servis.","The front players (feeder and striker) stand in the quarter circles by the net during the serve."], p:[[-W/2,0],[-W/2+0.9,0],[-W/2,-0.9]]},
  {n:["Gelanggang sendiri","Own court"], d:["Setiap regu ada 3 sentuhan untuk menghantar bola ke seberang.","Each regu has up to 3 touches to send the ball over."], p:[[-W/2,-HL],[W/2,-HL],[W/2,0],[-W/2,0]]},
  {n:["Garisan tengah","Centre line"], d:["Kaki tidak boleh melepasi garisan tengah ke gelanggang lawan.","A foot must not cross the centre line into the other court."], p:[[-W/2,-0.2],[W/2,-0.2],[W/2,0.2],[-W/2,0.2]]}],
 cards:[
  {t:["Regu: 3 pemain","A regu: 3 players"], x:["Tekong (server) di belakang, feeder (pengumpan) dan striker (penyerang) di hadapan dekat jaring.","The tekong (server) at the back, the feeder and the striker at the front near the net."], cam:[[6,6,-11],[0,0,-3]], dur:4,
   set:function(S){ var p=[[0,-(HL-2.45)],[-2.2,-1.1],[2.2,-1.1]], B=p.map(function(q,i){ var b=S.st.body(S.H,{top:"#f1efe9",pants:"#1f3b5c"}); S.place(b,q[0],q[1],0); return b; });
     var lb=[S.st.label("TEKONG",0,2.3,-(HL-2.45),0.6),S.st.label("FEEDER",-2.2,2.3,-1.1,0.6),S.st.label("STRIKER",2.2,2.3,-1.1,0.6)]; return {B:B}; },
   at:function(S, s, p){ s.B.forEach(function(b,i){ S.pose(b,"ready",0); }); }},
  {t:["Tiada tangan","No hands"], x:["Bola dimainkan dengan kaki, lutut, dada dan kepala. Tangan dan lengan tidak boleh menyentuh bola.","The ball is played with the feet, knees, chest and head. Hands and arms may not touch the ball."], cam:[[3,1.8,-4],[0,1,-2]], dur:3,
   set:function(S){ var a=S.st.body(S.H,{pants:"#1f3b5c"}); S.place(a,0,-2,0); return {a:a, b:tball(S)}; },
   at:function(S, s, p){ var up=Math.abs(Math.sin(p*Math.PI*2)); S.pose(s.a,"kick",0.55+0.2*up); s.b.position.set(0,0.4+up*1.3,-1.6); s.b.rotation.x+=0.1; }},
  {t:["3 sentuhan","3 touches"], x:["Setiap regu boleh menyentuh bola hingga 3 kali sebelum menghantarnya ke seberang. Seorang pemain boleh menyentuh lebih dari sekali.","A regu may touch the ball up to 3 times before sending it over. One player may touch it more than once."], cam:[[7,5,-8],[0,1,-2]], dur:4,
   set:function(S){ var B=[[0,-4],[-1.6,-1.2],[1.6,-1.2]].map(function(q){ var b=S.st.body(S.H,{pants:"#1f3b5c"}); S.place(b,q[0],q[1],0); return b; }); return {B:B, b:tball(S), n:[S.st.label("1",0,3,-4,0.7),S.st.label("2",-1.6,3,-1.2,0.7),S.st.label("3",1.6,3.4,-1.2,0.7)]}; },
   at:function(S, s, p){ var pts=[[0,0.6,-3.7],[-1.6,1.2,-0.9],[1.6,2.6,-0.9],[0.5,0.1,3]]; var k=Math.min(2,Math.floor(p*3)), q=(p*3)%1; S.u.arc(s.b,pts[k],pts[k+1],1.6,q);
     s.B.forEach(function(b,i){ S.pose(b, i===k?(k===2?"bicycle":"kick"):"ready", i===k?q:0); }); s.n.forEach(function(l,i){ S.u.show(l,i<=k); }); }},
  {t:["Servis","The serve"], x:["Feeder melambung bola kepada tekong. Tekong, dengan sebelah kaki dalam bulatan servis, menendang bola melepasi jaring dengan sekali sentuh.","The feeder tosses the ball to the tekong. With one foot in the service circle, the tekong kicks it over the net in one touch."], cam:[[5,2.6,-9],[0,1,-3]], dur:3.5,
   set:function(S){ var t=S.st.body(S.H,{pants:"#1f3b5c"}), f=S.st.body(S.H,{pants:"#1f3b5c"}); S.place(t,0,-(HL-2.45),0); S.place(f,-2.2,-1.1,Math.PI*0.85); return {t:t,f:f,b:tball(S)}; },
   at:function(S, s, p){ var c=-(HL-2.45); if(p<0.45){ S.u.arc(s.b,[-2.1,1.0,-1.3],[0.2,1.0,c+0.4],2.2,p/0.45); S.pose(s.f,"serve",S.seg(p,0,0.2)); } else S.u.arc(s.b,[0.2,1.0,c+0.4],[0.8,0.07,4],2.4,S.seg(p,0.5,0.95)); S.pose(s.t,"kick",S.seg(p,0.35,0.6)); }},
  {t:["Kesalahan servis","Serve faults"], x:["Mengangkat kaki dari bulatan, bola tidak melepasi jaring, jatuh di luar, atau feeder/striker bergerak sebelum bola ditendang.","Lifting the foot from the circle, the ball not crossing the net, landing out, or the feeder/striker moving before the kick."], cam:[[3,2,-8],[0,0.6,-4]], dur:3,
   set:function(S){ var t=S.st.body(S.H,{pants:"#1f3b5c"}); S.place(t,0.4,-(HL-2.45)+0.5,0); return {t:t, lb:S.st.label("FAULT",0.4,2.4,-(HL-2.45),0.7,"#ff6b6b")}; }, at:function(S, s, p){ S.pose(s.t,"kick",p); S.u.show(s.lb,p>0.4); }},
  {t:["Jaring & garisan tengah","Net and centre line"], x:["Menyentuh jaring atau melepasi garisan tengah dengan kaki ke gelanggang lawan = mata kepada lawan.","Touching the net, or a foot crossing the centre line into the other court, gives the point to the opponents."], cam:[[5,2,-3],[0,1,0]], dur:3,
   set:function(S){ var a=S.st.body(S.H,{pants:"#1f3b5c"}); return {a:a, lb:S.st.label("FAULT",0,2.6,0,0.7,"#ff6b6b")}; }, at:function(S, s, p){ S.place(s.a,0,-0.7+S.seg(p,0,0.5)*0.75,0); S.pose(s.a,"jump",S.seg(p,0,0.8)); S.u.show(s.lb,p>0.5); }},
  {t:["Mata: rali hingga 21","Scoring: rally to 21"], x:["Setiap rali memberi mata. Set hingga 21 (menang dengan beza 2, dengan had mata); perlawanan 3 set terbaik, set ketiga hingga 15. (Semak undang-undang ISTAF terkini.)","Every rally scores. Sets go to 21 (win by 2, with a cap); matches are best of 3 sets, the third set to 15. (Check the current ISTAF laws.)"], cam:[[0,4,-10],[0,1.5,0]], dur:4,
   set:function(S){ return {a:S.st.label("21-18",-1.6,2.6,0,0.8), b:S.st.label("19-21",0,2.6,0,0.8), c:S.st.label("15-12 ✓",1.8,2.6,0,0.8)}; }, at:function(S, s, p){ S.u.show(s.b,p>0.33); S.u.show(s.c,p>0.66); }},
  {t:["Tukar servis","Change of serve"], x:["Servis bertukar antara regu selepas setiap 3 mata. (Semak undang-undang ISTAF terkini.)","Service changes between the regus after every 3 points. (Check the current ISTAF laws.)"], cam:[[0,14,-9],[0,0,0]], dur:4,
   set:function(S){ return {a:S.u.zone(-0.6,-(HL-1.85),0.6,-(HL-3.05),"#CBFA1E",0.6), b:S.u.zone(-0.6,HL-3.05,0.6,HL-1.85,"#CBFA1E",0.6), l:S.st.label("1 · 2 · 3",0,2,0,0.8)}; }, at:function(S, s, p){ S.u.show(s.a,p<0.5); S.u.show(s.b,p>=0.5); }},
  {t:["Teknik: sila, kuda & gulung","Skills: sila, kuda and the bicycle spike"], x:["Sila (sepakan kaki dalam) untuk kawalan, kuda (sepakan atas kaki), dan smash gulung (sepakan basikal) di atas jaring.","Sila (inside-foot kick) for control, kuda (instep kick), and the rolling bicycle-kick spike over the net."], cam:[[5,2.4,-3.5],[0,1.6,0]], dur:3,
   set:function(S){ var a=S.st.body(S.H,{pants:"#1f3b5c"}); S.place(a,0.3,-0.9,0); return {a:a, b:tball(S)}; },
   at:function(S, s, p){ S.pose(s.a,"bicycle",p); if(p<0.5) S.u.arc(s.b,[-1.5,1.2,-0.8],[0.3,2.3,-0.7],1.0,p/0.5); else S.u.arc(s.b,[0.3,2.3,-0.7],[0.5,0.07,3],0.1,S.seg(p,0.5,0.75)); }},
  {t:["Acara: regu, beregu, kuadran","Events: regu, doubles, quadrant"], x:["Regu (3 pemain) ialah acara utama. Ada juga beregu (2) dan kuadran (4) dalam sesetengah kejohanan.","The regu (3 players) is the main event. Some championships also have doubles (2) and quadrant (4)."], cam:[[8,7,-9],[0,0,-2]], dur:5,
   set:function(S){ var B=[0,1,2,3].map(function(){ return S.st.body(S.H,{pants:"#1f3b5c"}); }); return {B:B, l:S.st.label("",0,0,0,0.1)}; },
   at:function(S, s, p){ var k=Math.floor(p*3), n=[3,2,4][k], P={3:[[0,-4.25],[-2.2,-1.1],[2.2,-1.1]],2:[[0,-4],[1.4,-1.5]],4:[[0,-4.5],[-2,-1.1],[2,-1.1],[0,-2.5]]}[n];
     s.B.forEach(function(b,i){ b.visible=i<n; if(i<n){ S.place(b,P[i][0],P[i][1],0); S.pose(b,"ready",0); } }); }}],
 quiz:[
  {q:["Berapa pemain dalam satu regu?","How many players are in a regu?"], a:[["2","2"],["3","3"],["4","4"]], ok:1, why:["Tekong, feeder dan striker.","Tekong, feeder and striker."]},
  {q:["Bahagian badan mana TIDAK boleh menyentuh bola?","Which body part may NOT touch the ball?"], a:[["Kepala","Head"],["Lutut","Knee"],["Tangan","Hand"]], ok:2, why:["Tangan dan lengan tidak dibenarkan.","Hands and arms are not allowed."]},
  {q:["Berapa sentuhan maksimum setiap regu?","What is the most touches a regu may take?"], a:[["2","2"],["3","3"],["5","5"]], ok:1, why:["3 sentuhan, boleh pemain yang sama.","3 touches, even by the same player."]},
  {q:["Siapa yang melakukan servis?","Who serves?"], a:[["Feeder","Feeder"],["Striker","Striker"],["Tekong","Tekong"]], ok:2, why:["Tekong, dengan sebelah kaki dalam bulatan servis.","The tekong, with one foot in the service circle."]},
  {q:["Kaki striker melepasi garisan tengah. Keputusannya?","The striker's foot crosses the centre line. Result?"], a:[["Main terus","Play on"],["Mata kepada lawan","Point to the opponents"]], ok:1, why:["Melepasi garisan tengah ialah kesalahan.","Crossing the centre line is a fault."]}],
 game:{ name:["Smash gulung","Bicycle spike"], help:["Feeder melambung bola. Ketik untuk melompat bila bola di puncak (bulatan hijau). Elak penghadang! 10 lambungan.","The feeder tosses the ball. Tap to jump when the ball is at its peak (green ring). Beat the blocker! 10 tosses."], unit:["mata","pts"],
  cam:[6,2.4,-4.5], at:[0,1.8,0],
  start:function(G){ var S=G.S; G.me=S.st.body(S.H,{pants:"#1f3b5c"}); G.fd=S.st.body(S.H,{pants:"#1f3b5c"}); G.bl=S.st.body(S.H,{top:"#c0392b",pants:"#2b2f3a"}); S.place(G.me,0.4,-0.9,0); S.place(G.fd,-2.2,-1.4,Math.PI*0.8); S.place(G.bl,0.4,0.8,Math.PI);
   G.b=tball(S); G.ring=S.u.strip(0,-0.7,0.6,-0.7,0.6,"#CBFA1E",2.3); G.ring.rotation.x=0; G.n=0; G.pts=0; G.toss=function(){ G.t=0; G.d=Math.max(0.9,1.5-G.n*0.05); G.jump=null; G.res=""; }; G.toss(); G.hu(); },
  step:function(G, dt){ var S=G.S; if(G.wait) return; G.t+=dt/G.d; var q=G.t;
   if(!G.jump){ S.u.arc(G.b,[-2.1,1.0,-1.2],[0.5,2.3-(q>1?(q-1)*4:0),-0.7],1.4,Math.min(q,1.4)); G.ring.material.opacity=q>0.42&&q<0.62?0.8:0.25; S.pose(G.me,"ready",0); S.pose(G.bl,"ready",0);
     if(q>1.4){ G.res="miss"; G.next(); } }
   else { var j=G.jump; j.t+=dt; S.pose(G.me,"bicycle",Math.min(1,j.t/0.7)); S.pose(G.bl,"jump",Math.min(1,j.t/0.7)); G.bl.position.x=0.4+j.bx;
     if(j.t>0.35){ S.u.arc(G.b,j.from,[j.tx,0.07,3.5],0.2,Math.min(1,(j.t-0.35)/0.35)); } if(j.t>0.8 && !G.res){ G.res=j.good?(j.block?"block":"point"):"miss"; if(G.res==="point") G.pts++; G.next(); } } },
  tap:function(G){ if(G.jump||G.wait) return; var q=G.t, good=q>0.42&&q<0.62, bx=(Math.random()-0.5)*1.6, tx=(Math.random()-0.5)*4.5; G.jump={t:0, good:good, from:[G.b.position.x,G.b.position.y,G.b.position.z], tx:tx, bx:bx, block:good&&Math.abs(bx-(tx*0.25))<0.35}; },
  hu0:null },
 fieldScene:null };
var gm=SPORTS.takraw.game, st0=gm.start; gm.start=function(G){ var L2=G.S.L2;
  G.hu=function(){ G.S.hud('🦶 '+G.pts+' / '+G.n+(G.res?'  ·  '+(G.res==="point"?L2("MATA!","POINT!"):G.res==="block"?L2("Dihadang","Blocked"):L2("Terlepas","Missed")):'')); };
  G.next=function(){ G.n++; G.hu(); G.wait=true; G.S.vib(G.res==="point"?40:15); setTimeout(function(){ if(G.over) return; G.wait=false; if(G.n>=10) G.end(G.pts, G.pts+" / 10 "+L2("mata","points")); else G.toss(); }, 800); };
  st0(G); };
})();
