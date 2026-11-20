/* My Ihsan 0.22.0: Wasiat planner (Kewangan › Wasiat) with assets & liabilities (idea 92), bequest up to 1/3,
   executor & guardian, wishes, a faraid calculator (idea 91, Shafi'i, common cases) and a printable draft.
   Data lives in ihsan_fin.wasiat. It is a planning aid, not a legal document: a valid wasiat in Malaysia is made
   with witnesses and is best registered with an amanah/wasiat body (Amanah Raya, ARB, as-Salihin, Wasiyyah Shoppe, etc.). */
(function(){
"use strict";
var A, H, L2, E, W, sec="aset";
var ACAT=[["hartanah","🏠","Rumah & tanah","Property & land"],["bank","🏦","Akaun bank","Bank accounts"],["asb","💹","ASB / Tabung Haji / unit amanah","ASB / Tabung Haji / unit trusts"],["kwsp","🧓","KWSP","EPF"],["takaful","🛡","Takaful & insurans","Takaful & insurance"],["kenderaan","🚗","Kenderaan","Vehicles"],["emas","🪙","Emas & barang kemas","Gold & jewellery"],["saham","📈","Saham & pelaburan","Shares & investments"],["niaga","🏪","Perniagaan","Business"],["digital","💻","Akaun digital & e-dompet","Digital accounts & e-wallets"],["piutang","🤝","Hutang orang kepada saya","Money owed to me"],["lain","•","Lain-lain","Others"]];
function ac(k){ for(var i=0;i<ACAT.length;i++) if(ACAT[i][0]===k) return ACAT[i]; return ACAT[ACAT.length-1]; }
function wd(){ var D=A.D; if(!D.wasiat) D.wasiat={}; W=D.wasiat; ["assets","liab","beq","wit","msgs"].forEach(function(k){ if(!Array.isArray(W[k])) W[k]=[]; }); W.me=W.me||{sex:"m"}; W.heirs=W.heirs||{}; W.wasi=W.wasi||{}; W.wish=W.wish||{}; W.fun=W.fun==null?6000:W.fun; return W; }
function save(){ W.upd=A.ymd(new Date()); A.sv(); }

// estate: assets counted in the estate (EPF/takaful with a nominee and hibah are noted but kept out) minus debts and funeral costs
function totals(){
  var gross=0, out=0; W.assets.forEach(function(a){ if(a.ex) out+=+a.v||0; else gross+=+a.v||0; });
  var owe=A.D.debts.filter(function(x){ return !x.done && x.dir!=="owed"; }).reduce(function(s,x){ var p=(x.pays||[]).reduce(function(a,b){ return a+(+b.amt||0); },0); return s+Math.max(0,x.amt-p); },0);
  var lia=W.liab.reduce(function(s,x){ return s+(+x.v||0); },0), fun=+W.fun||0;
  var net=Math.max(0, gross-owe-lia-fun), third=net/3;
  var beq=W.beq.reduce(function(s,b){ return s+(b.pc?net*b.pc/100:(+b.v||0)); },0);
  var rest=Math.max(0, net-Math.min(beq,third));
  return {gross:gross,out:out,owe:owe,lia:lia,fun:fun,net:net,third:third,beq:beq,rest:rest};
}

// ================= FARAID (Shafi'i; common cases) =================
var HK=[["husband","Suami","Husband",1],["wife","Isteri","Wife",4],["son","Anak lelaki","Son",20],["dau","Anak perempuan","Daughter",20],["ss","Cucu lelaki (dari anak lelaki)","Son's son",20],["sd","Cucu perempuan (dari anak lelaki)","Son's daughter",20],
  ["father","Bapa","Father",1],["mother","Ibu","Mother",1],["gf","Datuk (bapa kepada bapa)","Paternal grandfather",1],["gm","Nenek","Grandmother",2],
  ["fb","Adik-beradik lelaki seibu sebapa","Full brother",15],["fs","Adik-beradik perempuan seibu sebapa","Full sister",15],["pb","Adik-beradik lelaki sebapa","Paternal half-brother",15],["ps","Adik-beradik perempuan sebapa","Paternal half-sister",15],
  ["ms","Adik-beradik seibu (lelaki/perempuan)","Maternal half-siblings",15],["oa","Asabah lain (anak saudara lelaki, bapa saudara, sepupu lelaki)","Other male relatives (nephew, uncle, cousin)",1]];
function faraid(hs, sex){
  var n=function(k){ return Math.max(0, +hs[k]||0); };
  if(sex==="m") hs.husband=0; else hs.wife=0;
  var s=n("son"), d=n("dau"), ss=s?0:n("ss"), sd=s?0:n("sd"), F=n("father"), M=n("mother"), GF=F?0:n("gf"), GM=M?0:n("gm");
  var maleDesc=s+ss>0, desc=s+d+ss+sd>0, femDesc=d+sd>0;
  var sibBlocked=maleDesc||F>0, warn=[];
  if(GF && (n("fb")+n("fs")+n("pb")+n("ps"))>0 && !sibBlocked){ warn.push(L2("Datuk bersama adik-beradik (muqasamah) tidak dikira di sini. Rujuk Mahkamah Syariah atau ustaz.","Grandfather with siblings (muqasamah) is not worked out here. Ask the Syariah Court or an ustaz.")); sibBlocked=true; }
  var fb=sibBlocked?0:n("fb"), fs=sibBlocked?0:n("fs"), pb=sibBlocked?0:n("pb"), ps=sibBlocked?0:n("ps"), ms=(desc||F||GF)?0:n("ms");
  var sibAll=n("fb")+n("fs")+n("pb")+n("ps")+n("ms");
  var R=[], fard=0, add=function(k,cnt,fr,lab){ if(cnt>0 && fr>0){ R.push({k:k,n:cnt,fr:fr,lab:lab}); fard+=fr; } };
  var H2=n("husband"), Wv=Math.min(4,n("wife"));
  if(H2) add("husband",1,desc?1/4:1/2,desc?"1/4":"1/2");
  if(Wv) add("wife",Wv,desc?1/8:1/4,desc?"1/8":"1/4");
  var spouse=H2?(desc?1/4:1/2):Wv?(desc?1/8:1/4):0;
  // mother (with 'umariyyatan)
  if(M){ if(desc || sibAll>=2) add("mother",1,1/6,"1/6"); else if((F) && spouse && !GF) add("mother",1,(1-spouse)/3,L2("1/3 baki","1/3 of rest")); else add("mother",1,1/3,"1/3"); }
  else if(GM) add("gm",GM,1/6,"1/6");
  var dad=F?"father":GF?"gf":null;
  if(dad && desc) add(dad,1,1/6,"1/6");
  // daughters / son's daughters
  if(!s && d){ add("dau",d,d===1?1/2:2/3,d===1?"1/2":"2/3"); }
  if(!s && !ss && sd){ if(d===0) add("sd",sd,sd===1?1/2:2/3,sd===1?"1/2":"2/3"); else if(d===1) add("sd",sd,1/6,"1/6"); }
  // maternal siblings
  if(ms) add("ms",ms,ms===1?1/6:1/3,ms===1?"1/6":"1/3");
  // full / paternal sisters as fard
  var fsAsabah=false, psAsabah=false;
  if(fs && !fb){ if(femDesc) fsAsabah=true; else add("fs",fs,fs===1?1/2:2/3,fs===1?"1/2":"2/3"); }
  if(ps && !pb && !fb && !fsAsabah){ if(fs===0){ if(femDesc) psAsabah=true; else add("ps",ps,ps===1?1/2:2/3,ps===1?"1/2":"2/3"); } else if(fs===1) add("ps",ps,1/6,"1/6"); }
  // residue (asabah), nearest first
  var aw=false; if(fard>1){ aw=true; var t=fard; R.forEach(function(r){ r.fr=r.fr/t; }); fard=1; }
  var rest=Math.max(0,1-fard), asb=null;
  var both=function(mk,mn,fk,fn){ var u=mn*2+fn; if(u<=0) return false; if(mn) R.push({k:mk,n:mn,fr:rest*mn*2/u,lab:L2("Asabah","Residue")}); if(fn) R.push({k:fk,n:fn,fr:rest*fn/u,lab:L2("Asabah (2:1)","Residue (2:1)")}); return true; };
  if(rest>1e-9){
    if(s) asb=both("son",s,"dau",d);
    else if(ss) asb=both("ss",ss,"sd",sd);
    else if(dad){ var r0=R.filter(function(r){ return r.k===dad; })[0]; if(r0){ r0.fr+=rest; r0.lab+=" + "+L2("baki","rest"); } else R.push({k:dad,n:1,fr:rest,lab:L2("Asabah","Residue")}); asb=true; }
    else if(fb){ // musyarakah: husband + mother/grandmother + 2+ maternal siblings leave nothing for full brothers
      asb=both("fb",fb,"fs",fs); }
    else if(fsAsabah){ R.push({k:"fs",n:fs,fr:rest,lab:L2("Asabah ma'al ghair","Residue (with daughters)")}); asb=true; }
    else if(pb) asb=both("pb",pb,"ps",ps);
    else if(psAsabah){ R.push({k:"ps",n:ps,fr:rest,lab:L2("Asabah ma'al ghair","Residue (with daughters)")}); asb=true; }
    else if(n("oa")){ R.push({k:"oa",n:1,fr:rest,lab:L2("Asabah","Residue")}); asb=true; }
    if(!asb){ R.push({k:"bm",n:1,fr:rest,lab:L2("Baki","Remainder")}); warn.push(L2("Tiada asabah: baki pergi ke Baitulmal (amalan mazhab Syafi'i di Malaysia). Sesetengah negeri membuat radd kepada waris; semak dengan Mahkamah Syariah.","No residuary heir: the remainder goes to Baitulmal (Shafi'i practice in Malaysia). Some states return it to the heirs (radd); check with the Syariah Court.")); }
  } else if(fb && !s && !ss && !dad && ms>=2 && (M||GM) && H2){ warn.push(L2("Kes musyarakah: dalam mazhab Syafi'i adik-beradik seibu sebapa berkongsi 1/3 dengan adik-beradik seibu. Sahkan dengan Mahkamah Syariah.","Musharakah case: in the Shafi'i school full siblings share the 1/3 with the maternal siblings. Confirm with the Syariah Court.")); }
  if(aw) warn.push(L2("Jumlah bahagian melebihi 1, jadi semua bahagian dikurangkan secara berkadar ('aul).","Shares add up to more than 1, so all are reduced in proportion ('awl)."));
  return {rows:R, warn:warn};
}
function hName(k){ if(k==="bm") return "Baitulmal"; for(var i=0;i<HK.length;i++) if(HK[i][0]===k) return L2(HK[i][1],HK[i][2]); return k; }

// ================= sections =================
function vAset(el, h){
  var T=totals();
  h+='<div class="card fsum"><div><small>'+L2("Harta (dalam pusaka)","Assets (in the estate)")+'</small><b class="fpos">'+A.rm(T.gross)+'</b></div><div><small>'+L2("Hutang & kos","Debts & costs")+'</small><b class="fneg">'+A.rm(T.owe+T.lia+T.fun)+'</b></div></div>';
  h+='<div class="card"><div class="row"><h3 style="margin:0">💼 '+L2("Senarai harta","Asset list")+'</h3><button class="chip g3d" id="waA">＋</button></div>'+
    (W.assets.length?'<div class="flist">'+W.assets.map(function(a,i){ var c=ac(a.c); return '<button class="frow fbtn" data-wa="'+i+'"><span class="fic">'+c[1]+'</span><span class="fmain"><b>'+E(a.n||L2(c[2],c[3]))+'</b><small>'+L2(c[2],c[3])+(a.loc?' · '+E(a.loc):'')+(a.nom?' · '+L2("Penama: ","Nominee: ")+E(a.nom):'')+(a.ex?' · '+L2("di luar pusaka","outside the estate"):'')+'</small></span><span class="famt">'+A.rm(a.v)+'</span></button>'; }).join("")+'</div>'
     :'<div class="mut small">'+L2("Senaraikan semua harta supaya waris tahu apa yang ada dan di mana: geran, akaun, ASB, Tabung Haji, KWSP, takaful, kenderaan, emas, kata laluan disimpan di mana.","List everything so your heirs know what exists and where: titles, accounts, ASB, Tabung Haji, EPF, takaful, vehicles, gold, where passwords are kept.")+'</div>')+
    (T.out?'<div class="mut tiny" style="margin-top:6px">'+L2("Di luar pusaka (penama/hibah): ","Outside the estate (nominee/hibah): ")+A.rm(T.out)+'</div>':'')+'</div>';
  h+='<div class="card"><div class="row"><h3 style="margin:0">📉 '+L2("Hutang & tanggungan","Debts & liabilities")+'</h3><button class="chip g3d" id="waL">＋</button></div>'+
    '<div class="frow"><span class="fmain"><b>🤝 '+L2("Dari halaman Hutang","From the Debts page")+'</b><small>'+L2("Hutang saya yang belum selesai","My unsettled debts")+'</small></span><span class="famt fneg">'+A.rm(T.owe)+'</span></div>'+
    W.liab.map(function(x,i){ return '<button class="frow fbtn" data-wl="'+i+'"><span class="fmain"><b>'+E(x.n)+'</b><small>'+E(x.note||"")+'</small></span><span class="famt fneg">'+A.rm(x.v)+'</span></button>'; }).join("")+
    '<div class="frow"><span class="fmain"><b>⚰ '+L2("Kos pengurusan jenazah (anggaran)","Funeral costs (estimate)")+'</b></span><input id="waF" type="number" inputmode="decimal" value="'+W.fun+'" style="width:110px;text-align:right;padding:6px;border-radius:8px;border:1px solid var(--line);background:var(--well);color:inherit"></div>'+
    '<div class="mut tiny">'+L2("Termasuk zakat, fidyah atau nazar yang belum ditunaikan: semuanya dibayar dahulu sebelum wasiat dan faraid.","Include unpaid zakat, fidyah or vows: all of these are paid first, before the wasiat and faraid.")+'</div></div>';
  h+='<div class="card fsum"><div><small>'+L2("Harta bersih","Net estate")+'</small><b>'+A.rm(T.net)+'</b></div><div><small>'+L2("Had wasiat (1/3)","Bequest limit (1/3)")+'</small><b class="fwarnc">'+A.rm(T.third)+'</b></div></div>';
  el.innerHTML=h+dock();
  el.querySelector("#waA").onclick=function(){ aEdit(-1); };
  el.querySelector("#waL").onclick=function(){ lEdit(-1); };
  el.querySelectorAll("[data-wa]").forEach(function(b){ b.onclick=function(){ aEdit(+b.getAttribute("data-wa")); }; });
  el.querySelectorAll("[data-wl]").forEach(function(b){ b.onclick=function(){ lEdit(+b.getAttribute("data-wl")); }; });
  el.querySelector("#waF").onchange=function(){ W.fun=A.num(this.value); save(); A.draw(); };
}
function aEdit(i){
  var a=i>=0?W.assets[i]:{c:"bank",n:"",v:"",loc:"",nom:"",ex:false,note:""}, c=a.c;
  var ov=H.showSheet((i>=0?"✎ ":"＋ ")+L2("Harta","Asset"),
    '<div class="chips fseg" id="waC">'+ACAT.map(function(x){ return '<button class="chip'+(c===x[0]?" on":"")+'" data-v="'+x[0]+'">'+x[1]+' '+L2(x[2],x[3])+'</button>'; }).join("")+'</div>'+
    A.fld("waN",L2("Nama / butiran","Name / details"),a.n,"text",' placeholder="'+L2("cth. Rumah teres Bangi, Maybank ...1234","e.g. Bangi terrace house, Maybank ...1234")+'"')+
    '<div class="f2">'+A.fld("waV",L2("Anggaran nilai (RM)","Estimated value (RM)"),a.v,"number",' inputmode="decimal" min="0"')+A.fld("waP",L2("Penama / penerima hibah","Nominee / hibah recipient"),a.nom)+'</div>'+
    A.fld("waLc",L2("Di mana dokumen / no. akaun","Where the papers are / account no."),a.loc)+
    '<label class="set"><span>'+L2("Di luar pusaka (penama KWSP/takaful, hibah, harta sepencarian dituntut)","Outside the estate (EPF/takaful nominee, hibah, jointly-earned share)")+'</span><span class="switch sm"><input type="checkbox" id="waX" '+(a.ex?"checked":"")+'><span></span></span></label>'+
    A.fld("waO",L2("Nota","Note"),a.note)+
    '<button class="btn gold full g3d" id="waOk" style="margin-top:10px">✓ '+L2("Simpan","Save")+'</button>'+(i>=0?'<button class="btn alt full g3d" id="waD" style="margin-top:6px">🗑 '+L2("Padam","Delete")+'</button>':''));
  ov.querySelectorAll("#waC [data-v]").forEach(function(b){ b.onclick=function(){ c=b.getAttribute("data-v"); ov.querySelectorAll("#waC [data-v]").forEach(function(x){ x.classList.toggle("on",x===b); }); if((c==="kwsp"||c==="takaful") && ov.querySelector("#waP").value) ov.querySelector("#waX").checked=true; }; });
  ov.querySelector("#waOk").onclick=function(){ var g=function(s){ return ov.querySelector(s).value.trim(); }; a.c=c; a.n=g("#waN"); a.v=A.num(g("#waV")); a.nom=g("#waP"); a.loc=g("#waLc"); a.ex=ov.querySelector("#waX").checked; a.note=g("#waO");
    if(i<0) W.assets.push(a); save(); H.closeOverlay(); A.draw(); };
  var d=ov.querySelector("#waD"); if(d) d.onclick=function(){ if(!confirm(L2("Padam?","Delete?"))) return; W.assets.splice(i,1); save(); H.closeOverlay(); A.draw(); };
}
function lEdit(i){
  var x=i>=0?W.liab[i]:{n:"",v:"",note:""};
  var ov=H.showSheet(L2("Hutang / tanggungan","Debt / liability"), '<div class="chips">'+[["Pinjaman perumahan","Home loan"],["Pinjaman kereta","Car loan"],["PTPTN","PTPTN"],["Kad kredit","Credit card"],["Zakat belum dibayar","Unpaid zakat"],["Fidyah puasa","Fasting fidyah"],["Nazar","Vow (nazar)"]].map(function(p){ return '<button class="chip" data-ln="'+E(L2(p[0],p[1]))+'">'+E(L2(p[0],p[1]))+'</button>'; }).join("")+'</div>'+
    A.fld("wlN",L2("Perkara","Item"),x.n)+A.fld("wlV",L2("Jumlah (RM)","Amount (RM)"),x.v,"number",' inputmode="decimal" min="0"')+A.fld("wlO",L2("Nota (kepada siapa, no. akaun)","Note (to whom, account no.)"),x.note)+
    '<div class="mut tiny">'+L2("Pinjaman perumahan yang dilindungi MRTA/MRTT biasanya dilangsaikan oleh takaful: masukkan 0 atau nota.","A home loan covered by MRTA/MRTT is usually settled by takaful: enter 0 or a note.")+'</div>'+
    '<button class="btn gold full g3d" id="wlOk" style="margin-top:10px">✓ '+L2("Simpan","Save")+'</button>'+(i>=0?'<button class="btn alt full g3d" id="wlD" style="margin-top:6px">🗑 '+L2("Padam","Delete")+'</button>':''));
  ov.querySelectorAll("[data-ln]").forEach(function(b){ b.onclick=function(){ ov.querySelector("#wlN").value=b.getAttribute("data-ln"); }; });
  ov.querySelector("#wlOk").onclick=function(){ x.n=ov.querySelector("#wlN").value.trim(); x.v=A.num(ov.querySelector("#wlV").value); x.note=ov.querySelector("#wlO").value.trim(); if(!x.n) return; if(i<0) W.liab.push(x); save(); H.closeOverlay(); A.draw(); };
  var d=ov.querySelector("#wlD"); if(d) d.onclick=function(){ W.liab.splice(i,1); save(); H.closeOverlay(); A.draw(); };
}
function vBeq(el, h){
  var T=totals(), over=T.beq>T.third+0.005;
  h+='<div class="card fsum"><div><small>'+L2("Wasiat dirancang","Planned bequests")+'</small><b class="'+(over?"fneg":"fpos")+'">'+A.rm(T.beq)+'</b></div><div><small>'+L2("Had 1/3","1/3 limit")+'</small><b class="fwarnc">'+A.rm(T.third)+'</b></div></div>';
  if(T.net>0) h+='<div class="fbar"><i style="width:'+Math.min(100,Math.round(T.beq*100/Math.max(1,T.third)))+'%;background:'+(over?"#e0605a":"var(--gold)")+'"></i></div>';
  if(over) h+='<div class="card warnbox">⚠ '+L2("Melebihi 1/3 harta bersih. Lebihan hanya sah jika semua waris bersetuju selepas kematian.","More than 1/3 of the net estate. The excess is only valid if all heirs agree after the death.")+'</div>';
  h+='<div class="card"><div class="row"><h3 style="margin:0">📜 '+L2("Wasiat (1/3)","Bequests (1/3)")+'</h3><button class="chip g3d" id="wbA">＋</button></div>'+
    (W.beq.length?'<div class="flist">'+W.beq.map(function(b,i){ return '<button class="frow fbtn" data-wb="'+i+'"><span class="fmain"><b>'+E(b.to)+'</b><small>'+E(b.what||"")+(b.heir?' · ⚠ '+L2("waris","heir"):'')+'</small></span><span class="famt">'+(b.pc?b.pc+"%":A.rm(b.v))+'</span></button>'; }).join("")+'</div>'
     :'<div class="mut small">'+L2("Wasiat untuk bukan waris: masjid, wakaf, sekolah tahfiz, rumah anak yatim, anak angkat, anak tiri, cucu yang terhalang, pembantu. Hadnya 1/3 harta bersih.","Bequests to non-heirs: a mosque, waqf, a tahfiz school, an orphanage, an adopted child, a stepchild, a blocked grandchild, a helper. The limit is 1/3 of the net estate.")+'</div>')+'</div>';
  h+='<div class="card"><h3>👤 '+L2("Wasi (pentadbir) & penjaga","Executor & guardian")+'</h3>'+
    A.fld("wsW",L2("Wasi / pelaksana wasiat","Executor"),W.wasi.ex||"")+A.fld("wsW2",L2("Wasi ganti","Alternate executor"),W.wasi.ex2||"")+
    A.fld("wsG",L2("Penjaga anak di bawah umur (selain bapa/datuk)","Guardian for minor children (if father/grandfather cannot)"),W.wasi.gd||"")+
    A.fld("wsD",L2("Dokumen asal disimpan di","Original documents are kept at"),W.wasi.docs||"")+'</div>';
  h+='<div class="card"><div class="row"><h3 style="margin:0">✍ '+L2("Saksi (2 orang)","Witnesses (2)")+'</h3></div>'+[0,1].map(function(i){ var w=W.wit[i]||{}; return '<div class="f2">'+A.fld("wt"+i+"n",L2("Nama saksi ","Witness name ")+(i+1),w.n||"")+A.fld("wt"+i+"i",L2("No. KP","IC no."),w.ic||"")+'</div>'; }).join("")+
    '<div class="mut tiny">'+L2("Saksi sebaiknya bukan penerima wasiat.","Witnesses should not be beneficiaries.")+'</div></div>';
  el.innerHTML=h+dock();
  el.querySelector("#wbA").onclick=function(){ bEdit(-1); };
  el.querySelectorAll("[data-wb]").forEach(function(b){ b.onclick=function(){ bEdit(+b.getAttribute("data-wb")); }; });
  var kv=function(id,fn){ var e=el.querySelector(id); e.onchange=function(){ fn(e.value.trim()); save(); }; };
  kv("#wsW",function(v){ W.wasi.ex=v; }); kv("#wsW2",function(v){ W.wasi.ex2=v; }); kv("#wsG",function(v){ W.wasi.gd=v; }); kv("#wsD",function(v){ W.wasi.docs=v; });
  [0,1].forEach(function(i){ kv("#wt"+i+"n",function(v){ W.wit[i]=W.wit[i]||{}; W.wit[i].n=v; }); kv("#wt"+i+"i",function(v){ W.wit[i]=W.wit[i]||{}; W.wit[i].ic=v; }); });
}
function bEdit(i){
  var b=i>=0?W.beq[i]:{to:"",what:"",pc:"",v:"",heir:false}, mode=b.pc?"pc":"rm";
  var ov=H.showSheet("📜 "+L2("Wasiat","Bequest"), '<div class="chips">'+[["Wakaf masjid","Mosque waqf"],["Sekolah tahfiz","Tahfiz school"],["Rumah anak yatim","Orphanage"],["Anak angkat","Adopted child"],["Cucu","Grandchild"]].map(function(p){ return '<button class="chip" data-bt="'+E(L2(p[0],p[1]))+'">'+E(L2(p[0],p[1]))+'</button>'; }).join("")+'</div>'+
    A.fld("wbT",L2("Kepada (penerima)","To (beneficiary)"),b.to)+A.fld("wbW",L2("Apa (harta tertentu, jika ada)","What (a specific asset, if any)"),b.what)+
    '<div class="chips fseg" id="wbM"><button class="chip'+(mode==="rm"?" on":"")+'" data-v="rm">RM</button><button class="chip'+(mode==="pc"?" on":"")+'" data-v="pc">% '+L2("harta bersih","of net estate")+'</button></div>'+
    A.fld("wbV",L2("Jumlah","Amount"),mode==="pc"?b.pc:b.v,"number",' inputmode="decimal" min="0"')+
    '<label class="set"><span>'+L2("Penerima ialah waris faraid","The beneficiary is a faraid heir")+'</span><span class="switch sm"><input type="checkbox" id="wbH" '+(b.heir?"checked":"")+'><span></span></span></label>'+
    '<div class="mut tiny">'+L2("Wasiat kepada waris hanya sah dengan persetujuan waris lain (hadis: \"Tiada wasiat bagi waris\").","A bequest to an heir is only valid if the other heirs agree (hadith: \"No bequest for an heir\").")+'</div>'+
    '<button class="btn gold full g3d" id="wbOk" style="margin-top:10px">✓ '+L2("Simpan","Save")+'</button>'+(i>=0?'<button class="btn alt full g3d" id="wbD" style="margin-top:6px">🗑 '+L2("Padam","Delete")+'</button>':''));
  ov.querySelectorAll("[data-bt]").forEach(function(x){ x.onclick=function(){ ov.querySelector("#wbT").value=x.getAttribute("data-bt"); }; });
  ov.querySelectorAll("#wbM [data-v]").forEach(function(x){ x.onclick=function(){ mode=x.getAttribute("data-v"); ov.querySelectorAll("#wbM [data-v]").forEach(function(y){ y.classList.toggle("on",y===x); }); }; });
  ov.querySelector("#wbOk").onclick=function(){ var v=A.num(ov.querySelector("#wbV").value); b.to=ov.querySelector("#wbT").value.trim(); b.what=ov.querySelector("#wbW").value.trim(); b.heir=ov.querySelector("#wbH").checked;
    if(!b.to){ H.toast(L2("Isi penerima","Fill in the beneficiary")); return; } if(mode==="pc"){ b.pc=Math.min(100,v); b.v=0; } else { b.v=v; b.pc=0; } if(i<0) W.beq.push(b); save(); H.closeOverlay(); A.draw(); };
  var d=ov.querySelector("#wbD"); if(d) d.onclick=function(){ W.beq.splice(i,1); save(); H.closeOverlay(); A.draw(); };
}
function vFaraid(el, h){
  var T=totals(), hs=W.heirs, sex=W.me.sex||"m", est=W.fEst!=null&&W.fEst!==""?+W.fEst:T.rest;
  h+='<div class="card"><h3>⚖ '+L2("Kalkulator faraid","Faraid calculator")+'</h3><div class="snl">'+L2("Si mati","The deceased")+'</div>'+A.seg("data-sx",sex,[["m","👨 "+L2("Lelaki","Male")],["f","👩 "+L2("Perempuan","Female")]])+
    A.fld("wfE",L2("Harta untuk dibahagi (RM)","Estate to divide (RM)"),Math.round(est*100)/100,"number",' inputmode="decimal" min="0"')+
    '<div class="mut tiny">'+L2("Asalnya diambil dari baki selepas hutang, kos jenazah dan wasiat: ","Starts from what is left after debts, funeral costs and bequests: ")+A.rm(T.rest)+' <a href="#" id="wfRe">↺</a></div></div>';
  h+='<div class="card"><div class="snl">'+L2("Waris yang masih hidup","Living heirs")+'</div>'+HK.filter(function(x){ return !(sex==="m"&&x[0]==="husband") && !(sex==="f"&&x[0]==="wife"); }).map(function(x){ var v=+hs[x[0]]||0;
    return '<div class="fhr"><span>'+E(L2(x[1],x[2]))+'</span><span class="fstep"><button data-hm="'+x[0]+'">−</button><b>'+v+'</b><button data-hp="'+x[0]+'" data-max="'+x[3]+'">＋</button></span></div>'; }).join("")+'</div>';
  var r=faraid(JSON.parse(JSON.stringify(hs)), sex);
  h+='<div class="card"><h3>📊 '+L2("Pembahagian","Distribution")+'</h3>'+(r.rows.length?'<table class="ftab"><thead><tr><th>'+L2("Waris","Heir")+'</th><th>'+L2("Bahagian","Share")+'</th><th>%</th><th>RM</th></tr></thead><tbody>'+
    r.rows.map(function(x){ return '<tr><td>'+E(hName(x.k))+(x.n>1?' ×'+x.n:'')+'</td><td>'+E(x.lab)+'</td><td>'+(x.fr*100).toFixed(2)+'</td><td>'+A.rm(est*x.fr).replace("RM ","")+(x.n>1?'<small>'+A.rm(est*x.fr/x.n).replace("RM ","")+' '+L2("seorang","each")+'</small>':'')+'</td></tr>'; }).join("")+'</tbody></table>'
    :'<div class="mut small">'+L2("Tambah waris di atas.","Add heirs above.")+'</div>')+
    r.warn.map(function(w){ return '<div class="warnbox" style="margin-top:8px">⚠ '+E(w)+'</div>'; }).join("")+
    '<div class="mut tiny" style="margin-top:8px">'+L2("Anggaran ikut mazhab Syafi'i untuk kes biasa. Yang terhalang (mahjub) tidak disenaraikan. Pembahagian rasmi melalui Sijil Faraid Mahkamah Syariah.","An estimate following the Shafi'i school for common cases. Heirs who are blocked (mahjub) are not listed. The official division is by the Syariah Court's Faraid Certificate.")+'</div></div>';
  h+=A.ayat(["4:11","4:12"].filter(function(k){ return A.AY[k]; }));
  el.innerHTML=h+dock();
  el.querySelectorAll("[data-sx]").forEach(function(b){ b.onclick=function(){ W.me.sex=b.getAttribute("data-sx"); save(); A.draw(); }; });
  el.querySelector("#wfE").onchange=function(){ W.fEst=this.value===""?null:A.num(this.value); save(); A.draw(); };
  el.querySelector("#wfRe").onclick=function(e){ e.preventDefault(); W.fEst=null; save(); A.draw(); };
  el.querySelectorAll("[data-hp]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-hp"); hs[k]=Math.min(+b.getAttribute("data-max"),(+hs[k]||0)+1); save(); A.draw(); }; });
  el.querySelectorAll("[data-hm]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-hm"); hs[k]=Math.max(0,(+hs[k]||0)-1); save(); A.draw(); }; });
}
var WISH=[["jenazah","⚰","Pengurusan jenazah","Funeral wishes","cth. dikebumikan di tanah perkuburan kampung, dimandikan oleh ...","e.g. buried in the village cemetery, washed by ..."],
  ["ibadah","🕌","Qada' solat, puasa, haji","Missed prayers, fasts, hajj","cth. puasa qada' 6 hari, upah haji jika belum","e.g. 6 fasts to make up, hajj by proxy if not done"],
  ["sedekah","💝","Sedekah jariah & wakaf","Ongoing charity & waqf","cth. teruskan sumbangan bulanan kepada ...","e.g. continue the monthly donation to ..."],
  ["keluarga","👨‍👩‍👧","Pesanan untuk keluarga","Message for the family","",""],
  ["digital","💻","Akaun digital","Digital accounts","cth. di mana senarai kata laluan disimpan, padam media sosial","e.g. where the password list is kept, close social media"]];
