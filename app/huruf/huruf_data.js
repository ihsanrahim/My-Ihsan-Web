/* My Ihsan · Gerak Huruf (Letter Moves): letter sets, body poses, handshapes and tracing strokes.
   Everything is drawn from these numbers in code: no images.

   Body poses: [LUA, LFA, RUA, RFA, LTH, LSH, RTH, RSH] in degrees on screen (0 = right, 90 = up, -90 = down).
   L/R are the sides of the screen. The camera view is mirrored like a mirror, so the child's own left arm is on the left.
   UA upper arm, FA forearm, TH thigh, SH shin. The poses are simple, modest and classroom-friendly.

   Handshapes (one hand) follow the BIM fingerspelling alphabet (Bahasa Isyarat Malaysia, which uses the one-hand ASL-based alphabet).
   Two-hand letters follow the two-handed BSL (UK) alphabet and are labelled "not BIM" in the app. Only the letters below are included;
   the others wait for a sign-language teacher's review (the same rule as the ustaz review for religious text).
   Hijaiyah/Jawi hand signs are not included until a qualified teacher provides and checks them.

   Tracing strokes: points in a 100 × 100 box (x right, y down), in stroke order and direction.
   Hijaiyah and Jawi strokes run right to left. sm:1 = smooth curve through the points. */
