/* My Ihsan 0.5.25 Falak: a small astronomy engine, offline, no data files.
   Sun: Meeus ch. 25 (about 0.01 deg). Moon: Meeus ch. 47 with the main 50 + 43 + 30 terms (about 0.02 deg), topocentric parallax (ch. 40).
   Planets: JPL approximate Keplerian elements (Standish, 1800-2050, under 1 deg). Stars: 60 bright stars, J2000.
   New and full moons are found from this same ephemeris; eclipses are found at each new / full moon and their local circumstances
   worked out by stepping through the event. Hilal criteria: MABIMS 2021 (alt >= 3, elongation >= 6.4), Odeh 2004, Yallop 1997, Istanbul 1978.
   Times are Date objects (UTC inside). Angles in degrees. Azimuth from north, clockwise. */
(function(){ "use strict";
var R = Math.PI/180, D = 180/Math.PI;
function sn(x){ return Math.sin(x*R); } function cs(x){ return Math.cos(x*R); }
function nrm(x){ x %= 360; return x < 0 ? x + 360 : x; }
function jdOf(date){ return date.getTime()/86400000 + 2440587.5; }
function dateOf(jd){ return new Date((jd - 2440587.5)*86400000); }
function dT(jd){ var y = 2000 + (jd - 2451545)/365.25; return (69.2 + 0.4*(y - 2025))/86400; } // TT - UT, days (about 69 s now)
function obl(T){ var Om = 125.04452 - 1934.136261*T; return 23.439291 - 0.0130042*T + 0.00256*cs(Om); }
function nutLon(T){ var Om = 125.04452 - 1934.136261*T, L = 280.4665 + 36000.7698*T, Lp = 218.3165 + 481267.8813*T; return (-17.20*sn(Om) - 1.32*sn(2*L) - 0.23*sn(2*Lp) + 0.21*sn(2*Om))/3600; }
function eq(lam, bet, e){ var ra = Math.atan2(sn(lam)*cs(e) - Math.tan(bet*R)*sn(e), cs(lam))*D, de = Math.asin(sn(bet)*cs(e) + cs(bet)*sn(e)*sn(lam))*D; return {ra: nrm(ra), dec: de}; }
function gmst(jd){ var T = (jd - 2451545)/36525; return nrm(280.46061837 + 360.98564736629*(jd - 2451545) + 0.000387933*T*T); }

// ---------- sun ----------
function sun(date){ var jd = jdOf(date), T = (jd + dT(jd) - 2451545)/36525;
  var L0 = 280.46646 + 36000.76983*T + 0.0003032*T*T, M = 357.52911 + 35999.05029*T - 0.0001537*T*T, e = 0.016708634 - 0.000042037*T;
  var C = (1.914602 - 0.004817*T - 0.000014*T*T)*sn(M) + (0.019993 - 0.000101*T)*sn(2*M) + 0.000289*sn(3*M);
  var tl = L0 + C, v = M + C, Rr = 1.000001018*(1 - e*e)/(1 + e*cs(v)), Om = 125.04 - 1934.136*T, lam = nrm(tl - 0.00569 - 0.00478*sn(Om));
  var p = eq(lam, 0, obl(T)); p.lon = lam; p.lat = 0; p.dist = Rr*149597870.7; p.r = Rr; p.sd = 959.63/3600/Rr; p.hp = 8.794/3600/Rr; return p; }

// ---------- moon ----------
var ML = [[0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],[2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],[2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],[1,0,-2,0,-487]];
var MR = [[0,0,1,0,-20905355],[2,0,-1,0,-3699111],[2,0,0,0,-2955968],[0,0,2,0,-569925],[0,1,0,0,48888],[0,0,0,2,-3149],[2,0,-2,0,246158],[2,-1,-1,0,-152138],[2,0,1,0,-170733],[2,-1,0,0,-204586],[0,1,-1,0,-129620],[1,0,0,0,108743],[0,1,1,0,104755],[2,0,0,-2,10321],[0,0,1,-2,79661],[4,0,-1,0,-34782],[0,0,3,0,-23210],[4,0,-2,0,-21636],[2,1,-1,0,24208],[2,1,0,0,30824],[1,0,-1,0,-8379],[1,1,0,0,-16675],[2,-1,1,0,-12831],[2,0,2,0,-10445],[4,0,0,0,-11650],[2,0,-3,0,14403],[0,1,-2,0,-7003],[2,-1,-2,0,10056],[1,0,1,0,6322],[2,-2,0,0,-9884],[0,1,2,0,5751],[2,-2,-1,0,-4950],[2,0,1,-2,4130],[4,-1,-1,0,-3958],[3,0,-1,0,3258],[2,1,1,0,2616],[4,-1,-2,0,-1897],[0,2,-1,0,-2117],[2,2,-1,0,2354],[4,0,1,0,-1423],[0,0,4,0,-1117],[4,-1,0,0,-1571],[1,0,-2,0,-1739]];
var MB = [[0,0,0,1,5128122],[0,0,1,1,280602],[0,0,1,-1,277693],[2,0,0,-1,173237],[2,0,-1,1,55413],[2,0,-1,-1,46271],[2,0,0,1,32573],[0,0,2,1,17198],[2,0,1,-1,9266],[0,0,2,-1,8822],[2,-1,0,-1,8216],[2,0,-2,-1,4324],[2,0,1,1,4200],[2,1,0,-1,-3359],[2,-1,-1,1,2463],[2,-1,0,1,2211],[2,-1,-1,-1,2065],[0,1,-1,-1,-1870],[4,0,-1,-1,1828],[0,1,0,1,-1794],[0,0,0,3,-1749],[0,1,-1,1,-1565],[1,0,0,1,-1491],[0,1,1,1,-1475],[0,1,1,-1,-1410],[0,1,0,-1,-1344],[1,0,0,-1,-1335],[0,0,3,1,1107],[4,0,0,-1,1021],[4,0,-1,1,833]];
function moon(date){ var jd = jdOf(date), T = (jd + dT(jd) - 2451545)/36525;
  var Lp = nrm(218.3164477 + 481267.88123421*T - 0.0015786*T*T), Dd = nrm(297.8501921 + 445267.1114034*T - 0.0018819*T*T), M = nrm(357.5291092 + 35999.0502909*T),
      Mp = nrm(134.9633964 + 477198.8675055*T + 0.0087414*T*T), F = nrm(93.2720950 + 483202.0175233*T - 0.0036539*T*T),
      A1 = 119.75 + 131.849*T, A2 = 53.09 + 479264.290*T, A3 = 313.45 + 481266.484*T, E = 1 - 0.002516*T - 0.0000074*T*T;
  var f = function(t){ var e = Math.abs(t[1]) === 1 ? E : Math.abs(t[1]) === 2 ? E*E : 1; return {a: t[0]*Dd + t[1]*M + t[2]*Mp + t[3]*F, e: e}; };
  var sl = 0, sr = 0, sb = 0;
  ML.forEach(function(t){ var x = f(t); sl += t[4]*x.e*sn(x.a); });
  MR.forEach(function(t){ var x = f(t); sr += t[4]*x.e*cs(x.a); });
  MB.forEach(function(t){ var x = f(t); sb += t[4]*x.e*sn(x.a); });
  sl += 3958*sn(A1) + 1962*sn(Lp - F) + 318*sn(A2);
  sb += -2235*sn(Lp) + 382*sn(A3) + 175*sn(A1 - F) + 175*sn(A1 + F) + 127*sn(Lp - Mp) - 115*sn(Lp + Mp);
  var lam = nrm(Lp + sl/1e6 + nutLon(T)), bet = sb/1e6, dist = 385000.56 + sr/1000;
  var p = eq(lam, bet, obl(T)); p.lon = lam; p.lat = bet; p.dist = dist; p.hp = Math.asin(6378.14/dist)*D; p.sd = 358473400/dist/3600; return p; }

// ---------- planets ----------
var EL = {merkurius: [0.38709927,0.00000037,0.20563593,0.00001906,7.00497902,-0.00594749,252.25032350,149472.67411175,77.45779628,0.16047689,48.33076593,-0.12534081],
  zuhrah: [0.72333566,0.00000390,0.00677672,-0.00004107,3.39467605,-0.00078890,181.97909950,58517.81538729,131.60246718,0.00268329,76.67984255,-0.27769418],
  bumi: [1.00000261,0.00000562,0.01671123,-0.00004392,-0.00001531,-0.01294668,100.46457166,35999.37244981,102.93768193,0.32327364,0,0],
  marikh: [1.52371034,0.00001847,0.09339410,0.00007882,1.84969142,-0.00813131,-4.55343205,19140.30268499,-23.94362959,0.44441088,49.55953891,-0.29257343],
  musytari: [5.20288700,-0.00011607,0.04838624,-0.00013253,1.30439695,-0.00183714,34.39644051,3034.74612775,14.72847983,0.21252668,100.47390909,0.20469106],
  zuhal: [9.53667594,-0.00125060,0.05386179,-0.00050991,2.48599187,0.00193609,49.95424423,1222.49362201,92.59887831,-0.41897216,113.66242448,-0.28867794]};
function helio(k, T){ var e0 = EL[k], a = e0[0] + e0[1]*T, e = e0[2] + e0[3]*T, I = e0[4] + e0[5]*T, L = e0[6] + e0[7]*T, w = e0[8] + e0[9]*T, O = e0[10] + e0[11]*T;
  var M = nrm(L - w), om = w - O, E = M + D*e*sn(M); for(var i = 0; i < 8; i++) E = E - (E - D*e*sn(E) - M)/(1 - e*cs(E));
  var xp = a*(cs(E) - e), yp = a*Math.sqrt(1 - e*e)*sn(E);
  return {x: (cs(om)*cs(O) - sn(om)*sn(O)*cs(I))*xp + (-sn(om)*cs(O) - cs(om)*sn(O)*cs(I))*yp,
          y: (cs(om)*sn(O) + sn(om)*cs(O)*cs(I))*xp + (-sn(om)*sn(O) + cs(om)*cs(O)*cs(I))*yp,
          z: sn(om)*sn(I)*xp + cs(om)*sn(I)*yp}; }
function planet(k, date){ var jd = jdOf(date), T = (jd - 2451545)/36525, p = helio(k, T), b = helio("bumi", T), x = p.x - b.x, y = p.y - b.y, z = p.z - b.z, d = Math.sqrt(x*x + y*y + z*z);
  var lam = nrm(Math.atan2(y, x)*D), bet = Math.asin(z/d)*D, q = eq(lam, bet, obl(T)); q.lon = lam; q.lat = bet; q.au = d; return q; }
var PLANETS = [["merkurius","☿","Utarid","Mercury","#c9b8a6"],["zuhrah","♀","Zuhrah","Venus","#ffe7a8"],["marikh","♂","Marikh","Mars","#ff7a52"],["musytari","♃","Musytari","Jupiter","#f2c58b"],["zuhal","♄","Zuhal","Saturn","#e8d48c"]];

// ---------- stars: [name, Arabic, meaning ms, meaning en, RA h, Dec, mag] ----------
var STARS = [
 ["Sirius","الشعرى","Asy-Syi'ra (disebut dalam Surah an-Najm 53:49)","Al-Shi'ra (named in Surah al-Najm 53:49)",6.752,-16.716,-1.46],
 ["Canopus","سهيل","Suhail, bintang yang menandakan arah selatan","Suhayl, the star that marks the south",6.399,-52.696,-0.74],
 ["Rigil Kentaurus","رجل قنطورس","Kaki si Kentaurus","Foot of the Centaur",14.660,-60.834,-0.27],
 ["Arcturus","السماك الرامح","As-Simak ar-Ramih, si pembawa lembing","Al-Simak al-Ramih, the lance bearer",14.261,19.182,-0.05],
 ["Vega","النسر الواقع","An-Nasr al-Waqi', helang yang menjunam","Al-Nasr al-Waqi', the swooping eagle",18.616,38.784,0.03],
 ["Capella","العيوق","Al-'Ayyuq","Al-'Ayyuq",5.278,45.998,0.08],
 ["Rigel","رجل الجوزاء","Kaki al-Jauza' (Orion)","Foot of al-Jawza' (Orion)",5.242,-8.202,0.13],
 ["Procyon","الشعرى الشامية","Asy-Syi'ra yang di sebelah Syam","The northern Shi'ra",7.655,5.225,0.34],
 ["Achernar","آخر النهر","Hujung sungai","End of the river",1.629,-57.237,0.46],
 ["Betelgeuse","يد الجوزاء","Tangan al-Jauza'","Hand of al-Jawza'",5.919,7.407,0.50],
 ["Hadar","حضار","Hadar","Hadar",14.064,-60.373,0.61],
 ["Altair","النسر الطائر","An-Nasr at-Ta'ir, helang yang terbang","Al-Nasr al-Ta'ir, the flying eagle",19.846,8.868,0.76],
 ["Acrux","","Bintang Pari (Salib Selatan)","Southern Cross",12.443,-63.099,0.77],
 ["Aldebaran","الدبران","Ad-Dabaran, si pengikut (mengikut Thurayya)","Al-Dabaran, the follower (of the Pleiades)",4.599,16.509,0.86],
 ["Antares","قلب العقرب","Hati kala jengking","Heart of the scorpion",16.490,-26.432,0.96],
 ["Spica","السماك الأعزل","As-Simak al-A'zal, yang tidak bersenjata","Al-Simak al-A'zal, the unarmed one",13.420,-11.161,0.97],
 ["Pollux","","Kembar (Gemini)","The Twins (Gemini)",7.755,28.026,1.14],
 ["Fomalhaut","فم الحوت","Mulut ikan","Mouth of the fish",22.961,-29.622,1.16],
 ["Deneb","ذنب الدجاجة","Ekor ayam","Tail of the hen",20.690,45.280,1.25],
 ["Mimosa","","Salib Selatan","Southern Cross",12.795,-59.689,1.25],
 ["Regulus","قلب الأسد","Hati singa","Heart of the lion",10.140,11.967,1.35],
 ["Adhara","العذارى","Gadis-gadis","The maidens",6.977,-28.972,1.50],
 ["Castor","","Kembar (Gemini)","The Twins (Gemini)",7.577,31.888,1.58],
 ["Gacrux","","Salib Selatan","Southern Cross",12.519,-57.113,1.59],
 ["Shaula","الشولة","Sengat kala jengking","The scorpion's sting",17.560,-37.104,1.62],
 ["Bellatrix","","Bahu al-Jauza'","Shoulder of Orion",5.419,6.350,1.64],
 ["Elnath","النطح","Yang menanduk","The butting one",5.438,28.608,1.65],
 ["Alnilam","النظام","Untaian mutiara","The string of pearls",5.604,-1.202,1.69],
 ["Alnitak","النطاق","Ikat pinggang","The girdle",5.679,-1.943,1.77],
 ["Alioth","الحوت","Alioth","Alioth",12.900,55.960,1.77],
 ["Dubhe","الدب","Beruang","The bear",11.062,61.751,1.79],
 ["Mirfak","المرفق","Siku","The elbow",3.405,49.861,1.79],
 ["Wezen","الوزن","Berat","The weight",7.140,-26.393,1.83],
 ["Alkaid","القائد","Pemimpin","The leader",13.792,49.313,1.86],
 ["Alhena","الهنعة","Tanda di leher unta","The mark on the camel's neck",6.629,16.399,1.93],
 ["Polaris","الجدي","Al-Jadyu, bintang utara","Al-Jadi, the North Star",2.530,89.264,1.98],
 ["Alphard","الفرد","Yang bersendirian","The solitary one",9.460,-8.659,1.98],
 ["Hamal","الحمل","Anak biri-biri","The lamb",2.120,23.462,2.00],
 ["Diphda","الضفدع","Katak","The frog",0.727,-17.987,2.02],
 ["Mirach","المئزر","Kain sarung","The waist cloth",1.162,35.621,2.05],
 ["Alpheratz","سرة الفرس","Pusat kuda","Navel of the horse",0.140,29.091,2.06],
 ["Saiph","سيف الجبار","Pedang si gagah","Sword of the giant",5.796,-9.670,2.06],
 ["Rasalhague","رأس الحواء","Kepala si penjinak ular","Head of the snake charmer",17.582,12.560,2.08],
 ["Algol","رأس الغول","Kepala si raksasa","The demon's head",3.136,40.956,2.12],
 ["Denebola","ذنب الأسد","Ekor singa","Tail of the lion",11.818,14.572,2.13],
 ["Mizar","المئزر","Kain sarung","The waist cloth",13.399,54.925,2.23],
 ["Mintaka","المنطقة","Tali pinggang","The belt",5.533,-0.299,2.23],
 ["Merak","المراق","Pinggang","The loins",11.031,56.383,2.37],
 ["Enif","الأنف","Hidung (kuda)","Nose (of the horse)",21.736,9.875,2.39],
 ["Scheat","الساق","Betis","The shin",23.063,28.083,2.42],
 ["Phecda","الفخذ","Paha","The thigh",11.897,53.695,2.44],
 ["Markab","مركب","Pelana","The saddle",23.079,15.205,2.48],
 ["Unukalhai","عنق الحية","Leher ular","Neck of the snake",15.738,6.426,2.63],
 ["Zubenelgenubi","الزبانى الجنوبي","Sepit selatan","The southern claw",14.848,-16.042,2.75],
 ["Algenib","الجنب","Rusuk","The flank",0.220,15.184,2.83],
 ["Thurayya","الثريا","Ath-Thurayya (gugusan Pleiades)","Al-Thurayya (the Pleiades)",3.791,24.105,2.87],
 ["Megrez","المغرز","Pangkal ekor","Root of the tail",12.257,57.033,3.31],
 ["Thuban","الثعبان","Ular naga","The serpent",14.073,64.376,3.65]];
var LINES = [["Betelgeuse","Bellatrix"],["Bellatrix","Mintaka"],["Mintaka","Alnilam"],["Alnilam","Alnitak"],["Alnitak","Saiph"],["Mintaka","Rigel"],["Betelgeuse","Alnitak"],
  ["Dubhe","Merak"],["Merak","Phecda"],["Phecda","Megrez"],["Megrez","Dubhe"],["Megrez","Alioth"],["Alioth","Mizar"],["Mizar","Alkaid"],
  ["Acrux","Gacrux"],["Markab","Scheat"],["Scheat","Alpheratz"],["Alpheratz","Algenib"],["Algenib","Markab"],["Castor","Pollux"],["Antares","Shaula"],["Rigil Kentaurus","Hadar"]];

// ---------- coordinates ----------
function horiz(p, date, lat, lon){ var H = nrm(gmst(jdOf(date)) + lon - p.ra), alt = Math.asin(sn(lat)*sn(p.dec) + cs(lat)*cs(p.dec)*cs(H))*D;
  var az = nrm(Math.atan2(sn(H), cs(H)*sn(lat) - Math.tan(p.dec*R)*cs(lat))*D + 180); return {alt: alt, az: az, ha: H}; }
// topocentric RA/Dec (Meeus ch. 40), height 0
function topo(p, date, lat, lon){ var u = Math.atan(0.99664719*Math.tan(lat*R)), rs = 0.99664719*Math.sin(u), rc = Math.cos(u), sp = sn(p.hp), H = nrm(gmst(jdOf(date)) + lon - p.ra);
  var dA = Math.atan2(-rc*sp*sn(H), cs(p.dec) - rc*sp*cs(H))*D, de = Math.atan2((sn(p.dec) - rs*sp)*cs(dA), cs(p.dec) - rc*sp*cs(H))*D;
  var q = {}; for(var k in p) q[k] = p[k]; q.ra = nrm(p.ra + dA); q.dec = de; q.sd = p.sd*(1 + 0.0000 + sp*Math.sin(Math.asin(sn(lat)*sn(p.dec) + cs(lat)*cs(p.dec)*cs(H)))); return q; }
function refr(alt){ if(alt < -1.9) return 0; return 1.02/Math.tan((alt + 10.3/(alt + 5.11))*R)/60; } // Saemundsson, deg
function sep(a, b){ return Math.acos(Math.max(-1, Math.min(1, sn(a.dec)*sn(b.dec) + cs(a.dec)*cs(b.dec)*cs(a.ra - b.ra))))*D; }
function altOf(body, date, lat, lon){ var p = body === "sun" ? sun(date) : body === "moon" ? topo(moon(date), date, lat, lon) : planet(body, date); return horiz(p, date, lat, lon).alt; }
// next time after t0 (within hrs) that the body crosses h0 going up (rise) or down (set): 10-minute steps then bisection
function cross(body, t0, lat, lon, h0, up, hrs){ var step = 600000, a = t0.getTime(), fa = altOf(body, new Date(a), lat, lon) - h0, end = a + (hrs || 30)*3600000;
  for(var b = a + step; b <= end; b += step){ var fb = altOf(body, new Date(b), lat, lon) - h0;
    if((up && fa < 0 && fb >= 0) || (!up && fa > 0 && fb <= 0)){ var lo = b - step, hi = b; for(var i = 0; i < 20; i++){ var m = (lo + hi)/2, fm = altOf(body, new Date(m), lat, lon) - h0; if((fm >= 0) === up) hi = m; else lo = m; } return new Date((lo + hi)/2); }
    fa = fb; }
  return null; }
function localMidnight(date, tz){ var d = new Date(date.getTime() + tz*3600000); d.setUTCHours(0, 0, 0, 0); return new Date(d.getTime() - tz*3600000); }
// searched around the place's own solar noon, so a phone set to another time zone still gets the right day
function sunset(day, lat, lon, tz){ return cross("sun", solarNoon(day, lat, lon, tz), lat, lon, -0.833, false, 13); }
function sunrise(day, lat, lon, tz){ return cross("sun", new Date(solarNoon(day, lat, lon, tz).getTime() - 13*3600000), lat, lon, -0.833, true, 13); }
// solar noon and the times the sun is h degrees below the horizon (twilight), for one day
function solarNoon(day, lat, lon, tz){ var t = localMidnight(day, tz).getTime() + (12 - lon/15 + tz)*3600000; for(var i = 0; i < 3; i++){ var s = sun(new Date(t)), H = nrm(gmst(jdOf(new Date(t))) + lon - s.ra); if(H > 180) H -= 360; t -= H/360*86164000; } return new Date(t); }
function twilight(day, lat, lon, tz, dep){ var n = solarNoon(day, lat, lon, tz); return {am: cross("sun", new Date(n.getTime() - 14*3600000), lat, lon, -dep, true, 14), pm: cross("sun", n, lat, lon, -dep, false, 14)}; }

// ---------- moon phases ----------
function elong(date){ return nrm(moon(date).lon - sun(date).lon); }
function phaseNear(date, target){ var t = jdOf(date); for(var i = 0; i < 12; i++){ var d = nrm(elong(dateOf(t)) - target); if(d > 180) d -= 360; t -= d/12.1907; if(Math.abs(d) < 1e-6) break; } return dateOf(t); }
function nextPhase(date, target){ var t = phaseNear(new Date(date.getTime() + ((nrm(target - elong(date)))/12.19)*86400000), target); if(t < date) t = phaseNear(new Date(t.getTime() + 29.53*86400000), target); return t; }
function newMoonBefore(date){ var t = phaseNear(new Date(date.getTime() - (elong(date)/12.19)*86400000), 0); if(t > date) t = phaseNear(new Date(t.getTime() - 29.53*86400000), 0); return t; }
function moonInfo(date){ var m = moon(date), s = sun(date), e = sep(m, s), k = (1 - cs(e))/2, el = elong(date), nm = newMoonBefore(date);
  return {illum: k, waxing: el < 180, elong: e, phaseAngle: el, age: (date - nm)/86400000, newMoon: nm, dist: m.dist}; }

// ---------- hilal criteria at one place, on the evening of `day` ----------
function hilal(day, lat, lon, tz){ var ss = sunset(day, lat, lon, tz); if(!ss) return null;
  var ms = cross("moon", new Date(ss.getTime() - 3*3600000), lat, lon, 0.125, false, 30), nm = newMoonBefore(new Date(ss.getTime() + 3600000));
  var lag = ms ? (ms - ss)/60000 : 0, best = new Date(ss.getTime() + Math.max(0, lag)*4/9*60000);
  var at = function(t){ var s0 = sun(t), m0 = moon(t), mt = topo(m0, t, lat, lon), hs = horiz(s0, t, lat, lon), hmg = horiz(m0, t, lat, lon), hm = horiz(mt, t, lat, lon);
    var arcl = sep(mt, s0), w = mt.sd*60*(1 - cs(arcl)), arcv = hmg.alt - hs.alt; // W in arc minutes; ARCV airless geocentric moon - sun (Odeh/Yallop)
    return {t: t, alt: hm.alt + refr(hm.alt), altTopo: hm.alt, altGeo: hmg.alt, sunAlt: hs.alt, az: hm.az, sunAz: hs.az, daz: hm.az - hs.az, elongGeo: sep(m0, s0), arcl: arcl, arcv: arcv, w: w, illum: (1 - cs(arcl))/2}; };
  var a = at(ss), b = at(best), age = (ss - nm)/3600000;
  var poly = function(W){ return -0.1018*W*W*W + 0.7319*W*W - 6.3226*W + 7.1651; };
  var V = b.arcv - poly(b.w), q = (b.arcv - (11.8371 - 6.3226*b.w + 0.7319*b.w*b.w - 0.1018*b.w*b.w*b.w))/10;
  var before = nm < ss;
  var crit = {
    mabims: before && a.altTopo >= 3 && a.elongGeo >= 6.4 ? "A" : "D",
    istanbul: before && a.altTopo >= 5 && a.elongGeo >= 8 ? "A" : "D",
    odeh: !before || lag <= 0 ? "D" : V >= 5.65 ? "A" : V >= 2 ? "B" : V >= -0.96 ? "C" : "D",
    yallop: !before || lag <= 0 ? "D" : q > 0.216 ? "A" : q > -0.014 ? "B" : q > -0.160 ? "C" : q > -0.232 ? "C" : "D",
    uq: before && lag > 0 ? "A" : "D"};
  return {sunset: ss, moonset: ms, lag: lag, conj: nm, age: age, before: before, atSunset: a, best: b, V: V, q: q, crit: crit}; }
// fast version for the world map (sunset found analytically; same criteria)
function hilalFast(day, lat, lon){ var noon = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 12) - lon/15*3600000);
  var s0 = sun(noon), cH = (sn(-0.833) - sn(lat)*sn(s0.dec))/(cs(lat)*cs(s0.dec)); if(cH < -1 || cH > 1) return null;
  var H0 = Math.acos(cH)*D, ss = new Date(noon.getTime() + H0/15*3600000);
  for(var i = 0; i < 2; i++){ var hz = horiz(sun(ss), ss, lat, lon); ss = new Date(ss.getTime() + (hz.alt + 0.833)/ (15*cs(lat)*Math.max(0.2, Math.abs(sn(hz.az)))) * 3600000 * 1); }
  var s = sun(ss), m = moon(ss), mt = topo(m, ss, lat, lon), hm = horiz(mt, ss, lat, lon), hmg = horiz(m, ss, lat, lon), hs = horiz(s, ss, lat, lon), eg = sep(m, s);
  var lagMin = (hmg.alt + 0.7)/ (15*cs(lat)) * 60 * 0.97; // rough moonset lag (minutes)
  var b = new Date(ss.getTime() + Math.max(0, lagMin)*4/9*60000), s2 = sun(b), m2 = moon(b), mt2 = topo(m2, b, lat, lon), arcl = sep(mt2, s2), w = mt2.sd*60*(1 - cs(arcl)), arcv = horiz(m2, b, lat, lon).alt - horiz(s2, b, lat, lon).alt;
  var V = arcv - (-0.1018*w*w*w + 0.7319*w*w - 6.3226*w + 7.1651), q = (arcv - (11.8371 - 6.3226*w + 0.7319*w*w - 0.1018*w*w*w))/10;
  return {ss: ss, alt: hm.alt, elong: eg, V: V, q: q, lag: lagMin, w: w}; }
