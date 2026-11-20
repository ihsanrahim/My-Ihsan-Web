/* My Ihsan 0.12.0: pages for 40 Hadith (66), Kisah Sahabat (67), Huruf Hijaiyah (68), Quran words (69) and Ask AI (70).
   Loaded on first use. Content files: ilmu/nawawi.js, ilmu/sahabat.js, ilmu/huruf.js; Ask AI uses halal/halal_ai.js. */
(function(){
"use strict";
var H=null, box=null, pg="", st={n40:null, n40f:"all", n40q:"", sb:null, hj:"huruf", hv:0, qz:null, qw:"list", qc:"all", deck:null, flip:false, aiBusy:false, aiErr:null};
function L2(a,b){ return H.L2x(a,b); }
function L(a){ return a ? H.L2x(a[0],a[1]) : ""; }
function E(s){ return H.esc(s); }
function q(s){ return box.querySelector(s); }
function qa(s){ return Array.prototype.slice.call(box.querySelectorAll(s)); }
function top(){ var v=document.getElementById("view"); if(v) v.scrollTop=0; }
function paras(t){ return String(t||"").split(/\n+/).map(function(p){ return '<p>'+E(p)+'</p>'; }).join(""); }
function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function copy(t){ if(window.Native && H.N.copyText){ H.N.copyText(t); } else { try{ navigator.clipboard.writeText(t); }catch(e){} } H.toast(L2("Disalin","Copied")); }

// ---------- voice (Malay or English text; Arabic goes through the app's speakAr) ----------
var talking=null;
function stopTalk(){ talking=null; try{ if(H.N.stopSpeak) H.N.stopSpeak(); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} markTalk(); }
function sayText(t, key){
  if(talking===key){ stopTalk(); return; }
  stopTalk(); talking=key;
  if(window.Native && H.N.speak) H.N.speak(t, H.en()?"en":"ms");
  else { try{ var u=new SpeechSynthesisUtterance(t); u.lang=H.en()?"en-GB":"ms-MY"; u.rate=0.95; u.onend=function(){ if(talking===key){ talking=null; markTalk(); } }; speechSynthesis.speak(u); }catch(e){} }
  markTalk();
}
function markTalk(){ if(!box) return; qa("[data-talk]").forEach(function(b){ var on=b.getAttribute("data-talk")===talking; b.classList.toggle("on",on); b.innerHTML=on?"⏹ "+L2("Henti","Stop"):b.getAttribute("data-lbl"); }); }
function talkBtn(key, lbl){ return '<button class="ib" data-talk="'+key+'" data-lbl="'+E(lbl)+'">'+E(lbl)+'</button>'; }
var hooked=false;
function hook(){ if(hooked) return; hooked=true; H.on("ttsdone", function(r){ if(r && r.stopped) return; if(talking){ talking=null; markTalk(); } }); }

// ================= 66: 40 HADITH =================
function nawSrc(s){ return H.en() ? s.replace(/At-Tirmizi/g,"At-Tirmidhi").replace(/Al-Baihaqi/g,"Al-Bayhaqi") : s; }
function nawSnip(h){ var m=L(h.m), a=m.indexOf('"'); m=a>=0?m.slice(a+1):m; m=m.replace(/"$/,""); return m.length>96?m.slice(0,m.lastIndexOf(" ",94))+"…":m; }
function n40(){
  var D=H.load("ihsan_n40",{r:{},h:{}});
  if(H.st.n40Open){ st.n40=H.st.n40Open; H.st.n40Open=null; }
  if(st.n40) return n40One(D);
  var nr=Object.keys(D.r).length, nh=Object.keys(D.h).length;
  var html='<div class="card ilHero"><b>'+L2("Hadis 40 Imam an-Nawawi","Imam an-Nawawi's 40 Hadith")+'</b><div class="mut small">'+L2("42 hadis yang menghimpunkan asas agama, dengan maksud dan pengajaran.","42 hadith that gather the foundations of the religion, with meaning and lesson.")+'</div>'+
    '<div class="bar" style="margin-top:10px"><div style="width:'+Math.round(nr/NAWAWI.length*100)+'%"></div></div><div class="mut tiny">'+nr+'/'+NAWAWI.length+' '+L2("dibaca","read")+' · ★ '+nh+' '+L2("dihafal","memorised")+'</div></div>';
  html+='<input id="nQ" type="search" class="ilq" placeholder="🔍 '+L2("Cari tajuk, kata atau nombor","Search a title, word or number")+'" value="'+E(st.n40q)+'">';
  html+='<div class="ilChips">'+[["all","Semua","All"],["new","Belum dibaca","Not read yet"],["h","★ Dihafal","★ Memorised"]].map(function(f){ return '<button class="chip'+(st.n40f===f[0]?' on':'')+'" data-nf="'+f[0]+'">'+L2(f[1],f[2])+'</button>'; }).join("")+'</div>';
  html+='<div id="nL"></div>';
  box.innerHTML=html;
  var list=function(){
    var k=st.n40q.trim().toLowerCase(), out=NAWAWI.filter(function(h){
      if(st.n40f==="new" && D.r[h.n]) return false; if(st.n40f==="h" && !D.h[h.n]) return false;
      return !k || String(h.n)===k || (L(h.t)+" "+L(h.m)+" "+L(h.l)).toLowerCase().indexOf(k)>=0; });
    q("#nL").innerHTML=out.map(function(h){ return '<button class="ilItem" data-n="'+h.n+'"><span class="ilNum">'+h.n+'</span><span class="ilT"><b>'+E(L(h.t))+'</b><small>'+E(nawSnip(h))+'</small></span><span class="ilS">'+(D.h[h.n]?'★':'')+(D.r[h.n]?'<i>✓</i>':'')+'</span></button>'; }).join("")||'<div class="card mut">'+L2("Tiada hadis yang sepadan","No matching hadith")+'</div>';
    qa("[data-n]").forEach(function(b){ b.onclick=function(){ st.n40=+b.getAttribute("data-n"); st.arOpen=false; draw(); top(); }; });
  };
  list();
  q("#nQ").oninput=function(){ st.n40q=this.value; list(); };
  qa("[data-nf]").forEach(function(b){ b.onclick=function(){ st.n40f=b.getAttribute("data-nf"); draw(); }; });
}
function n40One(D){
  var i=0; NAWAWI.forEach(function(h,j){ if(h.n===st.n40) i=j; }); var h=NAWAWI[i];
  if(!D.r[h.n]){ D.r[h.n]=Date.now(); H.save("ihsan_n40",D); }
  var link=H.S.srcLinks?' · <a href="https://sunnah.com/nawawi40:'+h.n+'">sunnah.com</a>':'';
  var html='<div class="ilNav"><button class="chip" data-back="1">‹ '+L2("Senarai","List")+'</button><span class="mut small">'+h.n+' / '+NAWAWI.length+'</span><span><button class="chip" data-step="-1"'+(i?'':' disabled')+'>‹</button> <button class="chip" data-step="1"'+(i<NAWAWI.length-1?'':' disabled')+'>›</button></span></div>';
  html+='<div class="card"><h3>'+L2("Hadis ","Hadith ")+h.n+': '+E(L(h.t))+'</h3><div class="ar ilAr'+(h.ar.length>520&&!st.arOpen?' clamp':'')+'" dir="rtl">'+E(h.ar)+'</div>'+(h.ar.length>520?'<button class="chip ilMore" id="nMore">'+(st.arOpen?L2("Ringkaskan teks Arab ▴","Show less Arabic ▴"):L2("Baca teks Arab penuh ▾","Read the full Arabic ▾"))+'</button>':'')+
    '<div class="tools">'+'<button class="ib" id="nAr">🔊 '+L2("Arab","Arabic")+'</button>'+talkBtn("n"+h.n, "🔊 "+L2("Maksud","Meaning"))+'<button class="ib" id="nSh">↗ '+L2("Kongsi","Share")+'</button><button class="ib" id="nCp">⧉ '+L2("Salin","Copy")+'</button></div></div>';
  html+='<div class="card"><h3>'+L2("Maksud","Meaning")+'</h3><div class="hq">'+E(L(h.m))+'</div><div class="why"><b>'+L2("Pengajaran","Lesson")+':</b> '+E(L(h.l))+'</div><div class="src">'+L2("Riwayat: ","Reported by: ")+E(nawSrc(h.src))+link+'</div></div>';
  html+='<div class="btns" style="margin-bottom:12px"><button class="btn '+(D.h[h.n]?'gold':'alt')+'" id="nH">'+(D.h[h.n]?'★ '+L2("Sudah dihafal","Memorised"):'☆ '+L2("Tandakan sudah hafal","Mark as memorised"))+'</button><button class="btn alt" id="nAi">💬 '+L2("Tanya AI tentang hadis ini","Ask AI about this hadith")+'</button></div>';
  box.innerHTML=html;
  q("[data-back]").onclick=function(){ stopTalk(); st.n40=null; draw(); };
  qa("[data-step]").forEach(function(b){ b.onclick=function(){ var j=i+(+b.getAttribute("data-step")); if(j<0||j>=NAWAWI.length) return; stopTalk(); st.arOpen=false; st.n40=NAWAWI[j].n; draw(); top(); }; });
  q("#nAr").onclick=function(){ stopTalk(); H.speakAr(h.ar); };
  var mo=q("#nMore"); if(mo) mo.onclick=function(){ st.arOpen=!st.arOpen; draw(); };
  q("[data-talk]").onclick=function(){ sayText(L(h.t)+". "+L(h.m)+" "+L2("Pengajaran: ","Lesson: ")+L(h.l), "n"+h.n); };
  q("#nSh").onclick=function(){ var m=L(h.m); H.shareCard({ar:h.ar.length<=300?h.ar:"", text:m.length>650?m.slice(0,m.lastIndexOf(" ",640))+"…":m, src:"Al-Arba'in an-Nawawiyyah, no. "+h.n+" · "+nawSrc(h.src), title:L2("Hadis 40 an-Nawawi","An-Nawawi's 40 Hadith")+" #"+h.n}); };
  q("#nCp").onclick=function(){ copy(L2("Hadis 40 an-Nawawi","An-Nawawi's 40 Hadith")+" #"+h.n+": "+L(h.t)+"\n\n"+h.ar+"\n\n"+L(h.m)+"\n\n"+L2("Riwayat: ","Reported by: ")+nawSrc(h.src)); };
  q("#nH").onclick=function(){ if(D.h[h.n]) delete D.h[h.n]; else { D.h[h.n]=Date.now(); H.N.vibrate(60); H.toast(L2("MasyaAllah! Ditandakan sudah hafal","MasyaAllah! Marked as memorised")); } H.save("ihsan_n40",D); draw(); };
  q("#nAi").onclick=function(){ stopTalk(); H.st.aiPre=L2("Terangkan dengan ringkas hadis ke-"+h.n+" dalam Hadis 40 Imam an-Nawawi (\""+L(h.t)+"\") dan bagaimana mengamalkannya.","Briefly explain hadith "+h.n+" of Imam an-Nawawi's 40 Hadith (\""+L(h.t)+"\") and how to put it into practice."); H.open("askai"); };
}

// ================= 67: KISAH SAHABAT =================
var SB_SEC=[["10","Sepuluh sahabat yang dijanjikan syurga","The ten promised Paradise"],["s","Muazzin Rasulullah ﷺ","The Prophet's ﷺ muezzin"],["w","Sahabat wanita (sahabiyah)","Women companions"]];
// Adult "read" marks live in ihsan_sahabat; kids badges in ihsan_sbk (kept per child profile since 0.13.0).
function sbData(){ var D=H.load("ihsan_sahabat",{mode:"a",done:{}}); D.done=D.done||{}; if(H.st.sbMode){ D.mode=H.st.sbMode; H.st.sbMode=null; H.save("ihsan_sahabat",D); } return D; }
function sbMarks(kids){ return kids ? (H.load("ihsan_sbk",{done:{}}).done||{}) : sbData().done; }
function sbMark(kids, id, on){ if(kids){ var K=H.load("ihsan_sbk",{done:{}}); K.done=K.done||{}; if(on) K.done[id]=Date.now(); else delete K.done[id]; H.save("ihsan_sbk",K); } else { var D=sbData(); if(on) D.done[id]=Date.now(); else delete D.done[id]; H.save("ihsan_sahabat",D); } }
function med(x, big){ return '<span class="sbMed'+(big?' big':'')+(x.g==="w"?' w':'')+'" aria-hidden="true">'+x.mono+'</span>'; }
function sahabat(){
  var D=sbData(), kids=D.mode==="k", M=sbMarks(kids);
  if(st.sb) return sbOne(D);
  var nd=SAHABAT.filter(function(x){ return M[x.id]; }).length;
  var html='<div class="ilChips"><button class="chip'+(kids?'':' on')+'" data-md="a">📖 '+L2("Dewasa","Adults")+'</button><button class="chip'+(kids?' on':'')+'" data-md="k">🎈 '+L2("Kanak-kanak","Kids")+'</button></div>';
  if(kids) html+='<div class="card sbBadges"><h3>🏅 '+L2("Lencana saya","My badges")+' · '+nd+'/'+SAHABAT.length+'</h3><div class="sbRow">'+SAHABAT.map(function(x){ return '<span class="sbMini'+(M[x.id]?' on':'')+'">'+(M[x.id]?x.mono:'·')+'</span>'; }).join("")+'</div><div class="mut tiny">'+L2("Dengar atau baca satu kisah untuk mendapat lencana.","Listen to or read a story to earn a badge.")+'</div></div>';
  else html+='<div class="card ilHero"><b>'+L2("Kisah Sahabat Rasulullah ﷺ","Stories of the Companions")+'</b><div class="mut small">'+L2("Kisah ringkas 16 sahabat dan sahabiyah, dengan pengajaran untuk kita hari ini.","Short stories of 16 men and women companions, with a lesson for us today.")+'</div><div class="mut tiny" style="margin-top:6px">'+nd+'/'+SAHABAT.length+' '+L2("dibaca","read")+'</div></div>';
  SB_SEC.forEach(function(s){
    var xs=SAHABAT.filter(function(x){ return x.g===s[0]; }); if(!xs.length) return;
    html+='<div class="ilSec">'+L2(s[1],s[2])+'</div>';
    if(s[0]==="10") html+='<div class="src" style="margin:-4px 4px 6px">'+H.srcHtml("Jami' at-Tirmidhi 3747; Sunan Abi Dawud 4649")+'</div>';
    html+=xs.map(function(x){ return '<button class="ilItem'+(kids?' kid':'')+'" data-sb="'+x.id+'">'+med(x)+'<span class="ilT"><b>'+E(L(x.n))+'</b><small>'+E(L(x.l))+'</small></span><span class="ilS">'+(M[x.id]?(kids?'🏅':'<i>✓</i>'):'')+'</span></button>'; }).join("");
  });
  box.innerHTML=html;
  qa("[data-md]").forEach(function(b){ b.onclick=function(){ D.mode=b.getAttribute("data-md"); H.save("ihsan_sahabat",D); draw(); }; });
  qa("[data-sb]").forEach(function(b){ b.onclick=function(){ st.sb=b.getAttribute("data-sb"); draw(); top(); }; });
}
function sbOne(D){
  var kids=D.mode==="k", i=0; SAHABAT.forEach(function(x,j){ if(x.id===st.sb) i=j; }); var x=SAHABAT[i], story=L(kids?x.k:x.a), done=!!sbMarks(kids)[x.id];
  var html='<div class="ilNav"><button class="chip" data-back="1">‹ '+L2("Senarai","List")+'</button><span class="mut small">'+(i+1)+' / '+SAHABAT.length+'</span><span><button class="chip" data-step="-1"'+(i?'':' disabled')+'>‹</button> <button class="chip" data-step="1"'+(i<SAHABAT.length-1?'':' disabled')+'>›</button></span></div>';
  html+='<div class="card sbStory'+(kids?' kid':'')+'"><div class="sbHead">'+med(x,true)+'<h2>'+E(L(x.n))+'</h2></div><div class="sbTxt">'+paras(story)+'</div>'+
    '<div class="why"><b>'+L2("Pengajaran","Lesson")+':</b> '+E(L(x.l))+'</div>'+
    '<div class="tools">'+talkBtn("s"+x.id, "🔊 "+L2("Dengar kisah","Listen"))+'<button class="ib" id="sbSh">↗ '+L2("Kongsi","Share")+'</button></div></div>';
  html+='<button class="btn '+(done?'alt':'gold')+' full" id="sbDone" style="margin-bottom:8px">'+(done?(kids?'🏅 '+L2("Lencana sudah diperoleh","Badge earned"):'✓ '+L2("Sudah dibaca","Read")):(kids?'🏅 '+L2("Saya sudah dengar kisah ini!","I heard this story!"):'✓ '+L2("Tandakan sudah dibaca","Mark as read")))+'</button>';
  html+='<button class="btn alt full" id="sbMode" style="margin-bottom:12px">'+(kids?'📖 '+L2("Baca versi dewasa","Read the adult version"):'🎈 '+L2("Baca versi kanak-kanak","Read the kids version"))+'</button>';
  box.innerHTML=html;
  q("[data-back]").onclick=function(){ stopTalk(); st.sb=null; draw(); };
  qa("[data-step]").forEach(function(b){ b.onclick=function(){ var j=i+(+b.getAttribute("data-step")); if(j<0||j>=SAHABAT.length) return; stopTalk(); st.sb=SAHABAT[j].id; draw(); top(); }; });
  q("[data-talk]").onclick=function(){ sayText(L(x.n)+". "+story+" "+L2("Pengajaran: ","Lesson: ")+L(x.l), "s"+x.id); };
  q("#sbSh").onclick=function(){ H.shareCard({text:L(x.k)+"\n\n"+L2("Pengajaran: ","Lesson: ")+L(x.l), src:"", title:L(x.n)}); };
  q("#sbDone").onclick=function(){ if(done && kids) return; if(done){ sbMark(kids, x.id, false); } else { sbMark(kids, x.id, true); H.N.vibrate(kids?400:60); H.toast(kids?L2("MasyaAllah! Lencana baharu 🏅","MasyaAllah! A new badge 🏅"):L2("Ditandakan sudah dibaca","Marked as read")); } draw(); };
  q("#sbMode").onclick=function(){ stopTalk(); D.mode=kids?"a":"k"; H.save("ihsan_sahabat",D); draw(); };
}

// ================= 68: HURUF HIJAIYAH =================
var HARAKAT=["َ","ِ","ُ"], VOW=["a","i","u"];
function hjSyl(i,v){ var h=HIJAIYAH[i], c=h[0]; if(i===0) c="ا"; return c+HARAKAT[v]; }
function hjSay(i,v){ var h=HIJAIYAH[i]; return (i===0?"أ":h[0])+HARAKAT[v]; }
function hjRom(i,v){ var h=HIJAIYAH[i], en=H.en(), b=en?h[5]:h[4], vw=VOW[v]; if(!en && h[6] && v===0) vw="o"; if(i===27 && !b) b=""; return b+vw; }
function hjForms(i){ var h=HIJAIYAH[i], c=h[0], t="ـ"; if(i===27) return [c]; return h[7]?[c, c+t, t+c+t, t+c]:[c, c, t+c, t+c]; }
function hjStars(){ return H.load("ihsan_hijaiyah",{s:{}}); }
function hijaiyah(){
  var D=hjStars(), ns=Object.keys(D.s).length, tab=st.hj;
  var html='<div class="ilChips">'+[["huruf","🔤 "+L2("Huruf","Letters")],["baris",L2("Baris","Vowels")],["tulis","✍️ "+L2("Surih","Trace")],["kuiz","⭐ "+L2("Kuiz","Quiz")]].map(function(t){ return '<button class="chip'+(tab===t[0]?' on':'')+'" data-hj="'+t[0]+'">'+t[1]+'</button>'; }).join("")+'<span class="hjStar">⭐ '+ns+'/'+HIJAIYAH.length+'</span></div>';
  if(tab==="huruf"){
    html+='<div class="mut small" style="margin:0 4px 8px">'+L2("Sentuh huruf untuk mendengar namanya dan melihat bentuknya.","Tap a letter to hear its name and see its forms.")+'</div>';
    html+='<div class="hjGrid" dir="rtl">'+HIJAIYAH.map(function(h,i){ return '<button class="hjT'+(D.s[i]?' st':'')+'" data-hl="'+i+'"><span class="ar">'+h[0]+'</span><small dir="ltr">'+E(H.en()?h[3]:h[2])+'</small></button>'; }).join("")+'</div>';
  } else if(tab==="baris"){
    var names=[[L2("Baris atas","Fathah"),"a"],[L2("Baris bawah","Kasrah"),"i"],[L2("Baris hadapan","Dammah"),"u"]];
    html+='<div class="ilChips">'+names.map(function(n,v){ return '<button class="chip'+(st.hv===v?' on':'')+'" data-hv="'+v+'"><span class="ar" style="font-size:20px">'+"ب"+HARAKAT[v]+'</span> '+n[0]+' ('+n[1]+')</button>'; }).join("")+'</div>';
    html+='<div class="mut small" style="margin:0 4px 8px">'+L2("Sentuh untuk mendengar. Baca dari kanan ke kiri.","Tap to listen. Read from right to left.")+'</div>';
    html+='<div class="hjGrid" dir="rtl">'+HIJAIYAH.map(function(h,i){ return '<button class="hjT" data-hs="'+i+'"><span class="ar">'+hjSyl(i,st.hv)+'</span><small dir="ltr">'+E(hjRom(i,st.hv))+'</small></button>'; }).join("")+'</div>';
  } else if(tab==="tulis"){
    // 0.5.23 (Noorani Qaida style): trace the letter with a finger; stars for how much of the letter is covered without wandering off
    var ti=st.tl||0, T0=HIJAIYAH[ti], ts=(H.load("ihsan_hjtrace",{})||{})[ti]||0;
    html+='<div class="card hjTr"><div class="row"><button class="chip" id="htP" aria-label="‹">‹</button><b class="hjTn">'+E(H.en()?T0[3]:T0[2])+' <span class="mut">'+"★".repeat(ts)+"☆".repeat(3-ts)+'</span></b><button class="chip" id="htN" aria-label="›">›</button></div>'+
      '<canvas id="htC" width="320" height="320" aria-label="'+L2("Surih huruf","Trace the letter")+'"></canvas><div class="mut small" id="htM">'+L2("Surih huruf kelabu dengan jari, kemudian tekan Semak.","Trace the grey letter with your finger, then tap Check.")+'</div>'+
      '<div class="btns"><button class="btn alt" id="htS">🔊 '+L2("Dengar","Listen")+'</button><button class="btn alt" id="htX">⟲ '+L2("Padam","Clear")+'</button><button class="btn gold" id="htK">✓ '+L2("Semak","Check")+'</button></div></div>';
  } else {
    if(!st.qz) st.qz=hjNewQ(D);
    var Z=st.qz, t=HIJAIYAH[Z.t];
    html+='<div class="card hjQ"><div class="mut small">'+L2("Cari huruf","Find the letter")+'</div><div class="hjQn">'+E(H.en()?t[3]:t[2])+'</div><button class="ib" id="hqSay">🔊 '+L2("Dengar","Listen")+'</button>'+
      '<div class="hjOpts" dir="rtl">'+Z.o.map(function(o){ return '<button class="hjO" data-ho="'+o+'"><span class="ar">'+HIJAIYAH[o][0]+'</span></button>'; }).join("")+'</div>'+
      '<div class="mut tiny" id="hqMsg">'+(Z.streak?L2("Betul berturut-turut: ","Right in a row: ")+Z.streak:L2("Jawapan betul memberi bintang untuk huruf itu.","A right answer earns a star for that letter."))+'</div></div>';
    if(ns>=HIJAIYAH.length) html+='<div class="card" style="text-align:center">🌟 '+L2("MasyaAllah! Semua huruf sudah ada bintang.","MasyaAllah! Every letter has a star.")+' <button class="chip" id="hqReset">'+L2("Mula semula","Start again")+'</button></div>';
  }
  box.innerHTML=html;
  qa("[data-hj]").forEach(function(b){ b.onclick=function(){ st.hj=b.getAttribute("data-hj"); draw(); }; });
  if(tab==="tulis") traceBind();
  qa("[data-hv]").forEach(function(b){ b.onclick=function(){ st.hv=+b.getAttribute("data-hv"); draw(); }; });
  qa("[data-hl]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-hl"); H.speakAr(HIJAIYAH[i][1]); hjSheet(i); }; });
  qa("[data-hs]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-hs"); H.speakAr(hjSay(i,st.hv)); b.classList.add("pop"); setTimeout(function(){ b.classList.remove("pop"); },350); }; });
  if(tab==="kuiz"){
    q("#hqSay").onclick=function(){ H.speakAr(HIJAIYAH[st.qz.t][1]); };
    qa("[data-ho]").forEach(function(b){ b.onclick=function(){ hjAnswer(+b.getAttribute("data-ho"), b); }; });
    var rs=q("#hqReset"); if(rs) rs.onclick=function(){ H.save("ihsan_hijaiyah",{s:{}}); st.qz=null; draw(); };
  }
}
function hjNewQ(D, streak){
  var pool=[]; HIJAIYAH.forEach(function(h,i){ if(!D.s[i]) pool.push(i); }); if(!pool.length) pool=HIJAIYAH.map(function(h,i){ return i; });
  var t=pool[Math.floor(Math.random()*pool.length)], o=[t];
  while(o.length<4){ var r=Math.floor(Math.random()*HIJAIYAH.length); if(o.indexOf(r)<0) o.push(r); }
  return {t:t, o:shuffle(o), streak:streak||0, miss:false};
}
function hjAnswer(o, b){
  var Z=st.qz; if(Z.lock) return;
  if(o===Z.t){
    Z.lock=true; b.classList.add("ok"); H.N.vibrate(60);
    var D=hjStars(), first=!D.s[Z.t]; if(!Z.miss){ D.s[Z.t]=1; H.save("ihsan_hijaiyah",D); }
    var hs=q(".hjStar"); if(hs) hs.textContent="⭐ "+Object.keys(D.s).length+"/"+HIJAIYAH.length;
    var m=q("#hqMsg"); if(m) m.textContent=Z.miss?L2("Betul! Cuba yang seterusnya.","Right! Try the next one."):(first?L2("Betul! ⭐ Bintang baharu","Right! ⭐ New star"):L2("Betul!","Right!"));
    setTimeout(function(){ st.qz=hjNewQ(hjStars(), Z.miss?0:Z.streak+1); if(pg==="hijaiyah" && st.hj==="kuiz"){ draw(); H.speakAr(HIJAIYAH[st.qz.t][1]); } }, 900);
  } else {
    Z.miss=true; b.classList.add("no"); H.N.vibrate(30); setTimeout(function(){ b.classList.remove("no"); },500);
    var m2=q("#hqMsg"); if(m2) m2.textContent=L2("Cuba lagi. Ini huruf ","Try again. This is ")+(H.en()?HIJAIYAH[o][3]:HIJAIYAH[o][2])+".";
  }
}
function hjSheet(i){
  var h=HIJAIYAH[i], f=hjForms(i), lb=[L2("Sendiri","Alone"),L2("Awal","Start"),L2("Tengah","Middle"),L2("Akhir","End")];
  var body='<div class="hjBig ar">'+h[0]+'</div><div style="text-align:center"><b>'+E(H.en()?h[3]:h[2])+'</b> <button class="ib" data-hsay="n">🔊</button></div>';
  if(f.length>1) body+='<div class="hjF" dir="rtl">'+f.map(function(x,k){ return '<div><span class="ar">'+x+'</span><small>'+lb[k]+'</small></div>'; }).join("")+'</div><div class="mut tiny" style="text-align:center">'+(h[7]?L2("Huruf ini bersambung dengan huruf selepasnya.","This letter joins the letter after it."):L2("Huruf ini tidak bersambung dengan huruf selepasnya.","This letter does not join the letter after it."))+'</div>';
  body+='<div class="hjF" dir="rtl" style="margin-top:12px">'+[0,1,2].map(function(v){ return '<button class="hjT" data-hsay="'+v+'"><span class="ar">'+hjSyl(i,v)+'</span><small dir="ltr">'+E(hjRom(i,v))+'</small></button>'; }).join("")+'</div>';
  var ov=H.showSheet(L2("Huruf ","Letter ")+E(H.en()?h[3]:h[2]), body);
  Array.prototype.forEach.call(ov.querySelectorAll("[data-hsay]"), function(b){ b.onclick=function(){ var v=b.getAttribute("data-hsay"); H.speakAr(v==="n"?h[1]:hjSay(i,+v)); }; });
}

