/* Automatic Arabic -> Rumi (Malay-style Latin) reading aid. Rule based, so it can be wrong in places. */
var Rumi = (function(){
  var C={"ب":"b","ت":"t","ث":"th","ج":"j","ح":"h","خ":"kh","د":"d","ذ":"dz","ر":"r","ز":"z","س":"s","ش":"sy","ص":"s","ض":"dh","ط":"t","ظ":"z","ع":"'","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ي":"y","ة":"t","ء":"'","أ":"'","إ":"'","ؤ":"'","ئ":"'"};
  var FA="َ",DA="ُ",KA="ِ",FT="ً",DT="ٌ",KT="ٍ",SK="ْ",SH="ّ",DG="ٰ",MD="ٓ",SK2="ۡ";
  function isMark(ch){ var c=ch.charCodeAt(0); return (c>=0x064B&&c<=0x065F)||c===0x0670||(c>=0x06D6&&c<=0x06ED); }
  function units(w){ var u=[]; for(var i=0;i<w.length;i++){ var ch=w[i]; if(ch==="ـ") continue; if(isMark(ch)){ if(u.length) u[u.length-1].m+=ch; } else u.push({c:ch,m:""}); } return u; }
  function has(u,m){ return u && u.m.indexOf(m)>=0; }
  function vow(u){ if(has(u,FT)) return "an"; if(has(u,KT)) return "in"; if(has(u,DT)) return "un"; if(has(u,FA)) return "a"; if(has(u,KA)) return "i"; if(has(u,DA)) return "u"; return null; }
  // returns {s, join, glue, endShort, tanwin, endTa}
  function word(w){
    var u=units(w); if(!u.length) return null;
    var out="", j=0, join="", glue=false, last=null, short=false, tanwin=null, endTa=false;
    var a0=u[0].c==="ا"||u[0].c==="ٱ";
    if(a0 && !vow(u[0])){
      if(u[1] && u[1].c==="ل" && u.length>2){
        var nx=u[2];
        if(has(u[1],SH)){ out="a"; join=""; glue=true; j=1; }
        else if(nx.c==="ل" && has(nx,SH)){ out="a"; join=""; glue=true; j=2; }
        else if(has(nx,SH) && C[nx.c]){ var cc=C[nx.c]; out="a"+cc+"-"; join=cc; j=2; u[2]={c:nx.c,m:nx.m.replace(SH,"")}; }
        else { out="al"; join="l"; j=2; }
      } else { out="i"; glue=true; join=""; j=1; }
    }
    var startOut=out.length;
    if(out==="al" && vow(u[1])){ var lv=vow(u[1]); out+=lv; last=lv[0]; }
    for(; j<u.length; j++){
      var x=u[j], c=x.c, v=vow(x);
      if(c==="ا"||c==="ٱ"){ if(j===0){ out+=v||"a"; last=(v||"a")[0]; short=true; continue; } if(last==="a"||tanwin==="an"){ short=false; continue; } if(!v && (last==="i"||last==="u")){ continue; } out+=v||"a"; last="a"; short=false; continue; }
      if(c==="آ"){ out+=(j===0?"a":"'a"); last="a"; short=false; continue; }
      if(c==="ى"){ if(last!=="a"){ out+="a"; } last="a"; short=false; continue; }
      if(c==="و" && !v && !has(x,SH)){ if(last==="u"){ short=false; continue; } if(last==="a" && (has(x,SK)||has(x,SK2)||j===u.length-1)){ out+="u"; last="u"; short=false; continue; } }
      if(c==="ي" && !v && !has(x,SH)){ if(last==="i"){ short=false; continue; } if(last==="a" && (has(x,SK)||has(x,SK2)||j===u.length-1)){ out+="i"; last="i"; short=false; continue; } }
      var m=C[c]; if(m===undefined){ continue; }
      if(c==="أ"||c==="إ"||c==="ؤ"||c==="ئ"||c==="ء"){ m=(out.length===0)?"":"'"; if(!v) v=(c==="إ")?"i":(c==="ؤ"?"u":(c==="ئ"?"i":"a")); }
      if(has(x,SH)) out+= m.length>1 ? m : m+m; else out+=m;
      if(v){ out+=v; last=v[0]; short=true; tanwin=v.length>1?v:null; } else { last=null; short=false; tanwin=null; }
      if(has(x,DG)){ if(!v) out+="a"; last="a"; short=false; }
      endTa = (c==="ة");
    }
    return {s:out, pre:startOut, join:join, glue:glue, waslStart:a0&&!vow(u[0]), endShort:short, tanwin:tanwin, endTa:endTa};
  }
  function pause(wr){
    var s=wr.s;
    if(wr.endTa){ s=s.replace(/t(an|in|un|a|i|u)$/,"h"); return s; }
    if(wr.tanwin==="an") return s.replace(/an$/,"a");
    if(wr.tanwin) return s.slice(0,-2);
    if(wr.endShort) return s.slice(0,-1);
    return s;
  }
  function phrase(p){
    var ws=p.split(/\s+/).filter(Boolean), res=[], prev=null;
    for(var i=0;i<ws.length;i++){
      var wr=word(ws[i]); if(!wr) continue;
      var isLast=(i===ws.length-1);
      if(isLast) wr.s=pause(wr);
      if(prev && /[aiu]$/.test(res[res.length-1]) && wr.waslStart){
        var body = wr.s.slice(wr.pre);
        if(wr.glue){ res[res.length-1]+=wr.join+body; }
        else { res[res.length-1]+=wr.join; res.push(body); }
      } else res.push(wr.s);
      prev=wr;
    }
    return res.join(" ");
  }
  function conv(ar){
    if(!ar) return "";
    var t=String(ar).replace(/<[^>]*>/g," ").replace(/[۝٠-٩\d()﴾﴿]/g," ");
    var parts=t.split(/([،؛.!؟\n])/), out="";
    for(var i=0;i<parts.length;i++){
      var p=parts[i]; if(!p) continue;
      if(/^[،؛.!؟\n]$/.test(p)){ out+= (p==="،"||p==="؛")?", ":(p==="\n"?" ":". "); continue; }
      var ph=phrase(p.trim()); if(ph) out+=ph;
    }
    out=out.replace(/\s+/g," ").replace(/\s+([,.])/g,"$1").trim().replace(/[,.]$/,"");
    out=out.replace(/(^|[\s-])allah/g,function(m,a){ return a+"Allah"; }).replace(/(^|\. )([a-z])/g,function(m,a,b){ return a+b.toUpperCase(); });
    return out.charAt(0).toUpperCase()+out.slice(1);
  }
  return {conv:conv};
})();
