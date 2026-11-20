/* My Ihsan Sports: Field hockey. Pitch 91.4 × 55 m; 23 m lines; shooting circle 14.63 m from the goal posts; penalty spot 6.475 m
   from the goal; goal 3.66 × 2.14 m; ball Ø ≈ 7.3 cm. FIH Rules of Hockey, rules as of 2026 (⚠ card times and match length: check the
   current FIH edition). */
(function(){
"use strict";
var PI=Math.PI, L=91.4, W=55, HL=45.7, Q=22.9, CR=14.63, GW=3.66, GH=2.14, PS=6.475, B=0.073;
function stick(S, b){ var T=S.T, g=new T.Group(), m=new T.MeshLambertMaterial({color:0x2b2f3a}), hk=new T.MeshLambertMaterial({color:0xc9a646});
  var sh=new T.Mesh(new T.CylinderGeometry(0.018,0.016,0.9,6), m); sh.position.y=0.5; g.add(sh);
  var h=new T.Mesh(new T.TorusGeometry(0.05,0.018,5,10,PI), hk); h.position.set(0.05,0.06,0); h.rotation.z=PI; g.add(h);
  g.position.set(0.28,0,0.32); g.rotation.x=-0.45; b.add(g); return g; }
function hb(S){ return S.st.ball(B*2.2, "#ffffff"); }
// the shooting circle: two quarter circles round the posts joined by a straight 3.66 m line
function circ(K, z, s){ // s=+1: circle opens toward +z (goal at -z end)
  if(s>0){ K.arc(-GW/2, z, CR, PI, PI*1.5); K.arc(GW/2, z, CR, PI*1.5, PI*2); }
  else { K.arc(-GW/2, z, CR, PI/2, PI); K.arc(GW/2, z, CR, 0, PI/2); }
  K.line(-GW/2, z+s*CR, GW/2, z+s*CR); K.dot(0, z+s*PS, 0.15); }
function zoneCircle(z, s){ var p=[], i, a; for(i=0;i<=8;i++){ a=PI-i/8*PI/2; p.push([-GW/2+Math.cos(a)*CR, z+s*Math.sin(a)*CR]); }
  for(i=0;i<=8;i++){ a=PI/2-i/8*PI/2; p.push([GW/2+Math.cos(a)*CR, z+s*Math.sin(a)*CR]); } return p; }
SPORTS.hockey={ id:"hockey", v:"2026", H:1.80, cam:[34,30,44], ground:"#2f6f9e", sky:"#a9d6ef",
 field:function(K){ K.rect(W, L, "#2f8f5a", 0); K.lineW=0.075;
   K.box(-W/2,-HL,W/2,HL); K.line(-W/2,0,W/2,0); [-1,1].forEach(function(s){ K.line(-W/2,s*(HL-Q),W/2,s*(HL-Q)); var z=-s*HL; circ(K, z, s); K.goal(z, GW, GH, 1.2, -s); }); return {w:W, l:L}; },
 facts:[[["Padang","Pitch"],"91.4 × 55 m"],[["Garisan 23 m","23 m lines"],"22.9 m"],[["Bulatan menjaring","Shooting circle"],"14.63 m"],[["Titik penalti","Penalty spot"],"6.475 m"],[["Gol","Goal"],"3.66 × 2.14 m"],[["Bola","Ball"],"Ø ≈ 7.3 cm, 156–163 g"],[["Masa","Time"],"4 × 15 min ⚠"]],
 zones:[
  {n:["Bulatan menjaring","Shooting circle (the D)"], d:["Gol hanya sah jika bola dipukul oleh penyerang dari dalam bulatan ini.","A goal only counts if an attacker played the ball from inside this circle."], p:zoneCircle(-HL, 1)},
  {n:["Kawasan 23 m","23 m area"], d:["Zon antara garisan belakang dan garisan 23 m. Pukulan percuma di sini ada syarat tambahan (5 m).","The zone between the back line and the 23 m line. Free hits here have extra conditions (5 m)."], p:[[-W/2,HL-Q],[W/2,HL-Q],[W/2,HL],[-W/2,HL]]},
  {n:["Tengah padang","Midfield"], d:["Permainan bermula dengan pas dari tengah padang (centre pass).","Play starts with a pass from the centre (the centre pass)."], p:[[-W/2,-(HL-Q)],[W/2,-(HL-Q)],[W/2,HL-Q],[-W/2,HL-Q]]},
  {n:["Titik penalti","Penalty spot"], d:["Pukulan penalti diambil dari sini, 6.475 m dari gol: satu pemain menentang penjaga gol.","Penalty strokes are taken from here, 6.475 m from the goal: one player against the goalkeeper."], p:[[-1.2,-HL+PS-1.2],[1.2,-HL+PS-1.2],[1.2,-HL+PS+1.2],[-1.2,-HL+PS+1.2]]}],
 cards:[
  {t:["11 pemain, 4 × 15 minit","11 a side, 4 × 15 minutes"], x:["Setiap pasukan ada 11 pemain di padang termasuk penjaga gol. Perlawanan 4 suku × 15 minit ⚠.","Each team has 11 on the pitch including the goalkeeper. A match is 4 quarters of 15 minutes ⚠."], cam:[[0,60,40],[0,0,0]], dur:4,
   set:function(S){ var P=[[0,-HL+1],[-12,-30],[12,-30],[-5,-28],[-20,-15],[0,-15],[20,-15],[-15,-4],[15,-4],[-6,-3],[6,-3]];
     P.forEach(function(q,i){ var b=S.st.body(S.H,S.team(0)); stick(S,b); S.place(b,q[0],q[1],0); var c=S.st.body(S.H, Object.assign(S.team(1), i%3===0?{hijab:"#1f3b5c"}:{})); stick(S,c); S.place(c,-q[0],-q[1],PI); }); return {}; }, at:function(){}},
  {t:["Hanya belah rata kayu","Only the flat side of the stick"], x:["Bola hanya boleh dimainkan dengan belah rata (kiri) kayu hoki dan tepinya. Belah bulat di belakang tidak boleh.","The ball may only be played with the flat (left) face of the stick and its edges. The rounded back is not allowed."], cam:[[1.2,1.0,2.2],[0,0.2,0]], dur:3,
   set:function(S){ var b=S.st.body(S.H,S.team(0)); var s=stick(S,b); S.place(b,0,-0.3,0); S.pose(b,"ready",0); var ba=hb(S); ba.position.set(0.3,B,0.75); return {b:b, ba:ba, ok:S.st.label("✓ FLAT",0.9,1.4,0.6,0.5,"#7CFC9A")}; },
   at:function(S, s, p){ s.ba.position.x=0.3+Math.sin(p*PI*2)*0.15; }},
  {t:["Tiada kaki","No feet"], x:["Pemain tidak boleh menghentikan atau menendang bola dengan kaki atau badan. Hanya penjaga gol boleh menggunakan kaki di dalam bulatan.","Players may not stop or kick the ball with the foot or body. Only the goalkeeper may use the feet, inside the circle."], cam:[[3,2,4],[0,0.4,0]], dur:3,
   set:function(S){ var b=S.st.body(S.H,S.team(1)); stick(S,b); S.place(b,0,0,0); return {b:b, ba:hb(S), x:S.st.label("✗",0.4,1.5,0.6,1,"#ff6b6b")}; },
   at:function(S, s, p){ S.u.arc(s.ba,[3,B,4],[0.1,B,0.45],0.2,S.seg(p,0,0.5)); S.pose(s.b,"kick",S.seg(p,0.35,0.75)); S.u.show(s.x,p>0.55); }},
  {t:["Gol dari dalam bulatan","Goals only from inside the circle"], x:["Gol hanya sah jika pukulan dibuat dari dalam bulatan menjaring. Pukulan dari luar yang masuk tidak dikira.","A goal only counts if the shot was made inside the shooting circle. A shot from outside that goes in does not count."], cam:[[16,10,-HL+24],[0,0,-HL+6]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); stick(S,a); var k=S.st.body(S.H,{top:"#f2c94c",pants:"#2b2f3a"}); S.place(k,0,-HL+0.8,0); return {a:a, ba:hb(S), g:S.st.label("GOAL ✓",0,3,-HL,0.9,"#7CFC9A"), n:S.st.label("✗",0,3,-HL+18,0.9,"#ff6b6b")}; },
   at:function(S, s, p){ var first=p<0.5, q=(p*2)%1, z0=first?-HL+10:-HL+18; S.place(s.a,1.5,z0+0.8,PI); S.pose(s.a,"swing",S.seg(q,0,0.3)); S.u.arc(s.ba,[1.2,B,z0],[1.0,0.3,-HL-0.4],0.3,S.seg(q,0.2,0.6)); S.u.show(s.g,first&&q>0.6); S.u.show(s.n,!first&&q>0.6); }},
  {t:["Pukulan percuma & self-pass","Free hits and the self-pass"], x:["Selepas kesalahan, pukulan percuma diberi. Pemain boleh terus menggiring bola sendiri (self-pass). Lawan mesti 5 m jauh.","After a foul, a free hit is given. The player may simply dribble on (self-pass). Opponents must be 5 m away."], cam:[[0,14,10],[0,0,-2]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); stick(S,a); S.place(a,0,0,PI); var d=S.st.body(S.H,S.team(1)); stick(S,d); S.place(d,0,-5,0); return {a:a, ba:hb(S), r:S.u.strip(-5,-5,5,-5,0.1,"#CBFA1E"), l:S.st.label("5 m",3.5,1.2,-2.5,0.6)}; },
   at:function(S, s, p){ S.u.mv(s.a,0,0.5,4,-6,S.seg(p,0.3,1)); s.ba.position.set(s.a.position.x+Math.sin(s.a.rotation.y)*0.6,B,s.a.position.z+Math.cos(s.a.rotation.y)*0.6); }},
  {t:["Sudut penalti","Penalty corner"], x:["Bola ditolak dari garisan belakang, 10 m dari tiang. Penyerang menunggu di luar bulatan; 5 pertahanan (termasuk penjaga gol) bermula di belakang garisan gol.","The ball is pushed from the back line, 10 m from the post. Attackers wait outside the circle; 5 defenders (incl. the keeper) start behind the goal line."], cam:[[0,22,-HL+26],[0,0,-HL+7]], dur:5,
   set:function(S){ var inj=S.st.body(S.H,S.team(0)); stick(S,inj); S.place(inj,10,-HL-0.4,-PI/2); var st2=S.st.body(S.H,S.team(0)); stick(S,st2); S.place(st2,0,-HL+CR+0.6,PI);
     var D=[]; for(var i=0;i<5;i++){ var d=S.st.body(S.H,i===0?{top:"#f2c94c",pants:"#2b2f3a"}:S.team(1)); stick(S,d); S.place(d,-2+i,-HL-0.5,0); D.push(d); } return {ba:hb(S), D:D, st2:st2}; },
   at:function(S, s, p){ S.u.arc(s.ba,[10,B,-HL],[0.2,B,-HL+CR],0.05,S.seg(p,0,0.35)); s.D.forEach(function(d,i){ if(i) S.u.mv(d,-2+i,-HL-0.5,(i-2.5)*1.5,-HL+8,S.seg(p,0.05,0.5),"sprint"); }); S.pose(s.st2,"swing",S.seg(p,0.45,0.6)); if(p>0.5) S.u.arc(s.ba,[0.2,0.1,-HL+CR],[1.2,1.3,-HL],0.4,S.seg(p,0.5,0.75)); }},
  {t:["Pukulan penalti","Penalty stroke"], x:["Untuk kesalahan yang menghalang gol yang pasti. Satu tolakan atau flick dari titik 6.475 m menentang penjaga gol sahaja.","For a foul that stops a probable goal. One push or flick from the 6.475 m spot against the goalkeeper only."], cam:[[4,3,-HL+11],[0,0.8,-HL+1]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); stick(S,a); S.place(a,0,-HL+PS+0.6,PI); var k=S.st.body(S.H,{top:"#f2c94c",pants:"#2b2f3a"}); S.place(k,0,-HL+0.6,0); return {a:a, k:k, ba:hb(S)}; },
   at:function(S, s, p){ s.ba.position.set(0,B,-HL+PS); if(p>0.3) S.u.arc(s.ba,[0,B,-HL+PS],[1.3,1.2,-HL],0.4,S.seg(p,0.3,0.6)); S.pose(s.a,"swing",S.seg(p,0.15,0.35)); S.pose(s.k,"dive",S.seg(p,0.32,0.6)); s.k.rotation.y=PI; s.k.position.x=-S.seg(p,0.32,0.6)*0.8; }},
  {t:["Main bahaya & bola naik","Dangerous play and the raised ball"], x:["Bola yang diangkat dengan berbahaya, atau mengayun kayu dengan bahaya, adalah kesalahan. Bola diangkat ke arah pemain dalam jarak 5 m juga salah.","Lifting the ball dangerously, or swinging the stick dangerously, is a foul. Raising the ball at a player within 5 m is also a foul."], cam:[[5,2.5,3],[0,1,-2]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); stick(S,a); S.place(a,0,1,PI); var d=S.st.body(S.H,S.team(1)); stick(S,d); S.place(d,0,-3,0); return {a:a, ba:hb(S), x:S.st.label("DANGER",0,2.6,-1,0.7,"#ff6b6b")}; },
   at:function(S, s, p){ S.pose(s.a,"swing",S.seg(p,0,0.25)); S.u.arc(s.ba,[0,B,0.5],[0,1.5,-2.8],0.8,S.seg(p,0.2,0.55)); S.u.show(s.x,p>0.55); }},
  {t:["Kad hijau, kuning, merah","Green, yellow and red cards"], x:["Hijau: keluar 2 minit. Kuning: keluar 5 hingga 10 minit. Merah: dibuang terus ⚠. Pasukan bermain kurang seorang semasa itu.","Green: off for 2 minutes. Yellow: off for 5 to 10 minutes. Red: sent off for good ⚠. The team plays a player short meanwhile."], cam:[[0,1.7,4.2],[0,1.4,0]], dur:6,
   set:function(S){ var r=S.st.body(1.78,{top:"#111",pants:"#111"}); S.place(r,0,0,0); return {r:r, cs:[S.u.card(r,"#2ecc71"), S.u.card(r,"#f2c94c"), S.u.card(r,"#e74c3c")]}; },
   at:function(S, s, p){ var k=Math.min(2,Math.floor(p*3)); s.cs.forEach(function(c,i){ c.visible=i===k; }); S.pose(s.r,"card",S.seg((p*3)%1,0,0.3)); }},
  {t:["Gantian tanpa had","Rolling substitutions"], x:["Pemain boleh ditukar bila-bila masa (kecuali semasa sudut penalti), berapa kali sahaja, di kawasan gantian.","Players may be changed at any time (except during a penalty corner), as often as needed, at the substitution area."], cam:[[-18,6,0],[-W/2,0,0]], dur:4,
   set:function(S){ var o=S.st.body(S.H,S.team(0)); stick(S,o); var n=S.st.body(S.H,S.team(0)); stick(S,n); return {o:o, n:n}; },
   at:function(S, s, p){ S.u.mv(s.o,-W/2+6,2,-W/2-2,2,S.seg(p,0,0.5)); S.u.mv(s.n,-W/2-2,-2,-W/2+6,-2,S.seg(p,0.4,0.95)); }}],
 quiz:[
  {q:["Belah kayu yang boleh memukul bola…","Which side of the stick may play the ball?"], a:[["Belah rata","The flat side"],["Belah bulat","The rounded back"],["Kedua-duanya","Both"]], ok:0, why:["Hanya belah rata (dan tepinya).","Only the flat side (and its edges)."]},
  {q:["Gol sah jika pukulan dibuat dari…","A goal counts if the shot was made from…"], a:[["Mana-mana tempat","Anywhere"],["Dalam bulatan menjaring","Inside the shooting circle"],["Belakang garisan 23 m","Behind the 23 m line"]], ok:1, why:["Dari dalam bulatan sahaja.","Only from inside the circle."]},
  {q:["Siapa boleh menggunakan kaki?","Who may use the feet?"], a:[["Semua pemain","Every player"],["Penjaga gol, dalam bulatan","The goalkeeper, inside the circle"],["Tiada siapa","No one"]], ok:1, why:["Hanya penjaga gol di dalam bulatannya.","Only the goalkeeper, inside the circle."]},
  {q:["Kad hijau bermaksud keluar…","A green card means off for…"], a:[["2 minit","2 minutes"],["10 minit","10 minutes"],["Sepanjang perlawanan","The rest of the match"]], ok:0, why:["2 minit.","2 minutes."]},
  {q:["Sudut penalti ditolak dari…","A penalty corner is pushed from…"], a:[["Tengah padang","The centre"],["Garisan belakang, 10 m dari tiang","The back line, 10 m from the post"],["Titik penalti","The penalty spot"]], ok:1, why:["Dari garisan belakang, 10 m dari tiang gol.","From the back line, 10 m from the goal post."]}],
 game:{ name:["Drag-flick sudut penalti","Penalty-corner drag-flick"], help:["Bola ditolak ke arah anda. Ketik bila bola masuk bulatan hijau untuk menghentikannya. Kemudian leret ke atas ke penjuru gol (leret lebih panjang = lebih tinggi). Penjaga gol akan terjun. 5 sudut.","The ball is pushed out to you. Tap when it reaches the green ring to stop it. Then swipe up toward a corner of the goal (a longer swipe = higher). The keeper will dive. 5 corners."], unit:["gol","goals"],
  cam:[-1.2,2.5,-HL+CR+4.6], at:[0,0.8,-HL],
  start:function(G){ var S=G.S, T=S.T; G.me=S.st.body(S.H,S.team(0)); stick(S,G.me); S.place(G.me,0.75,-HL+CR+0.7,PI); G.inj=S.st.body(S.H,S.team(0)); stick(S,G.inj); S.place(G.inj,10,-HL-0.4,-PI/2);
   G.k=S.st.body(S.H,{top:"#f2c94c",pants:"#2b2f3a"}); G.R=[]; for(var i=0;i<3;i++){ var r=S.st.body(S.H,S.team(1)); stick(S,r); G.R.push(r); }
   G.b=hb(S); G.ring=new T.Mesh(new T.TorusGeometry(0.3,0.03,6,28), new T.MeshBasicMaterial({color:0xCBFA1E, transparent:true, opacity:0.3})); G.ring.rotation.x=PI/2; G.ring.position.set(0.1,0.05,-HL+CR); S.st.add(G.ring);
   G.n=0; G.goals=0; G.next(); },
  step:function(G, dt){ var S=G.S, f=G.f; if(!f) return; f.t+=dt;
   if(f.k==="push"){ var u=f.t/f.d; S.u.arc(G.b,[10,B,-HL],[0.1,B,-HL+CR],0.02,Math.min(1,u)); G.ring.material.opacity=(u>0.88&&u<1.08)?0.85:0.25; S.pose(G.inj,"swing",Math.min(1,f.t*3));
     G.R.forEach(function(r,i){ S.u.mv(r,(i-1)*1.8,-HL-0.4,(i-1)*1.4,-HL+6,Math.min(1,f.t/(f.d+1.2)),"sprint"); }); if(u>1.18) G.fail(S.L2("Terlepas hentian","Missed the stop")); }
   else if(f.k==="aim"){ G.R.forEach(function(r,i){ S.u.mv(r,(i-1)*1.4,-HL+6,(i-1)*1.2,-HL+9,Math.min(1,f.t/2),"sprint"); }); if(f.t>2.4) G.fail(S.L2("Terlalu lambat","Too slow")); }
   else if(f.k==="flick"){ var v=Math.min(1,f.t/0.45); S.u.arc(G.b,[0.1,0.1,-HL+CR],[f.x,f.y,-HL-0.3],0.3,v); S.pose(G.me,"swing",Math.min(1,f.t*3));
     var dv=Math.min(1,f.t/0.4); G.k.position.x=f.kx*dv; S.pose(G.k,f.kx?"dive":"ready",dv); G.k.rotation.z=0; if(v>=1){ G.f=null; G.res(f); } } },
  tap:function(G){ var f=G.f; if(!f||f.k!=="push") return; var u=f.t/f.d; if(u>0.82&&u<1.12){ G.f={k:"aim", t:0}; G.b.position.set(0.1,B,-HL+CR); G.ring.material.opacity=0; G.S.vib(20); G.hu(G.S.L2("Henti! Leret untuk flick","Stopped! Swipe to flick")); } else G.fail(G.S.L2("Hentian tidak kemas","Bad stop")); },
  swipe:function(G, dx, dy){ var f=G.f; if(!f) return; if(f.k==="push") return G.game.tap(G); if(f.k!=="aim") return; var x=Math.max(-2.3,Math.min(2.3,dx*9)), y=Math.max(0.1,Math.min(2.6,-dy*4.2)); var side=Math.random()<0.4?0:(Math.random()<0.5?-1:1); G.f={k:"flick", t:0, x:x, y:y, kx:side*1.2}; G.S.vib(25); } }};
