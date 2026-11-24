// 0.7.20 (owner): Time › Trip. The Umrah DIY banner on top, "Travel Anywhere" underneath, then the saved trips.
// Travel Anywhere: type any destination (one or several: "Tokyo, Osaka", "Dubai, Turkey", "Phu Quoc"), days and persons.
// AI (the person's own choice in Settings › AI › "Trip planner") drafts the route, then every day in batches.
// The app checks every place on the map (Photon / OpenStreetMap) (photos removed in 0.7.38), with its
// credit and a Google Maps link, converts every cost to the person's own currency (RM by default) and keeps the
// destination currency beside it. Flights, hotels, restaurants or any place can be added later by text, link or
// screenshot, and AI re-plans only what changes. Exports: PDF, WhatsApp text, calendar (.ics), Google Maps, KML, trip file.
(function(){
"use strict";
var H, S, EL=null, KEY="ihsan_trips", DRAFT="ihsan_trip_draft", FXK="ihsan_trip_fx";
var st={pg:"list", id:null, tab:"itin", day:0}, jobs={}, MAP=null, FX=null;

function L(a,b){ return H.L2x(a,b); }
function esc(s){ return H.esc(s==null?"":String(s)); }
function en(){ return H.en(); }
function rid(){ return Math.random().toString(36).slice(2,9); }
function str(v){ return v==null?"":String(v).trim(); }
function num(v){ var n=+String(v==null?"":v).replace(/[^0-9.\-]/g,""); return isFinite(n)?n:0; }
function pad(n){ return (n<10?"0":"")+n; }
function ymd(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function parseYmd(s){ var m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(s||""); return m?new Date(+m[1],+m[2]-1,+m[3]):null; }
function addD(d,n){ var x=new Date(d.getTime()); x.setDate(x.getDate()+n); return x; }
function langName(){ return S.lang==="en" ? (S.ulang==="ar"?"Arabic":"English") : "Bahasa Melayu (Malaysia)"; }
function langCode(){ return S.lang==="en" ? (S.ulang==="ar"?"ar":"en") : "ms"; }

// ---------- storage ----------
function trips(){ var a=H.load(KEY,[]); return Array.isArray(a)?a:[]; }
function getT(id){ return trips().filter(function(t){ return t.id===id; })[0]||null; }
function putT(t){ t.upd=Date.now(); var a=trips(), i=-1; a.forEach(function(x,k){ if(x.id===t.id) i=k; }); if(i<0) a.unshift(t); else a[i]=t; try{ H.save(KEY,a); }catch(e){ H.toast(L("Storan penuh","Storage is full")); } }
function delT(id){ H.save(KEY, trips().filter(function(t){ return t.id!==id; })); }

// ---------- currency ----------
var CURS=[["MYR","RM","Ringgit"],["SGD","S$","Singapore dollar"],["BND","B$","Brunei dollar"],["IDR","Rp","Rupiah"],["THB","฿","Baht"],["USD","US$","US dollar"],["EUR","€","Euro"],["GBP","£","Pound"],
  ["SAR","SAR","Riyal"],["AED","AED","Dirham"],["QAR","QAR","Qatari riyal"],["KWD","KWD","Kuwaiti dinar"],["TRY","TL","Turkish lira"],["EGP","E£","Egyptian pound"],["JPY","¥","Yen"],["KRW","₩","Won"],["CNY","CN¥","Yuan"],
  ["HKD","HK$","HK dollar"],["TWD","NT$","NT dollar"],["VND","₫","Dong"],["PHP","₱","Peso"],["INR","₹","Rupee"],["PKR","Rs","Pakistani rupee"],["BDT","৳","Taka"],["AUD","A$","Australian dollar"],["NZD","NZ$","NZ dollar"],["CHF","CHF","Swiss franc"],["CAD","C$","Canadian dollar"]];
function sym(c){ for(var i=0;i<CURS.length;i++) if(CURS[i][0]===c) return CURS[i][1]; return c||""; }
function home(){ return S.tripCur || "MYR"; }
function fmtN(v){ v=Math.round(v); return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function fmtM(v,c){ var s=sym(c); return (/^[A-Z]{3}$/.test(s)?s+" ":s)+fmtN(v); }
function fxLoad(){ if(!FX) FX=H.load(FXK,null); return FX; }
function fxGet(cb){ fxLoad(); var b=home(); if(FX && FX.base===b && Date.now()-FX.t<12*36e5){ cb&&cb(); return; }
  H.fetch("https://open.er-api.com/v6/latest/"+b, function(s, body){
    try{ var j=JSON.parse(body); if(j && j.rates && j.rates[b]){ FX={base:b, r:j.rates, t:Date.now(), src:"open.er-api.com"}; H.save(FXK,FX); cb&&cb(); return; } }catch(e){}
    H.fetch("https://api.frankfurter.app/latest?from="+b, function(s2, b2){ try{ var j2=JSON.parse(b2); if(j2 && j2.rates){ j2.rates[b]=1; FX={base:b, r:j2.rates, t:Date.now(), src:"Frankfurter (ECB)"}; H.save(FXK,FX); } }catch(e){} cb&&cb(); });
  }); }
// local units per 1 unit of the home currency: live rate, else the AI's estimate made for this home currency
function rateOf(t, cur){ if(!cur || cur===home()) return 1; fxLoad(); if(FX && FX.base===home() && FX.r && FX.r[cur]) return FX.r[cur];
  var c=(t.cities||[]).filter(function(x){ return x.cur===cur; })[0]; if(c && +c.rate>0 && t.rateBase===home()) return +c.rate; return 0; }
function toHome(t, v, cur){ var r=rateOf(t,cur); return r ? v/r : null; }
// "RM 120 · ¥3,960": the home currency first, the destination currency beside it
function money(t, v, cur, per){ if(!(v>0)) return ""; cur=cur||home(); var h=toHome(t, v, cur), out;
  if(cur===home()) out='<b>'+fmtM(v,cur)+'</b>'; else out=(h!=null?'<b>'+fmtM(h,home())+'</b> <span class="tpLc">'+fmtM(v,cur)+'</span>':'<b>'+fmtM(v,cur)+'</b>');
  return '<span class="tpMo">'+out+(per?' <span class="tpLc">'+per+'</span>':'')+'</span>'; }
function moneyTxt(t, v, cur){ if(!(v>0)) return ""; cur=cur||home(); var h=toHome(t,v,cur); return cur===home()?fmtM(v,cur):(h!=null?fmtM(h,home())+" ("+fmtM(v,cur)+")":fmtM(v,cur)); }

// ---------- AI ----------
function needAI(){ return new Promise(function(res, rej){ if(window.HalalAI){ res(); return; } var s=document.createElement("script"); s.src="halal/halal_ai.js"; s.onload=function(){ res(); }; s.onerror=function(){ rej(new Error(L("AI tidak dapat dimuatkan","Could not load the AI"))); }; document.head.appendChild(s); }); }
function pj(t){ t=String(t||"").replace(/```json|```/g,""); var a=t.indexOf("{"), b=t.lastIndexOf("}"); if(a<0||b<a) return null; var s=t.slice(a,b+1);
  try{ return JSON.parse(s); }catch(e){} try{ return JSON.parse(s.replace(/,\s*([}\]])/g,"$1").replace(/[\u201c\u201d]/g,'"')); }catch(e){} return null; }
var SYS="You are an expert travel planner for Muslim travellers (most are from Malaysia). You know real places, real hotels, real halal or Muslim-friendly restaurants, mosques, transport and typical prices. Reply ONLY with valid JSON, no markdown, no comments.\n\n";
function ai(prompt, maxTok, imgs){
  return needAI().then(function(){ var c=SYS+prompt; var content=(imgs&&imgs.length)?[{type:"text", text:c}].concat(imgs.map(function(u){ return {type:"image_url", image_url:{url:u}}; })):c;
    return window.HalalAI.complete([{role:"user", content:content}], maxTok||6000, function(a,b){ return L(a,b); }, "", "trip"); })
  .then(function(r){ var j=pj(r && r.text); if(!j) throw new Error(L("Jawapan AI tidak dapat dibaca. Cuba lagi.","The AI's reply could not be read. Try again.")); return j; }); }
function errTxt(e){ var m=(e && (e.message||e))||""; try{ if(window.HalalAI && HalalAI.errMsg) m=HalalAI.errMsg(e)||m; }catch(x){} return String(m).slice(0,300); }

var STYLE={b:["Jimat","Budget","budget: hostels or simple 2-3 star hotels, public transport, street food and food courts, free sights"],
  n:["Biasa","Normal","normal: good 3-4 star hotels in a central area, public transport with some taxis, casual restaurants"],
  c:["Selesa","Comfort","comfort: 4-5 star hotels in the best area, private transfers or taxis, good restaurants, skip-the-line tickets"]};
var PACE={r:["Santai","Relaxed","relaxed: 3-4 stops a day, rest time"],n:["Biasa","Normal","normal: 4-6 stops a day"],p:["Padat","Packed","packed: 6-8 stops a day"]};
var INTS=[["sejarah","🏛","Sejarah","History"],["islam","🕌","Warisan Islam","Islamic heritage"],["alam","🌄","Alam","Nature"],["makan","🍜","Makanan","Food"],["beli","🛍","Membeli-belah","Shopping"],["anak","🎢","Taman tema & anak","Theme parks & kids"],["pantai","🏖","Pantai","Beaches"],["seni","🎨","Seni & muzium","Art & museums"],["foto","📸","Tempat cantik","Photo spots"],["aktiviti","🧗","Aktiviti","Adventure"]];
var TYPE={sight:"🏛",food:"🍽",mosque:"🕌",shop:"🛍",nature:"🌄",activity:"🎟",transport:"🚆",hotel:"🏨",beach:"🏖",park:"🎢"};
var DCOL=["#e2574c","#2f8fd8","#2fa36b","#d98a1f","#8e5bd8","#d84f9a","#1fa6a6","#7a8a1f","#c0392b","#3b5bd8"];
function dcol(i){ return DCOL[i%DCOL.length]; }

function who(t){ var a=t.ad||1, k=t.kd||0; return a+" "+(a>1?"adults":"adult")+(k?", "+k+" "+(k>1?"children":"child"):""); }
function factsTxt(t){ var f=(t.facts||[]).filter(function(x){ return x.txt; }); return f.length ? f.map(function(x,i){ return (i+1)+". ["+x.k+"] "+x.txt; }).join("\n") : "none"; }
function baseBrief(t){
  return "Destination(s): "+t.dest+"\nDays: "+t.n+" (day 1 is the arrival day, day "+t.n+" is the departure day)\nTravellers: "+who(t)+
    "\nStyle: "+STYLE[t.style||"n"][2]+"\nPace: "+PACE[t.pace||"n"][2]+(t.start?"\nStart date: "+t.start:"\nStart date: not fixed yet")+
    "\nDeparting from: "+(t.from||"Kuala Lumpur (KUL)")+"\nReturning to: "+(t.to||t.from||"Kuala Lumpur (KUL)")+(t.ints&&t.ints.length?"\nInterests: "+t.ints.map(function(k){ var x=INTS.filter(function(i){ return i[0]===k; })[0]; return x?x[3]:k; }).join(", "):"")+
    (t.notes?"\nWishes / must include: "+t.notes:"")+
    "\nKnown bookings and facts (follow these exactly: plan around the flight times, use the booked hotels and places):\n"+factsTxt(t)+
    "\nHome currency: "+home()+"\nWrite every description in "+langName()+". Place names stay in their usual English or local name.";
}
function skelPrompt(t){
  return "Plan the route of this trip.\n"+baseBrief(t)+
  '\n\nReturn JSON:\n{"title":"short trip name","summary":"2 sentences","cities":[{"n":"city name","country":"country","cur":"ISO 4217 currency used there","rate":number of that currency per 1 '+home()+' (estimate),"tz":UTC offset in hours for the travel dates,"lat":number,"lon":number}],'+
  '"days":[{"d":1,"city":"one of the city names above","title":"theme of the day","stay":{"hotel":"a real hotel that suits the style","area":"neighbourhood","price":price per room per night in the local currency,"note":"why this area"}}],'+
  '"flights":[{"from":"IATA","to":"IATA","when":"e.g. day 1 morning","airline":"typical airlines or the booked flight","price":estimated price per person in '+home()+' (0 if already booked and unknown),"note":""}],'+
  '"daily":[{"city":"city name","food":food per person per day in local currency,"transport":local transport per person per day in local currency}],'+
  '"tips":{"visa":"for a Malaysian passport, say check the official source","halal":"how easy halal food is","mosque":"main mosques and prayer tips","money":"cash/cards","sim":"SIM / eSIM","plug":"plug type and voltage","weather":"for the season","transport":"getting around","emergency":"numbers","etiquette":"local etiquette"}}'+
  "\nRules: exactly "+t.n+" day objects. If the trip comes back to a city visited earlier, stay in a different hotel there (never the same hotel twice in separate stays). A sensible route order, realistic travel between cities (put a travel day where needed), nights spread sensibly. The last day's stay is empty if the person flies home. Include every flight needed (between countries too).";
}
function dayObjTxt(t, i){ var d=t.days[i]||{}; return "day "+(i+1)+": "+(d.city||"")+" · "+(d.title||"")+(d.stay&&d.stay.hotel?" · stay "+d.stay.hotel+" ("+(d.stay.area||"")+")":""); }
function stopSchema(){ return '{"t":"09:00","n":"exact real place name as on Google Maps","loc":"name in local script or empty","type":"sight|food|mosque|shop|nature|beach|park|activity|transport|hotel","note":"one short sentence: what to do or eat there","dur":minutes,"price":entry or meal price per person in the local currency (0 if free),"wiki":"English Wikipedia article title if one exists, else empty","halal":"for food only: certified|muslim-owned|options|check","addr":"street address with district and city","lat":latitude,"lon":longitude}'; }
var NEAR_RULE="Every stop of a day must be in or near that day's city (within about 50 km), except airports and travel between cities. The traveller's home city (where the home airport is) is NOT a destination: no sightseeing, meals or hotel there unless it is part of the destination; the last day only travels home. Never use the same attraction, mosque or restaurant twice in the trip (except the hotel). Each day is an efficient loop from the hotel: places close together, in a sensible order, no back-and-forth. The home airport appears only as the very first stop (departure) and the very last stop (return), never in between. Every meal, rest or prayer stop must be on the way between the stop before it and the stop after it, or within 5 km of them (never more than 10 km away). Use real places with their real street address and exact coordinates.";
function daysPrompt(t, from, to, extra){ var cityRule=""; for(var q=from;q<=to;q++){ var dc=destCityOf(t,q); if(dc && dc.n) cityRule+="\nDay "+(q+1)+": every stop in or near "+dc.n+(dc.country?", "+dc.country:""); }
  var over=t.days.map(function(d,i){ return dayObjTxt(t,i); }).join("\n");
  var keep=[]; for(var i=from;i<=to;i++){ var d=t.days[i]; if(d && d.stops) d.stops.forEach(function(s){ if(s.lock) keep.push("day "+(i+1)+": keep \""+s.n+"\" at "+s.t); }); }
  var used=[]; t.days.forEach(function(d,i){ if(i>=from && i<=to) return; realStops(d).forEach(function(s){ if(s.type!=="transport" && s.type!=="hotel" && !s.home) used.push(s.n); }); });
  return "Write the detailed plan for days "+(from+1)+" to "+(to+1)+" of this trip.\n"+baseBrief(t)+"\n\nRoute already agreed:\n"+over+
  "\n\nWhere each day happens (do not put places from any other city on these days):"+cityRule+
  (used.length?"\n\nAlready planned on other days. Do NOT repeat any of these (attractions, mosques or restaurants), choose different ones:\n"+used.join("; "):"")+
  (keep.length?"\n\nThese stops are locked by the person; keep them exactly:\n"+keep.join("\n"):"")+(extra?"\n\nSpecial request for these days: "+extra:"")+
  '\n\nFor each day give stops in time order from morning to night: sights grouped by area, lunch and dinner at real halal or Muslim-friendly restaurants (or a halal food street) with "halal" set, and a mosque near a prayer time when there is one. Day 1 starts at the home airport ('+(t.from||"Kuala Lumpur (KUL)")+'): the first stop is the departure there (type transport, with the flight time), then the arrival airport at the destination, then the way to the hotel. The last day ends with the flight home, and the very last stop is the arrival at '+(t.to||t.from||"the home airport")+'. Respect the pace. '+NEAR_RULE+'\n'+
  'Return JSON {"days":[{"d":day number,"move":"how to get around that day (pass, metro, taxi, car), with rough minutes between areas","stops":['+stopSchema()+']}]}';
}
function compact(t){ return JSON.stringify({title:t.title, cities:(t.cities||[]).map(function(c){ return {n:c.n, cur:c.cur}; }), flights:t.flights, days:t.days.map(function(d,i){ return {d:i+1, city:d.city, title:d.title, stay:d.stay, stops:(d.stops||[]).map(function(s){ var o={t:s.t, n:s.n, type:s.type}; if(s.lock) o.lock=1; return o; })}; })}); }
function patchPrompt(t, req){
  return "Here is the current trip:\n"+baseBrief(t)+"\n\nCurrent plan JSON:\n"+compact(t)+"\n\nThe person asks: "+req+
  '\n\n'+NEAR_RULE+' Change only what is needed (stops with "lock":1 stay). Return JSON {"note":"what you changed, 1-2 sentences in '+langName()+'","trip":{only the top-level fields you changed, among "title","summary","cities","flights","daily","tips", same shapes as before},"count":the total number of days if it changes,'+
  '"days":[a full object for every day that changes: {"d":number,"city":"","title":"","stay":{"hotel":"","area":"","price":per room per night local,"note":""},"move":"","stops":['+stopSchema()+']}]}';
}

// ---------- normalise AI output ----------
// 0.7.31 (owner): an overnight departure (e.g. 23:55) must stay the first stop, not move after the hotel
function byTime(a,b){ var W={1:-1, 3:1, 2:2}, ha=W[a.home]||0, hb=W[b.home]||0; if(ha!==hb) return ha-hb; if(ha===-1) return (a.t||"00").localeCompare(b.t||"00"); return (a.t||"99").localeCompare(b.t||"99"); }
function normStop(s, old){ s=s||{}; var n=str(s.n||s.name); if(!n) return null;
  var o={id:rid(), t:str(s.t||s.time).slice(0,5), n:n.slice(0,120), loc:str(s.loc).slice(0,80), type:TYPE[s.type]?s.type:"sight", note:str(s.note).slice(0,300), dur:Math.max(10,Math.min(600,num(s.dur)||60)), price:Math.max(0,num(s.price)), wiki:str(s.wiki).slice(0,120), halal:str(s.halal).slice(0,20), lock:s.lock?1:0, addr:str(s.addr).slice(0,160)};
  var la=num(s.lat), lo=num(s.lon); if(la && lo && Math.abs(la)<=90 && Math.abs(lo)<=180) o.ai=[la,lo];
  var m=(old||[]).filter(function(x){ return x.n.toLowerCase()===o.n.toLowerCase(); })[0];
  if(m){ o.id=m.id; o.img=m.img; o.lock=m.lock||o.lock; o.mine=m.mine; if(!(m.ok>=2 && (o.addr||o.ai))){ o.ll=m.ll; o.ok=m.ok; o.gaddr=m.gaddr; } }
  return o; }
function normStay(s){ s=s||{}; return {hotel:str(s.hotel).slice(0,120), area:str(s.area).slice(0,80), price:Math.max(0,num(s.price)), note:str(s.note).slice(0,200), mine:s.mine?1:0}; }
function normDay(d, old){ old=old||{}; var o={city:str(d.city)||old.city||"", title:str(d.title)||old.title||"", stay:d.stay?normStay(d.stay):(old.stay||normStay()), move:d.move!=null?str(d.move):(old.move||""), stops:old.stops||[]};
  if(old.stay && d.stay && old.stay.hotel===o.stay.hotel){ o.stay.ll=old.stay.ll; o.stay.mine=old.stay.mine; }
  if(Array.isArray(d.stops)){ o.stops=d.stops.map(function(s){ return normStop(s, old.stops); }).filter(Boolean); o.stops.sort(byTime); }
  return o; }
function normCities(a){ return (Array.isArray(a)?a:[]).map(function(c){ return {n:str(c.n||c.name), country:str(c.country), cur:str(c.cur).toUpperCase().slice(0,3), rate:num(c.rate), tz:isFinite(+c.tz)&&c.tz!==""?+c.tz:null, lat:num(c.lat), lon:num(c.lon)}; }).filter(function(c){ return c.n; }); }
function normDaily(a){ var out={}; if(Array.isArray(a)) a.forEach(function(x){ if(x && x.city) out[str(x.city).toLowerCase()]={food:num(x.food), transport:num(x.transport)}; }); else if(a && typeof a==="object") Object.keys(a).forEach(function(k){ out[k.toLowerCase()]={food:num(a[k].food), transport:num(a[k].transport)}; }); return out; }
function normFlights(a){ return (Array.isArray(a)?a:[]).map(function(f){ return {from:str(f.from).slice(0,40), to:str(f.to).slice(0,40), when:str(f.when).slice(0,60), airline:str(f.airline).slice(0,80), price:Math.max(0,num(f.price)), note:str(f.note).slice(0,200)}; }); }
function applySkel(t, j){
  if(j.title) t.title=str(j.title).slice(0,80); if(j.summary!=null) t.summary=str(j.summary).slice(0,500);
  if(j.cities){ var nc=normCities(j.cities); if(nc.length){ t.cities=nc; t.rateBase=home(); } }
  if(j.flights) t.flights=normFlights(j.flights); if(j.daily) t.daily=normDaily(j.daily); if(j.tips && typeof j.tips==="object") t.tips=j.tips;
}
function applyPatch(t, j){ applySkel(t, j.trip||{});
  var cnt=Math.round(num(j.count)); if(cnt>0 && cnt<=40 && cnt!==t.days.length){ while(t.days.length>cnt) t.days.pop(); while(t.days.length<cnt) t.days.push({city:(t.days[t.days.length-1]||{}).city||"", title:"", stay:normStay(), move:"", stops:[]}); t.n=cnt; }
  (Array.isArray(j.days)?j.days:[]).forEach(function(d){ var i=Math.round(num(d.d))-1; if(i<0 || i>=40) return; while(t.days.length<=i) t.days.push({city:"", title:"", stay:normStay(), move:"", stops:[]}); t.days[i]=normDay(d, t.days[i]); });
  t.n=t.days.length; }
function cityOf(t, name){ var n=str(name).toLowerCase(), c=(t.cities||[]).filter(function(x){ return x.n.toLowerCase()===n; })[0];
  if(!c) c=(t.cities||[]).filter(function(x){ var a=x.n.toLowerCase(); return n && (a.indexOf(n)>=0 || n.indexOf(a)>=0); })[0]; return c || (t.cities||[])[0] || {n:name||"", cur:home(), lat:0, lon:0}; }
function dayCur(t, i){ return cityOf(t, (t.days[i]||{}).city).cur || home(); }
function dateOf(t, i){ var d=parseYmd(t.start); return d?addD(d,i):null; }
function dateTxt(d){ if(!d) return ""; try{ return d.toLocaleDateString(langCode()==="ms"?"ms-MY":langCode(), {weekday:"short", day:"numeric", month:"short"}); }catch(e){ return ymd(d); } }

// ---------- checking places (Photon / OpenStreetMap) ----------
function km(a,b){ var R=6371, dLa=(b[0]-a[0])*Math.PI/180, dLo=(b[1]-a[1])*Math.PI/180, x=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*Math.sin(dLo/2)*Math.sin(dLo/2); return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)); }
function jget(u){ return new Promise(function(res){ H.fetch(u, function(s,b){ try{ res(s>=200&&s<300||s===0&&b?JSON.parse(b):null); }catch(e){ res(null); } }); }); }
var GEO=H_cache("ihsan_trip_geo3");
function H_cache(k){ var c=null; return {get:function(x){ if(!c){ try{ c=JSON.parse(localStorage.getItem(k)||"{}"); }catch(e){ c={}; } } return c[x]; }, set:function(x,v){ this.get(""); c[x]=v; var ks=Object.keys(c); if(ks.length>1500) ks.slice(0,300).forEach(function(z){ delete c[z]; }); try{ localStorage.setItem(k, JSON.stringify(c)); }catch(e){} }}; }
function photon(q, ll){ return jget("https://photon.komoot.io/api/?q="+encodeURIComponent(q)+"&limit=5"+(ll&&ll[0]?"&lat="+ll[0]+"&lon="+ll[1]:"")); }
// city-centre pins are spread a little (≈150 m) so they do not sit on top of each other
function jit(ll, id){ if(!ll) return ll; var h=0; String(id||"").split("").forEach(function(c){ h=(h*31+c.charCodeAt(0))|0; }); var a=(h%360)*Math.PI/180, r=0.0008+((h>>>9)%10)*0.0002; return [ll[0]+r*Math.sin(a), ll[1]+r*Math.cos(a)]; }
function addrOf(p){ p=p||{}; return [[p.housenumber,p.street].filter(Boolean).join(" "), p.district||p.locality, p.city||p.county, p.country].filter(Boolean).join(", "); }
function nameOk(want, got){ if(!got) return false; var w=String(want).toLowerCase(), g=String(got).toLowerCase(); if(g.indexOf(w)>=0 || w.indexOf(g)>=0) return true;
  var a=sig(want), b=sig(got); if(!a.length) return true; var n=a.filter(function(x){ return b.indexOf(x)>=0; }).length; return n>=Math.min(2,a.length) || (n>=1 && a.length<=3); }
// 0.7.24 (owner): every place must sit on its real spot. Photon results only count when the NAME matches (no random neighbour);
// next the street address the AI gave; last the AI's own coordinates, shown as "approximate". Result {ll, a (address), approx}.
function findPlace(name, city, cll, far, aiLL, addr){ var key=(name+"|"+city.n).toLowerCase(), c=GEO.get(key); if(c!==undefined) return Promise.resolve(c);
  var bias=aiLL||cll, inCity=function(p){ return !cll || !cll[0] || km(cll,p)<=(far||150); };
  var pick=function(j, byName){ var best=null; ((j&&j.features)||[]).forEach(function(f){ if(best) return; var g=f.geometry&&f.geometry.coordinates, pr=f.properties||{}; if(!g) return; var p=[g[1],g[0]];
      if(!inCity(p) || (byName && !nameOk(name, pr.name))) return; best={ll:p, a:addrOf(pr)}; }); return best; };
  return photon(name+(city.n?", "+city.n:""), bias).then(function(j){ return pick(j,1) || photon(name, bias).then(function(j2){ return pick(j2,1) || (addr ? photon(addr, bias).then(function(j3){ return pick(j3,0); }) : null); }); })
  .then(function(r){ if(!r && aiLL && inCity(aiLL)) r={ll:aiLL, a:addr||"", approx:1}; if(r) return r;
    // 0.7.25 (owner): never leave a place off the map: try the address without its first part (the street, then the district), else the city centre
    var parts=String(addr||"").split(",").map(function(x){ return x.trim(); }).filter(Boolean), i=1;
    var nx=function(){ if(i>=parts.length-1 || i>3) return null; var q=parts.slice(i++).join(", "); return photon(q, bias).then(function(j){ var b=pick(j,0); if(b){ b.approx=1; b.a=addr; return b; } return nx(); }); };
    return Promise.resolve(nx()).then(function(r2){ if(r2) return r2; if(cll && cll[0]) return {ll:cll.slice(), a:city.n, approx:2}; return null; }); })
  .then(function(r){ if(r && r.approx!==2) GEO.set(key, r); return r; }); }
