/* My Ihsan 0.5.48: Jaga / Care (Alat › Keluarga › Jaga), next to Bayi. Looking after someone sick or elderly, all on the phone.
   Six pages that swipe sideways: Orang (care profiles + emergency card), Ubat (medicine schedule, "given" log, stock), Tanda vital
   (vital signs with your own normal ranges and a chart), Temujanji (appointments with a checklist and questions for the doctor),
   Giliran (siblings' turns, daily tasks, a summary to share, split costs), Ibadah (prayer, purification and fasting for the sick,
   doa, visiting, and an end-of-life page that only opens when chosen). Plus an elder mode (big buttons, can open with the app) and SOS.
   Storage: ihsan_care {ppl:[person], meds:[med], log:[given], vit:[reading], apt:[appt], td:{pid:{date:{task:by}}}, rem, elder, eP, me}
     person {id, n, pid (family tree), b, g, rel, cond, alg, blood, doc, clinic, dtel, em:[{n,t}], note, rg:{type:[lo,hi]}, turn:{names:[], start, every}, tasks:[{id,t}]}
     med {id, pid, n, dose, times:["08:00"], food:"any|before|after|with", start, days (0 = ongoing), stock, per, note, rem, off}
     given {mid, d:"YYYY-MM-DD", tm:"08:00", at (ms), by}     reading {id, pid, at (ms), k, v, v2 (diastolic), note}
     appt {id, pid, t:"YYYY-MM-DDTHH:MM", kind, where, ck:[{t, ok}], q, note, done}
   Reminders: app.js pushSchedule reads ihsan_care directly (medicine doses, appointments, low stock), so they roll forward every day.
   Religious text on the Ibadah page is marked for ustaz review, like the other Sunnah cards. Health data never leaves the phone. */
(function(){
"use strict";
var H, L2, E, U, C, page="ppl", pf="", vk="bp", host=null;
// 0.5.51: the Google Play build (window.IHSAN_PLAY) keeps only the non-medical parts of Care: people and family contacts, caregiving turns
// and tasks, ibadah for the sick and elder mode. Medicines, vital signs, appointments, the emergency card and health fields stay in test APKs.
var PLAY=!!window.IHSAN_PLAY;
var PAGES=[["ppl","🧓","Orang","People"],["med","💊","Ubat","Medicines"],["vit","❤️","Tanda vital","Vitals"],["apt","📅","Temujanji","Appointments"],["share","🤝","Giliran","Sharing"],["ib","🤲","Ibadah","Ibadah"]].filter(function(p){ return !PLAY || ["med","vit","apt"].indexOf(p[0])<0; });
// vital sign types: key, icon, Malay, English, unit, default normal range [lo, hi], step
var VT=[["bp","🩸","Tekanan darah","Blood pressure","mmHg",[90,140],1],["glu","🍬","Gula darah","Blood glucose","mmol/L",[4,10],0.1],["temp","🌡️","Suhu","Temperature","°C",[36,37.5],0.1],
  ["spo2","🫁","Oksigen (SpO₂)","Oxygen (SpO₂)","%",[94,100],1],["pulse","💓","Nadi","Pulse","/min",[50,100],1],["wt","⚖️","Berat","Weight","kg",[0,0],0.1],["pain","🤕","Skala sakit","Pain score","/10",[0,4],1]];
var BPD=[60,90]; // diastolic normal range
var FOOD=[["any","Bila-bila","Any time"],["before","Sebelum makan","Before food"],["after","Selepas makan","After food"],["with","Bersama makanan","With food"]];
var KINDS=[["clinic","🏥","Klinik / hospital","Clinic / hospital"],["dialysis","🩺","Dialisis","Dialysis"],["physio","🦵","Fisioterapi","Physiotherapy"],["lab","🧪","Ujian darah / makmal","Blood test / lab"],["other","📌","Lain-lain","Other"]];
var CK0={clinic:[["Kad pengenalan (MyKad)","MyKad (IC)"],["Kad temujanji","Appointment card"],["Senarai ubat semasa","Current medicine list"],["Bacaan tanda vital terkini","Latest vital readings"]],
  dialysis:[["Kad pengenalan (MyKad)","MyKad (IC)"],["Buku rekod dialisis","Dialysis record book"],["Pakaian selesa & selimut","Comfortable clothes & blanket"],["Snek yang dibenarkan","Allowed snack"]],
  physio:[["Pakaian sukan / longgar","Loose clothes"],["Kasut bertutup","Closed shoes"],["Senarai senaman di rumah","Home exercise list"]],
  lab:[["Puasa mengikut arahan (biasanya 8–10 jam)","Fast as told (usually 8–10 hours)"],["Kad pengenalan (MyKad)","MyKad (IC)"],["Borang ujian","Test form"]],
  other:[["Kad pengenalan (MyKad)","MyKad (IC)"]]};

// ---------- data ----------
function ld(){ C=H.load("ihsan_care",null)||{}; ["ppl","meds","log","vit","apt"].forEach(function(k){ if(!Array.isArray(C[k])) C[k]=[]; }); if(!C.td) C.td={}; if(C.rem==null) C.rem=true; return C; }
function sv(){ if(C.log.length>4000) C.log=C.log.slice(-4000); if(C.vit.length>3000) C.vit=C.vit.slice(-3000); H.save("ihsan_care",C); try{ H.resched(); }catch(e){} }
function P(id){ for(var i=0;i<C.ppl.length;i++) if(C.ppl[i].id===id) return C.ppl[i]; return null; }
function M(id){ for(var i=0;i<C.meds.length;i++) if(C.meds[i].id===id) return C.meds[i]; return null; }
function draw(){ if(window.FamView && host && document.body.contains(host)) FamView.draw(); else if(host && host._care) host._care(); }
function pad(n){ return (n<10?"0":"")+n; }
function hm(d){ return pad(d.getHours())+":"+pad(d.getMinutes()); }
function now(){ return new Date(); }
function today(){ return U.ymd(U.today()); }
function nm(p){ return p?p.n:"?"; }
function inP(x){ return !pf || x.pid===pf; }
function T12(t){ var p=(t||"").split(":"), h=+p[0], m=p[1]||"00"; if(isNaN(h)) return t||""; return (h%12||12)+":"+m+(h<12?" am":" pm"); }
function vt(k){ for(var i=0;i<VT.length;i++) if(VT[i][0]===k) return VT[i]; return VT[0]; }
function rg(p, k){ var r=(p && p.rg && p.rg[k]) || vt(k)[5]; return r; }
function flag(p, r){ var t=vt(r.k), g=rg(p, r.k); if(r.k==="wt" || !(g[1]>g[0])) return 0; var hi=r.v>g[1], lo=r.v<g[0];
  if(r.k==="bp" && r.v2!=null){ var d=(p && p.rg && p.rg.bpd) || BPD; hi=hi||r.v2>d[1]; lo=lo||r.v2<d[0]; } return hi?1:lo?-1:0; }
function vstr(r){ return r.k==="bp" && r.v2!=null ? r.v+"/"+r.v2 : String(r.v); }
function fld(id, label, val, type, extra){ return '<label class="fl">'+label+'<input id="'+id+'" type="'+(type||"text")+'" value="'+E(val==null?"":val)+'"'+(extra||"")+'></label>'; }
function area(id, label, val, ph){ return '<label class="fl">'+label+'<textarea id="'+id+'" rows="2" placeholder="'+E(ph||"")+'">'+E(val||"")+'</textarea></label>'; }
function q(root, s){ return root.querySelector(s); }
function val(root, s){ var x=q(root,s); return x?x.value.trim():""; }
function bind(root, sel, fn){ var x=root.querySelector(sel); if(x) x.onclick=fn; }
function nav(v){ try{ H.closeOverlay(); }catch(e){} try{ window.onNative("openView",{v:"side:"+v}); }catch(e){} }
function share(t){ if(window.Native && H.N.shareText) H.N.shareText(t); else if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ H.toast(L2("Disalin","Copied")); }); }
function call(t){ if(!t) return; try{ H.N.openUrl(U.telUrl(t)); }catch(e){} }
function pchips(all){ if(C.ppl.length<2 && !all) return ''; return '<div class="chips fseg">'+(all?'<button class="chip g3d'+(!pf?" on":"")+'" data-pf="">'+L2("Semua","All")+'</button>':'')+C.ppl.map(function(p){ return '<button class="chip g3d'+(pf===p.id?" on":"")+'" data-pf="'+p.id+'">'+E(p.n)+'</button>'; }).join("")+'</div>'; }
function bindPf(el){ el.querySelectorAll("[data-pf]").forEach(function(b){ b.onclick=function(){ pf=b.getAttribute("data-pf"); draw(); }; }); }
function disc(){ if(PLAY) return ""; return '<div class="card mut tiny">⚕️ '+L2("Untuk catatan keluarga sahaja, bukan nasihat perubatan. Ikut arahan doktor atau ahli farmasi untuk dos dan julat normal. Kecemasan: hubungi 999.","For family records only, not medical advice. Follow your doctor or pharmacist on doses and normal ranges. Emergency: call 999.")+'</div>'; }
function needPerson(el){ el.innerHTML='<div class="card"><h3>🩺 '+L2("Tambah orang yang dijaga dahulu","Add the person you care for first")+'</h3><button class="btn gold g3d full" id="cnP">＋ '+L2("Tambah orang","Add a person")+'</button></div>'; bind(el,"#cnP",function(){ page="ppl"; personEdit(null); }); }

// ---------- medicine doses ----------
function medActive(m, ds){ if(m.off) return false; if(m.start && ds<m.start) return false; if(m.days && m.start){ var d0=U.pd(m.start), d=U.pd(ds); if(d0 && d && (d-d0)/864e5>=m.days) return false; } return true; }
function given(mid, ds, tm){ for(var i=C.log.length-1;i>=0;i--){ var g=C.log[i]; if(g.mid===mid && g.d===ds && g.tm===tm) return g; } return null; }
function dosesOn(ds, pid){ var L=[]; C.meds.forEach(function(m){ if((pid && m.pid!==pid) || !medActive(m, ds)) return; (m.times||[]).forEach(function(tm){ L.push({m:m, tm:tm, g:given(m.id, ds, tm)}); }); });
  L.sort(function(a,b){ return a.tm<b.tm?-1:a.tm>b.tm?1:0; }); return L; }
function doseState(x, ds){ if(x.g) return "done"; if(ds<today()) return "miss"; if(ds>today()) return "later"; var n=hm(now()); var t=x.tm.split(":"), mins=(+t[0])*60+(+t[1]), nn=now().getHours()*60+now().getMinutes();
  return nn>mins+60?"miss":nn>=mins-30?"due":"later"; }
