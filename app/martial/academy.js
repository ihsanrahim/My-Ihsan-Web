/* My Ihsan 0.7.42 · Explore › Martial arts. The owner's academy: 10 arts, each with a study guide (window.MA_DATA, from martial/guides.js)
   and 3D lessons (martial/demos/<id>.html, the owner's three.js dojo, opened full screen in an iframe). Back closes the 3D view, then the art. */
window.MartialView = (function(){
"use strict";
var H = null, root = null, cur = null, sec = 0, ov = null;
function L(a, b){ return H.L2x(a, b); }
function esc(s){ return H.esc(s == null ? "" : String(s)); }
function D(){ return window.MA_DATA || {arts:[], md:{}}; }
function art(id){ return D().arts.filter(function(a){ return a.id === id; })[0]; }

// ---------- markdown (headings, tables, lists, quotes, code) ----------
function inline(s){ var h = esc(s);
  h = h.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g, "$1<i>$2</i>");
  return h.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"); }
function md(src){ var out = [], lines = src.split("\n"), i = 0, para = [];
  var flush = function(){ if(para.length){ out.push("<p>" + inline(para.join(" ")) + "</p>"); para = []; } };
  while(i < lines.length){ var ln = lines[i];
    if(/^```/.test(ln)){ flush(); var code = []; i++; while(i < lines.length && !/^```/.test(lines[i])){ code.push(lines[i]); i++; } i++; out.push("<pre>" + esc(code.join("\n")) + "</pre>"); continue; }
    var hm = ln.match(/^(#{3,4}) (.*)$/); if(hm){ flush(); out.push("<h" + (hm[1].length + 1) + ">" + inline(hm[2]) + "</h" + (hm[1].length + 1) + ">"); i++; continue; }
    if(/^---\s*$/.test(ln)){ flush(); i++; continue; }
    if(/^>/.test(ln)){ flush(); var q = []; while(i < lines.length && /^>/.test(lines[i])){ q.push(lines[i].replace(/^>\s?/, "")); i++; } out.push("<blockquote>" + inline(q.join(" ")) + "</blockquote>"); continue; }
    if(/^\|/.test(ln)){ flush(); var rows = []; while(i < lines.length && /^\|/.test(lines[i])){ rows.push(lines[i]); i++; }
      var cells = function(r){ return r.trim().replace(/^\||\|$/g, "").split("|").map(function(c){ return c.trim(); }); }, hd = cells(rows[0]), body = rows.slice(2).map(cells);
      out.push('<div class="maTw"><table class="maT"><thead><tr>' + hd.map(function(c){ return "<th>" + inline(c) + "</th>"; }).join("") + "</tr></thead><tbody>" + body.map(function(r){ return "<tr>" + r.map(function(c){ return "<td>" + inline(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>"); continue; }
    if(/^\s*(\d+\.|[-*]) /.test(ln)){ flush(); var ol = /^\s*\d/.test(ln), it = []; while(i < lines.length && /^\s*(\d+\.|[-*]) /.test(lines[i])){ it.push(lines[i].replace(/^\s*(\d+\.|[-*]) /, "")); i++; } out.push((ol ? "<ol>" : "<ul>") + it.map(function(x){ return "<li>" + inline(x) + "</li>"; }).join("") + (ol ? "</ol>" : "</ul>")); continue; }
    if(!ln.trim()){ flush(); i++; continue; }
    para.push(ln); i++; }
  flush(); return out.join(""); }
// a guide = title + header quote (intro) + "## N. Section" parts
function parts(src){ var title = "", intro = "", ss = [];
  src.split("\n").forEach(function(ln){ var m = ln.match(/^## (?:\d+\.\s*)?(.*)$/);
    if(/^# /.test(ln) && !title){ title = ln.slice(2); return; }
    if(m){ ss.push({t:m[1], md:""}); return; }
    if(ss.length) ss[ss.length - 1].md += ln + "\n"; else intro += ln + "\n"; });
  return {title:title, intro:intro, ss:ss}; }

// ---------- screens ----------
function list(){ cur = null; var A = D().arts;
  root.innerHTML = '<div class="card maIntro"><b>🥋 ' + L("Akademi seni mempertahankan diri", "Martial arts academy") + '</b><p>' +
    L("10 seni dengan panduan lengkap (sejarah, adab, pakaian menutup aurat, tahap, teknik, pelan latihan) dan pelajaran 3D: watak bertutup penuh, gerak perlahan, kamera depan/sisi/atas.",
      "10 arts with full guides (history, etiquette, modest uniform, ranks, techniques, a training plan) and 3D lessons: fully covered figures, slow motion, front/side/top cameras.") + '</p>' +
    '<div class="maSafe">⚠️ ' + L("Belajar dengan jurulatih bertauliah: panduan dan animasi ini menyokong latihan, bukan menggantikannya. Panaskan badan, guna tilam, lepaskan bila pasangan tepuk.",
      "Learn from a qualified instructor: these guides and animations support training, they don't replace it. Warm up, use mats, and always release on a tap.") + '</div></div>' +
    '<div class="maGrid">' + A.map(function(a){ return '<button class="maArt" data-ma="' + a.id + '"><span class="maFl">' + a.flag + '</span><span class="maTx"><b>' + esc(a.n) + '</b><small>' + esc(a.c) + ' · ' + esc(a.range) + ' · ' + a.les + ' ' + L("pelajaran 3D", "3D lessons") + '</small><small class="mut">' + esc(a.best) + '</small></span><span class="maGo">›</span></button>'; }).join("") + '</div>' +
    '<div class="card"><b>⚖️ ' + L("Perbandingan", "Comparing the arts") + '</b><div class="maTw"><table class="maT"><thead><tr><th>' + L("Seni", "Art") + '</th><th>' + L("Jarak", "Range") + '</th><th>' + L("Senjata utama", "Main weapons") + '</th><th>' + L("Lantai", "Ground") + '</th><th>' + L("Format sukan", "Sport format") + '</th></tr></thead><tbody>' +
    A.map(function(a){ return '<tr data-ma="' + a.id + '"><td>' + a.flag + ' ' + esc(a.n) + '</td><td>' + esc(a.range) + '</td><td>' + esc(a.weap) + '</td><td>' + esc(a.ground) + '</td><td>' + esc(a.sport) + '</td></tr>'; }).join("") + '</tbody></table></div></div>';
  root.querySelectorAll("[data-ma]").forEach(function(b){ b.onclick = function(){ openArt(b.getAttribute("data-ma"), 0); }; }); }
function openArt(id, s){ var a = art(id); if(!a) return list(); cur = id; sec = s || 0;
  var P = parts(D().md[id] || ""), S = P.ss[sec] || {t:"", md:""};
  root.innerHTML = '<div class="card maHead"><div class="maHT"><span class="maFl big">' + a.flag + '</span><div><b>' + esc(a.n) + '</b><div class="mut tiny">' + esc(a.c) + '</div></div></div>' + md(P.intro) +
    '<div class="maFacts"><span>📏 ' + esc(a.range) + '</span><span>👊 ' + esc(a.weap) + '</span>' + (a.ground !== "—" ? '<span>🤼 ' + esc(a.ground) + '</span>' : '') + (a.sport !== "—" ? '<span>🏆 ' + esc(a.sport) + '</span>' : '') + '</div>' +
    '<button class="btn gold g3d maPlay" id="ma3d">▶ ' + L("Pelajaran 3D", "3D lessons") + ' (' + a.les + ')</button>' +
    '<div class="mut tiny maMulti">👥 ' + esc(a.multi) + '</div></div>' +
    '<div class="maToc">' + P.ss.map(function(x, i){ return '<button class="chip' + (i === sec ? ' on' : '') + '" data-sec="' + i + '">' + esc(x.t.replace(/\s*\(.*\)$/, "")) + '</button>'; }).join("") + '</div>' +
    '<div class="card maBody"><h3 class="maH">' + esc(S.t) + '</h3>' + md(S.md) + '</div>' +
    '<div class="btns"><button class="btn alt g3d" id="maPrev"' + (sec ? '' : ' disabled') + '>‹ ' + L("Sebelum", "Back") + '</button><button class="btn gold g3d" id="maNext"' + (sec < P.ss.length - 1 ? '' : ' disabled') + '>' + L("Seterusnya", "Next") + ' ›</button></div>';
  root.querySelector("#ma3d").onclick = function(){ play(id); };
  root.querySelectorAll("[data-sec]").forEach(function(b){ b.onclick = function(){ openArt(id, +b.getAttribute("data-sec")); var t = root.querySelector(".maToc"); if(t) t.scrollIntoView({block:"start"}); }; });
  root.querySelector("#maPrev").onclick = function(){ openArt(id, sec - 1); top(); };
  root.querySelector("#maNext").onclick = function(){ openArt(id, sec + 1); top(); };
  var on = root.querySelector(".maToc .on"); if(on && on.scrollIntoView) on.scrollIntoView({block:"nearest", inline:"center"}); }
function top(){ var t = root.querySelector(".maToc"); if(t) t.scrollIntoView({block:"start"}); }
// 3D lessons: full screen, the dojo page builds its own controls (lesson menu, pause, speed, cameras)
function play(id){ var a = art(id); close();
  ov = document.createElement("div"); ov.className = "maOv";
  ov.innerHTML = '<div class="maOvBar"><b>' + a.flag + ' ' + esc(a.n) + '</b><button class="chip" id="maX">✕ ' + L("Tutup", "Close") + '</button></div><iframe class="maFr" src="martial/demos/' + id + '.html" title="' + esc(a.n) + '"></iframe>';
  document.body.appendChild(ov); ov.querySelector("#maX").onclick = close; }
function close(){ if(!ov) return false; var f = ov.querySelector("iframe"); if(f) f.src = "about:blank"; ov.remove(); ov = null; return true; }
function back(){ if(close()) return true; if(cur){ list(); return true; } return false; }
function render(box, helpers){ H = helpers; root = box; root.classList.add("maRoot"); list(); }
return {render:render, back:back, stop:close, _t:{parts:parts, md:md, open:openArt, play:play}};
})();
