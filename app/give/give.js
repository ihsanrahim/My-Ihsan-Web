/* 0.5.14 Derma (Donate) and Hadiah (Gift) pages, opened from the top bar.
   Derma: a free directory of organisations (masjid, zakat, wakaf, humanitarian, orphans, elderly, health, food, dakwah, education).
     The app never handles money: buttons open the organisation's own page, email, phone or WhatsApp. Organisations ask to be
     listed with an in-app form that is emailed to the owner (free for legitimate organisations; paid placement can be discussed).
   Hadiah: Islamic gift ideas from a feed built automatically from the Shopee Affiliate Open API (tools/feeds/shopee_feed.py,
     weekly GitHub Action). Links are affiliate links and are labelled as such. Sellers can ask to be featured with a form.
   Both lists live on GitHub Pages (docs/feeds/*.json) so they grow without an app update; a bundled / cached copy works offline.
   GiveView.derma(el, H), GiveView.gift(el, H); H = {N, esc, L2x, toast, load, save, fetch, showSheet, closeOverlay}. */
(function(){
"use strict";
var OWNER = "myihsan.app@gmail.com";
var BASE = "https://ihsanrahim.github.io/My-Ihsan/feeds/";
var DONATE_URL = BASE + "donate.json", SHOP_URL = BASE + "shop.json";
var H = null, D = {q:"", cat:""}, G = {cat:""};
function L(a, b){ return H.L2x(a, b); }
function esc(s){ return H.esc(s==null ? "" : String(s)); }
function open(u){ if(H.N && H.N.openUrl) H.N.openUrl(u); else window.open(u, "_blank"); }
function mail(subject, body){ open("mailto:"+OWNER+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body)); }
function telUrl(t){ var n = String(t).replace(/[^0-9+]/g, ""); if(n.charAt(0)==="0" && n.indexOf("1300")!==0 && n.indexOf("1800")!==0) n = "+60"+n.slice(1); return "tel:"+n; }
function waUrl(t){ var n = String(t).replace(/[^0-9]/g, ""); if(n.charAt(0)==="0") n = "60"+n.slice(1); return "https://wa.me/"+n; }

// newest list: remote (when online) > cached > bundled
function feed(key, url, bundled, done){
  var c = H.load(key, null), best = c && c.v && (!c._src || c._src === url) ? c : bundled;   // 0.7.81: a cached list from another source is not reused
  done(best, false);
  if(!H.fetch) return;
  H.fetch(url, function(st, body){ if(st!==200) return; try{ var j = JSON.parse(body); if(j && j.v){ j._src = url; H.save(key, j); done(j, true); } }catch(e){} });   // 0.7.82: the list just fetched always wins (dates in different formats compared as text kept an old list)
}

// ---------------- 0.5.87 (owner): Donate to My Ihsan ----------------
// A sticky header on the Donate page. Tap: the owner's DuitNow QR codes (Touch 'n Go eWallet, Maybank; tap one to save it to the phone)
// and the Maybank account details (tap a row to copy it). Money goes straight to the owner's own account; the app never handles it.
var ME = {name:"Muhammad Ihsan Bin Abd Rahim", acct:"162384842254", bank:"Maybank", mail:"myihsan.app@gmail.com",
  qr:[["give/qr_tng.png", "Touch 'n Go eWallet", "MyIhsan-TouchNGo-QR.png"], ["give/qr_maybank.png", "Maybank", "MyIhsan-Maybank-QR.png"]]};
function meCard(){ return '<div class="gvMeW"><button class="gvMe" id="gvMe"><span class="gvMeI">💚</span><span class="gvMeT"><b>' + L("Derma kepada My Ihsan", "Donate to My Ihsan") + '</b><small>' +
  L("Bantu kami teruskan projek ini untuk semua", "Help keep this project going for everyone") + '</small></span><span class="gvMeG">' + L("Derma", "Donate") + ' ›</span></button></div>'; }
function copy(t, what){ try{ if(window.Native && H.N && H.N.copyText) H.N.copyText(t); else navigator.clipboard.writeText(t); }catch(e){} H.toast("📋 " + what + " " + L("disalin", "copied")); }
function asDataUrl(src, cb){ var x = new XMLHttpRequest(); x.open("GET", src); x.responseType = "blob"; x.onload = function(){ var r = new FileReader(); r.onload = function(){ cb(r.result); }; r.readAsDataURL(x.response); }; x.onerror = function(){ cb(null); }; x.send(); }
function saveQr(q){ asDataUrl(q[0], function(d){ if(!d){ H.toast(L("Gambar tidak dapat dibuka", "The picture could not be opened")); return; }
  var N = H.N || {};
  if(window.Native && N.imageSave && N.imageSave(q[2], d)){ H.toast("✓ " + L("Disimpan dalam Gambar › My Ihsan", "Saved in Pictures › My Ihsan")); return; }
  if(window.Native && N.shareImage){ N.shareImage(d, q[1] + " · My Ihsan"); return; }   // older Android: share it, then save from there
  var a = document.createElement("a"); a.href = d; a.download = q[2]; document.body.appendChild(a); a.click(); a.remove(); }); }
function support(){ var ov = document.getElementById("overlay"); ov.className = "gvSupOv";
  var CPY = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var row = function(k, label, val, show){ return '<button class="gvRow" data-cp="' + k + '"><span><small>' + label + '</small><b>' + esc(show || val) + '</b></span><i class="gvCp"><em>' + L("Salin", "Copy") + '</em>' + CPY + '</i></button>'; };
  ov.innerHTML = '<div class="gvSup"><div class="gvSupTop"><b>💚 ' + L("Derma kepada My Ihsan", "Donate to My Ihsan") + '</b><button class="chip g3d" id="gvSupX">✕</button></div><div class="gvSupB">' +
    '<div class="gvSupMsg"><div class="gvSupArt">🌙</div><p>' + L("My Ihsan dibina untuk semua, dan percuma digunakan. Waktu solat, al-Quran, sekolah, kewangan, keluarga dan banyak lagi, dalam satu aplikasi.",
      "My Ihsan is built for everyone, and it is free to use. Prayer times, the Quran, school, money, family and much more, in one app.") + '</p><p>' +
    L("Sumbangan anda membantu menambah kandungan baharu, menguji dengan teliti dan membangunkan ciri yang bermanfaat, supaya lebih ramai keluarga, pelajar dan warga emas mendapat manfaat. Setiap ringgit, sekecil mana pun, sangat dihargai.",
      "Your donation helps add new content, test carefully and develop useful features, so more families, students and elders can benefit. Every ringgit, however small, is truly appreciated.") + '</p><p class="gvSupDua">' +
    L("Semoga Allah membalas kebaikan anda dan menjadikannya sedekah yang berterusan. Jazakallahu khairan.", "May Allah reward your kindness and make it a lasting charity. Jazakallahu khairan.") + '</p></div>' +
    '<div class="snl">📱 ' + L("Imbas DuitNow QR", "Scan the DuitNow QR") + '</div><div class="gvQrs">' + ME.qr.map(function(q, i){ return '<div class="gvQr"><button class="gvQrF" data-qz="' + i + '" aria-label="' + L("Besarkan", "Enlarge") + '"><img src="' + q[0] + '" alt="' + esc(q[1]) + '"><span class="gvQrZ">🔍</span></button><b>' + esc(q[1]) + '</b><button class="chip g3d gvQrS" data-qr="' + i + '">⬇️ ' + L("Simpan", "Save") + '</button></div>'; }).join("") + '</div>' +
    '<div class="mut tiny" style="margin:4px 2px 10px">' + L("Ketik QR untuk besarkan dan tangkap layar, atau ⬇️ Simpan. Kemudian buka aplikasi bank atau e-dompet anda dan imbas dari galeri.", "Tap a QR to enlarge it for a screenshot, or ⬇️ Save it. Then open your bank or e-wallet app and scan it from your gallery.") + '</div>' +
    '<div class="snl">🏦 ' + L("Atau pindahan bank", "Or a bank transfer") + '</div><div class="gvRows">' + row("acct", ME.bank + " · " + L("No. akaun", "Account no."), ME.acct, ME.acct.replace(/(\d{4})(?=\d)/g, "$1 ")) + row("name", L("Nama", "Name"), ME.name) + row("mail", L("Emel (resit atau pertanyaan)", "Email (receipts or questions)"), ME.mail) + '</div>' +
    '<div class="mut tiny" style="margin:8px 2px 20px">' + L("Ketik mana-mana baris untuk salin. Sumbangan masuk terus ke akaun pembangun My Ihsan; aplikasi ini tidak memegang wang anda.", "Tap any row to copy it. Donations go straight to the My Ihsan developer's account; the app never holds your money.") + '</div></div></div>';
  var close = function(){ H.closeOverlay(); };
  ov._close = close; ov.querySelector("#gvSupX").onclick = close;
  ov.querySelectorAll("[data-qr]").forEach(function(b){ b.onclick = function(){ saveQr(ME.qr[+b.getAttribute("data-qr")]); }; });
  ov.querySelectorAll("[data-qz]").forEach(function(b){ b.onclick = function(){ var q = ME.qr[+b.getAttribute("data-qz")], z = document.createElement("div"); z.className = "gvZoom";   // 0.5.88 (owner): big and clear for a screenshot
    z.innerHTML = '<img src="' + q[0] + '" alt=""><div class="gvZoomB"><button class="chip g3d" data-zs="1">⬇️ ' + L("Simpan", "Save") + '</button><button class="chip g3d" data-zx="1">✕ ' + L("Tutup", "Close") + '</button></div>';
    z.onclick = function(e){ if(e.target.closest("[data-zs]")){ saveQr(q); return; } z.remove(); }; ov.appendChild(z); }; });
  ov.querySelectorAll("[data-cp]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-cp");
    copy(ME[k], k === "acct" ? L("No. akaun", "Account number") : k === "name" ? L("Nama", "Name") : L("Emel", "Email")); b.classList.add("ok"); setTimeout(function(){ b.classList.remove("ok"); }, 1200); }; }); }