// ================= 69: QURAN WORDS =================
function qwData(){ return H.load("ihsan_qwords",{k:{}}); }
function qwords(){
  var D=qwData(), nk=Object.keys(D.k).length, tab=st.qw;
  var html='<div class="card ilHero"><b>'+L2("Maksud al-Quran: kata yang kerap ditemui","Meanings of Quran: words you meet often")+'</b><div class="mut small">'+L2("Kenal kata-kata ini dan bacaan al-Quran anda akan lebih difahami.","Learn these words and the Quran you recite will make more sense.")+'</div>'+
    '<div class="bar" style="margin-top:10px"><div style="width:'+Math.round(nk/QWORDS.length*100)+'%"></div></div><div class="mut tiny">'+nk+'/'+QWORDS.length+' '+L2("kata sudah diketahui","words known")+'</div></div>';
  // 0.5.70 (owner): "Meanings of Quran" = the Quran words and the glossary of terms in one place
  html+='<div class="ilChips"><button class="chip'+(tab==="list"?' on':'')+'" data-qt="list">📋 '+L2("Senarai","List")+'</button><button class="chip'+(tab==="card"?' on':'')+'" data-qt="card">📇 '+L2("Kad imbas","Flashcards")+'</button><button class="chip'+(tab==="gloss"?' on':'')+'" data-qt="gloss">📖 '+L2("Glosari","Glossary")+'</button></div>';
  if(tab==="gloss"){ var GL=(window.GLOSSARY||[]).slice().sort(function(a,b){ return a.w[0].localeCompare(b.w[0]); }), gq=st.gq||"";
    var gl=function(q){ return GL.filter(function(g){ return !q || g.w.join(" ").toLowerCase().indexOf(q)>=0 || L2(g.ms,g.en).toLowerCase().indexOf(q)>=0; }).map(function(g){ return '<div class="card gli"><b>'+E(g.w[0])+'</b><div class="small">'+E(L2(g.ms,g.en))+'</div></div>'; }).join("")||'<div class="mut card">'+L2("Tiada","None")+'</div>'; };
    html+='<input id="qwGq" type="search" placeholder="🔍 '+L2("Cari istilah","Search a term")+' ('+GL.length+')" value="'+E(gq)+'" style="width:100%;margin-bottom:8px"><div id="qwGl">'+gl(gq.toLowerCase())+'</div>';
    box.innerHTML=html;
    qa("[data-qt]").forEach(function(b){ b.onclick=function(){ st.qw=b.getAttribute("data-qt"); st.deck=null; draw(); }; });
    var gi=q("#qwGq"); if(gi) gi.oninput=function(){ st.gq=gi.value; q("#qwGl").innerHTML=gl(gi.value.trim().toLowerCase()); };
    return; }
  html+='<div class="ilChips scroll">'+[["all","Semua","All"]].concat(QW_CATS).map(function(c){ return '<button class="chip'+(st.qc===c[0]?' on':'')+'" data-qc="'+c[0]+'">'+L2(c[1],c[2])+'</button>'; }).join("")+'</div>';
  var idx=[]; QWORDS.forEach(function(w,i){ if(st.qc==="all"||w[0]===st.qc) idx.push(i); });
  if(tab==="list"){
    html+='<div class="card qwList">'+idx.map(function(i){ var w=QWORDS[i]; return '<div class="qwR"><button class="ib" data-qs="'+i+'" aria-label="audio">🔊</button><div class="qwM">'+E(H.en()?w[3]:w[2])+'</div><div class="ar">'+w[1]+'</div><button class="qwK'+(D.k[i]?' on':'')+'" data-qk="'+i+'" aria-label="'+L2("Sudah tahu","Known")+'">✓</button></div>'; }).join("")+'</div>';
  } else {
    if(!st.deck || st.deck.c!==st.qc){ st.deck={c:st.qc, l:shuffle(idx.filter(function(i){ return !D.k[i]; }))}; st.flip=false; }
    if(!st.deck.l.length){
      html+='<div class="card" style="text-align:center;line-height:1.6">🌟 '+L2("MasyaAllah! Anda sudah tahu semua kata dalam bahagian ini.","MasyaAllah! You know every word in this section.")+'<div style="margin-top:8px"><button class="chip" id="qwAgain">↻ '+L2("Ulang semua kata","Review all words again")+'</button></div></div>';
    } else {
      var w=QWORDS[st.deck.l[0]], cat=QW_CATS.filter(function(c){ return c[0]===w[0]; })[0];
      html+='<button class="card qwCard'+(st.flip?' flip':'')+'" id="qwFlip"><span class="mut tiny">'+L2(cat[1],cat[2])+' · '+st.deck.l.length+' '+L2("lagi","left")+'</span><span class="ar qwAr">'+w[1]+'</span>'+(st.flip?'<span class="qwMean">'+E(H.en()?w[3]:w[2])+'</span>':'<span class="mut small">'+L2("Sentuh untuk melihat maksud","Tap to see the meaning")+'</span>')+'</button>';
      html+='<div class="btns" style="margin-bottom:12px"><button class="btn alt" id="qwSay">🔊 '+L2("Dengar","Listen")+'</button><button class="btn alt" id="qwNo">↻ '+L2("Belum ingat","Not yet")+'</button><button class="btn gold" id="qwYes">✓ '+L2("Saya tahu","I know it")+'</button></div>';
    }
  }
  box.innerHTML=html;
  qa("[data-qt]").forEach(function(b){ b.onclick=function(){ st.qw=b.getAttribute("data-qt"); st.deck=null; draw(); }; });
  qa("[data-qc]").forEach(function(b){ b.onclick=function(){ st.qc=b.getAttribute("data-qc"); draw(); }; });
  qa("[data-qs]").forEach(function(b){ b.onclick=function(){ var w=QWORDS[+b.getAttribute("data-qs")]; H.speakAr(w[4]||w[1]); }; });
  qa("[data-qk]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-qk"), D2=qwData(); if(D2.k[i]) delete D2.k[i]; else D2.k[i]=1; H.save("ihsan_qwords",D2); b.classList.toggle("on",!!D2.k[i]); }; });
  var fl=q("#qwFlip"); if(fl) fl.onclick=function(){ st.flip=!st.flip; draw(); };
  var sy=q("#qwSay"); if(sy) sy.onclick=function(){ var w=QWORDS[st.deck.l[0]]; H.speakAr(w[4]||w[1]); };
  var no=q("#qwNo"); if(no) no.onclick=function(){ var l=st.deck.l, x=l.shift(); l.splice(Math.min(l.length,3+Math.floor(Math.random()*3)),0,x); st.flip=false; draw(); };
  var ys=q("#qwYes"); if(ys) ys.onclick=function(){ var D2=qwData(); D2.k[st.deck.l.shift()]=1; H.save("ihsan_qwords",D2); st.flip=false; H.N.vibrate(40); draw(); };
  var ag=q("#qwAgain"); if(ag) ag.onclick=function(){ var D2=qwData(); idx.forEach(function(i){ delete D2.k[i]; }); H.save("ihsan_qwords",D2); st.deck=null; draw(); };
}

