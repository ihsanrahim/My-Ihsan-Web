/* Sirah: desert art. Everything is drawn in code (SVG strings), no image files.
   Rule: no human figure, Prophet, angel or Buraq is ever drawn. Places, objects, animals and light only. */
var SirahArt = (function(){
  // ---- seeded noise ----
  function rnd(seed){ var s=seed>>>0||1; return function(){ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
  // Seamless ridge: sum of sines whose periods divide W, so the shape tiles left-right.
  function ridgePath(seed, W, H, base, amp, rough){
    var r=rnd(seed), ks=[1,2,3,5,8,13], ph=ks.map(function(){return r()*6.283;}), am=ks.map(function(k,i){return (i<2?1:rough)/(1+i*0.9);});
    var pts=[], step=6, tot=am.reduce(function(a,b){return a+b;},0);
    for(var x=0;x<=W;x+=step){ var y=0; for(var i=0;i<ks.length;i++) y+=am[i]*Math.sin(ks[i]*6.283*x/W+ph[i]); pts.push(x+","+(base-amp*y/tot).toFixed(1)); }
    return "M0,"+H+" L"+pts.join(" L")+" L"+W+","+H+" Z";
  }
  // Smooth dune: fewer, softer waves.
  function dunePath(seed, W, H, base, amp){
    var r=rnd(seed), ks=[1,2,3], ph=ks.map(function(){return r()*6.283;});
    var d="M0,"+H+" L0,"+base;
    for(var x=0;x<=W;x+=8){ var y=0; for(var i=0;i<3;i++) y+=Math.sin(ks[i]*6.283*x/W+ph[i])/(i+1); d+=" L"+x+","+(base-amp*y/1.83).toFixed(1); }
    return d+" L"+W+","+H+" Z";
  }
  function mix(a,b,t){ var pa=hx(a), pb=hx(b); return "rgb("+[0,1,2].map(function(i){ return Math.round(pa[i]+(pb[i]-pa[i])*t); }).join(",")+")"; }
  function hx(c){ c=c.replace("#",""); return [parseInt(c.substr(0,2),16),parseInt(c.substr(2,2),16),parseInt(c.substr(4,2),16)]; }
  function shade(c,f){ var p=hx(c); return "#"+p.map(function(v){ v=Math.max(0,Math.min(255,Math.round(f<0?v*(1+f):v+(255-v)*f))); return ("0"+v.toString(16)).slice(-2); }).join(""); }

  // ---- small shapes ----
  var CAMEL="M4 18C4 12 8 10 12 10C14 4 20 4 22 9C24 8 26 8 28 10L31 6C32 4 35 4 36 6L37 8L35 9L33 9L31 15C31 18 29 19 27 19L27 28L25 28L25 20L14 20L14 28L12 28L12 20C8 20 5 21 4 18Z";
  function camel(x,y,s,c,flip){ return '<path d="'+CAMEL+'" fill="'+c+'" transform="translate('+x+' '+y+') scale('+(flip?-s:s)+' '+s+')"/>'; }
  function palm(x,y,h,c,lean){ lean=lean||0; var tx=x+lean, ty=y-h, f="";
    [[-22,-4],[-16,-12],[-6,-16],[6,-16],[16,-12],[22,-4],[-12,2],[12,2]].forEach(function(p){ f+='<path d="M'+tx+' '+ty+' Q'+(tx+p[0]*0.6)+' '+(ty+p[1]-6)+' '+(tx+p[0])+' '+(ty+p[1]+6)+'" stroke="'+c+'" stroke-width="3.2" fill="none" stroke-linecap="round"/>'; });
    return '<path d="M'+x+' '+y+' Q'+(x+lean*0.2)+' '+(y-h*0.5)+' '+tx+' '+ty+'" stroke="'+c+'" stroke-width="3.4" fill="none" stroke-linecap="round"/>'+f; }
  function tent(x,y,w,c,c2){ return '<path d="M'+x+' '+y+' L'+(x+w*0.12)+' '+(y-w*0.32)+' L'+(x+w*0.5)+' '+(y-w*0.42)+' L'+(x+w*0.88)+' '+(y-w*0.32)+' L'+(x+w)+' '+y+' Z" fill="'+c+'"/><path d="M'+(x+w*0.42)+' '+y+' L'+(x+w*0.5)+' '+(y-w*0.3)+' L'+(x+w*0.58)+' '+y+'Z" fill="'+(c2||"#000")+'" opacity=".55"/>'; }
  function house(x,y,w,h,c,win){ return '<rect x="'+x+'" y="'+(y-h)+'" width="'+w+'" height="'+h+'" fill="'+c+'"/>'+(win?'<rect x="'+(x+w*0.35)+'" y="'+(y-h*0.62)+'" width="'+(w*0.3)+'" height="'+(h*0.3)+'" fill="'+win+'"/>':''); }
  function sheep(x,y,c){ return '<ellipse cx="'+x+'" cy="'+y+'" rx="5" ry="3.4" fill="'+c+'"/><circle cx="'+(x+5)+'" cy="'+(y-1.5)+'" r="1.8" fill="'+c+'"/><rect x="'+(x-3)+'" y="'+(y+2)+'" width="1.2" height="3" fill="'+c+'"/><rect x="'+(x+2)+'" y="'+(y+2)+'" width="1.2" height="3" fill="'+c+'"/>'; }
  function bird(x,y,s,c){ return '<path d="M'+x+' '+y+' q'+(3*s)+' '+(-3*s)+' '+(6*s)+' 0 q'+(3*s)+' '+(-3*s)+' '+(6*s)+' 0" stroke="'+c+'" stroke-width="1.4" fill="none"/>'; }
  function kaabah(x,y,s,P){ var w=44*s,h=50*s,d=16*s;
    return '<polygon points="'+(x+w)+','+(y-h)+' '+(x+w+d)+','+(y-h-6*s)+' '+(x+w+d)+','+(y-6*s)+' '+(x+w)+','+y+'" fill="'+shade(P.s,0.12)+'"/>'+
      '<polygon points="'+x+','+(y-h)+' '+(x+d)+','+(y-h-6*s)+' '+(x+w+d)+','+(y-h-6*s)+' '+(x+w)+','+(y-h)+'" fill="'+shade(P.s,0.2)+'"/>'+
      '<rect x="'+x+'" y="'+(y-h)+'" width="'+w+'" height="'+h+'" fill="'+P.s+'"/>'+
      '<rect x="'+x+'" y="'+(y-h+9*s)+'" width="'+w+'" height="'+(4*s)+'" fill="'+P.g+'"/>'+
      '<polygon points="'+(x+w)+','+(y-h+9*s)+' '+(x+w+d)+','+(y-h+3*s)+' '+(x+w+d)+','+(y-h+7*s)+' '+(x+w)+','+(y-h+13*s)+'" fill="'+P.g+'" opacity=".8"/>'+
      '<rect x="'+(x+w*0.62)+'" y="'+(y-h*0.5)+'" width="'+(8*s)+'" height="'+(15*s)+'" fill="'+P.g+'" opacity=".85"/>'; }
  function mountain(pts,c){ return '<path d="M'+pts+'Z" fill="'+c+'"/>'; }
  function glow(x,y,r,c,o){ return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'" opacity="'+(o||0.35)+'"/><circle cx="'+x+'" cy="'+y+'" r="'+(r*0.45)+'" fill="'+c+'" opacity="'+Math.min(1,(o||0.35)*2)+'"/>'; }
  function stars(n,seed,c){ var r=rnd(seed), h=""; for(var i=0;i<n;i++) h+='<circle cx="'+(r()*200).toFixed(1)+'" cy="'+(r()*55).toFixed(1)+'" r="'+(0.5+r()*0.9).toFixed(2)+'" fill="'+c+'" opacity="'+(0.4+r()*0.6).toFixed(2)+'"/>'; return h; }
  function ground(P){ return '<path d="M0 112 Q50 104 100 110 T200 108 L200 120 L0 120Z" fill="'+P.m+'" opacity=".6"/>'; }

  // ---- scenes (viewBox 0 0 200 120, ground at ~112) ----
  // P = {s: silhouette, m: mid, l: light, g: glow/gold}
  var SC={
    arabia:function(P){ return mountain("0 112 L30 84 L55 98 L90 70 L130 96 L160 80 L200 104 L200 120 L0 120",P.m)+tent(20,112,46,P.s)+tent(70,114,34,P.s)+camel(120,84,1,P.s)+camel(150,86,0.9,P.s)+palm(185,114,34,P.s,-4); },
    kaabah:function(P){ return house(8,112,22,18,P.m)+house(30,112,16,26,P.m)+house(162,112,20,22,P.m)+house(180,112,18,16,P.m)+'<ellipse cx="104" cy="113" rx="74" ry="6" fill="'+P.l+'" opacity=".22"/>'+kaabah(80,112,1,P); },
    zamzam:function(P){ return kaabah(28,112,0.7,P)+'<ellipse cx="128" cy="100" rx="26" ry="7" fill="'+P.s+'"/><rect x="102" y="100" width="52" height="12" fill="'+P.s+'"/><ellipse cx="128" cy="100" rx="20" ry="4.5" fill="'+P.g+'" opacity=".55"/><path d="M110 100 L128 70 L146 100" stroke="'+P.s+'" stroke-width="3" fill="none"/><path d="M128 70 L128 90" stroke="'+P.l+'" stroke-width="1"/><rect x="124" y="88" width="8" height="7" fill="'+P.m+'"/>'; },
    elephant:function(P){ var e=function(x,y,s){ return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse cx="20" cy="0" rx="20" ry="13" fill="'+P.s+'"/><circle cx="42" cy="-4" r="9" fill="'+P.s+'"/><path d="M49 -2 Q56 10 50 18" stroke="'+P.s+'" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="4" y="8" width="6" height="14" fill="'+P.s+'"/><rect x="28" y="8" width="6" height="14" fill="'+P.s+'"/></g>'; };
      var b=""; for(var i=0;i<14;i++) b+=bird(20+((i*37)%170),12+((i*23)%38),1+(i%3)*0.2,P.s); return mountain("0 112 L40 92 L80 104 L130 86 L200 102 L200 120 L0 120",P.m)+e(30,90,1)+e(110,94,0.8)+b; },
    birth:function(P){ return mountain("0 112 L25 70 L60 90 L95 60 L130 92 L165 66 L200 96 L200 120 L0 120",P.m)+house(40,112,24,22,P.s,P.g)+house(66,112,18,30,P.s)+house(86,112,26,20,P.s,P.g)+house(116,112,20,26,P.s)+house(138,112,24,18,P.s,P.g)+glow(150,34,10,P.g,0.25); },
    tents:function(P){ return mountain("0 112 L60 96 L120 104 L200 92 L200 120 L0 120",P.m)+tent(14,112,52,P.s)+tent(72,112,40,P.s)+tent(118,113,46,P.s)+sheep(150,106,P.l)+sheep(164,109,P.l)+sheep(176,105,P.l)+sheep(140,110,P.l)+palm(190,113,30,P.s,-3); },
    abwa:function(P){ return mountain("0 112 L50 100 L110 106 L200 96 L200 120 L0 120",P.m)+'<path d="M96 112 Q100 104 108 104 Q116 104 120 112Z" fill="'+P.s+'"/><rect x="104" y="96" width="4" height="10" fill="'+P.s+'"/>'+tree(150,112,0.8,P.s)+'<path d="M0 116 Q80 110 200 118" stroke="'+P.l+'" stroke-width="1" fill="none" opacity=".5"/>'; },
    caravan:function(P){ return mountain("0 112 L40 96 L90 104 L140 90 L200 106 L200 120 L0 120",P.m)+camel(20,84,1,P.s)+camel(60,84,1,P.s)+camel(100,84,1,P.s)+camel(140,84,1,P.s)+'<path d="M0 112 L200 112" stroke="'+P.l+'" stroke-width="1" stroke-dasharray="3 5" opacity=".6"/>'; },
    market:function(P){ var f=function(x,c){ return '<path d="M'+x+' 112 L'+x+' 70" stroke="'+P.s+'" stroke-width="2"/><path d="M'+x+' 70 L'+(x+16)+' 74 L'+x+' 78Z" fill="'+c+'"/>'; };
      return tent(10,112,44,P.s)+tent(60,112,40,P.s)+tent(108,112,46,P.s)+tent(158,112,38,P.s)+f(34,P.g)+f(84,P.l)+f(132,P.g)+camel(150,92,0.6,P.s); },
    hira:function(P){ return mountain("0 112 L30 90 L60 96 L200 112",P.m)+mountain("20 112 L62 74 L86 42 L100 30 L114 38 L128 56 L160 84 L196 112",P.s)+'<ellipse cx="108" cy="50" rx="6" ry="4" fill="#000" opacity=".8"/>'+glow(108,50,14,P.g,0.3)+'<path d="M60 112 Q80 96 92 80 T106 54" stroke="'+P.l+'" stroke-width="1" fill="none" stroke-dasharray="2 3" opacity=".7"/>'; },
    safa:function(P){ return mountain("10 112 L50 82 L74 76 L100 90 L120 112",P.s)+'<path d="M40 112 Q58 98 70 84" stroke="'+P.l+'" stroke-width="1.2" fill="none" stroke-dasharray="2 3"/>'+kaabah(150,112,0.55,P)+house(128,112,14,14,P.m)+house(178,112,16,18,P.m); },
    arqam:function(P){ return mountain("0 112 L60 88 L120 96 L200 80 L200 120 L0 120",P.m)+house(70,112,50,34,P.s,P.g)+'<rect x="80" y="86" width="6" height="8" fill="'+P.g+'"/><rect x="104" y="86" width="6" height="8" fill="'+P.g+'"/>'+house(122,112,22,22,P.s); },
    ship:function(P){ var w=""; for(var i=0;i<6;i++) w+='<path d="M'+(i*36-10)+' '+(100+(i%2)*6)+' q9 -5 18 0 t18 0" stroke="'+P.l+'" stroke-width="1.2" fill="none" opacity=".7"/>';
      return '<rect x="0" y="92" width="200" height="28" fill="'+P.m+'" opacity=".7"/>'+w+'<path d="M64 92 L136 92 L126 104 L74 104Z" fill="'+P.s+'"/><path d="M100 92 L100 44" stroke="'+P.s+'" stroke-width="2.5"/><path d="M102 46 L134 86 L102 86Z" fill="'+P.l+'"/><path d="M98 52 L76 86 L98 86Z" fill="'+P.l+'" opacity=".8"/>'; },
    court:function(P){ var a=""; for(var i=0;i<5;i++){ var x=18+i*36; a+='<rect x="'+x+'" y="56" width="8" height="56" fill="'+P.s+'"/>'; if(i<4) a+='<path d="M'+(x+8)+' 64 Q'+(x+22)+' 44 '+(x+36)+' 64" stroke="'+P.s+'" stroke-width="6" fill="none"/>'; }
      return a+'<rect x="10" y="46" width="180" height="8" fill="'+P.s+'"/><path d="M90 112 L90 88 L96 80 L104 80 L110 88 L110 112 L106 112 L106 96 L94 96 L94 112Z" fill="'+P.g+'" opacity=".8"/>'; },
    valley:function(P){ return mountain("0 120 L0 30 L30 40 L52 70 L60 112 L0 112",P.s)+mountain("200 120 L200 26 L172 36 L150 66 L140 112 L200 112",P.s)+tent(78,112,26,P.m)+tent(104,112,22,P.m)+glow(100,40,6,P.g,0.25); },
    scroll:function(P){ var l=""; for(var i=0;i<6;i++) l+='<path d="M72 '+(48+i*9)+' L128 '+(48+i*9)+'" stroke="'+P.m+'" stroke-width="1.5"/>';
      var d=""; for(var j=0;j<18;j++) d+='<circle cx="'+(70+(j*17)%62)+'" cy="'+(46+(j*13)%52)+'" r="1.4" fill="'+P.s+'"/>'; return '<rect x="64" y="38" width="72" height="66" fill="'+P.l+'"/><rect x="58" y="34" width="84" height="8" rx="4" fill="'+P.g+'"/><rect x="58" y="100" width="84" height="8" rx="4" fill="'+P.g+'"/>'+l+d+'<text x="100" y="56" text-anchor="middle" font-size="9" fill="'+P.s+'" font-family="serif">باسمك اللهم</text>'; },
    taif:function(P){ var c=""; for(var i=0;i<12;i++) c+='<rect x="'+(40+i*10)+'" y="62" width="6" height="6" fill="'+P.s+'"/>';
      var v=""; for(var j=0;j<10;j++) v+='<circle cx="'+(14+j*19)+'" cy="'+(102-(j%2)*3)+'" r="7" fill="'+P.g+'" opacity=".55"/>'; return mountain("0 112 L30 74 L70 84 L120 66 L170 80 L200 72 L200 120 L0 120",P.m)+'<rect x="40" y="68" width="116" height="26" fill="'+P.s+'"/>'+c+v; },
    aqsa:function(P){ var s=""; for(var r=0;r<4;r++) s+='<path d="M30 '+(98-r*8)+' L170 '+(98-r*8)+'" stroke="'+P.m+'" stroke-width="1"/>'; return '<defs><linearGradient id="lb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="'+P.g+'" stop-opacity=".9"/><stop offset="1" stop-color="'+P.g+'" stop-opacity="0"/></linearGradient></defs>'+stars(26,7,P.l)+'<rect x="88" y="0" width="24" height="76" fill="url(#lb)"/>'+mountain("0 112 L30 84 L170 84 L200 112",P.s)+'<rect x="30" y="70" width="140" height="30" fill="'+P.s+'"/>'+s+tree(18,96,0.5,P.s)+tree(186,96,0.5,P.s); },
    aqabah:function(P){ return stars(30,3,P.l)+mountain("0 112 L40 74 L80 66 L118 80 L150 96 L200 100 L200 120 L0 120",P.s)+[50,62,74,88,100].map(function(x,i){ return glow(x,86+(i%2)*3,3,P.g,0.6); }).join("")+'<path d="M0 112 Q100 100 200 108" stroke="'+P.m+'" stroke-width="1" fill="none"/>'; },
    nadwah:function(P){ return house(36,112,128,42,P.s)+'<rect x="88" y="84" width="24" height="28" fill="#000" opacity=".5"/>'+glow(100,104,8,P.g,0.45)+'<rect x="36" y="66" width="128" height="5" fill="'+P.m+'"/>'; },
    house:function(P){ var t=""; [[30,98],[52,108],[150,104],[172,96],[64,92],[136,90]].forEach(function(p){ t+=glow(p[0],p[1],3,P.g,0.6)+'<rect x="'+(p[0]-0.8)+'" y="'+p[1]+'" width="1.6" height="9" fill="'+P.s+'"/>'; });
      return stars(18,11,P.l)+house(76,112,48,38,P.s)+'<rect x="94" y="92" width="12" height="20" fill="#000" opacity=".6"/>'+t; },
    thaur:function(P){ var w=""; for(var i=0;i<6;i++) w+='<path d="M100 66 L'+(100+Math.cos(i*1.05)*12).toFixed(1)+' '+(66+Math.sin(i*1.05)*9).toFixed(1)+'" stroke="'+P.l+'" stroke-width=".6"/>'; w+='<ellipse cx="100" cy="66" rx="6" ry="4.5" fill="none" stroke="'+P.l+'" stroke-width=".6"/><ellipse cx="100" cy="66" rx="11" ry="8" fill="none" stroke="'+P.l+'" stroke-width=".6"/>';
      return stars(20,5,P.l)+mountain("10 112 L50 70 L80 52 L104 40 L130 50 L160 76 L196 112",P.s)+'<ellipse cx="100" cy="66" rx="13" ry="9" fill="#000" opacity=".75"/>'+w; },
    hoof:function(P){ var h=""; for(var i=0;i<9;i++){ var x=20+i*20, y=108-i*3; h+='<path d="M'+x+' '+y+' a4 3 0 1 1 8 0" stroke="'+P.s+'" stroke-width="2" fill="none"/>'; }
      return mountain("0 112 L60 92 L120 100 L200 86 L200 120 L0 120",P.m)+h+'<ellipse cx="176" cy="80" rx="18" ry="8" fill="'+P.l+'" opacity=".35"/>'; },
    tent2:function(P){ return mountain("0 112 L70 100 L140 106 L200 98 L200 120 L0 120",P.m)+tent(50,112,70,P.s)+'<g transform="translate(140 96)"><ellipse cx="0" cy="0" rx="7" ry="4.5" fill="'+P.s+'"/><circle cx="7" cy="-3" r="2.6" fill="'+P.s+'"/><path d="M8 -6 l3 -4" stroke="'+P.s+'" stroke-width="1"/><rect x="-5" y="3" width="1.4" height="6" fill="'+P.s+'"/><rect x="3" y="3" width="1.4" height="6" fill="'+P.s+'"/></g>'; },
    quba:function(P){ return palm(20,112,40,P.s,4)+palm(178,112,44,P.s,-5)+'<rect x="50" y="78" width="100" height="34" fill="'+P.s+'"/><path d="M48 78 L152 78" stroke="'+P.m+'" stroke-width="4"/>'+[0,1,2,3,4].map(function(i){ return '<rect x="'+(58+i*18)+'" y="90" width="8" height="22" fill="#000" opacity=".4"/>'; }).join("")+glow(100,60,6,P.g,0.25); },
    madinah:function(P){ var p=""; for(var i=0;i<8;i++) p+=palm(12+i*25,112,30+(i%3)*9,P.s,(i%2?4:-3)); return mountain("0 112 L40 86 L110 80 L150 92 L200 84 L200 120 L0 120",P.m)+house(60,112,20,14,P.s)+house(116,112,24,12,P.s)+p; },
    masjid:function(P){ var c=""; for(var i=0;i<7;i++) c+='<rect x="'+(30+i*22)+'" y="66" width="5" height="46" fill="'+P.s+'"/>';
      return '<rect x="22" y="58" width="156" height="8" fill="'+P.s+'"/>'+[0,1,2,3,4,5,6,7].map(function(i){ return '<path d="M'+(22+i*20)+' 58 l10 -6 l10 6" stroke="'+P.m+'" stroke-width="2" fill="none"/>'; }).join("")+c+'<rect x="22" y="104" width="156" height="8" fill="'+P.m+'"/>'+palm(10,112,46,P.s,3)+palm(190,112,40,P.s,-4); },
    wells:function(P){ var r=""; for(var i=0;i<26;i++) r+='<path d="M'+((i*41)%200)+' '+((i*17)%60)+' l-3 9" stroke="'+P.l+'" stroke-width=".8" opacity=".55"/>';
      var w=function(x){ return '<ellipse cx="'+x+'" cy="106" rx="16" ry="5" fill="'+P.s+'"/><rect x="'+(x-16)+'" y="98" width="32" height="8" fill="'+P.s+'"/><ellipse cx="'+x+'" cy="98" rx="12" ry="3.4" fill="'+P.g+'" opacity=".5"/>'; };
      return r+mountain("0 112 L50 96 L110 102 L160 88 L200 100 L200 120 L0 120",P.m)+w(50)+w(100)+w(150); },
    uhud:function(P){ return mountain("0 112 L20 70 L50 54 L90 48 L130 52 L170 64 L200 80 L200 120 L0 120",P.s)+mountain("70 112 L92 96 L112 94 L130 112",P.m)+'<path d="M100 95 L100 84 L108 87 L100 90" stroke="'+P.g+'" stroke-width="1.2" fill="'+P.g+'"/>'; },
    trench:function(P){ return mountain("0 98 L40 70 L80 76 L120 64 L170 80 L200 72 L200 98Z",P.m)+house(60,98,18,10,P.s)+house(100,98,24,12,P.s)+house(140,98,16,9,P.s)+'<path d="M0 104 L200 108 L200 116 L0 112Z" fill="#000" opacity=".55"/><path d="M0 104 L200 108" stroke="'+P.l+'" stroke-width="1.2"/>'; },
    forts:function(P){ var f=function(x,h){ var c=""; for(var i=0;i<4;i++) c+='<rect x="'+(x+i*7)+'" y="'+(112-h-5)+'" width="4" height="5" fill="'+P.s+'"/>'; return '<rect x="'+x+'" y="'+(112-h)+'" width="26" height="'+h+'" fill="'+P.s+'"/>'+c+'<rect x="'+(x+10)+'" y="'+(112-h*0.5)+'" width="5" height="8" fill="#000" opacity=".5"/>'; };
      return mountain("0 112 L40 84 L100 90 L160 78 L200 92 L200 120 L0 120",P.m)+f(20,40)+f(70,54)+f(122,46)+palm(170,112,30,P.s,-3)+palm(188,112,26,P.s,2); },
    tree:function(P){ return mountain("0 112 L70 102 L140 106 L200 98 L200 120 L0 120",P.m)+tree(100,112,1.3,P.s)+tent(14,112,30,P.s)+tent(156,112,30,P.s); },
    letters:function(P){ var s=function(x,y,r){ return '<g transform="rotate('+r+' '+x+' '+y+')"><rect x="'+(x-22)+'" y="'+(y-14)+'" width="44" height="28" fill="'+P.l+'"/><rect x="'+(x-25)+'" y="'+(y-16)+'" width="50" height="5" rx="2.5" fill="'+P.g+'"/><rect x="'+(x-25)+'" y="'+(y+11)+'" width="50" height="5" rx="2.5" fill="'+P.g+'"/><circle cx="'+x+'" cy="'+(y+4)+'" r="5" fill="#8b2a1d"/></g>'; };
      return s(50,78,-8)+s(100,70,3)+s(150,80,10)+bird(80,30,1.4,P.l)+bird(130,22,1.2,P.l); },
    greenhills:function(P){ return '<path d="M0 112 Q40 80 90 96 T200 88 L200 120 L0 120Z" fill="#3f6b45"/><path d="M0 112 Q60 96 120 106 T200 104 L200 120 L0 120Z" fill="#2f5636"/>'+tree(40,100,0.55,"#24432a")+tree(150,96,0.6,"#24432a")+tree(170,100,0.45,"#24432a"); },
    fath:function(P){ var r=""; for(var i=1;i<4;i++) r+='<path d="M'+(102-i*12)+' '+(54-i*7)+' Q102 '+(46-i*12)+' '+(102+i*12)+' '+(54-i*7)+'" stroke="'+P.g+'" stroke-width="1.4" fill="none" opacity="'+(1-i*0.25)+'"/>';
      var d=""; [[30,108,70],[44,110,-60],[160,109,80],[176,108,-75],[60,111,90]].forEach(function(p){ d+='<rect x="'+p[0]+'" y="'+(p[1]-3)+'" width="10" height="5" fill="'+P.m+'" transform="rotate('+p[2]+' '+p[0]+' '+p[1]+')"/>'; });
      return '<ellipse cx="104" cy="113" rx="80" ry="6" fill="'+P.l+'" opacity=".22"/>'+kaabah(80,112,1,P)+r+d; },
    hunain:function(P){ return mountain("0 120 L0 40 L40 54 L64 82 L80 112 L0 112",P.s)+mountain("200 120 L200 36 L160 52 L136 84 L122 112 L200 112",P.s)+'<path d="M80 112 Q100 100 122 112" fill="'+P.m+'"/>'+glow(100,30,14,P.g,0.3); },
    tabuk:function(P){ var h=""; for(var i=0;i<5;i++) h+='<path d="M'+(20+i*36)+' '+(86+(i%2)*4)+' q6 -4 12 0 t12 0" stroke="'+P.l+'" stroke-width="1" fill="none" opacity=".6"/>';
      return glow(150,30,18,P.g,0.45)+mountain("0 112 L60 104 L130 108 L200 100 L200 120 L0 120",P.m)+h+'<ellipse cx="70" cy="106" rx="14" ry="4" fill="'+P.s+'"/><rect x="56" y="100" width="28" height="6" fill="'+P.s+'"/>'+palm(120,112,26,P.s,3); },
    arafah:function(P){ var t=""; for(var i=0;i<34;i++){ var x=(i*29)%196, y=100+((i*7)%14); t+='<path d="M'+x+' '+y+' l5 -7 l5 7Z" fill="'+P.l+'" opacity=".9"/>'; }
      return mountain("0 96 L40 72 L80 82 L120 68 L160 80 L200 70 L200 96Z",P.m)+mountain("80 98 L96 84 L112 82 L128 98",P.s)+'<rect x="0" y="96" width="200" height="24" fill="'+P.m+'" opacity=".5"/>'+t; },
    sunset:function(P){ var p=""; for(var i=0;i<6;i++) p+=palm(14+i*36,112,34+(i%3)*10,P.s,(i%2?4:-4)); return '<circle cx="100" cy="98" r="30" fill="'+P.g+'" opacity=".85"/>'+mountain("0 112 L50 92 L110 100 L160 88 L200 98 L200 120 L0 120",P.s)+p; },
    crescent:function(P){ var p=""; for(var i=0;i<5;i++) p+=palm(20+i*40,112,30+(i%2)*10,P.s,(i%2?3:-3)); return stars(40,9,P.l)+'<path d="M146 22 a14 14 0 1 0 10 24 a11 11 0 1 1 -10 -24Z" fill="'+P.g+'"/>'+mountain("0 112 L60 98 L140 104 L200 96 L200 120 L0 120",P.s)+p; },
    book:function(P){ return '<path d="M30 40 Q65 30 100 44 L100 104 Q65 92 30 102Z" fill="'+P.l+'"/><path d="M170 40 Q135 30 100 44 L100 104 Q135 92 170 102Z" fill="'+shade(P.l,-0.08)+'"/>'+[0,1,2,3,4].map(function(i){ return '<path d="M40 '+(54+i*9)+' Q66 '+(48+i*9)+' 92 '+(58+i*9)+'" stroke="'+P.m+'" stroke-width="1.2" fill="none"/><path d="M108 '+(58+i*9)+' Q134 '+(48+i*9)+' 160 '+(54+i*9)+'" stroke="'+P.m+'" stroke-width="1.2" fill="none"/>'; }).join("")+glow(100,36,10,P.g,0.3); }
  };
  function tree(x,y,s,c){ return '<path d="M'+x+' '+y+' L'+x+' '+(y-26*s)+' M'+x+' '+(y-18*s)+' L'+(x-10*s)+' '+(y-28*s)+' M'+x+' '+(y-20*s)+' L'+(x+11*s)+' '+(y-29*s)+'" stroke="'+c+'" stroke-width="'+(3*s)+'" fill="none"/><ellipse cx="'+x+'" cy="'+(y-32*s)+'" rx="'+(30*s)+'" ry="'+(9*s)+'" fill="'+c+'"/>'; }
  SC.charter=SC.letters; SC.family=SC.tree; SC.kaabah2=SC.kaabah;

  function scene(id, P, extra){ var f=SC[id]||SC.arabia; return '<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMax meet" '+(extra||"")+'>'+f(P)+'</svg>'; }

  // Ground decorations for the trail (viewBox centred on 0,0, drawn at given size)
  function deco(kind, c, c2){
    if(kind==="rock") return '<svg viewBox="0 0 40 20"><path d="M2 19 L8 8 L18 3 L30 6 L38 19Z" fill="'+c+'"/><path d="M18 3 L22 19 L38 19 L30 6Z" fill="'+c2+'" opacity=".5"/></svg>';
    if(kind==="bush") return '<svg viewBox="0 0 40 24"><circle cx="12" cy="16" r="7" fill="'+c+'"/><circle cx="21" cy="11" r="9" fill="'+c+'"/><circle cx="30" cy="16" r="7" fill="'+c+'"/><rect x="20" y="16" width="2" height="8" fill="'+c2+'"/></svg>';
    if(kind==="palm") return '<svg viewBox="0 0 60 70">'+palm(30,70,52,c,4)+'</svg>';
    if(kind==="camel") return '<svg viewBox="0 0 42 30">'+camel(1,0,1,c)+'</svg>';
    if(kind==="tent") return '<svg viewBox="0 0 60 26">'+tent(2,26,56,c,c2)+'</svg>';
    return "";
  }
  // Era gate: stone arch over the trail
  function gate(P){ return '<svg viewBox="0 0 200 110" preserveAspectRatio="xMidYMax meet"><rect x="40" y="30" width="16" height="80" fill="'+P.s+'"/><rect x="144" y="30" width="16" height="80" fill="'+P.s+'"/><path d="M40 34 Q100 -14 160 34 L144 34 Q100 6 56 34Z" fill="'+P.s+'"/><rect x="34" y="104" width="28" height="6" fill="'+P.s+'"/><rect x="138" y="104" width="28" height="6" fill="'+P.s+'"/><path d="M56 34 Q100 6 144 34" stroke="'+P.g+'" stroke-width="1.5" fill="none" opacity=".8"/><circle cx="100" cy="16" r="3" fill="'+P.g+'"/></svg>'; }

  // Stylised map of Arabia (equirectangular, lon 30..60, lat 10..35)
  var MAPBOX={lon0:30,lon1:60,lat0:10,lat1:35};
  function proj(lon,lat,W,H){ return [(lon-MAPBOX.lon0)/(MAPBOX.lon1-MAPBOX.lon0)*W, (MAPBOX.lat1-lat)/(MAPBOX.lat1-MAPBOX.lat0)*H]; }
  var ASIA=[[32.5,30.0],[32.3,31.3],[33.8,31.1],[34.4,31.5],[35.0,32.8],[35.5,33.9],[35.9,35.0],[44,35],[48,31.5],[48.0,29.4],[48.4,28.5],[49.6,27.1],[50.1,26.4],[50.6,25.6],[50.8,24.8],[51.3,26.1],[51.6,25.3],[51.6,24.3],[54.0,24.1],[55.3,25.3],[56.1,26.1],[56.3,26.3],[56.4,24.9],[56.7,24.4],[57.8,23.8],[58.6,23.6],[59.8,22.5],[59.3,21.4],[58.5,20.4],[57.8,19.0],[56.6,18.6],[55.4,17.6],[54.1,17.0],[52.2,15.6],[49.1,14.5],[47.0,13.6],[45.0,12.8],[43.5,12.7],[43.25,13.3],[42.95,14.8],[42.7,15.7],[42.6,16.9],[41.8,17.9],[40.9,19.4],[40.3,20.1],[39.2,21.5],[38.9,22.4],[38.1,24.1],[37.2,25.1],[36.5,26.2],[35.7,27.3],[35.2,28.1],[34.9,29.0],[35.0,29.5],[34.6,28.4],[34.3,27.9],[33.5,28.4],[32.6,29.9]];
  var AFRICA=[[30,10],[30,31.2],[32.3,31.3],[32.5,30.0],[32.6,29.4],[33.8,27.2],[34.6,25.5],[35.5,23.9],[36.9,22.0],[37.2,19.6],[38.4,18.0],[39.5,15.6],[41.2,14.4],[42.7,13.0],[43.1,11.6],[44,10.5],[44,10]];
  function poly(arr,W,H){ return arr.map(function(p,i){ var q=proj(p[0],p[1],W,H); return (i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1); }).join(" ")+"Z"; }
  function mapSvg(W,H,pal){
    return '<rect width="'+W+'" height="'+H+'" fill="'+pal.sea+'"/>'+
      '<path d="'+poly(AFRICA,W,H)+'" fill="'+pal.land2+'" stroke="'+pal.edge+'" stroke-width="1"/>'+
      '<path d="'+poly(ASIA,W,H)+'" fill="'+pal.land+'" stroke="'+pal.edge+'" stroke-width="1"/>';
  }
  return {rnd:rnd, ridgePath:ridgePath, dunePath:dunePath, mix:mix, shade:shade, scene:scene, deco:deco, gate:gate, mapSvg:mapSvg, proj:proj, ASIA:ASIA, AFRICA:AFRICA, SCENES:Object.keys(SC)};
})();
