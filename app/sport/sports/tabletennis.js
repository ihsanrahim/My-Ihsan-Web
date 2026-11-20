/* My Ihsan Sports: Table tennis (ping pong). Table 2.74 × 1.525 m, 0.76 m high; net 15.25 cm; ball Ø 40 mm. ITTF Handbook, rules as of 2026. */
(function(){
"use strict";
var L=2.74, HL=1.37, W=1.525, TH=0.76, NET=0.1525, B=0.04;
function pb(S){ return S.st.ball(B*1.6, "#ffffff"); }
function bat(S, b){ var T=S.T, r=new T.Group(); var h=new T.Mesh(new T.BoxGeometry(0.025,0.1,0.025), new T.MeshLambertMaterial({color:0x8a5a2b})); h.position.y=-0.05; r.add(h);
  var hd=new T.Mesh(new T.CylinderGeometry(0.075,0.075,0.012,18), new T.MeshLambertMaterial({color:0xc0392b})); hd.rotation.x=Math.PI/2; hd.position.y=-0.16; r.add(hd); r.position.y=-0.3; b.userData.J.elR.add(r); return r; }
SPORTS.tabletennis={ id:"tabletennis", v:"2026", H:1.76, zoneY:0.76, cam:[2.6,2.2,3.2], sky:"#2a2f3a", ground:"#5b3a3a",
 field:function(K){ var T=window.THREE; K.rect(8, 12, "#7a3b3b");
   var top=new T.Mesh(new T.BoxGeometry(W, 0.03, L), new T.MeshLambertMaterial({color:0x1f4e8a})); top.position.y=TH-0.015; K.root.add(top);
   [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(c){ var leg=new T.Mesh(new T.BoxGeometry(0.05, TH-0.03, 0.05), new T.MeshLambertMaterial({color:0x222222})); leg.position.set(c[0]*(W/2-0.15), (TH-0.03)/2, c[1]*(HL-0.2)); K.root.add(leg); });
   var wl=function(w, l, x, z){ var m=new T.Mesh(new T.PlaneGeometry(w, l), new T.MeshBasicMaterial({color:0xffffff})); m.rotation.x=-Math.PI/2; m.position.set(x, TH+0.002, z); K.root.add(m); };
   wl(0.02, L, -W/2+0.01, 0); wl(0.02, L, W/2-0.01, 0); wl(W, 0.02, 0, -HL+0.01); wl(W, 0.02, 0, HL-0.01); wl(0.003, L, 0, 0);
   K.net(-W/2-0.15, W/2+0.15, 0, TH, TH+NET, "rgba(20,20,20,.75)", 0.012); return {w:W+0.6,l:L+0.6}; },
 facts:[[["Meja","Table"],"2.74 × 1.525 m"],[["Tinggi meja","Table height"],"0.76 m"],[["Jaring","Net"],"15.25 cm"],[["Bola","Ball"],"Ø 40 mm, 2.7 g"],[["Game","Game"],"11 mata / points"]],
 zones:[
  {n:["Separuh kanan","Right half"], d:["Dalam beregu, servis mesti dari separuh kanan anda ke separuh kanan lawan (menyerong).","In doubles the serve goes from your right half to the opponent's right half (diagonally)."], p:[[0,-HL],[W/2,-HL],[W/2,0],[0,0]]},
  {n:["Separuh kiri","Left half"], d:["Garisan tengah putih membahagi meja untuk servis beregu.","The white centre line splits the table for doubles serves."], p:[[-W/2,-HL],[0,-HL],[0,0],[-W/2,0]]},
  {n:["Gelanggang lawan","Opponent's court"], d:["Pukulan mesti melepasi jaring dan mendarat di sini.","A return must clear the net and land here."], p:[[-W/2,0],[W/2,0],[W/2,HL],[-W/2,HL]]}],
 cards:[
  {t:["Servis: lambung 16 cm","Serve: toss 16 cm"], x:["Bola diletak di tapak tangan terbuka dan dilambung tegak sekurang-kurangnya 16 cm sebelum dipukul.","The ball rests on an open palm and is tossed straight up at least 16 cm before it is struck."], cam:[[1.6,1.5,-2.6],[0,1,-1.6]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); bat(S,a); S.place(a,0.2,-HL-0.5,0); return {a:a, b:pb(S), lb:S.st.label("≥ 16 cm",0.6,1.5,-HL-0.4,0.4)}; },
   at:function(S, s, p){ var q=Math.sin(Math.min(1,p*1.6)*Math.PI); s.b.position.set(-0.05, 0.95+q*0.3, -HL-0.25); S.pose(s.a,"serve",S.seg(p,0.5,0.8)); S.u.show(s.lb,p>0.25&&p<0.7); }},
  {t:["Servis melantun dua kali","The serve bounces twice"], x:["Servis mesti melantun sekali di meja anda, melepasi jaring, kemudian melantun di meja lawan.","The serve must bounce once on your side, clear the net, then bounce on the opponent's side."], cam:[[1.8,1.4,0],[0,0.8,0]], dur:3,
   set:function(S){ return {b:pb(S)}; }, at:function(S, s, p){ if(p<0.4) S.u.arc(s.b,[0,1,-HL],[0,TH+0.02,-0.6],0.05,p/0.4); else if(p<0.8) S.u.arc(s.b,[0,TH+0.02,-0.6],[0.2,TH+0.02,0.7],0.25,(p-0.4)/0.4); else S.u.arc(s.b,[0.2,TH+0.02,0.7],[0.3,1,HL+0.3],0.25,(p-0.8)/0.2); }},
  {t:["Let servis","Let serve"], x:["Jika servis menyentuh jaring dan tetap mendarat betul, ia 'let' dan servis diulang.","If a serve touches the net and still lands correctly, it is a 'let' and the serve is taken again."], cam:[[1.2,1.1,0.4],[0,0.85,0]], dur:3,
   set:function(S){ return {b:pb(S), lb:S.st.label("LET",0,1.25,0,0.45)}; }, at:function(S, s, p){ if(p<0.5) S.u.arc(s.b,[0,TH+0.02,-0.6],[0,TH+NET+0.02,0],0.15,p/0.5); else S.u.arc(s.b,[0,TH+NET+0.02,0],[0.1,TH+0.02,0.5],0.05,(p-0.5)/0.4); S.u.show(s.lb,p>0.5); }},
  {t:["Servis beregu menyerong","Doubles serve diagonally"], x:["Dalam beregu, servis dari separuh kanan anda ke separuh kanan lawan.","In doubles, serve from your right half into the opponent's right half."], cam:[[0,2.6,-2.2],[0,0.76,0]], dur:3,
   set:function(S){ return {a:S.u.zone(0,-HL,W/2,0,"#CBFA1E",0.35), b:S.u.zone(-W/2,0,0,HL,"#CBFA1E",0.35)}; }, at:function(){}},
  {t:["Beregu: pukul bergilir","Doubles: hit in turn"], x:["Dalam beregu, pasangan memukul bola secara bergilir: A, kemudian B, kemudian A…","In doubles, partners must hit the ball in turn: A, then B, then A…"], cam:[[2.2,1.6,-2.4],[0,0.8,-1]], dur:4,
   set:function(S){ var a=S.st.body(S.H,S.team(0)), b=S.st.body(S.H,S.team(0)); bat(S,a); bat(S,b); return {a:a,b:b,la:S.st.label("A",0,2.2,0,0.4),lb:S.st.label("B",0,2.2,0,0.4)}; },
   at:function(S, s, p){ var first=p<0.5; S.place(s.a,first?0.2:-0.8,-HL-0.5,0); S.place(s.b,first?-0.8:0.2,-HL-0.8,0); S.pose(first?s.a:s.b,"swing",(p*2)%1); s.la.position.set(s.a.position.x,2.1,s.a.position.z); s.lb.position.set(s.b.position.x,2.1,s.b.position.z); }},
  {t:["Game hingga 11","Games to 11"], x:["Game dimenangi oleh yang pertama 11 mata dengan beza 2 (contoh 11-9, 12-10).","A game goes to the first to 11 points with a 2-point lead (for example 11-9, 12-10)."], cam:[[0,1.5,-3.2],[0,1.2,0]], dur:4,
   set:function(S){ return {lb:S.st.label("10 - 10",0,1.7,0,0.6)}; },
   at:function(S, s, p){ var seq=["10 - 10","11 - 10","11 - 11","12 - 11","13 - 11 ✓"], i=Math.min(4,Math.floor(p*5)); if(s.k!==i){ s.k=i; s.lb.parent.remove(s.lb); s.lb=S.st.label(seq[i],0,1.7,0,0.6); } }},
  {t:["Servis bertukar setiap 2 mata","Serve changes every 2 points"], x:["Setiap pemain servis 2 kali bergilir. Pada 10-10, servis bertukar setiap mata.","Each player serves 2 points in turn. From 10-10 the serve changes every point."], cam:[[0,1.5,-3.2],[0,1.2,0]], dur:4,
   set:function(S){ return {a:S.st.label("● ●",-0.5,1.6,0,0.5), b:S.st.label("● ●",0.5,1.6,0,0.5,"#4fc3f7")}; }, at:function(S, s, p){ S.u.show(s.a,p<0.5); S.u.show(s.b,p>=0.5); }},
  {t:["Perlawanan 5 atau 7 game terbaik","Best of 5 or 7 games"], x:["Perlawanan biasanya 3 daripada 5 game, atau 4 daripada 7 dalam kejohanan besar.","Matches are usually best of 5 games, or best of 7 in big events."], cam:[[0,1.5,-3.2],[0,1.2,0]], dur:4,
   set:function(S){ return {a:S.st.label("11-7",-0.6,1.6,0,0.45), b:S.st.label("9-11",0,1.6,0,0.45), c:S.st.label("11-8 ✓",0.7,1.6,0,0.45)}; }, at:function(S, s, p){ S.u.show(s.b,p>0.33); S.u.show(s.c,p>0.66); }},
  {t:["Bucu vs sisi meja","Edge vs side"], x:["Bola yang kena bucu atas meja (edge) dikira masuk. Bola yang kena sisi tepi meja di bawah permukaan dikira keluar.","A ball that clips the top edge counts as in. A ball that hits the side of the table below the top is out."], cam:[[1.3,0.95,1.2],[W/2,TH,0.8]], dur:4,
   set:function(S){ return {b:pb(S), l1:S.st.label("EDGE ✓",W/2,1.1,0.8,0.4), l2:S.st.label("SIDE ✗",W/2,1.1,0.8,0.4,"#ff6b6b")}; },
   at:function(S, s, p){ var e=p<0.5, q=(p*2)%1; S.u.arc(s.b,[0,1.1,-0.6],[W/2,e?TH:TH-0.03,0.8],0.2,S.seg(q,0,0.6)); S.u.show(s.l1,e&&q>0.6); S.u.show(s.l2,!e&&q>0.6); }},
  {t:["Tangan bebas jangan di meja","Free hand off the table"], x:["Bola boleh kena tangan yang memegang bet. Tetapi tangan bebas tidak boleh menyentuh meja semasa rali: itu kesalahan.","The ball may touch the hand holding the bat. But your free hand must not touch the table during a rally: that is a fault."], cam:[[1.5,1.6,-2.4],[0,0.9,-1.2]], dur:3,
   set:function(S){ var a=S.st.body(S.H,S.team(0)); bat(S,a); S.place(a,0,-HL-0.35,0); return {a:a, lb:S.st.label("FAULT",-0.3,1.8,-HL,0.5,"#ff6b6b")}; },
   at:function(S, s, p){ S.pose(s.a,"ready",0); s.a.userData.J.shL.rotation.set(-1.2*S.seg(p,0.2,0.5),0,-0.2); S.u.show(s.lb,p>0.5); }}],
 quiz:[
  {q:["Game ping pong dimainkan hingga…","A table tennis game is played to…"], a:[["11","11"],["15","15"],["21","21"]], ok:0, why:["11 mata, menang dengan beza 2.","11 points, win by 2."]},
  {q:["Bola perlu dilambung sekurang-kurangnya…","The serve toss must be at least…"], a:[["5 cm","5 cm"],["16 cm","16 cm"],["50 cm","50 cm"]], ok:1, why:["16 cm, tegak dari tapak tangan terbuka.","16 cm, straight up from an open palm."]},
  {q:["Servis menyentuh jaring dan masuk. Apa jadi?","A serve touches the net and lands in. What happens?"], a:[["Let: servis semula","Let: serve again"],["Mata untuk server","Point to the server"]], ok:0, why:["Itu let.","That is a let."]},
  {q:["Servis bertukar setiap…","The serve changes every…"], a:[["1 mata","1 point"],["2 mata","2 points"],["5 mata","5 points"]], ok:1, why:["Setiap 2 mata (setiap mata dari 10-10).","Every 2 points (every point from 10-10)."]},
  {q:["Bola kena sisi tepi meja (di bawah permukaan). Masuk?","The ball hits the side of the table (below the top). In?"], a:[["Masuk","In"],["Keluar","Out"]], ok:1, why:["Sisi = keluar. Bucu atas = masuk.","Side = out. Top edge = in."]}],
 game:SportView.rally({ name:["Rali ping pong","Ping pong rally"], help:["Ketik bila bola masuk bulatan hijau. Leret kiri atau kanan untuk menghala ke sudut. Yang pertama 11 mata.","Tap when the ball enters the green ring. Swipe left or right to aim for a corner. First to 11 points."],
   icon:"🏓", cam:[0,1.55,-HL-1.6], at:[0,0.9,0], me:[0,-HL-0.45], op:[0,HL+0.45], win:11, ball:pb, gear:bat,
   inPath:function(G){ var x=(Math.random()-0.5)*1.1, sp=Math.max(0.55,0.95-G.rally*0.04); return {pts:[[0,1,HL],[x*0.7,TH+0.02,-0.7],[x,0.98,-HL-0.1]], hs:[0.25,0.25], d:sp}; },
   outPath:function(G, aim){ var x=aim*0.55+(Math.random()-0.5)*0.4; return {pts:[[G.b.position.x,G.b.position.y,G.b.position.z],[x,TH+0.02,0.7],[x,1,HL+0.1]], hs:[0.25,0.25], d:0.8}; },
   ai:function(G, aim){ return 0.12+0.035*G.rally+(aim?0.12:0); } }) };
})();
