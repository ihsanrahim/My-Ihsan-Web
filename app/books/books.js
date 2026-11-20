/* Books (0.4.0), Alat › Buku: a PDF library and reader (PocketBook-style) with PDF tools (MobiPDF-style).
   Reader: single / double page, page-turn animation (flip, slide, none), vertical scroll, text (reflow) mode, bottom slider with
   page number and ‹ › buttons, tap zones and swipes, themes (day, sepia, grey, night) and brightness, zoom, contents, bookmarks,
   highlights in 4 colours with notes, search, read aloud, remembered position, keep-screen-on.
   Tools: draw / highlight / text / signature / date / tick / cross / box on pages, organise pages (rotate, delete, move, duplicate,
   insert blank, extract, split, merge), fill forms, page numbers, watermark, compress, convert to text / Word / images,
   images or camera scan to PDF, recognise text (OCR) with the online AI. Edits are saved as a new PDF in the library.
   Engines bundled in books/lib: pdf.js 3.11.174 (Mozilla, Apache-2.0) to show PDFs, pdf-lib 1.17.1 (MIT) to write them.
   Files: Android keeps them in files/books (Native.book*); the web preview keeps them in IndexedDB. List: ihsan_books.
   0.4.2 (PocketBook): pinch and double-tap zoom, rotation button (follow the phone / landscape / portrait, reader only),
   read aloud with the spoken sentence and word highlighted, autoscroll, notes anywhere, full screen, an organisable bottom
   toolbar, reader settings (tap zones, volume keys, crop margins, speech speed, mark as read), collections and cover size.
   (MobiPDF): edit any text in the PDF, move/resize placed items, smoother pen, multi-page scan with crop/rotate/reorder,
   insert pages from another PDF. */
