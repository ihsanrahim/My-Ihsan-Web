/* My Ihsan 0.35.0: Bayi (Alat › Keluarga › Bayi), Farah 2026-11-07. A hub with four pages that swipe sideways:
   Anak (child profiles + one photo a year), Vaksin (KKM national immunisation schedule with due dates from the date of birth,
   the date each dose was given, reminders), Kenangan (an on-device photo gallery with albums, per child), Nama (Islamic baby names).
   Storage: ihsan_baby {kids:[kid], al:[album], ph:[photo], rem, pre, cur}
     kid {id, n, g:"m"|"f", b:"YYYY-MM-DD", reg:""|"sabah"|"sarawak", pid (family tree person), av (photo id), bw, bl, tob, hosp, blood, note,
          vx:{key:{g:given date, due:own due date, w:where, n:note}}, cv:[{k, n, due, g, w}], rem}
     album {id, n, kid, cov, t}   photo {id, t (taken, ms), at (added), kid, al (album id), yr (annual photo year), cap}
   Photos are files in the app's own storage (Native.photoAdd → files/photos/<id>.jpg + t/<id>.jpg); they are not in the JSON backup.
   Reminders and the Home widget read ihsan_famrem.baby (written here on every save). */
(function(){
"use strict";
var H, L2, E, U, B, page="kids", kidF="", alb=null, view_=null;
var PAGES=[["kids","🧒","Anak","Children"],["vax","💉","Vaksin","Vaccines"],["mem","📷","Kenangan","Memories"],["names","📝","Nama","Names"]];

// KKM Jadual Imunisasi Kebangsaan (as in the Buku Rekod Kesihatan Bayi & Kanak-kanak). [key, age in months, Malay, English, protects (ms), protects (en), region]
// PCV 4 / 6 / 15 months: Dewan Rakyat reply, 9 Dec 2020. The rest follows the schedule as published by KKM; check it against your child's book.
var VX=[
  ["bcg",0,"BCG","BCG","Batuk kering (tibi)","Tuberculosis (TB)"],
  ["hb1",0,"Hepatitis B dos 1","Hepatitis B dose 1","Hepatitis B","Hepatitis B"],
  ["hx1",2,"Heksavalen dos 1 (DTaP-IPV-Hib-HepB)","Hexavalent dose 1 (DTaP-IPV-Hib-HepB)","Difteria, tetanus, batuk kokol, polio, Hib, hepatitis B","Diphtheria, tetanus, whooping cough, polio, Hib, hepatitis B"],
  ["hx2",3,"Heksavalen dos 2","Hexavalent dose 2","Difteria, tetanus, batuk kokol, polio, Hib, hepatitis B","Diphtheria, tetanus, whooping cough, polio, Hib, hepatitis B"],
  ["pcv1",4,"Pneumokokal (PCV) dos 1","Pneumococcal (PCV) dose 1","Radang paru-paru, meningitis, jangkitan telinga","Pneumonia, meningitis, ear infections"],
  ["hx3",5,"Heksavalen dos 3","Hexavalent dose 3","Difteria, tetanus, batuk kokol, polio, Hib, hepatitis B","Diphtheria, tetanus, whooping cough, polio, Hib, hepatitis B"],
  ["pcv2",6,"Pneumokokal (PCV) dos 2","Pneumococcal (PCV) dose 2","Radang paru-paru, meningitis, jangkitan telinga","Pneumonia, meningitis, ear infections"],
  ["msb",6,"Campak (Sabah sahaja)","Measles (Sabah only)","Campak","Measles","sabah"],
  ["mmr1",9,"MMR dos 1","MMR dose 1","Campak, beguk, rubela","Measles, mumps, rubella"],
  ["je1",9,"Japanese Encephalitis dos 1 (Sarawak)","Japanese Encephalitis dose 1 (Sarawak)","Radang otak JE (nyamuk)","JE brain infection (mosquito)","sarawak"],
  ["mmr2",12,"MMR dos 2","MMR dose 2","Campak, beguk, rubela","Measles, mumps, rubella"],
  ["pcv3",15,"Pneumokokal (PCV) penggalak","Pneumococcal (PCV) booster","Radang paru-paru, meningitis, jangkitan telinga","Pneumonia, meningitis, ear infections"],
  ["hxb",18,"DTaP-IPV-Hib penggalak","DTaP-IPV-Hib booster","Difteria, tetanus, batuk kokol, polio, Hib","Diphtheria, tetanus, whooping cough, polio, Hib"],
  ["je2",21,"Japanese Encephalitis dos 2 (Sarawak)","Japanese Encephalitis dose 2 (Sarawak)","Radang otak JE (nyamuk)","JE brain infection (mosquito)","sarawak"],
  ["dt",84,"DT penggalak (Tahun 1 sekolah, 7 tahun)","DT booster (school Year 1, age 7)","Difteria, tetanus","Diphtheria, tetanus"],
  ["hpv",156,"HPV (Tingkatan 1, 13 tahun)","HPV (Form 1, age 13)","Kanser serviks dan kanser berkaitan HPV","Cervical and other HPV-related cancers"],
  ["tt",180,"Tetanus penggalak (Tingkatan 3, 15 tahun)","Tetanus booster (Form 3, age 15)","Tetanus","Tetanus"]];
// optional vaccines from private clinics (not in the free programme)
var XV=[["Rotavirus","Rotavirus",2],["Influenza (tahunan)","Influenza (yearly)",6],["Cacar air (varisela)","Chickenpox (varicella)",12],["Hepatitis A","Hepatitis A",12],["Meningokokal","Meningococcal",12],["Denggi","Dengue",108]];

function ld(){ B=H.load("ihsan_baby",null)||{}; ["kids","al","ph"].forEach(function(k){ if(!Array.isArray(B[k])) B[k]=[]; }); if(B.rem==null) B.rem=true; if(B.pre==null) B.pre=3; return B; }
function sv(){ H.save("ihsan_baby",B); remSync(); }
function K(id){ for(var i=0;i<B.kids.length;i++) if(B.kids[i].id===id) return B.kids[i]; return null; }
function A(id){ for(var i=0;i<B.al.length;i++) if(B.al[i].id===id) return B.al[i]; return null; }
function PH(id){ for(var i=0;i<B.ph.length;i++) if(B.ph[i].id===id) return B.ph[i]; return null; }
function draw(){ if(window.FamView) FamView.draw(); }
function addM(d, m){ var x=new Date(d.getFullYear(), d.getMonth()+m, d.getDate()); if(x.getDate()!==d.getDate()) x=new Date(d.getFullYear(), d.getMonth()+m+1, 0); return x; }
function ageStr(b){ var d=U.pd(b); if(!d) return ""; var t=U.today(), m=(t.getFullYear()-d.getFullYear())*12+t.getMonth()-d.getMonth(); if(t.getDate()<d.getDate()) m--;
  if(m<0) return L2("belum lahir","not born yet");
  if(m<1){ var dd=U.days(d,t); return dd+L2(" hari"," days"); }
  if(m<24){ var a=addM(d,m), r=U.days(a,t); return m+L2(" bulan"," months")+(r?" "+r+L2(" hari"," d"):""); }
  var y=Math.floor(m/12), mm=m%12; return y+L2(" tahun"," years")+(mm?" "+mm+L2(" bulan"," mo"):""); }
function ageLab(mo){ if(!mo) return L2("Semasa lahir","At birth"); if(mo<24) return mo+L2(" bulan"," months"); return (mo/12)+L2(" tahun"," years"); }

// ---------- vaccines ----------
function doses(k){ var b=U.pd(k.b), L=[];
  VX.forEach(function(v){ if(v[6] && v[6]!==k.reg) return; var r=(k.vx||{})[v[0]]||{}, due=r.due?U.pd(r.due):(b?addM(b,v[1]):null);
    L.push({k:v[0], mo:v[1], n:L2(v[2],v[3]), p:L2(v[4],v[5]), due:due, g:r.g||"", w:r.w||"", note:r.n||"", own:!!r.due, kkm:true}); });
  (k.cv||[]).forEach(function(c){ L.push({k:c.k, mo:null, n:c.n, p:L2("Vaksin tambahan","Extra vaccine"), due:c.due?U.pd(c.due):null, g:c.g||"", w:c.w||"", note:c.note||"", custom:true}); });
  L.sort(function(a,b){ var x=a.due?a.due.getTime():1e15, y=b.due?b.due.getTime():1e15; return x-y; });
  return L; }
function st(d){ var t=U.today(); if(d.g) return "done"; if(!d.due) return "nodate"; var n=U.days(t,d.due); if(n<0) return "late"; if(n<=30) return "soon"; return "later"; }
function nextDose(k){ var L=doses(k).filter(function(d){ return !d.g && d.due; }); return L[0]||null; }
function remSync(){
  var out=[], vx=[], t0=Date.now(), at=function(d,h){ var x=new Date(d); x.setHours(h,0,0,0); return x.getTime(); };
  B.kids.forEach(function(k){ if(!k.b) return; doses(k).forEach(function(d){ if(d.g || !d.due) return;
      vx.push({kid:k.n, v:d.n, t:d.due.getTime()});
      if(!B.rem || k.rem===false) return;
      var pre=+B.pre||0, ds=U.dstr(U.ymd(d.due));
      if(pre){ var tp=at(new Date(d.due.getTime()-pre*864e5),9); if(tp>t0) out.push({t:tp, k:"vx"+k.id+d.k+"p", ti:"💉 "+k.n+": "+d.n, b:L2("Vaksin dijadualkan pada ","Vaccine due on ")+ds+L2(". Bawa Buku Rekod Kesihatan."," Bring the health record book.")}); }
      var td=at(d.due,8); if(td>t0) out.push({t:td, k:"vx"+k.id+d.k, ti:"💉 "+k.n+": "+d.n, b:L2("Hari ini tarikh vaksin. Bawa Buku Rekod Kesihatan ke klinik.","The vaccine is due today. Bring the health record book to the clinic.")});
  });
    // overdue doses: one reminder a week per child (Monday 9 am), not one per dose
    if(B.rem && k.rem!==false){ var late=doses(k).filter(function(d){ return st(d)==="late"; });
      if(late.length){ var nx=new Date(); nx.setDate(nx.getDate()+((8-nx.getDay())%7||7)); out.push({t:at(nx,9), k:"vxl"+k.id+U.ymd(nx), ti:"⏰ "+k.n+": "+late.length+L2(" vaksin lewat"," vaccines overdue"), b:late.slice(0,3).map(function(d){ return d.n; }).join(", ")+(late.length>3?"…":"")+L2(". Hubungi klinik kesihatan, atau tandakan yang sudah diberi.",". Contact the health clinic, or mark the ones already given.")}); } }
  });
  vx.sort(function(a,b){ return a.t-b.t; });
  var R=H.load("ihsan_famrem",null)||{}; R.baby=out.slice(0,60); R.vx=vx.slice(0,6); H.save("ihsan_famrem",R); try{ H.resched(); }catch(e){} }
window.BabyRemSync=function(h){ H=H||h; L2=L2||h.L2x; U=U||FamView.util(); ld(); remSync(); };

// ---------- photos: files in the app's storage on a phone; small data URLs in the browser preview ----------
var PDIR=null;
function pdir(){ if(PDIR==null) PDIR=(window.Native && H.N.photoDir)?H.N.photoDir():""; return PDIR; }
function src(id, full){ if(pdir()) return pdir()+(full?"":"t/")+id+".jpg"; try{ return localStorage.getItem("ihsan_phx_"+id)||""; }catch(e){ return ""; } }
function img(id, cls){ return '<img class="'+(cls||"")+'" loading="lazy" src="'+E(src(id))+'" alt="">'; }
function addPhotos(mode, tag, done){
  if(window.Native && H.N.photoAdd){ var hl=function(r){ if(!r || r.tag!==tag) return; H.off("photos",hl); if(r.error) H.toast(L2("Gambar gagal disimpan","Could not save the photo")); if(r.list && r.list.length) done(r.list); }; H.on("photos",hl); H.N.photoAdd(mode, tag); return; }
  var inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; if(mode==="camera") inp.setAttribute("capture","environment"); if(mode==="gallery") inp.multiple=true;
  inp.onchange=function(){ var fs=[].slice.call(inp.files||[]), out=[], n=fs.length; if(!n) return;
    fs.forEach(function(f){ var rd=new FileReader(); rd.onload=function(){ var im=new Image(); im.onload=function(){ var k=Math.min(1,900/Math.max(im.width,im.height)), c=document.createElement("canvas"); c.width=Math.round(im.width*k); c.height=Math.round(im.height*k); c.getContext("2d").drawImage(im,0,0,c.width,c.height);
          var id="f"+Date.now().toString(36)+Math.random().toString(36).slice(2,5); try{ localStorage.setItem("ihsan_phx_"+id, c.toDataURL("image/jpeg",0.8)); }catch(e){ H.toast(L2("Storan pelayar penuh","Browser storage is full")); }
          out.push({id:id, t:f.lastModified||0, w:c.width, h:c.height}); if(out.length===n) done(out); }; im.src=rd.result; }; rd.readAsDataURL(f); }); };
  inp.click(); }
function delPhoto(id){ B.ph=B.ph.filter(function(p){ return p.id!==id; }); B.kids.forEach(function(k){ if(k.av===id) k.av=null; }); B.al.forEach(function(a){ if(a.cov===id) a.cov=null; });
  if(window.Native && H.N.photoDel) H.N.photoDel(id); else try{ localStorage.removeItem("ihsan_phx_"+id); }catch(e){} }
function pickSrc(tag, done, one){
  var ov=H.showSheet("📷 "+L2("Tambah gambar","Add photos"), '<div class="btns"><button class="btn gold g3d" id="bpC">📷 '+L2("Kamera","Camera")+'</button><button class="btn alt g3d" id="bpG">🖼 '+(one?L2("Pilih dari galeri","Choose from gallery"):L2("Galeri (boleh pilih banyak)","Gallery (pick many)"))+'</button></div><div class="mut tiny" style="margin-top:8px">'+L2("Gambar disalin ke storan aplikasi ini sahaja, tidak dimuat naik ke mana-mana.","Photos are copied into this app's own storage only and are not uploaded anywhere.")+'</div>');
  ov.querySelector("#bpC").onclick=function(){ H.closeOverlay(); addPhotos("camera", tag, done); };
  ov.querySelector("#bpG").onclick=function(){ H.closeOverlay(); addPhotos(one?"one":"gallery", tag, done); }; }
function newPh(x, o){ var p={id:x.id, t:x.t||0, at:Date.now()}; for(var k in o) p[k]=o[k]; B.ph.push(p); return p; }
function phDate(p){ return p.t||p.at||0; }

// ---------- page: children ----------
function kidAv(k, big){ var a=k.av&&PH(k.av)?k.av:null; if(!a){ var ys=B.ph.filter(function(p){ return p.kid===k.id && p.yr; }).sort(function(x,y){ return y.yr-x.yr; }); if(ys[0]) a=ys[0].id; }
  return '<span class="bbav'+(big?" big":"")+(k.g==="f"?" f":"")+'">'+(a?img(a):(k.g==="f"?"👧":"👦"))+'</span>'; }
function yrStrip(k){ var b=U.pd(k.b), y0=b?b.getFullYear():new Date().getFullYear(), y1=new Date().getFullYear(), h="";
  for(var y=y1;y>=y0;y--){ var p=B.ph.filter(function(x){ return x.kid===k.id && x.yr===y; })[0], a=y-y0;
    h+='<button class="bbyr'+(p?" has":"")+'" data-yr="'+y+'" data-yk="'+k.id+'"'+(p?' data-ph="'+p.id+'"':'')+'>'+(p?img(p.id):'<span class="bbplus">＋</span>')+'<small>'+y+(b?' · '+(a?a+L2(" thn"," y"):L2("lahir","born")):'')+'</small></button>'; }
  return '<div class="bbyrs noswipe">'+h+'</div>'; }
function pKids(el){
  var h='';
  if(!B.kids.length) h+='<div class="card"><h3>👶 '+L2("Profil anak","Children's profiles")+'</h3><div class="mut small">'+L2("Tambah anak untuk jadual vaksin KKM, galeri kenangan dan satu foto setiap tahun.","Add a child for the KKM vaccine schedule, a memory gallery and one photo every year.")+'</div></div>';
  B.kids.forEach(function(k){ var nx=nextDose(k), s=nx?st(nx):null, done=doses(k).filter(function(d){ return d.g; }).length, all=doses(k).length;
    h+='<div class="card bbkid"><button class="bbkh" data-ke="'+k.id+'">'+kidAv(k,true)+'<span class="fmain"><b>'+E(k.n)+'</b><small>'+(k.b?U.dstr(k.b)+' · '+ageStr(k.b):L2("Isi tarikh lahir","Add the date of birth"))+'</small>'+
      (nx?'<small class="bbnx '+s+'">💉 '+E(nx.n)+' · '+(s==="late"?L2("lewat ","overdue ")+(-U.days(U.today(),nx.due))+L2(" hari"," d"):U.dstr(U.ymd(nx.due)))+'</small>':(k.b&&all?'<small class="bbnx done">✓ '+L2("Semua vaksin selesai","All vaccines done")+'</small>':''))+'</span><span class="chev">✎</span></button>'+
      '<div class="snl">📅 '+L2("Foto tahunan","Yearly photo")+' <span class="mut tiny">'+L2("tekan ＋ untuk foto tahun itu","tap ＋ for that year's photo")+'</span></div>'+yrStrip(k)+
      '<div class="btns bbkb"><button class="chip g3d" data-kv="'+k.id+'">💉 '+done+'/'+all+'</button><button class="chip g3d" data-km="'+k.id+'">📷 '+B.ph.filter(function(p){ return p.kid===k.id; }).length+'</button></div></div>'; });
  h+='<div class="btns"><button class="btn gold g3d" id="bbAdd">＋ '+L2("Anak","Child")+'</button>'+(famKids().length?'<button class="btn alt g3d" id="bbImp">🌳 '+L2("Dari salasilah","From family tree")+'</button>':'')+'</div>';
  el.innerHTML=h;
  bind(el, "#bbAdd", function(){ kidEdit(null); }); bind(el, "#bbImp", impKids);
  el.querySelectorAll("[data-ke]").forEach(function(b){ b.onclick=function(){ kidEdit(b.getAttribute("data-ke")); }; });
  el.querySelectorAll("[data-kv]").forEach(function(b){ b.onclick=function(){ B.cur=b.getAttribute("data-kv"); go("vax"); }; });
  el.querySelectorAll("[data-km]").forEach(function(b){ b.onclick=function(){ kidF=b.getAttribute("data-km"); alb=null; go("mem"); }; });
  bindYrs(el); }
function bindYrs(el){ el.querySelectorAll("[data-yr]").forEach(function(b){ b.onclick=function(){ var kid=b.getAttribute("data-yk"), y=+b.getAttribute("data-yr"), ph=b.getAttribute("data-ph");
    if(ph){ var L=B.ph.filter(function(p){ return p.kid===kid && p.yr; }).sort(function(a,c){ return c.yr-a.yr; }).map(function(p){ return p.id; }); viewer(L, ph); return; }
    pickSrc("yr:"+kid+":"+y, function(list){ ld(); B.ph.filter(function(p){ return p.kid===kid && p.yr===y; }).forEach(function(p){ p.yr=null; }); newPh(list[0], {kid:kid, yr:y}); sv(); draw(); H.toast(L2("Foto tahun "+y+" disimpan","Photo for "+y+" saved")); }, true); }; }); }
function famKids(){ var F=U.fam(), have={}; B.kids.forEach(function(k){ if(k.pid) have[k.pid]=1; });
  return (F.p||[]).filter(function(p){ var a=U.age(p); return !have[p.id] && !p.dd && p.b && a!=null && a<18; }); }
function impKids(){ var L=famKids();
  var ov=H.showSheet("🌳 "+L2("Pilih dari salasilah","Pick from the family tree"), L.map(function(p){ return '<label class="frow"><input type="checkbox" data-ip="'+p.id+'" checked> <span class="fmain"><b>'+E(p.n)+'</b><small>'+U.dstr(p.b)+' · '+ageStr(p.b)+'</small></span></label>'; }).join("")+'<button class="btn gold full g3d" id="ipOk" style="margin-top:8px">✓ '+L2("Tambah","Add")+'</button>');
  ov.querySelector("#ipOk").onclick=function(){ ov.querySelectorAll("[data-ip]").forEach(function(c){ if(!c.checked) return; var p=U.P(c.getAttribute("data-ip")); if(p) B.kids.push({id:U.uid(), n:p.n, g:p.g, b:p.b, pid:p.id, vx:{}, cv:[]}); }); sv(); H.closeOverlay(); draw(); }; }
function kidEdit(id){
  var k=id?K(id):{n:"", g:"m", b:"", reg:"", vx:{}, cv:[]}, g=k.g, F=U.fam();
  var ov=H.showSheet((id?"✎ ":"＋ ")+L2("Profil anak","Child's profile"),
    '<div class="fnrow">'+H.fld("bkN",L2("Nama","Name"),k.n)+'<button class="btn gold g3d" id="bkOk">✓ '+L2("Simpan","Save")+'</button></div>'+
    '<div class="chips fseg" id="bkG"><button class="chip'+(g==="m"?" on":"")+'" data-v="m">👦 '+L2("Lelaki","Boy")+'</button><button class="chip'+(g==="f"?" on":"")+'" data-v="f">👧 '+L2("Perempuan","Girl")+'</button></div>'+
    '<div class="snl">'+L2("Tarikh lahir","Date of birth")+'</div>'+U.wheelHtml("bkB", k.b)+
    '<label class="fl">'+L2("Negeri (untuk vaksin khas)","State (for regional vaccines)")+'<select id="bkR"><option value="">'+L2("Semenanjung / lain-lain","Peninsula / other")+'</option><option value="sabah"'+(k.reg==="sabah"?" selected":"")+'>Sabah</option><option value="sarawak"'+(k.reg==="sarawak"?" selected":"")+'>Sarawak</option></select></label>'+
    '<div class="f2">'+H.fld("bkW",L2("Berat lahir (kg)","Birth weight (kg)"),k.bw||"","number",' step="0.01" inputmode="decimal"')+H.fld("bkL",L2("Panjang (cm)","Length (cm)"),k.bl||"","number",' inputmode="decimal"')+'</div>'+
    '<div class="f2">'+H.fld("bkT",L2("Masa lahir","Time of birth"),k.tob||"","time")+H.fld("bkBl",L2("Kumpulan darah","Blood group"),k.blood||"")+'</div>'+
    H.fld("bkH",L2("Hospital / tempat lahir","Hospital / place of birth"),k.hosp||"")+
    '<label class="fl">'+L2("Pautan salasilah","Family tree link")+'<select id="bkP"><option value="">–</option>'+(F.p||[]).map(function(p){ return '<option value="'+p.id+'"'+(k.pid===p.id?" selected":"")+'>'+E(p.n)+'</option>'; }).join("")+'</select></label>'+
    H.fld("bkO",L2("Nota (alahan, dll.)","Notes (allergies, etc.)"),k.note||"")+
    '<label class="fdk"><input type="checkbox" id="bkRem"'+(k.rem!==false?" checked":"")+'> 🔔 '+L2("Peringatan vaksin untuk anak ini","Vaccine reminders for this child")+'</label>'+
    (id?'<button class="btn alt full g3d" id="bkX" style="margin-top:6px">🗑 '+L2("Padam profil","Delete profile")+'</button>':''));
  U.wheelBind(ov.querySelector("#bkB"));
  ov.querySelectorAll("#bkG [data-v]").forEach(function(b){ b.onclick=function(){ g=b.getAttribute("data-v"); ov.querySelectorAll("#bkG [data-v]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
  ov.querySelector("#bkP").onchange=function(){ var p=U.P(this.value); if(p){ if(!ov.querySelector("#bkN").value.trim()) ov.querySelector("#bkN").value=p.n; } };
  ov.querySelector("#bkOk").onclick=function(){ var v=function(s){ return ov.querySelector(s).value.trim(); }; if(!v("#bkN")){ H.toast(L2("Isi nama","Fill in a name")); return; }
    k.n=v("#bkN"); k.g=g; k.b=U.wheelVal(ov.querySelector("#bkB")); k.reg=v("#bkR"); k.bw=v("#bkW"); k.bl=v("#bkL"); k.tob=v("#bkT"); k.blood=v("#bkBl"); k.hosp=v("#bkH"); k.pid=v("#bkP")||null; k.note=v("#bkO"); k.rem=ov.querySelector("#bkRem").checked;
    if(!id){ k.id=U.uid(); B.kids.push(k); B.cur=k.id; }
    sv(); H.closeOverlay(); draw(); };
  var x=ov.querySelector("#bkX"); if(x) x.onclick=function(){ if(!confirm(L2("Padam profil "+k.n+"? Gambar kekal dalam Kenangan.","Delete "+k.n+"'s profile? Photos stay in Memories."))) return; B.kids=B.kids.filter(function(y){ return y.id!==id; }); B.ph.forEach(function(p){ if(p.kid===id) p.kid=null; }); sv(); H.closeOverlay(); draw(); }; }

// ---------- page: vaccines ----------
function kidChips(cur, attr, all){ return '<div class="chips fseg">'+(all?'<button class="chip g3d'+(!cur?" on":"")+'" '+attr+'="">'+L2("Semua","All")+'</button>':'')+B.kids.map(function(k){ return '<button class="chip g3d'+(cur===k.id?" on":"")+'" '+attr+'="'+k.id+'">'+(k.g==="f"?"👧 ":"👦 ")+E(k.n.split(" ")[0])+'</button>'; }).join("")+'</div>'; }
function pVax(el){
  if(!B.kids.length){ el.innerHTML='<div class="card"><h3>💉 '+L2("Jadual vaksin KKM","KKM vaccine schedule")+'</h3><div class="mut small">'+L2("Tambah profil anak dahulu (halaman Anak). Tarikh setiap vaksin dikira daripada tarikh lahir.","Add a child's profile first (Children page). Each vaccine date is worked out from the date of birth.")+'</div><button class="btn gold g3d" id="bvAdd" style="margin-top:8px">＋ '+L2("Anak","Child")+'</button></div>'+vNote(); bind(el,"#bvAdd",function(){ kidEdit(null); }); return; }
  var k=K(B.cur)||B.kids[0]; B.cur=k.id;
  var L=doses(k), done=L.filter(function(d){ return d.g; }).length, late=L.filter(function(d){ return st(d)==="late"; }).length, nx=nextDose(k);
  var h='<div class="card">'+(B.kids.length>1?kidChips(k.id,"data-vk"):'')+'<div class="row"><h3 style="margin:0">💉 '+E(k.n)+'</h3><span class="mut small">'+(k.b?ageStr(k.b):'')+'</span></div>'+
    (k.b?'':'<div class="fwarnc small">'+L2("Isi tarikh lahir untuk mengira tarikh vaksin.","Add the date of birth to work out the vaccine dates.")+'</div>')+
    '<div class="fsum bb3" style="margin-top:8px"><div><small>'+L2("Selesai","Done")+'</small><b>'+done+'/'+L.length+'</b></div><div><small>'+L2("Lewat","Overdue")+'</small><b class="'+(late?"fwarnc":"")+'">'+late+'</b></div><div><small>'+L2("Seterusnya","Next")+'</small><b class="bbsm">'+(nx?U.dstr(U.ymd(nx.due)):"–")+'</b></div></div>'+
    '<div class="bbbar"><i style="width:'+(L.length?Math.round(done/L.length*100):0)+'%"></i></div>'+
    '<div class="row bbrem"><label class="trt"><span>🔔 '+L2("Peringatan","Reminders")+'</span><span class="switch sm"><input type="checkbox" id="bvRem" '+(B.rem?"checked":"")+'><span></span></span></label>'+
    '<select id="bvPre">'+[0,1,3,7,14].map(function(n){ return '<option value="'+n+'"'+(+B.pre===n?" selected":"")+'>'+(n?n+L2(" hari sebelum"," days before"):L2("hari itu sahaja","on the day only"))+'</option>'; }).join("")+'</select></div></div>';
  var grp={}, ord=[];
  L.forEach(function(d){ var g=d.custom?"x":String(d.mo); if(!grp[g]){ grp[g]=[]; ord.push(g); } grp[g].push(d); });
  ord.forEach(function(g){ var ds=grp[g], d0=ds[0], due=d0.due&&!d0.own?U.dstr(U.ymd(d0.due)):"";
    h+='<div class="card flist bbvg"><div class="bbvh"><b>'+(g==="x"?"➕ "+L2("Vaksin tambahan","Extra vaccines"):"🗓 "+ageLab(d0.mo))+'</b><small>'+due+'</small></div>'+ds.map(function(d){ var s=st(d);
      return '<button class="frow bbv '+s+'" data-vd="'+E(d.k)+'"><span class="bbst">'+({done:"✓",late:"!",soon:"⏳",later:"○",nodate:"○"})[s]+'</span><span class="fmain"><b style="white-space:normal">'+E(d.n)+'</b><small style="white-space:normal">'+E(d.p)+'</small>'+
        '<small class="bbvs">'+(d.g?L2("Diberi ","Given ")+U.dstr(d.g)+(d.w?" · "+E(d.w):""):d.due?(s==="late"?L2("Lewat · sepatutnya ","Overdue · due ")+U.dstr(U.ymd(d.due)):L2("Tarikh: ","Due: ")+U.dstr(U.ymd(d.due))+' · '+L2("lagi ","in ")+U.days(U.today(),d.due)+L2(" hari"," days"))+(d.own?" ✎":""):L2("Tiada tarikh","No date"))+'</small></span><span class="chev">›</span></button>'; }).join("")+'</div>'; });
  if(late>1) h+='<div class="card small">'+L2("Anak ini sudah besar? Jika vaksin yang lalu sudah diberi, tandakan semuanya sekali gus (tarikh ikut jadual).","Is this child older? If the past vaccines were given, mark them all at once (dates follow the schedule).")+'<button class="btn alt full g3d" id="bvAll" style="margin-top:6px">✓ '+L2("Tandakan "+late+" vaksin lepas sebagai selesai","Mark "+late+" past vaccines as done")+'</button></div>';
  h+='<div class="btns"><button class="btn alt g3d" id="bvX">＋ '+L2("Vaksin tambahan (klinik swasta)","Extra vaccine (private clinic)")+'</button><button class="btn alt g3d" id="bvSh">📤 '+L2("Kongsi rekod","Share record")+'</button></div>'+vNote();
  el.innerHTML=h;
  el.querySelectorAll("[data-vk]").forEach(function(b){ b.onclick=function(){ B.cur=b.getAttribute("data-vk"); H.save("ihsan_baby",B); draw(); }; });
  el.querySelector("#bvRem").onchange=function(){ B.rem=this.checked; sv(); };
  el.querySelector("#bvPre").onchange=function(){ B.pre=+this.value; sv(); };
  el.querySelectorAll("[data-vd]").forEach(function(b){ b.onclick=function(){ doseEdit(k, b.getAttribute("data-vd")); }; });
  bind(el,"#bvX",function(){ extraAdd(k); });
  bind(el,"#bvAll",function(){ k.vx=k.vx||{}; doses(k).forEach(function(d){ if(st(d)!=="late") return; if(d.custom){ (k.cv||[]).forEach(function(c){ if(c.k===d.k) c.g=U.ymd(d.due); }); } else { var r=k.vx[d.k]||{}; r.g=U.ymd(d.due); k.vx[d.k]=r; } }); sv(); draw(); H.toast(L2("Ditanda selesai. Betulkan tarikh sebenar dari buku rekod jika perlu.","Marked as done. Correct the real dates from the record book if needed.")); });
  bind(el,"#bvSh",function(){ var t="💉 "+k.n+(k.b?" ("+U.dstr(k.b)+")":"")+"\n"+doses(k).map(function(d){ return (d.g?"✓ ":"○ ")+d.n+" · "+(d.g?U.dstr(d.g):d.due?U.dstr(U.ymd(d.due)):"–"); }).join("\n"); if(H.N.shareText) H.N.shareText(t); else { try{ navigator.clipboard.writeText(t); }catch(e){} H.toast(L2("Disalin","Copied")); } }); }
function vNote(){ return '<div class="card mut tiny">'+L2("Mengikut Jadual Imunisasi Kebangsaan KKM (Program Imunisasi Kebangsaan, percuma di klinik kesihatan kerajaan). Jadual boleh berubah: sentiasa semak dengan Buku Rekod Kesihatan Bayi & Kanak-kanak anak anda dan jururawat klinik. Tekan mana-mana vaksin untuk menukar tarikh.","Follows the KKM National Immunisation Schedule (free at government health clinics). The schedule can change: always check it against your child's Buku Rekod Kesihatan Bayi & Kanak-kanak and the clinic nurse. Tap any vaccine to change its date.")+'</div>'; }
function doseEdit(k, key){
  var d=doses(k).filter(function(x){ return x.k===key; })[0]; if(!d) return;
  var ov=H.showSheet("💉 "+E(d.n), '<div class="mut small">'+E(d.p)+(d.kkm?' · '+ageLab(d.mo):'')+'</div>'+
    '<div class="f2">'+H.fld("bdG",L2("Tarikh diberi","Date given"),d.g,"date")+H.fld("bdD",L2("Tarikh dijadualkan","Due date"),d.due?U.ymd(d.due):"","date")+'</div>'+
    '<div class="btns" style="margin:4px 0"><button class="chip g3d" id="bdT">📅 '+L2("Hari ini","Today")+'</button>'+(d.own?'<button class="chip g3d" id="bdR">↺ '+L2("Tarikh asal KKM","Back to the KKM date")+'</button>':'')+'</div>'+
    H.fld("bdW",L2("Tempat (klinik / hospital)","Where (clinic / hospital)"),d.w)+H.fld("bdN",L2("Nota (no. kelompok, reaksi)","Note (batch no., reaction)"),d.note)+
    '<button class="btn gold full g3d" id="bdOk" style="margin-top:6px">✓ '+L2("Simpan","Save")+'</button>'+(d.custom?'<button class="btn alt full g3d" id="bdX" style="margin-top:6px">🗑 '+L2("Padam","Delete")+'</button>':''));
  ov.querySelector("#bdT").onclick=function(){ ov.querySelector("#bdG").value=U.ymd(new Date()); };
  bind(ov,"#bdR",function(){ var r=(k.vx||{})[key]; if(r) delete r.due; sv(); H.closeOverlay(); draw(); });
  ov.querySelector("#bdOk").onclick=function(){ var v=function(s){ return ov.querySelector(s).value.trim(); };
    if(d.custom){ var c=(k.cv||[]).filter(function(x){ return x.k===key; })[0]; c.g=v("#bdG"); c.due=v("#bdD"); c.w=v("#bdW"); c.note=v("#bdN"); }
    else { k.vx=k.vx||{}; var r=k.vx[key]||{}; r.g=v("#bdG"); r.w=v("#bdW"); r.n=v("#bdN"); var auto=U.pd(k.b)?U.ymd(addM(U.pd(k.b), d.mo)):""; if(v("#bdD") && v("#bdD")!==auto) r.due=v("#bdD"); else delete r.due; k.vx[key]=r; }
    sv(); H.closeOverlay(); draw(); };
  bind(ov,"#bdX",function(){ k.cv=(k.cv||[]).filter(function(x){ return x.k!==key; }); sv(); H.closeOverlay(); draw(); }); }
function extraAdd(k){
  var ov=H.showSheet("＋ "+L2("Vaksin tambahan","Extra vaccine"), '<div class="chips wrap">'+XV.map(function(x,i){ return '<button class="chip g3d" data-xv="'+i+'">'+E(L2(x[0],x[1]))+'</button>'; }).join("")+'</div>'+
    H.fld("bxN",L2("Nama vaksin","Vaccine name"),"")+'<div class="f2">'+H.fld("bxD",L2("Tarikh dijadualkan","Due date"),"","date")+H.fld("bxG",L2("Tarikh diberi","Date given"),"","date")+'</div>'+
    '<button class="btn gold full g3d" id="bxOk" style="margin-top:6px">✓ '+L2("Tambah","Add")+'</button><div class="mut tiny" style="margin-top:6px">'+L2("Vaksin pilihan di klinik swasta (berbayar). Bincang dengan doktor anda.","Optional vaccines at private clinics (paid). Discuss with your doctor.")+'</div>');
  ov.querySelectorAll("[data-xv]").forEach(function(b){ b.onclick=function(){ var x=XV[+b.getAttribute("data-xv")]; ov.querySelector("#bxN").value=L2(x[0],x[1]); var bd=U.pd(k.b); if(bd){ var dd=addM(bd,x[2]); if(dd<U.today()) dd=U.today(); ov.querySelector("#bxD").value=U.ymd(dd); } }; });
  ov.querySelector("#bxOk").onclick=function(){ var n=ov.querySelector("#bxN").value.trim(); if(!n){ H.toast(L2("Isi nama vaksin","Fill in the vaccine name")); return; }
    k.cv=k.cv||[]; k.cv.push({k:"c"+U.uid(), n:n, due:ov.querySelector("#bxD").value, g:ov.querySelector("#bxG").value}); sv(); H.closeOverlay(); draw(); }; }

// ---------- page: memories (albums) ----------
function inKid(p){ return !kidF || p.kid===kidF; }
function albPhotos(a){ if(a==="all") return B.ph.filter(inKid); if(a==="none") return B.ph.filter(function(p){ return !p.al && !p.yr && inKid(p); });
  if(a && a.indexOf("y:")===0){ var kid=a.slice(2); return B.ph.filter(function(p){ return p.kid===kid && p.yr; }); }
  return B.ph.filter(function(p){ return p.al===a; }); }
function albName(a){ if(a==="all") return L2("Semua gambar","All photos"); if(a==="none") return L2("Tanpa album","No album"); if(a && a.indexOf("y:")===0){ var k=K(a.slice(2)); return "📅 "+L2("Foto tahunan ","Yearly photos: ")+(k?k.n:""); } var x=A(a); return x?x.n:""; }
function pMem(el){
  if(alb){ pAlbum(el); return; }
  var tile=function(id, name, n, cov, sub){ return '<button class="bbalb" data-al="'+E(id)+'">'+(cov?img(cov):'<span class="bbalbE">📷</span>')+'<span class="bbalbT"><b>'+E(name)+'</b><small>'+n+L2(" gambar"," photos")+(sub?" · "+E(sub):"")+'</small></span></button>'; };
  var latest=function(L){ return L.slice().sort(function(a,b){ return phDate(b)-phDate(a); })[0]; };
  var h='<div class="card">'+(B.kids.length?kidChips(kidF,"data-mk",true):'')+'<div class="row"><h3 style="margin:0">📷 '+L2("Kenangan","Memories")+'</h3><span class="mut small">'+B.ph.filter(inKid).length+L2(" gambar"," photos")+'</span></div>'+
    '<div class="btns" style="margin-top:8px"><button class="btn gold g3d" id="bmAdd">＋ '+L2("Gambar","Photos")+'</button><button class="btn alt g3d" id="bmAl">＋ '+L2("Album","Album")+'</button></div></div>';
  var tiles=[], all=albPhotos("all");
  if(all.length){ var la=latest(all); tiles.push(tile("all", albName("all"), all.length, la&&la.id)); }
  B.kids.filter(function(k){ return !kidF || k.id===kidF; }).forEach(function(k){ var L=albPhotos("y:"+k.id); if(!L.length && !k.b) return; var c=L.slice().sort(function(a,b){ return b.yr-a.yr; })[0]; tiles.push(tile("y:"+k.id, L2("Foto tahunan","Yearly photos"), L.length, c&&c.id, k.n)); });
  B.al.filter(function(a){ return !kidF || !a.kid || a.kid===kidF; }).sort(function(a,b){ return (b.t||0)-(a.t||0); }).forEach(function(a){ var L=albPhotos(a.id), c=a.cov&&PH(a.cov)?a.cov:(latest(L)||{}).id; var kk=a.kid?K(a.kid):null; tiles.push(tile(a.id, a.n, L.length, c, kk?kk.n:"")); });
  var no=albPhotos("none"); if(no.length && B.al.length){ var ln=latest(no); tiles.push(tile("none", albName("none"), no.length, ln&&ln.id)); }
  h+=tiles.length?'<div class="bbalbs">'+tiles.join("")+'</div>':'<div class="card mut small">'+L2("Belum ada gambar. Tekan ＋ Gambar, atau buka halaman Anak dan tekan ＋ pada tahun untuk foto tahunan.","No photos yet. Tap ＋ Photos, or open the Children page and tap ＋ on a year for the yearly photo.")+'</div>';
  h+='<div class="card mut tiny">'+L2("Gambar disimpan dalam storan aplikasi di telefon ini sahaja. Sandaran JSON tidak menyertakan gambar: gunakan Kongsi atau Simpan ke galeri untuk menyimpan salinan.","Photos are kept in this app's storage on this phone only. The JSON backup does not include photos: use Share or Save to gallery to keep a copy.")+'</div>';
  el.innerHTML=h;
  el.querySelectorAll("[data-mk]").forEach(function(b){ b.onclick=function(){ kidF=b.getAttribute("data-mk"); draw(); }; });
  el.querySelectorAll("[data-al]").forEach(function(b){ b.onclick=function(){ alb=b.getAttribute("data-al"); draw(); document.getElementById("view").scrollTop=0; }; });
  el.querySelector("#bmAdd").onclick=function(){ addTo(null); };
  el.querySelector("#bmAl").onclick=function(){ albEdit(null); }; }
function addTo(a){ var real=a && a!=="all" && a!=="none" && a.indexOf("y:")!==0 ? a : null, al=real?A(real):null;
  pickSrc("al:"+(real||""), function(list){ ld(); list.forEach(function(x){ newPh(x, {al:real, kid:(al&&al.kid)||kidF||null}); }); sv(); draw(); H.toast(list.length+L2(" gambar disimpan"," photos saved")); }); }
function albEdit(id){
  var a=id?A(id):{n:"", kid:kidF||""};
  var ov=H.showSheet((id?"✎ ":"＋ ")+L2("Album","Album"), H.fld("baN",L2("Nama album","Album name"),a.n,"text",' placeholder="'+L2("cth. Raya 2026, Hari pertama sekolah","e.g. Raya 2026, First day at school")+'"')+
    '<label class="fl">'+L2("Anak","Child")+'<select id="baK"><option value="">'+L2("Semua / keluarga","Everyone / family")+'</option>'+B.kids.map(function(k){ return '<option value="'+k.id+'"'+(a.kid===k.id?" selected":"")+'>'+E(k.n)+'</option>'; }).join("")+'</select></label>'+
    '<button class="btn gold full g3d" id="baOk" style="margin-top:6px">✓ '+L2("Simpan","Save")+'</button>'+(id?'<button class="btn alt full g3d" id="baX" style="margin-top:6px">🗑 '+L2("Padam album (gambar kekal)","Delete album (photos stay)")+'</button>':''));
  ov.querySelector("#baOk").onclick=function(){ var n=ov.querySelector("#baN").value.trim(); if(!n){ H.toast(L2("Isi nama album","Fill in an album name")); return; } a.n=n; a.kid=ov.querySelector("#baK").value||null;
    if(!id){ a.id="a"+U.uid(); a.t=Date.now(); B.al.push(a); alb=a.id; } sv(); H.closeOverlay(); draw(); };
  bind(ov,"#baX",function(){ B.al=B.al.filter(function(x){ return x.id!==id; }); B.ph.forEach(function(p){ if(p.al===id) p.al=null; }); alb=null; sv(); H.closeOverlay(); draw(); }); }
function pAlbum(el){
  var L=albPhotos(alb).slice(), yr=alb.indexOf("y:")===0, real=A(alb);
  if(yr) L.sort(function(a,b){ return b.yr-a.yr; }); else L.sort(function(a,b){ return phDate(b)-phDate(a); });
  var h='<div class="card"><div class="row"><button class="chip g3d" id="bmBk">‹ '+L2("Kenangan","Memories")+'</button>'+(real?'<button class="chip g3d" id="bmEd">✎</button>':'')+'</div><h3 style="margin:8px 0 2px">'+E(albName(alb))+'</h3><div class="mut small">'+L.length+L2(" gambar"," photos")+'</div>'+
    (yr?'':'<div class="btns" style="margin-top:8px"><button class="btn gold g3d" id="bmAdd2">＋ '+L2("Gambar","Photos")+'</button>'+(L.length?'<button class="btn alt g3d" id="bmShA">📤 '+L2("Kongsi album","Share album")+'</button>':'')+'</div>')+'</div>';
  if(yr){ var k=K(alb.slice(2)); h+=k?'<div class="card">'+yrStrip(k)+'</div>':''; }
  else { var lastM=""; h+='<div class="bbgrid">'; L.forEach(function(p){ var d=new Date(phDate(p)), m=d.getFullYear()+"-"+d.getMonth();
      if(m!==lastM){ lastM=m; h+='<div class="bbmon">'+d.toLocaleDateString(ibLoc(H.en()),{month:"long",year:"numeric"})+'</div>'; }
      h+='<button class="bbph" data-ph="'+p.id+'">'+img(p.id)+'</button>'; }); h+='</div>'; }
  el.innerHTML=h;
  el.querySelector("#bmBk").onclick=function(){ alb=null; draw(); };
  bind(el,"#bmEd",function(){ albEdit(alb); });
  bind(el,"#bmAdd2",function(){ addTo(alb); });
  bind(el,"#bmShA",function(){ if(H.N.photoShare) H.N.photoShare(JSON.stringify(L.slice(0,30).map(function(p){ return p.id; })), albName(alb)); else H.toast(L2("Kongsi tersedia dalam aplikasi telefon","Sharing works in the phone app")); });
  if(yr) bindYrs(el);
  el.querySelectorAll(".bbph[data-ph]").forEach(function(b){ b.onclick=function(){ viewer(L.map(function(p){ return p.id; }), b.getAttribute("data-ph")); }; }); }

// full-screen viewer: swipe to the next photo, caption, date, child, album, share, save, cover, delete
function viewer(ids, id){
  var i=Math.max(0, ids.indexOf(id)), ov=document.getElementById("overlay");
  var slide=function(j){ var p=PH(ids[j]); return '<div class="bbvwI"><img src="'+E(src(ids[j],true))+'" alt=""></div><div class="bbvwC">'+(p&&p.cap?E(p.cap):'')+'</div>'; };
  var paint=function(){ var p=PH(ids[i]); if(!p){ close(); return; } var k=p.kid?K(p.kid):null, a=p.al?A(p.al):null;
    ov.className="bbvw"; ov.innerHTML='<div class="bbvwT"><button class="chip" id="vwX">✕</button><span class="small">'+(i+1)+' / '+ids.length+'</span><button class="chip" id="vwM">⋯</button></div>'+
      '<div class="bbvwS" id="vwS">'+slide(i)+'</div>'+
      '<div class="bbvwB small"><span>'+(phDate(p)?new Date(phDate(p)).toLocaleDateString(ibLoc(H.en()),{day:"numeric",month:"short",year:"numeric"}):'')+(p.yr?' · 📅 '+p.yr:'')+(k?' · '+E(k.n):'')+(a?' · '+E(a.n):'')+'</span></div>';
    ov.querySelector("#vwX").onclick=close; ov._close=close;
    ov.querySelector("#vwM").onclick=function(){ menu(p); };
    var s=ov.querySelector("#vwS");
    if(window.IbSwipe) window.IbSwipe(s, {can:function(d){ var j=i-d; return j>=0 && j<ids.length; }, go:function(d){ i-=d; paint(); }, find:function(){ return document.getElementById("vwS"); }, peek:function(d){ var j=i-d; return slide(j); }}); };
  var close=function(){ H.closeOverlay(); ov.className="hidden"; draw(); };
  var menu=function(p){ var al=B.al;
    var m=H.showSheet("🖼 "+L2("Gambar","Photo"), H.fld("vmC",L2("Kapsyen","Caption"),p.cap||"")+'<div class="f2">'+H.fld("vmD",L2("Tarikh","Date"),phDate(p)?U.ymd(new Date(phDate(p))):"","date")+H.fld("vmY",L2("Foto tahunan (tahun)","Yearly photo (year)"),p.yr||"","number",' inputmode="numeric"')+'</div>'+
      '<label class="fl">'+L2("Anak","Child")+'<select id="vmK"><option value="">–</option>'+B.kids.map(function(k){ return '<option value="'+k.id+'"'+(p.kid===k.id?" selected":"")+'>'+E(k.n)+'</option>'; }).join("")+'</select></label>'+
      '<label class="fl">'+L2("Album","Album")+'<select id="vmA"><option value="">–</option>'+al.map(function(a){ return '<option value="'+a.id+'"'+(p.al===a.id?" selected":"")+'>'+E(a.n)+'</option>'; }).join("")+'</select></label>'+
      '<button class="btn gold full g3d" id="vmOk">✓ '+L2("Simpan","Save")+'</button>'+
      '<div class="btns" style="margin-top:8px"><button class="btn alt g3d" id="vmSh">📤 '+L2("Kongsi","Share")+'</button><button class="btn alt g3d" id="vmSv">⬇ '+L2("Simpan ke galeri","Save to gallery")+'</button>'+(p.kid?'<button class="btn alt g3d" id="vmAv">🧒 '+L2("Gambar profil","Profile photo")+'</button>':'')+(p.al?'<button class="btn alt g3d" id="vmCv">🖼 '+L2("Kulit album","Album cover")+'</button>':'')+'<button class="btn alt g3d" id="vmX">🗑 '+L2("Padam","Delete")+'</button></div>', function(){ paint(); });
    var back=function(){ paint(); };
    m.querySelector("#vmOk").onclick=function(){ p.cap=m.querySelector("#vmC").value.trim(); var d=U.pd(m.querySelector("#vmD").value); if(d) p.t=d.getTime(); var y=+m.querySelector("#vmY").value; p.yr=y>1900&&y<3000?y:null; p.kid=m.querySelector("#vmK").value||null; p.al=m.querySelector("#vmA").value||null;
      if(p.yr) B.ph.forEach(function(q){ if(q!==p && q.kid===p.kid && q.yr===p.yr) q.yr=null; }); sv(); back(); };
    m.querySelector("#vmSh").onclick=function(){ if(H.N.photoShare) H.N.photoShare(JSON.stringify([p.id]), p.cap||""); else H.toast(L2("Kongsi tersedia dalam aplikasi telefon","Sharing works in the phone app")); };
    m.querySelector("#vmSv").onclick=function(){ var ok=H.N.photoExport?H.N.photoExport(p.id):false; H.toast(ok?L2("Disimpan ke Pictures/My Ihsan","Saved to Pictures/My Ihsan"):L2("Tidak dapat disimpan (perlu Android 10 ke atas)","Could not save (needs Android 10 or later)")); };
    bind(m,"#vmAv",function(){ var k=K(p.kid); if(k){ k.av=p.id; sv(); H.toast(L2("Gambar profil ditetapkan","Profile photo set")); } back(); });
    bind(m,"#vmCv",function(){ var a=A(p.al); if(a){ a.cov=p.id; sv(); H.toast(L2("Kulit album ditetapkan","Album cover set")); } back(); });
    m.querySelector("#vmX").onclick=function(){ if(!confirm(L2("Padam gambar ini dari aplikasi?","Delete this photo from the app?"))) return; delPhoto(p.id); sv(); ids.splice(i,1); if(!ids.length){ close(); return; } if(i>=ids.length) i=ids.length-1; back(); }; };
  paint(); }

// ---------- hub ----------
function bind(root, sel, fn){ var x=root.querySelector(sel); if(x) x.onclick=fn; }
function fn(k){ return {kids:pKids, vax:pVax, mem:pMem, names:function(el){ U.names(el); }}[k]||pKids; }
function go(k){ page=k; alb=k==="mem"?alb:null; draw(); document.getElementById("view").scrollTop=0; }
function tabs(){ return '<div class="bbtabs noswipe">'+PAGES.map(function(p){ return '<button class="chip g3d'+(page===p[0]?" on":"")+'" data-bp="'+p[0]+'">'+p[1]+' '+L2(p[2],p[3])+'</button>'; }).join("")+'</div>'; }
function view(el, h, dockHtml){
  H=h; L2=h.L2x; E=h.esc; U=FamView.util(); ld(); view_=el;
  el.innerHTML=tabs()+'<div id="bbBody"></div>'+dockHtml;
  var body=el.querySelector("#bbBody"); fn(page)(body);
  el.querySelectorAll("[data-bp]").forEach(function(b){ b.onclick=function(){ go(b.getAttribute("data-bp")); }; });
  try{ H.dockFix(); }catch(e){}
  // swipe sideways between the four pages; the neighbour rides in beside the finger
  if(window.IbSwipe && window.ibWrap && !alb){
    var ks=PAGES.map(function(x){ return x[0]; }), nb=function(s){ return ks[ks.indexOf(page)+(s<0?1:-1)]; };
    var pg=window.ibWrap(body);
    window.IbSwipe(pg, {can:function(s){ return !!nb(s); }, go:function(s){ page=nb(s); draw(); },
      find:function(){ return document.querySelector("#bbBody .ibpg"); },
      peek:function(s){ var k=nb(s), p0=page, b=window.IbSwipe.shot(function(){ page=k; }, function(x){ fn(k)(x); }, function(){ page=p0; });
        if(!b) return null; var w=document.createElement("div"); w.className="ibpg"; while(b.firstChild) w.appendChild(b.firstChild); return w; }});
  }
}
window.BabyView={view:view, navGet:function(){ return {pg:page, al:alb, kf:kidF, k:page+(alb||"")}; }, navSet:function(o){ page=o.pg||"kids"; alb=o.al||null; if(o.kf!=null) kidF=o.kf; }};
})();
