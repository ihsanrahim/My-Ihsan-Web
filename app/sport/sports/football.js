/* My Ihsan Sports: Football (soccer). Pitch 105 x 68 m (FIFA recommended), x = across (width), z = along (length). Rules as of 2026 (IFAB Laws of the Game). */
(function(){
"use strict";
var W=68, L=105, HL=L/2, PA=16.5, PAW=40.32, GA=5.5, GAW=18.32, GW=7.32, GH=2.44, BALL=0.22;
function teamPos(side){ // 4-4-2, side 1 attacks +z
  var f=[[0,-50],[-24,-35],[-9,-37],[9,-37],[24,-35],[-25,-18],[-9,-20],[9,-20],[25,-18],[-7,-4],[7,-4]];
  return f.map(function(p){ return [p[0]*side, p[1]*side]; }); }
SPORTS.football={ id:"football", v:"2026", H:1.81, cam:[0,48,72], top:[0,95,0.1], sky:"#a9d8f2", ground:"#4f8a4c",
 field:function(K){ K.stripes(W+6, L+6, 14, "#4f9a4f", "#5aa65a");
   K.box(-W/2, -HL, W/2, HL, 0.12); K.line(-W/2, 0, W/2, 0, 0.12); K.arc(0, 0, 9.15, 0, Math.PI*2, 0.12); K.dot(0, 0, 0.2);
   [-1,1].forEach(function(s){ var z=s*HL;
     K.box(-PAW/2, z, PAW/2, z-s*PA, 0.12); K.box(-GAW/2, z, GAW/2, z-s*GA, 0.12); K.dot(0, z-s*11, 0.2);
     var pa=Math.asin(5.5/9.15); K.arc(0, z-s*11, 9.15, s>0?pa:Math.PI+pa, s>0?Math.PI-pa:2*Math.PI-pa, 0.12);
     K.goal(z, GW, GH, 2, s); [-1,1].forEach(function(x){ K.arc(x*W/2, z, 1, 0, Math.PI*2, 0.12); K.post(x*W/2, z, 1.5, 0.03, "#f2c94c"); }); });
   return {w:W, l:L}; },
 facts:[[["Padang","Pitch"],"105 × 68 m"],[["Kotak penalti","Penalty area"],"16.5 × 40.32 m"],[["Kotak gol","Goal area"],"5.5 × 18.32 m"],[["Titik penalti","Penalty spot"],"11 m"],[["Bulatan tengah","Centre circle"],"r 9.15 m"],[["Gol","Goal"],"7.32 × 2.44 m"],[["Bola (saiz 5)","Ball (size 5)"],"Ø 22 cm"]],
 zones:[
  {n:["Kotak penalti","Penalty area"], d:["Kesalahan sepakan percuma langsung oleh pertahanan di sini = sepakan penalti. Penjaga gol boleh memegang bola di sini.","A direct-free-kick foul by the defenders here gives a penalty kick. The goalkeeper may handle the ball here."], p:[[-PAW/2,HL],[PAW/2,HL],[PAW/2,HL-PA],[-PAW/2,HL-PA]]},
  {n:["Kotak gol","Goal area"], d:["Sepakan gol diambil dari mana-mana dalam kotak ini.","Goal kicks are taken from anywhere in this box."], p:[[-GAW/2,-HL],[GAW/2,-HL],[GAW/2,-HL+GA],[-GAW/2,-HL+GA]]},
  {n:["Bulatan tengah","Centre circle"], d:["Semasa sepak mula, pihak lawan mesti berada di luar bulatan ini (9.15 m).","At kick-off the opponents must stay outside this circle (9.15 m)."], p:(function(){ var a=[]; for(var i=0;i<24;i++){ var t=i/24*Math.PI*2; a.push([Math.cos(t)*9.15, Math.sin(t)*9.15]); } return a; })()},
  {n:["Separuh sendiri","Own half"], d:["Pemain tidak boleh ofsaid di separuh padangnya sendiri.","A player cannot be offside in their own half."], p:[[-W/2,-HL],[W/2,-HL],[W/2,0],[-W/2,0]]},
  {n:["Garisan tepi","Touchline"], d:["Bola yang keluar sepenuhnya di sini = balingan ke dalam.","The whole ball out over this line gives a throw-in."], p:[[W/2-1,-HL],[W/2+1,-HL],[W/2+1,HL],[W/2-1,HL]]}],
 cards:[
  {t:["11 pemain, 2 × 45 minit","11 players, 2 × 45 minutes"], x:["Setiap pasukan ada 11 pemain termasuk penjaga gol. Perlawanan 2 separuh masa 45 minit, ditambah masa kecederaan.","Each team has 11 players including a goalkeeper. A match is 2 halves of 45 minutes, plus added time."], cam:[[0,32,46],[0,0,0]], dur:6,
   set:function(S){ var P=[]; [1,-1].forEach(function(sd,ti){ teamPos(sd).forEach(function(p,i){ var b=S.st.body(S.H, Object.assign({num:i+1}, S.team(ti), i===0?{top:ti?"#2f3e46":"#f2c94c"}:{})); S.place(b, p[0], p[1], sd>0?0:Math.PI); P.push(b); }); }); return {P:P}; },
   at:function(S, s, p){ s.P.forEach(function(b,i){ S.pose(b, "idle", (p*3+i*0.07)%1); }); }},
  {t:["Sepak mula & mula semula","Kick-off and restarts"], x:["Permainan bermula dengan sepak mula di tengah. Bila bola keluar: balingan ke dalam (tepi), sepakan gol atau sepakan sudut (garisan gol).","Play starts with a kick-off in the centre. When the ball goes out: throw-in (side), goal kick or corner kick (goal line)."], cam:[[W/2+14,10,8],[W/2-6,1,0]], dur:3,
   set:function(S){ var a=S.st.body(S.H, S.team(0)), c=S.st.body(S.H, S.team(0)), b=S.st.ball(BALL,"#fff",{seams:"#222"}); S.place(a, W/2+0.6, 0, -Math.PI/2); S.place(c, W/2-14, 4, Math.PI/2); return {a:a, b:b, c:c}; },
   at:function(S, s, p){ var J=s.a.userData.J; var th=p<0.4?S.ease(p/0.4):1; J.shL.rotation.set(-Math.PI+0.3*(1-th)-0.9*S.seg(p,0.4,0.55),0,0); J.shR.rotation.set(-Math.PI+0.3*(1-th)-0.9*S.seg(p,0.4,0.55),0,0); J.elL.rotation.x=-1.2*(1-S.seg(p,0.4,0.55)); J.elR.rotation.x=-1.2*(1-S.seg(p,0.4,0.55));
     if(p<0.5) s.b.position.set(W/2+0.6, 2.25, 0.05); else S.u.arc(s.b, [W/2+0.4,2.3,0], [W/2-13.6,0.11,4], 2.5, (p-0.5)/0.4); S.pose(s.c, "idle", p); }},
  {t:["Bola masuk atau keluar","Ball in or out"], x:["Bola masih dalam permainan selagi sebahagian bola menyentuh garisan. Ia keluar hanya bila seluruh bola melepasi garisan.","The ball is still in play while any part of it is on the line. It is out only when the whole ball has crossed the line."], cam:[[W/2+3,2.2,4],[W/2,0,0]], dur:4,
   set:function(S){ var b=S.st.ball(BALL,"#fff",{seams:"#222"}), lin=S.st.label("IN", W/2, 1.2, 0, 0.7), lout=S.st.label("OUT", W/2, 1.2, 0, 0.7, "#ff6b6b"); return {b:b, i:lin, o:lout}; },
   at:function(S, s, p){ var x=W/2-0.6+p*1.3; s.b.position.set(x, 0.11, 0); s.b.rotation.z-=0.05; var out=x-BALL/2>W/2+0.06; S.u.show(s.i, !out); S.u.show(s.o, out); }},
  {t:["Gol","A goal"], x:["Gol dikira bila seluruh bola melepasi garisan gol di antara tiang dan di bawah palang.","A goal is scored when the whole ball crosses the goal line between the posts and under the crossbar."], cam:[[8,2.5,HL-6],[0,1,HL]], dur:4,
   set:function(S){ var b=S.st.ball(BALL,"#fff",{seams:"#222"}), g=S.st.label("GOAL!", 0, 3.4, HL, 1.1); return {b:b, g:g}; },
   at:function(S, s, p){ S.u.arc(s.b, [-3,0.11,HL-14], [1.5,1.2,HL+1.2], 1.5, S.clamp(p/0.6,0,1)); S.u.show(s.g, s.b.position.z-BALL/2>HL+0.06); }},
  {t:["Ofsaid","Offside"], x:["Penyerang ofsaid jika, ketika rakan menghantar bola, dia lebih hampir ke garisan gol lawan berbanding bola DAN pemain pertahanan kedua terakhir, dan dia terlibat dalam permainan.","An attacker is offside if, when a teammate passes, they are nearer the opponents' goal line than both the ball and the second-last defender, and they get involved in play."], cam:[[-30,26,30],[0,0,30]], dur:5,
   set:function(S){ var D=[[-15,34],[-5,33],[6,33.5],[16,34]].map(function(p){ var b=S.st.body(S.H,S.team(1)); S.place(b,p[0],p[1],Math.PI); return b; }); var gk=S.st.body(S.H,{top:"#2f3e46"}); S.place(gk,0,50,Math.PI);
     var A=S.st.body(S.H,S.team(0)), M=S.st.body(S.H,S.team(0)), b=S.st.ball(BALL,"#fff",{seams:"#222"}); S.place(M,-6,18,0);
     var line=S.u.strip(-W/2, 33, W/2, 33, 0.25, "#CBFA1E"); var off=S.st.label("OFFSIDE", 4, 3.2, 36, 0.9, "#ff6b6b"), ok=S.st.label("ONSIDE", 4, 3.2, 36, 0.9); return {D:D, A:A, M:M, b:b, line:line, off:off, ok:ok}; },
   at:function(S, s, p){ var late=p>0.5; var ax=4, az=late?S.lerp(30,36,S.seg(p,0,0.5)):S.lerp(30,36,S.seg(p,0,0.5)); S.place(s.A, ax, S.lerp(30,36,S.seg(p,0,0.45)), 0); S.pose(s.A,"run",(p*4)%1);
     var pass=p>0.45; S.pose(s.M, pass&&p<0.55?"kick":"idle", S.seg(p,0.45,0.55)); if(!pass) s.b.position.set(-6,0.11,18.6); else S.u.arc(s.b,[-6,0.11,18.6],[4,0.11,36],0,S.seg(p,0.5,0.85));
     var isOff=s.A.position.z>33; S.u.show(s.off, pass&&isOff); S.u.show(s.ok, pass&&!isOff); s.D.forEach(function(b,i){ S.pose(b,"idle",p+i*0.1); }); }},
  {t:["Kesalahan & sepakan percuma","Fouls and free kicks"], x:["Menjatuhkan, menolak, memegang atau menendang lawan = sepakan percuma langsung (boleh terus gol). Kesalahan lain seperti main berbahaya = sepakan percuma tidak langsung.","Tripping, pushing, holding or kicking an opponent gives a direct free kick (can score directly). Other offences, like dangerous play, give an indirect free kick."], cam:[[10,6,8],[0,0.6,0]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)), d=S.st.body(S.H,S.team(1)), r=S.st.body(S.H,{top:"#111",pants:"#111"}), b=S.st.ball(BALL,"#fff",{seams:"#222"}); S.place(r,6,4,-2.2); return {a:a,d:d,r:r,b:b}; },
   at:function(S, s, p){ S.u.mv(s.a,0,-6,0,0,S.seg(p,0,0.35)); s.b.position.set(0,0.11,S.lerp(-5.4,0.6,S.seg(p,0,0.35)));
     S.place(s.d, -2.5+S.seg(p,0.2,0.4)*2, 0.2, Math.PI/2); S.pose(s.d, p>0.25&&p<0.5?"kick":"idle", S.seg(p,0.25,0.45));
     var fall=S.seg(p,0.35,0.5); s.a.rotation.x=fall*1.45; s.a.position.y=0; S.pose(s.r, p>0.5?"whistle":"idle", p); }},
  {t:["Sepakan penalti","Penalty kick"], x:["Kesalahan sepakan percuma langsung oleh pertahanan dalam kotak penalti sendiri = sepakan penalti dari titik 11 m. Penjaga gol mesti di garisan gol.","A direct-free-kick foul by a defender inside their own penalty area gives a penalty kick from the 11 m spot. The goalkeeper must stay on the goal line."], cam:[[0,2.4,HL-17],[0,1,HL]], dur:4,
   set:function(S){ var k=S.st.body(S.H,S.team(0)), g=S.st.body(S.H,{top:"#2f3e46"}), b=S.st.ball(BALL,"#fff",{seams:"#222"}); S.place(g,0,HL,Math.PI); return {k:k,g:g,b:b}; },
   at:function(S, s, p){ S.u.mv(s.k,-1.5,HL-14,-0.3,HL-11.4,S.seg(p,0,0.3)); S.pose(s.k, p>=0.3&&p<0.5?"kick":p<0.3?"run":"idle", S.seg(p,0.3,0.45));
     if(p<0.42) s.b.position.set(0,0.11,HL-11); else S.u.arc(s.b,[0,0.11,HL-11],[2.8,1.6,HL+0.6],0.5,S.seg(p,0.42,0.62)); S.pose(s.g, p>0.4?"dive":"ready", S.seg(p,0.42,0.6)); s.g.position.x=-S.seg(p,0.42,0.6)*1.4; }},
  {t:["Kad kuning & merah","Yellow and red cards"], x:["Kad kuning = amaran. Dua kad kuning dalam satu perlawanan = kad merah. Kad merah = pemain dibuang dan pasukan bermain kurang seorang.","A yellow card is a caution. Two yellows in one match make a red. A red card sends the player off, and the team plays one short."], cam:[[0,2.2,6],[0,1.6,0]], dur:4,
   set:function(S){ var r=S.st.body(S.H,{top:"#111",pants:"#111"}), y=S.u.card(r,"#f2c94c"), rd=S.u.card(r,"#e53935"), pl=S.st.body(S.H,S.team(1)); S.place(pl,1.4,1.2,-2.4); return {r:r,y:y,rd:rd,pl:pl}; },
   at:function(S, s, p){ S.pose(s.r, (p>0.1&&p<0.45)||p>0.6?"card":"idle", p); S.u.show(s.y, p<0.5); S.u.show(s.rd, p>=0.5); S.pose(s.pl,"idle",p); if(p>0.8) S.u.mv(s.pl,1.4,1.2,6,4,S.seg(p,0.8,1)); }},
  {t:["Penjaga gol","The goalkeeper"], x:["Penjaga gol boleh memegang bola hanya dalam kotak penaltinya. Dia tidak boleh memegang bola yang sengaja disepak kepadanya oleh rakan sepasukan.","The goalkeeper may handle the ball only inside their own penalty area. They may not handle a ball deliberately kicked to them by a teammate."], cam:[[18,20,HL-30],[0,0,HL-8]], dur:4,
   set:function(S){ var z=S.u.zone(-PAW/2,HL-PA,PAW/2,HL,"#CBFA1E",0.22), g=S.st.body(S.H,{top:"#2f3e46"}), b=S.st.ball(BALL,"#fff",{seams:"#222"}); return {z:z,g:g,b:b}; },
   at:function(S, s, p){ S.place(s.g,0,HL-2,Math.PI); S.u.arc(s.b,[6,0.11,HL-28],[0,1.5,HL-2.3],5,S.seg(p,0,0.5)); S.pose(s.g, p>0.4?"jump":"ready", S.seg(p,0.4,0.7)); s.z.material.opacity=0.15+0.15*Math.sin(p*Math.PI*2); }},
  {t:["Pertukaran pemain & VAR","Substitutes and VAR"], x:["Kebanyakan pertandingan membenarkan 5 pertukaran. VAR (pengadil video) hanya membantu untuk gol, penalti, kad merah terus dan salah orang.","Most competitions allow 5 substitutions. VAR (video referee) only helps with goals, penalties, straight red cards and mistaken identity."], cam:[[W/2+8,5,8],[W/2-2,1,0]], dur:5,
   set:function(S){ var o=S.st.body(S.H,Object.assign({num:9},S.team(0))), n=S.st.body(S.H,Object.assign({num:14},S.team(0))), ref4=S.st.body(S.H,{top:"#111",pants:"#111"}), lb=S.st.label("9 ⇄ 14", W/2+1.5, 2.6, 0, 0.8); S.place(ref4,W/2+1.5,0.8,-Math.PI/2); return {o:o,n:n,r:ref4,lb:lb}; },
   at:function(S, s, p){ S.u.mv(s.o, W/2-8, 3, W/2+0.5, 0.4, S.seg(p,0,0.5)); S.u.mv(s.n, W/2+2.5, -0.6, W/2-6, -3, S.seg(p,0.45,0.95)); S.pose(s.r,"card",p); }}],
 quiz:[
  {q:["Berapa pemain setiap pasukan di atas padang?","How many players per team are on the pitch?"], a:[["9","9"],["10","10"],["11","11"],["12","12"]], ok:2, why:["11 termasuk penjaga gol.","11 including the goalkeeper."]},
  {q:["Bilakah bola dikira keluar padang?","When is the ball out of play?"], a:[["Bila menyentuh garisan","When it touches the line"],["Bila separuh bola melepasi garisan","When half the ball is over"],["Bila seluruh bola melepasi garisan","When the whole ball is over the line"]], ok:2, why:["Seluruh bola mesti melepasi garisan.","The whole ball must cross the line."]},
  {q:["Pemain boleh ofsaid di separuh padangnya sendiri?","Can a player be offside in their own half?"], a:[["Ya","Yes"],["Tidak","No"]], ok:1, why:["Ofsaid hanya di separuh padang lawan.","Offside only applies in the opponents' half."]},
  {q:["Dua kad kuning dalam satu perlawanan bermaksud…","Two yellow cards in one match mean…"], a:[["Amaran terakhir","A final warning"],["Kad merah","A red card"],["Sepakan penalti","A penalty kick"]], ok:1, why:["Dua kuning = merah, pemain dibuang.","Two yellows make a red; the player is sent off."]},
  {q:["Dari jarak berapa sepakan penalti diambil?","From how far is a penalty taken?"], a:[["9.15 m","9.15 m"],["11 m","11 m"],["16.5 m","16.5 m"]], ok:1, why:["Titik penalti 11 m dari garisan gol.","The penalty spot is 11 m from the goal line."]}],
 game:{ name:["Tendangan penalti","Penalty shootout"], help:["Leret ke arah gol untuk menendang: kiri/kanan untuk arah, panjang leretan untuk tinggi. 5 tendangan.","Swipe toward the goal to shoot: left or right for direction, a longer swipe goes higher. 5 shots."], unit:["gol","goals"],
  cam:[0,1.9,HL-15.5], at:[0,1.1,HL],
  start:function(G){ var S=G.S; G.k=S.st.body(S.H,S.team(0)); G.g=S.st.body(S.H,{top:"#2f3e46"}); G.b=S.st.ball(BALL,"#fff",{seams:"#222"}); G.n=0; G.goals=0; G.reset=function(){ G.shot=null; G.t=0; S.place(G.k,-0.6,HL-12.4,0.2); S.place(G.g,0,HL,Math.PI); S.pose(G.g,"ready",0); G.b.position.set(0,0.11,HL-11); G.res=""; }; G.reset(); G.hudU(); },
  step:function(G, dt){ var S=G.S; if(!G.shot){ S.pose(G.k,"idle",(performance.now()/1000)%1); S.pose(G.g,"ready",0); G.g.position.x=Math.sin(performance.now()/500)*0.4; return; }
   G.t+=dt; var sh=G.shot, f=Math.min(1,G.t/sh.tt); S.pose(G.k,"kick",Math.min(1,G.t/0.4)+0.4);
   G.b.position.set(sh.x*f, 0.11+sh.y*Math.sin(f*Math.PI*0.5), HL-11+11.4*f);
   var dv=Math.min(1,G.t/0.45); S.pose(G.g,"dive",dv); G.g.position.x=sh.gx*dv*1.6; G.g.rotation.z=0;
   if(f>=1 && !G.res){ var inGoal=Math.abs(sh.x)<GW/2-0.1 && sh.y<GH-0.1, saved=inGoal && Math.abs(sh.x-G.g.position.x)<1.1 && sh.y<1.9; G.res=!inGoal?"miss":saved?"save":"goal"; if(G.res==="goal") G.goals++; G.n++; G.S.vib(G.res==="goal"?40:15); G.hudU();
     setTimeout(function(){ if(G.over) return; if(G.n>=5){ G.end(G.goals, G.goals+" / 5 "+G.S.L2("gol","goals")); } else G.reset(); }, 900); } },
  swipe:function(G, dx, dy, dt){ if(G.shot||dy>-0.03) return; var x=Math.max(-5,Math.min(5,dx*14)), y=Math.max(0,Math.min(3.2,(-dy-0.08)*7)), lvl=Math.min(0.85,0.35+G.n*0.1);
   var gx=Math.random()<lvl?(x<0?-1:1):(Math.random()<0.5?-1:1); if(Math.abs(x)<0.6&&Math.random()<0.5) gx=0; G.shot={x:x, y:y, tt:Math.max(0.35,0.75-(-dy)*0.5), gx:gx}; G.t=0; },
  hudU0:null },
 fieldScene:null };
var g=SPORTS.football.game; g.start=(function(st){ return function(G){ G.hudU=function(){ G.S.hud('⚽ '+G.goals+' / '+G.n+(G.res?'  ·  '+(G.res==="goal"?G.S.L2("GOL!","GOAL!"):G.res==="save"?G.S.L2("Diselamatkan","Saved"):G.S.L2("Terlepas","Missed")):'')+'<div style="font-weight:600;font-size:12px;opacity:.85">'+G.S.L2("Leret ke atas untuk menendang","Swipe up to shoot")+'</div>'); }; st(G); }; })(g.start);
})();