(function(){
"use strict";
var H = null, KEY = "ihsan_books", SKEY = "ihsan_books_set", LIB = "books/lib/";
var B = {q:"", sort:"recent", col:""}, RD = null, PDFJS = null;
function L2(a,b){ return H.L2x(a,b); }
function esc(s){ return H.esc(s==null ? "" : String(s)); }
function N(){ return H.N; }
function list(){ var l = H.load(KEY, []); return Array.isArray(l) ? l : []; }
function store(l){ try{ localStorage.setItem(KEY, JSON.stringify(l)); return true; }catch(e){ H.toast(L2("Storan penuh","Storage is full")); return false; } }
function get(id){ return list().filter(function(b){ return b.id===id; })[0] || null; }
function put(b){ var l = list(), i; for(i=0;i<l.length;i++) if(l[i].id===b.id){ l[i] = b; store(l); return; } l.unshift(b); store(l); }
function setOf(){ var s = H.load(SKEY, {}) || {}; s.mode = s.mode || "page"; s.dbl = s.dbl || "auto"; s.anim = s.anim || "flip"; s.theme = s.theme || "day"; s.fit = s.fit || "page"; s.bright = s.bright==null ? 1 : s.bright; s.fs = s.fs || 18; s.sigs = s.sigs || [];
  s.rot = s.rot || "port"; s.tz = s.tz || "lr"; s.crop = s.crop || 0; s.rate = s.rate || 1; s.autoV = s.autoV || 40; s.cols = s.cols || 3; s.lview = s.lview || "grid";
  if(s.dtz==null) s.dtz = true; if(s.keep==null) s.keep = true; if(s.pnum==null) s.pnum = true;
  var all = TB.map(function(t){ return t[0]; }); s.tb = (s.tb||[]).filter(function(k){ return all.indexOf(k)>=0; }); all.forEach(function(k){ if(s.tb.indexOf(k)<0) s.tb.push(k); }); s.tbOff = s.tbOff || [];
  return s; }
// PocketBook-style bottom toolbar (order and visibility set in Organise)
var TB = [["aa","Aa","Teks","Text"],["view","🎨","Paparan","View"],["rot","🔄","Putaran","Rotation"],["tts","🔊","Baca","TTS"],["auto","⏬","Auto tatal","Autoscroll"],["note","💬","Nota","Add note"],["full","⛶","Skrin penuh","Fullscreen"],["set","⚙","Tetapan","Settings"],["org","⇅","Susun","Organise"]];   // 0.6.31: ⇅, so it is not the same as ✏️ edit
function saveSet(s){ H.save(SKEY, s); }
function newId(){ return "b" + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }
function fmtSize(n){ return n > 1048576 ? (n/1048576).toFixed(1)+" MB" : Math.max(1, Math.round(n/1024))+" KB"; }
function baseName(n){ return String(n||"").replace(/\.pdf$/i, ""); }

// ---------------- engines ----------------
function loadJs(files){ return new Promise(function(res, rej){ H.loadJs(files, res, function(){ rej(new Error(L2("Gagal memuatkan enjin PDF","The PDF engine could not load"))); }); }); }
function pdfjs(){
  if(PDFJS) return Promise.resolve(PDFJS);
  return loadJs([LIB+"pdf.worker.min.js", LIB+"pdf.min.js"]).then(function(){ PDFJS = window.pdfjsLib; PDFJS.GlobalWorkerOptions.workerSrc = LIB+"pdf.worker.min.js"; return PDFJS; });
}
function pdflib(){ return window.PDFLib ? Promise.resolve(window.PDFLib) : loadJs([LIB+"pdf-lib.min.js"]).then(function(){ return window.PDFLib; }); }
// ---------------- file storage ----------------
var IDB = null;
function idb(){ if(IDB) return IDB; IDB = new Promise(function(res, rej){ var r = indexedDB.open("ihsanBooks", 1); r.onupgradeneeded = function(){ r.result.createObjectStore("f"); }; r.onsuccess = function(){ res(r.result); }; r.onerror = function(){ rej(r.error); }; }); return IDB; }
var MEM = {};   // web preview where IndexedDB is not allowed (file:// pages): keep files in memory for this session
function idbDo(mode, fn){
  var mem = {get:function(k){ return {result:MEM[k]}; }, put:function(v, k){ MEM[k] = v; return {result:k}; }, delete:function(k){ delete MEM[k]; return {}; }};
  return idb0(mode, fn).catch(function(){ return fn(mem).result; });
}
function idb0(mode, fn){ return idb().then(function(db){ return new Promise(function(res, rej){ var t = db.transaction("f", mode), s = t.objectStore("f"), q = fn(s); t.oncomplete = function(){ res(q && q.result); }; t.onerror = function(){ rej(t.error); }; }); }); }
function native(){ return !!(N().bookUrl && window.Native); }
function bytesOf(id){
  if(native()){ var u = N().bookUrl(id); if(!u) return Promise.reject(new Error(L2("Fail tiada","The file is missing")));
    return new Promise(function(res, rej){ var x = new XMLHttpRequest(); x.open("GET", u); x.responseType = "arraybuffer"; x.onload = function(){ res(new Uint8Array(x.response)); }; x.onerror = function(){ rej(new Error(L2("Fail tidak dapat dibaca","The file could not be read"))); }; x.send(); }); }
  return idbDo("readonly", function(s){ return s.get(id); }).then(function(b){ if(!b) throw new Error(L2("Fail tiada","The file is missing")); return new Uint8Array(b); });
}
function b64(u8){ var s = "", i; for(i=0;i<u8.length;i+=32768) s += String.fromCharCode.apply(null, u8.subarray(i, i+32768)); return btoa(s); }
function writeFile(id, u8, ext){
  if(native()){ N().bookWriteStart(id); for(var i=0;i<u8.length;i+=393216){ if(!N().bookWriteChunk(id, b64(u8.subarray(i, i+393216)))) return Promise.reject(new Error("write")); } var n = N().bookWriteEnd(id, ext||"pdf"); return n > 0 ? Promise.resolve(n) : Promise.reject(new Error("write")); }
  return idbDo("readwrite", function(s){ return s.put(u8.buffer.slice(u8.byteOffset, u8.byteOffset+u8.byteLength), id); }).then(function(){ return u8.length; });
}
function delFile(id){ if(native()) N().bookDelete(id); else idbDo("readwrite", function(s){ return s.delete(id); }); }
// add a new PDF (bytes) to the library
function addBook(u8, name, extra){
  var id = newId();
  return writeFile(id, u8, "pdf").then(function(size){ var b = {id:id, name:name, size:size, added:Date.now(), last:0, page:1, pages:0, cover:"", hl:[], bm:[], ed:{}}; for(var k in (extra||{})) b[k] = extra[k]; put(b); return cover(b).then(function(){ return b; }); });
}
function docOf(b){
  return pdfjs().then(function(P){
    var opt = {standardFontDataUrl:LIB+"standard_fonts/", isEvalSupported:false};
    var src = native() ? Promise.resolve({url:N().bookUrl(b.id)}) : bytesOf(b.id).then(function(u8){ return {data:u8}; });
    return src.then(function(s){ for(var k in s) opt[k] = s[k]; var t = P.getDocument(opt);
      t.onPassword = function(update, reason){ var pw = prompt(reason===2 ? L2("Kata laluan salah. Cuba lagi:","Wrong password. Try again:") : L2("PDF ini dilindungi kata laluan:","This PDF is password-protected:")); if(pw==null){ t.destroy(); } else update(pw); };
      return t.promise; });
  });
}
function cover(b){
  return docOf(b).then(function(doc){ return doc.getPage(1).then(function(pg){ var v = pg.getViewport({scale:1}), sc = 180/v.width, vp = pg.getViewport({scale:sc}), c = document.createElement("canvas"); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    return pg.render({canvasContext:c.getContext("2d"), viewport:vp}).promise.then(function(){ var x = get(b.id) || b; x.cover = c.toDataURL("image/jpeg", 0.6); x.pages = doc.numPages; b.cover = x.cover; b.pages = x.pages; put(x); doc.destroy(); }); }); }).catch(function(){});
}

// ---------------- library ----------------
function view(el){
  var l = list(), q = B.q.toLowerCase(), last = l.filter(function(b){ return b.last; }).sort(function(a, b){ return b.last - a.last; })[0];
  var ss = setOf(), sub = foldDesc(ss, B.col);   // 0.6.12: a folder shows the books of its subfolders too (Study › Year › Subject)
  var f = l.filter(function(b){ return (!q || b.name.toLowerCase().indexOf(q)>=0) && (!B.col || (b.col||[]).some(function(c){ return sub.indexOf(c)>=0; })); });
  f.sort(B.sort==="name" ? function(a, b){ return a.name.localeCompare(b.name); } : B.sort==="prog" ? function(a, b){ return prog(b) - prog(a); } : function(a, b){ return (b.last||b.added) - (a.last||a.added); });
  var tool = function(k, ic, ms, en){ return '<button class="hOpt" data-bk="'+k+'"><span>'+ic+'</span>'+L2(ms, en)+'</button>'; };
  var h = '<div class="card bkhero"><div class="hhTop"><div class="hhIc">📚</div><div><b>'+L2("Buku & PDF","Books & PDF")+'</b><div class="mut">'+L2("Baca, serlah, tandatangan dan sunting PDF. Dari mana-mana aplikasi: Kongsi atau Buka dengan › My Ihsan Books.","Read, highlight, sign and edit PDFs. From any app: Share or Open with › My Ihsan Books.")+'</div></div></div>'+
    '<div class="hOpts r4 bksm">'+tool("open","📂","Buka PDF","Open PDF")+tool("scan","📷","Imbas","Scan")+tool("imgs","🖼️","Gambar","Photos")+tool("merge","🔗","Gabung","Merge")+'</div>'+
    '<input type="file" id="bkFile" accept="application/pdf,.pdf" multiple style="display:none"><input type="file" id="bkImg" accept="image/*" multiple style="display:none"></div>';
  if(last) h += '<div class="card bkcont" data-open="'+last.id+'"><div class="bkcov sm">'+(last.cover ? '<img src="'+last.cover+'" alt="">' : '📄')+'</div><div><div class="mut tiny">'+L2("Sambung membaca","Continue reading")+'</div><b>'+esc(baseName(last.name))+'</b><div class="bkpb"><i style="width:'+prog(last)+'%"></i></div><div class="mut tiny">'+L2("Halaman ","Page ")+last.page+(last.pages ? " / "+last.pages : "")+' · '+prog(last)+'%</div></div></div>';
  if(l.length){
    h += '<input id="bkQ" class="rin" type="search" placeholder="🔎 '+L2("Cari buku","Search books")+'" value="'+esc(B.q)+'" style="margin:8px 0">';
    // 0.5.5: a folder sidebar (built-in collections + your folders) beside the gallery; grid / list and cover size above it
    h += '<div class="bkcolbar rtool"><span class="mut tiny">'+f.length+L2(" buku"," books")+'</span><span style="flex:1"></span><button class="chip bksort" data-bk="sort" title="'+L2("Susun: ","Sort: ")+(B.sort==="name"?L2("nama","name"):B.sort==="prog"?L2("kemajuan","progress"):L2("terkini","recent"))+'">'+(B.sort==="name"?"🔤":B.sort==="prog"?"📊":"🕘")+'</button><button class="chip" data-lv="1" title="'+L2("Grid / senarai","Grid / list")+'">'+(ss.lview==="list" ? "▦" : "☰")+'</button>'+(ss.lview==="list" ? '' : '<button class="chip" data-cs="1" title="'+L2("Saiz kulit","Cover size")+'">'+["","","▪▪","▪▪▪","▪▪▪▪","▪▪▪▪▪"][ss.cols]+'</button>')+'</div>';
    var g = '';
    if(ss.lview==="list") g += '<div class="bklist">'+f.map(function(b){ return '<div class="bkrow2"><button class="bkcov sm" data-open="'+b.id+'">'+(b.cover ? '<img src="'+b.cover+'" alt="">' : '<span>📄</span>')+'</button><div class="bkrowt" data-open="'+b.id+'"><b>'+esc(baseName(b.name))+'</b><div class="bkpb"><i style="width:'+prog(b)+'%"></i></div><div class="mut tiny">'+colIcons(b)+(b.pages ? prog(b)+'% · '+b.pages+L2(" hlm"," pp") : fmtSize(b.size||0))+(b.time ? ' · ⏱ '+fmtTime(b.time) : '')+'</div></div><button class="bkmore" data-more="'+b.id+'">⋮</button></div>'; }).join("")+(f.length ? '' : '<div class="mut small" style="padding:10px">'+L2("Tiada buku dalam koleksi ini.","No books in this collection.")+'</div>')+'</div>';
    else g += '<div class="bkgrid" style="grid-template-columns:repeat('+ss.cols+',1fr)">'+f.map(function(b){ return '<div class="bkitem"><button class="bkcov" data-open="'+b.id+'">'+(b.cover ? '<img src="'+b.cover+'" alt="">' : '<span>📄</span>')+(b.pages ? '<i class="bkpp" style="width:'+prog(b)+'%"></i>' : '')+'</button><div class="bkn"><span>'+esc(baseName(b.name))+'</span>'+(H.fav ? '<button class="bkstar'+(H.fav.has("alat/nota/buku/"+b.id) ? ' on' : '')+'" data-bstar="'+b.id+'">'+(H.fav.has("alat/nota/buku/"+b.id) ? '★' : '☆')+'</button>' : '')+'<button class="bkmore" data-more="'+b.id+'">⋮</button></div><div class="mut tiny">'+colIcons(b)+(b.pages ? prog(b)+'% · '+b.pages+L2(" hlm"," pp") : fmtSize(b.size||0))+'</div></div>'; }).join("")+'</div>'+(f.length ? '' : '<div class="mut small" style="padding:10px">'+L2("Tiada buku dalam koleksi ini.","No books in this collection.")+'</div>');
    var cnt = function(k){ var d = foldDesc(ss, k); return l.filter(function(b){ return (b.col||[]).some(function(c){ return d.indexOf(c)>=0; }); }).length; };
    h += H.IbFold ? H.IbFold.html({open:ss.fold!==false, cur:B.col, body:g, items:[{k:"", ic:"📚", n:L2("Semua","All"), c:l.length}].concat(COLS_B.map(function(c){ return {k:c[0], ic:c[1], n:L2(c[2], c[3]), c:cnt(c[0])}; })).concat(foldTree(ss).map(function(x){ return {k:x.id, ic:x.ic || "📁", n:x.n, c:cnt(x.id), menu:true, lv:x.lv}; }))}) : g;
  } else h += '<div class="card rempty"><div style="font-size:34px">📖</div><b>'+L2("Belum ada buku","No books yet")+'</b><div class="mut small" style="margin-top:6px;line-height:1.5">'+L2("Tekan Buka PDF, atau dari WhatsApp, Gmail, Drive dan lain-lain: Kongsi › My Ihsan Books.","Tap Open PDF, or from WhatsApp, Gmail, Drive and others: Share › My Ihsan Books.")+'</div></div>';
  h += '<div class="mut tiny" style="padding:4px 4px 14px">'+L2("Enjin PDF: pdf.js (Mozilla, Apache-2.0) dan pdf-lib (MIT), dalam aplikasi. Fail disimpan dalam telefon sahaja.","PDF engines: pdf.js (Mozilla, Apache-2.0) and pdf-lib (MIT), inside the app. Files stay on the phone.")+'</div>';
  el.innerHTML = h; bindLib(el);
  // 0.5.27: ☆ adds a book to the ☰ menu's Favourites
  el.querySelectorAll("[data-bstar]").forEach(function(x){ x.onclick = function(e){ e.stopPropagation(); var id = "alat/nota/buku/"+x.getAttribute("data-bstar"), on = H.fav.toggle(id); x.classList.toggle("on", on); x.textContent = on ? "★" : "☆"; }; });
}
var COLS_B = [["fav","⭐","Kegemaran","Favourites"],["toread","📌","Mahu baca","To read"],["read","✅","Sudah baca","Have read"]];
// 0.6.12: folders may sit inside another folder (f.par); tree order with depth, and a folder plus all folders below it
function foldTree(ss){ var fs = ss.folders || [], out = [], add = function(par, lv){ fs.filter(function(x){ return (x.par || "") === par && out.indexOf(x) < 0; }).forEach(function(x){ out.push({id:x.id, n:x.n, ic:x.ic, lv:lv}); add(x.id, lv + 1); }); };
  add("", 0); fs.forEach(function(x){ if(!out.some(function(o){ return o.id === x.id; })) out.push({id:x.id, n:x.n, ic:x.ic, lv:0}); }); return out; }
function foldDesc(ss, k){ if(!k) return []; var fs = ss.folders || [], out = [k], i = 0; while(i < out.length){ var p = out[i++]; fs.forEach(function(x){ if(x.par === p && out.indexOf(x.id) < 0) out.push(x.id); }); } return out; }
function colIcons(b){ return (b.col||[]).map(function(c){ var x = COLS_B.filter(function(y){ return y[0]===c; })[0]; return x ? x[1] : ""; }).join("")+((b.col||[]).length ? " " : ""); }
function fmtTime(sec){ var m = Math.round(sec/60); return m < 60 ? m+L2(" min"," min") : Math.floor(m/60)+L2(" j "," h ")+(m%60)+" min"; }
function toggleCol(b, c, on){ b.col = (b.col||[]).filter(function(x){ return x!==c; }); if(on) b.col.push(c); put(b); }
function prog(b){ return b.pages ? Math.round(Math.min(1, (b.page||1)/b.pages)*100) : 0; }
function bindLib(el){
  var fi = el.querySelector("#bkFile"); fi.onchange = function(){ var fs = [].slice.call(fi.files||[]); fi.value = ""; importFiles(fs).then(function(){ view(el); }); };
  var ii = el.querySelector("#bkImg"); ii.onchange = function(){ var fs = [].slice.call(ii.files||[]); ii.value = ""; Promise.all(fs.map(function(f){ return new Promise(function(r){ var fr = new FileReader(); fr.onload = function(){ r(fr.result); }; fr.readAsDataURL(f); }); })).then(function(l){ if(l.length) imagesToPdf(l, el); }); };
  var q = el.querySelector("#bkQ"); if(q) q.oninput = function(){ B.q = q.value; var p = q.selectionStart; view(el); var q2 = el.querySelector("#bkQ"); q2.focus(); try{ q2.setSelectionRange(p, p); }catch(e){} };
  el.querySelectorAll("[data-col]").forEach(function(b){ b.onclick = function(){ B.col = b.getAttribute("data-col"); view(el); }; });
  if(H.IbFold) H.IbFold.bind(el, {pick:function(k){ B.col = k; view(el); }, toggle:function(o){ var s = setOf(); s.fold = o; saveSet(s); view(el); },
    add:function(){ H.IbFold.ask("📁 "+L2("Folder baharu","New folder"), "", function(n){ var s = setOf(); s.folders = s.folders || []; s.folders.push({id:"f"+Date.now().toString(36), n:n}); saveSet(s); view(el); }); },
    menu:function(k){ var s = setOf(), fo = (s.folders||[]).filter(function(x){ return x.id===k; })[0]; if(!fo) return;
      H.IbFold.menu(fo.n, function(n){ var s2 = setOf(); (s2.folders||[]).forEach(function(x){ if(x.id===k) x.n = n; }); saveSet(s2); view(el); },
        function(){ var s2 = setOf(), d = foldDesc(s2, k); s2.folders = (s2.folders||[]).filter(function(x){ return d.indexOf(x.id)<0; }); saveSet(s2); list().forEach(function(b){ d.forEach(function(c){ if((b.col||[]).indexOf(c)>=0) toggleCol(b, c, false); }); }); if(d.indexOf(B.col)>=0) B.col = ""; view(el); }); }});
  var lv = el.querySelector("[data-lv]"); if(lv) lv.onclick = function(){ var s = setOf(); s.lview = s.lview==="list" ? "grid" : "list"; saveSet(s); view(el); };
  var cs = el.querySelector("[data-cs]"); if(cs) cs.onclick = function(){ var s = setOf(); s.cols = s.cols>=5 ? 2 : s.cols+1; saveSet(s); view(el); };
  el.querySelectorAll("[data-open]").forEach(function(b){ b.onclick = function(){ openBook(b.getAttribute("data-open")); }; });
  el.querySelectorAll("[data-more]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); moreSheet(b.getAttribute("data-more"), el); }; });
  el.querySelectorAll("[data-bk]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-bk");
    if(k==="guide"){ openGuide(el); return; }
    if(k==="open") pickPdf(el); else if(k==="scan") scan(el); else if(k==="imgs") pickImages(el); else if(k==="merge") mergeSheet(el);
    else if(k==="sort"){ B.sort = B.sort==="recent" ? "name" : B.sort==="name" ? "prog" : "recent"; view(el); }
    else if(k==="help") H.showSheet("💡 "+L2("Cara guna","How to"), '<ul class="ul small">'+[
      ["Kongsi PDF dari mana-mana aplikasi › My Ihsan Books, atau pilih My Ihsan Books dalam \"Buka dengan\".","Share a PDF from any app › My Ihsan Books, or pick My Ihsan Books in \"Open with\"."],
      ["Ketik tepi kiri/kanan atau leret untuk menyelak; ketik tengah untuk tunjuk/sorok bar.","Tap the left/right edge or swipe to turn pages; tap the middle to show/hide the bars."],
      ["Tekan lama pada teks untuk memilih, kemudian pilih warna serlahan, nota, salin atau baca.","Long-press text to select it, then pick a highlight colour, note, copy or read aloud."],
      ["✏️ untuk melukis, menulis, menandatangan dan menanda; 🧰 untuk menyusun halaman, borang, tukar format dan lain-lain. Simpanan menjadi PDF baharu.","✏️ to draw, write, sign and mark; 🧰 to organise pages, fill forms, convert and more. Saving makes a new PDF."]].map(function(x){ return '<li>'+esc(L2(x[0], x[1]))+'</li>'; }).join("")+'</ul>');
  }; });
}
function moreSheet(id, el){
  var b = get(id); if(!b) return;
  var ov = H.showSheet("📄 "+esc(baseName(b.name)), '<div class="bkacts">'+[["read","📖","Baca","Read"],["tools","🧰","Alat PDF","PDF tools"],["share","📤","Kongsi","Share"],["save","💾","Simpan ke peranti","Save to device"],["ren","✏️","Namakan semula","Rename"],["del","🗑️","Padam","Delete"]].map(function(x){ return '<button class="btn alt" data-ma="'+x[0]+'">'+x[1]+' '+L2(x[2], x[3])+'</button>'; }).join("")+'</div><div class="rlab">'+L2("Koleksi","Collections")+'</div><div class="rseg">'+COLS_B.concat((setOf().folders||[]).map(function(x){ return [x.id, "📁", x.n, x.n]; })).map(function(c){ return '<button class="chip'+((b.col||[]).indexOf(c[0])>=0 ? ' on' : '')+'" data-mc="'+c[0]+'">'+c[1]+' '+esc(L2(c[2], c[3]))+'</button>'; }).join("")+'</div><div class="mut tiny" style="margin-top:8px">'+fmtSize(b.size||0)+(b.pages ? ' · '+b.pages+L2(" halaman"," pages") : '')+(b.time ? ' · ⏱ '+L2("dibaca ","read for ")+fmtTime(b.time) : '')+'</div>');
  ov.querySelectorAll("[data-mc]").forEach(function(x){ x.onclick = function(){ var c = x.getAttribute("data-mc"), on = !x.classList.contains("on"); x.classList.toggle("on", on); toggleCol(b, c, on); view(el); }; });
  ov.querySelectorAll("[data-ma]").forEach(function(x){ x.onclick = function(){ var a = x.getAttribute("data-ma"); H.closeOverlay();
    if(a==="read") openBook(id); else if(a==="tools") openBook(id, "tools");
    else if(a==="share") shareFile(id, b.name, "application/pdf");
    else if(a==="save") exportFile(id, b.name, "application/pdf");
    else if(a==="ren"){ var n = prompt(L2("Nama baharu","New name"), baseName(b.name)); if(n){ b.name = n.trim()+".pdf"; put(b); view(el); } }
    else if(a==="del"){ if(confirm(L2("Padam ","Delete ")+baseName(b.name)+"?")){ delFile(id); store(list().filter(function(z){ return z.id!==id; })); view(el); } } }; });
}
function shareFile(id, name, mime){ if(native()) N().bookShare(id, name, mime); else bytesOf(id).then(function(u8){ download(u8, name, mime); }); }
function exportFile(id, name, mime){ if(native()){ var h = function(r){ H.off("booksaved", h); H.toast(r.ok ? L2("Disimpan","Saved") : L2("Tidak disimpan","Not saved")); }; H.on("booksaved", h); N().bookExport(id, name, mime); } else bytesOf(id).then(function(u8){ download(u8, name, mime); }); }
function download(u8, name, mime){ var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([u8], {type:mime})); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
function pickPdf(el){
  if(native()){ N().bookPick(); return; }
  el.querySelector("#bkFile").click();
}
function importFiles(fs){ return fs.reduce(function(p, f){ return p.then(function(){ return f.arrayBuffer().then(function(ab){ var u8 = new Uint8Array(ab); if(String.fromCharCode.apply(null, u8.subarray(0, 4))!=="%PDF"){ H.toast(f.name+L2(": bukan PDF",": not a PDF")); return; } return addBook(u8, f.name); }); }); }, Promise.resolve()).then(function(){ H.toast(fs.length+L2(" PDF ditambah"," PDFs added")); }, function(e){ H.toast(L2("Gagal menambah: ","Could not add: ")+(e && e.message || e)); }); }
// photos / scan -> PDF. 0.4.2: one scan screen for many pages (camera or gallery), with crop, rotate, reorder and delete.
var SC = null;
function pickImages(el){ scanSession(el, "gallery"); }
function scan(el){ scanSession(el, "camera"); }
function scanSession(el, first){
  SC = {el:el, pages:[], sel:-1, isScan:first==="camera"};
  if(first) scanAdd(first); else scanShow();
}
function scanAdd(mode){
  var done = function(list){ list.forEach(function(d){ if(d) SC.pages.push(d); }); SC.sel = SC.pages.length-1; scanShow(); };
  if(native() && N().pickImage){
    var go2 = function(){ var h = function(d){ H.off("image", h); if(d.cancel || !d.data){ scanShow(); return; } done([d.data]); }; H.on("image", h); N().pickImage(mode); };
    if(mode==="camera" && N().hasPerm && !N().hasPerm("camera")){ var hp = function(p){ if(p.which!=="camera") return; H.off("perm", hp); if(p.granted) go2(); else scanShow(); }; H.on("perm", hp); N().requestPerm("camera"); } else go2();
    return; }
  var inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.multiple = mode!=="camera"; if(mode==="camera") inp.setAttribute("capture", "environment"); inp.style.display = "none"; document.body.appendChild(inp);
  inp.onchange = function(){ var fs = [].slice.call(inp.files||[]); inp.remove(); Promise.all(fs.map(function(f){ return new Promise(function(r){ var fr = new FileReader(); fr.onload = function(){ r(fr.result); }; fr.readAsDataURL(f); }); })).then(done); };
  inp.click(); if(!SC.pages.length) scanShow();
}
function scanShow(){
  if(!SC) return; var P = SC.pages, sel = SC.sel;
  var ov = H.showSheet("📷 "+L2("Imbas ke PDF","Scan to PDF")+(P.length ? " · "+P.length+L2(" halaman"," pages") : ""),
    (P.length ? '<div class="bkscan">'+P.map(function(src, i){ return '<button class="bkscp'+(i===sel ? ' on' : '')+'" data-sp="'+i+'"><img src="'+src+'" alt=""><span>'+(i+1)+'</span></button>'; }).join("")+'</div>'+
      '<div class="bkorgb" style="margin:8px 0">'+[["crop","✂️","Pangkas","Crop"],["rot","↻","Putar","Rotate"],["ml","◀",""," "],["mr","▶",""," "],["del","🗑️","Padam","Delete"]].map(function(x){ return '<button class="chip" data-sa2="'+x[0]+'"'+(sel<0 ? ' disabled' : '')+'>'+x[1]+(x[2] ? ' '+L2(x[2], x[3]) : '')+'</button>'; }).join("")+'</div><div class="mut tiny" style="margin-bottom:8px">'+L2("Ketik halaman untuk memilih, kemudian pangkas, putar, alih atau padam.","Tap a page to select it, then crop, rotate, move or delete it.")+'</div>'
     : '<div class="mut small" style="margin-bottom:10px;line-height:1.5">'+L2("Ambil gambar setiap halaman satu demi satu, atau pilih daripada galeri. Semua halaman menjadi satu PDF.","Take a photo of each page one by one, or pick from the gallery. All pages become one PDF.")+'</div>')+
    '<div class="btns"><button class="btn alt" id="bkScC">📷 '+L2("Tambah halaman","Add page")+'</button><button class="btn alt" id="bkScG">🖼️ '+L2("Dari galeri","From gallery")+'</button></div>'+
    (P.length ? '<button class="btn gold full" id="bkScGo" style="margin-top:10px">✓ '+L2("Seterusnya: buat PDF","Next: make the PDF")+' ('+P.length+')</button>' : ''));
  ov.querySelector("#bkScC").onclick = function(){ scanAdd("camera"); };
  ov.querySelector("#bkScG").onclick = function(){ scanAdd("gallery"); };
  var g = ov.querySelector("#bkScGo"); if(g) g.onclick = function(){ var p = SC.pages.slice(), el = SC.el, isS = SC.isScan; SC = null; imagesToPdf(p, el, isS); };
  ov.querySelectorAll("[data-sp]").forEach(function(b){ b.onclick = function(){ var i = +b.getAttribute("data-sp"); SC.sel = SC.sel===i ? -1 : i; scanShow(); }; });
  ov.querySelectorAll("[data-sa2]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-sa2"), i = SC.sel; if(i<0) return;
    if(a==="del"){ P.splice(i, 1); SC.sel = Math.min(i, P.length-1); scanShow(); }
    else if(a==="ml" && i>0){ var t = P[i-1]; P[i-1] = P[i]; P[i] = t; SC.sel = i-1; scanShow(); }
    else if(a==="mr" && i<P.length-1){ var t2 = P[i+1]; P[i+1] = P[i]; P[i] = t2; SC.sel = i+1; scanShow(); }
    else if(a==="rot") rotImg(P[i]).then(function(d){ P[i] = d; scanShow(); });
    else if(a==="crop") cropSheet(P[i], function(d){ P[i] = d; scanShow(); }); }; });
}
function loadImg(src){ return new Promise(function(res){ var im = new Image(); im.onload = function(){ res(im); }; im.src = src; }); }
function rotImg(src){ return loadImg(src).then(function(im){ var c = document.createElement("canvas"); c.width = im.height; c.height = im.width; var x = c.getContext("2d"); x.translate(c.width, 0); x.rotate(Math.PI/2); x.drawImage(im, 0, 0); return c.toDataURL("image/jpeg", 0.9); }); }
// find the page in a photo: rows and columns that are mostly brighter than the picture's average
function autoBox(im){
  var k = 160/Math.max(im.width, im.height), w = Math.max(1, Math.round(im.width*k)), h = Math.max(1, Math.round(im.height*k)), c = document.createElement("canvas"); c.width = w; c.height = h;
  var x = c.getContext("2d"); x.drawImage(im, 0, 0, w, h); var d = x.getImageData(0, 0, w, h).data, g = new Float32Array(w*h), sum = 0, i;
  for(i=0;i<w*h;i++){ g[i] = 0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2]; sum += g[i]; }
  var thr = sum/(w*h)*1.05, rowOk = function(y){ var n = 0; for(var X=0;X<w;X++) if(g[y*w+X] > thr) n++; return n > w*0.35; }, colOk = function(X){ var n = 0; for(var y=0;y<h;y++) if(g[y*w+X] > thr) n++; return n > h*0.35; };
  var t = 0, b = h-1, l = 0, r = w-1; while(t < h-1 && !rowOk(t)) t++; while(b > t && !rowOk(b)) b--; while(l < w-1 && !colOk(l)) l++; while(r > l && !colOk(r)) r--;
  if((r-l) < w*0.3 || (b-t) < h*0.3) return [0.03, 0.03, 0.97, 0.97];
  return [l/w, t/h, (r+1)/w, (b+1)/h];
}
function cropSheet(src, cb){
  loadImg(src).then(function(im){
    var bx = autoBox(im), ov = H.showSheet("✂️ "+L2("Pangkas","Crop"), '<div class="bkcrop0" id="bkCrA"><img src="'+src+'" alt=""><div class="bkcrb" id="bkCrB">'+["tl","tr","bl","br"].map(function(k){ return '<i data-ch="'+k+'"></i>'; }).join("")+'</div></div>'+
      '<div class="btns" style="margin-top:10px"><button class="btn alt" id="bkCrAuto">🪄 '+L2("Auto","Auto")+'</button><button class="btn alt" id="bkCrAll">⬜ '+L2("Seluruh gambar","Whole picture")+'</button><button class="btn gold" id="bkCrOk">✓ '+L2("Guna","Apply")+'</button></div><div class="mut tiny" style="margin-top:6px">'+L2("Seret bucu untuk melaras.","Drag the corners to adjust.")+'</div>');
    var A = ov.querySelector("#bkCrA"), Bx = ov.querySelector("#bkCrB");
    var paint = function(){ Bx.style.left = bx[0]*100+"%"; Bx.style.top = bx[1]*100+"%"; Bx.style.width = (bx[2]-bx[0])*100+"%"; Bx.style.height = (bx[3]-bx[1])*100+"%"; }; paint();
    Bx.querySelectorAll("[data-ch]").forEach(function(hd){ hd.onpointerdown = function(e){ e.preventDefault(); e.stopPropagation(); var k = hd.getAttribute("data-ch");
      var mv = function(ev){ var r = A.getBoundingClientRect(), x = Math.max(0, Math.min(1, (ev.clientX-r.left)/r.width)), y = Math.max(0, Math.min(1, (ev.clientY-r.top)/r.height));
        if(k[1]==="l") bx[0] = Math.min(x, bx[2]-0.05); else bx[2] = Math.max(x, bx[0]+0.05); if(k[0]==="t") bx[1] = Math.min(y, bx[3]-0.05); else bx[3] = Math.max(y, bx[1]+0.05); paint(); };
      var up = function(){ document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); }; document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up); }; });
    ov.querySelector("#bkCrAuto").onclick = function(){ bx = autoBox(im); paint(); };
    ov.querySelector("#bkCrAll").onclick = function(){ bx = [0, 0, 1, 1]; paint(); };
    ov.querySelector("#bkCrOk").onclick = function(){ var c = document.createElement("canvas"), sx = bx[0]*im.width, sy = bx[1]*im.height; c.width = Math.max(1, Math.round((bx[2]-bx[0])*im.width)); c.height = Math.max(1, Math.round((bx[3]-bx[1])*im.height));
      c.getContext("2d").drawImage(im, sx, sy, c.width, c.height, 0, 0, c.width, c.height); cb(c.toDataURL("image/jpeg", 0.9)); };
  });
}
function imagesToPdf(imgs, el, isScan){
  var ov = H.showSheet("🖼️ "+L2("Jadikan PDF","Make a PDF"), '<div class="small" style="margin-bottom:8px">'+imgs.length+L2(" gambar"," pictures")+'</div><div class="bkthumbs">'+imgs.slice(0,12).map(function(s){ return '<img src="'+s+'" alt="">'; }).join("")+'</div>'+
    '<div class="rlab">'+L2("Kesan","Look")+'</div><div class="rseg"><button class="chip'+(isScan ? '' : ' on')+'" data-fx="none">'+L2("Asal","Original")+'</button><button class="chip'+(isScan ? ' on' : '')+'" data-fx="doc">'+L2("Dokumen (jelas)","Document (crisp)")+'</button><button class="chip" data-fx="grey">'+L2("Kelabu","Greyscale")+'</button><button class="chip" data-fx="bw">'+L2("Hitam putih","Black & white")+'</button></div>'+
    '<div class="rlab">'+L2("Saiz halaman","Page size")+'</div><div class="rseg"><button class="chip on" data-ps="a4">A4</button><button class="chip" data-ps="fit">'+L2("Ikut gambar","Fit picture")+'</button></div>'+
    '<label class="hfld">'+L2("Nama","Name")+'<input id="bkIName" class="rin" value="'+(isScan ? L2("Imbasan ","Scan ") : L2("Gambar ","Photos "))+new Date().toISOString().slice(0,10)+'"></label><button class="btn gold full" id="bkIGo">'+L2("Buat PDF","Make PDF")+'</button>');
  ov.querySelectorAll("[data-fx],[data-ps]").forEach(function(b){ b.onclick = function(){ var a = b.hasAttribute("data-fx") ? "data-fx" : "data-ps"; ov.querySelectorAll("["+a+"]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  ov.querySelector("#bkIGo").onclick = function(){
    var fx = ov.querySelector("[data-fx].on").getAttribute("data-fx"), ps = ov.querySelector("[data-ps].on").getAttribute("data-ps"), name = (ov.querySelector("#bkIName").value || "PDF").trim()+".pdf";
    H.closeOverlay(); H.toast(L2("Membuat PDF…","Making the PDF…"));
    pdflib().then(function(PL){ return PL.PDFDocument.create().then(function(doc){
      return imgs.reduce(function(p, src){ return p.then(function(){ return filterImg(src, fx).then(function(jpg){ return doc.embedJpg(jpg).then(function(im){
        var w = im.width, hh = im.height, pw = 595.28, ph = 841.89; if(ps==="fit"){ pw = w*0.75; ph = hh*0.75; }
        var pg = doc.addPage([pw, ph]), k = Math.min((pw-36)/w, (ph-36)/hh); if(ps==="fit") k = 0.75;
        pg.drawImage(im, {x:(pw-w*k)/2, y:(ph-hh*k)/2, width:w*k, height:hh*k}); }); }); }); }, Promise.resolve()).then(function(){ return doc.save(); }); }); })
      .then(function(u8){ return addBook(u8, name); }).then(function(){ H.toast(L2("PDF dibuat","PDF made")); if(el) view(el); else H.render(); }, function(e){ H.toast(String(e.message||e)); });
  };
}
function filterImg(src, fx){
  return new Promise(function(res){ var im = new Image(); im.onload = function(){ var k = Math.min(1, 2000/Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width*k); c.height = Math.round(im.height*k); var x = c.getContext("2d"); x.drawImage(im, 0, 0, c.width, c.height);
    if(fx!=="none"){ var d = x.getImageData(0, 0, c.width, c.height), a = d.data;
      for(var i=0;i<a.length;i+=4){ var g = 0.299*a[i]+0.587*a[i+1]+0.114*a[i+2];
        if(fx==="grey"){ a[i] = a[i+1] = a[i+2] = g; }
        else if(fx==="bw"){ var v = g > 150 ? 255 : 0; a[i] = a[i+1] = a[i+2] = v; }
        else { var f = function(v){ v = (v-40)*1.35; return v < 0 ? 0 : v > 255 ? 255 : v; }; a[i] = f(a[i]); a[i+1] = f(a[i+1]); a[i+2] = f(a[i+2]); } }
      x.putImageData(d, 0, 0); }
    fetch(c.toDataURL("image/jpeg", 0.85)).then(function(r){ return r.arrayBuffer(); }).then(function(ab){ res(new Uint8Array(ab)); }); }; im.src = src; });
}
function mergeSheet(el){
  var l = list(); if(l.length < 2){ H.toast(L2("Perlu sekurang-kurangnya 2 PDF","At least 2 PDFs are needed")); return; }
  var ov = H.showSheet("🔗 "+L2("Gabung PDF","Merge PDFs"), '<div class="mut small" style="margin-bottom:8px">'+L2("Pilih mengikut susunan:","Choose in order:")+'</div>'+l.map(function(b){ return '<button class="hhist" data-mg="'+b.id+'"><span class="bkmgn"></span><span class="hhs">'+esc(baseName(b.name))+'</span></button>'; }).join("")+'<button class="btn gold full" id="bkMgo" style="margin-top:10px">'+L2("Gabung","Merge")+'</button>');
  var order = [];
  ov.querySelectorAll("[data-mg]").forEach(function(x){ x.onclick = function(){ var id = x.getAttribute("data-mg"), i = order.indexOf(id); if(i>=0) order.splice(i,1); else order.push(id); ov.querySelectorAll("[data-mg]").forEach(function(y){ var j = order.indexOf(y.getAttribute("data-mg")); y.querySelector(".bkmgn").textContent = j>=0 ? (j+1) : ""; }); }; });
  ov.querySelector("#bkMgo").onclick = function(){ if(order.length < 2){ H.toast(L2("Pilih 2 atau lebih","Choose 2 or more")); return; } H.closeOverlay(); H.toast(L2("Menggabung…","Merging…"));
    pdflib().then(function(PL){ return PL.PDFDocument.create().then(function(out){ return order.reduce(function(p, id){ return p.then(function(){ return bytesOf(id).then(function(u8){ return PL.PDFDocument.load(u8, {ignoreEncryption:true}); }).then(function(src){ return out.copyPages(src, src.getPageIndices()).then(function(ps){ ps.forEach(function(pg){ out.addPage(pg); }); }); }); }); }, Promise.resolve()).then(function(){ return out.save(); }); }); })
      .then(function(u8){ return addBook(u8, L2("Gabungan ","Merged ")+new Date().toISOString().slice(0,10)+".pdf"); }).then(function(){ H.toast(L2("PDF digabung","PDFs merged")); view(el); }, function(e){ H.toast(String(e.message||e)); }); };
}

// ---------------- reader ----------------
var THEMES = [["day","☀️","Siang","Day"],["sepia","📜","Sepia","Sepia"],["grey","🌫","Kelabu","Grey"],["night","🌙","Malam","Night"]];
var ROTS = [["port","📱","Potret","Portrait"],["auto","🔄","Ikut telefon","Unlocked"],["land","↔️","Landskap","Landscape"]];
// 0.5.99 (owner): 📘 My Ihsan guide: the complete tutorial as a PDF, made on the first tap (per version and language), then just opened
function openGuide(el){ if(!H.guide) return; var key = H.guideKey(), have = list().filter(function(b){ return b.guide === key; })[0];
  if(have){ openBook(have.id); return; }
  if(B.gBusy) return; B.gBusy = true; H.toast(L2("Menyediakan panduan… (sekali sahaja)","Making the guide… (only the first time)"));
  H.guide().then(function(u8){ list().filter(function(b){ return b.guide; }).forEach(function(b){ delFile(b.id); store(list().filter(function(z){ return z.id!==b.id; })); });
    return addBook(u8, L2("Panduan My Ihsan","My Ihsan guide")+".pdf", {guide:key}); })
  .then(function(nb){ B.gBusy = false; view(el); openBook(nb.id); }, function(e){ B.gBusy = false; H.toast(L2("Panduan gagal dibuat","The guide could not be made")+(e && e.message ? ": "+e.message : "")); }); }
function openBook(id, then){
  var b = get(id); if(!b) return;
  var ov = document.getElementById("overlay"); ov.className = "bkov"; ov.classList.remove("hidden"); ov.onclick = null;   // drop a tap-outside handler left by an earlier sheet
  ov.innerHTML = '<div class="bkload"><div class="hspin"></div><div>'+esc(baseName(b.name))+'</div></div>';
  ov._close = closeReader;
  docOf(b).then(function(doc){
    var s = setOf();
    RD = {b:b, doc:doc, n:doc.numPages, p:Math.min(Math.max(1, b.page||1), doc.numPages), s:s, bars:true, cache:{}, edit:null, ed:b.ed||{}, sel:null, z:s.zoom||1, pm:{}, t0:Date.now()};
    if(!b.pages || b.pages!==doc.numPages){ b.pages = doc.numPages; put(b); }
    b.last = Date.now(); put(b);
    if(N().keepScreenOn) N().keepScreenOn(!!s.keep, -1);
    applyRot(); if(s.vol) volOn(true);
    window.addEventListener("resize", onResize);
    buildReader(); if(then==="tools") toolsSheet();
  }, function(e){ ov.innerHTML = '<div class="bkload"><div>⚠ '+esc(L2("PDF tidak dapat dibuka: ","The PDF could not be opened: ")+(e && e.message || e))+'</div><button class="btn alt" id="bkX0">'+L2("Tutup","Close")+'</button></div>'; ov.querySelector("#bkX0").onclick = closeReader; });
}
function closeReader(){
  if(RD){ saveProgress(); stopTts(); stopAuto(); volOn(false); try{ RD.doc.destroy(); }catch(e){} }
  window.removeEventListener("resize", onResize);
  if(N().setOrientation) N().setOrientation("portrait");
  RD = null; if(N().keepScreenOn) N().keepScreenOn(false, -1); H.closeOverlay();
  var v = document.getElementById("view"); if(v && v.querySelector(".bkhero")) view(v);
}
function saveProgress(){ if(!RD) return; var b = get(RD.b.id) || RD.b, now = Date.now();
  b.page = RD.p; b.last = now; b.hl = RD.b.hl; b.bm = RD.b.bm; b.notes = RD.b.notes; b.ed = RD.ed;
  b.time = Math.round((b.time||0) + Math.min(300, Math.max(0, (now - (RD.t0||now))/1000))); RD.t0 = now;   // reading time (gaps over 5 minutes are not counted)
  if(RD.s.autoRead && RD.n && RD.p/RD.n >= 0.95 && (b.col||[]).indexOf("read")<0){ b.col = (b.col||[]).filter(function(c){ return c!=="toread"; }).concat(["read"]); H.toast(L2("Ditanda sebagai sudah dibaca","Marked as have read")); }
  put(b); RD.b = b; }
function dbl(){ var st = document.getElementById("bkStage"); if(!st || RD.s.mode!=="page") return false; return RD.s.dbl==="on" || (RD.s.dbl==="auto" && st.clientWidth > st.clientHeight*1.15); }
function tbHtml(){ var s = RD.s; return s.tb.filter(function(k){ return s.tbOff.indexOf(k)<0; }).map(function(k){ var t = TB.filter(function(x){ return x[0]===k; })[0];
  return '<button data-r="'+k+'" id="bkTb_'+k+'"'+((k==="tts" && RD.tts) || (k==="auto" && RD.auto) || (k==="note" && RD.noteMode) ? ' class="on"' : '')+'><span>'+t[1]+'</span><small>'+L2(t[2], t[3])+'</small></button>'; }).join(""); }
function tbOn(k, on){ var b = document.getElementById("bkTb_"+k); if(b) b.classList.toggle("on", !!on); }
function buildReader(){
  var ov = document.getElementById("overlay"), s = RD.s, b = RD.b;
  ov.innerHTML = '<div class="bkr th-'+s.theme+(RD.bars ? '' : ' nobars')+'" id="bkR">'+
    '<div class="bktop"><button data-r="close">✕</button><div class="bkttl">'+esc(baseName(b.name))+'</div><button data-r="search">🔍</button><button data-r="toc">☰</button><button data-r="bm" id="bkBm">🔖</button><button data-r="tools">🧰</button></div>'+
    '<div class="bkstage m-'+s.mode+'" id="bkStage"></div><div class="bkdim" id="bkDim" style="opacity:'+(1-s.bright)*0.7+'"></div>'+
    '<div class="bkselm" id="bkSel"></div><div class="bkmini'+(s.pnum ? '' : ' off')+'" id="bkMini"></div>'+
    '<div class="bkfoot"><div class="bkEdF" id="bkEdF"><button data-r="edit" class="bkEdFab" title="'+L2("Sunting","Edit")+'">✏️</button></div><div class="bkedit" id="bkEdit"></div>'+
    '<div class="bkbot"><div class="bkrow"><button data-r="prev" class="bknav">‹</button><div class="bksl"><input type="range" id="bkSl" min="1" max="'+RD.n+'" value="'+RD.p+'"><div class="bkpn" id="bkPn"></div></div><button data-r="next" class="bknav">›</button></div><div class="bktb">'+tbHtml()+'</div></div></div></div>';
  ov.querySelectorAll("[data-r]").forEach(function(x){ x.onclick = function(e){ e.stopPropagation(); readerAct(x.getAttribute("data-r")); }; });
  var sl = ov.querySelector("#bkSl"); sl.oninput = function(){ ov.querySelector("#bkPn").textContent = sl.value+" / "+RD.n; }; sl.onchange = function(){ go(+sl.value, 0); };
  stageEvents(ov.querySelector("#bkStage"));
  draw(0); updateBar();
  if(RD.tts) ttsPanel(); if(RD.auto) autoPanel();
}
function updateBar(){ var pn = document.getElementById("bkPn"), sl = document.getElementById("bkSl"), bm = document.getElementById("bkBm"), mi = document.getElementById("bkMini"); if(!pn) return;
  var two = dbl() && RD.p < RD.n && RD.p > 1, t = (two ? RD.p+"–"+(RD.p+1) : RD.p)+" / "+RD.n; pn.textContent = t+" · "+Math.round(RD.p*100/RD.n)+"%"; sl.value = RD.p; bm.classList.toggle("on", (RD.b.bm||[]).indexOf(RD.p)>=0); if(mi) mi.textContent = t; }
// ---- page model: text, where each text item sits in it, and sentences (for read-aloud highlighting) ----
function pageModel(n){
  if(RD.pm[n]) return RD.pm[n];
  RD.pm[n] = RD.doc.getPage(n).then(function(pg){ return pg.getTextContent(); }).then(function(tc){
    var out = "", lastY = null, its = [];
    tc.items.forEach(function(it){ var y = it.transform ? it.transform[5] : 0; if(lastY!==null && Math.abs(y-lastY) > (it.height||10)*1.6) out += "\n\n"; else if(lastY!==null && Math.abs(y-lastY) > 1) out += "\n";
      its.push([out.length, out.length+(it.str||"").length]); out += it.str||""; if(it.hasEOL) out += "\n"; lastY = y; });
    return {tc:tc, text:out, its:its, sents:sentences(out)}; });
  return RD.pm[n];
}
function sentences(text){
  var out = [], a = 0, push = function(b){ var raw = text.slice(a, b), lead = raw.length - raw.replace(/^\s+/, "").length, t = raw.trim(); if(t && /[\wÀ-￿]/.test(t)) out.push({a:a+lead, b:a+lead+t.length, t:text.slice(a+lead, a+lead+t.length).replace(/\s/g, " ")}); a = b; };
  for(var i=0;i<text.length;i++){ var ch = text[i];
    if(ch==="\n" && text[i+1]==="\n"){ push(i); continue; }
    if(/[.!?。؟]/.test(ch) && (i+1>=text.length || /[\s"'”’)\]]/.test(text[i+1]))) push(i+1);
    else if(i-a > 280 && /[\s,;:]/.test(ch)) push(i+1); }
  push(text.length); return out;
}
function pageText(n){ return pageModel(n).then(function(m){ return m.text.replace(/[ \t]+\n/g, "\n").trim(); }); }
// render one page into a sheet element (canvas + text layer + highlights + edits)
function pageEl(n, w, h){
  var d = document.createElement("div"); d.className = "bkpg"; d.setAttribute("data-pg", n); d.style.width = w+"px"; d.style.height = h+"px";
  RD.doc.getPage(n).then(function(pg){
    var v0 = pg.getViewport({scale:1}), sc = w/v0.width, vp = pg.getViewport({scale:sc}), dpr = Math.min(RD.z > 1.5 ? 3 : 2, window.devicePixelRatio||1);
    if(vp.width*vp.height*dpr*dpr > 16e6) dpr = Math.max(1, Math.sqrt(16e6/(vp.width*vp.height)));   // keep very large zooms within the canvas limit
    var c = document.createElement("canvas"); c.width = Math.round(vp.width*dpr); c.height = Math.round(vp.height*dpr); c.style.width = vp.width+"px"; c.style.height = vp.height+"px";
    d.appendChild(c); d._cv = c; d.style.setProperty("--scale-factor", sc);
    pg.render({canvasContext:c.getContext("2d"), viewport:vp, transform:dpr!==1 ? [dpr,0,0,dpr,0,0] : null}).promise.then(function(){
      var tl = document.createElement("div"); tl.className = "textLayer"; d.appendChild(tl);
      pageModel(n).then(function(m){ var divs = [], task = null; try{ task = PDFJS.renderTextLayer({textContentSource:m.tc, container:tl, viewport:vp, textDivs:divs}); }catch(e){}
        var fin = function(){ d._tdivs = divs; d._m = m; if(RD && RD.flash && RD.flash.p===n) flashText(d, RD.flash.q); if(RD && RD.tts && RD.tts.p===n) reMark(); };
        if(task && task.promise) task.promise.then(fin, fin); else fin(); });
      overlayPage(d, n);
    }).catch(function(){});
  });
  return d;
}
function cropK(){ return 1 - 2*(RD.s.crop||0); }
// crop margins: the whole page is drawn larger inside a clipping box, so page coordinates (highlights, edits) stay the same
function sheetEl(n, w, h){ var m = RD.s.crop||0, pg = pageEl(n, w, h); if(!m) return pg;
  var c = document.createElement("div"); c.className = "bkclip"; c.style.width = Math.floor(w*(1-2*m))+"px"; c.style.height = Math.floor(h*(1-2*m))+"px";
  pg.style.position = "absolute"; pg.style.left = -Math.round(w*m)+"px"; pg.style.top = -Math.round(h*m)+"px"; c.appendChild(pg); return c; }
function pageSize(n){ return RD.doc.getPage(n).then(function(pg){ var v = pg.getViewport({scale:1}); return [v.width, v.height]; }); }
// draw the current page(s); dir: +1 next, -1 previous, 0 jump
function draw(dir){
  var st = document.getElementById("bkStage"); if(!st) return;
  var s = RD.s, W = st.clientWidth, Hh = st.clientHeight; RD.lw = W; RD.lh = Hh;
  if(s.mode==="scroll"){ drawScroll(st); return; }
  if(s.mode==="text"){ drawText(st); return; }
  var two = dbl(), ps = [RD.p];
  if(two){ if(RD.p > 1 && RD.p % 2===1) RD.p--; ps = RD.p===1 ? [1] : [RD.p, RD.p+1].filter(function(x){ return x<=RD.n; }); }
  Promise.all(ps.map(pageSize)).then(function(sz){
    if(!RD) return;
    var spread = document.createElement("div"); spread.className = "bkspread";
    sz.forEach(function(z, i){ var k = cropK(), avW = two ? W/2 : W, sc = s.fit==="width" ? avW/(z[0]*k) : Math.min(avW/(z[0]*k), Hh/(z[1]*k)); sc *= RD.z; spread.appendChild(sheetEl(ps[i], Math.floor(z[0]*sc), Math.floor(z[1]*sc))); });
    var old = st.querySelector(".bkspread");
    st.appendChild(spread);
    if(old && dir && s.anim!=="none" && RD.z <= 1.01){
      spread.classList.add("bkin"); old.classList.add("bkout", s.anim==="flip" ? (dir>0 ? "flipn" : "flipp") : (dir>0 ? "slidn" : "slidp")); spread.classList.add(s.anim==="flip" ? "inflip" : (dir>0 ? "insn" : "insp"));
      setTimeout(function(){ if(old.parentNode) old.remove(); spread.classList.remove("bkin","inflip","insn","insp"); }, 420);
    } else st.querySelectorAll(".bkspread").forEach(function(x){ if(x!==spread) x.remove(); });
    st.scrollTop = 0; updateBar(); saveProgressSoon();
    if(RD.afterDraw){ var f = RD.afterDraw; RD.afterDraw = null; f(spread); }
  });
}
var progT = null; function saveProgressSoon(){ clearTimeout(progT); progT = setTimeout(saveProgress, 800); }
function go(n, dir){
  n = Math.max(1, Math.min(RD.n, n));
  if(RD.tts && RD.tts.p!==n && !RD.tts.moving){ RD.tts.p = n; RD.tts.i = 0; ttsRestart(); }
  if(RD.s.mode==="scroll"){ var t = document.querySelector('.bkscroll [data-ph="'+n+'"]'); RD.p = n; if(t) t.scrollIntoView({block:"start"}); updateBar(); return; }
  if(n===RD.p && dir) return;
  var old = RD.p; RD.p = n; draw(dir==null ? (n > old ? 1 : -1) : dir);
}
function next(){ var two = dbl(); if(RD.s.mode==="scroll"){ go(RD.p+1); return; } if(RD.p>=RD.n){ H.toast(L2("Halaman terakhir","Last page")); return; } go(RD.p + (two && RD.p>1 ? 2 : 1), 1); }
function prev(){ var two = dbl(); if(RD.s.mode==="scroll"){ go(RD.p-1); return; } if(RD.p<=1) return; go(RD.p - (two && RD.p>2 ? 2 : 1), -1); }
function drawScroll(st){
  if(RD.io) try{ RD.io.disconnect(); }catch(e){}
  st.innerHTML = '<div class="bkscroll"></div>'; var box = st.firstChild, W = st.clientWidth - 16, k = cropK(), wc = Math.floor(W*RD.z), wf = wc/k;
  pageSize(1).then(function(z1){
    if(!RD) return;
    for(var i=1;i<=RD.n;i++){ var ph = document.createElement("div"); ph.className = "bkph"; ph.setAttribute("data-ph", i); ph.style.width = wc+"px"; ph.style.height = Math.floor(wf*z1[1]/z1[0]*k)+"px"; box.appendChild(ph); }
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ var n = +e.target.getAttribute("data-ph");
      if(e.isIntersecting && !e.target.firstChild){ pageSize(n).then(function(z){ var hh = Math.floor(wf*z[1]/z[0]); e.target.style.height = Math.floor(hh*k)+"px"; e.target.appendChild(sheetEl(n, Math.floor(wf), hh)); }); } }); }, {root:st, rootMargin:"800px 0px"});
    box.querySelectorAll(".bkph").forEach(function(x){ io.observe(x); }); RD.io = io;
    var t = box.querySelector('[data-ph="'+RD.p+'"]'); if(t) st.scrollTop = t.offsetTop;
    if(RD.afterDraw){ var f = RD.afterDraw; RD.afterDraw = null; f(st); }
    st.onscroll = function(){ if(!RD) return; var mid = st.scrollTop + st.clientHeight/3, best = RD.p; box.querySelectorAll(".bkph").forEach(function(x){ if(x.offsetTop <= mid) best = +x.getAttribute("data-ph"); }); if(best!==RD.p){ RD.p = best; updateBar(); saveProgressSoon(); } };
  });
}
function drawText(st){
  st.innerHTML = '<div class="bktext" style="font-size:'+RD.s.fs+'px"><div class="mut tiny">'+L2("Mod teks (aliran semula). Gambar dan susun atur tidak ditunjukkan. Cubit untuk saiz teks.","Text mode (reflow). Pictures and layout are not shown. Pinch to change the text size.")+'</div><div id="bkTx">…</div></div>';
  var p = RD.p;
  pageModel(p).then(function(m){ var x = document.getElementById("bkTx"); if(!x || !RD || RD.p!==p) return; var h = "<p>", last = 0;
    m.sents.forEach(function(sn, k){ if(k && /\n\s*\n/.test(m.text.slice(last, sn.a))) h += "</p><p>"; h += '<span class="bks" data-si="'+k+'">'+esc(sn.t)+'</span> '; last = sn.b; });
    x.innerHTML = h+"</p>"; if(RD.tts && RD.tts.p===p) reMark(); });
  st.scrollTop = 0; updateBar(); saveProgressSoon();
}
// ---- zoom (pinch, double tap) ----
function scroller(){ var st = document.getElementById("bkStage"); if(!st) return null; return RD.s.mode==="page" ? (st.querySelector(".bkspread:last-child") || st.querySelector(".bkspread")) : st; }
function zoomPoint(cx, cy){ var sc = scroller(); if(!sc) return null; var r = sc.getBoundingClientRect(); return {sc:sc, cx:cx, cy:cy, nx:cx, ny:cy, fx:(sc.scrollLeft + cx - r.left)/Math.max(1, sc.scrollWidth), fy:(sc.scrollTop + cy - r.top)/Math.max(1, sc.scrollHeight)}; }
function zoomAt(z, p){
  z = Math.max(1, Math.min(6, z));
  if(Math.abs(z - RD.z) < 0.02){ if(p && p.sc){ p.sc.scrollLeft -= (p.nx - p.cx); p.sc.scrollTop -= (p.ny - p.cy); } return; }
  RD.z = z;
  if(p) RD.afterDraw = function(){ var sc = scroller(); if(!sc) return; var r = sc.getBoundingClientRect(); sc.scrollLeft = p.fx*sc.scrollWidth - (p.nx - r.left); sc.scrollTop = p.fy*sc.scrollHeight - (p.ny - r.top); };
  var st = document.getElementById("bkStage"); if(RD.s.mode==="scroll") drawScroll(st); else draw(0);
  var mi = document.getElementById("bkZm"); if(!mi){ mi = document.createElement("div"); mi.id = "bkZm"; mi.className = "bkzm"; document.getElementById("bkR").appendChild(mi); }
  mi.textContent = Math.round(z*100)+"%"; mi.classList.add("on"); clearTimeout(mi._t); mi._t = setTimeout(function(){ mi.classList.remove("on"); }, 900);
}
var rsT = null;
function onResize(){ clearTimeout(rsT); rsT = setTimeout(function(){ if(!RD) return; var st = document.getElementById("bkStage"); if(!st || (st.clientWidth===RD.lw && st.clientHeight===RD.lh)) return;
  RD.lw = st.clientWidth; RD.lh = st.clientHeight; if(RD.s.mode==="page") draw(0); else if(RD.s.mode==="scroll") drawScroll(st); updateBar(); }, 200); }
function stageEvents(st){
  var sx = 0, sy = 0, t0 = 0, moved = false, pz = null, lastTap = 0, tapT = null, sl0 = 0, sw0 = 0;
  var dist = function(a, b){ return Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY) || 1; };
  st.addEventListener("touchstart", function(e){
    if(e.touches.length===2){ var a = e.touches[0], b = e.touches[1]; t0 = 0; if(RD.edit) cancelStroke();
      if(RD.s.mode==="text"){ pz = {d:dist(a, b), fs:RD.s.fs, text:true}; return; }
      var p = zoomPoint((a.clientX+b.clientX)/2, (a.clientY+b.clientY)/2); if(!p) return;
      p.tg = RD.s.mode==="page" ? p.sc : st.querySelector(".bkscroll"); if(!p.tg) return; var tr = p.tg.getBoundingClientRect();
      p.tg.style.transformOrigin = (p.cx - tr.left)+"px "+(p.cy - tr.top)+"px"; p.d = dist(a, b); p.k = 1; pz = p; return; }
    if(RD.edit || e.touches.length > 2) return; var t = e.touches[0]; sx = t.clientX; sy = t.clientY; t0 = Date.now(); moved = false;
    var sc = scroller(); sl0 = sc ? sc.scrollLeft : 0; sw0 = sc ? sc.scrollWidth - sc.clientWidth : 0;
  }, {passive:true});
  st.addEventListener("touchmove", function(e){ if(!pz || e.touches.length < 2) return; e.preventDefault(); var a = e.touches[0], b = e.touches[1], d = dist(a, b);
    if(pz.text){ var fs = Math.max(12, Math.min(44, Math.round(pz.fs*d/pz.d))); if(fs!==RD.s.fs){ RD.s.fs = fs; var tx = st.querySelector(".bktext"); if(tx) tx.style.fontSize = fs+"px"; } return; }
    pz.k = Math.max(1/RD.z, Math.min(6/RD.z, d/pz.d)); pz.nx = (a.clientX+b.clientX)/2; pz.ny = (a.clientY+b.clientY)/2;
    pz.tg.style.transform = "translate("+(pz.nx-pz.cx)+"px,"+(pz.ny-pz.cy)+"px) scale("+pz.k+")"; }, {passive:false});
  var endPinch = function(){ var p = pz; pz = null; if(p.text){ saveSet(RD.s); return; } p.tg.style.transform = ""; zoomAt(RD.z*p.k, p); };
  st.addEventListener("touchcancel", function(){ if(pz) endPinch(); }, {passive:true});
  st.addEventListener("touchend", function(e){
    if(pz){ if(e.touches.length < 2) endPinch(); return; }
    if(RD.edit || RD.s.mode==="scroll" || !t0) return; var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)*1.5 && Date.now()-t0 < 700 && !(window.getSelection()+"")){
      if(RD.z > 1.01 && sw0 > 2 && ((dx < 0 && sl0 < sw0-2) || (dx > 0 && sl0 > 1))) return;   // zoomed in: swipe pans until the edge of the page
      moved = true; if(dx < 0) next(); else prev(); } }, {passive:true});
  var toggleBars = function(){ RD.bars = !RD.bars; document.getElementById("bkR").classList.toggle("nobars", !RD.bars); };
  st.addEventListener("click", function(e){
    if(RD.edit || moved){ moved = false; return; }
    if(window.getSelection && String(window.getSelection())) return;
    if(RD.auto){ autoPause(); return; }
    var pin = e.target.closest(".bkpin"); if(pin){ noteTap(pin.getAttribute("data-nt")); return; }
    if(RD.noteMode){ placeNote(e); return; }
    if(e.target.closest(".bkhl")){ hlTap(e.target.closest(".bkhl").getAttribute("data-hl")); return; }
    var sn = e.target.closest(".bks"); if(sn && RD.tts){ RD.tts.i = +sn.getAttribute("data-si"); ttsRestart(); return; }
    var r = st.getBoundingClientRect(), w = r.width, hh = r.height, x = e.clientX - r.left, y = e.clientY - r.top, tz = RD.s.mode==="scroll" ? "off" : RD.s.tz, zone = "mid";
    if(tz==="lr") zone = x < w*0.28 ? "prev" : x > w*0.72 ? "next" : "mid";
    else if(tz==="all") zone = x < w*0.2 ? "prev" : (Math.abs(x-w/2) < w*0.18 && Math.abs(y-hh/2) < hh*0.15) ? "mid" : "next";
    if(zone==="prev"){ prev(); return; } if(zone==="next"){ next(); return; }
    if(RD.s.dtz && RD.s.mode!=="text"){ var now = Date.now();
      if(now - lastTap < 300){ clearTimeout(tapT); lastTap = 0; zoomAt(RD.z > 1.05 ? 1 : 2.5, zoomPoint(e.clientX, e.clientY)); return; }
      lastTap = now; clearTimeout(tapT); tapT = setTimeout(toggleBars, 280); return; }
    toggleBars();
  });
  document.addEventListener("selectionchange", selChanged);
}
function readerAct(a){
  if(a==="close"){ closeReader(); return; }
  if(a==="prev"){ prev(); return; } if(a==="next"){ next(); return; }
  if(a==="bm"){ var l = RD.b.bm = RD.b.bm || [], i = l.indexOf(RD.p); if(i>=0) l.splice(i,1); else { l.push(RD.p); l.sort(function(x, y){ return x-y; }); } saveProgress(); updateBar(); H.toast(i>=0 ? L2("Penanda buku dibuang","Bookmark removed") : L2("Penanda buku ditambah","Bookmarked")); return; }
  if(a==="aa"){ aaSheet(); return; } if(a==="view"){ viewSheet(); return; } if(a==="toc"){ tocSheet(); return; } if(a==="search"){ searchSheet(); return; }
  if(a==="tts"){ if(RD.tts) stopTts(); else ttsStart(RD.p, 0); return; }
  if(a==="rot"){ cycleRot(); return; }
  if(a==="auto"){ if(RD.auto) stopAuto(); else startAuto(); return; }
  if(a==="note"){ RD.noteMode = !RD.noteMode; tbOn("note", RD.noteMode); if(RD.noteMode) H.toast(L2("Ketik di mana-mana pada halaman untuk meletak nota","Tap anywhere on the page to place a note")); return; }
  if(a==="full"){ RD.bars = false; document.getElementById("bkR").classList.add("nobars"); H.toast(L2("Ketik tengah skrin untuk menu","Tap the middle of the screen for the menus")); return; }
  if(a==="set"){ setSheet(); return; } if(a==="org"){ orgSheet(); return; }
  if(a==="edit"){ startEdit(); return; } if(a==="tools"){ toolsSheet(); return; }
}
function sheet(title, body){ var ov = document.getElementById("overlay"), sh = document.createElement("div"); sh.className = "bksheet"; sh.innerHTML = '<div class="sheet"><div class="row"><h3 style="margin:0">'+title+'</h3><button class="chip" data-x="1">✕</button></div><div class="shb">'+body+'</div></div>'; ov.appendChild(sh);
  var close = function(){ sh.remove(); ov._close = closeReader; }; sh.querySelector("[data-x]").onclick = close; sh.onclick = function(e){ if(e.target===sh) close(); }; ov._close = close; sh._close = close; return sh; }
