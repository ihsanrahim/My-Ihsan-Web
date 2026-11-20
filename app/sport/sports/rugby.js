/* My Ihsan Sports: Rugby union. Field of play 100 m between the try lines × 70 m; in-goal 10 m (6–22 m allowed); 22 m and 10 m lines;
   posts 5.6 m apart with the crossbar 3 m high; ball ≈ 28–30 cm long. World Rugby Laws, rules as of 2026 (⚠ check the current edition). */
(function(){
"use strict";
var PI=Math.PI, HL=50, W=70, IG=10, PW=5.6, CB=3, PH=14;
function rball(S){ var T=S.T, m=new T.Mesh(new T.SphereGeometry(0.1, 14, 10), new T.MeshLambertMaterial({color:0xf3eee2})); m.scale.set(1, 1, 1.45); var s=new T.Mesh(new T.TorusGeometry(0.1, 0.006, 4, 20), new T.MeshLambertMaterial({color:0x2a6fb0})); s.rotation.y=PI/2; m.add(s); S.st.add(m); return m; }
function pl(S, i, x, z, ry){ var b=S.st.body(S.H, S.team(i)); S.place(b, x, z, ry||0); return b; }
function posts(K, z){ K.post(-PW/2, z, PH, 0.08, "#ffffff"); K.post(PW/2, z, PH, 0.08, "#ffffff"); K.bar(-PW/2, CB, z, PW/2, CB, z, 0.07, "#ffffff");
  K.box(-PW/2-0.25, z-0.25, -PW/2+0.25, z+0.25); }
function dash(K, z){ for(var x=-W/2+2; x<W/2-2; x+=4) K.line(x, z, x+2, z); }
SPORTS.rugby={ id:"rugby", v:"2026", H:1.85, cam:[38,30,52], ground:"#3d7a43",
 field:function(K){ K.rect(W, 2*HL, "#3f8a48", 0); K.rect(W, IG, "#367a40", 0.001, 0, -HL-IG/2); K.rect(W, IG, "#367a40", 0.001, 0, HL+IG/2); K.lineW=0.1;
   K.box(-W/2, -HL-IG, W/2, HL+IG); K.line(-W/2, 0, W/2, 0); [-1,1].forEach(function(s){ K.line(-W/2, s*HL, W/2, s*HL); K.line(-W/2, s*(HL-22), W/2, s*(HL-22)); dash(K, s*10); dash(K, s*(HL-5));
     K.line(-W/2+5, -HL+2, -W/2+5, HL-2, 0.06); K.line(W/2-5, -HL+2, W/2-5, HL-2, 0.06); K.line(-W/2+15, -HL+2, -W/2+15, HL-2, 0.05); K.line(W/2-15, -HL+2, W/2-15, HL-2, 0.05); posts(K, s*HL); });
   return {w:W, l:2*(HL+IG)}; },
 facts:[[["Padang permainan","Field of play"],"100 × 70 m"],[["Kawasan in-goal","In-goal"],"6–22 m (biasa 10 m)"],[["Tiang gol","Goal posts"],"5.6 m"],[["Palang","Crossbar"],"3 m"],[["Bola","Ball"],"28–30 cm, 410–460 g"],[["Masa","Time"],"2 × 40 min"],[["Pemain","Players"],"15 (7 dalam ragbi 7)"]],
 zones:[
  {n:["Kawasan in-goal","In-goal area"], d:["Bola mesti diletakkan (grounded) di sini untuk mendapat 'try', 5 mata.","The ball must be grounded here to score a try, 5 points."], p:[[-W/2,-HL-IG],[W/2,-HL-IG],[W/2,-HL],[-W/2,-HL]]},
  {n:["Kawasan 22 m","22 m area"], d:["Jika pertahanan menangkap bola tendangan di sini dan menjerit 'mark', mereka dapat tendangan percuma.","A defender who catches a kicked ball here and calls 'mark' gets a free kick."], p:[[-W/2,-HL],[W/2,-HL],[W/2,-HL+22],[-W/2,-HL+22]]},
  {n:["Garisan tengah & 10 m","Halfway and 10 m lines"], d:["Sepak mula dari tengah mesti melepasi garisan 10 m pihak lawan.","The kick-off from halfway must travel past the opponents' 10 m line."], p:[[-W/2,-10],[W/2,-10],[W/2,10],[-W/2,10]]},
  {n:["Koridor 5 m & 15 m","5 m and 15 m channel"], d:["Dalam lineout, pemain berbaris antara garisan 5 m dan 15 m dari garisan tepi.","In a lineout, players line up between 5 m and 15 m from the touchline."], p:[[W/2-15,-HL],[W/2-5,-HL],[W/2-5,HL],[W/2-15,HL]]}],
 cards:[
  {t:["15 pemain, 2 × 40 minit","15 a side, 2 × 40 minutes"], x:["Setiap pasukan ada 15 pemain: 8 forward (pek) dan 7 back. Perlawanan 2 separuh masa × 40 minit. Ragbi 7 pula 7 pemain, 2 × 7 minit.","Each team has 15: 8 forwards (the pack) and 7 backs. A match is 2 halves of 40 minutes. Rugby sevens has 7 players, 2 × 7 minutes."], cam:[[0,70,45],[0,0,0]], dur:4,
   set:function(S){ for(var i=0;i<15;i++){ var x=i<8?(i%4-1.5)*3:(i-11)*7, z=i<8?-6-Math.floor(i/4)*3:-16-Math.abs(i-11)*2; pl(S,0,x,z,0); pl(S,1,-x,-z,PI); } return {}; }, at:function(){}},
  {t:["Hantar ke belakang","Pass backwards"], x:["Bola hanya boleh dihantar (dibaling) ke sisi atau ke belakang, bukan ke hadapan. Pasukan mara dengan berlari atau menendang.","The ball may only be passed sideways or backwards, never forwards. A team gains ground by running or kicking."], cam:[[-8,9,12],[3,0,-2]], dur:4,
   set:function(S){ var a=pl(S,0,0,0,0), b=pl(S,0,5,-3,0), c=pl(S,0,10,-6,0); return {P:[a,b,c], ba:rball(S), ar:S.st.label("⬅ OK",6,2.5,-1,0.6,"#7CFC9A")}; },
   at:function(S, s, p){ var adv=p*6; s.P.forEach(function(b,i){ b.position.z=-i*3+adv; S.pose(b,"run",(p*4+i*0.3)%1); }); var k=p<0.45?0:1, q=S.seg(p,k?0.55:0.1,k?0.85:0.4);
     var A=s.P[k], B=s.P[k+1]; S.u.arc(s.ba,[A.position.x+0.3,1.1,A.position.z],[B.position.x-0.3,1.1,B.position.z],0.6,q); }},
  {t:["Knock-on","Knock-on"], x:["Jika pemain menjatuhkan atau memukul bola ke hadapan, itu knock-on. Pihak lawan mendapat scrum.","If a player drops or knocks the ball forwards, it is a knock-on. The other team gets a scrum."], cam:[[5,3,5],[0,0.8,-1]], dur:3,
   set:function(S){ var a=pl(S,0,0,0,0); return {a:a, ba:rball(S), x:S.st.label("KNOCK-ON",0,2.6,-1.5,0.7,"#ff6b6b")}; },
   at:function(S, s, p){ S.pose(s.a,"run",(p*3)%1); if(p<0.3) s.ba.position.set(0.3,1.15,0.3); else S.u.arc(s.ba,[0.3,1.15,0.3],[0.4,0.1,-2.4],0.4,S.seg(p,0.3,0.6)); S.u.show(s.x,p>0.6); }},
  {t:["Try = 5 mata","Try = 5 points"], x:["Letakkan bola ke tanah di kawasan in-goal lawan (atau di garisan gol) dengan tangan atau badan. Mata: try 5.","Ground the ball in the opponents' in-goal (or on the goal line) with hands or body. A try scores 5."], cam:[[10,5,-HL+12],[0,0,-HL-2]], dur:4,
   set:function(S){ var a=pl(S,0,4,-HL+14,PI), d=pl(S,1,10,-HL+4,-PI/2); return {a:a, d:d, ba:rball(S), l:S.st.label("TRY +5",4,3,-HL-4,0.9,"#7CFC9A")}; },
   at:function(S, s, p){ S.u.mv(s.a,4,-HL+14,3,-HL-3,S.seg(p,0,0.65),"sprint"); S.u.mv(s.d,10,-HL+4,6,-HL-1,S.seg(p,0.1,0.65),"sprint"); var g=S.seg(p,0.65,0.8); if(g>0){ S.pose(s.a,"dive",g); s.a.rotation.y=PI; }
     s.ba.position.set(s.a.position.x+0.25,Math.max(0.12,1.1-g*1),s.a.position.z-0.3-g*0.6); S.u.show(s.l,p>0.8); }},
  {t:["Tendangan: 2 dan 3 mata","Kicks: 2 and 3 points"], x:["Selepas try, tendangan konversi (2 mata) diambil pada garisan selari dengan tempat try. Tendangan penalti dan drop goal masing-masing 3 mata. Bola mesti melepasi atas palang di antara tiang.","After a try, the conversion (2 points) is taken on a line level with where the try was scored. A penalty goal or a drop goal is 3 points each. The ball must go over the crossbar between the posts."], cam:[[-6,3,-HL+30],[0,4,-HL]], dur:4,
   set:function(S){ var k=pl(S,0,6,-HL+22,PI); return {k:k, ba:rball(S), l:S.st.label("+2",0,8,-HL,1,"#7CFC9A")}; },
   at:function(S, s, p){ S.pose(s.k,"kick",S.seg(p,0.05,0.35)); S.u.arc(s.ba,[6,0.15,-HL+21.4],[0.4,5.5,-HL-2],7,S.seg(p,0.25,0.75)); S.u.show(s.l,p>0.75); }},
  {t:["Tackle: lepaskan!","The tackle: release!"], x:["Hanya pembawa bola boleh ditackle, di bawah paras bahu. Selepas tackle, penackle mesti melepaskan, dan pemain yang ditackle mesti melepaskan bola dengan segera.","Only the ball carrier may be tackled, below the shoulders. After a tackle, the tackler must let go and the tackled player must release the ball at once."], cam:[[5,3,5],[0,0.6,0]], dur:4,
   set:function(S){ var a=pl(S,0,0,4,PI), d=pl(S,1,0,-3,0); return {a:a, d:d, ba:rball(S)}; },
   at:function(S, s, p){ var q=S.seg(p,0,0.4); s.a.position.z=4-q*4; s.d.position.z=-3+q*2.4; S.pose(s.a,"run",(p*4)%1); S.pose(s.d,"run",(p*4)%1);
     var f=S.seg(p,0.4,0.6); if(f>0){ s.a.rotation.x=-f*1.3; s.a.position.y=0.1; s.d.rotation.x=f*1.1; S.pose(s.d,"dive",f); }
     var r=S.seg(p,0.65,0.9); s.d.position.z=-0.6-r*1.4; s.ba.position.set(0.2,Math.max(0.1,1-f*0.9),0.2-f*0.5+r*0.6); }},
  {t:["Ruck dan maul","Ruck and maul"], x:["Ruck: bola di tanah, pemain bertolak bahu di atasnya; bola hanya diambil dengan kaki. Maul: bola di tangan pembawa yang dipegang oleh rakan dan lawan.","Ruck: the ball is on the ground and players bind and push over it; it may only be played with the feet. Maul: the ball is in the carrier's hands, held by team-mates and opponents."], cam:[[6,4,6],[0,0.8,0]], dur:5,
   set:function(S){ var A=[], B=[]; for(var i=0;i<3;i++){ A.push(pl(S,0,(i-1)*0.6,1.1,PI)); B.push(pl(S,1,(i-1)*0.6,-1.1,0)); } return {A:A, B:B, ba:rball(S), l:S.st.label("RUCK",0,2.8,0,0.7), m:S.st.label("MAUL",0,2.8,0,0.7)}; },
   at:function(S, s, p){ var ruck=p<0.5, push=Math.sin(p*PI*6)*0.15; s.A.concat(s.B).forEach(function(b,i){ S.pose(b,"ready",0); b.rotation.x=(i<3?-1:1)*-0.5; b.position.z=(i<3?1:-1)*0.75+push; });
     s.ba.position.set(0,ruck?0.11:1.1,ruck?0.3:0.5+push); S.u.show(s.l,ruck); S.u.show(s.m,!ruck); }},
  {t:["Scrum","The scrum"], x:["Untuk mula semula selepas knock-on atau hantaran ke hadapan. 8 forward setiap pasukan mengikat dan menolak; scrum-half memasukkan bola di tengah, dan hooker mengait bola ke belakang.","Used to restart after a knock-on or forward pass. The 8 forwards of each side bind and push; the scrum-half feeds the ball down the middle and the hooker hooks it back."], cam:[[7,4,3],[0,0.6,0]], dur:5,
   set:function(S){ var A=[], B=[], row=[[0,0.7],[-0.6,0.7],[0.6,0.7],[-0.35,1.6],[0.35,1.6],[-1,1.7],[1,1.7],[0,2.5]]; row.forEach(function(r){ A.push(pl(S,0,r[0],r[1],PI)); B.push(pl(S,1,r[0],-r[1],0)); });
     var sh=pl(S,0,1.4,0,-PI/2); return {A:A, B:B, sh:sh, ba:rball(S)}; },
   at:function(S, s, p){ var push=Math.sin(p*PI*2)*0.2; s.A.forEach(function(b){ S.pose(b,"ready",0); b.rotation.x=0.6; b.position.y=-0.05; }); s.B.forEach(function(b){ S.pose(b,"ready",0); b.rotation.x=-0.6; b.position.y=-0.05; });
     s.A.forEach(function(b,i){ b.position.z=[0.7,0.7,0.7,1.6,1.6,1.7,1.7,2.5][i]+push; }); s.B.forEach(function(b,i){ b.position.z=-[0.7,0.7,0.7,1.6,1.6,1.7,1.7,2.5][i]+push; });
     var f=S.seg(p,0.15,0.4), h=S.seg(p,0.45,0.9); s.ba.position.set(1.3-f*1.3,0.11,h*2.6); }},
  {t:["Lineout","The lineout"], x:["Bila bola keluar di tepi, lineout diberi. Pemain beratur dalam dua barisan 1 m terpisah; hooker membaling bola lurus ke tengah dan rakan diangkat untuk menangkap.","When the ball goes into touch, a lineout restarts play. Players form two lines 1 m apart; the hooker throws straight down the middle and a team-mate is lifted to catch."], cam:[[W/2-14,6,10],[W/2-8,2,0]], dur:5,
   set:function(S){ var A=[], B=[]; for(var i=0;i<7;i++){ A.push(pl(S,0,W/2-6-i*1.2,0.5,-PI/2)); B.push(pl(S,1,W/2-6-i*1.2,-0.5,PI/2)); } A.forEach(function(b){ b.rotation.y=PI; }); B.forEach(function(b){ b.rotation.y=0; });
     var h=pl(S,0,W/2+0.6,0,-PI/2); return {A:A, B:B, h:h, ba:rball(S)}; },
   at:function(S, s, p){ S.pose(s.h,"serve",S.seg(p,0,0.3)); var lift=S.seg(p,0.25,0.55); s.A[3].position.y=lift*1.8; S.pose(s.A[3],"jump",lift);
     S.u.arc(s.ba,[W/2+0.3,2,0],[s.A[3].position.x,2.9,0],1.2,S.seg(p,0.25,0.6)); }},
  {t:["Offside & kad kuning (10 minit)","Offside and the yellow card (10 min)"], x:["Pemain di hadapan bola (atau di hadapan kaki terakhir ruck) adalah offside dan tidak boleh bermain. Kesalahan berulang atau berbahaya: kad kuning = 10 minit di sin bin ⚠. Kad merah: dibuang.","A player in front of the ball (or the hindmost foot of a ruck) is offside and may not play. Repeated or dangerous fouls: a yellow card = 10 minutes in the sin bin ⚠. A red card: sent off."], cam:[[0,1.8,4.4],[0,1.4,0]], dur:4,
   set:function(S){ var r=S.st.body(1.8,{top:"#2bb3c0",pants:"#111"}); S.place(r,0,0,0); return {r:r, c:S.u.card(r,"#f2c94c"), l:S.st.label("10:00",0.9,2.4,0,0.6,"#f2c94c")}; },
   at:function(S, s, p){ S.pose(s.r,"card",S.seg(p,0,0.3)); S.u.show(s.l,p>0.3); }}],
 quiz:[
  {q:["Ke arah mana bola boleh dihantar?","Which way may the ball be passed?"], a:[["Ke sisi atau ke belakang","Sideways or backwards"],["Ke hadapan sahaja","Forwards only"],["Mana-mana arah","Any direction"]], ok:0, why:["Hantaran ke hadapan adalah kesalahan.","A forward pass is an offence."]},
  {q:["Berapa mata untuk satu try?","How many points is a try?"], a:[["3","3"],["5","5"],["7","7"]], ok:1, why:["Try = 5, konversi = 2.","Try = 5, conversion = 2."]},
  {q:["Konversi bernilai…","A conversion is worth…"], a:[["2 mata","2 points"],["3 mata","3 points"],["1 mata","1 point"]], ok:0, why:["2 mata.","2 points."]},
  {q:["Selepas knock-on, permainan bermula semula dengan…","After a knock-on, play restarts with…"], a:[["Lineout","A lineout"],["Scrum","A scrum"],["Sepak mula","A kick-off"]], ok:1, why:["Scrum kepada pihak lawan.","A scrum to the other team."]},
  {q:["Kad kuning dalam ragbi bermaksud…","A yellow card in rugby means…"], a:[["10 minit di sin bin","10 minutes in the sin bin"],["Dibuang terus","Sent off for good"],["Amaran sahaja","Just a warning"]], ok:0, why:["10 minit di sin bin.","10 minutes in the sin bin."]}],
 game:{ name:["Tendangan konversi","Conversion kick"], help:["Try sudah dijaringkan! 1) Penanda bergerak ke belakang dan ke depan: ketik untuk memilih jarak tendangan (lebih jauh = sudut lebih baik tetapi lebih susah). 2) Leret ke atas untuk menendang: leret kiri/kanan untuk arah, leret panjang = kuat. Ambil kira angin. 5 tendangan, 2 mata setiap satu.","A try has been scored! 1) A marker slides back and forth: tap to choose how far back to kick from (further = better angle but harder). 2) Swipe up to kick: swipe left/right to aim, a longer swipe = more power. Mind the wind. 5 kicks, 2 points each."], unit:["mata","pts"],
  cam:[8,4,-HL+30], at:[0,3,-HL],
  start:function(G){ var S=G.S, T=S.T; G.k=S.st.body(S.H,S.team(0)); G.b=rball(S); G.mk=new T.Mesh(new T.TorusGeometry(0.5,0.06,6,24), new T.MeshBasicMaterial({color:0xCBFA1E})); G.mk.rotation.x=PI/2; S.st.add(G.mk);
   G.n=0; G.pts=0; G.next(); },
  step:function(G, dt){ var S=G.S, f=G.f; if(!f) return; f.t+=dt;
   if(f.k==="dist"){ var u=(Math.sin(f.t*1.6-PI/2)+1)/2; f.z=-HL+6+u*30; G.mk.position.set(f.x,0.04,f.z); S.place(G.k,f.x+0.6,f.z+2,PI); G.b.position.set(f.x,0.15,f.z); }
   else if(f.k==="aim"){ if(f.t>6) G.game.swipe(G,0,-0.25); }
   else if(f.k==="fly"){ var q=Math.min(1,f.t/f.d); S.pose(G.k,"kick",Math.min(1,f.t*3)); G.b.position.set(S.lerp(f.x,f.ex,q),Math.max(0.12,0.15+(f.ey-0.15)*q+Math.sin(q*PI)*f.hh),S.lerp(f.z,f.ez,q)); G.b.rotation.x+=dt*12; if(q>=1){ G.f=null; G.res(f); } } },
  tap:function(G){ var f=G.f; if(!f) return; if(f.k==="dist"){ f.k="aim"; f.t=0; G.mk.visible=false; G.S.vib(15); G.S.st.setCam([f.x+0.5,2.4,f.z+7],[0,3.5,-HL]); G.hu(G.S.L2("Leret ke atas untuk menendang","Swipe up to kick")); } },
  swipe:function(G, dx, dy){ var f=G.f; if(!f) return; if(f.k==="dist") return G.game.tap(G); if(f.k!=="aim"||dy>-0.05) return;
   var S=G.S, dist=Math.hypot(f.x, f.z+HL), base=Math.atan(-f.x/(f.z+HL)), ang=base+dx*0.55, pow=Math.min(1.25,-dy*2.1), R=22+pow*42, flight=Math.max(0.9,dist/26), drift=G.wind*flight*0.55;
   var ex=f.x+Math.tan(ang)*(f.z+HL)+drift, short=dist>R, ey=short?0.12:Math.max(0.5, 3+(R-dist)*0.35);
   var ez=short?f.z-R*0.95:-HL-4, endx=short?f.x+(ex-f.x)*(R*0.95/dist):ex+(ex-f.x)*4/Math.max(1,dist);
   G.f={k:"fly", t:0, d:flight, x:f.x, z:f.z, ex:endx, ez:ez, ey:short?0.12:ey+1.5, hh:short?R*0.18:Math.min(9,R*0.12), gx:ex, gy:ey, short:short}; S.vib(25); } }};
var gm=SPORTS.rugby.game, st0=gm.start, sp0=gm.step; gm.step=function(G, dt, t){ if(!G.h0){ G.h0=1; G.hu(); } sp0(G, dt, t); };
gm.start=function(G){ var S=G.S; G.game=gm;
  G.hu=function(msg){ S.hud('🏉 '+S.L2("Tendangan ","Kick ")+Math.min(5,G.n+1)+'/5 · '+G.pts+' '+S.L2("mata","pts")+' · 💨 '+(G.wind>0?'→ ':'← ')+Math.abs(G.wind).toFixed(1)+' m/s'+(msg?'  ·  '+msg:'')); };
  G.next=function(){ if(G.n>=5) return G.end(G.pts, G.pts+" / 10 "+S.L2("mata","pts")); G.wind=Math.round((Math.random()*2-1)*(1+G.n)*10)/10; var x=Math.round((Math.random()*2-1)*(8+G.n*5));
    G.mk.visible=true; G.f={k:"dist", t:0, x:x, z:-HL+6}; S.pose(G.k,"idle",0); S.st.setCam([x*0.6+8,9,-HL+46],[x*0.5,0,-HL+16]); G.hu(S.L2("Try di x = ","Try at x = ")+x+" m · "+S.L2("ketik untuk jarak","tap to set distance")); };
  G.res=function(f){ G.n++; var ok=!f.short && Math.abs(f.gx)<PW/2-0.12 && f.gy>CB; if(ok){ G.pts+=2; S.vib(40); }
    G.hu(ok?S.L2("MASUK! +2","GOOD! +2"):f.short?S.L2("Tidak sampai","Fell short"):f.gy<=CB?S.L2("Bawah palang","Under the bar"):S.L2("Tersasar","Wide")); setTimeout(function(){ if(!G.over) G.next(); },1300); };
  st0(G); };
})();