function sig(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").split(/[^a-z0-9]+/).filter(function(w){ return w.length>2 && ["the","and","of","de","la","le","museum","park","temple","mosque","street","market","station","restaurant"].indexOf(w)<0; }); }
// one queue per trip: every place gets its map pin; redraws as it goes
function resolve(t){ if(jobs[t.id+"r"]){ jobs[t.id+"r"]=2; return; } var todo=[];
  if(t.geoV!==2 && t.geoV!==3){ t.days.forEach(function(d){ (d.stops||[]).forEach(function(s){ delete s.ok; delete s.ll; }); if(d.stay) delete d.stay.ll; }); t.geoV=3; putT(t); }   // 0.7.24: re-check older trips with the stricter name match
  else if(t.geoV===2){ t.days.forEach(function(d){ (d.stops||[]).forEach(function(s){ if(!s.ll){ delete s.ok; } }); if(d.stay && !d.stay.ll) delete d.stay.ll; }); t.geoV=3; putT(t); }   // 0.7.25: pin the places that had no pin
  t.days.forEach(function(d){ var c=cityOf(t, d.city); (d.stops||[]).forEach(function(s){ if(s.ok===undefined || s.img===undefined) todo.push([s,c]); }); if(d.stay && d.stay.hotel && d.stay.ll===undefined) todo.push([d.stay,c,1]); });
  if(!todo.length) return; jobs[t.id+"r"]=1; var i=0, live=0, dirty=0, tick=0;
  var flush=function(){ var cur=getT(t.id); if(!cur) return; var m={}; t.days.forEach(function(d,di){ (d.stops||[]).forEach(function(s){ m[s.id]=s; }); });
    cur.days.forEach(function(d,di){ (d.stops||[]).forEach(function(s){ var r=m[s.id]; if(r && (s.home===1 || s.home===2)){ s.img=null; if(s.ok===undefined) s.ok=r.ok; } else if(r){ s.ll=r.ll; s.ok=r.ok; s.img=r.img; s.gaddr=r.gaddr; } }); var od=t.days[di]; if(od && d.stay && od.stay && d.stay.hotel===od.stay.hotel){ d.stay.ll=od.stay.ll; d.stay.gaddr=od.stay.gaddr; } }); cur.geoV=3;
    putT(cur); t=cur; if(st.pg==="view" && st.id===t.id) draw(); };
  var one=function(){ if(i>=todo.length){ if(!live){ var again=jobs[t.id+"r"]===2; delete jobs[t.id+"r"]; flush(); if(again){ var c2=getT(t.id); if(c2) resolve(c2); } } return; } var x=todo[i++], s=x[0], c=x[1], cll=c.lat?[c.lat,c.lon]:null; live++;
    var p=x[2] ? findPlace(s.hotel, c, cll, 80, null, (s.area?s.area+", ":"")+c.n).then(function(r){ s.ll=r?r.ll:null; s.gaddr=r&&r.a||""; })
      : (s.ok!==undefined ? Promise.resolve() : findPlace(s.n, c, cll, s.type==="transport"?400:150, s.ai, s.addr).then(function(r){ if(!r && s.loc) return findPlace(s.loc, c, cll, 150); return r; }).then(function(r){ s.ll=r?r.ll:null; s.ok=r?(r.approx===2?3:r.approx?2:1):0; if(s.ok===3) s.ll=jit(s.ll, s.id); s.gaddr=r&&r.a||""; }))
        .then(function(){ if(s.img===undefined) s.img=null; });   // 0.7.38 (owner): no photos anywhere
    p.catch(function(){}).then(function(){ live--; dirty++; if(++tick%4===0) flush(); one(); }); };
  for(var k=0;k<3;k++) one();
}

// ---------- build: route first, then the days in batches of three ----------
function build(t, fromDay){
  var id=t.id; jobs[id]={msg:L("Merancang laluan…","Planning the route…"), pct:5}; draw();
  var step=function(){ var cur=getT(id); if(!cur){ delete jobs[id]; return; } t=cur;
    var miss=[]; t.days.forEach(function(d,i){ if(!realStops(d).length) miss.push(i); });
    if(!miss.length){ t.status="ok"; putT(t); delete jobs[id]; fxGet(function(){ draw(); }); resolve(t); draw(); return; }
    var a=miss[0], b=a; while(b+1<t.days.length && miss.indexOf(b+1)>=0 && b-a<2) b++;
    jobs[id]={msg:L("Menulis hari "+(a+1)+(b>a?"–"+(b+1):"")+" daripada "+t.n+"…","Writing day "+(a+1)+(b>a?"–"+(b+1):"")+" of "+t.n+"…"), pct:10+Math.round(85*a/t.n)}; draw();
    ai(daysPrompt(t, a, b), 9000).then(function(j){ var cur=getT(id)||t; (j.days||[]).forEach(function(d){ var i=Math.round(num(d.d))-1; if(i<a||i>b||!cur.days[i]) return; var nd=normDay(d, cur.days[i]); nd.city=cur.days[i].city; nd.title=cur.days[i].title; nd.stay=cur.days[i].stay; cur.days[i]=nd; });
      for(var i=a;i<=b;i++) if(!cur.days[i].stops.length) cur.days[i].stops=[{id:rid(), t:"", n:cur.days[i].city||t.dest, type:"sight", note:L("Masa bebas","Free time"), dur:120, price:0, wiki:"", halal:"", ph:1}];
      putT(cur); resolve(cur); step(); })
    .catch(function(e){ var cur=getT(id); if(cur){ cur.status="part"; putT(cur); } jobs[id]={err:errTxt(e)}; draw(); }); };
  if(fromDay!=null || (t.days && t.days.length && t.cities && t.cities.length)){ step(); return; }
  ai(skelPrompt(t), 6000).then(function(j){ var cur=getT(id)||t; applySkel(cur, j);
    var ds=Array.isArray(j.days)?j.days:[]; cur.days=[]; for(var i=0;i<cur.n;i++){ var d=ds[i]||ds[ds.length-1]||{}; cur.days.push({city:str(d.city)||((cur.cities||[])[0]||{}).n||cur.dest, title:str(d.title), stay:i===cur.n-1&&!(d.stay&&d.stay.hotel)?normStay():normStay(d.stay), move:"", stops:[]}); }
    try{ apLoad(function(){}); var hc=(cur.cities||[]).filter(function(c){ return c.lat && nearHome(cur,[c.lat,c.lon]); }).map(function(c){ return c.n; });
      if(hc.length && hc.length<(cur.cities||[]).length){ cur.cities=cur.cities.filter(function(c){ return hc.indexOf(c.n)<0; }); cur.days.forEach(function(d,i){ if(hc.indexOf(d.city)>=0){ for(var k=i-1;k>=0;k--) if(hc.indexOf(cur.days[k].city)<0){ d.city=cur.days[k].city; break; } if(hc.indexOf(d.city)>=0) d.city=cur.cities[0].n; } }); } }catch(e){}
    cur.status="part"; putT(cur); fxGet(); step(); })
  .catch(function(e){ jobs[id]={err:errTxt(e)}; draw(); });
}
// 0.7.27 (owner): AI sometimes stops halfway. "🔁 Complete missing info" fills empty days, days whose stops lack
// address / notes, missing tips or daily costs, then pins every place that has no pin.
function realStops(d){ return (d.stops||[]).filter(function(s){ return !s.ph && !(s.dur===120 && !s.price && (s.note==="Masa bebas"||s.note==="Free time") && s.n===d.city); }); }
// places used on an earlier day again (not hotels, transport or the home airport)
function repeats(t){ var seen={}, out={}; (t.days||[]).forEach(function(d,i){ realStops(d).forEach(function(s){ if(s.type==="transport" || s.type==="hotel" || s.home) return; var k=sig(s.n).join(" ")||s.n.toLowerCase(); if(seen[k]!=null && seen[k]!==i){ (out[i]=out[i]||[]).push(s.n+" (day "+(seen[k]+1)+")"); } else if(seen[k]==null) seen[k]=i; }); }); return out; }
function wrongs(t){ var out={}; (t.days||[]).forEach(function(d,i){ (d.stops||[]).forEach(function(s){ var w=wrongPlace(t,i,s); if(w) (out[i]=out[i]||[]).push(s.n+" (not in "+w+")"); }); }); return out; }
function gapsOf(t){ var g={empty:[], thin:[], top:[], unp:0, rep:repeats(t), bad:wrongs(t)};
  (t.days||[]).forEach(function(d,i){ var r=realStops(d); (d.stops||[]).forEach(function(s){ if(!s.ll) g.unp++; });
    if(!r.length) g.empty.push(i); else if(r.filter(function(s){ return !s.addr && !s.ai; }).length*2>r.length || r.filter(function(s){ return !s.note; }).length*2>r.length) g.thin.push(i); });
  if(!t.tips || !Object.keys(t.tips).length) g.top.push("tips"); if(!t.daily || !Object.keys(t.daily).length) g.top.push("daily"); if(!(t.cities||[]).length) g.top.push("cities");
  g.n=g.empty.length+g.thin.length+g.top.length+Object.keys(g.rep).length+Object.keys(g.bad).length; return g; }
function completeTrip(t){ if(busyT(t)) return; var id=t.id, tried={};
  var days=function(){ var c=getT(id); if(!c){ delete jobs[id]; return; } var g=gapsOf(c), list=g.empty.concat(g.thin, Object.keys(g.rep).map(Number), Object.keys(g.bad).map(Number)).filter(function(i){ return !tried[i]; }).sort(function(a,b){ return a-b; });
    if(!list.length){ delete jobs[id]; c.status="ok"; putT(c); resolve(c); fxGet(); draw(); H.toast("✅ "+L("Trip dilengkapkan","Trip completed")); return; }
    var a=list[0], b=a; while(b+1<c.days.length && list.indexOf(b+1)>=0 && b-a<2) b++; for(var k=a;k<=b;k++) tried[k]=1;
    var empty=g.empty.indexOf(a)>=0; jobs[id]={msg:L("Melengkapkan hari "+(a+1)+(b>a?"–"+(b+1):"")+"…","Completing day "+(a+1)+(b>a?"–"+(b+1):"")+"…"), pct:20+Math.round(75*a/c.days.length)}; draw();
    var rp=[], bd=[]; for(var q=a;q<=b;q++){ if(g.rep[q]) rp=rp.concat(g.rep[q]); if(g.bad[q]) bd=bd.concat(g.bad[q]); }
    ai(daysPrompt(c, a, b, empty?"":(bd.length?"Replace these stops, which are in the wrong city, with real places in that day's city: "+bd.join("; ")+". ":"")+(rp.length?"Replace these stops, which repeat places from other days, with different nearby places that fit the same time: "+rp.join("; ")+". ":"")+"Keep the other stops in the same order and times. Fill in every missing detail of each stop: real street address, exact coordinates, note, price, halal status and the Wikipedia title."), 9000)
    .then(function(j){ var cur=getT(id); if(!cur) return; (j.days||[]).forEach(function(d){ var i=Math.round(num(d.d))-1; if(i<a||i>b||!cur.days[i]) return; var nd=normDay(d, cur.days[i]); if(!nd.stops.length) return; nd.city=cur.days[i].city; nd.title=cur.days[i].title; nd.stay=cur.days[i].stay; cur.days[i]=nd; }); putT(cur); days(); })
    .catch(function(e){ jobs[id]={err:errTxt(e), soft:1}; draw(); }); };
  var g0=gapsOf(t);
  if(g0.top.length){ patch(t, "Some parts of this trip are missing: "+g0.top.join(", ")+". Fill them in (return them in \"trip\"). Do not change the days.", function(ok){ if(ok) days(); }); }
  else days(); }
function patch(t, req, done){ var id=t.id; jobs[id]={msg:L("AI sedang mengubah trip…","AI is updating the trip…"), pct:40}; draw();
  ai(patchPrompt(t, req), 9000).then(function(j){ var cur=getT(id)||t; applyPatch(cur, j); cur.log=(cur.log||[]).concat([{t:Date.now(), q:req.slice(0,300), a:str(j.note).slice(0,300)}]).slice(-20); putT(cur); delete jobs[id];
    if(j.note) H.toast(str(j.note).slice(0,140)); resolve(cur); fxGet(function(){ draw(); }); draw(); done&&done(true); })
  .catch(function(e){ jobs[id]={err:errTxt(e), soft:1}; draw(); done&&done(false); }); }

// ---------- photos and links from the person (any flight, hotel, restaurant or place) ----------
function shrink(url, max){ return new Promise(function(res){ var im=new Image(); im.onload=function(){ var k=Math.min(1,(max||1600)/Math.max(im.naturalWidth,im.naturalHeight)), c=document.createElement("canvas"); c.width=Math.round(im.naturalWidth*k); c.height=Math.round(im.naturalHeight*k); c.getContext("2d").drawImage(im,0,0,c.width,c.height); res(c.toDataURL("image/jpeg",0.85)); }; im.onerror=function(){ res(url); }; im.src=url; }); }
function pickImg(cb){ var N=H.N;
  if(window.Native && N && N.pickImage){ var h=function(r){ H.off("image",h); if(!r || r.cancel) return; if(r.error || !r.data){ H.toast(L("Gambar tidak dapat dibuka","The image could not be opened")); return; } cb(r.data); }; H.on("image",h); N.pickImage("gallery"); return; }
  var inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.onchange=function(){ var f=inp.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ cb(r.result); }; r.readAsDataURL(f); }; inp.click(); }
