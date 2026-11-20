/* My Ihsan Sports: Pickleball. Court 6.10 × 13.41 m (20 × 44 ft); non-volley zone ("kitchen") 2.13 m (7 ft) each side;
   net 0.86 m (34 in) at the centre, 0.91 m (36 in) at the posts; perforated ball Ø ≈ 7.4 cm. USA Pickleball rulebook, rules as of 2026 (check serve and scoring changes). */
(function(){
"use strict";
var L=13.41, HL=6.705, W=6.10, KZ=2.13, NET=0.86, B=0.074;
function pk(S){ var T=S.T, m=S.st.ball(B*2, "#f2d43a"); for(var i=0;i<6;i++){ var h=new T.Mesh(new T.CircleGeometry(B*0.22,8), new T.MeshBasicMaterial({color:0x7a6a10})); var a=i/6*Math.PI*2; h.position.set(Math.cos(a)*B*1.0, Math.sin(a)*B*1.0*0.5, B*0.86); h.lookAt(0,0,0); h.rotateY(Math.PI); m.add(h); } return m; }
function paddle(S, b){ var T=S.T, r=new T.Group(); var h=new T.Mesh(new T.CylinderGeometry(0.016,0.016,0.13,6), new T.MeshLambertMaterial({color:0x222222})); h.position.y=-0.06; r.add(h);
  var f=new T.Mesh(new T.BoxGeometry(0.19,0.24,0.015), new T.MeshLambertMaterial({color:0x2e9e6b})); f.position.y=-0.24; r.add(f); r.position.y=-0.3; b.userData.J.elR.add(r); return r; }
SPORTS.pickleball={ id:"pickleball", v:"2026", H:1.75, cam:[7,5,9.5], sky:"#8fc7e8", ground:"#3e7c4f",
 field:function(K){ K.rect(W+4, L+5, "#2e6b4f"); K.rect(W, L, "#2f7fb3", 0.002); [-1,1].forEach(function(s){ K.rect(W, KZ, "#3b95c9", 0.003, 0, s*KZ/2); }); K.lineW=0.05;
   K.box(-W/2,-HL,W/2,HL,0.05); [-1,1].forEach(function(s){ K.line(-W/2,s*KZ,W/2,s*KZ,0.05); K.line(0,s*KZ,0,s*HL,0.05); });
   K.post(-W/2-0.3,0,0.91,0.03,"#ddd"); K.post(W/2+0.3,0,0.91,0.03,"#ddd"); K.net(-W/2-0.3,W/2+0.3,0,0.02,NET,"rgba(20,20,20,.75)",0.05); return {w:W,l:L}; },
 facts:[[["Gelanggang","Court"],"6.10 × 13.41 m (20 × 44 ft)"],[["Zon tanpa volley (dapur)","Non-volley zone (kitchen)"],"2.13 m (7 ft)"],[["Jaring (tengah / tiang)","Net (centre / posts)"],"0.86 m / 0.91 m"],[["Bola","Ball"],"Ø ≈ 7.4 cm, berlubang / perforated"]],
 zones:[
  {n:["Dapur (zon tanpa volley)","Kitchen (non-volley zone)"], d:["Anda tidak boleh memukul bola sebelum ia melantun (volley) sambil berdiri atau menyentuh zon ini.","You may not hit the ball out of the air (volley) while standing in or touching this zone."], p:[[-W/2,-KZ],[W/2,-KZ],[W/2,0],[-W/2,0]]},
  {n:["Petak servis kanan","Right service court"], d:["Servis menyerong dan mesti melepasi dapur lawan.","The serve goes diagonally and must clear the opponent's kitchen."], p:[[0,-KZ],[W/2,-KZ],[W/2,-HL],[0,-HL]]},
  {n:["Petak servis kiri","Left service court"], d:["Pemain beregu bertukar petak selepas pasukan server memenangi mata.","Doubles players switch courts after the serving team wins a point."], p:[[-W/2,-KZ],[0,-KZ],[0,-HL],[-W/2,-HL]]}],
 cards:[
  {t:["Biasanya beregu","Mostly doubles"], x:["Pickleball biasanya dimainkan 2 lawan 2; perseorangan guna gelanggang yang sama.","Pickleball is mostly played 2 vs 2; singles uses the same court."], cam:[[6,7,-9],[0,0,0]], dur:4,
   set:function(S){ [[-1.5,-5],[1.5,-5],[-1.5,5],[1.5,5]].forEach(function(q,i){ var b=S.st.body(S.H,S.team(i<2?0:1)); paddle(S,b); S.place(b,q[0],q[1],i<2?0:Math.PI); }); return {}; }, at:function(){}},
  {t:["Servis bawah, menyerong","Underhand serve, diagonal"], x:["Servis dari bawah (pukulan di bawah pinggang), menyerong, dan mesti melepasi dapur lawan.","Serve underhand (contact below the waist), diagonally, and clear the opponent's kitchen."], cam:[[5,2.4,-9],[0,0.8,-2]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); paddle(S,a); S.place(a,1.4,-HL-0.3,0); return {a:a, b:pk(S), k:S.u.zone(-W/2,0,W/2,KZ,"#ff6b6b",0.25)}; },
   at:function(S, s, p){ S.pose(s.a,"swing",S.seg(p,0,0.3)); S.u.arc(s.b,[1.2,0.7,-HL],[-1.4,0.05,4.5],1.3,S.seg(p,0.25,0.85)); }},
  {t:["Peraturan dua lantunan","Two-bounce rule"], x:["Servis mesti melantun, dan balasan servis juga mesti melantun, sebelum sesiapa boleh volley.","The serve must bounce, and the return of serve must bounce too, before anyone may volley."], cam:[[8,4,0],[0,0.5,0]], dur:4,
   set:function(S){ return {b:pk(S), l1:S.st.label("1",-1,1.5,4.5,0.6), l2:S.st.label("2",1,1.5,-4.5,0.6)}; },
   at:function(S, s, p){ if(p<0.5) S.u.arc(s.b,[1,0.7,-HL],[-1,0.05,4.5],1.2,p/0.5); else S.u.arc(s.b,[-1,0.05,4.5],[1,0.05,-4.5],1.4,(p-0.5)/0.5); S.u.show(s.l1,p>0.45); S.u.show(s.l2,p>0.95); }},
  {t:["Dapur: tiada volley","Kitchen: no volleys"], x:["Jangan volley sambil berdiri dalam dapur atau menyentuh garisannya. Anda boleh masuk untuk memukul bola yang sudah melantun.","Don't volley while standing in the kitchen or on its line. You may step in to play a ball that has bounced."], cam:[[5,3,-3.5],[0,0.4,-1]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); paddle(S,a); return {a:a, z:S.u.zone(-W/2,-KZ,W/2,0,"#ff6b6b",0.35), lb:S.st.label("FAULT",0,2,-1,0.7,"#ff6b6b")}; },
   at:function(S, s, p){ S.place(s.a,0.3,-KZ-0.6+S.seg(p,0.1,0.4)*1.2,0); S.pose(s.a,"swing",S.seg(p,0.45,0.7)); S.u.show(s.lb,p>0.6); }},
  {t:["Kesalahan","Faults"], x:["Bola keluar, tidak melepasi jaring, volley dalam dapur, atau melanggar peraturan dua lantunan = kesalahan.","Ball out, ball into the net, a kitchen volley, or breaking the two-bounce rule are faults."], cam:[[5,2,-2],[0,0.5,0]], dur:3,
   set:function(S){ return {b:pk(S), lb:S.st.label("NET",0,1.6,0,0.6,"#ff6b6b")}; }, at:function(S, s, p){ S.u.arc(s.b,[0.4,0.6,-4],[0.1,0.5,0],0.3,S.seg(p,0,0.5)); if(p>0.5) s.b.position.y=Math.max(0.05,0.5-(p-0.5)*2); S.u.show(s.lb,p>0.5); }},
  {t:["Mata hanya untuk server","Only the serving side scores"], x:["Dalam pemarkahan tradisional, hanya pasukan yang servis boleh mendapat mata. Game hingga 11, menang dengan beza 2. (Pemarkahan rali sedang dicuba.)","In traditional scoring only the serving side can score. Games go to 11, win by 2. (Rally scoring is being trialled.)"], cam:[[0,3,-9],[0,1.2,0]], dur:4,
   set:function(S){ return {lb:S.st.label("10 - 9",0,2,0,0.9)}; },
   at:function(S, s, p){ var seq=["10 - 9","10 - 10","11 - 10","12 - 10 ✓"], i=Math.min(3,Math.floor(p*4)); if(s.k!==i){ s.k=i; s.lb.parent.remove(s.lb); s.lb=S.st.label(seq[i],0,2,0,0.9); } }},
  {t:["Sebut mata: 0-0-2","Calling the score: 0-0-2"], x:["Dalam beregu, server menyebut tiga nombor: mata pasukan server, mata penerima, dan server (1 atau 2). Permainan bermula pada 0-0-2.","In doubles the server calls three numbers: serving team score, receiving team score, then server number (1 or 2). A game starts at 0-0-2."], cam:[[0,3,-9],[0,1.2,0]], dur:3,
   set:function(S){ return {lb:S.st.label("0 - 0 - 2",0,2,0,1)}; }, at:function(){}},
  {t:["Server kedua","Second server"], x:["Setiap pemain dalam pasukan beregu dapat giliran servis. Selepas server kedua kalah rali, servis berpindah ke lawan (side out).","Each player on a doubles team gets a turn to serve. When the second server loses a rally, the serve passes to the other team (side out)."], cam:[[6,6,-9],[0,0,-3]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)), b=S.st.body(S.H,S.team(0)); paddle(S,a); paddle(S,b); S.place(a,1.4,-HL-0.3,0); S.place(b,-1.4,-HL+1,0); return {a:a,b:b,l:S.st.label("1",1.4,2.2,-HL,0.5),l2:S.st.label("2",-1.4,2.2,-HL+1,0.5)}; },
   at:function(S, s, p){ S.pose(p<0.5?s.a:s.b,"swing",(p*2)%1); }},
  {t:["Tukar sisi","Switching sides"], x:["Pasukan bertukar sisi gelanggang selepas setiap game (dan pada 6 mata dalam game penentu).","Teams change ends after each game (and at 6 points in a deciding game)."], cam:[[9,7,0],[0,0,0]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)), b=S.st.body(S.H,S.team(1)); return {a:a,b:b}; }, at:function(S, s, p){ var q=S.seg(p,0.2,0.8); S.u.mv(s.a,-W/2-0.7,-4,-W/2-0.7,4,q); S.u.mv(s.b,W/2+0.7,4,W/2+0.7,-4,q); }},
  {t:["Atas garisan = masuk","On the line is in"], x:["Bola atas garisan dikira masuk, kecuali servis yang jatuh atas garisan dapur: itu kesalahan.","A ball on a line is in, except a serve landing on the kitchen line: that is a fault."], cam:[[4,2,3.5],[0,0,KZ]], dur:4,
   set:function(S){ return {b:pk(S), l1:S.st.label("IN",W/2-0.5,1,4,0.5), l2:S.st.label("SERVE: FAULT",0,1,KZ,0.5,"#ff6b6b")}; },
   at:function(S, s, p){ var a=p<0.5, q=(p*2)%1; S.u.arc(s.b,[0,1,-3],a?[W/2,0.05,4]:[-0.5,0.05,KZ],0.8,S.seg(q,0,0.6)); S.u.show(s.l1,a&&q>0.6); S.u.show(s.l2,!a&&q>0.6); }}],
 quiz:[
  {q:["Dapur ialah zon di mana anda tidak boleh…","The kitchen is the zone where you can't…"], a:[["Servis","Serve"],["Volley","Volley"],["Berjalan","Walk"]], ok:1, why:["Tiada volley dalam dapur.","No volleys in the kitchen."]},
  {q:["Servis pickleball dibuat…","A pickleball serve is…"], a:[["Dari bawah","Underhand"],["Dari atas kepala","Overhead"]], ok:0, why:["Servis bawah, menyerong.","Underhand, diagonally."]},
  {q:["Peraturan dua lantunan: siapa mesti biar bola melantun?","Two-bounce rule: who must let the ball bounce?"], a:[["Penerima servis dan pasukan server","The receiver and the serving team"],["Hanya server","Only the server"]], ok:0, why:["Servis melantun, balasan pun melantun.","The serve bounces, and so does the return."]},
  {q:["Skor 4-2-1 bermaksud…","A score of 4-2-1 means…"], a:[["Server 4, penerima 2, server pertama","Server 4, receiver 2, first server"],["Set 4","Set 4"]], ok:0, why:["Mata server, mata penerima, nombor server.","Server score, receiver score, server number."]},
  {q:["Game tradisional dimainkan hingga…","A traditional game goes to…"], a:[["11","11"],["21","21"]], ok:0, why:["11, menang dengan beza 2.","11, win by 2."]}],
 game:SportView.rally({ name:["Duel dink","Dink duel"], help:["Ketik dengan lembut bila bola masuk bulatan untuk dink balik ke dapur. Leret kiri atau kanan untuk pukulan ke tepi. Yang pertama 11 mata.","Tap softly when the ball enters the ring to dink it back into the kitchen. Swipe left or right for an angled shot. First to 11 points."],
   icon:"🥒", cam:[0,2.6,-HL-3.5], at:[0,0.6,0], me:[0,-KZ-0.6], op:[0,KZ+0.6], win:11, ball:pk, gear:paddle,
   inPath:function(G){ var x=(Math.random()-0.5)*3, pop=Math.random()<0.2; return {pts:[[0,0.6,KZ+0.4],[x*0.8,0.05,-KZ+0.5],[x,0.6,-KZ-0.4]], hs:[pop?1.4:0.45,0.3], d:Math.max(0.8,1.25-G.rally*0.03)}; },
   outPath:function(G, aim){ var x=aim*2.2+(Math.random()-0.5); return {pts:[[G.b.position.x,G.b.position.y,G.b.position.z],[x,0.05,KZ-0.6],[x,0.6,KZ+0.4]], hs:[0.45,0.3], d:1.0}; },
   ai:function(G, aim){ return 0.1+0.03*G.rally+(aim?0.14:0); } }) };
})();
