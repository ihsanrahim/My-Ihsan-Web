/* My Ihsan Sports: Swimming. Olympic pool 50 x 25 m, 10 lanes of 2.5 m, backstroke flags 5 m from each wall, 15 m marks. World Aquatics rules, as of 2026.
   The Sunnah note is placeholder text until the ustaz adds the reviewed hadith and reference (notes/MEMORY.md: religious text needs ustaz review). */
(function(){
"use strict";
var L=50, HL=25, W=25, LN=2.5, NL=10;
function lx(i){ return -W/2+LN*(i+0.5); }
function swimmer(S, cap){ var b=S.st.body(S.H,{top:"#1f3b5c",pants:"#1f3b5c",capc:cap||"#f2c94c",shoe:"#c89e79"}); return b; }
// lie a body on the water: head toward +z (dir 1) or -z (dir -1); back = on the back
function lie(b, x, z, dir, back, y){ b.rotation.order="YXZ"; b.position.set(x, y==null?-0.12:y, z);
  if(back) b.rotation.set(-Math.PI/2, dir>0?Math.PI:0, 0); else b.rotation.set(Math.PI/2, dir>0?0:Math.PI, 0); }
SPORTS.swimming={ id:"swimming", v:"2026", H:1.85, cam:[22,14,-30], top:[0,62,0.1], sky:"#9fd4f0", ground:"#d9e2e6", groundY:-3,
 field:function(K){ var T=THREE; [[0,-HL-20,W+80,40],[0,HL+20,W+80,40],[-W/2-20,0,40,L],[W/2+20,0,40,L]].forEach(function(d){ K.rect(d[2], d[3], "#e8eef0", 0.02, d[0], d[1]); }); K.water(W, L, 2.5);
   for(var i=0;i<=NL;i++){ var x=-W/2+i*LN; for(var z=-HL;z<HL;z+=1){ var near=z<-HL+5||z>=HL-5, m15=Math.abs(z-(-HL+15))<0.5||Math.abs(z-(HL-15))<0.5;
       var c=near?"#e53935":m15?"#f2c94c":(Math.floor(z)%2?"#1e88e5":"#ffffff"); var cyl=new T.Mesh(new T.CylinderGeometry(0.06,0.06,1,8), new T.MeshLambertMaterial({color:new T.Color(c)})); cyl.rotation.x=Math.PI/2; cyl.position.set(x,0,z+0.5); K.root.add(cyl); } }
   [-1,1].forEach(function(s){ var z=s*(HL-5); K.bar(-W/2-1,1.8,z,W/2+1,1.8,z,0.01,"#333"); for(var x=-W/2;x<W/2;x+=0.8){ var f=new T.Mesh(new T.ConeGeometry(0.15,0.3,3), new T.MeshBasicMaterial({color:(Math.round(x)%2)?0xe53935:0xffffff})); f.rotation.x=Math.PI; f.position.set(x,1.62,z); K.root.add(f); }
     for(var i=0;i<NL;i++){ var blk=new T.Mesh(new T.BoxGeometry(0.5,0.75,0.6), new T.MeshLambertMaterial({color:0xf2f2f2})); blk.position.set(lx(i),0.375,s*(HL+0.3)); K.root.add(blk); } });
   return {w:W,l:L}; },
 facts:[[["Kolam Olimpik","Olympic pool"],"50 × 25 m"],[["Lorong","Lanes"],"10 × 2.5 m"],[["Kedalaman","Depth"],"≥ 2 m"],[["Bendera gaya kuak lentang","Backstroke flags"],"5 m"],[["Had di bawah air","Underwater limit"],"15 m"]],
 zones:[
  {n:["Zon 15 m","15 m zone"], d:["Untuk gaya bebas, kuak lentang dan rama-rama, kepala mesti timbul sebelum tanda 15 m selepas mula dan setiap pusingan.","In freestyle, backstroke and butterfly, the head must break the surface before the 15 m mark after the start and each turn."], p:[[-W/2,-HL],[W/2,-HL],[W/2,-HL+15],[-W/2,-HL+15]]},
  {n:["Bendera 5 m","5 m flags"], d:["Perenang kuak lentang mengira kayuhan dari bendera ini supaya tidak terhantuk dinding.","Backstroke swimmers count strokes from these flags so they don't hit the wall."], p:[[-W/2,HL],[W/2,HL],[W/2,HL-5],[-W/2,HL-5]]},
  {n:["Lorong 4 & 5","Lanes 4 and 5"], d:["Perenang terpantas dalam saringan diberi lorong tengah.","The fastest swimmers from the heats get the middle lanes."], p:[[lx(3)-LN/2,-HL],[lx(4)+LN/2,-HL],[lx(4)+LN/2,HL],[lx(3)-LN/2,HL]]}],
 cards:[
  {t:["Empat gaya","The four strokes"], x:["Gaya bebas (kuak depan), kuak lentang, kuak dada dan rama-rama.","Freestyle (front crawl), backstroke, breaststroke and butterfly."], cam:[[10,4,-4],[0,0,2]], dur:8,
   set:function(S){ var B=[0,1,2,3].map(function(i){ return swimmer(S,["#f2c94c","#e53935","#4fc3f7","#7ed957"][i]); }); var lb=["FREE","BACK","BREAST","FLY"].map(function(t,i){ return S.st.label(t,lx(3+i),1.4,0,0.6); }); return {B:B}; },
   at:function(S, s, p, t){ var st=["free","back","breast","fly"]; s.B.forEach(function(b,i){ lie(b,lx(3+i),-2+((t*0.9)%6),1,i===1); S.pose(b,"swim-"+st[i],(t*0.7)%1); }); }},
  {t:["Mula","Starts"], x:["Gaya bebas, kuak dada dan rama-rama bermula dengan terjunan dari blok. Kuak lentang bermula dalam air. Mula palsu = dibatalkan.","Freestyle, breaststroke and butterfly start with a dive from the block. Backstroke starts in the water. A false start is a disqualification."], cam:[[6,3,-HL-5],[0,0.6,-HL+3]], dur:3,
   set:function(S){ var b=swimmer(S); return {b:b}; },
   at:function(S, s, p){ var x=lx(4), z0=-HL-0.3; if(p<0.25){ s.b.position.set(x,0.75,z0); s.b.rotation.set(0.7,0,0); S.pose(s.b,"ready",0); }
     else { var q=S.seg(p,0.25,0.6); s.b.position.set(x, 0.75+Math.sin(q*Math.PI)*0.5-q*0.9, z0+q*4); s.b.rotation.set(0.7+q*0.9,0,0); S.pose(s.b,"dive",1); if(p>0.6){ lie(s.b,x,z0+4+(p-0.6)*6,1,false); S.pose(s.b,"swim-free",p*3%1); } } }},
  {t:["Pusingan & sentuhan","Turns and touches"], x:["Perenang mesti menyentuh dinding di setiap pusingan. Kuak dada dan rama-rama: sentuh dengan dua tangan serentak.","Swimmers must touch the wall at each turn. Breaststroke and butterfly: touch with both hands at the same time."], cam:[[5,3,HL-6],[0,0,HL-1]], dur:4,
   set:function(S){ return {b:swimmer(S), l:S.st.label("TOUCH",lx(4),1.4,HL,0.6)}; },
   at:function(S, s, p){ var x=lx(4); if(p<0.5){ lie(s.b,x,HL-6+p*2*4.2,1,false); S.pose(s.b,"swim-breast",(p*4)%1); } else { lie(s.b,x,HL-1.8-(p-0.5)*8,-1,false); S.pose(s.b,"swim-breast",(p*4)%1); } S.u.show(s.l,p>0.4&&p<0.6); }},
  {t:["Had 15 m di bawah air","15 m underwater limit"], x:["Selepas mula dan setiap pusingan, kepala mesti timbul sebelum 15 m (gaya bebas, kuak lentang, rama-rama).","After the start and each turn, the head must surface before 15 m (freestyle, backstroke, butterfly)."], cam:[[12,3,-HL+8],[0,-0.5,-HL+9]], dur:4,
   set:function(S){ return {b:swimmer(S), z:S.u.zone(-W/2,-HL,W/2,-HL+15,"#f2c94c",0.18), l:S.st.label("15 m",lx(4),1.2,-HL+15,0.6)}; },
   at:function(S, s, p){ var z=-HL+p*18, under=z<-HL+14; lie(s.b,lx(4),z,1,false,under?-0.9:-0.12); S.pose(s.b,under?"swim-fly":"swim-free",(p*4)%1); }},
  {t:["Susunan Individu Medley","Individual medley order"], x:["Individu medley: rama-rama, kuak lentang, kuak dada, gaya bebas.","Individual medley: butterfly, backstroke, breaststroke, freestyle."], cam:[[10,5,0],[0,0,0]], dur:8,
   set:function(S){ return {b:swimmer(S), l:[S.st.label("1 FLY",lx(4),1.4,0,0.6),S.st.label("2 BACK",lx(4),1.4,0,0.6),S.st.label("3 BREAST",lx(4),1.4,0,0.6),S.st.label("4 FREE",lx(4),1.4,0,0.6)]}; },
   at:function(S, s, p){ var k=Math.floor(p*4), q=(p*4)%1, st=["fly","back","breast","free"][k], d=k%2?-1:1; lie(s.b,lx(4),d>0?-6+q*12:6-q*12,d,k===1); S.pose(s.b,"swim-"+st,(q*3)%1); s.l.forEach(function(x,i){ S.u.show(x,i===k); }); }},
  {t:["Susunan Medley Berganti-ganti","Medley relay order"], x:["Medley berganti-ganti: kuak lentang, kuak dada, rama-rama, gaya bebas (kuak lentang dahulu kerana ia bermula dalam air).","Medley relay: backstroke, breaststroke, butterfly, freestyle (backstroke first because it starts in the water)."], cam:[[10,5,0],[0,0,0]], dur:8,
   set:function(S){ return {B:[0,1,2,3].map(function(i){ return swimmer(S,["#e53935","#4fc3f7","#7ed957","#f2c94c"][i]); }), l:[S.st.label("1 BACK",lx(4),1.4,0,0.6),S.st.label("2 BREAST",lx(4),1.4,0,0.6),S.st.label("3 FLY",lx(4),1.4,0,0.6),S.st.label("4 FREE",lx(4),1.4,0,0.6)]}; },
   at:function(S, s, p){ var k=Math.floor(p*4), q=(p*4)%1, st=["back","breast","fly","free"]; s.B.forEach(function(b,i){ b.visible=i===k; }); var d=k%2?-1:1; lie(s.B[k],lx(4),d>0?-6+q*12:6-q*12,d,k===0); S.pose(s.B[k],"swim-"+st[k],(q*3)%1); s.l.forEach(function(x,i){ S.u.show(x,i===k); }); }},
  {t:["Pertukaran berganti-ganti","Relay changeover"], x:["Kaki perenang seterusnya mesti masih di blok sehingga rakan menyentuh dinding. Terlalu awal = pasukan dibatalkan.","The next swimmer's feet must stay on the block until the teammate touches the wall. Too early disqualifies the team."], cam:[[6,3,-HL-5],[0,0.6,-HL+2]], dur:4,
   set:function(S){ return {a:swimmer(S,"#f2c94c"), b:swimmer(S,"#e53935"), l:S.st.label("TOUCH → GO",lx(4),2.4,-HL,0.6)}; },
   at:function(S, s, p){ var x=lx(4); lie(s.a,x,-HL+5-S.seg(p,0,0.5)*4.6,-1,false); S.pose(s.a,"swim-free",(p*4)%1);
     if(p<0.5){ s.b.position.set(x,0.75,-HL-0.3); s.b.rotation.set(0.7,0,0); S.pose(s.b,"ready",0); } else { var q=S.seg(p,0.5,0.9); s.b.position.set(x,0.75+Math.sin(q*Math.PI)*0.4-q*0.9,-HL-0.3+q*4); s.b.rotation.set(0.7+q*0.9,0,0); S.pose(s.b,"dive",1); } S.u.show(s.l,p>0.45&&p<0.6); }},
  {t:["Lorong & pembatalan","Lanes and disqualification"], x:["Kekal dalam lorong sendiri. Menghalang perenang lain, berjalan di dasar kolam atau tarik tali lorong = dibatalkan.","Stay in your own lane. Obstructing another swimmer, walking on the bottom or pulling on the lane rope are disqualifications."], cam:[[0,10,-12],[0,0,0]], dur:4,
   set:function(S){ return {a:swimmer(S), b:swimmer(S,"#e53935"), l:S.st.label("DSQ",lx(5),1.6,1,0.7,"#ff6b6b")}; },
   at:function(S, s, p){ lie(s.a,lx(4),-4+p*8,1,false); S.pose(s.a,"swim-free",(p*3)%1); lie(s.b,lx(5)-S.seg(p,0.3,0.6)*1.6,-4+p*8,1,false); S.pose(s.b,"swim-free",(p*3+0.5)%1); S.u.show(s.l,p>0.6); }},
  {t:["Keselamatan air","Water safety"], x:["Belajar berenang dengan jurulatih. Jangan berenang seorang diri; kanak-kanak sentiasa diawasi orang dewasa. Patuhi bendera dan pengawal pantai.","Learn to swim with a coach. Never swim alone; children always with an adult watching. Follow the flags and the lifeguards."], cam:[[8,4,-10],[0,0.5,-6]], dur:4,
   set:function(S){ var a=S.st.body(1.8,{top:"#e53935",pants:"#e53935"}); S.place(a,W/2+1.4,-6,-Math.PI/2); return {a:a, k:swimmer(S,"#4fc3f7")}; },
   at:function(S, s, p){ S.pose(s.a,"point",0); lie(s.k,W/2-1.5,-7+p*2,1,false); S.pose(s.k,"swim-breast",(p*2)%1); }},
  {t:["🕌 Sukan sunnah","🕌 A Sunnah sport"], x:["Berenang termasuk sukan yang digalakkan dalam tradisi Islam, bersama memanah dan menunggang kuda. (Teks hadis dan rujukan akan ditambah selepas disemak oleh ustaz.)","Swimming is among the sports encouraged in the Islamic tradition, together with archery and horse riding. (The hadith text and reference will be added after review by the ustaz.)"], cam:[[14,8,-14],[0,0,0]], dur:8,
   set:function(S){ return {B:[2,4,6].map(function(i){ return swimmer(S,["#f2c94c","#ffffff","#7ed957"][i/2-1]); })}; },
   at:function(S, s, p, t){ s.B.forEach(function(b,i){ lie(b,lx(2+i*2),-10+((t*1.2+i*3)%20),1,false); S.pose(b,"swim-free",(t*0.8+i*0.3)%1); }); }}],
 quiz:[
  {q:["Berapa panjang kolam Olimpik?","How long is an Olympic pool?"], a:[["25 m","25 m"],["50 m","50 m"],["100 m","100 m"]], ok:1, why:["50 m, 10 lorong.","50 m, with 10 lanes."]},
  {q:["Gaya mana bermula dalam air?","Which stroke starts in the water?"], a:[["Kuak dada","Breaststroke"],["Kuak lentang","Backstroke"],["Rama-rama","Butterfly"]], ok:1, why:["Kuak lentang bermula dalam air.","Backstroke starts in the water."]},
  {q:["Susunan individu medley ialah…","The individual medley order is…"], a:[["Bebas, dada, lentang, rama-rama","Free, breast, back, fly"],["Rama-rama, lentang, dada, bebas","Fly, back, breast, free"],["Lentang, dada, rama-rama, bebas","Back, breast, fly, free"]], ok:1, why:["Rama-rama, kuak lentang, kuak dada, gaya bebas.","Butterfly, backstroke, breaststroke, freestyle."]},
  {q:["Kepala mesti timbul sebelum berapa meter?","The head must surface before how many metres?"], a:[["5 m","5 m"],["10 m","10 m"],["15 m","15 m"]], ok:2, why:["15 m selepas mula dan setiap pusingan.","15 m after the start and each turn."]},
  {q:["Bolehkah kanak-kanak berenang tanpa pengawasan?","May children swim without anyone watching?"], a:[["Ya","Yes"],["Tidak","No"]], ok:1, why:["Sentiasa dengan orang dewasa yang mengawasi.","Always with an adult watching."]}],
 game:{ name:["Lumba 50 m","50 m race"], help:["Ketik mengikut rentak bila bulatan bercahaya untuk kayuhan kuat. Tersilap rentak memperlahankan anda. Kalahkan 3 perenang lain!","Tap in rhythm when the ring lights up for a strong stroke. Off-beat taps slow you down. Beat the other 3 swimmers!"], unit:["s","s"], lower:true,
  cam:[0,6,-HL-9], at:[0,0,-HL+12],
  start:function(G){ var S=G.S; G.me=swimmer(S,"#f2c94c"); G.ai=[0,1,2].map(function(i){ return swimmer(S,["#e53935","#4fc3f7","#7ed957"][i]); }); G.ail=[3,5,6]; G.aiv=[1.85,2.0,2.1].map(function(v){ return v+Math.random()*0.15; });
   G.z=0; G.v=1.4; G.az=[0,0,0]; G.t=0; G.beat=0.5; G.go=false; G.cd=1.5; G.res=""; G.ring=S.u.strip(0,0,0.01,0,1.2,"#CBFA1E",0.05); G.hu(); },
  step:function(G, dt){ var S=G.S; if(G.cd>0){ G.cd-=dt; G.hu(); lie(G.me,lx(4),-HL+0.6,1,false); G.ai.forEach(function(b,i){ lie(b,lx(G.ail[i]),-HL+0.6,1,false); }); return; }
   G.t+=dt; G.v=Math.max(1.0,G.v-dt*0.35); G.z+=G.v*dt; G.az=G.az.map(function(z,i){ return z+G.aiv[i]*dt; });
   var ph=(G.t%G.beat)/G.beat; G.ring.position.set(lx(4),0.05,-HL+G.z+2.2); G.ring.material.opacity=ph<0.25||ph>0.85?0.85:0.2;
   lie(G.me,lx(4),-HL+G.z,1,false); S.pose(G.me,"swim-free",(G.t*G.v*0.45)%1); G.ai.forEach(function(b,i){ lie(b,lx(G.ail[i]),-HL+G.az[i],1,false); S.pose(b,"swim-free",(G.t*0.8+i*0.2)%1); });
   S.st.setCam([lx(4)+5,4,-HL+G.z-7],[lx(4),0,-HL+G.z+4]);
   if(G.z>=L-1.9){ var tm=Math.round(G.t*10)/10, place=1+G.az.filter(function(z){ return z>=L-1.9; }).length; G.end(tm, tm+" s · "+["🥇","🥈","🥉","4"][place-1]+" "+G.S.L2("tempat","place")); } else G.hu(); },
  tap:function(G){ if(G.cd>0) return; var ph=(G.t%G.beat)/G.beat, on=ph<0.25||ph>0.85; if(on){ G.v=Math.min(2.6,G.v+0.32); G.S.vib(12); } else G.v=Math.max(0.9,G.v-0.25); },
  hu0:null },
 fieldScene:null };
var gm=SPORTS.swimming.game, st0=gm.start; gm.start=function(G){ G.hu=function(){ G.S.hud(G.cd>0?'🏊 '+(G.cd>1?G.S.L2("Sedia…","Ready…"):G.S.L2("Mula!","Go!")):'🏊 '+Math.min(50,Math.round(G.z))+' / 50 m  ·  '+G.t.toFixed(1)+' s<div class="spmeter"><i style="width:'+Math.round((G.v-0.9)/1.7*100)+'%"></i></div>'); }; st0(G); };
})();
