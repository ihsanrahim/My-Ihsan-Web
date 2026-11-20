/* My Ihsan Sports: Golf. A procedural par-4 hole (≈ 370 m): tee, fairway, rough, bunkers, a pond, green with the hole (Ø 108 mm) and flagstick.
   Ball Ø 42.67 mm. Par 3 up to ≈ 230 m, par 4 ≈ 230–430 m, par 5 beyond. R&A / USGA Rules of Golf, rules as of 2026. */
(function(){
"use strict";
var PI=Math.PI, TZ=175, GZ=-170, HZ=-172, HX=2, HR=0.054, BD=0.04267, BV=0.1;
function lay(m, y, sx, sz){ m.position.y=y; m.material=m.material.clone(); m.material.polygonOffset=true; m.material.polygonOffsetFactor=m.material.polygonOffsetUnits=-Math.round(y*400); if(sx) m.scale.x=sx; if(sz) m.scale.y=sz; return m; }
function gball(S){ return S.st.ball(BV, "#ffffff"); }
function club(S, b, putter){ var T=S.T, g=new T.Group(), m=new T.MeshLambertMaterial({color:0x9aa3ad}); var sh=new T.Mesh(new T.CylinderGeometry(0.008,0.008,putter?0.85:1.0,6), m); sh.position.y=-(putter?0.42:0.5); g.add(sh);
  var hd=new T.Mesh(new T.BoxGeometry(putter?0.1:0.07,0.03,putter?0.025:0.05), new T.MeshLambertMaterial({color:0x2b2f3a})); hd.position.set(0.03,-(putter?0.85:1.0),0); g.add(hd);
  g.position.set(0,-0.3,0.05); g.rotation.x=0.25; b.userData.J.elR.add(g); return g; }
function flag(S, x, z){ var T=S.T, g=new T.Group(), p=new T.Mesh(new T.CylinderGeometry(0.012,0.012,2.13,6), new T.MeshLambertMaterial({color:0xffffff})); p.position.y=1.06; g.add(p);
  var f=new T.Mesh(new T.PlaneGeometry(0.5,0.35), new T.MeshBasicMaterial({color:0xe74c3c, side:T.DoubleSide})); f.position.set(0.25,1.95,0); g.add(f); g.position.set(x,0,z); S.st.add(g); return g; }
function arrow(S){ var T=S.T, g=new T.Group(), m=new T.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.75, side:T.DoubleSide, depthWrite:false});
  var a=new T.Mesh(new T.PlaneGeometry(0.06,0.5), m); a.rotation.x=-PI/2; g.add(a); var h=new T.Mesh(new T.CircleGeometry(0.14,3), m); h.rotation.x=-PI/2; h.rotation.z=PI/2; h.position.z=0.3; g.add(h); S.st.add(g); return g; }