// ================= 70: ASK AI =================
var AI_LINKS=[[["Pejabat Mufti Wilayah Persekutuan","Federal Territory Mufti Office"],"https://muftiwp.gov.my/","Irsyad al-Fatwa dan soal jawab","Irsyad al-Fatwa and Q&A"]];
function aiSys(){ var lang=H.en()?"English":"Bahasa Melayu (Malaysia)";
  return "You answer questions about Islam for a Muslim in Malaysia. Follow Ahl as-Sunnah wal-Jama'ah and the Shafi'i school as practised in Malaysia (JAKIM and the state mufti offices); mention other views only briefly when they matter. "+
  "Write in "+lang+" only. Be concise: about 200 words at most, plain text with short paragraphs or a short list, no tables. "+
  "When you cite the Quran give the surah name and ayah number; when you cite a hadith give the collection. Never invent a verse, hadith or source, and say so plainly when you are not sure. "+
  "You do not issue fatwas: for a ruling on the person's own situation (marriage, divorce, inheritance, zakat on specific wealth, medical or financial matters) advise asking the state mufti office or a qualified ustaz. "+
  "If a question is not about Islam or Muslim life, answer briefly and kindly.";
}
// 0.27.0: questions are filed by topic so past answers can be found again
var AICAT=[["solat","🕌","Solat","Prayer",/solat|sembahyang|salah\b|prayer|rakaat|rakat|sujud|jamak|qasar|imam|jemaah|azan|witir|tahajjud|dhuha|qunut|wuduk|wudhu/i],
  ["puasa","🌙","Puasa & Ramadan","Fasting & Ramadan",/puasa|ramadan|ramadhan|fast|sahur|iftar|berbuka|tarawih|lailatul|fidyah|qadha/i],
  ["bersuci","💧","Bersuci","Purity",/najis|mandi|tayammum|istinja|haid|nifas|junub|hadas|ghusl|purity|menstruat/i],
  ["zakat","💰","Zakat & harta","Zakat & wealth",/zakat|sedekah|wakaf|harta|riba|hutang|debt|wealth|insurans|takaful|pelaburan|saham|invest|loan|pinjam/i],
  ["haji","🕋","Haji & umrah","Hajj & umrah",/haji|hajj|umrah|ihram|tawaf|sa'?ie|miqat|mekah|makkah|madinah|arafah|mina/i],
  ["keluarga","👨‍👩‍👧","Keluarga & nikah","Family & marriage",/nikah|kahwin|marri|suami|isteri|husband|wife|cerai|talak|divorc|anak|child|ibu bapa|parent|aurat|mahram|keluarga|family|faraid|wasiat|inherit/i],
  ["akidah","☝️","Akidah & iman","Belief & faith",/akidah|aqidah|iman|allah|tauhid|syirik|shirk|malaikat|angel|qada|qadar|takdir|kiamat|akhirat|hereafter|syurga|neraka|paradise|hell|kubur|grave/i],
  ["quran","📖","Al-Quran & hadis","Quran & hadith",/quran|al-quran|surah|ayat|ayah|tafsir|hadis|hadith|sunnah|nabi|prophet|rasul|sirah|sahabat|companion|tajwid/i],
  ["hati","💚","Akhlak & hati","Character & heart",/sabar|patien|syukur|grate|ikhlas|sincer|dosa|sin|taubat|repent|tawbah|hati|heart|marah|anger|sedih|sad|cemas|anxi|akhlak|manner|adab|zikir|dhikr|doa|dua/i],
  ["halal","🏷️","Makanan & halal","Food & halal",/halal|haram|makan|food|minum|drink|daging|meat|sembelih|slaughter|alkohol|alcohol|gelatin|e-?num/i]];
function aiCatOf(t){ for(var i=0;i<AICAT.length;i++) if(AICAT[i][4].test(t||"")) return AICAT[i][0]; return "lain"; }
function aiCatName(c){ var x=AICAT.filter(function(a){ return a[0]===c; })[0]; return x?x[1]+" "+L2(x[2],x[3]):"💭 "+L2("Lain-lain","Other"); }
function aiTagged(log){ var cur="lain"; return log.map(function(m,i){ if(m.r==="u") cur=m.c||aiCatOf(m.t); return {m:m, i:i, c:m.r==="u"?cur:(m.c||cur)}; }); }
function aiLog(){ var l=H.load("ihsan_askai",[]); return Array.isArray(l)?l:[]; }
function aiFmt(t){ return String(t||"").replace(/\r/g,"").split(/\n{2,}/).map(function(p){ var h=E(p).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>").replace(/^#+\s*/gm,"").replace(/^\s*[-*]\s+/gm,"• ").replace(/\n/g,"<br>"); return '<p>'+h+'</p>'; }).join(""); }
function aiPromptFor(qs){ return L2("Soalan tentang Islam (mazhab Syafi'i, amalan di Malaysia). Jawab dalam Bahasa Melayu dengan ringkas, sertakan sumber al-Quran atau hadis jika ada. Ini bukan permintaan fatwa.\n\n","A question about Islam (Shafi'i school, as practised in Malaysia). Answer in English concisely, with Quran or hadith sources where possible. This is not a request for a fatwa.\n\n")+qs; }
function askai(){
  var A=window.HalalAI; if(A){ A._on=H.on; A._off=H.off; }
  var log=aiLog(), pvName=window.AIRun?AIRun.label("ask"):"AI";
  var html='<div class="card aiNote"><div class="row" style="justify-content:space-between;gap:6px;align-items:center"><b>💬 '+L2("Tanya AI tentang Islam","Ask AI about Islam")+'</b>'+(window.AIRun?AIRun.btn("ask"):'')+'</div><div class="small" style="margin-top:4px;line-height:1.5">'+(log.length?L2("Jawapan AI boleh tersilap dan bukan fatwa.","AI answers can be wrong and are not a fatwa."):L2("Jawapan dijana oleh AI dan boleh tersilap. Ia bukan fatwa. Untuk hukum yang melibatkan diri anda, rujuk pejabat mufti negeri atau ustaz bertauliah.","Answers are written by AI and can be wrong. They are not a fatwa. For a ruling on your own situation, ask your state mufti office or a qualified ustaz."))+'</div>'+
    '<div class="aiLinks">'+AI_LINKS.map(function(x,i){ return '<button class="chip" data-al="'+i+'">↗ '+E(Array.isArray(x[0])?L(x[0]):x[0])+'</button>'; }).join("")+'</div>'+
    (log.length?'</div>':'<div class="mut tiny" style="margin-top:6px">🔒 '+L2("Soalan dihantar kepada ","Questions are sent to ")+E(pvName)+L2(". Jangan tulis maklumat peribadi.",". Do not write personal information.")+'</div></div>');
  if(log.length){ var tg=aiTagged(log), cnt={}; tg.forEach(function(x){ if(x.m.r==="u") cnt[x.c]=(cnt[x.c]||0)+1; });
    if(st.aiCat && !cnt[st.aiCat]) st.aiCat=null;
    html+='<div class="aiCats"><div class="mut tiny" style="margin:0 2px 4px">📚 '+L2("Sejarah soalan ikut kategori","Question history by topic")+'</div><div class="chips"><button class="chip g3d'+(!st.aiCat?" on":"")+'" data-aic="">'+L2("Semua","All")+' · '+tg.filter(function(x){ return x.m.r==="u"; }).length+'</button>'+
      AICAT.map(function(a){ return a[0]; }).concat(["lain"]).filter(function(c){ return cnt[c]; }).map(function(c){ return '<button class="chip g3d'+(st.aiCat===c?" on":"")+'" data-aic="'+c+'">'+aiCatName(c)+' · '+cnt[c]+'</button>'; }).join("")+'</div></div>'; }
  html+='<div id="aiLog">';
  if(!log.length && !st.aiBusy){
    var sug=H.en()?["What breaks the fast?","How do I combine and shorten prayers when travelling?","How many rakaat is the Dhuha prayer, and when is it?","What are the manners of reciting the Quran?"]:["Apakah perkara yang membatalkan puasa?","Bagaimana cara solat jamak dan qasar ketika musafir?","Berapa rakaat solat Dhuha dan bilakah waktunya?","Apakah adab membaca al-Quran?"];
    html+='<div class="mut small" style="margin:4px 4px 6px">'+L2("Contoh soalan:","Example questions:")+'</div><div class="aiSug">'+sug.map(function(s){ return '<button class="chip" data-sug="'+E(s)+'">'+E(s)+'</button>'; }).join("")+'</div>';
  }
  var cats=aiTagged(log), all=!st.aiCat, qi=-1;
  // 0.34.1 (Farah): under "All" only the questions show; tap one to drop its answer down. A category shows the answers.
  if(!st.aiOpen) st.aiOpen={};
  log.forEach(function(m,i){
    if(st.aiCat && cats[i].c!==st.aiCat) return;
    if(m.r==="u") qi=i;
    if(all && m.r==="u"){ var op=!!st.aiOpen[i]; html+='<button class="aiB u aiQt'+(op?" open":"")+'" data-aiq="'+i+'"><span>'+E(m.t)+'</span><i>'+(op?"▴":"▾")+'</i></button>'; return; }
    if(all && !st.aiOpen[qi]) return;
    if(m.r==="u") html+='<div class="aiB u">'+E(m.t)+'</div>';
    else html+='<div class="aiB a">'+aiFmt(m.t)+'<div class="aiMeta"><span class="mut tiny">'+E(m.p||"")+'</span><span><button class="ib" data-ac="'+i+'">⧉</button> <button class="ib" data-as="'+i+'">↗</button></span></div></div>';
  });
  if(st.aiBusy) html+=(window.AIRun?AIRun.card("ask"):'')+'<div class="aiB a wait"><span class="dots"><i></i><i></i><i></i></span> '+L2("Sedang menjawab…","Answering…")+'</div>';
  if(st.aiErr) html+='<div class="aiB err">'+E(st.aiErr)+' <button class="chip" id="aiRetry">↻ '+L2("Cuba lagi","Try again")+'</button></div>';
  html+='</div>';
  html+='<div class="aiIn"><textarea id="aiQ" rows="2" maxlength="1200" placeholder="'+L2("Tulis soalan anda…","Type your question…")+'"></textarea><button class="btn gold" id="aiGo"'+(st.aiBusy?' disabled':'')+'>'+L2("Hantar","Send")+'</button></div>';
  if(A && A.APPS) html+='<div class="card"><h3>📲 '+L2("Atau tanya dalam aplikasi AI anda","Or ask in your own AI app")+'</h3><div class="mut tiny" style="margin-bottom:6px">'+L2("Soalan yang anda tulis dihantar ke aplikasi itu bersama arahan ringkas.","The question you typed goes to that app with a short instruction.")+'</div><div class="aiLinks">'+A.APPS.map(function(x,i){ return '<button class="chip" data-app="'+i+'">'+E(x[0])+'</button>'; }).join("")+'</div></div>';
  if(log.length) html+='<button class="btn alt full" id="aiClr" style="margin-bottom:12px">🗑 '+L2("Padam perbualan","Clear the conversation")+'</button>';
  box.innerHTML=html;
  var ta=q("#aiQ"); if(H.st.aiPre){ ta.value=H.st.aiPre; H.st.aiPre=null; } else if(st.aiDraft) ta.value=st.aiDraft;
  var grow=function(){ ta.style.height="auto"; ta.style.height=Math.min(160, ta.scrollHeight+2)+"px"; };
  ta.oninput=function(){ st.aiDraft=ta.value; grow(); }; if(ta.value) grow();
  q("#aiGo").onclick=function(){ aiSend(ta.value); };
  qa("[data-sug]").forEach(function(b){ b.onclick=function(){ aiSend(b.getAttribute("data-sug")); }; });
  qa("[data-aic]").forEach(function(b){ b.onclick=function(){ st.aiCat=b.getAttribute("data-aic")||null; draw(); }; });
  qa("[data-aiq]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-aiq"), vw=document.getElementById("view"), y=vw?vw.scrollTop:0; if(st.aiOpen[i]) delete st.aiOpen[i]; else st.aiOpen[i]=1; st.aiKeep=true; draw(); if(vw) vw.scrollTop=y; }; });
  qa("[data-al]").forEach(function(b){ b.onclick=function(){ var x=AI_LINKS[+b.getAttribute("data-al")]; H.openWeb(x[1], Array.isArray(x[0])?L(x[0]):x[0]); }; });
  qa("[data-ac]").forEach(function(b){ b.onclick=function(){ copy(log[+b.getAttribute("data-ac")].t); }; });
  qa("[data-as]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-as"), qn=i>0&&log[i-1].r==="u"?log[i-1].t:""; var t=(qn?"❓ "+qn+"\n\n":"")+log[i].t+"\n\n("+L2("Jawapan AI, bukan fatwa","AI answer, not a fatwa")+")";
    if(window.Native && H.N.shareTo) H.N.shareTo("","",t); else copy(t); }; });
  qa("[data-app]").forEach(function(b){ b.onclick=function(){ var t=(ta.value||"").trim(); if(!t){ H.toast(L2("Tulis soalan dahulu","Type a question first")); ta.focus(); return; } var app=A.APPS[+b.getAttribute("data-app")], p=aiPromptFor(t);
    if(window.Native && H.N.shareTo){ if(H.N.copyText) H.N.copyText(p); H.N.shareTo(app[1],"",p); H.toast(L2("Soalan disalin. Tampal jika perlu.","Question copied. Paste it if needed.")); }
    else { try{ navigator.clipboard.writeText(p); }catch(e){} window.open(app[2]); } }; });
  var rt=q("#aiRetry"); if(rt) rt.onclick=function(){ var l=aiLog(), last=l.length&&l[l.length-1].r==="u"?l.pop():null; H.save("ihsan_askai",l); st.aiErr=null; if(last) aiSend(last.t); else draw(); };
  var cl=q("#aiClr"); if(cl) cl.onclick=function(){ H.save("ihsan_askai",[]); st.aiErr=null; st.aiOpen={}; draw(); };
  var lg=document.getElementById("view"), keep=st.aiKeep; st.aiKeep=false; if(!keep && (log.length||st.aiBusy)) setTimeout(function(){ var a=q("#aiQ"); if(a && lg) lg.scrollTop=Math.max(0, a.offsetTop-lg.clientHeight+120); },30);
}
function aiSend(text){
  text=String(text||"").trim(); var A=window.HalalAI;
  if(!text || st.aiBusy) return; if(!A || !A.chat){ H.toast(L2("AI tidak tersedia","AI is not available")); return; }
  var log=aiLog(); if(!st.aiOpen) st.aiOpen={}; st.aiOpen[log.length]=1; log.push({r:"u", t:text.slice(0,1200), c:aiCatOf(text), d:Date.now()}); if(log.length>300) log=log.slice(-300); st.aiCat=null; H.save("ihsan_askai",log);
  st.aiDraft=""; st.aiErr=null; st.aiBusy=true; if(pg==="askai") draw();
  var msgs=[{role:"system", content:aiSys()}].concat(log.slice(-7).map(function(m){ return {role:m.r==="u"?"user":"assistant", content:String(m.t).slice(0,1500)}; }));
  A.chat(msgs, H.L2x).then(function(r){
    var l=aiLog(), lu=l.length?l[l.length-1]:null; l.push({r:"a", t:r.text, p:r.provider, c:lu&&lu.r==="u"?lu.c:undefined}); if(l.length>300) l=l.slice(-300); H.save("ihsan_askai",l); st.aiBusy=false; if(pg==="askai" && box && document.body.contains(box)) draw();
  }, function(e){ st.aiBusy=false; st.aiErr=e && e.cancel ? null : (e && e.message)||L2("Ralat AI","AI error"); if(pg==="askai" && box && document.body.contains(box)) draw(); });
}

