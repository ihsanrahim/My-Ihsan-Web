/* My Ihsan Sports: Athletics. 400 m track: 8 lanes × 1.22 m, straights 84.39 m, inner curve radius ≈ 36.5 m; 100 m start on an extended
   home straight; long-jump runway and pit, high-jump apron, shot circle Ø 2.135 m with a 34.92° sector, javelin runway with an 8 m arc.
   World Athletics rules as of 2026 (⚠ check the current Technical Rules). */
(function(){
"use strict";
var PI=Math.PI, SL=84.39, HS=SL/2, R0=36.5, LW=1.22, NL=8, RM=R0+NL*LW/2, TW=NL*LW, F100=-HS, S100=-HS+100;
function lay(m, y){ if(!m) return m; m.position.y=y; m.material=m.material.clone(); m.material.polygonOffset=true; m.material.polygonOffsetFactor=m.material.polygonOffsetUnits=-Math.round(y*400); return m; }
function lr(l){ return R0+(l-0.5)*LW; } // the running line of lane l (1–8)
function lapLen(l){ return 2*SL+2*PI*lr(l); }
// position along lane l at distance s after the finish line (finish = north end of the home straight, x>0); running direction is -z on the home straight
function P(l, s){ var r=lr(l), c=PI*r, L=lapLen(l); s=((s%L)+L)%L; var a;
  if(s<c){ a=s/r; return [r*Math.cos(a), -HS-r*Math.sin(a), a+PI]; }
  s-=c; if(s<SL) return [-r, -HS+s, 0];
  s-=SL; if(s<c){ a=PI+s/r; return [r*Math.cos(a), HS-r*Math.sin(a), a+PI]; }
  s-=c; return [r, HS-s, PI]; }
function heading(l, s){ var a=P(l,s), b=P(l,s+0.5); return Math.atan2(b[0]-a[0], b[1]-a[1]); }
function at(S, b, l, s){ var q=P(l,s); b.position.x=q[0]; b.position.z=q[1]; b.rotation.y=heading(l,s); }
var KIT=[{top:"#c0392b",pants:"#1f3b5c"},{top:"#2e7d5b",pants:"#2b2f3a"},{top:"#f2c94c",pants:"#2b2f3a"},{top:"#5b8bd9",pants:"#2b2f3a",hijab:"#1f3b5c"},{top:"#f1efe9",pants:"#c0392b"},{top:"#8e44ad",pants:"#2b2f3a"},{top:"#e67e22",pants:"#2b2f3a"},{top:"#16a085",pants:"#2b2f3a",hijab:"#2b2f3a"}];
function ath(S, i){ return S.st.body(S.H, KIT[i%KIT.length]); }
function hurdle(S, x, z, h, w){ var T=S.T, g=new T.Group(), m=new T.MeshLambertMaterial({color:0x8a8f99}), wh=new T.MeshLambertMaterial({color:0xffffff});
  [-1,1].forEach(function(s){ var p=new T.Mesh(new T.BoxGeometry(0.04,h,0.04), m); p.position.set(s*w/2,h/2,0); g.add(p); var f=new T.Mesh(new T.BoxGeometry(0.04,0.03,0.7), m); f.position.set(s*w/2,0.02,0.3); g.add(f); });
  var t=new T.Mesh(new T.BoxGeometry(w,0.07,0.02), wh); t.position.y=h-0.035; g.add(t); g.position.set(x,0,z); S.st.add(g); return g; }
function baton(S, b){ var T=S.T, m=new T.Mesh(new T.CylinderGeometry(0.02,0.02,0.3,8), new T.MeshLambertMaterial({color:0xf2c94c})); m.position.set(0,-0.3,0.05); m.rotation.x=PI/2; b.userData.J.elR.add(m); return m; }
var LJX=-27, LJB=-6, HJ=[0,HS+20], SP=[-6,-HS-14], JV=[16,-6];
SPORTS.athletics={ id:"athletics", v:"2026", H:1.80, cam:[70,55,95], ground:"#3f8a48", fog:[220,700], far:900, near:0.1, groundSize:700,
 field:function(K){ var red="#b5543c", i;
   lay(K.arc(0, -HS, RM, 0, PI, TW, red), 0.01); lay(K.arc(0, HS, RM, PI, 2*PI, TW, red), 0.01); lay(K.rect(TW, SL, red, 0, -RM, 0), 0.01); lay(K.rect(TW, SL+21, red, 0, RM, 10.5), 0.01);
   for(i=0;i<=NL;i++){ var r=R0+i*LW; lay(K.arc(0, -HS, r, 0, PI, 0.05), 0.02); lay(K.arc(0, HS, r, PI, 2*PI, 0.05), 0.02); lay(K.line(-r, -HS, -r, HS, 0.05), 0.02); lay(K.line(r, -HS, r, S100+1, 0.05), 0.02); }
   lay(K.line(R0, F100, R0+TW, F100, 0.3), 0.025); lay(K.line(R0, S100, R0+TW, S100, 0.1), 0.025); K.label("FINISH", RM, 3, F100, 1.4); K.label("100 m", RM, 2.2, S100, 1);
   lay(K.rect(1.22, 40, red, 0, LJX, LJB+20), 0.012); lay(K.rect(2.75, 9, "#e9d8a6", 0, LJX, LJB-4.5), 0.012); lay(K.line(LJX-0.61, LJB, LJX+0.61, LJB, 0.2, "#ffffff"), 0.03); // long jump
   lay(K.dot(HJ[0], HJ[1], 12, red), 0.012); K.post(HJ[0]-2, HJ[1]-3, 2.4, 0.03, "#dddddd"); K.post(HJ[0]+2, HJ[1]-3, 2.4, 0.03, "#dddddd"); K.bar(HJ[0]-2, 2.0, HJ[1]-3, HJ[0]+2, 2.0, HJ[1]-3, 0.015, "#f2c94c");
   var mat=K.rect(5, 3, "#2a6fb0", 0.5, HJ[0], HJ[1]-4.6); // high jump landing mat
   lay(K.dot(SP[0], SP[1], 1.0675, "#9aa3ad"), 0.02); lay(K.arc(SP[0], SP[1], 1.0675, 0, 2*PI, 0.05), 0.03); var sa=34.92*PI/180/2; // shot circle + sector toward -z
   [-1,1].forEach(function(s){ var a=-PI/2+s*sa; lay(K.line(SP[0], SP[1], SP[0]+Math.sin(s*sa)*18, SP[1]-Math.cos(sa)*18, 0.05), 0.03); });
   lay(K.rect(4, 30, red, 0, JV[0], JV[1]+15), 0.012); lay(K.arc(JV[0], JV[1]+8, 8, PI/2-0.25, PI/2+0.25, 0.07), 0.03); var ja=28.96*PI/180/2; [-1,1].forEach(function(s){ lay(K.line(JV[0], JV[1]+8, JV[0]+Math.sin(s*ja)*34, JV[1]+8-Math.cos(ja)*34, 0.05), 0.03); });
   return {w:2*(R0+TW)+4, l:2*(HS+R0+TW)+4}; },
 facts:[[["Trek","Track"],"400 m, 8 × 1.22 m"],[["Bahagian lurus","Straights"],"84.39 m"],[["Jejari selekoh","Bend radius"],"≈ 36.5 m"],[["Bulatan lontar peluru","Shot circle"],"Ø 2.135 m, 34.92°"],[["Larian lembing","Javelin runway"],"≥ 30 m × 4 m"],[["Had angin (rekod)","Wind limit (records)"],"+2.0 m/s"],[["Zon pertukaran baton","Baton exchange zone"],"30 m"]],
 zones:[
  {n:["Trek 8 lorong","8-lane track"], d:["Larian 100 m hingga 10 000 m. Setiap lorong 1.22 m lebar. Lorong 1 di dalam ialah tepat 400 m.","Races from 100 m to 10,000 m. Each lane is 1.22 m wide. Lane 1, on the inside, is exactly 400 m."], p:[[R0,-HS],[R0+TW,-HS],[R0+TW,HS],[R0,HS]]},
  {n:["Garisan penamat","Finish line"], d:["Masa diambil apabila batang badan (torso) pelari melepasi tepi garisan penamat.","The time is taken when the runner's torso reaches the edge of the finish line."], p:[[R0,F100-1.5],[R0+TW,F100-1.5],[R0+TW,F100+1.5],[R0,F100+1.5]]},
  {n:["Lompat jauh","Long jump"], d:["Lari di landasan, lompat dari papan, mendarat dalam pasir. Ukur dari garisan papan ke kesan terdekat.","Run down the runway, take off from the board, land in the sand. Measured from the board line to the nearest mark."], p:[[LJX-3,LJB-9],[LJX+3,LJB-9],[LJX+3,LJB+40],[LJX-3,LJB+40]]},
  {n:["Lompat tinggi","High jump"], d:["Lompat melepasi palang dengan satu kaki melonjak. 3 cubaan untuk setiap ketinggian.","Clear the bar taking off from one foot. 3 attempts at each height."], p:[[HJ[0]-8,HJ[1]-7],[HJ[0]+8,HJ[1]-7],[HJ[0]+8,HJ[1]+8],[HJ[0]-8,HJ[1]+8]]},
  {n:["Lontar peluru","Shot put"], d:["Tolak peluru dari bulatan 2.135 m. Mesti mendarat dalam sektor 34.92°.","Put the shot from a 2.135 m circle. It must land inside the 34.92° sector."], p:[[SP[0]-6,SP[1]-18],[SP[0]+6,SP[1]-18],[SP[0]+1.5,SP[1]+1.5],[SP[0]-1.5,SP[1]+1.5]]},
  {n:["Lontar lembing","Javelin"], d:["Lari di landasan 4 m dan lontar sebelum lengkok 8 m. Hujung lembing mesti mendarat dahulu.","Run down the 4 m runway and throw before the 8 m arc. The tip must land first."], p:[[JV[0]-2,JV[1]+30],[JV[0]+2,JV[1]+30],[JV[0]+2,JV[1]+6],[JV[0]-2,JV[1]+6]]}],
 cards:[
  {t:["Pecut dan permulaan berperingkat","Sprints and staggered starts"], x:["100 m di bahagian lurus. Dalam 200 m dan 400 m, pelari bermula berperingkat (stagger) supaya setiap orang berlari jarak yang sama walaupun lorong luar lebih panjang. Kekal dalam lorong sendiri.","The 100 m is run on the straight. In the 200 m and 400 m the start is staggered so that everyone runs the same distance even though outer lanes are longer. Stay in your own lane."], cam:[[0,26,-HS-58],[0,0,-HS-22]], dur:6,
   set:function(S){ var A=[]; for(var l=1;l<=NL;l++){ var b=ath(S,l-1); A.push(b); } return {A:A}; },
   at:function(S, s, p){ s.A.forEach(function(b,i){ var l=i+1, st=lapLen(l)-400, d=S.seg(p,0.25,1)*90; at(S,b,l,st+d+0.0001); S.pose(b,d>0?"sprint":"ready",(d/4.4)%1); }); }},
  {t:["Permulaan palsu = batal","False start = disqualified"], x:["Pelari tidak boleh bergerak selepas 'Set' sebelum tembakan pistol. Satu permulaan palsu dan pelari itu dibatalkan (DQ) ⚠.","No movement after 'Set' before the gun. One false start and that athlete is disqualified (DQ) ⚠."], cam:[[RM+8,2.5,S100-2],[RM,0.5,S100+0.5]], dur:4,
   set:function(S){ var A=[]; for(var l=3;l<=6;l++){ var b=ath(S,l); at(S,b,l,lapLen(l)-100); A.push(b); } return {A:A, d:S.st.label("DQ",lr(4),2.6,S100,0.9,"#ff6b6b"), s:S.st.label("SET…",RM,3.4,S100+3,0.8)}; },
   at:function(S, s, p){ s.A.forEach(function(b,i){ var l=i+3; at(S,b,l,lapLen(l)-100+(i===1?S.seg(p,0.3,0.6)*3:0)); S.pose(b,i===1&&p>0.3?"sprint":"ready",(p*5)%1); b.rotation.x=(i===1&&p>0.3)?0:0.5; }); S.u.show(s.s,p<0.3); S.u.show(s.d,p>0.6); }},
  {t:["Jarak sederhana dan jauh","Middle and long distance"], x:["800 m: lorong sendiri hingga hujung selekoh pertama (garisan pecah lorong), kemudian boleh masuk ke lorong 1. 1500 m ke atas bermula dengan garisan lengkung tanpa lorong.","800 m: stay in lanes until the end of the first bend (the break line), then cut in to lane 1. 1500 m and longer start from a curved line with no lanes."], cam:[[-R0-22,12,-HS+22],[-R0,0,-HS-6]], dur:5,
   set:function(S){ var A=[]; for(var l=1;l<=6;l++) A.push(ath(S,l)); return {A:A, br:lay(S.u.strip(-R0,-HS,-R0-TW,-HS,0.15,"#2ecc71"),0.04)}; },
   at:function(S, s, p){ var r1=lr(1), d=p*(PI*r1+60); s.A.forEach(function(b,i){ var l=i+1; if(d<PI*r1){ at(S,b,l,PI*(lr(l)-r1)+d); }
     else { var u=d-PI*r1, c=S.ease(S.seg(u,0,30)), r=lr(l)+(r1+(i%2)*0.7-lr(l))*c; b.position.x=-r; b.position.z=-HS+u-i*0.9*c; b.rotation.y=Math.atan2(-(r1-lr(l))*0.0, 1); }
     S.pose(b,"run",(d/3+i*0.2)%1); }); }},
  {t:["Lari berpagar","Hurdles"], x:["110 m berpagar (lelaki, 1.067 m), 100 m berpagar (wanita, 0.838 m), 400 m berpagar. 10 pagar. Menjatuhkan pagar tidak salah kecuali dengan sengaja atau dengan tangan.","110 m hurdles (men, 1.067 m), 100 m hurdles (women, 0.838 m) and 400 m hurdles. 10 hurdles. Knocking one down is not a foul unless deliberate or with the hand."], cam:[[RM+16,6,S100-26],[RM,0.5,S100-30]], dur:5,
   set:function(S){ var H=[]; for(var i=0;i<6;i++) H.push(hurdle(S,lr(4),S100-13.72-i*9.14,1.067,1.1)); return {b:ath(S,4), H:H}; },
   at:function(S, s, p){ var d=p*62, z=S100-d, b=s.b; b.position.set(lr(4),0,z); b.rotation.y=PI; var near=99; s.H.forEach(function(h){ var dz=z-h.position.z; if(Math.abs(dz)<Math.abs(near)) near=dz; });
     var j=Math.abs(near)<1.6?Math.cos(near/1.6*PI/2):0; b.position.y=j*0.45; S.pose(b,j>0.1?"jump":"sprint",j>0.1?0.5:(d/4.4)%1); }},
  {t:["Lari berganti-ganti","Relays"], x:["4 × 100 m dan 4 × 400 m. Baton mesti bertukar tangan di dalam zon pertukaran 30 m. Baton terjatuh mesti dikutip oleh pelari yang menjatuhkannya.","4 × 100 m and 4 × 400 m. The baton must change hands inside the 30 m exchange zone. A dropped baton must be picked up by the runner who dropped it."], cam:[[RM+12,5,10],[RM,0.5,2]], dur:5,
   set:function(S){ var a=ath(S,2), b=ath(S,2), bt=baton(S,a); return {a:a, b:b, bt:bt, z:lay(S.u.zone(lr(4)-0.6,-13,lr(4)+0.6,17,"#f2c94c",0.35),0.04), bt2:baton(S,b)}; },
   at:function(S, s, p){ var za=28-p*36, zb=12-S.seg(p,0.15,1)*26; s.a.position.set(lr(4),0,za); s.b.position.set(lr(4)-0.25,0,zb); s.a.rotation.y=s.b.rotation.y=PI; S.pose(s.a,"sprint",(p*7)%1); S.pose(s.b,zb<12?"sprint":"ready",(p*7)%1);
     var pass=p>0.55; s.bt.visible=!pass; s.bt2.visible=pass; }},
  {t:["Lompat jauh dan lompat kijang","Long jump and triple jump"], x:["Lompat dari papan; jika jari kaki melepasi garisan papan, cubaan itu batal (bendera merah). Lompat kijang: hop, step, jump. Biasanya 3 cubaan, 3 terbaik dapat 3 lagi.","Take off from the board; if the toe goes past the board line the attempt is a foul (red flag). Triple jump: hop, step, jump. Usually 3 attempts, the best 8 get 3 more."], cam:[[LJX+9,3,LJB+4],[LJX,0.5,LJB-2]], dur:4,
   set:function(S){ return {b:ath(S,3), l:S.st.label("7.95 m",LJX,2.6,LJB-5,0.7)}; },
   at:function(S, s, p){ var b=s.b, z=LJB+18-S.seg(p,0,0.55)*18, j=S.seg(p,0.55,0.85); if(j>0) z=LJB-j*7.95; b.position.set(LJX,j>0?Math.sin(j*PI)*1.0:0,z); b.rotation.y=PI; S.pose(b,j>0?"jump":"sprint",j>0?j:(z/4.4)%1); S.u.show(s.l,p>0.86); }},
  {t:["Lompat tinggi dan lompat bergalah","High jump and pole vault"], x:["Lompat tinggi mesti melonjak dengan satu kaki. Setiap ketinggian ada 3 cubaan; 3 gagal berturut-turut = tersingkir. Lompat bergalah sama, dengan galah.","High jump must take off from one foot. Each height has 3 attempts; 3 failures in a row and you are out. Pole vault works the same way, with a pole."], cam:[[HJ[0]+8,3,HJ[1]-1],[HJ[0],1.2,HJ[1]-3]], dur:4,
   set:function(S){ return {b:ath(S,6), l:S.st.label("2.00 m ✓",HJ[0],3.2,HJ[1]-3,0.7,"#7CFC9A")}; },
   at:function(S, s, p){ var b=s.b, q=S.seg(p,0,0.5), j=S.seg(p,0.5,0.85); if(j<=0){ var a=-PI*0.15+q*PI*0.15; b.position.set(HJ[0]+Math.sin(a)*8-6+q*6, 0, HJ[1]+4-q*7+(1-q)*2); b.rotation.y=PI*0.8; S.pose(b,"sprint",(q*6)%1); b.rotation.x=0; }
     else { b.position.set(HJ[0]+0.2, Math.sin(j*PI)*2.0+0.2*j, HJ[1]-2-j*2.4); b.rotation.y=0; b.rotation.x=-j*PI*0.9; S.pose(b,"jump",0.5); } S.u.show(s.l,p>0.86); }},
  {t:["Acara balingan","Throws"], x:["Lontar peluru, cakera, tukul besi dan lembing. Alat mesti mendarat dalam sektor. Atlet tidak boleh keluar dari hadapan bulatan (atau melepasi lengkok lembing) sebelum alat mendarat.","Shot put, discus, hammer and javelin. The implement must land inside the sector. The athlete may not leave the front of the circle (or cross the javelin arc) before it lands."], cam:[[SP[0]+7,3.5,SP[1]+6],[SP[0],0.8,SP[1]-6]], dur:4,
   set:function(S){ var b=ath(S,1); b.position.set(SP[0],0,SP[1]+0.6); b.rotation.y=PI; var sh=S.st.ball(0.12,"#555c66"); return {b:b, sh:sh, l:S.st.label("21.50 m",SP[0],2,SP[1]-15,0.7)}; },
   at:function(S, s, p){ S.pose(s.b,"shoot",S.seg(p,0.1,0.4)); s.b.position.z=SP[1]+0.6-S.seg(p,0,0.35)*1.2; if(p<0.35) s.sh.position.set(SP[0]+0.2,1.65,s.b.position.z); else S.u.arc(s.sh,[SP[0]+0.2,2,SP[1]-0.7],[SP[0]+0.5,0.06,SP[1]-15],5,S.seg(p,0.35,0.85)); S.u.show(s.l,p>0.86); }},
  {t:["Acara gabungan","Combined events"], x:["Dekatlon (10 acara, 2 hari) dan heptatlon (7 acara). Setiap keputusan ditukar kepada mata menggunakan jadual rasmi; jumlah mata tertinggi menang.","Decathlon (10 events over 2 days) and heptathlon (7 events). Each result is turned into points using official tables; the highest total wins."], cam:[[0,4,10],[0,1.6,0]], dur:6,
   set:function(S){ var b=ath(S,7); b.position.set(-1.6,0,0); var E=["100 m","Long jump","Shot put","High jump","400 m","110 m H","Discus","Pole vault","Javelin","1500 m"].map(function(e,i){ return S.st.label((i+1)+". "+e,1.5,3.4,0,0.6); }); return {b:b, E:E}; },
   at:function(S, s, p){ var k=Math.min(9,Math.floor(p*10)); s.E.forEach(function(e,i){ e.visible=i===k; }); S.pose(s.b,["sprint","jump","shoot","jump","sprint","jump","shoot","jump","shoot","run"][k],(p*10)%1); }},
  {t:["Rekod dan had angin","Records and the wind limit"], x:["Untuk pecut (hingga 200 m) dan lompat jauh/kijang, rekod tidak sah jika angin dari belakang melebihi +2.0 m/s. Tolok angin mengukur semasa larian.","In sprints (up to 200 m) and the long and triple jumps, a record does not count if the tailwind is more than +2.0 m/s. A wind gauge measures it during the race."], cam:[[RM+10,3,F100+20],[RM,1,F100+8]], dur:5,
   set:function(S){ var g=S.st.body(1.2,{top:"#dddddd",pants:"#dddddd"}); g.position.set(R0-1,0,F100+30); return {L:[S.st.label("+1.4 m/s ✓",R0-1,2.2,F100+30,0.7,"#7CFC9A"), S.st.label("+2.6 m/s ✗",R0-1,2.2,F100+30,0.7,"#ff6b6b")], A:[ath(S,0),ath(S,1)]}; },
   at:function(S, s, p){ var k=p<0.5?0:1, q=(p*2)%1; s.L[0].visible=!k; s.L[1].visible=!!k; s.A.forEach(function(b,i){ b.position.set(lr(4+i),0,F100+40-q*45); b.rotation.y=PI; S.pose(b,"sprint",(q*8+i*0.3)%1); }); }}],
 quiz:[
  {q:["Berapa permulaan palsu sebelum DQ?","How many false starts before a DQ?"], a:[["Satu","One"],["Dua","Two"],["Tiga","Three"]], ok:0, why:["Satu permulaan palsu = batal.","One false start = disqualified."]},
  {q:["Zon pertukaran baton panjangnya…","The baton exchange zone is…"], a:[["30 m","30 m"],["10 m","10 m"],["50 m","50 m"]], ok:0, why:["30 m.","30 m."]},
  {q:["Rekod pecut tidak sah jika angin belakang melebihi…","A sprint record does not count if the tailwind is over…"], a:[["+2.0 m/s","+2.0 m/s"],["+5.0 m/s","+5.0 m/s"],["Tiada had","There is no limit"]], ok:0, why:["+2.0 m/s.","+2.0 m/s."]},
  {q:["Lompat tinggi: berapa cubaan bagi setiap ketinggian?","High jump: how many attempts at each height?"], a:[["3","3"],["1","1"],["5","5"]], ok:0, why:["3 cubaan.","3 attempts."]},
  {q:["Kenapa 400 m bermula berperingkat?","Why is the 400 m start staggered?"], a:[["Supaya semua berlari jarak sama","So everyone runs the same distance"],["Untuk kamera","For the cameras"],["Pelari terbaik di hadapan","The best runner goes in front"]], ok:0, why:["Lorong luar lebih panjang di selekoh.","Outer lanes are longer on the bends."]}],
 game:{ name:["Pecut 100 m","100 m sprint"], help:["Tunggu 'BANG!' dan ketik untuk bermula; terlalu awal, atau dalam 0.100 s, = permulaan palsu (dalam perlumbaan sebenar, terus DQ). Kemudian ketik kiri dan kanan skrin berselang-seli secepat mungkin. Masa paling rendah menang.","Wait for 'BANG!' and tap to start; too early, or within 0.100 s, = false start (in a real race that is an instant DQ). Then tap the left and right of the screen in turn as fast as you can. The lowest time wins."], unit:["s","s"], lower:true,
  cam:[RM-14,3,S100-4], at:[RM,1,S100-6],
  start:function(G){ var S=G.S; G.me=ath(S,3); G.R=[]; for(var l=1;l<=NL;l++){ if(l===4) continue; G.R.push({b:ath(S,l-1), l:l, v:9.0+Math.random()*1.0+(l===5?0.4:0), d:0, re:0.13+Math.random()*0.08}); } G.fs=0; G.ready(); },
  step:function(G, dt){ var S=G.S, f=G.f; if(!f) return; f.t+=dt;
   if(f.k==="set"){ if(f.t>f.gun){ f.k="go"; f.t=0; f.rt=null; G.hu("💥 BANG!"); S.vib(30); } return; }
   if(f.k!=="go"&&f.k!=="fin") return; var run=f.rt!=null;
   if(run){ G.v=Math.max(0, G.v-G.v*0.55*dt-0.6*dt); G.d+=G.v*dt; } G.R.forEach(function(r){ if(f.t>r.re){ var acc=Math.min(1,(f.t-r.re)/2.2); r.d=Math.min(100.5,r.d+r.v*(0.45+0.55*acc)*dt); } r.b.position.set(lr(r.l),0,S100-r.d); S.pose(r.b,r.d>0?"sprint":"ready",(r.d/4.4)%1); r.b.rotation.x=r.d>0?0:0.5; });
   G.me.position.set(lr(4),0,S100-G.d); S.pose(G.me,G.d>0||run?"sprint":"ready",(G.d/4.4)%1); G.me.rotation.x=run?0:0.5; var z=S100-G.d; S.st.setCam([RM-13,3,z+3],[RM,1,z-5]);
   if(f.k==="go"){ if(G.d>=100){ f.k="fin"; var tm=f.t, pl=1+G.R.filter(function(r){ return r.fin!=null&&r.fin<tm; }).length; G.R.forEach(function(r){ if(r.fin==null) r.fin=99; }); G.place=pl; return G.end(Math.round(tm*100)/100, tm.toFixed(2)+" s · "+S.L2("Kedudukan ","Place ")+pl+" / 8 · "+S.L2("Reaksi ","Reaction ")+f.rt.toFixed(3)+" s"); }
     G.R.forEach(function(r){ if(r.d>=100&&r.fin==null) r.fin=f.t; }); if(f.t>25) return G.end(99, S.L2("Terlalu perlahan","Too slow")); G.hu((f.rt==null?"💥 BANG! ":"")+G.d.toFixed(0)+" m · "+f.t.toFixed(2)+" s · "+(G.v*3.6).toFixed(0)+" km/h"); } },
  tap:function(G, e){ var S=G.S, f=G.f; if(!f) return; if(f.k==="set"){ G.fs++; G.f=null; S.vib(80); G.hu(S.L2("PERMULAAN PALSU! (Sebenarnya DQ.) Semula…","FALSE START! (A real race: DQ.) Again…")); setTimeout(function(){ if(!G.over) G.ready(); },1600); return; }
   if(f.k!=="go") return; var side=0; try{ var r=S.st.cnv.getBoundingClientRect(); side=(e&&e.clientX!=null&&e.clientX<r.left+r.width/2)?-1:1; }catch(x){ side=1; }
   if(f.rt==null){ if(f.t<0.1){ G.fs++; G.f=null; S.vib(80); G.hu(S.L2("Reaksi bawah 0.100 s = permulaan palsu! Semula…","Reaction under 0.100 s = false start! Again…")); setTimeout(function(){ if(!G.over) G.ready(); },1600); return; } f.rt=f.t; G.v=2.5; G.last=side; return; } var good=side!==G.last; G.last=side; G.v=Math.min(12.2, G.v+(12.4-G.v)*(good?0.2:0.07)); },
  swipe:function(G, dx, dy, dtm){ G.game.tap(G, null, dtm); } }};
var gm=SPORTS.athletics.game, st0=gm.start, sp0=gm.step; gm.step=function(G, dt, t){ if(!G.h0){ G.h0=1; G.hu(); } sp0(G, dt, t); };
gm.start=function(G){ var S=G.S; G.game=gm;
  G.hu=function(msg){ S.hud('🏃 '+(msg||S.L2("Sedia…","On your marks…"))+(G.fs?' · ⚠ '+G.fs:'')); };
  G.ready=function(){ G.d=0; G.v=0; G.R.forEach(function(r){ r.d=0; r.fin=null; r.b.position.set(lr(r.l),0,S100); r.b.rotation.y=PI; r.b.rotation.x=0.5; S.pose(r.b,"ready",0); });
    G.me.position.set(lr(4),0,S100); G.me.rotation.y=PI; G.me.rotation.x=0.5; S.pose(G.me,"ready",0); S.st.setCam([RM-13,3,S100+3],[RM,1,S100-5],true);
    G.f={k:"set", t:0, gun:2.2+Math.random()*2.2}; G.hu(S.L2("Sedia… SET…","On your marks… SET…")); };
  st0(G); };
})();