function segOf(s, k, list, attr){ return '<div class="rseg">'+list.map(function(o){ return '<button class="chip'+(String(s[k])===o[0] ? ' on' : '')+'" data-'+(attr||"as")+'="'+k+'" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join("")+'</div>'; }
function aaSheet(){
  var s = RD.s, seg = function(k, list){ return segOf(s, k, list); };
  var sh = sheet("Aa "+L2("Teks & paparan","Text & display"), '<div class="rlab">'+L2("Mod","Mode")+'</div>'+seg("mode", [["page",L2("Halaman","Pages")],["scroll",L2("Tatal menegak","Vertical scroll")],["text",L2("Teks","Text")]])+
    '<div class="rlab">'+L2("Dua halaman","Two pages")+'</div>'+seg("dbl", [["auto",L2("Auto (landskap)","Auto (landscape)")],["on",L2("Hidup","On")],["off",L2("Tutup","Off")]])+
    '<div class="rlab">'+L2("Animasi selak","Page turn")+'</div>'+seg("anim", [["flip",L2("Selak buku","Book flip")],["slide",L2("Gelongsor","Slide")],["none",L2("Tiada","None")]])+
    '<div class="rlab">'+L2("Muat","Fit")+'</div>'+seg("fit", [["page",L2("Halaman penuh","Whole page")],["width",L2("Lebar","Width")]])+
    '<div class="rlab">Zoom <span class="mut tiny">'+L2("(atau cubit / ketik dua kali)","(or pinch / double-tap)")+'</span></div>'+seg("zoom", [["1","100%"],["1.5","150%"],["2","200%"],["3","300%"]])+
    '<div class="rlab">'+L2("Pangkas jidar","Crop margins")+'</div>'+seg("crop", [["0",L2("Tiada","Off")],["0.04",L2("Kecil","Small")],["0.08",L2("Sederhana","Medium")],["0.12",L2("Besar","Large")]])+
    '<div class="rlab">'+L2("Warna","Colour")+'</div><div class="rseg">'+THEMES.map(function(t){ return '<button class="chip'+(s.theme===t[0] ? ' on' : '')+'" data-as="theme" data-v="'+t[0]+'">'+t[1]+' '+L2(t[2], t[3])+'</button>'; }).join("")+'</div>'+
    '<div class="rlab">'+L2("Kecerahan","Brightness")+'</div><input type="range" id="bkBr" min="0.3" max="1" step="0.05" value="'+s.bright+'" style="width:100%">'+
    (s.mode==="text" ? '<div class="rlab">'+L2("Saiz teks","Text size")+'</div><input type="range" id="bkFs" min="12" max="44" value="'+s.fs+'" style="width:100%">' : ''));
  bindDisp(sh, aaSheet);
}
function viewSheet(){
  var s = RD.s;
  var sh = sheet("🎨 "+L2("Paparan","View"), '<div class="rlab">'+L2("Warna","Colour")+'</div><div class="rseg">'+THEMES.map(function(t){ return '<button class="chip'+(s.theme===t[0] ? ' on' : '')+'" data-as="theme" data-v="'+t[0]+'">'+t[1]+' '+L2(t[2], t[3])+'</button>'; }).join("")+'</div>'+
    '<div class="rlab">'+L2("Kecerahan","Brightness")+'</div><input type="range" id="bkBr" min="0.3" max="1" step="0.05" value="'+s.bright+'" style="width:100%">'+
    '<div class="rlab">'+L2("Mod","Mode")+'</div>'+segOf(s, "mode", [["page",L2("Halaman","Pages")],["scroll",L2("Tatal","Scroll")],["text",L2("Teks","Text")]])+
    '<div class="rlab">'+L2("Animasi selak","Page turn")+'</div>'+segOf(s, "anim", [["flip",L2("Selak buku","Book flip")],["slide",L2("Gelongsor","Slide")],["none",L2("Tiada","None")]]));
  bindDisp(sh, viewSheet);
}
function bindDisp(sh, again){
  var s = RD.s;
  sh.querySelectorAll("[data-as]").forEach(function(x){ x.onclick = function(){ var k = x.getAttribute("data-as"), v = x.getAttribute("data-v"); s[k] = (k==="zoom" || k==="crop") ? +v : v; if(k==="zoom") RD.z = +v; saveSet(s); sh._close(); buildReader(); again(); }; });
  sh.querySelector("#bkBr").oninput = function(){ s.bright = +this.value; saveSet(s); document.getElementById("bkDim").style.opacity = (1-s.bright)*0.7; };
  var fs = sh.querySelector("#bkFs"); if(fs) fs.oninput = function(){ s.fs = +this.value; saveSet(s); var t = document.querySelector(".bktext"); if(t) t.style.fontSize = s.fs+"px"; };
}
// ---- rotation (reader only; the rest of the app stays portrait) ----
function applyRot(){ if(N().setOrientation) N().setOrientation(RD.s.rot==="auto" ? "sensor" : RD.s.rot==="land" ? "landscape" : "portrait"); }
function cycleRot(){ var i = ROTS.map(function(r){ return r[0]; }).indexOf(RD.s.rot), r = ROTS[(i+1) % ROTS.length]; RD.s.rot = r[0]; saveSet(RD.s); applyRot();
  H.toast(r[1]+" "+L2("Orientasi: ","Orientation: ")+L2(r[2], r[3])+(N().setOrientation ? "" : L2(" (dalam aplikasi telefon)"," (in the phone app)"))); }
// ---- volume keys turn pages ----
function volOn(on){ if(!RD) return; if(N().setVolumeKeys) N().setVolumeKeys(!!on);
  if(on && !RD.volH){ RD.volH = function(d){ if(!RD || RD.edit) return; if(d && d.k==="up") prev(); else next(); }; H.on("volkey", RD.volH); }
  else if(!on && RD.volH){ H.off("volkey", RD.volH); RD.volH = null; } }
// ---- reader settings ----
function setSheet(){
  var s = RD.s, tog = function(k, ms, en){ return '<label class="pdchk"><input type="checkbox" data-sk="'+k+'"'+(s[k] ? ' checked' : '')+'> '+L2(ms, en)+'</label>'; };
  var sh = sheet("⚙ "+L2("Tetapan pembaca","Reader settings"),
    '<div class="rlab">'+L2("Zon ketik","Tap zones")+'</div>'+segOf(s, "tz", [["lr",L2("Kiri ‹ · Kanan ›","Left ‹ · Right ›")],["all",L2("Ketik mana-mana ›","Tap anywhere ›")],["off",L2("Tutup","Off")]], "ss")+
    '<div class="rlab">'+L2("Kelajuan bacaan suara","Read-aloud speed")+'</div>'+segOf(s, "rate", [["0.75","0.75×"],["1","1×"],["1.25","1.25×"],["1.5","1.5×"],["2","2×"]], "ss")+
    '<div class="rlab">'+L2("Kelajuan auto tatal","Autoscroll speed")+'</div>'+segOf(s, "autoV", [["20",L2("Perlahan","Slow")],["40",L2("Sederhana","Medium")],["80",L2("Laju","Fast")],["140",L2("Sangat laju","Very fast")]], "ss")+
    '<div class="rlab">'+L2("Putaran","Rotation")+'</div>'+segOf(s, "rot", ROTS.map(function(r){ return [r[0], r[1]+" "+L2(r[2], r[3])]; }), "ss")+
    tog("vol","Butang kelantangan menyelak halaman","Volume buttons turn pages")+tog("dtz","Ketik dua kali untuk zum","Double-tap to zoom")+tog("keep","Skrin sentiasa hidup semasa membaca","Keep the screen on while reading")+
    tog("pnum","Nombor halaman apabila menu disembunyikan","Page number when the menus are hidden")+tog("autoRead","Tanda \"Sudah baca\" secara automatik pada 95%","Mark as \"Have read\" automatically at 95%"));
  sh.querySelectorAll("[data-ss]").forEach(function(x){ x.onclick = function(){ var k = x.getAttribute("data-ss"), v = x.getAttribute("data-v"); s[k] = (k==="rate" || k==="autoV") ? +v : v; saveSet(s);
    if(k==="rot") applyRot(); if(k==="autoV" && RD.auto) RD.auto.v = s.autoV; sh.querySelectorAll('[data-ss="'+k+'"]').forEach(function(y){ y.classList.toggle("on", y===x); }); }; });
  sh.querySelectorAll("[data-sk]").forEach(function(x){ x.onchange = function(){ var k = x.getAttribute("data-sk"); s[k] = x.checked; saveSet(s);
    if(k==="vol") volOn(s.vol); if(k==="keep" && N().keepScreenOn) N().keepScreenOn(!!s.keep, -1); if(k==="pnum"){ var mi = document.getElementById("bkMini"); if(mi) mi.classList.toggle("off", !s.pnum); } }; });
}
// ---- organise the bottom toolbar ----
function orgSheet(){
  var s = RD.s, sh = sheet("✎ "+L2("Susun bar alat","Organise the toolbar"), '<div class="mut tiny" style="margin-bottom:6px">'+L2("Alih dengan ▲ ▼, sorok dengan kotak semak.","Move with ▲ ▼, hide with the tick box.")+'</div><div id="bkOrgL"></div>');
  var paint = function(){ sh.querySelector("#bkOrgL").innerHTML = s.tb.map(function(k, i){ var t = TB.filter(function(x){ return x[0]===k; })[0];
    return '<div class="bkorow"><input type="checkbox" data-ot="'+k+'"'+(s.tbOff.indexOf(k)<0 ? ' checked' : '')+(k==="org" ? ' disabled' : '')+'><span class="bkoic">'+t[1]+'</span><span class="hhs">'+L2(t[2], t[3])+'</span><button class="chip" data-ou="'+i+'">▲</button><button class="chip" data-od="'+i+'">▼</button></div>'; }).join("");
    sh.querySelectorAll("[data-ot]").forEach(function(x){ x.onchange = function(){ var k = x.getAttribute("data-ot"); s.tbOff = s.tbOff.filter(function(y){ return y!==k; }); if(!x.checked) s.tbOff.push(k); done(); }; });
    sh.querySelectorAll("[data-ou],[data-od]").forEach(function(x){ x.onclick = function(){ var up = x.hasAttribute("data-ou"), i = +x.getAttribute(up ? "data-ou" : "data-od"), j = up ? i-1 : i+1; if(j<0 || j>=s.tb.length) return; var t = s.tb[i]; s.tb[i] = s.tb[j]; s.tb[j] = t; done(); paint(); }; }); };
  var done = function(){ saveSet(s); var tb = document.querySelector(".bktb"); if(tb){ tb.innerHTML = tbHtml(); tb.querySelectorAll("[data-r]").forEach(function(x){ x.onclick = function(e){ e.stopPropagation(); readerAct(x.getAttribute("data-r")); }; }); } };
  paint();
}
function tocSheet(){
  var sh = sheet("☰ "+L2("Kandungan","Contents"), '<div class="rseg" style="margin-bottom:8px"><button class="chip on" data-tt="toc">'+L2("Bab","Chapters")+'</button><button class="chip" data-tt="bm">🔖 '+L2("Penanda","Bookmarks")+'</button><button class="chip" data-tt="hl">🖍 '+L2("Serlahan","Highlights")+'</button><button class="chip" data-tt="nt">💬 '+L2("Nota","Notes")+'</button></div><div id="bkTocB" class="bktoc">…</div>');
  var show = function(t){ sh.querySelectorAll("[data-tt]").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-tt")===t); }); var box = sh.querySelector("#bkTocB");
    if(t==="bm"){ var l = RD.b.bm||[]; box.innerHTML = l.length ? l.map(function(p){ return '<button class="hhist" data-gp="'+p+'">🔖 <span class="hhs">'+L2("Halaman ","Page ")+p+'</span></button>'; }).join("") : '<div class="mut small">'+L2("Tiada penanda. Tekan 🔖 di atas.","No bookmarks. Tap 🔖 at the top.")+'</div>'; bindGo(); return; }
    if(t==="nt"){ var ns = (RD.b.notes||[]).slice().sort(function(a, b){ return a.p-b.p; }); box.innerHTML = ns.length ? ns.map(function(x){ return '<button class="hhist" data-gp="'+x.p+'">💬 <span class="hhs">'+esc(x.tx)+'</span><span class="mut tiny">'+x.p+'</span></button>'; }).join("") : '<div class="mut small">'+L2("Tiada nota. Tekan 💬 Nota di bawah, kemudian ketik halaman.","No notes. Tap 💬 Add note below, then tap the page.")+'</div>'; bindGo(); return; }
    if(t==="hl"){ var h = RD.b.hl||[]; box.innerHTML = h.length ? h.slice().sort(function(a, b){ return a.p-b.p; }).map(function(x){ return '<button class="hhist" data-gp="'+x.p+'"><span class="bkdot c-'+x.c+'"></span><span class="hhs">'+esc(x.tx||"")+(x.note ? '<br><small class="mut">📝 '+esc(x.note)+'</small>' : '')+'</span><span class="mut tiny">'+x.p+'</span></button>'; }).join("")+'<button class="btn alt full" id="bkHlSh" style="margin-top:8px">📤 '+L2("Kongsi semua serlahan","Share all highlights")+'</button>' : '<div class="mut small">'+L2("Tiada serlahan. Tekan lama pada teks untuk menyerlah.","No highlights. Long-press text to highlight it.")+'</div>'; bindGo();
      var hs = box.querySelector("#bkHlSh"); if(hs) hs.onclick = function(){ var t2 = baseName(RD.b.name)+"\n\n"+h.map(function(x){ return "p."+x.p+": “"+x.tx+"”"+(x.note ? "\n   📝 "+x.note : ""); }).join("\n\n"); if(N().shareText) N().shareText(t2); else { try{ navigator.clipboard.writeText(t2); }catch(e){} H.toast(L2("Disalin","Copied")); } }; return; }
    RD.doc.getOutline().then(function(o){ if(!o || !o.length){ box.innerHTML = '<div class="mut small">'+L2("PDF ini tiada senarai bab.","This PDF has no chapter list.")+'</div>'; return; }
      var flat = []; var walk = function(l, d){ l.forEach(function(x){ flat.push({t:x.title, dest:x.dest, d:d}); if(x.items && d < 3) walk(x.items, d+1); }); }; walk(o, 0);
      box.innerHTML = flat.map(function(x, i){ return '<button class="hhist" data-oi="'+i+'" style="padding-left:'+(4+x.d*14)+'px"><span class="hhs">'+esc(x.t)+'</span></button>'; }).join("");
      box.querySelectorAll("[data-oi]").forEach(function(b){ b.onclick = function(){ var d = flat[+b.getAttribute("data-oi")].dest; (typeof d==="string" ? RD.doc.getDestination(d) : Promise.resolve(d)).then(function(dd){ return dd && dd[0] ? RD.doc.getPageIndex(dd[0]) : null; }).then(function(ix){ if(ix!=null){ sh._close(); go(ix+1, 0); } }); }; }); }); };
  var bindGo = function(){ sh.querySelectorAll("[data-gp]").forEach(function(b){ b.onclick = function(){ sh._close(); go(+b.getAttribute("data-gp"), 0); }; }); };
  sh.querySelectorAll("[data-tt]").forEach(function(x){ x.onclick = function(){ show(x.getAttribute("data-tt")); }; });
  show("toc");
}
function searchSheet(){
  var sh = sheet("🔍 "+L2("Cari dalam PDF","Search the PDF"), '<div class="radd"><input id="bkSq" class="rin" placeholder="'+L2("Perkataan…","Words…")+'" value="'+esc(RD.lastQ||"")+'"><button class="btn gold" id="bkSgo">'+L2("Cari","Find")+'</button></div><div id="bkSr" class="bktoc" style="margin-top:8px"></div>');
  var run = function(){ var q = sh.querySelector("#bkSq").value.trim(); if(q.length < 2) return; RD.lastQ = q; var box = sh.querySelector("#bkSr"), ql = q.toLowerCase(), hits = [], i = 1; box.innerHTML = '<div class="mut small" id="bkSp">…</div>';
    var step = function(){ if(i > RD.n || hits.length >= 200){ box.innerHTML = (hits.length ? hits.map(function(h){ return '<button class="hhist" data-gp="'+h.p+'"><span class="mut tiny">'+h.p+'</span><span class="hhs">…'+esc(h.s)+'…</span></button>'; }).join("") : '<div class="mut small">'+L2("Tiada padanan.","No matches.")+'</div>');
        box.querySelectorAll("[data-gp]").forEach(function(b){ b.onclick = function(){ sh._close(); RD.flash = {p:+b.getAttribute("data-gp"), q:q}; go(RD.flash.p, 0); }; }); return; }
      var p = i++; pageText(p).then(function(t){ var low = t.toLowerCase(), k = low.indexOf(ql); while(k>=0 && hits.length < 200){ hits.push({p:p, s:t.slice(Math.max(0, k-30), k+ql.length+40).replace(/\s+/g, " ")}); k = low.indexOf(ql, k+ql.length); } var sp = document.getElementById("bkSp"); if(sp) sp.textContent = L2("Mencari… halaman ","Searching… page ")+p+" / "+RD.n; step(); }); };
    step(); };
  sh.querySelector("#bkSgo").onclick = run; sh.querySelector("#bkSq").onkeydown = function(e){ if(e.key==="Enter") run(); }; setTimeout(function(){ sh.querySelector("#bkSq").focus(); }, 60);
}
function flashText(d, q){ var ql = q.toLowerCase(); d.querySelectorAll(".textLayer span").forEach(function(s){ if(s.textContent.toLowerCase().indexOf(ql)>=0) s.classList.add("bkflash"); }); RD.flash = null; }
// ---- highlights ----
var HLC = ["y","g","b","p"];
function selChanged(){
  if(!RD) return; var m = document.getElementById("bkSel"); if(!m) return;
  var sel = window.getSelection(), t = String(sel||"").trim();
  if(!t || !sel.rangeCount){ m.classList.remove("on"); RD.sel = null; return; }
  var r = sel.getRangeAt(0), pg = (r.commonAncestorContainer.nodeType===1 ? r.commonAncestorContainer : r.commonAncestorContainer.parentNode).closest(".bkpg");
  if(!pg){ m.classList.remove("on"); return; }
  var box = pg.getBoundingClientRect(), rects = [].slice.call(r.getClientRects()).filter(function(x){ return x.width > 1 && x.height > 1; }).map(function(x){ return [(x.left-box.left)/box.width, (x.top-box.top)/box.height, x.width/box.width, x.height/box.height]; });
  var from = null, sp = (r.startContainer.nodeType===1 ? r.startContainer : r.startContainer.parentNode); if(pg._tdivs && pg._m){ var ix = pg._tdivs.indexOf(sp); if(ix>=0 && pg._m.its[ix]) from = pg._m.its[ix][0] + (r.startContainer.nodeType===3 ? r.startOffset : 0); }
  RD.sel = {p:+pg.getAttribute("data-pg"), r:mergeRects(rects), tx:t, from:from};
  m.innerHTML = HLC.map(function(c){ return '<button class="bkdot c-'+c+'" data-hc="'+c+'"></button>'; }).join("")+'<button data-sa="note">📝</button><button data-sa="copy">📋</button><button data-sa="say">🔊</button><button data-sa="here" title="'+esc(L2("Baca dari sini","Read from here"))+'">▶</button><button data-sa="tr" title="'+esc(L2("Terjemah","Translate"))+'">🌐</button><button data-sa="find">🔍</button>';
  m.classList.add("on");
  m.querySelectorAll("[data-hc]").forEach(function(b){ b.onmousedown = b.ontouchstart = function(e){ e.preventDefault(); addHl(b.getAttribute("data-hc")); }; });
  m.querySelectorAll("[data-sa]").forEach(function(b){ b.onmousedown = b.ontouchstart = function(e){ e.preventDefault(); var a = b.getAttribute("data-sa"), s = RD.sel; if(!s) return;
    if(a==="copy"){ if(N().copyText) N().copyText(s.tx); else { try{ navigator.clipboard.writeText(s.tx); }catch(x){} } H.toast(L2("Disalin","Copied")); }
    else if(a==="say") say(s.tx);
    else if(a==="here"){ var p = s.p, f = s.from||0; window.getSelection().removeAllRanges(); m.classList.remove("on"); pageModel(p).then(function(md){ var k = 0; md.sents.forEach(function(sn, i){ if(sn.b <= f) k = i+1; }); ttsStart(p, Math.min(k, Math.max(0, md.sents.length-1))); }); }
    else if(a==="tr"){ var u = "https://translate.google.com/?sl=auto&tl="+(H.S && H.S.lang==="en" ? "en" : "ms")+"&op=translate&text="+encodeURIComponent(s.tx.slice(0, 1500)); if(N().openUrl) N().openUrl(u); else window.open(u); }
    else if(a==="find"){ RD.lastQ = s.tx.slice(0, 60); window.getSelection().removeAllRanges(); searchSheet(); }
    else if(a==="note"){ var n = prompt(L2("Nota untuk teks ini","Note for this text")); if(n!=null) addHl("y", n); } }; });
}
function mergeRects(rs){ var out = []; rs.sort(function(a, b){ return a[1]-b[1] || a[0]-b[0]; }).forEach(function(r){ var l = out[out.length-1]; if(l && Math.abs(l[1]-r[1]) < r[3]*0.5 && r[0] <= l[0]+l[2]+0.01){ var x2 = Math.max(l[0]+l[2], r[0]+r[2]); l[2] = x2-l[0]; l[3] = Math.max(l[3], r[3]); } else out.push(r.slice()); }); return out; }
function addHl(c, note){
  var s = RD.sel; if(!s) return; RD.b.hl = RD.b.hl || [];
  RD.b.hl.push({id:"h"+Date.now().toString(36), p:s.p, r:s.r, c:c, tx:s.tx.slice(0, 1000), note:note||"", t:Date.now()});
  saveProgress(); window.getSelection().removeAllRanges(); document.getElementById("bkSel").classList.remove("on"); RD.sel = null;
  document.querySelectorAll('.bkpg[data-pg="'+s.p+'"]').forEach(function(d){ overlayPage(d, s.p); }); H.toast(L2("Diserlahkan","Highlighted"));
}
function hlTap(id){
  var h = (RD.b.hl||[]).filter(function(x){ return x.id===id; })[0]; if(!h) return;
  var sh = sheet("🖍 "+L2("Serlahan","Highlight"), '<div class="small" style="margin-bottom:8px">“'+esc(h.tx)+'”</div><div class="rseg">'+HLC.map(function(c){ return '<button class="bkdot c-'+c+(h.c===c ? ' on' : '')+'" data-hc2="'+c+'"></button>'; }).join("")+'</div><label class="hfld">'+L2("Nota","Note")+'<input id="bkHn" class="rin" value="'+esc(h.note||"")+'"></label><div class="btns"><button class="btn gold" id="bkHs">'+L2("Simpan","Save")+'</button><button class="btn alt" id="bkHd">🗑️ '+L2("Buang","Remove")+'</button></div>');
  sh.querySelectorAll("[data-hc2]").forEach(function(b){ b.onclick = function(){ h.c = b.getAttribute("data-hc2"); sh.querySelectorAll("[data-hc2]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  sh.querySelector("#bkHs").onclick = function(){ h.note = sh.querySelector("#bkHn").value; saveProgress(); sh._close(); refreshPage(h.p); };
  sh.querySelector("#bkHd").onclick = function(){ RD.b.hl = RD.b.hl.filter(function(x){ return x.id!==id; }); saveProgress(); sh._close(); refreshPage(h.p); };
}
// ---- notes anywhere on a page ----
function placeNote(e){
  var pg = e.target.closest(".bkpg"); if(!pg){ H.toast(L2("Ketik pada halaman","Tap on the page")); return; }
  var box = pg.getBoundingClientRect(), x = (e.clientX-box.left)/box.width, y = (e.clientY-box.top)/box.height, p = +pg.getAttribute("data-pg");
  RD.noteMode = false; tbOn("note", false);
  var t = prompt(L2("Nota","Note")); if(!t || !t.trim()) return;
  RD.b.notes = RD.b.notes || []; RD.b.notes.push({id:"n"+Date.now().toString(36), p:p, x:x, y:y, tx:t.trim().slice(0, 2000), t:Date.now()}); saveProgress(); refreshPage(p); H.toast(L2("Nota ditambah","Note added"));
}
function noteTap(id){
  var n = (RD.b.notes||[]).filter(function(x){ return x.id===id; })[0]; if(!n) return;
  var sh = sheet("💬 "+L2("Nota","Note")+" · "+L2("hlm ","p. ")+n.p, '<textarea class="htxt" rows="6" id="bkNt">'+esc(n.tx)+'</textarea><div class="btns" style="margin-top:8px"><button class="btn gold" id="bkNs">'+L2("Simpan","Save")+'</button><button class="btn alt" id="bkNd">🗑️ '+L2("Buang","Remove")+'</button></div>');
  sh.querySelector("#bkNs").onclick = function(){ n.tx = sh.querySelector("#bkNt").value.trim() || n.tx; saveProgress(); sh._close(); refreshPage(n.p); };
  sh.querySelector("#bkNd").onclick = function(){ RD.b.notes = RD.b.notes.filter(function(x){ return x.id!==id; }); saveProgress(); sh._close(); refreshPage(n.p); };
}
function refreshPage(p){ document.querySelectorAll('.bkpg[data-pg="'+p+'"]').forEach(function(d){ overlayPage(d, p); }); }
// highlights + notes + edits drawn over a page (SVG, coordinates 0..1)
function overlayPage(d, n){
  var old = d.querySelector(".bkov2"); if(old) old.remove();
  var w = parseFloat(d.style.width), h = parseFloat(d.style.height), o = document.createElement("div"); o.className = "bkov2";
  var html = (RD.b.hl||[]).filter(function(x){ return x.p===n; }).map(function(x){ return x.r.map(function(r){ return '<div class="bkhl c-'+x.c+'" data-hl="'+x.id+'" style="left:'+(r[0]*100)+'%;top:'+(r[1]*100)+'%;width:'+(r[2]*100)+'%;height:'+(r[3]*100)+'%"></div>'; }).join("")+(x.note ? '<div class="bknote" data-hl="'+x.id+'" style="left:'+((x.r[0][0]+x.r[0][2])*100)+'%;top:'+(x.r[0][1]*100)+'%">📝</div>' : ''); }).join("");
  html += (RD.b.notes||[]).filter(function(x){ return x.p===n; }).map(function(x){ return '<div class="bkpin" data-nt="'+x.id+'" style="left:'+(x.x*100)+'%;top:'+(x.y*100)+'%">💬</div>'; }).join("");
  html += '<svg class="bksvg" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'">'+(RD.ed[n]||[]).map(function(x, i){ return objSvg(x, w, h, i); }).join("")+'</svg>';
  o.innerHTML = html; d.appendChild(o);
}
// smooth pen line: quadratic curves through the midpoints of the recorded points
function inkPath(pts, w, h){ if(!pts.length) return ""; var P = pts.map(function(p){ return [p[0]*w, p[1]*h]; }), f = function(v){ return v.toFixed(1); };
  if(P.length < 3) return "M"+f(P[0][0])+" "+f(P[0][1])+P.slice(1).map(function(p){ return " L"+f(p[0])+" "+f(p[1]); }).join("");
  var d = "M"+f(P[0][0])+" "+f(P[0][1]); for(var i=1;i<P.length-1;i++){ var mx = (P[i][0]+P[i+1][0])/2, my = (P[i][1]+P[i+1][1])/2; d += " Q"+f(P[i][0])+" "+f(P[i][1])+" "+f(mx)+" "+f(my); }
  var L = P[P.length-1]; return d+" L"+f(L[0])+" "+f(L[1]); }
// edited text: one box hides the original words (where they were), one sits behind the new words (wherever they are moved)
function etCover(o){ var ls = String(o.v).split("\n"), ox = o.ox==null ? o.x : o.ox, oy = o.oy==null ? o.y : o.oy, p = 0.002, out = [[ox-p, oy-p, o.w+2*p, o.h+2*p]];
  if(String(o.v).trim()) out.push([o.x-p, o.y-p, (o.tw||o.w)+2*p, o.s*1.2*ls.length+2*p]); return out; }
var FONTS = {sans:"Helvetica,Arial,sans-serif", serif:"'Times New Roman',Times,serif", mono:"'Courier New',Courier,monospace"};
function objSvg(x, w, h, i){
  var col = x.c || "#d01e1e", a = ' data-oi="'+i+'"';
  if(x.t==="ink") return '<path'+a+' d="'+inkPath(x.pts, w, h)+'" fill="none" stroke="'+col+'" stroke-width="'+(x.w*w)+'" stroke-linecap="round" stroke-linejoin="round" opacity="'+(x.hl ? 0.35 : 1)+'"/>';
  if(x.t==="text") return '<text'+a+' x="'+(x.x*w)+'" y="'+((x.y+x.s)*h)+'" font-size="'+(x.s*h)+'" fill="'+col+'" font-family="Helvetica,Arial,sans-serif">'+esc(x.v)+'</text>';
  if(x.t==="etext"){ var ls = String(x.v).split("\n"), fs = x.s*h, cv = etCover(x); return '<g'+a+'>'+cv.map(function(r){ return '<rect x="'+(r[0]*w)+'" y="'+(r[1]*h)+'" width="'+(r[2]*w)+'" height="'+(r[3]*h)+'" fill="'+(x.bg||"#ffffff")+'"/>'; }).join("")+
    ls.map(function(l, k){ return '<text x="'+(x.x*w)+'" y="'+(x.y*h + fs*0.82 + k*fs*1.2)+'" font-size="'+fs+'" fill="'+col+'" font-family="'+(FONTS[x.f]||FONTS.sans)+'"'+(x.b ? ' font-weight="bold"' : '')+'>'+esc(l)+'</text>'; }).join("")+'</g>'; }
  if(x.t==="img") return '<image'+a+' href="'+x.src+'" x="'+(x.x*w)+'" y="'+(x.y*h)+'" width="'+(x.w*w)+'" height="'+(x.h*h)+'"/>';
  if(x.t==="rect") return '<rect'+a+' x="'+(x.x*w)+'" y="'+(x.y*h)+'" width="'+(x.w*w)+'" height="'+(x.h*h)+'" fill="none" stroke="'+col+'" stroke-width="2"/>';
  if(x.t==="mark"){ var s = x.s*w, X = x.x*w, Y = x.y*h; return x.k==="check" ? '<polyline'+a+' points="'+X+','+(Y+s*0.55)+' '+(X+s*0.38)+','+(Y+s*0.9)+' '+(X+s)+','+(Y+s*0.1)+'" fill="none" stroke="'+col+'" stroke-width="'+(s*0.14)+'" stroke-linecap="round"/>' : '<path'+a+' d="M'+X+' '+Y+'L'+(X+s)+' '+(Y+s)+'M'+(X+s)+' '+Y+'L'+X+' '+(Y+s)+'" stroke="'+col+'" stroke-width="'+(s*0.14)+'" stroke-linecap="round"/>'; }
  return "";
}
// ---- read aloud: sentence by sentence, the spoken sentence and word highlighted on the page ----
function langOf(t){ return /\b(dan|yang|untuk|dengan|ini|itu|tidak|ialah|adalah|kepada|dalam)\b/i.test(t) ? "ms" : "en"; }
function say(t){ if(N().speak) N().speak(t, langOf(t)); else if(window.speechSynthesis){ speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(t)); } }
function speakText(T, text, cb){
  if(N().speak){
    if(N().setBookRate) try{ N().setBookRate(RD.s.rate||1); }catch(e){}
    var hd = function(d){ if(d && d.stopped) return; T.off(); cb({done:true}); }, hr = function(d){ if(d) cb({range:[d.s, d.e]}); };
    T.off = function(){ H.off("ttsdone", hd); H.off("ttsrange", hr); T.off = function(){}; }; H.on("ttsdone", hd); H.on("ttsrange", hr); N().speak(text, T.lang); return; }
  if(!window.speechSynthesis){ cb({done:true}); return; }
  var u = new SpeechSynthesisUtterance(text), dead = false; u.lang = T.lang==="ms" ? "ms-MY" : "en-GB"; u.rate = RD.s.rate||1;
  u.onboundary = function(e){ if(dead || (e.name && e.name!=="word")) return; var i = e.charIndex, L = e.charLength || ((/^\S+/.exec(text.slice(i))||[""])[0].length); cb({range:[i, i+L]}); };
  u.onend = function(){ if(!dead){ dead = true; cb({done:true}); } };
  T.off = function(){ dead = true; T.off = function(){}; }; speechSynthesis.cancel(); speechSynthesis.speak(u);
}
function ttsStart(p, i){ stopAuto(); if(RD.tts) stopTts(); RD.tts = {p:p, i:i||0, play:true, off:function(){}}; tbOn("tts", true); ttsPanel(); speakNext(); }
function ttsRestart(){ var T = RD && RD.tts; if(!T) return; T.off(); T.play = true; if(N().stopSpeak) try{ N().stopSpeak(); }catch(e){} speakNext(); ttsPanel(); }
// bring the page being read into view (scroll mode: only when it is not drawn yet; the sentence itself scrolls into view)
function showPage(p){ var T = RD.tts; if(T) T.moving = true;
  if(RD.s.mode==="scroll"){ if(!document.querySelector('#bkStage .bkpg[data-pg="'+p+'"]')) go(p); }
  else if(!(RD.p===p || (dbl() && RD.p > 1 && RD.p+1===p))){ RD.p = p; draw(1); }
  if(T) T.moving = false; }
function speakNext(){ var T = RD && RD.tts; if(!T || !T.play) return;
  pageModel(T.p).then(function(m){ if(!RD || RD.tts!==T || !T.play) return;
    if(!m.sents.length){ if(T.p < RD.n && T.skip !== T.p && (T.empty = (T.empty||0)+1) < 3){ T.skip = T.p; T.p++; T.i = 0; showPage(T.p); speakNext(); return; } H.toast(L2("Tiada teks pada halaman ini (gambar sahaja)","No text on this page (pictures only)")); stopTts(); return; }
    T.empty = 0;
    if(T.i >= m.sents.length){ if(T.p >= RD.n){ stopTts(); H.toast(L2("Tamat","The end")); return; } T.p++; T.i = 0; showPage(T.p); speakNext(); return; }
    if(T.i < 0) T.i = 0;
    showPage(T.p); T.lang = T.lang || langOf(m.text); var sn = m.sents[T.i]; T.cur = sn; T.w = null; reMark(); var id = T.id = Date.now() + Math.random();
    speakText(T, sn.t, function(ev){ if(!RD || RD.tts!==T || T.id!==id) return;
      if(ev.range){ T.w = [sn.a+ev.range[0], sn.a+Math.min(sn.t.length, ev.range[1])]; reMark(true); return; }
      if(ev.done && T.play){ T.i++; speakNext(); } });
  }); }
function ttsPanel(){ var R = document.getElementById("bkR"); if(!R || !RD.tts) return; var p = document.getElementById("bkTts"); if(!p){ p = document.createElement("div"); p.id = "bkTts"; p.className = "bkfloat"; R.appendChild(p); }
  p.innerHTML = '<button data-tp="prev">⏮</button><button data-tp="play">'+(RD.tts.play ? "⏸" : "▶")+'</button><button data-tp="next">⏭</button><button data-tp="rate" class="bkrate">'+(RD.s.rate||1)+'×</button><button data-tp="x">✕</button>';
  p.querySelectorAll("[data-tp]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); var a = b.getAttribute("data-tp"), T = RD.tts; if(!T) return;
    if(a==="x"){ stopTts(); return; }
    if(a==="play"){ if(T.play){ T.play = false; T.off(); if(N().stopSpeak) try{ N().stopSpeak(); }catch(x){} if(window.speechSynthesis) speechSynthesis.cancel(); ttsPanel(); } else ttsRestart(); return; }
    if(a==="rate"){ var R2 = [0.75, 1, 1.25, 1.5, 2], k = R2.indexOf(RD.s.rate||1); RD.s.rate = R2[(k+1) % R2.length]; saveSet(RD.s); ttsRestart(); return; }
    if(a==="next"){ T.i++; ttsRestart(); return; }
    if(a==="prev"){ if(T.i > 0) T.i--; else if(T.p > 1){ T.p--; T.i = 1e6; pageModel(T.p).then(function(m){ T.i = Math.max(0, m.sents.length-1); ttsRestart(); }); return; } ttsRestart(); } }; });
}
function clearMarks(){ document.querySelectorAll(".bksay").forEach(function(x){ x.remove(); }); document.querySelectorAll(".bks.on").forEach(function(x){ x.classList.remove("on"); }); }
function rangeRects(d, a, b){ var out = [], its = d._m.its, box = d.getBoundingClientRect();
  for(var i=0;i<its.length;i++){ var s = its[i][0], e = its[i][1]; if(e <= a || s >= b || !d._tdivs[i]) continue; var node = d._tdivs[i].firstChild; if(!node || node.nodeType!==3) continue;
    try{ var r = document.createRange(); r.setStart(node, Math.max(0, a-s)); r.setEnd(node, Math.min(node.length, b-s)); [].forEach.call(r.getClientRects(), function(q){ if(q.width > 0.5) out.push([(q.left-box.left)/box.width, (q.top-box.top)/box.height, q.width/box.width, q.height/box.height]); }); }catch(x){} }
  return mergeRects(out); }
function reMark(wordOnly){
  var T = RD && RD.tts; if(!T || !T.cur) return; var sn = T.cur;
  if(RD.s.mode==="text"){ if(RD.p!==T.p) return; var sp = document.querySelector('.bks[data-si="'+T.i+'"]'), tx = document.querySelector(".bktext"); if(!sp || !tx) return;
    if(!wordOnly){ document.querySelectorAll(".bks.on").forEach(function(x){ x.classList.remove("on"); }); sp.classList.add("on"); if(T.seen!==T.i){ T.seen = T.i; sp.scrollIntoView({block:"center", behavior:"smooth"}); } }
    tx.querySelectorAll(".bksay").forEach(function(x){ x.remove(); });
    if(T.w && sp.firstChild){ try{ var r = document.createRange(), cr = tx.getBoundingClientRect(); r.setStart(sp.firstChild, Math.max(0, T.w[0]-sn.a)); r.setEnd(sp.firstChild, Math.min(sp.firstChild.length, T.w[1]-sn.a)); [].forEach.call(r.getClientRects(), function(q){ var dv = document.createElement("div"); dv.className = "bksay bkwrd"; dv.style.cssText = "left:"+(q.left-cr.left)+"px;top:"+(q.top-cr.top)+"px;width:"+q.width+"px;height:"+q.height+"px"; tx.appendChild(dv); }); }catch(x){} }
    return; }
  document.querySelectorAll('.bkpg[data-pg="'+T.p+'"]').forEach(function(d){ if(!d._tdivs || !d._m) return;
    var L = d.querySelector(".bksay"); if(!L){ L = document.createElement("div"); L.className = "bksay"; d.appendChild(L); }
    var px = function(r, c){ return '<div class="'+c+'" style="left:'+(r[0]*100)+'%;top:'+(r[1]*100)+'%;width:'+(r[2]*100)+'%;height:'+(r[3]*100)+'%"></div>'; };
    if(!wordOnly || !L._s){ L._s = rangeRects(d, sn.a, sn.b).map(function(r){ return px(r, "bksent"); }).join(""); }
    L.innerHTML = L._s + (T.w ? rangeRects(d, T.w[0], T.w[1]).map(function(r){ return px(r, "bkwrd"); }).join("") : "");
    if(T.seen!==T.i+"/"+T.p){ var f = L.querySelector(".bksent"), st = document.getElementById("bkStage"); if(f && st){ var fr = f.getBoundingClientRect(), sr = st.getBoundingClientRect(); if(fr.top < sr.top+20 || fr.bottom > sr.bottom-20 || fr.left < sr.left || fr.right > sr.right){ T.seen = T.i+"/"+T.p; f.scrollIntoView({block:"center", inline:"nearest", behavior:"smooth"}); } else T.seen = T.i+"/"+T.p; } } });
}
function stopTts(){ if(RD && RD.tts){ RD.tts.play = false; RD.tts.off(); RD.tts = null; } clearMarks(); var p = document.getElementById("bkTts"); if(p) p.remove(); tbOn("tts", false);
  if(N().stopSpeak) try{ N().stopSpeak(); }catch(e){} if(window.speechSynthesis) try{ speechSynthesis.cancel(); }catch(e){} }
// ---- autoscroll ----
function startAuto(){
  stopTts(); if(RD.s.mode!=="scroll"){ RD.s.mode = "scroll"; saveSet(RD.s); buildReader(); }
  var A = RD.auto = {v:RD.s.autoV||40, run:true, last:0, y:null}; tbOn("auto", true); autoPanel(); RD.bars = false; document.getElementById("bkR").classList.add("nobars");
  var step = function(t){ if(!RD || RD.auto!==A) return; var st = document.getElementById("bkStage");
    if(A.run && st){ if(A.y==null || Math.abs(st.scrollTop - A.y) > 3) A.y = st.scrollTop; if(A.last){ A.y += A.v*Math.min(100, t-A.last)/1000; st.scrollTop = A.y; if(st.scrollTop + st.clientHeight >= st.scrollHeight-1){ stopAuto(); H.toast(L2("Tamat","The end")); return; } } A.last = t; } else A.last = 0;
    A.raf = requestAnimationFrame(step); };
  A.raf = requestAnimationFrame(step);
}
function autoPause(){ var A = RD.auto; if(!A) return; A.run = !A.run; autoPanel(); }
function autoPanel(){ var R = document.getElementById("bkR"); if(!R || !RD.auto) return; var p = document.getElementById("bkAuto"); if(!p){ p = document.createElement("div"); p.id = "bkAuto"; p.className = "bkfloat"; R.appendChild(p); }
  p.innerHTML = '<button data-ap="slow">−</button><span class="bkrate">⏬ '+Math.round(RD.auto.v)+'</span><button data-ap="fast">+</button><button data-ap="run">'+(RD.auto.run ? "⏸" : "▶")+'</button><button data-ap="x">✕</button>';
  p.querySelectorAll("[data-ap]").forEach(function(b){ b.onclick = function(e){ e.stopPropagation(); var a = b.getAttribute("data-ap"), A = RD.auto; if(!A) return;
    if(a==="x"){ stopAuto(); return; } if(a==="run"){ autoPause(); return; }
    A.v = Math.max(5, Math.min(400, Math.round(A.v*(a==="fast" ? 1.25 : 0.8)))); RD.s.autoV = A.v; saveSet(RD.s); autoPanel(); }; });
}
function stopAuto(){ if(RD && RD.auto){ cancelAnimationFrame(RD.auto.raf); RD.auto = null; RD.bars = true; var R = document.getElementById("bkR"); if(R) R.classList.remove("nobars"); } var p = document.getElementById("bkAuto"); if(p) p.remove(); tbOn("auto", false); }

// ---------------- annotate (✏️) ----------------
var TOOLS = [["pen","✏️","Pen","Pen"],["mark","🖍","Penyerlah","Highlighter"],["etext","✎","Sunting teks","Edit text"],["text","T","Tambah teks","Add text"],["sign","✍️","Tandatangan","Signature"],["date","📅","Tarikh","Date"],["check","✓","Tanda","Tick"],["cross","✗","Pangkah","Cross"],["rect","▭","Kotak","Box"],["move","✋","Alih","Move"],["erase","🧽","Padam","Erase"]];
var COLS = ["#d01e1e","#1e4fd0","#111111","#13804e","#e0a000"];
var WIDTHS = [[1.5,"─"],[2.5,"━"],[4.5,"▬"]];
function startEdit(){
  if(RD.s.mode!=="page"){ RD.s.mode = "page"; saveSet(RD.s); buildReader(); }
  stopAuto(); RD.edit = {tool:"pen", c:COLS[0], w:2.5, undo:[]}; var e = document.getElementById("bkEdit");
  var bar = function(){ var pen = RD.edit.tool==="pen" || RD.edit.tool==="mark", F = document.getElementById("bkEdF");
    // 0.6.31 (owner): ✏️ stays at the bottom right with 🖍 and ✓ Done; every other tool fits in 2 rows (no side scroll)
    var tb = function(t){ return '<button class="'+(RD.edit.tool===t[0] ? 'on' : '')+'" data-et="'+t[0]+'" title="'+esc(L2(t[2], t[3]))+'">'+t[1]+'<small>'+esc(L2(t[2], t[3]))+'</small></button>'; };
    F.innerHTML = tb(TOOLS[1])+tb(TOOLS[0])+'<button data-ea="done" class="bkEdDone">✓<small>'+L2("Siap","Done")+'</small></button>';
    e.innerHTML = '<div class="bketools bkr1">'+TOOLS.slice(2).map(tb).join("")+'</div><div class="bketools bkr2">'+COLS.map(function(c){ return '<button class="bkcol'+(RD.edit.c===c ? ' on' : '')+'" data-ec="'+c+'" style="background:'+c+'"></button>'; }).join("")+
      (pen ? WIDTHS.map(function(w){ return '<button class="'+(RD.edit.w===w[0] ? 'on' : '')+'" data-ew="'+w[0]+'">'+w[1]+'</button>'; }).join("") : '')+'<button data-ea="undo">↶</button><button data-ea="save" class="bksave">💾<small>'+L2("Simpan","Save")+'</small></button></div>';
    var R0 = document.getElementById("bkR"), all = R0 ? R0.querySelectorAll("#bkEdit [data-et], #bkEdF [data-et]") : [];
    Array.prototype.forEach.call(all, function(b){ b.onclick = function(){ RD.edit.tool = b.getAttribute("data-et"); if(RD.edit.tool==="sign") signSheet(); bar(); H.toast(hint()); }; });
    F.querySelector("[data-ea]").onclick = function(){ endEdit(); };
    e.querySelectorAll("[data-ec]").forEach(function(b){ b.onclick = function(){ RD.edit.c = b.getAttribute("data-ec"); bar(); }; });
    e.querySelectorAll("[data-ew]").forEach(function(b){ b.onclick = function(){ RD.edit.w = +b.getAttribute("data-ew"); bar(); }; });
    e.querySelectorAll("[data-ea]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-ea");
      if(a==="done"){ endEdit(); } else if(a==="undo"){ var u = RD.edit.undo.pop(); if(u){ if(u.restore){ RD.ed[u.n][u.i] = u.restore; } else if(u.del){ RD.ed[u.n].splice(u.i, 0, u.del); } else (RD.ed[u.n]||[]).pop(); saveProgress(); refreshPage(u.n); } } else if(a==="save") saveEdited(); }; }); };
  RD.edit.bar = bar; e.classList.add("on"); bar(); document.getElementById("bkR").classList.add("editing");
  var st = document.getElementById("bkStage"); st.addEventListener("pointerdown", penDown);
}
function hint(){ var t = RD.edit.tool; return t==="pen"||t==="mark" ? L2("Lukis dengan satu jari. Dua jari untuk zum dan alih halaman.","Draw with one finger. Two fingers to zoom and move the page.") : t==="rect" ? L2("Seret untuk membuat kotak.","Drag to make a box.") : t==="erase" ? L2("Ketik objek untuk memadam.","Tap an item to erase it.") : t==="sign" ? L2("Ketik tempat tandatangan.","Tap where the signature goes.") :
  t==="etext" ? L2("Ketik mana-mana teks dalam PDF untuk menukarnya.","Tap any text in the PDF to change it.") : t==="move" ? L2("Seret objek yang anda letak untuk mengalih; ketik untuk saiz.","Drag an item you placed to move it; tap it to resize.") : L2("Ketik tempat untuk meletak.","Tap where it goes."); }
function endEdit(){ cancelStroke(); RD.edit = null; var e = document.getElementById("bkEdit"); e.classList.remove("on"); e.innerHTML = "";
  var F = document.getElementById("bkEdF"); if(F){ F.innerHTML = '<button data-r="edit" class="bkEdFab" title="'+L2("Sunting","Edit")+'">✏️</button>'; F.firstChild.onclick = function(ev){ ev.stopPropagation(); readerAct("edit"); }; } document.getElementById("bkR").classList.remove("editing"); var st = document.getElementById("bkStage"); st.removeEventListener("pointerdown", penDown); }
var STROKE = null;
function cancelStroke(){ if(STROKE){ STROKE.cancel(); STROKE = null; } }
function penDown(ev){
  if(!RD.edit || STROKE || ev.isPrimary===false || (ev.pointerType==="mouse" && ev.button)) return; var pg = ev.target.closest(".bkpg"); if(!pg) return; ev.preventDefault();
  var n = +pg.getAttribute("data-pg"), box = pg.getBoundingClientRect(), pt = function(e){ return [Math.max(0, Math.min(1, (e.clientX-box.left)/box.width)), Math.max(0, Math.min(1, (e.clientY-box.top)/box.height))]; }, t = RD.edit.tool, c = RD.edit.c, p0 = pt(ev);
  var add = function(o){ RD.ed[n] = RD.ed[n] || []; RD.ed[n].push(o); RD.edit.undo.push({n:n}); saveProgress(); refreshPage(n); };
  var hitEl = ev.target.closest("[data-oi]"), hitI = hitEl ? +hitEl.getAttribute("data-oi") : -1, hitO = hitI>=0 ? (RD.ed[n]||[])[hitI] : null;
  if(t==="erase"){ if(hitO){ RD.ed[n].splice(hitI, 1); RD.edit.undo.push({n:n, i:hitI, del:hitO}); saveProgress(); refreshPage(n); } return; }
  if(t==="etext"){ if(hitO && hitO.t==="etext"){ etextSheet(n, hitI, hitO); return; } var tx = textAt(pg, ev.clientX, ev.clientY); if(!tx){ H.toast(L2("Tiada teks di sini (mungkin gambar). Guna T untuk menambah teks.","No text here (it may be a picture). Use T to add text.")); return; } etextSheet(n, -1, tx); return; }
  if(t==="move"){ if(!hitO){ H.toast(L2("Ketik objek yang anda letak (teks, tandatangan, tanda, lukisan)","Tap an item you placed (text, signature, mark, drawing)")); return; } moveObj(ev, pg, n, hitI, hitO, hitEl, box); return; }
  if(t==="text"){ var v = prompt(L2("Teks","Text")); if(v) add({t:"text", x:p0[0], y:p0[1], s:0.022, v:v, c:c}); return; }
  if(t==="date"){ var d = new Date(); add({t:"text", x:p0[0], y:p0[1], s:0.02, v:("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2)+"/"+d.getFullYear(), c:c}); return; }
  if(t==="check" || t==="cross"){ add({t:"mark", k:t, x:p0[0]-0.02, y:p0[1]-0.015, s:0.04, c:c}); return; }
  if(t==="sign"){ var sig = RD.s.sigs[RD.s.sigs.length-1]; if(!sig){ signSheet(); return; } var ar = sig.h/sig.w, ww = 0.3; add({t:"img", x:p0[0]-ww/2, y:p0[1]-ww*ar*(box.width/box.height)/2, w:ww, h:ww*ar*(box.width/box.height), src:sig.src}); return; }
  // pen / highlighter / box: the page does not scroll while drawing (touch-action:none) and the pointer is captured, so strokes are not cut off
  var svg = pg.querySelector(".bksvg"), live = null, pts = [p0], W = box.width, Hh = box.height, pid = ev.pointerId, sw = t==="mark" ? 14 : (RD.edit.w || 2.5);
  try{ ev.target.setPointerCapture && ev.target.setPointerCapture(pid); }catch(x){}
  var paint = function(){ if(t==="rect"){ var a = pts[0], b = pts[pts.length-1]; if(!live){ live = document.createElementNS("http://www.w3.org/2000/svg", "rect"); live.setAttribute("fill", "none"); live.setAttribute("stroke", c); live.setAttribute("stroke-width", 2); svg.appendChild(live); }
      live.setAttribute("x", Math.min(a[0], b[0])*W); live.setAttribute("y", Math.min(a[1], b[1])*Hh); live.setAttribute("width", Math.abs(b[0]-a[0])*W); live.setAttribute("height", Math.abs(b[1]-a[1])*Hh); return; }
    if(!live){ live = document.createElementNS("http://www.w3.org/2000/svg", "path"); live.setAttribute("fill", "none"); live.setAttribute("stroke", c); live.setAttribute("stroke-width", sw); live.setAttribute("stroke-linecap", "round"); live.setAttribute("stroke-linejoin", "round"); if(t==="mark") live.setAttribute("opacity", 0.35); svg.appendChild(live); }
    live.setAttribute("d", inkPath(pts, W, Hh)); };
  var raf = 0, mv = function(e){ if(e.pointerId!==pid) return; e.preventDefault(); var list = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if(!list.length) list = [e];
    list.forEach(function(q){ var p = pt(q); if(t==="rect"){ pts = [p0, p]; return; } var l = pts[pts.length-1]; if(Math.abs(p[0]-l[0])*W + Math.abs(p[1]-l[1])*Hh >= 1.2) pts.push(p); });
    if(!raf) raf = requestAnimationFrame(function(){ raf = 0; if(STROKE) paint(); }); };
  var stop = function(){ document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", cancel); STROKE = null; };
  var up = function(e){ if(e.pointerId!==pid) return; stop();
    if(t==="rect"){ if(pts.length===2){ var a = pts[0], b = pts[1]; if(Math.abs(b[0]-a[0]) > 0.01) add({t:"rect", x:Math.min(a[0], b[0]), y:Math.min(a[1], b[1]), w:Math.abs(b[0]-a[0]), h:Math.abs(b[1]-a[1]), c:c}); else if(live) live.remove(); } return; }
    if(pts.length===1) pts.push([p0[0]+0.0005, p0[1]+0.0005]);   // a tap makes a dot
    add({t:"ink", pts:pts.map(function(q){ return [+q[0].toFixed(4), +q[1].toFixed(4)]; }), c:c, w:sw/W, hl:t==="mark"}); };
  var cancel = function(e){ if(e && e.pointerId!==pid) return; stop(); if(live) live.remove(); };
  STROKE = {cancel:function(){ stop(); if(live) live.remove(); }};
  document.addEventListener("pointermove", mv, {passive:false}); document.addEventListener("pointerup", up); document.addEventListener("pointercancel", cancel);
}
// ✋ move an item by dragging; a tap (no drag) on a picture / text / mark opens size buttons
function moveObj(ev, pg, n, i, o, el, box){
  var x0 = ev.clientX, y0 = ev.clientY, dx = 0, dy = 0, pid = ev.pointerId, moved = false, before = JSON.parse(JSON.stringify(o));
  var mv = function(e){ if(e.pointerId!==pid) return; e.preventDefault(); dx = (e.clientX-x0)/box.width; dy = (e.clientY-y0)/box.height; if(Math.abs(e.clientX-x0)+Math.abs(e.clientY-y0) > 4) moved = true; el.setAttribute("transform", "translate("+(dx*box.width)+","+(dy*box.height)+")"); };
  var up = function(e){ if(e.pointerId!==pid) return; document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", up);
    if(!moved){ el.removeAttribute("transform"); sizeSheet(n, i, o); return; }
    if(o.t==="ink") o.pts = o.pts.map(function(p){ return [+(p[0]+dx).toFixed(4), +(p[1]+dy).toFixed(4)]; }); else { o.x += dx; o.y += dy; }
    RD.edit.undo.push({n:n, i:i, restore:before}); saveProgress(); refreshPage(n); };
  document.addEventListener("pointermove", mv, {passive:false}); document.addEventListener("pointerup", up); document.addEventListener("pointercancel", up);
}
function sizeSheet(n, i, o){
  var sh = sheet("✋ "+L2("Saiz","Size"), '<div class="btns"><button class="btn alt" data-zs="0.8">➖ '+L2("Kecil","Smaller")+'</button><button class="btn alt" data-zs="1.25">➕ '+L2("Besar","Bigger")+'</button>'+(o.t==="etext" ? '<button class="btn alt" data-zs="edit">✎ '+L2("Sunting","Edit")+'</button>' : '')+'<button class="btn alt" data-zs="del">🗑️ '+L2("Padam","Delete")+'</button></div>');
  sh.querySelectorAll("[data-zs]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-zs"), before = JSON.parse(JSON.stringify(o));
    if(a==="del"){ RD.ed[n].splice(i, 1); RD.edit.undo.push({n:n, i:i, del:o}); sh._close(); saveProgress(); refreshPage(n); return; }
    if(a==="edit"){ sh._close(); etextSheet(n, i, o); return; }
    var k = +a; if(o.t==="img" || o.t==="rect"){ var cx = o.x+o.w/2, cy = o.y+o.h/2; o.w *= k; o.h *= k; o.x = cx-o.w/2; o.y = cy-o.h/2; } else if(o.t==="text" || o.t==="mark" || o.t==="etext"){ o.s *= k; if(o.tw) o.tw *= k; } else if(o.t==="ink") o.w *= k;
    RD.edit.undo.push({n:n, i:i, restore:before}); saveProgress(); refreshPage(n); }; });
}
// ✎ edit text that is already in the PDF: the old words are covered with the page colour and the new words written on top
function textAt(pg, cx, cy){
  if(!pg._tdivs || !pg._m) return null; var best = null, area = 1e12;
  pg._tdivs.forEach(function(sp, i){ var r = sp.getBoundingClientRect(); if(!sp.textContent.trim() || r.width < 1) return; if(cx >= r.left-3 && cx <= r.right+3 && cy >= r.top-3 && cy <= r.bottom+3 && r.width*r.height < area){ area = r.width*r.height; best = {sp:sp, i:i, r:r}; } });
  if(!best) return null;
  var box = pg.getBoundingClientRect(), r = best.r, it = pg._m.tc.items[best.i] || {}, st = (pg._m.tc.styles||{})[it.fontName] || {}, fam = String(st.fontFamily||"") + " " + String(it.fontName||"");
  var cols = sampleCols(pg, r, box);
  return {t:"etext", ox:(r.left-box.left)/box.width, oy:(r.top-box.top)/box.height, x:(r.left-box.left)/box.width, y:(r.top-box.top)/box.height, w:r.width/box.width, h:r.height/box.height, s:r.height/box.height*0.95, v:best.sp.textContent, orig:best.sp.textContent,
    c:cols.fg, bg:cols.bg, f:/mono|courier/i.test(fam) ? "mono" : /serif|times|roman|georgia|garamond|minion/i.test(fam) && !/sans/i.test(fam) ? "serif" : "sans", b:/bold|black|heavy|semibold/i.test(fam)};
}
function sampleCols(pg, r, box){
  var c = pg._cv, out = {bg:"#ffffff", fg:"#111111"}; if(!c) return out;
  try{ var k = c.width/box.width, x = c.getContext("2d"), x0 = Math.max(0, Math.round((r.left-box.left)*k)), y0 = Math.max(0, Math.round((r.top-box.top)*k)), w = Math.max(1, Math.min(c.width-x0, Math.round(r.width*k))), h = Math.max(1, Math.min(c.height-y0, Math.round(r.height*k)));
    var d = x.getImageData(x0, y0, w, h).data, hist = {}, bestN = 0, bg = [255,255,255];
    for(var i=0;i<d.length;i+=4){ var key = (d[i]>>4)+","+(d[i+1]>>4)+","+(d[i+2]>>4); hist[key] = (hist[key]||0)+1; if(hist[key] > bestN){ bestN = hist[key]; bg = [d[i], d[i+1], d[i+2]]; } }
    var far = 0, fg = [17,17,17]; for(var j=0;j<d.length;j+=4){ var dd = Math.abs(d[j]-bg[0])+Math.abs(d[j+1]-bg[1])+Math.abs(d[j+2]-bg[2]); if(dd > far){ far = dd; fg = [d[j], d[j+1], d[j+2]]; } }
    var hx = function(a){ return "#"+a.map(function(v){ return ("0"+v.toString(16)).slice(-2); }).join(""); }; out.bg = hx(bg); if(far > 60) out.fg = hx(fg); }catch(e){}
  return out;
}
var MCV = null;
function textW(o){ if(!MCV) MCV = document.createElement("canvas").getContext("2d"); MCV.font = (o.b ? "bold " : "")+"100px "+(FONTS[o.f]||FONTS.sans); var pg = document.querySelector('.bkpg'), ar = pg ? parseFloat(pg.style.height)/parseFloat(pg.style.width) : 1.414;
  return Math.max.apply(null, String(o.v).split("\n").map(function(l){ return MCV.measureText(l).width; }))/100*o.s*ar; }
function etextSheet(n, i, o){
  var sh = sheet("✎ "+L2("Sunting teks","Edit text"), (o.orig ? '<div class="mut tiny" style="margin-bottom:4px">'+L2("Asal: ","Original: ")+'“'+esc(o.orig)+'”</div>' : '')+'<textarea class="htxt" rows="4" id="bkEt">'+esc(o.v)+'</textarea>'+
    '<div class="rlab">'+L2("Fon","Font")+'</div><div class="rseg">'+[["sans","Sans"],["serif","Serif"],["mono","Mono"]].map(function(f){ return '<button class="chip'+(o.f===f[0] ? ' on' : '')+'" data-ef="'+f[0]+'">'+f[1]+'</button>'; }).join("")+'<button class="chip'+(o.b ? ' on' : '')+'" data-eb="1"><b>B</b></button><button class="chip" data-es="0.9">A−</button><button class="chip" data-es="1.1">A+</button></div>'+
    '<div class="rlab">'+L2("Warna","Colour")+'</div><div class="rseg">'+[o.c].concat(COLS).filter(function(c, k, a){ return a.indexOf(c)===k; }).map(function(c){ return '<button class="bkcol'+(o.c===c ? ' on' : '')+'" data-ecl="'+c+'" style="background:'+c+'"></button>'; }).join("")+'</div>'+
    '<div class="btns" style="margin-top:10px"><button class="btn gold" id="bkEtOk">✓ '+L2("Guna","Apply")+'</button>'+(i>=0 ? '<button class="btn alt" id="bkEtDel">↺ '+L2("Kembalikan asal","Restore original")+'</button>' : '')+'</div><div class="mut tiny" style="margin-top:6px">'+L2("Kosongkan untuk memadam teks itu.","Leave it empty to remove that text.")+'</div>');
  var tmp = JSON.parse(JSON.stringify(o));
  sh.querySelectorAll("[data-ef]").forEach(function(b){ b.onclick = function(){ tmp.f = b.getAttribute("data-ef"); sh.querySelectorAll("[data-ef]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  sh.querySelector("[data-eb]").onclick = function(){ tmp.b = !tmp.b; this.classList.toggle("on", tmp.b); };
  sh.querySelectorAll("[data-es]").forEach(function(b){ b.onclick = function(){ tmp.s *= +b.getAttribute("data-es"); H.toast(Math.round(tmp.s/o.s*100)+"%"); }; });
  sh.querySelectorAll("[data-ecl]").forEach(function(b){ b.onclick = function(){ tmp.c = b.getAttribute("data-ecl"); sh.querySelectorAll("[data-ecl]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  sh.querySelector("#bkEtOk").onclick = function(){ tmp.v = sh.querySelector("#bkEt").value.replace(/\s+$/, ""); tmp.tw = textW(tmp); RD.ed[n] = RD.ed[n] || [];
    if(i>=0){ RD.edit.undo.push({n:n, i:i, restore:o}); RD.ed[n][i] = tmp; } else { RD.ed[n].push(tmp); RD.edit.undo.push({n:n}); }
    sh._close(); saveProgress(); refreshPage(n); };
  var dl = sh.querySelector("#bkEtDel"); if(dl) dl.onclick = function(){ RD.ed[n].splice(i, 1); RD.edit.undo.push({n:n, i:i, del:o}); sh._close(); saveProgress(); refreshPage(n); };
  setTimeout(function(){ var t = sh.querySelector("#bkEt"); t.focus(); t.select(); }, 60);
}
function signSheet(){
  var s = RD.s, sh = sheet("✍️ "+L2("Tandatangan","Signature"), (s.sigs.length ? '<div class="rlab">'+L2("Tandatangan disimpan","Saved signatures")+'</div><div class="bksigs">'+s.sigs.map(function(g, i){ return '<button data-sg="'+i+'"><img src="'+g.src+'" alt=""></button>'; }).join("")+'</div>' : '')+
    '<div class="rlab">'+L2("Lukis tandatangan baharu","Draw a new signature")+'</div><canvas id="bkSig" width="600" height="220" class="bksigc"></canvas><div class="btns" style="margin-top:8px"><button class="btn alt" id="bkSc">'+L2("Kosongkan","Clear")+'</button><button class="btn gold" id="bkSs">'+L2("Guna","Use")+'</button></div>');
  var c = sh.querySelector("#bkSig"), x = c.getContext("2d"), dn = false, any = false; x.lineWidth = 4; x.lineCap = "round"; x.strokeStyle = "#0d2a7a";
  var p = function(e){ var r = c.getBoundingClientRect(); return [(e.clientX-r.left)*c.width/r.width, (e.clientY-r.top)*c.height/r.height]; };
  c.onpointerdown = function(e){ dn = true; var q = p(e); x.beginPath(); x.moveTo(q[0], q[1]); e.preventDefault(); }; c.onpointermove = function(e){ if(!dn) return; var q = p(e); x.lineTo(q[0], q[1]); x.stroke(); any = true; }; c.onpointerup = c.onpointerleave = function(){ dn = false; };
  sh.querySelector("#bkSc").onclick = function(){ x.clearRect(0, 0, c.width, c.height); any = false; };
  sh.querySelector("#bkSs").onclick = function(){ if(!any){ H.toast(L2("Lukis tandatangan dahulu","Draw a signature first")); return; } var t = trimCanvas(c); s.sigs.push({src:t.toDataURL("image/png"), w:t.width, h:t.height}); s.sigs = s.sigs.slice(-4); saveSet(s); sh._close(); RD.edit && (RD.edit.tool = "sign"); H.toast(L2("Ketik pada halaman untuk meletak tandatangan","Tap the page to place the signature")); };
  sh.querySelectorAll("[data-sg]").forEach(function(b){ b.onclick = function(){ var i = +b.getAttribute("data-sg"), g = s.sigs.splice(i, 1)[0]; s.sigs.push(g); saveSet(s); sh._close(); if(RD.edit) RD.edit.tool = "sign"; H.toast(L2("Ketik pada halaman untuk meletak tandatangan","Tap the page to place the signature")); }; });
}
function trimCanvas(c){ var x = c.getContext("2d"), d = x.getImageData(0, 0, c.width, c.height).data, l = c.width, r = 0, t = c.height, b = 0;
  for(var y=0;y<c.height;y++) for(var X=0;X<c.width;X++) if(d[(y*c.width+X)*4+3] > 10){ if(X<l) l = X; if(X>r) r = X; if(y<t) t = y; if(y>b) b = y; }
  var o = document.createElement("canvas"); o.width = Math.max(1, r-l+8); o.height = Math.max(1, b-t+8); o.getContext("2d").drawImage(c, l-4, t-4, o.width, o.height, 0, 0, o.width, o.height); return o; }
// apply highlights and edits with pdf-lib, then page operations; returns new bytes
function hex(PL, c){ var n = parseInt(String(c||"#000").slice(1), 16); return PL.rgb((n>>16&255)/255, (n>>8&255)/255, (n&255)/255); }
var HLRGB = {y:"#ffe14d", g:"#7be08a", b:"#7cc4ff", p:"#ff8fc7"};
function buildPdf(b, ed, ops, extra){
  return pdflib().then(function(PL){ return bytesOf(b.id).then(function(u8){ return PL.PDFDocument.load(u8, {ignoreEncryption:true}); }).then(function(doc){
    // fonts for edited text: Helvetica / Times / Courier, regular and bold, embedded only when used
    var need = {}; Object.keys(ed).forEach(function(k){ (ed[k]||[]).forEach(function(o){ if(o.t==="etext") need[(o.f||"sans")+(o.b ? "B" : "")] = 1; }); });
    var FN = {sans:"Helvetica", sansB:"HelveticaBold", serif:"TimesRoman", serifB:"TimesRomanBold", mono:"Courier", monoB:"CourierBold"}, fonts = {};
    return Promise.all(Object.keys(need).map(function(k){ return doc.embedFont(PL.StandardFonts[FN[k]]).then(function(f){ fonts[k] = f; }); })).then(function(){ return doc.embedFont(PL.StandardFonts.Helvetica); }).then(function(font){
      var pages = doc.getPages(), jobs = [];
      var safeIn = function(f, s){ return String(s).split("").map(function(ch){ try{ f.encodeText(ch); return ch; }catch(e){ return "?"; } }).join(""); };
      var safe = function(s){ return String(s).split("").map(function(ch){ try{ font.encodeText(ch); return ch; }catch(e){ return "?"; } }).join(""); };
      pages.forEach(function(pg, i){ var n = i+1, sz = pg.getSize(), W = sz.width, Hh = sz.height;
        (b.hl||[]).filter(function(x){ return x.p===n; }).forEach(function(x){ x.r.forEach(function(r){ pg.drawRectangle({x:r[0]*W, y:Hh-(r[1]+r[3])*Hh, width:r[2]*W, height:r[3]*Hh, color:hex(PL, HLRGB[x.c]||HLRGB.y), opacity:0.35, borderWidth:0}); }); });
        (ed[n]||[]).forEach(function(o){ var col = hex(PL, o.c);
          if(o.t==="ink"){ if(o.pts.length < 2) return; pg.drawSvgPath(inkPath(o.pts, W, Hh), {x:0, y:Hh, borderColor:col, borderWidth:o.w*W, borderOpacity:o.hl ? 0.35 : 1, borderLineCap:PL.LineCapStyle ? PL.LineCapStyle.Round : undefined}); }
          else if(o.t==="etext"){ var ef = fonts[(o.f||"sans")+(o.b ? "B" : "")] || font, fs = o.s*Hh, ls = String(o.v).split("\n");
            var tw = Math.max.apply(null, ls.map(function(l){ try{ return ef.widthOfTextAtSize(safeIn(ef, l), fs); }catch(e){ return 0; } })) / W;
            var oc = JSON.parse(JSON.stringify(o)); oc.tw = tw; etCover(oc).forEach(function(r){ pg.drawRectangle({x:r[0]*W, y:Hh-(r[1]+r[3])*Hh, width:r[2]*W, height:r[3]*Hh, color:hex(PL, o.bg||"#ffffff"), borderWidth:0}); });
            ls.forEach(function(l, k){ if(l) pg.drawText(safeIn(ef, l), {x:o.x*W, y:Hh-(o.y*Hh + fs*0.82 + k*fs*1.2), size:fs, font:ef, color:col}); }); }
          else if(o.t==="text") pg.drawText(safe(o.v), {x:o.x*W, y:Hh-(o.y+o.s)*Hh, size:o.s*Hh, font:font, color:col});
          else if(o.t==="rect") pg.drawRectangle({x:o.x*W, y:Hh-(o.y+o.h)*Hh, width:o.w*W, height:o.h*Hh, borderColor:col, borderWidth:1.5});
          else if(o.t==="mark"){ var s = o.s*W, X = o.x*W, Y = o.y*Hh; pg.drawSvgPath(o.k==="check" ? "M"+X+" "+(Y+s*0.55)+" L"+(X+s*0.38)+" "+(Y+s*0.9)+" L"+(X+s)+" "+(Y+s*0.1) : "M"+X+" "+Y+" L"+(X+s)+" "+(Y+s)+" M"+(X+s)+" "+Y+" L"+X+" "+(Y+s), {x:0, y:Hh, borderColor:col, borderWidth:s*0.12}); }
          else if(o.t==="img") jobs.push(fetch(o.src).then(function(r){ return r.arrayBuffer(); }).then(function(ab){ return doc.embedPng(ab); }).then(function(im){ pg.drawImage(im, {x:o.x*W, y:Hh-(o.y+o.h)*Hh, width:o.w*W, height:o.h*Hh}); })); }); });
      // notes: a small yellow card with the text
      (b.notes||[]).forEach(function(nt){ var pg = pages[nt.p-1]; if(!pg) return; var sz = pg.getSize(), fs = 7, words = safe(nt.tx).replace(/\s+/g, " ").split(" "), lines = [], cur = "";
        words.forEach(function(w){ if(font.widthOfTextAtSize(cur+" "+w, fs) > 150 && cur){ lines.push(cur); cur = w; } else cur = cur ? cur+" "+w : w; }); if(cur) lines.push(cur); lines = lines.slice(0, 12);
        var bw = Math.min(160, Math.max.apply(null, lines.map(function(l){ return font.widthOfTextAtSize(l, fs); }).concat([20]))+8), bh = lines.length*fs*1.25+6, X = Math.min(nt.x*sz.width, sz.width-bw-2), Y = Math.max(2, sz.height - nt.y*sz.height - bh);
        pg.drawRectangle({x:X, y:Y, width:bw, height:bh, color:PL.rgb(1, 0.95, 0.6), borderColor:PL.rgb(0.85, 0.7, 0.1), borderWidth:0.6, opacity:0.95});
        lines.forEach(function(l, k){ pg.drawText(l, {x:X+4, y:Y+bh-4-fs-(k*fs*1.25)+1, size:fs, font:font, color:PL.rgb(0.2, 0.15, 0)}); }); });
      if(extra && extra.num) pages.forEach(function(pg, i){ var sz = pg.getSize(), t = (i+1)+" / "+pages.length, w = font.widthOfTextAtSize(t, 10); pg.drawText(t, {x:(sz.width-w)/2, y:18, size:10, font:font, color:PL.rgb(0.3,0.3,0.3)}); });
      if(extra && extra.wm) pages.forEach(function(pg){ var sz = pg.getSize(), t = safe(extra.wm), fs = Math.min(64, sz.width*1.1/Math.max(4, t.length)); pg.drawText(t, {x:sz.width*0.12, y:sz.height*0.35, size:fs, font:font, color:PL.rgb(0.6,0.6,0.6), opacity:0.3, rotate:PL.degrees(35)}); });
      return Promise.all(jobs).then(function(){
        if(!ops) return doc.save();
        // ops: [{src: page index | null (blank), rot, from: another book's id}] copied in order into a new document
        var srcs = {}, fromIds = ops.map(function(o){ return o.from; }).filter(function(x, k, a){ return x && a.indexOf(x)===k; });
        return Promise.all(fromIds.map(function(id){ return bytesOf(id).then(function(u8){ return PL.PDFDocument.load(u8, {ignoreEncryption:true}); }).then(function(d){ srcs[id] = d; }); })).then(function(){ return PL.PDFDocument.create(); }).then(function(out){
          return ops.reduce(function(pr, o){ return pr.then(function(){
            if(o.src==null){ out.addPage([595.28, 841.89]); return; }
            return out.copyPages(o.from ? srcs[o.from] : doc, [o.src]).then(function(cp){ var pg = out.addPage(cp[0]); if(o.rot) pg.setRotation(PL.degrees(((pg.getRotation().angle||0) + o.rot + 360) % 360)); }); }); }, Promise.resolve()).then(function(){ return out.save(); }); });
      });
    }); }); });
}
function saveEdited(){
  saveProgress(); H.toast(L2("Menyimpan PDF…","Saving the PDF…"));
  buildPdf(RD.b, RD.ed, null).then(function(u8){ return addBook(u8, baseName(RD.b.name)+L2(" (disunting)"," (edited)")+".pdf"); }).then(function(nb){
    var ov = sheet("💾 "+L2("Disimpan","Saved"), '<div class="small">'+L2("PDF baharu dengan suntingan disimpan dalam perpustakaan: ","A new PDF with your edits is in the library: ")+'<b>'+esc(nb.name)+'</b></div><div class="btns" style="margin-top:10px"><button class="btn gold" data-sv="share">📤 '+L2("Kongsi","Share")+'</button><button class="btn alt" data-sv="save">💾 '+L2("Simpan ke peranti","Save to device")+'</button><button class="btn alt" data-sv="open">📖 '+L2("Buka","Open")+'</button></div>');
    ov.querySelectorAll("[data-sv]").forEach(function(x){ x.onclick = function(){ var a = x.getAttribute("data-sv"); if(a==="share") shareFile(nb.id, nb.name, "application/pdf"); else if(a==="save") exportFile(nb.id, nb.name, "application/pdf"); else { closeReader(); openBook(nb.id); } }; });
  }, function(e){ H.toast(L2("Tidak dapat disimpan: ","Could not save: ")+(e.message||e)); });
}

// ---------------- 🧰 PDF tools ----------------
function toolsSheet(){
  var t = function(k, ic, ms, en){ return '<button class="hOpt" data-tl="'+k+'"><span>'+ic+'</span>'+L2(ms, en)+'</button>'; };
  var sh = sheet("🧰 "+L2("Alat PDF","PDF tools"), '<div class="hOpts r3">'+t("etext","✎","Sunting teks","Edit text")+t("sign","✍️","Isi & tandatangan","Fill & sign")+t("org","🗂","Susun halaman","Organise pages")+t("forms","📋","Borang","Forms")+t("txt","📄","Ke teks","To text")+t("docx","📝","Ke Word","To Word")+t("jpg","🖼️","Ke gambar","To images")+
    t("ocr","🔤","Kenal teks (AI)","Recognise text (AI)")+t("num","🔢","Nombor halaman","Page numbers")+t("wm","💧","Tera air","Watermark")+t("comp","🗜","Mampat","Compress")+t("split","✂️","Pisah","Split")+t("info","ℹ️","Maklumat","Info")+'</div>');
  sh.querySelectorAll("[data-tl]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-tl"); sh._close(); tool(k); }; });
}
function tool(k){
  if(k==="sign"){ startEdit(); RD.edit.tool = "sign"; RD.edit.bar(); signSheet(); return; }
  if(k==="etext"){ startEdit(); RD.edit.tool = "etext"; RD.edit.bar(); H.toast(L2("Ketik mana-mana teks untuk menukarnya","Tap any text to change it")); return; }
  if(k==="org"){ organise(); return; }
  if(k==="forms"){ forms(); return; }
  if(k==="txt"){ allText().then(function(t){ saveText(t, baseName(RD.b.name)+".txt", "text/plain", "txt"); }); return; }
  if(k==="docx"){ H.toast(L2("Membuat Word…","Making Word…")); allText(true).then(function(pgs){ var u8 = docx(pgs); var id = newId(); writeFile(id, u8, "docx").then(function(){ var nm = baseName(RD.b.name)+".docx", mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; doneSheet(id, nm, mime, L2("Fail Word dibuat (teks sahaja, ikut halaman).","Word file made (text only, page by page).")); }); }); return; }
  if(k==="jpg"){ jpgSheet(); return; }
  if(k==="ocr"){ ocrPage(); return; }
  if(k==="num"){ build({num:true}, L2(" (bernombor)"," (numbered)")); return; }
  if(k==="wm"){ var w = prompt(L2("Teks tera air","Watermark text"), L2("SULIT","CONFIDENTIAL")); if(w) build({wm:w}, L2(" (tera air)"," (watermark)")); return; }
  if(k==="comp"){ compress(); return; }
  if(k==="split"){ var r = prompt(L2("Halaman untuk dikeluarkan (cth. 1-3, 5)","Pages to take out (e.g. 1-3, 5)"), "1-"+Math.min(RD.n, 3)); if(r){ var ps = ranges(r, RD.n); if(!ps.length){ H.toast(L2("Julat tidak sah","Invalid range")); return; } build(null, " ("+r.replace(/\s/g, "")+")", ps.map(function(p){ return {src:p-1}; })); } return; }
  if(k==="info"){ RD.doc.getMetadata().then(function(m){ var i = m.info||{}; sheet("ℹ️ "+L2("Maklumat","Info"), '<table class="htbl"><tbody>'+[["Tajuk","Title",i.Title],["Pengarang","Author",i.Author],["Halaman","Pages",RD.n],["Saiz","Size",fmtSize(RD.b.size||0)],["Dibuat oleh","Made with",i.Producer||i.Creator],["Versi PDF","PDF version",i.PDFFormatVersion]].filter(function(x){ return x[2]; }).map(function(x){ return '<tr><td>'+L2(x[0], x[1])+'</td><td>'+esc(x[2])+'</td></tr>'; }).join("")+'</tbody></table>'); }); return; }
}
function ranges(s, max){ var out = []; String(s).split(/[,;]+/).forEach(function(p){ var m = /^\s*(\d+)\s*(?:-\s*(\d*))?\s*$/.exec(p); if(!m) return; var a = +m[1], b = m[2]==null ? a : (m[2]==="" ? max : +m[2]); for(var i=Math.max(1, a); i<=Math.min(max, b); i++) if(out.indexOf(i)<0) out.push(i); }); return out; }
function build(extra, suffix, ops){
  H.toast(L2("Memproses…","Working…"));
  buildPdf(RD.b, RD.ed, ops||null, extra).then(function(u8){ return addBook(u8, baseName(RD.b.name)+suffix+".pdf"); }).then(function(nb){ doneSheet(nb.id, nb.name, "application/pdf", L2("PDF baharu dalam perpustakaan.","A new PDF is in the library."), true); }, function(e){ H.toast(String(e.message||e)); });
}
function doneSheet(id, name, mime, msg, canOpen){
  var ov = sheet("✅ "+L2("Siap","Done"), '<div class="small">'+esc(msg)+' <b>'+esc(name)+'</b></div><div class="btns" style="margin-top:10px"><button class="btn gold" data-dn="share">📤 '+L2("Kongsi","Share")+'</button><button class="btn alt" data-dn="save">💾 '+L2("Simpan ke peranti","Save to device")+'</button>'+(canOpen ? '<button class="btn alt" data-dn="open">📖 '+L2("Buka","Open")+'</button>' : '')+'</div>');
  ov.querySelectorAll("[data-dn]").forEach(function(x){ x.onclick = function(){ var a = x.getAttribute("data-dn"); if(a==="share") shareFile(id, name, mime); else if(a==="save") exportFile(id, name, mime); else { closeReader(); openBook(id); } }; });
}
function allText(perPage){ H.toast(L2("Membaca teks…","Reading the text…")); var out = [], i = 1; return new Promise(function(res){ var step = function(){ if(i > RD.n){ res(perPage ? out : out.join("\n\n")); return; } pageText(i++).then(function(t){ out.push(t); step(); }); }; step(); }); }
function saveText(t, name, mime, ext){ var id = newId(), u8 = new TextEncoder().encode(t); writeFile(id, u8, ext).then(function(){ doneSheet(id, name, mime, L2("Teks dikeluarkan (",'Text extracted (')+t.length+L2(" aksara)."," characters).")); }); }
// minimal .docx (stored zip): one paragraph per line, a page break between pages
function docx(pages){
  var x = function(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ""); };
  var body = pages.map(function(p, i){ return p.split(/\n+/).map(function(l){ return '<w:p><w:r><w:t xml:space="preserve">'+x(l)+'</w:t></w:r></w:p>'; }).join("")+(i < pages.length-1 ? '<w:p><w:r><w:br w:type="page"/></w:r></w:p>' : ''); }).join("");
  var enc = function(s){ return new TextEncoder().encode(s); };
  return zip([
    ["[Content_Types].xml", enc('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')],
    ["_rels/.rels", enc('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')],
    ["word/document.xml", enc('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/></w:sectPr></w:body></w:document>')]]);
}
var CRC = null;
function crc32(u8){ if(!CRC){ CRC = []; for(var n=0;n<256;n++){ var c = n; for(var k=0;k<8;k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c >>> 0; } } var c2 = 0xFFFFFFFF; for(var i=0;i<u8.length;i++) c2 = CRC[(c2 ^ u8[i]) & 255] ^ (c2 >>> 8); return (c2 ^ 0xFFFFFFFF) >>> 0; }
function zip(files){
  var parts = [], central = [], off = 0, enc = new TextEncoder();
  var u16 = function(v){ return [v & 255, (v>>8) & 255]; }, u32 = function(v){ return [v & 255, (v>>8) & 255, (v>>16) & 255, (v>>>24) & 255]; };
  files.forEach(function(f){ var nm = enc.encode(f[0]), d = f[1], c = crc32(d);
    var lh = new Uint8Array([].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(c), u32(d.length), u32(d.length), u16(nm.length), u16(0)));
    parts.push(lh, nm, d);
    central.push(new Uint8Array([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(c), u32(d.length), u32(d.length), u16(nm.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), nm);
    off += lh.length + nm.length + d.length; });
  var cs = central.reduce(function(a, b){ return a + b.length; }, 0);
  parts = parts.concat(central, [new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cs), u32(off), u16(0)))]);
  var out = new Uint8Array(parts.reduce(function(a, b){ return a + b.length; }, 0)), p = 0; parts.forEach(function(x){ out.set(x, p); p += x.length; }); return out;
}
function renderJpg(n, scale, q){ return RD.doc.getPage(n).then(function(pg){ var vp = pg.getViewport({scale:scale}), c = document.createElement("canvas"); c.width = Math.round(vp.width); c.height = Math.round(vp.height); var x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); return pg.render({canvasContext:x, viewport:vp}).promise.then(function(){ return c.toDataURL("image/jpeg", q||0.88); }); }); }
function jpgSheet(){
  var sh = sheet("🖼️ "+L2("Ke gambar","To images"), '<div class="btns"><button class="btn gold" data-jp="cur">'+L2("Halaman ini","This page")+' ('+RD.p+')</button><button class="btn alt" data-jp="all">'+L2("Semua halaman (ZIP)","All pages (ZIP)")+'</button></div>');
  sh.querySelectorAll("[data-jp]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-jp"); sh._close();
    if(a==="cur"){ renderJpg(RD.p, 2).then(function(d){ if(N().shareImage) N().shareImage(d, baseName(RD.b.name)+" p"+RD.p); else download(new Uint8Array(atob(d.split(",")[1]).split("").map(function(c){ return c.charCodeAt(0); })), "page-"+RD.p+".jpg", "image/jpeg"); }); return; }
    H.toast(L2("Membuat gambar…","Making pictures…")); var files = [], i = 1, step = function(){ if(i > RD.n){ var id = newId(); writeFile(id, zip(files), "zip").then(function(){ doneSheet(id, baseName(RD.b.name)+"-pages.zip", "application/zip", files.length+L2(" gambar JPEG dalam fail ZIP."," JPEG pictures in a ZIP file.")); }); return; }
      var n = i++; renderJpg(n, 1.6).then(function(d){ var bin = atob(d.split(",")[1]), u = new Uint8Array(bin.length); for(var k=0;k<bin.length;k++) u[k] = bin.charCodeAt(k); files.push(["page-"+("00"+n).slice(-3)+".jpg", u]); step(); }); }; step(); }; });
}
function compress(){
  if(!confirm(L2("Mampatkan dengan menukar setiap halaman kepada gambar? Teks tidak lagi boleh dipilih atau dicari.","Compress by turning each page into a picture? Text will no longer be selectable or searchable."))) return;
  H.toast(L2("Memampat…","Compressing…"));
  pdflib().then(function(PL){ return PL.PDFDocument.create().then(function(doc){ var i = 1; return new Promise(function(res, rej){ var step = function(){ if(i > RD.n){ doc.save().then(res, rej); return; } var n = i++;
    RD.doc.getPage(n).then(function(pg){ var v = pg.getViewport({scale:1}); return renderJpg(n, 1.4, 0.6).then(function(d){ return fetch(d).then(function(r){ return r.arrayBuffer(); }).then(function(ab){ return doc.embedJpg(ab); }).then(function(im){ var p = doc.addPage([v.width, v.height]); p.drawImage(im, {x:0, y:0, width:v.width, height:v.height}); }); }); }).then(step, rej); }; step(); }); }); })
    .then(function(u8){ var before = RD.b.size||0; return addBook(u8, baseName(RD.b.name)+L2(" (dimampat)"," (compressed)")+".pdf").then(function(nb){ doneSheet(nb.id, nb.name, "application/pdf", fmtSize(before)+" → "+fmtSize(u8.length)+".", true); }); }, function(e){ H.toast(String(e.message||e)); });
}
function ocrPage(){
  var A = window.HalalAI; if(!A || !A.ready()){ H.toast(L2("Hidupkan AI dalam talian dahulu (Halal › Semak › AI dalam talian)","Turn on the online AI first (Halal › Check › Online AI)")); return; }
  H.toast(L2("AI sedang membaca halaman…","The AI is reading the page…"));
  renderJpg(RD.p, 2, 0.85).then(function(img){ return A.complete([{role:"user", content:[{type:"text", text:"Transcribe all the text on this page exactly, keeping the reading order, headings and lists. Reply with the text only."},{type:"image_url", image_url:{url:img}}]}], 3000, L2, "", "bookocr"); })
    .then(function(r){ var t = r.text.trim(); var sh = sheet("🔤 "+L2("Teks halaman ","Text of page ")+RD.p, '<textarea class="htxt" rows="14" id="bkOt">'+esc(t)+'</textarea><div class="btns" style="margin-top:8px"><button class="btn gold" id="bkOc">📋 '+L2("Salin","Copy")+'</button><button class="btn alt" id="bkOs">📤 '+L2("Kongsi","Share")+'</button></div><div class="mut tiny" style="margin-top:6px">'+esc(r.provider+" · "+r.model)+'</div>');
      sh.querySelector("#bkOc").onclick = function(){ if(N().copyText) N().copyText(t); else { try{ navigator.clipboard.writeText(t); }catch(e){} } H.toast(L2("Disalin","Copied")); };
      sh.querySelector("#bkOs").onclick = function(){ if(N().shareText) N().shareText(t); }; }, function(e){ H.toast(String(e.message||e)); });
}
// organise pages: grid with selection; rotate, delete, move, duplicate, insert blank, extract
function organise(){
  var ops = []; for(var i=0;i<RD.n;i++) ops.push({src:i, rot:0}); var sel = {};
  var sh = sheet("🗂 "+L2("Susun halaman","Organise pages"), '<div class="bkorgb"><button class="chip" data-og="rl">↺</button><button class="chip" data-og="rr">↻</button><button class="chip" data-og="ml">◀</button><button class="chip" data-og="mr">▶</button><button class="chip" data-og="dup">⧉</button><button class="chip" data-og="blank">＋▢</button><button class="chip" data-og="ins">＋📄</button><button class="chip" data-og="del">🗑️</button><button class="chip" data-og="all">☑</button></div><div class="mut tiny" style="margin:4px 0 8px">'+L2("Ketik halaman untuk pilih. ↺↻ putar · ◀▶ alih · ⧉ salin · ＋▢ halaman kosong · ＋📄 halaman dari PDF lain · 🗑️ padam","Tap pages to select. ↺↻ rotate · ◀▶ move · ⧉ duplicate · ＋▢ blank page · ＋📄 pages from another PDF · 🗑️ delete")+'</div><div class="bkorg" id="bkOg"></div><div class="btns" style="margin-top:10px"><button class="btn gold" id="bkOsv">💾 '+L2("Simpan sebagai PDF baharu","Save as a new PDF")+'</button><button class="btn alt" id="bkOex">'+L2("Keluarkan yang dipilih","Extract selected")+'</button></div>');
  var thumbs = {};
  var thumb = function(src){ if(thumbs[src]) return thumbs[src]; thumbs[src] = renderJpg(src+1, 0.3, 0.6); return thumbs[src]; };
  var paint = function(){ var g = sh.querySelector("#bkOg"); g.innerHTML = ops.map(function(o, i){ return '<button class="bkth'+(sel[i] ? ' on' : '')+'" data-oi="'+i+'"><div class="bkthi" style="transform:rotate('+(o.rot||0)+'deg)">'+(o.src==null ? '<div class="bkblank"></div>' : o.from ? '<div class="bkblank bkfrom">📄<small>'+esc(o.nm||"")+'<br>'+(o.src+1)+'</small></div>' : '<img data-src="'+o.src+'" alt="">')+'</div><span>'+(i+1)+'</span></button>'; }).join("");
    g.querySelectorAll("img[data-src]").forEach(function(im){ thumb(+im.getAttribute("data-src")).then(function(d){ im.src = d; }); });
    g.querySelectorAll("[data-oi]").forEach(function(b){ b.onclick = function(){ var i = +b.getAttribute("data-oi"); sel[i] = !sel[i]; b.classList.toggle("on", !!sel[i]); }; }); };
  var picked = function(){ return Object.keys(sel).filter(function(k){ return sel[k]; }).map(Number).sort(function(a, b){ return a-b; }); };
  sh.querySelectorAll("[data-og]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-og"), p = picked();
    if(a==="all"){ var allOn = p.length===ops.length; sel = {}; if(!allOn) ops.forEach(function(o, i){ sel[i] = true; }); paint(); return; }
    if(a==="ins"){ var others = list().filter(function(b){ return b.id!==RD.b.id && b.pages; }); if(!others.length){ H.toast(L2("Tiada PDF lain dalam perpustakaan","No other PDFs in the library")); return; }
      var s2 = sheet("＋📄 "+L2("Masukkan halaman dari","Insert pages from"), others.map(function(b){ return '<button class="hhist" data-ib="'+b.id+'"><span class="hhs">'+esc(baseName(b.name))+'</span><span class="mut tiny">'+b.pages+L2(" hlm"," pp")+'</span></button>'; }).join(""));
      s2.querySelectorAll("[data-ib]").forEach(function(x){ x.onclick = function(){ var ob = get(x.getAttribute("data-ib")), r = prompt(L2("Halaman (cth. 1-3, 5)","Pages (e.g. 1-3, 5)"), "1-"+ob.pages); if(r==null) return; var ps = ranges(r||("1-"+ob.pages), ob.pages); if(!ps.length){ H.toast(L2("Julat tidak sah","Invalid range")); return; }
        var at = p.length ? p[p.length-1]+1 : ops.length; ops.splice.apply(ops, [at, 0].concat(ps.map(function(n){ return {src:n-1, rot:0, from:ob.id, nm:baseName(ob.name)}; }))); sel = {}; s2._close(); paint(); H.toast(ps.length+L2(" halaman dimasukkan"," pages inserted")); }; }); return; }
    if(!p.length && a!=="blank"){ H.toast(L2("Pilih halaman dahulu","Select pages first")); return; }
    if(a==="rl" || a==="rr") p.forEach(function(i){ ops[i].rot = ((ops[i].rot||0) + (a==="rr" ? 90 : -90) + 360) % 360; });
    else if(a==="del"){ if(p.length===ops.length){ H.toast(L2("Sekurang-kurangnya satu halaman mesti tinggal","At least one page must stay")); return; } ops = ops.filter(function(o, i){ return !sel[i]; }); sel = {}; }
    else if(a==="dup"){ var ns = {}; for(var j=p.length-1;j>=0;j--){ ops.splice(p[j]+1, 0, JSON.parse(JSON.stringify(ops[p[j]]))); } sel = ns; }
    else if(a==="blank"){ var at = p.length ? p[p.length-1]+1 : ops.length; ops.splice(at, 0, {src:null}); sel = {}; }
    else if(a==="ml" && p[0] > 0){ p.forEach(function(i){ var t = ops[i-1]; ops[i-1] = ops[i]; ops[i] = t; }); sel = {}; p.forEach(function(i){ sel[i-1] = true; }); }
    else if(a==="mr" && p[p.length-1] < ops.length-1){ p.slice().reverse().forEach(function(i){ var t = ops[i+1]; ops[i+1] = ops[i]; ops[i] = t; }); sel = {}; p.forEach(function(i){ sel[i+1] = true; }); }
    paint(); }; });
  sh.querySelector("#bkOsv").onclick = function(){ sh._close(); build(null, L2(" (disusun)"," (organised)"), ops); };
  sh.querySelector("#bkOex").onclick = function(){ var p = picked(); if(!p.length){ H.toast(L2("Pilih halaman dahulu","Select pages first")); return; } sh._close(); build(null, L2(" (dipilih)"," (selected)"), p.map(function(i){ return ops[i]; })); };
  paint();
}
function forms(){
  pdflib().then(function(PL){ return bytesOf(RD.b.id).then(function(u8){ return PL.PDFDocument.load(u8, {ignoreEncryption:true}); }).then(function(doc){
    var form = doc.getForm(), fields = form.getFields();
    if(!fields.length){ sheet("📋 "+L2("Borang","Forms"), '<div class="small">'+L2("PDF ini tiada medan borang. Gunakan ✏️ › T (Teks), ✓ dan ✍️ untuk mengisi dan menandatangan di mana-mana.","This PDF has no form fields. Use ✏️ › T (Text), ✓ and ✍️ to fill in and sign anywhere.")+'</div>'); return; }
    var rows = fields.map(function(f, i){ var nm = f.getName(), ty = f.constructor.name, v = "";
      if(f.getText){ v = f.getText()||""; return '<label class="hfld">'+esc(nm)+'<input class="rin" data-ff="'+i+'" value="'+esc(v)+'"></label>'; }
      if(f.isChecked) return '<label class="pdchk"><input type="checkbox" data-ff="'+i+'"'+(f.isChecked() ? ' checked' : '')+'> '+esc(nm)+'</label>';
      if(f.getOptions && f.select){ var sv = (f.getSelected ? f.getSelected() : [])||[]; return '<label class="hfld">'+esc(nm)+'<select class="rin" data-ff="'+i+'">'+f.getOptions().map(function(o){ return '<option'+(sv.indexOf(o)>=0 ? ' selected' : '')+'>'+esc(o)+'</option>'; }).join("")+'</select></label>'; }
      return ''; }).join("");
    var sh = sheet("📋 "+L2("Isi borang","Fill the form")+" ("+fields.length+")", rows+'<label class="pdchk"><input type="checkbox" id="bkFlat"> '+L2("Ratakan (medan tidak boleh diubah lagi)","Flatten (fields can no longer be changed)")+'</label><button class="btn gold full" id="bkFsv">💾 '+L2("Simpan PDF","Save PDF")+'</button>');
    sh.querySelector("#bkFsv").onclick = function(){
      sh.querySelectorAll("[data-ff]").forEach(function(inp){ var f = fields[+inp.getAttribute("data-ff")]; try{ if(f.setText) f.setText(inp.value); else if(f.check){ if(inp.checked) f.check(); else f.uncheck(); } else if(f.select) f.select(inp.value); }catch(e){} });
      if(sh.querySelector("#bkFlat").checked) try{ form.flatten(); }catch(e){}
      sh._close(); doc.save().then(function(out){ return addBook(out, baseName(RD.b.name)+L2(" (diisi)"," (filled)")+".pdf"); }).then(function(nb){ doneSheet(nb.id, nb.name, "application/pdf", L2("Borang disimpan sebagai PDF baharu.","The form was saved as a new PDF."), true); }, function(e){ H.toast(String(e.message||e)); }); };
  }); }).catch(function(e){ H.toast(String(e.message||e)); });
}

