/* My Ihsan app - prototype 0.7.88 */
/* 0.7.49 security: the AI keys inside ihsan_halal_ai are kept encrypted in the Android Keystore (Native.secSet/secGet); localStorage holds the settings without the keys. Every caller still reads and writes the same item. */
(function(){ try{ var N=window.Native; if(!N || !N.secSet || !window.Storage) return; var K="ihsan_halal_ai", gi=Storage.prototype.getItem, si=Storage.prototype.setItem;
  function keysOf(c){ return c && c.keys && typeof c.keys==="object" ? c.keys : null; }
  Storage.prototype.setItem=function(k,v){ if(k===K && this===window.localStorage){ try{ var c=JSON.parse(v), ks=keysOf(c);
      if(ks && Object.keys(ks).length){ if(N.secSet(K, JSON.stringify(ks))){ c.keys={}; return si.call(this,k,JSON.stringify(c)); } }
      else if(ks){ N.secSet(K, ""); } }catch(e){} } return si.call(this,k,v); };
  Storage.prototype.getItem=function(k){ var raw=gi.call(this,k); if(k===K && this===window.localStorage && raw){ try{ var c=JSON.parse(raw), ks=keysOf(c);
      if(ks && Object.keys(ks).length){ if(N.secSet(K, JSON.stringify(ks))){ var o=JSON.parse(raw); o.keys={}; si.call(this,k,JSON.stringify(o)); } }
      else { var sec=N.secGet(K); if(sec){ c=c||{}; c.keys=JSON.parse(sec); return JSON.stringify(c); } } }catch(e){} } return raw; };
}catch(e){} })();
(function(){
"use strict";
// ---------- native bridge ----------
var N = window.Native || {
  info:function(){return '{"sdk":0,"version":"web"}'}, hasPerm:function(){return true},
  requestPerm:function(w){setTimeout(function(){window.onNative('perm',{which:w,granted:true})},100)},
  getLocation:function(){setTimeout(function(){window.onNative('location',{lat:3.139,lon:101.687,acc:30})},200)},
  startCompass:function(){var d=0;clearInterval(window.__cmp);window.__cmp=setInterval(function(){d=(d+3)%360;window.onNative('heading',{deg:d,acc:3})},120)},
  stopCompass:function(){clearInterval(window.__cmp)},
  fetchUrl:function(id,url){setTimeout(function(){window.onNative('fetch',{id:id,status:0,body:'offline (web preview)'})},300)},
  setSchedule:function(a,b){window.__sched=[a,b]}, setExtras:function(j){window.__ex=j}, testNotification:function(){toast('Notifikasi ujian (web)')},
  openMaps:function(q,la,lo){window.open('https://www.google.com/maps/search/'+encodeURIComponent(q)+'/@'+la+','+lo+',14z')},
  openUrl:function(u){window.open(u)}, keepScreenOn:function(){}, keepAwake:function(){}, vibrate:function(){},
  startSujud:function(){window.onNative('sujud',{type:'ready',faceHw:false,prox:false})}, stopSujud:function(){}
};
// 0.5.16: web build (iPhone / browser). index.html of the web copy sets window.IHSAN_WEB; Android pages are hidden.
var WEB = !!window.IHSAN_WEB && !window.Native;
// 0.6.40: iPhone app (ios-app/, Capacitor): the web build plus ios-app/bridge.js, which gives real GPS, compass, notifications, sharing and native fetch
var IOS = WEB && !!window.IHSAN_IOS && !!window.IosBridge;
var WEB_OFF = IOS ? ["paparan"] : [];   /* 0.7.77: Time › Track stays on iPhone (calendars); only its Stats tab is hidden there */   /* 0.7.58 (owner): TV Display & Billboard hidden on iPhone / iPad (no landscape lock, pinning or auto start) */   // 0.6.56 (owner): the web app is the complete app; what a browser cannot do is greyed (WEB_GREY), not removed
if(WEB){
  N.fetchUrl=function(id,url){ fetch(url).then(function(r){ return r.text().then(function(t){ window.onNative("fetch",{id:id,status:r.status,body:t}); }); }).catch(function(e){ window.onNative("fetch",{id:id,status:0,body:String(e)}); }); };
  N.getLocation=function(){ if(!navigator.geolocation){ window.onNative("location",{error:"none"}); return; }
    navigator.geolocation.getCurrentPosition(function(p){ window.onNative("location",{lat:p.coords.latitude,lon:p.coords.longitude,acc:p.coords.accuracy}); }, function(e){ window.onNative("location",{error:String(e && e.message || "denied")}); }, {enableHighAccuracy:false, timeout:15000, maximumAge:600000}); };
  N.openUrl=function(u){ window.open(u,"_blank"); };
  N.vibrate=function(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms||30); }catch(e){} };
  (function(){ if(!IOS) return; var A=IOS?["q-stat","barcode"]:["q-qibla","q-kiblat","q-finder","q-stat","q-resepi","q-rplan","barcode","saham","player"], W=IOS?["qcam","statistik","stat","barcode","steps","screen","paparan","dspw"]:["kiblat","qibla","qcam","fokus","senaman","statistik","stat","tukaran","saham","halal","barcode","cari","finder","dengar","tanya","radio","podcast","live","player","steps","screen"];
    var css=A.map(function(x){ return '[data-act="'+x+'"]'; }).concat(W.map(function(x){ return '[data-wsc*="'+x+'"],[data-learn="'+x+'"],[data-go="'+x+'"]'; })).join(",")+'{display:none!important}';
    css+='[data-login]{display:none!important}';   /* 0.7.58 (owner): OpenRouter sign-in is Android-only; paste a key instead */
    var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st); })();
  N.testNotification=function(){ toast(L2x("Notifikasi hanya dalam aplikasi Android","Notifications are only in the Android app")); };
  // 0.6.56 (owner): things only a phone can do stay visible but grey; a tap says why
  if(!IOS){ var WEB_GREY=['[data-trk="stats"]','[data-act="q-stat"]','[data-m="camera"]','[data-mtp="spk"]','[data-mtp="lis"]','#rnGo','[data-wsc*="statistik"]'].join(",");
    var gst=document.createElement("style"); gst.textContent=WEB_GREY.split(",").map(function(x){ return x+",#side .webGrey"; }).join(",")+'{opacity:.42!important;filter:grayscale(1)!important}'+WEB_GREY.split(",").map(function(x){ return x+"::after"; }).join(",")+'{content:"📱";font-size:10px;margin-left:4px;filter:none}';
    document.head.appendChild(gst);
    document.addEventListener("click", function(e){ var t=e.target && e.target.closest && e.target.closest(WEB_GREY); if(!t) return; e.stopPropagation(); e.preventDefault();
      toast("📱 "+L2x("Hanya dalam aplikasi Android: ","Only in the Android app: ")+(t.matches('[data-trk="stats"],[data-act="q-stat"]')?L2x("masa skrin & penggunaan aplikasi perlukan telefon.","screen time & app usage need the phone."):t.matches('[data-m="camera"]')?L2x("kiraan rakaat dengan kamera / sensor sujud.","rakaat counting with the camera / sujud sensor."):t.matches('[data-mtp]')?L2x("pembesar suara & siaran guna audio telefon.","the speaker & broadcast use the phone's audio."):t.matches('#rnGo')?L2x("jejak GPS terus berjalan walau skrin tertutup.","GPS tracking keeps running with the screen off."):L2x("ciri telefon.","a phone feature."))); }, true); }
  if(IOS) IosBridge.patch(N); else if(window.IhsanWeb) IhsanWeb.patch(N, {toast:function(t){ toast(t); }, en:function(){ return en_(); }});   // 0.6.56: the full app on the web
}
// 0.5.17-dev: three.js scenes on foldable phones and tablets: when the screen size changes (unfold, fold, turn), every renderer
// keeps the same share of its container width and of the screen height, and its camera aspect follows. Works for every 3D view.
(function(){ var reg=[], fit=function(r, cam){ try{ var c=r.domElement, p=c.parentElement;
      if(p && !r.__fitInit && c.clientWidth && p.clientWidth){ r.__fitInit=1; r.__rw=c.clientWidth/p.clientWidth; r.__rh=c.clientHeight/Math.max(1,window.innerHeight); r.__vw=window.innerWidth; r.__vh=window.innerHeight; reg.push(r); }
      if(r.__fitInit && (r.__vw!==window.innerWidth || r.__vh!==window.innerHeight) && p && p.clientWidth){ r.__vw=window.innerWidth; r.__vh=window.innerHeight;
        var w=Math.max(1,Math.round(p.clientWidth*r.__rw)), h=Math.max(1,Math.round(window.innerHeight*r.__rh)); r.setSize(w,h);
        if(cam && cam.isPerspectiveCamera){ cam.aspect=w/h; cam.updateProjectionMatrix(); } else if(cam && cam.isOrthographicCamera && cam.top){ var a=w/h, hh=(cam.top-cam.bottom)/2; cam.left=-hh*a; cam.right=hh*a; cam.updateProjectionMatrix(); } }
    }catch(e){} };
  // three.js r159 defines render() on each renderer, so wrap the constructor and patch every new renderer
  var hook=function(T){ if(!T || !T.WebGLRenderer || T.__fit) return; T.__fit=1; var Orig=T.WebGLRenderer;
    var W=function(o){ var r=new Orig(o), rr=r.render; r.render=function(scene, cam){ fit(r, cam); var x=IB3D.pre(r, cam); var out=rr.apply(r, arguments); return out; }; return r; }; W.prototype=Orig.prototype; try{ T.WebGLRenderer=W; }catch(e){} };
  try{ var cur; Object.defineProperty(window, "THREE", {configurable:true, get:function(){ return cur; }, set:function(v){ cur=v; setTimeout(function(){ hook(cur); }, 0); }}); }catch(e){}
  window.addEventListener("resize", function(){ reg=reg.filter(function(r){ return r.domElement && r.domElement.isConnected; }); });
})();
// 0.5.69 (owner): every three.js view can orbit (one finger), zoom (pinch / wheel), pan (two fingers), reset ⟲ and go full screen ⛶.
// The view change is laid on top of each scene's own camera at draw time, so no scene needs its own code. A canvas can say
// data-ib3d="own" (it already orbits/zooms itself: only ⛶ is added), "no1" (no one-finger orbit) or "off" (nothing).
var IB3D=(function(){
  var ID=function(){ return {yaw:0, pitch:0, zoom:1, px:0, py:0}; }, same=function(v){ return !v || (Math.abs(v.yaw)<1e-4 && Math.abs(v.pitch)<1e-4 && Math.abs(v.zoom-1)<1e-4 && Math.abs(v.px)<1e-4 && Math.abs(v.py)<1e-4); };
  function mode(c){ return (c && c.dataset && c.dataset.ib3d) || ""; }
  function bar(r){ var c=r.domElement, p=c.parentElement, m=mode(c); if(!p || m==="off" || !c.isConnected) return; if(r.__bar && r.__bar.parentElement===p) return;
    var rc=c.getBoundingClientRect(); if(rc.width<140 || rc.height<100) return;
    if(getComputedStyle(p).position==="static") p.style.position="relative";
    var b=document.createElement("div"); b.className="ib3dBar noswipe"; b.innerHTML=(m==="own"?'':'<button data-i3="r" aria-label="Reset">⟲</button>')+'<button data-i3="f" aria-label="Full screen">⛶</button>'; p.appendChild(b); r.__bar=b;
    b.addEventListener("pointerdown", function(e){ e.stopPropagation(); }); b.addEventListener("click", function(e){ e.stopPropagation(); var k=e.target.getAttribute("data-i3"); if(k==="r") reset(r); if(k==="f") full(r); });
    gestures(r); }
  function reset(r){ r.__v=ID(); }
  function full(r, off){ var p=r.domElement.parentElement; if(!p) return; var on=off?false:!p.classList.contains("ib3dFull"); p.classList.toggle("ib3dFull", on); document.body.classList.toggle("ib3dOn", !!document.querySelector(".ib3dFull"));
    var b=r.__bar && r.__bar.querySelector('[data-i3="f"]'); if(b) b.textContent=on?"✕":"⛶"; }
  function exitFull(){ var any=false; reg.forEach(function(r){ var p=r.domElement && r.domElement.parentElement; if(p && p.classList.contains("ib3dFull")){ full(r, true); any=true; } }); return any; }
  var reg=[];
  function gestures(r){ var c=r.domElement; if(c.__ib3dG) return; c.__ib3dG=1; reg.push(r); var P={}, start=null, moved=false, d0=0, m0=null;
    var v=function(){ return r.__v || (r.__v=ID()); };
    c.addEventListener("pointerdown", function(e){ P[e.pointerId]={x:e.clientX, y:e.clientY}; var ks=Object.keys(P); moved=false;
      if(ks.length===1){ start={x:e.clientX, y:e.clientY, v:JSON.parse(JSON.stringify(v()))}; }
      if(ks.length===2){ var a=P[ks[0]], b=P[ks[1]]; d0=Math.hypot(a.x-b.x, a.y-b.y)||1; m0={x:(a.x+b.x)/2, y:(a.y+b.y)/2, v:JSON.parse(JSON.stringify(v()))}; start=null; } }, true);
    c.addEventListener("pointermove", function(e){ if(!P[e.pointerId]) return; P[e.pointerId]={x:e.clientX, y:e.clientY}; var m=mode(c), ks=Object.keys(P), w=c.clientWidth||300, h=c.clientHeight||300;
      if(m==="own" || m==="off") return;
      if(ks.length>=2 && m0){ var a=P[ks[0]], b=P[ks[1]], d=Math.hypot(a.x-b.x, a.y-b.y)||1, mx=(a.x+b.x)/2, my=(a.y+b.y)/2, V=v();
        V.zoom=Math.max(0.3, Math.min(6, m0.v.zoom*d/d0)); V.px=m0.v.px-(mx-m0.x)/w*1.2; V.py=m0.v.py+(my-m0.y)/h*1.2; moved=true; e.stopPropagation(); return; }
      if(ks.length===1 && start && m!=="no1"){ var dx=e.clientX-start.x, dy=e.clientY-start.y; if(!moved && Math.hypot(dx,dy)<10) return; moved=true; var V2=v();
        V2.yaw=start.v.yaw-dx/w*3.2; V2.pitch=Math.max(-1.2, Math.min(1.2, start.v.pitch+dy/h*2.4)); } }, true);
    var up=function(e){ delete P[e.pointerId]; if(Object.keys(P).length<2) m0=null; if(!Object.keys(P).length) start=null; };
    c.addEventListener("pointerup", up, true); c.addEventListener("pointercancel", up, true);
    c.addEventListener("click", function(e){ if(moved){ e.stopPropagation(); e.preventDefault(); moved=false; } }, true);
    c.addEventListener("wheel", function(e){ var m=mode(c); if(m==="own" || m==="off" || c.onwheel) return; var V=v(); V.zoom=Math.max(0.3, Math.min(6, V.zoom*(e.deltaY>0?0.9:1.1))); e.preventDefault(); }, {passive:false});
    c.addEventListener("dblclick", function(){ var m=mode(c); if(m!=="own" && m!=="off") reset(r); }); }
  // full screen size + the view change on the camera, kept until the scene moves its camera again (so tapping still hits what is shown)
  function pre(r, cam){ try{ var T=window.THREE, c=r.domElement, p=c.parentElement; if(!T || !cam) return; bar(r);
      var fs=!!(p && p.classList.contains("ib3dFull"));
      if(fs && !r.__fsSize){ var sz=r.getSize(new T.Vector2()); r.__fsSize=[sz.x, sz.y, c.style.width, c.style.height, cam.isPerspectiveCamera?cam.aspect:0]; }
      if(fs){ var cur=r.getSize(new T.Vector2()), tw=p.clientWidth, th=p.clientHeight; if(tw && th && (Math.abs(cur.x-tw)>1 || Math.abs(cur.y-th)>1)){ r.setSize(tw, th, false); c.style.width="100%"; c.style.height="100%"; if(cam.isPerspectiveCamera){ cam.aspect=tw/th; cam.updateProjectionMatrix(); } } }
      else if(r.__fsSize){ var o=r.__fsSize; r.__fsSize=null; r.setSize(o[0], o[1], false); c.style.width=o[2]; c.style.height=o[3]; if(cam.isPerspectiveCamera && o[4]){ cam.aspect=o[4]; cam.updateProjectionMatrix(); } }
      var st=cam.__ib;
      if(st && cam.position.equals(st.mp) && cam.quaternion.equals(st.mq)){ cam.position.copy(st.op); cam.quaternion.copy(st.oq); if(cam.isOrthographicCamera && cam.zoom===st.mz){ cam.zoom=st.oz; cam.updateProjectionMatrix(); } }
      cam.__ib=null; var V=r.__v; if(same(V) || mode(c)==="own" || mode(c)==="off"){ cam.updateMatrixWorld(true); return; }
      var op=cam.position.clone(), oq=cam.quaternion.clone(), oz=cam.zoom;
      var fwd=new T.Vector3(0,0,-1).applyQuaternion(oq), up=new T.Vector3(0,1,0), d=-op.dot(fwd); if(!(d>0.5)) d=Math.max(2, op.length()*0.5);
      var piv=op.clone().addScaledVector(fwd, d), right=new T.Vector3(1,0,0).applyQuaternion(oq), cu=new T.Vector3(0,1,0).applyQuaternion(oq);
      piv.addScaledVector(right, V.px*d).addScaledVector(cu, V.py*d);
      var off=fwd.clone().multiplyScalar(-d);   // camera position seen from the pivot
      off.applyAxisAngle(up, V.yaw); var r2=new T.Vector3().crossVectors(up, off).normalize(); if(r2.lengthSq()>0.5){ var tryO=off.clone().applyAxisAngle(r2, -V.pitch), ang=tryO.angleTo(up); if(ang>0.08 && ang<Math.PI-0.08) off=tryO; }
      if(cam.isOrthographicCamera){ cam.zoom=oz*V.zoom; cam.updateProjectionMatrix(); } else off.multiplyScalar(1/V.zoom);
      cam.position.copy(piv).add(off); cam.up.set(0,1,0); cam.lookAt(piv); cam.updateMatrixWorld(true);
      cam.__ib={op:op, oq:oq, oz:oz, mp:cam.position.clone(), mq:cam.quaternion.clone(), mz:cam.zoom};
    }catch(e){} }
  return {pre:pre, reset:reset, exitFull:exitFull};
})();
window.IB3D=IB3D;
var listeners = {};
function on(type, fn){ (listeners[type]=listeners[type]||[]).push(fn); }
// 0.5.73: same as on(); for functions that have their own local variable called "on" (Stats)
function onEv(type, fn){ on(type, fn); }
function off(type, fn){ var l=listeners[type]||[]; var i=l.indexOf(fn); if(i>=0) l.splice(i,1); }
window.onNative = function(type, data){ (listeners[type]||[]).slice().forEach(function(f){ try{f(data)}catch(e){console.error(e)} }); };

// ---------- storage & settings ----------
function load(k, d){ try{ var v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } }
function save(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
var DEF = {lang:"ms", zone:"WLY01", state:"KUL", zoneAuto:true, lat:null, lon:null, notif:{subuh:true,zohor:true,asar:true,maghrib:true,isyak:true},
  countdown:true, preMin:0, hijriOffset:0, arSize:26, theme:"black", rmode:"camera", tapStep:0.5, vib:false, showStat:false,
  sujud:{threshold:0.45, face:true, light:true, prox:true}, onboard:false, appTheme:"kaca", rdisp:"lines", rop:0.6, rQibla:false, rnum:"latin", rdir:"up", arFont:"scheherazade", srcLinks:true, showTr:true,
  homeCards:null, quietPray:false, alertStyle:"sound", softSubuh:false, lockShow:false, pauseMode:null, pauseUntil:0, endMin:0,
  imsakOn:false, imsakRamadan:true, syurukOn:false, tahajjud:false, mathAlarm:false, fastRem:false, fastRemT:{mk:true,bidh:true,special:true},
  adj:{subuh:0,zohor:0,asar:0,maghrib:0,isyak:0}, locMode:"auto", calcMethod:"MWL", overseas:false, home:null, musafirAuto:true, musafirOn:false,
  textZoom:100, showRumi:false, autoNight:false, ramadanForce:false, favs:[], ganti:{owe:0,done:[]}, volTasbih:false, sirahWind:false, sirahCalm:false, kidLock:false, appLock:false, senior:false, jnRem:false, mq:{on:false,list:[],r:100}};
var S = load("ihsan_settings", {});
for (var k in DEF) if (S[k]===undefined) S[k]=JSON.parse(JSON.stringify(DEF[k]));
if(S.alertStyle==="azan") S.alertStyle="sound";
// 0.5.27: hadith sources open online for everyone (the switch stays in Settings to turn it off)
if(!S.mig527){ S.mig527=1; S.srcLinks=true; try{ localStorage.setItem("ihsan_settings", JSON.stringify(S)); }catch(e){} }
// 0.5.69 (owner): the rakaat counter shows lines at 60% brightness with no Qibla arrow; level-3 options sit at the bottom
if(!S.mig569){ S.mig569=1; S.rdisp="lines"; S.rop=0.6; S.rQibla=false; S.dockTop=false; try{ localStorage.setItem("ihsan_settings", JSON.stringify(S)); }catch(e){} }
var APP_THEMES=[["blackgold","Hitam & emas (kulit & logam)","#0D0B08","#D8B452","Black & gold (leather & metal)","#0D0B08",false],["teman","Teman (cerah)","#F1FAEF","#CBFA1E","Teman (light)","#F1FAEF",true],["temannight","Teman (gelap)","#06261C","#CBFA1E","Teman (dark)","#06261C",false],["waktu","Waktu (cerah, ikut waktu solat)","#F6EEDF","#985A0C","Waktu (light, follows the prayer)","#F5F4EE",true],["waktunight","Waktu (gelap)","#0E1424","#8FA6FF","Waktu (dark)","#0E1424",false],["taman","Taman (cerah)","#EAEFE9","#14533D","Taman (light)","#14533D",false],["tamannight","Taman (gelap)","#0B1D16","#D4AE62","Taman (dark)","#0F3B2C",false],["kaca","Kaca (ikut waktu solat)","#1A2238","#F1D58A","Glass (follows the prayer)","#1A2238",false],["lembut","Lembut (dunia mainan)","#ECEBF7","#FF9EBB","Soft (toy land)","#ECEBF7",true],["buluh","Buluh (lembut)","#E6D6A2","#4E8A35","Bamboo (soft)","#E6D6A2",true],["cecair","Kaca cecair (warna bergerak)","#F7E8FF","#8EC5FF","Liquid glass (moving colours)","#F4EEFF",true],["cecairgelap","Kaca cecair gelap","#05060D","#8B3DFF","Liquid glass (dark)","#05060D",false],["night","Malam (merah malap)","#000000","#9c3a2e","Night (dim red)","#000000",false]];   // 0.6.95 (owner): Green, Light white, Light green, Dark blue removed; Night only for the automatic night theme
// 0.6.95: each theme's row in Settings, painted in its own colours [background, text]
var THEME_ROW={blackgold:["linear-gradient(135deg,#2A2219 0%,#0D0B08 55%,#000 100%)","#E9CD7A"],teman:["linear-gradient(120deg,#F1FAEF 0%,#CBFA1E 140%)","#1D2A08"],temannight:["linear-gradient(120deg,#06261C 0%,#0E4A33 70%,#9BC81A 170%)","#E6FFB0"],waktu:["linear-gradient(120deg,#F6EEDF 0%,#E7B979 130%)","#4A2A05"],waktunight:["linear-gradient(120deg,#0E1424 0%,#2B3A8A 120%)","#C9D4FF"],taman:["linear-gradient(120deg,#EAEFE9 0%,#9CC5A8 130%)","#0F3B2C"],tamannight:["linear-gradient(120deg,#0B1D16 0%,#3B2F12 85%,#D4AE62 170%)","#F2DDA8"],kaca:["linear-gradient(120deg,#1A2238 0%,#3A2F5C 60%,#C98A6E 140%)","#FFF3D6"],lembut:["linear-gradient(120deg,#ECEBF7 0%,#FFB3C9 140%)","#3A3558"],buluh:["linear-gradient(120deg,rgba(127,179,90,0) 30%,rgba(127,179,90,.55) 130%),repeating-linear-gradient(90deg,#E6D6A2 0 26px,#D6C38B 26px 28px)","#2F3A1E"],cecair:["linear-gradient(120deg,#FFB6D9 0%,#C9B6FF 50%,#B9D4FF 100%)","#1E1A3A"],cecairgelap:["linear-gradient(120deg,#05060D 0%,#3A1680 55%,#8A1257 115%)","#FFFFFF"]};
// 0.6.95: people on a removed theme move once to the nearest one that is left
if(!S.th695){ var THMOVE={green:"tamannight",white:"taman",lightgy:"teman",blue:"waktunight",night:"blackgold"}; if(THMOVE[S.appTheme]) S.appTheme=THMOVE[S.appTheme]; S.th695=1; try{ save("ihsan_settings", S); }catch(e){} }
var AR_FONTS=[["system","Naskh (sistem)","Naskh (system)",'"Noto Naskh Arabic","Droid Arabic Naskh",serif'],["amiri","Amiri","Amiri",'"AmiriL","Noto Naskh Arabic",serif'],["scheherazade","Scheherazade","Scheherazade",'"ScheherazadeL","Noto Naskh Arabic",serif']];
// 0.6.31 (owner): Scheherazade is the default Arabic font (also for people who never picked one)
if(!S.arF631){ if(!S.arFont || S.arFont==="system") S.arFont="scheherazade"; S.arF631=1; try{ save("ihsan_settings", S); }catch(e){} }
function applyFont(){ var f=AR_FONTS.filter(function(x){return x[0]===S.arFont;})[0]||AR_FONTS[0]; document.documentElement.style.setProperty("--ar", f[3]); document.documentElement.classList.toggle("notr", !S.showTr); }
function nightNow(){ if(!S.autoNight) return false; var h=new Date().getHours(); if(h>=22) return true; try{ var t=getDay(new Date()); var sy=t.syuruk.split(":"); var now=new Date(); return now.getHours()*60+now.getMinutes() < (+sy[0])*60+(+sy[1]); }catch(e){ return h<7; } }
var themeNow=null;
// 0.5.46: the Waktu theme's light palette follows the current prayer (subuh, zohor, asar, maghrib, isyak); Dhuha uses the Zohor sky
function waktuKey(){ try{ if(inDhuha()) return "zohor"; var k=currentPrayer(); return k==="syuruk"||k==="jumaat"?"zohor":k; }catch(e){ return "zohor"; } }
// 0.6.59 Kaca (glass): the same prayer palette (data-wk) + a sky layer behind the app; the system bar follows the sky top
var KACA_SKY={subuh:["#1A2650","#4D5A8A","#B98AA3","#F0C4A0","#FFD2A8",250,760,46],zohor:["#2D6FA6","#5E93BF","#A9C7DC","#DCE7EC","#FFF4D6",330,300,46],asar:["#2F5F86","#6F8FA6","#D9A878","#F0C08A","#FFE2A8",300,560,46],maghrib:["#1D1838","#5A3561","#C45F62","#F2A066","#FFB27A",330,800,46],isyak:["#060B1E","#0E1838","#1E2A58","#3B3A6E","#E9ECFF",372,534,11]};
// 0.7.19 (owner): the Kaca sky's silhouette is Masjid an-Nabawi (drawn here, no image): the long prayer hall with its row of small
// roof domes, the Green Dome on its drum, the silver dome, and the tall tiered minarets (base, balconies, shafts, pointed caps).
// viewBox 412 × 118, ground at y 118 (the ground strip under it is a full-width div, so wide screens keep the right shape).
function nabawi(){ var G=118, d="", R=function(x,y,w,h){ d+="M"+x.toFixed(1)+" "+y.toFixed(1)+"h"+w.toFixed(1)+"v"+h.toFixed(1)+"h"+(-w).toFixed(1)+"z"; };
  var mina=function(cx,H,w){ var y=G, b=H*.42, s2=w*.78, h2=H*.28, s3=w*.6, h3=H*.13, top=G-H;
    R(cx-w/2,y-b,w,b); y-=b; R(cx-w/2-1.6,y-2,w+3.2,2); y-=2; R(cx-s2/2,y-h2,s2,h2); y-=h2; R(cx-s2/2-1.4,y-2,s2+2.8,2); y-=2; R(cx-s3/2,y-h3,s3,h3); y-=h3; R(cx-s3/2-1,y-1.5,s3+2,1.5); y-=1.5;
    d+="M"+(cx-s3/2).toFixed(1)+" "+y.toFixed(1)+"L"+cx.toFixed(1)+" "+(top+3).toFixed(1)+"L"+(cx+s3/2).toFixed(1)+" "+y.toFixed(1)+"z"; R(cx-.5,top,1,3.5); };
  var dome=function(cx,by,r,dh,pt){ R(cx-r,by-dh,2*r,dh); var yb=by-dh; d+="M"+(cx-r)+" "+yb+"Q"+(cx-r)+" "+(yb-r*1.25)+" "+cx+" "+(yb-r*(pt||1.45))+"Q"+(cx+r)+" "+(yb-r*1.25)+" "+(cx+r)+" "+yb+"z"; var tp=yb-r*(pt||1.45); R(cx-.6,tp-6,1.2,6); };
  var roof=G-13; R(8,roof,396,13);                                                   // the long prayer hall
  for(var x=26;x<=388;x+=14){ if(Math.abs(x-276)<24 || Math.abs(x-212)<16) continue; dome(x,roof,3.6,1.5,1.25); }   // the row of small roof domes
  dome(276,roof,17,11,1.55);                                                         // the Green Dome
  dome(212,roof,11,6,1.4);                                                           // the silver dome beside it
  R(250,roof-6,10,6); R(292,roof-6,10,6);                                            // the low walls around the dome
  [[14,44,6],[60,92,9],[136,60,7],[166,60,7],[242,66,7],[338,98,9],[398,48,6]].forEach(function(m){ mina(m[0],m[1],m[2]); });
  return d; }
function kacaSky(k){ var el=document.getElementById("kacaSky");
  if(!el){ el=document.createElement("div"); el.id="kacaSky"; el.setAttribute("aria-hidden","true");
    var st=""; for(var i=0;i<70;i++){ var x=(i*137.5)%412, y=(i*61.3)%520, r=i%7===0?1.3:.7; st+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+r+'"/>'; }
    el.innerHTML='<svg viewBox="0 0 412 915" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="ksG" x1="0" y1="0" x2="0" y2="1"><stop class="ks1" offset="0"/><stop class="ks2" offset=".42"/><stop class="ks3" offset=".78"/><stop class="ks4" offset="1"/></linearGradient>'+
      '<radialGradient id="ksH"><stop offset="0" class="ksl" stop-opacity=".55"/><stop offset="1" class="ksl" stop-opacity="0"/></radialGradient></defs>'+
      '<rect width="412" height="915" fill="url(#ksG)"/><g class="ksStars">'+st+'</g><g class="ksSun"><circle class="ksHalo" r="138" fill="url(#ksH)"/><circle class="ksDisc" r="46"/><circle class="ksBite" r="10" cx="5" cy="-4"/></g>'+
      '</svg><div class="ksMqW"><svg class="ksMq" viewBox="0 0 412 118" preserveAspectRatio="xMidYMax meet"><path class="ksMasjid" d="'+nabawi()+'"/></svg></div><div class="ksGnd ksMasjid"></div>';
    document.body.insertBefore(el, document.body.firstChild); }
  var c=KACA_SKY[k]||KACA_SKY.zohor; ["ks1","ks2","ks3","ks4"].forEach(function(n,i){ el.style.setProperty("--"+n, c[i]); }); el.style.setProperty("--ksl", c[4]);
  var g=el.querySelector(".ksSun"); g.setAttribute("transform","translate("+c[5]+" "+c[6]+") scale("+(c[7]/46)+")"); el.classList.toggle("night", k==="isyak");
  try{ if(N.setBars && !(function(){ var po=document.getElementById("overlay"); return po && !po.classList.contains("hidden") && /(^|\s)theme-/.test(po.className); })()) N.setBars(c[0], false); }catch(e){} }
function applyWaktu(){ var de=document.documentElement, th=de.getAttribute("data-th"); if(!/^(waktu|kaca)$/.test(th||"")){ if(de.hasAttribute("data-wk")) de.removeAttribute("data-wk"); return; } var k=waktuKey(); if(de.getAttribute("data-wk")!==k) de.setAttribute("data-wk", k); if(th==="kaca") kacaSky(k); }
window.__kacaSky=kacaSky;   // tests
// low-RAM phones (native info.lowRam) get Kaca without blur
try{ if(JSON.parse(N.info()||"{}").lowRam) document.documentElement.classList.add("lowfx"); }catch(e){}
// 0.6.69 (owner): confirm / prompt boxes are drawn by the app in the current theme's colours (MainActivity.themedDialog)
function dialogTheme(){ if(!(window.Native && N.dialogTheme)) return; setTimeout(function(){ try{ var cs=getComputedStyle(document.documentElement), v=function(k){ return (cs.getPropertyValue(k)||"").trim(); }, card=v("--card");
  if(!card || /rgba?\([^)]*,\s*0?\.\d+\)/.test(card)) card=getComputedStyle(document.body).backgroundColor||v("--bg"); if(/rgba\([^)]*,\s*0\)$/.test(card)||card==="transparent") card=v("--bg");
  N.dialogTheme(JSON.stringify({card:card, fg:v("--fg"), mut:v("--mut"), gold:v("--gold"), line:v("--line"), ongold:"#1a1405", red:"#c0392b", lang:S.lang==="en"?"en":"ms"})); }catch(e){} }, 60); }
function applyTheme(){ dialogTheme(); var want=nightNow()?"night":S.appTheme; themeNow=want; var th=APP_THEMES.filter(function(t){return t[0]===want;})[0]||APP_THEMES.filter(function(t){return t[0]==="kaca";})[0]; document.documentElement.setAttribute("data-th", th[0]); try{ if(N.setBars && !(function(){ var po=document.getElementById("overlay"); return po && !po.classList.contains("hidden") && /(^|\s)theme-/.test(po.className); })()) N.setBars(th[5], th[6]); }catch(e){} applyWaktu(); }
function saveS(){ save("ihsan_settings", S); pushSchedule(); }
document.documentElement.style.setProperty('--arsize', S.arSize+'px');

// ---------- i18n ----------
var L = {
 home:["Solat","Solat"], sunat:["Amalan","Practice"], doa:["Doa","Doa"], apptheme:["Tema aplikasi","App theme"], qibla:["Kiblat","Qibla"], rakaat:["Rakaat","Rakaat"], zikir:["Zikir","Zikir"], cal:["Masa","Time"], more:["Tetapan","Settings"],
 next:["Solat seterusnya","Next prayer"], in_:["lagi","in"], today:["Waktu solat hari ini","Today's prayer times"],
 imsak:["Imsak","Imsak"], dhuha:["Dhuha","Dhuha"], subuh:["Subuh","Subuh"], syuruk:["Syuruk","Sunrise"], zohor:["Zohor","Zohor"], jumaat:["Jumaat","Jumu'ah"], asar:["Asar","Asar"], maghrib:["Maghrib","Maghrib"], isyak:["Isyak","Isyak"],
 jakim:["Sumber: JAKIM e-Solat","Source: JAKIM e-Solat"], est:["Anggaran (luar talian) - menunggu data JAKIM","Estimate (offline) - waiting for JAKIM data"],
 refresh:["Kemas kini","Refresh"], zone:["Zon","Zone"], tasbih:["Tasbih","Tasbih"], after:["Selepas Solat","After Solat"], mathurat:["Al-Ma'thurat","Al-Ma'thurat"], daily:["Doa Harian","Daily Doa"],
 pagi:["Pagi","Morning"], petang:["Petang","Evening"], start:["Mula","Start"], done:["Selesai","Done"], undo:["Undur","Undo"], reset:["Set semula","Reset"],
 why:["Mengapa dibaca","Why we read it"], source:["Sumber","Source"], times:["kali","times"],
 settings:["Tetapan","Settings"], lang:["Bahasa","Language"], masjid:["Masjid berdekatan","Nearby masjid"], surau:["Surau berdekatan","Nearby surau"],
 finder:["Cari masjid & surau (Google Maps)","Find masjid & surau (Google Maps)"], log:["Rekod solat","Prayer log"], qada:["Solat qada'","Qada' prayers"],
 notifs:["Notifikasi","Notifications"], countdownN:["Notifikasi kiraan detik & bar","Countdown & progress notification"], pre:["Peringatan awal","Early reminder"],
 test:["Uji notifikasi","Test notification"], exact:["Benarkan penggera tepat","Allow exact alarms"], detect:["Kesan zon automatik (GPS)","Auto-detect zone (GPS)"],
 state:["Negeri (cuti)","State (holidays)"], hoff:["Pelarasan tarikh Hijri","Hijri date adjustment"], arsize:["Saiz tulisan Arab","Arabic text size"],
 camera:["Kamera (sujud)","Camera (sujud)"], tap:["Ketik skrin","Tap screen"], theme:["Tema sejadah","Sejadah theme"],
 tblack:["Hitam","Black"], tgreen:["Hijau & Putih","Green & White"], tgold:["Hitam & Emas","Black & Gold"],
 calib:["Kalibrasi sujud","Sujud calibration"], ph:["Cuti umum","Public holiday"], sc:["Cuti sekolah","School holiday"], is:["Hari Islam","Islamic day"],
 allst:["Semua negeri","All states"], about:["Tentang & penafian","About & disclaimer"], utama:["Utama","Home"], solat:["Solat","Solat"], learn:["Ilmu","Learn"], kids:["Mod kanak-kanak","Kids mode"], halal:["Halal","Halal"], asma:["Asmaul Husna","Asmaul Husna"]
};
function T(k){ var u=S.ulang||S.lang; if(u==="ar"){ var va=L[k]; return arTx(va?va[1]:k); } if(UTXT[u]){ var i=UKEYS.indexOf(k); if(i>=0) return UTXT[u][i]; } var v=L[k]; return v ? v[S.lang==="en"?1:0] : k; }
if(S.ulang!=="ms" && S.ulang!=="en" && S.ulang!=="id" && S.ulang!=="ar"){ S.ulang=S.lang==="en"?"en":"ms"; }
if(S.ulang==="ar") S.lang="en";
/* 0.6.3 Arabic (Phase 1): every English UI string is looked up in window.AR_TX (lang/ar.js, loaded only for Arabic); leading and trailing
   spaces and punctuation are kept; anything not translated yet stays English. Right to left via html[dir=rtl]. S.arNum: Arabic-Indic digits. */
function arTx(en){ var A=window.AR_TX; if(!A || en==null) return en; var s=String(en); if(A[s]!=null) return A[s];
  var m=/^(\s*)([\s\S]*?)([\s:·.,…!?]*)$/.exec(s); if(m && A[m[2]]!=null) return m[1]+A[m[2]]+m[3].replace(/\?/g,"؟").replace(/,/g,"،"); return s; }
function arApply(){ var ar=S.ulang==="ar", h=document.documentElement; h.setAttribute("dir", ar?"rtl":"ltr"); h.setAttribute("lang", ar?"ar":(S.lang==="en"?"en":"ms")); document.body && document.body.classList.toggle("arUI", ar); ULOC.ar=S.arNum?"ar-SA":"ar-SA-u-nu-latn"; if(window.ArLang) ArLang.set(ar);
  /* 0.6.6: Hijri month names in Arabic while the app is in Arabic */
  if(!window.HM_ORIG) window.HM_ORIG=HIJRI_MONTHS.slice(); var HM_AR=["محرم","صفر","ربيع الأول","ربيع الآخر","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
  for(var hm=0; hm<12; hm++) HIJRI_MONTHS[hm]=ar?HM_AR[hm]:HM_ORIG[hm]; document.body && document.body.classList.toggle("arMean", !!S.arMean); }
function arLoad(cb){ if(S.ulang!=="ar"){ arApply(); cb&&cb(); return; } if(window.AR_TX){ arApply(); cb&&cb(); return; } var sc=document.createElement("script"); sc.src="lang/ar.js"; sc.onload=sc.onerror=function(){ arApply(); cb&&cb(); }; document.head.appendChild(sc); }
function setULang(v){ S.ulang=v; S.lang=(v==="en"||v==="ar")?"en":"ms"; hdrLastDay=null; saveS(); if(window.IdLang) IdLang.set(v==="id"); }
function locTag(){ return ULOC[S.ulang||S.lang]||"en-GB"; }
function tr(o){ return S.lang==="en" ? (o.en||o.ms) : (o.ms||o.en); }
// 0.5.27: every hadith source opens online. Collections on sunnah.com link straight to the hadith; others (Ibn Hibban, al-Hakim,
// as-Sunan al-Kubra, Muwatta) open a web search for that exact reference. Quran references (Al-Quran 2:255, Al-Baqarah 2:255) open in the app.
var SRC_MAP=[[/Sahih al-Bukhari (\d+)/g,"bukhari"],[/Sahih Muslim (\d+)/g,"muslim"],[/Sunan Abi Dawud (\d+)/g,"abudawud"],[/Jami' at-Tirmidhi (\d+)/g,"tirmidhi"],[/Sunan at-Tirmi(?:dh|z)i (\d+)/g,"tirmidhi"],
  [/Sunan an-Nasa'i (\d+)/g,"nasai"],[/Sunan Ibn Majah (\d+)/g,"ibnmajah"],[/Musnad Ahmad (\d+)/g,"ahmad"],[/Riyad as-Salihin (\d+)/g,"riyadussalihin"],[/al-Adab al-Mufrad (\d+)/gi,"adab"],
  [/(?:40 Hadis Nawawi|Nawawi 40|Arba'in an-Nawawi|Al-Arba'in an-Nawawiyyah, no\.) (\d+)/g,"nawawi40"],[/Sunan ad-Darimi (\d+)/g,"darimi"],[/Bulugh al-Maram (\d+)/g,"bulugh"],[/Mishkat al-Masabih (\d+)/g,"mishkat"]];
var SRC_SEARCH=/Ibn Hibban|Ibn Khuzaymah|al-Hakim|Mustadrak|as-Sunan al-Kubra|Muwatta|Bayhaqi|Tabarani|Ibn Abi Shaybah|Ibn Sa'd|Ibn as-Sunni|al-Isabah|Ar-Raheeq/i;
function srcMarks(h){ var en=S.lang==="en"; return h.replace(/ \[weak\]/g,' <b class="weak">'+(en?"(weak)":"(dhaif)")+'</b>').replace(/ \[disputed\]/g,' <b class="weak">'+(en?"(grading disputed)":"(darjat diperselisihkan)")+'</b>'); }
function srcHtml(src){
  var h=esc(src);
  h=h.replace(/(Al-Quran|(?:Al-|An-|At-|Ali )?[A-Z][A-Za-z']+(?:-[A-Za-z']+)?) (\d{1,3})(?::(\d{1,3})(?:-(\d+))?)?/g, function(all,nm,su,a){ if(nm!=="Al-Quran" && !a) return all; if(+su<1 || +su>114) return all; return '<a class="qref" data-qref="'+su+':'+(a||1)+'">📖 '+all+'</a>'; });
  if(S.srcLinks===false) return srcMarks(h);
  SRC_MAP.forEach(function(m){ h=h.replace(m[0], function(all,n){ return '<a class="hlink" href="https://sunnah.com/'+m[1]+':'+n+'">'+all+' ↗</a>'; }); });
  // books not on sunnah.com: each such part (between ;) opens a web search for that exact reference, without the grading in brackets
  h=h.split(/(;\s*)/).map(function(seg){ if(seg.indexOf("<a")>=0 || !SRC_SEARCH.test(seg)) return seg; var m=seg.match(/^(.*?)(\s*\([^)]*\))?$/), body=m[1], tail=m[2]||"";
    return '<a class="hlink" href="https://www.google.com/search?q='+encodeURIComponent(body.replace(/&amp;/g,"&").replace(/&quot;/g,'"'))+'">'+body+' ↗</a>'+tail; }).join("");
  return srcMarks(h);
}
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
function toast(msg){ var t=document.getElementById("toast"); t.textContent=msg; t.classList.remove("hidden"); clearTimeout(toast._t); toast._t=setTimeout(function(){t.classList.add("hidden")},2600); }
window.toast = toast;

// ---------- dates ----------
var PR = ["subuh","zohor","asar","maghrib","isyak"];
var ALL = ["imsak","subuh","syuruk","zohor","asar","maghrib","isyak"];
function pad(n){ return (n<10?"0":"")+n; }
function ymd(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function parseYmd(s){ var p=s.split("-"); return new Date(+p[0], +p[1]-1, +p[2]); }
function addDays(d,n){ var x=new Date(d.getTime()); x.setDate(x.getDate()+n); return x; }
function at(dateStr, hm){ var p=hm.split(":"); var d=parseYmd(dateStr); d.setHours(+p[0], +p[1], 0, 0); return d; }
function fmt12(hm){ if(!hm) return "--"; var p=hm.split(":"), h=+p[0], m=p[1]; var ap=h>=12?"PM":"AM"; h=h%12; if(h===0)h=12; return h+":"+m+" "+ap; }
var MON = {jan:0,feb:1,mar:2,apr:3,may:4,mei:4,jun:5,jul:6,aug:7,ogo:7,sep:8,oct:9,okt:9,nov:10,dec:11,dis:11};
function parseJakimDate(s){
  if(!s) return null; var m;
  if((m=/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(s))) return new Date(+m[3], MON[m[2].toLowerCase()], +m[1]);
  if((m=/^(\d{4})-(\d{2})-(\d{2})/.exec(s))) return new Date(+m[1], +m[2]-1, +m[3]);
  if((m=/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/.exec(s))) return new Date(+m[3], +m[2]-1, +m[1]);
  return null;
}
function hm(s){ if(!s) return null; var m=/(\d{1,2}):(\d{2})/.exec(s); return m ? pad(+m[1])+":"+m[2] : null; }

// ---------- prayer time calculation (offline estimate, JAKIM-like parameters) ----------
var D2R=Math.PI/180;
function fixA(a){ a=a-360*Math.floor(a/360); return a<0?a+360:a; }
function fixH(a){ a=a-24*Math.floor(a/24); return a<0?a+24:a; }
function julian(y,m,d){ if(m<=2){y--;m+=12;} var A=Math.floor(y/100), B=2-A+Math.floor(A/4); return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5; }
function sunPos(jd){ var D=jd-2451545, g=fixA(357.529+0.98560028*D), q=fixA(280.459+0.98564736*D), Lm=fixA(q+1.915*Math.sin(g*D2R)+0.020*Math.sin(2*g*D2R)), e=23.439-0.00000036*D;
  var RA=Math.atan2(Math.cos(e*D2R)*Math.sin(Lm*D2R), Math.cos(Lm*D2R))/D2R/15; return {decl:Math.asin(Math.sin(e*D2R)*Math.sin(Lm*D2R))/D2R, eqt:q/15-fixH(RA)}; }
function calcDay(date, lat, lon, o){
  o=o||{fa:20,ia:18,tz:8,ik:2};
  var tz=o.tz, jd=julian(date.getFullYear(), date.getMonth()+1, date.getDate())-lon/(15*24);
  function mid(t){ return fixH(12-sunPos(jd+t).eqt); }
  function angT(ang,t,ccw){ var s=sunPos(jd+t), n=mid(t); var v=(-Math.sin(ang*D2R)-Math.sin(s.decl*D2R)*Math.sin(lat*D2R))/(Math.cos(s.decl*D2R)*Math.cos(lat*D2R)); var T2=Math.acos(Math.max(-1,Math.min(1,v)))/D2R/15; return n+(ccw?-T2:T2); }
  function asrT(t){ var s=sunPos(jd+t); var ang=-Math.atan(1/(1+Math.tan(Math.abs(lat-s.decl)*D2R)))/D2R; return angT(ang,t,false); }
  var t={f:5/24,s:6/24,d:12/24,a:13/24,m:18/24,i:18/24}, r;
  for(var it=0;it<2;it++){ r={f:angT(o.fa,t.f,true), s:angT(0.833,t.s,true), d:mid(t.d), a:asrT(t.a), m:angT(0.833,t.m,false), i:o.im?0:angT(o.ia,t.i,false)}; if(o.im) r.i=r.m+o.im/60; t={f:r.f/24,s:r.s/24,d:r.d/24,a:r.a/24,m:r.m/24,i:r.i/24}; }
  // 0.5.23: high-latitude methods (Athan-style). Where the sun never gets low enough for Subuh or Isyak (summer far from the
  // equator), each is held within a share of the night: middle of the night, one seventh, or the angle-based share (angle/60).
  var hl=o.hl||"none", night=24-(r.m-r.s); if(night<=0 || !isFinite(night)) night=24;
  if(hl!=="none" && Math.abs(lat)>=45){ var part=function(ang){ return hl==="mid"?night/2:hl==="seventh"?night/7:night*ang/60; };
    var fMax=part(o.fa); if(!isFinite(r.f) || (r.s-r.f)>fMax || r.f>r.s) r.f=r.s-fMax;
    if(!o.im){ var iMax=part(o.ia); if(!isFinite(r.i) || (r.i-r.m)>iMax || r.i<r.m) r.i=r.m+iMax; } }
  function out(h, add){ h=h+tz-lon/15+add/60; var mm=Math.ceil(h*60); mm=((mm%1440)+1440)%1440; return pad(Math.floor(mm/60))+":"+pad(mm%60); }
  var ik=o.ik, sub=out(r.f,ik);
  var im=adjTime(sub,-10);
  return {imsak:im, subuh:sub, syuruk:out(r.s,-ik), zohor:out(r.d,ik), asar:out(r.a,ik), maghrib:out(r.m,ik), isyak:out(r.i,ik), src:"calc"};
}
function zoneById(id){ for(var i=0;i<ZONES.length;i++) if(ZONES[i][0]===id) return ZONES[i]; return ZONES[ZONES.length-2]; }
function zonePoint(){ if(S.lat!=null) return [S.lat,S.lon]; return zoneById(S.zone)[3][0]; }
function nearestZone(lat, lon){
  var best=null, bd=1e9;
  ZONES.forEach(function(z){ if(z[4]) return; z[3].forEach(function(p){ var d=Math.pow(p[0]-lat,2)+Math.pow((p[1]-lon)*Math.cos(lat*D2R),2); if(d<bd){bd=d;best=z;} }); });
  return best;
}

// ---------- JAKIM data ----------
function cacheKey(zone, y){ return "pt_"+zone+"_"+y; }
var METHODS={MWL:[18,17,0,"Muslim World League"],UQ:[18.5,0,90,"Umm al-Qura (Makkah)"],EG:[19.5,17.5,0,"Egypt"],ISNA:[15,15,0,"ISNA (N. America)"],MUIS:[20,18,0,"MUIS / JAKIM angles"],
  AE:[18.2,18.2,0,"UAE (Awqaf)"],QA:[18,0,90,"Qatar / Bahrain"],KW:[18,17.5,0,"Kuwait"],TR:[18,17,0,"Turkey (Diyanet)"],MA:[19,17,0,"Morocco"],DZ:[18,17,0,"Algeria"],TN:[18,18,0,"Tunisia"],JO:[18,18,0,"Jordan"]};
/* 0.6.3 Phase 2: the country from GPS (rough boxes, enough to pick defaults) → the prayer-time method used there and the local currency.
   The method follows the country until the person picks one by hand (S.calcMethodSet). */
var CTRY=[["SG",1.15,1.48,103.6,104.1],["QA",24.4,26.2,50.7,51.7],["BH",25.5,26.4,50.3,50.8],["AE",22.6,26.1,51.5,56.4],["KW",28.5,30.1,46.5,48.5],["OM",16.6,26.4,52,59.9],["YE",12,19,42,54],
  ["LB",33,34.7,35.1,36.6],["PS",31.2,32.6,34.2,35.6],["JO",29.2,33.4,34.9,39.3],["SY",32.3,37.3,35.7,42.4],["IQ",29,37.4,38.8,48.6],["EG",22,31.7,24.7,34.9],["SA",16,32.2,34.5,55.7],["TR",36,42.1,26,44.8],
  ["TN",30.2,37.5,7.5,11.6],["MA",27.6,35.9,-13.2,-1],["DZ",19,37.1,-8.7,12],["LY",19.5,33.2,9.4,25.2],["SD",8.7,22.2,21.8,38.6],["US",24,72,-170,-52],["ID",-11,6,95,141]];
var CTRY_M={SA:"UQ",YE:"UQ",AE:"AE",QA:"QA",BH:"QA",KW:"KW",OM:"MWL",EG:"EG",SD:"EG",LY:"EG",SY:"EG",LB:"EG",PS:"EG",JO:"JO",IQ:"EG",TR:"TR",MA:"MA",DZ:"DZ",TN:"TN",US:"ISNA",SG:"MUIS",ID:"MUIS"};
var CTRY_C={SA:"SAR",AE:"AED",QA:"QAR",KW:"KWD",BH:"BHD",OM:"OMR",JO:"JOD",EG:"EGP",IQ:"IQD",MA:"MAD",DZ:"DZD",TN:"TND",TR:"TRY",US:"USD",SG:"SGD",ID:"IDR",YE:"YER",SY:"SYP",LB:"LBP",LY:"LYD",SD:"SDG",PS:"ILS"};
function ctryOf(lat,lon){ if(lat==null||lon==null) return null; if(inMalaysia(lat,lon)) return "MY"; for(var i=0;i<CTRY.length;i++){ var c=CTRY[i]; if(lat>=c[1]&&lat<=c[2]&&lon>=c[3]&&lon<=c[4]) return c[0]; } return "XX"; }
function curNow(){ if(S.finCur) return S.finCur; if(S.ulang!=="ar") return "RM"; /* a Malaysian abroad (umrah, travel) keeps ringgit; only Arabic follows the country */ var c=ctryOf(S.lat,S.lon); return c && CTRY_C[c] ? CTRY_C[c] : (S.ulang==="ar" ? "SAR" : "RM"); }
function methName(k){ var n=(METHODS[k]||METHODS.MWL)[3]; return S.ulang==="ar"?arTx(n):n; }
function methodAuto(){ if(S.calcMethodSet) return; var c=ctryOf(S.lat,S.lon); var m=(c && CTRY_M[c]) || "MWL"; if(m!==S.calcMethod){ S.calcMethod=m; } }
function overseasNow(){ return S.locMode==="overseas" || (S.locMode==="auto" && S.overseas && S.lat!=null); }
function inMalaysia(lat,lon){
  var box=(lat>=1.15&&lat<=6.75&&lon>=99.5&&lon<=104.7)||(lat>=0.8&&lat<=7.6&&lon>=109.4&&lon<=119.6);
  if(!box) return false;
  var bd=1e9; ZONES.forEach(function(z){ if(z[4]) return; z[3].forEach(function(p){ var d=Math.pow(p[0]-lat,2)+Math.pow((p[1]-lon)*Math.cos(lat*D2R),2); if(d<bd) bd=d; }); });
  return bd<1.0;
}
function adjTime(hm0, m){ if(!hm0||!m) return hm0; var p=hm0.split(":"), t=(+p[0])*60+(+p[1])+m; t=(t+1440)%1440; return pad(Math.floor(t/60))+":"+pad(t%60); }
function getDay0(date){
  if(overseasNow()){ var M=METHODS[S.calcMethod]||METHODS.MWL, tz=-new Date(date.getFullYear(),date.getMonth(),date.getDate(),12).getTimezoneOffset()/60;
    var r=calcDay(date, S.lat, S.lon, {fa:M[0], ia:M[1], im:M[2], tz:tz, ik:1, hl:S.hlm||"angle"}); r.src="abroad"; return r; }
  var ds=ymd(date), c=load(cacheKey(S.zone, date.getFullYear()), null);
  if(c && c.days && c.days[ds]) { var o=c.days[ds]; o.src="jakim"; return o; }
  var p=zonePoint(); return calcDay(date, p[0], p[1]);
}
function getDay(date){
  var o=getDay0(date), a=S.adj||{}, r={};
  for(var k in o) r[k]=o[k];
  PR.forEach(function(k){ if(a[k]) r[k]=adjTime(o[k], a[k]); });
  if(a.subuh && o.imsak) r.imsak=adjTime(o.imsak, a.subuh);
  return r;
}
var fetching={};
function fetchJakim(zone, year, cb){
  var id=zone+"_"+year; if(fetching[id]) return; fetching[id]=true;
  var url="https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat&period=year&zone="+zone;
  var h=function(res){
    if(res.id!==id) return; off("fetch", h); fetching[id]=false;
    var ok=false;
    try{
      var j=JSON.parse(res.body), arr=j.prayerTime||j.prayertime||[];
      var days={};
      arr.forEach(function(r){ var d=parseJakimDate(r.date); if(!d) return;
        days[ymd(d)]={imsak:hm(r.imsak), subuh:hm(r.fajr||r.subuh), syuruk:hm(r.syuruk), zohor:hm(r.dhuhr||r.zohor), asar:hm(r.asr||r.asar), maghrib:hm(r.maghrib), isyak:hm(r.isha||r.isyak), hijri:r.hijri||null}; });
      if(Object.keys(days).length>20){ save(cacheKey(zone,year), {fetched:Date.now(), days:days}); ok=true; }
    }catch(e){}
    cb && cb(ok, res);
  };
  on("fetch", h); N.fetchUrl(id, url);
}
function ensureData(force){
  var y=new Date().getFullYear(), c=load(cacheKey(S.zone,y), null);
  var stale = !c || (Date.now()-c.fetched > 7*864e5);
  if(force || stale) fetchJakim(S.zone, y, function(ok){ if(ok){ pushSchedule(); render(); if(force) toast(S.lang==="en"?"JAKIM times updated":"Waktu JAKIM dikemas kini"); } else if(force) toast(S.lang==="en"?"Could not reach JAKIM. Using estimate.":"Tidak dapat capai JAKIM. Guna anggaran."); });
  var now=new Date(); if(now.getMonth()>=10 && !load(cacheKey(S.zone,y+1),null)) fetchJakim(S.zone, y+1, function(ok){ if(ok) pushSchedule(); });
}

// ---------- schedule for native notifications ----------
function upcoming(days){
  var out=[], now=new Date();
  for(var i=-1;i<days;i++){ var d=addDays(now,i), t=getDay(d), ds=ymd(d);
    PR.forEach(function(k){ var kk=(k==="zohor"&&d.getDay()===5)?"jumaat":k; if(t[k]) out.push({t:at(ds,t[k]).getTime(), k:k, n:L[kk][0], ne:S.ulang==="ar"?arTx(L[kk][1]):L[kk][1]}); }); }
  out.sort(function(a,b){return a.t-b.t}); return out;
}
function pushSchedule(){
  try{ N.setSchedule(JSON.stringify(upcoming(10)), JSON.stringify({lang:S.lang, ulang:S.ulang||S.lang, zone:zoneShort(), countdown:S.countdown, preMin:S.preMin, notif:S.notif, rnum:S.rnum, rdir:S.rdir, vib:S.vib, sujud:S.sujud,
    quietPray:S.quietPray, alertStyle:S.alertStyle, lockShow:S.lockShow, pauseUntil:(S.pauseMode==="haid"?S.pauseUntil:0)})); }catch(e){}
  try{ if(N.setExtras) N.setExtras(JSON.stringify(buildExtras())); }catch(e){ console.error(e); }
}
function zoneShort(){ if(overseasNow()) return S.lang==="en"?"Overseas":"Luar negara"; var z=zoneById(S.zone); return z[2].split(",")[0]; }
function nextPrev(){
  var u=upcoming(3), now=Date.now(), prev=null, next=null;
  for(var i=0;i<u.length;i++){ if(u[i].t<=now) prev=u[i]; else { next=u[i]; break; } }
  return {prev:prev, next:next};
}
function currentPrayer(){ var np=nextPrev(); return np.prev ? np.prev.k : "isyak"; }
// 0.9.1: from syuruk until Zohor the current time is Dhuha, not Subuh
function inDhuha(){ try{ var d=new Date(), t=getDay(d), now=d.getTime(); return now>=at(ymd(d),t.syuruk).getTime() && now<at(ymd(d),t.zohor).getTime(); }catch(e){ return false; } }
function curWaktu(){ return inDhuha()?"dhuha":currentPrayer(); }
// One cell of the five-prayer row: Subuh's cell turns into Dhuha (from syuruk) once the sun is up
// Dhuha prayer may start about 15 minutes after syuruk (same figure as the forbidden-times card in Amal)
function dhuhaHM(t){ return adjTime(t.syuruk, 15); }
function prCell(k, t){ if(k==="subuh" && inDhuha()) return {k:"dhuha", hm:dhuhaHM(t), cur:true}; return {k:k, hm:t[k], cur:false}; }

// ---------- hijri ----------
var hijriFmt=null; try{ hijriFmt=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn",{day:"numeric",month:"numeric",year:"numeric"}); }catch(e){}
var hjMemo={};
function hijriOf(date){
  var mk=ymd(date)+"|"+S.zone+"|"+(S.hijriOffset||0); if(hjMemo[mk]!==undefined) return hjMemo[mk];
  return (hjMemo[mk]=hijriOf0(date));
}
function hijriOf0(date){
  var c=load(cacheKey(S.zone, date.getFullYear()), null), ds=ymd(date);
  if(c && c.days && c.days[ds] && c.days[ds].hijri){ var p=c.days[ds].hijri.split("-"); if(p.length===3) return {y:+p[0], m:+p[1], d:+p[2], src:"jakim"}; }
  if(!hijriFmt) return null;
  var parts=hijriFmt.formatToParts(addDays(date, S.hijriOffset||0)), o={src:"est"};
  parts.forEach(function(x){ if(x.type==="day") o.d=+x.value; if(x.type==="month") o.m=+x.value; if(x.type==="year") o.y=parseInt(x.value,10); });
  return o;
}
function hijriStr(h){ return h ? h.d+" "+HIJRI_MONTHS[h.m-1]+" "+h.y+(S.ulang==="ar"?" هـ":"H") : ""; }

// ---------- holidays ----------
function groupOf(st){ return GROUP_A.indexOf(st)>=0 ? "A" : "B"; }
var islHolDone={};
function addIslamicHolidays(y){
  if(islHolDone[y]) return; islHolDone[y]=1;
  var L=[[1,1,"Awal Muharram","Awal Muharram (Islamic New Year)"],[3,12,"Maulidur Rasul","Prophet's Birthday"],[10,1,"Hari Raya Aidilfitri","Hari Raya Aidilfitri"],[10,2,"Hari Raya Aidilfitri (Hari Kedua)","Hari Raya Aidilfitri (2nd day)"],[12,10,"Hari Raya Aidiladha","Hari Raya Aidiladha"]];
  for(var d=new Date(y,0,1); d.getFullYear()===y; d=addDays(d,1)){
    var h=hijriOf(d); if(!h) continue;
    L.forEach(function(x){ if(h.m===x[0] && h.d===x[1]){ HOLIDAYS.push([ymd(d), x[2]+" (anggaran)", x[3]+" (estimate)", "ALL"]); } });
  }
}
function miniYear(y){
  var est=!HOLIDAYS.some(function(h){ return h[0].slice(0,4)===String(y) && /Aidilfitri/.test(h[1]) && !/anggaran/.test(h[1]); });
  if(est) addIslamicHolidays(y);
  var M=S.lang==="en"?ME:MS, wd=S.lang==="en"?["M","T","W","T","F","S","S"]:["I","S","R","K","J","S","A"], h='<div class="card"><h3>'+(S.lang==="en"?"Calendar ":"Kalendar ")+y+'</h3><div class="legend"><span><i class="ph"></i>'+T("ph")+'</span><span><i class="is"></i>'+T("is")+'</span></div><div class="minis">';
  for(var m=0;m<12;m++){
    var first=new Date(y,m,1), dim=new Date(y,m+1,0).getDate();
    h+='<div class="mini" data-mm="'+m+'" data-my="'+y+'"><div class="mn">'+M[m]+'</div><div class="mg">'+wd.map(function(x){return '<b>'+x+'</b>';}).join("");
    for(var i=0;i<(first.getDay()+6)%7;i++) h+='<span></span>';
    for(var d=1;d<=dim;d++){ var dt=new Date(y,m,d), ds=ymd(dt), ph=holidaysOn(ds,false), is=islamicOn(dt);
      h+='<span class="'+(ph.length?"r":"")+(dt.getDay()===5?" f":"")+(ds<ymd(new Date())?" p":"")+'"><i>'+(ph.length?'<em class="ph"></em>':'')+(is.length?'<em class="is"></em>':'')+'</i>'+d+'</span>'; }
    h+='</div></div>';
  }
  return h+'</div>'+(est?'<div class="mut small" style="margin-top:6px">'+(S.lang==="en"?"Islamic and lunar dates for "+y+" are estimates until the official announcement. School holidays will be added when KPM publishes the "+y+" calendar.":"Tarikh Islam dan bulan qamari bagi "+y+" adalah anggaran sehingga pengumuman rasmi. Cuti sekolah akan ditambah apabila KPM menerbitkan kalendar "+y+".")+'</div>':'')+'</div>';
}
function holidaysOn(ds, allStates){
  var res=[];
  HOLIDAYS.forEach(function(h){ if(h[0]!==ds) return; var s=h[3], applies, where="";
    if(s==="ALL"){ applies=true; where=S.lang==="en"?"National":"Kebangsaan"; }
    else if(s.except){ applies=s.except.indexOf(S.state)<0; where=(S.lang==="en"?"All except ":"Semua kecuali ")+s.except.join(", "); }
    else { applies=s.indexOf(S.state)>=0; where=s.join(", "); }
    if(applies||allStates) res.push({ms:h[1], en:h[2], where:where, mine:applies}); });
  return res;
}
// 0.6.52 Business › Bookings: holiday prices use the app's own calendars (the person's state)
window.ihsanHol=function(ds){ return {ph:holidaysOn(ds).filter(function(x){ return x.mine; }), sc:schoolOn(ds).filter(function(x){ return x.mine; })}; };
function schoolOn(ds, allStates){
  var res=[], g=groupOf(S.state);
  SCHOOL.forEach(function(s){ if(ds<s[0]||ds>s[1]) return;
    var mine = s[4]===g || (s[4]==="B-SWK" && g==="B" && S.state!=="SWK") || (s[4]==="SWK" && S.state==="SWK");
    if(mine||allStates) res.push({ms:s[2], en:s[3], where:s[4]==="A"?"Kumpulan A":(s[4]==="SWK"?"Sarawak":(s[4]==="B-SWK"?"Kumpulan B (kecuali Sarawak)":"Kumpulan B")), mine:mine}); });
  return res;
}
function islamicOn(date){
  var h=hijriOf(date), res=[]; if(!h) return res;
  ISLAMIC_DAYS.forEach(function(x){ if(x[0]===h.m && x[1]===h.d) res.push({ms:x[2], en:x[3]}); });
  return res;
}
function sunnahFastOn(date){
  var h=hijriOf(date), res=[], wd=date.getDay();
  if(h && h.m===9) return res;
  if(h && h.m===10 && h.d===1) return res;
  if(h && h.m===12 && h.d>=10 && h.d<=13) return res;
  if(wd===1) res.push({ms:"Puasa sunat Isnin",en:"Sunnah fast (Monday)"});
  if(wd===4) res.push({ms:"Puasa sunat Khamis",en:"Sunnah fast (Thursday)"});
  if(h && h.d>=13 && h.d<=15) res.push({ms:"Puasa sunat Ayyamul Bidh",en:"Sunnah fast (Ayyamul Bidh)"});
  return res;
}

// ---------- prayer log ----------
var LOG = load("ihsan_log", {});
function logGet(ds,k){ return (LOG[ds]||{})[k]; }
function logSet(ds,k,v){ LOG[ds]=LOG[ds]||{}; if(v) LOG[ds][k]=v; else delete LOG[ds][k]; save("ihsan_log", LOG); }
// ---------- 0.9.0 usage time + prayer sessions ----------
// USAGE[ymd] = {t: seconds the app was open that day, v: {view: seconds}}. Counted only while the app is on screen.
var USAGE = load("ihsan_usage", {}), uMark = Date.now(), uOn = !document.hidden;
function uView(){ var ov=document.getElementById("overlay"); if(ov && /theme-/.test(ov.className) && !ov.classList.contains("hidden")) return "rakaat"; return view==="learn"&&learnPg?("learn:"+learnPg):view; }
function usageFlush(){
  var now=Date.now(), a=uMark; uMark=now;
  if(!uOn) return;
  if(now-a>90000) a=now-15000; // timers were frozen (phone asleep): count only one tick
  var v=uView();
  while(a<now){ var d=new Date(a), nd=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime(), b=Math.min(now,nd), sec=(b-a)/1000, k=ymd(d);
    var u=USAGE[k]=USAGE[k]||{t:0,v:{}}; u.t+=sec; u.v[v]=(u.v[v]||0)+sec; a=b; }
  save("ihsan_usage", USAGE);
}
function usageOn(on_){ usageFlush(); uOn=on_; uMark=Date.now(); }
setInterval(usageFlush, 15000);
document.addEventListener("visibilitychange", function(){ usageOn(!document.hidden); });
function useSec(ds){ return USAGE[ds]?USAGE[ds].t:0; }
function durStr(sec, short){ sec=Math.round(sec||0); var h=Math.floor(sec/3600), m=Math.floor(sec%3600/60), s=sec%60;
  if(h) return h+(short?"j ":L2x(" jam "," h "))+m+(short?"m":L2x(" min"," min"));
  if(m) return m+(short?"m":L2x(" min"," min"))+(short||m>=10?"":" "+s+"s");
  return s+"s"; }
function durEn(sec){ sec=Math.round(sec||0); var h=Math.floor(sec/3600), m=Math.floor(sec%3600/60); return h?(h+(en_()?"h ":"j ")+m+"m"):(m?m+"m":sec+"s"); }
// PLOG: rakaat counter sessions [{d:ymd, s:solat key, n:name, w:waktu when started, t0:ms, sec, c:counted, tg:target}]
var PLOG = load("ihsan_prlog", []);
function plogAdd(r){ PLOG.push(r); if(PLOG.length>3000) PLOG=PLOG.slice(-3000); save("ihsan_prlog", PLOG); }
function plogDay(ds){ return PLOG.filter(function(r){ return r.d===ds; }); }
function plogSec(ds){ return plogDay(ds).reduce(function(a,r){ return a+r.sec; },0); }
// Which of the five daily prayers were counted on a day: {subuh:{sec,c,tg,t0}, ...}
function fardDay(ds){ var o={}; plogDay(ds).forEach(function(r){ var k=r.s==="jumaat"?"zohor":PR.indexOf(r.s)>=0?r.s:(r.q||null); if(!k) return; if(!o[k]||r.c>=r.tg) o[k]=r; }); return o; }
function prRegister(ds, small){
  var f=fardDay(ds);
  return '<div class="preg'+(small?' sm':'')+'">'+PR.map(function(k){ var r=f[k], ok=r&&r.c>=r.tg; return '<div class="pr'+(ok?' ok':r?' part':'')+'"><b>'+(k==="zohor"&&isFri(ds+"T12:00:00")?T("jumaat"):T(k))+'</b><span>'+(r?(ok?'✓ ':'')+durEn(r.sec):'–')+'</span>'+(r&&!small?'<small>'+hm12(r.t0)+'</small>':'')+'</div>'; }).join("")+'</div>';
}
var QADA = load("ihsan_qada", {subuh:0,zohor:0,asar:0,maghrib:0,isyak:0});

// ---------- views ----------
var view = load("ihsan_view", "home"), sub = {zikir:"tasbih", doa:"mathurat"}, timers=[];
if(view==="rakaat"||view==="qibla") view="solat";
if(view==="kids") view="home";
if(view==="halal"){ view="alat"; } if(view==="more") view="home";
if(view==="home" && launcherOn()) view="solat";
var NAV = [["home","🏠"],["solat","🕌"],["sunat","🌙"],["learn","📚"],["halal","🔍"],["cal","📅"],["more","⚙️"]];
var sunPage = load("ihsan_sunpage","zikir");
if(["zikir","doa","mathurat"].indexOf(view)>=0){ sunPage=view; view="sunat"; }
function clearTimers(){ timers.forEach(function(t){clearInterval(t)}); timers=[]; }
function go(v){ if(v==="iman"){ imanGo(S.imLast||"solat"); return; } if(S.kidLock){ if(S.lockTo==="school"){ v="learn"; SUB2.learn="sekolah"; learnPg=null; } else if(v!=="kids" && !(v==="learn" && learnFrom==="kids")) v="kids"; } if(S.appLock && !S.kidLock && v==="more"){ toast(L2x("Tetapan dikunci. Sapu 🔒 di atas 5 kali untuk buka.","Settings are locked. Swipe the 🔒 at the top 5 times to unlock.")); return; } if(["zikir","doa","mathurat","amal","wirid"].indexOf(v)>=0){ sunPage=v; save("ihsan_sunpage",v); v="sunat"; } if(view==="solat" && v!=="solat") N.stopCompass(); if(N.setVolumeKeys) N.setVolumeKeys(false); if(N.stopSpeak) try{N.stopSpeak();}catch(e){} view=v; save("ihsan_view", v); render(); document.getElementById("view").scrollTop=0; }
window.onBack = function(){
  if(window.IB3D && IB3D.exitFull()) return true;   // 0.5.69: Back leaves a full-screen 3D view first
  if(window.__ppBack){ window.__ppBack(); return true; }   // 0.7.73: Back closes the phone-pet overlay
  var ov=document.getElementById("overlay");
  if(!ov.classList.contains("hidden")){ if(ov._close) ov._close(); else closeOverlay(); return true; }
  if(view==="learn" && (learnPg==="radio"||learnPg==="podcast") && window.IbMedia && IbMedia.back()) return true;
  if(view==="learn" && ILMU_PG[learnPg] && window.IlmuView && IlmuView.back()) return true;
  if(view==="learn" && learnPg==="chess" && window.ChessView && ChessView.back && ChessView.back()) return true;   // 0.6.66 chess guide → setup
  if(view==="learn" && learnPg==="martial" && window.MartialView && MartialView.back()) return true;   // 0.7.42: Back closes the 3D lesson, then the art
  if(view==="learn" && learnPg){ learnBack(); return true; }
  if(view==="kids" && kidsSel){ kidsBack(); return true; }   // 0.7.56: Back from the Planet or Simple view returns to the two banners
  if(view==="learn" && basicsPg){ var fr0=basicsFrom; basicsPg=null; basicsFrom=null; if(fr0==="rakaat"){ SUB2.solat="rakaat"; go("solat"); } else { render(); document.getElementById("view").scrollTop=0; } return true; }   // 0.5.71: Back leaves Purification / Solat / Hajj guides
  if(S.kidLock) return true; // 0.31.0: Back does nothing while kids mode is locked (Home and Recents are blocked by screen pinning)
  if(view!=="home"){ go("home"); return true; }
  return false;
};
function closeOverlay(){ var ov=document.getElementById("overlay"), wasPray=/(^|\s)theme-/.test(ov.className); ov.classList.add("hidden"); ov.innerHTML=""; ov._close=null; ov.className="hidden"; if(wasPray){ try{ applyTheme(); }catch(e){} } }
function render(){
  clearTimers(); if(render._lang!==S.lang){ render._lang=S.lang; dialogTheme(); } hjMemo={}; SAY=[]; SHR=[]; var _sn=document.getElementById("subnav"); if(_sn && view!=="sunat") _sn.remove(); else if(_sn && _sn.parentNode && _sn.parentNode.id==="nav") document.getElementById("app").appendChild(_sn); document.getElementById("view").classList.remove("hasSub"); if(N.setVolumeKeys) N.setVolumeKeys(false);
  var nav=document.getElementById("nav");
  var appEl=document.getElementById("app"); appEl.classList.toggle("kidlock", !!S.kidLock); appEl.classList.toggle("kwFull", view==="kids" && kidsSel==="planet");   /* 0.7.53: the Kids Planet fills the screen, no bottom bars */ appEl.classList.toggle("senior", !!S.senior && !S.kidLock);
  nav.innerHTML = S.senior && !S.kidLock ? (view==="home"?'':'<button data-v="home" class="snHome">🏠 '+L2x("Kembali ke Utama","Back to Home")+'</button>') : NAV.map(function(n){ return '<button data-v="'+n[0]+'" class="'+(view===n[0]?"on":"")+'"><span class="ic">'+n[1]+'</span>'+T(n[0]==="home"?"utama":n[0])+'</button>'; }).join("");
  nav.querySelectorAll("button").forEach(function(b){ b.onclick=function(){ go(b.getAttribute("data-v")); }; });
  railApply();
  hdrTick();
  var el=document.getElementById("view");
  ({home:vHome, solat:vSolat, sunat:vSunatHub, zikir:vZikir, doa:vDoa, mathurat:vMathurat, cal:vCal, more:vMore, learn:vLearn, kids:vKids, halal:vHalal}[view]||vHome)(el);
  dockFix(); setTimeout(dockFix,60);
}
// 0.5.91 (owner): favourite tabs on Home only, as the second level just above the tab bar. They are the ★ favourites of the left bar
// (table of contents). With none, a single ＋ sits right above Home; ＋ opens the left bar to star something. Each star takes the ＋'s place
// and a new ＋ follows; up to 6 sit at tab width, from the 7th the whole row shrinks to fit, up to 10 (then no ＋).
// Tap a tab = the left bar's own action; long-press = remove (clears the ★ too).
var QT_MAX=10;
function qtOn(){ return view==="home" && !S.senior && !S.kidLock && !railOn(); }
function qtList(){ sideBuild(); return (SD.fav||[]).filter(function(id){ return sideLb[id]; }).slice(0, QT_MAX); }
function qtTxt(x){ return String(x==null?"":x).replace(/<[^>]+>/g,"").trim(); }
function qtabsDraw(nav){ var old=document.getElementById("qtBar"); if(old) old.remove(); if(!nav || !qtOn()) return; var l=qtList(), n=l.length, items=n+(n<QT_MAX?1:0);
  // 0.5.93 (owner): its own transparent row floating just above the tab row (the tab row itself stays as it is)
  var row=document.createElement("div"); row.id="qtBar"; row.className="qtRow"+(items>6?" qtTight":""); row.style.setProperty("--qtn", Math.max(6, items));
  row.innerHTML=l.map(function(id, i){ var lb=sideLb[id]||["⭐",""]; return '<button class="qtB" data-qt="'+i+'" title="'+esc(qtTxt(lb[1]))+'"><span class="ic">'+(lb[0]||"⭐")+'</span><span class="lb">'+esc(qtTxt(lb[1]))+'</span></button>'; }).join("")+
    (n<QT_MAX?'<button class="qtB qtAdd" id="qtAdd" aria-label="'+L2x("Tambah kegemaran dari menu kandungan","Add a favourite from the contents menu")+'"><span class="ic">＋</span></button>':'');
  document.getElementById("app").appendChild(row); row.style.bottom=navH()+"px";
  var add=row.querySelector("#qtAdd"); if(add) add.onclick=function(){ sideShow(true); toast("☆ "+L2x("Ketik bintang di sebelah mana-mana halaman untuk jadikan kegemaran","Tap the star beside any page to make it a favourite")); };
  row.querySelectorAll("[data-qt]").forEach(function(b){ var i=+b.getAttribute("data-qt"), pressed=0, lp=null;
    var start=function(){ pressed=0; lp=setTimeout(function(){ pressed=1; qtRemove(l[i]); }, 550); }, stop=function(){ clearTimeout(lp); };
    b.addEventListener("pointerdown", start); b.addEventListener("pointerup", stop); b.addEventListener("pointerleave", stop); b.addEventListener("pointercancel", stop);
    b.oncontextmenu=function(e){ e.preventDefault(); };
    b.onclick=function(){ if(pressed) return; var f=sideF[l[i]]; if(!f) return; if(navCur){ NAVH.push(navCur); if(NAVH.length>80) NAVH.shift(); } try{ f(); }catch(err){ console.error(err); } }; }); }
function qtRefresh(){ var nav=document.getElementById("nav"); if(!nav) return; if(!barEdit) qtabsDraw(nav); else { var r=document.getElementById("qtBar"); if(r) r.remove(); } try{ dockFix(); }catch(e){} }
function qtRemove(id){ var lb=sideLb[id]||["⭐",""]; var ov=showSheet("⭐ "+esc(qtTxt(lb[1])), '<div class="btns"><button class="btn alt g3d" id="qtDel">🗑️ '+L2x("Buang dari kegemaran","Remove from favourites")+'</button><button class="btn g3d" id="qtNo">'+L2x("Batal","Cancel")+'</button></div>');
  ov.querySelector("#qtDel").onclick=function(){ closeOverlay(); if((SD.fav||[]).indexOf(id)>=0) sideFavToggle(id); };
  ov.querySelector("#qtNo").onclick=closeOverlay; }
// Shortcut chips live in a .dock bar fixed above the bottom nav (and the Sunat sub-bar)
// 0.5.20 (review 17): on a wide screen (unfolded, tablet) the tab bar is a side rail on the left, so it takes no height at the bottom
function railOn(){ return S.rail!==false && !S.senior && !S.kidLock && window.innerWidth>=840; }
function railWide(){ return !S.senior && !S.kidLock && window.innerWidth>=840; }
function navH(){ var n=document.getElementById("nav"); return railOn()||!n?0:n.offsetHeight; }
// 0.6.73 (owner): the rail sits on the right by default; ▼ puts the bar back at the bottom (⇥ brings it to the side again);
// ⤵ shows the 2nd row as a pop-out beside its 1st-row button (on by default) or as the bottom bar
function railApply(){ var a=document.getElementById("app"), on=railOn(); a.classList.toggle("rail", on); a.classList.toggle("railR", on && S.railSide!=="left"); a.classList.toggle("railDrop", on && S.railDrop!==false);
  var nv0=document.getElementById("nav"), bk=document.getElementById("railBk");
  if(nv0 && railWide() && !on){ if(!bk){ bk=document.createElement("button"); bk.id="railBk"; bk.className="railBk"; bk.textContent="⇥"; bk.onclick=function(e){ e.stopPropagation(); S.rail=true; saveS(); railApply(); dockFix(); }; } bk.setAttribute("aria-label", L2x("Bar ke tepi","Bar to the side")); if(bk.parentNode!==nv0) nv0.appendChild(bk); } else if(bk && bk.parentNode) bk.parentNode.removeChild(bk);
  // one ⋯ button at the foot of the rail opens the bar options (side, 2nd row in the bar or at the bottom, bar to the bottom)
  var tl=document.getElementById("railTl");
  if(nv0 && on){ if(!tl){ tl=document.createElement("div"); tl.id="railTl"; tl.className="railTl"; tl.innerHTML='<button data-rt="menu">⋯</button>';
      tl.querySelector('[data-rt="menu"]').onclick=function(e){ e.stopPropagation(); var ov=showSheet("▦ "+L2x("Bar tepi","Side bar"),
        '<button class="ngRow card" data-rm="side"><i>'+(S.railSide!=="left"?"◀":"▶")+'</i><span><b>'+(S.railSide!=="left"?L2x("Pindah ke kiri","Move to the left"):L2x("Pindah ke kanan","Move to the right"))+'</b></span></button>'+
        '<button class="ngRow card" data-rm="drop"><i>⤵</i><span><b>'+(S.railDrop!==false?L2x("Baris kedua di bawah skrin","2nd row at the bottom of the screen"):L2x("Baris kedua dalam bar, bawah butangnya","2nd row inside the bar, under its button"))+'</b></span></button>'+
        '<button class="ngRow card" data-rm="down"><i>▼</i><span><b>'+L2x("Bar ke bawah skrin","Bar to the bottom of the screen")+'</b><small class="mut">'+L2x("Tekan ⇥ pada bar untuk kembali ke tepi","Tap ⇥ on the bar to bring it back to the side")+'</small></span></button>');
        ov.querySelectorAll("[data-rm]").forEach(function(b2){ b2.onclick=function(){ var k=b2.getAttribute("data-rm"); if(k==="side") S.railSide=S.railSide!=="left"?"left":"right"; else if(k==="drop") S.railDrop=S.railDrop===false; else S.rail=false; saveS(); closeOverlay(); railApply(); render(); }; }); }; }
    tl.querySelector('[data-rt="menu"]').setAttribute("aria-label", L2x("Pilihan bar","Bar options")); if(tl.parentNode!==nv0) nv0.appendChild(tl); } else if(tl && tl.parentNode) tl.parentNode.removeChild(tl);
  // 0.5.28: on a foldable / tablet the side rail has an arrow at the bottom to move it to the other side of the screen
  var nav=document.getElementById("nav"), b=document.getElementById("railSw"); if(!nav) return;
  if(false && on && !b){ b=document.createElement("button"); b.id="railSw"; b.className="railSw"; b.onclick=function(e){ e.stopPropagation(); S.railSide=S.railSide!=="left"?"left":"right"; saveS(); railApply(); dockFix(); }; }
  if(b){ if(on){ b.textContent=S.railSide!=="left"?"◀":"▶"; b.setAttribute("aria-label", S.railSide!=="left"?L2x("Pindah ke kiri","Move to the left"):L2x("Pindah ke kanan","Move to the right")); if(b.parentNode!==nav) nav.appendChild(b); } else if(b.parentNode) b.parentNode.removeChild(b); } }
window.addEventListener("resize", function(){ railApply(); dockFix(); });
// 0.5.20 round 2, request 3: tab labels are one word (two at most): "Toilet & Wudhu" shows as "Toilet" in a bar (full name kept as its label)
var TAB_SHORT={"Life & needs":"Needs","Keperluan hidup":"Keperluan","Occasional & circumstantial":"Occasional","Bersebab & keadaan":"Bersebab"};
function tabShort(root){ [].forEach.call(root.querySelectorAll(".dock button, #subnav button"), function(b){ if(b._ts) return; b._ts=1;
  [].forEach.call(b.childNodes, function(n){ if(n.nodeType!==3 && !(n.nodeType===1 && /^(B|SPAN)$/.test(n.nodeName) && !n.children.length)) return; var t=n.textContent, k=t.trim(); if(k.length<4) return;
    var o=TAB_SHORT[k] || (/\s&\s/.test(k) ? k.split(/\s*&\s*/)[0] : null); if(o && o!==k){ if(!b.getAttribute("aria-label")) b.setAttribute("aria-label", b.textContent.trim()); b.title=b.textContent.trim(); n.textContent=t.replace(k, o); } }); }); }
function dockFix(){
  document.body.classList.toggle("ib3dOn", !!document.querySelector(".ib3dFull"));   // 0.5.98 (owner): never leave the bars hidden once no 3D view is full screen
  railApply(); tabShort(document.getElementById("app"));
  var el=document.getElementById("view"), d=el.querySelector(".dock"), nav={offsetHeight:navH()}, sn=document.getElementById("subnav");
  var stk=/\bbs[23]\b/.test(document.getElementById("app").className)?6:0;   // card stack: each level overlaps the one below by 6 px
  // 0.6.73b (owner): in the side bar the 2nd row opens inside the bar, right under its 1st-row button (a dropdown); the buttons stretch to fill
  var drop=sn && railOn() && S.railDrop!==false, nvE=document.getElementById("nav"), appE=document.getElementById("app");
  if(sn){ sn.classList.toggle("snDrop", !!drop);
    if(drop && nvE){ var ab=nvE.querySelector("button.on"); if(ab && ab.nextSibling!==sn) nvE.insertBefore(sn, ab.nextSibling); sn.style.top=sn.style.bottom=""; }
    else if(sn.parentNode!==appE){ appE.appendChild(sn); } }
  if(sn && !drop) sn.style.bottom=Math.max(0,nav.offsetHeight-stk)+"px"; var snH=sn&&!drop?sn.offsetHeight-stk:0, qb=document.getElementById("qtBar"); if(qb){ qb.style.bottom=(nav.offsetHeight+snH)+"px"; snH+=qb.offsetHeight; } var mini=document.getElementById("mini"), mH=mini&&!mini.classList.contains("hidden")?mini.offsetHeight:0;
  if(mini) mini.style.bottom=(nav.offsetHeight+snH)+"px";
  if(!d){ el.style.paddingTop=""; el.style.paddingBottom=(90+snH+mH+48)+"px"; notchFix(nav.offsetHeight+snH+mH); return; }
  // 0.34.0: more than one dock (Alat › Kewangan pages under a page's own dock) stack upwards
  var ds=[].slice.call(el.querySelectorAll(".dock")).filter(function(x){ return !x.closest(".ibghost"); }), b0=nav.offsetHeight+snH+mH, hh=0;
  // 0.5.20 (review 1): the level-3 dock is a segmented control at the top of the page by default, so only two bars stay at the bottom
  // 0.5.20 round 2: level 3 is the dock nearest the sub-tabs (first on the page), level 4 (a page's own options) stacks above it
  ds.forEach(function(x, i){ x.classList.toggle("dk3", i===0); x.classList.toggle("dk4", i>0); });
  // 0.5.69 (owner): level 3 always sits at the bottom, just above level 2 (the top option is gone)
  if(false){ var t0=el.getBoundingClientRect().top; ds.forEach(function(x){ x.classList.add("dkTop"); x.style.bottom="auto"; x.style.top=(t0+hh)+"px"; hh+=x.offsetHeight; });
    el.style.paddingTop=(hh+8)+"px"; el.style.paddingBottom=(90+snH+mH+48)+"px"; notchFix(b0); return; }
  el.style.paddingTop=""; ds.forEach(function(x){ x.classList.remove("dkTop"); x.style.top=""; x.style.bottom=(b0+hh-stk)+"px"; hh+=x.offsetHeight-stk; });
  el.style.paddingBottom=(90+snH+mH+hh+48)+"px";
  notchFix(b0+hh);
}

// 0.18.0 notch: ▾ hides the header and every bottom bar (▴ brings them back); ✕ turns on auto-hide while scrolling down
var barsOff=false;
function notchFix(h){
  var app=document.getElementById("app"), n=document.getElementById("notch");
  if(!n){ n=document.createElement("div"); n.id="notch"; n.innerHTML='<span id="ntS" role="button" tabindex="0" aria-label="'+L2x("Tunjuk bar","Show the bars")+'"></span><button id="ntT" aria-label="Sembunyi / tunjuk bar"></button><span id="ntG" role="slider" tabindex="0" aria-label="'+L2x("Saiz bar: seret ke atas atau ke bawah, ketik dua kali","Bar size: drag up or down, double-tap")+'"><i></i></span><button id="ntA" aria-label="Auto">✕</button><button id="ntL" aria-label="Kunci bar">🔒</button>'; app.appendChild(n); denBind(n);
    n.querySelector("#ntL").onclick=function(e){ e.stopPropagation(); barEditSet(!barEdit); };
    n.querySelector("#ntT").onclick=function(e){ e.stopPropagation(); setBars(!barsOff); };
    n.querySelector("#ntA").onclick=function(e){ e.stopPropagation(); S.barsAuto=!S.barsAuto; saveS(); toast(S.barsAuto?L2x("Auto-sembunyi hidup: bar hilang bila tatal ke bawah","Auto-hide on: bars hide as you scroll down"):L2x("Auto-sembunyi dimatikan","Auto-hide off")); if(!S.barsAuto) setBars(false); else notchFix(); };
    var v=document.getElementById("view"), lastY=0; v.addEventListener("scroll", function(){ var y=v.scrollTop, d=y-lastY; if(Math.abs(d)<14) return; lastY=y; if(!S.barsAuto || view==="home") return; if(d>0 && y>60 && !barsOff) setBars(true); else if(d<0 && barsOff) setBars(false); }, {passive:true}); }
  var bOff=barsOff && view!=="home";   // 0.5.92: on Home the bars always show
  denApply(); var ns=n.querySelector("#ntS"); if(ns){ ns.classList.toggle("on", bOff); if(bOff) ns.innerHTML=denStrip(); }
  n.classList.toggle("off", bOff); n.classList.toggle("auto", !!S.barsAuto); n.classList.toggle("hidden", !!S.kidLock);
  n.querySelector("#ntT").textContent=bOff?"▴":"▾";
  // 0.5.3: 🔒 unlocks the bars for reordering and resizing; Tetapan › Paparan can hide any of the three notch buttons
  var nh=S.ntHide||{}, lk=n.querySelector("#ntL"); lk.textContent=barEdit?"🔓":"🔒"; lk.classList.toggle("on", barEdit);
  n.querySelector("#ntT").classList.toggle("hidden", !!nh.T); n.querySelector("#ntA").classList.toggle("hidden", !!nh.A); lk.classList.toggle("hidden", !!nh.L || !!S.appLock || !!S.kidLock || bOff);
  var vis=[].slice.call(n.querySelectorAll("button")).filter(function(b){ return !b.classList.contains("hidden"); }); n.classList.toggle("none", !vis.length);
  [].forEach.call(n.querySelectorAll("button"), function(b){ b.classList.remove("first","last"); }); if(vis.length){ vis[0].classList.add("first"); vis[vis.length-1].classList.add("last"); }
  if(h!=null && !bOff) n.style.bottom=h+"px"; else if(bOff) n.style.bottom="calc(4px + env(safe-area-inset-bottom))";
}
// ---------- 0.7.54 (owner): bar size from the notch. Full (default) / Compact (only the tab you're on shows its name) / Mini (icons only).
// Drag the grip between ▾ and ✕ up or down, or double-tap it. Dragging down past Mini hides the bars to the level strip (one pill with the
// current icon of every level); tapping the strip brings the bars back. S.barDen = "full" | "compact" | "mini".
var DEN=["full","compact","mini"], DEN_N={full:["Penuh","Full"], compact:["Padat","Compact"], mini:["Mini","Mini"]};
function denApply(){ var a=document.getElementById("app"); if(!a) return; var d=DEN.indexOf(S.barDen)>=0?S.barDen:"full"; a.classList.toggle("den-compact", d==="compact"); a.classList.toggle("den-mini", d==="mini"); }
function denSet(d, quiet){ S.barDen=d; saveS(); denApply(); if(barsOff) setBars(false); else dockFix(); if(!quiet){ var n=document.getElementById("notch"); if(n){ n.setAttribute("data-den", L2x(DEN_N[d][0], DEN_N[d][1])); n.classList.add("denShow"); clearTimeout(denSet.t); denSet.t=setTimeout(function(){ n.classList.remove("denShow"); }, 900); } } }   // a small label above the notch (never covers it)
function denIcon(b){ if(!b) return ""; var e=b.querySelector(".ico b")||b.querySelector(".ic b")||b.querySelector(".ic")||b.querySelector("span"); var t=(e?e.textContent:b.textContent||"").trim(); return e ? t : t.split(/\s+/)[0]; }
function denStrip(){ var parts=[], nv=document.getElementById("nav"), sn=document.getElementById("subnav"); var add=function(b){ var t=denIcon(b); if(t) parts.push('<span>'+esc(t)+'</span>'); };
  add(nv && nv.querySelector("button.on")); add(sn && sn.querySelector("button.on"));
  [].slice.call(document.querySelectorAll("#view .dock")).filter(function(x){ return !x.closest(".ibghost"); }).forEach(function(dk){ add(dk.querySelector(".chip.on, button.on")); });
  return parts.length ? parts.join('<em>›</em>') : '▴'; }
function denBind(n){ var g=n.querySelector("#ntG"), st=n.querySelector("#ntS"), drag=null, lastTap=0;
  st.onclick=function(e){ e.stopPropagation(); setBars(false); }; st.onkeydown=function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); setBars(false); } };
  g.addEventListener("pointerdown", function(e){ e.stopPropagation(); e.preventDefault(); try{ var sl=window.getSelection(); if(sl) sl.removeAllRanges(); }catch(x){} drag={y:e.clientY, i:Math.max(0, DEN.indexOf(S.barDen||"full")), moved:false}; try{ g.setPointerCapture(e.pointerId); }catch(x){} });
  g.addEventListener("pointermove", function(e){ if(!drag) return; var dy=e.clientY-drag.y; if(Math.abs(dy)>6) drag.moved=true; var ni=drag.i+Math.round(dy/26);
    if(ni>=DEN.length){ if(!barsOff){ S.barDen="mini"; saveS(); setBars(true); } return; } ni=Math.max(0, ni); if(DEN[ni]!==(S.barDen||"full") || barsOff) denSet(DEN[ni]); });
  g.addEventListener("pointerup", function(){ if(drag && !drag.moved){ var t=Date.now(); if(t-lastTap<420){ var i=Math.max(0, DEN.indexOf(S.barDen||"full")); denSet(DEN[(i+1)%DEN.length]); lastTap=0; } else lastTap=t; } drag=null; });
  g.addEventListener("pointercancel", function(){ drag=null; });
  g.addEventListener("keydown", function(e){ var i=Math.max(0, DEN.indexOf(S.barDen||"full")); if(e.key==="ArrowUp" && i>0){ denSet(DEN[i-1]); e.preventDefault(); } if(e.key==="ArrowDown"){ if(i<DEN.length-1) denSet(DEN[i+1]); else setBars(true); e.preventDefault(); } }); }
// ---------- 0.5.3 bar edit mode: drag tabs to reorder, pull the handle to resize (S.tabOrder, S.subOrder, S.barSize 0-4) ----------
var barEdit=false, barEditT=null;
function barSizeApply(n){ var a=document.getElementById("app"); for(var i=1;i<=5;i++) a.classList.toggle("bs"+i, n===i); }
function barEditSet(on){ if(on && (S.appLock || S.kidLock)) return; barEdit=on; clearTimeout(barEditT);
  document.getElementById("app").classList.toggle("editBars", on);
  var np=document.getElementById("ntPanel"); if(np) np.remove();
  if(on){ np=document.createElement("div"); np.id="ntPanel"; np.innerHTML='<div class="ntPh">📐 '+L2x("Takuk tepi","Side notches")+'</div>'+notchCtlHtml(); document.body.appendChild(np); notchCtlBind(np); }
  if(on){ toast(L2x("Seret tab untuk susun semula · tarik pemegang untuk ubah saiz","Drag tabs to reorder · pull the handle to resize")); barEditIdle(); }
  barEditBind(); notchFix(); }
function barEditIdle(){ clearTimeout(barEditT); if(barEdit) barEditT=setTimeout(function(){ barEditSet(false); }, 60000); }
document.addEventListener("pointerdown", function(){ if(barEdit) barEditIdle(); }, true);
document.addEventListener("visibilitychange", function(){ if(document.hidden && barEdit) barEditSet(false); });
function barEditBind(){
  var nav=document.getElementById("nav"), sn=document.getElementById("subnav"), app=document.getElementById("app"), g=document.getElementById("barGrip"), rs=document.getElementById("barReset");
  if(!barEdit){ if(g) g.remove(); if(rs) rs.remove(); return; }
  if(nav && !nav._srt){ nav._srt=1; IbSort(nav, {items:"button[data-v]", axis:"x", on:function(){ return barEdit; }, done:function(ids){ var all=TABS_ALL.map(function(t){ return t[0]; }); S.tabOrder=ids.concat(all.filter(function(k){ return ids.indexOf(k)<0; })); saveS(); render(); }, key:"data-v"}); }
  if(sn && !sn._srt){ sn._srt=1; var v0=view; IbSort(sn, {items:"button[data-sp]", axis:"x", on:function(){ return barEdit; }, key:"data-sp", done:function(ids){ S.subOrder=S.subOrder||{};
    // keep a hidden sub-tab (Haid) where it was
    if(v0==="cal" && periodHidden() && ids.indexOf("haid")<0){ var old=ordered(SUBS_FULL.cal, S.subOrder.cal).map(function(x){ return x[0]; }); ids.splice(Math.min(Math.max(0, old.indexOf("haid")), ids.length), 0, "haid"); }
    S.subOrder[v0]=ids; saveS(); render(); }}); }
  if(!g){ g=document.createElement("div"); g.id="barGrip"; g.innerHTML='<i></i>'; g.setAttribute("aria-label", L2x("Tarik untuk ubah saiz bar","Pull to resize the bar")); app.appendChild(g);
    var y0=null, s0=0; g.addEventListener("pointerdown", function(e){ y0=e.clientY; s0=S.barSize||0; try{ g.setPointerCapture(e.pointerId); }catch(er){} e.preventDefault(); });
    g.addEventListener("pointermove", function(e){ if(y0===null) return; var n=Math.max(0, Math.min(5, s0+Math.round((e.clientY-y0)/20))); if(n!==(S.barSize||0)){ S.barSize=n; barSizeApply(n); dockFix(); barGripPos(); if(N.vibrate) N.vibrate(12); } });
    var up=function(){ if(y0===null) return; y0=null; saveS(); dockFix(); barGripPos(); }; g.addEventListener("pointerup", up); g.addEventListener("pointercancel", up); }
  if(!rs){ rs=document.createElement("button"); rs.id="barReset"; rs.className="chip"; rs.textContent="↺ "+L2x("Set semula susunan","Reset order"); app.appendChild(rs);
    rs.onclick=function(){ S.tabOrder=null; S.subOrder={}; S.barSize=0; barSizeApply(0); saveS(); render(); toast(L2x("Susunan dan saiz asal","Original order and size")); }; }
  barGripPos();
}
// 0.5.4 (Ihsan): the handle sits centred just above the notch, as wide as the notch, breathing
function barGripPos(){ var g=document.getElementById("barGrip"), rs=document.getElementById("barReset"), nav=document.getElementById("nav"), nt=document.getElementById("notch"); if(!g||!nav) return; var t=nav.getBoundingClientRect().top;
  var nr=nt && nt.offsetWidth ? nt.getBoundingClientRect() : null; g.style.width=(nr ? Math.max(60, nr.width) : 84)+"px"; g.style.top=((nr ? nr.top : t)-16)+"px"; if(rs){ var top=t; [].forEach.call(document.querySelectorAll("#subnav, #view .dock:not(.dkTop)"), function(x){ var r=x.getBoundingClientRect().top; if(x.offsetHeight && r<top) top=r; }); rs.style.top=(top-40)+"px"; } }
// drag to reorder (tabs, sub-tabs, family rows): items move aside as the dragged one passes; done(ids) gets the new order
function IbSort(box, o){
  var drag=null, hold=null;
  var list=function(){ return [].slice.call(box.querySelectorAll(o.items)); };
  var startDrag=function(it, e){ var L=list(), x=o.axis==="x"; drag={it:it, L:L, i:L.indexOf(it), p0:x?e.clientX:e.clientY, r:L.map(function(b){ var r=b.getBoundingClientRect(); return x?[r.left, r.width]:[r.top, r.height]; }), to:L.indexOf(it), id:e.pointerId};
    it.classList.add("ibdrag"); try{ it.setPointerCapture(e.pointerId); }catch(er){} if(N.vibrate) N.vibrate(20); };
  box.addEventListener("pointerdown", function(e){ if(o.on && !o.on()) return; var it=e.target.closest(o.items); if(!it || !box.contains(it)) return;
    if(o.handle && !e.target.closest(o.handle)) return; e.preventDefault();
    if(o.hold){ var sx=e.clientX, sy=e.clientY; hold={t:setTimeout(function(){ hold=null; startDrag(it, e); }, o.hold), sx:sx, sy:sy}; } else startDrag(it, e); });
  box.addEventListener("pointermove", function(e){ if(hold){ if(Math.abs(e.clientX-hold.sx)+Math.abs(e.clientY-hold.sy)>8){ clearTimeout(hold.t); hold=null; } return; }
    if(!drag) return; e.preventDefault(); var x=o.axis==="x", d=(x?e.clientX:e.clientY)-drag.p0, me=drag.r[drag.i], c=me[0]+me[1]/2+d, to=drag.i;
    drag.r.forEach(function(r, k){ if(k<drag.i && c<r[0]+r[1]/2) to=Math.min(to, k); if(k>drag.i && c>r[0]+r[1]/2) to=Math.max(to, k); });
    drag.to=to; drag.it.style.transform=(x?"translateX(":"translateY(")+d+"px)";
    drag.L.forEach(function(b, k){ if(b===drag.it) return; var sh=0; if(k>drag.i && k<=to) sh=-me[1]; else if(k<drag.i && k>=to) sh=me[1]; b.style.transform=sh?(x?"translateX(":"translateY(")+sh+"px)":""; }); });
  var end=function(){ if(hold){ clearTimeout(hold.t); hold=null; } if(!drag) return; var L=drag.L, i=drag.i, to=drag.to; L.forEach(function(b){ b.style.transform=""; b.classList.remove("ibdrag"); }); drag=null;
    if(to===i) return; var m=L.splice(i, 1)[0]; L.splice(to, 0, m); o.done(L.map(function(b){ return b.getAttribute(o.key); })); };
  box.addEventListener("pointerup", end); box.addEventListener("pointercancel", end);
  box.addEventListener("touchmove", function(e){ if(drag && e.cancelable) e.preventDefault(); }, {passive:false});
  box.addEventListener("click", function(e){ if(o.on && o.on() && !o.handle) { e.stopPropagation(); } }, true);
}
window.IbSort=IbSort;
// ---------- 0.5.3/0.5.4 dropdown (never the Android one): tap the value for the list; hold it and slide up/down, release to choose ----------
// items [[value, label]]; multi: the value is an array and a pick toggles the item.
function ibDdWire(v, items, get, multi, pick){
  var t=null, wh=null, y0=0, i0=0, idx=0, rowH=40, sx=0, sy=0, moved=false;
  var its=function(){ return typeof items==="function"?items():items; };
  var draw=function(){ wh.querySelectorAll("[data-di]").forEach(function(r){ r.classList.toggle("on", +r.getAttribute("data-di")===idx); }); wh.querySelector(".ibddwl").style.transform="translateY("+(-idx*rowH)+"px)"; };
  v.addEventListener("pointerdown", function(e){ if(e.button) return; sx=e.clientX; sy=e.clientY; y0=e.clientY; moved=false; try{ v.setPointerCapture(e.pointerId); }catch(er){}
    t=setTimeout(function(){ t=null; var L=its(), cur=get(), r=v.getBoundingClientRect(); i0=multi?0:Math.max(0, L.findIndex(function(x){ return String(x[0])===String(cur); })); idx=i0;
      wh=document.createElement("div"); wh.className="ibddw"; wh.style.left=r.left+"px"; wh.style.width=Math.max(r.width, 150)+"px"; wh.style.top=(r.top+r.height/2-rowH/2)+"px";
      wh.innerHTML='<div class="ibddwl">'+L.map(function(x, k){ var on=multi&&(cur||[]).indexOf(x[0])>=0; return '<div data-di="'+k+'">'+(multi?(on?"☑ ":"☐ "):"")+esc(x[1])+'</div>'; }).join("")+'</div>';
      document.body.appendChild(wh); draw(); if(N.vibrate) N.vibrate(15); }, 280); });
  v.addEventListener("pointermove", function(e){ if(t){ if(Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)>10){ clearTimeout(t); t=null; moved=true; } return; } if(!wh) return; e.preventDefault();
    var n=Math.max(0, Math.min(its().length-1, i0+Math.round((e.clientY-y0)/rowH))); if(n!==idx){ idx=n; draw(); if(N.vibrate) N.vibrate(8); } });
  v.addEventListener("pointerup", function(){ if(t){ clearTimeout(t); t=null; if(!moved) ibDdList(v, its, get, multi, pick); return; } if(!wh) return; wh.remove(); wh=null; pick(its()[idx][0]); });
  v.addEventListener("pointercancel", function(){ if(t){ clearTimeout(t); t=null; } if(wh){ wh.remove(); wh=null; } });
  v.addEventListener("touchmove", function(e){ if(wh && e.cancelable) e.preventDefault(); }, {passive:false});
  v.addEventListener("contextmenu", function(e){ e.preventDefault(); });
  v.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); ibDdList(v, its, get, multi, pick); } });
}
// the full list, opened next to the value (below it, or above when there is no room over the bottom bars)
function ibDdList(v, its, get, multi, pick){
  var old=document.querySelector(".ibddl"); if(old){ var same=old._v===v; old._close(); if(same) return; }
  var r=v.getBoundingClientRect(), l=document.createElement("div"); l.className="ibddl"; l._v=v;
  var fill=function(){ var cur=get(); l.innerHTML=its().map(function(x, k){ var on=multi?(cur||[]).indexOf(x[0])>=0:String(cur)===String(x[0]); return '<button data-dk="'+k+'" data-dv="'+esc(x[0])+'" class="'+(on?"on":"")+'"'+(x[2]?' disabled':'')+'>'+(multi?(on?"☑ ":"☐ "):(on?"✓ ":""))+esc(x[1])+'</button>'; }).join("");
    l.querySelectorAll("[data-dk]").forEach(function(o2){ o2.onclick=function(ev){ ev.stopPropagation(); pick(its()[+o2.getAttribute("data-dk")][0]); if(multi) fill(); else l._close(); }; }); };
  fill(); document.body.appendChild(l);
  var bars=window.innerHeight; [].forEach.call(document.querySelectorAll("#nav, #subnav, #view .dock:not(.dkTop)"), function(x){ var tp=x.getBoundingClientRect().top; if(x.offsetHeight && tp>0 && tp<bars && !(document.getElementById("overlay").contains(v))) bars=tp; });
  var below=bars-r.bottom-8, above=r.top-60, h=Math.min(l.scrollHeight, 320), w=Math.max(r.width, 170), left=Math.min(r.left, window.innerWidth-w-8);
  if(below>=Math.min(h, 200) || below>=above){ h=Math.min(h, below); l.style.top=(r.bottom+4)+"px"; } else { h=Math.min(h, above); l.style.top=(r.top-h-4)+"px"; }
  l.style.maxHeight=h+"px"; l.style.left=Math.max(8, left)+"px"; l.style.width=w+"px";
  var on=l.querySelector(".on"); if(on) l.scrollTop=Math.max(0, on.offsetTop-h/2);
  var off=function(ev){ if(!l.contains(ev.target) && ev.target!==v && !v.contains(ev.target)) l._close(); };
  l._close=function(){ l.remove(); document.removeEventListener("pointerdown", off, true); window.removeEventListener("scroll", cl, true); };
  // a date wheel settling, or the page shifting while a screen redraws with new pickers, is not the user scrolling
  var cl=function(ev){ if(l.contains(ev.target) || (ev.target && ev.target.classList && ev.target.classList.contains("ibwc")) || Date.now()-(window.IB_FORM_AT||0) < 500) return; l._close(); };
  setTimeout(function(){ document.addEventListener("pointerdown", off, true); window.addEventListener("scroll", cl, true); }, 0);
}
var IbDrop={html:function(id, items, val, multi, ph){ return '<div class="ibdd" data-dd="'+esc(id)+'"><div class="ibddv noswipe" role="button" tabindex="0">'+IbDrop.label(items, val, multi, ph)+'</div></div>'; },
  label:function(items, val, multi, ph){ if(multi){ var l=items.filter(function(x){ return (val||[]).indexOf(x[0])>=0; }).map(function(x){ return esc(x[1]); }); return l.length?l.join(", "):'<span class="mut">'+esc(ph||"—")+'</span>'; }
    var f=items.filter(function(x){ return String(x[0])===String(val); })[0]; return f&&f[0]!==""?esc(f[1]):'<span class="mut">'+esc(ph||"—")+'</span>'; },
  bind:function(root, id, items, get, multi, onPick){ var w=root.querySelector('[data-dd="'+id+'"]'); if(!w) return;
    ibDdWire(w.querySelector(".ibddv"), items, get, multi, function(k){ var cur=get(); if(multi){ var a=(cur||[]).slice(), i=a.indexOf(k); if(i>=0) a.splice(i,1); else a.push(k); onPick(a); } else onPick(k); }); }};
// every <select> in the app becomes this dropdown (the real select stays hidden and still fires "change")
function ibSelect(sel){ if(sel._ib || sel.multiple || sel.hasAttribute("data-native") || !sel.parentNode) return; sel._ib=1;   // 0.6.50: a select removed again before the observer ran
  var b=document.createElement("div"); b.className="ibsel noswipe"+(sel.className?" "+sel.className:""); b.setAttribute("role","button"); b.tabIndex=0; if(sel.id) b.setAttribute("data-for", sel.id);
  var st=sel.getAttribute("style"); if(st) b.setAttribute("style", st);
  sel.classList.add("ibselh"); sel.parentNode.insertBefore(b, sel.nextSibling);
  var lab=function(){ var o=sel.options[sel.selectedIndex]; b.textContent=o?o.text:"—"; b.classList.toggle("dis", sel.disabled); };
  var its=function(){ return [].map.call(sel.options, function(o){ return [o.value, o.text, o.disabled]; }); };
  ibDdWire(b, its, function(){ return sel.value; }, false, function(k){ if(sel.disabled) return; if(sel.value!==k){ sel.value=k; lab(); sel.dispatchEvent(new Event("input", {bubbles:true})); sel.dispatchEvent(new Event("change", {bubbles:true})); } });
  sel.addEventListener("change", lab); b.addEventListener("pointerdown", lab, true);
  new MutationObserver(lab).observe(sel, {childList:true, subtree:true, attributes:true}); lab();
  // code that sets sel.value without an event: keep the label right
  try{ var d=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value"); Object.defineProperty(sel, "value", {get:function(){ return d.get.call(sel); }, set:function(x){ d.set.call(sel, x); lab(); }}); }catch(e){}
}
// 0.6.52 (owner): every delete button says "Delete" next to the 🗑 and is red, everywhere in the app
function ibDelBtns(root){ if(!root.querySelectorAll) return; var l=[].slice.call(root.querySelectorAll("button")); if(root.tagName==="BUTTON") l.push(root);
  l.forEach(function(b){ if(b._dl) return; var t=(b.textContent||"").trim(); if(t.indexOf("🗑")!==0) return; b._dl=1; b.classList.add("delb"); if(t==="🗑") b.textContent="🗑 "+L2x("Padam","Delete"); }); }
function ibSelectAll(root){ try{ ibDelBtns(root); }catch(e){} (root.tagName==="SELECT"?[root]:[].slice.call(root.querySelectorAll?root.querySelectorAll("select"):[])).forEach(ibSelect); }
new MutationObserver(function(ms){ ms.forEach(function(m){ [].forEach.call(m.addedNodes, function(n){ if(n.nodeType===1) ibSelectAll(n); }); }); }).observe(document.body, {childList:true, subtree:true});
ibSelectAll(document.body);
// ---------- 0.5.63 (owner): the app's own date & time picker and "＋ Add row" lists, everywhere ----------
// Every <input type="date|time|datetime-local"> becomes a compact wheel strip (day · month · year | hour · minute · am/pm) with a
// tickbox for the date and one for the time (time starts unticked); an unticked part is greyed and left out of the value.
// Every "one per line" <textarea> becomes rows with ✕ and "＋ Add row". The real input stays (invisible) and still fires input/change.
var IBW_H=30, IBW_REP=5;
function ibHide(el){ el.classList.add("ibhid"); }
function ibSetVal(el, v){ var d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value"); if(d.get.call(el)===v) return; d.set.call(el, v); el.dispatchEvent(new Event("input", {bubbles:true})); el.dispatchEvent(new Event("change", {bubbles:true})); }
function ibCol(k, items){ var one=items.map(function(x){ return '<div class="ibwi" data-v="'+x[0]+'">'+x[1]+'</div>'; }).join(""), all=""; for(var r=0;r<IBW_REP;r++) all+=one;
  return '<div class="ibwc" data-wk="'+k+'" data-n="'+items.length+'"><div class="ibwpad"></div>'+all+'<div class="ibwpad"></div></div>'; }
function ibDtFmt(d, hasD, hasT){ var o=[]; if(hasD) o.push(d.toLocaleDateString(ibLoc(en_()), {weekday:"short", day:"numeric", month:"short", year:"numeric"})); if(hasT) o.push((d.getHours()%12||12)+":"+("0"+d.getMinutes()).slice(-2)+" "+(d.getHours()>=12?"pm":"am")); return o.join(" · "); }
// typed dates / times: 2026-11-20, 20/11/2026, 20.11.26, 20 Nov 2026, 20 Mac, today / hari ini; 3:30 pm, 15:30, 3pm. Returns the input value, or null.
function ibDtParse(t, ty){ var s=String(t).toLowerCase().replace(/,/g," ").trim(), n=new Date(), p2=function(x){ return ("0"+x).slice(-2); }, d=null, tm=null;
  var MM={jan:1,feb:2,mar:3,mac:3,apr:4,may:5,mei:5,jun:6,jul:7,aug:8,ogo:8,sep:9,oct:10,okt:10,nov:11,dec:12,dis:12};
  var mt=s.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|pg|ptg|petang|pagi)\b/) || s.match(/\b(\d{1,2}):(\d{2})\b/);
  if(mt){ var h=+mt[1], mi=+(mt[2]||0), ap=mt[3]; if(ap){ var pm=/^(pm|ptg|petang)$/.test(ap); if(h===12) h=0; if(pm) h+=12; } if(h>23 || mi>59) return null; tm=p2(h)+":"+p2(mi); s=s.replace(mt[0], " "); }
  if(/\b(today|hari ini|now|sekarang)\b/.test(s)) d=[n.getFullYear(), n.getMonth()+1, n.getDate()];
  var a=s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/), b=s.match(/(\d{1,2})[\/.\-](\d{1,2})(?:[\/.\-](\d{2,4}))?/), c=s.match(/(\d{1,2})\s*([a-z]{3})[a-z]*\.?(?:\s+(\d{2,4}))?/);
  var yr=function(y){ if(!y) return n.getFullYear(); y=+y; return y<100?2000+y:y; };
  if(!d && a) d=[+a[1], +a[2], +a[3]]; else if(!d && b) d=[yr(b[3]), +b[2], +b[1]]; else if(!d && c && MM[c[2]]) d=[yr(c[3]), MM[c[2]], +c[1]];
  if(d && (d[1]<1 || d[1]>12 || d[2]<1 || d[2]>new Date(d[0], d[1], 0).getDate())) return null;
  if(ty==="date") return d?d[0]+"-"+p2(d[1])+"-"+p2(d[2]):null;
  if(ty==="time") return tm;
  if(!d && tm) d=[n.getFullYear(), n.getMonth()+1, n.getDate()]; return d?d[0]+"-"+p2(d[1])+"-"+p2(d[2])+"T"+(tm||"00:00"):null; }
function ibDate(inp){ if(inp._ibd || inp.hasAttribute("data-native")) return; inp._ibd=1;
  var ty=inp.type, hasD=ty!=="time", hasT=ty!=="date", w=document.createElement("div"), y0=new Date().getFullYear();
  var MS=en_()?["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]:["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"];
  var D=[], Mo=[], Y=[], Hh=[], Mi=[], AP=[["am","am"],["pm","pm"]]; for(var i=1;i<=31;i++) D.push([i,i]); for(var m=1;m<=12;m++) Mo.push([m,MS[m-1]]);
  var ylo=+(inp.min||"").slice(0,4)||y0-100, yhi=+(inp.max||"").slice(0,4)||y0+15; for(var yy=ylo;yy<=yhi;yy++) Y.push([yy,yy]);
  for(var h=1;h<=12;h++) Hh.push([h,h]); for(var mi=0;mi<60;mi++) Mi.push([mi,("0"+mi).slice(-2)]);
  w.className="ibdt noswipe"+(hasD&&hasT?" both":"")+(ty==="time"?" tonly":"");
  // 0.6.54 (owner): a compact text box; the wheels open only when it is tapped (tap again to type)
  w.innerHTML='<div class="ibdtB"><input type="text" class="rin ibdtT" readonly autocomplete="off" spellcheck="false"><span class="ibdtI">'+(hasD?"📅":"⏰")+'</span></div><div class="ibdtX"><div class="ibdtH">'+(hasD?'<label class="ibdtK"><input type="checkbox" data-ibk="d"> 📅 '+L2x("Tarikh","Date")+'</label>':'')+(hasT?'<label class="ibdtK"><input type="checkbox" data-ibk="t"> ⏰ '+L2x("Masa","Time")+'</label>':'')+'<span class="ibdtS"></span></div>'+
    '<div class="ibdtW">'+(hasD?'<div class="ibdtP" data-p="d">'+ibCol("d",D)+ibCol("m",Mo)+ibCol("y",Y)+'</div>':'')+(hasT?'<div class="ibdtP" data-p="t">'+ibCol("h",Hh)+ibCol("i",Mi)+ibCol("a",AP)+'</div>':'')+'<div class="ibwband"></div></div><div class="ibdtF"><button type="button" class="chip" data-ibf="now">'+(hasD?L2x("Hari ini","Today"):L2x("Sekarang","Now"))+'</button><button type="button" class="chip" data-ibf="kb" title="'+L2x("Taip","Type")+'">⌨</button><button type="button" class="chip" data-ibf="clr" title="'+L2x("Kosongkan","Clear")+'">✕</button><button type="button" class="chip on" data-ibf="ok">✓ '+L2x("Siap","Done")+'</button></div></div>';
  ibHide(inp); inp.parentNode.insertBefore(w, inp.nextSibling);
  var pend=null, T=w.querySelector(".ibdtT"), kd=w.querySelector('[data-ibk="d"]'), kt=w.querySelector('[data-ibk="t"]'), S=w.querySelector(".ibdtS"), cols=w.querySelectorAll(".ibwc"), tm=null, busy=false;
  var at=function(c){ return Math.round(c.scrollTop/IBW_H); };
  var get=function(k){ var c=w.querySelector('[data-wk="'+k+'"]'); if(!c) return ""; var its=c.querySelectorAll(".ibwi"), i=at(c); its.forEach(function(x,j){ x.classList.toggle("on", j===i); }); return its[i]?its[i].getAttribute("data-v"):""; };
  var put=function(k, v){ var c=w.querySelector('[data-wk="'+k+'"]'); if(!c) return; var n=+c.getAttribute("data-n"), its=c.querySelectorAll(".ibwi"), idx=0; for(var j=0;j<n;j++) if(String(its[j].getAttribute("data-v"))===String(v)) idx=j; c.scrollTop=(n*Math.floor(IBW_REP/2)+idx)*IBW_H; get(k); };
  var grey=function(){ if(kd) w.querySelector('[data-p="d"]').classList.toggle("off", !kd.checked); if(kt) w.querySelector('[data-p="t"]').classList.toggle("off", !kt.checked); };
  var p2=function(n){ return ("0"+n).slice(-2); };
  var read=function(){ var v=inp.value||"", d=null, t=null;
    if(hasD){ var md=v.match(/^(\d{4})-(\d{2})-(\d{2})/); if(md) d=[+md[1], +md[2], +md[3]]; }
    var mt=v.match(/(?:T|^)(\d{2}):(\d{2})/); if(hasT && mt && !(ty==="datetime-local" && mt[1]==="00" && mt[2]==="00")) t=[+mt[1], +mt[2]];
    var n=new Date(); busy=true; if(kd) kd.checked=!!d; if(kt) kt.checked=!!t;
    if(hasD){ var dd=d||[n.getFullYear(), n.getMonth()+1, n.getDate()]; put("d", dd[2]); put("m", dd[1]); put("y", dd[0]); }
    if(hasT){ var tt=t||[n.getHours(), 0]; put("h", tt[0]%12||12); put("i", tt[1]); put("a", tt[0]>=12?"pm":"am"); }
    busy=false; grey(); sum(); };
  var sum=function(){ var o=[]; if(kd && kd.checked){ var dt=new Date(+get("y"), +get("m")-1, Math.min(+get("d"), new Date(+get("y"), +get("m"), 0).getDate())); o.push(dt.toLocaleDateString(ibLoc(en_()), {weekday:"short", day:"numeric", month:"short", year:"numeric"})); }
    if(kt && kt.checked) o.push(get("h")+":"+p2(get("i"))+" "+get("a")); S.textContent=o.length?o.join(" · "):"—";
    if(document.activeElement!==T || T.readOnly) T.value=o.join(" · "); T.placeholder=ibDtFmt(new Date(), hasD, hasT); };
  var write=function(){ if(busy) return; var v="";
    var dpart=function(){ var y=+get("y"), m=+get("m"), d=Math.min(+get("d"), new Date(y, m, 0).getDate()); return y+"-"+p2(m)+"-"+p2(d); };
    var tpart=function(){ var h=+get("h")%12+(get("a")==="pm"?12:0); return p2(h)+":"+p2(get("i")); };
    if(ty==="date") v=kd.checked?dpart():""; else if(ty==="time") v=kt.checked?tpart():""; else v=kd.checked?dpart()+"T"+(kt.checked?tpart():"00:00"):"";
    grey(); sum(); if(w.classList.contains("open")){ pend=v; return; } ibSetVal(inp, v); };   // 0.7.86: while the wheels are open the pick is kept here and saved on ✓ Done / closing
  var tilt=function(c){ var its=c.querySelectorAll(".ibwi"), mid=c.scrollTop/IBW_H, a=Math.max(0, Math.floor(mid)-4), b=Math.min(its.length-1, Math.ceil(mid)+4);
    for(var j=a;j<=b;j++){ var d=j-mid, ad=Math.min(Math.abs(d), 3); its[j].style.transform="rotateX("+(-d*22)+"deg) scale("+(1-ad*0.08)+")"; its[j].style.opacity=String(Math.max(0.15, 1-ad*0.33)); } };
  cols.forEach(function(c){ var n=+c.getAttribute("data-n"), u=function(){ c._u=Date.now(); };
    c.addEventListener("scroll", function(){ if(c._raf) return; c._raf=requestAnimationFrame(function(){ c._raf=0; tilt(c); }); }, {passive:true});
    ["pointerdown","touchstart","wheel","keydown"].forEach(function(ev){ c.addEventListener(ev, u, {passive:true}); });
    c.addEventListener("scroll", function(){ if(busy || !w.classList.contains("open")) return; clearTimeout(tm); tm=setTimeout(function(){ if(!w.classList.contains("open")) return; var i=at(c);   /* 0.7.85: a closed panel folds to 0 height and phones reset its wheels to the top; that is not the user picking 1 Jan of the first year */ if(i<n || i>=n*(IBW_REP-1)) c.scrollTop=(n*Math.floor(IBW_REP/2)+((i%n)+n)%n)*IBW_H;
      if(!(c._u && Date.now()-c._u < 3000)){ get(c.getAttribute("data-wk")); return; }   // our own scrolling (opening, value set by code): no auto-tick
      var p=c.parentNode.getAttribute("data-p"); if(p==="d" && kd && !kd.checked) kd.checked=true; if(p==="t" && kt && !kt.checked){ kt.checked=true; if(kd && !kd.checked) kd.checked=true; } get(c.getAttribute("data-wk")); write(); }, 120); }, {passive:true});
    c.querySelectorAll(".ibwi").forEach(function(x, j){ x.onclick=function(){ c._u=Date.now(); c.scrollTo({top:j*IBW_H, behavior:"smooth"}); }; }); });
  var X=w.querySelector(".ibdtX"),
    // 0.6.54: the panel floats over the page under the box (above it when there is no room), like the app's dropdowns
    // 0.6.67 (owner): exactly the box's width, attached right under it (above when there is no room)
    // 0.6.72 (owner): the wheel is part of the box (it scrolls with it, never floats); above the box only when there is no room below
    place=function(){ if(!w.classList.contains("open")) return; var r=T.getBoundingClientRect(), h=X.offsetHeight||170, below=window.innerHeight-r.bottom-8, up=below<h && r.top>h+60; w.classList.toggle("up", up); X.style.left=X.style.top=X.style.width="";
      if(r.bottom<0 || r.top>window.innerHeight) shut(); },
    onScr=function(e){ if(e.target && e.target.classList && e.target.classList.contains("ibwc")) return; place(); },
    shut=function(){ if(!w.classList.contains("open")) return; clearTimeout(tm); w.classList.remove("open"); if(pend!==null){ var pv=pend; pend=null; ibSetVal(inp, pv); } var cdU=w.closest(".card"); if(cdU) cdU.classList.remove("ibUp"); T.readOnly=true; document.removeEventListener("click", outside, true); window.removeEventListener("scroll", onScr, true); window.removeEventListener("resize", place); typed(); },
    outside=function(e){ if(!w.contains(e.target)) shut(); },
    show=function(){ if(w.classList.contains("open")) return; pend=null; [].forEach.call(document.querySelectorAll(".ibdt.open"), function(o){ if(o._shut) o._shut(); }); w.classList.add("open"); var cdU=w.closest(".card"); if(cdU) cdU.classList.add("ibUp"); busy=false; read();
      // 0.7.84 (owner: date stuck at 1926): some phone browsers reset the wheels to the top (year 1926) while the panel opens; put them back
      var fix=function(){ if(!w.classList.contains("open")) return; var bad=false; cols.forEach(function(c){ if(c._u && Date.now()-c._u<3000) return; var n=+c.getAttribute("data-n"), i=at(c); if(i<n || i>=n*(IBW_REP-1)) bad=true; }); if(bad){ read(); cols.forEach(tilt); } };
      requestAnimationFrame(fix); setTimeout(fix, 80); setTimeout(fix, 400);
      place(); cols.forEach(tilt); setTimeout(function(){ place(); document.addEventListener("click", outside, true); window.addEventListener("scroll", onScr, true); window.addEventListener("resize", place); }, 0); },
    typed=function(){ if(T.readOnly && !T._ed) return; T._ed=0; var t=T.value.trim(), cur=sumTxt(); if(t===cur) return;
      if(!t){ ibSetVal(inp, ""); return; } var v=ibDtParse(t, ty); if(v==null){ toast("⚠ "+L2x("Tarikh/masa tidak difahami","Could not read that date/time")); read(); return; } ibSetVal(inp, v); },
    sumTxt=function(){ return S.textContent==="—"?"":S.textContent; };
  w._shut=shut;
  // 0.6.67: typing uses dd/mm/yyyy (hh:mm); the slashes come in by themselves
  var dmy=function(){ var v=inp.value||"", o=[], md=v.match(/^(\d{4})-(\d{2})-(\d{2})/), mt=v.match(/(?:T|^)(\d{2}):(\d{2})/); if(hasD && md) o.push(md[3]+"/"+md[2]+"/"+md[1]); if(hasT && mt && !(ty==="datetime-local" && mt[1]==="00" && mt[2]==="00")) o.push(mt[1]+":"+mt[2]); return o.join(" "); };
  var edit=function(){ T.readOnly=false; T._ed=1; T.value=dmy(); T.placeholder=hasD?(hasT?"dd/mm/yyyy hh:mm":"dd/mm/yyyy"):"hh:mm"; T.inputMode=hasD&&!hasT?"numeric":"text"; T.focus(); try{ T.setSelectionRange(T.value.length, T.value.length); }catch(e){} };
  T.addEventListener("click", function(){ if(!w.classList.contains("open")) show(); else if(T.readOnly) edit(); });
  T.addEventListener("input", function(e){ T._ed=1; if(hasD && !hasT && /^[\d\/]*$/.test(T.value) && !(e && e.inputType && /delete/.test(e.inputType))){ var dg=T.value.replace(/\D/g, "").slice(0, 8);
    T.value=dg.length>4 ? dg.slice(0,2)+"/"+dg.slice(2,4)+"/"+dg.slice(4) : dg.length>2 ? dg.slice(0,2)+"/"+dg.slice(2) : dg; if(dg.length===8){ typed(); T._ed=1; } } });
  T.addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); typed(); T.readOnly=true; T.blur(); } });
  T.addEventListener("blur", function(){ if(!T.readOnly){ typed(); T.readOnly=true; } });
  w.querySelector('[data-ibf="ok"]').onclick=shut;
  w.querySelector('[data-ibf="kb"]').onclick=edit;
  w.querySelector('[data-ibf="clr"]').onclick=function(){ if(kd) kd.checked=false; if(kt) kt.checked=false; write(); shut(); };
  w.querySelector('[data-ibf="now"]').onclick=function(){ var n=new Date(); busy=true; if(hasD){ put("d", n.getDate()); put("m", n.getMonth()+1); put("y", n.getFullYear()); if(kd) kd.checked=true; }
    if(hasT && (!hasD || (kt && kt.checked))){ put("h", n.getHours()%12||12); put("i", n.getMinutes()); put("a", n.getHours()>=12?"pm":"am"); if(kt) kt.checked=true; } busy=false; write(); if(pend!==null){ var pv=pend; pend=null; ibSetVal(inp, pv); } };   // Today / Now is a deliberate tap: saved at once
  if(kd) kd.onchange=function(){ if(!kd.checked && kt) kt.checked=false; write(); };
  if(kt) kt.onchange=function(){ if(kt.checked && kd) kd.checked=true; write(); };
  inp.addEventListener("input", function(){ if(!busy) read(); }); inp.addEventListener("change", function(){ if(!busy) read(); });
  try{ var de=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value"); Object.defineProperty(inp, "value", {get:function(){ return de.get.call(inp); }, set:function(x){ de.set.call(inp, x); if(!busy) read(); }}); }catch(e){}
  setTimeout(read, 0); }
// "one per line" text boxes become rows
var IB_LISTRX=/one per line|satu setiap baris|per line|setiap baris/i;
function ibRows(ta){ if(ta._ibr || ta.hasAttribute("data-native") || !(ta.hasAttribute("data-rows") || IB_LISTRX.test(ta.placeholder||""))) return; ta._ibr=1;
  var ph=String(ta.placeholder||"").replace(/\s*\((one per line|satu setiap baris)[^)]*\)/i, "").replace(/[:,]?\s*(one per line|satu setiap baris)[^,]*/i, "").trim(), w=document.createElement("div"), busy=false;
  w.className="ibrows noswipe"; ibHide(ta); ta.parentNode.insertBefore(w, ta.nextSibling);
  var sync=function(){ busy=true; ibSetVal(ta, [].map.call(w.querySelectorAll(".ibrowI"), function(i){ return i.value; }).join("\n")); busy=false; };
  var row=function(v){ var r=document.createElement("div"); r.className="ibrow"; r.innerHTML='<input class="rin ibrowI" placeholder="'+esc(ph)+'"><button type="button" class="ibrowX" aria-label="'+L2x("Buang baris","Remove row")+'">✕</button>';
    var i=r.querySelector("input"); i.value=v||""; i.oninput=sync;
    i.onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); var nr=row(""); r.parentNode.insertBefore(nr, r.nextSibling); nr.querySelector("input").focus(); sync(); } };
    r.querySelector(".ibrowX").onclick=function(){ if(w.querySelectorAll(".ibrow").length>1) r.remove(); else i.value=""; sync(); }; return r; };
  var build=function(){ w.innerHTML='<div class="ibrowL"></div><button type="button" class="chip ibrowA">＋ '+L2x("Tambah baris","Add row")+'</button>'; var L0=w.querySelector(".ibrowL"), vs=String(ta.value||"").split("\n"); if(!vs.length) vs=[""];
    vs.forEach(function(v){ L0.appendChild(row(v)); }); w.querySelector(".ibrowA").onclick=function(){ var nr=row(""); L0.appendChild(nr); nr.querySelector("input").focus(); sync(); }; };
  ta.addEventListener("input", function(){ if(!busy) build(); }); build(); }
function ibFormAll(root){ if(!root.querySelectorAll) return; var q=function(s){ return root.matches&&root.matches(s)?[root]:[].slice.call(root.querySelectorAll(s)); };
  var a=q('input[type="date"],input[type="time"],input[type="datetime-local"]'), b=q("textarea"); if(a.length || b.length) window.IB_FORM_AT=Date.now(); a.forEach(ibDate); b.forEach(ibRows); }
new MutationObserver(function(ms){ ms.forEach(function(m){ [].forEach.call(m.addedNodes, function(n){ if(n.nodeType===1) ibFormAll(n); }); }); }).observe(document.body, {childList:true, subtree:true});
ibFormAll(document.body);
window.IbDrop=IbDrop; window.ibSelectAll=ibSelectAll; window.ibDtParse=ibDtParse;
// ---------- 0.5.5 folder sidebar for galleries (Books, Recipes): collapsible, ＋ new folder, ⋮ on each folder ----------
// html(o): o = {open, cur, items:[{k, ic, n, c (count), menu (bool)}], body (the gallery html)}; bind(root, {pick(k), add(), menu(k, btn), toggle(open)})
var IbFold={html:function(o){ return '<div class="ibfw'+(o.open?' open':'')+'"><aside class="ibfold noswipe"><div class="ibfh"><button class="ibft" data-fx="1" aria-label="📁">'+(o.open?'◀':'📁')+'</button>'+(o.open?'<b>'+esc(L2x("Folder","Folders"))+'</b><button class="ibfa" data-fa="1" aria-label="＋">＋</button>':'')+'</div>'+
    '<div class="ibfl">'+o.items.map(function(x){ return '<div class="ibfi'+(o.cur===x.k?' on':'')+'" data-fk="'+esc(x.k)+'" title="'+esc(x.n)+'"'+(x.lv&&o.open?' style="padding-left:'+(6+x.lv*12)+'px"':'')+'><span class="ibfic">'+x.ic+'</span>'+(o.open?'<span class="ibfn">'+esc(x.n)+'</span><small>'+(x.c==null?'':x.c)+'</small>'+(x.menu?'<button class="ibfm" data-fm="'+esc(x.k)+'" aria-label="⋮">⋮</button>':'<i class="ibfm0"></i>'):'')+'</div>'; }).join("")+
    (o.open?'':'<div class="ibfi" data-fa="1" title="＋"><span class="ibfic">＋</span></div>')+'</div></aside><div class="ibfmain">'+o.body+'</div></div>'; },
  bind:function(root, o){ var w=root.querySelector(".ibfw"); if(!w) return;
    w.querySelectorAll("[data-fk]").forEach(function(b){ b.onclick=function(e){ if(e.target.closest("[data-fm]")) return; o.pick(b.getAttribute("data-fk")); }; });
    w.querySelectorAll("[data-fa]").forEach(function(b){ b.onclick=function(){ o.add(); }; });
    w.querySelectorAll("[data-fm]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); o.menu(b.getAttribute("data-fm"), b); }; });
    var t=w.querySelector("[data-fx]"); if(t) t.onclick=function(){ o.toggle(!w.classList.contains("open")); }; },
  // ask for a folder name; done(name)
  ask:function(title, val, done){ var ov=showSheet(title, '<div class="radd"><input id="ibfN" class="rin" value="'+esc(val||"")+'" maxlength="40" placeholder="'+esc(L2x("Nama folder","Folder name"))+'"><button class="btn gold" id="ibfOk">✓</button></div>');
    var i=ov.querySelector("#ibfN"); setTimeout(function(){ i.focus(); }, 80); var go_=function(){ var v=i.value.trim(); if(!v) return; closeOverlay(); done(v); };
    ov.querySelector("#ibfOk").onclick=go_; i.onkeydown=function(e){ if(e.key==="Enter") go_(); }; },
  // ⋮ menu for one folder: rename / delete
  menu:function(name, onRen, onDel){ var ov=showSheet("📁 "+esc(name), '<div class="btns"><button class="btn alt" id="ibfR">✏️ '+L2x("Namakan semula","Rename")+'</button><button class="btn alt" id="ibfD">🗑️ '+L2x("Padam folder","Delete folder")+'</button></div><div class="mut tiny" style="margin-top:8px">'+L2x("Memadam folder tidak memadam isinya.","Deleting a folder does not delete what is in it.")+'</div>');
    ov.querySelector("#ibfR").onclick=function(){ closeOverlay(); IbFold.ask("✏️ "+L2x("Namakan semula","Rename"), name, onRen); };
    ov.querySelector("#ibfD").onclick=function(){ closeOverlay(); if(confirm(L2x("Padam folder ","Delete folder ")+name+"?")) onDel(); }; }};
window.IbFold=IbFold;
// 0.5.4: after a swipe or ‹ › the selected page button scrolls into view in its row (e.g. Haid › Kesihatan at the far right)
// 0.5.20 round 2: app-wide (sub-tabs, docks, sheets, new content and after every tap), not only the page
function ibChips(root){ var vw=root && root.nodeType===1 ? root : document.body; if(!vw) return;
  var list=[].slice.call(vw.querySelectorAll(".on, .cur")); if(vw.classList && (vw.classList.contains("on")||vw.classList.contains("cur"))) list.push(vw);
  list.forEach(function(c){ if(c.closest(".ibghost") || c.offsetHeight>90) return; for(var n=c.parentNode; n && n!==document.body && n.nodeType===1; n=n.parentNode){ if(n.classList.contains("hpager") || n.classList.contains("ibpg") || n.clientHeight>160) break; if(n.scrollWidth>n.clientWidth+4){ var ox=getComputedStyle(n).overflowX; if(ox==="auto"||ox==="scroll"){
    var r=c.getBoundingClientRect(), b=n.getBoundingClientRect(); if(r.left<b.left+4 || r.right>b.right-4){ var x=n.scrollLeft+(r.left-b.left)-(b.width-r.width)/2; try{ n.scrollTo({left:x, behavior:"smooth"}); }catch(e){ n.scrollLeft=x; } } break; } } } }); }
window.ibChips=ibChips;
document.addEventListener("click", function(e){ var b=e.target.closest && e.target.closest("button,.chip,label"); if(!b) return; setTimeout(function(){ var r=b.parentNode; ibChips(r && r.isConnected ? r : document.body); if(!b.isConnected) ibChips(); }, 60); }, true);
function setBars(off){ barsOff=off; document.getElementById("app").classList.toggle("barsOff", off && view!=="home"); dockFix(); }   // 0.5.92: never on Home

// Sticky header: date + Hijri, current prayer and time left
var hdrLastDay=null;
function hdrTick(){
  var e=function(id){return document.getElementById(id)}; if(!e("hCur")) return;
  var d=new Date(), dk=ymd(d)+S.lang+S.hijriOffset;
  if(hdrLastDay!==dk){ hdrLastDay=dk; e("topSub").innerHTML='<bdi>'+d.toLocaleDateString(locTag(),{weekday:"short",day:"numeric",month:"short",year:"numeric"})+'</bdi>'; if(e("topHij")){ e("topHij").innerHTML='<bdi>'+hijriStr(hijriOf(d))+'</bdi>'; hdrFit(); } else e("topSub").innerHTML+=' · '+hijriStr(hijriOf(d)); }   // 0.7.69 (owner): the Hijri date on its own line
  var np=nextPrev(); if(!np.next){ e("hCur").textContent=""; e("hLeft").textContent=""; if(e("hNext")) e("hNext").textContent=""; return; }
  var now=Date.now(), f=function(t){ var x=new Date(t); return fmt12(pad(x.getHours())+":"+pad(x.getMinutes())); };
  if(inDhuha()){ e("hCur").innerHTML='<b><bdi>'+T("dhuha")+'</bdi></b> '+fmt12(dhuhaHM(getDay(d))); }
  else e("hCur").innerHTML = np.prev ? '<b><bdi>'+prN(np.prev.k,np.prev.t)+'</bdi></b> '+f(np.prev.t) : '';
  var left=Math.max(0,np.next.t-now), s=Math.floor(left/1000), hh=Math.floor(s/3600), mm=Math.floor(s%3600/60), ss=s%60;
  // 0.7.69 (owner): now · countdown (no name) · next prayer and its time, all one size
  if(e("hNext")){ e("hLeft").innerHTML='<span class="hl">−'+(hh?hh+":"+pad(mm):mm)+":"+pad(ss)+'</span>'; e("hNext").innerHTML='<b><bdi>'+prN(np.next.k,np.next.t)+'</bdi></b> '+f(np.next.t); }
  else e("hLeft").innerHTML='<bdi>'+prN(np.next.k,np.next.t)+'</bdi> <span class="hl">−'+(hh?hh+":"+pad(mm):mm)+":"+pad(ss)+'</span>';
  var pt=np.prev?np.prev.t:np.next.t-3*36e5; e("hBar").style.width=Math.max(0,Math.min(100,(now-pt)*100/(np.next.t-pt))).toFixed(1)+"%";
  if(S.autoNight && (nightNow()?"night":S.appTheme)!==themeNow) applyTheme();
  if((themeNow==="waktu"||themeNow==="kaca") && !(hdrTick._w>0 && Date.now()-hdrTick._w<30000)){ hdrTick._w=Date.now(); applyWaktu(); }
  if(left<1000 && !hdrTick._r){ hdrTick._r=true; setTimeout(function(){ hdrTick._r=false; render(); },1500); }
}
setInterval(hdrTick,1000);
// SOLAT (home + rakaat)
function vSolat(el){
  var now=new Date(), t=getDay(now), np=nextPrev(), cur=np.prev?np.prev.k:null, curToday=np.prev && ymd(new Date(np.prev.t))===ymd(now), en=S.lang==="en";
  var html='';
  if(false){
    html+='<div class="card"><h3>'+(S.lang==="en"?"Welcome":"Selamat datang")+'</h3><div class="small mut">'+(S.lang==="en"?"Allow location to pick your JAKIM zone and Qibla, and notifications for prayer alerts.":"Benarkan lokasi untuk zon JAKIM dan kiblat, serta notifikasi untuk makluman waktu solat.")+'</div><div class="btns" style="margin-top:10px"><button class="btn" id="obLoc">📍 '+(S.lang==="en"?"Location":"Lokasi")+'</button><button class="btn" id="obNot">🔔 '+T("notifs")+'</button><button class="btn alt" id="obDone">OK</button></div></div>';
  }
  html+='<div class="card trow">'+PR.map(function(k0){ var c=prCell(k0,t), k=c.k, p=fmt12(c.hm).split(" "); return '<div class="tc '+((k===cur&&curToday)||c.cur?"cur":"")+'"><div class="tn">'+prN(k)+'</div><div class="tt">'+p[0]+'</div><div class="ta">'+(p[1]||"")+'</div></div>'; }).join("")+
    '<div class="trow2">'+["imsak","syuruk"].map(function(k){ return '<span>'+T(k)+' <b>'+fmt12(t[k])+'</b></span>'; }).join("")+(S.tahajjud||true?'<span>'+(en?"Last third":"1/3 malam akhir")+' <b>'+lastThird(now)+'</b></span>':'')+'</div>'+
    '<div class="src0"><span class="badge '+(t.src==="jakim"?"":"warn")+'" id="refresh">'+(t.src==="jakim"?T("jakim"):t.src==="abroad"?L2x("Kiraan: ","Calculated: ")+methName(S.calcMethod):T("est"))+' ↻</span>'+(adjAny()?' <span class="badge">± '+(en?"adjusted":"dilaras")+'</span>':'')+'</div></div>';
  if(musafirNow()) html+=musafirBanner();
  html+='<div class="card qmini" id="qCard"></div>';
  html+=rakaatSetup();
  el.innerHTML=html;
  qiblaCard(el.querySelector("#qCard"), true);
  el.querySelector("#refresh").onclick=function(){ ensureData(true); };
  if(false){
    el.querySelector("#obLoc").onclick=function(){ askLocation(true); };
    el.querySelector("#obNot").onclick=function(){ N.requestPerm("notif"); };
    el.querySelector("#obDone").onclick=function(){ S.onboard=true; saveS(); render(); };
  }
  bindRakaat(el);
  bindMusafir(el);
}
function askLocation(setZone){
  var hl=function(r){ off("location",hl); if(r.error){ toast(S.lang==="en"?"Location unavailable":"Lokasi tidak tersedia"); return; }
    S.lat=r.lat; S.lon=r.lon; S.locAt=Date.now();
    var wasAbroad=S.overseas; S.overseas=!inMalaysia(r.lat,r.lon); if(S.overseas) methodAuto();
    if(S.overseas && !wasAbroad && S.locMode==="auto") toast(S.lang==="en"?"Outside Malaysia: using calculated prayer times":"Di luar Malaysia: guna waktu solat kiraan");
    var wasMus=musafirNow._last; var mNow=musafirNow(); if(mNow && !wasMus) toast(S.lang==="en"?"You are travelling (musafir): qasar and jamak shown on Solat":"Anda musafir: qasar dan jamak dipaparkan di tab Solat"); musafirNow._last=mNow;
    if(!S.overseas && (setZone || S.zoneAuto)){ var z=nearestZone(r.lat,r.lon); if(z && z[0]!==S.zone){ S.zone=z[0]; S.state=z[1]; toast(T("zone")+": "+z[0]+" · "+z[2].split(",")[0]); ensureData(true);} }
    saveS(); render(); };
  var hp=function(p){ if(p.which!=="location") return; off("perm",hp); if(p.granted){ on("location",hl); N.getLocation(); } else toast(S.lang==="en"?"Location permission denied":"Kebenaran lokasi ditolak"); };
  if(N.hasPerm("location")){ on("location",hl); N.getLocation(); } else { on("perm",hp); N.requestPerm("location"); }
}
function openFinder(q){
  var p=zonePoint();
  var go2=function(){ N.openMaps(q, S.lat!=null?S.lat:p[0], S.lon!=null?S.lon:p[1]); };
  if(S.lat==null && N.hasPerm("location")){ var hl=function(r){ off("location",hl); if(!r.error){S.lat=r.lat;S.lon=r.lon;save("ihsan_settings",S);} go2(); }; on("location",hl); N.getLocation(); setTimeout(function(){ if((listeners.location||[]).indexOf(hl)>=0){ off("location",hl); go2(); } },4000); }
  else go2();
}

// QIBLA
var KAABA=[21.4225,39.8262];
function qiblaBearing(lat,lon){ var p1=lat*D2R, p2=KAABA[0]*D2R, dl=(KAABA[1]-lon)*D2R; var b=Math.atan2(Math.sin(dl)*Math.cos(p2), Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl))/D2R; return (b+360)%360; }
function qiblaPoint(){ return overseasNow()?[S.lat,S.lon]:zonePoint(); }
function qiblaDiff(heading, qb){ return ((qb-heading+540)%360)-180; } // signed degrees to turn; |x|<3 counts as facing the Qibla
function qiblaCard(el, compact){
  var p=qiblaPoint(), qb=qiblaBearing(p[0],p[1]);
  var ticks=""; for(var i=0;i<360;i+=10){ var big=i%30===0; ticks+='<line x1="150" y1="'+(big?14:20)+'" x2="150" y2="28" stroke="var(--mut)" stroke-width="'+(big?2:1)+'" transform="rotate('+i+' 150 150)"/>'; }
  var lbl=[["U",0],["T",90],["S",180],["B",270]]; if(S.lang==="en") lbl=[["N",0],["E",90],["S",180],["W",270]];
  var lt=lbl.map(function(l){ return '<text x="150" y="48" fill="'+(l[1]===0?"#e0605a":"var(--fg)")+'" font-size="16" font-weight="700" text-anchor="middle" transform="rotate('+l[1]+' 150 150)">'+l[0]+'</text>'; }).join("");
  el.innerHTML='<div style="text-align:center"><h3>🧭 '+T("qibla")+'</h3><div class="compass'+(compact?" sm":"")+'" id="cmp"><svg viewBox="0 0 300 300" class="dial" id="dial"><circle class="ring" cx="150" cy="150" r="140" fill="var(--well)" stroke="var(--line)" stroke-width="4"/>'+ticks+lt+
  '<g transform="rotate('+qb.toFixed(1)+' 150 150)"><line x1="150" y1="150" x2="150" y2="62" stroke="#c9a646" stroke-width="5" stroke-linecap="round"/><rect x="137" y="40" width="26" height="26" rx="3" fill="#111" stroke="#c9a646" stroke-width="2"/><rect x="137" y="46" width="26" height="4" fill="#c9a646"/></g><circle cx="150" cy="150" r="7" fill="#c9a646"/></svg>'+
  '<div class="needle">▲</div></div><div style="font-size:28px;font-weight:300" id="qDeg">'+qb.toFixed(1)+'°</div><div class="mut small">'+(S.lang==="en"?"Qibla bearing from true north":"Arah kiblat dari utara benar")+' · '+(S.lat!=null?(S.lang==="en"?"from your location":"dari lokasi anda"):(S.lang==="en"?"from zone centre":"dari pusat zon"))+'</div><div class="mut small" id="qHead" style="margin-top:6px"></div>'+
  '<div class="warnbox" id="qCal" style="display:none">'+(S.lang==="en"?"Low compass accuracy. Move the phone in a figure-of-eight, away from metal and magnets.":"Ketepatan kompas rendah. Gerakkan telefon dalam bentuk angka 8, jauh dari logam dan magnet.")+'</div>'+
  '<div class="btns" style="margin-top:10px"><button class="btn alt" id="qLoc">📍 '+(S.lang==="en"?"Use my location":"Guna lokasi saya")+'</button><button class="btn alt" id="qCamB">📷 '+(S.lang==="en"?"Camera view":"Paparan kamera")+'</button></div><div class="mut small" style="margin-top:10px">'+(S.lang==="en"?"Lay the phone flat. When the gold Kaabah marker is at the top arrow, you are facing the Qibla.":"Letakkan telefon mendatar. Apabila penanda Kaabah emas berada di anak panah atas, anda menghadap kiblat.")+'</div></div>';
  el.querySelector("#qLoc").onclick=function(){ askLocation(false); };
  el.querySelector("#qCamB").onclick=function(){ openQiblaCam(); };
  var dial=el.querySelector("#dial"), cmp=el.querySelector("#cmp"), last=null, rot=0;
  var hh=function(r){ if(view!=="solat" || !document.body.contains(dial)){ off("heading",hh); return; } if(qcamOn) return; if(r.error){ el.querySelector("#qHead").textContent=S.lang==="en"?"No compass sensor on this phone":"Tiada sensor kompas pada telefon ini"; return; }
    var target=-r.deg; if(last!==null){ var d=((target-last+540)%360)-180; rot+=d; } else rot=target; last=target;
    dial.style.transform="rotate("+rot+"deg)";
    var diff=Math.abs(qiblaDiff(r.deg,qb)); cmp.classList.toggle("ok", diff<3);
    if(diff<3 && !hh._v){ hh._v=true; N.vibrate(40);} if(diff>6) hh._v=false;
    el.querySelector("#qHead").textContent=(S.lang==="en"?"Phone heading ":"Arah telefon ")+Math.round(r.deg)+"° · "+(diff<3?(S.lang==="en"?"✓ Facing Qibla":"✓ Menghadap kiblat"):(Math.round(diff)+"°"));
    el.querySelector("#qCal").style.display = r.acc<2 ? "block":"none"; };
  on("heading", hh); N.startCompass(p[0],p[1]);
}

// RAKAAT
var RAK={subuh:2,zohor:4,asar:4,maghrib:3,isyak:4,jumaat:2};
// 0.19.0: on Friday Zohor is shown as Jumaat, and the counter's Jumaat chip is 2 rakaat (Zohor 4 stays as a second chip)
function isFri(t){ return (t?new Date(t):new Date()).getDay()===5; }
function prN(k, t){ return k==="zohor" && isFri(t) ? T("jumaat") : T(k); }
var rk = {solat:null};
var SUNAT=[["sunat2",[2],"Sunat 2","Sunnah 2"],["t8",[8,3],"Tarawih 8+3","Tarawih 8+3"],["t20",[20,3],"Tarawih 20+3","Tarawih 20+3"]];
function rkPhases(){ if(rk.solat==="custom") return [rk.customN||2]; for(var i=0;i<SUNAT.length;i++) if(SUNAT[i][0]===rk.solat) return SUNAT[i][1]; return [RAK[rk.solat]||4]; }
function rkName(){ if(rk.solat==="custom") return rk.customName||"Sunat"; if(rk.solat==="sunat2" && inDhuha()) return "Dhuha"; for(var i=0;i<SUNAT.length;i++) if(SUNAT[i][0]===rk.solat) return SUNAT[i][S.lang==="en"?3:2]; return T(rk.solat); }
function rkTarget(){ return rkPhases().reduce(function(a,b){return a+b;},0); }
function chipsRow(label, items){ return '<div class="opt"><span class="ol">'+label+'</span><div class="chips">'+items+'</div></div>'; }
function rakaatSetup(){
  if(!rk.solat || (rk.solat==="custom" && !rk.keep)){ rk.solat=inDhuha()?"sunat2":currentPrayer(); if(rk.solat==="zohor" && isFri()) rk.solat="jumaat"; }
  if(rk.solat==="jumaat" && !isFri()) rk.solat="zohor";
  if(rk.solat==="sunat") rk.solat="sunat2";
  var target=rkTarget(), en=S.lang==="en";
  var seg=function(attr,cur,opts){ return '<span class="seg">'+opts.map(function(o){ return '<button class="'+(String(cur)===String(o[0])?"on":"")+'" '+attr+'="'+o[0]+'"'+(o[2]?' style="'+o[2]+'"':'')+'>'+o[1]+'</button>'; }).join("")+'</span>'; };
  var row=function(label,ctl){ return '<div class="rrow"><span>'+label+'</span>'+ctl+'</div>'; };
  var html='<div class="card rk"><div class="row"><h3 style="margin:0">'+T("rakaat")+'</h3></div>';
  // 0.5.69 (owner): Dhuha sits in its place (after Subuh) during its time; Tarawih shows only in Ramadan
  var hNow=hijriOf(new Date()), ramNow=!!(hNow && hNow.m===9) || !!S.ramadanForce, dhNow=inDhuha();
  var sunL=SUNAT.filter(function(x){ return x[0]==="sunat2" ? !dhNow : (ramNow || rk.solat===x[0]); });
  var dhChip=dhNow?'<button class="chip rkDh '+(rk.solat==="sunat2"?"on":"")+'" data-s="sunat2">☀️ Dhuha <b>2</b></button>':'';
  html+='<div class="chips rksel">'+(isFri()?["subuh","jumaat","zohor","asar","maghrib","isyak"]:PR).map(function(k){ return '<button class="chip '+(rk.solat===k?"on":"")+'" data-s="'+k+'">'+T(k)+' <b>'+RAK[k]+'</b></button>'+(k==="subuh"?dhChip:""); }).join("")+
    sunL.map(function(x){ return '<button class="chip '+(rk.solat===x[0]?"on":"")+'" data-s="'+x[0]+'">'+(en?x[3]:x[2])+'</button>'; }).join("")+
    (musafirNow()?["zohor","asar","isyak"].map(function(k){ return '<button class="chip '+(rk.solat==="custom"&&rk.customName===T(k)+" (qasar)"?"on":"")+'" data-qasar="'+k+'">'+T(k)+' <b>2</b> qasar</button>'; }).join(""):'')+'</div>';
  html+=rkBanner(target);
  html+='<div class="rkday"><div class="mut tiny">'+(en?"Today (rakaat counter)":"Hari ini (kiraan rakaat)")+'</div>'+prRegister(ymd(new Date()), true)+'</div>';
  return html+'</div>';
}
// 0.34.0 (Farah): the counter settings left the Rakaat page and live in Tetapan › Kiraan rakaat
function rkSetCard(){
  var en=S.lang==="en", dsel=S.rdisp==="dots"?"dots":S.rdisp==="lines"?"lines":(S.rnum==="arabic"?"ar":"lat");
  var seg=function(attr,cur,opts){ return '<span class="seg">'+opts.map(function(o){ return '<button class="'+(String(cur)===String(o[0])?"on":"")+'" '+attr+'="'+o[0]+'"'+(o[2]?' style="'+o[2]+'"':'')+'>'+o[1]+'</button>'; }).join("")+'</span>'; };
  var row=function(label,ctl){ return '<div class="rrow"><span>'+label+'</span>'+ctl+'</div>'; };
  return '<div class="card cmp" id="rkSetC"><h3>🤲 '+(en?"Counter display":"Paparan kiraan")+'</h3><div class="rkset">'+
      (WEB&&!IOS?'':row(en?"Count by":"Kira dengan", seg("data-m",S.rmode,[["tap","👆 "+T("tap")],["camera","📷 "+T("camera")]])))+
      row(en?"Show as":"Papar", seg("data-dp",dsel,[["lat","123"],["ar","١٢٣","font-family:var(--ar)"],["dots","●●○"],["lines","│╱─"]]))+
      row(en?"Direction":"Arah", seg("data-dir",S.rdir==="down"?"down":"up",[["up","↑ "+(en?"Up":"Naik")],["down","↓ "+(en?"Down":"Turun")]]))+
      row(en?"Brightness":"Kecerahan", seg("data-op",S.rop||1,[[1,"100"],[0.6,"60"],[0.3,"30"],[0.1,"10"]]))+
      row(en?"Sejadah":"Sejadah", '<span class="seg sw3">'+[["black","#1a1a1a"],["green","#0e6b45"],["gold","#c9a646"]].map(function(t){ return '<button class="'+(S.theme===t[0]?"on":"")+'" data-t="'+t[0]+'" title="'+T("t"+t[0])+'"><i style="background:'+t[1]+'"></i></button>'; }).join("")+'</span>')+
      row("🧭 "+(en?"Qibla arrow":"Anak panah kiblat"), sw("rkQibSw",S.rQibla!==false))+
      row("⏱ "+(en?"Show time":"Papar masa"), sw("rkTimeSw",!!S.rTime))+
      '<div class="mut tiny" style="margin:-2px 0 4px">'+(en?"Time is always recorded (from the end of the countdown until you exit) and shown in Time › Stats, even when hidden here.":"Masa sentiasa direkod (dari tamat kiraan mula hingga keluar) dan dipapar dalam Masa › Statistik, walaupun disembunyikan di sini.")+'</div>'+
      '<div class="mut tiny" style="padding-top:6px">'+(S.rmode==="camera"?
       (IOS?(en?"Lay the iPhone / iPad face-up just beyond where your forehead touches, front camera uncovered, in a lit room. Your head darkens the camera in sujud: each sujud counts 0.5.":"Letak iPhone / iPad menghadap ke atas, sedikit di hadapan tempat dahi sujud, kamera depan tidak terlindung, dalam bilik yang terang. Kepala anda menggelapkan kamera semasa sujud: setiap sujud dikira 0.5."):(en?"Phone face-up just beyond where your forehead touches. Each sujud counts 0.5.":"Telefon menghadap ke atas, sedikit di hadapan tempat dahi sujud. Setiap sujud dikira 0.5."))
       :(en?"Tap anywhere to add "+S.tapStep+", hold to undo.":"Ketik di mana-mana untuk tambah "+S.tapStep+", tekan lama untuk undur."))+'</div></div></div>';
}
// 0.34.0 (Farah): the Start button is a banner whose sky follows the time of day of the chosen solat
// (Subuh dawn, Dhuha morning, Zohor midday, Asar afternoon, Maghrib sunset, Isyak night)
function rkTod(){
  var k=rk.solat; if(k==="jumaat") return "zohor"; if(PR.indexOf(k)>=0) return k; if(k==="t8"||k==="t20") return "isyak";
  if(inDhuha()) return "dhuha"; return currentPrayer();
}
var RKSKY={
  subuh:{a:"#16224d",b:"#5a4f8a",c:"#f0a77c",lb:["Fajar menyingsing","Dawn"],tx:"#fff"},
  dhuha:{a:"#3d95d6",b:"#7cc0ee",c:"#d8f0ff",lb:["Pagi","Morning"],tx:"#0b2a45"},
  zohor:{a:"#1f74c9",b:"#4fa6ec",c:"#bfe4ff",lb:["Tengah hari","Midday"],tx:"#0b2a45"},
  asar:{a:"#e58c3c",b:"#f4b765",c:"#fde6b0",lb:["Petang","Afternoon"],tx:"#3b1d05"},
  maghrib:{a:"#2e1846",b:"#b23f69",c:"#f59a45",lb:["Senja","Sunset"],tx:"#fff"},
  isyak:{a:"#070c22",b:"#121d45",c:"#24346b",lb:["Malam","Night"],tx:"#fff"}
};
function rkSkySvg(k){
  var P=RKSKY[k]||RKSKY.zohor, g='<defs><linearGradient id="rkG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+P.a+'"/><stop offset=".55" stop-color="'+P.b+'"/><stop offset="1" stop-color="'+P.c+'"/></linearGradient>'+
    '<radialGradient id="rkS"><stop offset="0" stop-color="#fff8d6"/><stop offset=".45" stop-color="'+(k==="maghrib"?"#ff8a3d":k==="asar"?"#ffc35a":k==="subuh"?"#ffc58a":"#fff1a6")+'"/><stop offset="1" stop-color="#fff1a6" stop-opacity="0"/></radialGradient>'+
    '<mask id="rkM"><rect width="360" height="130" fill="#fff"/><circle cx="228" cy="26" r="15" fill="#000"/></mask></defs>';
  var b='<rect width="360" height="130" fill="url(#rkG)"/>', i;
  var star=function(n, h){ var o=''; for(i=0;i<n;i++){ var x=(i*67+23)%350+5, y=(i*37+11)%h+4, r=(i%3===0)?1.3:0.8; o+='<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#fff" opacity="'+(0.45+(i%4)*0.15)+'"/>'; } return o; };
  if(k==="isyak"){ b+=star(26,80)+'<circle cx="220" cy="30" r="17" fill="#f6efc8" mask="url(#rkM)"/>'; }
  else if(k==="subuh"){ b+=star(12,40)+'<circle cx="250" cy="118" r="46" fill="url(#rkS)"/><circle cx="250" cy="120" r="14" fill="#ffe3b0"/>'; }
  else if(k==="dhuha"){ b+='<circle cx="250" cy="52" r="52" fill="url(#rkS)"/><circle cx="250" cy="52" r="15" fill="#fffbe6"/>'; }
  else if(k==="zohor"){ b+='<circle cx="270" cy="22" r="60" fill="url(#rkS)"/><circle cx="270" cy="22" r="16" fill="#fffef2"/>'; }
  else if(k==="asar"){ b+='<circle cx="292" cy="72" r="56" fill="url(#rkS)"/><circle cx="292" cy="72" r="16" fill="#fff3cf"/>'; }
  else if(k==="maghrib"){ b+='<circle cx="268" cy="112" r="64" fill="url(#rkS)"/><circle cx="268" cy="114" r="22" fill="#ffb067"/>'; }
  if(k==="dhuha"||k==="zohor"||k==="asar") b+='<g fill="#fff" opacity=".55"><ellipse cx="205" cy="24" rx="26" ry="7"/><ellipse cx="224" cy="19" rx="15" ry="8"/><ellipse cx="338" cy="70" rx="22" ry="5"/></g>';
  var sil=k==="isyak"?"#03060f":k==="maghrib"?"#1c0d24":k==="subuh"?"#0e1430":"#0d3b2a", op=(k==="dhuha"||k==="zohor")?".78":".92";
  // masjid silhouette: hills, a main dome, two small domes and two minarets
  b+='<path d="M0 116 Q60 102 120 112 T240 108 T360 112 V130 H0Z" fill="'+sil+'" opacity=".55"/>'+
    '<g transform="translate(92 0)"><g fill="'+sil+'" opacity="'+op+'"><rect x="128" y="96" width="104" height="34"/><path d="M146 97 Q180 52 214 97Z"/><rect x="178" y="58" width="4" height="10"/><path d="M180 50 l3 6 h-6z"/>'+
    '<path d="M128 103 Q140 84 152 103Z"/><path d="M208 103 Q220 84 232 103Z"/>'+
    '<rect x="110" y="62" width="9" height="68"/><path d="M108 62 h13 l-6.5 -14z"/><rect x="241" y="62" width="9" height="68"/><path d="M239 62 h13 l-6.5 -14z"/>'+
    '<rect x="107" y="76" width="15" height="3"/><rect x="238" y="76" width="15" height="3"/></g>'+
    '<g fill="'+(k==="isyak"||k==="maghrib"||k==="subuh"?"#ffd27a":"#ffffff")+'" opacity="'+(k==="isyak"||k==="maghrib"||k==="subuh"?".85":".35")+'"><path d="M172 130 v-14 a8 8 0 0 1 16 0 v14z"/><rect x="140" y="110" width="6" height="9" rx="3"/><rect x="214" y="110" width="6" height="9" rx="3"/></g></g>';
  return '<svg class="rkbsky" viewBox="0 0 360 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+g+b+'</svg>';
}
function rkBanner(target){
  var k=rkTod(), P=RKSKY[k]||RKSKY.zohor, t=getDay(new Date()), en=S.lang==="en";
  var tm=k==="dhuha"?(typeof dhuhaHM==="function"?dhuhaHM(t):""):(t&&t[k]?t[k]:"");
  var when=L2x(P.lb[0],P.lb[1])+(tm?" · "+fmt12(tm):"");
  return '<button class="rkban rb-'+k+'" id="rkStart" style="color:'+P.tx+'">'+rkSkySvg(k)+
    '<span class="rbt"><span class="rbw">'+esc(when)+'</span><b class="rbn">'+esc(rkName())+'</b><span class="rbr">'+(rkPhases().length>1?rkPhases().join(" + "):target)+' rakaat</span></span>'+
    '<span class="rbgo">▶ '+T("start")+'</span></button>';
}
function bindRkSet(c){
  if(!c) return;
  c.querySelectorAll("[data-dir]").forEach(function(b){ b.onclick=function(){ S.rdir=b.getAttribute("data-dir"); saveS(); pushSchedule(); render(); }; });
  c.querySelectorAll("[data-m]").forEach(function(b){ b.onclick=function(){ S.rmode=b.getAttribute("data-m"); saveS(); render(); }; });
  c.querySelectorAll("[data-t]").forEach(function(b){ b.onclick=function(){ S.theme=b.getAttribute("data-t"); saveS(); render(); }; });
  c.querySelectorAll("[data-dp]").forEach(function(b){ b.onclick=function(){ var v=b.getAttribute("data-dp"); if(v==="dots"||v==="lines") S.rdisp=v; else { S.rdisp="ring"; S.rnum = v==="ar" ? "arabic" : "latin"; } saveS(); render(); }; });
  c.querySelectorAll("[data-op]").forEach(function(b){ b.onclick=function(){ S.rop=+b.getAttribute("data-op"); saveS(); render(); }; });
  var qs=c.querySelector("#rkQibSw"); if(qs) qs.onchange=function(){ S.rQibla=this.checked; saveS(); };
  var tsw=c.querySelector("#rkTimeSw"); if(tsw) tsw.onchange=function(){ S.rTime=this.checked; saveS(); };
}
function bindRakaat(el){
  el.querySelectorAll("[data-s]").forEach(function(b){ b.onclick=function(){ rk.solat=b.getAttribute("data-s"); rk.keep=false; render(); }; });
  el.querySelectorAll("[data-qasar]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-qasar"); rk.solat="custom"; rk.customN=2; rk.customName=T(k)+" (qasar)"; rk.keep=true; render(); }; });
  var rs=el.querySelector(".rksel .on"); if(rs) setTimeout(function(){ rs.parentNode.scrollLeft=Math.max(0,rs.offsetLeft-rs.parentNode.offsetLeft-80); },0);
  el.querySelectorAll("[data-nm]").forEach(function(b){ b.onclick=function(){ S.rnum=b.getAttribute("data-nm"); saveS(); pushSchedule(); render(); }; });
  el.querySelector("#rkStart").onclick=function(){
    var target=rkTarget();
    if(S.rmode==="camera" && !N.hasPerm("camera")){ var hp=function(p){ if(p.which!=="camera") return; off("perm",hp); if(p.granted) startPraying(target); else toast(S.lang==="en"?"Camera permission needed, or use tap mode":"Perlu kebenaran kamera, atau guna mod ketik"); }; on("perm",hp); N.requestPerm("camera"); }
    else startPraying(target);
  };
}
function themeSvg(t){
  if(t==="black") return '';
  var c = t==="green" ? "#ffffff" : "#c9a646", o = t==="green" ? 0.9 : 0.85, bg2 = t==="green" ? "#0e6b45" : "#0d0d0d";
  var pat='<pattern id="p'+t+'" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="'+bg2+'"/><path d="M20 2 L38 20 L20 38 L2 20 Z" fill="none" stroke="'+c+'" stroke-opacity=".18" stroke-width="1.2"/><circle cx="20" cy="20" r="4" fill="none" stroke="'+c+'" stroke-opacity=".22"/></pattern>';
  var border='<pattern id="b'+t+'" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="none"/><path d="M12 1 L23 12 L12 23 L1 12 Z" fill="'+c+'" fill-opacity=".55"/></pattern>';
  return '<svg class="mihrab" viewBox="0 0 360 640" preserveAspectRatio="none"><defs>'+pat+border+'</defs><rect width="360" height="640" fill="url(#p'+t+')"/>'+
   '<rect x="8" y="8" width="344" height="624" fill="none" stroke="url(#b'+t+')" stroke-width="16"/><rect x="22" y="22" width="316" height="596" fill="none" stroke="'+c+'" stroke-opacity="'+o+'" stroke-width="2"/>'+
   '<path d="M70 600 L70 230 Q70 120 180 70 Q290 120 290 230 L290 600" fill="none" stroke="'+c+'" stroke-opacity="'+o+'" stroke-width="3"/>'+
   '<path d="M88 600 L88 236 Q88 140 180 96 Q272 140 272 236 L272 600" fill="none" stroke="'+c+'" stroke-opacity=".5" stroke-width="1.5"/>'+
   '<circle cx="180" cy="150" r="10" fill="none" stroke="'+c+'" stroke-opacity="'+o+'" stroke-width="2"/></svg>';
}
var AR_DIG="٠١٢٣٤٥٦٧٨٩";
function num(n){ var s=(Math.round(n*2)/2).toString(); if(S.rnum==="arabic") s=s.replace(/\d/g,function(d){return AR_DIG[+d];}).replace(".","٫"); return s; }
// 0.17.0 "Ayat in your solat": the surah picked for rakaat 1 and 2 shows under the counter
function qsolatLine(r){ var Q=load("ihsan_qsolat",{on:false,r:[]}); if(!Q.on || r>2) return ""; var x=(Q.r||[])[r-1]; if(!x) return "";
  return '<div class="qsl"><small>'+L2x("Rakaat ","Rakaat ")+r+' · '+esc(x[1])+'</small><span dir="rtl">'+esc(x[2])+'</span></div>'; }
function startPraying(target){
  var ov=document.getElementById("overlay"), cam=S.rmode==="camera", bars=false, lines=S.rdisp==="lines", dots=S.rdisp==="dots"||lines, down=S.rdir==="down", phases=rkPhases();
  var col = S.theme==="gold"?"#c9a646":S.theme==="green"?"#ffffff":"#5a5a5a";
  ov.className="theme-"+S.theme; try{ if(N.setBars) N.setBars("#000000", false); }catch(e){}   // 0.5.98 (owner): the phone's top bar is black while praying, whatever the app theme
  ov.innerHTML='<div class="pray">'+themeSvg(S.theme)+'<div class="pmid" id="pMid"></div><div class="sub" id="pSub" style="position:relative;min-height:22px"></div>'+
   '<button class="close" id="pClose" aria-label="close">✕</button>'+(S.rTime?'<div class="ptime" id="pTime">0:00</div>':'')+(cam&&!dots?'<div class="dot" id="pDot"></div>':'')+'<div class="stat" id="pStat"></div>'+
   '<div class="ptop">'+(dots?'<div class="dtop'+(lines?' dlines':'')+'" id="pDots"></div>':'')+(S.rQibla!==false?'<div class="qarrow" id="pQ"><svg viewBox="0 0 24 60" width="16" height="40"><path d="M12 2 L12 58 M12 2 L6 12 M12 2 L18 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="qcal" id="pQc">∞ '+(S.lang==="en"?"calibrate":"kalibrasi")+'</div>':'')+'</div></div>';
  var count=0, doneAt=0, settle=cam?3:0, history=[], builtPhase=-1, tStart=cam?0:Date.now(), waktu=curWaktu(), sName=rkName(), sKey=rk.solat, qKey=rk.solat==="custom"&&/qasar/.test(rk.customName||"")?(["zohor","asar","isyak"].filter(function(k){ return (rk.customName||"").indexOf(T(k))===0; })[0]||null):null;
  var ptEl=ov.querySelector("#pTime"); if(ptEl) ptEl.style.opacity=Math.max(0.35,S.rop||1);
  var subEl=ov.querySelector("#pSub"), stat=ov.querySelector("#pStat"), midEl=ov.querySelector("#pMid");
  midEl.style.opacity=S.rop||1; if(ov.querySelector("#pDots")) ov.querySelector("#pDots").style.opacity=S.rop||1;
  N.keepScreenOn(true, cam?0.05:0.1);
  if(S.quietPray && N.quiet) N.quiet(true);
  // Small qibla arrow: points to the Qibla, turns green with a 1 s buzz when the phone faces it exactly.
  // Uses the same bearing, sensor reading and 3° "facing" rule as the Qibla compass on the Solat page.
  var qp=qiblaPoint(), qbr=qiblaBearing(qp[0],qp[1]), qEl=ov.querySelector("#pQ"), qCal=ov.querySelector("#pQc"), qOk=false, qRot=null;
  var qh=function(r){ if(!qEl) return; if(r.error){ qEl.style.display="none"; return; } var d=qiblaDiff(r.deg,qbr);
    qRot = qRot===null ? d : qRot+(((d-qRot)%360+540)%360-180); qEl.style.transform="rotate("+qRot.toFixed(1)+"deg)";
    var ok=Math.abs(d)<3; qEl.classList.toggle("ok",ok); if(ok && !qOk){ qOk=true; N.vibrate(1000); } if(Math.abs(d)>6) qOk=false;
    if(qCal) qCal.style.visibility = r.acc<2 ? "visible" : "hidden"; };
  if(qEl){ on("heading",qh); N.startCompass(qp[0],qp[1]); }
  function phaseInfo(){ var c=count; for(var i=0;i<phases.length;i++){ if(c<phases[i] || i===phases.length-1) return {i:i, n:phases[i], c:Math.min(c,phases[i])}; c-=phases[i]; } }
  function build(ph){
    var n=ph.n, lbl = phases.length>1 ? '<div class="phl">'+(ph.i===phases.length-1?"Witir":"Tarawih")+'</div>' : '';
    if(bars){
      var gap = n>10?5:12, bw=Math.max(6, Math.min(30, Math.floor(300/n)-gap));
      var m=lbl+'<div class="bars" style="gap:'+gap+'px">'; for(var i=0;i<n;i++) m+='<div class="rb" style="width:'+bw+'px;border-color:'+col+'"><div class="rf" style="background:'+col+'"></div></div>'; midEl.innerHTML=m+'</div>';
    } else {
      midEl.innerHTML='<svg width="300" height="300" viewBox="0 0 300 300" style="position:absolute"><circle cx="150" cy="150" r="130" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/><circle id="pRing" cx="150" cy="150" r="130" fill="none" stroke="'+(S.theme==="black"?"#3d3d3d":col)+'" stroke-width="10" stroke-linecap="round" transform="rotate(-90 150 150)" stroke-dasharray="816.8" stroke-dashoffset="816.8"/></svg>'+lbl+
        '<div class="big" id="pBig" style="position:relative"></div><div class="of" style="position:relative">'+(down?'':'/ '+num(n))+'</div>';
    }
    builtPhase=ph.i;
  }
  function updDots(){
    var de=ov.querySelector("#pDots"), done=count>=target, ph=done?{n:phases[phases.length-1],c:phases[phases.length-1],i:phases.length-1}:phaseInfo();
    var oc = "#ffffff", h="";
    for(var i=0;i<ph.n;i++){
      var f = done ? 1 : (down ? Math.max(0,Math.min(1,(ph.n-ph.c)-i)) : Math.max(0,Math.min(1,ph.c-i)));
      var bg = f>=1 ? "#fff" : f>0 ? "linear-gradient(90deg,#fff 50%,transparent 50%)" : "transparent";
      if(lines) h+='<span class="dl"><i style="transform:rotate('+Math.round(f*90)+'deg)"></i></span>';
      else h+='<span class="dd" style="border-color:'+oc+';background:'+bg+'"></span>';
    }
    if(done) h+='<svg class="dtick" viewBox="0 0 100 100"><path d="M18 54 L40 76 L84 28" fill="none" stroke="#2ecc71" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if(settle>0){ var sc=settle>=3?"#e0605a":(settle===2?"#f1c40f":"#2ecc71"); h+='<div class="dset">'; for(var j=0;j<settle;j++) h+='<span style="background:'+sc+'"></span>'; h+='</div>'; }
    if(lines) de.style.setProperty("--dl", Math.max(12,Math.min(32,Math.floor(224/ph.n)))+"px");
    de.innerHTML=h; midEl.innerHTML=""; subEl.innerHTML="";
  }
  function upd(){
    if(dots){ updDots(); return; }
    if(count>=target){
      midEl.innerHTML='<svg width="170" height="170" viewBox="0 0 100 100"><path d="M22 52 L42 72 L80 30" fill="none" stroke="'+(S.theme==="black"?"#2ecc71":col)+'" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      subEl.innerHTML=""; builtPhase=-2; return;
    }
    var ph=phaseInfo(); if(ph.i!==builtPhase) build(ph);
    var frac = down ? (ph.n-ph.c)/ph.n : ph.c/ph.n;
    if(bars){ var fills=midEl.querySelectorAll(".rf"); for(var i=0;i<fills.length;i++){ var f = down ? Math.max(0,Math.min(1,(ph.n-ph.c)-i)) : Math.max(0,Math.min(1,ph.c-i)); fills[i].style.height=(f*100)+"%"; } }
    else { midEl.querySelector("#pBig").textContent=num(down?ph.n-ph.c:ph.c); midEl.querySelector("#pRing").setAttribute("stroke-dashoffset",(816.8*(1-frac)).toFixed(1)); }
    if(settle>0){ var c2=settle>=3?"#e0605a":(settle===2?"#f1c40f":"#2ecc71"), dh=""; for(var j=0;j<settle;j++) dh+='<span style="display:inline-block;width:12px;height:12px;border-radius:50%;margin:0 4px;background:'+c2+'"></span>'; subEl.innerHTML=dh; }
    else subEl.innerHTML=qsolatLine(Math.floor(ph.c)+1);
  }
  function add(step){
    if(count>=target) return;
    var before=phaseInfo().i;
    count=Math.min(target, count+step); history.push(step);
    if(S.vib) N.vibrate(count%1===0?120:50);
    if(count<target && phaseInfo().i!==before) N.vibrate(400);
    if(count>=target) doneAt=Date.now();
    upd();
  }
  function undo(){ if(!history.length || count>=target) return; count=Math.max(0,count-history.pop()); upd(); N.vibrate(30); }
  var st=setInterval(function(){ if(settle>0){ settle--; if(settle===0 && !tStart) tStart=Date.now(); upd(); } if(ptEl) ptEl.textContent=tStart?cdStr(Date.now()-tStart):"0:00"; },1000);
  var hs=function(r){ var dot=ov.querySelector("#pDot");
    if(r.type==="down"){ if(settle>0) return; if(doneAt) return; add(0.5); if(dot) dot.style.background="#c9a646"; }
    else if(r.type==="up"){ if(dot) dot.style.background="#2ecc71"; }
    else if(r.type==="error"){ toast((S.lang==="en"?"Camera error: ":"Ralat kamera: ")+r.error); } };
  var hst=function(r){ if(S.showStat) stat.textContent="face "+(r.face||0).toFixed(2)+" / "+S.sujud.threshold.toFixed(2)+" · light "+Math.round(r.luma)+"/"+Math.round(r.base)+" · prox "+(r.prox?"near":"far")+(r.faceHw?"":" · no hw face"); };
  if(cam){ on("sujud",hs); on("sujudStatus",hst); N.startSujud(JSON.stringify({threshold:S.sujud.threshold, face:S.sujud.face, light:S.sujud.light, prox:S.sujud.prox})); }
  var pressT=null, longP=false, pray=ov.querySelector(".pray");
  pray.addEventListener("touchstart", function(e){ if(e.target.id==="pClose") return; longP=false; pressT=setTimeout(function(){ longP=true; undo(); },700); }, {passive:true});
  pray.addEventListener("touchend", function(e){ if(e.target.id==="pClose") return; clearTimeout(pressT); if(!longP && !cam && settle<=0) add(S.tapStep); e.preventDefault(); });
  pray.addEventListener("click", function(e){ if(e.target.id==="pClose") return; if(!("ontouchstart" in window) && !cam) add(S.tapStep); });
  function finish(){ clearInterval(st); try{ applyTheme(); }catch(e){}
    if(tStart){ var sec=Math.round((Date.now()-tStart)/1000); if(sec>=5) plogAdd({d:ymd(new Date(tStart)), s:sKey, q:qKey, n:sName, w:waktu, t0:tStart, sec:sec, c:count, tg:target}); } if(N.quiet) N.quiet(false); if(qEl){ off("heading",qh); N.stopCompass(); } if(cam){ off("sujud",hs); off("sujudStatus",hst); N.stopSujud(); } N.keepScreenOn(false,-1); applyTheme(); closeOverlay(); render(); if(count>=target && !S.kidLock) setTimeout(myDoaRemind, 350); }
  ov.querySelector("#pClose").onclick=function(e){ e.stopPropagation(); finish(); };
  ov._close=finish;
  upd();
}
// ZIKIR
var zstate=load("ihsan_zstate",{});
function trToggle(){ return ''; }
function trToggleOld(){ return '<label class="trt"><span>'+(S.lang==="en"?"Meaning":"Maksud")+'</span><span class="switch sm"><input type="checkbox" id="trT" '+(S.showTr?"checked":"")+'><span></span></span></label>'; }
function bindTrToggle(el){ var t=el.querySelector("#trT"); if(t) t.onchange=function(){ S.showTr=this.checked; save("ihsan_settings",S); applyFont(); }; }
var zScroll=null;
function vZikir(el){
  var tabs=[["tasbih","tasbih"],["after","after"],["asma","asma"],["mine",L2x("Zikir saya","My zikir")]], keys=tabs.map(function(t){return t[0];});
  el.innerHTML='<div class="dock"><div class="grp3 g4">'+tabs.map(function(t){return '<button class="chip '+(sub.zikir===t[0]?"on":"")+'" data-z="'+t[0]+'">'+(t[0]==="mine"?esc(t[1]):T(t[1]))+'</button>';}).join("")+'</div></div><div class="hpager" id="hp"><div class="hpage" id="pg0"></div><div class="hpage" id="pg1"></div><div class="hpage" id="pg2"></div><div class="hpage" id="pg3"></div></div>';
  bindTrToggle(el);
  var hp=el.querySelector("#hp");
  zTasbih(el.querySelector("#pg0")); zAfter(el.querySelector("#pg1")); zAsma(el.querySelector("#pg2")); zMine(el.querySelector("#pg3"));
  var idx = Math.max(0, keys.indexOf(sub.zikir));
  hp.scrollLeft = idx*hp.clientWidth;
  var pages=[el.querySelector("#pg0"), el.querySelector("#pg1"), el.querySelector("#pg2"), el.querySelector("#pg3")];
  function fitH(){ var pg=pages[Math.max(0,keys.indexOf(sub.zikir))]; if(pg) hp.style.height=pg.scrollHeight+"px"; }
  if(window.ResizeObserver){ var ro=new ResizeObserver(fitH); pages.forEach(function(pg){ ro.observe(pg); }); }
  fitH(); setTimeout(fitH,400);
  function mark(){ var k=Math.round(hp.scrollLeft/Math.max(1,hp.clientWidth)); sub.zikir=keys[k]||"tasbih"; fitH(); if(N.setVolumeKeys) N.setVolumeKeys(sub.zikir==="tasbih" && S.volTasbih); el.querySelectorAll("[data-z]").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-z")===sub.zikir); }); }
  hp.addEventListener("scroll", function(){ clearTimeout(zScroll); zScroll=setTimeout(mark,80); }, {passive:true});
  el.querySelectorAll("[data-z]").forEach(function(b){ b.onclick=function(){ var k=keys.indexOf(b.getAttribute("data-z")); hp.scrollTo({left:k*hp.clientWidth, behavior:"smooth"}); }; });
  // 0.36.0: ◀ ▶ arrows move the Zikir pages too
  var zi=function(){ return Math.round(hp.scrollLeft/Math.max(1,hp.clientWidth)); };
  ibArrPager({el:hp, can:function(s){ var k=zi()-s; return k>=0 && k<keys.length; }, go:function(s){ var k=zi()-s; if(k>=0 && k<keys.length) hp.scrollTo({left:k*hp.clientWidth, behavior:"smooth"}); }});
  hp.addEventListener("scroll", function(){ clearTimeout(hp._at); hp._at=setTimeout(ibArr,120); }, {passive:true});
  if(N.setVolumeKeys) N.setVolumeKeys(sub.zikir==="tasbih" && S.volTasbih);
}
function catName(c){ var p=c.cat.split(" / "); return S.lang==="en" ? (p[1]||p[0]) : p[0]; }
function vDoa(el){
  var g=doaGroupOf(doaCat);
  var html='<div class="dsearch"><input id="dq" type="search" placeholder="🔍 '+(S.lang==="en"?"Search: travel, sick, exam, rain, angry...":"Cari: musafir, sakit, periksa, hujan, marah...")+'" value="'+esc(doaQ)+'"><button class="chip '+(doaFav?"on":"")+'" id="dFav">★</button><button class="chip '+(doaMine?"on":"")+'" id="dMine">🤲 '+L2x("Doa saya","My doa")+'</button></div>';
  var subs=DOA_GROUPS[g][2], cols=Math.ceil(subs.length/2), GIC=["🏠","💼","💚"];
  html+='<div class="dock" id="dTabs" style="'+(doaQ||doaFav||doaMine?"display:none":"")+'">'+
    '<div class="dsubs dsubs12" style="grid-template-columns:repeat('+cols+',minmax(29%,1fr))">'+subs.map(function(i){return '<button class="dsub '+(doaCat===i?"on":"")+'" data-c="'+i+'">'+esc(catName(DOA[i]))+'</button>';}).join("")+'</div>'+
    '<div class="dgrps">'+DOA_GROUPS.map(function(x,i){return '<button class="dgrp '+(g===i?"on":"")+'" data-g="'+i+'"><span>'+GIC[i]+'</span>'+(S.lang==="en"?x[1]:x[0])+'</button>';}).join("")+'</div></div><div id="zv"></div>';
  el.innerHTML=html; bindTrToggle(el);
  el.querySelectorAll("[data-g]").forEach(function(b){ b.onclick=function(){ doaCat=DOA_GROUPS[+b.getAttribute("data-g")][2][0]; render(); }; });
  el.querySelectorAll("[data-c]").forEach(function(b){ b.onclick=function(){ doaCat=+b.getAttribute("data-c"); render(); }; });
  var zv=el.querySelector("#zv"), dq=el.querySelector("#dq");
  function show(){ var tabs=el.querySelector("#dTabs"); tabs.style.display=(doaQ||doaFav||doaMine)?"none":""; dockFix(); if(doaQ) doaSearch(zv, doaQ); else if(doaMine) myDoaPage(zv); else if(doaFav) doaFavList(zv); else zDaily(zv); }
  dq.oninput=function(){ doaQ=dq.value.trim(); show(); };
  el.querySelector("#dFav").onclick=function(){ doaFav=!doaFav; doaMine=false; doaQ=""; render(); };
  el.querySelector("#dMine").onclick=function(){ doaMine=!doaMine; doaFav=false; doaQ=""; render(); };
  show();
}
function vMathurat(el){
  if(mathEvening===null){ var h=new Date().getHours(); mathEvening = h>=12; }
  el.innerHTML='<div class="dock"><div class="tabrow"><div class="chips"><button class="chip '+(!mathEvening?"on":"")+'" data-e="0">☀️ '+T("pagi")+'</button><button class="chip '+(mathEvening?"on":"")+'" data-e="1">🌙 '+T("petang")+'</button></div><label class="trt"><span>↔</span><span class="switch sm"><input type="checkbox" id="mH" '+(S.mathH?"checked":"")+'><span></span></span></label>'+trToggle()+'</div></div><div id="zv"></div>';
  bindTrToggle(el);
  el.querySelector("#mH").onchange=function(){ S.mathH=this.checked; save("ihsan_settings",S); zMathurat(el.querySelector("#zv")); };
  el.querySelectorAll("[data-e]").forEach(function(b){ b.onclick=function(){ mathEvening=b.getAttribute("data-e")==="1"; render(); }; });
  zMathurat(el.querySelector("#zv"));
}
var sunCat="rutin", sunTop="solat", sunOpen=null;
function vSunat0(el){
  var en=S.lang==="en", L2=function(o){ return o ? (en?o.en:o.ms) : ""; };
  var td=getDay(new Date()), addm=function(hm,m){ if(!hm) return "--"; var p=hm.split(":"), t=+p[0]*60+(+p[1])+m; return fmt12(pad(Math.floor(t/60))+":"+pad(t%60)); };
  // 0.9.1: level 2 (Solat, Puasa...) and level 3 (Harian & rutin...) sit at the top; level 1 (Zikir/Doa/Ma'thurat/Amal) stays at the bottom.
  var TOPIC={solat:"🕌",puasa:"🍽",sedekah:"💝",bersuci:"💧",haji:"🕋",lain:"✨"};
  var dock='';
  var html='<div class="amhdr"><div class="lv2">'+SUNAT_TOP.map(function(c){ return '<button class="'+(sunTop===c[0]?"on":"")+'" data-st="'+c[0]+'"><span>'+(TOPIC[c[0]]||"•")+'</span>'+(en?c[2]:c[1])+'</button>'; }).join("")+'</div>'+
    (sunTop==="solat"?'<div class="lv3">'+SUNAT_CATS.map(function(c){ return '<button class="'+(sunCat===c[0]?"on":"")+'" data-sc="'+c[0]+'">'+(en?c[2]:c[1])+'</button>'; }).join("")+'</div>':'')+'</div>';
  if(sunTop==="solat") html+='<div class="card forb"><h3>⛔ '+(en?"Forbidden times for sunnah prayers (today)":"Waktu dilarang solat sunat (hari ini)")+'</h3>'+
    '<div class="fr"><span>'+(en?"After Subuh until the sun has risen":"Selepas solat Subuh hingga matahari naik")+'</span><b>'+addm(td.subuh,0)+' – '+addm(td.syuruk,15)+'</b></div>'+
    '<div class="fr"><span>'+(en?"When the sun is at its zenith (istiwa')":"Ketika matahari tegak (istiwa')")+'</span><b>~'+addm(td.zohor,-10)+' – '+addm(td.zohor,0)+'</b></div>'+
    '<div class="fr"><span>'+(en?"After Asar until sunset":"Selepas solat Asar hingga terbenam matahari")+'</span><b>'+addm(td.asar,0)+' – '+addm(td.maghrib,0)+'</b></div>'+
    '<div class="mut small" style="margin-top:6px;line-height:1.45">'+(en?"In the Shafi'i school, prayers with a reason that comes before or with them (e.g. Tahiyyatul Masjid, after wudhu, eclipse, qada') remain allowed. The zenith time shown is an estimate.":"Dalam mazhab Syafi'i, solat yang mempunyai sebab yang mendahului atau bersamanya (cth. Tahiyyatul Masjid, sunat wuduk, gerhana, qada') tetap dibenarkan. Waktu istiwa' adalah anggaran.")+'</div>'+
    '<div class="src">'+srcHtml("Sahih Muslim 831; Sahih al-Bukhari 586")+'</div></div>';
  SUNAT_LIST.filter(function(x){ return x.top===sunTop && (sunTop!=="solat" || x.cat===sunCat); }).forEach(function(x){
    var open=sunOpen===x.id, rk=x.n.length>1 ? x.n[0]+"–"+x.n[x.n.length-1] : x.n[0];
    html+='<div class="card sn lvl3"><div class="row snh" data-so="'+x.id+'"><h3 style="margin:0">'+esc(L2(x.name))+'</h3><span class="row" style="gap:6px">'+(x.n.length?'<span class="badge">'+rk+' rakaat</span>':'')+'<span class="mut">'+(open?"▴":"▾")+'</span></span></div>';
    if(open){
      if(x.niat && x.niat.length){ html+='<div class="snf niatbox"><div class="snl">'+(en?"Intention (niat)":"Niat")+'</div>'+x.niat.map(function(nt){ return (nt.label?'<div class="mut small" style="margin-top:6px">'+esc(L2(nt.label))+'</div>':'')+'<div class="ar" style="font-size:calc(var(--arsize) - 2px);line-height:1.9">'+nt.ar+'</div>'+rumiDiv(nt.ar)+'<div class="tr">'+esc(L2(nt))+'</div>'; }).join("")+'</div>'; }
      [["what",en?"What":"Apa"],["why",en?"Why":"Mengapa"],["how",en?"How":"Cara"],["when",en?"When":"Bila"]].forEach(function(f){ html+='<div class="snf"><div class="snl">'+f[1]+'</div><div>'+glz(esc(L2(x[f[0]])))+'</div></div>'; });
      if(x.steps) html+='<div class="snf"><div class="snl">'+(en?"Readings, step by step":"Bacaan & cara, langkah demi langkah")+'</div>'+x.steps.map(function(stp){ return '<div class="jstep"><div class="jt">'+esc(L2(stp.t))+'</div><div class="ar" style="font-size:calc(var(--arsize) - 2px);line-height:1.9">'+stp.ar+'</div>'+rumiDiv(stp.ar)+'<div class="tr">'+esc(L2(stp.tr))+'</div><div class="src" style="margin:4px 0 0">'+srcHtml(stp.src)+'</div></div>'; }).join("")+'</div>';
      html+='<div class="snf"><div class="snl">'+(en?"Source":"Sumber")+'</div><div class="src" style="margin:0">'+srcHtml(x.src)+'</div></div>';
      if(x.note) html+='<div class="warnbox" style="margin:8px 0 0">'+glz(esc(L2(x.note)))+'</div>';
      if(x.id==="istikharah"||x.id==="hajat") html+='<button class="btn alt full" style="margin-top:8px" data-guide="'+x.id+'">📘 '+(en?"Step-by-step guide with doa":"Panduan langkah demi langkah & doa")+'</button>';
      if(x.n.length) html+='<div class="btns" style="margin-top:10px">'+x.n.map(function(n){ return '<button class="btn gold" data-cnt-sunat="'+x.id+'" data-n="'+n+'">'+(en?"Count ":"Kira ")+n+(x.id==="tarawih"?"+3":"")+'</button>'; }).join("")+'</div>';
    }
    html+='</div>';
  });
  html+='<div class="mut small" style="padding:4px 4px 12px">'+(en?"Prototype content: please have an ustaz review before relying on it. The intention is made in the heart; saying it aloud (talaffuz) is recommended in the Shafi'i school to help the heart.":"Kandungan prototaip: sila dapatkan semakan ustaz. Niat dilakukan dalam hati; melafazkannya disunatkan dalam mazhab Syafi'i untuk membantu hati.")+'</div>';
  el.innerHTML=html+dock;
  el.querySelectorAll("[data-st]").forEach(function(b){ b.onclick=function(){ sunTop=b.getAttribute("data-st"); sunOpen=null; render(); }; });
  el.querySelectorAll("[data-sc]").forEach(function(b){ b.onclick=function(){ sunCat=b.getAttribute("data-sc"); sunOpen=null; render(); }; });
  el.querySelectorAll("[data-so]").forEach(function(b){ b.onclick=function(){ var id=b.getAttribute("data-so"); sunOpen = sunOpen===id ? null : id; render(); }; });
  el.querySelectorAll("[data-guide]").forEach(function(b){ b.onclick=function(){ learnPg="g_"+b.getAttribute("data-guide"); go("learn"); }; });
  el.querySelectorAll("[data-cnt-sunat]").forEach(function(b){ b.onclick=function(){
    var x=SUNAT_LIST.filter(function(y){return y.id===b.getAttribute("data-cnt-sunat");})[0], n=+b.getAttribute("data-n");
    if(x.id==="tarawih"){ rk.solat = n===8?"t8":"t20"; n=rkTarget(); } else { rk.solat="custom"; rk.customN=n; rk.customName=L2(x.name); }
    if(S.rmode==="camera" && !N.hasPerm("camera")){ var hp=function(p){ if(p.which!=="camera") return; off("perm",hp); if(p.granted) startPraying(n); }; on("perm",hp); N.requestPerm("camera"); }
    else startPraying(n);
  }; });
}
var tb=load("ihsan_tasbih",{i:0,left:33});
// 0.19.0 (idea 32) My zikir: your own zikir with a target, tap counter, today and lifetime totals. Storage ihsan_myzikir
function myZ(){ return load("ihsan_myzikir",[]); }
function myZSave(a){ save("ihsan_myzikir",a); }
function zMine(el){
  var A=myZ(), td=ymd(new Date());
  var h='<div class="card"><h3>📿 '+L2x("Zikir saya","My zikir")+'</h3><div class="mut small">'+L2x("Tambah zikir sendiri dengan sasaran bilangan. Ketik untuk mengira; butang volum juga boleh digunakan.","Add your own zikir with a target count. Tap to count; the volume buttons work too.")+'</div>'+
    '<button class="btn gold full g3d" id="mzAdd" style="margin-top:10px">＋ '+L2x("Tambah zikir","Add zikir")+'</button></div>';
  if(!A.length) h+='<div class="card mut small">'+L2x("Belum ada zikir. Contoh: Astaghfirullah 100×, Selawat 100×, La hawla wala quwwata illa billah 33×.","No zikir yet. Examples: Astaghfirullah 100×, Selawat 100×, La hawla wala quwwata illa billah 33×.")+
    '<div class="chips" style="margin-top:8px">'+MZ_PRE.map(function(p,i){ return '<button class="chip g3d" data-mzp="'+i+'">＋ '+esc(L2x(p.t,p.te))+'</button>'; }).join("")+'</div></div>';
  A.forEach(function(z,i){ var c=(z.d===td?z.c:0)||0, f=Math.min(1,c/Math.max(1,z.n));
    h+='<div class="card mzc"><div class="row"><h3 style="margin:0">'+esc(z.t||"Zikir")+'</h3><span class="badge">'+c+' / '+z.n+'</span></div>'+
      (z.ar?'<div class="ar" style="text-align:center;font-size:28px;line-height:1.8">'+esc(z.ar)+'</div>':'')+(z.m?'<div class="tr" style="text-align:center">'+esc(z.m)+'</div>':'')+
      '<div class="ubar1" style="margin:8px 0"><i style="width:'+Math.round(f*100)+'%"></i></div>'+
      '<div class="mut tiny">'+L2x("Jumlah sepanjang masa: ","All-time total: ")+(z.tot||0)+(z.done?' · '+L2x("Sasaran dicapai ","Target reached ")+z.done+'×':'')+'</div>'+
      '<div class="btns" style="margin-top:8px"><button class="btn gold g3d" data-mzc="'+i+'">▶ '+L2x("Kira","Count")+'</button><button class="btn alt g3d" data-mze="'+i+'">✎</button><button class="btn alt g3d" data-mzd="'+i+'">🗑</button></div></div>';
  });
  el.innerHTML=h;
  el.querySelector("#mzAdd").onclick=function(){ mzEdit(-1); };
  el.querySelectorAll("[data-mzp]").forEach(function(b){ b.onclick=function(){ var p=MZ_PRE[+b.getAttribute("data-mzp")], a=myZ(); a.push({t:L2x(p.t,p.te), ar:p.ar, m:L2x(p.m,p.me), n:p.n, c:0, tot:0}); myZSave(a); render(); }; });
  el.querySelectorAll("[data-mzc]").forEach(function(b){ b.onclick=function(){ mzCount(+b.getAttribute("data-mzc")); }; });
  el.querySelectorAll("[data-mze]").forEach(function(b){ b.onclick=function(){ mzEdit(+b.getAttribute("data-mze")); }; });
  el.querySelectorAll("[data-mzd]").forEach(function(b){ b.onclick=function(){ var a=myZ(), i=+b.getAttribute("data-mzd"); if(!confirm(L2x("Padam zikir ini?","Delete this zikir?"))) return; a.splice(i,1); myZSave(a); render(); }; });
}
var MZ_PRE=[{t:"Istighfar",te:"Istighfar",ar:"أَسْتَغْفِرُ اللّٰهَ",m:"Aku memohon ampun kepada Allah",me:"I seek Allah's forgiveness",n:100},
  {t:"Selawat",te:"Salawat",ar:"اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ",m:"Ya Allah, limpahkan rahmat ke atas junjungan kami Muhammad",me:"O Allah, send blessings upon our master Muhammad",n:100},
  {t:"Hauqalah",te:"Hawqala",ar:"لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ",m:"Tiada daya dan kekuatan melainkan dengan Allah",me:"There is no power and no strength except with Allah",n:33}];
function mzEdit(i){
  var a=myZ(), z=i>=0?a[i]:{t:"",ar:"",m:"",n:33};
  var ov=showSheet((i>=0?"✎ ":"＋ ")+L2x("Zikir saya","My zikir"),
    '<label class="fl">'+L2x("Nama","Name")+'<input id="mzT" value="'+esc(z.t)+'" placeholder="'+L2x("cth. Istighfar","e.g. Istighfar")+'"></label>'+
    '<label class="fl">'+L2x("Teks Arab (pilihan)","Arabic text (optional)")+'<input id="mzA" dir="rtl" value="'+esc(z.ar||"")+'"></label>'+
    '<label class="fl">'+L2x("Maksud / bacaan rumi (pilihan)","Meaning / transliteration (optional)")+'<input id="mzM" value="'+esc(z.m||"")+'"></label>'+
    '<label class="fl">'+L2x("Sasaran","Target")+'<input id="mzN" type="number" min="1" max="100000" value="'+(z.n||33)+'"></label>'+
    '<div class="chips">'+[3,7,10,33,99,100,1000].map(function(n){ return '<button class="chip" data-mzn="'+n+'">'+n+'</button>'; }).join("")+'</div>'+
    '<button class="btn gold full g3d" id="mzOk" style="margin-top:10px">✓ '+L2x("Simpan","Save")+'</button>');
  ov.querySelectorAll("[data-mzn]").forEach(function(b){ b.onclick=function(){ ov.querySelector("#mzN").value=b.getAttribute("data-mzn"); }; });
  ov.querySelector("#mzOk").onclick=function(){ var t=ov.querySelector("#mzT").value.trim(), ar=ov.querySelector("#mzA").value.trim();
    if(!t && !ar){ toast(L2x("Isi nama atau teks","Fill in a name or text")); return; }
    z.t=t||ar; z.ar=ar; z.m=ov.querySelector("#mzM").value.trim(); z.n=Math.max(1,parseInt(ov.querySelector("#mzN").value,10)||33);
    if(i<0){ z.c=0; z.tot=0; a.push(z); } myZSave(a); closeOverlay(); render(); };
}
function mzCount(i){
  var a=myZ(), z=a[i], td=ymd(new Date()); if(!z) return; if(z.d!==td){ z.d=td; z.c=0; }
  var ov=document.getElementById("overlay"); ov.className="sheetov";
  ov.innerHTML='<div class="sheet mzov"><div class="row"><h3 style="margin:0">📿 '+esc(z.t)+'</h3><button class="chip" id="mzX">✕</button></div>'+
    (z.ar?'<div class="ar" style="text-align:center;font-size:30px;line-height:1.8">'+esc(z.ar)+'</div>':'')+(z.m?'<div class="tr" style="text-align:center">'+esc(z.m)+'</div>':'')+
    '<div class="tap" id="mzTap"><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="136" fill="var(--well)" stroke="var(--line)" stroke-width="12"/><circle id="mzR" cx="150" cy="150" r="136" fill="none" stroke="#c9a646" stroke-width="12" stroke-linecap="round" transform="rotate(-90 150 150)" stroke-dasharray="854.5" stroke-dashoffset="854.5"/></svg><div class="num" id="mzNum" style="position:relative">0</div><div class="mut" style="position:relative">/ '+z.n+'</div></div>'+
    '<div class="btns"><button class="btn alt" id="mzU">↶ '+T("undo")+'</button><button class="btn alt" id="mzZ">⟲ '+T("reset")+'</button></div></div>';
  var upd=function(){ ov.querySelector("#mzNum").textContent=z.c; ov.querySelector("#mzR").setAttribute("stroke-dashoffset",(854.5*(1-Math.min(1,z.c/z.n))).toFixed(1)); };
  var inc=function(){ z.c++; z.tot=(z.tot||0)+1; if(z.c===z.n){ z.done=(z.done||0)+1; N.vibrate(900); toast(L2x("Sasaran dicapai. MasyaAllah!","Target reached. MasyaAllah!")); } else N.vibrate(z.c%33===0?300:25); myZSave(a); upd(); };
  ov.querySelector("#mzTap").onclick=inc;
  ov.querySelector("#mzU").onclick=function(){ if(z.c>0){ z.c--; z.tot=Math.max(0,(z.tot||0)-1); myZSave(a); upd(); } };
  ov.querySelector("#mzZ").onclick=function(){ z.c=0; myZSave(a); upd(); N.vibrate(150); };
  var close=function(){ volHook=null; if(N.setVolumeKeys) N.setVolumeKeys(false); closeOverlay(); render(); };
  ov.querySelector("#mzX").onclick=close; ov._close=close;
  volHook=inc; if(N.setVolumeKeys) N.setVolumeKeys(true);
  upd();
}
function zTasbih(el){
  function draw(){
    var item=TASBIH[tb.i], total=item.n, frac=total?(total-tb.left)/total:1;
    el.innerHTML='<div class="card tasbih"><div class="steps">'+TASBIH.map(function(x,i){return '<span class="'+(i<tb.i?"done":i===tb.i?"on":"")+'"></span>';}).join("")+'</div>'+
    '<div class="ar" style="text-align:center;font-size:'+(tb.i===3?24:34)+'px;line-height:1.8;margin-top:6px">'+item.ar+'</div>'+rumiDiv(item.ar,true)+'<div class="tr" style="text-align:center">'+esc(tr(item))+'</div>'+
    '<div class="tap" id="tapC"><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="136" fill="var(--well)" stroke="var(--line)" stroke-width="12"/><circle cx="150" cy="150" r="136" fill="none" stroke="#c9a646" stroke-width="12" stroke-linecap="round" transform="rotate(-90 150 150)" stroke-dasharray="854.5" stroke-dashoffset="'+(854.5*(1-frac)).toFixed(1)+'"/></svg><div class="num" style="position:relative">'+tb.left+'</div><div class="mut" style="position:relative">'+(tb.left===0?T("done"):(S.lang==="en"?"tap":"ketik"))+'</div></div>'+
    '<div class="btns tasbihPad"><button class="btn alt" id="tUndo">↶ '+T("undo")+'</button><button class="btn alt" id="tReset">⟲ '+T("reset")+'</button></div>'+
    '<div class="set" style="margin-top:8px"><span>🔈 '+(S.lang==="en"?"Count with volume buttons":"Kira guna butang volum")+'</span>'+sw("tVol",S.volTasbih)+'</div>'+
    '<button class="btn alt full" id="tDark">🌑 '+(S.lang==="en"?"Dark screen (pocket mode)":"Skrin gelap (mod poket)")+'</button></div>'+
    tcHtml()+
    '<div class="card"><h3>'+T("why")+'</h3><div class="why">'+esc(S.lang==="en"?TASBIH_WHY.en:TASBIH_WHY.ms)+'</div><div class="src">'+srcHtml(TASBIH_WHY.src)+'</div></div>';
    tcBind(el, draw);
    tbTap=function(){ el.querySelector("#tapC").onclick(); };
    el.querySelector("#tVol").onchange=function(){ S.volTasbih=this.checked; saveS(); if(N.setVolumeKeys) N.setVolumeKeys(S.volTasbih); toast(S.volTasbih?(S.lang==="en"?"Press volume up or down to count":"Tekan volum naik atau turun untuk mengira"):(S.lang==="en"?"Volume buttons back to normal":"Butang volum kembali biasa")); };
    el.querySelector("#tDark").onclick=function(){ tasbihDark(); };
    el.querySelector("#tapC").onclick=function(){
      if(tb.left>0){ tb.left--; N.vibrate(tb.left===0?(tb.i===TASBIH.length-1?900:450):25); var lt=load("ihsan_tbtot",{})||{}; lt[tb.i]=(lt[tb.i]||0)+1; save("ihsan_tbtot",lt); }
      if(tb.left===0){ if(tb.i<TASBIH.length-1){ save("ihsan_tasbih",tb); draw(); setTimeout(function(){ if(tb.left===0 && tb.i<TASBIH.length-1){ tb.i++; tb.left=TASBIH[tb.i].n; save("ihsan_tasbih",tb); draw(); } },900); return; } else toast(S.lang==="en"?"Tasbih complete - 100":"Tasbih selesai - 100"); }
      save("ihsan_tasbih",tb); draw(); };
    el.querySelector("#tUndo").onclick=function(){ if(tb.left<TASBIH[tb.i].n) tb.left++; else if(tb.i>0){ tb.i--; tb.left=0+1; } save("ihsan_tasbih",tb); draw(); };
    el.querySelector("#tReset").onclick=function(){ N.vibrate(200); tb={i:0,left:33}; save("ihsan_tasbih",tb); draw(); };
  }
  draw();
}
// 0.5.23 (Tasbeeh Counter style): your own counters with a target, today's count and a lifetime total; lifetime totals for the main tasbih
function tcList(){ return load("ihsan_counters",[])||[]; }
function tcHtml(){ var L=tcList(), lt=load("ihsan_tbtot",{})||{}, td=ymd(new Date());
  return '<div class="card tcCard"><div class="row"><h3 style="margin:0">📿 '+L2x("Kaunter saya","My counters")+'</h3><button class="chip" id="tcAdd">＋ '+L2x("Kaunter","Counter")+'</button></div>'+
    (L.length?L.map(function(c, i){ var n=c.d===td?c.n:0, pc=c.t?Math.min(1,n/c.t):0;
      return '<div class="tcRow"><button class="tcTap" data-tc="'+i+'" aria-label="+1"><b>'+n+'</b><small>/ '+(c.t||"∞")+'</small><i style="--p:'+Math.round(pc*100)+'%"></i></button><div class="tcInfo"><b>'+esc(c.name)+'</b><small>'+L2x("Jumlah sepanjang masa: ","Lifetime: ")+(c.tot||0).toLocaleString()+(n>=c.t&&c.t?' · ✓ '+L2x("sasaran hari ini","today's target"):'')+'</small></div><button class="chip" data-tcr="'+i+'" aria-label="'+L2x("Kosongkan hari ini","Reset today")+'">⟲</button><button class="chip" data-tcx="'+i+'" aria-label="'+L2x("Padam","Delete")+'">✕</button></div>'; }).join("")
      :'<div class="mut small" style="margin-top:6px">'+L2x("Buat kaunter sendiri, contoh Istighfar 100 kali sehari atau Selawat 1000 kali.","Make your own counters, for example Istighfar 100 a day or Selawat 1000.")+'</div>')+
    '<div class="mut tiny" style="margin-top:8px">'+L2x("Tasbih utama sepanjang masa: ","Main tasbih lifetime: ")+TASBIH.map(function(x, i){ return (["Subhanallah","Alhamdulillah","Allahu Akbar","La ilaha illallah"][i]||("#"+(i+1)))+" "+(lt[i]||0).toLocaleString(); }).join(" · ")+'</div></div>'; }
function tcBind(el, redraw){ var L=tcList(), sv=function(){ save("ihsan_counters", L); }, td=ymd(new Date());
  var add=el.querySelector("#tcAdd"); if(add) add.onclick=function(){ var ov=showSheet("📿 "+L2x("Kaunter baharu","New counter"), '<input id="tcN" class="rin" maxlength="40" placeholder="'+L2x("Nama (contoh: Istighfar)","Name (e.g. Istighfar)")+'"><input id="tcT" class="rin" type="number" min="0" inputmode="numeric" placeholder="'+L2x("Sasaran sehari (kosong = tiada)","Daily target (empty = none)")+'" style="margin-top:8px"><button class="btn gold full g3d" id="tcOk" style="margin-top:10px">'+L2x("Simpan","Save")+'</button>');
    ov.querySelector("#tcOk").onclick=function(){ var n=ov.querySelector("#tcN").value.trim(); if(!n) return; L.push({name:n, t:Math.max(0,+ov.querySelector("#tcT").value||0), n:0, d:td, tot:0}); sv(); closeOverlay(); redraw(); }; };
  el.querySelectorAll("[data-tc]").forEach(function(b){ b.onclick=function(){ var c=L[+b.getAttribute("data-tc")]; if(c.d!==td){ c.d=td; c.n=0; } c.n++; c.tot=(c.tot||0)+1; sv(); N.vibrate(c.t&&c.n===c.t?450:20); redraw(); }; });
  el.querySelectorAll("[data-tcr]").forEach(function(b){ b.onclick=function(){ var c=L[+b.getAttribute("data-tcr")]; c.n=0; c.d=td; sv(); redraw(); }; });
  el.querySelectorAll("[data-tcx]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-tcx"); if(b.dataset.sure){ L.splice(i,1); sv(); redraw(); } else { b.dataset.sure=1; b.textContent=L2x("Padam?","Delete?"); } }; }); }
function cardItem(it, key, idx, opts){
  var n=it.n, st=zstate[key+idx]||0, ar=opts&&opts.evening&&it.ev?it.ev:it.ar;
  if(opts && opts.triple && it.n3) n=3;
  var h='<div class="card"><div class="row"><h3>'+(it.title?(opts&&opts.num?(idx+1)+'. ':'')+esc(it.title):(idx+1)+'.')+'</h3>'+(n>1?'<span class="badge">'+n+'×</span>':'')+'</div>';
  if(it.mushaf) h+='<div class="warnbox">📖 '+esc(tr(it))+'</div>';
  else { var mt = (opts&&opts.evening&&(it.ev_ms||it.ev_en)) ? (S.lang==="en"?it.ev_en:it.ev_ms) : tr(it); h+='<div class="ar">'+ar+'</div>'+rumiDiv(ar)+'<div class="tr">'+esc(mt)+'</div>'+toolRow(ar, mt, it.src, it.title||""); }
  if(it.why_ms) h+='<div class="why"><b>'+T("why")+':</b> '+esc(S.lang==="en"?it.why_en:it.why_ms)+'</div>';
  h+='<div class="src">'+T("source")+': '+srcHtml(it.src)+'</div>';
  if(it.tasbih) h+='<div class="counter"><button class="btn gold full" data-open-tasbih="1">📿 '+esc(tr(it))+'</button></div>';
  else h+='<div class="counter"><div class="cnt '+(st>=n?"done":"")+'" data-cnt="'+key+idx+'" data-n="'+n+'">'+(st>=n?"✓ "+T("done"):st+" / "+n)+'</div></div>';
  return h+'</div>';
}
function bindCounters(el){
  el.querySelectorAll("[data-cnt]").forEach(function(c){ c.onclick=function(){ var k=c.getAttribute("data-cnt"), n=+c.getAttribute("data-n"); var v=(zstate[k]||0); v = v>=n ? 0 : v+1; zstate[k]=v; save("ihsan_zstate",zstate); N.vibrate(v>=n?120:20); c.className="cnt "+(v>=n?"done":""); c.textContent = v>=n ? "✓ "+T("done") : v+" / "+n; }; });
  el.querySelectorAll("[data-open-tasbih]").forEach(function(b){ b.onclick=function(){ sub.zikir="tasbih"; tb={i:0,left:33}; save("ihsan_tasbih",tb); render(); }; });
}
function resetKeys(prefix){ Object.keys(zstate).forEach(function(k){ if(k.indexOf(prefix)===0) delete zstate[k]; }); save("ihsan_zstate",zstate); }
var afterSolat=null;
function zAfter(el){
  if(!afterSolat) afterSolat=currentPrayer();
  var triple = afterSolat==="subuh"||afterSolat==="maghrib";
  var html='<div class="chips">'+PR.map(function(k){return '<button class="chip '+(afterSolat===k?"on":"")+'" data-a="'+k+'">'+T(k)+'</button>';}).join("")+'</div>';
  POST_PRAYER.forEach(function(it,i){ if(it.only && it.only.indexOf(afterSolat)<0) return; html+=cardItem(it,"pp"+afterSolat,i,{triple:triple}); });
  html+='<button class="btn alt full" id="ppReset">⟲ '+T("reset")+'</button>';
  html+='<div class="warnbox">'+(S.lang==="en"?"The longer wirid and doa commonly read in Malaysian masjid after jemaah is an arrangement by scholars. It will be added in a separate tab after review by an ustaz.":"Wirid dan doa yang lebih panjang yang biasa dibaca di masjid Malaysia selepas solat berjemaah ialah susunan ulama. Ia akan ditambah dalam tab berasingan selepas disemak oleh ustaz.")+'</div>';
  el.innerHTML=html;
  el.querySelectorAll("[data-a]").forEach(function(b){ b.onclick=function(){ afterSolat=b.getAttribute("data-a"); zAfter(el); }; });
  el.querySelector("#ppReset").onclick=function(){ N.vibrate(200); resetKeys("pp"+afterSolat); zAfter(el); };
  bindCounters(el);
}
var mathEvening=null, mIdx=0;
// 0.28.0: Wirid pagi & petang (the Prophet's own morning/evening adhkar, wirid.js), the tab left of Ma'thurat
var wIdx=0;
function vWirid(el){
  if(mathEvening===null){ var h=new Date().getHours(); mathEvening = h>=12; }
  var key=(mathEvening?"we":"wp")+ymd(new Date()), html='<div class="mut small">'+L2x("Zikir pagi dan petang yang diamalkan Rasulullah ﷺ, setiap satu dengan sumbernya. Pagi: selepas Subuh hingga syuruk. Petang: selepas Asar hingga Maghrib.","The morning and evening adhkar the Prophet ﷺ practised, each with its source. Morning: after Subuh until sunrise. Evening: after Asar until Maghrib.")+'</div>'+
    '<div class="warnbox">'+L2x("Lafaz dan sumber ditulis daripada ingatan dan perlu disemak oleh ustaz.","Wording and sources were written from memory and need an ustaz's review.")+'</div>';
  var done=0, tot=0, IT=[];
  WIRID.forEach(function(it,i){ if((it.m && mathEvening) || (it.e && !mathEvening)) return; tot++; IT.push(i); if((zstate[key+i]||0)>=it.n) done++; });
  var hs=!!S.wiridH, NW=IT.length; if(wIdx>=NW) wIdx=0;
  var one=function(j){ var i=IT[j]; return cardItem(WIRID[i],key,i,{evening:mathEvening}); };
  // 0.34.0: like Ma'thurat, ↔ shows one wirid at a time; swipe sideways, the next one rides in beside it
  if(hs) html+='<div class="mut small" id="wPos" style="text-align:center;margin:4px 0"></div><div id="wOne"></div>';
  else IT.forEach(function(i,j){ html+=one(j); });
  html='<div class="dock"><div class="tabrow"><div class="chips"><button class="chip '+(!mathEvening?"on":"")+'" data-e="0">☀️ '+T("pagi")+'</button><button class="chip '+(mathEvening?"on":"")+'" data-e="1">🌙 '+T("petang")+'</button></div><span class="small" id="wProg">'+done+'/'+tot+'</span><label class="trt"><span>↔</span><span class="switch sm"><input type="checkbox" id="wH" '+(hs?"checked":"")+'><span></span></span></label>'+trToggle()+'</div>'+
    (hs?'<div class="mbar indock"><button class="chip" id="wPrev">‹</button><input type="range" id="wRange" min="1" max="'+NW+'" value="'+(wIdx+1)+'"><button class="chip" id="wNext">›</button></div>':'')+'</div>'+html+
    '<button class="btn alt full" id="wReset">⟲ '+T("reset")+'</button>';
  el.innerHTML=html; bindTrToggle(el);
  el.querySelectorAll("[data-e]").forEach(function(b){ b.onclick=function(){ mathEvening=b.getAttribute("data-e")==="1"; render(); }; });
  el.querySelector("#wH").onchange=function(){ S.wiridH=this.checked; save("ihsan_settings",S); vWirid(el); dockFix(); };
  el.querySelector("#wReset").onclick=function(){ N.vibrate(200); resetKeys(key); vWirid(el); dockFix(); };
  if(hs){
    var box=el.querySelector("#wOne"), pos=el.querySelector("#wPos"), rng=el.querySelector("#wRange"), vw=document.getElementById("view");
    var show=function(j, dir){ wIdx=Math.max(0,Math.min(NW-1,j)); box.innerHTML=one(wIdx); if(dir) IbSwipe.inFrom(box, -dir); pos.textContent=(wIdx+1)+" / "+NW; rng.value=wIdx+1; bindCounters(box);
      var top=pos.offsetTop-8; if(vw.scrollTop>top) vw.scrollTop=top; };
    show(wIdx,0);
    IbSwipe(box, {can:function(s){ return s<0 ? wIdx<NW-1 : wIdx>0; }, go:function(s){ show(wIdx+(s<0?1:-1), 0); }, peek:function(s){ var j=wIdx+(s<0?1:-1); return j>=0&&j<NW?one(j):null; }});
    el.querySelector("#wPrev").onclick=function(){ show(wIdx-1,-1); };
    el.querySelector("#wNext").onclick=function(){ show(wIdx+1,1); };
    rng.oninput=function(){ show(+rng.value-1,0); };
    box.addEventListener("click", function(e){ var c=e.target.closest(".cnt"); if(!c) return; setTimeout(function(){ if(c.classList.contains("done") && wIdx<NW-1) show(wIdx+1,1); },350); });
  } else bindCounters(el);
  el.addEventListener("click", function(e){ if(!e.target.closest("[data-cnt]")) return; setTimeout(function(){ var d=0; IT.forEach(function(i){ if((zstate[key+i]||0)>=WIRID[i].n) d++; }); var p=el.querySelector("#wProg"); if(p) p.textContent=d+"/"+tot; },50); });
}
function zMathurat(el){
  if(mathEvening===null){ var h=new Date().getHours(); mathEvening = h>=12; }
  var key=(mathEvening?"me":"mp")+ymd(new Date());
  var html='<div class="mut small">'+(S.lang==="en"?"Wazifah Sughra. Read after Subuh (morning) and after Asar or Maghrib (evening).":"Wazifah Sughra. Dibaca selepas Subuh (pagi) dan selepas Asar atau Maghrib (petang).")+'</div>';
  html+='<div class="warnbox">'+(S.lang==="en"?"Prototype content: the order, wording and counts must be checked against an endorsed printed Al-Ma'thurat.":"Kandungan prototaip: susunan, lafaz dan bilangan perlu disemak dengan buku Al-Ma'thurat bercetak yang disahkan.")+'</div>';
  var hs=!!S.mathH, NM=MATHURAT.length, oldBar=document.querySelector("#view .dock .mbar"); if(oldBar){ oldBar.remove(); setTimeout(dockFix,0); }
  if(!hs){
    html+='<div class="mcards" id="mCards">';
    MATHURAT.forEach(function(it,i){ html+=cardItem(it,key,i,{evening:mathEvening, num:true}); });
    el.innerHTML=html+'</div>';
  } else {
    // One card at a time: swipe left/right, normal vertical page scroll, slider at the bottom.
    if(mIdx>=NM) mIdx=0;
    html+='<div class="mut small" id="mPos" style="text-align:center;margin:4px 0"></div><div id="mOne"></div>'+
      '<div class="mbar"><button class="chip" id="mPrev">‹</button><input type="range" id="mRange" min="1" max="'+NM+'" value="'+(mIdx+1)+'"><button class="chip" id="mNext">›</button></div>';
    el.innerHTML=html;
    var one=el.querySelector("#mOne"), pos=el.querySelector("#mPos"), rng=el.querySelector("#mRange"), view=document.getElementById("view");
    // 0.26.0: the slider lives inside the bottom dock (pinned with the Pagi/Petang bar) so the two never overlap
    var mb=el.querySelector(".mbar"), vd=document.querySelector("#view .dock");
    if(vd && !el.contains(vd)){ mb.classList.add("indock"); vd.appendChild(mb); setTimeout(dockFix,0); }
    else mb.style.bottom=(navH()+(document.getElementById("subnav")?document.getElementById("subnav").offsetHeight:0))+"px";
    var show=function(i, dir){
      mIdx=Math.max(0,Math.min(NM-1,i));
      one.innerHTML=cardItem(MATHURAT[mIdx],key,mIdx,{evening:mathEvening, num:true});
      if(dir) IbSwipe.inFrom(one, -dir);
      pos.textContent=(mIdx+1)+" / "+NM; rng.value=mIdx+1;
      bindCounters(one);
      var top=pos.offsetTop-8; if(view.scrollTop>top) view.scrollTop=top;
    };
    show(mIdx,0);
    // 0.33.0: the card follows the finger
    IbSwipe(one, {can:function(s){ return s<0 ? mIdx<NM-1 : mIdx>0; }, go:function(s){ show(mIdx+(s<0?1:-1), 0); },
      peek:function(s){ var j=mIdx+(s<0?1:-1); return MATHURAT[j]?cardItem(MATHURAT[j],key,j,{evening:mathEvening, num:true}):null; }});
    mb.querySelector("#mPrev").onclick=function(){ show(mIdx-1,-1); };
    mb.querySelector("#mNext").onclick=function(){ show(mIdx+1,1); };
    rng.oninput=function(){ show(+rng.value-1,0); };
    one.addEventListener("click", function(e){ var c=e.target.closest(".cnt"); if(!c) return; setTimeout(function(){ if(c.classList.contains("done") && mIdx<NM-1) show(mIdx+1,1); },350); });
  }
  el.querySelectorAll("[data-e]").forEach(function(b){ b.onclick=function(){ mathEvening=b.getAttribute("data-e")==="1"; render(); }; });
  bindCounters(el);
}
var doaCat=0;
// 0.28.0: 12 sub-categories in each group (Farah); 18-35 come from doa_more.js
var DOA_GROUPS=[["Harian","Daily life",[0,1,2,3,4,5,6,7,18,19,20,21]],["Keperluan hidup","Life & needs",[9,12,13,11,14,15,22,23,24,25,26,27]],["Hati & akhirat","Heart & Hereafter",[8,10,17,16,28,29,30,31,32,33,34,35]]];
function doaGroupOf(i){ for(var g=0;g<DOA_GROUPS.length;g++) if(DOA_GROUPS[g][2].indexOf(i)>=0) return g; return 0; }
function zDaily(el){
  var html='<div class="doaPlay"><button class="btn alt g3d" id="doaAll">▶ '+L2x("Dengar semua doa (Arab + maksud)","Hear every doa (Arabic + meaning)")+'</button></div>';
  DOA[doaCat].items.forEach(function(it,ii){ html+=doaCard(it, doaCat, ii); });
  el.innerHTML=html;
  // 0.5.23 (Hisnul Muslim style): every doa in the category read aloud in turn by the phone's voice, the Arabic and then its meaning
  var pa=el.querySelector("#doaAll"); if(pa) pa.onclick=function(){ if(doaPlaying){ doaPlaying=false; speakStop(); pa.innerHTML="▶ "+L2x("Dengar semua doa (Arab + maksud)","Hear every doa (Arabic + meaning)"); return; }
    var items=DOA[doaCat].items, i=0, cards=el.querySelectorAll(".card"); doaPlaying=true; pa.innerHTML="⏹ "+L2x("Henti","Stop");
    var next=function(){ if(!doaPlaying || !document.body.contains(pa)){ doaPlaying=false; return; } if(i>=items.length){ doaPlaying=false; pa.innerHTML="▶ "+L2x("Dengar semua doa (Arab + maksud)","Hear every doa (Arabic + meaning)"); return; }
      var it=items[i], c=cards[i]; cards.forEach(function(x){ x.classList.remove("doaNow"); }); if(c){ c.classList.add("doaNow"); c.scrollIntoView({behavior:"smooth", block:"center"}); }
      speakThen(it.ar, function(){ speakLangThen(tr(it), S.lang==="en"?"en":"ms", function(){ i++; setTimeout(next, 700); }); }); };
    next(); };
}
var doaPlaying=false;
// like speakThen, for Malay or English text
function speakLangThen(text, lang, cb){ var tok=++spkTok, t=String(text||"").replace(/<[^>]*>/g," "), est=Math.max(1500, t.length*70), done=false, tm=0;
  var fin=function(){ if(done) return; done=true; off("ttsdone",td); clearTimeout(tm); if(tok===spkTok && cb) cb(); }, td=function(r){ if(r && r.stopped) return; fin(); };
  tm=setTimeout(fin, est*2+4000);
  if(window.Native && N.speak){ on("ttsdone",td); N.speak(t, lang); return; }
  try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(t); u.lang=lang==="ms"?"ms-MY":"en-GB"; u.onend=fin; u.onerror=fin; speechSynthesis.speak(u); }catch(e){ clearTimeout(tm); tm=setTimeout(fin, est); } }
// 0.5.23: a random doa on Home with ‹ › and 🔊 (Hisnul Muslim style widget)
var rdOff=0;
function wRandDoa(){ var all=[]; DOA.forEach(function(c, ci){ (c.items||[]).forEach(function(it, ii){ all.push([ci, ii]); }); }); if(!all.length) return '';
  var seed=dayIndex(new Date())*7919, n=all.length, pick=all[(((seed+rdOff)%n)+n)%n], c=DOA[pick[0]], it=c.items[pick[1]], title=S.lang==="en"?it.t_en:it.t_ms;
  return '<div class="card wrdoa"><h3 class="wnavh">🤲 '+L2x("Doa untuk anda","A doa for you")+'<span class="wnav"><button class="ib" data-rdn="-1" aria-label="‹">‹</button><button class="ib" data-rdn="1" aria-label="›">›</button></span></h3>'+
    '<div class="mut tiny">'+esc(title)+' · '+esc(catName(c))+'</div><div class="ar wayAr" dir="rtl">'+it.ar+'</div><div class="hq">'+esc(tr(it))+'</div>'+toolRow(it.ar, tr(it), it.src, title)+'</div>'; }
document.addEventListener("click", function(e){ var b=e.target.closest && e.target.closest("[data-rdn]"); if(!b) return; e.preventDefault(); e.stopPropagation(); rdOff+=(+b.getAttribute("data-rdn")); render(); }, true);

// 0.28.0: the whole coming (or current) Ramadan as a Hijri month, small Masihi date in each cell. Each day ticks and lights up
// exactly when its Maghrib arrives; the last 10 nights have a frame; Syawal 1 (Eid) closes the month. Tap a past day to mark it missed (for qadha).
var RMD=load("ihsan_ramadan",{});
function ramadanMonth(){
  var ev=nextHijriEvent(9,1,10,1); if(!ev) return '';
  var st=ev.start, y=ev.y, n=29; var d30=addDays(st,29), h30=hijriOf(d30); if(h30 && h30.m===9) n=30;
  var eid=addDays(st,n), now=Date.now(), missed=(RMD[y]||{}), done=0, lead=(st.getDay()+6)%7, en=en_();
  var h='<div class="card rmCard"><div class="row"><h3>🌙 Ramadan '+y+'H</h3><span class="small gold" id="rmCount"></span></div>'+
    '<div class="mut small">'+ymdNice(st)+' – '+ymdNice(addDays(st,n-1))+' · '+n+' '+L2x("hari","days")+'</div>'+
    '<div class="rmGrid">'+(en?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]:["Isn","Sel","Rab","Kha","Jum","Sab","Ahd"]).map(function(x){ return '<div class="rmH">'+x+'</div>'; }).join("");
  for(var i=0;i<lead;i++) h+='<div class="rmC out"></div>';
  for(var d=1; d<=n; d++){
    var dt=addDays(st,d-1), ds=ymd(dt), t=null; try{ t=getDay(dt); }catch(e){}
    var mg=t&&t.maghrib?at(ds,t.maghrib).getTime():new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),19,20).getTime();
    var past=now>=mg, today=ds===ymd(new Date()), miss=!!missed[d], last10=d>=21;
    if(past && !miss) done++;
    h+='<button class="rmC'+(past?(miss?" miss":" done"):"")+(today?" today":"")+(last10?" l10":"")+(d===21?" l10s":"")+(last10&&d%2===1?" odd":"")+'" data-rmd="'+d+'"'+(past?'':' disabled')+'>'+
      '<b>'+d+'</b><small>'+dt.getDate()+' '+(en?ME:MS)[dt.getMonth()].slice(0,3)+'</small>'+(past?'<i>'+(miss?"✕":"✓")+'</i>':'')+(last10&&d%2===1?'<em>✦</em>':'')+'</button>';
  }
  h+='<div class="rmC eid'+(now>=eid.getTime()?" done":"")+'"><b>🌙</b><small>'+L2x("1 Syawal","1 Syawal")+'</small><small>'+eid.getDate()+' '+(en?ME:MS)[eid.getMonth()].slice(0,3)+'</small></div></div>';
  h+='<div class="rmLeg"><span><i class="lg done"></i>'+L2x("Selesai (selepas Maghrib)","Done (after Maghrib)")+'</span><span><i class="lg l10"></i>'+L2x("10 malam terakhir","Last 10 nights")+'</span><span>✦ '+L2x("malam ganjil","odd nights")+'</span><span><i class="lg miss"></i>'+L2x("Tidak berpuasa (ketik)","Missed (tap)")+'</span></div></div>';
  ramadanMonth.st={done:done, n:n, y:y};
  clearTimeout(ramadanMonth._t); var nx=null;
  for(var k=1;k<=n;k++){ var dk=addDays(st,k-1), tk=null; try{ tk=getDay(dk); }catch(e){} if(!tk||!tk.maghrib) continue; var mk=at(ymd(dk),tk.maghrib).getTime(); if(mk>now){ nx=mk; break; } }
  if(nx && nx-now<864e5) ramadanMonth._t=setTimeout(function(){ if(view==="cal" && SUB2.cal==="bulan" && cal.mode==="h") render(); }, nx-now+1000);
  return h.replace('<span class="small gold" id="rmCount"></span>','<span class="small gold" id="rmCount">'+done+' / '+n+'</span>');
}
function ymdNice(d){ return d.getDate()+" "+(en_()?ME:MS)[d.getMonth()]+" "+d.getFullYear(); }
function bindRamadan(el){
  el.querySelectorAll("[data-rmd]").forEach(function(b){ b.onclick=function(){ var y=ramadanMonth.st.y, d=+b.getAttribute("data-rmd"); RMD[y]=RMD[y]||{}; if(RMD[y][d]) delete RMD[y][d]; else RMD[y][d]=1; save("ihsan_ramadan",RMD); N.vibrate(20); render(); }; });
}
// CALENDAR
var cal={y:null,m:null,sel:null,all:false,lay:{ph:true,sc:true,is:true}};
var MS=["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"], ME=["January","February","March","April","May","June","July","August","September","October","November","December"];
// Find the Gregorian date of Hijri (hy, hm, hd) near an estimate.
function hijriToDate(hy,hm,hd){
  var t=new Date(), h0=hijriOf(t); if(!h0) return null; t.setHours(12,0,0,0);
  var diff=((hy*12+hm)-(h0.y*12+h0.m))*29.5306+(hd-h0.d), est=addDays(t,Math.round(diff));
  for(var k=0;k<=6;k++){ for(var sgn=-1;sgn<=1;sgn+=2){ var d=addDays(est,k*sgn), h=hijriOf(d); if(h && h.y===hy && h.m===hm && h.d===hd) return d; if(k===0) break; } }
  return null;
}
function nextHijriEvent(m,d,endM,endD){
  var t=new Date(); t.setHours(0,0,0,0); var h=hijriOf(t); if(!h) return null;
  for(var y=h.y; y<=h.y+1; y++){
    var st=hijriToDate(y,m,d); if(!st) continue;
    st=new Date(st.getFullYear(),st.getMonth(),st.getDate());
    var en=endM?hijriToDate(y,endM,endD):st; if(!en) en=st; en=new Date(en.getFullYear(),en.getMonth(),en.getDate());
    if(endM ? en>t : en>=t) return {start:st, end:en, y:y, inProgress: st<=t};
  }
  return null;
}
var CD_EVENTS=[["ramadhan",9,1,10,1,"Ramadan","Ramadan"],["fitri",10,1,0,0,"Aidilfitri","Eid al-Fitr"],["adha",12,10,0,0,"Aidiladha","Eid al-Adha"],["muharram",1,1,0,0,"Awal Muharram","Islamic New Year"]];
function countdownBoxes(){
  var t=new Date(); t.setHours(0,0,0,0); var en=S.lang==="en";
  return '<div class="stick cdbox">'+CD_EVENTS.map(function(e){
    var ev=nextHijriEvent(e[1],e[2],e[3],e[4]);
    if(!ev) return '<div class="cdb"><div class="cdn">'+(en?e[6]:e[5])+'</div><div class="cdd">--</div></div>';
    var days=Math.round((ev.start-t)/864e5), big, unit;
    if(ev.inProgress && e[3]){ big=Math.round((t-ev.start)/864e5)+1; unit=en?"day":"hari ke"; }
    else if(days===0){ big="✓"; unit=en?"today":"hari ini"; }
    else { big=days; unit=en?"days":"hari"; }
    var gd=ev.start.toLocaleDateString(locTag(),{day:"numeric",month:"short",year:"numeric"});
    return '<div class="cdb'+(ev.inProgress||days===0?" now":"")+'"><div class="cdn">'+(en?e[6]:e[5])+'</div><div class="cdd">'+(ev.inProgress&&e[3]?'<small>'+unit+'</small> '+big:big+' <small>'+unit+'</small>')+'</div><div class="cdg">'+gd+'</div><div class="cdh">'+e[2]+' '+HIJRI_MONTHS[e[1]-1]+' '+ev.y+'H</div></div>';
  }).join("")+'</div>';
}
var JNd=null;
function calCell(dt, big, small, smallIsHijri, tds){
  var ds=ymd(dt), ph=cal.lay.ph?holidaysOn(ds,cal.all):[], sc=cal.lay.sc?schoolOn(ds,cal.all):[], is=cal.lay.is?islamicOn(dt):[];
  var mineph=ph.some(function(x){return x.mine;}), minesc=sc.some(function(x){return x.mine;});
  var rh=hijriOf(dt), ram=rh && rh.m===9;   // 0.6.68 (owner): Ramadan stands out in the calendar (last 10 nights, odd nights ✦)
  var cls="d"+(ram?" ram"+(rh.d>=21?" l10"+(rh.d%2===1?" odd":""):""):"")+(ds<tds?" past":"")+(ds===tds?" today":"")+(ds===cal.sel?" sel":"")+(mineph?" ph":"")+(minesc?" sch":"")+(dt.getDay()===5?" fri":"")+(JNd&&JNd[ds]?" jn":"");
  var gdays=grpDays()[ds]||[];
  return '<div class="'+cls+'" data-d="'+ds+'"><span class="g">'+big+'</span><span class="hj'+(smallIsHijri?'':' gs')+'">'+small+'</span><span class="dots">'+gdays.slice(0,2).map(function(e){ return '<i class="gp" style="--gpc:'+esc(e.color||"#c9a646")+'"></i>'; }).join("")+(ph.length?'<i class="ph"></i>':'')+(sc.length?'<i class="sc"></i>':'')+(is.length?'<i class="is"></i>':'')+'</span>'+(cal.uMax&&useSec(ds)>0?'<span class="ub" style="width:'+Math.max(8,Math.round(useSec(ds)*100/cal.uMax))+'%"></span>':'')+'</div>';
}
// Usage card in Calendar: selected day, its week (Mon-Sun) and all-time totals
function usageCard(selDs,noPr){
  usageFlush();
  var en=en_(), sd=parseYmd(selDs), mon=addDays(sd,-((sd.getDay()+6)%7)), days=[], wkT=0, wkP=0, mx=60;
  for(var i=0;i<7;i++){ var d=addDays(mon,i), k=ymd(d), u=useSec(k), p=plogSec(k); days.push({d:d,k:k,u:u,p:p}); wkT+=u; wkP+=p; mx=Math.max(mx,u,p); }
  var all=Object.keys(USAGE).sort(), tot=0, ptot=0; all.forEach(function(k){ tot+=USAGE[k].t; }); PLOG.forEach(function(r){ ptot+=r.sec; });
  var act=all.filter(function(k){ return USAGE[k].t>=30; }).length;
  var dU=useSec(selDs), dP=plogSec(selDs), vv=USAGE[selDs]?USAGE[selDs].v:{};
  var VN={home:T("utama"),solat:T("solat"),sunat:T("sunat"),learn:T("learn"),halal:T("halal"),cal:T("cal"),more:T("more"),kids:T("kids"),rakaat:L2x("Kira rakaat","Rakaat counter")};
  var vtop=Object.keys(vv).map(function(k){ return [k.split(":")[0],vv[k]]; }).reduce(function(m,x){ m[x[0]]=(m[x[0]]||0)+x[1]; return m; },{});
  vtop=Object.keys(vtop).map(function(k){ return [k,vtop[k]]; }).sort(function(a,b){ return b[1]-a[1]; }).slice(0,5);
  var h='<div class="card ucard"><h3>⏱ '+L2x("Masa penggunaan","Time spent")+'</h3>';
  h+='<div class="urow"><div><div class="mut tiny">'+esc(sd.toLocaleDateString(locTag(),{weekday:"short",day:"numeric",month:"short"}))+'</div><div class="ubig">'+durEn(dU)+'</div><div class="mut tiny">'+L2x("dalam aplikasi","in the app")+'</div></div>'+
     '<div><div class="mut tiny">'+L2x("Solat (kiraan)","Prayer (counter)")+'</div><div class="ubig gold">'+durEn(dP)+'</div><div class="mut tiny">'+plogDay(selDs).length+L2x(" sesi"," sessions")+'</div></div></div>';
  h+='<div class="ubar1"><i style="width:'+Math.min(100,Math.round(dU*100/Math.max(dU,3600)))+'%"></i></div>';
  if(vtop.length) h+='<div class="uvs">'+vtop.map(function(x){ return '<span>'+esc(VN[x[0]]||x[0])+' <b>'+durEn(x[1])+'</b></span>'; }).join("")+'</div>';
  h+='<div class="snl" style="margin-top:12px">'+L2x("Minggu ini","This week")+' · '+durEn(wkT)+' <span class="mut tiny">('+L2x("solat ","prayer ")+durEn(wkP)+')</span></div><div class="uweek">'+days.map(function(x){
    return '<div class="uw'+(x.k===selDs?' sel':'')+'" data-d="'+x.k+'"><div class="uwb"><i class="a" style="height:'+Math.round(x.u*100/mx)+'%"></i><i class="p" style="height:'+Math.round(x.p*100/mx)+'%"></i></div><div class="uwl">'+x.d.toLocaleDateString(locTag(),{weekday:"narrow"})+'</div><div class="uwv">'+(x.u?durEn(x.u):'')+'</div></div>'; }).join("")+'</div>';
  h+='<div class="legend" style="margin-top:4px"><span><i style="background:var(--green)"></i>'+L2x("Aplikasi","App")+'</span><span><i style="background:var(--gold)"></i>'+L2x("Solat","Prayer")+'</span></div>';
  h+='<div class="snl" style="margin-top:12px">'+L2x("Keseluruhan","Overall")+'</div><div class="urow3"><div><b>'+durEn(tot)+'</b><span class="mut tiny">'+L2x("jumlah","total")+'</span></div><div><b>'+durEn(act?tot/act:0)+'</b><span class="mut tiny">'+L2x("purata sehari","daily average")+'</span></div><div><b>'+durEn(ptot)+'</b><span class="mut tiny">'+L2x("solat dikira","prayer counted")+'</span></div></div>'+
     '<div class="mut tiny" style="margin-top:4px">'+(all.length?L2x("Sejak ","Since ")+parseYmd(all[0]).toLocaleDateString(locTag(),{day:"numeric",month:"short",year:"numeric"})+' · '+act+L2x(" hari aktif"," active days"):L2x("Mula direkod hari ini.","Recording starts today."))+'</div>';
  if(noPr) return h+'</div>';
  // which prayers were counted that day
  var pl=plogDay(selDs);
  h+='<div class="snl" style="margin-top:12px">'+L2x("Solat hari ini","Prayers that day")+'</div>'+prRegister(selDs,false);
  if(pl.length) h+='<div class="plist">'+pl.map(function(r){ return '<div class="pli"><span>'+hm12(r.t0)+'</span><b>'+esc(r.n)+'</b><span class="mut tiny">'+L2x("waktu ","in ")+T(r.w)+'</span><span>'+num(r.c)+'/'+r.tg+'</span><span>'+durEn(r.sec)+'</span></div>'; }).join("")+'</div>';
  return h+'</div>';
}
/* 0.5.99 (owner): Month → Planner. Planner is the first chip and the default; Gregorian and Hijri are the month grids. */
// 0.7.77 (owner): Time > Track = 📊 Stats · 📅 Gregorian · 🌙 Hijri (Stats is not in the iPhone app)
function trackDock(){ var c=SUB2.trk||(IOS?"g":"stats"), T3=[["stats","📊","Statistik","Stats"],["g","📅","Gregori","Gregorian"],["h","🌙","Hijrah","Hijri"]].filter(function(x){ return !(IOS && x[0]==="stats"); });
  return '<div class="lfNav trkNav" style="grid-template-columns:repeat('+T3.length+',minmax(0,1fr))">'+T3.map(function(x){ return '<button class="'+(c===x[0]?"on":"")+'" data-trk="'+x[0]+'"><span>'+x[1]+'</span>'+esc(L2x(x[2],x[3]))+'</button>'; }).join("")+'</div>'; }
function bindTrk(el){ el.querySelectorAll("[data-trk]").forEach(function(b){ b.onclick=function(){ var m=b.getAttribute("data-trk"); if(m===(SUB2.trk||(IOS?"g":"stats"))) return; SUB2.trk=m;
    if(m!=="stats"){ var now=new Date(); if(cal.y===null){ cal.y=now.getFullYear(); cal.m=now.getMonth(); cal.sel=ymd(now); } var sd=parseYmd(cal.sel||ymd(now)), hs=hijriOf(sd); if(m==="h" && hs){ cal.hy=hs.y; cal.hm=hs.m; } else { cal.y=sd.getFullYear(); cal.m=sd.getMonth(); } cal.mode=m; }
    render(); }; }); try{ dockFix(); }catch(e){} }
function calDockGH(){ return trackDock(); }
function calDockGH_old(){ var en=S.lang==="en", m=cal.mode||"p"; return '<div class="grp3"><button class="chip '+(m==="p"?"on":"")+'" data-cm="p">📝 '+(en?"Planner":"Perancang")+'</button><button class="chip '+(m==="g"?"on":"")+'" data-cm="g">📅 '+(en?"Gregorian":"Masihi")+'</button><button class="chip '+(m==="h"?"on":"")+'" data-cm="h">🌙 '+(en?"Hijri":"Hijrah")+'</button></div>'; }
function calCmBind(el){ bindTrk(el); }
function calCmBind_old(el){ el.querySelectorAll("[data-cm]").forEach(function(b){ b.onclick=function(){ var m=b.getAttribute("data-cm"); if(m===(cal.mode||"p")) return; cal.mode=m;
    if(m!=="p"){ var now=new Date(); if(cal.y===null){ cal.y=now.getFullYear(); cal.m=now.getMonth(); cal.sel=ymd(now); } var sd=parseYmd(cal.sel), hs=hijriOf(sd); if(m==="h" && hs){ cal.hy=hs.y; cal.hm=hs.m; } else { cal.y=sd.getFullYear(); cal.m=sd.getMonth(); } } render(); }; }); }
// 0.7.77 (owner): Time > Planner = Today · Plan · Goals · Habits · Focus · Me (Focus merged in, Grow inside Goals).
var PLT=[["today","☀️","Hari ini","Today"],["plan","📋","Rancang","Plan"],["goals","🎯","Matlamat","Goals"],["habits","🔁","Tabiat","Habits"],["focus","⏱","Fokus","Focus"],["me","👤","Saya","Me"]];
function plDock(){ var c=SUB2.plt||"today"; return '<div class="dock plHubD"><div class="lfNav" style="grid-template-columns:repeat('+PLT.length+',minmax(0,1fr))">'+PLT.map(function(x){ return '<button class="'+(c===x[0]?"on":"")+'" data-plt="'+x[0]+'"><span>'+x[1]+'</span>'+esc(L2x(x[2],x[3]))+'</button>'; }).join("")+'</div></div>'; }
function bindPlt(el){ el.querySelectorAll("[data-plt]").forEach(function(b){ b.onclick=function(){ SUB2.plt=b.getAttribute("data-plt"); render(); var v=document.getElementById("view"); if(v) v.scrollTop=0; }; }); try{ dockFix(); }catch(e){} }
function plDayTasks(){ try{ if(!window.PlannerView || !PlannerView.dayItems) return {n:0, k:0}; var l=PlannerView.dayItems(planH(), ymd(new Date())); return {n:l.length, k:l.filter(function(x){ return x.done; }).length}; }catch(e){ return {n:0, k:0}; } }
// Today's timeline: the 5 prayers as anchors, planner tasks (tick here), Gather events and the children's planner, in time order
function plTimeline(host, redraw){ var now=new Date(), k=ymd(now), t=getDay(now)||{}, rows=[], nm=now.getHours()*60+now.getMinutes(), mm=function(x){ var m=/^(\d{1,2}):(\d{2})/.exec(x||""); return m?(+m[1])*60+(+m[2]):9999; };
  ["subuh","zohor","asar","maghrib","isyak"].forEach(function(p){ if(t[p]) rows.push({tm:t[p], ic:"🕌", n:T(p), k:"pray"}); });
  try{ if(window.PlannerView && PlannerView.dayItems) PlannerView.dayItems(planH(), k).forEach(function(x){ rows.push({tm:x.tm, ic:"", n:x.n, k:"task", id:x.id, done:x.done}); }); }catch(e){}
  try{ var ev=load("ihsan_events",null); ((ev&&ev.list)||[]).forEach(function(e){ if(e.d===k) rows.push({tm:e.t||"", ic:"🎉", n:e.n, k:"ev"}); }); }catch(e){}
  try{ var kp=load("ihsan_kplan",null); if(kp && window.KPlan) kprof().list.forEach(function(kd){ if(!kp[kd.id]) return; var kid={id:kd.id, n:kd.n, e:kd.e}; KPlan.summary(kpH(kd), kid); KPlan._t.items(kid, now).forEach(function(x){ if(x.k==="ev"||x.k==="hw"||x.k==="home") rows.push({tm:x.t||"", ic:x.ic||"🧒", n:(kd.e||"🧒")+" "+kd.n+": "+x.n, k:"kid"}); }); }); }catch(e){}
  rows.sort(function(a,b){ return mm(a.tm)-mm(b.tm); }); var nowAt=-1; rows.some(function(r,i){ if(mm(r.tm)>nm && mm(r.tm)<9999){ nowAt=i; return true; } return false; });
  host.innerHTML='<div class="card plTl"><div class="row"><h3 style="margin:0">🗓 '+L2x("Hari ini","Today")+'</h3><span><button class="chip g3d" id="tlAdd">＋ '+L2x("Tugasan","Task")+'</button> <button class="chip g3d gold" id="tlFo">⏱ '+L2x("Mula fokus","Start focus")+'</button></span></div>'+
    (rows.length?rows.map(function(r,i){ return (i===nowAt?'<div class="tlNow"><i></i>'+L2x("Sekarang","Now")+' · '+fmt12(pad(now.getHours())+":"+pad(now.getMinutes()))+'</div>':'')+'<div class="tlR k-'+r.k+(r.done?' ok':'')+'">'+'<span class="tlT">'+(r.tm?fmt12(r.tm):"—")+'</span>'+(r.k==="task"?'<button class="tlTk" data-tlt="'+r.id+'">'+(r.done?"✓":"")+'</button>':'<span class="tlI">'+r.ic+'</span>')+'<span class="tlN">'+esc(r.n)+'</span></div>'; }).join(""):'<div class="mut small">…</div>')+'</div>';
  host.querySelectorAll("[data-tlt]").forEach(function(b){ b.onclick=function(){ try{ PlannerView.tick(planH(), k, b.getAttribute("data-tlt")); if(window.N && N.vibrate) N.vibrate(20); }catch(e){} redraw(); }; });
  host.querySelector("#tlFo").onclick=function(){ SUB2.plt="focus"; render(); };
  host.querySelector("#tlAdd").onclick=function(){ SUB2.plt="plan"; render(); }; }
function plHub(el){ var c=SUB2.plt||"today"; if(!PLT.some(function(x){ return x[0]===c; })) c=SUB2.plt="today";
  if(c==="plan"){ el.innerHTML='<div id="plBox"><div class="mut small" style="padding:16px">…</div></div>'+csCard()+plDock(); bindCs(el); bindPlt(el);
    loadJs(["planner/planner.js"], function(){ var bx=el.querySelector("#plBox"); if(bx && window.PlannerView) PlannerView.render(bx, planH()); }); return; }
  foCss(); el.innerHTML='<div id="plGw"><div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div></div>'+plDock(); bindPlt(el); var host=el.querySelector("#plGw");
  var go_=function(){ if(!document.body.contains(host)) return; var h=focusH(); h.hostDock=true; h.page=c; h.dayTasks=plDayTasks; h.timeline=plTimeline;
    h.onPage=function(p){ var to=p==="grow"?"goals":p; if(PLT.some(function(x){ return x[0]===to; })){ SUB2.plt=to; render(); var v=document.getElementById("view"); if(v) v.scrollTop=0; return true; } return false; };
    try{ GrowView.view(host, h); }catch(err){ console.error(err); host.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } try{ dockFix(); }catch(e){} };
  var need=[]; if(!window.GrowView) need=need.concat(GWJS); if(!window.PlannerView) need.push("planner/planner.js"); if(c==="today" && !window.KPlan && load("ihsan_kplan",null)) need.push("kplan/kplan.js");
  if(need.length) loadJs(need, go_, function(){ host.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; }); else go_(); }
function vPlanner(el){ el.innerHTML='<div id="plBox"><div class="mut small" style="padding:16px">…</div></div>'+csCard()+'<div class="dock">'+calDockGH()+'</div>'; calCmBind(el); bindCs(el);
  loadJs(["planner/planner.js"], function(){ var bx=el.querySelector("#plBox"); if(bx && window.PlannerView) PlannerView.render(bx, planH()); }); }
// 0.6.44: the planner also needs prayer times (items "10 min after Asar") and the Hijri date
function planH(){ var h=finH(); h.prayerTimes=function(){ return upcoming(9); }; h.hijriStr=hijriStr; return h; }
function vCal0(el){
  var now=new Date(); if(cal.y===null){ cal.y=now.getFullYear(); cal.m=now.getMonth(); cal.sel=ymd(now); }
  var tds=ymd(now), en=S.lang==="en", MO=en?ME:MS;
  usageFlush(); cal.uMax=0; Object.keys(USAGE).forEach(function(k){ cal.uMax=Math.max(cal.uMax,USAGE[k].t); }); cal.uMax=Math.max(cal.uMax,1800);
  if(cal.hy==null){ var h0=hijriOf(now); if(h0){ cal.hy=h0.y; cal.hm=h0.m; } }
  var html=countdownBoxes()+'<div class="kadRow"><button class="chip" data-kad="">🎴 '+L2x("Buat kad ucapan","Make a greeting card")+'</button></div>';
  JNd=jnData().d;
  var dockGH=calDockGH(), dock='<div class="dock">';
  var hdr, sub, cells=[], lead;
  if(cal.mode==="h" && cal.hy!=null){
    var st=hijriToDate(cal.hy,cal.hm,1), len=0;
    if(st){ for(var k=0;k<31;k++){ var hd=hijriOf(addDays(st,k)); if(!hd||hd.m!==cal.hm) break; len++; } }
    hdr=HIJRI_MONTHS[cal.hm-1]+" "+cal.hy+"H";
    var gEnd=st?addDays(st,len-1):null; sub=st?(MO[st.getMonth()]+(st.getMonth()!==gEnd.getMonth()?" – "+MO[gEnd.getMonth()]:"")+" "+gEnd.getFullYear()):"";
    lead=st?(st.getDay()+6)%7:0;
    for(var k2=0;k2<len;k2++){ var dt=addDays(st,k2); cells.push(calCell(dt, k2+1, dt.getDate()+(dt.getDate()===1?" "+MO[dt.getMonth()].slice(0,3):""), false, tds)); }
  } else {
    var first=new Date(cal.y,cal.m,1), dim=new Date(cal.y,cal.m+1,0).getDate();
    var h1=hijriOf(first), h2=hijriOf(new Date(cal.y,cal.m,dim));
    hdr=MO[cal.m]+" "+cal.y; sub=h1&&h2?(HIJRI_MONTHS[h1.m-1]+(h1.m!==h2.m?" – "+HIJRI_MONTHS[h2.m-1]:"")+" "+h2.y+"H"):"";
    lead=(first.getDay()+6)%7;
    for(var d=1; d<=dim; d++){ var dt2=new Date(cal.y,cal.m,d), hj=hijriOf(dt2); cells.push(calCell(dt2, d, hj?hj.d+(hj.d===1?" "+HIJRI_MONTHS[hj.m-1].slice(0,3):""):"", true, tds)); }
  }
  // 0.26.0 (Farah): Export, holiday layers and All states sit at the top of the calendar
  // 0.5.20 (review 15): Export is an action, so it sits apart (top right) from the filter chips
  html+='<div class="calAct"><span class="mut small">'+(en?"Show":"Tunjuk")+'</span><button class="btn alt g3d" id="cExp">⇪ '+(en?"Export":"Eksport")+'</button></div><div class="chips calTop"><button class="chip g3d '+(cal.lay.ph?"on":"")+'" data-l="ph">'+T("ph")+'</button><button class="chip g3d '+(cal.lay.sc?"on":"")+'" data-l="sc">'+T("sc")+'</button><button class="chip g3d '+(cal.lay.is?"on":"")+'" data-l="is">'+T("is")+'</button><button class="chip g3d '+(cal.all?"on":"")+'" id="cAll">'+T("allst")+'</button></div>';
  html+='<div class="card" id="calCard"><div class="row"><button class="chip" id="cPrev">‹</button><div style="text-align:center"><div style="font-weight:700;font-size:17px">'+hdr+'</div><div style="color:var(--gold);font-size:12px">'+sub+'</div></div><button class="chip" id="cNext">›</button></div>';
  html+='<div class="legend"><span><i class="ph"></i>'+T("ph")+'</span><span><i class="sc"></i>'+T("sc")+'</span><span><i class="is"></i>'+T("is")+'</span></div>';
  html+='<div class="cal">'+(en?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]:["Isn","Sel","Rab","Kha","Jum","Sab","Ahd"]).map(function(d){return '<div class="h">'+d+'</div>';}).join("");
  for(var i=0;i<lead;i++) html+='<div class="d out"></div>';
  html+=cells.join("");
  dock+=dockGH+'</div>';
  html+='</div><div class="mut small" style="margin-top:8px">'+T("state")+': <b>'+STATES[S.state]+'</b> · '+(S.lang==="en"?"School group ":"Kumpulan sekolah ")+groupOf(S.state)+'</div></div>';
  // selected day details
  var sd=parseYmd(cal.sel), sh=hijriOf(sd), list=[];
  (grpDays()[cal.sel]||[]).forEach(function(x){ list.push('<div class="ev"><i class="gp" style="background:'+esc(x.color)+'"></i><div><b>'+esc(x.title)+'</b><div class="mut small">'+esc(x.group)+' · '+new Date(x.when).toLocaleTimeString(locTag(),{hour:"2-digit",minute:"2-digit"})+(x.place?' · 📍 '+esc(x.place):'')+'</div></div></div>'); });
  holidaysOn(cal.sel,cal.all).forEach(function(x){ list.push('<div class="ev"><i class="ph"></i><div><b>'+esc(tr(x))+'</b><div class="mut small">'+esc(x.where)+'</div></div></div>'); });
  schoolOn(cal.sel,cal.all).forEach(function(x){ list.push('<div class="ev"><i class="sc"></i><div><b>'+esc(tr(x))+'</b><div class="mut small">'+esc(x.where)+'</div></div></div>'); });
  islamicOn(sd).forEach(function(x){ list.push('<div class="ev"><i class="is"></i><div><b>'+esc(tr(x))+'</b></div></div>'); });
  sunnahFastOn(sd).forEach(function(x){ list.push('<div class="ev"><i style="background:#666"></i><div>'+esc(tr(x))+'</div></div>'); });
  var dl=sd.toLocaleDateString(ibLoc(S.lang==="en"),{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  html+='<div class="card"><h3>'+esc(dl)+'</h3><div style="color:var(--gold)">'+hijriStr(sh)+(sh&&sh.src!=="jakim"?' <span class="badge warn">'+(S.lang==="en"?"estimate":"anggaran")+'</span>':'')+'</div>'+(list.length?list.join(""):'<div class="mut small" style="margin-top:6px">'+(S.lang==="en"?"No holidays or Islamic days.":"Tiada cuti atau hari kebesaran.")+'</div>')+'</div>';
  var kOcc=sh?(sh.m===10&&sh.d<=7?"fitri":sh.m===12&&sh.d>=9&&sh.d<=13?"adha":sh.m===9?"ramadan":sh.m===1&&sh.d<=10?"hijrah":""):"";
  if(kOcc) html+='<div class="kadRow"><button class="chip" data-kad="'+kOcc+'">🎴 '+L2x("Buat kad ","Make a card: ")+L2x(KAD_OCC.filter(function(o){ return o[0]===kOcc; })[0][1],KAD_OCC.filter(function(o){ return o[0]===kOcc; })[0][2])+'</button></div>';
  // 0.6.68 (owner): the Ramadan tracker lives in the Hijri calendar (Ramadan shown, or the month before it with the countdown)
  if(cal.mode==="h" && (cal.hm===9 || cal.hm===8 || S.ramadanForce)) html+=(cal.hm===8?countdownBoxes():"")+ramadanMonth();
  html+=jnCard(cal.sel);
  html+=usageCard(cal.sel);
  html+='<div class="mut small" style="padding:0 4px 10px">'+(S.lang==="en"?"Holiday data: 2026 federal & state gazette and KPM academic calendar. Islamic-calendar holidays depend on the official moon-sighting announcement.":"Data cuti: warta persekutuan & negeri 2026 dan Kalendar Akademik KPM. Cuti berasaskan kalendar Islam tertakluk kepada pengisytiharan rasmi.")+'</div>';
  html+=miniYear(now.getFullYear())+miniYear(now.getFullYear()+1);
  el.innerHTML=html+dock;
  el.querySelectorAll("[data-mm]").forEach(function(c){ c.onclick=function(){ cal.y=+c.getAttribute("data-my"); cal.m=+c.getAttribute("data-mm"); cal.sel=ymd(new Date(cal.y,cal.m,1)); render(); document.getElementById("view").scrollTop=0; }; });
  var step=function(dir, noDraw){
    if(cal.mode==="h"){ cal.hm+=dir; if(cal.hm<1){cal.hm=12;cal.hy--;} if(cal.hm>12){cal.hm=1;cal.hy++;} var d1=hijriToDate(cal.hy,cal.hm,1); if(d1) cal.sel=ymd(d1); }
    else { cal.m+=dir; if(cal.m<0){cal.m=11;cal.y--;} if(cal.m>11){cal.m=0;cal.y++;} cal.sel=ymd(new Date(cal.y,cal.m,1)); }
    if(!noDraw) render();
  };
  el.querySelector("#cPrev").onclick=function(){ step(-1); };
  el.querySelector("#cNext").onclick=function(){ step(1); };
  // 0.33.0: the month follows the finger, the next one slides in
  // 0.34.0: the next month rides in beside it while you drag (no gap)
  IbSwipe(el.querySelector("#calCard"), {can:function(){ return true; }, go:function(s){ var y=document.getElementById("view").scrollTop; step(s<0?1:-1); document.getElementById("view").scrollTop=y; IbSwipe.inFrom(document.querySelector("#calCard"), s); },
    find:function(){ return document.querySelector("#view #calCard"); },
    peek:function(s){ var c0=JSON.stringify({y:cal.y,m:cal.m,hy:cal.hy,hm:cal.hm,sel:cal.sel}), b=IbSwipe.shot(function(){ step(s<0?1:-1, true); }, vCal0, function(){ var c1=JSON.parse(c0); for(var k in c1) cal[k]=c1[k]; JNd=jnData().d; });
      return b && b.querySelector("#calCard"); }});
  calCmBind(el);
  el.querySelectorAll("[data-d]").forEach(function(c){ c.onclick=function(){ cal.sel=c.getAttribute("data-d"); render(); }; });
  el.querySelectorAll("[data-l]").forEach(function(c){ c.onclick=function(){ var l=c.getAttribute("data-l"); cal.lay[l]=!cal.lay[l]; render(); }; });
  el.querySelector("#cAll").onclick=function(){ cal.all=!cal.all; render(); };
  el.querySelector("#cExp").onclick=function(){ calExportSheet(); };
  if(el.querySelector("[data-rmd]")) bindRamadan(el);
}

// MORE / SETTINGS
function sw(id, on){ return '<label class="switch"><input type="checkbox" id="'+id+'" '+(on?"checked":"")+'><span></span></label>'; }
function vMore0(el){
  var html=finderCard();
  html+='<div class="card cmp shmCard"><h3>📈 '+L2x("Saham patuh Syariah","Shariah-compliant stocks")+'</h3><div class="mut small">'+L2x("Senarai rasmi SC, saham simpanan anda dan saringan sendiri.","The official SC list, your saved stocks and a self-screen.")+'</div><button class="btn alt full" data-saham="1" style="margin-top:8px">'+L2x("Buka","Open")+'</button></div>';
  // settings
  var en=S.lang==="en";
  var zopts=Object.keys(STATES).map(function(st){ var zs=ZONES.filter(function(z){return z[1]===st;}); if(!zs.length) return ""; return '<optgroup label="'+STATES[st]+'">'+zs.map(function(z){return '<option value="'+z[0]+'" '+(z[0]===S.zone?"selected":"")+'>'+z[0]+' · '+esc(z[2])+'</option>';}).join("")+'</optgroup>'; }).join("");
  html+='<div class="card cmp"><h3>🌐 '+(en?"Language & text":"Bahasa & teks")+'</h3>'+
   '<div class="set"><span style="flex:none">'+T("lang")+'</span><select id="sLang" style="flex:1;min-width:0;max-width:62%;padding:6px">'+ULANGS.map(function(x){ return '<option value="'+x[0]+'" '+((S.ulang||S.lang)===x[0]?"selected":"")+'>'+x[1]+'</option>'; }).join("")+'</select></div>'+
   '<div class="set"><span>'+L2x("Mata wang (Kewangan)","Currency (Finance)")+'</span><select id="sFinCur" style="max-width:55%;padding:6px"><option value="">'+L2x("Auto","Auto")+' · '+curNow()+'</option>'+["RM","SAR","AED","QAR","KWD","BHD","OMR","JOD","EGP","MAD","TRY","SGD","IDR","BND","USD","EUR","GBP"].map(function(c){ return '<option value="'+c+'"'+(S.finCur===c?" selected":"")+'>'+c+'</option>'; }).join("")+'</select></div>'+
   (S.ulang==="ar"?'<div class="set"><span>'+L2x("Angka Arab-Hindi (٠١٢٣)","Arabic-Indic digits (٠١٢٣)")+'</span><input type="checkbox" id="sArNum"'+(S.arNum?" checked":"")+'></div><div class="set"><span>'+L2x("Tunjuk makna doa & zikir","Show doa & zikir meanings")+'</span><input type="checkbox" id="sArMean"'+(S.arMean?" checked":"")+'></div><div class="mut tiny" style="padding:0 4px 6px">'+L2x("Bahasa Arab (Fasa 1): menu dan butang diterjemah secara automatik dan perlu disemak oleh penutur asli. Panduan panjang masih dalam bahasa Inggeris.","Arabic (Phase 1): menus and buttons are machine-translated and need review by a native speaker. Long guides are still in English.")+'</div>':'')+
   '<div class="set"><span>'+(en?"Show translation (meaning)":"Papar terjemahan (maksud)")+'</span>'+sw("sTr",S.showTr)+'</div>'+
   '<div class="set"><span>'+L2x("Papar bacaan Rumi","Show Rumi reading")+'</span>'+sw("sRumi",S.showRumi)+'</div>'+
   (S.showRumi?'<div class="mut tiny" style="margin:-2px 0 6px">'+L2x("Rumi dijana automatik dari teks Arab dan mungkin tidak tepat sepenuhnya. Utamakan bacaan Arab.","Rumi is generated automatically from the Arabic and may not be fully accurate. The Arabic takes priority.")+'</div>':'')+

   '<div class="set"><span>'+L2x("Nada suara","Voice pitch")+'</span>'+chipSet("data-pitch",S.pitch||0.8,[[1,L2x("Biasa","Normal")],[0.8,L2x("Dalam","Deep")],[0.65,L2x("Lebih dalam","Deeper")]])+'</div>'+
   '<div class="set"><span>'+(en?"Arabic font":"Fon Arab")+'</span><span class="chips" style="margin:0">'+AR_FONTS.map(function(f){return '<button class="chip '+(S.arFont===f[0]?"on":"")+'" data-font="'+f[0]+'">'+(en?f[2]:f[1])+'</button>';}).join("")+'</span></div>'+
   '<div class="set"><span>'+T("arsize")+'</span><span class="row"><button class="chip" id="aMinus">A−</button><b>'+S.arSize+'</b><button class="chip" id="aPlus">A+</button></span></div>'+
   '<div class="ar" style="text-align:center;padding:2px 0 0">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div></div>';
  html+='<div class="card cmp"><h3>⚙️ '+T("settings")+'</h3>'+
   '<div class="set"><span style="flex:none">'+T("zone")+'</span><span class="row" style="gap:6px;flex:1;min-width:0"><select id="sZone" style="flex:1;min-width:0;padding:6px">'+zopts+'</select><button class="chip" id="sDetect" title="'+T("detect")+'">📍</button></span></div>'+
   '<div class="set"><span style="flex:none">'+T("state")+'</span><select id="sState" style="flex:1;min-width:0;padding:6px">'+Object.keys(STATES).map(function(s){return '<option value="'+s+'" '+(s===S.state?"selected":"")+'>'+STATES[s]+'</option>';}).join("")+'</select></div>'+
   '<div class="set"><span>'+T("hoff")+'</span><span class="row"><button class="chip" id="hMinus">−</button><b>'+(S.hijriOffset>0?"+":"")+S.hijriOffset+'</b><button class="chip" id="hPlus">+</button></span></div>'+
   '<div class="set"><span>'+(en?"Sources as links":"Sumber sebagai pautan")+'</span>'+sw("sLinks",S.srcLinks)+'</div></div>';
  html+='<div class="card cmp"><h3>🎨 '+T("apptheme")+'</h3><div class="throw noDrop thRows">'+APP_THEMES.filter(function(t){ return t[0]!=="night"; }).map(function(t){ var r=THEME_ROW[t[0]]||[t[2],"#fff"], on=S.appTheme===t[0];
    return '<button class="ths thRow '+(on?"on":"")+'" data-th="'+t[0]+'" style="background:'+r[0]+';color:'+r[1]+'"><span class="thN">'+esc(en?t[4]:t[1])+'</span><span class="thD"><i style="background:'+t[2]+'"></i><i style="background:'+t[3]+'"></i>'+(on?'<b>✓</b>':'')+'</span></button>'; }).join("")+'</div></div>';
  html+='<div class="card cmp"><h3>🔔 '+T("notifs")+'</h3><div class="nrow">'+PR.map(function(k){return '<button class="chip '+(S.notif[k]?"on":"")+'" data-nt="'+k+'">'+T(k)+'</button>';}).join("")+'</div>'+
   '<div class="set"><span>'+T("countdownN")+'</span>'+sw("sCount",S.countdown)+'</div>'+
   '<div class="set"><span>'+T("pre")+'</span><span class="chips" style="margin:0">'+[0,5,10,15].map(function(m){return '<button class="chip '+(S.preMin===m?"on":"")+'" data-pre="'+m+'">'+(m?m+"m":(en?"Off":"Tutup"))+'</button>';}).join("")+'</span></div>'+
   '<div class="nrow act" style="margin-top:8px"><button class="chip" id="sNotif">'+(en?"Allow":"Benarkan")+'</button><button class="chip" id="sExact">'+T("exact")+'</button><button class="chip" id="sTest">'+T("test")+'</button></div></div>';
  html+=moreNewCards();
  html+=rkSetCard();
  html+='<div class="card cmp"><h3>🤲 '+T("rakaat")+'</h3>'+
   '<div class="set"><span>'+(S.lang==="en"?"Silent while counting":"Senyap semasa mengira")+'</span>'+sw("sQuiet",S.quietPray)+'</div>'+
   '<div class="mut tiny" style="margin:-2px 0 6px">'+(N.hasPerm("dnd")?(S.lang==="en"?"Do Not Disturb access: allowed. Calls and notifications are silenced, alarms still ring.":"Akses Jangan Ganggu: dibenarkan. Panggilan dan notifikasi disenyapkan, penggera masih berbunyi."):(S.lang==="en"?"Without Do Not Disturb access, the phone only switches to vibrate. ":"Tanpa akses Jangan Ganggu, telefon hanya bertukar ke mod getar. ")+'<a href="#" id="sDnd">'+(S.lang==="en"?"Allow access":"Benarkan akses")+'</a>')+'</div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Tap step":"Langkah ketik")+'</span><span class="chips" style="margin:0"><button class="chip '+(S.tapStep===0.5?"on":"")+'" data-step="0.5">0.5</button><button class="chip '+(S.tapStep===1?"on":"")+'" data-step="1">1</button></span></div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Vibrate on each count":"Getar setiap kiraan")+'</span>'+sw("sVib",S.vib)+'</div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Detect by face size":"Kesan saiz wajah")+'</span>'+sw("dFace",S.sujud.face)+'</div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Detect by darkness (camera covered)":"Kesan kegelapan (kamera terlindung)")+'</span>'+sw("dLight",S.sujud.light)+'</div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Detect by proximity sensor":"Kesan sensor jarak")+'</span>'+sw("dProx",S.sujud.prox)+'</div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Show sensor status":"Papar status sensor")+'</span>'+sw("sStat",S.showStat)+'</div>'+
   '<div class="set"><span>'+(S.lang==="en"?"Face threshold":"Ambang wajah")+'</span><b>'+S.sujud.threshold.toFixed(2)+'</b></div>'+
   '<button class="btn alt full" id="sCalib" style="margin-top:8px">🎯 '+T("calib")+'</button></div>';
  html+=mqCard();
  html+='<div class="card" id="aboutCard"><h3>ℹ️ '+T("about")+'</h3><div class="small" style="line-height:1.55"><img src="logo.svg" alt="" width="56" height="56" style="border-radius:14px;float:right;margin:0 0 6px 10px">My Ihsan 0.7.88 ('+L2x("prototaip","prototype")+').<br>'+(S.lang==="en"?"Prayer times: JAKIM e-Solat (estimate shown until data loads). All Arabic text, translations and hadith references are pending review by a qualified ustaz. Please report errors. Camera frames are processed on the phone only and never saved or sent. Halal checker: the ingredient database and list work on the phone; label photos are read by the online AI you choose; its verdicts are a guide only, not a fatwa. Recipe builder: recipes are read from the shared page or post (or by the online AI you choose for posts, photos and videos); halal swaps come from the swap table in the app and are a guide only, not a fatwa. Hajj & Umrah 3D uses Three.js (MIT licence), bundled in the app; the scene is stylised and not to scale. Umrah DIY maps use MapLibre GL (BSD licence) with map data © OpenStreetMap contributors via OpenFreeMap; prices and distances are estimates. Al-Quran: KFGQPC Uthmani Hafs text and font (King Fahd Complex) via quran.ws (CC BY 4.0); tajwid text and word meanings from Quran.com; English by Saheeh International; Malay by Abdullah Muhammad Basmeih (downloaded from AlQuran Cloud); recitation by Mishary Rashid Alafasy (EveryAyah); tafsir, surah introductions and Indonesian word meanings from Quran.com; word roots from the Quranic Arabic Corpus, University of Leeds (GPL). Shafi'i Fiqh mind map: chapter tree, ayat references and hadith from Fiqh Syafii by H. Idris Ahmad (Pustaka Antara), read from a scan and pending ustaz review. Books: PDFs are shown with pdf.js (Mozilla, Apache-2.0) and written with pdf-lib (MIT), both inside the app.":"Waktu solat: JAKIM e-Solat (anggaran dipaparkan sehingga data dimuatkan). Semua teks Arab, terjemahan dan rujukan hadis sedang menunggu semakan ustaz bertauliah. Sila laporkan kesilapan. Imej kamera diproses dalam telefon sahaja dan tidak disimpan atau dihantar. Penyemak halal: pangkalan data dan senarai ramuan berjalan di dalam telefon; gambar label dibaca oleh AI dalam talian yang anda pilih; keputusannya panduan sahaja, bukan fatwa. Pembina resepi: resepi dibaca daripada laman atau hantaran yang dikongsi (atau oleh AI dalam talian pilihan anda untuk hantaran, gambar dan video); tukaran halal daripada jadual tukaran dalam aplikasi, panduan sahaja dan bukan fatwa. Haji & Umrah 3D menggunakan Three.js (lesen MIT) yang disertakan dalam aplikasi; paparannya ilustrasi dan tidak mengikut skala. Peta Umrah DIY menggunakan MapLibre GL (lesen BSD) dengan data peta © penyumbang OpenStreetMap melalui OpenFreeMap; harga dan jarak ialah anggaran. Al-Quran: teks dan fon KFGQPC Uthmani Hafs (Kompleks Raja Fahd) melalui quran.ws (CC BY 4.0); teks tajwid dan maksud perkataan daripada Quran.com; terjemahan Inggeris Saheeh International; terjemahan Melayu Abdullah Muhammad Basmeih (dimuat turun daripada AlQuran Cloud); bacaan Mishary Rashid Alafasy (EveryAyah); tafsir, pengenalan surah dan maksud perkataan Bahasa Indonesia daripada Quran.com; akar kata daripada Quranic Arabic Corpus, Universiti Leeds (GPL). Peta minda Fiqh Syafi'i: susunan bab, rujukan ayat dan hadis daripada Fiqh Syafii oleh H. Idris Ahmad (Pustaka Antara), dibaca daripada imbasan dan menunggu semakan ustaz. Buku: PDF dipaparkan dengan pdf.js (Mozilla, Apache-2.0) dan ditulis dengan pdf-lib (MIT), kedua-duanya dalam aplikasi.")+'</div></div>';
  el.innerHTML=html;
  el.querySelectorAll("[data-maps]").forEach(function(b){ b.onclick=function(){ openFinder(b.getAttribute("data-maps")); }; });
  bindMoreNew(el); bindMq(el); bindRkSet(el.querySelector("#rkSetC"));
  var sSen=el.querySelector("#sSenior"); if(sSen) sSen.onchange=function(){ S.senior=this.checked; saveS(); applyZoom(); if(S.senior){ toast(L2x("Mod warga emas dihidupkan","Senior mode on")); go("home"); } else render(); };
  el.querySelector("#sQuiet").onchange=function(){ S.quietPray=this.checked; saveS(); if(S.quietPray && !N.hasPerm("dnd")) N.requestPerm("dnd"); render(); };
  var sd=el.querySelector("#sDnd"); if(sd) sd.onclick=function(e){ e.preventDefault(); N.requestPerm("dnd"); };
  el.querySelectorAll("[data-font]").forEach(function(b){ b.onclick=function(){ S.arFont=b.getAttribute("data-font"); saveS(); applyFont(); render(); }; });
  el.querySelector("#sLinks").onchange=function(){ S.srcLinks=this.checked; saveS(); };
  el.querySelectorAll("[data-th]").forEach(function(b){ b.onclick=function(){ S.appTheme=b.getAttribute("data-th"); saveS(); applyTheme(); render(); }; });
  var sFC=el.querySelector("#sFinCur"); if(sFC){ if(!S.finCur) sFC.value=""; sFC.onchange=function(){ S.finCur=this.value||""; saveS(); toast("💱 "+curNow()); }; }
  var sAN=el.querySelector("#sArNum"); if(sAN) sAN.onchange=function(){ S.arNum=this.checked; saveS(); arApply(); hdrLastDay=null; render(); };
  var sAM=el.querySelector("#sArMean"); if(sAM) sAM.onchange=function(){ S.arMean=this.checked; saveS(); arApply(); };
  el.querySelector("#sLang").onchange=function(){ setULang(this.value); pushHadith(); arLoad(function(){ render(); }); };
  el.querySelector("#sZone").onchange=function(){ S.zone=this.value; S.zoneAuto=false; if(S.locMode==="auto") S.overseas=false; S.state=zoneById(S.zone)[1]; saveS(); ensureData(true); render(); };
  el.querySelector("#sDetect").onclick=function(){ S.zoneAuto=true; askLocation(true); };
  el.querySelector("#sState").onchange=function(){ S.state=this.value; saveS(); render(); };
  el.querySelector("#hMinus").onclick=function(){ S.hijriOffset=Math.max(-2,S.hijriOffset-1); saveS(); render(); };
  el.querySelector("#hPlus").onclick=function(){ S.hijriOffset=Math.min(2,S.hijriOffset+1); saveS(); render(); };
  el.querySelector("#aMinus").onclick=function(){ S.arSize=Math.max(18,S.arSize-2); document.documentElement.style.setProperty('--arsize',S.arSize+'px'); saveS(); render(); };
  el.querySelector("#aPlus").onclick=function(){ S.arSize=Math.min(40,S.arSize+2); document.documentElement.style.setProperty('--arsize',S.arSize+'px'); saveS(); render(); };
  el.querySelectorAll("[data-nt]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-nt"); S.notif[k]=!S.notif[k]; saveS(); pushSchedule(); render(); }; });
  el.querySelector("#sTr").onchange=function(){ S.showTr=this.checked; saveS(); applyFont(); };
  el.querySelector("#sCount").onchange=function(){ S.countdown=this.checked; saveS(); };
  el.querySelectorAll("[data-pre]").forEach(function(b){ b.onclick=function(){ S.preMin=+b.getAttribute("data-pre"); saveS(); render(); }; });
  el.querySelector("#sNotif").onclick=function(){ N.requestPerm("notif"); };
  el.querySelector("#sExact").onclick=function(){ if(N.hasPerm("exact")) toast(S.lang==="en"?"Exact alarms already allowed":"Penggera tepat sudah dibenarkan"); else N.requestPerm("exact"); };
  el.querySelector("#sTest").onclick=function(){ if(!N.hasPerm("notif")) N.requestPerm("notif"); N.testNotification(); };
  el.querySelectorAll("[data-step]").forEach(function(b){ b.onclick=function(){ S.tapStep=+b.getAttribute("data-step"); saveS(); render(); }; });
  el.querySelector("#sVib").onchange=function(){ S.vib=this.checked; saveS(); };
  el.querySelector("#dFace").onchange=function(){ S.sujud.face=this.checked; saveS(); };
  el.querySelector("#dLight").onchange=function(){ S.sujud.light=this.checked; saveS(); };
  el.querySelector("#dProx").onchange=function(){ S.sujud.prox=this.checked; saveS(); };
  el.querySelector("#sStat").onchange=function(){ S.showStat=this.checked; saveS(); };
  el.querySelector("#sCalib").onclick=function(){ if(!N.hasPerm("camera")){ var hp=function(p){ if(p.which!=="camera") return; off("perm",hp); if(p.granted) calibrate(); }; on("perm",hp); N.requestPerm("camera"); } else calibrate(); };
}
function calibrate(){
  var ov=document.getElementById("overlay"); ov.className=""; var mx=0;
  ov.innerHTML='<div style="padding:24px;max-width:420px;width:100%;text-align:center"><h3 style="color:var(--gold)">🎯 '+T("calib")+'</h3><p class="small" style="line-height:1.5">'+(S.lang==="en"?"Place the phone where you will pray, front camera facing up. Do one practice sujud now, then rise.":"Letakkan telefon di tempat solat, kamera hadapan menghadap ke atas. Lakukan satu sujud latihan sekarang, kemudian bangun.")+'</p><div style="font-size:56px;font-weight:200" id="cVal">0.00</div><div class="mut small">'+(S.lang==="en"?"face size now · closest":"saiz wajah sekarang · paling dekat")+': <b id="cMax">0.00</b></div><div class="mut small" id="cHw" style="margin-top:6px"></div><div class="btns" style="margin-top:18px"><button class="btn gold" id="cSave">'+(S.lang==="en"?"Save":"Simpan")+'</button><button class="btn alt" id="cCancel">'+(S.lang==="en"?"Cancel":"Batal")+'</button></div></div>';
  var hs=function(r){ var f=r.face||0; if(f>mx) mx=f; ov.querySelector("#cVal").textContent=f.toFixed(2); ov.querySelector("#cMax").textContent=mx.toFixed(2); ov.querySelector("#cHw").textContent=r.faceHw?"":(S.lang==="en"?"This phone has no built-in face detection: use darkness or proximity detection, or tap mode.":"Telefon ini tiada pengesanan wajah terbina: guna pengesanan kegelapan atau sensor jarak, atau mod ketik."); };
  on("sujudStatus",hs); N.keepScreenOn(true,-1); N.startSujud(JSON.stringify({threshold:9,face:true,light:false,prox:false}));
  function end(){ off("sujudStatus",hs); N.stopSujud(); N.keepScreenOn(false,-1); applyTheme(); closeOverlay(); render(); }
  ov.querySelector("#cSave").onclick=function(){ if(mx>0.05){ S.sujud.threshold=Math.max(0.12, Math.round(mx*0.8*100)/100); saveS(); toast((S.lang==="en"?"Threshold saved: ":"Ambang disimpan: ")+S.sujud.threshold); } else toast(S.lang==="en"?"No face detected":"Tiada wajah dikesan"); end(); };
  ov.querySelector("#cCancel").onclick=end; ov._close=end;
}

// ================= 0.3.0 features =================
if(DOA.length===18){ DOA.push(DOA_SITUASI); DOA_GROUPS[1][2].push(18); }
var SAY=[], SHR=[], tbTap=null, onTasbihCount=null, darkTap=null, doaQ="", doaFav=false, learnPg=null;
function en_(){ return S.lang==="en"; }
function L2x(ms,en){ return S.lang==="en"?(S.ulang==="ar"?arTx(en):en):ms; }

// ---------- helpers ----------
function distKm(a1,o1,a2,o2){ var R=6371, dA=(a2-a1)*D2R, dO=(o2-o1)*D2R; var h=Math.sin(dA/2)*Math.sin(dA/2)+Math.cos(a1*D2R)*Math.cos(a2*D2R)*Math.sin(dO/2)*Math.sin(dO/2); return 2*R*Math.asin(Math.sqrt(h)); }
function musafirNow(){ if(S.musafirOn) return true; if(!S.musafirAuto||!S.home||S.lat==null) return false; return distKm(S.home.lat,S.home.lon,S.lat,S.lon)>=81; }
function adjAny(){ return PR.some(function(k){ return S.adj && S.adj[k]; }); }
function lastThirdMs(date){ var t=getDay(date), d2=addDays(date,1), t2=getDay(d2); var m=at(ymd(date),t.maghrib).getTime(), s=at(ymd(d2),t2.subuh).getTime(); return m+(s-m)*2/3; }
function lastThird(date){ var x=new Date(lastThirdMs(date)); return fmt12(pad(x.getHours())+":"+pad(x.getMinutes())); }
function hm12(ms){ var x=new Date(ms); return fmt12(pad(x.getHours())+":"+pad(x.getMinutes())); }
function cdStr(ms){ var s=Math.max(0,Math.floor(ms/1000)), h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h?h+":"+pad(m):m)+":"+pad(x); }
function rumiDiv(ar, center){ if(!S.showRumi || !ar) return ''; var r=""; try{ r=Rumi.conv(ar); }catch(e){ return ''; } return r?'<div class="rumi"'+(center?' style="text-align:center"':'')+'>'+esc(r)+'</div>':''; }
function sayBtn(ar){ SAY.push(ar); return '<button class="ib" data-say="'+(SAY.length-1)+'" aria-label="audio">🔊</button>'; }
function shareBtn(o){ SHR.push(o); return '<button class="ib" data-share="'+(SHR.length-1)+'">↗ '+L2x("Kongsi","Share")+'</button>'; }
function toolRow(ar, text, src, title){ return '<div class="tools">'+(ar?sayBtn(ar):'')+shareBtn({ar:ar,text:text,src:src,title:title})+'</div>'; }
// 0.26.0: stop on sukun (tanda mati) at the end of each ayat, like a qari's waqf, instead of reading the final baris.
function waqfAr(t){
  return String(t).split(" . ").map(function(seg){
    var m=seg.match(/^([\s\S]*?)(\S+)(\s*)$/); if(!m || !/[\u0621-\u064A]/.test(m[2])) return seg;
    var w=m[2];
    w=w.replace(/\u064B(\u0627|\u0649)$/,"\u064E$1").replace(/(\u0627|\u0649)\u064B$/,"\u064E$1");      // fathatain -> long a
    w=w.replace(/\u0629[\u064B-\u0652]*$/,"\u0647\u0652");                                     // ta marbuta -> ha sakinah
    w=w.replace(/[\u064B-\u0650\u0652]+$/,"");                                                    // drop the final vowel/tanwin (keep shaddah)
    if(/[\u0628-\u064A\u0621-\u0627]\u0651?$/.test(w) && !/[\u0627\u0648\u064A\u0649]$/.test(w)) w+="\u0652";
    return m[1]+w+m[3];
  }).join(" . ");
}
function speakAr(text){
  // Ayah numbers and end-of-ayah marks become a pause; the number itself is never read out.
  var t=String(text||"").replace(/<[^>]*>/g," ").replace(/[﴿(]?\s*[٠-٩۰-۹0-9]+\s*[﴾)]?/g," . ").replace(/[۝۞﴿﴾]/g," . ").replace(/[\u06D6-\u06DC\u06DE-\u06ED]/g,"").replace(/(\s*\.\s*)+/g," . ").replace(/^\s*\.\s*/,""); t=waqfAr(t);
  if(window.Native && N.speak){ N.speak(t,"ar"); return; }
  try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(t); u.lang="ar-SA"; u.rate=0.8; u.pitch=S.pitch||0.8; var vs=speechSynthesis.getVoices().filter(function(v){ return /^ar/i.test(v.lang); }); var pv=vs.filter(function(v){ return v.name===S.voice; })[0]||vs.filter(function(v){ return /male/i.test(v.name)&&!/female/i.test(v.name); })[0]; if(pv) u.voice=pv; speechSynthesis.speak(u); }catch(e){ toast("Audio tidak tersedia"); }
}
function showSheet(title, body, onClose){
  var ov=document.getElementById("overlay"); ov.className="sheetov";
  ov.innerHTML='<div class="sheet"><div class="row"><h3 style="margin:0">'+title+'</h3><button class="chip" id="shX">✕</button></div><div class="shb">'+body+'</div></div>';
  var close=function(){ closeOverlay(); if(onClose) onClose(); };
  ov.querySelector("#shX").onclick=close; ov._close=close;
  var t0=Date.now(); ov.onclick=function(e){ if(e.target===ov && Date.now()-t0>400) close(); };   // 0.33.8: ignore the stray click from the tap that opened it
  return ov;
}

// ---------- glossary ----------
var GL_RE=null, GL_MAP={};
function glz(html){
  if(!GL_RE){ var words=[]; GLOSSARY.forEach(function(g){ g.w.forEach(function(w){ words.push(w); GL_MAP[w.toLowerCase()]=g.k; }); });
    words.sort(function(a,b){return b.length-a.length;});
    GL_RE=new RegExp("(^|[^A-Za-z'])("+words.map(function(w){return w.replace(/[.*+?^${}()|[\]\\']/g,"\\$&");}).join("|")+")(?=$|[^A-Za-z])","gi"); }
  return html.replace(GL_RE, function(m,a,w){ return a+'<span class="gl" data-gl="'+GL_MAP[w.toLowerCase()]+'">'+w+'</span>'; });
}
function glossSheet(k){ var g=GLOSSARY.filter(function(x){return x.k===k;})[0]; if(!g) return; showSheet(esc(g.w[0].charAt(0).toUpperCase()+g.w[0].slice(1)), '<div style="line-height:1.55">'+esc(L2x(g.ms,g.en))+'</div>'); }

function globalClick(e){
  var t=e.target, b;
  if((b=t.closest("[data-say]"))){ e.preventDefault(); speakAr(SAY[+b.getAttribute("data-say")]); return; }
  if((b=t.closest("[data-share]"))){ e.preventDefault(); shareCard(SHR[+b.getAttribute("data-share")]); return; }
  if((b=t.closest("[data-fav]"))){ e.preventDefault(); var k=b.getAttribute("data-fav"), i=S.favs.indexOf(k); if(i>=0) S.favs.splice(i,1); else S.favs.push(k); saveS(); b.classList.toggle("on", i<0); b.textContent=i<0?"★":"☆"; toast(i<0?L2x("Disimpan dalam kegemaran","Saved to favourites"):L2x("Dibuang dari kegemaran","Removed from favourites")); return; }
  if((b=t.closest(".gl"))){ e.preventDefault(); e.stopPropagation(); glossSheet(b.getAttribute("data-gl")); return; }
  if((b=t.closest("[data-sirah]"))){ e.preventDefault(); openSirah(b.getAttribute("data-sirah")==="kids"); return; }
  if((b=t.closest("[data-hajj]"))){ e.preventDefault(); openHajj(); return; }
  if((b=t.closest("[data-umrah]"))){ e.preventDefault(); openUmrah(); return; }
  if((b=t.closest("[data-pksk]"))){ e.preventDefault(); openPksk(); return; }
  if((b=t.closest("[data-fiqh]"))){ e.preventDefault(); openFiqh(+b.getAttribute("data-fiqh")); return; }
  if((b=t.closest("[data-xquiz]"))){ e.preventDefault(); withExtra(null, function(){ IbExtra.openQuiz(xH()); }); return; }
  if((b=t.closest("[data-tawaf]"))){ e.preventDefault(); openTawaf(); return; }
  if((b=t.closest("[data-umlive]"))){ e.preventDefault(); umrahLive(); return; }
  if((b=t.closest("[data-prac]"))){ e.preventDefault(); openPractice(); return; }
  if((b=t.closest("[data-saham]"))){ e.preventDefault(); openSaham(); return; }
  if((b=t.closest("[data-jn]"))){ e.preventDefault(); jnEdit(b.getAttribute("data-jn")); return; }
  if((b=t.closest("[data-jnu]"))){ e.preventDefault(); jnUnlock(); return; }
  if((b=t.closest("[data-kad]"))){ e.preventDefault(); openCardMaker(b.getAttribute("data-kad")||null); return; }
  if((b=t.closest("[data-qopen]"))){ e.preventDefault(); var qa=b.getAttribute("data-qopen").split(":"); openQuranAt(+qa[0], +qa[1]); return; }
  if((b=t.closest("[data-n40]"))){ e.preventDefault(); ilmuSt.n40Open=+b.getAttribute("data-n40"); learnFrom=null; learnPg="n40"; go("learn"); return; }
  if((b=t.closest("[data-learn]"))){ e.preventDefault(); learnPg=b.getAttribute("data-learn")||null; learnFrom=b.getAttribute("data-from"); if(b.hasAttribute("data-kmode")) ilmuSt.sbMode=b.getAttribute("data-kmode"); go("learn"); return; }
  if((b=t.closest("[data-go]"))){ e.preventDefault(); var v=b.getAttribute("data-go"); if(v==="asma"){ sub.zikir="asma"; v="zikir"; } if(v==="learn") learnPg=null; go(v); return; }
}

// ---------- share card ----------
function wrapLines(ctx, text, maxW){ var words=String(text||"").split(/\s+/), lines=[], cur=""; words.forEach(function(w){ var tst=cur?cur+" "+w:w; if(ctx.measureText(tst).width>maxW && cur){ lines.push(cur); cur=w; } else cur=tst; }); if(cur) lines.push(cur); return lines; }
function shareCard(o){
  if(!o) return;
  var W=1080, H=1350, cv=document.createElement("canvas"); cv.width=W; cv.height=H; var ctx=cv.getContext("2d");
  var draw=function(){
    var g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,"#0e6b45"); g.addColorStop(1,"#07130d"); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#c9a646"; ctx.lineWidth=6; ctx.strokeRect(40,40,W-80,H-80); ctx.lineWidth=2; ctx.strokeRect(58,58,W-116,H-116);
    var arF='"AmiriL","ScheherazadeL","Noto Naskh Arabic",serif', y=150, maxW=W-200;
    ctx.textAlign="center"; ctx.fillStyle="#c9a646"; ctx.font="600 40px sans-serif"; if(o.title){ ctx.fillText(String(o.title).slice(0,48), W/2, y); y+=40; }
    var arSize=66, txSize=38, arL, txL;
    for(var tries=0; tries<8; tries++){
      ctx.font=arSize+"px "+arF; ctx.direction="rtl"; arL=o.ar?wrapLines(ctx,o.ar,maxW):[]; ctx.direction="ltr";
      ctx.font=txSize+"px sans-serif"; txL=wrapLines(ctx,o.text,maxW);
      var need=arL.length*arSize*1.75+txL.length*txSize*1.4+160;
      if(y+need < H-160) break; arSize=Math.round(arSize*0.88); txSize=Math.max(24,Math.round(txSize*0.9));
    }
    y+=40;
    ctx.fillStyle="#ffffff"; ctx.font=arSize+"px "+arF; ctx.direction="rtl";
    arL.forEach(function(l){ y+=arSize*1.75; ctx.fillText(l, W/2, y); });
    ctx.direction="ltr"; y+=arL.length?40:0;
    ctx.fillStyle="#e8efe9"; ctx.font=txSize+"px sans-serif";
    txL.forEach(function(l){ y+=txSize*1.4; ctx.fillText(l, W/2, y); });
    if(o.src){ ctx.fillStyle="#a9b8ae"; ctx.font="italic 28px sans-serif"; y+=70; wrapLines(ctx, String(o.src).replace(/ \[[a-z]+\]/g,""), maxW).slice(0,2).forEach(function(l){ ctx.fillText(l, W/2, y); y+=36; }); }
    ctx.fillStyle="#c9a646"; ctx.font="600 30px sans-serif"; ctx.fillText("My Ihsan", W/2, H-90);
    var url=cv.toDataURL("image/png"), txt=(o.text||"")+(o.src?"\n("+String(o.src).replace(/ \[[a-z]+\]/g,"")+")":"");
    if(window.Native && N.shareImage) N.shareImage(url, txt);
    else { var a=document.createElement("a"); a.href=url; a.download="my-ihsan.png"; document.body.appendChild(a); a.click(); a.remove(); }
  };
  try{ Promise.all([document.fonts.load('60px "AmiriL"'), document.fonts.load('60px "ScheherazadeL"')]).then(draw, draw); }catch(e){ draw(); }
}

// ---------- doa: cards, search, favourites ----------
function doaCard(it, c, i, showCat){
  var key=c+"-"+i, fav=S.favs.indexOf(key)>=0, title=S.lang==="en"?it.t_en:it.t_ms;
  return '<div class="card"><div class="row"><h3>'+esc(title)+'</h3><button class="ib fav'+(fav?" on":"")+'" data-fav="'+key+'" aria-label="favourite">'+(fav?"★":"☆")+'</button></div>'+(showCat?'<div class="mut tiny" style="margin:-4px 0 4px">'+esc(catName(DOA[c]))+'</div>':'')+
    '<div class="ar">'+it.ar+'</div>'+rumiDiv(it.ar)+'<div class="tr">'+esc(tr(it))+'</div><div class="src">'+T("source")+': '+srcHtml(it.src)+'</div>'+toolRow(it.ar, tr(it), it.src, title)+'</div>';
}
function doaSearch(el, q){
  var ql=q.toLowerCase(), terms=[ql].concat(DOA_SYN[ql]||[]);
  Object.keys(DOA_SYN).forEach(function(k){ if(k.length>=4 && ql.length>=3 && k.indexOf(ql)===0) terms=terms.concat(DOA_SYN[k]); });
  var html='', n=0, hits=[];
  DOA.forEach(function(c,ci){ c.items.forEach(function(it,ii){ var ttl=(it.t_ms+" "+it.t_en).toLowerCase(), hay=(ttl+" "+it.ms+" "+it.en+" "+c.cat).toLowerCase(), sc=0;
    if(ttl.indexOf(ql)>=0) sc=4; else if(hay.indexOf(ql)>=0) sc=3; else if(terms.some(function(t){ return t && ttl.indexOf(t)>=0; })) sc=2; else if(terms.some(function(t){ return t && hay.indexOf(t)>=0; })) sc=1;
    if(sc) hits.push({sc:sc,it:it,ci:ci,ii:ii}); }); });
  hits.sort(function(a,b){ return b.sc-a.sc; }).forEach(function(h){ html+=doaCard(h.it,h.ci,h.ii,true); n++; });
  el.innerHTML = n ? '<div class="mut small" style="margin:2px 4px 6px">'+n+' '+L2x("doa dijumpai","found")+'</div>'+html : '<div class="card mut">'+L2x("Tiada padanan. Cuba: musafir, sakit, periksa, hujan, marah, tidur, hutang.","No match. Try: travel, sick, exam, rain, angry, sleep, debt.")+'</div>';
}
function favItems(){ return S.favs.map(function(k){ var p=k.split("-"), c=+p[0], i=+p[1]; return DOA[c]&&DOA[c].items[i]?{c:c,i:i,it:DOA[c].items[i]}:null; }).filter(Boolean); }
function doaFavList(el){
  var f=favItems();
  el.innerHTML = f.length ? f.map(function(x){ return doaCard(x.it,x.c,x.i,true); }).join("") : '<div class="card mut">'+L2x("Tiada kegemaran lagi. Tekan ☆ pada mana-mana doa untuk menyimpannya di sini dan di Utama.","No favourites yet. Tap ☆ on any doa to keep it here and on Home.")+'</div>';
}

// ---------- Asmaul Husna ----------
function zAsma(el){
  var st=load("ihsan_asma",{i:0}), en=en_();
  function draw(){
    var a=ASMAUL_HUSNA[st.i];
    var html='<div class="card asma"><div class="tap asmaTap" id="asTap"><div class="mut small">'+(st.i+1)+' / 99</div><div class="ar" style="font-size:44px;line-height:1.6;text-align:center">'+a[0]+'</div><div style="font-weight:700;font-size:18px">'+esc(a[1])+'</div><div class="mut">'+esc(en?a[3]:a[2])+'</div>'+(window.ASMA_INFO&&ASMA_INFO[st.i]?'<div class="asx">'+esc(en?ASMA_INFO[st.i][1]:ASMA_INFO[st.i][0])+'</div><div class="src" style="text-align:center">📖 '+esc(ASMA_INFO[st.i][2])+'</div>':'')+'<div class="mut tiny" style="margin-top:6px">'+L2x("ketik untuk seterusnya","tap for next")+'</div></div>'+
      '<div class="btns"><button class="btn alt" id="asPrev">'+L2x("Sebelum","Back")+' ›</button>'+sayBtn("يَا "+a[0].replace(/^ال/,""))+'<button class="btn alt" id="asReset">⟲</button></div></div>';
    html+='<div class="card"><div class="asgrid">'+ASMAUL_HUSNA.map(function(x,i){ return '<button class="asc'+(i===st.i?" on":"")+'" data-as="'+i+'"><span class="ar">'+x[0]+'</span><small>'+(i+1)+'. '+esc(x[1])+'</small></button>'; }).join("")+'</div></div>';
    html+='<div class="card"><div class="why">'+esc(L2x(ASMA_NOTE.ms,ASMA_NOTE.en))+'</div><div class="src">'+srcHtml(ASMA_NOTE.src)+'</div><div class="mut tiny" style="margin-top:6px">'+L2x("Penerangan dan rujukan ayat bagi setiap nama ditulis daripada ingatan. Sila semak dengan ustaz. \"Bentuk kata kerja\" bermaksud ayat itu menyebut perbuatan Allah, bukan nama itu sendiri.","Each name's explanation and ayat reference was written from memory. Please check with an ustaz. \"Verb form\" means the ayah describes Allah doing it rather than using the name itself.")+'</div></div>';
    el.innerHTML=html;
    el.querySelector("#asTap").onclick=function(){ if(st.i<98){ st.i++; N.vibrate(20); } else { N.vibrate(500); toast(L2x("Selesai 99 nama. MasyaAllah!","All 99 names done. MasyaAllah!")); st.i=0; } save("ihsan_asma",st); draw(); };
    el.querySelector("#asPrev").onclick=function(){ if(st.i>0) st.i--; save("ihsan_asma",st); draw(); };
    el.querySelector("#asReset").onclick=function(){ st.i=0; save("ihsan_asma",st); draw(); };
    el.querySelectorAll("[data-as]").forEach(function(b){ b.onclick=function(){ st.i=+b.getAttribute("data-as"); save("ihsan_asma",st); draw(); el.scrollIntoView&&document.getElementById("view").scrollTo({top:0,behavior:"smooth"}); }; });
  }
  draw();
}

// ---------- tasbih pocket mode ----------
function tasbihDark(){
  var ov=document.getElementById("overlay"); ov.className="darkov";
  ov.innerHTML='<div class="darkc" id="dkC"></div><button class="close" id="dkX">✕</button><div class="darkh">'+L2x("Ketik di mana-mana atau tekan butang volum. Tekan ✕ untuk keluar.","Tap anywhere or press a volume button. Press ✕ to exit.")+'</div>';
  N.keepScreenOn(true, 0.01); if(N.setVolumeKeys) N.setVolumeKeys(true);
  var c=ov.querySelector("#dkC");
  function upd(){ c.textContent=tb.left+" · "+(tb.i+1)+"/"+TASBIH.length; }
  darkTap=function(){ if(tbTap) tbTap(); setTimeout(upd,30); };
  ov.onclick=function(e){ if(e.target.id==="dkX") return; darkTap(); };
  function end(){ darkTap=null; N.keepScreenOn(false,-1); applyTheme(); if(N.setVolumeKeys) N.setVolumeKeys(S.volTasbih); closeOverlay(); render(); }
  ov.querySelector("#dkX").onclick=function(e){ e.stopPropagation(); end(); };
  ov._close=end; upd();
}

// ---------- extras schedule (native one-off reminders) ----------
function fastList(date){
  var r=sunnahFastOn(date).map(function(x){ return {ms:x.ms,en:x.en,t:/Isnin|Khamis/.test(x.ms)?"mk":"bidh"}; }), h=hijriOf(date);
  if(h){ if(h.m===12&&h.d===9) r.push({ms:"Puasa sunat Arafah",en:"Arafah fast",t:"special"});
    if(h.m===1&&h.d===9) r.push({ms:"Puasa sunat Tasu'a",en:"Tasu'a fast",t:"special"});
    if(h.m===1&&h.d===10) r.push({ms:"Puasa sunat Asyura",en:"Ashura fast",t:"special"});
    if(h.m===10&&h.d>=2&&h.d<=30) r.push({ms:"Puasa enam Syawal",en:"Six fasts of Syawal",t:"syawal",first:h.d===2}); }
  return r;
}
function buildExtras(){
  var out=[], now=Date.now(), en=en_(), base=new Date(); base.setHours(0,0,0,0);
  var paused = S.pauseMode==="haid" ? (S.pauseUntil||0) : 0;
  function push(t,id,title,body,loud,open){ if(t>now && t>paused) out.push({t:Math.round(t),id:id,title:title,body:body,loud:!!loud,open:open||"home"}); }
  function pushAny(t,id,title,body,loud,open){ if(t>now) out.push({t:Math.round(t),id:id,title:title,body:body,loud:!!loud,open:open||"home"}); }
  for(var i=0;i<10;i++){
    var d=addDays(base,i), ds=ymd(d), t=getDay(d), h=hijriOf(d);
    if(S.imsakOn && t.imsak && (!S.imsakRamadan || (h&&h.m===9)))
      push(at(ds,t.imsak).getTime(),"imsak"+ds, en?"Imsak "+fmt12(t.imsak):"Imsak "+fmt12(t.imsak), en?"Stop eating sahur. Subuh at "+fmt12(t.subuh)+".":"Berhenti makan sahur. Subuh pada "+fmt12(t.subuh)+".", true);
    if(S.syurukOn && t.syuruk) pushAny(at(ds,t.syuruk).getTime(),"syuruk"+ds, en?"Syuruk "+fmt12(t.syuruk):"Syuruk "+fmt12(t.syuruk), en?"The sun has risen. Subuh time has ended.":"Matahari telah terbit. Waktu Subuh telah tamat.", false);
    if(S.endMin>0) [["subuh","syuruk"],["zohor","asar"],["asar","maghrib"],["maghrib","isyak"]].forEach(function(p){
      if(!S.notif[p[0]] || !t[p[1]]) return;
      push(at(ds,t[p[1]]).getTime()-S.endMin*60000, "end"+p[0]+ds, en?T(p[0])+" ends in "+S.endMin+" min":"Waktu "+T(p[0])+" tamat dalam "+S.endMin+" minit", en?"If you have not prayed "+T(p[0])+" yet, pray now.":"Jika belum solat "+T(p[0])+", tunaikan sekarang.", true, "solat"); });
    if(S.tahajjud){ var lt=lastThirdMs(d); push(lt,"tahajjud"+ds, en?"Tahajjud: last third of the night":"Tahajjud: sepertiga malam terakhir", en?"A good time for night prayer and doa. Subuh is at "+fmt12(getDay(addDays(d,1)).subuh)+".":"Waktu terbaik untuk solat malam dan berdoa. Subuh pada "+fmt12(getDay(addDays(d,1)).subuh)+".", true, "sunat"); }
    if(S.mathAlarm){ pushAny(at(ds,t.subuh).getTime()+25*60000,"mp"+ds,"Al-Ma'thurat "+(en?"(morning)":"pagi"), en?"Time for the morning adhkar.":"Masa untuk wirid pagi.", false, "mathurat");
      pushAny(at(ds,t.asar).getTime()+25*60000,"me"+ds,"Al-Ma'thurat "+(en?"(evening)":"petang"), en?"Time for the evening adhkar.":"Masa untuk wirid petang.", false, "mathurat"); }
    if(S.fastRem){ var nd=addDays(d,1), fl=fastList(nd).filter(function(f){ if(f.t==="syawal") return S.fastRemT.special && f.first; return S.fastRemT[f.t]; });
      if(fl.length){ var r=new Date(d); r.setHours(21,0,0,0); push(r.getTime(),"fast"+ds, en?"Sunnah fast tomorrow":"Puasa sunat esok", fl.map(function(f){return en?f.en:f.ms;}).join(", ")+(en?". Remember to set your intention and wake for sahur.":". Jangan lupa niat dan bangun sahur."), false, "home"); } }
  }
  var qr=((load("ihsan_quran",{})||{}).set||{}).rem||{};
  for(var q2=0;q2<10;q2++){ var dq=addDays(base,q2), tq=getDay(dq), dsq=ymd(dq), dow=dq.getDay();
    if(qr.kahf && dow===5 && tq.subuh) pushAny(at(dsq,tq.subuh).getTime()+60*60000, "qkahf"+dsq, L2x("Hari Jumaat: Surah Al-Kahf","Friday: Surah Al-Kahf"), L2x("Luangkan masa membaca Al-Kahf hari ini.","Take some time to read Al-Kahf today."), false, "quran");
    if(qr.yasin && dow===4 && tq.maghrib) pushAny(at(dsq,tq.maghrib).getTime()+15*60000, "qyas"+dsq, L2x("Malam Jumaat: Yasin","Thursday night: Yasin"), L2x("Masa yang baik untuk membaca Yasin.","A good time to read Yasin."), false, "quran");
    if(qr.mulk && tq.isyak) pushAny(at(dsq,tq.isyak).getTime()+120*60000, "qmulk"+dsq, L2x("Sebelum tidur: Al-Mulk","Before sleep: Al-Mulk"), L2x("Surah Al-Mulk dan 2 ayat akhir Al-Baqarah sebelum tidur.","Surah Al-Mulk and the last 2 ayat of Al-Baqarah before you sleep."), false, "quran");
    if(qr.daily && tq.subuh){ var qg=(load("ihsan_quran",{}).goal)||{}; var qpl=(load("ihsan_quran",{})||{}).plan; if(qpl && qpl.u){ var qd=Math.max(1, Math.min(qpl.days, Math.round((new Date(dsq+"T12:00:00")-new Date(qpl.d0+"T12:00:00"))/864e5)+1)); pushAny(at(dsq,tq.subuh).getTime()+40*60000, "qday"+dsq, L2x("Bacaan Al-Quran hari ini","Today's Quran reading"), (qpl.u==="juz"?"Juz "+qd:qpl.u==="hizb"?"Hizb "+qd:"Manzil "+qd)+" · "+L2x("pelan ","plan ")+qd+"/"+qpl.days); } else pushAny(at(dsq,tq.subuh).getTime()+40*60000, "qday"+dsq, L2x("Bacaan Al-Quran hari ini","Today's Quran reading"), L2x("Sasaran hari ini: ","Today's goal: ")+(qg.n||10)+" "+(qg.k==="page"?L2x("muka surat","pages"):qg.k==="min"?L2x("minit","min"):"ayat"), false, "quran"); } }
  // 0.5.23: deed goal reminders (only on days the goal is not done yet)
  (function(){ var DG=load("ihsan_deeds",null); if(!DG || !DG.goals) return; DG.goals.forEach(function(g){ if(!g.rem) return; var hm=g.rem.split(":");
    for(var j=0;j<7;j++){ var dj=addDays(base,j), k=ymd(dj), l=(DG.log||{})[k]||{}; if((l[g.id]||0)>=g.n) continue; var t0=new Date(dj); t0.setHours(+hm[0], +hm[1], 0, 0); pushAny(t0.getTime(), "dg"+g.id+k, "🌱 "+g.name, L2x("Amalan hari ini: ","Today's deed: ")+g.n+(g.u?" "+g.u:""), false, "sunat"); } }); })();
  if(S.jnRem) for(var j=0;j<10;j++){ var dj=addDays(base,j), tj=getDay(dj); if(tj.isyak) pushAny(at(ymd(dj),tj.isyak).getTime()+90*60000, "jn"+ymd(dj), L2x("Muhasabah harian","Daily reflection"), L2x("Luangkan seminit: apa yang anda syukuri hari ini, dan apa yang ingin diperbaiki?","Take a minute: what are you grateful for today, and what would you like to improve?"), false, "cal"); }
  // 0.21.0 finance reminders at 9:00: commitments with 🔔 (on the day or days before) and debts with a due date
  var F=load("ihsan_fin",null);
  if(F && window.FinNextDue){ var nine=function(d){ var x=new Date(d); x.setHours(9,0,0,0); return x.getTime(); };
    (F.com||[]).forEach(function(c){ if(!c.ntf) return; var d=FinNextDue(c, base), guard=0;
      while(d && guard++<12 && (d-base)/864e5<=10+(c.pre||0)){ var tt=nine(addDays(d,-(c.pre||0))); pushAny(tt, "fc"+c.id+ymd(d), "📆 "+c.name+" · RM "+(+c.amt).toFixed(2), (c.pre?L2x("Perlu dibayar pada ","Due on "):L2x("Perlu dibayar hari ini","Due today"))+(c.pre?d.toLocaleDateString(locTag(),{day:"numeric",month:"short"}):""), false, "fin"); d=FinNextDue(c, addDays(d,1)); } });
    (F.debts||[]).forEach(function(x){ if(x.done || !x.due || x.rem===false) return; var p=x.due.split("-"), d=new Date(+p[0],+p[1]-1,+p[2]);
      pushAny(nine(d), "fd"+x.id, (x.dir==="owed"?"⬅ ":"➡ ")+L2x("Hutang: ","Debt: ")+(x.who||""), (x.dir==="owed"?L2x("Tarikh dijanjikan untuk bayaran kepada anda hari ini.","Promised repayment to you is due today."):L2x("Tarikh akhir bayaran hutang anda hari ini.","Your debt payment is due today."))+(x.desc?" ("+x.desc+")":""), false, "fin"); }); }
  // 0.23.0 birthdays (Gregorian and Hijri) at 8:00
  var FM=load("ihsan_family",null);
  if(FM && FM.rem!==false && window.FamView && FM.p){ FamView.data(famH()); FM.p.forEach(function(p){ if(!p.b || p.dd) return; var nx=FamNext(p), e8=function(d){ var x=new Date(d); x.setHours(8,0,0,0); return x.getTime(); };
      if(nx.g && (nx.g-base)/864e5<=10) pushAny(e8(nx.g), "bdg"+p.id+ymd(nx.g), "🎂 "+p.n, L2x("Hari lahir hari ini. Doakan dan hubungi"+(p.tel?" ("+p.tel+")":""),"Birthday today. Pray for them and get in touch"+(p.tel?" ("+p.tel+")":"")), false, "alat");
      if(nx.h && (nx.h-base)/864e5<=10) pushAny(e8(nx.h)+60000, "bdh"+p.id+ymd(nx.h), "🌙 "+p.n, L2x("Hari lahir Hijrah hari ini","Hijri birthday today"), false, "alat"); }); }
  // 0.35.0 vaccine due dates (Baby) and events, tasks, RSVP dates (Majlis): worked out by family/baby.js and family/events.js
  var FR=load("ihsan_famrem",null);
  if(FR) ["baby","ev"].forEach(function(k){ (FR[k]||[]).forEach(function(r){ if(r.t && (r.t-base)/864e5<=10) pushAny(r.t, r.k, r.ti, r.b, false, "alat"); }); });
  // 0.5.48 Care (Jaga): medicine doses, appointments and low stock, read straight from ihsan_care (family/care.js), so they roll forward daily
  var CR=load("ihsan_care",null);
  if(CR && CR.rem!==false && !window.IHSAN_PLAY){ var cpN=function(id){ var p=(CR.ppl||[]).filter(function(x){ return x.id===id; })[0]; return p?p.n:""; }, FD={before:["Sebelum makan","Before food"],after:["Selepas makan","After food"],with:["Bersama makanan","With food"]};
    (CR.meds||[]).forEach(function(m){ if(m.off || m.rem===false) return; for(var i=0;i<10;i++){ var d=addDays(base,i), ds=ymd(d); if(m.start && ds<m.start) continue;
        if(m.days && m.start){ var p0=m.start.split("-"); if((d-new Date(+p0[0],+p0[1]-1,+p0[2]))/864e5>=m.days) continue; }
        (m.times||[]).forEach(function(tm){ pushAny(at(ds,tm).getTime(), "cm"+m.id+ds+tm, "💊 "+cpN(m.pid)+": "+m.n+(m.dose?" · "+m.dose:""), (FD[m.food]?L2x(FD[m.food][0],FD[m.food][1])+". ":"")+L2x("Tandakan bila sudah diberi.","Mark it when given."), false, "alat"); }); }
      if(m.stock!=null && m.stock!=="" && (m.times||[]).length){ var left=Math.floor(+m.stock/((+m.per||1)*m.times.length)); if(left<=3) pushAny(at(ymd(addDays(base,1)),"09:00").getTime(), "cs"+m.id+ymd(base), "📦 "+m.n+": "+L2x("stok hampir habis","running low"), cpN(m.pid)+" · "+left+L2x(" hari lagi. Dapatkan ubat dari klinik atau farmasi."," days left. Get more from the clinic or pharmacy."), false, "alat"); } });
    (CR.apt||[]).forEach(function(a){ if(a.done || !a.t) return; var tt=at(a.t.slice(0,10), a.t.slice(11,16)||"09:00").getTime(), ev=at(ymd(addDays(new Date(tt),-1)),"20:00").getTime(), nm2=cpN(a.pid)+(a.where?" · "+a.where:"");
      pushAny(ev, "ca"+a.id+"e", "📅 "+L2x("Esok: temujanji ","Tomorrow: appointment ")+nm2, L2x("Sediakan senarai semak dan soalan untuk doktor.","Get the checklist and questions for the doctor ready."), false, "alat");
      pushAny(tt-2*36e5, "ca"+a.id+"h", "📅 "+L2x("Temujanji dalam 2 jam: ","Appointment in 2 hours: ")+nm2, a.t.slice(11,16), false, "alat"); }); }
  // 0.37.0 workout reminders on plan days (fit/fit.js writes ihsan_fitrem)
  var FTR=load("ihsan_fitrem",null);
  if(FTR && FTR.list) FTR.list.forEach(function(r){ if(r.t && (r.t-base)/864e5<=10) pushAny(r.t, r.k, r.ti, r.b, false, "side:cal/senaman"); });
  // 0.5.1 focus: end of session, Pomodoro breaks and focus plan starts (focus/focus.js writes ihsan_focus_ex)
  // 0.5.2 weekly screen-time report, Sunday 20:00 (only with Usage access; switch in Statistik › insights)
  if((load("ihsan_insights",{})||{}).rep!==false && hasUsageAcc() && N.focusInsights) for(var w=0;w<10;w++){ var dw=addDays(base,w); if(dw.getDay()===0){ var t20=new Date(dw); t20.setHours(20,0,0,0);
    pushAny(t20.getTime(), "insw"+ymd(dw), "🧭 "+L2x("Laporan mingguan masa skrin","Weekly screen-time report"), L2x("Lihat minggu anda: masa skrin, aplikasi utama, fokus dan solat.","See your week: screen time, top apps, focus and prayers."), false, "statw"); } }
  var FOX=load("ihsan_focus_ex",null);
  if(FOX && FOX.forEach) FOX.forEach(function(r){ if(r.t && (r.t-base)/864e5<=10) pushAny(r.t, r.id, r.title, r.body, false, r.open||"side:cal/fokus/focus"); });
  // 0.6.41 Focus hub (focus/grow.js): habit reminders, morning intention, evening and weekly review, reach-out and renewal reminders
  var GRX=load("ihsan_grow_ex",null);
  // 0.6.44 Planner reminders (planner/planner.js, items with ⏰, repeats included)
  var PTX=load("ihsan_pets_ex",null); if(PTX && PTX.forEach) PTX.forEach(function(r){ if(r.t && (r.t-base)/864e5<=10) pushAny(r.t, r.id, r.title, r.body, false, r.open||"side:alat/pets"); });   // 0.7.72 pets: meals, medicines, care, vaccines, birthdays
  var KPX=load("ihsan_kplan_ex",null); if(KPX && KPX.forEach) KPX.forEach(function(r){ if(r.t && (r.t-base)/864e5<=10) pushAny(r.t, r.id, r.title, r.body, false, r.open||"side:learn/sekolah"); });   // 0.7.62 child planner: homework, forms, events, exams
  var PLX=load("ihsan_plan_ex",null); if(PLX && PLX.forEach) PLX.forEach(function(r){ if(r.t && (r.t-base)/864e5<=10) pushAny(r.t, r.id, r.title, r.body, false, r.open||"side:cal/bulan"); });
  if(GRX && GRX.forEach) GRX.forEach(function(r){ if(r.t && (r.t-base)/864e5<=10) pushAny(r.t, r.id, r.title, r.body, false, r.open||"side:cal/fokus"); });
  // 0.5.23 shared one-off reminders (group events, note reminders, cooking timers, rate alerts): [{t,id,title,body,open}]
  var XR=load("ihsan_xrem",null);
  if(XR && XR.forEach) XR.forEach(function(r){ if(r.t && (r.t-base)/864e5<=10) pushAny(r.t, r.id, r.title, r.body, !!r.loud, r.open||"home"); });
  out.sort(function(a,b){return a.t-b.t;});
  return out.slice(0,120);
}

// ---------- hadith of the day ----------
function dayIndex(d){ var y=d.getFullYear(), doy=Math.floor((new Date(y,d.getMonth(),d.getDate())-new Date(y,0,0))/864e5); return y*400+doy; }
function hadithToday(){ return HADITH_DAILY[dayIndex(new Date())%HADITH_DAILY.length]; }
function pushDoa(){ try{ if(!N.setDoa) return; var L=[]; DOA.forEach(function(c){ (c.items||[]).forEach(function(it){ if(it.ar && it.ar.length<260) L.push({t:String(it.ar).replace(/<[^>]*>/g,"")+"\n"+tr(it), s:(S.lang==="en"?it.t_en:it.t_ms)||""}); }); }); N.setDoa(JSON.stringify(L.slice(0,400))); }catch(e){} }
function pushHadith(){ try{ if(N.setHadith) N.setHadith(JSON.stringify(HADITH_DAILY.map(function(h){ return {t:tr(h), s:h.src.replace(/ \[[a-z]+\]/g,"")}; }))); }catch(e){} }
// 0.5.20 round 2: the text size also sets the density: A− is compact (less padding, smaller touch targets), A+ and up roomier
function applyZoom(){ var z=S.textZoom||100; if(S.senior && !S.kidLock) z=Math.max(z,125); document.documentElement.setAttribute("data-dz", z<=85?"s":z>=130?"l":z>=115?"m":"n"); if(window.Native && N.setTextZoom) N.setTextZoom(z); else document.getElementById("app").style.zoom=z/100; }

// ---------- backup ----------
function makeBackup(){
  var data={}; for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(k.indexOf("ihsan_")===0 && k.indexOf("ihsan_podf_")!==0 && k!=="ihsan_radio_cache") data[k]=localStorage.getItem(k); }
  var home=null; try{ if(window.Native && N.homeExport){ home=JSON.parse(N.homeExport()); } }catch(e){}   // 0.4.7: the phone home screen too
  var json=JSON.stringify({app:"My Ihsan", v:"0.3.0", at:new Date().toISOString(), data:data, home:home}), name="my-ihsan-backup-"+ymd(new Date())+".json";
  // 0.6.25: full backup (.ihsanbak, a ZIP) also carries the app files: receipt photos (fin/), Niaga logo/signature/stamp (biz/), family photos (photos/); books are optional
  if(window.Native && N.saveBackupZip && !makeBackup.plain){ var mb=function(n){ return n<1048576?Math.max(1,Math.round(n/1024))+" KB":(n/1048576).toFixed(1)+" MB"; }, s0=0, s1=0; try{ s0=N.backupFilesSize(false); s1=N.backupFilesSize(true); }catch(e){}
    var ov=showSheet("💾 "+L2x("Sandaran","Backup"), '<label class="ngTog" style="display:flex;gap:10px;margin:8px 0"><input type="checkbox" id="bkF" checked style="width:22px;height:22px"><span><b>'+L2x("Sertakan gambar & fail","Include photos & files")+'</b><small class="mut" style="display:block">'+L2x("Gambar resit, logo, tandatangan, cop dan foto keluarga · ","Receipt photos, logos, signatures, stamps and family photos · ")+mb(s0)+'</small></span></label>'+
      (s1>s0?'<label class="ngTog" style="display:flex;gap:10px;margin:8px 0"><input type="checkbox" id="bkB" style="width:22px;height:22px"><span><b>'+L2x("Sertakan buku (PDF)","Include books (PDF)")+'</b><small class="mut" style="display:block">+'+mb(s1-s0)+'</small></span></label>':'')+
      '<button class="btn gold full g3d" id="bkGo" style="margin-top:10px">💾 '+L2x("Simpan sandaran","Save backup")+'</button>');
    ov.querySelector("#bkGo").onclick=function(){ var f=ov.querySelector("#bkF").checked, bb=ov.querySelector("#bkB"); closeOverlay(); if(f) N.saveBackupZip("my-ihsan-backup-"+ymd(new Date())+".ihsanbak", json, !!(bb && bb.checked)); else N.saveFile(name, json); };
    return; }
  if(window.Native && N.saveFile) N.saveFile(name, json);
  else { var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([json],{type:"application/json"})); a.download=name; document.body.appendChild(a); a.click(); a.remove(); }
}
function openBackup(){
  if(window.Native && N.openFile){ N.openFile(); return; }
  var inp=document.createElement("input"); inp.type="file"; inp.accept=".json,application/json"; inp.onchange=function(){ var f=inp.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ restoreBackup(r.result); }; r.readAsText(f); }; inp.click();
}
function restoreBackup(body, meta){
  var j=null; try{ j=JSON.parse(body); }catch(e){}
  if(!j || j.app!=="My Ihsan" || !j.data){ toast(L2x("Fail ini bukan sandaran My Ihsan","This is not a My Ihsan backup")); return; }
  var n=Object.keys(j.data).length, nf=meta&&meta.files||0;
  var ov=showSheet(L2x("Pulihkan sandaran?","Restore backup?"), '<div>'+L2x("Sandaran dari ","Backup from ")+esc((j.at||"").slice(0,10))+' ('+n+L2x(" item). Tetapan dan kiraan semasa akan diganti."," items). Current settings and counts will be replaced.")+'</div>'+(nf?'<div class="mut small" style="margin-top:6px">🖼 '+nf+L2x(" fail (gambar, logo, tandatangan) turut dipulihkan."," files (photos, logos, signatures) are restored too.")+(meta.bad?' ⚠️ '+meta.bad+L2x(" rosak dilangkau."," damaged, skipped."):'')+'</div>':'')+'<div class="btns" style="margin-top:12px"><button class="btn gold" id="rbOk">'+L2x("Pulihkan","Restore")+'</button></div>');
  ov.querySelector("#rbOk").onclick=function(){ if(nf && N.restoreCommit) try{ N.restoreCommit(); }catch(e){} Object.keys(j.data).forEach(function(k){ if(k.indexOf("ihsan_")===0) try{ localStorage.setItem(k, j.data[k]); }catch(e){} }); if(j.home && window.Native && N.homeImport) try{ N.homeImport(JSON.stringify(j.home)); }catch(e){} location.reload(); };
}

// ---------- HOME ----------
var HOME_CARDS=[["next","Waktu solat seterusnya","Next prayer"],["quick","Pintasan","Shortcuts"],["pause","Mod uzur (bila aktif)","Uzur mode (when on)"],["musafir","Musafir (bila dalam perjalanan)","Travelling (when away)"],["ramadan","Ramadan (bila hampir)","Ramadan (when near)"],["events","Hari kebesaran Islam","Islamic days"],["fast","Puasa sunat","Sunnah fasts"],["hadith","Hadis hari ini","Hadith of the day"],["fav","Doa kegemaran","Favourite doa"],["ganti","Puasa ganti","Make-up fasts"]];
function homeCards(){
  var hc=(S.homeCards||[]).filter(function(x){ return HOME_CARDS.some(function(c){return c[0]===x.id;}); });
  HOME_CARDS.forEach(function(c){ if(!hc.some(function(x){return x.id===c[0];})) hc.push({id:c[0],on:true}); });
  S.homeCards=hc; return hc;
}
var rmView=0;   // 0.6.31: the Hijri month shown in the Rejab-Ramadan calendar (7, 8 or 9; 0 = this month)
function rmMonth(h, now, m){ var t0=new Date(now); t0.setHours(0,0,0,0); var out=[];
  for(var i=-100;i<=100;i++){ var d=addDays(t0,i), x=hijriOf(d); if(x && x.y===h.y && x.m===m) out.push({d:d, h:x}); } return out; }
function rmCal(h, now){ var m=rmView>=7 && rmView<=9 ? rmView : h.m, days=rmMonth(h, now, m); if(!days.length) return '';
  var t0=new Date(now); t0.setHours(0,0,0,0); var names={7:L2x("Rejab","Rajab"),8:L2x("Syaaban","Sha'ban"),9:"Ramadan"}, wd=en_()?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]:["Ahd","Isn","Sel","Rab","Kha","Jum","Sab"];
  var first=days[0].d.getDay(), cells=''; for(var i=0;i<first;i++) cells+='<i></i>';
  days.forEach(function(x){ var past=x.d<t0, today=+x.d===+t0, mon=x.d.getDay(); cells+='<span class="rcD'+(past?' past':'')+(today?' today':'')+(mon===1||mon===4?' sun':'')+'"><b>'+x.h.d+'</b><small>'+x.d.getDate()+'</small></span>'; });
  var gl=days[0].d.toLocaleDateString(locTag(),{day:"numeric",month:"short"})+" – "+days[days.length-1].d.toLocaleDateString(locTag(),{day:"numeric",month:"short",year:"numeric"});
  var toR=h.m<9?(function(){ var ev=nextHijriEvent(9,1,10,1); return ev?Math.round((ev.start-t0)/864e5):null; })():null;
  return '<div class="card rmCal" id="rmCal"><div class="rcH"><button class="chip" data-rmm="'+(m-1)+'"'+(m<=7?' disabled':'')+'>‹</button><div><b>🌙 '+names[m]+' '+h.y+'H</b><small class="mut">'+gl+(toR!=null&&toR>0?' · Ramadan '+L2x("dalam ","in ")+toR+L2x(" hari"," days"):'')+'</small></div><button class="chip" data-rmm="'+(m+1)+'"'+(m>=9?' disabled':'')+'>›</button></div>'+
    '<div class="rcG">'+wd.map(function(w){ return '<em>'+w+'</em>'; }).join("")+cells+'</div><div class="mut tiny">'+L2x("Isnin & Khamis ditanda (puasa sunat). Hari yang lepas dipangkah. Kalendar ini hilang pada 1 Syawal.","Mondays & Thursdays marked (sunnah fasts). Past days are crossed out. This calendar hides on 1 Syawal.")+'</div></div>'; }
document.addEventListener("click", function(e){ var b=e.target.closest && e.target.closest("[data-rmm]"); if(!b || b.disabled) return; rmView=+b.getAttribute("data-rmm"); render(); }, true);
(function(){ var x0=null; document.addEventListener("touchstart", function(e){ var c=e.target.closest && e.target.closest("#rmCal"); x0=c?e.touches[0].clientX:null; }, {passive:true});
  document.addEventListener("touchend", function(e){ if(x0==null) return; var dx=e.changedTouches[0].clientX-x0; x0=null; if(Math.abs(dx)<50) return; var cur=document.querySelector("#rmCal [data-rmm]"); if(!cur) return; var h=hijriOf(new Date()), m=rmView>=7&&rmView<=9?rmView:(h?h.m:9), nm=m+(dx<0?1:-1); if(nm<7||nm>9) return; rmView=nm; render(); }, {passive:true}); })();
var EV_NAMES={"9-29":["Akhir Ramadan","End of Ramadan"],"10-1":["Hari Raya Aidilfitri","Eid al-Fitr"],"10-2":["Puasa enam Syawal","Six fasts of Syawal"],"12-1":["Awal Zulhijjah","Start of Dhul Hijjah"],"12-8":["Hari Tarwiyah","Day of Tarwiyah"],"12-9":["Hari Arafah","Day of Arafah"],"12-10":["Hari Raya Aidiladha","Eid al-Adha"]};
function upcomingEvents(n, days){
  var res=[], t=new Date(); t.setHours(0,0,0,0);
  for(var i=0;i<=days && res.length<n;i++){ var d=addDays(t,i), h=hijriOf(d); if(!h) continue;
    EVENT_AMALAN.forEach(function(e){ if(e[0]===h.m && e[1]===h.d){ var nm=ISLAMIC_DAYS.filter(function(x){return x[0]===h.m&&x[1]===h.d;})[0], k=h.m+"-"+h.d;
      var name=EV_NAMES[k]?EV_NAMES[k][en_()?1:0]:(nm?(en_()?nm[3]:nm[2]):""); res.push({d:d,i:i,name:name,am:en_()?e[3]:e[2],h:h}); } }); }
  return res;
}
// 0.5.20 round 2, request 11: each Home card is exactly as tall as its content (no empty space, nothing scrolls inside a card).
// Width stays as set in ✏️ Edit; the height follows the content (rows of 33 px + 6 px gap). (wFit is the fitness widget.)
function wFitH(){ var g=document.getElementById("wGrid"); if(!g || g.classList.contains("editing")) return;
  [].forEach.call(g.querySelectorAll(".wg:not(.isSc)"), function(w){ var c=w.querySelector(".wgc>*"); if(!c) return;
    var mh=c.style.minHeight; c.style.minHeight="0"; c.style.height="auto"; var need=c.offsetHeight; c.style.minHeight=mh; c.style.height="";
    if(need<20) return; var rows=Math.max(2, Math.ceil((need+6)/39)); w.style.gridRow="span "+rows; }); }
window.addEventListener("resize", function(){ clearTimeout(wFitH.t); wFitH.t=setTimeout(wFitH, 200); });
var hadOff=0, ayOff=0, ayMs=null;
function wNav(k){ return '<span class="wnav"><button class="ib" data-wnav="'+k+'|-1" aria-label="‹">‹</button><button class="ib" data-wnav="'+k+'|1" aria-label="›">›</button></span>'; }
document.addEventListener("click", function(e){ var b=e.target.closest && e.target.closest("[data-wnav]"); if(!b) return; e.preventDefault(); e.stopPropagation(); var p=b.getAttribute("data-wnav").split("|");
  if(p[0]==="hadith") hadOff+=(+p[1]); else ayOff+=(+p[1]); render(); }, true);
var HC={
  next:function(){
    var now=new Date(), t=getDay(now), np=nextPrev(), cur=np.prev?np.prev.k:null, curToday=np.prev && ymd(new Date(np.prev.t))===ymd(now);
    if(!np.next) return '';
    // 0.5.20 (review 13): countdown first, then the five prayers as one full-width row with the next one lit
    return '<div class="card hnext hn2"><div class="hnTop"><div class="hn-name"><span class="mut small">'+T("next")+'</span> '+T(np.next.k)+' <span class="hn-time">'+hm12(np.next.t)+'</span></div><div class="hn-cd" id="hnCd">'+cdStr(np.next.t-Date.now())+'</div></div>'+
      '<div class="trow sm">'+PR.map(function(k0){ var c=prCell(k0,t), k=c.k, p=fmt12(c.hm).split(" "); return '<div class="tc '+((k===cur&&curToday)||c.cur?"cur":"")+(k===np.next.k?" nx":"")+'"><div class="tn">'+prN(k)+'</div><div class="tt">'+p[0]+'</div><div class="ta">'+(p[1]||"")+'</div></div>'; }).join("")+'</div>'+
      '<div class="mut tiny" style="margin-top:4px">📍 '+esc(zoneShort())+(t.src==="jakim"?' · JAKIM':(t.src==="abroad"?' · '+L2x("kiraan","calculated"):' · '+L2x("anggaran","estimate")))+(S.pauseMode==="haid"?' · 🌸 '+L2x("makluman dijeda","alerts paused"):'')+'</div></div>';
  },
  quick:function(){
    var Q=[["rk","🕌",L2x("Kira rakaat","Count rakaat")],["qibla","🧭",T("qibla")],["tasbih","📿","Tasbih"],["mathurat","📖","Ma'thurat"],["doa","🤲","Doa"],["amal","🌙",L2x("Amal sunat","Sunnah deeds")],["kids","🧒",T("kids")],["finder","📍",L2x("Cari","Find")]];
    return '<div class="card qgrid">'+Q.map(function(q){ return '<button class="qt" data-act="q-'+q[0]+'"><span>'+q[1]+'</span>'+q[2]+'</button>'; }).join("")+'</div>';
  },
  pause:function(){
    if(S.pauseMode==="haid"){
      if(S.pauseUntil && Date.now()>S.pauseUntil){ S.pauseMode=null; saveS(); return ''; }
      var dt=new Date(S.pauseUntil).toLocaleDateString(locTag(),{weekday:"short",day:"numeric",month:"short"});
      return '<div class="card pz"><h3>🌸 '+L2x("Cuti solat (haid / nifas)","Prayer break (haid / nifas)")+'</h3><div class="mut small">'+L2x("Makluman solat dijeda sehingga ","Prayer alerts paused until ")+'<b>'+dt+'</b></div>'+
        '<div class="snl" style="margin-top:8px">'+L2x("Amalan yang masih boleh dilakukan","What you can still do")+'</div><ul class="ul">'+(en_()?HAID_AMALAN.en:HAID_AMALAN.ms).map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul>'+
        '<div class="mut tiny">'+glz(esc(L2x(HAID_AMALAN.note_ms,HAID_AMALAN.note_en)))+'</div><div class="btns" style="margin-top:8px"><button class="btn alt" data-act="pz-end">'+L2x("Sudah suci: sambung makluman","Purified: resume alerts")+'</button><button class="btn alt" data-go="asma">'+T("asma")+'</button></div></div>';
    }
    if(S.pauseMode==="sakit") return '<div class="card pz"><h3>🏥 '+L2x("Solat ketika sakit","Praying while sick")+'</h3><ul class="ul">'+(en_()?SICK_GUIDE.en:SICK_GUIDE.ms).map(function(x){return '<li>'+glz(esc(x))+'</li>';}).join("")+'</ul><div class="src">'+srcHtml(SICK_GUIDE.src)+'</div><div class="btns" style="margin-top:8px"><button class="btn alt" data-act="pz-end">'+L2x("Sudah sihat","I am well again")+'</button></div></div>';
    return '';
  },
  musafir:function(){ return musafirNow()?musafirBanner():''; },
  ramadan:function(){
    var now=new Date(), h=hijriOf(now), inR=h&&h.m===9, en=en_();
    // 0.6.31 (owner): from 1 Rejab to the end of Ramadan a Rejab › Syaaban › Ramadan calendar (swipe), past days crossed out; hidden from 1 Syawal until next Rejab
    if(h && (h.m===7 || h.m===8) && !inR) return rmCal(h, now);
    if(!inR){
      var ev=nextHijriEvent(9,1,10,1); if(!ev) return ''; var t0=new Date(); t0.setHours(0,0,0,0); var days=Math.round((ev.start-t0)/864e5);
      if(days>30 && !S.ramadanForce) return '';
      return '<div class="card rmd"><h3>🌙 Ramadan '+L2x("dalam ","in ")+days+L2x(" hari"," days")+'</h3><div class="mut small">'+ev.start.toLocaleDateString(locTag(),{day:"numeric",month:"long",year:"numeric"})+' ('+L2x("anggaran","estimate")+')</div>'+
        (S.ganti.owe>0?'<div class="warnbox">'+L2x("Anda masih ada "+S.ganti.owe+" hari puasa ganti. Selesaikan sebelum Ramadan.","You still owe "+S.ganti.owe+" make-up fasts. Finish them before Ramadan.")+'</div>':'')+'</div>';
    }
    var t=getDay(now), im=at(ymd(now),t.imsak).getTime(), mg=at(ymd(now),t.maghrib).getTime(), bk=DOA[0].items[3];
    var html='<div class="card rmd"><h3>🌙 Ramadan · '+L2x("Hari ke-","Day ")+h.d+'</h3><div class="rgrid">'+
      '<div><div class="mut small">'+L2x("Sahur tamat (imsak)","Sahur ends (imsak)")+'</div><div class="rbig">'+fmt12(t.imsak)+'</div><div class="mut tiny" id="rSahur">'+(Date.now()<im?"−"+cdStr(im-Date.now()):"✓")+'</div></div>'+
      '<div><div class="mut small">'+L2x("Berbuka (Maghrib)","Iftar (Maghrib)")+'</div><div class="rbig">'+fmt12(t.maghrib)+'</div><div class="mut tiny" id="rIftar">'+(Date.now()<mg?"−"+cdStr(mg-Date.now()):"✓")+'</div></div></div>';
    html+='<div class="snl" style="margin-top:8px">'+esc(en?bk.t_en:bk.t_ms)+'</div><div class="ar" style="font-size:calc(var(--arsize) - 4px)">'+bk.ar+'</div>'+rumiDiv(bk.ar)+'<div class="tr">'+esc(tr(bk))+'</div>';
    html+='<div class="btns" style="margin-top:8px"><button class="btn gold" data-act="r-t8">Tarawih 8+3</button><button class="btn gold" data-act="r-t20">Tarawih 20+3</button></div>';
    html+='<div class="set"><span>'+L2x("Penggera imsak","Imsak alarm")+'</span>'+sw("rImsak",S.imsakOn)+'</div></div>';
    return html+rmCal(h, now);
  },
  events:function(){
    var ev=upcomingEvents(3,30); if(!ev.length) ev=upcomingEvents(1,160); if(!ev.length) return '';
    return '<div class="card"><h3>✨ '+L2x("Hari kebesaran Islam","Islamic days")+'</h3>'+ev.map(function(e){ return '<div class="evh"><div class="evd">'+(e.i===0?L2x("Hari ini","Today"):e.i===1?L2x("Esok","Tomorrow"):e.i+L2x(" hari"," days"))+'</div><div><b>'+esc(e.name)+'</b> <span class="mut tiny">'+e.h.d+' '+HIJRI_MONTHS[e.h.m-1]+'</span><div class="small">'+esc(e.am)+'</div></div></div>'; }).join("")+'</div>';
  },
  fast:function(){
    var t=new Date(), a=fastList(t), b=fastList(addDays(t,1)); if(!a.length && !b.length && !S.fastRem) return '';
    var row=function(lbl,l){ return l.length?'<div class="evh"><div class="evd">'+lbl+'</div><div>'+l.map(function(f){return esc(en_()?f.en:f.ms);}).join(", ")+'</div></div>':''; };
    return '<div class="card"><h3>🍽 '+L2x("Puasa sunat","Sunnah fasts")+'</h3>'+row(L2x("Hari ini","Today"),a)+row(L2x("Esok","Tomorrow"),b)+(!a.length&&!b.length?'<div class="mut small">'+L2x("Tiada puasa sunat khusus hari ini atau esok.","No special sunnah fast today or tomorrow.")+'</div>':'')+
      '<div class="set"><span>'+L2x("Ingatkan malam sebelumnya (9 PM)","Remind the night before (9 PM)")+'</span>'+sw("hFastRem",S.fastRem)+'</div></div>';
  },
  // 0.5.20 round 2, request 17: ‹ › step through other days; the tip line is gone
  hadith:function(){
    var h=HADITH_DAILY[((dayIndex(new Date())+hadOff)%HADITH_DAILY.length+HADITH_DAILY.length)%HADITH_DAILY.length];
    return '<div class="card"><h3 class="wnavh">📜 '+L2x("Hadis hari ini","Hadith of the day")+wNav("hadith")+'</h3><div class="hq">'+esc(tr(h))+'</div><div class="src">'+srcHtml(h.src)+'</div><div class="tools">'+shareBtn({text:tr(h),src:h.src,title:L2x("Hadis hari ini","Hadith of the day")})+(h.n40?'<button class="ib" data-n40="'+h.n40+'">📜 '+L2x("Baca penuh","Read in full")+'</button>':'<button class="ib" data-learn="n40">📜 '+L2x("40 Hadis Nawawi","40 Hadith Nawawi")+'</button>')+'</div></div>';
  },
  ayat:function(){
    if(!window.AYAT_DAILY){ loadJs(["quran/ayat_daily.js"], function(){ if(view===homeV()) render(); }, function(){}); return '<div class="card"><h3>📖 '+L2x("Ayat hari ini","Ayat of the day")+'</h3><div class="mut small">'+L2x("Memuatkan…","Loading…")+'</div></div>'; }
    var A=AYAT_DAILY, a=A[((dayIndex(new Date())+ayOff)%A.length+A.length)%A.length], ms=null;
    if(!en_()){ try{ if(!ayMs && window.Native && N.qRead){ var t=N.qRead("quran/tr/ms.json"); ayMs=t?JSON.parse(t):0; } if(ayMs) ms=ayMs[a[2]]; }catch(e){ ayMs=0; } }
    var sn=a[5]||"Surah", ref=sn+" "+a[0]+":"+a[1];
    return '<div class="card wayat"><h3 class="wnavh">📖 '+L2x("Ayat hari ini","Ayat of the day")+wNav("ayat")+'</h3><div class="ar wayAr" dir="rtl">'+esc(a[3])+'</div><div class="hq">'+esc(ms||a[4])+'</div>'+
      '<div class="src">'+esc(ref)+(!en_() && !ms?' · <span class="mut">'+L2x("terjemahan Inggeris; muat turun terjemahan Melayu dalam Al-Quran","English meaning; download the Malay translation in Al-Quran")+'</span>':'')+'</div>'+
      '<div class="tools">'+shareBtn({text:a[3]+"\n\n"+(ms||a[4]),src:ref,title:L2x("Ayat hari ini","Ayat of the day")})+'<button class="ib" data-qopen="'+a[0]+':'+a[1]+'">📖 '+L2x("Buka","Open")+'</button></div></div>';
  },
  fav:function(){
    var f=favItems();
    return '<div class="card"><div class="row"><h3>★ '+L2x("Doa kegemaran","Favourite doa")+'</h3>'+(f.length?'<button class="chip" data-act="fav-all">'+L2x("Semua","All")+'</button>':'')+'</div>'+
      (f.length?f.slice(0,4).map(function(x){ return '<div class="fvi"><div class="row"><b class="small">'+esc(en_()?x.it.t_en:x.it.t_ms)+'</b>'+sayBtn(x.it.ar)+'</div><div class="ar" style="font-size:calc(var(--arsize) - 6px)">'+x.it.ar+'</div>'+rumiDiv(x.it.ar)+'</div>'; }).join(""):'<div class="mut small">'+L2x("Tekan ☆ pada doa di tab Doa untuk menyimpannya di sini.","Tap ☆ on a doa in the Doa tab to keep it here.")+'</div>')+'</div>';
  },
  ganti:function(){
    var g=S.ganti, last=g.done.length?g.done[g.done.length-1]:null, ev=nextHijriEvent(9,1,10,1), t0=new Date(); t0.setHours(0,0,0,0);
    var left=ev&&!ev.inProgress?Math.round((ev.start-t0)/864e5):null;
    return '<div class="card"><h3>🗓 '+L2x("Puasa ganti","Make-up fasts")+'</h3><div class="gnt"><button class="chip" data-act="g-minus">−</button><div><div class="gbig">'+g.owe+'</div><div class="mut tiny">'+L2x("hari lagi","days left")+'</div></div><button class="chip" data-act="g-plus">+</button></div>'+
      '<button class="btn gold full" data-act="g-done" '+(g.owe>0?'':'disabled')+'>✓ '+L2x("Saya ganti puasa hari ini","I made up a fast today")+'</button>'+
      '<div class="mut tiny" style="margin-top:6px">'+L2x("Selesai: ","Done: ")+g.done.length+(last?' · '+L2x("terakhir ","last ")+last:'')+(left!=null&&g.owe>0?' · Ramadan '+L2x("dalam ","in ")+left+L2x(" hari"," days"):'')+'</div></div>';
  }
};
function musafirBanner(){
  var d=(S.home&&S.lat!=null)?Math.round(distKm(S.home.lat,S.home.lon,S.lat,S.lon)):null;
  return '<div class="card mus"><h3>🚗 '+L2x("Anda musafir","You are travelling")+(d!=null?' · '+d+' km':'')+'</h3><div class="small">'+glz(esc(L2x("Zohor, Asar dan Isyak boleh diqasar kepada 2 rakaat. Boleh jamak Zohor dengan Asar, dan Maghrib dengan Isyak.","Zohor, Asar and Isyak may be shortened (qasar) to 2 rakaat. You may combine (jamak) Zohor with Asar, and Maghrib with Isyak.")))+'</div><div class="btns" style="margin-top:8px"><button class="btn alt" data-learn="musafir">📘 '+L2x("Panduan musafir","Traveller's guide")+'</button></div></div>';
}
function bindMusafir(el){}
// ---------- 0.9.0 HOME: editable widget grid ----------
// S.widgets = [{id, w, h}] in order; the grid is 4 columns, rows of fixed height, packed top to bottom ("dense").
// Each widget snaps to whole cells; resize with the corner grip, move with the top-left grip, while editing.
var WCAT=[["solat","🕌","Solat","Prayer"],["zikir","📿","Zikir & doa","Dhikr & doa"],["kal","📅","Puasa & kalendar","Fasting & calendar"],["learn","📚","Belajar","Learn"],["media","📻","Radio & podcast","Radio & podcast"],["tools","🧰","Alat","Tools"],["stats","📊","Statistik","Stats"]];
function scW(cat, ic, ms, en, act, dms, den){ return {cat:cat, ic:ic, ms:ms, en:en, sc:act, d:[dms||"",den||""], def:[1,1], min:[1,1], max:[4,2]}; }
function cardW(cat, ic, ms, en, fn, def, min, cond){ return {cat:cat, ic:ic, ms:ms, en:en, r:fn, def:def, min:min||[2,2], max:[4,8], cond:cond}; }
var WG={
  // cards
  next: cardW("solat","🕌","Waktu solat seterusnya","Next prayer",function(w,h){ return w>=4?HC.next():wNextSmall(w,h); },[4,3],[2,2]),
  times: cardW("solat","🕰","Waktu solat hari ini","Today's prayer times",function(w,h){ return wTimes(w,h); },[4,2],[2,2]),
  prtoday: cardW("solat","✅","Solat dikira hari ini","Prayers counted today",function(w){ return '<div class="card"><h3>✅ '+L2x("Solat hari ini","Prayers today")+'</h3>'+prRegister(ymd(new Date()), w<4)+'</div>'; },[4,2],[2,2]),
  musafir: cardW("solat","🚗","Musafir (bila dalam perjalanan)","Travelling (when away)",function(){ return HC.musafir(); },[4,3],[2,2],L2x("Muncul bila anda lebih 81 km dari rumah","Shows when you are 81 km+ from home")),
  pause: cardW("solat","🌸","Mod uzur (bila aktif)","Uzur mode (when on)",function(){ return HC.pause(); },[4,4],[2,2],L2x("Muncul bila mod uzur dihidupkan","Shows when uzur mode is on")),
  quick: cardW("solat","⚡","Pintasan (8 dalam satu)","Shortcuts (8 in one)",function(){ return HC.quick(); },[4,2],[4,2]),
  tasbihw: cardW("zikir","📿","Tasbih (ketik untuk kira)","Tasbih (tap to count)",function(w,h){ return wTasbih(w,h); },[2,2],[1,1]),
  hadith: cardW("zikir","📜","Hadis hari ini","Hadith of the day",function(){ return HC.hadith(); },[4,3],[2,2]),
  ayat: cardW("sunat","📖","Ayat hari ini","Ayat of the day",function(){ return HC.ayat(); },[4,3],[2,2]),
  rdoa: cardW("zikir","🤲","Doa rawak","Random doa",function(){ return wRandDoa(); },[4,3],[2,2]),
  fav: cardW("zikir","★","Doa kegemaran","Favourite doa",function(){ return HC.fav(); },[4,3],[2,2]),
  asmaday: cardW("zikir","✨","Asmaul Husna hari ini","Name of Allah today",function(w,h){ return wAsma(w,h); },[2,2],[2,1]),
  clock: cardW("kal","🗓","Jam & tarikh Hijrah","Clock & Hijri date",function(w,h){ return wClock(w,h); },[4,1],[2,1]),
  countdown: cardW("kal","⏳","Kiraan ke Ramadan & Hari Raya","Countdown to Ramadan & Eid",function(w,h){ return '<div class="card wcd">'+countdownBoxes()+(h>=3?'<div class="kadRow"><button class="chip" data-kad="">🎴 '+L2x("Buat kad ucapan","Make a greeting card")+'</button></div>':'')+'</div>'; },[4,2],[4,2]),
  journal: cardW("kal","📓","Muhasabah hari ini","Today's reflection",function(){ return wJournal(); },[4,2],[2,2]),
  mydoa: cardW("zikir","🤲","Doa saya","My doa list",function(){ return wMyDoa(); },[4,3],[2,2]),
  ramadanm: cardW("kal","🌙","Bulan Ramadan (tanda selepas Maghrib)","Ramadan month (ticks at Maghrib)",function(){ return ramadanMonth().replace('class="card rmCard"','class="rmCard"'); },[4,6],[4,4]),
  ramadan: cardW("kal","🌙","Ramadan (bila hampir)","Ramadan (when near)",function(){ return HC.ramadan(); },[4,4],[2,2],L2x("Muncul 30 hari sebelum Ramadan","Shows 30 days before Ramadan")),
  events: cardW("kal","✨","Hari kebesaran Islam","Islamic days",function(){ return HC.events(); },[4,3],[2,2]),
  fast: cardW("kal","🍽","Puasa sunat","Sunnah fasts",function(){ return HC.fast(); },[4,2],[2,2]),
  ganti: cardW("kal","🗓","Puasa ganti","Make-up fasts",function(){ return HC.ganti(); },[4,3],[2,2]),
  tekapwod: cardW("tools","✍️","Latihan tekap hari ini","Today's tracing practice",function(){ return tkWodW(); },[4,2],[2,2]),   // 0.6.65
  news: cardW("media","📰","Tajuk berita","Headlines",function(){ if(S.kidLock) return ''; if(!window.IbNews){ loadJs(["news/news_data.js","news/news.js"], function(){ if(view===homeV()) render(); }, function(){}); return '<div class="card mut">📰 …</div>'; } return '<div class="card" data-act="learn:news">'+IbNews.widget()+'</div>'; },[4,2],[2,2]),
  nowplay: cardW("media","🎧","Sedang dimainkan","Now playing",function(w,h){ return window.IbMedia?IbMedia.widget(w,h):'<div class="card"><h3>🎧 '+L2x("Radio & podcast","Radio & podcast")+'</h3></div>'; },[4,1],[2,1]),
  usage: cardW("stats","⏱","Masa penggunaan hari ini","Time spent today",function(w,h){ return wUsage(w,h); },[2,2],[2,1]),
  usageweek: cardW("stats","📊","Masa penggunaan minggu ini","Time spent this week",function(w,h){ return wUsageWeek(w,h); },[4,2],[2,2]),
  // shortcuts
  "sc-rk": scW("solat","🕌","Kira rakaat","Count rakaat","q-rk","Mula kira solat waktu ini","Start counting the current prayer"),
  "sc-qibla": scW("solat","🧭","Kiblat","Qibla","q-qibla"),
  "sc-qcam": scW("solat","📷","Kiblat kamera","Qibla camera","qcam"),
  "sc-solat": scW("solat","🕰","Tab Solat","Solat tab","go:solat"),
  "sc-t8": scW("solat","🌙","Tarawih 8+3","Tarawih 8+3","r-t8"),
  "sc-t20": scW("solat","🌙","Tarawih 20+3","Tarawih 20+3","r-t20"),
  "sc-tasbih": scW("zikir","📿","Tasbih","Tasbih","q-tasbih"),
  "sc-zikir": scW("zikir","📿","Zikir selepas solat","After-prayer dhikr","z:after"),
  "sc-mathurat": scW("zikir","📖","Ma'thurat","Ma'thurat","q-mathurat"),
  "sc-wirid": scW("zikir","🌄","Wirid pagi & petang","Morning & evening wirid","q-wirid"),
  "sc-doa": scW("zikir","🤲","Doa","Doa","q-doa"),
  "sc-favdoa": scW("zikir","★","Doa kegemaran","Favourite doa","fav-all"),
  "sc-amal": scW("zikir","🌙","Amal sunat","Sunnah deeds","q-amal"),
  "sc-asma": scW("zikir","✨","Asmaul Husna","Names of Allah","go:asma"),
  "sc-cal": scW("kal","📅","Masa","Time","go:cal"),
  "sc-jadual": scW("kal","🗒","Jadual waktu solat bulan ini","This month's prayer timetable","jadual"),
  "sc-quran": scW("learn","📖","Al-Quran","Quran","quran"),
  "sc-kahf": scW("learn","🕳","Al-Kahf (Jumaat)","Al-Kahf (Friday)","quran:18:1","Baca Al-Kahf pada hari Jumaat","Read Al-Kahf on Friday"),
  "sc-mulk": scW("learn","🌙","Al-Mulk (sebelum tidur)","Al-Mulk (before sleep)","quran:67:1","Bacaan sebelum tidur","Before you sleep"),
  "sc-yasin": scW("learn","💚","Yasin","Yasin","quran:36:1"),
  "sc-baq": scW("learn","🛡","2 ayat akhir Al-Baqarah","Last 2 ayat of Al-Baqarah","quran:2:285","Dibaca pada waktu malam","Read at night"),
  "sc-sirah": scW("learn","🐪","Sirah Nabi ﷺ","Sirah ﷺ","sirah"),
  "sc-hajj": scW("learn","🕋","Haji & Umrah 3D","Hajj & Umrah 3D","hajj"),
  "sc-umrahdiy": scW("learn","🧳","Umrah DIY","Umrah DIY","umrahdiy"),
  "sc-tawaf": scW("learn","🔢","Kaunter tawaf & sa'ie","Tawaf & sa'ie counter","tawaf"),
  "sc-prac": scW("learn","🔊","Latihan solat berpandu","Guided solat practice","prac"),
  "sc-learn": scW("learn","📚","Belajar","Learn","go:learn"),
  "sc-kids": scW("learn","🧒","Mod kanak-kanak","Kids mode","q-kids"),
  "sc-radio": scW("media","📻","Radio Islam","Islamic radio","learn:radio"),
  "sc-news": scW("media","📰","Berita Dunia","World news","learn:news"),
  "sc-podcast": scW("media","🎙","Podcast","Podcasts","learn:podcast"),
  "sc-live": scW("media","📺","Siaran langsung Makkah & Madinah","Live Makkah & Madinah","learn:live"),
  "sc-player": scW("media","🎧","Pemain muzik (sedang main)","Player (now playing)","player"),
  "sc-halal": scW("tools","🔍","Semak halal","Halal check","go:halal"),
  "sc-barcode": scW("tools","🛒","Imbas kod bar halal","Scan a halal barcode","barcode"),
  "sc-saham": scW("tools","📈","Saham patuh Syariah","Shariah stocks","saham"),
  "sc-kad": scW("kal","🎴","Kad ucapan Raya & Ramadan","Raya & Ramadan cards","kad"),
  "sc-finder": scW("tools","📍","Cari masjid & makanan","Find mosque & food","q-finder"),
  "sc-more": scW("tools","⚙️","Tetapan","Settings","go:more")
};
// ---------- 0.25.0 WIDGETS: every page as a shortcut, finance, family, find, sirah, quiz, qibla; half transparency; phone widgets ----------
// Farah's rule (2026-11-06): every display element that can be a widget should be one, now and in future builds.
WCAT.splice(5,0,["fin","💰","Kewangan","Finance"],["fam","👨‍👩‍👧","Keluarga","Family"]);
WCAT.push(["page","🗂","Semua halaman (pintasan)","Every page (shortcuts)"]);
function wMoney(n){ return "RM "+(+n||0).toLocaleString("en-MY",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function wFin(){ return load("ihsan_fin",null)||{}; }
function wDebtLeft(x){ var p=(x.pays||[]).reduce(function(a,b){ return a+(+b.amt||0); },0); return x.done?0:Math.max(0,Math.round((x.amt-p)*100)/100); }
function wDebtSum(){ var o={owe:0,owed:0,n:0,due:null}, t=new Date(); t.setHours(0,0,0,0);
  (wFin().debts||[]).forEach(function(x){ var l=wDebtLeft(x); if(!l) return; o.n++; if(x.dir==="owed") o.owed+=l; else o.owe+=l; if(x.due){ var d=new Date(x.due+"T00:00:00"); if(!o.due || d<o.due.d) o.due={d:d,x:x}; } }); return o; }
// 0.6.26 Niaga "Kutipan bulan ini" (collected this month, outstanding, overdue) from the stored document totals; hidden behind the app lock
function bizSum(){ var B=load("ihsan_biz",null); if(!B || !B.profiles) return null; var t=ymd(new Date()), m=t.slice(0,7), o={col:0,out:0,over:0,n:0,name:""}, live=function(a){ return (a||[]).filter(function(x){ return !x.del; }); };
  var ps=live(B.profiles); if(!ps.length) return null; var p=ps.filter(function(x){ return x.id===B.cur; })[0]||ps[0]; o.name=p.name||""; o.cur={MYR:"RM",SGD:"S$",USD:"US$",IDR:"Rp",BND:"B$"}[p.base||"MYR"]||p.base;
  live(B.docs).forEach(function(d){ if(d.pid!==p.id || d.status==="draft" || d.status==="void") return; var T=d.totals||{};
    if(d.type==="OR" && String(d.pdate||d.date).slice(0,7)===m) o.col+=+T.total||0; if(d.type==="CS" && String(d.date).slice(0,7)===m) o.col+=+T.total||0;
    if(d.type==="INV" && (+T.bal||0)>0){ o.out+=+T.bal; if(d.due && d.due<t){ o.over+=+T.bal; o.n++; } } }); return o; }
function bizMoney(o,v){ return (o.cur||"RM")+" "+(Math.round(v*100)/100).toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function wBiz(w,h){ var o=bizSum();
  return '<div class="card wfin" data-wsc="sc-n-alat/niaga"><h3>📑 '+L2x("Kutipan bulan ini","Collected this month")+'</h3>'+(!o?'<div class="mut small">'+L2x("Sediakan perniagaan di Alat › Niaga.","Set up your business in Tools › Business.")+'</div>':S.appLock&&!S.bizOnLock?'<div class="mut small">🔒 '+L2x("Disembunyikan oleh kunci aplikasi","Hidden by the app lock")+'</div>':
    '<div class="wfr"><div><small>'+esc(o.name)+'</small><b class="fpos">'+bizMoney(o,o.col)+'</b></div>'+(w>=3?'<div><small>'+L2x("Belum dibayar","Outstanding")+'</small><b>'+bizMoney(o,o.out)+'</b></div>':'')+'</div>'+(o.n?'<div class="mut tiny">⚠️ '+o.n+L2x(" invois lewat · "," overdue invoices · ")+bizMoney(o,o.over)+'</div>':''))+'</div>'; }
function wDebt(w,h){ var s=wDebtSum();
  return '<div class="card wfin" data-wsc="sc-n-fin/hutang"><h3>🤝 '+L2x("Hutang","Debts")+'</h3>'+(s.n?'<div class="wfr"><div><small>'+L2x("Saya berhutang","I owe")+'</small><b class="fneg">'+wMoney(s.owe)+'</b></div>'+(w>=3?'<div><small>'+L2x("Orang berhutang pada saya","Owed to me")+'</small><b class="fpos">'+wMoney(s.owed)+'</b></div>':'')+'</div>'+
    (h>=2&&s.due?'<div class="mut tiny">⏰ '+esc(s.due.x.who||s.due.x.desc||"")+' · '+s.due.d.toLocaleDateString(locTag(),{day:"numeric",month:"short"})+'</div>':''):'<div class="mut small">'+L2x("Tiada hutang direkod. Alhamdulillah.","No debts recorded. Alhamdulillah.")+'</div>')+'</div>'; }
function wKomit(w,h){ var t=new Date(); t.setHours(0,0,0,0); var L=[];
  (wFin().com||[]).forEach(function(c){ var d=window.FinNextDue?FinNextDue(c,t):null; if(d && (d-t)/864e5<=31) L.push({c:c,d:d}); }); L.sort(function(a,b){ return a.d-b.d; });
  var n=Math.max(1,h*2-1);
  return '<div class="card wfin" data-wsc="sc-n-fin/komitmen"><h3>📆 '+L2x("Komitmen bulan ini","Commitments this month")+'</h3>'+(L.length?L.slice(0,n).map(function(x){ var dd=Math.round((x.d-t)/864e5);
    return '<div class="wfl"><span>'+esc(x.c.name)+'</span><b>'+wMoney(x.c.amt)+'</b><small>'+(dd===0?L2x("Hari ini","Today"):dd===1?L2x("Esok","Tomorrow"):x.d.toLocaleDateString(locTag(),{day:"numeric",month:"short"}))+'</small></div>'; }).join(""):'<div class="mut small">'+L2x("Tiada bayaran dalam 31 hari.","Nothing due in 31 days.")+'</div>')+'</div>'; }
function wZakat(w,h){ var y=new Date().getFullYear(), tot=0, n=0; (wFin().zakat||[]).forEach(function(z){ if(String(z.d||"").slice(0,4)===String(y)){ tot+=+z.amt||0; n++; } });
  return '<div class="card wfin" data-wsc="sc-n-fin/zakat"><h3>💰 '+L2x("Zakat ","Zakat ")+y+'</h3><div class="ubig">'+wMoney(tot)+'</div><div class="mut tiny">'+n+' '+L2x("rekod","records")+'</div></div>'; }
function wBday(w,h){ var F=load("ihsan_family",null)||{}, L=[], t=new Date(); t.setHours(0,0,0,0);
  (F.p||[]).forEach(function(p){ if(p.dd || !p.b || !window.FamNext) return; var nx=FamNext(p); if(nx.g) L.push({p:p,d:nx.g,h:false}); if(nx.h) L.push({p:p,d:nx.h,h:true}); });
  L.sort(function(a,b){ return a.d-b.d; }); var n=Math.max(1,h*2-1);
  return '<div class="card wfin" data-wsc="sc-n-alat/keluarga"><h3>🎂 '+L2x("Hari lahir akan datang","Upcoming birthdays")+'</h3>'+(L.length?L.slice(0,n).map(function(x){ var dd=Math.round((x.d-t)/864e5);
    return '<div class="wfl"><span>'+esc(x.p.n)+(x.h?' <em class="gold">'+L2x("Hijrah","Hijri")+'</em>':'')+'</span><small>'+(dd===0?"🎉 "+L2x("Hari ini","Today"):dd+" "+L2x("hari","days"))+'</small></div>'; }).join(""):'<div class="mut small">'+L2x("Tambah keluarga dan tarikh lahir di Alat › Keluarga.","Add family and birth dates in Tools › Family.")+'</div>')+'</div>'; }
// 0.35.0: next vaccines (Bayi) and next events (Majlis), from ihsan_famrem written by family/baby.js and family/events.js
function wVax(w,h){ var R=load("ihsan_famrem",null)||{}, L=R.vx||[], t=new Date(); t.setHours(0,0,0,0); var n=Math.max(1,h*2-1);
  return '<div class="card wfin" data-wsc="sc-baby"><h3>💉 '+L2x("Vaksin seterusnya","Next vaccines")+'</h3>'+(L.length?L.slice(0,n).map(function(x){ var dd=Math.round((x.t-t)/864e5);
    return '<div class="wfl"><span>'+esc(x.kid)+' · '+esc(x.v)+'</span><small>'+(dd<0?"⏰ "+L2x("lewat","overdue"):dd===0?L2x("Hari ini","Today"):dd+" "+L2x("hari","days"))+'</small></div>'; }).join(""):'<div class="mut small">'+L2x("Tambah anak di Alat › Keluarga › Bayi.","Add a child in Tools › Family › Baby.")+'</div>')+'</div>'; }
function wEvents(w,h){ var R=load("ihsan_famrem",null)||{}, L=(R.evs||[]).filter(function(x){ return x.t>=Date.now()-864e5; }), t=new Date(); t.setHours(0,0,0,0); var n=Math.max(1,h*2-1);
  return '<div class="card wfin" data-wsc="sc-events"><h3>🎉 '+L2x("Majlis akan datang","Upcoming events")+'</h3>'+(L.length?L.slice(0,n).map(function(x){ var dd=Math.round((x.t-t)/864e5);
    return '<div class="wfl"><span>'+x.ic+' '+esc(x.n)+'</span><small>'+(dd<=0?"🎉 "+L2x("Hari ini","Today"):dd+" "+L2x("hari","days"))+'</small></div>'; }).join(""):'<div class="mut small">'+L2x("Rancang majlis di Alat › Keluarga › Majlis.","Plan an event in Tools › Family › Events.")+'</div>')+'</div>'; }
function wSirah(w,h){ setTimeout(function(){ var b=document.getElementById("wSirahB"); if(b) withExtra(null, function(){ IbExtra.sirahSnippet(b, xH()); }); }, 0);
  return '<div id="wSirahB" class="wsir"><div class="card mut small">🐪 '+L2x("Sirah hari ini…","Today's Sirah…")+'</div></div>'; }
function wDonate(){ return '<div class="card"><h3>💝 '+L2x("Derma berdekatan","Give nearby")+'</h3><div class="btns">'+[["rumah anak yatim","🧒","Anak yatim","Orphanage"],["rumah jagaan warga emas","👵","Warga emas","Elderly home"],["yayasan islam","🤲","Yayasan","Foundation"],["maahad tahfiz","📖","Tahfiz","Tahfiz"]].map(function(x){ return '<button class="btn alt g3d" data-maps="'+x[0]+'">'+x[1]+' '+esc(L2x(x[2],x[3]))+'</button>'; }).join("")+'</div></div>'; }
function wSurau(w,h){ var d=load("ihsan_extra",null)||{}, L=(d.surau||[]); var n=Math.max(1,h*2-1);
  return '<div class="card" data-wsc="sc-n-alat/cari"><h3>🛖 '+L2x("Surau saya","My surau")+'</h3>'+(L.length?L.slice(-n).reverse().map(function(s){ return '<div class="wfl"><span>'+esc(s.n)+'</span><small>'+(s.tg||[]).map(function(t){ return {w:"🧕",u:"💧",o:"♿",t:"🧣",p:"🅿",a:"❄"}[t]||""; }).join("")+'</small></div>'; }).join(""):'<div class="mut small">'+L2x("Simpan surau di Alat › Cari.","Save surau in Tools › Find.")+'</div>')+'</div>'; }
function wQibla(w,h){ var p=qiblaPoint(), b=qiblaBearing(p[0],p[1]);
  return '<div class="card wqib" data-wsc="sc-qibla"><div class="wqd" style="--qb:'+b.toFixed(1)+'deg"><i></i></div><div><b>'+b.toFixed(1)+'°</b><div class="mut tiny">'+L2x("Kiblat dari utara","Qibla from north")+'</div></div></div>'; }
// 0.37.0: exercise today and this week (reads ihsan_fit directly)
function wFit(w,h){ var F=load("ihsan_fit",null)||{}, L=F.log||[], t=ymd(new Date()), d=new Date(), mon=ymd(addDays(d,-((d.getDay()+6)%7))), tk=0, tm=0, wm=0, days={};
  L.forEach(function(x){ days[x.d]=1; if(x.d===t){ tk+=x.kcal||0; tm+=x.min||0; } if(x.d>=mon) wm+=x.min||0; });
  var c=0, q=new Date(); if(!days[ymd(q)]) q=addDays(q,-1); while(days[ymd(q)]){ c++; q=addDays(q,-1); }
  return '<div class="card wfin" data-wsc="sc-n-cal/senaman"><h3>🏃 '+L2x("Gerak","Move")+'</h3><div class="wfl"><span>🔥 '+Math.round(tk)+' kcal · '+Math.round(tm)+' min</span><small>🔥 '+c+L2x(" hari"," days")+'</small></div>'+
    '<div class="ubar1"><i style="width:'+Math.min(100,Math.round(wm*100/150))+'%"></i></div><div class="mut tiny">'+Math.round(wm)+' / 150 '+L2x("minit minggu ini","min this week")+'</div></div>'; }
// 0.5.20: the Cardio and Travel banners (moved out of the Fitness page) as one resizable Home widget.
// Wide: both side by side; tall: stacked; small: the one you used last. Tap opens Exercise in that mode.
// banner art: a heart-rate line for Cardio, a runner on a winding road for Travel
var CARDIO_ART='<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M60 70 C20 46 8 30 18 17 C27 6 46 8 60 24 C74 8 93 6 102 17 C112 30 100 46 60 70Z" fill="rgba(255,255,255,.16)"/><path d="M6 44 H38 L46 26 L56 60 L66 18 L74 44 H114" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var RUN_ART='<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M-4 74 C30 62 26 46 58 44 C90 42 86 26 124 18" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="10" stroke-linecap="round"/><path d="M-4 74 C30 62 26 46 58 44 C90 42 86 26 124 18" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 7"/>'+
  '<circle cx="78" cy="14" r="6" fill="#fff"/><path d="M76 22 L70 40 L58 46 M70 40 L80 50 L76 62 M73 28 L86 34 M73 28 L62 30" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function wExBan(w,h){ var F=load("ihsan_fit",null)||{}, L=F.log||[], d=new Date(), mon=ymd(addDays(d,-((d.getDay()+6)%7))), wm=0, days={}, R=load("ihsan_runs",[])||[], m0=new Date(mon+"T00:00:00").getTime(), km=0, n=0;
  L.forEach(function(x){ days[x.d]=1; if(x.d>=mon && !x.run) wm+=x.min||0; }); R.forEach(function(r){ if(r.t0>=m0){ km+=r.dist; n++; } });
  var c=0, q=new Date(); if(!days[ymd(q)]) q=addDays(q,-1); while(days[ymd(q)]){ c++; q=addDays(q,-1); }
  var car='<div class="fitBan cardio" data-exm="cardio"><div class="fbTx"><small>'+L2x("Kardio","Cardio")+'</small><b>'+Math.round(wm)+' min</b><span>'+L2x("minggu ini · 🔥 ","this week · 🔥 ")+c+'</span><i class="fbBar"><em style="width:'+Math.min(100,Math.round(wm*100/150))+'%"></em></i></div><div class="fbArt">'+CARDIO_ART+'</div></div>';
  var tra='<div class="fitBan run" data-exm="travel"><div class="fbTx"><small>'+L2x("Perjalanan","Travel")+'</small><b>'+(km/1000).toFixed(1)+' km</b><span>'+L2x("minggu ini · ","this week · ")+n+'</span></div><div class="fbArt">'+RUN_ART+'</div></div>';
  var last=(F.mode==="travel"||F.mode==="run")?"travel":"cardio";
  return '<div class="exBanW'+(w>=4?' wide':'')+(h>=2&&w<4?' tall':'')+'">'+(w>=4||h>=2?car+tra:(last==="travel"?tra:car))+'</div>'; }
document.addEventListener("click", function(e){ var b=e.target.closest && e.target.closest("[data-exm]"); if(!b || document.getElementById("wGrid") && document.getElementById("wGrid").classList.contains("editing")) return;
  var F=load("ihsan_fit",null)||{}; F.mode=b.getAttribute("data-exm"); save("ihsan_fit",F); SUB2.cal="senaman"; go("cal"); });
Object.assign(WG,{
  exban: cardW("kal","🏋️","Gerak: kardio & perjalanan","Move: cardio & travel",wExBan,[4,2],[2,1]),
  fitw: cardW("kal","🏃","Gerak hari ini","Move today",wFit,[4,2],[2,2]),
  debt: cardW("fin","🤝","Ringkasan hutang","Debt summary",wDebt,[4,2],[2,1]),
  syncw: cardW("tools","⟳","Sync Google Drive","Google Drive sync",function(){ var st=window.DriveSync?DriveSync.status():{state:"off"}; return '<div class="card wsync" data-wact="sync"><h3>⟳ '+L2x("Sync","Sync")+'</h3>'+(window.DriveSync?dsStatusHtml(st):'')+'<div class="mut tiny">'+(DriveSync.meta().email||L2x("Ketik untuk sambung Google Drive","Tap to connect Google Drive"))+'</div></div>'; },[4,1],[2,1]),
  bizw: cardW("fin","📑","Kutipan bulan ini (Niaga)","Collected this month (Business)",wBiz,[4,2],[2,1]),
  komit: cardW("fin","📆","Komitmen akan datang","Upcoming commitments",wKomit,[4,2],[2,2]),
  zakatw: cardW("fin","💰","Zakat tahun ini","Zakat this year",wZakat,[2,2],[2,1]),
  bday: cardW("fam","🎂","Hari lahir keluarga","Family birthdays",wBday,[4,2],[2,2]),
  vaxw: cardW("fam","💉","Vaksin anak","Children's vaccines",wVax,[4,2],[2,2]),
  eventw: cardW("fam","🎉","Majlis akan datang","Upcoming events",wEvents,[4,2],[2,2]),
  sirahday: cardW("learn","🐪","Sirah hari ini","Today's Sirah",wSirah,[4,4],[4,3]),
  donate: cardW("tools","💝","Derma berdekatan","Give nearby",wDonate,[4,2],[4,2]),
  surau: cardW("tools","🛖","Surau saya","My surau list",wSurau,[4,2],[2,2]),
  qiblaw: cardW("solat","🧭","Arah kiblat","Qibla direction",wQibla,[2,1],[2,1]),
  "sc-quiz": scW("learn","🧠","Kuiz Islam","Islamic quiz","x:quiz"),
  "sc-pksk": scW("learn","📝","Latihan PKSK","PKSK practice exam","pksk","Nota & latihan ujian kemasukan sekolah khusus","Notes & practice for the special school entry test"),
  "sc-flight": scW("solat","✈","Solat dalam pesawat","Praying on a flight","x:flight"),
  "sc-ziarah": scW("zikir","🪦","Doa ziarah kubur","Grave visit doa","x:ziarah"),
  "sc-famtree": scW("fam","🌳","Salasilah 3D","3D family tree","side:alat/keluarga"),
  "sc-baby": scW("fam","👶","Bayi: vaksin & kenangan","Baby: vaccines & memories","fam:baby"),
  "sc-events": scW("fam","🎉","Perancang majlis","Event planner","fam:events"),
  "sc-hutang": scW("fin","🤝","Hutang","Debts","side:fin/hutang"),
  "sc-zakat": scW("fin","💰","Log zakat","Zakat log","side:fin/zakat"),
  "sc-wasiat": scW("fin","📜","Wasiat & faraid","Will & faraid","side:fin/wasiat"),
  "sc-fx": scW("fin","💱","Tukaran mata wang","Currency converter","side:fin/tukaran"),
  fx: cardW("fin","💱","Kadar mata wang kegemaran","Favourite currency rates",function(){ if(!window.FxView){ loadJs(["finance/fx.js"], function(){ if(view==="home") render(); }); return '<div class="card mut small" data-go="fin">💱 …</div>'; }
    var l=FxView.card(finH2()); return '<div class="card" data-act="side:fin/tukaran"><h3>💱 '+L2x("Kadar mata wang","Currency rates")+'</h3>'+l.map(function(x){ return '<div class="set"><span>'+esc(x.p)+'</span><span><b>'+esc(x.r)+'</b>'+(x.ch==null?'':' <small style="color:'+(x.ch>=0?'#3fb27f':'#e5484d')+'">'+(x.ch>=0?'▲':'▼')+Math.abs(x.ch).toFixed(2)+'%</small>')+'</span></div>'; }).join("")+'<div class="mut tiny">'+L2x("Kadar harian","Daily rate")+'</div></div>'; },[4,2],[2,2])
});
var wPagesDone=false;
function wPages(){ if(wPagesDone) return; wPagesDone=true;
  var keep=S.lang, tree={};
  ["ms","en"].forEach(function(lg){ S.lang=lg; try{ var walk=function(arr, par){ arr.forEach(function(x){ if(x.id==="search") return; var t=tree[x.id]||(tree[x.id]={ic:x.ic, par:par}); t[lg]=(par&&tree[par]?tree[par][lg]+" › ":"")+x.lb; if(x.k) walk(x.k, x.id); }); }; walk(sideTree(), null); }catch(e){} });
  S.lang=keep;
  Object.keys(tree).forEach(function(id){ var t=tree[id]; if(t.ms) WG["sc-n-"+id]=scW("page", t.ic, t.ms, t.en||t.ms, "side:"+id); });
}
function sideFind(id){ if(id==="cal/fokus" || id.indexOf("cal/fokus/")===0){ var fp=id.split("/")[2]||(((load("ihsan_focus",{})||{}).sess||{}).on?"focus":"today"); if(fp==="grow") fp="goals"; return {id:id, f:function(){ SUB2.cal="bulan"; SUB2.plt=fp; cal.mode="p"; go("cal"); }}; } if(id==="alat/cari" || id==="alat/senyap") return {id:id, f:openFind}; if(id==="alat/majlis") return {id:id, f:gatherEvents}; if(id==="alat/pets") return {id:id, f:function(){ SUB2.alat="keluarga"; SUB2.life="pets"; go("alat"); }}; if(id==="cal/puasa") return {id:id, f:function(){ SUB2.cal="bulan"; cal.mode="h"; go("cal"); }};   /* 0.6.68: Fasting moved to the Hijri calendar + Deeds */ id={"fin/niaga":"alat/niaga","alat/buku":"learn/buku","alat/nota/buku":"learn/buku","alat/karya":"alat/nota/karya","fin/saham":"fin/tukaran","alat/saham":"fin/tukaran"}[id]||id; var f=null, walk=function(arr){ arr.forEach(function(x){ if(f) return; if(x.id===id) f=x; else if(x.k) walk(x.k); }); }; walk(sideTree()); return f; }
// half transparency for home widgets and phone widgets
function wAlphaCls(){ var a=S.wAlpha||100; return a<100?" wa"+a:""; }
// phone home-screen widgets: data for the native widgets (prayer times come from the schedule)
var wPushLast="";
function pushWidgets(){ if(!window.Native || !N.setWidgetData) return; try{
  var d=wDebtSum(), t=new Date(); t.setHours(0,0,0,0); var o={a:S.wAlpha||100, lang:S.lang};
  var com=[]; (wFin().com||[]).forEach(function(c){ var x=window.FinNextDue?FinNextDue(c,t):null; if(x && (x-t)/864e5<=31) com.push([x.getTime(), c.name+" · "+wMoney(c.amt)]); }); com.sort(function(a,b){ return a[0]-b[0]; });
  o.fin={t:L2x("Kewangan","Finance"), l:[L2x("Saya berhutang ","I owe ")+wMoney(d.owe), L2x("Orang berhutang ","Owed to me ")+wMoney(d.owed)].concat(com.slice(0,3).map(function(x){ return "📆 "+new Date(x[0]).toLocaleDateString(locTag(),{day:"numeric",month:"short"})+" · "+x[1]; }))};
  try{ var bz=bizSum(); o.biz={t:L2x("Kutipan bulan ini","Collected this month"), l:!bz?[L2x("Sediakan perniagaan di Alat › Niaga.","Set up your business in Tools › Business.")]:(S.appLock&&!S.bizOnLock)?["🔒 "+L2x("Disembunyikan oleh kunci aplikasi","Hidden by the app lock")]:
    ["💰 "+bizMoney(bz,bz.col)+" · "+bz.name, "⏳ "+L2x("Belum dibayar ","Outstanding ")+bizMoney(bz,bz.out)].concat(bz.n?["⚠️ "+bz.n+L2x(" invois lewat · "," overdue · ")+bizMoney(bz,bz.over)]:[])}; }catch(e){}
  var F=load("ihsan_family",null)||{}, B=[]; (F.p||[]).forEach(function(p){ if(p.dd||!p.b||!window.FamNext) return; var nx=FamNext(p); if(nx.g) B.push([nx.g.getTime(), p.n]); if(nx.h) B.push([nx.h.getTime(), p.n+" ("+L2x("Hijrah","Hijri")+")"]); }); B.sort(function(a,b){ return a[0]-b[0]; });
  o.fam={t:L2x("Hari lahir keluarga","Family birthdays"), l:B.slice(0,4).map(function(x){ var dd=Math.round((x[0]-t)/864e5); return "🎂 "+x[1]+" · "+(dd===0?L2x("hari ini","today"):dd+" "+L2x("hari","days")); })};
  if(window.SIRAH && SIRAH.length){ o.sirah=SIRAH.map(function(e){ var f=String(L2x(e.f[0],e.f[1])||"").split("\n")[0]; return {t:L2x(e.t[0],e.t[1]), b:f.length>260?f.slice(0,f.lastIndexOf(" ",250))+"…":f}; }); }
  else if(!pushWidgets.sl){ pushWidgets.sl=1; loadJs(["sirah_data_0.js","sirah_data_1.js","sirah_data_2.js","sirah_data_3.js"], function(){ wPushLast=""; pushWidgets(); }); }
  try{ var hj=hijriOf(new Date()); o.today={h:hijriStr(hj)}; }catch(e){}
  // 0.4.7: timely cards for the launcher feed page (Hijri special days, sunnah fasts, Ramadan)
  try{ var C=[], t0=new Date(), t1=new Date(Date.now()+864e5), h0=hijriOf(t0), h1=hijriOf(t1), e0=h0&&EV_NAMES[h0.m+"-"+h0.d], e1=h1&&EV_NAMES[h1.m+"-"+h1.d];
    if(e0) C.push({t:"🌙 "+L2x(e0[0],e0[1]), b:L2x("Hari ini · ","Today · ")+hijriStr(h0), v:"cal"});
    if(e1) C.push({t:"🌙 "+L2x(e1[0],e1[1]), b:L2x("Esok","Tomorrow"), v:"cal"});
    if(h0 && h0.m===9) C.push({t:"🌙 Ramadan · "+L2x("hari ke-"+h0.d,"day "+h0.d), b:L2x("Semoga puasa dan ibadah kita diterima.","May our fasting and worship be accepted."), v:"cal"});
    if(h1 && h1.m!==9 && h1.d>=13 && h1.d<=15) C.push({t:"🍽 "+L2x("Puasa Ayyamul Bidh esok","Ayyamul Bidh fast tomorrow"), b:L2x(h1.d+" "+HIJRI_MONTHS[h1.m-1],h1.d+" "+HIJRI_MONTHS[h1.m-1]), v:"cal"});
    var dw=t1.getDay(); if((dw===1||dw===4) && !(h1&&h1.m===9) && !(h1&&h1.m===10&&h1.d===1)) C.push({t:"🍽 "+L2x("Puasa sunat "+(dw===1?"Isnin":"Khamis")+" esok","Sunnah fast tomorrow ("+(dw===1?"Monday":"Thursday")+")"), b:L2x("Niat dan bersahur.","Make the intention and have suhoor."), v:"cal"});
    o.cards=C; }catch(e){}
  // 0.4.4: any Utama widget as text for the "My Ihsan" phone widget (only the ones placed on the phone home screen)
  try{ var CATV={solat:"solat", zikir:"zikir", kal:"cal", kalendar:"cal", ilmu:"learn", alat:"alat", fin:"fin", fam:"alat", tools:"alat"};
    o.wgCat=Object.keys(WG).filter(function(k){ return WG[k].r && (!WG[k].cond || true); }).map(function(k){ return [k, WG[k].ic, WG[k].ms, WG[k].en]; });
    var wk=[]; try{ wk=JSON.parse(N.homeWidgetKeys?N.homeWidgetKeys():"[]")||[]; }catch(e){}
    o.wg={}; wk.forEach(function(k){ var d=WG[k]; if(!d||!d.r) return; var html=""; try{ html=d.r((d.def||[4,2])[0], (d.def||[4,2])[1])||""; }catch(e){}
      var div=document.createElement("div"); div.innerHTML=String(html).replace(/<br\s*\/?>/gi,"\n").replace(/<\/(div|p|li|h\d|tr|section)>/gi,"$&\n").replace(/<\/(span|b|i|small|strong|em|td|th|a|label)>/gi,"$& ");
      div.querySelectorAll("button,script,style,input,select,svg,.tools,canvas").forEach(function(x){ x.remove(); });
      var lines=(div.textContent||"").split("\n").map(function(x){ return x.replace(/\s+/g," ").trim(); }).filter(Boolean);
      if(lines.length && lines[0].indexOf(L2x(d.ms,d.en))>=0) lines.shift();
      o.wg[k]={ic:d.ic, t:L2x(d.ms,d.en), l:lines.slice(0,10).map(function(x){ return x.length>90?x.slice(0,88)+"…":x; }), v:({groupsw:"kumpulan", dspw:"paparan"})[k]||CATV[d.cat]||"solat"}; });
  }catch(e){ console.error(e); }
  try{ wPages(); o.pages=Object.keys(WG).filter(function(k){ return k.indexOf("sc-n-")===0; }).slice(0,120).map(function(k){ var w=WG[k]; return {ic:w.ic||"🕌", ms:w.ms||"", en:w.en||w.ms||"", v:w.sc||("side:"+k.slice(5))}; }); }catch(e){}
  var j=JSON.stringify(o); if(j!==wPushLast){ wPushLast=j; N.setWidgetData(j); } }catch(e){ console.error(e); } }
var WDEF=["next","sc-rk","sc-qibla","sc-tasbih","sc-mathurat","sc-doa","sc-amal","sc-radio","sc-finder","pause","musafir","ramadan","exban","events","fast","ayat","hadith","usage","nowplay","fav","ganti"];
// 0.5.16: home widgets that need the Android app are left out of the web build
var WEB_W0=["kiblat","qibla","qcam","fokus","senaman","statistik","stat","tukaran","saham","halal","barcode","cari","finder","dengar","tanya","radio","podcast","live","player","nowplay","usage","steps","pause"];
var WEB_W=IOS?WEB_W0:["statistik","stat","usage","steps","screen"];   // 0.6.56: the web app keeps every widget a browser can run
function webOffW(id){ return WEB_W.some(function(k){ return String(id).indexOf(k)>=0; }); }
function wDefaults(){
  var off={}; (S.homeCards||[]).forEach(function(c){ if(!c.on) off[c.id]=1; });
  var wd=WDEF.slice(); if(WEB) wd.splice(wd.indexOf("sc-amal")+1,0,"sc-sirah","sc-hajj","sc-quran");
  return wd.filter(function(id){ return !off[id] && !(WEB && webOffW(id)) && WG[id]; }).map(function(id){ var d=WG[id]; return {id:id, w:id==="nowplay"?2:d.def[0], h:id==="nowplay"?2:d.def[1]}; }).map(function(x){ if(x.id==="usage"){ x.w=2; x.h=2; } x.w*=2; x.h*=2; return x; });
}
function wList(){
  wPages();
  if(!WG["sc-l-wudhu"]) LEARN.forEach(function(x){ WG["sc-l-"+x[0]]=scW("learn",x[1],x[2],x[3],"learn:"+x[0]); });
  if(!Array.isArray(S.widgets)){ S.widgets=wDefaults(); S.wGrid=2; }
  if(S.wGrid!==2){ S.widgets.forEach(function(x){ x.w*=2; x.h*=2; }); S.wGrid=2; } // 0.9.1: grid doubled to 8 columns
  favWidgets();
  S.widgets=S.widgets.filter(function(x){ return WG[x.id]; });
  // 0.5.20: Prayers today leaves the default Home (it can be added back in ✏️ Edit); Ayat of the day joins next to the hadith
  if(S.mig520 && !S.mig520b){ S.mig520b=1; if(!S.widgets.some(function(x){ return x.id==="exban"; })){ var ej=-1; S.widgets.forEach(function(x, i){ if(x.id==="events") ej=i; }); S.widgets.splice(ej>=0?ej:S.widgets.length, 0, {id:"exban", w:8, h:4}); save("ihsan_settings", S); } }
  if(!S.mig520){ S.mig520=1; S.mig520b=1; S.widgets=S.widgets.filter(function(x){ return x.id!=="prtoday"; });
    if(!S.widgets.some(function(x){ return x.id==="exban"; })){ var ei=-1; S.widgets.forEach(function(x, i){ if(x.id==="events") ei=i; }); S.widgets.splice(ei>=0?ei:S.widgets.length, 0, {id:"exban", w:8, h:4}); }
    if(!S.widgets.some(function(x){ return x.id==="ayat"; })){ var hi=-1; S.widgets.forEach(function(x, i){ if(x.id==="hadith") hi=i; }); S.widgets.splice(hi>=0?hi:S.widgets.length, 0, {id:"ayat", w:8, h:6}); } save("ihsan_settings", S); }
  if(WEB) return S.widgets.filter(function(x){ return !webOffW(x.id); });
  return S.widgets;
}
// 0.5.69 (owner): every ★ favourite (from the ☰ menu, notes, books…) is also a shortcut widget on Home; un-starring removes the widget it added
function favWidgets(){ try{ var fv=(SD.fav||[]).slice(), had=S.favW||[], ch=false;
  fv.forEach(function(id){ var wid="sc-n-"+id;
    if(!WG[wid]){ var lb=sideLb[id], nd=lb?null:sideFind(id); if(lb) WG[wid]=scW("page", lb[0], lb[1], lb[1], "side:"+id); else if(nd) WG[wid]=scW("page", nd.ic, nd.lb, nd.lb, "side:"+id); }
    if(had.indexOf(id)<0){ had.push(id); ch=true; if(WG[wid] && !S.widgets.some(function(x){ return x.id===wid; })) S.widgets.push({id:wid, w:2, h:2}); } });
  had=had.filter(function(id){ if(fv.indexOf(id)>=0) return true; ch=true; S.widgets=S.widgets.filter(function(x){ return x.id!=="sc-n-"+id; }); return false; });
  S.favW=had; if(ch) save("ihsan_settings", S); }catch(e){} }
function wName(id){ var d=WG[id]; return d?(en_()?d.en:d.ms):id; }
// Sizes in WG are in the old 4-column units; the grid is now 8 columns of half-size cells, so x.w/x.h are doubled.
function wClamp(x){ var d=WG[x.id], mw=Math.max(2,d.min[0]*2-(d.sc?0:1)), mh=Math.max(2,d.min[1]*2-(d.sc?0:1));
  x.w=Math.max(mw,Math.min(d.max[0]*2,8,x.w|0||2)); x.h=Math.max(mh,Math.min(d.max[1]*2,x.h|0||2)); return x; }
// --- small widget bodies
function wNextSmall(w,h){ var np=nextPrev(); if(!np.next) return ''; var t=getDay(new Date()), cur=currentPrayer();
  return '<div class="card hnext wns"><div class="mut tiny" style="margin:0">'+T("next")+'</div><div class="hn-name">'+T(np.next.k)+'</div><div class="mut small">'+hm12(np.next.t)+'</div><div class="hn-cd" id="hnCd">'+cdStr(np.next.t-Date.now())+'</div>'+
    (h>=4||w>=3?'<div class="wnsl">'+PR.map(function(k0){ var c=prCell(k0,t); return '<div class="'+(c.k===cur||c.cur?"cur":"")+'"><span>'+prN(c.k)+'</span><b>'+fmt12(c.hm)+'</b></div>'; }).join("")+'</div>':'')+'</div>'; }
function wTimes(w,h){ var t=getDay(new Date()), dh=inDhuha(), cur=dh?"dhuha":currentPrayer(), ks=w>=4||h>=3?ALL:PR;
  // 0.9.1: after sunrise Dhuha is shown and highlighted instead of Subuh (full list drops the past Imsak to make room)
  if(dh) ks = ks===ALL ? ["subuh","syuruk","dhuha","zohor","asar","maghrib","isyak"] : ["dhuha","zohor","asar","maghrib","isyak"];
  var tm=function(k){ return k==="dhuha"?dhuhaHM(t):t[k]; };
  if(w<4) return '<div class="card wns"><div class="wnsl" style="margin:0">'+ks.map(function(k){ return '<div class="'+(k===cur?"cur":"")+'"><span>'+T(k)+'</span><b>'+fmt12(tm(k))+'</b></div>'; }).join("")+'</div></div>';
  return '<div class="card wtimes"><div class="wtg c'+(w>=4?(ks.length>5?7:5):2)+'">'+ks.map(function(k){ var p=fmt12(tm(k)).split(" "); return '<div class="'+(k===cur?"cur":"")+'"><span>'+T(k)+'</span><b>'+p[0]+'</b><small>'+(p[1]||"")+'</small></div>'; }).join("")+'</div></div>'; }
function wClock(w,h){ var d=new Date();
  if(w<3) return '<div class="card wclock sm"><b id="wClk">'+hm12(d.getTime())+'</b><span class="gold">'+hijriStr(hijriOf(d))+'</span>'+(h>=2?'<span>'+esc(d.toLocaleDateString(locTag(),{weekday:"long",day:"numeric",month:"short"}))+'</span>':'')+'</div>';
  return '<div class="card wclock"><b id="wClk">'+hm12(d.getTime())+'</b><span>'+esc(d.toLocaleDateString(locTag(),{weekday:"long",day:"numeric",month:"short"}))+'<br><span class="gold">'+hijriStr(hijriOf(d))+'</span></span></div>'; }
function wAsma(w,h){ var a=ASMAUL_HUSNA[dayIndex(new Date())%ASMAUL_HUSNA.length];
  return '<div class="card wasma" data-wsc="sc-asma"><div class="ar">'+a[0]+'</div><b>'+esc(a[1])+'</b>'+(h>=2?'<div class="mut small">'+esc(en_()?a[3]:a[2])+'</div>':'')+'</div>'; }
function wTasbih(w,h){ var c=S.wTasbih||0;
  return '<div class="card wtasbih" data-wtap="1"><div class="wtn" id="wTb">'+c+'</div>'+(h>=2?'<div class="mut tiny">'+L2x("Ketik untuk kira","Tap to count")+(c?' · '+(Math.floor(c/33))+'×33':'')+'</div>':'')+(c?'<button class="ib wtr" data-wreset="1" aria-label="reset">↺</button>':'')+'</div>'; }
function wUsage(w,h){ usageFlush(); var k=ymd(new Date()), u=useSec(k), p=plogSec(k), y=useSec(ymd(addDays(new Date(),-1)));
  return '<div class="card wuse" data-wsc="sc-cal"><div class="mut tiny">⏱ '+L2x("Hari ini","Today")+'</div><div class="ubig" id="wUse">'+durEn(u)+'</div>'+(h>=2?'<div class="ubar1"><i style="width:'+Math.min(100,Math.round(u*100/Math.max(u,y,1800)))+'%"></i></div><div class="mut tiny">'+L2x("Solat ","Prayer ")+durEn(p)+' · '+L2x("semalam ","yesterday ")+durEn(y)+'</div>':'')+'</div>'; }
function wUsageWeek(w,h){ usageFlush(); var t=new Date(), mon=addDays(t,-((t.getDay()+6)%7)), mx=60, ds=[], tot=0;
  for(var i=0;i<7;i++){ var d=addDays(mon,i), k=ymd(d); ds.push({d:d,k:k,u:useSec(k),p:plogSec(k)}); mx=Math.max(mx,useSec(k)); tot+=useSec(k); }
  return '<div class="card wusew" data-wsc="sc-cal"><div class="row"><span class="mut tiny">📊 '+L2x("Minggu ini","This week")+'</span><b class="small">'+durEn(tot)+'</b></div><div class="uweek">'+ds.map(function(x){ return '<div class="uw'+(x.k===ymd(t)?' sel':'')+'"><div class="uwb"><i class="a" style="height:'+Math.round(x.u*100/mx)+'%"></i><i class="p" style="height:'+Math.round(x.p*100/mx)+'%"></i></div><div class="uwl">'+x.d.toLocaleDateString(locTag(),{weekday:"narrow"})+'</div></div>'; }).join("")+'</div></div>'; }
function wShortcut(id,w,h){ var d=WG[id], nm=String(en_()?d.en:d.ms).split(" › ").pop(), ds=d.d[en_()?1:0];
  var cw=Math.max(1,Math.floor(w)), ch=Math.max(1,Math.floor(h));
  return '<button class="wsc s'+cw+'x'+ch+(w*2<=2&&h*2<=2?'':'')+'" data-wsc="'+id+'"><span class="wi">'+d.ic+'</span><span class="wn">'+esc(nm)+'</span>'+(w>=2&&h>=2&&ds?'<span class="wd">'+esc(ds)+'</span>':'')+'</button>'; }
function runSc(id){
  var d=WG[id]; if(!d) return; var a=d.sc;
  if(!a) return;
  if(a.indexOf("go:")===0){ var v=a.slice(3); if(v==="asma"){ sub.zikir="asma"; v="zikir"; } if(v==="learn") learnPg=null; go(v); return; }
  if(a.indexOf("learn:")===0){ learnPg=a.slice(6); learnFrom=null; go("learn"); return; }
  if(a==="kad"){ openCardMaker(); return; }
  if(a.indexOf("fam:")===0){ famOpen(a.slice(4)); return; }
  if(a.indexOf("side:")===0){ var sn=sideFind(a.slice(5)); if(sn && sn.f) sn.f(); return; }
  if(a.indexOf("x:")===0){ var xa=a.slice(2); withExtra(null, function(){ if(xa==="quiz") IbExtra.openQuiz(xH()); else if(xa==="flight") IbExtra.openFlight(xH()); else if(xa==="ziarah") IbExtra.ziarah(xH()); }); return; }
  if(a==="z:after"){ sub.zikir="after"; go("zikir"); return; }
  if(a==="sirah"){ openSirah(false); return; }
  if(a==="pksk"){ openPksk(); return; }
  if(a==="hajj"){ openHajj(); return; }
  if(a==="umrahdiy"){ openUmrah(); return; }
  if(a==="quran"){ openQuran(false); return; }
  if(a.indexOf("quran:")===0){ var qp=a.split(":"); openQuranAt(+qp[1], +(qp[2]||1)); return; }
  if(a==="tawaf"){ openTawaf(); return; }
  if(a==="prac"){ openPractice(); return; }
  if(a==="qcam"){ openQiblaCam(); return; }
  if(a==="barcode"){ halalAuto="barcode"; go("halal"); return; }
  if(a==="saham"){ openSaham(); return; }
  if(a==="jadual"){ var nd=new Date(); timetableImage(nd.getFullYear(), nd.getMonth()); return; }
  if(a==="player"){ if(window.IbMedia) IbMedia.openPlayer(); return; }
  homeAct(a);
}
function homeAct0(a){
    if(a==="q-rk"){ rk.solat=inDhuha()?"sunat2":currentPrayer(); rk.keep=false; var tg=rkTarget(); if(S.rmode==="camera" && !N.hasPerm("camera")){ go("solat"); return; } startPraying(tg); }
    else if(a==="q-qibla"){ go("qibla"); }
    else if(a==="q-tasbih"){ sub.zikir="tasbih"; go("zikir"); }
    else if(a==="q-mathurat"){ go("mathurat"); }
    else if(a==="q-wirid"){ go("wirid"); }
    else if(a==="q-ramadanm"){ SUB2.cal="statistik"; SUB2.trk="h"; cal.mode="h"; var ev0=nextHijriEvent(9,1,10,1); if(ev0){ cal.hy=ev0.y; cal.hm=9; } go("cal"); }
    else if(a==="q-doa"){ go("doa"); }
    else if(a==="q-amal"){ go("amal"); }
    else if(a==="q-kids"){ go("kids"); }
    else if(a==="q-finder"){ showSheet("📍 "+L2x("Cari berdekatan","Find nearby"), finderBtns()); document.querySelectorAll("#overlay [data-maps]").forEach(function(x){ x.onclick=function(){ openFinder(x.getAttribute("data-maps")); }; }); }
    else if(a==="pz-end"){ S.pauseMode=null; S.pauseUntil=0; saveS(); render(); toast(L2x("Makluman solat disambung","Prayer alerts resumed")); }
    else if(a==="r-t8"||a==="r-t20"){ rk.solat=a==="r-t8"?"t8":"t20"; rk.keep=true; startPraying(rkTarget()); }
    else if(a==="fav-all"){ doaFav=true; doaMine=false; doaQ=""; go("doa"); }
    else if(a==="mydoa"){ doaMine=true; doaFav=false; doaQ=""; go("doa"); }
    else if(a==="g-minus"){ S.ganti.owe=Math.max(0,S.ganti.owe-1); saveS(); render(); }
    else if(a==="g-plus"){ S.ganti.owe++; saveS(); render(); }
    else if(a==="g-done"){ if(S.ganti.owe>0){ S.ganti.owe--; S.ganti.done.push(ymd(new Date())); saveS(); N.vibrate(120); toast(L2x("Alhamdulillah, dicatat","Alhamdulillah, recorded")); render(); } }
}
var hEditing=false;
function wBody(x){
  var d=WG[x.id], h="";
  if(d.sc) return wShortcut(x.id,x.w/2,x.h/2);
  try{ h=d.r(x.w/2,x.h/2)||""; }catch(e){ console.error(e); h=""; }
  return h;
}
// 0.5.27: a wallpaper behind the Home widgets (built-in backgrounds drawn in code, or your own photo); widgets turn to frosted glass over it
var WALLS=[["","🚫","Tiada","None",""],
  ["malam","🌌","Langit malam","Night sky","radial-gradient(1.5px 1.5px at 20px 30px,#fff,transparent),radial-gradient(1px 1px at 90px 110px,#cfe3ff,transparent),radial-gradient(1.5px 1.5px at 160px 60px,#fff6c8,transparent),radial-gradient(120% 80% at 80% 0%,#2b1b6b,#0b0f3a 50%,#04061a)"],
  ["senja","🌅","Senja","Dusk","linear-gradient(180deg,#2a1b5c 0%,#7a2f6b 38%,#e0705a 70%,#f6b26b 100%)"],
  ["hijau","🕌","Geometri hijau","Green geometric","url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cg fill='none' stroke='%23c9a646' stroke-opacity='.22' stroke-width='1.5'%3E%3Cpath d='M40 6l10 24 24 10-24 10-10 24-10-24L6 40l24-10z'/%3E%3Crect x='26' y='26' width='28' height='28' transform='rotate(45 40 40)'/%3E%3C/g%3E%3C/svg%3E\"),linear-gradient(160deg,#0b5d3b,#04261a)"],
  ["laut","🌊","Lautan","Ocean","linear-gradient(180deg,#0f4c75 0%,#1b6ca8 45%,#3fc5f0 100%)"],
  ["padang","🏜️","Padang pasir","Desert","linear-gradient(180deg,#f6d7a7 0%,#e9b872 45%,#c98a4b 75%,#8a5a2b 100%)"],
  ["mawar","🌸","Mawar","Rose","linear-gradient(160deg,#ffd6e0 0%,#f7a8c4 50%,#c86b98 100%)"],
  ["foto","🖼","Foto saya","My photo",""]];
function wallCss(){ if(!S.wall) return ""; if(S.wall==="foto"){ var d=load("ihsan_wall",""); return d?"url("+d+") center/cover no-repeat":""; } var w=WALLS.filter(function(x){ return x[0]===S.wall; })[0]; return w?w[4]:""; }
function wallApply(){ var c=wallCss(), v=document.getElementById("view"); document.body.classList.toggle("wallOn", !!c); if(v){ v.style.background=c||""; if(S.wall==="malam") v.style.backgroundSize="220px 160px,300px 200px,260px 180px,100% 100%"; } }
function wallSheet(){ var ov=showSheet("🖼 "+L2x("Kertas dinding widget","Widget wallpaper"), '<div class="wallG">'+WALLS.map(function(w){ return '<button class="wallT'+((S.wall||"")===w[0]?' on':'')+'" data-wl="'+w[0]+'" style="background:'+(w[0]==="foto"?(load("ihsan_wall","")?"url("+load("ihsan_wall","")+") center/cover":"var(--card2)"):(w[4]||"var(--card2)"))+'"><span>'+w[1]+'</span><b>'+esc(L2x(w[2],w[3]))+'</b></button>'; }).join("")+'</div>');
  ov.querySelectorAll("[data-wl]").forEach(function(b){ b.onclick=function(){ var id=b.getAttribute("data-wl");
    if(id!=="foto"){ S.wall=id; saveS(); closeOverlay(); render(); return; }
    var inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.onchange=function(){ var f=inp.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ var im=new Image(); im.onload=function(){ var k=Math.min(1, 1080/Math.max(im.width, im.height)), c=document.createElement("canvas"); c.width=Math.round(im.width*k); c.height=Math.round(im.height*k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      try{ localStorage.setItem("ihsan_wall", JSON.stringify(c.toDataURL("image/jpeg", 0.8))); S.wall="foto"; saveS(); }catch(e){ toast(L2x("Gambar terlalu besar","The picture is too big")); } closeOverlay(); render(); }; im.src=r.result; }; r.readAsDataURL(f); }; inp.click(); }; }); }
function vHome(el){
  if(S.senior){ vSenior(el); return; }
  setTimeout(wallApply, 0);
  var html='', en=en_(), L=wList();
  if(!S.onboard) html+='<div class="card"><h3>'+(en?"Welcome":"Selamat datang")+'</h3><div class="small mut">'+(en?"Allow location to pick your JAKIM zone and Qibla, and notifications for prayer alerts.":"Benarkan lokasi untuk zon JAKIM dan kiblat, serta notifikasi untuk makluman waktu solat.")+'</div><div class="btns" style="margin-top:10px"><button class="btn" id="obLoc">📍 '+(en?"Location":"Lokasi")+'</button><button class="btn" id="obNot">🔔 '+T("notifs")+'</button><button class="btn alt" id="obDone">OK</button></div></div>';
  html+='<div class="wbar'+(hEditing?' editbar':'')+'">'+(hEditing?
    '<button class="chip on" id="wAdd">＋ '+L2x("Tambah widget","Add widget")+'</button><button class="chip" id="wReset">⟲ '+L2x("Asal","Default")+'</button><button class="chip" id="wWall">🖼 '+L2x("Kertas dinding","Wallpaper")+'</button><button class="chip gold" id="wDone">✓ '+L2x("Siap & kunci","Done & lock")+'</button>'
    :'<span class="mut tiny">'+L2x("Tekan lama mana-mana widget untuk ubah","Long-press any widget to edit")+'</span><button class="chip" id="wEdit">✎ '+L2x("Ubah","Edit")+'</button>')+'</div>';
  if(hEditing) html+='<div class="wbar editbar wabar"><span class="mut tiny">◐ '+L2x("Latar widget","Widget background")+'</span>'+[100,75,50].map(function(a){ return '<button class="chip'+((S.wAlpha||100)===a?' on':'')+'" data-walpha="'+a+'">'+(a===100?L2x("Penuh","Solid"):a+"%")+'</button>'; }).join("")+'</div>';
  html+='<div class="wgrid'+(hEditing?' editing':'')+wAlphaCls()+'" id="wGrid">';
  // 0.14.0: in edit mode the visible widgets keep their places; empty ones are listed after them
  var ORD=L.map(function(x,i){ wClamp(x); return {x:x,i:i,b:wBody(x)}; });
  if(hEditing) ORD=ORD.filter(function(o){ return o.b; }).concat(ORD.filter(function(o){ return !o.b; }));
  ORD.forEach(function(o){ var x=o.x, i=o.i, body=o.b;
    if(!body && !hEditing) return;
    if(!body) body='<div class="card wempty"><b>'+WG[x.id].ic+' '+esc(wName(x.id))+'</b><span class="mut tiny">'+esc(WG[x.id].cond||L2x("Tiada untuk dipapar sekarang","Nothing to show right now"))+'</span></div>';
    html+='<div class="wg'+(WG[x.id].sc?' isSc':'')+'" data-wi="'+i+'" style="grid-column:span '+x.w+';grid-row:span '+x.h+'"><div class="wgc">'+body+'</div>'+
      (hEditing?'<div class="wctl"><button class="wmv" aria-label="move">⠿</button><span class="wsz">'+x.w+'×'+x.h+'</span><button class="wx" data-wx="'+i+'" aria-label="remove">✕</button><span class="wrs" aria-label="resize"></span></div>':'')+'</div>';
  });
  html+='</div>';
  if(!L.length) html+='<div class="card mut small" style="text-align:center">'+L2x("Tiada widget. Tekan ✎ Ubah, kemudian ＋ Tambah widget.","No widgets. Tap ✎ Edit, then ＋ Add widget.")+'</div>';
  if(window.IhsanTour && S.onboard && !hEditing && !S.kidLock) html=IhsanTour.homeCard()+html;
  /* 0.6.3 Phase 2: in Arabic, until the phone's location is known, ask for it so prayer times are calculated for where the person is (not Kuala Lumpur) */
  if(S.ulang==="ar" && S.lat==null && !hEditing && !S.locNudgeX) html='<div class="card locNudge"><b>📍 '+L2x("Waktu solat untuk tempat anda","Prayer times for where you are")+'</b><div class="mut small">'+L2x("Benarkan lokasi supaya waktu solat dikira untuk bandar anda, dengan kaedah negara anda.","Allow location so prayer times are calculated for your city, with your country\'s method.")+'</div><div class="btns"><button class="btn gold g3d" id="locNudgeGo">📍 '+L2x("Guna lokasi saya","Use my location")+'</button><button class="btn alt" id="locNudgeX">'+L2x("Nanti","Later")+'</button></div></div>'+html;
  el.innerHTML=html;
  if(window.IhsanTour) IhsanTour.homeBind(el);
  var lng=el.querySelector("#locNudgeGo"); if(lng) lng.onclick=function(){ S.locMode="auto"; askLocation(false); };
  var lnx=el.querySelector("#locNudgeX"); if(lnx) lnx.onclick=function(){ S.locNudgeX=true; saveS(); render(); };
  if(!S.onboard){ el.querySelector("#obLoc").onclick=function(){ askLocation(true); }; el.querySelector("#obNot").onclick=function(){ N.requestPerm("notif"); }; el.querySelector("#obDone").onclick=function(){ S.onboard=true; saveS(); render(); }; }
  var q=function(id){ return el.querySelector(id); };
  if(q("#wEdit")) q("#wEdit").onclick=function(){ hEditing=true; render(); };
  if(q("#wWall")) q("#wWall").onclick=wallSheet;
  if(q("#wDone")) q("#wDone").onclick=function(){ hEditing=false; saveS(); render(); toast(L2x("Susunan dikunci","Layout locked")); };
  if(q("#wAdd")) q("#wAdd").onclick=wAddSheet;
  el.querySelectorAll("[data-walpha]").forEach(function(b){ b.onclick=function(){ S.wAlpha=+b.getAttribute("data-walpha"); saveS(); wPushLast=""; pushWidgets(); render(); }; });
  el.querySelectorAll("#wGrid [data-maps]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); openFinder(b.getAttribute("data-maps")); }; });
  pushWidgets(); document.getElementById("view").classList.toggle("hwall", (S.wAlpha||100)<100);
  if(q("#wReset")) q("#wReset").onclick=function(){ if(!confirm(L2x("Kembalikan susunan asal?","Restore the default layout?"))) return; S.widgets=null; S.homeCards=null; wList(); saveS(); render(); };
  var fr=el.querySelector("#hFastRem"); if(fr) fr.onchange=function(){ S.fastRem=this.checked; saveS(); toast(S.fastRem?L2x("Peringatan puasa sunat dihidupkan","Sunnah fast reminders on"):L2x("Peringatan puasa sunat dimatikan","Sunnah fast reminders off")); };
  var ri=el.querySelector("#rImsak"); if(ri) ri.onchange=function(){ S.imsakOn=this.checked; saveS(); };
  var grid=q("#wGrid");
  el.onclick=function(e){
    if(hEditing){ var x=e.target.closest("[data-wx]"); if(x){ e.stopPropagation(); S.widgets.splice(+x.getAttribute("data-wx"),1); saveS(); render(); } return; }
    var r=e.target.closest("[data-wreset]"); if(r){ e.stopPropagation(); S.wTasbih=0; save("ihsan_settings",S); render(); return; }
    var tp=e.target.closest("[data-wtap]"); if(tp){ S.wTasbih=(S.wTasbih||0)+1; save("ihsan_settings",S); N.vibrate(S.wTasbih%33===0?400:25); var n=el.querySelector("#wTb"); if(n) n.textContent=S.wTasbih; if(S.wTasbih===1||S.wTasbih%33===0) render(); return; }
    var s=e.target.closest("[data-wsc]"); if(s){ runSc(s.getAttribute("data-wsc")); return; }
    var b=e.target.closest("[data-act]"); if(!b) return; homeAct(b.getAttribute("data-act"));
  };
  // long-press anywhere on a widget enters edit mode
  if(!hEditing){ var lp=null, sx=0, sy=0;
    grid.addEventListener("pointerdown", function(e){ if(!e.target.closest(".wg")) return; sx=e.clientX; sy=e.clientY; clearTimeout(lp); lp=setTimeout(function(){ N.vibrate(40); hEditing=true; render(); },650); });
    grid.addEventListener("pointermove", function(e){ if(lp && Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)>10){ clearTimeout(lp); lp=null; } });
    ["pointerup","pointercancel","pointerleave"].forEach(function(t){ grid.addEventListener(t, function(){ clearTimeout(lp); lp=null; }); });
  } else wDrag(grid);
  timers.push(setInterval(function(){
    var c=document.getElementById("hnCd"); if(c){ var np=nextPrev(); if(np.next) c.textContent=cdStr(np.next.t-Date.now()); }
    var t=getDay(new Date()), now=Date.now(), s=document.getElementById("rSahur"), f=document.getElementById("rIftar");
    if(s){ var im=at(ymd(new Date()),t.imsak).getTime(); s.textContent=now<im?"−"+cdStr(im-now):"✓"; }
    if(f){ var mg=at(ymd(new Date()),t.maghrib).getTime(); f.textContent=now<mg?"−"+cdStr(mg-now):"✓"; }
    var ck=document.getElementById("wClk"); if(ck) ck.textContent=hm12(now);
    var wu=document.getElementById("wUse"); if(wu && now%15000<1000){ usageFlush(); wu.textContent=durEn(useSec(ymd(new Date()))); }
    if(window.IbMedia) IbMedia.tickWidget();
  },1000));
}
// Move (top-left grip) and resize (bottom-right grip) while editing. Everything snaps to the 4-column grid.
function wDrag(grid){
  var GAP=6;
  function cell(){ var w=grid.clientWidth; return {cw:(w-GAP*7)/8+GAP, rh:parseFloat(getComputedStyle(grid).gridAutoRows)+GAP}; }
  grid.querySelectorAll(".wg").forEach(function(g){
    var i=+g.getAttribute("data-wi"), x=S.widgets[i], rs=g.querySelector(".wrs"), mv=g.querySelector(".wmv"), lab=g.querySelector(".wsz");
    rs.addEventListener("pointerdown", function(e){ e.preventDefault(); e.stopPropagation(); rs.setPointerCapture(e.pointerId);
      var c=cell(), w0=x.w, h0=x.h, x0=e.clientX, y0=e.clientY; g.classList.add("sizing");
      var mvF=function(ev){ var nw=Math.round(w0+(ev.clientX-x0)/c.cw), nh=Math.round(h0+(ev.clientY-y0)/c.rh); var o={id:x.id,w:nw,h:nh}; wClamp(o);
        if(o.w!==x.w||o.h!==x.h){ x.w=o.w; x.h=o.h; g.style.gridColumn="span "+x.w; g.style.gridRow="span "+x.h; lab.textContent=x.w+"×"+x.h; N.vibrate(10); } };
      var upF=function(){ rs.removeEventListener("pointermove",mvF); rs.removeEventListener("pointerup",upF); rs.removeEventListener("pointercancel",upF); g.classList.remove("sizing"); saveS(); render(); };
      rs.addEventListener("pointermove",mvF); rs.addEventListener("pointerup",upF); rs.addEventListener("pointercancel",upF);
    });
    mv.addEventListener("pointerdown", function(e){ e.preventDefault(); e.stopPropagation(); g.classList.add("moving");
      var vw=document.getElementById("view"), lastY=e.clientY, scr=setInterval(function(){ var r=vw.getBoundingClientRect(); if(lastY<r.top+60) vw.scrollTop-=12; else if(lastY>r.bottom-140) vw.scrollTop+=12; },30);
      var mvF=function(ev){ lastY=ev.clientY; var t=document.elementFromPoint(ev.clientX, ev.clientY);
        var tg=t&&t.closest(".wg"); if(!tg||tg===g||tg.parentNode!==grid) return;
        var kids=[].slice.call(grid.children), a=kids.indexOf(g), b=kids.indexOf(tg);
        grid.insertBefore(g, a<b?tg.nextSibling:tg); N.vibrate(10); };
      var upF=function(){ clearInterval(scr); window.removeEventListener("pointermove",mvF); window.removeEventListener("pointerup",upF); window.removeEventListener("pointercancel",upF); g.classList.remove("moving");
        var order=[].slice.call(grid.children).map(function(n){ return S.widgets[+n.getAttribute("data-wi")]; });
        // keep hidden (empty) widgets in their old slots at the end of the visible order
        S.widgets.forEach(function(w){ if(order.indexOf(w)<0) order.push(w); });
        S.widgets=order; saveS(); render(); };
      window.addEventListener("pointermove",mvF); window.addEventListener("pointerup",upF); window.addEventListener("pointercancel",upF);
    });
  });
}
function wAddSheet(){
  var en=en_(), qy="", kf=S.wKind||"all";   // 0.6.67 (owner): show widgets only, shortcuts only, or both
  function body(){
    var have={}; S.widgets.forEach(function(x){ have[x.id]=1; });
    var ids=Object.keys(WG).filter(function(id){ return (!qy || wName(id).toLowerCase().indexOf(qy)>=0) && (kf==="all" || (kf==="sc")===!!WG[id].sc); });
    return '<input type="search" id="waQ" placeholder="🔍 '+L2x("Cari widget","Search widgets")+'" value="'+esc(qy)+'" style="width:100%;margin-bottom:6px">'+
      '<div class="rseg wakind">'+[["wg","🧩 Widget"],["sc","⚡ "+L2x("Pintasan","Shortcut")],["all","✦ "+L2x("Kedua-dua","Both")]].map(function(k){ return '<button class="chip'+(kf===k[0]?' on':'')+'" data-wkind="'+k[0]+'">'+k[1]+'</button>'; }).join("")+'</div>'+
      '<div class="chips wacats">'+WCAT.map(function(c){ return '<button class="chip" data-wcat="'+c[0]+'">'+c[1]+' '+esc(en?c[3]:c[2])+'</button>'; }).join("")+'</div>'+
      WCAT.map(function(c){ var l=ids.filter(function(id){ return WG[id].cat===c[0]; }); if(!l.length) return '';
        return '<div class="snl wahd" id="wac_'+c[0]+'">'+c[1]+' '+esc(en?c[3]:c[2])+' <span class="mut tiny">'+l.length+'</span></div>'+l.map(function(id){ var d=WG[id];
          return '<div class="wai"><span class="wi">'+d.ic+'</span><span class="wan"><b>'+esc(wName(id))+'</b><span class="mut tiny">'+(d.sc?L2x("Pintasan","Shortcut"):"Widget")+' · '+d.def[0]+'×'+d.def[1]+(d.cond?' · '+esc(d.cond):'')+'</span></span>'+
            (have[id]?'<span class="badge">✓</span>':'<button class="chip on" data-wadd="'+id+'">＋</button>')+'</div>'; }).join(""); }).join("");
  }
  var ov=showSheet("＋ "+L2x("Tambah widget","Add widget"), body(), function(){ render(); });
  function bind(){ var b=ov.querySelector(".shb");
    b.querySelectorAll("[data-wadd]").forEach(function(x){ x.onclick=function(){ var id=x.getAttribute("data-wadd"), d=WG[id]; S.widgets.push({id:id,w:d.def[0]*2,h:d.def[1]*2}); saveS(); N.vibrate(20); toast("＋ "+wName(id)); var st=b.scrollTop; b.innerHTML=body(); bind(); b.scrollTop=st; }; });
    b.querySelectorAll("[data-wkind]").forEach(function(x){ x.onclick=function(){ kf=x.getAttribute("data-wkind"); S.wKind=kf; saveS(); b.innerHTML=body(); bind(); }; });
    b.querySelectorAll("[data-wcat]").forEach(function(x){ x.onclick=function(){ var h=b.querySelector("#wac_"+x.getAttribute("data-wcat")); if(h) b.scrollTop=h.offsetTop-b.offsetTop-6; }; });
    var qi=b.querySelector("#waQ"); qi.oninput=function(){ qy=qi.value.trim().toLowerCase(); b.innerHTML=body(); bind(); var n=b.querySelector("#waQ"); n.focus(); n.setSelectionRange(n.value.length,n.value.length); };
  }
  bind();
}

// ---------- finder & links ----------
function finderBtns(){ return '<div class="btns"><button class="btn" data-maps="masjid">🕌 '+T("masjid")+'</button><button class="btn" data-maps="surau">'+T("surau")+'</button><button class="btn" data-maps="restoran halal">🍛 '+L2x("Makanan halal","Halal food")+'</button><button class="btn" data-maps="surau R&R">🛣 '+L2x("Surau R&R lebuh raya","Highway R&R surau")+'</button><button class="btn" data-maps="musolla">🏬 '+L2x("Musolla (pusat beli-belah)","Musolla (malls)")+'</button></div><div class="mut small" style="margin-top:8px">'+(en_()?"Opens Google Maps around your location.":"Membuka Google Maps di sekitar lokasi anda.")+'</div>'; }
function finderCard(){ return '<div class="card"><h3>📍 '+L2x("Cari berdekatan","Find nearby")+'</h3>'+finderBtns()+'</div>'; }
function learnLinksCard(){ return '<div class="card"><h3>📚 '+T("learn")+'</h3><div class="btns"><button class="btn alt" data-go="learn">📚 '+L2x("Panduan & kisah","Guides & stories")+'</button><button class="btn alt" data-go="kids">🧒 '+T("kids")+'</button><button class="btn alt" data-go="asma">✨ '+T("asma")+'</button></div></div>'; }

// ---------- MORE: new settings ----------
function chipSet(attr, cur, opts){ return '<span class="chips cs" style="margin:0">'+opts.map(function(o){ return '<button class="chip '+(String(cur)===String(o[0])?"on":"")+'" '+attr+'="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</span>'; }
function moreNewCards(){
  var en=en_(), h='';
  if(S.alertStyle==="azan") S.alertStyle="sound";
  h+='<div class="card cmp"><h3>🔔 '+L2x("Makluman & peringatan","Alerts & reminders")+'</h3>'+
   '<div class="set"><span>'+L2x("Gaya makluman waktu","Prayer alert style")+'</span>'+chipSet("data-as2",S.alertStyle,[["sound",L2x("Bunyi","Sound")],["vibrate",L2x("Getar sahaja","Vibrate only")]])+'</div>';
  h+='<div class="set"><span>'+L2x("Peringatan sebelum waktu tamat","Reminder before the time ends")+'</span>'+chipSet("data-endm",S.endMin,[[0,L2x("Tutup","Off")],[10,"10m"],[15,"15m"],[20,"20m"],[30,"30m"]])+'</div>'+
   '<div class="set"><span>'+L2x("Penggera imsak","Imsak alarm")+'</span>'+sw("sImsak",S.imsakOn)+'</div>'+
   (S.imsakOn?'<div class="set"><span class="mut">'+L2x("Imsak bulan Ramadan sahaja","Imsak in Ramadan only")+'</span>'+sw("sImsakR",S.imsakRamadan)+'</div>':'')+
   '<div class="set"><span>'+L2x("Peringatan syuruk (Subuh tamat)","Syuruk reminder (Subuh ends)")+'</span>'+sw("sSyuruk",S.syurukOn)+'</div>'+
   '<div class="set"><span>'+L2x("Penggera Tahajjud (sepertiga malam terakhir)","Tahajjud alarm (last third of the night)")+'</span>'+sw("sTahajjud",S.tahajjud)+'</div>'+
   '<div class="set"><span>'+L2x("Peringatan Al-Ma'thurat pagi & petang","Al-Ma'thurat morning & evening reminder")+'</span>'+sw("sMath",S.mathAlarm)+'</div>'+
   '<div class="set"><span>'+L2x("Peringatan puasa sunat (malam sebelum, 9 PM)","Sunnah fast reminder (night before, 9 PM)")+'</span>'+sw("sFast",S.fastRem)+'</div>'+
   (S.fastRem?'<div class="set"><span class="mut">'+L2x("Jenis","Types")+'</span><span class="chips cs" style="margin:0"><button class="chip '+(S.fastRemT.mk?"on":"")+'" data-ft="mk">'+L2x("Isnin & Khamis","Mon & Thu")+'</button><button class="chip '+(S.fastRemT.bidh?"on":"")+'" data-ft="bidh">Ayyamul Bidh</button><button class="chip '+(S.fastRemT.special?"on":"")+'" data-ft="special">'+L2x("Arafah, Asyura, Syawal","Arafah, Ashura, Syawal")+'</button></span></div>':'')+
   '<div class="set"><span>'+L2x("Papar waktu seterusnya di skrin kunci","Show next prayer on the lock screen")+'</span>'+sw("sLock",S.lockShow)+'</div></div>';
  // adjustments
  h+='<div class="card cmp"><h3>⏱ '+L2x("Pelarasan waktu (minit)","Time adjustment (minutes)")+'</h3><div class="mut tiny" style="margin-bottom:4px">'+L2x("Laraskan supaya sama dengan masjid tempatan anda. Notifikasi dan widget ikut pelarasan ini.","Adjust to match your local masjid. Alerts and the widget follow these.")+'</div>'+
   PR.map(function(k){ var v=(S.adj&&S.adj[k])||0; return '<div class="set"><span>'+T(k)+'</span><span class="row"><button class="chip" data-adj="'+k+'" data-d="-1">−</button><b style="min-width:30px;text-align:center">'+(v>0?"+":"")+v+'</b><button class="chip" data-adj="'+k+'" data-d="1">+</button></span></div>'; }).join("")+
   (adjAny()?'<button class="btn alt full" id="adjReset">⟲ '+L2x("Set semula semua","Reset all")+'</button>':'')+'</div>';
  // location & travel
  var homeTxt=S.home?(S.lat!=null?Math.round(distKm(S.home.lat,S.home.lon,S.lat,S.lon))+" km "+L2x("dari rumah","from home"):L2x("ditetapkan","set")):L2x("belum ditetapkan","not set");
  h+='<div class="card cmp"><h3>🌍 '+L2x("Lokasi & perjalanan","Location & travel")+'</h3>'+
   '<div class="set"><span>'+L2x("Sumber waktu","Prayer time source")+'</span>'+chipSet("data-lm",S.locMode,[["auto","Auto"],["my","Malaysia (JAKIM)"],["overseas",L2x("Luar negara","Overseas")]])+'</div>'+
   '<div class="mut tiny" style="margin:-2px 0 6px">'+(overseasNow()?L2x("Sekarang: waktu dikira untuk lokasi anda (zon waktu telefon).","Now: times are calculated for your location (phone time zone)."):L2x("Sekarang: waktu JAKIM bagi zon ","Now: JAKIM times for zone ")+esc(S.zone))+(S.locMode==="overseas"&&S.lat==null?' · '+L2x("perlukan lokasi","needs location"):'')+'</div>'+
   ((overseasNow()||S.locMode==="overseas")?'<div class="set"><span>'+L2x("Kaedah kiraan","Calculation method")+'</span><select id="sMeth" style="max-width:60%;padding:6px"><option value="auto" '+(!S.calcMethodSet?"selected":"")+'>'+L2x("Auto (ikut negara)","Auto (by country)")+' · '+methName(S.calcMethod)+'</option>'+Object.keys(METHODS).map(function(k){ return '<option value="'+k+'" '+(S.calcMethodSet&&S.calcMethod===k?"selected":"")+'>'+methName(k)+'</option>'; }).join("")+'</select></div>'+
     '<div class="set"><span>'+L2x("Latitud tinggi (≥ 45°)","High latitude (≥ 45°)")+'</span><select id="sHlm" style="max-width:60%;padding:6px">'+[["angle",L2x("Ikut sudut (disyorkan)","Angle-based (recommended)")],["mid",L2x("Tengah malam","Middle of the night")],["seventh",L2x("Satu pertujuh malam","One seventh of the night")],["none",L2x("Tiada","None")]].map(function(x){ return '<option value="'+x[0]+'" '+((S.hlm||"angle")===x[0]?"selected":"")+'>'+x[1]+'</option>'; }).join("")+'</select></div>':'')+
   '<div class="set"><span>'+L2x("Rumah: ","Home: ")+'<b class="mut">'+homeTxt+'</b></span><button class="chip" id="sHome">📍 '+L2x("Tetapkan di sini","Set here")+'</button></div>'+
   '<div class="set"><span>'+L2x("Kesan musafir automatik (≥ 81 km)","Detect travel automatically (≥ 81 km)")+'</span>'+sw("sMusA",S.musafirAuto)+'</div>'+
   '<div class="set"><span>'+L2x("Saya sedang musafir (manual)","I am travelling (manual)")+'</span>'+sw("sMusOn",S.musafirOn)+'</div></div>';
  // offline data
  var y=new Date().getFullYear(), st=function(yy){ var c=load(cacheKey(S.zone,yy),null); return c&&c.days?Object.keys(c.days).length+L2x(" hari"," days")+" · "+new Date(c.fetched).toLocaleDateString(locTag(),{day:"numeric",month:"short"}):L2x("belum dimuat turun","not downloaded"); };
  h+='<div class="card cmp"><h3>💾 '+L2x("Waktu solat luar talian","Offline prayer times")+'</h3><div class="mut tiny" style="margin-bottom:4px">'+L2x("Waktu JAKIM disimpan setahun penuh dalam telefon, jadi ia berfungsi tanpa internet.","JAKIM times are kept for the whole year on the phone, so they work without internet.")+'</div>'+
   '<div class="set"><span>'+esc(S.zone)+' '+y+'</span><b class="mut small">'+st(y)+'</b></div><div class="set"><span>'+esc(S.zone)+' '+(y+1)+'</span><b class="mut small">'+st(y+1)+'</b></div>'+
   '<div class="btns"><button class="chip" id="offNow">↻ '+y+'</button><button class="chip" id="offNext">⬇ '+(y+1)+'</button></div></div>';
  // uzur
  h+='<div class="card cmp"><h3>🌸 '+L2x("Mod uzur","Uzur mode")+'</h3><div class="mut tiny" style="margin-bottom:6px">'+L2x("Haid/nifas menjeda makluman solat dan menunjukkan amalan yang masih boleh dibuat. Sakit menunjukkan panduan solat orang sakit (makluman tetap berjalan).","Haid/nifas pauses prayer alerts and shows what you can still do. Sick shows how to pray when ill (alerts keep running).")+'</div>'+
   '<div class="set"><span>'+L2x("Haid / nifas","Haid / nifas")+'</span>'+chipSet("data-hd",S.pauseMode==="haid"?"on":"",[[7,"7 "+L2x("hari","days")],[10,"10"],[15,"15"]])+'</div>'+
   '<div class="btns"><button class="chip '+(S.pauseMode==="sakit"?"on":"")+'" id="pzSick">🏥 '+L2x("Sakit","Sick")+'</button>'+(S.pauseMode?'<button class="chip" id="pzEnd">✓ '+L2x("Tamatkan mod","End mode")+'</button>':'')+'</div>'+
   (S.pauseMode==="haid"?'<div class="mut small" style="margin-top:6px">'+L2x("Dijeda sehingga ","Paused until ")+new Date(S.pauseUntil).toLocaleDateString(locTag(),{weekday:"short",day:"numeric",month:"short"})+'</div>':'')+'</div>';
  // display
  h+='<div class="card cmp"><h3>🖥 '+L2x("Paparan","Display")+'</h3>'+
   '<div class="set"><span>'+L2x("Saiz teks","Text size")+'</span>'+chipSet("data-tz",S.textZoom,[[75,"A−−"],[85,"A−"],[100,"A"],[115,"A+"],[130,"A++"],[150,"A+++"]]).replace('class="chips cs"','class="chips cs noDrop"')+'</div>'+
   '<div class="set"><span>'+L2x("Tema malam automatik (10 PM hingga syuruk)","Automatic night theme (10 PM to sunrise)")+'</span>'+sw("sNight",S.autoNight)+'</div>'+
   '<div class="set"><span>'+L2x("Sentiasa papar kad Ramadan","Always show the Ramadan card")+'</span>'+sw("sRam",S.ramadanForce)+'</div>'+
   '<div class="set"><span>👓 '+L2x("Mod warga emas","Senior mode")+'<div class="mut tiny">'+L2x("Teks besar, warna terang dan empat butang besar di Utama","Large text, strong contrast and four big buttons on Home")+'</div></span>'+sw("sSenior",S.senior)+'</div></div>';
  // backup
  h+='<div class="card cmp"><h3>🗄 '+L2x("Sandaran","Backup")+'</h3><div class="mut tiny" style="margin-bottom:6px">'+L2x("Simpan tetapan, kiraan zikir, kegemaran dan puasa ganti ke fail, kemudian pulihkan di telefon baharu.","Save settings, zikir counts, favourites and make-up fasts to a file, then restore on a new phone.")+'</div><div class="btns"><button class="btn alt" id="bkSave">⬇ '+L2x("Simpan sandaran","Save backup")+'</button><button class="btn alt" id="bkOpen">⬆ '+L2x("Pulihkan","Restore")+'</button></div></div>';
  return h;
}
function bindMoreNew(el){
  var q=function(s){ return el.querySelector(s); }, on2=function(id,fn){ var x=q("#"+id); if(x) x.onchange=function(){ fn(this.checked); saveS(); render(); }; };
  el.querySelectorAll("[data-as2]").forEach(function(b){ b.onclick=function(){ S.alertStyle=b.getAttribute("data-as2"); saveS(); render(); }; });
  el.querySelectorAll("[data-endm]").forEach(function(b){ b.onclick=function(){ S.endMin=+b.getAttribute("data-endm"); saveS(); render(); }; });
  on2("sImsak",function(v){ S.imsakOn=v; }); on2("sImsakR",function(v){ S.imsakRamadan=v; }); on2("sSyuruk",function(v){ S.syurukOn=v; });
  on2("sTahajjud",function(v){ S.tahajjud=v; }); on2("sMath",function(v){ S.mathAlarm=v; }); on2("sFast",function(v){ S.fastRem=v; }); on2("sLock",function(v){ S.lockShow=v; });
  el.querySelectorAll("[data-ft]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-ft"); S.fastRemT[k]=!S.fastRemT[k]; saveS(); render(); }; });
  el.querySelectorAll("[data-adj]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-adj"); S.adj=S.adj||{}; S.adj[k]=Math.max(-15,Math.min(15,(S.adj[k]||0)+(+b.getAttribute("data-d")))); saveS(); render(); }; });
  var ar=q("#adjReset"); if(ar) ar.onclick=function(){ S.adj={subuh:0,zohor:0,asar:0,maghrib:0,isyak:0}; saveS(); render(); };
  el.querySelectorAll("[data-lm]").forEach(function(b){ b.onclick=function(){ S.locMode=b.getAttribute("data-lm"); saveS(); if(S.locMode==="overseas" && S.lat==null) askLocation(false); render(); }; });
  var sm=q("#sMeth"); if(sm) sm.onchange=function(){ if(this.value==="auto"){ S.calcMethodSet=false; methodAuto(); } else { S.calcMethod=this.value; S.calcMethodSet=true; } saveS(); render(); };
  var shl=q("#sHlm"); if(shl) shl.onchange=function(){ S.hlm=this.value; saveS(); render(); };
  q("#sHome").onclick=function(){ var hl=function(r){ off("location",hl); if(r.error){ toast(L2x("Lokasi tidak tersedia","Location unavailable")); return; } S.home={lat:r.lat,lon:r.lon}; S.lat=r.lat; S.lon=r.lon; saveS(); toast(L2x("Lokasi rumah disimpan","Home location saved")); render(); };
    if(N.hasPerm("location")){ on("location",hl); N.getLocation(); } else { var hp=function(p){ if(p.which!=="location") return; off("perm",hp); if(p.granted){ on("location",hl); N.getLocation(); } }; on("perm",hp); N.requestPerm("location"); } };
  on2("sMusA",function(v){ S.musafirAuto=v; }); on2("sMusOn",function(v){ S.musafirOn=v; });
  q("#offNow").onclick=function(){ ensureData(true); };
  q("#offNext").onclick=function(){ var y=new Date().getFullYear()+1; fetchJakim(S.zone, y, function(ok){ toast(ok?L2x("Waktu "+y+" dimuat turun","Times for "+y+" downloaded"):L2x("JAKIM belum menerbitkan "+y+" atau tiada internet","JAKIM has not published "+y+" yet, or no internet")); if(ok){ pushSchedule(); render(); } }); };
  el.querySelectorAll("[data-hd]").forEach(function(b){ b.onclick=function(){ S.pauseMode="haid"; S.pauseUntil=Date.now()+(+b.getAttribute("data-hd"))*864e5; saveS(); toast(L2x("Makluman solat dijeda","Prayer alerts paused")); render(); }; });
  q("#pzSick").onclick=function(){ S.pauseMode=S.pauseMode==="sakit"?null:"sakit"; S.pauseUntil=0; saveS(); render(); };
  var pe=q("#pzEnd"); if(pe) pe.onclick=function(){ S.pauseMode=null; S.pauseUntil=0; saveS(); render(); };
  el.querySelectorAll("[data-tz]").forEach(function(b){ b.onclick=function(){ S.textZoom=+b.getAttribute("data-tz"); saveS(); applyZoom(); render(); }; });
  // 0.5.69 (owner): text size is only − and + (5% steps, 80% to 160%)
  el.querySelectorAll("[data-tzd]").forEach(function(b){ b.onclick=function(){ S.textZoom=Math.max(75, Math.min(160, (S.textZoom||100)+(+b.getAttribute("data-tzd")))); saveS(); applyZoom(); var v=b.parentNode.querySelector("b"); if(v) v.textContent=S.textZoom+"%"; }; });
  on2("sRumi",function(v){ S.showRumi=v; }); on2("sNight",function(v){ S.autoNight=v; applyTheme(); }); on2("sRam",function(v){ S.ramadanForce=v; });
  if(q("#vList")) q("#vList").onclick=function(){ var box=q("#vBox"); box.innerHTML='<div class="mut small">…</div>';
    var hv=function(list){ off("voices",hv); if(!list.length){ box.innerHTML='<div class="mut small" style="padding:4px 0">'+L2x("Tiada suara Arab dipasang. Buka Tetapan telefon → Teks ke pertuturan → Enjin Google → Pasang data suara → Arab.","No Arabic voice installed. Open phone Settings → Text-to-speech → Google engine → Install voice data → Arabic.")+'</div>'; return; }
      box.innerHTML='<div class="chips cs" style="padding:4px 0 8px;justify-content:flex-start">'+list.map(function(v,i){ return '<button class="chip '+(S.voice===v.n?"on":"")+'" data-vn="'+esc(v.n)+'">'+L2x("Suara ","Voice ")+(i+1)+(v.male?" ♂":"")+(v.net?" ☁":"")+'</button>'; }).join("")+'</div><div class="mut tiny">♂ = '+L2x("dikesan sebagai lelaki (anggaran nama)","detected as male (guessed from its name)")+' · ☁ = '+L2x("perlukan internet","needs internet")+'. '+L2x("Ketik untuk dengar dan pilih.","Tap to listen and choose.")+'</div>';
      box.querySelectorAll("[data-vn]").forEach(function(b){ b.onclick=function(){ S.voice=b.getAttribute("data-vn"); saveS(); if(N.setVoice) N.setVoice(S.voice, S.pitch||0.8); box.querySelectorAll("[data-vn]").forEach(function(x){ x.classList.toggle("on", x===b); }); speakAr("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"); }; }); };
    on("voices",hv);
    if(window.Native && N.getVoices) N.getVoices();
    else { var vs=[]; try{ vs=speechSynthesis.getVoices().filter(function(v){ return /^ar/i.test(v.lang); }).map(function(v){ return {n:v.name, male:/male/i.test(v.name)&&!/female/i.test(v.name), net:!v.localService}; }); }catch(e){} hv(vs); } };
  el.querySelectorAll("[data-pitch]").forEach(function(b){ b.onclick=function(){ S.pitch=+b.getAttribute("data-pitch"); saveS(); if(N.setVoice) N.setVoice(S.voice||"", S.pitch); render(); speakAr("سُبْحَانَ اللَّهِ"); }; });
  q("#bkSave").onclick=makeBackup; q("#bkOpen").onclick=openBackup;
}

// ---------- SUNAT hub: Zikir / Doa / Ma'thurat / Amal ----------
var SUBNAV=[["zikir","📿","Zikir","Zikir"],["doa","🤲","Doa","Doa"],["mathurat","📖","Ma'thurat","Ma'thurat"],["amal","🌙","Amal","Amal"]];
function vSunatHub(el){
  var old=document.getElementById("subnav"); if(old) old.remove();
  var f={zikir:vZikir, doa:vDoa, mathurat:vMathurat, amal:vSunat}[sunPage]||vZikir;
  var sn=document.createElement("div"); sn.id="subnav";
  sn.innerHTML=SUBNAV.map(function(x){ return '<button class="'+(sunPage===x[0]?"on":"")+'" data-sp="'+x[0]+'"><span>'+x[1]+'</span>'+(en_()?x[3]:x[2])+'</button>'; }).join("");
  document.getElementById("app").appendChild(sn);
  sn.style.bottom=navH()+"px";
  sn.querySelectorAll("[data-sp]").forEach(function(b){ b.onclick=function(){ go(b.getAttribute("data-sp")); }; });
  el.classList.add("hasSub");
  f(el);
}
// ---------- LEARN ----------
var LEARN=[["wudhu","💧","Cara berwuduk","How to make wudhu"],["x_mandi","🚿","Mandi wajib","Obligatory bath (ghusl)"],["x_tayammum","🏜","Tayammum","Tayammum"],["x_istinja","🚽","Istinjak & najis","Istinja' & najis"],["solat","🧎","Cara solat","How to pray"],["bacaan","📜","Bacaan dalam solat","Readings in solat"],["g_istikharah","🧭","Solat Istikharah","Istikharah prayer"],["g_hajat","🤲","Solat Hajat","Hajat prayer"],["x_jenazah","🕊","Solat jenazah","Funeral prayer"],["x_raya","🌙","Solat Hari Raya","Eid prayer"],["x_gerhana","🌘","Solat gerhana","Eclipse prayer"],["sakit","🏥","Solat ketika sakit","Praying when sick"],["musafir","🚗","Solat musafir","Praying when travelling"],["haid","🌸","Ketika haid & nifas","During haid & nifas"],["nabi","🌿","Kisah 25 Nabi","The 25 Prophets"],["n40","📜","40 Hadis Nawawi","40 Hadith Nawawi"],["sahabat","🏅","Kisah Sahabat","Companion stories"],["hijaiyah","🔤","Huruf Hijaiyah","Arabic letters"],["qwords","📖","Maksud al-Quran","Meanings of Quran"],["askai","💬","Tanya AI","Ask AI"],["glosari","📖","Glosari istilah","Glossary"]];
function poseSvg(p){
  var L=function(a,b,c,d){ return '<line x1="'+a+'" y1="'+b+'" x2="'+c+'" y2="'+d+'"/>'; }, H=function(x,y){ return '<circle cx="'+x+'" cy="'+y+'" r="5" fill="currentColor"/>'; }, g='';
  if(p==="stand") g=H(32,9)+L(32,15,32,38)+L(32,38,27,58)+L(32,38,37,58)+L(32,19,26,36)+L(32,19,38,36);
  else if(p==="takbir") g=H(32,9)+L(32,15,32,38)+L(32,38,27,58)+L(32,38,37,58)+L(32,19,24,22)+L(24,22,25,11)+L(32,19,40,22)+L(40,22,39,11);
  else if(p==="qiyam") g=H(32,9)+L(32,15,32,38)+L(32,38,27,58)+L(32,38,37,58)+L(32,19,26,28)+L(26,28,36,28);
  else if(p==="rukuk") g=H(14,30)+L(19,31,42,31)+L(42,31,42,58)+L(23,31,40,44);
  else if(p==="sujud") g=H(12,53)+L(17,51,40,40)+L(40,40,44,56)+L(44,56,56,57)+L(22,49,17,58);
  else if(p==="sit") g=H(36,16)+L(36,22,36,46)+L(36,46,20,52)+L(20,56,46,57)+L(36,28,24,46);
  else if(p==="salam") g='<circle cx="40" cy="16" r="5" fill="currentColor"/>'+L(36,22,36,46)+L(36,46,20,52)+L(20,56,46,57)+L(36,28,24,46)+'<path d="M48 10 l6 4 l-6 4" fill="none"/>';
  return '<svg class="pose" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round">'+g+'<line x1="4" y1="60" x2="60" y2="60" stroke-width="1.5" opacity=".4"/></svg>';
}
function arBlock(ar, ms, en, src){ return '<div class="ar" style="font-size:calc(var(--arsize) - 2px);line-height:1.9">'+ar+'</div>'+rumiDiv(ar)+'<div class="tr">'+esc(L2x(ms,en))+'</div>'+(src?'<div class="src">'+srcHtml(src)+'</div>':'')+'<div class="tools">'+sayBtn(ar)+shareBtn({ar:ar,text:L2x(ms,en),src:src||""})+'</div>'; }
// ---------- HALAL CHECKER (lazy-loaded; no offline OCR since 0.39.0, photos go to the online AI) ----------
var halalReady=false, halalAuto=null;
function vHalal(el){
  var start=function(){ try{ var au=halalAuto; halalAuto=null; HalalView(el,{S:S, N:N, xrem:xrem, save:save, load:load, toast:toast, esc:esc, L2x:L2x, on:on, off:off, closeOverlay:closeOverlay, showSheet:showSheet, appRender:function(){ render(); }, fetch:nFetch, auto:au, IbFold:IbFold, sharePdf:sharePdf}); }catch(err){ el.innerHTML='<div class="card">'+L2x("Penyemak halal gagal dibuka","The halal checker could not open")+'</div>'; } };
  if(halalReady){ start(); return; }
  el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>';
  if(!document.querySelector('link[href="halal/halal.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="halal/halal.css"; document.head.appendChild(lk); }
  var files=["halal/halal_db.js","halal/halal_ai.js","halal/barcode.js","halal/recipe_subs.js","halal/recipe.js","halal/halal.js"], i=0;
  var next=function(){ if(i>=files.length){ halalReady=true; if(view==="halal"||(view==="alat"&&SUB2.alat==="halal")) start(); return; }
    var sc=document.createElement("script"); sc.src=files[i++]; sc.onload=next; sc.onerror=function(){ el.innerHTML='<div class="card">'+L2x("Penyemak halal gagal dimuatkan","The halal checker could not load")+'</div>'; }; document.body.appendChild(sc); };
  next();
}
// ---------- SIRAH (lazy-loaded, all files bundled in the app) ----------
var sirahReady=false, sirahLoading=false;
function openSirah(kids, jump){
  if(sirahLoading) return;
  var start=function(){ try{ SirahOpen(kids,{jump:jump||null, S:S, saveS:saveS, save:save, load:load, N:N, toast:toast, esc:esc, L2x:L2x, speakAr:speakAr, shareCard:shareCard, on:on, off:off, onExit:function(){ render(); }}); }catch(err){ closeOverlay(); toast(L2x("Garis masa Sirah gagal dibuka","The Sirah timeline could not open")); } };
  if(sirahReady){ start(); return; }
  sirahLoading=true; var ov=document.getElementById("overlay"); ov.className="sirahov"; ov.innerHTML='<div class="sk-load">'+L2x("Menyediakan padang pasir…","Preparing the desert…")+'</div>'; ov._close=function(){};
  var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="sirah.css"; document.head.appendChild(lk);
  var files=["sirah_art.js","sirah_data_0.js","sirah_data_1.js","sirah_data_2.js","sirah_data_3.js","sirah.js"], i=0;
  var next=function(){ if(i>=files.length){ sirahReady=true; sirahLoading=false; start(); return; }
    var sc=document.createElement("script"); sc.src=files[i++]; sc.onload=next; sc.onerror=function(){ sirahLoading=false; closeOverlay(); toast(L2x("Garis masa Sirah gagal dimuatkan","The Sirah timeline could not load")); }; document.body.appendChild(sc); };
  next();
}
// ---------- HAJI & UMRAH 3D (lazy-loaded; Three.js and every asset bundled in the app) ----------
var hajjReady=false, hajjLoading=false;
function openHajj(){
  if(hajjLoading) return;
  var start=function(){ try{ HajjOpen({S:S, save:save, load:load, N:N, toast:toast, esc:esc, L2x:L2x, speakAr:speakAr, on:on, off:off, hijri:function(){ return hijriOf(new Date()); }, tawaf:function(){ openTawaf(); }, onExit:function(){ render(); }}); }catch(err){ closeOverlay(); toast(L2x("Panduan Haji & Umrah gagal dibuka","The Hajj & Umrah guide could not open")); } };
  if(hajjReady){ start(); return; }
  hajjLoading=true; var ov=document.getElementById("overlay"); ov.className="hajjov"; ov.innerHTML='<div class="sk-load hj-load">'+L2x("Menyediakan Tanah Suci…","Preparing the Holy Land…")+'</div>'; ov._close=function(){};
  var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="hajj/hajj.css"; document.head.appendChild(lk);
  var files=["hajj/three.min.js","hajj/hajj_data.js","hajj/hajj_world.js","hajj/hajj.js"], i=0;
  var next=function(){ if(i>=files.length){ hajjReady=true; hajjLoading=false; start(); return; }
    var sc=document.createElement("script"); sc.src=files[i++]; sc.onload=next; sc.onerror=function(){ hajjLoading=false; closeOverlay(); toast(L2x("Panduan Haji & Umrah gagal dimuatkan","The Hajj & Umrah guide could not load")); }; document.body.appendChild(sc); };
  next();
}
// ---------- UMRAH DIY itinerary maker (lazy-loaded; MapLibre bundled, OpenFreeMap tiles when online) ----------
var umrahReady=false, umrahLoading=false;
function openUmrah(){
  if(umrahLoading) return;
  var start=function(){ try{ UmrahOpen({S:S, save:save, load:load, N:N, toast:toast, esc:esc, L2x:L2x, on:on, off:off, fetch:nFetch, openWeb:openWeb, speakAr:speakAr,
    calcDay:calcDay, hijri:function(d){ return hijriOf(d); }, hijriMonth:function(m){ return HIJRI_MONTHS[m-1]; },
    tawaf:function(){ openTawaf(); }, hajj:function(){ openHajj(); }, onExit:function(){ render(); }}); }catch(err){ console.error(err); closeOverlay(); toast(L2x("Umrah DIY gagal dibuka","Umrah DIY could not open")); } };
  if(umrahReady){ start(); return; }
  umrahLoading=true; var ov=document.getElementById("overlay"); ov.className="umov"; ov.innerHTML='<div class="sk-load">'+L2x("Menyediakan perancang umrah…","Preparing the umrah planner…")+'</div>'; ov._close=function(){};
  var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="umrah/umrah.css"; document.head.appendChild(lk);
  var lk2=document.createElement("link"); lk2.rel="stylesheet"; lk2.href="umrah/maplibre-gl.css"; document.head.appendChild(lk2);
  var files=["umrah/maplibre-gl.js","umrah/umrah_world.js","umrah/umrah_data.js","hajj/hajj_data.js","umrah/umrah_more_data.js","umrah/umrah_more.js","umrah/umrah.js"], i=0;
  if(window.HJ_DOA) files.splice(3,1);
  var next=function(){ if(i>=files.length){ umrahReady=true; umrahLoading=false; start(); return; }
    var sc=document.createElement("script"); sc.src=files[i++]; sc.onload=next; sc.onerror=function(){ if(/maplibre|hajj_data/.test(sc.src)){ next(); return; } umrahLoading=false; closeOverlay(); toast(L2x("Umrah DIY gagal dimuatkan","Umrah DIY could not load")); }; document.body.appendChild(sc); };
  next();
}
function umrahHero(){ return '<button class="bnHero bn-umrah" data-umrah="1"><span class="bnSc"></span><span class="bnI">🧳</span><span class="shTxt"><b>'+L2x("Umrah DIY: rancang sendiri","Umrah DIY: plan it yourself")+'</b><small>'+L2x("Bajet Asas, Biasa atau Selesa. Penerbangan, hotel, makanan, ziarah, peta dan jadual lengkap","Basic, Normal or Comfort budget. Flights, hotels, food, ziarah, a map and a full itinerary")+'</small></span><span class="shGo">›</span></button>'; }
// 0.24.0 banner heroes, same size as the Haji 3D hero
function kidsHero(){ return '<button class="bnHero bn-kids" data-go="kids"><span class="bnSc"></span><span class="bnI">🧒</span><span class="shTxt"><b>'+L2x("Mod kanak-kanak","Kids mode")+'</b><small>'+L2x("Bintang, lencana, kisah dan permainan untuk anak","Stars, badges, stories and games for children")+'</small></span><span class="shGo">›</span></button>'; }
function iqraHero(){ return '<button class="bnHero bn-iqra" data-learn="iqra"><span class="bnSc"></span><span class="bnI">📗</span><span class="shTxt"><b>'+L2x("Asas Membaca al-Quran (Tahap 1–6)","Learn to Read the Quran (Levels 1–6)")+'</b><small>'+L2x("Seperti Iqra\': dari huruf pertama hingga membaca ayat","Like Iqra\': from the first letters to reading ayat")+'</small></span><span class="shGo">›</span></button>'; }
function radioHero(){ return '<button class="bnHero bn-radio" data-learn="radio"><span class="bnSc"></span><span class="bnI">📻</span><span class="shTxt"><b>'+L2x("Radio Islam","Islamic radio")+'</b><small>'+L2x("Stesen Al-Quran, kuliah & nasyid dari seluruh dunia","Quran, talks & nasheed stations worldwide")+'</small></span><span class="shGo">›</span></button>'; }
function podHero(){ return '<button class="bnHero bn-pod" data-learn="podcast"><span class="bnSc"></span><span class="bnI">🎙</span><span class="shTxt"><b>'+L2x("Podcast","Podcast")+'</b><small>'+L2x("82 penceramah lelaki & wanita, ikut topik. Langgan & dengar","82 speakers, men & women, by topic. Subscribe & listen")+'</small></span><span class="shGo">›</span></button>'; }
// 0.6.61 (owner spec global-news-listen.md): World News in Listen (news/*.js); hidden in kids lock
function newsHero(){ return S.kidLock ? '' : '<button class="bnHero bn-news" data-learn="news"><span class="bnSc"></span><span class="bnI">📰</span><span class="shTxt"><b>'+L2x("Berita Dunia","World News")+'</b><small>'+L2x("Tajuk berita, radio berita dan podcast ikut negara. Dengar buletin berita.","Headlines, news radio and podcasts by country. Listen to a news bulletin.")+'</small></span></button>'; }
function vNews(el){ if(S.kidLock){ learnPg=null; render(); return; } if(!document.getElementById("nwCss")){ var l=document.createElement("link"); l.id="nwCss"; l.rel="stylesheet"; l.href="news/news.css"; document.head.appendChild(l); }
  var go_=function(){ if(document.body.contains(el)) try{ el.innerHTML='<div class="nwTop"><button class="chip" id="lBack">‹ '+L2x("Dengar","Listen")+'</button><div id="nwTkSlot" class="nwTkSlot"></div></div><div id="nwBox"></div>'; el.querySelector("#lBack").onclick=function(){ learnBack(); }; IbNews.render(el.querySelector("#nwBox")); }catch(err){ console.error(err); } };
  if(window.IbNews) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["news/news_data.js","news/news.js"], go_); } }
function liveHero(){ return '<button class="bnHero bn-live" data-learn="live"><span class="bnSc"></span><span class="bnI">📺</span><span class="shTxt"><b>'+L2x("Siaran langsung Makkah & Madinah","Live from Makkah & Madinah")+'</b><small>'+L2x("Masjidil Haram dan Masjid Nabawi, 24 jam","Masjid al-Haram and the Prophet\'s Mosque, 24 hours")+'</small></span><span class="shGo">›</span></button>'; }
// PKSK (Pentaksiran Kemasukan Sekolah Khusus) notes and practice exam: a free, offline page bundled in pksk/pksk.html, opened in a full-screen frame
function tajwidHero(){ return '<button class="bnHero bn-tajwid" data-learn="tajwid"><span class="bnSc"></span><span class="bnI">🎨</span><span class="shTxt"><b>'+L2x("Tajwid","Tajweed")+'</b><small>'+L2x("Hukum nun mati, mim mati, mad dan lain-lain, berwarna dan boleh didengar","Rules of nun and mim sakinah, madd and more, colour-coded with audio")+'</small></span><span class="shGo">›</span></button>'; }
// 0.2.4: Fiqh Syafi'i 3D mind map (fiqh/fiqh.js, three.js from hajj/), opened full screen like Haji & Umrah 3D
function fiqhHero(){ return '<button class="bnHero bn-fiqh" data-fiqh="-1"><span class="bnSc"></span><span class="bnI">⚖️</span><span class="shTxt"><b>'+L2x("Fiqh Syafi'i: peta minda 3D","Shafi'i Fiqh: 3D mind map")+'</b><small>'+L2x("Ibadat, Muamalat, Munakahat dan Jinayat. Ayat dan hadis untuk setiap topik","Worship, transactions, marriage and criminal law. Ayat and hadith for every topic")+'</small></span><span class="shGo">›</span></button>'; }
var fiqhReady=false, fiqhLoading=false;
function openFiqh(rubu){
  if(fiqhLoading) return;
  var start=function(){ try{ FiqhOpen({rubu:rubu, S:S, save:save, load:load, N:N, toast:toast, esc:esc, L2x:L2x, on:on, off:off, onExit:function(){ render(); }}); }catch(err){ console.error(err); closeOverlay(); toast(L2x("Fiqh Syafi'i gagal dibuka","Shafi'i Fiqh could not open")); } };
  if(fiqhReady){ start(); return; }
  fiqhLoading=true; var ov=document.getElementById("overlay"); ov.className="fqov"; ov.innerHTML='<div class="sk-load" style="color:#5d4a1f">'+L2x("Menyusun peta minda…","Building the mind map…")+'</div>'; ov._close=function(){};
  if(!document.getElementById("fqCss")){ var lk=document.createElement("link"); lk.id="fqCss"; lk.rel="stylesheet"; lk.href="fiqh/fiqh.css"; document.head.appendChild(lk); }
  var files=(window.THREE?[]:["hajj/three.min.js"]).concat(["fiqh/fiqh_data.js","fiqh/fiqh.js"]);
  loadJs(files, function(){ fiqhReady=true; fiqhLoading=false; start(); }, function(){ fiqhLoading=false; closeOverlay(); toast(L2x("Fiqh Syafi'i gagal dimuatkan","Shafi'i Fiqh could not load")); });
}
// 0.2.5: the four rubu' as a 2 x 2 grid under the Fiqh hero (Belajar page)
function fiqhCard(){
  return '<div class="card"><h3>⚖️ '+L2x("Peta minda Fiqh Syafi'i","Shafi'i Fiqh mind map")+'</h3><div class="small" style="line-height:1.55">'+L2x("Empat rubu' (Ibadat, Muamalat, Munakahat, Jinayat) berkembang dari tengah ke setiap kitab, bab dan subtopik. Setiap topik memaparkan ayat al-Quran dan hadis yang menjadi dalilnya, dengan butang main. Kandungan penuh boleh dibuka di tepi.","Four quarters (Worship, Transactions, Marriage, Criminal law) open from the centre into every book, chapter and subtopic. Each topic shows the Quran verses and hadith it rests on, with a play button. The full contents open from the side.")+'</div>'+
    '<div class="fq2x2">'+[["0","🕌","Ibadat","Worship"],["1","🤝","Muamalat","Transactions"],["2","💍","Munakahat","Marriage"],["3","⚖️","Jinayat","Criminal law"]].map(function(x){ return '<button class="btn alt" data-fiqh="'+x[0]+'">'+x[1]+' '+L2x(x[2],x[3])+'</button>'; }).join("")+'</div></div>';
}
function pkskHero(){ return '<button class="bnHero bn-pksk" data-pksk="1"><span class="bnSc"></span><span class="bnI">📝</span><span class="shTxt"><b>'+L2x("Latihan PKSK (Tingkatan 1)","PKSK practice exam (Form 1)")+'</b><small>'+L2x("Nota & soalan latihan Bahagian A, B dan C. Percuma untuk semua","Notes & practice questions for Parts A, B and C. Free for everyone")+'</small></span><span class="shGo">›</span></button>'; }
function openPksk(){
  var ov=document.getElementById("overlay");
  ov.className="pkskov";
  ov.innerHTML='<div class="pkBar"><button class="pkX" aria-label="'+L2x("Tutup","Close")+'">✕</button><b>'+L2x("Latihan PKSK","PKSK practice exam")+'</b></div><iframe class="pkF" src="pksk/pksk.html" title="PKSK"></iframe>';
  var f=ov.querySelector(".pkF");
  var close=function(){ closeOverlay(); render(); };
  ov._close=function(){ try{ var w=f.contentWindow; if(w && w.PKSKBack && w.PKSKBack()) return; }catch(e){} close(); };
  ov.querySelector(".pkX").onclick=close;
}
function quizHero(){ return '<button class="bnHero bn-quiz" data-xquiz="1"><span class="bnSc"></span><span class="bnI">🧠</span><span class="shTxt"><b>'+L2x("Kuiz Islam","Islamic quiz")+'</b><small>'+L2x("Rukun, al-Quran, para nabi, fiqh asas dan sirah. 10 soalan setiap pusingan","Pillars, Quran, prophets, basic fiqh and sirah. 10 questions a round")+'</small></span><span class="shGo">›</span></button>'; }
function hajjHero(kids){ return '<button class="hajjHero'+(kids?' kids':'')+'" data-hajj="1"><span class="hhSky"></span><span class="hhGround"></span><span class="hhKaabah"></span><span class="shTxt"><b>'+(kids?L2x("Jom ke Makkah!","Let's go to Makkah!"):L2x("Haji & Umrah 3D","Hajj & Umrah 3D"))+'</b><small>'+(kids?L2x("Gerakkan watak comel, tawaf, sa\'ie dan lontar jamrah","Walk a cute pilgrim, do tawaf, sa\'i and stone the jamarat"):L2x("Miqat hingga tawaf wada\', dan ziarah Masjid Nabawi. Ikut langkah atau jelajah bebas","Miqat to the farewell tawaf, plus the Prophet\'s Mosque. Step by step or free explore"))+'</small></span><span class="shGo">›</span></button>'; }
function vLearn0(el){
  if(S.kidLock && S.lockTo==="school"){ learnPg=null; SUB2.learn="sekolah"; vLearn(el); return; }
  if(S.kidLock && (!learnPg || learnFrom!=="kids")){ learnPg=null; view="kids"; vKids(el); return; }
  var en=en_(), html='';
  if(!learnPg){
    html+='<button class="sirahHero" data-sirah="adult"><span class="shSky"></span><span class="shDune"></span><span class="shTxt"><b>'+L2x("Sirah Nabi ﷺ","Sirah of the Prophet ﷺ")+'</b><small>'+L2x("Garis masa interaktif, dari Tahun Gajah hingga wafat","Interactive timeline, from the Year of the Elephant to his passing")+'</small></span><span class="shGo">›</span></button>';
    html+=hajjHero(false);
    html+=umrahHero();
    html+='<div class="lchips"><button class="lchip" data-tawaf="1">🔢 '+L2x("Kaunter tawaf & sa'ie","Tawaf & sa'ie counter")+'</button><button class="lchip" data-prac="1">🔊 '+L2x("Latihan solat berpandu","Guided solat practice")+'</button><button class="lchip" data-learn="live">📺 '+L2x("Siaran langsung Makkah & Madinah","Live Makkah & Madinah")+'</button><button class="lchip" data-learn="askai">💬 '+L2x("Tanya AI tentang Islam","Ask AI about Islam")+'</button></div>';
    html+=radioHero()+podHero();
    html+='<div class="card"><h3>📚 '+T("learn")+'</h3><div class="lgrid">'+LEARN.map(function(x){ return '<button class="qt" data-lp="'+x[0]+'"><span>'+x[1]+'</span>'+(en?x[3]:x[2])+'</button>'; }).join("")+
      '<button class="qt" data-go="asma"><span>✨</span>'+T("asma")+'</button><button class="qt" data-go="kids"><span>🧒</span>'+T("kids")+'</button></div></div>';
    html+='<div class="mut small" style="padding:0 4px 12px">'+L2x("Kandungan prototaip mengikut mazhab Syafi'i: sila dapatkan semakan ustaz.","Prototype content following the Shafi'i school: please have it reviewed by an ustaz.")+'</div>';
    el.innerHTML=html;
    el.querySelectorAll("[data-lp]").forEach(function(b){ b.onclick=function(){ learnPg=b.getAttribute("data-lp"); render(); document.getElementById("view").scrollTop=0; }; });
    return;
  }
  if(learnPg==="radio"||learnPg==="podcast"){ if(window.IbMedia) IbMedia.render(el, learnPg); else el.innerHTML='<div class="card mut">…</div>'; return; }
  if(learnPg==="live"){ vLive(el); return; }
  if(learnPg==="news"){ vNews(el); return; }
  if(learnPg==="iqg"){ iqCss(); el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+L2x("Teroka","Explore")+'</button><b>🧠 '+L2x("Teka-teki IQ","IQ puzzles")+'</b><span></span></div><div id="iqBox"><div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div></div>';
    el.querySelector("#lBack").onclick=function(){ if(window.IQView) IQView.stop(); learnBack(); };
    loadJs((window.THREE?[]:["hajj/three.min.js"]).concat(["iq/core.js"]), function(){ var bx=el.querySelector("#iqBox"); if(bx && document.body.contains(bx)) IQView.render(bx, {esc:esc, L2x:L2x, loadJs:loadJs, toast:toast}); }, function(){}); return; }
  if(learnPg==="chess"){ if(!document.querySelector('link[href="chess/chess.css"]')){ var lc2=document.createElement("link"); lc2.rel="stylesheet"; lc2.href="chess/chess.css"; document.head.appendChild(lc2); }
    el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+L2x("Teroka","Explore")+'</button><b>♟️ '+L2x("Catur 3D","3D chess")+'</b><span></span></div><div id="chBox"><div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div></div>';
    el.querySelector("#lBack").onclick=function(){ if(window.ChessView) ChessView.stop(); learnBack(); };
    loadJs((window.THREE?[]:["hajj/three.min.js"]).concat(["chess/chess_engine.js","chess/chess.js","chess/chess_guide_md.js","chess/chess_guide.js"]), function(){ var bx=el.querySelector("#chBox"); if(bx && document.body.contains(bx)) ChessView.render(bx, {esc:esc, load:load, save:save, en:en_, toast:toast, showSheet:showSheet, closeOverlay:closeOverlay}); }, function(){}); return; }
  if(learnPg==="martial"){ if(!document.querySelector('link[href="martial/academy.css"]')){ var lm=document.createElement("link"); lm.rel="stylesheet"; lm.href="martial/academy.css"; document.head.appendChild(lm); }   // 0.7.42 (owner): martial arts academy
    el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+L2x("Teroka","Explore")+'</button><b>🥋 '+L2x("Seni mempertahankan diri","Martial arts")+'</b><span></span></div><div id="maBox"><div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div></div>';
    el.querySelector("#lBack").onclick=function(){ if(window.MartialView && MartialView.back()) return; learnBack(); };
    loadJs(["martial/guides.js","martial/academy.js"].filter(function(f){ return !(f==="martial/guides.js" && window.MA_DATA) && !(f==="martial/academy.js" && window.MartialView); }), function(){ var bx=el.querySelector("#maBox"); if(bx && document.body.contains(bx)) MartialView.render(bx, {esc:esc, L2x:L2x}); }, function(){}); return; }
  if(learnPg==="sport"){ el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+L2x("Teroka","Explore")+'</button><b>🏅 '+L2x("Sukan","Sports")+'</b><span></span></div><div id="sprtBox"><div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div></div>';
    el.querySelector("#lBack").onclick=learnBack;
    loadJs((window.THREE?[]:["hajj/three.min.js"]).concat(["sport/sport_list.js","sport/sport_engine.js"].filter(function(f){ return !(f==="sport/sport_list.js" && window.SportList) && !(f==="sport/sport_engine.js" && window.SportView); })), function(){ var bx=el.querySelector("#sprtBox"); if(bx && document.body.contains(bx)) try{ SportView.view(bx, fitH()); }catch(err){ console.error(err); bx.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } }, function(){}); return; }
  if(learnPg==="khat"){ sciCss(); el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+L2x("Teroka","Explore")+'</button><b>🖋️ '+L2x("Jurulatih khat AI","AI khat coach")+'</b><span></span></div><div id="khBox"><div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div></div>';
    el.querySelector("#lBack").onclick=function(){ if(window.KhatCoach) KhatCoach.stop(); learnBack(); };
    loadJs(["science/khat.js"], function(){ var bx=el.querySelector("#khBox"); if(bx && document.body.contains(bx)) KhatCoach.render(bx, {esc:esc, load:load, save:save, en:en_, toast:toast, N:N, on:on, off:off}); }, function(){}); return; }
  if(learnPg==="scihub"){ sciCss(); el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+L2x("Teroka","Explore")+'</button><b>🔭 '+L2x("Sains dalam Sejarah Islam","Science in Islamic History")+'</b><span></span></div>'+sciTilesHtml();
    el.querySelector("#lBack").onclick=learnBack; el.querySelectorAll("[data-sci]").forEach(function(b){ b.onclick=function(){ openSci(b.getAttribute("data-sci")); }; }); return; }
  if(learnPg==="sci"){ sciCss(); var tl=SCI_TILES.filter(function(x){ return x[0]===sciId; })[0]||SCI_TILES[0];
    el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+L2x("Teroka","Explore")+'</button><b>'+tl[1]+' '+esc(L2x(tl[2],tl[3]))+'</b><span></span></div><div id="sciBox"><div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div></div>';
    el.querySelector("#lBack").onclick=function(){ if(window.SciView) SciView.stop(); learnBack(); };
    loadJs((window.THREE?[]:["hajj/three.min.js"]).concat(["science/science_data.js","science/science.js"]), function(){ var bx=el.querySelector("#sciBox"); if(bx && document.body.contains(bx)) SciView.render(bx, sciId, {esc:esc, load:load, save:save, en:en_}); }, function(){}); return; }
  if(learnPg==="tajwid"){ el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+L2x("Belajar","Study")+'</button><b>🎨 '+L2x("Tajwid","Tajweed")+'</b><span></span></div><div id="bcBox"></div>';
    el.querySelector("#lBack").onclick=function(){ if(window.BacaanView && BacaanView.back()) return; learnBack(); }; vBacaan(el.querySelector("#bcBox"), "tajwid"); return; }
  if(learnPg==="iqra"){ el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+T("learn")+'</button><b>📗 '+L2x("Asas Membaca","Learn to Read")+'</b><span></span></div><div id="bcBox"></div>';
    el.querySelector("#lBack").onclick=function(){ if(window.BacaanView && BacaanView.back()) return; learnBack(); }; vBacaan(el.querySelector("#bcBox"), "iqra"); return; }
  if(learnPg==="jamma"){ el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+(learnFrom==="kids"?T("kids"):T("learn"))+'</button><b>📖 Juz Amma</b><span></span></div><div id="jmBox"></div>';
    el.querySelector("#lBack").onclick=function(){ if(window.QuranView && QuranView.kidsBack()) return; learnBack(); }; vJamma(el.querySelector("#jmBox")); return; }
  var meta=LEARN.filter(function(x){return x[0]===learnPg;})[0]||["","","",""];
  if(ILMU_PG[learnPg]){
    el.innerHTML='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+(learnFrom==="kids"?T("kids"):learnFrom==="iqra"?L2x("Asas Membaca","Learn to Read"):T("learn"))+'</button><b>'+meta[1]+' '+esc(en?meta[3]:meta[2])+'</b><span></span></div><div id="ilmuBox"></div>';
    el.querySelector("#lBack").onclick=learnBack; vIlmu(el.querySelector("#ilmuBox"), learnPg); return;
  }
  html+='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lBack">‹ '+T("learn")+'</button><b>'+meta[1]+' '+esc(en?meta[3]:meta[2])+'</b><span></span></div>';
  if(learnPg==="wudhu"){
    html+=WUDHU_STEPS.map(function(s,i){ return '<div class="card lstep"><div class="row"><b>'+(i+1)+'. '+s.ic+'</b><span class="badge '+(s.f?"":"warn")+'">'+(s.f?L2x("Rukun","Obligatory"):L2x("Sunat","Sunnah"))+'</span></div><div>'+glz(esc(L2x(s.ms,s.en)))+'</div>'+
      (s.niat?'<div class="snl" style="margin-top:6px">Niat</div>'+arBlock(s.niat,s.niat_ms,s.niat_en):'')+(s.ar?arBlock(s.ar,s.ar_ms,s.ar_en,s.src):'')+'</div>'; }).join("");
    html+='<div class="card"><h3>⚠️ '+L2x("Batal wuduk","What breaks wudhu")+'</h3><div class="small">'+glz(esc(L2x(WUDHU_BREAK.ms,WUDHU_BREAK.en)))+'</div></div>';
  } else if(learnPg==="solat"){
    html+=SOLAT_STEPS.map(function(s,i){ return '<div class="card lstep row" style="align-items:center;gap:12px">'+poseSvg(s.p)+'<div style="flex:1"><b>'+(i+1)+'.</b> '+glz(esc(L2x(s.ms,s.en)))+'</div></div>'; }).join("");
    html+='<button class="btn gold full" data-prac="1" style="margin-bottom:8px">🔊 '+L2x("Latih solat dengan suara","Practise with the voice")+'</button>';
    html+='<button class="btn alt full" data-lp2="bacaan" style="margin-bottom:12px">📜 '+L2x("Lihat bacaan dalam solat","See the readings in solat")+'</button>';
  } else if(learnPg==="bacaan"){
    html+=BACAAN_SOLAT.map(function(b,i){ return '<div class="card"><h3>'+(i+1)+'. '+esc(L2x(b.t_ms,b.t_en))+'</h3>'+arBlock(b.ar,b.ms,b.en,b.src)+(b.note_ms?'<div class="why">'+glz(esc(L2x(b.note_ms,b.note_en)))+'</div>':'')+'</div>'; }).join("");
  } else if(learnPg.indexOf("g_")===0){
    var g=GUIDE_SPECIAL.filter(function(x){return "g_"+x.id===learnPg;})[0];
    html+='<div class="card"><h3>'+L2x("Langkah","Steps")+'</h3><ol class="ul">'+(en?g.steps_en:g.steps_ms).map(function(s){return '<li>'+glz(esc(s))+'</li>';}).join("")+'</ol></div>';
    html+='<div class="card"><h3>Niat</h3>'+arBlock(g.niat,g.niat_ms,g.niat_en)+'</div>';
    html+='<div class="card"><h3>Doa</h3>'+arBlock(g.doa,g.doa_ms,g.doa_en,g.src)+'</div>';
    html+='<button class="btn gold full" id="lCount" style="margin-bottom:12px">'+L2x("Kira 2 rakaat","Count 2 rakaat")+'</button>';
  } else if(learnPg.indexOf("x_")===0 && GUIDE_MORE[learnPg.slice(2)]){
    var gm=GUIDE_MORE[learnPg.slice(2)], LL=function(x){ return x?esc(L2x(x[0],x[1])):""; };
    gm.parts.forEach(function(pt){
      if(pt.k==="p") html+='<div class="card" style="line-height:1.55">'+glz(LL(pt.t))+'</div>';
      else if(pt.k==="ol"||pt.k==="ul") html+='<div class="card"><h3>'+LL(pt.h)+'</h3><'+pt.k+' class="ul">'+pt.li.map(function(x){ return '<li>'+glz(LL(x))+'</li>'; }).join("")+'</'+pt.k+'></div>';
      else if(pt.k==="ar") html+='<div class="card"><h3>'+LL(pt.h)+'</h3>'+arBlock(pt.ar,pt.m[0],pt.m[1],pt.src)+'</div>';
      else if(pt.k==="tbl") html+='<div class="card"><h3>'+LL(pt.h)+'</h3><div class="gtw"><table class="gtbl"><thead><tr>'+pt.head.map(function(x){ return '<th>'+LL(x)+'</th>'; }).join("")+'</tr></thead><tbody>'+pt.rows.map(function(r){ return '<tr>'+r.map(function(x){ return '<td>'+LL(x)+'</td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table></div></div>';
    });
    if(gm.count) html+='<button class="btn gold full" id="lCount" style="margin-bottom:12px">'+L2x("Kira 2 rakaat","Count 2 rakaat")+'</button>';
  } else if(learnPg==="sakit"||learnPg==="musafir"){
    var G=learnPg==="sakit"?SICK_GUIDE:MUSAFIR;
    html+='<div class="card"><ol class="ul">'+(en?G.en:G.ms).map(function(s){return '<li>'+glz(esc(s))+'</li>';}).join("")+'</ol><div class="src">'+srcHtml(G.src)+'</div></div>';
    if(learnPg==="musafir") html+='<div class="card"><div class="small">'+L2x("Tetapkan lokasi rumah di Lagi → Lokasi & perjalanan. Apabila anda lebih 81 km dari rumah, tab Solat memaparkan butang qasar 2 rakaat.","Set your home in More → Location & travel. When you are more than 81 km away, the Solat tab shows 2-rakaat qasar buttons.")+'</div></div>';
  } else if(learnPg==="haid"){
    html+='<div class="card"><h3>'+L2x("Amalan yang masih boleh dilakukan","What you can still do")+'</h3><ul class="ul">'+(en?HAID_AMALAN.en:HAID_AMALAN.ms).map(function(s){return '<li>'+esc(s)+'</li>';}).join("")+'</ul><div class="why">'+glz(esc(L2x(HAID_AMALAN.note_ms,HAID_AMALAN.note_en)))+'</div></div>';
    html+='<div class="card small">'+L2x("Hidupkan Mod uzur di Lagi untuk menjeda makluman solat.","Turn on Uzur mode in More to pause prayer alerts.")+'</div>';
  } else if(learnPg==="nabi" && learnFrom!=="kids" && nabiMode!=="kids"){
    html+=nabiTabs();
    if(!window.NABI_ADULT){ html+='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["ilmu/nabi_adult.js"], function(){ if(learnPg==="nabi") render(); }); }
    else if(nabiMode==="isteri") html+='<div class="mut small" style="margin:0 4px 8px">'+L2x("Ummahatul Mukminin, para isteri Rasulullah ﷺ dan ibu kepada orang beriman (al-Ahzab 33:6).","Ummahat al-Mu'minin, the wives of the Prophet ﷺ and mothers of the believers (al-Ahzab 33:6).")+'</div>'+ISTERI_NABI.map(function(w,i){ return '<details class="card nabiA"><summary>'+nabiArt(w.art,["#3a2a3a","#140c14"])+'<span class="nAt"><b>'+(i+1)+'. '+esc(w.n)+' r.a.</b><small>'+esc(L2x(w.t_ms,w.t_en))+'</small></span></summary><div class="nBody"><p>'+esc(L2x(w.ms,w.en))+'</p><div class="src">'+srcHtml(w.src)+'</div></div></details>'; }).join("");
    else html+=NABI_ADULT.map(function(n,i){ var ps=en_()?n.en:n.ms; return '<details class="card nabiA"><summary>'+nabiArt(n.art,n.sky)+'<span class="nAt"><b>'+(i+1)+'. '+(n.n.indexOf("Muhammad")===0?esc(n.n):L2x("Nabi ","Prophet ")+esc(n.n))+'</b><small>'+esc(L2x(n.l_ms,n.l_en))+'</small></span></summary><div class="nBody">'+ps.map(function(p){ return '<p>'+esc(p)+'</p>'; }).join("")+'<div class="why"><b>'+L2x("Pengajaran","Lesson")+':</b> '+esc(L2x(n.l_ms,n.l_en))+'</div><div class="src">'+srcHtml("Al-Quran "+n.q+(n.h?"; "+n.h:""))+'</div>'+(n.n.indexOf("Muhammad")===0?'<button class="btn gold full g3d" data-sirah="adult" style="margin-top:8px">🐪 '+L2x("Buka Garis masa Sirah","Open the Sirah timeline")+'</button>':'')+'</div></details>'; }).join("");
    html+='<div class="mut tiny" style="padding:6px 4px 12px">'+L2x("Kisah ditulis berpandukan al-Quran dan hadis sahih; riwayat yang lemah disebut sebagai riwayat. Gambar latar hanya objek dan pemandangan, tiada lukisan nabi atau manusia. Perlu semakan ustaz.","Stories follow the Quran and authentic hadith; weaker reports are marked as reports. Backgrounds show objects and scenes only, never prophets or people. Needs an ustaz's review.")+'</div>';
  } else if(learnPg==="nabi"){
    if(learnFrom!=="kids") html+=nabiTabs();
    html+=NABI.map(function(n,i){ return '<details class="card nabi"><summary><b>'+(i+1)+'. '+L2x("Nabi ","Prophet ")+esc(n.n)+'</b></summary><div style="margin-top:6px;line-height:1.55">'+esc(L2x(n.ms,n.en))+'</div><div class="why"><b>'+L2x("Pengajaran","Lesson")+':</b> '+esc(L2x(n.l_ms,n.l_en))+'</div><div class="src">'+srcHtml("Al-Quran "+n.q)+'</div></details>'; }).join("");
  } else if(learnPg==="glosari"){
    html+='<input id="glq" type="search" class="full" placeholder="🔍 '+L2x("Cari istilah","Search a term")+'" style="width:100%;margin-bottom:8px">';
    html+='<div id="glL">'+glossList("")+'</div>';
  }
  el.innerHTML=html;
  el.querySelector("#lBack").onclick=learnBack;
  el.querySelectorAll("[data-nmode]").forEach(function(b){ b.onclick=function(){ nabiMode=b.getAttribute("data-nmode"); render(); document.getElementById("view").scrollTop=0; }; });
  el.querySelectorAll(".nabiA [data-sirah]").forEach(function(b){ b.onclick=function(){ openSirah(false); }; });
  var lp2=el.querySelector("[data-lp2]"); if(lp2) lp2.onclick=function(){ learnPg=lp2.getAttribute("data-lp2"); render(); document.getElementById("view").scrollTop=0; };
  var lc=el.querySelector("#lCount"); if(lc) lc.onclick=function(){ rk.solat="custom"; rk.customN=2; rk.customName=L2x(meta[2],meta[3]); rk.keep=true; startPraying(2); };
  var gq=el.querySelector("#glq"); if(gq) gq.oninput=function(){ el.querySelector("#glL").innerHTML=glossList(gq.value.trim().toLowerCase()); };
}
function glossList(q){ return GLOSSARY.slice().sort(function(a,b){ return a.w[0].localeCompare(b.w[0]); }).filter(function(g){ return !q || g.w.join(" ").toLowerCase().indexOf(q)>=0 || L2x(g.ms,g.en).toLowerCase().indexOf(q)>=0; }).map(function(g){ return '<div class="card gli"><b>'+esc(g.w[0])+'</b><div class="small">'+esc(L2x(g.ms,g.en))+'</div></div>'; }).join("")||'<div class="mut card">'+L2x("Tiada","None")+'</div>'; }

// ---------- ILMU (0.12.0): 40 Hadith, Kisah Sahabat, Huruf Hijaiyah, Quran words, Ask AI. Pages load on first use ----------
var ILMU_PG={n40:["ilmu/nawawi.js"], sahabat:["ilmu/sahabat.js"], hijaiyah:["ilmu/huruf.js"], qwords:["ilmu/huruf.js"], askai:["halal/halal_ai.js"]}, jsDone={}, ilmuSt={}, learnFrom=null;
function loadJs(list, ok, bad){ var i=0; var next=function(){
  while(i<list.length && (jsDone[list[i]] || (list[i]==="halal/halal_ai.js" && window.HalalAI))) i++;
  if(i>=list.length){ ok(); return; }
  var f=list[i], sc=document.createElement("script"); sc.src=f; sc.onload=function(){ jsDone[f]=1; next(); }; sc.onerror=bad; document.body.appendChild(sc); }; next(); }
// 0.29.0: Kisah 25 Nabi has a kids version (short), an adult version (longer, with scene art) and the wives of the Prophet ﷺ
var nabiMode="adult";
function nabiTabs(){ return '<div class="chips nTabs">'+[["kids","🧒","Ringkas (kanak-kanak)","Short (kids)"],["adult","📖","Dewasa","Adult"],["isteri","🌸","Isteri Nabi ﷺ","Wives of the Prophet ﷺ"]].map(function(x){ return '<button class="chip g3d'+(nabiMode===x[0]?" on":"")+'" data-nmode="'+x[0]+'">'+x[1]+' '+L2x(x[2],x[3])+'</button>'; }).join("")+'</div>'; }
function learnBack(){ if(window.IlmuView) IlmuView.stop(); var k=learnFrom==="kids", iq=learnFrom==="iqra", sh=learnFrom==="scihub"; learnFrom=null; learnPg=iq?"iqra":sh?"scihub":null; if(k) go("kids"); else render(); }
function vIlmu(bx, pg, sub){
  // 0.26.0 fix: the Tanya AI tab (sub=true) is not a learn page, so it must not wait for learnPg; it used to stay on "Loading…" forever
  var start=function(){ if((!sub && learnPg!==pg) || !document.body.contains(bx)) return; try{ IlmuView(bx, pg, {S:S, N:N, esc:esc, L2x:L2x, en:en_, toast:toast, showSheet:showSheet, load:load, save:save, on:on, off:off,
    srcHtml:srcHtml, speakAr:speakAr, shareCard:shareCard, openWeb:openWeb, st:ilmuSt, open:function(p){ learnPg=p; render(); document.getElementById("view").scrollTop=0; }}); }
    catch(err){ bx.innerHTML='<div class="card">'+L2x("Halaman ini gagal dibuka","This page could not open")+'</div>'; } };
  if(window.IlmuView && (ILMU_PG[pg]||[]).every(function(f){ return jsDone[f] || (f==="halal/halal_ai.js" && window.HalalAI); })){ start(); return; }
  bx.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>';
  loadJs(["ilmu/ilmu.js"].concat(ILMU_PG[pg]||[]), start, function(){ bx.innerHTML='<div class="card">'+L2x("Halaman ini gagal dimuatkan","This page could not load")+'</div>'; });
}

// ---------- QIBLA CAMERA (0.10.0) ----------
// The back camera shows the real view; a Kaabah marker sits where the Qibla is. Same bearing and 3° rule as the compass.
var qcamOn=false;
function kaabahIcon(){ return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 12 L20 6 L34 12 L34 32 L20 37 L6 32 Z" fill="#141414" stroke="#c9a646" stroke-width="1.6"/><path d="M6 12 L20 18 L34 12 M20 18 L20 37" fill="none" stroke="#3a3a3a" stroke-width="1.2"/><path d="M6 16 L20 22 L34 16" fill="none" stroke="#c9a646" stroke-width="2.4"/></svg>'; }
function openQiblaCam(){
  if(!N.hasPerm("camera")){ var ph=function(r){ if(r.which!=="camera") return; off("perm",ph); if(r.granted) openQiblaCam(); else toast(L2x("Kebenaran kamera diperlukan untuk paparan kamera","Camera permission is needed for the camera view")); }; on("perm",ph); N.requestPerm("camera"); return; }
  var p=qiblaPoint(), qb=qiblaBearing(p[0],p[1]), ov=document.getElementById("overlay"), stream=null, sm=null, buzzed=false, FOV=50, closed=false;
  qcamOn=true; ov.className="qcamov";
  ov.innerHTML='<video id="qcV" autoplay muted playsinline></video><div class="qcShade"></div>'+
    '<div class="qcTop"><button class="qcX" id="qcX" aria-label="'+L2x("Tutup","Close")+'">✕</button><b>'+L2x("Kiblat kamera","Qibla camera")+'</b><span>'+qb.toFixed(1)+'°</span></div>'+
    '<div class="qcHz"></div><div class="qcAim"></div>'+
    '<div class="qcMark" id="qcM" style="display:none">'+kaabahIcon()+'<small>'+L2x("Kiblat","Qibla")+'</small></div>'+
    '<div class="qcEdge l" id="qcL" style="display:none"><span>‹</span><small></small></div><div class="qcEdge r" id="qcR" style="display:none"><span>›</span><small></small></div>'+
    '<div class="qcBot"><div class="qcStat" id="qcS">'+L2x("Mencari arah…","Finding the direction…")+'</div><div class="qcTip" id="qcT">'+L2x("Pegang telefon tegak dan pusing perlahan-lahan sehingga penanda Kaabah berada di tengah.","Hold the phone upright and turn slowly until the Kaabah marker is in the middle.")+'</div></div>';
  var V=ov.querySelector("#qcV"), M=ov.querySelector("#qcM"), EL=ov.querySelector("#qcL"), ER=ov.querySelector("#qcR"), ST=ov.querySelector("#qcS"), TP=ov.querySelector("#qcT");
  var camStart=function(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ camFail(); return; }
    navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}, width:{ideal:1280}}, audio:false}).then(function(s){ if(closed){ s.getTracks().forEach(function(t){ t.stop(); }); return; } stream=s; V.srcObject=s; var pl=V.play(); if(pl&&pl.catch) pl.catch(function(){}); ov.classList.remove("nocam"); }).catch(camFail);
  };
  var camFail=function(){ ov.classList.add("nocam"); TP.textContent=L2x("Kamera tidak dapat dibuka. Arah kiblat masih ditunjukkan di sini.","The camera could not open. The Qibla direction is still shown here."); };
  var camStop=function(){ if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream=null; } V.srcObject=null; };
  var hh=function(r){
    if(r.error){ ST.textContent=L2x("Tiada sensor kompas pada telefon ini","No compass sensor on this phone"); return; }
    var d=qiblaDiff(r.deg, qb); if(sm===null) sm=d; else { var dd=((d-sm+540)%360)-180; sm=((sm+dd*0.35)+540)%360-180; }
    var a=Math.abs(sm), ok=a<3;
    if(a<=FOV/2+4){ M.style.display=""; M.style.left=(50+sm/FOV*100).toFixed(1)+"%"; EL.style.display=ER.style.display="none"; }
    else { M.style.display="none"; var side=sm>0?ER:EL; side.style.display=""; (sm>0?EL:ER).style.display="none"; side.querySelector("small").textContent=Math.round(a)+"°"; }
    ov.classList.toggle("ok", ok);
    ST.textContent= ok ? L2x("✓ Menghadap kiblat","✓ Facing the Qibla") : (sm>0 ? L2x("Pusing ke kanan ","Turn right ") : L2x("Pusing ke kiri ","Turn left "))+Math.round(a)+"°";
    if(ok && !buzzed){ buzzed=true; N.vibrate(200); } if(a>6) buzzed=false;
    if(r.acc!=null && r.acc<2) TP.textContent=L2x("Ketepatan kompas rendah. Gerakkan telefon dalam bentuk angka 8, jauh dari logam.","Low compass accuracy. Move the phone in a figure of eight, away from metal.");
    else if(r.pitch!=null && Math.abs(r.pitch)>50) TP.textContent=L2x("Pegang telefon tegak, bukan mendatar.","Hold the phone upright, not flat.");
    else if(!ov.classList.contains("nocam")) TP.textContent=L2x("Penanda bergerak apabila anda berpusing. Ikut arah anak panah.","The marker moves as you turn. Follow the arrow.");
  };
  var compassOn=function(){ if(N.setCompassCam) N.setCompassCam(true); N.startCompass(p[0],p[1]); };
  var onP=function(){ camStop(); }, onR=function(){ if(!closed){ compassOn(); camStart(); } };
  var close=function(){ if(closed) return; closed=true; qcamOn=false; camStop(); off("heading",hh); off("pause",onP); off("resume",onR); if(N.setCompassCam) N.setCompassCam(false); N.stopCompass(); closeOverlay(); render(); };
  ov.querySelector("#qcX").onclick=close; ov._close=close;
  on("heading",hh); on("pause",onP); on("resume",onR); compassOn(); camStart();
}

// ---------- GUIDED SOLAT PRACTICE (0.10.0) ----------
// The phone reads each part of the prayer in Arabic and waits, while the screen shows the position and meaning.
function arSpeech(text){ return waqfAr(String(text||"").replace(/<[^>]*>/g," ").replace(/[﴿(]?\s*[٠-٩۰-۹0-9]+\s*[﴾)]?/g," . ").replace(/[۝۞﴿﴾]/g," . ").replace(/[ۖ-ۜ۞-ۭ]/g,"").replace(/(\s*\.\s*)+/g," . ").replace(/^\s*\.\s*/,"")); }
var spkTok=0;
function speakThen(text, cb){
  var tok=++spkTok, t=arSpeech(text), est=Math.max(1600, t.length*95), done=false, tm=0;
  var fin=function(){ if(done) return; done=true; off("ttsdone",td); off("tts",te); clearTimeout(tm); if(tok===spkTok && cb) cb(); };
  var td=function(r){ if(r && r.stopped) return; fin(); };
  var te=function(r){ if(r && r.error){ clearTimeout(tm); tm=setTimeout(fin, est); } };
  tm=setTimeout(fin, est*2+4000);
  if(window.Native && N.speak){ on("ttsdone",td); on("tts",te); N.speak(t,"ar"); return; }
  try{ speechSynthesis.cancel(); var vs=speechSynthesis.getVoices().filter(function(v){ return /^ar/i.test(v.lang); });
    if(!vs.length){ clearTimeout(tm); tm=setTimeout(fin, est); return; }
    var u=new SpeechSynthesisUtterance(t); u.lang="ar-SA"; u.rate=0.8; u.voice=vs.filter(function(v){ return v.name===S.voice; })[0]||vs[0]; u.onend=fin; u.onerror=fin; speechSynthesis.speak(u);
  }catch(e){ clearTimeout(tm); tm=setTimeout(fin, est); }
}
function speakStop(){ spkTok++; if(N.stopSpeak) try{ N.stopSpeak(); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} }
var PR_NIAT={subuh:["الصُّبْحِ رَكْعَتَيْنِ","Subuh dua rakaat","Subuh, two rakaat",2], zohor:["الظُّهْرِ أَرْبَعَ رَكَعَاتٍ","Zohor empat rakaat","Zohor, four rakaat",4],
  asar:["الْعَصْرِ أَرْبَعَ رَكَعَاتٍ","Asar empat rakaat","Asar, four rakaat",4], maghrib:["الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ","Maghrib tiga rakaat","Maghrib, three rakaat",3], isyak:["الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ","Isyak empat rakaat","Isyak, four rakaat",4]};
function practiceSteps(k){
  var B=BACAAN_SOLAT, P=PR_NIAT[k], n=P[3], out=[], AK="اللّٰهُ أَكْبَرُ";
  var add=function(r, pose, b, o){ o=o||{}; var ar=o.ar||b.ar, sayAr=o.rep?new Array(o.rep+1).join(ar+" . "):ar;
    out.push({r:r, p:pose, t:o.t||[b.t_ms,b.t_en], ar:ar, m:o.m||[b.ms,b.en], say:(o.pre?AK+" . ":"")+sayAr, note:o.note}); };
  for(var r=1;r<=n;r++){
    if(r===1){
      add(r,"stand",B[0],{t:["Niat","Intention"], ar:B[0].ar.replace("الظُّهْرِ أَرْبَعَ رَكَعَاتٍ",P[0]), m:[B[0].ms.replace("Zohor empat rakaat",P[1]), B[0].en.replace("Zohor, four rakaat",P[2])], note:["Niat di dalam hati. Melafazkannya ialah sunat.","The intention is in the heart. Saying it aloud is sunnah."]});
      add(r,"takbir",B[1]); add(r,"qiyam",B[2]);
    } else add(r,"takbir",B[1],{t:["Bangun ke rakaat "+r,"Rise for rakaat "+r], m:["Allah Maha Besar.","Allah is the Greatest."]});
    add(r,"qiyam",B[3]);
    if(r<=2) add(r,"qiyam",B[4]);
    add(r,"rukuk",B[5],{pre:1,rep:3,t:["Rukuk","Rukuk (bowing)"]});
    add(r,"stand",B[6]);
    if(k==="subuh" && r===2) add(r,"takbir",B[9],{t:["Qunut","Qunut"]});
    add(r,"sujud",B[7],{pre:1,rep:3,t:["Sujud pertama","First sujud"]});
    add(r,"sit",B[8],{pre:1});
    add(r,"sujud",B[7],{pre:1,rep:3,t:["Sujud kedua","Second sujud"]});
    if(r===2 && n>2) add(r,"sit",B[10],{pre:1});
    if(r===n){ add(r,"sit",B[10],{pre:1,t:["Tahiyat akhir","Final tashahhud"]}); add(r,"sit",B[11]); add(r,"sit",B[12]); add(r,"salam",B[13],{rep:2,t:["Salam ke kanan, kemudian ke kiri","Salam to the right, then the left"]}); }
  }
  return out;
}
function openPractice(){
  var ov=document.getElementById("overlay"), keys=["subuh","zohor","asar","maghrib","isyak"], k=null, steps=[], i=0, playing=false, auto=S.prAuto!==false, nx=0, closed=false;
  ov.className="pracov";
  var stopAll=function(){ clearTimeout(nx); speakStop(); };
  var close=function(){ closed=true; stopAll(); N.keepScreenOn(false,-1); closeOverlay(); };
  var pick=function(){ stopAll(); k=null;
    ov.innerHTML='<div class="prTop"><button class="prX" id="prX" aria-label="'+L2x("Tutup","Close")+'">✕</button><b>'+L2x("Latihan solat berpandu","Guided solat practice")+'</b><span></span></div>'+
      '<div class="prPick"><p>'+L2x("Pilih solat. Suara membaca setiap bacaan dalam bahasa Arab dan berhenti seketika supaya anda boleh mengikut.","Choose a prayer. The voice reads each part in Arabic and pauses so you can follow along.")+'</p>'+
      '<div class="prKs">'+keys.map(function(x){ return '<button class="prK" data-k="'+x+'"><b>'+T(x)+'</b><small>'+PR_NIAT[x][3]+' rakaat</small></button>'; }).join("")+'</div>'+
      '<div class="set"><span>'+L2x("Teruskan sendiri selepas setiap bacaan","Move on by itself after each part")+'</span>'+sw("prAuto",auto)+'</div>'+
      '<div class="mut small" style="margin-top:12px">'+L2x("Untuk belajar dan berlatih. Bilangan ayat tidak dibaca. Solat sebenar tidak memerlukan telefon.","For learning and practice. Ayat numbers are not read out. A real prayer needs no phone.")+'</div></div>';
    ov.querySelector("#prX").onclick=close;
    ov.querySelector("#prAuto").onchange=function(){ auto=this.checked; S.prAuto=auto; saveS(); };
    ov.querySelectorAll("[data-k]").forEach(function(b){ b.onclick=function(){ k=b.getAttribute("data-k"); steps=practiceSteps(k); i=0; playing=true; N.keepScreenOn(true,-1); show(); }; });
  };
  var show=function(){ if(closed) return; stopAll(); var s=steps[i], n=PR_NIAT[k][3];
    ov.innerHTML='<div class="prTop"><button class="prX" id="prX" aria-label="'+L2x("Kembali","Back")+'">‹</button><b>'+T(k)+' · '+L2x("Rakaat ","Rakaat ")+s.r+'/'+n+'</b><span>'+(i+1)+'/'+steps.length+'</span></div>'+
      '<div class="prBar"><i style="width:'+((i+1)/steps.length*100).toFixed(1)+'%"></i></div>'+
      '<div class="prBody"><div class="prPose">'+poseSvg(s.p)+'</div><div class="prT">'+esc(L2x(s.t[0],s.t[1]))+'</div>'+
      '<div class="ar prAr">'+s.ar+'</div>'+rumiDiv(s.ar)+'<div class="tr">'+esc(L2x(s.m[0],s.m[1]))+'</div>'+(s.note?'<div class="mut small" style="margin-top:6px">'+esc(L2x(s.note[0],s.note[1]))+'</div>':'')+'</div>'+
      '<div class="prCtl"><button id="prPrev" aria-label="'+L2x("Sebelum","Previous")+'"'+(i===0?" disabled":"")+'>⏮</button><button id="prPlay" class="big" aria-label="'+(playing?L2x("Jeda","Pause"):L2x("Main","Play"))+'">'+(playing?"⏸":"▶")+'</button><button id="prNext" aria-label="'+L2x("Seterusnya","Next")+'">⏭</button></div>';
    ov.querySelector("#prX").onclick=pick;
    ov.querySelector("#prPrev").onclick=function(){ if(i>0){ i--; show(); } };
    ov.querySelector("#prNext").onclick=function(){ next(); };
    ov.querySelector("#prPlay").onclick=function(){ playing=!playing; show(); };
    if(playing) speakThen(s.say, function(){ if(auto && playing && !closed) nx=setTimeout(next, 1400); });
  };
  var next=function(){ if(i<steps.length-1){ i++; show(); } else finish(); };
  var finish=function(){ stopAll(); playing=false;
    ov.innerHTML='<div class="prTop"><button class="prX" id="prX" aria-label="'+L2x("Tutup","Close")+'">✕</button><b>'+T(k)+'</b><span></span></div><div class="prDone"><div class="prDoneI">🤲</div><h2>'+L2x("Alhamdulillah, latihan selesai","Alhamdulillah, practice complete")+'</h2><p>'+L2x("Ulang beberapa kali sehingga anda hafal urutannya.","Repeat a few times until you know the order by heart.")+'</p>'+
      '<button class="btn gold full" id="prAgain">'+L2x("Ulang solat ini","Practise this prayer again")+'</button><button class="btn alt full" id="prOther" style="margin-top:8px">'+L2x("Pilih solat lain","Choose another prayer")+'</button></div>';
    ov.querySelector("#prX").onclick=close; ov.querySelector("#prAgain").onclick=function(){ i=0; playing=true; show(); }; ov.querySelector("#prOther").onclick=pick;
  };
  ov._close=function(){ if(k) pick(); else close(); };
  pick();
}

// ---------- TAWAF & SA'IE COUNTER (0.10.0) ----------
// A big tap counter for the real trip, with the doa for each stage from the Haji & Umrah guide. Survives closing the app.
var volHook=null;
// 0.5.23 (Nusuk style): live Umrah mode. Ten steps from ihram to tahallul, each with its doa (read aloud on 🔊), a progress bar,
// the time each step was done, and the tawaf / sa'ie counter opening at the right step. Progress is kept (ihsan_umrah_live) until reset.
var UMRAH_STEPS=[["ihram","🧺","Ihram di miqat","Ihram at the miqat","Mandi sunat, pakai pakaian ihram (lelaki: dua helai kain tidak berjahit), kemudian solat sunat ihram dua rakaat sebelum miqat.","Take the sunnah bath, put on the ihram (men: two unstitched sheets), then pray two rakaat for ihram before the miqat.",["solat_ihram"]],
  ["niat","🤍","Niat umrah","Intention of umrah","Di miqat, berniat umrah dalam hati dan lafazkan. Sejak itu pantang larang ihram bermula.","At the miqat, make the intention for umrah in your heart and say it. From now the ihram restrictions apply.",["niat_u"]],
  ["talbiah","📣","Talbiah","Talbiyah","Baca talbiah berulang-ulang sepanjang perjalanan ke Makkah (lelaki dengan suara jelas) hingga mula tawaf.","Recite the talbiyah again and again on the way to Makkah (men aloud) until you begin tawaf.",["talbiah"]],
  ["masuk","🕌","Masuk Masjidil Haram","Enter Masjid al-Haram","Masuk dengan kaki kanan dan baca doa masuk masjid. Bila melihat Kaabah, berdoalah.","Enter with your right foot and say the doa for entering the masjid. When you see the Kaabah, make doa.",["masuk","lihat_kaabah"]],
  ["tawaf","🔄","Tawaf 7 pusingan","Tawaf, 7 rounds","Mula di garisan Hajar Aswad, Kaabah di sebelah kiri. Istilam setiap pusingan. Gunakan kaunter.","Start at the Black Stone line with the Kaabah on your left. Raise your hand each round. Use the counter.",["niat_tawaf","istilam","rabbana"],"tawaf"],
  ["solat","🧎","Solat sunat tawaf","Two rakaat after tawaf","Jika boleh, di belakang Maqam Ibrahim; jika sesak, di mana-mana dalam masjid.","Behind Maqam Ibrahim if you can; if it is crowded, anywhere in the masjid.",["maqam","solat_tawaf"]],
  ["zamzam","💧","Minum air Zamzam","Drink Zamzam","Minum air Zamzam sambil berdoa.","Drink Zamzam water and make doa.",["zamzam"]],
  ["saie","🚶","Sa'ie 7 kali","Sa'i, 7 times","Mula di Bukit Safa dan tamat di Marwah. Di antara lampu hijau, lelaki berlari-lari anak. Gunakan kaunter.","Start at Safa and finish at Marwah. Between the green lights, men walk briskly. Use the counter.",["safa","safa_zikir","hijau","marwah"],"saie"],
  ["cukur","✂️","Tahallul: bercukur atau bergunting","Tahallul: shave or trim","Lelaki bercukur atau memendekkan rambut; wanita memotong sedikit hujung rambut. Umrah anda selesai.","Men shave or shorten their hair; women cut a little from the ends. Your umrah is complete.",["cukur"]]];
function umrahLive(){ withHajjData(function(){ var U=load("ihsan_umrah_live",null)||{i:0, t:{}}, ov=showSheet("🕋 "+L2x("Mod Umrah langsung","Live Umrah mode"), '<div id="ulB"></div>'), B=ov.querySelector("#ulB");
  N.keepScreenOn(true,-1);
  var doa=function(k){ var d=window.HJ_DOA&&HJ_DOA[k]; if(!d||!d.ar) return ''; return '<div class="ulDoa"><div class="row"><b>'+esc(L2x(d.t[0],d.t[1]))+'</b><button class="ib" data-uls="'+k+'">🔊</button></div><div class="ar">'+d.ar+'</div>'+(S.showRumi&&d.r?'<div class="rumi">'+esc(d.r)+'</div>':'')+(d.m?'<div class="tr">'+esc(L2x(d.m[0],d.m[1]))+'</div>':'')+'</div>'; };
  var draw=function(){ var n=UMRAH_STEPS.length, i=Math.min(U.i, n), done=i>=n, st=done?null:UMRAH_STEPS[i], pc=Math.round(i*100/n), tw=load("ihsan_tawaf",{m:"tawaf",n:0});
    var h='<div class="ulBar"><i style="width:'+pc+'%"></i></div><div class="mut small">'+i+' / '+n+' '+L2x("langkah selesai","steps done")+'</div>';
    if(done) h+='<div class="ulDone">🤍 '+L2x("Umrah selesai. Semoga Allah menerimanya, umrah yang mabrurah.","Umrah complete. May Allah accept it, a mabrur umrah.")+'</div><div class="btns"><button class="btn alt g3d" id="ulShare">↗ '+L2x("Kongsi","Share")+'</button><button class="btn alt g3d" id="ulReset">⟲ '+L2x("Umrah baharu","New umrah")+'</button></div>';
    else { h+='<div class="ulStep"><div class="ulIc">'+st[1]+'</div><div><small>'+L2x("Langkah ","Step ")+(i+1)+'</small><b>'+esc(L2x(st[2],st[3]))+'</b></div></div><p class="small" style="line-height:1.5">'+esc(L2x(st[4],st[5]))+'</p>'+st[6].map(doa).join("");
      if(st[7]) h+='<button class="btn gold full g3d" id="ulCnt" style="margin:8px 0">🔢 '+(st[7]==="tawaf"?L2x("Buka kaunter tawaf","Open the tawaf counter"):L2x("Buka kaunter sa'ie","Open the sa'i counter"))+(tw.m===st[7]&&tw.n?' · '+Math.min(7,tw.n)+'/7':'')+'</button>';
      h+='<div class="btns"><button class="btn alt g3d" id="ulBack"'+(i?'':' disabled')+'>‹ '+L2x("Kembali","Back")+'</button><button class="btn gold g3d" id="ulNext">✓ '+L2x("Selesai, seterusnya","Done, next")+'</button></div>'; }
    h+='<div class="ulList">'+UMRAH_STEPS.map(function(x, k){ var tm=U.t[x[0]]; return '<button class="ulLi'+(k<i?' ok':k===i?' cur':'')+'" data-ulg="'+k+'"><i>'+(k<i?'✓':x[1])+'</i><span>'+esc(L2x(x[2],x[3]))+'</span><small>'+(tm?new Date(tm).toLocaleTimeString(locTag(),{hour:"numeric",minute:"2-digit"}):'')+'</small></button>'; }).join("")+'</div>';
    B.innerHTML=h;
    B.querySelectorAll("[data-uls]").forEach(function(b){ b.onclick=function(){ speakAr(HJ_DOA[b.getAttribute("data-uls")].ar); }; });
    B.querySelectorAll("[data-ulg]").forEach(function(b){ b.onclick=function(){ U.i=+b.getAttribute("data-ulg"); save("ihsan_umrah_live",U); draw(); }; });
    var nx=B.querySelector("#ulNext"); if(nx) nx.onclick=function(){ U.t[st[0]]=Date.now(); U.i=i+1; if(st[0]==="ihram"||U.i===1) U.t0=U.t0||Date.now(); save("ihsan_umrah_live",U); N.vibrate(40); draw(); B.parentNode.scrollTop=0; };
    var bk=B.querySelector("#ulBack"); if(bk) bk.onclick=function(){ U.i=Math.max(0,i-1); save("ihsan_umrah_live",U); draw(); };
    var ct=B.querySelector("#ulCnt"); if(ct) ct.onclick=function(){ var T=load("ihsan_tawaf",{}); if(T.m!==st[7]){ T={m:st[7], n:0, t0:0}; save("ihsan_tawaf",T); } closeOverlay(); openTawaf(); };
    var rs=B.querySelector("#ulReset"); if(rs) rs.onclick=function(){ U={i:0, t:{}}; save("ihsan_umrah_live",U); draw(); };
    var sh=B.querySelector("#ulShare"); if(sh) sh.onclick=function(){ var t0=U.t.ihram||U.t0, t1=U.t.cukur, mins=t0&&t1?Math.round((t1-t0)/60000):0; var t="🕋 "+L2x("Alhamdulillah, umrah saya selesai","Alhamdulillah, my umrah is complete")+(mins?" ("+Math.floor(mins/60)+"h "+(mins%60)+"m)":"")+". "+L2x("Mohon doakan.","Please make doa for me.")+" · My Ihsan"; if(window.Native&&N.shareText) N.shareText(t); };
  };
  draw(); }); }
function withHajjData(cb){ if(window.HJ_DOA){ cb(); return; } var sc=document.createElement("script"); sc.src="hajj/hajj_data.js"; sc.onload=cb; sc.onerror=cb; document.body.appendChild(sc); }
function openTawaf(){
  withHajjData(function(){
    var ov=document.getElementById("overlay"), T7=load("ihsan_tawaf",{m:"tawaf",n:0,t0:0}), closed=false, tick=0;
    ov.className="tawafov"; N.keepScreenOn(true,-1); if(N.setVolumeKeys) N.setVolumeKeys(true);
    var D=function(key){ var d=window.HJ_DOA&&HJ_DOA[key]; if(!d||!d.ar) return ''; return '<div class="twDoa"><b>'+esc(L2x(d.t[0],d.t[1]))+'</b><div class="ar">'+d.ar+'</div>'+(S.showRumi&&d.r?'<div class="rumi">'+esc(d.r)+'</div>':'')+'<div class="tr">'+esc(L2x(d.m[0],d.m[1]))+'</div><div class="tools">'+sayBtn(d.ar)+'</div></div>'; };
    var guide=function(){ var n=T7.n, cur=n+1, h='';
      if(T7.m==="tawaf"){
        if(n===0) h='<p>'+L2x("Mula di garisan Hajar Aswad dengan Kaabah di sebelah kiri. Berniat, kemudian istilam: angkat tangan kanan ke arah Hajar Aswad.","Start at the Black Stone line with the Kaabah on your left. Make the intention, then raise your right hand towards the Black Stone (istilam).")+'</p>'+D("niat_tawaf")+D("istilam");
        else if(n<7) h='<p>'+L2x("Pusingan ke-"+cur+". Istilam setiap kali melintasi garisan Hajar Aswad. Baca apa-apa zikir atau doa yang anda tahu.","Round "+cur+". Raise your hand each time you pass the Black Stone line. Recite any dhikr or doa you know.")+(cur<=3?' '+L2x("Lelaki: berlari-lari anak (ramal) dalam tawaf umrah atau qudum.","Men: walk briskly with short steps (ramal) in the tawaf of umrah or arrival."):'')+'</p>'+D("rabbana")+D("istilam");
        else h='<p>'+L2x("Selesai tujuh pusingan. Jika boleh, solat sunat tawaf dua rakaat di belakang Maqam Ibrahim, kemudian minum air Zamzam.","Seven rounds done. If you can, pray two rakaat of tawaf behind Maqam Ibrahim, then drink Zamzam.")+'</p>'+D("maqam")+D("solat_tawaf")+D("zamzam");
      } else {
        if(n===0) h='<p>'+L2x("Mula di Bukit Safa. Hadap Kaabah, bertakbir dan berdoa, kemudian berjalan ke Marwah.","Start on Safa. Face the Kaabah, say takbir and make doa, then walk to Marwah.")+'</p>'+D("safa")+D("safa_zikir");
        else if(n<7) h='<p>'+(cur%2?L2x("Pusingan ke-"+cur+": Safa ke Marwah.","Round "+cur+": Safa to Marwah."):L2x("Pusingan ke-"+cur+": Marwah ke Safa.","Round "+cur+": Marwah to Safa."))+' '+L2x("Di antara lampu hijau, lelaki berlari-lari anak. Di atas bukit, hadap Kaabah dan berzikir.","Between the green lights, men jog. On each hill, face the Kaabah and make dhikr.")+'</p>'+D("hijau")+D("safa_zikir");
        else h='<p>'+L2x("Selesai di Marwah. Untuk umrah, bertahallul dengan bercukur atau menggunting rambut.","Finished at Marwah. For umrah, leave ihram by shaving or cutting the hair.")+'</p>'+D("cukur");
      }
      return h; };
    var ring=function(){ var n=T7.n, segs=''; for(var j=0;j<7;j++){ var a0=-90+j*360/7+2, a1=-90+(j+1)*360/7-2, r=92, x0=110+r*Math.cos(a0*Math.PI/180), y0=110+r*Math.sin(a0*Math.PI/180), x1=110+r*Math.cos(a1*Math.PI/180), y1=110+r*Math.sin(a1*Math.PI/180);
        segs+='<path d="M'+x0.toFixed(1)+' '+y0.toFixed(1)+' A'+r+' '+r+' 0 0 1 '+x1.toFixed(1)+' '+y1.toFixed(1)+'" class="'+(j<n?"on":"")+'"/>'; }
      var sub = T7.m==="saie" ? (n>=7?L2x("Selesai di Marwah","Done at Marwah"):((n+1)%2?L2x("Safa → Marwah","Safa → Marwah"):L2x("Marwah → Safa","Marwah → Safa"))) : (n>=7?L2x("Tawaf selesai","Tawaf complete"):L2x("Pusingan ke-"+(n+1),"Round "+(n+1)));
      return '<svg viewBox="0 0 220 220" class="twSvg">'+segs+'</svg><span class="twN">'+n+'<small>/7</small></span><span class="twSub">'+esc(sub)+'</span>'; };
    var mins=function(){ return T7.t0 ? Math.max(0,Math.round((Date.now()-T7.t0)/60000)) : 0; };
    var draw=function(){ if(closed) return;
      ov.innerHTML='<div class="twTop"><button class="prX" id="twX" aria-label="'+L2x("Tutup","Close")+'">✕</button><b>'+L2x("Kaunter tawaf & sa'ie","Tawaf & sa'ie counter")+'</b><span id="twT">'+(T7.t0?mins()+" min":"")+'</span></div>'+
        '<div class="twSeg" role="group"><button data-m="tawaf" class="'+(T7.m==="tawaf"?"on":"")+'">Tawaf</button><button data-m="saie" class="'+(T7.m==="saie"?"on":"")+'">'+L2x("Sa'ie","Sa'i")+'</button></div>'+
        '<button class="twRing'+(T7.n>=7?" done":"")+'" id="twTap" aria-label="'+L2x("Tambah satu pusingan","Add one round")+'">'+ring()+'</button>'+
        '<div class="mut small twHint">'+L2x("Ketik bulatan atau tekan butang volum selepas setiap pusingan.","Tap the circle or press a volume button after each round.")+'</div>'+
        '<div class="twBtns"><button class="btn alt" id="twUndo"'+(T7.n?"":" disabled")+'>−1</button><button class="btn alt" id="twReset">'+L2x("Mula semula","Start over")+'</button></div>'+
        '<div class="twInfo">'+guide()+'</div>';
      ov.querySelector("#twX").onclick=close; ov.querySelector("#twTap").onclick=inc;
      ov.querySelector("#twUndo").onclick=function(){ if(T7.n>0){ T7.n--; save("ihsan_tawaf",T7); N.vibrate(30); draw(); } };
      ov.querySelector("#twReset").onclick=function(){ if(T7.n && !confirm(L2x("Kosongkan kiraan?","Clear the count?"))) return; T7.n=0; T7.t0=0; save("ihsan_tawaf",T7); draw(); };
      ov.querySelectorAll("[data-m]").forEach(function(b){ b.onclick=function(){ var m=b.getAttribute("data-m"); if(m===T7.m) return; if(T7.n && T7.n<7 && !confirm(L2x("Tukar dan kosongkan kiraan?","Switch and clear the count?"))) return; T7={m:m,n:0,t0:0}; save("ihsan_tawaf",T7); draw(); }; });
    };
    var inc=function(){ if(T7.n>=7) return; if(!T7.t0) T7.t0=Date.now(); T7.n++; save("ihsan_tawaf",T7);
      if(T7.n===7){ N.vibrate(600); toast(L2x("MasyaAllah, 7 pusingan selesai","MasyaAllah, 7 rounds done")); } else N.vibrate(60); draw(); };
    var close=function(){ closed=true; volHook=null; clearInterval(tick); if(N.setVolumeKeys) N.setVolumeKeys(false); N.keepScreenOn(false,-1); closeOverlay(); render(); };
    volHook=inc; ov._close=close; tick=setInterval(function(){ var t=ov.querySelector("#twT"); if(t&&T7.t0) t.textContent=mins()+" min"; }, 30000);
    draw();
  });
}

// ---------- 0.11.0 shared: in-app browser for official portals ----------
// 0.27.0: Friday khutbah of every state. Each row searches for that department's latest khutbah text, so a changed web address never breaks it.
var KHUTBAH=[["KUL","JAWI","Jabatan Agama Islam Wilayah Persekutuan"],["SGR","JAIS","Jabatan Agama Islam Selangor"],["JHR","JAINJ","Jabatan Agama Islam Negeri Johor"],["KDH","JHEAIK","Jabatan Hal Ehwal Agama Islam Negeri Kedah"],
  ["KTN","JAHEAIK","Jabatan Hal Ehwal Agama Islam Kelantan"],["MLK","JAIM","Jabatan Agama Islam Melaka"],["NSN","JHEAINS","Jabatan Hal Ehwal Agama Islam Negeri Sembilan"],["PHG","JAIP","Jabatan Agama Islam Pahang"],
  ["PRK","JAIPk","Jabatan Agama Islam Perak"],["PLS","JAIPs","Jabatan Hal Ehwal Agama Islam Perlis"],["PNG","JHEAIPP","Jabatan Hal Ehwal Agama Islam Pulau Pinang"],["SBH","JHEAINS","Jabatan Hal Ehwal Agama Islam Negeri Sabah"],
  ["SWK","JAIS Sarawak","Jabatan Agama Islam Sarawak"],["TRG","JHEAT","Jabatan Hal Ehwal Agama Terengganu"],["","JAKIM","Jabatan Kemajuan Islam Malaysia (teks khutbah seragam)"]];
function khutbahSheet(){
  var mine=S.state==="PJY"||S.state==="LBN"?"KUL":S.state, rows=KHUTBAH.slice().sort(function(a,b){ return (b[0]===mine)-(a[0]===mine); });
  var ov=showSheet("🕌 "+L2x("Khutbah Jumaat","Friday khutbah"), '<div class="mut small" style="margin-bottom:8px">'+L2x("Ketik negeri untuk membuka teks khutbah terkini daripada jabatan agama negeri itu.","Tap a state to open the latest khutbah text from that state's religious department.")+'</div>'+
    rows.map(function(r,i){ return '<button class="set g3d kbRow" data-kb="'+i+'"><span><b>'+esc(r[0]?STATES[r[0]]:"Malaysia")+'</b>'+(r[0]===mine?' <span class="badge">'+L2x("Negeri anda","Your state")+'</span>':'')+'<br><small class="mut">'+esc(r[1]+" · "+r[2])+'</small></span><span class="chev">↗</span></button>'; }).join(""));
  ov.querySelectorAll("[data-kb]").forEach(function(b){ b.onclick=function(){ var r=rows[+b.getAttribute("data-kb")]; openWeb("https://www.google.com/search?q="+encodeURIComponent("teks khutbah Jumaat terkini "+r[1]+" "+r[2]), "Khutbah "+r[1]); }; });
}
WG["sc-khutbah"]=scW("khutbah","🕌","Khutbah Jumaat","Friday khutbah","q-khutbah","Teks khutbah setiap negeri","Khutbah text for every state");
function openWeb(u, title){ if(window.Native && N.openWeb) N.openWeb(u, title||""); else N.openUrl(u); }
function strHash(s){ var h=0; s=String(s); for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return (h>>>0).toString(36); }
function downloadText(name, mime, text){ try{ var b=new Blob([text],{type:mime}), a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); a.remove(); }catch(e){} }

// ---------- SHARIAH STOCKS (idea 73) ----------
// The official list comes only from the Securities Commission (SAC), updated at the end of May and November.
// The app opens that list, keeps the person's own watchlist with the list date they checked, and offers a
// self-screen using the SC's published quantitative benchmarks (5% business activity, 33% cash, 33% debt).
var SC_LIST_URL="https://www.sc.com.my/permalink.aspx?id=A978BB30-65DB-4B26-97D5-DB4E14173A7D";
var SC_METHOD_URL="https://www.sc.com.my/permalink.aspx?id=A204B479-16C3-4AD0-85D7-66451C2CBAB0";
var SC_ACTS=[["Perbankan dan pinjaman konvensional","Conventional banking and lending"],["Insurans konvensional","Conventional insurance"],["Perjudian","Gambling"],["Arak dan aktiviti berkaitan","Liquor and related activities"],["Babi dan aktiviti berkaitan","Pork and related activities"],["Makanan dan minuman tidak halal, termasuk tanpa sijil halal","Non-halal food and drinks, including those without halal certification"],["Tembakau, rokok dan rokok elektronik","Tobacco, cigarettes and e-cigarettes"],["Faedah daripada akaun dan instrumen konvensional","Interest from conventional accounts and instruments"],["Dividen daripada pelaburan tidak patuh Syariah","Dividends from Shariah non-compliant investments"],["Hiburan tidak patuh Syariah","Shariah non-compliant entertainment"],["Dagangan saham dan pembrokeran saham","Share trading and stockbroking"],["Pawagam","Cinema"],["Sewa daripada aktiviti tidak patuh Syariah","Rent from Shariah non-compliant activities"]];
function scPeriod(d){ d=d||new Date(); var y=d.getFullYear(), m=d.getMonth()+1, dd=d.getDate();
  if(m===12 || (m===11 && dd>=25)) return y+"-11";
  if(m>=6 || (m===5 && dd>=25)) return y+"-05";
  return (y-1)+"-11"; }
function scPeriodName(p){ var a=String(p).split("-"); return (a[1]==="05"?L2x("Mei","May"):"Nov")+" "+a[0]; }
function openSaham(){
  var ov=document.getElementById("overlay"), D=load("ihsan_saham",{list:[], calc:{}}), cur=scPeriod(), add={s:"y"};
  D.list=D.list||[]; D.calc=D.calc||{};
  var sv=function(){ save("ihsan_saham", D); };
  var num=function(v){ v=String(v==null?"":v).replace(/,/g,"").trim(); return v===""?null:parseFloat(v); };
  var calcRes=function(){
    var c=D.calc, ti=num(c.ti), ni=num(c.ni), ta=num(c.ta), ca=num(c.ca), de=num(c.de), rows=[], all=true, any=false;
    var row=function(label, a, b, lim){ if(a==null||b==null||!(b>0)) return; any=true; var p=a/b*100, ok=p<lim; if(!ok) all=false;
      rows.push('<div class="shR '+(ok?"ok":"no")+'"><span>'+label+'</span><b>'+p.toFixed(1)+'%</b><em>'+(ok?"✓ ":"✗ ")+L2x("bawah ","under ")+lim+'%</em></div>'); };
    row(L2x("Pendapatan tidak patuh ÷ jumlah pendapatan","Non-compliant income ÷ total income"), ni, ti, 5);
    row(L2x("Tunai konvensional ÷ jumlah aset","Conventional cash ÷ total assets"), ca, ta, 33);
    row(L2x("Hutang berfaedah ÷ jumlah aset","Interest-bearing debt ÷ total assets"), de, ta, 33);
    if(!any) return '<div class="mut small">'+L2x("Isi angka dari laporan tahunan syarikat (unit yang sama, contohnya RM juta).","Fill in figures from the company's annual report (same unit, for example RM million).")+'</div>';
    return rows.join("")+'<div class="shV '+(all&&rows.length===3?"ok":(all?"":"no"))+'">'+(rows.length<3?L2x("Lengkapkan semua angka untuk keputusan penuh.","Fill in all the figures for a full result."):(all?L2x("✓ Lulus ketiga-tiga penanda aras kuantitatif SC","✓ Passes all three SC quantitative benchmarks"):L2x("✗ Tidak lulus sekurang-kurangnya satu penanda aras","✗ Fails at least one benchmark")))+'</div>';
  };
  var draw=function(){
    var en=en_(), h='<div class="prTop"><button class="prX" id="shX" aria-label="'+L2x("Tutup","Close")+'">✕</button><b>📈 '+L2x("Saham patuh Syariah","Shariah-compliant stocks")+'</b><span></span></div><div class="shBody">';
    h+='<div class="card"><h3>📋 '+L2x("Senarai rasmi Suruhanjaya Sekuriti","Official Securities Commission list")+'</h3><div class="small" style="line-height:1.5">'+
      L2x("Majlis Penasihat Syariah (SAC) Suruhanjaya Sekuriti menerbitkan senarai sekuriti patuh Syariah di Bursa Malaysia dua kali setahun, pada hujung Mei dan November. Senarai terkini: ","The Shariah Advisory Council (SAC) of the Securities Commission publishes the list of Shariah-compliant securities on Bursa Malaysia twice a year, at the end of May and November. Latest list: ")+'<b>'+scPeriodName(cur)+'</b>.</div>'+
      '<button class="btn gold full" id="shOpen" style="margin-top:10px">'+L2x("Buka senarai rasmi","Open the official list")+' ↗</button>'+
      '<div class="mut tiny" style="margin-top:6px">'+L2x("Dibuka dari laman sc.com.my. Pilih dokumen terkini dan cari nama syarikat.","Opens sc.com.my. Choose the latest document and look for the company name.")+'</div></div>';
    // watchlist
    h+='<div class="card"><h3>⭐ '+L2x("Saham saya","My stocks")+'</h3><div class="mut small">'+L2x("Simpan status yang anda semak dalam senarai rasmi. Aplikasi mengingatkan anda untuk menyemak semula selepas setiap kemas kini SC.","Save the status you checked in the official list. The app reminds you to check again after each SC update.")+'</div>'+
      '<div class="shAdd"><input id="shN" type="text" maxlength="40" placeholder="'+L2x("Nama atau kod saham","Stock name or code")+'"><div class="grp2"><button class="chip '+(add.s==="y"?"on":"")+'" data-sa="y">✓ '+L2x("Patuh","Compliant")+'</button><button class="chip '+(add.s==="n"?"on":"")+'" data-sa="n">✗ '+L2x("Tidak patuh","Non-compliant")+'</button></div><button class="btn alt full" id="shAddB">＋ '+L2x("Tambah","Add")+' ('+L2x("senarai ","list ")+scPeriodName(cur)+')</button></div>';
    if(D.list.length){
      var old=D.list.filter(function(x){ return x.p<cur; }).length;
      if(old) h+='<div class="shWarn">🔔 '+old+L2x(" saham perlu disemak semula dalam senarai "," stock(s) need checking again in the ")+scPeriodName(cur)+L2x(""," list")+'</div>';
      h+=D.list.map(function(x,i){ var stale=x.p<cur; return '<div class="shI'+(stale?' stale':'')+'"><span class="shS '+(x.s==="y"?"ok":"no")+'">'+(x.s==="y"?"✓":"✗")+'</span><div class="shT"><b>'+esc(x.n)+'</b><span class="mut tiny">'+(x.s==="y"?L2x("Patuh Syariah","Shariah-compliant"):L2x("Tidak patuh Syariah","Not Shariah-compliant"))+' · '+L2x("senarai ","list ")+scPeriodName(x.p)+(stale?' · <b class="warnT">'+L2x("semak semula","check again")+'</b>':'')+'</span></div>'+
        (stale?'<button class="chip" data-shk="'+i+'" title="'+L2x("Masih sama dalam senarai terkini","Still the same in the latest list")+'">✓ '+L2x("Sama","Same")+'</button><button class="chip" data-shf="'+i+'">⇄</button>':'')+'<button class="chip" data-shd="'+i+'" aria-label="'+L2x("Padam","Delete")+'">🗑</button></div>'; }).join("");
    }
    h+='</div>';
    // self-screen
    var c=D.calc, f=function(id, label){ return '<label class="shF"><span>'+label+'</span><input inputmode="decimal" data-cf="'+id+'" value="'+esc(c[id]==null?"":String(c[id]))+'" placeholder="0"></label>'; };
    h+='<div class="card"><h3>🧮 '+L2x("Saringan sendiri (kaedah SC)","Self-screen (SC method)")+'</h3><div class="mut small">'+L2x("Anggaran pembelajaran mengikut penanda aras kuantitatif yang diterbitkan SC. Gunakan angka dari laporan tahunan.","A learning estimate using the SC's published quantitative benchmarks. Use figures from the annual report.")+'</div>'+
      '<div class="shFs">'+f("ti",L2x("Jumlah pendapatan kumpulan","Group total income"))+f("ni",L2x("Pendapatan daripada aktiviti tidak patuh","Income from non-compliant activities"))+f("ta",L2x("Jumlah aset","Total assets"))+f("ca",L2x("Tunai dalam akaun konvensional","Cash in conventional accounts"))+f("de",L2x("Hutang berfaedah (bukan pembiayaan Islam atau sukuk)","Interest-bearing debt (not Islamic financing or sukuk)"))+'</div>'+
      '<div id="shRes">'+calcRes()+'</div>'+
      '<details class="small" style="margin-top:10px"><summary>'+L2x("Aktiviti yang dikira tidak patuh (had 5%)","Activities counted as non-compliant (5% limit)")+'</summary><ul class="ul" style="margin-top:6px">'+SC_ACTS.map(function(a){ return '<li>'+esc(en?a[1]:a[0])+'</li>'; }).join("")+'</ul></details>'+
      '<button class="chip" id="shMeth" style="margin-top:8px">'+L2x("Kaedah saringan penuh (SC)","Full screening method (SC)")+' ↗</button></div>';
    h+='<div class="card hdisc"><h3>⚖️ '+L2x("Bukan nasihat pelaburan","Not investment advice")+'</h3><div class="small">'+L2x("Status rasmi hanya daripada senarai SAC Suruhanjaya Sekuriti. SAC juga menilai aspek kualitatif seperti imej dan persepsi awam, jadi saringan sendiri boleh berbeza daripada status rasmi.","The official status comes only from the SAC list of the Securities Commission. The SAC also weighs qualitative points such as public image, so a self-screen can differ from the official status.")+'</div></div>';
    h+='</div>';
    ov.innerHTML=h;
    ov.querySelector("#shX").onclick=close;
    ov.querySelector("#shOpen").onclick=function(){ openWeb(SC_LIST_URL, L2x("Senarai patuh Syariah (SC)","Shariah-compliant list (SC)")); };
    ov.querySelector("#shMeth").onclick=function(){ openWeb(SC_METHOD_URL, L2x("Kaedah saringan SC","SC screening method")); };
    ov.querySelectorAll("[data-sa]").forEach(function(b){ b.onclick=function(){ add.s=b.getAttribute("data-sa"); ov.querySelectorAll("[data-sa]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
    ov.querySelector("#shAddB").onclick=function(){ var n=ov.querySelector("#shN").value.trim(); if(!n){ toast(L2x("Taip nama saham dahulu","Type the stock name first")); return; }
      D.list=D.list.filter(function(x){ return x.n.toLowerCase()!==n.toLowerCase(); }); D.list.unshift({n:n, s:add.s, p:cur}); sv(); draw(); };
    ov.querySelectorAll("[data-shk]").forEach(function(b){ b.onclick=function(){ D.list[+b.getAttribute("data-shk")].p=cur; sv(); draw(); }; });
    ov.querySelectorAll("[data-shf]").forEach(function(b){ b.onclick=function(){ var x=D.list[+b.getAttribute("data-shf")]; x.s=x.s==="y"?"n":"y"; x.p=cur; sv(); draw(); }; });
    ov.querySelectorAll("[data-shd]").forEach(function(b){ b.onclick=function(){ D.list.splice(+b.getAttribute("data-shd"),1); sv(); draw(); }; });
    ov.querySelectorAll("[data-cf]").forEach(function(inp){ inp.oninput=function(){ D.calc[inp.getAttribute("data-cf")]=inp.value; sv(); ov.querySelector("#shRes").innerHTML=calcRes(); }; });
  };
  var close=function(){ closeOverlay(); render(); };
  ov.className="pracov shmov"; ov._close=close; draw();
}

// ---------- LIVE MAKKAH & MADINAH (idea 75) ----------
// Opens live broadcasts on YouTube and shows the prayer times there (Umm al-Qura estimate) in the person's own time.
var HARAM=[{k:"makkah", ms:"Masjidil Haram, Makkah", en:"Masjid al-Haram, Makkah", lat:21.4225, lon:39.8262, q:"Makkah live"},
           {k:"madinah", ms:"Masjid Nabawi, Madinah", en:"Masjid an-Nabawi, Madinah", lat:24.4672, lon:39.6111, q:"Madinah live"}];
function domeIcon(){ return '<svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true"><rect x="6" y="18" width="5" height="38" fill="#e8e1cf"/><path d="M8.5 8l3 10h-6z" fill="#c9a646"/><rect x="53" y="18" width="5" height="38" fill="#e8e1cf"/><path d="M55.5 8l3 10h-6z" fill="#c9a646"/><rect x="14" y="38" width="36" height="18" fill="#e8e1cf"/><path d="M18 38a14 14 0 0 1 28 0z" fill="#1f9d63"/><rect x="31" y="14" width="2" height="10" fill="#c9a646"/><circle cx="32" cy="13" r="2" fill="#c9a646"/><rect x="28" y="46" width="8" height="10" rx="4" fill="#0e6b45"/></svg>'; }
function ksaDay(p, off){
  var k=new Date(Date.now()+3*36e5), y=k.getUTCFullYear(), m=k.getUTCMonth(), d=k.getUTCDate()+off;
  var loc=new Date(y, m, d), hj=hijriOf(new Date()), ram=hj && hj.m===9;
  var t=calcDay(loc, p.lat, p.lon, {fa:18.5, ia:0, im:ram?120:90, tz:3, ik:0});
  var at=function(hm0){ var a=hm0.split(":"); return Date.UTC(loc.getFullYear(), loc.getMonth(), loc.getDate(), +a[0], +a[1]) - 3*36e5; };
  return PR.map(function(k){ return {k:k, ksa:t[k], ms:at(t[k])}; });
}
function inStr(ms){ var m=Math.max(0,Math.round(ms/60000)), h=Math.floor(m/60); m=m%60; return (h?h+L2x(" jam "," h "):"")+m+L2x(" min"," min"); }
function vLive(el){
  var now=Date.now(), ksaNow=new Date(now+3*36e5), ksaHM=pad(ksaNow.getUTCHours())+":"+pad(ksaNow.getUTCMinutes());
  var h='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="lvBack">‹ '+T("learn")+'</button><b>📺 '+L2x("Siaran langsung Makkah & Madinah","Live Makkah & Madinah")+'</b><span></span></div>';
  HARAM.forEach(function(p){
    var list=ksaDay(p,0), nxt=list.filter(function(x){ return x.ms>now; })[0] || ksaDay(p,1)[0];
    h+='<div class="card lvC"><div class="lvH">'+(p.k==="makkah"?'<span class="lvI">'+kaabahIcon()+'</span>':'<span class="lvI">'+domeIcon()+'</span>')+'<div><b>'+esc(L2x(p.ms,p.en))+'</b><div class="mut small">'+L2x("Waktu di sana: ","Time there: ")+'<b class="lvClk">'+fmt12(ksaHM)+'</b></div></div></div>'+
      '<div class="lvN">'+L2x("Solat seterusnya di sana: ","Next prayer there: ")+'<b>'+T(nxt.k)+' '+fmt12(nxt.ksa)+'</b><br><span class="mut small">= '+hm12(nxt.ms)+' '+L2x("waktu anda","your time")+' · '+L2x("dalam ","in ")+inStr(nxt.ms-now)+'</span></div>'+
      '<table class="lvT"><tr><th></th><th>'+L2x("Di sana","There")+'</th><th>'+L2x("Waktu anda","Your time")+'</th></tr>'+list.map(function(x){ return '<tr'+(x===nxt?' class="on"':'')+'><td>'+T(x.k)+'</td><td>'+fmt12(x.ksa)+'</td><td>'+hm12(x.ms)+'</td></tr>'; }).join("")+'</table>'+
      '<button class="btn gold full" data-yt="'+esc(p.q)+'" style="margin-top:10px">▶ '+L2x("Tonton siaran langsung","Watch the live broadcast")+'</button></div>';
  });
  h+='<div class="btns" style="margin:0 0 10px"><button class="btn alt" id="lvRadio">🎧 '+L2x("Radio Al-Quran","Quran radio")+'</button></div>';
  h+='<div class="mut small" style="padding:0 4px 14px">'+L2x("Siaran langsung disediakan oleh saluran YouTube; aplikasi membuka carian siaran langsung di YouTube. Waktu solat di Makkah dan Madinah ialah anggaran kiraan (kaedah Umm al-Qura); masjid boleh berbeza beberapa minit.","Live broadcasts are provided by YouTube channels; the app opens a search for live streams on YouTube. Prayer times in Makkah and Madinah are calculated estimates (Umm al-Qura method); the mosques can differ by a few minutes.")+'</div>';
  el.innerHTML=h;
  el.querySelector("#lvBack").onclick=function(){ learnPg=null; render(); };
  el.querySelector("#lvRadio").onclick=function(){ if(window.IbMedia && IbMedia.filter) IbMedia.filter("quran"); learnPg="radio"; render(); document.getElementById("view").scrollTop=0; };
  el.querySelectorAll("[data-yt]").forEach(function(b){ b.onclick=function(){ N.openUrl("https://www.youtube.com/results?search_query="+encodeURIComponent(b.getAttribute("data-yt"))+"&sp=EgJAAQ%253D%253D"); }; });
  timers.push(setInterval(function(){ if(view!=="learn"||learnPg!=="live") return; var k=new Date(Date.now()+3*36e5), s=fmt12(pad(k.getUTCHours())+":"+pad(k.getUTCMinutes()));
    var c=el.querySelector(".lvClk"); if(c && c.textContent!==s){ var v=document.getElementById("view"), st=v.scrollTop; render(); v.scrollTop=st; } }, 15000));
}

// ---------- 0.3.1 SYNC TO THE PHONE'S CALENDAR (Google Calendar, Outlook, Samsung, Exchange…) ----------
// The app writes its items into a calendar chosen on the phone (Native.calSync via CalendarContract); that calendar's account
// syncs them to Google / Outlook. Re-syncing updates changed items and removes ones no longer there; only events this app
// made are touched. S.cs = {on, cal, calName, acc, ty:{is,ph,fast,pray,rem,meal,period,priv}, last, res}.
function csCfg(){ var c=S.cs||{}; c.ty=c.ty||{is:true, ph:true, fast:true, pray:false, rem:true, meal:true, period:false, priv:true}; return c; }
function csItems(){
  var c=csCfg(), ty=c.ty, out=[], base=new Date(); base.setHours(12,0,0,0);
  var day=function(k,ds,t,d,n){ out.push({k:k, day:ds, t:t, d:d||"", days:n||1}); };
  // Islamic days, public holidays (1 year), sunnah fasts (60 days): all-day
  if(ty.is||ty.ph||ty.fast){ for(var y=base.getFullYear(); y<=base.getFullYear()+1; y++){ if(!HOLIDAYS.some(function(hd){ return hd[0].slice(0,4)===String(y) && /Aidilfitri/.test(hd[1]) && !/anggaran/.test(hd[1]); })) addIslamicHolidays(y); }
    for(var i=0;i<366;i++){ var d=addDays(base,i), ds=ymd(d), h=hijriOf(d), keys=[], hs=hijriStr(h);
      var add=function(pfx,t){ var k=evKey(t); if(keys.some(function(x){ return x && k && (x.indexOf(k)>=0 || k.indexOf(x)>=0); })) return; keys.push(k); day(pfx+ds+"-"+strHash(t), ds, t, hs); };
      if(ty.is) islamicOn(d).forEach(function(x){ add("is-", "☪️ "+tr(x)); });
      if(ty.ph) holidaysOn(ds,false).forEach(function(x){ add("ph-", "🇲🇾 "+tr(x)); });
      if(ty.fast && i<60) sunnahFastOn(d).forEach(function(x){ add("fs-", "🌙 "+tr(x)); }); } }
  // prayer times (7 days): timed, from the start of each prayer to the next
  if(ty.pray){ var nx={subuh:"syuruk", zohor:"asar", asar:"maghrib", maghrib:"isyak"};
    for(var j=0;j<7;j++){ var dj=addDays(base,j), dsj=ymd(dj), t=getDay(dj);
      PR.forEach(function(k){ if(!t[k]) return; var s0=at(dsj,t[k]).getTime(), e0=nx[k]&&t[nx[k]] ? at(dsj,t[nx[k]]).getTime() : s0+60*60000;
        out.push({k:"pr-"+dsj+"-"+k, s:s0, e:Math.min(e0, s0+90*60000), t:"🕌 "+T((k==="zohor"&&dj.getDay()===5)?"jumaat":k)+" "+fmt12(t[k]), d:zoneShort()}); }); } }
  // reminders already worked out for notifications: bills, debts, birthdays, Majlis events & tasks, baby vaccines, workouts
  if(ty.rem){ try{ buildExtras().forEach(function(x){ if(/^(imsak|syuruk|end|tahajjud|mp|me|fast|qkahf|qyas|qmulk|qday|jn)/.test(x.id) || /^c[msa]p/.test(x.id)) return; /* 0.5.48: Care (health) reminders never go to an outside calendar */ out.push({k:"rm-"+x.id, s:x.t, e:x.t+30*60000, t:x.title, d:x.body||""}); }); }catch(e){} }
  // meal plan (Halal › Rancang)
  if(ty.meal){ var mp=load("ihsan_rcp_plan",{}), rs=load("ihsan_recipes",[]), t0=ymd(new Date());
    Object.keys(mp).forEach(function(ds){ if(ds<t0) return; (mp[ds]||[]).forEach(function(id){ var r=rs.filter(function(x){ return x.id===id; })[0]; if(r) day("ml-"+ds+"-"+id, ds, "🍽️ "+r.title, L2x("Menu dari My Ihsan","Menu from My Ihsan")); }); }); }
  // period (Kalendar › Haid): only when switched on; private titles unless the person chooses otherwise
  if(ty.period && window.PeriodView && !periodHidden()) out=out.concat(PeriodView.syncItems(perH(), ty.priv!==false));
  return out;
}
var csBusy=false;
function csRun(manual, cb){
  var c=csCfg();
  if(!(window.Native && N.calSync)){ if(manual) toast(L2x("Penyegerakan kalendar hanya dalam aplikasi telefon","Calendar sync works in the phone app")); return; }
  if(!N.hasPerm("calendar")){ if(!manual) return; var hp=function(p){ if(p.which!=="calendar") return; off("perm",hp); if(p.granted) csRun(true, cb); else toast(L2x("Perlu kebenaran kalendar","Calendar permission is needed")); }; on("perm",hp); N.requestPerm("calendar"); return; }
  if(!c.cal){ if(manual) csPick(cb); return; }
  if(csBusy) return; csBusy=true;
  var go_=function(){ var items=csItems(), id="cs"+Date.now(), h=function(r){ if(r.id!==id) return; off("calsync",h); csBusy=false;
      if(r.error){ if(manual) toast(L2x("Penyegerakan gagal: ","Sync failed: ")+r.error); return; }
      c.last=Date.now(); c.res=r; S.cs=c; saveS(); if(manual) toast("📅 "+L2x("Disegerakkan: ","Synced: ")+r.added+L2x(" baharu, "," new, ")+r.updated+L2x(" dikemas kini, "," updated, ")+r.removed+L2x(" dibuang"," removed")); if(cb) cb(r); };
    on("calsync",h); N.calSync(id, String(c.cal), JSON.stringify(items)); };
  if(c.ty.period && !window.PeriodView && !periodHidden()) loadJs(PERJS, go_, go_); else go_();
}
function csPick(cb){
  var l=[]; try{ l=JSON.parse(N.calList()||"[]"); }catch(e){}
  if(!l.length){ showSheet("📅 "+L2x("Tiada kalendar","No calendars"), '<div class="small" style="line-height:1.5">'+L2x("Tiada kalendar yang boleh ditulis pada telefon ini. Tambah akaun Google (Tetapan › Akaun) atau hidupkan \"Segerak kalendar\" dalam aplikasi Outlook, kemudian cuba lagi.","No writable calendars on this phone. Add a Google account (Settings › Accounts) or turn on \"Sync calendars\" in the Outlook app, then try again.")+'</div>'); return; }
  var kind=function(x){ var t=(x.type||"").toLowerCase(); return /google/.test(t)?"Google":/outlook|microsoft|exchange|office/.test(t)?"Outlook":/samsung/.test(t)?"Samsung":/local|phone/.test(t)?L2x("Telefon sahaja","Phone only"):x.type; };
  var ov=showSheet("📅 "+L2x("Pilih kalendar","Choose a calendar"), '<div class="mut small" style="margin-bottom:8px">'+L2x("Acara My Ihsan akan ditulis ke kalendar ini dan disegerakkan oleh akaunnya.","My Ihsan events will be written to this calendar and synced by its account.")+'</div>'+
    l.map(function(x,i){ return '<button class="hhist" data-csc="'+i+'"><span style="width:12px;height:12px;border-radius:50%;background:'+esc(x.color)+';flex:none"></span><span class="hhs"><b>'+esc(x.name)+'</b> · '+esc(kind(x))+'<br><small class="mut">'+esc(x.account||"")+'</small></span></button>'; }).join(""));
  ov.querySelectorAll("[data-csc]").forEach(function(b){ b.onclick=function(){ var x=l[+b.getAttribute("data-csc")], c=csCfg(); c.cal=x.id; c.calName=x.name; c.acc=x.account+" · "+kind(x); c.on=true; S.cs=c; saveS(); closeOverlay(); csRun(true, function(){ render(); if(cb) cb(); }); }; });
}
function csCard(){
  var c=csCfg(), ty=c.ty, chip=function(k,ic,ms,en){ return '<button class="chip'+(ty[k]?' on':'')+'" data-cst="'+k+'">'+ic+' '+L2x(ms,en)+'</button>'; };
  return '<div class="card cscard"><h3>📅 '+L2x("Segerak ke Google / Outlook","Sync to Google / Outlook")+'</h3>'+
    '<div class="small" style="line-height:1.45">'+(c.on&&c.cal?'✅ '+esc(c.calName||"")+' <span class="mut">('+esc(c.acc||"")+')</span>'+(c.last?'<br><span class="mut tiny">'+L2x("Terakhir: ","Last: ")+new Date(c.last).toLocaleString(locTag(),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})+(c.res?' · '+(c.res.added+c.res.updated+c.res.kept)+L2x(" acara"," events"):'')+'</span>':''):L2x("Tulis hari Islam, cuti, puasa sunat, peringatan, menu dan lain-lain ke kalendar telefon anda; akaun Google atau Outlook menyegerakkannya ke mana-mana peranti.","Write Islamic days, holidays, sunnah fasts, reminders, menus and more into your phone's calendar; its Google or Outlook account syncs them everywhere."))+'</div>'+
    '<div class="rseg" style="margin:10px 0 6px;display:flex;flex-wrap:wrap;gap:6px">'+chip("is","☪️","Hari Islam","Islamic days")+chip("ph","🇲🇾","Cuti umum","Public holidays")+chip("fast","🌙","Puasa sunat","Sunnah fasts")+chip("rem","🔔","Peringatan","Reminders")+chip("meal","🍽️","Menu dirancang","Planned meals")+chip("pray","🕌","Waktu solat (7 hari)","Prayer times (7 days)")+(periodHidden()?'':chip("period","🌸","Haid (jangkaan)","Period (expected)")+(ty.period?chip("priv","🔒","Tajuk peribadi","Private titles"):''))+'</div>'+
    (ty.rem?'<div class="mut tiny" style="margin:-2px 0 6px">🔔 '+L2x("Peringatan: bil & hutang, hari lahir, majlis & tugasan, vaksin bayi, senaman (10 hari ke depan).","Reminders: bills & debts, birthdays, events & tasks, baby vaccines, workouts (next 10 days).")+'</div>':'')+
    (ty.period&&!ty.priv?'<div class="mut tiny" style="margin-bottom:6px">⚠ '+L2x("Tajuk haid akan kelihatan kepada sesiapa yang berkongsi kalendar ini.","Period titles will be visible to anyone this calendar is shared with.")+'</div>':'')+
    '<div class="btns">'+(c.on&&c.cal?'<button class="btn gold" id="csNow">🔄 '+L2x("Segerak sekarang","Sync now")+'</button><button class="btn alt" id="csPick">'+L2x("Tukar kalendar","Change calendar")+'</button><button class="btn delb" id="csOff">🗑 '+L2x("Buang dari kalendar","Remove from calendar")+'</button>':'<button class="btn gold" id="csOn">📅 '+L2x("Pilih kalendar & hidupkan","Choose a calendar & turn on")+'</button>')+'</div>'+
    '<details class="small" style="margin-top:8px"><summary class="mut">'+L2x("Google, Outlook & cara ia berfungsi","Google, Outlook & how it works")+'</summary><div class="mut" style="line-height:1.45;margin-top:6px">'+
    L2x("Google: akaun Google mesti ada pada telefon (Tetapan › Akaun). Outlook: dalam aplikasi Outlook, buka Tetapan › akaun anda › hidupkan \"Segerak kalendar\", kemudian pilih kalendar Outlook di sini. Aplikasi menyegerak secara automatik apabila dibuka (paling kerap setiap 6 jam) dan hanya mengubah acara yang dibuatnya sendiri.","Google: the Google account must be on the phone (Settings › Accounts). Outlook: in the Outlook app open Settings › your account › turn on \"Sync calendars\", then choose the Outlook calendar here. The app syncs by itself when opened (at most every 6 hours) and only changes events it made itself.")+'</div></details></div>';
}
function bindCs(el){
  el.querySelectorAll("[data-cst]").forEach(function(b){ b.onclick=function(){ var c=csCfg(), k=b.getAttribute("data-cst"); c.ty[k]=!c.ty[k]; S.cs=c; saveS(); render();
    if(c.on && c.cal && window.Native && N.calSync) csRun(false, function(r){ if(!c.ty[k] && r && r.removed) toast("🗑 "+L2x("Dibuang dari kalendar: ","Removed from the calendar: ")+r.removed); }); }; });   // 0.6.73: switching a type off removes it from the calendar at once
  var on_=el.querySelector("#csOn"); if(on_) on_.onclick=function(){ csRun(true); };
  var nw=el.querySelector("#csNow"); if(nw) nw.onclick=function(){ csRun(true, function(){ render(); }); };
  var pk=el.querySelector("#csPick"); if(pk) pk.onclick=function(){ csPick(); };
  var of=el.querySelector("#csOff"); if(of) of.onclick=function(){ var c=csCfg(); if(!c.cal || !(window.Native && N.calSync)) return; if(!confirm(L2x("Buang semua acara My Ihsan daripada kalendar ","Remove all My Ihsan events from the calendar ")+(c.calName||"")+L2x(" dan hentikan penyegerakan?","and stop syncing?"))) return; var id="cs"+Date.now(), h=function(r){ if(r.id!==id) return; off("calsync",h); toast(L2x("Acara My Ihsan dibuang: ","My Ihsan events removed: ")+(r.removed||0)); }; on("calsync",h); N.calSync(id, String(c.cal), "[]"); c.on=false; S.cs=c; saveS(); render(); };
}
on("resume", function(){ var c=csCfg(); if(c.on && c.cal && Date.now()-(c.last||0) > 6*36e5) csRun(false); });
// 0.6.71 (owner): when a newer version is out on Google Play and there is internet, the app asks to update. Only for copies installed from
// Play (dev APKs are never blocked). https://myihsan.app/version.json = {vc, v, min, ms, en}; below "min" the update must be done.
var UPD_URL="https://myihsan.app/version.json", PLAY_ID="com.myihsan.myapp", updBlock=false;
// 0.7.13 backup address: some office / school Wi-Fi firewalls block myihsan.app. The same site is copied every hour to
// https://ihsanrahim.github.io/My-Ihsan-Wifi/ (repo My-Ihsan-Wifi); links from the app try myihsan.app first and switch when it does not answer.
var SITE_MAIN="https://myihsan.app/", SITE_ALT="https://ihsanrahim.github.io/My-Ihsan-Wifi/", SITE_GO=SITE_ALT+"go/", siteNow=null, siteAt=0;   // SITE_GO = the one link to share: myihsan.app when reachable, else the backup
function siteBase(cb){ if(siteNow && Date.now()-siteAt<6e5) return cb(siteNow); var done=false, fin=function(b){ if(done) return; done=true; siteNow=b; siteAt=Date.now(); cb(b); };
  var tm=setTimeout(function(){ fin(SITE_ALT); }, 4000); nFetch(SITE_MAIN+"version.json?t="+Date.now(), function(st){ clearTimeout(tm); fin(st===200?SITE_MAIN:SITE_ALT); }); }
function updCheck(force){ if(!(window.Native && N.info)) return; var i={}; try{ i=JSON.parse(N.info()); }catch(e){} if(!i.vc || (i.installer!=="com.android.vending" && !window.__UPD_ANY)) return;
  var last=+(load("ihsan_updchk",0)||0); if(!force && Date.now()-last<6*36e5) return; save("ihsan_updchk", Date.now());
  var got=function(st, body){ if(st!==200) return; var j=null; try{ j=JSON.parse(body); }catch(e){} if(!j || !(+j.vc>i.vc)) return; updShow(j, i.vc < +(j.min||j.vc)); };
  nFetch(UPD_URL+"?t="+Date.now(), function(st, body){ if(st===200) got(st, body); else nFetch(SITE_ALT+"version.json?t="+Date.now(), got); }); }
function updShow(j, must){ if(document.getElementById("updOv")) return; if(!must && load("ihsan_updlater","")===String(j.vc)+":"+ymd(new Date())) return;
  updBlock=must; var o=document.createElement("div"); o.id="updOv"; o.className="updOv";
  o.innerHTML='<div class="card updC"><div class="updI">⬆️</div><h3>'+(must?L2x("Kemas kini diperlukan","Update needed"):L2x("Versi baharu tersedia","A new version is ready"))+'</h3><div class="mut">My Ihsan '+esc(j.v||"")+'</div>'+
    (j.ms||j.en?'<div class="small" style="margin:8px 0;text-align:left;white-space:pre-line">'+esc(L2x(j.ms||j.en||"", j.en||j.ms||""))+'</div>':'')+
    '<div class="mut tiny">'+(must?L2x("Versi ini perlu dikemas kini untuk terus digunakan.","This version needs updating to keep using the app."):L2x("Kemas kini untuk ciri dan pembetulan terbaru.","Update for the latest features and fixes."))+'</div>'+
    '<button class="btn gold full g3d" id="updGo" style="margin-top:12px">⬆️ '+L2x("Kemas kini di Play Store","Update on the Play Store")+'</button>'+(must?'':'<button class="btn alt full" id="updLt" style="margin-top:8px">'+L2x("Nanti","Later")+'</button>')+'</div>';
  document.body.appendChild(o);
  o.querySelector("#updGo").onclick=function(){ var u="market://details?id="+PLAY_ID; try{ N.openUrl(u); }catch(e){ window.open("https://play.google.com/store/apps/details?id="+PLAY_ID); } };
  var lt=o.querySelector("#updLt"); if(lt) lt.onclick=function(){ save("ihsan_updlater", String(j.vc)+":"+ymd(new Date())); o.remove(); updBlock=false; }; }
setTimeout(function(){ updCheck(false); }, 8000);
on("resume", function(){ var o=document.getElementById("updOv"); if(o && !updBlock) return; if(o){ o.remove(); } updCheck(true); });
setTimeout(function(){ var c=csCfg(); if(c.on && c.cal && Date.now()-(c.last||0) > 6*36e5) csRun(false); }, 4000);

// ---------- CALENDAR EXPORT + MONTHLY TIMETABLE (idea 74) ----------
function icsEsc(s){ return String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n"); }
function icsFold(line){ var out=[], s=line; while(s.length>73){ out.push(s.slice(0,73)); s=" "+s.slice(73); } out.push(s); return out.join("\r\n"); }
function evKey(t){ return String(t).toLowerCase().replace(/\(.*?\)/g,"").replace(/hari raya|hari kedua/g,"").replace(/[^a-z]/g,""); }
function buildIcs(o){
  var L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//My Ihsan//Calendar 0.11//MS","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:"+icsEsc(L2x("My Ihsan: hari Islam","My Ihsan: Islamic days"))];
  var stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,""), n=0, start=new Date(); start.setHours(12,0,0,0);
  var end=addDays(start, o.m===6?183:366);
  for(var y=start.getFullYear(); y<=end.getFullYear(); y++){ if(!HOLIDAYS.some(function(hd){ return hd[0].slice(0,4)===String(y) && /Aidilfitri/.test(hd[1]) && !/anggaran/.test(hd[1]); })) addIslamicHolidays(y); }
  for(var d=new Date(start); d<end; d=addDays(d,1)){
    var ds=ymd(d), ev=[], keys=[], h=hijriOf(d), est=h && h.src!=="jakim";
    var push=function(t){ var k=evKey(t); if(keys.some(function(x){ return x && k && (x.indexOf(k)>=0 || k.indexOf(x)>=0); })) return; keys.push(k); ev.push(t); };
    if(o.is) islamicOn(d).forEach(function(x){ push(tr(x)); });
    if(o.ph) holidaysOn(ds,false).forEach(function(x){ push(tr(x)); });
    if(o.bidh||o.mk) sunnahFastOn(d).forEach(function(x){ var mk=/Isnin|Khamis/.test(x.ms); if(mk?o.mk:o.bidh) push(tr(x)); });
    ev.forEach(function(t){ n++; var d1=ds.replace(/-/g,""), d2=ymd(addDays(d,1)).replace(/-/g,"");
      L.push("BEGIN:VEVENT","UID:"+d1+"-"+strHash(t)+"@my.ihsan.app","DTSTAMP:"+stamp,"DTSTART;VALUE=DATE:"+d1,"DTEND;VALUE=DATE:"+d2,
        "SUMMARY:"+icsEsc(t),"DESCRIPTION:"+icsEsc(hijriStr(h)+(est?" ("+L2x("tarikh Hijrah anggaran","estimated Hijri date")+")":"")),"TRANSP:TRANSPARENT","END:VEVENT"); });
  }
  L.push("END:VCALENDAR");
  return {text:L.map(icsFold).join("\r\n")+"\r\n", n:n};
}
function icsOut(o, share){
  var r=buildIcs(o); if(!r.n){ toast(L2x("Pilih sekurang-kurangnya satu jenis","Choose at least one type")); return; }
  var name="my-ihsan-"+ymd(new Date())+".ics";
  if(window.Native && N.openTextFile){
    var h=function(x){ off("fileOpen",h); if(!x.ok && !share){ toast(L2x("Tiada aplikasi kalendar yang boleh membuka fail ini. Kongsi fail itu, kemudian import di Google Calendar.","No calendar app here can open this file. Share it, then import it in Google Calendar.")); N.openTextFile(name,"text/calendar",r.text,true); } };
    on("fileOpen",h); N.openTextFile(name,"text/calendar",r.text,!!share);
  } else downloadText(name,"text/calendar",r.text);
  toast(r.n+L2x(" acara disediakan"," events prepared"));
}
function calExportSheet(){
  var o=load("ihsan_icsopt",{is:true, ph:true, bidh:true, mk:false, m:12}), en=en_(), MO=en?ME:MS;
  var tm=cal.mode==="h"?parseYmd(cal.sel):new Date(cal.y==null?new Date().getFullYear():cal.y, cal.m==null?new Date().getMonth():cal.m, 1);
  var tg=function(k,label){ return '<button class="chip '+(o[k]?"on":"")+'" data-ix="'+k+'">'+label+'</button>'; };
  var body='<div class="small" style="margin-bottom:6px">'+L2x("Masukkan hari kebesaran, cuti dan puasa sunat ke dalam aplikasi kalendar telefon anda (fail .ics).","Add Islamic days, holidays and sunnah fasts to your phone's calendar app (.ics file).")+'</div>'+
    '<div class="chips" style="flex-wrap:wrap">'+tg("is",L2x("Hari kebesaran Islam","Islamic days"))+tg("ph",L2x("Cuti umum (negeri saya)","Public holidays (my state)"))+tg("bidh","Ayyamul Bidh")+tg("mk",L2x("Isnin & Khamis","Mon & Thu"))+'</div>'+
    '<div class="set"><span>'+L2x("Tempoh","Period")+'</span>'+chipSet("data-im",o.m,[[6,L2x("6 bulan","6 months")],[12,L2x("12 bulan","12 months")]])+'</div>'+
    '<div class="btns"><button class="btn gold" id="ixOpen">📅 '+L2x("Buka dalam kalendar","Open in calendar")+'</button><button class="btn alt" id="ixShare">📤 '+L2x("Kongsi fail","Share file")+'</button></div>'+
    '<div class="mut tiny" style="margin-top:6px">'+L2x("Tarikh Hijrah masa depan ialah anggaran sehingga pengisytiharan rasmi.","Future Hijri dates are estimates until the official announcement.")+'</div>'+
    '<h3 style="margin:16px 0 6px">🕌 '+L2x("Jadual waktu solat bulanan","Monthly prayer timetable")+'</h3><div class="small">'+L2x("Gambar jadual ","A timetable image for ")+'<b>'+MO[tm.getMonth()]+' '+tm.getFullYear()+'</b>'+L2x(" untuk zon anda, sedia untuk dikongsi atau dicetak."," for your zone, ready to share or print.")+'</div>'+
    '<button class="btn alt full" id="ixTt" style="margin-top:8px">🖼 '+L2x("Buat gambar jadual","Make the timetable image")+'</button>';
  var ov=showSheet("⇪ "+L2x("Eksport","Export"), body);
  var sv=function(){ save("ihsan_icsopt",o); };
  ov.querySelectorAll("[data-ix]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-ix"); o[k]=!o[k]; b.classList.toggle("on",o[k]); sv(); }; });
  ov.querySelectorAll("[data-im]").forEach(function(b){ b.onclick=function(){ o.m=+b.getAttribute("data-im"); ov.querySelectorAll("[data-im]").forEach(function(x){ x.classList.toggle("on",x===b); }); sv(); }; });
  ov.querySelector("#ixOpen").onclick=function(){ icsOut(o,false); };
  ov.querySelector("#ixShare").onclick=function(){ icsOut(o,true); };
  ov.querySelector("#ixTt").onclick=function(){ timetableImage(tm.getFullYear(), tm.getMonth()); };
}
function timetableImage(y, m){
  var en=en_(), MO=en?ME:MS, WD=en?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]:["Ahd","Isn","Sel","Rab","Kha","Jum","Sab"], dim=new Date(y,m+1,0).getDate(), rows=[], jk=true, tds=ymd(new Date());
  for(var d=1; d<=dim; d++){ var dt=new Date(y,m,d), t=getDay(dt); if(t.src!=="jakim") jk=false; rows.push({dt:dt, t:t, h:hijriOf(dt)}); }
  var cols=["imsak","subuh","syuruk","zohor","asar","maghrib","isyak"], W=1080, top=250, rh=50, Hh=top+rh*(dim+1)+170;
  var cv=document.createElement("canvas"); cv.width=W; cv.height=Hh; var x=cv.getContext("2d");
  var g=x.createLinearGradient(0,0,0,Hh); g.addColorStop(0,"#0e6b45"); g.addColorStop(1,"#07130d"); x.fillStyle=g; x.fillRect(0,0,W,Hh);
  x.strokeStyle="#c9a646"; x.lineWidth=5; x.strokeRect(30,30,W-60,Hh-60);
  var h1=rows[0].h, h2=rows[dim-1].h, z=overseasNow()?L2x("Lokasi semasa","Current location"):(S.zone+" · "+zoneById(S.zone)[2]);
  x.textAlign="center"; x.fillStyle="#c9a646"; x.font="700 46px sans-serif"; x.fillText(L2x("Waktu Solat ","Prayer Times ")+MO[m]+" "+y, W/2, 100);
  x.fillStyle="#e8efe9"; x.font="26px sans-serif"; var zl=wrapLines(x, z, W-160); x.fillText(zl[0], W/2, 145);
  if(h1&&h2){ x.fillStyle="#c9a646"; x.font="24px sans-serif"; x.fillText(HIJRI_MONTHS[h1.m-1]+(h1.m!==h2.m?" – "+HIJRI_MONTHS[h2.m-1]:"")+" "+h2.y+"H", W/2, 185); }
  var cx=[60,172], cw=(W-60-305)/7, HS=["Muh","Saf","R.Awal","R.Akhir","J.Awal","J.Akhir","Rejab","Syaaban","Ramadan","Syawal","Zulkaedah","Zulhijjah"]; for(var i=0;i<7;i++) cx.push(305+i*cw);
  var head=[L2x("Tarikh","Date"),L2x("Hijrah","Hijri")].concat(cols.map(function(k){ return k==="imsak"?"Imsak":k==="syuruk"?L2x("Syuruk","Sunrise"):T(k); }));
  x.fillStyle="#c9a646"; x.font="700 22px sans-serif";
  head.forEach(function(t,i){ x.textAlign=i<2?"left":"center"; x.fillText(t, i<2?cx[i]:cx[i]+cw/2, top); });
  var t12=function(hm0){ if(!hm0) return "--"; var a=hm0.split(":"), hh=+a[0]%12||12; return hh+":"+a[1]; };
  rows.forEach(function(r,i){ var yy=top+rh*(i+1), fri=r.dt.getDay()===5, td=ymd(r.dt)===tds;
    if(fri){ x.fillStyle="rgba(201,166,70,.18)"; x.fillRect(44,yy-rh+14,W-88,rh); }
    else if(i%2){ x.fillStyle="rgba(255,255,255,.05)"; x.fillRect(44,yy-rh+14,W-88,rh); }
    if(td){ x.strokeStyle="#ffffff"; x.lineWidth=2; x.strokeRect(46,yy-rh+15,W-92,rh-2); }
    x.fillStyle="#ffffff"; x.font=(fri?"700 ":"")+"24px sans-serif"; x.textAlign="left";
    x.fillText(r.dt.getDate()+" "+WD[r.dt.getDay()], cx[0], yy);
    x.fillStyle="#c9d8cd"; x.font="22px sans-serif"; x.fillText(r.h?(r.h.d+((r.h.d===1||i===0)?" "+HS[r.h.m-1]:"")):"", cx[1], yy);
    x.fillStyle="#ffffff"; x.font="24px sans-serif"; x.textAlign="center";
    cols.forEach(function(k,j){ x.fillText(t12(r.t[k]), cx[j+2]+cw/2, yy); });
  });
  x.textAlign="center"; x.fillStyle="#a9b8ae"; x.font="italic 22px sans-serif";
  x.fillText((jk?L2x("Sumber: JAKIM e-Solat","Source: JAKIM e-Solat"):L2x("Sebahagian waktu ialah anggaran kiraan (data JAKIM belum dimuat)","Some times are calculated estimates (JAKIM data not loaded)"))+" · "+L2x("format 12 jam","12-hour format"), W/2, Hh-105);
  x.fillStyle="#c9a646"; x.font="600 28px sans-serif"; x.fillText("My Ihsan", W/2, Hh-62);
  var url=cv.toDataURL("image/png"), txt=L2x("Waktu Solat ","Prayer Times ")+MO[m]+" "+y+" · "+z;
  if(window.Native && N.shareImage) N.shareImage(url, txt);
  else { var a=document.createElement("a"); a.href=url; a.download="waktu-solat-"+y+"-"+pad(m+1)+".png"; document.body.appendChild(a); a.click(); a.remove(); }
}

// ================= 0.13.0: family & personal (ideas 76 to 80) and auto silent at the masjid (62) =================
// ---------- parent PIN: used by the kids lock (77) and the journal lock (80) ----------
function pinData(){ return load("ihsan_pin",null); }
function pinHas(){ var p=pinData(); return !!(p && p.h); }
function pinHash(pin, salt){ return strHash(salt+"|"+pin+"|ibadah")+strHash(pin+"#"+salt+"#"+pin.length); }
function pinPad(title, sub, check, extra){
  var ov=showSheet(title, '<div class="mut small" style="text-align:center">'+sub+'</div><div class="pinDots" id="pinD"><i></i><i></i><i></i><i></i></div><div class="pinErr" id="pinE"></div>'+
    '<div class="pinPad">'+["1","2","3","4","5","6","7","8","9","⌫","0","✓"].map(function(k){ return '<button data-pk="'+k+'"'+(k==="✓"?' class="ok"':'')+'>'+k+'</button>'; }).join("")+'</div>'+(extra||''));
  var v="", D=ov.querySelectorAll("#pinD i"), E=ov.querySelector("#pinE"), box=ov.querySelector("#pinD");
  var draw=function(){ Array.prototype.forEach.call(D,function(d,i){ d.classList.toggle("on", i<v.length); }); };
  var submit=function(){ if(v.length<4){ E.textContent=L2x("Masukkan 4 angka","Enter 4 digits"); return; } var r=check(v); if(r===true) return; E.textContent=r||""; v=""; draw(); box.classList.add("shake"); setTimeout(function(){ box.classList.remove("shake"); },420); N.vibrate(80); };
  Array.prototype.forEach.call(ov.querySelectorAll("[data-pk]"), function(b){ b.onclick=function(){ var k=b.getAttribute("data-pk");
    if(k==="⌫") v=v.slice(0,-1); else if(k==="✓"){ submit(); return; } else if(v.length<4){ v+=k; if(v.length===4){ draw(); setTimeout(submit,150); return; } }
    E.textContent=""; draw(); }; });
  return ov;
}
function pinSet(done){
  var first="";
  pinPad("🔐 "+L2x("Tetapkan PIN ibu bapa","Set a parent PIN"), L2x("Pilih 4 angka yang anak tidak tahu.","Choose 4 digits your child does not know."), function(p){
    first=p;
    setTimeout(function(){ pinPad("🔐 "+L2x("Sahkan PIN","Confirm the PIN"), L2x("Masukkan PIN yang sama sekali lagi.","Enter the same PIN again."), function(p2){
      if(p2!==first) return L2x("PIN tidak sama. Cuba lagi.","The PINs do not match. Try again.");
      var salt=Date.now().toString(36); save("ihsan_pin",{h:pinHash(p2,salt), s:salt}); closeOverlay(); toast(L2x("PIN disimpan","PIN saved")); if(done) done(); return true; }); },0);
    return true; });
}
function pinAsk(title, ok){
  if(!pinHas()){ ok(); return; }
  var P=pinData();
  var ov=pinPad("🔒 "+title, L2x("Masukkan PIN ibu bapa","Enter the parent PIN"), function(p){ if(pinHash(p,P.s)===P.h){ closeOverlay(); ok(); return true; } return L2x("PIN salah","Wrong PIN"); },
    '<button class="chip" id="pinF" style="display:block;margin:10px auto 0">'+L2x("Lupa PIN?","Forgot the PIN?")+'</button>');
  ov.querySelector("#pinF").onclick=function(){
    var a=12+Math.floor(Math.random()*8), b=6+Math.floor(Math.random()*4);
    var o2=showSheet("🔐 "+L2x("Lupa PIN","Forgot the PIN"), '<div class="small" style="line-height:1.5">'+L2x("Untuk ibu bapa: jawab soalan ini untuk menetapkan PIN baharu.","For parents: answer this to set a new PIN.")+'</div><div style="font-size:26px;font-weight:700;text-align:center;margin:12px 0">'+a+' × '+b+' = ?</div><input id="pfA" type="number" inputmode="numeric" class="ilq" style="text-align:center"><button class="btn gold full" id="pfGo">'+L2x("Semak","Check")+'</button>');
    o2.querySelector("#pfGo").onclick=function(){ if(+o2.querySelector("#pfA").value===a*b) pinSet(ok); else { toast(L2x("Jawapan salah","Wrong answer")); closeOverlay(); } };
  };
}

// ---------- 77: kids profiles and the kids lock ----------
var KID_KEYS=["ihsan_kids","ihsan_sirah_kids","ihsan_hijaiyah","ihsan_sbk","ihsan_jamma","ihsan_kw"], KID_EMO=["🌸","⭐","🌙","🐪","🌴","🦋","🐢","🍉","🚀","🌈"];
function kprof(){ var p=load("ihsan_kprof",{list:[],cur:null}); p.list=p.list||[]; return p; }
function kidStash(id){ var o={}; KID_KEYS.forEach(function(k){ var v=null; try{ v=localStorage.getItem(k); }catch(e){} if(v!=null) o[k]=v; }); save("ihsan_kp_"+id,o); }
function kidLoad(id){ var o=load("ihsan_kp_"+id,{}); KID_KEYS.forEach(function(k){ try{ if(o[k]!=null) localStorage.setItem(k,o[k]); else localStorage.removeItem(k); }catch(e){} }); }
function kidClear(){ KID_KEYS.forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} }); }
function kidSwitch(id){ var p=kprof(); if(p.cur===id) return; if(p.cur) kidStash(p.cur); kidLoad(id); p.cur=id; save("ihsan_kprof",p); }
function kidAdd(name, emo){ var p=kprof(), id="k"+Date.now().toString(36);
  if(p.list.length && p.cur){ kidStash(p.cur); kidClear(); } // the first child keeps the progress already on the phone
  p.list.push({id:id, n:name, e:emo}); p.cur=id; save("ihsan_kprof",p); }
function kidDel(id){ var p=kprof(); p.list=p.list.filter(function(x){ return x.id!==id; }); try{ localStorage.removeItem("ihsan_kp_"+id); localStorage.removeItem("ihsan_uni_"+id); }catch(e){}
  if(p.cur===id){ kidClear(); p.cur=null; if(p.list.length){ kidLoad(p.list[0].id); p.cur=p.list[0].id; } } save("ihsan_kprof",p); }
function kidCur(){ var p=kprof(); return p.list.filter(function(x){ return x.id===p.cur; })[0]||null; }
function kidAddSheet(){
  var emo=KID_EMO[kprof().list.length%KID_EMO.length];
  var ov=showSheet("＋ "+L2x("Profil anak","Child profile"), '<input id="kpN" class="ilq" maxlength="20" placeholder="'+L2x("Nama anak","Child's name")+'"><div class="kpEmo">'+KID_EMO.map(function(e){ return '<button class="chip'+(e===emo?' on':'')+'" data-ke="'+e+'">'+e+'</button>'; }).join("")+'</div>'+
    '<div class="mut tiny" style="margin:8px 0">'+(kprof().list.length?L2x("Profil baharu bermula dengan bintang dan lencana kosong.","A new profile starts with empty stars and badges."):L2x("Bintang dan lencana yang sudah ada menjadi milik profil ini.","The stars and badges already on the phone go to this profile."))+'</div><button class="btn gold full" id="kpSave">'+L2x("Simpan","Save")+'</button>');
  Array.prototype.forEach.call(ov.querySelectorAll("[data-ke]"), function(b){ b.onclick=function(){ emo=b.getAttribute("data-ke"); Array.prototype.forEach.call(ov.querySelectorAll("[data-ke]"),function(x){ x.classList.toggle("on",x===b); }); }; });
  ov.querySelector("#kpSave").onclick=function(){ var n=ov.querySelector("#kpN").value.trim(); if(!n){ toast(L2x("Tulis nama dahulu","Type a name first")); return; } kidAdd(n.slice(0,20), emo); closeOverlay(); render(); };
}
// 0.6.43 (owner): one sheet for Kids and School: rename, emoji, ▲▼ order, 🗑 delete (parent PIN when set). Deleting also removes the
// child's School progress (silibus.<id>.*) and moves School back to the Year profile if that child was open.
function kidManage(after){
  var draw=function(){ var p=kprof();
    var ov=showSheet("⚙ "+L2x("Urus anak","Manage children"), (p.list.length?p.list.map(function(k, i){ return '<div class="kpRow"><button class="chip kpE" data-kem="'+k.id+'">'+(k.e||"🧒")+'</button><input data-kr="'+k.id+'" value="'+esc(k.n)+'" maxlength="20"><button class="chip" data-ku="'+i+'"'+(i===0?' disabled':'')+' aria-label="▲">▲</button><button class="chip" data-kdn="'+i+'"'+(i===p.list.length-1?' disabled':'')+' aria-label="▼">▼</button><button class="chip" data-kd="'+k.id+'" aria-label="'+L2x("Padam","Delete")+'">🗑</button></div>'; }).join(""):'<div class="mut small">'+L2x("Belum ada anak.","No children yet.")+'</div>')+
      '<button class="btn gold full" id="kpOk" style="margin-top:10px">✓ '+L2x("Simpan","Save")+'</button>'+
      '<div class="mut tiny" style="margin-top:10px;line-height:1.45">'+L2x("Senarai yang sama untuk Mod kanak-kanak dan Sekolah. Setiap anak ada bintang, lencana dan kemajuan Sekolah sendiri. Padam membuang kemajuan anak itu dari telefon ini.","The same list for Kids mode and School. Each child has their own stars, badges and School progress. Deleting removes that child's progress from this phone.")+'</div>');
    var grab=function(){ var p2=kprof(); Array.prototype.forEach.call(ov.querySelectorAll("[data-kr]"),function(i){ p2.list.forEach(function(k){ if(k.id===i.getAttribute("data-kr") && i.value.trim()) k.n=i.value.trim().slice(0,20); }); }); save("ihsan_kprof",p2); return p2; };
    var mv=function(i, d){ var p2=grab(), j=i+d; if(j<0 || j>=p2.list.length) return; var t=p2.list[i]; p2.list[i]=p2.list[j]; p2.list[j]=t; save("ihsan_kprof", p2); closeOverlay(); draw(); };
    ov.querySelectorAll("[data-ku]").forEach(function(b){ b.onclick=function(){ mv(+b.getAttribute("data-ku"), -1); }; });
    ov.querySelectorAll("[data-kdn]").forEach(function(b){ b.onclick=function(){ mv(+b.getAttribute("data-kdn"), 1); }; });
    ov.querySelectorAll("[data-kem]").forEach(function(b){ b.onclick=function(){ var p2=grab(), id=b.getAttribute("data-kem"); p2.list.forEach(function(k){ if(k.id===id){ var i=KID_EMO.indexOf(k.e); k.e=KID_EMO[(i+1)%KID_EMO.length]; b.textContent=k.e; } }); save("ihsan_kprof",p2); }; });
    ov.querySelector("#kpOk").onclick=function(){ grab(); closeOverlay(); if(after) after(); else render(); };
    Array.prototype.forEach.call(ov.querySelectorAll("[data-kd]"), function(b){ b.onclick=function(){ var id=b.getAttribute("data-kd"), k=kprof().list.filter(function(x){ return x.id===id; })[0];
      if(!pinHas() && !confirm(L2x("Padam "+(k?k.n:"")+" dan semua kemajuannya?","Delete "+(k?k.n:"")+" and all their progress?"))) return;
      pinAsk(L2x("Padam profil ","Delete profile ")+(k?k.n:""), function(){ grab(); kidDel(id); sekForget(id); toast(L2x("Profil dipadam","Profile deleted")); closeOverlay(); if(kprof().list.length) draw(); else if(after) after(); else render(); }); }; });
  };
  draw();
}
function sekForget(id){ try{ var ks=[]; for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(k && k.indexOf("silibus."+id+".")===0) ks.push(k); } ks.forEach(function(k){ localStorage.removeItem(k); }); }catch(e){}
  var c=load("ihsan_silibus",null); if(c && c.anak===id){ c.anak="me"; c.skYear=false; save("ihsan_silibus",c); } }
// 0.6.43 (owner): parents can lock School: the child stays in Learn › School on one profile; the parent PIN and 5 swipes of 🔒 unlock it
function sekLockOn(kid){ var go2=function(){ S.kidLock=true; S.lockTo="school"; S.lockKid=kid.id; saveS(); var c=load("ihsan_silibus",{})||{}; c.anak=kid.id; save("ihsan_silibus",c); learnPg=null; learnFrom=null; go("learn"); toast(L2x("Sekolah dikunci untuk ","School is locked for ")+kid.n); kidPin(true); };
  if(pinHas()) go2(); else pinSet(go2); }
function sekLockOff(){ pinAsk(L2x("Buka kunci Sekolah","Unlock School"), function(){ if(!S.appLock) kidPin(false); S.kidLock=false; S.lockTo=null; S.lockKid=null; saveS(); render(); toast(L2x("Kunci dibuka","Unlocked")); }); }
function kidLockOn(){ var go2=function(){ S.kidLock=true; S.lockTo=null; saveS(); learnPg=null; learnFrom=null; go("kids"); toast(L2x("Mod kanak-kanak dikunci","Kids mode is locked")); kidPin(true); }; if(pinHas()) go2(); else pinSet(go2); }
function kidLockOff(){ pinAsk(L2x("Buka kunci mod kanak-kanak","Unlock kids mode"), function(){ if(!S.appLock) kidPin(false); S.kidLock=false; S.lockTo=null; S.lockKid=null; saveS(); render(); toast(L2x("Kunci dibuka","Unlocked")); }); }
// 0.31.0: screen pinning keeps the child inside the app (Home and Recents are blocked until unpinned)
function kidPin(on_){ if(!window.Native || !N.lockTask) return; N.lockTask(on_); if(on_ && !S.kidPinTip) setTimeout(kidPinTip, 900); }
function kidPinTip(){ S.kidPinTip=true; saveS();
  var b='<div class="small">'+L2x("Telefon akan bertanya \u201CSemat aplikasi?\u201D. Tekan <b>Faham / Got it</b>. Selepas itu butang Utama dan Terkini tidak berfungsi, dan butang Kembali tidak keluar dari mod kanak-kanak.","The phone will ask \u201CPin app?\u201D. Tap <b>Got it</b>. After that the Home and Recents buttons do nothing, and Back does not leave kids mode.")+'</div>'+
    '<div class="small" style="margin-top:8px">'+L2x("Supaya anak tidak boleh menyahsemat sendiri, hidupkan dalam Tetapan telefon: <b>Keselamatan › Semat aplikasi › Minta PIN sebelum nyahsemat</b>. (Nama menu berbeza ikut jenama telefon.)","So the child cannot unpin it, turn this on in phone Settings: <b>Security › App pinning › Ask for PIN before unpinning</b>. (Menu names differ by phone brand.)")+'</div>'+
    '<div class="small" style="margin-top:8px">'+L2x("Jika telefon tidak bertanya apa-apa, hidupkan <b>Semat aplikasi</b> dahulu di tempat yang sama, kemudian kunci semula.","If the phone asks nothing, turn on <b>App pinning</b> there first, then lock again.")+'</div>'+
    '<button class="btn gold full g3d" id="kpSet" style="margin-top:10px">⚙ '+L2x("Buka Tetapan keselamatan","Open security settings")+'</button>';
  var ov=showSheet("📌 "+L2x("Kunci skrin untuk anak","Screen lock for children"), b);
  ov.querySelector("#kpSet").onclick=function(){ N.requestPerm("pinning"); };
}
function kidsTop(){
  var p=kprof(), h='<div class="kpBar">';
  if(p.list.length) h+=p.list.map(function(k){ return '<button class="chip'+(k.id===p.cur?' on':'')+'" data-kpid="'+k.id+'">'+k.e+' '+esc(k.n)+'</button>'; }).join("")+(S.kidLock?'':'<button class="chip" id="kpAdd" aria-label="'+L2x("Tambah profil","Add profile")+'">＋</button><button class="chip" id="kpMan" aria-label="'+L2x("Urus profil","Manage profiles")+'">⚙</button>');
  else if(!S.kidLock) h+='<button class="chip" id="kpAdd">＋ '+L2x("Profil anak","Child profile")+'</button>';
  h+=S.kidLock?swUnHtml("kpUnlock","kpLock"):'';
  return h+'</div>';
}
function kidsLockCard(){
  if(S.kidLock) return '';
  return '<div class="card"><h3>🔒 '+L2x("Kunci mod kanak-kanak","Lock kids mode")+'</h3><div class="small" style="line-height:1.5">'+L2x("Anak hanya boleh guna halaman ini dan pelajarannya. PIN ibu bapa diperlukan untuk keluar.","Your child can only use this page and its lessons. The parent PIN is needed to leave.")+'</div><button class="btn alt full" id="kpLockOn" style="margin-top:8px">🔒 '+L2x("Kunci sekarang","Lock now")+'</button></div>';
}
function bindKidsTop(el){
  el.querySelectorAll("[data-kpid]").forEach(function(b){ b.onclick=function(){ kidSwitch(b.getAttribute("data-kpid")); render(); }; });
  var a=el.querySelector("#kpAdd"); if(a) a.onclick=kidAddSheet;
  var m=el.querySelector("#kpMan"); if(m) m.onclick=function(){ kidManage(); };
  var u=el.querySelector("#kpUnlock"); if(u) swUnBind(u, kidLockOff);
  var l=el.querySelector("#kpLockOn"); if(l) l.onclick=kidLockOn;
}

// ---------- 0.38.0: app-wide lock and the 5-swipe unlock ----------
// The app lock keeps the whole app usable but fenced in: screen pinning blocks Home and Recents, Back never leaves the app,
// Tetapan is closed. Unlocking (here and in kids mode) takes 5 sideways swipes on the 🔒 handle, then the parent PIN.
// Android does not let an app change the phone's own unpin gesture; that one is guarded by the phone's
// "Ask for PIN before unpinning" setting, and the app pins itself again when it is opened while still locked.
var SWUN=5;
function swUnHtml(id, cls){ var d=""; for(var i=0;i<SWUN;i++) d+="<i></i>";
  return '<div class="swUn noswipe '+(cls||"")+'" id="'+id+'" role="button" tabindex="0" aria-label="'+L2x("Sapu 5 kali untuk buka kunci","Swipe 5 times to unlock")+'"><span class="swL">🔒</span><span class="swD">'+d+'</span><span class="swA">‹ ›</span></div>'; }
function swUnBind(el, done){
  var n=0, x0=null, y0=0, last=0, D=el.querySelectorAll(".swD i"), dir=0;
  var draw=function(){ Array.prototype.forEach.call(D,function(d,i){ d.classList.toggle("on", i<n); }); };
  var stop=function(e){ e.stopPropagation(); };
  ["touchstart","touchmove","touchend","click"].forEach(function(t){ el.addEventListener(t, stop, {passive:true}); });
  el.addEventListener("pointerdown", function(e){ x0=e.clientX; y0=e.clientY; try{ el.setPointerCapture(e.pointerId); }catch(er){} });
  el.addEventListener("pointerup", function(e){ if(x0===null) return; var dx=e.clientX-x0, dy=e.clientY-y0; x0=null;
    if(Math.abs(dx)<24 || Math.abs(dx)<Math.abs(dy)){ if(Math.abs(dx)<8 && Math.abs(dy)<8){ el.classList.remove("hint"); void el.offsetWidth; el.classList.add("hint"); toast(L2x("Sapu ke kiri dan kanan 5 kali","Swipe left and right 5 times")); } return; }
    var now=Date.now(), s=dx>0?1:-1; if(now-last>3000) n=0; last=now;
    n++; dir=s; draw(); if(N.vibrate) N.vibrate(25);
    if(n>=SWUN){ n=0; setTimeout(draw, 300); done(); } });
  el.addEventListener("pointercancel", function(){ x0=null; });
}
function appLockOn(){ var go2=function(){ S.appLock=true; saveS(); closeOverlay(); if(setOn) setShow(false); if(view==="more") go("home"); else render(); appPin(true);
    toast(L2x("Aplikasi dikunci. Sapu 🔒 di atas 5 kali untuk buka.","The app is locked. Swipe the 🔒 at the top 5 times to unlock.")); };
  if(pinHas()) go2(); else pinSet(go2); }
function appLockOff(){ pinAsk(L2x("Buka kunci aplikasi","Unlock the app"), function(){ S.appLock=false; saveS(); if(!S.kidLock) kidPin(false); render(); toast(L2x("Kunci dibuka","Unlocked")); }); }
function appPin(on_){ if(!window.Native || !N.lockTask) return; N.lockTask(on_); if(on_ && !S.appPinTip) setTimeout(appPinTip, 900); }
function appPinTip(){ S.appPinTip=true; saveS();
  var b='<div class="small">'+L2x("Telefon akan bertanya “Semat aplikasi?”. Tekan <b>Faham / Got it</b>. Selepas itu butang Utama dan Terkini tidak berfungsi, dan butang Kembali tidak keluar dari aplikasi. Semua halaman lain boleh dibuka seperti biasa, kecuali Tetapan.","The phone will ask “Pin app?”. Tap <b>Got it</b>. After that the Home and Recents buttons do nothing, and Back does not leave the app. Every other page opens as usual, except Settings.")+'</div>'+
    '<div class="small" style="margin-top:8px">'+L2x("Untuk buka kunci: sapu ikon 🔒 di bahagian atas ke kiri dan kanan <b>5 kali</b>, kemudian masukkan PIN.","To unlock: swipe the 🔒 handle at the top left and right <b>5 times</b>, then enter the PIN.")+'</div>'+
    '<div class="small" style="margin-top:8px">'+L2x("Telefon juga ada cara sendiri untuk menyahsemat (sapu atau tekan lama butang). Aplikasi tidak boleh mengubah cara itu. Supaya orang lain tidak boleh menyahsemat, hidupkan dalam Tetapan telefon: <b>Keselamatan › Semat aplikasi › Minta PIN sebelum nyahsemat</b>. Jika aplikasi dinyahsemat, ia kekal dikunci dan menyemat semula apabila dibuka.","The phone also has its own way to unpin (a swipe, or holding buttons). An app cannot change that. So nobody else can unpin, turn this on in phone Settings: <b>Security › App pinning › Ask for PIN before unpinning</b>. If the app does get unpinned, it stays locked and pins itself again when it is opened.")+'</div>'+
    '<button class="btn gold full g3d" id="apSet" style="margin-top:10px">⚙ '+L2x("Buka Tetapan keselamatan","Open security settings")+'</button>';
  var ov=showSheet("📌 "+L2x("Kunci seluruh aplikasi","Lock the whole app"), b);
  ov.querySelector("#apSet").onclick=function(){ N.requestPerm("pinning"); };
}
function appLockBar(){
  var h=document.getElementById("hBtns"); if(!h) return;
  var w=document.getElementById("apUn");
  if(S.appLock && !S.kidLock){ if(!w){ h.insertAdjacentHTML("afterbegin", swUnHtml("apUn","apUn")); w=document.getElementById("apUn"); swUnBind(w, appLockOff); } }
  else if(w) w.remove();
  var st=document.getElementById("hSet"); if(st) st.style.display = S.appLock ? "none" : "";
}
// pinned again when a locked app comes back (for example after the phone's own unpin gesture)
function lockRepin(){ if(!(S.kidLock||S.appLock) || !window.Native || !N.lockTask) return; try{ if(N.isPinned && N.isPinned()) return; }catch(e){} N.lockTask(true); }

// ---------- 78: senior mode ----------
function srDur(ms){ var m=Math.max(0,Math.round(ms/60000)), h=Math.floor(m/60); m=m%60;
  return en_() ? (h?h+(h===1?" hour ":" hours "):"")+m+(m===1?" minute":" minutes") : (h?h+" jam ":"")+m+" minit"; }
function vSenior(el){
  var np=nextPrev(), t=getDay(new Date()), cur=inDhuha()?"dhuha":currentPrayer();
  var html='<div class="snNext"><div class="snL">'+L2x("Solat seterusnya","Next prayer")+'</div><div class="snN">'+(np.next?T(np.next.k):"")+'</div><div class="snT">'+(np.next?hm12(np.next.t):"")+'</div><div class="snC" id="snCd">'+(np.next?L2x("lagi ","in ")+srDur(np.next.t-Date.now()):"")+'</div></div>';
  html+='<div class="snTimes">'+PR.map(function(k){ var c=prCell(k,t); return '<div class="'+(c.k===cur?'on':'')+'"><span>'+prN(c.k)+'</span><b>'+fmt12(c.hm)+'</b></div>'; }).join("")+'</div>';
  html+='<div class="snGrid">'+[["solat","🕰",L2x("Waktu solat","Prayer times")],["qibla","🧭",L2x("Kiblat","Qibla")],["tasbih","📿",L2x("Tasbih","Tasbih")],["doa","🤲",L2x("Doa","Doa")]].map(function(b){ return '<button data-sn="'+b[0]+'"><span>'+b[1]+'</span>'+b[2]+'</button>'; }).join("")+'</div>';
  html+='<button class="snSet" id="snSet">⚙ '+L2x("Tetapan","Settings")+'</button>';
  el.innerHTML=html;
  el.querySelectorAll("[data-sn]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-sn");
    if(k==="solat") go("solat");
    else if(k==="qibla"){ go("solat"); setTimeout(function(){ var q=document.getElementById("qCard"); if(q) q.scrollIntoView({block:"center"}); },120); }
    else if(k==="tasbih"){ sub.zikir="tasbih"; go("zikir"); }
    else go("doa"); }; });
  el.querySelector("#snSet").onclick=function(){ go("more"); };
  timers.push(setInterval(function(){ var c=document.getElementById("snCd"), n2=nextPrev(); if(!c || view!=="home" || !S.senior) return; if(!np.next || !n2.next || n2.next.k!==np.next.k){ render(); return; } c.textContent=L2x("lagi ","in ")+srDur(n2.next.t-Date.now()); }, 20000));
}

// ---------- 79: my doa list ----------
var MYDOA_CATS=[["kel","🏠","Keluarga","Family"],["sakit","🏥","Yang sakit","The sick"],["ilmu","📚","Belajar & peperiksaan","Study & exams"],["rezeki","💼","Kerja & rezeki","Work & provision"],["arwah","🕊","Yang telah pergi","Those who have passed away"],["lain","✨","Hajat lain","Other needs"]];
var MYDOA_DOA={
  kel:{ar:"رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", ms:"Wahai Tuhanku, kasihanilah mereka berdua sebagaimana mereka telah mendidikku semasa kecil", en:"My Lord, have mercy on them as they brought me up when I was small", src:"Al-Quran 17:24"},
  sakit:{ar:"اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا", ms:"Ya Allah, Tuhan manusia, hilangkanlah penyakit; sembuhkanlah, Engkaulah Yang Maha Menyembuhkan; tiada penyembuhan melainkan penyembuhan-Mu, penyembuhan yang tidak meninggalkan sebarang penyakit", en:"O Allah, Lord of mankind, remove the harm and heal; You are the Healer; there is no healing but Yours, a healing that leaves no illness", src:"Sahih al-Bukhari 5743; Sahih Muslim 2191"},
  ilmu:{ar:"رَبِّ زِدْنِي عِلْمًا", ms:"Ya Tuhanku, tambahkanlah ilmuku", en:"My Lord, increase me in knowledge", src:"Al-Quran 20:114"},
  rezeki:{ar:"اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا", ms:"Ya Allah, aku memohon ilmu yang bermanfaat, rezeki yang baik dan amalan yang diterima", en:"O Allah, I ask You for beneficial knowledge, good provision and accepted deeds", src:"Sunan Ibn Majah 925"},
  arwah:{ar:"اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ وَاعْفُ عَنْهُ", ms:"Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia dan maafkanlah dia (tukar لَهُ kepada لَهَا bagi perempuan)", en:"O Allah, forgive him, have mercy on him, keep him safe and pardon him (use لَهَا for a woman)", src:"Sahih Muslim 963"},
  lain:{ar:"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", ms:"Wahai Tuhan kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami daripada azab neraka", en:"Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire", src:"Al-Quran 2:201"}};
var doaMine=false, mdCat="kel";
function mdData(){ var d=load("ihsan_mydoa",{list:[],rp:0,rem:true}); d.list=d.list||[]; if(d.rem==null) d.rem=true; return d; }
function mdCatOf(k){ return MYDOA_CATS.filter(function(c){ return c[0]===k; })[0]||MYDOA_CATS[5]; }
function mdAgo(t){ var d=Math.floor((Date.now()-t)/864e5); return d<=0?L2x("hari ini","today"):d===1?L2x("semalam","yesterday"):d+L2x(" hari lalu"," days ago"); }
function myDoaPage(zv){
  var D=mdData(), act=D.list.filter(function(x){ return !x.a; }), ans=D.list.filter(function(x){ return x.a; });
  var html='<div class="card mdIntro"><h3>🤲 '+L2x("Doa saya","My doa list")+'</h3><div class="small" style="line-height:1.5">'+L2x("Senarai peribadi orang dan hajat yang ingin anda doakan. Disimpan dalam telefon ini sahaja.","A private list of people and needs you want to pray for. Kept on this phone only.")+'</div>'+
    '<input id="mdN" class="ilq" style="margin-top:10px" maxlength="80" placeholder="'+L2x("Contoh: Mak, Ali yang sakit, peperiksaan SPM","For example: Mum, Ali who is ill, my exams")+'">'+
    '<div class="mdCats">'+MYDOA_CATS.map(function(c){ return '<button class="chip'+(mdCat===c[0]?' on':'')+'" data-mdc="'+c[0]+'">'+c[1]+' '+L2x(c[2],c[3])+'</button>'; }).join("")+'</div>'+
    '<button class="btn gold full" id="mdAdd">＋ '+L2x("Tambah ke senarai","Add to the list")+'</button>'+
    '<div class="set" style="margin-top:8px"><span>'+L2x("Ingatkan selepas solat (kaunter rakaat)","Remind me after solat (rakaat counter)")+'</span>'+sw("mdRem",D.rem)+'</div></div>';
  if(!act.length) html+='<div class="card mut small">'+L2x("Senarai masih kosong.","The list is empty.")+'</div>';
  MYDOA_CATS.forEach(function(c){
    var xs=act.filter(function(x){ return (x.c||"lain")===c[0]; }); if(!xs.length) return;
    var d=MYDOA_DOA[c[0]];
    html+='<div class="card"><h3>'+c[1]+' '+L2x(c[2],c[3])+'</h3>'+xs.map(function(x){ return '<div class="mdRow"><div><b>'+esc(x.n)+'</b><div class="mut tiny">'+L2x("Ditambah ","Added ")+mdAgo(x.t)+'</div></div><button class="chip" data-mda="'+x.id+'" title="'+L2x("Dimakbulkan","Answered")+'">✓</button><button class="chip" data-mdx="'+x.id+'" aria-label="'+L2x("Padam","Delete")+'">✕</button></div>'; }).join("")+
      '<details class="mdDoa"><summary>'+L2x("Doa yang sesuai","A fitting doa")+'</summary>'+arBlock(d.ar,d.ms,d.en,d.src)+'</details></div>';
  });
  if(ans.length) html+='<div class="card"><h3>🌿 '+L2x("Alhamdulillah, dimakbulkan","Alhamdulillah, answered")+'</h3>'+ans.map(function(x){ return '<div class="mdRow done"><div><b>'+esc(x.n)+'</b><div class="mut tiny">'+new Date(x.a).toLocaleDateString(locTag(),{day:"numeric",month:"short",year:"numeric"})+'</div></div><button class="chip" data-mdu="'+x.id+'">↺</button><button class="chip" data-mdx="'+x.id+'">✕</button></div>'; }).join("")+'</div>';
  zv.innerHTML=html;
  var upd=function(f){ var D2=mdData(); f(D2); save("ihsan_mydoa",D2); myDoaPage(zv); };
  zv.querySelectorAll("[data-mdc]").forEach(function(b){ b.onclick=function(){ mdCat=b.getAttribute("data-mdc"); zv.querySelectorAll("[data-mdc]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
  zv.querySelector("#mdAdd").onclick=function(){ var n=zv.querySelector("#mdN").value.trim(); if(!n){ toast(L2x("Tulis nama atau hajat dahulu","Type a name or need first")); return; } upd(function(D2){ D2.list.unshift({id:"d"+Date.now().toString(36), n:n.slice(0,80), c:mdCat, t:Date.now(), a:0}); }); toast(L2x("Ditambah","Added")); };
  zv.querySelector("#mdRem").onchange=function(){ var on2=this.checked; upd(function(D2){ D2.rem=on2; }); };
  zv.querySelectorAll("[data-mda]").forEach(function(b){ b.onclick=function(){ var id=b.getAttribute("data-mda"); upd(function(D2){ D2.list.forEach(function(x){ if(x.id===id) x.a=Date.now(); }); }); N.vibrate(60); toast(L2x("Alhamdulillah","Alhamdulillah")); }; });
  zv.querySelectorAll("[data-mdu]").forEach(function(b){ b.onclick=function(){ var id=b.getAttribute("data-mdu"); upd(function(D2){ D2.list.forEach(function(x){ if(x.id===id) x.a=0; }); }); }; });
  zv.querySelectorAll("[data-mdx]").forEach(function(b){ b.onclick=function(){ var id=b.getAttribute("data-mdx"); upd(function(D2){ D2.list=D2.list.filter(function(x){ return x.id!==id; }); }); }; });
}
// After a prayer is counted to the end: a gentle reminder of up to 3 names, taking turns.
function myDoaRemind(){
  var D=mdData(), act=D.list.filter(function(x){ return !x.a; }); if(!D.rem || !act.length) return;
  var n=Math.min(3,act.length), st=(D.rp||0)%act.length, pick=[]; for(var i=0;i<n;i++) pick.push(act[(st+i)%act.length]);
  D.rp=(st+n)%act.length; save("ihsan_mydoa",D);
  var d=MYDOA_DOA[pick[0].c||"lain"]||MYDOA_DOA.lain;
  var ov=showSheet("🤲 "+L2x("Jangan lupa doakan","Remember to pray for"), '<div class="mdRem">'+pick.map(function(x){ return '<div>'+mdCatOf(x.c)[1]+' <b>'+esc(x.n)+'</b></div>'; }).join("")+'</div>'+arBlock(d.ar,d.ms,d.en,d.src)+
    '<div class="btns" style="margin-top:10px"><button class="btn alt" id="mdOpen">'+L2x("Buka senarai","Open the list")+'</button><button class="btn gold" id="mdOk">'+L2x("Aamiin","Aamiin")+'</button></div>');
  ov.querySelector("#mdOk").onclick=function(){ closeOverlay(); };
  ov.querySelector("#mdOpen").onclick=function(){ closeOverlay(); doaMine=true; doaFav=false; doaQ=""; go("doa"); };
}
function wMyDoa(){
  var D=mdData(), act=D.list.filter(function(x){ return !x.a; });
  return '<div class="card"><div class="row"><h3>🤲 '+L2x("Doa saya","My doa list")+'</h3><button class="chip" data-act="mydoa">'+(act.length?L2x("Semua","All"):"＋")+'</button></div>'+
    (act.length?act.slice(0,4).map(function(x){ return '<div class="small" style="padding:3px 0">'+mdCatOf(x.c)[1]+' '+esc(x.n)+'</div>'; }).join("")+(act.length>4?'<div class="mut tiny">+'+(act.length-4)+'</div>':''):'<div class="mut small">'+L2x("Tambah orang dan hajat yang ingin anda doakan.","Add people and needs you want to pray for.")+'</div>')+'</div>';
}

// ---------- 80: muhasabah journal ----------
var jnOpen=false;
function jnData(){ var j=load("ihsan_muhasabah",{d:{},lock:false}); j.d=j.d||{}; return j; }
var JN_TIPS=[["Satu perkara kecil yang menggembirakan hari ini?","One small thing that made today good?"],["Siapa yang telah membantu anda hari ini?","Who helped you today?"],["Nikmat apa yang mudah terlepas pandang?","Which blessing is easy to overlook?"]];
var JN_TIPS2=[["Satu tabiat yang ingin diperbaiki esok?","One habit to improve tomorrow?"],["Adakah solat hari ini tepat pada waktunya?","Were today's prayers on time?"],["Adakah kata-kata saya hari ini baik?","Were my words kind today?"]];
function jnLabelDate(ds){ return parseYmd(ds).toLocaleDateString(locTag(),{weekday:"long",day:"numeric",month:"long"}); }
function jnCard(ds){
  if(ds>ymd(new Date())) return '';
  var J=jnData(), e=J.d[ds], locked=J.lock && !jnOpen, h='<div class="card jnC"><h3>📓 '+L2x("Muhasabah harian","Daily reflection")+(J.lock?' <span class="badge">🔒</span>':'')+'</h3>';
  if(locked) h+='<div class="mut small">'+(e?L2x("Ada catatan untuk hari ini. ","There is a note for this day. "):"")+L2x("Jurnal dikunci dengan PIN.","The journal is locked with a PIN.")+'</div><button class="chip" data-jnu="'+ds+'" style="margin-top:8px">🔓 '+L2x("Buka","Unlock")+'</button>';
  if(!locked && e && e.tt) h+='<div class="jnQ">📖 '+L2x("Tadabbur","Tadabbur")+(e.tk!=null && window.QMETA?'':'')+'</div><div class="jnA">'+esc(e.tt)+'</div>';
  if(locked){} else if(e && (e.g||e.i)) h+='<div class="jnQ">'+L2x("Saya bersyukur kerana","I am grateful for")+'</div><div class="jnA">'+esc(e.g||"·")+'</div><div class="jnQ">'+L2x("Saya ingin memperbaiki","I want to improve")+'</div><div class="jnA">'+esc(e.i||"·")+'</div><button class="chip" data-jn="'+ds+'" style="margin-top:8px">✎ '+L2x("Ubah","Edit")+'</button>';
  else h+='<div class="mut small" style="line-height:1.5">'+L2x("Dua soalan ringkas untuk menutup hari: satu perkara yang disyukuri dan satu perkara untuk diperbaiki.","Two short questions to close the day: one thing you are grateful for and one thing to improve.")+'</div><button class="btn gold" data-jn="'+ds+'" style="margin-top:8px">✎ '+L2x("Tulis","Write")+'</button>';
  return h+'</div>';
}
function jnUnlock(then){ pinAsk(L2x("Buka jurnal","Unlock the journal"), function(){ jnOpen=true; if(then) then(); else render(); }); }
function jnEdit(ds){
  var J=jnData(); if(J.lock && !jnOpen){ jnUnlock(function(){ jnEdit(ds); }); return; }
  var e=J.d[ds]||{g:"",i:""}, k=dayIndex(parseYmd(ds))%3;
  var ov=showSheet("📓 "+esc(jnLabelDate(ds)), '<label class="jnQ">'+L2x("Satu perkara yang saya syukuri","One thing I am grateful for")+'</label><textarea id="jnG" class="jnT" maxlength="600" placeholder="'+esc(L2x(JN_TIPS[k][0],JN_TIPS[k][1]))+'">'+esc(e.g)+'</textarea>'+
    '<label class="jnQ">'+L2x("Satu perkara yang ingin saya perbaiki","One thing I want to improve")+'</label><textarea id="jnI" class="jnT" maxlength="600" placeholder="'+esc(L2x(JN_TIPS2[k][0],JN_TIPS2[k][1]))+'">'+esc(e.i)+'</textarea>'+
    '<div class="set"><span>🔒 '+L2x("Kunci jurnal dengan PIN","Lock the journal with a PIN")+'</span>'+sw("jnL",J.lock)+'</div>'+
    '<div class="set"><span>🔔 '+L2x("Ingatkan saya selepas Isyak","Remind me after Isyak")+'</span>'+sw("jnR",S.jnRem)+'</div>'+
    '<div class="btns" style="margin-top:8px">'+(J.d[ds]?'<button class="btn alt" id="jnDel">🗑 '+L2x("Padam","Delete")+'</button>':'')+'<button class="btn gold" id="jnSave" style="flex:1">'+L2x("Simpan","Save")+'</button></div>'+
    '<div class="mut tiny" style="margin-top:8px">'+L2x("Disimpan dalam telefon ini sahaja, dan dalam fail sandaran jika anda membuatnya.","Kept on this phone only, and in your backup file if you make one.")+'</div>');
  ov.querySelector("#jnSave").onclick=function(){ var J2=jnData(), g=ov.querySelector("#jnG").value.trim(), i=ov.querySelector("#jnI").value.trim(); if(g||i) J2.d[ds]={g:g, i:i, t:Date.now()}; else delete J2.d[ds]; save("ihsan_muhasabah",J2); closeOverlay(); toast(L2x("Disimpan","Saved")); render(); };
  var dl=ov.querySelector("#jnDel"); if(dl) dl.onclick=function(){ var J2=jnData(); delete J2.d[ds]; save("ihsan_muhasabah",J2); closeOverlay(); render(); };
  ov.querySelector("#jnL").onchange=function(){ var on2=this.checked, sw2=this, setL=function(v){ var J2=jnData(); J2.lock=v; save("ihsan_muhasabah",J2); if(v) jnOpen=true; };
    if(on2 && !pinHas()){ var g0=ov.querySelector("#jnG").value, i0=ov.querySelector("#jnI").value; pinSet(function(){ setL(true); jnEdit(ds); setTimeout(function(){ var o=document.getElementById("overlay"); if(o.querySelector("#jnG")){ o.querySelector("#jnG").value=g0; o.querySelector("#jnI").value=i0; } },0); }); return; }
    if(!on2){ sw2.checked=true; pinAsk(L2x("Buang kunci jurnal","Remove the journal lock"), function(){ setL(false); render(); toast(L2x("Kunci jurnal dibuang","Journal lock removed")); }); return; }
    setL(true); };
  ov.querySelector("#jnR").onchange=function(){ S.jnRem=this.checked; saveS(); pushSchedule(); };
}
function wJournal(){
  var ds=ymd(new Date()), J=jnData(), e=J.d[ds];
  return '<div class="card"><h3>📓 '+L2x("Muhasabah hari ini","Today's reflection")+'</h3>'+(e?'<div class="small">✓ '+L2x("Sudah ditulis. Semoga Allah memberkati hari anda.","Written. May Allah bless your day.")+'</div><button class="chip" data-jn="'+ds+'" style="margin-top:6px">'+(J.lock?'🔒 ':'✎ ')+L2x("Buka","Open")+'</button>':'<div class="small mut">'+L2x("Apa yang anda syukuri hari ini?","What are you grateful for today?")+'</div><button class="btn gold" data-jn="'+ds+'" style="margin-top:6px">✎ '+L2x("Tulis","Write")+'</button>')+'</div>';
}

// ---------- 76: Raya, Ramadan and Maal Hijrah cards (patterns drawn in code; no people) ----------
var KAD_OCC=[["fitri","Aidilfitri","Eid al-Fitr"],["adha","Aidiladha","Eid al-Adha"],["ramadan","Ramadan","Ramadan"],["hijrah","Maal Hijrah","Islamic New Year"],
  ["jumaat","Jumaat","Jumu'ah"],["nikah","Perkahwinan","Wedding"],["baby","Bayi baharu","New baby"],["bday","Hari jadi","Birthday"],["sembuh","Cepat sembuh","Get well"],
  ["takziah","Takziah","Condolence"],["terima","Terima kasih","Thank you"],["haji","Haji & Umrah","Hajj & Umrah"],["isra","Israk Mikraj","Isra Mi'raj"],["maulid","Maulidur Rasul","Mawlid"],
  ["nuzul","Nuzul Al-Quran","Nuzul al-Quran"],["qadar","Lailatulqadar","Laylat al-Qadr"],["arafah","Hari Arafah","Day of Arafah"],["terbuka","Rumah terbuka","Open house"],["tunang","Pertunangan","Engagement"],
  ["ulang","Ulang tahun kahwin","Anniversary"],["aqiqah","Aqiqah","Aqiqah"],["rumah","Rumah baharu","New home"],["ibu","Hari Ibu","Mother's Day"],["bapa","Hari Bapa","Father's Day"],["khatam","Khatam Al-Quran","Quran completion"],
  ["safar","Selamat jalan","Safe travels"],["tahniah","Tahniah","Congratulations"],["lulus","Lulus peperiksaan","Exam success"],["konvo","Konvokesyen","Graduation"],["kerja","Kerja baharu","New job"],["guru","Hari Guru","Teachers' Day"],
  ["pencen","Persaraan","Retirement"],["rindu","Rindu","Thinking of you"],["maaf","Mohon maaf","Sorry"],["merdeka","Hari Kebangsaan","National Day"]];
// 0.6.34: occasions in 3 groups, each with its own design and colour (KadArt in kad/kad2.js)
var KAD_GRP=[["Hari kebesaran","Islamic days",["fitri","adha","ramadan","hijrah","jumaat","isra","maulid","nuzul","qadar","arafah"]],["Keluarga & kehidupan","Family & life",["nikah","tunang","ulang","baby","aqiqah","bday","rumah","ibu","bapa","khatam"]],
  ["Ucapan & doa","Wishes & prayers",["terima","tahniah","lulus","konvo","kerja","guru","pencen","haji","safar","terbuka","sembuh","takziah","rindu","maaf","merdeka"]]];
var KAD_DEF={fitri:["ketupat","hijau"],adha:["kaabah","emas"],ramadan:["fanus","malam"],hijrah:["sabit","malam"],jumaat:["geo","hijau"],isra:["sabit","ungu"],maulid:["awan","hijau"],nuzul:["geo","malam"],qadar:["sabit","ungu"],arafah:["kaabah","krim"],terbuka:["ketupat","maroon"],
  nikah:["songket","maroon"],tunang:["bunga","pink"],ulang:["bokeh","maroon"],baby:["bayi","langit"],aqiqah:["bayi","pink"],bday:["konfeti","ungu"],rumah:["awan","sage"],ibu:["bunga","pink"],bapa:["geo","teal"],haji:["kaabah","emas"],khatam:["awan","krim"],safar:["gelombang","langit"],
  terima:["bokeh","emas"],tahniah:["konfeti","emas"],lulus:["konfeti","langit"],konvo:["bokeh","malam"],kerja:["bokeh","teal"],guru:["batik","krim"],pencen:["gelombang","koral"],sembuh:["bunga","sage"],takziah:["minimal","sage"],rindu:["bokeh","ungu"],maaf:["minimal","krim"],merdeka:["batik","langit"]};
var KAD_DES=[["geo","Geometri","Geometric"],["sabit","Bulan sabit","Crescent"],["ketupat","Ketupat","Ketupat"],["pelita","Pelita","Oil lamps"],
  ["bunga","Bunga","Floral"],["kubah","Kubah","Domes"],["konfeti","Konfeti","Confetti"],["gelombang","Gelombang","Waves"],["minimal","Ringkas","Minimal"]];
var KAD_COL=[["hijau","#0b5d3b","#04261a","#e3bf5c","#ffffff"],["malam","#16206b","#060a26","#ecc96a","#ffffff"],["krim","#fbf3e2","#ecdcb6","#9c6c12","#3a2a10"],["maroon","#7a1636","#2a0512","#eabd62","#ffffff"],
  ["pink","#f7d6df","#e9a9bb","#a33a5e","#3b1020"],["langit","#d7ecf7","#9cc9e6","#1d5c8a","#0d2a40"],["emas","#1a1a1a","#000000","#d9b252","#f5e9c8"],["sage","#dfe8d6","#b8cba8","#4d6b3c","#1f2d16"],["ungu","#4b2a6b","#1f0f30","#e6c06a","#ffffff"],["teal","#0f5e63","#05282b","#f2c46b","#ffffff"],["koral","#fbe3d6","#f2b8a0","#c4552d","#3a1a10"]];
var KAD_COLN={hijau:["Hijau","Green"],malam:["Biru malam","Night blue"],krim:["Krim","Cream"],maroon:["Merah hati","Maroon"],pink:["Merah jambu","Pink"],langit:["Biru langit","Sky blue"],emas:["Hitam emas","Black gold"],sage:["Hijau pucuk","Sage"],ungu:["Ungu","Purple"],teal:["Teal","Teal"],koral:["Koral","Coral"]};
// 0.5.23 stickers (no people): drag on the card, size and delete
var KAD_STK=["🌙","⭐","✨","🕌","🕋","🤲","📿","🌸","🌺","🌷","💐","🍃","🌴","🎉","🎈","🎁","💝","💚","🕯️","🏮","🍰","🍼","🧸","☕","🌹","🕊️","☀️","🌈"];
function kadText(o){
  var hy=(nextHijriEvent(1,1,0,0)||{}).y||"", en=en_();
  return {fitri:{h:en?"Eid Mubarak":"Selamat Hari Raya Aidilfitri", s:en?"Happy Eid al-Fitr":"Maaf Zahir dan Batin", ar:"تَقَبَّلَ اللهُ مِنَّا وَمِنْكُمْ", m:en?"May this Eid bring you and your family blessings, good health and joy.":"Semoga Syawal ini membawa keberkatan, kesihatan dan kegembiraan untuk anda sekeluarga."},
    adha:{h:en?"Eid al-Adha Mubarak":"Selamat Hari Raya Aidiladha", s:en?"Happy Eid al-Adha":"Salam Aidiladha", ar:"عِيدٌ مُبَارَكٌ", m:en?"May Allah accept our sacrifices and bring us closer to Him.":"Semoga pengorbanan kita diterima Allah dan mendekatkan kita kepada-Nya."},
    ramadan:{h:en?"Ramadan Mubarak":"Salam Ramadan", s:en?"A blessed month of fasting":"Ramadan Al-Mubarak", ar:"رَمَضَانُ مُبَارَكٌ", m:en?"May this Ramadan be full of mercy, forgiveness and peace.":"Semoga Ramadan ini penuh rahmat, keampunan dan ketenangan."},
    hijrah:{h:en?"Happy Islamic New Year":"Salam Maal Hijrah", s:hy?(en?hy+" AH":hy+"H"):"", ar:"كُلُّ عَامٍ وَأَنْتُمْ بِخَيْرٍ", m:en?"May this new year bring a change for the better.":"Semoga tahun baharu ini membawa hijrah diri ke arah yang lebih baik."},
    jumaat:{h:en?"Jumu'ah Mubarak":"Salam Jumaat", s:en?"Blessed Friday":"Jumaat yang diberkati", ar:"جُمُعَةٌ مُبَارَكَةٌ", m:en?"Remember to read Al-Kahf and send salawat upon the Prophet ﷺ.":"Jangan lupa membaca Al-Kahfi dan berselawat ke atas Nabi ﷺ."},
    nikah:{h:en?"Barakallahu lakuma":"Selamat Pengantin Baru", s:en?"Congratulations on your nikah":"Barakallahu lakuma", ar:"بَارَكَ اللهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا", m:en?"May Allah bless you both and bring you together in goodness.":"Semoga Allah memberkati kalian berdua dan menghimpunkan dalam kebaikan."},
    baby:{h:en?"Welcome, little one":"Tahniah atas kelahiran", s:en?"Congratulations on your new baby":"Selamat datang si kecil", ar:"بَارَكَ اللهُ لَكَ فِي الْمَوْهُوبِ لَكَ", m:en?"May Allah make this child a joy to your eyes and a righteous servant.":"Semoga anak ini menjadi penyejuk mata dan hamba Allah yang soleh."},
    bday:{h:en?"Happy Birthday":"Selamat Hari Jadi", s:en?"Another year of blessings":"Semoga dipanjangkan umur dalam kebaikan", ar:"بَارَكَ اللهُ فِي عُمُرِكَ", m:en?"May Allah bless your years with health, iman and happiness.":"Semoga Allah memberkati usia anda dengan kesihatan, iman dan kebahagiaan."},
    sembuh:{h:en?"Get well soon":"Semoga Cepat Sembuh", s:en?"Thinking of you":"Doa kami bersamamu", ar:"لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللهُ", m:en?"May Allah grant you complete healing and reward you for your patience.":"Semoga Allah menyembuhkan sepenuhnya dan memberi ganjaran atas kesabaran anda."},
    takziah:{h:en?"Our condolences":"Salam Takziah", s:en?"To Allah we belong":"Semoga tabah", ar:"إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ", m:en?"May Allah forgive the departed, have mercy on them and give the family patience.":"Semoga Allah mengampuni arwah, merahmatinya dan memberi kesabaran kepada keluarga."},
    terima:{h:en?"Thank you":"Terima Kasih", s:en?"Jazakallahu khairan":"Jazakallahu khairan", ar:"جَزَاكَ اللهُ خَيْرًا", m:en?"May Allah reward you with goodness for your kindness.":"Semoga Allah membalas kebaikan anda dengan sebaik-baik balasan."},
    haji:{h:en?"Hajj Mabrur":"Haji Mabrur", s:en?"Safe travels and an accepted Hajj or Umrah":"Selamat menunaikan ibadah", ar:"حَجًّا مَبْرُورًا وَسَعْيًا مَشْكُورًا", m:en?"May your journey be easy and your worship accepted.":"Semoga perjalanan dipermudahkan dan ibadah diterima Allah."},
    isra:{h:en?"Isra' Mi'raj":"Salam Israk Mikraj", s:en?"The night journey":"Peristiwa agung", ar:"سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ", m:en?"A reminder of the gift of solat. May we guard our five prayers.":"Peringatan tentang anugerah solat. Semoga kita menjaga solat lima waktu."},
    nuzul:{h:en?"Nuzul al-Quran":"Salam Nuzul Al-Quran", s:en?"The night the Quran was revealed":"Malam turunnya Al-Quran", ar:"شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ", m:en?"May the Quran be a light and a healing for our hearts.":"Semoga Al-Quran menjadi cahaya dan penawar hati kita."},
    qadar:{h:en?"Laylat al-Qadr":"Lailatulqadar", s:en?"Better than a thousand months":"Lebih baik daripada seribu bulan", ar:"لَيْلَةُ الْقَدْرِ خَيْرٌ مِنْ أَلْفِ شَهْرٍ", m:en?"May we meet this noble night and be forgiven.":"Semoga kita dipertemukan dengan malam yang mulia ini dan diampunkan dosa."},
    arafah:{h:en?"Day of Arafah":"Salam Hari Arafah", s:en?"The best day for du'a":"Hari terbaik untuk berdoa", ar:"خَيْرُ الدُّعَاءِ دُعَاءُ يَوْمِ عَرَفَةَ", m:en?"Remember to fast on Arafah and make plenty of du'a.":"Jangan lupa berpuasa Arafah dan memperbanyak doa."},
    terbuka:{h:en?"Open House Invitation":"Jemputan Rumah Terbuka", s:en?"In celebration of Eid":"Sempena Hari Raya", ar:"عِيدٌ مُبَارَكٌ", m:en?"You and your family are warmly invited to our open house. We would love to see you.":"Kami menjemput anda sekeluarga ke rumah terbuka kami. Kehadiran anda amat dihargai."},
    tunang:{h:en?"Congratulations on your engagement":"Tahniah atas pertunangan", s:en?"May the road to the nikah be easy":"Semoga dipermudahkan hingga ke jinjang pelamin", ar:"بَارَكَ اللهُ لَكُمَا", m:en?"May Allah bless this bond and unite you in goodness.":"Semoga Allah memberkati ikatan ini dan menyatukan kalian dalam kebaikan."},
    ulang:{h:en?"Happy Anniversary":"Selamat Ulang Tahun Perkahwinan", s:en?"A love blessed by Allah":"Kasih yang diberkati", ar:"وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً", m:en?"May your love and mercy for each other last until Jannah.":"Semoga kasih sayang kalian kekal hingga ke syurga."},
    aqiqah:{h:en?"Aqiqah":"Majlis Aqiqah", s:en?"Giving thanks for a new child":"Kesyukuran atas kelahiran", ar:"بَارَكَ اللهُ لَكَ فِي الْمَوْهُوبِ لَكَ", m:en?"May this child grow up in Allah's mercy and love.":"Semoga anak ini membesar dalam rahmat dan kasih sayang Allah."},
    rumah:{h:en?"Congratulations on your new home":"Tahniah Rumah Baharu", s:en?"May it be a home full of barakah":"Semoga rumah yang penuh berkat", ar:"رَبِّ أَنْزِلْنِي مُنْزَلًا مُبَارَكًا", m:en?"May this home be filled with dhikr, peace and joy.":"Semoga rumah ini dipenuhi zikir, ketenangan dan kegembiraan."},
    ibu:{h:en?"Happy Mother's Day":"Selamat Hari Ibu", s:en?"Paradise lies at the feet of mothers":"Syurga di bawah telapak kaki ibu", ar:"رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", m:en?"Thank you for a love that never ends. May Allah have mercy on you, Mother.":"Terima kasih atas kasih sayang yang tidak pernah putus. Semoga Allah merahmati ibu."},
    bapa:{h:en?"Happy Father's Day":"Selamat Hari Bapa", s:en?"Thank you, Dad":"Terima kasih, ayah", ar:"رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", m:en?"Thank you for your sacrifice and prayers. May Allah have mercy on you, Dad.":"Terima kasih atas pengorbanan dan doa ayah. Semoga Allah merahmati ayah."},
    khatam:{h:en?"Congratulations on completing the Quran":"Tahniah Khatam Al-Quran", s:en?"Among the people of the Quran":"Semoga menjadi ahli Al-Quran", ar:"خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", m:en?"May the Quran intercede for you and stay your companion for life.":"Semoga Al-Quran menjadi syafaat dan teman sepanjang hayat."},
    safar:{h:en?"Safe Travels":"Selamat Jalan", s:en?"Go well and come home safe":"Selamat pergi dan pulang", ar:"أَسْتَوْدِعُ اللهَ دِينَكَ وَأَمَانَتَكَ", m:en?"May your journey be easy and under Allah's protection.":"Semoga perjalanan dipermudahkan dan dilindungi Allah."},
    tahniah:{h:en?"Congratulations!":"Tahniah!", s:en?"On your achievement":"Atas kejayaan anda", ar:"مَا شَاءَ اللهُ تَبَارَكَ اللهُ", m:en?"May this success bring even more goodness.":"Semoga kejayaan ini membawa lebih banyak kebaikan."},
    lulus:{h:en?"Well done, you passed!":"Tahniah, anda berjaya!", s:en?"The fruit of effort and du'a":"Hasil usaha dan doa", ar:"مَا شَاءَ اللهُ تَبَارَكَ اللهُ", m:en?"Keep going. May this knowledge benefit you in this life and the next.":"Teruskan usaha. Semoga ilmu ini bermanfaat di dunia dan akhirat."},
    konvo:{h:en?"Happy Graduation":"Selamat Konvokesyen", s:en?"Another milestone reached":"Satu lagi kejayaan", ar:"رَبِّ زِدْنِي عِلْمًا", m:en?"May the knowledge you sought bring barakah and success.":"Semoga ilmu yang dituntut membawa keberkatan dan kejayaan."},
    kerja:{h:en?"Congratulations!":"Tahniah!", s:en?"On your new role":"Atas jawatan baharu", ar:"بَارَكَ اللهُ لَكَ", m:en?"May this provision be blessed and every task made easy.":"Semoga rezeki ini diberkati dan dipermudahkan segala urusan."},
    guru:{h:en?"Happy Teachers' Day":"Selamat Hari Guru", s:en?"Thank you, teacher":"Terima kasih, cikgu", ar:"جَزَاكَ اللهُ خَيْرًا", m:en?"Your work lights up our lives. May Allah reward every lesson you taught.":"Jasamu menerangi hidup kami. Semoga Allah membalas setiap ilmu yang diajar."},
    pencen:{h:en?"Happy Retirement":"Selamat Bersara", s:en?"A peaceful new chapter":"Babak baharu yang tenang", ar:"بَارَكَ اللهُ فِي عُمُرِكَ", m:en?"Thank you for your years of service. May the days ahead be full of peace.":"Terima kasih atas jasa dan bakti. Semoga hari-hari mendatang penuh ketenangan."},
    rindu:{h:en?"Thinking of you":"Rindu kamu", s:en?"Friends for the sake of Allah":"Ukhuwah kerana Allah", ar:"إِنِّي أُحِبُّكَ فِي اللهِ", m:en?"May Allah bring us together in goodness, here and in Jannah.":"Semoga Allah menghimpunkan kita dalam kebaikan, di dunia dan di syurga."},
    maaf:{h:en?"I'm sorry":"Mohon Maaf", s:en?"From a sincere heart":"Dari hati yang ikhlas", ar:"رَبَّنَا اغْفِرْ لَنَا", m:en?"Please forgive my mistakes. May our bond stay blessed.":"Maafkan segala salah dan silap. Semoga hubungan kita terus diberkati."},
    merdeka:{h:en?"Happy National Day":"Selamat Hari Kebangsaan", s:en?"United and grateful":"Bersatu, bersyukur", ar:"اَللّٰهُمَّ اجْعَلْ هٰذَا الْبَلَدَ آمِنًا", m:en?"May our country stay peaceful, prosperous and blessed.":"Semoga negara kita terus aman, makmur dan diberkati."},
    maulid:{h:en?"Mawlid al-Nabi":"Salam Maulidur Rasul", s:en?"Celebrating the Prophet ﷺ":"Selawat ke atas Nabi ﷺ", ar:"اَللّٰهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ", m:en?"May we follow his sunnah and love him more each day.":"Semoga kita mengikuti sunnahnya dan semakin mencintainya."}}[o] || {h:"", s:"", ar:"", m:""};
}
function kadDefaultOcc(){ var t=new Date(); t.setHours(0,0,0,0); var best=null, bd=1e9, map={ramadhan:"ramadan",fitri:"fitri",adha:"adha",muharram:"hijrah"};
  CD_EVENTS.forEach(function(e){ var ev=nextHijriEvent(e[1],e[2],e[3],e[4]); if(!ev) return; var d=ev.inProgress?0:Math.round((ev.start-t)/864e5); if(d<bd){ bd=d; best=map[e[0]]; } }); return best||"fitri"; }
function kadRand(seed){ var s=seed; return function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; }; }
function mix_(c){ var n=parseInt(String(c).replace("#",""),16), r=n>>16&255, g=n>>8&255, b=n&255; return "rgb("+[r,g,b].map(function(v){ return Math.round(v+(255-v)*0.45); }).join(",")+")"; }
function kadDraw(cv, K){
  var W=1080, H=1350, x=cv.getContext("2d"), C=KAD_COL.filter(function(c){ return c[0]===K.col; })[0]||KAD_COL[0], acc=C[3], fg=C[4], R=kadRand(7);
  var o={y:400, fy:H-130};
  if(window.KadArt) o=KadArt.draw(x, W, H, K.des, C, R); else { var g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,C[1]); g.addColorStop(1,C[2]); x.fillStyle=g; x.fillRect(0,0,W,H); }
  var dk=o.dark||(function(){ var n=parseInt(C[1].replace("#",""),16); return ((n>>16&255)*0.299+(n>>8&255)*0.587+(n&255)*0.114)<128; })();
  if(o.dark && !/^#fff/i.test(fg)){ fg="#fffaf0"; acc=mix_(acc); }
  x.shadowColor=dk?"rgba(0,0,0,.5)":"rgba(255,255,255,.4)"; x.shadowBlur=dk?10:4; x.shadowOffsetY=dk?3:1;
  var arF='"AmiriL","ScheherazadeL","Noto Naskh Arabic",serif', y=o.y, maxW=W-220;
  // 0.5.23 each text is a block that can be dragged (K.pos[k] = [dx, dy]) and sized (K.sc[k]); boxes are returned for hit tests
  var pos=K.pos||{}, sc=K.sc||{}, boxes=[];
  x.textAlign="center";
  var block=function(k, lines, font, size, lh, color, alpha, y0, rtl){ var d=pos[k]||[0,0], z=sc[k]||1, sz=size*z, top=y0+d[1]-sz, wMax=0;
    x.font=font.replace("$", Math.round(sz)); if(rtl) x.direction="rtl"; x.fillStyle=color; x.globalAlpha=alpha;
    lines.forEach(function(l, i){ x.fillText(l, W/2+d[0], y0+d[1]+i*lh*z); wMax=Math.max(wMax, x.measureText(l).width); });
    x.globalAlpha=1; x.direction="ltr"; var bh=sz*1.25+(lines.length-1)*lh*z; boxes.push({k:k, x:W/2+d[0]-wMax/2-12, y:top-6, w:wMax+24, h:bh+12}); };
  if(K.ar){ block("ar", [K.ar], "$px "+arF, 64, 70, acc, 1, y, true); y+=110; }
  var HF='"FrauncesW", Georgia, serif', hs=86; x.font="600 "+hs+"px "+HF; var hl=wrapLines(x, K.h, maxW); while(hl.length>3 && hs>56){ hs-=6; x.font="600 "+hs+"px "+HF; hl=wrapLines(x,K.h,maxW); }
  if(K.h){ block("h", hl, "600 $px "+HF, hs, hs*1.15, fg, 1, y, false); } y+=hl.length*hs*1.15;
  if(K.s){ block("s", [K.s], 'italic $px "FellLi", Georgia, serif', 48, 52, acc, 1, y+8, false); y+=86; }
  x.font='38px "FigtreeT", sans-serif'; var ml=wrapLines(x, K.m, maxW-40).slice(0,7); if(ml.length){ block("m", ml, '$px "FigtreeT", sans-serif', 38, 52, fg, 0.96, y+52, false); } y+=ml.length*52;
  if(K.f){ block("f", [K.f], '600 $px "FigtreeT", sans-serif', 40, 46, acc, 1, Math.min(y+110, o.fy), false); }
  x.shadowColor="transparent";
  (K.st||[]).forEach(function(t, i){ var sz=t.s||140; x.font=sz+'px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; x.textBaseline="middle"; x.fillText(t.e, t.x, t.y); x.textBaseline="alphabetic"; boxes.push({k:"st"+i, x:t.x-sz*0.6, y:t.y-sz*0.6, w:sz*1.2, h:sz*1.2}); });
  if(K.selBox){ boxes.forEach(function(b){ if(b.k===K.selBox){ x.save(); x.setLineDash([14,10]); x.strokeStyle=acc; x.lineWidth=4; x.strokeRect(b.x, b.y, b.w, b.h); x.restore(); } }); }
  return boxes;
}
function openCardMaker(occ){
  if(!window.KadArt){ loadJs(["kad/kad2.js"], function(){ openCardMaker(occ); }, function(){ window.KadArt=null; }); if(window.KadArt!==null) return; }
  var P=load("ihsan_kad",{}), o=occ||kadDefaultOcc(), D0=kadText(o), DF=KAD_DEF[o]||[];
  var K={occ:o, des:DF[0]||P.des||"geo", col:DF[1]||P.col||"hijau", h:D0.h, s:D0.s, ar:D0.ar, m:D0.m, f:P.f||"", showAr:true, pos:{}, sc:{}, st:[], sel:null}, boxes=[];
  var ov=document.getElementById("overlay"); ov.className="kadov"; var closed=false;
  ov.innerHTML='<div class="kadTop"><button class="chip" id="kdX">✕</button><b>🎴 '+L2x("Kad ucapan","Greeting card")+'</b><span></span></div><div class="kadBody"><canvas id="kdCv" width="1080" height="1350"></canvas>'+
    '<div class="kadF"><div class="ilChips">'+KAD_OCC.map(function(c){ return '<button class="chip" data-ko="'+c[0]+'">'+L2x(c[1],c[2])+'</button>'; }).join("")+'</div>'+
    '<div class="ilChips">'+(window.KadArt?KadArt.des:KAD_DES).map(function(c){ return '<button class="chip" data-kds="'+c[0]+'">'+L2x(c[1],c[2])+'</button>'; }).join("")+'</div>'+
    '<div class="ilChips">'+KAD_COL.map(function(c){ return '<button class="chip kcol" data-kc="'+c[0]+'"><i style="background:'+c[1]+';border-color:'+c[3]+'"></i>'+L2x(KAD_COLN[c[0]][0],KAD_COLN[c[0]][1])+'</button>'; }).join("")+'</div>'+
    '<div class="kadSel" id="kdSel"><span class="mut tiny">'+L2x("Seret teks atau pelekat pada kad. Ketik untuk pilih.","Drag text or stickers on the card. Tap to select.")+'</span></div>'+
    '<label class="kL">'+L2x("Pelekat","Stickers")+'</label><div class="kadStk">'+KAD_STK.map(function(e){ return '<button class="chip noico" data-kst="'+e+'">'+e+'</button>'; }).join("")+'</div>'+
    '<label class="kL">'+L2x("Ucapan","Greeting")+'</label><input id="kdH" class="ilq" maxlength="60"><input id="kdS" class="ilq" maxlength="60">'+
    '<label class="kL">'+L2x("Mesej anda","Your message")+'</label><textarea id="kdM" class="ilq" rows="3" maxlength="260"></textarea>'+
    '<label class="kL">'+L2x("Daripada","From")+'</label><input id="kdF" class="ilq" maxlength="50" placeholder="'+L2x("Contoh: Keluarga Ahmad","For example: The Ahmad family")+'">'+
    '<div class="set"><span>'+L2x("Ucapan dalam tulisan Arab","Greeting in Arabic script")+'</span>'+sw("kdA",true)+'</div>'+
    '<div class="btns" style="margin:10px 0 18px"><button class="btn gold" id="kdWa" style="flex:1">'+L2x("Hantar ke WhatsApp","Send to WhatsApp")+'</button><button class="btn alt" id="kdSh">↗ '+L2x("Kongsi","Share")+'</button></div></div></div>';
  var cv=ov.querySelector("#kdCv"), tm=0;
  var fill=function(){ ov.querySelector("#kdH").value=K.h; ov.querySelector("#kdS").value=K.s; ov.querySelector("#kdM").value=K.m; ov.querySelector("#kdF").value=K.f;
    Array.prototype.forEach.call(ov.querySelectorAll("[data-ko]"),function(b){ b.classList.toggle("on",b.getAttribute("data-ko")===K.occ); });
    Array.prototype.forEach.call(ov.querySelectorAll("[data-kds]"),function(b){ b.classList.toggle("on",b.getAttribute("data-kds")===K.des); });
    Array.prototype.forEach.call(ov.querySelectorAll("[data-kc]"),function(b){ b.classList.toggle("on",b.getAttribute("data-kc")===K.col); }); };
  var draw=function(clean){ if(closed) return; boxes=kadDraw(cv, {des:K.des, col:K.col, h:K.h, s:K.s, ar:K.showAr?K.ar:"", m:K.m, f:K.f?(en_()?"From ":"Daripada ")+K.f:"", pos:K.pos, sc:K.sc, st:K.st, selBox:clean?null:K.sel})||[]; K._boxes=boxes; };
  var selUi=function(){ var b=ov.querySelector("#kdSel"); if(!K.sel){ b.innerHTML='<span class="mut tiny">'+L2x("Seret teks atau pelekat pada kad. Ketik untuk pilih.","Drag text or stickers on the card. Tap to select.")+'</span>'+(Object.keys(K.pos).length||K.st.length?' <button class="chip" data-ks="reset">↺ '+L2x("Susun semula","Reset layout")+'</button>':''); }
    else b.innerHTML='<b class="small">'+L2x("Dipilih","Selected")+'</b> <button class="chip" data-ks="-">A−</button><button class="chip" data-ks="+">A+</button>'+(K.sel.indexOf("st")===0?'<button class="chip" data-ks="del">🗑</button>':'<button class="chip" data-ks="0">↺</button>')+'<button class="chip" data-ks="x">✓</button>';
    b.querySelectorAll("[data-ks]").forEach(function(c){ c.onclick=function(){ var a=c.getAttribute("data-ks"), st=K.sel&&K.sel.indexOf("st")===0?K.st[+K.sel.slice(2)]:null;
      if(a==="reset"){ K.pos={}; K.sc={}; K.st=[]; }
      else if(a==="x"){ K.sel=null; }
      else if(a==="del" && st){ K.st.splice(+K.sel.slice(2),1); K.sel=null; }
      else if(a==="0"){ delete K.pos[K.sel]; delete K.sc[K.sel]; }
      else { var f=a==="+"?1.15:1/1.15; if(st) st.s=Math.max(50, Math.min(500, (st.s||140)*f)); else K.sc[K.sel]=Math.max(0.4, Math.min(2.5, (K.sc[K.sel]||1)*f)); }
      selUi(); draw(); }; }); };
  // drag on the canvas (canvas units are 1080 x 1350)
  var cvPt=function(e){ var r=cv.getBoundingClientRect(), t=e.touches?e.touches[0]:e; return [(t.clientX-r.left)*cv.width/r.width, (t.clientY-r.top)*cv.height/r.height]; }, drag=null;
  var down=function(e){ var p=cvPt(e), hit=null; for(var i=boxes.length-1;i>=0;i--){ var b=boxes[i]; if(p[0]>=b.x && p[0]<=b.x+b.w && p[1]>=b.y && p[1]<=b.y+b.h){ hit=b.k; break; } }
    if(!hit){ if(K.sel){ K.sel=null; selUi(); draw(); } return; } e.preventDefault(); K.sel=hit; var st=hit.indexOf("st")===0?K.st[+hit.slice(2)]:null;
    drag={p:p, o:st?[st.x, st.y]:(K.pos[hit]||[0,0]).slice(), st:st}; selUi(); draw(); };
  var move=function(e){ if(!drag) return; e.preventDefault(); var p=cvPt(e), dx=p[0]-drag.p[0], dy=p[1]-drag.p[1];
    if(drag.st){ drag.st.x=Math.max(0, Math.min(1080, drag.o[0]+dx)); drag.st.y=Math.max(0, Math.min(1350, drag.o[1]+dy)); } else K.pos[K.sel]=[drag.o[0]+dx, drag.o[1]+dy]; draw(); };
  var up=function(){ drag=null; };
  cv.addEventListener("touchstart", down, {passive:false}); cv.addEventListener("touchmove", move, {passive:false}); cv.addEventListener("touchend", up);
  cv.addEventListener("mousedown", down); window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  Array.prototype.forEach.call(ov.querySelectorAll("[data-kst]"),function(b){ b.onclick=function(){ K.st.push({e:b.getAttribute("data-kst"), x:200+Math.random()*680, y:250+Math.random()*300, s:150}); K.sel="st"+(K.st.length-1); selUi(); draw(); }; });
  var later=function(){ clearTimeout(tm); tm=setTimeout(draw,180); };
  var keep=function(){ save("ihsan_kad",{des:K.des, col:K.col, f:K.f}); };
  fill(); try{ Promise.all([document.fonts.load('64px "AmiriL"'), document.fonts.load('64px "ScheherazadeL"')]).then(draw, draw); }catch(e){ draw(); }
  Array.prototype.forEach.call(ov.querySelectorAll("[data-ko]"),function(b){ b.onclick=function(){ K.occ=b.getAttribute("data-ko"); var t=kadText(K.occ); K.h=t.h; K.s=t.s; K.ar=t.ar; K.m=t.m; var df=KAD_DEF[K.occ]; if(df && !K.mine){ K.des=df[0]; K.col=df[1]; } fill(); draw(); }; });
  Array.prototype.forEach.call(ov.querySelectorAll("[data-kds]"),function(b){ b.onclick=function(){ K.des=b.getAttribute("data-kds"); K.mine=1; keep(); fill(); draw(); }; });
  Array.prototype.forEach.call(ov.querySelectorAll("[data-kc]"),function(b){ b.onclick=function(){ K.col=b.getAttribute("data-kc"); K.mine=1; keep(); fill(); draw(); }; });
  ov.querySelector("#kdH").oninput=function(){ K.h=this.value; later(); };
  ov.querySelector("#kdS").oninput=function(){ K.s=this.value; later(); };
  ov.querySelector("#kdM").oninput=function(){ K.m=this.value; later(); };
  ov.querySelector("#kdF").oninput=function(){ K.f=this.value; keep(); later(); };
  ov.querySelector("#kdA").onchange=function(){ K.showAr=this.checked; draw(); };
  var out=function(pkg){ draw(true); var url=cv.toDataURL("image/png"), txt=K.h+(K.s?" · "+K.s:"")+(K.f?"\n"+(en_()?"From ":"Daripada ")+K.f:"");
    if(window.Native && pkg && N.shareTo) N.shareTo(pkg, url, txt);
    else if(window.Native && N.shareImage) N.shareImage(url, txt);
    else { var a=document.createElement("a"); a.href=url; a.download=L2x("kad-","card-")+K.occ+".png"; document.body.appendChild(a); a.click(); a.remove(); } };
  ov.querySelector("#kdWa").onclick=function(){ out("com.whatsapp"); };
  ov.querySelector("#kdSh").onclick=function(){ out(""); };
  var close=function(){ closed=true; clearTimeout(tm); window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); closeOverlay(); };
  ov.querySelector("#kdX").onclick=close; ov._close=close; window.__kad=K;
}

// ---------- 62: auto silent at the masjid ----------
function mqCfg(){ var m=S.mq||{}; m.list=m.list||[]; m.r=m.r||100; return m; }
function mqPush(){ try{ if(N.setMasjids) N.setMasjids(JSON.stringify({on:!!mqCfg().on, list:mqCfg().list})); }catch(e){} }
function mqCard(){
  var m=mqCfg(), bg=N.hasPerm("bgloc"), fine=N.hasPerm("location"), dnd=N.hasPerm("dnd");
  var h='<div class="card cmp" id="mqCard"><h3>🕌 '+L2x("Senyap automatik di masjid","Auto silent at the masjid")+'</h3><div class="mut tiny" style="line-height:1.45;margin-bottom:6px">'+L2x("Telefon disenyapkan apabila anda tiba di masjid atau surau yang disimpan, dan berbunyi semula apabila anda keluar. Lokasi diperiksa oleh telefon sahaja dan tidak dihantar ke mana-mana. Android mungkin lewat beberapa minit mengesan anda tiba atau keluar.","The phone goes silent when you arrive at a saved masjid or surau, and rings again when you leave. Your location is checked on the phone only and is not sent anywhere. Android may take a few minutes to notice you arriving or leaving.")+'</div>'+
    '<div class="set"><span>'+L2x("Hidupkan","Turn on")+'</span>'+sw("mqOn",m.on)+'</div>';
  if(m.on) h+='<div class="mqPerm"><div>'+(fine?'✅':'⚠️')+' '+L2x("Lokasi: Semasa apl digunakan","Location: While using the app")+(fine?'':' <button class="chip" id="mqBg">'+L2x("Benarkan","Allow")+'</button>')+'</div><div class="mut tiny">'+L2x("Lokasi diperiksa hanya semasa My Ihsan atau skrin utamanya dibuka. My Ihsan tidak menggunakan lokasi di latar belakang.","Location is checked only while My Ihsan or its home screen is open. My Ihsan does not use location in the background.")+'</div>'+
    '<div>'+(dnd?'✅':'ℹ️')+' '+L2x("Akses Jangan Ganggu","Do Not Disturb access")+(dnd?'':' <button class="chip" id="mqDnd">'+L2x("Benarkan","Allow")+'</button>')+'</div>'+(dnd?'':'<div class="mut tiny">'+L2x("Tanpa akses ini, telefon ditukar ke mod getar sahaja.","Without this access the phone switches to vibrate only.")+'</div>')+'</div>';
  h+=(m.list.length?m.list.map(function(x,i){ return '<div class="mqRow"><span>🕌</span><div><b>'+esc(x.n)+'</b><div class="mut tiny">'+x.lat.toFixed(5)+', '+x.lon.toFixed(5)+' · '+x.r+' m</div></div><button class="chip" data-mqx="'+i+'" aria-label="'+L2x("Padam","Delete")+'">✕</button></div>'; }).join(""):'<div class="mut small" style="margin:6px 0">'+L2x("Belum ada masjid atau surau disimpan.","No masjid or surau saved yet.")+'</div>');
  h+='<details class="mqAdd"'+(m.list.length?'':' open')+'><summary>＋ '+L2x("Tambah masjid atau surau","Add a masjid or surau")+'</summary>'+
    '<input id="mqN" class="ilq" maxlength="60" placeholder="'+L2x("Nama, contoh: Masjid Al-Hidayah","Name, for example: Masjid Al-Hidayah")+'">'+
    '<div class="set"><span>'+L2x("Jejari","Radius")+'</span>'+chipSet("data-mqr",m.r,[[60,"60 m"],[100,"100 m"],[150,"150 m"]])+'</div>'+
    '<button class="btn alt full" id="mqHere">📍 '+L2x("Saya di masjid sekarang: simpan lokasi ini","I am at the masjid now: save this location")+'</button>'+
    '<input id="mqC" class="ilq" style="margin-top:8px" placeholder="'+L2x("Atau tampal koordinat: 3.13900, 101.68690","Or paste coordinates: 3.13900, 101.68690")+'"><button class="btn alt full" id="mqCo">'+L2x("Simpan koordinat","Save coordinates")+'</button>'+
    '<div class="mut tiny" style="margin-top:6px">'+L2x("Dalam Google Maps, tekan lama pada masjid untuk melihat dan menyalin koordinatnya.","In Google Maps, press and hold on the masjid to see and copy its coordinates.")+'</div></details></div>';
  return h;
}
function bindMq(el){
  var c=el.querySelector("#mqCard"); if(!c) return;
  var setM=function(f){ var m=mqCfg(); f(m); S.mq=m; saveS(); mqPush(); render(); };
  var askBg=function(){ if(!N.hasPerm("location")){ var hp=function(p){ if(p.which!=="location") return; off("perm",hp); if(p.granted) askBg(); else render(); }; on("perm",hp); N.requestPerm("location"); return; }
    mqPush(); };
  c.querySelector("#mqOn").onchange=function(){ var on2=this.checked; setM(function(m){ m.on=on2; }); if(on2) askBg(); };
  var b1=c.querySelector("#mqBg"); if(b1) b1.onclick=askBg;
  var b2=c.querySelector("#mqDnd"); if(b2) b2.onclick=function(){ N.requestPerm("dnd"); };
  c.querySelectorAll("[data-mqx]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-mqx"); setM(function(m){ m.list.splice(i,1); }); }; });
  c.querySelectorAll("[data-mqr]").forEach(function(b){ b.onclick=function(){ var r=+b.getAttribute("data-mqr"); var m=mqCfg(); m.r=r; S.mq=m; saveS(); c.querySelectorAll("[data-mqr]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
  var nameOf=function(){ return (c.querySelector("#mqN").value.trim()||L2x("Masjid","Masjid")).slice(0,60); };
  var addAt=function(lat,lon){ if(mqCfg().list.length>=20){ toast(L2x("Maksimum 20 tempat","20 places at most")); return; } var n=nameOf(); setM(function(m){ m.list.push({n:n, lat:+lat, lon:+lon, r:m.r||100}); m.on=true; }); toast(L2x("Disimpan: ","Saved: ")+n); if(!N.hasPerm("location")) askBg(); };
  c.querySelector("#mqHere").onclick=function(){ var hl=function(r){ off("location",hl); if(r.error){ toast(L2x("Lokasi tidak tersedia","Location unavailable")); return; } addAt(r.lat,r.lon); };
    if(N.hasPerm("location")){ on("location",hl); N.getLocation(); } else { var hp=function(p){ if(p.which!=="location") return; off("perm",hp); if(p.granted){ on("location",hl); N.getLocation(); } }; on("perm",hp); N.requestPerm("location"); } };
  c.querySelector("#mqCo").onclick=function(){ var mm=String(c.querySelector("#mqC").value).match(/(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/);
    if(!mm || Math.abs(+mm[1])>90 || Math.abs(+mm[2])>180){ toast(L2x("Koordinat tidak sah","Coordinates not valid")); return; } addAt(+mm[1], +mm[2]); };
}

// ---------- KIDS ----------
// ---------- 0.7.52: Kids Planet (the new Kids mode home): a round toy world with houses, built in kidsworld/ ----------
function kwCss(){ if(!document.querySelector('link[href="kidsworld/kw.css"]')){ var l=document.createElement("link"); l.rel="stylesheet"; l.href="kidsworld/kw.css"; document.head.appendChild(l); } }
function kwAvatar(){ var id=load("ihsan_kwav",null); if(!id) return null; var d=load("ihsan_vpet",null), l=d&&Array.isArray(d.list)?d.list:[]; return l.filter(function(x){ return x.id===id; })[0]||null; }
function kwHelpers(){ return {pets:function(){ return petH(); }, loadJs:loadJs, avatar:kwAvatar, phonePets:function(){ var d=load("ihsan_vpet",null); return d&&Array.isArray(d.list)?d.list:[]; }, setAvatar:function(id){ save("ihsan_kwav", id||null); }, L2x:L2x, esc:esc, load:load, save:save, toast:toast, en:en_, vib:function(ms){ try{ N.vibrate(ms); }catch(e){} }, say:function(t){ try{ speakAr(t); }catch(e){} }, pinAsk:pinAsk,
  hijri:function(){ try{ var h=hijriOf(new Date()); return h?hijriStr(h):""; }catch(e){ return ""; } },
  learn:function(p){ learnPg=p; learnFrom="kids"; go("learn"); }, sirah:function(){ openSirah(true); }, hajj:function(){ openHajj(); },
  share:function(t, txt){ if(window.Native && N.shareText) N.shareText(txt); else if(navigator.share) navigator.share({title:t, text:txt}).catch(function(){}); else if(navigator.clipboard) navigator.clipboard.writeText(txt).then(function(){ toast(L2x("Disalin","Copied")); }); },
  quiz:function(){ withExtra(null, function(){ IbExtra.openQuiz(xH()); }); },
  canPlanner:function(){ return !S.kidLock; }, planner:function(){ go("cal"); }, noGL:function(){ kidsSel="simple"; } }; }
var kwReq=false;
function kwLoad(el, sel, prev){ var host=el.querySelector(sel||"#kwHost"); if(!host) return; kwCss();
  var run=function(){ if(!document.body.contains(host)) return; var hp=kwHelpers(); if(prev){ hp.preview=true; hp.noGL=function(){ host.innerHTML='<div class="kwPkFb">🌍</div>'; }; } try{ window.KW.render(host, hp); }catch(err){ if(prev){ host.innerHTML='<div class="kwPkFb">🌍</div>'; return; } console.error(err); host.innerHTML='<div class="card mut">'+L2x("Planet tidak dapat dimuatkan. Guna paparan ringkas.","The planet could not load. Use the simple view.")+'</div>'; } };
  var avNeed=!prev && kwAvatar() && !window.VPetArt;   // 0.7.73: a phone pet walks the planet; load its builders first
  if(window.KW && window.KW.render){ if(avNeed){ loadJs((window.THREE?[]:["hajj/three.min.js"]).concat(["pets/vpet/vpet.js"]), run, run); return; } run(); return; }
  host.innerHTML=prev?'<div class="kwPkFb">🌍</div>':'<div class="card mut">🌍 '+L2x("Memuatkan planet…","Loading the planet…")+'</div>'; if(kwReq){ var w8=setInterval(function(){ if(!document.body.contains(host)){ clearInterval(w8); return; } if(window.KW && window.KW.render && !kwReq){ clearInterval(w8); run(); } }, 200); return; } kwReq=true;
  loadJs((window.THREE?[]:["hajj/three.min.js"]).concat(["kidsworld/kw_data.js","kidsworld/kw_data2.js","kidsworld/kw_play.js","kidsworld/kw_parent.js","kidsworld/kw_world.js"].concat(avNeed?["pets/vpet/vpet.js"]:[])), function(){ kwReq=false; run(); }, function(){ kwReq=false; host.innerHTML='<div class="card mut">'+L2x("Gagal memuatkan planet.","Could not load the planet.")+'</div>'; }); }
// 0.7.56 (owner): Kids mode opens on two big banners side by side: Simple and Planet (the planet banner plays the real planet as a moving clip)
var kidsSel=null;
function kidsBack(){ kidsSel=null; if(!S.kidLock){ SUB2.learn="kisah"; learnPg=null; learnFrom=null; go("learn"); } else { render(); document.getElementById("view").scrollTop=0; } }
function kidsPick(el){ var K=load("ihsan_kids",{}), today=K[ymd(new Date())]||{}, n=PR.filter(function(k){return today[k];}).length, kw=load("ihsan_kw",{})||{};
  el.innerHTML=kidsTop()+'<div class="kwPick"><button class="kwPk sim" id="kpSimple"><span class="kwPkI">📗</span><span class="kwPkS">'+PR.map(function(k){ return today[k]?"⭐":"☆"; }).join("")+'</span><b>Iqra</b><small>'+L2x("Bintang solat, Juz Amma, huruf, kisah dan doa","Prayer stars, Juz Amma, letters, stories and duas")+'</small><span class="kwPkGo">'+n+'/5 ⭐</span></button>'+
    '<button class="kwPk pla" id="kpPlanet"><span class="kwPkV" id="kwPrev"></span><span class="kwPkT"><b>🌍 '+L2x("Planet","Planet")+'</b><small>'+L2x("Jelajah, lawat rumah, kumpul bintang","Roam, visit houses, collect stars")+'</small><span class="kwPkGo">⭐ '+(kw.stars||0)+'</span></span></button>'+kidsPetsBanner()+'</div>'+kidsLockCard();
  bindKidsTop(el); el.querySelector("#kpSimple").onclick=function(){ kidsSel="simple"; go("kids"); };
  el.querySelector("#kpPlanet").onclick=function(){ kidsSel="planet"; go("kids"); };
  var kpp=el.querySelector("#kpPets"); if(kpp) kpp.onclick=openPhonePets;
  kwLoad(el, "#kwPrev", true); }
// 0.7.74 (owner): the phone pets live in Kids mode (a third banner), not in Tools › Pets
function kidsPetsBanner(){ var d=load("ihsan_vpet",null), l=d&&Array.isArray(d.list)?d.list:[], em={cat:"🐈",bird:"🐦",fish:"🐠"};
  return '<button class="kwPk pet" id="kpPets"><span class="kwPkP">'+(l.length?l.map(function(x){ return '<i>'+(em[x.sp]||"🐾")+'</i>'; }).join(""):'<i>🐈</i><i>🐦</i><i>🐠</i>')+'</span><span class="kwPkT"><b>🎮 '+L2x("Pet telefon","Phone pets")+'</b><small>'+(l.length?l.map(function(x){ return esc(x.n); }).join(" · "):L2x("Jaga kucing, burung dan ikan 3D, sehingga 3. Mereka boleh berjumpa dan main di Planet.","Look after a 3D cat, bird and fish, up to 3. They meet and play in the Planet."))+'</small></span></button>'; }
function openPhonePets(){ var go_=function(){ try{ if(window.KW && KW.cur && KW.cur.stop) KW.cur.stop(); }catch(e){} PhonePets.open(petH(), {onClose:function(){ if(view==="learn"||view==="kids") render(); }}); }; if(window.PhonePets) go_(); else loadJs(["pets/phonepets.js"], go_, function(){ toast(L2x("Gagal dimuatkan","Could not load")); }); }
function vKids(el){
  if(!kidsSel){ if(!S.kidLock){ SUB2.learn="kisah"; learnPg=null; learnFrom=null; el.innerHTML=""; setTimeout(function(){ if(view==="kids" && !kidsSel) go("learn"); }, 0); return; } kidsPick(el); return; }   // 0.7.60: the banners live in Learn › Kids
  if(kidsSel==="planet"){ var pl=kidsTop()+'<div class="kwWrap" id="kwHost"></div><div class="row" style="justify-content:center;margin:6px 0"><button class="chip" id="kwSimple">‹ '+L2x("Mod kanak-kanak","Kids mode")+'</button>'+(S.kidLock?'':'<button class="chip" id="kwHome">🏠 '+L2x("Utama","Home")+'</button>')+'</div>'+kidsLockCard(); el.innerHTML=pl; bindKidsTop(el); var sw=el.querySelector("#kwSimple"); if(sw) sw.onclick=kidsBack; var kh=el.querySelector("#kwHome"); if(kh) kh.onclick=function(){ go("home"); }; kwLoad(el); return; }
  var K=load("ihsan_kids",{}), ds=ymd(new Date()), today=K[ds]||{}, en=en_(), n=PR.filter(function(k){return today[k];}).length;
  var html=kidsTop()+'<div class="row" style="margin:0 2px 8px"><button class="chip" id="kwBackK">‹ '+L2x("Mod kanak-kanak","Kids mode")+'</button><span></span></div><div class="card kids"><h3 style="font-size:22px">🧒 '+L2x("Assalamualaikum! Sudah solat hari ini?","Assalamualaikum! Have you prayed today?")+'</h3><div class="kgrid">'+PR.map(function(k){ return '<button class="kb'+(today[k]?" on":"")+'" data-kp="'+k+'"><span class="kst">'+(today[k]?"⭐":"☆")+'</span>'+T(k)+'</button>'; }).join("")+'</div>'+
    '<div class="kcount">'+n+' / 5 '+L2x("bintang hari ini","stars today")+'</div></div>';
  html+='<button class="sirahHero kids" data-sirah="kids"><span class="shSky"></span><span class="shDune"></span><span class="shTxt"><b>🐪 '+L2x("Jejak Sirah Nabi ﷺ","The Prophet's ﷺ Sirah Trail")+'</b><small>'+L2x("Ikut unta merentas padang pasir dan kumpul lencana!","Follow the camel across the desert and collect badges!")+'</small></span><span class="shGo">›</span></button>';
  html+=hajjHero(true);
  var hjS=Object.keys((load("ihsan_hijaiyah",{s:{}}).s)||{}).length, sbD=Object.keys((load("ihsan_sbk",{done:{}}).done)||{}).length;
  var jmS=Object.keys((load("ihsan_jamma",{s:{}}).s)||{}).length;
  html+='<button class="kHero jm" data-learn="jamma" data-from="kids" style="width:100%;margin-bottom:10px"><span class="ar">عَمَّ</span><b>'+L2x("Juz Amma","Juz Amma")+'</b><small>⭐ '+jmS+'/37 '+L2x("surah","surahs")+'</small></button>';
  html+='<div class="kHero2"><button class="kHero hj" data-learn="hijaiyah" data-from="kids"><span class="ar">ا ب ت</span><b>'+L2x("Huruf Hijaiyah","Arabic letters")+'</b><small>⭐ '+hjS+'/29</small></button>'+
    '<button class="kHero sb" data-learn="sahabat" data-from="kids" data-kmode="k"><span class="kI">🏅</span><b>'+L2x("Kisah Sahabat","Companion stories")+'</b><small>'+L2x("Lencana ","Badges ")+sbD+'/16</small></button></div>';
  var wk=''; for(var i=6;i>=0;i--){ var d=addDays(new Date(),-i), k2=K[ymd(d)]||{}, c=PR.filter(function(k){return k2[k];}).length; wk+='<div class="kd"><div class="mut tiny">'+d.toLocaleDateString(locTag(),{weekday:"short"})+'</div><div class="kds">'+(c?"⭐".repeat(Math.min(c,5)):"·")+'</div></div>'; }
  html+='<div class="card"><h3>'+L2x("Minggu ini","This week")+'</h3><div class="kweek">'+wk+'</div></div>';
  html+='<div class="card"><h3>🤲 '+L2x("Doa harian","Daily doa")+'</h3>'+KIDS_DOA.map(function(t){ var it=null; DOA.forEach(function(c){ c.items.forEach(function(x){ if(!it && x.t_ms===t) it=x; }); }); if(!it) return ''; return '<div class="kdoa"><div class="row"><b>'+esc(en?it.t_en:it.t_ms)+'</b>'+sayBtn(it.ar)+'</div><div class="ar" style="font-size:28px">'+it.ar+'</div><div class="rumi">'+esc(Rumi.conv(it.ar))+'</div><div class="tr">'+esc(tr(it))+'</div></div>'; }).join("")+'</div>';
  html+='<div class="btns" style="margin-bottom:14px"><button class="btn gold" data-learn="nabi" data-from="kids">🌿 '+L2x("Kisah Nabi","Prophet stories")+'</button><button class="btn alt" data-learn="wudhu" data-from="kids">💧 '+L2x("Cara wuduk","Wudhu")+'</button><button class="btn alt" data-learn="solat" data-from="kids">🧎 '+L2x("Cara solat","How to pray")+'</button></div>';
  html+='<div class="row" style="justify-content:center;margin:6px 0"><button class="chip" id="kwPlanetOn">🌍 '+L2x("Planet Kanak-kanak","Kids Planet")+'</button></div>'+kidsLockCard();
  el.innerHTML=html; bindKidsTop(el); var pb=el.querySelector("#kwPlanetOn"); if(pb) pb.onclick=function(){ kidsSel="planet"; render(); document.getElementById("view").scrollTop=0; };
  var bk=el.querySelector("#kwBackK"); if(bk) bk.onclick=kidsBack;
  el.querySelectorAll("[data-kp]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-kp"); K[ds]=K[ds]||{}; K[ds][k]=!K[ds][k]; save("ihsan_kids",K); N.vibrate(60);
    var c=PR.filter(function(x){return K[ds][x];}).length; if(c===5 && K[ds][k]){ N.vibrate(600); toast(L2x("MasyaAllah! 5 bintang hari ini 🌟","MasyaAllah! 5 stars today 🌟")); } render(); }; });
}

// ---------- helpers for media.js (radio & podcast) ----------
var fSeq=0;
function nFetch(url, cb){ var id="m"+(++fSeq)+"_"+Date.now(); var h=function(r){ if(r.id!==id) return; off("fetch",h); cb(r.status, r.body); }; on("fetch",h);
  if(window.Native && N.fetchText) N.fetchText(id,url); else if(window.Native) N.fetchUrl(id,url);
  else fetch(url).then(function(r){ return r.text().then(function(t){ window.onNative("fetch",{id:id,status:r.status,body:t}); }); }).catch(function(e){ window.onNative("fetch",{id:id,status:0,body:String(e)}); }); }
window.IBH={reviewShare:function(){ reviewShare(); }, curNow:function(){ return curNow(); }, ctryOf:function(a,o){ return ctryOf(a,o); }, askLocation:function(z){ askLocation(z); }, pushSchedule:function(){ pushSchedule(); }, S:function(){ return S; }, saveS:function(){ saveS(); }, N:N, on:on, off:off, load:load, save:save, esc:esc, L2x:L2x, en:en_, toast:toast, showSheet:showSheet, closeOverlay:closeOverlay, render:render, go:go,
  fetch:nFetch, loadJs:loadJs, prayNow:function(){ try{ var t=getDay(new Date()), n=new Date(), m=n.getHours()*60+n.getMinutes(); return PR.some(function(k){ var p=String(t[k]||'').split(':'); if(p.length<2) return false; var x=(+p[0])*60+(+p[1]); return m>=x && m<x+2; }); }catch(e){ return false; } }, dockFix:dockFix, view:function(){ return view; }, learnPg:function(){ return learnPg; }, setLearn:function(p){ learnPg=p; }, durEn:durEn, cdStr:cdStr, locTag:locTag, t523:{xrem:xrem, upcoming:function(){ return upcoming(10); }, card:function(o){ openCardMaker(o); }, pdf:canvasPdf, dspH:function(){ return dspH(); }, note:function(n){ ntEdit(n, false, null); }}};
// ---------- 0.5.17-dev: review notices ----------
// Notes such as "pending ustaz review" are folded into a small "ⓘ Review note" dropdown wherever they appear,
// and every item still waiting for review is listed in Settings › Backup & about › About.
var RV_RE=/(semakan ustaz|disemak (oleh |dengan )?(ustaz|buku)|perlu disemak|menunggu semakan|semak dengan ustaz|perlu semakan|ustaz review|reviewed by an ustaz|review by an ustaz|check(ed)? with an ustaz|checked against an endorsed|an ustaz's review|pending review)/i;
var REVIEW_LIST=[
  ["🔤","Huruf: bentuk abjad jari BIM (1 tangan), perlu disemak oleh guru BIM","Letters: BIM one-hand fingerspelling shapes, to be checked by a BIM teacher"],
  ["🙌","Huruf: abjad 2 tangan BSL (12 huruf) dan isyarat huruf Hijaiyah/Jawi, menunggu semakan guru bahasa isyarat","Letters: two-hand BSL letters (12) and Hijaiyah/Jawi hand signs, waiting for a sign-language teacher's review"],
  ["🗣","Huruf: rakaman sebutan huruf Hijaiyah (makhraj) oleh qari, perlu disemak oleh ustaz; buat masa ini guna teks-ke-suara","Letters: qari recordings of the Hijaiyah letters (makhraj), to be checked by an ustaz; text-to-speech for now"],
  ["🕌","Niat solat dan solat sunat (mazhab Syafi'i)","Prayer intentions and sunnah prayers (Shafi'i school)"],
  ["🤲","Doa harian dan doa tambahan: lafaz dan sumber","Daily and extra doa: wording and sources"],
  ["📖","Al-Ma'thurat: susunan, lafaz dan bilangan","Al-Ma'thurat: order, wording and counts"],
  ["🌄","Wirid dan susunan selepas solat","Wirid and the after-prayer order"],
  ["✨","Asmaul Husna: huraian dan rujukan ayat","Names of Allah: explanations and ayat references"],
  ["📚","Fiqh Syafi'i (H. Idris Ahmad): teks diimbas","Shafi'i fiqh (H. Idris Ahmad): scanned text"],
  ["📖","Al-Quran: maksud nama surah dan topik ayat","Quran: Malay meanings of surah names and ayat topics"],
  ["🔤","Bacaan dan tajwid","Reading and tajwid lessons"],
  ["🐪","Kisah Nabi dan Sirah (kanak-kanak dan dewasa)","Stories of the Prophets and Sirah (children and adults)"],
  ["🕋","Haji 3D dan Umrah DIY: nota ibadah","Hajj 3D and Umrah DIY: worship notes"],
  ["🏃","Gerak: rujukan hadis","Move: hadith references"],
  ["💰","Kewangan: maksud ringkas ayat","Finance: short meanings of ayat"],
  ["📈","Saham patuh Syariah: semak semula dengan senarai Suruhanjaya Sekuriti","Shariah stocks: re-check against the Securities Commission list"],
  ["👶","Nama bayi: maksud nama","Baby names: meanings"],
  ["👥","Kumpulan: doa untuk berita kematian","Groups: the doa in death notices"],
  ["🧰","Teks Arab dalam Alat tambahan","Arabic text in the extra tools"],
  ["🎒","Sekolah: Pendidikan Islam, Jawi, Bahasa Arab dan huruf hijaiyah (Sedia–Tahun 6)","School: Islamic Education, Jawi, Arabic and hijaiyah letters (Pre-Year 1 to Year 6)"],
  ["🎒","Sekolah: semua subjek lain perlu disemak guru","School: every other subject needs a teacher's review"],
  ["🧾","Cukai LHDN: senarai pelepasan, had dan kadar cukai (YA 2025) perlu disemak setiap tahun; bukan nasihat cukai","LHDN tax: the relief list, limits and tax rates (YA 2025) need checking every year; not tax advice"],
  ["✍️","Tekap: ukuran Old English (mata pena) dan Naskh (titik), istilah anatomi Naskh, perkataan hari ini (Arab) dan helaian latihan ayat","Trace: Old English (nib) and Naskh (dot) proportions, Naskh anatomy terms, the word of the day (Arabic) and the ayat practice sheets"]
];
function reviewListHtml(){ return '<details class="rvList"><summary>📋 '+L2x("Kandungan yang menunggu semakan ustaz","Content waiting for an ustaz's review")+' ('+REVIEW_LIST.length+')</summary><div class="mut tiny" style="margin:4px 0">'+L2x("Ditulis dengan teliti tetapi belum disemak oleh ustaz bertauliah. Sila laporkan kesilapan melalui Tetapan › Lapor kesilapan.","Written with care but not yet checked by a qualified ustaz. Please report mistakes through Settings › Report a mistake.")+'</div><ul>'+REVIEW_LIST.map(function(x){ return '<li>'+x[0]+' '+esc(L2x(x[1],x[2]))+'</li>'; }).join("")+'</ul><button class="btn alt g3d" type="button" onclick="IBH.reviewShare()">↗ '+L2x("Kongsi senarai untuk pusingan semakan","Share the list for a review round")+'</button></details>'; }
// 0.5.20 (review 21): one tap sends the whole list (both languages, with the app version and the Sekolah packs) to a reviewer
function reviewShare(){ var t="My Ihsan "+APP_VER+" · "+L2x("Senarai semakan ustaz","Ustaz review list")+"\n\n"+REVIEW_LIST.map(function(x, i){ return (i+1)+". "+x[1]+" / "+x[2]; }).join("\n")+
  "\n\n"+L2x("Sekolah: semua pek bertanda Draf perlu disemak guru (dan ustaz bagi Pendidikan Islam, Jawi, Bahasa Arab). Fail semakan: notes/silibus.","School: every pack marked Draft needs a teacher's review (and an ustaz's for Islamic Education, Jawi, Arabic). Review files: notes/silibus.")+
  "\n\n"+L2x("Tanda setiap perkara: ✓ betul, ✎ perlu dibetulkan (nyatakan), ✗ buang.","Mark each item: ✓ correct, ✎ needs a fix (say what), ✗ remove.");
  if(window.Native && N.shareText) N.shareText(t); else if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ toast(L2x("Disalin","Copied")); }); }
function foldReview(root){ try{ if(!root || !root.querySelectorAll) return;
  var c=[].slice.call(root.querySelectorAll(".mut,.warnbox,.small,.tiny,small,p,.note")); if(root.matches && root.matches(".mut,.warnbox,.small,.tiny,small,p,.note")) c.unshift(root);
  c.forEach(function(e){ if(!e.isConnected || e.closest(".rvw,.rvList,#aboutCard,input,textarea,button,summary,#obx")) return; var t=e.textContent||""; if(t.length>900 || !RV_RE.test(t)) return;
    if([].some.call(e.querySelectorAll(".mut,.warnbox,.small,.tiny,small,p,.note"), function(k){ return RV_RE.test(k.textContent||""); })) return; // fold the innermost one
    var d=document.createElement("details"); d.className="rvw"; d.innerHTML='<summary>ⓘ '+L2x("Nota semakan","Review note")+'</summary>'; e.parentNode.insertBefore(d, e); d.appendChild(e); }); }catch(err){} }
// ---------- 0.5.17-dev.8: even option rows ----------
// A wrapping group of 3+ chips or buttons used to break wherever the text ran out (4 + 3 + 2 ...). Now it is laid out in
// balanced rows that each fill the full width: the widest option sets how many fit in a row, the options are shared out
// evenly (9 -> 3·3·3, 7 -> 4·3) and each row's items share its width equally. Short groups first try a tighter style to stay
// on one row. On a wide or unfolded screen the whole group sits on one row. Re-laid out on resize (fold / unfold / turn).
function gcd(a,b){ return b ? gcd(b, a%b) : a; }
function evenRows(box){ try{
  var kids=[].filter.call(box.children, function(k){ return k.offsetParent!==null || getComputedStyle(k).display!=="none"; });
  var cs=getComputedStyle(box); if(box.classList.contains("evenR")){ box.classList.remove("evenR"); box.classList.remove("evenT"); kids.forEach(function(k){ k.style.gridColumn=""; }); cs=getComputedStyle(box); }
  if(kids.length<3 || cs.display.indexOf("flex")<0 || cs.flexWrap!=="wrap") return;   // single scrolling rows (nowrap) stay as they are
  if(kids.some(function(k){ return !/^(BUTTON|A|LABEL)$/.test(k.tagName) || k.classList.contains("hidden"); })) return;
  var W=box.clientWidth; if(W<120) return;
  var gap=parseFloat(cs.columnGap)||6, measure=function(){ box.classList.add("evenM"); var w=kids.map(function(k){ return Math.ceil(k.getBoundingClientRect().width); }); box.classList.remove("evenM"); return Math.max.apply(null, w); };
  var maxW=measure(), cols=Math.max(1, Math.floor((W+gap)/(maxW+gap)));
  if(cols<kids.length){ box.classList.add("evenT"); var t=measure(), c2=Math.max(1, Math.floor((W+gap)/(t+gap)));
    // the tighter style is kept only when it puts more options on each row (fewer rows)
    if(Math.ceil(kids.length/Math.min(c2, kids.length)) < Math.ceil(kids.length/cols)) cols=c2; else box.classList.remove("evenT"); }
  var n=kids.length, rows=Math.ceil(n/Math.min(cols, n)), base=Math.floor(n/rows), extra=n%rows, sizes=[];
  for(var r=0;r<rows;r++) sizes.push(base+(r<extra?1:0));
  var L=sizes.reduce(function(a,b){ return a*b/gcd(a,b); }, 1); if(L>60) return;
  box.classList.add("evenR"); box.style.setProperty("--evenL", L);
  var i=0; sizes.forEach(function(sz){ for(var k=0;k<sz;k++){ kids[i++].style.gridColumn="span "+(L/sz); } });
}catch(e){} }
function evenAll(root){ if(!root || !root.querySelectorAll) return; var list=[].slice.call(root.querySelectorAll(".btns,.chips,.dsChips,.ilChips,.hlChips,.seg,.gpTypes,.skKids,.skLv,.fparts,.fwrap,.rseg,.fotpl"));
  if(root.matches && root.matches(".btns,.chips,.dsChips,.ilChips,.hlChips,.seg,.gpTypes,.fparts,.fwrap,.rseg,.fotpl")) list.unshift(root); list.forEach(evenRows); }
window.addEventListener("resize", function(){ clearTimeout(evenAll.t); evenAll.t=setTimeout(function(){ evenAll(document.body); }, 120); });
// ---------- 0.5.20: review 10, 11, 12, 14 ----------
// Empty states carry their own action button (data-proxy="<selector>" presses the page's existing button).
document.addEventListener("click", function(e){ var b=e.target.closest && e.target.closest("[data-proxy]"); if(!b) return; var t=document.querySelector(b.getAttribute("data-proxy")); if(t && t!==b){ e.preventDefault(); t.click(); } });
// Long help text (over ~170 characters, plain text only) shows two lines and an ⓘ button for the rest.
function clampHelp(root){ try{ if(!root || !root.querySelectorAll) return;
  [].forEach.call(root.querySelectorAll(".card>.mut.small,.card>.mut.tiny,.card>.tiny,.card>.small.mut"), function(e){ if(e._cl || e.closest(".rvw,.rvList,#aboutCard,.sheet,#obx,.hnext,details")) return; e._cl=1;
    if(e.children.length>2 || (e.textContent||"").length<170 || e.querySelector("button,input,select,a,textarea")) return;
    e.classList.add("clamp"); var b=document.createElement("button"); b.className="clampMore"; b.type="button"; b.textContent="ⓘ "+L2x("Baca lagi","Read more");
    b.onclick=function(){ var o=e.classList.toggle("clamp"); b.textContent=o?"ⓘ "+L2x("Baca lagi","Read more"):"▴ "+L2x("Kurangkan","Less"); }; e.parentNode.insertBefore(b, e.nextSibling); }); }catch(err){} }
// Horizontal scroll rows fade at the edge that has more to scroll to.
function edgeFade(root){ try{ if(!root || !root.querySelectorAll) return; var l=[].slice.call(root.querySelectorAll(".chips,#subnav,.dock .chips")); if(root.matches && root.matches(".chips")) l.push(root);
  l.forEach(function(r){ var up=function(){ var over=r.scrollWidth-r.clientWidth>4; r.classList.toggle("fadeR", over && r.scrollLeft<r.scrollWidth-r.clientWidth-4); r.classList.toggle("fadeL", over && r.scrollLeft>4); };
    if(!r._ef){ r._ef=1; r.addEventListener("scroll", up, {passive:true}); } up(); }); }catch(err){} }
// 0.5.69 (owner): in Settings, a row of single-choice chips (theme, voice pitch, Arabic font, alert times…) is a dropdown.
// The chips stay (hidden) with their own handlers; the dropdown clicks the chosen one.
function chipDrop(root){ try{ if(!root || !root.querySelectorAll) return; [].forEach.call(root.querySelectorAll(".set > .chips, .throw"), function(g){ if(g._cd || g.classList.contains("noDrop")) return;   // 0.5.76: text size stays as buttons
  var bs=[].filter.call(g.children, function(b){ return b.tagName==="BUTTON"; }); if(bs.length<2) return;
  var at=function(b){ var a=[].filter.call(b.attributes, function(x){ return /^data-/.test(x.name); })[0]; return a?a.name:null; }, a0=at(bs[0]);
  if(!a0 || bs.some(function(b){ return at(b)!==a0; })) return; g._cd=1;
  var sel=document.createElement("select"); sel.className="chipSel"; var any=bs.some(function(b){ return b.classList.contains("on"); });
  if(!any){ var o0=document.createElement("option"); o0.value=""; o0.textContent="—"; o0.selected=true; sel.appendChild(o0); }
  bs.forEach(function(b, i){ var o=document.createElement("option"); o.value=i; o.textContent=(b.getAttribute("title")||b.textContent).trim(); if(b.classList.contains("on")) o.selected=true; sel.appendChild(o); });
  sel.onchange=function(){ if(sel.value!=="") bs[+sel.value].click(); };
  g.style.display="none"; g.parentNode.insertBefore(sel, g.nextSibling); }); }catch(e){} }
// Tile labels sit in a fixed two-line box so neighbouring tiles line up.
function tileLabels(root){ try{ if(!root || !root.querySelectorAll) return; [].forEach.call(root.querySelectorAll("button.qt"), function(b){ if(b.querySelector(".qtL")) return;
  var t=[].filter.call(b.childNodes, function(n){ return n.nodeType===3 && n.textContent.trim(); }); if(!t.length) return; var s2=document.createElement("span"); s2.className="qtL"; b.insertBefore(s2, t[0]); t.forEach(function(n){ s2.appendChild(n); }); }); }catch(err){} }
window.addEventListener("resize", function(){ clearTimeout(edgeFade.t); edgeFade.t=setTimeout(function(){ edgeFade(document.body); }, 150); });
(function(){ var q=[], tm=0, run=function(){ tm=0; var x=q; q=[]; x.forEach(foldReview); x.forEach(function(n){ evenAll(n.isConnected ? n : null); if(n.isConnected){ clampHelp(n); tileLabels(n); edgeFade(n); ibChips(n); var sp=document.getElementById("setp"); if(sp && (sp.contains(n) || n.contains(sp))) chipDrop(sp); } }); };
  try{ new MutationObserver(function(ms){ ms.forEach(function(m){ [].forEach.call(m.addedNodes, function(n){ if(n.nodeType===1) q.push(n); }); }); if(!tm) tm=requestAnimationFrame(run); }).observe(document.body, {childList:true, subtree:true}); }catch(e){} })();
// ---------- 0.14.0 REORGANIZATION ----------
// Six tabs (Utama, Solat, Amalan, Ilmu, Kalendar, Alat); levels 2 and 3 sit at the bottom above the tab bar;
// settings (Tetapan) and search open from the header. Function declarations here replace the older ones of the same name.
var TABS_ALL=[["home","🏠","utama"],["iman","🕌",["Iman","Iman"]],["learn","📚","learn"],["cal","📅","cal"],["alat","🧰",["Alat","Tools"]]];   // 0.7.59 (owner): Solat + Practice = one tab, Iman
// 0.7.59 (owner): Iman = Quran · Solat · Amal · Zikir (level 2). The pages inside are still the views "solat" and "sunat".
// Solat = Rakaat (left) + Qibla (right) + the prayer times; Amal = Sunnah prayers | Deeds (level 3); Zikir = Zikir | Doa | Wirid | Ma'thurat (level 3)
var IMAN=[["quran","📖","Al-Quran","Quran"],["solat","🕌","Solat","Solat"],["amal","🌱","Amal","Amal"],["zikir","📿","Zikir","Zikir"],["ilmu","📖","Ilmu","Ilmu"]];   // 0.7.64 (owner): Basics moved from Learn into Iman as Ilmu
var IM_L3={amal:[["ssunat","🌅","Solat sunat","Sunnah prayers"],["amal","🌱","Amalan","Deeds"]], zikir:[["zikir","📿","Zikir","Zikir"],["doa","🤲","Doa","Doa"],["wirid","🌄","Wirid","Wirid"],["mathurat","📖","Ma'thurat","Ma'thurat"]]};
function imanOf(){ if(view==="learn" && SUB2.learn==="bahasa") return "ilmu"; if(view==="sunat") return sunPage==="amal"?"amal":["doa","wirid","mathurat","zikir"].indexOf(sunPage)>=0?"zikir":"quran"; if(view==="solat"){ var s=SUB2.solat; return s==="ssunat"?"amal":s==="zikir"?"zikir":"solat"; } return null; }
function imanL3(){ var i=imanOf(); if(i==="amal") return view==="solat"?"ssunat":"amal"; if(i==="zikir") return view==="solat"?"zikir":sunPage; return null; }
function imanGo(id, l3){ if(!IMAN.some(function(x){ return x[0]===id; })) id="solat"; S.imLast=id;
  if(id==="quran"){ saveS(); sunPage="quran"; save("ihsan_sunpage","quran"); go("sunat"); return; }
  if(id==="solat"){ saveS(); SUB2.solat="waktu"; go("solat"); return; }
  if(id==="ilmu"){ saveS(); SUB2.learn="bahasa"; learnPg=null; learnFrom=null; basicsPg=null; basicsFrom=null; go("learn"); return; }
  var L=IM_L3[id]; l3=l3||(id==="amal"?S.imAmal:S.imZik)||L[0][0]; if(!L.some(function(x){ return x[0]===l3; })) l3=L[0][0];
  if(id==="amal") S.imAmal=l3; else S.imZik=l3; saveS();
  if(l3==="ssunat" || l3==="zikir"){ SUB2.solat=l3; if(l3==="zikir") sub.zikir="tasbih"; go("solat"); }
  else { sunPage=l3; save("ihsan_sunpage",l3); go("sunat"); } }
// 0.4.3: when My Ihsan is the phone's home screen (launcher), the Utama tab is gone: its content is the feed page on the left of the
// phone home screen and its widgets live on the phone home screen. "home" then means Solat inside the app.
function launcherOn(){ try{ if(!window.Native || !Native.homeState) return false; if(launcherOn.c==null || Date.now()-launcherOn.t>4000){ var s=JSON.parse(Native.homeState()); launcherOn.c=!!(s.on && s.def); launcherOn.t=Date.now(); } return launcherOn.c; }catch(e){ return false; } }
function homeV(){ return launcherOn() ? "solat" : "home"; }
function tabsNow(){ var to=S.tabOrder; if(to && (to.indexOf("solat")>=0 || to.indexOf("sunat")>=0)){ var seen=false; to=to.map(function(k){ return k==="solat"||k==="sunat"?"iman":k; }).filter(function(k){ if(k!=="iman") return true; if(seen) return false; seen=true; return true; }); S.tabOrder=to; }
  var hd=S.tabHide; if(hd && (hd.solat || hd.sunat)){ if(hd.solat && hd.sunat) hd.iman=1; delete hd.solat; delete hd.sunat; }
  var t=ordered(TABS_ALL, S.tabOrder); t=launcherOn() ? t.filter(function(x){ return x[0]!=="home"; }) : t;
  // 0.5.98 (owner): the 💡 in the left bar hides a tab from the bottom row (one always stays)
  var hid=S.tabHide||{}, v=t.filter(function(x){ return !hid[x[0]]; }); return v.length ? v : t.slice(0,1); }
// 0.5.3: the person's own order (saved ids first, tabs added in a later version at the end, removed ones dropped)
function ordered(list, saved){ if(!saved || !saved.length) return list.slice(); var by={}, out=[]; list.forEach(function(x){ by[x[0]]=x; });
  saved.forEach(function(k){ if(by[k]){ out.push(by[k]); delete by[k]; } }); list.forEach(function(x){ if(by[x[0]]) out.push(x); }); return out; }
// 0.34.0 (Farah): Kewangan is no longer a bottom tab; it is the last (right-most) page of Alat, with its own pages in the bottom dock.
var SUBS={
  solat:[["waktu","🕰","Waktu","Times"],["rakaat","🧎","Rakaat","Rakaat"],["zikir","📿","Zikir","Zikir"],["kiblat","🧭","Kiblat","Qibla"],["ssunat","🌅","Sunat","Sunnah"]],
  sunat:[["quran","📖","Al-Quran","Quran"],["doa","🤲","Doa","Doa"],["wirid","🌄","Wirid","Wirid"],["mathurat","📖","Ma'thurat","Ma'thurat"],["amal","🌱","Amal","Deeds"]],   /* 0.7.59: Ask moved to Settings › Online AI */   // 0.6.23 (owner): Ask moved here, far right
  learn:[["sekolah","🎒","Sekolah","School"],["buku","📚","Buku","Books"],["bahasa","📖","Asas","Basics"],["panduan","🧭","Teroka","Explore"],["dengar","🎧","Dengar","Listen"],["kisah","🧒","Kanak-kanak","Kids"]],   /* 0.7.60 (owner): Stories → Kids (last), it opens straight on Iqra | Planet */   // 0.6.23 (owner): Books moved here, right of School
  cal:[["bulan","📝","Perancang","Planner"],["mesyuarat","🤝","Himpun","Gather"],["trip","✈️","Trip","Trip"],["haid","🌸","Haid","Period"],["senaman","🏃","Gerak","Move"],["statistik","📈","Jejak","Track"]],
  fin:[["hutang","🤝","Hutang","Debts"],["komitmen","📆","Komitmen","Commit"],["bahagi","🧾","Bahagi bil","Split bill"],["zakat","💰","Zakat","Zakat"],["wasiat","📜","Wasiat","Will"],["cukai","🧾","Cukai","Tax"],["belanja","💸","Belanja","Expense"],["tukaran","💱","Tukaran","Currency"]],
  alat:[["keluarga","🌿","Hidup","Life"],["kumpulan","👥","Kumpulan","Groups"],["halal","🏷️","Halal","Halal"],["nota","✍️","Tulis","Write"],["paparan","📺","Paparan","Display"],["niaga","📑","Niaga","Business"],["kewangan","💰","Kewangan","Finance"]]
};
// 0.3.0: the Haid (period) tab can be hidden (men who do not track a spouse): Kalendar sub-tabs read through this getter
function periodHidden(){ var p=load("ihsan_period",{}); return !!(p && p.who==="off"); }
// 0.5.3: every sub-tab list follows the person's order (S.subOrder); hidden Haid is filtered after ordering
// 0.6.23: a saved tab order keeps the owner's moves: Books right after School (Learn), Ask last in Practice, Ask out of Learn
(function(){ var so=S.subOrder; if(!so) return; var ch=false;
  if(Array.isArray(so.learn)){ var l=so.learn.filter(function(k){ return k!=="tanya" && k!=="buku"; }), i=l.indexOf("sekolah"); l.splice(i<0?0:i+1, 0, "buku"); if(l.join()!==so.learn.join()){ so.learn=l; ch=true; } }
  if(Array.isArray(so.sunat) && so.sunat.indexOf("tanya")>=0){ so.sunat=so.sunat.filter(function(k){ return k!=="tanya"; }); ch=true; }
  if(Array.isArray(so.fin) && so.fin.indexOf("cukai")<0){ var bi=so.fin.indexOf("belanja"); so.fin.splice(bi<0?so.fin.length:bi+1, 0, "cukai"); ch=true; }   // 0.6.72: Finance › Tax
  if(Array.isArray(so.fin) && !S.fin675){ var ti=so.fin.indexOf("tukaran"), ci=so.fin.indexOf("cukai"); if(ti>=0 && ci>=0){ so.fin[ti]="cukai"; so.fin[ci]="tukaran"; } S.fin675=1; ch=true; }   // 0.6.75 (owner): Tax and Currency swap places
  if(Array.isArray(so.cal) && so.cal.indexOf("puasa")>=0){ so.cal.splice(so.cal.indexOf("puasa"), 1); ch=true; }   // 0.6.68 (owner): no Fasting tab
  if(Array.isArray(so.cal) && so.cal.indexOf("trip")<0){ var mi=so.cal.indexOf("mesyuarat"); so.cal.splice(mi<0?so.cal.length:mi+1, 0, "trip"); ch=true; }   // 0.7.20 (owner): Time › Trip after Meeting
  if(Array.isArray(so.cal) && so.cal.indexOf("mesyuarat")<0){ var ci=so.cal.indexOf("bulan"); so.cal.splice(ci<0?0:ci+1, 0, "mesyuarat"); ch=true; }   // 0.6.44: Meeting after Planner
  if(ch) saveS(); })();
var SUBS_FULL={};
Object.keys(SUBS).forEach(function(k){ var c=SUBS[k]; SUBS_FULL[k]=c; Object.defineProperty(SUBS, k, {enumerable:true, get:function(){ var l=ordered(c, (S.subOrder||{})[k]); if(WEB) l=l.filter(function(x){ return WEB_OFF.indexOf(x[0])<0; }); if(S.kidLock) l=l.filter(function(x){ return x[0]!=="kumpulan"; }); return k==="cal" && periodHidden() ? l.filter(function(x){ return x[0]!=="haid"; }) : l; }}); });
// Rakaat (Solat) and Al-Quran (Amalan, since 0.18.0) are the default pages each time the app starts; Panduan keeps Haji & Umrah as its default.
sunPage="quran";
// 0.19.0: Zikir moved to Solat, between Rakaat and Kiblat
if(view==="sunat" && load("ihsan_sunpage","")==="zikir") save("ihsan_sunpage","quran");
// 0.6.51 (owner): third-level tabs (bottom bars inside Focus, Meeting, Move, Business, Finance) can be hidden in the left bar too
window.l3On=function(id){ return !(S.l3Hide||{})[id]; };
window.l3Keep=function(list, grp, cur, key){ var v=list.filter(function(x){ var k=key?key(x):x[0]; return window.l3On(grp+"/"+k) || k===cur; }); return v.length?v:list; };
var SUB2={solat:"rakaat", learn:"sekolah", cal:"bulan", alat:"keluarga", fin:"hutang"}, pandL3="haji", moreGrp=null, aiJump=false, pgKey="";
function subOf(v){ return v==="sunat"?sunPage:SUB2[v]; }
function subName(x){ return en_()?x[3]:x[2]; }
function go(v){ if(v==="iman"){ imanGo(S.imLast||"solat"); return; }
  if(v==="home" && launcherOn()) v="solat";
  if(S.kidLock){ if(S.lockTo==="school"){ v="learn"; SUB2.learn="sekolah"; learnPg=null; } else if(v!=="kids" && !(v==="learn" && learnFrom==="kids")) v="kids"; }   // 0.6.43: School lock
  if(S.appLock && !S.kidLock && v==="more"){ toast(L2x("Tetapan dikunci. Sapu 🔒 di atas 5 kali untuk buka.","Settings are locked. Swipe the 🔒 at the top 5 times to unlock.")); return; }
  if(v==="more"){ setShow(true); return; }
  if(setOn) setShow(false);
  if(v==="zikir"){ SUB2.solat="zikir"; v="solat"; }
  if(v==="alat" && SUB2.alat==="saham"){ SUB2.alat="kewangan"; SUB2.fin="tukaran"; finStk=true; }
  if(v==="saham"){ v="tukaran"; finStk=true; }
  if(v==="alat" && SUB2.alat==="buku"){ SUB2.alat="nota"; SUB2.learn="buku"; v="learn"; }   // 0.6.23: Books live in Learn
  if(v==="buku"){ SUB2.learn="buku"; v="learn"; }
  if(v==="tanya"){ openSettings("ai"); return; }
  if(["hutang","komitmen","bahagi","zakat","tukaran","wasiat","belanja","cukai"].indexOf(v)>=0){ SUB2.fin=v; v="fin"; }
  if(v==="fin"){ SUB2.alat="kewangan"; v="alat"; }
  if(["doa","mathurat","amal","wirid"].indexOf(v)>=0){ sunPage=v; save("ihsan_sunpage",v); v="sunat"; }
  if(v==="halal"){ SUB2.alat="halal"; v="alat"; }
  if(v==="kumpulan"||v==="paparan"||v==="niaga"){ SUB2.alat=v; v="alat"; }
  if(v==="cal" && SUB2.cal==="fokus"){ SUB2.cal="bulan"; SUB2.plt=SUB2.plt&&SUB2.plt!=="plan"?SUB2.plt:"today"; cal.mode="p"; }   // 0.7.77 (owner): Focus merged into Planner

  if(v==="majlis" || (v==="alat" && SUB2.alat==="majlis")){ SUB2.alat="keluarga"; window.__meetPg="ev"; SUB2.cal="mesyuarat"; v="cal"; }   // 0.7.75 (owner): Events → Time › Gather
  if(v==="alat" && SUB2.alat==="pets"){ SUB2.alat="keluarga"; SUB2.life="pets"; }   // 0.7.75 (owner): Pets live in Tools › Life   // 0.6.26: Business is a level-2 tab under Tools
  if(v==="qibla"){ SUB2.solat="kiblat"; v="solat"; }
  if(v==="rakaat"){ SUB2.solat="rakaat"; v="solat"; }
  if(view==="solat" && (v!=="solat" || SUB2.solat!=="kiblat")) N.stopCompass();
  if(N.setVolumeKeys) N.setVolumeKeys(false); if(N.stopSpeak) try{N.stopSpeak();}catch(e){}
  if(v!=="more") moreGrp=null;
  view=v; save("ihsan_view", v==="more"?"home":v); render(); document.getElementById("view").scrollTop=0;
}
function setSub(tab, s){
  if(tab==="sunat"){ sunPage=s; save("ihsan_sunpage",s); } else SUB2[tab]=s;
  if(tab==="learn"){ if(window.IlmuView) try{ IlmuView.stop(); }catch(e){} learnPg=null; learnFrom=null; basicsPg=null; basicsFrom=null; }
  if(tab==="solat" && s!=="kiblat") N.stopCompass();
  if(tab==="solat" && s==="zikir") sub.zikir="tasbih";   // 0.5.20: Zikir always opens on Tasbih
  if(N.setVolumeKeys) N.setVolumeKeys(false);
  render(); document.getElementById("view").scrollTop=0;
}
window.onBack = function(){
  var ov=document.getElementById("overlay");
  if(sideOpen){ sideShow(false); return true; }
  if(!ov.classList.contains("hidden")){ if(ov._close) ov._close(); else closeOverlay(); return true; }
  if(view==="learn" && (learnPg==="radio"||learnPg==="podcast") && window.IbMedia && IbMedia.back()) return true;
  if(view==="learn" && ILMU_PG[learnPg] && window.IlmuView && IlmuView.back()) return true;
  if(view==="learn" && learnPg==="chess" && window.ChessView && ChessView.back && ChessView.back()) return true;   // 0.6.66 chess guide → setup
 if(view==="learn" && learnPg==="jamma" && window.QuranView && QuranView.kidsBack()) return true;
  if(view==="learn" && (learnPg==="iqra" || learnPg==="tajwid") && window.BacaanView && BacaanView.back()) return true;
  if(view==="learn" && learnPg==="martial" && window.MartialView && MartialView.back()) return true;   // 0.7.42: Back closes the 3D lesson, then the art
  if(view==="learn" && learnPg){ learnBack(); return true; }
  if(view==="kids" && kidsSel){ kidsBack(); return true; }   // 0.7.56: Back from the Planet or Simple view returns to the two banners
  if(view==="learn" && basicsPg){ var fr0=basicsFrom; basicsPg=null; basicsFrom=null; if(fr0==="rakaat"){ SUB2.solat="rakaat"; go("solat"); } else { render(); document.getElementById("view").scrollTop=0; } return true; }   // 0.5.71: Back leaves Purification / Solat / Hajj guides
  if(view==="sunat" && sunPage==="quran" && window.QuranView && QuranView.back()) return true;
  if(view==="more" && moreGrp){ moreGrp=null; render(); return true; }
  if(S.kidLock) return true; // 0.31.0: Back never leaves a locked kids mode
  if(window.HomeSet && HomeSet.isOpen()){ HomeSet.close(); return true; }
  if(view!==homeV()){ go(homeV()); return true; }
  return false;
};
function render(){
  ibPager=null; document.body.classList.remove("wallOn"); var _wv=document.getElementById("view"); if(_wv && _wv.style.background) _wv.style.background="";
  if(view==="fin"){ view="alat"; SUB2.alat="kewangan"; }
  if(WEB){ if(S.rmode!=="tap" && !IOS) S.rmode="tap"; if(IOS && !S.rmIos){ S.rmode="tap"; S.rmIos=1; }   /* 0.7.58 (owner): iOS starts on tap; the camera stays a choice in Settings › Rakaat counter */   /* 0.7.57: iOS counts with the front camera (ios-app/bridge.js) */ Object.keys(SUB2).forEach(function(k){ if(WEB_OFF.indexOf(SUB2[k])>=0 && SUBS[k] && SUBS[k][0]) SUB2[k]=SUBS[k][0][0]; }); }
  clearTimers(); hjMemo={}; SAY=[]; SHR=[]; if(N.setVolumeKeys) N.setVolumeKeys(false);
  if(window.QuranView) QuranView.stop();
  var vEl=document.getElementById("view"), y0=vEl.scrollTop, k0=pgKey; vEl.classList.remove("hasSub"); vEl.classList.remove("finv"); vEl.classList.remove("hwall"); if(window.FamView) try{ FamView.stop(); }catch(e){}
  var old=document.getElementById("subnav"); if(old) old.remove();
  var appEl=document.getElementById("app"); appEl.classList.toggle("kidlock", !!S.kidLock); appEl.classList.toggle("kwFull", view==="kids" && kidsSel==="planet");   /* 0.7.53: the Kids Planet fills the screen, no bottom bars */ appEl.classList.toggle("senior", !!S.senior && !S.kidLock);
  appEl.classList.toggle("vHome", view==="home"); if(!(view==="cal" && SUB2.cal==="trip")) appEl.classList.remove("tpFull");   // 0.7.24: an open trip hides bars 1 and 2 (trip/trip.js)
  appEl.classList.toggle("barsOff", !!barsOff && view!=="home");   // 0.5.92 (owner): on Home the tab row (and the favourites row above it) always stay on screen
  var nav=document.getElementById("nav");
  if(S.senior && !S.kidLock) nav.innerHTML = view==="home"?'':'<button data-v="home" class="snHome">🏠 '+L2x("Kembali ke Utama","Back to Home")+'</button>';
  else nav.innerHTML = tabsNow().map(function(n){ var lb=typeof n[2]==="string"?T(n[2]==="home"?"utama":n[2]):L2x(n[2][0],n[2][1]); return '<button data-v="'+n[0]+'" class="g3d'+((view===n[0] && !(n[0]==="learn" && SUB2.learn==="bahasa"))||(n[0]==="iman"&&(view==="solat"||view==="sunat"||(view==="learn" && SUB2.learn==="bahasa")))?" on":"")+'"><span class="ic">'+n[1]+'</span><span class="lb">'+esc(lb)+'</span></button>'; }).join("");
  nav.querySelectorAll("button").forEach(function(b){ var lb0=(b.querySelector(".lb")||b).textContent.trim(); b.setAttribute("aria-label", lb0);
    b.onclick=function(){ if(barEdit) return; var v=b.getAttribute("data-v"); if(v==="learn" && view==="learn"){ learnPg=null; learnFrom=null; } if(v==="learn" && SUB2.learn==="bahasa"){ SUB2.learn="sekolah"; learnPg=null; learnFrom=null; basicsPg=null; } go(v); };
    b.addEventListener("contextmenu", function(e){ if((S.barSize||0)>=3 && !barEdit){ e.preventDefault(); toast(lb0); } }); });
  if(!barEdit) qtabsDraw(nav); else { var qb0=document.getElementById("qtBar"); if(qb0) qb0.remove(); }   // 0.5.89 favourite tabs
  // level 2: sub-bar just above the tab bar
  var subs=SUBS[view], imOn=view==="solat"||view==="sunat"||(view==="learn" && SUB2.learn==="bahasa"); if(imOn) subs=IMAN; else if(view==="learn" && subs) subs=subs.filter(function(x){ return x[0]!=="bahasa"; });
  // 0.5.20 (review 2): Family, Groups and Events share one "Community" sub-tab (with a top segment), so Tools keeps six sub-tabs
  if(view==="alat" && subs) subs=subs.filter(function(x){ return KOM.indexOf(x[0])<1; }).map(function(x){ return x[0]==="keluarga"?["keluarga","🌿","Hidup","Life"]:x; }); /* 0.5.49: the tab holding Family, Groups and Events is "Social" */
  if(subs && !(S.senior&&!S.kidLock) && !S.kidLock){
    var cur=imOn?imanOf():subOf(view), sn=document.createElement("div"); sn.id="subnav"; if(view==="alat" && KOM.indexOf(cur)>0) cur="keluarga";
    var sh=S.subHide||{}, subs2=subs.filter(function(x){ return !sh[view+"/"+x[0]] || x[0]===cur; }); if(subs2.length) subs=subs2;
    sn.innerHTML=subs.map(function(x){ return '<button class="g3d'+(cur===x[0]&&!(view==="learn"&&learnPg)?" on":"")+(cur===x[0]?" cur":"")+'" data-sp="'+x[0]+'"><span>'+x[1]+'</span><b>'+esc(subName(x))+'</b></button>'; }).join("");
    appEl.appendChild(sn);
    sn.querySelectorAll("[data-sp]").forEach(function(b){ b.setAttribute("aria-label", b.textContent.trim()); b.onclick=function(){ if(barEdit) return; if(imOn){ imanGo(b.getAttribute("data-sp")); return; } setSub(view, b.getAttribute("data-sp")); }; });
    vEl.classList.add("hasSub");
  }
  barEditBind();
  hdrTick(); hdrBtns();
  vEl.classList.toggle("imNest", !!(imOn && IM_L3[imanOf()]));
  if(imOn && IM_L3[imanOf()]){ var imI=imanOf(), imL=IM_L3[imI], imC=imanL3();
    vEl.innerHTML='<div class="dock imL3"><div class="grp3 g'+imL.length+'">'+imL.map(function(x){ return '<button class="chip g3d'+(imC===x[0]?" on":"")+'" data-im3="'+x[0]+'">'+x[1]+' '+esc(subName(x))+'</button>'; }).join("")+'</div></div><div id="imHost"></div>';
    vEl.querySelectorAll("[data-im3]").forEach(function(b){ b.onclick=function(){ imanGo(imI, b.getAttribute("data-im3")); }; });
    (view==="solat"?vSolat:vSunatHub)(vEl.querySelector("#imHost")); }
  else ({home:vHome, solat:vSolat, sunat:vSunatHub, cal:vCal, more:vMore, learn:vLearn, kids:vKids, alat:vAlat, fin:vFin, derma:vDerma, hadiah:vHadiah}[view]||vHome)(vEl);
  // 0.3 s fade and slide (up, from the left) whenever the page itself changes
  var key=view+"|"+(subOf(view)||"")+"|"+(learnPg||"")+"|"+(view==="learn"?pandL3:"")+"|"+(view==="sunat"&&sunPage==="amal"?sunTop:"")+"|"+(view==="solat"&&SUB2.solat==="ssunat"?sunCat:"")+"|"+(moreGrp||"")+(view==="alat"&&SUB2.alat==="kewangan"?"|"+SUB2.fin:"")+(view==="alat"&&SUB2.alat==="nota"?"|"+wrTab:"");
  // 0.34.1: a page reached by a finger swipe is already in place, so it gets no entrance animation (that was the jitter)
  if(key!==pgKey && IbSwipe._q){ pgKey=key; vEl.classList.remove("pgin"); }
  if(key!==pgKey){ pgKey=key; vEl.classList.remove("pgin"); void vEl.offsetWidth; vEl.classList.add("pgin");
    // 0.34.0: drop the class once the 0.3 s entrance is over; its "fill: both" would otherwise pin transform and block swipes
    clearTimeout(vEl._pgT); vEl._pgT=setTimeout(function(){ vEl.classList.remove("pgin"); }, 360); }
  barsIn(key);
  if(view===homeV()){ setTimeout(wFitH, 60); setTimeout(wFitH, 700); }
  // 0.5.20 (review 19): a re-render of the same page (a tap on a chip, a tick) keeps the reader where they were
  if(key===k0 && y0>0){ vEl.scrollTop=y0; setTimeout(function(){ if(pgKey===key && vEl.scrollTop<y0) vEl.scrollTop=y0; }, 60); }
  dockFix(); setTimeout(dockFix,60); setTimeout(ibArr,140); setTimeout(barGripPos,80); setTimeout(ibChips,120);
  sideMark();
  navTick();
  if(setOn) setDraw();
}
// 0.19.0: the bottom bars slide up in 0.3 s, level by level (tab bar, then level 2, then level 3), whenever that level's content changes
var barKey={n:null,s:null,d:null};
function barsIn(key){
  var up=function(e, lv){ if(!e) return; e.classList.remove("barin","bl1","bl2","bl3"); void e.offsetWidth; e.classList.add("barin","bl"+lv); };
  var nk="nav", sk=view, dk=key;
  var nav=document.getElementById("nav"), sn=document.getElementById("subnav"), dk_=document.querySelectorAll("#view .dock");
  var nNew=barKey.n!==nk, sNew=barKey.s!==sk, dNew=barKey.d!==dk;
  if(IbSwipe._q){ barKey={n:nk,s:sk,d:dk}; return; }
  // 0.5.96 (owner): no more slide-in on every tap (it played twice, level 2 then level 3): the bars slide up once, when the app opens
  if(barKey.n!==null){ barKey={n:nk,s:sk,d:dk}; return; }
  if(nNew) up(nav,1);
  if(sNew || nNew) up(sn, nNew?2:1);
  if(dNew || sNew || nNew) for(var i=0;i<dk_.length;i++) up(dk_[i], nNew?3:sNew?2:1);
  barKey={n:nk,s:sk,d:dk};
}
// Header: search and settings buttons
function hdrBtns(){
  var h=document.getElementById("hBtns"); if(!h) return;
  h.style.display = S.kidLock ? "none" : "";
  var hm=document.getElementById("hMenu"); if(hm){ hm.style.display = S.kidLock ? "none" : ""; hm.onclick=function(){ sideShow(!sideOpen); }; }
  appLockBar();
  if(h._b) return; h._b=1;
  document.getElementById("hSync").onclick=function(){ openSync(); };
  var hbl=document.getElementById("hBell"); if(hbl){ hbl.onclick=function(){ noteOpen(); }; setTimeout(function(){ notePaint(); noteNative(); }, 0); }   // after the rest of app.js has run (NOTE_SRC is set below)   // 0.6.30 (owner): sync replaces search in the top bar; search lives in the side menu
  document.getElementById("hDon").onclick=function(){ go("derma"); };
  document.getElementById("hGift").onclick=function(){ go("hadiah"); };
  document.getElementById("hSet").onclick=function(){ if(S.appLock && !S.kidLock){ go("more"); return; } openSettings(); };
}

// ---------- SOLAT: Waktu / Rakaat / Kiblat / Solat sunat ----------
function vSolat(el){
  var s=SUB2.solat, now=new Date(), t=getDay(now), np=nextPrev(), cur=np.prev?np.prev.k:null, curToday=np.prev && ymd(new Date(np.prev.t))===ymd(now), en=S.lang==="en", html='';
  if(s==="waktu"){
    // 0.7.59 (owner): Rakaat (left half) and Qibla (right half) on top of the prayer times
    if(!rk.solat || (rk.solat==="custom" && !rk.keep)){ rk.solat=inDhuha()?"sunat2":currentPrayer(); if(rk.solat==="zohor" && isFri()) rk.solat="jumaat"; } if(rk.solat==="jumaat" && !isFri()) rk.solat="zohor"; if(rk.solat==="sunat") rk.solat="sunat2";
    html+='<div class="imTop"><div class="imRk">'+rkBanner(rkTarget())+'<button class="imMore" id="imRkM">🧎 '+L2x("Pilih solat & tetapan","Choose prayer & settings")+' ›</button></div><div class="imQb card" id="imQ"></div></div>';
    html+='<div class="card trow">'+PR.map(function(k0){ var c=prCell(k0,t), k=c.k, p=fmt12(c.hm).split(" "); return '<div class="tc '+((k===cur&&curToday)||c.cur?"cur":"")+'"><div class="tn">'+prN(k)+'</div><div class="tt">'+p[0]+'</div><div class="ta">'+(p[1]||"")+'</div></div>'; }).join("")+
      '<div class="trow2">'+["imsak","syuruk"].map(function(k){ return '<span>'+T(k)+' <b>'+fmt12(t[k])+'</b></span>'; }).join("")+'<span>'+(en?"Last third":"1/3 malam akhir")+' <b>'+lastThird(now)+'</b></span></div>'+
      '<div class="src0"><span class="badge '+(t.src==="jakim"?"":"warn")+'" id="refresh">'+(t.src==="jakim"?T("jakim"):t.src==="abroad"?L2x("Kiraan: ","Calculated: ")+methName(S.calcMethod):T("est"))+' ↻</span>'+(adjAny()?' <span class="badge">± '+(en?"adjusted":"dilaras")+'</span>':'')+'</div></div>';
    if(musafirNow()) html+=musafirBanner();
    if(!overseasNow()) html+='<button class="btn alt full g3d" id="zonePick" style="margin:0 0 10px">📍 '+esc(S.zone)+' · '+esc(zoneShort())+' <span class="mut">'+L2x("· tukar zon","· change zone")+'</span></button>';
    html+=monthCard();
    el.innerHTML=html;
    var imq=el.querySelector("#imQ"); if(imq){ qiblaCard(imq, true); imq.addEventListener("click", function(e){ if(e.target.closest("button")) return; SUB2.solat="kiblat"; render(); }); }
    var irs=el.querySelector("#rkStart"); if(irs) irs.onclick=function(){ var target=rkTarget();
      if(S.rmode==="camera" && !N.hasPerm("camera")){ var hp=function(p){ if(p.which!=="camera") return; off("perm",hp); if(p.granted) startPraying(target); }; on("perm",hp); N.requestPerm("camera"); } else startPraying(target); };
    var irm=el.querySelector("#imRkM"); if(irm) irm.onclick=function(){ SUB2.solat="rakaat"; render(); };
    el.querySelector("#refresh").onclick=function(){ ensureData(true); };
    var zp=el.querySelector("#zonePick"); if(zp) zp.onclick=zonePicker;
    bindMusafir(el); bindMonth(el);
  } else if(s==="rakaat"){
    // 0.34.0 (Farah): guided practice at the top; one Settings button opens Tetapan › Kiraan rakaat
    // 0.5.70 (owner): the Solat guide and Basics banners sit at the top of Rakaat
    // 0.5.71 (owner): only the Solat guide banner here; guided practice lives inside the guide
    html+='<div class="rkBans">'+guideHero("solat")+'</div>';
    html+=rakaatSetup();
    html+='<button class="btn alt full" data-mg="rakaat" style="margin-bottom:12px">⚙ '+L2x("Tetapan","Settings")+' ›</button>';
    el.innerHTML=html; bindRakaat(el); bindMusafir(el);
    el.querySelectorAll("[data-guide]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-guide"); if(k==="asas"){ basicsPg=null; basicsFrom=null; SUB2.learn="bahasa"; learnPg=null; learnFrom=null; go("learn"); } else openGuide(k, "rakaat"); }; });
    el.querySelector("[data-mg]").onclick=function(){ moreGrp="rakaat"; go("more"); };
  } else if(s==="zikir"){ vZikir(el);
  } else if(s==="kiblat"){
    el.innerHTML='<div class="card" id="qCard"></div><div id="xFlyC"></div>';
    qiblaCard(el.querySelector("#qCard"), false);
    var wx=document.createElement("div"); wx.className="card"; wx.id="wxCard"; el.insertBefore(wx, el.querySelector("#xFlyC")); weatherInto(wx, false);
    withExtra(null, function(){ var c=el.querySelector("#xFlyC"); if(!c) return; c.innerHTML=IbExtra.flightCard(xH()); c.querySelector("#xFly").onclick=function(){ IbExtra.openFlight(xH()); }; });
  } else vSunatMode(el, "ssunat");
}
// Whole month of prayer times; swipe or slide across every month of this year and next
var wmIdx=null;
function monthCard(){
  var y=new Date().getFullYear(), MO=en_()?ME:MS, pages='';
  for(var i=0;i<24;i++) pages+='<div class="wmp" data-i="'+i+'"></div>';
  if(wmIdx===null) wmIdx=new Date().getMonth();
  return '<div class="card wmon"><div class="wmh"><button class="chip g3d" id="wmP" aria-label="prev">‹</button><div><b id="wmT"></b><div class="mut tiny" id="wmS"></div></div><button class="chip g3d" id="wmN" aria-label="next">›</button></div>'+
    '<input type="range" id="wmR" min="0" max="23" step="1" value="'+wmIdx+'" aria-label="'+L2x("Bulan","Month")+'"><div class="wmlab"><span>'+MO[0].slice(0,3)+' '+y+'</span><span>'+MO[11].slice(0,3)+' '+(y+1)+'</span></div>'+
    '<div class="wmpg" id="wmPg">'+pages+'</div><button class="btn alt full g3d" id="wmPrint" style="margin-top:10px">🖨 '+L2x("Jadual bulan ini (gambar untuk dicetak / papan notis)","This month's timetable (picture to print / notice board)")+'</button></div>';
}
// 0.5.23 (JAKIM e-Solat style): every official zone, grouped by state, searchable, with today's imsak, subuh and syuruk.
// The current zone shows JAKIM times; the others show the offline estimate for that zone until it is chosen.
function zonePicker(){ var today=new Date(), q="";
  var ov=showSheet("📍 "+L2x("Zon waktu solat JAKIM","JAKIM prayer zones"), '<input id="zpQ" class="rin" type="search" placeholder="🔎 '+L2x("Cari bandar, daerah atau kod zon","Search a town, district or zone code")+'"><div id="zpL" class="zpL"></div>');
  var draw=function(){ var L=ov.querySelector("#zpL"), qq=q.toLowerCase(), h="";
    Object.keys(STATES).forEach(function(st){ var zs=ZONES.filter(function(z){ return z[1]===st && (!qq || (z[0]+" "+z[2]+" "+STATES[st]).toLowerCase().indexOf(qq)>=0); }); if(!zs.length) return;
      h+='<div class="snl">'+esc(STATES[st])+'</div>'+zs.map(function(z){ var cur=z[0]===S.zone, t=cur?getDay(today):calcDay(today, z[3][0][0], z[3][0][1]);
        return '<button class="zpI'+(cur?' on':'')+'" data-zp="'+z[0]+'"><b>'+z[0]+'</b><span>'+esc(z[2])+'</span><small>'+T("imsak")+' '+fmt12(t.imsak)+' · '+T("subuh")+' '+fmt12(t.subuh)+' · '+T("syuruk")+' '+fmt12(t.syuruk)+(cur?' · ✓':' · ≈')+'</small></button>'; }).join(""); });
    L.innerHTML=h||'<div class="mut small">'+L2x("Tiada zon yang sepadan.","No matching zone.")+'</div>';
    L.querySelectorAll("[data-zp]").forEach(function(b){ b.onclick=function(){ S.zone=b.getAttribute("data-zp"); S.zoneAuto=false; if(S.locMode==="auto") S.overseas=false; S.state=zoneById(S.zone)[1]; saveS(); closeOverlay(); ensureData(true); render(); toast(L2x("Zon: ","Zone: ")+S.zone); }; }); };
  ov.querySelector("#zpQ").oninput=function(){ q=this.value; draw(); }; draw();
  setTimeout(function(){ var on=ov.querySelector(".zpI.on"); if(on) on.scrollIntoView({block:"center"}); }, 60); }
// 0.5.23 (Athan-style): a printable monthly timetable as a picture (A4 proportions), shared to print, WhatsApp or a notice board
function ttImage(i){ var y=new Date().getFullYear()+Math.floor(i/12), m=i%12, dim=new Date(y,m+1,0).getDate(), MO=en_()?ME:MS, W=1240, rowH=44, top=230, H=top+rowH*(dim+1)+130;
  var cv=document.createElement("canvas"); cv.width=W; cv.height=H; var c=cv.getContext("2d"), cols=[L2x("Tarikh","Date")].concat(ALL.map(function(k){ return T(k); })), cw=[230].concat(ALL.map(function(){ return (W-80-230)/ALL.length; }));
  var DN=en_()?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]:["Ahd","Isn","Sel","Rab","Kha","Jum","Sab"], est=false;
  c.fillStyle="#ffffff"; c.fillRect(0,0,W,H); c.fillStyle="#0b5d3b"; c.fillRect(0,0,W,170);
  c.fillStyle="#ffffff"; c.font="700 50px Georgia, serif"; c.textAlign="left"; c.fillText(L2x("Waktu Solat ","Prayer Times ")+MO[m]+" "+y, 40, 80);
  c.font="26px system-ui, sans-serif"; c.fillStyle="#e7d7a3"; c.fillText((overseasNow()?L2x("Lokasi anda","Your location"):S.zone+" · "+zoneById(S.zone)[2]).slice(0,80), 40, 128);
  var x0=40, yy=top; c.fillStyle="#efe6c8"; c.fillRect(40, yy-32, W-80, rowH); c.fillStyle="#3b3110"; c.font="700 22px system-ui, sans-serif";
  var x=x0; cols.forEach(function(h, k){ c.textAlign=k?"center":"left"; c.fillText(h, k?x+cw[k]/2:x+10, yy-3); x+=cw[k]; });
  for(var d=1; d<=dim; d++){ var dt=new Date(y,m,d), t=getDay(dt), hj=hijriOf(dt), ry=top+rowH*d; if(t.src!=="jakim") est=true;
    if(dt.getDay()===5){ c.fillStyle="#f3f8f4"; c.fillRect(40, ry-32, W-80, rowH); }
    c.strokeStyle="#e3e8e3"; c.beginPath(); c.moveTo(40, ry+12); c.lineTo(W-40, ry+12); c.stroke();
    x=x0; c.textAlign="left"; c.fillStyle="#17251c"; c.font="700 22px system-ui, sans-serif"; c.fillText(d+" "+DN[dt.getDay()], x+10, ry-3);
    if(hj){ c.font="17px system-ui, sans-serif"; c.fillStyle="#7a8a80"; c.fillText(hj.d+" "+HIJRI_MONTHS[hj.m-1].slice(0,8), x+110, ry-3); }
    x+=cw[0]; c.font="22px system-ui, sans-serif"; c.fillStyle="#17251c"; c.textAlign="center";
    ALL.forEach(function(k, j){ c.fillText(t[k]?fmt12(t[k]).split(" ")[0]:"--", x+cw[j+1]/2, ry-3); x+=cw[j+1]; }); }
  c.textAlign="left"; c.fillStyle="#5c6d62"; c.font="20px system-ui, sans-serif";
  c.fillText((est?L2x("Anggaran / kiraan. ","Estimated / calculated. "):L2x("Sumber: JAKIM e-Solat. ","Source: JAKIM e-Solat. "))+(adjAny()?L2x("Termasuk pelarasan minit. ","Includes minute adjustments. "):"")+L2x("Jumaat berlatar hijau.","Fridays are shaded."), 40, H-70);
  c.fillStyle="#9a7a1c"; c.fillText("My Ihsan", 40, H-36);
  var url=cv.toDataURL("image/png"), b64=url.slice(url.indexOf(",")+1), nm="waktu-solat-"+y+"-"+pad(m+1)+".png";
  if(window.Native && N.shareBinary) N.shareBinary(nm, b64, "image/png", L2x("Waktu solat ","Prayer times ")+MO[m]+" "+y); else if(N.shareImage) N.shareImage(url, ""); }
function monthTable(i){
  var y=new Date().getFullYear()+Math.floor(i/12), m=i%12, dim=new Date(y,m+1,0).getDate(), tds=ymd(new Date()), est=false, rows='';
  var DN=en_()?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]:["Ahd","Isn","Sel","Rab","Kha","Jum","Sab"];
  var hm=function(x){ return x?fmt12(x).split(" ")[0]:"--"; };
  for(var d=1; d<=dim; d++){
    var dt=new Date(y,m,d), t=getDay(dt), hj=hijriOf(dt), ds=ymd(dt); if(t.src!=="jakim") est=true;
    rows+='<tr class="'+(ds===tds?"today":"")+(dt.getDay()===5?" fri":"")+'"'+(ds===tds?' id="wmToday"':'')+'><td class="wd"><b>'+d+'</b> <span>'+DN[dt.getDay()]+'</span>'+(hj?'<small>'+hj.d+' '+HIJRI_MONTHS[hj.m-1].slice(0,6)+'</small>':'')+'</td>'+ALL.map(function(k){ return '<td>'+hm(t[k])+'</td>'; }).join("")+'</tr>';
  }
  return {html:'<table class="wmt"><thead><tr><th>'+L2x("Tarikh","Date")+'</th>'+ALL.map(function(k){ return '<th>'+T(k)+'</th>'; }).join("")+'</tr></thead><tbody>'+rows+'</tbody></table>', est:est};
}
function bindMonth(el){
  var pg=el.querySelector("#wmPg"), R=el.querySelector("#wmR"), done={}, est={}, y=new Date().getFullYear(), MO=en_()?ME:MS, tmr=null;
  if(!pg) return;
  var wp=el.querySelector("#wmPrint"); if(wp) wp.onclick=function(){ ttImage(wmIdx||0); };
  var fill=function(i){ if(i<0||i>23||done[i]) return; var r=monthTable(i); done[i]=1; est[i]=r.est; pg.children[i].innerHTML=r.html; };
  var label=function(i){ fill(i); fill(i-1); fill(i+1); el.querySelector("#wmT").textContent=MO[i%12]+" "+(y+Math.floor(i/12));
    var h1=hijriOf(new Date(y+Math.floor(i/12),i%12,1)), h2=hijriOf(new Date(y+Math.floor(i/12),i%12+1,0));
    el.querySelector("#wmS").innerHTML=(h1&&h2?HIJRI_MONTHS[h1.m-1]+(h1.m!==h2.m?" – "+HIJRI_MONTHS[h2.m-1]:"")+" "+h2.y+"H · ":"")+(est[i]?'<span class="badge warn">'+T("est")+'</span>':'<span class="badge">'+T("jakim")+'</span>');
    R.value=i; wmIdx=i; pg.style.height=pg.children[i].scrollHeight+"px"; };
  var to=function(i, smooth){ i=Math.max(0,Math.min(23,i)); label(i); pg.scrollTo({left:i*pg.clientWidth, behavior:smooth?"smooth":"auto"}); };
  pg.addEventListener("scroll", function(){ clearTimeout(tmr); tmr=setTimeout(function(){ var i=Math.round(pg.scrollLeft/Math.max(1,pg.clientWidth)); if(i!==wmIdx) label(i); },90); }, {passive:true});
  R.oninput=function(){ to(+R.value, false); };
  el.querySelector("#wmP").onclick=function(){ to(wmIdx-1, true); };
  el.querySelector("#wmN").onclick=function(){ to(wmIdx+1, true); };
  label(wmIdx); setTimeout(function(){ to(wmIdx,false); },0);
}

// ---------- Sunat list (Amal) shown in four places: Solat sunat, Amal sunat, Ilmu > Bersuci, Ilmu > Haji & Umrah ----------
var SN_GUIDE={istikharah:"g_istikharah", hajat:"g_hajat", raya:"x_raya", gerhana:"x_gerhana", jenazah:"x_jenazah", b_wuduk:"wudhu", b_mandi:"x_mandi", b_tayammum:"x_tayammum"};
function vSunatMode(el, mode){
  if(mode==="ssunat") sunTop="solat";
  else if(mode==="amal"){ if(["solat","bersuci","haji"].indexOf(sunTop)>=0) sunTop="puasa"; }
  else sunTop=mode;
  vSunat0(el);
  el.querySelectorAll("[data-guide]").forEach(function(b){ b.remove(); });
  var open=sunOpen && el.querySelector('[data-so="'+sunOpen+'"]');
  if(open && SN_GUIDE[sunOpen]){ var card=open.closest(".card"), b=document.createElement("button"); b.className="btn alt full g3d"; b.style.marginTop="8px";
    b.innerHTML='📘 '+L2x("Panduan penuh langkah demi langkah","Full step-by-step guide");
    b.onclick=function(){ learnPg=SN_GUIDE[sunOpen]; learnFrom=null; go("learn"); };
    var cnt=card.querySelector("[data-cnt-sunat]"); if(cnt) card.insertBefore(b, cnt.parentNode); else card.appendChild(b); }
  var hdr=el.querySelector(".amhdr"); if(!hdr) return;
  if(mode==="bersuci"||mode==="haji"){ hdr.remove(); var d=el.querySelector(".mut.small:last-child"); if(d) d.remove(); return; }
  var lv2=hdr.querySelector(".lv2");
  if(mode==="ssunat"){ if(lv2) lv2.remove(); }
  else if(lv2){ lv2.querySelectorAll("[data-st]").forEach(function(b){ if(["solat","bersuci","haji"].indexOf(b.getAttribute("data-st"))>=0) b.remove(); }); }
  var dock=document.createElement("div"); dock.className="dock amdock"; dock.appendChild(hdr); el.appendChild(dock);
  // 0.5.27: the three shortcut chips (Sunnah prayers, Purification, Hajj & Umrah) under Deeds were removed; those pages have their own tabs
  if(mode==="amal"||mode==="ssunat") sunSwipe(el, mode);
  if(mode==="amal"){ var dc=document.createElement("div"); dc.className="card dgCard"; var am=el.querySelector(".amdock"); if(am) el.insertBefore(dc, am); else el.appendChild(dc); deedsInto(dc);   // 0.6.68 (owner): goals at the bottom
    var top=document.createElement("div"); top.className="amFast"; top.innerHTML=sunTop==="puasa"?(HC.ganti()||'')+(HC.ramadan()||'')+(HC.fast()||''):''; el.insertBefore(top, el.firstChild);   // 0.6.73 (owner): make-up fasts on top, only under Fasting
    top.addEventListener("click", function(e){ var b=e.target.closest("[data-act]"); if(b){ e.stopPropagation(); homeAct(b.getAttribute("data-act")); } });
    var fr=top.querySelector("#hFastRem"); if(fr) fr.onchange=function(){ S.fastRem=this.checked; saveS(); }; }
}
// 0.5.23 (Muslim Habit style): my own deed goals (e.g. 2 pages of Quran a day) with an optional daily reminder, ticked or counted
// each day, and a weekly report: a bar per day, the best day, and a share to WhatsApp. Storage ihsan_deeds {goals, log:{date:{id:n}}}.
var DG_SUG=[["📖","Baca Al-Quran","Read the Quran",2,"ms","pages"],["🌅","Solat Dhuha","Dhuha prayer",1,"",""],["💝","Sedekah","Charity",1,"",""],["📿","Istighfar","Istighfar",100,"kali","times"],["🤲","Doa untuk ibu bapa","Doa for parents",1,"",""]];
function dgData(){ var d=load("ihsan_deeds",null)||{}; d.goals=d.goals||[]; d.log=d.log||{}; return d; }
function deedsInto(box){ var D=dgData(), td=ymd(new Date()), L=D.log[td]||{}, days=[];
  for(var i=6;i>=0;i--){ var dt=addDays(new Date(),-i), k=ymd(dt), l=D.log[k]||{}, done=0; D.goals.forEach(function(g){ if((l[g.id]||0)>=g.n) done++; }); days.push({k:k, dt:dt, pc:D.goals.length?done/D.goals.length:0, done:done}); }
  var best=days.reduce(function(a, b){ return b.pc>a.pc?b:a; }, days[0]), tot=days.reduce(function(a, b){ return a+b.done; }, 0);
  var h='<div class="row"><h3 style="margin:0">🌱 '+L2x("Amalan saya","My deeds")+'</h3><button class="chip" id="dgAdd">＋ '+L2x("Matlamat","Goal")+'</button></div>';
  if(!D.goals.length) h+='<div class="mut small" style="margin:6px 0">'+L2x("Tetapkan amalan harian anda dan tanda setiap hari.","Set your daily deeds and tick them each day.")+'</div><div class="chips" style="flex-wrap:wrap">'+DG_SUG.map(function(x, i){ return '<button class="chip" data-dgs="'+i+'">'+x[0]+' '+esc(L2x(x[1],x[2]))+'</button>'; }).join("")+'</div>';
  else h+=D.goals.map(function(g, i){ var n=L[g.id]||0, ok=n>=g.n;
    return '<div class="dgRow'+(ok?' ok':'')+'"><button class="dgTick" data-dg="'+i+'" aria-label="+1">'+(ok?'✓':(g.n>1?n:''))+'</button><div class="dgTx"><b>'+esc(g.ic+' '+g.name)+'</b><small>'+(g.n>1?n+' / '+g.n+(g.u?' '+esc(g.u):''):(ok?L2x("Selesai hari ini","Done today"):L2x("Ketik bila selesai","Tap when done")))+(g.rem?' · ⏰ '+g.rem:'')+'</small></div>'+(n?'<button class="chip" data-dgu="'+i+'" aria-label="−1">−</button>':'')+'<button class="chip" data-dge="'+i+'" aria-label="'+L2x("Ubah","Edit")+'">✎</button></div>'; }).join("");
  if(D.goals.length){ h+='<div class="dgWeek">'+days.map(function(d){ return '<div class="dgDay'+(d===best&&d.pc>0?' best':'')+'"><i style="height:'+Math.max(4,Math.round(d.pc*100))+'%"></i><small>'+d.dt.toLocaleDateString(locTag(),{weekday:"narrow"})+'</small></div>'; }).join("")+'</div>'+
    '<div class="mut small">'+L2x("7 hari: ","7 days: ")+tot+' '+L2x("amalan selesai","deeds done")+(best.pc>0?' · '+L2x("Hari terbaik: ","Best day: ")+best.dt.toLocaleDateString(locTag(),{weekday:"long"})+' ('+Math.round(best.pc*100)+'%)':'')+'</div>'+
    '<button class="chip" id="dgShare" style="margin-top:6px">↗ '+L2x("Kongsi laporan minggu","Share the week")+'</button>'; }
  box.innerHTML=h;
  var save_=function(){ save("ihsan_deeds", D); deedsInto(box); }, edit=function(g, isNew){
    var ov=showSheet("🌱 "+(isNew?L2x("Matlamat baharu","New goal"):L2x("Ubah matlamat","Edit goal")), '<input id="dgN" class="rin" maxlength="40" value="'+esc(g.name)+'" placeholder="'+L2x("Nama amalan","Deed name")+'">'+
      '<div class="row" style="margin-top:8px;gap:8px"><input id="dgC" class="rin" type="number" min="1" value="'+g.n+'" style="width:90px" aria-label="'+L2x("Sasaran sehari","Daily target")+'"><input id="dgU" class="rin" maxlength="12" value="'+esc(g.u||"")+'" placeholder="'+L2x("unit (ms, kali…)","unit (pages, times…)")+'" style="flex:1"></div>'+
      '<label class="set" style="margin-top:8px"><span>⏰ '+L2x("Peringatan harian","Daily reminder")+'</span><input id="dgR" type="time" value="'+(g.rem||"")+'"></label>'+
      '<div class="btns" style="margin-top:10px"><button class="btn gold g3d" id="dgOk">'+L2x("Simpan","Save")+'</button>'+(isNew?'':'<button class="btn alt g3d" id="dgDel">🗑 '+L2x("Padam","Delete")+'</button>')+'</div>');
    ov.querySelector("#dgOk").onclick=function(){ g.name=ov.querySelector("#dgN").value.trim()||g.name; g.n=Math.max(1,+ov.querySelector("#dgC").value||1); g.u=ov.querySelector("#dgU").value.trim(); g.rem=ov.querySelector("#dgR").value||null;
      if(isNew) D.goals.push(g); closeOverlay(); save("ihsan_deeds", D); pushSchedule(); deedsInto(box); };
    var del=ov.querySelector("#dgDel"); if(del) del.onclick=function(){ D.goals=D.goals.filter(function(x){ return x!==g; }); closeOverlay(); save("ihsan_deeds", D); pushSchedule(); deedsInto(box); }; };
  box.querySelectorAll("[data-dgs]").forEach(function(b){ b.onclick=function(){ var x=DG_SUG[+b.getAttribute("data-dgs")]; edit({id:"g"+Date.now().toString(36), ic:x[0], name:L2x(x[1],x[2]), n:x[3], u:L2x(x[4],x[5]), rem:null}, true); }; });
  var ad=box.querySelector("#dgAdd"); if(ad) ad.onclick=function(){ edit({id:"g"+Date.now().toString(36), ic:"🌱", name:"", n:1, u:"", rem:null}, true); };
  box.querySelectorAll("[data-dg]").forEach(function(b){ b.onclick=function(){ var g=D.goals[+b.getAttribute("data-dg")], l=D.log[td]=D.log[td]||{}; l[g.id]=(l[g.id]||0)+1; if(l[g.id]===g.n) N.vibrate(60); save_(); }; });
  box.querySelectorAll("[data-dgu]").forEach(function(b){ b.onclick=function(){ var g=D.goals[+b.getAttribute("data-dgu")], l=D.log[td]=D.log[td]||{}; l[g.id]=Math.max(0,(l[g.id]||0)-1); save_(); }; });
  box.querySelectorAll("[data-dge]").forEach(function(b){ b.onclick=function(){ edit(D.goals[+b.getAttribute("data-dge")], false); }; });
  var sh=box.querySelector("#dgShare"); if(sh) sh.onclick=function(){ var t="🌱 "+L2x("Amalan saya minggu ini","My deeds this week")+"\n"+days.map(function(d){ return d.dt.toLocaleDateString(locTag(),{weekday:"short"})+" "+"●".repeat(d.done)+"○".repeat(Math.max(0,D.goals.length-d.done)); }).join("\n")+"\n"+L2x("Jumlah: ","Total: ")+tot+" · My Ihsan";
    if(window.Native && N.shareText) N.shareText(t); else if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ toast(L2x("Disalin","Copied")); }); };
  // keep only 60 days of history
  var ks=Object.keys(D.log).sort(); if(ks.length>60){ ks.slice(0, ks.length-60).forEach(function(k){ delete D.log[k]; }); save("ihsan_deeds", D); } }
// 0.34.0: swipe sideways between the topics (Amal sunat) or categories (Solat sunat); the next one rides in beside it
function sunSwipe(el, mode){
  var amal=mode==="amal", L=amal?SUNAT_TOP.filter(function(c){ return ["solat","bersuci","haji"].indexOf(c[0])<0; }).map(function(c){ return c[0]; }):SUNAT_CATS.map(function(c){ return c[0]; });
  var cur=function(){ return L.indexOf(amal?sunTop:sunCat); }, set=function(k){ if(amal) sunTop=k; else sunCat=k; };
  var nb=function(s){ return L[cur()+(s<0?1:-1)]; };
  var pg=ibWrap(el);
  IbSwipe(pg, {can:function(s){ return !!nb(s); },
    go:function(s){ set(nb(s)); sunOpen=null; render(); },
    find:function(){ return document.querySelector("#view .ibpg"); },
    peek:function(s){ var k=nb(s), t0=sunTop, c0=sunCat, o0=sunOpen, b=IbSwipe.shot(function(){ set(k); sunOpen=null; }, function(x){ vSunatMode(x, mode); }, function(){ sunTop=t0; sunCat=c0; sunOpen=o0; });
      if(!b) return null; var w=b.querySelector(".ibpg"); return w; }});
}
function vSunatHub(el){
  var f={quran:function(e){ e.innerHTML='<div id="quranBox"></div>'; vQuran(e.querySelector("#quranBox")); }, zikir:vZikir, doa:vDoa, wirid:vWirid, mathurat:vMathurat, amal:function(e){ vSunatMode(e,"amal"); }, tanya:function(e){ e.innerHTML='<div id="ilmuBox"></div>'; vIlmu(e.querySelector("#ilmuBox"), "askai", true); }}[sunPage];
  if(!f || sunPage==="tanya"){ if(sunPage==="tanya") setTimeout(function(){ openSettings("ai"); }, 0); sunPage="quran"; return vSunatHub(el); }
  f(el);
}

// ---------- ILMU ----------
function lTile(id, ic, ms, en){ return '<button class="qt g3d" data-learn="'+id+'"><span>'+ic+'</span>'+esc(L2x(ms,en))+'</button>'; }
var SCI_TILES=[["algebra","➗","Algebra & matematik","Algebra & mathematics",["Persamaan dan algoritma","Equations and algorithms"],"#1b3a7a","#4f7bff","#9fd0ff"],
  ["medicine","🩺","Perubatan","Medicine",["Hospital dan pembedahan","Hospitals and surgery"],"#5a1022","#c0394b","#f7a8b0"],
  ["pharma","🌿","Farmakologi & tumbuhan ubat","Pharmacology & plants",["Atlas tumbuhan ubat","A medicinal plant atlas"],"#14432a","#2f8f5b","#c9e7a6"],
  ["optics","🔭","Optik & penglihatan","Optics & vision",["Cahaya, cermin, kanta","Light, mirrors, lenses"],"#2a1650","#6b4bd8","#ffd56b"],
  ["geo","🗺️","Geografi & kartografi","Geography & maps",["Peta dan laluan dunia","World maps and routes"],"#0f3d4f","#1f8aa8","#f2d49b"],
  ["automata","⚙️","Mekanik & automata","Machines & automata",["Jam air al-Jazari","Al-Jazari's water clocks"],"#3a2410","#a8642a","#f2c27a"],
  ["water","💧","Kejuruteraan air","Water engineering",["Qanat dan kincir air","Qanats and water wheels"],"#0b3a5c","#1d7fc2","#9fe3f5"],
  ["botany","🌾","Botani & pertanian","Botany & farming",["Tanaman dan tanah","Crops and soil"],"#2e3d0f","#7aa02a","#f0e08a"],
  ["chem","⚗️","Kimia & galian","Chemistry & minerals",["Penyulingan selamat","Safe distilling"],"#3d1a3d","#9b3e9b","#ffb36b"],
  ["crypto","🔐","Kriptografi & kod","Cryptography & codes",["Teka-teki sifir al-Kindi","Al-Kindi cipher puzzles"],"#10202e","#2d5f7a","#7fe0c4"]];
var sciId=null;
// 0.5.70 (owner): 3D chess at the top of Science (chess/chess_engine.js + chess/chess.js)
// 0.6.37 (owner spec): Explore › 🧠 IQ puzzles (iq/core.js + iq/g_<id>.js): 20 Three.js puzzles from Islamic, Arab and Malay heritage
function iqHero(){ var n=0; try{ var o=JSON.parse(localStorage.getItem("ihsan_iq")||"{}"); n=Object.keys(o).filter(function(k){ return o[k] && (o[k].b0!=null||o[k].b1!=null||o[k].b2!=null); }).length; }catch(e){}
  return '<button class="bnHero bn-iq" data-iqg="1"><span class="bnSc"></span><span class="iqLamp"></span><span class="iqCubes"><i></i><i></i><i></i><i></i><i></i></span><span class="shTxt" style="padding-right:130px"><b>🧠 '+L2x("Teka-teki IQ","IQ puzzles")+'</b><small>'+L2x("20 teka-teki 3D: cermin cahaya, pelita, congkak, songket, falaj dan banyak lagi. Mudah dimulakan, susah dikuasai","20 3D puzzles: light mirrors, pelita lamps, congkak, songket, falaj and more. Easy to start, hard to master")+(n?' · '+n+'/20 ✓':'')+'</small></span><span class="shGo">›</span></button>'; }
function iqCss(){ if(!document.getElementById("iqCss")){ var l=document.createElement("link"); l.id="iqCss"; l.rel="stylesheet"; l.href="iq/iq.css"; document.head.appendChild(l); } }
function openIQ(){ iqCss(); SUB2.learn="panduan"; learnPg="iqg"; learnFrom=null; if(view==="learn") render(); else go("learn"); }
function chessHero(){ var cs=load("ihsan_chess_stats",{w:0,l:0,d:0})||{}; return '<button class="bnHero bn-chess" data-chess="1"><span class="bnSc"></span><span class="bnI">♟️</span><span class="shTxt"><b>'+L2x("Catur 3D","3D chess")+'</b><small>'+L2x("Lawan robot (3 tahap) atau 2 pemain, jam catur, tema perpustakaan klasik atau istana Melayu","Play the robot (3 levels) or a friend, with clocks, in a classic library or a Malay royal court")+((cs.w||cs.l||cs.d)?' · '+L2x("Menang ","Won ")+(cs.w||0)+' · '+L2x("Kalah ","Lost ")+(cs.l||0)+' · '+L2x("Seri ","Drawn ")+(cs.d||0):'')+'</small></span><span class="shGo">›</span></button>'; }
// 0.5.81 (owner): Explore › Khat coach (science/khat.js): write a letter on screen or photograph it on paper; the online AI checks it
function khatHero(){ var d=load("ihsan_khat",{})||{}, h0=(d.h||[]), best=h0.reduce(function(a,x){ return Math.max(a,x.s||0); },0); return '<button class="bnHero bn-khat" data-khat="1"><span class="bnSc"></span><span class="bnI">🖋️</span><span class="shTxt"><b>'+L2x("Jurulatih khat AI","AI khat coach")+'</b><small>'+L2x("Tulis huruf atau perkataan Jawi (khat nasakh) di skrin atau di kertas. AI menyemak bentuk, titik dan lengkung, dan memberi markah","Write a Jawi letter or word (khat nasakh) on screen or on paper. The AI checks the shape, dots and curves, and gives a score")+(h0.length?' · '+h0.length+' '+L2x("latihan","tries")+' · ⭐ '+best:'')+'</small></span><span class="shGo">›</span></button>'; }
function openKhat(){ sciCss(); SUB2.learn="panduan"; learnPg="khat"; learnFrom=null; if(view==="learn") render(); else go("learn"); document.getElementById("view").scrollTop=0; }
// 0.5.98 (owner): Sports (sport/) moved from Time › Exercise to Explore: its own page, the same Sports module
function sportHero(){ return '<button class="bnHero bn-sport" data-sportgo="1"><span class="bnSc"></span><span class="bnI">🏅</span><span class="shTxt"><b>'+L2x("Sukan","Sports")+'</b><small>'+L2x("Peraturan setiap sukan dengan padang 3D, kuiz dan permainan mini. Sukan hari ini berubah setiap hari","Rules of each sport with 3D fields, quizzes and mini games. A new sport of the day, every day")+'</small></span><span class="shGo">›</span></button>'; }
function openSport(){ SUB2.learn="panduan"; learnPg="sport"; learnFrom=null; if(view==="learn") render(); else go("learn"); document.getElementById("view").scrollTop=0; }
function martialHero(){ return '<button class="bnHero bn-martial" data-martialgo="1"><span class="bnSc"></span><span class="bnI">🥋</span><span class="shTxt"><b>'+L2x("Seni mempertahankan diri","Martial arts")+'</b><small>'+L2x("10 seni: silat, taekwondo, judo, karate dan lagi. Panduan lengkap + pelajaran 3D","10 arts: silat, taekwondo, judo, karate and more. Full guides + 3D lessons")+'</small></span><span class="shGo">›</span></button>'; }   // 0.7.42 (owner)
function openMartial(){ SUB2.learn="panduan"; learnPg="martial"; learnFrom=null; if(view==="learn") render(); else go("learn"); document.getElementById("view").scrollTop=0; }
document.addEventListener("click", function(e){ var t=e.target && e.target.closest && e.target.closest("[data-martialgo]"); if(!t) return; e.stopPropagation(); setTimeout(openMartial, 0); }, true);
document.addEventListener("click", function(e){ var t=e.target && e.target.closest && e.target.closest("[data-sportgo]"); if(!t) return; e.stopPropagation(); setTimeout(openSport, 0); }, true);
function openChess(){ if(!document.querySelector('link[href="chess/chess.css"]')){ var l=document.createElement("link"); l.rel="stylesheet"; l.href="chess/chess.css"; document.head.appendChild(l); } SUB2.learn="panduan"; learnPg="chess"; learnFrom=null; if(view==="learn") render(); else go("learn"); document.getElementById("view").scrollTop=0; }
window.openChess=openChess; window.openMartial=openMartial;
function sciCss(){ if(!document.querySelector('link[href="science/science.css"]')){ var l=document.createElement("link"); l.rel="stylesheet"; l.href="science/science.css"; document.head.appendChild(l); } }
// 0.5.72 (owner): one colourful "Science in Islamic History" banner holds the ten field tiles
function sciTilesHtml(){ var sc=(load("ihsan_sci",{})||{}).q||{}; return '<div class="sciGrid">'+SCI_TILES.map(function(x){ return '<button class="sciT g3d" data-sci="'+x[0]+'" style="--c0:'+x[5]+';--c1:'+x[6]+';--c2:'+x[7]+'">'+(sc[x[0]]!=null?'<span class="sciS">'+sc[x[0]]+'/3</span>':'')+'<span class="sciI">'+x[1]+'</span><b>'+esc(L2x(x[2],x[3]))+'</b><small>'+esc(x[4][en_()?1:0])+'</small></button>'; }).join("")+'</div>'+
  '<div class="mut small" style="margin:6px 2px 12px">'+L2x("Sebahagian daripada sejarah sains yang dikongsi: sarjana Muslim membangunkan, menguji dan mengembangkan ilmu daripada banyak tamadun.","Part of a wider, shared history of science: Muslim scholars developed, tested and expanded knowledge from many cultures.")+'</div>'; }
function sciHero(){ var sc=(load("ihsan_sci",{})||{}).q||{}, n=Object.keys(sc).length; return '<button class="bnHero bn-scih" data-scihub="1"><span class="bnSc"></span><span class="bnI">🔭</span><span class="shTxt"><b>'+L2x("Sains dalam Sejarah Islam","Science in Islamic History")+'</b><small>'+L2x("10 bidang: algebra, perubatan, optik, peta, jam air, kod rahsia dan lain-lain, dengan model 3D","10 fields: algebra, medicine, optics, maps, water clocks, secret codes and more, in 3D")+(n?' · '+n+'/10 '+L2x("dikuiz","quizzed"):'')+'</small></span><span class="shGo">›</span></button>'; }
function openSciHub(){ sciCss(); SUB2.learn="panduan"; learnPg="scihub"; learnFrom=null; if(view==="learn") render(); else go("learn"); document.getElementById("view").scrollTop=0; }
window.openSciHub=openSciHub;
function openSci(id){ sciCss(); var fromHub=learnPg==="scihub"; sciId=id; SUB2.learn="panduan"; learnPg="sci"; learnFrom=fromHub?"scihub":null; if(view==="learn") render(); else go("learn"); document.getElementById("view").scrollTop=0; }
window.openSci=openSci;
// 0.5.70 (owner): the Guides tab became Science. Purification and Hajj & Umrah are banners in Basics; the Solat guide and Basics are banners at the top of Rakaat.
var basicsPg=null, basicsFrom=null;
function openGuide(k, from){ basicsPg=k; basicsFrom=from||null; SUB2.learn="bahasa"; learnPg=null; learnFrom=null; if(view==="learn") render(); else go("learn"); document.getElementById("view").scrollTop=0; }
function guideHero(k){ var D={bersuci:["bn-bersuci","💧",L2x("Bersuci","Purification"),L2x("Wuduk, mandi wajib, tayammum, istinjak dan najis, haid & nifas","Wudhu, ghusl, tayammum, istinja' and najis, haid & nifas")],
    solat:["bn-solatg","🧎",L2x("Panduan solat","Solat guide"),L2x("Cara solat, bacaan, latihan berpandu, solat sakit & musafir, khutbah Jumaat","How to pray, the readings, guided practice, praying when sick or travelling, Friday khutbah")],
    haji:["bn-hajig","🕋",L2x("Haji & Umrah","Hajj & Umrah"),L2x("3D, Umrah DIY, kaunter tawaf & sa'ie, siaran langsung Makkah","3D, Umrah DIY, tawaf & sa'ie counter, live from Makkah")],
    asas:["bn-asasg","📖",L2x("Asas","Basics"),L2x("Bersuci, Asas Membaca al-Quran, tajwid, maksud al-Quran dan fiqh","Purification, learning to read the Quran, tajweed, Quran meanings and fiqh")]}[k];
  return '<button class="bnHero '+D[0]+'" data-guide="'+k+'"><span class="bnSc"></span><span class="bnI">'+D[1]+'</span><span class="shTxt"><b>'+D[2]+'</b><small>'+D[3]+'</small></span><span class="shGo">›</span></button>'; }
function guideHtml(k){ var h='';
  if(k==="bersuci") h+='<div class="lgrid">'+lTile("wudhu","💧","Cara berwuduk","How to make wudhu")+lTile("x_mandi","🚿","Mandi wajib","Obligatory bath")+lTile("x_tayammum","🏜","Tayammum","Tayammum")+lTile("x_istinja","🚽","Istinjak & najis","Istinja' & najis")+lTile("haid","🌸","Haid & nifas","Haid & nifas")+'</div><div class="snl" style="margin:14px 2px 0">'+L2x("Ringkasan amalan","Quick summaries")+'</div><div id="pSn"></div>';
  else if(k==="solat"){ var sec=function(t){ return '<div class="snl" style="margin:14px 2px 6px">'+t+'</div>'; };
    // 0.5.71 (owner): ordered and grouped: practise · learn · when it is hard · more prayers · Friday
    h+='<button class="bnHero bn-prac g3d" data-prac="1"><span class="bnSc"></span><span class="bnI">🔊</span><span class="shTxt"><b>'+L2x("Latihan solat berpandu","Guided solat practice")+'</b><small>'+L2x("Suara memandu setiap pergerakan dan bacaan, rakaat demi rakaat","A voice guides every movement and reading, rakaat by rakaat")+'</small></span><span class="shGo">›</span></button>';
    h+=sec("1 · "+L2x("Belajar solat","Learn the prayer"))+'<div class="lgrid">'+lTile("solat","🧎","Cara solat","How to pray")+lTile("bacaan","📜","Bacaan dalam solat","Readings in solat")+'</div>';
    h+=sec("2 · "+L2x("Keadaan khas","Special situations"))+'<div class="lgrid">'+lTile("sakit","🏥","Solat ketika sakit","Praying when sick")+lTile("musafir","🚗","Solat musafir (qasar & jamak)","Travelling (qasar & jamak)")+'</div>';
    h+=sec("3 · "+L2x("Solat sunat & khas","Sunnah & special prayers"))+'<div class="lgrid"><button class="qt g3d" data-jss="1"><span>🌅</span>'+L2x("Istikharah, Hajat, Raya, Gerhana, Jenazah ›","Istikharah, Hajat, Eid, Eclipse, Funeral ›")+'</button></div>';
    h+=sec("4 · "+L2x("Jumaat","Friday"))+'<button class="kbHero g3d" data-khutbah="1"><span>🕌</span><span><b>'+L2x("Khutbah Jumaat semua negeri","Friday khutbah for every state")+'</b><small>'+L2x("Teks khutbah terkini dari jabatan agama setiap negeri","The latest khutbah text from each state's religious department")+'</small></span><span class="shGo">›</span></button>'; }
  else { h+=hajjHero(false)+umrahHero();
    h+='<div class="lgrid"><button class="qt g3d" data-umlive="1"><span>🕋</span>'+L2x("Mod Umrah langsung","Live Umrah mode")+'</button><button class="qt g3d" data-tawaf="1"><span>🔢</span>'+L2x("Kaunter tawaf & sa'ie","Tawaf & sa'ie counter")+'</button>'+lTile("live","📺","Siaran langsung & waktu Makkah","Live & Makkah times")+'</div>';
    h+='<div class="snl" style="margin:14px 2px 0">'+L2x("Rukun, wajib & sunat","Pillars, obligations & sunnah")+'</div><div id="pSn"></div>'; }
  return h; }
function qmeanHero(){ return '<button class="bnHero bn-qmean" data-learn="qwords"><span class="bnSc"></span><span class="bnI">📖</span><span class="shTxt"><b>'+L2x("Maksud al-Quran","Meanings of Quran")+'</b><small>'+L2x("300 kata yang kerap dalam al-Quran dan glosari istilah, dengan kad imbas","300 common Quran words and a glossary of terms, with flashcards")+'</small></span><span class="shGo">›</span></button>'; }
function sirahHeroB(){ return '<button class="sirahHero" data-sirah="adult"><span class="shSky"></span><span class="shDune"></span><span class="shTxt"><b>'+L2x("Sirah Nabi ﷺ","Sirah of the Prophet ﷺ")+'</b><small>'+L2x("Garis masa interaktif, dari Tahun Gajah hingga wafat","Interactive timeline, from the Year of the Elephant to his passing")+'</small></span><span class="shGo">›</span></button>'; }
function peopleHero(){ return '<div class="bnHero bn-people" role="group"><span class="bnSc"></span><span class="bnI">🌿</span><span class="shTxt"><b>'+L2x("Para Nabi, Isteri Nabi ﷺ & Sahabat","Prophets, the Prophet's ﷺ wives & Companions")+'</b><small>'+L2x("Kisah 25 nabi, Ummahatul Mukminin dan para sahabat","Stories of the 25 prophets, the Mothers of the Believers and the Companions")+'</small>'+
  '<span class="bnPills"><button class="bnPill" data-ppl="nabi">🌿 '+L2x("25 Nabi","25 Prophets")+'</button><button class="bnPill" data-ppl="isteri">🌸 '+L2x("Isteri Nabi","Wives")+'</button><button class="bnPill" data-ppl="sahabat">🏅 '+L2x("Sahabat","Companions")+'</button></span></span></div>'; }
function hadithHero(){ return '<button class="bnHero bn-hadith" data-learn="n40"><span class="bnSc"></span><span class="bnI">📜</span><span class="shTxt"><b>'+L2x("40 Hadis Nawawi","40 Hadith Nawawi")+'</b><small>'+L2x("Hadis asas agama oleh Imam an-Nawawi, dengan terjemahan, hafazan dan audio","The foundation hadith collected by Imam an-Nawawi, with translation, memorising and audio")+'</small></span><span class="shGo">›</span></button>'; }
function vLearn(el){
  if(learnPg || (S.kidLock && S.lockTo!=="school")){ vLearn0(el); return; }
  if(S.kidLock){ learnPg=null; SUB2.learn="sekolah"; }   // 0.6.43: School lock shows only School
  var s=SUB2.learn, h='';
  if(s==="quran"){ SUB2.learn="panduan"; s="panduan"; }
  if(s==="tajwid" || s==="fiqh"){ SUB2.learn="bahasa"; s="bahasa"; }
  if(s==="tanya"){ SUB2.learn="sekolah"; openSettings("ai"); return; }   // 0.6.23: Ask is in Practice now
  if(s==="panduan"){
    // 0.5.70 (owner): Guides became Science: the chess banner, Astronomy, and ten fields from the history of science in Muslim lands
    sciCss(); iqCss(); h+=iqHero()+khatHero()+chessHero()+sportHero()+martialHero()+falakHero();   // 0.5.98 (owner): Sports moved here from Time › Exercise   // 0.5.81 (owner): Science is now Explore, with the Khat coach banner
    h+=sciHero();
  } else if(s==="kisah"){
    kidsPick(el); return;   // 0.7.60 (owner): Learn › Kids = the Iqra | Planet banners, no extra banner
    h+=kidsHero();
    // 0.7.56 (owner): Sirah and the Prophets & Companions banners moved to Basics; the Islamic quiz lives in the Kids Planet (Masjid Hill)
  } else if(s==="sekolah"){
    el.innerHTML='<div id="sekBox"></div>'; vSekolah(el.querySelector("#sekBox")); return;
  } else if(s==="buku"){
    el.innerHTML='<div id="bkBox"></div>'; vBooks(el.querySelector("#bkBox")); return;
  } else if(s==="bahasa" && basicsPg){
    // 0.5.70 (owner): Purification, Solat and Hajj & Umrah guides (from the old Guides tab) open from banners
    h+='<div class="row" style="margin:4px 2px 8px"><button class="chip" id="bsBack">‹ '+(basicsFrom==="rakaat"?"Rakaat":"Ilmu")+'</button><b>'+({bersuci:"💧 "+L2x("Bersuci","Purification"), solat:"🧎 "+L2x("Panduan solat","Solat guide"), haji:"🕋 "+L2x("Haji & Umrah","Hajj & Umrah")})[basicsPg]+'</b><span></span></div><div class="gdPage">'+guideHtml(basicsPg)+'</div>';
  } else if(s==="bahasa"){
    // 0.7.56 (owner): half-height banners in two columns; Fiqh, Sirah and Prophets & Companions stay full width (with their shortcuts); the four-option Fiqh card is gone
    h+='<div class="bnHalf">'+guideHero("haji")+guideHero("bersuci")+iqraHero()+tajwidHero()+qmeanHero()+hadithHero()+fiqhHero()+peopleHero()+'</div>'+sirahHeroB()+'<div id="xSnip"></div>';   // 0.7.60 (owner): Fiqh and Companions half too; every half banner keeps its short brief
  } else if(s==="dengar"){
    h+=radioHero()+podHero()+liveHero()+newsHero();
  } else if(s==="tanya"){
    h+='<div id="ilmuBox"></div>';
  }
  h+='<div class="mut small" style="padding:10px 4px 12px">'+L2x("Kandungan prototaip mengikut mazhab Syafi'i: sila dapatkan semakan ustaz.","Prototype content following the Shafi'i school: please have it reviewed by an ustaz.")+'</div>';
  el.innerHTML=h;
  var ist=el.querySelector("[data-isteri]"); if(ist) ist.onclick=function(){ nabiMode="isteri"; learnPg="nabi"; learnFrom=null; render(); document.getElementById("view").scrollTop=0; };
  el.querySelectorAll("[data-ppl]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); var k=b.getAttribute("data-ppl"); if(k==="sahabat") learnPg="sahabat"; else { nabiMode=k==="isteri"?"isteri":"adult"; learnPg="nabi"; } learnFrom=null; render(); document.getElementById("view").scrollTop=0; }; });
  var pplH=el.querySelector(".bn-people"); if(pplH) pplH.onclick=function(){ nabiMode="adult"; learnPg="nabi"; learnFrom=null; render(); document.getElementById("view").scrollTop=0; };
  el.querySelectorAll("[data-guide]").forEach(function(b){ b.onclick=function(){ openGuide(b.getAttribute("data-guide")); }; });
  el.querySelectorAll("[data-sci]").forEach(function(b){ b.onclick=function(){ openSci(b.getAttribute("data-sci")); }; });
  var chb=el.querySelector("[data-chess]"); if(chb) chb.onclick=function(){ openChess(); };
  var iqb=el.querySelector("[data-iqg]"); if(iqb) iqb.onclick=openIQ;
  var khb=el.querySelector("[data-khat]"); if(khb) khb.onclick=function(){ openKhat(); };
  var shb=el.querySelector("[data-scihub]"); if(shb) shb.onclick=openSciHub;
  var bsb=el.querySelector("#bsBack"); if(bsb) bsb.onclick=function(){ var fr=basicsFrom; basicsPg=null; basicsFrom=null; if(fr==="rakaat"){ SUB2.solat="rakaat"; go("solat"); } else { render(); document.getElementById("view").scrollTop=0; } };
  var xs=el.querySelector("#xSnip"); if(xs) withExtra(null, function(){ IbExtra.sirahSnippet(xs, xH()); });
  el.querySelectorAll("[data-pl]").forEach(function(b){ b.onclick=function(){ pandL3=b.getAttribute("data-pl"); sunOpen=null; render(); document.getElementById("view").scrollTop=0; }; });
  var js=el.querySelector("[data-jss]"); if(js) js.onclick=function(){ SUB2.solat="ssunat"; sunCat="khas"; go("solat"); };
  var kb=el.querySelector("[data-khutbah]"); if(kb) kb.onclick=khutbahSheet;
  var fh=el.querySelector("[data-falak]"); if(fh) fh.onclick=function(){ openFalak(); };
  var ps=el.querySelector("#pSn"); if(ps) vSunatMode(ps, (basicsPg||pandL3)==="bersuci"?"bersuci":"haji");
  var ib=el.querySelector("#ilmuBox"); if(ib) vIlmu(ib, "askai", true);
}
// ---------- 0.5.25 Falak / Astronomy (falak/): hilal map, sky, Rasd al-Qibla, shadow clock, twilight, eclipses, hilal reports, calendar, astrolabe & sundial, stories ----------
function falakHero(){ return '<button class="falakHero" data-falak="1"><span class="fhStars"></span><span class="fhP1"></span><span class="fhP2"></span><span class="fhP3"></span><span class="fhT"><b>🪐 '+L2x("Falak","Astronomy")+'</b><small>'+L2x("Anak bulan, langit malam, kiblat dari matahari, gerhana dan kisah ahli falak Muslim","The new moon, the night sky, qibla from the sun, eclipses and stories of Muslim astronomers")+'</small></span><span class="fhGo">›</span></button>'; }
function falakH(){ var h=finH(); h.S=S; h.loadJs=loadJs; h.loc=function(){ return qiblaPoint(); }; h.tz=function(){ return -new Date().getTimezoneOffset()/60; };
  h.hijri=function(d){ return hijriOf(d); }; h.getDay=function(d){ var t=getDay(d); return {subuh:t.subuh?fmt12(t.subuh):"", isyak:t.isyak?fmt12(t.isyak):""}; };
  h.openGerhana=function(){ sunOpen="gerhana"; sunCat="khas"; SUB2.solat="ssunat"; go("solat"); }; h.onClose=function(){}; return h; }
function openFalak(tool){ if(!document.querySelector('link[href="falak/falak.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="falak/falak.css"; document.head.appendChild(lk); }
  var go_=function(){ try{ Falak.open(falakH(), {tool:tool}); }catch(e){ console.error(e); toast(L2x("Falak gagal dibuka","Could not open Astronomy")); } };
  if(window.Falak && window.Astro && window.FALAK_LAND) go_(); else loadJs(["falak/astro.js","falak/land.js","falak/falak.js"], go_); }
window.openFalak=openFalak;
// ---------- Sekolah (silibus/): school syllabus notes, quizzes and games, per child (Sedia–Tahun 3 now; up to Tingkatan 5 later) ----------
var SEK_LV=[["PRA","🎒","Sedia (Ujian Kemasukan)","Pre-Year 1 (entrance)"],["T1","1️⃣","Tahun 1","Year 1"],["T2","2️⃣","Tahun 2","Year 2"],["T3","3️⃣","Tahun 3","Year 3"],["T4","4️⃣","Tahun 4","Year 4"],["T5","5️⃣","Tahun 5","Year 5"],["T6","6️⃣","Tahun 6","Year 6"],
  ["F1","🏫","Tingkatan 1","Form 1"],["F2","🏫","Tingkatan 2","Form 2"],["F3","🏫","Tingkatan 3","Form 3"],["F4","🎓","Tingkatan 4","Form 4"],["F5","🎓","Tingkatan 5","Form 5"]];
var SEK_CAT=null;
// 0.5.72 (owner): the keycap number emoji (1️⃣…) do not show on every phone, so Years 1-6 get a drawn number badge
function sekIc(x){ return /^T\d$/.test(x[0]) ? '<span class="lvNum">'+x[0].slice(1)+'</span>' : x[1]; }
function sekIcT(x){ return /^T\d$/.test(x[0]) ? "" : x[1]+" "; }
// 0.6.12 School textbooks (📘 on each subject card). Catalogue: silibus/textbooks.json {v, pek:{<pack id>:[{n, s, u:[links]}]}};
// a newer copy can be published in the owner's Drive (TB_REMOTE) so dead links are fixed without an app update.
// Download: Native.bookFetch tries each link in order (original public file first, then the owner's Drive copy) into the Books
// library, filed in Books › Study › <year> › <subject>.
var SEK_TB=null, TB_DL={}, TB_REMOTE="https://drive.usercontent.google.com/download?id=18Y0cAQ-ikeTDZmdWwcJ--3-HRuZpLrd0&export=download&confirm=t";   // Drive: Buku Teks Digital KSSM Tingkatan 1-5 › my-ihsan-textbooks.json (raise "v" when editing)
function sekTbLoad(cb){ if(SEK_TB){ cb&&cb(); return; } sekXhr("silibus/textbooks.json", function(c){ SEK_TB=c||{v:0,pek:{}}; try{ var r=load("ihsan_tb_remote",null); if(r&&r.v>SEK_TB.v) SEK_TB=r; }catch(e){} cb&&cb(); sekTbRemote(); }); }
function sekTbRemote(){ if(!TB_REMOTE||!window.Native||!N.fetchUrl||sekTbRemote.done) return; sekTbRemote.done=1; var id="tb"+Date.now(), h=function(r){ if(r.id!==id) return; off("fetch",h); try{ var j=JSON.parse(r.body); if(j&&j.pek&&j.v>(SEK_TB&&SEK_TB.v||0)){ SEK_TB=j; save("ihsan_tb_remote",j); } }catch(e){} }; on("fetch",h); N.fetchUrl(id, TB_REMOTE); }
function sekTbOf(p){ return SEK_TB&&SEK_TB.pek ? (SEK_TB.pek[p.asal||p.id]||[]) : []; }
function tbSub(pid){ return String(pid).replace(/^(sedia|t\d|f\d)-/,"").replace(/-dlp$/,""); }
function tbKey(pid,i){ return pid+"#"+i; }
function tbBookId(pid,i){ return ("tb-"+pid+"-"+i).replace(/[^A-Za-z0-9_-]/g,"-"); }
function tbLib(){ var l=load("ihsan_books",[]); return Array.isArray(l)?l:[]; }
function tbHave(pid,i){ var k=tbKey(pid,i); return tbLib().filter(function(b){ return b.tb===k; })[0]||null; }
function tbMB(n){ if(!n) return "PDF"; return n>=1048576 ? Math.round(n/1048576)+" MB" : Math.max(1,Math.round(n/1024))+" KB"; }
// folders Study › <year> › <subject> in the Books sidebar (books.js reads ihsan_books_set.folders; par = parent folder)
function tbFolder(lvId, lvName, subKey, subName, ic){ var s=load("ihsan_books_set",{})||{}; s.folders=s.folders||[];
  var put=function(id,n,par,i){ var f=s.folders.filter(function(x){ return x.id===id; })[0]; if(!f) s.folders.push(f={id:id}); f.n=n; if(par) f.par=par; else delete f.par; f.ic=i; };
  put("fstudy", L2x("Belajar","Study"), "", "🎓"); put("fstudy-"+lvId, lvName, "fstudy", "📅"); put("fstudy-"+lvId+"-"+subKey, subName, "fstudy-"+lvId, ic||"📘");
  save("ihsan_books_set", s); return "fstudy-"+lvId+"-"+subKey; }
function tbDone(p, lvName, i, b, id, size){ var pid=p.asal||p.id, col=tbFolder(p.tahap, lvName, tbSub(pid), String(p.nama||"").replace(/ \(DLP\)$/,""), p.ikon);
  var extra={tb:tbKey(pid,i), col:[col]};
  withBooks(function(){ BooksView.adopt(bkH(), id, b.n+".pdf", size, extra).then(function(){ toast("📘 "+L2x("Disimpan dalam Buku › Belajar","Saved in Books › Study")); tbRefresh(); }); }); }
function tbRefresh(){ var sh=document.querySelector(".tbSheet"); if(sh&&sh._draw) sh._draw(); }
on("bookfetch", function(d){ var k=Object.keys(TB_DL).filter(function(k){ return TB_DL[k].id===d.id; })[0]; if(!k) return; var t=TB_DL[k];
  if(d.st==="p"){ t.got=d.got; t.tot=d.tot||t.tot; t.src=d.src; tbRefresh(); return; }
  delete TB_DL[k];
  if(d.st==="ok") tbDone(t.p, t.lv, t.i, t.b, d.id, d.size);
  else { if(d.err!=="cancel") toast(d.err==="space"?L2x("Ruang storan tidak cukup","Not enough storage space"):L2x("Buku tidak dapat dimuat turun sekarang. Cuba lagi nanti.","The book can't be downloaded right now. Try again later.")); tbRefresh(); } });
function tbStart(p, lvName, i){ var pid=p.asal||p.id, b=sekTbOf(p)[i], k=tbKey(pid,i), id=tbBookId(pid,i); if(!b||TB_DL[k]) return;
  TB_DL[k]={id:id, got:0, tot:b.s, p:p, lv:lvName, i:i, b:b, src:0}; tbRefresh();
  if(window.Native && N.bookFetch){ N.bookFetch(id, JSON.stringify(b.u), String(b.s||0)); return; }
  // web: the browser may only read files from servers that allow it (CORS). Google Drive's download links do not, so each link is tried
  // through the Drive API when the web has an API key (MYIHSAN_CFG.driveKey), then as is; when all fail, tbWebManual offers the
  // browser's own download + adding the saved PDF to Books (0.7.78, owner: "web app can't download books from Learn")
  var cfg=window.MYIHSAN_CFG||{}, urls=[]; b.u.forEach(function(u){ var m=/[?&]id=([^&]+)/.exec(u); if(cfg.driveKey&&m&&/google\.com/.test(u)) urls.push("https://www.googleapis.com/drive/v3/files/"+m[1]+"?alt=media&key="+encodeURIComponent(cfg.driveKey)); urls.push(u); });
  var tryN=function(n){ if(!TB_DL[k]) return; if(n>=urls.length){ delete TB_DL[k]; tbRefresh(); tbWebManual(p, lvName, i); return; }
    fetch(urls[n]).then(function(r){ if(!r.ok) throw 0; return r.arrayBuffer(); }).then(function(ab){ var u8=new Uint8Array(ab); if(String.fromCharCode.apply(null,u8.subarray(0,4))!=="%PDF") throw 0;
      delete TB_DL[k]; withBooks(function(){ var col=tbFolder(p.tahap, lvName, tbSub(pid), String(p.nama||"").replace(/ \(DLP\)$/,""), p.ikon);
        BooksView.addBytes(bkH(), u8, b.n+".pdf", {tb:k, col:[col]}).then(function(){ toast("📘 "+L2x("Disimpan dalam Buku › Belajar","Saved in Books › Study")); tbRefresh(); }); }); }).catch(function(){ tryN(n+1); }); };
  tryN(0); }
// web fallback: open the link (the browser downloads the PDF to Downloads), then pick that file and it joins Books › Study like an app download
function tbWebManual(p, lvName, i){ var pid=p.asal||p.id, b=sekTbOf(p)[i], k=tbKey(pid,i); if(!b) return;
  var ov=showSheet("📘 "+esc(b.n), '<div class="small" style="line-height:1.5">'+L2x("Pelayar web tidak dibenarkan memuat turun buku ini terus ke dalam aplikasi (pelayan Google Drive menyekatnya). Dua langkah mudah:","The web browser isn't allowed to download this book straight into the app (Google Drive's server blocks it). Two quick steps:")+'</div>'+
    '<ol class="small" style="line-height:1.55;padding-left:20px;margin:8px 0"><li>'+L2x("Tekan ⬇ Muat turun. Fail PDF ("+tbMB(b.s)+") disimpan dalam folder Muat Turun pelayar. Jika Google bertanya tentang imbasan virus, tekan \u201cMuat turun juga\u201d.","Tap ⬇ Download. The PDF ("+tbMB(b.s)+") saves to the browser's Downloads. If Google says it can't scan it for viruses, tap \u201cDownload anyway\u201d.")+'</li><li>'+L2x("Kemudian tekan 📂 Tambah fail dan pilih PDF itu. Ia masuk ke Buku › Belajar seperti dalam aplikasi telefon.","Then tap 📂 Add the file and pick that PDF. It goes into Books › Study, as in the phone app.")+'</li></ol>'+
    '<button class="btn gold full" id="tbwD">⬇ '+L2x("Muat turun","Download")+'</button><button class="btn alt full" id="tbwA" style="margin-top:6px">📂 '+L2x("Tambah fail","Add the file")+'</button><input type="file" id="tbwF" accept="application/pdf,.pdf" style="display:none">'+
    '<div class="mut tiny" style="margin-top:8px">'+L2x("Dalam aplikasi Android, buku dimuat turun terus.","In the Android app, books download directly.")+'</div>');
  ov.querySelector("#tbwD").onclick=function(){ window.open(b.u[0], "_blank", "noopener"); };
  var f=ov.querySelector("#tbwF"); ov.querySelector("#tbwA").onclick=function(){ f.click(); };
  f.onchange=function(){ var file=f.files&&f.files[0]; if(!file) return; file.arrayBuffer().then(function(ab){ var u8=new Uint8Array(ab); if(String.fromCharCode.apply(null,u8.subarray(0,4))!=="%PDF"){ toast(L2x("Itu bukan fail PDF","That isn't a PDF file")); return; }
    withBooks(function(){ var col=tbFolder(p.tahap, lvName, tbSub(pid), String(p.nama||"").replace(/ \(DLP\)$/,""), p.ikon);
      BooksView.addBytes(bkH(), u8, b.n+".pdf", {tb:k, col:[col]}).then(function(){ closeOverlay(); toast("📘 "+L2x("Disimpan dalam Buku › Belajar","Saved in Books › Study")); tbRefresh(); }); }); }); }; }
function tbDelete(pid,i){ var have=tbHave(pid,i); if(!have) return; if(!confirm(L2x("Padam buku ini daripada telefon?","Delete this book from the phone?"))) return;
  if(window.Native&&N.bookDelete) N.bookDelete(have.id); save("ihsan_books", tbLib().filter(function(b){ return b.id!==have.id; })); tbRefresh(); }
function sekBooks(p, lvName){ var pid=p.asal||p.id, list=sekTbOf(p); if(!list.length) return;
  var ov=showSheet("📘 "+L2x("Buku teks · ","Textbook · ")+esc(String(p.nama||"").replace(/ \(DLP\)$/,"")), '<div class="tbSheet"></div>'), box=ov.querySelector(".tbSheet");
  box._draw=function(){ if(!document.body.contains(box)) return; var tot=0;
    box.innerHTML=list.map(function(b,i){ var have=tbHave(pid,i), dl=TB_DL[tbKey(pid,i)]; if(have) tot+=have.size||b.s;
      var pc=dl&&dl.tot?Math.min(100,Math.round(dl.got/dl.tot*100)):0;
      return '<div class="tbRow"><span class="tbIc">'+(have?'📗':'📘')+'</span><div class="tbT"><b>'+esc(b.n)+'</b><small>'+tbMB(b.s)+(have?' · '+L2x("dalam telefon","on this phone"):'')+(dl&&dl.src?' · '+L2x("pautan simpanan","backup link"):'')+'</small>'+
        (dl?'<div class="tbBar"><i style="width:'+pc+'%"></i></div><small>'+(dl.got?tbMB(dl.got)+' / '+tbMB(dl.tot)+' · '+pc+'%':L2x("Menyambung…","Connecting…"))+'</small>':'')+'</div>'+
        (dl?'<button class="btn alt tbB" data-tbx="'+i+'" aria-label="'+L2x("Batal","Cancel")+'">✕</button>':have?'<button class="btn gold tbB" data-tbo="'+i+'">📖 '+L2x("Buka","Open")+'</button><button class="btn alt tbB" data-tbd="'+i+'" aria-label="'+L2x("Padam","Delete")+'">🗑</button>':'<button class="btn gold tbB" data-tbg="'+i+'">⬇ '+L2x("Muat turun","Download")+'</button>')+'</div>'; }).join("")+
      '<div class="mut tiny" style="margin-top:8px;line-height:1.45">'+L2x("Disimpan dalam Buku › Belajar › ","Saved in Books › Study › ")+esc(lvName)+' › '+esc(String(p.nama||"").replace(/ \(DLP\)$/,""))+'. '+L2x("Saiz besar: guna Wi-Fi. Buku teks © KPM / penerbit; untuk kegunaan murid sahaja.","Large files: use Wi-Fi. Textbooks © KPM / publishers; for pupils' own use.")+'</div>';
    box.querySelectorAll("[data-tbg]").forEach(function(x){ x.onclick=function(){ var i=+x.getAttribute("data-tbg"), b=list[i];
      if(b.s>150*1048576 && !confirm(L2x("Buku ini "+tbMB(b.s)+". Muat turun sekarang? (Guna Wi-Fi jika boleh)","This book is "+tbMB(b.s)+". Download now? (Use Wi-Fi if you can)"))) return; tbStart(p, lvName, i); }; });
    box.querySelectorAll("[data-tbx]").forEach(function(x){ x.onclick=function(){ var i=+x.getAttribute("data-tbx"), d=TB_DL[tbKey(pid,i)]; if(d&&window.Native&&N.bookFetchCancel) N.bookFetchCancel(d.id); else if(d){ delete TB_DL[tbKey(pid,i)]; } box._draw(); }; });
    box.querySelectorAll("[data-tbo]").forEach(function(x){ x.onclick=function(){ var have=tbHave(pid,+x.getAttribute("data-tbo")); if(have){ closeOverlay(); homeAct("q-book:"+have.id); } }; });
    box.querySelectorAll("[data-tbd]").forEach(function(x){ x.onclick=function(){ tbDelete(pid,+x.getAttribute("data-tbd")); }; }); };
  box._draw(); }
function sekXhr(u, cb){ try{ var x=new XMLHttpRequest(); x.open("GET", u); x.onload=function(){ try{ cb(JSON.parse(x.responseText)); }catch(e){ cb(null); } }; x.onerror=function(){ cb(null); }; x.send(); }catch(e){ cb(null); } }
function sekCfg(){ var c=load("ihsan_silibus",{})||{}; return c; }
// 0.5.70 (owner): arrange the children (▲ ▼); the order is kept in the family profiles, so it is the same everywhere
// 0.5.71 (owner): a default profile called "Year" (id me) comes first; it shows the dashboard and every year as a tile
function sekKids(){ var p=kprof(), l=p.list.map(function(k){ return {id:k.id, n:k.n, e:k.e||"🧒"}; }); return [{id:"me", n:L2x("Utama","Main"), e:""}].concat(l); }   // 0.5.78 (owner): no 📅 icon on the Year profile
function sekKid(){ var l=sekKids(), c=sekCfg(), id=(S.kidLock && S.lockTo==="school" && S.lockKid) || c.anak, k=l.filter(function(x){ return x.id===id; })[0]||l[0]; return k; }   // 0.6.43: a School lock keeps its child
// 0.5.20: per-child settings (silibus.<kid>.tetapan): default level, exam dates (countdown in Learn and the engine), game timers on/off
function sekSet(id){ try{ return JSON.parse(localStorage.getItem("silibus."+id+".tetapan")||"{}")||{}; }catch(e){ return {}; } }
function sekSetSave(id, t){ try{ localStorage.setItem("silibus."+id+".tetapan", JSON.stringify(t)); }catch(e){} }
function sekDays(d){ var t=new Date(); t.setHours(0,0,0,0); var x=new Date(d+"T00:00:00"); return Math.round((x-t)/864e5); }
function sekNextExam(t){ var l=(t.ujian||[]).filter(function(u){ return u.d && sekDays(u.d)>=0; }).sort(function(a,b){ return a.d<b.d?-1:1; }); return l[0]||null; }
function sekCount(t){ var u=sekNextExam(t); if(!u) return ""; var n=sekDays(u.d);
  return '<div class="skCount">⏳ <b>'+esc(u.n||L2x("Peperiksaan","Exam"))+'</b> · '+(n===0?L2x("hari ini","today"):n+" "+L2x("hari lagi","days to go"))+' <span class="mut tiny">'+esc(u.d)+'</span></div>'; }
// 0.5.71 (owner): a compact dashboard: macro (the whole year, or every year for the Year profile) and micro (each subject):
// progress %, answered, right now, wrong, retries (not right the first time), time spent (silibus.<kid>.masa, written by exam.html), notes read
function sekMasa(id){ try{ return JSON.parse(localStorage.getItem("silibus."+id+".masa")||"{}")||{}; }catch(e){ return {}; } }
function sekSum(rk, pk, ms){ var o={d:0,j:0,b:0,p:0,n:0,t:0,s:0}; pk.forEach(function(p){ var r=rk[p.id]||{}; o.d+=r.dijawab||0; o.j+=r.jum||p.soalan||0; o.b+=r.betul||0; o.p+=r.pertama||0; o.n+=r.nota||0; o.t+=r.topik||p.topik.length||0; o.s+=(ms||{})[p.id]||0; });
  o.pc=o.j?Math.round(o.d/o.j*100):0; o.acc=o.d?Math.round(o.b/o.d*100)+"%":"–"; o.first=o.d?Math.round(o.p/o.d*100)+"%":"–"; o.wrong=Math.max(0,o.d-o.b); o.retry=Math.max(0,o.d-o.p); return o; }
function sekTime(s){ s=Math.round(s||0); if(s<60) return s?s+"s":"0"; var m=Math.round(s/60); return m<60?m+"m":Math.floor(m/60)+L2x("j ","h ")+(m%60)+"m"; }
function sekDash(kid, lv){ var rk={}; try{ rk=JSON.parse(localStorage.getItem("silibus."+kid.id+".ringkas")||"{}"); }catch(e){} var ms=sekMasa(kid.id);
  var pk=lv?sekPacks(kid, lv):(SEK_CAT.pek||[]).filter(function(p){ return !p.dlp && rk[p.id]; }), m=sekSum(rk, pk, ms), S0=sekStreak(kid.id);
  var cell=function(v, l, c){ return '<div class="skDc'+(c?' '+c:'')+'"><b>'+v+'</b><small>'+l+'</small></div>'; };
  var h='<div class="card skDash"><div class="skDh"><b>📊 '+(lv?esc(sekLvName(lv)):L2x("Semua tahun","All years"))+'</b><span>🔥 '+S0.n+' · ⭐ '+S0.tot+' XP</span><button class="chip g3d skRepTop" id="skRep2">📈 '+L2x("Laporan","Report")+'</button></div>'+
    '<div class="skBar skDbar"><i style="width:'+Math.max(1,m.pc)+'%"></i></div>'+
    '<div class="skDg">'+cell(m.pc+"%", L2x("siap","done"))+cell(m.d+"/"+m.j, L2x("dijawab","answered"))+cell(m.acc, L2x("betul","right"), "ok")+cell(m.wrong, L2x("salah","wrong"), "bad")+
      cell(m.retry, L2x("cuba lagi","retries"))+cell(m.first, L2x("cubaan 1","1st try"))+cell(sekTime(m.s), L2x("masa","time"))+cell(m.n+"/"+m.t, L2x("nota","notes"))+'</div>';
  var rows=pk.map(function(p){ var x=sekSum(rk, [p], ms); return {p:p, x:x}; }).filter(function(r){ return lv || r.x.d || r.x.n; });
  if(rows.length) h+='<details class="skMicro"'+(lv?' open':'')+'><summary>'+L2x("Setiap subjek","Each subject")+' ('+rows.length+')</summary><div class="skMt"><div class="skMr skMh"><span></span><span>%</span><span>✓</span><span>✗</span><span>↻</span><span>⏱</span><span>📖</span></div>'+
    rows.map(function(r){ var x=r.x; return '<div class="skMr" data-sko="'+esc(r.p.id)+'|kuiz"><span class="skMn">'+esc(r.p.ikon||"")+' '+esc(r.p.nama)+'</span><span><i class="skMb"><i style="width:'+Math.max(2,x.pc)+'%"></i></i>'+x.pc+'</span><span>'+x.acc+'</span><span>'+x.wrong+'</span><span>'+x.retry+'</span><span>'+sekTime(x.s)+'</span><span>'+x.n+'/'+x.t+'</span></div>'; }).join("")+'</div></details>';
  else h+='<div class="mut small" style="margin-top:6px">'+(lv?L2x("Belum ada aktiviti. Tekan Teruskan untuk mula.","No activity yet. Tap Continue to start."):L2x("Belum ada aktiviti. Ketik satu tahun untuk mula.","No activity yet. Tap a year to start."))+'</div>';
  h+='</div>';
  return h; }
// ---------- 0.6.31 (owner): carry School progress to another device without internet: QR (one-time key) + encrypted file by Quick Share / Bluetooth ----------
function b64u(buf){ var s="", b=new Uint8Array(buf); for(var i=0;i<b.length;i+=32768) s+=String.fromCharCode.apply(null, b.subarray(i,i+32768)); return btoa(s); }
function unb64u(s){ var b=atob(s), u=new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u; }
function mvKey(pw, salt){ return crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]).then(function(k){ return crypto.subtle.deriveKey({name:"PBKDF2", salt:salt, iterations:120000, hash:"SHA-256"}, k, {name:"AES-GCM", length:256}, false, ["encrypt","decrypt"]); }); }
function mvEnc(txt, pw){ var salt=crypto.getRandomValues(new Uint8Array(16)), iv=crypto.getRandomValues(new Uint8Array(12)); return mvKey(pw, salt).then(function(k){ return crypto.subtle.encrypt({name:"AES-GCM", iv:iv}, k, new TextEncoder().encode(txt)); }).then(function(ct){ return {salt:b64u(salt), iv:b64u(iv), ct:b64u(ct)}; }); }
function mvDec(e, pw){ return mvKey(pw, unb64u(e.salt)).then(function(k){ return crypto.subtle.decrypt({name:"AES-GCM", iv:unb64u(e.iv)}, k, unb64u(e.ct)); }).then(function(b){ return new TextDecoder().decode(b); }); }
function qrSvgApp(text){ var q=window.NostrKit.qrcode(0,"M"); q.addData(text); q.make(); var n=q.getModuleCount(), s2=4, d=""; for(var r=0;r<n;r++) for(var c=0;c<n;c++) if(q.isDark(r,c)) d+="M"+(c*s2+s2*2)+" "+(r*s2+s2*2)+"h"+s2+"v"+s2+"h-"+s2+"z";
  var w=n*s2+s2*4; return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+w+'" style="width:100%;height:auto;display:block"><rect width="'+w+'" height="'+w+'" fill="#fff"/><path d="'+d+'" fill="#000"/></svg>'; }
// 0.6.67 (owner): every scanner can read a QR / barcode from a photo in the gallery. kind "qr" or "bar"; cb(text) or cb(null)
function ibScanImg(kind, cb){ var h=function(r){ off("image", h); if(!r || !r.data){ cb(null, true); return; } var im=new Image(); im.onload=function(){ ibDecodeImg(im, kind).then(cb, function(){ cb(null); }); }; im.onerror=function(){ cb(null); }; im.src=r.data; };
  on("image", h); N.pickImage("gallery"); }
function ibDecodeImg(im, kind){ var W0=im.naturalWidth||im.width, H0=im.naturalHeight||im.height, tries=[1400, 900, 2000], fm=kind==="qr"?["qr_code"]:["ean_13","ean_8","upc_a","upc_e","code_128","qr_code"];
  var cvAt=function(mx, rot){ var k=Math.min(1, mx/Math.max(W0, H0)), w=Math.max(1, Math.round(W0*k)), h=Math.max(1, Math.round(H0*k)), c=document.createElement("canvas"), x=c.getContext("2d",{willReadFrequently:true}); if(rot){ c.width=h; c.height=w; x.translate(h, 0); x.rotate(Math.PI/2); } else { c.width=w; c.height=h; } x.drawImage(im, 0, 0, w, h); return c; };
  var viaZx=function(){ return new Promise(function(ok){ var go=function(){ var Z=window.ZXing; if(!Z){ ok(null); return; } var rd=new Z.MultiFormatReader(), hm=new Map(); hm.set(Z.DecodeHintType.POSSIBLE_FORMATS, kind==="qr"?[Z.BarcodeFormat.QR_CODE]:[Z.BarcodeFormat.EAN_13,Z.BarcodeFormat.EAN_8,Z.BarcodeFormat.UPC_A,Z.BarcodeFormat.UPC_E,Z.BarcodeFormat.CODE_128,Z.BarcodeFormat.QR_CODE]); hm.set(Z.DecodeHintType.TRY_HARDER, true); rd.setHints(hm);
      for(var i=0;i<tries.length;i++) for(var rot=0;rot<2;rot++){ var c=cvAt(tries[i], rot); [Z.HybridBinarizer, Z.GlobalHistogramBinarizer].forEach(function(B){ if(ok._d) return; try{ var r=rd.decode(new Z.BinaryBitmap(new B(new Z.HTMLCanvasElementLuminanceSource(c)))); ok._d=1; ok(r.getText()); }catch(e){} }); if(ok._d) return; }
      ok(null); }; if(window.ZXing) go(); else loadJs(["halal/zxing.min.js"], go, function(){ ok(null); }); }); };
  if("BarcodeDetector" in window){ var det; try{ det=new window.BarcodeDetector({formats:fm}); }catch(e){ det=null; }
    if(det) return det.detect(cvAt(1600)).then(function(r){ return r && r[0] ? String(r[0].rawValue) : viaZx(); }, viaZx); }
  return viaZx(); }
window.IbScanImg=ibScanImg;
// 0.6.67 (owner): one full-screen picture viewer for every photo / receipt: pinch or double-tap to zoom, drag to move, ✕ top right;
// "📁 Open in Drive" when the picture was saved to Google Drive (opt.drive = a Drive URL or file id)
function ibView(src, opt){ if(!src) return; opt=opt||{}; var o=document.createElement("div"); o.className="ibView"; o.innerHTML='<img alt="" draggable="false"><button class="ibVx" aria-label="'+L2x("Tutup","Close")+'">✕</button>'+(opt.drive?'<a class="ibVd" href="#">📁 '+L2x("Buka dalam Drive","Open in Drive")+'</a>':'')+'<div class="ibVh">'+L2x("Cubit untuk zum · ketik dua kali","Pinch to zoom · double tap")+'</div>';
  var im=o.querySelector("img"), s=1, tx=0, ty=0, pts={}, g=null, lt=0, set=function(){ im.style.transform="translate("+tx+"px,"+ty+"px) scale("+s+")"; };
  im.src=src; document.body.appendChild(o); var close=function(){ o.remove(); window.removeEventListener("keydown", kd); IBVIEW=null; }, kd=function(e){ if(e.key==="Escape") close(); }; window.addEventListener("keydown", kd); IBVIEW=close;
  o.querySelector(".ibVx").onclick=close;
  var dl=o.querySelector(".ibVd"); if(dl) dl.onclick=function(e){ e.preventDefault(); var u=/^https?:/.test(opt.drive)?opt.drive:"https://drive.google.com/file/d/"+opt.drive+"/view"; if(window.Native && N.openUrl) N.openUrl(u); else window.open(u, "_blank"); };
  var snap=function(){ var ids=Object.keys(pts); return {n:ids.length, c:ids.map(function(i){ return pts[i].slice(); }), s:s, tx:tx, ty:ty}; };
  o.addEventListener("pointerdown", function(e){ if(e.target.closest(".ibVx,.ibVd")) return; pts[e.pointerId]=[e.clientX, e.clientY]; try{ o.setPointerCapture(e.pointerId); }catch(er){} g=snap();
    if(g.n===1){ var t=Date.now(); if(t-lt<300){ if(s>1.05){ s=1; tx=ty=0; } else { s=2.5; var r=o.getBoundingClientRect(); tx=-(e.clientX-r.width/2)*1.5; ty=-(e.clientY-r.height/2)*1.5; } im.style.transition="transform .2s"; set(); setTimeout(function(){ im.style.transition=""; }, 220); } lt=t; } });
  o.addEventListener("pointermove", function(e){ if(!pts[e.pointerId]) return; pts[e.pointerId]=[e.clientX, e.clientY]; var ids=Object.keys(pts);
    if(ids.length>=2 && g.n>=2){ var a=pts[ids[0]], b=pts[ids[1]], d1=Math.hypot(b[0]-a[0], b[1]-a[1]), d0=Math.hypot(g.c[1][0]-g.c[0][0], g.c[1][1]-g.c[0][1])||1; s=Math.max(1, Math.min(8, g.s*d1/d0)); tx=g.tx+((a[0]+b[0])-(g.c[0][0]+g.c[1][0]))/2; ty=g.ty+((a[1]+b[1])-(g.c[0][1]+g.c[1][1]))/2; set(); }
    else if(ids.length===1 && g.n===1 && s>1){ tx=g.tx+e.clientX-g.c[0][0]; ty=g.ty+e.clientY-g.c[0][1]; set(); } });
  var up=function(e){ delete pts[e.pointerId]; g=snap(); if(s<=1.01){ s=1; tx=ty=0; set(); } }; o.addEventListener("pointerup", up); o.addEventListener("pointercancel", up);
  o.addEventListener("wheel", function(e){ e.preventDefault(); s=Math.max(1, Math.min(8, s*(e.deltaY<0?1.15:0.87))); if(s===1){ tx=ty=0; } set(); }, {passive:false});
  return o; }
var IBVIEW=null; window.IbView=ibView;
// thumbnails of photos and receipts open in the viewer (data-zoom on any picture, plus the known photo slots)
document.addEventListener("click", function(e){ var im=e.target && e.target.closest && e.target.closest("img[data-zoom], .ngImgP img, #exPh img, .ngSigP img, .psRimg img, .fphs img, .psQrSet img"); if(!im || im.closest(".ibView")) return; e.preventDefault(); e.stopPropagation(); ibView(im.currentSrc || im.src, {drive:im.getAttribute("data-drive")||""}); }, true);
function qrScanApp(valid, done, title){ var go2=function(){ if(window.Native && N.hasPerm && !N.hasPerm("camera")){ var ph=function(r){ if(r.which!=="camera") return; off("perm",ph); if(r.granted) go2(); }; on("perm",ph); N.requestPerm("camera"); return; }
    var ov=document.getElementById("overlay"), stream=null, t=null, closed=false; ov.className="bcov"; ov.innerHTML='<video id="mvV" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover"></video><div class="bcTop"><button class="qcX" id="mvX">✕</button><b>'+esc(title)+'</b><button class="qcX" id="mvG" title="'+L2x("Dari galeri","From gallery")+'">🖼</button></div>';
    var stop=function(){ closed=true; clearTimeout(t); if(stream) stream.getTracks().forEach(function(x){ x.stop(); }); closeOverlay(); }; ov.querySelector("#mvX").onclick=stop; ov._close=stop;
    var v=ov.querySelector("#mvV"), cv=document.createElement("canvas"), cx=cv.getContext("2d",{willReadFrequently:true}), det=("BarcodeDetector" in window)?new window.BarcodeDetector({formats:["qr_code"]}):null, zx=null;
    var hit=function(x){ if(closed || !valid(x)) return false; stop(); done(x); return true; };
    ov.querySelector("#mvG").onclick=function(){ ibScanImg("qr", function(x, cancel){ if(cancel) return; if(!x){ toast("🖼 "+L2x("Tiada kod QR dijumpai dalam gambar","No QR code found in that picture")); return; } if(!hit(x)) toast(L2x("Kod QR ini bukan untuk di sini","This QR code is not for here")); }); };
    var tk=function(){ if(closed) return; if(v.videoWidth){ if(det){ det.detect(v).then(function(r){ if(!(r && r[0] && hit(r[0].rawValue))) t=setTimeout(tk,250); }).catch(function(){ t=setTimeout(tk,400); }); return; }
        if(zx){ cv.width=v.videoWidth; cv.height=v.videoHeight; cx.drawImage(v,0,0); try{ var Z=window.ZXing, r2=zx.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(cv)))); if(hit(r2.getText())) return; }catch(e){} } }
      t=setTimeout(tk,300); };
    var cam=function(){ navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}).then(function(st){ stream=st; v.srcObject=st; tk(); }).catch(function(){ stop(); toast(L2x("Kamera tidak tersedia","Camera not available")); }); };
    if(det) cam(); else loadJs(["halal/zxing.min.js"], function(){ var Z=window.ZXing; zx=new Z.MultiFormatReader(); var hm=new Map(); hm.set(Z.DecodeHintType.POSSIBLE_FORMATS,[Z.BarcodeFormat.QR_CODE]); zx.setHints(hm); cam(); }, cam); };
  go2(); }
function studyKeys(){ var ks=[]; for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(/^silibus\./.test(k) || k==="ihsan_silibus" || k==="ihsan_kids" || k==="ihsan_kprof") ks.push(k); } return ks; }
function studySend(){ if(!(window.crypto && crypto.subtle)){ toast(L2x("Telefon ini tidak boleh menyulitkan","This phone cannot encrypt")); return; }
  var key=Math.random().toString(36).slice(2,12)+Math.random().toString(36).slice(2,12), data={}; studyKeys().forEach(function(k){ data[k]=localStorage.getItem(k); }); var file=null;
  var ov=showSheet("📤 "+L2x("Hantar kemajuan sekolah","Send school progress"), '<div class="small">1. '+L2x("Di peranti baharu: Sekolah › ⚙ Tetapan anak › 📥 Terima › Imbas.","On the new device: School › ⚙ child settings › 📥 Receive › Scan.")+'</div><div id="mvQ" style="background:#fff;border-radius:12px;padding:8px;width:min(260px,70vw);margin:10px auto">⏳</div><div class="center mut small">'+L2x("Kod: ","Code: ")+'<b>'+key+'</b></div>'+
    '<div class="small" style="margin-top:8px">2. '+L2x("Hantar fail melalui Quick Share / Bluetooth.","Send the file by Quick Share / Bluetooth.")+'</div><button class="btn gold full g3d" id="mvS" style="margin-top:8px">📤 '+L2x("Hantar fail","Send the file")+'</button><div class="mut tiny" style="margin-top:6px">🔒 '+L2x("Fail disulitkan; tanpa QR ia tidak boleh dibuka.","The file is encrypted; without the QR it cannot be opened.")+' · '+Object.keys(data).length+L2x(" rekod"," records")+'</div>');
  var show=function(){ var q=ov.querySelector("#mvQ"); if(q) try{ q.innerHTML=qrSvgApp("ihsanstudy:"+key); }catch(e){ q.textContent=key; } };
  if(window.NostrKit) show(); else loadJs(["groups/nostrkit.js"], show, show);
  mvEnc(JSON.stringify(data), key).then(function(enc){ file=JSON.stringify({app:"My Ihsan", kind:"study", v:1, at:new Date().toISOString(), enc:enc}); });
  ov.querySelector("#mvS").onclick=function(){ if(!file){ toast("⏳"); return; } var name="MyIhsan-sekolah-"+ymd(new Date())+".ihsanstudy"; if(window.Native && N.shareFile) N.shareFile(name, file, "application/octet-stream", ""); else { var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([file])); a.download=name; document.body.appendChild(a); a.click(); a.remove(); } }; }
function studyRecv(key0){ var key=key0||"";
  var ov=showSheet("📥 "+L2x("Terima kemajuan sekolah","Receive school progress"), '<div class="small">1. '+L2x("Imbas QR di peranti lama (Sekolah › ⚙ › 📤 Hantar).","Scan the QR on the old device (School › ⚙ › 📤 Send).")+'</div><div class="btns"><button class="btn gold g3d" id="mvSc">📷 '+L2x("Imbas","Scan")+'</button></div><input id="mvK" type="text" value="'+esc(key)+'" placeholder="'+L2x("atau taip kod","or type the code")+'" style="width:100%;margin:6px 0">'+
    '<div class="small">2. '+L2x("Buka fail yang diterima (biasanya dalam Download).","Open the file you received (usually in Download).")+'</div><button class="btn alt full g3d" id="mvO" style="margin-top:6px">📂 '+L2x("Buka fail","Open the file")+'</button>');
  ov.querySelector("#mvSc").onclick=function(){ qrScanApp(function(x){ return /^ihsanstudy:\w{8,}$/.test(x); }, function(x){ studyRecv(x.slice(11)); }, L2x("Imbas QR peranti lama","Scan the old device's QR")); };
  ov.querySelector("#mvO").onclick=function(){ var k=ov.querySelector("#mvK").value.trim(); if(!k){ toast(L2x("Imbas QR dahulu","Scan the QR first")); return; }
    var got=function(body){ var j=null; try{ j=JSON.parse(body); }catch(e){} if(!j || j.kind!=="study" || !j.enc){ toast(L2x("Ini bukan fail kemajuan sekolah","This is not a school progress file")); return; }
      mvDec(j.enc, k).then(function(t){ var d=JSON.parse(t), n=Object.keys(d).length; if(!confirm(L2x("Ganti kemajuan sekolah di peranti ini dengan "+n+" rekod dari peranti lama?","Replace the school progress on this device with "+n+" records from the old device?"))) return;
        Object.keys(d).forEach(function(kk){ try{ localStorage.setItem(kk, d[kk]); }catch(e){} }); toast("✅ "+L2x("Kemajuan dipindahkan","Progress moved")); closeOverlay(); render(); }, function(){ toast("🔒 "+L2x("Kod tidak sepadan dengan fail","The code does not match the file")); }); };
    if(window.Native && N.openFile){ window.IbOpenOnce=got; N.openFile(); return; }
    var inp=document.createElement("input"); inp.type="file"; inp.onchange=function(){ var f=inp.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ got(r.result); }; r.readAsText(f); }; inp.click(); }; }
function sekSettings(kid, el){ var t=sekSet(kid.id), ex=(t.ujian||[]).slice(), emo=kid.e, isMe=kid.id==="me";
  var row=function(u,i){ return '<div class="skExR" data-i="'+i+'"><input class="rin skExN" maxlength="30" placeholder="UASA / PBD" value="'+esc(u.n||"")+'"><input class="rin skExD" type="date" value="'+esc(u.d||"")+'"><button class="btn alt skExX" aria-label="'+L2x("Buang","Remove")+'">✕</button></div>'; };
  var ov=showSheet("⚙️ "+L2x("Tetapan anak","Child settings")+" · "+esc(kid.n),
    (isMe?'<input id="skSN" type="hidden" value="">':'<div class="set"><span>'+L2x("Nama","Name")+'</span><input id="skSN" class="rin" maxlength="24" value="'+esc(kid.n)+'"></div>')+
    (isMe?'':'<div class="kpEmo">'+KID_EMO.map(function(e){ return '<button class="chip'+(e===emo?' on':'')+'" data-ke="'+e+'">'+e+'</button>'; }).join("")+'</div>')+
    '<h4>'+L2x("Maskot","Mascot")+'</h4><div class="chips">'+[["🧕🏻",L2x("Kakak","Sister")],["👳🏻",L2x("Abang","Brother")]].map(function(x){ return '<button class="chip'+((t.maskot||"🧕🏻")===x[0]?' on':'')+'" data-skm="'+x[0]+'"><span class="noico">'+x[0]+'</span>'+' '+x[1]+'</button>'; }).join("")+'</div>'+
    '<h4>'+L2x("Tahap lalai","Default level")+'</h4><select id="skSL" class="rin">'+SEK_LV.map(function(x){ return '<option value="'+x[0]+'"'+(t.tahap===x[0]?' selected':'')+'>'+sekIcT(x)+esc(L2x(x[2],x[3]))+'</option>'; }).join("")+'</select>'+
    '<h4>'+L2x("Tarikh peperiksaan","Exam dates")+'</h4><div class="mut tiny">'+L2x("Kiraan detik ditunjuk di Sekolah dan di skrin subjek. Kosongkan untuk sembunyi.","A countdown shows in School and on the subject screen. Leave empty to hide it.")+'</div><div id="skExL">'+ex.map(row).join("")+'</div>'+
    '<button class="btn alt" id="skExA">＋ '+L2x("Tambah tarikh","Add a date")+'</button>'+
    '<div class="snl" style="margin-top:8px">💡 '+L2x("Tunjuk jawapan betul selepas","Show the right answer after")+'</div><div class="chips" id="skJw">'+[[1,L2x("1 cubaan salah","1 wrong try")],[2,"2"],[3,"3"],[0,L2x("Jangan tunjuk","Never")]].map(function(o){ var cur=t.jawapanN==null?3:t.jawapanN; return '<button class="chip'+(cur===o[0]?" on":"")+'" data-jwn="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>'+
    '<div class="snl" style="margin-top:8px">📲 '+L2x("Sambung belajar di peranti lain","Carry on studying on another device")+'</div><div class="btns"><button class="btn alt g3d" id="skMvS">📤 '+L2x("Hantar","Send")+'</button><button class="btn alt g3d" id="skMvR">📥 '+L2x("Terima","Receive")+'</button></div><div class="mut tiny">'+L2x("Tanpa internet: QR + Quick Share / Bluetooth. Atau log masuk Google (⟳ di bar atas) untuk sync automatik.","No internet: QR + Quick Share / Bluetooth. Or sign in with Google (⟳ in the top bar) to sync automatically.")+'</div>'+
    '<label class="obChk"><input type="checkbox" id="skST"'+(t.pemasa===false?'':' checked')+'> '+L2x("Pemasa dalam permainan (Bilik Lolos, Kuiz Pentas)","Timers in games (escape room, quiz show)")+'</label>'+
    (Object.keys(sekTwins()).length?'<label class="obChk"><input type="checkbox" id="skSDlp"'+(sekDlpOn(kid)?' checked':'')+'> 🇬🇧 '+L2x("DLP: Matematik dan Sains dalam Bahasa Inggeris","DLP: Maths and Science in English")+'</label>':'')+
    '<button class="btn gold full g3d" id="skSS">'+L2x("Simpan","Save")+'</button>');
  Array.prototype.forEach.call(ov.querySelectorAll("[data-ke]"), function(b){ b.onclick=function(){ emo=b.getAttribute("data-ke"); Array.prototype.forEach.call(ov.querySelectorAll("[data-ke]"),function(x){ x.classList.toggle("on",x===b); }); }; });
  var mas=t.maskot||"🧕🏻"; Array.prototype.forEach.call(ov.querySelectorAll("[data-skm]"), function(b){ b.onclick=function(){ mas=b.getAttribute("data-skm"); Array.prototype.forEach.call(ov.querySelectorAll("[data-skm]"),function(x){ x.classList.toggle("on",x===b); }); }; });
  var L=ov.querySelector("#skExL"), read=function(){ return Array.prototype.map.call(L.querySelectorAll(".skExR"), function(r){ return {n:r.querySelector(".skExN").value.trim(), d:r.querySelector(".skExD").value}; }); },
    wire=function(){ Array.prototype.forEach.call(L.querySelectorAll(".skExX"), function(b){ b.onclick=function(){ ex=read(); ex.splice(+b.parentNode.getAttribute("data-i"),1); L.innerHTML=ex.map(row).join(""); wire(); }; }); };
  ov.querySelector("#skMvS").onclick=function(){ studySend(); }; ov.querySelector("#skMvR").onclick=function(){ studyRecv(); };
  Array.prototype.forEach.call(ov.querySelectorAll("[data-jwn]"), function(b){ b.onclick=function(){ Array.prototype.forEach.call(ov.querySelectorAll("[data-jwn]"), function(x){ x.classList.toggle("on", x===b); }); }; });
  wire(); ov.querySelector("#skExA").onclick=function(){ ex=read(); ex.push({n:ex.length?"PBD":"UASA", d:""}); L.innerHTML=ex.map(row).join(""); wire(); };
  ov.querySelector("#skSS").onclick=function(){ var n=ov.querySelector("#skSN").value.trim()||kid.n;
    var dlb=ov.querySelector("#skSDlp"); if(dlb && dlb.checked!==sekDlpOn(kid)) sekDlpSet(kid, Object.keys(sekTwins()), dlb.checked);
    t.tahap=ov.querySelector("#skSL").value; t.ujian=read().filter(function(u){ return u.d; }); t.pemasa=ov.querySelector("#skST").checked; t.maskot=mas; var jw=ov.querySelector("#skJw .chip.on"); if(jw) t.jawapanN=+jw.getAttribute("data-jwn"); sekSetSave(kid.id, t);
    if(isMe){ } else { var p=kprof(); p.list.forEach(function(k){ if(k.id===kid.id){ k.n=n; k.e=emo; } }); save("ihsan_kprof",p); }
    var c2=sekCfg(); c2.tahap=t.tahap; save("ihsan_silibus",c2); closeOverlay(); toast(L2x("Disimpan","Saved")); vSekolah(el); }; }
// 0.5.22: each subject card has its own playful backdrop (symbols of that subject drifting in the subject colour)
var SEK_DECO={mat:["+","−","×","÷","1","2","3","=","%","7"], bm:["A","b","C","d","E","f","Aa","Ii","Uu","!"], bi:["A","B","C","a","b","c","?","Hi","!","Zz"],
  sains:["🔬","🌱","💧","☀️","🧲","🌍","⚡","🐞","🧪","🌙"], pi:["☪","✦","🕌","📿","⭐","🤲","✧","🌙","✦","☪"], jawi:["ج","ا","و","ي","ڤ","چ","ڠ","ڽ","ݢ","ۏ"],
  arab:["أ","ب","ت","ث","ج","ح","خ","د","ر","س"], iqra:["ا","ب","ت","ـَ","ـِ","ـُ","ن","م","ل","ك"], lisan:["💬","🎙️","🗣️","👂","🔊","💬","✨","🎵","👄","⭐"]};
function sekDeco(id){ var k=String(id).split("-").slice(1).join("-")||id, L=SEK_DECO[k]||SEK_DECO.bm, R=benihR(id), h="";
  for(var i=0;i<10;i++){ h+='<span style="left:'+Math.round(4+R()*88)+'%;top:'+Math.round(6+R()*80)+'%;font-size:'+Math.round(16+R()*20)+'px;animation-delay:-'+(R()*12).toFixed(1)+'s;animation-duration:'+(9+R()*8).toFixed(1)+'s;--rot:'+Math.round(R()*40-20)+'deg">'+esc(L[i%L.length])+'</span>'; }
  return '<div class="skDeco" aria-hidden="true">'+h+'</div>'; }
function benihR(s){ var x=0; for(var i=0;i<s.length;i++) x=(x*31+s.charCodeAt(i))|0; x=Math.abs(x)||1; return function(){ x=(x*1103515245+12345)&0x7fffffff; return x/0x7fffffff; }; }
// 0.5.23: daily activity (written by the engine add-on silibus/pintar.js): XP, streak with freeze (Duolingo style),
// a mascot with today's learning path (Khan Academy Kids style) and the parent weekly report to WhatsApp (Pandai style)
function sekHari(id){ try{ return JSON.parse(localStorage.getItem("silibus."+id+".hari")||"{}")||{}; }catch(e){ return {}; } }
function sekXP(d){ d=d||{}; return (d.b||0)*10+Math.max(0,(d.j||0)-(d.b||0))*3+(d.n||0)*5+Math.round((d.x||0)/2); }
function sekStreak(id){ var H0=sekHari(id), st={}; try{ st=JSON.parse(localStorage.getItem("silibus."+id+".siri")||"{}")||{}; }catch(e){} st.fz=st.fz==null?1:st.fz; st.used=st.used||[]; st.got=st.got||0;
  var day=new Date(), n=0, k=ymd(day), changed=false; if(!sekXP(H0[k])) day=addDays(day,-1);   // today not done yet: count up to yesterday
  for(var i=0;i<400;i++){ k=ymd(day); if(sekXP(H0[k])) n++; else if(st.used.indexOf(k)>=0) {} else if(st.fz>0 && n>0){ st.fz--; st.used.push(k); changed=true; } else break; day=addDays(day,-1); }
  var earned=Math.floor(n/7); if(earned>st.got){ st.fz=Math.min(2, st.fz+(earned-st.got)); st.got=earned; changed=true; }
  if(changed){ st.used=st.used.slice(-20); try{ localStorage.setItem("silibus."+id+".siri", JSON.stringify(st)); }catch(e){} }
  var tot=0; Object.keys(H0).forEach(function(k2){ tot+=sekXP(H0[k2]); });
  return {n:n, fz:st.fz, today:sekXP(H0[ymd(new Date())]), tot:tot, d:H0[ymd(new Date())]||{}}; }
// 0.5.57 DLP (Dual Language Programme): per child, Maths and Science open their English twin packs (catalog entries with dlp:true, asal:<pack id>)
// 0.5.58: each Maths/Science card has its own BM/EN button (ihsan_silibus.dlpp[kidId][malayId]); the top 🇬🇧 DLP chip switches them all
function sekTwins(){ var t={}; (SEK_CAT&&SEK_CAT.pek||[]).forEach(function(p){ if(p.dlp) t[p.asal]=p; }); return t; }
function sekDlpFor(kid, id){ var c=sekCfg(), m=c.dlpp&&c.dlpp[kid.id]; if(m && m[id]!=null) return !!m[id]; return !!(c.dlp && c.dlp[kid.id]); }
function sekDlpOn(kid){ var t=sekTwins(), ids=Object.keys(t); return ids.length>0 && ids.every(function(id){ return sekDlpFor(kid, id); }); }
function sekDlpSet(kid, ids, on){ var c=sekCfg(); c.dlpp=c.dlpp||{}; var m=c.dlpp[kid.id]=c.dlpp[kid.id]||{}; ids.forEach(function(id){ m[id]=!!on; }); if(c.dlp) delete c.dlp[kid.id]; save("ihsan_silibus",c); }
function sekPacks(kid, lv){ var all=SEK_CAT&&SEK_CAT.pek||[], twin=sekTwins();
  return all.filter(function(p){ return p.tahap===lv && !p.dlp && !p.upkk; }).map(function(p){ return twin[p.id] && sekDlpFor(kid, p.id) ? twin[p.id] : p; }); }
function sekHasDlp(lv){ return (SEK_CAT&&SEK_CAT.pek||[]).some(function(p){ return p.dlp && p.tahap===lv; }); }
function sekPath(kid, lv){ var t=sekSet(kid.id), M=t.maskot||"🧕🏻", S0=sekStreak(kid.id), d=S0.d, pk=sekPacks(kid, lv), p0=pk[(new Date().getDate())%Math.max(1,pk.length)];
  var steps=[["📖",L2x("Baca 1 nota","Read 1 note"),(d.n||0)>=1,p0?p0.id+"|nota":""],["✏️",L2x("Jawab 5 soalan","Answer 5 questions"),(d.j||0)>=5,p0?p0.id+"|kuiz":""],["⭐",L2x("3 betul cubaan pertama","3 right first time"),(d.b||0)>=3,p0?p0.id+"|kuiz":""],["🎮",L2x("Main 1 permainan","Play 1 game"),(d.x||0)>0,p0?p0.id+"|main":""]];
  var done=steps.filter(function(x){ return x[2]; }).length, say=done===4?L2x("MasyaAllah! Jalan hari ini selesai. Jumpa esok!","MasyaAllah! Today's path is done. See you tomorrow!"):done?L2x("Bagus! Teruskan, tinggal ","Great! Keep going, ")+(4-done)+L2x(" lagi."," to go."):L2x("Assalamualaikum "+kid.n+"! Jom mula jalan hari ini.","Assalamualaikum "+kid.n+"! Let's start today's path.");
  return '<div class="card skPath"><div class="skMas"><span class="skMasF noico" aria-hidden="true">'+M+'</span><div class="skSay">'+esc(say)+'</div></div>'+
    '<div class="skStats"><span title="'+L2x("Hari berturut","Day streak")+'">🔥 <b>'+S0.n+'</b> '+L2x("hari","days")+'</span><span>⭐ <b>'+S0.today+'</b> XP '+L2x("hari ini","today")+'</span><span>🏆 <b>'+S0.tot+'</b> XP</span><span title="'+L2x("Pembeku rentetan: melindungi satu hari yang terlepas","Streak freeze: covers one missed day")+'">❄️ <b>'+S0.fz+'</b></span></div>'+
    '<div class="skSteps">'+steps.map(function(x, i){ return '<button class="skStep'+(x[2]?' ok':'')+'"'+(x[3]?' data-sko="'+x[3]+'"':'')+'><i>'+(x[2]?'✓':x[0])+'</i><span>'+esc(x[1])+'</span></button>'+(i<3?'<em class="skLine'+(x[2]?' ok':'')+'"></em>':''); }).join("")+'</div>'+
    '</div>'; }
// 0.6.31 (owner): the complete parent report for one child: this week, 7-day and 8-week charts, strengths, areas to work on, time per subject,
// focus (active days, minutes a day, first-try accuracy); more detail folded away; share as text or a picture. Data: silibus.<kid>.hari / .ringkas / .masa
function sekRepData(kid){ var H0=sekHari(kid.id), rk={}; try{ rk=JSON.parse(localStorage.getItem("silibus."+kid.id+".ringkas")||"{}"); }catch(e){} var ms=sekMasa(kid.id), names={}, d=new Date();
  (SEK_CAT&&SEK_CAT.pek||[]).forEach(function(p){ names[p.id]=(p.ikon?p.ikon+" ":"")+p.nama; });
  var days=[]; for(var i=6;i>=0;i--){ var k=ymd(addDays(d,-i)), x=H0[k]||{}; days.push({k:k, m:Math.round((x.s||0)/60), j:x.j||0, b:x.b||0, n:x.n||0, xp:sekXP(x)}); }
  var weeks=[]; for(var w=7;w>=0;w--){ var o={m:0,j:0,b:0,days:0}; for(var j2=0;j2<7;j2++){ var x2=H0[ymd(addDays(d,-(w*7+j2)))]; if(!x2) continue; o.m+=Math.round((x2.s||0)/60); o.j+=x2.j||0; o.b+=x2.b||0; if(sekXP(x2)) o.days++; } o.acc=o.j?Math.round(o.b*100/o.j):null; weeks.push(o); }
  var wk=weeks[7], subj=Object.keys(rk).filter(function(k2){ return rk[k2].dijawab; }).map(function(k2){ var r=rk[k2]; return {id:k2, n:names[k2]||k2, d:r.dijawab, j:r.jum, acc:Math.round((r.betul||0)*100/r.dijawab), first:Math.round((r.pertama||0)*100/r.dijawab), t:ms[k2]||0, notes:r.nota||0}; });
  var rated=subj.filter(function(x){ return x.d>=8; }), strong=rated.slice().sort(function(a,b){ return b.first-a.first; }).slice(0,3), weak=rated.slice().sort(function(a,b){ return a.first-b.first; }).filter(function(x){ return x.first<80; }).slice(0,3);
  var active=days.filter(function(x){ return x.xp; }).length, mins=days.reduce(function(a,x){ return a+x.m; },0);
  return {kid:kid, days:days, weeks:weeks, wk:wk, subj:subj, strong:strong, weak:weak, active:active, mins:mins, avg:active?Math.round(mins/active):0, S0:sekStreak(kid.id),
    acc7:(function(){ var j=0,b=0; days.forEach(function(x){ j+=x.j; b+=x.b; }); return j?Math.round(b*100/j):null; })(), q7:days.reduce(function(a,x){ return a+x.j; },0), n7:days.reduce(function(a,x){ return a+x.n; },0)}; }
function sekBars(vals, labels, col, h){ var mx=Math.max.apply(null, vals.concat([1])), w=300, bw=w/vals.length; h=h||110;
  var none=!vals.some(function(v){ return v>0; });
  return '<svg viewBox="0 0 '+w+' '+(h+18)+'" style="width:100%;height:auto"><line x1="0" x2="'+w+'" y1="'+h+'" y2="'+h+'" stroke="currentColor" stroke-opacity=".25"/>'+(none?'<text x="'+w/2+'" y="'+(h/2)+'" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity=".6">'+L2x("Belum ada aktiviti minggu ini","No activity this week yet")+'</text>':'')+vals.map(function(v,i){ var bh=Math.round(v/mx*(h-14)); return '<rect x="'+(i*bw+bw*.18).toFixed(1)+'" y="'+(h-bh)+'" width="'+(bw*.64).toFixed(1)+'" height="'+Math.max(bh,v?2:0)+'" rx="3" fill="'+col+'"/>'+(v?'<text x="'+(i*bw+bw/2).toFixed(1)+'" y="'+(h-bh-3)+'" font-size="9" text-anchor="middle" fill="currentColor">'+v+'</text>':'')+'<text x="'+(i*bw+bw/2).toFixed(1)+'" y="'+(h+13)+'" font-size="9" text-anchor="middle" fill="currentColor" opacity=".7">'+labels[i]+'</text>'; }).join("")+'</svg>'; }
function sekReportSheet(kid){ var R0=sekRepData(kid), DN=en_()?["Su","Mo","Tu","We","Th","Fr","Sa"]:["Ah","Is","Se","Ra","Kh","Ju","Sa"];
  var tile=function(v,l,c){ return '<div class="skDc'+(c?' '+c:'')+'"><b>'+v+'</b><small>'+l+'</small></div>'; };
  var focus=R0.active>=5&&R0.avg>=10?L2x("Sangat konsisten","Very consistent"):R0.active>=3?L2x("Sederhana: cuba setiap hari walau 10 minit","Moderate: aim for every day, even 10 minutes"):L2x("Perlu galakan: tetapkan masa belajar tetap","Needs a nudge: set a regular study time");
  var h='<div class="card"><div class="skDg">'+tile(R0.mins+"m",L2x("7 hari","7 days"))+tile(R0.active+"/7",L2x("hari aktif","active days"))+tile(R0.q7,L2x("soalan","questions"))+tile(R0.acc7==null?"–":R0.acc7+"%",L2x("betul kali 1","right 1st try"),"ok")+tile(R0.n7,L2x("nota","notes"))+tile(R0.S0.n,L2x("hari berturut","streak"))+tile(R0.S0.tot,"XP")+tile(R0.avg+"m",L2x("purata/hari","avg/day"))+'</div></div>'+
    '<div class="card"><h3>📅 '+L2x("Minit setiap hari","Minutes each day")+'</h3>'+sekBars(R0.days.map(function(x){ return x.m; }), R0.days.map(function(x){ return DN[new Date(x.k+"T00:00:00").getDay()]; }), "#1f9d63")+
      '<h3 style="margin-top:8px">✏️ '+L2x("Soalan setiap hari","Questions each day")+'</h3>'+sekBars(R0.days.map(function(x){ return x.j; }), R0.days.map(function(x){ return DN[new Date(x.k+"T00:00:00").getDay()]; }), "#c9a646", 90)+'</div>'+
    '<div class="card"><h3>💪 '+L2x("Kekuatan","Strengths")+'</h3>'+(R0.strong.length?R0.strong.map(function(x){ return '<div class="ngKV row"><span>'+esc(x.n)+'</span><b class="fpos">'+x.first+'%</b></div>'; }).join(""):'<div class="mut small">'+L2x("Perlu sekurang-kurangnya 8 soalan dalam satu subjek.","Needs at least 8 questions in a subject.")+'</div>')+
      '<h3 style="margin-top:10px">🎯 '+L2x("Perlu diperkukuh","To work on")+'</h3>'+(R0.weak.length?R0.weak.map(function(x){ return '<div class="row"><span>'+esc(x.n)+'</span><b class="fneg">'+x.first+'%</b></div>'; }).join(""):'<div class="mut small">'+L2x("Tiada subjek lemah ketara. Syabas!","No clearly weak subject. Well done!")+'</div>')+
      '<div class="mut small" style="margin-top:8px">🧠 '+L2x("Fokus: ","Focus: ")+esc(focus)+'</div></div>'+
    '<details class="card"><summary><b>📈 '+L2x("8 minggu","8 weeks")+'</b> <span class="mut tiny">'+L2x("(ketik untuk lihat)","(tap to show)")+'</span></summary>'+sekBars(R0.weeks.map(function(x){ return x.m; }), R0.weeks.map(function(x,i){ return i===7?L2x("ini","now"):"-"+(7-i); }), "#1f9d63")+'<div class="mut tiny">'+L2x("Minit seminggu. Ketepatan kali pertama: ","Minutes a week. First-try accuracy: ")+R0.weeks.map(function(x){ return x.acc==null?"–":x.acc+"%"; }).join(" · ")+'</div></details>'+
    '<details class="card"><summary><b>📚 '+L2x("Setiap subjek: masa, jawapan, ketepatan","Each subject: time, answers, accuracy")+'</b></summary>'+(R0.subj.length?R0.subj.sort(function(a,b){ return b.t-a.t; }).map(function(x){ return '<div class="row"><span>'+esc(x.n)+'<br><small class="mut">'+x.d+'/'+x.j+' · '+L2x("betul ","right ")+x.acc+'% · '+L2x("kali 1 ","1st ")+x.first+'% · 📖 '+x.notes+'</small></span><b>'+sekTime(x.t)+'</b></div>'; }).join(""):'<div class="mut small">–</div>')+'</details>'+
    '<div class="btns"><button class="btn gold g3d" id="srTxt">📤 '+L2x("Kongsi teks","Share text")+'</button><button class="btn alt g3d" id="srImg">🖼 '+L2x("Kongsi gambar","Share picture")+'</button></div>';
  var ov=showSheet("📈 "+L2x("Laporan ibu bapa: ","Parent report: ")+esc(kid.n), h);
  ov.querySelector("#srTxt").onclick=function(){ sekReport(kid); };
  ov.querySelector("#srImg").onclick=function(){ var cv=document.createElement("canvas"), W=1080, Hh=1350; cv.width=W; cv.height=Hh; var c=cv.getContext("2d"); c.fillStyle="#0f2219"; c.fillRect(0,0,W,Hh);
    var tx=function(t,x,y,sz,col,al,wt){ c.font=(wt||400)+" "+sz+"px system-ui,sans-serif"; c.fillStyle=col||"#eef5ef"; c.textAlign=al||"left"; c.fillText(t,x,y); };
    tx("📈 "+L2x("Laporan ibu bapa","Parent report"),60,90,44,"#c9a646","left",700); tx(kid.n+" · "+ymd(new Date()),60,140,30,"#9db5a5");
    [[R0.mins+"m",L2x("7 hari","7 days")],[R0.active+"/7",L2x("hari aktif","active days")],[R0.q7,L2x("soalan","questions")],[R0.acc7==null?"–":R0.acc7+"%",L2x("betul kali 1","1st try")],[R0.S0.n,L2x("hari berturut","streak")],[R0.S0.tot,"XP"]].forEach(function(t,i){ var x=60+(i%3)*330, y=200+Math.floor(i/3)*170; c.fillStyle="#14301f"; c.fillRect(x,y,300,140); tx(String(t[0]),x+24,y+78,54,"#eef5ef","left",800); tx(t[1],x+24,y+118,26,"#9db5a5"); });
    var mx=Math.max.apply(null,R0.days.map(function(x){ return x.m; }).concat([1])); tx(L2x("Minit setiap hari","Minutes each day"),60,600,32,"#eef5ef","left",700);
    R0.days.forEach(function(x,i){ var bh=Math.round(x.m/mx*260), bx=60+i*140; c.fillStyle="#1f9d63"; c.fillRect(bx+20,900-bh,90,bh); tx(String(x.m),bx+65,890-bh,26,"#eef5ef","center"); tx(DN[new Date(x.k+"T00:00:00").getDay()],bx+65,940,26,"#9db5a5","center"); });
    tx("💪 "+L2x("Kekuatan","Strengths")+": "+(R0.strong.map(function(x){ return x.n.replace(/^\S+\s/,"")+" "+x.first+"%"; }).join(", ")||"–"),60,1030,28,"#7fe0ad");
    tx("🎯 "+L2x("Perlu diperkukuh","To work on")+": "+(R0.weak.map(function(x){ return x.n.replace(/^\S+\s/,"")+" "+x.first+"%"; }).join(", ")||"–"),60,1080,28,"#f0b089");
    tx("🧠 "+focus,60,1130,28,"#eef5ef"); tx("My Ihsan · Sekolah",W-60,Hh-50,26,"#9db5a5","right");
    var du=cv.toDataURL("image/png"); if(window.Native && N.shareImage) N.shareImage(du,""); else { var a=document.createElement("a"); a.href=du; a.download="laporan-"+kid.n+".png"; a.click(); } }; }
function sekReport(kid){ var H0=sekHari(kid.id), d=new Date(), wk={j:0,b:0,n:0,s:0,days:0}, rk={}; try{ rk=JSON.parse(localStorage.getItem("silibus."+kid.id+".ringkas")||"{}"); }catch(e){}
  for(var i=0;i<7;i++){ var x=H0[ymd(addDays(d,-i))]; if(!x) continue; wk.j+=x.j||0; wk.b+=x.b||0; wk.n+=x.n||0; wk.s+=x.s||0; if(sekXP(x)) wk.days++; }
  var S0=sekStreak(kid.id), names={}; (SEK_CAT.pek||[]).forEach(function(p){ names[p.id]=p.nama; });
  var subj=Object.keys(rk).filter(function(k){ return rk[k].dijawab; }).sort(function(a, b){ return (rk[b].kemaskini||0)-(rk[a].kemaskini||0); }).slice(0,8).map(function(k){ var r=rk[k], pc=r.dijawab?Math.round((r.betul||0)*100/r.dijawab):0; return "• "+(names[k]||k)+": "+r.dijawab+"/"+r.jum+" "+L2x("dijawab","answered")+", "+pc+"% "+L2x("betul","correct"); });
  var t="📚 "+L2x("Laporan mingguan Sekolah: ","School weekly report: ")+kid.n+"\n"+
    L2x("7 hari lalu","Last 7 days")+": "+Math.round(wk.s/60)+" "+L2x("minit","min")+" · "+wk.days+"/7 "+L2x("hari aktif","active days")+"\n"+
    "✏️ "+wk.j+" "+L2x("soalan disemak","questions checked")+" · ⭐ "+(wk.j?Math.round(wk.b*100/wk.j):0)+"% "+L2x("betul cubaan pertama","right first time")+" · 📖 "+wk.n+" "+L2x("nota","notes")+"\n"+
    "🔥 "+S0.n+" "+L2x("hari berturut","day streak")+" · 🏆 "+S0.tot+" XP\n"+(subj.length?"\n"+L2x("Subjek:","Subjects:")+"\n"+subj.join("\n")+"\n":"")+"\nMy Ihsan · Sekolah";
  if(window.Native && N.shareText) N.shareText(t); else if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ toast(L2x("Laporan disalin","Report copied")); }); }
function sekRing(pc){ var r=16, c=2*Math.PI*r, d=Math.max(0,Math.min(1,pc))*c; return '<svg class="skRing" viewBox="0 0 40 40"><circle cx="20" cy="20" r="'+r+'" fill="none" stroke="var(--line)" stroke-width="5"/><circle cx="20" cy="20" r="'+r+'" fill="none" stroke="var(--gold)" stroke-width="5" stroke-dasharray="'+d.toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 20 20)"/><text x="20" y="24" font-size="10" text-anchor="middle" fill="currentColor">'+Math.round(pc*100)+'%</text></svg>'; }
// 0.5.64: Jawi packs (PI, Jawi, Akhlak KAFA) get a جاوي / Rumi button on their tile, like the BM/EN button; it sets the same switch as the one inside the pack
var SEK_JNAMA={pi:"ڤنديديقن اسلام", jawi:"جاوي", akhlak:"اخلاق (كفا)", tauhid:"توحيد (كفا)", feqah:"فقه (كفا)", hafazan:"حفظن (كفا)", "jawi-kafa":"جاوي (كفا)", "arab-kafa":"بهاس عرب (كفا)", sirah:"سيره (كفا)", tajwid:"تجويد (كفا)", imlak:"املاء (كفا)", khat:"خط (كفا)"};
function sekJawiKey(kid, id){ return "silibus."+kid.id+"."+id+".v1"; }
function sekJawiOn(kid, p){ try{ var o=JSON.parse(localStorage.getItem(sekJawiKey(kid, p.id))||"{}"); if(o.__jawi!==undefined) return !!o.__jawi; }catch(e){} return !!p.upkk || /-(pi|jawi|akhlak|tauhid|feqah|hafazan|kafa|sirah|tajwid|imlak|khat)$/.test(p.id); }
function sekJawiSet(kid, id, on){ try{ var k=sekJawiKey(kid, id), o=JSON.parse(localStorage.getItem(k)||"{}"); o.__jawi=!!on; localStorage.setItem(k, JSON.stringify(o)); }catch(e){} }
function sekKey(id){ return String(id).replace(/^(sedia|t\d|f\d)-/,"").replace(/-dlp$/,""); }
function sekAgo(ts){ if(!ts) return L2x("belum mula","not started"); var d=Math.floor((new Date().setHours(0,0,0,0)-new Date(ts).setHours(0,0,0,0))/864e5); return d<=0?L2x("hari ini","today"):d===1?L2x("semalam","yesterday"):d+" "+L2x("hari lalu","days ago"); }
function sekLvName(lv){ var x=SEK_LV.filter(function(y){ return y[0]===lv; })[0]; return x?L2x(x[2],x[3]):lv; }
function sekLvShort(lv){ return lv==="PRA"?L2x("Sedia","Pre"):lv[0]==="F"?(en_()?"F":"T")+lv.slice(1):(en_()?"Y":"T")+lv.slice(1); }
// 0.5.75 (owner): UPKK (Ujian Penilaian Kelas KAFA) for Year 5: a banner on the Year 5 page opens a hub of six full sets
// (Set 1-2 mudah, 3-4 sukar, 5-6 sangat sukar), each with the six subject papers (02 Akidah ... 07 Ibadah) in the 2024 format, all tap-based,
// plus complete notes per subject. Each subject is one pack (t5-upkk-*): topic 1 = complete notes, topics 2-7 = Set 1-6.
var UPKK_JN={akidah:"عقيدة", ibadah:"عبادة", sirah:"سيره", adab:"اداب", jawi:"جاوي دان خط", arab:"بهاس عرب"};
var UPKK_LV=[null,["mudah","easy","#2E9D6B"],["sederhana","medium","#E08A1E"],["sukar","hard","#C8413B"]];   // 0.5.77 (owner): three sets
function upkkPacks(){ return (SEK_CAT&&SEK_CAT.pek||[]).filter(function(p){ return p.upkk; }).sort(function(a, b){ return a.upkk<b.upkk?-1:1; }); }
function upkkDone(kid, p, n){ try{ var o=JSON.parse(localStorage.getItem(sekJawiKey(kid, p.id))||"{}"), t=p.topik[n]; if(!t) return 0; var j=Object.keys((o[t.id]||{}).disemak||{}).length; return t.n?Math.min(1, j/t.n):0; }catch(e){ return 0; } }
function upkkHero(kid){ var pk=upkkPacks(); if(!pk.length) return "";
  var pcs=[1,2,3].map(function(n){ return Math.round(pk.reduce(function(a, p){ return a+upkkDone(kid, p, n); },0)/pk.length*100); }), all=Math.round((pcs[0]+pcs[1]+pcs[2])/3);
  return '<button class="bnHero bn-upkk" data-upkk="1"><span class="bnSc"></span><span class="bnI">🕌</span><span class="shTxt"><b>'+L2x("UPKK: Ujian Penilaian Kelas KAFA","UPKK: KAFA class assessment")+'</b><small>'+L2x("3 set lengkap × 6 kertas · mudah, sederhana, sukar · nota lengkap · Jawi dan Rumi","3 full sets × 6 papers · easy, medium, hard · complete notes · Jawi and Rumi")+'</small>'+
    '<span class="upHB"><i style="width:'+Math.max(2,all)+'%"></i></span><span class="upHP">'+all+'% · '+[L2x("Mudah","Easy"),L2x("Sederhana","Medium"),L2x("Sukar","Hard")].map(function(x, i){ return x+' '+pcs[i]+'%'; }).join(" · ")+'</span></span><span class="shGo">›</span></button>'; }
function upkkHub(kid){ var c=sekCfg(), n=Math.min(3, +c.upkkSet||1), pk=upkkPacks(), jon=pk.length && sekJawiOn(kid, pk[0]), lv=UPKK_LV[n];
  var nm=function(p){ var k=p.id.replace("t5-upkk-",""); return jon?'<span dir="rtl" class="skJwT">'+esc(UPKK_JN[k]||p.nama)+'</span>':esc(p.nama.replace(/^UPKK /,"")); };
  var h='<div class="card skYr upHead"><div class="skYrT"><button class="skBack" id="skUpBack" aria-label="'+L2x("Kembali","Back")+'">‹</button><div class="skYrN"><h2>UPKK</h2><small>'+L2x("Ujian Penilaian Kelas KAFA · Tahun 5","KAFA class assessment · Year 5")+'</small></div>'+
    '<button class="skLang2 skJw'+(jon?' on':'')+'" id="skUpJw" aria-label="'+(jon?L2x("Tukar ke Rumi","Switch to Rumi"):L2x("Tukar ke Jawi","Switch to Jawi"))+'">'+(jon?'جاوي':'Rumi')+'</button></div>'+
    '<div class="mut tiny">'+L2x("Setiap kertas: 1 jam 15 minit · 70 markah · semua soalan dijawab dengan mengetik","Each paper: 1 h 15 min · 70 marks · every question is answered by tapping")+'</div></div>';
  h+='<div class="upSets">'+[1,2,3].map(function(i){ var L=UPKK_LV[i], d=pk.length?Math.round(pk.reduce(function(a, p){ return a+upkkDone(kid, p, i); },0)/pk.length*100):0;
    return '<button class="upSet g3d'+(i===n?' on':'')+'" data-upset="'+i+'" style="--upc:'+L[2]+'"><b>Set '+i+'</b><small>'+esc(L2x(L[0],L[1]))+'</small>'+(d?'<i>'+d+'%</i>':'')+'</button>'; }).join("")+'</div>';
  h+='<div class="snl" style="margin:10px 2px 6px">Set '+n+' · <span style="color:'+lv[2]+'">'+esc(L2x(lv[0],lv[1]))+'</span> · '+pk.length+' '+L2x("kertas","papers")+'</div><div class="upGrid">'+pk.map(function(p){ var t=p.topik[n], d=Math.round(upkkDone(kid, p, n)*100);
    return '<div class="upPaper" style="--skc:'+esc(p.warna||"#4F7BFF")+'"><div class="upTop"><span class="upCode">'+esc(p.upkk)+'</span><span class="upI">'+esc(p.ikon)+'</span></div><h3>'+nm(p)+'</h3>'+
      '<small>'+(t?t.n:0)+' '+L2x("soalan","questions")+' · 1 j 15 min · 70 '+L2x("markah","marks")+'</small><div class="skBar"><i style="width:'+Math.max(1,d)+'%"></i></div>'+
      '<div class="skBt"><button class="g3d" data-upk="'+p.id+'|nota|'+(t?t.id:"")+'" aria-label="'+L2x("Format","Format")+'">ℹ️</button><button class="g3d p" data-upk="'+p.id+'|kuiz|'+(t?t.id:"")+'">✏️ '+L2x("Jawab","Answer")+'</button></div></div>'; }).join("")+'</div>';
  h+='<div class="snl" style="margin:14px 2px 6px">📚 '+L2x("Nota lengkap (Tahun 1 hingga 5)","Complete notes (Years 1 to 5)")+'</div><div class="upNotes">'+pk.map(function(p){ var t=p.topik[0];
    return '<button class="chip g3d" data-upk="'+p.id+'|nota|'+(t?t.id:"")+'">'+esc(p.ikon)+' '+nm(p)+'</button>'; }).join("")+'</div>';
  h+='<div class="mut tiny" style="padding:10px 6px">'+L2x("Format mengikut kertas percubaan UPKK 2024. Soalan ditulis sendiri, bukan daripada kertas sebenar. Draf: perlu disemak ustaz dan guru KAFA.","Format follows the 2024 UPKK trial papers. Questions are original, not from real papers. Draft: needs review by an ustaz and KAFA teacher.")+'</div>';
  return h; }
// 0.5.61 (owner): School has two pages. Home: who is learning (child, settings, DLP, streak, live class) and ▶ Continue to the child's own year.
// Year page: big year title, summary, and every subject as a tile with its own background and full progress info.
// 0.7.44 (owner's Uniform Academy guide): three buttons on the School home (Pengakap, TKRS/KRS, PBSM); each opens its own page (uniform/: data.js, view.js, lab.js, uniform.css)
var UNI_IDS=["pengakap","krs","pbsm"];
function uniCss(){ if(!document.querySelector('link[href="uniform/uniform.css"]')){ var l=document.createElement("link"); l.rel="stylesheet"; l.href="uniform/uniform.css"; document.head.appendChild(l); } }
function uniStrip(){ uniCss(); var B=[["pengakap","🏕️","Pengakap",L2x("Selalu Sedia","Be Prepared")],["krs","🎖️","TKRS/KRS",L2x("Disiplin","Discipline")],["pbsm","🚑","PBSM",L2x("Kemanusiaan","Humanity")]];
  return '<div class="uniStrip"><small>'+L2x("Badan beruniform","Uniformed bodies")+'</small><div class="uniRow">'+B.map(function(b){ return '<button class="uniBtn ub-'+b[0]+' g3d" data-uni="'+b[0]+'"><span class="uniI">'+b[1]+'</span><b>'+b[2]+'</b><small>'+b[3]+'</small></button>'; }).join("")+'</div></div>'; }
function uniOpen(el, id, kid){ uniCss();
  el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>';
  loadJs(["uniform/data.js","uniform/view.js"].filter(function(f){ return !(f==="uniform/data.js" && window.UA) && !(f==="uniform/view.js" && window.UniView); }), function(){ if(!document.body.contains(el)) return;
    UniView.render(el, id, {esc:esc, L2x:L2x, load:load, save:save, toast:toast, kid:{id:kid.id, n:kid.n}, loadJs:loadJs, open:function(tab, sub){ if(sub) SUB2[tab]=sub; go(tab); },
      back:function(){ var c=sekCfg(); c.uni=""; save("ihsan_silibus", c); vSekolah(el); try{ document.getElementById("view").scrollTop=0; }catch(e){} }}); }, function(){ el.innerHTML='<div class="card mut">'+L2x("Gagal memuatkan.","Could not load.")+'</div>'; }); }
// 0.7.61 (owner): the child planner (kplan/kplan.js)
function kpCss(){ if(!document.querySelector('link[href="kplan/kplan.css"]')){ var l=document.createElement("link"); l.rel="stylesheet"; l.href="kplan/kplan.css"; document.head.appendChild(l); } }
function kpWeak(id){ var rk={}; try{ rk=JSON.parse(localStorage.getItem("silibus."+id+".ringkas")||"{}"); }catch(e){} var best=null;
  Object.keys(rk).forEach(function(k){ var r=rk[k]||{}; if((r.dijawab||0)<5) return; var pc=Math.round((r.pertama||0)/r.dijawab*100); if(pc<70 && (!best || pc<best.pc)){ var p=((SEK_CAT&&SEK_CAT.pek)||[]).filter(function(x){ return x.id===k; })[0]; best={n:p?p.nama:k, pc:pc}; } }); return best; }
function kpH(kid){ var h=finH(); h.day=getDay; h.loadJs=loadJs; h.hijri=function(d){ try{ return hijriStr(hijriOf(d)); }catch(e){ return ""; } }; h.pinAsk=pinAsk; h.pinHas=pinHas; h.weak=kpWeak;
  h.locked=!!(S.kidLock && S.lockTo==="school"); h.kids=function(){ return kprof().list.map(function(k){ return {id:k.id, n:k.n, e:k.e}; }); };
  h.vib=function(ms){ try{ N.vibrate(ms); }catch(e){} };
  h.share=function(t){ if(window.Native && N.shareText) N.shareText(t); else if(navigator.share) navigator.share({text:t}).catch(function(){}); else { try{ navigator.clipboard.writeText(t); }catch(e){} toast(L2x("Disalin","Copied")); } };
  h.planetMin=function(id){ var p=kprof(); if(p.cur!==id) return null; var kw=load("ihsan_kw",{})||{}; return kw.day && kw.day.d===ymd(new Date()) ? Math.round((kw.day.secs||0)/60) : 0; };
  h.kidsStars=function(id){ var p=kprof(); if(p.cur!==id) return null; var jm=Object.keys((load("ihsan_jamma",{s:{}}).s)||{}).length, hj=Object.keys((load("ihsan_hijaiyah",{s:{}}).s)||{}).length; return "Juz Amma ⭐ "+jm+"/37 · Hijaiyah ⭐ "+hj+"/29"; };
  h.addKid=function(n,e){ var p=kprof(), id="k"+Date.now().toString(36)+Math.random().toString(36).slice(2,4); p.list.push({id:id, n:n||"?", e:e||"🧒"}); if(!p.cur) p.cur=id; save("ihsan_kprof",p); return id; };
  h.kidProg=function(id){ var p=kprof(), g=function(k){ if(p.cur===id) return load(k,{s:{}}); var o=load("ihsan_kp_"+id,{}); try{ return o[k]?JSON.parse(o[k]):{s:{}}; }catch(e){ return {s:{}}; } };
    var jm=Object.keys((g("ihsan_jamma")||{}).s||{}).length, hj=Object.keys((g("ihsan_hijaiyah")||{}).s||{}).length, sm=window.KPlan?KPlan.summary(h,{id:id,n:"",e:""}):null;
    return "Juz Amma ⭐ "+jm+"/37 · Hijaiyah ⭐ "+hj+"/29"+(sm?" · "+L2x("Hari ini ","Today ")+sm.done+"/"+sm.total+" ✓":""); };
  h.refresh=function(){ try{ render(); }catch(e){} };
  return h; }
// 0.7.72 (owner): Pet manager helpers
function petH(){ var h=kpH(null); h.shareImage=function(url, txt){ if(window.Native && N.shareImage) N.shareImage(url, txt||""); else { var a=document.createElement("a"); a.href=url; a.download="pet.png"; document.body.appendChild(a); a.click(); a.remove(); } };
  h.kidStar=function(id, n){ var p=kprof(); try{ if(p.cur===id){ var kw=load("ihsan_kw",{})||{}; kw.stars=(kw.stars||0)+n; save("ihsan_kw",kw); } else { var o=load("ihsan_kp_"+id,{})||{}, kw2={}; try{ kw2=JSON.parse(o.ihsan_kw||"{}")||{}; }catch(e){} kw2.stars=(kw2.stars||0)+n; o.ihsan_kw=JSON.stringify(kw2); save("ihsan_kp_"+id,o); } }catch(e){} };
  h.on=on; h.off=off; h.openPlanet=function(){ kidsSel="planet"; go("kids"); }; return h; }
var PET_JS=["pets/pets_data.js","pets/pets.js"];
function petMount(el){ var go_=function(){ if(!document.body.contains(el)) return; try{ PetMgr.render(el, petH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Haiwan gagal dibuka","Pets could not open")+'</div>'; } };
  if(window.PetMgr && window.PetData) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(PET_JS, go_, function(){ el.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; }); } }
function kpMount(host, kid, tab){ var go_=function(){ if(!document.body.contains(host)) return; try{ KPlan.render(host, kpH(kid), {id:kid.id, n:kid.n, e:kid.e}, tab); }catch(err){ console.error(err); host.innerHTML='<div class="card">'+L2x("Perancang gagal dibuka","The planner could not open")+'</div>'; }
    setTimeout(function(){ var top=window.innerHeight; ["nav","subnav"].forEach(function(id){ var e=document.getElementById(id); if(e && e.offsetHeight) top=Math.min(top, e.getBoundingClientRect().top); }); document.querySelectorAll("#view .dock").forEach(function(d){ if(d.offsetHeight) top=Math.min(top, d.getBoundingClientRect().top); }); host.style.setProperty("--kpB", Math.max(80, window.innerHeight-top)+"px"); }, 120); };
  kpCss(); if(window.KPlan) go_(); else { host.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["kplan/kplan.js"], go_, function(){ host.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; }); } }
function vSekolah(el){
  if(!document.querySelector('link[href="silibus/sekolah.css"]')){ var l=document.createElement("link"); l.rel="stylesheet"; l.href="silibus/sekolah.css"; document.head.appendChild(l); }
  if(!SEK_CAT){ el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; sekXhr("silibus/packs/catalog.json", function(c){ SEK_CAT=c||{pek:[]}; if(document.body.contains(el)) vSekolah(el); }); return; }
  var c=sekCfg(), kid=sekKid(), kids=sekKids(), lv=c.tahap||"PRA", have={}; (SEK_CAT.pek||[]).forEach(function(p){ have[p.tahap]=1; });
  if(c.uni && UNI_IDS.indexOf(c.uni)>=0 && !S.kidLock){ uniOpen(el, c.uni, kid); return; }
  var rk={}; try{ rk=JSON.parse(localStorage.getItem("silibus."+kid.id+".ringkas")||"{}"); }catch(e){}
  var packs=sekPacks(kid, lv), T0=sekSet(kid.id), face=kid.id==="me"?"":(T0.maskot||kid.e||"🧒"), h="";
  if(!c.skYear){
    // ---------- HOME (0.5.71, owner): Settings · year dropdown · Join · Host on top; a compact dashboard; the "Year" profile shows every year as a tile ----------
    var isYr=kid.id==="me", kpOn=!isYr && c.kpTab && c.kpTab!=="learn", kpTabsH="";
    if(!kpOn) h+='<div class="card skHead skTop"><div class="skTopR"><button class="chip g3d" id="skSet" aria-label="'+L2x("Tetapan","Settings")+'">⚙️</button>'+
      '<select id="skYrSel" class="rin skYrSel" aria-label="'+L2x("Tukar tahun","Change year")+'">'+SEK_LV.map(function(x){ var on=have[x[0]]||x[0]==="F1"; return '<option value="'+x[0]+'"'+(lv===x[0]?' selected':'')+'>'+sekIcT(x)+esc(L2x(x[2],x[3]))+(on?'':' · '+L2x("akan datang","coming"))+'</option>'; }).join("")+'</select>'+
      '<button class="chip g3d" id="lqJoin">🙋 '+L2x("Sertai","Join")+'</button><button class="chip g3d" id="lqHost">🎤 '+L2x("Hos","Host")+'</button></div>'+sekCount(T0)+'</div>';
    if(isYr){
      h+=sekDash(kid, null);
      h+='<div class="snl" style="margin:12px 2px 6px">'+L2x("Semua tahun","Every year")+'</div><div class="skYrGrid">'+SEK_LV.map(function(x){ var pk=sekPacks(kid, x[0]), m=sekSum(rk, pk), on=pk.length>0 || x[0]==="F1";
        return '<button class="skYrT g3d'+(on?'':' soon')+(lv===x[0]?' cur':'')+'" data-skyt="'+x[0]+'"><span class="skYrI">'+sekIc(x)+'</span><b>'+esc(L2x(x[2],x[3]))+'</b>'+(pk.length?'<span class="skYrB"><i style="width:'+Math.max(2,m.pc)+'%"></i></span><small>'+m.pc+'% · ✓'+m.acc+'</small>':'<small>'+(x[0]==="F1"?"PKSK":L2x("Akan datang","Coming soon"))+'</small>')+'</button>'; }).join("")+'</div>';
    } else {
      // 0.7.61 (owner): each child has 📚 Learn · 📅 Planner · 📊 Report (kplan/kplan.js)
      kpCss(); var kpT=c.kpTab||"learn";
      h+='<div class="skWho"><span class="noico">'+esc(kid.e||"🧒")+'</span><b>'+esc(kid.n)+'</b><small>'+esc(sekLvName(lv))+'</small></div>';
      kpTabsH='<div class="dock kpTabsD"><div class="grp3 g3">'+[["learn","📚",L2x("Belajar","Learn")],["plan","📅",L2x("Perancang","Planner")],["rep","📊",L2x("Laporan","Report")]].map(function(t){ return '<button class="chip g3d'+(kpT===t[0]?' on':'')+'" data-kpt="'+t[0]+'">'+t[1]+' '+esc(t[2])+'</button>'; }).join("")+'</div></div>';   // 0.7.62 (owner): level 4, just above the children
      if(kpT==="learn") h+=sekDash(kid, lv); else h+='<div id="kpHost"></div>';
    }
    if(!(S.kidLock && S.lockTo==="school") && !kpOn) h+=uniStrip();   // 0.7.44: under the year tiles, half height
    // the Continue button sits at the bottom (sticky, above the children row); 0.5.76 (owner): not on the "Year" profile, which opens years from its tiles
    if(!isYr && !kpOn) h+='<div class="dock skContDock"><button class="btn gold full g3d skGoB" id="skGo">▶ '+L2x("Teruskan: ","Continue: ")+esc(sekLvName(lv))+'</button></div>';
  } else if(c.skUpkk && lv==="T5" && upkkPacks().length){
    h+=upkkHub(kid);
  } else {
    // ---------- YEAR PAGE ----------
    var tot={d:0,j:0,p:0,n:0}, weak=null, wv=2;
    packs.forEach(function(p){ var r=rk[p.id]||{}; tot.d+=r.dijawab||0; tot.j+=r.jum||p.soalan||0; tot.p+=r.pertama||0; tot.n+=r.nota||0; if((r.dijawab||0)>=5){ var a=(r.pertama||0)/r.dijawab; if(a<0.7 && a<wv){ wv=a; weak=p.id; } } });
    var wp=packs.filter(function(p){ return p.id===weak; })[0], allpc=tot.j?tot.d/tot.j:0;
    h+='<div class="card skYr"><div class="skYrT"><button class="skBack" id="skBack" aria-label="'+L2x("Kembali","Back")+'">‹</button><div class="skYrN"><h2>'+esc(sekLvName(lv))+'</h2><small>'+esc((kid.e||"")+" "+kid.n)+' · '+packs.length+' '+L2x("subjek","subjects")+' · 🔥 '+sekStreak(kid.id).n+'</small></div><span class="skYrF noico" aria-hidden="true">'+face+'</span></div>'+
      '<div class="skBar"><i style="width:'+Math.max(1,Math.round(allpc*100))+'%"></i></div>'+
      '<div class="skSum"><div><b>'+tot.d+'</b><small>'+L2x("soalan dijawab","questions done")+'</small></div><div><b>'+(tot.d?Math.round(tot.p/tot.d*100)+'%':'–')+'</b><small>'+L2x("betul cubaan 1","right first time")+'</small></div><div><b>'+tot.n+'</b><small>'+L2x("nota dibaca","notes read")+'</small></div><div><b>'+(wp?esc(wp.ikon):'⭐')+'</b><small>'+(wp?esc(wp.nama):L2x("tiada ulang kaji","nothing to revise"))+'</small></div></div>'+sekCount(T0)+'</div>';
    if(lv==="F1") h+=pkskHero();
    if(lv==="T5") h+=upkkHero(kid);
  // spec v3 §4.8: sample entrance exam + 🎯 Indeks Sedia (average of the last 3 tests per subject)
  var IX={}, UJ=[]; try{ UJ=JSON.parse(localStorage.getItem("silibus."+kid.id+".ujian")||"[]"); }catch(e){}
  (SEK_CAT.pek||[]).forEach(function(p){ if(p.tahap!=="PRA") return; var v=UJ.filter(function(e){ return e.perSubjek && e.perSubjek[p.id]!=null; }).slice(-3).map(function(e){ return e.perSubjek[p.id]; }); if(v.length) IX[p.id]=Math.round(v.reduce(function(a,b){ return a+b; },0)/v.length); });
  var ixDot=function(v){ return v==null?'':'<span class="skIx" title="Indeks Sedia">'+(v>=80?'🟢':v>=50?'🟡':'🔴')+' '+v+'%</span>'; };
  if(lv==="PRA"){ var last=UJ[UJ.length-1];
    h+='<div class="card skUj"><div class="skT"><span class="skI">📝</span><div><b>'+L2x("Ujian Contoh Kemasukan Tahun 1","Year 1 entrance sample exam")+'</b><small>'+L2x("8 subjek × 2 bahagian (/80) + lisan (/32) · tiada pemasa","8 subjects × 2 parts (/80) + oral (/32) · no timer")+'</small></div></div>'+
      (last?'<div class="skProg mut tiny">'+L2x("Ujian terakhir: ","Last test: ")+esc(last.tarikh)+' · '+last.bertulis+'/80 · '+L2x("lisan ","oral ")+last.lisan+'/32 · '+UJ.length+' '+L2x("ujian","tests")+'</div>':'')+
      (Object.keys(IX).length?'<div class="skIxRow">🎯 '+L2x("Indeks Sedia","Readiness index")+': '+Object.keys(IX).map(function(k){ var p=(SEK_CAT.pek||[]).filter(function(x){ return x.id===k; })[0]; return '<span>'+(p?p.ikon:'')+' '+ixDot(IX[k])+'</span>'; }).join("")+'</div>':'')+
      '<div class="btns"><button class="btn gold g3d" data-sko="ujian|ujian">📝 '+L2x("Mula ujian","Start the test")+'</button></div></div>'; }
    if(!packs.length && lv!=="F1") h+='<div class="card mut small">'+L2x("Silibus untuk tahap ini sedang disediakan. Sedia ke Tahun 1 hingga Tingkatan 5 sudah ada.","The syllabus for this level is being prepared. Pre-Year 1 to Form 5 are ready.")+'</div>';
    var tileOf=function(p){ var r=rk[p.id]||{}, jum=r.jum||p.soalan||0, dj=r.dijawab||0, pc=jum?dj/jum:0, acc=dj?Math.round((r.pertama||0)/dj*100)+'%':'–', nx=r.next!==undefined?r.next:(p.topik[0]&&p.topik[0].nama), tw=sekTwins()[p.asal||p.id];
      var jw=p.jawi && SEK_JNAMA[sekKey(p.id)], jon=jw && sekJawiOn(kid, p);
      return '<div class="skTile" data-sub="'+esc(sekKey(p.id))+'" style="--skc:'+esc(p.warna||"#4F7BFF")+'">'+(p.id===weak?'<span class="skRib">'+L2x("ULANG KAJI","REVISE")+'</span>':'')+
        '<div class="skTop"><span class="skTI">'+esc(p.ikon)+'</span>'+(tw?'<button class="skLang2'+(p.dlp?' on':'')+'" data-skdl="'+esc(p.asal||p.id)+'" aria-label="'+(p.dlp?L2x("Tukar ke Bahasa Melayu","Switch to Malay"):L2x("Tukar ke Bahasa Inggeris (DLP)","Switch to English (DLP)"))+'">'+(p.dlp?'🇬🇧 EN':'BM')+'</button>':'')+
        (jw?'<button class="skLang2 skJw'+(jon?' on':'')+'" data-skjw="'+esc(p.id)+'" aria-label="'+(jon?L2x("Tukar ke Rumi","Switch to Rumi"):L2x("Tukar ke Jawi","Switch to Jawi"))+'">'+(jon?'جاوي':'Rumi')+'</button>':'')+sekRing(pc)+'</div>'+
        '<h3'+(jon?' class="skJwT" dir="rtl"':'')+'>'+(jon?esc(SEK_JNAMA[sekKey(p.id)]):esc(p.nama))+(/^pending/.test(p.semak)?' <span class="skDraf2">'+L2x("Draf","Draft")+'</span>':'')+(IX[p.id]!=null?' '+ixDot(IX[p.id]):'')+'</h3>'+
        '<div class="skBar"><i style="width:'+Math.max(1,Math.round(pc*100))+'%"></i></div>'+
        '<div class="skSt"><div><b>'+dj+'</b><small>/'+jum+' '+L2x("dijawab","done")+'</small></div><div><b>'+acc+'</b><small>'+L2x("betul","right")+'</small></div><div><b>'+(r.nota||0)+'/'+p.topik.length+'</b><small>'+L2x("nota","notes")+'</small></div></div>'+
        '<div class="skNx">'+(nx?'▶ '+L2x("Seterusnya: ","Next: ")+esc(nx):'✓ '+L2x("Semua topik selesai","All topics done"))+'</div>'+
        '<div class="skWhen">🕑 '+esc(sekAgo(r.kemaskini))+'</div>'+
        '<div class="skBt"><button class="g3d" data-sko="'+p.id+'|nota" aria-label="'+L2x("Nota","Notes")+'">📖</button><button class="g3d" data-sko="'+p.id+'|kuiz" aria-label="'+L2x("Kuiz","Quiz")+'">✏️</button>'+(/^F/.test(p.tahap)?'':'<button class="g3d p" data-sko="'+p.id+'|main">🎮 '+L2x("Main","Play")+'</button>')+(sekTbOf(p).length?'<button class="g3d skBk" data-skbk="'+esc(p.id)+'" aria-label="'+L2x("Buku teks","Textbook")+'">'+(sekTbOf(p).some(function(b,i){ return tbHave(p.asal||p.id,i); })?'📗':'📘')+'</button>':'')+'</div></div>'; };
    // 0.5.65: the KAFA (sekolah agama) subjects sit in their own group under the school subjects
    var sch=packs.filter(function(p){ return !p.kafa; }), kafa=packs.filter(function(p){ return p.kafa; });
    if(sch.length) h+='<div class="skGrid2">'+sch.map(tileOf).join("")+'</div>';
    if(kafa.length) h+='<div class="skGrpH"><span>🕌</span><div><b>'+L2x("KAFA (sekolah agama)","KAFA (religious school)")+'</b><small>'+L2x("Dalam Jawi · ketik جاوي / Rumi untuk tukar","In Jawi · tap جاوي / Rumi to switch")+'</small></div></div><div class="skGrid2">'+kafa.map(tileOf).join("")+'</div>';
    h+=(/^F\d/.test(lv)?'<div class="mut tiny" style="padding:4px 6px">'+L2x("Mengikut DSKP KSSM Tingkatan "+lv.slice(1)+". Semua nota dan soalan ditulis atau dijana oleh aplikasi, bukan daripada buku teks atau kertas peperiksaan. Draf: perlu disemak oleh guru. Kemajuan disimpan untuk setiap anak di telefon ini.","Follows the KSSM Form "+lv.slice(1)+" DSKP. All notes and questions are written or generated by the app, not taken from textbooks or exam papers. Draft: needs a teacher's review. Progress is kept for each child on this phone.")+'</div>':'<div class="mut tiny" style="padding:4px 6px">'+L2x("Mengikut susunan topik KSSR Semakan 2017. Semua soalan ditulis sendiri, bukan daripada buku teks atau kertas peperiksaan. Kemajuan disimpan untuk setiap anak di telefon ini.","Follows the KSSR (2017 revision) topic order. All questions are original, not from textbooks or exam papers. Progress is kept for each child on this phone.")+'</div>'+
      '<div class="mut tiny" style="padding:0 6px 10px">'+L2x("Draf: perlu disemak guru, dan ustaz bagi Pendidikan Islam, Jawi dan Bahasa Arab.","Draft: needs a teacher's review, and an ustaz's for Islamic Education, Jawi and Arabic.")+'</div>');
  }
  // 0.5.70 (owner): the children are level 3: a row at the bottom, just above the School/Basics bar; ⇅ puts them in your own order
  var skL=!!(S.kidLock && S.lockTo==="school");
  if(skL) h=swUnHtml("skUnlock","kpLock")+h;
  h+='<div class="dock skKidDock"><div class="chips">'+kids.filter(function(k){ return !skL || k.id===kid.id; }).map(function(k){ return '<button class="chip g3d'+(k.id==="me"?' skMain':'')+(k.id===kid.id?' on':'')+'" data-skk="'+esc(k.id)+'">'+(k.id==="me"?'🏫 ':'')+esc((k.e||"")+" "+k.n)+'</button>'; }).join("")+
    (skL?'':'<button class="chip g3d" id="skAdd">＋ '+L2x("Anak","Child")+'</button>'+(kprof().list.length?'<button class="chip g3d" id="skOrd" aria-label="'+L2x("Urus anak","Manage children")+'">⚙</button>':'')+'<button class="chip g3d" id="skLock" aria-label="'+L2x("Kunci Sekolah","Lock School")+'">🔒</button>')+'</div></div>';
  if(typeof kpTabsH==="string" && kpTabsH) h+=kpTabsH;
  var cd=h.indexOf('<div class="dock skContDock">'); if(cd>=0){ var ce=h.indexOf('</div>', h.indexOf('</button>', cd))+6, cont=h.slice(cd, ce); h=h.slice(0, cd)+h.slice(ce)+cont; }   // Continue stacks above the children row
  el.innerHTML=h; setTimeout(dockFix, 0);
  el.querySelectorAll("[data-kpt]").forEach(function(b){ b.onclick=function(){ var c2=sekCfg(); c2.kpTab=b.getAttribute("data-kpt"); save("ihsan_silibus", c2); vSekolah(el); try{ document.getElementById("view").scrollTop=0; }catch(e){} }; });
  var kpH0=el.querySelector("#kpHost"); if(kpH0) kpMount(kpH0, kid, c.kpTab);
  el.querySelectorAll("[data-uni]").forEach(function(b){ b.onclick=function(){ var c2=sekCfg(); c2.uni=b.getAttribute("data-uni"); save("ihsan_silibus", c2); if(window.UniView) UniView.reset(); vSekolah(el); try{ document.getElementById("view").scrollTop=0; }catch(e){} }; });
  var ko=el.querySelector("#skOrd"); if(ko) ko.onclick=function(){ kidManage(function(){ if(document.body.contains(el)) vSekolah(el); }); };
  var skU=el.querySelector("#skUnlock"); if(skU) swUnBind(skU, sekLockOff);
  var skLk=el.querySelector("#skLock"); if(skLk) skLk.onclick=function(){ var ov=showSheet("🔒 "+L2x("Kunci Sekolah","Lock School"), '<div class="small" style="line-height:1.5">'+L2x("Anak hanya boleh guna Sekolah untuk <b>"+esc(kid.n)+"</b>: tiada tab lain, tiada tukar anak, tiada tetapan. Untuk buka: sapu 🔒 di atas 5 kali dan masukkan PIN ibu bapa.","Your child can only use School as <b>"+esc(kid.n)+"</b>: no other tabs, no switching child, no settings. To unlock: swipe the 🔒 at the top 5 times and enter the parent PIN.")+'</div><button class="btn gold full g3d" id="skLkGo" style="margin-top:10px">🔒 '+L2x("Kunci sekarang","Lock now")+'</button>');
    ov.querySelector("#skLkGo").onclick=function(){ closeOverlay(); sekLockOn(kid); }; };
  var q=function(s){ return el.querySelector(s); }, setYear=function(on){ var c2=sekCfg(); c2.skYear=!!on; c2.skUpkk=""; save("ihsan_silibus",c2); vSekolah(el); try{ el.scrollIntoView({block:"start"}); window.scrollTo(0,0); }catch(e){} };
  el.querySelectorAll("[data-skk]").forEach(function(b){ b.onclick=function(){ var c2=sekCfg(); c2.anak=b.getAttribute("data-skk"); var t2=sekSet(c2.anak); if(t2.tahap) c2.tahap=t2.tahap; if(c2.anak==="me"){ c2.skYear=false; c2.skUpkk=""; } save("ihsan_silibus",c2); vSekolah(el); try{ document.getElementById("view").scrollTop=0; }catch(e){} }; });   // 0.5.78 (owner): Year opens the Year page (every year as a tile)
  if(q("#skSet")){ if(skL) q("#skSet").style.display="none"; else q("#skSet").onclick=function(){ sekSettings(kid, el); }; }
  if(q("#skGo")) q("#skGo").onclick=function(){ setYear(true); };
  if(q("#skBack")) q("#skBack").onclick=function(){ setYear(false); };
  var dl=q("#skDlp"); if(dl) dl.onclick=function(){ var on=!sekDlpOn(kid); sekDlpSet(kid, Object.keys(sekTwins()), on); toast(on?L2x("DLP dihidupkan: semua Matematik dan Sains dalam Bahasa Inggeris","DLP on: all Maths and Science in English"):L2x("DLP ditutup: semua dalam Bahasa Melayu","DLP off: all in Malay")); vSekolah(el); };
  el.querySelectorAll("[data-skdl]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); var id=b.getAttribute("data-skdl"), on=!sekDlpFor(kid, id); sekDlpSet(kid, [id], on); vSekolah(el); }; });
  el.querySelectorAll("[data-skjw]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); var id=b.getAttribute("data-skjw"), p=(SEK_CAT.pek||[]).filter(function(x){ return x.id===id; })[0]; if(p){ sekJawiSet(kid, id, !sekJawiOn(kid, p)); vSekolah(el); } }; });
  el.querySelectorAll("[data-skbk]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); var p=(SEK_CAT.pek||[]).filter(function(x){ return x.id===b.getAttribute("data-skbk"); })[0], t=(SEK_CAT.tahap||[]).filter(function(x){ return p&&x.id===p.tahap; })[0]; if(p) sekBooks(p, t?t.nama:p.tahap); }; });
  if(!SEK_TB) sekTbLoad(function(){ if(document.body.contains(el)) vSekolah(el); });
  var rp=q("#skRep"); if(rp) rp.onclick=function(){ sekReportSheet(kid); };
  var lh=q("#lqHost"), lj=q("#lqJoin"), lq=function(mode){ loadJs(["groups/nostrkit.js","silibus/live.js"], function(){ LiveQuiz.open(mode, {H:IBH, kid:kid, packs:packs, catalog:SEK_CAT, loadJs:loadJs}); }, function(){ toast(L2x("Gagal dimuatkan","Could not load")); }); };
  if(lh) lh.onclick=function(){ lq("host"); }; if(lj) lj.onclick=function(){ lq("join"); };
  // the year is remembered per child (Settings › tahap), so each child opens on their own year
  var ys=q("#skYrSel"); if(ys) ys.onchange=function(){ var c2=sekCfg(), v=ys.value; c2.tahap=v; save("ihsan_silibus",c2); var t2=sekSet(kid.id); t2.tahap=v; sekSetSave(kid.id, t2); vSekolah(el); };
  el.querySelectorAll("[data-skyt]").forEach(function(b){ b.onclick=function(){ var v=b.getAttribute("data-skyt"), c2=sekCfg(); c2.tahap=v; c2.skYear=true; c2.skUpkk=""; save("ihsan_silibus",c2); var t2=sekSet(kid.id); t2.tahap=v; sekSetSave(kid.id, t2); vSekolah(el); try{ document.getElementById("view").scrollTop=0; }catch(e){} }; });
  var rp2=q("#skRep2"); if(rp2) rp2.onclick=function(){ sekReportSheet(kid); };
  el.querySelectorAll("[data-skl]").forEach(function(b){ b.onclick=function(){ var c2=sekCfg(), v=b.getAttribute("data-skl"); c2.tahap=v; save("ihsan_silibus",c2); var t2=sekSet(kid.id); t2.tahap=v; sekSetSave(kid.id, t2); vSekolah(el); }; });
  if(q("#skAdd")) q("#skAdd").onclick=function(){ var ov=showSheet("🧒 "+L2x("Tambah anak","Add a child"), '<input id="skN" class="rin" maxlength="24" placeholder="'+L2x("Nama anak","Child's name")+'"><button class="btn gold full g3d" id="skNo">'+L2x("Tambah","Add")+'</button>');
    ov.querySelector("#skNo").onclick=function(){ var n=ov.querySelector("#skN").value.trim(); if(!n) return; kidAdd(n, KID_EMO[kprof().list.length%KID_EMO.length]); var c2=sekCfg(); c2.anak=kprof().cur; save("ihsan_silibus",c2); closeOverlay(); vSekolah(el); }; };
  el.querySelectorAll("[data-sko]").forEach(function(b){ b.onclick=function(){ var a=b.getAttribute("data-sko").split("|"); openSilibus(a[0], a[1]); }; });
  var pk=q("[data-pksk]"); if(pk) pk.onclick=openPksk;
  var upH=function(on){ var c2=sekCfg(); c2.skUpkk=on?"1":""; save("ihsan_silibus",c2); vSekolah(el); try{ document.getElementById("view").scrollTop=0; }catch(e){} };
  var ub=q("[data-upkk]"); if(ub) ub.onclick=function(){ upH(true); };
  if(q("#skUpBack")) q("#skUpBack").onclick=function(){ upH(false); };
  if(q("#skUpJw")) q("#skUpJw").onclick=function(){ var pk2=upkkPacks(), on=!(pk2.length && sekJawiOn(kid, pk2[0])); pk2.forEach(function(p){ sekJawiSet(kid, p.id, on); }); vSekolah(el); };
  el.querySelectorAll("[data-upset]").forEach(function(b){ b.onclick=function(){ var c2=sekCfg(); c2.upkkSet=+b.getAttribute("data-upset"); save("ihsan_silibus",c2); vSekolah(el); }; });
  el.querySelectorAll("[data-upk]").forEach(function(b){ b.onclick=function(){ var a=b.getAttribute("data-upk").split("|"); openSilibus(a[0], a[1], a[2]); }; });
}
function openSilibus(pek, mod, topik){ var kid=sekKid(), ov=document.getElementById("overlay");
  var c2=sekCfg(); c2.last={pek:pek, mod:mod, at:Date.now(), anak:kid.id}; save("ihsan_silibus",c2);
  ov.className="pkskov"; ov.innerHTML='<iframe class="pkF skF" title="Sekolah" src="silibus/exam.html?pek='+encodeURIComponent(pek)+'&mod='+mod+'&anak='+encodeURIComponent(kid.id)+'&nama='+encodeURIComponent(kid.id==="me"?(S.uname||L2x("Saya","Me")):kid.n)+(en_()||/-dlp$/.test(pek)||/^f\d-bi$/.test(pek)?'&ui=en':'')+(topik?'&topik='+encodeURIComponent(topik):'')+'"></iframe>';
  var f=ov.querySelector(".skF"), close=function(){ window.removeEventListener("message", msg); closeOverlay(); render(); };
  var msg=function(e){ if(e.data && e.data.silibus==="close") close(); }; window.addEventListener("message", msg);
  ov._close=function(){ try{ var w=f.contentWindow; if(w && w.SILIBUS_BACK && w.SILIBUS_BACK()) return; }catch(e){} close(); };
}
function wSekolah(w,h){ var c=sekCfg(), l=c.last, kid=sekKid(), rk={}; try{ rk=JSON.parse(localStorage.getItem("silibus."+kid.id+".ringkas")||"{}"); }catch(e){}
  var keys=Object.keys(rk).sort(function(a,b){ return (rk[b].kemaskini||0)-(rk[a].kemaskini||0); }), k0=keys[0], r=k0?rk[k0]:null;
  return '<div class="card wfin" data-wsc="sc-n-learn/sekolah"><h3>📚 '+L2x("Ulang kaji hari ini","Today's revision")+'</h3><div class="small">'+(r?esc(kid.n)+' · '+esc(k0)+' · '+r.dijawab+'/'+r.jum+' '+L2x("dijawab","answered"):L2x("Ketik untuk mula: Sedia ke Tahun 1 hingga Tahun 6","Tap to start: Pre-Year 1 to Year 6"))+'</div>'+sekCount(sekSet(kid.id))+'</div>'; }
Object.assign(WG,{ silw: cardW("learn","📚","Sekolah: ulang kaji hari ini","School: today's revision",wSekolah,[4,2],[2,1]) });
// 0.18.0 tajwid lessons and Iqra'-style reading levels (ilmu/bacaan.js)
function vBacaan(bx, k){
  if(!document.getElementById("qCss")){ var l=document.createElement("link"); l.id="qCss"; l.rel="stylesheet"; l.href="quran/quran.css"; document.head.appendChild(l); }
  var start=function(){ if(!document.body.contains(bx)) return; var h=qHelpers(); h.speakAr=speakAr; h.openLetters=function(){ learnPg="hijaiyah"; learnFrom="iqra"; render(); document.getElementById("view").scrollTop=0; }; try{ BacaanView(bx, k, h); }catch(err){ console.error(err); bx.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.BacaanView && window.QuranView && window.QMETA){ start(); return; }
  bx.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>';
  loadJs(QJS.concat(["ilmu/bacaan.js"]), start, function(){ bx.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; });
}

// ---------- AL-QURAN (0.15.0, 0.16.0 tafsir/roots/topics): reader in quran/quran.js, data loaded on first use ----------
function qHelpers(){ return {N:N, esc:esc, L2x:L2x, en:en_, toast:toast, showSheet:showSheet, closeOverlay:closeOverlay, load:load, save:save,
      on:on, off:off, fetch:nFetch, dockFix:dockFix, shareCard:shareCard, hijri:hijriOf, addDays:addDays, resched:pushSchedule, openSirahAt:function(id){ openSirah(false, id); },
      jnTad:function(ds, k, t){ var J=jnData(), e=J.d[ds]||{}; e.tk=k; e.tt=t; J.d[ds]=e; save("ihsan_muhasabah", J); },
      kidStar:function(){ var c=kidCur(); return c?c.n:null; }}; }
function vQuran(bx){
  if(!document.getElementById("qCss")){ var l=document.createElement("link"); l.id="qCss"; l.rel="stylesheet"; l.href="quran/quran.css"; document.head.appendChild(l); }
  var start=function(){ if(!document.body.contains(bx)) return; try{ QuranView(bx, qHelpers()); }catch(err){ console.error(err); bx.innerHTML='<div class="card">'+L2x("Al-Quran gagal dibuka","The Quran could not open")+'</div>'; } };
  if(window.QuranView && window.QMETA){ start(); return; }
  bx.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>';
  loadJs(QJS, start, function(){ bx.innerHTML='<div class="card">'+L2x("Al-Quran gagal dimuatkan","The Quran could not load")+'</div>'; });
}
function openQuran(playing){ sunPage="quran"; save("ihsan_sunpage","quran"); learnPg=null; learnFrom=null;
  var g=function(){ if(playing && window.QuranView) QuranView.openPlaying(); go("sunat"); };
  if(playing && !window.QuranView) loadJs(["quran/qmeta.js","quran/quran_ms.js","quran/qtopic.js","quran/quran.js"], g, function(){ go("sunat"); }); else g(); }
window.openQuran=openQuran;
// 0.17.0: open the reader at any ayat (doa sources, shortcuts, reminders, Sirah links)
var QJS=["quran/qmeta.js","quran/quran_ms.js","quran/qtopic.js","quran/quran.js"];
function openQuranAt(su, a, mode){ if(S.kidLock) return; var f=function(){ QuranView.open(QMETA.sa[su-1]+Math.max(1,a||1)-1, mode); openQuran(false); };
  if(document.getElementById("overlay") && !document.getElementById("overlay").classList.contains("hidden")) closeOverlay();
  if(window.QuranView && window.QMETA) f(); else loadJs(QJS, f, function(){ toast(L2x("Al-Quran gagal dimuatkan","The Quran could not load")); }); }
window.openQuranAt=openQuranAt;
document.addEventListener("click", function(e){ var a=e.target.closest && e.target.closest("[data-qref]"); if(!a) return; e.preventDefault(); e.stopPropagation(); var p=a.getAttribute("data-qref").split(":"); openQuranAt(+p[0], +p[1]); }, true);
// 0.17.0 Juz Amma for kids (inside Kids mode)
function vJamma(bx){
  if(!document.getElementById("qCss")){ var l=document.createElement("link"); l.id="qCss"; l.rel="stylesheet"; l.href="quran/quran.css"; document.head.appendChild(l); }
  var start=function(){ if(document.body.contains(bx)) QuranView.kids(bx, qHelpers()); };
  if(window.QuranView && window.QMETA) start(); else { bx.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(QJS, start); } }

// ---------- KALENDAR: Bulan / Puasa / Statistik ----------
function vCal(el){
  var s=SUB2.cal;
  if(s==="bulan"){
    plHub(el); return; }   // 0.7.77: Planner hub (Gregorian and Hijri live in Time > Track)
  if(s==="statistik" && IOS && (!SUB2.trk || SUB2.trk==="stats")) SUB2.trk="g";
  if(s==="statistik" && (SUB2.trk==="g" || SUB2.trk==="h")){ cal.mode=SUB2.trk;
    vCal0(el);
    var cd=el.querySelector(".cdbox"); if(cd) cd.remove();
    var kr=el.querySelector(".kadRow"); if(kr && !kr.querySelector('[data-kad]:not([data-kad=""])')) kr.remove();
    var uc=el.querySelector(".ucard"); if(uc) uc.remove();
    el.insertAdjacentHTML("beforeend", csCard()); bindCs(el);
    return;
  }
  if(s==="puasa"){ SUB2.cal="statistik"; SUB2.trk="h"; cal.mode="h"; vCal(el); return; }   // 0.6.68: old links land on the Hijri calendar
  if(s==="puasa_old"){
    var h=countdownBoxes()+ramadanMonth();   // 0.5.22: the day countdowns first
    h+=(HC.ramadan()||'')+(HC.fast()||'')+(HC.ganti()||'');
    h+='<div class="card"><div class="small">'+L2x("Niat, cara dan kelebihan setiap puasa sunat:","Intention, how-to and virtues of each sunnah fast:")+'</div><button class="btn alt full g3d" id="pzAmal" style="margin-top:8px">🌱 '+L2x("Amal sunat › Puasa","Sunnah deeds › Fasting")+' ›</button></div>';
    el.innerHTML=h;
    el.querySelector("#pzAmal").onclick=function(){ sunTop="puasa"; sunOpen=null; go("amal"); };
    el.onclick=function(e){ var b=e.target.closest("[data-act]"); if(b){ homeAct(b.getAttribute("data-act")); } };
    var fr=el.querySelector("#hFastRem"); if(fr) fr.onchange=function(){ S.fastRem=this.checked; saveS(); };
    bindRamadan(el);
    return;
  }
  if(s==="senaman"){ vFit(el); return; }
  if(s==="fokus"){ SUB2.cal="bulan"; SUB2.plt="focus"; plHub(el); return; }   // 0.7.77: Focus lives in Planner
  if(s==="mesyuarat"){ vMeet(el); return; }
  if(s==="trip"){ vTrip(el); return; }
  if(s==="haid"){ if(periodHidden()){ SUB2.cal="bulan"; vCal(el); return; } vPeriod(el); return; }
  // statistik (0.30.0: day / month / year, steps, phone screen time, swipe between periods)
  vStats(el);
}
// ---------- 0.37.0 SENAMAN (fit/fit.js): 3D figure, 50 moves, routines with timers, plan, tracker, health ----------
var FITJS=["fit/fit_data.js","fit/fit3d.js","fit/fit.js"];
function fitH(){ var h=finH(); h.S=S; h.fetch=nFetch; h.N=N; h.canvasPdf=canvasPdf; h.sharePdf=sharePdf; h.loadJs=loadJs; h.loadJs=loadJs; h.findView=findInto; h.locTag=locTag; h.steps=function(){ try{ return !S.stepsOn?null:((stepMap()[ymd(new Date())]||{}).s||0); }catch(e){ return null; } }; return h; }
function vFit(el){ var go_=function(){ if(document.body.contains(el)) try{ FitView.view(el, fitH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.FitView && window.THREE) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs((window.THREE?[]:["hajj/three.min.js"]).concat(FITJS), go_, function(){ el.innerHTML='<div class="card">'+L2x("Kecergasan gagal dimuatkan","Fitness could not load")+'</div>'; }); } }
// ---------- 0.5.1 FOKUS (focus/focus.js): focus sessions, Pomodoro, Do Not Disturb, focus plans, focus screen lock, Time Nudge.
// It helps the person choose: it never stops or closes other apps.
// ---------- 0.5.14 Derma (Donate) and Hadiah (Gift), from the top bar (give/give.js) ----------
function giveH(){ var h=finH(); h.fetch=nFetch; return h; }
function giveCss(){ if(!document.querySelector('link[href="give/give.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="give/give.css"; document.head.appendChild(lk); }
  if(!document.querySelector('link[href="halal/halal.css"]')){ var lh=document.createElement("link"); lh.rel="stylesheet"; lh.href="halal/halal.css"; document.head.appendChild(lh); } }
function vGive(el, k){ giveCss(); var go_=function(){ if(document.body.contains(el)) try{ GiveView[k](el, giveH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.GiveView && window.DONATE_DATA) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["give/donate_data.js","give/give.js"], go_, function(){ el.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; }); } }
function vDerma(el){ vGive(el, "derma"); }
function vHadiah(el){ vGive(el, "gift"); }
var FOJS=["focus/focus.js"], GWJS=["focus/focus.js","focus/grow.js"];   // 0.6.41: Focus is a self-development hub (focus/grow.js); the old page is its Timer
function focusH(){ var h=finH(); h.S=S; h.ymd=ymd; h.prayerTimes=function(){ return upcoming(4); }; h.pushSchedule=pushSchedule;
  h.setCal=function(s){ SUB2.cal=s; go("cal"); }; h.swUnHtml=swUnHtml; h.swUnBind=swUnBind; h.appPin=appPin; h.openQuran=openQuran; h.usageOk=hasUsageAcc; h.loadJs=loadJs; h.openSide=function(id){ var sn=sideFind(id); if(sn && sn.f) sn.f(); }; return h; }
// 0.5.2 screen-time insights in Statistik (focus/insights.js)
function insH(){ var h=finH(); h.ymd=ymd; h.prCount=prCount; h.quranSec=function(k){ return qListenMap()[k]||0; }; h.pushSchedule=pushSchedule;
  h.focusMin=function(k){ return ((load("ihsan_focus",{})||{}).log||{})[k]||0; };
  h.shareImage=function(url, txt){ if(window.Native && N.shareImage) N.shareImage(url, txt); else { var a=document.createElement("a"); a.href=url; a.download="masa-skrin.png"; document.body.appendChild(a); a.click(); a.remove(); } }; return h; }
// 0.6.44 Time › Meeting (meet/meeting.js): offline meeting notes, recording, live text, import, summary, actions → Planner
function meetH(){ var h=finH(); h.loadJs=loadJs; h.events=function(host){ vMajlis(host); }; h.pinAsk=pinAsk; h.pinHas=pinHas; h.pinSet=pinSet; h.qrSvg=qrSvgApp; h.qrScan=qrScanApp; return h; }
// ---------- 0.7.20 TRIP (trip/trip.js): Umrah DIY + Travel Anywhere (AI trip planner for any destination) ----------
function tripH(){ return {S:S, N:N, load:load, save:save, saveS:saveS, toast:toast, esc:esc, L2x:L2x, en:en_, on:on, off:off, fetch:nFetch, showSheet:showSheet, closeOverlay:closeOverlay, calcDay:calcDay, render:render, dockFix:dockFix,
  umrahHero:umrahHero, openUmrah:function(){ openUmrah(); }, aiSettings:function(){ if(window.AIRun) AIRun.open("trip"); else if(window.openSettings) window.openSettings("ai"); }, goSplit:function(){ SUB2.fin="bahagi"; go("fin"); }}; }
function vTrip(el){ if(!document.querySelector('link[href="trip/trip.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="trip/trip.css"; document.head.appendChild(lk); }
  var go_=function(){ if(document.body.contains(el)) try{ TripView.view(el, tripH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.TripView) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["trip/trip.js"], go_, function(){ el.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; }); } }
function vMeet(el){ if(!document.querySelector('link[href="meet/meeting.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="meet/meeting.css"; document.head.appendChild(lk); }
  var go_=function(){ if(document.body.contains(el)) try{ MeetView.view(el, meetH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.MeetView) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["meet/meeting.js"], go_, function(){ el.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; }); } }
function foCss(){ ["focus/focus.css","focus/grow.css"].forEach(function(f){ if(!document.querySelector('link[href="'+f+'"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href=f; document.head.appendChild(lk); } }); }
function vFocus(el){ foCss(); var go_=function(){ if(document.body.contains(el)) try{ GrowView.view(el, focusH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.FocusView && window.GrowView) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(GWJS, go_, function(){ el.innerHTML='<div class="card">'+L2x("Fokus gagal dimuatkan","Focus could not load")+'</div>'; }); } }
WG["fokus"]=cardW("kal","🎯","Fokus","Focus",function(){
  if(!window.FocusView){ loadJs(FOJS, function(){ if(view==="home") render(); }, function(){}); return '<div class="card mut small" data-act="side:cal/fokus/focus">🎯 …</div>'; }
  var w=FocusView.widget(focusH()), m=w.today, t=m>=60?Math.floor(m/60)+L2x(" j "," h ")+(m%60)+" min":m+" min";
  var l=w.on&&w.end?Math.max(0,Math.round((w.end-Date.now())/60000)):0;
  return '<div class="card" data-act="side:cal/fokus/focus"><h3>🎯 '+L2x("Fokus","Focus")+'</h3>'+(w.on?'<div class="small"><b>'+(w.work?esc(w.name||L2x("Sedang fokus","Focusing")):"☕ "+L2x("Rehat","Break"))+'</b>'+(w.end?' · '+l+L2x(" min lagi"," min left"):'')+'</div>':'<div class="small">▶ '+L2x("Ketik untuk mula fokus","Tap to start focusing")+'</div>')+'<div class="mut tiny">'+L2x("Hari ini: ","Today: ")+t+'</div></div>'; },[4,1],[2,1]);
WG["sc-fokus"]=scW("kal","🎯","Fokus","Focus","side:cal/fokus/focus","Sesi fokus, Pomodoro & kunci skrin fokus","Focus sessions, Pomodoro & focus screen lock");
// ---------- 0.4.0 BUKU (books/books.js): PDF library + reader + PDF tools; files from Share / Open with "My Ihsan Books" ----------
var BKJS=["books/books.js"];
/* 0.5.99 (owner): the complete tutorial as a PDF in Books, built only when asked (tour/guide.js) from the Complete tour's steps */
function guideWhere(g){ if(!g||g==="close") return ""; if(g==="home") return "🏠 "+T("utama"); if(/^side|^nav:/.test(g)) return "☰ "+L2x("Menu kiri","Left menu"); if(/^set/.test(g)) return "⚙ "+L2x("Tetapan","Settings");
  var m=/^tab:(\w+)\/?(\w*)/.exec(g); if(!m) return ""; var t=TABS_ALL.filter(function(x){ return x[0]===m[1]; })[0], sb=(SUBS[m[1]]||[]).filter(function(x){ return x[0]===m[2]; })[0];
  var tn=t?(t[1]+" "+(typeof t[2]==="string"?T(t[2]==="home"?"utama":t[2]):L2x(t[2][0],t[2][1]))):m[1]; return tn+(sb?" › "+sb[1]+" "+L2x(sb[2],sb[3]):""); }
function guideBuild(){ return new Promise(function(res, rej){ tourLoad(function(){ loadJs(["tour/guide.js"], function(){ try{
  var st=IhsanTour._steps("complete").filter(function(s){ return s.ms||s.en; });
  IhsanGuide.build({en:S.lang==="en", ver:APP_VER, L2x:L2x, steps:st, chapters:IhsanTour._chapters?IhsanTour._chapters():[], where:guideWhere}).then(res, rej); }catch(e){ rej(e); } }, rej); }); }); }
function bkH(){ var h=finH(); h.S=S; h.loadJs=loadJs; h.guide=guideBuild; h.guideKey=function(){ return APP_VER+"|"+(S.lang==="en"?"en":"ms"); }; h.fav={has:function(id){ return (SD.fav||[]).indexOf(id)>=0; }, toggle:function(id){ sideBuild(); sideFavToggle(id); return (SD.fav||[]).indexOf(id)>=0; }}; return h; }
function bkCss(){ if(!document.querySelector('link[href="halal/halal.css"]')){ var lh=document.createElement("link"); lh.rel="stylesheet"; lh.href="halal/halal.css"; document.head.appendChild(lh); }   // shared buttons, fields and lists
  if(!document.querySelector('link[href="books/books.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="books/books.css"; document.head.appendChild(lk); } }
function withBooks(fn){ bkCss(); if(window.BooksView) fn(); else loadJs(BKJS, fn, function(){ toast(L2x("Buku gagal dimuatkan","Books could not load")); }); }
function vBooks(el){ el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; withBooks(function(){ if(document.body.contains(el)) try{ BooksView.view(el, bkH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } }); }
function toBooksTab(){ if(S.kidLock) return false; var ov=document.getElementById("overlay"); if(!ov.classList.contains("hidden") && !ov.classList.contains("bkov")){ if(ov._close) ov._close(); else closeOverlay(); } if(!(view==="learn" && SUB2.learn==="buku")){ SUB2.learn="buku"; learnPg=null; learnFrom=null; go("learn"); } return true; }
on("bookstart", function(){ if(toBooksTab()) toast(L2x("Menerima PDF…","Receiving the PDF…")); });
on("book", function(d){ if(!toBooksTab()) return; withBooks(function(){ BooksView.got(d, bkH()); }); });
on("bookimgs", function(d){ if(!toBooksTab()) return; withBooks(function(){ setTimeout(function(){ BooksView.images(d.images||[], bkH()); }, 300); }); });
WG["books"]=cardW("tools","📖","Sambung membaca","Continue reading",function(){
  if(!window.BooksView){ withBooks(function(){ if(view==="home") render(); }); return '<div class="mut small" data-act="q-books">📖 …</div>'; }
  var w=BooksView.widget(bkH()); if(!w) return '<div class="mut small" data-act="q-books">📚 '+L2x("Belum ada buku. Ketik untuk buka PDF.","No books yet. Tap to open a PDF.")+'</div>';
  return '<div class="bkw" data-act="q-book:'+w.id+'" style="display:flex;gap:10px;align-items:center">'+(w.cover?'<img src="'+w.cover+'" alt="" style="width:44px;border-radius:4px;background:#fff">':'')+'<div style="min-width:0"><div class="mut tiny">📖 '+L2x("Sambung membaca","Continue reading")+'</div><b class="small" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(w.name)+'</b><div class="mut tiny">'+L2x("Hlm ","p. ")+w.page+(w.pages?" / "+w.pages:"")+' · '+w.prog+'%</div></div></div>'; },[4,2],[2,1]);
WG["sc-books"]=scW("tools","📚","Buku","Books","q-books","PDF: baca, serlah, tandatangan","PDF: read, highlight, sign");
// ---------- 0.3.0 HAID (period/period.js): haid, nifas, istihadhah (Shafi'i), predictions, ganti puasa, health ----------
var PERJS=["period/period_data.js","period/period.js"];
function perH(){ var h=finH(); h.S=S; h.times=getDay; h.hijri=hijriOf;
  h.addGanti=function(n){ S.ganti=S.ganti||{owe:0,done:[]}; S.ganti.owe=(S.ganti.owe||0)+n; saveS(); };
  h.pause=function(days){ if(days>0){ S.pauseMode="haid"; S.pauseUntil=Date.now()+days*864e5; } else if(S.pauseMode==="haid"){ S.pauseMode=null; S.pauseUntil=0; } saveS(); };
  return h; }
function perCss(){ if(!document.querySelector('link[href="period/period.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="period/period.css"; document.head.appendChild(lk); } }
function vPeriod(el){ perCss(); var go_=function(){ if(document.body.contains(el)) try{ PeriodView.view(el, perH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.PeriodView) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(PERJS, go_, function(){ el.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; }); } }
WG["period"]=cardW("kal","🌸","Haid (hari ini)","Period (today)",function(){
  if(periodHidden()) return '<div class="mut small" data-act="q-period">🌸 '+L2x("Tab Haid disembunyikan","The Period tab is hidden")+'</div>';
  if(!window.PeriodView){ loadJs(PERJS, function(){ if(view==="home") render(); }, function(){}); return '<div class="mut small" data-act="q-period">🌸 …</div>'; }
  var t=PeriodView.widget(perH()); return '<div data-act="q-period"><div class="mut tiny">🌸 '+L2x("Haid","Period")+'</div><div class="small"><b>'+esc(t||"")+'</b></div></div>'; },[2,1],[2,1]);
WG["sc-period"]=scW("kal","🌸","Haid","Period","q-period","Haid, istihadhah & ganti puasa","Periods, istihadhah & make-up fasts");
// ---------- 0.30.0 STATISTIK ----------
var STV={p:"d", d:null, m:null, y:null, mt:"steps"}, SCR=load("ihsan_screen",{});
function qListenMap(){ try{ return JSON.parse((window.Native && N.qListen)?N.qListen():"{}")||{}; }catch(e){ return {}; } }
function stepMap(){ try{ return JSON.parse((window.Native && N.stepsDays)?N.stepsDays():"{}")||{}; }catch(e){ return {}; } }
function hasUsageAcc(){ return !!(window.Native && N.hasPerm && N.hasPerm("usage")); }
function screenMap(from, to){
  if(hasUsageAcc() && N.screenDays){ try{ var o=JSON.parse(N.screenDays(from,to)||"{}"), t=ymd(new Date()), ch=false; for(var k in o){ if(k<t){ if(SCR[k]!==o[k]){ SCR[k]=o[k]; ch=true; } } } if(ch) save("ihsan_screen",SCR); var r={}; for(var k2 in SCR) r[k2]=SCR[k2]; for(var k3 in o) r[k3]=o[k3]; return r; }catch(e){} }
  return SCR; }
function prCount(ds){ var f=fardDay(ds), n=0; PR.forEach(function(k){ if(f[k]&&f[k].c>=f[k].tg) n++; }); return n; }
function fmtSteps(n){ n=Math.round(n||0); return n>=10000?(n/1000).toFixed(n>=100000?0:1)+"k":String(n).replace(/\B(?=(\d{3})+(?!\d))/g,","); }
function hmShort(ms){ var m=Math.round((ms||0)/60000); return m>=60?Math.floor(m/60)+"j "+(m%60)+"m":m+"m"; }
var STM=[["steps","🚶",["Langkah","Steps"]],["active","⚡",["Aktif","Active"]],["screen","📱",["Skrin","Screen"]],["app","⏱",["Aplikasi","App"]],["prayer","🕌",["Solat","Prayers"]],["quran","🎧",["Al-Quran","Quran"]]];
function stVal(mt, k, D){ if(mt==="steps") return (D.st[k]||{}).s||0; if(mt==="active") return (D.st[k]||{}).a||0; if(mt==="screen") return D.sc[k]||0; if(mt==="app") return useSec(k); if(mt==="prayer") return prCount(k); if(mt==="quran") return D.ql[k]||0; return 0; }
function stFmt(mt, v){ if(mt==="steps") return fmtSteps(v); if(mt==="active") return Math.round(v)+L2x(" min"," min"); if(mt==="screen") return hmShort(v); if(mt==="app") return hmShort(v*1000); if(mt==="prayer") return String(Math.round(v)); if(mt==="quran") return Math.round(v/60)+"m"; return String(v); }
function stShort(mt, v){ if(!v) return ""; if(mt==="steps") return v>=1000?(v/1000).toFixed(v>=10000?0:1)+"k":String(v); if(mt==="screen") return Math.round(v/360000)/10+"j"; if(mt==="app") return Math.round(v/60)+"m"; if(mt==="quran") return Math.round(v/60)+"m"; return String(Math.round(v)); }
// 0.5.73: what the phone's step counter is doing, so "0 steps" is never a mystery
function stepStatus(){ if(!window.Native || !N.stepsInfo) return ""; var o={}; try{ o=JSON.parse(N.stepsInfo()||"{}"); }catch(e){}
  var ago=function(t){ var m=Math.round((Date.now()-t)/60000); return m<1?L2x("baru tadi","just now"):m<60?m+L2x(" min lalu"," min ago"):Math.round(m/60)+L2x(" jam lalu"," h ago"); }, msg="";
  if(o.perm===false) msg="⚠️ "+L2x("Kebenaran aktiviti fizikal ditutup. Benarkan dalam Tetapan telefon › Aplikasi › My Ihsan › Kebenaran.","Physical activity permission is off. Allow it in phone Settings › Apps › My Ihsan › Permissions.");
  else if(!o.startT) msg="⏳ "+L2x("Menunggu bacaan pertama dari sensor. Berjalan beberapa langkah, kemudian tekan Baca sekarang.","Waiting for the first reading from the sensor. Walk a few steps, then tap Read now.");
  else { var st=new Date(o.startT), today=ymd(st)===ymd(new Date());
    msg=(today?"▶️ "+L2x("Mula mengira pada ","Counting started at ")+st.toLocaleTimeString(locTag(),{hour:"2-digit",minute:"2-digit"})+L2x(" (langkah sebelum itu tidak dikira). "," (steps before that are not counted). "):"")+
      (o.okT?"✓ "+L2x("Bacaan terakhir ","Last reading ")+ago(o.okT):"")+(o.failT && o.failT>o.okT ? " · ⚠️ "+L2x("sensor tidak menjawab ","the sensor did not answer ")+ago(o.failT)+L2x(": berjalan sedikit dan cuba lagi",": walk a little and try again") : ""); }
  if(arguments[0]==="msg") return msg;
  return '<div class="mut tiny stStat" style="margin-top:6px">'+msg+' <button class="linkb" id="stNow">↻ '+L2x("Baca sekarang","Read now")+'</button></div>'; }
/* 0.6.1 (owner): steps chart in the Stats day view: Daily (7 days) › Weekly (8 weeks) › Monthly (6 months); swipe the chart to switch */
function stepsChart(st, sp, goal, k){ var sd=parseYmd(k), bars=[], i;
  var sum=function(a,b){ var t=0; for(var d=new Date(a); ymd(d)<=ymd(b); d=addDays(d,1)) t+=(st[ymd(d)]||{}).s||0; return t; };
  if(sp==="w"){ var mon=addDays(sd,-((sd.getDay()+6)%7)); for(i=7;i>=0;i--){ var a=addDays(mon,-7*i), b=addDays(a,6); bars.push({v:sum(a,b), l:a.getDate()+"/"+(a.getMonth()+1), on:!i}); } }
  else if(sp==="m"){ for(i=5;i>=0;i--){ var m0=new Date(sd.getFullYear(), sd.getMonth()-i, 1), m1=new Date(m0.getFullYear(), m0.getMonth()+1, 0); bars.push({v:sum(m0,m1), l:m0.toLocaleDateString(locTag(),{month:"short"}), on:!i}); } }
  else { for(i=6;i>=0;i--){ var d=addDays(sd,-i); bars.push({v:(st[ymd(d)]||{}).s||0, l:d.toLocaleDateString(locTag(),{weekday:"narrow"}), k:ymd(d), on:!i}); } }
  var mx=Math.max.apply(null, bars.map(function(x){ return x.v; }).concat([sp==="d"?goal:1])), gl=sp==="d"?Math.round(goal*100/mx):-1;
  return '<div class="stBars">'+(gl>=0?'<div class="stGl" style="bottom:calc('+gl+'% * .78 + 18px)"><span>🎯</span></div>':'')+bars.map(function(x){ var pc=Math.round(x.v*100/mx);
    return '<div class="stBr'+(x.on?' on':'')+(sp==="d"&&x.v>=goal?' hit':'')+'"'+(x.k?' data-std2="'+x.k+'"':'')+'><em>'+(x.v?fmtSteps(x.v):'')+'</em><span><i style="height:'+pc+'%"></i></span><small>'+esc(x.l)+'</small></div>'; }).join("")+'</div>'; }
function vStats(el){
  var now=new Date(), today=ymd(now); if(!STV.d) STV.d=today; if(!STV.m) STV.m=today.slice(0,7); if(!STV.y) STV.y=now.getFullYear();
  var en=en_(), MO=en?ME:MS, D={st:stepMap(), ql:qListenMap(), sc:{}};
  var h='<div class="stTop"><div class="chips stP">'+[["d","Hari","Day"],["m","Bulan","Month"],["y","Tahun","Year"]].map(function(x){ return '<button class="chip g3d'+(STV.p===x[0]?" on":"")+'" data-stp="'+x[0]+'">'+L2x(x[1],x[2])+'</button>'; }).join("")+'</div>';
  var lab, canNext;
  if(STV.p==="d"){ var sd=parseYmd(STV.d); lab=sd.toLocaleDateString(locTag(),{weekday:"long",day:"numeric",month:"long",year:"numeric"}); canNext=STV.d<today; }
  else if(STV.p==="m"){ var mp=STV.m.split("-"); lab=MO[+mp[1]-1]+" "+mp[0]; canNext=STV.m<today.slice(0,7); }
  else { lab=String(STV.y); canNext=STV.y<now.getFullYear(); }
  // 0.6.2 (owner): the Day view has no date line and no date wheel (the cards show the day); ‹ › and a Today chip move between days
  h+='<div class="stNav'+(STV.p==="d"?' stNavD':'')+'"><button class="chip g3d" data-stn="-1">‹</button>'+(STV.p==="d"?(STV.d!==today?'<button class="chip g3d" id="stToday">'+L2x("Hari ini","Today")+'</button>':'<span></span>'):'<b>'+esc(lab)+'</b>')+'<button class="chip g3d" data-stn="1"'+(canNext?'':' disabled')+'>›</button></div></div><div id="stBox">';
  if(STV.p==="d"){
    var k=STV.d; D.sc=screenMap(k,k);
    var stp=D.st[k]||{s:0,a:0}, goal=S.stepGoal||6000, on=!!S.stepsOn, nat=!!(window.Native && N.stepsDays), sens=nat&&N.stepsSensor?N.stepsSensor():nat;
    // 0.6.1 (owner): Time spent first; steps: number with active minutes beside it, goal next to Read now, a swipeable chart, the how-it-works text behind ⓘ
    h+=usageCard(k,true);
    var SP=STV.sp||"d", stMsg=on?stepStatus("msg"):"";
    h+='<div class="card stCard"><div class="stHd"><h3>🚶 '+L2x("Langkah","Steps")+'</h3>'+(sens||!nat?'<span class="stSw"><b class="'+(on?'on':'')+'">'+(on?L2x("Hidup","On"):L2x("Tutup","Off"))+'</b>'+sw("stSwI", on)+'</span>':'')+'</div>'+
      '<div class="stTopRow'+(on?'':' stOff')+'"><b class="ubig">'+fmtSteps(stp.s)+'</b><span class="mut small">'+L2x("langkah","steps")+'</span><b class="stMin">⚡ '+(stp.a||0)+' min</b></div>'+
      '<div class="ubar1"><i style="width:'+Math.min(100,Math.round(stp.s*100/goal))+'%"></i></div>'+
      '<div class="stGoalRow"><button class="chip g3d" id="stGoal">🎯 '+fmtSteps(goal)+'</button>'+(on&&window.Native&&N.stepsNow?'<button class="chip g3d" id="stNow">↻ '+L2x("Baca sekarang","Read now")+'</button>':'')+'<span style="flex:1"></span><button class="rInfo'+(STV.stInfo?' on':'')+'" id="stInfo" aria-label="ⓘ">ⓘ</button></div>'+
      '<div class="stSeg">'+[["d",L2x("Harian","Daily")],["w",L2x("Mingguan","Weekly")],["m",L2x("Bulanan","Monthly")]].map(function(x){ return '<button class="chip'+(SP===x[0]?' on':'')+'" data-ssp="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>'+
      '<div class="stChart noswipe" id="stChart">'+stepsChart(D.st, SP, goal, k)+'</div>'+
      '<div class="stMore mut tiny"'+(STV.stInfo?'':' hidden')+'>'+(stMsg?'<div>'+stMsg+'</div>':'')+(on?'':'<div>'+(sens||!nat?L2x("Pengiraan langkah DITUTUP. Hidupkan suis untuk mula mengira dengan sensor telefon. Data kekal dalam telefon.","Step counting is OFF. Turn on the switch to start counting with the phone's sensor. The data stays on the phone."):L2x("Telefon ini tiada sensor langkah.","This phone has no step sensor."))+'</div>')+
        '<div>'+L2x("Masa aktif ialah minit berjalan pada kadar 80+ langkah seminit (anggaran). Dikemas kini lebih kurang setiap jam. Leret carta untuk mingguan dan bulanan.","Active time is minutes walked at 80+ steps a minute (estimate). Updated about every hour. Swipe the chart for weekly and monthly.")+'</div></div></div>';
    h+='<details class="card stFold" id="stScr"'+(STV.scOpen?' open':'')+'><summary><h3>📱 '+L2x("Masa skrin telefon","Phone screen time")+'</h3></summary>';
    if(!hasUsageAcc()) h+='<div class="small">'+L2x("Untuk melihat masa skrin seluruh telefon, benarkan “Akses penggunaan” untuk My Ihsan dalam Tetapan telefon. Aplikasi hanya membaca jumlah masa, dan tiada data dihantar keluar.","To see whole-phone screen time, allow “Usage access” for My Ihsan in phone Settings. The app only reads time totals, and nothing leaves the phone.")+'</div><button class="btn alt full g3d" id="stUse" style="margin-top:8px">⚙ '+L2x("Benarkan akses penggunaan","Allow usage access")+'</button>';
    else { var apps=[]; try{ apps=JSON.parse(N.topApps(k)||"[]"); }catch(e){}
      h+='<div class="urow"><div><div class="mut tiny">'+L2x("Skrin hidup","Screen on")+'</div><div class="ubig">'+hmShort(D.sc[k]||0)+'</div></div><div><div class="mut tiny">'+L2x("Dalam My Ihsan","In My Ihsan")+'</div><div class="ubig gold"'+(k===today?' data-ulive="1"':'')+'>'+durHMS(k===today?usageLive():useSec(k))+'</div></div></div>'+
        (apps.length?'<div class="uvs">'+apps.map(function(a){ return '<span>'+esc(a.n)+' <b>'+hmShort(a.ms)+'</b></span>'; }).join("")+'</div>':''); }
    h+='</details>';
    if(hasUsageAcc() && N.focusInsights) h+='<div id="stIns"></div>';
    var pc=prCount(k);
    h+='<div class="card"><h3>🕌 '+L2x("Solat hari itu","Prayers that day")+'</h3><div class="stPr"><b>'+pc+'</b><span>/ 5</span></div>'+prRegister(k,false);
    var pl=plogDay(k); if(pl.length) h+='<div class="plist">'+pl.map(function(r){ return '<div class="pli"><span>'+hm12(r.t0)+'</span><b>'+esc(r.n)+'</b><span class="mut tiny">'+L2x("waktu ","in ")+T(r.w)+'</span><span>'+(Math.round(r.c*2)/2)+'/'+r.tg+'</span><span>'+durEn(r.sec)+'</span></div>'; }).join("")+'</div>';
    h+='</div>';
    var qv=D.ql[k]||0; h+='<div class="card"><h3>🎧 '+L2x("Dengar Al-Quran","Quran listening")+'</h3><div class="ubig">'+Math.round(qv/60)+' min</div></div>';
  } else {
    var from, to, cells=[], mt=STV.mt;
    h+='<div class="chips stM">'+STM.map(function(x){ return '<button class="chip'+(mt===x[0]?" on":"")+'" data-stm="'+x[0]+'">'+x[1]+' '+L2x(x[2][0],x[2][1])+'</button>'; }).join("")+'</div>';
    if(STV.p==="m"){
      var mp2=STV.m.split("-"), y=+mp2[0], m=+mp2[1]-1, dim=new Date(y,m+1,0).getDate(); from=ymd(new Date(y,m,1)); to=ymd(new Date(y,m,dim)); D.sc=screenMap(from,to);
      var vals=[], mx=0, sum=0, cnt=0, best=null;
      for(var d=1; d<=dim; d++){ var kk=ymd(new Date(y,m,d)), v=kk>today?0:stVal(mt,kk,D); vals.push([kk,v]); mx=Math.max(mx,v); if(v){ sum+=v; cnt++; if(!best||v>best[1]) best=[kk,v]; } }
      var lead=(new Date(y,m,1).getDay()+6)%7;
      // 0.6.1 (owner): all six stats as coloured 3D lines across the month's days (three.js, stats/stats3d.js)
      var COLS={steps:"#3fb37f",active:"#f2c14e",screen:"#4f8ce0",app:"#b072e0",prayer:"#e07a5f",quran:"#2fbfb0"};
      STV.s3={days:dim, sel:mt, series:STM.map(function(x){ var v=[]; for(var dd3=1; dd3<=dim; dd3++){ var k3=ymd(new Date(y,m,dd3)); v.push(k3>today?null:stVal(x[0],k3,D)); }
        return {id:x[0], ic:x[1], nm:L2x(x[2][0],x[2][1]), col:COLS[x[0]], v:v, f:(function(id){ return function(n){ return stFmt(id,n); }; })(x[0])}; })};
      h+='<div class="card st3c"><h3>📈 '+L2x("Bulan ini dalam 3D","This month in 3D")+'</h3><div class="st3d noswipe" id="st3d"></div><div class="st3leg">'+STM.map(function(x){ return '<button class="'+(mt===x[0]?'on':'')+'" data-stm="'+x[0]+'"><i style="background:'+COLS[x[0]]+'"></i>'+x[1]+' '+L2x(x[2][0],x[2][1])+'</button>'; }).join("")+'</div><div class="mut tiny">'+L2x("Setiap garis diukur dengan hari terbaiknya sendiri. Seret untuk pusing.","Each line is scaled to its own best day. Drag to turn it.")+'</div></div>';
      h+='<div class="card"><div class="urow3"><div><b>'+stFmt(mt,sum)+'</b><span class="mut tiny">'+L2x("jumlah","total")+'</span></div><div><b>'+stFmt(mt,cnt?sum/cnt:0)+'</b><span class="mut tiny">'+L2x("purata sehari","daily average")+'</span></div><div><b>'+(best?parseYmd(best[0]).getDate()+" "+MO[m].slice(0,3):"–")+'</b><span class="mut tiny">'+L2x("hari terbaik","best day")+'</span></div></div>';
      h+='<div class="stGrid">'+(en?["M","T","W","T","F","S","S"]:["I","S","R","K","J","S","A"]).map(function(x){ return '<div class="stH">'+x+'</div>'; }).join("");
      for(var z=0;z<lead;z++) h+='<div></div>';
      vals.forEach(function(x){ var a=mx?x[1]/mx:0; h+='<button class="stC'+(x[0]===today?" today":"")+(x[0]>today?" fut":"")+'" data-std="'+x[0]+'" style="--a:'+(x[1]?0.18+a*0.82:0)+'"><b>'+parseYmd(x[0]).getDate()+'</b><small>'+stShort(mt,x[1])+'</small></button>'; });
      h+='</div><div class="mut tiny" style="margin-top:6px">'+L2x("Ketik hari untuk butiran. Leret kiri/kanan untuk bulan lain.","Tap a day for details. Swipe left/right for other months.")+'</div></div>';
    } else {
      var yy=STV.y; from=yy+"-01-01"; to=yy+"-12-31"; D.sc=screenMap(from,to);
      var ms=[], mx2=0, tot=0, days=0;
      for(var mo=0; mo<12; mo++){ var dm=new Date(yy,mo+1,0).getDate(), sm=0, c2=0; for(var dd=1; dd<=dm; dd++){ var k2=ymd(new Date(yy,mo,dd)); if(k2>today) break; var v2=stVal(mt,k2,D); if(v2){ sm+=v2; c2++; } } ms.push([sm,c2]); mx2=Math.max(mx2,sm); tot+=sm; days+=c2; }
      h+='<div class="card"><div class="urow3"><div><b>'+stFmt(mt,tot)+'</b><span class="mut tiny">'+L2x("jumlah","total")+'</span></div><div><b>'+stFmt(mt,days?tot/days:0)+'</b><span class="mut tiny">'+L2x("purata sehari","daily average")+'</span></div><div><b>'+days+'</b><span class="mut tiny">'+L2x("hari direkod","days recorded")+'</span></div></div>';
      h+='<div class="stYear">'+ms.map(function(x,i){ return '<button class="stMo" data-stmo="'+i+'"><div class="stBar"><i style="height:'+(mx2?Math.round(x[0]*100/mx2):0)+'%"></i></div><small>'+MO[i].slice(0,3)+'</small><em>'+stShort(mt,x[0])+'</em></button>'; }).join("")+'</div>'+
        '<div class="mut tiny" style="margin-top:6px">'+L2x("Ketik bulan untuk butiran. Leret untuk tahun sebelumnya dan seterusnya.","Tap a month for details. Swipe for earlier and later years.")+'</div></div>';
    }
  }
  h+='</div>';
  el.innerHTML=h+'<div class="dock">'+trackDock()+'</div>'; bindTrk(el);   // 0.7.77: Time > Track
  var s3b=el.querySelector("#st3d"); if(s3b && STV.s3){ var s3go=function(){ if(document.body.contains(s3b) && window.Stats3D) Stats3D.mount(s3b, STV.s3); };
    if(window.THREE && window.Stats3D) s3go(); else loadJs([window.THREE?null:"hajj/three.min.js","stats/stats3d.js"].filter(Boolean), s3go, function(){}); }
  var ib=el.querySelector("#stIns"); if(ib){ var insGo=function(){ if(!document.body.contains(ib)) return; if(STV.insW){ STV.insW=false; InsightsView.week(); } try{ InsightsView.render(ib, insH(), STV.d); }catch(err){ console.error(err); } };
    if(window.InsightsView) insGo(); else { foCss(); loadJs(["focus/insights.js"], insGo, function(){}); } }
  var mut=function(dir){ if(STV.p==="d"){ var nd=ymd(addDays(parseYmd(STV.d),dir)); if(nd>today) return false; STV.d=nd; } else if(STV.p==="m"){ var p2=STV.m.split("-"), dt=new Date(+p2[0],+p2[1]-1+dir,1), nm=ymd(dt).slice(0,7); if(nm>today.slice(0,7)) return false; STV.m=nm; } else { if(STV.y+dir>now.getFullYear()) return false; STV.y+=dir; } return true; };
  var go_=function(dir, sw2){ if(!mut(dir)) return; vStats(el); dockFix(); var b=el.querySelector("#stBox"); if(b) IbSwipe.inFrom(b, sw2||-dir); };
  el.querySelectorAll("[data-stp]").forEach(function(b){ b.onclick=function(){ STV.p=b.getAttribute("data-stp"); vStats(el); }; });
  el.querySelectorAll("[data-stn]").forEach(function(b){ b.onclick=function(){ go_(+b.getAttribute("data-stn")); }; });
  el.querySelectorAll("[data-stm]").forEach(function(b){ b.onclick=function(){ STV.mt=b.getAttribute("data-stm"); vStats(el); }; });
  el.querySelectorAll("[data-std]").forEach(function(b){ b.onclick=function(){ var d=b.getAttribute("data-std"); if(d>today) return; STV.d=d; STV.p="d"; vStats(el); document.getElementById("view").scrollTop=0; }; });
  el.querySelectorAll("[data-stmo]").forEach(function(b){ b.onclick=function(){ var m=+b.getAttribute("data-stmo"); STV.m=STV.y+"-"+pad(m+1); STV.p="m"; vStats(el); }; });
  var sci=el.querySelector("#stScr"); if(sci) sci.addEventListener("toggle", function(){ STV.scOpen=sci.open; });
  var sinf=el.querySelector("#stInfo"); if(sinf) sinf.onclick=function(){ STV.stInfo=!STV.stInfo; sinf.classList.toggle("on", STV.stInfo); var m=el.querySelector(".stMore"); if(m) m.hidden=!STV.stInfo; };
  var SPS=["d","w","m"], spGo=function(sp){ STV.sp=sp; var c=el.querySelector("#stChart"); if(c){ c.innerHTML=stepsChart(stepMap(), sp, S.stepGoal||6000, STV.d); bindBars(); }
    el.querySelectorAll("[data-ssp]").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-ssp")===sp); }); };
  function bindBars(){ el.querySelectorAll("[data-std2]").forEach(function(x){ x.onclick=function(){ var d=x.getAttribute("data-std2"); if(d===STV.d||d>today) return; STV.d=d; vStats(el); }; }); }
  bindBars();
  el.querySelectorAll("[data-ssp]").forEach(function(x){ x.onclick=function(){ spGo(x.getAttribute("data-ssp")); }; });
  var sch=el.querySelector("#stChart"); if(sch){ var sx=null, sy=0; sch.addEventListener("touchstart", function(e){ sx=e.touches[0].clientX; sy=e.touches[0].clientY; e.stopPropagation(); }, {passive:true});
    sch.addEventListener("touchend", function(e){ if(sx==null) return; var dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy; sx=null; e.stopPropagation(); if(Math.abs(dx)<40||Math.abs(dy)>Math.abs(dx)) return;
      var i=SPS.indexOf(STV.sp||"d")+(dx<0?1:-1); if(i<0||i>2) return; spGo(SPS[i]); var c=el.querySelector("#stChart .stBars"); if(c && c.animate) c.animate([{transform:"translateX("+(dx<0?40:-40)+"px)",opacity:.3},{transform:"none",opacity:1}],{duration:220,easing:"ease-out"}); }); }
  var stT=el.querySelector("#stToday"); if(stT) stT.onclick=function(){ STV.d=today; vStats(el); };
  var di=el.querySelector("#stDate"); if(di) di.onchange=function(){ if(di.value && di.value<=today){ STV.d=di.value; vStats(el); } };
  // 0.33.0: the period follows the finger
  var nxtOk=function(dir){ if(STV.p==="d") return ymd(addDays(parseYmd(STV.d),dir))<=today; if(STV.p==="m"){ var p2=STV.m.split("-"); return ymd(new Date(+p2[0],+p2[1]-1+dir,1)).slice(0,7)<=today.slice(0,7); } return STV.y+dir<=now.getFullYear(); };
  IbSwipe(el.querySelector("#stBox"), {can:function(s){ return nxtOk(s<0?1:-1); }, go:function(s){ go_(s<0?1:-1, s); }, find:function(){ return el.querySelector("#stBox"); },
    peek:function(s){ var v0=JSON.stringify(STV), b=IbSwipe.shot(function(){ mut(s<0?1:-1); }, vStats, function(){ var v1=JSON.parse(v0); for(var k in v1) STV[k]=v1[k]; }); return b && b.querySelector("#stBox"); }});
  var sn=el.querySelector("#stNow"); if(sn) sn.onclick=function(){ if(!N.stepsNow) return; sn.textContent="…"; var done=false, hs=function(){ off("steps",hs); done=true; vStats(el); }; onEv("steps",hs); N.stepsNow(); setTimeout(function(){ if(done) return; off("steps",hs); if(document.body.contains(el)) vStats(el); }, 11000); };
  // 0.5.73: while Stats is open, read the counter every minute so the number moves as you walk
  if(S.stepsOn && N.stepsNow && !vStats.t){ vStats.t=setInterval(function(){ if(!(view==="cal" && SUB2.cal==="statistik") || !document.body.contains(el)){ clearInterval(vStats.t); vStats.t=0; return; } var hs=function(){ off("steps",hs); if(document.body.contains(el) && document.getElementById("overlay").classList.contains("hidden")) vStats(el); }; onEv("steps",hs); N.stepsNow(); }, 60000); }
  var ssw=el.querySelector("#stSwI"); if(ssw) ssw.onchange=function(){ if(ssw.checked){ var t=document.createElement("button"); t.id="stOn"; t.style.display="none"; el.appendChild(t); bindOn(t); t.click(); } else { S.stepsOn=false; saveS(); if(N.stepsOn) N.stepsOn(false); vStats(el); toast(L2x("Pengiraan langkah ditutup","Step counting turned off")); } };
  function bindOn(so){ so.onclick=function(){ var en_on=function(){ S.stepsOn=true; saveS(); if(N.stepsOn) N.stepsOn(true); if(N.stepsNow){ var hs=function(){ off("steps",hs); vStats(el); }; onEv("steps",hs); N.stepsNow(); } vStats(el); };
    if(!window.Native || !N.hasPerm || N.hasPerm("steps")) en_on(); else { var hp=function(p){ if(p.which!=="steps") return; off("perm",hp); if(p.granted) en_on(); else permHelp("steps"); }; onEv("perm",hp); N.requestPerm("steps"); } }; }
  var so0=el.querySelector("#stOn"); if(so0) bindOn(so0);
  // 0.5.20: when Android will not ask again (denied twice), or a sideloaded test app hits "Restricted setting", show the way through
  function permHelp(kind){ var steps=kind==="steps"?
      L2x("Android tidak akan bertanya lagi selepas ditolak dua kali. Buka Maklumat aplikasi › Kebenaran › Aktiviti fizikal › Benarkan.","Android stops asking after two refusals. Open App info › Permissions › Physical activity › Allow.")
      :L2x("Dalam senarai Akses penggunaan, pilih My Ihsan dan hidupkan. Jika tertulis \"Tetapan terhad\" (aplikasi dipasang dari fail): buka Maklumat aplikasi › ⋮ (atas kanan) › Benarkan tetapan terhad, kemudian cuba lagi.","In the Usage access list, pick My Ihsan and switch it on. If it says \"Restricted setting\" (an app installed from a file): open App info › ⋮ (top right) › Allow restricted settings, then try again.");
    var ov=showSheet(kind==="steps"?"🚶 "+L2x("Kiraan langkah","Step counting"):"📱 "+L2x("Masa skrin","Screen time"), '<div class="small" style="line-height:1.6">'+steps+'</div><div class="btns" style="margin-top:10px"><button class="btn gold g3d" id="phApp">⚙️ '+L2x("Buka Maklumat aplikasi","Open App info")+'</button>'+(kind==="usage"?'<button class="btn alt g3d" id="phUse">📱 '+L2x("Akses penggunaan","Usage access")+'</button>':'')+'</div>');
    ov.querySelector("#phApp").onclick=function(){ N.requestPerm("appinfo"); closeOverlay(); var hr=function(){ off("resume",hr); vStats(el); }; on("resume",hr); };
    var pu=ov.querySelector("#phUse"); if(pu) pu.onclick=function(){ N.requestPerm("usage"); closeOverlay(); var hr=function(){ off("resume",hr); vStats(el); }; on("resume",hr); }; }
  window.__permHelp=permHelp;
  var sg=el.querySelector("#stGoal"); if(sg) sg.onclick=function(){ var v=prompt(L2x("Sasaran langkah sehari","Daily step goal"), S.stepGoal||6000); if(v && +v>0){ S.stepGoal=Math.round(+v); saveS(); vStats(el); } };
  var su=el.querySelector("#stUse"); if(su) su.onclick=function(){ if(!(window.Native && N.requestPerm)) return; var tries=(S.useTries||0); S.useTries=tries+1; saveS();
    if(tries>=1){ permHelp("usage"); return; } N.requestPerm("usage"); var hr=function(){ off("resume",hr); if(N.hasPerm && !N.hasPerm("usage")) permHelp("usage"); vStats(el); }; on("resume",hr); };
}
on("resume", function(){ if(S.stepsOn && window.Native && N.stepsNow && view==="cal" && SUB2.cal==="statistik"){ var hs=function(){ off("steps",hs); render(); }; onEv("steps",hs); N.stepsNow(); } });
function qListenCard(){ var o={}; try{ o=JSON.parse((window.Native && N.qListen)?N.qListen():"{}")||{}; }catch(e){}
  var t=new Date(), wk=0, mo=0, all=0, bars='', mx=1, d7=[]; for(var i=6;i>=0;i--){ var v=o[ymd(addDays(t,-i))]||0; d7.push(v); mx=Math.max(mx,v); }
  for(var k in o){ all+=o[k]; if(k.slice(0,7)===ymd(t).slice(0,7)) mo+=o[k]; } d7.forEach(function(v){ wk+=v; });
  d7.forEach(function(v,i){ bars+='<div class="qday"><i style="height:'+Math.round(v*100/mx)+'%"></i><small>'+addDays(t,i-6).getDate()+'</small></div>'; });
  var m=function(s){ return Math.round(s/60)+" "+L2x("min","min"); };
  return '<div class="card"><h3>🎧 '+L2x("Dengar Al-Quran","Quran listening")+'</h3><div class="urow"><div><div class="mut tiny">'+L2x("Hari ini","Today")+'</div><div class="ubig">'+m(o[ymd(t)]||0)+'</div></div><div><div class="mut tiny">'+L2x("7 hari","7 days")+'</div><div class="ubig gold">'+m(wk)+'</div></div></div>'+
    '<div class="qdays">'+bars+'</div><div class="mut tiny">'+L2x("Bulan ini ","This month ")+m(mo)+' · '+L2x("Jumlah ","Total ")+m(all)+'. '+L2x("Dikira ketika bacaan ayat Al-Quran dimainkan dalam aplikasi, termasuk ketika skrin tertutup.","Counted while Quran ayat audio plays in the app, including with the screen off.")+'</div></div>'; }
function weekFard(){ var t=new Date(), mon=addDays(t,-((t.getDay()+6)%7)), n=0; for(var i=0;i<7;i++){ var f=fardDay(ymd(addDays(mon,i))); PR.forEach(function(k){ if(f[k]&&f[k].c>=f[k].tg) n++; }); } return n; }
// usage with a live seconds counter
function usageLive(){ var u=useSec(ymd(new Date())); if(uOn) u+=Math.max(0,Math.min(90000,Date.now()-uMark))/1000; return u; }
function durHMS(sec){ sec=Math.floor(sec||0); var h=Math.floor(sec/3600), m=Math.floor(sec%3600/60), s=sec%60; return (h?h+":"+pad(m):m)+":"+pad(s); }
setInterval(function(){ var e=document.querySelectorAll("[data-ulive]"); if(!e.length) return; var v=durHMS(usageLive()); for(var i=0;i<e.length;i++) e[i].textContent=v; }, 1000);
function wUsage(w,h){ usageFlush(); var k=ymd(new Date()), u=useSec(k), p=plogSec(k), y=useSec(ymd(addDays(new Date(),-1)));
  return '<div class="card wuse" data-wsc="sc-stat"><div class="mut tiny">⏱ '+L2x("Hari ini","Today")+'</div><div class="ubig" data-ulive="1">'+durHMS(usageLive())+'</div>'+(h>=2?'<div class="ubar1"><i style="width:'+Math.min(100,Math.round(u*100/Math.max(u,y,1800)))+'%"></i></div><div class="mut tiny">'+L2x("Solat ","Prayer ")+durEn(p)+' · '+L2x("semalam ","yesterday ")+durEn(y)+'</div>':'')+'</div>'; }

// ---------- ALAT: Halal / Saham / Cari / Kad / Senyap ----------
var KOM=["keluarga","kumpulan"];   // 0.7.75 (owner): Social became Life; Events moved to Time › Gather
function vAlat(el){
  var s=SUB2.alat;
  if(KOM.indexOf(s)>=0){ // 0.7.75 (owner): Tools › Life: Family tree · Birthdays · Baby · Care · Pets · Groups (no Family level in between)
    var LIFE=[["tree","🌳","Keluarga","Family"],["bday","🎂","Hari lahir","Birthdays"],["baby","👶","Bayi","Baby"],["care","🩺","Jaga","Care"],["pets","🐾","Haiwan","Pets"],["kumpulan","👥","Kumpulan","Groups"]].filter(function(x){ return !(x[0]==="kumpulan" && (S.kidLock || (WEB && WEB_OFF.indexOf("kumpulan")>=0))); });
    var cur=s==="kumpulan"?"kumpulan":(SUB2.life||"tree");
    el.innerHTML='<div class="dock komSeg"><div class="lfNav" style="grid-template-columns:repeat('+LIFE.length+',minmax(0,1fr))">'+LIFE.map(function(x){ return '<button class="'+(cur===x[0]?"on":"")+'" data-kom="'+x[0]+'"><span>'+x[1]+'</span>'+esc(L2x(x[2],x[3]))+'</button>'; }).join("")+'</div></div><div id="komHost"></div>';   // 0.7.76 (owner): one row of 6, label under the icon
    el.querySelectorAll("[data-kom]").forEach(function(b){ b.onclick=function(){ var k=b.getAttribute("data-kom"); if(k==="kumpulan") SUB2.alat="kumpulan"; else { SUB2.alat="keluarga"; SUB2.life=k; } render(); document.getElementById("view").scrollTop=0; }; });
    var kh=el.querySelector("#komHost"); if(cur==="kumpulan") vGroups(kh); else if(cur==="pets") petMount(kh); else { window.FamOpenSec=cur; vFam(kh); } return; }
  if(s==="kewangan"){
    // 0.5.13 (Ihsan): Hutang … Tukaran as tabs on top; swipe or the ◀ ▶ arrows at the bottom move between them
    if(SUB2.fin==="saham"){ SUB2.fin="tukaran"; finStk=true; }
    var FL=window.l3Keep(SUBS.fin, "fin", SUB2.fin), fi=function(){ var i=0; FL.forEach(function(x, k){ if(x[0]===SUB2.fin) i=k; }); return i; };
    el.innerHTML='<div class="dock fintabs"><div class="chips">'+FL.map(function(x){ return '<button class="chip g3d'+(SUB2.fin===x[0]?" on":"")+'" data-fs="'+x[0]+'">'+x[1]+' '+esc(subName(x))+'</button>'; }).join("")+'</div></div><div id="finHost"></div>';
    el.querySelectorAll("[data-fs]").forEach(function(b){ b.onclick=function(){ SUB2.fin=b.getAttribute("data-fs"); render(); document.getElementById("view").scrollTop=0; }; });
    var fh=el.querySelector("#finHost"); vFin(fh);
    // 0.5.97: on Expense the swipe first turns its own pages (Transactions › Month › Year), then carries on to the next Finance tab
    var exP=function(sd){ return SUB2.fin==="belanja" && window.ExpenseView && ExpenseView.canPage(sd); };
    IbSwipe(fh, {can:function(sd){ if(exP(sd)) return true; var i=fi(); return sd<0 ? i<FL.length-1 : i>0; }, go:function(sd){ if(exP(sd)){ ExpenseView.turn(sd); document.getElementById("view").scrollTop=0; return; } SUB2.fin=FL[fi()+(sd<0?1:-1)][0]; render(); document.getElementById("view").scrollTop=0; },
      find:function(){ return document.querySelector("#view #finHost"); }, skip:function(){ var a=document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName); }});
    return; }
  if(s==="pets"){ petMount(el); return; }   // 0.7.72 (owner): Tools › Pets
  if(s==="halal"){ vHalal(el); if(aiJump){ aiJump=false; var n=0, iv=setInterval(function(){ var a=document.getElementById("hAiSet"); if(a||++n>30){ clearInterval(iv); if(a){ a.open=true; a.scrollIntoView({behavior:"smooth"}); } } },120); } return; }
  if(s==="saham"){ el.innerHTML='<div class="card"><h3>📈 '+L2x("Saham patuh Syariah","Shariah-compliant stocks")+'</h3><div class="mut small">'+L2x("Senarai rasmi SC, saham simpanan anda dan saringan sendiri (5% / 33% / 33%).","The official SC list, your saved stocks and a self-screen (5% / 33% / 33%).")+'</div><button class="btn gold full g3d" data-saham="1" style="margin-top:10px">📈 '+L2x("Buka","Open")+'</button></div>'; return; }
  // 0.6.26 (owner): Find moved into Time › Move (left of Letters); old links land there
  if(s==="senyap" || s==="cari"){ SUB2.alat="keluarga"; el.innerHTML=""; setTimeout(openFind, 0); return; }
  if(s==="niaga"){ vNiaga(el); return; }
  // 0.36.0 (Farah): Nota became "Tulis" (Write) and holds the greeting cards; Majlis (events planner) is its own page left of Kewangan
  if(s==="kad"){ s=SUB2.alat="nota"; wrTab="kad"; }
  if(s==="nota"){ vWrite(el); return; }
  if(s==="buku"){ SUB2.alat="nota"; SUB2.learn="buku"; go("learn"); return; }
  if(s==="paparan"){ vDisplay(el); return; }
  if(s==="cari"){ withExtra(el, function(){ el.innerHTML=IbExtra.vCari(el, xH())+'<div id="mqSlot" style="margin-top:12px"><div class="snl">🔕 '+L2x("Senyap di masjid (hanya tempat yang anda tambah)","Silent at the masjid (only places you add)")+'</div>'+mqCard()+'</div>'; IbExtra.bindCari(el, xH()); bindMq(el); }); return; }
  el.innerHTML=mqCard(); bindMq(el);
}

function openFind(){ var F=load("ihsan_fit",null)||{}; F.mode="find"; save("ihsan_fit",F); SUB2.cal="senaman"; go("cal"); }
function findInto(el){ withExtra(el, function(){ el.innerHTML=IbExtra.vCari(el, xH())+'<div id="mqSlot" style="margin-top:12px"><div class="snl">🔕 '+L2x("Senyap di masjid (hanya tempat yang anda tambah)","Silent at the masjid (only places you add)")+'</div>'+mqCard()+'</div>'; IbExtra.bindCari(el, xH()); bindMq(el); }); }
// 0.6.26 (owner): Niaga (Business) is its own level-2 tab, left of Finance
var NIAGAJS=["finance/finance.js","finance/niaga_doc.js","finance/niaga_tpl.js","finance/niaga_sheet.js","finance/niaga_gas.js","finance/niaga_xlsx.js","finance/niaga_exp.js","finance/niaga_pos.js","finance/niaga_book.js","finance/niaga.js"];
// 0.6.26: Google Sheet sync also runs while the app is open on any page (20 s after start, then every 15 min), so other phones' work and the widget stay current
function bizBgSync(){ var B=load("ihsan_biz",null); if(!B || !B.link || !Object.keys(B.link).some(function(k){ var l=B.link[k]; return l && l.url && l.auto!==false && !l.off && !l.gone; })) return;
  if(view==="alat" && SUB2.alat==="niaga") return;   // the Niaga page syncs itself
  var go2=function(){ var D=window.NiagaDoc.fix(load("ihsan_biz",null)), done=false; window.NiagaSheet.headless({H:finH(), D:function(){ return D; }, save:function(){ save("ihsan_biz", D); }, redraw:function(){ try{ wPushLast=""; pushWidgets(); }catch(e){} }, editing:function(){ return view==="alat" && SUB2.alat==="niaga"; }, alive:function(){ return !done; }, ver:APP_VER,
      imgGet:function(id){ try{ return (window.Native && N.qRead) ? N.qRead("biz/"+id+".txt")||"" : load("ihsan_bizimg_"+id,"")||""; }catch(e){ return ""; } }, imgPut:function(id,v){ try{ if(window.Native && N.qWrite) N.qWrite("biz/"+id+".txt", v); else localStorage.setItem("ihsan_bizimg_"+id, v); }catch(e){} }}).then(function(){ done=true; try{ wPushLast=""; pushWidgets(); }catch(e){} }); };
  if(window.NiagaSheet && window.NiagaDoc) go2(); else loadJs(["finance/niaga_doc.js","finance/niaga_sheet.js"], go2); }
setTimeout(bizBgSync, 20000); setInterval(bizBgSync, 15*60000);
function vNiaga(el){ var start=function(){ if(!document.body.contains(el)) return; try{ FinView(el, "niaga", finH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.FinView && window.FinMore && FinMore.niaga && window.NiagaSheet && window.NiagaExp) start(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(NIAGAJS.filter(function(f){ return !(f==="finance/finance.js" && window.FinView); }), start); } }
// ---------- 0.21.0 KEWANGAN: Hutang / Komitmen / Zakat / Saham (finance/finance.js) ----------
// 0.4.8: helpers for the currency page (finance helpers + network fetch + settings)
var fxPair=null;
function finH2(){ var h=finH(); h.fetch=nFetch; h.S=S; return h; }
// 0.5.23 one-page PDF made from a canvas (JPEG inside), page size in mm; returns base64 of the PDF file
// 0.6.70: an array of canvases makes a multi-page PDF (one page each, same paper size)
function canvasPdf(cv, mmW, mmH, q){ if(Array.isArray(cv)){ var pW=(mmW*72/25.4).toFixed(2), pH=(mmH*72/25.4).toFixed(2), n=cv.length, ob=["<< /Type /Catalog /Pages 2 0 R >>", ""], kids=[];
    cv.forEach(function(c, i){ var d=atob(c.toDataURL("image/jpeg", q||0.88).split(",")[1]), pg=3+i*3, cs="q "+pW+" 0 0 "+pH+" 0 0 cm /Im0 Do Q"; kids.push(pg+" 0 R");
      ob.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+pW+" "+pH+"] /Resources << /XObject << /Im0 "+(pg+1)+" 0 R >> >> /Contents "+(pg+2)+" 0 R >>");
      ob.push("<< /Type /XObject /Subtype /Image /Width "+c.width+" /Height "+c.height+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+d.length+" >>\nstream\n"+d+"\nendstream");
      ob.push("<< /Length "+cs.length+" >>\nstream\n"+cs+"\nendstream"); });
    ob[1]="<< /Type /Pages /Kids ["+kids.join(" ")+"] /Count "+n+" >>";
    var o2="%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", of2=[]; ob.forEach(function(o, i){ of2.push(o2.length); o2+=(i+1)+" 0 obj\n"+o+"\nendobj\n"; });
    var x2=o2.length; o2+="xref\n0 "+(ob.length+1)+"\n0000000000 65535 f \n"+of2.map(function(o){ return ("0000000000"+o).slice(-10)+" 00000 n \n"; }).join("")+"trailer\n<< /Size "+(ob.length+1)+" /Root 1 0 R >>\nstartxref\n"+x2+"\n%%EOF"; return btoa(o2); }
  var du=cv.toDataURL("image/jpeg", q||0.92), jb=atob(du.split(",")[1]), W=(mmW*72/25.4).toFixed(2), Hh=(mmH*72/25.4).toFixed(2);
  var cs="q "+W+" 0 0 "+Hh+" 0 0 cm /Im0 Do Q", objs=["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+W+" "+Hh+"] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /XObject /Subtype /Image /Width "+cv.width+" /Height "+cv.height+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+jb.length+" >>\nstream\n"+jb+"\nendstream",
    "<< /Length "+cs.length+" >>\nstream\n"+cs+"\nendstream"];
  var out="%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", off=[]; objs.forEach(function(o, i){ off.push(out.length); out+=(i+1)+" 0 obj\n"+o+"\nendobj\n"; });
  var xr=out.length; out+="xref\n0 "+(objs.length+1)+"\n0000000000 65535 f \n"+off.map(function(o){ return ("0000000000"+o).slice(-10)+" 00000 n \n"; }).join("")+"trailer\n<< /Size "+(objs.length+1)+" /Root 1 0 R >>\nstartxref\n"+xr+"\n%%EOF";
  return btoa(out); }
function sharePdf(name, b64, text){ if(window.Native && N.shareBinary) N.shareBinary(name, b64, "application/pdf", text||""); else { var a=document.createElement("a"); a.href="data:application/pdf;base64,"+b64; a.download=name; document.body.appendChild(a); a.click(); a.remove(); } }
// 0.5.23 add/remove a shared reminder (id unique); returns true when set
function xrem(id, t, title, body, open, loud){ var L=load("ihsan_xrem",[])||[]; L=L.filter(function(r){ return r.id!==id && r.t>Date.now()-864e5; });
  if(t && t>Date.now()) L.push({id:id, t:t, title:title, body:body||"", open:open||"home", loud:!!loud}); save("ihsan_xrem", L.slice(-200)); try{ pushSchedule(); }catch(e){} return !!(t && t>Date.now()); }
function xremHas(id){ return (load("ihsan_xrem",[])||[]).some(function(r){ return r.id===id && r.t>Date.now(); }); }
function finH(){ return {cur:curNow, N:N, canvasPdf:canvasPdf, sharePdf:sharePdf, xrem:xrem, xremHas:xremHas, on:on, off:off, esc:esc, L2x:L2x, en:en_, toast:toast, showSheet:showSheet, closeOverlay:closeOverlay, load:load, save:save, render:render, go:go,
  resched:pushSchedule, hijri:hijriOf, addDays:addDays, dockFix:dockFix, openQuranAt:openQuranAt, openWeb:openWeb, IbFold:IbFold}; }
var finStk=false;
function stkHtml(){ return '<div class="card"><h3>📈 '+L2x("Saham patuh Syariah","Shariah-compliant stocks")+'</h3><div class="mut small">'+L2x("Senarai rasmi SC, saham simpanan anda dan saringan sendiri (5% / 33% / 33%).","The official SC list, your saved stocks and a self-screen (5% / 33% / 33%).")+'</div><button class="btn gold full g3d" data-saham="1" style="margin-top:10px">📈 '+L2x("Buka","Open")+'</button></div>'; }
function vFin(el){
  var s=SUB2.fin;
  if(s==="saham"){ s=SUB2.fin="tukaran"; finStk=true; }
  if(s==="tukaran"){ var pr=fxPair; fxPair=null;
    // 0.5.13 (Ihsan): Saham (Shariah stocks + live gold price) now sits at the bottom of Tukaran
    el.innerHTML='<div id="fxBox"></div><div id="stkBox">'+stkHtml()+'<div id="goldC"></div></div>'; var fx=el.querySelector("#fxBox"), sb=el.querySelector("#stkBox"); goldCard(sb.querySelector("#goldC"));
    if(finStk){ finStk=false; setTimeout(function(){ if(document.body.contains(sb)) sb.scrollIntoView({block:"start"}); }, 250); }
    var go2=function(){ if(document.body.contains(fx)) try{ FxView.view(fx, finH2(), pr); }catch(err){ console.error(err); fx.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
    if(window.FxView) go2(); else { fx.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["finance/fx.js"], go2); } return; }
  var start=function(){ if(!document.body.contains(el)) return; try{ FinView(el, s, finH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  var more={wasiat:["finance/wasiat.js"], bahagi:["groups/nostrkit.js","finance/split.js"], belanja:["finance/expense.js","finance/tax.js"], cukai:["finance/expense.js","finance/tax.js"]}[s];
  if(window.FinView && (!more || (window.FinMore && window.FinMore[s]))) start(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs([window.FinView?null:"finance/finance.js"].concat(more||[]).filter(function(f){ return f && !(f==="groups/nostrkit.js" && window.NostrKit); }), start); }
}

// 0.36.0 (Farah): live gold price chart on the Saham page (TradingView widget, needs internet). Currency and range are remembered.
var GOLD=load("ihsan_gold",{c:"MYR", r:"1M"});
function goldCard(box){
  if(!box) return;
  var cur=GOLD.c==="USD"?"USD":"MYR", rg=GOLD.r||"1M", sym=cur==="USD"?"OANDA:XAUUSD":"FX_IDC:XAUMYR", th=APP_THEMES.filter(function(t){ return t[0]===themeNow; })[0], dark=!(th && th[6]);
  box.innerHTML='<div class="card goldc"><div class="row"><h3 style="margin:0">🪙 '+L2x("Harga emas (langsung)","Gold price (live)")+'</h3><span class="seg">'+["MYR","USD"].map(function(c){ return '<button class="'+(cur===c?"on":"")+'" data-gc="'+c+'">'+c+'</button>'; }).join("")+'</span></div>'+
    '<div class="chips" style="margin:8px 0 4px">'+[["1D","1H","1D"],["1M","1B","1M"],["12M","1T","1Y"],["60M","5T","5Y"]].map(function(x){ return '<button class="chip g3d'+(rg===x[0]?" on":"")+'" data-gr="'+x[0]+'">'+L2x(x[1],x[2])+'</button>'; }).join("")+'</div>'+
    '<div class="goldw" id="goldW"><div class="mut small" style="padding:30px 0;text-align:center">'+L2x("Memuatkan carta… (perlu internet)","Loading chart… (needs the internet)")+'</div></div>'+
    '<div class="mut tiny" style="margin-top:6px;line-height:1.45">'+L2x("Harga emas dunia bagi 1 auns troy (31.1 g), daripada TradingView. Harga kedai emas dan akaun emas bank berbeza (upah, spread). Bukan nasihat pelaburan.","World gold price for 1 troy ounce (31.1 g), from TradingView. Jewellers' and bank gold-account prices differ (workmanship, spread). Not investment advice.")+'</div></div>';
  box.querySelectorAll("[data-gc]").forEach(function(b){ b.onclick=function(){ GOLD.c=b.getAttribute("data-gc"); save("ihsan_gold",GOLD); goldCard(box); }; });
  box.querySelectorAll("[data-gr]").forEach(function(b){ b.onclick=function(){ GOLD.r=b.getAttribute("data-gr"); save("ihsan_gold",GOLD); goldCard(box); }; });
  var w=box.querySelector("#goldW"), cfg={symbols:[[cur==="USD"?"XAU/USD":"XAU/MYR", sym+"|"+rg]], chartOnly:false, width:"100%", height:300, locale:en_()?"en":"ms_MY", colorTheme:dark?"dark":"light", autosize:true, showVolume:false, hideDateRanges:true, hideMarketStatus:false, scalePosition:"right", scaleMode:"Normal", fontFamily:"inherit", fontSize:"10", noTimeScale:false, valuesTracking:"1", changeMode:"price-and-percent", chartType:"area", lineColor:"#c9a646", topColor:"rgba(201,166,70,.35)", bottomColor:"rgba(201,166,70,0)", lineWidth:2, backgroundColor:"rgba(0,0,0,0)", isTransparent:true, dateRanges:[rg.toLowerCase()]};
  if(!navigator.onLine){ w.innerHTML='<div class="mut small" style="padding:30px 0;text-align:center">📶 '+L2x("Tiada internet. Carta emas perlu sambungan.","No internet. The gold chart needs a connection.")+'</div>'; return; }
  var c=document.createElement("div"); c.className="tradingview-widget-container"; c.style.height="300px"; c.innerHTML='<div class="tradingview-widget-container__widget" style="height:100%"></div>';
  var sc=document.createElement("script"); sc.type="text/javascript"; sc.async=true; sc.src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"; sc.text=JSON.stringify(cfg);
  c.appendChild(sc); c.style.position="absolute"; c.style.inset="0"; c.style.opacity="0"; c.style.transition="opacity .3s";
  setTimeout(function(){ if(!document.body.contains(w)) return; w.style.position="relative"; w.appendChild(c);
    // show the chart once TradingView's frame has loaded; if it never does, say so
    var n=0, iv=setInterval(function(){ var f=c.querySelector("iframe"); if(!document.body.contains(w)){ clearInterval(iv); return; }
      if(f && !f._ib){ f._ib=1; f.addEventListener("load", function(){ c.style.opacity="1"; var m=w.firstChild; if(m && m!==c) m.style.visibility="hidden"; }); }
      if(++n>60){ clearInterval(iv); if(c.style.opacity!=="1"){ var m2=w.firstChild; if(m2 && m2!==c) m2.textContent="📶 "+L2x("Carta tidak dapat dimuatkan. Semak internet dan cuba lagi.","The chart could not load. Check the internet and try again."); } } }, 250); }, 50);
}

// ---------- 0.24.0 EXTRA (extra/extra.js): Cari for donors, surau list, graves + ziarah, flight solat, quiz, sirah snippet ----------
function xH(){ var h=finH(); h.loadJs=loadJs; h.openFinder=openFinder; h.qiblaBearing=qiblaBearing; h.openSirah=function(id){ openSirah(false, id); };
  h.timesAt=function(lat,lon){ var d=new Date(), r=calcDay(d, lat, lon, {fa:18, ia:17, tz:-d.getTimezoneOffset()/60, ik:1}); return [["Subuh",r.subuh],[L2x("Syuruk","Sunrise"),r.syuruk],["Zohor",r.zohor],["Asar",r.asar],["Maghrib",r.maghrib],["Isyak",r.isyak]]; };
  return h; }
function withExtra(el, fn){ var ok=function(){ if(!el || document.body.contains(el)) fn(); };
  if(window.IbExtra) ok(); else { if(el) el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["extra/extra.js"], ok); } }

// ---------- 0.23.0 KELUARGA (Alat): salasilah 3D, birthdays, baby names, nikah (family/family.js) ----------
// 0.5.52: onboarding tours (tour/tour.js) reach the app through these helpers
function tourH(){ return {S:S, L2x:L2x, esc:esc, toast:toast, WEB:WEB, go:go, periodHidden:periodHidden,
  sub:function(t,s){ if(t==="sunat"){ sunPage=s; save("ihsan_sunpage",s); } else SUB2[t]=s; if(t==="learn"){ learnPg=null; learnFrom=null; } go(t); },
  nav:function(id){ var sn=sideFind(id); if(sn && sn.f) sn.f(); },
  side:function(on){ sideShow(on, false); }, sideOpen:function(){ return !!sideOpen; }, setOn:function(){ return !!setOn; }, setShow:setShow,
  sideOpenNode:function(id){ var sd=sideBuild(), nd=sd.querySelector('.sdn[data-sid="'+id+'"]'); if(!nd) return; for(var n=nd; n && n.classList; n=n.parentNode){ if(n.classList.contains("sdn") && n.querySelector(".sdx")){ n.classList.add("open"); SD.o[n.getAttribute("data-sid")]=1; } }
    save("ihsan_side",SD); setTimeout(function(){ var l=sd.querySelector("#sdL"), r=nd.getBoundingClientRect(), b=l.getBoundingClientRect(); l.scrollTop+=(r.top-b.top)-20; }, 60); },
  settings:function(g, top){ if(g) openSettings(g); else { moreGrp=null; setShow(true); if(top){ var b=document.getElementById("setB"); if(b) b.scrollTop=0; } } }}; }
// 0.7.50 (security 5-7): Settings › Backup & about › 🔐 Privacy & my data: why each permission is asked (optional, only when a feature needs it), whether it is on, the privacy policy, and Delete all my data
function privCard(el){
  var PM=[["location","📍","Lokasi","Location","Waktu solat, kiblat, masjid berdekatan, larian dan kayuhan","Prayer times, qibla, nearby masjid, runs and rides"],
    ["camera","📷","Kamera","Camera","Kiblat, kira rakaat, imbas barkod, Gerak Huruf (diproses di telefon)","Qibla, rakaat counting, barcode scan, Gerak Huruf (processed on the phone)"],
    ["mic","🎙️","Mikrofon","Microphone","Bacaan lisan, walkie-talkie, mesyuarat (hanya semasa anda guna)","Oral reading, walkie-talkie, meetings (only while you use it)"],
    ["calendar","📅","Kalendar","Calendar","Segerak ke kalendar Google/telefon (pilihan)","Sync to your Google/phone calendar (optional)"],
    ["contacts","👥","Kenalan","Contacts","Carian skrin utama sahaja, di telefon","Home-screen search only, on the phone"],
    ["notif","🔔","Makluman","Notifications","Waktu solat dan peringatan","Prayer times and reminders"],
    ["steps","👣","Aktiviti fizikal","Physical activity","Kiraan langkah, di telefon","Step counting, on the phone"],
    ["usage","⏱️","Akses penggunaan","Usage access","Statistik masa skrin, di telefon (pilihan)","Screen-time stats, on the phone (optional)"],
    ["dnd","🔕","Jangan Ganggu","Do Not Disturb","Senyapkan telefon semasa solat/masjid (pilihan)","Silence the phone at prayer/masjid (optional)"],
    ["bt","🖨️","Bluetooth","Bluetooth","Pencetak resit (pilihan)","Receipt printer (optional)"]];
  var rows=PM.map(function(p){ var on=false; try{ on=N.hasPerm ? !!N.hasPerm(p[0]) : false; }catch(e){} return '<div class="uaLine" style="gap:8px"><span>'+p[1]+' <b>'+L2x(p[2],p[3])+'</b><br><small class="mut">'+L2x(p[4],p[5])+'</small></span><small>'+(on?'✅':'—')+'</small></div>'; }).join("");
  el.innerHTML='<h3>🔐 '+L2x("Privasi & data saya","Privacy & my data")+'</h3><div class="mut small" style="margin-bottom:8px">'+L2x("Data anda disimpan di telefon ini. Kami tiada pelayan yang menyimpan data anda. Semua kebenaran adalah pilihan dan hanya diminta apabila anda guna ciri itu. Anda boleh menolak atau menarik balik di tetapan Android.","Your data stays on this phone. We run no server that holds your data. Every permission is optional and asked only when you use that feature. You can deny or withdraw any of them in Android settings.")+'</div>'+
    '<details class="card uaDet" style="margin:0 0 8px"><summary>'+L2x("Kenapa setiap kebenaran diminta","Why each permission is asked")+'</summary>'+(WEB?'<div class="mut small">'+L2x("Aplikasi web tidak meminta kebenaran telefon.","The web app asks for no phone permissions.")+'</div>':rows+'<div class="btns" style="margin-top:8px"><button class="btn alt g3d" id="pvApp">⚙ '+L2x("Buka tetapan kebenaran","Open permission settings")+'</button></div>')+'</details>'+
    '<div class="btns"><button class="btn alt g3d" id="pvPol">📄 '+L2x("Dasar privasi","Privacy policy")+'</button><button class="btn alt g3d" id="pvDel" style="border-color:#c0392b;color:#e57373">🗑️ '+L2x("Padam semua data saya","Delete all my data")+'</button></div>'+
    '<div class="mut tiny" style="margin-top:6px">'+L2x("Padam semua data membuang semuanya di telefon ini: anak, nota, tetapan, kunci AI. Salinan di Google Drive anda (jika ada) tidak dipadam: buang di Drive.","Delete all my data removes everything on this phone: children, notes, settings, AI keys. Your Google Drive copy (if any) is not deleted: remove it in Drive.")+'</div>';
  var ap=el.querySelector("#pvApp"); if(ap) ap.onclick=function(){ N.requestPerm("appinfo"); };
  el.querySelector("#pvPol").onclick=function(){ var u="https://myihsan.app/privacy"; if(N.openUrl) N.openUrl(u); else window.open(u,"_blank"); };
  el.querySelector("#pvDel").onclick=function(){
    if(!confirm(L2x("Padam SEMUA data My Ihsan di telefon ini? Anak, nota, tetapan dan kunci AI akan hilang dan tidak boleh dipulihkan.","Delete ALL My Ihsan data on this phone? Children, notes, settings and AI keys will be gone and cannot be restored."))) return;
    if(!confirm(L2x("Pasti? Ini tidak boleh dibatalkan.","Are you sure? This cannot be undone."))) return;
    if(N.wipeAll){ N.wipeAll(); return; }
    try{ localStorage.clear(); if(indexedDB && indexedDB.databases) indexedDB.databases().then(function(d){ d.forEach(function(x){ indexedDB.deleteDatabase(x.name); }); }); }catch(e){}
    setTimeout(function(){ location.reload(); }, 400); };
}
function tourLoad(cb){ if(window.IhsanTour){ cb&&cb(); return; } if(!document.querySelector('link[href="tour/tour.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="tour/tour.css"; document.head.appendChild(lk); }
  loadJs(["tour/tour.js"], function(){ if(window.IhsanTour){ IhsanTour.init(tourH()); cb&&cb(); } }, function(){}); }
function famH(){ var h=finH(); if(window.FinUI){ FinUI.setH(h); h.fld=FinUI.fld; h.ayat=FinUI.ayat; } h.loadJs=loadJs; h.cc=phoneCC; h.nextPrev=nextPrev; h.getDay=getDay; return h; }
// 0.33.5: phone country code from the app's location (Malaysia unless the location is set abroad)
function phoneCC(){ if(!overseasNow() || S.lat==null) return S.ulang==="id"?"62":"60"; var a=S.lat, o=S.lon, in_=function(a1,a2,o1,o2){ return a>=a1&&a<=a2&&o>=o1&&o<=o2; };
  if(in_(1.15,1.48,103.6,104.1)) return "65"; if(in_(4,5.1,114,115.4)) return "673"; if(in_(-11,6,95,141.1)) return "62"; if(in_(5.6,20.5,97,106)) return "66"; if(in_(16,32.2,34.5,55.7)) return "966"; if(in_(22.5,26.1,51.5,56.4)) return "971";
  if(in_(49.9,60.9,-8.2,1.8)) return "44"; if(in_(-44,-10,112,154)) return "61"; if(in_(24,72,-170,-52)) return "1"; return "60"; }
function vFam(el){ var go_=function(){ if(document.body.contains(el)){ var fh=famH(); fh.noDock=true; FamView(el, fh); } };
  if(window.FamView && window.BABY_NAMES && window.BabyView && window.EventView && window.CareView) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["finance/finance.js","family/family.js","family/names.js","family/baby.js","family/events.js","family/seating.js","family/evshare.js","family/care.js"], go_); } }
// 0.35.0: open Keluarga at a section ("baby", "events") from a widget
function famOpen(sec){ if(sec==="events"||sec==="nikah"){ gatherEvents(); return; } SUB2.life=sec; SUB2.alat="keluarga"; go("alat"); }
function gatherEvents(){ window.__meetPg="ev"; SUB2.cal="mesyuarat"; go("cal"); }   // 0.7.75: Events live in Time › Gather
// 0.5.16: Kumpulan (groups/groups.js): private, invite-only, end-to-end encrypted notice boards over free Nostr relays
var GROUPS_JS=["groups/nostrkit.js","groups/groups.js"];
function grpCss(){ if(!document.querySelector('link[href="groups/groups.css"]')){ var l=document.createElement("link"); l.rel="stylesheet"; l.href="groups/groups.css"; document.head.appendChild(l); } }
function withGroups(fn){ grpCss(); if(window.GroupsView) fn(); else loadJs(GROUPS_JS, fn, function(){ toast(L2x("Kumpulan tidak dapat dimuatkan","Groups could not load")); }); }
function grpH(){ var h=finH(); h.fetch=nFetch; h.S=S; h.loadJs=loadJs; h.cc=phoneCC;
  // 0.5.62: prayer-aware group reminders ("after Asar + 15 min") and the kid view's "Asar now!"
  h.ptime=function(k, d){ try{ d=d||new Date(); var t=getDay(d); return t&&t[k]?at(ymd(d),t[k]).getTime():0; }catch(e){ return 0; } };
  h.curPrayer=function(){ try{ return curWaktu(); }catch(e){ return ""; } }; return h; }
// 0.5.18: group events in Masa › Bulan (a dot in each group's colour, and a line in the selected day's list)
var GRP_DAYS=null;
function grpDays(){ if(GRP_DAYS) return GRP_DAYS; var gs=load("ihsan_groups",null); if(!(gs && gs.list && gs.list.length)) return {};
  if(window.GroupsView){ try{ GRP_DAYS=GroupsView.byDay(grpH()); setTimeout(function(){ GRP_DAYS=null; }, 30000); }catch(e){ GRP_DAYS={}; } return GRP_DAYS; }
  if(!grpDays.ld){ grpDays.ld=1; withGroups(function(){ GRP_DAYS=null; if(view==="cal" && SUB2.cal==="bulan") render(); }); } return {}; }
function vGroups(el){ el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; withGroups(function(){ if(document.body.contains(el)) GroupsView.open(el, grpH()); }); }
function grpLink(url){ if(S.kidLock) return; SUB2.alat="kumpulan"; go("alat"); setTimeout(function(){ withGroups(function(){ GroupsView.link(grpH(), url); }); }, 400); }
// 0.5.24 shared split-bill invite links (https://ihsanrahim.github.io/My-Ihsan-Web/split/#… or myihsan://s#…) open Kewangan › Bahagi bil
function splitLink(url){ if(S.kidLock) return; window.__splitLink=url; go("bahagi"); }
// 0.7.17 shared Majlis invite (myihsan://e#… or …/e/#…): open Majlis and join
function evLink(url){ if(S.kidLock) return; var go_=function(){ try{ EvShare.joinSheet(meetH(), url, function(id){ if(window.EventView){ EventView.navSet({cur:id, pg:"info"}); } var sn=sideFind("alat/majlis"); if(sn && sn.f) sn.f(); }); }catch(e){} };
  if(window.EvShare) go_(); else loadJs(["groups/nostrkit.js","finance/finance.js","family/family.js","family/names.js","family/baby.js","family/events.js","family/seating.js","family/evshare.js","family/care.js"], go_, function(){}); }
on("glink", function(d){ if(!d || !d.url) return; if(/^myihsan:\/\/e|\/e\/#|myihsan\.app\/e\b/.test(d.url)) evLink(d.url); else if(/\/split\b|^myihsan:\/\/s/.test(d.url)) splitLink(d.url); else grpLink(d.url); });
// 0.7.17 shared events keep syncing (and notify) while the app is open, not only on the Majlis page
// 0.7.67 (owner): Family link: connect at start when this phone is linked, so the other parent's changes arrive
setTimeout(function(){ try{ var fl=load("ihsan_famlink",null); if(fl && fl.links && fl.links.length){ var go_=function(){ FamLink.start(kpH(null)); }; if(window.FamLink) go_(); else loadJs(["groups/nostrkit.js","famlink/famlink.js"].filter(function(f){ return !(f==="groups/nostrkit.js" && window.NostrKit); }), go_, function(){}); } }catch(e){} }, 3000);
setTimeout(function(){ try{ var ev=load("ihsan_events",null); if(ev && ev.list && ev.list.some(function(e){ return e.sh; })){ var go_=function(){ EvShare.start(meetH()); }; if(window.EvShare) go_(); else loadJs(["groups/nostrkit.js","family/evshare.js"], go_, function(){}); } }catch(e){} }, 4000);
setTimeout(function(){ try{ var gs=load("ihsan_groups",null); if(gs && gs.list && gs.list.length) withGroups(function(){ GroupsView.sync(grpH()); }); }catch(e){} }, 3500);
function wGroups(w,h){ var body=window.GroupsView ? GroupsView.widget(grpH()) : '<div class="mut small">'+L2x("Ketik untuk buka","Tap to open")+'</div>';
  if(!window.GroupsView && ((load("ihsan_groups",{})||{}).list||[]).length && !wGroups.ld){ wGroups.ld=1; withGroups(function(){ var c=document.querySelector('[data-wsc="sc-n-alat/kumpulan"] .wgb'); if(c) c.innerHTML=GroupsView.widget(grpH()); try{ wPushLast=""; pushWidgets(); }catch(e){} }); }
  return '<div class="card wfin" data-wsc="sc-n-alat/kumpulan"><h3>👥 '+L2x("Kumpulan","Groups")+'</h3><div class="wgb">'+body+'</div></div>'; }
Object.assign(WG,{ groupsw: cardW("tools","👥","Kumpulan: pengumuman terkini","Groups: latest announcement",wGroups,[4,2],[2,1]) });
// 0.5.17: Paparan (display/display.js): billboard + Islamic display clock + display tools, full screen
function dspH(){ var h=finH(); h.S=S; h.fetch=nFetch; h.day=getDay; h.loadJs=loadJs;
  h.groupList=function(){ return window.GroupsView ? GroupsView.list(grpH()) : []; };
  h.groupTicker=function(id){ if(!window.GroupsView) return ""; if(!dspH.syncT || Date.now()-dspH.syncT>60000){ dspH.syncT=Date.now(); try{ GroupsView.sync(grpH()); }catch(e){} } return GroupsView.tickerText(grpH(), id); }; h.hijri=function(d){ return hijriStr(hijriOf(d)); }; h.hijriDay=function(d){ var x=hijriOf(d); return x?x.d:0; }; h.hadith=hadithToday; return h; }
function vDisplay(el){ if(!document.querySelector('link[href="display/display.css"]')){ var l=document.createElement("link"); l.rel="stylesheet"; l.href="display/display.css"; document.head.appendChild(l); }
  if(!document.querySelector('link[href="display/fonts.css"]')){ var lf=document.createElement("link"); lf.rel="stylesheet"; lf.href="display/fonts.css"; document.head.appendChild(lf); }
  var go_=function(){ if(document.body.contains(el)) DisplayView.open(el, dspH()); };
  var gs=load("ihsan_groups",null), needG=gs && gs.list && gs.list.length && !window.GroupsView;
  if(window.DisplayView && !needG) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; if(needG) grpCss(); loadJs((needG?GROUPS_JS:[]).concat(["display/display.js","display/tvd.js"]), go_, function(){ loadJs(["display/display.js","display/tvd.js"], go_); }); } }
function withDisplay(fn){ if(!document.querySelector('link[href="display/display.css"]')){ var l=document.createElement("link"); l.rel="stylesheet"; l.href="display/display.css"; document.head.appendChild(l); }
  if(!document.querySelector('link[href="display/fonts.css"]')){ var lf=document.createElement("link"); lf.rel="stylesheet"; lf.href="display/fonts.css"; document.head.appendChild(lf); }
  var gs=load("ihsan_groups",null), list=(gs && gs.list && gs.list.length && !window.GroupsView ? GROUPS_JS : []).concat(window.DisplayView?[]:["display/display.js"]).concat(window.TVD?[]:["display/tvd.js"]);
  if(!list.length){ fn(); return; } loadJs(list, fn, function(){ loadJs(["display/display.js","display/tvd.js"], fn); }); }
// a home-screen shortcut, the boot notification or the charger: open a saved display full screen
function dspPlay(id){ if(S.kidLock || IOS) return; SUB2.alat="paparan"; go("alat"); setTimeout(function(){ withDisplay(function(){ var vw=document.getElementById("view"); if(!vw.querySelector(".dsHome2,.dsEdTop,.dsPageH")) DisplayView.open(vw, dspH()); if(!DisplayView.play(id)) toast(L2x("Paparan itu sudah dipadam","That display was deleted")); }); }, 450); }
// daily 3 am fresh start: the display page reloads and carries on
setTimeout(function(){ try{ var rs=sessionStorage.getItem("dsResume"); if(rs){ sessionStorage.removeItem("dsResume"); var cfg=JSON.parse(rs); SUB2.alat="paparan"; go("alat"); withDisplay(function(){ DisplayView.open(document.getElementById("view"), dspH()); DisplayView.resume(cfg); }); } }catch(e){} }, 1500);
// start by itself when the charger is connected (while the app is open)
try{ if(navigator.getBattery) navigator.getBattery().then(function(b){ b.addEventListener("chargingchange", function(){ var au=load("ihsan_dsauto",{})||{}; if(!b.charging || !au.charge || !au.id || S.kidLock) return; var ov=document.getElementById("overlay"); if(ov && !ov.classList.contains("hidden")) return; dspPlay(au.id); }); }); }catch(e){}
function wDisplay(w,h){ var body=window.DisplayView ? DisplayView.widget(dspH()) : '<div class="mut small">'+L2x("Ketik untuk buka","Tap to open")+'</div>';
  if(!window.DisplayView && !wDisplay.ld && (load("ihsan_displays",[])||[]).length){ wDisplay.ld=1; withDisplay(function(){ var c=document.querySelector('[data-wsc="sc-n-alat/paparan"] .wgb'); if(c) c.innerHTML=DisplayView.widget(dspH()); try{ wPushLast=""; pushWidgets(); }catch(e){} }); }
  return '<div class="card wfin" data-wsc="sc-n-alat/paparan"><h3>📺 '+L2x("Paparan","Display")+'</h3><div class="wgb">'+body+'</div></div>'; }
// 0.7.61 (owner): Home widget: each child's day from the planner (Learn › School › Planner)
function wKplan(w,h){ var kids=kprof().list, data=load("ihsan_kplan",{})||{}, has=kids.filter(function(k){ return data[k.id]; });
  var body=!has.length ? '<div class="mut small">'+L2x("Buka Sekolah › anak › 📅 Perancang untuk mula.","Open School › a child › 📅 Planner to start.")+'</div>'
    : !window.KPlan ? '<div class="mut small">…</div>'
    : has.slice(0,3).map(function(k){ var sm=KPlan.summary(kpH(k), {id:k.id, n:k.n, e:k.e}); return '<div class="kpW"><b>'+esc((k.e||"🧒")+" "+k.n)+'</b> <span class="mut small">'+sm.done+'/'+sm.total+' ✓'+(sm.hw?' · ✏️ '+sm.hw:'')+'</span>'+(sm.next?'<div class="small">'+L2x("Seterusnya: ","Next: ")+esc(sm.next)+'</div>':'')+'</div>'; }).join("");
  if(has.length && !window.KPlan && !wKplan.ld){ wKplan.ld=1; loadJs(["kplan/kplan.js"], function(){ var c=document.querySelector('[data-wsc="sc-n-learn/sekolah"] .wgb'); if(c){ var t=document.createElement("div"); t.innerHTML=wKplan(w,h); var nb=t.querySelector(".wgb"); if(nb) c.innerHTML=nb.innerHTML; } }); }
  return '<div class="card wfin" data-wsc="sc-n-learn/sekolah"><h3>📅 '+L2x("Hari anak-anak","Children's day")+'</h3><div class="wgb">'+body+'</div></div>'; }
Object.assign(WG,{ kpw: cardW("learn","📅","Perancang anak: hari ini","Child planner: today",wKplan,[4,2],[2,1]) });
// 0.7.72 (owner): Pets widget: each pet's progress today and what is next
function wPets(w,h){ var d=load("ihsan_pets",null), has=d&&d.pets&&d.pets.some(function(p){ return p.status!=="passed"; });
  var body=!has?'<div class="mut small">'+L2x("Tambah haiwan di Alat › Haiwan.","Add a pet in Tools › Pets.")+'</div>':!window.PetMgr?'<div class="mut small">…</div>':PetMgr.summary(petH()).slice(0,3).map(function(x){ return '<div class="ptW">'+x.av+'<div><b>'+esc(x.p.n)+'</b> <span class="mut small">'+x.done+'/'+x.total+' ✓</span>'+(x.next?'<div class="small">'+esc(x.next)+'</div>':'')+'</div></div>'; }).join("");
  if(has && !window.PetMgr && !wPets.ld){ wPets.ld=1; if(!document.querySelector('link[href="pets/pets.css"]')){ var l=document.createElement("link"); l.rel="stylesheet"; l.href="pets/pets.css"; document.head.appendChild(l); } loadJs(PET_JS, function(){ var c=document.querySelector('[data-wsc="sc-n-alat/pets"] .wgb'); if(c){ var t=document.createElement("div"); t.innerHTML=wPets(w,h); var nb=t.querySelector(".wgb"); if(nb) c.innerHTML=nb.innerHTML; } }); }
  return '<div class="card" data-wsc="sc-n-alat/pets"><h3>🐾 '+L2x("Haiwan: hari ini","Pets: today")+'</h3><div class="wgb">'+body+'</div></div>'; }
Object.assign(WG,{ petw: cardW("fam","🐾","Haiwan: hari ini","Pets: today",wPets,[4,2],[2,1]) });
Object.assign(WG,{ dspw: cardW("tools","📺","Paparan: papan tanda & kiraan solat","Display: billboard & prayer countdown",wDisplay,[4,2],[2,1]) });
// 0.36.0: Majlis (family/events.js) as its own Alat page
function vMajlis(el){
  var go_=function(){ if(!document.body.contains(el)) return; var h=famH(); try{ FamView.data(h); }catch(e){}
    EventView._draw=function(){ if(!document.body.contains(el)){ EventView._draw=null; return; } var v=document.getElementById("view"), y=v.scrollTop; EventView.view(el, famH(), ''); v.scrollTop=y; };
    EventView.view(el, h, ''); };
  if(window.FamView && window.EventView) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["finance/finance.js","family/family.js","family/names.js","family/baby.js","family/events.js","family/seating.js","family/evshare.js","family/care.js"], go_); } }
// 0.36.0: Tulis (Write) = Notes + Greeting cards, switched in the bottom bar
var wrTab="nota";   // 0.6.23 (owner): Baca became Tulis (Write) again; Books moved to Learn, right of School
var WRT=[["nota","📝","Nota","Notes"],["kad","🎴","Kad ucapan","Greeting cards"],["karya","✒️","Karya","Create"],["dokumen","📄","Dokumen","Documents"],["tekap","✍️","Tekap","Trace"]];   // 0.6.63: Tekap = AR typography + sketch tracer   // 0.6.60: Dokumen = AI document studio   // 0.6.18: Karya = AI writing studio
// 0.6.18: Baca › Karya (karya/karya.js): AI literature studio; exports through canvasPdf/sharePdf and can drop the PDF into Books › Karya
function kyH(){ return {N:N, S:S, L2x:L2x, esc:esc, toast:toast, load:load, save:save, openSettings:function(g){ window.openSettings(g); }, canvasPdf:canvasPdf, sharePdf:sharePdf,
  toBooks:function(u8, name){ var s=load("ihsan_books_set",{})||{}; s.folders=s.folders||[]; if(!s.folders.some(function(f){ return f.id==="fkarya"; })) s.folders.push({id:"fkarya", n:L2x("Karya","My writing"), ic:"✒️"}); save("ihsan_books_set", s);
    withBooks(function(){ BooksView.addBytes(bkH(), u8, name, {col:["fkarya"]}).then(function(){ toast("📚 "+L2x("Disimpan dalam Buku › Karya","Saved in Books › My writing")); }); }); }}; }
// 0.6.60 (owner spec dokumen-plan.md): Tulis › Dokumen (dokumen/*.js): 50 document types, 10 page themes, PDF / DOCX / PNG / text
function dkH(){ var h=kyH(); h.showSheet=showSheet; h.closeOverlay=closeOverlay; h.loadJs=loadJs; h.on=on; h.off=off; h.hol=function(k){ return window.ihsanHol ? window.ihsanHol(k) : {ph:[], sc:[]}; };
  h.toBooks=function(u8, name){ var s=load("ihsan_books_set",{})||{}; s.folders=s.folders||[]; if(!s.folders.some(function(f){ return f.id==="fdok"; })) s.folders.push({id:"fdok", n:L2x("Dokumen","Documents"), ic:"📄"}); save("ihsan_books_set", s);
    withBooks(function(){ BooksView.addBytes(bkH(), u8, name, {col:["fdok"]}).then(function(){ toast("📚 "+L2x("Disimpan dalam Buku › Dokumen","Saved in Books › Documents")); }); }); };
  // the business letterhead comes from Business (Niaga): the current profile's name, registration, address, phone, email
  h.biz=function(){ try{ var D=load("ihsan_biz",null); if(!D || !D.profiles || !D.profiles.length) return null; var p=D.profiles.filter(function(x){ return x.id===D.cur; })[0]||D.profiles[0];
    return {id:"biz", label:p.name, name:p.name||"", co:p.name||"", reg:p.regNo||"", addr:p.addr||"", phone:p.phone||"", email:p.email||"", biz:[p.name, p.regNo, p.addr].filter(Boolean).join(", ")}; }catch(e){ return null; } };
  return h; }
function vDokumen(el){ if(!document.getElementById("dkCss")){ var l=document.createElement("link"); l.id="dkCss"; l.rel="stylesheet"; l.href="dokumen/dokumen.css"; document.head.appendChild(l); }
  var go_=function(){ if(document.body.contains(el)) try{ DokumenView.view(el, dkH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.DokumenView) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["halal/halal_ai.js","dokumen/types.js","dokumen/themes.js","dokumen/dokumen.js"], go_); } }
// 0.6.63 (owner spec tekap-ar-trace-spec.md): Tulis › ✍️ Tekap (tekap/*.js): text + picture layers over the camera view of real paper
function tkH(){ var h=dkH(); h.N=N; return h; }
// word of the day for tracing (home widget "Latihan tekap hari ini"): [Rumi, Arabic/Jawi, English]; even days Old English, odd days Naskh
var TK_WOD=window.TK_WOD=[["Ihsan","احسان","excellence"],["Sabar","صبر","patience"],["Syukur","شكر","gratitude"],["Ikhlas","اخلاص","sincerity"],["Amanah","امانة","trust"],["Rahmah","رحمة","mercy"],["Taqwa","تقوى","God-consciousness"],["Adab","ادب","good manners"],
  ["Ilmu","علم","knowledge"],["Iman","ايمان","faith"],["Tawakal","توكل","reliance on Allah"],["Istiqamah","استقامة","steadfastness"],["Salam","سلام","peace"],["Hikmah","حكمة","wisdom"],["Redha","رضا","contentment"],["Zikir","ذكر","remembrance"],
  ["Doa","دعاء","supplication"],["Berkat","بركة","blessing"],["Nur","نور","light"],["Jannah","جنة","paradise"],["Ukhuwah","اخوة","brotherhood"],["Amal","عمل","good deeds"],["Qalam","قلم","the pen"],["Kitab","كتاب","book"],["Hidayah","هداية","guidance"],["Insaf","انصاف","fairness"],["Taubat","توبة","repentance"],["Halal","حلال","lawful"]];
function tkWodW(){ var n=Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/86400000), w=TK_WOD[n%TK_WOD.length], ar=n%2===1;
  return '<div class="card tkWodH" data-act="q-tekap-wod"><div class="mut small">✍️ '+L2x("Latihan tekap hari ini","Today's tracing practice")+'</div><div class="tkWodW'+(ar?' ar':'')+'">'+esc(ar?w[1]:w[0])+'</div><div class="mut small">'+esc(ar?w[0]:w[1])+' · '+esc(L2x(w[0],w[2]))+'</div></div>'; }
// a font or a .tekap.json project opened with My Ihsan: open Trace and hand it over
function tkOpenWith(o){ window.__tkIn=o; wrTab="tekap"; SUB2.alat="nota"; go("alat"); }
on("tekapfont", function(d){ if(S.kidLock || !d || !d.b64) return; tkOpenWith({font:d.b64, name:d.name||""}); });
function vTekap(el){ if(!document.getElementById("tkCss")){ var l=document.createElement("link"); l.id="tkCss"; l.rel="stylesheet"; l.href="tekap/tekap.css"; document.head.appendChild(l); }
  var go_=function(){ if(document.body.contains(el)) try{ Tekap.view(el, tkH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.Tekap) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["tekap/lib/opentype.min.js","huruf/huruf_data.js","tekap/tekap.js","tekap/tekap_img.js","tekap/tekap_track.js","tekap/tekap_learn.js"], go_); } }
function vKarya(el){ if(!document.getElementById("kyCss")){ var l=document.createElement("link"); l.id="kyCss"; l.rel="stylesheet"; l.href="karya/karya.css"; document.head.appendChild(l); }
  var go_=function(){ if(document.body.contains(el)) try{ KaryaView.view(el, kyH()); }catch(err){ console.error(err); el.innerHTML='<div class="card">'+L2x("Gagal dibuka","Could not open")+'</div>'; } };
  if(window.KaryaView) go_(); else { el.innerHTML='<div class="card mut">'+L2x("Memuatkan…","Loading…")+'</div>'; loadJs(["halal/halal_ai.js","karya/frames2.js","karya/karya.js"], go_); } }
function kadHtml(){ return '<div class="card kadCard"><h3>🎴 '+L2x("Kad ucapan","Greeting cards")+'</h3><div class="mut small">'+L2x("Pilih sambutan, reka kad dan kongsi ke WhatsApp.","Pick an occasion, design a card and share it to WhatsApp.")+'</div>'+
  KAD_GRP.map(function(g){ return '<div class="kadGh">'+esc(L2x(g[0],g[1]))+'</div><div class="kadTiles">'+g[2].map(function(id){ var o=KAD_OCC.filter(function(c){ return c[0]===id; })[0]; if(!o) return "";
    return '<button class="kadT" data-kad="'+id+'">'+(KAD_TH[id]?'<img src="'+KAD_TH[id]+'" alt="">':'<canvas data-kth="'+id+'" width="216" height="270"></canvas>')+'<span>'+esc(L2x(o[1],o[2]))+'</span></button>'; }).join("")+'</div>'; }).join("")+'</div>'; }
// 0.6.34: each tile is a small live preview of its card (drawn once, a few per frame, then kept)
var KAD_TH={};
function kadThumbs(box){ var go=function(){ var list=Array.prototype.slice.call(box.querySelectorAll("canvas[data-kth]")), i=0;
  var step=function(){ if(!document.body.contains(box)) return; var t0=Date.now(); while(i<list.length && Date.now()-t0<40){ var cv=list[i++], id=cv.getAttribute("data-kth"), df=KAD_DEF[id]||["geo","hijau"], t=kadText(id), x=cv.getContext("2d");
      x.setTransform(0.2,0,0,0.2,0,0); try{ kadDraw(cv, {des:df[0], col:df[1], h:t.h, s:t.s, ar:t.ar, m:"", f:""}); }catch(e){} x.setTransform(1,0,0,1,0,0); try{ KAD_TH[id]=cv.toDataURL("image/jpeg",0.82); }catch(e){} }
    if(i<list.length) setTimeout(step, 16); };
  try{ Promise.all([document.fonts.load('60px "AmiriL"'), document.fonts.load('600 60px "FrauncesW"')]).then(step, step); }catch(e){ step(); } };
  if(window.KadArt) go(); else loadJs(["kad/kad2.js"], go); }
function vWrite(el){
  if(!WRT.some(function(x){ return x[0]===wrTab; })) wrTab="nota";
  el.innerHTML='<div class="dock"><div class="grp3'+(WRT.length>3?' grp4':'')+(WRT.length>4?' grp5':'')+'">'+WRT.map(function(x){ return '<button class="chip g3d'+(wrTab===x[0]?" on":"")+'" data-wr="'+x[0]+'">'+x[1]+' '+L2x(x[2],x[3])+'</button>'; }).join("")+'</div></div><div id="wrBody"></div>';
  el.querySelectorAll("[data-wr]").forEach(function(b){ b.onclick=function(){ wrTab=b.getAttribute("data-wr"); render(); document.getElementById("view").scrollTop=0; }; });
  var body=el.querySelector("#wrBody"), draw=function(t, box){ if(t==="kad"){ box.innerHTML=kadHtml(); kadThumbs(box); } else if(t==="buku") vBooks(box); else if(t==="karya") vKarya(box); else if(t==="dokumen") vDokumen(box); else if(t==="tekap") vTekap(box); else vNotes(box); }, wi=function(){ var i=0; WRT.forEach(function(x, k){ if(x[0]===wrTab) i=k; }); return i; };
  draw(wrTab, body);
  // swipe between Notes and Cards, the other one riding in beside the finger
  IbSwipe(body, {can:function(s){ var i=wi(); return s<0 ? i<WRT.length-1 : i>0; }, go:function(s){ wrTab=WRT[wi()+(s<0?1:-1)][0]; render(); },
    find:function(){ return document.querySelector("#view #wrBody"); },
    skip:function(){ var a=document.activeElement; return a && /INPUT|TEXTAREA/.test(a.tagName); },
    peek:function(s){ var w=WRT[wi()+(s<0?1:-1)]; if(!w) return null; if(w[0]==="buku") return '<div class="card mut">📚 '+L2x("Buku","Books")+'</div>'; if(w[0]==="karya") return '<div class="card mut">✒️ '+L2x("Karya","Write")+'</div>'; if(w[0]==="dokumen") return '<div class="card mut">📄 '+L2x("Dokumen","Documents")+'</div>'; if(w[0]==="tekap") return '<div class="card mut">✍️ '+L2x("Tekap","Trace")+'</div>'; var b=document.createElement("div"); draw(w[0], b); return b.innerHTML; }});
}

// ---------- TETAPAN: a hub of seven pages ----------
var MGRP=[["paparan","🖥","Paparan & bahasa","Display & language",["🌐","🎨","🖥"]],["lokasi","🌍","Lokasi & waktu","Location & times",["⚙","⏱","🌍","💾"]],["makluman","🔔","Makluman","Alerts",["🔔"]],["rakaat","🧎","Kiraan rakaat","Rakaat counter",["🤲"]],["khas","🌸","Mod khas","Special modes",["🌸"]],["sandaran","🗄","Sandaran & tentang","Backup & about",["🗄","ℹ"]],["ai","✨","AI dalam talian","Online AI",[]],["keluarga","👨‍👩‍👧","Pautan keluarga","Family link",[]]];   // 0.7.59 (owner): Online AI under Backup, with Ask AI
var MGRP_KW={paparan:"bahasa language rumi suara voice nada pitch tema theme saiz teks text size malam night pautan links ramadan",lokasi:"zon zone negeri state hijrah hijri pelarasan adjust minit minutes rumah home musafir travel luar talian offline kaedah method",makluman:"notifikasi notifications makluman alerts imsak syuruk tahajjud ma'thurat puasa fast skrin kunci lock screen azan penggera alarm",rakaat:"senyap silent jangan ganggu dnd getar vibrate sensor wajah face kalibrasi calibrate langkah step",khas:"uzur haid nifas sakit sick warga emas senior kanak-kanak kids pin kunci lock fokus focus pomodoro",ai:"ai kunci key api model halal tanya",keluarga:"keluarga family pasangan spouse suami isteri husband wife datuk nenek grandparent penjaga carer kongsi share perancang planner pautan link",sandaran:"lawatan tour panduan aplikasi sandaran backup pulih restore tentang about lesen licence"};
// 0.26.0: Tetapan is one continuous page; every group is collapsed and only the one you tap opens (accordion).
// 0.27.0: 8 voice styles for each reading language (Arabic, Malay, English): every installed phone voice, then pitch/speed variations of them
var VSTY=[[1,1,"Biasa","Normal"],[0.85,0.92,"Dalam","Deep"],[1.15,1,"Ringan","Light"],[1,0.8,"Perlahan","Slow"],[0.72,0.88,"Paling dalam","Deepest"],[1.3,1.05,"Tinggi","High"],[1,1.15,"Laju","Fast"],[0.9,0.75,"Tenang","Calm"]], vLang="ar", vCache={};
var VSAMPLE={ar:"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", ms:"Assalamualaikum. Semoga hari anda diberkati Allah.", en:"Peace be upon you. May Allah bless your day."};
function vStyles(list){ var out=[], nv=list.length;
  for(var i=0;i<8;i++){ var v=nv?list[i%nv]:null, pr=nv?(i<nv?VSTY[0]:VSTY[1+Math.floor((i-nv)/nv)%7]):VSTY[i]; out.push({n:v?v.n:"", male:v?v.male:null, net:v?v.net:false, p:pr[0], r:pr[1], lab:L2x(pr[2],pr[3])}); }
  return out; }
function vSay(lang, st){
  var t=VSAMPLE[lang];
  if(window.Native && N.speak){ if(N.setVoiceFor) N.setVoiceFor(lang, st.n, st.p, st.r); N.speak(lang==="ar"?waqfAr(t):t, lang); return; }
  try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(t); u.lang=lang==="ar"?"ar-SA":lang==="ms"?"ms-MY":"en-GB"; u.pitch=st.p; u.rate=st.r*(lang==="ar"?0.8:0.95); var vv=speechSynthesis.getVoices().filter(function(v){ return v.name===st.n; })[0]; if(vv) u.voice=vv; speechSynthesis.speak(u); }catch(e){}
}
function voiceCard(){
  // 0.5.69 (owner): the three reading voices (Arabic, Malay, English) are three dropdowns, 8 choices each
  var c=document.createElement("div"); c.className="card"; c.id="vStyCard"; var LG=[["ar","العربية","Arab","Arabic"],["ms","Melayu","Melayu","Malay"],["en","English","Inggeris","English"]];
  var draw=function(){
    c.innerHTML='<h3>🌐 '+L2x("Suara bacaan: 8 pilihan setiap bahasa","Reading voice: 8 choices per language")+'</h3>'+LG.map(function(x){ var list=vCache[x[0]], cur=(S.vsty||{})[x[0]];
      return '<div class="set"><span>'+x[1]+'</span>'+(list?'<select data-vsl="'+x[0]+'" style="flex:1;min-width:0;max-width:64%;padding:6px">'+(cur?'':'<option value="" selected>'+L2x("Asal","Default")+'</option>')+vStyles(list).map(function(v,i){ return '<option value="'+i+'"'+(cur&&cur.i===i?' selected':'')+'>'+L2x("Suara ","Voice ")+(i+1)+' · '+(v.male===true?"♂ ":v.male===false&&v.n?"♀ ":"")+esc(v.lab)+(v.net?" ☁":"")+'</option>'; }).join("")+'</select>':'<span class="mut small">…</span>')+'<button class="chip" data-vplay="'+x[0]+'" aria-label="▶">▶</button></div>'; }).join("")+
      '<div class="mut tiny">'+L2x("Pilih suara untuk setiap bahasa; ▶ untuk dengar. Pasang lebih banyak suara: Tetapan telefon → Teks ke pertuturan → Enjin Google → Pasang data suara.","Choose a voice for each language; ▶ to listen. Add voices: phone Settings → Text-to-speech → Google engine → Install voice data.")+'</div>';
    c.querySelectorAll("[data-vsl]").forEach(function(sl){ sl.onchange=function(){ var lg=sl.getAttribute("data-vsl"); if(sl.value===""){ return; } var i=+sl.value, st=vStyles(vCache[lg])[i]; S.vsty=S.vsty||{}; S.vsty[lg]={i:i, n:st.n, p:st.p, r:st.r}; if(lg==="ar"){ S.voice=st.n; S.pitch=st.p; } saveS(); vSay(lg, st); }; });
    c.querySelectorAll("[data-vplay]").forEach(function(b){ b.onclick=function(){ var lg=b.getAttribute("data-vplay"), cur=(S.vsty||{})[lg], l=vCache[lg]; var st=cur&&l?vStyles(l)[cur.i]:(l?vStyles(l)[0]:null); if(st) vSay(lg, st); }; });
  };
  var load_=function(lg){ if(vCache[lg]) return;
    if(window.Native && N.getVoicesFor){ var hv=function(r){ if(!r || r.lang!==lg) return; off("voices2",hv); vCache[lg]=r.list||[]; if(document.body.contains(c)) draw(); }; on("voices2",hv); N.getVoicesFor(lg); }
    else { var vs=[]; try{ vs=speechSynthesis.getVoices().filter(function(v){ return (lg==="ms"?/^(ms|id|in)/i:new RegExp("^"+lg,"i")).test(v.lang); }).map(function(v){ return {n:v.name, male:/male/i.test(v.name)&&!/female/i.test(v.name), net:!v.localService}; }); }catch(e){} vCache[lg]=vs; } };
  // one language at a time: the phone answers voices2 per request
  var i=0, nextL=function(){ if(i>=LG.length) return; var lg=LG[i++][0]; if(vCache[lg]){ nextL(); return; } load_(lg); var k=0, t=setInterval(function(){ if(vCache[lg] || !document.body.contains(c) || ++k>40){ clearInterval(t); nextL(); } }, 150); };
  draw(); nextL(); return c;
}
// 0.5.3 Tetapan › Paparan: tab bar order and size, and which notch buttons show
function barCard(){ var c=document.createElement("div"); c.className="card"; var nh=S.ntHide||{};
  c.innerHTML='<h3>🖥 '+L2x("Bar tab & takuk","Tab bar & notch")+'</h3><div class="btns"><button class="btn alt g3d" id="bcEdit">🔓 '+L2x("Susun tab","Arrange tabs")+'</button><button class="btn alt g3d" id="bcReset">↺ '+L2x("Set semula","Reset")+'</button></div>'+
    '<label class="set" style="margin-top:8px"><span>'+L2x("Saiz bar tab","Tab bar size")+' <b id="bcSzV">'+(S.barSize||0)+'</b></span><input type="range" min="0" max="5" step="1" id="bcSz" value="'+(S.barSize||0)+'"></label>'+
    '<div class="mut tiny">'+L2x("0 biasa · 2 tanpa jarak · 3 tanpa label · 4 ikon kecil · 5 teks sahaja","0 default · 2 no margins · 3 no labels · 4 small icons · 5 text only")+'</div>'+
    '<div class="snl" style="margin-top:10px">'+L2x("Takuk tepi","Side notches")+'</div>'+notchCtlHtml()+
    '<div class="snl" style="margin-top:10px">'+L2x("Butang takuk (atas bar tab)","Notch buttons (above the tab bar)")+'</div>'+
    [["T","▾",L2x("Sembunyi / tunjuk semua bar","Hide / show all bars")],["A","✕",L2x("Auto-sembunyi semasa tatal","Auto-hide while scrolling")],["L","🔒",L2x("Kunci / susun bar","Lock / arrange bars")]].map(function(x){ return '<label class="set"><span>'+x[1]+' '+x[2]+'</span><input type="checkbox" data-nth="'+x[0]+'"'+(nh[x[0]]?'':' checked')+'></label>'; }).join("");
  c.querySelector("#bcEdit").onclick=function(){ go(homeV()); setTimeout(function(){ barEditSet(true); }, 200); };
  c.querySelector("#bcReset").onclick=function(){ S.tabOrder=null; S.subOrder={}; S.barSize=0; barSizeApply(0); saveS(); render(); toast(L2x("Susunan dan saiz asal","Original order and size")); };
  notchCtlBind(c);
  var sz=c.querySelector("#bcSz"); sz.oninput=function(){ S.barSize=+sz.value; c.querySelector("#bcSzV").textContent=sz.value; barSizeApply(S.barSize); dockFix(); }; sz.onchange=function(){ saveS(); };
  c.querySelectorAll("[data-nth]").forEach(function(x){ x.onchange=function(){ S.ntHide=S.ntHide||{}; S.ntHide[x.getAttribute("data-nth")]=!x.checked; saveS(); notchFix(); }; });
  return c; }
function vMore(el){
  vMore0(el);
  if(!WEB) el.appendChild(voiceCard());
  el.appendChild(nameCard());
  el.appendChild(barCard());
  var cards=[].slice.call(el.children);
  var sen=el.querySelector("#sSenior"), senRow=sen?sen.closest(".set"):null;
  var acc=document.createElement("div"); acc.className="macc";
  MGRP.forEach(function(G){
    if(WEB && IOS && ["makluman"].indexOf(G[0])>=0) return;   // 0.7.57 (owner): Online AI and the Rakaat counter settings are on iOS too   // 0.6.56: the web app has notifications (while open) and AI
    var sec=document.createElement("div"); sec.className="mSec g3d"+(moreGrp===G[0]?" open":""); sec.setAttribute("data-sec",G[0]);
    sec.innerHTML='<button class="mHd" data-mg="'+G[0]+'"><span class="mgi">'+G[1]+'</span><span class="mgn">'+esc(L2x(G[2],G[3]))+'</span><span class="chev">⌄</span></button><div class="mBd"></div>';
    var bd=sec.querySelector(".mBd");
    cards.forEach(function(c){ if(c.id==="mqCard") return; var h=c.querySelector("h3"), tx=h?h.textContent.trim():""; if(G[4].some(function(e){ return tx.indexOf(e)===0; })){ c.style.display=""; bd.appendChild(c); } });
    if(G[0]==="khas"){
      var k=document.createElement("div"); k.className="card cmp"; k.innerHTML='<h3>👓 '+L2x("Warga emas & kanak-kanak","Seniors & children")+'</h3><div id="senSlot"></div><div class="btns" style="margin-top:8px"><button class="btn alt g3d" data-go="kids">🧒 '+T("kids")+'</button>'+(S.kidLock?'':'<button class="btn alt g3d" id="kLock">🔒 '+L2x("Kunci mod kanak-kanak","Lock kids mode")+'</button>')+(S.appLock||S.kidLock||WEB?'':'<button class="btn alt g3d" id="aLock">📌 '+L2x("Kunci seluruh aplikasi","Lock the whole app")+'</button>')+'</div><div class="mut tiny" style="margin-top:6px">'+L2x("Profil anak dan PIN diurus dalam Mod kanak-kanak.","Child profiles and the PIN are managed in Kids mode.")+'</div>';
      bd.appendChild(k); if(senRow) k.querySelector("#senSlot").appendChild(senRow);
      var kl=k.querySelector("#kLock"); if(kl) kl.onclick=function(){ kidLockOn(); };
      var al=k.querySelector("#aLock"); if(al) al.onclick=function(){ appLockOn(); };
      var fo=document.createElement("div"); fo.className="card cmp"; fo.innerHTML='<h3>🎯 '+L2x("Fokus","Focus")+'</h3><div class="mut small" style="margin-bottom:8px">'+L2x("Sesi fokus, Pomodoro, Jangan Ganggu, pelan fokus waktu solat, kunci skrin fokus dan peringatan masa.","Focus sessions, Pomodoro, Do Not Disturb, prayer-time focus plans, focus screen lock and Time Nudge.")+'</div><button class="btn alt g3d" id="foOpen">🎯 '+L2x("Masa › Fokus","Time › Focus")+' ›</button>';
      if(!WEB) bd.appendChild(fo); fo.querySelector("#foOpen").onclick=function(){ SUB2.cal="fokus"; go("cal"); };
      var pw=(load("ihsan_period",{})||{}).who||"", pc=document.createElement("div"); pc.className="card cmp";
      pc.innerHTML='<h3>🌸 '+L2x("Tab Haid (Masa)","Period tab (Time)")+'</h3><div class="mut small" style="margin-bottom:8px">'+L2x("Untuk wanita, suami yang menjejak isteri, atau sembunyikan.","For women, husbands tracking their wife, or hide it.")+'</div><div class="btns">'+
        [["self",L2x("Saya","Me")],["spouse",L2x("Isteri saya","My wife")],["off",L2x("Sembunyi","Hidden")]].map(function(o){ return '<button class="chip'+(pw===o[0]?' on':'')+'" data-pwho="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>';
      pc.querySelectorAll("[data-pwho]").forEach(function(b){ b.onclick=function(){ var p=load("ihsan_period",{})||{}; p.who=b.getAttribute("data-pwho"); save("ihsan_period",p); toast(p.who==="off"?L2x("Tab Haid disembunyikan","Period tab hidden"):L2x("Tab Haid ditunjukkan dalam Masa","Period tab shown in Time")); render(); }; });
      bd.appendChild(pc);
    }
    if(G[0]==="sandaran"){ var tc=document.createElement("div"); tc.className="card cmp"; tc.id="tourCard"; bd.insertBefore(tc, bd.firstChild); tourLoad(function(){ IhsanTour.card(tc); }); }
    if(G[0]==="sandaran"){ var pvc=document.createElement("div"); pvc.className="card cmp"; pvc.id="privCard"; bd.appendChild(pvc); privCard(pvc); }
    acc.appendChild(sec);
  });
  cards.forEach(function(c){ if(c.parentNode===el) c.style.display="none"; });
  el.insertBefore(acc, el.firstChild);
  // 0.4.3: the launcher tickbox is the first thing in Paparan & bahasa
  var pap=acc.querySelector('[data-sec="paparan"] .mBd'); if(pap && !WEB){ var hc=document.createElement("div"); hc.className="card cmp"; hc.id="homeCard"; pap.insertBefore(hc, pap.firstChild); homeCard(hc); }
  var ab=acc.querySelector("#aboutCard"); if(ab && !ab.querySelector(".rvList")) ab.insertAdjacentHTML("beforeend", reviewListHtml());
  var ver=document.createElement("div"); ver.className="mut tiny"; ver.style.padding="0 4px 12px"; ver.textContent="My Ihsan "+APP_VER; acc.appendChild(ver);
  acc.querySelectorAll("[data-mg]").forEach(function(b){ b.onclick=function(){ var g=b.getAttribute("data-mg");
    var sec=b.parentNode, was=sec.classList.contains("open"); if(was && window.innerWidth>=840) return;
    acc.querySelectorAll(".mSec.open").forEach(function(x){ x.classList.remove("open"); });
    if(!was){ sec.classList.add("open"); moreGrp=g; if(g==="ai") aiSetMount(sec.querySelector(".mBd")); if(g==="keluarga") famSetMount(sec.querySelector(".mBd")); var v=el.closest(".setpb")||document.getElementById("view"); setTimeout(function(){ v.scrollTop=Math.max(0, sec.offsetTop-8); },0); } else moreGrp=null; }; });
  if(moreGrp==="ai"){ var aiB=acc.querySelector('[data-sec="ai"] .mBd'); if(aiB) aiSetMount(aiB); }
  if(moreGrp==="keluarga"){ var fmB=acc.querySelector('[data-sec="keluarga"] .mBd'); if(fmB) famSetMount(fmB); }
  // 0.5.20 (review 16): wide screens show sections | content, so one section is always open there
  if(window.innerWidth>=840 && !acc.querySelector(".mSec.open")){ var f0=acc.querySelector(".mSec"); if(f0 && f0.getAttribute("data-sec")!=="ai") f0.classList.add("open"); }
}
// ---------- 0.5.5 Tetapan as a right-hand panel: 80% wide by default; drag the notch on its left edge (60-100%) ----------
var setOn=false;
function setPanel(){ var p=document.getElementById("setp"); if(p) return p;
  p=document.createElement("aside"); p.id="setp";
  p.innerHTML='<div class="setph"><b>⚙ <span id="setT"></span></b><button class="sdc" id="setX" aria-label="✕">✕</button></div><div class="setpb" id="setB"></div><div class="setpg noswipe" id="setG"><i></i></div>';
  var sc=document.createElement("div"); sc.id="setScrim"; document.body.appendChild(sc); document.body.appendChild(p);
  sc.onclick=function(){ setShow(false); }; p.querySelector("#setX").onclick=function(){ setShow(false); };
  // 0.5.20 round 2, request 10: Settings opens where you left it (open section and scroll position)
  var sb=p.querySelector("#setB"), stT=null; sb.addEventListener("scroll", function(){ clearTimeout(stT); stT=setTimeout(function(){ if(setOn) save("ihsan_setlast", {g:moreGrp, y:sb.scrollTop}); }, 200); }, {passive:true});
  sb.addEventListener("click", function(){ setTimeout(function(){ if(setOn) save("ihsan_setlast", {g:moreGrp, y:sb.scrollTop}); }, 80); });
  var g=p.querySelector("#setG"), x0=null, w=0;
  g.addEventListener("pointerdown", function(e){ x0=e.clientX; w=0; p.classList.add("drag"); try{ g.setPointerCapture(e.pointerId); }catch(er){} e.preventDefault(); });
  g.addEventListener("pointermove", function(e){ if(x0===null) return; w=Math.max(60, Math.min(100, Math.round((window.innerWidth-e.clientX)*100/window.innerWidth))); p.style.width=w+"vw"; });
  var up=function(){ if(x0===null) return; x0=null; p.classList.remove("drag"); if(w){ S.setW=w; saveS(); } }; g.addEventListener("pointerup", up); g.addEventListener("pointercancel", up);
  return p; }
function setShow(on){ if(on && S.appLock && !S.kidLock) return; var p=setPanel(); setOn=!!on; p.style.width=(S.setW||80)+"vw";
  p.querySelector("#setT").textContent=L2x("Tetapan","Settings"); p.querySelector("#setG").setAttribute("aria-label", L2x("Seret untuk ubah lebar","Drag to resize"));
  p.classList.toggle("on", setOn); document.getElementById("setScrim").classList.toggle("on", setOn); document.body.classList.toggle("setOn", setOn);
  if(setOn){ if(sideOpen) sideShow(false); setDraw(); } }
function setDraw(){ var b=document.getElementById("setB"); if(!b || !setOn) return; var y=b.scrollTop; b.innerHTML=""; try{ vMore(b); }catch(err){ console.error(err); } b.scrollTop=y; }
window.L2x=L2x; window.APP_VER=APP_VER;   // 0.6.24: ai/airun.js speaks the app language
window.openSettings=function(g){ var last=g?null:(load("ihsan_setlast",null)||null); moreGrp=g||(last&&last.g)||null; var was=setOn; setShow(true); var b=document.getElementById("setB");
  if(last && b && !was){ setTimeout(function(){ b.scrollTop=last.y||0; }, 80); return; }
  if(g && b){ setTimeout(function(){ var sec=b.querySelector('[data-sec="'+g+'"]'); if(sec) b.scrollTop=Math.max(0, sec.offsetTop-8); }, 60); } else if(!was && b) b.scrollTop=0; };
// Tetapan › AI dalam talian (ai/aiset.js, with halal/halal_ai.js)
// 0.7.67 (owner): Settings › Family link: share the children's planners with a spouse / carer
function famSetMount(bd){ if(!bd) return; var fl=load("ihsan_famlink",null), n=fl&&fl.links?fl.links.length:0;
  bd.innerHTML='<div class="mut small" style="padding:4px 2px 8px;line-height:1.45">'+L2x("Kongsi perancang setiap anak dengan pasangan, datuk nenek atau penjaga, dan saling memaklumkan. Disulitkan, tiada akaun.","Share each child's planner with your spouse, a grandparent or a carer, and notify each other. Encrypted, no account.")+'</div>'+(n?'<div class="small" style="margin-bottom:8px">🔗 '+n+' '+L2x("pautan","linked")+'</div>':'')+'<button class="btn gold full g3d" id="famOpen">🔗 '+L2x("Pautkan ibu bapa / penjaga","Link a parent / carer")+'</button>';
  bd.querySelector("#famOpen").onclick=function(){ var go_=function(){ FamLink.open(kpH(null)); }; if(window.FamLink) go_(); else loadJs(["groups/nostrkit.js","famlink/famlink.js"].filter(function(f){ return !(f==="groups/nostrkit.js" && window.NostrKit); }), go_, function(){ toast(L2x("Gagal dimuatkan","Could not load")); }); }; }
function aiSetMount(bd){ if(!bd) return; bd.innerHTML='<div class="mut small" style="padding:8px">'+L2x("Memuatkan…","Loading…")+'</div>';
  if(!document.querySelector('link[href="halal/halal.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="halal/halal.css"; document.head.appendChild(lk); }
  var go_=function(){ if(!document.body.contains(bd)) return; bd.innerHTML='<div class="askSimple" id="askBox"></div><div id="aiSetBox"></div>';
    try{ AISet.render(bd.querySelector("#aiSetBox"), {N:N, S:S, esc:esc, L2x:L2x, toast:toast, load:load, save:save, on:on, off:off}); }catch(err){ console.error(err); }
    try{ vIlmu(bd.querySelector("#askBox"), "askai", true); }catch(err){ console.error(err); } };   // 0.7.59 (owner): Ask AI (explanation + text box) sits at the top of Online AI
  if(window.AISet && window.HalalAI) go_(); else loadJs((window.HalalAI?[]:["halal/halal_ai.js"]).concat(window.AISet?[]:["ai/aiset.js"]), go_, function(){ bd.innerHTML='<div class="card">'+L2x("Gagal dimuatkan","Could not load")+'</div>'; }); }
var APP_VER="0.7.88";
// ---------- 0.4.3 phone home screen (launcher) ----------
function homeCard(c){
  var st={}; try{ st=JSON.parse(N.homeState?N.homeState():"{}"); }catch(e){}
  c.innerHTML='<h3>📱 '+L2x("Skrin utama telefon","Phone home screen")+'</h3><label class="set" style="gap:10px"><span><b>'+L2x("Jadikan My Ihsan skrin utama telefon","Use My Ihsan as the phone's home screen")+'</b></span><input type="checkbox" id="hmOn"'+(st.on?' checked':'')+' style="width:22px;height:22px;accent-color:var(--gold)"></label>'+
    '<div class="mut tiny" style="margin:2px 0 8px;line-height:1.45">'+(st.on&&st.def?'✅ '+L2x("Aktif. Tab Utama kini halaman suapan di kiri skrin utama telefon.","Active. The Utama tab is now the feed page on the left of the phone home screen."):st.on?'⚠ '+L2x("Pilih My Ihsan sebagai pelancar dalam tetingkap Android.","Choose My Ihsan as the launcher in the Android window."):L2x("Seperti Nova Launcher: widget telefon, folder, laci aplikasi, isyarat, grid hingga 15×15, dengan widget My Ihsan.","Like Nova Launcher: phone widgets, folders, app drawer, gestures, grid up to 15×15, with My Ihsan widgets."))+'</div>'+
    '<div class="btns"><button class="btn alt g3d" id="hmSet">⚙ '+L2x("Tetapan skrin utama","Home screen settings")+'</button>'+(st.on?'<button class="btn alt g3d" id="hmGo">🏠 '+L2x("Buka","Open")+'</button>':'')+'</div>';
  var cb=c.querySelector("#hmOn"); cb.onchange=function(){ if(!window.Native||!N.homeEnable){ toast(L2x("Dalam aplikasi telefon sahaja","In the phone app only")); cb.checked=false; return; } N.homeEnable(cb.checked); launcherOn.c=null; };
  c.querySelector("#hmSet").onclick=function(){ openHomeSet(); };
  var g=c.querySelector("#hmGo"); if(g) g.onclick=function(){ N.homeGo(); };
}
function openHomeSet(sec){
  if(!document.querySelector('link[href="home/homeset.css"]')){ var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="home/homeset.css"; document.head.appendChild(lk); }
  loadJs(["home/homeset.js"], function(){ HomeSet.open({L2x:L2x, esc:esc, showSheet:showSheet, closeOverlay:closeOverlay, toast:toast, S:S, onClose:function(){ launcherOn.c=null; render(); }}, sec); });
}
on("homeimport", function(r){ if(r && r.cancel) return; toast(r && r.ok ? "✅ "+L2x("Diimport: ","Imported: ")+(r.msg||"") : "⚠ "+L2x("Tidak dapat diimport","Could not import")+(r && r.msg ? ": "+r.msg : "")); if(window.HomeSet) HomeSet.refresh(); });
on("homestate", function(){ launcherOn.c=null; if(window.HomeSet) HomeSet.refresh(); var hc=document.getElementById("homeCard"); if(hc) homeCard(hc); render(); });

// ---------- Home shortcuts: pick your own 8 ----------
var Q8=[["rk","🕌",["Kira rakaat","Count rakaat"],"q-rk"],["qibla","🧭",["Kiblat","Qibla"],"q-qibla"],["tasbih","📿",["Tasbih","Tasbih"],"q-tasbih"],["mathurat","📖",["Ma'thurat","Ma'thurat"],"q-mathurat"],["doa","🤲",["Doa","Doa"],"q-doa"],["amal","🌱",["Amal sunat","Sunnah deeds"],"q-amal"],["kids","🧒",["Kanak-kanak","Kids"],"q-kids"],["finder","📍",["Cari","Find"],"q-finder"],
  ["halal","🏷️",["Halal","Halal"],"w:sc-halal"],["barcode","🛒",["Kod bar","Barcode"],"w:sc-barcode"],["sirah","🐪",["Sirah","Sirah"],"w:sc-sirah"],["hajj","🕋",["Haji 3D","Hajj 3D"],"w:sc-hajj"],["umrah","🧳",["Umrah DIY","Umrah DIY"],"w:sc-umrahdiy"],["tawaf","🔢",["Tawaf","Tawaf"],"w:sc-tawaf"],["cal","📅",["Masa","Time"],"w:sc-cal"],["radio","📻",["Radio","Radio"],"w:sc-radio"],["qcam","📷",["Kiblat kamera","Qibla camera"],"w:sc-qcam"],["kad","🎴",["Kad ucapan","Cards"],"w:sc-kad"],["saham","📈",["Saham","Stocks"],"w:sc-saham"],["stat","📊",["Statistik","Stats"],"w:sc-stat"]];
HC.quick=function(){
  var sel=(S.quick8&&S.quick8.length)?S.quick8:["rk","qibla","tasbih","mathurat","doa","amal","kids","finder"];
  if(WEB){ var WQ=["qibla","finder","halal","barcode","radio","qcam","saham","stat"]; if(!(S.quick8&&S.quick8.length)) sel=["rk","tasbih","mathurat","doa","amal","kids","sirah","hajj"]; sel=sel.filter(function(k){ return WQ.indexOf(k)<0; }); }
  return '<div class="card qgrid">'+sel.map(function(k){ var q=Q8.filter(function(x){ return x[0]===k; })[0]; if(!q) return ''; var a=q[3].indexOf("w:")===0?'data-wsc="'+q[3].slice(2)+'"':'data-act="'+q[3]+'"'; return '<button class="qt g3d" '+a+'><span>'+q[1]+'</span>'+esc(L2x(q[2][0],q[2][1]))+'</button>'; }).join("")+'<button class="qt g3d q8e" data-act="pick8" aria-label="edit"><span>✎</span>'+L2x("Pilih","Pick")+'</button></div>';
};
function homeAct(a){ if(a==="pick8"){ pick8(); return; } if(a==="q-dokumen"){ wrTab="dokumen"; SUB2.alat="nota"; go("alat"); return; } if(a==="q-tax"){ SUB2.fin="cukai"; go("fin"); return; } if(a==="q-tekap"){ wrTab="tekap"; SUB2.alat="nota"; go("alat"); return; } if(a==="q-tekap-wod"){ wrTab="tekap"; SUB2.alat="nota"; go("alat"); var n0=0, t0=setInterval(function(){ if(window.TekapLearn && window.Tekap || ++n0>60){ clearInterval(t0); if(window.TekapLearn){ var q=TekapLearn.wodProject(Tekap._t.api()); Tekap._t.api().go("edit",{id:q.id, sel:q.layers[0]&&q.layers[0].id}); } } },120); return; } if(a==="q-books"){ SUB2.learn="buku"; learnPg=null; learnFrom=null; go("learn"); return; } if(a.indexOf("q-book:")===0){ var bid=a.slice(7); SUB2.learn="buku"; learnPg=null; learnFrom=null; go("learn"); withBooks(function(){ BooksView.open(bid, bkH()); }); return; } if(a==="q-period"){ SUB2.cal="haid"; go("cal"); return; } if(a==="q-resepi"||a==="q-rplan"){ halalAuto=a==="q-rplan"?"rplan":"recipes"; if(window.HalalRecipe) HalalRecipe.open(a==="q-rplan"?"plan":"list"); SUB2.alat="halal"; go("alat"); return; } if(a==="q-khutbah"){ khutbahSheet(); return; } if(a==="q-stat"){ SUB2.cal="statistik"; go("cal"); return; } if(a==="q-nota"){ SUB2.alat="nota"; go("alat"); return; } if(a==="q-kiblat"){ SUB2.solat="kiblat"; go("solat"); return; } homeAct0(a); }
// 0.2.9: recipe builder shortcut + today's menu from the meal plan
WG["sc-dokumen"]=scW("tools","📄","Tulis surat","Write a letter","q-dokumen","Surat, e-mel, CV dan 50 jenis dokumen","Letters, emails, CVs and 50 document types");   // 0.6.60
WG["sc-tekap"]=scW("tools","✍️","Tekap huruf","Trace letters","q-tekap","Old English, Naskh dan gambar di atas kertas","Old English, Naskh and pictures on paper");   // 0.6.63
WG["sc-resepi"]=scW("tools","🍲","Resepi halal","Halal recipes","q-resepi","Simpan & tukar resepi jadi halal","Save recipes & make them halal");
// Sports (Move › Sports): the same sport for everyone each day; a tap opens it (sport/sport_list.js sets the mode and the sport)
WG["sport-day"]=cardW("kal","🏅","Sukan hari ini","Sport of the day",function(w){ if(!window.SportList) return ''; var s=SportList.today();
  return '<div class="card" data-sportgo="1" data-sotd="'+s[0]+'"><div class="mut tiny">🏅 '+L2x("Sukan hari ini","Sport of the day")+'</div><div style="display:flex;align-items:center;gap:10px;margin-top:2px"><span style="font-size:30px;line-height:1">'+s[1]+'</span><div><b>'+esc(L2x(s[2],s[3]))+'</b>'+(w>=3?'<div class="mut tiny">'+L2x("Peraturan, padang 3D, kuiz & permainan","Rules, 3D field, quiz & a game")+'</div>':'')+'</div></div></div>'; },[4,2],[2,2]);
WG["rcp-today"]=cardW("tools","🍽️","Menu hari ini","Today's menu",function(){ var p=load("ihsan_rcp_plan",{}), rs=load("ihsan_recipes",[]), ids=p[ymd(new Date())]||[];
  var l=ids.map(function(id){ for(var i=0;i<rs.length;i++) if(rs[i].id===id) return rs[i].title; return null; }).filter(Boolean);
  return '<div data-act="q-rplan"><div class="mut tiny">🍽️ '+L2x("Menu hari ini","Today's menu")+'</div>'+(l.length?l.slice(0,3).map(function(t){ return '<div class="small"><b>'+esc(t)+'</b></div>'; }).join(""):'<div class="mut small">'+L2x("Belum dirancang. Ketik untuk merancang.","Nothing planned. Tap to plan.")+'</div>')+'</div>'; },[2,2],[2,1]);
WG["sc-stat"]=scW("stats","📊","Statistik","Stats","q-stat","Masa guna & solat dikira","Time spent & prayers counted");
WG["steps"]=cardW("stats","🚶","Langkah hari ini","Steps today",function(){ var t=ymd(new Date()), o=stepMap()[t]||{s:0,a:0}, g=S.stepGoal||6000;
  if(!S.stepsOn) return '<div class="small">🚶 '+L2x("Pengiraan langkah belum dihidupkan. Buka Statistik untuk mula.","Step counting is off. Open Stats to start.")+'</div><button class="btn alt full g3d" data-act="q-stat" style="margin-top:6px">📊 '+L2x("Statistik","Stats")+'</button>';
  return '<div class="urow" data-act="q-stat"><div><div class="mut tiny">'+L2x("Langkah","Steps")+'</div><div class="ubig">'+fmtSteps(o.s)+'</div></div><div><div class="mut tiny">'+L2x("Aktif","Active")+'</div><div class="ubig gold">'+(o.a||0)+' min</div></div></div><div class="ubar1"><i style="width:'+Math.min(100,Math.round(o.s*100/g))+'%"></i></div>'; },[4,2],[2,2]);
WG["screen"]=cardW("stats","📱","Masa skrin telefon","Phone screen time",function(){ var t=ymd(new Date());
  if(!hasUsageAcc()) return '<div class="small">📱 '+L2x("Benarkan akses penggunaan dalam Statistik untuk melihat masa skrin.","Allow usage access in Stats to see screen time.")+'</div><button class="btn alt full g3d" data-act="q-stat" style="margin-top:6px">📊 '+L2x("Statistik","Stats")+'</button>';
  var sc=screenMap(t,t)[t]||0; return '<div class="urow" data-act="q-stat"><div><div class="mut tiny">'+L2x("Skrin hidup hari ini","Screen on today")+'</div><div class="ubig">'+hmShort(sc)+'</div></div><div><div class="mut tiny">My Ihsan</div><div class="ubig gold">'+durHMS(usageLive())+'</div></div></div>'; },[4,2],[2,2]);
function pick8(){
  var sel=((S.quick8&&S.quick8.length)?S.quick8:["rk","qibla","tasbih","mathurat","doa","amal","kids","finder"]).slice();
  var body=function(){ return '<div class="mut small" style="margin-bottom:6px">'+L2x("Pilih hingga 8 pintasan. Dipilih: ","Pick up to 8 shortcuts. Picked: ")+'<b>'+sel.length+'/8</b></div>'+Q8.map(function(q){ var on_=sel.indexOf(q[0])>=0; return '<div class="set"><span>'+q[1]+' '+esc(L2x(q[2][0],q[2][1]))+'</span><button class="chip g3d'+(on_?" on":"")+'" data-q8="'+q[0]+'">'+(on_?"✓":"＋")+'</button></div>'; }).join("")+'<button class="btn gold full g3d" id="q8Ok" style="margin-top:10px">'+L2x("Simpan","Save")+'</button>'; };
  var ov=showSheet("✎ "+L2x("Pintasan (8 dalam satu)","Shortcuts (8 in one)"), body());
  var bind=function(){ var b=ov.querySelector(".shb");
    b.querySelectorAll("[data-q8]").forEach(function(x){ x.onclick=function(){ var k=x.getAttribute("data-q8"), i=sel.indexOf(k); if(i>=0) sel.splice(i,1); else if(sel.length<8) sel.push(k); else { toast(L2x("Maksimum 8","8 at most")); return; } var st=b.scrollTop; b.innerHTML=body(); bind(); b.scrollTop=st; }; });
    b.querySelector("#q8Ok").onclick=function(){ S.quick8=sel; saveS(); closeOverlay(); render(); }; };
  bind();
}

// ---------- report a mistake under Arabic text ----------
function arBlock(ar, ms, en, src){ var o={ar:ar,text:L2x(ms,en),src:src||""}; return '<div class="ar" style="font-size:calc(var(--arsize) - 2px);line-height:1.9">'+ar+'</div>'+rumiDiv(ar)+'<div class="tr">'+esc(L2x(ms,en))+'</div>'+(src?'<div class="src">'+srcHtml(src)+'</div>':'')+'<div class="tools">'+sayBtn(ar)+shareBtn(o)+'<button class="ib" data-rep="'+(SHR.length-1)+'">⚑ '+L2x("Lapor kesilapan","Report a mistake")+'</button></div>'; }
document.addEventListener("click", function(e){ var b=e.target.closest&&e.target.closest("[data-rep]"); if(!b) return; e.preventDefault(); var o=SHR[+b.getAttribute("data-rep")]||{};
  var pg=view+(learnPg?" › "+learnPg:"");
  var txt=L2x("Laporan kesilapan · My Ihsan 0.7.88","Mistake report · My Ihsan 0.7.88")+"\n"+L2x("Halaman: ","Page: ")+pg+"\n"+(o.ar?o.ar+"\n":"")+(o.text?o.text+"\n":"")+(o.src?L2x("Sumber: ","Source: ")+o.src+"\n":"")+L2x("Catatan saya: ","My note: ");
  if(window.Native && N.shareTo) N.shareTo("", "", txt); else if(navigator.share) navigator.share({text:txt}).catch(function(){}); else toast(txt); }, true);

// ---------- global search ----------
var SIDX=null;
function buildSearch(){
  var I=[], add=function(t,p,f){ I.push({t:t,p:p,f:f}); };
  tabsNow().forEach(function(n){ var lb=typeof n[2]==="string"?T(n[2]==="home"?"utama":n[2]):L2x(n[2][0],n[2][1]); add(n[1]+" "+lb, L2x("Tab","Tab"), function(){ go(n[0]); });
    (SUBS[n[0]]||[]).forEach(function(x){ add(x[1]+" "+subName(x), lb, function(){ if(n[0]==="sunat"){ sunPage=x[0]; save("ihsan_sunpage",x[0]); } else SUB2[n[0]]=x[0]; if(n[0]==="learn"){ learnPg=null; } go(n[0]); }); }); });
  LEARN.forEach(function(x){ add(x[1]+" "+L2x(x[2],x[3]), T("learn"), function(){ learnPg=x[0]; learnFrom=null; go("learn"); }); });
  SUNAT_LIST.forEach(function(x){ var nm=L2x(x.name.ms,x.name.en), where=x.top==="solat"?"Solat › "+L2x("Solat sunat","Sunnah prayers"):x.top==="bersuci"?T("learn")+" › "+L2x("Bersuci","Purification"):x.top==="haji"?T("learn")+" › "+L2x("Haji & Umrah","Hajj & Umrah"):T("sunat")+" › "+L2x("Amal sunat","Sunnah deeds");
    add(nm, where, function(){ sunOpen=x.id; if(x.top==="solat"){ sunCat=x.cat; SUB2.solat="ssunat"; go("solat"); } else if(x.top==="bersuci"||x.top==="haji"){ openGuide(x.top); } else { sunTop=x.top; go("amal"); } }); });
  DOA.forEach(function(c,i){ add("🤲 "+catName(c), "Doa", function(){ doaCat=i; doaQ=""; doaFav=false; doaMine=false; go("doa"); });
    (c.items||[]).forEach(function(it){ var nm=L2x(it.t_ms,it.t_en); if(nm) add(nm, "Doa › "+catName(c), function(){ doaQ=nm; doaFav=false; doaMine=false; go("doa"); }); }); });
  [["✨ "+T("asma"),"Zikir",function(){ sub.zikir="asma"; go("zikir"); }],["📿 Tasbih","Zikir",function(){ sub.zikir="tasbih"; go("zikir"); }],
   ["🐪 "+L2x("Sirah Nabi ﷺ","Sirah ﷺ"),T("learn"),function(){ openSirah(false); }],["🕋 "+L2x("Haji & Umrah 3D","Hajj & Umrah 3D"),T("learn"),function(){ openHajj(); }],["🧳 Umrah DIY",T("learn"),function(){ openUmrah(); }],
   ["🔢 "+L2x("Kaunter tawaf & sa'ie","Tawaf & sa'ie counter"),T("learn"),function(){ openTawaf(); }],["🔊 "+L2x("Latihan solat berpandu","Guided solat practice"),"Solat",function(){ openPractice(); }],["📷 "+L2x("Kiblat kamera","Qibla camera"),"Solat",function(){ openQiblaCam(); }],
   ["🧒 "+T("kids"),T("utama"),function(){ go("kids"); }],["📓 "+L2x("Muhasabah (jurnal)","Reflection journal"),T("cal"),function(){ SUB2.cal="bulan"; go("cal"); }],["🗒 "+L2x("Jadual waktu solat bulanan","Monthly prayer timetable"),"Solat",function(){ SUB2.solat="waktu"; go("solat"); }],
   ["📈 "+L2x("Saham patuh Syariah","Shariah stocks"),L2x("Kewangan","Finance"),function(){ SUB2.fin="tukaran"; finStk=true; go("fin"); }],["🛒 "+L2x("Imbas kod bar halal","Scan a halal barcode"),L2x("Alat","Tools"),function(){ halalAuto="barcode"; SUB2.alat="halal"; go("alat"); }],
   ["⏱ "+L2x("Masa penggunaan","Time spent"),T("cal"),function(){ SUB2.cal="statistik"; go("cal"); }]].forEach(function(x){ add(x[0],x[1],x[2]); });
  MGRP.forEach(function(g){ add(g[1]+" "+L2x(g[2],g[3]), T("more"), function(){ if(g[0]==="ai"){ openSettings("ai"); return; } moreGrp=g[0]; go("more"); }); });
  return I;
}
// ---------- 0.6.30 Google Drive sync + web dashboard (sync/drivesync.js). The ⟳ button in the top bar shows the state and opens this sheet ----------
var WEBDASH="https://myihsan.app/app/", dsTok=null, dsSeq=0;
function dsNative(){ return !!((window.Native || (WEB && window.IhsanWeb)) && N.driveToken); }   // 0.6.56: the web app signs in with Google too
function dsGetToken(interactive){ if(dsTok && dsTok.exp>Date.now()+60000) return Promise.resolve(dsTok.t); if(!dsNative()) return Promise.resolve(null);
  return new Promise(function(ok){ var id="dt"+(++dsSeq), t=setTimeout(function(){ off("drive",h); ok(null); }, 90000), h=function(r){ if(!r || r.id!==id) return; off("drive",h); clearTimeout(t);
      if(r.ok){ dsTok={t:r.token, exp:r.exp||Date.now()+50*60000}; ok(r.token); } else { if(r.err==="signin"||r.err==="consent"){ var m=DriveSync.meta(); m.err="signin"; DriveSync.saveMeta(); } ok(null); } };
    on("drive",h); N.driveToken(id, !!interactive); }); }
function dsInit(){ if(!window.DriveSync || DriveSync._app) return; DriveSync._app=1;
  DriveSync.init({apiBase:window.DRIVE_API_BASE, getToken:dsGetToken, invalidate:function(){ if(dsTok && N.driveInvalidate) N.driveInvalidate(dsTok.t); dsTok=null; }, play:!!window.IHSAN_PLAY,
    onStatus:dsPaint, onChanged:function(){ var ov=document.getElementById("overlay"); if(ov && ov.classList.contains("hidden")) try{ render(); }catch(e){} }});
  var go2=function(){ if(DriveSync.meta().signed && !S.kidLock) DriveSync.auto(); };
  setTimeout(go2, 8000); setInterval(go2, 5*60000); on("resume", function(){ setTimeout(go2, 1500); }); on("pause", go2); window.addEventListener("online", go2); }
function dsPaint(st){ var b=document.getElementById("hSync"); if(!b) return; st=st||DriveSync.status();
  var cls=st.state==="busy"?"busy":st.state==="ok"?(st.pending?"wait":"ok"):st.state==="off"?"off":"bad"; b.className="g3d hs-"+cls;
  b.title=dsText(st); var sh=document.getElementById("dsSt"); if(sh) sh.innerHTML=dsStatusHtml(st); }
function dsAgo(t){ if(!t) return L2x("belum pernah","never"); var m=Math.round((Date.now()-t)/60000); return m<1?L2x("baru tadi","just now"):m<60?m+L2x(" min lalu"," min ago"):m<1440?Math.round(m/60)+L2x(" jam lalu"," h ago"):Math.round(m/1440)+L2x(" hari lalu"," d ago"); }
function dsText(st){ if(st.state==="busy") return L2x("Menyegerak dengan Google Drive…","Syncing with Google Drive…");
  if(st.state==="off") return L2x("Sync belum dihidupkan","Sync is not on");
  if(st.state==="signin") return L2x("Log masuk tamat. Ketik untuk log masuk","Sign-in expired. Tap to sign in");
  if(st.state==="full") return L2x("Google Drive penuh","Google Drive is full");
  if(st.state==="err") return (navigator.onLine===false?L2x("Luar talian","Offline"):L2x("Belum dapat sync","Could not sync"))+(st.pending?" · "+st.pending+L2x(" perubahan belum sync"," changes not synced"):"");
  return st.pending?"⏳ "+st.pending+L2x(" perubahan menunggu"," changes waiting"):L2x("Sync · ","Synced · ")+dsAgo(st.last); }
function dsStatusHtml(st){ var ic={busy:"⟳",ok:st.pending?"⚠":"✓",off:"○",signin:"✕",full:"✕",err:"⚠"}[st.state]||"○", cl={busy:"",ok:st.pending?"amber":"good",off:"",signin:"bad",full:"bad",err:"amber"}[st.state]||"";
  return '<div class="dsSt '+cl+'"><b>'+ic+'</b> '+esc(dsText(st))+'</div>'+(st.state!=="off"?'<div class="mut tiny">'+L2x("Terakhir: ","Last synced: ")+dsAgo(st.last)+' · '+L2x("Menunggu: ","Waiting: ")+(st.pending||0)+'</div>':''); }
function openSync(){ dsInit(); var m=DriveSync.meta(), st=DriveSync.status(), nat=dsNative(), noPlay=nat && N.playServicesOk && !N.playServicesOk();
  var link='<div class="snl">🌐 '+L2x("Buka di web (komputer, tablet, telefon lain)","Open on the web (laptop, tablet, another phone)")+'</div><div class="dsLink"><code>'+WEBDASH+'</code></div><div class="mut tiny">'+L2x("Pautan untuk dikongsi (berfungsi juga di Wi-Fi pejabat yang menyekat myihsan.app): ","Link to share (also works on office Wi-Fi that blocks myihsan.app): ")+'<code>'+SITE_GO+'?app/</code></div>'+
    '<div class="btns"><button class="btn gold g3d" id="dsCopy">📋 '+L2x("Salin pautan","Copy link")+'</button><button class="btn alt g3d" id="dsShare">📤 '+L2x("Kongsi","Share")+'</button><button class="btn alt g3d" id="dsOpen">↗ '+L2x("Buka","Open")+'</button></div>'+
    '<div class="mut tiny">'+L2x("Log masuk dengan akaun Google yang sama untuk melihat dan mengubah data anda.","Sign in with the same Google account to see and edit your data.")+'</div>';
  var body;
  if(noPlay) body='<div class="card mut">'+L2x("Sync Google memerlukan Google Play services. Anda masih boleh guna My Ihsan seperti biasa, dan eksport atau import fail sandaran.","Google sync needs Google Play services. You can still use My Ihsan normally, and export or import a backup file.")+'</div>';
  else if(!m.signed) body='<div class="card"><h3>☁️ '+L2x("Sync ke Google Drive anda","Sync to your Google Drive")+'</h3><div class="small">'+L2x("Data anda disimpan dalam folder tersembunyi aplikasi di Google Drive anda sendiri. Pembangun tidak dapat melihatnya. Selepas itu buka aplikasi web My Ihsan di mana-mana pelayar.","Your data is kept in a hidden app folder in your own Google Drive. The developer cannot see it. Then open the My Ihsan web app in any browser.")+'</div>'+
    (nat?'<button class="btn gold full g3d" id="dsIn" style="margin-top:10px"><b>G</b> '+L2x("Log masuk dengan Google","Sign in with Google")+'</button>':'<div class="mut small" style="margin-top:8px">'+L2x("Log masuk dalam aplikasi telefon.","Sign in from the phone app.")+'</div>')+'<div id="dsMsg" class="mut small"></div></div>'+link;
  else body='<div class="card"><div class="dsAcc">'+(m.photo?'<img src="'+esc(m.photo)+'" alt="">':'<i>👤</i>')+'<div><b>'+esc(m.name||m.email)+'</b><small class="mut">'+esc(m.email)+'</small></div><button class="chip" id="dsOut">'+L2x("Log keluar","Sign out")+'</button></div>'+
      '<div id="dsSt">'+dsStatusHtml(st)+'</div>'+
      '<button class="btn gold full g3d" id="dsNow" style="margin-top:8px">⟳ '+L2x("Sync sekarang","Sync now")+'</button>'+
      '<label class="dsTog"><input type="checkbox" id="dsAuto"'+(m.auto?" checked":"")+'><span><b>'+L2x("Sync automatik","Auto sync")+'</b><small class="mut">'+L2x("Bila dibuka, 5 saat selepas perubahan, dan bila keluar aplikasi.","On open, 5 s after a change, and when you leave the app.")+'</small></span></label>'+
      '<label class="dsTog"><input type="checkbox" id="dsWifi"'+(m.wifi?" checked":"")+'><span><b>'+L2x("Gambar melalui Wi-Fi sahaja","Photos over Wi-Fi only")+'</b></span></label></div>'+link+
    '<div class="snl">📂 '+L2x("Apa yang disegerak","What syncs")+'</div><div class="card">'+DriveSync.SECTIONS.filter(function(x){ return !(x[0]==="care" && window.IHSAN_PLAY); }).map(function(x){ return '<label class="dsTog"><input type="checkbox" data-dss="'+x[0]+'"'+(DriveSync.sectionOn(x[0])?" checked":"")+'><span><b>'+x[1]+' '+L2x(x[2],x[3])+'</b>'+(x[0]==="care"?'<small class="mut">'+L2x("Data kesihatan akan disimpan dalam Google Drive anda. Web akan minta PIN.","Health data will be saved in your Google Drive. The web asks for a PIN.")+'</small>':'')+'</span></label>'; }).join("")+'</div>'+
    (DriveSync.conflicts().length?'<div class="snl">⚠️ '+L2x("Konflik","Conflicts")+'</div><div class="card">'+DriveSync.conflicts().slice(0,20).map(function(c,i){ return '<div class="dsCf"><span><b>'+esc(c.key.replace("ihsan_",""))+'</b><small class="mut">'+L2x("Versi lain, ","Other version, ")+dsAgo(c.at)+'</small></span><button class="chip" data-dsr="'+i+'">↺ '+L2x("Pulihkan","Restore")+'</button></div>'; }).join("")+'</div>':'')+
    '<button class="btn alt full g3d" id="dsWipe" style="margin-top:10px">🗑 '+L2x("Padam data awan saya","Delete my cloud data")+'</button>';
  var ov=showSheet("⟳ "+L2x("Sync & aplikasi web","Sync & web app"), body);
  var q=function(id){ return ov.querySelector(id); }, again=function(){ closeOverlay(); openSync(); };
  if(q("#dsCopy")) q("#dsCopy").onclick=function(){ try{ if(window.Native && N.copyText) N.copyText(SITE_GO+"?app/"); else navigator.clipboard.writeText(SITE_GO+"?app/"); }catch(e){} toast(L2x("Pautan disalin","Link copied")); };
  if(q("#dsShare")) q("#dsShare").onclick=function(){ var t=L2x("Aplikasi web My Ihsan: ","My Ihsan web app: ")+SITE_GO+"?app/"; if(window.Native && N.shareText) N.shareText(t); else if(navigator.share) navigator.share({text:t}).catch(function(){}); };
  if(q("#dsOpen")) q("#dsOpen").onclick=function(){ siteBase(function(base){ var u=base+"app/"; if(window.Native && N.openUrl) N.openUrl(u); else window.open(u,"_blank"); }); };
  if(q("#dsIn")) q("#dsIn").onclick=function(){ var msg=q("#dsMsg"); msg.textContent="⏳";
    var h=function(r){ if(!r || r.id!=="signin") return; off("drive",h); if(!r.ok){ msg.textContent=r.err==="cancel"?"":"⚠️ "+L2x("Log masuk gagal: ","Sign-in failed: ")+r.err; return; }
      dsTok={t:r.token, exp:r.exp}; DriveSync.signedIn({email:r.email});
      fetch("https://www.googleapis.com/oauth2/v3/userinfo",{headers:{Authorization:"Bearer "+r.token}}).then(function(x){ return x.json(); }).then(function(u){ DriveSync.signedIn({email:u.email||r.email, name:u.name||"", photo:u.picture||""}); }).catch(function(){}).then(function(){ again(); DriveSync.sync({manual:true, full:true}); }); };
    on("drive",h); N.driveSignIn(); };
  if(q("#dsOut")) q("#dsOut").onclick=function(){ if(!confirm(L2x("Log keluar? Sync berhenti. Data di telefon dan di Drive kekal.","Sign out? Sync stops. Data on the phone and in Drive stays."))) return; if(N.driveSignOut) N.driveSignOut(dsTok?dsTok.t:""); dsTok=null; DriveSync.signedOut(); again(); };
  if(q("#dsNow")) q("#dsNow").onclick=function(){ if(DriveSync.status().state==="signin"){ dsGetToken(true).then(function(t){ if(t){ var mm=DriveSync.meta(); mm.err=""; DriveSync.saveMeta(); DriveSync.sync({manual:true}); } }); return; } DriveSync.sync({manual:true}).then(function(){ if(document.body.contains(ov)) again(); }); };
  if(q("#dsAuto")) q("#dsAuto").onchange=function(){ DriveSync.setAuto(this.checked); };
  if(q("#dsWifi")) q("#dsWifi").onchange=function(){ DriveSync.setWifi(this.checked); };
  ov.querySelectorAll("[data-dss]").forEach(function(c){ c.onchange=function(){ if(c.getAttribute("data-dss")==="care" && c.checked && !confirm(L2x("Data haid dan kesihatan akan disimpan dalam Google Drive anda. Teruskan?","Period and health data will be saved in your Google Drive. Continue?"))){ c.checked=false; return; } DriveSync.setOn(c.getAttribute("data-dss"), c.checked); }; });
  ov.querySelectorAll("[data-dsr]").forEach(function(b){ b.onclick=function(){ DriveSync.restoreConflict(+b.getAttribute("data-dsr")); toast("↺"); render(); again(); }; });
  if(q("#dsWipe")) q("#dsWipe").onclick=function(){ if(!confirm(L2x("Padam SEMUA data My Ihsan dalam Google Drive anda? Data di telefon ini kekal.","Delete ALL My Ihsan data in your Google Drive? Data on this phone stays."))) return; DriveSync.wipe().then(function(){ DriveSync.setAuto(false); toast(L2x("Data awan dipadam. Sync automatik dimatikan.","Cloud data deleted. Auto sync turned off.")); again(); }, function(e){ toast("⚠️ "+(e&&e.message||e)); }); };
}
function openSearch(q0){
  var q=typeof q0==="string"?q0:"", MGK=Object.keys(MGRP_KW);
  var ov=showSheet("🔍 "+L2x("Cari dalam aplikasi","Search the app"), '<input type="search" id="gsQ" class="ilq" placeholder="'+L2x("Doa, solat, panduan, tetapan…","Doa, prayers, guides, settings…")+'" autocomplete="off" style="width:100%"><div id="gsR" class="gsr"></div>');
  SIDX=buildSearch();
  var R=ov.querySelector("#gsR"), Q=ov.querySelector("#gsQ"), list=[];
  var show=function(){ var v=q.toLowerCase(); list=[];
    if(v.length>=2){ SIDX.forEach(function(x){ if((x.t+" "+x.p).toLowerCase().indexOf(v)>=0) list.push(x); });
      MGK.forEach(function(k){ if(MGRP_KW[k].indexOf(v)>=0){ var g=MGRP.filter(function(m){ return m[0]===k; })[0]; list.push({t:"⚙ "+L2x(g[2],g[3]), p:T("more"), f:function(){ if(k==="ai"){ openSettings("ai"); return; } moreGrp=k; go("more"); }}); } });
      list=list.slice(0,40); }
    R.innerHTML=v.length<2?'<div class="mut small" style="padding:10px 2px">'+L2x("Taip sekurang-kurangnya 2 huruf. Cuba: hujan, wuduk, tahajjud, tema.","Type at least 2 letters. Try: rain, wudhu, tahajjud, theme.")+'</div>':(list.length?list.map(function(x,i){ return '<button class="gsi" data-gi="'+i+'"><b>'+esc(x.t)+'</b><small>'+esc(x.p)+'</small></button>'; }).join(""):'<div class="mut small" style="padding:10px 2px">'+L2x("Tiada padanan.","No matches.")+'</div>');
    R.querySelectorAll("[data-gi]").forEach(function(b){ b.onclick=function(){ var x=list[+b.getAttribute("data-gi")]; closeOverlay(); setTimeout(x.f,0); }; }); };
  Q.oninput=function(){ q=Q.value.trim(); show(); }; if(q) Q.value=q; show(); setTimeout(function(){ try{ Q.focus(); }catch(e){} },80);
}

// 0.19.0 SIDEBAR: the ☰ button at the top left opens every tab and its pages as dropdowns.
// Closing it keeps which dropdowns are open and where the list was scrolled (also across restarts: ihsan_side).
var sideOpen=false, SD=load("ihsan_side",{o:{},st:0}), sideLang=null, sideF={};
// 0.5.27: every note and book is in the ☰ menu (under Read › Notes / Books), each with its own ☆ for Favourites
function ntTitle(nt){ return (nt.t||(nt.cl?(nt.cl[0]||{}).x:(nt.b||"").split("\n")[0])||L2x("Nota","Note")).slice(0,40); }
function sideNotes(){ return NOTES.filter(function(nt){ return !nt.arch; }).sort(function(a,b){ return (b.p?1:0)-(a.p?1:0) || b.u-a.u; }).slice(0,60).map(function(nt){
  return {id:"alat/nota/nota/"+nt.id, ic:nt.cl?"☑":"📝", lb:ntTitle(nt), f:function(){ var x=NOTES.filter(function(y){ return y.id===nt.id; })[0]; wrTab="nota"; SUB2.alat="nota"; go("alat"); if(x) setTimeout(function(){ ntEdit(x, !!x.cl, document.querySelector("#view .ntGrid")?document.querySelector("#view .ntGrid").parentNode:null); }, 120); }}; }); }
function sideBooks(){ var l=load("ihsan_books",[]); if(!Array.isArray(l)) return []; return l.slice(0,60).map(function(b){ return {id:"alat/nota/buku/"+b.id, ic:"📖", lb:String(b.name||L2x("Buku","Book")).replace(/\.pdf$/i,"").slice(0,40), f:function(){ homeAct("q-book:"+b.id); }}; }); }
function sideSig(){ var b=load("ihsan_books",[]); return NOTES.map(function(nt){ return nt.arch?"":nt.id+ntTitle(nt); }).join("|")+"#"+(Array.isArray(b)?b.map(function(x){ return x.id+x.name; }).join("|"):""); }
function sideTree(){
  var L=function(a,b){ return L2x(a,b); }, n=function(id,ic,lb,f,kids){ return {id:id,ic:ic,lb:lb,f:f,k:kids}; }, t3=function(o, g){ o.t3=g; return o; };
  var sub2=function(tab,s){ return function(){ if(tab==="sunat"){ sunPage=s; save("ihsan_sunpage",s); } else SUB2[tab]=s; if(tab==="learn"){ learnPg=null; learnFrom=null; } go(tab); }; };
  var lp=function(parent,id){ return function(){ SUB2.learn=parent; learnPg=id; learnFrom=null; go("learn"); }; };
  var pl=function(x){ return function(){ openGuide(x); }; };
  var zk=function(z){ return function(){ sub.zikir=z; go("zikir"); }; };
  var tabLb=function(t){ return typeof t[2]==="string"?T(t[2]==="home"?"utama":t[2]):L(t[2][0],t[2][1]); };
  var lps=function(pre,parent,list){ return list.map(function(x){ return n(pre+x[0],x[1],L(x[2],x[3]),lp(parent,x[0])); }); };
  var L3g=[
      n("learn/panduan/bersuci","💧",L("Bersuci","Purification"),pl("bersuci"),lps("learn/panduan/bersuci/","bahasa",[["wudhu","💧","Cara berwuduk","How to make wudhu"],["x_mandi","🚿","Mandi wajib","Obligatory bath"],["x_tayammum","🏜","Tayammum","Tayammum"],["x_istinja","🚽","Istinjak & najis","Istinja' & najis"],["haid","🌸","Haid & nifas","Haid & nifas"]])),
      n("learn/panduan/solat","🧎","Solat",pl("solat"),[n("learn/panduan/solat/prac","🔊",L("Latihan berpandu","Guided practice"),function(){ openPractice(); })]
        .concat(lps("learn/panduan/solat/","bahasa",[["solat","🧎","Cara solat","How to pray"],["bacaan","📜","Bacaan dalam solat","Readings in solat"],["sakit","🏥","Solat ketika sakit","Praying when sick"],["musafir","🚗","Solat musafir","Praying when travelling"]]))),
      n("learn/panduan/haji","🕋",L("Haji & Umrah","Hajj & Umrah"),pl("haji"),[n("learn/panduan/haji/3d","🕋",L("Haji & Umrah 3D","Hajj & Umrah 3D"),function(){ openHajj(); }),n("learn/panduan/haji/diy","🧳","Umrah DIY",function(){ openUmrah(); }),
        n("learn/panduan/haji/tawaf","🔢",L("Kaunter tawaf & sa'ie","Tawaf & sa'ie counter"),function(){ openTawaf(); }),n("learn/panduan/haji/live","📺",L("Siaran langsung & waktu Makkah","Live & Makkah times"),lp("bahasa","live"))])];
  var L3={
    "solat/zikir":[n("solat/zikir/tasbih","📿",T("tasbih"),zk("tasbih")),n("solat/zikir/after","🤲",T("after"),zk("after")),n("solat/zikir/asma","✨",T("asma"),zk("asma")),n("solat/zikir/mine","📿",L("Zikir saya","My zikir"),zk("mine"))],
    "solat/kiblat":[n("solat/kiblat/c","🧭",L("Kompas kiblat","Qibla compass"),sub2("solat","kiblat")),n("solat/kiblat/cam","📷",L("Kiblat kamera","Qibla camera"),function(){ openQiblaCam(); })],
    "solat/ssunat":SUNAT_CATS.map(function(c){ return n("solat/ssunat/"+c[0],"🌅",L(c[1],c[2]),function(){ sunCat=c[0]; sunOpen=null; SUB2.solat="ssunat"; go("solat"); }); }),
    "sunat/doa":DOA_GROUPS.map(function(g,gi){ return n("sunat/doa/"+gi,["🏠","💼","💚"][gi],L(g[0],g[1]),function(){ doaCat=g[2][0]; doaQ=""; doaFav=false; doaMine=false; go("doa"); },
      g[2].map(function(i){ return n("sunat/doa/"+gi+"/"+i,"🤲",catName(DOA[i]),function(){ doaCat=i; doaQ=""; doaFav=false; doaMine=false; go("doa"); }); })); })
      .concat([n("sunat/doa/fav","★",L("Doa kegemaran","Favourite doa"),function(){ doaFav=true; doaMine=false; doaQ=""; go("doa"); }),n("sunat/doa/mine","🤲",L("Doa saya","My doa list"),function(){ doaMine=true; doaFav=false; doaQ=""; go("doa"); })]),
    "sunat/mathurat":[n("sunat/mathurat/p","☀️",T("pagi"),function(){ mathEvening=false; go("mathurat"); }),n("sunat/mathurat/e","🌙",T("petang"),function(){ mathEvening=true; go("mathurat"); })],
    "sunat/amal":SUNAT_TOP.filter(function(c){ return ["solat","bersuci","haji"].indexOf(c[0])<0; }).map(function(c){ return n("sunat/amal/"+c[0],"🌱",L(c[1],c[2]),function(){ sunTop=c[0]; sunOpen=null; go("amal"); }); }),
    "learn/panduan":[n("learn/panduan/chess","♟️",L("Catur 3D","3D chess"),function(){ openChess(); }),n("learn/panduan/falak","🪐",L("Falak","Astronomy"),function(){ openFalak(); }),n("learn/panduan/sci","🔭",L("Sains dalam Sejarah Islam","Science in Islamic History"),function(){ openSciHub(); },SCI_TILES.map(function(x){ return n("learn/panduan/sci/"+x[0],x[1],L(x[2],x[3]),function(){ openSci(x[0]); }); }))],
    "learn/kisah":[n("learn/kisah/kids","🧒",T("kids"),function(){ go("kids"); }),n("learn/kisah/sirah","🐪",L("Sirah Nabi ﷺ","Sirah of the Prophet ﷺ"),function(){ openSirah(false); })].concat(lps("learn/kisah/","kisah",[["nabi","🌿","Kisah 25 Nabi","The 25 Prophets"],["sahabat","🏅","Kisah Sahabat","Companion stories"],["n40","📜","40 Hadis Nawawi","40 Hadith Nawawi"]])),
    "learn/bahasa":L3g.concat([n("learn/bahasa/fiqh/map","⚖️",L("Peta minda 3D","3D mind map"),function(){ openFiqh(-1); })].concat([["0","🕌","Ibadat","Worship"],["1","🤝","Muamalat","Transactions"],["2","💍","Munakahat","Marriage"],["3","⚖️","Jinayat","Criminal law"]].map(function(x){ return n("learn/bahasa/fiqh/"+x[0],x[1],L(x[2],x[3]),function(){ openFiqh(+x[0]); }); })).concat([n("learn/bahasa/pksk","📝",L("Latihan PKSK","PKSK practice exam"),function(){ openPksk(); }),n("learn/bahasa/sirah","🐪",L("Sirah Nabi ﷺ","Sirah of the Prophet ﷺ"),function(){ openSirah(false); })].concat(lps("learn/bahasa/","bahasa",[["nabi","🌿","Kisah 25 Nabi","The 25 Prophets"],["sahabat","🏅","Kisah Sahabat","Companion stories"],["iqra","📗","Asas Membaca al-Quran","Learn to Read the Quran"],["tajwid","🎨","Tajwid","Tajweed"],["hijaiyah","🔤","Huruf Hijaiyah","Arabic letters"],["qwords","📖","Maksud al-Quran","Meanings of Quran"],["glosari","📖","Glosari istilah","Glossary"]])))),
    "alat/nota":WRT.map(function(x){ return n("alat/nota/"+x[0],x[1],L(x[2],x[3]),function(){ wrTab=x[0]; SUB2.alat="nota"; go("alat"); }, x[0]==="nota"?sideNotes():null); }),
    "learn/buku":sideBooks(),
    "alat/kewangan":SUBS_FULL.fin.map(function(x){ return t3(n("fin/"+x[0],x[1],subName(x),function(){ SUB2.fin=x[0]; SUB2.alat="kewangan"; go("alat"); }), "fin"); }),
    "cal/bulan":PLT.map(function(x){ return t3(n("cal/bulan/"+x[0],x[1],L(x[2],x[3]),function(){ SUB2.plt=x[0]; cal.mode="p"; SUB2.cal="bulan"; go("cal"); }), "cal/bulan"); }),
    "cal/statistik":[["stats","📊","Statistik","Stats"],["g","📅","Gregori","Gregorian"],["h","🌙","Hijrah","Hijri"]].filter(function(x){ return !(IOS && x[0]==="stats"); }).map(function(x){ return t3(n("cal/statistik/"+x[0],x[1],L(x[2],x[3]),function(){ SUB2.trk=x[0]; if(x[0]!=="stats") cal.mode=x[0]; SUB2.cal="statistik"; go("cal"); }), "cal/statistik"); }),
    "cal/mesyuarat":[["ev","🎉","Majlis","Events"],["list","📋","Mesyuarat","Meetings"],["spk","🔊","Pembesar suara","Speaker"],["lis","👂","Dengar","Listen"],["wt","📻","Walkie-talkie","Walkie-talkie"]].map(function(x){ return t3(n("cal/mesyuarat/"+x[0],x[1],L(x[2],x[3]),function(){ window.__meetPg=x[0]; SUB2.cal="mesyuarat"; go("cal"); }), "cal/mesyuarat"); }),
    "cal/senaman":[["body","🧍","Badan","Body"],["moves","🏃","Gerakan","Moves"],["rutin","⏱","Rutin","Routines"],["plan","📋","Pelan","Plan"],["track","📅","Jejak","Tracker"],["health","❤️","Kesihatan","Health"]].map(function(x){ return t3(n("cal/senaman/"+x[0],x[1],L(x[2],x[3]),function(){ window.__fitPg=x[0]; SUB2.cal="senaman"; go("cal"); }), "cal/senaman"); }),
    "alat/niaga":[["papan","📊","Papan","Summary"],["pos","🛒","Jual","Sell"],["book","📅","Tempahan","Bookings"],["dok","📄","Dokumen","Records"],["exp","💸","Belanja","Expenses"],["cust","👥","Pelanggan","Customers"],["item","📦","Barang","Items"],["prof","⚙️","Profil","Profile"]].map(function(x){ return t3(n("alat/niaga/"+x[0],x[1],L(x[2],x[3]),function(){ window.__niagaPg=x[0]; SUB2.alat="niaga"; go("alat"); }), "alat/niaga"); }),
    // 0.5.69 (owner): the menu goes down to a 4th level: Quran › Surah › 114 surahs / Juz › 30 juz, School › years, Halal › recipe pages, Social › Family › its pages
    "sunat/quran":[n("sunat/quran/s","📖",L("Surah","Surah"),sub2("sunat","quran"),window.QMETA?QMETA.s.map(function(x,i){ return n("sunat/quran/s/"+(i+1),String(i+1),x[1],function(){ openQuranAt(i+1,1); }); }):null),
      n("sunat/quran/j","🔢","Juz",sub2("sunat","quran"),window.QMETA&&QMETA.ja?QMETA.ja.slice(0,30).map(function(k,j){ return n("sunat/quran/j/"+(j+1),String(j+1),"Juz "+(j+1),function(){ sideQIdx(k); }); }):null)],
    "learn/sekolah":SEK_LV.map(function(x){ return n("learn/sekolah/"+x[0],/^T\d$/.test(x[0])?"📘":x[1],L(x[2],x[3]),function(){ var c=sekCfg(); c.tahap=x[0]; c.skYear=true; save("ihsan_silibus",c); try{ var kd=sekKid(), t2=sekSet(kd.id); t2.tahap=x[0]; sekSetSave(kd.id,t2); }catch(e){} SUB2.learn="sekolah"; learnPg=null; learnFrom=null; go("learn"); }); }),
    "alat/halal":[["list","🍲","Resepi","Recipes"],["plan","📅","Rancang","Plan"],["shop","🛒","Beli","Shop"],["check","🔍","Semak bahan","Check ingredients"]].map(function(x){ return n("alat/halal/"+x[0],x[1],L(x[2],x[3]),function(){ if(window.HalalRecipe) HalalRecipe.open(x[0]); else window.__rcpPg=x[0]; SUB2.alat="halal"; go("alat"); }); }),
    "alat/keluarga":[["tree","🌳","Salasilah","Family tree"],["bday","🎂","Hari lahir","Birthdays"],["baby","👶","Bayi","Baby"],["care","🩺","Jaga","Care"],["pets","🐾","Haiwan","Pets"]].map(function(x){ return n("alat/keluarga/"+x[0],x[1],L(x[2],x[3]),function(){ famOpen(x[0]); }); }).concat([n("alat/keluarga/grp","👥",L("Kumpulan","Groups"),function(){ SUB2.alat="kumpulan"; go("alat"); })]),
    "learn/dengar":lps("learn/dengar/","dengar",[["radio","📻","Radio Islam","Islamic radio"],["podcast","🎙","Podcast","Podcast"],["live","📺","Siaran langsung Makkah & Madinah","Live Makkah & Madinah"],["news","📰","Berita Dunia","World news"]])
  };
  var imK=function(v,id){ var x=(SUBS[v]||[]).filter(function(y){ return y[0]===id; })[0]; return x ? n(v+"/"+id,x[1],subName(x),sub2(v,id),L3[v+"/"+id]) : null; };
  // 0.7.59: Iman in the side menu: Quran · Solat (times, rakaat, qibla) · Amal (sunnah prayers, deeds) · Zikir (zikir, doa, wirid, ma'thurat); old ids kept so favourites still work
  var IMK={ilmu:[], quran:[imK("sunat","quran")], solat:[imK("solat","waktu"),imK("solat","rakaat"),imK("solat","kiblat")], amal:[imK("solat","ssunat"),imK("sunat","amal")], zikir:[imK("solat","zikir"),imK("sunat","doa"),imK("sunat","wirid"),imK("sunat","mathurat")]};
  var out=tabsNow().map(function(t){ var subs=SUBS[t[0]]; if(t[0]==="learn" && subs) subs=subs.filter(function(x){ return x[0]!=="bahasa"; });   // 0.7.64: Basics lives in Iman › Ilmu
    if(t[0]==="iman") return n("iman",t[1],tabLb(t),function(){ go("iman"); },IMAN.map(function(x){ var k=IMK[x[0]].filter(Boolean); if(x[0]==="ilmu") return n("learn/bahasa","📖","Ilmu",function(){ imanGo("ilmu"); },L3["learn/bahasa"]); return x[0]==="quran" ? k[0] : n("iman/"+x[0],x[1],subName(x),function(){ imanGo(x[0]); },k); }));
    var kids = subs ? subs.map(function(x){ var id=t[0]+"/"+x[0]; return n(id,x[1],subName(x),sub2(t[0],x[0]),L3[id]); })
      : t[0]==="home" ? [n("home/w","🏠",L("Widget utama","Home widgets"),function(){ go("home"); }),n("home/kids","🧒",T("kids"),function(){ go("kids"); })] : null;
    return n(t[0],t[1],tabLb(t),function(){ go(t[0]); },kids); });
  out.push(n("more","⚙",L("Tetapan","Settings"),function(){ moreGrp=null; go("more"); },MGRP.map(function(g){ return n("more/"+g[0],g[1],L(g[2],g[3]),function(){ if(g[0]==="ai"){ openSettings("ai"); return; } moreGrp=g[0]; go("more"); }); })));
  return out;
}
function sideQIdx(k){ var f=function(){ QuranView.open(k); openQuran(false); }; if(window.QuranView && window.QMETA) f(); else loadJs(QJS, f, function(){}); }
function sideHtml(nodes, lv){
  return nodes.map(function(x){ sideF[x.id]=x.f; sideLb[x.id]=[x.ic, x.lb]; var has=x.k&&x.k.length, op=!!SD.o[x.id], fv=(SD.fav||[]).indexOf(x.id)>=0;
    var isTab=lv===1 && TABS_ALL.some(function(t){ return t[0]===x.id; }), tOn=isTab && !(S.tabHide||{})[x.id];
    /* 0.6.2 (owner): level-2 rows that are sub-tabs get a lighter tickbox too: unticked hides it from the second row */
    var sp2=lv===2 && /^(\w+)\/(\w+)$/.exec(x.id), isSub=!!(sp2 && SUBS_FULL[sp2[1]] && SUBS_FULL[sp2[1]].some(function(c){ return c[0]===sp2[2]; })), sOn=isSub && !(S.subHide||{})[x.id];
    return '<div class="sdn sl'+lv+(op?" open":"")+'" data-sid="'+esc(x.id)+'"><div class="sdr"><button class="sdfv'+(fv?' on':'')+'" data-sfv="'+esc(x.id)+'" aria-label="★">'+(fv?'★':'☆')+'</button><button class="sdg" data-sgo="'+esc(x.id)+'"><span class="sdi">'+x.ic+'</span><span class="sdt">'+esc(x.lb)+'</span></button>'+
      (has?'<button class="sdx" data-stg="'+esc(x.id)+'" aria-label="▾">▾</button>':'')+
      /* 0.6.1 (owner): a tickbox at the right edge (was 💡): ticked = the tab shows in the bottom row */
      (isTab?'<button class="sdbulb sdtick'+(tOn?' on':'')+'" data-sbulb="'+esc(x.id)+'" role="checkbox" aria-checked="'+(tOn?'true':'false')+'" aria-label="'+(tOn?L2x("Sembunyi tab ini","Hide this tab"):L2x("Tunjuk tab ini","Show this tab"))+'" title="'+L2x("Tunjuk di baris bawah","Show in the bottom row")+'">'+(tOn?'✓':'')+'</button>':(isSub?'<button class="sdtick sdtick2'+(sOn?' on':'')+'" data-ssub="'+esc(x.id)+'" role="checkbox" aria-checked="'+(sOn?'true':'false')+'" title="'+L2x("Tunjuk di baris kedua","Show in the second row")+'">'+(sOn?'✓':'')+'</button>':x.t3?(function(){ var o3=window.l3On(x.id); return '<button class="sdtick sdtick3'+(o3?' on':'')+'" data-sl3="'+esc(x.id)+'" data-g3="'+esc(x.t3)+'" role="checkbox" aria-checked="'+(o3?'true':'false')+'" title="'+L2x("Tunjuk dalam bar bawah halaman","Show in the page's bottom bar")+'">'+(o3?'✓':'')+'</button>'; })():lv<=2?'<span class="sdtickGap"></span>':''))+'</div>'+(has?'<div class="sdk">'+sideHtml(x.k, lv+1)+'</div>':'')+'</div>'; }).join("");
}
// 0.5.94 (owner): a search box at the top of the left bar filters the contents; the dropdowns stay: a group that holds a match opens
// (only while searching, the saved open/closed state is kept), and a matching group keeps all its own items
function sideNorm(t){ return String(t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/['’`]/g,""); }
function sideFilter(){ var sd=document.getElementById("side"); if(!sd) return; var qi=sd.querySelector("#sdQ"), q=sideNorm(qi?qi.value:"").trim(), l=sd.querySelector("#sdL"); if(!l) return;
  var all=[].slice.call(l.querySelectorAll(".sdn")); sd.classList.toggle("sdSearch", !!q);
  all.forEach(function(nd){ nd.classList.remove("sfHide","sfOpen","sfHit"); });
  if(!q){ var e0=sd.querySelector(".sdNone"); if(e0) e0.remove(); return; }
  var words=q.split(/\s+/), hit=function(nd){ var t=sideNorm((nd.querySelector(":scope>.sdr .sdt")||{}).textContent); return words.every(function(w){ return t.indexOf(w)>=0; }); };
  var walk=function(nd, parentHit){ var me=hit(nd), kids=[].slice.call(nd.querySelectorAll(":scope>.sdk>.sdn")), any=false;
    kids.forEach(function(k){ if(walk(k, parentHit||me)) any=true; });
    var show=me||any||parentHit; nd.classList.toggle("sfHide", !show); if(me) nd.classList.add("sfHit"); if(any) nd.classList.add("sfOpen"); return me||any; };
  var found=0; [].slice.call(l.querySelectorAll(":scope>.sdn")).forEach(function(nd){ if(walk(nd, false)) found++; });
  var e=sd.querySelector(".sdNone"); if(!found){ if(!e){ e=document.createElement("div"); e.className="sdNone mut small"; l.appendChild(e); } e.textContent=L2x("Tiada padanan dalam menu","Nothing in the menu matches"); } else if(e) e.remove(); }
function sideBuild(){
  var sd=document.getElementById("side");
  if(!sd){ sd=document.createElement("aside"); sd.id="side";
    sd.innerHTML='<div class="sdh"><input type="search" id="sdQ" class="sdq" placeholder="🔍 '+L2x("Cari menu","Search the menu")+'" autocomplete="off"><button class="sdc" id="sdFind" aria-label="'+L2x("Cari dalam aplikasi","Search the app")+'">🔍</button><button class="sdc" id="sdAll" aria-label="'+L2x("Tutup semua","Collapse all")+'">⊟</button></div><div class="sdl" id="sdL"></div><div class="sdfavs" id="sdFav"></div><div class="sdgrip noswipe" id="sdGrip"><i></i></div><div class="sdf"><button class="btn alt" id="sdDon">🤲 '+L2x("Derma","Donate")+'</button><button class="btn alt" id="sdGift">🎁 '+L2x("Hadiah","Gifts")+'</button></div>';
    // 0.5.20 (review 4): Donate and Gifts live in the ☰ menu; the header keeps Search and Settings
    var sc=document.createElement("div"); sc.id="sideScrim"; document.body.appendChild(sc); document.body.appendChild(sd);
    sc.onclick=function(){ sideShow(false); };
    // 0.5.27: the menu can be made wider or narrower, like Settings (drag the gold grip)
    (function(){ var gp=sd.querySelector("#sdGrip"), x0=null, w=0, right=function(){ return sd.classList.contains("right"); };
      gp.addEventListener("pointerdown", function(e){ x0=e.clientX; w=0; sd.classList.add("drag"); try{ gp.setPointerCapture(e.pointerId); }catch(er){} e.preventDefault(); });
      gp.addEventListener("pointermove", function(e){ if(x0===null) return; var px=right()?window.innerWidth-e.clientX:e.clientX; w=Math.max(45, Math.min(95, Math.round(px*100/window.innerWidth))); sd.style.width=w+"vw"; });
      var up=function(){ if(x0===null) return; x0=null; sd.classList.remove("drag"); if(w){ S.sideW=w; saveS(); } }; gp.addEventListener("pointerup", up); gp.addEventListener("pointercancel", up); })();
    sd.querySelector("#sdDon").onclick=function(){ sideShow(false); go("derma"); }; sd.querySelector("#sdGift").onclick=function(){ sideShow(false); go("hadiah"); };
    var lst=sd.querySelector("#sdL"), t=null;
    lst.addEventListener("scroll", function(){ clearTimeout(t); t=setTimeout(function(){ SD.st=lst.scrollTop; save("ihsan_side",SD); },150); }, {passive:true});
    lst.addEventListener("click", function(e){ var fv=e.target.closest("[data-sfv]"); if(fv){ e.stopPropagation(); sideFavToggle(fv.getAttribute("data-sfv")); return; }
      var b3=e.target.closest("[data-sl3]"); if(b3){ e.stopPropagation(); var id3=b3.getAttribute("data-sl3"), g3=b3.getAttribute("data-g3"); S.l3Hide=S.l3Hide||{};
        if(!S.l3Hide[id3]){ var sib=[].slice.call(lst.querySelectorAll('[data-g3="'+g3+'"]')).filter(function(x){ var i=x.getAttribute("data-sl3"); return i!==id3 && !S.l3Hide[i]; }); if(!sib.length){ toast(L2x("Sekurang-kurangnya satu mesti kekal","At least one must stay")); return; } S.l3Hide[id3]=true; } else delete S.l3Hide[id3];
        saveS(); var on3=!S.l3Hide[id3]; b3.classList.toggle("on", on3); b3.textContent=on3?"✓":""; b3.setAttribute("aria-checked", on3?"true":"false");
        toast((on3?"☑ ":"☐ ")+(on3?L2x("Ditunjuk dalam bar bawah halaman","Shown in the page's bottom bar"):L2x("Disembunyi dari bar bawah halaman (masih di menu ini)","Hidden from the page's bottom bar (still in this menu)"))); render(); return; }
      var bs=e.target.closest("[data-ssub]"); if(bs){ e.stopPropagation(); var sid=bs.getAttribute("data-ssub"), tb=sid.split("/")[0]; S.subHide=S.subHide||{};
        if(!S.subHide[sid]){ var left2=(SUBS_FULL[tb]||[]).filter(function(c){ return tb+"/"+c[0]!==sid && !S.subHide[tb+"/"+c[0]]; }).length; if(!left2){ toast(L2x("Sekurang-kurangnya satu mesti kekal","At least one must stay")); return; } S.subHide[sid]=true; } else delete S.subHide[sid];
        saveS(); var on2=!S.subHide[sid]; bs.classList.toggle("on", on2); bs.textContent=on2?"✓":""; bs.setAttribute("aria-checked", on2?"true":"false");
        toast((on2?"☑ ":"☐ ")+(on2?L2x("Ditunjuk di baris kedua","Shown in the second row"):L2x("Disembunyi dari baris kedua (masih di menu ini)","Hidden from the second row (still in this menu)"))); render(); return; }
      var bl=e.target.closest("[data-sbulb]"); if(bl){ e.stopPropagation(); var tid=bl.getAttribute("data-sbulb"); S.tabHide=S.tabHide||{};
        if(!S.tabHide[tid]){ var left=TABS_ALL.filter(function(t){ return t[0]!==tid && !S.tabHide[t[0]]; }).length; if(!left){ toast(L2x("Sekurang-kurangnya satu tab mesti kekal","At least one tab must stay")); return; } S.tabHide[tid]=true; } else delete S.tabHide[tid];
        saveS(); var on=!S.tabHide[tid]; bl.classList.toggle("on", on); bl.textContent=on?"✓":""; bl.setAttribute("aria-checked", on?"true":"false");
        toast((on?"☑ ":"☐ ")+(on?L2x("Tab ditunjuk di bawah","Tab shown at the bottom"):L2x("Tab disembunyi dari bawah (masih di menu ini)","Tab hidden from the bottom (still in this menu)"))); render(); return; }
      var g=e.target.closest("[data-stg]");
      if(g){ var id=g.getAttribute("data-stg"), nd=g.closest(".sdn"), o=!nd.classList.contains("open"); nd.classList.toggle("open",o); if(o) SD.o[id]=1; else delete SD.o[id]; save("ihsan_side",SD); return; }
      var b=e.target.closest("[data-sgo]"); if(!b) return; var id2=b.getAttribute("data-sgo"), f=sideF[id2], nd2=b.closest(".sdn");
      // a heading without its own page (a doa group) just opens its dropdown
      if(!f && nd2.querySelector(".sdx")){ nd2.querySelector(".sdx").click(); return; }
      sideShow(false); if(f) setTimeout(function(){ try{ f(); }catch(err){ console.error(err); } },0); });
    // 0.5.5: the same button collapses everything (⊟) or, when all is closed, expands everything (⊞)
    var sf=sd.querySelector("#sdFind"); if(sf) sf.onclick=function(){ sideShow(false); openSearch(); };
    var sq=sd.querySelector("#sdQ"); sq.oninput=sideFilter; sq.onkeydown=function(e){ if(e.key==="Escape"){ sq.value=""; sideFilter(); } else if(e.key==="Enter"){ var h=sd.querySelector("#sdL .sdn.sfHit:not(.sfHide) .sdg"); if(h) h.click(); } };
    sd.querySelector("#sdAll").onclick=function(){ var any=!!sd.querySelector(".sdn.open");
      if(any){ SD.o={}; sd.querySelectorAll(".sdn.open").forEach(function(x){ x.classList.remove("open"); }); }
      else sd.querySelectorAll(".sdn").forEach(function(x){ if(x.querySelector(".sdx")){ x.classList.add("open"); SD.o[x.getAttribute("data-sid")]=1; } });
      save("ihsan_side",SD); sideAllIc(); };
    lst.addEventListener("click", function(){ setTimeout(sideAllIc, 0); });
  }
  if(!window.QMETA && !sideBuild.q){ sideBuild.q=1; loadJs(["quran/qmeta.js"], function(){ sideLang=null; if(document.getElementById("side")) sideBuild(); }, function(){}); }
  var lk=(S.ulang||S.lang)+"|"+JSON.stringify(SUBS.solat.length)+"|"+sideSig()+"|"+(window.QMETA?1:0);
  if(sideLang!==lk){ sideLang=lk; sideF={}; var l=sd.querySelector("#sdL"); setTimeout(function(){ sideFilter(); }, 0); l.innerHTML=sideHtml(sideTree(),1); l.scrollTop=SD.st||0; sideFavDraw(); }
  return sd;
}
// 0.5.20 round 2, request 4: ☆ on every item adds it to the favourites, pinned at the bottom of the menu in front of the tree
// (newest at the bottom, drag ⠿ to reorder); notches on the left and right edges a quarter up the screen open the menu from either side
var sideLb={};
function sideFavToggle(id){ SD.fav=SD.fav||[]; var i=SD.fav.indexOf(id); if(i>=0) SD.fav.splice(i,1); else SD.fav.push(id); save("ihsan_side",SD);
  qtRefresh();   // 0.5.91: the Home favourite tabs are these ★ favourites
  var sd=document.getElementById("side"); if(sd) [].forEach.call(sd.querySelectorAll('[data-sfv="'+id.replace(/"/g,'')+'"]'), function(b){ var on=SD.fav.indexOf(id)>=0; b.classList.toggle("on", on); b.textContent=on?"★":"☆"; });
  sideFavDraw(); if(i<0) toast(L2x("Ditambah ke kegemaran: tab di Utama dan widget Utama","Added to favourites: a Home tab and a Home widget")); if(Array.isArray(S.widgets)){ favWidgets(); sideFavDirty=true; } if(view==="home" && !sideOpen) render(); }
var sideFavDirty=false;
function sideFavDraw(){ var box=document.getElementById("sdFav"); if(!box) return; var L=(SD.fav||[]).filter(function(id){ return sideLb[id]; });
  box.classList.toggle("hidden", !L.length);
  box.innerHTML=L.length?'<div class="sdfh">★ '+L2x("Kegemaran","Favourites")+'</div><div class="sdfl">'+L.map(function(id){ var x=sideLb[id];
    return '<div class="sdfi" data-fid="'+esc(id)+'"><button class="sdfg" data-fgo="'+esc(id)+'"><span class="sdi">'+x[0]+'</span><span class="sdt">'+esc(x[1])+'</span></button><span class="sdfm" aria-label="⠿">⠿</span><button class="sdfx" data-fx="'+esc(id)+'" aria-label="✕">✕</button></div>'; }).join("")+'</div>':'';
  box.querySelectorAll("[data-fgo]").forEach(function(b){ b.onclick=function(){ var f=sideF[b.getAttribute("data-fgo")]; sideShow(false); if(f) setTimeout(function(){ try{ f(); }catch(err){} },0); }; });
  box.querySelectorAll("[data-fx]").forEach(function(b){ b.onclick=function(){ sideFavToggle(b.getAttribute("data-fx")); }; });
  box.querySelectorAll(".sdfm").forEach(function(h){ h.addEventListener("pointerdown", function(e){ e.preventDefault(); var it=h.parentNode, lst=it.parentNode, y0=e.clientY; it.classList.add("drag");
    var mv=function(ev){ var dy=ev.clientY-y0; it.style.transform="translateY("+dy+"px)"; var sib=dy<0?it.previousElementSibling:it.nextElementSibling; if(sib && Math.abs(dy)>sib.offsetHeight*0.6){ if(dy<0) lst.insertBefore(it, sib); else lst.insertBefore(sib, it); y0=ev.clientY; it.style.transform=""; } };
    var up=function(){ document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); it.classList.remove("drag"); it.style.transform="";
      SD.fav=[].map.call(lst.children, function(x){ return x.getAttribute("data-fid"); }); save("ihsan_side",SD); };
    document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up); }); }); }
// left notch: the content menu (☰ tree); right notch: Settings.
// 0.5.22: on/off, height, width and position (S.notch) from the 🔒 bar editor or Settings › Tab bar; they hide while anything scrolls
function ntCfg(){ var n=S.notch||{}; return {on:n.on!==false, l:n.l!==false, r:n.r!==false, h:n.h||66, w:n.w||32, pos:n.pos!=null?n.pos:25, op:n.op||100}; }
// 0.7.70 (owner): the two date lines are 15.4px (70% of 22); shrink a line only when it would be cut off (long Hijri months, narrow phones)
function hdrFit(){ ["topSub","topHij"].forEach(function(id){ var el=document.getElementById(id); if(!el || !document.body.classList.contains("ntTop")) return; el.style.removeProperty("font-size"); var fs=15.4; while(fs>11 && el.scrollWidth>el.clientWidth+1){ fs--; el.style.setProperty("font-size", fs+"px", "important"); } }); }
// 0.7.69 (owner): the two side notches sit at the top, level with the top bar, and replace its ☰ and ⚙ buttons (both notches must be on)
function edgeApply(){ var c=ntCfg(), top=c.on && c.l && c.r, hd=document.getElementById("top"); document.body.classList.toggle("ntTop", top); document.body.style.setProperty("--ntW", c.w+"px");
  var hr=hd && hd.offsetHeight ? hd.getBoundingClientRect() : null;
  ["L","R"].forEach(function(k){ var b=document.getElementById("edge"+k); if(!b) return; b.style.width=c.w+"px"; b.style.opacity=c.op/100; b.classList.toggle("hidden", !c.on || (k==="L" ? !c.l : !c.r));
    if(top && hr){ var h=Math.max(40, Math.round(hr.height-10)); b.style.height=h+"px"; b.style.top=Math.round(hr.top+(hr.height-h)/2)+"px"; b.style.bottom="auto"; }
    else { b.style.height=c.h+"px"; b.style.top=""; var pk=(S.notch||{})["pos"+k]; b.style.bottom=(pk!=null?pk:c.pos)+"vh"; } }); }
window.addEventListener("resize", function(){ try{ edgeApply(); hdrFit(); }catch(e){} });
function notchCtlHtml(){ var c=ntCfg();
  return '<div class="ntCtl"><label class="obChk"><input type="checkbox" data-ntc="on"'+(c.on?' checked':'')+'> '+L2x("Takuk tepi kiri (menu) dan kanan (tetapan)","Side notches: left (menu) and right (settings)")+'</label>'+
    // 0.5.30: each side can be shown or hidden on its own
    '<div class="ntLR"><label class="obChk"><input type="checkbox" data-ntc="l"'+(c.l?' checked':'')+'> ◀ '+L2x("Kiri (menu)","Left (menu)")+'</label><label class="obChk"><input type="checkbox" data-ntc="r"'+(c.r?' checked':'')+'> '+L2x("Kanan (tetapan)","Right (settings)")+' ▶</label></div>'+
    [["h",L2x("Tinggi","Height"),36,160,c.h,"px"],["w",L2x("Lebar","Width"),16,48,c.w,"px"],["pos",L2x("Kedudukan dari bawah","Position from the bottom"),5,70,c.pos,"%"],["op",L2x("Kelegapan","Opacity"),15,100,c.op,"%"]].map(function(x){
      return '<label class="set ntSl"><span>'+x[1]+' <b data-ntv="'+x[0]+'">'+x[4]+x[5]+'</b></span><input type="range" min="'+x[2]+'" max="'+x[3]+'" step="1" data-ntc="'+x[0]+'" value="'+x[4]+'"></label>'; }).join("")+'</div>'; }
function notchCtlBind(root){ root.querySelectorAll("[data-ntc]").forEach(function(i){ var k=i.getAttribute("data-ntc");
  var set=function(save_){ S.notch=S.notch||{}; S.notch[k]=(k==="on"||k==="l"||k==="r")?i.checked:+i.value; if(k==="pos"){ delete S.notch.posL; delete S.notch.posR; } var v=root.querySelector('[data-ntv="'+k+'"]'); if(v) v.textContent=i.value+(k==="pos"||k==="op"?"%":"px"); edgeApply(); if(save_) saveS(); };
  if(k==="on"||k==="l"||k==="r") i.onchange=function(){ set(true); }; else { i.oninput=function(){ set(false); }; i.onchange=function(){ set(true); }; } }); }
(function(){ var t=0; document.addEventListener("scroll", function(e){ if(e.target && e.target.closest && e.target.closest("#side,#setp,.ntCtl")) return; document.body.classList.add("scrolling"); clearTimeout(t); t=setTimeout(function(){ document.body.classList.remove("scrolling"); }, 900); }, true); })();
function edgeNotches(){ ["L","R"].forEach(function(k){ var id="edge"+k; if(document.getElementById(id)) return; var b=document.createElement("button"); b.id=id; b.className="edgeN"; b.setAttribute("aria-label", k==="L"?L2x("Menu kandungan","Content menu"):L2x("Tetapan","Settings")); b.innerHTML=k==="L"?'<i class="ntLines"><i></i><i></i><i></i></i>':"<b>⚙</b>";
  // 0.6.31 (owner): hold a notch for 2 seconds, then drag it up or down; each side keeps its own place (S.notch.posL / posR)
  var lt=null, drag=false, moved=false;
  b.addEventListener("pointerdown", function(e){ moved=false; clearTimeout(lt); if(document.body.classList.contains("ntTop")) return; lt=setTimeout(function(){ drag=true; b.classList.add("ntDrag"); try{ b.setPointerCapture(e.pointerId); }catch(x){} if(window.Native && N.vibrate) N.vibrate(30); toast(L2x("Seret ke atas atau bawah","Drag up or down")); }, 2000); });
  b.addEventListener("pointermove", function(e){ if(!drag) return; e.preventDefault(); moved=true; var v=Math.max(4, Math.min(88, (window.innerHeight-e.clientY-b.offsetHeight/2)/window.innerHeight*100)); b.style.bottom=v.toFixed(1)+"vh"; b._v=v; });
  var end=function(){ clearTimeout(lt); if(drag){ drag=false; b.classList.remove("ntDrag"); if(b._v!=null){ S.notch=S.notch||{}; S.notch["pos"+k]=Math.round(b._v); saveS(); } b._skip=true; setTimeout(function(){ b._skip=false; }, 400); } };
  b.addEventListener("pointerup", end); b.addEventListener("pointercancel", end); b.addEventListener("contextmenu", function(e){ e.preventDefault(); });
  b.onclick=function(e){ e.stopPropagation(); if(b._skip) return; if(k==="L"){ if(setOn) setShow(false); sideShow(!sideOpen, S.ulang==="ar"); } else { if(sideOpen) sideShow(false); if(setOn) setShow(false); else if(S.appLock && !S.kidLock) go("more"); else openSettings(); } }; document.body.appendChild(b); }); edgeApply(); }
setTimeout(edgeNotches, 300); setTimeout(function(){ try{ edgeApply(); hdrFit(); }catch(e){} }, 1500);
function sideAllIc(){ var sd=document.getElementById("side"); if(!sd) return; var b=sd.querySelector("#sdAll"), any=!!sd.querySelector(".sdn.open"); b.textContent=any?"⊟":"⊞"; b.setAttribute("aria-label", any?L2x("Tutup semua","Collapse all"):L2x("Buka semua","Expand all")); }
function sideShow(on_, right){
  var sd=sideBuild(), hm=document.getElementById("hMenu"); sideOpen=!!on_; if(sideOpen) sd.classList.toggle("right", S.ulang==="ar" ? right!==false : !!right); /* 0.6.3: in Arabic the menu opens from the right (the right notch still works, the left notch opens it from the left) */
  if(S.sideW) sd.style.width=S.sideW+"vw";
  sd.classList.toggle("on",sideOpen); document.getElementById("sideScrim").classList.toggle("on",sideOpen);
  if(hm){ hm.textContent=sideOpen?"✕":"☰"; hm.classList.toggle("on",sideOpen); }
  if(!sideOpen && sideFavDirty){ sideFavDirty=false; if(view==="home") setTimeout(render, 0); }
  document.body.classList.toggle("sideOn", sideOpen);
  if(sideOpen){ var l=sd.querySelector("#sdL"); if(Math.abs(l.scrollTop-(SD.st||0))>2) l.scrollTop=SD.st||0; sideMark(); sideAllIc();
    // open the branch of the page you are on and bring it into view
    var cur=[].slice.call(sd.querySelectorAll(".sdn.cur")).pop(); if(cur){ for(var n=cur.parentNode; n && n!==l; n=n.parentNode){ if(n.classList && n.classList.contains("sdn") && n.querySelector(".sdx")){ n.classList.add("open"); SD.o[n.getAttribute("data-sid")]=1; } }
      setTimeout(function(){ var r=cur.getBoundingClientRect(), b=l.getBoundingClientRect(); if(r.top<b.top+20 || r.bottom>b.bottom-20) l.scrollTop+= (r.top-b.top)-b.height/3; }, 30); } }
}
// highlight where you are now
function sideMark(){
  var sd=document.getElementById("side"); if(!sd) return;
  var here=[view], s=subOf(view);
  if(s){ here.push(view+"/"+s);
    if(view==="solat"&&s==="zikir") here.push("solat/zikir/"+sub.zikir);
    if(view==="learn"&&s==="panduan"){ here.push("learn/panduan/"+pandL3); if(learnPg) here.push("learn/panduan/"+pandL3+"/"+learnPg); }
    else if(view==="learn"&&learnPg) here.push(view+"/"+s+"/"+learnPg); }
  if(view==="more"&&moreGrp) here.push("more/"+moreGrp);
  if(view==="alat"&&s==="kewangan") here.push("fin/"+SUB2.fin);
  sd.querySelectorAll(".sdn.cur").forEach(function(x){ x.classList.remove("cur"); });
  here.forEach(function(id){ var x=sd.querySelector('.sdn[data-sid="'+id+'"]'); if(x) x.classList.add("cur"); });
}
// open on the first launch too (hidden), so the first ☰ tap is instant
setTimeout(sideBuild, 800);

// ---------- 0.32.0 WEATHER (Open-Meteo, no key) ----------
var WXC={0:["☀️","Cerah","Clear"],1:["🌤","Kebanyakan cerah","Mostly clear"],2:["⛅","Berawan separa","Partly cloudy"],3:["☁️","Mendung","Overcast"],45:["🌫","Berkabus","Fog"],48:["🌫","Kabus beku","Freezing fog"],
  51:["🌦","Gerimis ringan","Light drizzle"],53:["🌦","Gerimis","Drizzle"],55:["🌧","Gerimis lebat","Heavy drizzle"],61:["🌦","Hujan ringan","Light rain"],63:["🌧","Hujan","Rain"],65:["🌧","Hujan lebat","Heavy rain"],
  80:["🌦","Hujan renyai","Showers"],81:["🌧","Hujan sederhana","Moderate showers"],82:["⛈","Hujan sangat lebat","Violent showers"],95:["⛈","Ribut petir","Thunderstorm"],96:["⛈","Ribut petir + hujan batu","Thunderstorm + hail"],99:["⛈","Ribut petir + hujan batu","Thunderstorm + hail"],
  71:["🌨","Salji ringan","Light snow"],73:["🌨","Salji","Snow"],75:["❄️","Salji lebat","Heavy snow"],56:["🌧","Gerimis beku","Freezing drizzle"],57:["🌧","Gerimis beku","Freezing drizzle"],66:["🌧","Hujan beku","Freezing rain"],67:["🌧","Hujan beku","Freezing rain"],77:["🌨","Butir salji","Snow grains"],85:["🌨","Salji","Snow showers"],86:["❄️","Salji lebat","Heavy snow showers"]};
function wxName(c){ var x=WXC[c]||["🌡","–","–"]; return [x[0], L2x(x[1],x[2])]; }
function weatherGet(cb, force){
  var p=qiblaPoint(), c=load("ihsan_wx",null), key=p[0].toFixed(2)+","+p[1].toFixed(2);
  if(c && c.k===key && !force && Date.now()-c.t<30*60000){ cb(c.d, c.t); return; }
  var url="https://api.open-meteo.com/v1/forecast?latitude="+p[0].toFixed(4)+"&longitude="+p[1].toFixed(4)+"&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&hourly=precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=5";
  nFetch(url, function(st, body){ var d=null; try{ if(st>=200 && st<300) d=JSON.parse(body); }catch(e){}
    if(d && d.current){ var t=Date.now(); save("ihsan_wx",{k:key,t:t,d:d}); cb(d,t); } else cb(c?c.d:null, c?c.t:0, true); });
}
function weatherInto(box, compact){
  box.innerHTML='<h3>🌦 '+L2x("Cuaca di lokasi anda","Weather where you are")+'</h3><div class="mut small">'+L2x("Memuatkan…","Loading…")+'</div>';
  weatherGet(function(d, t, failed){
    if(!document.body.contains(box)) return;
    if(!d){ box.innerHTML='<h3>🌦 '+L2x("Cuaca","Weather")+'</h3><div class="mut small">'+L2x("Cuaca memerlukan internet. Cuba lagi kemudian.","Weather needs the internet. Try again later.")+'</div><button class="btn alt full g3d" id="wxR" style="margin-top:8px">↻ '+L2x("Cuba lagi","Try again")+'</button>'; box.querySelector("#wxR").onclick=function(){ weatherInto(box, compact); }; return; }
    var c=d.current, w=wxName(c.weather_code), dl=d.daily||{}, hr=d.hourly||{}, now=new Date(), en=en_();
    var rainNext=0; if(hr.time){ for(var i=0;i<hr.time.length;i++){ var ht=new Date(hr.time[i]); if(ht>=now && ht-now<6*3600000) rainNext=Math.max(rainNext, hr.precipitation_probability[i]||0); } }
    if(compact){ box.innerHTML='<div class="wxMini"><span class="wxI">'+w[0]+'</span><div><b>'+Math.round(c.temperature_2m)+'°C</b><div class="mut tiny">'+esc(w[1])+' · '+L2x("hujan 6j: ","rain 6h: ")+rainNext+'%</div></div></div>'; return; }
    var h='<h3>🌦 '+L2x("Cuaca di lokasi anda","Weather where you are")+'</h3><div class="wxNow"><span class="wxI">'+w[0]+'</span><div><div class="wxT">'+Math.round(c.temperature_2m)+'°C</div><div>'+esc(w[1])+'</div><div class="mut tiny">'+L2x("Terasa ","Feels ")+Math.round(c.apparent_temperature)+'°C · '+L2x("Lembapan ","Humidity ")+c.relative_humidity_2m+'% · '+L2x("Angin ","Wind ")+Math.round(c.wind_speed_10m)+' km/j</div></div></div>';
    h+='<div class="wxRain">☔ '+L2x("Peluang hujan 6 jam akan datang: ","Chance of rain in the next 6 hours: ")+'<b>'+rainNext+'%</b>'+(rainNext>=60?' · '+L2x("bawa payung ke masjid","take an umbrella to the masjid"):'')+'</div>';
    if(dl.time){ h+='<div class="wxDays">'+dl.time.map(function(ds,i){ var dd=parseYmd(ds), x=wxName(dl.weather_code[i]); return '<div><small>'+(i===0?L2x("Hari ini","Today"):dd.toLocaleDateString(locTag(),{weekday:"short"}))+'</small><span>'+x[0]+'</span><b>'+Math.round(dl.temperature_2m_max[i])+'°</b><em>'+Math.round(dl.temperature_2m_min[i])+'°</em><i>☔'+(dl.precipitation_probability_max[i]||0)+'%</i></div>'; }).join("")+'</div>'; }
    h+='<div class="mut tiny" style="margin-top:6px">'+L2x("Sumber: Open-Meteo · ","Source: Open-Meteo · ")+(failed?L2x("luar talian, data lama ","offline, old data "):"")+new Date(t).toLocaleTimeString(locTag(),{hour:"numeric",minute:"2-digit"})+' · <button class="linkb" id="wxR">'+L2x("muat semula","refresh")+'</button></div>';
    box.innerHTML=h; box.querySelector("#wxR").onclick=function(){ box.innerHTML='<div class="mut small">'+L2x("Memuatkan…","Loading…")+'</div>'; weatherGet(function(){ weatherInto(box, compact); }, true); };
  });
}
WG["weather"]=cardW("solat","🌦","Cuaca","Weather",function(){ setTimeout(function(){ var b=document.getElementById("wxW"); if(b) weatherInto(b, true); },0); return '<div id="wxW" data-act="q-kiblat"></div>'; },[2,1],[2,1]);

// ---------- 0.32.0 NOTES (like Keep): colours, checklists, pin, labels, search ----------
var NOTES=load("ihsan_notes",[]), ntQ="", ntLab="", NTC=[["","Tiada","None"],["#5c2b29","Merah","Red"],["#614a19","Oren","Orange"],["#635d19","Kuning","Yellow"],["#345920","Hijau","Green"],["#16504b","Teal","Teal"],["#2d555e","Biru","Blue"],["#42275e","Ungu","Purple"],["#5b2245","Merah jambu","Pink"],["#442f19","Coklat","Brown"],["#3c3f43","Kelabu","Grey"]];
function ntSave(){ save("ihsan_notes", NOTES); }
function ntLabels(){ var m={}; NOTES.forEach(function(n){ (n.lb||[]).forEach(function(l){ m[l]=1; }); }); return Object.keys(m).sort(); }
function ntHit(n){ if(n.arch && ntLab!=="__arch") return false; if(!n.arch && ntLab==="__arch") return false; if(ntLab && ntLab!=="__arch" && (n.lb||[]).indexOf(ntLab)<0) return false;
  if(!ntQ) return true; var q=ntQ.toLowerCase(); return ((n.t||"")+" "+(n.b||"")+" "+(n.cl||[]).map(function(x){ return x.x; }).join(" ")+" "+(n.lb||[]).join(" ")).toLowerCase().indexOf(q)>=0; }
function ntCardH(n){
  // 0.5.29: crossed-out (done) items are hidden; the card says how many are done
  var unN=n.cl?n.cl.map(function(x,i){ return [x,i]; }).filter(function(q){ return !q[0].d; }):[], dnN=n.cl?n.cl.length-unN.length:0;
  var body=n.cl? '<div class="ntCl">'+unN.slice(0,60).map(function(q){ return '<div><button class="ntTk" data-ntk="'+n.id+'|'+q[1]+'">☐</button>'+(n.ln?'<i class="ntNo">'+(q[1]+1)+'.</i>':'')+esc(q[0].x)+'</div>'; }).join("")+(unN.length>60?'<div class="mut tiny">+'+(unN.length-60)+'</div>':'')+(dnN?'<div class="mut tiny ntDnN">✓ '+dnN+' '+L2x("siap","done")+'</div>':'')+'</div>' : n.ln ? '<div class="ntB ntBn">'+(n.b||"").slice(0,4000).split("\n").map(function(l, i){ return '<div><i class="ntNo">'+(i+1)+'</i>'+esc(l)+'</div>'; }).join("")+'</div>' : '<div class="ntB">'+esc((n.b||"").slice(0,4000))+'</div>';   // 0.6.31 (owner): the tile shows the note down to its resizable bottom edge
  // 0.5.69 (owner): each sticky note has its own text size (A− A+ inside the note) and its own length (drag the bottom edge)
  var fs=n.fs||S.ntFs||14;
  return '<div class="ntCard" data-nt="'+n.id+'" style="--ntfs:'+fs+'px;'+(n.h?'height:'+n.h+'px;':'')+(n.c?'background:'+n.c:'')+'"><div class="ntKind">'+(n.cl?'☑':'📝')+'<span class="ntCf"><button data-ntcf="'+n.id+'|-1" aria-label="A−">A−</button><button data-ntcf="'+n.id+'|1" aria-label="A+">A+</button></span><span>'+new Date(n.u||Date.now()).toLocaleDateString(locTag(),{day:"numeric",month:"short"})+'</span></div>'+(n.p?'<span class="ntPin">📌</span>':'')+'<button class="ntStar'+((SD.fav||[]).indexOf("alat/nota/nota/"+n.id)>=0?' on':'')+'" data-ntf="'+n.id+'" aria-label="☆">'+((SD.fav||[]).indexOf("alat/nota/nota/"+n.id)>=0?'★':'☆')+'</button>'+(n.rem&&n.rem>Date.now()?'<div class="ntRemT">⏰ '+ntWhen(n.rem)+'</div>':'')+(n.t?'<b>'+esc(n.t)+'</b>':'')+body+((n.lb||[]).length?'<div class="ntLb">'+n.lb.map(function(l){ return '<span>'+esc(l)+'</span>'; }).join("")+'</div>':'')+'<div class="ntGrip noswipe" data-ntg="'+n.id+'" aria-label="↕"><i></i></div></div>'; }
function vNotes(el){
  var labs=ntLabels(), list=NOTES.filter(ntHit).sort(function(a,b){ return b.u-a.u; }), pins=list.filter(function(n){ return n.p; }), rest=list.filter(function(n){ return !n.p; });
  // 0.5.20 round 2, request 9: notes are even cards (like Recipes and Books) and the text size can go up or down (A− A+)
  document.documentElement.style.setProperty("--ntfs", (S.ntFs||14)+"px");
  var h='<div class="ntTop"><input id="ntSrch" class="ilq" placeholder="🔍 '+L2x("Cari nota","Search notes")+'" value="'+esc(ntQ)+'"></div>';
  h+='<div class="chips ntLabs"><button class="chip'+(!ntLab?' on':'')+'" data-ntl="">'+L2x("Semua","All")+'</button>'+labs.map(function(l){ return '<button class="chip'+(ntLab===l?' on':'')+'" data-ntl="'+esc(l)+'">🏷 '+esc(l)+'</button>'; }).join("")+'<button class="chip'+(ntLab==="__arch"?' on':'')+'" data-ntl="__arch">🗄 '+L2x("Arkib","Archive")+'</button></div>';
  h+='<div class="ntNew"><button class="btn gold g3d" id="ntAdd">＋ '+L2x("Nota baharu","New note")+'</button><button class="btn alt g3d" id="ntAddL">☑ '+L2x("Senarai semak","Checklist")+'</button></div>';
  if(!list.length) h+='<div class="card mut small" style="text-align:center">'+(NOTES.length?L2x("Tiada nota yang sepadan.","No matching notes."):L2x("Belum ada nota. Tulis senarai tugasan, nota kuliah, atau senarai barang.","No notes yet. Write a to-do list, class notes or a shopping list."))+'</div>';
  if(pins.length) h+='<div class="snl">📌 '+L2x("Disemat","Pinned")+'</div><div class="ntGrid">'+pins.map(ntCardH).join("")+'</div>'+(rest.length?'<div class="snl">'+L2x("Lain-lain","Others")+'</div>':'');
  if(rest.length) h+='<div class="ntGrid">'+rest.map(ntCardH).join("")+'</div>';
  el.innerHTML=h;
  var q=el.querySelector("#ntSrch"); q.oninput=function(){ ntQ=q.value; var pos=q.selectionStart; vNotes(el); var q2=el.querySelector("#ntSrch"); q2.focus(); try{ q2.setSelectionRange(pos,pos); }catch(e){} };
  el.querySelectorAll("[data-ntl]").forEach(function(b){ b.onclick=function(){ ntLab=b.getAttribute("data-ntl"); vNotes(el); }; });
  el.querySelectorAll("[data-ntfs]").forEach(function(b){ b.onclick=function(){ S.ntFs=Math.max(11, Math.min(26, (S.ntFs||14)+(+b.getAttribute("data-ntfs")))); saveS(); vNotes(el); }; });
  el.querySelector("#ntAdd").onclick=function(){ ntEdit(null,false,el); };
  el.querySelector("#ntAddL").onclick=function(){ ntEdit(null,true,el); };
  el.querySelectorAll("[data-ntf]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); var id="alat/nota/nota/"+b.getAttribute("data-ntf"); sideBuild(); sideFavToggle(id); var on=(SD.fav||[]).indexOf(id)>=0; b.classList.toggle("on",on); b.textContent=on?"★":"☆"; }; });
  el.querySelectorAll("[data-ntk]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); var p=b.getAttribute("data-ntk").split("|"), n=NOTES.filter(function(x){ return x.id===p[0]; })[0]; if(!n) return; n.cl[+p[1]].d=!n.cl[+p[1]].d; n.u=Date.now(); ntSave(); vNotes(el); }; });
  el.querySelectorAll("[data-nt]").forEach(function(c){ c.onclick=function(){ var n=NOTES.filter(function(x){ return x.id===c.getAttribute("data-nt"); })[0]; if(n) ntEdit(n,!!n.cl,el); }; });
  var ntBy=function(id){ return NOTES.filter(function(x){ return x.id===id; })[0]; };
  el.querySelectorAll("[data-ntcf]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); var p=b.getAttribute("data-ntcf").split("|"), n=ntBy(p[0]); if(!n) return; n.fs=Math.max(10, Math.min(30, (n.fs||S.ntFs||14)+(+p[1]))); ntSave(); var c=b.closest(".ntCard"); c.style.setProperty("--ntfs", n.fs+"px"); }; });
  el.querySelectorAll("[data-ntg]").forEach(function(g){ g.onclick=function(e){ e.stopPropagation(); };
    g.addEventListener("pointerdown", function(e){ e.preventDefault(); e.stopPropagation(); var c=g.closest(".ntCard"), n=ntBy(g.getAttribute("data-ntg")), y0=e.clientY, h0=c.offsetHeight, h=h0; c.classList.add("ntRs"); try{ g.setPointerCapture(e.pointerId); }catch(er){}
      var mv=function(ev){ h=Math.max(70, Math.min(900, h0+ev.clientY-y0)); c.style.height=h+"px"; };
      var up=function(){ g.removeEventListener("pointermove", mv); g.removeEventListener("pointerup", up); g.removeEventListener("pointercancel", up); c.classList.remove("ntRs"); if(n && Math.abs(h-h0)>2){ n.h=Math.round(h); ntSave(); } };
      g.addEventListener("pointermove", mv); g.addEventListener("pointerup", up); g.addEventListener("pointercancel", up); }); });
}
var ntRecOn=false, ntHs=null;
function ntMicStop(){ if(ntHs){ off("speech", ntHs); ntHs=null; } if(ntRecOn){ ntRecOn=false; try{ N.stopListen(); }catch(e){} } }
function ntWhen(t){ return new Date(t).toLocaleString(locTag(), {weekday:"short", day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"}); }
function ntEdit(n, asList, el){
  var isNew=!n; n=n?JSON.parse(JSON.stringify(n)):{id:"n"+Date.now().toString(36), t:"", b:"", cl:asList?[{x:"",d:false}]:null, c:"", p:false, lb:ntLab&&ntLab!=="__arch"?[ntLab]:[], u:Date.now()};
  var ov=document.getElementById("overlay"); ov.className="sheetov"; ov._pal=false; ov._showDone=false;
  var draw=function(){
    var h='<div class="sheet ntEd" style="--ntfs:'+(n.fs||S.ntFs||14)+'px;'+(n.c?'background:'+n.c:'')+'"><div class="ntEdFs"><button class="chip" data-nefs="-1">A−</button><b>'+(n.fs||S.ntFs||14)+'</b><button class="chip" data-nefs="1">A+</button></div>'+
      '<input id="ntTit" class="ntTi" placeholder="'+L2x("Tajuk","Title")+'" value="'+esc(n.t)+'">';
    var dnC=n.cl?n.cl.filter(function(x){ return x.d; }).length:0;
    // 0.5.98 (owner): ＋ adds an item, − marks it done; the done items show underneath (struck through, ＋ brings one back)
    if(n.cl){ var rowH=function(x,i){ return '<div class="ntRow'+(x.d?' dn':'')+'">'+(n.ln?'<i class="ntNo">'+(i+1)+'.</i>':'')+'<button class="ntTk ntPM'+(x.d?' re':'')+'" data-tg="'+i+'" aria-label="'+(x.d?L2x("Buka semula","Undo"):L2x("Siap","Done"))+'">'+(x.d?'＋':'−')+'</button><input data-ci="'+i+'" value="'+esc(x.x)+'" placeholder="'+L2x("Item","Item")+'"><button class="ntX" data-cx="'+i+'">✕</button></div>'; };
      var openR=n.cl.map(function(x,i){ return x.d?'':rowH(x,i); }).join(""), doneR=n.cl.map(function(x,i){ return x.d?rowH(x,i):''; }).join("");
      h+='<div class="ntEl">'+openR+'<button class="btn gold g3d ntAddBig" id="ntAddI">＋ '+L2x("Tambah item","Add an item")+'</button>'+(doneR?'<div class="ntDoneH">✓ '+L2x("Siap","Done")+' · '+dnC+'</div>'+doneR:'')+'</div>'; }
    else h+=(n.ln?'<div class="ntLnW"><div class="ntGut" id="ntGut"></div>':'')+'<textarea id="ntBd" class="ntBdy" placeholder="'+L2x("Tulis nota…","Write a note…")+'">'+esc(n.b)+'</textarea>'+(n.ln?'</div>':'');
    // 0.5.27: one 🎨 button opens the colours; 📌 Pin and ✓ Done (highlighted) sit at the bottom
    h+='<div class="ntCols'+(ov._pal?'':' hidden')+'" id="ntPal">'+NTC.map(function(c){ return '<button class="ntCo'+(n.c===c[0]?' on':'')+'" data-co="'+c[0]+'" style="background:'+(c[0]||'var(--card2)')+'" aria-label="'+esc(L2x(c[1],c[2]))+'"></button>'; }).join("")+'</div>'+
      '<input id="ntLbl" class="ilq" placeholder="🏷 '+L2x("Label, pisahkan dengan koma","Labels, separated by commas")+'" value="'+esc((n.lb||[]).join(", "))+'">'+
      '<div class="ntTools"><button class="chip ntColB" id="ntCol"><i style="background:'+(n.c||'var(--card2)')+'"></i>🎨 '+L2x("Warna","Colour")+'</button><button class="chip'+(ntRecOn?' rec':'')+'" id="ntMic">'+(ntRecOn?'⏺ '+L2x("Berhenti","Stop"):'🎙 '+L2x("Rakam suara ke teks","Dictate a voice note"))+'</button><button class="chip'+(n.rem&&n.rem>Date.now()?' on':'')+'" id="ntRem">⏰ '+(n.rem&&n.rem>Date.now()?ntWhen(n.rem):L2x("Peringatan","Reminder"))+'</button><button class="chip'+(n.ln?' on':'')+'" id="ntLn">🔢 '+L2x("Nombor baris","Line numbers")+'</button></div><div class="mut tiny" id="ntHear"></div>'+
      '<div class="btns" style="margin-top:10px"><button class="btn alt g3d" id="ntMode">'+(n.cl?'📝 '+L2x("Jadikan teks","Make text"):'☑ '+L2x("Jadikan senarai","Make checklist"))+'</button>'+(isNew?'':'<button class="btn alt g3d" id="ntArc">🗄 '+(n.arch?L2x("Nyaharkib","Unarchive"):L2x("Arkib","Archive"))+'</button><button class="btn alt g3d" id="ntShare">↗ '+L2x("Kongsi","Share")+'</button><button class="btn alt g3d" id="ntDel">🗑 '+L2x("Padam","Delete")+'</button>')+'</div>'+
      '<div class="ntBot"><button class="btn alt g3d'+(n.p?' on':'')+'" id="ntPin">'+(n.p?'📌 '+L2x("Disemat","Pinned"):'📍 '+L2x("Semat","Pin"))+'</button><button class="btn gold g3d ntDoneB" id="ntDone">✓ '+L2x("Siap","Done")+'</button></div></div>';
    ov.innerHTML=h;
    var grab=function(){ n.t=ov.querySelector("#ntTit").value; var bd=ov.querySelector("#ntBd"); if(bd) n.b=bd.value; ov.querySelectorAll("[data-ci]").forEach(function(i){ n.cl[+i.getAttribute("data-ci")].x=i.value; });
      n.lb=ov.querySelector("#ntLbl").value.split(",").map(function(x){ return x.trim().slice(0,24); }).filter(Boolean); };
    var commit=function(){ grab(); if(n.cl) n.cl=n.cl.filter(function(x){ return x.x.trim(); }); var empty=!n.t.trim() && !(n.b||"").trim() && !(n.cl&&n.cl.length);
      var i=NOTES.map(function(x){ return x.id; }).indexOf(n.id);
      if(empty){ if(i>=0) NOTES.splice(i,1); } else { n.u=Date.now(); if(i>=0) NOTES[i]=n; else NOTES.unshift(n); }
      ntSave(); closeOverlay(); if(el && document.body.contains(el)) vNotes(el); };
    var commit0=commit; commit=function(){ ntMicStop(); commit0(); var still=NOTES.some(function(x){ return x.id===n.id; });
      xrem("nt"+n.id, still && n.rem && !n.arch ? n.rem : 0, "📝 "+(n.t||L2x("Nota","Note")), n.cl?n.cl.filter(function(x){ return !x.d; }).map(function(x){ return "☐ "+x.x; }).join("  ").slice(0,140):(n.b||"").slice(0,140), "act:q-nota"); };
    ov._close=commit; ov.onclick=function(e){ if(e.target===ov) commit(); };
    ov.querySelectorAll("[data-nefs]").forEach(function(b){ b.onclick=function(){ n.fs=Math.max(10, Math.min(30, (n.fs||S.ntFs||14)+(+b.getAttribute("data-nefs")))); var sh=ov.querySelector(".ntEd"); sh.style.setProperty("--ntfs", n.fs+"px"); ov.querySelector(".ntEdFs b").textContent=n.fs; }; });
    // 0.5.23 voice note: the phone's speech-to-text writes into the note (keeps listening until Stop); 🎙 label added
    ov.querySelector("#ntMic").onclick=function(){ grab(); if(ntRecOn){ ntMicStop(); draw(); return; }
      if(!(window.Native && N.canListen && N.canListen())){ toast(L2x("Pengecaman suara tiada pada telefon ini","Speech recognition is not available on this phone")); return; }
      if(N.hasPerm && !N.hasPerm("mic")){ N.requestPerm("mic"); toast(L2x("Benarkan mikrofon, kemudian tekan lagi","Allow the microphone, then tap again")); return; }
      ntRecOn=true; if((n.lb||[]).indexOf("🎙")<0) n.lb=(n.lb||[]).concat(["🎙"]); draw();
      var lang=S.lang==="en"?"en-US":"ms-MY";
      ntHs=function(r){ var hr=ov.querySelector("#ntHear"); if(r.err!=null){ if(ntRecOn) setTimeout(function(){ if(ntRecOn) N.listen(lang); }, 300); return; }
        if(r.t==null) return; var t=String(r.t).split(" | ")[0].trim(); if(!r.final){ if(hr) hr.textContent="… "+t; return; }
        if(hr) hr.textContent=""; if(t){ grab(); if(n.cl){ n.cl=n.cl.filter(function(x){ return x.x.trim(); }); n.cl.push({x:t,d:false}); } else n.b=(n.b?n.b.replace(/\s*$/,"")+(/[.!?]$/.test(n.b.trim())?" ":". "):"")+t.charAt(0).toUpperCase()+t.slice(1); draw(); }
        if(ntRecOn) N.listen(lang); };
      on("speech", ntHs); N.listen(lang); };
    ov.querySelector("#ntRem").onclick=function(){ grab(); var pad=function(x){ return (x<10?"0":"")+x; }, loc=function(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+pad(d.getHours())+":"+pad(d.getMinutes()); };
      var d0=new Date(n.rem&&n.rem>Date.now()?n.rem:Date.now()+3600000), q=function(h, addD){ var d=new Date(); d.setDate(d.getDate()+(addD||0)); d.setHours(h,0,0,0); return d; };
      var opts=[[L2x("1 jam lagi","In 1 hour"), new Date(Date.now()+3600000)],[L2x("Malam ini 9:00","Tonight 9:00"), q(21)],[L2x("Esok 9:00 pagi","Tomorrow 9:00"), q(9,1)],[L2x("Selepas Isyak esok","After Isyak tomorrow"), (function(){ var t=getDay(addDays(new Date(),1)); return t.isyak?new Date(at(ymd(addDays(new Date(),1)), t.isyak).getTime()+30*60000):q(21,1); })()]];
      var sh=document.createElement("div"); sh.className="ntRemBox"; sh.innerHTML='<div class="btns">'+opts.filter(function(o){ return o[1]>Date.now(); }).map(function(o, i){ return '<button class="chip" data-rq="'+o[1].getTime()+'">'+o[0]+'</button>'; }).join("")+'</div>'+
        '<input type="datetime-local" id="ntRemT" class="ilq" value="'+loc(d0)+'"><div class="btns"><button class="btn gold g3d" id="ntRemOk">✓ '+L2x("Tetapkan","Set")+'</button>'+(n.rem?'<button class="btn alt g3d" id="ntRemX">✕ '+L2x("Buang","Remove")+'</button>':'')+'</div>';
      var old=ov.querySelector(".ntRemBox"); if(old){ old.remove(); return; } ov.querySelector("#ntHear").after(sh);
      var setR=function(t){ n.rem=t; if(t) toast("⏰ "+ntWhen(t)); draw(); };
      sh.querySelectorAll("[data-rq]").forEach(function(b){ b.onclick=function(){ setR(+b.getAttribute("data-rq")); }; });
      sh.querySelector("#ntRemOk").onclick=function(){ var t=new Date(sh.querySelector("#ntRemT").value).getTime(); if(!t || t<Date.now()){ toast(L2x("Pilih masa akan datang","Pick a future time")); return; } setR(t); };
      var rx=sh.querySelector("#ntRemX"); if(rx) rx.onclick=function(){ setR(0); }; };
    ov.querySelector("#ntDone").onclick=commit;
    // 0.6.67 (owner): numbers for each line (a gutter beside the text, numbers before checklist items, in the card and when shared)
    ov.querySelector("#ntLn").onclick=function(){ grab(); n.ln=!n.ln; draw(); };
    var gt=ov.querySelector("#ntGut"), bd0=ov.querySelector("#ntBd"); if(gt && bd0){ var gut=function(){ var cs=getComputedStyle(bd0), mir=document.createElement("div"); mir.style.cssText="position:absolute;visibility:hidden;left:-9999px;top:0;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;box-sizing:border-box;width:"+bd0.clientWidth+"px;font:"+cs.font+";line-height:"+cs.lineHeight+";padding-left:"+cs.paddingLeft+";padding-right:"+cs.paddingRight+";letter-spacing:"+cs.letterSpacing;
        document.body.appendChild(mir); var hs=bd0.value.split("\n").map(function(l){ mir.textContent=l||" "; return mir.offsetHeight; }); mir.remove();
        gt.innerHTML='<div style="padding-top:'+cs.paddingTop+'">'+hs.map(function(hh, i){ return '<div style="height:'+hh+'px">'+(i+1)+'</div>'; }).join("")+'</div>'; gt.firstChild.style.transform="translateY("+(-bd0.scrollTop)+"px)"; };
      bd0.addEventListener("input", gut); bd0.addEventListener("scroll", function(){ if(gt.firstChild) gt.firstChild.style.transform="translateY("+(-bd0.scrollTop)+"px)"; }); setTimeout(gut, 0); window.addEventListener("resize", gut); }
    ov.querySelector("#ntPin").onclick=function(){ grab(); n.p=!n.p; draw(); };
    ov.querySelectorAll("[data-co]").forEach(function(b){ b.onclick=function(){ grab(); n.c=b.getAttribute("data-co"); ov._pal=false; draw(); }; });
    ov.querySelector("#ntCol").onclick=function(){ grab(); ov._pal=!ov._pal; ov.querySelector("#ntPal").classList.toggle("hidden", !ov._pal); };
    ov.querySelectorAll("[data-tg]").forEach(function(b){ b.onclick=function(){ grab(); var i=+b.getAttribute("data-tg"); n.cl[i].d=!n.cl[i].d; draw(); }; });
    ov.querySelectorAll("[data-cx]").forEach(function(b){ b.onclick=function(){ grab(); n.cl.splice(+b.getAttribute("data-cx"),1); draw(); }; });
    ov.querySelectorAll("[data-ci]").forEach(function(inp){ inp.onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); grab(); var i=+inp.getAttribute("data-ci"); n.cl.splice(i+1,0,{x:"",d:false}); draw(); var nx=ov.querySelector('[data-ci="'+(i+1)+'"]'); if(nx) nx.focus(); } }; });
    var sdn=ov.querySelector("#ntShowD"); if(sdn) sdn.onclick=function(){ grab(); ov._showDone=!ov._showDone; draw(); };
    var ai=ov.querySelector("#ntAddI"); if(ai) ai.onclick=function(){ grab(); n.cl.push({x:"",d:false}); draw(); var nw=ov.querySelector('[data-ci="'+(n.cl.length-1)+'"]'); if(nw){ nw.focus(); try{ nw.scrollIntoView({block:"center"}); }catch(e){} } };   // 0.6.31: focus the NEW item (not the last box on screen, which can be in Done)
    ov.querySelector("#ntMode").onclick=function(){ grab(); if(n.cl){ n.b=n.cl.map(function(x){ return x.x; }).filter(Boolean).join("\n"); n.cl=null; } else { n.cl=(n.b||"").split("\n").filter(function(x){ return x.trim(); }).map(function(x){ return {x:x,d:false}; }); if(!n.cl.length) n.cl=[{x:"",d:false}]; n.b=""; } draw(); };
    var ar=ov.querySelector("#ntArc"); if(ar) ar.onclick=function(){ grab(); n.arch=!n.arch; commit(); };
    var sh=ov.querySelector("#ntShare"); if(sh) sh.onclick=function(){ grab(); var t=(n.t?n.t+"\n\n":"")+(n.cl?n.cl.map(function(x, i){ return (n.ln?(i+1)+". ":"")+(x.d?"☑ ":"☐ ")+x.x; }).join("\n"):(n.ln?(n.b||"").split("\n").map(function(l, i){ return (i+1)+". "+l; }).join("\n"):n.b)); if(window.Native && N.shareText) N.shareText(t); else if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ toast(L2x("Disalin","Copied")); }); };
    var dl=ov.querySelector("#ntDel"); if(dl) dl.onclick=function(){ if(!confirm(L2x("Padam nota ini?","Delete this note?"))) return; var i=NOTES.map(function(x){ return x.id; }).indexOf(n.id); if(i>=0) NOTES.splice(i,1); ntSave(); ntMicStop(); xrem("nt"+n.id, 0); closeOverlay(); if(el && document.body.contains(el)) vNotes(el); };
    if(isNew){ var f=n.cl?ov.querySelector('[data-ci="0"]'):ov.querySelector("#ntBd"); if(f && !ov._fx){ ov._fx=1; setTimeout(function(){ f.focus(); },50); } }
  };
  draw();
}
WG["notes"]=cardW("tools","📝","Nota","Notes",function(){ var l=NOTES.filter(function(n){ return !n.arch; }).sort(function(a,b){ return (b.p?1:0)-(a.p?1:0) || b.u-a.u; }).slice(0,3);
  return '<div data-act="q-nota">'+(l.length?l.map(function(n){ return '<div class="ntW" style="'+(n.c?'background:'+n.c:'')+'">'+(n.p?'📌 ':'')+'<b>'+esc(n.t||(n.cl?(n.cl[0]||{}).x:(n.b||"").split("\n")[0])||"…")+'</b>'+(n.cl?' <span class="mut tiny">'+n.cl.filter(function(x){ return x.d; }).length+'/'+n.cl.length+'</span>':'')+'</div>'; }).join(""):'<div class="mut small">📝 '+L2x("Belum ada nota. Ketik untuk menulis.","No notes yet. Tap to write.")+'</div>')+'</div>'; },[2,2],[2,2]);
WG["sc-nota"]=scW("tools","📝","Nota","Notes","q-nota","Nota & senarai semak","Notes & checklists");

// ---------- 0.31.0 ONBOARDING: name, language, syahadah ----------
var SYH=[["أَشْهَدُ","Asyhadu","اشهد",["ashhad","asyhad","ashad","eshhed"]],["أَنْ","an","ان",["an"]],["لَا","lā","لا",["la"]],["إِلٰهَ","ilāha","اله",["ilah","ilaa"]],["إِلَّا","illā","الا",["illa","ila"]],["اللّٰهُ","Allāh","الله",["allah","alla","llah","ullah"]],
  ["وَأَشْهَدُ","wa asyhadu","واشهد",["wa","washhad","wasyhad","ashhad","asyhad"]],["أَنَّ","anna","ان",["anna","ann"]],["مُحَمَّدًا","Muḥammadan","محمدا",["muhammad","mohammad","muhamad","mohamad","mohammed","muhammed"]],["رَسُولُ","rasūlu","رسول",["rasul","rasool","rosul"]],["اللّٰهِ","Allāh","الله",["allah","alla","llah","ullah"]]];
function arNorm(t){ return String(t||"").replace(/[ً-ٰٟـۖ-ۭ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[^ء-ي\s]/g," "); }
function lev(a,b){ if(a===b) return 0; var m=a.length, n=b.length, d=[], i, j; for(i=0;i<=m;i++){ d[i]=[i]; } for(j=0;j<=n;j++) d[0][j]=j; for(i=1;i<=m;i++) for(j=1;j<=n;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); return d[m][n]; }
// how many syahadah words (in order) one heard sentence covers
function syhProgress(txt, from){
  var best=from;
  String(txt||"").split(" | ").forEach(function(alt){
    var ar=/[؀-ۿ]/.test(alt), toks=(ar?arNorm(alt):alt.toLowerCase().replace(/[^a-z\s]/g," ")).split(/\s+/).filter(Boolean), i=from;
    var eat=function(tok){ if(i>=SYH.length) return; var w=SYH[i];
      if(ar){ var sk=w[2], t2=tok; if(t2===sk || (sk.length>=3 && lev(t2,sk)<=1) || (sk.charAt(0)==="و" && t2===sk.slice(1))){ i++; return; }
        // words heard joined together, e.g. "لااله"
        if(t2.indexOf(sk)===0 && t2.length>sk.length){ i++; eat(t2.slice(sk.length)); } }
      else { var hit=null; w[3].some(function(r){ if(tok.indexOf(r)===0 || (r.length>=4 && lev(tok.slice(0,r.length),r)<=1)){ hit=r; return true; } return false; });
        if(hit!==null){ if(w[1]==="wa asyhadu" && tok==="wa") return; i++; var rest=tok.slice(hit.length); if(rest.length>=3) eat(rest); } }
    };
    toks.forEach(eat); best=Math.max(best,i);
  });
  return best;
}
function obNeeded(){ if(!S.onboard) return true; if(S.obAsk===false) return false; return S.obSeen!==APP_VER; }
function applyName(){ var t=document.getElementById("topTitle"); if(t) t.textContent=(S.showName && S.uname)? "Salam, "+S.uname : "My Ihsan"; }
function onboardShow(){
  var ov=document.createElement("div"); ov.id="obx"; document.body.appendChild(ov);
  var step=0, prog=0, mode=null, listening=false, upd=!!S.onboard;
  var stopMic=function(){ if(listening && window.Native && N.stopListen) N.stopListen(); listening=false; off("speech",hs); };
  var hs=function(p){ if(p.err!==undefined){ listening=false; var mb=ov.querySelector("#obMic"); if(mb){ mb.classList.remove("rec"); mb.innerHTML="🎙 "+L2x("Cuba lagi","Try again"); } if(p.err!==7 && p.err!==6){ var e=ov.querySelector("#obErr"); if(e) e.textContent=L2x("Mikrofon tidak dapat mendengar. Cuba lagi, atau ketik perkataan.","The mic could not hear you. Try again, or tap the words."); } return; }
    if(p.ready){ var e2=ov.querySelector("#obErr"); if(e2) e2.textContent=L2x("Sedang mendengar… bacalah perlahan-lahan.","Listening… read slowly."); return; }
    var np=syhProgress(p.t, prog); if(np>prog){ prog=np; lightUp(); }
    if(p.final){ listening=false; if(prog<SYH.length){ var mb2=ov.querySelector("#obMic"); if(mb2){ mb2.classList.remove("rec"); mb2.innerHTML="🎙 "+L2x("Sambung bacaan","Keep reading"); } } } };
  var lightUp=function(){ ov.querySelectorAll(".syW").forEach(function(w,i){ w.classList.toggle("lit", i<prog); w.classList.toggle("nx", i===prog); });
    if(prog>=SYH.length){ stopMic(); var d=ov.querySelector("#obSyhDone"); if(d){ d.style.display=""; } var mb=ov.querySelector("#obMic"); if(mb) mb.style.display="none"; var er=ov.querySelector("#obErr"); if(er) er.textContent=""; var nb=ov.querySelector("#obNext"); if(nb) nb.textContent=L2x("Seterusnya","Next")+" ›"; if(window.Native && N.vibrate) try{ N.vibrate(60); }catch(e){} } };
  var foot=function(next){ return '<div class="obF">'+(step>0?'<button class="btn alt g3d" id="obBack">‹ '+L2x("Kembali","Back")+'</button>':'<span></span>')+'<div class="obDots">'+[0,1,2,3].map(function(i){ return '<i'+(i===step?' class="on"':'')+'></i>'; }).join("")+'</div><button class="btn gold g3d" id="obNext">'+next+'</button></div>'; };
  var draw=function(){
    var h='<div class="obIn">';
    // 0.5.69 (owner): the language comes first, then the name
    if(step===1){
      h+='<div class="obLogo">👋</div><h2>'+L2x("Siapa nama anda?","What is your name?")+'</h2>'+
        '<label class="obL">'+L2x("Nama anda","Your name")+'</label><input id="obName" class="obInp" maxlength="24" placeholder="'+L2x("cth. Farah","e.g. Farah")+'" value="'+esc(S.uname||"")+'">'+
        '<label class="obChk"><input type="checkbox" id="obShow"'+(S.showName!==false?' checked':'')+'> '+L2x("Tunjuk nama saya di bar atas","Show my name in the top bar")+'</label>'+
        '<div class="mut tiny">'+L2x("Nama hanya disimpan dalam telefon ini.","Your name is only kept on this phone.")+'</div>';
      h+='</div>'+foot(L2x("Seterusnya","Next")+' ›');
    } else if(step===0){
      var cur=S.ulang||S.lang||"ms";
      h+='<div class="obLogo"><img src="logo.svg" alt="My Ihsan" width="80" height="80" style="border-radius:20px"></div><h2>'+(upd?L2x("My Ihsan telah dikemas kini","My Ihsan has been updated")+' · '+APP_VER:L2x("Selamat datang ke My Ihsan","Welcome to My Ihsan"))+'</h2><div class="obL">🌐 '+L2x("Pilih bahasa","Choose a language")+'</div><div class="obLang">'+[["ms","🇲🇾","Bahasa Melayu"],["en","🇬🇧","English"],["id","🇮🇩","Bahasa Indonesia"],["ar","🇸🇦","العربية"]].map(function(x){ return '<button class="g3d'+(cur===x[0]?' on':'')+'" data-oblang="'+x[0]+'"><span>'+x[1]+'</span>'+x[2]+'</button>'; }).join("")+'</div>';
      h+='</div>'+foot(L2x("Seterusnya","Next")+' ›');
    } else if(step===2){
      h+='<div class="obLogo">☝️</div><h2>'+L2x("Ucapkan dua kalimah syahadah","Say the two testimonies of faith")+'</h2>'+
        '<div class="mut small">'+L2x("Baca dengan mikrofon dan setiap perkataan akan menyala, atau ketik perkataan mengikut turutan.","Read with the microphone and each word lights up, or tap the words in order.")+'</div>'+
        '<div class="syG" dir="rtl">'+SYH.map(function(w,i){ return '<button class="syW'+(i<prog?' lit':'')+(i===prog?' nx':'')+'" data-sy="'+i+'"><b>'+w[0]+'</b><small>'+w[1]+'</small></button>'; }).join("")+'</div>'+
        '<div class="obMean small">'+L2x("“Aku bersaksi bahawa tiada tuhan selain Allah, dan aku bersaksi bahawa Muhammad itu utusan Allah.”","“I bear witness that there is no god but Allah, and I bear witness that Muhammad is the Messenger of Allah.”")+'</div>'+
        (WEB?'<button id="obMic" style="display:none"></button>':'<button class="btn gold full g3d" id="obMic">🎙 '+L2x("Baca dengan mikrofon","Read with the microphone")+'</button>')+'<div class="mut tiny" id="obErr" style="text-align:center;margin-top:6px"></div>'+
        '<div id="obSyhDone" class="obDone" style="display:none">✨ '+L2x("Alhamdulillah. Semoga Allah menetapkan iman kita.","Alhamdulillah. May Allah keep our faith firm.")+'</div>';
      h+='</div>'+foot(prog>=SYH.length?L2x("Seterusnya","Next")+' ›':L2x("Langkau","Skip")+' ›');
    } else {
      h+='<div class="obLogo">✅</div><h2>'+L2x("Hampir siap","Almost done")+'</h2>';
      if(!upd) h+='<div class="small">'+(WEB?L2x("Benarkan lokasi untuk zon waktu solat JAKIM.","Allow location for the JAKIM prayer zone."):L2x("Benarkan lokasi untuk zon waktu solat JAKIM dan kiblat, dan notifikasi untuk makluman waktu solat.","Allow location for the JAKIM prayer zone and Qibla, and notifications for prayer alerts."))+'</div><div class="btns" style="margin:10px 0"><button class="btn alt g3d" id="obLoc2">📍 '+L2x("Lokasi","Location")+'</button>'+(WEB?'':'<button class="btn alt g3d" id="obNot2">🔔 '+L2x("Notifikasi","Notifications")+'</button>')+'</div>';
      h+='<label class="obChk"><input type="checkbox" id="obAsk"'+(S.obAsk!==false?' checked':'')+'> '+L2x("Tunjuk skrin alu-aluan ini setiap kali aplikasi dikemas kini","Show this welcome screen every time the app is updated")+'</label>'+
        '<div class="mut tiny">'+L2x("Boleh diubah kemudian dalam Tetapan › Paparan & bahasa.","You can change this later in Settings › Display & language.")+'</div>';
      if(!upd && !S.kidLock && window.IhsanTour) h+=IhsanTour.choiceHtml();
      h+='</div>'+foot((!upd && window.IhsanTour ? L2x("Langkau","Skip") : L2x("Mula","Start"))+' ✓');
    }
    ov.innerHTML=h;
    var nx=ov.querySelector("#obNext"), bk=ov.querySelector("#obBack");
    if(bk) bk.onclick=function(){ stopMic(); step--; draw(); };
    nx.onclick=function(){
      if(step===1){ S.uname=(ov.querySelector("#obName").value||"").trim().slice(0,24); S.showName=ov.querySelector("#obShow").checked; saveS(); applyName(); }
      if(step===2) stopMic();
      if(step===3){ S.obAsk=ov.querySelector("#obAsk").checked; S.onboard=true; S.obSeen=APP_VER; saveS(); ov.remove(); render(); return; }
      step++; draw(); };
    ov.querySelectorAll("[data-oblang]").forEach(function(b){ b.onclick=function(){ var v=b.getAttribute("data-oblang"); setULang(v); arLoad(draw); }; });
    ov.querySelectorAll("[data-sy]").forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute("data-sy"); if(i===prog){ prog++; lightUp(); if(window.Native && N.speak && i<SYH.length) try{ N.speak(SYH[i][0],"ar"); }catch(e){} } else if(i>prog){ b.classList.add("shake"); setTimeout(function(){ b.classList.remove("shake"); },400); } }; });
    var mic=ov.querySelector("#obMic"); if(mic) mic.onclick=function(){
      if(!window.Native || !N.listen){ ov.querySelector("#obErr").textContent=L2x("Mikrofon hanya dalam aplikasi telefon. Ketik perkataan.","The microphone works in the phone app only. Tap the words."); return; }
      if(N.canListen && !N.canListen()){ ov.querySelector("#obErr").textContent=L2x("Telefon ini tiada pengecaman suara. Ketik perkataan.","This phone has no speech recognition. Tap the words."); return; }
      var start=function(){ off("speech",hs); on("speech",hs); listening=true; mic.classList.add("rec"); mic.innerHTML="⏺ "+L2x("Sedang mendengar…","Listening…"); N.listen("ar-SA"); };
      if(listening){ stopMic(); mic.classList.remove("rec"); mic.innerHTML="🎙 "+L2x("Baca dengan mikrofon","Read with the microphone"); return; }
      if(N.hasPerm("mic")) start(); else { var hp=function(p){ if(p.which!=="mic") return; off("perm",hp); if(p.granted) start(); else ov.querySelector("#obErr").textContent=L2x("Kebenaran mikrofon ditolak. Ketik perkataan.","Microphone permission denied. Tap the words."); }; on("perm",hp); N.requestPerm("mic"); } };
    ov.querySelectorAll("[data-obtour]").forEach(function(b){ b.onclick=function(){ var m=b.getAttribute("data-obtour"); S.obAsk=ov.querySelector("#obAsk").checked; S.onboard=true; S.obSeen=APP_VER; saveS(); ov.remove(); render(); setTimeout(function(){ IhsanTour.start(m); }, 300); }; });
    var l2=ov.querySelector("#obLoc2"); if(l2) l2.onclick=function(){ askLocation(true); };
    var n2=ov.querySelector("#obNot2"); if(n2) n2.onclick=function(){ N.requestPerm("notif"); };
    if(step===2 && prog>=SYH.length) lightUp();
  };
  draw();
}
function nameCard(){
  var c=document.createElement("div"); c.className="card";
  c.innerHTML='<h3>🌐 '+L2x("Nama & skrin alu-aluan","Name & welcome screen")+'</h3><div class="set"><span>'+L2x("Nama","Name")+'</span><input id="nmIn" class="obInp" maxlength="24" value="'+esc(S.uname||"")+'" style="max-width:170px;font-size:15px;padding:8px"></div>'+
    '<label class="obChk"><input type="checkbox" id="nmShow"'+(S.showName?' checked':'')+'> '+L2x("Tunjuk nama di bar atas","Show name in the top bar")+'</label>'+
    '<label class="obChk"><input type="checkbox" id="nmAsk"'+(S.obAsk!==false?' checked':'')+'> '+L2x("Tunjuk skrin alu-aluan setiap kali dikemas kini","Show the welcome screen after every update")+'</label>'+
    '<button class="btn alt full g3d" id="nmAgain" style="margin-top:6px">👋 '+L2x("Buka skrin alu-aluan sekarang","Open the welcome screen now")+'</button>';
  c.querySelector("#nmIn").onchange=function(){ S.uname=this.value.trim().slice(0,24); saveS(); applyName(); };
  c.querySelector("#nmShow").onchange=function(){ S.showName=this.checked; saveS(); applyName(); };
  c.querySelector("#nmAsk").onchange=function(){ S.obAsk=this.checked; saveS(); };
  c.querySelector("#nmAgain").onclick=onboardShow;
  return c;
}

// ---------- boot ----------
applyTheme(); applyFont(); if(window.IdLang && S.ulang==="id") IdLang.set(true); arApply();
applyName(); if((S.kidLock||S.appLock) && window.Native && N.lockTask) setTimeout(function(){ N.lockTask(true); }, 600);
on("resume", function(){ setTimeout(lockRepin, 400); });
setTimeout(function(){ var ran=0, ob=function(){ if(ran++) return; if(obNeeded() && !S.kidLock && !S.appLock) onboardShow(); }; if(S.kidLock || WEB) ob(); else { var t=setTimeout(ob, 1500); tourLoad(function(){ clearTimeout(t); ob(); if(view==="home" && S.onboard) render(); }); } }, 250);
on("pause", function(){ usageOn(false); if(jnOpen && jnData().lock){ jnOpen=false; var o=document.getElementById("overlay"); if(o && o.querySelector("#jnG")) closeOverlay(); if(view==="cal") render(); } jnOpen=false; });
on("resume", function(){ usageOn(true); });
on("widgetRakaat", function(){
  var ov0=document.getElementById("overlay"); if(ov0._close) ov0._close(); else closeOverlay(); view="home"; render();
  rk.solat=currentPrayer(); var target=rkTarget();
  if(S.rmode==="camera" && !N.hasPerm("camera")){ var hp=function(p){ if(p.which!=="camera") return; off("perm",hp); if(p.granted) startPraying(target); }; on("perm",hp); N.requestPerm("camera"); }
  else startPraying(target);
});
on("perm", function(p){ if(p.which==="notif" && p.granted){ pushSchedule(); toast(S.lang==="en"?"Notifications on":"Notifikasi diaktifkan"); } });
on("resume", function(){ ensureData(false); pushSchedule(); if(S.zoneAuto && N.hasPerm("location") && Date.now()-(S.locAt||0) > 20*60000) askLocation(false); if(view==="home"||view==="solat") render(); });
on("openView", function(d){ var v=d.v; if(v && v.indexOf("inbox:")===0){ notePull(); noteOpen(); return; } var ov0=document.getElementById("overlay"); if(!ov0.classList.contains("hidden")) return; if(v==="player"){ if(window.IbMedia) IbMedia.openPlayer(); return; } if(v.indexOf("side:")===0){ var sn=sideFind(v.slice(5)); if(sn && sn.f) sn.f(); return; } if(v==="quran"){ openQuran(false); return; } if(v==="homeset" || v.indexOf("homeset:")===0){ openHomeSet(v.split(":")[1]||null); return; } if(v.indexOf("find:")===0){ openSearch(v.slice(5)); return; } if(v.indexOf("act:")===0){ homeAct(v.slice(4)); return; } if(v==="falak" || v.indexOf("falak:")===0){ openFalak(v.split(":")[1]); return; } if(v==="statw"){ SUB2.cal="statistik"; STV.p="d"; STV.d=ymd(new Date()); STV.insW=true; go("cal"); return; } if(v.indexOf("display:")===0){ dspPlay(v.slice(8)); return; } if(v.indexOf("fx:")===0){ fxPair=v.slice(3); SUB2.fin="tukaran"; go("fin"); return; } if(["home","solat","zikir","sunat","doa","mathurat","amal","cal","more","learn","kids","alat","halal","qibla","rakaat","fin","kumpulan","paparan"].indexOf(v)>=0) go(v); });
on("volkey", function(){ if(volHook) { volHook(); return; } if(darkTap) { darkTap(); return; } if((view==="zikir"||(view==="solat"&&SUB2.solat==="zikir")) && sub.zikir==="tasbih" && tbTap) tbTap(); });
on("tts", function(r){ if(r.error==="nolang") toast(S.lang==="en"?"No Arabic voice on this phone. Install it in Settings > Text-to-speech.":"Tiada suara Arab pada telefon ini. Pasang di Tetapan > Teks ke pertuturan."); });
// 0.2.9 recipe builder: text, links, photos or a video shared to My Ihsan from another app (Share › My Ihsan)
on("share", function(d){
  if(S.kidLock){ if(d.kind!=="start") toast(L2x("Mod kanak-kanak dikunci: resepi tidak diterima.","Kids mode is locked: the recipe was not taken.")); return; }
  var ov=document.getElementById("overlay"); if(!ov.classList.contains("hidden")){ if(ov._close) ov._close(); else closeOverlay(); }
  window.__rcpShare=d; halalAuto="recipe"; SUB2.alat="halal";
  if(view!=="alat") go("alat"); else { render(); document.getElementById("view").scrollTop=0; }
});
// 0.5.6: a salasilah .json shared or opened with "My Ihsan Family" goes to Alat › Keluarga, which asks who you are in it
on("famshare", function(d){ if(S.kidLock) return; try{ var tj=JSON.parse(d.body||""); if(tj && tj.tekap){ tkOpenWith({json:d.body}); return; } }catch(e){} var ov=document.getElementById("overlay"); if(!ov.classList.contains("hidden")){ if(ov._close) ov._close(); else closeOverlay(); }
  SUB2.alat="keluarga"; go("alat"); var n=0, t=setInterval(function(){ if(window.FamImportText && document.querySelector("#view .finv") || ++n>40){ clearInterval(t); if(window.FamImportText) try{ FamImportText(d.body||""); }catch(e){ console.error(e); } } }, 150); });
try{ dsInit(); dsPaint(); }catch(e){ console.error(e); }   // 0.6.30 Drive sync
document.addEventListener("click", function(e){ var w=e.target.closest && e.target.closest(".wsync"); if(!w || (document.getElementById("wGrid")||{classList:{contains:function(){return false;}}}).classList.contains("editing")) return; openSync(); });
on("opened", function(r){ if(window.IbOpenOnce && !r.files){ var f=window.IbOpenOnce; window.IbOpenOnce=null; f(r.body); return; } window.IbOpenOnce=null; restoreBackup(r.body, r); });
on("saved", function(){ toast(S.lang==="en"?"Backup saved":"Sandaran disimpan"); });
on("fileError", function(r){ toast("Error: "+r.error); });
document.addEventListener("click", globalClick);
// ---------- 0.33.0 BACK HISTORY ----------
// Every change of tab, page, sub-page or opened item is remembered (up to 80 steps). The Android back button walks back
// through exactly what was seen before (previous item, page or tab), never straight to Home or the parent level.
// Modules (Quran, Ilmu, Bacaan, media, Keluarga) expose navGet()/navSet() so their own inner pages join the same history.
var NAVH=[], navCur=null, navRest=false, NAVMOD=[["uni","UniView"],["quran","QuranView"],["ilmu","IlmuView"],["bacaan","BacaanView"],["media","IbMedia"],["fam","FamView"],["ev","EventView"],["fit","FitView"],["rcp","HalalRecipe"],["period","PeriodView"],["grp","GroupsView"],["dok","DokumenView"],["news","IbNews"],["tekap","Tekap"]];
// 0.6.56: page modules that keep their own tab in a window.__*Pg variable (Business, Meeting, Move, Split, Recipes)
var PGW=["__niagaPg","__meetPg","__splitPg","__rcpPg"];
function navPgw(){ var w={}, g=window.__pgNow||{}; PGW.forEach(function(k){ var v=null; try{ v=g[k]?g[k]():window[k]; }catch(e){} if(v!=null && v!=="") w[k]=v; }); return w; }
// 0.6.56 (owner): leaving the app anywhere (closed, swiped away, memory cleared) and opening it again comes back to the same page and scroll
function navKeep(){ if(!navCur || S.kidLock) return; try{ localStorage.setItem("ihsan_navlast", JSON.stringify({o:navCur.o, y:document.getElementById("view").scrollTop, t:Date.now()})); }catch(e){} }
function navResume(){ var s=null; try{ s=JSON.parse(localStorage.getItem("ihsan_navlast")||"null"); }catch(e){}
  if(!s || !s.o || !s.o.v || S.kidLock || IS_TV || s.o.v==="more") return false;
  try{ navRestore({o:s.o, y:s.y||0}); }catch(e){ console.error(e); return false; }
  navCur=null; navTick(); var y=s.y||0;
  // modules that load a moment later (Quran, lessons, media…) get their own page back once they are there
  [700,1600].forEach(function(t){ setTimeout(function(){ NAVMOD.forEach(function(x){ var M=window[x[1]], m=s.o.m&&s.o.m[x[0]]; if(!M || !M.navSet || !m) return; try{ var c=M.navGet&&M.navGet(); if(!c || c.k!==m.k) M.navSet(m); }catch(e){} });
    var v=document.getElementById("view"); if(y && Math.abs(v.scrollTop-y)>4) v.scrollTop=y; navCur=null; navTick(); }, t); });
  return true; }
function navState(){
  var o={v:view, s2:JSON.parse(JSON.stringify(SUB2)), sp:sunPage, lp:learnPg, lf:learnFrom, p3:pandL3, bp:basicsPg, bf:basicsFrom, si:sciId, sk:SUB2.learn==="sekolah" && view==="learn" ? !!sekCfg().skYear+"|"+(sekCfg().tahap||"")+"|"+(sekCfg().anak||"")+"|"+(sekCfg().skUpkk||"")+"|"+(sekCfg().uni||"") : "", st:sunTop, sc:sunCat, mg:moreGrp, zk:sub.zikir, dc:doaCat, me:mathEvening, w:navPgw(), wr:wrTab, m:{}}, k=[];
  NAVMOD.forEach(function(x){ var M=window[x[1]]; if(M && M.navGet){ try{ var s=M.navGet(); if(s){ o.m[x[0]]=s; k.push(x[0]+":"+s.k); } }catch(e){} } });
  var a={}, mk={}; for(var p in o) if(p!=="m") a[p]=o[p]; for(var q in o.m) mk[q]=o.m[q].k;
  return {o:o, j:JSON.stringify(a)+"#"+k.join("|"), a:JSON.stringify(a), mk:mk};
}
// a real step = the app page changed, or a module that was already there changed its own page (a module that only just loaded is not a step)
function navDiff(x, y){ if(x.a!==y.a) return true; for(var q in x.mk) if(y.mk[q]!==undefined && y.mk[q]!==x.mk[q]) return true; return false; }
function navTick(){
  if(!NAVH || navRest || S.kidLock) return;
  var s=navState();
  if(navCur && navCur.j===s.j) return;
  if(navCur && navDiff(navCur, s)){ NAVH.push(navCur); if(NAVH.length>80) NAVH.shift(); s.y=document.getElementById("view").scrollTop; }
  else if(navCur){ s.y=navCur.y; }
  else s.y=document.getElementById("view").scrollTop;
  navCur=s; navKeep();
}
function navRestore(s){
  var o=s.o; navRest=true;
  try{
    if(view==="solat" && !(o.v==="solat" && o.s2.solat==="kiblat")) N.stopCompass();
    if(N.setVolumeKeys) N.setVolumeKeys(false); if(N.stopSpeak) try{N.stopSpeak();}catch(e){}
    if(window.IlmuView && o.lp!==learnPg) try{ IlmuView.stop(); }catch(e){}
    view=o.v; for(var k in o.s2) SUB2[k]=o.s2[k]; if(o.w) PGW.forEach(function(k2){ window[k2]=o.w[k2]; }); if(o.wr) wrTab=o.wr; sunPage=o.sp; learnPg=o.lp; learnFrom=o.lf; pandL3=o.p3; basicsPg=o.bp||null; basicsFrom=o.bf||null; if(o.sk){ var skp=o.sk.split("|"), skc=sekCfg(); skc.skYear=skp[0]==="true"; if(skp[1]) skc.tahap=skp[1]; if(skp[2]) skc.anak=skp[2]; skc.skUpkk=skp[3]||""; skc.uni=skp[4]||""; save("ihsan_silibus", skc); } if(o.si) sciId=o.si; if(window.SciView && o.lp!=="sci") try{ SciView.stop(); }catch(e){} if(window.ChessView && o.lp!=="chess") try{ ChessView.stop(); }catch(e){} sunTop=o.st; sunCat=o.sc; moreGrp=o.mg; sub.zikir=o.zk; doaCat=o.dc; mathEvening=o.me;
    save("ihsan_view", view==="more"?"home":view); if(view==="sunat") save("ihsan_sunpage", sunPage);
    NAVMOD.forEach(function(x){ var M=window[x[1]]; if(M && M.navSet && o.m[x[0]]) try{ M.navSet(o.m[x[0]]); }catch(e){} });
    render();
  }catch(e){ console.error(e); }
  var vEl=document.getElementById("view"), y=s.y||0; vEl.scrollTop=y; [60,250,600].forEach(function(t){ setTimeout(function(){ if(navCur===s && Math.abs(vEl.scrollTop-y)>4) vEl.scrollTop=y; },t); });
  navRest=false; navCur=s;
}
function navBack(){ if(S.appLock && !S.kidLock) while(NAVH.length && NAVH[NAVH.length-1].o.v==="more") NAVH.pop(); if(!NAVH.length) return false; navRestore(NAVH.pop()); return true; }
document.addEventListener("click", function(){ setTimeout(navTick, 40); }, true);
// 0.5.72 (owner): every in-page ‹ back button goes to the page seen just before (like the phone's Back), except in Sports
document.addEventListener("click", function(e){ var b=e.target.closest && e.target.closest("#lBack,#bsBack,#gpBack,#skBack"); if(!b || S.kidLock) return;
  if(document.getElementById("overlay") && !document.getElementById("overlay").classList.contains("hidden")) return;
  if(window.SportView && SportView.active && SportView.active()) return;
  if(b.id==="lBack" && learnPg==="martial" && window.MartialView && MartialView.back()){ e.stopPropagation(); e.preventDefault(); return; }   // 0.7.42: ‹ on an art goes back to the arts list
  navTick(); if(NAVH.length){ e.stopPropagation(); e.preventDefault(); try{ if(window.IlmuView && b.id==="lBack") IlmuView.stop(); if(window.SciView) SciView.stop(); if(window.ChessView && learnPg==="chess") ChessView.stop(); }catch(er){} navBack(); } }, true);
document.addEventListener("touchend", function(){ setTimeout(navTick, 450); }, {passive:true, capture:true});
document.getElementById("view").addEventListener("scroll", function(){ if(navCur && !navRest) navCur.y=this.scrollTop; }, {passive:true});
var onBack0=window.onBack;
window.onBack=function(){
  var ov=document.getElementById("overlay");
  if(updBlock && document.getElementById("updOv")) return true;   // 0.6.71: a required update stays until done
  if(IBVIEW){ IBVIEW(); return true; }   // 0.6.67 picture viewer
  if(window.EvSeatBack && document.querySelector(".stWrap.full") && EvSeatBack()) return true;   // 0.6.75 seating plan full screen
  if(window.IB3D && IB3D.exitFull()) return true;   // 0.5.98 (owner): Back leaves a full-screen 3D view first, like ✕ (it used to leave the bars hidden)
  if(window.IhsanTour && IhsanTour.back()) return true;
  if(sideOpen){ sideShow(false); return true; }
  if(!ov.classList.contains("hidden")){ if(ov._close) ov._close(); else closeOverlay(); return true; }
  if(document.getElementById("falak") && window.Falak && Falak.back()) return true;
  if(view==="learn" && learnPg==="chess" && window.ChessView && ChessView.back && ChessView.back()) return true;   // 0.6.66 chess guide → setup
  if(view==="learn" && learnPg==="martial" && window.MartialView && MartialView.back()) return true;   // 0.7.42: Back closes the 3D lesson, then the art, then the page
  if(window.SportView && SportView.active && SportView.active() && SportView.back()) return true;   // 0.5.37: Sports pages step back one page at a time
  if(view==="cal" && SUB2.cal==="mesyuarat" && window.MeetView && MeetView.back()) return true;
  if(view==="cal" && SUB2.cal==="trip" && window.TripView && TripView.back()) return true;   // 0.7.20 trip pages step back to the trip list
  if(view==="alat" && SUB2.alat==="nota" && wrTab==="dokumen" && window.DokumenView && DokumenView.back()) return true;
  if(view==="alat" && SUB2.alat==="nota" && wrTab==="tekap" && window.Tekap && Tekap.back()) return true;   // 0.6.63   // 0.6.60   // 0.6.44: a running meeting stays; a meeting page goes back to the list
  if(setOn){ if(moreGrp){ moreGrp=null; setDraw(); } else setShow(false); return true; }
  if(S.kidLock) return onBack0();          // a locked kids mode keeps its own fenced-in back steps
  navTick();
  if(navBack()) return true;
  // 0.2.6: Back only ever returns to the page or tab seen just before. It never jumps up a level, never goes Home
  // on its own and never leaves the app: with nothing earlier in this session it stays put.
  toast(L2x("Tiada halaman sebelum ini","No earlier page"));
  return true;
};

// ---------- 0.33.0 FINGER-FOLLOWING SWIPES ----------
// IbSwipe(el, {can(s), go(s), peek(s), find(), skip()}): the element follows the finger sideways (like the Zikir pages).
// s = +1 when the finger moves right. 0.34.0: with peek(s) (HTML string, or a ready node) the neighbour item rides in
// beside it during the drag, like the Zikir pager, so there is never a blank gap. Let go past a quarter of the width
// (or flick) and the neighbour settles in place; go(s) then draws the real item in the same frame. find() returns the
// new element after go(s) so a tall item keeps its top where the neighbour was.
function IbSwipe(el, o){
  if(!el) return; el._ibo=o; if(el._ibsw) return; el._ibsw=1; el.classList.add("ibsw");
  var sx=0, sy=0, lock=0, dx=0, W=0, t0=0, on2=false, G={}, GAP=14;
  var clear=function(){ el.style.transition=""; el.style.transform=""; el.style.opacity=""; };
  var killG=function(){ for(var k in G){ var g=G[k]; if(g && g.parentNode) g.parentNode.removeChild(g); } G={}; };
  var scroller=function(t){ for(var n=t; n && n!==el && n.nodeType===1; n=n.parentNode){ if(n.scrollWidth>n.clientWidth+4){ var ox=getComputedStyle(n).overflowX; if(ox==="auto"||ox==="scroll") return true; } } return false; };
  var ghost=function(s){ if(G[s]!==undefined) return G[s]; G[s]=null; var O=el._ibo; if(!O.peek || !O.can(s)) return null;
    var c=null; try{ c=O.peek(s); }catch(err){ console.error(err); } if(c==null || c===false) return null;
    var g;
    if(typeof c==="string"){ g=document.createElement(el.tagName); g.className=el.className; var cs=el.getAttribute("style"); if(cs) g.setAttribute("style", cs); g.innerHTML=c; }
    else g=c;
    g.classList.add("ibghost"); g.style.position="absolute"; g.style.top="0px"; g.style.left="0px"; g.style.margin="0"; g.style.boxSizing="border-box"; g.style.width=W+"px";
    g.style.transition="none"; g.style.opacity="1"; g.style.pointerEvents="none"; g.style.zIndex="1";
    el.parentNode.insertBefore(g, el.nextSibling);
    var r=el.getBoundingClientRect(), rg=g.getBoundingClientRect(), vw=document.getElementById("view"), vt=vw?vw.getBoundingClientRect().top:0, top=Math.max(r.top, vt);
    g.style.left=(r.left-dx-rg.left)+"px"; g.style.top=(top-rg.top)+"px"; g._gy=top;
    if(O.fit) try{ O.fit(g); }catch(err){}
    G[s]=g; return g; };
  var place=function(){ var s=dx>0?1:-1, g=ghost(s), o2=G[-s];
    if(o2) o2.style.visibility="hidden";
    el.style.transform="translate3d("+dx+"px,0,0)";
    if(g){ g.style.visibility=""; g.style.transform="translate3d("+(dx-s*(W+GAP))+"px,0,0)"; el.style.opacity=""; }
    else el.style.opacity=String(1-Math.min(0.4, Math.abs(dx)/W*0.5)); };
  el.addEventListener("touchstart", function(e){ var O=el._ibo; killG(); on2=!(e.touches.length>1 || (O.skip && O.skip()) || e.target.closest("input[type=range],.noswipe") || scroller(e.target)); if(!on2) return;
    var t=e.touches[0]; sx=t.clientX; sy=t.clientY; lock=0; dx=0; t0=Date.now(); W=el.offsetWidth||window.innerWidth; el.style.transition="none"; }, {passive:true});
  el.addEventListener("touchmove", function(e){ if(!on2) return; var t=e.touches[0], x=t.clientX-sx, y=t.clientY-sy;
    if(!lock){ if(Math.abs(x)<9 && Math.abs(y)<9) return; lock=Math.abs(x)>Math.abs(y)*1.15?1:-1; if(lock===1){ sx=t.clientX-(x>0?9:-9); x=t.clientX-sx; } }
    if(lock!==1) return; if(e.cancelable) e.preventDefault();
    var s=x>0?1:-1; dx=el._ibo.can(s)?x:x/4; place(); }, {passive:false});
  var end=function(){ if(!on2) return; on2=false; if(lock!==1){ clear(); killG(); return; } var O=el._ibo, s=dx>0?1:-1, fast=Math.abs(dx)>35 && Date.now()-t0<260, g=G[s];
    var tr="transform .2s cubic-bezier(.2,.7,.3,1), opacity .2s";
    el.style.transition=tr; if(g) g.style.transition=tr;
    if((Math.abs(dx)>W*0.25 || fast) && O.can(s)) commit(s, g);
    else { el.style.transform="translate3d(0,0,0)"; el.style.opacity="1"; if(g){ g.style.transform="translate3d("+(-s*(W+GAP))+"px,0,0)"; } setTimeout(function(){ clear(); killG(); }, 210); } };
  var commit=function(s, g){ var O=el._ibo;
      el.style.transform="translate3d("+(s*(W+GAP))+"px,0,0)";
      if(g){ g.style.transform="translate3d(0,0,0)"; } else el.style.opacity="0";
      setTimeout(function(){ var gy=g?g._gy:null; killG(); el._ibIn=0;
        if(g){ IbSwipe._q=1; try{ O.go(s); }catch(err){ console.error(err); } IbSwipe._q=0; el.style.transition="none"; el.style.transform=""; el.style.opacity="";
          var ne=O.find?O.find():el, vw=document.getElementById("view");
          if(ne && vw && gy!=null && document.body.contains(ne)){ var d=ne.getBoundingClientRect().top-gy; if(Math.abs(d)>2) vw.scrollTop+=d; }
          setTimeout(function(){ el.style.transition=""; },30); }
        else { O.go(s); if(document.body.contains(el) && !el._ibIn) IbSwipe.inFrom(el, s); }
        setTimeout(ibArr, 60); setTimeout(ibChips, 30); }, g?235:200); };
  el.addEventListener("touchend", end); el.addEventListener("touchcancel", end);
  // 0.36.0: the ◀ ▶ arrows run the same slide as a finger (s=+1 brings in what is on the left)
  el._ibGo=function(s){ var O=el._ibo; if(el._ibBusy || !O.can(s)) return; el._ibBusy=1; setTimeout(function(){ el._ibBusy=0; },320);
    killG(); W=el.offsetWidth||window.innerWidth; dx=0; var g=ghost(s);
    el.style.transition="none"; if(g){ g.style.transform="translate3d("+(-s*(W+GAP))+"px,0,0)"; void g.offsetWidth; }
    var tr="transform .26s cubic-bezier(.3,.6,.3,1), opacity .26s"; el.style.transition=tr; if(g) g.style.transition=tr; commit(s, g); };
  IbSwipe.list.push(el); clearTimeout(IbSwipe._at); IbSwipe._at=setTimeout(ibArr, 60);
}
IbSwipe.list=[];
// 0.36.0 (Farah): every swipeable screen also gets two small arrows at the bottom left and right.
// They belong to the newest swipeable item on the page (or a pager registered with ibArrPager).
var ibPager=null;
function ibArrPager(p){ ibPager=p; clearTimeout(IbSwipe._at); IbSwipe._at=setTimeout(ibArr, 60); }
function ibArr(){
  var L=document.getElementById("ibArL"), R=document.getElementById("ibArR");
  if(!L){ L=document.createElement("button"); L.id="ibArL"; L.className="ibarr"; L.textContent="◀"; L.setAttribute("aria-label","◀");
    R=document.createElement("button"); R.id="ibArR"; R.className="ibarr"; R.textContent="▶"; R.setAttribute("aria-label","▶");
    document.getElementById("app").appendChild(L); document.getElementById("app").appendChild(R);
    var hit=function(s){ return function(e){ e.preventDefault(); e.stopPropagation(); var t=ibArrTarget(); if(t) t.go(s); setTimeout(ibArr, 380); }; };
    L.onclick=hit(1); R.onclick=hit(-1); }
  var t=ibArrTarget(), ov=document.getElementById("overlay"), hide=!t || (ov && !ov.classList.contains("hidden")) || S.kidLock;
  L.classList.toggle("hidden", hide || !t.can(1)); R.classList.toggle("hidden", hide || !t.can(-1));
  if(hide) return;
  var bars=window.innerHeight; [].slice.call(document.querySelectorAll("#view .dock:not(.dkTop), #subnav, #nav, #mini:not(.hidden)")).forEach(function(x){ if(!x.offsetHeight) return; var r=x.getBoundingClientRect().top; if(r>0 && r<bars) bars=r; });
  var b=(window.innerHeight-bars+8)+"px";
  // 0.7.30 (owner): on an open trip the arrows sit on the same row as its level-3 bar, one each side (trip/trip.css pads that bar)
  var tdk=document.getElementById("app").classList.contains("tpFull") && document.querySelector("#view .dock.tpDock"); if(tdk && tdk.offsetHeight){ var r2=tdk.getBoundingClientRect(); b=(window.innerHeight-r2.bottom+(r2.height-34)/2)+"px"; }
  L.style.bottom=b; R.style.bottom=b;
}
function ibArrTarget(){
  var vw=document.getElementById("view");
  IbSwipe.list=IbSwipe.list.filter(function(e){ return document.body.contains(e); });
  for(var i=IbSwipe.list.length-1;i>=0;i--){ var e=IbSwipe.list[i]; if(vw.contains(e) && !e.closest(".ibghost") && e.offsetParent!==null) return {can:function(s){ return !!e._ibo.can(s); }, go:function(s){ e._ibGo(s); }}; }
  if(ibPager && ibPager.el && document.body.contains(ibPager.el) && ibPager.el.offsetParent!==null) return ibPager;
  // 0.5.36: a page with its own level-4 tabs (Move › Sports › a sport) takes the swipe and the ◀ ▶ arrows before the level-3 bar
  var p4=vw.querySelector("[data-lv4]"); if(p4 && p4._pager && p4.offsetParent!==null) return p4._pager;
  return lv3Pager();
}
// 0.5.20 round 2: every level-3 bar can be swiped (finger left/right on the page) or stepped with ◀ ▶
function lv3Pager(){ var d=document.querySelector("#view .dock.dk3"); if(!d || !d.offsetHeight) return null;
  var bs=[].filter.call(d.querySelectorAll("button"), function(b){ return b.offsetParent!==null && !b.disabled && !b.classList.contains("hidden"); }), i=-1;
  bs.forEach(function(b, k){ if(b.classList.contains("on")) i=k; }); if(i<0 || bs.length<2) return null;
  return {lv3:true, can:function(s){ return s<0 ? i<bs.length-1 : i>0; }, go:function(s){ var b=bs[i+(s<0?1:-1)]; if(b){ b.click(); setTimeout(function(){ var v=document.getElementById("view"); if(v) v.scrollTop=0; ibArr(); }, 30); } }}; }
(function(){ var v=null, x0=0, y0=0, t0=0, tg=null;
  var skip=function(e){ return !e || !e.closest || e.closest("input,textarea,select,canvas,svg,iframe,video,.dock,.chips,.hpager,.ibpg,.wgrid.editing,.noswipe,[contenteditable],.leaflet-container,.ibddl,.sheet") ||
    IbSwipe.list.some(function(x){ return x.contains(e); }); };
  var hasX=function(e){ for(var n=e; n && n.id!=="view"; n=n.parentNode){ if(n.scrollWidth>n.clientWidth+4){ var o=getComputedStyle(n).overflowX; if(o==="auto"||o==="scroll") return true; } } return false; };
  document.addEventListener("touchstart", function(e){ v=document.getElementById("view"); if(!v || !v.contains(e.target) || e.touches.length!==1){ tg=null; return; } tg=e.target; x0=e.touches[0].clientX; y0=e.touches[0].clientY; t0=Date.now(); }, {passive:true});
  document.addEventListener("touchend", function(e){ if(!tg) return; var t=e.changedTouches[0], dx=t.clientX-x0, dy=t.clientY-y0, el=tg; tg=null;
    if(Math.abs(dx)<70 || Math.abs(dy)>Math.abs(dx)*0.5 || Date.now()-t0>700 || barsOff) return;
    if(skip(el) || hasX(el)) return; var p=ibArrTarget(); if(!p || !p.lv3) return; var s=dx<0?-1:1; if(p.can(s)) p.go(s); }, {passive:true}); })();
window.ibArr=ibArr;
// The new item enters from the side opposite to the finger's motion, finishing the same movement.
// (Skipped while a swipe with a neighbour preview is finishing: that item is already in place.)
IbSwipe.inFrom=function(el, s){ if(!el || !s || IbSwipe._q) return; el._ibIn=1; var W=el.offsetWidth||window.innerWidth;
  el.style.transition="none"; el.style.transform="translate3d("+(-s*W*0.85)+"px,0,0)"; el.style.opacity="0.3"; void el.offsetWidth;
  el.style.transition="transform .24s cubic-bezier(.2,.7,.3,1), opacity .24s"; el.style.transform="translate3d(0,0,0)"; el.style.opacity="1";
  setTimeout(function(){ el.style.transition=""; el.style.transform=""; el.style.opacity=""; }, 260); };
// Render a view into a detached box (for a neighbour preview): state changes made by mut() are undone by undo() afterwards.
IbSwipe.shot=function(mut, draw, undo){ var box=document.createElement("div"); try{ mut(); draw(box); }catch(err){ console.error(err); box=null; } try{ undo(); }catch(e){} return box; };
// Wrap a page's content (everything except its fixed bottom dock) so it can slide as one piece.
function ibWrap(el){ var w=document.createElement("div"); w.className="ibpg";
  [].slice.call(el.childNodes).forEach(function(c){ if(c.nodeType===1 && (c.classList.contains("dock") || getComputedStyle(c).position==="fixed")) return; w.appendChild(c); });
  el.insertBefore(w, el.firstChild);
  // 0.34.1: a short page still fills the screen, so a swipe on the empty part below it works too
  var fill=function(){ var vw=document.getElementById("view"); if(!vw || !document.body.contains(w)) return;
    var vr=vw.getBoundingClientRect(), top=w.getBoundingClientRect().top-vr.top+vw.scrollTop, bars=window.innerHeight;
    [].slice.call(document.querySelectorAll("#view .dock, #subnav, #nav")).forEach(function(x){ var t=x.getBoundingClientRect().top; if(t>0 && t<bars) bars=t; });
    var h=Math.round(bars-vr.top-top-6); if(h>0) w.style.minHeight=h+"px"; };
  if(document.body.contains(w)){ setTimeout(fill, 90); } return w; }
window.ibWrap=ibWrap;
window.IbSwipe=IbSwipe;
if(S.kidLock){ learnPg=null; if(S.lockTo==="school"){ view="learn"; SUB2.learn="sekolah"; } else view="kids"; }
// 0.5.23 Android TV / TV box: open on Display (masjid TV); larger focus rings for the remote's D-pad
var IS_TV=false; try{ IS_TV=!!(window.Native && N.isTv && N.isTv()); }catch(e){}
if(IS_TV){ document.documentElement.classList.add("tv"); if(!S.kidLock && S.tvHome!==false){ SUB2.alat="paparan"; view="alat"; } }
barSizeApply(S.barSize||0);
applyZoom(); pushHadith(); pushDoa(); mqPush();
if(!navResume()) render();
document.addEventListener("visibilitychange", function(){ if(document.hidden){ navTick(); navKeep(); } }); window.addEventListener("pagehide", function(){ navTick(); navKeep(); }); on("pause", function(){ navTick(); navKeep(); });
pushSchedule();
ensureData(false);
// 0.5.48 Care: open straight into elder mode (big buttons) when the family set it on this phone
(function(){ var CR=load("ihsan_care",null); if(!CR || !CR.elder || !(CR.ppl||[]).length || S.kidLock) return;
  loadJs(["finance/finance.js","family/family.js","family/names.js","family/baby.js","family/events.js","family/seating.js","family/evshare.js","family/care.js"], function(){ var show=function(){ try{ if(window.CareView && !document.getElementById("crElder")){ FamView.data(famH()); CareView.elder(famH()); } }catch(e){ console.error(e); } }; show(); setTimeout(show, 1500); setTimeout(show, 3500); }); })();   // 0.7.76: the first page render (e.g. Life › Care) can replace it, so check again
if(S.zoneAuto && N.hasPerm("location")) askLocation(false);
// 0.5.20 (review 18): finance.js and family.js are no longer loaded at start (about 110 KB). Their pages load them on first
// open; reminders and Home widgets that need them (commitments, birthdays) load them a moment after start, only when that data exists.
setTimeout(function(){ var need=[], F=load("ihsan_fin",null)||{}, FM=load("ihsan_family",null)||{};
  if((F.com||[]).length && !window.FinNextDue) need.push("finance/finance.js");
  if((FM.p||[]).some(function(p){ return p.b && !p.dd; }) && !window.FamView) need.push("finance/finance.js","family/family.js");
  // 0.5.23 currency rate alerts: checked at start and every 3 hours while the app is open
  var FXa=(load("ihsan_fx",null)||{}).alerts; if(FXa && FXa.length){ var fxc=function(){ var go3=function(){ try{ FxView.alerts(finH2()); }catch(e){} }; if(window.FxView) go3(); else loadJs(["finance/fx.js"], go3, function(){}); }; fxc(); setInterval(fxc, 3*3600e3); }
  if(need.length) loadJs(need, function(){ pushSchedule(); if(view===homeV() && document.getElementById("overlay").classList.contains("hidden")) render(); }, function(){}); }, 1500);
// ---------- 0.7.17 (owner) 🔔 notification centre: every update shared by someone else (shared Majlis, split bills, groups, business)
// lands here; the phone notification can hide its details ("auto-hide") so the full list is only inside the app. Swipe right =
// archive, left = delete. Data: ihsan_inbox {list:[{id,src,title,body,at,go,read,arch}], set:{on:{event,split,biz,groups}, hide}}.
var NOTE_SRC=[["event","🎊","Majlis dikongsi","Shared events"],["split","🧾","Bahagi bil","Split bills"],["biz","📑","Perniagaan (Google Sheet dikongsi)","Business (shared Google Sheet)"],["groups","👥","Kumpulan","Groups"]];
function noteDb(){ var d=load("ihsan_inbox",null)||{}; d.list=d.list||[]; d.set=d.set||{}; d.set.on=d.set.on||{}; NOTE_SRC.forEach(function(x){ if(d.set.on[x[0]]==null) d.set.on[x[0]]=1; }); return d; }
function noteSave(d){ save("ihsan_inbox", d); notePaint(); }
function noteNative(){ try{ if(window.Native && N.setInboxCfg) N.setInboxCfg(JSON.stringify(noteDb().set)); }catch(e){} notePull(); }
function notePull(){ try{ if(!(window.Native && N.inboxPull)) return; var a=JSON.parse(N.inboxPull()||"[]"); if(!a.length) return; var d=noteDb(); a.forEach(function(n){ d.list.unshift({id:"n"+Date.now().toString(36)+Math.random().toString(36).slice(2,5), src:n.src, title:n.title, body:n.body, go:n.go, at:n.at||Date.now()}); }); noteSave(d); }catch(e){} }
function notePaint(){ var b=document.getElementById("hBell"); if(!b) return; var n=noteDb().list.filter(function(x){ return !x.read && !x.arch; }).length, i=b.querySelector(".hbN"); if(i){ i.textContent=n>99?"99+":n; i.classList.toggle("hidden", !n); } }
window.IbNote={add:function(n){ if(!n || !n.src) return; var d=noteDb(); if(!d.set.on[n.src]) return;
    var dup=d.list.filter(function(x){ return x.src===n.src && x.title===n.title && x.body===n.body && Date.now()-x.at<60000; })[0]; if(dup) return;
    d.list.unshift({id:"n"+Date.now().toString(36)+Math.random().toString(36).slice(2,5), src:n.src, title:String(n.title||"").slice(0,80), body:String(n.body||"").slice(0,240), go:n.go||"", at:Date.now()});
    var keep=d.list.filter(function(x){ return !x.arch; }).slice(0,300).concat(d.list.filter(function(x){ return x.arch; }).slice(0,200)); d.list=keep.sort(function(a,b){ return b.at-a.at; }); noteSave(d);
    if(n.quiet) return; if(document.hidden){ try{ if(window.Native && N.notifyUpdate) N.notifyUpdate(JSON.stringify({src:n.src, title:n.title, body:n.body, go:n.go})); }catch(e){} }
    else toast("🔔 "+n.title+(n.body?" · "+n.body:"")); },
  open:function(){ noteOpen(); }, count:function(){ return noteDb().list.filter(function(x){ return !x.read && !x.arch; }).length; }};
document.addEventListener("visibilitychange", function(){ if(!document.hidden) notePull(); });
function noteAgo(t){ var s=Math.round((Date.now()-t)/1000); if(s<60) return L2x("baru","now"); if(s<3600) return Math.floor(s/60)+L2x(" min"," min"); if(s<86400) return Math.floor(s/3600)+L2x(" jam"," h"); return new Date(t).toLocaleDateString(ibLoc(en_()), {day:"numeric", month:"short"}); }
var NOTE_TAB="in";
function noteOpen(){ notePull(); var ov=showSheet("🔔 "+L2x("Pemberitahuan","Notifications"), '<div id="ntBody"></div>'); var box=ov.querySelector("#ntBody");
  var paint=function(){ var d=noteDb(), arch=NOTE_TAB==="arch", L=d.list.filter(function(x){ return !!x.arch===arch; }), ic=function(s){ return (NOTE_SRC.filter(function(x){ return x[0]===s; })[0]||["","🔔"])[1]; };
    box.innerHTML='<div class="rseg ntTabs"><button class="chip'+(arch?'':' on')+'" data-nt="in">📥 '+L2x("Peti masuk","Inbox")+' <b>'+d.list.filter(function(x){ return !x.arch; }).length+'</b></button><button class="chip'+(arch?' on':'')+'" data-nt="arch">🗄 '+L2x("Arkib","Archive")+' <b>'+d.list.filter(function(x){ return x.arch; }).length+'</b></button></div>'+
      (L.length?'<div class="mut tiny ntHint">'+L2x("Leret ke kanan untuk arkib, ke kiri untuk padam. Ketik untuk buka.","Swipe right to archive, left to delete. Tap to open.")+'</div>'+L.map(function(x){ return '<div class="ntRow'+(x.read?'':' unread')+'" data-nid="'+x.id+'"><div class="ntBgA">'+(arch?'📥 '+L2x("Pulihkan","Restore"):'🗄 '+L2x("Arkib","Archive"))+'</div><div class="ntBgD">🗑 '+L2x("Padam","Delete")+'</div><div class="ntFg"><span class="ntTx"><b>'+esc(x.title)+'</b><small>'+esc(x.body)+'</small></span><span class="ntAt">'+noteAgo(x.at)+'</span></div></div>'; }).join(""):'<div class="mut small" style="padding:14px 4px">'+(arch?L2x("Tiada yang diarkib.","Nothing archived."):L2x("Tiada pemberitahuan. Kemas kini daripada majlis dikongsi, bahagi bil, kumpulan dan perniagaan akan muncul di sini.","No notifications. Updates from shared events, split bills, groups and business show here."))+'</div>')+
      (L.length?'<div class="btns" style="margin-top:8px">'+(arch?'':'<button class="btn alt g3d" id="ntRead">✓ '+L2x("Tanda semua dibaca","Mark all read")+'</button><button class="btn alt g3d" id="ntArchAll">🗄 '+L2x("Arkib semua","Archive all")+'</button>')+'<button class="btn delb" id="ntClr">🗑 '+L2x("Padam semua","Delete all")+'</button></div>':'')+
      '<details class="card ntSet"'+(d.list.length?'':' open')+'><summary><b>⚙ '+L2x("Tetapan pemberitahuan","Notification settings")+'</b></summary><div class="mut tiny">'+L2x("Beritahu saya bila orang lain mengemas kini:","Tell me when someone else updates:")+'</div>'+
        NOTE_SRC.map(function(x){ return '<label class="obChk"><input type="checkbox" data-ns="'+x[0]+'"'+(d.set.on[x[0]]?' checked':'')+'> '+x[1]+' '+L2x(x[2],x[3])+'</label>'; }).join("")+
        '<label class="obChk"><input type="checkbox" id="ntHide"'+(d.set.hide?' checked':'')+'> 🙈 '+L2x("Sembunyikan butiran pada pemberitahuan telefon (senarai penuh hanya dalam aplikasi)","Hide details on the phone's notification (the full list is only in the app)")+'</label></details>';
    box.querySelectorAll("[data-nt]").forEach(function(b){ b.onclick=function(){ NOTE_TAB=b.getAttribute("data-nt"); paint(); }; });
    var act=function(id, kind){ var d2=noteDb(); if(kind==="del") d2.list=d2.list.filter(function(x){ return x.id!==id; }); else d2.list.forEach(function(x){ if(x.id===id){ x.arch=kind==="arch"; x.read=true; } }); noteSave(d2); };
    box.querySelectorAll(".ntRow").forEach(function(r){ var fg=r.querySelector(".ntFg"), id=r.getAttribute("data-nid"), x0=null, dx=0, moved=false;
      fg.addEventListener("pointerdown", function(ev){ x0=ev.clientX; dx=0; moved=false; try{ fg.setPointerCapture(ev.pointerId); }catch(e){} });
      fg.addEventListener("pointermove", function(ev){ if(x0==null) return; dx=ev.clientX-x0; if(Math.abs(dx)>8){ moved=true; fg.style.transform="translateX("+dx+"px)"; r.classList.toggle("toA", dx>0); r.classList.toggle("toD", dx<0); } });
      var end=function(){ if(x0==null) return; x0=null; var w=r.offsetWidth*0.3;
        if(dx>w){ fg.style.transform="translateX(110%)"; setTimeout(function(){ act(id, arch?"in":"arch"); paint(); }, 160); }
        else if(dx<-w){ fg.style.transform="translateX(-110%)"; setTimeout(function(){ act(id, "del"); paint(); }, 160); }
        else { fg.style.transform=""; r.classList.remove("toA","toD");
          if(!moved){ var d3=noteDb(), it=d3.list.filter(function(x){ return x.id===id; })[0]; if(it){ it.read=true; noteSave(d3); if(it.go){ closeOverlay(); var v=it.go; if(v.indexOf("side:")===0){ var sn=sideFind(v.slice(5)); if(sn && sn.f) sn.f(); } else go(v); } else paint(); } } } };
      fg.addEventListener("pointerup", end); fg.addEventListener("pointercancel", end); });
    var q=function(s){ return box.querySelector(s); };
    if(q("#ntRead")) q("#ntRead").onclick=function(){ var d2=noteDb(); d2.list.forEach(function(x){ x.read=true; }); noteSave(d2); paint(); };
    if(q("#ntArchAll")) q("#ntArchAll").onclick=function(){ var d2=noteDb(); d2.list.forEach(function(x){ x.arch=true; x.read=true; }); noteSave(d2); paint(); };
    if(q("#ntClr")) q("#ntClr").onclick=function(){ if(!confirm(L2x("Padam semua dalam senarai ini?","Delete everything in this list?"))) return; var d2=noteDb(); d2.list=d2.list.filter(function(x){ return !!x.arch!==arch; }); noteSave(d2); paint(); };
    box.querySelectorAll("[data-ns]").forEach(function(c){ c.onchange=function(){ var d2=noteDb(); d2.set.on[c.getAttribute("data-ns")]=c.checked?1:0; noteSave(d2); noteNative(); }; });
    q("#ntHide").onchange=function(){ var d2=noteDb(); d2.set.hide=q("#ntHide").checked; noteSave(d2); noteNative(); }; };
  paint(); }
// 0.7.13 walkie-talkie link (web app): …/app/#wt=CODE opens Meeting › 📻 Walkie with the join sheet filled in
(function(){ var m=/[#&]wt=([A-Za-z0-9-]{8,9})/.exec(location.hash||""); if(!m) return; setTimeout(function(){ try{ history.replaceState(null,"",location.pathname+location.search); }catch(e){} window.__meetPg="wt"; window.__wtLink=m[1]; SUB2.cal="mesyuarat"; go("cal"); }, 1200); })();
})();
