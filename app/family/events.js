/* My Ihsan 0.35.0: Majlis (Alat › Keluarga › Majlis), Farah 2026-11-07. An event planner for every kind of majlis
   (nikah, tunang, kenduri kahwin, aqiqah, doa selamat, tahlil, hari lahir, khatam, berkhatan, rumah terbuka, ... ). Nikah moved here
   (its official steps live in family.js NSTEP). Each event has eight pages that swipe sideways:
   Butiran (date, time, place, host, description, reminders) · Tetamu (names + pax, from contacts or the family tree, RSVP status,
   WhatsApp invite) · Makanan (catering, potluck or own cooking, dishes and who brings them) · Vendor (cendol, khemah, PA, ... with
   name, phone and cost) · Bajet (total budget against catering + vendors + other costs) · Atur cara (itinerary, several days) ·
   Semakan (checklist with dates) · RSVP (message templates with {placeholders}, own templates).
   Storage: ihsan_events {list:[event], tpl:[{id,n,k,x}], mig}; reminders go to ihsan_famrem.ev (read by app.js pushSchedule). */
(function(){
"use strict";
var H, L2, E, U, D, cur=null, page="info", fil="up", gF="all";
var PAGES=[["info","📋","Butiran","Details"],["guest","👥","Tetamu","Guests"],["seat","🪑","Susun meja","Seating"],["food","🍛","Makanan","Food"],["duty","🙋","Tugasan","Duties"],["vend","🧑‍🍳","Vendor","Vendors"],["bud","💰","Bajet","Budget"],["iti","🗓","Atur cara","Itinerary"],["task","✅","Semakan","Checklist"],["rsvp","💌","RSVP","RSVP"]];
// vendor categories
var VC=[["cater","🍛","Katering","Catering"],["cendol","🍧","Cendol","Cendol"],["air","🥤","Air balang","Drinks"],["ais","🍦","Aiskrim","Ice cream"],["satay","🍢","Satay","Satay"],["golek","🐑","Kambing golek","Roast lamb"],
  ["kek","🎂","Kek & pencuci mulut","Cake & desserts"],["khemah","⛺","Khemah & kanopi","Tents & canopy"],["meja","🪑","Kerusi & meja","Tables & chairs"],["dewan","🏛","Dewan / tempat","Hall / venue"],["pelamin","💐","Pelamin & hiasan","Dais & decor"],
  ["andam","💄","Mak andam & butik","Bridal make-up & attire"],["foto","📸","Jurugambar","Photographer"],["video","🎥","Video","Video"],["pa","🔊","Sistem PA","Sound system"],["kompang","🥁","Kompang","Kompang"],["nasyid","🎤","Nasyid & marhaban","Nasyid & marhaban"],
  ["ustaz","🕌","Ustaz / imam","Ustaz / imam"],["gift","🎁","Cenderamata","Door gifts"],["kad","💌","Kad jemputan","Invitation cards"],["bunga","🌸","Bunga telur & manggar","Bunga telur & manggar"],["ternak","🐐","Penternak (aqiqah / korban)","Livestock (aqiqah / qurban)"],
  ["masak","👩‍🍳","Tukang masak","Cook"],["bersih","🧹","Pembersihan","Cleaning"],["angkut","🚐","Pengangkutan","Transport"],["klinik","🩺","Klinik khatan","Circumcision clinic"],["belon","🎈","Belon & hiasan","Balloons & decor"],["lain","✨","Lain-lain","Other"]];
// event types: [key, icon, Malay, English, food mode, suggested vendors, itinerary, extra checklist [[days, ms, en]]]
var TY=[
  ["nikah","💍","Akad nikah","Nikah (marriage)","cater",["ustaz","andam","foto","cater","gift"],[["09:00","Ketibaan rombongan pengantin lelaki","Groom's party arrives"],["09:30","Khutbah nikah","Nikah sermon"],["09:45","Akad nikah (ijab dan qabul)","Akad (ijab and qabul)"],["10:00","Lafaz taklik, tandatangan dan doa","Taklik, signing and doa"],["10:30","Sesi bergambar","Photos"],["11:00","Jamuan","Meal"]],[]],
  ["tunang","💐","Majlis pertunangan","Engagement","cater",["cater","andam","foto","gift"],[["11:00","Ketibaan rombongan pihak lelaki","The man's family arrives"],["11:15","Kata-kata aluan dan perbincangan wakil","Welcome and talks between the families"],["11:45","Sarung cincin (oleh ibu / saudara perempuan)","Ring ceremony (by mother / female relative)"],["12:00","Doa","Doa"],["12:15","Jamuan","Meal"]],[[-30,"Tetapkan cincin dan dulang hantaran","Choose the ring and gift trays"],[-21,"Lantik wakil keluarga untuk bercakap","Choose a family spokesperson"],[-7,"Sahkan tempoh bertunang dan tarikh nikah dengan keluarga","Agree the engagement length and nikah date with the family"]]],
  ["walimah","🎊","Kenduri kahwin (walimah)","Wedding feast (walimah)","cater",["cater","dewan","khemah","pelamin","andam","foto","video","pa","kompang","gift","kad","bunga","cendol","air"],[["11:00","Jamuan dibuka","Meal opens"],["12:30","Ketibaan pengantin (kompang)","Couple arrives (kompang)"],["12:45","Bersanding / renjis","Sitting on the dais / blessing"],["13:15","Makan beradab","Couple's meal"],["14:00","Sesi bergambar","Photos"],["16:00","Majlis tamat","Ends"]],[[-150,"Tempah dewan atau tetapkan lokasi","Book the hall or venue"],[-120,"Tempah katering dan rasa menu","Book the caterer and taste the menu"],[-90,"Tempah pelamin, mak andam, jurugambar","Book the dais, make-up and photographer"],[-60,"Cetak / reka kad jemputan","Print or design the invitations"],[-30,"Tempah cenderamata","Order door gifts"],[-3,"Taklimat petugas (meja, pinggan, pintu)","Brief the helpers (tables, plates, door)"]]],
  ["aqiqah","🐐","Aqiqah & cukur jambul","Aqiqah & head-shaving","cater",["ternak","cater","ustaz","nasyid","gift"],[["10:00","Ketibaan tetamu","Guests arrive"],["10:30","Marhaban dan berzanji","Marhaban and berzanji"],["11:00","Cukur jambul / gunting rambut bayi","Shaving / cutting the baby's hair"],["11:30","Tahnik, doa dan bacaan doa selamat","Tahnik and doa"],["12:00","Jamuan","Meal"]],[[-14,"Tempah haiwan aqiqah: 2 ekor kambing untuk lelaki, 1 untuk perempuan (atau satu bahagian lembu)","Order the aqiqah animals: 2 goats for a boy, 1 for a girl (or a share of a cow)"],[-7,"Pilih nama yang baik","Choose a good name"],[0,"Timbang rambut dan sedekah nilai perak / emas","Weigh the hair and give its value in silver / gold as charity"],[0,"Agihkan daging aqiqah (dimasak)","Share out the cooked aqiqah meat"]]],
  ["doa","🤲","Doa selamat / kesyukuran","Doa selamat / thanksgiving","potluck",["ustaz","cater"],[["19:30","Ketibaan tetamu","Guests arrive"],["20:00","Solat Isyak berjemaah","Isyak in congregation"],["20:20","Bacaan Yasin","Yasin recitation"],["20:45","Doa selamat","Doa selamat"],["21:00","Jamuan","Meal"]],[[-7,"Jemput ustaz / imam untuk bacaan doa","Invite an ustaz / imam to lead the doa"]]],
  ["tahlil","📿","Tahlil & kenduri arwah","Tahlil & remembrance","potluck",["ustaz","cater"],[["19:30","Ketibaan tetamu","Guests arrive"],["20:00","Solat Isyak berjemaah","Isyak in congregation"],["20:20","Bacaan Yasin dan tahlil","Yasin and tahlil"],["20:50","Doa arwah","Doa for the deceased"],["21:00","Jamuan","Meal"]],[[-7,"Jemput imam tahlil","Invite the imam for tahlil"],[-3,"Sediakan buku Yasin dan tikar","Get Yasin books and mats ready"]]],
  ["bday","🎂","Hari lahir","Birthday","self",["kek","belon"],[["16:00","Ketibaan tetamu","Guests arrive"],["16:30","Permainan kanak-kanak","Games"],["17:00","Doa dan potong kek","Doa and cake"],["17:30","Jamuan","Meal"]],[[-14,"Tempah kek","Order the cake"],[-3,"Beli hiasan dan cenderamata kecil","Buy decorations and small gifts"]]],
  ["khatam","📖","Majlis khatam Al-Quran","Quran completion","cater",["ustaz","nasyid","cater","gift"],[["10:00","Ketibaan tetamu","Guests arrive"],["10:30","Bacaan surah-surah akhir oleh anak","The child reads the last surahs"],["11:00","Doa khatam Al-Quran","Doa of completion"],["11:15","Penghargaan kepada guru","Thanks to the teacher"],["11:30","Jamuan","Meal"]],[[-14,"Jemput guru Al-Quran","Invite the Quran teacher"],[-7,"Latih bacaan surah akhir","Practise the last surahs"]]],
  ["khatan","✂","Majlis berkhatan","Circumcision feast","cater",["klinik","cater","kompang","gift"],[["08:00","Ke klinik / tok mudim","To the clinic / tok mudim"],["11:00","Ketibaan tetamu","Guests arrive"],["11:30","Doa selamat","Doa selamat"],["12:00","Jamuan","Meal"]],[[-30,"Tempah klinik atau tok mudim","Book the clinic or tok mudim"],[-1,"Sediakan kain pelikat dan ubat","Prepare sarong and medicine"]]],
  ["raya","🌙","Rumah terbuka Raya","Raya open house","mixed",["cater","satay","cendol","air","ais"],[["11:00","Rumah dibuka","Open house begins"],["13:00","Solat Zohor","Zohor"],["17:00","Majlis tamat","Ends"]],[[-14,"Rancang menu raya","Plan the Raya menu"],[-3,"Beli duit raya dan sampul","Get duit raya and envelopes"]]],
  ["iftar","🍽","Majlis berbuka puasa","Iftar","cater",["cater","ustaz","air"],[["18:45","Ketibaan tetamu","Guests arrive"],["19:15","Tazkirah ringkas","Short talk"],["19:25","Doa dan berbuka","Doa and break fast"],["19:40","Solat Maghrib berjemaah","Maghrib in congregation"],["20:00","Jamuan utama","Main meal"],["20:45","Solat Isyak dan tarawih","Isyak and tarawih"]],[]],
  ["korban","🐄","Ibadah korban","Qurban","self",["ternak","masak"],[["08:00","Solat Sunat Aidiladha","Eid al-Adha prayer"],["09:30","Penyembelihan","Slaughter"],["11:00","Melapah dan agihan daging","Butchering and sharing the meat"],["13:00","Jamuan","Meal"]],[[-45,"Daftar bahagian korban (7 bahagian seekor lembu)","Register the qurban shares (7 per cow)"],[-14,"Kutip bayaran bahagian","Collect the share payments"],[-1,"Senarai penerima daging (fakir miskin, jiran)","List who receives meat (poor, neighbours)"]]],
  ["rumah","🏠","Doa rumah baru","Housewarming doa","potluck",["ustaz","cater"],[["19:30","Ketibaan tetamu","Guests arrive"],["20:00","Solat Isyak berjemaah","Isyak in congregation"],["20:20","Bacaan Yasin dan doa rumah baru","Yasin and housewarming doa"],["21:00","Jamuan","Meal"]],[]],
  ["safar","✈","Walimatus safar (Haji / Umrah)","Hajj / Umrah send-off","cater",["ustaz","cater"],[["20:00","Ketibaan tetamu","Guests arrive"],["20:15","Tazkirah dan maaf-memaafkan","Talk and asking forgiveness"],["20:45","Doa selamat jalan","Doa for the journey"],["21:00","Jamuan","Meal"]],[[-7,"Selesaikan hutang dan tulis wasiat","Settle debts and write a will"]]],
  ["grad","🎓","Majlis kesyukuran / graduasi","Thanksgiving / graduation","potluck",["kek","cater","foto"],[["16:00","Ketibaan tetamu","Guests arrive"],["16:30","Ucapan dan doa kesyukuran","Speech and thanksgiving doa"],["17:00","Jamuan","Meal"]],[]],
  ["reunion","👨‍👩‍👧","Hari keluarga / reunion","Family day / reunion","potluck",["khemah","pa","air"],[["09:00","Pendaftaran","Registration"],["09:30","Sukaneka","Games"],["12:30","Solat Zohor","Zohor"],["13:00","Makan tengah hari","Lunch"],["15:00","Cabutan bertuah dan bergambar","Lucky draw and photos"]],[[-30,"Kutip yuran / sumbangan","Collect fees / contributions"]]],
  ["bbq","🔥","Makan-makan / BBQ","Gathering / BBQ","potluck",["air"],[["17:00","Hidupkan bara","Light the grill"],["18:00","Ketibaan tetamu","Guests arrive"],["19:20","Solat Maghrib","Maghrib"],["19:45","Makan","Eat"]],[]],
  ["ceramah","🕌","Maulid / ceramah / kuliah","Maulid / religious talk","cater",["ustaz","pa","cater","khemah"],[["20:00","Solat Isyak berjemaah","Isyak in congregation"],["20:30","Selawat dan marhaban","Selawat and marhaban"],["20:45","Ceramah","Talk"],["22:00","Doa dan jamuan","Doa and meal"]],[[-21,"Jemput penceramah dan sahkan honorarium","Invite the speaker and agree the honorarium"]]],
  ["gotong","🧹","Gotong-royong","Community clean-up","potluck",["air"],[["07:30","Berkumpul dan taklimat","Gather and briefing"],["08:00","Kerja gotong-royong","Work"],["11:00","Makan bersama","Eat together"]],[]],
  ["bersara","🎉","Majlis persaraan","Retirement","cater",["cater","kek","foto","gift"],[["12:00","Ketibaan tetamu","Guests arrive"],["12:30","Ucapan","Speeches"],["13:00","Penyampaian cenderamata","Gifts"],["13:15","Jamuan","Meal"]],[]],
  ["other","✨","Lain-lain","Other","self",[],[["10:00","Ketibaan tetamu","Guests arrive"],["10:30","Aluan dan doa","Welcome and doa"],["11:00","Acara utama","Main programme"],["12:00","Jamuan","Meal"]],[]]];
var BASE=[[-45,"Tetapkan tarikh, masa dan tempat","Set the date, time and place"],[-40,"Senaraikan tetamu dan anggaran bilangan","List the guests and estimate numbers"],[-30,"Tetapkan bajet","Set the budget"],[-21,"Hantar jemputan (WhatsApp / kad)","Send invitations (WhatsApp / cards)"],[-14,"Sahkan katering dan vendor, bayar deposit","Confirm caterer and vendors, pay deposits"],[-7,"Susulan RSVP kepada yang belum jawab","Follow up guests who have not replied"],[-2,"Beli barang dapur, pinggan, cawan, plastik","Buy supplies, plates, cups, bags"],[-1,"Susun tempat dan sahkan masa vendor sampai","Set up and confirm vendor arrival times"],[1,"Hantar ucapan terima kasih dan selesaikan bayaran","Send thank-you messages and settle payments"]];
var DISH=["Nasi minyak","Nasi beriani","Nasi lemak","Ayam masak merah","Daging kuzi","Gulai kawah","Rendang","Dalca","Acar timun","Mihun goreng","Mi kari","Bubur lambuk","Lemang","Ketupat & kuah kacang","Kuih-muih","Puding","Kek","Buah-buahan","Air sirap","Teh tarik","Air kopi","Air mineral"];
var GRP=[["kel","Keluarga","Family"],["kwn","Kawan","Friends"],["jir","Jiran","Neighbours"],["kjr","Rakan kerja","Colleagues"],["msj","Masjid / surau","Mosque / surau"],["lain","Lain-lain","Others"]];
// RSVP message templates: k = inv (invitation) / fol (follow-up) / thx (thank-you)
var BT=[
  {id:"b1",k:"inv",n:"Jemputan rasmi",ne:"Formal invitation (Malay)",x:"Assalamualaikum {nama},\n\nDengan segala hormatnya, kami menjemput {jemput} ke {majlis}.\n\n📅 {hari}, {tarikh}\n🌙 {hijri}\n⏰ {masa}\n📍 {tempat}\n{alamat}\n{peta}\n\nKehadiran dan doa {jemput} amat kami hargai. Mohon sahkan kehadiran sebelum {rsvp} dengan membalas:\n*YA (bilangan orang)* atau *TIDAK*\n\nIkhlas,\n{tuan_rumah}"},
  {id:"b2",k:"inv",n:"Jemputan mesra",ne:"Friendly invitation (Malay)",x:"Salam {nama}! 😊\n\nJemput datang ke {majlis} kami ya.\n🗓 {hari}, {tarikh}, {masa}\n📍 {tempat} {peta}\n\nBoleh balas YA / TIDAK dan berapa orang? Terima kasih! 🙏\n- {tuan_rumah}"},
  {id:"b3",k:"inv",n:"Invitation (English)",ne:"Invitation (English)",x:"Assalamualaikum {nama},\n\nWe would be honoured to have you at our {majlis}.\n\n📅 {hari}, {tarikh}\n⏰ {masa}\n📍 {tempat}\n{alamat}\n{peta}\n\nKindly reply YES (number of people) or NO by {rsvp}.\n\nWarm regards,\n{tuan_rumah}"},
  {id:"b4",k:"inv",n:"Doa / tahlil ringkas",ne:"Short doa / tahlil (Malay)",x:"Assalamualaikum {nama}. Dijemput hadir ke {majlis} di {tempat}, {hari} {tarikh}, {masa}. Semoga Allah memberkati. {peta}\n- {tuan_rumah}"},
  {id:"b5",k:"fol",n:"Susulan RSVP",ne:"RSVP follow-up (Malay)",x:"Assalamualaikum {nama}, sekadar peringatan mesra tentang {majlis} pada {hari}, {tarikh} ({masa}) di {tempat}. Boleh sahkan kehadiran (YA / TIDAK, bilangan orang) sebelum {rsvp}? Terima kasih 🙏"},
  {id:"b6",k:"fol",n:"Peringatan sehari sebelum",ne:"Day-before reminder (Malay)",x:"Assalamualaikum {nama}, esok {hari} {masa} kita jumpa di {majlis}, {tempat}. {peta} Jumpa nanti, insya-Allah!"},
  {id:"b7",k:"thx",n:"Terima kasih",ne:"Thank you (Malay)",x:"Assalamualaikum {nama}, terima kasih kerana sudi hadir dan mendoakan kami di {majlis}. Semoga Allah membalas kebaikan {jemput}. 🤍\n- {tuan_rumah}"},
  {id:"b8",k:"thx",n:"Thank you (English)",ne:"Thank you (English)",x:"Assalamualaikum {nama}, thank you for joining us at {majlis} and for your kind prayers. May Allah reward you. 🤍\n- {tuan_rumah}"}];
var KN={inv:["Jemputan","Invitation"],fol:["Susulan","Follow-up"],thx:["Terima kasih","Thank you"]};

function ld(){ D=H.load("ihsan_events",null)||{}; if(!Array.isArray(D.list)) D.list=[]; if(!Array.isArray(D.tpl)) D.tpl=[]; if(!D.mig) migrate(); return D; }
function sv(){ H.save("ihsan_events",D); remSync(); if(window.EvShare) try{ EvShare.changed(); }catch(er){} }   // 0.7.17 shared events publish their changes
function EV(id){ for(var i=0;i<D.list.length;i++) if(D.list[i].id===id) return D.list[i]; return null; }
function T(k){ for(var i=0;i<TY.length;i++) if(TY[i][0]===k) return TY[i]; return TY[TY.length-1]; }
function vc(k){ for(var i=0;i<VC.length;i++) if(VC[i][0]===k) return VC[i]; return VC[VC.length-1]; }
function draw(){ if(window.EventView && EventView._draw) return EventView._draw(); if(window.FamView) FamView.draw(); }   // 0.36.0: Majlis is its own Alat page
function num(v){ v=parseFloat(v); return isFinite(v)?v:0; }
function rm(n){ return "RM "+(Math.round(n*100)/100).toLocaleString("en-MY",{minimumFractionDigits:0, maximumFractionDigits:2}); }
function bind(root, sel, fn){ var x=root.querySelector(sel); if(x) x.onclick=fn; }
function uid(){ return "e"+Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
function tm(t){ if(!t) return ""; var p=t.split(":"), h=+p[0], m=p[1]||"00";
  if(H.en()) return ((h+11)%12+1)+":"+m+(h<12?" am":" pm");
  return ((h+11)%12+1)+":"+m+" "+(h<12?"pagi":h<14?"tengah hari":h<19?"petang":"malam"); }
function evDate(e){ return e.d?U.pd(e.d):null; }
function evStart(e){ var d=evDate(e); if(!d) return null; if(e.t){ var p=e.t.split(":"); d.setHours(+p[0],+p[1]||0,0,0); } return d; }
function dRange(e){ if(!e.d) return L2("Tarikh belum ditetapkan","Date not set"); var a=U.dstr(e.d); return e.d2&&e.d2!==e.d?a+" – "+U.dstr(e.d2):a; }
function nDays(e){ if(!e.d || !e.d2) return 1; return Math.max(1, Math.min(14, U.days(U.pd(e.d), U.pd(e.d2))+1)); }
// a fresh event from its type's template
function mk(ty){ var t=T(ty), d=new Date(); d.setDate(d.getDate()+30);
  var e={id:uid(), ty:ty, n:L2(t[2],t[3]), d:"", t:"", te:"", loc:"", addr:"", host:"", desc:"", rsvpBy:"", rem:true, pre:[7,1], g:[], food:{m:t[4], cat:{}, dish:[], buf:10}, vd:[], bud:{cap:0, it:[]}, iti:[], tk:[], at:Date.now()};
  t[6].forEach(function(x){ e.iti.push({id:uid(), day:0, t:x[0], n:L2(x[1],x[2])}); });
  BASE.concat(t[7]).forEach(function(x){ e.tk.push({id:uid(), n:L2(x[1],x[2]), off:x[0]}); });
  if(ty==="nikah"){ e.nk={ck:{}}; [["Mas kahwin","Mas kahwin"],["Hantaran","Gifts (hantaran)"],["Pakaian & solekan","Clothes & make-up"]].forEach(function(b){ e.bud.it.push({id:uid(), n:L2(b[0],b[1]), a:0}); }); }
  if(ty==="aqiqah") e.bud.it.push({id:uid(), n:L2("Haiwan aqiqah","Aqiqah animals"), a:0});
  return e; }
// 0.35.0: the old Keluarga › Nikah page (F.nk) becomes a Nikah event
function migrate(){ D.mig=1; try{ var F=U.fam(), K=F.nk||{}; if(!(K.d || K.s || (K.ck && Object.keys(K.ck).length) || (K.b && Object.keys(K.b).length))) return;
    var e=mk("nikah"); e.d=K.d||""; e.nk={s:K.s||"", ck:K.ck||{}}; e.bud.it=[];
    [["mk","Mas kahwin","Mas kahwin"],["hn","Hantaran","Gifts (hantaran)"],["mj","Majlis & katering","Reception & catering"],["pk","Pakaian & solekan","Clothes & make-up"],["ln","Lain-lain","Others"]].forEach(function(b){ var a=num((K.b||{})[b[0]]); if(a) e.bud.it.push({id:uid(), n:L2(b[1],b[2]), a:a}); });
    D.list.push(e); H.save("ihsan_events",D); }catch(err){ console.error(err); } }
function taskDue(e, k){ if(k.due) return U.pd(k.due); if(k.off==null || !e.d) return null; var d=U.pd(e.d); d.setDate(d.getDate()+k.off); return d; }

// ---------- money and numbers ----------
function pax(e){ var inv=0, yes=0, no=0, wait=0, sent=0; e.g.forEach(function(g){ var p=+g.pax||1; inv+=p; if(g.st==="yes") yes+=(g.cp!=null&&g.cp!==""?+g.cp:p); else if(g.st==="no") no+=p; else wait+=p; if(g.sent) sent++; });
  return {inv:inv, yes:yes, no:no, wait:wait, sent:sent, n:e.g.length}; }
function planPax(e){ var f=e.food||{}; if(f.paxO) return +f.paxO; var p=pax(e), base=p.yes+p.wait; return Math.ceil(base*(1+(+f.buf||0)/100)); }
function catTot(e){ var c=(e.food||{}).cat||{}; if(!/cater|mixed/.test((e.food||{}).m||"")) return 0; return num(c.pp)*(c.pax?+c.pax:planPax(e))+num(c.ex); }
function money(e){ var c=(e.food||{}).cat||{}, cat=catTot(e), v=0, vp=0, it=0, ip=0;
  e.vd.forEach(function(x){ v+=num(x.cost); vp+=x.paid?num(x.cost):num(x.dep); });
  (e.bud.it||[]).forEach(function(x){ it+=num(x.a); ip+=x.paid?num(x.a):0; });
  var cp=c.paid?cat:Math.min(cat, num(c.dep)); var tot=cat+v+it, paid=cp+vp+ip;
  return {cat:cat, v:v, it:it, tot:tot, paid:paid, due:tot-paid, cap:num(e.bud.cap), left:num(e.bud.cap)-tot}; }

// ---------- messages ----------
function allTpl(k){ return BT.filter(function(t){ return !k || t.k===k; }).map(function(t){ return {id:t.id, k:t.k, n:L2(t.n,t.ne), x:t.x, b:1}; }).concat(D.tpl.filter(function(t){ return !k || t.k===k; })); }
function tplOf(e, k){ var id=(e.tp||{})[k], L=allTpl(k); for(var i=0;i<L.length;i++) if(L[i].id===id) return L[i]; if(k==="inv" && !id){ var t=T(e.ty); if(/doa|tahlil|rumah/.test(t[0])) return L.filter(function(x){ return x.id==="b4"; })[0]||L[0]; } return L[0]; }
function fill(e, x, g){ var p=g?(+g.pax||1):0, ll=e.lat!=null?{lat:e.lat,lon:e.lon}:(e.addr?{addr:e.addr}:null);
  var jem=g&&p>1?L2("tuan/puan sekeluarga","you and your family"):L2("tuan/puan","you");
  var it=e.iti.filter(function(i){ return !i.day; }).sort(function(a,b){ return (a.t||"").localeCompare(b.t||""); }).map(function(i){ return (i.t?tm(i.t)+" ":"")+i.n; }).join("\n");
  var R={nama:g?g.n:L2("tuan/puan","friends"), majlis:e.n||L2(T(e.ty)[2],T(e.ty)[3]), jenis:L2(T(e.ty)[2],T(e.ty)[3]), hari:e.d?U.wdLong(e.d):"", tarikh:dRange(e), hijri:e.d?U.hjOf(e.d):"",
    masa:(e.t?tm(e.t):"")+(e.te?" – "+tm(e.te):""), tempat:e.loc||e.addr||"", alamat:e.loc&&e.addr?e.addr:"", peta:ll?U.mapUrl(ll):"", tuan_rumah:e.host||"", pax:p||"", jemput:jem,
    rsvp:e.rsvpBy?U.dstr(e.rsvpBy):(e.d?U.dstr(U.ymd(new Date(U.pd(e.d).getTime()-7*864e5))):""), hubungi:e.contact||"", atur:it};
  return String(x||"").replace(/\{([a-z_]+)\}/g, function(m,k){ return R[k]!=null?R[k]:m; }).replace(/\n{3,}/g,"\n\n").replace(/^[ \t]*\n/gm, function(s){ return s; }).trim(); }
function wa(tel, text){ var n=tel?U.ccNum(tel):"", url="https://wa.me/"+n+"?text="+encodeURIComponent(text); H.N.openUrl(url); }
function share(text){ if(H.N.shareText) H.N.shareText(text); else { try{ navigator.clipboard.writeText(text); }catch(e){} H.toast(L2("Disalin","Copied")); } }
function pickContact(done){
  if(window.Native && H.N.pickContact){ var hl=function(r){ H.off("contact",hl); if(r && !r.cancel && !r.error && (r.n||r.tel)) done(r.n||r.tel, r.tel||""); else if(r && r.error) H.toast(L2("Kenalan tidak dapat dibuka","Could not open contacts")); }; H.on("contact",hl); H.N.pickContact(); return; }
  var n=prompt(L2("Nama kenalan (pratonton web)","Contact name (web preview)")); if(!n) return; done(n, prompt(L2("No. telefon","Phone"))||""); }

// ---------- reminders ----------
function remSync(){
  var out=[], up=[], now=Date.now(), at=function(d,h,m){ var x=new Date(d); x.setHours(h,m||0,0,0); return x.getTime(); };
  D.list.forEach(function(e){ var d=evDate(e); if(!d) return; var s=evStart(e)||at(d,9); if((s.getTime?s.getTime():s)>now-864e5) up.push({n:e.n, ic:T(e.ty)[1], t:d.getTime(), tm:e.t||""});
    if(e.rem===false) return; var nm=T(e.ty)[1]+" "+e.n;
    (e.pre||[7,1]).forEach(function(n){ var t=at(new Date(d.getTime()-n*864e5),9); if(t>now) out.push({t:t, k:"ev"+e.id+"p"+n, ti:nm, b:(n===1?L2("Esok","Tomorrow"):L2("Lagi "+n+" hari","In "+n+" days"))+" · "+U.dstr(e.d)+(e.t?", "+tm(e.t):"")+(e.loc?" · "+e.loc:"")}); });
    var st=e.t?evStart(e).getTime()-2*36e5:at(d,8); if(st>now) out.push({t:st, k:"ev"+e.id+"d", ti:nm, b:L2("Hari ini","Today")+(e.t?", "+tm(e.t):"")+(e.loc?" · "+e.loc:"")});
    if(e.rsvpBy){ var p=pax(e), tr=at(U.pd(e.rsvpBy),9); if(tr>now) out.push({t:tr, k:"ev"+e.id+"r", ti:"💌 "+e.n, b:L2("Tarikh akhir RSVP hari ini","RSVP closes today")}); }
    e.tk.forEach(function(k){ if(k.done) return; var dd=taskDue(e,k); if(!dd || !k.rem) return; var t=at(dd,9); if(t>now) out.push({t:t, k:"evt"+e.id+k.id, ti:"✅ "+k.n, b:e.n}); });
    e.vd.forEach(function(v){ if(!v.time || !e.d) return; var p=v.time.split(":"), t=at(d,+p[0],+p[1]||0)-60*6e4; if(t>now && v.rem) out.push({t:t, k:"evv"+e.id+v.id, ti:vc(v.cat)[1]+" "+(v.n||L2(vc(v.cat)[2],vc(v.cat)[3])), b:L2("Vendor sampai dalam 1 jam","Vendor arrives in 1 hour")+(v.tel?" · "+v.tel:"")}); }); });
  up.sort(function(a,b){ return a.t-b.t; });
  var R=H.load("ihsan_famrem",null)||{}; R.ev=out.slice(0,80); R.evs=up.slice(0,6); H.save("ihsan_famrem",R); try{ H.resched(); }catch(e){} }

// ---------- list of events ----------
function pList(el){
  var t=U.today(), L=D.list.filter(function(e){ var d=evDate(e), d2=e.d2?U.pd(e.d2):d; return fil==="up" ? (!d || d2>=t) : (d && d2<t); }).sort(function(a,b){ var x=a.d||"9999", y=b.d||"9999"; return fil==="up"?x.localeCompare(y):y.localeCompare(x); });
  var h='<div class="card"><div class="row"><h3 style="margin:0">🎉 '+L2("Perancang majlis","Event planner")+'</h3><button class="btn gold g3d" id="evNew">＋ '+L2("Majlis","Event")+'</button></div>'+'<button class="btn alt g3d" id="evJoin" style="margin-top:8px">🔗 '+L2("Sertai majlis dikongsi","Join a shared event")+'</button>'+
    '<div class="chips fseg"><button class="chip g3d'+(fil==="up"?" on":"")+'" data-fl="up">'+L2("Akan datang","Upcoming")+'</button><button class="chip g3d'+(fil==="past"?" on":"")+'" data-fl="past">'+L2("Telah berlalu","Past")+'</button></div></div>';
  h+=L.length?L.map(function(e){ var ty=T(e.ty), d=evDate(e), n=d?U.days(t,d):null, p=pax(e), m=money(e), dn=e.tk.filter(function(k){ return k.done; }).length;
    return '<button class="card evc" data-eo="'+e.id+'"><span class="evic">'+ty[1]+'</span><span class="fmain"><b>'+E(e.n)+(e.sh?' <span class="evShB">🔗</span>':'')+'</b><small>'+E(L2(ty[2],ty[3]))+' · '+dRange(e)+(e.t?' · '+tm(e.t):'')+'</small>'+
      '<small>👥 '+p.yes+'/'+p.inv+L2(" hadir"," coming")+' · ✅ '+dn+'/'+e.tk.length+(m.tot?' · 💰 '+rm(m.tot):'')+'</small></span>'+(n!=null&&n>=0?'<span class="evcd"><b>'+(n===0?"🎉":n)+'</b><small>'+(n===0?L2("hari ini","today"):L2("hari","days"))+'</small></span>':'')+'</button>'; }).join("")
    :'<div class="card mut small">'+(fil==="up"?L2("Tiada majlis akan datang. Tekan ＋ Majlis untuk mula merancang: nikah, kenduri, aqiqah, doa selamat, hari lahir dan banyak lagi.","No upcoming events. Tap ＋ Event to start planning: nikah, kenduri, aqiqah, doa selamat, birthdays and more."):L2("Tiada majlis lepas.","No past events."))+'</div>';
  el.innerHTML=h;
  el.querySelector("#evNew").onclick=newEv;
  el.querySelector("#evJoin").onclick=function(){ var u=prompt(L2("Tampal pautan majlis yang dikongsi","Paste the shared event link"),""); if(!u) return; var go=function(){ EvShare.joinSheet(H, u, function(id){ ld(); cur=id; page="info"; draw(); }); }; if(window.EvShare) go(); else H.loadJs(["family/evshare.js"], go, function(){}); };
  el.querySelectorAll("[data-fl]").forEach(function(b){ b.onclick=function(){ fil=b.getAttribute("data-fl"); draw(); }; });
  el.querySelectorAll("[data-eo]").forEach(function(b){ b.onclick=function(){ cur=b.getAttribute("data-eo"); page="info"; draw(); document.getElementById("view").scrollTop=0; }; }); }
function newEv(){
  var ov=H.showSheet("🎉 "+L2("Jenis majlis","Kind of event"), '<div class="evtys">'+TY.map(function(t){ return '<button class="evty g3d" data-ty="'+t[0]+'"><span>'+t[1]+'</span><small>'+E(L2(t[2],t[3]))+'</small></button>'; }).join("")+'</div>');
  ov.querySelectorAll("[data-ty]").forEach(function(b){ b.onclick=function(){ var e=mk(b.getAttribute("data-ty")); D.list.push(e); sv(); cur=e.id; page="info"; H.closeOverlay(); draw(); document.getElementById("view").scrollTop=0; H.toast(L2("Senarai semak dan atur cara contoh ditambah","A sample checklist and itinerary were added")); }; }); }

// ---------- page: details ----------
function fv(id, lab, val, type, ex){ return H.fld(id, lab, val, type, ex); }
function pInfo(el, e){
  var ty=T(e.ty);
  var h='<div class="card"><label class="fl">'+L2("Jenis majlis","Kind of event")+'<select data-f="ty">'+TY.map(function(t){ return '<option value="'+t[0]+'"'+(t[0]===e.ty?" selected":"")+'>'+t[1]+' '+E(L2(t[2],t[3]))+'</option>'; }).join("")+'</select></label>'+
    fv("efN",L2("Nama majlis","Event name"),e.n,"text",' data-f="n"')+
    '<div class="f2">'+fv("efD",L2("Tarikh","Date"),e.d,"date",' data-f="d"')+fv("efD2",L2("Hingga (jika lebih sehari)","Until (if more than a day)"),e.d2||"","date",' data-f="d2"')+'</div>'+
    (e.d?'<div class="mut small">📅 '+U.wdLong(e.d)+(U.hjOf(e.d)?' · 🌙 '+U.hjOf(e.d):'')+'</div>':'')+
    '<div class="f2">'+fv("efT",L2("Mula","Starts"),e.t,"time",' data-f="t"')+fv("efTe",L2("Tamat","Ends"),e.te,"time",' data-f="te"')+'</div>'+
    fv("efL",L2("Tempat","Venue"),e.loc,"text",' data-f="loc" placeholder="'+L2("cth. Dewan Orang Ramai Kg. Baru / rumah","e.g. community hall / our house")+'"')+
    '<label class="fl">'+L2("Alamat","Address")+'<textarea data-f="addr" rows="2">'+E(e.addr||"")+'</textarea></label>'+
    '<div class="btns" style="margin:4px 0 6px"><button class="btn alt g3d" id="efLoc">📍 '+L2("Lokasi saya sekarang","My location now")+'</button><button class="btn alt g3d" id="efMap">🗺 '+L2("Peta","Map")+'</button></div>'+
    (e.lat!=null?'<div class="mut tiny">📍 '+(+e.lat).toFixed(5)+', '+(+e.lon).toFixed(5)+' <button class="chip" id="efLLx">✕</button></div>':'')+
    fv("efH",L2("Tuan rumah / penganjur","Host / organiser"),e.host,"text",' data-f="host" placeholder="'+L2("cth. Ahmad & Siti sekeluarga","e.g. Ahmad & Siti and family")+'"')+
    fv("efC",L2("Hubungi (untuk RSVP)","Contact (for RSVP)"),e.contact||"","text",' data-f="contact" placeholder="'+L2("nama dan no. telefon","name and phone")+'"')+
    fv("efR",L2("Tarikh akhir RSVP","RSVP by"),e.rsvpBy||"","date",' data-f="rsvpBy"')+
    fv("efDr",L2("Tema / pakaian","Theme / dress code"),e.dress||"","text",' data-f="dress"')+
    '<label class="fl">'+L2("Keterangan","Description")+'<textarea data-f="desc" rows="3" placeholder="'+L2("Nota, parkir, arah ke rumah, dll.","Notes, parking, directions, etc.")+'">'+E(e.desc||"")+'</textarea></label></div>';
  h+='<div class="card"><div class="row"><label class="trt"><span>🔔 '+L2("Peringatan","Reminders")+'</span><span class="switch sm"><input type="checkbox" id="efRem" '+(e.rem!==false?"checked":"")+'><span></span></span></label></div>'+
    '<div class="chips wrap">'+[30,14,7,3,1].map(function(n){ return '<button class="chip g3d'+((e.pre||[]).indexOf(n)>=0?" on":"")+'" data-pre="'+n+'">'+n+L2(" hari sebelum"," days before")+'</button>'; }).join("")+'</div><div class="mut tiny">'+L2("Jam 9 pagi pada hari-hari itu, dan 2 jam sebelum majlis bermula.","At 9 am on those days, and 2 hours before the event starts.")+'</div></div>';
  h+='<button class="btn '+(e.sh?'alt':'gold')+' g3d full" id="efShare" style="margin-bottom:8px">🔗 '+(e.sh?L2("Dikongsi langsung · jemput lagi","Shared live · invite more"):L2("Kongsi langsung dengan kumpulan (tetamu, meja, semua)","Share live with a group (guests, tables, everything)"))+'</button>';
  h+='<div class="btns"><button class="btn alt g3d" id="efPr">🖨 '+L2("Cetak / PDF pelan","Print / PDF plan")+'</button><button class="btn alt g3d" id="efDup">⧉ '+L2("Salin majlis","Duplicate")+'</button><button class="btn alt g3d" id="efDel">🗑 '+L2("Padam","Delete")+'</button></div>';
  el.innerHTML=h;
  bindF(el, e, function(k){ if(k==="ty"||k==="d"||k==="d2") draw(); });
  el.querySelector("#efRem").onchange=function(){ e.rem=this.checked; sv(); };
  el.querySelectorAll("[data-pre]").forEach(function(b){ b.onclick=function(){ var n=+b.getAttribute("data-pre"); e.pre=e.pre||[]; var i=e.pre.indexOf(n); if(i>=0) e.pre.splice(i,1); else e.pre.push(n); sv(); b.classList.toggle("on", i<0); }; });
  el.querySelector("#efLoc").onclick=function(){ var b=this; b.textContent="⏳"; var hl=function(r){ H.off("location",hl); b.textContent="📍 "+L2("Lokasi saya sekarang","My location now"); if(r.error||r.lat==null){ H.toast(L2("Lokasi tidak tersedia","Location unavailable")); return; } e.lat=+(+r.lat).toFixed(5); e.lon=+(+r.lon).toFixed(5); sv(); draw(); };
    H.on("location",hl); H.N.getLocation(); };
  el.querySelector("#efMap").onclick=function(){ if(e.lat==null && !e.addr && !e.loc){ H.toast(L2("Isi alamat dahulu","Fill in the address first")); return; } H.N.openUrl(U.mapUrl(e.lat!=null?{lat:e.lat,lon:e.lon}:{addr:e.addr||e.loc})); };
  bind(el,"#efLLx",function(){ delete e.lat; delete e.lon; sv(); draw(); });
  el.querySelector("#efPr").onclick=function(){ printPlan(e); };
  el.querySelector("#efShare").onclick=function(){ shareLive(e); };
  el.querySelector("#efDup").onclick=function(){ var c=JSON.parse(JSON.stringify(e)); c.id=uid(); c.n=e.n+" ("+L2("salinan","copy")+")"; c.d=""; c.d2=""; c.g.forEach(function(g){ g.st=""; g.sent=0; g.cp=null; }); c.tk.forEach(function(k){ k.done=false; }); D.list.push(c); sv(); cur=c.id; draw(); H.toast(L2("Disalin","Duplicated")); };
  el.querySelector("#efDel").onclick=function(){ if(!confirm(L2("Padam "+e.n+"?","Delete "+e.n+"?"))) return; D.list=D.list.filter(function(x){ return x!==e; }); cur=null; sv(); draw(); }; }
// inputs with data-f="path.to.field" save on change
function bindF(root, obj, after){ root.querySelectorAll("[data-f]").forEach(function(i){ i.onchange=function(){ var k=i.getAttribute("data-f").split("."), o=obj; for(var j=0;j<k.length-1;j++){ o[k[j]]=o[k[j]]||{}; o=o[k[j]]; }
    var v=i.type==="checkbox"?i.checked:(i.type==="number"?(i.value===""?"":num(i.value)):i.value.trim()); o[k[k.length-1]]=v; sv(); if(after) after(i.getAttribute("data-f")); }; }); }

// ---------- page: guests ----------
function stIc(s){ return s==="yes"?"✓":s==="no"?"✗":"?"; }
function pGuest(el, e){
  var p=pax(e), G=e.g.filter(function(g){ return gF==="all" || (gF==="unsent"&&!g.sent) || (gF==="wait"&&!g.st) || g.st===gF || g.grp===gF; });
  var h='<div class="card"><div class="fsum bb4"><div><small>'+L2("Dijemput","Invited")+'</small><b>'+p.inv+'</b><small>'+p.n+L2(" jemputan"," invites")+'</small></div><div><small>'+L2("Hadir","Coming")+'</small><b class="evok">'+p.yes+'</b></div><div><small>'+L2("Belum jawab","No reply")+'</small><b>'+p.wait+'</b></div><div><small>'+L2("Tidak","Not coming")+'</small><b>'+p.no+'</b></div></div>'+
    '<div class="bbbar"><i style="width:'+(p.n?Math.round(p.sent/p.n*100):0)+'%"></i></div><div class="mut tiny">💬 '+p.sent+'/'+p.n+L2(" jemputan dihantar"," invitations sent")+'</div>'+
    '<div class="btns" style="margin-top:8px"><button class="btn gold g3d" id="egC">📇 '+L2("Dari kenalan","From contacts")+'</button><button class="btn alt g3d" id="egA">＋ '+L2("Tetamu","Guest")+'</button><button class="btn alt g3d" id="egF">🌳 '+L2("Salasilah","Family tree")+'</button></div>'+
    '<div class="btns" style="margin-top:6px"><button class="btn alt g3d" id="egS">💬 '+L2("Hantar jemputan satu per satu","Send invitations one by one")+'</button><button class="btn alt g3d" id="egSh">📤 '+L2("Kongsi ke kumpulan","Share to a group")+'</button></div></div>';
  h+='<div class="chips fseg">'+[["all",L2("Semua","All")],["unsent",L2("Belum dihantar","Not sent")],["wait",L2("Belum jawab","No reply")],["yes","✓ "+L2("Hadir","Coming")],["no","✗ "+L2("Tidak","No")]].concat(GRP.filter(function(g){ return e.g.some(function(x){ return x.grp===g[0]; }); }).map(function(g){ return [g[0], L2(g[1],g[2])]; })).map(function(x){ return '<button class="chip g3d'+(gF===x[0]?" on":"")+'" data-gf="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>';
  h+=G.length?'<div class="card flist">'+G.map(function(g){ var gr=GRP.filter(function(x){ return x[0]===g.grp; })[0];
    return '<div class="frow evg"><button class="evst '+(g.st||"")+'" data-gs="'+g.id+'">'+stIc(g.st)+'</button><button class="fmain" data-ge="'+g.id+'"><b>'+E(g.n)+'</b><small>'+(g.tel?E(g.tel)+' · ':'')+(+g.pax||1)+L2(" orang"," pax")+(g.st==="yes"&&g.cp!=null&&g.cp!==""&&+g.cp!==(+g.pax||1)?' → '+g.cp:'')+(gr?' · '+E(L2(gr[1],gr[2])):'')+(g.sent?' · 💬 '+L2("dihantar","sent"):'')+'</small></button><button class="chip g3d" data-gw="'+g.id+'">💬</button></div>'; }).join("")+'</div>'
    :'<div class="card mut small">'+(e.g.length?L2("Tiada tetamu dalam tapisan ini.","No guests in this filter."):L2("Tambah tetamu dari kenalan telefon, salasilah keluarga, atau taip nama dan bilangan orang (pax).","Add guests from your phone contacts, the family tree, or type a name and number of people (pax)."))+'</div>';
  el.innerHTML=h;
  el.querySelectorAll("[data-gf]").forEach(function(b){ b.onclick=function(){ gF=b.getAttribute("data-gf"); draw(); }; });
  el.querySelector("#egC").onclick=function(){ pickContact(function(n,t){ if(t && e.g.some(function(x){ return x.tel && U.ccNum(x.tel)===U.ccNum(t); })){ H.toast(L2("Sudah ada dalam senarai","Already on the list")); return; } e.g.push({id:uid(), n:n, tel:t, pax:1, grp:"", st:""}); sv(); draw(); H.toast("＋ "+n+" · "+L2("tekan nama untuk ubah pax","tap the name to change pax")); }); };
  el.querySelector("#egA").onclick=function(){ guestEdit(e, null); };
  el.querySelector("#egF").onclick=function(){ famPick(e); };
  el.querySelector("#egS").onclick=function(){ sendSeq(e, "inv"); };
  el.querySelector("#egSh").onclick=function(){ share(fill(e, tplOf(e,"inv").x, null)); };
  el.querySelectorAll("[data-ge]").forEach(function(b){ b.onclick=function(){ guestEdit(e, b.getAttribute("data-ge")); }; });
  el.querySelectorAll("[data-gs]").forEach(function(b){ b.onclick=function(){ var g=gid(e,b.getAttribute("data-gs")); g.st=g.st===""||!g.st?"yes":g.st==="yes"?"no":""; sv(); draw(); }; });
  el.querySelectorAll("[data-gw]").forEach(function(b){ b.onclick=function(){ var g=gid(e,b.getAttribute("data-gw")); sendOne(e, g); }; }); }
function gid(e,id){ for(var i=0;i<e.g.length;i++) if(e.g[i].id===id) return e.g[i]; return null; }
function sendOne(e, g){ var kind=g.sent?(g.st==="yes"&&evDate(e)&&evDate(e)<U.today()?"thx":"fol"):"inv";
  var ov=H.showSheet("💬 "+E(g.n), '<div class="chips fseg">'+["inv","fol","thx"].map(function(k){ return '<button class="chip g3d'+(k===kind?" on":"")+'" data-sk="'+k+'">'+L2(KN[k][0],KN[k][1])+'</button>'; }).join("")+'</div><textarea id="soT" class="ilq" rows="9"></textarea>'+
    '<button class="btn gold full g3d" id="soGo">💬 '+L2("Buka WhatsApp","Open WhatsApp")+'</button>'+(g.tel?'':'<div class="mut tiny">'+L2("Tiada nombor: WhatsApp akan minta anda pilih penerima.","No number: WhatsApp will ask you to pick the person.")+'</div>'));
  var put=function(){ ov.querySelector("#soT").value=fill(e, tplOf(e,kind).x, g); };
  ov.querySelectorAll("[data-sk]").forEach(function(b){ b.onclick=function(){ kind=b.getAttribute("data-sk"); ov.querySelectorAll("[data-sk]").forEach(function(x){ x.classList.toggle("on",x===b); }); put(); }; }); put();
  ov.querySelector("#soGo").onclick=function(){ wa(g.tel, ov.querySelector("#soT").value); if(kind==="inv"){ g.sent=Date.now(); sv(); } H.closeOverlay(); draw(); }; }
// one guest after another: open WhatsApp for each, mark as sent, next
function sendSeq(e, kind){
  var L=e.g.filter(function(g){ return kind==="inv"?(!g.sent&&!g.st):kind==="fol"?(g.sent&&!g.st):g.st==="yes"; });
  if(!L.length){ H.toast(kind==="inv"?L2("Semua jemputan sudah dihantar","All invitations have been sent"):L2("Tiada tetamu untuk mesej ini","No guests for this message")); return; }
  var i=0, paint=function(){ var g=L[i];
    var ov=H.showSheet("💬 "+L2(KN[kind][0],KN[kind][1])+" "+(i+1)+"/"+L.length, '<div class="evseq"><b>'+E(g.n)+'</b><small>'+(g.tel?E(g.tel):L2("tiada nombor","no number"))+' · '+(+g.pax||1)+L2(" orang"," pax")+'</small></div><textarea id="sqT" class="ilq" rows="8">'+E(fill(e, tplOf(e,kind).x, g))+'</textarea>'+
      '<div class="btns"><button class="btn gold g3d" id="sqGo">💬 '+L2("Hantar","Send")+'</button><button class="btn alt g3d" id="sqSk">'+L2("Langkau","Skip")+' ›</button></div><div class="mut tiny" style="margin-top:6px">'+L2("Selepas menghantar, kembali ke aplikasi ini untuk tetamu seterusnya.","After sending, come back to this app for the next guest.")+'</div>', function(){ draw(); });
    var nx=function(){ i++; if(i<L.length) paint(); else { H.closeOverlay(); draw(); H.toast(L2("Selesai","Done")); } };
    ov.querySelector("#sqGo").onclick=function(){ wa(g.tel, ov.querySelector("#sqT").value); if(kind==="inv") g.sent=Date.now(); sv(); setTimeout(nx, 400); };
    ov.querySelector("#sqSk").onclick=nx; };
  paint(); }
function guestEdit(e, id){
  var g=id?gid(e,id):{n:"", tel:"", pax:1, grp:"", st:""}, st=g.st||"";
  var ov=H.showSheet((id?"✎ ":"＋ ")+L2("Tetamu","Guest"),
    '<div class="fnrow">'+H.fld("egN",L2("Nama","Name"),g.n)+'<button class="btn gold g3d" id="egOk">✓ '+L2("Simpan","Save")+'</button></div>'+
    '<div class="fnrow">'+H.fld("egT",L2("No. telefon","Phone"),g.tel,"tel")+'<button class="btn alt g3d evpc" id="egPc">📇</button></div>'+
    '<div class="f2">'+H.fld("egP",L2("Bilangan orang (pax)","Number of people (pax)"),g.pax||1,"number",' inputmode="numeric" min="1"')+'<label class="fl">'+L2("Kumpulan","Group")+'<select id="egG"><option value="">–</option>'+GRP.map(function(x){ return '<option value="'+x[0]+'"'+(g.grp===x[0]?" selected":"")+'>'+E(L2(x[1],x[2]))+'</option>'; }).join("")+'</select></label></div>'+
    '<div class="snl">RSVP</div><div class="chips fseg" id="egSt">'+[["","? "+L2("Belum jawab","No reply")],["yes","✓ "+L2("Hadir","Coming")],["no","✗ "+L2("Tidak hadir","Not coming")]].map(function(x){ return '<button class="chip'+(st===x[0]?" on":"")+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>'+
    H.fld("egCp",L2("Pax disahkan (jika berbeza)","Confirmed pax (if different)"),g.cp!=null?g.cp:"","number",' inputmode="numeric"')+
    H.fld("egNo",L2("Nota","Note"),g.note||"")+
    '<label class="fdk"><input type="checkbox" id="egSn"'+(g.sent?" checked":"")+'> 💬 '+L2("Jemputan sudah dihantar","Invitation sent")+'</label>'+
    (id?'<button class="btn alt full g3d" id="egX" style="margin-top:6px">🗑 '+L2("Buang","Remove")+'</button>':''));
  ov.querySelectorAll("#egSt [data-v]").forEach(function(b){ b.onclick=function(){ st=b.getAttribute("data-v"); ov.querySelectorAll("#egSt [data-v]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
  ov.querySelector("#egPc").onclick=function(){ pickContact(function(n,t){ if(!ov.querySelector("#egN").value.trim()) ov.querySelector("#egN").value=n; ov.querySelector("#egT").value=t; }); };
  ov.querySelector("#egOk").onclick=function(){ var v=function(s){ return ov.querySelector(s).value.trim(); }; if(!v("#egN")){ H.toast(L2("Isi nama","Fill in a name")); return; }
    g.n=v("#egN"); g.tel=v("#egT"); g.pax=Math.max(1, Math.round(num(v("#egP")))||1); g.grp=v("#egG"); g.st=st; g.cp=v("#egCp")===""?null:Math.round(num(v("#egCp"))); g.note=v("#egNo"); g.sent=ov.querySelector("#egSn").checked?(g.sent||Date.now()):0;
    if(!id){ g.id=uid(); e.g.push(g); } sv(); H.closeOverlay(); draw(); };
  bind(ov,"#egX",function(){ e.g=e.g.filter(function(x){ return x!==g; }); sv(); H.closeOverlay(); draw(); }); }
function famPick(e){ var F=U.fam(), have={}; e.g.forEach(function(g){ if(g.pid) have[g.pid]=1; });
  var L=(F.p||[]).filter(function(p){ return !p.dd && !p.dead && !have[p.id] && p.id!==F.me; });
  if(!L.length){ H.toast(L2("Tiada nama baru dalam salasilah","No new names in the family tree")); return; }
  var ov=H.showSheet("🌳 "+L2("Jemput keluarga","Invite family"), '<div class="flist">'+L.map(function(p){ var r=U.rel(p); return '<label class="frow"><input type="checkbox" data-fp="'+p.id+'"> <span class="fmain"><b>'+E(p.n)+'</b><small>'+E(r||"")+(p.tel?' · ☎ '+E(p.tel):'')+'</small></span></label>'; }).join("")+'</div><button class="btn gold full g3d" id="fpOk" style="margin-top:8px">✓ '+L2("Tambah","Add")+'</button>');
  ov.querySelector("#fpOk").onclick=function(){ var n=0; ov.querySelectorAll("[data-fp]").forEach(function(c){ if(!c.checked) return; var p=U.P(c.getAttribute("data-fp")); e.g.push({id:uid(), n:p.n, tel:p.tel||"", pax:1, grp:"kel", st:"", pid:p.id}); n++; }); sv(); H.closeOverlay(); draw(); if(n) H.toast("＋ "+n); }; }

// ---------- page: food ----------
function pFood(el, e){
  var f=e.food=e.food||{m:"cater", cat:{}, dish:[], buf:10}; f.cat=f.cat||{}; f.dish=f.dish||[];
  var p=pax(e), pp=planPax(e), c=f.cat, cater=/cater|mixed/.test(f.m), pot=/potluck|mixed/.test(f.m);
  var h='<div class="card"><h3>🍛 '+L2("Makanan","Food")+'</h3><div class="chips fseg">'+[["cater","🍛 "+L2("Katering","Catering")],["potluck","🥘 Potluck"],["self","👩‍🍳 "+L2("Masak sendiri","Cook ourselves")],["mixed","🔀 "+L2("Campur","Mixed")]].map(function(x){ return '<button class="chip g3d'+(f.m===x[0]?" on":"")+'" data-fm="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>'+
    '<div class="fsum bb3"><div><small>'+L2("Hadir + belum jawab","Coming + no reply")+'</small><b>'+(p.yes+p.wait)+'</b></div><div><small>'+L2("Lebihan %","Extra %")+'</small><b><input class="evnum" type="number" inputmode="numeric" data-f="food.buf" value="'+(f.buf!=null?f.buf:10)+'"></b></div><div><small>'+L2("Anggaran pax","Plan for")+'</small><b>'+pp+'</b></div></div>'+
    fv("efPo",L2("Tetapkan pax sendiri (pilihan)","Set your own pax (optional)"),f.paxO||"","number",' data-f="food.paxO" inputmode="numeric"')+'</div>';
  if(cater){ var tot=catTot(e);
    h+='<div class="card"><h3>🍛 '+L2("Katering","Catering")+'</h3><div class="fnrow">'+fv("efCn",L2("Nama katering","Caterer"),c.n||"","text",' data-f="food.cat.n"')+'<button class="btn alt g3d evpc" id="efCpc">📇</button></div>'+fv("efCt",L2("Telefon","Phone"),c.tel||"","tel",' data-f="food.cat.tel"')+
      '<label class="fl">'+L2("Pakej / menu","Package / menu")+'<textarea data-f="food.cat.menu" rows="3">'+E(c.menu||"")+'</textarea></label>'+
      '<div class="f2">'+fv("efCp",L2("Harga seorang (RM)","Price per pax (RM)"),c.pp||"","number",' data-f="food.cat.pp" inputmode="decimal" step="0.01"')+fv("efCx",L2("Pax ditempah","Pax booked"),c.pax||"","number",' data-f="food.cat.pax" inputmode="numeric" placeholder="'+pp+'"')+'</div>'+
      '<div class="f2">'+fv("efCe",L2("Caj lain (RM)","Other charges (RM)"),c.ex||"","number",' data-f="food.cat.ex" inputmode="decimal"')+fv("efCd",L2("Deposit dibayar (RM)","Deposit paid (RM)"),c.dep||"","number",' data-f="food.cat.dep" inputmode="decimal"')+'</div>'+
      '<label class="fdk"><input type="checkbox" data-f="food.cat.paid"'+(c.paid?" checked":"")+'> '+L2("Sudah bayar penuh","Paid in full")+'</label>'+
      '<div class="ftot"><span>'+L2("Jumlah katering","Catering total")+'</span><b>'+rm(tot)+'</b></div>'+(c.tel?'<div class="btns"><button class="chip g3d" data-call="'+E(c.tel)+'">📞</button><button class="chip g3d" data-wa="'+E(c.tel)+'">💬</button></div>':'')+'</div>'; }
  h+='<div class="card"><div class="row"><h3 style="margin:0">'+(pot?"🥘 "+L2("Senarai potluck","Potluck list"):"📝 "+L2("Menu","Menu"))+'</h3><span class="mut small">'+f.dish.filter(function(d){ return d.ok; }).length+'/'+f.dish.length+' ✓</span></div>'+
    (f.dish.length?'<div class="flist">'+f.dish.map(function(d){ return '<div class="frow"><label class="fck"><input type="checkbox" data-dk="'+d.id+'" '+(d.ok?"checked":"")+'><span></span></label><button class="fmain" data-de="'+d.id+'"><b>'+E(d.n)+(d.q?' <em class="mut">· '+E(d.q)+'</em>':'')+'</b><small>'+(d.who?'🙋 '+E(d.who):(pot?L2("Belum ada yang bawa","Nobody yet"):''))+'</small></button>'+(d.tel?'<button class="chip g3d" data-dw="'+d.id+'">💬</button>':'')+'</div>'; }).join("")+'</div>':'<div class="mut small">'+L2("Tambah hidangan dan siapa yang bawa.","Add dishes and who brings them.")+'</div>')+
    '<div class="chips fseg">'+DISH.filter(function(n){ return !f.dish.some(function(d){ return d.n===n; }); }).map(function(n){ return '<button class="chip" data-dq="'+E(n)+'">＋ '+E(n)+'</button>'; }).join("")+'</div>'+
    '<div class="btns"><button class="btn alt g3d" id="efDa">＋ '+L2("Hidangan","Dish")+'</button>'+(pot&&f.dish.length?'<button class="btn alt g3d" id="efDs">📤 '+L2("Kongsi senarai","Share list")+'</button>':'')+'</div></div>';
  el.innerHTML=h;
  bindF(el, e, function(k){ if(/buf|paxO|pp|cat\.pax|ex|dep|paid/.test(k)) draw(); });
  el.querySelectorAll("[data-fm]").forEach(function(b){ b.onclick=function(){ f.m=b.getAttribute("data-fm"); sv(); draw(); }; });
  bind(el,"#efCpc",function(){ pickContact(function(n,t){ c.n=c.n||n; c.tel=t; sv(); draw(); }); });
  callWa(el);
  el.querySelectorAll("[data-dk]").forEach(function(x){ x.onchange=function(){ did(f,x.getAttribute("data-dk")).ok=x.checked; sv(); }; });
  el.querySelectorAll("[data-de]").forEach(function(b){ b.onclick=function(){ dishEdit(e, b.getAttribute("data-de")); }; });
  el.querySelectorAll("[data-dq]").forEach(function(b){ b.onclick=function(){ f.dish.push({id:uid(), n:b.getAttribute("data-dq")}); sv(); draw(); }; });
  el.querySelectorAll("[data-dw]").forEach(function(b){ b.onclick=function(){ var d=did(f,b.getAttribute("data-dw")); wa(d.tel, L2("Assalamualaikum "+d.who+", untuk "+e.n+" pada "+dRange(e)+": boleh tolong bawa "+d.n+(d.q?" ("+d.q+")":"")+"? Terima kasih 🙏","Assalamualaikum "+d.who+", for "+e.n+" on "+dRange(e)+": could you bring "+d.n+(d.q?" ("+d.q+")":"")+"? Thank you 🙏")); }; });
  bind(el,"#efDa",function(){ dishEdit(e, null); });
  bind(el,"#efDs",function(){ share("🥘 "+L2("Potluck ","Potluck: ")+e.n+" · "+dRange(e)+"\n\n"+f.dish.map(function(d,i){ return (i+1)+". "+d.n+(d.q?" ("+d.q+")":"")+" — "+(d.who||"…"); }).join("\n")+"\n\n"+L2("Sila tulis nama anda pada hidangan yang belum ada pembawa 🙏","Please add your name next to a dish nobody has picked yet 🙏")); }); }
function did(f,id){ for(var i=0;i<f.dish.length;i++) if(f.dish[i].id===id) return f.dish[i]; return {}; }
function dishEdit(e, id){ var f=e.food, d=id?did(f,id):{n:""};
  var ov=H.showSheet((id?"✎ ":"＋ ")+L2("Hidangan","Dish"), H.fld("edN",L2("Hidangan","Dish"),d.n)+H.fld("edQ",L2("Kuantiti","Quantity"),d.q||"","text",' placeholder="'+L2("cth. 1 periuk, 50 ketul","e.g. 1 pot, 50 pieces")+'"')+
    '<label class="fl">'+L2("Siapa bawa","Who brings it")+'<select id="edG"><option value="">–</option>'+e.g.map(function(g){ return '<option value="'+g.id+'"'+(d.gid===g.id?" selected":"")+'>'+E(g.n)+'</option>'; }).join("")+'</select></label>'+
    '<div class="fnrow">'+H.fld("edW",L2("atau taip nama","or type a name"),d.who||"")+'<button class="btn alt g3d evpc" id="edPc">📇</button></div>'+H.fld("edT",L2("Telefon","Phone"),d.tel||"","tel")+
    '<button class="btn gold full g3d" id="edOk" style="margin-top:6px">✓ '+L2("Simpan","Save")+'</button>'+(id?'<button class="btn alt full g3d" id="edX" style="margin-top:6px">🗑 '+L2("Buang","Remove")+'</button>':''));
  ov.querySelector("#edG").onchange=function(){ var g=gid(e,this.value); if(g){ ov.querySelector("#edW").value=g.n; ov.querySelector("#edT").value=g.tel||""; } };
  ov.querySelector("#edPc").onclick=function(){ pickContact(function(n,t){ ov.querySelector("#edW").value=n; ov.querySelector("#edT").value=t; }); };
  ov.querySelector("#edOk").onclick=function(){ var v=function(s){ return ov.querySelector(s).value.trim(); }; if(!v("#edN")) return; d.n=v("#edN"); d.q=v("#edQ"); d.gid=v("#edG")||null; d.who=v("#edW"); d.tel=v("#edT"); if(!id){ d.id=uid(); f.dish.push(d); } sv(); H.closeOverlay(); draw(); };
  bind(ov,"#edX",function(){ f.dish=f.dish.filter(function(x){ return x!==d; }); sv(); H.closeOverlay(); draw(); }); }
function callWa(el){ el.querySelectorAll("[data-call]").forEach(function(b){ b.onclick=function(){ H.N.openUrl(U.telUrl(b.getAttribute("data-call"))); }; });
  el.querySelectorAll("[data-wa]").forEach(function(b){ b.onclick=function(){ H.N.openUrl(U.waUrl(b.getAttribute("data-wa"))); }; }); }

// ---------- page: vendors ----------
function pVend(el, e){
  var tot=0, paid=0; e.vd.forEach(function(v){ tot+=num(v.cost); paid+=v.paid?num(v.cost):num(v.dep); });
  var sug=T(e.ty)[5].filter(function(k){ return k!=="cater" && !e.vd.some(function(v){ return v.cat===k; }); });
  var h='<div class="card"><div class="row"><h3 style="margin:0">🧑‍🍳 '+L2("Vendor & petugas","Vendors & helpers")+'</h3><button class="btn gold g3d" id="evVa">＋ '+L2("Vendor","Vendor")+'</button></div>'+
    '<div class="fsum bb3" style="margin-top:8px"><div><small>'+L2("Kos","Cost")+'</small><b>'+rm(tot)+'</b></div><div><small>'+L2("Dibayar","Paid")+'</small><b class="evok">'+rm(paid)+'</b></div><div><small>'+L2("Baki","To pay")+'</small><b>'+rm(tot-paid)+'</b></div></div>'+
    (sug.length?'<div class="snl">'+L2("Cadangan untuk ","Suggested for ")+E(L2(T(e.ty)[2],T(e.ty)[3]))+'</div><div class="chips fseg">'+sug.map(function(k){ var c=vc(k); return '<button class="chip" data-vs="'+k+'">＋ '+c[1]+' '+E(L2(c[2],c[3]))+'</button>'; }).join("")+'</div>':'')+'</div>';
  var cats={}; e.vd.forEach(function(v){ (cats[v.cat]=cats[v.cat]||[]).push(v); });
  VC.forEach(function(c){ var L=cats[c[0]]; if(!L) return;
    h+='<div class="card flist"><div class="bbvh"><b>'+c[1]+' '+E(L2(c[2],c[3]))+'</b></div>'+L.map(function(v){ return '<div class="frow"><button class="fmain" data-ve="'+v.id+'"><b>'+E(v.n||L2("(belum ada nama)","(no name yet)"))+'</b><small>'+[v.cost?rm(num(v.cost))+(v.paid?" ✓":v.dep?" · "+L2("deposit ","deposit ")+rm(num(v.dep)):""):"", v.time?"⏰ "+tm(v.time):"", v.note||""].filter(Boolean).map(E).join(" · ")+'</small></button>'+(v.tel?'<button class="chip g3d" data-call="'+E(v.tel)+'">📞</button><button class="chip g3d" data-wa="'+E(v.tel)+'">💬</button>':'')+'</div>'; }).join("")+'</div>'; });
  if(!e.vd.length) h+='<div class="card mut small">'+L2("Contoh: cendol, air balang, khemah, kerusi meja, sistem PA, jurugambar, kompang. Simpan nama, no. telefon dan kos setiap satu.","For example: cendol, drinks, tents, tables and chairs, sound system, photographer, kompang. Keep the name, phone and cost of each.")+'</div>';
  el.innerHTML=h;
  el.querySelector("#evVa").onclick=function(){ vendEdit(e, null, ""); };
  el.querySelectorAll("[data-vs]").forEach(function(b){ b.onclick=function(){ vendEdit(e, null, b.getAttribute("data-vs")); }; });
  el.querySelectorAll("[data-ve]").forEach(function(b){ b.onclick=function(){ vendEdit(e, b.getAttribute("data-ve")); }; });
  callWa(el); }
function vendEdit(e, id, cat){ var v=id?e.vd.filter(function(x){ return x.id===id; })[0]:{cat:cat||"lain", n:""};
  var ov=H.showSheet((id?"✎ ":"＋ ")+L2("Vendor","Vendor"), '<label class="fl">'+L2("Jenis","Kind")+'<select id="evC">'+VC.map(function(c){ return '<option value="'+c[0]+'"'+(v.cat===c[0]?" selected":"")+'>'+c[1]+' '+E(L2(c[2],c[3]))+'</option>'; }).join("")+'</select></label>'+
    '<div class="fnrow">'+H.fld("evN",L2("Nama vendor / orang","Vendor / person"),v.n)+'<button class="btn alt g3d evpc" id="evPc">📇</button></div>'+H.fld("evT",L2("Telefon","Phone"),v.tel||"","tel")+
    '<div class="f2">'+H.fld("evK",L2("Kos (RM)","Cost (RM)"),v.cost||"","number",' inputmode="decimal" step="0.01"')+H.fld("evD",L2("Deposit (RM)","Deposit (RM)"),v.dep||"","number",' inputmode="decimal" step="0.01"')+'</div>'+
    '<label class="fdk"><input type="checkbox" id="evPd"'+(v.paid?" checked":"")+'> '+L2("Sudah bayar penuh","Paid in full")+'</label>'+
    '<div class="f2">'+H.fld("evTm",L2("Masa sampai","Arrival time"),v.time||"","time")+'<label class="fdk" style="margin-top:22px"><input type="checkbox" id="evRm"'+(v.rem?" checked":"")+'> 🔔 '+L2("1 jam sebelum","1 hour before")+'</label></div>'+
    H.fld("evO",L2("Nota (pakej, kuantiti)","Note (package, quantity)"),v.note||"")+
    '<button class="btn gold full g3d" id="evOk" style="margin-top:6px">✓ '+L2("Simpan","Save")+'</button>'+(id?'<button class="btn alt full g3d" id="evX" style="margin-top:6px">🗑 '+L2("Buang","Remove")+'</button>':''));
  ov.querySelector("#evPc").onclick=function(){ pickContact(function(n,t){ if(!ov.querySelector("#evN").value.trim()) ov.querySelector("#evN").value=n; ov.querySelector("#evT").value=t; }); };
  ov.querySelector("#evOk").onclick=function(){ var g=function(s){ return ov.querySelector(s).value.trim(); }; v.cat=g("#evC"); v.n=g("#evN"); v.tel=g("#evT"); v.cost=num(g("#evK")); v.dep=num(g("#evD")); v.paid=ov.querySelector("#evPd").checked; v.time=g("#evTm"); v.rem=ov.querySelector("#evRm").checked; v.note=g("#evO");
    if(!id){ v.id=uid(); e.vd.push(v); } sv(); H.closeOverlay(); draw(); };
  bind(ov,"#evX",function(){ e.vd=e.vd.filter(function(x){ return x!==v; }); sv(); H.closeOverlay(); draw(); }); }

// ---------- page: budget ----------
function pBud(el, e){
  var m=money(e), p=pax(e), pct=m.cap?Math.min(100, Math.round(m.tot/m.cap*100)):0, ppl=Math.max(p.yes, planPax(e));
  var h='<div class="card"><h3>💰 '+L2("Bajet keseluruhan","Total budget")+'</h3>'+fv("ebC",L2("Bajet (RM)","Budget (RM)"),e.bud.cap||"","number",' data-f="bud.cap" inputmode="decimal"')+
    '<div class="fsum bb3"><div><small>'+L2("Anggaran kos","Planned cost")+'</small><b>'+rm(m.tot)+'</b></div><div><small>'+L2("Baki bajet","Left in budget")+'</small><b class="'+(m.cap&&m.left<0?"fwarnc":"evok")+'">'+(m.cap?rm(m.left):"–")+'</b></div><div><small>'+L2("Seorang","Per guest")+'</small><b>'+(ppl?rm(m.tot/ppl):"–")+'</b></div></div>'+
    (m.cap?'<div class="bbbar'+(m.left<0?" over":"")+'"><i style="width:'+pct+'%"></i></div>':'')+
    '<div class="fsum" style="margin-top:8px"><div><small>'+L2("Sudah dibayar","Paid")+'</small><b class="evok">'+rm(m.paid)+'</b></div><div><small>'+L2("Belum dibayar","Still to pay")+'</small><b>'+rm(m.due)+'</b></div></div></div>';
  h+='<div class="card flist"><div class="frow"><span class="fmain"><b>🍛 '+L2("Katering","Catering")+'</b><small>'+(m.cat?planPax(e)+" pax":L2("tiada / potluck","none / potluck"))+'</small></span><b>'+rm(m.cat)+'</b></div>'+
    '<div class="frow"><span class="fmain"><b>🧑‍🍳 '+L2("Vendor","Vendors")+'</b><small>'+e.vd.length+'</small></span><b>'+rm(m.v)+'</b></div>'+
    (e.bud.it||[]).map(function(x){ return '<div class="frow"><label class="fck"><input type="checkbox" data-bp="'+x.id+'" '+(x.paid?"checked":"")+'><span></span></label><button class="fmain" data-be="'+x.id+'"><b>'+E(x.n)+'</b><small>'+(x.paid?L2("dibayar","paid"):L2("belum bayar","not paid"))+'</small></button><b>'+rm(num(x.a))+'</b></div>'; }).join("")+
    '<div class="ftot"><span>'+L2("Jumlah","Total")+'</span><b>'+rm(m.tot)+'</b></div><button class="btn alt full g3d" id="ebA">＋ '+L2("Perbelanjaan lain","Other cost")+'</button></div>';
  if(e.ty==="nikah") h+='<div class="card mut tiny">'+L2("Kadar minimum mas kahwin berbeza mengikut negeri. Semak dengan pejabat agama Islam negeri.","The minimum mas kahwin differs by state. Check with the state Islamic religious office.")+'</div>';
  el.innerHTML=h;
  bindF(el, e, function(){ draw(); });
  el.querySelectorAll("[data-bp]").forEach(function(c){ c.onchange=function(){ e.bud.it.forEach(function(x){ if(x.id===c.getAttribute("data-bp")) x.paid=c.checked; }); sv(); draw(); }; });
  el.querySelectorAll("[data-be]").forEach(function(b){ b.onclick=function(){ costEdit(e, b.getAttribute("data-be")); }; });
  el.querySelector("#ebA").onclick=function(){ costEdit(e, null); }; }
function costEdit(e, id){ var x=id?e.bud.it.filter(function(y){ return y.id===id; })[0]:{n:"", a:""};
  var ov=H.showSheet((id?"✎ ":"＋ ")+L2("Perbelanjaan","Cost"), H.fld("ecN",L2("Perkara","Item"),x.n,"text",' placeholder="'+L2("cth. pinggan kertas, sewa kereta","e.g. paper plates, car rental")+'"')+H.fld("ecA",L2("Jumlah (RM)","Amount (RM)"),x.a,"number",' inputmode="decimal" step="0.01"')+
    '<label class="fdk"><input type="checkbox" id="ecP"'+(x.paid?" checked":"")+'> '+L2("Sudah dibayar","Paid")+'</label><button class="btn gold full g3d" id="ecOk" style="margin-top:6px">✓ '+L2("Simpan","Save")+'</button>'+(id?'<button class="btn alt full g3d" id="ecX" style="margin-top:6px">🗑 '+L2("Buang","Remove")+'</button>':''));
  ov.querySelector("#ecOk").onclick=function(){ var n=ov.querySelector("#ecN").value.trim(); if(!n) return; x.n=n; x.a=num(ov.querySelector("#ecA").value); x.paid=ov.querySelector("#ecP").checked; if(!id){ x.id=uid(); e.bud.it.push(x); } sv(); H.closeOverlay(); draw(); };
  bind(ov,"#ecX",function(){ e.bud.it=e.bud.it.filter(function(y){ return y!==x; }); sv(); H.closeOverlay(); draw(); }); }

// ---------- page: itinerary ----------
var itiDay=0;
function pIti(el, e){
  var nd=nDays(e); if(itiDay>=nd) itiDay=0;
  var L=e.iti.filter(function(i){ return (i.day||0)===itiDay; }).sort(function(a,b){ return (a.t||"99").localeCompare(b.t||"99"); });
  var dd=function(k){ if(!e.d) return L2("Hari ","Day ")+(k+1); var d=U.pd(e.d); d.setDate(d.getDate()+k); return d.toLocaleDateString(ibLoc(H.en()),{weekday:"short",day:"numeric",month:"short"}); };
  var h='<div class="card"><div class="row"><h3 style="margin:0">🗓 '+L2("Atur cara","Itinerary")+'</h3><button class="btn gold g3d" id="eiA">＋ '+L2("Aktiviti","Activity")+'</button></div>'+
    (nd>1?'<div class="chips fseg">'+Array.apply(null,{length:nd}).map(function(_,k){ return '<button class="chip g3d'+(k===itiDay?" on":"")+'" data-id="'+k+'">'+dd(k)+'</button>'; }).join("")+'</div>':(e.d?'<div class="mut small">'+dd(0)+'</div>':''))+'</div>';
  h+=L.length?'<div class="card evtl">'+L.map(function(i){ return '<button class="evti" data-ie="'+i.id+'"><span class="evtt">'+(i.t?tm(i.t):"–")+(i.te?'<small>'+tm(i.te)+'</small>':'')+'</span><span class="fmain"><b style="white-space:normal">'+E(i.n)+'</b><small>'+[i.who?"🙋 "+E(i.who):"", i.loc?"📍 "+E(i.loc):"", i.note?E(i.note):""].filter(Boolean).join(" · ")+'</small></span></button>'; }).join("")+'</div>'
    :'<div class="card mut small">'+L2("Tiada aktiviti untuk hari ini.","No activities for this day.")+' <button class="chip g3d" id="eiT">＋ '+L2("Contoh atur cara","Sample itinerary")+'</button></div>';
  h+='<div class="btns"><button class="btn alt g3d" id="eiS">📤 '+L2("Kongsi atur cara","Share itinerary")+'</button></div>';
  el.innerHTML=h;
  el.querySelectorAll("[data-id]").forEach(function(b){ b.onclick=function(){ itiDay=+b.getAttribute("data-id"); draw(); }; });
  el.querySelector("#eiA").onclick=function(){ itiEdit(e, null); };
  el.querySelectorAll("[data-ie]").forEach(function(b){ b.onclick=function(){ itiEdit(e, b.getAttribute("data-ie")); }; });
  bind(el,"#eiT",function(){ T(e.ty)[6].forEach(function(x){ e.iti.push({id:uid(), day:itiDay, t:x[0], n:L2(x[1],x[2])}); }); sv(); draw(); });
  el.querySelector("#eiS").onclick=function(){ var t="🗓 "+e.n+"\n"+dRange(e)+(e.loc?"\n📍 "+e.loc:"")+"\n";
    for(var k=0;k<nd;k++){ var Ls=e.iti.filter(function(i){ return (i.day||0)===k; }).sort(function(a,b){ return (a.t||"99").localeCompare(b.t||"99"); }); if(!Ls.length) continue; if(nd>1) t+="\n"+dd(k)+"\n"; else t+="\n"; t+=Ls.map(function(i){ return (i.t?tm(i.t)+(i.te?"–"+tm(i.te):"")+"  ":"")+i.n+(i.who?" ("+i.who+")":""); }).join("\n")+"\n"; }
    share(t.trim()); }; }
function itiEdit(e, id){ var i=id?e.iti.filter(function(x){ return x.id===id; })[0]:{day:itiDay, t:"", n:""}, nd=nDays(e);
  var ov=H.showSheet((id?"✎ ":"＋ ")+L2("Aktiviti","Activity"), H.fld("eiN",L2("Aktiviti","Activity"),i.n)+'<div class="f2">'+H.fld("eiT1",L2("Mula","Starts"),i.t,"time")+H.fld("eiT2",L2("Tamat","Ends"),i.te||"","time")+'</div>'+
    (nd>1?'<label class="fl">'+L2("Hari","Day")+'<select id="eiD">'+Array.apply(null,{length:nd}).map(function(_,k){ return '<option value="'+k+'"'+((i.day||0)===k?" selected":"")+'>'+L2("Hari ","Day ")+(k+1)+'</option>'; }).join("")+'</select></label>':'')+
    H.fld("eiW",L2("Petugas / PIC","Person in charge"),i.who||"")+H.fld("eiL",L2("Tempat","Place"),i.loc||"")+H.fld("eiO",L2("Nota","Note"),i.note||"")+
    '<button class="btn gold full g3d" id="eiOk" style="margin-top:6px">✓ '+L2("Simpan","Save")+'</button>'+(id?'<button class="btn alt full g3d" id="eiX" style="margin-top:6px">🗑 '+L2("Buang","Remove")+'</button>':''));
  ov.querySelector("#eiOk").onclick=function(){ var g=function(s){ var x=ov.querySelector(s); return x?x.value.trim():""; }; if(!g("#eiN")) return; i.n=g("#eiN"); i.t=g("#eiT1"); i.te=g("#eiT2"); if(nd>1) i.day=+g("#eiD"); i.who=g("#eiW"); i.loc=g("#eiL"); i.note=g("#eiO"); if(!id){ i.id=uid(); e.iti.push(i); } sv(); H.closeOverlay(); draw(); };
  bind(ov,"#eiX",function(){ e.iti=e.iti.filter(function(x){ return x!==i; }); sv(); H.closeOverlay(); draw(); }); }

// ---------- page: checklist (nikah events also get the official steps) ----------
// 0.7.93 (owner #37): who does which job. Presets, assign from the guest list or any name, tick when done, share one list with the potluck dishes and RSVP count, remind everyone the evening before.
var DUTY=[["Sambut tetamu","Welcome guests"],["Susun kerusi & meja","Set out chairs & tables"],["Pasang khemah","Put up the tent"],["Jaga tempat letak kereta","Parking"],["Ketua doa / tahlil","Lead the doa / tahlil"],["Hidang makanan","Serve the food"],["Air minuman","Drinks"],["Basuh pinggan","Wash up"],["Ambil gambar","Photos"],["Kemas selepas majlis","Clear up afterwards"],["Jaga kanak-kanak","Look after the children"],["Bungkus makanan lebih","Pack leftover food"]];
function pDuty(el, e){ e.duty=e.duty||[]; var p=pax(e), f=e.food||{dish:[]}, names=(e.g||[]).map(function(g){ return g.n; }).filter(Boolean);
  var h='<div class="card"><h3>🙋 '+L2("Tugasan","Duties")+'</h3><div class="mut small">'+L2("RSVP: ","RSVP: ")+'✅ '+p.yes+' · ❔ '+p.wait+' · ❌ '+p.no+' · '+L2("hidangan potluck ","potluck dishes ")+((f.dish||[]).length)+'</div>'+
    (e.duty.length?'<div class="flist">'+e.duty.map(function(d){ return '<div class="frow"><label class="fck"><input type="checkbox" data-uk="'+d.id+'" '+(d.ok?"checked":"")+'><span></span></label><div class="fmain"><b>'+E(d.n)+'</b><small>'+(d.who?"🙋 "+E(d.who):'<span class="mut">'+L2("belum ada orang","nobody yet")+'</span>')+(d.tm?" · "+E(d.tm):"")+'</small></div><button class="chip" data-uw="'+d.id+'">🙋</button><button class="evDx" data-ux="'+d.id+'">✕</button></div>'; }).join("")+'</div>':'<div class="mut small" style="margin:6px 0">'+L2("Pilih tugasan di bawah atau tulis sendiri.","Pick duties below or write your own.")+'</div>')+
    '<div class="chips" style="flex-wrap:wrap;margin-top:8px">'+DUTY.filter(function(x){ return !e.duty.some(function(d){ return d.n===L2(x[0],x[1]); }); }).map(function(x){ return '<button class="chip" data-uq="'+E(L2(x[0],x[1]))+'">＋ '+E(L2(x[0],x[1]))+'</button>'; }).join("")+'</div>'+
    '<div class="row" style="gap:6px;margin-top:8px"><input id="euN" class="rin" style="flex:1" maxlength="60" placeholder="'+L2("Tugasan lain…","Another duty…")+'"><button class="btn gold" id="euA">＋</button></div>'+
    '<div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap"><button class="btn alt" id="euS">📤 '+L2("Kongsi senarai tugasan & potluck","Share duties & potluck")+'</button><button class="btn alt" id="euR">🔔 '+L2("Ingatkan malam sebelum","Remind the evening before")+'</button></div></div>';
  el.innerHTML=h;
  var find=function(id){ return e.duty.filter(function(d){ return d.id===id; })[0]; };
  el.querySelectorAll("[data-uk]").forEach(function(c){ c.onchange=function(){ var d=find(c.getAttribute("data-uk")); if(d){ d.ok=c.checked; sv(); } }; });
  el.querySelectorAll("[data-uq]").forEach(function(b){ b.onclick=function(){ e.duty.push({id:uid(), n:b.getAttribute("data-uq")}); sv(); draw(); }; });
  el.querySelectorAll("[data-ux]").forEach(function(b){ b.onclick=function(){ var id=b.getAttribute("data-ux"); e.duty=e.duty.filter(function(d){ return d.id!==id; }); sv(); draw(); }; });
  el.querySelectorAll("[data-uw]").forEach(function(b){ b.onclick=function(){ var d=find(b.getAttribute("data-uw")); if(!d) return;
    var body='<div class="chips" style="flex-wrap:wrap">'+names.map(function(n){ return '<button class="chip'+(d.who===n?" on":"")+'" data-un="'+E(n)+'">'+E(n)+'</button>'; }).join("")+'</div><input id="euW" class="rin" style="width:100%;margin-top:8px" maxlength="40" placeholder="'+L2("Atau tulis nama","Or type a name")+'" value="'+E(d.who||"")+'"><input id="euT" class="rin" type="time" style="width:100%;margin-top:8px" value="'+E(d.tm||"")+'"><button class="btn gold full" id="euOk" style="margin-top:8px">'+L2("Simpan","Save")+'</button>';
    var ov=H.showSheet("🙋 "+E(d.n), body); ov.querySelectorAll("[data-un]").forEach(function(x){ x.onclick=function(){ ov.querySelector("#euW").value=x.getAttribute("data-un"); }; });
    ov.querySelector("#euOk").onclick=function(){ d.who=ov.querySelector("#euW").value.trim(); d.tm=ov.querySelector("#euT").value; sv(); H.closeOverlay(); draw(); }; }; });
  bind(el,"#euA",function(){ var v=el.querySelector("#euN").value.trim(); if(!v) return; e.duty.push({id:uid(), n:v.slice(0,60)}); sv(); draw(); });
  bind(el,"#euS",function(){ share("🙋 "+L2("Tugasan ","Duties: ")+e.n+" · "+dRange(e)+(e.loc?" · "+e.loc:"")+"\n\n"+e.duty.map(function(d,i){ return (i+1)+". "+d.n+(d.tm?" ("+d.tm+")":"")+" — "+(d.who||"…"); }).join("\n")+
    ((f.dish||[]).length?"\n\n🥘 Potluck:\n"+f.dish.map(function(d,i){ return (i+1)+". "+d.n+(d.q?" ("+d.q+")":"")+" — "+(d.who||"…"); }).join("\n"):"")+"\n\n"+L2("Sila balas jika ada perubahan. Terima kasih!","Please reply if anything changes. Thank you!")); });
  bind(el,"#euR",function(){ if(!e.d){ H.toast(L2("Tetapkan tarikh majlis dahulu","Set the event date first")); return; } if(!H.xrem){ H.toast(L2("Peringatan tidak tersedia","Reminders are not available")); return; }
    var d0=U.pd(e.d); d0.setDate(d0.getDate()-1); d0.setHours(20,0,0,0); var mine=e.duty.map(function(d){ return d.n+(d.who?" — "+d.who:""); }).join(", ");
    var ok=H.xrem("evduty_"+e.id, d0.getTime(), "🙋 "+L2("Esok: ","Tomorrow: ")+e.n, mine||L2("Semak tugasan majlis","Check the event duties"), "majlis");
    H.toast(ok?"🔔 "+L2("Peringatan ditetapkan untuk malam sebelum","Reminder set for the evening before"):L2("Tarikh sudah lepas","That date has passed")); });
}
function pTask(el, e){
  var t=U.today(), h='';
  if(e.ty==="nikah"){ var K=e.nk=e.nk||{ck:{}}, d=evDate(e), NS=U.NSTEP;
    h+='<div class="card"><h3>💍 '+L2("Langkah rasmi nikah","Official nikah steps")+'</h3><label class="fl">'+L2("Negeri (pihak perempuan)","State (bride's side)")+'<select id="enS"><option value="">–</option>'+U.STATES.map(function(s){ return '<option'+(K.s===s?" selected":"")+'>'+s+'</option>'; }).join("")+'</select></label>'+
      '<div class="flist">'+NS.map(function(s){ var due=d?new Date(d.getTime()+s[0]*864e5):null, on=!!(K.ck||{})[s[1]], late=due&&!on&&due<t;
        return '<div class="frow'+(on?" fdone":"")+'"><label class="fck"><input type="checkbox" data-nk="'+s[1]+'" '+(on?"checked":"")+'><span></span></label><span class="fmain"><b style="white-space:normal">'+s[2]+' '+E(L2(s[3],s[4]))+'</b><small class="'+(late?"fwarnc":"")+'">'+(due?(s[0]===0?L2("Hari akad","Akad day"):(s[0]<0?L2("Sebelum ","By ")+U.dstr(U.ymd(due)):L2("Selepas, sekitar ","After, around ")+U.dstr(U.ymd(due)))):L2("Isi tarikh akad di Butiran","Set the akad date in Details"))+'</small></span></div>'; }).join("")+'</div>'+
      '<div class="mut tiny">'+L2("Langkah umum di Malaysia; syarat, borang dan fi tepat ditetapkan oleh jabatan agama Islam setiap negeri.","General steps in Malaysia; exact requirements, forms and fees are set by each state's Islamic religious department.")+'</div></div>'; }
  var L=e.tk.slice().sort(function(a,b){ var x=taskDue(e,a), y=taskDue(e,b); if(a.done!==b.done) return a.done?1:-1; return (x?x.getTime():1e15)-(y?y.getTime():1e15); }), dn=e.tk.filter(function(k){ return k.done; }).length;
  h+='<div class="card"><div class="row"><h3 style="margin:0">✅ '+L2("Senarai semak","Checklist")+'</h3><span class="mut small">'+dn+'/'+e.tk.length+'</span></div><div class="bbbar"><i style="width:'+(e.tk.length?Math.round(dn/e.tk.length*100):0)+'%"></i></div>'+
    '<div class="flist">'+L.map(function(k){ var d=taskDue(e,k), late=d&&!k.done&&d<t;
      return '<div class="frow'+(k.done?" fdone":"")+'"><label class="fck"><input type="checkbox" data-tk="'+k.id+'" '+(k.done?"checked":"")+'><span></span></label><button class="fmain" data-te="'+k.id+'"><b style="white-space:normal">'+E(k.n)+'</b><small class="'+(late?"fwarnc":"")+'">'+(d?(late?L2("Lewat · ","Late · "):"")+U.dstr(U.ymd(d)):L2("Tiada tarikh","No date"))+(k.who?" · 🙋 "+E(k.who):"")+(k.rem?" · 🔔":"")+'</small></button></div>'; }).join("")+'</div>'+
    '<button class="btn alt full g3d" id="etA" style="margin-top:6px">＋ '+L2("Tugasan","Task")+'</button></div>';
  el.innerHTML=h;
  var ss=el.querySelector("#enS"); if(ss) ss.onchange=function(){ e.nk.s=this.value; sv(); };
  el.querySelectorAll("[data-nk]").forEach(function(c){ c.onchange=function(){ e.nk.ck=e.nk.ck||{}; e.nk.ck[c.getAttribute("data-nk")]=c.checked; sv(); draw(); }; });
  el.querySelectorAll("[data-tk]").forEach(function(c){ c.onchange=function(){ e.tk.forEach(function(k){ if(k.id===c.getAttribute("data-tk")) k.done=c.checked; }); sv(); draw(); }; });
  el.querySelectorAll("[data-te]").forEach(function(b){ b.onclick=function(){ taskEdit(e, b.getAttribute("data-te")); }; });
  el.querySelector("#etA").onclick=function(){ taskEdit(e, null); }; }
function taskEdit(e, id){ var k=id?e.tk.filter(function(x){ return x.id===id; })[0]:{n:""}, d=taskDue(e,k);
  var ov=H.showSheet((id?"✎ ":"＋ ")+L2("Tugasan","Task"), H.fld("etN",L2("Tugasan","Task"),k.n)+H.fld("etD",L2("Tarikh","Date"),d?U.ymd(d):"","date")+H.fld("etW",L2("Siapa buat","Who does it"),k.who||"")+
    '<label class="fdk"><input type="checkbox" id="etR"'+(k.rem?" checked":"")+'> 🔔 '+L2("Ingatkan jam 9 pagi pada tarikh itu","Remind me at 9 am on that date")+'</label>'+
    '<button class="btn gold full g3d" id="etOk" style="margin-top:6px">✓ '+L2("Simpan","Save")+'</button>'+(id?'<button class="btn alt full g3d" id="etX" style="margin-top:6px">🗑 '+L2("Buang","Remove")+'</button>':''));
  ov.querySelector("#etOk").onclick=function(){ var n=ov.querySelector("#etN").value.trim(); if(!n) return; k.n=n; var nd=ov.querySelector("#etD").value; var auto=k.off!=null&&e.d?U.ymd(taskDue(e,{off:k.off})):""; if(nd && nd!==auto){ k.due=nd; } else if(!nd){ delete k.due; if(!auto) delete k.off; } k.who=ov.querySelector("#etW").value.trim(); k.rem=ov.querySelector("#etR").checked; if(!id){ k.id=uid(); k.done=false; e.tk.push(k); } sv(); H.closeOverlay(); draw(); };
  bind(ov,"#etX",function(){ e.tk=e.tk.filter(function(x){ return x!==k; }); sv(); H.closeOverlay(); draw(); }); }

// ---------- page: RSVP templates ----------
var rk="inv";
function pRsvp(el, e){
  var tp=tplOf(e, rk), L=allTpl(rk), g0=e.g[0]||null, p=pax(e);
  var cnt={inv:e.g.filter(function(g){ return !g.sent&&!g.st; }).length, fol:e.g.filter(function(g){ return g.sent&&!g.st; }).length, thx:e.g.filter(function(g){ return g.st==="yes"; }).length};
  var h='<div class="card"><h3>💌 '+L2("Mesej RSVP","RSVP messages")+'</h3><div class="chips fseg">'+["inv","fol","thx"].map(function(k){ return '<button class="chip g3d'+(rk===k?" on":"")+'" data-rk="'+k+'">'+L2(KN[k][0],KN[k][1])+' <small>'+cnt[k]+'</small></button>'; }).join("")+'</div>'+
    '<label class="fl">'+L2("Templat","Template")+'<select id="erT">'+L.map(function(t){ return '<option value="'+t.id+'"'+(t.id===tp.id?" selected":"")+'>'+(t.b?"":"★ ")+E(t.n)+'</option>'; }).join("")+'</select></label>'+
    '<textarea id="erX" class="ilq" rows="10">'+E(tp.x)+'</textarea>'+
    '<div class="chips fseg evph">'+["nama","majlis","hari","tarikh","hijri","masa","tempat","alamat","peta","tuan_rumah","pax","jemput","rsvp","hubungi","atur"].map(function(k){ return '<button class="chip" data-ph="'+k+'">{'+k+'}</button>'; }).join("")+'</div>'+
    '<div class="btns"><button class="btn alt g3d" id="erSv">💾 '+(tp.b?L2("Simpan sebagai templat saya","Save as my template"):L2("Simpan templat","Save template"))+'</button>'+(tp.b?'':'<button class="btn alt g3d" id="erDl">🗑</button>')+'</div></div>';
  h+='<div class="card"><div class="snl">'+L2("Pratonton","Preview")+(g0?' · '+E(g0.n):'')+'</div><div class="evprev" id="erP">'+E(fill(e, tp.x, g0)).replace(/\n/g,"<br>")+'</div>'+
    '<div class="btns" style="margin-top:8px"><button class="btn gold g3d" id="erGo">💬 '+L2("Hantar kepada ","Send to ")+cnt[rk]+L2(" tetamu"," guests")+'</button><button class="btn alt g3d" id="erSh">📤 '+L2("Kongsi","Share")+'</button></div>'+
    '<div class="mut tiny" style="margin-top:6px">'+L2("Setiap tetamu dibuka dalam WhatsApp dengan nama dan bilangan orang mereka. Tetamu membalas YA / TIDAK; tandakan jawapan mereka di Tetamu.","Each guest opens in WhatsApp with their own name and number of people. Guests reply YES / NO; mark their answer under Guests.")+' ('+p.yes+' '+L2("hadir","coming")+')</div></div>';
  el.innerHTML=h;
  var ta=el.querySelector("#erX"), prev=function(){ var x=el.querySelector("#erP"); if(x) x.innerHTML=E(fill(e, ta.value, g0)).replace(/\n/g,"<br>"); };
  ta.oninput=prev;
  el.querySelectorAll("[data-rk]").forEach(function(b){ b.onclick=function(){ rk=b.getAttribute("data-rk"); draw(); }; });
  el.querySelector("#erT").onchange=function(){ e.tp=e.tp||{}; e.tp[rk]=this.value; sv(); draw(); };
  el.querySelectorAll("[data-ph]").forEach(function(b){ b.onclick=function(){ var s=ta.selectionStart||ta.value.length, v="{"+b.getAttribute("data-ph")+"}"; ta.value=ta.value.slice(0,s)+v+ta.value.slice(ta.selectionEnd||s); ta.focus(); try{ ta.setSelectionRange(s+v.length,s+v.length); }catch(er){} prev(); }; });
  el.querySelector("#erSv").onclick=function(){ var x=ta.value;
    if(tp.b){ var n=prompt(L2("Nama templat","Template name"), L2("Templat saya","My template")); if(!n) return; var t={id:"u"+uid(), k:rk, n:n, x:x}; D.tpl.push(t); e.tp=e.tp||{}; e.tp[rk]=t.id; }
    else tp.x=x;
    sv(); draw(); H.toast(L2("Templat disimpan","Template saved")); };
  bind(el,"#erDl",function(){ if(!confirm(L2("Padam templat ini?","Delete this template?"))) return; D.tpl=D.tpl.filter(function(t){ return t.id!==tp.id; }); if(e.tp) delete e.tp[rk]; sv(); draw(); });
  el.querySelector("#erGo").onclick=function(){ if(!tp.b && ta.value!==tp.x){ tp.x=ta.value; sv(); } else if(tp.b && ta.value!==tp.x){ var t={id:"u"+uid(), k:rk, n:L2("Templat saya","My template")+" "+(D.tpl.length+1), x:ta.value}; D.tpl.push(t); e.tp=e.tp||{}; e.tp[rk]=t.id; sv(); } sendSeq(e, rk); };
  el.querySelector("#erSh").onclick=function(){ share(fill(e, ta.value, null)); }; }

// ---------- print ----------
function printPlan(e){
  var p=pax(e), m=money(e), ty=T(e.ty), r=function(a,b){ return '<tr><td>'+a+'</td><td>'+b+'</td></tr>'; }, x=function(s){ return E(String(s==null?"":s)); };
  var html='<html><head><meta charset="utf-8"><style>body{font-family:sans-serif;font-size:12px;color:#111;margin:18px}h1{font-size:20px;margin:0}h2{font-size:14px;margin:14px 0 4px;border-bottom:1px solid #999}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:3px 4px;text-align:left;vertical-align:top}.m{color:#555}</style></head><body>'+
    '<h1>'+ty[1]+' '+x(e.n)+'</h1><div class="m">'+x(L2(ty[2],ty[3]))+' · '+x(dRange(e))+(e.d?' · '+x(U.hjOf(e.d)):'')+(e.t?' · '+x(tm(e.t))+(e.te?' – '+x(tm(e.te)):''):'')+'</div>'+
    '<div>'+x(e.loc||"")+(e.addr?' · '+x(e.addr):'')+'</div>'+(e.host?'<div>'+L2("Tuan rumah: ","Host: ")+x(e.host)+'</div>':'')+(e.desc?'<p>'+x(e.desc)+'</p>':'')+
    '<h2>'+L2("Ringkasan","Summary")+'</h2><table>'+r(L2("Tetamu dijemput","Guests invited"), p.inv+' ('+p.n+')')+r(L2("Hadir","Coming"), p.yes)+r(L2("Anggaran pax makanan","Food pax"), planPax(e))+r(L2("Kos dirancang","Planned cost"), rm(m.tot))+r(L2("Bajet","Budget"), m.cap?rm(m.cap):"–")+r(L2("Belum dibayar","To pay"), rm(m.due))+'</table>';
  var it=e.iti.slice().sort(function(a,b){ return ((a.day||0)-(b.day||0)) || (a.t||"").localeCompare(b.t||""); });
  if(it.length) html+='<h2>'+L2("Atur cara","Itinerary")+'</h2><table>'+it.map(function(i){ return '<tr><td>'+(nDays(e)>1?L2("H","D")+((i.day||0)+1)+' ':'')+x(tm(i.t))+(i.te?'–'+x(tm(i.te)):'')+'</td><td>'+x(i.n)+'</td><td>'+x(i.who||"")+'</td></tr>'; }).join("")+'</table>';
  if(e.vd.length) html+='<h2>'+L2("Vendor","Vendors")+'</h2><table>'+e.vd.map(function(v){ var c=vc(v.cat); return '<tr><td>'+c[1]+' '+x(L2(c[2],c[3]))+'</td><td>'+x(v.n||"")+'</td><td>'+x(v.tel||"")+'</td><td>'+(v.cost?rm(num(v.cost)):"")+(v.paid?" ✓":"")+'</td><td>'+x(v.time?tm(v.time):"")+'</td></tr>'; }).join("")+'</table>';
  var f=e.food||{}; if((f.dish||[]).length) html+='<h2>'+L2("Makanan","Food")+'</h2><table>'+f.dish.map(function(d){ return '<tr><td>'+x(d.n)+'</td><td>'+x(d.q||"")+'</td><td>'+x(d.who||"")+'</td></tr>'; }).join("")+'</table>';
  if(e.g.length) html+='<h2>'+L2("Tetamu","Guests")+'</h2><table>'+e.g.map(function(g){ return '<tr><td>'+x(g.n)+'</td><td>'+x(g.tel||"")+'</td><td>'+(+g.pax||1)+'</td><td>'+stIc(g.st)+'</td></tr>'; }).join("")+'</table>';
  if(e.tk.length) html+='<h2>'+L2("Senarai semak","Checklist")+'</h2><table>'+e.tk.map(function(k){ var d=taskDue(e,k); return '<tr><td>'+(k.done?"☑":"☐")+'</td><td>'+x(k.n)+'</td><td>'+(d?x(U.dstr(U.ymd(d))):"")+'</td></tr>'; }).join("")+'</table>';
  html+='<p class="m">My Ihsan</p></body></html>';
  if(window.Native && H.N.printHtml){ H.toast(L2("Pilih \"Simpan sebagai PDF\" sebagai pencetak","Choose \"Save as PDF\" as the printer")); H.N.printHtml(html, e.n); }
  else { var w=window.open(""); if(w){ w.document.write(html); w.document.close(); w.print(); } } }

// ---------- hub ----------
function pSeat(el, e){ if(!window.EvSeat){ el.innerHTML='<div class="card mut">…</div>'; return; } EvSeat.page(el, e, {H:H, L2:L2, E:E, sv:sv, draw:draw}); }   // 0.6.71 (owner): table arrangement for a hall / space
function fn(k){ return {info:pInfo, guest:pGuest, seat:pSeat, food:pFood, duty:pDuty, vend:pVend, bud:pBud, iti:pIti, task:pTask, rsvp:pRsvp}[k]||pInfo; }
function head(e){ var ty=T(e.ty), d=evDate(e), n=d?U.days(U.today(),d):null;
  return '<div class="card evhd"><div class="row"><button class="chip g3d" id="evBk">‹ '+L2("Semua majlis","All events")+'</button>'+(n!=null&&n>=0?'<span class="evcd"><b>'+(n===0?"🎉":n)+'</b><small>'+(n===0?L2("hari ini","today"):L2("hari lagi","days to go"))+'</small></span>':'')+'</div>'+
    '<div class="evht"><span class="evic">'+ty[1]+'</span><span class="fmain"><b>'+E(e.n)+'</b><small>'+dRange(e)+(e.t?' · '+tm(e.t):'')+(e.loc?' · '+E(e.loc):'')+'</small></span>'+(e.sh?'<button class="chip g3d evShC" id="evShC">🔗 '+L2("Dikongsi","Shared")+'</button>':'')+'</div></div>'+
    '<div class="bbtabs noswipe">'+PAGES.map(function(p){ return '<button class="chip g3d'+(page===p[0]?" on":"")+'" data-ep="'+p[0]+'">'+p[1]+' '+L2(p[2],p[3])+'</button>'; }).join("")+'</div>'; }
function view(el, h, dockHtml){
  H=h; L2=h.L2x; E=h.esc; U=FamView.util(); ld(); if(window.EvShare) EvShare.start(H);
  var e=cur?EV(cur):null; if(!e) cur=null;
  if(!e){ el.innerHTML='<div id="evBody"></div>'+dockHtml; pList(el.querySelector("#evBody")); try{ H.dockFix(); }catch(er){} return; }
  el.innerHTML=head(e)+'<div id="evBody"></div>'+dockHtml;
  var body=el.querySelector("#evBody"); fn(page)(body, e);
  el.querySelector("#evBk").onclick=function(){ cur=null; draw(); document.getElementById("view").scrollTop=0; };
  var shc=el.querySelector("#evShC"); if(shc) shc.onclick=function(){ shareLive(e); };
  el.querySelectorAll("[data-ep]").forEach(function(b){ b.onclick=function(){ page=b.getAttribute("data-ep"); draw(); keepTab(); }; });
  keepTab(); try{ H.dockFix(); }catch(er){}
  // swipe between the eight pages, the neighbour following the finger
  if(window.IbSwipe && window.ibWrap){
    var ks=PAGES.map(function(x){ return x[0]; }), nb=function(s){ return ks[ks.indexOf(page)+(s<0?1:-1)]; };
    var pg=window.ibWrap(body);
    window.IbSwipe(pg, {can:function(s){ return !!nb(s); }, go:function(s){ page=nb(s); draw(); keepTab(); },
      find:function(){ return document.querySelector("#evBody .ibpg"); },
      peek:function(s){ var k=nb(s), p0=page, b=window.IbSwipe.shot(function(){ page=k; }, function(x){ fn(k)(x, e); }, function(){ page=p0; });
        if(!b) return null; var w=document.createElement("div"); w.className="ibpg"; while(b.firstChild) w.appendChild(b.firstChild); return w; }});
  } }
// keep the selected page chip in view in the top row
function keepTab(){ setTimeout(function(){ var on=document.querySelector("#view .bbtabs .chip.on"); if(on && on.scrollIntoView) try{ on.parentNode.scrollLeft=on.offsetLeft-on.parentNode.clientWidth/2+on.offsetWidth/2; }catch(e){} }, 0); }
function shareLive(e){ var go=function(){ EvShare.shareSheet(e, H, function(){ draw(); }); }; if(window.EvShare) go(); else H.loadJs(["family/evshare.js"], go, function(){}); }
// 0.7.17 a shared event changed on another phone: reload the list (wait while someone is typing on this page)
var relPend=false;
function reload(){ var a=document.activeElement, v=document.getElementById("view"); if(a && v && v.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)){ if(!relPend){ relPend=true; a.addEventListener("blur", function(){ relPend=false; setTimeout(reload, 50); }, {once:true}); } return; }
  ld(); if(window.EventView && document.querySelector("#evBody")) draw(); }
window.EventView={view:view, _reload:reload, navGet:function(){ return {cur:cur, pg:page, k:(cur||"")+":"+page}; }, navSet:function(o){ cur=o.cur||null; page=o.pg||"info"; }};
window.EventRemSync=function(h){ H=H||h; L2=L2||h.L2x; E=E||h.esc; U=U||FamView.util(); ld(); remSync(); };
})();