// ---------------- Derma ----------------
function derma(el){
  feed("ihsan_donate", DONATE_URL, window.DONATE_DATA, function(data, fresh){ if(!fresh || document.body.contains(el)) drawDerma(el, data); });
}
function drawDerma(el, data){
  // 0.5.27: only organisations you can actually donate to (a donation page or website) are listed
  var cats = data.cats || [], orgs = (data.orgs || []).filter(function(o){ return o.donate || o.web; }), q = D.q.toLowerCase();
  var f = orgs.filter(function(o){ return (!D.cat || o.cat===D.cat) && (!q || (o.n+" "+o.area+" "+(o.d||[]).join(" ")).toLowerCase().indexOf(q)>=0); });
  f.sort(function(a, b){ return (b.ok ? 1 : 0) - (a.ok ? 1 : 0) || (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || a.n.localeCompare(b.n); });
  var cnt = function(k){ return orgs.filter(function(o){ return o.cat===k; }).length; };
  var h = meCard() + '<div class="card gvhero"><div class="gvh"><span class="gvic">🤲</span><div><b>'+L("Derma","Donate")+'</b><div class="mut small">'+L("Masjid, zakat, wakaf, anak yatim, kemanusiaan dan lain-lain di sekitar Kuala Lumpur. My Ihsan tidak mengutip wang: anda menderma terus kepada organisasi.","Masjid, zakat, waqf, orphans, humanitarian causes and more around Kuala Lumpur. My Ihsan never collects money: you give directly to the organisation.")+'</div></div></div>'+
    '<input id="gvQ" class="rin" type="search" placeholder="🔎 '+L("Cari organisasi atau kawasan","Search organisations or areas")+'" value="'+esc(D.q)+'"></div>';
  h += '<div class="gvcats">'+[["", "🤲", "Semua", "All"]].concat(cats).map(function(c){ var n = c[0] ? cnt(c[0]) : orgs.length; if(c[0] && !n) return ""; return '<button class="chip g3d'+(D.cat===c[0] ? ' on' : '')+'" data-gc="'+c[0]+'">'+c[1]+' '+esc(L(c[2], c[3]))+' <small>'+n+'</small></button>'; }).join("")+'</div>';
  h += f.map(function(o){ var cat = cats.filter(function(c){ return c[0]===o.cat; })[0] || ["", "🤲", "", ""], b = [];
    if(o.donate || o.web) b.push('<button class="btn gold" data-gvu="'+esc(o.donate || o.web)+'">💝 '+L("Derma","Donate")+'</button>');
    if(o.web && o.donate && o.web!==o.donate) b.push('<button class="chip g3d" data-gvu="'+esc(o.web)+'">🌐 '+L("Laman","Website")+'</button>');
    if(o.tel) b.push('<button class="chip g3d" data-gvu="'+esc(telUrl(o.tel))+'">📞 '+esc(o.tel)+'</button>');
    if(o.wa) b.push('<button class="chip g3d" data-gvu="'+esc(waUrl(o.wa))+'">💬 WhatsApp</button>');
    if(o.email) b.push('<button class="chip g3d" data-gvu="mailto:'+esc(o.email)+'">✉️ '+L("Emel","Email")+'</button>');
    if(!o.ok || (!o.tel && !o.email)){ var qq = o.q || o.n; b.push('<button class="chip g3d" data-gvu="https://www.google.com/search?q='+encodeURIComponent(qq)+'">🔎 '+L("Cari","Search")+'</button>'); b.push('<button class="chip g3d" data-gvu="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(qq)+'">🗺 '+L("Peta","Map")+'</button>'); }
    return '<div class="card gvorg"><div class="gvot"><span class="gvoic">'+cat[1]+'</span><div class="gvon"><b>'+esc(o.n)+'</b><div class="mut tiny">'+esc(L(cat[2], cat[3]))+' · '+esc(o.area||"")+'</div></div>'+
      (o.ok ? '<span class="gvok" title="'+esc((o.src||"")+" · "+(o.chk||""))+'">✅ '+L("Disemak","Checked")+'</span>' : '<span class="gvpend">⏳ '+L("Belum disemak","Not checked yet")+'</span>')+'</div>'+
      (o.d ? '<div class="small gvod">'+esc(L(o.d[0], o.d[1]))+'</div>' : '')+(o.reg ? '<div class="mut tiny">'+L("No. daftar: ","Reg. no.: ")+esc(o.reg)+'</div>' : '')+
      '<div class="gvbtns">'+b.join("")+'</div><button class="gvrep" data-rep="'+esc(o.id)+'">⚠ '+L("Lapor maklumat salah","Report wrong details")+'</button></div>'; }).join("") ||
    '<div class="card mut small">'+L("Tiada padanan.","No match.")+'</div>';
  h += '<div class="card gvjoin"><h3>➕ '+L("Senaraikan organisasi anda","List your organisation")+'</h3><div class="small">'+L("Masjid, surau, yayasan, rumah anak yatim, pusat tahfiz dan NGO berdaftar boleh disenaraikan PERCUMA selepas disemak. Penempatan berbayar (di atas senarai) boleh dibincangkan.","Masjid, surau, foundations, orphanages, tahfiz centres and registered NGOs can be listed FREE after a check. Paid placement (top of the list) can be discussed.")+'</div>'+
    '<button class="btn alt full g3d" id="gvJoin" style="margin-top:8px">📝 '+L("Isi borang permohonan","Fill in the request form")+'</button></div>';
  h += '<div class="mut tiny" style="padding:4px 4px 14px;line-height:1.45">'+L("Sentiasa sahkan sebelum menderma: semak nombor pendaftaran (ROS, SSM, JKM atau jabatan agama), akaun bank atas nama organisasi, dan permit kutipan. Senarai dikemas kini ","Always check before giving: the registration number (ROS, SSM, JKM or religious department), a bank account in the organisation's name, and the collection permit. List updated ")+esc(data.updated||"")+'.</div>';
  el.innerHTML = h;
  var me = el.querySelector("#gvMe"); if(me) me.onclick = support;
  var qi = el.querySelector("#gvQ"); qi.oninput = function(){ D.q = qi.value; var p = qi.selectionStart; drawDerma(el, data); var q2 = el.querySelector("#gvQ"); q2.focus(); try{ q2.setSelectionRange(p, p); }catch(e){} };
  el.querySelectorAll("[data-gc]").forEach(function(b){ b.onclick = function(){ D.cat = b.getAttribute("data-gc"); drawDerma(el, data); }; });
  el.querySelectorAll("[data-gvu]").forEach(function(b){ b.onclick = function(){ open(b.getAttribute("data-gvu")); }; });
  el.querySelectorAll("[data-rep]").forEach(function(b){ b.onclick = function(){ var o = orgs.filter(function(x){ return x.id===b.getAttribute("data-rep"); })[0];
    mail("My Ihsan Derma: wrong details for "+o.n, "Organisation: "+o.n+" ("+o.id+")\nWhat is wrong:\n\nCorrect details:\n\n"); }; });
  el.querySelector("#gvJoin").onclick = function(){ joinForm(cats); };
}
function form(title, fields, note, send){
  var ov = H.showSheet(title, '<div class="gvform">'+fields.map(function(f){ var id = "gvf_"+f[0];
      if(f[2]==="sel") return '<label class="hfld">'+esc(f[1])+'<select id="'+id+'">'+f[3].map(function(o){ return '<option value="'+esc(o[0])+'">'+esc(o[1])+'</option>'; }).join("")+'</select></label>';
      if(f[2]==="area") return '<label class="hfld">'+esc(f[1])+'<textarea id="'+id+'" rows="3" class="rin"></textarea></label>';
      return '<label class="hfld">'+esc(f[1])+(f[3] ? ' *' : '')+'<input id="'+id+'" class="rin" type="'+(f[2]||"text")+'"></label>'; }).join("")+
    '<div class="mut tiny" style="margin:6px 0 8px;line-height:1.45">'+note+'</div><button class="btn gold full" id="gvSend">✉️ '+L("Hantar melalui emel","Send by email")+'</button></div>');
  ov.querySelector("#gvSend").onclick = function(){ var v = {}, miss = null;
    fields.forEach(function(f){ var e = ov.querySelector("#gvf_"+f[0]); v[f[0]] = e ? e.value.trim() : ""; if(f[3]===true && !v[f[0]] && !miss) miss = f[1]; });
    if(miss){ H.toast(L("Sila isi: ","Please fill in: ")+miss); return; }
    send(v, fields); H.closeOverlay(); H.toast(L("Aplikasi emel dibuka. Tekan Hantar di sana.","Your email app opened. Tap Send there.")); };
}
function body(v, fields){ return fields.map(function(f){ var val = v[f[0]]; if(f[2]==="sel"){ var o = f[3].filter(function(x){ return x[0]===val; })[0]; val = o ? o[1] : val; } return f[1]+": "+(val||"-"); }).join("\n")+"\n\nSent from My Ihsan"; }
function joinForm(cats){
  var fields = [["name", L("Nama organisasi","Organisation name"), "text", true], ["cat", L("Kategori","Category"), "sel", cats.map(function(c){ return [c[0], L(c[2], c[3])]; })],
    ["reg", L("No. pendaftaran (ROS / SSM / JKM / jabatan agama)","Registration no. (ROS / SSM / JKM / religious dept.)"), "text", true], ["addr", L("Alamat","Address"), "area"],
    ["web", L("Laman web / Facebook","Website / Facebook"), "url"], ["donate", L("Pautan derma rasmi","Official donation link"), "url"], ["email", L("Emel rasmi","Official email"), "email", true],
    ["tel", L("Telefon / WhatsApp","Phone / WhatsApp"), "tel", true], ["bank", L("Nama pemegang akaun bank","Bank account holder name"), "text"], ["person", L("Nama & jawatan anda","Your name & role"), "text", true],
    ["plan", L("Jenis penyenaraian","Listing type"), "sel", [["free", L("Percuma (selepas disemak)","Free (after a check)")], ["paid", L("Berbayar: mahu berbincang","Paid: would like to discuss")]]], ["note", L("Nota","Notes"), "area"]];
  form("➕ "+L("Senaraikan organisasi","List an organisation"), fields, L("Kami akan menyemak pendaftaran dan hubungan sebelum menyenaraikan. Jangan hantar kata laluan atau maklumat peribadi sensitif.","We check the registration and contacts before listing. Do not send passwords or sensitive personal data."),
    function(v, f){ mail("My Ihsan Derma: listing request · "+v.name, body(v, f)); });
}

// ---------------- Hadiah ----------------
// 0.7.79 (owner: no Shopee API, hand-picked affiliate links): the list lives in the owner's Google Sheet, edited at myihsan.app/admin.
// feeds/gifts.json on the website (and its backup copy) says where the Sheet's feed is; until it is set, the old GitHub Pages list.
var GIFT_PTR = ["https://myihsan.app/feeds/gifts.json", "https://ihsanrahim.github.io/My-Ihsan-Wifi/feeds/gifts.json"];
// 0.7.81: the saved Sheet address is used at once, and the website is asked again on every open; when the owner moves to a new
// Sheet the page switches straight away (before: up to 6 hours on the old one)
function giftSrc(cb){ var c = H.load("ihsan_giftsrc", null), cur = (c && c.url) || SHOP_URL; cb(cur);
  if(!H.fetch) return;
  var i = 0, next = function(){ if(i >= GIFT_PTR.length) return;
    H.fetch(GIFT_PTR[i++], function(st, body){ if(st !== 200) return next(); var u = ""; try{ u = String(JSON.parse(body).url || ""); }catch(e){ u = ""; }
      if(u && !/^https:\/\/script\.google(usercontent)?\.com\//.test(u)) u = ""; H.save("ihsan_giftsrc", {t: Date.now(), url: u}); var nu = u || SHOP_URL; if(nu !== cur) cb(nu); }); };
  next(); }
function gift(el){ var want = "";
  giftSrc(function(url){ want = url; feed("ihsan_shop", url, window.SHOP_DATA || null, function(data, fresh){ if(url !== want) return; if(!fresh || document.body.contains(el)) drawGift(el, data); }); });
}
// 0.7.80: a Drive photo (lh3 link) that does not open tries Drive's thumbnail address once; dates show as "26 Nov 2026"
window.gvImgErr = function(im){ var m = /lh3\.googleusercontent\.com\/d\/([\w-]+)/.exec(im.src); if(m && !im._t){ im._t = 1; im.src = "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w800"; return; } im.remove(); };
function day(v){ var d = /^\d{4}-\d\d-\d\d/.test(String(v||"")) ? new Date(String(v).slice(0, 10) + "T12:00:00") : new Date(v); if(!v || isNaN(d)) return String(v||""); return d.getDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]+" "+d.getFullYear(); }
function money(p, cur){ if(p==null) return ""; return (cur||"RM")+" "+(+p).toFixed(2); }
function drawGift(el, data){
  var cats = (data && data.cats || []).filter(function(c){ return c.items && c.items.length; });
  if(G.cat && !cats.some(function(c){ return c.id===G.cat; })) G.cat = "";
  var h = '<div class="card gvhero"><div class="gvh"><span class="gvic">🎁</span><div><b>'+L("Hadiah Islamik","Islamic gifts")+'</b><div class="mut small">'+L("Telekung, sejadah, Al-Quran, jubah, kurma dan lain-lain: barangan laris yang dipilih satu per satu.","Telekung, prayer mats, Quran, jubah, dates and more: well-rated best sellers, picked one by one.")+'</div></div></div>'+
    '<div class="gvaff">🔗 '+L("Pautan afiliasi: My Ihsan mungkin menerima komisen kecil, tanpa kos tambahan kepada anda. Harga dan stok ikut kedai.","Affiliate links: My Ihsan may earn a small commission at no extra cost to you. Prices and stock are set by the shop.")+'</div></div>';
  if(!cats.length) h += '<div class="card mut small" style="text-align:center;padding:24px">🎁 '+L("Senarai hadiah sedang disediakan. Cuba lagi nanti (perlu internet).","The gift list is being prepared. Try again later (needs the internet).")+'</div>';
  else {
    h += '<div class="gvcats">'+[{id:"", ic:"🎁", ms:"Pilihan", en:"Top picks"}].concat(cats).map(function(c){ return '<button class="chip g3d'+(G.cat===c.id ? ' on' : '')+'" data-gk="'+esc(c.id)+'">'+c.ic+' '+esc(L(c.ms, c.en))+'</button>'; }).join("")+'</div>';
    var items = G.cat ? cats.filter(function(c){ return c.id===G.cat; })[0].items : cats.map(function(c){ return c.items.slice(0, 2).map(function(it){ it._c = c; return it; }); }).reduce(function(a, b){ return a.concat(b); }, []);
    h += '<div class="gvgrid">'+items.map(function(it){ return '<button class="gvit" data-url="'+esc(it.url)+'"><div class="gvimg">'+(it.img ? '<img src="'+esc(it.img)+'" alt="" loading="lazy" onerror="gvImgErr(this)">' : '🎁')+(it.mall ? '<i class="gvmall">Mall</i>' : '')+(it.tag ? '<i class="gvtag">'+esc(it.tag)+'</i>' : '')+'</div>'+
      '<div class="gvin">'+esc(it.n)+'</div><div class="gvip"><b>'+money(it.p, data.cur)+'</b>'+(it.r ? ' <span>⭐'+(+it.r).toFixed(1)+'</span>' : '')+'</div><div class="mut tiny">'+(it.sold ? esc(it.sold)+L(" terjual"," sold") : '')+(it.shop ? ' · '+esc(it.shop) : '')+'</div></button>'; }).join("")+'</div>';
    h += '<div class="mut tiny" style="padding:6px 4px">'+L("Dikemas kini ","Updated ")+esc(day(data.updated))+' · '+esc(data.source||"Shopee")+'</div>';
  }
  h += '<div class="card gvjoin"><h3>🛍 '+L("Penjual: tonjolkan produk anda","Sellers: feature your products")+'</h3><div class="small">'+L("Ada produk Islamik yang berkualiti? Hantar pautan kedai anda untuk dipertimbangkan.","Have quality Islamic products? Send your shop link to be considered.")+'</div><button class="btn alt full g3d" id="gvSell" style="margin-top:8px">📝 '+L("Hubungi kami","Contact us")+'</button></div>';
  el.innerHTML = h;
  el.querySelectorAll("[data-gk]").forEach(function(b){ b.onclick = function(){ G.cat = b.getAttribute("data-gk"); drawGift(el, data); var v = document.getElementById("view"); if(v) v.scrollTop = 0; }; });
  el.querySelectorAll("[data-url]").forEach(function(b){ b.onclick = function(){ var u = b.getAttribute("data-url"); if(u) open(u); }; });
  el.querySelector("#gvSell").onclick = function(){
    var fields = [["shop", L("Nama kedai","Shop name"), "text", true], ["link", L("Pautan kedai / produk (Shopee, Lazada, TikTok, laman sendiri)","Shop / product link (Shopee, Lazada, TikTok, own site)"), "url", true],
      ["cat", L("Kategori produk","Product category"), "text", true], ["halal", L("Sijil halal JAKIM (untuk makanan / kosmetik)","JAKIM halal certificate (food / cosmetics)"), "text"],
      ["email", L("Emel","Email"), "email", true], ["tel", L("Telefon / WhatsApp","Phone / WhatsApp"), "tel"], ["note", L("Nota","Notes"), "area"]];
    form("🛍 "+L("Penjual","Sellers"), fields, L("Produk mesti patuh syariah. Kami akan menghubungi anda jika sesuai.","Products must be Shariah-compliant. We will contact you if it is a fit."), function(v, f){ mail("My Ihsan Hadiah: seller · "+v.shop, body(v, f)); }); };
}
window.GiveView = {derma:function(el, h){ H = h; derma(el); }, gift:function(el, h){ H = h; gift(el); }, _t:{telUrl:telUrl, waUrl:waUrl}};
})();