function gradeFast(r, crit, conj){ if(!r || conj > r.ss || r.lag <= 0) return "D";
  if(crit === "mabims") return r.alt >= 3 && r.elong >= 6.4 ? "A" : "D";
  if(crit === "istanbul") return r.alt >= 5 && r.elong >= 8 ? "A" : "D";
  if(crit === "yallop") return r.q > 0.216 ? "A" : r.q > -0.014 ? "B" : r.q > -0.232 ? "C" : "D";
  return r.V >= 5.65 ? "A" : r.V >= 2 ? "B" : r.V >= -0.96 ? "C" : "D"; }

// ---------- eclipses ----------
function overlap(r1, r2, d){ if(d >= r1 + r2) return 0; if(d <= Math.abs(r1 - r2)) return Math.min(r1, r2)*Math.min(r1, r2)/(r1*r1);
  var a = Math.acos((d*d + r1*r1 - r2*r2)/(2*d*r1)), b = Math.acos((d*d + r2*r2 - r1*r1)/(2*d*r2));
  return (r1*r1*a + r2*r2*b - 0.5*Math.sqrt(Math.max(0, (-d + r1 + r2)*(d + r1 - r2)*(d - r1 + r2)*(d + r1 + r2))))/(Math.PI*r1*r1); }
function eclipses(from, n, lat, lon){ var out = [], t = new Date(from.getTime() - 86400000), guard = 0;
  while(out.length < n && guard++ < 80){
    var nm = nextPhase(t, 0), fm = nextPhase(t, 180), isSolar = nm < fm, c = isSolar ? nm : fm; t = new Date(c.getTime() + 86400000);
    var m = moon(c), s = sun(c);
    if(isSolar){ if(Math.abs(m.lat) > 1.6) continue;
      // closest approach of the shadow axis to Earth's centre (gamma) and the kind of eclipse
      var best = 9, bt = c; for(var k = -180; k <= 180; k += 4){ var tt = new Date(c.getTime() + k*60000), d = sep(moon(tt), sun(tt)); if(d < best){ best = d; bt = tt; } }
      var mm = moon(bt), ss2 = sun(bt), gamma = mm.dist*Math.sin(best*R)/6378.14*(mm.lat < 0 ? -1 : 1);
      if(Math.abs(gamma) > 1.55) continue;
      var kind = Math.abs(gamma) < 0.997 ? (mm.sd > ss2.sd*1.003 ? "total" : mm.sd < ss2.sd*0.997 ? "annular" : "hybrid") : "partial";
      // local: step through, topocentric
      var loc = null; if(lat != null){ var mx = 0, mt0 = null, st = null, en = null;
        for(var k2 = -240; k2 <= 240; k2 += 2){ var t2 = new Date(bt.getTime() + k2*60000), su = sun(t2), mo = topo(moon(t2), t2, lat, lon), alt = horiz(su, t2, lat, lon).alt, ov = overlap(su.sd, mo.sd, sep(su, mo));
          if(ov > 0 && alt > -0.8){ if(!st) st = t2; en = t2; if(ov > mx){ mx = ov; mt0 = t2; } } }
        if(mx > 0) loc = {start: st, max: mt0, end: en, obsc: mx}; }
      out.push({type: "solar", kind: kind, t: bt, gamma: gamma, local: loc}); }
    else { // lunar
      var best2 = 9, bt2 = c; for(var k3 = -180; k3 <= 180; k3 += 4){ var t3 = new Date(c.getTime() + k3*60000), mo2 = moon(t3), su2 = sun(t3), anti = {ra: nrm(su2.ra + 180), dec: -su2.dec}, d2 = sep(mo2, anti); if(d2 < best2){ best2 = d2; bt2 = t3; } }
      var mo3 = moon(bt2), su3 = sun(bt2), pu = 1.02*(0.998340*mo3.hp + su3.hp - su3.sd), pp = 1.02*(0.998340*mo3.hp + su3.hp + su3.sd), umag = (pu + mo3.sd - best2)/(2*mo3.sd), pmag = (pp + mo3.sd - best2)/(2*mo3.sd);
      if(pmag <= 0) continue;
      var kind2 = umag >= 1 ? "total" : umag > 0 ? "partial" : "penumbral";
      var contact = function(rad, dir){ var lo = bt2.getTime(), hi = bt2.getTime() + dir*6*3600000, f = function(x){ var tt = new Date(x), mo = moon(tt), su = sun(tt); return sep(mo, {ra: nrm(su.ra + 180), dec: -su.dec}) - rad; };
        if(f(lo) > 0) return null; for(var i = 0; i < 30; i++){ var mid = (lo + hi)/2; if(f(mid) > 0) hi = mid; else lo = mid; } return new Date((lo + hi)/2); };
      var P1 = contact(pp + mo3.sd, -1), P4 = contact(pp + mo3.sd, 1), U1 = umag > 0 ? contact(pu + mo3.sd, -1) : null, U4 = umag > 0 ? contact(pu + mo3.sd, 1) : null, U2 = umag >= 1 ? contact(pu - mo3.sd, -1) : null, U3 = umag >= 1 ? contact(pu - mo3.sd, 1) : null;
      var vis = null; if(lat != null){ var alts = [P1, bt2, P4].map(function(x){ return x ? altOf("moon", x, lat, lon) : -90; }); vis = {altMax: alts[1], any: alts.some(function(a){ return a > 0; }), atMax: alts[1] > 0}; }
      out.push({type: "lunar", kind: kind2, t: bt2, umag: umag, pmag: pmag, P1: P1, U1: U1, U2: U2, U3: U3, U4: U4, P4: P4, local: vis}); }
  }
  return out; }

