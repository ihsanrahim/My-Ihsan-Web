// UI languages: Bahasa Melayu and English only (Farah, 2026-11-02).
// 0.25.0: Bahasa Indonesia added at Farah's request (converted from the Malay text by lang/id.js).
// 0.6.3: العربية (Arabic, Phase 1): the app runs on its English text, swapped for Arabic from lang/ar.js; right to left.
var ULANGS=[["ms","Bahasa Melayu"],["en","English"],["id","Bahasa Indonesia"],["ar","العربية"]];
var UKEYS=[];
var UTXT={};
var ULOC={ms:"ms-MY",en:"en-GB",id:"id-ID",ar:"ar-SA-u-nu-latn"};
// 0.6.6: dates on screens that pick their own locale follow Arabic too (html lang is "ar" while the app is in Arabic)
window.ibLoc=function(en){ return document.documentElement.lang==="ar" ? ((window.ULOC&&ULOC.ar)||"ar-SA-u-nu-latn") : (en?"en-GB":"ms-MY"); };