function stockDays(m){ if(m.stock==null || m.stock==="" || !(m.times||[]).length) return null; var per=(+m.per||1)*(m.times.length); return per?Math.floor(+m.stock/per):null; }
function give(m, ds, tm, by){ if(given(m.id, ds, tm)) return; C.log.push({mid:m.id, d:ds, tm:tm, at:Date.now(), by:by||C.me||""}); if(m.stock!=null && m.stock!=="") m.stock=Math.max(0, +m.stock-(+m.per||1)); sv(); }
function ungive(m, ds, tm){ var g=given(m.id, ds, tm); if(!g) return; C.log.splice(C.log.indexOf(g),1); if(m.stock!=null && m.stock!=="") m.stock=+m.stock+(+m.per||1); sv(); }
function foodTxt(f){ for(var i=0;i<FOOD.length;i++) if(FOOD[i][0]===f) return L2(FOOD[i][1],FOOD[i][2]); return ""; }
function doseRow(x, ds, big){ var s=doseState(x, ds), p=P(x.m.pid), ic={done:"✅",miss:"⚠️",due:"🔔",later:"🕒"}[s];
  return '<div class="crDose crS-'+s+(big?" big":"")+'"><span class="crT">'+T12(x.tm)+'</span><span class="crN"><b>'+E(x.m.n)+'</b>'+(x.m.dose?' · '+E(x.m.dose):'')+'<small>'+(C.ppl.length>1||big?E(nm(p))+' · ':'')+E(foodTxt(x.m.food))+(x.g?' · '+L2("diberi ","given ")+hm(new Date(x.g.at))+(x.g.by?' ('+E(x.g.by)+')':''):'')+'</small></span>'+
    '<button class="crG'+(x.g?" on":"")+'" data-gv="'+x.m.id+'|'+x.tm+'" aria-label="'+L2("Tanda sudah diberi","Mark as given")+'">'+(x.g?'✓':ic)+'</button></div>'; }
function bindGive(el, ds){ el.querySelectorAll("[data-gv]").forEach(function(b){ b.onclick=function(){ var a=b.getAttribute("data-gv").split("|"), m=M(a[0]); if(!m) return;
  if(given(m.id, ds, a[1])) ungive(m, ds, a[1]); else { give(m, ds, a[1]); try{ if(H.N.vibrate) H.N.vibrate(20); }catch(e){} } if(el._redraw) el._redraw(); else draw(); }; }); }

// ---------- page 1: people ----------
function pPpl(el){ var h='';
  if(!C.ppl.length) h+='<div class="card"><h3>🩺 '+L2("Jaga orang tersayang","Care for someone you love")+'</h3><p class="small">'+(PLAY?L2("Untuk ibu bapa, datuk nenek atau sesiapa yang sakit: giliran adik-beradik, tugasan harian, ibadah orang sakit dan mod warga emas. Semua kekal dalam telefon ini.","For parents, grandparents or anyone who is unwell: siblings' turns, daily tasks, ibadah for the sick and elder mode. Everything stays on this phone."):L2("Untuk ibu bapa, datuk nenek atau sesiapa yang sakit: ubat, tanda vital, temujanji, giliran adik-beradik dan ibadah orang sakit. Semua kekal dalam telefon ini.","For parents, grandparents or anyone who is unwell: medicines, vital signs, appointments, siblings' turns and ibadah for the sick. Everything stays on this phone."))+'</p></div>';
  C.ppl.forEach(function(p){ var ds=today(), L=dosesOn(ds, p.id), done=L.filter(function(x){ return x.g; }).length, nx=C.apt.filter(function(a){ return a.pid===p.id && !a.done && a.t>=ds; }).sort(function(a,b){ return a.t<b.t?-1:1; })[0];
    var last=C.vit.filter(function(r){ return r.pid===p.id; }).slice(-1)[0], fl=last?flag(p,last):0, age=p.b?U.age({b:p.b}):null;
    h+='<div class="card crP"><div class="crPh"><span class="crAv">'+E((p.n||"?").charAt(0))+'</span><div><h3>'+E(p.n)+'</h3><div class="mut small">'+[p.rel, age!=null&&age!==""?age+L2(" tahun"," yrs"):"", p.blood&&!PLAY?"🩸 "+p.blood:""].filter(Boolean).map(E).join(" · ")+'</div></div></div>'+
      (PLAY?'':(p.cond?'<div class="small">🩺 '+E(p.cond)+'</div>':'')+(p.alg?'<div class="small crAlg">⚠️ '+L2("Alahan: ","Allergies: ")+E(p.alg)+'</div>':''))+
      (PLAY?'':'<div class="crStat"><span>💊 <b>'+done+'/'+L.length+'</b> '+L2("dos hari ini","doses today")+'</span>'+(last?'<span'+(fl?' class="crBad"':'')+'>'+vt(last.k)[1]+' <b>'+vstr(last)+'</b> '+vt(last.k)[4]+(fl?(fl>0?" ↑":" ↓"):"")+'</span>':'')+(nx?'<span>📅 '+U.dstr(nx.t.slice(0,10))+'</span>':'')+'</div>')+
      '<div class="btns"><button class="btn alt g3d" data-pe="'+p.id+'">✏️ '+L2("Profil","Profile")+'</button>'+(PLAY?'':'<button class="btn alt g3d" data-sos="'+p.id+'">🆘 '+L2("Kad kecemasan","Emergency card")+'</button>')+((p.em||[])[0]&&p.em[0].t?'<button class="btn alt g3d" data-cl="'+E(p.em[0].t)+'">📞 '+E(p.em[0].n||"")+'</button>':'')+'</div></div>'; });
  h+='<div class="btns"><button class="btn gold g3d" id="cAdd">＋ '+L2("Tambah orang","Add a person")+'</button>'+(famCand().length?'<button class="btn alt g3d" id="cImp">🌳 '+L2("Dari salasilah","From family tree")+'</button>':'')+'</div>';
  h+='<div class="card"><h3>👴 '+L2("Mod warga emas","Elder mode")+'</h3><div class="mut small">'+(PLAY?L2("Skrin ringkas dengan butang besar: waktu solat dan telefon keluarga. Tekan lama 2 saat untuk keluar.","A simple screen with big buttons: prayer times and calling family. Press and hold for 2 seconds to leave."):L2("Skrin ringkas dengan butang besar: waktu solat, ubat hari ini, telefon keluarga dan SOS. Tekan lama 2 saat untuk keluar.","A simple screen with big buttons: prayer times, today's medicines, call family and SOS. Press and hold for 2 seconds to leave."))+'</div>'+
    (C.ppl.length>1?'<label class="fl">'+L2("Untuk","For")+'<select id="cEp">'+C.ppl.map(function(p){ return '<option value="'+p.id+'"'+(C.eP===p.id?" selected":"")+'>'+E(p.n)+'</option>'; }).join("")+'</select></label>':'')+
    '<label class="crChk"><input type="checkbox" id="cEs"'+(C.elder?" checked":"")+'> '+L2("Buka My Ihsan terus dalam mod warga emas","Open My Ihsan straight into elder mode")+'</label>'+
    '<button class="btn gold g3d full" id="cElder"'+(C.ppl.length?'':' disabled')+'>👴 '+L2("Buka mod warga emas","Open elder mode")+'</button></div>';
  h+='<div class="card"><h3>🔔 '+L2("Peringatan","Reminders")+'</h3><label class="crChk"><input type="checkbox" id="cRem"'+(C.rem?" checked":"")+'> '+(PLAY?L2("Peringatan","Reminders"):L2("Peringatan ubat, temujanji dan stok rendah","Medicine, appointment and low-stock reminders"))+'</label>'+
    fld("cMe", PLAY?L2("Nama saya (untuk tugasan)","My name (for tasks)"):L2("Nama saya (untuk log siapa yang beri ubat)","My name (for the log of who gave medicine)"), C.me||"")+'</div>'+disc();
  el.innerHTML=h;
  el.querySelectorAll("[data-pe]").forEach(function(b){ b.onclick=function(){ personEdit(b.getAttribute("data-pe")); }; });
  el.querySelectorAll("[data-sos]").forEach(function(b){ b.onclick=function(){ sosCard(P(b.getAttribute("data-sos"))); }; });
  el.querySelectorAll("[data-cl]").forEach(function(b){ b.onclick=function(){ call(b.getAttribute("data-cl")); }; });
  bind(el,"#cAdd",function(){ personEdit(null); }); bind(el,"#cImp",impFam);
  bind(el,"#cElder",function(){ if(q(el,"#cEp")) C.eP=q(el,"#cEp").value; sv(); elder(); });
  var es=q(el,"#cEs"); if(es) es.onchange=function(){ C.elder=es.checked; if(q(el,"#cEp")) C.eP=q(el,"#cEp").value; sv(); H.toast(es.checked?L2("My Ihsan akan dibuka dalam mod warga emas","My Ihsan will open in elder mode"):L2("Dimatikan","Turned off")); };
  var ep=q(el,"#cEp"); if(ep) ep.onchange=function(){ C.eP=ep.value; sv(); };
  q(el,"#cRem").onchange=function(){ C.rem=this.checked; sv(); }; q(el,"#cMe").onchange=function(){ C.me=this.value.trim(); sv(); }; }
function famCand(){ try{ var F=U.fam(), have={}; C.ppl.forEach(function(p){ if(p.pid) have[p.pid]=1; }); return (F.p||[]).filter(function(x){ return !x.dead && !have[x.id] && x.id!==F.me; }); }catch(e){ return []; } }
function impFam(){ var L=famCand(); var ov=H.showSheet("🌳 "+L2("Pilih dari salasilah","Pick from the family tree"), '<div class="crList">'+L.map(function(x){ var a=x.b?U.age(x):""; return '<button class="chip g3d" data-fi="'+x.id+'">'+E(x.n)+(a!==""&&a!=null?" · "+a:"")+'</button>'; }).join("")+'</div>');
  ov.querySelectorAll("[data-fi]").forEach(function(b){ b.onclick=function(){ var x=null; (U.fam().p||[]).forEach(function(y){ if(y.id===b.getAttribute("data-fi")) x=y; });
    if(!x) return; var p={id:U.uid(), n:x.n, pid:x.id, b:x.b||"", g:x.g||"", em:[], rg:{}}; if(x.tel) p.em.push({n:x.n, t:x.tel}); C.ppl.push(p); sv(); H.closeOverlay(); personEdit(p.id); }; }); }