// ---------- Rasd al-Qibla: the days the sun passes straight over the Kaaba ----------
var KAABA = [21.4225, 39.8262];
function rasd(year){ var out = [];
  for(var mo = 4; mo <= 7; mo++) for(var d = 1; d <= 31; d++){ var day = new Date(Date.UTC(year, mo, d)); if(day.getUTCMonth() !== mo) continue;
    var n = solarNoon(day, KAABA[0], KAABA[1], 3), s = sun(n), n2 = solarNoon(new Date(day.getTime() + 86400000), KAABA[0], KAABA[1], 3), s2 = sun(n2);
    if((s.dec - KAABA[0])*(s2.dec - KAABA[0]) <= 0){ var f = (KAABA[0] - s.dec)/(s2.dec - s.dec); out.push(f < 0.5 ? n : n2); } }
  return out; }
function qibla(lat, lon){ var p1 = lat*R, p2 = KAABA[0]*R, dl = (KAABA[1] - lon)*R; return nrm(Math.atan2(Math.sin(dl)*Math.cos(p2), Math.cos(p1)*Math.sin(p2) - Math.sin(p1)*Math.cos(p2)*Math.cos(dl))*D); }

window.Astro = {sun: sun, moon: moon, planet: planet, PLANETS: PLANETS, STARS: STARS, LINES: LINES, horiz: horiz, topo: topo, refr: refr, sep: sep, altOf: altOf, cross: cross,
  sunset: sunset, sunrise: sunrise, solarNoon: solarNoon, twilight: twilight, localMidnight: localMidnight, nextPhase: nextPhase, newMoonBefore: newMoonBefore, moonInfo: moonInfo,
  hilal: hilal, hilalFast: hilalFast, gradeFast: gradeFast, eclipses: eclipses, overlap: overlap, rasd: rasd, qibla: qibla, KAABA: KAABA, jdOf: jdOf, gmst: gmst, nrm: nrm};
})();
