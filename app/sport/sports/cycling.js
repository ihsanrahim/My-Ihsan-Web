/* My Ihsan Sports: Cycling and keirin. A 250 m velodrome (straights 38 m, bends ≈ 27.5 m radius, 7 m wide, banked from ≈ 13° on the
   straights to ≈ 43° in the bends) with the blue band (Côte d'Azur), measurement line, sprinters' line and stayers' line; a straight road
   beside it for the road-racing cards. UCI rules as of 2026 (⚠ check the current UCI regulations, keirin derny speeds especially). */
(function(){
"use strict";
var PI=Math.PI, SL=38, RI=27.5, TW=7, LAP=2*SL+2*PI*RI, RX=72, KM=[0.2, 1.05, 2.65];
// the inner edge of the track: position, outward direction and banking at distance s (finish line at the north end of the home straight)
function E(s){ s=((s%LAP)+LAP)%LAP; var c=PI*RI, a, f;
  if(s<c){ a=s/RI; f=s/c; return {x:RI*Math.cos(a), z:-SL/2-RI*Math.sin(a), ox:Math.cos(a), oz:-Math.sin(a), b:bank(f)}; }
  s-=c; if(s<SL) return {x:-RI, z:-SL/2+s, ox:-1, oz:0, b:bank(-1)};
  s-=SL; if(s<c){ a=PI+s/RI; f=s/c; return {x:RI*Math.cos(a), z:SL/2-RI*Math.sin(a), ox:Math.cos(a), oz:-Math.sin(a), b:bank(f)}; }
  s-=c; return {x:RI, z:SL/2-s, ox:1, oz:0, b:bank(-1)}; }
function bank(f){ return (13+(f<0?0:30*Math.sin(PI*f)))*PI/180; }
function pt(s, w){ var e=E(s), cb=Math.cos(e.b), h=w>0?w*Math.sin(e.b):0, hw=w>0?w*cb:w; return [e.x+e.ox*hw, h, e.z+e.oz*hw, e.b]; }
function ribbon(T, w0, w1, col, lift, flat){ var N=240, P=[], I=[], i; for(i=0;i<=N;i++){ var s=i/N*LAP, a=flat?[E(s).x+E(s).ox*w0,0,E(s).z+E(s).oz*w0]:pt(s,w0), b=flat?[E(s).x+E(s).ox*w1,0,E(s).z+E(s).oz*w1]:pt(s,w1);
    P.push(a[0],a[1]+lift,a[2], b[0],b[1]+lift,b[2]); if(i<N) I.push(i*2,i*2+1,i*2+2, i*2+1,i*2+3,i*2+2); }
  var g=new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(P,3)); g.setIndex(I); g.computeVertexNormals();
  var m=new T.MeshLambertMaterial({color:new T.Color(col), side:T.DoubleSide, polygonOffset:true, polygonOffsetFactor:-Math.round(lift*300), polygonOffsetUnits:-Math.round(lift*300)}); return new T.Mesh(g, m); }
var KC=["#f1efe9","#222222","#c0392b","#2a6fb0","#f2c94c","#2e7d5b","#e67e22","#8e44ad"];
function bike(S, top, o){ o=o||{}; var T=S.T, g=new T.Group(), dk=new T.MeshLambertMaterial({color:new T.Color(o.frame||"#2b2f3a")}), W=[];
  [-0.5,0.5].forEach(function(z){ var w=new T.Mesh(new T.TorusGeometry(0.33,0.02,6,24), new T.MeshLambertMaterial({color:0x111111})); w.rotation.y=PI/2; w.position.set(0,0.35,z); g.add(w); W.push(w);
    var hub=new T.Mesh(new T.CylinderGeometry(0.31,0.31,0.01,16), new T.MeshLambertMaterial({color:0xcfd3d8, transparent:true, opacity:0.35})); hub.rotation.z=PI/2; w.add(hub); hub.rotation.set(0,0,0); hub.rotation.x=PI/2; });
  function bar(a, b, r){ var A=new T.Vector3(a[0],a[1],a[2]), B=new T.Vector3(b[0],b[1],b[2]), m=new T.Mesh(new T.CylinderGeometry(r||0.02,r||0.02,A.distanceTo(B),6), dk); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0), B.clone().sub(A).normalize()); g.add(m); }
  bar([0,0.35,-0.5],[0,0.42,-0.05]); bar([0,0.42,-0.05],[0,0.92,-0.22]); bar([0,0.92,-0.22],[0,0.9,0.38]); bar([0,0.42,-0.05],[0,0.9,0.38]); bar([0,0.9,0.38],[0,0.35,0.5]); bar([0,0.35,-0.5],[0,0.92,-0.22]);
  bar([-0.2,0.98,0.45],[0.2,0.98,0.45],0.015);
  if(o.engine){ var en=new T.Mesh(new T.BoxGeometry(0.22,0.25,0.35), new T.MeshLambertMaterial({color:0x444444})); en.position.set(0,0.45,0.05); g.add(en); }
  var b=S.st.body(o.H||1.78, {top:top, pants:o.pants||"#1d1f24", cap:true, capc:o.helmet||top, hijab:o.hijab, short:true, shorts:true}); g.add(b); b.position.set(0,-0.02,-0.3);
  g.userData={b:b, W:W, up:!!o.upright}; g.rotation.order="YXZ"; S.st.add(g); ride(g, 0); return g; }