function personEdit(id){ var p=id?P(id):{id:U.uid(), n:"", em:[{n:"",t:""},{n:"",t:""}], rg:{}}; var isNew=!id; p.em=p.em||[]; while(p.em.length<3) p.em.push({n:"",t:""}); p.rg=p.rg||{};
  var rgH=VT.filter(function(t){ return t[0]!=="wt"; }).map(function(t){ var r=rg(p,t[0]); return '<div class="crRg"><span>'+t[1]+' '+L2(t[2],t[3])+(t[0]==="bp"?" ("+L2("sistolik","systolic")+")":"")+'</span><input type="number" step="'+t[6]+'" data-rl="'+t[0]+'" value="'+r[0]+'"><span>–</span><input type="number" step="'+t[6]+'" data-rh="'+t[0]+'" value="'+r[1]+'"><small>'+t[4]+'</small></div>'; }).join("")+
    '<div class="crRg"><span>🩸 '+L2("Tekanan darah (diastolik)","Blood pressure (diastolic)")+'</span><input type="number" data-rl="bpd" value="'+((p.rg.bpd||BPD)[0])+'"><span>–</span><input type="number" data-rh="bpd" value="'+((p.rg.bpd||BPD)[1])+'"><small>mmHg</small></div>';
  var ov=H.showSheet((isNew?"＋ ":"✏️ ")+L2("Profil penjagaan","Care profile"),
    fld("pN", L2("Nama","Name"), p.n)+fld("pR", L2("Hubungan (cth. Mak, Atuk)","Relationship (e.g. Mum, Grandpa)"), p.rel)+fld("pB", L2("Tarikh lahir","Date of birth"), p.b, "date")+
    (PLAY?'':fld("pBl", L2("Jenis darah","Blood type"), p.blood, "text", ' placeholder="O+"')+area("pC", L2("Penyakit / keadaan","Conditions"), p.cond, L2("cth. Darah tinggi, kencing manis, strok 2024","e.g. High blood pressure, diabetes, stroke 2024"))+
    area("pA", L2("Alahan","Allergies"), p.alg, L2("cth. Penisilin","e.g. Penicillin"))+fld("pD", L2("Doktor","Doctor"), p.doc)+fld("pK", L2("Klinik / hospital","Clinic / hospital"), p.clinic)+fld("pDt", L2("Telefon klinik","Clinic phone"), p.dtel, "tel"))+
    '<h3 style="margin-top:12px">📞 '+L2("Hubungan kecemasan","Emergency contacts")+'</h3>'+p.em.slice(0,3).map(function(c,i){ return '<div class="crEm">'+fld("pEn"+i, L2("Nama","Name"), c.n)+fld("pEt"+i, L2("Telefon","Phone"), c.t, "tel")+'</div>'; }).join("")+
    (PLAY?'':'<details class="crDet"><summary>📏 '+L2("Julat normal (ikut nasihat doktor)","Normal ranges (as your doctor advises)")+'</summary>'+rgH+'</details>')+
    area("pO", L2("Nota","Notes"), p.note)+'<div class="btns"><button class="btn gold g3d" id="pOk">💾 '+L2("Simpan","Save")+'</button>'+(isNew?'':'<button class="btn alt g3d" id="pDel">🗑 '+L2("Padam","Delete")+'</button>')+'</div>');
  q(ov,"#pOk").onclick=function(){ if(!val(ov,"#pN")){ H.toast(L2("Isi nama","Fill in a name")); return; }
    p.n=val(ov,"#pN"); p.rel=val(ov,"#pR"); p.b=val(ov,"#pB"); p.note=val(ov,"#pO");
    if(!PLAY){ p.blood=val(ov,"#pBl"); p.cond=val(ov,"#pC"); p.alg=val(ov,"#pA"); p.doc=val(ov,"#pD"); p.clinic=val(ov,"#pK"); p.dtel=val(ov,"#pDt"); }
    p.em=[0,1,2].map(function(i){ return {n:val(ov,"#pEn"+i), t:val(ov,"#pEt"+i)}; }).filter(function(c){ return c.n||c.t; });
    ov.querySelectorAll("[data-rl]").forEach(function(i){ var k=i.getAttribute("data-rl"), lo=parseFloat(i.value), hi=parseFloat(ov.querySelector('[data-rh="'+k+'"]').value); if(!isNaN(lo)&&!isNaN(hi)&&hi>lo) p.rg[k]=[lo,hi]; });
    if(isNew) C.ppl.push(p); sv(); H.closeOverlay(); draw(); };
  bind(ov,"#pDel",function(){ var b=this; if(!b._ok){ b._ok=1; b.textContent="⚠️ "+L2("Tekan sekali lagi untuk padam semua rekod","Tap again to delete all records"); return; }
    C.ppl=C.ppl.filter(function(x){ return x.id!==p.id; }); var mids={}; C.meds.forEach(function(m){ if(m.pid===p.id) mids[m.id]=1; }); C.meds=C.meds.filter(function(m){ return m.pid!==p.id; });
    C.log=C.log.filter(function(g){ return !mids[g.mid]; }); C.vit=C.vit.filter(function(r){ return r.pid!==p.id; }); C.apt=C.apt.filter(function(a){ return a.pid!==p.id; }); delete C.td[p.id]; if(pf===p.id) pf=""; sv(); H.closeOverlay(); draw(); }); }

// ---------- SOS / emergency card ----------
function sosText(p){ var meds=C.meds.filter(function(m){ return m.pid===p.id && medActive(m, today()); });
  return "🆘 "+L2("KAD KECEMASAN","EMERGENCY CARD")+"\n"+p.n+(p.b?" ("+L2("lahir ","born ")+U.dstr(p.b)+")":"")+(p.blood?"\n"+L2("Darah: ","Blood: ")+p.blood:"")+(p.alg?"\n⚠️ "+L2("Alahan: ","Allergies: ")+p.alg:"")+(p.cond?"\n"+L2("Keadaan: ","Conditions: ")+p.cond:"")+
    (meds.length?"\n"+L2("Ubat: ","Medicines: ")+meds.map(function(m){ return m.n+(m.dose?" "+m.dose:""); }).join(", "):"")+(p.doc||p.clinic?"\n"+L2("Doktor: ","Doctor: ")+[p.doc,p.clinic,p.dtel].filter(Boolean).join(", "):"")+
    ((p.em||[]).length?"\n"+L2("Hubungi: ","Contact: ")+p.em.map(function(c){ return c.n+" "+c.t; }).join(" · "):""); }
function sosCard(p){ if(!p) return; var meds=C.meds.filter(function(m){ return m.pid===p.id && medActive(m, today()); });
  var ov=H.showSheet("🆘 "+L2("Kad kecemasan","Emergency card"), '<div class="crSos"><div class="crSosN">'+E(p.n)+'</div>'+(p.b?'<div>'+U.dstr(p.b)+(U.age({b:p.b})!==""?" · "+U.age({b:p.b})+L2(" tahun"," yrs"):"")+'</div>':'')+
    (p.blood?'<div class="crSosB">🩸 '+E(p.blood)+'</div>':'')+(p.alg?'<div class="crSosA">⚠️ '+L2("ALAHAN: ","ALLERGIES: ")+E(p.alg)+'</div>':'')+(p.cond?'<div><b>'+L2("Keadaan","Conditions")+':</b> '+E(p.cond)+'</div>':'')+
    (meds.length?'<div><b>'+L2("Ubat","Medicines")+':</b> '+meds.map(function(m){ return E(m.n+(m.dose?" "+m.dose:"")); }).join(", ")+'</div>':'')+(p.doc||p.clinic?'<div><b>'+L2("Doktor","Doctor")+':</b> '+E([p.doc,p.clinic].filter(Boolean).join(", "))+'</div>':'')+'</div>'+
    '<button class="btn g3d full crRed" id="s999">📞 '+L2("Panggil 999","Call 999")+'</button>'+(p.em||[]).map(function(c,i){ return c.t?'<button class="btn alt g3d full" data-sc="'+E(c.t)+'" style="margin-top:6px">📞 '+E(c.n||c.t)+' · '+E(c.t)+'</button>':''; }).join("")+
    '<div class="btns" style="margin-top:8px"><button class="btn alt g3d" id="sLoc">📍 '+L2("Hantar lokasi","Send location")+'</button><button class="btn alt g3d" id="sSh">📤 '+L2("Kongsi kad","Share card")+'</button></div>'+
    '<div class="mut tiny" style="margin-top:8px">'+L2("Tunjukkan skrin ini kepada paramedik. Maklumat ini hanya dalam telefon ini.","Show this screen to paramedics. This information is only on this phone.")+'</div>');
  bind(ov,"#s999",function(){ try{ H.N.openUrl("tel:999"); }catch(e){} });
  ov.querySelectorAll("[data-sc]").forEach(function(b){ b.onclick=function(){ call(b.getAttribute("data-sc")); }; });
  bind(ov,"#sSh",function(){ share(sosText(p)); });
  bind(ov,"#sLoc",function(){ sendLoc(p, this); }); }
function sendLoc(p, b){ var lab=b?b.textContent:""; if(b) b.textContent="⏳";
  var done=function(r){ if(b) b.textContent=lab; var t="🆘 "+L2("Saya perlukan bantuan","I need help")+(p?" ("+p.n+")":"")+(r && r.lat!=null?"\n📍 https://www.google.com/maps/search/?api=1&query="+(+r.lat).toFixed(5)+","+(+r.lon).toFixed(5):"");
    var c=p && (p.em||[]).filter(function(x){ return x.t; })[0]; if(c && window.Native && H.N.openUrl){ H.N.openUrl(U.waUrl(c.t)+"?text="+encodeURIComponent(t)); } else share(t); };
  var hl=function(r){ H.off("location",hl); clearTimeout(tm); done(r && !r.error?r:null); }, tm=setTimeout(function(){ H.off("location",hl); done(null); }, 8000);
  try{ if(H.N.hasPerm && !H.N.hasPerm("location")){ var hp=function(qq){ if(qq.which!=="location") return; H.off("perm",hp); if(qq.granted){ H.on("location",hl); H.N.getLocation(); } else { clearTimeout(tm); done(null); } }; H.on("perm",hp); H.N.requestPerm("location"); return; }
    H.on("location",hl); H.N.getLocation(); }catch(e){ clearTimeout(tm); done(null); } }

// ---------- page 2: medicines ----------
function pMed(el){ if(!C.ppl.length) return needPerson(el); var ds=today(), L=dosesOn(ds, pf||null), done=L.filter(function(x){ return x.g; }).length;
  var h=pchips(true)+'<div class="card"><h3>💊 '+L2("Hari ini","Today")+' <span class="mut small">'+done+'/'+L.length+'</span></h3>'+(L.length?L.map(function(x){ return doseRow(x, ds); }).join(""):'<div class="mut small">'+L2("Tiada dos dijadualkan hari ini.","No doses scheduled today.")+'</div>')+'</div>';
  var low=C.meds.filter(function(m){ var d=stockDays(m); return inP(m) && !m.off && d!=null && d<=3; });
  if(low.length) h+='<div class="card crWarn">📦 '+L2("Stok hampir habis: ","Running low: ")+low.map(function(m){ return E(m.n)+" ("+stockDays(m)+L2(" hari"," days")+")"; }).join(", ")+'</div>';
  h+='<div class="card"><h3>📋 '+L2("Senarai ubat","Medicine list")+'</h3>'+(C.meds.filter(inP).map(function(m){ var sd=stockDays(m);
    return '<button class="crRow" data-me="'+m.id+'"><span><b>'+E(m.n)+'</b>'+(m.dose?' · '+E(m.dose):'')+(m.off?' <i class="mut">('+L2("berhenti","stopped")+')</i>':'')+'<small>'+(C.ppl.length>1?E(nm(P(m.pid)))+' · ':'')+(m.times||[]).map(T12).join(", ")+' · '+E(foodTxt(m.food))+(sd!=null?' · 📦 '+sd+L2(" hari"," days"):'')+'</small></span><span>›</span></button>'; }).join("")||'<div class="mut small">'+L2("Belum ada ubat.","No medicines yet.")+'</div>')+
    '<button class="btn gold g3d full" id="mAdd" style="margin-top:8px">＋ '+L2("Tambah ubat","Add a medicine")+'</button></div>';
  // the last 7 days at a glance
  var days=[]; for(var i=6;i>=0;i--){ var d=U.ymd(H.addDays(U.today(),-i)), D=dosesOn(d, pf||null); if(i===0) D=D.filter(function(x){ return doseState(x,d)!=="later"; }); days.push([d, D.filter(function(x){ return x.g; }).length, D.length]); }
  h+='<div class="card"><h3>🗓 '+L2("7 hari lepas","Last 7 days")+'</h3><div class="crWeek">'+days.map(function(x){ var r=x[2]?x[1]/x[2]:1; return '<div><i style="height:'+Math.round(8+40*r)+'px" class="'+(r>=1?"ok":r>=.7?"mid":"low")+'"></i><small>'+U.dstr(x[0]).split(" ")[0]+'</small><b>'+x[1]+'/'+x[2]+'</b></div>'; }).join("")+'</div></div>'+disc();
  el.innerHTML=h; bindPf(el); bindGive(el, ds);
  el.querySelectorAll("[data-me]").forEach(function(b){ b.onclick=function(){ medEdit(b.getAttribute("data-me")); }; }); bind(el,"#mAdd",function(){ medEdit(null); }); }