// ---------- entry ----------
function traceBind(){ var cv=q("#htC"); if(!cv) return; var cx=cv.getContext("2d"), W=cv.width, ti=st.tl||0, ch=HIJAIYAH[ti][0], down=false, last=null;
  var font="bold 230px 'Noto Naskh Arabic','Amiri','Scheherazade New',serif";
  var bg=function(){ cx.clearRect(0,0,W,W); cx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--card2")||"#14301f"; cx.fillRect(0,0,W,W); cx.font=font; cx.textAlign="center"; cx.textBaseline="middle"; cx.fillStyle="rgba(160,160,160,.45)"; cx.fillText(ch, W/2, W/2+20); };
  var ink=document.createElement("canvas"); ink.width=ink.height=W; var ik=ink.getContext("2d"); ik.lineCap=ik.lineJoin="round"; ik.lineWidth=24; ik.strokeStyle="#000";
  var mask=document.createElement("canvas"); mask.width=mask.height=W; var mk=mask.getContext("2d"); mk.font=font; mk.textAlign="center"; mk.textBaseline="middle"; mk.fillText(ch, W/2, W/2+20);
  var show=function(){ bg(); cx.globalAlpha=.9; cx.drawImage(ink,0,0); cx.globalAlpha=1; };
  var pt=function(e){ var r=cv.getBoundingClientRect(), p=e.touches?e.touches[0]:e; return [(p.clientX-r.left)*W/r.width, (p.clientY-r.top)*W/r.height]; };
  var tint=function(){ ik.globalCompositeOperation="source-in"; ik.fillStyle="#c9a646"; ik.fillRect(0,0,W,W); ik.globalCompositeOperation="source-over"; };
  cv.onpointerdown=function(e){ e.preventDefault(); down=true; last=pt(e); try{ cv.setPointerCapture(e.pointerId); }catch(x){} };
  cv.onpointermove=function(e){ if(!down) return; var p=pt(e); ik.beginPath(); ik.moveTo(last[0],last[1]); ik.lineTo(p[0],p[1]); ik.stroke(); last=p; tint(); show(); };
  cv.onpointerup=cv.onpointercancel=function(){ down=false; };
  show();
  q("#htS").onclick=function(){ H.speakAr(HIJAIYAH[ti][1]); };
  q("#htX").onclick=function(){ ik.clearRect(0,0,W,W); show(); };
  q("#htP").onclick=function(){ st.tl=(ti+HIJAIYAH.length-1)%HIJAIYAH.length; draw(); };
  q("#htN").onclick=function(){ st.tl=(ti+1)%HIJAIYAH.length; draw(); };
  q("#htK").onclick=function(){ var m=mk.getImageData(0,0,W,W).data, k=ik.getImageData(0,0,W,W).data, inM=0, cov=0, inkN=0, off=0;
    for(var i=3;i<m.length;i+=16){ var a=m[i]>40, b=k[i]>40; if(a){ inM++; if(b) cov++; } if(b){ inkN++; if(!a) off++; } }
    var c=inM?cov/inM:0, o=inkN?off/inkN:1, stars=c>0.55&&o<0.55?3:c>0.38&&o<0.65?2:c>0.2?1:0, D2=H.load("ihsan_hjtrace",{})||{};
    if(stars>(D2[ti]||0)){ D2[ti]=stars; H.save("ihsan_hjtrace", D2); }
    q("#htM").textContent=(stars?"★".repeat(stars)+" ":"")+(stars===3?L2("MasyaAllah, cantik!","MasyaAllah, beautiful!"):stars===2?L2("Bagus! Cuba ikut bentuknya lebih rapat.","Good! Try to follow the shape more closely."):stars===1?L2("Hampir! Surih seluruh huruf.","Nearly! Trace the whole letter."):L2("Cuba lagi: ikut huruf kelabu.","Try again: follow the grey letter."));
    if(stars===3 && H.N.vibrate) H.N.vibrate(60); }; }
function draw(){ if(!box) return; ({n40:n40, sahabat:sahabat, hijaiyah:hijaiyah, qwords:qwords, askai:askai}[pg]||n40)(); markTalk(); }
window.IlmuView=function(el, page, helpers){ H=helpers; hook(); if(page!==pg){ stopTalk(); st.qz=null; } box=el; pg=page; draw(); };
window.IlmuView.back=function(){ if(!box || !document.body.contains(box)) return false;
  if(pg==="n40" && st.n40){ stopTalk(); st.n40=null; draw(); return true; }
  if(pg==="sahabat" && st.sb){ stopTalk(); st.sb=null; draw(); return true; }
  return false; };
window.IlmuView.navGet=function(){ var o={n40:st.n40, sb:st.sb, hj:st.hj, qw:st.qw}; o.k=JSON.stringify(o); return o; };
window.IlmuView.navSet=function(o){ if(o.n40!==st.n40 || o.sb!==st.sb) stopTalk(); st.n40=o.n40; st.sb=o.sb; st.hj=o.hj; st.qw=o.qw; };
window.IlmuView.stop=function(){ if(talking) stopTalk(); };
})();
