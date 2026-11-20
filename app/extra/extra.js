/* My Ihsan 0.24.0: Cari (find) page with donating places (orphanages, elderly homes, yayasan, tahfiz), my surau list with tags (idea 87),
   grave locator (idea 94) with the ziarah kubur doa pack (idea 56); solat on a flight in Kiblat (idea 86); Kuiz (idea 47) and
   daily Sirah snippets (idea 48). All Arabic and rulings need an ustaz's review. */
(function(){
"use strict";
var H, L2, E;
function init(h){ H=h; L2=h.L2x; E=h.esc; }
function fld(id, label, val, type, extra){ return '<label class="fl">'+label+'<input id="'+id+'" type="'+(type||"text")+'" value="'+E(val==null?"":val)+'"'+(extra||"")+'></label>'; }
function D(){ var d=H.load("ihsan_extra",null)||{}; d.surau=d.surau||[]; d.kubur=d.kubur||[]; d.quiz=d.quiz||{best:0,played:0,right:0}; return d; }
function SV(d){ H.save("ihsan_extra",d); }
function km(a,b,c,d){ var R=6371, r=Math.PI/180, x=Math.sin((c-a)*r/2), y=Math.sin((d-b)*r/2), h=x*x+Math.cos(a*r)*Math.cos(c*r)*y*y; return 2*R*Math.asin(Math.sqrt(h)); }
function here(cb){ var N=H.N; if(window.Native && N.getLocation && N.hasPerm("location")){ var t=null, f=function(r){ H.off("location",f); clearTimeout(t); cb(r.error?null:r); }; H.on("location",f); N.getLocation(); t=setTimeout(function(){ H.off("location",f); cb(null); },9000); }
  else if(window.Native && N.requestPerm){ var hp=function(p){ if(p.which!=="location") return; H.off("perm",hp); if(p.granted) here(cb); else cb(null); }; H.on("perm",hp); N.requestPerm("location"); }
  else if(navigator.geolocation) navigator.geolocation.getCurrentPosition(function(p){ cb({lat:p.coords.latitude, lon:p.coords.longitude, acc:p.coords.accuracy}); }, function(){ cb(null); }, {enableHighAccuracy:true, timeout:9000});
  else cb(null); }
function mapsAt(q, lat, lon){ if(window.Native && H.N.openMaps) H.N.openMaps(q, lat, lon); else window.open("https://www.google.com/maps/search/?api=1&query="+(lat!=null?lat+","+lon:encodeURIComponent(q))); }

// ================= CARI =================
var GRP=[
  ["ibadah","🕌","Ihsan","Worship",[["masjid","🕌","Masjid","Mosques"],["surau","🛖","Surau","Surau"],["musolla","🏬","Musolla (pusat beli-belah)","Musolla (malls)"],["surau R&R","🛣","Surau R&R lebuh raya","Highway R&R surau"],["surau wanita","🧕","Surau dengan ruang wanita","Surau with a women's area"],["restoran halal","🍛","Makanan halal","Halal food"]]],
  ["derma","💝","Untuk menderma","For donating",[["rumah anak yatim","🧒","Rumah anak yatim","Orphanages"],["rumah jagaan warga emas","👵","Rumah jagaan warga emas","Elderly care homes"],["yayasan islam","🤲","Yayasan Islam","Islamic foundations"],["maahad tahfiz","📖","Pusat tahfiz","Tahfiz schools"],["rumah perlindungan wanita","🏠","Rumah perlindungan","Shelters"],["pusat zakat","💰","Pusat zakat","Zakat centres"],["bank makanan","🥫","Bank makanan","Food banks"]]],
  ["kubur","🪦","Kubur","Graves",[["tanah perkuburan islam","🪦","Tanah perkuburan Islam","Muslim cemeteries"]]]
];
function vCari(el, h){ init(h); var d=D();
  var html=GRP.map(function(g){ return '<div class="card"><h3>'+g[1]+' '+L2(g[2],g[3])+'</h3><div class="lgrid cariG">'+g[4].map(function(x){ return '<button class="qt g3d" data-xq="'+E(x[0])+'"><span>'+x[1]+'</span>'+E(L2(x[2],x[3]))+'</button>'; }).join("")+'</div>'+
    (g[0]==="derma"?'<div class="mut tiny" style="margin-top:8px">'+L2("Sebelum menderma: pastikan pusat berdaftar (JKM, jabatan agama negeri atau ROS) dan semak akaun bank penerima di Semak Mule PDRM.","Before donating: make sure the centre is registered (JKM, the state religious department or ROS) and check the receiving bank account on PDRM Semak Mule.")+' <a href="#" id="xMule">semakmule.rmp.gov.my ›</a></div>':'')+'</div>'; }).join("");
  // my surau (idea 87)
  html+='<div class="card"><div class="row"><h3 style="margin:0">🛖 '+L2("Surau saya","My surau list")+'</h3><button class="chip g3d" id="xSA">＋ '+L2("Simpan di sini","Save here")+'</button></div><div class="mut tiny">'+L2("Simpan surau yang anda singgah dengan tanda: ruang wanita, tempat wuduk, mesra OKU, telekung, parkir.","Save surau you stop at, with tags: women's area, wudhu place, wheelchair friendly, telekung, parking.")+'</div><div id="xSL">'+surauList(d, null)+'</div></div>';
  // graves (idea 94) + ziarah pack (56)
  html+='<div class="card"><div class="row"><h3 style="margin:0">🪦 '+L2("Lokasi kubur keluarga","Family grave locations")+'</h3><button class="chip g3d" id="xKA">＋ '+L2("Simpan","Save")+'</button></div><div class="mut tiny">'+L2("Berdiri di sebelah kubur dan tekan Simpan untuk merekod GPS, lot dan nota, supaya mudah dicari semasa ziarah.","Stand next to the grave and tap Save to record the GPS point, plot number and notes, so it is easy to find on a visit.")+'</div>'+
    (d.kubur.length?'<div class="flist">'+d.kubur.map(function(k,i){ return '<div class="frow"><span class="fic">🪦</span><span class="fmain"><b>'+E(k.n)+'</b><small>'+E([k.c,k.lot?L2("Lot ","Plot ")+k.lot:"",k.note].filter(Boolean).join(" · "))+'</small></span><button class="chip g3d" data-kgo="'+i+'">🧭</button><button class="chip" data-ked="'+i+'">✎</button></div>'; }).join("")+'</div>':'')+
    '<button class="btn alt full g3d" id="xZiarah" style="margin-top:8px">🤲 '+L2("Doa & adab ziarah kubur","Doa & etiquette for visiting graves")+'</button></div>';
  html+='<div class="mut small" style="padding:4px 6px 12px">'+L2("Butang carian membuka Google Maps di sekitar lokasi anda.","Search buttons open Google Maps around your location.")+'</div>';
  return html;
}
var TAGS=[["w","🧕","Ruang wanita","Women's area"],["u","💧","Tempat wuduk","Wudhu place"],["o","♿","Mesra OKU","Wheelchair friendly"],["t","🧣","Telekung","Telekung"],["p","🅿","Parkir","Parking"],["a","❄","Berhawa dingin","Air-conditioned"]];
function surauList(d, pos){ if(!d.surau.length) return '<div class="mut small" style="margin-top:6px">'+L2("Belum ada.","None yet.")+'</div>';
  var L=d.surau.map(function(s,i){ return {s:s,i:i,k:pos&&s.lat!=null?km(pos.lat,pos.lon,s.lat,s.lon):null}; }); if(pos) L.sort(function(a,b){ return (a.k==null?1e9:a.k)-(b.k==null?1e9:b.k); });
  return '<div class="flist">'+L.map(function(x){ var s=x.s; return '<div class="frow"><span class="fmain"><b>'+E(s.n)+'</b><small>'+TAGS.filter(function(t){ return (s.tg||[]).indexOf(t[0])>=0; }).map(function(t){ return t[1]; }).join(" ")+(x.k!=null?' · '+(x.k<1?Math.round(x.k*1000)+" m":x.k.toFixed(1)+" km"):'')+(s.note?' · '+E(s.note):'')+'</small></span><button class="chip g3d" data-sgo="'+x.i+'">🧭</button><button class="chip" data-sed="'+x.i+'">✎</button></div>'; }).join("")+'</div>'; }
function bindCari(el, h){ init(h);
  el.querySelectorAll("[data-xq]").forEach(function(b){ b.onclick=function(){ H.openFinder(b.getAttribute("data-xq")); }; });
  var m=el.querySelector("#xMule"); if(m) m.onclick=function(e){ e.preventDefault(); H.openWeb("https://semakmule.rmp.gov.my/","Semak Mule"); };
  el.querySelector("#xSA").onclick=function(){ sEdit(-1); };
  el.querySelector("#xKA").onclick=function(){ kEdit(-1); };
  el.querySelector("#xZiarah").onclick=ziarah;
  var bindS=function(){ el.querySelectorAll("[data-sgo]").forEach(function(b){ b.onclick=function(){ var s=D().surau[+b.getAttribute("data-sgo")]; mapsAt(s.n, s.lat, s.lon); }; }); el.querySelectorAll("[data-sed]").forEach(function(b){ b.onclick=function(){ sEdit(+b.getAttribute("data-sed")); }; }); };
  bindS();
  el.querySelectorAll("[data-kgo]").forEach(function(b){ b.onclick=function(){ var k=D().kubur[+b.getAttribute("data-kgo")]; mapsAt(k.c||k.n, k.lat, k.lon); }; });
  el.querySelectorAll("[data-ked]").forEach(function(b){ b.onclick=function(){ kEdit(+b.getAttribute("data-ked")); }; });
  if(D().surau.length) here(function(p){ var l=el.querySelector("#xSL"); if(p && l && document.body.contains(l)){ l.innerHTML=surauList(D(), p); bindS(); } });
}
function sEdit(i){ var d=D(), s=i>=0?d.surau[i]:{n:"",tg:[],note:""}, tg=(s.tg||[]).slice();
  var ov=H.showSheet("🛖 "+L2("Surau","Surau"), fld("xsN",L2("Nama / tempat","Name / place"),s.n,"text",' placeholder="'+L2("cth. Surau R&R Ayer Keroh","e.g. Ayer Keroh R&R surau")+'"')+
    '<div class="chips" id="xsT">'+TAGS.map(function(t){ return '<button class="chip'+(tg.indexOf(t[0])>=0?" on":"")+'" data-v="'+t[0]+'">'+t[1]+' '+L2(t[2],t[3])+'</button>'; }).join("")+'</div>'+fld("xsO",L2("Nota","Note"),s.note)+
    '<div class="mut tiny" id="xsG">'+(s.lat!=null?'📍 '+s.lat.toFixed(5)+', '+s.lon.toFixed(5):L2("Lokasi GPS semasa akan disimpan.","Your current GPS point will be saved."))+'</div>'+
    '<button class="btn gold full g3d" id="xsOk" style="margin-top:10px">✓ '+L2("Simpan","Save")+'</button>'+(i>=0?'<button class="btn alt full g3d" id="xsX" style="margin-top:6px">🗑 '+L2("Padam","Delete")+'</button>':''));
  ov.querySelectorAll("#xsT [data-v]").forEach(function(b){ b.onclick=function(){ var v=b.getAttribute("data-v"), k=tg.indexOf(v); if(k>=0) tg.splice(k,1); else tg.push(v); b.classList.toggle("on",k<0); }; });
  ov.querySelector("#xsOk").onclick=function(){ var n=ov.querySelector("#xsN").value.trim(); if(!n){ H.toast(L2("Isi nama","Fill in a name")); return; } s.n=n; s.tg=tg; s.note=ov.querySelector("#xsO").value.trim();
    var fin=function(){ if(i<0) d.surau.push(s); SV(d); H.closeOverlay(); H.render(); };
    if(s.lat==null){ ov.querySelector("#xsG").textContent=L2("Mendapatkan lokasi…","Getting location…"); here(function(p){ if(p){ s.lat=p.lat; s.lon=p.lon; } else H.toast(L2("Lokasi tidak dapat diambil; disimpan tanpa GPS","No location; saved without GPS")); fin(); }); } else fin(); };
  var x=ov.querySelector("#xsX"); if(x) x.onclick=function(){ d.surau.splice(i,1); SV(d); H.closeOverlay(); H.render(); };
}
function kEdit(i){ var d=D(), k=i>=0?d.kubur[i]:{n:"",c:"",lot:"",note:""}, fam=[]; try{ var F=H.load("ihsan_family",{}); fam=(F.p||[]).filter(function(p){ return p.dd; }); }catch(e){}
  var ov=H.showSheet("🪦 "+L2("Lokasi kubur","Grave location"), (fam.length?'<div class="chips">'+fam.map(function(p){ return '<button class="chip" data-kf="'+E(p.n)+'">'+E(p.n)+'</button>'; }).join("")+'</div>':'')+
    fld("xkN",L2("Nama arwah","Name of the deceased"),k.n)+fld("xkC",L2("Tanah perkuburan","Cemetery"),k.c)+'<div class="f2">'+fld("xkL",L2("No. lot / baris","Plot / row no."),k.lot)+fld("xkO",L2("Tanda (cth. pokok kemboja)","Landmark (e.g. frangipani tree)"),k.note)+'</div>'+
    '<div class="mut tiny" id="xkG">'+(k.lat!=null?'📍 '+k.lat.toFixed(6)+', '+k.lon.toFixed(6)+(k.acc?' (±'+Math.round(k.acc)+' m)':''):L2("Berdiri di sebelah kubur: lokasi GPS akan disimpan.","Stand next to the grave: the GPS point will be saved."))+'</div>'+
    (i>=0?'<button class="btn alt full g3d" id="xkRe" style="margin-top:8px">📍 '+L2("Rekod semula lokasi di sini","Record the location here again")+'</button>':'')+
    '<button class="btn gold full g3d" id="xkOk" style="margin-top:8px">✓ '+L2("Simpan","Save")+'</button>'+(i>=0?'<button class="btn alt full g3d" id="xkX" style="margin-top:6px">🗑 '+L2("Padam","Delete")+'</button>':''));
  ov.querySelectorAll("[data-kf]").forEach(function(b){ b.onclick=function(){ ov.querySelector("#xkN").value=b.getAttribute("data-kf"); }; });
  var rec=function(done){ ov.querySelector("#xkG").textContent=L2("Mendapatkan lokasi tepat…","Getting an exact location…"); here(function(p){ if(p){ k.lat=p.lat; k.lon=p.lon; k.acc=p.acc; ov.querySelector("#xkG").textContent='📍 '+p.lat.toFixed(6)+', '+p.lon.toFixed(6); } else H.toast(L2("Lokasi tidak dapat diambil","Location unavailable")); if(done) done(); }); };
  var re=ov.querySelector("#xkRe"); if(re) re.onclick=function(){ rec(); };
  ov.querySelector("#xkOk").onclick=function(){ var g=function(s){ return ov.querySelector(s).value.trim(); }; if(!g("#xkN")){ H.toast(L2("Isi nama","Fill in a name")); return; } k.n=g("#xkN"); k.c=g("#xkC"); k.lot=g("#xkL"); k.note=g("#xkO");
    var fin=function(){ if(i<0) d.kubur.push(k); SV(d); H.closeOverlay(); H.render(); }; if(k.lat==null) rec(fin); else fin(); };
  var x=ov.querySelector("#xkX"); if(x) x.onclick=function(){ if(!confirm(L2("Padam?","Delete?"))) return; d.kubur.splice(i,1); SV(d); H.closeOverlay(); H.render(); };
}
function ziarah(){
  var ar=function(a,ms,en,src){ return '<div class="card"><div class="ar" dir="rtl" style="font-size:24px;line-height:1.9">'+a+'</div><div class="tr">'+E(L2(ms,en))+'</div>'+(src?'<div class="src">'+E(src)+'</div>':'')+'</div>'; };
  H.showSheet("🤲 "+L2("Ziarah kubur","Visiting graves"),
    '<div class="snl">1. '+L2("Salam ketika masuk tanah perkuburan","Greeting on entering the cemetery")+'</div>'+
    ar("السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللّٰهُ بِكُمْ لَلَاحِقُونَ، أَسْأَلُ اللّٰهَ لَنَا وَلَكُمُ الْعَافِيَةَ","Salam sejahtera ke atas kamu wahai penghuni kubur daripada kalangan mukminin dan muslimin. Kami insya-Allah akan menyusul kamu. Aku memohon kepada Allah keselamatan untuk kami dan kamu.","Peace be upon you, O believers and Muslims who dwell here. We will, if Allah wills, join you. I ask Allah for wellbeing for us and for you.","Sahih Muslim (975)")+
    '<div class="snl">2. '+L2("Bacaan","Recitation")+'</div><div class="card"><div class="btns"><button class="btn alt g3d" data-qref="1:1">📖 Al-Fatihah</button><button class="btn alt g3d" data-qref="36:1">📖 Yasin</button><button class="btn alt g3d" data-qref="112:1">📖 Al-Ikhlas</button></div><div class="mut tiny" style="margin-top:6px">'+L2("Bacaan al-Quran dan doa dihadiahkan kepada arwah (pandangan jumhur ulama Syafi'i untuk doa; sedekah pahala bacaan ada khilaf).","Quran recitation and doa for the deceased (doa is agreed upon; gifting the reward of recitation has scholarly difference).")+'</div></div>'+
    '<div class="snl">3. '+L2("Doa untuk arwah","Doa for the deceased")+'</div>'+
    ar("اللّٰهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ","Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia dan maafkanlah dia. Muliakanlah tempatnya dan luaskanlah kuburnya. (Untuk perempuan: لَهَا / ـهَا)","O Allah, forgive him, have mercy on him, keep him safe and pardon him. Honour his resting place and widen his grave. (For a woman: لَهَا / ـهَا)","Sahih Muslim (963)")+
    '<div class="snl">4. '+L2("Adab","Etiquette")+'</div><div class="card"><ul class="small" style="margin:0;padding-left:18px">'+[["Berwuduk dan berpakaian sopan","Have wudhu and dress modestly"],["Jangan duduk, berdiri atau memijak kubur","Do not sit, stand or step on graves"],["Bercakap perlahan, ingat mati dan akhirat","Speak softly; remember death and the Hereafter"],["Doakan semua penghuni kubur, bukan keluarga sahaja","Pray for everyone buried there, not only family"],["Bersihkan kubur sekadarnya; elak amalan yang tiada asas","Tidy the grave modestly; avoid practices without basis"]].map(function(x){ return '<li>'+E(L2(x[0],x[1]))+'</li>'; }).join("")+'</ul></div>'+
    '<div class="mut tiny">'+L2("Teks Arab perlu disemak ustaz.","Arabic text needs an ustaz's review.")+'</div>');
}

// ================= SOLAT ON A FLIGHT (idea 86) =================
function flightCard(h){ init(h); return '<div class="card"><h3>✈ '+L2("Solat dalam kapal terbang","Praying on a flight")+'</h3><div class="mut small">'+L2("Arah kiblat dari kedudukan pesawat, waktu solat di udara, dan cara solat di tempat duduk.","Qibla from the plane's position, prayer times in the air, and how to pray in your seat.")+'</div><button class="btn gold full g3d" id="xFly" style="margin-top:8px">✈ '+L2("Buka","Open")+'</button></div>'; }
function openFlight(h){ init(h); var st={hd:"", pos:null};
  var ov=H.showSheet("✈ "+L2("Solat dalam pesawat","Praying on a flight"), '<div id="xfB"></div>');
  var draw=function(){ var b=ov.querySelector("#xfB"); if(!b) return; var p=st.pos, q=p?H.qiblaBearing(p.lat,p.lon):null, hd=parseFloat(st.hd), rel=(q!=null&&isFinite(hd))?((q-hd+540)%360)-180:null, t=p?H.timesAt(p.lat,p.lon):null;
    b.innerHTML='<div class="card"><button class="btn alt full g3d" id="xfGps">📍 '+(p?L2("Kemas kini lokasi GPS","Update GPS position"):L2("Dapatkan lokasi GPS (berfungsi dalam mod pesawat)","Get the GPS position (works in airplane mode)"))+'</button>'+
      (p?'<div class="mut tiny" style="margin-top:6px">📍 '+p.lat.toFixed(3)+', '+p.lon.toFixed(3)+'</div>':'')+
      (q!=null?'<div class="fsum" style="margin-top:8px"><div><small>'+L2("Kiblat dari utara","Qibla from north")+'</small><b class="fwarnc">'+Math.round(q)+'°</b></div><div><small>'+L2("Kiblat dari hidung pesawat","Qibla from the plane's nose")+'</small><b>'+(rel==null?"–":(Math.abs(rel)<8?L2("Depan","Ahead"):Math.abs(rel)>172?L2("Belakang","Behind"):(rel>0?"↻ ":"↺ ")+Math.abs(Math.round(rel))+"° "+(rel>0?L2("kanan","right"):L2("kiri","left"))))+'</b></div></div>':'')+
      '<label class="fl">'+L2("Arah pesawat (heading) dari peta penerbangan skrin tempat duduk, darjah","Aircraft heading from the seat-back flight map, degrees")+'<input id="xfH" type="number" inputmode="decimal" min="0" max="359" value="'+E(st.hd)+'" placeholder="cth. 285"></label>'+
      '<div class="mut tiny">'+L2("Kompas telefon tidak tepat dalam pesawat. Gunakan heading pada peta penerbangan.","The phone compass is unreliable in a plane. Use the heading on the flight map.")+'</div></div>'+
      (t?'<div class="card"><h3>🕰 '+L2("Waktu solat di kedudukan ini","Prayer times at this position")+'</h3><div class="mut tiny">'+L2("Waktu tempatan telefon. Anggaran untuk kedudukan sekarang; pesawat bergerak, jadi semak semula.","In the phone's local time. An estimate for this position; the plane moves, so check again.")+'</div><div class="xft">'+t.map(function(x){ return '<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>'; }).join("")+'</div></div>':'')+
      '<div class="card"><h3>📘 '+L2("Cara solat","How to pray")+'</h3><ol class="small" style="margin:0;padding-left:18px">'+[
        ["Berwuduk sebelum naik atau di tandas pesawat; jika tiada air, bertayammum.","Make wudhu before boarding or in the toilet; without water, do tayammum."],
        ["Musafir boleh jamak dan qasar (Zohor+Asar, Maghrib+Isyak) ikut syarat musafir.","Travellers may combine and shorten (Zohor+Asar, Maghrib+Isyak) under the travel conditions."],
        ["Jika boleh, solat berdiri menghadap kiblat (ruang belakang/galley) dengan izin kru.","If possible, pray standing facing the Qibla (galley space) with the crew's permission."],
        ["Jika tidak boleh, solat di tempat duduk dengan isyarat; sujud lebih rendah daripada rukuk.","If not, pray in your seat with gestures; bow lower for sujud than for ruku'."],
        ["Mazhab Syafi'i: solat yang tidak sempurna rukun atau arah kiblat dilakukan untuk menghormati waktu dan diulang (i'adah) apabila mendarat.","Shafi'i school: a prayer missing pillars or the Qibla is prayed to honour the time and repeated (i'adah) after landing."],
        ["Jika boleh jamak ta'khir dan sempat selepas mendarat, itu lebih baik.","If you can delay-combine and still pray after landing in time, that is better."]].map(function(x){ return '<li>'+E(L2(x[0],x[1]))+'</li>'; }).join("")+'</ol><div class="mut tiny" style="margin-top:6px">'+L2("Rujuk ustaz untuk keadaan anda.","Ask an ustaz about your own case.")+'</div></div>';
    b.querySelector("#xfGps").onclick=function(){ b.querySelector("#xfGps").textContent=L2("Mendapatkan lokasi…","Getting location…"); here(function(r){ if(r){ st.pos=r; } else H.toast(L2("GPS tidak tersedia. Cuba dekat tingkap.","GPS unavailable. Try near the window.")); draw(); }); };
    var hi=b.querySelector("#xfH"); hi.onchange=function(){ st.hd=hi.value; draw(); };
  };
  draw();
}

// ================= KUIZ (idea 47) =================
var QZ=[
 ["rukun",["Berapakah rukun Islam?","How many pillars of Islam are there?"],[["4","4"],["5","5"],["6","6"]],1],
 ["rukun",["Berapakah rukun Iman?","How many pillars of faith are there?"],[["5","5"],["6","6"],["7","7"]],1],
 ["rukun",["Rukun Islam yang pertama ialah…","The first pillar of Islam is…"],[["Solat","Prayer"],["Mengucap dua kalimah syahadah","The two testimonies of faith"],["Puasa","Fasting"]],1],
 ["rukun",["Solat fardu sehari semalam berjumlah…","Daily obligatory prayers number…"],[["3","3"],["5","5"],["7","7"]],1],
 ["rukun",["Berapakah jumlah rakaat solat fardu sehari semalam?","How many rakaat are the daily obligatory prayers in total?"],[["15","15"],["17","17"],["19","19"]],1],
 ["rukun",["Solat Maghrib berapa rakaat?","How many rakaat is Maghrib?"],[["2","2"],["3","3"],["4","4"]],1],
 ["rukun",["Zakat fitrah dibayar pada bulan…","Zakat fitrah is paid in the month of…"],[["Ramadan","Ramadan"],["Zulhijjah","Zulhijjah"],["Muharram","Muharram"]],0],
 ["rukun",["Puasa wajib dilakukan pada bulan…","Obligatory fasting is in the month of…"],[["Syaaban","Sha'ban"],["Ramadan","Ramadan"],["Syawal","Shawwal"]],1],
 ["rukun",["Haji dilakukan pada bulan…","Hajj takes place in the month of…"],[["Zulhijjah","Dhul Hijjah"],["Rejab","Rajab"],["Ramadan","Ramadan"]],0],
 ["rukun",["Wukuf di Arafah berlaku pada…","Standing at Arafah is on…"],[["9 Zulhijjah","9 Dhul Hijjah"],["10 Zulhijjah","10 Dhul Hijjah"],["1 Syawal","1 Shawwal"]],0],
 ["quran",["Berapakah bilangan surah dalam al-Quran?","How many surahs are in the Quran?"],[["99","99"],["114","114"],["120","120"]],1],
 ["quran",["Surah yang paling panjang ialah…","The longest surah is…"],[["Al-Baqarah","Al-Baqarah"],["Ali 'Imran","Ali 'Imran"],["Yasin","Yasin"]],0],
 ["quran",["Surah yang paling pendek ialah…","The shortest surah is…"],[["Al-Ikhlas","Al-Ikhlas"],["Al-Kauthar","Al-Kawthar"],["An-Nas","An-Nas"]],1],
 ["quran",["Al-Quran terbahagi kepada berapa juzuk?","How many juz is the Quran divided into?"],[["20","20"],["30","30"],["40","40"]],1],
 ["quran",["Ayat pertama yang diturunkan ialah daripada surah…","The first revealed verses are from surah…"],[["Al-Fatihah","Al-Fatihah"],["Al-'Alaq","Al-'Alaq"],["Al-Muddaththir","Al-Muddaththir"]],1],
 ["quran",["Surah yang dibaca dalam setiap rakaat solat ialah…","The surah recited in every rakaat is…"],[["Al-Fatihah","Al-Fatihah"],["Al-Ikhlas","Al-Ikhlas"],["Yasin","Yasin"]],0],
 ["quran",["Surah yang tidak dimulakan dengan Bismillah ialah…","The surah that does not begin with Bismillah is…"],[["At-Taubah","At-Tawbah"],["Al-Kahf","Al-Kahf"],["Maryam","Maryam"]],0],
 ["quran",["Malaikat yang menyampaikan wahyu ialah…","The angel who brought revelation is…"],[["Mikail","Mika'il"],["Jibril","Jibril"],["Israfil","Israfil"]],1],
 ["quran",["Surah yang digelar 'jantung al-Quran'…","The surah called 'the heart of the Quran'…"],[["Yasin","Yasin"],["Ar-Rahman","Ar-Rahman"],["Al-Mulk","Al-Mulk"]],0],
 ["quran",["Al-Quran diturunkan pada malam…","The Quran was sent down on the night of…"],[["Isra' Mi'raj","Isra' Mi'raj"],["Lailatul Qadar","Laylat al-Qadr"],["Nisfu Syaaban","Mid-Sha'ban"]],1],
 ["nabi",["Berapakah nabi yang wajib diketahui?","How many prophets must Muslims know (by name)?"],[["25","25"],["40","40"],["313","313"]],0],
 ["nabi",["Nabi yang ditelan ikan paus ialah…","The prophet swallowed by a whale was…"],[["Nabi Yunus","Prophet Yunus"],["Nabi Musa","Prophet Musa"],["Nabi Nuh","Prophet Nuh"]],0],
 ["nabi",["Nabi yang membina bahtera ialah…","The prophet who built the ark was…"],[["Nabi Ibrahim","Prophet Ibrahim"],["Nabi Nuh","Prophet Nuh"],["Nabi Isa","Prophet Isa"]],1],
 ["nabi",["Nabi yang boleh bercakap dengan haiwan dan jin ialah…","The prophet who could speak to animals and jinn was…"],[["Nabi Sulaiman","Prophet Sulaiman"],["Nabi Daud","Prophet Dawud"],["Nabi Yusuf","Prophet Yusuf"]],0],
 ["nabi",["Kitab Zabur diturunkan kepada…","The Zabur was revealed to…"],[["Nabi Musa","Prophet Musa"],["Nabi Daud","Prophet Dawud"],["Nabi Isa","Prophet Isa"]],1],
 ["nabi",["Kitab Taurat diturunkan kepada…","The Torah was revealed to…"],[["Nabi Musa","Prophet Musa"],["Nabi Harun","Prophet Harun"],["Nabi Ibrahim","Prophet Ibrahim"]],0],
 ["nabi",["Nabi yang dibakar tetapi api menjadi sejuk ialah…","The prophet thrown into fire that became cool was…"],[["Nabi Ibrahim","Prophet Ibrahim"],["Nabi Ismail","Prophet Isma'il"],["Nabi Ayyub","Prophet Ayyub"]],0],
 ["nabi",["Nabi yang terkenal dengan kesabaran ketika sakit ialah…","The prophet known for patience in illness was…"],[["Nabi Ayyub","Prophet Ayyub"],["Nabi Saleh","Prophet Salih"],["Nabi Hud","Prophet Hud"]],0],
 ["nabi",["Unta betina ialah mukjizat Nabi…","The she-camel was the miracle of Prophet…"],[["Hud","Hud"],["Saleh","Salih"],["Syuaib","Shu'ayb"]],1],
 ["nabi",["Nabi terakhir ialah…","The final prophet is…"],[["Nabi Isa","Prophet Isa"],["Nabi Muhammad ﷺ","Prophet Muhammad ﷺ"],["Nabi Yahya","Prophet Yahya"]],1],
 ["fiqh",["Air yang suci dan menyucikan dipanggil air…","Water that is pure and purifying is called…"],[["Mutlak","Mutlaq"],["Musta'mal","Musta'mal"],["Mutanajjis","Mutanajjis"]],0],
 ["fiqh",["Berapakah rukun wuduk (mazhab Syafi'i)?","How many pillars of wudhu are there (Shafi'i)?"],[["4","4"],["6","6"],["8","8"]],1],
 ["fiqh",["Bersuci dengan debu apabila tiada air dipanggil…","Purifying with dust when there is no water is called…"],[["Istinjak","Istinja'"],["Tayammum","Tayammum"],["Mandi wajib","Ghusl"]],1],
 ["fiqh",["Solat sunat sebelum Subuh berapa rakaat?","How many rakaat is the sunnah before Subuh?"],[["2","2"],["4","4"],["1","1"]],0],
 ["fiqh",["Solat Jumaat berapa rakaat?","How many rakaat is Jumu'ah?"],[["2","2"],["4","4"],["3","3"]],0],
 ["fiqh",["Solat yang dilakukan pada waktu dhuha dinamakan…","The prayer done in the late morning is called…"],[["Tahajjud","Tahajjud"],["Dhuha","Duha"],["Witir","Witr"]],1],
 ["fiqh",["Menggabungkan dua solat dalam satu waktu dipanggil…","Combining two prayers in one time is called…"],[["Qasar","Qasr"],["Jamak","Jam'"],["Qada'","Qada'"]],1],
 ["fiqh",["Nisab zakat emas ialah…","The nisab of gold for zakat is…"],[["20 mithqal (kira-kira 85 g)","20 mithqal (about 85 g)"],["50 g","50 g"],["200 g","200 g"]],0],
 ["fiqh",["Kadar zakat harta (emas, simpanan) ialah…","The rate of zakat on wealth (gold, savings) is…"],[["2.5%","2.5%"],["5%","5%"],["10%","10%"]],0],
 ["fiqh",["Hari Raya Aidiladha jatuh pada…","Eid al-Adha falls on…"],[["1 Syawal","1 Shawwal"],["10 Zulhijjah","10 Dhul Hijjah"],["12 Rabiulawal","12 Rabi' al-Awwal"]],1]
];
var QCAT=[["all","🔀","Campur","Mixed"],["rukun","🕌","Rukun & ibadah","Pillars & worship"],["quran","📖","Al-Quran","Quran"],["nabi","🌿","Para nabi","Prophets"],["fiqh","💧","Fiqh asas","Basic fiqh"],["sirah","🐪","Sirah","Sirah"]];
function quizPool(cat){ var p=QZ.filter(function(q){ return cat==="all"||q[0]===cat; }).map(function(q){ return {q:q[1],a:q[2],ok:q[3]}; });
  if((cat==="all"||cat==="sirah") && window.SIRAH_QUIZ) Object.keys(SIRAH_QUIZ).forEach(function(k){ SIRAH_QUIZ[k].forEach(function(x){ p.push({q:x.q,a:x.a,ok:x.ok}); }); });
  return p; }
function openQuiz(h){ init(h);
  var go=function(cat){ var pool=quizPool(cat); for(var i=pool.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=pool[i]; pool[i]=pool[j]; pool[j]=t; } pool=pool.slice(0,10); var k=0, sc=0;
    var ov=H.showSheet("🧠 "+L2("Kuiz","Quiz"), '<div id="xqB"></div>');
    var show=function(){ var b=ov.querySelector("#xqB"); if(!b) return;
      if(k>=pool.length){ var d=D(); d.quiz.played++; d.quiz.right+=sc; if(sc>d.quiz.best) d.quiz.best=sc; SV(d);
        b.innerHTML='<div class="card" style="text-align:center"><div style="font-size:48px">'+(sc>=9?"🏆":sc>=6?"🌟":"📚")+'</div><h3>'+sc+' / '+pool.length+'</h3><div class="small">'+(sc>=9?L2("MasyaAllah, cemerlang!","MasyaAllah, excellent!"):sc>=6?L2("Bagus! Teruskan belajar.","Well done! Keep learning."):L2("Teruskan usaha, setiap ilmu ada pahala.","Keep going, every bit of knowledge is rewarded."))+'</div><div class="mut tiny" style="margin-top:6px">'+L2("Skor terbaik: ","Best score: ")+d.quiz.best+' · '+L2("Dimainkan: ","Played: ")+d.quiz.played+'</div><button class="btn gold full g3d" id="xqA" style="margin-top:10px">↻ '+L2("Main lagi","Play again")+'</button></div>';
        b.querySelector("#xqA").onclick=function(){ H.closeOverlay(); go(cat); }; return; }
      var q=pool[k]; b.innerHTML='<div class="mut tiny">'+(k+1)+' / '+pool.length+' · ✓ '+sc+'</div><div class="fbar"><i style="width:'+Math.round(k*100/pool.length)+'%"></i></div><h3 style="margin:10px 0">'+E(L2(q.q[0],q.q[1]))+'</h3>'+
        q.a.map(function(a,i){ return '<button class="btn alt full g3d xqo" data-qa="'+i+'" style="margin:6px 0;text-align:left">'+E(L2(a[0],a[1]))+'</button>'; }).join("");
      b.querySelectorAll("[data-qa]").forEach(function(o){ o.onclick=function(){ var i=+o.getAttribute("data-qa"), ok=i===q.ok; if(ok){ sc++; H.N.vibrate(40); } else H.N.vibrate(250);
        b.querySelectorAll("[data-qa]").forEach(function(x){ x.disabled=true; var j=+x.getAttribute("data-qa"); if(j===q.ok) x.classList.add("xqok"); else if(j===i) x.classList.add("xqno"); });
        setTimeout(function(){ k++; show(); }, ok?700:1500); }; }); };
    show(); };
  var d=D(), ov=H.showSheet("🧠 "+L2("Kuiz Islam","Islamic quiz"), '<div class="mut small">'+L2("10 soalan setiap pusingan. Skor terbaik: ","10 questions a round. Best score: ")+d.quiz.best+'</div><div class="lgrid" style="margin-top:10px">'+QCAT.map(function(c){ return '<button class="qt g3d" data-qc="'+c[0]+'"><span>'+c[1]+'</span>'+E(L2(c[2],c[3]))+'</button>'; }).join("")+'</div>');
  ov.querySelectorAll("[data-qc]").forEach(function(b){ b.onclick=function(){ var c=b.getAttribute("data-qc"); H.closeOverlay(); if((c==="sirah"||c==="all") && !window.SIRAH_QUIZ) H.loadJs(["sirah_data_0.js"], function(){ go(c); }); else go(c); }; });
}

// ================= SIRAH SNIPPET (idea 48) =================
var SNIP=null;
function sirahSnippet(box, h){ init(h);
  var fill=function(){ if(!window.SIRAH || !SIRAH.length || !document.body.contains(box)) return; var t=new Date(), di=Math.floor((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate()))/864e5), ev=SIRAH[di%SIRAH.length];
    var txt=String(L2(ev.f[0],ev.f[1])||"").split("\n")[0]; if(txt.length>320) txt=txt.slice(0,txt.lastIndexOf(" ",310))+"…";
    box.innerHTML='<div class="card xsn"><div class="mut tiny">🐪 '+L2("Sirah hari ini","Today's Sirah")+' · '+E(ev.yt?L2(ev.yt[0],ev.yt[1]):ev.w?L2(ev.w[0],ev.w[1]):(ev.y+L2(" M"," CE")))+'</div><h3 style="margin:4px 0">'+E(L2(ev.t[0],ev.t[1]))+'</h3><div class="small" style="line-height:1.55">'+E(txt)+'</div><button class="btn alt full g3d" id="xsnGo" style="margin-top:8px">'+L2("Baca dalam garis masa ›","Read in the timeline ›")+'</button></div>';
    box.querySelector("#xsnGo").onclick=function(){ H.openSirah(ev.id); }; };
  if(window.SIRAH && SIRAH.length) fill(); else H.loadJs(["sirah_data_0.js","sirah_data_1.js","sirah_data_2.js","sirah_data_3.js"], fill);
}
window.IbExtra={vCari:vCari, bindCari:bindCari, flightCard:flightCard, openFlight:openFlight, openQuiz:openQuiz, sirahSnippet:sirahSnippet, ziarah:function(h){ init(h); ziarah(); }};
})();