function medEdit(id){ var m=id?M(id):{id:U.uid(), pid:pf||(C.ppl[0]||{}).id, times:["08:00"], food:"after", start:today(), days:0, rem:true}; var isNew=!id, times=(m.times||[]).slice();
  var ov=H.showSheet((isNew?"＋ ":"✏️ ")+L2("Ubat","Medicine"),
    (C.ppl.length>1?'<label class="fl">'+L2("Untuk","For")+'<select id="mP">'+C.ppl.map(function(p){ return '<option value="'+p.id+'"'+(m.pid===p.id?" selected":"")+'>'+E(p.n)+'</option>'; }).join("")+'</select></label>':'')+
    fld("mN", L2("Nama ubat","Medicine name"), m.n, "text", ' placeholder="Amlodipine"')+fld("mD", L2("Dos","Dose"), m.dose, "text", ' placeholder="5 mg · 1 '+L2("biji","tablet")+'"')+
    '<div class="fl">'+L2("Masa","Times")+'<div class="crTimes" id="mTs"></div><div class="chips"><button class="chip g3d" id="mTadd">＋ '+L2("Masa","Time")+'</button><button class="chip g3d" data-tp="08:00">1×</button><button class="chip g3d" data-tp="08:00,20:00">2×</button><button class="chip g3d" data-tp="08:00,14:00,20:00">3×</button><button class="chip g3d" data-tp="07:00,12:00,17:00,22:00">4×</button></div></div>'+
    '<label class="fl">'+L2("Makanan","Food")+'<select id="mF">'+FOOD.map(function(f){ return '<option value="'+f[0]+'"'+(m.food===f[0]?" selected":"")+'>'+L2(f[1],f[2])+'</option>'; }).join("")+'</select></label>'+
    fld("mS", L2("Mula","Start"), m.start, "date")+fld("mDy", L2("Berapa hari (0 = berterusan)","How many days (0 = ongoing)"), m.days||0, "number", ' min="0"')+
    fld("mSt", L2("Stok sekarang (biji / dos)","Stock now (tablets / doses)"), m.stock==null?"":m.stock, "number", ' min="0"')+fld("mPer", L2("Biji setiap dos","Tablets per dose"), m.per||1, "number", ' min="0" step="0.5"')+
    area("mO", L2("Nota","Notes"), m.note, L2("cth. Jangan dengan jus limau gedang","e.g. Not with grapefruit juice"))+
    '<label class="crChk"><input type="checkbox" id="mR"'+(m.rem!==false?" checked":"")+'> 🔔 '+L2("Peringatan","Reminders")+'</label><label class="crChk"><input type="checkbox" id="mOff"'+(m.off?" checked":"")+'> ⏸ '+L2("Sudah berhenti ubat ini","No longer taking this")+'</label>'+
    '<div class="btns"><button class="btn gold g3d" id="mOk">💾 '+L2("Simpan","Save")+'</button>'+(isNew?'':'<button class="btn alt g3d" id="mDel">🗑 '+L2("Padam","Delete")+'</button>')+'</div>');
  var ts=q(ov,"#mTs"), drawT=function(){ ts.innerHTML=times.map(function(t,i){ return '<span class="crTm"><input type="time" value="'+t+'" data-ti="'+i+'"><button data-tx="'+i+'" aria-label="'+L2("Buang","Remove")+'">✕</button></span>'; }).join("");
    ts.querySelectorAll("[data-ti]").forEach(function(i){ i.onchange=function(){ times[+i.getAttribute("data-ti")]=i.value; }; }); ts.querySelectorAll("[data-tx]").forEach(function(b){ b.onclick=function(){ times.splice(+b.getAttribute("data-tx"),1); drawT(); }; }); };
  drawT(); bind(ov,"#mTadd",function(){ times.push("12:00"); drawT(); }); ov.querySelectorAll("[data-tp]").forEach(function(b){ b.onclick=function(){ times=b.getAttribute("data-tp").split(","); drawT(); }; });
  q(ov,"#mOk").onclick=function(){ if(!val(ov,"#mN")){ H.toast(L2("Isi nama ubat","Fill in the medicine name")); return; } times=times.filter(Boolean).sort(); if(!times.length){ H.toast(L2("Tambah sekurang-kurangnya satu masa","Add at least one time")); return; }
    m.pid=q(ov,"#mP")?q(ov,"#mP").value:m.pid; m.n=val(ov,"#mN"); m.dose=val(ov,"#mD"); m.times=times; m.food=q(ov,"#mF").value; m.start=val(ov,"#mS"); m.days=Math.max(0,parseInt(val(ov,"#mDy"),10)||0);
    var st=val(ov,"#mSt"); m.stock=st===""?null:Math.max(0,+st); m.per=Math.max(0,parseFloat(val(ov,"#mPer"))||1); m.note=val(ov,"#mO"); m.rem=q(ov,"#mR").checked; m.off=q(ov,"#mOff").checked;
    if(isNew) C.meds.push(m); sv(); H.closeOverlay(); draw(); };
  bind(ov,"#mDel",function(){ C.meds=C.meds.filter(function(x){ return x.id!==m.id; }); C.log=C.log.filter(function(g){ return g.mid!==m.id; }); sv(); H.closeOverlay(); draw(); }); }

// ---------- page 3: vital signs ----------
function chart(p, k){ var R=C.vit.filter(function(r){ return r.pid===p.id && r.k===k; }).slice(-30); if(R.length<2) return '<div class="mut small">'+L2("Rekod 2 bacaan atau lebih untuk melihat graf.","Record 2 or more readings to see a chart.")+'</div>';
  var W=300, Hh=130, pl=30, pr=8, pt=8, pb=18, vs=[]; R.forEach(function(r){ vs.push(r.v); if(r.v2!=null) vs.push(r.v2); }); var g=rg(p,k); if(g[1]>g[0]){ vs.push(g[0]); vs.push(g[1]); }
  var lo=Math.min.apply(null,vs), hi=Math.max.apply(null,vs); if(hi===lo){ hi+=1; lo-=1; } var padv=(hi-lo)*0.1; lo-=padv; hi+=padv;
  var x=function(i){ return pl+(W-pl-pr)*i/(R.length-1); }, y=function(v){ return pt+(Hh-pt-pb)*(1-(v-lo)/(hi-lo)); };
  var band=g[1]>g[0]?'<rect x="'+pl+'" y="'+y(g[1]).toFixed(1)+'" width="'+(W-pl-pr)+'" height="'+Math.max(0,y(g[0])-y(g[1])).toFixed(1)+'" class="crBand"/>':'';
  var line=function(key){ return R.map(function(r,i){ var v=key?r.v2:r.v; return v==null?"":(x(i).toFixed(1)+","+y(v).toFixed(1)); }).filter(Boolean).join(" "); };
  var dots=R.map(function(r,i){ var f=flag(p,r); return '<circle cx="'+x(i).toFixed(1)+'" cy="'+y(r.v).toFixed(1)+'" r="3.2" class="'+(f?"crDotBad":"crDot")+'"/>'; }).join("");
  var ticks=[lo+padv, (lo+hi)/2, hi-padv].map(function(v){ return '<text x="'+(pl-4)+'" y="'+(y(v)+3).toFixed(1)+'" text-anchor="end" class="crAx">'+(Math.round(v*10)/10)+'</text>'; }).join("");
  var d0=new Date(R[0].at), d1=new Date(R[R.length-1].at), lab=function(d){ return d.getDate()+"/"+(d.getMonth()+1); };
  return '<svg viewBox="0 0 '+W+' '+Hh+'" class="crChart" role="img" aria-label="'+L2(vt(k)[2],vt(k)[3])+'">'+band+ticks+(k==="bp"?'<polyline points="'+line(true)+'" class="crLine2"/>':'')+'<polyline points="'+line(false)+'" class="crLine"/>'+dots+
    '<text x="'+pl+'" y="'+(Hh-4)+'" class="crAx">'+lab(d0)+'</text><text x="'+(W-pr)+'" y="'+(Hh-4)+'" text-anchor="end" class="crAx">'+lab(d1)+'</text></svg>'; }