function tree(K, x, z, h){ K.post(x, z, h*0.4, 0.18, "#6b4a2b"); var T=window.THREE, c=new T.Mesh(new T.ConeGeometry(h*0.28, h*0.75, 8), new T.MeshLambertMaterial({color:0x2f6b3a})); c.position.set(x, h*0.4+h*0.36, z); K.root.add(c); }
function golfer(S, i, x, z, ry, putter){ var b=S.st.body(S.H, Object.assign({}, [{top:"#f1efe9",pants:"#2b2f3a",cap:1,capc:"#1f3b5c"},{top:"#5b8bd9",pants:"#e9e6df",cap:1,capc:"#ffffff"},{top:"#c0392b",pants:"#2b2f3a",hijab:"#2b2f3a"}][i%3])); club(S, b, putter); S.place(b, x, z, ry||0); return b; }
SPORTS.golf={ id:"golf", v:"2026", H:1.78, cam:[60,55,210], ground:"#4f8a3c", fog:[260,1100], far:1400, near:0.1, groundSize:900,
 field:function(K){ K.rect(110, 400, "#4f8a3c", 0); // rough
   lay(K.rect(34, 290, "#62a84a", 0), 0.01, 0, 0).position.z=0; // fairway
   lay(K.dot(0, TZ, 6, "#6bb350"), 0.015, 1, 1.5); K.post(-2, TZ-3, 0.3, 0.12, "#e74c3c"); K.post(2, TZ-3, 0.3, 0.12, "#e74c3c"); // tee box + markers
   lay(K.dot(0, GZ, 16, "#79c25a"), 0.02, 1.15, 1); // green
   lay(K.dot(HX, HZ, HR, "#111111"), 0.03); K.post(HX, HZ, 2.13, 0.012, "#ffffff"); K.label("⛳", HX, 3, HZ, 1.2);
   lay(K.dot(17, GZ+4, 6, "#e9d8a6"), 0.025, 1.2, 0.8); lay(K.dot(-15, GZ-6, 5, "#e9d8a6"), 0.025); lay(K.dot(-14, -30, 6, "#e9d8a6"), 0.02, 1, 1.6); // bunkers
   lay(K.dot(6, 35, 18, "#2a9fd6"), 0.02, 1.6, 0.7); K.line(-30, 30, 30, 30, 0.2, "#e74c3c"); K.line(-30, 40, 30, 40, 0.2, "#e74c3c"); // pond, red penalty-area lines
   for(var z=-190; z<=190; z+=20){ K.post(-52, z, 0.9, 0.05, "#ffffff"); K.post(52, z, 0.9, 0.05, "#ffffff"); } // OB stakes
   [[-30,120,9],[30,90,11],[-34,-10,10],[33,-60,8],[-28,-120,12],[30,-150,9],[-40,60,10],[38,20,9]].forEach(function(t){ tree(K, t[0], t[1], t[2]); });
   return {w:110, l:400}; },
 facts:[[["Lubang","Hole"],"Ø 108 mm"],[["Bola","Ball"],"Ø 42.67 mm, ≤ 45.93 g"],[["Tiang bendera","Flagstick"],"≈ 2.13 m"],[["Par 3","Par 3"],"≤ ≈ 230 m"],[["Par 4","Par 4"],"≈ 230–430 m"],[["Par 5","Par 5"],"> ≈ 430 m"],[["Pusingan","Round"],"18 lubang, par ≈ 72"]],
 zones:[
  {n:["Kawasan tee","Teeing area"], d:["Pukulan pertama setiap lubang dibuat dari sini, di antara dua penanda dan hingga 2 panjang kayu ke belakang.","The first stroke on each hole is played from here, between the two markers and up to two club-lengths behind them."], p:[[-6,TZ+9],[6,TZ+9],[6,TZ-9],[-6,TZ-9]]},
  {n:["Fairway","Fairway"], d:["Rumput pendek antara tee dan green. Bola paling mudah dipukul dari sini.","Short grass between the tee and the green. The easiest place to play from."], p:[[-17,145],[17,145],[17,-145],[-17,-145]]},
  {n:["Kawasan penalti (kolam)","Penalty area (pond)"], d:["Bola masuk air: mainkan seperti terletak, atau ambil 1 pukulan penalti dan jatuhkan di belakang.","Ball in the water: play it as it lies, or take a 1-stroke penalty and drop behind."], p:[[-22,23],[34,23],[34,47],[-22,47]]},
  {n:["Bunker","Bunker"], d:["Lubang pasir. Kayu tidak boleh menyentuh pasir sebelum pukulan.","A sand hazard. The club must not touch the sand before the stroke."], p:[[8,GZ-1],[26,GZ-1],[26,GZ+9],[8,GZ+9]]},
  {n:["Green","Putting green"], d:["Rumput sangat pendek di sekeliling lubang. Di sini bola boleh ditanda, diangkat dan dibersihkan.","Very short grass around the hole. Here the ball may be marked, lifted and cleaned."], p:(function(){ var a=[]; for(var i=0;i<20;i++){ var t=i/20*PI*2; a.push([Math.cos(t)*18, GZ+Math.sin(t)*16]); } return a; })()},
  {n:["Luar sempadan (OB)","Out of bounds"], d:["Di luar pancang putih. Penalti pukulan-dan-jarak: 1 pukulan dan main semula dari tempat asal.","Beyond the white stakes. Stroke-and-distance: 1 penalty stroke and replay from where you last played."], p:[[52,190],[60,190],[60,-190],[52,-190]]}],
 cards:[
  {t:["Pukulan paling sedikit menang","Fewest strokes wins"], x:["Matlamat golf: masukkan bola ke dalam lubang dengan pukulan paling sedikit. Satu pusingan ada 18 lubang.","The aim: get the ball into the hole in the fewest strokes. A round is 18 holes."], cam:[[50,70,230],[0,0,0]], dur:6,
   set:function(S){ var g=golfer(S,0,1,TZ+1,PI); return {g:g, ba:gball(S)}; },
   at:function(S, s, p){ var pts=[[0,TZ],[-6,-10],[4,GZ+12],[HX,HZ]], k=Math.min(2,Math.floor(p*3)), q=(p*3)%1; S.pose(s.g,"swing",S.seg(q,0,0.2)*(k===0?1:0));
     var a=pts[k], b=pts[k+1]; S.u.arc(s.ba,[a[0],BV/2,a[1]],[b[0],BV/2,b[1]],k<2?30:0,S.seg(q,0.15,0.9)); }},
  {t:["Kawasan tee","The teeing area"], x:["Pukulan pertama dibuat dari antara penanda tee. Bola boleh diletakkan atas tee (pin kecil).","The first stroke is played from between the tee markers. The ball may sit on a tee peg."], cam:[[4,2.2,TZ+5],[0,0.8,TZ-3]], dur:3,
   set:function(S){ var g=golfer(S,1,0.75,TZ,-PI/2); var b=gball(S); b.position.set(0,0.07,TZ-0.1); return {g:g, ba:b}; },
   at:function(S, s, p){ S.pose(s.g,"swing",S.seg(p,0.1,0.5)); if(p>0.35) S.u.arc(s.ba,[0,0.07,TZ-0.1],[0,6,TZ-60],12,S.seg(p,0.35,1)); else s.ba.position.set(0,0.07,TZ-0.1); }},
  {t:["Par, birdie, eagle, bogey","Par, birdie, eagle, bogey"], x:["Par = bilangan pukulan dijangka. Birdie = 1 kurang, eagle = 2 kurang, bogey = 1 lebih. Hole-in-one = masuk dengan 1 pukulan.","Par is the expected number of strokes. Birdie = 1 under, eagle = 2 under, bogey = 1 over. A hole-in-one goes in with the first stroke."], cam:[[10,8,GZ+18],[HX,0,HZ]], dur:5,
   set:function(S){ return {L:[S.st.label("Par 4 = 4",HX,3.2,HZ,0.8), S.st.label("Birdie = 3",HX,3.2,HZ,0.8,"#7CFC9A"), S.st.label("Eagle = 2",HX,3.2,HZ,0.8,"#f2c94c"), S.st.label("Bogey = 5",HX,3.2,HZ,0.8,"#ff6b6b")]}; },
   at:function(S, s, p){ var k=Math.min(3,Math.floor(p*4)); s.L.forEach(function(l,i){ l.visible=i===k; }); }},
  {t:["Stroke play dan match play","Stroke play and match play"], x:["Stroke play: jumlah semua pukulan, paling rendah menang. Match play: menang lubang demi lubang; siapa menang lebih banyak lubang menang perlawanan.","Stroke play: count every stroke, the lowest total wins. Match play: win hole by hole; whoever wins more holes wins the match."], cam:[[8,6,GZ+16],[HX,0,HZ]], dur:4,
   set:function(S){ var a=golfer(S,0,-3,GZ+6,PI,true), b=golfer(S,1,6,GZ+3,PI,true); return {a:a, b:b, l:S.st.label("1 UP",HX,3,HZ,0.8)}; },
   at:function(S, s, p){ S.pose(s.a,"swing",S.seg(p,0,0.2)*0.4); S.pose(s.b,"swing",S.seg(p,0.5,0.7)*0.4); S.u.show(s.l,p>0.8); }},
  {t:["Main bola seperti terletak","Play the ball as it lies"], x:["Prinsip asas: jangan alihkan, tolak atau tekan bola atau tanah di sekelilingnya untuk memperbaiki letaknya.","The basic principle: do not move, press or improve the ball or the ground around it to get a better lie."], cam:[[-10,3,-24],[-14,0.5,-30]], dur:4,
   set:function(S){ var g=golfer(S,2,-13.2,-30,-PI/2); var b=gball(S); b.position.set(-14,BV/2,-30); return {g:g, ba:b}; },
   at:function(S, s, p){ S.pose(s.g,"swing",S.seg(p,0.1,0.5)); if(p>0.35) S.u.arc(s.ba,[-14,BV/2,-30],[-4,0.1,-80],14,S.seg(p,0.35,1)); }},
  {t:["Luar sempadan: pukulan dan jarak","Out of bounds: stroke and distance"], x:["Bola keluar pancang putih atau hilang (cari maksimum 3 minit): tambah 1 pukulan penalti dan main semula dari tempat pukulan terakhir.","Ball beyond the white stakes, or lost (3-minute search): add 1 penalty stroke and replay from where the last stroke was made."], cam:[[30,25,140],[40,0,90]], dur:4,
   set:function(S){ var g=golfer(S,0,0.8,TZ,PI); return {g:g, ba:gball(S), x:S.st.label("OB +1",55,4,90,1.2,"#ff6b6b")}; },
   at:function(S, s, p){ S.pose(s.g,"swing",S.seg(p,0,0.2)); S.u.arc(s.ba,[0,BV/2,TZ],[60,BV/2,90],25,S.seg(p,0.1,0.7)); S.u.show(s.x,p>0.7); }},
  {t:["Kawasan penalti (air)","Penalty areas (water)"], x:["Garisan merah atau kuning menanda kawasan penalti. Mainkan seperti terletak tanpa penalti, atau 1 pukulan penalti dan jatuhkan bola di luar.","Red or yellow lines mark penalty areas. Play it as it lies with no penalty, or take 1 penalty stroke and drop outside."], cam:[[30,18,70],[6,0,35]], dur:4,
   set:function(S){ var b=gball(S); return {ba:b, l:S.st.label("+1",-6,3,44,1,"#ff6b6b")}; },
   at:function(S, s, p){ if(p<0.5) S.u.arc(s.ba,[0,BV/2,110],[8,-0.2,35],18,S.seg(p,0,0.45)); else s.ba.position.set(-6,BV/2,44); S.u.show(s.l,p>0.55); }},
  {t:["Bola tidak boleh dimainkan","The unplayable ball"], x:["Anda boleh isytihar bola tidak boleh dimainkan (kecuali dalam kawasan penalti): 1 pukulan penalti dan jatuhkan dalam 2 panjang kayu, ke belakang, atau main semula.","You may declare your ball unplayable (except in a penalty area): 1 penalty stroke, then drop within two club-lengths, back on a line, or replay."], cam:[[-22,6,-112],[-28,2,-120]], dur:4,
   set:function(S){ var g=golfer(S,1,-24,-118,-PI/2); var b=gball(S); b.position.set(-28,BV/2,-120.5); return {g:g, ba:b, r:S.u.strip(-28,-120.5,-26,-120.5,0.1), l:S.st.label("2 × 🏌",-26,1.6,-119,0.6)}; },
   at:function(S, s, p){ S.pose(s.g,"point",S.seg(p,0,0.3)); if(p>0.5) s.ba.position.set(-28+S.seg(p,0.5,0.8)*1.8,BV/2+Math.sin(S.seg(p,0.5,0.8)*PI)*0.9,-120.5); }},
  {t:["Di atas green","On the green"], x:["Di green, bola boleh ditanda dengan penanda, diangkat dan dibersihkan. Anda boleh putt dengan tiang bendera kekal dalam lubang atau dikeluarkan.","On the green you may mark the ball, lift and clean it. You may putt with the flagstick left in the hole or taken out."], cam:[[HX+5,1.8,HZ+6],[HX,0,HZ]], dur:4,
   set:function(S){ var g=golfer(S,0,HX+0.4,HZ+4.5,PI,true); var b=gball(S); return {g:g, ba:b, mk:S.u.zone(HX-0.03,HZ+3.97,HX+0.03,HZ+4.03,"#f2c94c",0.9)}; },
   at:function(S, s, p){ S.pose(s.g,"swing",S.seg(p,0.3,0.45)*0.3); s.ba.position.set(HX,BV/2,HZ+4); if(p>0.45){ var q=S.ease(S.seg(p,0.45,0.9)); s.ba.position.z=HZ+4-q*4; s.ba.position.y=q>0.98?-0.05:BV/2; } }},
  {t:["Etika dan kelajuan bermain","Etiquette and pace of play"], x:["Diam semasa orang lain memukul, jangan berdiri di laluan putt, baiki tanda bola dan divot, ratakan bunker. Main dengan pantas: digalakkan bersedia dan bermain dalam 40 saat. Jerit 'FORE!' jika bola menuju ke arah orang.","Stay quiet while others play, do not stand on a putting line, repair pitch marks and divots, rake bunkers. Keep moving: be ready and play within about 40 seconds. Shout 'FORE!' if a ball heads toward people."], cam:[[22,5,GZ+12],[16,0,GZ+4]], dur:4,
   set:function(S){ var g=golfer(S,2,17,GZ+6,PI); return {g:g, l:S.st.label("FORE!",8,3,GZ+20,0.9,"#f2c94c")}; },
   at:function(S, s, p){ S.pose(s.g,"point",S.seg(p,0,0.3)); s.g.position.x=17+Math.sin(p*PI*4)*0.6; S.u.show(s.l,p>0.5&&p<0.8); }}],
 quiz:[
  {q:["Siapa menang dalam stroke play?","Who wins in stroke play?"], a:[["Pukulan paling sedikit","The fewest strokes"],["Pukulan paling jauh","The longest drive"],["Paling banyak lubang dimenangi","The most holes won"]], ok:0, why:["Jumlah pukulan paling rendah.","The lowest total of strokes."]},
  {q:["Birdie bermaksud…","A birdie means…"], a:[["1 bawah par","1 under par"],["1 atas par","1 over par"],["2 bawah par","2 under par"]], ok:0, why:["Birdie = 1 pukulan kurang daripada par.","Birdie = one stroke under par."]},
  {q:["Bola keluar sempadan (OB): penalti?","Ball out of bounds: the penalty?"], a:[["Tiada","None"],["1 pukulan + main semula dari tempat asal","1 stroke + replay from where you last played"],["2 pukulan, main dari tepi","2 strokes, play from the edge"]], ok:1, why:["Pukulan dan jarak.","Stroke and distance."]},
  {q:["Garisan merah atau kuning menanda…","Red or yellow lines mark…"], a:[["Kawasan penalti","A penalty area"],["Green","The green"],["Kawasan tee","The teeing area"]], ok:0, why:["Biasanya air atau kawasan semak.","Usually water or wild areas."]},
  {q:["Diameter lubang golf ialah…","The golf hole is…"], a:[["108 mm","108 mm"],["42.67 mm","42.67 mm"],["20 cm","20 cm"]], ok:0, why:["108 mm (bola 42.67 mm).","108 mm (the ball is 42.67 mm)."]}],
 game:{ name:["Green putting, 9 lubang","Putting green, 9 holes"], help:["Leret dari bola ke arah lubang untuk putt (atau tarik ke belakang seperti busur). Leret lebih panjang = lebih kuat. Anak panah menunjukkan kecerunan: bola akan membelok ke arah itu. Maksimum 6 pukulan setiap lubang. Jumlah pukulan paling rendah menang.","Swipe from the ball toward the hole to putt (or pull back like a bow). A longer swipe = a harder putt. The arrows show the slope: the ball will break that way. At most 6 strokes per hole. Fewest total strokes wins."], unit:["pukulan","strokes"], lower:true,
  cam:[HX,1.6,HZ+6], at:[HX,0,HZ],
  start:function(G){ var S=G.S; G.p=golfer(S,0,0,0,PI,true); G.b=gball(S); G.fl=flag(S,HX,HZ); G.A=[]; for(var i=0;i<9;i++) G.A.push(arrow(S)); G.h=0; G.tot=0; G.next(); },
  step:function(G, dt){ var S=G.S, f=G.f; if(!f||f.k!=="roll") return; var n=Math.max(1,Math.ceil(dt/0.01)), h=Math.min(dt,0.1)/n;
   for(var i=0;i<n;i++){ var sp=Math.hypot(f.vx,f.vz); if(sp<0.02 && Math.hypot(G.sx,G.sz)*9.8<0.3){ f.vx=f.vz=0; break; }
     var dec=sp>0?0.85/sp:0; f.vx+=(-f.vx*dec+G.sx*9.8*0.6)*h; f.vz+=(-f.vz*dec+G.sz*9.8*0.6)*h; f.x+=f.vx*h; f.z+=f.vz*h;
     var dh=Math.hypot(f.x-HX,f.z-HZ); if(dh<HR+0.01 && Math.hypot(f.vx,f.vz)<1.4){ f.in=true; break; } if(Math.hypot(f.vx,f.vz)<0.015){ f.vx=f.vz=0; break; } }
   G.b.position.set(f.x, f.in?-0.04:BV/2, f.z); f.t+=dt; if(f.in || (f.vx===0&&f.vz===0) || f.t>12){ G.f=null; G.done(f); } },
  swipe:function(G, dx, dy){ var f=G.f; if(!f||f.k!=="aim") return; var S=G.S; if(dy>0){ dx=-dx; dy=-dy; } // pulled back like a bow
   var len=Math.min(0.9,Math.hypot(dx,dy)), fx=HX-f.x, fz=HZ-f.z, d=Math.hypot(fx,fz)||1; fx/=d; fz/=d; var ang=Math.atan2(dx, -dy)*0.5, c=Math.cos(ang), s=Math.sin(ang);
   var dirx=fx*c-fz*s, dirz=fz*c+fx*s; // screen right turns the putt toward camera-right
   var v=Math.sqrt(1.7*(0.3+len*16)); G.str++; G.f={k:"roll", t:0, x:f.x, z:f.z, vx:dirx*v, vz:dirz*v}; S.pose(G.p,"swing",0.35); S.vib(15); G.hu(); },
  tap:function(){} }};