// ---------------- entry points ----------------
window.BooksView = {
  // 0.6.12: a PDF already saved in files/books/<id>.pdf by Native.bookFetch (School 📘) joins the library with a cover
  adopt:function(h, id, name, size, extra){ H = h; var b = get(id) || {id:id, name:name, size:size, added:Date.now(), last:0, page:1, pages:0, cover:"", hl:[], bm:[], ed:{}};
    for(var k in (extra||{})) b[k] = extra[k]; b.size = size || b.size; put(b); return cover(b).then(function(){ return b; }, function(){ return b; }); },
  addBytes:function(h, u8, name, extra){ H = h; return addBook(u8, name, extra); },
  view:function(el, h){ H = h; view(el); },
  open:function(id, h){ if(h) H = h; openBook(id); },
  // files arriving from Android (Share / Open with / picker)
  got:function(d, h){ if(h) H = h; var l = d.list||[];
    if(d.bad) H.toast(L2(d.bad+" fail bukan PDF dilangkau",d.bad+" non-PDF files were skipped"));
    l.forEach(function(x){ var b = {id:x.id, name:x.name||"Document.pdf", size:x.size||0, added:Date.now(), last:0, page:1, pages:0, cover:"", hl:[], bm:[], ed:{}}; put(b); });
    var v = document.getElementById("view"); if(v && v.querySelector(".bkhero")) view(v);
    if(l.length===1) openBook(l[0].id); else if(l.length) H.toast(l.length+L2(" PDF ditambah"," PDFs added"));
    l.reduce(function(p, x){ return p.then(function(){ return cover(get(x.id)); }); }, Promise.resolve()).then(function(){ var v2 = document.getElementById("view"); if(v2 && v2.querySelector(".bkhero")) view(v2); }); },
  images:function(imgs, h){ if(h) H = h; imagesToPdf(imgs, document.querySelector("#view .bkhero") ? document.getElementById("view") : null, false); },
  widget:function(h){ H = h; var l = list().filter(function(b){ return b.last; }).sort(function(a, b){ return b.last - a.last; })[0]; return l ? {id:l.id, name:baseName(l.name), cover:l.cover, prog:prog(l), page:l.page, pages:l.pages} : null; },
  navGet:function(){ return null; },
  _t:{zip:zip, docx:docx, ranges:ranges, crc32:crc32, mergeRects:mergeRects, buildPdf:buildPdf, addBook:addBook, bytesOf:bytesOf, list:list, RD:function(){ return RD; }, go:function(n){ go(n, 1); }, next:function(){ next(); }, prev:function(){ prev(); }, zoomAt:function(z){ zoomAt(z, null); }, sentences:sentences, pageModel:function(n){ return pageModel(n); }, autoBox:autoBox, inkPath:inkPath}
};
})();
