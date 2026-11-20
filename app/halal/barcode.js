/* My Ihsan 0.11.0: barcode scan for the Halal tab.
   The camera reads EAN/UPC barcodes on the phone (BarcodeDetector when the WebView has it, else the bundled
   open-source ZXing reader). Only the barcode number is sent online, to Open Food Facts, to fetch the
   product's ingredient list, which the existing halal checker then reads. */
(function(){
"use strict";
var H=null;
function L2(ms,en){ return H.L2x(ms,en); }

// EAN-8, UPC-A (12), EAN-13 and GTIN-14 check digit
function validCode(c){
  if(!/^(\d{8}|\d{12,14})$/.test(c)) return false;
  var d=c.split("").map(Number), chk=d.pop(), s=0;
  d.reverse().forEach(function(x,i){ s+=x*(i%2===0?3:1); });
  return (10-s%10)%10===chk;
}
function loadZx(cb){
  if(window.ZXing) return cb(true);
  var s=document.createElement("script"); s.src="halal/zxing.min.js";
  s.onload=function(){ cb(!!window.ZXing); }; s.onerror=function(){ cb(false); }; document.body.appendChild(s);
}
function zxReader(){
  var Z=window.ZXing, hints=new Map();
  hints.set(Z.DecodeHintType.POSSIBLE_FORMATS,[Z.BarcodeFormat.EAN_13,Z.BarcodeFormat.EAN_8,Z.BarcodeFormat.UPC_A,Z.BarcodeFormat.UPC_E]);
  hints.set(Z.DecodeHintType.TRY_HARDER,true);
  var r=new Z.MultiFormatReader(); r.setHints(hints); return r;
}

// Full-screen camera scanner. done(code) gets a checked barcode number; cancelled scans call nothing.
function scan(helpers, done){
  H=helpers; var N=H.N;
  if(!N.hasPerm("camera")){
    var ph=function(r){ if(r.which!=="camera") return; H.off("perm",ph); if(r.granted) scan(helpers, done); else H.toast(L2("Perlu kebenaran kamera untuk imbas kod bar","Camera permission is needed to scan barcodes")); };
    H.on("perm",ph); N.requestPerm("camera"); return;
  }
  var ov=document.getElementById("overlay"), stream=null, closed=false, timer=null, det=null, zx=null, busy=false, torch=false, track=null;
  var cv=document.createElement("canvas"), ctx=cv.getContext("2d", {willReadFrequently:true});
  ov.className="bcov";
  ov.innerHTML='<video id="bcV" autoplay muted playsinline></video>'+
    '<div class="bcTop"><button class="qcX" id="bcX" aria-label="'+L2("Tutup","Close")+'">✕</button><b>'+L2("Imbas kod bar","Scan barcode")+'</b><button class="qcX" id="bcT" aria-label="'+L2("Lampu suluh","Torch")+'" style="visibility:hidden">🔦</button></div>'+
    '<div class="bcBox"><i></i></div>'+
    '<div class="bcBot"><div class="bcStat" id="bcS">'+L2("Menyediakan kamera…","Starting the camera…")+'</div>'+
    '<div class="bcTip">'+L2("Letakkan kod bar dalam kotak, mendatar. Jauhkan sedikit jika kabur.","Fit the barcode inside the box, lying flat. Move back a little if it is blurry.")+'</div>'+
    '<button class="btn alt full" id="bcM">⌨️ '+L2("Taip nombor kod bar","Type the barcode number")+'</button>'+
    '<div class="bcIn" id="bcI" style="display:none"><input id="bcN" type="text" inputmode="numeric" maxlength="14" placeholder="9551234567890" autocomplete="off"><button class="btn gold" id="bcGo">'+L2("Semak","Check")+'</button></div></div>';
  var V=ov.querySelector("#bcV"), ST=ov.querySelector("#bcS"), TB=ov.querySelector("#bcT");
  var stop=function(){ clearInterval(timer); timer=null; if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream=null; } track=null; V.srcObject=null; };
  var close=function(){ if(closed) return; closed=true; stop(); H.off("pause",onP); H.off("resume",onR); H.closeOverlay(); };
  var got=function(code){ if(closed) return; N.vibrate(120); close(); done(code); };
  var frame=function(){
    if(busy || !V.videoWidth) return;
    // read the middle band of the picture, where the guide box is
    var vw=V.videoWidth, vh=V.videoHeight, cw=Math.round(vw*0.9), ch=Math.round(vh*0.5);
    var sc=Math.min(1, 1000/cw); cv.width=Math.round(cw*sc); cv.height=Math.round(ch*sc);
    ctx.drawImage(V, (vw-cw)/2, (vh-ch)/2, cw, ch, 0, 0, cv.width, cv.height);
    if(det){ busy=true; det.detect(cv).then(function(r){ busy=false; for(var i=0;i<r.length;i++){ var c=String(r[i].rawValue||"").trim(); if(validCode(c)){ got(c); return; } } }, function(){ busy=false; }); return; }
    if(zx){ try{ var bmp=new window.ZXing.BinaryBitmap(new window.ZXing.HybridBinarizer(new window.ZXing.HTMLCanvasElementLuminanceSource(cv))); var res=zx.decodeWithState(bmp), c=String(res.getText()).trim(); if(validCode(c)) got(c); }catch(e){} }
  };
  var start=function(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ fail(); return; }
    navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}, width:{ideal:1280}, height:{ideal:720}}, audio:false}).then(function(s){
      if(closed){ s.getTracks().forEach(function(t){ t.stop(); }); return; }
      stream=s; V.srcObject=s; var pl=V.play(); if(pl&&pl.catch) pl.catch(function(){});
      track=s.getVideoTracks()[0];
      try{ var cap=track.getCapabilities&&track.getCapabilities(); if(cap && cap.torch){ TB.style.visibility=""; } }catch(e){}
      try{ track.applyConstraints({advanced:[{focusMode:"continuous"}]}).catch(function(){}); }catch(e){}
      ST.textContent=L2("Mencari kod bar…","Looking for a barcode…");
      clearInterval(timer); timer=setInterval(frame, 220);
    }, fail);
  };
  var fail=function(){ ov.classList.add("nocam"); ST.textContent=L2("Kamera tidak dapat dibuka. Taip nombor di bawah kod bar.","The camera could not open. Type the number under the barcode."); };
  var onP=function(){ stop(); }, onR=function(){ if(!closed) start(); };
  ov.querySelector("#bcX").onclick=close; ov._close=close;
  TB.onclick=function(){ if(!track) return; torch=!torch; try{ track.applyConstraints({advanced:[{torch:torch}]}).catch(function(){}); }catch(e){} TB.classList.toggle("on",torch); };
  var IN=ov.querySelector("#bcN");
  ov.querySelector("#bcM").onclick=function(){ this.style.display="none"; ov.querySelector("#bcI").style.display=""; IN.focus(); };
  var manual=function(){ var v=IN.value.replace(/\D/g,"");
    if(!validCode(v)){ H.toast(L2("Nombor kod bar tidak sah. Semak semula digit.","That barcode number is not valid. Check the digits.")); return; }
    got(v); };
  ov.querySelector("#bcGo").onclick=manual;
  IN.onkeydown=function(e){ if(e.key==="Enter") manual(); };
  H.on("pause",onP); H.on("resume",onR);
  // Prefer the phone's own detector; fall back to ZXing
  var useZx=function(){ loadZx(function(ok){ if(closed) return; if(ok){ try{ zx=zxReader(); }catch(e){ zx=null; } } if(!zx && !det) ST.textContent=L2("Pembaca kod bar gagal dimuatkan. Taip nombor di bawah.","The barcode reader could not load. Type the number below."); }); };
  if(window.BarcodeDetector && BarcodeDetector.getSupportedFormats){
    BarcodeDetector.getSupportedFormats().then(function(f){ if(f.indexOf("ean_13")>=0){ try{ det=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e"]}); }catch(e){ det=null; } } if(!det) useZx(); }, useZx);
  } else useZx();
  start();
}

// Look a barcode up in Open Food Facts. cb({found, name, brand, ingr, halal, img, code}) or cb({error:"net"})
function lookup(helpers, code, cb){
  H=helpers;
  var url="https://world.openfoodfacts.org/api/v2/product/"+encodeURIComponent(code)+".json?fields=code,product_name,product_name_ms,product_name_en,brands,ingredients_text,ingredients_text_ms,ingredients_text_en,labels_tags,image_front_small_url";
  H.fetch(url, function(status, body){
    var j=null; try{ j=JSON.parse(body); }catch(e){}
    if(!j){ cb({error:"net", code:code}); return; }
    var p=j.product;
    if(j.status!==1 || !p){ cb({found:false, code:code}); return; }
    var ingr=String(p.ingredients_text_en||p.ingredients_text_ms||p.ingredients_text||"").replace(/_/g,"").trim();
    var labels=(p.labels_tags||[]).join(" ");
    cb({found:true, code:code, name:String(p.product_name_ms||p.product_name_en||p.product_name||"").trim(), brand:String(p.brands||"").split(",")[0].trim(),
      ingr:ingr, halal:/(^|\s)(en:halal|ms:halal)/.test(labels), img:/^https:\/\//.test(p.image_front_small_url||"")?p.image_front_small_url:""});
  });
}

window.HalalBarcode={ scan:scan, lookup:lookup, valid:validCode };
})();