function pVit(el){ if(!C.ppl.length) return needPerson(el); if(!pf || !P(pf)) pf=C.ppl[0].id; var p=P(pf), t=vt(vk);
  var h=pchips(false)+'<div class="chips fseg">'+VT.map(function(x){ return '<button class="chip g3d'+(vk===x[0]?" on":"")+'" data-vk="'+x[0]+'">'+x[1]+' '+L2(x[2],x[3])+'</button>'; }).join("")+'</div>';
  var R=C.vit.filter(function(r){ return r.pid===p.id && r.k===vk; }), last=R.slice(-1)[0], g=rg(p,vk);
  h+='<div class="card"><h3>'+t[1]+' '+L2(t[2],t[3])+(last?' · <span class="'+(flag(p,last)?"crBadT":"")+'">'+vstr(last)+' '+t[4]+'</span>':'')+'</h3>'+(g[1]>g[0]&&vk!=="wt"?'<div class="mut tiny">'+L2("Julat normal anda: ","Your normal range: ")+g[0]+'–'+g[1]+' '+t[4]+(vk==="bp"?" / "+((p.rg&&p.rg.bpd)||BPD).join("–"):"")+'</div>':'')+chart(p, vk)+
    '<div class="crAddV">'+(vk==="bp"?'<input type="number" id="vV" placeholder="'+L2("Sistolik","Systolic")+'" inputmode="decimal"><span>/</span><input type="number" id="vV2" placeholder="'+L2("Diastolik","Diastolic")+'" inputmode="decimal">':'<input type="number" id="vV" step="'+t[6]+'" placeholder="'+t[4]+'" inputmode="decimal">')+
    '<button class="btn gold g3d" id="vAdd">＋ '+L2("Rekod","Record")+'</button></div><input type="text" id="vN" class="crNote" placeholder="'+L2("Nota (pilihan): selepas makan, pening…","Note (optional): after food, dizzy…")+'"></div>';
  h+='<div class="card"><h3>🕘 '+L2("Bacaan terkini","Recent readings")+'</h3>'+(R.slice(-12).reverse().map(function(r){ var f=flag(p,r), d=new Date(r.at);
    return '<div class="crVr'+(f?" bad":"")+'"><span>'+U.dstr(U.ymd(d))+' '+hm(d)+'</span><b>'+vstr(r)+' '+t[4]+(f?(f>0?" ↑":" ↓"):"")+'</b>'+(r.note?'<small>'+E(r.note)+'</small>':'')+'<button data-vx="'+r.id+'" aria-label="'+L2("Padam","Delete")+'">✕</button></div>'; }).join("")||'<div class="mut small">'+L2("Belum ada bacaan.","No readings yet.")+'</div>')+'</div>';
  h+='<button class="btn alt g3d full" id="vDoc">📄 '+L2("Ringkasan untuk doktor","Summary for the doctor")+'</button>'+disc();
  el.innerHTML=h; bindPf(el);
  el.querySelectorAll("[data-vk]").forEach(function(b){ b.onclick=function(){ vk=b.getAttribute("data-vk"); draw(); }; });
  bind(el,"#vAdd",function(){ var v=parseFloat(val(el,"#vV")), v2=vk==="bp"?parseFloat(val(el,"#vV2")):null; if(isNaN(v) || (vk==="bp" && isNaN(v2))){ H.toast(L2("Isi bacaan","Fill in the reading")); return; }
    var r={id:U.uid(), pid:p.id, at:Date.now(), k:vk, v:v}; if(vk==="bp") r.v2=v2; if(val(el,"#vN")) r.note=val(el,"#vN"); C.vit.push(r); sv();
    var f=flag(p,r); if(f) H.toast("⚠️ "+L2("Di luar julat normal. Pantau dan hubungi doktor jika berterusan atau ada simptom.","Outside the normal range. Keep watching and call the doctor if it continues or there are symptoms.")); draw(); });
  el.querySelectorAll("[data-vx]").forEach(function(b){ b.onclick=function(){ C.vit=C.vit.filter(function(r){ return r.id!==b.getAttribute("data-vx"); }); sv(); draw(); }; });
  bind(el,"#vDoc",function(){ docSummary(p); }); }
function docSummary(p){ var since=Date.now()-14*864e5, lines=[], meds=C.meds.filter(function(m){ return m.pid===p.id && medActive(m, today()); });
  VT.forEach(function(t){ var R=C.vit.filter(function(r){ return r.pid===p.id && r.k===t[0] && r.at>=since; }); if(!R.length) return; var av=function(k){ var s=0; R.forEach(function(r){ s+=r[k]; }); return Math.round(s/R.length*10)/10; };
    var mn=Math.min.apply(null,R.map(function(r){ return r.v; })), mx=Math.max.apply(null,R.map(function(r){ return r.v; })), bad=R.filter(function(r){ return flag(p,r); }).length;
    lines.push(t[1]+" "+L2(t[2],t[3])+": "+L2("purata ","average ")+(t[0]==="bp"?av("v")+"/"+av("v2"):av("v"))+" "+t[4]+" ("+mn+"–"+mx+", "+R.length+L2(" bacaan"," readings")+(bad?", "+bad+L2(" luar julat"," out of range"):"")+")"); });
  var D=0, G=0; for(var i=0;i<14;i++){ var d=U.ymd(H.addDays(U.today(),-i)), L=dosesOn(d, p.id).filter(function(x){ return i>0 || doseState(x,d)!=="later"; }); D+=L.length; G+=L.filter(function(x){ return x.g; }).length; }
  var t="📄 "+L2("Ringkasan 14 hari","14-day summary")+" · "+p.n+(p.b?" ("+U.age({b:p.b})+L2(" tahun"," yrs")+")":"")+(p.cond?"\n"+L2("Keadaan: ","Conditions: ")+p.cond:"")+(p.alg?"\n⚠️ "+L2("Alahan: ","Allergies: ")+p.alg:"")+
    "\n\n"+(lines.join("\n")||L2("Tiada bacaan dalam 14 hari.","No readings in 14 days."))+"\n\n💊 "+L2("Ubat semasa: ","Current medicines: ")+(meds.map(function(m){ return m.n+(m.dose?" "+m.dose:"")+" ("+m.times.join(", ")+")"; }).join("; ")||"-")+
    (D?"\n"+L2("Dos diberi: ","Doses given: ")+G+"/"+D+" ("+Math.round(G*100/D)+"%)":"");
  var ov=H.showSheet("📄 "+L2("Ringkasan untuk doktor","Summary for the doctor"), '<pre class="crPre">'+E(t)+'</pre><button class="btn gold g3d full" id="dsSh">📤 '+L2("Kongsi","Share")+'</button>'); bind(ov,"#dsSh",function(){ share(t); }); }

// ---------- page 4: appointments ----------
function kindOf(k){ for(var i=0;i<KINDS.length;i++) if(KINDS[i][0]===k) return KINDS[i]; return KINDS[4]; }
function pApt(el){ if(!C.ppl.length) return needPerson(el); var ds=today(), A=C.apt.filter(inP), up=A.filter(function(a){ return !a.done && a.t.slice(0,10)>=ds; }).sort(function(a,b){ return a.t<b.t?-1:1; }), past=A.filter(function(a){ return a.done || a.t.slice(0,10)<ds; }).sort(function(a,b){ return a.t<b.t?1:-1; });
  var row=function(a){ var k=kindOf(a.kind), n=U.days(U.today(), U.pd(a.t.slice(0,10))), ck=a.ck||[], okc=ck.filter(function(c){ return c.ok; }).length;
    return '<button class="crRow" data-ae="'+a.id+'"><span><b>'+k[1]+' '+E(a.where||L2(k[2],k[3]))+'</b><small>'+U.dstr(a.t.slice(0,10))+' · '+T12(a.t.slice(11,16))+(C.ppl.length>1?' · '+E(nm(P(a.pid))):'')+(ck.length?' · ☑ '+okc+'/'+ck.length:'')+'</small></span><span class="crIn">'+(a.done?'✓':n===0?L2("Hari ini","Today"):n===1?L2("Esok","Tomorrow"):n>0?n+L2(" hari"," days"):'')+'</span></button>'; };
  el.innerHTML=pchips(true)+'<div class="card"><h3>📅 '+L2("Akan datang","Upcoming")+'</h3>'+(up.map(row).join("")||'<div class="mut small">'+L2("Tiada temujanji.","No appointments.")+'</div>')+'<button class="btn gold g3d full" id="aAdd" style="margin-top:8px">＋ '+L2("Tambah temujanji","Add an appointment")+'</button></div>'+
    (past.length?'<details class="card crDet"><summary>🗂 '+L2("Lepas","Past")+' ('+past.length+')</summary>'+past.slice(0,30).map(row).join("")+'</details>':'')+
    '<div class="card mut tiny">🔔 '+L2("Peringatan: sehari sebelum (8 malam) dan 2 jam sebelum. Ia juga muncul dalam Kalendar bila disegerakkan.","Reminders: the evening before (8 pm) and 2 hours before.")+'</div>';
  bindPf(el); el.querySelectorAll("[data-ae]").forEach(function(b){ b.onclick=function(){ aptEdit(b.getAttribute("data-ae")); }; }); bind(el,"#aAdd",function(){ aptEdit(null); }); }
function aptEdit(id){ var a=null; C.apt.forEach(function(x){ if(x.id===id) a=x; }); var isNew=!a; if(!a){ var t=H.addDays(U.today(),7); a={id:U.uid(), pid:pf||(C.ppl[0]||{}).id, t:U.ymd(t)+"T09:00", kind:"clinic", ck:CK0.clinic.map(function(c){ return {t:L2(c[0],c[1]), ok:false}; }), q:""}; }
  var ov=H.showSheet((isNew?"＋ ":"✏️ ")+L2("Temujanji","Appointment"),
    (C.ppl.length>1?'<label class="fl">'+L2("Untuk","For")+'<select id="aP">'+C.ppl.map(function(p){ return '<option value="'+p.id+'"'+(a.pid===p.id?" selected":"")+'>'+E(p.n)+'</option>'; }).join("")+'</select></label>':'')+
    '<label class="fl">'+L2("Jenis","Kind")+'<select id="aK">'+KINDS.map(function(k){ return '<option value="'+k[0]+'"'+(a.kind===k[0]?" selected":"")+'>'+k[1]+' '+L2(k[2],k[3])+'</option>'; }).join("")+'</select></label>'+
    fld("aD", L2("Tarikh","Date"), a.t.slice(0,10), "date")+fld("aT", L2("Masa","Time"), a.t.slice(11,16), "time")+fld("aW", L2("Tempat / doktor","Place / doctor"), a.where)+
    '<div class="fl">☑ '+L2("Senarai semak","Checklist")+'<div id="aCk"></div><div class="crEm"><input type="text" id="aCkN" placeholder="'+L2("Tambah perkara…","Add an item…")+'"><button class="chip g3d" id="aCkAdd">＋</button></div></div>'+
    area("aQ", L2("Soalan untuk doktor","Questions for the doctor"), a.q, L2("cth. Boleh kurangkan dos? Kenapa kaki bengkak?","e.g. Can the dose go down? Why are the feet swollen?"))+area("aN", L2("Nota / keputusan","Notes / results"), a.note)+
    '<label class="crChk"><input type="checkbox" id="aDn"'+(a.done?" checked":"")+'> ✓ '+L2("Sudah selesai","Done")+'</label>'+
    '<div class="btns"><button class="btn gold g3d" id="aOk">💾 '+L2("Simpan","Save")+'</button>'+(isNew?'':'<button class="btn alt g3d" id="aDel">🗑 '+L2("Padam","Delete")+'</button>')+'</div>');
  var ck=(a.ck||[]).map(function(c){ return {t:c.t, ok:!!c.ok}; }), box=q(ov,"#aCk"), drawC=function(){ box.innerHTML=ck.map(function(c,i){ return '<label class="crChk"><input type="checkbox" data-ci="'+i+'"'+(c.ok?" checked":"")+'> '+E(c.t)+' <button class="crX" data-cx="'+i+'">✕</button></label>'; }).join("");
    box.querySelectorAll("[data-ci]").forEach(function(i){ i.onchange=function(){ ck[+i.getAttribute("data-ci")].ok=i.checked; }; }); box.querySelectorAll("[data-cx]").forEach(function(b){ b.onclick=function(e){ e.preventDefault(); ck.splice(+b.getAttribute("data-cx"),1); drawC(); }; }); };
  drawC(); q(ov,"#aK").onchange=function(){ if(!ck.some(function(c){ return c.ok; })){ ck=(CK0[this.value]||[]).map(function(c){ return {t:L2(c[0],c[1]), ok:false}; }); drawC(); } };
  bind(ov,"#aCkAdd",function(){ var t=val(ov,"#aCkN"); if(!t) return; ck.push({t:t, ok:false}); q(ov,"#aCkN").value=""; drawC(); });
  q(ov,"#aOk").onclick=function(){ var d=val(ov,"#aD"), tm=val(ov,"#aT")||"09:00"; if(!d){ H.toast(L2("Isi tarikh","Fill in the date")); return; }
    a.pid=q(ov,"#aP")?q(ov,"#aP").value:a.pid; a.kind=q(ov,"#aK").value; a.t=d+"T"+tm; a.where=val(ov,"#aW"); a.ck=ck; a.q=val(ov,"#aQ"); a.note=val(ov,"#aN"); a.done=q(ov,"#aDn").checked; if(isNew) C.apt.push(a); sv(); H.closeOverlay(); draw(); };
  bind(ov,"#aDel",function(){ C.apt=C.apt.filter(function(x){ return x.id!==a.id; }); sv(); H.closeOverlay(); draw(); }); }

