/* My Ihsan 0.23.0: Keluarga (Alat › Keluarga): Salasilah 3D (idea 89), birthdays with Hijri birthdays (idea 51) and phone numbers,
   baby names (idea 96) and nikah preparation (idea 97). FamView(el, H). Storage: ihsan_family {p:[person], me, sec, rem}.
   person {id, n, g:"m"|"f", b:"YYYY-MM-DD", dd (date of death), tel, f (father id), m (mother id), sp:[spouse ids], note, addr, lat, lon (0.33.4)} */
(function(){
"use strict";
var H, L2, E, F, sec="tree", host=null, sel=null;
function ld(){ F=H.load("ihsan_family",null)||{}; if(!Array.isArray(F.p)) F.p=[]; F.fav=F.fav||[]; F.nk=F.nk||{}; if(F.rem==null) F.rem=true; return F; }
function sv(){ H.save("ihsan_family",F); try{ H.resched(); }catch(e){} }
function uid(){ return "p"+Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
function P(id){ for(var i=0;i<F.p.length;i++) if(F.p[i].id===id) return F.p[i]; return null; }
function pd(s){ if(!s) return null; var p=String(s).split("-"); return new Date(+p[0], (+p[1]||1)-1, +p[2]||1); }
function ymd(d){ return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); }
function today(){ var d=new Date(); d.setHours(0,0,0,0); return d; }
function dstr(s){ var d=pd(s); return d?d.toLocaleDateString(ibLoc(H.en()),{day:"numeric",month:"short",year:"numeric"}):""; }
function dead(p){ return !!(p.dd||p.dead); }
function age(p){ var b=pd(p.b); if(!b) return null; if(p.dead&&!p.dd) return null; var e=p.dd?pd(p.dd):today(), a=e.getFullYear()-b.getFullYear(); if(e.getMonth()<b.getMonth()||(e.getMonth()===b.getMonth()&&e.getDate()<b.getDate())) a--; return a; }
function hj(d){ try{ return H.hijri(d); }catch(e){ return null; } }
var HM=["Muharram","Safar","Rabiulawal","Rabiulakhir","Jamadilawal","Jamadilakhir","Rejab","Syaaban","Ramadan","Syawal","Zulkaedah","Zulhijjah"];
function hstr(h){ return h?h.d+" "+HM[h.m-1]+" "+h.y+"H":""; }
// next Gregorian birthday and next Hijri birthday on or after today
function nextG(p){ var b=pd(p.b); if(!b) return null; var t=today(), n=new Date(t.getFullYear(), b.getMonth(), b.getDate()); if(n<t) n=new Date(t.getFullYear()+1, b.getMonth(), b.getDate()); return n; }
function nextH(p){ var b=pd(p.b), hb=b&&hj(b); if(!hb) return null; var t=today(); for(var i=0;i<370;i++){ var d=new Date(t); d.setDate(d.getDate()+i); var h=hj(d); if(h && h.m===hb.m && h.d===hb.d) return d; } return null; }
window.FamNext=function(p){ return {g:nextG(p), h:nextH(p)}; };
function days(a,b){ return Math.round((b-a)/864e5); }

// ---------- relations ----------
function kids(id){ return F.p.filter(function(x){ return x.f===id || x.m===id; }); }
// 0.33.5: every relation by name, worked out from the shortest path to me (U = to a parent, D = to a child, S = to a spouse):
// datuk, moyang, bapa/ibu saudara, sepupu, dua pupu, tiga pupu, anak saudara, cucu, cicit, mentua, menantu, ipar, biras, tiri,
// with "belah ayah / belah ibu" for relatives through my father or my mother.
function kinPath(from, to){
  var dist={}, prev={}, done={}, cost=function(len,s){ return len*10+s; }; dist[from]={c:0, path:"", side:null, via:[]};
  for(;;){ var best=null; Object.keys(dist).forEach(function(k){ if(!done[k] && (!best || dist[k].c<dist[best].c)) best=k; }); if(!best) break; done[best]=1; if(best===to) return dist[to];
    var p=P(best), cur=dist[best]; if(!p) continue;
    var nb=[]; if(p.f) nb.push([p.f,"U"]); if(p.m) nb.push([p.m,"U"]); kids(best).forEach(function(k){ nb.push([k.id,"D"]); }); (p.sp||[]).forEach(function(s){ nb.push([s,"S"]); });
    nb.forEach(function(x){ if(!P(x[0])) return; var path=cur.path+x[1], c=cost(path.length, (path.match(/S/g)||[]).length); if(dist[x[0]] && dist[x[0]].c<=c) return;
      var side=cur.side; if(!side && x[1]==="U" && !/[DS]/.test(cur.path)) side=(x[0]===p.f?"f":"m"); dist[x[0]]={c:c, path:path, side:side, via:cur.via.concat([x[0]])}; }); }
  return null; }
function blood(u, d, f, p, me){
  var G=function(a,b,c,dd){ return f?L2(b,dd):L2(a,c); };   // (Malay male, Malay female, English male, English female)
  if(u===0&&d===0) return L2("Saya","Me");
  if(d===0){ if(u===1) return G("Bapa","Ibu","Father","Mother"); if(u===2) return G("Datuk","Nenek","Grandfather","Grandmother"); if(u===3) return G("Moyang","Moyang","Great-grandfather","Great-grandmother"); return L2("Moyang ke-"+(u-2),"Ancestor ("+u+" up)"); }
  if(u===0){ if(d===1) return G("Anak lelaki","Anak perempuan","Son","Daughter"); if(d===2) return L2("Cucu","Grandchild"); if(d===3) return L2("Cicit","Great-grandchild"); if(d===4) return L2("Piut","Great-great-grandchild"); return L2("Keturunan ke-"+d,"Descendant ("+d+" down)"); }
  if(u===1&&d===1){ var bp=pd(p.b), bm=pd(me.b); if(bp&&bm){ if(bp<bm) return G("Abang","Kakak","Older brother","Older sister"); return G("Adik lelaki","Adik perempuan","Younger brother","Younger sister"); } return G("Adik-beradik lelaki","Adik-beradik perempuan","Brother","Sister"); }
  if(u===1){ if(d===2) return L2("Anak saudara","Nephew/niece"); if(d===3) return L2("Cucu saudara","Grandnephew/niece"); }
  if(d===1){ if(u===2) return G("Bapa saudara","Ibu saudara","Uncle","Aunt"); if(u===3) return G("Datuk saudara","Nenek saudara","Great-uncle","Great-aunt"); }
  if(u===d){ if(u===2) return L2("Sepupu","First cousin"); if(u===3) return L2("Dua pupu","Second cousin"); if(u===4) return L2("Tiga pupu","Third cousin"); return L2((u-1)+" pupu","Cousin ("+(u-1)+")"); }
  if(u===2&&d===3) return L2("Anak sepupu","Cousin's child"); if(u===3&&d===2) return L2("Sepupu ibu/bapa","Parent's cousin");
  if(u===3&&d===4) return L2("Anak dua pupu","Second cousin's child"); if(u===4&&d===3) return L2("Dua pupu ibu/bapa","Parent's second cousin");
  return L2("Saudara","Relative"); }
function rel(p){ var me=F.me&&P(F.me); if(!me) return ""; if(p.id===me.id) return L2("Saya","Me");
  var k=kinPath(me.id, p.id); if(!k) return ""; var m=k.path.match(/^(S?)(U*)(D*)(S?)$/), f=p.g==="f";
  var side=k.side?(k.side==="f"?L2(" (belah ayah)"," (father's side)"):L2(" (belah ibu)"," (mother's side)")):"";
  if(!m) return L2("Saudara","Relative")+side;
  if(k.path==="S") return f?L2("Isteri","Wife"):L2("Suami","Husband");
  var a=m[1].length, u=m[2].length, d=m[3].length, b=m[4].length;
  if(!a&&!b){ var r=blood(u,d,f,p,me); return r+(u>=2?side:""); }
  if(!a&&b){ if(!u&&!d) return f?L2("Isteri","Wife"):L2("Suami","Husband");
    if(!u&&d===1) return L2("Menantu","Child-in-law"); if(!u&&d===2) return L2("Cucu menantu","Grandchild-in-law");
    if(u===1&&!d) return f?L2("Ibu tiri","Stepmother"):L2("Bapa tiri","Stepfather");
    if(u===1&&d===1) return f?L2("Kakak/adik ipar","Sister-in-law"):L2("Abang/adik ipar","Brother-in-law");
    if(u===2&&d===1) return (f?L2("Ibu saudara","Aunt"):L2("Bapa saudara","Uncle"))+side;
    if(u===2&&!d) return (f?L2("Nenek tiri","Step-grandmother"):L2("Datuk tiri","Step-grandfather"))+side;
    return L2("Pasangan ","Spouse of ")+blood(u,d,!f,p,me).toLowerCase()+(u>=2?side:""); }
  var sp=P(k.via[0]), sw=sp&&sp.g==="f"?L2("isteri","wife's"):L2("suami","husband's");
  if(a&&!b){ if(u===1&&!d) return (f?L2("Ibu mentua","Mother-in-law"):L2("Bapa mentua","Father-in-law"));
    if(u===1&&d===1) return f?L2("Kakak/adik ipar","Sister-in-law"):L2("Abang/adik ipar","Brother-in-law");
    if(!u&&d===1) return L2("Anak tiri","Stepchild");
    var bl=blood(u,d,f,p,me); return H.en()?(sw.charAt(0).toUpperCase()+sw.slice(1)+" "+bl.toLowerCase()):(bl+" "+sw); }
  if(u===1&&d===1) return L2("Biras","Co-sibling-in-law (biras)");
  if(u===1&&!d) return L2("Mentua tiri","Step-parent-in-law"); if(!u&&d===1) return L2("Menantu tiri","Step-child-in-law");
  return L2("Saudara ipar","Relative by marriage"); }

// ---------- person editor ----------
function pickPhoto(done){
  var fit=function(src){ var im=new Image(); im.onload=function(){ var S=200, c=document.createElement("canvas"); c.width=S; c.height=S; var k=Math.max(S/im.width, S/im.height), w=im.width*k, h=im.height*k;
      c.getContext("2d").drawImage(im, (S-w)/2, (S-h)/2, w, h); done(c.toDataURL("image/jpeg", 0.8)); }; im.onerror=function(){ H.toast(L2("Gambar tidak dapat dibuka","The image could not be opened")); }; im.src=src; };
  if(window.Native && H.N.pickImage){ var hh=function(d){ H.off("image", hh); if(d && d.data) fit(d.data); }; H.on("image", hh); H.N.pickImage("gallery"); return; }
  var inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.onchange=function(){ var f=inp.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ fit(r.result); }; r.readAsDataURL(f); }; inp.click(); }
function llParse(t){ var m=String(t||"").match(/(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/); if(!m || Math.abs(+m[1])>90 || Math.abs(+m[2])>180) return null; return [+m[1], +m[2]]; }
function pEdit(id, link){
  var p=id?P(id):{n:"",g:"m",b:"",dd:"",tel:"",note:"",sp:[]}, g=p.g;
  if(link && !id){ if(link.r==="f"){ g="m"; } if(link.r==="m"){ g="f"; } if(link.r==="sp"){ var o=P(link.of); g=o&&o.g==="m"?"f":"m"; } }
  var lab=link?{f:L2("Bapa kepada ","Father of "),m:L2("Ibu kepada ","Mother of "),sp:L2("Pasangan kepada ","Spouse of "),c:L2("Anak kepada ","Child of "),sib:L2("Adik-beradik ","Sibling of ")}[link.r]+(P(link.of)||{}).n:"";
  var ov=H.showSheet((id?"✎ ":"＋ ")+(lab?E(lab):L2("Ahli keluarga","Family member")),
    '<div class="fnrow">'+H.fld("fmN",L2("Nama","Name"),p.n)+'<button class="btn gold g3d" id="fmOk">✓ '+L2("Simpan","Save")+'</button></div>'+
    '<div class="chips fseg" id="fmG"><button class="chip'+(g==="m"?" on":"")+'" data-v="m">👨 '+L2("Lelaki","Male")+'</button><button class="chip'+(g==="f"?" on":"")+'" data-v="f">👩 '+L2("Perempuan","Female")+'</button></div>'+
    '<div class="fphrow"><span id="fmPhV" class="fphv">'+(p.img?'<img src="'+p.img+'" alt="">':'👤')+'</span><button class="btn alt g3d" id="fmPh">📷 '+L2("Gambar","Photo")+'</button><button class="btn alt g3d" id="fmPhX"'+(p.img?'':' style="display:none"')+'>🗑</button></div>'+
    '<div class="snl">'+L2("Tarikh lahir","Date of birth")+'</div>'+wheelHtml("fmBw", p.b)+
    H.fld("fmT",L2("No. telefon","Phone"),p.tel,"tel")+
    '<div class="snl">'+L2("Alamat","Address")+'</div><textarea id="fmA" class="ilq" rows="2" placeholder="'+L2("cth. 9119 Jalan Kerdas 1, Gombak","e.g. 9119 Jalan Kerdas 1, Gombak")+'">'+E(p.addr||"")+'</textarea>'+
    '<div class="btns" style="margin:6px 0"><button class="btn alt g3d" id="fmLoc">📍 '+L2("Lokasi saya sekarang","My location now")+'</button><button class="btn alt g3d" id="fmMapT">🗺 '+L2("Lihat di peta","See on map")+'</button></div>'+
    '<input id="fmLL" class="ilq" placeholder="'+L2("Koordinat (pilihan): 4.5975, 101.0901","Coordinates (optional): 4.5975, 101.0901")+'" value="'+(p.lat!=null?p.lat+", "+p.lon:"")+'">'+
    '<div class="mut tiny">'+L2("Dalam Google Maps, tekan lama pada rumah untuk menyalin koordinat.","In Google Maps, press and hold on the house to copy its coordinates.")+'</div>'+
    '<label class="fdk"><input type="checkbox" id="fmDk"'+(dead(p)?" checked":"")+'> '+L2("Sudah meninggal dunia","Passed away")+'</label><div id="fmDbox"'+(dead(p)?'':' style="display:none"')+'><div class="snl">'+L2("Tarikh meninggal (jika tahu)","Date of death (if known)")+'</div>'+wheelHtml("fmDw", p.dd)+'</div>'+
    H.fld("fmO",L2("Nota","Note"),p.note,"text",' placeholder="'+L2("cth. nama timangan","e.g. nickname")+'"')+
    (!F.p.length?'<div class="mut tiny">'+L2("Orang pertama ialah anda. Selepas itu tambah ibu bapa, pasangan dan anak dari setiap nama.","The first person is you. Then add parents, spouse and children from each name.")+'</div>':'')+
    (id?'<button class="btn alt full g3d" id="fmX" style="margin-top:6px">🗑 '+L2("Padam","Delete")+'</button>':''));
  wheelBind(ov.querySelector("#fmBw")); wheelBind(ov.querySelector("#fmDw"));
  // 0.5.7: a photo for this person (cropped square, 200 px, kept with the family data)
  var img0=p.img||"", setPh=function(d){ img0=d||""; ov.querySelector("#fmPhV").innerHTML=img0?'<img src="'+img0+'" alt="">':'👤'; ov.querySelector("#fmPhX").style.display=img0?"":"none"; };
  ov.querySelector("#fmPh").onclick=function(){ pickPhoto(setPh); }; ov.querySelector("#fmPhX").onclick=function(){ setPh(""); };
  ov.querySelector("#fmDk").onchange=function(){ ov.querySelector("#fmDbox").style.display=this.checked?"":"none"; };
  ov.querySelector("#fmLoc").onclick=function(){ var b=this; b.textContent="⏳"; var hl=function(r){ H.off("location",hl); b.textContent="📍 "+L2("Lokasi saya sekarang","My location now"); if(r.error||r.lat==null){ H.toast(L2("Lokasi tidak tersedia","Location unavailable")); return; } ov.querySelector("#fmLL").value=(+r.lat).toFixed(5)+", "+(+r.lon).toFixed(5); H.toast(L2("Lokasi disimpan","Location set")); };
    if(H.N.hasPerm && !H.N.hasPerm("location")){ var hp=function(q){ if(q.which!=="location") return; H.off("perm",hp); if(q.granted){ H.on("location",hl); H.N.getLocation(); } else b.textContent="📍 "+L2("Lokasi saya sekarang","My location now"); }; H.on("perm",hp); H.N.requestPerm("location"); } else { H.on("location",hl); H.N.getLocation(); } };
  ov.querySelector("#fmMapT").onclick=function(){ var ll=llParse(ov.querySelector("#fmLL").value), a=ov.querySelector("#fmA").value.trim(); if(!ll && !a){ H.toast(L2("Isi alamat dahulu","Fill in the address first")); return; } H.N.openUrl(mapUrl(ll?{lat:ll[0],lon:ll[1]}:{addr:a})); };
  ov.querySelectorAll("#fmG [data-v]").forEach(function(b){ b.onclick=function(){ g=b.getAttribute("data-v"); ov.querySelectorAll("#fmG [data-v]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
  ov.querySelector("#fmOk").onclick=function(){ var v=function(s){ return ov.querySelector(s).value.trim(); }; if(!v("#fmN")){ H.toast(L2("Isi nama","Fill in a name")); return; }
    p.n=v("#fmN"); p.g=g; if(img0) p.img=img0; else delete p.img; p.b=wheelVal(ov.querySelector("#fmBw")); p.tel=v("#fmT"); p.dead=ov.querySelector("#fmDk").checked; p.dd=p.dead?wheelVal(ov.querySelector("#fmDw")):""; p.note=v("#fmO"); p.addr=v("#fmA");
    var ll=llParse(v("#fmLL")); if(ll){ p.lat=ll[0]; p.lon=ll[1]; } else if(!v("#fmLL")){ delete p.lat; delete p.lon; }
    if(!id){ p.id=uid(); p.sp=[]; p.t=Date.now(); F.p.push(p); if(!F.me) F.me=p.id;
      if(link){ var o=P(link.of);
        if(link.r==="f"||link.r==="m"){ o[link.r]=p.id; var other=link.r==="f"?o.m:o.f; if(other){ var q=P(other); if(q && (q.sp||[]).indexOf(p.id)<0){ q.sp=(q.sp||[]).concat([p.id]); p.sp.push(q.id); } } }
        else if(link.r==="sib"){ p.f=o.f||null; p.m=o.m||null; }
        else if(link.r==="sp"){ o.sp=(o.sp||[]).concat([p.id]); p.sp.push(o.id); }
        else if(link.r==="c"){ if(o.g==="f") p.m=o.id; else p.f=o.id; var s1=(o.sp||[])[0]; if(s1){ var q2=P(s1); if(q2){ if(q2.g==="f") p.m=q2.id; else p.f=q2.id; } } } } }
    sel=p.id; sv(); H.closeOverlay(); draw(); };
  var x=ov.querySelector("#fmX"); if(x) x.onclick=function(){ if(!confirm(L2("Padam "+p.n+"? Hubungan dengan orang lain juga dibuang.","Delete "+p.n+"? Links to others are removed too."))) return;
    F.p=F.p.filter(function(y){ return y.id!==id; }); F.p.forEach(function(y){ if(y.f===id) y.f=null; if(y.m===id) y.m=null; y.sp=(y.sp||[]).filter(function(s){ return s!==id; }); }); if(F.me===id) F.me=F.p[0]?F.p[0].id:null; sel=null; sv(); H.closeOverlay(); draw(); };
}
// 0.33.5 (Farah): the info card. Compact, info only, gold Edit; parents, spouse and children in small tables (children can be
// moved up/down from the firstborn to the last); "add relative" sits at the bottom. It drops from the top, and the notch at its
// bottom centre is dragged to make it taller or shorter.
function kidsOrd(id){ return kids(id).sort(function(a,b){ var oa=a.o!=null?a.o:1e9, ob=b.o!=null?b.o:1e9; if(oa!==ob) return oa-ob; var ba=pd(a.b), bb=pd(b.b); if(ba&&bb) return ba-bb; return (a.t||0)-(b.t||0); }); }
function wdLong(s){ var d=pd(s); return d?d.toLocaleDateString(ibLoc(H.en()),{weekday:"long"}):""; }
function ccNum(t){ var cc=F.cc||(H.cc?H.cc():"60"), n=String(t||"").replace(/[^0-9+]/g,""); if(n.charAt(0)==="+") return n.slice(1); if(n.indexOf("00")===0) return n.slice(2); if(n.charAt(0)==="0") return cc+n.slice(1); return n; }
function telUrl(t){ return "tel:+"+ccNum(t); }
function waUrl(t){ return "https://wa.me/"+ccNum(t); }
function pOpen(id){
  var p=P(id); if(!p) return; sel=id; var a=age(p), r=rel(p), hb=hjOf(p.b), ng=nextG(p), t=today(), ks=kidsOrd(id);
  var who=function(q, extra){ return q?'<tr data-pj="'+q.id+'"><td class="fpn"><span class="fnmw">'+av(q)+'<span class="'+nmCls(q)+'">'+E(q.n)+'</span></span></td><td class="mut">'+E(extra||"")+'</td><td class="fage">'+(age(q)!=null?age(q):"")+'</td></tr>':''; };
  var h=(imgOn() && p.img?'<div class="fpimg"><img src="'+p.img+'" alt=""></div>':'')+'<div class="fpi">'+[r?'<b>'+E(r)+'</b>':'', a!=null?(p.dd?L2("arwah, umur ","late, aged "):L2("umur ","age "))+a:''].filter(Boolean).join(' · ')+'</div>';
  if(p.b) h+='<div class="fpi">🎂 '+wdLong(p.b)+', '+dstr(p.b)+(hb?' · 🌙 '+hb:'')+(ng&&!p.dd?' · '+(days(t,ng)===0?L2("hari ini 🎉","today 🎉"):L2("lagi ","in ")+days(t,ng)+L2(" hari"," days")):'')+'</div>';
  if(p.dd) h+='<div class="fpi">🕊 '+dstr(p.dd)+(hjOf(p.dd)?' · '+hjOf(p.dd):'')+'</div>';
  if(p.tel) h+='<div class="fpi">📞 '+E(p.tel)+' <button class="chip g3d" id="fmCall">📞</button><button class="chip g3d" id="fmWa">💬</button></div>';
  if(p.addr||p.lat!=null) h+='<div class="fpi">🏠 '+E(p.addr||(p.lat+", "+p.lon))+' <button class="chip g3d" id="fmMapO">🗺</button></div>';
  if(p.note) h+='<div class="fpi mut">'+E(p.note)+'</div>';
  if((p.alt||[]).length) h+='<div class="fpi">'+L2("Nama lain: ","Other names: ")+p.alt.map(function(n,i){ return '<button class="chip g3d" data-alt="'+i+'">'+E(n)+' ↺</button>'; }).join(" ")+'</div>';
  var pars=[P(p.f),P(p.m)].filter(Boolean), sps=(p.sp||[]).map(P).filter(Boolean), sibs=sibsOf(p);
  h+='<table class="ftbl fsm"><tbody>'+(pars.length?'<tr class="fsec"><td colspan="3">'+L2("Ibu bapa","Parents")+'</td></tr>'+pars.map(function(q){ return who(q, q.g==="f"?L2("Ibu","Mother"):L2("Bapa","Father")); }).join(""):'')+
    (sibs.length?'<tr class="fsec"><td colspan="3">'+L2("Adik-beradik","Siblings")+'</td></tr></tbody><tbody class="fsort" data-sk="sib">'+sibs.map(function(q){ return drow(q, E(q.n), rel(q)); }).join("")+'</tbody><tbody>':'')+
    (sps.length?'<tr class="fsec"><td colspan="3">'+L2("Pasangan","Spouse")+'</td></tr>'+sps.map(function(q){ return who(q, q.g==="f"?L2("Isteri","Wife"):L2("Suami","Husband")); }).join(""):'')+
    (ks.length?'<tr class="fsec"><td colspan="3">'+L2("Anak (sulung ke bongsu)","Children (eldest to youngest)")+'</td></tr></tbody><tbody class="fsort" data-sk="kid">'+ks.map(function(q,i){ return drow(q, (i+1)+'. '+E(q.n), ""); }).join(""):'')+'</tbody></table>'+
    ((sibs.length>0||ks.length>1)?'<div class="mut tiny" style="margin:2px 4px 8px">≡ '+L2("Tekan dan seret ≡ untuk susun semula","Hold and drag ≡ to reorder")+'</div>':'');
  if(F.me===id) h+='<div class="btns fpb"><button class="btn alt g3d" id="fmMe">⭐ '+L2("Ini saya","This is me")+' ▾</button></div>';
  h+='<div class="snl">'+L2("＋ Tambah saudara "+p.n,"＋ Add a relative of "+p.n)+'</div><div class="chips fpadd">'+(!p.f?'<button class="chip g3d" data-lk="f">👨 '+L2("Bapa","Father")+'</button>':'')+(!p.m?'<button class="chip g3d" data-lk="m">👩 '+L2("Ibu","Mother")+'</button>':'')+
    '<button class="chip g3d'+(sps.length?" dim":"")+'" data-lk="sp">💍 '+L2("Pasangan","Spouse")+'</button><button class="chip g3d" data-lk="c">👶 '+L2("Anak","Child")+'</button><button class="chip g3d" data-lk="sib">👫 '+L2("Adik-beradik","Sibling")+'</button></div>';
  var ov=H.showSheet((p.g==="f"?"👩 ":"👨 ")+E(p.n), h, null);   // 0.33.8 (Farah): closing the card keeps the name highlighted; a tap on empty space in the view clears it
  // 0.33.7 (Farah): Edit sits in the header, top right, left of ✕
  var shx=ov.querySelector("#shX"), eb=document.createElement("button"); eb.className="chip gold g3d fmEh"; eb.id="fmE"; eb.textContent="✎ "+L2("Ubah","Edit"); shx.parentNode.insertBefore(eb, shx);
  var hr=shx.parentNode, wrap=document.createElement("span"); wrap.className="fmhb"; hr.insertBefore(wrap, eb); wrap.appendChild(eb); wrap.appendChild(shx);
  ov.querySelectorAll("[data-lk]").forEach(function(b){ b.onclick=function(){ var r=b.getAttribute("data-lk"); if(r==="sib" && !p.f && !p.m){ H.toast(L2("Tambah bapa atau ibu "+p.n+" dahulu, supaya adik-beradik dapat disambung","Add "+p.n+"'s father or mother first, so siblings can be linked")); return; } pEdit(null,{r:r,of:id}); }; });
  ov.querySelectorAll("[data-pj]").forEach(function(rw){ rw.onclick=function(e){ if(e.target.closest(".fdh")) return; var j=rw.getAttribute("data-pj"); pOpen(j); if(curEng()){ curEng().highlight(j); curEng().focus(j); } markRows(); }; });
  // 0.5.4 (Ihsan): hold and drag the ≡ handle to reorder children and siblings (birth order)
  ov.querySelectorAll("tbody.fsort").forEach(function(tb){ if(!window.IbSort) return; IbSort(tb, {items:"tr[data-pj]", handle:".fdh", axis:"y", key:"data-pj", done:function(ids){
    if(tb.getAttribute("data-sk")==="kid"){ ids.forEach(function(k,i){ var q=P(k); if(q) q.o=i; }); }
    else { var par=p.f||p.m, all=kidsOrd(par).map(function(q){ return q.id; }), me=all.indexOf(p.id); if(me<0) me=all.length; ids.splice(Math.min(me, ids.length), 0, p.id);
      all.forEach(function(k){ if(ids.indexOf(k)<0) ids.push(k); }); ids.forEach(function(k,i){ var q=P(k); if(q) q.o=i; }); }
    sv(); pOpen(id); draw(); }}); });
  ov.querySelectorAll("[data-alt]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-alt"), cur=p.n; p.n=p.alt[i]; p.alt[i]=cur; sv(); pOpen(id); draw(); }; });
  ov.querySelector("#fmE").onclick=function(){ pEdit(id); };
  var me=ov.querySelector("#fmMe"); if(me) me.onclick=function(){ mePick(); };
  var mo=ov.querySelector("#fmMapO"); if(mo) mo.onclick=function(){ H.N.openUrl(mapUrl(p)); };
  var c=ov.querySelector("#fmCall"); if(c) c.onclick=function(){ H.N.openUrl(telUrl(p.tel)); };
  var w=ov.querySelector("#fmWa"); if(w) w.onclick=function(){ H.N.openUrl(waUrl(p.tel)); };
}
// siblings: share a father or a mother, ordered by the parent's child order
function drow(q, name, extra){ return '<tr data-pj="'+q.id+'"><td class="fpn"><span class="fnmw">'+av(q)+'<span class="'+nmCls(q)+'">'+name+'</span></span></td><td class="mut">'+E(extra||"")+'</td><td class="fage">'+(age(q)!=null?age(q):"")+'</td><td class="fdh noswipe" aria-label="≡">≡</td></tr>'; }
function sibsOf(p){ var seen={}, out=[]; [p.f,p.m].forEach(function(par){ if(!par) return; kidsOrd(par).forEach(function(q){ if(q.id!==p.id && !seen[q.id]){ seen[q.id]=1; out.push(q); } }); }); return out; }
// 0.33.6: "This is me" sits only on my own card; tap it to choose someone else as me
function mePick(){ var ov=H.showSheet("⭐ "+L2("Siapa anda?","Who are you?"), '<div class="flistme">'+F.p.slice().sort(function(a,b){ return String(a.n).localeCompare(String(b.n)); }).map(function(x){ return '<button class="chip g3d'+(x.id===F.me?" on":"")+'" data-mp="'+x.id+'">'+E(x.n)+'</button>'; }).join("")+'</div>');
  ov.querySelectorAll("[data-mp]").forEach(function(b){ b.onclick=function(){ F.me=b.getAttribute("data-mp"); sel=F.me; sv(); H.closeOverlay(); draw(); }; }); }
var popH=null;
function popTop(ov){ ov.classList.add("fpopov"); var sh=ov.querySelector(".sheet"); if(!sh) return; if(popH) sh.style.height=popH+"px";
  var n=document.createElement("div"); n.className="fnotch"; n.innerHTML="<span></span>"; sh.appendChild(n);
  var y0=0, h0=0; n.addEventListener("pointerdown", function(e){ e.preventDefault(); n.setPointerCapture(e.pointerId); y0=e.clientY; h0=sh.offsetHeight; n.classList.add("on"); });
  n.addEventListener("pointermove", function(e){ if(!n.classList.contains("on")) return; var hh=Math.max(140, Math.min(window.innerHeight-80, h0+e.clientY-y0)); sh.style.height=hh+"px"; popH=hh; });
  var up=function(){ n.classList.remove("on"); }; n.addEventListener("pointerup", up); n.addEventListener("pointercancel", up); }
// ---------- 3D layout: generations, husband's side left, wife's side right, children in the middle ----------
function layout(){
  var me=F.me&&P(F.me)||F.p[0]; if(!me) return {nodes:[],links:[]};
  var gen={}, q=[me.id]; gen[me.id]=0;
  while(q.length){ var id=q.shift(), p=P(id), g0=gen[id]; if(!p) continue;
    var nb=[[p.f,-1],[p.m,-1]].concat((p.sp||[]).map(function(s){ return [s,0]; })).concat(kids(id).map(function(k){ return [k.id,1]; }));
    nb.forEach(function(x){ if(x[0] && gen[x[0]]===undefined && P(x[0])){ gen[x[0]]=g0+x[1]; q.push(x[0]); } }); }
  F.p.forEach(function(p){ if(gen[p.id]===undefined) gen[p.id]=0; });   // people not linked yet float at the root level
  var x={}; x[me.id]=0; (me.sp||[]).forEach(function(s,i){ x[s]=1.2*(i+1); }); if((me.sp||[]).length){ x[me.id]=me.g==="f"?1.2:-1.2; (me.sp||[]).forEach(function(s,i){ x[s]=(me.g==="f"?-1:1)*1.2*(i+1); }); }
  var ids=F.p.map(function(p){ return p.id; });
  for(var it=0; it<14; it++){
    ids.forEach(function(id){ var p=P(id), w=[], v=[];
      var push=function(val,wt){ if(val!=null && isFinite(val)){ v.push(val*wt); w.push(wt); } };
      if(p.f && x[p.f]!=null) push(x[p.f],1); if(p.m && x[p.m]!=null) push(x[p.m],1);
      kids(id).forEach(function(k){ if(x[k.id]!=null) push(x[k.id],0.8); });
      (p.sp||[]).forEach(function(s){ if(x[s]!=null) push(x[s]+(p.g==="m"?-1.2:1.2),1.2); });
      if(id===me.id && it<10) return;
      if(w.length){ var sw=w.reduce(function(a,b){ return a+b; },0); x[id]=v.reduce(function(a,b){ return a+b; },0)/sw; } else if(x[id]==null) x[id]=0; });
    // spread each generation so names never overlap (keep couples together)
    var byG={}; ids.forEach(function(id){ (byG[gen[id]]=byG[gen[id]]||[]).push(id); });
    Object.keys(byG).forEach(function(g){ var a=byG[g].sort(function(p,q2){ return x[p]-x[q2]; }), gap=2.0;
      for(var i=1;i<a.length;i++){ if(x[a[i]]-x[a[i-1]]<gap) x[a[i]]=x[a[i-1]]+gap; }
      var mid=(x[a[0]]+x[a[a.length-1]])/2, want=a.reduce(function(s,id){ return s+x[id]; },0)/a.length; a.forEach(function(id){ x[id]+=want-mid; }); });
  }
  var nodes=F.p.map(function(p,i){ return {id:p.id, n:p.n, g:p.g, dead:dead(p), me:p.id===me.id, gen:gen[p.id], x:x[p.id]||0, z:Math.sin(i*2.39)*0.9, t:p.t||0}; });
  var links=[]; F.p.forEach(function(p){ var par=[p.f,p.m].filter(function(z){ return z && P(z); }); if(par.length) links.push({t:"pc", a:par, b:p.id});
    (p.sp||[]).forEach(function(s){ if(p.id<s && P(s)) links.push({t:"sp", a:[p.id], b:s}); }); });
  return {nodes:nodes, links:links};
}

// ---------- pages ----------
function stop3(){ if(window.FamTree3D) FamTree3D.stop(); if(window.FamWeb3D) FamWeb3D.stop(); if(window.FamChalk) FamChalk.stop(); if(window.FamVintage) FamVintage.stop(); }
// 0.5.7: photos can be shown or hidden everywhere (F.noImg); names are blue (men) and red (women)
function imgOn(){ return !F.noImg; }
function nmCls(p){ return (p.g==="f"?"fnf":"fnm2")+(dead(p)?" fdn":""); }   // 0.5.8: the late shown in half tone
function av(p, cls){ return imgOn() && p.img ? '<img class="'+(cls||"fav")+'" src="'+p.img+'" alt="">' : ''; }
// 0.33.7: which picture is showing: grass runners (3D) or the chalkboard chart (2D)
function curEng(){ return F.v3==="chalk"?window.FamChalk:F.v3==="vintage"?window.FamVintage:window.FamWeb3D; }
function markRows(){ document.querySelectorAll("[data-fr]").forEach(function(r){ r.classList.toggle("sel", r.getAttribute("data-fr")===sel); }); }
// 0.33.7 (Farah): the whole tree as one simple chart in a single PDF page; the more names, the smaller the writing
// 0.5.9: the vintage tree as a landscape poster PDF (parchment, border, calligraphy), one A4 page that also prints well at A3 / A2
function vTitle(){ var me=P(F.me); return L2("Salasilah Keluarga","The Family of")+(me?" "+me.n:""); }
function vSub(){ return dstr(ymd(today()))+" · "+F.p.length+" "+L2("orang","people"); }
function famPoster(){
  if(!F.p.length){ H.toast(L2("Tiada nama lagi","No names yet")); return; }
  var go=function(){ H.toast(L2("Menyediakan poster…","Preparing the poster…")); FamVintage.poster(F.p, F.me||F.p[0].id, {img:imgOn(), title:vTitle(), sub:vSub()}, function(cv){ if(!cv) return;
    var img=cv.toDataURL("image/jpeg", 0.9), t=vTitle();
    var html='<!doctype html><!--landscape--><html><head><meta charset="utf-8"><title>'+E(t)+'</title><style>@page{size:A4 landscape;margin:0}html,body{margin:0;padding:0;background:#fff}.pg{width:297mm;height:209.5mm;overflow:hidden;page-break-after:avoid}img{width:297mm;height:209.5mm;object-fit:fill;display:block}</style></head><body><div class="pg"><img src="'+img+'"></div></body></html>';
    famOut(cv, t, true, html); }); };
  if(window.FamVintage && window.FamChart) go(); else H.loadJs([window.THREE?null:"hajj/three.min.js",window.FamChart?null:"family/famchalk.js","family/famvintage.js"].filter(Boolean), go); }
function famPdf(){
  if(F.v3==="vintage"){ famPoster(); return; }
  if(!F.p.length || !window.FamChart){ H.toast(L2("Tiada nama lagi","No names yet")); return; }
  var L=FamChart.build(F.p, F.me, "print"), land=L.W>=L.H*0.9, pw=land?297:210, ph=land?210:297;
  var k=Math.min(3, 4200/Math.max(L.W, L.H)), cv=document.createElement("canvas"); cv.width=Math.round(L.W*k); cv.height=Math.round(L.H*k);
  var me=P(F.me), t=L2("Salasilah keluarga","Family tree")+(me?" "+me.n:"")+" · "+dstr(ymd(today()))+" · "+F.p.length+" "+L2("orang","people");
  FamChart.draw(cv, L, null, t);
  var img=cv.toDataURL("image/png"), title=L2("Salasilah","Family tree")+(me?" "+me.n:"");
  var html='<!doctype html><!--'+(land?"landscape":"portrait")+'--><html><head><meta charset="utf-8"><title>'+E(title)+'</title><style>@page{size:A4 '+(land?"landscape":"portrait")+';margin:0}html,body{margin:0;padding:0;background:#fff}'+
    '.pg{width:'+pw+'mm;height:'+(ph-0.5)+'mm;display:flex;align-items:center;justify-content:center;overflow:hidden;page-break-after:avoid}img{max-width:'+(pw-16)+'mm;max-height:'+(ph-16)+'mm;object-fit:contain}</style></head><body><div class="pg"><img src="'+img+'"></div></body></html>';
  famOut(cv, title, land, html);
}
// 0.5.23 poster export: a real PDF file at A4 to A1 (share to WhatsApp, Drive or a print shop), or the print dialog
function famPrint(html, t){ if(window.Native && H.N.printHtml){ var hl=function(r){ H.off("pdf", hl); if(!(r && r.ok)) H.toast(L2("PDF gagal","PDF failed")); }; H.on("pdf", hl);
    H.toast(L2("Pilih \"Simpan sebagai PDF\" sebagai pencetak","Choose \"Save as PDF\" as the printer")); H.N.printHtml(html, t); }
  else { var w=window.open("", "_blank"); if(w){ w.document.write(html); w.document.close(); setTimeout(function(){ w.print(); }, 400); } else window.__poster=html; } }
var PSZ=[["A4",297,210],["A3",420,297],["A2",594,420],["A1",841,594]];
function famOut(cv, t, land, html){ window.__posterCv=cv;
  var ov=H.showSheet("🖼 "+L2("Poster salasilah","Family tree poster"), '<div class="mut small">'+L2("Fail PDF satu halaman. Saiz besar sesuai untuk kedai cetak.","A one-page PDF file. Bigger sizes suit a print shop.")+'</div>'+
    '<div class="btns" style="margin:8px 0">'+PSZ.map(function(z){ return '<button class="chip" data-psz="'+z[0]+'">📄 '+z[0]+'</button>'; }).join("")+'</div>'+
    '<button class="btn full" id="fpPrint">🖨 '+L2("Cetak / Simpan melalui pencetak","Print / save through the printer")+'</button>');
  ov.querySelectorAll("[data-psz]").forEach(function(b){ b.onclick=function(){ var z=PSZ.filter(function(x){ return x[0]===b.getAttribute("data-psz"); })[0], a=z[1], c=z[2];
    // keep the picture's shape: fit it on the page, white margin around
    var pw=land?a:c, ph=land?c:a, k=Math.min(pw/cv.width, ph/cv.height)*0.94, out=document.createElement("canvas"), px=Math.min(6000/Math.max(pw, ph), 7);
    out.width=Math.round(pw*px); out.height=Math.round(ph*px); var g=out.getContext("2d"); g.fillStyle="#fff"; g.fillRect(0, 0, out.width, out.height);
    var dw=cv.width*k*px, dh=cv.height*k*px; g.drawImage(cv, (out.width-dw)/2, (out.height-dh)/2, dw, dh);
    var b64=H.canvasPdf(out, pw, ph, 0.9), nm=(L2("salasilah","family-tree")+"-"+z[0]+".pdf").toLowerCase(); window.__posterPdf=b64; H.closeOverlay(); H.sharePdf(nm, b64, t); }; });
  ov.querySelector("#fpPrint").onclick=function(){ H.closeOverlay(); famPrint(html, t); }; }
// 0.33.5 (Farah): one 3D view (grass runners, me in the centre); under it Add and full screen. The family is a numbered table:
// name · L/P · age · relation · 📞 💬 (blank when unknown). Tap a row (or a name in 3D, twice) for the info card.
var fsort={k:"seq", d:1};
function seqOf(){ var L=layout(), g={}; L.nodes.forEach(function(n){ g[n.id]=n.gen; }); return g; }
function hjOf(s){ var b=pd(s), h=b&&hj(b); return h?hstr(h):""; }
function mapUrl(p){ return p.lat!=null&&p.lon!=null ? "https://www.google.com/maps/search/?api=1&query="+p.lat+","+p.lon : "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(p.addr||""); }
function rowsSorted(){ var g=seqOf(), L=F.p.slice(), k=fsort.k, d=fsort.d;
  var bt=function(p){ var b=pd(p.b); return b?b.getTime():9e15; };
  L.sort(function(a,b){ var r=0;
    if(k==="name") r=String(a.n).localeCompare(String(b.n));
    else if(k==="age") r=bt(a)-bt(b);
    else if(k==="rel") r=String(rel(a)).localeCompare(String(rel(b)));
    else r=((g[a.id]||0)-(g[b.id]||0)) || ((a.o!=null?a.o:1e9)-(b.o!=null?b.o:1e9)) || (bt(a)-bt(b)) || ((a.t||0)-(b.t||0));
    return r*d; });
  return L; }
function famTable(){
  var L=rowsSorted(), arw=function(k){ return fsort.k===k?(fsort.d>0?"▲":"▼"):""; };
  var h='<div class="card ftab"><table class="ftbl fmtb"><thead><tr><th data-fs="seq">#'+arw("seq")+'</th><th data-fs="name">'+L2("Nama","Name")+arw("name")+'</th><th data-fs="age" class="fage">'+L2("Umur","Age")+arw("age")+'</th><th data-fs="rel">'+L2("Hubungan","Relation")+arw("rel")+'</th><th></th></tr></thead><tbody>';
  L.forEach(function(p,i){ var a=age(p);
    h+='<tr class="frw'+(p.id===F.me?" me":"")+(p.id===sel?" sel":"")+(dead(p)?" fdead":"")+'" data-fr="'+p.id+'"><td class="fno">'+(i+1)+'</td><td class="fnm"><span class="fnmw">'+av(p)+'<span class="'+nmCls(p)+'">'+E(p.n)+'</span></span>'+(dead(p)?' <small class="mut">'+L2("(arwah)","(late)")+'</small>':'')+'</td><td class="fage">'+(a!=null?a:"")+'</td><td class="frl">'+E(rel(p))+'</td><td class="fic2">'+(p.tel?'<button class="ib" data-fcall="'+p.id+'">📞</button><button class="ib" data-fwa="'+p.id+'">💬</button>':'')+'</td></tr>'; });
  h+='</tbody></table><div class="btns fxio"><button class="btn alt g3d" id="fmExp">⬆ '+L2("Eksport","Export")+'</button><button class="btn alt g3d" id="fmImp">⬇ '+L2("Import","Import")+'</button><button class="btn alt g3d" id="fmPdf">📄 PDF</button><button class="btn alt g3d" id="fmCc">☎ +'+(F.cc||(H.cc?H.cc():"60"))+'</button></div></div>';
  return h; }
function bindTable(el, eng){
  el.querySelectorAll("[data-fs]").forEach(function(t){ t.onclick=function(){ var k=t.getAttribute("data-fs"); if(fsort.k===k) fsort.d=-fsort.d; else fsort={k:k,d:1}; redrawTable(el, eng); }; });
  el.querySelectorAll("[data-fr]").forEach(function(r){ r.onclick=function(e){ if(e.target.closest("[data-fcall],[data-fwa]")) return; var id=r.getAttribute("data-fr"); sel=id; if(eng()){ eng().highlight(id); eng().focus(id); } pOpen(id); }; });
  el.querySelectorAll("[data-fcall]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); H.N.openUrl(telUrl(P(b.getAttribute("data-fcall")).tel)); }; });
  el.querySelectorAll("[data-fwa]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); H.N.openUrl(waUrl(P(b.getAttribute("data-fwa")).tel)); }; });
  var x=el.querySelector("#fmExp"); if(x) x.onclick=famExport;
  var im=el.querySelector("#fmImp"); if(im) im.onclick=famImport;
  var cc=el.querySelector("#fmCc"); if(cc) cc.onclick=ccSheet;
  var pf=el.querySelector("#fmPdf"); if(pf) pf.onclick=function(){ if(window.FamChart) famPdf(); else H.loadJs(["family/famchalk.js"], famPdf); };
}
function redrawTable(el, eng){ var t=el.querySelector(".ftab"); if(!t) return; var w=document.createElement("div"); w.innerHTML=famTable(); t.replaceWith(w.firstChild); bindTable(el, eng); }
function vTree(el){
  var ck=F.v3==="chalk", vt=F.v3==="vintage";
  var h='<div class="chips fseg fmv3"><button class="chip g3d'+(!ck&&!vt?" on":"")+'" data-v3="grass">🌱 '+L2("Rumput 3D","Grass 3D")+'</button><button class="chip g3d'+(ck?" on":"")+'" data-v3="chalk">🖍 '+L2("Papan kapur","Chalkboard")+'</button><button class="chip g3d'+(vt?" on":"")+'" data-v3="vintage">📜 '+L2("Vintaj","Vintage")+'</button></div>';
  h+='<div class="fmhero"><div id="fm3d" class="fm3d '+(ck?"fmchalk":vt?"fmvint":"fmgrass")+'"><div class="mut small fm3dl">'+(ck?L2("Menulis di papan…","Writing on the board…"):vt?L2("Pokok sedang tumbuh…","The tree is growing…"):L2("Rumput sedang menjalar…","The grass is creeping out…"))+'</div></div>'+
    '<div class="fmov"><span class="fmct">'+(ck?"🖍 ":vt?"📜 ":"🌱 ")+F.p.length+' '+L2("orang","people")+'</span><button class="chip g3d fmx" id="fmX2" aria-label="close">✕</button></div></div>';
  h+='<div class="fmnotch" id="fmNotch" title="'+L2("Seret untuk ubah tinggi","Drag to change the height")+'"><span></span></div>';
  h+='<div class="chips fseg fmsty"><span class="mut tiny fmhint">'+L2("Ketik nama untuk kad maklumat. Ketik tempat kosong untuk batal.","Tap a name for its card. Tap empty space to clear.")+'</span><span class="fmsp"></span>'+(vt?'<button class="chip g3d" id="fmPoster">📜 '+L2("Poster PDF","Poster PDF")+'</button>':'')+'<button class="chip g3d'+(imgOn()?" on":"")+'" id="fmImgT" title="'+L2("Tunjuk / sorok gambar","Show / hide photos")+'">🖼</button><button class="chip g3d" id="fmAdd">＋ '+L2("Tambah","Add")+'</button><button class="chip g3d" id="fmFull" aria-label="full screen">⤢</button></div>';
  if(F.p.length) h+=famTable();
  else h+='<div class="card mut small">'+L2("Mula dengan nama anda, kemudian tambah ibu bapa, pasangan, anak dan seterusnya. Atau ⬇ Import fail salasilah daripada ahli keluarga.","Start with your name, then add parents, spouse, children and so on. Or ⬇ Import a family file from a relative.")+'<div class="btns" style="margin-top:8px"><button class="btn alt g3d" id="fmImp">⬇ '+L2("Import","Import")+'</button></div></div>';
  h+='<div class="mut tiny" style="margin:6px 4px">'+(ck?L2("Generasi tertua di atas. Suami isteri bersebelahan dengan ♥, satu garis turun kepada anak-anak, sulung di kiri. Seret untuk gerak, cubit untuk zum.","Eldest generation on top. Husband and wife side by side with a ♥, one line down to their children, eldest on the left. Drag to move, pinch to zoom."):"")+(ck?"":L2("Anda di tengah, pasangan di sebelah dengan ❤. Setiap anak tumbuh dari satu dahan antara ibu bapanya: berkayu di hujung ibu bapa, batang hijau di hujung anak. Setiap gelang ialah satu langkah lebih jauh.","You are in the centre, your spouse beside you with a ❤. Each child grows from one branch between the parents: woody at the parents' end, a green stalk at the child's end. Each ring is one step further."))+'</div>';
  h+=H.ayat(["4:1","49:13"]);
  el.innerHTML=h+dock();
  var eng=curEng;
  el.querySelectorAll("[data-v3]").forEach(function(b){ b.onclick=function(){ var v=b.getAttribute("data-v3"); if((F.v3||"grass")===v) return; stop3(); F.v3=v==="grass"?"":v; sv(); vTree(el); }; });
  el.querySelector("#fmAdd").onclick=function(){ if(!F.p.length){ pEdit(null); return; } var of=sel&&P(sel)?sel:(F.me||F.p[0].id), q=P(of);
    var ov=H.showSheet("＋ "+L2("Tambah saudara ","Add a relative of ")+E(q.n), '<div class="chips fpadd" style="flex-wrap:wrap">'+(!q.f?'<button class="chip g3d" data-lk="f">👨 '+L2("Bapa","Father")+'</button>':'')+(!q.m?'<button class="chip g3d" data-lk="m">👩 '+L2("Ibu","Mother")+'</button>':'')+'<button class="chip g3d" data-lk="sp">💍 '+L2("Pasangan","Spouse")+'</button><button class="chip g3d" data-lk="c">👶 '+L2("Anak","Child")+'</button><button class="chip g3d" data-lk="">👤 '+L2("Orang lain","Someone else")+'</button></div><div class="mut tiny">'+L2("Pilih nama lain dahulu (ketik di 3D atau jadual) untuk menambah saudaranya.","Pick another name first (tap it in 3D or the table) to add their relatives.")+'</div>');
    ov.querySelectorAll("[data-lk]").forEach(function(b){ b.onclick=function(){ var r=b.getAttribute("data-lk"); pEdit(null, r?{r:r,of:of}:null); }; }); };
  var full=function(){ var b=el.querySelector(".fmhero"); b.classList.toggle("full"); if(eng()) eng().resize(); };
  el.querySelector("#fmFull").onclick=full; el.querySelector("#fmX2").onclick=full;
  el.querySelector("#fmImgT").onclick=function(){ F.noImg=!F.noImg; sv(); H.toast(F.noImg?L2("Gambar disorok","Photos hidden"):L2("Gambar ditunjukkan","Photos shown")); stop3(); vTree(el); };
  var pst=el.querySelector("#fmPoster"); if(pst) pst.onclick=famPoster;
  bindTable(el, eng);
  var box=el.querySelector("#fm3d");
  // 0.33.6: drag the notch under the 3D view to make it taller or shorter (remembered)
  if(F.h3d) box.style.height=F.h3d+"px";
  var nt=el.querySelector("#fmNotch"), ny=0, nh=0; nt.addEventListener("pointerdown", function(e){ e.preventDefault(); nt.setPointerCapture(e.pointerId); ny=e.clientY; nh=box.offsetHeight; nt.classList.add("on"); });
  nt.addEventListener("pointermove", function(e){ if(!nt.classList.contains("on")) return; var hh=Math.max(180, Math.min(window.innerHeight*0.85, nh+e.clientY-ny)); box.style.height=hh+"px"; F.h3d=Math.round(hh); });
  var nup=function(){ if(nt.classList.contains("on")){ nt.classList.remove("on"); sv(); } }; nt.addEventListener("pointerup", nup); nt.addEventListener("pointercancel", nup);
  // 0.33.7 (Farah): the first tap on a name marks it and opens its card; a tap on empty space clears both
  // 0.33.8 (Farah): a quick tap made the phone send a "click" right after the finger lifted; it landed on the new card's backdrop and shut it at once, so only a long hold worked. Swallow that one click.
  var eatClick=function(){ var t=Date.now(), f=function(e){ window.removeEventListener("click", f, true); if(Date.now()-t<600){ e.stopPropagation(); e.preventDefault(); } }; window.addEventListener("click", f, true); setTimeout(function(){ window.removeEventListener("click", f, true); }, 650); };
  var onSel=function(id){ sel=id; markRows(); if(id){ eatClick(); pOpen(id); } else { var ov=document.getElementById("overlay"); if(ov && ov.className==="sheetov") H.closeOverlay(); } };
  var fail=function(err){ console.error(err); box.innerHTML='<div class="mut small fm3dl">'+L2("Gambar tidak dapat dipaparkan pada telefon ini.","The picture could not be shown on this phone.")+'</div>'; };
  if(vt){
    var goV=function(){ if(!document.body.contains(box)) return; try{ var me=P(F.me); FamVintage.mount(box, F.p, F.me||F.p[0]&&F.p[0].id, {sel:sel, img:imgOn(), title:vTitle(), sub:vSub(), onSel:onSel}); }catch(err){ fail(err); } };
    if(!F.p.length){ box.innerHTML='<div class="mut small fm3dl">'+L2("Belum ada nama","No names yet")+'</div>'; return; }
    if(window.THREE && window.FamVintage && window.FamChart) goV(); else H.loadJs([window.THREE?null:"hajj/three.min.js",window.FamChart?null:"family/famchalk.js","family/famvintage.js"].filter(Boolean), goV); return; }
  if(ck){
    var goC=function(){ if(!document.body.contains(box)) return; try{ var me=P(F.me); FamChalk.mount(box, F.p, F.me||F.p[0]&&F.p[0].id, {sel:sel, title:L2("Salasilah keluarga","Family tree")+(me?" "+me.n:""), onSel:onSel}); }catch(err){ fail(err); } };
    if(!F.p.length){ box.innerHTML='<div class="mut small fm3dl">'+L2("Papan masih kosong","The board is still empty")+'</div>'; return; }
    if(window.THREE && window.FamChalk) goC(); else H.loadJs([window.THREE?null:"hajj/three.min.js","family/famchalk.js"].filter(Boolean), goC); return; }
  var go2=function(){ if(!document.body.contains(box)) return; try{ FamWeb3D.mount(box, layout(), {style:"grass", onPick:function(id){ eatClick(); pOpen(id); }, onSel:onSel}); if(sel) FamWeb3D.highlight(sel); }catch(err){ fail(err); } };
  if(window.THREE && window.FamWeb3D) go2(); else H.loadJs([window.THREE?null:"hajj/three.min.js","family/famweb3d.js"].filter(Boolean), go2);
}
// ---------- phone country code: from where the app's location is, or set by hand ----------
function ccSheet(){ var L=[["60","🇲🇾 Malaysia"],["62","🇮🇩 Indonesia"],["65","🇸🇬 Singapore"],["673","🇧🇳 Brunei"],["66","🇹🇭 Thailand"],["966","🇸🇦 Saudi Arabia"],["971","🇦🇪 UAE"],["44","🇬🇧 UK"],["61","🇦🇺 Australia"],["1","🇺🇸 USA / Canada"]], auto=H.cc?H.cc():"60";
  var ov=H.showSheet("☎ "+L2("Kod negara telefon","Phone country code"), '<div class="mut small">'+L2("Nombor bermula dengan 0 akan guna kod ini untuk panggilan dan WhatsApp. Auto ikut lokasi aplikasi: +","Numbers starting with 0 use this code for calls and WhatsApp. Auto follows the app's location: +")+auto+'</div><div class="chips" style="flex-wrap:wrap;margin-top:8px"><button class="chip g3d'+(!F.cc?" on":"")+'" data-cc="">Auto (+'+auto+')</button>'+L.map(function(x){ return '<button class="chip g3d'+(F.cc===x[0]?" on":"")+'" data-cc="'+x[0]+'">'+x[1]+' +'+x[0]+'</button>'; }).join("")+'</div>');
  ov.querySelectorAll("[data-cc]").forEach(function(b){ b.onclick=function(){ F.cc=b.getAttribute("data-cc")||null; sv(); H.closeOverlay(); draw(); }; }); }
// ---------- export / import (merge) ----------
function famExport(){ var me=P(F.me), json=JSON.stringify({app:"My Ihsan", kind:"family", v:"0.33.5", at:new Date().toISOString(), me:F.me, meName:me?me.n:"", p:F.p}), name="salasilah-"+(me?String(me.n).toLowerCase().replace(/[^a-z0-9]+/g,"-"):"keluarga")+"-"+ymd(new Date())+".json";
  if(window.Native && H.N.saveFile) H.N.saveFile(name, json); else { var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([json],{type:"application/json"})); a.download=name; document.body.appendChild(a); a.click(); a.remove(); }
  // 0.5.6 (Ihsan): share the .json file itself (not the text), to WhatsApp when it is installed; the receiver taps it › Family (My Ihsan)
  setTimeout(function(){ var ov=H.showSheet("⬆ "+L2("Salasilah disimpan","Family tree saved"), '<div class="small mut">'+E(name)+'</div><div class="btns" style="margin-top:10px"><button class="btn gold g3d" id="fmShWa">💬 '+L2("Kongsi fail ke WhatsApp","Share the file to WhatsApp")+'</button><button class="btn alt g3d" id="fmShAny">📤 '+L2("Aplikasi lain","Other apps")+'</button></div>'+
      '<div class="mut tiny" style="margin-top:8px">'+L2("Penerima ketik fail itu dalam WhatsApp, pilih Kongsi atau Buka dengan › Family (My Ihsan), kemudian pilih siapa dirinya dalam salasilah.","The receiver taps the file in WhatsApp, chooses Share or Open with › Family (My Ihsan), then picks who they are in the tree.")+'</div>');
    var sh=function(pkg){ H.closeOverlay(); if(window.Native && H.N.shareFile) H.N.shareFile(name, json, "application/json", pkg); else H.toast(L2("Fail disimpan","File saved")); };
    ov.querySelector("#fmShWa").onclick=function(){ sh("com.whatsapp,com.whatsapp.w4b"); }; ov.querySelector("#fmShAny").onclick=function(){ sh(""); }; }, 500); }
function famImport(){ var got=function(body){ famPickMe(body); };
  if(window.Native && H.N.openFile){ window.IbOpenOnce=got; H.N.openFile(); return; }
  var inp=document.createElement("input"); inp.type="file"; inp.accept=".json,application/json"; inp.onchange=function(){ var f=inp.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ got(r.result); }; r.readAsText(f); }; inp.click(); }
window.FamImportText=function(t){ famPickMe(t); };
// 0.5.6 (Ihsan): first ask who you are in the received tree; that person becomes you (joined to your own card) when merging
function famParse(body){ var j=null; try{ j=JSON.parse(body); }catch(e){}
  if(j && j.data && j.data.ihsan_family){ try{ var fx=JSON.parse(j.data.ihsan_family); j={p:fx.p, me:fx.me}; }catch(e){ j=null; } }
  return j && Array.isArray(j.p) ? j : null; }
function famPickMe(body){ var j=famParse(body); if(!j){ H.toast(L2("Fail ini bukan data salasilah","This is not a family file")); return; }
  var L=j.p.filter(function(q){ return q && q.id && q.n; }).slice().sort(function(a,b){ return String(a.n).localeCompare(String(b.n)); }), myMe=P(F.me);
  var ov=H.showSheet("⬇ "+L2("Siapa anda dalam salasilah ini?","Who are you in this tree?"), '<div class="small mut">'+L.length+L2(" orang"," people")+(j.meName?' · '+L2("dihantar oleh ","sent by ")+'<b>'+E(j.meName)+'</b>':'')+'</div>'+
    (myMe?'<div class="mut tiny" style="margin:4px 0 6px">'+L2("Orang yang anda pilih akan digabung dengan kad anda (","The person you pick is joined to your own card (")+E(myMe.n)+L2(").",").")+'</div>':'')+
    '<input id="fmPq" class="rin" placeholder="🔎 '+L2("Cari nama","Search names")+'" style="margin:6px 0">'+
    '<div class="flistme" id="fmPl">'+L.map(function(q){ return '<button class="chip g3d'+(myMe && sameName(q.n, myMe.n)?" on":"")+'" data-pm="'+E(q.id)+'">'+(q.g==="f"?"👩 ":"👨 ")+E(q.n)+(q.id===j.me?' <small class="mut">('+L2("pengirim","sender")+')</small>':'')+'</button>'; }).join("")+'</div>'+
    '<button class="btn alt full g3d" data-pm="" style="margin-top:10px">🙅 '+L2("Saya tiada dalam salasilah ini","I am not in this tree")+'</button>');
  ov.querySelector("#fmPq").oninput=function(){ var v=this.value.toLowerCase(); ov.querySelectorAll("#fmPl [data-pm]").forEach(function(b){ b.style.display=b.textContent.toLowerCase().indexOf(v)>=0?"":"none"; }); };
  ov.querySelectorAll("[data-pm]").forEach(function(b){ b.onclick=function(){ H.closeOverlay(); famMerge(body, b.getAttribute("data-pm")||null); }; }); }
function normName(n){ return String(n||"").toLowerCase().replace(/\b(bin|binti|bt|bte|b\.|a\/l|a\/p)\b.*$/,"").replace(/[^a-zÀ-ɏ ]+/g," ").replace(/\s+/g," ").trim(); }
function sameName(a, b){ var x=normName(a), y=normName(b); if(!x||!y) return false; if(x===y) return true; var s=x.length<y.length?x:y, l=x.length<y.length?y:x; return (" "+l+" ").indexOf(" "+s+" ")>=0; }
function famMerge(body, pickMe){
  var j=famParse(body);
  if(!j){ H.toast(L2("Fail ini bukan data salasilah","This is not a family file")); return; }
  var map={}, conf=[], added=0, merged=0;
  j.p.forEach(function(q){ if(!q || !q.id || !q.n) return; var m=(pickMe && q.id===pickMe && P(F.me)) ? P(F.me) : P(q.id);
    if(!m){ var c=F.p.filter(function(x){ return !map._used || true; }).filter(function(x){ return sameName(x.n, q.n) && (!x.g||!q.g||x.g===q.g); }); if(c.length===1) m=c[0]; }
    if(m){ map[q.id]=m.id; merged++; if(normName(m.n)!==normName(q.n) || m.n!==q.n){ if(m.n!==q.n){ conf.push(m.id); m.alt=(m.alt||[]).filter(function(a){ return a!==q.n; }).concat([q.n]); if(q.n.length<m.n.length){ var t=m.n; m.n=q.n; m.alt=m.alt.filter(function(a){ return a!==q.n; }).concat([t]); } } }
      ["g","b","dd","tel","addr","lat","lon","note"].forEach(function(k){ if((m[k]==null||m[k]==="") && q[k]!=null && q[k]!=="") m[k]=q[k]; }); }
    else { var nid=P(q.id)?uid():q.id, np=JSON.parse(JSON.stringify(q)); np.id=nid; np.f=null; np.m=null; np.sp=[]; F.p.push(np); map[q.id]=nid; added++; } });
  j.p.forEach(function(q){ var me2=P(map[q.id]); if(!me2) return; ["f","m"].forEach(function(k){ if(q[k] && map[q[k]] && !me2[k]) me2[k]=map[q[k]]; });
    (q.sp||[]).forEach(function(s){ var t=map[s]; if(t && t!==me2.id && (me2.sp||[]).indexOf(t)<0) me2.sp=(me2.sp||[]).concat([t]); }); });
  if(pickMe && map[pickMe]) F.me=map[pickMe]; else if(!F.me) F.me=F.p[0]&&F.p[0].id; sv();
  // who am I in this data, and which name to use where two names were found for one person
  var ov=H.showSheet("⬇ "+L2("Import selesai","Import done"), '<div class="small">'+L2("Baru: ","New: ")+added+' · '+L2("Digabung: ","Merged: ")+merged+'</div>'+
    (j.meName?'<div class="small mut" style="margin-top:4px">'+L2("Dalam fail ini, \"saya\" ialah ","In this file, \"me\" is ")+'<b>'+E(j.meName)+'</b></div>':'')+
    (P(F.me)?'<div class="small" style="margin-top:6px">⭐ '+L2("Anda: ","You: ")+'<b>'+E(P(F.me).n)+'</b></div>':'')+
    (conf.length?'<div class="snl" style="margin-top:10px">'+L2("Nama berbeza untuk orang yang sama (nama lebih pendek dipilih):","Different names for the same person (the shorter one is chosen):")+'</div>'+conf.map(function(id){ var x=P(id); return '<div class="fcf">'+[x.n].concat(x.alt||[]).map(function(n,i){ return '<button class="chip g3d'+(i===0?" on":"")+'" data-cn="'+id+'" data-i="'+i+'">'+E(n)+'</button>'; }).join("")+'</div>'; }).join(""):'')+
    '<button class="btn gold full g3d" id="fmImOk" style="margin-top:12px">✓ '+L2("Simpan","Save")+'</button>');
  ov.querySelectorAll("[data-cn]").forEach(function(b){ b.onclick=function(){ var x=P(b.getAttribute("data-cn")), i=+b.getAttribute("data-i"); if(i===0) return; var all=[x.n].concat(x.alt||[]), pick=all[i]; x.n=pick; x.alt=all.filter(function(n,k){ return k!==i; });
    b.parentNode.querySelectorAll("[data-cn]").forEach(function(c,k){ c.textContent=k===0?x.n:x.alt[k-1]; c.classList.toggle("on",k===0); }); }; });
  ov.querySelector("#fmImOk").onclick=function(){ sv(); H.closeOverlay(); draw(); H.toast(L2("Salasilah dikemas kini","Family tree updated")); };
}
// ---------- 0.33.5: date wheel (day / month / year) that loops round like a phone date picker; weekday and Hijri shown as you scroll ----------
var MSH=["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"], MEN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], WREP=7;
function wheelHtml(id, val){
  var y0=new Date().getFullYear(), col=function(k, items){ var one=items.map(function(x){ return '<div class="fwi" data-v="'+x[0]+'">'+x[1]+'</div>'; }).join(""), all=""; for(var r=0;r<WREP;r++) all+=one; return '<div class="fwc" data-wk="'+k+'" data-n="'+items.length+'"><div class="fwpad"></div>'+all+'<div class="fwpad"></div></div>'; };
  var D=[["","—"]], Mo=[["","—"]], Y=[["","—"]]; for(var d=1;d<=31;d++) D.push([d,("0"+d).slice(-2)]); for(var m=1;m<=12;m++) Mo.push([m,("0"+m).slice(-2)+" "+(H.en()?MEN:MSH)[m-1]]); for(var y=y0;y>=1900;y--) Y.push([y,y]);
  return '<div class="fwh" id="'+id+'" data-val="'+(val||"")+'"><div class="fwheel">'+col("d",D)+col("m",Mo)+col("y",Y)+'<div class="fwband"></div></div><div class="fwhj small"></div></div>'; }
function wheelBind(root){
  var ih=36, cols=root.querySelectorAll(".fwc"), out=root.querySelector(".fwhj"), v=String(root.getAttribute("data-val")||"").split("-");
  var want={y:+v[0]||2000, m:+v[1]||"", d:+v[2]||""}, tm=null;
  var pick=function(c){ var i=Math.round(c.scrollTop/ih), its=c.querySelectorAll(".fwi"); its.forEach(function(x,j){ x.classList.toggle("on", j===i); }); return its[i]?its[i].getAttribute("data-v"):""; };
  var loop=function(c){ var n=+c.getAttribute("data-n"), i=Math.round(c.scrollTop/ih); if(i<n*2 || i>=n*(WREP-2)){ var k=((i%n)+n)%n; c.scrollTop=(n*Math.floor(WREP/2)+k)*ih; } };
  var upd=function(){ var o={}; cols.forEach(function(c){ loop(c); o[c.getAttribute("data-wk")]=pick(c); }); var s="";
    if(o.y && o.m && o.d){ var dim=new Date(+o.y, +o.m, 0).getDate(), dd=Math.min(+o.d, dim); s=o.y+"-"+("0"+o.m).slice(-2)+"-"+("0"+dd).slice(-2); }
    root.setAttribute("data-val", s); out.innerHTML=s?'📅 <b>'+wdLong(s)+'</b>, '+dstr(s)+(hjOf(s)?' · 🌙 <b>'+hjOf(s)+'</b>':''):'<span class="mut">'+L2("Tatal hari, bulan dan tahun","Scroll the day, month and year")+'</span>'; };
  cols.forEach(function(c){ var k=c.getAttribute("data-wk"), n=+c.getAttribute("data-n"), its=c.querySelectorAll(".fwi"), idx=0; for(var j=0;j<n;j++) if(String(its[j].getAttribute("data-v"))===String(want[k])) idx=j;
    c.scrollTop=(n*Math.floor(WREP/2)+idx)*ih; c.addEventListener("scroll", function(){ clearTimeout(tm); tm=setTimeout(upd, 110); }, {passive:true});
    its.forEach(function(x,j){ x.onclick=function(){ c.scrollTo({top:j*ih, behavior:"smooth"}); }; }); });
  setTimeout(upd, 30); }
function wheelVal(root){ return root.getAttribute("data-val")||""; }
function vBday(el){
  var t=today(), L=F.p.filter(function(p){ return p.b && !p.dd; }).map(function(p){ var g=nextG(p), hh=nextH(p); return {p:p, g:g, h:hh, dg:g?days(t,g):999, dh:hh?days(t,hh):999}; }).sort(function(a,b){ return Math.min(a.dg,a.dh)-Math.min(b.dg,b.dh); });
  var h='<div class="card"><div class="row"><h3 style="margin:0">🎂 '+L2("Hari lahir","Birthdays")+'</h3><label class="trt"><span>🔔</span><span class="switch sm"><input type="checkbox" id="fmRem" '+(F.rem?"checked":"")+'><span></span></span></label></div><div class="mut tiny">'+L2("Masihi dan Hijrah. Peringatan jam 8 pagi pada hari itu.","Gregorian and Hijri. A reminder at 8 am on the day.")+'</div></div>';
  h+=L.length?'<div class="card flist">'+L.map(function(x){ var a=age(x.p);
    return '<button class="frow fbtn" data-po="'+x.p.id+'"><span class="fic">'+(x.dg===0||x.dh===0?"🎉":"🎂")+'</span><span class="fmain"><b>'+E(x.p.n)+'</b><small>'+dstr(x.p.b)+' · '+L2("umur ","age ")+a+(x.p.tel?' · ☎':'')+'</small><small>🌙 '+hstr(hj(pd(x.p.b)))+'</small></span>'+
      '<span class="famt"><span>'+(x.dg===0?L2("Hari ini","Today"):x.dg+L2(" hari"," d"))+'</span><small>🌙 '+(x.dh===0?L2("hari ini","today"):x.dh<999?x.dh+L2(" hari"," d"):"–")+'</small></span></button>'; }).join("")+'</div>'
    :'<div class="card mut small">'+L2("Tambah tarikh lahir dalam Salasilah.","Add dates of birth in the family tree.")+'</div>';
  var dead=F.p.filter(function(p){ return p.dd; }); if(dead.length) h+='<div class="card"><h3>🤲 '+L2("Yang telah pergi","Those who have passed")+'</h3>'+dead.map(function(p){ return '<div class="small">'+E(p.n)+' · '+dstr(p.dd)+' ('+hstr(hj(pd(p.dd)))+')</div>'; }).join("")+'<div class="mut tiny" style="margin-top:6px">'+L2("Sedekahkan Al-Fatihah dan doakan mereka.","Recite Al-Fatihah and pray for them.")+'</div></div>';
  el.innerHTML=h+dock();
  el.querySelector("#fmRem").onchange=function(){ F.rem=this.checked; sv(); };
  el.querySelectorAll("[data-po]").forEach(function(b){ b.onclick=function(){ pOpen(b.getAttribute("data-po")); }; });
}
var nq={g:"all", q:"", l:"", fav:false};
function vNames(el, noDock){
  var N=window.BABY_NAMES||[];
  var h='<div class="card"><h3>👶 '+L2("Nama bayi Islam","Islamic baby names")+'</h3><input type="search" id="nmQ" class="ilq" placeholder="🔍 '+L2("Cari nama atau maksud…","Search a name or meaning…")+'" value="'+E(nq.q)+'" style="width:100%">'+
    '<div class="chips fseg">'+[["all",L2("Semua","All")],["m","👦 "+L2("Lelaki","Boys")],["f","👧 "+L2("Perempuan","Girls")]].map(function(x){ return '<button class="chip g3d'+(nq.g===x[0]?" on":"")+'" data-ng="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'<button class="chip g3d'+(nq.fav?" on":"")+'" id="nmF">★ '+F.fav.length+'</button></div>'+
    '<div class="chips fseg fmabc">'+["",].concat("ABDFHIKLMNQRSTUWYZ".split("")).map(function(c){ return '<button class="chip'+(nq.l===c?" on":"")+'" data-nl="'+c+'">'+(c||L2("Semua","All"))+'</button>'; }).join("")+'</div></div>';
  var q=nq.q.toLowerCase(), L=N.filter(function(x){ return (nq.g==="all"||x[0]===nq.g) && (!nq.l||x[1].charAt(0).toUpperCase()===nq.l) && (!nq.fav||F.fav.indexOf(x[1])>=0) && (!q||(x[1]+" "+x[3]+" "+x[4]).toLowerCase().indexOf(q)>=0); });
  h+='<div class="card flist">'+(L.length?L.map(function(x){ var fv=F.fav.indexOf(x[1])>=0; return '<div class="frow"><span class="fic fmnm'+(x[0]==="f"?" f":"")+'">'+x[2]+'</span><span class="fmain"><b>'+E(x[1])+'</b><small style="white-space:normal">'+E(L2(x[3],x[4]))+'</small></span><button class="chip'+(fv?" on":"")+'" data-nf="'+E(x[1])+'">'+(fv?"★":"☆")+'</button></div>'; }).join(""):'<div class="mut small">'+L2("Tiada padanan.","No matches.")+'</div>')+'</div>';
  h+='<div class="card mut tiny">'+L2("Sunnah: beri nama yang baik pada hari ketujuh bersama aqiqah. Maksud perlu disemak ustaz.","Sunnah: give a good name on the seventh day with the aqiqah. Meanings need an ustaz's review.")+'</div>';
  el.innerHTML=h+(noDock?"":dock());
  var qi=el.querySelector("#nmQ"); qi.oninput=function(){ nq.q=qi.value; var p=qi.selectionStart; draw(); var n=document.getElementById("nmQ"); if(n){ n.focus(); try{ n.setSelectionRange(p,p); }catch(e){} } };
  el.querySelectorAll("[data-ng]").forEach(function(b){ b.onclick=function(){ nq.g=b.getAttribute("data-ng"); draw(); }; });
  el.querySelectorAll("[data-nl]").forEach(function(b){ b.onclick=function(){ nq.l=b.getAttribute("data-nl"); draw(); }; });
  el.querySelector("#nmF").onclick=function(){ nq.fav=!nq.fav; draw(); };
  el.querySelectorAll("[data-nf]").forEach(function(b){ b.onclick=function(){ var n=b.getAttribute("data-nf"), i=F.fav.indexOf(n); if(i>=0) F.fav.splice(i,1); else F.fav.push(n); sv(); draw(); }; });
}
// ---------- nikah preparation (idea 97) ----------
var STATES=["Johor","Kedah","Kelantan","Melaka","Negeri Sembilan","Pahang","Perak","Perlis","Pulau Pinang","Sabah","Sarawak","Selangor","Terengganu","W.P. Kuala Lumpur","W.P. Putrajaya","W.P. Labuan"];
var NSTEP=[[-180,"kursus","🎓","Kursus pra-perkahwinan Islam (2 hari) dan simpan sijil","Islamic pre-marriage course (2 days) and keep the certificate"],
  [-120,"wali","🤝","Bincang dengan wali (bapa/datuk/abang); tetapkan mas kahwin, hantaran dan tarikh","Talk to the wali (father/grandfather/brother); agree on mas kahwin, gifts and the date"],
  [-90,"hiv","🩺","Ujian saringan HIV di klinik kesihatan kerajaan (sah lebih kurang 6 bulan)","HIV screening at a government clinic (valid about 6 months)"],
  [-75,"dok","📄","Sediakan dokumen: salinan KP, sijil kursus, keputusan HIV, gambar, surat akuan bujang/janda/duda, sijil cerai atau kematian pasangan jika ada","Prepare papers: IC copies, course certificate, HIV result, photos, single/divorced/widowed declaration, divorce or death certificate if any"],
  [-60,"mohon","🖥","Hantar permohonan kebenaran berkahwin di pejabat agama Islam daerah pihak perempuan (dalam talian di kebanyakan negeri)","Apply for marriage approval at the Islamic religious office of the bride's district (online in most states)"],
  [-45,"lintas","🗺","Jika lelaki dari negeri lain: dapatkan kebenaran/pengesahan dari pejabat agama negeri lelaki dahulu","If the groom is from another state: get approval from his state's religious office first"],
  [-30,"temu","🗣","Temu duga / pengesahan dan bayar fi; tetapkan jurunikah (juru nikah/penolong pendaftar)","Interview / verification and fees; book the officiant (penolong pendaftar)"],
  [-14,"saksi","👥","Sahkan 2 saksi lelaki Muslim yang adil dan wali hadir (atau surat wakalah wali)","Confirm 2 upright Muslim male witnesses and that the wali attends (or a wakalah letter)"],
  [-7,"lafaz","📖","Latih lafaz ijab dan qabul; sediakan mas kahwin tunai","Practise the ijab and qabul; have the mas kahwin ready in cash"],
  [0,"akad","💍","Hari akad nikah: tandatangan daftar, ambil sijil/kad nikah","Akad day: sign the register, collect the marriage certificate/card"],
  [30,"daftar","🪪","Kemas kini status di JPN (jika perlu), KWSP, Tabung Haji dan penama takaful","Update status with JPN (if needed), EPF, Tabung Haji and takaful nominees"]];
function vNikah(el){
  var K=F.nk, d=K.d?pd(K.d):null, t=today();
  var h='<div class="card"><h3>💍 '+L2("Persediaan nikah","Nikah preparation")+'</h3>'+
    '<div class="f2">'+H.fld("nkD",L2("Tarikh akad","Akad date"),K.d||"","date")+'<label class="fl">'+L2("Negeri (pihak perempuan)","State (bride's side)")+'<select id="nkS"><option value="">–</option>'+STATES.map(function(s){ return '<option'+(K.s===s?" selected":"")+'>'+s+'</option>'; }).join("")+'</select></label></div>'+
    (d?'<div class="fsum" style="margin-top:6px"><div><small>'+L2("Lagi","Days left")+'</small><b class="fwarnc">'+Math.max(0,days(t,d))+'</b></div><div><small>'+L2("Selesai","Done")+'</small><b>'+NSTEP.filter(function(s){ return (K.ck||{})[s[1]]; }).length+' / '+NSTEP.length+'</b></div></div>':'')+'</div>';
  h+='<div class="card flist">'+NSTEP.map(function(s){ var due=d?new Date(d.getTime()+s[0]*864e5):null, on=!!(K.ck||{})[s[1]], late=due&&!on&&due<t;
    return '<div class="frow'+(on?" fdone":"")+'"><label class="fck"><input type="checkbox" data-nk="'+s[1]+'" '+(on?"checked":"")+'><span></span></label><span class="fmain"><b style="white-space:normal">'+s[2]+' '+E(L2(s[3],s[4]))+'</b><small>'+(due?(s[0]===0?L2("Hari akad","Akad day"):(s[0]<0?L2("Sebelum ","By ")+dstr(ymd(due)):L2("Selepas, sekitar ","After, around ")+dstr(ymd(due)))):L2("Isi tarikh akad untuk jadual","Fill in the akad date for a schedule"))+'</small>'+(late?'<em class="fbad">'+L2("Sudah lewat","Overdue")+'</em>':'')+'</span></div>'; }).join("")+'</div>';
  h+='<div class="card"><h3>💰 '+L2("Bajet","Budget")+'</h3>'+[["mk","Mas kahwin","Mas kahwin"],["hn","Hantaran","Gifts (hantaran)"],["mj","Majlis & katering","Reception & catering"],["pk","Pakaian & solekan","Clothes & make-up"],["ln","Lain-lain","Others"]].map(function(b){ return '<div class="frow"><span class="fmain"><b>'+L2(b[1],b[2])+'</b></span><input type="number" inputmode="decimal" data-nb="'+b[0]+'" value="'+((K.b||{})[b[0]]||"")+'" style="width:120px;text-align:right;padding:6px;border-radius:8px;border:1px solid var(--line);background:var(--well);color:inherit"></div>'; }).join("")+
    '<div class="ftot"><span>'+L2("Jumlah","Total")+'</span><b>RM '+Object.keys(K.b||{}).reduce(function(a,k){ return a+(+K.b[k]||0); },0).toLocaleString("en-MY")+'</b></div>'+
    '<div class="mut tiny">'+L2("Kadar minimum mas kahwin berbeza mengikut negeri. Semak dengan pejabat agama Islam negeri"+(K.s?" "+K.s:"")+".","The minimum mas kahwin differs by state. Check with the "+(K.s?K.s+" ":"")+"state Islamic religious office.")+'</div></div>';
  h+='<div class="card mut tiny">'+L2("Langkah umum di Malaysia; syarat, borang dan fi tepat ditetapkan oleh jabatan agama Islam setiap negeri. Nikah di luar negara atau poligami ada prosedur tambahan.","General steps in Malaysia; exact requirements, forms and fees are set by each state's Islamic religious department. Marrying abroad or polygamy has extra procedures.")+'</div>';
  el.innerHTML=h+dock();
  el.querySelector("#nkD").onchange=function(){ K.d=this.value; sv(); draw(); };
  el.querySelector("#nkS").onchange=function(){ K.s=this.value; sv(); draw(); };
  el.querySelectorAll("[data-nk]").forEach(function(c){ c.onchange=function(){ K.ck=K.ck||{}; K.ck[c.getAttribute("data-nk")]=c.checked; sv(); draw(); }; });
  el.querySelectorAll("[data-nb]").forEach(function(i){ i.onchange=function(){ K.b=K.b||{}; K.b[i.getAttribute("data-nb")]=parseFloat(i.value)||0; sv(); draw(); }; });
}
// 0.35.0 (Farah): "Nama bayi" became the Baby hub (family/baby.js: profiles, KKM vaccines, memories, names) and Nikah moved into
// the Events planner (family/events.js: every kind of majlis). Old saved sections "names"/"nikah" map to them.
// 0.36.0 (Farah): Majlis left Keluarga and is its own page in Alat, just left of Kewangan.
// 0.5.48: Jaga (Care) for the sick and elderly, next to Bayi (family/care.js)
var SECS=[["tree","🌳","Salasilah","Family tree"],["bday","🎂","Hari lahir","Birthdays"],["baby","👶","Bayi","Baby"],["care","🩺","Jaga","Care"]];
function dock(){ if(H && H.noDock) return '';   // 0.7.75 (owner): in Tools › Life the sections are the Life tabs themselves
  return '<div class="dock"><div class="grp3'+(SECS.length>3?' grp4':'')+'">'+SECS.map(function(s){ return '<button class="chip g3d'+(sec===s[0]?" on":"")+'" data-fsec="'+s[0]+'">'+s[1]+' '+L2(s[2],s[3])+'</button>'; }).join("")+'</div></div>'; }
function draw(){ if(!host || !document.body.contains(host)) return; var v=document.getElementById("view"), y=v.scrollTop; render(host); v.scrollTop=y; }
function vBaby(el){ if(window.BabyView) BabyView.view(el, H, dock()); else vNames(el); }
function vCare(el){ if(window.CareView) CareView.view(el, H, dock()); else vTree(el); }
function vEvents(el){ if(window.EventView) EventView.view(el, H, dock()); else vNikah(el); }
function render(el){ ld(); if(sec==="names"){ sec="baby"; if(window.BabyView) BabyView.navSet({pg:"names"}); } if(sec==="nikah"||sec==="events") sec="tree";
  if(window.FamOpenSec){ sec=window.FamOpenSec; window.FamOpenSec=null; if(sec==="events"||sec==="nikah") sec="tree"; }
  if(sec!=="tree") stop3(); ({tree:vTree, bday:vBday, baby:vBaby, care:vCare, events:vEvents}[sec]||vTree)(el);
  el.querySelectorAll("[data-fsec]").forEach(function(b){ b.onclick=function(){ sec=b.getAttribute("data-fsec"); draw(); document.getElementById("view").scrollTop=0; }; }); try{ H.dockFix(); }catch(e){} }
window.FamView=function(el, h){ H=h; L2=h.L2x; E=h.esc; host=el; el.classList.add("finv"); render(el); };
window.FamView.navGet=function(){ var o={sec:sec, k:sec};
  if(sec==="baby" && window.BabyView){ o.b=BabyView.navGet(); o.k+="|"+o.b.k; }
  if(sec==="events" && window.EventView){ o.e=EventView.navGet(); o.k+="|"+o.e.k; }
  if(sec==="care" && window.CareView){ o.c=CareView.navGet(); o.k+="|"+o.c.k; }
  return o; };
window.FamView.navSet=function(o){ sec=o.sec||"tree"; if(o.c && window.CareView) CareView.navSet(o.c); if(o.b && window.BabyView) BabyView.navSet(o.b); if(o.e && window.EventView) EventView.navSet(o.e); };
window.FamView.draw=function(){ draw(); };
// 0.35.0: helpers shared with baby.js and events.js
window.FamView.util=function(){ return {wheelHtml:wheelHtml, wheelBind:wheelBind, wheelVal:wheelVal, ccNum:ccNum, telUrl:telUrl, waUrl:waUrl, mapUrl:mapUrl, llParse:llParse,
  dstr:dstr, pd:pd, ymd:ymd, today:today, days:days, hstr:hstr, hj:hj, hjOf:hjOf, wdLong:wdLong, uid:uid, fam:function(){ return ld(); }, P:P, age:age, rel:rel,
  NSTEP:NSTEP, STATES:STATES, names:function(el){ vNames(el, true); }}; };
window.FamView.stop=function(){ stop3(); };
window.FamView.data=function(h){ H=H||h; L2=L2||h.L2x; return ld(); };
})();