var gm=SPORTS.golf.game, st0=gm.start, sp0=gm.step; gm.step=function(G, dt, t){ if(!G.h0){ G.h0=1; G.hu(); } sp0(G, dt, t); };
gm.start=function(G){ var S=G.S; G.game=gm;
  G.hu=function(msg){ S.hud('⛳ '+S.L2("Lubang ","Hole ")+Math.min(9,G.h+1)+'/9 · '+S.L2("Pukulan ","Stroke ")+(G.str||0)+' · '+S.L2("Jumlah ","Total ")+(G.tot+(G.str||0))+(G.d!=null?' · '+G.d.toFixed(1)+' m':'')+' · '+S.L2("Cerun ","Slope ")+G.sl+(msg?'  ·  '+msg:'')); };
  G.slopeUI=function(){ var a=Math.atan2(G.sx,G.sz); G.A.forEach(function(m,i){ var gx=HX+((i%3)-1)*2.4, gz=HZ+(Math.floor(i/3)-1)*2.4+3.6; m.position.set(gx,0.045,gz); m.rotation.y=a; m.visible=Math.hypot(G.sx,G.sz)>0.002; });
    G.sl=(Math.hypot(G.sx,G.sz)*100).toFixed(1)+"%"; };
  G.aim=function(x, z){ G.f={k:"aim", x:x, z:z}; G.b.position.set(x,BV/2,z); G.d=Math.hypot(x-HX,z-HZ); var fx=HX-x, fz=HZ-z, d=G.d||1; fx/=d; fz/=d;
    S.place(G.p, x-fz*0.45, z+fx*0.45, Math.atan2(fz,-fx)); S.pose(G.p,"ready",0); S.st.setCam([x-fx*3.2+fz*0.9, 1.5, z-fz*3.2-fx*0.9],[HX,0,HZ]); G.hu(); };
  G.next=function(){ if(G.h>=9) return G.end(G.tot, G.tot+" "+S.L2("pukulan (par 18)","strokes (par 18)")); G.str=0; var s=0.006+G.h*0.0025, a=Math.random()*PI*2; G.sx=Math.sin(a)*s; G.sz=Math.cos(a)*s; G.slopeUI();
    var r=2+G.h*0.8+Math.random()*1.5, b=Math.random()*PI*2; G.aim(HX+Math.sin(b)*r, HZ+Math.cos(b)*r*0.8+(Math.cos(b)<0?0:0)); };
  G.done=function(f){ if(f.in){ G.tot+=G.str; S.vib(40); var nm=G.str===1?S.L2("Masuk dengan 1!","Holed in 1!"):G.str===2?"Par":G.str===3?"Bogey":"+"+(G.str-2); G.h++; G.str=0; G.d=null; G.hu(nm); setTimeout(function(){ if(!G.over) G.next(); },1300); return; }
    if(G.str>=6){ G.tot+=7; G.h++; G.str=0; G.hu(S.L2("Ambil bola (+7)","Picked up (+7)")); setTimeout(function(){ if(!G.over) G.next(); },1300); return; }
    G.aim(f.x, f.z); };
  st0(G); };
})();