function vPesan(el, h){
  h+='<div class="card"><h3>💌 '+L2("Pesanan & hasrat","Wishes & messages")+'</h3><div class="mut tiny">'+L2("Hanya disimpan dalam telefon ini.","Kept only on this phone.")+'</div>'+
    WISH.map(function(w){ return '<label class="fl">'+w[1]+' '+L2(w[2],w[3])+'<textarea id="ww_'+w[0]+'" rows="3" placeholder="'+E(L2(w[4],w[5]))+'">'+E(W.wish[w[0]]||"")+'</textarea></label>'; }).join("")+'</div>';
  h+='<div class="card"><h3>☑ '+L2("Senarai semak","Checklist")+'</h3>'+[["daftar",L2("Daftar wasiat dengan badan amanah (Amanah Raya, as-Salihin dll.)","Register the wasiat with a trust body (Amanah Raya, as-Salihin etc.)")],["penama",L2("Kemas kini penama KWSP, Tabung Haji, takaful","Update EPF, Tabung Haji and takaful nominees")],["hibah",L2("Pertimbangkan hibah untuk harta tertentu","Consider hibah for specific assets")],["kongsi",L2("Beritahu wasi di mana dokumen disimpan","Tell the executor where the documents are")],["semak",L2("Semak semula setiap tahun atau selepas perubahan besar","Review every year or after a big change")]].map(function(c){ var on=!!(W.ck||{})[c[0]]; return '<label class="set"><span>'+c[1]+'</span><span class="switch sm"><input type="checkbox" data-ck="'+c[0]+'" '+(on?"checked":"")+'><span></span></span></label>'; }).join("")+'</div>';
  el.innerHTML=h+dock();
  WISH.forEach(function(w){ var t=el.querySelector("#ww_"+w[0]); t.onchange=function(){ W.wish[w[0]]=t.value; save(); }; });
  el.querySelectorAll("[data-ck]").forEach(function(c){ c.onchange=function(){ W.ck=W.ck||{}; W.ck[c.getAttribute("data-ck")]=c.checked; save(); }; });
}
function draft(){
  var T=totals(), me=W.me, r=faraid(JSON.parse(JSON.stringify(W.heirs)), me.sex||"m"), en=H.en(), o='';
  var p=function(t){ o+='<p>'+E(t)+'</p>'; };
  o+='<h1>'+L2("DRAF WASIAT","DRAFT WILL (WASIAT)")+'</h1><p class="prmut">'+L2("Draf perancangan dari aplikasi My Ihsan, bukan dokumen sah. Sila sahkan dengan badan wasiat bertauliah.","A planning draft from the My Ihsan app, not a legal document. Please finalise it with a licensed wasiat body.")+'</p>';
  o+='<p style="text-align:center;font-size:16pt">بسم الله الرحمن الرحيم</p>';
  p(L2("Saya, "+(me.name||"................")+" (No. KP: "+(me.ic||"................")+"), dalam keadaan sedar dan tanpa paksaan, bersaksi bahawa tiada tuhan melainkan Allah dan Nabi Muhammad ialah pesuruh Allah, dengan ini membuat wasiat seperti berikut:","I, "+(me.name||"................")+" (IC no.: "+(me.ic||"................")+"), of sound mind and under no compulsion, bearing witness that there is no god but Allah and that Muhammad is the Messenger of Allah, make this wasiat as follows:"));
  o+='<h2>1. '+L2("Hutang dan kewajipan","Debts and obligations")+'</h2>'; p(L2("Semua hutang saya, zakat, fidyah dan nazar yang belum ditunaikan, serta kos pengurusan jenazah, hendaklah dijelaskan dahulu daripada harta saya.","All my debts, unpaid zakat, fidyah and vows, and my funeral costs, are to be paid first from my estate."));
  var dl=A.D.debts.filter(function(x){ return !x.done && x.dir!=="owed"; }); if(dl.length||W.liab.length) o+='<ul>'+dl.map(function(x){ return '<li>'+E((x.who||"")+(x.desc?" ("+x.desc+")":""))+'</li>'; }).join("")+W.liab.map(function(x){ return '<li>'+E(x.n+(x.note?" ("+x.note+")":""))+'</li>'; }).join("")+'</ul>';
  o+='<h2>2. '+L2("Wasiat (tidak melebihi 1/3)","Bequests (not more than 1/3)")+'</h2>'; if(W.beq.length) o+='<ul>'+W.beq.map(function(b){ return '<li>'+E(b.to)+': '+E(b.what?b.what+", ":"")+(b.pc?b.pc+"% "+L2("harta bersih","of the net estate"):A.rm(b.v))+'</li>'; }).join("")+'</ul>'; else p(L2("Tiada.","None."));
  o+='<h2>3. '+L2("Baki harta","The rest of the estate")+'</h2>'; p(L2("Baki harta saya hendaklah dibahagikan kepada waris mengikut hukum faraid.","The rest of my estate is to be divided among my heirs according to faraid."));
  if(r.rows.length) o+='<table class="prt"><tbody>'+r.rows.map(function(x){ return '<tr><td>'+E(hName(x.k))+(x.n>1?" ×"+x.n:"")+'</td><td>'+E(x.lab)+'</td><td class="prr">'+(x.fr*100).toFixed(2)+'%</td></tr>'; }).join("")+'</tbody></table>';
  o+='<h2>4. '+L2("Wasi dan penjaga","Executor and guardian")+'</h2>'; p(L2("Wasi: ","Executor: ")+(W.wasi.ex||"........")+(W.wasi.ex2?L2("; ganti: ","; alternate: ")+W.wasi.ex2:"")); if(W.wasi.gd) p(L2("Penjaga anak: ","Guardian of my children: ")+W.wasi.gd);
  o+='<h2>5. '+L2("Senarai harta","List of assets")+'</h2><table class="prt"><tbody>'+W.assets.map(function(a){ var c=ac(a.c); return '<tr><td>'+E(L2(c[2],c[3]))+'</td><td>'+E(a.n||"")+(a.loc?'<br><span class="prmut">'+E(a.loc)+'</span>':'')+(a.nom?'<br><span class="prmut">'+L2("Penama: ","Nominee: ")+E(a.nom)+'</span>':'')+'</td><td class="prr">'+A.rm(a.v)+'</td></tr>'; }).join("")+'</tbody></table>';
  if(W.wasi.docs) p(L2("Dokumen asal: ","Original documents: ")+W.wasi.docs);
  var ws=WISH.filter(function(w){ return (W.wish[w[0]]||"").trim(); }); if(ws.length){ o+='<h2>6. '+L2("Hasrat","Wishes")+'</h2>'; ws.forEach(function(w){ o+='<p><b>'+E(L2(w[2],w[3]))+':</b> '+E(W.wish[w[0]])+'</p>'; }); }
  o+='<h2>'+L2("Tandatangan","Signatures")+'</h2><table class="prt"><tbody><tr><td style="height:18mm">'+L2("Pewasiat","Testator")+': '+E(me.name||"")+'</td><td>'+L2("Tarikh","Date")+':</td></tr>'+[0,1].map(function(i){ var w=W.wit[i]||{}; return '<tr><td style="height:18mm">'+L2("Saksi ","Witness ")+(i+1)+': '+E(w.n||"")+(w.ic?' ('+E(w.ic)+')':'')+'</td><td>'+L2("Tandatangan","Signature")+':</td></tr>'; }).join("")+'</tbody></table>';
  return o;
}
function vDraft(el, h){
  var T=totals(), me=W.me;
  h+='<div class="card"><h3>🪪 '+L2("Maklumat saya","My details")+'</h3>'+A.fld("wmN",L2("Nama penuh","Full name"),me.name||"")+A.fld("wmI",L2("No. KP","IC no."),me.ic||"")+'</div>';
  h+='<div class="card"><h3>🧾 '+L2("Ringkasan","Summary")+'</h3><table class="ftab"><tbody>'+[[L2("Harta dalam pusaka","Assets in the estate"),T.gross],[L2("Hutang","Debts"),-(T.owe+T.lia)],[L2("Kos jenazah","Funeral costs"),-T.fun],[L2("Harta bersih","Net estate"),T.net],[L2("Wasiat","Bequests"),-Math.min(T.beq,T.third)],[L2("Untuk faraid","For faraid"),T.rest]].map(function(r){ return '<tr><td>'+r[0]+'</td><td style="text-align:right">'+A.rm(r[1])+'</td></tr>'; }).join("")+'</tbody></table>'+
    (W.upd?'<div class="mut tiny">'+L2("Dikemas kini ","Updated ")+A.dstr(W.upd)+'</div>':'')+'</div>';
  h+='<button class="btn gold full g3d" id="wdP">🖨 '+L2("Cetak / simpan PDF draf wasiat","Print / save the draft will as PDF")+'</button>';
  h+='<div class="card mut small" style="margin-top:10px">'+L2("Ini draf perancangan. Wasiat yang sah perlu ditandatangani di hadapan 2 saksi dan sebaiknya didaftarkan dengan badan wasiat (Amanah Raya Berhad, as-Salihin Trustee, Wasiyyah Shoppe, bank Islam). Harta pusaka kecil (hingga RM5 juta, tanpa wasiat) diurus di Pejabat Pusaka Kecil.","This is a planning draft. A valid wasiat must be signed before 2 witnesses and is best registered with a wasiat body (Amanah Raya Berhad, as-Salihin Trustee, Wasiyyah Shoppe, an Islamic bank). Small estates (up to RM5 million, without a will) go to the Small Estates office.")+'</div>';
  h+=A.ayat(["2:180"].filter(function(k){ return A.AY[k]; }));
  el.innerHTML=h+dock();
  el.querySelector("#wmN").onchange=function(){ me.name=this.value.trim(); save(); };
  el.querySelector("#wmI").onchange=function(){ me.ic=this.value.trim(); save(); };
  el.querySelector("#wdP").onclick=function(){ var pr=document.getElementById("fnPrint"); if(!pr){ pr=document.createElement("div"); pr.id="fnPrint"; document.body.appendChild(pr); }
    pr.innerHTML=draft(); document.body.classList.add("fnprinting"); var done=function(){ document.body.classList.remove("fnprinting"); };
    setTimeout(function(){ if(window.Native && H.N.printPage){ H.N.printPage(L2("Draf wasiat","Draft will")); setTimeout(done,4000); } else { window.print(); setTimeout(done,500); } },300); };
}
var SECS=[["aset","💼","Harta","Assets"],["wasiat","📜","Wasiat","Bequests"],["faraid","⚖","Faraid","Faraid"],["pesan","💌","Hasrat","Wishes"],["draf","🖨","Draf","Draft"]];
function dock(){ return '<div class="dock"><div class="grp3 g5">'+SECS.map(function(s){ return '<button class="chip g3d'+(sec===s[0]?" on":"")+'" data-wsec="'+s[0]+'">'+s[1]+' '+L2(s[2],s[3])+'</button>'; }).join("")+'</div></div>'; }
function view(el, api){
  A=api; H=api.H; L2=H.L2x; E=H.esc; wd();
  // extra ayat for this page (Arabic from the bundled mushaf data)
  A.AY["2:180"]=A.AY["2:180"]||["كتب عليكم إذا حضر أحدكم الموت إن ترك خيرا الوصية للوالدين والأقربين بالمعروف حقا على المتقين","Diwajibkan atas kamu, apabila seseorang daripada kamu hampir mati, jika dia meninggalkan harta, berwasiat untuk ibu bapa dan kaum kerabat dengan cara yang baik; satu kewajipan atas orang yang bertakwa.","Prescribed for you when death approaches one of you, if he leaves wealth, is a bequest for the parents and near relatives according to what is acceptable, a duty upon the righteous."];
  A.AY["4:11"]=A.AY["4:11"]||["يوصيكم الله في أولادكم للذكر مثل حظ الأنثيين","Allah memerintahkan kamu tentang (pembahagian pusaka untuk) anak-anak kamu: bahagian seorang lelaki sama dengan bahagian dua orang perempuan.","Allah instructs you concerning your children: for the male, what is equal to the share of two females."];
  A.AY["4:12"]=A.AY["4:12"]||["ولكم نصف ما ترك أزواجكم إن لم يكن لهن ولد فإن كان لهن ولد فلكم الربع مما تركن من بعد وصية يوصين بها أو دين","Bagi kamu seperdua harta yang ditinggalkan isteri kamu jika mereka tiada anak; jika ada anak, kamu mendapat seperempat, selepas ditunaikan wasiat dan hutang.","For you is half of what your wives leave if they have no child; if they have a child, you get a fourth, after any bequest and debt."];
  var h='<div class="mut tiny" style="margin:0 2px 8px">'+L2("Perancangan wasiat: bukan nasihat undang-undang. Semua data kekal dalam telefon ini.","Wasiat planning: not legal advice. All data stays on this phone.")+'</div>';
  ({aset:vAset, wasiat:vBeq, faraid:vFaraid, pesan:vPesan, draf:vDraft}[sec]||vAset)(el, h);
  el.querySelectorAll("[data-wsec]").forEach(function(b){ b.onclick=function(){ sec=b.getAttribute("data-wsec"); A.draw(); document.getElementById("view").scrollTop=0; }; });
  try{ H.dockFix(); }catch(e){}
  // 0.34.0: swipe sideways between the five sections; the next one rides in beside the finger (no gap)
  if(window.IbSwipe && window.ibWrap && el.parentNode){
    var ks=SECS.map(function(x){ return x[0]; }), nb=function(s){ return ks[ks.indexOf(sec)+(s<0?1:-1)]; }, fn=function(k){ return {aset:vAset, wasiat:vBeq, faraid:vFaraid, pesan:vPesan, draf:vDraft}[k]; };
    var pg=window.ibWrap(el);
    window.IbSwipe(pg, {can:function(s){ return !!nb(s); }, go:function(s){ sec=nb(s); A.draw(); },
      find:function(){ return document.querySelector("#view .ibpg"); },
      peek:function(s){ var k=nb(s), s0=sec, b=window.IbSwipe.shot(function(){ sec=k; }, function(x){ fn(k)(x, h); }, function(){ sec=s0; });
        if(!b) return null; [].slice.call(b.querySelectorAll(".dock")).forEach(function(d){ d.remove(); }); var w=document.createElement("div"); w.className="ibpg"; while(b.firstChild) w.appendChild(b.firstChild); return w; }});
  }
}
window.FinMore=window.FinMore||{}; window.FinMore.wasiat=view;
window.FinFaraid=faraid;
})();
