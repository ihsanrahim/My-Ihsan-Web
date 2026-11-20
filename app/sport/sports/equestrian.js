/* My Ihsan Sports: Equestrian (dressage and show jumping). Large dressage arena 20 × 60 m with letters A K V E S H C M R B P F; show-jumping fences up to about 1.60 m at the top level.
   FEI Dressage Rules and FEI Jumping Rules, rules as of 2026.
   The Sunnah note is placeholder text until the ustaz adds the reviewed hadith and reference (notes/MEMORY.md: religious text needs review).
   The horse is made of simple shapes; the rider has no face. */
(function(){
"use strict";
var W=20, L=60, HL=30, PI=Math.PI;
var LET=[["K",-10,-24],["V",-10,-12],["E",-10,0],["S",-10,12],["H",-10,24],["F",10,-24],["P",10,-12],["B",10,0],["R",10,12],["M",10,24],["A",0,-HL-1.2],["C",0,HL+1.2]];
function horse(S, col){ var T=S.T, g=new T.Group(), m=new T.MeshLambertMaterial({color:new T.Color(col||"#7a4a2a")}), dk=new T.MeshLambertMaterial({color:0x2a1a12});
  function cap(r, len){ return new T.Mesh(new T.CapsuleGeometry(r, Math.max(0.01,len-2*r), 4, 10), m); }
  var bd=cap(0.36, 1.9); bd.rotation.x=PI/2; bd.position.set(0,1.25,0); g.add(bd);
  var nk=cap(0.19, 0.95); nk.rotation.x=0.65; nk.position.set(0,1.62,0.95); g.add(nk);
  var hd=new T.Mesh(new T.BoxGeometry(0.22,0.26,0.6), m); hd.rotation.x=0.75; hd.position.set(0,1.88,1.3); g.add(hd);
  [-0.07,0.07].forEach(function(x){ var e=new T.Mesh(new T.ConeGeometry(0.04,0.13,6), m); e.position.set(x,2.12,1.15); g.add(e); });
  var mn=new T.Mesh(new T.BoxGeometry(0.05,0.12,0.9), dk); mn.rotation.x=0.65; mn.position.set(0,1.82,0.85); g.add(mn);
  var tl=new T.Mesh(new T.CapsuleGeometry(0.07,0.6,4,8), dk); tl.rotation.x=-0.5; tl.position.set(0,1.05,-1.2); g.add(tl);
  var sd=new T.Mesh(new T.BoxGeometry(0.76,0.06,0.55), new T.MeshLambertMaterial({color:0x2b2f3a})); sd.position.set(0,1.6,0.05); g.add(sd);
  var legs=[]; [[-0.19,0.62],[0.19,0.62],[-0.19,-0.68],[0.19,-0.68]].forEach(function(q, i){ var hp=new T.Group(); hp.position.set(q[0],1.12,q[1]); g.add(hp);
    var up=cap(0.085,0.58); up.position.y=-0.29; hp.add(up); var kn=new T.Group(); kn.position.y=-0.56; hp.add(kn); var lo=cap(0.055,0.52); lo.position.y=-0.26; kn.add(lo);
    var hf=new T.Mesh(new T.BoxGeometry(0.12,0.08,0.14), dk); hf.position.y=-0.52; kn.add(hf); legs.push({hp:hp, kn:kn, fr:i<2}); });
  g.userData.legs=legs; S.st.add(g); return g; }
// gait: 0 stand, 1 walk, 2 trot, 3 canter; p = phase 0..1
function gait(h, k, p){ var O=k===1?[0,0.5,0.75,0.25]:k===2?[0,0.5,0.5,0]:[0.1,0.2,0.55,0.45], A=[0,0.35,0.5,0.7][k]||0;
  h.userData.legs.forEach(function(l, i){ var s=Math.sin((p+O[i])*PI*2); l.hp.rotation.x=s*A*(l.fr?1:0.85); l.kn.rotation.x=(l.fr?-1:1)*Math.max(0,-Math.cos((p+O[i])*PI*2))*A*1.3; }); }
function tuck(h, q){ h.userData.legs.forEach(function(l){ if(l.fr){ l.hp.rotation.x=-0.9*q; l.kn.rotation.x=-1.6*q; } else { l.hp.rotation.x=0.5*q; l.kn.rotation.x=0.9*q; } }); }
function rider(S, h, col){ var b=S.st.body(1.7, {top:col||"#1f3b5c", pants:"#e9e6df", shoe:"#2b2f3a"}); h.add(b); sit(S, b); b.position.set(0, 1.62-b.userData.J.hip.position.y, -0.05);
  var T=S.T, hm=new T.Mesh(new T.SphereGeometry(0.135,12,8,0,PI*2,0,PI/2), new T.MeshLambertMaterial({color:0x2b2f3a})); hm.position.y=0.17; b.userData.J.neck.add(hm); return b; }
function sit(S, b){ S.pose(b,"idle",0); var J=b.userData.J; J.hpL.rotation.set(-1.25,0,-0.45); J.hpR.rotation.set(-1.25,0,0.45); J.knL.rotation.set(1.5,0,0); J.knR.rotation.set(1.5,0,0); J.shL.rotation.set(-0.7,0,-0.1); J.shR.rotation.set(-0.7,0,0.1); J.elL.rotation.set(-0.9,0,0); J.elR.rotation.set(-0.9,0,0); }
function fence(S, z, h, c){ var T=S.T, g=new T.Group(), wm=new T.MeshLambertMaterial({color:0xf1efe9}), pm=new T.MeshLambertMaterial({color:new T.Color(c||"#d64545")}), wm2=new T.MeshLambertMaterial({color:0xf1efe9});
  [-1.9,1.9].forEach(function(x){ var w=new T.Mesh(new T.BoxGeometry(0.12,h+0.35,0.12), wm); w.position.set(x,(h+0.35)/2,0); g.add(w); });
  var P=[]; [h*0.45, h].forEach(function(y, i){ var p=new T.Mesh(new T.CylinderGeometry(0.05,0.05,3.6,10), i%2?pm:wm2); p.rotation.z=PI/2; p.position.set(0,y,0); g.add(p); P.push(p); });
  g.position.z=z; g.userData.top=P[1]; g.userData.h=h; S.st.add(g); return g; }
SPORTS.equestrian={ id:"equestrian", v:"2026", H:1.7, cam:[24,14,-30], ground:"#5d8a4a",
 field:function(K){ K.rect(W+10, L+12, "#5d8a4a"); K.rect(W, L, "#c9a56e", 0.002); K.lineW=0.12; K.box(-W/2,-HL,W/2,HL,0.14,"#f1efe9");
   LET.forEach(function(q){ var x=q[1]+(q[1]<0?-0.7:q[1]>0?0.7:0); K.post(x, q[2], 0.55, 0.22, "#f1efe9"); K.label(q[0], x, 1.05, q[2], 0.8, "#1f3b5c"); });
   K.line(0,-HL,0,HL,0.04,"#b38f58"); K.dot(0,0,0.35,"#b38f58"); return {w:W+3,l:L+3}; },
 facts:[[["Arena dressage (besar)","Dressage arena (large)"],"20 × 60 m"],[["Huruf","Letters"],"A K V E S H C M R B P F"],[["Pagar (peringkat tertinggi)","Fences (top level)"],"≈ 1.60 m"],[["Jatuh palang / ingkar","Rail down / refusal"],"4 kesalahan / faults"],[["Topi keledar","Helmet"],"Wajib / Required"]],
 zones:[
  {n:["Pintu masuk A","Entry at A"], d:["Penunggang masuk di A dan bergerak di garisan tengah ke arah C.","The rider enters at A and rides the centre line towards C."], p:[[-2,-HL-2.5],[2,-HL-2.5],[2,-HL+2],[-2,-HL+2]]},
  {n:["Garisan tengah (X)","Centre line (X)"], d:["X ialah titik tengah arena. Ujian dressage selalu bermula dan berakhir dengan salam di garisan tengah.","X is the middle of the arena. A dressage test starts and ends with a halt and salute on the centre line."], p:[[-1,-HL+2],[1,-HL+2],[1,HL-2],[-1,HL-2]]},
  {n:["Trek sisi K–H","Long side K–H"], d:["Trek di sepanjang huruf K V E S H. Pergerakan bermula dan berakhir pada huruf.","The track along K V E S H. Movements start and finish at the letters."], p:[[-10,-24],[-7,-24],[-7,24],[-10,24]]},
  {n:["Trek sisi F–M","Long side F–M"], d:["Trek di sepanjang huruf F P B R M.","The track along F P B R M."], p:[[7,-24],[10,-24],[10,24],[7,24]]}],
 cards:[
  {t:["🕌 Sukan sunnah","🕌 A Sunnah sport"], x:["Menunggang kuda termasuk sukan yang digalakkan dalam tradisi Islam, bersama memanah dan berenang. (Teks hadis dan rujukan akan ditambah selepas disemak oleh ustaz.)","Horse riding is among the sports encouraged in the Islamic tradition, together with archery and swimming. (The hadith text and reference will be added after review by the ustaz.)"], cam:[[10,4.5,-9],[0,1.2,0]], dur:6,
   set:function(S){ var h=horse(S); rider(S,h,"#2e7d5b"); return {h:h}; }, at:function(S, s, p){ var a=p*PI*2; s.h.position.set(Math.sin(a)*3.5,0,Math.cos(a)*3.5); s.h.rotation.y=a+PI/2; gait(s.h,2,(p*8)%1); }},
  {t:["Arena dan huruf","The arena and its letters"], x:["Arena dressage besar 20 × 60 m. Huruf di tepi menunjukkan di mana setiap pergerakan bermula dan berakhir.","The large dressage arena is 20 × 60 m. Letters around the edge show where each movement starts and ends."], cam:[[0,48,-30],[0,0,0]], dur:4, set:function(){ return {}; }, at:function(){}},
  {t:["Langkah: jalan, trot, canter","Gaits: walk, trot, canter"], x:["Jalan (4 rentak), trot (2 rentak, kaki menyerong berpasangan) dan canter (3 rentak). Lihat bagaimana kaki bergerak.","Walk (4 beats), trot (2 beats, diagonal pairs) and canter (3 beats). Watch how the legs move."], cam:[[6,2,0],[0,1,0]], dur:9,
   set:function(S){ var h=horse(S); rider(S,h); return {h:h, lb:S.st.label("",0,3,0,0.7)}; },
   at:function(S, s, p){ var k=p<0.33?1:p<0.66?2:3, sp=[0,1.6,3.2,5][k]; s.h.position.set(0,0,0); s.h.rotation.y=PI/2; gait(s.h,k,(p*9*[0,0.7,1.3,1.6][k])%1);
     if(s.k!==k){ s.k=k; s.lb.parent.remove(s.lb); s.lb=S.st.label(S.L2(["","Jalan","Trot","Canter"][k],["","Walk","Trot","Canter"][k]),0,3,0,0.7); } }},
  {t:["Markah dressage 0–10","Dressage marks 0–10"], x:["Hakim memberi markah 0 hingga 10 untuk setiap pergerakan. Jumlahnya ditukar kepada peratus: peratus tertinggi menang.","Judges give 0 to 10 for each movement. The total becomes a percentage: the highest percentage wins."], cam:[[0,4,-HL-8],[0,1.5,-10]], dur:4,
   set:function(S){ var h=horse(S); rider(S,h); h.position.z=-10; return {h:h, lb:S.st.label("7.5",0,4,-10,0.9)}; }, at:function(S, s, p){ gait(s.h,0,0); var v=["7.0","7.5","8.0","72.4 %"][Math.min(3,Math.floor(p*4))]; if(s.v!==v){ s.v=v; s.lb.parent.remove(s.lb); s.lb=S.st.label(v,0,4,-10,0.9); } }},
  {t:["Jatuh palang = 4 kesalahan","A rail down is 4 faults"], x:["Dalam lompat halangan, menjatuhkan palang memberi 4 kesalahan. Kesalahan paling sedikit menang.","In show jumping, knocking a rail down gives 4 faults. The fewest faults wins."], cam:[[7,2.5,-4],[0,1,0]], dur:4,
   set:function(S){ var h=horse(S); rider(S,h); var f=fence(S,0,1.2); return {h:h,f:f,lb:S.st.label("+4",0,2.8,0,0.8,"#ff6b6b")}; },
   at:function(S, s, p){ var z=S.lerp(-8,8,p), j=Math.max(0,Math.min(1,(z+2.6)/5.2)); s.h.position.set(0,Math.sin(j*PI)*1.1,z); if(j>0&&j<1) tuck(s.h,Math.sin(j*PI)); else gait(s.h,3,(p*6)%1);
     var t=s.f.userData.top; if(p>0.5){ var q=Math.min(1,(p-0.5)*4); t.position.y=S.lerp(1.2,0.05,q); t.position.z=q*0.5; } else { t.position.set(0,1.2,0); } S.u.show(s.lb,p>0.55); }},
  {t:["Ingkar dan tersasar","Refusals and run-outs"], x:["Kuda berhenti atau mengelak pagar = 4 kesalahan. Ingkar kali kedua dalam satu pusingan = disingkirkan.","The horse stops at or runs past a fence = 4 faults. A second refusal in the round = eliminated."], cam:[[7,2.5,-5],[0,1,0]], dur:4,
   set:function(S){ var h=horse(S); rider(S,h); fence(S,0,1.2); return {h:h, lb:S.st.label("✋ +4",0,2.8,0,0.8,"#ff6b6b")}; },
   at:function(S, s, p){ var q=S.seg(p,0,0.5); s.h.position.set(0,0,S.lerp(-9,-2.2,q)); gait(s.h,q<1?3:0,(p*6)%1); S.u.show(s.lb,p>0.55); }},
  {t:["Had masa","Time allowed"], x:["Setiap pusingan ada had masa. Melebihinya menambah kesalahan masa. Pusingan jump-off: paling sedikit kesalahan, kemudian paling pantas.","Each round has a time allowed. Going over it adds time faults. In a jump-off: fewest faults first, then fastest time."], cam:[[0,4,-HL-6],[0,1.5,-HL+10]], dur:4,
   set:function(S){ return {lb:S.st.label("⏱ 72 s",0,3,-HL+6,1)}; }, at:function(S, s, p){ var v="⏱ "+Math.round(60+p*16)+" s"; if(s.v!==v){ s.v=v; s.lb.parent.remove(s.lb); s.lb=S.st.label(v,0,3,-HL+6,1,p>0.75?"#ff6b6b":"#ffffff"); } }},
  {t:["Jatuh = disingkirkan","A fall eliminates"], x:["Dalam lompat halangan FEI, penunggang atau kuda yang jatuh disingkirkan dari pusingan itu.","In FEI show jumping, a fall of the rider or the horse means elimination from that round."], cam:[[0,4,-8],[0,1,0]], dur:3,
   set:function(S){ return {lb:S.st.label("✗",0,2.4,0,1.4,"#ff6b6b")}; }, at:function(){}},
  {t:["Tiga ujian: eventing","Three tests: eventing"], x:["Eventing menggabungkan dressage, merentas desa (cross-country) dan lompat halangan, dengan kuda yang sama.","Eventing combines dressage, cross-country and show jumping, on the same horse."], cam:[[0,5,-14],[0,2,0]], dur:5,
   set:function(S){ return {a:S.st.label("1 Dressage",-6,2.8,0,0.7), b:S.st.label("2 Cross-country",0,2.8,0,0.7), c:S.st.label("3 Jumping",6,2.8,0,0.7)}; }, at:function(S, s, p){ S.u.show(s.b,p>0.33); S.u.show(s.c,p>0.66); }},
  {t:["Keselamatan & kebajikan kuda","Safety and horse welfare"], x:["Pakai topi keledar dan but bertumit. Kuda mesti sihat dan dijaga dengan baik: kebajikan kuda didahulukan.","Wear a helmet and heeled boots. The horse must be fit and well cared for: horse welfare comes first."], cam:[[4,2.2,4],[0,1.6,0]], dur:4,
   set:function(S){ var h=horse(S,"#d9c7a3"); rider(S,h,"#c0392b"); h.rotation.y=-0.6; return {h:h, lb:S.st.label("⛑️",0,3.1,0,0.8)}; }, at:function(S, s, p){ gait(s.h,0,0); }}],
 quiz:[
  {q:["Saiz arena dressage besar ialah…","The large dressage arena is…"], a:[["20 × 40 m","20 × 40 m"],["20 × 60 m","20 × 60 m"],["30 × 90 m","30 × 90 m"]], ok:1, why:["20 × 60 m (arena kecil 20 × 40 m).","20 × 60 m (the small arena is 20 × 40 m)."]},
  {q:["Menjatuhkan palang memberi…","Knocking a rail down gives…"], a:[["1 kesalahan","1 fault"],["4 kesalahan","4 faults"],["Disingkirkan","Elimination"]], ok:1, why:["4 kesalahan.","4 faults."]},
  {q:["Dalam lompat halangan, siapa menang?","Who wins in show jumping?"], a:[["Paling banyak mata","Most points"],["Paling sedikit kesalahan","Fewest faults"]], ok:1, why:["Paling sedikit kesalahan; seri diputuskan dengan masa jump-off.","Fewest faults; ties go to a timed jump-off."]},
  {q:["Trot ialah langkah…","The trot is a gait of…"], a:[["2 rentak","2 beats"],["3 rentak","3 beats"],["4 rentak","4 beats"]], ok:0, why:["2 rentak, kaki menyerong berpasangan.","2 beats, in diagonal pairs."]},
  {q:["Huruf di tengah arena ialah…","The letter in the middle of the arena is…"], a:[["A","A"],["X","X"],["C","C"]], ok:1, why:["X ialah titik tengah.","X is the middle."]}],
 game:{ name:["Pusingan bersih","Clear round"], help:["Kuda canter ke arah 6 pagar. Ketik untuk melompat bila kuda hampir dengan pagar (bulatan hijau). Terlalu awal atau lewat = palang jatuh, 4 kesalahan. Sasar 0!","The horse canters at 6 fences. Tap to jump when the horse is close to a fence (green mark). Too early or late = a rail down, 4 faults. Aim for 0!"], unit:["kesalahan","faults"], lower:true,
  cam:[6,3.4,-HL-6], at:[0,1.2,-HL+4],
  start:function(G){ var S=G.S; G.h=horse(S); rider(S,G.h); G.z=-HL+2; G.v=7; G.jt=null; G.fl=0; G.F=[-18,-10,-2,6,14,22].map(function(z,i){ var f=fence(S,z,1.0+i*0.06,["#d64545","#2a6fd6","#2e7d5b"][i%3]); f.userData.mk=S.u.strip(-0.8,z-3.4,0.8,z-1.8,1.6,"#CBFA1E"); f.userData.mk.material.opacity=0.35; return f; }); G.k=0; G.ph=0; G.hu(); },
  step:function(G, dt){ var S=G.S, h=G.h; if(!G.h0){ G.h0=1; G.hu(); } G.z+=G.v*dt; G.ph=(G.ph+dt*1.7)%1; h.position.z=G.z;
   if(G.jt!=null){ G.jt+=dt/0.8; var j=Math.min(1,G.jt); h.position.y=Math.sin(j*PI)*1.25; tuck(h,Math.sin(j*PI)); if(j>=1){ G.jt=null; h.position.y=0; } } else gait(h,3,G.ph);
   var f=G.F[G.k]; if(f){ var d=f.position.z-G.z; f.userData.mk.material.opacity=(d<3.4&&d>1.8)?0.85:0.3;
     if(d<0){ var ok=G.tk!=null && G.tk>=1.6 && G.tk<=3.6; f.userData.mk.visible=false; if(!ok){ G.fl+=4; S.vib(70); f.userData.knock=0; G.hu(S.L2("Palang jatuh! +4","Rail down! +4")); } else { S.vib(20); G.hu(S.L2("Bersih!","Clear!")); } G.k++; G.tk=null; } }
   G.F.forEach(function(f){ if(f.userData.knock!=null && f.userData.knock<1){ f.userData.knock=Math.min(1,f.userData.knock+dt*3); var t=f.userData.top; t.position.y=S.lerp(f.userData.h,0.05,f.userData.knock); t.position.z=f.userData.knock*0.6; } });
   S.st.setCam([5.5,3.2,G.z-7],[0,1.2,G.z+4]);
   if(G.z>HL-1 && !G.over){ G.end(G.fl, G.fl===0?S.L2("🏆 Pusingan bersih! 0 kesalahan","🏆 Clear round! 0 faults"):G.fl+" "+S.L2("kesalahan","faults")); } },
  tap:function(G){ if(G.jt!=null||G.over) return; var f=G.F[G.k]; G.tk=f?f.position.z-G.z:null; G.jt=0; }, swipe:function(G){ this.tap(G); } }};
var gm=SPORTS.equestrian.game, st0=gm.start; gm.start=function(G){ var S=G.S; G.hu=function(msg){ S.hud('🐎 '+S.L2("Pagar ","Fence ")+Math.min(6,G.k+1)+'/6 · '+G.fl+' '+S.L2("kesalahan","faults")+(msg?'  ·  '+msg:'')); }; st0(G); };
})();
