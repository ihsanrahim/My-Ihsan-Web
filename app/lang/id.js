/* My Ihsan 0.25.0: Bahasa Indonesia. The app is written in Malay and English; for Indonesian the Malay text on screen is converted
   word by word and phrase by phrase (Malay → Indonesian vocabulary and spelling). Quran text and Quran translations are not touched.
   This is an automatic conversion: it needs review by a native Indonesian speaker. */
(function(){
"use strict";
// phrases first (longest first), then single words. Keys are lower case Malay.
var PH={
"semak mule":"Semak Mule","untuk menderma":"untuk berdonasi","tanah perkuburan islam":"pemakaman Muslim","tanah perkuburan":"pemakaman","rumah anak yatim":"panti asuhan","rumah jagaan warga emas":"panti jompo","warga emas":"lansia",
"pusat beli-belah":"mal","membeli-belah":"berbelanja","lebuh raya":"jalan tol","lapangan terbang":"bandara","kapal terbang":"pesawat","dalam talian":"daring","luar talian":"luring",
"muat turun":"unduh","dimuat turun":"diunduh","muat naik":"unggah","dimuat naik":"diunggah","kemas kini":"perbarui","dikemas kini":"diperbarui","kata laluan":"kata sandi",
"hari lahir":"ulang tahun","hari jadi":"ulang tahun","mas kahwin":"mahar","solat sunat":"salat sunah","puasa sunat":"puasa sunah","amal sunat":"amalan sunah","mesra oku":"ramah disabilitas",
"muka surat":"halaman","laman web":"situs web","isi kandungan":"daftar isi","pusat zakat":"lembaga zakat","harta pusaka":"harta warisan","berhawa dingin":"ber-AC","jalan kaki":"jalan kaki",
"telefon pintar":"ponsel pintar","telefon bimbit":"ponsel","lokasi semasa":"lokasi saat ini","lebih kurang":"kurang lebih","set semula":"atur ulang","tidak dijumpai":"tidak ditemukan","mod kanak-kanak":"mode anak","kanak-kanak":"anak-anak","tekan lama":"tekan lama","hari raya aidilfitri":"Hari Raya Idulfitri",
"hari raya aidiladha":"Hari Raya Iduladha","sa'ie":"sai","asmaul husna":"Asmaul Husna","boleh jadi":"mungkin","apa-apa":"apa pun","mana-mana":"mana pun","sesiapa":"siapa pun","sebarang":"apa pun"
};
var W={
// grammar and common words
"daripada":"dari","selepas":"setelah","tiada":"tidak ada","tak":"tidak","boleh":"bisa","sahaja":"saja","kerana":"karena","semak":"periksa","senarai":"daftar","telefon":"telepon","masa":"waktu",
"padam":"hapus","dipadam":"dihapus","mula":"mulai","mulakan":"mulai","bermula":"dimulai","kereta":"mobil","tarikh":"tanggal","cth":"mis","cuba":"coba","kod":"kode","stesen":"stasiun","mengikut":"menurut",
"ketik":"ketuk","rasmi":"resmi","seterusnya":"berikutnya","kiraan":"hitungan","kira":"hitung","dikira":"dihitung","mengira":"menghitung","nombor":"nomor","kongsi":"bagikan","dikongsi":"dibagikan",
"sasaran":"target","hujung":"ujung","nota":"catatan","tamat":"selesai","anggaran":"perkiraan","memuatkan":"memuat","dimuatkan":"dimuat","taip":"ketik","kad":"kartu","percuma":"gratis","baharu":"baru",
"tetapan":"pengaturan","zon":"zona","asas":"dasar","wuduk":"wudu","berwuduk":"berwudu","negeri":"negara bagian","rekod":"catatan","direkod":"dicatat","merekod":"mencatat","jadual":"jadwal",
"akaun":"akun","baki":"sisa","minit":"menit","paparan":"tampilan","papar":"tampilkan","dipaparkan":"ditampilkan","automatik":"otomatis","fail":"berkas","esok":"besok","kaunter":"penghitung",
"syarikat":"perusahaan","peribadi":"pribadi","imbas":"pindai","berapakah":"berapa","kos":"biaya","bilik":"kamar","saringan":"penyaringan","skrin":"layar","dihantar":"dikirim","hantar":"kirim",
"bahagian":"bagian","sebahagian":"sebagian","kecemasan":"darurat","mahu":"mau","isteri":"istri","inggeris":"Inggris","separuh":"setengah","nipis":"tipis","digelar":"dijuluki","pusaka":"warisan",
"sentiasa":"senantiasa","semakan":"pemeriksaan","dimainkan":"diputar","mainkan":"putar","ramai":"banyak","berkaitan":"terkait","kuiz":"kuis","keputusan":"hasil","perkuburan":"pemakaman",
"nescaya":"niscaya","dahulu":"dulu","sila":"silakan","berjaya":"berhasil","ralat":"kesalahan","pautan":"tautan","butang":"tombol","kewangan":"keuangan","kalendar":"kalender","amaun":"jumlah",
"bayaran":"pembayaran","petang":"sore","jantina":"jenis kelamin","umur":"usia","datuk":"kakek","pakcik":"paman","makcik":"bibi","seluar":"celana","tudung":"kerudung","telekung":"mukena",
"kopiah":"peci","songkok":"peci","sejuk":"dingin","kemboja":"kamboja","arwah":"almarhum","faedah":"bunga","bil":"tagihan","insurans":"asuransi","cukai":"pajak","elaun":"tunjangan","projek":"proyek",
"teknikal":"teknis","praktikal":"praktis","elektrik":"listrik","kenderaan":"kendaraan","lori":"truk","motosikal":"sepeda motor","basikal":"sepeda","ahad":"Minggu","isnin":"Senin","khamis":"Kamis",
"jumaat":"Jumat","mac":"Maret","jun":"Juni","julai":"Juli","ogos":"Agustus","disember":"Desember","syaaban":"Syakban","zulkaedah":"Zulkaidah","zulhijjah":"Zulhijah","jamadilawal":"Jumadilawal",
"jamadilakhir":"Jumadilakhir","rejab":"Rajab","muharram":"Muharam","sunat":"sunah","solat":"salat","zohor":"Zuhur","isyak":"Isya","maghrib":"Magrib","berjemaah":"berjamaah","jemaah":"jamaah",
"aidilfitri":"Idulfitri","aidiladha":"Iduladha","korban":"kurban","hantaran":"seserahan","musolla":"musala","surau":"musala","kahwin":"kawin","berkahwin":"menikah","perkahwinan":"pernikahan",
"bapa":"ayah","lelaki":"laki-laki","wang":"uang","percubaan":"percobaan","universiti":"universitas","kualiti":"kualitas","aktiviti":"aktivitas","prioriti":"prioritas","komuniti":"komunitas",
"identiti":"identitas","polis":"polisi","hospital":"rumah sakit","pejabat":"kantor","beg":"tas","bas":"bus","teksi":"taksi","tampal":"tempel","betul":"benar","betulkan":"perbaiki","jom":"ayo",
"cuti":"libur","kedai":"toko","undi":"pilih","majlis":"acara","jemput":"undang","markah":"skor","pegawai":"petugas","kakitangan":"staf","menerusi":"melalui","seketika":"sejenak","laras":"atur",
"kelajuan":"kecepatan","laju":"cepat","perlahan":"pelan","perlahan-lahan":"pelan-pelan","bateri":"baterai","tukar":"ganti","mesej":"pesan","emel":"email","e-mel":"email","rangkaian":"jaringan",
"syarahan":"ceramah","mengandungi":"berisi","kandungan":"konten","dijumpai":"ditemukan","jumpa":"temukan","perkhidmatan":"layanan","pembangun":"pengembang","prototaip":"prototipe","penafian":"sanggahan",
"cadangan":"saran","maklumat":"informasi","makluman":"pemberitahuan","tempoh":"jangka waktu","terkini":"terbaru","kebenaran":"izin","benarkan":"izinkan","membenarkan":"mengizinkan","dibenarkan":"diizinkan",
"perbelanjaan":"pengeluaran","simpanan":"tabungan","pinjaman":"pinjaman","hutang":"utang","berhutang":"berutang","pemiutang":"pemberi utang","penghutang":"pengutang","ianya":"hal itu",
"berkenaan":"terkait","sehingga":"hingga","sesungguhnya":"sesungguhnya","kemaskini":"perbarui","dikemaskini":"diperbarui","dapatkan":"dapatkan","leret":"geser","pukal":"massal","agensi":"agen",
"bertembung":"bertabrakan","pengajaran":"pelajaran","aplikasi":"aplikasi","widget":"widget","lutsinar":"transparan","kelegapan":"opasitas","senyap":"senyap",
"kegemaran":"favorit","mengaji":"mengaji","jurnal":"jurnal","muhasabah":"muhasabah","ziarah":"ziarah","harakat":"harakat","jenazah":"jenazah","manfaat":"manfaat","perlukan":"perlukan",
"ucapan":"ucapan","kenduri":"kenduri","nisab":"nisab","haul":"haul","fitrah":"fitrah","saham":"saham","patuh":"patuh","pendapatan":"pendapatan","lencana":"lencana","pintasan":"pintasan",
"diqasar":"diqasar","qasar":"qasar","jamak":"jamak","musafir":"musafir","uzur":"uzur","kitaran":"siklus","haid":"haid","nifas":"nifas","ganti":"ganti","membuat":"membuat","sedekah":"sedekah",
"anda":"Anda","awak":"kamu","dia":"dia","baginda":"beliau","hendaklah":"hendaknya","janganlah":"janganlah","bila":"bila","apabila":"apabila","semasa":"saat","beratur":"antre","mesyuarat":"rapat",
"bahasa":"bahasa","melayu":"Melayu","malaysia":"Malaysia","ringgit":"ringgit","negara":"negara","peta":"peta","kiblat":"kiblat","pesawat":"pesawat","penerbangan":"penerbangan","tiket":"tiket",
"seksyen":"bagian","eja":"eja","ejaan":"ejaan","sebutan":"pelafalan","disebut":"disebut","sebut":"sebut","sudut":"sudut","darjah":"derajat","meter":"meter","kilometer":"kilometer","tingkap":"jendela",
"pusingan":"putaran","perkara":"hal","ramuan":"bahan","haiwan":"hewan","talian":"jaringan","hadapan":"depan","mesti":"harus","soalan":"pertanyaan","kalimah":"kalimat","sekurang-kurangnya":"setidaknya","kumpulan":"kelompok","episod":"episode","wangian":"wewangian","perkataan":"kata","jawapan":"jawaban","teruskan":"lanjutkan","tapak":"telapak","bahawa":"bahwa","rancangan":"rencana","bandar":"kota","tentera":"tentara","berdekatan":"terdekat","tandas":"toilet","pelbagai":"berbagai","kedua-dua":"kedua","kesemua":"semua","semula":"ulang","kenalan":"kontak","seminit":"semenit","almari":"lemari","menderma":"berdonasi","derma":"donasi","penderma":"donatur","pinggan":"piring","cawan":"cangkir","sudu":"sendok","garpu":"garpu","kasut":"sepatu","stoking":"kaus kaki","tuala":"handuk","sabun":"sabun","berus":"sikat","gunting":"gunting"
};
var KEYS=Object.keys(PH).sort(function(a,b){ return b.length-a.length; });
var PHRE=new RegExp("(^|[^A-Za-z'\\-])("+KEYS.map(function(k){ return k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }).join("|")+")(?![A-Za-z])","gi");
var WRE=/[A-Za-z][A-Za-z'\-]*/g;
function cs(src, to){ if(src===src.toUpperCase() && src.length>1 && /[A-Z]/.test(src)) return to.toUpperCase(); if(/^[A-Z]/.test(src)) return to.charAt(0).toUpperCase()+to.slice(1); return to; }
var cache=new Map();
function toId(s){ if(!s || !/[A-Za-z]/.test(s)) return s; var c=cache.get(s); if(c!==undefined) return c;
  var r=s.replace(PHRE, function(m, pre, w){ return pre+cs(w, PH[w.toLowerCase()]); });
  r=r.replace(WRE, function(w){ var t=W[w.toLowerCase()]; if(t===undefined){ return w; } return cs(w, t); });
  if(cache.size>20000) cache.clear(); cache.set(s, r); cache.set(r, r); return r; }
var SKIP="script,style,textarea,.ar,[dir=rtl],.qtr,.qtt,.qtpara,.qtfb,.qtfx,[data-noid],.qar,.sk-ar";
var on=false, mo=null, busy=false;
function doNode(n){ if(n.nodeType===3){ var p=n.parentElement; if(!p || p.closest(SKIP)) return; var v=n.nodeValue, t=toId(v); if(t!==v) n.nodeValue=t; return; }
  if(n.nodeType!==1 || n.closest(SKIP)) return;
  if(n.placeholder){ var ph=toId(n.placeholder); if(ph!==n.placeholder) n.placeholder=ph; }
  if(n.title){ var ti=toId(n.title); if(ti!==n.title) n.title=ti; }
  var w=document.createTreeWalker(n, NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT, {acceptNode:function(x){ if(x.nodeType===1) return x.matches(SKIP)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_SKIP; return NodeFilter.FILTER_ACCEPT; }}), x;
  while((x=w.nextNode())){ var v=x.nodeValue, t=toId(v); if(t!==v) x.nodeValue=t; }
  n.querySelectorAll("[placeholder],[title]").forEach(function(e){ if(e.closest(SKIP)) return; if(e.placeholder) e.placeholder=toId(e.placeholder); if(e.title) e.title=toId(e.title); });
}
function set(v){ if(v===on) return; on=v;
  if(on){ doNode(document.body); document.title=toId(document.title);
    mo=new MutationObserver(function(ms){ if(busy) return; busy=true; try{ ms.forEach(function(m){ if(m.type==="characterData") doNode(m.target); else m.addedNodes.forEach(doNode); }); } finally{ busy=false; } });
    mo.observe(document.body, {childList:true, subtree:true, characterData:true}); }
  else if(mo){ mo.disconnect(); mo=null; } }
window.IdLang={set:set, toId:toId, on:function(){ return on; }};
})();
