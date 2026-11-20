/* Umrah DIY itinerary maker. Opened from app.js via UmrahOpen(helpers).
   Data: umrah_data.js. Map: MapLibre GL (bundled) with OpenFreeMap tiles online, bundled world outline offline.
   Everything is computed on the phone; booking sites open in the in-app browser. */
window.UmrahOpen = (function(){
  var H, en, ov, root, st, plan=null, tab="jadual", openIdx=-1, map=null, mapMode=null, markers={}, stops=[], mapTimer=0, wiz=null, layers=[], pnum={};
  var DAYC=["#2e9e6b","#d08a2c","#3f7fd0","#c4506a","#8a5cc7","#2a9fb0","#b5a12f","#d0663a","#5b8f3a","#c45fa8"];
  function dayColor(d){ return DAYC[((d||0)%DAYC.length+DAYC.length)%DAYC.length]; }
  function llKey(pp){ var ll=pll(pp); return ll?ll.join(","):null; }
  // number each place by first appearance and remember the day of each visit (pins and rows share the number and day colour)
  function numberPlaces(){ pnum={}; var n=0; stops.forEach(function(o,i){ [o.p, o.to].forEach(function(pp, j){ var k=llKey(pp); if(!k) return; if(!pnum[k]){ n++; pnum[k]={n:n, d:o.d, visits:[], pp:pp}; } pnum[k].visits.push({i:i, d:o.d}); }); o.no=(llKey(o.p)&&pnum[llKey(o.p)])?pnum[llKey(o.p)].n:0; }); }
  function setStops(){ stops=build(plan); numberPlaces(); }
  var KSA=3, MYT=8;

  // ---------- small helpers ----------
  function L(a){ return a ? (en ? (a[1]!=null&&a[1]!==""?a[1]:a[0]) : a[0]) : ""; }
  function esc(s){ return H.esc(String(s==null?"":s)); }
  function q(s){ return root.querySelector(s); }
  function qa(s){ return Array.prototype.slice.call(root.querySelectorAll(s)); }
  function save(){ H.save("ihsan_umrahdiy", st); }
  function pad(n){ return (n<10?"0":"")+n; }
  function hm(m){ m=Math.round(m); var d=Math.floor(m/1440); m=((m%1440)+1440)%1440; return pad(Math.floor(m/60))+":"+pad(m%60); }
  function toMin(s){ var a=String(s).split(":"); return (+a[0])*60+(+a[1]||0); }
  function ymdOf(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
  function parseYmd(s){ var a=s.split("-"); return new Date(+a[0], +a[1]-1, +a[2], 12, 0, 0); }
  function addDays(d,n){ var x=new Date(d); x.setDate(x.getDate()+n); return x; }
  function rm(n){ return "RM "+Math.round(n).toLocaleString("en-US"); }
  function rng(a,b){ return a===b ? rm(a) : rm(a)+" – "+rm(b); }
  function km(a,b){ var R=6371, d2r=Math.PI/180, dl=(b[0]-a[0])*d2r, dn=(b[1]-a[1])*d2r, x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a[0]*d2r)*Math.cos(b[0]*d2r)*Math.sin(dn/2)*Math.sin(dn/2); return 2*R*Math.asin(Math.sqrt(x)); }
  function P(id){ return UM_PLACES[id]; }
  function pll(id){ if(!id) return null; if(typeof id==="object") return id.ll; return P(id) ? P(id).ll : null; }
  function pname(id){ if(!id) return ""; if(typeof id==="object") return id.n; return P(id) ? L(P(id).n) : id; }
  function opt(cat, id){ var o=UM_OPT[cat].o; for(var i=0;i<o.length;i++) if(o[i].id===id) return o[i]; return o[0]; }
  function chosen(cat){ return opt(cat, plan.ch[cat]); }
  var curD=null;
  // extra hotel from a given day (places.hx [{n,ll,c,from}]) wins over the main hotel for that city
  function hxOf(city, d){ if(d==null) d=curD; if(d==null) return null; var best=null; ((plan.places||{}).hx||[]).forEach(function(x){ if(x.c===city && x.from<=d && (!best || x.from>=best.from)) best=x; }); return best; }
  function lname(city, d){ var x=hxOf(city, d); if(x) return x.n; var pl=(plan.places||{})[city]; if(pl) return pl.n; var hn=(plan.hn||{})[city]; return hn ? hn : L(chosen(city==="mk"?"lodgeMk":"lodgeMd").n); }
  var HOTEL_CACHE={};
  function hotelOf(city, d){ var pl=hxOf(city, d)||(plan.places||{})[city]; if(!pl) return chosen(city==="mk"?"lodgeMk":"lodgeMd").at; var k=city+pl.ll.join(","); if(!HOTEL_CACHE[k]) HOTEL_CACHE[k]={n:pl.n, ll:pl.ll, c:city, hotel:1}; return HOTEL_CACHE[k]; }
  function foodOf(city, d, tag){ var all=(plan.places||{})["f"+city]||[], x=null;
    all.forEach(function(f){ if(!x && f.d===d && (!f.meal || f.meal===tag)) x=f; });
    if(!x){ var fs=all.filter(function(f){ return f.d==null; }); if(!fs.length) return null; x=fs[(d*2+(tag==="din"?1:0))%fs.length]; }
    var k="f"+x.ll.join(","); if(!HOTEL_CACHE[k]) HOTEL_CACHE[k]={n:x.n, ll:x.ll, c:city, food:1}; return HOTEL_CACHE[k]; }
  function tierDefault(cat, t){ var o=UM_OPT[cat].o; for(var i=0;i<o.length;i++) if((o[i].t||"").indexOf(t)>=0) return o[i].id; return o[0].id; }
  function ic(n){ var I={back:'<path d="M15 18l-6-6 6-6"/>', more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>', fit:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', loc:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>', layer:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'}; return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+I[n]+'</svg>'; }
  function speedKmh(){ var nd=plan.needs||{}; if(nd.wheel) return 3.5; if(nd.slow||plan.people.s>0) return 3; return 4.5; }
  function walkMin(k){ return Math.round(k/speedKmh()*60); }
  function roadKm(a,b){ return km(a,b)*1.35; }
  function driveMin(k){ return Math.round(k/(k>60?90:k>5?45:28)*60)+6; }
  function pax(){ var p=plan.people; return p.a+p.s+p.c+p.i; }
  function adults(){ return plan.people.a+plan.people.s; }

  // ---------- plan model ----------
  function newPlan(){
    var t=new Date(); t.setDate(t.getDate()+60);
    var home={n:"Kuala Lumpur", ll:[3.139,101.687], ap:"KUL"};
    if(H.S.lat!=null){ var bc=nearestCity(H.S.lat,H.S.lon); home={n:en?"My location":"Lokasi saya", ll:[H.S.lat,H.S.lon], ap:bc[3]}; }
    var p={id:"p"+Date.now(), name:"", tier:"n", people:{a:2,s:0,c:0,i:0}, start:ymdOf(t), days:12, order:"mk", home:home,
      depT:"23:50", retT:"22:30", needs:{male:true, female:true}, ratio:0.8, ch:{}, px:{}, done:{}, del:{}, raud:"", taif:false, check:{}, created:Date.now()};
    applyTier(p,"n"); return p;
  }
  function applyTier(p,t){ p.tier=t; UM_ORDER.forEach(function(c){ p.ch[c]=tierDefault(c,t); }); p.taif=(t==="c"); }
  function nearestCity(la,lo){ var b=UM_CITIES[0], bd=1e9; UM_CITIES.forEach(function(c){ var d=km([la,lo],[c[1],c[2]]); if(d<bd){ bd=d; b=c; } }); return b; }
  function planName(p){ return p.name || ((en?"Umrah ":"Umrah ")+fmtDate(parseYmd(p.start))+" · "+L(UM_TIERS[p.tier]?UM_TIERS[p.tier].n:["Pilihan sendiri","Custom"])); }
  function fmtDate(d, wd){ return d.toLocaleDateString(ibLoc(en), wd?{weekday:"short", day:"numeric", month:"short"}:{day:"numeric", month:"short", year:"numeric"}); }
  function hijriS(d){ var h=H.hijri(d); return h ? h.d+" "+H.hijriMonth(h.m)+" "+h.y+"H" : ""; }
  function split(p){ var nights=Math.max(2,p.days-3), md=Math.max(1,Math.round(nights*0.4)), mk=Math.max(1,nights-md); return {nights:nights, mk:mk, md:md}; }

  // ---------- warnings for dates ----------
  function dateWarn(p){
    var out=[], s=parseYmd(p.start);
    for(var i=0;i<p.days;i++){ var h=H.hijri(addDays(s,i)); if(!h) continue;
      if(h.m===9 && out.indexOf("ram")<0) out.push("ram");
      if(h.m===9 && h.d>=20 && out.indexOf("ram10")<0) out.push("ram10");
      if(((h.m===10 && h.d>=15) || h.m===11 || h.m===12) && out.indexOf("hajj")<0) out.push("hajj");
    }
    return out;
  }
  var WARN={ram:["Ramadan: harga hotel dan tiket biasanya 2-4 kali ganda dan sangat sesak. Jadual memasukkan tarawih dan iftar.","Ramadan: hotel and flight prices are usually 2-4 times higher and it is very crowded. The plan adds tarawih and iftar."],
    ram10:["10 malam terakhir Ramadan: pilihan i'tikaf. Masjid Nabawi memerlukan pendaftaran i'tikaf rasmi.","Last 10 nights of Ramadan: i'tikaf option. Masjid an-Nabawi needs official i'tikaf registration."],
    hajj:["Musim haji: umrah untuk pelawat luar biasanya ditutup dari sekitar pertengahan Syawal hingga selepas haji. Semak di Nusuk sebelum menempah.","Hajj season: umrah for foreign visitors is usually closed from about mid-Shawwal until after hajj. Check Nusuk before booking."]};

  // ---------- the planner ----------
  function prayersFor(date, cityId){
    var ll=pll(cityId==="mk"?"haram":"nabawi"), h=H.hijri(date), ram=h && h.m===9;
    var t=H.calcDay(date, ll[0], ll[1], {fa:18.5, ia:0, im:ram?120:90, tz:3, ik:0});
    return {t:t, ram:ram, fri:date.getDay()===5};
  }
  function build(p){
    plan=p; var out=[], sp=split(p), D=p.days, start=parseYmd(p.start), senior=(p.people.s>0)||(p.needs||{}).slow||(p.needs||{}).wheel;
    var first=p.order, second=first==="mk"?"md":"mk", arrAp=first==="mk"?"jed":"med", depAp=first==="mk"?"med":"jed";
    var fl=chosen("flight"), hrs=fl.hrs||9.5, homeAp=p.home.ap||"KUL", hub=UM_HUB[homeAp]?homeAp:"KUL", needFeeder=homeAp!==hub;
    var homeAll=UM_AIRPORTS[homeAp]||UM_AIRPORTS.KUL;
    var push=function(o){ o.i=out.length; o.key=o.k+"|"+o.d+"|"+(o.p&&o.p.n?o.p.n:o.p)+"|"+(o.tag||""); out.push(o); return o; };
    var homePlace={n:p.home.n, ll:p.home.ll, home:1};
    var apPlace=function(code){ var a=UM_AIRPORTS[code]; return {n:a.n+" ("+code+")", ll:a.ll, ap:code}; };
    // ---- outbound ----
    var dep=toMin(p.depT), hubP=apPlace(hub), homeApP=apPlace(homeAp);
    var leaveBy, feederDur=0;
    if(needFeeder){ var fk=km(homeAll.ll, UM_AIRPORTS[hub].ll); feederDur=Math.round(fk/700*60+40); }
    var toApKm=roadKm(p.home.ll, homeAll.ll), toApMin=Math.round(toApKm/70*60)+15, hm0=chosen("home");
    if(needFeeder){
      var fdep=dep-180-feederDur; leaveBy=fdep-120-toApMin;
      push({d:0, s:leaveBy, e:leaveBy+toApMin, tz:MYT, k:"home", p:homePlace, to:homeApP, mode:hm0.mode||"car", km:toApKm, min:toApMin, n:[ "Bertolak dari rumah, "+p.home.n, "Leave home, "+p.home.n ]});
      push({d:0, s:fdep, e:fdep+feederDur, tz:MYT, k:"flight", p:homeApP, to:hubP, mode:"flight", km:km(homeAll.ll,UM_AIRPORTS[hub].ll), min:feederDur, n:["Penerbangan sambungan "+homeAp+" → "+hub, "Connecting flight "+homeAp+" → "+hub],
        note:["Tiket berasingan: beri sekurang-kurangnya 3 jam untuk sambungan.","Separate ticket: leave at least 3 hours for the connection."]});
    } else {
      leaveBy=dep-180-toApMin;
      push({d:0, s:leaveBy, e:leaveBy+toApMin, tz:MYT, k:"home", p:homePlace, to:hubP, mode:hm0.mode||"car", km:toApKm, min:toApMin, n:["Bertolak dari rumah, "+p.home.n, "Leave home, "+p.home.n]});
    }
    push({d:0, s:dep-180, e:dep-30, tz:MYT, k:"airport", p:hubP, n:["Daftar masuk & pakai ihram, "+UM_AIRPORTS[hub].n, "Check in & put on ihram, "+UM_AIRPORTS[hub].n], hj:first==="mk"?"ihram":"",
      note:first==="mk"?["Lelaki pakai ihram di surau lapangan terbang; niat apabila pesawat menghampiri miqat (Yalamlam / Qarn al-Manazil). Wanita boleh berpakaian biasa yang menutup aurat.","Men change into ihram at the airport surau; make niat when the plane nears the miqat (Yalamlam / Qarn al-Manazil). Women wear normal modest clothes."]:["Ihram dipakai kemudian di Madinah (Bir Ali).","Ihram is worn later, in Madinah (Bir Ali)."]});
    var arrK=dep+hrs*60-(MYT-KSA)*60, arrD=0; while(arrK>=1440){ arrK-=1440; arrD++; }
    var apA=P(arrAp);
    push({d:0, s:dep, e:dep+hrs*60, tz:MYT, k:"flight", p:hubP, to:arrAp, mode:"flight", km:km(UM_AIRPORTS[hub].ll, apA.ll), min:hrs*60, n:[L2(fl.n)+": "+hub+" → "+(apA.code), L2(fl.n)+": "+hub+" → "+apA.code, true],
      note:first==="mk"?["Niat umrah di udara apabila diumumkan miqat. Talbiah hingga mula tawaf.","Make the umrah niat in the air when the miqat is announced. Say the talbiyah until tawaf starts."]:null, bk:fl.bk, hj:first==="mk"?"niat":""});
    var dayA=arrD; // KSA day index of arrival
    var t0=arrK;
    push({d:dayA, s:t0, e:t0+75, tz:KSA, k:"airport", p:arrAp, n:["Tiba & imigresen, "+L(apA.n), "Arrive & immigration, "+L(apA.n)], note:["Imigresen dan bagasi biasanya 1-2 jam. Solat Subuh di surau lapangan terbang jika masuk waktu.","Immigration and bags usually take 1-2 hours. Pray Subuh at the airport prayer room if it is time."]});
    t0+=75;
    // transfer to first city
    var tr=chosen("transfer"), lodge1=chosen(first==="mk"?"lodgeMk":"lodgeMd"), h1=hotelOf(first), trK=roadKm(apA.ll, pll(h1)), trMin=tr.id==="train"?(first==="mk"?100:60):tr.id==="bus"?driveMin(trK)+45:driveMin(trK);
    push({d:dayA, s:t0, e:t0+trMin, tz:KSA, k:"transfer", p:arrAp, to:h1, mode:tr.mode, km:trK, min:trMin, n:[L2(tr.n)+" ke "+(first==="mk"?"Makkah":"Madinah"), L2(tr.n)+" to "+(first==="mk"?"Makkah":"Madinah"), true], bk:tr.bk});
    t0+=trMin;
    // ---- days in Saudi ----
    var nFirst=first==="mk"?sp.mk:sp.md, transferDay=dayA+nFirst, lastDay=dayA+sp.nights; // lastDay = departure day (KSA)
    var retDep=toMin(p.retT), tr2=chosen("transfer"), lodgeLast=chosen(second==="mk"?"lodgeMk":"lodgeMd"), apD=P(depAp);
    var trK2=roadKm(pll(hotelOf(second, lastDay)), apD.ll), trMin2=tr2.id==="train"?(second==="mk"?100:60):tr2.id==="bus"?driveMin(trK2)+45:driveMin(trK2);
    var leaveForAp=retDep-180-trMin2;
    var ic_=chosen("intercity"), icMin=Math.round((ic_.hrs||2.25)*60)+(ic_.mode==="train"?80:0);
    var zr=ziarahPlan(p, dayA, transferDay, lastDay, first, second);
    for(var d=dayA; d<=lastDay; d++){ curD=d;
      var date=addDays(start,d), city=d<transferDay?first:second, lodge=chosen(city==="mk"?"lodgeMk":"lodgeMd");
      var from=d===dayA?t0:0, to=d===lastDay?leaveForAp:1440;
      if(d===dayA){ push({d:d, s:from, e:from+30, tz:KSA, k:"checkin", p:hotelOf(city), n:["Daftar masuk / simpan beg, "+lname(city), "Check in / drop bags, "+lname(city), true], hcity:city, bk:lodge.bk, q:lodge.q,
        note:["Masa daftar masuk biasa 15:00; minta simpan beg jika awal.","Normal check-in is 15:00; ask to leave bags if early."]}); from+=30; }
      if(d===transferDay){
        // leave first city after Zohor
        var pr0=prayersFor(date, first), zEnd=toMin(pr0.t.zohor)+25;
        dayBlocks(out, push, p, d, date, first, from, zEnd, zr, senior, {leaving:first==="mk"});
        var l2=chosen(second==="mk"?"lodgeMk":"lodgeMd"), icK=roadKm(pll(first==="mk"?"haram":"nabawi"), pll(second==="mk"?"haram":"nabawi"));
        var tt=zEnd+(first==="mk"?50:15);
        push({d:d, s:tt, e:tt+20, tz:KSA, k:"checkout", p:hotelOf(first), n:["Daftar keluar, "+lname(first),"Check out, "+lname(first), true]}); tt+=20;
        if(first==="md"){
          push({d:d, s:tt, e:tt+40, tz:KSA, k:"ihram", p:"birali", n:["Bir Ali: solat sunat ihram & niat umrah","Bir Ali: ihram prayer & umrah niat"], hj:"niat", mode:"car", km:roadKm(pll(hotelOf(first)),pll("birali")),
            note:["Mandi sunat ihram dan pakai ihram di hotel. Jika naik kereta api, niat ketika kereta api melepasi miqat (diumumkan) kerana stesen Madinah tidak di Bir Ali.","Take the ihram bath and wear ihram at the hotel. On the train, make niat when it passes the miqat (announced), as Madinah station is not at Bir Ali."]}); tt+=40;
        }
        push({d:d, s:tt, e:tt+icMin, tz:KSA, k:"transfer", p:first==="mk"?"mkst":"mdst", to:hotelOf(second), mode:ic_.mode, km:icK, min:icMin, n:[L2(ic_.n)+": "+(first==="mk"?"Makkah → Madinah":"Madinah → Makkah"), L2(ic_.n)+": "+(first==="mk"?"Makkah → Madinah":"Madinah → Makkah"), true], bk:ic_.bk,
          note:["Musafir: solat Asar boleh dijamak dan diqasar dengan Zohor.","Travelling: Asar can be combined and shortened with Zohor (jamak, qasar)."]}); tt+=icMin;
        push({d:d, s:tt, e:tt+30, tz:KSA, k:"checkin", p:hotelOf(second), n:["Daftar masuk, "+lname(second),"Check in, "+lname(second), true], hcity:second, bk:l2.bk, q:l2.q}); tt+=30;
        dayBlocks(out, push, p, d, date, second, tt, to, zr, senior, {arrive:true});
      } else dayBlocks(out, push, p, d, date, city, from, to, zr, senior, {arrive:d===dayA, last:d===lastDay});
      if(d===lastDay){
        var lc=second;
        push({d:d, s:leaveForAp, e:leaveForAp+trMin2, tz:KSA, k:"transfer", p:hotelOf(second), to:depAp, mode:tr2.mode, km:trK2, min:trMin2, n:[L2(tr2.n)+" ke "+L(apD.n), L2(tr2.n)+" to "+L(apD.n), true], bk:tr2.bk,
          note:["Daftar keluar hotel sebelum 12:00; simpan beg di hotel.","Check out before 12:00; leave bags at the hotel."]});
        push({d:d, s:leaveForAp+trMin2, e:retDep, tz:KSA, k:"airport", p:depAp, n:["Daftar masuk penerbangan pulang, "+L(apD.n), "Check in for the flight home, "+L(apD.n)], tip:["Solat Isyak di surau lapangan terbang (boleh jamak dan qasar dengan Maghrib kerana musafir).","Pray Isyak at the airport prayer room (you may combine and shorten it with Maghrib as a traveller)."], note:["Air zamzam: ikut had syarikat penerbangan (biasanya 5 L dalam kotak rasmi).","Zamzam: follow the airline limit (often 5 L in the official box)."]});
      }
    }
    // ---- return ----
    var retArr=retDep+hrs*60+(MYT-KSA)*60, rd=lastDay; while(retArr>=1440){ retArr-=1440; rd++; }
    push({d:lastDay, s:retDep, e:retDep+hrs*60, tz:KSA, k:"flight", p:depAp, to:hubP, mode:"flight", km:km(apD.ll, UM_AIRPORTS[hub].ll), min:hrs*60, n:[L2(fl.n)+": "+apD.code+" → "+hub, L2(fl.n)+": "+apD.code+" → "+hub, true], bk:fl.bk});
    var tHome=retArr+60;
    push({d:rd, s:retArr, e:tHome, tz:MYT, k:"airport", p:hubP, n:["Tiba di "+UM_AIRPORTS[hub].n, "Arrive at "+UM_AIRPORTS[hub].n]});
    if(needFeeder){ var fd2=tHome+120; push({d:rd, s:fd2, e:fd2+feederDur, tz:MYT, k:"flight", p:hubP, to:homeApP, mode:"flight", km:km(UM_AIRPORTS[hub].ll, homeAll.ll), min:feederDur, n:["Penerbangan sambungan "+hub+" → "+homeAp,"Connecting flight "+hub+" → "+homeAp]}); tHome=fd2+feederDur+30; }
    push({d:rd, s:tHome, e:tHome+toApMin, tz:MYT, k:"travel", p:needFeeder?homeApP:hubP, to:homePlace, mode:hm0.mode||"car", km:toApKm, min:toApMin, n:["Perjalanan pulang ke rumah","Travel home"]});
    push({d:rd, s:tHome+toApMin, e:tHome+toApMin, tz:MYT, k:"homearr", p:homePlace, n:["Sampai rumah, "+p.home.n+". Alhamdulillah","Home, "+p.home.n+". Alhamdulillah"],
      note:["Sunat solat 2 rakaat di masjid berdekatan sebelum masuk rumah.","Sunnah: pray 2 rakaat at a nearby masjid before entering home."]});
    curD=null;
    // drop deleted, fix days for stops spilling over midnight
    out.forEach(function(o){ while(o.s>=1440){ o.s-=1440; o.e-=1440; o.d++; } while(o.s<0){ o.s+=1440; o.e+=1440; o.d--; } });
    // the person's own stops and edits (time, end, day, name, place)
    (p.extra||[]).forEach(function(x){ out.push({d:x.d, s:x.s, e:x.e, tz:x.tz||KSA, k:"custom", p:x.p, n:[x.n,x.n], key:"x|"+x.id, xid:x.id}); });
    var ed=p.edits||{}, changed=(p.extra||[]).length>0;
    out.forEach(function(o){ var e=ed[o.key]; if(!e) return; changed=true; o.edited=1;
      var len=o.e-o.s; if(e.d!=null) o.d=e.d; if(e.s!=null){ o.s=e.s; o.e=e.s+len; } if(e.e!=null) o.e=Math.max(o.s, e.e); if(e.n) o.n=[e.n,e.n]; if(e.p){ o.p=e.p; o.to=null; o.km=0; o.min=0; } });
    out=out.filter(function(o){ return !p.del[o.key]; });
    if(changed){ out.forEach(function(o,i){ o._o=i; }); out.sort(function(a,b){ return a.d-b.d || (a.s-(a.tz-KSA)*60)-(b.s-(b.tz-KSA)*60) || a._o-b._o; }); }
    out.forEach(function(o,i){ o.i=i; });
    p.realDays=Math.max.apply(null, out.map(function(o){ return o.d; }))+1;
    return out;
  }
  function L2(a){ return L(a); }
  // ziarah assignment per day
  function ziarahPlan(p, dayA, transferDay, lastDay, first, second){
    var r={}, pri=p.ratio>=0.9?1:p.ratio>=0.7?2:3, start=parseYmd(p.start);
    function daysOf(c){ var a=[]; for(var d=dayA; d<=lastDay; d++){ var cc=d<transferDay?first:second; if(cc===c && d!==dayA && d!==transferDay && d!==lastDay) a.push(d); } return a; }
    ["mk","md"].forEach(function(c){
      var ds=daysOf(c); if(!ds.length){ for(var d=dayA; d<=lastDay; d++){ var cc=d<transferDay?first:second; if(cc===c && d!==dayA) ds.push(d); } }
      if(!ds.length) return;
      var Z=UM_ZIARAH[c], pick=function(list){ return list.filter(function(z){ return z[3]<=pri; }); };
      var loopDay=ds[Math.min(1,ds.length-1)];
      if(c==="md"){ for(var i=0;i<ds.length;i++) if(addDays(start,ds[i]).getDay()===6){ loopDay=ds[i]; break; } }
      var walkDay=ds.length>1?ds[ds.length>2?2:0]:ds[0]; if(walkDay===loopDay && ds.length>1) walkDay=ds[0]===loopDay?ds[1]:ds[0];
      var K=function(d){ var k=c+":"+d; r[k]=r[k]||{}; return r[k]; };
      K(loopDay).loop=pick(Z.loop);
      K(walkDay).walk=pick(Z.walk).filter(function(z){ return z[0]!=="baqi" && z[0]!=="kurma"; });
      if(c==="md"){ K(ds[0]).baqi=1; K(ds[0]).raud=1; }
      if(p.ratio<0.6){ K(ds[ds.length-1]).extra=Z.extra; }
      if(c==="mk" && p.taif && ds.length>2){ var td=ds[ds.length-1]===loopDay?ds[ds.length-2]:ds[ds.length-1]; K(td).taif=1; }
      K(ds[ds.length-1]).shop=p.ch.shop!=="none";
      if(p.ch.shop==="mid" && ds.length>1){ K(ds[0]).shop=true; }
    });
    return r;
  }
  // one day in a city between [from, to] minutes (KSA)
  function dayBlocks(out, push, p, d, date, city, from, to, zr, senior, fl){
    var pr=prayersFor(date, city), T=pr.t, M=city==="mk"?"haram":"nabawi", mName=pname(M), z=zr[city+":"+d]||{};
    var lodge=chosen(city==="mk"?"lodgeMk":"lodgeMd"), hotel=hotelOf(city), hotelKm=roadKm(pll(hotel), pll(M))*0.8, hotelWalk=walkMin(hotelKm);
    if(fl.last && city==="mk") to-=50;
    var pre=30+(senior?15:0)+(pr.ram?15:0), post=25;
    var blocks=[], add=function(s,e,o){ if(e<=from || s>=to) return null; s=Math.max(s,from); e=Math.min(e,to); if(e-s<10) return null; o.d=d; o.s=s; o.e=e; o.tz=KSA; blocks.push(o); return o; };
    var PRN={subuh:["Subuh","Subuh"],zohor:["Zohor","Zohor"],asar:["Asar","Asar"],maghrib:["Maghrib","Maghrib"],isyak:["Isyak","Isyak"]};
    var walkNote=hotelKm>1.5?["Dari hotel: kira-kira "+hotelKm.toFixed(1)+" km. Naik bas/syuttle atau "+walkMin(hotelKm)+" min berjalan.","From the hotel: about "+hotelKm.toFixed(1)+" km. Take the bus/shuttle or walk "+walkMin(hotelKm)+" min."]:["Dari hotel: kira-kira "+hotelWalk+" min berjalan ("+Math.round(hotelKm*1000)+" m).","From the hotel: about "+hotelWalk+" min walk ("+Math.round(hotelKm*1000)+" m)."];
    ["subuh","zohor","asar","maghrib","isyak"].forEach(function(k){
      var t=toMin(T[k]), pr_=pre, po=post, nm=PRN[k];
      if(k==="zohor" && pr.fri){ pr_=90; po=50; nm=["Jumaat","Jumu'ah"]; }
      if(k==="isyak" && pr.ram) po=120;
      if(k==="maghrib" && pr.ram) pr_=60;
      add(t-pr_, t+po, {k:"prayer", p:M, pk:k, n:[nm[0]+", "+mName, nm[1]+", "+mName], note:walkNote,
        tip:k==="isyak"&&pr.ram?["Termasuk tarawih.","Includes tarawih."]:k==="maghrib"&&pr.ram?["Berbuka puasa di masjid (kurma dan air zamzam disediakan).","Break the fast in the masjid (dates and zamzam are provided)."]:k==="zohor"&&pr.fri?["Datang awal; masjid penuh lebih sejam sebelum khutbah.","Come early; the masjid is full over an hour before the khutbah."]:null, azan:T[k]});
    });
    blocks.sort(function(a,b){ return a.s-b.s; });
    // windows between prayer blocks
    var wins=[], cur=from, sleepAt=22*60+30;
    blocks.forEach(function(b){ if(b.s>cur) wins.push([cur,b.s,b.pk]); cur=Math.max(cur,b.e); });
    if(cur<Math.min(to,sleepAt)) wins.push([cur,Math.min(to,sleepAt),"night"]);
    var acts=[], A=function(s,e,o){ o.d=d; o.s=s; o.e=e; o.tz=KSA; acts.push(o); return e; };
    var umrahPending=(fl.arrive && city==="mk");
    var umrahDur=senior?{t:90,s:20,a:90,c:15}:{t:60,s:20,a:60,c:15}, uTot=umrahDur.t+umrahDur.s+umrahDur.a+umrahDur.c;
    var rest0=fl.arrive?(p.tier==="b"&&!senior?20:senior?120:60):0, restDone=!fl.arrive;
    wins.forEach(function(w){
      var s=w[0], e=w[1], len=e-s, before=w[2];
      if(len<15) return;
      if(before==="subuh" && pr.ram && len>=40){ A(e-40,e,{k:"meal", p:hotel, tag:"sahur", n:["Sahur","Suhoor (pre-dawn meal)"], tip:["Bersahur hingga imsak.","Eat until imsak."]}); return; }
      if(before==="subuh" && s<4*60+30){ if(p.ratio>=0.85 && len>=45) A(e-45,e,{k:"haram", p:M, tag:"tahajjud", n:["Qiamullail & tahajud, "+mName, "Night prayer (tahajjud), "+mName]}); return; }
      if(!restDone){ var r=Math.min(rest0, len); if(r>=15){ s=A(s,s+r,{k:"rest", p:hotel, n:["Rehat di hotel, "+lname(city), "Rest at the hotel, "+lname(city)]}); } restDone=true; len=e-s; if(len<15) return; }
      if(umrahPending && len>=uTot){
        s=A(s,s+umrahDur.t,{k:"umrah", p:"mataf", n:["Tawaf umrah (7 pusingan), Masjidil Haram","Umrah tawaf (7 circuits), Masjid al-Haram"], hj:"tawaf", tawaf:1, note:["Mula di garisan Hajar Aswad, Kaabah di sebelah kiri. Lelaki: idtiba' dan ramal 3 pusingan pertama.","Start at the Black Stone line, Kaabah on your left. Men: idtiba' and ramal in the first 3 circuits."]});
        s=A(s,s+umrahDur.s,{k:"umrah", p:"haram", tag:"st", n:["Solat sunat tawaf & minum zamzam","Tawaf prayer & drink zamzam"], hj:"solat_tawaf"});
        s=A(s,s+umrahDur.a,{k:"umrah", p:"masa", n:["Sa'ie 7 kali Safa → Marwah","Sa'i, 7 lengths Safa → Marwah"], hj:"safa", tawaf:1, note:["Mula di Safa, tamat di Marwah. Lelaki berlari-lari anak di antara lampu hijau.","Start at Safa, end at Marwah. Men jog between the green lights."]});
        s=A(s,s+umrahDur.c,{k:"umrah", p:"masa", tag:"tah", n:["Tahallul (bercukur / bergunting). Umrah selesai","Tahallul (shave or trim). Umrah complete"], hj:"cukur", note:["Lelaki: cukur atau gunting; wanita: potong hujung rambut sedikit.","Men: shave or trim; women: cut a fingertip of hair."]});
        umrahPending=false; len=e-s; if(len<15) return;
      }
      if(before==="zohor"){ // morning
        if(z.baqi && s<toMin(T.syuruk)+60){ s=A(s,s+30,{k:"ziarah", p:"baqi", n:[pname("baqi"),pname("baqi")], mode:"walk", note:[L2(P("baqi").o),L2(P("baqi").o)]}); }
        if(p.ratio>=0.75 && s<toMin(T.syuruk)+20 && toMin(T.syuruk)+20<e){ s=A(s,toMin(T.syuruk)+20,{k:"haram", p:M, tag:"isyraq", n:["Zikir pagi & solat Isyraq/Dhuha, "+mName, "Morning dhikr & Ishraq/Dhuha prayer, "+mName], tip:["Duduk berzikir dari Subuh hingga matahari naik, kemudian 2 rakaat.","Sit in dhikr from Subuh until sunrise, then pray 2 rakaat."]}); }
        if(e-s>=45 && !pr.ram) s=A(s,s+45,{k:"meal", p:hotel, tag:"bf", n:["Sarapan · "+L(chosen("food").n), "Breakfast · "+L(chosen("food").n)]});
        if(z.taif && e-s>=180){ s=A(s,e,{k:"ziarah", p:"taif", n:[pname("taif"),pname("taif")], mode:"car", km:180, note:[L2(P("taif").o),L2(P("taif").o)]}); return; }
        if(z.loop && z.loop.length && e-s>=90){ s=loopStops(A, s, e+20, z.loop, hotel, city); z.loop=null; }
        if(z.extra && e-s>=90){ s=loopStops(A, s, e, z.extra, hotel, city); z.extra=null; }
        var rest=p.ratio>=0.8?60:120; if(e-s>=rest+30){ s=A(s,s+rest,{k:"rest", p:hotel, n:["Rehat di hotel","Rest at the hotel"]}); }
      } else if(before==="asar"){ // after Zohor
        if(e-s>=45 && !pr.ram) { var fl1=foodOf(city,d,"lunch"); s=A(s,s+(fl1?60:45),{k:"meal", p:fl1||hotel, tag:"lunch", n:["Makan tengah hari · "+(fl1?fl1.n:L(chosen("food").n)), "Lunch · "+(fl1?fl1.n:L(chosen("food").n))]}); }
        if(e-s>=60) s=A(s,s+Math.min(90,e-s-15),{k:"rest", p:hotel, tag:"q", n:["Qailulah (tidur sekejap) di hotel","Qailulah (short nap) at the hotel"]});
      } else if(before==="maghrib"){ // after Asar
        if(z.walk && z.walk.length && e-s>=40){ s=walkStops(A, s, e, z.walk, M, city); z.walk=null; }
      } else if(before==="night"){ // after Isyak
        if(e-s>=45) { var fl2=foodOf(city,d,"din"); s=A(s,s+(fl2?60:45),{k:"meal", p:fl2||hotel, tag:"din", n:["Makan malam · "+(fl2?fl2.n:L(chosen("food").n)), "Dinner · "+(fl2?fl2.n:L(chosen("food").n))]}); }
        if(z.raud && e-s>=60){ var rt=plan.raud?toMin(plan.raud):s; s=A(Math.max(s,rt),Math.max(s,rt)+60,{k:"raudhah", p:"raudhah", n:[pname("raudhah")+(plan.raud?"":" (tempah slot)"), pname("raudhah")+(plan.raud?"":" (book a slot)")], bk:["nusuk"], hj:"raudhah", note:[L2(P("raudhah").o),L2(P("raudhah").o)]}); z.raud=null; }
        if(z.shop && e-s>=60){ s=A(s,s+60,{k:"shop", p:city==="md"?"kurma":"clock", n:[city==="md"?"Membeli-belah minimum: Pasar Kurma Madinah":"Membeli-belah minimum: Abraj Al Bait", city==="md"?"Minimal shopping: Madinah Dates Market":"Minimal shopping: Abraj Al Bait mall"], note:["Satu slot sahaja supaya masa di masjid tidak terganggu. Senaraikan barang dahulu.","One slot only so masjid time is protected. Make a list first."]}); z.shop=false; }
      }
      if(e-s>=20 && before!=="night") A(s,e,{k:"haram", p:M, tag:before, n:[(before==="maghrib"?(city==="mk"?"Tawaf sunat / al-Quran, ":"Al-Quran & zikir, "):before==="isyak"?"Kekal di masjid (al-Quran, zikir), ":"Masa di masjid, ")+mName, (before==="maghrib"?(city==="mk"?"Sunnah tawaf / Quran, ":"Quran & dhikr, "):before==="isyak"?"Stay in the masjid (Quran, dhikr), ":"Time in the masjid, ")+mName], tip:city==="mk"?["Tawaf sunat, al-Quran, zikir, doa di Multazam bila lapang.","Sunnah tawaf, Quran, dhikr, doa at the Multazam when there is space."]:["Al-Quran, selawat, zikir; elak bercakap kuat.","Quran, salawat, dhikr; avoid loud talk."]});
    });
    // farewell tawaf when leaving Makkah
    if(fl.leaving || (fl.last && city==="mk")){ var ws=to; { A(ws, ws+45, {k:"umrah", p:"mataf", tag:"wada", n:["Tawaf wida' (tawaf selamat tinggal)","Farewell tawaf (tawaf al-wada')"], hj:"wada", tawaf:1, note:["Wajib dalam mazhab Syafi'i sebelum meninggalkan Makkah; selepas ini terus bertolak.","Required in the Shafi'i school before leaving Makkah; leave straight after."]}); } }
    if(umrahPending && city==="mk"){ var s9=Math.max(from, toMin(T.isyak)+post); A(s9, s9+uTot, {k:"umrah", p:"mataf", tag:"late", n:["Umrah: tawaf, sa'ie & tahallul","Umrah: tawaf, sa'i & tahallul"], hj:"tawaf", tawaf:1}); }
    var all=blocks.concat(acts).sort(function(a,b){ return a.s-b.s || a.e-b.e; });
    all.forEach(function(o){ push(o); });
    if(to>=1440 && !fl.last) push({d:d, s:sleepAt, e:sleepAt+30, tz:KSA, k:"sleep", p:hotel, n:["Tidur awal di "+lname(city), "Sleep early at "+lname(city)], tip:p.ratio>=0.85?["Bangun 45 min sebelum Subuh untuk tahajud di masjid.","Wake 45 min before Subuh for tahajjud in the masjid."]:null});
  }
  function loopStops(A, s, e, list, hotel, city){
    var cur=pll(hotel), left=list.slice(), seq=[];
    while(left.length){ var bi=0, bd=1e9; left.forEach(function(z,i){ var dd=km(cur, pll(z[0])); if(dd<bd){ bd=dd; bi=i; } }); var z=left.splice(bi,1)[0]; seq.push(z); cur=pll(z[0]); }
    var ziar=chosen("ziarah"), prev=hotel, budget=e-s-30;
    var total=function(sq){ var t=0, pv=hotel; sq.forEach(function(z){ t+=driveMin(roadKm(pll(pv),pll(z[0])))+z[1]; pv=z[0]; }); return t+driveMin(roadKm(pll(pv),pll(hotel))); };
    while(seq.length>1 && total(seq)>budget){ var wi=0; seq.forEach(function(z,i){ if(z[3]>=seq[wi][3]) wi=i; }); seq.splice(wi,1); }
    seq.forEach(function(z){ var k=roadKm(pll(prev),pll(z[0])), m=driveMin(k); s+=m; s=A(s,s+z[1],{k:"ziarah", p:z[0], from:prev, mode:ziar.mode==="walk"?"bus":"car", km:k, min:m, n:[pname(z[0]),pname(z[0])], sr:P(z[0]).sr, note:P(z[0]).o?[L(P(z[0]).o),L(P(z[0]).o)]:null}); prev=z[0]; });
    var kb=roadKm(pll(prev),pll(hotel)); s+=driveMin(kb);
    s=A(s-driveMin(kb), s, {k:"travel", p:prev, to:hotel, mode:ziar.mode==="walk"?"bus":"car", km:kb, min:driveMin(kb), n:["Pulang ke hotel","Back to the hotel"]});
    return s;
  }
  function walkStops(A, s, e, list, M, city){
    var prev=M;
    for(var i=0;i<list.length;i++){ var z=list[i], k=roadKm(pll(prev),pll(z[0])), m=walkMin(k); if(s+m+z[1]+walkMin(roadKm(pll(z[0]),pll(M)))>e) break;
      s+=m; s=A(s,s+z[1],{k:"ziarah", p:z[0], from:prev, mode:"walk", km:k, min:m, n:[pname(z[0]),pname(z[0])], sr:P(z[0]).sr, note:P(z[0]).o?[L(P(z[0]).o),L(P(z[0]).o)]:null}); prev=z[0]; }
    if(prev!==M){ var kb=roadKm(pll(prev),pll(M)), mb=walkMin(kb); s=A(s,s+mb,{k:"travel", p:prev, to:M, mode:"walk", km:kb, min:mb, n:["Jalan kaki kembali ke "+pname(M), "Walk back to "+pname(M)]}); }
    return s;
  }

  // ---------- costs ----------
  function costs(p){
    var sp=split(p), P_=p.people, ksaDays=sp.nights+1, rows=[], ram=dateWarn(p).indexOf("ram")>=0;
    var w=function(cat){ if(cat==="flight") return P_.a+P_.s+P_.c*0.75+P_.i*0.1; if(cat==="lodgeMk"||cat==="lodgeMd") return P_.a+P_.s+P_.c*0.5; if(cat==="food") return P_.a+P_.s+P_.c*0.6; return P_.a+P_.s+P_.c*0.5; };
    UM_ORDER.forEach(function(cat){
      var o=opt(cat,p.ch[cat]), u=UM_OPT[cat].u, mult=u==="pn"?(cat==="lodgeMk"?sp.mk:sp.md):u==="pd"?ksaDays:u==="pc"?2:1, wt=u==="grp"?1:w(cat);
      var lo=o.p[0]*mult*wt, hi=o.p[1]*mult*wt, ramM=ram&&(cat.indexOf("lodge")===0)?2.5:ram&&cat==="flight"?1.5:1;
      lo*=ramM; hi*=ramM;
      var user=p.px[cat]; if(user!=null && user!=="") { lo=hi=+user; }
      rows.push({cat:cat, h:UM_OPT[cat].h, ic:UM_OPT[cat].ic, o:o, lo:lo, hi:hi, user:user!=null&&user!=="", ram:ramM>1, unit:u, mult:mult});
    });
    UM_FIXED.forEach(function(f){ rows.push({cat:f.id, h:f.n, ic:"📄", fixed:1, lo:f.p[0]*pax(), hi:f.p[1]*pax(), user:false}); });
    var lo=0, hi=0; rows.forEach(function(r){ lo+=r.lo; hi+=r.hi; });
    var buf={lo:lo*0.1, hi:hi*0.1}; lo+=buf.lo; hi+=buf.hi;
    return {rows:rows, lo:lo, hi:hi, buf:buf, pp:{lo:lo/Math.max(1,pax()), hi:hi/Math.max(1,pax())}, ram:ram};
  }

  // ---------- booking links ----------
  function linkUrl(key, ctx){
    var Lk=UM_LINKS[key]; if(!Lk) return null; if(Lk.u) return Lk.u;
    var p=plan, s=parseYmd(p.start), sp=split(p), ci, nights, cityName, q=ctx&&ctx.q||"";
    var first=p.order, dA=1; // KSA arrival is usually the day after departure
    if(ctx && ctx.city){ var inFirst=ctx.city===first; ci=addDays(s, inFirst?dA:dA+(first==="mk"?sp.mk:sp.md)); nights=ctx.city==="mk"?sp.mk:sp.md; cityName=ctx.city==="mk"?"Makkah":"Madinah"; }
    else { ci=addDays(s,dA); nights=sp.nights; cityName="Makkah"; }
    var co=addDays(ci,nights), E=encodeURIComponent, rooms=Math.max(1,Math.ceil(adults()/(p.tier==="b"?4:2)));
    var arr=first==="mk"?"JED":"MED", depA=first==="mk"?"MED":"JED", hub=UM_HUB[p.home.ap]?p.home.ap:"KUL", ret=addDays(s,dA+sp.nights);
    switch(Lk.fn){
      case "agoda": return "https://www.agoda.com/search?textToSearch="+E(q||cityName)+"&checkIn="+ymdOf(ci)+"&los="+nights+"&rooms="+rooms+"&adults="+adults()+"&children="+(p.people.c+p.people.i);
      case "trivago": return "https://www.trivago.com.my/en-MY";
      case "ghotel": return "https://www.google.com/travel/hotels?q="+E((q||("hotels in "+cityName))+" "+ymdOf(ci)+" to "+ymdOf(co));
      case "gmaps": return "https://www.google.com/maps/search/?api=1&query="+E(q||cityName);
      case "gflights": return "https://www.google.com/travel/flights?q="+E("Flights from "+hub+" to "+arr+" on "+ymdOf(s)+" returning from "+depA+" on "+ymdOf(ret)+" "+adults()+" adults"+(p.people.c?" "+p.people.c+" children":""));
      case "skyscanner": var yy=function(d){ return String(d.getFullYear()).slice(2)+pad(d.getMonth()+1)+pad(d.getDate()); }; return "https://www.skyscanner.com.my/transport/flights/"+hub.toLowerCase()+"/"+arr.toLowerCase()+"/"+yy(s)+"/"+yy(ret)+"/?adultsv2="+adults()+(p.people.c?"&childrenv2="+Array(p.people.c+1).join("8|").slice(0,-1):"");
      case "rentals": return "https://www.google.com/maps/search/?api=1&query="+E("car rental "+(arr==="JED"?"Jeddah airport":"Madinah airport"));
      case "cartransfer": return "https://www.google.com/maps/search/?api=1&query="+E("private car transfer Jeddah Makkah Madinah");
    }
    return null;
  }
  // Google Maps opens in the Maps app (same as the surau/masjid search), not in the in-app browser
  function mapsSearch(q, ll){ ll=ll||[21.4225,39.8262]; if(window.Native && H.N.openMaps) H.N.openMaps(q, ll[0], ll[1]); else window.open("https://www.google.com/maps/search/"+encodeURIComponent(q)+"/@"+ll[0]+","+ll[1]+",14z"); }
  function mapsGo(ll, mode){ var u=navUrl(ll, mode); if(window.Native && H.N.openUrl) H.N.openUrl(u); else window.open(u); }
  function openLink(key, ctx){
    var u=linkUrl(key, ctx), Lk=UM_LINKS[key]; if(!u) return;
    if(/^https:\/\/www\.google\.com\/maps\/search\//.test(u)){ var qq=decodeURIComponent((u.split("query=")[1]||"").replace(/\+/g," ")); var cll=ctx&&ctx.city==="md"?[24.4672,39.6111]:ctx&&ctx.city==="mk"?[21.4225,39.8262]:(Lk.fn==="rentals"?[21.6796,39.1565]:[21.4225,39.8262]); mapsSearch(qq, cll); return; }
    if(Lk.fn==="trivago" && ctx && ctx.q){ copy(ctx.q+" "+(ctx.city==="md"?"Madinah":"Makkah")); H.toast(en?"Search copied: paste it into trivago":"Carian disalin: tampal di trivago"); }
    H.openWeb(u, Lk.n);
  }
  function copy(t){ try{ if(window.Native && H.N.copyText) H.N.copyText(t); else if(navigator.clipboard) navigator.clipboard.writeText(t); }catch(e){} }
  function navUrl(ll, mode){ return "https://www.google.com/maps/dir/?api=1&destination="+ll[0]+","+ll[1]+"&travelmode="+(mode==="walk"?"walking":mode==="bus"||mode==="train"?"transit":"driving"); }

  // ---------- open / close ----------
  function open(helpers){
    H=helpers; en=H.S.lang==="en";
    st=H.load("ihsan_umrahdiy",{plans:[], ui:{split:0.5}}); st.plans=st.plans||[]; st.ui=st.ui||{split:0.5};
    ov=document.getElementById("overlay"); ov.className="umov"; ov.classList.remove("hidden");
    ov.innerHTML='<div class="um" id="um"><div class="umtop"><button class="umb" id="umBack" aria-label="'+(en?"Back":"Kembali")+'">'+ic("back")+'</button><div class="umttl"></div><button class="umb" id="umMore" aria-label="'+(en?"More":"Lagi")+'">'+ic("more")+'</button></div><div class="umbody"></div><div class="umtoast" role="status" aria-live="polite"></div></div>';
    root=ov.querySelector("#um"); ov._close=back; q("#umBack").onclick=back; q("#umMore").onclick=menu; layers=[];
    if(window.UMX) UMX.init(api());
    if(st.ui.tab==="adab") st.ui.tab="lagi";
    var cur=st.ui.cur && st.plans.filter(function(x){ return x.id===st.ui.cur; })[0];
    if(cur){ showPlan(cur); } else if(st.plans.length) showList(); else startWizard(newPlan(), true);
  }
  function back(){
    if(q(".umsheet")){ closeSheet(); return; }
    if(layers.length){ closeLayer(); return; }
    if(wiz){ if(wiz.step>1){ wiz.step--; drawWizard(); return; } var was=wiz; wiz=null; if(was.isNew){ if(st.plans.length) showList(); else exit(); } else showPlan(was.p); return; }
    if(plan){ plan=null; st.ui.cur=null; save(); killMap(); if(st.plans.length>0) { showList(); return; } }
    exit();
  }
  function exit(){ killMap(); save(); var o=document.getElementById("overlay"); o.classList.add("hidden"); o.innerHTML=""; o._close=null; o.className="hidden"; document.body.classList.remove("umprinting"); if(H.onExit) H.onExit(); }
  function title(t){ q(".umttl").textContent=t; }
  function body(){ return q(".umbody"); }
  function utoast(m){ var t=q(".umtoast"); t.textContent=m; t.classList.add("on"); clearTimeout(utoast._t); utoast._t=setTimeout(function(){ t.classList.remove("on"); },2600); }

  // ---------- layers (module pages above the plan, each with its own back bar) ----------
  function layer(t, render, onClose){
    var el=document.createElement("div"); el.className="umlayer"; el.innerHTML='<div class="umtop"><button class="umb" aria-label="'+(en?"Back":"Kembali")+'">'+ic("back")+'</button><div class="umttl">'+esc(t)+'</div></div><div class="umlb"></div>';
    root.appendChild(el); var L0={el:el, onClose:onClose}; layers.push(L0);
    el.querySelector(".umtop .umb").onclick=closeLayer;
    try{ render(el.querySelector(".umlb")); }catch(e){ el.querySelector(".umlb").innerHTML='<div class="umpad mut">'+esc(String(e))+'</div>'; }
    return el;
  }
  function closeLayer(){ var L0=layers.pop(); if(!L0) return; try{ if(L0.onClose) L0.onClose(); }catch(e){} L0.el.remove(); }
  function closeAllLayers(){ while(layers.length) closeLayer(); }
  function setHome(v){ if(!plan) return; if(!plan.homeOrig) plan.homeOrig=plan.home; var c=nearestCity(v.ll[0], v.ll[1]); plan.home={n:v.n, ll:v.ll, ap:c[3]}; save(); }
  function resetHome(){ if(plan && plan.homeOrig){ plan.home=plan.homeOrig; delete plan.homeOrig; save(); } }
  function newMap(el, center, zoom){
    if(!window.maplibregl) { el.innerHTML='<div class="umnomap">'+(en?"Map not available":"Peta tidak tersedia")+'</div>'; return null; }
    var want=(navigator.onLine===false || st.ui.map==="offline")?"offline":"online", M, loaded=false, t=0;
    try{ M=new maplibregl.Map({container:el, style:want==="online"?ONLINE_STYLE:offlineStyle(), center:[center[1],center[0]], zoom:zoom||14, attributionControl:false, maxPitch:0, dragRotate:false, fadeDuration:0}); }
    catch(e){ el.innerHTML='<div class="umnomap">'+(en?"This phone cannot draw the map (WebGL).":"Telefon ini tidak dapat melukis peta (WebGL).")+'</div>'; return null; }
    M.touchZoomRotate.disableRotation();
    M.addControl(new maplibregl.AttributionControl({compact:true, customAttribution:"© OpenStreetMap"}));
    var off=function(){ if(loaded) return; clearTimeout(t); want="offline"; try{ M.setStyle(offlineStyle()); }catch(e){} };
    M.on("style.load", function(){ if(want==="online"){ loaded=true; englishLabels(M); } });
    M.on("error", function(){ if(!loaded && want==="online") off(); });
    if(want==="online") t=setTimeout(off, 8000);
    return M;
  }
  function leaveForHajj(){ save(); closeAllLayers(); killMap(); H.hajj(); }
  function rebuildSafe(){ if(!plan) return; if(q("#umPane")) rebuild(); else setStops(); }
  function api(){ return {H:H, en:function(){ return en; }, L:L, esc:esc, plan:function(){ return plan; }, stops:function(){ return stops; }, save:save, toast:function(m){ utoast(m); },
    sheet:sheet, closeSheet:closeSheet, costs:function(){ return costs(plan); }, parseYmd:parseYmd, addDays:addDays, fmtDate:fmtDate, km:km, lname:lname, sarRate:sarRate,
    layer:layer, closeLayer:closeLayer, drawAdab:drawAdab, leaveForHajj:leaveForHajj, exportPdf:exportPdf, dayColor:dayColor, shareText:shareText, shareJson:shareJson,
    rebuild:rebuildSafe, mapsSearch:mapsSearch, mapsGo:mapsGo, resetHome:resetHome, setHome:setHome, newMap:newMap}; }

  // ---------- plan list ----------
  function showList(){
    plan=null; wiz=null; killMap(); closeAllLayers(); title(en?"Umrah DIY":"Umrah DIY"); q("#umMore").style.visibility="hidden";
    var h='<div class="umpad"><div class="umhero"><b>'+(en?"Plan your own umrah":"Rancang umrah sendiri")+'</b><span>'+(en?"Flights, stay, transport, food, ziarah, and every free hour in the Haram.":"Penerbangan, penginapan, pengangkutan, makanan, ziarah, dan setiap masa lapang di Haram.")+'</span></div>';
    h+='<button class="umbtn gold full" id="umNew">＋ '+(en?"New plan":"Rancangan baharu")+'</button>';
    h+='<h3 class="umh">'+(en?"My plans":"Rancangan saya")+'</h3>';
    st.plans.slice().reverse().forEach(function(p){ var c=costs(planFix(p)); h+='<button class="umcard umpl" data-pid="'+p.id+'"><b>'+esc(planName(p))+'</b><span class="mut">'+fmtDate(parseYmd(p.start))+' · '+p.days+(en?" days · ":" hari · ")+pax()+(en?" people":" orang")+'</span><span class="umtot">'+rng(c.pp.lo,c.pp.hi)+(en?" / person":" / orang")+'</span></button>'; });
    plan=null; h+='<button class="umbtn alt full" id="umImp">⇩ '+(en?"Import a plan someone shared":"Import rancangan yang dikongsi")+'</button></div>';
    body().innerHTML=h;
    q("#umNew").onclick=function(){ startWizard(newPlan(), true); };
    q("#umImp").onclick=importSheet;
    qa("[data-pid]").forEach(function(b){ b.onclick=function(){ var p=st.plans.filter(function(x){ return x.id===b.getAttribute("data-pid"); })[0]; if(p) showPlan(p); }; });
  }
  function planFix(p){ plan=p; return p; }

  // ---------- wizard: step 1 inputs, step 2 options ----------
  function startWizard(p, isNew){ killMap(); wiz={p:JSON.parse(JSON.stringify(p)), step:1, isNew:isNew}; plan=wiz.p; drawWizard(); }
  function drawWizard(){
    var p=wiz.p; plan=p; q("#umMore").style.visibility="hidden"; closeAllLayers();
    title((en?"Step ":"Langkah ")+wiz.step+"/2 · "+(wiz.step===1?(en?"Your trip":"Perjalanan anda"):(en?"Choose options":"Pilih pilihan")));
    var h='<div class="umpad">';
    if(wiz.step===1){
      h+='<h3 class="umh">'+(en?"Budget":"Bajet")+'</h3><div class="umtiers">'+["b","n","c"].map(function(t){ var T=UM_TIERS[t]; return '<button class="umtier'+(p.tier===t?" on":"")+'" data-tier="'+t+'"><span class="umti">'+T.ic+'</span><b>'+L(T.n)+'</b><small>'+esc(L(T.d))+'</small></button>'; }).join("")+'</div>';
      h+='<h3 class="umh">'+(en?"People":"Bilangan orang")+'</h3>'+[["a",["Dewasa","Adults"]],["s",["Warga emas 60+","Seniors 60+"]],["c",["Kanak-kanak 2-11","Children 2-11"]],["i",["Bayi bawah 2","Infants under 2"]]].map(function(x){ return '<div class="umrow"><span>'+L(x[1])+'</span><span class="umstep"><button data-pm="'+x[0]+'" data-v="-1">−</button><b>'+p.people[x[0]]+'</b><button data-pm="'+x[0]+'" data-v="1">＋</button></span></div>'; }).join("");
      h+='<div class="umchips">'+chip("male",en?"Men in the group":"Ada lelaki")+chip("female",en?"Women in the group":"Ada wanita")+'</div>';
      h+='<h3 class="umh">'+(en?"Dates":"Tarikh")+'</h3><div class="umrow"><span>'+(en?"Leave home":"Bertolak")+'</span><input type="date" id="umDate" value="'+p.start+'"></div><div class="mut small" id="umHij">'+esc(hijriS(parseYmd(p.start)))+'</div>';
      h+='<div class="umrow"><span>'+(en?"Days (home to home)":"Hari (rumah ke rumah)")+'</span><span class="umstep"><button data-days="-1">−</button><b>'+p.days+'</b><button data-days="1">＋</button></span></div>';
      var sp=split(p); h+='<div class="mut small">'+sp.nights+(en?" nights in Saudi: ":" malam di Saudi: ")+sp.mk+" Makkah, "+sp.md+" Madinah</div>";
      h+='<div class="umrow"><span>'+(en?"Flight leaves Malaysia":"Penerbangan bertolak")+'</span><input type="time" id="umDep" value="'+p.depT+'"></div><div class="umrow"><span>'+(en?"Flight home leaves Saudi":"Penerbangan pulang bertolak")+'</span><input type="time" id="umRet" value="'+p.retT+'"></div>';
      dateWarn(p).forEach(function(w){ h+='<div class="umwarn">⚠ '+esc(L(WARN[w]))+'</div>'; });
      h+='<h3 class="umh">'+(en?"City order":"Bandar dahulu")+'</h3><div class="umseg"><button data-ord="mk" class="'+(p.order==="mk"?"on":"")+'">'+(en?"Makkah first":"Makkah dahulu")+'</button><button data-ord="md" class="'+(p.order==="md"?"on":"")+'">'+(en?"Madinah first":"Madinah dahulu")+'</button></div>';
      h+='<div class="mut small">'+(p.order==="mk"?(en?"Ihram on the plane. Fly into Jeddah, home from Madinah.":"Ihram dalam pesawat. Tiba di Jeddah, pulang dari Madinah."):(en?"Ihram at Bir Ali on the way to Makkah. Fly into Madinah, home from Jeddah.":"Ihram di Bir Ali dalam perjalanan ke Makkah. Tiba di Madinah, pulang dari Jeddah."))+'</div>';
      h+='<h3 class="umh">'+(en?"Home":"Rumah")+'</h3><div class="umrow"><span>'+esc(p.home.n)+'</span><span class="mut">'+(en?"airport ":"lapangan terbang ")+esc(p.home.ap)+'</span></div><select id="umCity"><option value="">'+(en?"Change city…":"Tukar bandar…")+'</option>'+UM_CITIES.map(function(c,i){ return '<option value="'+i+'">'+esc(c[0])+' ('+c[3]+')</option>'; }).join("")+'</select>';
      h+='<button class="umbtn alt" id="umGps">📍 '+(en?"Use my location":"Guna lokasi saya")+'</button>';
      h+='<h3 class="umh">'+(en?"Special needs":"Keperluan khas")+'</h3><div class="umchips">'+chip("wheel",en?"Wheelchair":"Kerusi roda")+chip("slow",en?"Can't walk far":"Tidak boleh jalan jauh")+chip("preg",en?"Pregnant":"Mengandung")+chip("diabetes",en?"Diabetes / medicine":"Diabetes / ubat")+chip("first",en?"First umrah":"Umrah pertama")+'</div>';
      h+='<h3 class="umh">'+(en?"Masjid time ↔ ziarah":"Masa di masjid ↔ ziarah")+'</h3><input type="range" min="50" max="100" step="5" id="umRatio" value="'+Math.round(p.ratio*100)+'"><div class="mut small" id="umRatioT">'+ratioText(p.ratio)+'</div>';
      h+='<div class="umchips">'+chip("taif",en?"Add a Taif day":"Tambah sehari ke Taif", p.taif)+'</div>';
      h+='<h3 class="umh">'+(en?"Real hotels & restaurants from the map":"Hotel & restoran sebenar dari peta")+'</h3><div class="umseg"><button data-pk="0" class="'+(!wiz.pickNow?"on":"")+'">'+(en?"After the itinerary (default)":"Selepas jadual (lalai)")+'</button><button data-pk="1" class="'+(wiz.pickNow?"on":"")+'">'+(en?"Choose now":"Pilih sekarang")+'</button></div><div class="mut small">'+(en?"Pick your home, hotel and favourite restaurants on a map with auto search. You can always do it later in More › My places.":"Pilih rumah, hotel dan restoran kegemaran di peta dengan carian automatik. Boleh dibuat kemudian di Lagi › Tempat saya.")+'</div>';
      h+='<input type="text" id="umName" placeholder="'+(en?"Plan name (optional)":"Nama rancangan (pilihan)")+'" value="'+esc(p.name)+'">';
      h+='<button class="umbtn gold full" id="umNext">'+(en?"Next: choose options ›":"Seterusnya: pilih pilihan ›")+'</button>';
    } else {
      var c=costs(p);
      h+='<div class="umsum">'+(en?"Estimate per person: ":"Anggaran setiap orang: ")+'<b>'+rng(c.pp.lo,c.pp.hi)+'</b></div>';
      UM_ORDER.forEach(function(cat){
        var C=UM_OPT[cat]; h+='<h3 class="umh">'+C.ic+' '+L(C.h)+'</h3><div class="umopts">';
        C.o.forEach(function(o){ h+='<button class="umopt'+(p.ch[cat]===o.id?" on":"")+'" data-cat="'+cat+'" data-opt="'+o.id+'"><b>'+esc(L(o.n))+'</b>'+(L(o.d)?'<small>'+esc(L(o.d))+'</small>':'')+'<span class="umpr">'+(o.p[1]?rng(o.p[0],o.p[1])+unitS(C.u):(en?"Free":"Percuma"))+'</span>'+((o.t||"").indexOf("b")>=0?'<i class="umtg">'+L(UM_TIERS.b.n)+'</i>':'')+((o.t||"").indexOf("n")>=0?'<i class="umtg">'+L(UM_TIERS.n.n)+'</i>':'')+((o.t||"").indexOf("c")>=0?'<i class="umtg">'+L(UM_TIERS.c.n)+'</i>':'')+'</button>'; });
        h+='</div>';
      });
      h+='<div class="mut small">'+(en?"Prices are rough estimates (Nov 2026). After you book, type the real price in the Cost tab.":"Harga ialah anggaran kasar (Nov 2026). Selepas menempah, masukkan harga sebenar di tab Kos.")+'</div>';
      h+='<button class="umbtn gold full" id="umMake">✓ '+(en?"Make my itinerary":"Buat jadual saya")+'</button>';
    }
    h+='</div>'; body().innerHTML=h; body().scrollTop=0;
    var redraw=function(){ var y=body().scrollTop; drawWizard(); body().scrollTop=y; };
    if(wiz.step===1){
      qa("[data-tier]").forEach(function(b){ b.onclick=function(){ applyTier(p,b.getAttribute("data-tier")); redraw(); }; });
      qa("[data-pm]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-pm"); p.people[k]=Math.max(0,Math.min(20,p.people[k]+(+b.getAttribute("data-v")))); if(adults()<1) p.people.a=1; redraw(); }; });
      qa("[data-days]").forEach(function(b){ b.onclick=function(){ p.days=Math.max(5,Math.min(45,p.days+(+b.getAttribute("data-days")))); redraw(); }; });
      qa("[data-ord]").forEach(function(b){ b.onclick=function(){ p.order=b.getAttribute("data-ord"); redraw(); }; });
      qa("[data-chip]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-chip"); if(k==="taif") p.taif=!p.taif; else p.needs[k]=!p.needs[k]; redraw(); }; });
      q("#umDate").onchange=function(){ if(this.value){ p.start=this.value; redraw(); } };
      q("#umDep").onchange=function(){ if(this.value) p.depT=this.value; };
      q("#umRet").onchange=function(){ if(this.value) p.retT=this.value; };
      q("#umCity").onchange=function(){ var c=UM_CITIES[+this.value]; if(c){ p.home={n:c[0], ll:[c[1],c[2]], ap:c[3]}; redraw(); } };
      q("#umGps").onclick=function(){ var hl=function(r){ H.off("location",hl); if(r.error||r.lat==null){ utoast(en?"Location unavailable":"Lokasi tidak tersedia"); return; } var c=nearestCity(r.lat,r.lon); p.home={n:(en?"Near ":"Dekat ")+c[0], ll:[r.lat,r.lon], ap:c[3]}; redraw(); }; H.on("location",hl); H.N.getLocation(); };
      q("#umRatio").oninput=function(){ p.ratio=+this.value/100; q("#umRatioT").textContent=ratioText(p.ratio); };
      q("#umName").oninput=function(){ p.name=this.value.slice(0,60); };
      q("#umNext").onclick=function(){ wiz.step=2; drawWizard(); };
      qa("[data-pk]").forEach(function(b){ b.onclick=function(){ wiz.pickNow=b.getAttribute("data-pk")==="1"; redraw(); }; });
    } else {
      qa("[data-opt]").forEach(function(b){ b.onclick=function(){ var cat=b.getAttribute("data-cat"); p.ch[cat]=b.getAttribute("data-opt"); redraw(); }; });
      q("#umMake").onclick=function(){
        var i=-1; st.plans.forEach(function(x,j){ if(x.id===p.id) i=j; });
        p.updated=Date.now(); if(i>=0) st.plans[i]=p; else st.plans.push(p);
        var pk=wiz.pickNow; wiz=null; save(); showPlan(p); utoast(en?"Itinerary ready":"Jadual siap");
        if(pk && window.UMX) setTimeout(function(){ UMX.places(); }, 250);
      };
    }
  }
  function chip(k, label, on){ var v=on!=null?on:!!(plan.needs||{})[k]; return '<button class="umchip'+(v?" on":"")+'" data-chip="'+k+'">'+esc(label)+'</button>'; }
  function ratioText(r){ return Math.round(r*100)+"% "+(en?"masjid":"masjid")+" · "+(r>=0.9?(en?"only the key ziarah":"ziarah utama sahaja"):r>=0.7?(en?"main ziarah":"ziarah biasa"):(en?"all ziarah + museums":"semua ziarah + muzium")); }
  function unitS(u){ return {pp:en?" /person":" /orang", pn:en?" /person/night":" /orang/malam", pd:en?" /person/day":" /orang/hari", pc:en?" /person/city":" /orang/bandar", grp:en?" /group":" /kumpulan"}[u]||""; }

  // ---------- plan screen ----------
  function showPlan(p){
    plan=p; wiz=null; st.ui.cur=p.id; save(); q("#umMore").style.visibility="visible"; title(planName(p));
    setStops(); openIdx=-1; if(tab==="adab") tab="lagi";
    body().innerHTML='<div class="umplan"><div class="ummapw" id="umMapW"><div id="umMap" class="ummap"></div><div class="ummapbtn"><button class="umb sm" id="umFit" aria-label="Fit">'+ic("fit")+'</button><button class="umb sm" id="umLoc" aria-label="Location">'+ic("loc")+'</button><button class="umb sm" id="umLay" aria-label="Map">'+ic("layer")+'</button></div><div class="ummapnote" id="umMapNote"></div><div class="umlabel" id="umLabel"></div></div>'+
      '<div class="umhandle" id="umHandle"><i></i></div><div class="umpane" id="umPane"></div>'+
      '<div class="umsub">'+[["jadual","🗓",["Jadual","Itinerary"]],["kos","💰",["Kos","Cost"]],["tempah","🔗",["Tempah","Book"]],["semak","✅",["Semak","Checklist"]],["tempat","📍",["Tempat","Places"]],["lagi","▦",["Lagi","More"]]].map(function(x){ return '<button data-tab="'+x[0]+'" class="'+(tab===x[0]?"on":"")+'"><span>'+x[1]+'</span>'+L(x[2])+'</button>'; }).join("")+'</div></div>';
    qa("[data-tab]").forEach(function(b){ b.onclick=function(){ tab=b.getAttribute("data-tab"); qa("[data-tab]").forEach(function(x){ x.classList.toggle("on", x===b); }); drawTab(); }; });
    q("#umFit").onclick=function(){ fitAll(); }; q("#umLay").onclick=function(){ setMapMode(mapMode==="online"?"offline":"online"); };
    q("#umLoc").onclick=function(){ var hl=function(r){ H.off("location",hl); if(r.error||r.lat==null||!map) return; if(!markers.__me){ var el=document.createElement("div"); el.className="umme"; markers.__me=new maplibregl.Marker({element:el}).setLngLat([r.lon,r.lat]).addTo(map); } else markers.__me.setLngLat([r.lon,r.lat]); map.flyTo({center:[r.lon,r.lat], zoom:15}); }; H.on("location",hl); H.N.getLocation(); };
    setupHandle(); drawTab(); labelBar(-1); initMap();
  }
  function setupHandle(){
    var hd=q("#umHandle"), pl=q(".umplan"), y0=0, s0=0, drag=false;
    var apply=function(){ pl.style.setProperty("--split", st.ui.split.toFixed(3)); if(map) map.resize(); };
    apply();
    hd.addEventListener("pointerdown", function(e){ drag=true; y0=e.clientY; s0=st.ui.split; hd.setPointerCapture(e.pointerId); });
    hd.addEventListener("pointermove", function(e){ if(!drag) return; var hgt=pl.clientHeight-56; st.ui.split=Math.max(0.3,Math.min(0.7,s0+(e.clientY-y0)/hgt)); apply(); });
    hd.addEventListener("pointerup", function(){ if(drag){ drag=false; save(); } });
    hd.addEventListener("dblclick", function(){ st.ui.split=0.5; apply(); save(); });
  }
  function drawTab(){
    var pl=q(".umplan"); pl.classList.toggle("nomap", tab!=="jadual");
    var pane=q("#umPane"); pane.scrollTop=0;
    if(tab==="jadual") drawList(pane); else if(tab==="kos") drawCost(pane); else if(tab==="tempah") drawBook(pane); else if(tab==="semak") drawCheck(pane); else if(tab==="lagi" && window.UMX) UMX.grid(pane); else if(tab==="tempat" && window.UMX) UMX.placesInto(pane); else drawAdab(pane);
    if(map) setTimeout(function(){ map.resize(); }, 30);
  }
  // stop labels
  function stopTime(o){ return hm(o.s)+(o.tz===MYT?" MYT":""); }
  function stopName(o){ return L(o.n); }
  var KIND_IC={home:"🏠", homearr:"🏡", flight:"✈", airport:"🛄", transfer:"🚐", travel:"↩", checkin:"🛎", checkout:"🧳", prayer:"🕌", umrah:"🕋", haram:"📿", meal:"🍽", rest:"🛏", sleep:"🌙", ziarah:"🧭", raudhah:"🌿", shop:"🛍", ihram:"⚪"};
  function needPlaces(){ var pl=plan.places||{}; return !plan.hidePl && !(pl.mk||pl.md||(pl.fmk||[]).length||(pl.fmd||[]).length); }
  var listMode="stops";
  // numbered list of every place on the map (same numbers and day colours as the pins); the map stays on screen
  function drawPlaces(pane){
    var keys=Object.keys(pnum).sort(function(a,b){ return pnum[a].n-pnum[b].n; }), h='';
    h+='<div class="umdays"><button class="umnumb on" id="umNumB" aria-pressed="true">🔢 '+(en?"Numbers":"Nombor")+'</button><button class="umnumb" id="umItB">🗓 '+(en?"Itinerary":"Jadual")+'</button><span class="mut small umnumc">'+keys.length+(en?" places":" tempat")+'</span></div>';
    keys.forEach(function(k){ var P0=pnum[k], seen={};
      var vs=P0.visits.filter(function(v){ var x=v.d+"|"+stops[v.i].s; if(seen[v.d]) return false; seen[v.d]=1; return true; });
      h+='<div class="umplr" style="--dc:'+dayColor(P0.d)+'"><button class="umplh" data-pk="'+esc(k)+'"><span class="umno">'+P0.n+'</span><span class="umnm">'+esc(pname(P0.pp))+'</span><span class="mut small">'+P0.visits.length+'×</span></button><div class="umplv">'+vs.map(function(v){ var o=stops[v.i]; return '<button data-gi="'+v.i+'" style="--dc:'+dayColor(v.d)+'">'+(en?"Day ":"Hari ")+(v.d+1)+' · '+stopTime(o)+'</button>'; }).join("")+'</div></div>';
    });
    pane.innerHTML=h; pane.onscroll=null;
    q("#umItB").onclick=function(){ listMode="stops"; drawTab(); };
    q("#umNumB").onclick=function(){ listMode="stops"; drawTab(); };
    qa("[data-pk]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-pk"), P0=pnum[k], ll=pll(P0.pp);
      qa(".umplr.on").forEach(function(x){ x.classList.remove("on"); }); b.parentNode.classList.add("on");
      var lab=q("#umLabel"); if(lab){ lab.querySelector(".umltx").innerHTML='<i class="umno" style="background:'+dayColor(P0.d)+'">'+P0.n+'</i><b>'+esc(pname(P0.pp))+'</b>'; }
      if(map){ Object.keys(markers).forEach(function(m){ if(m!=="__me"){ markers[m].getElement().classList.toggle("sel", m===k); markers[m].getElement().classList.remove("past"); } }); map.flyTo({center:[ll[1],ll[0]], zoom:Math.max(map.getZoom(), P0.pp.home?12:15), speed:1.4}); } }; });
    qa("[data-gi]").forEach(function(b){ b.onclick=function(){ listMode="stops"; drawTab(); toggleStop(+b.getAttribute("data-gi"), true); }; });
  }
  function drawList(pane){
    if(listMode==="places"){ drawPlaces(pane); return; }
    var start=parseYmd(plan.start), h='', lastD=-1, days=[];
    stops.forEach(function(o){ if(days.indexOf(o.d)<0) days.push(o.d); });
    h+='<div class="umdays"><button class="umnumb" id="umNumB" aria-pressed="false" aria-label="'+(en?"List of numbered places":"Senarai tempat bernombor")+'">🔢</button>'+days.map(function(d){ return '<button data-day="'+d+'" style="--dc:'+dayColor(d)+'">'+(en?"Day ":"Hari ")+(d+1)+'</button>'; }).join("")+'</div>';
    if(needPlaces()) h+='<div class="umbanner"><button class="umbnr" id="umPickPl">📍 '+(en?"Choose your real hotel & restaurants from the map ›":"Pilih hotel & restoran sebenar dari peta ›")+'</button><button class="umbx" id="umPickX" aria-label="'+(en?"Hide":"Tutup")+'">×</button></div>';
    stops.forEach(function(o,i){
      var dc=dayColor(o.d);
      if(o.d!==lastD){ lastD=o.d; var dt=addDays(start,o.d); h+='<div class="umdayh" id="umD'+o.d+'" data-dh="'+o.d+'" style="--dc:'+dc+'"><b>'+(en?"Day ":"Hari ")+(o.d+1)+'</b> · '+fmtDate(dt,true)+' · '+esc(hijriS(dt))+'</div>'; }
      h+='<div class="umst'+(plan.done[o.key]?" done":"")+(i===openIdx?" open":"")+'" data-i="'+i+'" style="--dc:'+dc+'"><button class="umsth" data-si="'+i+'"><span class="umt">'+stopTime(o)+'</span>'+(o.no?'<span class="umno">'+o.no+'</span>':'<span class="umno none"></span>')+'<span class="umic">'+(KIND_IC[o.k]||"•")+'</span><span class="umnm">'+esc(stopName(o))+(o.edited||o.xid?' <i class="umedit">✎</i>':'')+'</span></button>'+(i===openIdx?detail(o):'')+'</div>';
    });
    h+='<button class="umbtn alt umaddstop" id="umAddStop">＋ '+(en?"Add my own stop":"Tambah hentian sendiri")+'</button>';
    h+='<div class="mut small umfoot">'+(en?"Times are estimates. Prayer times: Umm al-Qura calculation; the mosques can differ by a few minutes. Times are Saudi time unless marked MYT. Numbers match the pins on the map; colours show the day.":"Masa ialah anggaran. Waktu solat: kiraan Umm al-Qura; masjid boleh berbeza beberapa minit. Masa ialah waktu Saudi kecuali bertanda MYT. Nombor sama dengan pin di peta; warna menunjukkan hari.")+'</div>';
    pane.innerHTML=h;
    qa("[data-si]").forEach(function(b){ b.onclick=function(){ toggleStop(+b.getAttribute("data-si")); }; });
    q("#umNumB").onclick=function(){ listMode="places"; drawTab(); };
    qa("[data-day]").forEach(function(b){ b.onclick=function(){ var t=q("#umD"+b.getAttribute("data-day")); if(t) pane.scrollTop=t.offsetTop-pane.offsetTop-q(".umdays").offsetHeight+2; }; });
    q("#umAddStop").onclick=function(){ var d=spyDay>=0?spyDay:0, j=-1; stops.forEach(function(o,k){ if(o.d===d) j=k; }); if(j<0) j=stops.length-1; addAfter(j); };
    var pp=q("#umPickPl"); if(pp){ pp.onclick=function(){ if(window.UMX) UMX.places(); }; q("#umPickX").onclick=function(){ plan.hidePl=1; save(); var b=q(".umbanner"); if(b) b.remove(); }; }
    bindDetail(pane);
    pane.onscroll=function(){ if(spyT) return; spyT=setTimeout(function(){ spyT=0; spy(pane); }, 60); };
    spyDay=-1; spy(pane);
  }
  var spyT=0, spyDay=-1;
  // highlight the day chip of the day you are reading
  function spy(pane){
    var hs=pane.querySelectorAll("[data-dh]"); if(!hs.length) return;
    var top=pane.scrollTop+(q(".umdays")?q(".umdays").offsetHeight:0)+pane.offsetTop+8, cur=+hs[0].getAttribute("data-dh");
    for(var i=0;i<hs.length;i++){ if(hs[i].offsetTop<=top) cur=+hs[i].getAttribute("data-dh"); else break; }
    if(pane.scrollTop+pane.clientHeight>=pane.scrollHeight-4) cur=+hs[hs.length-1].getAttribute("data-dh");
    if(cur===spyDay) return; spyDay=cur;
    var row=q(".umdays"); if(!row) return;
    row.querySelectorAll("[data-day]").forEach(function(b){ var on=+b.getAttribute("data-day")===cur; b.classList.toggle("on", on); if(on){ var x=b.offsetLeft-row.clientWidth/2+b.offsetWidth/2; try{ row.scrollTo({left:Math.max(0,x), behavior:"smooth"}); }catch(e){ row.scrollLeft=Math.max(0,x); } } });
  }
  function step(dir){
    if(!stops.length) return;
    var i=openIdx<0?(dir>0?0:stops.length-1):openIdx+dir;
    if(i<0||i>=stops.length) return;
    if(tab!=="jadual"){ tab="jadual"; qa("[data-tab]").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-tab")==="jadual"); }); drawTab(); }
    toggleStop(i, true);
  }
  function toggleStop(i, fromMap){
    if(listMode!=="stops" && tab==="jadual"){ listMode="stops"; drawTab(); }
    var pane=q("#umPane"), prev=openIdx; openIdx=(openIdx===i && !fromMap)?-1:i;
    if(prev>=0){ var pe=pane.querySelector('[data-i="'+prev+'"]'); if(pe){ pe.classList.remove("open"); var dd=pe.querySelector(".umdet"); if(dd) dd.remove(); } }
    if(openIdx>=0){ var el=pane.querySelector('[data-i="'+openIdx+'"]'); el.classList.add("open"); el.insertAdjacentHTML("beforeend", detail(stops[openIdx])); bindDetail(el);
      var ch=q(".umdays")?q(".umdays").offsetHeight:0, top=el.offsetTop-pane.offsetTop; if(fromMap || top<pane.scrollTop+ch || top>pane.scrollTop+pane.clientHeight-60) pane.scrollTop=Math.max(0,top-ch-4); }
    focusStop(openIdx>=0?openIdx:(prev>=0?prev:-1), openIdx<0);
  }
  function detail(o){
    var h='<div class="umdet">', pl=typeof o.p==="object"?o.p:P(o.p), ll=pll(o.p);
    var full=typeof o.p==="object"?o.p.n:(L(P(o.p).n));
    h+='<div class="umfull"><b>'+esc(full)+'</b>'+(pl&&pl.ar?' <span class="umar" dir="rtl">'+esc(pl.ar)+'</span>':'')+'</div>';
    h+='<div class="umtm">'+hm(o.s)+(o.e>o.s?" – "+hm(o.e):"")+(o.tz===MYT?(en?" Malaysia time":" waktu Malaysia"):(en?" Saudi time":" waktu Saudi"))+(o.e-o.s>=5?" · "+dur(o.e-o.s):"")+(o.azan?" · "+(en?"azan ":"azan ")+o.azan:"")+'</div>';
    if(o.mode && (o.km||o.min)){ h+='<div class="umhow">'+modeIc(o.mode)+' '+modeName(o.mode)+(o.km?" · "+(o.km<1?Math.round(o.km*1000)+" m":o.km.toFixed(o.km<10?1:0)+" km"):"")+(o.min?" · "+dur(o.min):"")+(o.to?" → "+esc(pname(o.to)):"")+'</div>'; }
    if(pl && pl.d) h+='<div class="umtx">'+esc(L(pl.d))+'</div>';
    if(o.note) h+='<div class="umtx">'+esc(L(o.note))+'</div>';
    if(o.tip) h+='<div class="umtip">💡 '+esc(L(o.tip))+'</div>';
    var doa=doaFor(o); if(doa) h+='<div class="umdoa"><div class="umar" dir="rtl">'+esc(doa.ar)+'</div><div class="mut small">'+esc(doa.r||"")+'</div><div class="small">'+esc(L(doa.m))+'</div></div>';
    h+='<div class="umbtns">';
    if(ll && !(pl&&pl.home)) h+='<button class="umbtn sm" data-nav="'+o.i+'">🧭 Google Maps</button><button class="umbtn sm alt" data-waze="'+o.i+'">Waze</button>';
    (o.bk||[]).forEach(function(k){ if(UM_LINKS[k]) h+='<button class="umbtn sm gold" data-bk="'+k+'" data-bi="'+o.i+'">🔗 '+esc(UM_LINKS[k].n)+'</button>'; });
    if(o.tawaf) h+='<button class="umbtn sm alt" data-tw="1">🔢 '+(en?"Tawaf & sa'ie counter":"Kaunter tawaf & sa'ie")+'</button>';
    if(o.hj) h+='<button class="umbtn sm alt" data-hj="1">🕋 '+(en?"3D guide":"Panduan 3D")+'</button>';
    if(o.hcity) h+='<label class="umrow small"><span>'+(en?"My hotel name":"Nama hotel saya")+'</span><input type="text" data-hn="'+o.hcity+'" value="'+esc((plan.hn||{})[o.hcity]||"")+'" placeholder="'+esc(L(chosen(o.hcity==="mk"?"lodgeMk":"lodgeMd").n))+'"></label>';
    if(o.k==="raudhah") h+='<label class="umrow small"><span>'+(en?"My slot time":"Masa slot saya")+'</span><input type="time" data-raud="1" value="'+esc(plan.raud||"")+'"></label>';
    h+='<button class="umbtn sm alt" data-ed="'+o.i+'">✎ '+(en?"Edit time, place, day":"Ubah masa, tempat, hari")+'</button>';
    h+='</div><div class="umnav"><button class="umbtn sm alt" data-step="-1"'+(o.i<=0?" disabled":"")+'>‹ '+(en?"Previous":"Sebelum")+'</button><span class="mut small">'+(o.i+1)+' / '+stops.length+'</span><button class="umbtn sm gold" data-step="1"'+(o.i>=stops.length-1?" disabled":"")+'>'+(en?"Next":"Seterusnya")+' ›</button></div>';
    h+='<div class="umrow small"><label class="umck"><input type="checkbox" data-done="'+o.i+'"'+(plan.done[o.key]?" checked":"")+'> '+(en?"Done":"Selesai")+'</label><button class="umlink" data-del="'+o.i+'">'+(en?"Remove from plan":"Buang dari jadual")+'</button></div></div>';
    return h;
  }
  // ---------- edit a stop / add my own stop ----------
  function cityOfLL(ll){ return km(ll,[21.4225,39.8262])<60?"mk":km(ll,[24.4672,39.6111])<60?"md":null; }
  function findKey(key){ for(var k=0;k<stops.length;k++) if(stops[k].key===key) return k; return -1; }
  function reopen(key){ var j=findKey(key); if(j>=0) toggleStop(j, true); }
  function addAfter(i){
    var o=stops[i]; if(!o) return; plan.extra=plan.extra||[];
    var x={id:"x"+Date.now().toString(36), d:o.d, s:Math.min(o.e, 1410), e:Math.min(o.e+30, 1439), tz:o.tz, n:en?"My stop":"Hentian saya", p:o.to||o.p};
    plan.extra.push(x); save(); openIdx=-1; rebuild(); var j=findKey("x|"+x.id); if(j>=0){ toggleStop(j, true); editStop(j); }
  }
  function editStop(i, dr){
    var o=stops[i]; if(!o) return; plan.edits=plan.edits||{};
    dr=dr||{d:o.d, s:o.s, e:o.e, n:stopName(o), p:null};
    var nd=Math.max(plan.realDays||0, plan.days), start=parseYmd(plan.start), opts='';
    for(var d=0; d<nd; d++) opts+='<option value="'+d+'"'+(d===dr.d?" selected":"")+'>'+(en?"Day ":"Hari ")+(d+1)+' · '+fmtDate(addDays(start,d),true)+'</option>';
    var s=sheet('<div class="umsct">✎ '+(en?"Edit stop":"Ubah hentian")+'</div><div class="umed">'+
      '<label>'+(en?"Name":"Nama")+'<input type="text" id="edN" maxlength="80" value="'+esc(dr.n)+'"></label>'+
      '<label>'+(en?"Day":"Hari")+'<select id="edD">'+opts+'</select></label>'+
      '<label>'+(en?"Start":"Mula")+(o.tz===MYT?" (MYT)":"")+'<input type="time" id="edS" value="'+hm(dr.s)+'"></label>'+
      '<label>'+(en?"End":"Tamat")+'<input type="time" id="edE" value="'+hm(dr.e)+'"></label>'+
      '<div class="umplace"><span>📍 '+esc(dr.p?dr.p.n:pname(o.p))+'</span><button class="umbtn sm alt" id="edP">🗺 '+(en?"Change place":"Tukar tempat")+'</button></div>'+
      '<div class="umedbtns"><button class="umbtn gold" id="edSave">✓ '+(en?"Save":"Simpan")+'</button>'+((plan.edits[o.key]||o.xid)?'<button class="umbtn alt" id="edReset">'+(o.xid?(en?"Delete my stop":"Padam hentian saya"):(en?"Undo my changes":"Batal perubahan"))+'</button>':'')+'</div>'+
      '<button class="umbtn alt full" id="edAdd">＋ '+(en?"Add my own stop after this":"Tambah hentian sendiri selepas ini")+'</button>'+
      '<div class="mut small">'+(en?"Changing a time does not move the other stops. Prayer times stay as calculated.":"Menukar masa tidak mengalihkan hentian lain. Waktu solat kekal mengikut kiraan.")+'</div></div>');
    var read=function(){ var n=s.querySelector("#edN").value.trim(); if(n) dr.n=n.slice(0,80); dr.d=+s.querySelector("#edD").value; var a=s.querySelector("#edS").value, b=s.querySelector("#edE").value; if(a) dr.s=toMin(a); if(b) dr.e=toMin(b); if(dr.e<dr.s) dr.e=dr.s; };
    s.querySelector("#edP").onclick=function(){ read(); closeSheet(); if(!window.UMX) return; UMX.picker("stop", function(v){ dr.p={n:v.n, ll:v.ll, c:cityOfLL(v.ll), cu:1}; editStop(i, dr); }, {center:pll(o.p)||[21.4225,39.8262], name:dr.n}); };
    s.querySelector("#edSave").onclick=function(){ read(); var key=o.key;
      if(o.xid){ (plan.extra||[]).forEach(function(x){ if(x.id===o.xid){ x.n=dr.n; x.d=dr.d; x.s=dr.s; x.e=dr.e; if(dr.p) x.p=dr.p; } }); }
      else { var e=plan.edits[key]||{}; if(dr.d!==o.d) e.d=dr.d; if(dr.s!==o.s) e.s=dr.s; if(dr.e!==o.e) e.e=dr.e; if(dr.n!==stopName(o)) e.n=dr.n; if(dr.p) e.p=dr.p; if(Object.keys(e).length) plan.edits[key]=e; }
      save(); closeSheet(); openIdx=-1; rebuild(); reopen(key); utoast(en?"Saved":"Disimpan"); };
    var rs=s.querySelector("#edReset"); if(rs) rs.onclick=function(){ if(o.xid) plan.extra=(plan.extra||[]).filter(function(x){ return x.id!==o.xid; }); else delete plan.edits[o.key]; save(); closeSheet(); openIdx=-1; rebuild(); if(!o.xid) reopen(o.key); };
    s.querySelector("#edAdd").onclick=function(){ closeSheet(); addAfter(i); };
  }
  function bindDetail(el){
    el.querySelectorAll("[data-ed]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); editStop(+b.getAttribute("data-ed")); }; });
    el.querySelectorAll("[data-step]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); step(+b.getAttribute("data-step")); }; });
    el.querySelectorAll("[data-nav]").forEach(function(b){ b.onclick=function(){ var o=stops[+b.getAttribute("data-nav")]; mapsGo(pll(o.p), o.mode); }; });
    el.querySelectorAll("[data-waze]").forEach(function(b){ b.onclick=function(){ var ll=pll(stops[+b.getAttribute("data-waze")].p); H.N.openUrl("https://waze.com/ul?ll="+ll[0]+","+ll[1]+"&navigate=yes"); }; });
    el.querySelectorAll("[data-bk]").forEach(function(b){ b.onclick=function(){ var o=stops[+b.getAttribute("data-bi")], city=P(typeof o.p==="string"?o.p:"")?P(o.p).c:null; openLink(b.getAttribute("data-bk"), {q:o.q, city:city==="mk"||city==="md"?city:null}); }; });
    el.querySelectorAll("[data-tw]").forEach(function(b){ b.onclick=function(){ H.tawaf(); }; });
    el.querySelectorAll("[data-hj]").forEach(function(b){ b.onclick=function(){ save(); killMap(); H.hajj(); }; });
    el.querySelectorAll("[data-hn]").forEach(function(b){ b.onchange=function(){ plan.hn=plan.hn||{}; plan.hn[b.getAttribute("data-hn")]=this.value.slice(0,80); save(); rebuild(); }; });
    el.querySelectorAll("[data-raud]").forEach(function(b){ b.onchange=function(){ plan.raud=this.value; save(); rebuild(); }; });
    el.querySelectorAll("[data-done]").forEach(function(b){ b.onchange=function(){ var o=stops[+b.getAttribute("data-done")]; if(this.checked) plan.done[o.key]=1; else delete plan.done[o.key]; save(); b.closest(".umst").classList.toggle("done", this.checked); }; });
    el.querySelectorAll("[data-del]").forEach(function(b){ b.onclick=function(){ var o=stops[+b.getAttribute("data-del")]; plan.del[o.key]=1; save(); openIdx=-1; rebuild(); utoast(en?"Removed. Reset in ⋯ menu.":"Dibuang. Set semula di menu ⋯."); }; });
  }
  function rebuild(){ var y=q("#umPane").scrollTop; setStops(); if(openIdx>=stops.length) openIdx=-1; drawTab(); q("#umPane").scrollTop=y; drawMapData(); }
  function dur(m){ m=Math.round(m); var h=Math.floor(m/60), mm=m%60; return (h?h+(en?" h ":" j "):"")+(mm||!h?mm+" min":"").trim(); }
  function modeIc(m){ return {walk:"🚶", car:"🚗", bus:"🚌", train:"🚄", flight:"✈"}[m]||"•"; }
  function modeName(m){ return L({walk:["Jalan kaki","Walk"], car:["Kereta","Car"], bus:["Bas","Bus"], train:["Kereta api","Train"], flight:["Penerbangan","Flight"]}[m]||["",""]); }
  function doaFor(o){
    if(!window.HJ_DOA) return null; var k=null;
    if(o.k==="prayer" && o.pk==="subuh" && o.p==="nabawi") k=null;
    if(o.k==="ziarah" && (o.p==="baqi"||o.p==="maala"||o.p==="uhud")) k="kubur";
    if(o.k==="ziarah" && o.p==="quba") k="quba";
    if(o.k==="raudhah") k="raudhah";
    if(o.hj==="niat") k="niat_u"; if(o.hj==="tawaf") k="niat_tawaf"; if(o.hj==="safa") k="safa"; if(o.hj==="solat_tawaf") k="zamzam"; if(o.hj==="wada") k="wada";
    if(o.k==="home") k="safar";
    var d=k&&HJ_DOA[k]; return d&&d.ar?{ar:d.ar, r:d.r, m:d.m}:null;
  }

  // ---------- cost tab ----------
  function drawCost(pane){
    var c=costs(plan), h='<div class="umpad"><div class="umsum big">'+(en?"Total for ":"Jumlah untuk ")+pax()+(en?" people":" orang")+'<b>'+rng(c.lo,c.hi)+'</b><span>'+(en?"per person ":"setiap orang ")+rng(c.pp.lo,c.pp.hi)+'</span><span class="mut small">≈ SAR '+Math.round(c.pp.lo/sarRate()).toLocaleString("en-US")+" – "+Math.round(c.pp.hi/sarRate()).toLocaleString("en-US")+' '+(en?"per person":"setiap orang")+' · 1 SAR ≈ RM '+sarRate().toFixed(2)+' ('+esc(st.fxDate||UM_ASOF)+')</span></div>';
    if(c.ram) h+='<div class="umwarn">⚠ '+(en?"Ramadan: lodging ×2.5 and flights ×1.5 are already included.":"Ramadan: penginapan ×2.5 dan penerbangan ×1.5 sudah dimasukkan.")+'</div>';
    h+='<div class="umcost">';
    c.rows.forEach(function(r){ h+='<div class="umcr"><div><b>'+r.ic+' '+esc(L(r.h))+'</b>'+(r.o?'<small>'+esc(L(r.o.n))+(r.mult>1?" × "+r.mult+(r.unit==="pn"?(en?" nights":" malam"):r.unit==="pd"?(en?" days":" hari"):""):"")+'</small>':'')+'</div><div class="umcv">'+(r.user?'<b>'+rm(r.lo)+'</b><small>'+(en?"your price":"harga anda")+'</small>':rng(r.lo,r.hi))+(r.fixed?'':'<input inputmode="decimal" data-px="'+r.cat+'" placeholder="'+(en?"real RM":"RM sebenar")+'" value="'+(r.user?esc(plan.px[r.cat]):"")+'">')+'</div></div>'; });
    h+='<div class="umcr"><div><b>➕ '+(en?"Buffer 10%":"Simpanan 10%")+'</b></div><div class="umcv">'+rng(c.buf.lo,c.buf.hi)+'</div></div></div>';
    h+='<div class="mut small">'+(en?"Typed prices are totals for the whole group. Estimates are rough (Nov 2026) and change with season, exchange rate and how early you book.":"Harga yang ditaip ialah jumlah untuk seluruh kumpulan. Anggaran adalah kasar (Nov 2026) dan berubah mengikut musim, kadar tukaran dan bila anda menempah.")+'</div>';
    h+='<button class="umbtn alt full" id="umFx">↻ '+(en?"Update exchange rate (online)":"Kemas kini kadar tukaran (dalam talian)")+'</button><button class="umbtn alt full" id="umEdit">✎ '+(en?"Change options":"Tukar pilihan")+'</button></div>';
    pane.innerHTML=h;
    pane.querySelectorAll("[data-px]").forEach(function(inp){ inp.onchange=function(){ var v=this.value.replace(/[^0-9.]/g,""); if(v==="") delete plan.px[this.getAttribute("data-px")]; else plan.px[this.getAttribute("data-px")]=v; save(); var y=pane.scrollTop; drawCost(pane); pane.scrollTop=y; }; });
    q("#umEdit").onclick=function(){ startWizard(plan,false); wiz.step=2; drawWizard(); };
    q("#umFx").onclick=fxUpdate;
  }
  function sarRate(){ return st.fx || 1.13; }
  function fxUpdate(){
    if(!H.fetch){ utoast(en?"Not available":"Tidak tersedia"); return; }
    H.fetch("https://api.frankfurter.app/latest?from=USD&to=MYR", function(status, bodyTxt){
      try{ var j=JSON.parse(bodyTxt), r=j.rates.MYR; if(r>2 && r<8){ st.fx=r/3.75; st.fxDate=j.date; save(); if(tab==="kos") drawTab(); utoast((en?"1 SAR = RM ":"1 SAR = RM ")+st.fx.toFixed(3)); return; } }catch(e){}
      utoast(en?"Could not update the rate. Using the saved one.":"Tidak dapat kemas kini kadar. Guna kadar tersimpan.");
    });
  }
  // ---------- booking tab ----------
  function drawBook(pane){
    var h='<div class="umpad"><div class="mut small">'+(en?"These open the real sites in the in-app browser. The app never handles payment. Search details (dates, people) are filled in where the site allows it.":"Pautan ini membuka laman sebenar dalam pelayar aplikasi. Aplikasi tidak mengendalikan bayaran. Butiran carian (tarikh, bilangan orang) diisi jika laman membenarkan.")+'</div>';
    var grp=function(t, items){ h+='<h3 class="umh">'+t+'</h3>'; items.forEach(function(it){ var Lk=UM_LINKS[it[0]]; h+='<button class="umlk" data-lk="'+it[0]+'" data-lq="'+esc(it[1]||"")+'" data-lc="'+(it[2]||"")+'"><b>'+esc(Lk.n)+(it[3]?" · "+esc(it[3]):"")+'</b><small>'+esc(L(Lk.d))+'</small>'+(it[0]==="nusuk"?'<span class="umoff">'+(en?"Official":"Rasmi")+'</span>':'')+'</button>'; }); };
    grp(en?"Permits & visa (official)":"Permit & visa (rasmi)", [["nusuk","","",en?"Raudhah & umrah permit":"Permit Raudhah & umrah"],["visa"]]);
    h+='<button class="umlk" id="umNusukApp"><b>Nusuk app · Google Play</b><small>'+(en?"Raudhah booking is in the app":"Tempahan Raudhah ada dalam aplikasi")+'</small></button>';
    var fl=chosen("flight"); grp(en?"Flights":"Penerbangan", fl.bk.map(function(k){ return [k]; }));
    var lm=chosen("lodgeMk"), ld=chosen("lodgeMd");
    grp(en?"Stay in Makkah":"Penginapan Makkah", (lm.bk.length?lm.bk:["gmaps"]).map(function(k){ return [k, lm.q||"hotel Makkah", "mk", L(lm.n)]; }));
    grp(en?"Stay in Madinah":"Penginapan Madinah", (ld.bk.length?ld.bk:["gmaps"]).map(function(k){ return [k, ld.q||"hotel Madinah", "md", L(ld.n)]; }));
    grp(en?"Trains & buses":"Kereta api & bas", [["hhr"],["saptco"],["makkahbus"]]);
    grp(en?"Rides & cars":"Teksi & kereta", [["uber"],["careem"],["yelo"],["rentals"]]);
    h+='<div class="mut small">'+(en?"Agoda, Google and Skyscanner links are pre-filled; if a site changes its search format it still opens on its home page. trivago: the search text is copied for you to paste.":"Pautan Agoda, Google dan Skyscanner diisi awal; jika laman menukar format carian, ia tetap dibuka di laman utama. trivago: teks carian disalin untuk anda tampal.")+'</div></div>';
    pane.innerHTML=h;
    pane.querySelectorAll("[data-lk]").forEach(function(b){ b.onclick=function(){ openLink(b.getAttribute("data-lk"), {q:b.getAttribute("data-lq"), city:b.getAttribute("data-lc")||null}); }; });
    q("#umNusukApp").onclick=function(){ H.N.openUrl(UM_LINKS.nusuk.app); };
  }
  // ---------- checklist tab ----------
  function checkItems(){
    var n=plan.needs||{}, cond={male:n.male, female:n.female, wheel:n.wheel, diabetes:n.diabetes, infant:plan.people.i>0, bekal:plan.ch.food==="bekal", rentcar:[plan.ch.transfer,plan.ch.intercity,plan.ch.local].indexOf("rentcar")>=0};
    return UM_CHECK.filter(function(c){ return !c[3] || cond[c[3]]; });
  }
  function drawCheck(pane){
    var items=checkItems(), done=items.filter(function(c){ return plan.check[c[0]]; }).length, h='<div class="umpad"><div class="umsum">'+done+" / "+items.length+(en?" packed":" siap")+'</div>';
    Object.keys(UM_CHECK_G).forEach(function(g){ var its=items.filter(function(c){ return c[1]===g; }); if(!its.length) return;
      h+='<h3 class="umh">'+L(UM_CHECK_G[g])+'</h3>'+its.map(function(c){ return '<label class="umchk"><input type="checkbox" data-ck="'+c[0]+'"'+(plan.check[c[0]]?" checked":"")+'><span>'+esc(L(c[2]))+'</span></label>'; }).join(""); });
    h+='<h3 class="umh">🚫 '+(en?"Don't bring":"Jangan bawa")+'</h3><ul class="umul">'+UM_DONT_BRING.map(function(x){ return '<li>'+esc(L(x))+'</li>'; }).join("")+'</ul></div>';
    pane.innerHTML=h;
    pane.querySelectorAll("[data-ck]").forEach(function(b){ b.onchange=function(){ var k=b.getAttribute("data-ck"); if(this.checked) plan.check[k]=1; else delete plan.check[k]; save(); var y=pane.scrollTop; drawCheck(pane); pane.scrollTop=y; }; });
  }
  function drawAdab(pane){
    var h='<div class="umpad"><h3 class="umh">✅ '+(en?"Do":"Buat")+'</h3>'+UM_ADAB.do.map(function(x){ return '<div class="umadab ok">'+esc(en?x[1]:x[0])+(x[2]==="hajj"?' <button class="umlink" data-hj2="1">'+(en?"3D guide ›":"Panduan 3D ›")+'</button>':x[2]==="nusuk"?' <button class="umlink" data-nus="1">Nusuk ›</button>':'')+'</div>'; }).join("");
    h+='<h3 class="umh">⛔ '+(en?"Don't":"Jangan")+'</h3>'+UM_ADAB.dont.map(function(x){ return '<div class="umadab no">'+esc(en?x[1]:x[0])+'</div>'; }).join("");
    h+='<div class="mut small">'+(en?"Prototype content following the Shafi'i school (Malaysian practice): please have it checked by an ustaz.":"Kandungan prototaip mengikut mazhab Syafi'i (amalan Malaysia): sila dapatkan semakan ustaz.")+'</div></div>';
    pane.innerHTML=h;
    pane.querySelectorAll("[data-hj2]").forEach(function(b){ b.onclick=function(){ save(); killMap(); H.hajj(); }; });
    pane.querySelectorAll("[data-nus]").forEach(function(b){ b.onclick=function(){ openLink("nusuk"); }; });
  }

  // ---------- ⋯ menu, sheets ----------
  function sheet(html){ closeSheet(); var s=document.createElement("div"); s.className="umsheet"; s.innerHTML='<div class="umsbg"></div><div class="umsc">'+html+'</div>'; root.appendChild(s); s.querySelector(".umsbg").onclick=closeSheet; return s; }
  function closeSheet(){ var s=q(".umsheet"); if(s) s.remove(); }
  function menu(){
    if(!plan) return;
    var s=sheet('<button data-m="edit">✎ '+(en?"Edit trip details":"Ubah butiran perjalanan")+'</button><button data-m="opts">⚙ '+(en?"Change options":"Tukar pilihan")+'</button><button data-m="pdf">📄 '+(en?"Export PDF document":"Eksport dokumen PDF")+'</button><button data-m="print">🖨 '+(en?"Print / save as PDF":"Cetak / simpan PDF")+'</button><button data-m="text">💬 '+(en?"Share as text":"Kongsi sebagai teks")+'</button><button data-m="ics">📅 '+(en?"Add to calendar (.ics)":"Masuk ke kalendar (.ics)")+'</button><button data-m="json">📤 '+(en?"Share plan file with family":"Kongsi fail rancangan kepada keluarga")+'</button><button data-m="reset">↺ '+(en?"Restore removed stops, undo my edits":"Pulihkan item dibuang, batal suntingan")+'</button><button data-m="list">☰ '+(en?"All my plans":"Semua rancangan saya")+'</button><button data-m="dup">⧉ '+(en?"Duplicate plan":"Salin rancangan")+'</button><button data-m="del" class="red">🗑 '+(en?"Delete plan":"Padam rancangan")+'</button>');
    s.querySelectorAll("[data-m]").forEach(function(b){ b.onclick=function(){ var m=b.getAttribute("data-m"); closeSheet();
      if(m==="edit") startWizard(plan,false);
      else if(m==="opts"){ startWizard(plan,false); wiz.step=2; drawWizard(); }
      else if(m==="print") printSheet();
      else if(m==="pdf") exportPdf();
      else if(m==="text") shareText(plainText());
      else if(m==="ics") shareIcs();
      else if(m==="json") shareJson();
      else if(m==="reset"){ plan.del={}; plan.edits={}; save(); rebuild(); }
      else if(m==="list"){ plan=null; st.ui.cur=null; save(); showList(); }
      else if(m==="dup"){ var c=JSON.parse(JSON.stringify(plan)); c.id="p"+Date.now(); c.name=planName(plan)+(en?" (copy)":" (salinan)"); c.done={}; st.plans.push(c); save(); showPlan(c); }
      else if(m==="del"){ var s2=sheet('<div class="umsct">'+(en?"Delete this plan? This cannot be undone.":"Padam rancangan ini? Tidak boleh dibatalkan.")+'</div><button data-y="1" class="red">'+(en?"Delete":"Padam")+'</button><button data-y="0">'+(en?"Cancel":"Batal")+'</button>');
        s2.querySelector('[data-y="1"]').onclick=function(){ st.plans=st.plans.filter(function(x){ return x.id!==plan.id; }); plan=null; st.ui.cur=null; save(); closeSheet(); killMap(); if(st.plans.length) showList(); else startWizard(newPlan(),true); };
        s2.querySelector('[data-y="0"]').onclick=closeSheet; }
    }; });
  }
  function plainText(){
    var start=parseYmd(plan.start), out=["🕋 "+planName(plan), fmtDate(start)+" · "+pax()+(en?" people":" orang")+" · "+L(UM_TIERS[plan.tier]?UM_TIERS[plan.tier].n:["",""])], lastD=-1;
    stops.forEach(function(o){ if(o.d!==lastD){ lastD=o.d; out.push(""); out.push("— "+(en?"Day ":"Hari ")+(o.d+1)+", "+fmtDate(addDays(start,o.d),true)+" —"); } out.push(stopTime(o)+"  "+stopName(o)); });
    var c=costs(plan); out.push(""); out.push((en?"Estimate per person: ":"Anggaran setiap orang: ")+rng(c.pp.lo,c.pp.hi)); out.push("— My Ihsan · Umrah DIY");
    return out.join("\n");
  }
  function shareText(t){ if(window.Native && H.N.shareTo) H.N.shareTo("", "", t); else { copy(t); utoast(en?"Copied":"Disalin"); } }
  function fileOut(name, mime, text){ if(window.Native && H.N.openTextFile) H.N.openTextFile(name, mime, text, true); else { var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text],{type:mime})); a.download=name; document.body.appendChild(a); a.click(); a.remove(); } }
  function shareIcs(){
    var start=parseYmd(plan.start), L_=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//My Ihsan//Umrah DIY//MS","CALSCALE:GREGORIAN","METHOD:PUBLISH"], stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"");
    var es=function(s){ return String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n"); };
    var utc=function(o, m){ var d=addDays(start,o.d); var t=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),0,0)+(m-o.tz*60)*60000; return new Date(t).toISOString().replace(/[-:]/g,"").replace(/\.\d+/,""); };
    stops.forEach(function(o,i){ if(o.k==="sleep") return; L_.push("BEGIN:VEVENT","UID:um-"+plan.id+"-"+i+"@my.ihsan.app","DTSTAMP:"+stamp,"DTSTART:"+utc(o,o.s),"DTEND:"+utc(o,Math.max(o.e,o.s+5)),"SUMMARY:"+es(stopName(o)),(pll(o.p)?"GEO:"+pll(o.p)[0]+";"+pll(o.p)[1]:"X-NOGEO:1"),"END:VEVENT"); });
    L_.push("END:VCALENDAR"); fileOut("umrah-"+plan.start+".ics","text/calendar",L_.join("\r\n")+"\r\n");
  }
  function shareJson(){ var c=JSON.parse(JSON.stringify(plan)); c.done={}; c.check={}; fileOut("umrah-plan-"+plan.start+".umrah.json","application/json",JSON.stringify({myIhsanUmrah:1, plan:c})); }
  function importSheet(){
    var s=sheet('<div class="umsct">'+(en?"Paste the plan file text here":"Tampal teks fail rancangan di sini")+'</div><textarea id="umImpT" rows="6"></textarea><button id="umImpGo" class="gold">'+(en?"Import":"Import")+'</button>');
    s.querySelector("#umImpGo").onclick=function(){ try{ var j=JSON.parse(s.querySelector("#umImpT").value); if(!j.myIhsanUmrah||!j.plan||!j.plan.start) throw 0; var p=j.plan; p.id="p"+Date.now(); p.done={}; p.check=p.check||{}; p.del=p.del||{}; p.px=p.px||{}; st.plans.push(p); save(); closeSheet(); showPlan(p); }catch(e){ utoast(en?"That is not a plan file":"Itu bukan fail rancangan"); } };
  }
  function printSheet(){
    var s=sheet('<div class="umsct">'+(en?"Print or save as PDF":"Cetak atau simpan PDF")+'</div><label class="umchk"><input type="checkbox" id="prC" checked><span>'+(en?"Include costs":"Sertakan kos")+'</span></label><label class="umchk"><input type="checkbox" id="prK" checked><span>'+(en?"Include checklist and do's & don'ts":"Sertakan senarai semak dan adab")+'</span></label><label class="umchk"><input type="checkbox" id="prM" checked><span>'+(en?"Include the map picture":"Sertakan gambar peta")+'</span></label><div class="umseg"><button data-sz="A4" class="on">A4</button><button data-sz="A5">A5</button></div><button id="prGo" class="gold">🖨 '+(en?"Print":"Cetak")+'</button>');
    var sz="A4"; s.querySelectorAll("[data-sz]").forEach(function(b){ b.onclick=function(){ sz=b.getAttribute("data-sz"); s.querySelectorAll("[data-sz]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
    s.querySelector("#prGo").onclick=function(){ var o={c:s.querySelector("#prC").checked, k:s.querySelector("#prK").checked, m:s.querySelector("#prM").checked, sz:sz}; closeSheet(); doPrint(o); };
  }
  function doPrint(o){
    if(o.m && map && !o._snap){
      var done=false, snap=function(){ if(done) return; done=true; try{ o._img=map.getCanvas().toDataURL("image/jpeg",0.82); }catch(e){ o._img=""; } o._snap=1; doPrint(o); };
      var keep=openIdx; openIdx=0; focusStop(0, true); fitAll(true); openIdx=keep; map.once("idle", snap); setTimeout(snap, 2500); return;
    }
    var img=o._img||"";
    var start=parseYmd(plan.start), c=costs(plan), h='<style>@page{size:'+o.sz+';margin:12mm}</style><div class="prh"><h1>🕋 '+esc(planName(plan))+'</h1><div>'+fmtDate(start)+' ('+esc(hijriS(start))+') · '+plan.days+(en?" days · ":" hari · ")+pax()+(en?" people · ":" orang · ")+esc(L(UM_TIERS[plan.tier]?UM_TIERS[plan.tier].n:["",""]))+(o.c?' · '+(en?"estimate ":"anggaran ")+rng(c.lo,c.hi):'')+'</div><div>'+(en?"From ":"Dari ")+esc(plan.home.n)+' ('+esc(plan.home.ap)+')</div></div>';
    if(img) h+='<img class="prmap" src="'+img+'">';
    var lastD=-1;
    stops.forEach(function(s){ if(s.d!==lastD){ if(lastD>=0) h+='</tbody></table>'; lastD=s.d; h+='<h2>'+(en?"Day ":"Hari ")+(s.d+1)+' · '+fmtDate(addDays(start,s.d),true)+' · '+esc(hijriS(addDays(start,s.d)))+'</h2><table class="prt"><tbody>'; }
      h+='<tr><td class="prtm">'+stopTime(s)+(s.e>s.s?"–"+hm(s.e):"")+'</td><td><b>'+esc(stopName(s))+'</b>'+(s.mode&&s.km?' <span class="prmut">'+modeName(s.mode)+" "+(s.km<1?Math.round(s.km*1000)+" m":s.km.toFixed(s.km<10?1:0)+" km")+(s.min?" · "+dur(s.min):"")+'</span>':'')+(s.note?'<div class="prmut">'+esc(L(s.note))+'</div>':'')+'</td><td class="prbox">☐</td></tr>'; });
    h+='</tbody></table>';
    if(o.c){ h+='<h2>'+(en?"Cost estimate":"Anggaran kos")+'</h2><table class="prt"><tbody>'+c.rows.map(function(r){ return '<tr><td>'+esc(L(r.h))+(r.o?' · '+esc(L(r.o.n)):'')+'</td><td class="prr">'+(r.user?rm(r.lo):rng(r.lo,r.hi))+'</td></tr>'; }).join("")+'<tr><td><b>'+(en?"Total (incl. 10% buffer)":"Jumlah (termasuk simpanan 10%)")+'</b></td><td class="prr"><b>'+rng(c.lo,c.hi)+'</b></td></tr></tbody></table>'; }
    if(o.k){ h+='<h2>'+(en?"Checklist":"Senarai semak")+'</h2><div class="prcols">'+checkItems().map(function(x){ return '<div>'+(plan.check[x[0]]?"☑":"☐")+' '+esc(L(x[2]))+'</div>'; }).join("")+'</div>';
      h+='<h2>'+(en?"Do & don't":"Adab")+'</h2><ul>'+UM_ADAB.do.map(function(x){ return '<li>✅ '+esc(en?x[1]:x[0])+'</li>'; }).join("")+UM_ADAB.dont.map(function(x){ return '<li>⛔ '+esc(en?x[1]:x[0])+'</li>'; }).join("")+'</ul>'; }
    h+='<div class="prmut">'+(en?"Estimates as of ":"Anggaran setakat ")+UM_ASOF+'. My Ihsan · Umrah DIY. '+(en?"Map data © OpenStreetMap contributors.":"Data peta © penyumbang OpenStreetMap.")+'</div>';
    var pr=document.getElementById("umPrint"); if(!pr){ pr=document.createElement("div"); pr.id="umPrint"; document.body.appendChild(pr); }
    pr.innerHTML=h; document.body.classList.add("umprinting");
    var done=function(){ document.body.classList.remove("umprinting"); };
    setTimeout(function(){ if(window.Native && H.N.printPage){ H.N.printPage(planName(plan)); setTimeout(done, 4000); } else { window.print(); setTimeout(done, 500); } }, 300);
  }

  // ---------- PDF document: page 1 is the whole trip on a map, then every detail to the end ----------
  var PDF_CSS='.updoc{font-family:Roboto,"Noto Sans",Arial,sans-serif;color:#1d2a22;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}'+
    '.upg{width:794px;height:1123px;box-sizing:border-box;padding:36px 40px 0;position:relative;overflow:hidden;background:#fff;break-after:page;page-break-after:always}'+
    '.upgin{height:1040px;overflow:hidden}'+
    '.upft{position:absolute;left:40px;right:40px;bottom:14px;font-size:9.5px;color:#7a857e;display:flex;justify-content:space-between;border-top:1px solid #e3e0d6;padding-top:5px}'+
    '.uph1{font-size:24px;font-weight:700;color:#0e5a3a;margin:0 0 4px}.upsub{font-size:12px;color:#4a564f;margin-bottom:8px;line-height:1.45}'+
    '.upmap{display:block;width:714px;border-radius:8px;border:1px solid #d9d4c4;object-fit:cover;margin:6px 0 8px}'+
    '.uph2{font-size:16px;font-weight:700;color:#0e5a3a;margin:14px 0 6px;padding-bottom:3px;border-bottom:2px solid #d9b651}'+
    '.upleg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px 12px;font-size:10px;line-height:1.3;margin-bottom:2px}'+
    '.upleg div{display:flex;gap:5px;align-items:flex-start}'+
    '.upn{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:17px;height:17px;border-radius:9px;color:#fff;font-size:9.5px;font-weight:700;padding:0 3px;box-sizing:border-box}'+
    '.upday{margin:14px 0 4px;padding:6px 10px;border-radius:6px;font-size:13px;color:#fff;font-weight:700}.upday span{font-weight:400;opacity:.92}'+
    '.upst{display:flex;gap:8px;padding:6px 0 6px 6px;border-bottom:1px solid #ece8dc;border-left:3px solid var(--dc);font-size:11px;line-height:1.4}'+
    '.uptm{flex:none;width:58px;font-weight:700;font-size:11px;color:#2f3b34}.uptm small{display:block;font-weight:400;color:#7a857e}'+
    '.upbd{flex:1;min-width:0}.upbd>b{font-size:12px}.upar{font-family:"Noto Naskh Arabic","Amiri",serif;font-size:13px;direction:rtl}'+
    '.upm{color:#5c675f;font-size:10px}.uptip{color:#7a5d12;font-size:10.5px}'+
    '.updoa{background:#f6f2e6;border-radius:5px;padding:4px 7px;margin-top:3px;font-size:10.5px}.updoa .upar{font-size:14px}'+
    '.uplk{font-size:9px;color:#2a5f9e;word-break:break-all}'+
    '.uprow{display:flex;justify-content:space-between;gap:10px;font-size:11px;padding:4px 0;border-bottom:1px solid #ece8dc}.uprow b{font-weight:700}'+
    '.upcols{display:grid;grid-template-columns:1fr 1fr;gap:2px 14px;font-size:10.5px}'+
    '.upli{font-size:11px;padding:2px 0;line-height:1.4}.upnote{font-size:9.5px;color:#7a857e;margin-top:10px}';
  function snapMap(city, cb){
    if(!map || !map.getCanvas){ cb(null); return; }
    var cityOf=function(pp){ if(typeof pp==="object") return pp.c||null; return P(pp)?P(pp).c:null; };
    var keys=Object.keys(pnum).filter(function(k){ return !city || cityOf(pnum[k].pp)===city; });
    if(!keys.length){ cb(null); return; }
    try{
      var seq=seqFrom(0), feats=[];
      for(var k=1;k<seq.length;k++){ var a=seq[k-1].ll, b=seq[k].ll, m=seq[k].mode||guessMode(a,b); feats.push({type:"Feature", properties:{r:"a", c:m==="flight"?"#7a5d12":"#0e6b45"}, geometry:{type:"LineString", coordinates:m==="flight"?gcLine(a,b):[[a[1],a[0]],[b[1],b[0]]]}}); }
      var src=map.getSource("rt"); if(src) src.setData({type:"FeatureCollection", features:feats});
      var bb=new maplibregl.LngLatBounds(); keys.forEach(function(k){ var ll=pll(pnum[k].pp); bb.extend([ll[1],ll[0]]); });
      map.fitBounds(bb, {padding:36, maxZoom:city?16:14, duration:0});
    }catch(e){ cb(null); return; }
    var done=false, go=function(){ if(done) return; done=true;
      try{
        var cv=map.getCanvas(), W=cv.width, Hh=cv.height, c2=document.createElement("canvas"); c2.width=W; c2.height=Hh;
        var g=c2.getContext("2d"); g.drawImage(cv,0,0); var r=W/(cv.clientWidth||W), R=9*r;
        // 0.26.0: numbers that would overlap are laid side by side in a row (with a thin line to the real spot), so every number can be read
        var pts=[]; keys.forEach(function(k){ var P0=pnum[k], ll=pll(P0.pp), pt=map.project([ll[1],ll[0]]); var x=pt.x*r, y=pt.y*r; if(x<-R||y<-R||x>W+R||y>Hh+R) return; pts.push({x:x,y:y,P:P0}); });
        pts.sort(function(a,b){ return a.P.n-b.P.n; });
        var cl=[]; pts.forEach(function(p){ var hit=null; for(var i=0;i<cl.length && !hit;i++) for(var j=0;j<cl[i].length;j++){ var q2=cl[i][j]; if(Math.abs(q2.x-p.x)<2.3*R && Math.abs(q2.y-p.y)<2.3*R){ hit=cl[i]; break; } } if(hit) hit.push(p); else cl.push([p]); });
        var badge=function(x,y,P0){ g.beginPath(); g.arc(x,y,R,0,Math.PI*2); g.fillStyle=dayColor(P0.d); g.fill(); g.lineWidth=1.8*r; g.strokeStyle="#fff"; g.stroke();
          g.fillStyle="#fff"; g.font="bold "+Math.round((P0.n>99?7.5:9)*r)+"px sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(String(P0.n), x, y+0.5*r); };
        cl.forEach(function(c){
          if(c.length===1){ badge(c[0].x, c[0].y, c[0].P); return; }
          var cx=0, cy=0; c.forEach(function(p){ cx+=p.x; cy+=p.y; }); cx/=c.length; cy/=c.length;
          var per=Math.max(1, Math.min(c.length, Math.floor((W-4*R)/(2.15*R)), 8)), rows=Math.ceil(c.length/per), gap=2.15*R;
          var top=cy-(rows*gap)-R*1.2; if(top<R*1.2) top=cy+R*2.4;
          c.forEach(function(p,i){ var row=Math.floor(i/per), inRow=Math.min(per, c.length-row*per), col=i%per;
            var bx=cx-(inRow-1)*gap/2+col*gap; bx=Math.max(R+2, Math.min(W-R-2, bx)); p.bx=bx; p.by=top+row*gap; });
          c.forEach(function(p){ g.beginPath(); g.moveTo(p.x,p.y); g.lineTo(p.bx,p.by); g.lineWidth=1.2*r; g.strokeStyle="rgba(29,42,34,.55)"; g.stroke();
            g.beginPath(); g.arc(p.x,p.y,2.4*r,0,Math.PI*2); g.fillStyle=dayColor(p.P.d); g.fill(); });
          c.forEach(function(p){ badge(p.bx, p.by, p.P); });
        });
        cb({src:c2.toDataURL("image/jpeg",0.86), w:W, h:Hh});
      }catch(e){ cb(null); }
    };
    map.once("idle", function(){ setTimeout(go, 150); }); setTimeout(go, 3500);
  }
  function stopDoc(o){
    var pl=typeof o.p==="object"?o.p:P(o.p), ll=pll(o.p), dc=dayColor(o.d), full=typeof o.p==="object"?o.p.n:(pl?L(pl.n):"");
    var h='<div class="upst" style="--dc:'+dc+'"><span class="upn" style="background:'+(o.no?dc:"#bbb")+'">'+(o.no||"·")+'</span><div class="uptm">'+hm(o.s)+(o.e>o.s?" – "+hm(o.e):"")+'<small>'+(o.tz===MYT?(en?"Malaysia":"Malaysia"):(en?"Saudi":"Saudi"))+(o.e-o.s>=5?" · "+dur(o.e-o.s):"")+'</small></div><div class="upbd"><b>'+(KIND_IC[o.k]||"")+' '+esc(stopName(o))+'</b>';
    if(full && full!==stopName(o)) h+='<div class="upm">'+esc(full)+'</div>';
    if(pl && pl.ar) h+='<div class="upar">'+esc(pl.ar)+'</div>';
    var meta=[]; if(o.mode && (o.km||o.min)) meta.push(modeIc(o.mode)+" "+modeName(o.mode)+(o.km?" "+(o.km<1?Math.round(o.km*1000)+" m":o.km.toFixed(o.km<10?1:0)+" km"):"")+(o.min?" · "+dur(o.min):"")+(o.to?" → "+esc(pname(o.to)):""));
    if(o.azan) meta.push("azan "+o.azan); if(ll && !(pl&&pl.home)) meta.push("📍 "+ll[0].toFixed(5)+", "+ll[1].toFixed(5));
    if(meta.length) h+='<div class="upm">'+meta.join(" · ")+'</div>';
    if(pl && pl.d) h+='<div>'+esc(L(pl.d))+'</div>';
    if(o.note) h+='<div>'+esc(L(o.note))+'</div>';
    if(o.tip) h+='<div class="uptip">💡 '+esc(L(o.tip))+'</div>';
    if(o.k==="raudhah" && plan.raud) h+='<div class="uptip">🌿 '+(en?"My slot: ":"Slot saya: ")+esc(plan.raud)+'</div>';
    var doa=doaFor(o); if(doa) h+='<div class="updoa"><div class="upar">'+esc(doa.ar)+'</div>'+(doa.r?'<div class="upm">'+esc(doa.r)+'</div>':'')+'<div>'+esc(L(doa.m))+'</div></div>';
    var city=pl&&pl.c?pl.c:null;
    (o.bk||[]).forEach(function(k){ var u=UM_LINKS[k]?linkUrl(k,{q:o.q, city:city==="mk"||city==="md"?city:null}):null; if(u) h+='<div class="uplk">🔗 '+esc(UM_LINKS[k].n)+': '+esc(u)+'</div>'; });
    return h+'</div><span class="upm">'+(plan.done[o.key]?"☑":"☐")+'</span></div>';
  }
  function pdfBlocks(imgs){
    var B=[], add=function(h, o){ B.push({h:h, keep:o&&o.keep, brk:o&&o.brk}); }, start=parseYmd(plan.start), c=costs(plan), pl=plan.places||{};
    var imgTag=function(im, maxH){ var hh=Math.round(714*im.h/im.w); if(hh>maxH) hh=maxH; return '<img class="upmap" src="'+im.src+'" width="714" height="'+hh+'" style="height:'+hh+'px" alt="">'; };
    add('<div><div class="uph1">🕋 '+esc(planName(plan))+'</div><div class="upsub">'+fmtDate(start)+' ('+esc(hijriS(start))+') · '+plan.days+(en?" days · ":" hari · ")+pax()+(en?" people · ":" orang · ")+esc(L(UM_TIERS[plan.tier]?UM_TIERS[plan.tier].n:["",""]))+' · '+(en?"estimate ":"anggaran ")+rng(c.lo,c.hi)+'<br>🏠 '+esc(plan.home.n)+' · 🕋 '+esc(lname("mk"))+' · 🕌 '+esc(lname("md"))+'</div></div>');
    if(imgs.all) add(imgTag(imgs.all, 600)); else add('<div class="upnote">'+(en?"The map could not be drawn on this phone, so the PDF has the list only.":"Peta tidak dapat dilukis pada telefon ini, jadi PDF hanya ada senarai.")+'</div>');
    var keys=Object.keys(pnum).sort(function(a,b){ return pnum[a].n-pnum[b].n; });
    add('<div class="uph2">'+(en?"Places on the map":"Tempat di peta")+'</div>', {keep:1});
    for(var i=0;i<keys.length;i+=24){ add('<div class="upleg">'+keys.slice(i,i+24).map(function(k){ var P0=pnum[k]; return '<div><span class="upn" style="background:'+dayColor(P0.d)+'">'+P0.n+'</span><span>'+esc(pname(P0.pp))+' <i style="color:#7a857e">('+(en?"day ":"hari ")+P0.visits.map(function(v){ return v.d+1; }).filter(function(v,j,a){ return a.indexOf(v)===j; }).join(", ")+')</i></span></div>'; }).join("")+'</div>'); }
    var first=true; ["mk","md"].forEach(function(cy){ if(!imgs[cy]) return; add('<div class="uph2">'+(cy==="mk"?(en?"Makkah":"Makkah"):(en?"Madinah":"Madinah"))+'</div>', {keep:1, brk:first}); first=false; add(imgTag(imgs[cy], 440)); });
    var lastD=-1;
    stops.forEach(function(o, i){
      if(o.d!==lastD){ lastD=o.d; var dt=addDays(start,o.d); add('<div class="upday" style="background:'+dayColor(o.d)+'">'+(en?"Day ":"Hari ")+(o.d+1)+' <span>· '+fmtDate(dt,true)+' · '+esc(hijriS(dt))+'</span></div>', {keep:1, brk:i===0}); }
      add(stopDoc(o));
    });
    add('<div class="uph2">'+(en?"Cost estimate":"Anggaran kos")+'</div>', {keep:1, brk:1});
    c.rows.forEach(function(r){ add('<div class="uprow"><span>'+r.ic+' '+esc(L(r.h))+(r.o?' · '+esc(L(r.o.n)):'')+'</span><span>'+(r.user?rm(r.lo):rng(r.lo,r.hi))+'</span></div>'); });
    add('<div class="uprow"><b>'+(en?"Total for ":"Jumlah untuk ")+pax()+(en?" people (incl. 10% buffer)":" orang (termasuk simpanan 10%)")+'</b><b>'+rng(c.lo,c.hi)+'</b></div>');
    add('<div class="uprow"><span>'+(en?"Per person":"Setiap orang")+'</span><span>'+rng(c.pp.lo,c.pp.hi)+'</span></div>');
    if(plan.exp && plan.exp.length){ var tot=plan.exp.reduce(function(a,x){ return a+(x.cur==="SAR"?x.a*sarRate():(+x.a||0)); },0); add('<div class="uprow"><span>🧾 '+(en?"Spent so far (tracker)":"Sudah dibelanja (tracker)")+'</span><span>'+rm(tot)+'</span></div>'); }
    add('<div class="uph2">'+(en?"Booking links":"Pautan tempahan")+'</div>', {keep:1});
    var lk=[["nusuk"],["visa"]].concat(chosen("flight").bk.map(function(k){ return [k]; }));
    var lm=chosen("lodgeMk"), ld=chosen("lodgeMd");
    (lm.bk.length?lm.bk:["gmaps"]).forEach(function(k){ lk.push([k, lm.q||"hotel Makkah", "mk"]); }); (ld.bk.length?ld.bk:["gmaps"]).forEach(function(k){ lk.push([k, ld.q||"hotel Madinah", "md"]); });
    lk=lk.concat([["hhr"],["saptco"],["makkahbus"],["uber"],["careem"]]);
    lk.forEach(function(x){ var u=UM_LINKS[x[0]]?linkUrl(x[0], {q:x[1], city:x[2]||null}):null; if(u) add('<div class="upli"><b>'+esc(UM_LINKS[x[0]].n)+(x[2]?" · "+(x[2]==="mk"?"Makkah":"Madinah"):"")+'</b><div class="uplk">'+esc(u)+'</div></div>'); });
    add('<div class="uph2">'+(en?"My places":"Tempat saya")+'</div>', {keep:1});
    var plRow=function(t, v){ if(v) add('<div class="uprow"><span>'+t+' <b>'+esc(v.n)+'</b></span><span class="upm">'+v.ll[0].toFixed(5)+", "+v.ll[1].toFixed(5)+'</span></div>'); };
    plRow("🏠", {n:plan.home.n, ll:plan.home.ll}); plRow("🕋 "+(en?"Hotel":"Hotel"), pl.mk); plRow("🕌 "+(en?"Hotel":"Hotel"), pl.md);
    (pl.fmk||[]).forEach(function(v){ plRow("🍽 Makkah", v); }); (pl.fmd||[]).forEach(function(v){ plRow("🍽 Madinah", v); });
    if(!pl.mk && !pl.md) add('<div class="upm">'+(en?"Hotels: ":"Hotel: ")+esc(lname("mk"))+" · "+esc(lname("md"))+'</div>');
    var items=checkItems(); add('<div class="uph2">'+(en?"Packing checklist":"Senarai semak")+' · '+items.filter(function(x){ return plan.check[x[0]]; }).length+' / '+items.length+'</div>', {keep:1, brk:1});
    for(var j=0;j<items.length;j+=16) add('<div class="upcols">'+items.slice(j,j+16).map(function(x){ return '<div>'+(plan.check[x[0]]?"☑":"☐")+' '+esc(L(x[2]))+'</div>'; }).join("")+'</div>');
    add('<div class="uph2">🚫 '+(en?"Don't bring":"Jangan bawa")+'</div>', {keep:1});
    UM_DONT_BRING.forEach(function(x){ add('<div class="upli">• '+esc(L(x))+'</div>'); });
    add('<div class="uph2">✅ '+(en?"Do":"Buat")+'</div>', {keep:1}); UM_ADAB.do.forEach(function(x){ add('<div class="upli">✅ '+esc(en?x[1]:x[0])+'</div>'); });
    add('<div class="uph2">⛔ '+(en?"Don't":"Jangan")+'</div>', {keep:1}); UM_ADAB.dont.forEach(function(x){ add('<div class="upli">⛔ '+esc(en?x[1]:x[0])+'</div>'); });
    if(window.UMX_SOS){ add('<div class="uph2">🆘 '+(en?"Emergency":"Kecemasan")+'</div>', {keep:1});
      UMX_SOS.forEach(function(x){ add('<div class="uprow"><span>'+esc(L(x.t))+'</span><b>📞 '+esc(x.n)+'</b></span></div>'); });
      (window.UMX_EMBASSY||[]).forEach(function(e){ add('<div class="upli"><b>🇲🇾 '+esc(L(e.n))+'</b><div class="uplk">'+esc(e.u)+'</div></div>'); });
      var lo=plan.lost||{}; if(lo.phone||lo.group) add('<div class="upli">🪪 '+(en?"My phone: ":"Telefon saya: ")+esc(lo.phone||"-")+' · '+(en?"Group: ":"Rombongan: ")+esc(lo.group||"-")+'</div>'); }
    add('<div class="upnote">'+(en?"Estimates as of ":"Anggaran setakat ")+UM_ASOF+'. '+(en?"Times are estimates; prayer times by Umm al-Qura calculation. Content follows the Shafi\'i school; please have it checked by an ustaz. ":"Masa ialah anggaran; waktu solat kiraan Umm al-Qura. Kandungan mengikut mazhab Syafi\'i; sila semak dengan ustaz. ")+'My Ihsan · Umrah DIY. '+(en?"Map data © OpenStreetMap contributors.":"Data peta © penyumbang OpenStreetMap.")+'</div>');
    return B;
  }
  function paginate(blocks, label){
    // measure every block once in a single column, then pack them into A4 pages by height (no repeated layouts)
    var host=document.createElement("div"); host.className="updoc"; host.style.cssText="position:fixed;left:-40000px;top:0;width:714px;visibility:hidden";
    host.innerHTML='<style>'+PDF_CSS+'</style>'+blocks.map(function(b){ return '<div class="upmz" style="display:flow-root">'+b.h+'</div>'; }).join("");
    document.body.appendChild(host);
    var hs=Array.prototype.map.call(host.querySelectorAll(".upmz"), function(e){ return e.offsetHeight; });
    host.remove();
    var LIM=1036, pages=[], cur=[], used=0, keepRun=[];
    var flush=function(){ pages.push(cur); cur=[]; used=0; };
    blocks.forEach(function(b,i){
      var h=hs[i]||0;
      if(b.brk && cur.length) flush();
      if(used+h>LIM && cur.length){
        var carry=[]; while(cur.length>1 && cur[cur.length-1].keep){ carry.unshift(cur.pop()); }
        flush(); carry.forEach(function(c){ cur.push(c); used+=c.hh; });
      }
      cur.push({h:b.h, keep:b.keep, hh:h}); used+=h;
    });
    if(cur.length) flush();
    var n=pages.length;
    var html=pages.map(function(pg,i){ return '<div class="upg"><div class="upgin">'+pg.map(function(x){ return '<div style="display:flow-root">'+x.h+'</div>'; }).join("")+'</div><div class="upft"><span>'+esc(label)+'</span><span>'+(en?"Page ":"Muka ")+(i+1)+' / '+n+'</span></div></div>'; }).join("");
    return {html:html, n:n};
  }
  var pdfBusy=false;
  function exportPdf(){
    if(!plan || pdfBusy) return; closeAllLayers(); closeSheet(); pdfBusy=true;
    if(tab!=="jadual"){ tab="jadual"; qa("[data-tab]").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-tab")==="jadual"); }); drawTab(); }
    utoast(en?"Preparing the PDF…":"Menyediakan PDF…");
    var imgs={}, list=[null,"mk","md"], keep=openIdx;
    var next=function(i){
      if(i>=list.length){ finish(); return; }
      snapMap(list[i], function(r){ imgs[list[i]||"all"]=r; next(i+1); });
    };
    var finish=function(){
      try{ focusStop(keep, keep<0); if(keep<0) fitAll(true); }catch(e){}
      var label=planName(plan), doc;
      try{ doc=paginate(pdfBlocks(imgs), label); }catch(e){ pdfBusy=false; utoast((en?"PDF failed: ":"PDF gagal: ")+e); return; }
      var name="Umrah-"+plan.start+"-"+String(label).replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)+".pdf";
      var full='<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}'+PDF_CSS+'</style></head><body><div class="updoc">'+doc.html+'</div></body></html>';
      if(window.Native && H.N.printHtml){
        var hl=function(r){ H.off("pdf", hl); pdfBusy=false; if(!(r && r.ok)) printDoc(doc.html, label); };
        H.on("pdf", hl); utoast(en?"Choose \"Save as PDF\" as the printer":"Pilih \"Simpan sebagai PDF\" sebagai pencetak"); H.N.printHtml(full, label);
        setTimeout(function(){ pdfBusy=false; }, 8000);
      } else { pdfBusy=false; printDoc(doc.html, label); }
    };
    setTimeout(function(){ next(0); }, map?250:0);
  }
  function printDoc(pagesHtml, label){
    var pr=document.getElementById("umPrint"); if(!pr){ pr=document.createElement("div"); pr.id="umPrint"; document.body.appendChild(pr); }
    pr.innerHTML='<style>@page{size:A4;margin:0}'+PDF_CSS+'</style><div class="updoc">'+pagesHtml+'</div>'; document.body.classList.add("umprinting","umpdf");
    var done=function(){ document.body.classList.remove("umprinting","umpdf"); };
    setTimeout(function(){ if(window.Native && H.N.printPage){ H.N.printPage(label); setTimeout(done, 4000); } else { window.print(); setTimeout(done, 500); } }, 300);
  }

  // ---------- map ----------
  var ONLINE_STYLE="https://tiles.openfreemap.org/styles/liberty";
  function offlineStyle(){
    return {version:8, sources:{w:{type:"geojson", data:window.UMRAH_WORLD||{type:"FeatureCollection",features:[]}}}, layers:[
      {id:"bg", type:"background", paint:{"background-color":"#a9cbe0"}},
      {id:"land", type:"fill", source:"w", paint:{"fill-color":"#efe9dc"}},
      {id:"bord", type:"line", source:"w", paint:{"line-color":"#b9ad95", "line-width":0.6}}
    ]};
  }
  function initMap(){
    var el=q("#umMap"); if(!el) return;
    if(!window.maplibregl){ el.innerHTML='<div class="umnomap">'+(en?"Map not available":"Peta tidak tersedia")+'</div>'; return; }
    var want=(navigator.onLine===false || st.ui.map==="offline")?"offline":"online";
    try{
      map=new maplibregl.Map({container:el, style:want==="online"?ONLINE_STYLE:offlineStyle(), center:[39.8262,21.4225], zoom:5, attributionControl:false, preserveDrawingBuffer:true, maxPitch:0, dragRotate:false, fadeDuration:0});
    }catch(e){ map=null; el.innerHTML='<div class="umnomap">'+(en?"This phone cannot draw the map (WebGL). The itinerary still works.":"Telefon ini tidak dapat melukis peta (WebGL). Jadual tetap berfungsi.")+'</div>'; return; }
    mapMode=want; window.__umMap=map; map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.AttributionControl({compact:true, customAttribution:"© OpenStreetMap"+(want==="online"?" · OpenFreeMap":"")}));
    var loaded=false;
    map.on("style.load", function(){ loaded=true; if(mapMode==="online") englishLabels(); drawMapData(); });
    map.on("error", function(e){ if(!loaded && mapMode==="online"){ clearTimeout(mapTimer); setMapMode("offline", true); } });
    if(want==="online") mapTimer=setTimeout(function(){ if(!loaded) setMapMode("offline", true); }, 8000);
    note(want);
  }
  function note(mode){ var n=q("#umMapNote"); if(n) n.textContent=mode==="offline"?(en?"Offline map: outline only. Connect to the internet for streets.":"Peta luar talian: garis kasar sahaja. Sambung internet untuk jalan."):""; }
  function setMapMode(m, auto){ if(!map) return; mapMode=m; st.ui.map=auto?st.ui.map:m; save(); map.setStyle(m==="online"?ONLINE_STYLE:offlineStyle()); note(m); if(auto) utoast(en?"No internet: showing the offline map":"Tiada internet: peta luar talian"); }
  function englishLabels(M){ M=M||map;
    try{ M.getStyle().layers.forEach(function(ly){ if(ly.type==="symbol" && ly.layout && ly.layout["text-field"]){ M.setLayoutProperty(ly.id, "text-field", ["coalesce",["get","name_en"],["get","name:en"],["get","name:latin"],["get","name"]]); } }); }catch(e){}
  }
  function killMap(){ clearTimeout(mapTimer); if(map){ try{ map.remove(); }catch(e){} } map=null; markers={}; }
  function stopLL(o){ return pll(o.p); }
  function gcLine(a,b){ var pts=[], n=48; var d2r=Math.PI/180, la1=a[0]*d2r, lo1=a[1]*d2r, la2=b[0]*d2r, lo2=b[1]*d2r;
    var d=2*Math.asin(Math.sqrt(Math.pow(Math.sin((la2-la1)/2),2)+Math.cos(la1)*Math.cos(la2)*Math.pow(Math.sin((lo2-lo1)/2),2))); if(d===0) return [[a[1],a[0]],[b[1],b[0]]];
    for(var i=0;i<=n;i++){ var f=i/n, A=Math.sin((1-f)*d)/Math.sin(d), B=Math.sin(f*d)/Math.sin(d), x=A*Math.cos(la1)*Math.cos(lo1)+B*Math.cos(la2)*Math.cos(lo2), y=A*Math.cos(la1)*Math.sin(lo1)+B*Math.cos(la2)*Math.sin(lo2), z=A*Math.sin(la1)+B*Math.sin(la2);
      pts.push([Math.atan2(y,x)/d2r, Math.atan2(z,Math.sqrt(x*x+y*y))/d2r]); } return pts; }
  function seqFrom(i){
    // places visited from stop i to the end, consecutive duplicates removed; each leg carries the mode of the stop that travels it
    var seq=[], last=null;
    for(var k=Math.max(0,i); k<stops.length; k++){ var o=stops[k], pts=[o.p]; if(o.to) pts.push(o.to);
      pts.forEach(function(pp, j){ var ll=pll(pp); if(!ll) return; var key=ll.join(","); if(key===last) return; seq.push({ll:ll, mode:j===1?o.mode:(o.from?o.mode:(seq.length?guessMode(seq[seq.length-1].ll,ll):null))}); last=key; }); }
    return seq;
  }
  // only the selected stop's day: previous leg dotted, next leg solid, the rest faint
  function dayLegs(i){
    var d=stops[i].d, pts=[], feats=[], pos=-1;
    stops.forEach(function(o,k){ if(o.d!==d) return; [o.p, o.to].forEach(function(pp,j){ var ll=pll(pp); if(!ll) return; var key=ll.join(","), last=pts[pts.length-1];
      if(last && last.key===key){ last.ks.push(k); return; } pts.push({ll:ll, key:key, ks:[k], mode:j===1?o.mode:(o.from?o.mode:null)}); }); });
    for(var x=0;x<pts.length;x++){ if(pts[x].ks.indexOf(i)>=0){ pos=x; break; } }
    for(var m=1;m<pts.length;m++){ var a=pts[m-1].ll, b=pts[m].ll, md=pts[m].mode||guessMode(a,b), r=m===pos?"p":m===pos+1?"n":"o";
      feats.push({type:"Feature", properties:{r:r, c:md==="flight"?"#7a5d12":dayColor(d)}, geometry:{type:"LineString", coordinates:md==="flight"?gcLine(a,b):[[a[1],a[0]],[b[1],b[0]]]}}); }
    return feats;
  }
  function guessMode(a,b){ var d=km(a,b); return d>500?"flight":d>1.6?"car":"walk"; }
  function drawMapData(){
    if(!map || !map.isStyleLoaded || !map.getStyle()) return;
    try{
      if(!map.getSource("rt")) map.addSource("rt",{type:"geojson", data:{type:"FeatureCollection",features:[]}});
      // r: o = other legs of the day (faint), p = leg into the selected stop (dotted), n = leg out of it (solid), a = all (PDF)
      var lay=[["rt-o","o",{"line-color":["get","c"],"line-width":2.2,"line-opacity":0.22,"line-dasharray":[1,2]}],
        ["rt-a","a",{"line-color":["get","c"],"line-width":2.6,"line-opacity":0.9,"line-dasharray":[1.5,1.5]}],
        ["rt-p","p",{"line-color":["get","c"],"line-width":3.6,"line-opacity":0.95,"line-dasharray":[0.3,1.6]}],
        ["rt-n","n",{"line-color":["get","c"],"line-width":4.2,"line-opacity":1}]];
      lay.forEach(function(x){ if(!map.getLayer(x[0])) map.addLayer({id:x[0], type:"line", source:"rt", filter:["==",["get","r"],x[1]], layout:{"line-cap":"round","line-join":"round"}, paint:x[2]}); });
    }catch(e){}
    // markers per unique place, numbered like the itinerary rows and coloured by day
    Object.keys(markers).forEach(function(k){ if(k!=="__me"){ markers[k].remove(); delete markers[k]; } });
    Object.keys(pnum).forEach(function(key){ var P0=pnum[key], pp=P0.pp, ll=pll(pp);
      var el=document.createElement("button"); el.className="umpin k-"+pinKind(pp); el.textContent=P0.n; el.style.background=dayColor(P0.d); el.setAttribute("aria-label", P0.n+". "+pname(pp));
      el.onclick=function(ev){ ev.stopPropagation(); var vs=P0.visits, idx=vs[0].i; for(var j=0;j<vs.length;j++){ if(vs[j].i>openIdx){ idx=vs[j].i; break; } } if(tab!=="jadual"){ tab="jadual"; qa("[data-tab]").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-tab")==="jadual"); }); drawTab(); } toggleStop(idx, true); };
      markers[key]=new maplibregl.Marker({element:el}).setLngLat([ll[1],ll[0]]).addTo(map); markers[key]._pl=pp; });
    focusStop(openIdx, openIdx<0);
  }
  function pinKind(pp){ if(typeof pp==="object") return pp.home?"home":pp.hotel?"hotel":pp.food?"food":pp.cu?"custom":"air"; return P(pp)?P(pp).k:"x"; }
  function labelBar(i){
    var lab=q("#umLabel"); if(!lab) return;
    var o=i>=0?stops[i]:null;
    lab.innerHTML='<button class="umlnav" data-ln="-1" aria-label="'+(en?"Previous stop":"Hentian sebelum")+'"'+(i<=0?" disabled":"")+'>‹</button><span class="umltx">'+(o?'<i class="umno" style="background:'+dayColor(o.d)+'">'+(o.no||"·")+'</i><b>'+(en?"Day ":"Hari ")+(o.d+1)+' · '+stopTime(o)+'</b> '+esc(stopName(o)):'<span class="mut2">'+(en?"Tap a stop, or › to walk through the trip":"Tekan hentian, atau › untuk ikut perjalanan")+'</span>')+'</span><button class="umlnav" data-ln="1" aria-label="'+(en?"Next stop":"Hentian seterusnya")+'"'+(i>=stops.length-1?" disabled":"")+'>›</button>';
    lab.classList.add("on");
    lab.querySelectorAll("[data-ln]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); step(+b.getAttribute("data-ln")); }; });
  }
  function focusStop(i, overview){
    labelBar(i); if(!map) return;
    var seq=seqFrom(i<0?0:i), feats=i<0?[]:dayLegs(i);
    var src=map.getSource && map.getSource("rt"); if(src) src.setData({type:"FeatureCollection", features:feats});
    var later={}; seq.forEach(function(s){ later[s.ll.join(",")]=1; });
    var cur=i>=0?pll(stops[i].p):null, ck=cur?cur.join(","):null;
    Object.keys(markers).forEach(function(k){ if(k==="__me") return; var el=markers[k].getElement(), P0=pnum[k]; el.classList.toggle("past", i>=0 && !later[k]); el.classList.toggle("sel", k===ck);
      if(P0){ var d=P0.d; if(i>=0){ for(var j=0;j<P0.visits.length;j++){ if(P0.visits[j].i>=i){ d=P0.visits[j].d; break; } } } el.style.background=dayColor(d); } });
    if(overview || i<0){ return; }
    var o=stops[i];
    if(o.k==="flight" && o.to){ var b=[pll(o.p), pll(o.to)]; fitLL(b, 40); return; }
    var pl=typeof o.p==="object"?null:P(o.p), z=pl?(pl.k==="airport"?12:pl.k==="area"?14:pl.k==="station"?13:pl.k==="rite"||pl.k==="masjid"?16:14):(o.p.home?12:(o.p.hotel||o.p.food)?16:11);
    if(o.to && pll(o.to)){ var dk=km(pll(o.p),pll(o.to)); if(dk>2){ fitLL([pll(o.p),pll(o.to)], 50); return; } }
    map.flyTo({center:[cur[1],cur[0]], zoom:z, speed:1.4});
  }
  function fitLL(arr, padn){ var b=new maplibregl.LngLatBounds(); arr.forEach(function(ll){ b.extend([ll[1],ll[0]]); }); map.fitBounds(b, {padding:padn||40, maxZoom:15, duration:900}); }
  function fitAll(instant){
    if(!map) return; var city=null;
    var cityOf=function(pp){ if(typeof pp==="object") return pp.c||null; return P(pp)?P(pp).c:null; };
    if(openIdx>=0) city=cityOf(stops[openIdx].p);
    var pts=stops.map(function(o){ return pll(o.p); }).filter(function(ll,i){ if(!ll) return false; if(!city) return true; return cityOf(stops[i].p)===city; });
    if(!pts.length) return; var b=new maplibregl.LngLatBounds(); pts.forEach(function(ll){ b.extend([ll[1],ll[0]]); }); map.fitBounds(b,{padding:30, maxZoom:14, duration:instant?0:800});
  }
  return open;
})();