(function(){
"use strict";
var A={
 down:[-100,-95,-80,-85], up:[78,95,102,85], upPar:[95,92,85,88], diagUp:[135,135,45,45], T:[180,180,0,0], goal:[180,90,0,90],
 bowl:[-165,100,-15,80], circle:[115,15,65,165], W:[-150,105,-30,75], vLow:[-60,-60,-120,-120], mHead:[140,-40,40,-140], S:[-110,-25,100,165] };
var Lg={ T:[-93,-92,-87,-88], W:[-112,-110,-68,-70], Rout:[-93,-92,-40,-35], Rdiag:[-93,-92,-50,-50], Rknee:[-93,-92,-40,-150] };
function P(l, r, legs){ return [l[0],l[1],r[0],r[1]].concat(legs||Lg.T); }
function arms(a, legs){ return a.concat(legs||Lg.T); }
var L={ down:[-100,-95], up:[90,90], hip:[-145,-35], head:[145,30] }, R={ down:[-80,-85], up:[88,90], hip:[-35,-145], head:[35,150], side:[0,0] };

// [key, glyph, Malay name, TTS text, TTS lang, body pose, dots]   dots: "a1" one above, "b2" two below, "m1" one in the middle
var HIJ=[
 ["alif","ا","alif","أَلِف","ar",arms(A.up)],
 ["ba","ب","ba","بَاء","ar",arms(A.bowl),"b1"],
 ["ta","ت","ta","تَاء","ar",arms(A.bowl),"a2"],
 ["tsa","ث","tsa","ثَاء","ar",arms(A.bowl),"a3"],
 ["jim","ج","jim","جِيم","ar",P([-150,-30],[20,0]),"m1"],
 ["ha","ح","ha","حَاء","ar",P([-150,-30],[20,0])],
 ["kho","خ","kho","خَاء","ar",P([-150,-30],[20,0]),"a1"],
 ["dal","د","dal","دَال","ar",P([180,180],R.down)],
 ["dzal","ذ","dzal","ذَال","ar",P([180,180],R.down),"a1"],
 ["ro","ر","ro","رَاء","ar",P([-140,-140],[-130,-160])],
 ["zai","ز","zai","زَاي","ar",P([-140,-140],[-130,-160]),"a1"],
 ["sin","س","sin","سِين","ar",arms(A.goal)],
 ["syin","ش","syin","شِين","ar",arms(A.goal),"a3"],
 ["sod","ص","sod","صَاد","ar",P([-165,120],R.head)],
 ["dhod","ض","dhod","ضَاد","ar",P([-165,120],R.head),"a1"],
 ["tho","ط","tho","طَاء","ar",P(L.up,R.hip)],
 ["zho","ظ","zho","ظَاء","ar",P(L.up,R.hip),"a1"],
 ["ain","ع","'ain","عَيْن","ar",P([-120,-40],[60,160])],
 ["ghain","غ","ghain","غَيْن","ar",P([-120,-40],[60,160]),"a1"],
 ["fa","ف","fa","فَاء","ar",P([180,180],R.head),"a1"],
 ["qof","ق","qof","قَاف","ar",P([-120,-120],R.head),"a2"],
 ["kaf","ك","kaf","كَاف","ar",P([-170,-170],R.up)],
 ["lam","ل","lam","لَام","ar",P([-160,115],R.up)],
 ["mim","م","mim","مِيم","ar",arms(A.mHead)],
 ["nun","ن","nun","نُون","ar",P([-140,100],[-40,80]),"a1"],
 ["wau","و","wau","وَاو","ar",P([-140,-140],R.head)],
 ["haa","ه","ha","هَاء","ar",arms(A.circle)],
 ["lamalif","لا","lam alif","لَام أَلِف","ar",P([120,120],[60,60])],
 ["hamzah","ء","hamzah","هَمْزَة","ar",P(L.hip,R.hip)],
 ["ya","ي","ya","يَاء","ar",P([-170,110],[60,150]),"b2"]];
// Jawi letter names as taught in Malaysian schools (DBP order); spoken in Malay
var JMS={alif:"alif",ba:"ba",ta:"ta",tsa:"sa",jim:"jim",ha:"ha",kho:"kha",dal:"dal",dzal:"zal",ro:"ra",zai:"zai",sin:"sin",syin:"syin",sod:"sad",dhod:"dad",tho:"ta",zho:"za",ain:"ain",ghain:"ghain",fa:"fa",qof:"qaf",kaf:"kaf",lam:"lam",mim:"mim",nun:"nun",wau:"wau",haa:"ha",hamzah:"hamzah",ya:"ya"};
function hj(k){ return HIJ.filter(function(x){ return x[0]===k; })[0]; }
var JAWI_EXTRA={
 ca:["ca","چ","ca","ca","ms",hj("jim")[5],"m3"], nga:["nga","ڠ","nga","nga","ms",hj("ain")[5],"a3"], pa:["pa","ڤ","pa","pa","ms",hj("fa")[5],"a3"],
 ga:["ga","ݢ","ga","ga","ms",hj("kaf")[5],"a1"], nya:["nya","ڽ","nya","nya","ms",hj("nun")[5],"a3"], va:["va","ۏ","va","va","ms",hj("wau")[5],"a1"] };
var JORDER=["alif","ba","ta","tsa","jim","ca","ha","kho","dal","dzal","ro","zai","sin","syin","sod","dhod","tho","zho","ain","ghain","nga","fa","pa","qof","kaf","ga","lam","mim","nun","wau","va","haa","hamzah","ya","nya"];
var JAWI=JORDER.map(function(k){ if(JAWI_EXTRA[k]) return JAWI_EXTRA[k]; var h=hj(k); return [h[0],h[1],JMS[k],JMS[k],"ms",h[5],h[6]]; });

var RUMI_NAMES={A:"a",B:"bi",C:"si",D:"di",E:"i",F:"ef",G:"ji",H:"eic",I:"ai",J:"je",K:"ke",L:"el",M:"em",N:"en",O:"o",P:"pi",Q:"kiu",R:"ar",S:"es",T:"ti",U:"yu",V:"vi",W:"dabliu",X:"eks",Y:"wai",Z:"zed"};
var RB={
 A:[72,72,108,108].concat(Lg.W), B:P(L.down,R.head,Lg.Rknee), C:P(L.down,[30,0],Lg.Rout), D:P(L.down,R.hip), E:P(L.down,R.side,Lg.Rout), F:P(L.down,R.side),
 G:P(L.hip,[30,0],Lg.Rout), H:arms(A.upPar,Lg.W), I:arms(A.up), J:P([-95,135],R.up), K:P(L.up,[45,45],Lg.Rdiag), L:P(L.up,[-20,-20]),
 M:arms(A.mHead,Lg.W), N:P(L.up,[-60,-60]), O:arms(A.circle), P:P(L.down,R.head), Q:arms(A.circle,Lg.Rdiag), R:P(L.down,R.head,Lg.Rdiag),
 S:arms(A.S), T:arms(A.T), U:arms(A.upPar), V:arms(A.vLow), W:arms(A.W,Lg.W), X:arms(A.diagUp,Lg.W), Y:arms(A.diagUp), Z:P([-135,-135],R.side) };
var RUMI="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(function(c){ return [c,c,c,RUMI_NAMES[c],"ms",RB[c]]; });

/* One-hand BIM handshapes.
   m: index, middle, ring, little finger: E extended, C curled into the palm, M in between (bent, hooked or curved), ! not extended, . any
   t: thumb: O out, S beside / between, X across or under, T touching the index tip, . any
   sp: 1 apart, 0 together · cr: index crossed over middle · o: u fingers up, s sideways, d down · mv: J or Z (draw the letter in the air)
   d: drawing preset for each finger (e straight, E spread, c curled, h hooked, b bent, v C-curve, o curved to the thumb, k/K crossed)
   th: thumb drawing preset (out, side, across, tipI, tipM, under, over, betw, curve, g) */
var HAND1={
 A:{m:"CCCC",t:"S",o:"u",d:"cccc",th:"side"},          B:{m:"EEEE",t:"X",sp:0,o:"u",d:"eeee",th:"across"},
 C:{m:"MMMM",t:".",o:"u",d:"vvvv",th:"curve"},          D:{m:"E!!!",t:".",o:"u",d:"eooo",th:"tipM"},
 E:{m:"!!!!",t:"X",o:"u",d:"bbbb",th:"under"},          F:{m:"!EEE",t:"T",sp:1,o:"u",d:"oEEE",th:"tipI"},
 G:{m:"ECCC",t:".",o:"s",d:"eccc",th:"g"},              H:{m:"EECC",t:".",sp:0,o:"s",d:"eecc",th:"across"},
 I:{m:"CCCE",t:".",o:"u",d:"ccce",th:"over"},           J:{m:"CCCE",t:".",o:".",d:"ccce",th:"over",mv:"J"},
 K:{m:"EECC",t:"S",sp:1,o:"u",d:"EEcc",th:"betw"},      L:{m:"ECCC",t:"O",o:"u",d:"eccc",th:"out"},
 M:{m:"CCCC",t:"X",o:"u",d:"cccc",th:"under"},          N:{m:"CCCC",t:"X",o:"u",d:"cccc",th:"under"},
 O:{m:"!!!!",t:"T",o:"u",d:"oooo",th:"tipI"},           P:{m:"EECC",t:"S",sp:1,o:"d",d:"EEcc",th:"betw"},
 Q:{m:"ECCC",t:".",o:"d",d:"eccc",th:"g"},              R:{m:"EECC",t:".",cr:1,o:"u",d:"kKcc",th:"across"},
 S:{m:"CCCC",t:"X",o:"u",d:"cccc",th:"over"},           T:{m:"CCCC",t:"S",o:"u",d:"cccc",th:"betw"},
 U:{m:"EECC",t:".",sp:0,o:"u",d:"eecc",th:"across"},    V:{m:"EECC",t:".",sp:1,o:"u",d:"EEcc",th:"across"},
 W:{m:"EEEC",t:".",sp:1,o:"u",d:"EEEc",th:"across"},    X:{m:"MCCC",t:".",o:"u",d:"hccc",th:"across"},
 Y:{m:"CCCE",t:"O",o:"u",d:"ccce",th:"out"},            Z:{m:"ECCC",t:".",o:"u",d:"eccc",th:"across",mv:"Z"} };

/* Two-hand letters (BSL, UK). The other hand ("tangan pasif") is held open, palm to the camera.
   k: tip = the pointing index touches a fingertip of the open hand (0 thumb … 4 little finger); palm = fingers laid on the open palm;
   fist = fist on fist; cross = crossed index fingers; one = a one-hand letter in BSL too. */
var HAND2={
 A:{k:"tip",f:0}, E:{k:"tip",f:1}, I:{k:"tip",f:2}, O:{k:"tip",f:3}, U:{k:"tip",f:4},
 C:{k:"one"}, G:{k:"fist"}, L:{k:"palm",m:"ECCC",d:"eccc"}, M:{k:"palm",m:"EEEC",d:"eeec"}, N:{k:"palm",m:"EECC",d:"eecc"},
 V:{k:"palm",m:"EECC",sp:1,d:"EEcc"}, X:{k:"cross"} };

/* Tracing strokes. */
var S=function(){ var a=[].slice.call(arguments); return a; };
var BOWL=[[86,44],[85,60],[76,70],[50,73],[25,70],[16,61],[15,51]], JIM=[[28,30],[52,24],[72,27],[58,38],[40,50],[28,64],[31,79],[48,89],[72,86]];
var SIN=[[92,40],[90,54],[82,57],[76,48],[74,56],[66,57],[60,48],[58,58],[54,67],[40,73],[25,71],[16,61],[15,51]];
var SAD=[[56,58],[66,44],[82,40],[92,48],[84,56],[60,58],[56,60],[52,67],[40,73],[25,71],[16,61],[15,51]];
var AIN=[[62,36],[50,30],[39,36],[41,47],[58,52],[42,57],[30,68],[32,81],[48,90],[72,87]];
var FA=[[72,50],[74,38],[86,38],[88,50],[80,57],[60,59],[32,59],[16,53],[14,44]];
var KAF=[[80,14],[80,62],[73,71],[42,72],[22,69],[17,58]], KAFZ=[[57,36],[47,43],[57,48],[47,54]];
var NUN=[[80,40],[82,57],[73,71],[50,75],[30,71],[21,58],[21,46]], WAU=[[60,54],[66,43],[75,48],[73,59],[64,70],[50,81],[33,88]];
function sm(){ return {sm:1, p:[].slice.call(arguments)}; }
var TR={
 alif:[[[50,10],[50,90]]], ba:[sm.apply(null,BOWL)], ta:[sm.apply(null,BOWL)], tsa:[sm.apply(null,BOWL)],
 jim:[sm.apply(null,JIM)], ha:[sm.apply(null,JIM)], kho:[sm.apply(null,JIM)], ca:[sm.apply(null,JIM)],
 dal:[sm([46,28],[58,47],[62,62],[54,71],[32,71])], dzal:[sm([46,34],[58,51],[62,64],[54,72],[32,72])],
 ro:[sm([62,38],[60,55],[51,71],[36,83],[20,87])], zai:[sm([62,40],[60,56],[51,71],[36,83],[20,87])],
 sin:[sm.apply(null,SIN)], syin:[sm.apply(null,SIN)], sod:[sm.apply(null,SAD)], dhod:[sm.apply(null,SAD)],
 tho:[sm([28,72],[38,54],[60,46],[80,52],[83,65],[70,72],[28,72]),[[42,18],[42,70]]], zho:[sm([28,72],[38,54],[60,46],[80,52],[83,65],[70,72],[28,72]),[[42,18],[42,70]]],
 ain:[sm.apply(null,AIN)], ghain:[sm.apply(null,AIN)], nga:[sm.apply(null,AIN)],
 fa:[sm.apply(null,FA)], pa:[sm.apply(null,FA)],
 qof:[sm([62,46],[64,34],[76,33],[79,45],[72,54],[70,67],[60,80],[42,85],[28,77],[24,63])],
 kaf:[sm.apply(null,KAF),sm.apply(null,KAFZ)], ga:[sm.apply(null,KAF),sm.apply(null,KAFZ)],
 lam:[sm([64,10],[64,62],[57,75],[40,81],[24,75],[20,62])],
 mim:[sm([62,50],[70,39],[79,46],[71,55],[54,55],[50,65],[48,92])],
 nun:[sm.apply(null,NUN)], nya:[sm.apply(null,NUN)], wau:[sm.apply(null,WAU)], va:[sm.apply(null,WAU)],
 haa:[sm([50,28],[64,45],[67,62],[55,73],[40,69],[35,54],[41,39],[50,28])],
 lamalif:[sm([68,12],[68,58],[60,75],[47,81],[36,77]),sm([32,12],[40,47],[50,67],[57,82])],
 hamzah:[sm([64,38],[49,32],[40,41],[48,52],[68,50],[34,68])],
 ya:[sm([64,36],[53,32],[46,41],[56,50],[77,52],[83,63],[72,73],[48,75],[28,71],[18,60])],
 A:[[[50,10],[20,90]],[[50,10],[80,90]],[[32,62],[68,62]]],
 B:[[[26,10],[26,90]],sm([26,10],[58,10],[71,19],[72,36],[60,48],[26,48]),sm([26,48],[63,48],[78,59],[78,78],[64,90],[26,90])],
 C:[sm([79,25],[66,12],[48,10],[30,18],[22,36],[22,64],[30,82],[48,90],[66,88],[79,75])],
 D:[[[26,10],[26,90]],sm([26,10],[55,11],[73,24],[80,50],[73,76],[55,89],[26,90])],
 E:[[[72,10],[28,10],[28,90],[72,90]],[[28,50],[64,50]]], F:[[[72,10],[28,10],[28,90]],[[28,50],[62,50]]],
 G:[sm([79,25],[66,12],[48,10],[30,18],[22,36],[22,64],[30,82],[48,90],[66,88],[78,76],[78,58]),[[78,58],[56,58]]],
 H:[[[25,10],[25,90]],[[75,10],[75,90]],[[25,50],[75,50]]], I:[[[50,10],[50,90]],[[34,10],[66,10]],[[34,90],[66,90]]],
 J:[sm([68,10],[68,70],[61,85],[46,90],[32,84],[26,72])], K:[[[28,10],[28,90]],[[74,10],[28,58]],[[42,46],[76,90]]],
 L:[[[30,10],[30,90],[74,90]]], M:[[[20,90],[20,10],[50,62],[80,10],[80,90]]], N:[[[25,90],[25,10],[75,90],[75,10]]],
 O:[sm([50,10],[30,18],[22,36],[22,64],[30,82],[50,90],[70,82],[78,64],[78,36],[70,18],[50,10])],
 P:[[[28,10],[28,90]],sm([28,10],[61,10],[74,22],[74,40],[61,52],[28,52])],
 Q:[sm([50,10],[30,18],[22,36],[22,64],[30,82],[50,90],[70,82],[78,64],[78,36],[70,18],[50,10]),[[56,70],[80,94]]],
 R:[[[28,10],[28,90]],sm([28,10],[61,10],[74,22],[74,40],[61,52],[28,52]),[[50,52],[76,90]]],
 S:[sm([77,23],[63,11],[42,10],[28,18],[26,32],[36,44],[64,54],[76,66],[74,82],[58,90],[38,90],[23,80])],
 T:[[[20,10],[80,10]],[[50,10],[50,90]]], U:[sm([25,10],[25,64],[32,82],[50,90],[68,82],[75,64],[75,10])],
 V:[[[20,10],[50,90],[80,10]]], W:[[[12,10],[30,90],[50,32],[70,90],[88,10]]], X:[[[24,10],[76,90]],[[76,10],[24,90]]],
 Y:[[[22,10],[50,50],[78,10]],[[50,50],[50,90]]], Z:[[[22,10],[78,10],[22,90],[78,90]]] };
// dots for tracing (x, y in the 100 box): above / below positions depend on the letter
var TDOT={ ba:[[50,90]], ta:[[42,40],[58,40]], tsa:[[42,42],[58,42],[50,31]], jim:[[52,62]], kho:[[50,12]], ca:[[44,60],[58,60],[51,70]],
 dzal:[[46,20]], zai:[[62,24]], syin:[[64,30],[80,30],[72,20]], dhod:[[76,28]], zho:[[62,34]], ghain:[[48,13]], nga:[[40,15],[56,15],[48,5]],
 fa:[[80,21]], pa:[[72,21],[88,21],[80,9]], qof:[[64,20],[78,20]], ga:[[56,4]], nun:[[51,40]], nya:[[43,38],[59,38],[51,28]], va:[[66,30]], ya:[[43,91],[59,91]] };

window.HurufData={
 sets:{ hij:{n:["Hijaiyah","Hijaiyah"], list:HIJ, rtl:1}, jawi:{n:["Jawi","Jawi"], list:JAWI, rtl:1}, rumi:{n:["Rumi A–Z","Rumi A–Z"], list:RUMI} },
 hand1:HAND1, hand2:HAND2, trace:TR, tdot:TDOT,
 praise:[["MasyaAllah!","MasyaAllah!"],["Bagus!","Good!"],["Hebat!","Great!"],["Syabas!","Well done!"],["Alhamdulillah, betul!","Alhamdulillah, right!"],["Pandainya!","So clever!"]],
 // Release builds carry no recordings. When reviewed recordings exist, set this to the folder that holds <set>/<key>.mp3
 // (for example the My-Ihsan-Web site) and the app offers a download; until then it uses text-to-speech.
 audioBase:"",
 // The tracking pack: downloaded once on the phone, checked against these SHA-256 hashes, then used offline.
 mp:{ ver:"0.10.21",
  files:[
   {k:"lib", f:"vision_bundle.cjs", u:"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.cjs", h:"bf58c9b3f592304422947b51e1f7de360c67d4dfeaa900064352da0c5a7c9115", n:137890},
   {k:"js", simd:1, f:"vision_wasm_internal.js", u:"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm/vision_wasm_internal.js", h:"4a97e2520ba506c680ecd6ba6acfb146888afa0e2746d57f205352bc6ebb82eb", n:204284},
   {k:"wasm", simd:1, f:"vision_wasm_internal.wasm", u:"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm/vision_wasm_internal.wasm", h:"f00ec4731faa23b3e714d00e88d4d10e2df5c0a427d3a2b4ae6e3526fdd14ef7", n:9574032},
   {k:"js", simd:0, f:"vision_wasm_nosimd_internal.js", u:"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm/vision_wasm_nosimd_internal.js", h:"927def7b465c51b86e4b3060f93646aca4e27121f4b8fc0483786e407ea9cf1f", n:204137},
   {k:"wasm", simd:0, f:"vision_wasm_nosimd_internal.wasm", u:"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm/vision_wasm_nosimd_internal.wasm", h:"3821ea9b1f7fb8c549ef2a064ef5c85750bf375c545a49fd6eea0df44a95f1f4", n:9448638},
   {k:"pose", f:"pose_landmarker_lite.task", u:"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task", h:"59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a", n:5777746},
   {k:"hand", f:"hand_landmarker.task", u:"https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task", h:"fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1", n:7819105}]}
};
})();
