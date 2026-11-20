/* My Ihsan Sports: Tennis. Court 23.77 m long; singles 8.23 m, doubles 10.97 m wide; service line 6.40 m from the net;
   net 0.914 m at the centre, 1.07 m at the posts; ball Ø ≈ 6.7 cm. ITF Rules of Tennis, rules as of 2026. */
(function(){
"use strict";
var L=23.77, HL=11.885, W=10.97, WS=8.23, SV=6.40, NET=0.914, B=0.067;
function tb(S){ return S.st.ball(B*2.2, "#d4f53c"); }
function racket(S, b){ var T=S.T, r=new T.Group(), m=new T.MeshLambertMaterial({color:0x222222}); var h=new T.Mesh(new T.CylinderGeometry(0.014,0.014,0.3,6), m); h.position.y=-0.15; r.add(h);
  var hd=new T.Mesh(new T.TorusGeometry(0.13,0.01,6,22), new T.MeshLambertMaterial({color:0x1f6fb2})); hd.scale.y=1.25; hd.position.y=-0.44; r.add(hd); r.position.y=-0.3; b.userData.J.elR.add(r); return r; }
SPORTS.tennis={ id:"tennis", v:"2026", H:1.85, cam:[14,9,18], sky:"#8fc7e8", ground:"#3e7c4f",
 field:function(K){ K.rect(W+8, L+12, "#2f6fae"); K.rect(W, L, "#3a80c4", 0.002); K.lineW=0.05;
   K.box(-W/2,-HL,W/2,HL,0.05); [-1,1].forEach(function(x){ K.line(x*WS/2,-HL,x*WS/2,HL,0.05); });
   [-1,1].forEach(function(s){ K.line(-WS/2,s*SV,WS/2,s*SV,0.05); K.line(0,s*(HL-0.1),0,s*HL,0.05); }); K.line(0,-SV,0,SV,0.05);
   K.post(-W/2-0.914,0,1.07,0.04,"#e6e6e6"); K.post(W/2+0.914,0,1.07,0.04,"#e6e6e6"); K.net(-W/2-0.914,W/2+0.914,0,0.02,NET,"rgba(20,20,20,.75)",0.05); return {w:W,l:L}; },
 facts:[[["Panjang gelanggang","Court length"],"23.77 m"],[["Lebar perseorangan / beregu","Singles / doubles width"],"8.23 m / 10.97 m"],[["Garisan servis dari jaring","Service line from the net"],"6.40 m"],[["Jaring (tengah / tiang)","Net (centre / posts)"],"0.914 m / 1.07 m"],[["Bola","Ball"],"Ø 6.7 cm"]],
 zones:[
  {n:["Petak servis","Service box"], d:["Servis mesti mendarat dalam petak servis menyerong di seberang jaring.","A serve must land in the service box diagonally across the net."], p:[[0,0],[WS/2,0],[WS/2,SV],[0,SV]]},
  {n:["Lorong beregu","Doubles alley"], d:["Masuk dalam beregu, keluar dalam perseorangan.","In for doubles, out for singles."], p:[[WS/2,-HL],[W/2,-HL],[W/2,HL],[WS/2,HL]]},
  {n:["Garisan dasar","Baseline"], d:["Server berdiri di belakang garisan dasar, di antara tanda tengah dan garisan tepi.","The server stands behind the baseline, between the centre mark and the sideline."], p:[[-W/2,-HL-0.4],[W/2,-HL-0.4],[W/2,-HL+0.4],[-W/2,-HL+0.4]]},
  {n:["Gelanggang belakang","Backcourt"], d:["Kawasan antara garisan servis dan garisan dasar.","The area between the service line and the baseline."], p:[[-WS/2,-SV],[WS/2,-SV],[WS/2,-HL],[-WS/2,-HL]]}],
 cards:[
  {t:["Perseorangan & beregu","Singles and doubles"], x:["Perseorangan guna garisan tepi dalam (8.23 m). Beregu termasuk lorong (10.97 m).","Singles uses the inner sidelines (8.23 m). Doubles adds the alleys (10.97 m)."], cam:[[0,26,12],[0,0,0]], dur:4,
   set:function(S){ return {s:S.u.zone(-WS/2,-HL,WS/2,HL,"#CBFA1E",0.25), d:S.u.zone(-W/2,-HL,W/2,HL,"#ff9f43",0.22), ls:S.st.label("SINGLES",0,1.5,0), ld:S.st.label("DOUBLES",0,1.5,0,1,"#ff9f43")}; },
   at:function(S, s, p){ var a=p<0.5; S.u.show(s.s,a); S.u.show(s.ls,a); S.u.show(s.d,!a); S.u.show(s.ld,!a); }},
  {t:["Servis menyerong, 2 cubaan","Serve diagonally, 2 tries"], x:["Servis dari belakang garisan dasar ke petak servis menyerong. Jika gagal dua kali, itu double fault dan lawan dapat mata.","Serve from behind the baseline into the diagonal service box. Miss twice and it is a double fault: a point to the receiver."], cam:[[7,4,-16],[0,1,-2]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); racket(S,a); S.place(a,1,-HL-0.3,0); return {a:a, b:tb(S), z:S.u.zone(-WS/2,0,0,SV,"#CBFA1E",0.3)}; },
   at:function(S, s, p){ S.pose(s.a,"serve",S.seg(p,0,0.3)); S.u.arc(s.b,[1.2,2.8,-HL],[-2,0.05,4.5],0.6,S.seg(p,0.28,0.75)); }},
  {t:["Let","Let"], x:["Jika servis menyentuh jaring dan masih masuk petak servis, ia 'let': servis itu diulang.","If a serve touches the net and still lands in the service box, it is a 'let': that serve is played again."], cam:[[6,2.5,-4],[0,0.8,0]], dur:3,
   set:function(S){ return {b:tb(S), lb:S.st.label("LET",0,2,0,1)}; }, at:function(S, s, p){ var q=S.seg(p,0,0.5); if(p<0.5) S.u.arc(s.b,[1,2.4,-8],[0,NET+0.03,0],0.3,q); else S.u.arc(s.b,[0,NET+0.03,0],[-1.5,0.05,3],0.4,S.seg(p,0.5,0.8)); S.u.show(s.lb,p>0.55); }},
  {t:["Foot fault","Foot fault"], x:["Semasa servis, kaki tidak boleh memijak garisan dasar atau masuk ke gelanggang sebelum bola dipukul.","While serving, a foot must not touch the baseline or step into the court before the ball is struck."], cam:[[3,1.2,-HL-2.5],[0.5,0.2,-HL]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); racket(S,a); return {a:a, lb:S.st.label("FOOT FAULT",0.5,1.8,-HL,0.7,"#ff6b6b")}; },
   at:function(S, s, p){ S.place(s.a,0.6,-HL-0.4+S.seg(p,0.2,0.5)*0.55,0); S.pose(s.a,"serve",S.seg(p,0.3,0.7)); S.u.show(s.lb,p>0.55); }},
  {t:["Mata: 15, 30, 40","Points: 15, 30, 40"], x:["Mata dikira 0 (love), 15, 30, 40, kemudian game. Pada 40-40 (deuce) perlu menang 2 mata berturut: advantage, kemudian game.","Points go 0 (love), 15, 30, 40, then game. At 40-40 (deuce) you need two points in a row: advantage, then game."], cam:[[0,4,-16],[0,1.5,0]], dur:6,
   set:function(S){ return {lb:S.st.label("0 - 0",0,2.6,0,1.2)}; },
   at:function(S, s, p){ var seq=["15 - 0","30 - 0","30 - 15","40 - 30","40 - 40 (deuce)","AD","GAME ✓"], i=Math.min(6,Math.floor(p*7)); if(s.k!==i){ s.k=i; s.lb.parent.remove(s.lb); s.lb=S.st.label(seq[i],0,2.6,0,1.1); } }},
  {t:["Game & set","Games and sets"], x:["Set dimenangi oleh yang pertama 6 game dengan beza 2 (contoh 6-4, 7-5). Perlawanan biasanya 3 set terbaik, atau 5 set dalam sesetengah kejohanan.","A set goes to the first to 6 games with a 2-game lead (for example 6-4, 7-5). Matches are usually best of 3 sets, or 5 in some events."], cam:[[0,4,-16],[0,1.5,0]], dur:4,
   set:function(S){ return {a:S.st.label("6-4",-2.5,2.4,0), b:S.st.label("3-6",0,2.4,0), c:S.st.label("7-5 ✓",2.7,2.4,0)}; }, at:function(S, s, p){ S.u.show(s.b,p>0.33); S.u.show(s.c,p>0.66); }},
  {t:["Tiebreak","Tiebreak"], x:["Pada 6-6, tiebreak: yang pertama 7 mata dengan beza 2 memenangi set (7-6).","At 6-6, a tiebreak: the first to 7 points with a 2-point lead wins the set (7-6)."], cam:[[0,4,-16],[0,1.5,0]], dur:4,
   set:function(S){ return {lb:S.st.label("6 - 6",0,2.6,0,1.2)}; },
   at:function(S, s, p){ var seq=["6 - 6","TB 5 - 5","TB 6 - 6","TB 8 - 6 ✓","7 - 6"], i=Math.min(4,Math.floor(p*5)); if(s.k!==i){ s.k=i; s.lb.parent.remove(s.lb); s.lb=S.st.label(seq[i],0,2.6,0,1.1); } }},
  {t:["Atas garisan = masuk","On the line is in"], x:["Bola yang menyentuh mana-mana bahagian garisan dikira masuk.","A ball touching any part of the line is in."], cam:[[WS/2+3,2,6],[WS/2,0,3]], dur:3,
   set:function(S){ return {b:tb(S), lb:S.st.label("IN",WS/2,0.9,3,0.7)}; }, at:function(S, s, p){ S.u.arc(s.b,[0,1.2,-3],[WS/2,0.04,3],0.8,S.seg(p,0,0.6)); S.u.show(s.lb,p>0.6); }},
  {t:["Satu lantunan, volley dibenarkan","One bounce, volleys allowed"], x:["Bola mesti dipukul sebelum lantunan kedua. Boleh juga dipukul sebelum ia melantun (volley), kecuali servis.","Hit the ball before its second bounce. You may also hit it before it bounces (a volley), except on the serve."], cam:[[9,3,0],[0,1,2]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); racket(S,a); S.place(a,0,2.5,Math.PI); return {a:a, b:tb(S), lb:S.st.label("VOLLEY",0,2.8,2.5,0.7)}; },
   at:function(S, s, p){ S.u.arc(s.b,[0,1,HL-1],[0.3,1.2,2.8],1.2,S.seg(p,0,0.5)); S.pose(s.a,"swing",S.seg(p,0.4,0.6)); if(p>0.5) S.u.arc(s.b,[0.3,1.2,2.8],[-2,0.05,HL-3],1.5,S.seg(p,0.5,0.9)); S.u.show(s.lb,p>0.45&&p<0.8); }},
  {t:["Tukar gelanggang","Changing ends"], x:["Pemain bertukar gelanggang selepas game pertama dan setiap dua game selepas itu (game ganjil). Sesetengah kejohanan membenarkan cabaran semakan video.","Players change ends after the first game and every two games after that (odd games). Some events allow video review challenges."], cam:[[16,10,0],[0,0,0]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)), b=S.st.body(S.H,S.team(1)); return {a:a,b:b}; }, at:function(S, s, p){ var q=S.seg(p,0.2,0.8); S.u.mv(s.a,-W/2-1.5,-6,-W/2-1.5,6,q); S.u.mv(s.b,W/2+1.5,6,W/2+1.5,-6,q); }}],
 quiz:[
  {q:["Selepas 30, mata seterusnya ialah…","After 30, the next point is…"], a:[["35","35"],["40","40"],["45","45"]], ok:1, why:["15, 30, 40, kemudian game.","15, 30, 40, then game."]},
  {q:["Pada 40-40 dipanggil…","40-40 is called…"], a:[["Deuce","Deuce"],["Let","Let"],["Love","Love"]], ok:0, why:["Deuce: perlu menang 2 mata berturut.","Deuce: you need two points in a row."]},
  {q:["Servis menyentuh jaring dan masuk petak. Apa jadi?","A serve touches the net and lands in the box. What happens?"], a:[["Mata untuk server","Point to the server"],["Let: servis semula","Let: serve again"],["Fault","Fault"]], ok:1, why:["Itu let.","That is a let."]},
  {q:["Set dimenangi pada…","A set is won at…"], a:[["6 game, beza 2","6 games, 2 ahead"],["5 game","5 games"],["10 game","10 games"]], ok:0, why:["6 game dengan beza 2, atau tiebreak pada 6-6.","6 games with a 2-game lead, or a tiebreak at 6-6."]},
  {q:["Bola menyentuh garisan. Masuk atau keluar?","The ball touches the line. In or out?"], a:[["Masuk","In"],["Keluar","Out"]], ok:0, why:["Atas garisan = masuk.","On the line is in."]}],
 game:SportView.rally({ name:["Rali tenis","Tennis rally"], help:["Ketik bila bola masuk bulatan hijau untuk memukul balik. Leret kiri atau kanan untuk menghala ke tepi (lebih susah untuk komputer). Yang pertama 7 mata.","Tap when the ball enters the green ring to hit it back. Swipe left or right to aim wide (harder for the computer). First to 7 points."],
   icon:"🎾", cam:[0,4.2,-HL-6], at:[0,1,2], me:[0.6,-HL+0.5], op:[0,HL-1], win:7, ball:tb, gear:racket,
   inPath:function(G){ var x=(Math.random()-0.5)*4, sp=Math.max(0.9,1.5-G.rally*0.06); return {pts:[[0,1,HL-1],[x*0.7,0.05,-HL+5],[x,1.0,-HL+0.8]], hs:[1.3,0.6], d:sp}; },
   outPath:function(G, aim){ var x=aim*3.2+(Math.random()-0.5)*1.5; return {pts:[[G.b.position.x,G.b.position.y,G.b.position.z],[x,0.05,HL-5],[x*1.1,1,HL-1]], hs:[1.4,0.6], d:1.1}; },
   ai:function(G, aim){ return 0.12+0.04*G.rally+(aim?0.12:0); } }) };
})();
