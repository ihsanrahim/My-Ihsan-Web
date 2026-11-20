/* Umrah DIY 0.13.2: extra modules (emergency, spending, documents, Arabic, group, course, tips, daily ibadah, istiqamah)
   and the map place picker. Uses window.UMC from umrah.js. */
window.UMX = (function(){
  var C, H;
  function en(){ return C.en(); }
  function L(a){ return C.L(a); }
  function esc(s){ return C.esc(s); }
  function T(ms, e){ return en()?e:ms; }
  function P(){ return C.plan(); }
  function save(){ C.save(); }
  function rm(n){ return "RM "+(Math.round(n*100)/100).toLocaleString("en-US"); }
  function ksaDays(){ var s=C.stops(), ds=[]; s.forEach(function(o){ if(o.tz===3 && ds.indexOf(o.d)<0) ds.push(o.d); }); return ds; }
  function cityOfDay(d){ var s=C.stops(); for(var i=0;i<s.length;i++){ var o=s[i]; if(o.d===d && (o.k==="prayer"||o.k==="haram")) return o.p==="haram"?"mk":"md"; } return null; }
  function todayIdx(){ var st=C.parseYmd(P().start), now=new Date(); now.setHours(12,0,0,0); return Math.round((now-st)/864e5); }
  function tel(n){ H.N.openUrl("tel:"+n); }

  // ---------- grid of modules ----------
  var MODS = {
    before:[["kursus","🎓",["Kursus Umrah","Umrah course"]],["arab","🗣",["Bahasa Arab","Arabic phrases"]],["tips","💡",["Tips & jimat kos","Tips & saving"]],["dokumen","🗂",["Peti dokumen","Document box"]],["rombongan","👥",["Rombongan","Group"]],["tempat","📍",["Tempat saya (peta)","My places (map)"]],["adab","🤲",["Adab","Do & don't"]]],
    there:[["sos","🆘",["Kecemasan","Emergency"]],["ibadah","📿",["Ibadah harian","Daily ibadah"]],["belanja","🧾",["Tracker belanja","Spending tracker"]],["tawaf","🔢",["Kaunter tawaf","Tawaf counter"]],["hajj","🕋",["Panduan 3D","3D guide"]]],
    after:[["istiqamah","🌱",["Istiqamah 40 hari","40-day istiqamah"]],["pdf","📄",["Eksport PDF","Export PDF"]]]
  };
  function grid(el){
    var sec=function(k,t){ return '<h3 class="umh">'+t+' <span class="umcnt">'+MODS[k].length+'</span></h3><div class="umgrid">'+MODS[k].map(function(m){ return '<button class="umgi" data-mod="'+m[0]+'"><span>'+m[1]+'</span>'+esc(L(m[2]))+'</button>'; }).join("")+'</div>'; };
    el.innerHTML='<div class="umpad">'+sec("before",T("Sebelum berlepas","Before you fly"))+sec("there",T("Di Tanah Suci","In the Holy Land"))+sec("after",T("Selepas pulang","After you return"))+'</div>';
    el.querySelectorAll("[data-mod]").forEach(function(b){ b.onclick=function(){ open(b.getAttribute("data-mod")); }; });
  }
  function open(m){
    if(m==="adab") return C.layer(T("Adab","Do & don't"), function(b){ C.drawAdab(b); });
    if(m==="tawaf") return H.tawaf();
    if(m==="hajj"){ C.leaveForHajj(); return; }
    if(m==="pdf") return C.exportPdf();
    var f={sos:sos, belanja:belanja, dokumen:dokumen, arab:arab, rombongan:rombongan, kursus:kursus, tips:tips, ibadah:ibadah, istiqamah:istiqamah, tempat:places}[m];
    if(f) f();
  }

  // ---------- 1. emergency ----------
  function sos(){
    C.layer("🆘 "+T("Kecemasan","Emergency"), function(b){
      var h='<div class="umpad"><button class="umbtn red full" id="xLost">🪪 '+T("Kad \"Saya sesat\" (tunjuk kepada orang)","\"I am lost\" card (show to someone)")+'</button>';
      h+='<h3 class="umh">'+T("Nombor kecemasan Saudi","Saudi emergency numbers")+'</h3>'+UMX_SOS.map(function(s){ return '<button class="umlk umcall" data-tel="'+s.n+'"><b>📞 '+s.n+'</b><small>'+esc(L(s.t))+'</small></button>'; }).join("");
      h+='<h3 class="umh">'+T("Wakil Malaysia","Malaysian missions")+'</h3>'+UMX_EMBASSY.map(function(e,i){ return '<button class="umlk" data-emb="'+i+'"><b>🇲🇾 '+esc(L(e.n))+'</b><small>'+T("Alamat & nombor telefon terkini di laman rasmi","Current address & phone on the official page")+'</small></button>'; }).join("");
      h+='<h3 class="umh">'+T("Hospital","Hospitals")+'</h3><button class="umbtn gold full" id="xNear">🏥 '+T("Cari hospital & farmasi terdekat","Find the nearest hospital & pharmacy")+'</button>'+UMX_HOSP.map(function(x,i){ return '<button class="umlk" data-hos="'+i+'"><b>'+esc(x.n)+'</b><small>'+esc(L(x.d))+'</small></button>'; }).join("");
      h+='<h3 class="umh">'+T("Jika hilang","If you get lost")+'</h3><ul class="umul"><li>'+T("Pergi ke pintu masjid bernombor terdekat dan tunggu di titik pertemuan rombongan.","Go to the nearest numbered masjid gate and wait at your group's meeting point.")+'</li><li>'+T("Minta bantuan petugas berjaket atau pusat orang hilang di Haram.","Ask a staff member in a vest or the lost persons centre at the Haram.")+'</li><li>'+T("Tunjuk kad \"Saya sesat\" di atas.","Show the \"I am lost\" card above.")+'</li></ul>';
      h+='<div class="mut small">'+T("Nombor dan maklumat ini anggaran (Nov 2026). Semak semula apabila tiba.","Numbers and details are as known in Nov 2026. Check again when you arrive.")+'</div></div>';
      b.innerHTML=h;
      b.querySelectorAll("[data-tel]").forEach(function(x){ x.onclick=function(){ tel(x.getAttribute("data-tel")); }; });
      b.querySelectorAll("[data-emb]").forEach(function(x){ x.onclick=function(){ var e=UMX_EMBASSY[+x.getAttribute("data-emb")]; H.openWeb(e.u, L(e.n)); }; });
      b.querySelectorAll("[data-hos]").forEach(function(x){ x.onclick=function(){ var hx=UMX_HOSP[+x.getAttribute("data-hos")]; C.mapsSearch(hx.n, hx.c==="md"?[24.4672,39.6111]:[21.4225,39.8262]); }; });
      b.querySelector("#xNear").onclick=function(){ var hl=function(r){ H.off("location",hl); C.mapsSearch("hospital", r&&r.lat!=null?[r.lat,r.lon]:null); }; H.on("location",hl); H.N.getLocation(); };
      b.querySelector("#xLost").onclick=lostCard;
    });
  }
  function lostCard(){
    var p=P(); p.lost=p.lost||{}; var d=todayIdx(), city=cityOfDay(d)||p.order;
    C.layer(T("Kad saya sesat","Lost card"), function(b){
      var hotel=p.lost.hotel||C.lname(city);
      b.innerHTML='<div class="umpad"><div class="umrow"><span>'+T("Hotel","Hotel")+'</span><input type="text" id="lH" value="'+esc(hotel)+'"></div><div class="umrow"><span>'+T("No. bilik","Room")+'</span><input type="text" id="lR" value="'+esc(p.lost.room||"")+'"></div><div class="umrow"><span>'+T("Telefon saya","My phone")+'</span><input type="text" id="lP" inputmode="tel" value="'+esc(p.lost.phone||"")+'"></div><div class="umrow"><span>'+T("Telefon peneman","Companion's phone")+'</span><input type="text" id="lG" inputmode="tel" value="'+esc(p.lost.group||"")+'"></div><button class="umbtn red full" id="lShow">'+T("Papar skrin penuh","Show full screen")+'</button></div>';
      var keep=function(){ p.lost={hotel:b.querySelector("#lH").value, room:b.querySelector("#lR").value, phone:b.querySelector("#lP").value, group:b.querySelector("#lG").value}; save(); };
      b.querySelectorAll("input").forEach(function(i){ i.onchange=keep; });
      b.querySelector("#lShow").onclick=function(){ keep(); var X=UMX_LOST, l=p.lost;
        C.layer("", function(b2){ b2.parentNode.classList.add("lostcard");
          b2.innerHTML='<div class="umlost"><div class="ar big" dir="rtl">'+esc(X.ar1)+'<br>'+esc(X.ar2)+'</div><div class="ar" dir="rtl">'+esc(X.hotel)+': <b>'+esc(l.hotel)+'</b></div>'+(l.room?'<div class="ar" dir="rtl">'+esc(X.room)+': <b dir="ltr">'+esc(l.room)+'</b></div>':'')+(l.phone?'<div class="ar" dir="rtl">'+esc(X.phone)+': <b dir="ltr">'+esc(l.phone)+'</b></div>':'')+(l.group?'<div class="ar" dir="rtl">'+esc(X.group)+': <b dir="ltr">'+esc(l.group)+'</b></div>':'')+'<div class="ar" dir="rtl">'+esc(X.noar)+'</div><hr><div>'+esc(X.en)+'</div><div>'+esc(X.ms)+'</div></div>'; }); };
    });
  }

  // ---------- 2. spending tracker ----------
  function belanja(){
    var p=P(); p.exp=p.exp||[];
    C.layer("🧾 "+T("Tracker belanja","Spending tracker"), function(b){
      var draw=function(){
        var rate=C.sarRate(), tot=0, by={}; p.exp.forEach(function(x){ var r=x.cur==="SAR"?x.a*rate:x.a; tot+=r; by[x.c]=(by[x.c]||0)+r; });
        var c=C.costs(p), loc=0; c.rows.forEach(function(r){ if(["local","food","ziarah","shop"].indexOf(r.cat)>=0) loc+=(r.lo+r.hi)/2; });
        var pct=loc?Math.min(100,Math.round(tot*100/loc)):0;
        var h='<div class="umpad"><div class="umsum big">'+T("Sudah dibelanjakan","Spent so far")+'<b>'+rm(tot)+'</b><span>≈ SAR '+Math.round(tot/rate).toLocaleString("en-US")+' · '+T("bajet harian (makan, pengangkutan, ziarah, belanja) ","daily budget (food, transport, ziarah, shopping) ")+rm(loc)+'</span><div class="umbar"><i style="width:'+pct+'%" class="'+(pct>=90?"hot":"")+'"></i></div></div>';
        h+='<div class="umform"><input id="eA" inputmode="decimal" placeholder="'+T("Jumlah","Amount")+'"><div class="umseg sm"><button data-cur="SAR" class="on">SAR</button><button data-cur="RM">RM</button></div></div>';
        h+='<div class="umchips">'+UMX_EXP_CAT.map(function(x,i){ return '<button class="umchip'+(i===0?" on":"")+'" data-ec="'+x[0]+'">'+x[2]+' '+esc(L(x[1]))+'</button>'; }).join("")+'</div><input type="text" id="eN" placeholder="'+T("Nota (pilihan)","Note (optional)")+'"><button class="umbtn gold full" id="eAdd">＋ '+T("Tambah","Add")+'</button>';
        h+='<h3 class="umh">'+T("Ikut kategori","By category")+'</h3>'+UMX_EXP_CAT.filter(function(x){ return by[x[0]]; }).map(function(x){ return '<div class="umcr"><div><b>'+x[2]+' '+esc(L(x[1]))+'</b></div><div class="umcv">'+rm(by[x[0]])+'</div></div>'; }).join("")||'<div class="mut small">'+T("Belum ada rekod.","Nothing logged yet.")+'</div>';
        h+='<h3 class="umh">'+T("Rekod","Entries")+'</h3>'+p.exp.slice().reverse().map(function(x){ var cat=UMX_EXP_CAT.filter(function(c){ return c[0]===x.c; })[0]||UMX_EXP_CAT[7]; return '<div class="umcr"><div><b>'+cat[2]+' '+esc(x.n||L(cat[1]))+'</b><small>'+esc(C.fmtDate(new Date(x.t),true))+'</small></div><div class="umcv">'+x.cur+' '+x.a+'<button class="umlink" data-ex="'+x.t+'">'+T("Padam","Delete")+'</button></div></div>'; }).join("")+'</div>';
        b.innerHTML=h;
        var cur="SAR", cat="food";
        b.querySelectorAll("[data-cur]").forEach(function(x){ x.onclick=function(){ cur=x.getAttribute("data-cur"); b.querySelectorAll("[data-cur]").forEach(function(y){ y.classList.toggle("on",y===x); }); }; });
        b.querySelectorAll("[data-ec]").forEach(function(x){ x.onclick=function(){ cat=x.getAttribute("data-ec"); b.querySelectorAll("[data-ec]").forEach(function(y){ y.classList.toggle("on",y===x); }); }; });
        b.querySelector("#eAdd").onclick=function(){ var a=parseFloat(b.querySelector("#eA").value.replace(",",".")); if(!(a>0)){ C.toast(T("Masukkan jumlah","Enter an amount")); return; } p.exp.push({t:Date.now(), a:a, cur:cur, c:cat, n:b.querySelector("#eN").value.slice(0,60)}); save(); draw(); };
        b.querySelectorAll("[data-ex]").forEach(function(x){ x.onclick=function(){ var t=+x.getAttribute("data-ex"); p.exp=p.exp.filter(function(e){ return e.t!==t; }); save(); draw(); }; });
      };
      draw();
    });
  }

  // ---------- 3. document box (IndexedDB, optional PIN) ----------
  var DB=null;
  function db(cb){ if(DB){ cb(DB); return; } try{ var r=indexedDB.open("umrahdocs",1); r.onupgradeneeded=function(){ r.result.createObjectStore("d",{keyPath:"id"}); }; r.onsuccess=function(){ DB=r.result; cb(DB); }; r.onerror=function(){ cb(null); }; }catch(e){ cb(null); } }
  function dbAll(cb){ db(function(d){ if(!d){ cb(H.load("ihsan_umdocs",[])); return; } var out=[], tx=d.transaction("d").objectStore("d").openCursor(); tx.onsuccess=function(e){ var c=e.target.result; if(c){ out.push(c.value); c.continue(); } else cb(out); }; tx.onerror=function(){ cb([]); }; }); }
  function dbPut(v, cb){ db(function(d){ if(!d){ var a=H.load("ihsan_umdocs",[]).filter(function(x){ return x.id!==v.id; }); a.push(v); H.save("ihsan_umdocs",a); cb&&cb(); return; } var tx=d.transaction("d","readwrite"); tx.objectStore("d").put(v); tx.oncomplete=function(){ cb&&cb(); }; }); }
  function dbDel(id, cb){ db(function(d){ if(!d){ H.save("ihsan_umdocs",H.load("ihsan_umdocs",[]).filter(function(x){ return x.id!==id; })); cb&&cb(); return; } var tx=d.transaction("d","readwrite"); tx.objectStore("d").delete(id); tx.oncomplete=function(){ cb&&cb(); }; }); }
  function hash(s){ var h=5381; for(var i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))>>>0; return h.toString(36); }
  var docsOpen=false;
  function dokumen(){
    var pin=H.load("ihsan_umdocpin",null);
    if(pin && !docsOpen){ askPin(T("Masukkan PIN dokumen","Enter the document PIN"), function(v){ if(hash(pin.s+v)===pin.h){ docsOpen=true; dokumen(); return true; } return false; }); return; }
    C.layer("🗂 "+T("Peti dokumen","Document box"), function(b){
      var draw=function(){ dbAll(function(all){
        var h='<div class="umpad"><div class="mut small">'+T("Gambar disimpan dalam telefon ini sahaja dan boleh dibuka tanpa internet. PIN menyembunyikannya daripada orang lain tetapi bukan penyulitan.","Photos stay on this phone only and open without internet. The PIN hides them from others but is not encryption.")+'</div>';
        UMX_DOC_TYPES.forEach(function(t){ var mine=all.filter(function(x){ return x.k===t[0]; });
          h+='<div class="umdoc"><div class="umrow"><b>'+esc(L(t[1]))+'</b><span><button class="umbtn sm" data-add="'+t[0]+'" data-m="camera">📷</button><button class="umbtn sm" data-add="'+t[0]+'" data-m="gallery">🖼</button></span></div><div class="umthumbs">'+mine.map(function(x){ return '<button class="umth" data-view="'+x.id+'"><img src="'+x.img+'" alt=""></button>'; }).join("")+'</div></div>'; });
        h+='<button class="umbtn alt full" id="dPin">🔒 '+(pin?T("Tukar / buang PIN","Change / remove PIN"):T("Kunci dengan PIN","Lock with a PIN"))+'</button></div>';
        b.innerHTML=h;
        b.querySelectorAll("[data-add]").forEach(function(x){ x.onclick=function(){ pick(x.getAttribute("data-m"), function(img){ dbPut({id:"d"+Date.now(), k:x.getAttribute("data-add"), img:img, t:Date.now()}, draw); }); }; });
        b.querySelectorAll("[data-view]").forEach(function(x){ x.onclick=function(){ var d=all.filter(function(y){ return y.id===x.getAttribute("data-view"); })[0]; if(!d) return;
          C.layer(L((UMX_DOC_TYPES.filter(function(t){ return t[0]===d.k; })[0]||[0,["",""]])[1]), function(b2){ b2.innerHTML='<div class="umpad"><img class="umdocimg" src="'+d.img+'" alt=""><button class="umbtn red full" id="dDel">🗑 '+T("Padam gambar ini","Delete this photo")+'</button></div>'; b2.querySelector("#dDel").onclick=function(){ dbDel(d.id, function(){ C.closeLayer(); draw(); }); }; }); }; });
        b.querySelector("#dPin").onclick=function(){ if(pin){ var s=C.sheet('<button data-p="ch">'+T("Tukar PIN","Change PIN")+'</button><button data-p="rm" class="red">'+T("Buang PIN","Remove PIN")+'</button>'); s.querySelector('[data-p="rm"]').onclick=function(){ H.save("ihsan_umdocpin",null); pin=null; C.closeSheet(); draw(); }; s.querySelector('[data-p="ch"]').onclick=function(){ C.closeSheet(); setPin(); }; } else setPin(); };
        function setPin(){ askPin(T("PIN baharu (4 angka)","New PIN (4 digits)"), function(v){ var s=Date.now().toString(36); pin={s:s, h:hash(s+v)}; H.save("ihsan_umdocpin",pin); docsOpen=true; C.toast(T("PIN disimpan","PIN saved")); draw(); return true; }); }
      }); };
      draw();
    }, function(){ docsOpen=false; });
  }
  function askPin(title, check){
    var s=C.sheet('<div class="umsct">'+esc(title)+'</div><input type="password" inputmode="numeric" maxlength="4" id="pinI" class="umpin4"><div class="umerr" id="pinE"></div><button class="gold" id="pinOk">OK</button>');
    var i=s.querySelector("#pinI"); setTimeout(function(){ i.focus(); },50);
    var go=function(){ if(!/^\d{4}$/.test(i.value)){ s.querySelector("#pinE").textContent=T("4 angka","4 digits"); return; } var v=i.value; C.closeSheet(); if(check(v)===false){ C.toast(T("PIN salah","Wrong PIN")); } };
    s.querySelector("#pinOk").onclick=go; i.onkeyup=function(e){ if(i.value.length===4) go(); };
  }
  function pick(mode, cb){
    var done=function(url){ shrink(url, cb); };
    if(window.Native && H.N.pickImage){ var h=function(d){ H.off("image",h); if(d.cancel) return; if(d.error||!d.data){ C.toast(T("Gambar tidak dapat dibuka","The image could not be opened")); return; } done(d.data); }; H.on("image",h); H.N.pickImage(mode); return; }
    var inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.onchange=function(){ var f=inp.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ done(r.result); }; r.readAsDataURL(f); }; inp.click();
  }
  function shrink(url, cb){ var img=new Image(); img.onload=function(){ var k=Math.min(1,1600/Math.max(img.width,img.height)), c=document.createElement("canvas"); c.width=Math.round(img.width*k); c.height=Math.round(img.height*k); c.getContext("2d").drawImage(img,0,0,c.width,c.height); cb(c.toDataURL("image/jpeg",0.82)); }; img.onerror=function(){ cb(url); }; img.src=url; }

  // ---------- 4. Arabic phrases ----------
  function arab(){
    var cat="asas", q="";
    C.layer("🗣 "+T("Bahasa Arab untuk jemaah","Arabic for pilgrims"), function(b){
      var draw=function(){
        var list=UMX_AR.filter(function(x){ return q ? (x[1]+x[2]+x[3]+x[4]).toLowerCase().indexOf(q.toLowerCase())>=0 : x[0]===cat; });
        b.querySelector("#arL").innerHTML=list.map(function(x,i){ return '<div class="umph"><div class="umar" dir="rtl">'+esc(x[1])+'</div><div class="mut">'+esc(x[2])+'</div><div>'+esc(en()?x[4]:x[3])+'</div><button class="umbtn sm alt" data-say="'+esc(x[1])+'">🔊</button></div>'; }).join("")||'<div class="mut small">'+T("Tiada padanan","No match")+'</div>';
        b.querySelectorAll("[data-say]").forEach(function(x){ x.onclick=function(e){ e.stopPropagation(); if(H.speakAr) H.speakAr(x.getAttribute("data-say")); }; });
        b.querySelectorAll("[data-ac]").forEach(function(x){ x.classList.toggle("on", !q && x.getAttribute("data-ac")===cat); });
      };
      b.innerHTML='<div class="umpad"><input type="text" id="arQ" placeholder="🔍 '+T("Cari: teksi, harga, sakit…","Search: taxi, price, ill…")+'"><div class="umchips">'+Object.keys(UMX_AR_CAT).map(function(k){ return '<button class="umchip" data-ac="'+k+'">'+esc(L(UMX_AR_CAT[k]))+'</button>'; }).join("")+'</div><div id="arL"></div><div class="mut small">'+T("Bahasa Arab standard; sebutan rumi ialah panduan. Sila semak dengan penutur Arab.","Standard Arabic; the romanised line is a guide. Please check with an Arabic speaker.")+'</div></div>';
      b.querySelector("#arQ").oninput=function(){ q=this.value.trim(); draw(); };
      b.querySelectorAll("[data-ac]").forEach(function(x){ x.onclick=function(){ cat=x.getAttribute("data-ac"); q=""; b.querySelector("#arQ").value=""; draw(); }; });
      draw();
    });
  }

  // ---------- 5. group ----------
  function rombongan(){
    var p=P(); p.grp=p.grp||{m:[], meet:{mk:"",md:""}};
    C.layer("👥 "+T("Rombongan","Group"), function(b){
      var draw=function(){
        var g=p.grp, h='<div class="umpad"><h3 class="umh">'+T("Titik pertemuan","Meeting points")+'</h3>';
        h+='<div class="umrow"><span>Makkah</span><input type="text" data-meet="mk" placeholder="'+T("cth: Pintu 79, tiang hijau","e.g. Gate 79, green pillar")+'" value="'+esc(g.meet.mk)+'"></div><div class="umrow"><span>Madinah</span><input type="text" data-meet="md" placeholder="'+T("cth: Pintu 21 (Bab as-Salam)","e.g. Gate 21 (Bab al-Salam)")+'" value="'+esc(g.meet.md)+'"></div>';
        h+='<h3 class="umh">'+T("Ahli","Members")+' ('+g.m.length+')</h3>'+g.m.map(function(m,i){ return '<div class="umcr"><div><b>'+esc(m.n)+'</b><small>'+esc((m.r?T("Bilik ","Room ")+m.r+" · ":"")+(m.ph||""))+'</small></div><div class="umcv">'+(m.ph?'<button class="umbtn sm" data-call="'+esc(m.ph)+'">📞</button><button class="umbtn sm alt" data-wa="'+esc(m.ph)+'">WhatsApp</button>':'')+'<button class="umlink" data-rm="'+i+'">'+T("Buang","Remove")+'</button></div></div>'; }).join("");
        h+='<div class="umform col"><input type="text" id="gN" placeholder="'+T("Nama","Name")+'"><input type="text" id="gP" inputmode="tel" placeholder="'+T("Telefon (cth: 60123456789)","Phone (e.g. 60123456789)")+'"><input type="text" id="gR" placeholder="'+T("No. bilik","Room")+'"><button class="umbtn gold" id="gAdd">＋ '+T("Tambah ahli","Add member")+'</button></div>';
        h+='<h3 class="umh">'+T("Kongsi","Share")+'</h3><button class="umbtn full" id="gLoc">📍 '+T("Kongsi lokasi saya sekarang","Share my location now")+'</button><button class="umbtn full alt" id="gMeet">📌 '+T("Kongsi titik pertemuan","Share the meeting points")+'</button><button class="umbtn full alt" id="gPlan">📤 '+T("Kongsi fail rancangan kepada ahli","Send the plan file to members")+'</button>';
        h+='<div class="mut small">'+T("Untuk lokasi langsung berterusan, guna \"Kongsi lokasi langsung\" dalam WhatsApp.","For continuous live location, use WhatsApp's \"Share live location\".")+'</div></div>';
        b.innerHTML=h;
        b.querySelectorAll("[data-meet]").forEach(function(x){ x.onchange=function(){ g.meet[x.getAttribute("data-meet")]=x.value.slice(0,80); save(); }; });
        b.querySelector("#gAdd").onclick=function(){ var n=b.querySelector("#gN").value.trim(); if(!n) return; g.m.push({n:n.slice(0,40), ph:b.querySelector("#gP").value.replace(/[^\d+]/g,""), r:b.querySelector("#gR").value.slice(0,10)}); save(); draw(); };
        b.querySelectorAll("[data-rm]").forEach(function(x){ x.onclick=function(){ g.m.splice(+x.getAttribute("data-rm"),1); save(); draw(); }; });
        b.querySelectorAll("[data-call]").forEach(function(x){ x.onclick=function(){ tel(x.getAttribute("data-call")); }; });
        b.querySelectorAll("[data-wa]").forEach(function(x){ x.onclick=function(){ H.N.openUrl("https://wa.me/"+x.getAttribute("data-wa").replace(/[^\d]/g,"")); }; });
        b.querySelector("#gLoc").onclick=function(){ var hl=function(r){ H.off("location",hl); if(r.error||r.lat==null){ C.toast(T("Lokasi tidak tersedia","Location unavailable")); return; } C.shareText(T("Saya di sini: ","I am here: ")+"https://maps.google.com/?q="+r.lat.toFixed(6)+","+r.lon.toFixed(6)); }; H.on("location",hl); H.N.getLocation(); };
        b.querySelector("#gMeet").onclick=function(){ C.shareText("📌 "+T("Titik pertemuan","Meeting points")+"\nMakkah: "+(g.meet.mk||"-")+"\nMadinah: "+(g.meet.md||"-")); };
        b.querySelector("#gPlan").onclick=function(){ C.shareJson(); };
      };
      draw();
    });
  }

  // ---------- 6. course ----------
  function kursus(){
    var p=P(); p.course=p.course||{read:{}, best:null};
    C.layer("🎓 "+T("Kursus Umrah","Umrah course"), function(b){
      var h='<div class="umpad"><div class="umsum">'+Object.keys(p.course.read).length+" / "+UMX_COURSE.length+T(" pelajaran dibaca"," lessons read")+(p.course.best!=null?' · '+T("Kuiz terbaik: ","Best quiz: ")+'<b>'+p.course.best+"/"+UMX_QUIZ.length+'</b>':'')+'</div>';
      h+=UMX_COURSE.map(function(c,i){ return '<details class="umles" data-li="'+i+'"><summary>'+(p.course.read[i]?"✅ ":"📘 ")+(i+1)+'. '+esc(L(c.t))+'</summary>'+c.p.map(function(x){ return '<p>'+esc(L(x))+'</p>'; }).join("")+'</details>'; }).join("");
      h+='<button class="umbtn gold full" id="cQuiz">📝 '+T("Mula kuiz (","Start the quiz (")+UMX_QUIZ.length+T(" soalan)"," questions)")+'</button><button class="umbtn alt full" id="c3d">🕋 '+T("Latih langkah dalam panduan 3D","Practise the steps in the 3D guide")+'</button><div class="mut small">'+T("Mengikut mazhab Syafi'i (amalan Malaysia). Sila sahkan dengan ustaz atau kursus umrah bertauliah.","Following the Shafi'i school (Malaysian practice). Please confirm with an ustaz or an accredited umrah course.")+'</div></div>';
      b.innerHTML=h;
      b.querySelectorAll("[data-li]").forEach(function(d){ d.addEventListener("toggle", function(){ if(d.open){ p.course.read[d.getAttribute("data-li")]=1; save(); } }); });
      b.querySelector("#cQuiz").onclick=quiz;
      b.querySelector("#c3d").onclick=function(){ C.leaveForHajj(); };
    });
  }
  function quiz(){
    var p=P(), i=0, score=0;
    C.layer("📝 "+T("Kuiz umrah","Umrah quiz"), function(b){
      var step=function(){
        if(i>=UMX_QUIZ.length){ if(p.course.best==null||score>p.course.best) p.course.best=score; save();
          b.innerHTML='<div class="umpad"><div class="umsum big">'+T("Markah","Score")+'<b>'+score+" / "+UMX_QUIZ.length+'</b><span>'+(score>=13?T("Cemerlang! Anda bersedia.","Excellent! You are ready."):score>=9?T("Bagus. Ulang kaji pelajaran yang salah.","Good. Review the lessons you missed."):T("Baca semula pelajaran dan cuba lagi.","Read the lessons again and retry."))+'</span></div><button class="umbtn gold full" id="qAgain">'+T("Cuba lagi","Try again")+'</button></div>';
          b.querySelector("#qAgain").onclick=function(){ i=0; score=0; step(); }; return; }
        var Q=UMX_QUIZ[i];
        b.innerHTML='<div class="umpad"><div class="mut">'+(i+1)+" / "+UMX_QUIZ.length+'</div><h3 class="umq">'+esc(L(Q[0]))+'</h3>'+Q[1].map(function(o,j){ return '<button class="umopt" data-qa="'+j+'"><b>'+esc(L(o))+'</b></button>'; }).join("")+'<div id="qF"></div></div>';
        b.querySelectorAll("[data-qa]").forEach(function(x){ x.onclick=function(){ if(b.querySelector(".ok,.bad")) return; var j=+x.getAttribute("data-qa"); if(j===Q[2]){ score++; x.classList.add("ok"); } else { x.classList.add("bad"); b.querySelector('[data-qa="'+Q[2]+'"]').classList.add("ok"); }
          b.querySelector("#qF").innerHTML='<button class="umbtn gold full" id="qN">'+T("Seterusnya ›","Next ›")+'</button>'; b.querySelector("#qN").onclick=function(){ i++; step(); }; }; });
      };
      step();
    });
  }

  // ---------- 7. tips ----------
  function tips(){
    var cat="jimat";
    C.layer("💡 "+T("Tips & jimat kos","Tips & saving money"), function(b){
      var draw=function(){ b.querySelector("#tL").innerHTML=UMX_TIPS.filter(function(t){ return t[0]===cat; }).map(function(t){ return '<div class="umadab ok">'+esc(en()?t[2]:t[1])+'</div>'; }).join(""); b.querySelectorAll("[data-tc]").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-tc")===cat); }); };
      b.innerHTML='<div class="umpad"><div class="umchips">'+Object.keys(UMX_TIP_CAT).map(function(k){ return '<button class="umchip" data-tc="'+k+'">'+esc(L(UMX_TIP_CAT[k]))+'</button>'; }).join("")+'</div><div id="tL"></div></div>';
      b.querySelectorAll("[data-tc]").forEach(function(x){ x.onclick=function(){ cat=x.getAttribute("data-tc"); draw(); }; });
      draw();
    });
  }

  // ---------- 8. daily ibadah ----------
  function ibadah(){
    var p=P(); p.amal=p.amal||{}; var days=ksaDays(), ti=todayIdx(), sel=days.indexOf(ti)>=0?ti:days[0];
    C.layer("📿 "+T("Ibadah harian di Tanah Suci","Daily ibadah in the Holy Land"), function(b){
      var draw=function(){
        var a=p.amal[sel]=p.amal[sel]||{}, total=0; days.forEach(function(d){ var x=p.amal[d]||{}; total+=Object.keys(x).length; });
        var city=cityOfDay(sel), items=UMX_AMAL.filter(function(x){ return !(x[0]==="tawaf" && city==="md"); });
        b.innerHTML='<div class="umpad"><div class="umdays inl">'+days.map(function(d){ var x=p.amal[d]||{}, n=Object.keys(x).length; return '<button data-ad="'+d+'" class="'+(d===sel?"on":"")+'" style="--dc:'+C.dayColor(d)+'">'+T("Hari ","Day ")+(d+1)+(n?" · "+n:"")+'</button>'; }).join("")+'</div>'+
          '<div class="umsum">'+(city==="mk"?"Makkah":city==="md"?"Madinah":"")+' · '+Object.keys(a).length+" / "+items.length+T(" hari ini"," today")+' · '+T("Jumlah semua hari: ","All days: ")+total+'</div>'+
          items.map(function(x){ return '<label class="umchk"><input type="checkbox" data-am="'+x[0]+'"'+(a[x[0]]?" checked":"")+'><span>'+esc(L(x[1]))+'</span></label>'; }).join("")+'</div>';
        b.querySelectorAll("[data-ad]").forEach(function(x){ x.onclick=function(){ sel=+x.getAttribute("data-ad"); draw(); }; });
        b.querySelectorAll("[data-am]").forEach(function(x){ x.onchange=function(){ if(x.checked) a[x.getAttribute("data-am")]=1; else delete a[x.getAttribute("data-am")]; save(); draw(); }; });
      };
      if(sel==null){ b.innerHTML='<div class="umpad mut">'+T("Tiada hari di Saudi dalam rancangan.","No Saudi days in the plan.")+'</div>'; return; }
      draw();
    });
  }

  // ---------- 9. istiqamah ----------
  function istiqamah(){
    var p=P(); p.ist=p.ist||{};
    var s=C.stops(), last=s[s.length-1], start=C.addDays(C.parseYmd(p.start), (last?last.d:p.days)+1), now=new Date(); now.setHours(12,0,0,0);
    var day=Math.round((now-start)/864e5);
    C.layer("🌱 "+T("Istiqamah 40 hari","40-day istiqamah"), function(b){
      var sel=Math.max(0,Math.min(39,day));
      var draw=function(){
        var done=function(i){ return Object.keys(p.ist[i]||{}).length; }, full=0, streak=0;
        for(var i=0;i<40;i++) if(done(i)>=4) full++;
        for(var j=Math.min(39,Math.max(0,day));j>=0;j--){ if(done(j)>=4) streak++; else break; }
        var dt=C.addDays(start, sel), wd=dt.getDay(), a=p.ist[sel]=p.ist[sel]||{};
        b.innerHTML='<div class="umpad"><div class="umsum">'+(day<0?T("Bermula ","Starts ")+C.fmtDate(start)+T(" (sehari selepas pulang)"," (the day after you return)"):T("Hari ","Day ")+(Math.min(day,39)+1)+" / 40")+' · '+T("Hari penuh: ","Full days: ")+full+' · '+T("Berturut: ","Streak: ")+streak+'</div>'+
          '<div class="umist">'+Array.apply(null,{length:40}).map(function(_,i){ var n=done(i); return '<button data-id="'+i+'" class="'+(i===sel?"sel ":"")+(n>=4?"full":n?"part":"")+(i>Math.max(day,-1)?" fut":"")+'">'+(i+1)+'</button>'; }).join("")+'</div>'+
          '<h3 class="umh">'+T("Hari ","Day ")+(sel+1)+' · '+C.fmtDate(dt,true)+'</h3>'+UMX_HABITS.filter(function(x){ return x[0]!=="puasa" || wd===1 || wd===4; }).map(function(x){ return '<label class="umchk"><input type="checkbox" data-ih="'+x[0]+'"'+(a[x[0]]?" checked":"")+'><span>'+esc(L(x[1]))+'</span></label>'; }).join("")+
          '<div class="mut small">'+T("Hari \"penuh\" = 4 amalan atau lebih. Kekalkan amalan baik di Tanah Suci selepas pulang.","A \"full\" day = 4 or more habits. Keep the good habits from the Holy Land after you return.")+'</div></div>';
        b.querySelectorAll("[data-id]").forEach(function(x){ x.onclick=function(){ sel=+x.getAttribute("data-id"); draw(); }; });
        b.querySelectorAll("[data-ih]").forEach(function(x){ x.onchange=function(){ if(x.checked) a[x.getAttribute("data-ih")]=1; else delete a[x.getAttribute("data-ih")]; save(); draw(); }; });
      };
      draw();
    });
  }

  // ---------- my places + map picker ----------
  var KINDS = {home:["Rumah","Home"], mk:["Hotel di Makkah","Hotel in Makkah"], md:["Hotel di Madinah","Hotel in Madinah"], fmk:["Restoran di Makkah","Restaurants in Makkah"], fmd:["Restoran di Madinah","Restaurants in Madinah"],
    hxmk:["Hotel tambahan di Makkah","Another hotel in Makkah"], hxmd:["Hotel tambahan di Madinah","Another hotel in Madinah"], stop:["Pilih tempat","Choose a place"]};
  function cityDays(c){ var ds=[]; C.stops().forEach(function(o){ var cc=typeof o.p==="object"?(o.p&&o.p.c):(UM_PLACES[o.p]&&UM_PLACES[o.p].c); if(cc===c && o.tz===3 && ds.indexOf(o.d)<0) ds.push(o.d); }); return ds.sort(function(a,b){ return a-b; }); }
  function dayOpt(d, sel){ return '<option value="'+d+'"'+(d===sel?" selected":"")+'>'+T("Hari ","Day ")+(d+1)+' · '+C.fmtDate(C.addDays(C.parseYmd(P().start),d),true)+'</option>'; }
  function places(){ C.layer("📍 "+T("Tempat saya","My places"), function(b){ placesInto(b); }); }
  function placesInto(b){
    var p=P(); p.places=p.places||{};
    var draw=function(){
      var pl=p.places;
      var single=function(k, val){ return '<div class="umcard"><b>'+esc(L(KINDS[k]))+'</b><span class="'+(val?"":"mut")+'">'+esc(val?val.n:(k==="home"?p.home.n:T("Belum dipilih: ","Not chosen: ")+C.lname(k)))+'</span><span><button class="umbtn sm gold" data-pick="'+k+'">🗺 '+T("Pilih dari peta","Choose on the map")+'</button>'+(val?'<button class="umlink" data-clr="'+k+'">'+T("Set semula","Reset")+'</button>':'')+'</span></div>'; };
      var hotels=function(c){ var xs=(pl.hx||[]).map(function(x,i){ return {x:x,i:i}; }).filter(function(z){ return z.x.c===c; }), ds=cityDays(c);
        return xs.map(function(z){ return '<div class="umplc">🏨 '+esc(z.x.n)+' <button class="umlink" data-rmh="'+z.i+'">'+T("Buang","Remove")+'</button></div><div class="umplsel"><span class="mut small" style="align-self:center">'+T("Mula","From")+'</span><select data-hxf="'+z.i+'">'+ds.map(function(d){ return dayOpt(d, z.x.from); }).join("")+'</select></div>'; }).join("")+
          '<button class="umbtn sm alt" data-pick="hx'+c+'">＋ '+T("Tambah hotel lain (pindah hotel pada hari tertentu)","Add another hotel (move hotel on a chosen day)")+'</button>'; };
      var foods=function(k){ var c=k.slice(1), ds=cityDays(c), val=pl[k]||[];
        return '<div class="umcard"><b>'+esc(L(KINDS[k]))+'</b>'+(val.length?val.map(function(x,i){ return '<div class="umplc">🍽 '+esc(x.n)+' <button class="umlink" data-rmf="'+k+':'+i+'">'+T("Buang","Remove")+'</button></div><div class="umplsel"><select data-fd="'+k+':'+i+'"><option value="">'+T("Mana-mana hari (bergilir)","Any day (rotates)")+'</option>'+ds.map(function(d){ return dayOpt(d, x.d); }).join("")+'</select><select data-fm="'+k+':'+i+'"><option value="">'+T("Tengah hari / malam","Lunch or dinner")+'</option><option value="lunch"'+(x.meal==="lunch"?" selected":"")+'>'+T("Makan tengah hari","Lunch")+'</option><option value="din"'+(x.meal==="din"?" selected":"")+'>'+T("Makan malam","Dinner")+'</option></select></div>'; }).join(""):'<span class="mut">'+T("Belum dipilih: jadual guna hotel","Not chosen: the plan uses the hotel")+'</span>')+
          '<button class="umbtn sm gold" data-pick="'+k+'">＋ '+T("Tambah dari peta","Add from the map")+'</button></div>'; };
      b.innerHTML='<div class="umpad"><div class="mut small">'+T("Pilih rumah, hotel dan restoran sebenar. Restoran boleh ditetapkan untuk hari dan waktu makan tertentu. Jadual, jarak dan peta dikemas kini. Carian automatik perlukan internet; tanpa internet, tekan peta untuk letak pin.","Choose your real home, hotels and restaurants. A restaurant can be set for a day and meal. The plan, distances and map update. Auto search needs internet; offline, tap the map to drop a pin.")+'</div>'+
        single("home", pl.home)+single("mk", pl.mk).replace('</span></div>', '</span>'+hotels("mk")+'</div>')+single("md", pl.md).replace('</span></div>', '</span>'+hotels("md")+'</div>')+foods("fmk")+foods("fmd")+'</div>';
      var ch=function(){ save(); C.rebuild(); };
      b.querySelectorAll("[data-pick]").forEach(function(x){ x.onclick=function(){ picker(x.getAttribute("data-pick"), function(){ draw(); }); }; });
      b.querySelectorAll("[data-clr]").forEach(function(x){ x.onclick=function(){ var k=x.getAttribute("data-clr"); delete pl[k]; if(k==="home") C.resetHome(); ch(); draw(); }; });
      b.querySelectorAll("[data-rmf]").forEach(function(x){ x.onclick=function(){ var a=x.getAttribute("data-rmf").split(":"); pl[a[0]].splice(+a[1],1); ch(); draw(); }; });
      b.querySelectorAll("[data-rmh]").forEach(function(x){ x.onclick=function(){ pl.hx.splice(+x.getAttribute("data-rmh"),1); ch(); draw(); }; });
      b.querySelectorAll("[data-hxf]").forEach(function(x){ x.onchange=function(){ pl.hx[+x.getAttribute("data-hxf")].from=+this.value; ch(); }; });
      b.querySelectorAll("[data-fd]").forEach(function(x){ x.onchange=function(){ var a=x.getAttribute("data-fd").split(":"), f=pl[a[0]][+a[1]]; if(this.value==="") delete f.d; else f.d=+this.value; ch(); }; });
      b.querySelectorAll("[data-fm]").forEach(function(x){ x.onchange=function(){ var a=x.getAttribute("data-fm").split(":"), f=pl[a[0]][+a[1]]; if(this.value==="") delete f.meal; else f.meal=this.value; ch(); }; });
    };
    draw();
  }
  function overpass(kind, ll, cb){
    var r=kind[0]==="f"?700:1600, sel=kind[0]==="f"?'["amenity"~"restaurant|fast_food|cafe|food_court"]':'["tourism"~"hotel|apartment|hostel|guest_house"]';
    var q='[out:json][timeout:20];(node'+sel+'(around:'+r+','+ll[0]+','+ll[1]+');way'+sel+'(around:'+r+','+ll[0]+','+ll[1]+'););out center 80;';
    H.fetch("https://overpass-api.de/api/interpreter?data="+encodeURIComponent(q), function(st, body){
      try{ var j=JSON.parse(body), out=[]; (j.elements||[]).forEach(function(e){ var t=e.tags||{}, n=t["name:en"]||t.name; if(!n) return; var la=e.lat||(e.center&&e.center.lat), lo=e.lon||(e.center&&e.center.lon); if(la==null) return;
        out.push({n:n, ar:t.name&&t.name!==n?t.name:"", ll:[la,lo], sub:t.tourism||t.cuisine||t.amenity||"", stars:t.stars||""}); }); cb(out); }catch(e){ cb(null); } });
  }
  function photon(q, ll, cb){
    H.fetch("https://photon.komoot.io/api/?q="+encodeURIComponent(q)+"&limit=10&lang=en"+(ll?"&lat="+ll[0]+"&lon="+ll[1]:""), function(st, body){
      try{ var j=JSON.parse(body); cb((j.features||[]).map(function(f){ var pr=f.properties||{}; return {n:pr.name||pr.street||q, ll:[f.geometry.coordinates[1], f.geometry.coordinates[0]], sub:[pr.city||pr.county, pr.state, pr.country].filter(Boolean).join(", ")}; })); }catch(e){ cb(null); } });
  }
  function picker(kind, after, opts){
    opts=opts||{}; var p=P(); p.places=p.places||{};
    var city=/mk$/.test(kind)?"mk":/md$/.test(kind)?"md":null, sk=kind[0]==="f"?"f":(kind==="home"||kind==="stop")?kind:"h";
    var center=opts.center||(kind==="home"?p.home.ll:city==="mk"?(kind==="fmk"&&p.places.mk?p.places.mk.ll:[21.4225,39.8262]):(kind==="fmd"&&p.places.md?p.places.md.ll:[24.4672,39.6111]));
    var M=null, mk=null, results=[], chosen=null;
    C.layer("🗺 "+L(KINDS[kind]), function(b){
      b.innerHTML='<div class="umpick"><div class="umpmap" id="pkMap"></div><div class="umpbar"><input type="text" id="pkQ" placeholder="🔍 '+(kind==="home"?T("Cari alamat atau taman","Search an address or area"):T("Cari nama","Search a name"))+'"><button class="umbtn sm gold" id="pkGo">'+T("Cari","Search")+'</button></div><div class="umplist" id="pkL"><div class="mut small umpad">'+T("Mencari…","Searching…")+'</div></div><div class="umpsel" id="pkS"></div></div>';
      M=C.newMap(b.querySelector("#pkMap"), center, kind==="home"?13:15);
      if(opts.name) b.querySelector("#pkQ").value=opts.name;
      var list=b.querySelector("#pkL");
      var show=function(arr, msg){
        results=arr||[];
        if(arr==null){ list.innerHTML='<div class="mut small umpad">'+T("Tiada internet atau carian gagal. Tekan peta untuk letak pin dan beri nama.","No internet or the search failed. Tap the map to drop a pin and name it.")+'</div>'; return; }
        var ref=city?(city==="mk"?[21.4225,39.8262]:[24.4672,39.6111]):center;
        results.forEach(function(r){ r.dk=C.km(ref, r.ll); }); results.sort(function(a,b){ return a.dk-b.dk; });
        list.innerHTML=(msg?'<div class="mut small umpad">'+msg+'</div>':'')+(results.length?results.map(function(r,i){ return '<button class="umres" data-ri="'+i+'"><b>'+esc(r.n)+'</b><small>'+esc([r.stars?r.stars+"★":"", r.sub, city?(r.dk<1?Math.round(r.dk*1000)+" m":r.dk.toFixed(1)+" km")+T(" ke "," to ")+(city==="mk"?"Haram":"Nabawi"):""].filter(Boolean).join(" · "))+'</small></button>'; }).join(""):'<div class="mut small umpad">'+T("Tiada hasil. Cuba nama lain atau tekan peta.","No results. Try another name or tap the map.")+'</div>');
        list.querySelectorAll("[data-ri]").forEach(function(x){ x.onclick=function(){ select(results[+x.getAttribute("data-ri")]); }; });
        if(M){ (M._pins||[]).forEach(function(m){ m.remove(); }); M._pins=results.slice(0,60).map(function(r,i){ var el=document.createElement("button"); el.className="umpin small "+(kind[0]==="f"?"k-food":"k-hotel"); el.textContent=i+1; el.onclick=function(e){ e.stopPropagation(); select(r); }; return new maplibregl.Marker({element:el}).setLngLat([r.ll[1],r.ll[0]]).addTo(M); }); }
      };
      var select=function(r){
        chosen=r; if(M){ if(mk) mk.remove(); var el=document.createElement("div"); el.className="umpin sel k-sel"; el.textContent="✓"; mk=new maplibregl.Marker({element:el}).setLngLat([r.ll[1],r.ll[0]]).addTo(M); M.flyTo({center:[r.ll[1],r.ll[0]], zoom:Math.max(M.getZoom(),15)}); }
        var s=b.querySelector("#pkS"); s.innerHTML='<input type="text" id="pkN" value="'+esc(r.n)+'"><button class="umbtn gold" id="pkSave">✓ '+T("Simpan","Save")+'</button>';
        s.classList.add("on"); s.querySelector("#pkSave").onclick=function(){ var n=s.querySelector("#pkN").value.trim()||r.n; commit({n:n.slice(0,80), ll:r.ll}); };
      };
      var commit=function(v){
        p.places=p.places||{};
        if(kind==="stop"){ C.closeLayer(); if(after) after(v); return; }
        if(kind==="home"){ p.places.home=v; C.setHome(v); }
        else if(kind==="mk"||kind==="md"){ p.places[kind]=v; }
        else if(kind==="hxmk"||kind==="hxmd"){ var c=kind.slice(2), ds=cityDays(c); v.c=c; v.from=ds.length>1?ds[Math.floor(ds.length/2)]:(ds[0]||0); p.places.hx=p.places.hx||[]; p.places.hx.push(v); }
        else { p.places[kind]=p.places[kind]||[]; p.places[kind].push(v); }
        save(); C.rebuild(); C.toast(T("Disimpan: ","Saved: ")+v.n); C.closeLayer(); if(after) after();
      };
      if(M) M.on("click", function(e){ var ll=[e.lngLat.lat, e.lngLat.lng]; var r={n:T("Tempat dipilih","Chosen place"), ll:ll};
        select(r); H.fetch("https://photon.komoot.io/reverse?lon="+ll[1]+"&lat="+ll[0]+"&lang=en", function(st, body){ try{ var f=JSON.parse(body).features[0].properties; var nm=f.name||[f.housenumber,f.street].filter(Boolean).join(" ")||f.district||f.city; if(nm && chosen===r){ r.n=nm; var i=b.querySelector("#pkN"); if(i) i.value=nm; } }catch(e){} }); });
      var search=function(){ var q=b.querySelector("#pkQ").value.trim(); if(!q){ if(kind!=="home" && kind!=="stop") overpass(kind, M?[M.getCenter().lat,M.getCenter().lng]:center, function(r){ show(r); }); return; } list.innerHTML='<div class="mut small umpad">'+T("Mencari…","Searching…")+'</div>'; photon(q+(city?(city==="mk"?" Makkah":" Madinah"):""), M?[M.getCenter().lat,M.getCenter().lng]:center, function(r){ show(r); }); };
      b.querySelector("#pkGo").onclick=search; b.querySelector("#pkQ").onkeydown=function(e){ if(e.key==="Enter") search(); };
      if(kind==="stop"){ show([], T("Cari nama tempat, atau tekan peta untuk letak pin.","Search a place name, or tap the map to drop a pin.")); if(opts.name) setTimeout(search, 50); }
      else if(kind==="home") show([], T("Taip alamat anda dan tekan Cari, atau tekan peta.","Type your address and tap Search, or tap the map."));
      else overpass(kind, center, function(r){ show(r, r&&r.length?T("Berdekatan (data OpenStreetMap). Tekan untuk pilih.","Nearby (OpenStreetMap data). Tap one to choose."):null); });
    }, function(){ if(M){ try{ M.remove(); }catch(e){} } });
  }

  return {init:function(c){ C=c; H=c.H; }, grid:grid, open:open, sos:sos, places:places, placesInto:placesInto, picker:picker};
})();
