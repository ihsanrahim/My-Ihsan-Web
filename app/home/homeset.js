/* 0.4.3 Tetapan › Skrin utama telefon: settings for My Ihsan as the phone's home screen (launcher), laid out like Nova Launcher:
   Home screen, Dock, App drawer, Folders, Look & feel, Gestures, Feed page (later: Widgets, Search, Icons & badges, Backup).
   Values are kept by the native side (Native.homeState / homeSetCfg); the home screen applies them at once. */
(function(){
"use strict";
var H = null, ST = null, CFG = {}, open = {}, saveT = null;
function L(a, b){ return H.L2x(a, b); }
function esc(s){ return H.esc(s==null ? "" : String(s)); }
function N(){ return window.Native || {}; }
function v(k){ return CFG.hasOwnProperty(k) ? CFG[k] : (ST && ST.defs ? ST.defs[k] : undefined); }
function set(k, val){ CFG[k] = val; clearTimeout(saveT); saveT = setTimeout(function(){ if(N().homeSetCfg) N().homeSetCfg(JSON.stringify(CFG)); }, 200); }
function state(){ try{ ST = JSON.parse(N().homeState ? N().homeState() : "{}"); }catch(e){ ST = {}; } CFG = ST.cfg || {}; return ST; }

var ACTS = [["none","Tiada","None"],["drawer","Laci aplikasi","App drawer"],["search","Carian","Search"],["notifications","Pemberitahuan","Notifications"],["quick","Tetapan pantas","Quick settings"],
  ["settings","Tetapan skrin utama","Home screen settings"],["pages","Urus halaman","Manage pages"],["feed","Halaman suapan My Ihsan","My Ihsan feed page"],["main","Halaman utama","Main page"],["widgets","Tambah widget","Add widget"],
  ["wallpaper","Hias latar","Wallpaper"],
  ["assistant","Pembantu suara","Voice assistant"],["statusbar","Tunjuk / sorok bar status","Show / hide status bar"],
  ["ihsan:solat","My Ihsan: Waktu solat","My Ihsan: Prayer times"],["ihsan:quran","My Ihsan: Al-Quran","My Ihsan: Quran"],["ihsan:qibla","My Ihsan: Kiblat","My Ihsan: Qibla"],["ihsan:zikir","My Ihsan: Zikir","My Ihsan: Zikir"],["ihsan:doa","My Ihsan: Doa","My Ihsan: Doa"],["ihsan:rakaat","My Ihsan: Kira rakaat","My Ihsan: Rakaat counter"],["ihsan:halal","My Ihsan: Halal","My Ihsan: Halal"],
  ["app","Buka aplikasi…","Open an app…"]];
var EFFECTS = [["slide","Gelongsor","Slide"],["cube","Kiub","Cube"],["cubein","Kiub dalam","Cube in"],["cards","Kad bertindan","Card stack"],["zoom","Zum","Zoom"],["rotate","Putar","Rotate"],["fade","Pudar","Fade"],["flip","Balik","Flip"],["accordion","Akordion","Accordion"]];
var FEED = [["head","Salam, jam dan tarikh","Greeting, clock and dates"],["prayer","Solat seterusnya","Next prayer"],["cond","Kad mengikut masa (Jumaat, Ma'thurat…)","Timely cards (Jumaat, Ma'thurat…)"],["hadith","Hadis hari ini","Hadith of the day"],["sirah","Sirah hari ini","Today's Sirah"],["fam","Hari lahir keluarga","Family birthdays"],["fin","Kewangan","Finance"],["quick","Butang pantas","Quick buttons"]];

// [type, key, ms, en, extra]   types: n (slider: [min,max,unit]), b (on/off), s (choice: [[v,ms,en]...]), c (colour), x (custom html id)
var SECTIONS = [
  ["home","🏠","Skrin utama","Home screen","Grid, ikon, label, halaman","Grid, icons, labels, pages", [
    ["n","cols","Lajur grid","Grid columns",[2,15,""]],["n","rows","Baris grid","Grid rows",[2,15,""]],["n","iconSize","Saiz ikon","Icon size",[40,160,"%"]],
    ["b","labels","Label ikon","Icon labels"],["n","labelSize","Saiz label","Label size",[8,18,"sp"]],["c","labelColor","Warna label","Label colour"],["b","labelShadow","Bayang label","Label shadow"],["s","labelLines","Baris label","Label lines",[[1,"1","1"],[2,"2","2"]]],
    ["n","padH","Jidar kiri/kanan","Padding left/right",[0,48,"dp"]],["n","padV","Jidar atas/bawah","Padding top/bottom",[0,48,"dp"]],
    ["s","homeSearch","Bar carian skrin utama","Home search bar",[["none","Tiada","None"],["top","Atas","Top"],["bottom","Bawah","Bottom"]]],
    ["s","indicator","Penunjuk halaman","Page indicator",[["dots","● ● ●","● ● ●"],["line","▬","▬"],["none","Tiada","None"]]],
    ["s","effect","Kesan peralihan","Transition effect",EFFECTS],["b","infinite","Tatal tanpa henti","Infinite scroll"],["b","wallScroll","Hias latar bergerak bersama halaman","Wallpaper scrolling"],
    ["b","shadow","Bayang atas dan bawah","Top and bottom shadow"],["b","autoAdd","Tambah ikon aplikasi baharu","Add icons of new apps"],["b","lock","Kunci susun atur","Lock layout"],["b","overlapPlace","Benarkan bertindih semasa meletak","Allow overlap when placing"],
    ["x","pagesNote"]]],
  ["dock","⬛","Dok","Dock","Ikon di bawah, latar, halaman","Bottom icons, background, pages", [
    ["b","dock","Tunjuk dok","Show the dock"],["n","dockCols","Ikon dok","Dock icons",[2,15,""]],["n","dockRows","Baris dok","Dock rows",[1,3,""]],["n","dockPages","Halaman dok","Dock pages",[1,5,""]],
    ["n","dockIcon","Saiz ikon dok","Dock icon size",[40,160,"%"]],["b","dockLabels","Label dok","Dock labels"],
    ["s","dockBg","Latar dok","Dock background",[["none","Tiada","None"],["rect","Segi empat","Rectangle"],["round","Bulat","Rounded"]]],["c","dockColor","Warna latar","Background colour"],["n","dockAlpha","Kelegapan latar","Background opacity",[0,100,"%"]]]],
  ["drawer","▦","Laci aplikasi","App drawer","Gaya, grid, carian, aplikasi tersorok","Style, grid, search, hidden apps", [
    ["s","dStyle","Gaya laci","Drawer style",[["vertical","Menegak","Vertical"],["horizontal","Mendatar (halaman)","Horizontal (pages)"],["list","Senarai","List"]]],
    ["n","dCols","Lajur","Columns",[2,15,""]],["n","dRows","Baris (gaya mendatar)","Rows (horizontal style)",[2,15,""]],["b","dMatch","Saiz ikon sama dengan skrin utama","Match home icon size"],["n","dIcon","Saiz ikon","Icon size",[40,160,"%"]],["b","dLabels","Label","Labels"],
    ["c","dBg","Warna latar","Background colour"],["n","dAlpha","Kelegapan latar","Background opacity",[0,100,"%"]],["c","dText","Warna teks","Text colour"],
    ["s","dSearch","Bar carian","Search bar",[["top","Atas","Top"],["bottom","Bawah","Bottom"],["none","Tiada","None"]]],
    ["b","dFreq","Aplikasi kerap digunakan (baris atas)","Frequently used apps (top row)"],["b","dFast","Bar tatal pantas A–Z","A–Z fast scrollbar"],["b","dKeyboard","Papan kekunci terus dibuka","Show keyboard at once"],
    ["b","dAutoClose","Tutup selepas membuka aplikasi","Close after opening an app"],["b","dRemember","Ingat kedudukan","Remember position"],["b","dWorkTab","Aplikasi kerja dalam tab sendiri","Work apps in their own tab"],
    ["s","dAnim","Animasi buka","Opening animation",[["zoom","Zum","Zoom"],["slide","Gelongsor","Slide"],["fade","Pudar","Fade"],["none","Tiada","None"]]],
    ["x","hidden"],["x","groups"]]],
  ["folders","📁","Folder","Folders","Gaya tetingkap, warna, ikon folder","Window style, colours, folder icon", [
    ["s","fMode","Mod","Mode",[["window","Tetingkap","Window"],["full","Skrin penuh","Full screen"],["popup","Timbul","Popup"]]],["b","fShadow","Bayang","Shadow"],["n","fRadius","Bucu bulat","Corner radius",[0,40,"dp"]],
    ["b","fName","Tunjuk nama folder","Show folder name"],["s","fScroll","Arah tatal","Scroll direction",[["horizontal","Mendatar","Horizontal"],["vertical","Menegak","Vertical"]]],
    ["c","fBg","Warna latar","Background colour"],["n","fAlpha","Kelegapan latar","Background opacity",[0,100,"%"]],["b","fLabels","Label","Labels"],["b","fMatch","Saiz ikon sama dengan skrin utama","Match home icon size"],["n","fIcon","Saiz ikon","Icon size",[40,160,"%"]],
    ["s","fStyle","Rupa ikon folder","Folder icon look",[["grid","Grid","Grid"],["stack","Tindan","Stack"],["fan","Kipas","Fan"],["line","Baris","Line"]]],["c","fIconBg","Latar ikon folder","Folder icon background"],["n","fIconAlpha","Kelegapan latar ikon","Icon background opacity",[0,100,"%"]]]],
  ["search","🔍","Carian","Search","Aplikasi, kenalan, pintasan, web, hasil pantas","Apps, contacts, shortcuts, web, quick results", [
    ["b","sApps1Row","Hadkan aplikasi kepada satu baris","Limit apps to one row"],["b","sMicro","Hasil pantas (kalkulator, tukar unit)","Quick results (calculator, unit conversions)"],
    ["b","sContacts","Cari kenalan (dalam telefon sahaja)","Search contacts (on the phone only)"],["b","sContactCards","Butang panggil dan mesej","Call and message buttons"],
    ["b","sShortcuts","Cari pintasan aplikasi","Search app shortcuts"],["b","sFolders","Cari folder","Search folders"],["b","sIhsan","Cari dalam My Ihsan","Search inside My Ihsan"],
    ["s","sWeb","Cadangan web","Web suggestions",[["google","Google","Google"],["ddg","DuckDuckGo","DuckDuckGo"],["none","Tiada","None"]]],["x","providers"],
    ["b","sRecent","Simpan carian terkini","Keep recent searches"],["b","sPrivate","Papan kekunci peribadi","Private keyboard"],["x","searchMore"]]],
  ["widgets","▦","Widget","Widgets","Bucu, jidar, saiz bebas, bertindih","Corners, padding, free resize, overlap", [
    ["n","widgetRadius","Bucu bulat widget","Widget corner radius",[0,40,"dp"]],["n","widgetPad","Jidar widget","Widget padding",[0,24,"dp"]],
    ["b","wFree","Ubah saiz melebihi had widget","Resize beyond the widget's limits"],["b","overlap","Widget bertindih","Widget overlap"],["x","widgetNote"]]],
  ["icons","🖼","Ikon & lencana","Icons & badges","Pek ikon, bentuk, fon label, lencana pemberitahuan","Icon pack, shape, label font, notification badges", [
    ["x","iconPack"],["s","iconShape","Bentuk ikon","Icon shape",[["system","Sistem","System"],["circle","Bulat","Circle"],["squircle","Squircle","Squircle"],["rounded","Segi empat bulat","Rounded square"],["square","Segi empat","Square"],["teardrop","Titisan","Teardrop"],["pebble","Batu","Pebble"]]],
    ["s","labelFont","Fon label","Label font",[["default","Biasa","Default"],["medium","Sederhana","Medium"],["bold","Tebal","Bold"],["condensed","Padat","Condensed"],["light","Nipis","Light"],["serif","Serif","Serif"],["mono","Mono","Mono"]]],
    ["s","badges","Lencana pemberitahuan","Notification badges",[["dots","● Titik","● Dots"],["numbers","③ Nombor","③ Numbers"],["none","Tiada","None"]]],["c","badgeColor","Warna lencana","Badge colour"],["x","badgePerm"]]],
  ["look","🎨","Rupa & rasa","Look & feel","Bar status, putaran, animasi","Status bar, rotation, animation", [
    ["s","appAnim","Animasi buka aplikasi","App opening animation",[["reveal","Dedah","Reveal"],["zoom","Zum","Zoom"],["fade","Pudar","Fade"],["slide","Gelongsor","Slide"],["system","Sistem","System"],["none","Tiada","None"]]],
    ["b","rotate","Benarkan skrin utama berputar","Allow home screen rotation"],["b","anim","Animasi","Animations"],["b","popup","Menu timbul (tekan lama)","Popup menu (long press)"],["b","dropTargets","Sasaran lepas (Buang, Maklumat, Nyahpasang)","Drop targets (Remove, Info, Uninstall)"],["b","undo","Bar buat asal","Undo bar"],
    ["b","statusBar","Tunjuk bar status","Show status bar"],["b","transStatus","Bar status lutsinar","Transparent status bar"],["b","transNav","Bar navigasi lutsinar","Transparent navigation bar"],
    ["s","darkIcons","Ikon gelap pada bar status","Dark status bar icons",[["auto","Auto","Auto"],["on","Ya","On"],["off","Tidak","Off"]]]]],
  ["gestures","👆","Isyarat","Gestures","Leret, ketik dua kali, cubit, butang utama","Swipes, double tap, pinch, home button", [
    ["g","gHome","Butang utama (kali kedua)","Home button (second press)"],["b","gHomeMain","Kembali ke halaman utama dahulu","Go to the main page first"],
    ["g","gUp","Leret ke atas","Swipe up"],["g","gDown","Leret ke bawah","Swipe down"],["g","gLeft","Leret ke kiri (halaman terakhir)","Swipe left (last page)"],["g","gRight","Leret ke kanan (halaman pertama)","Swipe right (first page)"],
    ["g","gDouble","Ketik dua kali","Double tap"],["g","gDoubleUp","Ketik dua kali + leret atas","Double tap + swipe up"],["g","gDoubleDown","Ketik dua kali + leret bawah","Double tap + swipe down"],
    ["g","g2Up","Dua jari leret atas","Two-finger swipe up"],["g","g2Down","Dua jari leret bawah","Two-finger swipe down"],["g","gPinchIn","Cubit ke dalam","Pinch in"],["g","gPinchOut","Cubit ke luar","Pinch out"],
    ["g","gRotL","Putar dua jari (lawan jam)","Two-finger rotation (counter-clockwise)"],["g","gRotR","Putar dua jari (ikut jam)","Two-finger rotation (clockwise)"]]],
  ["feed","📰","Halaman suapan","Feed page","Halaman My Ihsan di kiri (ganti tab Utama)","The My Ihsan page on the left (replaces the Utama tab)", [
    ["b","feed","Tunjuk halaman suapan","Show the feed page"],["n","feedAlpha","Kelegapan kad","Card opacity",[35,100,"%"]],["x","feedCards"],["x","feedCustom"]]],
  ["backup","💾","Sandaran & pulih","Backup & restore","Simpan, pulihkan, import dari Nova, set semula","Save, restore, import from Nova, reset", [["x","backup"]]]
];
window.HomeSet = { SECTIONS:SECTIONS, extra:{} };   // later versions add sections through HomeSet.extra

function row(it){
  var t = it[0], k = it[1], lb = L(it[2], it[3]), val = v(k);
  if(t==="n"){ var e = it[4]; if(val==null) val = e[0]; return '<div class="hsrow"><div class="hsl"><span>'+esc(lb)+'</span><b id="hsv_'+k+'">'+val+e[2]+'</b></div><input type="range" min="'+e[0]+'" max="'+e[1]+'" value="'+val+'" data-hn="'+k+'" data-u="'+e[2]+'"></div>'; }
  if(t==="b") return '<label class="hsrow hsb"><span>'+esc(lb)+'</span><input type="checkbox" data-hb="'+k+'"'+(val ? ' checked' : '')+'></label>';
  if(t==="s") return '<div class="hsrow"><div class="hsl"><span>'+esc(lb)+'</span></div><div class="hsseg">'+it[4].map(function(o){ return '<button class="chip'+(String(val)===String(o[0]) ? ' on' : '')+'" data-hs="'+k+'" data-v="'+o[0]+'">'+esc(L(o[1], o[2]))+'</button>'; }).join("")+'</div></div>';
  if(t==="c") return '<label class="hsrow hsb"><span>'+esc(lb)+'</span><input type="color" data-hc="'+k+'" value="'+esc(val)+'"></label>';
  if(t==="g"){ var a = String(val||"none"), known = ACTS.some(function(x){ return x[0]===a; }), lab = known ? L(ACTS.filter(function(x){ return x[0]===a; })[0][1], ACTS.filter(function(x){ return x[0]===a; })[0][2]) : (a.indexOf("app:")===0 ? "📱 "+appName(a.slice(4)) : a);
    return '<div class="hsrow hsb" data-hg="'+k+'"><span>'+esc(lb)+'</span><button class="chip">'+esc(lab)+' ›</button></div>'; }
  if(t==="x") return custom(k);
  return "";
}
var APPS = null;
function apps(){ if(!APPS){ try{ APPS = JSON.parse(N().homeApps ? N().homeApps() : "[]"); }catch(e){ APPS = []; } } return APPS; }
function appName(key){ var a = apps().filter(function(x){ return x[0]===key; })[0]; return a ? a[1] : key; }
function custom(k){
  if(k==="pagesNote") return '<div class="mut tiny hsnote">'+L("Halaman: tekan lama ruang kosong di skrin utama › Halaman, atau cubit ke dalam. Tekan lama ikon untuk mengalih, membuang atau membuat folder (letak satu aplikasi atas yang lain).","Pages: long-press an empty spot on the home screen › Pages, or pinch in. Long-press an icon to move or remove it, or drop one app on another to make a folder.")+'</div>';
  if(k==="hidden"){ var n = (ST.hidden||[]).length; return '<div class="hsrow hsb" id="hsHidden"><span>🙈 '+L("Aplikasi tersorok","Hidden apps")+'</span><button class="chip">'+n+' ›</button></div>'; }
  if(k==="providers"){ var on = String(v("sProviders")||"").split(","); var P = [["google","Google"],["play","Play Store"],["wiki","Wikipedia"],["maps","Maps"],["spotify","Spotify"],["youtube","YouTube"],["ddg","DuckDuckGo"],["quran","Quran.com"]];
    return '<div class="hsrow"><div class="hsl"><span>'+L("Cari dengan","Search with")+'</span></div><div class="hsseg">'+P.map(function(p){ return '<button class="chip'+(on.indexOf(p[0])>=0 ? ' on' : '')+'" data-prov="'+p[0]+'">'+p[1]+'</button>'; }).join("")+'</div></div>'; }
  if(k==="searchMore") return '<div class="hsrow hsb"><span>'+L("Kebenaran kenalan","Contacts permission")+'</span>'+(ST.contactsOk ? '✅' : '<button class="chip" id="hsCt">'+L("Benarkan","Allow")+'</button>')+'</div><div class="hsrow hsb"><span>'+L("Padam carian terkini","Clear recent searches")+'</span><button class="chip" id="hsClr">🗑</button></div>';
  if(k==="feedCustom"){ var cc = v("feedCustom")||[], D = L("A,I,S,R,K,J,S","S,M,T,W,T,F,S").split(",");
    return '<div class="hsl" style="margin-top:10px"><span>'+L("Kad anda sendiri (muncul ikut masa dan hari)","Your own cards (shown by time and day)")+'</span></div>'+cc.map(function(c, i){ return '<div class="hsrow hsb"><span>'+esc(c.t)+' <small class="mut">'+c.from+':00–'+c.to+':00'+((c.days||[]).length ? ' · '+c.days.map(function(d){ return D[d]; }).join("") : '')+'</small></span><button class="chip" data-cc="'+i+'">✎</button></div>'; }).join("")+'<button class="chip" id="hsCcAdd" style="margin-top:6px">＋ '+L("Kad baharu","New card")+'</button>'; }
  if(k==="backup") return '<div class="btns" style="flex-wrap:wrap"><button class="btn alt" id="hsBkSave">💾 '+L("Simpan ke fail","Save to a file")+'</button><button class="btn alt" id="hsBkLoad">📂 '+L("Pulihkan dari fail","Restore from a file")+'</button><button class="btn alt" id="hsNova">⬇ '+L("Import dari Nova (.novabackup)","Import from Nova (.novabackup)")+'</button><button class="btn alt" id="hsReset">↺ '+L("Set semula susun atur","Reset the layout")+'</button></div>'+
    '<div class="mut tiny hsnote">'+L("Sandaran aplikasi (Tetapan › Sandaran) juga menyimpan skrin utama. Widget dari sandaran atau Nova muncul sebagai jubin \"Ketik untuk tambah semula\" (widget tidak boleh dipindah antara pelancar). Dalam Nova: Tetapan › Sandaran & pulih › Sandarkan, kemudian pilih fail itu di sini.","The app backup (Settings › Backup) also keeps the home screen. Widgets from a backup or from Nova show as \"Tap to add it again\" tiles (a widget cannot move between launchers). In Nova: Settings › Backup & restore › Backup, then choose that file here.")+'</div>';
  if(k==="iconPack"){ var packs = [["", L("Ikon sistem","System icons")]].concat(ST.packs||[]); return '<div class="hsrow"><div class="hsl"><span>'+L("Pek ikon","Icon pack")+'</span></div><div class="hsseg">'+packs.map(function(p){ return '<button class="chip'+(String(v("iconPack")||"")===p[0] ? ' on' : '')+'" data-hs="iconPack" data-v="'+esc(p[0])+'">'+esc(p[1])+'</button>'; }).join("")+'</div>'+((ST.packs||[]).length ? '' : '<div class="mut tiny" style="margin-top:4px">'+L("Pasang pek ikon (cth. dari Play Store) untuk memilihnya di sini. Ikon satu aplikasi: tekan lama › Sunting.","Install an icon pack (e.g. from the Play Store) to choose it here. One app's icon: long-press › Edit.")+'</div>')+'</div>'; }
  if(k==="badgePerm") return '<div class="hsrow hsb"><span>'+L("Akses pemberitahuan (untuk mengira)","Notification access (to count)")+'</span>'+(ST.badgesOk ? '✅' : '<button class="chip" id="hsBadge">'+L("Benarkan","Allow")+'</button>')+'</div><div class="mut tiny">'+L("Hanya bilangan dikira, dalam telefon. Tiada apa disimpan atau dihantar.","Only counts, on the phone. Nothing is stored or sent.")+'</div>';
  if(k==="groups"){ var g = ST.groups||[]; return '<div class="hsl" style="margin-top:8px"><span>📂 '+L("Kumpulan laci (tab atau folder)","Drawer groups (tabs or folders)")+'</span></div>'+g.map(function(x, i){ return '<div class="hsrow hsb"><span>'+(x.tab===false ? '📁 ' : '🗂 ')+esc(x.name)+' <small class="mut">'+((x.apps||[]).length)+'</small></span><button class="chip" data-grp="'+i+'">✎</button></div>'; }).join("")+'<button class="chip" id="hsGrpAdd" style="margin-top:6px">＋ '+L("Kumpulan baharu","New group")+'</button>'; }
  if(k==="widgetNote") return '<div class="mut tiny hsnote">'+L("Setiap widget ada peluncur kelegapan sendiri: tekan lama widget › Kelegapan, bucu, jidar. Widget My Ihsan: hanya latar menjadi lutsinar. Widget aplikasi lain: seluruh widget pudar (had Android). Tambah widget: tekan lama ruang kosong › Widget. Widget \"My Ihsan (pilih widget)\" boleh memaparkan mana-mana widget Utama.","Each widget has its own opacity slider: long-press the widget › Transparency, corners, padding. My Ihsan widgets: only the background becomes see-through. Other apps' widgets: the whole widget fades (an Android limit). Add widgets: long-press an empty spot › Widgets. The \"My Ihsan (choose widget)\" widget can show any Utama widget.")+'</div>';
  if(k==="a11yNote") return '<div class="mut tiny hsnote">* '+L("Kunci skrin, aplikasi terkini, tangkapan skrin dan menu kuasa memerlukan perkhidmatan kebolehcapaian My Ihsan (pilihan).","Lock screen, recent apps, screenshot and power menu need the optional My Ihsan accessibility service.")+' '+(ST.a11y ? '✅' : '<button class="chip" id="hsA11y">'+L("Hidupkan","Turn on")+'</button>')+'</div>';
  if(k==="feedCards"){ var order = (v("feedOrder")||[]).slice(), off = v("feedOff")||[]; FEED.forEach(function(f){ if(order.indexOf(f[0])<0) order.push(f[0]); });
    return '<div class="hsl" style="margin-top:6px"><span>'+L("Kad (susun dan pilih)","Cards (order and choose)")+'</span></div>'+order.map(function(k2, i){ var f = FEED.filter(function(x){ return x[0]===k2; })[0]; if(!f) return "";
      return '<div class="hsrow hsb hsfc"><label><input type="checkbox" data-fo="'+k2+'"'+(off.indexOf(k2)<0 ? ' checked' : '')+'> '+esc(L(f[1], f[2]))+'</label><span><button class="chip" data-fu="'+i+'">▲</button><button class="chip" data-fd="'+i+'">▼</button></span></div>'; }).join(""); }
  if(window.HomeSet.extra[k]) return window.HomeSet.extra[k].html(ctx());
  return "";
}
function ctx(){ return {H:H, ST:ST, CFG:CFG, v:v, set:set, L:L, esc:esc, N:N, apps:apps, redraw:draw}; }

function page(){
  var el = document.getElementById("hsPage"); if(!el){ el = document.createElement("div"); el.id = "hsPage"; el.className = "hspage"; document.body.appendChild(el); }
  return el;
}
function draw(){
  var el = page(), st = ST, sc = el.scrollTop;
  var on = !!st.on, def = !!st.def;
  var h = '<div class="hshead"><button class="chip" id="hsX">‹</button><b>📱 '+L("Skrin utama telefon","Phone home screen")+'</b></div><div class="hsbody">';
  if(!window.Native || !N().homeState) h += '<div class="card mut small">'+L("Tetapan ini berfungsi dalam aplikasi telefon.","These settings work in the phone app.")+'</div>';
  h += '<div class="card hstop"><label class="hsb" style="display:flex;align-items:center;gap:10px"><input type="checkbox" id="hsOn"'+(on ? ' checked' : '')+' style="width:22px;height:22px"><b style="flex:1">'+L("Jadikan My Ihsan skrin utama telefon","Use My Ihsan as the phone's home screen")+'</b></label>'+
    '<div class="mut small" style="margin-top:6px">'+(on && def ? '✅ '+L("My Ihsan ialah skrin utama telefon. Tab Utama kini menjadi halaman suapan di kiri skrin utama.","My Ihsan is the phone's home screen. The Utama tab is now the feed page on the left of the home screen.") : on ? '⚠ '+L("Dihidupkan, tetapi telefon masih menggunakan pelancar lain. Tekan Pilih pelancar.","Turned on, but the phone still uses another launcher. Tap Choose launcher.") : L("Widget telefon, folder, laci aplikasi dan isyarat seperti Nova Launcher, dengan widget My Ihsan.","Phone widgets, folders, app drawer and gestures like Nova Launcher, with My Ihsan widgets."))+'</div>'+
    (on ? '<div class="btns" style="margin-top:8px"><button class="btn alt" id="hsGo">🏠 '+L("Buka skrin utama","Open the home screen")+'</button><button class="btn alt" id="hsPick">'+L("Pilih pelancar","Choose launcher")+'</button></div>' : '')+diag()+'</div>';
  var all = SECTIONS.concat(Object.keys(window.HomeSet.extra).filter(function(k){ return window.HomeSet.extra[k].section; }).map(function(k){ return window.HomeSet.extra[k].section; }));
  all.forEach(function(s){ var isOpen = !!open[s[0]];
    h += '<div class="card hssec'+(isOpen ? ' open' : '')+'"><button class="hshd" data-sec="'+s[0]+'"><span class="hsic">'+s[1]+'</span><span class="hst"><b>'+esc(L(s[2], s[3]))+'</b><small>'+esc(L(s[4], s[5]))+'</small></span><span>'+(isOpen ? '▴' : '▾')+'</span></button>'+
      (isOpen ? '<div class="hsbd">'+s[6].map(row).join("")+'</div>' : '')+'</div>'; });
  h += '<div class="mut tiny" style="padding:6px 6px 30px">'+L("Perubahan digunakan serta-merta pada skrin utama.","Changes apply to the home screen at once.")+'</div></div>';
  el.innerHTML = h; el.scrollTop = sc; bind(el);
}
// 0.4.8: diagnostics for phones where the home screen does not start (shows what Android opens for Home and the last error)
function diag(){
  var mk = String(ST.maker||"").toLowerCase(), honor = /honor|huawei/.test(mk);
  return '<details class="hsdiag" style="margin-top:10px"'+(ST.crash || (ST.on && !ST.def) ? ' open' : '')+'><summary class="small">🩺 '+L("Diagnostik","Diagnostics")+'</summary><div class="mut tiny" style="line-height:1.5;margin-top:6px">'+
    L("Pelancar semasa telefon: ","Phone's current launcher: ")+'<b>'+esc(ST.homePkg||"?")+'</b><br>'+L("Komponen skrin utama: ","Home component: ")+(ST.alias===1 ? '✅' : '⚠ '+ST.alias)+(ST.role!=null ? ' · '+L("Peranan Utama: ","Home role: ")+(ST.role ? '✅' : '⚠') : '')+
    (honor && !ST.def ? '<br>📱 Honor/Huawei: '+L("Tetapan › Aplikasi › Aplikasi lalai › Pelancar › My Ihsan. Jika navigasi isyarat menolak pelancar lain, cuba navigasi 3 butang dahulu.","Settings › Apps › Default apps › Launcher › My Ihsan. If gesture navigation refuses other launchers, try 3-button navigation first.") : '')+
    '<div class="btns" style="margin-top:8px"><button class="btn gold" id="hsRep">📤 '+L("Kongsi laporan pelancar","Share launcher report")+'</button><button class="btn alt" id="hsRepC">📋 '+L("Salin","Copy")+'</button></div>'+
    '<div class="mut tiny" style="margin-top:4px">'+L("Cuba dahulu: pilih My Ihsan sebagai pelancar dan tekan butang Utama, kemudian kembali ke sini dan kongsi laporan.","First try: choose My Ihsan as the launcher and press Home, then come back here and share the report.")+'</div>'+
    (ST.crash ? '<br><br>⚠ '+L("Ralat terakhir skrin utama:","Last home screen error:")+'<pre style="white-space:pre-wrap;font-size:10px;max-height:160px;overflow:auto;background:#0006;padding:6px;border-radius:8px">'+esc(ST.crash.slice(0, 1500))+'</pre><button class="chip" id="hsCrCopy">📋 '+L("Salin","Copy")+'</button> <button class="chip" id="hsCrClr">🗑 '+L("Padam","Clear")+'</button>' : '<br>'+L("Tiada ralat direkodkan.","No errors recorded."))+'</div></details>';
}
function bind(el){
  el.querySelector("#hsX").onclick = close;
  var on = el.querySelector("#hsOn"); on.onchange = function(){ if(N().homeEnable) N().homeEnable(on.checked); setTimeout(function(){ state(); draw(); }, 600); };
  var cc = el.querySelector("#hsCrCopy"); if(cc) cc.onclick = function(){ if(N().copyText) N().copyText(ST.crash); else { try{ navigator.clipboard.writeText(ST.crash); }catch(e){} } H.toast(L("Disalin. Hantar kepada pembangun.","Copied. Send it to the developer.")); };
  var rp = function(share){ var t = N().homeReport ? N().homeReport() : "Report needs the Android app."; if(share && N().shareText) N().shareText(t); else { if(N().copyText) N().copyText(t); else { try{ navigator.clipboard.writeText(t); }catch(e){} } H.toast(L("Laporan disalin","Report copied")); } };
  var r1 = el.querySelector("#hsRep"); if(r1) r1.onclick = function(){ rp(true); }; var r2 = el.querySelector("#hsRepC"); if(r2) r2.onclick = function(){ rp(false); };
  var cr = el.querySelector("#hsCrClr"); if(cr) cr.onclick = function(){ if(N().homeClearCrash) N().homeClearCrash(); state(); draw(); };
  var go = el.querySelector("#hsGo"); if(go) go.onclick = function(){ if(N().homeGo) N().homeGo(); };
  var pk = el.querySelector("#hsPick"); if(pk) pk.onclick = function(){ if(N().homePerm) N().homePerm("home"); };
  el.querySelectorAll("[data-sec]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-sec"); open[k] = !open[k]; draw(); }; });
  el.querySelectorAll("[data-hn]").forEach(function(r){ r.oninput = function(){ var k = r.getAttribute("data-hn"); document.getElementById("hsv_"+k).textContent = r.value+r.getAttribute("data-u"); set(k, +r.value); }; });
  el.querySelectorAll("[data-hb]").forEach(function(c){ c.onchange = function(){ set(c.getAttribute("data-hb"), c.checked); }; });
  el.querySelectorAll("[data-hc]").forEach(function(c){ c.oninput = function(){ set(c.getAttribute("data-hc"), c.value); }; });
  el.querySelectorAll("[data-hs]").forEach(function(b){ b.onclick = function(){ var k = b.getAttribute("data-hs"), val = b.getAttribute("data-v"); set(k, /^\d+$/.test(val) ? +val : val); el.querySelectorAll('[data-hs="'+k+'"]').forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  el.querySelectorAll("[data-hg]").forEach(function(r){ r.onclick = function(){ gesturePick(r.getAttribute("data-hg")); }; });
  var hd = el.querySelector("#hsHidden"); if(hd) hd.onclick = hiddenPick;
  var a11 = el.querySelector("#hsA11y"); if(a11) a11.onclick = function(e){ e.stopPropagation(); if(N().homePerm) N().homePerm("a11y"); };
  el.querySelectorAll("[data-fo]").forEach(function(c){ c.onchange = function(){ var off = (v("feedOff")||[]).filter(function(x){ return x!==c.getAttribute("data-fo"); }); if(!c.checked) off.push(c.getAttribute("data-fo")); set("feedOff", off); }; });
  el.querySelectorAll("[data-fu],[data-fd]").forEach(function(b){ b.onclick = function(){ var up = b.hasAttribute("data-fu"), i = +b.getAttribute(up ? "data-fu" : "data-fd"), order = (v("feedOrder")||[]).slice(); FEED.forEach(function(f){ if(order.indexOf(f[0])<0) order.push(f[0]); }); var j = up ? i-1 : i+1; if(j<0 || j>=order.length) return; var t = order[i]; order[i] = order[j]; order[j] = t; set("feedOrder", order); draw(); }; });
  el.querySelectorAll("[data-prov]").forEach(function(b){ b.onclick = function(){ var on = String(v("sProviders")||"").split(",").filter(Boolean), p = b.getAttribute("data-prov"), i = on.indexOf(p); if(i>=0) on.splice(i,1); else on.push(p); set("sProviders", on.join(",")); b.classList.toggle("on", i<0); }; });
  var ct = el.querySelector("#hsCt"); if(ct) ct.onclick = function(){ if(N().homePerm) N().homePerm("contacts"); setTimeout(function(){ state(); draw(); }, 1500); };
  var bd = el.querySelector("#hsBadge"); if(bd) bd.onclick = function(){ if(N().homePerm) N().homePerm("badges"); };
  el.querySelectorAll("[data-cc]").forEach(function(b){ b.onclick = function(){ cardEdit(+b.getAttribute("data-cc")); }; });
  var ca = el.querySelector("#hsCcAdd"); if(ca) ca.onclick = function(){ cardEdit(-1); };
  var bs = el.querySelector("#hsBkSave"); if(bs) bs.onclick = function(){ var j = N().homeExport ? N().homeExport() : "{}", name = "my-ihsan-home-"+new Date().toISOString().slice(0,10)+".json"; if(N().saveFile) N().saveFile(name, j); else { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([j], {type:"application/json"})); a.download = name; document.body.appendChild(a); a.click(); a.remove(); } };
  var bl = el.querySelector("#hsBkLoad"); if(bl) bl.onclick = function(){ var inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json"; inp.onchange = function(){ var f = inp.files[0]; if(!f) return; var r = new FileReader(); r.onload = function(){ var ok = N().homeImport ? N().homeImport(r.result) : false; H.toast(ok ? "✅ "+L("Skrin utama dipulihkan","Home screen restored") : "⚠ "+L("Bukan sandaran skrin utama","Not a home screen backup")); state(); draw(); }; r.readAsText(f); }; inp.click(); };
  var nv = el.querySelector("#hsNova"); if(nv) nv.onclick = function(){ if(N().homeImportNova) N().homeImportNova(); else H.toast(L("Dalam aplikasi telefon sahaja","In the phone app only")); };
  var rs = el.querySelector("#hsReset"); if(rs) rs.onclick = function(){ if(confirm(L("Kosongkan skrin utama (ikon, folder, widget)? Tetapan kekal.","Clear the home screen (icons, folders, widgets)? Settings stay."))){ if(N().homeReset) N().homeReset(); H.toast(L("Susun atur dikosongkan","Layout cleared")); } };
  var clr = el.querySelector("#hsClr"); if(clr) clr.onclick = function(){ if(N().homeClearRecent) N().homeClearRecent(); H.toast(L("Dipadam","Cleared")); };
  el.querySelectorAll("[data-grp]").forEach(function(b){ b.onclick = function(){ groupEdit(+b.getAttribute("data-grp")); }; });
  var ga = el.querySelector("#hsGrpAdd"); if(ga) ga.onclick = function(){ groupEdit(-1); };
  Object.keys(window.HomeSet.extra).forEach(function(k){ var x = window.HomeSet.extra[k]; if(x.bind) x.bind(el, ctx()); });
}
function gesturePick(k){
  var ov = H.showSheet("👆 "+L("Pilih tindakan","Choose an action"), ACTS.map(function(a){ return '<button class="hhist" data-ga="'+a[0]+'"><span class="hhs">'+esc(L(a[1], a[2]))+'</span>'+(String(v(k))===a[0] ? '✓' : '')+'</button>'; }).join(""));
  ov.querySelectorAll("[data-ga]").forEach(function(b){ b.onclick = function(){ var a = b.getAttribute("data-ga"); H.closeOverlay(); if(a==="app"){ appPick(function(key){ set(k, "app:"+key); draw(); }); return; } set(k, a); draw(); }; });
}
function appPick(cb){
  var ov = H.showSheet("📱 "+L("Pilih aplikasi","Choose an app"), '<input id="hsAq" class="rin" placeholder="🔎" style="margin-bottom:8px"><div id="hsAl"></div>');
  var fill = function(){ var q = ov.querySelector("#hsAq").value.toLowerCase(); ov.querySelector("#hsAl").innerHTML = apps().filter(function(a){ return !q || a[1].toLowerCase().indexOf(q)>=0; }).slice(0, 200).map(function(a){ return '<button class="hhist" data-ak="'+esc(a[0])+'"><span class="hhs">'+esc(a[1])+'</span></button>'; }).join("");
    ov.querySelectorAll("[data-ak]").forEach(function(b){ b.onclick = function(){ H.closeOverlay(); cb(b.getAttribute("data-ak")); }; }); };
  ov.querySelector("#hsAq").oninput = fill; fill();
}
function hiddenPick(){
  var hid = (ST.hidden||[]).slice();
  var ov = H.showSheet("🙈 "+L("Aplikasi tersorok","Hidden apps"), '<div class="mut small" style="margin-bottom:8px">'+L("Tandakan aplikasi untuk disorok dari laci. Carian masih menemuinya.","Tick apps to hide them from the drawer. Search still finds them.")+'</div><input id="hsHq" class="rin" placeholder="🔎" style="margin-bottom:8px"><div id="hsHl"></div><button class="btn gold full" id="hsHs" style="margin-top:8px">'+L("Simpan","Save")+'</button>');
  var fill = function(){ var q = ov.querySelector("#hsHq").value.toLowerCase(); ov.querySelector("#hsHl").innerHTML = apps().filter(function(a){ return !q || a[1].toLowerCase().indexOf(q)>=0; }).map(function(a){ return '<label class="pdchk"><input type="checkbox" data-hk="'+esc(a[0])+'"'+(hid.indexOf(a[0])>=0 ? ' checked' : '')+'> '+esc(a[1])+'</label>'; }).join("");
    ov.querySelectorAll("[data-hk]").forEach(function(c){ c.onchange = function(){ var k = c.getAttribute("data-hk"); hid = hid.filter(function(x){ return x!==k; }); if(c.checked) hid.push(k); }; }); };
  ov.querySelector("#hsHq").oninput = fill; fill();
  ov.querySelector("#hsHs").onclick = function(){ if(N().homeHidden) N().homeHidden(JSON.stringify(hid)); ST.hidden = hid; H.closeOverlay(); draw(); };
}
function groupEdit(i){
  var G = (ST.groups||[]).slice(), g = i>=0 ? JSON.parse(JSON.stringify(G[i])) : {name:L("Kumpulan","Group"), tab:true, apps:[]};
  var ov = H.showSheet("📂 "+L("Kumpulan laci","Drawer group"), '<label class="hfld">'+L("Nama","Name")+'<input id="hsGn" class="rin" value="'+esc(g.name)+'"></label>'+
    '<div class="hsseg" style="margin:8px 0"><button class="chip'+(g.tab!==false ? ' on' : '')+'" data-gt="1">🗂 '+L("Tab di atas laci","Tab at the top of the drawer")+'</button><button class="chip'+(g.tab===false ? ' on' : '')+'" data-gt="0">📁 '+L("Folder dalam laci","Folder in the drawer")+'</button></div>'+
    '<input id="hsGq" class="rin" placeholder="🔎" style="margin-bottom:6px"><div id="hsGl" style="max-height:40vh;overflow:auto"></div><div class="btns" style="margin-top:8px"><button class="btn gold" id="hsGs">'+L("Simpan","Save")+'</button>'+(i>=0 ? '<button class="btn alt" id="hsGd">🗑 '+L("Padam","Delete")+'</button>' : '')+'</div>');
  ov.querySelectorAll("[data-gt]").forEach(function(b){ b.onclick = function(){ g.tab = b.getAttribute("data-gt")==="1"; ov.querySelectorAll("[data-gt]").forEach(function(x){ x.classList.toggle("on", x===b); }); }; });
  var fill = function(){ var q = ov.querySelector("#hsGq").value.toLowerCase(); ov.querySelector("#hsGl").innerHTML = apps().filter(function(a){ return !q || a[1].toLowerCase().indexOf(q)>=0; }).map(function(a){ return '<label class="pdchk"><input type="checkbox" data-gk="'+esc(a[0])+'"'+(g.apps.indexOf(a[0])>=0 ? ' checked' : '')+'> '+esc(a[1])+'</label>'; }).join("");
    ov.querySelectorAll("[data-gk]").forEach(function(c){ c.onchange = function(){ var k = c.getAttribute("data-gk"); g.apps = g.apps.filter(function(x){ return x!==k; }); if(c.checked) g.apps.push(k); }; }); };
  ov.querySelector("#hsGq").oninput = fill; fill();
  ov.querySelector("#hsGs").onclick = function(){ g.name = ov.querySelector("#hsGn").value.trim() || g.name; if(i>=0) G[i] = g; else G.push(g); if(N().homeSetGroups) N().homeSetGroups(JSON.stringify(G)); ST.groups = G; H.closeOverlay(); draw(); };
  var d = ov.querySelector("#hsGd"); if(d) d.onclick = function(){ G.splice(i, 1); if(N().homeSetGroups) N().homeSetGroups(JSON.stringify(G)); ST.groups = G; H.closeOverlay(); draw(); };
}
function cardEdit(i){
  var cc = (v("feedCustom")||[]).slice(), c = i>=0 ? JSON.parse(JSON.stringify(cc[i])) : {t:"", b:"", from:5, to:9, days:[], v:""}, D = L("Ahd,Isn,Sel,Rab,Kha,Jum,Sab","Sun,Mon,Tue,Wed,Thu,Fri,Sat").split(",");
  var ov = H.showSheet("🗒 "+L("Kad suapan","Feed card"), '<label class="hfld">'+L("Tajuk","Title")+'<input id="hsCt1" class="rin" value="'+esc(c.t)+'" placeholder="'+L("cth. Baca Al-Mulk","e.g. Read Al-Mulk")+'"></label><label class="hfld">'+L("Teks","Text")+'<input id="hsCt2" class="rin" value="'+esc(c.b)+'"></label>'+
    '<div class="hsl"><span>'+L("Dari jam","From hour")+'</span><b id="hsCfv">'+c.from+':00</b></div><input type="range" id="hsCf" min="0" max="23" value="'+c.from+'" style="width:100%"><div class="hsl"><span>'+L("Hingga jam","Until hour")+'</span><b id="hsCtv">'+c.to+':00</b></div><input type="range" id="hsCtt" min="1" max="24" value="'+c.to+'" style="width:100%">'+
    '<div class="hsseg" style="margin:8px 0">'+D.map(function(d, k){ return '<button class="chip'+((c.days||[]).indexOf(k)>=0 ? ' on' : '')+'" data-cd="'+k+'">'+d+'</button>'; }).join("")+'</div><div class="mut tiny">'+L("Tiada hari dipilih = setiap hari.","No day chosen = every day.")+'</div>'+
    '<div class="btns" style="margin-top:8px"><button class="btn gold" id="hsCs">'+L("Simpan","Save")+'</button>'+(i>=0 ? '<button class="btn alt" id="hsCd">🗑</button>' : '')+'</div>');
  ov.querySelector("#hsCf").oninput = function(){ c.from = +this.value; ov.querySelector("#hsCfv").textContent = c.from+":00"; };
  ov.querySelector("#hsCtt").oninput = function(){ c.to = +this.value; ov.querySelector("#hsCtv").textContent = c.to+":00"; };
  ov.querySelectorAll("[data-cd]").forEach(function(b){ b.onclick = function(){ var k = +b.getAttribute("data-cd"); c.days = (c.days||[]).filter(function(x){ return x!==k; }); if(!b.classList.contains("on")) c.days.push(k); b.classList.toggle("on"); }; });
  ov.querySelector("#hsCs").onclick = function(){ c.t = ov.querySelector("#hsCt1").value.trim(); c.b = ov.querySelector("#hsCt2").value.trim(); if(!c.t){ H.toast(L("Tulis tajuk","Write a title")); return; } if(i>=0) cc[i] = c; else cc.push(c); set("feedCustom", cc); H.closeOverlay(); draw(); };
  var d = ov.querySelector("#hsCd"); if(d) d.onclick = function(){ cc.splice(i, 1); set("feedCustom", cc); H.closeOverlay(); draw(); };
}
function close(){ var el = document.getElementById("hsPage"); if(el) el.remove(); if(H.onClose) H.onClose(); }
window.HomeSet.open = function(h, sec){ H = h; state(); APPS = null; if(sec) open[sec] = true; draw(); };
window.HomeSet.refresh = function(){ if(document.getElementById("hsPage")){ state(); draw(); } };
window.HomeSet.isOpen = function(){ return !!document.getElementById("hsPage"); };
window.HomeSet.close = close;
})();