function ride(g, ph){ var b=g.userData.b, J=b.userData.J, s=Math.sin(ph*PI*2), c=Math.cos(ph*PI*2), up=g.userData.up;
  ["hip","chest","neck","shL","shR","elL","elR","hpL","hpR","knL","knR","anL","anR"].forEach(function(j){ J[j].rotation.set(0,0,0); });
  J.chest.rotation.x=up?0.25:0.95; J.neck.rotation.x=up?-0.1:-0.75; J.shL.rotation.set(up?-0.9:-1.2,0,-0.12); J.shR.rotation.set(up?-0.9:-1.2,0,0.12); J.elL.rotation.x=J.elR.rotation.x=-0.25;
  J.hpL.rotation.x=-1.05+0.45*s; J.hpR.rotation.x=-1.05-0.45*s; J.knL.rotation.x=1.25-0.55*c; J.knR.rotation.x=1.25+0.55*c; J.anL.rotation.x=J.anR.rotation.x=0.2;
  g.userData.W.forEach(function(w){ w.rotation.x=-ph*PI*4; }); }
// put a bike at distance s, w metres up from the inner edge, leaning with the banking
function onTrack(g, s, w){ var a=pt(s,w), b2=pt(s+0.6,w); g.position.set(a[0],a[1],a[2]); g.rotation.y=Math.atan2(b2[0]-a[0], b2[2]-a[2]); g.rotation.z=-(w>=0?a[3]:0); g.rotation.x=0; }
function onRoad(g, x, z){ g.position.set(x,0,z); g.rotation.set(0,PI,0); }
SPORTS.cycling={ id:"cycling", v:"2026", H:1.78, cam:[55,40,75], ground:"#4a7f45", fog:[200,650], far:900, near:0.1, groundSize:700,
 field:function(K){ var T=window.THREE, r=K.root;
   r.add(ribbon(T, -5, -1.3, "#7aa36e", 0.01, true)); r.add(ribbon(T, -1.3, -0.6, "#3f80c8", 0.015, true)); r.add(ribbon(T, -0.6, 0, "#9fa6ad", 0.015, true));
   r.add(ribbon(T, 0, TW, "#c89b62", 0, false)); r.add(ribbon(T, KM[0], KM[0]+0.05, "#111111", 0.02)); r.add(ribbon(T, KM[1], KM[1]+0.05, "#c0392b", 0.02)); r.add(ribbon(T, KM[2], KM[2]+0.05, "#2a6fb0", 0.02));
   r.add(ribbon(T, TW, TW+0.15, "#dddddd", 0.03)); // the safety fence rail line
   var f=pt(0,0), f2=pt(0,TW); K.bar(f[0],0.02,f[2],f2[0],f2[1]+0.02,f2[2],0.04,"#111111"); K.label("FINISH",RI+3.5,6,-SL/2,1.3);
   // the 200 m line (match sprint timing starts here)
   var p2=pt(LAP-200,0), q2=pt(LAP-200,TW); K.bar(p2[0],0.02,p2[2],q2[0],q2[1]+0.02,q2[2],0.035,"#ffffff");
   K.rect(9, 420, "#4b4f55", 0, RX, 0); for(var z=-200; z<200; z+=8) K.line(RX, z, RX, z+4, 0.15, "#ffffff"); K.line(RX-4.4, -210, RX-4.4, 210, 0.12); K.line(RX+4.4, -210, RX+4.4, 210, 0.12);
   return {w:2*(RI+TW)+6, l:SL+2*(RI+TW)+6}; },
 facts:[[["Velodrom","Velodrome"],"250 m"],[["Kecondongan","Banking"],"≈ 13° – 43°"],[["Lebar trek","Track width"],"≈ 7 m"],[["Garisan pecut","Sprinters' line"],"85 cm "+"↑"],[["Keirin","Keirin"],"6–7 riders, ≈ 2 km"],[["Derny","Derny"],"≈ 30 → 50 km/h ⚠"],[["Kelajuan pecut","Sprint speed"],"≈ 70 km/h"]],
 zones:[
  {n:["Trek berlereng","Banked track"], d:["Kayu, 250 m. Selekoh condong hingga ≈ 43° supaya pelumba boleh membelok laju tanpa tergelincir.","Wooden, 250 m. The bends are banked up to ≈ 43° so riders can corner fast without sliding."], p:[[RI,-SL/2],[RI+TW,-SL/2],[RI+TW,SL/2],[RI,SL/2]]},
  {n:["Jalur biru (Côte d'Azur)","Blue band (Côte d'Azur)"], d:["Bukan sebahagian trek. Menunggang di sini untuk memintas tidak dibenarkan.","Not part of the racing track. Riding here to gain an advantage is not allowed."], p:[[-RI+0.6,-SL/2],[-RI+1.3,-SL/2],[-RI+1.3,SL/2],[-RI+0.6,SL/2]]},
  {n:["Garisan penamat","Finish line"], d:["Garisan hitam di hujung lurus utama. Tayar hadapan yang pertama melepasinya menang.","The black line at the end of the home straight. The first front wheel across it wins."], p:[[RI-1,-SL/2-1.5],[RI+TW,-SL/2-1.5],[RI+TW,-SL/2+1.5],[RI-1,-SL/2+1.5]]},
  {n:["Jalan raya","Road"], d:["Perlumbaan jalan raya, lumba masa dan perlumbaan berperingkat berlangsung di jalan raya, bukan di velodrom.","Road races, time trials and stage races are held on public roads, not in the velodrome."], p:[[RX-4.5,-120],[RX+4.5,-120],[RX+4.5,120],[RX-4.5,120]]}],
 cards:[
  {t:["Perlumbaan jalan raya","Road race"], x:["Semua pelumba bermula serentak (mass start). Orang pertama melepasi garisan penamat menang. Jarak 150–250+ km.","All riders start together (a mass start). The first across the finish line wins. Distances are 150–250+ km."], cam:[[RX+14,6,-30],[RX,1,-6]], dur:5,
   set:function(S){ var B=[]; for(var i=0;i<14;i++) B.push(bike(S,KC[i%8])); return {B:B}; },
   at:function(S, s, p){ s.B.forEach(function(g,i){ onRoad(g, RX+((i%4)-1.5)*0.9, 20-p*30-Math.floor(i/4)*1.9-(i%2)*0.4); ride(g,(p*6+i*0.13)%1); }); }},
  {t:["Lumba masa","Time trial"], x:["Seorang diri melawan jam. Pelumba bermula pada sela masa (cth. 1–2 minit). Masa paling pantas menang. Tiada drafting di belakang pelumba lain.","Alone against the clock. Riders start at intervals (e.g. 1–2 minutes). The fastest time wins. No drafting behind other riders."], cam:[[RX+6,2.2,-4],[RX,1,2]], dur:4,
   set:function(S){ var g=bike(S,"#c0392b"); return {g:g, l:S.st.label("00:00",RX,3,-1,0.8)}; },
   at:function(S, s, p){ onRoad(s.g, RX, 8-p*12); ride(s.g,(p*5)%1); }},
  {t:["Perlumbaan berperingkat & jersi","Stage races and jerseys"], x:["Tour de France dan Tour de Langkawi: banyak peringkat; masa dijumlahkan. Kuning: pendahulu keseluruhan. Hijau: mata pecut. Polka-dot: raja gunung. Putih: pelumba muda terbaik.","The Tour de France and Le Tour de Langkawi: many stages; times are added up. Yellow: overall leader. Green: sprint points. Polka dot: king of the mountains. White: best young rider."], cam:[[RX+7,2.5,4],[RX,1,0]], dur:6,
   set:function(S){ var C=["#f2d13c","#2ecc71","#f5f5f5","#f5f5f5"], B=C.map(function(c,i){ var g=bike(S,c); onRoad(g, RX-2.4+i*1.6, 0); if(i===2){ var b=g.userData.b; for(var k=0;k<5;k++){ var d=new S.T.Mesh(new S.T.SphereGeometry(0.03,6,4), new S.T.MeshBasicMaterial({color:0xd0201f})); d.position.set((k%3-1)*0.09,0.2-Math.floor(k/3)*0.13-0.05,0.13); b.userData.J.chest.add(d); } } return g; });
     var L=[["Kuning","Yellow"],["Hijau","Green"],["Polka-dot","Polka dot"],["Putih","White"]].map(function(n,i){ return S.st.label(S.L2(n[0],n[1]),RX-2.4+i*1.6,2.6,0,0.42); }); return {B:B, L:L}; },
   at:function(S, s, p){ var k=Math.min(3,Math.floor(p*4)); s.B.forEach(function(g,i){ ride(g,(p*3+i*0.2)%1); g.position.y=i===k?0.08:0; }); s.L.forEach(function(l,i){ l.visible=i===k; }); }},
  {t:["Drafting dan peloton","Drafting and the peloton"], x:["Menunggang rapat di belakang pelumba lain menjimatkan hingga ≈ 30% tenaga kerana kurang rintangan angin. Pelumba bergilir-gilir di hadapan.","Riding close behind another rider saves up to ≈ 30% of the effort because there is less wind resistance. Riders take turns at the front."], cam:[[RX+8,4,6],[RX,1,-2]], dur:6,
   set:function(S){ var B=[]; for(var i=0;i<5;i++) B.push(bike(S,KC[2])); return {B:B, l:S.st.label("💨 −30%",RX,2.8,-4,0.7)}; },
   at:function(S, s, p){ var rot=Math.floor(p*5); s.B.forEach(function(g,i){ var k=(i-rot+5)%5, x=RX+(k===4?0.9*Math.sin((p*5%1)*PI):0); onRoad(g, x, -6+k*2.1-(p*5%1)*(k===4?0:0)); ride(g,(p*7+i*0.21)%1); }); }},
  {t:["Pecut dan lead-out","The sprint and the lead-out"], x:["Rakan sepasukan (lead-out) memecut di hadapan, pecut-pecut ditarik di belakangnya, kemudian ke tepi pada ≈ 200 m terakhir supaya pemecut melonjak ke garisan.","A team-mate (the lead-out) sprints in front with the sprinter tucked behind, then pulls aside in the last ≈ 200 m so the sprinter can launch for the line."], cam:[[RX+10,4,-14],[RX,1,-6]], dur:5,
   set:function(S){ return {a:bike(S,"#2a6fb0"), b:bike(S,"#2a6fb0",{helmet:"#f2d13c"}), c:bike(S,"#c0392b"), l:S.st.label("200 m",RX,2.6,-12,0.7)}; },
   at:function(S, s, p){ var q=S.seg(p,0.45,1); onRoad(s.a, RX+q*1.5, 6-p*16-0); onRoad(s.b, RX+0.0, 8.1-p*16-q*q*7); onRoad(s.c, RX-0.9, 10.5-p*16-q*3); [s.a,s.b,s.c].forEach(function(g,i){ ride(g,(p*7+i*0.3)%1); }); }},
  {t:["Velodrom: garisan & kecondongan","The velodrome: lines and banking"], x:["Garisan hitam = garisan ukuran (250 m). Garisan merah = garisan pecut: pendahulu di bawahnya tidak boleh dipintas dari bawah. Garisan biru = garisan stayer. Jalur biru di bawah bukan trek.","Black = the measurement line (250 m). Red = the sprinters' line: a leader below it may not be passed underneath. Blue = the stayers' line. The blue band below is not part of the track."], cam:[[-8,4,-SL/2-12],[-18,2,-SL/2-22]], dur:5,
   set:function(S){ var s0=PI*RI*0.75, a=pt(s0,KM[0]), b=pt(s0,KM[1]), c=pt(s0,KM[2]), d=pt(s0,-1); return {L:[S.st.label(S.L2("Ukuran","Measurement"),a[0],a[1]+1.6,a[2],0.5,"#ffffff"),S.st.label(S.L2("Pecut","Sprinters'"),b[0],b[1]+2.2,b[2],0.5,"#ff8a80"),S.st.label("Stayers'",c[0],c[1]+2.8,c[2],0.5,"#9cc7ff"),S.st.label("Côte d'Azur",d[0],0.8,d[2],0.5,"#9cc7ff")], g:bike(S,KC[3])}; },
   at:function(S, s, p){ var k=Math.min(3,Math.floor(p*4)); s.L.forEach(function(l,i){ l.visible=i<=k; }); var sd=PI*RI*0.75-20+p*40; onTrack(s.g, sd, 3.5); ride(s.g,(p*6)%1); }},
  {t:["Pecut beradu (match sprint)","Match sprint"], x:["2 pelumba, 3 pusingan. Mereka sering perlahan dan 'bermain kucing-tikus' sebelum memecut. Hanya 200 m terakhir dimasa dalam pusingan kelayakan.","2 riders, 3 laps. They often ride slowly and play cat and mouse before sprinting. In qualifying only the last 200 m is timed."], cam:[[0,30,40],[0,0,0]], dur:6,
   set:function(S){ return {a:bike(S,KC[2]), b:bike(S,KC[3])}; },
   at:function(S, s, p){ var slow=S.seg(p,0,0.5), fast=S.seg(p,0.5,1), d=slow*120+fast*fast*250; onTrack(s.a, d, p<0.5?5.5-slow*4:0.5); onTrack(s.b, d-2.5-fast*(-5), p<0.5?6.2-slow*2:1.4); ride(s.a,(d/4)%1); ride(s.b,(d/4)%1); }},
  {t:["Pecut berpasukan (team pursuit)","Team pursuit"], x:["2 pasukan × 4 pelumba bermula di sisi bertentangan trek. 4 km. Masa diambil apabila pelumba ketiga melepasi garisan. Mereka bergilir di hadapan setiap pusingan.","2 teams of 4 start on opposite sides of the track. 4 km. The time is taken on the third rider across the line. They take turns at the front each lap."], cam:[[0,38,48],[0,0,0]], dur:6,
   set:function(S){ var A=[], B=[]; for(var i=0;i<4;i++){ A.push(bike(S,KC[3])); B.push(bike(S,KC[2])); } return {A:A, B:B}; },
   at:function(S, s, p){ var d=p*LAP*1.2; s.A.forEach(function(g,i){ onTrack(g, d-i*2.0, KM[0]+0.2); ride(g,(d/4+i*0.2)%1); }); s.B.forEach(function(g,i){ onTrack(g, d+LAP/2-i*2.0, KM[0]+0.2); ride(g,(d/4+i*0.2)%1); }); }},
  {t:["Keirin","Keirin"], x:["6–7 pelumba di belakang derny (motosikal kecil) yang memecut dari ≈ 30 ke 50 km/j. Tidak boleh memotong derny. Derny keluar ≈ 3 pusingan sebelum tamat, kemudian pecut ke garisan. Jumlah ≈ 2 km (8 pusingan) ⚠.","6–7 riders behind a derny (a small motorbike) that speeds up from ≈ 30 to 50 km/h. Nobody may pass the derny. It pulls off ≈ 3 laps from the end, then it is a sprint to the line. About 2 km (8 laps) ⚠."], cam:[[18,14,-SL/2-40],[0,1,-SL/2-10]], dur:7,
   set:function(S){ var R=[]; for(var i=0;i<6;i++) R.push(bike(S,KC[i])); return {R:R, d:bike(S,"#111111",{engine:true, upright:true, pants:"#111111"})}; },
   at:function(S, s, p){ var d0=p*LAP*2.6, gone=p>0.55; onTrack(s.d, gone?d0*0.9+40:d0, gone?Math.max(-1,0.4-(p-0.55)*12):0.4); ride(s.d,(d0/4)%1);
     s.R.forEach(function(g,i){ var dd=d0-3-i*2.3+(gone?(p-0.55)*(6-i)*30:0); onTrack(g, dd, gone?0.4+((i%3)*1.0)*S.seg(p,0.6,0.8):0.4); ride(g,(dd/4)%1); }); }},
  {t:["Keirin: dari Jepun ke Olimpik","Keirin: from Japan to the Olympics"], x:["Keirin bermula di Jepun pada 1948 dan masih popular di sana. Ia menjadi acara Olimpik sejak Sydney 2000. Malaysia pernah memenangi pingat keirin di peringkat dunia dan Olimpik.","Keirin began in Japan in 1948 and is still hugely popular there. It has been an Olympic event since Sydney 2000. Malaysia has won world and Olympic keirin medals."], cam:[[RI+12,4,-SL/2+8],[RI+3,1.5,-SL/2]], dur:5,
   set:function(S){ var R=[]; for(var i=0;i<4;i++){ var g=bike(S,KC[i+2]); R.push(g); } return {R:R, L:[S.st.label("🇯🇵 1948",RI+3,4.5,-SL/2,0.8),S.st.label("🏅 2000",RI+3,4.5,-SL/2,0.8)]}; },
   at:function(S, s, p){ s.L[0].visible=p<0.5; s.L[1].visible=p>=0.5; s.R.forEach(function(g,i){ var dd=LAP-10+p*20-i*0.6*(1-p); onTrack(g, dd, 0.5+i*1.3); ride(g,(p*6+i*0.25)%1); }); }}],
 quiz:[
  {q:["Dalam keirin, pelumba tidak boleh…","In keirin, riders may not…"], a:[["Memotong derny","Pass the derny"],["Memecut","Sprint"],["Menukar lorong","Change line"]], ok:0, why:["Derny mesti di hadapan hingga ia keluar.","The derny stays in front until it pulls off."]},
  {q:["Jersi kuning dalam Tour de France untuk…","The yellow jersey in the Tour de France is for…"], a:[["Pendahulu keseluruhan","The overall leader"],["Raja gunung","The king of the mountains"],["Pelumba muda terbaik","The best young rider"]], ok:0, why:["Masa keseluruhan paling rendah.","The lowest overall time."]},
  {q:["Kenapa pelumba menunggang rapat (drafting)?","Why do riders ride close together (drafting)?"], a:[["Kurang rintangan angin","Less wind resistance"],["Peraturan wajib","It is a compulsory rule"],["Untuk berbual","To chat"]], ok:0, why:["Jimat hingga ≈ 30% tenaga.","It saves up to ≈ 30% of the effort."]},
  {q:["Keirin bermula di…","Keirin began in…"], a:[["Jepun","Japan"],["Perancis","France"],["Malaysia","Malaysia"]], ok:0, why:["Jepun, 1948.","Japan, 1948."]},
  {q:["Panjang trek velodrom Olimpik ialah…","An Olympic velodrome track is…"], a:[["250 m","250 m"],["400 m","400 m"],["1 km","1 km"]], ok:0, why:["250 m.","250 m."]}],
 game:{ name:["Keirin","Keirin"], help:["Fasa 1, di belakang derny: ketik setiap kali bulatan menyala (ikut rentak) untuk menjimatkan tenaga; ketik salah atau terlepas rentak membazir tenaga. Leret ke atas untuk naik satu kedudukan (guna sedikit tenaga). Fasa 2, derny keluar: ketik untuk melancarkan pecut anda; terlalu awal dan anda akan kehabisan tenaga. Kedudukan 1 terbaik.","Phase 1, behind the derny: tap each time the ring lights up (keep the rhythm) to save energy; off-beat or missed taps waste energy. Swipe up to move up one place (costs a little energy). Phase 2, the derny pulls off: tap to launch your sprint; too early and you will run out of energy. 1st place is best."], unit:["(kedudukan)","(place)"], lower:true,
  cam:[10,8,-SL/2-30], at:[RI,1,-SL/2],
  start:function(G){ var S=G.S, T=S.T; G.dy=bike(S,"#111111",{engine:true, upright:true, pants:"#111111"}); G.R=[]; for(var i=0;i<6;i++) G.R.push({g:bike(S,KC[i]), me:i===3, slot:i, d:0, v:8.3, E:i===3?100:70+Math.random()*25, L:i===3?null:170+Math.random()*170, sus:0, go:false});
   G.me=G.R[3]; G.ring=S.st.label("◯",0,0,0,0.6,"#CBFA1E"); G.total=LAP*6; G.leave=G.total-LAP*2.5; G.dd=0; G.ph=1; G.beat=0; G.tapOk=false; G.fin=[]; G.hu(); },
  step:function(G, dt){ var S=G.S, F=3, sd=Math.min(dt,0.05)*F, i; if(G.done) return;
   if(G.ph===1){ var vd=8.3+(13.9-8.3)*Math.min(1,G.dd/G.leave); G.dd+=vd*sd; G.R.sort(function(a,b){ return a.slot-b.slot; }).forEach(function(r){ var tgt=G.dd-3-r.slot*2.4; r.d+=(tgt-r.d)*Math.min(1,sd*2); r.v=vd; r.w=0.4; });
     G.beat+=dt; if(G.beat>0.9){ G.beat-=0.9; if(!G.tapOk){ G.me.E=Math.max(0,G.me.E-5); G.miss=(G.miss||0)+1; } G.tapOk=false; } var ph=G.beat/0.9, on=ph>0.78||ph<0.1; G.ring.material.color&&G.ring.material.color.set(on?"#CBFA1E":"#55606a"); G.ring.scale.setScalar(on?1.0:0.6);
     if(G.dd>=G.leave){ G.ph=2; S.vib(40); G.hu(S.L2("Derny keluar! Ketik untuk pecut","Derny off! Tap to sprint")); } onTrack(G.dy, G.dd, 0.4); }
   else { G.dd+=11*sd; var dg=Math.max(-1.2,0.4-(G.dd-G.leave)*0.08); onTrack(G.dy, G.dd, dg); G.dy.visible=dg>-1.15;
     G.R.forEach(function(r){ var togo=G.total-r.d; if(!r.me && !r.go && togo<r.L){ r.go=true; r.sus=4+r.E/100*8; } if(r.me && !r.go && togo<60){ r.go=true; r.sus=4+r.E/100*8; }
       var vmax=19*(0.92+0.08*r.E/100); if(r.go && r.sus>0){ r.v=Math.min(vmax, r.v+1.3*sd); r.sus-=sd; } else if(r.go){ r.v=Math.max(13.5, r.v-0.9*sd); } else r.v=Math.min(14.6, r.v+0.4*sd);
       r.d+=r.v*sd; if(r.d>=G.total && G.fin.indexOf(r)<0) G.fin.push(r); });
     G.R.forEach(function(r){ var n=0; G.R.forEach(function(o){ if(o!==r && o.d>r.d && o.d-r.d<2.2) n++; }); r.w=r.w==null?0.4:r.w+((0.4+n*1.2)-r.w)*Math.min(1,sd*2); });
     if(G.fin.indexOf(G.me)>=0){ G.done=true; var pl=G.fin.indexOf(G.me)+1; return G.end(pl, (pl===1?"🏆 ":"")+S.L2("Kedudukan ","Place ")+pl+" / 6 · "+S.L2("Tenaga ","Energy ")+Math.round(G.me.E)+"%"); }
     G.hu(); }
   G.R.forEach(function(r){ onTrack(r.g, r.d, r.w); ride(r.g,(r.d/4.2)%1); }); ride(G.dy,(G.dd/4)%1);
   var me=G.me, a=pt(me.d,me.w), f=pt(me.d+6,me.w), e=E(me.d); S.st.setCam([a[0]-e.ox*7-(f[0]-a[0])*1.0, a[1]+4.5, a[2]-e.oz*7-(f[2]-a[2])*1.0],[f[0],f[1]+0.8,f[2]]);
   G.ring.position.set(a[0],a[1]+2.6,a[2]); if(G.ph===1 && (G.t1=(G.t1||0)+dt)>0.3){ G.t1=0; G.hu(); } },
  tap:function(G){ var S=G.S; if(G.done) return; if(G.ph===1){ var ph=G.beat/0.9, on=ph>0.78||ph<0.1; if(on && !G.tapOk){ G.tapOk=true; G.me.E=Math.min(100,G.me.E+1); S.vib(10); } else { G.me.E=Math.max(0,G.me.E-3); } return; }
   if(!G.me.go){ G.me.go=true; G.me.sus=4+G.me.E/100*8; S.vib(30); } },
  swipe:function(G, dx, dy){ if(G.ph!==1||dy>-0.05) return G.game.tap(G); var me=G.me; if(me.slot===0) return; var o=null; G.R.forEach(function(r){ if(r.slot===me.slot-1) o=r; }); if(o){ o.slot++; me.slot--; me.E=Math.max(0,me.E-6); G.S.vib(20); } } }};
var gm=SPORTS.cycling.game, st0=gm.start, sp0=gm.step; gm.step=function(G, dt, t){ if(!G.h0){ G.h0=1; G.hu(); } sp0(G, dt, t); };
gm.start=function(G){ var S=G.S; G.game=gm;
  G.hu=function(msg){ var me=G.me; if(!me) return S.hud('🚴'); var lapsLeft=Math.max(0,Math.ceil((G.total-me.d)/LAP)), rank=1+G.R.filter(function(r){ return r.d>me.d+0.01; }).length;
    S.hud('🚴 '+S.L2("Pusingan lagi ","Laps to go ")+lapsLeft+' · '+S.L2("Kedudukan ","Place ")+rank+'/6 · ⚡ '+Math.round(me.E)+'% · '+Math.round(me.v*3.6)+' km/h'+(msg?'  ·  '+msg:G.ph===2&&!me.go?'  ·  '+S.L2("Ketik = PECUT!","Tap = SPRINT!"):'')); };
  st0(G); };
})();