// ---------- page 5: sharing the care ----------
function turnNow(p, d){ var t=p.turn; if(!t || !(t.names||[]).length || !t.start) return null; var s=U.pd(t.start), n=Math.floor((d-s)/864e5/(+t.every||7)); if(n<0) return null; return {cur:t.names[n%t.names.length], next:t.names[(n+1)%t.names.length], ends:H.addDays(s,(n+1)*(+t.every||7)-1)}; }
function pShare(el){ if(!C.ppl.length) return needPerson(el); if(!pf || !P(pf)) pf=C.ppl[0].id; var p=P(pf), ds=today(), tn=turnNow(p, U.today()), td=(C.td[p.id]||{})[ds]||{}, tasks=p.tasks||[];
  var h=pchips(false)+'<div class="card"><h3>🔁 '+L2("Giliran menjaga","Whose turn")+'</h3>'+(tn?'<div class="crTurn"><b>'+E(tn.cur)+'</b><span>'+L2("hingga ","until ")+U.dstr(U.ymd(tn.ends))+' · '+L2("seterusnya: ","next: ")+E(tn.next)+'</span></div>':'<div class="mut small">'+L2("Tetapkan giliran adik-beradik supaya penjagaan adil.","Set siblings' turns so the care is shared fairly.")+'</div>')+
    '<button class="btn alt g3d full" id="tEd" style="margin-top:8px">✏️ '+L2("Tetapkan giliran","Set turns")+'</button></div>';
  h+='<div class="card"><h3>✅ '+L2("Tugasan harian","Daily tasks")+' <span class="mut small">'+Object.keys(td).length+'/'+tasks.length+'</span></h3>'+tasks.map(function(t){ var by=td[t.id];
    return '<label class="crChk crTask"><input type="checkbox" data-tk="'+t.id+'"'+(by?" checked":"")+'> <span>'+E(t.t)+(by?'<small> · '+E(by===true?"":by)+'</small>':'')+'</span><button class="crX" data-tkx="'+t.id+'">✕</button></label>'; }).join("")+
    '<div class="crEm"><input type="text" id="tkN" placeholder="'+L2("cth. Mandikan, urut kaki, temankan berjalan","e.g. Bathe, massage feet, walk together")+'"><button class="chip g3d" id="tkAdd">＋</button></div></div>';
  h+='<div class="card"><h3>📤 '+L2("Kongsi dengan keluarga","Share with the family")+'</h3><div class="mut small">'+(PLAY?L2("Hantar ringkasan hari ini ke kumpulan WhatsApp keluarga: giliran dan tugasan.","Send today's summary to the family WhatsApp group: turns and tasks."):L2("Hantar ringkasan hari ini ke kumpulan WhatsApp keluarga: ubat, bacaan, tugasan dan temujanji.","Send today's summary to the family WhatsApp group: medicines, readings, tasks and appointments."))+'</div>'+
    '<div class="btns" style="margin-top:8px"><button class="btn gold g3d" id="shT">📤 '+L2("Ringkasan hari ini","Today's summary")+'</button><button class="btn alt g3d" id="shB">🧾 '+L2("Bahagi kos","Split costs")+'</button></div></div>'+disc();
  el.innerHTML=h; bindPf(el);
  bind(el,"#tEd",function(){ turnEdit(p); });
  el.querySelectorAll("[data-tk]").forEach(function(c){ c.onchange=function(){ C.td[p.id]=C.td[p.id]||{}; var D=C.td[p.id][ds]=C.td[p.id][ds]||{}; if(c.checked) D[c.getAttribute("data-tk")]=C.me||true; else delete D[c.getAttribute("data-tk")];
    Object.keys(C.td[p.id]).forEach(function(k){ if(U.days(U.pd(k), U.today())>60) delete C.td[p.id][k]; }); sv(); draw(); }; });
  el.querySelectorAll("[data-tkx]").forEach(function(b){ b.onclick=function(e){ e.preventDefault(); p.tasks=(p.tasks||[]).filter(function(t){ return t.id!==b.getAttribute("data-tkx"); }); sv(); draw(); }; });
  bind(el,"#tkAdd",function(){ var t=val(el,"#tkN"); if(!t) return; p.tasks=p.tasks||[]; p.tasks.push({id:U.uid(), t:t}); sv(); draw(); });
  bind(el,"#shT",function(){ share(daySummary(p)); }); bind(el,"#shB",function(){ nav("fin/bahagi"); }); }
function daySummary(p){ var ds=today(), L=dosesOn(ds, p.id), td=(C.td[p.id]||{})[ds]||{}, R=C.vit.filter(function(r){ return r.pid===p.id && U.ymd(new Date(r.at))===ds; }), tn=turnNow(p, U.today()),
    nx=C.apt.filter(function(a){ return a.pid===p.id && !a.done && a.t.slice(0,10)>=ds; }).sort(function(a,b){ return a.t<b.t?-1:1; })[0];
  if(PLAY){ L=[]; R=[]; nx=null; }
  return "🩺 "+p.n+" · "+U.dstr(ds)+(tn?"\n🔁 "+L2("Giliran: ","Turn: ")+tn.cur:"")+(PLAY?"":"\n\n💊 "+L2("Ubat","Medicines")+" ("+L.filter(function(x){ return x.g; }).length+"/"+L.length+")\n"+L.map(function(x){ return (x.g?"✅ ":"⬜ ")+x.tm+" "+x.m.n+(x.g&&x.g.by?" · "+x.g.by:""); }).join("\n"))+
    (R.length?"\n\n❤️ "+R.map(function(r){ return vt(r.k)[1]+" "+vstr(r)+" "+vt(r.k)[4]+(flag(p,r)?" ⚠️":""); }).join(" · "):"")+
    ((p.tasks||[]).length?"\n\n✅ "+(p.tasks||[]).map(function(t){ return (td[t.id]?"✓ ":"○ ")+t.t; }).join(" · "):"")+
    (nx?"\n\n📅 "+kindOf(nx.kind)[1]+" "+(nx.where||"")+" · "+U.dstr(nx.t.slice(0,10))+" "+T12(nx.t.slice(11,16)):"")+"\n\n— My Ihsan"; }
function turnEdit(p){ var t=p.turn||{names:[], start:today(), every:7};
  var ov=H.showSheet("🔁 "+L2("Giliran menjaga","Care turns"), area("tN", L2("Nama, satu setiap baris (ikut giliran)","Names, one per line (in turn order)"), (t.names||[]).join("\n"), "Kak Long\nAngah\nAdik")+fld("tS", L2("Giliran pertama bermula","First turn starts"), t.start, "date")+
    fld("tE", L2("Setiap giliran (hari)","Each turn (days)"), t.every||7, "number", ' min="1"')+'<button class="btn gold g3d full" id="tOk">💾 '+L2("Simpan","Save")+'</button>');
  q(ov,"#tOk").onclick=function(){ var names=q(ov,"#tN").value.split("\n").map(function(s){ return s.trim(); }).filter(Boolean); p.turn={names:names, start:val(ov,"#tS")||today(), every:Math.max(1,parseInt(val(ov,"#tE"),10)||7)}; if(!names.length) delete p.turn; sv(); H.closeOverlay(); draw(); }; }

// ---------- page 6: ibadah for the sick ----------
// ⚠ Pending ustaz review: texts are well known, but every line here is to be checked and referenced by the ustaz before release.
var DOA=[
 ["يَا رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا","Allāhumma rabban-nās, adhhibil-ba's, isyfi antas-syāfī, lā syifā'a illā syifā'uk, syifā'an lā yughādiru saqamā",
  "Ya Allah, Tuhan manusia, hilangkanlah penyakit ini, sembuhkanlah, Engkaulah Penyembuh. Tiada kesembuhan melainkan kesembuhan-Mu, kesembuhan yang tidak meninggalkan sakit.","O Allah, Lord of mankind, remove the illness and heal, You are the Healer. There is no healing but Your healing, a healing that leaves no sickness.","Sahih al-Bukhari, Sahih Muslim"],
 ["أَسْأَلُ اللَّهَ الْعَظِيمَ، رَبَّ الْعَرْشِ الْعَظِيمِ، أَنْ يَشْفِيَكَ","As'alullāhal-'aẓīm, rabbal-'arsyil-'aẓīm, an yasyfiyak (7×)",
  "Aku memohon kepada Allah Yang Maha Agung, Tuhan Arasy yang agung, agar menyembuhkanmu. (7 kali, ketika menziarahi)","I ask Allah the Mighty, Lord of the Mighty Throne, to heal you. (7 times, when visiting)","Sunan Abi Dawud, Jami' at-Tirmidhi"],
 ["بِسْمِ اللَّهِ (٣) · أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (٧)","Bismillāh (3×) · A'ūdhu billāhi wa qudratihi min syarri mā ajidu wa uḥādhir (7×)",
  "Letakkan tangan pada tempat yang sakit. Dengan nama Allah (3 kali). Aku berlindung dengan Allah dan kekuasaan-Nya daripada keburukan yang aku rasa dan aku bimbangi (7 kali).","Put your hand where it hurts. In the name of Allah (3 times). I seek refuge in Allah and His power from the evil of what I feel and fear (7 times).","Sahih Muslim"],
 ["لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ","Lā ba'sa, ṭahūrun in syā' Allāh",
  "Tidak mengapa, (sakit ini) penyucian (dosa) insya-Allah. Ucapan ketika menziarahi orang sakit.","No harm, it is a purification, if Allah wills. Said when visiting the sick.","Sahih al-Bukhari"]];