var gm=SPORTS.hockey.game, st0=gm.start, sp0=gm.step; gm.step=function(G, dt, t){ if(!G.h0){ G.h0=1; G.hu(); } sp0(G, dt, t); }; gm.start=function(G){ var S=G.S; G.game=gm;
  G.hu=function(msg){ S.hud('🏑 '+S.L2("Sudut ","Corner ")+Math.min(5,G.n+1)+'/5 · '+S.L2("Gol ","Goals ")+G.goals+(msg?'  ·  '+msg:'')); };
  G.next=function(){ if(G.n>=5) return G.end(G.goals, G.goals+" / 5 "+S.L2("gol","goals")); G.f={k:"push", t:0, d:Math.max(0.9,1.3-G.n*0.08)}; G.b.position.set(10,B,-HL); S.place(G.k,0,-HL+0.7,0); S.pose(G.k,"ready",0); G.R.forEach(function(r,i){ S.place(r,(i-1)*1.8,-HL-0.4,0); }); G.hu(); };
  G.fail=function(msg){ G.f=null; G.n++; S.vib(60); G.hu(msg); setTimeout(function(){ if(!G.over) G.next(); },1100); };
  G.res=function(f){ G.n++; var inGoal=Math.abs(f.x)<=GW/2-0.05 && f.y<GH-0.05, kx=f.kx, saved=inGoal && Math.abs(f.x-kx)<0.75 && f.y<1.6, blocked=inGoal && f.y<0.45 && Math.abs(f.x)<1.6 && Math.random()<0.35;
    var g=inGoal && !saved && !blocked; if(g){ G.goals++; S.vib(40); } G.hu(g?S.L2("GOL!","GOAL!"):!inGoal?S.L2("Tersasar","Wide or over"):saved?S.L2("Diselamatkan","Saved"):S.L2("Disekat","Blocked")); setTimeout(function(){ if(!G.over) G.next(); },1200); };
  st0(G); };
})();
