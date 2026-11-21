/* My Ihsan 0.21.0: Kewangan (Finance) tab: Hutang (idea 98), Komitmen & rancangan, Zakat log.
   FinView(el, page, H). Storage: ihsan_fin {debts, com, plans, zakat, inc}; receipt photos in app files fin/<id>.txt
   (a small thumbnail stays in localStorage so backups keep it). Ayat text is taken from the bundled Quran data (quran/qar.js);
   the Malay meanings are short paraphrases written for this app and need an ustaz's review. */
(function(){
"use strict";
var H, L2, E, D, pg="hutang", st={df:"open", cv:"m", zy:null};
var CUR="RM";
function ld(){ D=H.load("ihsan_fin",null)||{}; ["debts","com","plans","zakat"].forEach(function(k){ if(!Array.isArray(D[k])) D[k]=[]; }); if(typeof D.inc!=="number") D.inc=0; }
function sv(){ H.save("ihsan_fin",D); try{ if(H.resched) H.resched(); }catch(e){} }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function rm(n){ n=+n||0; return CUR+" "+n.toLocaleString("en-MY",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function num(v){ v=String(v||"").replace(/[^0-9.\-]/g,""); var n=parseFloat(v); return isFinite(n)?Math.round(n*100)/100:0; }
function ymd(d){ return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); }
function pd(s){ if(!s) return null; var p=String(s).split("-"); return new Date(+p[0], (+p[1]||1)-1, +p[2]||1); }
function today(){ var d=new Date(); d.setHours(0,0,0,0); return d; }
function dstr(s){ var d=pd(s); if(!d) return ""; return d.toLocaleDateString(ibLoc(H.en()),{day:"numeric",month:"short",year:"numeric"}); }
function days(a,b){ return Math.round((b-a)/864e5); }
function share(txt){ var N=H.N; if(window.Native && N.shareTo) N.shareTo("", "", txt); else if(navigator.share) navigator.share({text:txt}).catch(function(){}); else { try{ navigator.clipboard.writeText(txt); H.toast(L2("Disalin","Copied")); }catch(e){ H.toast(txt); } } }
function seg(attr, cur, opts){ return '<div class="chips fseg">'+opts.map(function(o){ return '<button class="chip g3d'+(String(cur)===String(o[0])?" on":"")+'" '+attr+'="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>'; }
function fld(id, label, val, type, extra){ return '<label class="fl">'+label+'<input id="'+id+'" type="'+(type||"text")+'" value="'+E(val==null?"":val)+'"'+(extra||"")+'></label>'; }

// ---------- ayat cards (Arabic from the bundled mushaf data, without harakat) ----------
var AY={
  "2:282":["يا أيها الذين آمنوا إذا تداينتم بدين إلى أجل مسمى فاكتبوه وليكتب بينكم كاتب بالعدل","Wahai orang beriman, apabila kamu berhutang hingga tempoh tertentu, maka tuliskanlah, dan hendaklah seorang penulis menuliskannya dengan adil.","O you who have believed, when you contract a debt for a specified term, write it down. And let a scribe write it between you in justice."],
  "2:280":["وإن كان ذو عسرة فنظرة إلى ميسرة وأن تصدقوا خير لكم إن كنتم تعلمون","Jika orang yang berhutang itu dalam kesusahan, berilah tempoh hingga dia lapang. Dan menyedekahkannya (menghalalkan hutang) lebih baik bagi kamu, jika kamu mengetahui.","And if someone is in hardship, then let there be postponement until a time of ease. But if you give it as charity, it is better for you, if you only knew."],
  "25:67":["والذين إذا أنفقوا لم يسرفوا ولم يقتروا وكان بين ذلك قواما","Dan mereka yang apabila berbelanja tidak melampau dan tidak kedekut, tetapi pertengahan antara keduanya.","And those who, when they spend, do so neither excessively nor sparingly, but are ever moderate between that."],
  "65:7":["لينفق ذو سعة من سعته ومن قدر عليه رزقه فلينفق مما آتاه الله لا يكلف الله نفسا إلا ما آتاها سيجعل الله بعد عسر يسرا","Hendaklah orang yang lapang berbelanja menurut kemampuannya, dan yang disempitkan rezekinya berbelanja daripada apa yang Allah berikan. Allah akan menjadikan kemudahan selepas kesusahan.","Let a man of wealth spend from his wealth, and he whose provision is restricted spend from what Allah has given him. Allah will bring about ease after hardship."],
  "9:103":["خذ من أموالهم صدقة تطهرهم وتزكيهم بها وصل عليهم إن صلاتك سكن لهم والله سميع عليم","Ambillah zakat daripada harta mereka untuk membersihkan dan menyucikan mereka, dan doakanlah mereka; sesungguhnya doamu menenangkan mereka.","Take from their wealth a charity by which you purify them and cause them increase, and invoke blessings upon them. Your invocations are reassurance for them."],
  "4:1":["ياأيها الناس اتقوا ربكم الذي خلقكم من نفس واحدة وخلق منها زوجها وبث منهما رجالا كثيرا ونساء واتقوا الله الذي تساءلون به والأرحام إن الله كان عليكم رقيبا","Wahai manusia, bertakwalah kepada Tuhan kamu yang menciptakan kamu daripada diri yang satu, dan daripadanya Dia menciptakan pasangannya, dan daripada keduanya Dia membiakkan lelaki dan perempuan yang ramai. Bertakwalah kepada Allah dan peliharalah hubungan silaturahim.","O mankind, fear your Lord, who created you from one soul and created from it its mate and dispersed from both of them many men and women. Fear Allah, through whom you ask one another, and the wombs (ties of kinship)."],
  "49:13":["ياأيها الناس إنا خلقناكم من ذكر وأنثى وجعلناكم شعوبا وقبائل لتعارفوا إن أكرمكم عند الله أتقاكم إن الله عليم خبير","Wahai manusia, Kami menciptakan kamu daripada lelaki dan perempuan, dan menjadikan kamu berbangsa dan bersuku supaya kamu saling mengenali. Yang paling mulia di sisi Allah ialah yang paling bertakwa.","O mankind, We created you from male and female and made you peoples and tribes that you may know one another. The most noble of you in the sight of Allah is the most righteous of you."],
  "2:43":["وأقيموا الصلاة وآتوا الزكاة واركعوا مع الراكعين","Dan dirikanlah solat, tunaikanlah zakat, dan rukuklah bersama orang yang rukuk.","And establish prayer and give zakah and bow with those who bow."]
};
function ayat(refs, extra){
  return '<details class="card fay"><summary>📖 '+L2("Panduan al-Quran","Guidance from the Quran")+' <span class="mut tiny">'+refs.join(" · ")+'</span></summary>'+refs.map(function(r){ var a=AY[r];
    return '<div class="fayi"><div class="ar" dir="rtl" style="font-size:22px;line-height:1.9">'+a[0]+(r==="2:282"?' …':'')+'</div><div class="tr">'+E(L2(a[1],a[2]))+'</div><div class="src"><a href="#" data-qref="'+r+'">📖 '+L2("Surah ","Surah ")+r+' ›</a></div></div>'; }).join("")+(extra||"")+
    '<div class="mut tiny">'+L2("Teks Arab tanpa baris dari data mushaf aplikasi; ketik pautan untuk teks penuh. Maksud ringkas perlu disemak ustaz.","Arabic without vowel marks from the app's mushaf data; tap the link for the full text. Short meanings need an ustaz's review.")+'</div></details>';
}

// ================= HUTANG (debts, idea 98) =================
function dLeft(x){ var p=(x.pays||[]).reduce(function(a,b){ return a+(+b.amt||0); },0); return x.done?0:Math.max(0,Math.round((x.amt-p)*100)/100); }
function dPaid(x){ return (x.pays||[]).reduce(function(a,b){ return a+(+b.amt||0); },0); }
function vHutang(el){
  var owe=0, owed=0, doneN=0, t0=today();
  D.debts.forEach(function(x){ if(x.done){ doneN++; return; } if(x.dir==="owed") owed+=dLeft(x); else owe+=dLeft(x); });
  var list=D.debts.filter(function(x){ return st.df==="all"?true:st.df==="done"?x.done:st.df==="open"?!x.done:(!x.done && x.dir===st.df); })
    .sort(function(a,b){ return (a.done-b.done) || String(a.due||"9999").localeCompare(String(b.due||"9999")) || String(b.date).localeCompare(String(a.date)); });
  var tot=list.reduce(function(a,x){ return a+(x.done?x.amt:dLeft(x)); },0);
  var h='<div class="card fsum"><div><small>'+L2("Saya berhutang","I owe")+'</small><b class="fneg">'+rm(owe)+'</b></div><div><small>'+L2("Orang berhutang dengan saya","Owed to me")+'</small><b class="fpos">'+rm(owed)+'</b></div></div>';
  h+=seg("data-df", st.df, [["open",L2("Belum selesai","Open")],["owe",L2("Saya berhutang","I owe")],["owed",L2("Kepada saya","Owed to me")],["done",L2("Selesai","Settled")+(doneN?" "+doneN:"")],["all",L2("Semua","All")]]);
  h+='<button class="btn gold full g3d" id="fdAdd">＋ '+L2("Tambah hutang","Add a debt")+'</button>';
  if(!list.length) h+='<div class="card mut small">'+(D.debts.length?L2("Tiada dalam senarai ini.","Nothing in this list."):L2("Belum ada rekod. Catat setiap hutang, kecil atau besar, seperti yang disuruh dalam Surah al-Baqarah ayat 282.","No records yet. Write down every debt, small or large, as Surah al-Baqarah ayat 282 tells us."))+(D.debts.length?'':'<div style="margin-top:10px"><button class="btn gold g3d" data-proxy="#fdAdd">＋ '+L2("Tambah hutang pertama","Add the first debt")+'</button></div>')+'</div>';
  else {
    h+='<div class="card flist">'+list.map(function(x){ var left=dLeft(x), od=!x.done && x.due && pd(x.due)<t0, soon=!x.done && x.due && !od && days(t0,pd(x.due))<=7;
      return '<div class="frow'+(x.done?" fdone":"")+'"><label class="fck"><input type="checkbox" data-dck="'+x.id+'" '+(x.done?"checked":"")+'><span></span></label>'+
        '<button class="fmain" data-dop="'+x.id+'"><b>'+(x.dir==="owed"?"⬅ ":"➡ ")+E(x.who||"-")+'</b><small>'+E(x.desc||"")+(x.desc?" · ":"")+dstr(x.date)+(x.due?' · '+L2("bayar ","due ")+dstr(x.due):'')+'</small>'+
        (od?'<em class="fbad">'+L2("Lewat ","Late ")+days(pd(x.due),t0)+L2(" hari"," days")+'</em>':soon?'<em class="fwarn">'+L2("Dalam ","In ")+days(t0,pd(x.due))+L2(" hari"," days")+'</em>':'')+'</button>'+
        '<span class="famt '+(x.dir==="owed"?"fpos":"fneg")+'">'+rm(x.done?x.amt:left)+(dPaid(x)&&!x.done?'<small>/ '+rm(x.amt)+'</small>':'')+'</span></div>'; }).join("")+
      '<div class="ftot"><span>'+L2("Jumlah","Total")+' ('+list.length+')</span><b>'+rm(tot)+'</b></div></div>';
    h+='<div class="btns"><button class="btn alt g3d" id="fdAll">☑ '+L2("Tanda semua selesai","Mark all settled")+'</button><button class="btn alt g3d" id="fdShare">📤 '+L2("Kongsi senarai","Share list")+'</button></div>';
    if(doneN) h+='<button class="btn alt full g3d" id="fdClr" style="margin-top:6px">🗑 '+L2("Padam semua yang selesai","Delete all settled")+' ('+doneN+')</button>';
  }
  h+=ayat(["2:282","2:280"], '<div class="fayi"><div class="tr">'+E(L2("Rasulullah ﷺ bersabda: \"Jiwa seorang mukmin tergantung dengan hutangnya sehingga hutang itu dilunaskan.\"","The Prophet ﷺ said: \"The soul of a believer is held hostage by his debt until it is paid off.\""))+'</div><div class="src">'+L2("Riwayat at-Tirmizi (1078)","Reported by at-Tirmidhi (1078)")+'</div></div>');
  el.innerHTML=h;
  el.querySelectorAll("[data-df]").forEach(function(b){ b.onclick=function(){ st.df=b.getAttribute("data-df"); draw(); }; });
  el.querySelector("#fdAdd").onclick=function(){ dEdit(null); };
  el.querySelectorAll("[data-dck]").forEach(function(c){ c.onchange=function(){ var x=byId(D.debts,c.getAttribute("data-dck")); x.done=c.checked; x.doneAt=c.checked?ymd(new Date()):null; sv(); if(c.checked) H.N.vibrate(40); draw(); }; });
  el.querySelectorAll("[data-dop]").forEach(function(b){ b.onclick=function(){ dOpen(b.getAttribute("data-dop")); }; });
  var a=el.querySelector("#fdAll"); if(a) a.onclick=function(){ var open=list.filter(function(x){ return !x.done; }); if(!open.length) return; if(!confirm(L2("Tanda "+open.length+" hutang dalam senarai ini sebagai selesai?","Mark "+open.length+" debts in this list as settled?"))) return; open.forEach(function(x){ x.done=true; x.doneAt=ymd(new Date()); }); sv(); draw(); };
  var s=el.querySelector("#fdShare"); if(s) s.onclick=function(){ share(L2("Senarai hutang","Debt list")+" ("+dstr(ymd(new Date()))+")\n"+list.map(function(x){ return (x.done?"✓ ":"• ")+(x.dir==="owed"?L2("Kepada saya: ","Owed to me: "):L2("Saya berhutang: ","I owe: "))+(x.who||"")+(x.desc?" ("+x.desc+")":"")+" - "+rm(x.done?x.amt:dLeft(x)); }).join("\n")+"\n"+L2("Jumlah: ","Total: ")+rm(tot)); };
  var c=el.querySelector("#fdClr"); if(c) c.onclick=function(){ if(!confirm(L2("Padam semua rekod yang selesai? Tidak boleh dibuat asal.","Delete all settled records? This cannot be undone."))) return; D.debts=D.debts.filter(function(x){ return !x.done; }); sv(); draw(); };
}
function byId(a,id){ for(var i=0;i<a.length;i++) if(a[i].id===id) return a[i]; return null; }
function dEdit(id){
  var x=id?byId(D.debts,id):{dir:"owe",who:"",desc:"",date:ymd(new Date()),due:"",amt:"",tel:"",rem:true}, dir=x.dir;
  var ov=H.showSheet((id?"✎ ":"＋ ")+L2("Hutang","Debt"),
    '<div class="snl">'+L2("Jenis","Type")+'</div><div class="chips fseg" id="fdDir">'+[["owe","➡ "+L2("Saya berhutang","I owe")],["owed","⬅ "+L2("Orang berhutang dengan saya","Someone owes me")]].map(function(o){ return '<button class="chip g3d'+(dir===o[0]?" on":"")+'" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>'+
    fld("fdW",L2("Nama (dengan siapa)","Name (with whom)"),x.who)+fld("fdD",L2("Penerangan","Description"),x.desc,"text",' placeholder="'+L2("cth. pinjam untuk yuran","e.g. borrowed for fees")+'"')+
    '<div class="f2">'+fld("fdA",L2("Jumlah","Amount")+" ("+CUR+")",x.amt,"number",' inputmode="decimal" step="0.01" min="0"')+fld("fdT",L2("Tarikh","Date"),x.date,"date")+'</div>'+
    '<div class="f2">'+fld("fdU",L2("Tarikh akhir bayar (pilihan)","Due date (optional)"),x.due,"date")+fld("fdP",L2("No. telefon (pilihan)","Phone (optional)"),x.tel,"tel")+'</div>'+
    '<label class="set"><span>🔔 '+L2("Ingatkan pada tarikh akhir","Remind me on the due date")+'</span><span class="switch sm"><input type="checkbox" id="fdR" '+(x.rem!==false?"checked":"")+'><span></span></span></label>'+
    '<button class="btn gold full g3d" id="fdOk" style="margin-top:10px">✓ '+L2("Simpan","Save")+'</button>');
  ov.querySelectorAll("#fdDir [data-v]").forEach(function(b){ b.onclick=function(){ dir=b.getAttribute("data-v"); ov.querySelectorAll("#fdDir [data-v]").forEach(function(c){ c.classList.toggle("on",c===b); }); }; });
  ov.querySelector("#fdOk").onclick=function(){ var v=function(i){ return ov.querySelector(i).value.trim(); }, amt=num(v("#fdA"));
    if(!v("#fdW") && !v("#fdD")){ H.toast(L2("Isi nama atau penerangan","Fill in a name or description")); return; } if(amt<=0){ H.toast(L2("Isi jumlah","Fill in the amount")); return; }
    x.dir=dir; x.who=v("#fdW"); x.desc=v("#fdD"); x.amt=amt; x.date=v("#fdT")||ymd(new Date()); x.due=v("#fdU"); x.tel=v("#fdP"); x.rem=ov.querySelector("#fdR").checked;
    if(!id){ x.id=uid(); x.pays=[]; x.done=false; D.debts.push(x); } sv(); H.closeOverlay(); draw(); };
}
function dOpen(id){
  var x=byId(D.debts,id); if(!x) return; var left=dLeft(x);
  var ov=H.showSheet((x.dir==="owed"?"⬅ ":"➡ ")+E(x.who||L2("Hutang","Debt")),
    '<div class="card fsum"><div><small>'+L2("Asal","Original")+'</small><b>'+rm(x.amt)+'</b></div><div><small>'+L2("Baki","Balance")+'</small><b class="'+(x.dir==="owed"?"fpos":"fneg")+'">'+rm(left)+'</b></div></div>'+
    '<div class="small">'+E(x.desc||"")+'</div><div class="mut tiny">'+dstr(x.date)+(x.due?' · '+L2("Tarikh akhir ","Due ")+dstr(x.due):'')+(x.tel?' · ☎ '+E(x.tel):'')+'</div>'+
    '<div class="snl" style="margin-top:10px">'+L2("Bayaran","Payments")+'</div>'+((x.pays||[]).length?'<div class="flist">'+x.pays.map(function(p,i){ return '<div class="frow"><span class="fmain"><b>'+rm(p.amt)+'</b><small>'+dstr(p.d)+(p.n?' · '+E(p.n):'')+'</small></span><button class="chip" data-pdel="'+i+'">✕</button></div>'; }).join("")+'</div>':'<div class="mut small">'+L2("Belum ada bayaran.","No payments yet.")+'</div>')+
    (x.done?'':'<div class="f2" style="margin-top:6px">'+fld("fpA",L2("Bayaran","Payment")+" ("+CUR+")","","number",' inputmode="decimal" step="0.01" min="0"')+fld("fpD",L2("Tarikh","Date"),ymd(new Date()),"date")+'</div><button class="btn alt full g3d" id="fpOk">＋ '+L2("Rekod bayaran","Record a payment")+'</button>')+
    '<div class="btns" style="margin-top:10px">'+(x.dir==="owed"&&!x.done?'<button class="btn alt g3d" id="fdRem">💬 '+L2("Peringatan lembut","Gentle reminder")+'</button>':'')+'<button class="btn alt g3d" id="fdE">✎ '+L2("Ubah","Edit")+'</button><button class="btn alt g3d" id="fdX">🗑</button></div>');
  var pa=ov.querySelector("#fpOk"); if(pa) pa.onclick=function(){ var a=num(ov.querySelector("#fpA").value); if(a<=0) return; x.pays=x.pays||[]; x.pays.push({amt:a,d:ov.querySelector("#fpD").value||ymd(new Date())}); if(dLeft(x)<=0){ x.done=true; x.doneAt=ymd(new Date()); H.toast(L2("Hutang selesai. Alhamdulillah!","Debt settled. Alhamdulillah!")); } sv(); draw(); dOpen(id); };
  ov.querySelectorAll("[data-pdel]").forEach(function(b){ b.onclick=function(){ x.pays.splice(+b.getAttribute("data-pdel"),1); if(dLeft(x)>0) x.done=false; sv(); draw(); dOpen(id); }; });
  var r=ov.querySelector("#fdRem"); if(r) r.onclick=function(){ var t=L2("Assalamualaikum "+(x.who||"")+". Sekadar peringatan mesra tentang "+(x.desc||"pinjaman")+" sebanyak "+rm(left)+(x.due?" (tarikh dijanjikan "+dstr(x.due)+")":"")+". Jika ada kesempitan, beritahu sahaja, boleh kita bincang. Terima kasih.","Assalamualaikum "+(x.who||"")+". Just a friendly reminder about "+(x.desc||"the loan")+" of "+rm(left)+(x.due?" (promised by "+dstr(x.due)+")":"")+". If things are tight, just let me know and we can talk. Thank you.");
    if(x.tel && window.Native && H.N.openUrl){ try{ H.N.openUrl("https://wa.me/"+x.tel.replace(/[^0-9]/g,"").replace(/^0/,"60")+"?text="+encodeURIComponent(t)); return; }catch(e){} } share(t); };
  ov.querySelector("#fdE").onclick=function(){ dEdit(id); };
  ov.querySelector("#fdX").onclick=function(){ if(!confirm(L2("Padam rekod ini?","Delete this record?"))) return; D.debts=D.debts.filter(function(y){ return y.id!==id; }); sv(); H.closeOverlay(); draw(); };
}

// ================= KOMITMEN (commitments) & RANCANGAN (future plans) =================
var FREQ=[["d","Harian","Daily",365],["w","Mingguan","Weekly",52],["m","Bulanan","Monthly",12],["y","Tahunan","Yearly",1],["o","Sekali","One-off",0]];
var CCAT=[["rumah","🏠","Rumah","Home"],["kereta","🚗","Kenderaan","Vehicle"],["util","💡","Utiliti & telefon","Utilities & phone"],["takaful","🛡","Takaful & insurans","Takaful & insurance"],["didik","🎓","Pendidikan","Education"],["keluarga","👨‍👩‍👧","Keluarga & ibu bapa","Family & parents"],["makan","🍚","Makanan & dapur","Food & groceries"],["sedekah","💝","Sedekah & infaq","Charity"],["langgan","📺","Langganan","Subscriptions"],["pinjam","🏦","Pinjaman & kad","Loans & cards"],["simpan","💰","Simpanan & pelaburan","Savings & investment"],["lain","•","Lain-lain","Others"]];
function fq(k){ for(var i=0;i<FREQ.length;i++) if(FREQ[i][0]===k) return FREQ[i]; return FREQ[2]; }
function cat(k){ for(var i=0;i<CCAT.length;i++) if(CCAT[i][0]===k) return CCAT[i]; return CCAT[CCAT.length-1]; }
function perYear(c){ return c.f==="o"?0:c.amt*fq(c.f)[3]; }
function active(c, d){ d=d||today(); return !(c.end && pd(c.end)<d) && !(c.start && c.f!=="o" && pd(c.start)>addD(d,366)); }
function addD(d,n){ var x=new Date(d); x.setDate(x.getDate()+n); return x; }
// next due date on or after d (null if none / expired)
function nextDue(c, d){
  d=d||today(); var s=pd(c.start)||d, e=c.end?pd(c.end):null, r;
  if(c.f==="o") r=s>=d?s:null;
  else if(c.f==="d") r=s>d?s:new Date(d);
  else if(c.f==="w"){ r=new Date(d); var diff=(s.getDay()-d.getDay()+7)%7; r.setDate(r.getDate()+diff); if(r<s) r=new Date(s); }
  else if(c.f==="m"){ var dm=s.getDate(); r=new Date(d.getFullYear(), d.getMonth(), Math.min(dm, new Date(d.getFullYear(), d.getMonth()+1, 0).getDate())); if(r<d) r=new Date(d.getFullYear(), d.getMonth()+1, Math.min(dm, new Date(d.getFullYear(), d.getMonth()+2, 0).getDate())); if(r<s) r=new Date(s); }
  else { r=new Date(d.getFullYear(), s.getMonth(), Math.min(s.getDate(), new Date(d.getFullYear(), s.getMonth()+1, 0).getDate())); if(r<d) r=new Date(d.getFullYear()+1, s.getMonth(), s.getDate()); if(r<s) r=new Date(s); }
  if(r && e && r>e) return null; return r;
}
window.FinNextDue=function(c,d){ return nextDue(c,d); };
function plMonthly(p){ var left=Math.max(0,p.target-(p.saved||0)), by=pd(p.by); if(!by) return 0; var m=Math.max(1,(by.getFullYear()-new Date().getFullYear())*12+by.getMonth()-new Date().getMonth()); return left/m; }
function vKomitmen(el){
  var t0=today(), act=D.com.filter(function(c){ return active(c,t0); }), yr=act.reduce(function(a,c){ return a+perYear(c); },0), mo=yr/12;
  var plM=D.plans.filter(function(p){ return p.inb && (p.saved||0)<p.target; }).reduce(function(a,p){ return a+plMonthly(p); },0);
  var bal=D.inc-mo-plM, ratio=D.inc>0?Math.min(1,(mo+plM)/D.inc):0;
  var h='<div class="card fov"><div class="row"><h3 style="margin:0">📊 '+L2("Gambaran kewangan","Financial overview")+'</h3><button class="chip g3d" id="fcInc">✎ '+L2("Pendapatan","Income")+'</button></div>'+
    '<div class="fgrid"><div><small>'+L2("Pendapatan / bulan","Income / month")+'</small><b>'+(D.inc?rm(D.inc):'<span class="mut">'+L2("belum diisi","not set")+'</span>')+'</b></div><div><small>'+L2("Komitmen / bulan","Commitments / month")+'</small><b class="fneg">'+rm(mo)+'</b></div>'+
    '<div><small>'+L2("Rancangan / bulan","Plans / month")+'</small><b class="fwarnc">'+rm(plM)+'</b></div><div><small>'+L2("Baki / bulan","Left / month")+'</small><b class="'+(bal<0?"fneg":"fpos")+'">'+(D.inc?rm(bal):"-")+'</b></div></div>'+
    (D.inc?'<div class="fbar"><i style="width:'+Math.round(ratio*100)+'%;background:'+(ratio>0.7?"#e0605a":ratio>0.5?"#f1c40f":"#2ecc71")+'"></i></div><div class="mut tiny">'+Math.round(ratio*100)+'% '+L2("pendapatan untuk komitmen dan rancangan","of income goes to commitments and plans")+(ratio>0.6?' · '+L2("melebihi 60%, berhati-hati","over 60%, be careful"):'')+'</div>':'')+
    '<div class="fper">'+[["d",L2("Sehari","Per day"),yr/365],["w",L2("Seminggu","Per week"),yr/52],["m",L2("Sebulan","Per month"),mo],["y",L2("Setahun","Per year"),yr]].map(function(x){ return '<div><small>'+x[1]+'</small><b>'+rm(x[2])+'</b></div>'; }).join("")+'</div></div>';
  // upcoming 30 days
  var up=[]; act.forEach(function(c){ var d=nextDue(c,t0); if(d && days(t0,d)<=30) up.push([d,c]); }); up.sort(function(a,b){ return a[0]-b[0]; });
  h+='<div class="card"><h3>🗓 '+L2("30 hari akan datang","Next 30 days")+'</h3>'+(up.length?'<div class="flist">'+up.slice(0,12).map(function(u){ var n=days(t0,u[0]); return '<div class="frow"><span class="fmain"><b>'+cat(u[1].cat)[1]+' '+E(u[1].name)+'</b><small>'+dstr(ymd(u[0]))+' · '+(n===0?L2("hari ini","today"):n===1?L2("esok","tomorrow"):L2("dalam ","in ")+n+L2(" hari"," days"))+'</small></span><span class="famt">'+rm(u[1].amt)+'</span></div>'; }).join("")+'</div>':'<div class="mut small">'+L2("Tiada bayaran dalam 30 hari.","Nothing due in 30 days.")+'</div>')+'</div>';
  // list by frequency
  h+=seg("data-cv", st.cv, [["all",L2("Semua","All")]].concat(FREQ.map(function(f){ return [f[0],L2(f[1],f[2])]; })));
  var li=D.com.filter(function(c){ return st.cv==="all"||c.f===st.cv; }).sort(function(a,b){ return (active(b)-active(a)) || b.amt-a.amt; });
  var lt=li.filter(function(c){ return active(c); }).reduce(function(a,c){ return a+c.amt; },0);
  h+='<button class="btn gold full g3d" id="fcAdd">＋ '+L2("Tambah komitmen","Add a commitment")+'</button>';
  h+=li.length?'<div class="card flist">'+li.map(function(c){ var ex=c.end?days(t0,pd(c.end)):null, dead=!active(c,t0);
      return '<button class="frow fbtn'+(dead?" fdone":"")+'" data-cop="'+c.id+'"><span class="fmain"><b>'+cat(c.cat)[1]+' '+E(c.name)+(c.ntf?' 🔔':'')+'</b><small>'+L2(fq(c.f)[1],fq(c.f)[2])+(c.end?' · '+(dead?L2("tamat ","ended ")+dstr(c.end):L2("tamat ","ends ")+dstr(c.end)):'')+'</small>'+
        (ex!==null && ex>=0 && ex<=30?'<em class="fwarn">'+L2("Tamat dalam ","Ends in ")+ex+L2(" hari"," days")+'</em>':'')+'</span><span class="famt">'+rm(c.amt)+'</span></button>'; }).join("")+
      (st.cv!=="all"?'<div class="ftot"><span>'+L2("Jumlah ","Total ")+L2(fq(st.cv)[1],fq(st.cv)[2]).toLowerCase()+'</span><b>'+rm(lt)+'</b></div>':'')+'</div>'
    :'<div class="card mut small">'+L2("Tambah bayaran tetap anda: sewa, ansuran kereta, bil, takaful, yuran, duit untuk ibu bapa, sedekah bulanan. Letak tarikh tamat untuk pinjaman, dan hidupkan 🔔 untuk diingatkan.","Add your fixed payments: rent, car loan, bills, takaful, fees, money for parents, monthly charity. Set an end date for loans, and turn on 🔔 to be reminded.")+'</div>';
  // future plans
  h+='<div class="card"><div class="row"><h3 style="margin:0">🎯 '+L2("Rancangan masa depan","Future plans")+'</h3><button class="chip g3d" id="fpAdd">＋</button></div><div class="mut tiny" style="margin-bottom:6px">'+L2("Haji, umrah, rumah, kahwin, pendidikan anak, kecemasan. Aplikasi kira berapa perlu disimpan setiap bulan.","Hajj, umrah, a house, marriage, children's education, emergency fund. The app works out what to save each month.")+'</div>'+
    (D.plans.length?D.plans.map(function(p){ var f=Math.min(1,(p.saved||0)/Math.max(1,p.target)), m=plMonthly(p);
      return '<button class="fplan fbtn" data-pop="'+p.id+'"><div class="row"><b>'+E(p.name)+'</b><span class="small">'+rm(p.saved||0)+' / '+rm(p.target)+'</span></div><div class="fbar"><i style="width:'+Math.round(f*100)+'%"></i></div>'+
        '<div class="mut tiny">'+(f>=1?'✓ '+L2("Tercapai","Reached"):(p.by?L2("Sasaran ","Target ")+dstr(p.by)+' · '+rm(m)+L2(" sebulan"," a month"):''))+(p.inb?' · '+L2("dalam bajet","in budget"):'')+'</div></button>'; }).join(""):'<div class="mut small">'+L2("Belum ada rancangan.","No plans yet.")+'</div>')+'</div>';
  h+=ayat(["25:67","65:7"]);
  el.innerHTML=h;
  el.querySelectorAll("[data-cv]").forEach(function(b){ b.onclick=function(){ st.cv=b.getAttribute("data-cv"); draw(); }; });
  el.querySelector("#fcAdd").onclick=function(){ cEdit(null); };
  el.querySelector("#fpAdd").onclick=function(){ pEdit(null); };
  el.querySelector("#fcInc").onclick=function(){ var ov=H.showSheet("💵 "+L2("Pendapatan bulanan","Monthly income"), fld("fiA",L2("Jumlah bersih sebulan","Net amount per month")+" ("+CUR+")",D.inc||"","number",' inputmode="decimal" step="0.01" min="0"')+'<div class="mut tiny">'+L2("Hanya disimpan dalam telefon ini.","Kept only on this phone.")+'</div><button class="btn gold full g3d" id="fiOk" style="margin-top:10px">✓ '+L2("Simpan","Save")+'</button>');
    ov.querySelector("#fiOk").onclick=function(){ D.inc=num(ov.querySelector("#fiA").value); sv(); H.closeOverlay(); draw(); }; };
  el.querySelectorAll("[data-cop]").forEach(function(b){ b.onclick=function(){ cEdit(b.getAttribute("data-cop")); }; });
  el.querySelectorAll("[data-pop]").forEach(function(b){ b.onclick=function(){ pEdit(b.getAttribute("data-pop")); }; });
}
function cEdit(id){
  var c=id?byId(D.com,id):{name:"",cat:"rumah",amt:"",f:"m",start:ymd(new Date()),end:"",ntf:true,pre:1,note:""}, f=c.f, ct=c.cat;
  var ov=H.showSheet((id?"✎ ":"＋ ")+L2("Komitmen","Commitment"),
    fld("fcN",L2("Nama","Name"),c.name,"text",' placeholder="'+L2("cth. Ansuran kereta","e.g. Car instalment")+'"')+
    '<div class="snl">'+L2("Kategori","Category")+'</div><div class="chips fseg" id="fcC">'+CCAT.map(function(x){ return '<button class="chip'+(ct===x[0]?" on":"")+'" data-v="'+x[0]+'">'+x[1]+' '+L2(x[2],x[3])+'</button>'; }).join("")+'</div>'+
    '<div class="snl">'+L2("Kekerapan","How often")+'</div><div class="chips fseg" id="fcF">'+FREQ.map(function(x){ return '<button class="chip'+(f===x[0]?" on":"")+'" data-v="'+x[0]+'">'+L2(x[1],x[2])+'</button>'; }).join("")+'</div>'+
    '<div class="f2">'+fld("fcA",L2("Jumlah setiap kali","Amount each time")+" ("+CUR+")",c.amt,"number",' inputmode="decimal" step="0.01" min="0"')+fld("fcS",L2("Mula / tarikh bayar","Start / payment date"),c.start,"date")+'</div>'+
    fld("fcE",L2("Tarikh tamat (pilihan)","End date (optional)"),c.end,"date")+
    '<label class="set"><span>🔔 '+L2("Ingatkan","Remind me")+'</span><span class="switch sm"><input type="checkbox" id="fcR" '+(c.ntf?"checked":"")+'><span></span></span></label>'+
    '<div class="chips fseg" id="fcP">'+[[0,L2("Pada hari itu","On the day")],[1,L2("1 hari awal","1 day before")],[3,L2("3 hari awal","3 days before")],[7,L2("7 hari awal","7 days before")]].map(function(x){ return '<button class="chip'+(String(c.pre||0)===String(x[0])?" on":"")+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>'+
    fld("fcO",L2("Nota (pilihan)","Note (optional)"),c.note)+
    '<button class="btn gold full g3d" id="fcOk" style="margin-top:10px">✓ '+L2("Simpan","Save")+'</button>'+(id?'<button class="btn alt full g3d" id="fcX" style="margin-top:6px">🗑 '+L2("Padam","Delete")+'</button>':''));
  var pick=function(sel, cb){ ov.querySelectorAll(sel+" [data-v]").forEach(function(b){ b.onclick=function(){ cb(b.getAttribute("data-v")); ov.querySelectorAll(sel+" [data-v]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; }); };
  var pre=c.pre||0; pick("#fcC",function(v){ ct=v; }); pick("#fcF",function(v){ f=v; }); pick("#fcP",function(v){ pre=+v; });
  ov.querySelector("#fcOk").onclick=function(){ var n=ov.querySelector("#fcN").value.trim(), a=num(ov.querySelector("#fcA").value); if(!n){ H.toast(L2("Isi nama","Fill in a name")); return; } if(a<=0){ H.toast(L2("Isi jumlah","Fill in the amount")); return; }
    c.name=n; c.cat=ct; c.f=f; c.amt=a; c.start=ov.querySelector("#fcS").value||ymd(new Date()); c.end=ov.querySelector("#fcE").value; c.ntf=ov.querySelector("#fcR").checked; c.pre=pre; c.note=ov.querySelector("#fcO").value.trim();
    if(!id){ c.id=uid(); D.com.push(c); } sv(); H.closeOverlay(); draw(); };
  var x=ov.querySelector("#fcX"); if(x) x.onclick=function(){ if(!confirm(L2("Padam komitmen ini?","Delete this commitment?"))) return; D.com=D.com.filter(function(y){ return y.id!==id; }); sv(); H.closeOverlay(); draw(); };
}
function pEdit(id){
  var p=id?byId(D.plans,id):{name:"",target:"",by:"",saved:0,inb:true};
  var ov=H.showSheet("🎯 "+L2("Rancangan","Plan"),
    fld("ppN",L2("Rancangan","Plan"),p.name,"text",' placeholder="'+L2("cth. Umrah keluarga","e.g. Family umrah")+'"')+
    '<div class="chips">'+[["Haji","Hajj"],["Umrah","Umrah"],["Rumah","House"],["Kahwin","Marriage"],["Pendidikan anak","Children's education"],["Dana kecemasan","Emergency fund"],["Korban & aqiqah","Korban & aqiqah"]].map(function(x){ return '<button class="chip" data-ppn="'+E(L2(x[0],x[1]))+'">'+E(L2(x[0],x[1]))+'</button>'; }).join("")+'</div>'+
    '<div class="f2">'+fld("ppT",L2("Sasaran","Target")+" ("+CUR+")",p.target,"number",' inputmode="decimal" min="0"')+fld("ppB",L2("Sasaran tarikh","Target date"),p.by,"date")+'</div>'+
    fld("ppS",L2("Sudah disimpan","Saved so far")+" ("+CUR+")",p.saved||0,"number",' inputmode="decimal" min="0"')+
    (id?'<div class="f2">'+fld("ppAdd",L2("Tambah simpanan","Add savings")+" ("+CUR+")","","number",' inputmode="decimal" min="0"')+'<button class="btn alt g3d" id="ppPlus" style="align-self:flex-end;margin:6px 0">＋</button></div>':'')+
    '<label class="set"><span>'+L2("Masukkan dalam bajet bulanan (komitmen)","Count it in the monthly budget")+'</span><span class="switch sm"><input type="checkbox" id="ppI" '+(p.inb?"checked":"")+'><span></span></span></label>'+
    '<button class="btn gold full g3d" id="ppOk" style="margin-top:10px">✓ '+L2("Simpan","Save")+'</button>'+(id?'<button class="btn alt full g3d" id="ppX" style="margin-top:6px">🗑 '+L2("Padam","Delete")+'</button>':''));
  ov.querySelectorAll("[data-ppn]").forEach(function(b){ b.onclick=function(){ ov.querySelector("#ppN").value=b.getAttribute("data-ppn"); }; });
  var pl=ov.querySelector("#ppPlus"); if(pl) pl.onclick=function(){ var a=num(ov.querySelector("#ppAdd").value); if(a){ ov.querySelector("#ppS").value=Math.round((num(ov.querySelector("#ppS").value)+a)*100)/100; ov.querySelector("#ppAdd").value=""; } };
  ov.querySelector("#ppOk").onclick=function(){ var n=ov.querySelector("#ppN").value.trim(), t=num(ov.querySelector("#ppT").value); if(!n||t<=0){ H.toast(L2("Isi nama dan sasaran","Fill in a name and target")); return; }
    p.name=n; p.target=t; p.by=ov.querySelector("#ppB").value; p.saved=num(ov.querySelector("#ppS").value); p.inb=ov.querySelector("#ppI").checked;
    if(!id){ p.id=uid(); D.plans.push(p); } if(p.saved>=p.target) H.toast(L2("Sasaran tercapai. Alhamdulillah!","Target reached. Alhamdulillah!")); sv(); H.closeOverlay(); draw(); };
  var x=ov.querySelector("#ppX"); if(x) x.onclick=function(){ if(!confirm(L2("Padam rancangan ini?","Delete this plan?"))) return; D.plans=D.plans.filter(function(y){ return y.id!==id; }); sv(); H.closeOverlay(); draw(); };
}

// ================= ZAKAT log =================
var ZT=[["pendapatan","💼","Pendapatan","Income"],["simpanan","🏦","Simpanan","Savings"],["emas","🪙","Emas & perak","Gold & silver"],["niaga","🏪","Perniagaan","Business"],["saham","📈","Saham & pelaburan","Shares & investments"],["kwsp","🧓","KWSP","EPF"],["tani","🌾","Pertanian & ternakan","Crops & livestock"],["fitrah","🍚","Zakat fitrah","Zakat fitrah"],["lain","•","Lain-lain","Others"]];
var ZTO=["LZS (Selangor)","PPZ-MAIWP (WP)","MAIJ (Johor)","PZNS (N. Sembilan)","ZPP (P. Pinang)","MAIK (Kelantan)","PUZ (Kedah)","MAIDAM (Terengganu)","PKZ (Pahang)","MAIPk (Perak)","PZM (Melaka)","LZNK (Kedah)","MAIS (Sarawak)","PZS (Sabah)","MAIPs (Perlis)"];
/* 0.6.3 Phase 2: a general zakat mode when the money is not in ringgit (abroad or in Arabic): no Malaysian zakat centres, no KWSP or LHDN,
   and a simple calculator: zakatable wealth held a lunar year, less debts due now; if it reaches the nisab (85 g gold, or 595 g silver), 2.5% is due. */
function zGen(){ return CUR!=="RM"; }
function zTypes(){ return zGen() ? ZT.filter(function(x){ return x[0]!=="kwsp"; }) : ZT; }
function zCalcHtml(){ var c=H.load("ihsan_zcalc",{})||{}, v=function(k){ return c[k]==null?"":c[k]; };
  return '<details class="card zcalc"'+(c.open?' open':'')+'><summary><b>🧮 '+L2("Kira zakat harta","Work out zakat on wealth")+'</b></summary>'+
    '<div class="mut tiny" style="margin:6px 0">'+L2("Harta yang cukup setahun hijrah. Masukkan dalam ","Wealth held for a full lunar year. Amounts in ")+CUR+'.</div>'+
    '<div class="f2">'+fld("zcC",L2("Tunai & simpanan","Cash & savings"),v("c"),"number",' inputmode="decimal"')+fld("zcG",L2("Emas & perak (nilai)","Gold & silver (value)"),v("g"),"number",' inputmode="decimal"')+'</div>'+
    '<div class="f2">'+fld("zcB",L2("Barang niaga","Business goods"),v("b"),"number",' inputmode="decimal"')+fld("zcI",L2("Saham & pelaburan","Shares & investments"),v("i"),"number",' inputmode="decimal"')+'</div>'+
    '<div class="f2">'+fld("zcO",L2("Hutang orang kepada anda (boleh dituntut)","Money owed to you (recoverable)"),v("o"),"number",' inputmode="decimal"')+fld("zcD",L2("Hutang yang perlu dibayar sekarang","Debts due now"),v("d"),"number",' inputmode="decimal"')+'</div>'+
    '<div class="f2">'+fld("zcP",L2("Harga emas 1 g","Gold price per gram"),v("p"),"number",' inputmode="decimal"')+'<label class="fl">'+L2("Nisab ikut","Nisab by")+'<select id="zcN"><option value="g"'+(c.n!=="s"?" selected":"")+'>'+L2("Emas 85 g","Gold 85 g")+'</option><option value="s"'+(c.n==="s"?" selected":"")+'>'+L2("Perak 595 g","Silver 595 g")+'</option></select></label></div>'+
    (c.n==="s"?fld("zcS",L2("Harga perak 1 g","Silver price per gram"),v("s"),"number",' inputmode="decimal"'):'')+
    '<div class="zcOut" id="zcOut"></div><div class="mut tiny">'+L2("Panduan umum sahaja. Zakat pendapatan, pertanian dan ternakan ada kaedah sendiri; rujuk pihak berkuasa zakat di negara anda.","A general guide only. Zakat on income, crops and livestock has its own rules; ask the zakat authority in your country.")+'</div></details>'; }
function zCalcBind(el){ var box=el.querySelector(".zcalc"); if(!box) return; var c=H.load("ihsan_zcalc",{})||{};
  var num=function(id){ var e=box.querySelector(id); return e?(+e.value||0):0; };
  var calc=function(){ c={c:num("#zcC")||"",g:num("#zcG")||"",b:num("#zcB")||"",i:num("#zcI")||"",o:num("#zcO")||"",d:num("#zcD")||"",p:num("#zcP")||"",s:num("#zcS")||c.s||"",n:(box.querySelector("#zcN")||{}).value||"g",open:box.open}; H.save("ihsan_zcalc",c);
    var w=(+c.c||0)+(+c.g||0)+(+c.b||0)+(+c.i||0)+(+c.o||0)-(+c.d||0), nis=c.n==="s"?595*(+c.s||0):85*(+c.p||0), out=box.querySelector("#zcOut");
    if(!nis){ out.innerHTML='<div class="mut small">'+L2("Masukkan harga emas (atau perak) untuk nisab.","Enter the gold (or silver) price for the nisab.")+'</div>'; return; }
    var due=w>=nis?w*0.025:0;
    out.innerHTML='<div class="zcRow"><span>'+L2("Harta bersih","Net wealth")+'</span><b>'+rm(Math.max(0,w))+'</b></div><div class="zcRow"><span>'+L2("Nisab","Nisab")+'</span><b>'+rm(nis)+'</b></div>'+
      '<div class="zcDue'+(due?' on':'')+'">'+(due?L2("Zakat wajib (2.5%): ","Zakat due (2.5%): ")+'<b>'+rm(due)+'</b>':L2("Belum cukup nisab: tiada zakat harta.","Below the nisab: no zakat on wealth."))+'</div>'+
      (due?'<button class="btn gold full g3d" id="zcRec">＋ '+L2("Rekod bayaran ini","Record this payment")+'</button>':'');
    var rb=out.querySelector("#zcRec"); if(rb) rb.onclick=function(){ zEdit(null, {t:"simpanan", amt:(Math.round(due*100)/100).toFixed(2)}); }; };
  box.querySelectorAll("input").forEach(function(i){ i.oninput=calc; }); var sn=box.querySelector("#zcN"); if(sn) sn.onchange=function(){ calc(); draw(); };
  box.addEventListener("toggle", function(){ c.open=box.open; H.save("ihsan_zcalc",c); }); calc(); }
function zt(k){ for(var i=0;i<ZT.length;i++) if(ZT[i][0]===k) return ZT[i]; return ZT[ZT.length-1]; }
function zYear(z){ return +String(z.d||"").slice(0,4)||new Date().getFullYear(); }
function hYear(z){ try{ var h=H.hijri(pd(z.d)); return h?h.y:""; }catch(e){ return ""; } }
function vZakat(el){
  var yrs={}, cy=new Date().getFullYear(); yrs[cy]=0; D.zakat.forEach(function(z){ yrs[zYear(z)]=(yrs[zYear(z)]||0)+z.amt; });
  var ys=Object.keys(yrs).map(Number).sort(function(a,b){ return b-a; }); if(st.zy===null||ys.indexOf(st.zy)<0) st.zy=cy;
  var all=D.zakat.reduce(function(a,z){ return a+z.amt; },0), li=D.zakat.filter(function(z){ return zYear(z)===st.zy; }).sort(function(a,b){ return String(b.d).localeCompare(String(a.d)); });
  var byT={}; li.forEach(function(z){ byT[z.t]=(byT[z.t]||0)+z.amt; }); var mx=Math.max.apply(null,[1].concat(Object.keys(byT).map(function(k){ return byT[k]; })));
  var h='<div class="card fsum"><div><small>'+L2("Tahun ","Year ")+st.zy+'</small><b class="fpos">'+rm(yrs[st.zy]||0)+'</b></div><div><small>'+L2("Sepanjang masa","All time")+'</small><b>'+rm(all)+'</b></div></div>';
  h+='<div class="chips fseg">'+ys.map(function(y){ return '<button class="chip g3d'+(y===st.zy?" on":"")+'" data-zy="'+y+'">'+y+' <small>'+(yrs[y]?rm(yrs[y]).replace(CUR+" ",""):"–")+'</small></button>'; }).join("")+'</div>';
  h+='<button class="btn gold full g3d" id="fzAdd">＋ '+L2("Rekod bayaran zakat","Record a zakat payment")+'</button>';
  if(zGen()) h+=zCalcHtml();
  if(Object.keys(byT).length) h+='<div class="card"><h3>'+L2("Mengikut jenis","By type")+'</h3>'+Object.keys(byT).sort(function(a,b){ return byT[b]-byT[a]; }).map(function(k){ var t=zt(k); return '<div class="fzb"><span>'+t[1]+' '+L2(t[2],t[3])+'</span><b>'+rm(byT[k])+'</b><i style="width:'+Math.round(byT[k]*100/mx)+'%"></i></div>'; }).join("")+'</div>';
  h+=li.length?'<div class="card flist">'+li.map(function(z){ var t=zt(z.t); return '<button class="frow fbtn" data-zop="'+z.id+'">'+(z.th&&z.th[0]?'<img class="fth" src="'+z.th[0]+'" alt="">':'<span class="fic">'+t[1]+'</span>')+'<span class="fmain"><b>'+L2(t[2],t[3])+'</b><small>'+dstr(z.d)+(z.to?' · '+E(z.to):'')+(z.ref?' · #'+E(z.ref):'')+((z.ph||[]).length?' · 🧾 '+z.ph.length:'')+'</small></span><span class="famt fpos">'+rm(z.amt)+'</span></button>'; }).join("")+
      '<div class="ftot"><span>'+L2("Jumlah ","Total ")+st.zy+' ('+li.length+')</span><b>'+rm(yrs[st.zy]||0)+'</b></div></div><button class="btn alt full g3d" id="fzShare">📤 '+L2("Kongsi ringkasan tahun ini","Share this year's summary")+'</button>'
    :'<div class="card mut small">'+L2("Tiada rekod zakat untuk ","No zakat records for ")+st.zy+'. '+(zGen()?L2("Simpan resit sebagai bukti.","Keep the receipts as proof."):L2("Simpan resit untuk tuntutan rebat cukai pendapatan (LHDN).","Keep receipts to claim the income tax rebate (LHDN)."))+'</div>';
  h+='<div class="card mut tiny">'+(zGen()?L2("Rekod bayaran dan kiraan umum. Untuk kes anda, rujuk pihak berkuasa zakat di negara anda.","Payment records and a general calculation. For your own case, ask the zakat authority in your country."):L2("Ini rekod bayaran sahaja, bukan kalkulator zakat. Untuk kiraan, rujuk pusat zakat negeri anda.","This is a payment record only, not a zakat calculator. For the amount due, ask your state zakat centre."))+'</div>';
  h+=ayat(["9:103","2:43"]);
  el.innerHTML=h;
  el.querySelectorAll("[data-zy]").forEach(function(b){ b.onclick=function(){ st.zy=+b.getAttribute("data-zy"); draw(); }; }); zCalcBind(el);
  el.querySelector("#fzAdd").onclick=function(){ zEdit(null); };
  el.querySelectorAll("[data-zop]").forEach(function(b){ b.onclick=function(){ zOpen(b.getAttribute("data-zop")); }; });
  var s=el.querySelector("#fzShare"); if(s) s.onclick=function(){ share(L2("Rekod zakat ","Zakat record ")+st.zy+"\n"+li.map(function(z){ var t=zt(z.t); return "• "+dstr(z.d)+" "+L2(t[2],t[3])+(z.to?" ("+z.to+")":"")+(z.ref?" #"+z.ref:"")+": "+rm(z.amt); }).join("\n")+"\n"+L2("Jumlah: ","Total: ")+rm(yrs[st.zy]||0)); };
}
// receipt photos: full image in an app file, a small thumbnail in the record
function imgPut(id, data){ if(window.Native && H.N.qWrite) H.N.qWrite("fin/"+id+".txt", data); else H.save("ihsan_finimg_"+id, data); }
function imgGet(id){ if(window.Native && H.N.qRead){ try{ return H.N.qRead("fin/"+id+".txt")||""; }catch(e){ return ""; } } return H.load("ihsan_finimg_"+id,""); }
function imgDel(id){ if(window.Native && H.N.qDelete) try{ H.N.qDelete("fin/"+id+".txt"); }catch(e){} else try{ localStorage.removeItem("ihsan_finimg_"+id); }catch(e){} }
function shrink(data, max, q, cb){ var im=new Image(); im.onload=function(){ var s=Math.min(1,max/Math.max(im.width,im.height)), c=document.createElement("canvas"); c.width=Math.round(im.width*s); c.height=Math.round(im.height*s); c.getContext("2d").drawImage(im,0,0,c.width,c.height); cb(c.toDataURL("image/jpeg",q)); }; im.onerror=function(){ cb(null); }; im.src=data; }
function pickImg(mode, cb){
  var N=H.N, got=function(d){ if(!d) return; shrink(d,1400,0.72,function(full){ shrink(d,160,0.6,function(th){ if(full) cb(full,th); else H.toast(L2("Gambar tidak dapat dibuka","The image could not be opened")); }); }); };
  if(window.Native && N.pickImage){ var go=function(){ var h=function(r){ H.off("image",h); if(r.cancel) return; if(r.error||!r.data){ H.toast(L2("Gambar tidak dapat dibuka","The image could not be opened")); return; } got(r.data); }; H.on("image",h); N.pickImage(mode); };
    if(mode==="camera" && !N.hasPerm("camera")){ var hp=function(p){ if(p.which!=="camera") return; H.off("perm",hp); if(p.granted) go(); }; H.on("perm",hp); N.requestPerm("camera"); } else go(); return; }
  var inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; if(mode==="camera") inp.setAttribute("capture","environment");
  inp.onchange=function(){ var f=inp.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ got(r.result); }; r.readAsDataURL(f); }; inp.click();
}
function zEdit(id, pre){
  var z=id?JSON.parse(JSON.stringify(byId(D.zakat,id))):{t:"pendapatan",amt:"",d:ymd(new Date()),to:"",ref:"",note:"",ph:[],th:[]}, add=[]; if(pre) for(var pk in pre) z[pk]=pre[pk]; var t=z.t;
  var body=function(){ return '<div class="snl">'+L2("Jenis zakat","Type of zakat")+'</div><div class="chips fseg" id="fzT">'+zTypes().map(function(x){ return '<button class="chip'+(t===x[0]?" on":"")+'" data-v="'+x[0]+'">'+x[1]+' '+L2(x[2],x[3])+'</button>'; }).join("")+'</div>'+
    '<div class="f2">'+fld("fzA",L2("Jumlah","Amount")+" ("+CUR+")",z.amt,"number",' inputmode="decimal" step="0.01" min="0"')+fld("fzD",L2("Tarikh bayar","Date paid"),z.d,"date")+'</div>'+
    fld("fzO",L2("Dibayar kepada","Paid to"),z.to,"text",' list="fzOl"')+'<datalist id="fzOl">'+(zGen()?[]:ZTO).map(function(o){ return '<option value="'+E(o)+'">'; }).join("")+'</datalist>'+
    '<div class="f2">'+fld("fzR",L2("No. resit","Receipt no."),z.ref)+fld("fzN",L2("Nota","Note"),z.note)+'</div>'+
    '<div class="snl">🧾 '+L2("Resit","Receipts")+'</div><div class="fphs">'+z.th.map(function(s,i){ return '<span class="fph"><img src="'+s+'" alt=""><button data-zpx="'+i+'">✕</button></span>'; }).join("")+'<button class="fphadd" data-zpk="camera">📷<small>'+L2("Kamera","Camera")+'</small></button><button class="fphadd" data-zpk="gallery">🖼<small>'+L2("Galeri","Gallery")+'</small></button></div>'+
    '<button class="btn gold full g3d" id="fzOk" style="margin-top:12px">✓ '+L2("Simpan","Save")+'</button>'; };
  var ov=H.showSheet((id?"✎ ":"＋ ")+"Zakat", body());
  var keep=function(){ var g=function(i){ var e=ov.querySelector(i); return e?e.value:""; }; z.amt=g("#fzA"); z.d=g("#fzD"); z.to=g("#fzO"); z.ref=g("#fzR"); z.note=g("#fzN"); };
  var bind=function(){
    ov.querySelectorAll("#fzT [data-v]").forEach(function(b){ b.onclick=function(){ t=b.getAttribute("data-v"); ov.querySelectorAll("#fzT [data-v]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
    ov.querySelectorAll("[data-zpk]").forEach(function(b){ b.onclick=function(){ keep(); pickImg(b.getAttribute("data-zpk"), function(full, th){ var pid=uid(); add.push([pid,full]); z.ph.push(pid); z.th.push(th); var sh=ov.querySelector(".shb"); sh.innerHTML=body(); bind(); }); }; });
    ov.querySelectorAll("[data-zpx]").forEach(function(b){ b.onclick=function(){ keep(); var i=+b.getAttribute("data-zpx"); z.ph.splice(i,1); z.th.splice(i,1); ov.querySelector(".shb").innerHTML=body(); bind(); }; });
    ov.querySelector("#fzOk").onclick=function(){ keep(); var a=num(z.amt); if(a<=0){ H.toast(L2("Isi jumlah","Fill in the amount")); return; }
      add.forEach(function(p){ if(z.ph.indexOf(p[0])>=0) imgPut(p[0],p[1]); });
      z.t=t; z.amt=a; z.d=z.d||ymd(new Date());
      if(id){ var o=byId(D.zakat,id); (o.ph||[]).forEach(function(pid){ if(z.ph.indexOf(pid)<0) imgDel(pid); }); for(var k in z) o[k]=z[k]; } else { z.id=uid(); D.zakat.push(z); }
      st.zy=zYear(z); sv(); H.closeOverlay(); draw(); };
  };
  bind();
}
function zOpen(id){
  var z=byId(D.zakat,id); if(!z) return; var t=zt(z.t), hy=hYear(z);
  var ov=H.showSheet(t[1]+" "+L2(t[2],t[3]), '<div class="card fsum"><div><small>'+dstr(z.d)+(hy?' · '+hy+'H':'')+'</small><b class="fpos">'+rm(z.amt)+'</b></div></div>'+
    '<div class="small">'+(z.to?L2("Dibayar kepada: ","Paid to: ")+E(z.to)+'<br>':'')+(z.ref?L2("No. resit: ","Receipt no.: ")+E(z.ref)+'<br>':'')+(z.note?E(z.note):'')+'</div>'+
    '<div class="fphv">'+(z.ph||[]).map(function(pid,i){ return '<img data-zpi="'+i+'" src="'+((z.th||[])[i]||"")+'" alt="">'; }).join("")+'</div>'+
    '<div class="btns" style="margin-top:10px"><button class="btn alt g3d" id="fzE">✎ '+L2("Ubah","Edit")+'</button><button class="btn alt g3d" id="fzX">🗑 '+L2("Padam","Delete")+'</button></div>');
  // load the full receipt images
  setTimeout(function(){ ov.querySelectorAll("[data-zpi]").forEach(function(im){ var d=imgGet(z.ph[+im.getAttribute("data-zpi")]); if(d) im.src=d; im.onclick=function(){ zFull(im.src); }; }); }, 30);
  ov.querySelector("#fzE").onclick=function(){ zEdit(id); };
  ov.querySelector("#fzX").onclick=function(){ if(!confirm(L2("Padam rekod zakat ini dan resitnya?","Delete this zakat record and its receipts?"))) return; (z.ph||[]).forEach(imgDel); D.zakat=D.zakat.filter(function(y){ return y.id!==id; }); sv(); H.closeOverlay(); draw(); };
}
function zFull(src){ if(window.IbView){ IbView(src); return; } var d=document.createElement("div"); d.className="fzfull"; d.innerHTML='<img src="'+src+'" alt=""><button>✕</button>'; d.onclick=function(){ d.remove(); }; document.body.appendChild(d); }

// ================= view =================
var host=null;
function draw(){ if(!host || !document.body.contains(host)) return; var y=document.getElementById("view").scrollTop; render(host); document.getElementById("view").scrollTop=y; }
function render(el){ ld(); var f={hutang:vHutang, komitmen:vKomitmen, zakat:vZakat}[pg]; if(window.FinMore && FinMore[pg]) f=function(e){ FinMore[pg](e, api()); }; (f||vHutang)(el); }
function api(){ return {H:H, D:D, sv:sv, draw:draw, rm:rm, num:num, uid:uid, ymd:ymd, pd:pd, dstr:dstr, fld:fld, seg:seg, share:share, byId:byId, today:today, days:days, ayat:ayat, AY:AY, st:st}; }
window.FinView=function(el, page, h){ H=h; L2=h.L2x; E=h.esc; if(h.cur) CUR=h.cur(); /* 0.6.3: RM in Malaysia, the local currency abroad or in Arabic */ pg=page||"hutang"; host=el; el.classList.add("finv"); render(el); };
window.FinUI={fld:function(){ return fld.apply(null,arguments); }, seg:function(){ return seg.apply(null,arguments); }, ayat:function(r,x){ return ayat(r,x); }, AY:AY, setH:function(h){ if(!H){ H=h; L2=h.L2x; E=h.esc; } }};
window.FinView.data=function(h){ H=H||h; L2=L2||h.L2x; E=E||h.esc; ld(); return D; };
})();