function sec(t, body, open){ return '<details class="card crDet"'+(open?" open":"")+'><summary><b>'+t+'</b></summary>'+body+'</details>'; }
function li(a){ return '<ol class="crOl">'+a.map(function(x){ return '<li>'+x+'</li>'; }).join("")+'</ol>'; }
function pIb(el){ var rev='<div class="mut tiny crRev">⚠️ '+L2("Menunggu semakan ustaz. Rujuk ustaz atau pejabat agama untuk keadaan anda.","Pending ustaz review. Ask an ustaz or the religious office about your situation.")+'</div>';
  var h=sec("🧎 "+L2("Solat orang sakit","Prayer for the sick"), li([
      L2("Solat tidak gugur selagi akal ada. Buat sekadar yang mampu.","Prayer is not dropped while the mind is clear. Do what you are able to."),
      L2("Berdiri. Jika tidak mampu, duduk (bersila atau di kerusi).","Stand. If you cannot, sit (cross-legged or on a chair)."),
      L2("Jika tidak mampu duduk, berbaring mengiring ke kanan menghadap kiblat.","If you cannot sit, lie on the right side facing the qibla."),
      L2("Jika tidak mampu, terlentang dengan kaki ke arah kiblat dan kepala diangkat sedikit.","If you cannot, lie on the back with the feet towards the qibla and the head raised a little."),
      L2("Rukuk dan sujud dengan menundukkan kepala; sujud lebih rendah daripada rukuk. Jika tidak mampu, dengan isyarat mata dan hati.","Bow and prostrate by lowering the head; prostration lower than bowing. If not possible, with the eyes and the heart."),
      L2("Boleh jamak (himpun) solat ketika sakit yang menyukarkan, mengikut pandangan ulama. Tanya ustaz.","Combining prayers when illness makes it hard is allowed by some scholars. Ask an ustaz.")])+
      '<div class="mut tiny">'+L2("Dalil: hadis Imran bin Husain, Sahih al-Bukhari.","Evidence: the hadith of Imran ibn Husain, Sahih al-Bukhari.")+'</div><button class="btn alt g3d" data-nv="solat/rakaat">🧎 '+L2("Pengira rakaat","Rakaat counter")+'</button>', true)+
    sec("💧 "+L2("Tayammum","Tayammum"), '<div class="small">'+L2("Bila air memudaratkan (luka, jangkitan, nasihat doktor) atau tiada air.","When water would harm (wounds, infection, doctor's advice) or there is no water.")+'</div>'+li([
      L2("Niat di dalam hati untuk mengharuskan solat.","Intend in the heart to make prayer permissible."),
      L2("Tepuk kedua tapak tangan pada debu tanah yang suci, sapu ke seluruh muka.","Strike both palms on clean earth dust and wipe the whole face."),
      L2("Tepuk sekali lagi, sapu kedua tangan hingga ke siku (kanan dahulu).","Strike again and wipe both arms up to the elbows (right first)."),
      L2("Satu tayammum untuk satu solat fardu (mazhab Syafie).","One tayammum for one obligatory prayer (Shafi'i school).")])+'<div class="mut tiny">'+L2("Dalil: Surah al-Ma'idah 5:6.","Evidence: Surah al-Ma'idah 5:6.")+'</div>')+
    sec("🍽 "+L2("Puasa: qada atau fidyah?","Fasting: make up or fidyah?"), li([
      L2("<b>Sakit sementara</b> (dijangka sembuh): boleh berbuka, dan qada (ganti) selepas sembuh.","<b>Temporary illness</b> (expected to recover): may break the fast, and make it up after recovering."),
      L2("<b>Sakit berpanjangan / terlalu tua</b> dan tidak mampu berpuasa: bayar fidyah, satu cupak (mud) makanan asasi bagi setiap hari, tanpa qada.","<b>Long-term illness / very old age</b> and unable to fast: pay fidyah, one mud of staple food for each day, with no making up."),
      L2("Kadar fidyah dalam ringgit ditetapkan oleh majlis agama negeri setiap tahun.","The fidyah rate in ringgit is set by each state religious council every year.")])+'<div class="mut tiny">'+L2("Dalil: Surah al-Baqarah 2:184.","Evidence: Surah al-Baqarah 2:184.")+'</div><button class="btn alt g3d" data-nv="cal/puasa">🍽 '+L2("Rekod puasa","Fasting log")+'</button>')+
    sec("🤲 "+L2("Doa untuk orang sakit","Doa for the sick"), DOA.map(function(d){ return '<div class="crDoa"><div class="crAr">'+d[0]+'</div><div class="crRm">'+E(d[1])+'</div><div class="small">'+E(L2(d[2],d[3]))+'</div><div class="mut tiny">'+E(d[4])+'</div><button class="chip g3d" data-ds="'+DOA.indexOf(d)+'">📤 '+L2("Kongsi","Share")+'</button></div>'; }).join(""))+
    sec("🫶 "+L2("Adab menziarahi orang sakit","Etiquette when visiting the sick"), li([
      L2("Ziarah sebentar dan pada waktu yang sesuai; ikut waktu melawat hospital.","Keep the visit short and at a suitable time; follow hospital visiting hours."),
      L2("Beri salam, duduk dekat kepala, dan doakan kesembuhan.","Give salam, sit near the head and pray for recovery."),
      L2("Beri harapan dan kata-kata yang baik; elak cerita yang menakutkan.","Give hope and kind words; avoid frightening stories."),
      L2("Tanya keperluan keluarga yang menjaga: makanan, giliran, kenderaan.","Ask what the carers need: food, turns, transport."),
      L2("Jaga kebersihan: basuh tangan, pakai pelitup jika demam atau batuk.","Keep clean: wash hands, wear a mask if you have a fever or cough.")]))+
    '<details class="card crDet crEnd"><summary><b>🕊 '+L2("Persediaan akhir hayat","Preparing for the end of life")+'</b> <span class="mut small">'+L2("buka bila anda bersedia","open when you are ready")+'</span></summary>'+
      '<div class="small">'+L2("Semoga Allah memanjangkan umur dalam kebaikan. Bahagian ini membantu keluarga bersedia dengan tenang.","May Allah grant long life in goodness. This part helps the family prepare calmly.")+'</div>'+
      '<h3>'+L2("Sebelum","Before")+'</h3>'+li([L2("Catat wasiat dan hutang supaya mudah diselesaikan.","Record the will and debts so they are easy to settle."),
        L2("Bacakan Yasin dan ajar (talqin) kalimah لَا إِلَهَ إِلَّا اللَّهُ dengan lembut, tanpa memaksa.","Read Yasin and gently prompt (talqin) the words لَا إِلَهَ إِلَّا اللَّهُ, without pressing."),
        L2("Hadapkan ke kiblat jika mudah, dan ramaikan doa.","Turn towards the qibla if easy, and make much doa.")])+
      '<div class="btns"><button class="btn alt g3d" data-nv="fin/wasiat">📜 '+L2("Wasiat","Will")+'</button><button class="btn alt g3d" data-nv="fin/hutang">🤝 '+L2("Hutang","Debts")+'</button><button class="btn alt g3d" id="ibYs">📖 Yasin</button></div>'+
      '<h3>'+L2("Selepas","After")+'</h3>'+li([L2("Ucap إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ, pejamkan mata dan tutup badan dengan kain.","Say إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ, close the eyes and cover the body with a cloth."),
        L2("Maklumkan keluarga terdekat dan imam / pengurusan jenazah masjid.","Tell close family and the mosque imam / funeral team."),
        L2("Dapatkan permit pengebumian dan sijil kematian; daftar kematian di JPN (biasanya dalam 7 hari).","Get the burial permit and death certificate; register the death with JPN (usually within 7 days)."),
        L2("Mandikan, kafankan, solat jenazah dan kebumikan dengan segera.","Wash, shroud, pray the funeral prayer and bury promptly."),
        L2("Selesaikan hutang dan wasiat; faraid oleh pihak berkuasa.","Settle debts and the will; inheritance (faraid) through the authorities.")])+'</details>'+rev;
  el.innerHTML=h;
  el.querySelectorAll("[data-nv]").forEach(function(b){ b.onclick=function(){ nav(b.getAttribute("data-nv")); }; });
  el.querySelectorAll("[data-ds]").forEach(function(b){ b.onclick=function(){ var d=DOA[+b.getAttribute("data-ds")]; share("🤲 "+d[0]+"\n"+d[1]+"\n\n"+L2(d[2],d[3])+"\n("+d[4]+")"); }; });
  bind(el,"#ibYs",function(){ try{ H.closeOverlay(); }catch(e){} try{ if(H.openQuranAt) H.openQuranAt(36,1); }catch(e){} }); }

// ---------- elder mode: big buttons, one screen ----------
function elder(){ ld(); var p=P(C.eP)||C.ppl[0]; var old=document.getElementById("crElder"); if(old) old.remove();
  var d=document.createElement("div"); d.id="crElder"; d.setAttribute("role","dialog"); d.setAttribute("aria-label",L2("Mod warga emas","Elder mode")); document.body.appendChild(d);
  var tick=null, paint=function(){ if(!document.body.contains(d)){ clearInterval(tick); return; } var n=now(), ds=today(), L=p&&!PLAY?dosesOn(ds, p.id):[], nxP="", times="";
    try{ var np=H.nextPrev?H.nextPrev():null; if(np && np.next){ var x=new Date(np.next.t); nxP=(H.en()?np.next.ne:np.next.n)+" "+T12(hm(x)); } }catch(e){}
    try{ var t=H.getDay?H.getDay(n):null; if(t) times=[["subuh","Subuh"],["zohor","Zohor"],["asar","Asar"],["maghrib","Maghrib"],["isyak","Isyak"]].map(function(k){ return t[k[0]]?'<span><small>'+k[1]+'</small>'+T12(t[k[0]])+'</span>':''; }).join(""); }catch(e){}
    d.innerHTML='<div class="crEt"><b>'+T12(hm(n)).replace(" ","<small> ")+'</small></b><span>'+(p?E(p.n):"")+'</span></div>'+(nxP?'<div class="crEp">🕌 '+L2("Solat seterusnya: ","Next prayer: ")+'<b>'+E(nxP)+'</b></div>':'')+(times?'<div class="crEtm">'+times+'</div>':'')+
      (L.length?'<div class="crEh">💊 '+L2("Ubat hari ini","Today's medicines")+'</div>'+L.map(function(x){ return doseRow(x, ds, true); }).join(""):'')+
      '<div class="crEb">'+(p?(p.em||[]).filter(function(c){ return c.t; }).slice(0,3).map(function(c){ return '<button class="crBig" data-ec="'+E(c.t)+'">📞 '+E(c.n||c.t)+'</button>'; }).join(""):'')+
      (PLAY?'':'<button class="crBig crRed" id="eSos">🆘 '+L2("Minta tolong","Get help")+'</button>')+'</div><button class="crExit" id="eX">'+L2("Tekan lama untuk keluar","Press and hold to leave")+'</button>';
    d._redraw=paint; bindGive(d, ds);
    d.querySelectorAll("[data-ec]").forEach(function(b){ b.onclick=function(){ call(b.getAttribute("data-ec")); }; });
    bind(d,"#eSos",function(){ if(p) sosCard(p); else try{ H.N.openUrl("tel:999"); }catch(e){} });
    var x=d.querySelector("#eX"), hold=null, start=function(e){ e.preventDefault(); x.classList.add("hold"); hold=setTimeout(function(){ clearInterval(tick); d.remove(); try{ H.render(); }catch(err){} }, 2000); }, stop=function(){ clearTimeout(hold); x.classList.remove("hold"); };
    x.addEventListener("pointerdown", start); x.addEventListener("pointerup", stop); x.addEventListener("pointerleave", stop); x.addEventListener("pointercancel", stop); };
  paint(); tick=setInterval(function(){ if(!document.body.contains(d)){ clearInterval(tick); return; } if(!d.querySelector(".hold")) paint(); }, 30000); }

