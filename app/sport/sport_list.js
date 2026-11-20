/* My Ihsan: Sports (Sukan) catalogue, loaded with the app (small). The sports themselves load on demand from sport/sports/<id>.js.
   Spec: docs/specs/sports-guide.md. Phase 1 has 5 sports; the others are listed as "coming soon". */
(function(){
"use strict";
// [id, icon, Malay, English, ready?, badge] ; badge: "sunnah" (🕌) or "my" (Malaysian favourite)
var LIST=[
 ["football","⚽","Bola sepak","Football",1,""],
 ["badminton","🏸","Badminton","Badminton",1,"my"],
 ["takraw","🦶","Sepak takraw","Sepak takraw",1,"my"],
 ["basketball","🏀","Bola keranjang","Basketball",1,""],
 ["swimming","🏊","Renang","Swimming",1,"sunnah"],
 ["archery","🏹","Memanah","Archery",1,"sunnah"],
 ["equestrian","🐎","Menunggang kuda","Horse riding",1,"sunnah"],
 ["cricket","🏏","Kriket","Cricket",1,""],
 ["tennis","🎾","Tenis","Tennis",1,""],
 ["volleyball","🏐","Bola tampar","Volleyball",1,""],
 ["tabletennis","🏓","Ping pong","Table tennis",1,""],
 ["pickleball","🥒","Pickleball","Pickleball",1,""],
 ["padel","🎾","Padel","Padel",1,""],
 ["hockey","🏑","Hoki","Field hockey",1,""],
 ["rugby","🏉","Ragbi","Rugby",1,""],
 ["golf","⛳","Golf","Golf",1,""],
 ["athletics","🏃","Olahraga","Athletics",1,""],
 ["cycling","🚴","Berbasikal & keirin","Cycling & keirin",1,""],
 ["f1","🏎️","Formula 1","Formula 1",1,""],
];
function ready(){ return LIST.filter(function(s){ return s[4]; }); }
// the same sport for everyone on a given day (day number since 1970, local time)
function today(d){ d=d||new Date(); var r=ready(), n=Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/864e5); return r[n%r.length]; }
function find(id){ for(var i=0;i<LIST.length;i++) if(LIST[i][0]===id) return LIST[i]; return null; }
window.SportList={LIST:LIST, ready:ready, today:today, find:find};
// Home widget "Sport of the day": a tap on it opens Move › Sports at that sport (the widget's data-wsc opens Move).
document.addEventListener("click", function(e){ var t=e.target && e.target.closest && e.target.closest("[data-sotd]"); if(!t) return;
  try{ var S=JSON.parse(localStorage.getItem("ihsan_sport")||"{}")||{}; S.open=t.getAttribute("data-sotd"); localStorage.setItem("ihsan_sport", JSON.stringify(S)); }catch(err){} }, true);
})();