function readShot(img){ return shrink(img, 1600).then(function(u){ return ai('Read this screenshot of a travel booking or place (a flight, hotel, restaurant, activity, ticket, map pin or anything else). Return JSON {"kind":"flight|hotel|place|other","text":"every useful fact in one compact paragraph: names, address, city, dates, times, flight numbers, airports, terminals, room type, check-in and check-out, prices with currency, booking reference"}', 1500, [u]); }); }
function readLink(url){ return new Promise(function(res){ var g=/\/maps\/place\/([^/@?]+)/.exec(url), gname=g?decodeURIComponent(g[1].replace(/\+/g," ")):"";
  H.fetch(url, function(s, body){ var b=String(body||""), m=function(re){ var x=re.exec(b); return x?x[1].replace(/&amp;/g,"&").replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim().slice(0,300):""; };
    var tt=m(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)||m(/<title[^>]*>([^<]+)/i), ds=m(/<meta[^>]+(?:property=["']og:description|name=["']description)["'][^>]+content=["']([^"']+)/i);
    res("Link: "+url+(gname?" · Google Maps place: "+gname:"")+(tt?" · Title: "+tt:"")+(ds?" · "+ds:"")); }); }); }
// the sheet that adds a fact: typed text, a link or a screenshot; AI reads screenshots straight away
// 0.7.24 (owner): one tap. 📷 picks a screenshot, AI reads it and re-plans straight away; typed text or links: one "Add & re-plan"
function factSheet(kind, title, hint, onAdd, onBusy){
  var bz=onBusy||function(m){ if(st.pg==="view" && st.id){ if(m) jobs[st.id]={msg:m, pct:15}; else delete jobs[st.id]; draw(); } else if(m) H.toast(m); };
  var ov=H.showSheet(title, '<div class="mut small">'+hint+'</div><textarea id="tfT" class="rin" rows="3" style="margin-top:8px" placeholder="'+esc(L("Taip butiran atau tampal pautan (pilihan)","Type details or paste a link (optional)"))+'"></textarea><div id="tfM" class="mut small" style="margin-top:6px"></div>'+
    '<div class="tpTwo"><button class="btn alt g3d" id="tfS">📷 '+L("Tangkapan skrin","Screenshot")+'</button><button class="btn gold g3d" id="tfGo">✨ '+L("Tambah & rancang semula","Add & re-plan")+'</button></div>');
  var ta=ov.querySelector("#tfT"), msg=ov.querySelector("#tfM");
  ov.querySelector("#tfS").onclick=function(){ var typed=str(ta.value); pickImg(function(d){ H.closeOverlay(); bz(L("AI sedang membaca gambar…","AI is reading the picture…"));
    readShot(d).then(function(j){ bz(null); var tx=str(j.text); if(!tx){ H.toast(L("Tiada butiran dalam gambar","No details found in the picture")); return; } onAdd({k:j.kind||kind, txt:((typed?typed+"\n":"")+tx).slice(0,1500), at:Date.now(), shot:1}); })
    .catch(function(e){ bz(null); H.toast("⚠ "+errTxt(e)); }); }); };
  ov.querySelector("#tfGo").onclick=function(){ var v=str(ta.value); if(!v){ H.toast(L("Taip butiran, tampal pautan, atau pilih tangkapan skrin","Type details, paste a link, or pick a screenshot")); return; }
    var urls=v.match(/https?:\/\/\S+/g)||[], go=function(txt){ H.closeOverlay(); onAdd({k:kind, txt:txt.slice(0,1500), at:Date.now()}); };
    if(urls.length){ msg.textContent="⏳ "+L("Membuka pautan…","Opening the link…"); Promise.all(urls.slice(0,3).map(readLink)).then(function(r){ go(v.replace(/https?:\/\/\S+/g,"").trim()+"\n"+r.join("\n")); }); }
    else go(v); };
}

// ---------- page ----------
function view(el, h){ H=h; S=h.S; EL=el; fxLoad(); draw(); }
function back(){ if(!EL || !document.body.contains(EL)) return false; if(st.pg!=="list"){ killMap(); st.pg="list"; st.id=null; draw(); try{ EL.scrollIntoView(); }catch(e){} return true; } return false; }
function barsHide(on){ var a=document.getElementById("app"); if(a && a.classList.contains("tpFull")!==!!on){ a.classList.toggle("tpFull", !!on); try{ if(H.dockFix) H.dockFix(); }catch(e){} } setTimeout(function(){ try{ if(window.ibArr) window.ibArr(); }catch(e){} }, 80); }
function draw(){ if(!EL || !document.body.contains(EL)) return; barsHide(st.pg==="view"); if(st.pg==="new"){ killMap(); drawNew(); } else if(st.pg==="view" && getT(st.id)){ drawTrip(); return; } else { st.pg="list"; drawList(); } try{ if(H.dockFix) setTimeout(H.dockFix, 0); }catch(e){} }
function hero(){ return '<button class="bnHero bn-trip" data-tp="new"><span class="bnSc"></span><span class="bnI">✈️</span><span class="shTxt"><b>Travel Anywhere</b><small>'+
  L("Ke mana saja: satu atau beberapa negara. AI rancang hari demi hari dengan peta, bajet dan waktu solat","Anywhere: one or several countries. AI plans day by day with a map, budget and prayer times")+'</small></span><span class="shGo">›</span></button>'; }
function drawList(){ killMap(); var a=trips();
  var h='<div class="tpPg">'+(H.umrahHero?H.umrahHero():"")+hero();
  h+='<div class="tpHd"><b>🧳 '+L("Trip saya","My trips")+'</b><span><button class="chip" data-tp="cur">💱 '+esc(sym(home()))+'</button> <button class="chip" data-tp="imp">📥 '+L("Import","Import")+'</button></span></div>';
  if(!a.length) h+='<div class="card mut small">'+L("Belum ada trip. Ketik Travel Anywhere, taip destinasi (contoh: Tokyo dan Osaka, Seoul, Phu Quoc, Dubai dan Turki), bilangan hari dan orang.","No trips yet. Tap Travel Anywhere, type a destination (for example Tokyo and Osaka, Seoul, Phu Quoc, Dubai and Turkey), the days and the people.")+'</div>';
  a.forEach(function(t){ var d=parseYmd(t.start);
    h+='<button class="tpCard" data-tp-open="'+t.id+'"><span class="tpTh">✈️</span><span class="tpCt"><b>'+esc(t.title||t.dest)+'</b><small>'+esc(t.dest)+' · '+t.n+' '+L("hari","days")+' · '+((t.ad||0)+(t.kd||0))+' '+L("orang","people")+(d?' · '+esc(dateTxt(d)):'')+'</small>'+
      (jobs[t.id]&&!jobs[t.id].err?'<small class="tpBusy">⏳ '+esc(jobs[t.id].msg)+'</small>':t.status!=="ok"?'<small class="tpWarn">⚠ '+L("Belum siap","Not finished")+'</small>':'')+'</span><span class="shGo">›</span></button>'; });
  h+='</div>'; EL.innerHTML=h;
  EL.onclick=function(e){ var b=e.target.closest("[data-tp],[data-tp-open],[data-umrah]"); if(!b) return;
    if(b.hasAttribute("data-umrah")){ e.stopPropagation(); e.preventDefault(); if(H.openUmrah) H.openUmrah(); return; }
    if(b.hasAttribute("data-tp-open")){ st.pg="view"; st.id=b.getAttribute("data-tp-open"); st.tab="itin"; st.day=0; draw(); EL.scrollIntoView(); return; }
    var k=b.getAttribute("data-tp"); if(k==="new"){ st.pg="new"; draw(); EL.scrollIntoView(); } else if(k==="cur") curSheet(); else if(k==="imp") importTrip(); };
}
function curSheet(after){ var ov=H.showSheet("💱 "+L("Mata wang anda","Your currency"), '<div class="mut small">'+L("Semua kos ditunjukkan dalam mata wang ini, dengan mata wang destinasi di sebelahnya.","Every cost is shown in this currency, with the destination currency beside it.")+'</div><div class="tpCurs">'+
  CURS.map(function(c){ return '<button class="chip'+(c[0]===home()?' on':'')+'" data-c="'+c[0]+'">'+esc(c[1])+' · '+esc(c[2])+'</button>'; }).join("")+'</div>');
  ov.querySelectorAll("[data-c]").forEach(function(b){ b.onclick=function(){ S.tripCur=b.getAttribute("data-c"); H.saveS(); H.closeOverlay(); FX=null; fxGet(function(){ draw(); }); draw(); after&&after(); }; }); }

// ---------- the one-box form ----------
// 0.7.24 (owner): 🎲 picks a random Muslim-heritage destination anywhere in the world
var ISL=["Marrakesh, Fes & Chefchaouen, Morocco","Casablanca & Rabat, Morocco","Istanbul & Cappadocia, Turkey","Bursa & Konya, Turkey","Sarajevo & Mostar, Bosnia","Samarkand & Bukhara, Uzbekistan","Tashkent & Khiva, Uzbekistan","Cairo & Alexandria, Egypt",
  "Amman, Petra & Wadi Rum, Jordan","Jerusalem (Al-Aqsa) & Hebron","Dubai & Abu Dhabi, UAE","Muscat & Nizwa, Oman","Doha, Qatar","Manama, Bahrain","Kuwait City, Kuwait","Isfahan & Shiraz, Iran","Baku, Azerbaijan","Almaty & Turkistan, Kazakhstan",
  "Bishkek & Osh, Kyrgyzstan","Xi'an Muslim Quarter, China","Kashgar & Urumqi, Xinjiang, China","Lanzhou & Linxia, China","Yinchuan, Ningxia, China","Guangzhou (Huaisheng Mosque), China","Granada & Cordoba, Spain","Seville & Toledo, Spain","Palermo, Sicily, Italy",
  "Tunis & Kairouan, Tunisia","Algiers & Constantine, Algeria","Zanzibar, Tanzania","Lamu & Mombasa, Kenya","Harar, Ethiopia","Dakar & Touba, Senegal","Timbuktu & Djenne, Mali","Kazan, Tatarstan, Russia","Grozny, Chechnya","Lahore & Islamabad, Pakistan","Hunza Valley, Pakistan",
  "Delhi, Agra & Hyderabad, India","Kashmir (Srinagar), India","Dhaka & Bagerhat, Bangladesh","Maldives","Banda Aceh, Indonesia","Yogyakarta, Indonesia","Lombok, Indonesia","Bandar Seri Begawan, Brunei","Marawi & Zamboanga, Philippines","Pattani & Satun, Thailand",
  "Chau Doc (Cham Muslims), Vietnam","Madinah & Makkah, Saudi Arabia","AlUla & Riyadh, Saudi Arabia","Jeddah & Taif, Saudi Arabia","Tbilisi & Batumi, Georgia","Skopje & Ohrid, North Macedonia","Tirana & Berat, Albania","Pristina & Prizren, Kosovo","Cape Town (Bo-Kaap), South Africa",
  "Nouakchott & Chinguetti, Mauritania","Beirut & Tripoli, Lebanon","Damascus & Aleppo, Syria","Mostar & Jajce, Bosnia","Mardin & Sanliurfa, Turkey","Trabzon & Uzungol, Turkey","Kota Bharu & Kuala Terengganu, Malaysia","Melaka, Malaysia"];
function blankForm(){ return {dest:"", n:5, end:"", ad:2, kd:0, style:"n", start:"", from:S.tripFrom||"Kuala Lumpur (KUL)", pace:"n", ints:[], notes:"", facts:[]}; }
// 0.7.28 (owner): airport field with a worldwide list (trip/airports.js, ~7,700 airports with an IATA code): type a city, airport or code, pick from the list
var AP=null, CNC={};
function apLoad(cb){ if(AP){ cb(); return; } if(apLoad.q){ apLoad.q.push(cb); return; } apLoad.q=[cb]; var sc=document.createElement("script"); sc.src="trip/airports.js";
  sc.onload=sc.onerror=function(){ if(window.TRIP_AIRPORTS) AP=String(TRIP_AIRPORTS).split("\n").map(function(l){ return l.split("|"); }); var q=apLoad.q; apLoad.q=null; if(AP) q.forEach(function(f){ f(); }); }; document.head.appendChild(sc); }
function cname(cc){ if(CNC[cc]) return CNC[cc]; var n=cc; try{ n=new Intl.DisplayNames([langCode()==="ms"?"ms":"en"],{type:"region"}).of(cc)||cc; }catch(e){} return (CNC[cc]=n); }
function apFind(q){ q=String(q||"").replace(/\([A-Z]{3}\)\s*$/,"").trim().toLowerCase(); if(!AP || q.length<2) return []; var up=q.toUpperCase(), ex=[], a=[], b=[], big=function(r){ return /intl|international/i.test(r[1])?0:1; };
  AP.forEach(function(r){ if(r[0]===up) ex.push(r); else if(r[2].toLowerCase().indexOf(q)===0 || r[1].toLowerCase().indexOf(q)===0) a.push(r); else if((r[2]+" "+r[1]).toLowerCase().indexOf(q)>=0 || cname(r[3]).toLowerCase().indexOf(q)===0) b.push(r); });
  a.sort(function(x,y){ return big(x)-big(y); }); b.sort(function(x,y){ return big(x)-big(y); }); return ex.concat(a,b).slice(0,40); }
function apAttach(inp, onPick){ if(!inp) return; var box=inp.parentNode.querySelector(".tpAp"), list=[];
  var show=function(){ apLoad(function(){ list=apFind(inp.value); if(!list.length || document.activeElement!==inp){ box.classList.add("hidden"); return; }
    box.innerHTML=list.map(function(r,n){ return '<button type="button" data-api="'+n+'"><b>'+esc(r[0])+'</b><span>'+esc(r[2]||r[1])+(r[2]&&r[1].indexOf(r[2])<0?' · '+esc(r[1]):r[2]?' · '+esc(r[1]):'')+'<small>'+esc(cname(r[3]))+'</small></span></button>'; }).join(""); box.classList.remove("hidden"); }); };
  inp.addEventListener("input", show); inp.addEventListener("focus", function(){ apLoad(function(){}); show(); });
  inp.addEventListener("blur", function(){ setTimeout(function(){ box.classList.add("hidden"); }, 200); });
  box.addEventListener("pointerdown", function(e){ var b=e.target.closest("[data-api]"); if(!b) return; e.preventDefault(); var r=list[+b.getAttribute("data-api")]; inp.value=(r[2]||r[1])+" ("+r[0]+")"; box.classList.add("hidden"); inp.blur(); onPick&&onPick(r); }); }
function spanDays(a,b){ var x=parseYmd(a), y=parseYmd(b); return x&&y ? Math.round((y-x)/864e5)+1 : 0; }
function today0(){ var d=new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
// From / To on one tap calendar (no scroll wheels): tap the first day, then the last day; ‹ › change the month
function rangeCal(box, R, onCh){ var pick=R.end?"from":"to", cm=parseYmd(R.start)||today0(); cm=new Date(cm.getFullYear(), cm.getMonth(), 1);
  var MS=langCode()==="ms"?["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"]:["January","February","March","April","May","June","July","August","September","October","November","December"];
  var WD=langCode()==="ms"?["Is","Se","Ra","Kh","Ju","Sa","Ah"]:["Mo","Tu","We","Th","Fr","Sa","Su"];
  var paint=function(){ var a=parseYmd(R.start), b=parseYmd(R.end), n=a&&b?spanDays(R.start,R.end):0, t0=today0();
    var h='<div class="tpDates"><button type="button" class="'+(pick==="from"?'on':'')+'" data-pk="from"><small>🛫 '+L("Pergi","From")+'</small><b>'+(a?esc(dateTxt(a)):'–')+'</b></button><button type="button" class="'+(pick==="to"?'on':'')+'" data-pk="to"><small>🛬 '+L("Pulang","To")+'</small><b>'+(b?esc(dateTxt(b)):L("Pilih","Pick"))+'</b></button></div>';
    h+='<div class="tpCal"><div class="tpCalH"><button type="button" data-cm="-1">‹</button><b>'+MS[cm.getMonth()]+' '+cm.getFullYear()+'</b><button type="button" data-cm="1">›</button></div><div class="tpCalG">'+WD.map(function(w){ return '<i>'+w+'</i>'; }).join("");
    var lead=(cm.getDay()+6)%7, dim=new Date(cm.getFullYear(), cm.getMonth()+1, 0).getDate(); for(var k=0;k<lead;k++) h+='<span></span>';
    for(var d=1;d<=dim;d++){ var x=new Date(cm.getFullYear(), cm.getMonth(), d), c=x<t0?"off":"", y=ymd(x);
      if(a && y===R.start) c+=" s"; if(b && y===R.end) c+=" e"; if(a && b && x>a && x<b) c+=" in"; if(y===ymd(t0)) c+=" td";
      h+='<button type="button" class="'+c.trim()+'" data-d="'+y+'"'+(x<t0?' disabled':'')+'>'+d+'</button>'; }
    h+='</div><div class="tpCalF">'+(n?'🗓 '+n+' '+L("hari","days")+' · '+(n-1)+' '+L("malam","nights"):L("Ketik tarikh pulang","Tap the return date"))+'</div></div>';
    box.innerHTML=h; };
  box.onclick=function(e){ var b=e.target.closest("button"); if(!b || b.disabled) return; e.stopPropagation(); var v;
    if((v=b.getAttribute("data-cm"))){ cm=new Date(cm.getFullYear(), cm.getMonth()+(+v), 1); paint(); return; }
    if((v=b.getAttribute("data-pk"))){ pick=v; var j=parseYmd(v==="from"?R.start:R.end); if(j) cm=new Date(j.getFullYear(), j.getMonth(), 1); paint(); return; }
    if((v=b.getAttribute("data-d"))){
      if(pick==="from" || !R.start || v<R.start){ R.start=v; R.end=""; pick="to"; }
      else { if(spanDays(R.start,v)>30){ H.toast(L("Maksimum 30 hari","30 days at most")); return; } R.end=v; pick="from"; }
      paint(); onCh&&onCh(R); } };
  paint(); }
function drawNew(){ var f=H.load(DRAFT,null)||blankForm(); if(!f.facts) f.facts=[];
  if(!parseYmd(f.start) || parseYmd(f.start)<today0()){ f.start=ymd(addD(today0(),30)); f.end=ymd(addD(today0(),34)); }
  if(f.end && spanDays(f.start,f.end)<1) f.end=""; f.n=f.end?spanDays(f.start,f.end):0;
  var chips=function(name, list, val){ return list.map(function(x){ return '<button class="chip'+(name==="sty"?' noico':'')+(String(val)===String(x[0])?' on':'')+'" data-'+name+'="'+x[0]+'">'+esc(x[1])+'</button>'; }).join(""); };
  var h='<div class="tpPg"><div class="tpTop"><button class="tpBk" data-k="back">‹</button><b>✈️ Travel Anywhere</b></div>'+
   '<div class="card"><label class="tpL">📍 '+L("Ke mana?","Where to?")+'</label><div class="tpDestR"><input id="tfDest" class="rin" value="'+esc(f.dest)+'" placeholder="'+esc(L("cth. Tokyo, Osaka · Seoul · Phu Quoc · Dubai, Turki","e.g. Tokyo, Osaka · Seoul · Phu Quoc · Dubai, Turkey"))+'"><button class="tpDice" data-k="dice" aria-label="'+esc(L("Destinasi rawak","Random destination"))+'">🎲</button></div>'+
   '<div class="mut small" style="margin-top:4px">'+L("Satu atau beberapa tempat, bandar atau negara. Disneyland, pulau, wilayah pun boleh.","One or several places, cities or countries. A theme park, an island or a region works too.")+'</div>'+
   '<label class="tpL">🗓 '+L("Tarikh","Dates")+'</label><div id="tfCal"></div>'+
   '<label class="tpL">👥 '+L("Berapa orang?","How many people?")+'</label><div class="tpPpl"><span>'+L("Dewasa","Adults")+'</span><button class="chip" data-st="ad:-1">−</button><b id="tfAd">'+f.ad+'</b><button class="chip" data-st="ad:1">＋</button>'+
   '<span>'+L("Kanak-kanak","Children")+'</span><button class="chip" data-st="kd:-1">−</button><b id="tfKd">'+f.kd+'</b><button class="chip" data-st="kd:1">＋</button></div>'+
   '<label class="tpL">💼 '+L("Gaya","Style")+'</label><div class="tpChips">'+chips("sty",[["b","🪙 "+L("Jimat","Budget")],["n","💵 "+L("Biasa","Normal")],["c","💰 "+L("Selesa","Comfort")]], f.style)+'</div>'+
   '<div class="mut small" style="margin-top:10px">💱 '+L("Kos dalam","Costs in")+' <button class="chip" data-k="cur">'+esc(sym(home()))+'</button> '+L("dan mata wang destinasi.","and the destination currency.")+'</div>'+(window.AIRun?AIRun.panel("trip"):'')+
   '<button class="btn gold full g3d" data-k="go" style="margin-top:12px">✨ '+L("Rancang trip saya","Plan my trip")+'</button>'+
   '<div class="tpMore"><div class="tpMoreH">＋ '+L("Lagi (pilihan)","More (optional)")+'</div>'+
   '<label class="tpL">🛫 '+L("Berlepas dari (lapangan terbang)","Flying from (airport)")+'</label><div class="tpApW"><input id="tfFrom" class="rin" autocomplete="off" value="'+esc(f.from)+'" placeholder="'+esc(L("Taip bandar atau kod, cth. KUL","Type a city or code, e.g. KUL"))+'"><div class="tpAp hidden"></div></div>'+
   '<label class="tpL">🛬 '+L("Pulang ke (lapangan terbang)","Returning to (airport)")+'</label><div class="tpApW"><input id="tfTo" class="rin" autocomplete="off" value="'+esc(f.to||f.from)+'" placeholder="'+esc(L("Sama seperti berlepas","Same as departure"))+'"><div class="tpAp hidden"></div></div>'+
   '<label class="tpL">🚶 '+L("Rentak","Pace")+'</label><div class="tpChips">'+chips("pace",[["r",L("Santai","Relaxed")],["n",L("Biasa","Normal")],["p",L("Padat","Packed")]], f.pace)+'</div>'+
   '<label class="tpL">❤️ '+L("Minat","Interests")+'</label><div class="tpChips">'+INTS.map(function(x){ return '<button class="chip'+(f.ints.indexOf(x[0])>=0?' on':'')+'" data-int="'+x[0]+'">'+x[1]+' '+esc(L(x[2],x[3]))+'</button>'; }).join("")+'</div>'+
   '<label class="tpL">📝 '+L("Hajat / mesti ada","Wishes / must include")+'</label><textarea id="tfNotes" class="rin" rows="2" placeholder="'+esc(L("cth. Disneyland Tokyo hari ke-2, ibu 70 tahun, tiada mendaki","e.g. Tokyo Disneyland on day 2, mother is 70, no hiking"))+'">'+esc(f.notes)+'</textarea>'+
   '<label class="tpL">📎 '+L("Tempahan yang sudah ada","Bookings you already have")+'</label><div class="mut small">'+L("Penerbangan, hotel, restoran atau tempat: taip, tampal pautan atau tangkapan skrin. AI ikut masa dan tempat ini.","Flights, hotels, restaurants or places: type, paste a link or a screenshot. AI plans around these times and places.")+'</div>'+
   f.facts.map(function(x,i){ return '<div class="tpFact"><span>'+factIc(x.k)+'</span><small>'+esc(x.txt.slice(0,160))+'</small><button class="chip" data-fx="'+i+'">✕</button></div>'; }).join("")+
   ADDALL()+
   '</div></div></div>';
  EL.innerHTML=h;
  var sv=function(){ f.dest=EL.querySelector("#tfDest").value; var nf=EL.querySelector("#tfFrom").value, toE=EL.querySelector("#tfTo"); if(toE && (toE.value===f.from || !toE.value)) toE.value=nf; f.from=nf; f.to=toE?toE.value:nf; f.notes=EL.querySelector("#tfNotes").value; H.save(DRAFT,f); };
  apAttach(EL.querySelector("#tfFrom"), function(){ sv(); }); apAttach(EL.querySelector("#tfTo"), function(){ sv(); });
  rangeCal(EL.querySelector("#tfCal"), f, function(){ f.n=f.end?spanDays(f.start,f.end):0; H.save(DRAFT,f); });
  EL.querySelectorAll("input,textarea").forEach(function(i){ i.oninput=sv; });
  EL.onclick=function(e){ var b=e.target.closest("button"); if(!b) return; sv();
    if(b.hasAttribute("data-sty")){ f.style=b.getAttribute("data-sty"); H.save(DRAFT,f); drawNew(); return; }
    if(b.hasAttribute("data-pace")){ f.pace=b.getAttribute("data-pace"); H.save(DRAFT,f); drawNew(); return; }
    if(b.hasAttribute("data-int")){ var k=b.getAttribute("data-int"), i=f.ints.indexOf(k); if(i<0) f.ints.push(k); else f.ints.splice(i,1); H.save(DRAFT,f); drawNew(); return; }
    if(b.hasAttribute("data-st")){ var p=b.getAttribute("data-st").split(":"); f[p[0]]=Math.max(p[0]==="ad"?1:0, Math.min(20, f[p[0]]+(+p[1]))); H.save(DRAFT,f); EL.querySelector("#tfAd").textContent=f.ad; EL.querySelector("#tfKd").textContent=f.kd; return; }
    if(b.hasAttribute("data-fx")){ f.facts.splice(+b.getAttribute("data-fx"),1); H.save(DRAFT,f); drawNew(); return; }
    if(b.hasAttribute("data-add")){ var kd=b.getAttribute("data-add"); factSheet(kd, factIc(kd)+" "+factName(kd), factHint(kd), function(x){ f.facts.push(x); H.save(DRAFT,f); drawNew(); }); return; }
    var k2=b.getAttribute("data-k");
    if(k2==="back"){ back(); return; }
    if(k2==="cur"){ curSheet(); return; }
    if(k2==="dice"){ var cur0=f.dest, x; do{ x=ISL[Math.floor(Math.random()*ISL.length)]; } while(ISL.length>1 && x===cur0); f.dest=x; EL.querySelector("#tfDest").value=x; H.save(DRAFT,f); b.classList.remove("spin"); void b.offsetWidth; b.classList.add("spin"); return; }
    if(k2==="aiset"){ if(H.aiSettings) H.aiSettings(); return; }
    if(k2==="go"){ if(!str(f.dest)){ H.toast(L("Taip destinasi dahulu","Type a destination first")); EL.querySelector("#tfDest").focus(); return; }
      if(!f.end){ H.toast(L("Pilih tarikh pulang","Pick the return date")); return; }
      S.tripFrom=f.from; H.saveS();
      var t={id:"t"+Date.now().toString(36), made:Date.now(), dest:str(f.dest).slice(0,200), n:f.n, ad:f.ad, kd:f.kd, style:f.style, start:f.start, from:f.from, to:f.to||f.from, pace:f.pace, ints:f.ints.slice(), notes:str(f.notes), facts:f.facts.slice(), lang:langCode(), title:str(f.dest).slice(0,80), days:[], cities:[], status:"gen"};
      putT(t); H.save(DRAFT,null); st.pg="view"; st.id=t.id; st.tab="itin"; st.day=0; build(t); }
  };
}
function factIc(k){ return k==="flight"?"✈️":k==="hotel"?"🏨":k==="place"?"📍":"📎"; }
var ADDALL=function(){ return '<button class="btn alt full g3d" data-add="auto">📎 '+L("Tambah tempahan atau tempat (teks, pautan, tangkapan skrin)","Add a booking or place (text, link, screenshot)")+'</button>'; };
function factName(k){ return k==="auto"?L("Tempahan atau tempat","Booking or place"):k==="flight"?L("Penerbangan","Flight"):k==="hotel"?L("Hotel / penginapan","Hotel / stay"):k==="place"?L("Tempat / restoran","Place / restaurant"):L("Butiran","Details"); }
function factHint(k){ return k==="auto"?L("Penerbangan, hotel, restoran atau mana-mana tempat: pilih tangkapan skrin (AI baca dan terus rancang semula), atau taip / tampal pautan. AI kenal pasti jenisnya.","A flight, hotel, restaurant or any place: pick a screenshot (AI reads it and re-plans straight away), or type / paste a link. AI works out what it is.")
  :k==="flight"?L("Taip nombor penerbangan dan masa, tampal e-mel tempahan, atau pilih tangkapan skrin tiket. AI akan susun hari pertama dan terakhir ikut masa ini.","Type the flight numbers and times, paste the booking email, or pick a screenshot of the ticket. AI fits the first and last days to these times.")
  :k==="hotel"?L("Nama hotel, pautan (Booking, Agoda, Airbnb, Google Maps) atau tangkapan skrin tempahan. AI tukar penginapan dan susun hari ikut lokasinya.","The hotel name, a link (Booking, Agoda, Airbnb, Google Maps) or a screenshot of the booking. AI switches the stay and fits the days around it.")
  :L("Mana-mana tempat atau restoran: nama, pautan Google Maps / TikTok / Instagram, atau tangkapan skrin. AI masukkan ke hari yang sesuai.","Any place or restaurant: its name, a Google Maps / TikTok / Instagram link, or a screenshot. AI puts it on the right day."); }
function aiName(){ try{ if(window.HalalAI && HalalAI.featLabel){ var x=HalalAI.featLabel("trip"); return x.name+(x.model?" · "+x.model:""); } }catch(e){} return L("Tetapan AI anda","Your AI setting"); }

// ---------- trip view ----------
var TABS=[["itin","🗓","Jadual","Itinerary"],["ov","🧭","Ringkasan","Overview"],["book","✅","Senarai semak","Checklist"]];   // 0.7.24: Budget is part of Overview
// 0.7.20b (owner): the trip opens on the itinerary like Umrah DIY (map on top, day chips, the day's plan); Overview, Budget and
// Bookings sit in the app's swipeable level-3 bar at the bottom. Updates while AI or the place checks run redraw parts only, so the map stays.
function msgHtml(t){ var j=jobs[t.id];
  if(j && !j.err) return '<div class="card tpProg"><b>⏳ '+esc(j.msg)+'</b><div class="tpBar"><i style="width:'+(j.pct||5)+'%"></i></div><small class="mut">'+L("Boleh tinggalkan halaman ini; trip terus dibina.","You can leave this page; the trip keeps building.")+'</small></div>';
  if(j && j.err) return '<div class="card tpErr"><b>⚠ '+L("AI gagal","The AI failed")+'</b><div class="small">'+esc(j.err)+'</div><div class="row" style="gap:8px;margin-top:8px">'+(j.soft?'':'<button class="btn gold g3d" data-k="retry">🔁 '+L("Cuba lagi","Try again")+'</button>')+'<button class="btn alt g3d" data-k="aiset">⚙ '+L("Tetapan AI","AI settings")+'</button><button class="btn alt g3d" data-k="errx">✕</button></div></div>';
  if(t.status!=="ok" && (t.days||[]).length) return '<div class="card tpErr"><b>⚠ '+L("Trip belum siap","The trip is not finished")+'</b><button class="btn gold full g3d" data-k="fill" style="margin-top:8px">🔁 '+L("Lengkapkan dengan AI","Complete with AI")+'</button></div>';
  var g=gapsOf(t); if(g.n) return '<div class="card tpInfo"><span>ℹ️ '+L("Ada butiran yang belum lengkap","Some details are missing")+' <small class="mut">('+[g.empty.length?g.empty.length+" "+L("hari kosong","empty day(s)"):"", Object.keys(g.rep).length?Object.keys(g.rep).length+" "+L("hari dengan tempat berulang","day(s) with repeated places"):"", Object.keys(g.bad).length?Object.keys(g.bad).length+" "+L("hari dengan tempat di bandar lain","day(s) with places in another city"):"", g.thin.length?g.thin.length+" "+L("hari kurang butiran","day(s) short of details"):"", g.top.length?g.top.join(", "):""].filter(Boolean).join(" · ")+')</small></span><button class="btn gold g3d" data-k="fill">🔁 '+L("Lengkapkan","Complete")+'</button></div>';
  return ""; }
function dockHtml(){ return '<div class="dock tpDock"><div class="grp3">'+TABS.map(function(x){ return '<button class="chip g3d'+(st.tab===x[0]?' on':'')+'" data-tab="'+x[0]+'">'+x[1]+' '+esc(L(x[2],x[3]))+'</button>'; }).join("")+'</div></div>'; }
// 0.7.29 (owner): the itinerary starts at the home airport (and the last day ends there). AI is asked to; if it did not, the app adds them.
var GROUND=/\b(taxi|teksi|grab|uber|careem|bolt|transfer|bus|bas|coach|train|kereta|metro|mrt|lrt|subway|shuttle|van|drive|ride|ferry|feri|boat|bot|tram|cab|car|jeep)\b/i, FLY=/^(arriv|tiba|land|fly|flight|terbang|depart|berlepas|check[ -]?in|daftar masuk)/i;
// 0.7.32 (owner): places from the home city (e.g. Kuala Lumpur in an Aceh trip) are wrong
function homeLL(t){ var a=homeAp(t); return a&&a.ll; }
function inDest(t, name){ var d=String(t.dest||"").toLowerCase(); return !!name && sig(name).some(function(w){ return d.indexOf(w)>=0; }); }
function nearHome(t, ll){ var h=homeLL(t), a=homeAp(t); return !!(h && ll && km(h,ll)<70 && !(a && a.city && inDest(t, a.city))); }
// the destination city for day i: a day set in the home city falls back to the nearest destination day
function destCityOf(t, i){ var c=cityOf(t, t.days[i].city); if(!(c.lat && nearHome(t,[c.lat,c.lon]))) return c;
  for(var k=1;k<t.days.length;k++){ var j=i-k; if(j>=0){ var c1=cityOf(t, t.days[j].city); if(c1.lat && !nearHome(t,[c1.lat,c1.lon])) return c1; } j=i+k; if(j<t.days.length){ var c2=cityOf(t, t.days[j].city); if(c2.lat && !nearHome(t,[c2.lat,c2.lon])) return c2; } } return c; }
function wrongPlace(t, i, s){ if(s.home || s.type==="transport" || s.type==="hotel" || /airport|lapangan terbang/i.test(s.n)) return ""; var c=destCityOf(t,i), cl=c.lat?[c.lat,c.lon]:null, p=s.ai||s.ll;
  if(p && nearHome(t,p) && !(cl && km(cl,p)<70)) return c.n||t.dest; if(cl && s.ai && km(cl,s.ai)>150) return c.n; return ""; }
function homeAp(t, back){ var src=back?(t.to||t.from):t.from, m=/\(([A-Z]{3})\)/.exec(src||""); if(!m) return null; var r=null; if(AP) AP.some(function(x){ if(x[0]===m[1]){ r=x; return true; } }); return {code:m[1], name:r?r[1]+" ("+m[1]+")":src, city:r?r[2]:"", ll:r?[+r[4],+r[5]]:null}; }
// 0.7.33 (owner): "Malaysia Airlines Flight MH 126 Kuala Lumpur → Malé" is the departure even without the word "airport";
// "Malé → Kuala Lumpur" is the flight home (kept just before the arrival home)
var FLIGHTW=/flight|penerbangan|✈|\b[A-Z0-9]{2}\s?\d{2,4}\b|→|->|\bto\b|\bke\b/i;
function homeIn(txt, a){ txt=String(txt||""); return !!a && (txt.indexOf(a.code)>=0 || (!!a.city && txt.toLowerCase().indexOf(a.city.toLowerCase())>=0)); }
function arrowSplit(txt){ var m=/^(.*?)(?:→|->|\bto\b|\bke\b)(.*)$/i.exec(String(txt||"")); return m?[m[1],m[2]]:null; }
function isDepFlight(s, a){ if(!a || GROUND.test(s.n)) return false; var txt=s.n+" "+(s.note||""); if(!FLIGHTW.test(txt) || !homeIn(txt,a)) return false; var sp=arrowSplit(s.n)||arrowSplit(s.note); return sp ? homeIn(sp[0],a) && !homeIn(sp[1],a) : /depart|berlepas|flight|penerbangan/i.test(txt); }
function isRetFlight(s, z){ if(!z || GROUND.test(s.n)) return false; var sp=arrowSplit(s.n)||arrowSplit(s.note); return !!sp && FLIGHTW.test(s.n+" "+(s.note||"")) && homeIn(sp[1],z) && !homeIn(sp[0],z); }
function hasAp(s, a){ var n=(s.n+" "+(s.note||"")+" "+(s.addr||"")); return n.indexOf(a.code)>=0 || (a.city && n.toLowerCase().indexOf(a.city.toLowerCase())>=0 && /airport|lapangan terbang|klia/i.test(n)); }
function ensureHome(t){ if(!(t.days||[]).length || !t.from) return false; var a=homeAp(t), z=homeAp(t,1); if(!a) return false; if((!a.ll || (z && !z.ll)) && !AP){ apLoad(function(){ var c=getT(t.id); if(c && ensureHome(c)){ putT(c); draw(); } }); return false; }
  var d0=t.days[0], dl=t.days[t.days.length-1], ch=false;
  var mk=function(ap, dep){ return {id:rid(), t:"", n:ap.name, loc:"", type:"transport", note:dep?L("Berlepas dari lapangan terbang rumah","Depart from your home airport"):L("Tiba di lapangan terbang rumah","Arrive back at your home airport"), dur:dep?120:30, price:0, wiki:"", halal:"", home:dep?1:2, addr:ap.name, ll:ap.ll, ok:ap.ll?1:undefined, img:null}; };
  var mv=function(d, ap, kind){ var ss=d.stops||[], idx=-1; ss.forEach(function(x,k){ if(idx<0 && hasAp(x,ap) && !GROUND.test(x.n) && (kind===1 || !(d===d0 && k===0))) idx=k; }); if(idx<0) return; var x=ss[idx];
    if(kind===1 && idx!==0){ ss.splice(idx,1); ss.unshift(x); ch=true; } if(kind===2 && idx!==ss.length-1){ ss.splice(idx,1); ss.push(x); ch=true; } if(x.home!==kind){ x.home=kind; ch=true; } };
  mv(d0, a, 1); if(z && t.days.length>1) mv(dl, z, 2);
  // flights from home on day 1 go to the front (pinned at the home airport); the flight home on the last day sits just before the arrival
  var ss0=d0.stops||[], deps=ss0.filter(function(x){ return x.home!==1 && isDepFlight(x,a); });
  if(deps.length){ deps.forEach(function(x){ x.home=1; x.img=null; if(a.ll){ x.ll=a.ll.slice(); x.ok=1; x.gaddr=a.name; } }); d0.stops=ss0.filter(function(x){ return x.home===1; }).concat(ss0.filter(function(x){ return x.home!==1; })); ch=true; }
  if(z && t.days.length>1) (dl.stops||[]).forEach(function(x){ if(x.home!==3 && x.home!==2 && isRetFlight(x,z)){ x.home=3; ch=true; } });
  if(a.ll) (d0.stops||[]).forEach(function(x){ if(x.home===1 && (!x.ll || x.ll[0]!==a.ll[0] || x.ll[1]!==a.ll[1])){ x.ll=a.ll.slice(); x.ok=1; x.gaddr=a.name; ch=true; } if(x.home===1 && x.img===undefined){ x.img=null; ch=true; } });   // departure stops stay at the home airport
  if(ch){ d0.stops.sort(byTime); if(dl!==d0) dl.stops.sort(byTime); }
  // an airport stop for the home airport in the middle of the trip (not the first or last day) is a mistake: drop it
  t.days.forEach(function(d,i){ if(i===0 || i===t.days.length-1) return; var n0=(d.stops||[]).length; d.stops=(d.stops||[]).filter(function(x){ return !(x.home || ((hasAp(x,a) || (z && hasAp(x,z))) && !GROUND.test(x.n))); }); if(d.stops.length!==n0) ch=true; });
  if(!t.homeV){ var s0=(d0.stops||[])[0], sl=(dl.stops||[])[(dl.stops||[]).length-1];
    if(!s0 || !hasAp(s0,a)){ d0.stops=[mk(a,1)].concat(d0.stops||[]); var fl=(t.flights||[])[0], tm=fl&&/(\d{1,2}[:.]\d{2})/.exec(fl.when||""); if(tm) d0.stops[0].t=tm[1].replace(".",":"); }
    if(z && t.days.length>1 && (!sl || !hasAp(sl,z))) dl.stops=(dl.stops||[]).concat([mk(z,0)]); t.homeV=1; ch=true; }
  // 0.7.30 (owner): the departure is AT the home airport (AI's own airport stop was being placed in the destination city)
  var pin=function(s, ap, kind){ if(!s || !ap || !ap.ll || !hasAp(s,ap)) return; if(s.home!==kind || !s.ll || s.ll[0]!==ap.ll[0] || s.ll[1]!==ap.ll[1] || s.img===undefined){ s.home=kind; s.ll=ap.ll.slice(); s.ok=1; s.gaddr=ap.name; s.at=0; s.img=null; ch=true; } };
  pin((d0.stops||[])[0], a, 1); if(t.days.length>1 || (d0.stops||[]).length>1){ var ls=(dl.stops||[]); pin(ls[ls.length-1], z, 2); }
  return ch; }
function anchorT(t){ var ch=0; (t.days||[]).forEach(function(d,i){ var ss=d.stops||[]; ss.forEach(function(s,k){ if(s.type!=="transport" || s.home || !GROUND.test(s.n) || FLY.test(s.n)) return; var from=null, src=null;
    for(var a=k-1;a>=0;a--) if(ss[a].ll && !ss[a].home){ from=ss[a].ll; src=ss[a]; break; }
    if(!from && i>0){ var ps=t.days[i-1].stay; if(ps && ps.hotel && ps.ll){ from=ps.ll; src=ps; } }
    if(from && !(s.at===1 && s.ll && s.ll[0]===from[0] && s.ll[1]===from[1])){ s.ll=from.slice(); s.ok=1; s.at=1; s.gaddr=(src&&src.gaddr)||""; ch=1; } }); }); return ch; }
function drawTrip(){ var t=getT(st.id); if(!t){ st.pg="list"; draw(); return; } var ch1=t.status==="ok" && ensureHome(t); if(anchorT(t) || ch1) putT(t); if(st.tab==="cost") st.tab="ov";
  var sh=EL.querySelector("#tpShell"), fresh=!sh || sh.getAttribute("data-id")!==t.id || sh.getAttribute("data-tab")!==st.tab;
  if(fresh){ killMap();
    EL.innerHTML='<div class="tpPg" id="tpShell" data-id="'+t.id+'" data-tab="'+st.tab+'"><div class="tpTop"><button class="tpBk" data-k="back">‹</button><b class="tpTt"></b><span class="tpStat y" id="tpStat"></span><button class="tpBk" data-k="share" title="'+esc(L("Kongsi / eksport","Share / export"))+'">⤴</button><button class="tpBk" data-k="menu">⋯</button></div><div id="tpMsg"></div><div id="tpBody"></div></div>'+dockHtml();
    EL.onclick=function(e){ onTripClick(e, t); };
    EL.onpointerdown=function(e){ var h=e.target.closest && e.target.closest("[data-ckg]"); if(h){ e.preventDefault(); cklDrag(e, h); } };
    EL.onmouseover=function(e){ var wd=e.target.closest && e.target.closest("[data-wxd]"); if(wd){ var tt=getT(st.id); if(tt) wxTip(tt, +wd.getAttribute("data-wxd")); } };
    EL.onchange=function(e){ var x=e.target.closest && e.target.closest("[data-ckt]"); if(!x || !document.body.contains(x)) return; var q=x.getAttribute("data-ckt").split(":"), tt=getT(st.id); if(!tt) return; cklEdit(tt, +q[0], +q[1], x.value); if(!str(x.value)) drawTrip(); };
    try{ if(H.dockFix) setTimeout(H.dockFix, 0); }catch(e){} }
  EL.querySelector(".tpTt").textContent=t.title||t.dest; EL.querySelector("#tpMsg").innerHTML=msgHtml(t);
  var B=EL.querySelector("#tpBody");
  if(!(t.days||[]).length){ B.innerHTML=jobs[t.id]&&!jobs[t.id].err?'':'<div class="card mut">'+L("Tiada pelan lagi.","No plan yet.")+'</div>'; return; }
  wxGet(t); if(!jobs[t.id] && !jobs[t.id+"r"] && t.days.some(function(d){ return (d.stops||[]).some(function(s){ return s.ok===undefined || s.img===undefined; }) || (d.stay && d.stay.hotel && d.stay.ll===undefined); })) setTimeout(function(){ var c=getT(t.id); if(c) resolve(c); }, 300);
  if(st.tab==="itin"){ var first=!B.querySelector("#tpItin"); if(first){ B.innerHTML=itinShell(t); bindItin(); }
    var pane=B.querySelector("#tpPane"), y=pane.scrollTop; paintChips(); pane.innerHTML=daysHtml(t); pane.scrollTop=y;
    if(first){ fitItin(); setTimeout(fitItin, 60); setTimeout(fitItin, 400); mapInit(t); if(st.day>0) setTimeout(function(){ goDay(st.day); }, 0); } else mapData(); updStat(); return; }
  var ask=B.querySelector("#tpAsk"), keep=ask?ask.value:"", fq=B.querySelector("#tpFact"), keepF=fq?fq.value:"";
  B.innerHTML=st.tab==="ov"?ovHtml(t):bookHtml(t); updStat();
  if(keep && B.querySelector("#tpAsk")) B.querySelector("#tpAsk").value=keep; if(keepF && B.querySelector("#tpFact")) B.querySelector("#tpFact").value=keepF;
}
function chipRow(t){ var d=parseYmd(t.start); return '<div class="tpMeta"><span>🗓 '+t.n+' '+L("hari","days")+(d?' · '+esc(dateTxt(d))+' – '+esc(dateTxt(addD(d,t.n-1))):'')+'</span><span>👥 '+(t.ad||0)+' '+L("dewasa","adults")+(t.kd?' + '+t.kd+' '+L("kanak-kanak","children"):'')+'</span><span class="noico">'+(t.style==="b"?"🪙":t.style==="c"?"💰":"💵")+' '+esc(L(STYLE[t.style||"n"][0],STYLE[t.style||"n"][1]))+'</span></div>'; }
function route(t){ var r=[], n=0; t.days.forEach(function(d,i){ if(!r.length || r[r.length-1].c!==d.city){ r.push({c:d.city, n:0, i:i}); } r[r.length-1].n++; }); return r; }
// 0.7.24 (owner): Overview = title (big picture only when there is a photo), total cost, route, flights, every place by category
// with its budget, the budget breakdown and rates (the Budget tab is gone), Tell AI, Good to know (folded), day by day.
var CATS=[["stay","🏨","Penginapan","Accommodation"],["see","🏛","Tarikan","Attractions"],["food","🍽","Restoran","Restaurants"],["mosque","🕌","Masjid","Mosques"],["shop","🛍","Membeli-belah","Shopping"],["move","🚆","Pengangkutan","Transport"]];
function catOf(ty){ return ty==="food"?"food":ty==="mosque"?"mosque":ty==="shop"?"shop":ty==="transport"?"move":ty==="hotel"?"stay":"see"; }
function catsHtml(t){ var ppl=(t.ad||1)+(t.kd||0), rooms=Math.max(1,Math.ceil((t.ad||1)/2)), G={};
  t.days.forEach(function(d,i){ var cur=dayCur(t,i);
    (d.stops||[]).forEach(function(s,k){ var g=catOf(s.type); if(g==="stay" || s.home) return; (G[g]=G[g]||[]).push({n:s.n, i:i, k:k, ic:TYPE[s.type]||"📍", per:s.price||0, tot:(s.price||0)*ppl, cur:cur, ok:s.ok}); });
    if(d.stay && d.stay.hotel && i<t.days.length-1){ var L0=(G.stay=G.stay||[]), last=L0.filter(function(x){ return x.n.toLowerCase()===d.stay.hotel.toLowerCase(); })[0];
      if(last){ last.nights++; last.tot+=(d.stay.price||0)*rooms; }
      else L0.push({n:d.stay.hotel, i:i, k:-1, ic:"🏨", per:d.stay.price||0, tot:(d.stay.price||0)*rooms, cur:cur, nights:1}); } });
  return CATS.filter(function(c){ return G[c[0]]; }).map(function(c){ var L0=G[c[0]], sub=0, miss=0; L0.forEach(function(x){ var h=toHome(t,x.tot,x.cur); if(h==null) miss++; else sub+=h; });
    return '<details class="card tpCat" open><summary><b>'+c[1]+' '+esc(L(c[2],c[3]))+'</b> <small class="mut">'+L0.length+'</small><span class="tpCatT">'+(sub>0?fmtM(sub,home()):'')+'</span></summary>'+
      L0.map(function(x){ return '<div class="tpCi"><button class="tpCiN" data-goto="'+x.i+':'+x.k+'"><span>'+x.ic+'</span><span><b>'+esc(x.n)+'</b><small class="mut">'+L("Hari","Day")+' '+(x.i+1)+(x.nights?(x.nights>1?'+':'')+' · '+x.nights+' '+L("malam","night(s)"):'')+(x.ok===0?' · ⚠':'')+'</small></span></button>'+
        '<button class="tpCiP" data-pe="'+x.i+':'+x.k+'" aria-label="'+esc(L("Ubah harga","Edit price"))+'">'+(x.tot>0?money(t,x.tot,x.cur):'<small class="mut">'+(c[0]==="see"||c[0]==="mosque"?L("Percuma","Free"):"—")+'</small>')+(x.per>0&&x.k>=0&&ppl>1?'<small class="mut">'+moneyTxt(t,x.per,x.cur)+' × '+ppl+'</small>':'')+(x.nights?'<small class="mut">'+moneyTxt(t,x.per,x.cur)+' × '+x.nights+'</small>':'')+'<i>✎</i></button>'+
        '<button class="tpRg" data-gm="'+x.i+':'+x.k+'" aria-label="Google Maps">📍</button><button class="tpRm" '+(x.k<0?'data-hch="'+x.i+'"':'data-sm="'+x.i+':'+x.k+'"')+' aria-label="'+esc(L("Lagi","More"))+'">⋯</button></div>'; }).join("")+'</details>'; }).join(""); }
// 0.7.35 (owner): every price can be edited (local currency: per person for places, per night for a hotel, per person in your currency for flights)
function priceSheet(t, key){ var q=key.split(":"), d, s0, cur, val, what, fi=q[0]==="f"?+q[1]:-1;
  if(fi>=0){ s0=(t.flights||[])[fi]; if(!s0) return; cur=home(); val=s0.price||0; what=s0.from+" → "+s0.to+" · "+L("seorang","per person"); }
  else { var i=+q[0], k=+q[1]; d=t.days[i]; cur=dayCur(t,i); if(k<0){ s0=d.stay; val=s0.price||0; what=s0.hotel+" · "+L("semalam / bilik","per night / room"); } else { s0=d.stops[k]; if(!s0) return; val=s0.price||0; what=s0.n+" · "+L("seorang","per person"); } }
  var ov=H.showSheet("✎ "+L("Harga","Price"), '<div class="small"><b>'+esc(what)+'</b></div><div class="tpPrIn"><span>'+esc(sym(cur))+'</span><input id="prV" class="rin" type="number" min="0" step="any" inputmode="decimal" value="'+(val||"")+'"></div><div class="mut small" id="prH"></div><button class="btn gold full g3d" id="prGo" style="margin-top:10px">'+L("Simpan","Save")+'</button>');
  var inp=ov.querySelector("#prV"), hint=function(){ var v=num(inp.value); ov.querySelector("#prH").textContent=cur!==home()&&v?"≈ "+moneyTxt(t,v,cur):""; }; inp.oninput=hint; hint(); setTimeout(function(){ try{ inp.focus(); inp.select(); }catch(e){} }, 150);
  ov.querySelector("#prGo").onclick=function(){ var v=Math.max(0,num(inp.value)), c=getT(t.id)||t;
    if(fi>=0){ c.flights[fi].price=v; } else { var i=+q[0], k=+q[1]; if(k<0){ var hn=c.days[i].stay.hotel; c.days.forEach(function(dd){ if(dd.stay && dd.stay.hotel===hn) dd.stay.price=v; }); } else c.days[i].stops[k].price=v; }
    putT(c); H.closeOverlay(); drawTrip(); }; }
function budgetHtml(t){ var c=costs(t); fxLoad(); var curs={}; (t.cities||[]).forEach(function(x){ if(x.cur && x.cur!==home()) curs[x.cur]=1; });
  return '<details class="card tpGk" id="tpBud" open><summary><b>💰 '+L("Pecahan bajet","Budget breakdown")+'</b><span class="tpCatT">'+fmtM(c.total,home())+'</span></summary>'+
    c.lines.map(function(x){ return '<div class="tpCl"><span>'+x.ic+'</span><div><b>'+esc(x.n)+'</b><small class="mut">'+esc(x.sub||"")+'</small></div><div class="tpCv">'+(x.h!=null?'<b>'+fmtM(x.h,home())+'</b>':'')+(x.cur!==home()?'<small>'+fmtM(x.v,x.cur)+'</small>':'')+'</div></div>'; }).join("")+
    '<div class="small" style="margin-top:8px"><b>💱 '+L("Kadar tukaran","Exchange rates")+'</b>'+Object.keys(curs).map(function(k){ var r=rateOf(t,k); return '<div>1 '+esc(home())+' = '+(r?(r>=100?fmtN(r):r.toFixed(r>=1?2:4)):'?')+' '+esc(k)+'</div>'; }).join("")+
    '<div class="mut">'+(FX&&FX.base===home()?L("Kadar langsung","Live rate")+' · '+esc(FX.src)+' · '+new Date(FX.t).toLocaleDateString():L("Anggaran AI (tiada internet)","AI estimate (offline)"))+(c.miss?' · ⚠ '+c.miss+' '+L("baris tanpa kadar","lines without a rate"):'')+'</div>'+
    '<div class="mut" style="margin-top:6px">⚠ '+L("Harga ialah anggaran AI untuk gaya ini. Penerbangan dan hotel berubah ikut tarikh: semak harga sebenar.","Prices are AI estimates for this style. Flights and hotels change with the dates: check the real prices.")+'</div></div>'+
    '<button class="btn alt full g3d" data-k="split" style="margin-top:8px">🧾 '+L("Bahagi bil trip ini","Split this trip's bills")+'</button></details>'; }
function ovHtml(t){ var c=costs(t), r=route(t);
  var h='<div class="tpOvH"><b>'+esc(t.title||t.dest)+'</b>'+(t.summary?'<small>'+esc(t.summary)+'</small>':'')+'</div>';
  h+=chipRow(t)+'<button class="btn alt full g3d tpEdit" data-k="edit">✏️ '+L("Ubah laluan / tarikh","Edit route / dates")+'</button>'+prayWxHtml(t);
  if(c.total>0) h+='<div class="card tpTot"><span>💰 '+L("Anggaran jumlah","Estimated total")+' <button class="chip" data-k="cur">'+esc(sym(home()))+'</button></span><b>'+fmtM(c.total,home())+'</b><small>'+fmtM(c.total/Math.max(1,c.ppl),home())+' '+L("seorang","per person")+'</small>'+
    '<div class="tpChips tpSty" style="margin-top:8px">'+[["b","🪙",L("Jimat","Budget")],["n","💵",L("Biasa","Normal")],["c","💰",L("Selesa","Comfort")]].map(function(x){ return '<button class="chip noico'+((t.style||"n")===x[0]?' on':'')+'" data-k="sty:'+x[0]+'">'+x[1]+' '+x[2]+'</button>'; }).join("")+'</div></div>';
  h+=askHtml(t);
  h+=flightsHtml(t);
  h+=catsHtml(t)+budgetHtml(t);
  var tp=t.tips||{}, TT=[["visa","🛂","Visa","Visa"],["halal","🍽","Makanan halal","Halal food"],["mosque","🕌","Masjid & solat","Mosques & prayer"],["money","💳","Wang","Money"],["sim","📶","SIM / eSIM","SIM / eSIM"],["plug","🔌","Palam","Plugs"],["weather","🌦","Cuaca","Weather"],["transport","🚆","Pengangkutan","Getting around"],["emergency","🚨","Kecemasan","Emergency"],["etiquette","🤝","Adab tempatan","Etiquette"]];
  var tips=TT.filter(function(x){ return tp[x[0]] && !(x[0]==="visa" && domestic(t)); }); if(tips.length) h+='<details class="card tpGk"><summary><b>💡 '+L("Info penting","Good to know")+'</b> <small class="mut">· '+tips.length+'</small></summary>'+tips.map(function(x){ return '<div class="tpTip"><span>'+x[1]+'</span><div><b>'+esc(L(x[2],x[3]))+'</b><small>'+esc(typeof tp[x[0]]==="string"?tp[x[0]]:JSON.stringify(tp[x[0]]))+'</small></div></div>'; }).join("")+'<div class="mut small" style="margin-top:6px">⚠ '+L("Visa, harga dan waktu buka ialah anggaran AI: semak sumber rasmi sebelum pergi.","Visa, prices and opening hours are AI estimates: check the official source before you go.")+'</div></details>';
  return h; }
// 0.7.34 (owner): prayer times (with imsak and sunrise) and the weather for every day, large, at the top of Overview
// 0.7.36 (owner): the weather of every day as a 2-line chart (day high, night low) and the prayer times of the first day, as one card
function wxDays(t){ var d0=parseYmd(t.start); if(!d0) return []; return t.days.map(function(d,i){ var c=cityOf(t,d.city), dt=addD(d0,i), w=(t.wx||{})[ymd(dt)+"|"+c.n]; return {i:i, dt:dt, c:c, w:w&&w.hi!=null?w:null}; }); }
function wxChart(t){ var D=wxDays(t), pts=D.filter(function(x){ return x.w; }); if(pts.length<1) return "";
  var n=D.length, W=Math.max(300, n*58), Hh=170, padL=34, padR=6, ins=22, top=34, bot=40, ch=Hh-top-bot, cw=W-padL-padR-2*ins;
  var hi=Math.max.apply(null, pts.map(function(x){ return x.w.hi; })), lo=Math.min.apply(null, pts.map(function(x){ return x.w.lo; }));
  var y0=Math.floor(lo-2), y1=Math.ceil(hi+2); if(y1-y0<6) y1=y0+6;
  var X=function(i){ return padL+ins+(n===1?cw/2:cw*i/(n-1)); }, Y=function(v){ return top+ch*(1-(v-y0)/(y1-y0)); };
  var ticks=[y0, Math.round((y0+y1)/2), y1], est=pts.some(function(x){ return x.w.est; });
  var path=function(k){ var seg=[], out=""; D.forEach(function(x){ if(x.w){ seg.push((seg.length?"L":"M")+X(x.i).toFixed(1)+" "+Y(x.w[k]).toFixed(1)); } else if(seg.length){ out+=seg.join(" ")+" "; seg=[]; } }); return out+seg.join(" "); };
  var hiMax=pts.reduce(function(a,b){ return b.w.hi>a.w.hi?b:a; }), loMin=pts.reduce(function(a,b){ return b.w.lo<a.w.lo?b:a; });
  var svg='<svg class="tpWxC" viewBox="0 0 '+W+' '+Hh+'" width="'+W+'" height="'+Hh+'" role="img" aria-label="'+esc(L("Suhu tinggi dan rendah setiap hari","Daily high and low temperature"))+'">'+
    ticks.map(function(v){ return '<line x1="'+padL+'" x2="'+(W-padR)+'" y1="'+Y(v)+'" y2="'+Y(v)+'" class="g"/><text x="'+(padL-6)+'" y="'+(Y(v)+4)+'" class="ax" text-anchor="end">'+v+'°</text>'; }).join("")+
    '<path d="'+path("hi")+'" class="hi"/><path d="'+path("lo")+'" class="lo"/>'+
    D.map(function(x){ var cx=X(x.i); return (x.w?'<text x="'+cx+'" y="20" class="ic" text-anchor="middle">'+wxIc(x.w.c)+'</text><circle cx="'+cx+'" cy="'+Y(x.w.hi)+'" r="4" class="hi"/><circle cx="'+cx+'" cy="'+Y(x.w.lo)+'" r="4" class="lo"/>':'')+
      '<text x="'+cx+'" y="'+(Hh-22)+'" class="ax" text-anchor="middle">'+L("H","D")+(x.i+1)+'</text><text x="'+cx+'" y="'+(Hh-8)+'" class="ax2" text-anchor="middle">'+esc(dateTxt(x.dt).split(/[ ,]+/).slice(0,1).join(""))+'</text>'+
      '<rect class="hit" data-wxd="'+x.i+'" x="'+(cx-(n===1?cw/2:cw/(n-1)/2))+'" y="'+top+'" width="'+(n===1?cw:cw/(n-1))+'" height="'+(ch+bot-4)+'"/>'; }).join("")+
    '<text x="'+X(hiMax.i)+'" y="'+(Y(hiMax.w.hi)-9)+'" class="lb" text-anchor="middle">'+Math.round(hiMax.w.hi)+'°</text><text x="'+X(loMin.i)+'" y="'+(Y(loMin.w.lo)+17)+'" class="lb" text-anchor="middle">'+Math.round(loMin.w.lo)+'°</text>'+
    '<line class="xh" x1="0" x2="0" y1="'+top+'" y2="'+(top+ch)+'" style="display:none"/></svg>';
  return '<div class="card tpWxCard"><div class="tpWxHd"><b>🌦 '+L("Cuaca","Weather")+'</b><span class="tpLeg2"><i class="hi"></i>'+L("Tinggi","High")+' <i class="lo"></i>'+L("Rendah","Low")+'</span></div>'+
    '<div class="tpWxS"><div class="tpWxIn">'+svg+'<div class="tpWxTip" hidden></div></div></div>'+(est?'<div class="mut small">'+L("Anggaran: cuaca tarikh yang sama tahun lalu.","Estimate: the weather on the same dates last year.")+'</div>':'')+
    '<details class="tpWxT"><summary>'+L("Jadual","Table")+'</summary><table><tr><th>'+L("Hari","Day")+'</th><th></th><th>'+L("Tinggi","High")+'</th><th>'+L("Rendah","Low")+'</th><th>💧</th></tr>'+D.map(function(x){ return '<tr><td>'+(x.i+1)+' · '+esc(dateTxt(x.dt))+'</td><td>'+(x.w?wxIc(x.w.c):'')+'</td><td>'+(x.w?Math.round(x.w.hi)+'°':'–')+'</td><td>'+(x.w?Math.round(x.w.lo)+'°':'–')+'</td><td>'+(x.w?(x.w.p!=null?x.w.p+'%':x.w.mm!=null?(Math.round(x.w.mm*10)/10)+' mm':''):'')+'</td></tr>'; }).join("")+'</table></details></div>'; }
function wxTip(t, i){ var box=EL.querySelector(".tpWxIn"); if(!box) return; var tip=box.querySelector(".tpWxTip"), x=wxDays(t)[i], svg=box.querySelector("svg"), xh=svg&&svg.querySelector(".xh"); if(!x || !tip) return;
  var r=svg.querySelector('[data-wxd="'+i+'"]'), cx=+r.getAttribute("x")+(+r.getAttribute("width"))/2; if(xh){ xh.setAttribute("x1",cx); xh.setAttribute("x2",cx); xh.style.display=""; }
  tip.innerHTML='<b>'+L("Hari","Day")+' '+(i+1)+' · '+esc(dateTxt(x.dt))+'</b><span>'+esc(x.c.n)+'</span>'+(x.w?'<span>'+wxIc(x.w.c)+' <i class="hi"></i>'+Math.round(x.w.hi)+'° <i class="lo"></i>'+Math.round(x.w.lo)+'°</span>'+(x.w.p!=null?'<span>💧 '+x.w.p+'%</span>':x.w.mm!=null?'<span>💧 '+(Math.round(x.w.mm*10)/10)+' mm</span>':''):'<span>–</span>');
  tip.hidden=false; tip.style.left=Math.max(0, Math.min(box.clientWidth-150, cx-75))+"px"; }
function prayWxHtml(t){ if(!H.calcDay || !(t.days||[]).length) return ""; var P=[["imsak","Imsak","Imsak"],["subuh","Subuh","Fajr"],["syuruk","Syuruk","Sunrise"],["zohor","Zohor","Dhuhr"],["asar","Asar","Asr"],["maghrib","Maghrib","Maghrib"],["isyak","Isyak","Isha"]];
  var d=t.days[0], c=cityOf(t,d.city), h="";
  // day 1's destination city (not the home airport city where the trip starts)
  for(var k=0;k<t.days.length && !(c.lat && !nearHome(t,[c.lat,c.lon]));k++) c=cityOf(t,t.days[k].city);
  if(c.lat){ var dt=dateOf(t,0)||new Date(), tz=c.tz!=null?c.tz:Math.round(c.lon/15), p=null; try{ p=H.calcDay(dt, c.lat, c.lon, {fa:18, ia:17, tz:tz, ik:2}); }catch(e){}
    if(p) h+='<div class="card tpPrC"><div class="tpWxHd"><b>🕌 '+L("Waktu solat","Prayer times")+'</b><span>'+(t.start?esc(dateTxt(dt))+' · ':L("Hari ini","Today")+' · ')+esc(c.n)+'</span></div><div class="tpPwG">'+P.map(function(x){ return '<span class="'+(x[0]==="syuruk"||x[0]==="imsak"?'sub':'')+'"><small>'+esc(L(x[1],x[2]))+'</small><b>'+p[x[0]]+'</b></span>'; }).join("")+'</div></div>'; }
  h+=wxChart(t);
  if(!t.start) h+='<div class="mut small" style="margin:-4px 2px 10px">'+L("Tetapkan tarikh trip untuk melihat cuaca.","Set the trip dates to see the weather.")+' <button class="chip" data-k="dates">📅 '+L("Tetapkan tarikh","Set dates")+'</button></div>';
  return h; }
// 0.7.34 (owner): bookings are a form on the Overview page, above Tell AI; what was added is listed underneath
// 0.7.35 (owner): Tell AI and bookings in one card, right under the estimated total. Typed text is either a change
// ("cheaper hotels") or a booking (a flight, hotel, restaurant or place, a link or a screenshot): AI works out which.
function askHtml(t){ var f=t.facts||[];
  return '<div class="card tpAsk"><div class="tpAskH"><h3>💬 '+L("Beritahu AI atau tambah tempahan","Tell AI or add a booking")+'</h3>'+(window.AIRun?AIRun.btn("trip"):'')+'</div>'+
    '<div class="tpKinds"><span>'+L("Penerbangan","Flight")+'</span><span>'+L("Hotel","Hotel")+'</span><span>'+L("Restoran","Restaurant")+'</span><span>'+L("Tempat","Place")+'</span></div>'+
    '<textarea id="tpAsk" class="rin" rows="3" placeholder="'+esc(L("cth. \"hotel lebih murah\", \"tambah Universal Studios\", nombor penerbangan, nama hotel atau pautan","e.g. \"cheaper hotels\", \"add Universal Studios\", a flight number, a hotel name or a link"))+'"></textarea>'+
    '<div class="tpTwo"><button class="btn alt g3d" data-k="fshot">📷 '+L("Tangkapan skrin","Screenshot")+'</button><button class="btn gold g3d" data-k="ask">✨ '+L("Kemas kini trip","Update the trip")+'</button></div>'+
    (f.length?'<div class="tpSub">📎 '+L("Tempahan anda","Your bookings")+'</div>'+f.map(function(x,i){ var lines=String(x.txt||"").split(/\n|(?<=\.)\s/).filter(Boolean); return '<div class="tpFact"><span>'+factIc(x.k)+'</span><div><b>'+esc((lines[0]||"").slice(0,90))+'</b><small>'+esc(lines.slice(1).join(" ").slice(0,300))+'</small></div><button class="chip" data-fdel="'+i+'">🗑</button></div>'; }).join(""):'')+
    ((t.log||[]).length?'<details class="tpLog"><summary>'+L("Perubahan lalu","Past changes")+' ('+t.log.length+')</summary>'+t.log.slice().reverse().map(function(x){ return '<div class="small"><b>'+esc(x.q)+'</b><br><span class="mut">'+esc(x.a||"")+'</span></div>'; }).join("")+'</details>':'')+'</div>'; }
function factsHtml(t){ var f=t.facts||[];
  return '<div class="tpFacts"><h3>📎 '+L("Tempahan & butiran anda","Your bookings & details")+'</h3><div class="tpKinds"><span>✈️ '+L("Penerbangan","Flight")+'</span><span>🏨 '+L("Hotel","Hotel")+'</span><span>🍽 '+L("Restoran","Restaurant")+'</span><span>📍 '+L("Tempat","Place")+'</span></div>'+
    '<textarea id="tpFact" class="rin" rows="3" placeholder="'+esc(L("Taip butiran, tampal pautan, atau pilih tangkapan skrin","Type the details, paste a link, or pick a screenshot"))+'"></textarea>'+
    '<div class="tpTwo"><button class="btn alt g3d" data-k="fshot">📷 '+L("Tangkapan skrin","Screenshot")+'</button><button class="btn gold g3d" data-k="fadd">✨ '+L("Tambah & rancang semula","Add & re-plan")+'</button></div>'+
    f.map(function(x,i){ var lines=String(x.txt||"").split(/\n|(?<=\.)\s/).filter(Boolean); return '<div class="tpFact"><span>'+factIc(x.k)+'</span><div><b>'+esc((lines[0]||"").slice(0,90))+'</b><small>'+esc(lines.slice(1).join(" ").slice(0,300))+'</small></div><button class="chip" data-fdel="'+i+'">🗑</button></div>'; }).join("")+'</div>'; }
function flightsHtml(t){ var f=t.flights||[], fx=(t.facts||[]).filter(function(x){ return x.k==="flight"; });
  return '<div class="card"><h3>✈️ '+L("Penerbangan","Flights")+'</h3>'+(f.length?f.map(function(x, fi){ return '<div class="tpFl"><b>'+esc(x.from)+' → '+esc(x.to)+'</b><small>'+esc([x.when,x.airline].filter(Boolean).join(" · "))+'</small>'+('<button class="tpCiP fl" data-pe="f:'+fi+'">'+(x.price?money(t,x.price,home(),L("seorang","pp")):'<small class="mut">—</small>')+'<i>✎</i></button>')+(x.note?'<small class="mut">'+esc(x.note)+'</small>':'')+'</div>'; }).join(""):'<div class="mut small">'+L("Tiada penerbangan.","No flights.")+'</div>')+
   (fx.length?'<div class="mut small">✅ '+L("Ikut tempahan anda","Following your booking")+'</div>':'')+
   '<div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn alt g3d" data-add="flight">✈️ '+L("Masukkan penerbangan / tangkapan skrin","Add flights / screenshot")+'</button><button class="btn alt g3d" data-k="fsearch">🔎 '+L("Semak harga","Check prices")+'</button></div></div>'; }

// 0.7.22 (owner): the itinerary is laid out exactly like Umrah DIY: the map stays on top (drag the handle to resize, ‹ › walks
// through the trip), day chips under it, then one list of every day. Each row shows only the time, number, icon and name, with
// 📍 Google Maps and ⋯ at the right edge; tapping a row opens its note, price and halal details and shows it on the map.
// 0.7.24 (owner): weather for each day: Open-Meteo forecast within 16 days, else the same dates last year as an estimate
function wxIc(c){ c=+c; return c===0?"☀️":c<=2?"🌤":c===3?"☁️":c<=48?"🌫":c<=57?"🌦":c<=67?"🌧":c<=77?"❄️":c<=82?"🌧":c<=86?"🌨":"⛈"; }
function wxGet(t){ var d0=parseYmd(t.start); if(!d0 || !(t.days||[]).length || jobs[t.id+"w"]) return; var sig0=t.start+"|"+t.days.map(function(d){ return d.city; }).join(",");
  if(t.wxK===sig0 && Date.now()-(t.wxT||0)<6*36e5) return; jobs[t.id+"w"]=1;
  var by={}; t.days.forEach(function(d,i){ var c=cityOf(t,d.city); if(!c.lat) return; (by[c.n]=by[c.n]||{c:c, ds:[]}).ds.push(ymd(addD(d0,i))); });
  var out={}, ks=Object.keys(by), n=0, ahead=(addD(d0,t.days.length-1)-today0())/864e5;
  var done=function(){ if(++n<ks.length) return; delete jobs[t.id+"w"]; var cur=getT(t.id); if(!cur) return; cur.wx=out; cur.wxK=sig0; cur.wxT=Date.now(); putT(cur); if(st.pg==="view" && st.id===cur.id) draw(); };
  if(!ks.length){ delete jobs[t.id+"w"]; return; }
  ks.forEach(function(k){ var b=by[k], a=b.ds[0], z=b.ds[b.ds.length-1], est=ahead>15 || (d0<today0());
    var shift=function(x){ var y=parseYmd(x); y.setFullYear(y.getFullYear()-1); return ymd(y); };
    var u=est ? "https://archive-api.open-meteo.com/v1/archive?latitude="+b.c.lat+"&longitude="+b.c.lon+"&start_date="+shift(a)+"&end_date="+shift(z)+"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
      : "https://api.open-meteo.com/v1/forecast?latitude="+b.c.lat+"&longitude="+b.c.lon+"&start_date="+a+"&end_date="+z+"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto";
    jget(u).then(function(j){ var D=j&&j.daily; if(D && D.time) D.time.forEach(function(x,n2){ var real=b.ds[n2]; if(!real) return; out[real+"|"+k]={c:D.weather_code[n2], hi:D.temperature_2m_max[n2], lo:D.temperature_2m_min[n2], p:est?null:(D.precipitation_probability_max||[])[n2], mm:est?(D.precipitation_sum||[])[n2]:null, est:est?1:0}; }); done(); }); }); }
function wxLine(t, i){ var d0=parseYmd(t.start); if(!d0) return ""; var c=cityOf(t,t.days[i].city), w=(t.wx||{})[ymd(addD(d0,i))+"|"+c.n]; if(!w || w.hi==null) return "";
  return '<span class="tpWx">'+wxIc(w.c)+' '+Math.round(w.hi)+'° / '+Math.round(w.lo)+'°'+(w.p!=null?' · 💧'+w.p+'%':w.mm!=null?' · 💧'+(Math.round(w.mm*10)/10)+' mm':'')+(w.est?' <small>('+L("anggaran, tahun lalu","estimate, last year")+')</small>':'')+'</span>'; }
function prayLine(t, i){ var d=t.days[i], c=cityOf(t, d.city); if(!c.lat || !H.calcDay) return ""; var dt=dateOf(t,i)||addD(new Date(), i), tz=c.tz!=null?c.tz:Math.round(c.lon/15);
  try{ var p=H.calcDay(dt, c.lat, c.lon, {fa:18, ia:17, tz:tz, ik:2}); return '<div class="tpPl">🕌 '+[["subuh",L("Subuh","Fajr")],["zohor",L("Zohor","Dhuhr")],["asar",L("Asar","Asr")],["maghrib",L("Maghrib","Maghrib")],["isyak",L("Isyak","Isha")]].map(function(x){ return x[1]+' <b>'+p[x[0]]+'</b>'; }).join(" · ")+'</div>'; }catch(e){ return ""; } }
function dayInfo(t, i){ var w=wxLine(t,i); return prayLine(t,i)+(w?'<div class="tpPl">'+w+'</div>':(!t.start&&i===0?'<div class="tpPl"><button class="chip" data-k="dates">📅 '+L("Tetapkan tarikh untuk cuaca","Set the dates for the weather")+'</button></div>':'')); }
function chipsHtml(t){ return '<button class="tpAllD'+(st.day<0?' on':'')+'" data-day="-1" aria-label="'+esc(L("Semua hari","All days"))+'">▦</button>'+t.days.map(function(x,k){ return '<button class="'+(k===st.day?'on':'')+'" data-day="'+k+'" style="--dc:'+dcol(k)+'">'+L("Hari","Day")+' '+(k+1)+'</button>'; }).join(""); }
// 0.7.24 (owner): the distance to the next stop (straight line × 1.3 for roads), walking under 1.2 km
function legHtml(a, b){ if(!a || !b) return ""; var d=km(a,b)*1.3; if(d<0.05) return ""; var fly=d>400, walk=d<1.2, m=Math.max(1,Math.round(fly?km(a,b)/800*60+40:walk?d/4.5*60:d/30*60+6)); if(fly) d=km(a,b);
  return '<div class="tpLeg">'+(fly?"✈️":walk?"🚶":"🚗")+' '+(d<10?d.toFixed(1):Math.round(d))+' km · ~'+(m>=60?Math.floor(m/60)+L("j","h")+" "+(m%60)+"m":m+" min")+'</div>'; }
function rowHtml(t, i, k, s, cur, far){ var open=st.open===i+":"+k, rpt=(REP[i]||[]).filter(function(x){ return x.indexOf(s.n+" (day ")===0; })[0];
  var h='<div class="tpRow'+(open?' open':'')+(s.lock?' lock':'')+'" data-row="'+i+':'+k+'" style="--dc:'+dcol(i)+'"><div class="tpRt">'+esc(s.t||"")+'</div><span class="tpRn">'+(k+1)+'</span><span class="tpRi">'+(s.home||/airport|lapangan terbang|klia/i.test(s.n)&&!GROUND.test(s.n)?"✈️":(TYPE[s.type]||"📍"))+'</span>'+
    '<div class="tpRb"><b>'+esc(s.n)+(s.lock?' 🔒':'')+(s.ok===0?' <span class="tpWarnI">⚠</span>':'')+'</b>'+(far?'<small class="tpFar">⚠ '+far+' km '+L("dari laluan","off the route")+'</small>':'')+(rpt?'<small class="tpFar">⚠ '+L("Berulang: ","Repeat: ")+esc(rpt.slice(s.n.length+1).replace(/[()]/g,""))+'</small>':'')+(function(){ var w=wrongPlace(t,i,s); return w?'<small class="tpFar">⚠ '+L("Bukan di ","Not in ")+esc(w)+'</small>':''; })();
  if(open){ h+='<div class="tpRd"><div>'+(s.loc&&s.loc!==s.n?'<small class="mut">'+esc(s.loc)+'</small>':'')+(s.note?'<small>'+esc(s.note)+'</small>':'')+
      '<div class="tpTags">'+(s.dur?'<span>⏱ '+(s.dur>=60?Math.floor(s.dur/60)+L("j","h")+(s.dur%60?" "+(s.dur%60)+"m":""):s.dur+"m")+'</span>':'')+(s.price?'<span>'+money(t,s.price,cur,L("seorang","pp"))+'</span>':'')+
      (s.type==="food"&&s.halal?'<span class="'+(s.halal==="certified"?'tpTg':'tpTw')+'">'+halalTxt(s.halal).replace(/^\S+\s/,"")+'</span>':'')+(s.ok===0?'<span class="tpTw">'+L("Tidak ditemui di peta, semak","Not found on the map, check")+'</span>':'')+(s.ok===2?'<span class="tpTw">'+L("Lokasi anggaran","Approximate location")+'</span>':'')+(s.ok===3?'<span class="tpTw">'+L("Anggaran: pusat bandar","Approximate: city centre")+'</span>':'')+(s.mine?'<span class="tpTg">'+L("Pilihan anda","Your pick")+'</span>':'')+'</div>'+((s.gaddr||s.addr)?'<small class="mut tpAddr">📍 '+esc(s.gaddr||s.addr)+'</small>':'')+'</div></div>'; }
  return h+'</div><button class="tpRg" data-gm="'+i+':'+k+'" aria-label="Google Maps">📍</button><button class="tpRm" data-sm="'+i+':'+k+'" aria-label="'+esc(L("Lagi","More"))+'">⋯</button></div>'; }
var REP={};
function daysHtml(t){ var h=""; REP=repeats(t);
  t.days.forEach(function(d,i){ var c=cityOf(t,d.city), cur=c.cur||home(), dt=dateOf(t,i);
    h+='<section class="tpDs" data-ds="'+i+'" style="--dc:'+dcol(i)+'"><div class="tpDh"><div><b>'+L("Hari","Day")+' '+(i+1)+'</b> · '+(dt?esc(dateTxt(dt))+' · ':'')+esc(d.city)+(d.title?'<small>'+esc(d.title)+'</small>':'')+'</div><button class="tpRm" data-dm="'+i+'" aria-label="'+esc(L("Pilihan hari","Day options"))+'">⋯</button></div>'+
      (d.move?'<div class="tpMove">🚆 '+esc(d.move)+'</div>':'');
    if(!(d.stops||[]).length) h+='<div class="tpRow"><div class="tpRb mut">'+(jobs[t.id]?'⏳':L("Tiada hentian.","No stops."))+'</div></div>';
    var ss=d.stops||[], prevLL=null, pst=i>0?t.days[i-1].stay:null;
    var s1=ss[0]; if(pst && pst.hotel && s1 && (sig(s1.n).filter(function(w){ return sig(pst.hotel).indexOf(w)>=0; }).length>=2 || (s1.ll && pst.ll && km(s1.ll,pst.ll)<0.15))) pst=null;
    if(pst && pst.hotel){ h+='<div class="tpRow stay start"><div class="tpRt">'+L("Mula","Start")+'</div><span class="tpRn h">🏨</span><span class="tpRi"></span><div class="tpRb"><b>'+esc(pst.hotel)+'</b><small class="mut">'+L("Mula hari dari penginapan","Start the day from your stay")+'</small></div><button class="tpRg" data-hgm="'+(i-1)+'" aria-label="Google Maps">📍</button><span class="tpRm"></span></div>'; prevLL=pst.ll||null; }
    ss.forEach(function(s,k){ var far=0;
      if(s.ll && (s.type==="food" || s.type==="mosque")){ var pv=null, nx=null; for(var a=k-1;a>=0;a--) if(ss[a].ll){ pv=ss[a].ll; break; } for(var b=k+1;b<ss.length;b++) if(ss[b].ll){ nx=ss[b].ll; break; }
        var ds=[pv,nx].filter(Boolean).map(function(p){ return km(p,s.ll); }); if(ds.length && Math.min.apply(null,ds)>10) far=Math.round(Math.min.apply(null,ds)); }
      if(k>0 || prevLL) h+=legHtml(prevLL, s.ll); if(s.ll) prevLL=s.ll; else prevLL=null;
      h+=rowHtml(t,i,k,s,cur,far); });
    if(d.stay && d.stay.hotel) h+='<div class="tpRow stay"><div class="tpRt">'+L("Malam","Night")+'</div><span class="tpRn h">🏨</span><span class="tpRi"></span><div class="tpRb"><b>'+esc(d.stay.hotel)+'</b><small class="mut">'+esc(d.stay.area||"")+(d.stay.price?' · ':'')+'</small>'+(d.stay.price?money(t,d.stay.price,cur,L("semalam","per night")):'')+(d.stay.mine?' <span class="tpTags"><span class="tpTg">📎 '+L("Tempahan anda","Your booking")+'</span></span>':'')+'</div><button class="tpRg" data-hgm="'+i+'" aria-label="Google Maps">📍</button><button class="tpRm" data-hch="'+i+'" aria-label="'+esc(L("Lagi","More"))+'">⋯</button></div>';
    h+='</section>'; });
  return h; }
function dayMenu(t, i){ var ov=H.showSheet(L("Hari","Day")+" "+(i+1)+" · "+esc(t.days[i].city), '<div class="tpMenu"><button data-x="route:'+i+'">🗺 '+L("Laluan hari ini di Google Maps","Today's route in Google Maps")+'</button><button data-x="mosq:'+i+'">🕌 '+L("Masjid berdekatan","Mosques nearby")+'</button><button data-x="halal:'+i+'">🍽 '+L("Makanan halal berdekatan","Halal food nearby")+'</button><button data-x="add:'+i+'">＋ '+L("Tambah tempat","Add a place")+'</button></div>'+
  '<div class="mut small" style="margin:12px 0 6px">✨ '+L("Ubah hari ini dengan AI","Change this day with AI")+'</div><div class="tpChips"><button class="chip" data-x="regen:'+i+'">🔁 '+L("Jana semula","Regenerate")+'</button><button class="chip" data-x="light:'+i+'">🌿 '+L("Lebih santai","Lighter")+'</button><button class="chip" data-x="full:'+i+'">⚡ '+L("Lebih padat","Fuller")+'</button><button class="chip" data-x="rain:'+i+'">☔ '+L("Hari hujan","Rainy day")+'</button><button class="chip" data-x="cheap:'+i+'">🪙 '+L("Lebih jimat","Cheaper")+'</button><button class="chip" data-x="kids:'+i+'">🎢 '+L("Mesra anak","Kid-friendly")+'</button></div>');
  ov.querySelectorAll("[data-x]").forEach(function(b){ b.onclick=function(){ var a=b.getAttribute("data-x").split(":"); H.closeOverlay(); dayAct(getT(t.id)||t, a[0], +a[1]); }; }); }
// the itinerary fills the space between the trip's top bar and the bottom bar, so only its list scrolls (the map stays)
function fitItin(){ var box=EL && EL.querySelector("#tpItin"), v=document.getElementById("view"); if(!box || !v) return;
  v.scrollTop=0; var vr=v.getBoundingClientRect(), top=box.getBoundingClientRect().top-vr.top, pb=parseFloat(getComputedStyle(v).paddingBottom)||0, sh=EL.querySelector("#tpShell");
  var dk=EL.querySelector(".tpDock"), bottom=dk&&dk.offsetHeight?dk.getBoundingClientRect().top-vr.top-6:v.clientHeight-pb-4, h=Math.max(320, bottom-top);
  box.style.height=h+"px"; if(sh){ sh.style.paddingBottom="0"; sh.style.marginBottom=-Math.max(0, top+h+pb-v.clientHeight)+"px"; } box.style.setProperty("--split", (st.split||0.42).toFixed(3)); if(MAP) try{ MAP.resize(); }catch(e){} }
function itinShell(t){ return '<div class="tpItin" id="tpItin"><div class="tpMapW"><div class="tpMap" id="tpMap"></div></div>'+
  '<div class="tpHandle" id="tpHandle"><i></i></div><div class="tpDchips" id="tpDc"></div><div class="tpPane" id="tpPane"></div>'+'<div class="tpWalk" id="tpWalkB"><button type="button" data-walk="-1">‹</button><span id="tpWk">'+L("Ketik satu hentian, atau › untuk menyusuri trip","Tap a stop, or › to walk through the trip")+'</span><button type="button" data-walk="1">›</button></div></div>'; }
function bindItin(){ var hd=EL.querySelector("#tpHandle"), box=EL.querySelector("#tpItin"), pane=EL.querySelector("#tpPane"), y0=0, s0=0, drag=false;
  hd.addEventListener("pointerdown", function(e){ drag=true; y0=e.clientY; s0=st.split||0.42; try{ hd.setPointerCapture(e.pointerId); }catch(x){} });
  hd.addEventListener("pointermove", function(e){ if(!drag) return; st.split=Math.max(0.2,Math.min(0.72,s0+(e.clientY-y0)/Math.max(200,box.clientHeight))); box.style.setProperty("--split", st.split.toFixed(3)); if(MAP) try{ MAP.resize(); }catch(x){} });
  hd.addEventListener("pointerup", function(){ drag=false; }); hd.addEventListener("pointercancel", function(){ drag=false; });
  // scrolling the list follows the day on the map and in the chips
  pane.addEventListener("scroll", function(){ if(st.day<0 || pane._lock) return; var secs=pane.querySelectorAll("[data-ds]"), top=pane.getBoundingClientRect().top+40, cur=0;
    for(var n=0;n<secs.length;n++){ if(secs[n].getBoundingClientRect().top<=top) cur=+secs[n].getAttribute("data-ds"); }
    if(cur!==st.day){ st.day=cur; paintChips(); mapData(); } }, {passive:true});
  window.addEventListener("resize", fitItin); }
function paintChips(){ var t=getT(st.id), dc=EL.querySelector("#tpDc"); if(!t || !dc) return; dc.innerHTML=chipsHtml(t); var on=dc.querySelector(".on"); if(on) dc.scrollLeft=Math.max(0, on.offsetLeft-dc.clientWidth/2+on.offsetWidth/2); }
function goDay(i){ var pane=EL.querySelector("#tpPane"); st.day=i; paintChips(); mapData(i<0); if(!pane) return; var sec=pane.querySelector('[data-ds="'+Math.max(0,i)+'"]');
  pane._lock=1; pane.scrollTop=i<0?0:(sec?sec.offsetTop-pane.offsetTop:0); setTimeout(function(){ pane._lock=0; }, 120); }
function flatStops(t){ var a=[]; t.days.forEach(function(d,i){ (d.stops||[]).forEach(function(s,k){ a.push([i,k]); }); }); return a; }
function openRow(i,k, scroll){ var t=getT(st.id); if(!t) return; st.open=(st.open===i+":"+k && !scroll)?null:i+":"+k; if(st.day!==i){ st.day=i; paintChips(); }
  var pane=EL.querySelector("#tpPane"), y=pane.scrollTop; pane.innerHTML=daysHtml(t); pane.scrollTop=y; mapData(); if(st.open) focusStop(i,k);
  var s=t.days[i].stops[k], wk=EL.querySelector("#tpWk"); if(wk && s) wk.textContent=L("Hari","Day")+" "+(i+1)+" · "+(s.t?s.t+" · ":"")+s.n;
  if(scroll){ var r=pane.querySelector('[data-row="'+i+':'+k+'"]'); if(r){ pane._lock=1; r.scrollIntoView({block:"nearest"}); setTimeout(function(){ pane._lock=0; }, 150); } } }
function walk(dir){ var t=getT(st.id); if(!t) return; var f=flatStops(t); if(!f.length) return; var cur=-1;
  if(st.open) f.forEach(function(x,n){ if(x[0]+":"+x[1]===st.open) cur=n; }); var n2=cur<0?(dir>0?0:f.length-1):Math.max(0,Math.min(f.length-1,cur+dir)); openRow(f[n2][0], f[n2][1], true); }

function halalTxt(h){ return h==="certified"?"✅ "+L("Halal disahkan","Halal certified"):h==="muslim-owned"?"☪ "+L("Milik Muslim","Muslim-owned"):h==="options"?"🍽 "+L("Ada pilihan halal","Halal options"):"⚠ "+L("Semak status halal","Check halal status"); }

// ---------- budget ----------
function costs(t){ var ppl=(t.ad||1)+(t.kd||0), rooms=Math.max(1,Math.ceil((t.ad||1)/2)), L0=[], total=0, miss=0;
  var add=function(k, ic, name, v, cur, sub){ if(!(v>0)) return; var h=toHome(t,v,cur); if(h==null){ miss++; } else total+=h; L0.push({k:k, ic:ic, n:name, v:v, cur:cur, h:h, sub:sub}); };
  var fl=0; (t.flights||[]).forEach(function(f){ fl+=f.price||0; }); add("fl","✈️",L("Penerbangan","Flights"), fl*ppl, home(), ppl+" × "+fmtM(fl,home()));
  var by={}; t.days.forEach(function(d,i){ var c=cityOf(t,d.city), cur=c.cur||home(), k=c.n+"|"+cur; by[k]=by[k]||{c:c, cur:cur, nights:0, stay:0, days:0, ent:0};
    var b=by[k]; b.days++; if(d.stay && d.stay.price && i<t.days.length-1){ b.nights++; b.stay+=d.stay.price*rooms; } (d.stops||[]).forEach(function(s){ b.ent+=(s.type==="food"?0:s.price||0)*ppl; }); });
  Object.keys(by).forEach(function(k){ var b=by[k], dl=(t.daily||{})[b.c.n.toLowerCase()]||{};
    add("st","🏨",L("Penginapan","Stay")+" · "+b.c.n, b.stay, b.cur, b.nights+" "+L("malam","nights")+" × "+rooms+" "+L("bilik","room(s)"));
    add("fd","🍽",L("Makan","Food")+" · "+b.c.n, (dl.food||0)*ppl*b.days, b.cur, b.days+" "+L("hari","days")+" × "+ppl+" "+L("orang","people"));
    add("tr","🚆",L("Pengangkutan","Transport")+" · "+b.c.n, (dl.transport||0)*ppl*b.days, b.cur, b.days+" "+L("hari","days"));
    add("en","🎟",L("Tiket masuk","Entry tickets")+" · "+b.c.n, b.ent, b.cur, ppl+" "+L("orang","people")); });
  return {lines:L0, total:total, miss:miss, ppl:ppl}; }
// 0.7.34 (owner): the Checklist tab: every item is an editable box with a tick on the left and ＋ on the right (adds a line under it);
// an emptied box is removed. The trip keeps its own copy (t.ckl) once anything is changed.
function ckl(t){ if(t.ckl) return t.ckl; return checklist(t).map(function(g){ return {g:g[0], ic:g[1], n:g[2], it:g[3].map(function(x){ return {k:x[0], x:x[1]}; })}; }); }
function bookHtml(t){ var C=t.chk||{};
  return ckl(t).map(function(g, gi){ var dn=g.it.filter(function(x){ return C[x.k]; }).length;
    return '<details class="card tpCat tpCkG" open><summary><b>'+g.ic+' '+esc(L(g.n[0],g.n[1]))+'</b><span class="tpCatT'+(dn===g.it.length&&dn?' ok':'')+'">'+dn+'/'+g.it.length+'</span></summary>'+
      g.it.map(function(x, ii){ return '<div class="tpCkI"><input type="checkbox" data-chk="'+esc(x.k)+'"'+(C[x.k]?' checked':'')+'><input class="rin tpCkT" data-ckt="'+gi+':'+ii+'" value="'+esc(x.x)+'"><button class="tpCkDel" data-ckd="'+gi+':'+ii+'" aria-label="'+esc(L("Padam","Delete"))+'">✕</button><span class="tpCkDrag" data-ckg="'+gi+':'+ii+'" aria-label="'+esc(L("Seret untuk susun","Drag to reorder"))+'">≡</span></div>'; }).join("")+
      '<button class="tpCkNew" data-cka="'+gi+':'+(g.it.length-1)+'">＋ '+L("Tambah","Add")+'</button></details>'; }).join(""); }
// 0.7.40 (owner): drag ≡ to reorder items inside a group
function cklDrag(e, h){ try{ var ae=document.activeElement; if(ae && ae.matches && ae.matches("[data-ckt]")) ae.blur(); }catch(x){}   // save what was being typed first, at its own place
  var row=h.closest(".tpCkI"), grp=row.parentNode, q=h.getAttribute("data-ckg").split(":"), gi=+q[0], from=+q[1], y0=e.clientY, moved=false;
  try{ h.setPointerCapture(e.pointerId); }catch(x){} row.classList.add("drag");
  var mv=function(ev){ var dy=ev.clientY-y0; if(Math.abs(dy)>3) moved=true; row.style.transform="translateY("+dy+"px)";
    var rows=[].slice.call(grp.querySelectorAll(".tpCkI")), y=ev.clientY; rows.forEach(function(r){ r.classList.remove("over"); }); var tgt=rows.filter(function(r){ var b=r.getBoundingClientRect(); return r!==row && y>b.top && y<b.bottom; })[0]; if(tgt) tgt.classList.add("over"); };
  var up=function(ev){ h.removeEventListener("pointermove", mv); h.removeEventListener("pointerup", up); h.removeEventListener("pointercancel", up); row.classList.remove("drag"); row.style.transform="";
    var rows=[].slice.call(grp.querySelectorAll(".tpCkI")), y=ev.clientY, to=-1; rows.forEach(function(r,n){ r.classList.remove("over"); var b=r.getBoundingClientRect(); if(y>b.top && y<b.bottom) to=n; });
    if(!moved) return; if(to<0) to=y<rows[0].getBoundingClientRect().top?0:rows.length-1; if(to===from) return;
    var t=getT(st.id); if(!t) return; var L0=JSON.parse(JSON.stringify(ckl(t))), it=L0[gi].it, x=it.splice(from,1)[0]; it.splice(to,0,x); t.ckl=L0; putT(t); drawTrip(); };
  h.addEventListener("pointermove", mv); h.addEventListener("pointerup", up); h.addEventListener("pointercancel", up); }
function cklEdit(t, gi, ii, v){ var L0=JSON.parse(JSON.stringify(ckl(t))), g=L0[gi]; if(!g) return; v=str(v);
  if(ii>=0 && g.it[ii]){ if(v) g.it[ii].x=v.slice(0,120); else { if(t.chk) delete t.chk[g.it[ii].k]; g.it.splice(ii,1); } }
  t.ckl=L0; putT(t); }
function cklAdd(t, gi, ii){ var L0=JSON.parse(JSON.stringify(ckl(t))), g=L0[gi]; if(!g) return; g.it.splice(ii+1, 0, {k:"u"+rid(), x:""}); t.ckl=L0; putT(t); drawTrip();
  var e=EL.querySelector('[data-ckt="'+gi+':'+(ii+1)+'"]'); if(e) e.focus(); }
// 0.7.24 (owner): the checklist in groups (keys kept from before, so old ticks stay)
function domestic(t){ var c=t.cities||[]; return !!c.length && c.every(function(x){ return x.cur===home(); }); }
function checklist(t){ var loc=domestic(t), g=[
  ["doc","🛂",["Dokumen","Documents"],[["pp",L("Pasport sah lebih 6 bulan","Passport valid 6+ months")],["visa",L("Visa / kebenaran masuk (semak)","Visa / entry permit (check)")],["fl",L("Tiket penerbangan","Flight tickets")],["ht",L("Tempahan hotel","Hotel bookings")],["ins",L("Insurans perjalanan","Travel insurance")],["copy",L("Salinan dokumen dalam telefon","Copies of documents on the phone")],["idp",L("Lesen memandu antarabangsa (jika memandu)","International driving permit (if driving)")]]],
  ["money","💳",["Wang","Money"],[["cash",L("Tunai mata wang tempatan","Local cash")],["card",L("Kad untuk luar negara","A card that works abroad")],["bank",L("Maklumkan bank / aktifkan guna luar negara","Tell the bank / turn on overseas use")],["emg",L("Wang kecemasan berasingan","Separate emergency money")]]],
  ["pray","🕌",["Ibadah","Prayer"],[["pray",L("Sejadah & telekung / kain","Prayer mat & telekung / sarong")],["qib",L("Kiblat & waktu solat di app ini","Qibla & prayer times in this app")],["wudu",L("Botol air untuk wuduk","Water bottle for wudu")],["jamak",L("Fahami jamak & qasar","Know jamak & qasar")]]],
  ["health","💊",["Kesihatan","Health"],[["med",L("Ubat-ubatan","Medicines")],["aid",L("Peti pertolongan cemas kecil","Small first-aid kit")],["vac",L("Vaksin / syarat kesihatan (semak)","Vaccines / health rules (check)")]]],
  ["pack","🧳",["Barang","Packing"],[["clo",L("Pakaian ikut cuaca","Clothes for the weather")],["shoe",L("Kasut selesa berjalan","Comfortable walking shoes")],["umb",L("Payung / jaket","Umbrella / jacket")],["toil",L("Kelengkapan diri","Toiletries")],["plug",L("Palam penyesuai","Plug adapter")],["pwr",L("Power bank","Power bank")]]],
  ["tech","📶",["Telefon & internet","Phone & internet"],[["sim",L("SIM / eSIM / roaming","SIM / eSIM / roaming")],["off",L("Muat turun peta luar talian","Download offline maps")],["tr",L("App terjemahan","Translation app")],["share",L("Kongsi pelan trip dengan keluarga","Share the trip plan with family")]]],
  ["home","🏠",["Sebelum keluar rumah","Before leaving home"],[["lock",L("Kunci rumah, tutup gas & suis","Lock up, gas and switches off")],["mail",L("Minta jiran / keluarga pantau rumah","Ask a neighbour / family to check the house")],["air",L("Tiba di lapangan terbang 3 jam awal","At the airport 3 hours early")]]]];
  if(t.kd) g.push(["kid","🧒",["Anak-anak","Children"],[["kid",L("Keperluan anak (stroller, snek)","Kids' things (stroller, snacks)")],["kdoc",L("Dokumen anak (pasport, surat beranak)","Children's documents (passport, birth cert)")],["kfun",L("Mainan / hiburan dalam perjalanan","Toys / entertainment for the journey")]]]);
  if(loc){ var out={pp:1, visa:1, idp:1, bank:1, plug:1, tr:1, vac:1}; g.forEach(function(x){ x[3]=x[3].filter(function(y){ return !out[y[0]]; }).map(function(y){ return y[0]==="card"?[y[0],L("Kad debit / e-dompet","Debit card / e-wallet")]:y[0]==="sim"?[y[0],L("Data telefon mencukupi","Enough mobile data")]:y[0]==="air"?[y[0],L("Tiba di lapangan terbang 1½ jam awal","At the airport 1½ hours early")]:y; }); }); }
  return g; }

// ---------- map ----------
function killMap(){ if(MAP){ try{ MAP.remove(); }catch(e){} MAP=null; } }
function loadMap(cb){ if(window.maplibregl){ cb(true); return; } ["umrah/maplibre-gl.css"].forEach(function(f){ if(!document.querySelector('link[href="'+f+'"]')){ var l=document.createElement("link"); l.rel="stylesheet"; l.href=f; document.head.appendChild(l); } });
  var fs=["umrah/maplibre-gl.js","umrah/umrah_world.js"], i=0, nx=function(){ if(i>=fs.length){ cb(!!window.maplibregl); return; } if(fs[i]==="umrah/umrah_world.js" && window.UMRAH_WORLD){ i++; nx(); return; } var s=document.createElement("script"); s.src=fs[i++]; s.onload=nx; s.onerror=nx; document.body.appendChild(s); }; nx(); }
function offStyle(){ return {version:8, sources:{w:{type:"geojson", data:window.UMRAH_WORLD||{type:"FeatureCollection",features:[]}}}, layers:[{id:"bg",type:"background",paint:{"background-color":"#a9cbe0"}},{id:"land",type:"fill",source:"w",paint:{"fill-color":"#efe9dc"}},{id:"bord",type:"line",source:"w",paint:{"line-color":"#b9ad95","line-width":0.6}}]}; }
function updStat(){ var e=EL && EL.querySelector("#tpStat"), t=getT(st.id); if(!e || !t) return; var j=jobs[t.id], err=j&&j.err, busy=(j&&!j.err)||jobs[t.id+"r"]||jobs[t.id+"w"]||(MAP&&!MAP._ready)||(!MAP&&window.maplibregl&&EL.querySelector("#tpMap")&&!EL.querySelector(".tpNoMap"));
  var k=err?"r":busy?"y":"g"; e.className="tpStat "+k; e.title=err?L("Ralat","Error"):busy?L("Sedang diproses…","Working…"):L("Siap","Done"); e.innerHTML=k==="g"?"✓":k==="r"?"!":""; }
function mapInit(t){ var box=EL.querySelector("#tpMap"); MAP=null; if(!box) return;
  box.innerHTML='<div class="tpMapBtn"><button type="button" data-k="fit" aria-label="Fit">⤢</button><button type="button" data-k="mapr" aria-label="Route">🧭</button></div><div class="tpMapNote" id="tpMapN"></div>';
  loadMap(function(ok){ if(!document.body.contains(box)) return; if(!ok){ box.insertAdjacentHTML("beforeend",'<div class="tpNoMap">'+L("Peta tidak tersedia","Map not available")+'</div>'); return; }
    var t1=getT(st.id)||t, c=(t1.cities||[])[0], c0=c&&c.lat?[c.lat,c.lon]:[3.14,101.69], want=navigator.onLine===false?"offline":"online", loaded=false, tm=0, M;
    try{ M=new maplibregl.Map({container:box, style:want==="online"?"https://tiles.openfreemap.org/styles/liberty":offStyle(), center:[c0[1],c0[0]], zoom:11, attributionControl:false, maxPitch:0, dragRotate:false, fadeDuration:0}); }
    catch(e){ box.insertAdjacentHTML("beforeend",'<div class="tpNoMap">'+L("Telefon ini tidak dapat melukis peta (WebGL).","This phone cannot draw the map (WebGL).")+'</div>'); return; }
    MAP=M; M._mk=[]; M._fit=1; M.touchZoomRotate.disableRotation(); M.addControl(new maplibregl.AttributionControl({compact:true, customAttribution:"© OpenStreetMap"}));
    var off=function(){ if(loaded) return; want="offline"; clearTimeout(tm); try{ M.setStyle(offStyle()); }catch(e){} };
    M.on("style.load", function(){ if(want==="online") loaded=true; M._ready=1; mapData(); updStat(); }); M.on("error", function(){ if(!loaded && want==="online") off(); });
    if(want==="online") tm=setTimeout(off, 8000);
    box.addEventListener("click", function(ev){ var a=ev.target.closest("[data-gm]"); if(!a || a.tagName!=="A") return; ev.preventDefault(); ev.stopPropagation(); var q=a.getAttribute("data-gm").split(":"), tt=getT(st.id); if(tt) gmaps(tt, +q[0], +q[1]); });
    mapData(); }); }
// the selected day's numbered pins, its hotel and route line; other days stay off the map
function mapData(fit){ var M=MAP, t=getT(st.id); if(!M || !t || !t.days.length) return; var all=st.day<0, i=all?0:Math.max(0,Math.min(t.days.length-1, st.day)), d=t.days[i];
  (M._mk||[]).forEach(function(m){ m.remove(); }); M._mk=[]; M._mi={};
  var pts=[], line={type:"FeatureCollection", features:[]};
  t.days.forEach(function(dd,di){ if(!all && di!==i) return; var cs=[], pst=di>0?t.days[di-1].stay:null;
    if(pst && pst.hotel && pst.ll){ cs.push([pst.ll[1],pst.ll[0]]); if(!all) pts.push({ll:pst.ll, i:di-1, k:-1, s:{n:pst.hotel}}); }
    (dd.stops||[]).forEach(function(s,k){ if(s.ll){ pts.push({ll:s.ll, i:di, k:k, s:s}); cs.push([s.ll[1],s.ll[0]]); } }); if(dd.stay && dd.stay.ll && (!all || !dd.stay.hotel || !t.days[di+1] || t.days[di+1].stay.hotel!==dd.stay.hotel)) pts.push({ll:dd.stay.ll, i:di, k:-1, s:{n:dd.stay.hotel}});
    if(cs.length>1) line.features.push({type:"Feature", properties:{c:dcol(di)}, geometry:{type:"LineString", coordinates:cs}}); });
  pts.forEach(function(p){ var e=document.createElement("div"); e.className="tpPin"+(p.k<0?" h":"")+(st.open===p.i+":"+p.k?" on":""); e.style.background=dcol(p.i); e.textContent=p.k<0?"🏨":p.k+1;
    e.addEventListener("click", function(ev){ if(p.k<0) return; ev.stopPropagation(); openRow(p.i, p.k, true); });
    var pop=new maplibregl.Popup({offset:14, closeButton:false}).setHTML('<b>'+esc(p.s.n)+'</b>'+(p.s.t?'<br><small>'+L("Hari","Day")+' '+(p.i+1)+' · '+esc(p.s.t)+'</small>':'')+'<br><a href="#" data-gm="'+p.i+':'+p.k+'">📍 Google Maps</a>');
    var mk=new maplibregl.Marker({element:e}).setLngLat([p.ll[1],p.ll[0]]).setPopup(pop).addTo(M); M._mk.push(mk); M._mi[p.i+":"+p.k]=mk; });
  // 0.7.25: draw whenever the style is ready (isStyleLoaded() stays false while tiles load, which skipped every day after the first)
  try{ var src=M.getSource("tpL"); if(src) src.setData(line); else if(M._ready){ M.addSource("tpL",{type:"geojson",data:line}); M.addLayer({id:"tpL",type:"line",source:"tpL",paint:{"line-color":["get","c"],"line-width":3,"line-opacity":0.8,"line-dasharray":[2,1.5]}}); } }catch(e){}
  // 0.7.26 (owner): the leg from the current stop (the one opened, else the day's first) to the next stop is always a solid line
  var cur=null; if(st.open){ var qo=st.open.split(":"); if(all || +qo[0]===i) cur=[+qo[0], +qo[1]]; } if(!cur && !all) cur=[i, -1];
  var leg={type:"FeatureCollection", features:[]}; if(cur && t.days[cur[0]]){ var sl=t.days[cur[0]].stops||[], a0=null, b0=null;
    if(cur[1]===-1){ var ps0=cur[0]>0?t.days[cur[0]-1].stay:null; if(ps0 && ps0.hotel && ps0.ll) a0=ps0.ll; cur[1]=0; }   // the day starts at last night's hotel
    for(var x=cur[1]; x<sl.length; x++){ if(sl[x] && sl[x].ll){ if(!a0) a0=sl[x].ll; else { b0=sl[x].ll; break; } } }
    if(a0 && !b0){ var sy=t.days[cur[0]].stay; if(sy && sy.ll) b0=sy.ll; }   // the last stop leads to that night's hotel
    if(a0 && b0) leg.features.push({type:"Feature", properties:{c:dcol(cur[0])}, geometry:{type:"LineString", coordinates:[[a0[1],a0[0]],[b0[1],b0[0]]]}}); }
  try{ var src2=M.getSource("tpLc"); if(src2) src2.setData(leg); else if(M._ready){ M.addSource("tpLc",{type:"geojson",data:leg}); M.addLayer({id:"tpLcB",type:"line",source:"tpLc",layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#ffffff","line-width":9,"line-opacity":0.95}}); M.addLayer({id:"tpLc",type:"line",source:"tpLc",layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":["get","c"],"line-width":5,"line-opacity":1}}); }
    if(M.getLayer("tpLcB")){ M.moveLayer("tpLcB"); M.moveLayer("tpLc"); } }catch(e){}
  var key=(all?"a":i)+":"+pts.length, dayKey=all?"a":String(i), first=M._key===undefined, sameDay=String(M._key).split(":")[0]===dayKey;
  // 0.7.32 (owner): a new day continues from where the last one ended (its start = last night's hotel): pan there, keep the zoom
  if(!fit && !first && !all && !sameDay){ M._key=key; var sp=null, pst2=i>0?t.days[i-1].stay:null; if(pst2 && pst2.ll) sp=pst2.ll; else if(pts[0]) sp=pts[0].ll;
    if(sp) M.easeTo({center:[sp[1],sp[0]], zoom:Math.max(M.getZoom(), 13), duration:500}); }
  else if(fit || first || (all && M._key!==key) || (sameDay && (M._fitN||0)<2 && pts.length>(M._fitN||0))){ M._key=key; M._fitN=pts.length;
    if(pts.length>1){ var b=new maplibregl.LngLatBounds(); pts.forEach(function(p){ b.extend([p.ll[1],p.ll[0]]); }); try{ M.fitBounds(b,{padding:36, maxZoom:15, duration:fit?400:0}); }catch(e){} }
    else if(pts.length===1) M.jumpTo({center:[pts[0].ll[1],pts[0].ll[0]], zoom:14});
    else { var c=cityOf(t, d.city); if(c.lat) M.jumpTo({center:[c.lon,c.lat], zoom:11}); } }
  var miss=0; t.days.forEach(function(dd,di){ if(all || di===i) (dd.stops||[]).forEach(function(s){ if(!s.ll) miss++; }); }); var n=EL.querySelector("#tpMapN");
  if(n) n.textContent=miss?(jobs[t.id+"r"]?"⏳ "+L("Menyemak tempat…","Checking places…"):"⚠ "+miss+" "+L("tiada di peta","not on the map")):""; }
function focusStop(i,k){ var t=getT(st.id), s=t&&t.days[i]&&t.days[i].stops[k]; if(!MAP || !s || !s.ll) return; MAP.flyTo({center:[s.ll[1],s.ll[0]], zoom:15}); var m=(MAP._mi||{})[i+":"+k]; if(m && m.getPopup && !m.getPopup().isOpen()) m.togglePopup(); }

// ---------- Google Maps ----------
function openU(u){ if(window.Native && H.N.openUrl) H.N.openUrl(u); else window.open(u, "_blank"); }
function gmUrl(name, city, ll){ return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(name+(city?", "+city:""))+(ll?"&center="+ll[0]+","+ll[1]:""); }
function gq(s, c){ var a=s.gaddr||s.addr||""; return s.n+(a && a.toLowerCase().indexOf(String(s.n).toLowerCase())<0 ? ", "+a : (c&&c.n?", "+c.n:"")); }
function nextLL(t, i, k){ var ss=t.days[i].stops||[]; for(var a=k+1;a<ss.length;a++) if(ss[a].ll && ss[a].type!=="transport") return ss[a].ll; var sy=t.days[i].stay; return sy&&sy.ll||null; }
function gmaps(t, i, k){ var s0=k>=0&&t.days[i]&&t.days[i].stops[k];
  if(s0 && s0.type==="transport" && s0.ll){ var to=nextLL(t,i,k); if(to){ openU("https://www.google.com/maps/dir/?api=1&origin="+s0.ll[0]+","+s0.ll[1]+"&destination="+to[0]+","+to[1]+"&travelmode=driving"); return; } }   // a taxi / transfer opens its route from the pick-up point
  gmaps0(t, i, k); }
function gmaps0(t, i, k){ var d=t.days[i], c=cityOf(t,d.city), s=k<0?{n:d.stay.hotel, ll:d.stay.ll, gaddr:d.stay.gaddr, addr:d.stay.area?d.stay.area+", "+c.n:""}:d.stops[k]; if(!s) return; var ll=s.ll||(c.lat?[c.lat,c.lon]:null), q=gq(s,c);
  if(window.Native && H.N.openMaps && ll) H.N.openMaps(q, ll[0], ll[1]); else openU("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q)); }
function dayRoute(t, i){ var d=t.days[i], c=cityOf(t,d.city), pts=(d.stops||[]).filter(function(s){ return s.type!=="transport" || s.ll; });
  var q=function(s){ return s.ll ? s.ll[0]+","+s.ll[1] : encodeURIComponent(s.n+", "+c.n); };
  if(!pts.length){ H.toast(L("Tiada tempat","No places")); return; } if(pts.length===1){ gmaps(t,i,d.stops.indexOf(pts[0])); return; }
  var mid=pts.slice(1,-1).slice(0,8); openU("https://www.google.com/maps/dir/?api=1&origin="+q(pts[0])+"&destination="+q(pts[pts.length-1])+(mid.length?"&waypoints="+mid.map(q).join("%7C"):"")); }
function nearby(t, i, what){ var d=t.days[i], c=cityOf(t,d.city), s=(d.stops||[]).filter(function(x){ return x.ll; })[0], ll=s?s.ll:[c.lat,c.lon];
  if(window.Native && H.N.openMaps) H.N.openMaps(what, ll[0], ll[1]); else openU("https://www.google.com/maps/search/"+encodeURIComponent(what)+"/@"+ll[0]+","+ll[1]+",14z"); }

// ---------- clicks ----------
function onTripClick(e, t){ var wd=e.target.closest && e.target.closest("[data-wxd]"); if(wd){ wxTip(getT(t.id)||t, +wd.getAttribute("data-wxd")); return; }
  var b=e.target.closest("button,[data-tab2],input[data-chk]");
  if(!b){ var rw=e.target.closest("[data-row]"); if(rw){ var q0=rw.getAttribute("data-row").split(":"); openRow(+q0[0], +q0[1]); } return; } t=getT(t.id)||t; var a;
  if(b.hasAttribute("data-chk")){ t.chk=t.chk||{}; t.chk[b.getAttribute("data-chk")]=b.checked?1:0; putT(t); var gp=b.closest("details"); if(gp){ var all=gp.querySelectorAll("[data-chk]"), n=0; [].forEach.call(all, function(x){ if(x.checked) n++; }); var ct=gp.querySelector(".tpCatT"); if(ct){ ct.textContent=n+"/"+all.length; ct.classList.toggle("ok", n===all.length); } } return; }
  if((a=b.getAttribute("data-pe"))){ priceSheet(t, a); return; }
  if((a=b.getAttribute("data-ckd"))){ var qd=a.split(":"); cklEdit(t, +qd[0], +qd[1], ""); drawTrip(); return; }
  if((a=b.getAttribute("data-cka"))){ var qa=a.split(":"); cklAdd(t, +qa[0], +qa[1]); return; }
  if((a=b.getAttribute("data-tab")) || (a=b.getAttribute("data-tab2"))){ st.tab=a; drawTrip(); return; }
  if((a=b.getAttribute("data-day"))!=null){ goDay(+a); return; }
  if((a=b.getAttribute("data-gday"))!=null){ st.day=+a; st.tab="itin"; drawTrip(); setTimeout(function(){ goDay(+a); }, 30); return; }
  if((a=b.getAttribute("data-walk"))){ walk(+a); return; }
  if((a=b.getAttribute("data-goto"))){ var qg=a.split(":"); st.tab="itin"; st.day=+qg[0]; st.open=+qg[1]>=0?a:null; drawTrip(); setTimeout(function(){ goDay(+qg[0]); if(+qg[1]>=0) openRow(+qg[0], +qg[1], true); }, 60); return; }
  if((a=b.getAttribute("data-dm"))!=null){ dayMenu(t, +a); return; }
  if((a=b.getAttribute("data-gm"))){ var q=a.split(":"); gmaps(t, +q[0], +q[1]); return; }
  if((a=b.getAttribute("data-hgm"))!=null){ gmaps(t, +a, -1); return; }
  if((a=b.getAttribute("data-hbk"))!=null){ var d0=t.days[+a], dt=dateOf(t,+a); openU("https://www.google.com/travel/hotels?q="+encodeURIComponent(d0.stay.hotel+" "+d0.city)+(dt?"&checkin="+ymd(dt)+"&checkout="+ymd(addD(dt,1)):"")); return; }
  if((a=b.getAttribute("data-hch"))!=null){ hotelSheet(t, +a); return; }
  if((a=b.getAttribute("data-sm"))){ var q3=a.split(":"); stopMenu(t, +q3[0], +q3[1]); return; }
  if((a=b.getAttribute("data-add"))){ var kd=a; factSheet(kd, factIc(kd)+" "+factName(kd), factHint(kd), function(x){ addFact(t, x); }); return; }
  if((a=b.getAttribute("data-fdel"))!=null){ t.facts.splice(+a,1); putT(t); drawTrip(); return; }
  if((a=b.getAttribute("data-dk"))){ dayAct(t, a.split(":")[0], +a.split(":")[1]); return; }
  var k=b.getAttribute("data-k"); if(!k) return;
  if(k==="back") back();
  else if(k==="errx"){ delete jobs[t.id]; drawTrip(); }
  else if(k==="retry"){ delete jobs[t.id]; if((t.days||[]).length && (t.cities||[]).length) completeTrip(t); else build(t, (t.days||[]).length?0:null); }
  else if(k==="fill"){ delete jobs[t.id]; completeTrip(t); }
  else if(k==="aiset"){ if(H.aiSettings) H.aiSettings(); }
  else if(k==="menu") tripMenu(t);
  else if(k==="share") exportSheet(t);
  else if(k==="cur") curSheet();
  else if(k==="fit") mapData(true);
  else if(k==="mapr") dayRoute(t, Math.max(0,st.day));
  else if(k==="route" || k==="edit") editSheet(t);
  else if(k==="dates") datesSheet(t);
  else if(k==="fsearch"){ var f=(t.flights||[])[0], dd=parseYmd(t.start); openU("https://www.google.com/travel/flights?q="+encodeURIComponent("Flights "+(f?f.from+" to "+f.to:"from "+(t.from||"KUL")+" to "+t.dest)+(dd?" on "+ymd(dd):""))); }
  else if(k==="ask"){ var v=str((EL.querySelector("#tpAsk")||{}).value); if(!v){ H.toast(L("Taip permintaan atau tempahan dahulu","Type a change or a booking first")); return; } if(busyT(t)) return;
    var clr=function(){ var e0=EL.querySelector("#tpAsk"); if(e0) e0.value=""; }, urls=v.match(/https?:\/\/\S+/g)||[];
    var booking=urls.length || /\b[A-Z0-9]{2}\s?\d{2,4}\b|booking|tempahan|reservation|confirm|check-?in|PNR|\bref\b|\d{1,2}[:.]\d{2}.*(→|->|to)|hotel .*(night|malam)/i.test(v);
    if(urls.length){ jobs[t.id]={msg:L("Membuka pautan…","Opening the link…"), pct:10}; drawTrip(); Promise.all(urls.slice(0,3).map(readLink)).then(function(r){ delete jobs[t.id]; clr(); addFact(getT(t.id)||t, {k:"auto", txt:(v.replace(/https?:\/\/\S+/g,"").trim()+"\n"+r.join("\n")).slice(0,1500), at:Date.now()}); }); }
    else if(booking){ clr(); addFact(t, {k:"auto", txt:v.slice(0,1500), at:Date.now()}); }
    else { clr(); patch(t, v); } }
  else if(k==="askshot"){ factSheet("other", "📎 "+L("Lampir untuk AI","Attach for AI"), factHint("place"), function(x){ var v=str((EL.querySelector("#tpAsk")||{}).value); addFact(t, x, v); }); }
  else if(k.indexOf("sty:")===0){ if(busyT(t)) return; var s2=k.slice(4); if(s2===t.style){ return; } t.style=s2; putT(t); patch(t, "Change the trip style to "+STYLE[s2][2]+". Update hotels (and their prices), transport, restaurants and the daily costs to match. Return every day."); }
  else if(k==="fadd"){ var fv=str((EL.querySelector("#tpFact")||{}).value); if(!fv){ H.toast(L("Taip butiran, tampal pautan, atau pilih tangkapan skrin","Type details, paste a link, or pick a screenshot")); return; } if(busyT(t)) return;
    var urls=fv.match(/https?:\/\/\S+/g)||[], addIt=function(txt){ var fe=EL.querySelector("#tpFact"); if(fe) fe.value=""; addFact(t, {k:"auto", txt:txt.slice(0,1500), at:Date.now()}); };
    if(urls.length){ jobs[t.id]={msg:L("Membuka pautan…","Opening the link…"), pct:10}; drawTrip(); Promise.all(urls.slice(0,3).map(readLink)).then(function(r){ delete jobs[t.id]; addIt(fv.replace(/https?:\/\/\S+/g,"").trim()+"\n"+r.join("\n")); }); } else addIt(fv); }
  else if(k==="fshot"){ if(busyT(t)) return; var typed=str((EL.querySelector("#tpAsk")||{}).value); pickImg(function(d){ jobs[t.id]={msg:L("AI sedang membaca gambar…","AI is reading the picture…"), pct:15}; drawTrip();
    readShot(d).then(function(j){ delete jobs[t.id]; var tx=str(j.text); if(!tx){ H.toast(L("Tiada butiran dalam gambar","No details found in the picture")); drawTrip(); return; } var fe=EL.querySelector("#tpAsk"); if(fe) fe.value=""; addFact(getT(t.id)||t, {k:j.kind||"auto", txt:((typed?typed+"\n":"")+tx).slice(0,1500), at:Date.now(), shot:1}); })
    .catch(function(e){ jobs[t.id]={err:errTxt(e), soft:1}; drawTrip(); }); }); }
  else if(k==="split"){ if(H.goSplit) H.goSplit(); }
}
function busyT(t){ if(jobs[t.id] && !jobs[t.id].err){ H.toast(L("Tunggu, AI sedang bekerja…","Wait, the AI is still working…")); return true; } delete jobs[t.id]; return false; }
function addFact(t, x, extra){ t=getT(t.id)||t; t.facts=t.facts||[]; t.facts.push(x); putT(t); if(busyT(t)) return;
  var why=x.k==="flight"?"The person added these flight details. Use these exact flights (replace the flights list, price 0 if unknown) and fit day 1 and the last day to the arrival and departure times."
    :(x.k==="auto"||x.k==="other")?"The person added this booking or detail (it may be a flight, a hotel, a restaurant, an activity or any place). Work out what it is and use it: flights replace the flights list and fit day 1 / the last day to their times; a hotel becomes the stay for the matching nights; a restaurant or place goes on the most sensible day and time near the other stops."
    :x.k==="hotel"?"The person booked or chose this stay. Use it as the stay for the matching nights (or the whole trip if no dates), and re-order nearby days around its location."
    :"The person wants this place / detail in the trip. Put it on the most sensible day and time (replace a similar stop rather than overloading the day).";
  patch(t, why+"\nDetails: "+x.txt+(extra?"\nAlso: "+extra:""), function(ok){ if(!ok) return; var c=getT(t.id); if(!c) return; var nm=(x.txt.split(/[\n·,.]/)[0]||"").toLowerCase().slice(0,25);
    if(x.k!=="flight" && nm.length>3) c.days.forEach(function(d){ (d.stops||[]).forEach(function(s){ if(s.n.toLowerCase().indexOf(nm)>=0 || nm.indexOf(s.n.toLowerCase())>=0) s.mine=1; }); if(x.k==="hotel" && d.stay && (d.stay.hotel.toLowerCase().indexOf(nm)>=0 || nm.indexOf(d.stay.hotel.toLowerCase())>=0)) d.stay.mine=1; });
    putT(c); draw(); }); }
function dayAct(t, a, i){
  if(a==="route"){ dayRoute(t,i); return; } if(a==="mosq"){ nearby(t,i,"mosque"); return; } if(a==="halal"){ nearby(t,i,"halal restaurant"); return; }
  if(a==="add"){ addStopSheet(t,i); return; }
  if(busyT(t)) return;
  var X={regen:"Make a fresh plan for this day with different ideas.", light:"Make this day lighter: fewer stops, more rest, an easy pace.", full:"Make this day fuller: add more good stops nearby without rushing.", rain:"Make this a rainy-day version: mostly indoor places.", cheap:"Make this day cheaper: free sights, cheaper halal food, public transport.", kids:"Make this day kid-friendly: parks, interactive museums, short walks, early dinner."}[a];
  var id=t.id; jobs[id]={msg:L("AI sedang mengubah hari "+(i+1)+"…","AI is changing day "+(i+1)+"…"), pct:40}; drawTrip();
  ai(daysPrompt(t, i, i, X), 6000).then(function(j){ var cur=getT(id)||t, d=(j.days||[]).filter(function(x){ return Math.round(num(x.d))===i+1; })[0]||(j.days||[])[0]; if(d){ var nd=normDay(d, cur.days[i]); nd.city=cur.days[i].city; nd.title=cur.days[i].title; nd.stay=cur.days[i].stay;
      var keep=cur.days[i].stops.filter(function(s){ return s.lock && !nd.stops.some(function(x){ return x.n.toLowerCase()===s.n.toLowerCase(); }); }); nd.stops=nd.stops.concat(keep).sort(byTime); cur.days[i]=nd; }
    putT(cur); delete jobs[id]; resolve(cur); drawTrip(); })
  .catch(function(e){ jobs[id]={err:errTxt(e), soft:1}; drawTrip(); }); }
function stopMenu(t, i, k){ var s=t.days[i].stops[k]; if(!s) return;
  var ov=H.showSheet(esc(s.n), '<div class="tpMenu">'+
    '<button data-m="gm">📍 '+L("Buka di Google Maps (ulasan)","Open in Google Maps (reviews)")+'</button>'+
    '<button data-m="swap">🔁 '+L("Tukar: AI cadang 3 pilihan","Swap: AI suggests 3 options")+'</button>'+
    '<button data-m="mine">📎 '+L("Ganti dengan tempat saya (nama, pautan, gambar)","Replace with my own place (name, link, screenshot)")+'</button>'+
    '<button data-m="edit">✏️ '+L("Ubah nama / masa / nota","Edit name / time / note")+'</button>'+
    '<button data-m="move">↕ '+L("Pindah ke hari lain","Move to another day")+'</button>'+
    (k>0?'<button data-m="up">⬆ '+L("Naik","Move up")+'</button>':'')+(k<t.days[i].stops.length-1?'<button data-m="down">⬇ '+L("Turun","Move down")+'</button>':'')+
    '<button data-m="lock">'+(s.lock?'🔓 '+L("Buka kunci","Unlock"):'🔒 '+L("Kunci (AI tidak ubah)","Lock (AI keeps it)"))+'</button>'+
    (s.wiki?'<button data-m="wiki">📖 Wikipedia</button>':'')+
    '<button data-m="del" class="red">🗑 '+L("Buang","Remove")+'</button></div>');
  ov.querySelectorAll("[data-m]").forEach(function(b){ b.onclick=function(){ var m=b.getAttribute("data-m"); t=getT(t.id)||t; var D=t.days[i], s0=D.stops[k];
    if(m==="gm"){ H.closeOverlay(); gmaps(t,i,k); return; }
    if(m==="wiki"){ H.closeOverlay(); openU("https://en.wikipedia.org/wiki/"+encodeURIComponent(s0.wiki.replace(/ /g,"_"))); return; }
    if(m==="lock"){ s0.lock=s0.lock?0:1; putT(t); H.closeOverlay(); drawTrip(); return; }
    if(m==="del"){ D.stops.splice(k,1); putT(t); H.closeOverlay(); drawTrip(); return; }
    if(m==="up"||m==="down"){ var j=m==="up"?k-1:k+1, x=D.stops[j]; D.stops[j]=s0; D.stops[k]=x; var tt=s0.t; s0.t=x.t; x.t=tt; putT(t); H.closeOverlay(); drawTrip(); return; }
    if(m==="edit"){ editStop(t,i,k); return; }
    if(m==="move"){ moveStop(t,i,k); return; }
    if(m==="mine"){ H.closeOverlay(); factSheet("place", "📎 "+L("Tempat pilihan anda","Your own place"), factHint("place"), function(x){ t=getT(t.id)||t; t.facts=(t.facts||[]).concat([x]); putT(t); if(busyT(t)) return;
      patch(t, "On day "+(i+1)+", replace the stop \""+s0.n+"\" ("+s0.t+") with this place the person chose; keep the rest of the day, adjust times if needed.\nDetails: "+x.txt); }); return; }
    if(m==="swap"){ swapStop(t,i,k); return; }
  }; }); }
function editStop(t,i,k){ var s=t.days[i].stops[k];
  var ov=H.showSheet("✏️ "+esc(s.n), '<label class="tpL">'+L("Nama","Name")+'</label><input id="esN" class="rin" value="'+esc(s.n)+'"><label class="tpL">'+L("Masa","Time")+'</label><input id="esT" class="rin" type="time" value="'+esc(s.t)+'"><label class="tpL">'+L("Nota","Note")+'</label><textarea id="esO" class="rin" rows="2">'+esc(s.note)+'</textarea><label class="tpL">'+L("Harga seorang","Price per person")+' ('+esc(dayCur(t,i))+')</label><input id="esP" class="rin" type="number" value="'+(s.price||"")+'"><button class="btn gold full g3d" id="esGo" style="margin-top:10px">'+L("Simpan","Save")+'</button>');
  ov.querySelector("#esGo").onclick=function(){ t=getT(t.id)||t; var s0=t.days[i].stops[k], nn=str(ov.querySelector("#esN").value)||s0.n; if(nn!==s0.n){ s0.n=nn; delete s0.ok; delete s0.img; s0.ll=null; s0.wiki=""; s0.mine=1; }
    s0.t=ov.querySelector("#esT").value; s0.note=ov.querySelector("#esO").value; s0.price=num(ov.querySelector("#esP").value); t.days[i].stops.sort(byTime); putT(t); H.closeOverlay(); resolve(t); drawTrip(); }; }
function moveStop(t,i,k){ var ov=H.showSheet("↕ "+L("Pindah ke hari","Move to day"), '<div class="tpChips">'+t.days.map(function(d,j){ return '<button class="chip'+(j===i?' on':'')+'" data-mv="'+j+'">'+(j+1)+' · '+esc(d.city)+'</button>'; }).join("")+'</div><label class="tpL">'+L("Masa","Time")+'</label><input id="mvT" class="rin" type="time" value="'+esc(t.days[i].stops[k].t)+'">');
  ov.querySelectorAll("[data-mv]").forEach(function(b){ b.onclick=function(){ t=getT(t.id)||t; var j=+b.getAttribute("data-mv"), s=t.days[i].stops.splice(k,1)[0]; s.t=ov.querySelector("#mvT").value||s.t; t.days[j].stops.push(s); t.days[j].stops.sort(byTime); putT(t); H.closeOverlay(); st.day=j; drawTrip(); }; }); }
function swapStop(t,i,k){ var s=t.days[i].stops[k], d=t.days[i], ov=H.showSheet("🔁 "+esc(s.n), '<div id="swB" class="mut">⏳ '+L("AI sedang mencari pilihan…","AI is finding options…")+'</div>'), B=ov.querySelector("#swB");
  var sc=destCityOf(t,i);
  ai("Trip: "+t.dest+". Day "+(i+1)+" in "+sc.n+(sc.country?", "+sc.country:"")+" (every option must be in or near "+sc.n+"). Travellers: "+who(t)+". Style: "+STYLE[t.style||"n"][2]+".\nOther stops that day: "+d.stops.filter(function(x,j){ return j!==k; }).map(function(x){ return x.t+" "+x.n; }).join("; ")+
    "\nSuggest 3 different real alternatives to \""+s.n+"\" ("+s.type+", around "+s.t+"), close to the other stops. Write descriptions in "+langName()+'.\nReturn JSON {"alts":['+stopSchema()+']}', 2500)
  .then(function(j){ var al0=(j.alts||[]).map(function(x){ var o=normStop(x); if(o) o.t=o.t||s.t; return o; }).filter(Boolean).slice(0,5), cl=sc.lat?[sc.lat,sc.lon]:null;
    return Promise.all(al0.map(function(o){ return (o.ai && cl && km(o.ai,cl)>80) ? null : findPlace(o.n, sc, cl, 60, o.ai, o.addr).then(function(r){ if(!r || r.approx===2) return null; if(cl && km(r.ll,cl)>60) return null; if(nearHome(t,r.ll) && !(cl && km(cl,r.ll)<70)) return null; o.ll=r.ll; o.ok=r.approx?2:1; o.gaddr=r.a||""; return o; }); })); })
  .then(function(al1){ var al=(al1||[]).filter(Boolean).slice(0,4); if(!document.body.contains(B)) return;
    if(!al.length){ B.textContent=L("Tiada pilihan yang ditemui di peta berhampiran. Cuba lagi.","No options found on the map nearby. Try again."); return; }
    B.className=""; B.innerHTML=al.map(function(a,n){ return '<div class="tpAlt"><b>'+(TYPE[a.type]||"📍")+' '+esc(a.n)+'</b><small>'+esc(a.note)+'</small>'+(a.price?'<small>'+money(t,a.price,dayCur(t,i),L("seorang","pp"))+'</small>':'')+'<div class="row" style="gap:6px"><button class="chip" data-agm="'+n+'">📍 Google Maps</button><button class="chip on" data-use="'+n+'">✓ '+L("Guna ini","Use this")+'</button></div></div>'; }).join("");
    B.querySelectorAll("[data-agm]").forEach(function(b){ b.onclick=function(){ var a=al[+b.getAttribute("data-agm")], c=cityOf(t,d.city); if(window.Native && H.N.openMaps && c.lat) H.N.openMaps(a.n+", "+c.n, c.lat, c.lon); else openU(gmUrl(a.n, c.n)); }; });
    B.querySelectorAll("[data-use]").forEach(function(b){ b.onclick=function(){ t=getT(t.id)||t; var a=al[+b.getAttribute("data-use")]; t.days[i].stops[k]=a; putT(t); H.closeOverlay(); resolve(t); drawTrip(); }; }); })
  .catch(function(e){ if(document.body.contains(B)) B.textContent="⚠ "+errTxt(e); }); }
function addStopSheet(t,i){ var ov=H.showSheet("＋ "+L("Tambah tempat","Add a place")+" · "+L("Hari","Day")+" "+(i+1), '<label class="tpL">'+L("Nama tempat","Place name")+'</label><input id="asN" class="rin" placeholder="'+esc(L("cth. Teamlab Planets","e.g. teamLab Planets"))+'"><label class="tpL">'+L("Masa","Time")+'</label><input id="asT" class="rin" type="time" value="15:00">'+
  '<div class="row" style="gap:8px;margin-top:10px"><button class="btn gold g3d" id="asGo" style="flex:1">＋ '+L("Tambah","Add")+'</button><button class="btn alt g3d" id="asAi">✨ '+L("AI cadangkan","AI suggests")+'</button></div><button class="btn alt full g3d" id="asLk" style="margin-top:8px">📎 '+L("Dari pautan / tangkapan skrin","From a link / screenshot")+'</button>');
  ov.querySelector("#asGo").onclick=function(){ var n=str(ov.querySelector("#asN").value); if(!n) return; t=getT(t.id)||t; t.days[i].stops.push({id:rid(), t:ov.querySelector("#asT").value, n:n, loc:"", type:"sight", note:"", dur:60, price:0, wiki:"", halal:"", mine:1}); t.days[i].stops.sort(byTime); putT(t); H.closeOverlay(); resolve(t); drawTrip(); };
  ov.querySelector("#asAi").onclick=function(){ H.closeOverlay(); if(busyT(t)) return; dayAct0(t, i, "Add one more good stop to this day, around "+(ov.querySelector("#asT").value||"the afternoon")+(str(ov.querySelector("#asN").value)?": "+str(ov.querySelector("#asN").value):"")+". Keep the other stops."); };
  ov.querySelector("#asLk").onclick=function(){ H.closeOverlay(); factSheet("place", "📎 "+factName("place"), factHint("place"), function(x){ t=getT(t.id)||t; t.facts=(t.facts||[]).concat([x]); putT(t); if(busyT(t)) return; patch(t, "Add this place the person chose to day "+(i+1)+" at a sensible time.\nDetails: "+x.txt); }); }; }
function dayAct0(t, i, X){ var id=t.id; jobs[id]={msg:L("AI sedang mengubah hari "+(i+1)+"…","AI is changing day "+(i+1)+"…"), pct:40}; drawTrip();
  ai(daysPrompt(t, i, i, X), 6000).then(function(j){ var cur=getT(id)||t, d=(j.days||[])[0]; if(d){ var nd=normDay(d, cur.days[i]); nd.city=cur.days[i].city; nd.title=cur.days[i].title; nd.stay=cur.days[i].stay; cur.days[i]=nd; } putT(cur); delete jobs[id]; resolve(cur); drawTrip(); })
  .catch(function(e){ jobs[id]={err:errTxt(e), soft:1}; drawTrip(); }); }
function hotelSheet(t, i){ var d=t.days[i], ov=H.showSheet("🏨 "+esc(d.stay.hotel), '<div class="tpMenu"><button data-h="ai">✨ '+L("AI cadang 3 hotel lain","AI suggests 3 other hotels")+'</button><button data-h="mine">📎 '+L("Saya sudah tempah / pilih sendiri (nama, pautan, gambar)","I booked / chose my own (name, link, screenshot)")+'</button><button data-h="area">📍 '+L("Tukar kawasan menginap","Change the area to stay")+'</button><button data-h="price">🔎 '+L("Cari harga hotel ini","Find this hotel's prices")+'</button></div><div id="hsB"></div>');
  ov.querySelector('[data-h="price"]').onclick=function(){ var dt=dateOf(t,i); H.closeOverlay(); openU("https://www.google.com/travel/hotels?q="+encodeURIComponent(d.stay.hotel+" "+d.city)+(dt?"&checkin="+ymd(dt)+"&checkout="+ymd(addD(dt,1)):"")); };
  ov.querySelector('[data-h="mine"]').onclick=function(){ H.closeOverlay(); factSheet("hotel", "🏨 "+factName("hotel"), factHint("hotel"), function(x){ addFact(t, x, "This is for the stay of day "+(i+1)+" in "+d.city+" (and the following nights in the same city)."); }); };
  ov.querySelector('[data-h="area"]').onclick=function(){ var a=prompt(L("Kawasan mana? (cth. Shinjuku, dekat stesen)","Which area? (e.g. Shinjuku, near the station)")); if(!a) return; H.closeOverlay(); if(busyT(t)) return; patch(t, "Move the stay in "+d.city+" (day "+(i+1)+" and the other nights in that city) to this area: "+a+". Pick a real hotel there that suits the style and update the price."); };
  ov.querySelector('[data-h="ai"]').onclick=function(){ var B=ov.querySelector("#hsB"); B.innerHTML='<div class="mut">⏳</div>';
    ai("Suggest 3 real alternative hotels in "+d.city+" for "+who(t)+", style "+STYLE[t.style||"n"][2]+", near: "+d.stops.map(function(s){ return s.n; }).slice(0,5).join(", ")+". Current: "+d.stay.hotel+". Write notes in "+langName()+'.\nReturn JSON {"hotels":[{"hotel":"","area":"","price":per room per night in '+(cityOf(t,d.city).cur||home())+',"note":"why"}]}', 2000)
    .then(function(j){ var hs=(j.hotels||[]).map(normStay).filter(function(x){ return x.hotel; }); if(!document.body.contains(B)) return;
      B.innerHTML=hs.map(function(x,n){ return '<div class="tpAlt"><b>🏨 '+esc(x.hotel)+'</b><small>'+esc(x.area)+' · '+esc(x.note)+'</small>'+(x.price?'<small>'+money(t,x.price,dayCur(t,i),L("semalam","per night"))+'</small>':'')+'<div class="row" style="gap:6px"><button class="chip" data-hg="'+n+'">📍 Google Maps</button><button class="chip on" data-hu="'+n+'">✓ '+L("Guna ini","Use this")+'</button></div></div>'; }).join("")||L("Tiada pilihan.","No options.");
      B.querySelectorAll("[data-hg]").forEach(function(b){ b.onclick=function(){ var x=hs[+b.getAttribute("data-hg")], c=cityOf(t,d.city); if(window.Native && H.N.openMaps && c.lat) H.N.openMaps(x.hotel+", "+c.n, c.lat, c.lon); else openU(gmUrl(x.hotel, c.n)); }; });
      B.querySelectorAll("[data-hu]").forEach(function(b){ b.onclick=function(){ t=getT(t.id)||t; var x=hs[+b.getAttribute("data-hu")], city=t.days[i].city, old=t.days[i].stay.hotel;
        for(var j=i;j<t.days.length && t.days[j].city===city;j++){ if(t.days[j].stay && (t.days[j].stay.hotel===old || j===i)) t.days[j].stay=JSON.parse(JSON.stringify(x)); }
        putT(t); H.closeOverlay(); resolve(t); drawTrip(); }; }); })
    .catch(function(e){ if(document.body.contains(B)) B.textContent="⚠ "+errTxt(e); }); }; }
function editSheet(t){ var r=route(t), R={start:t.start||ymd(addD(today0(),30)), end:t.start?ymd(addD(parseYmd(t.start),t.n-1)):""}, s0=t.start;
  var ov=H.showSheet("✏️ "+L("Ubah laluan / tarikh","Edit route / dates"), '<label class="tpL">📅 '+L("Tarikh","Dates")+'</label><div id="eCal"></div>'+
    '<label class="tpL">🧭 '+L("Hari di setiap tempat","Days in each place")+'</label>'+r.map(function(x,n){ return '<div class="tpRrow"><b>'+esc(x.c)+'</b><button class="chip" data-rs="'+n+':-1">−</button><span id="rn'+n+'">'+x.n+'</span><button class="chip" data-rs="'+n+':1">＋</button><button class="chip" data-rx="'+n+'">✕</button></div>'; }).join("")+
    '<label class="tpL">＋ '+L("Tambah tempat / bandar","Add a place / city")+'</label><input id="rAdd" class="rin" placeholder="'+esc(L("cth. Nara 1 hari","e.g. Nara for 1 day"))+'">'+
    '<label class="tpL">🛫 '+L("Berlepas dari","Flying from")+'</label><div class="tpApW"><input id="rAp" class="rin" autocomplete="off" value="'+esc(t.from||"")+'"><div class="tpAp hidden"></div></div>'+
    '<label class="tpL">🛬 '+L("Pulang ke","Returning to")+'</label><div class="tpApW"><input id="rAp2" class="rin" autocomplete="off" value="'+esc(t.to||t.from||"")+'"><div class="tpAp hidden"></div></div>'+
    '<button class="btn gold full g3d" id="rGo" style="margin-top:12px">✨ '+L("Simpan & rancang semula","Save & re-plan")+'</button>');
  rangeCal(ov.querySelector("#eCal"), R); apAttach(ov.querySelector("#rAp")); apAttach(ov.querySelector("#rAp2"));
  var r0=JSON.stringify(r.map(function(x){ return x.n; }));
  ov.querySelectorAll("[data-rs]").forEach(function(b){ b.onclick=function(){ var p=b.getAttribute("data-rs").split(":"), x=r[+p[0]]; x.n=Math.max(0,Math.min(20,x.n+(+p[1]))); ov.querySelector("#rn"+p[0]).textContent=x.n; }; });
  ov.querySelectorAll("[data-rx]").forEach(function(b){ b.onclick=function(){ var n=+b.getAttribute("data-rx"); r[n].n=0; ov.querySelector("#rn"+n).textContent="0"; b.parentNode.style.opacity=.4; }; });
  ov.querySelector("#rGo").onclick=function(){ if(!R.end){ H.toast(L("Pilih tarikh pulang","Pick the return date")); return; } t=getT(t.id)||t;
    var add=str(ov.querySelector("#rAdd").value), ap=str(ov.querySelector("#rAp").value), ap2=str(ov.querySelector("#rAp2").value), n=spanDays(R.start,R.end), old=t.n;
    var routeCh=JSON.stringify(r.map(function(x){ return x.n; }))!==r0 || add, apCh=(ap && ap!==t.from) || (ap2 && ap2!==(t.to||t.from)), dayCh=n!==old;
    t.start=R.start; if(ap) t.from=ap; if(ap2) t.to=ap2; if(apCh) t.homeV=0; putT(t); H.closeOverlay(); drawTrip();
    if(!routeCh && !apCh && !dayCh) return; if(busyT(t)) return;
    var req=[]; if(dayCh) req.push("The trip is now "+n+" days ("+R.start+" to "+R.end+"), it was "+old+" days: set count to "+n+".");
    if(routeCh) req.push("Re-plan the route: "+r.map(function(x){ return x.c+" "+x.n+" day(s)"; }).join(", ")+(add?"; also add: "+add:"")+".");
    if(apCh) req.push("The person flies from "+t.from+" and returns to "+(t.to||t.from)+".");
    patch(t, req.join(" ")+" Update cities, flights, stays and every day that changes (new days in full)."); }; }
function routeSheet(t){ var r=route(t);
  var ov=H.showSheet("✏️ "+L("Laluan & hari","Route & days"), '<div class="mut small">'+L("Ubah bilangan hari di setiap tempat, tambah atau buang tempat, atau tukar lapangan terbang. AI susun semula trip.","Change the days in each place, add or remove places, or change airports. AI re-plans the trip.")+'</div>'+
    r.map(function(x,n){ return '<div class="tpRrow"><b>'+esc(x.c)+'</b><button class="chip" data-rs="'+n+':-1">−</button><span id="rn'+n+'">'+x.n+'</span><button class="chip" data-rs="'+n+':1">＋</button><button class="chip" data-rx="'+n+'">✕</button></div>'; }).join("")+
    '<label class="tpL">＋ '+L("Tambah tempat / bandar","Add a place / city")+'</label><input id="rAdd" class="rin" placeholder="'+esc(L("cth. Nara 1 hari","e.g. Nara for 1 day"))+'"><label class="tpL">🛫 '+L("Lapangan terbang / berlepas dari","Airports / flying from")+'</label><div class="tpApW"><input id="rAp" class="rin" autocomplete="off" value="'+esc(t.from||"")+'"><div class="tpAp hidden"></div></div>'+
    '<button class="btn gold full g3d" id="rGo" style="margin-top:10px">✨ '+L("Rancang semula","Re-plan")+'</button>');
  apAttach(ov.querySelector("#rAp"));
  ov.querySelectorAll("[data-rs]").forEach(function(b){ b.onclick=function(){ var p=b.getAttribute("data-rs").split(":"), x=r[+p[0]]; x.n=Math.max(0,Math.min(20,x.n+(+p[1]))); ov.querySelector("#rn"+p[0]).textContent=x.n; }; });
  ov.querySelectorAll("[data-rx]").forEach(function(b){ b.onclick=function(){ var n=+b.getAttribute("data-rx"); r[n].n=0; ov.querySelector("#rn"+n).textContent="0"; b.parentNode.style.opacity=.4; }; });
  ov.querySelector("#rGo").onclick=function(){ t=getT(t.id)||t; var add=str(ov.querySelector("#rAdd").value), ap=str(ov.querySelector("#rAp").value), tot=r.reduce(function(s,x){ return s+x.n; },0);
    var req="Re-plan the route: "+r.map(function(x){ return x.c+" "+x.n+" day(s)"; }).join(", ")+(add?"; also add: "+add:"")+(ap && ap!==t.from?"; the person flies from / via: "+ap:"")+". Total days "+(add?"may grow to fit the added place":"= "+tot)+". Update cities, flights, stays and every day that changes.";
    if(ap) t.from=ap; putT(t); H.closeOverlay(); if(busyT(t)) return; patch(t, req); }; }
function datesSheet(t){ var R={start:t.start||ymd(addD(today0(),30)), end:t.start?ymd(addD(parseYmd(t.start),t.n-1)):""};
  var ov=H.showSheet("📅 "+L("Tarikh trip","Trip dates"), '<div id="dCal"></div><div class="mut small" style="margin-top:6px">'+L("Waktu solat, kalendar dan cuaca ikut tarikh ini. Jika bilangan hari berubah, AI susun semula trip.","Prayer times, the calendar and the weather follow these dates. If the number of days changes, AI re-plans the trip.")+'</div><label class="tpL"><input type="checkbox" id="dW"> '+L("Minta AI semak cuaca & musim untuk tarikh ini","Ask AI to check the weather and season for these dates")+'</label><button class="btn gold full g3d" id="dGo" style="margin-top:10px">'+L("Simpan","Save")+'</button>');
  rangeCal(ov.querySelector("#dCal"), R);
  ov.querySelector("#dGo").onclick=function(){ if(!R.end){ H.toast(L("Pilih tarikh pulang","Pick the return date")); return; } t=getT(t.id)||t; var n=spanDays(R.start,R.end), w=ov.querySelector("#dW").checked, old=t.n; t.start=R.start; putT(t); H.closeOverlay(); drawTrip();
    if(n!==old){ if(busyT(t)) return; patch(t, "The trip is now "+n+" days ("+R.start+" to "+R.end+"), it was "+old+" days. Re-plan: set count to "+n+", spread the cities sensibly, update stays and flights, and return every day that changes (new days in full)."+(w?" Also update the weather tip for these dates.":"")); }
    else if(w && !busyT(t)) patch(t, "The trip now starts on "+t.start+". Update the weather tip and any day that should change for this season or the weekday (closures, Friday prayers, events). Return only changed days."); }; }
// ---------- menu, exports ----------
function tripMenu(t){ var ov=H.showSheet("⋯ "+esc(t.title||t.dest), '<div class="tpMenu"><button data-x="share">⤴ '+L("Kongsi / eksport","Share / export")+'</button><button data-x="ren">✏️ '+L("Namakan semula","Rename")+'</button><button data-x="dup">📄 '+L("Salin trip","Duplicate")+'</button>'+
  (t.lang!==langCode()?'<button data-x="tr">🌐 '+L("Terjemah ke Bahasa Melayu","Translate to English")+'</button>':'')+'<button data-x="cur">💱 '+L("Mata wang","Currency")+' ('+esc(sym(home()))+')</button><button data-x="ai">⚙ '+L("Tetapan AI","AI settings")+'</button><button data-x="fill">🔁 '+L("Lengkapkan butiran yang tiada (AI)","Complete missing info (AI)")+'</button><button data-x="new">🔁 '+L("Bina semula dari awal","Rebuild from scratch")+'</button><button data-x="del" class="red">🗑 '+L("Padam trip","Delete trip")+'</button></div>');
  ov.querySelectorAll("[data-x]").forEach(function(b){ b.onclick=function(){ var x=b.getAttribute("data-x"); t=getT(t.id)||t;
    if(x==="share"){ exportSheet(t); return; } if(x==="cur"){ curSheet(); return; } H.closeOverlay();
    if(x==="ren"){ var n=prompt(L("Nama trip","Trip name"), t.title||t.dest); if(n){ t.title=n.slice(0,80); putT(t); drawTrip(); } }
    else if(x==="dup"){ var c=JSON.parse(JSON.stringify(t)); c.id="t"+Date.now().toString(36); c.title=(t.title||t.dest)+" (2)"; c.made=Date.now(); putT(c); st.id=c.id; drawTrip(); }
    else if(x==="del"){ if(confirm(L("Padam trip ini?","Delete this trip?"))){ delT(t.id); back(); } }
    else if(x==="ai"){ if(H.aiSettings) H.aiSettings(); }
    else if(x==="new"){ if(!confirm(L("Bina semula seluruh trip? Perubahan anda akan diganti (tempahan anda kekal).","Rebuild the whole trip? Your changes are replaced (your bookings stay)."))) return; t.days=[]; t.cities=[]; t.status="gen"; putT(t); build(t); }
    else if(x==="tr") translate(t);
    else if(x==="fill") completeTrip(t);
  }; }); }
function translate(t){ if(busyT(t)) return; var id=t.id, i=0;
  var stepT=function(){ var cur=getT(id); if(!cur) return; if(i>=cur.days.length){ cur.lang=langCode(); putT(cur); delete jobs[id]; drawTrip(); return; }
    var a=i, b=Math.min(cur.days.length-1, i+3); jobs[id]={msg:L("Menterjemah…","Translating…")+" "+(a+1)+"/"+cur.n, pct:10+Math.round(85*a/cur.n)}; drawTrip();
    var part={days:cur.days.slice(a,b+1).map(function(d,k){ return {d:a+k+1, title:d.title, move:d.move, stay_note:d.stay&&d.stay.note, notes:(d.stops||[]).map(function(s){ return s.note; })}; })};
    if(a===0){ part.title=cur.title; part.summary=cur.summary; part.tips=cur.tips; }
    ai("Translate every text value in this JSON into "+langName()+". Keep the same keys, the same array lengths and the same order. Place names stay as they are.\n"+JSON.stringify(part), 6000).then(function(j){ var c=getT(id); if(!c) return;
      if(a===0){ if(j.title) c.title=str(j.title); if(j.summary) c.summary=str(j.summary); if(j.tips && typeof j.tips==="object") c.tips=j.tips; }
      (j.days||[]).forEach(function(x){ var di=Math.round(num(x.d))-1, d=c.days[di]; if(!d) return; if(x.title) d.title=str(x.title); if(x.move!=null) d.move=str(x.move); if(x.stay_note && d.stay) d.stay.note=str(x.stay_note); (x.notes||[]).forEach(function(n,k){ if(d.stops[k] && n) d.stops[k].note=str(n); }); });
      putT(c); i=b+1; stepT(); }).catch(function(e){ jobs[id]={err:errTxt(e), soft:1}; drawTrip(); }); };
  stepT(); }
function textOf(t){ var c=costs(t), d0=parseYmd(t.start), out=["✈️ "+(t.title||t.dest), t.dest+" · "+t.n+" "+L("hari","days")+" · "+((t.ad||0)+(t.kd||0))+" "+L("orang","people")+(d0?" · "+ymd(d0):"")];
  if(t.summary) out.push(t.summary); if(c.total>0) out.push("💰 "+L("Anggaran","Estimate")+": "+fmtM(c.total,home())+" ("+fmtM(c.total/c.ppl,home())+" "+L("seorang","per person")+")");
  (t.flights||[]).forEach(function(f){ out.push("✈️ "+f.from+" → "+f.to+(f.when?" · "+f.when:"")+(f.airline?" · "+f.airline:"")); });
  t.days.forEach(function(d,i){ var dt=dateOf(t,i); out.push(""); out.push("📅 "+L("Hari","Day")+" "+(i+1)+(dt?" ("+dateTxt(dt)+")":"")+" · "+d.city+(d.title?" · "+d.title:""));
    (d.stops||[]).forEach(function(s){ out.push((s.t?s.t+" ":"")+(TYPE[s.type]||"📍")+" "+s.n+(s.note?" · "+s.note:"")+(s.price?" · "+moneyTxt(t,s.price,dayCur(t,i)):"")); out.push("   "+gmUrl(s.n, d.city, s.ll)); });
    if(d.stay && d.stay.hotel) out.push("🏨 "+d.stay.hotel+(d.stay.area?" ("+d.stay.area+")":"")); });
  out.push(""); out.push(L("Dirancang dengan My Ihsan","Planned with My Ihsan")+" · https://myihsan.app"); return out.join("\n"); }
function shareText(t){ var x=textOf(t); if(window.Native && H.N.shareTo) H.N.shareTo("", "", x); else if(navigator.share) navigator.share({text:x}).catch(function(){}); else { try{ navigator.clipboard.writeText(x); H.toast(L("Disalin","Copied")); }catch(e){} } }
function shareFile(name, content, mime){ if(window.Native && H.N.shareFile) H.N.shareFile(name, content, mime, ""); else { var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([content],{type:mime})); a.download=name; document.body.appendChild(a); a.click(); a.remove(); } }
function fname(t, ext){ return "Trip-"+String(t.title||t.dest).replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)+"."+ext; }
function icsOf(t){ var d0=parseYmd(t.start); if(!d0) return null; var L1=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//My Ihsan//Trip//EN","CALSCALE:GREGORIAN"], stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"");
  var e=function(s){ return String(s||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n"); }, u=function(dt){ return dt.toISOString().replace(/[-:]/g,"").replace(/\.\d+/,""); };
  t.days.forEach(function(d,i){ var c=cityOf(t,d.city), tz=c.tz!=null?c.tz:Math.round((c.lon||0)/15), day=addD(d0,i);
    (d.stops||[]).forEach(function(s){ var m=/^(\d\d?):(\d\d)/.exec(s.t||""); if(!m) return; var st0=new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), +m[1], +m[2])-tz*36e5), en0=new Date(st0.getTime()+(s.dur||60)*6e4);
      L1.push("BEGIN:VEVENT","UID:"+s.id+"-"+t.id+"@myihsan.app","DTSTAMP:"+stamp,"DTSTART:"+u(st0),"DTEND:"+u(en0),"SUMMARY:"+e((TYPE[s.type]||"")+" "+s.n),"LOCATION:"+e(s.n+", "+d.city),"DESCRIPTION:"+e((s.note||"")+"\n"+gmUrl(s.n,d.city,s.ll)),"END:VEVENT"); }); });
  L1.push("END:VCALENDAR"); return L1.join("\r\n"); }
function kmlOf(t){ var x=function(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;"); }, o=['<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>'+x(t.title||t.dest)+'</name>'];
  t.days.forEach(function(d,i){ o.push('<Folder><name>'+x(L("Hari","Day")+" "+(i+1)+" · "+d.city)+'</name>'); (d.stops||[]).forEach(function(s,k){ if(s.ll) o.push('<Placemark><name>'+x((k+1)+". "+s.n)+'</name><description>'+x((s.t||"")+" "+(s.note||""))+'</description><Point><coordinates>'+s.ll[1]+','+s.ll[0]+'</coordinates></Point></Placemark>'); }); o.push('</Folder>'); });
  o.push('</Document></kml>'); return o.join(""); }
function exportSheet(t){ var ov=H.showSheet("⤴ "+L("Kongsi / eksport","Share / export"), '<div class="tpMenu"><button data-e="pdf">📄 PDF</button><button data-e="txt">💬 WhatsApp / '+L("teks","text")+'</button><button data-e="ics">📅 '+L("Kalendar (.ics)","Calendar (.ics)")+'</button><button data-e="gm">🗺 '+L("Google Maps: laluan setiap hari","Google Maps: each day's route")+'</button><button data-e="kml">🌍 KML ('+L("Google My Maps / Earth","Google My Maps / Earth")+')</button><button data-e="file">🧳 '+L("Fail trip (buka di telefon lain)","Trip file (open on another phone)")+'</button></div>');
  ov.querySelectorAll("[data-e]").forEach(function(b){ b.onclick=function(){ var x=b.getAttribute("data-e"); t=getT(t.id)||t;
    if(x==="gm"){ ov.querySelector(".tpMenu").innerHTML=t.days.map(function(d,i){ return '<button data-gr="'+i+'">🗺 '+L("Hari","Day")+' '+(i+1)+' · '+esc(d.city)+'</button>'; }).join(""); ov.querySelectorAll("[data-gr]").forEach(function(g){ g.onclick=function(){ dayRoute(t, +g.getAttribute("data-gr")); }; }); return; }
    H.closeOverlay();
    if(x==="txt") shareText(t);
    else if(x==="pdf") pdf(t);
    else if(x==="ics"){ var ic=icsOf(t); if(!ic){ H.toast(L("Tetapkan tarikh trip dahulu","Set the trip dates first")); datesSheet(t); return; } shareFile(fname(t,"ics"), ic, "text/calendar"); }
    else if(x==="kml") shareFile(fname(t,"kml"), kmlOf(t), "application/vnd.google-earth.kml+xml");
    else if(x==="file") shareFile(fname(t,"ihsantrip"), JSON.stringify({kind:"ihsan-trip", v:1, trip:t}), "application/json");
  }; }); }
function importTrip(){ var inp=document.createElement("input"); inp.type="file"; inp.accept=".ihsantrip,.json,application/json,application/octet-stream"; inp.onchange=function(){ var f=inp.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ try{ var j=JSON.parse(r.result), t=j.trip||j; if(!t.days || !t.dest) throw 0; t.id="t"+Date.now().toString(36); putT(t); H.toast("✅ "+(t.title||t.dest)); st.pg="view"; st.id=t.id; st.tab="itin"; draw(); }catch(e){ H.toast(L("Ini bukan fail trip","This is not a trip file")); } }; r.readAsText(f); }; inp.click(); }
// 0.7.39 (owner): maps in the PDF: the whole trip, then each day. Drawn on a hidden map (same style, numbered pins and
// route lines as layers, so they are part of the picture) and captured as JPEG; if the map cannot draw, the PDF prints without it.
function snapMaps(t, done){ var fin=false, out={}, end=function(){ if(fin) return; fin=true; try{ if(M) M.remove(); }catch(e){} if(box) box.remove(); done(out); };
  var box=null, M=null; setTimeout(end, 45000);
  loadMap(function(ok){ if(!ok || !window.maplibregl){ end(); return; }
    var feats=[], lines=[], views=[-1].concat(t.days.map(function(d,i){ return i; }));
    t.days.forEach(function(d,i){ var cs=[], pst=i>0?t.days[i-1].stay:null; if(pst && pst.hotel && pst.ll) cs.push([pst.ll[1],pst.ll[0]]);
      (d.stops||[]).forEach(function(s,k){ if(!s.ll || s.home) return; feats.push({type:"Feature", properties:{i:i, n:String(k+1), c:dcol(i)}, geometry:{type:"Point", coordinates:[s.ll[1],s.ll[0]]}}); cs.push([s.ll[1],s.ll[0]]); });
      if(d.stay && d.stay.ll) feats.push({type:"Feature", properties:{i:i, n:"H", c:dcol(i)}, geometry:{type:"Point", coordinates:[d.stay.ll[1],d.stay.ll[0]]}});
      if(cs.length>1) lines.push({type:"Feature", properties:{i:i, c:dcol(i)}, geometry:{type:"LineString", coordinates:cs}}); });
    if(!feats.length){ end(); return; }
    box=document.createElement("div"); box.style.cssText="position:fixed;left:-10000px;top:0;width:900px;height:520px"; document.body.appendChild(box);
    var online=navigator.onLine!==false, loaded=false;
    try{ M=new maplibregl.Map({container:box, style:online?"https://tiles.openfreemap.org/styles/liberty":offStyle(), preserveDrawingBuffer:true, interactive:false, attributionControl:false, fadeDuration:0, center:[feats[0].geometry.coordinates[0], feats[0].geometry.coordinates[1]], zoom:11}); }catch(e){ end(); return; }
    var fall=setTimeout(function(){ if(!loaded){ online=false; try{ M.setStyle(offStyle()); }catch(e){} } }, 8000);
    M.on("error", function(){ if(!loaded && online){ online=false; clearTimeout(fall); try{ M.setStyle(offStyle()); }catch(e){} } });
    M.on("style.load", function(){ if(loaded) return; loaded=true; clearTimeout(fall);
      try{ M.addSource("pl",{type:"geojson", data:{type:"FeatureCollection", features:lines}}); M.addLayer({id:"pl", type:"line", source:"pl", layout:{"line-cap":"round","line-join":"round"}, paint:{"line-color":["get","c"], "line-width":3.5, "line-opacity":0.85}});
        M.addSource("pp",{type:"geojson", data:{type:"FeatureCollection", features:feats}}); M.addLayer({id:"pp", type:"circle", source:"pp", paint:{"circle-radius":11, "circle-color":["get","c"], "circle-stroke-color":"#ffffff", "circle-stroke-width":2.5}});
        if(online) M.addLayer({id:"pn", type:"symbol", source:"pp", layout:{"text-field":["get","n"], "text-size":12, "text-font":["Noto Sans Bold"], "text-allow-overlap":true}, paint:{"text-color":"#ffffff"}}); }catch(e){}
      var vi=0, next=function(){ if(fin) return; if(vi>=views.length){ end(); return; } var v=views[vi++], f=["==",["get","i"],v], ps=feats.filter(function(x){ return v<0 || x.properties.i===v; });
        if(!ps.length){ next(); return; }
        try{ ["pl","pp","pn"].forEach(function(id){ if(M.getLayer(id)) M.setFilter(id, v<0?null:f); }); }catch(e){}
        var b=new maplibregl.LngLatBounds(); ps.forEach(function(x){ b.extend(x.geometry.coordinates); }); if(v>=0 && v>0){ var pst=t.days[v-1].stay; if(pst && pst.ll) b.extend([pst.ll[1],pst.ll[0]]); }
        try{ if(ps.length>1) M.fitBounds(b,{padding:60, maxZoom:15, duration:0}); else M.jumpTo({center:ps[0].geometry.coordinates, zoom:14}); }catch(e){}
        var shot=false, take=function(){ if(shot || fin) return; shot=true; try{ out[v]=M.getCanvas().toDataURL("image/jpeg", 0.82); }catch(e){} setTimeout(next, 30); };
        M.once("idle", take); setTimeout(take, 7000); };
      setTimeout(next, 300); }); }); }
function pdf(t){ if(pdf.busy) return; pdf.busy=true; H.toast(L("Menyediakan peta untuk PDF…","Preparing the maps for the PDF…")); snapMaps(getT(t.id)||t, function(maps){ pdf.busy=false; pdfBuild(getT(t.id)||t, maps||{}); }); }
function pdfBuild(t, maps){ var c=costs(t), x=esc, d0=parseYmd(t.start), mp=function(v){ return maps[v]?'<img class="map" src="'+maps[v]+'" alt="">':''; };
  var css='@page{size:A4;margin:12mm}body{font-family:system-ui,Roboto,Arial,sans-serif;color:#1d2a24;font-size:11.5pt;margin:0}h1{font-size:24pt;margin:0 0 4px}h2{font-size:15pt;margin:14px 0 6px;color:#0b5d3b;border-bottom:2px solid #c9a646;padding-bottom:3px}.m{color:#5d6d64;font-size:10pt}.st{display:flex;gap:10px;margin:6px 0;page-break-inside:avoid}.st .ph{width:8mm;font-size:13pt;flex:none;text-align:center}img.map{display:block;width:100%;height:auto;border-radius:8px;margin:6px 0 8px;page-break-inside:avoid}.tm{font-weight:700;width:12mm;flex:none}a{color:#0b5d3b;word-break:break-all;font-size:8.5pt}.dy{page-break-before:always}.tb{width:100%;border-collapse:collapse}.tb td{border-bottom:1px solid #e2e8e4;padding:4px 2px}.r{text-align:right}.pr{display:flex;gap:8px;font-size:9.5pt;color:#0b5d3b;margin:4px 0}';
  var h='<h1>'+x(t.title||t.dest)+'</h1><div class="m">'+x(t.dest)+' · '+t.n+' '+L("hari","days")+' · '+((t.ad||0)+(t.kd||0))+' '+L("orang","people")+(d0?' · '+x(dateTxt(d0))+' – '+x(dateTxt(addD(d0,t.n-1))):'')+'</div><p>'+x(t.summary||"")+'</p>';
  h+=mp(-1)+'<h2>🧭 '+L("Laluan","Route")+'</h2><p>'+route(t).map(function(r){ return x(r.c)+' ('+r.n+L("h","d")+')'; }).join(" → ")+'</p>';
  if((t.flights||[]).length) h+='<h2>✈️ '+L("Penerbangan","Flights")+'</h2>'+t.flights.map(function(f){ return '<div>'+x(f.from)+' → '+x(f.to)+' · '+x(f.when||"")+' · '+x(f.airline||"")+(f.price?' · '+x(moneyTxt(t,f.price,home()))+' '+L("seorang","pp"):'')+'</div>'; }).join("");
  if(c.total>0) h+='<h2>💰 '+L("Bajet anggaran","Estimated budget")+'</h2><table class="tb">'+c.lines.map(function(l){ return '<tr><td>'+l.ic+' '+x(l.n)+'<div class="m">'+x(l.sub||"")+'</div></td><td class="r">'+(l.h!=null?x(fmtM(l.h,home())):'')+(l.cur!==home()?'<div class="m">'+x(fmtM(l.v,l.cur))+'</div>':'')+'</td></tr>'; }).join("")+'<tr><td><b>'+L("Jumlah","Total")+'</b></td><td class="r"><b>'+x(fmtM(c.total,home()))+'</b></td></tr></table><div class="m">'+L("Anggaran AI; semak harga sebenar.","AI estimate; check the real prices.")+'</div>';
  var tp=t.tips||{}; var tk=Object.keys(tp); if(tk.length) h+='<h2>💡 '+L("Info penting","Good to know")+'</h2>'+tk.map(function(k){ return '<div><b>'+x(k)+':</b> '+x(typeof tp[k]==="string"?tp[k]:JSON.stringify(tp[k]))+'</div>'; }).join("");
  t.days.forEach(function(d,i){ var dt=dateOf(t,i), cc=cityOf(t,d.city), pr=""; if(cc.lat && H.calcDay){ try{ var p=H.calcDay(dt||addD(new Date(),i), cc.lat, cc.lon, {fa:18, ia:17, tz:cc.tz!=null?cc.tz:Math.round(cc.lon/15), ik:2}); pr='<div class="pr">🕌 '+[["subuh","Subuh"],["zohor","Zohor"],["asar","Asar"],["maghrib","Maghrib"],["isyak","Isyak"]].map(function(q){ return q[1]+' '+p[q[0]]; }).join(" · ")+'</div>'; }catch(e){} }
    h+='<div class="dy"><h2>'+L("Hari","Day")+' '+(i+1)+(dt?' · '+x(dateTxt(dt)):'')+' · '+x(d.city)+'</h2>'+mp(i)+'<div><b>'+x(d.title||"")+'</b></div>'+pr+(d.move?'<div class="m">🚆 '+x(d.move)+'</div>':'');
    (d.stops||[]).forEach(function(s){ h+='<div class="st"><div class="tm">'+x(s.t||"")+'</div>'+'<div class="ph">'+(TYPE[s.type]||"📍")+'</div>'+'<div><b>'+x(s.n)+'</b>'+(s.note?'<div>'+x(s.note)+'</div>':'')+'<div class="m">'+(s.price?x(moneyTxt(t,s.price,dayCur(t,i)))+' · ':'')+(s.type==="food"&&s.halal?x(halalTxt(s.halal)):'')+'</div><a href="'+x(gmUrl(s.n,d.city,s.ll))+'">'+x(gmUrl(s.n,d.city,s.ll))+'</a></div></div>'; });
    if(d.stay && d.stay.hotel) h+='<div class="st"><div class="tm"></div><div class="ph">🏨</div><div><b>'+x(d.stay.hotel)+'</b><div class="m">'+x(d.stay.area||"")+(d.stay.price?' · '+x(moneyTxt(t,d.stay.price,dayCur(t,i))):'')+'</div></div></div>';
    h+='</div>'; });
  h+='<p class="m" style="margin-top:14px">'+L("Dirancang dengan My Ihsan.","Planned with My Ihsan.")+'</p>';
  var full='<!doctype html><html><head><meta charset="utf-8"><style>'+css+'</style></head><body>'+h+'</body></html>', label=t.title||t.dest;
  if(window.Native && H.N.printHtml){ H.toast(L("Pilih \"Simpan sebagai PDF\" sebagai pencetak","Choose \"Save as PDF\" as the printer")); H.N.printHtml(full, label); return; }
  var fr=document.createElement("iframe"); fr.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0"; document.body.appendChild(fr); var dc=fr.contentWindow.document; dc.open(); dc.write(full); dc.close();
  setTimeout(function(){ try{ fr.contentWindow.focus(); fr.contentWindow.print(); }catch(e){} setTimeout(function(){ fr.remove(); }, 60000); }, 1200); }

window.TripView={view:view, back:back, _st:st, _jobs:jobs, _map:function(){ return MAP; }};
})();