// ---------- styles (kept with the module) ----------
function css(){ if(document.getElementById("careCss")) return; var s=document.createElement("style"); s.id="careCss"; s.textContent=
  ".crP h3{margin:0}.crPh{display:flex;gap:10px;align-items:center;margin-bottom:6px}.crAv{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--card2);border:1px solid var(--line);font-weight:700;font-size:20px;flex:none}"+
  ".crAlg{color:var(--red,#e0605a);font-weight:600}.crStat{display:flex;flex-wrap:wrap;gap:6px 12px;margin:8px 0;font-size:13px}.crBad,.crBadT{color:var(--red,#e0605a);font-weight:700}"+
  ".crChk{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:14px}.crChk input{width:20px;height:20px;flex:none}.crTask span{flex:1}.crX{border:0;background:none;color:var(--mut);font-size:14px;padding:4px 6px}"+
  ".crDose{display:grid;grid-template-columns:62px 1fr 46px;gap:8px;align-items:center;padding:8px 0;border-top:1px solid var(--line)}.crDose:first-of-type{border-top:0}.crT{font-weight:700;font-variant-numeric:tabular-nums;font-size:13px}"+
  ".crN{display:flex;flex-direction:column;min-width:0}.crN small{color:var(--mut);font-size:12px}.crG{width:44px;height:44px;border-radius:50%;border:2px solid var(--line);background:var(--card2);font-size:18px;color:var(--fg)}.crG.on{background:var(--green);border-color:var(--green);color:#fff}"+
  ".crS-miss .crT{color:var(--red,#e0605a)}.crS-due .crG{border-color:var(--gold)}.crS-done{opacity:.75}"+
  ".crRow{display:flex;width:100%;justify-content:space-between;align-items:center;gap:8px;text-align:left;background:none;border:0;border-top:1px solid var(--line);padding:9px 0;color:var(--fg);font:inherit}.crRow:first-of-type{border-top:0}.crRow span:first-child{display:flex;flex-direction:column;min-width:0}.crRow small{color:var(--mut);font-size:12px}.crIn{font-size:12px;color:var(--gold);white-space:nowrap}"+
  ".crWarn{border-color:var(--gold)!important}.crWeek{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;align-items:end;text-align:center}.crWeek div{display:flex;flex-direction:column;align-items:center;gap:2px}.crWeek i{display:block;width:70%;border-radius:4px;background:var(--line)}.crWeek i.ok{background:var(--green)}.crWeek i.mid{background:var(--gold)}.crWeek i.low{background:var(--red,#e0605a)}.crWeek small,.crWeek b{font-size:10.5px}"+
  ".crTimes{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}.crTm{display:inline-flex;align-items:center;gap:2px}.crTm input{width:auto!important;display:inline-block!important;margin:0!important}.crTm button{border:0;background:none;color:var(--mut)}"+
  ".crEm{display:grid;grid-template-columns:1fr 1fr;gap:6px;align-items:end}.crEm input{width:100%;box-sizing:border-box;padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--well);color:inherit;font:inherit}"+
  ".crRg{display:grid;grid-template-columns:1fr 64px 10px 64px 46px;gap:4px;align-items:center;font-size:12.5px;margin:4px 0}.crRg input{width:100%;box-sizing:border-box;padding:6px;border-radius:8px;border:1px solid var(--line);background:var(--well);color:inherit}.crRg small{color:var(--mut)}"+
  ".crDet summary{cursor:pointer;padding:2px 0}.crDet[open] summary{margin-bottom:8px}.crChart{width:100%;height:auto;display:block;margin:8px 0}.crBand{fill:var(--green);opacity:.12}.crLine{fill:none;stroke:var(--gold);stroke-width:2.2}.crLine2{fill:none;stroke:var(--mut);stroke-width:1.6;stroke-dasharray:4 3}.crDot{fill:var(--gold)}.crDotBad{fill:var(--red,#e0605a)}.crAx{fill:var(--mut);font-size:9px}"+
  ".crAddV{display:flex;gap:6px;align-items:center;margin-top:6px}.crAddV input{flex:1;min-width:0;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--well);color:inherit;font:inherit;font-size:16px}.crNote{width:100%;box-sizing:border-box;margin-top:6px;padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--well);color:inherit;font:inherit}"+
  ".crVr{display:grid;grid-template-columns:1fr auto 28px;gap:2px 8px;align-items:center;padding:6px 0;border-top:1px solid var(--line);font-size:13px}.crVr small{grid-column:1/3;color:var(--mut)}.crVr.bad b{color:var(--red,#e0605a)}.crVr button{border:0;background:none;color:var(--mut)}"+
  ".crPre{white-space:pre-wrap;font-size:13px;line-height:1.5;font-family:inherit;background:var(--well);padding:10px;border-radius:10px;max-height:50vh;overflow:auto}"+
  ".crTurn{display:flex;flex-direction:column}.crTurn b{font-size:22px}.crTurn span{color:var(--mut);font-size:13px}"+
  ".crOl{margin:4px 0 8px;padding-left:20px;font-size:14px;line-height:1.55}.crOl li{margin:3px 0}.crDoa{border-top:1px solid var(--line);padding:10px 0;display:flex;flex-direction:column;gap:4px}.crDoa:first-child{border-top:0}"+
  ".crAr{font-family:var(--ar);font-size:calc(var(--arsize,26px) * .9);line-height:1.9;direction:rtl;text-align:right}.crRm{font-style:italic;font-size:13px;color:var(--mut)}.crDoa .chip{align-self:flex-start}.crRev{margin:8px 4px}"+
  ".crSos{display:flex;flex-direction:column;gap:6px;font-size:15px;line-height:1.45;margin-bottom:10px}.crSosN{font-size:26px;font-weight:800}.crSosB{font-size:22px;font-weight:800}.crSosA{background:#c62828;color:#fff;padding:8px 10px;border-radius:10px;font-weight:700}"+
  ".btn.crRed,.crBig.crRed{background:#c62828!important;color:#fff!important;border-color:#c62828!important}"+
  "#crElder{position:fixed;inset:0;z-index:9999;background:var(--bg);color:var(--fg);overflow:auto;padding:calc(14px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:12px;font-size:20px}"+
  ".crEt{display:flex;justify-content:space-between;align-items:baseline}.crEt b{font-size:56px;line-height:1;font-variant-numeric:tabular-nums}.crEt b small{font-size:22px}.crEt span{font-size:22px;font-weight:700}.crEp{font-size:22px}.crEp b{color:var(--gold)}"+
  ".crEtm{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;text-align:center;font-size:16px;font-weight:700;font-variant-numeric:tabular-nums}.crEtm span{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:6px 2px;display:flex;flex-direction:column}.crEtm small{font-size:12px;font-weight:600;color:var(--mut)}"+
  ".crEh{font-size:20px;font-weight:700}.crDose.big{grid-template-columns:96px 1fr 64px;font-size:20px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:10px 12px}.crDose.big .crT{font-size:20px}.crDose.big small{font-size:15px}.crDose.big .crG{width:60px;height:60px;font-size:26px}"+
  ".crEb{display:flex;flex-direction:column;gap:10px;margin-top:4px}.crBig{min-height:72px;border-radius:20px;border:2px solid var(--line);background:var(--card);color:var(--fg);font-weight:700;font-size:24px;font-family:inherit}"+
  ".crExit{margin-top:auto;min-height:52px;border-radius:999px;border:1px dashed var(--line);background:none;color:var(--mut);font-weight:600;font-size:16px;font-family:inherit;position:relative;overflow:hidden}.crExit.hold{color:var(--fg)}.crExit.hold:before{content:'';position:absolute;inset:0;background:var(--card2);transform-origin:left;animation:crHold 2s linear forwards;z-index:-1}@keyframes crHold{from{transform:scaleX(0)}to{transform:scaleX(1)}}";
  document.head.appendChild(s); }

// ---------- the hub ----------
function fn(k){ return {ppl:pPpl, med:pMed, vit:pVit, apt:pApt, share:pShare, ib:pIb}[k]||pPpl; }
function tabs(){ return '<div class="bbtabs noswipe">'+PAGES.map(function(p){ return '<button class="chip g3d'+(page===p[0]?" on":"")+'" data-cp="'+p[0]+'">'+p[1]+' '+L2(p[2],p[3])+'</button>'; }).join("")+'</div>'; }
function view(el, h, dockHtml){ H=h; L2=h.L2x; E=h.esc; U=FamView.util(); ld(); css(); host=el;
  if(!PAGES.some(function(x){ return x[0]===page; })) page="ppl";
  if(pf && !P(pf)) pf="";
  el.innerHTML=tabs()+'<div id="crBody"></div>'+(dockHtml||"");
  var body=el.querySelector("#crBody"); fn(page)(body);
  el.querySelectorAll("[data-cp]").forEach(function(b){ b.onclick=function(){ page=b.getAttribute("data-cp"); draw(); var v=document.getElementById("view"); if(v) v.scrollTop=0; }; });
  try{ H.dockFix(); }catch(e){}
  if(window.IbSwipe && window.ibWrap){ var ks=PAGES.map(function(x){ return x[0]; }), nb=function(s){ return ks[ks.indexOf(page)+(s<0?1:-1)]; }, pg=window.ibWrap(body);
    window.IbSwipe(pg, {can:function(s){ return !!nb(s); }, go:function(s){ page=nb(s); draw(); }, find:function(){ return document.querySelector("#crBody .ibpg"); },
      peek:function(s){ var k=nb(s), p0=page, b=window.IbSwipe.shot(function(){ page=k; }, function(x){ fn(k)(x); }, function(){ page=p0; }); if(!b) return null; var w=document.createElement("div"); w.className="ibpg"; while(b.firstChild) w.appendChild(b.firstChild); return w; }}); } }
window.CareView={play:PLAY, view:view, elder:function(h){ if(h){ H=h; L2=h.L2x; E=h.esc; } U=FamView.util(); ld(); css(); if(C.ppl.length) elder(); },
  navGet:function(){ return {pg:page, pf:pf, vk:vk, k:page+pf+vk}; }, navSet:function(o){ page=o.pg||"ppl"; if(o.pf!=null) pf=o.pf; if(o.vk) vk=o.vk; },
  _t:{ ld:function(h){ H=h; L2=h.L2x; E=h.esc; U=FamView.util(); return ld(); }, dosesOn:function(d,p){ return dosesOn(d,p); }, flag:function(p,r){ return flag(p,r); }, turnNow:function(p,d){ return turnNow(p,d); }, daySummary:function(p){ return daySummary(p); }, sosText:function(p){ return sosText(p); } }};
})();
