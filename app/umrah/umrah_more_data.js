/* Umrah DIY 0.13.2: content for the extra modules. Religious and Arabic text is written from memory and must be checked by an ustaz
   and an Arabic speaker. Phone numbers and rules are as understood in Nov 2026: always check on arrival. */

// ---------- emergency ----------
var UMX_SOS = [
  {n:"911", t:["Kecemasan bersepadu (Makkah, Madinah, Riyadh, Wilayah Timur)","Unified emergency (Makkah, Madinah, Riyadh, Eastern Province)"]},
  {n:"997", t:["Ambulans (Bulan Sabit Merah Saudi)","Ambulance (Saudi Red Crescent)"]},
  {n:"999", t:["Polis","Police"]},
  {n:"998", t:["Pertahanan awam (kebakaran)","Civil defence (fire)"]},
  {n:"1966", t:["Pusat panggilan Kementerian Haji & Umrah (semak)","Ministry of Hajj & Umrah call centre (check)"]}
];
var UMX_EMBASSY = [
  {n:["Kedutaan Besar Malaysia, Riyadh","Embassy of Malaysia, Riyadh"], u:"https://www.kln.gov.my/web/sau_riyadh"},
  {n:["Konsulat Jeneral Malaysia, Jeddah (urusan Makkah & Madinah)","Consulate General of Malaysia, Jeddah (covers Makkah & Madinah)"], u:"https://www.kln.gov.my/web/sau_jeddah"}
];
var UMX_HOSP = [
  {c:"mk", n:"Ajyad Emergency Hospital, Makkah", d:["Hospital kecemasan betul-betul di sebelah Masjidil Haram.","Emergency hospital right next to Masjid al-Haram."]},
  {c:"mk", n:"King Abdullah Medical City, Makkah", d:["Hospital pakar utama Makkah.","Makkah's main specialist hospital."]},
  {c:"mk", n:"Al Noor Specialist Hospital, Makkah", d:["Hospital besar kerajaan.","Large government hospital."]},
  {c:"md", n:"Al Haram Hospital, Madinah", d:["Dekat Masjid Nabawi.","Close to Masjid an-Nabawi."]},
  {c:"md", n:"King Fahd Hospital, Madinah", d:["Hospital besar kerajaan.","Large government hospital."]}
];
// lost card, shown full screen to a stranger
var UMX_LOST = {
  ar1:"السلام عليكم. أنا معتمر من ماليزيا وقد ضللت الطريق.",
  ar2:"أرجو مساعدتي للوصول إلى فندقي.",
  hotel:"اسم الفندق", room:"رقم الغرفة", phone:"رقم الهاتف", group:"رقم هاتف المرافق", noar:"لا أتكلم العربية جيدًا. شكرًا جزيلًا.",
  ms:"Assalamualaikum. Saya jemaah umrah dari Malaysia dan saya sesat. Tolong bantu saya ke hotel saya.",
  en:"Assalamu alaikum. I am an umrah pilgrim from Malaysia and I am lost. Please help me get to my hotel."
};

// ---------- Arabic for pilgrims: [cat, arabic, rumi, ms, en] ----------
var UMX_AR_CAT = {asas:["Asas","Basics"], teksi:["Teksi & jalan","Taxi & directions"], hotel:["Hotel","Hotel"], kedai:["Kedai & harga","Shop & prices"], makan:["Makan","Food"], sihat:["Kesihatan","Health"], masjid:["Di masjid","At the masjid"], sos:["Kecemasan","Emergency"]};
var UMX_AR = [
  ["asas","السلام عليكم","Assalamu 'alaikum","Assalamualaikum","Peace be upon you"],
  ["asas","وعليكم السلام","Wa 'alaikumus salam","Waalaikumussalam","And peace be upon you"],
  ["asas","شكرًا","Syukran","Terima kasih","Thank you"],
  ["asas","جزاك الله خيرًا","Jazakallahu khairan","Semoga Allah membalas kebaikan anda","May Allah reward you with good"],
  ["asas","نعم","Na'am","Ya","Yes"],
  ["asas","لا","La","Tidak","No"],
  ["asas","من فضلك","Min fadhlik","Tolong / sila","Please"],
  ["asas","عفوًا","'Afwan","Sama-sama / maaf","You're welcome / excuse me"],
  ["asas","أنا من ماليزيا","Ana min Maliziya","Saya dari Malaysia","I am from Malaysia"],
  ["asas","لا أفهم","La afham","Saya tidak faham","I don't understand"],
  ["asas","هل تتكلم الإنجليزية؟","Hal tatakallamul injliziyyah?","Anda boleh berbahasa Inggeris?","Do you speak English?"],
  ["asas","مرة أخرى، ببطء من فضلك","Marratan ukhra, bibut' min fadhlik","Sekali lagi, perlahan-lahan","Again, slowly please"],
  ["teksi","إلى الحرم من فضلك","Ilal Haram min fadhlik","Ke Masjidil Haram, tolong","To the Haram, please"],
  ["teksi","إلى المسجد النبوي","Ilal Masjid an-Nabawi","Ke Masjid Nabawi","To the Prophet's Mosque"],
  ["teksi","إلى هذا الفندق","Ila hadzal funduq","Ke hotel ini","To this hotel"],
  ["teksi","كم الأجرة؟","Kamil ujrah?","Berapa tambangnya?","How much is the fare?"],
  ["teksi","غالٍ جدًا","Ghalin jiddan","Mahal sangat","Too expensive"],
  ["teksi","قف هنا من فضلك","Qif huna min fadhlik","Berhenti di sini","Stop here please"],
  ["teksi","يمين","Yamin","Kanan","Right"],
  ["teksi","يسار","Yasar","Kiri","Left"],
  ["teksi","على طول","'Ala thul","Terus","Straight on"],
  ["teksi","أين باب الملك عبدالعزيز؟","Aina Babul Malik 'Abdil 'Aziz?","Di mana Pintu King Abdulaziz?","Where is King Abdulaziz Gate?"],
  ["teksi","أين محطة الحافلات؟","Aina mahattatul hafilat?","Di mana stesen bas?","Where is the bus station?"],
  ["hotel","عندي حجز","'Indi hajz","Saya ada tempahan","I have a booking"],
  ["hotel","رقم غرفتي","Raqmu ghurfati","Nombor bilik saya","My room number"],
  ["hotel","المفتاح من فضلك","Al-miftah min fadhlik","Kunci bilik, tolong","The key, please"],
  ["hotel","المكيف لا يعمل","Al-mukayyif la ya'mal","Penghawa dingin tidak berfungsi","The air conditioner is not working"],
  ["hotel","أريد ماء زمزم","Urid ma' zamzam","Saya mahu air zamzam","I would like zamzam water"],
  ["hotel","متى الإفطار؟","Mata al-ifthar?","Bila sarapan?","When is breakfast?"],
  ["hotel","أريد أن أترك الحقائب هنا","Urid an atruka al-haqa'ib huna","Saya mahu tinggalkan beg di sini","I want to leave my bags here"],
  ["kedai","بكم هذا؟","Bikam hadza?","Berapa harga ini?","How much is this?"],
  ["kedai","أقل من فضلك","Aqall min fadhlik","Kurangkan sikit, tolong","Lower, please"],
  ["kedai","سآخذ هذا","Sa'akhudzu hadza","Saya ambil yang ini","I'll take this"],
  ["kedai","هل عندك أصغر/أكبر؟","Hal 'indaka asghar / akbar?","Ada saiz kecil / besar?","Do you have a smaller / bigger one?"],
  ["kedai","هل أستطيع أن أتذوق؟","Hal astathi'u an atadzawwaq?","Boleh saya rasa?","Can I taste?"],
  ["kedai","بطاقة أو نقدًا؟","Bithaqah aw naqdan?","Kad atau tunai?","Card or cash?"],
  ["kedai","الفاتورة من فضلك","Al-fatura min fadhlik","Resit, tolong","The receipt, please"],
  ["makan","ماء من فضلك","Ma' min fadhlik","Air, tolong","Water, please"],
  ["makan","دجاج","Dajaj","Ayam","Chicken"],
  ["makan","لحم","Lahm","Daging","Meat"],
  ["makan","سمك","Samak","Ikan","Fish"],
  ["makan","أرز","Aruzz","Nasi","Rice"],
  ["makan","بدون فلفل حار","Bidun filfil har","Tanpa cili","No chilli"],
  ["makan","الحساب من فضلك","Al-hisab min fadhlik","Bil, tolong","The bill, please"],
  ["makan","سفري","Safari","Bungkus","Takeaway"],
  ["sihat","أنا مريض","Ana maridh","Saya sakit (lelaki)","I am ill (man)"],
  ["sihat","أنا مريضة","Ana maridhah","Saya sakit (wanita)","I am ill (woman)"],
  ["sihat","أين الصيدلية؟","Aina as-saidaliyyah?","Di mana farmasi?","Where is the pharmacy?"],
  ["sihat","أحتاج طبيبًا","Ahtaju thabiban","Saya perlukan doktor","I need a doctor"],
  ["sihat","عندي سكري","'Indi sukkari","Saya ada kencing manis","I have diabetes"],
  ["sihat","عندي حساسية","'Indi hassasiyyah","Saya ada alahan","I have an allergy"],
  ["sihat","رأسي يؤلمني","Ra'si yu'limuni","Kepala saya sakit","I have a headache"],
  ["sihat","حرارة","Hararah","Demam","Fever"],
  ["masjid","أين مكان الوضوء؟","Aina makanul wudhu'?","Di mana tempat wuduk?","Where is the ablution area?"],
  ["masjid","أين مصلى النساء؟","Aina musallan nisa'?","Di mana ruang solat wanita?","Where is the women's prayer area?"],
  ["masjid","أين دورات المياه؟","Aina dawratul miyah?","Di mana tandas?","Where are the toilets?"],
  ["masjid","أين الكراسي المتحركة؟","Aina al-karasi al-mutaharrikah?","Di mana kerusi roda?","Where are the wheelchairs?"],
  ["masjid","هل هذا الطريق إلى الصفا؟","Hal hadzat thariq ilas Shafa?","Ini jalan ke Safa?","Is this the way to Safa?"],
  ["sos","ساعدني من فضلك","Sa'idni min fadhlik","Tolong bantu saya","Please help me"],
  ["sos","ضعت","Dhi'tu","Saya sesat","I am lost"],
  ["sos","فقدت جوازي","Faqadtu jawazi","Saya hilang pasport","I lost my passport"],
  ["sos","سُرقت حقيبتي","Suriqat haqibati","Beg saya dicuri","My bag was stolen"],
  ["sos","اتصل بالإسعاف","Ittasil bil is'af","Hubungi ambulans","Call an ambulance"],
  ["sos","أين مركز المفقودين؟","Aina markazul mafqudin?","Di mana pusat orang hilang?","Where is the lost persons centre?"]
];

// ---------- umrah course: lessons + quiz (Shafi'i, Malaysian practice; ustaz review needed) ----------
var UMX_COURSE = [
  {t:["Apa itu umrah","What umrah is"], p:[["Umrah ialah menziarahi Kaabah untuk melakukan ihram, tawaf, sa'ie dan bercukur atau bergunting dengan syarat-syarat tertentu.","Umrah is visiting the Kaabah to do ihram, tawaf, sa'i and shaving or trimming, with set conditions."],["Dalam mazhab Syafi'i, umrah wajib sekali seumur hidup bagi yang mampu, sama seperti haji (al-Baqarah 196).","In the Shafi'i school, umrah is obligatory once in a lifetime for those able, like hajj (al-Baqarah 196)."],["Umrah boleh dilakukan sepanjang tahun, kecuali bagi jemaah haji pada hari-hari haji.","Umrah can be done all year, except for hajj pilgrims during the hajj days."]]},
  {t:["Rukun umrah","Pillars of umrah"], p:[["Rukun umrah ada lima: (1) ihram dengan niat, (2) tawaf, (3) sa'ie, (4) bercukur atau bergunting, (5) tertib.","Umrah has five pillars: (1) ihram with niat, (2) tawaf, (3) sa'i, (4) shaving or trimming, (5) doing them in order."],["Rukun tidak boleh ditinggalkan dan tidak boleh diganti dengan dam. Umrah tidak sah tanpanya.","A pillar cannot be left out or replaced with dam. The umrah is not valid without it."]]},
  {t:["Wajib umrah","Obligations of umrah"], p:[["Wajib umrah ada dua: (1) berihram dari miqat, (2) menjauhi larangan ihram.","Umrah has two obligations: (1) entering ihram at the miqat, (2) avoiding the ihram prohibitions."],["Jika wajib ditinggalkan, umrah tetap sah tetapi dikenakan dam.","If an obligation is missed, the umrah is still valid but dam is due."]]},
  {t:["Miqat","Miqat"], p:[["Miqat makani ialah sempadan tempat untuk berniat ihram. Dari Malaysia melalui udara, pesawat melintasi kawasan Yalamlam atau Qarn al-Manazil sebelum Jeddah.","The place miqat is the boundary where you make the ihram niat. Flying from Malaysia, the plane crosses the Yalamlam or Qarn al-Manazil area before Jeddah."],["Jeddah bukan miqat bagi yang datang dari Malaysia. Jika anda dari Madinah, miqatnya Dhul Hulaifah (Bir Ali). Jika sudah berada di Makkah, keluar ke Tan'im atau Ja'ranah.","Jeddah is not the miqat for those coming from Malaysia. From Madinah the miqat is Dhul Hulayfah (Bir Ali). Already in Makkah, go out to Tan'im or Ji'ranah."]]},
  {t:["Larangan ihram","Ihram prohibitions"], p:[["Untuk semua: memakai wangian, memotong rambut atau kuku, memburu binatang darat, berkahwin atau mengahwinkan, bersetubuh dan perkara yang membawa kepadanya.","For everyone: perfume, cutting hair or nails, hunting land animals, marrying or marrying someone off, intercourse and what leads to it."],["Lelaki: memakai pakaian berjahit yang melingkungi badan dan menutup kepala. Wanita: menutup muka dan memakai sarung tangan.","Men: wearing sewn clothes that enclose the body, and covering the head. Women: covering the face and wearing gloves."],["Bertengkar dan bercakap kotor dilarang sepanjang masa, lebih-lebih lagi dalam ihram.","Arguing and foul talk are always forbidden, even more so in ihram."]]},
  {t:["Tawaf","Tawaf"], p:[["Syarat tawaf: suci daripada hadas dan najis, menutup aurat, Kaabah di sebelah kiri, mula di Hajar Aswad, 7 pusingan penuh, di dalam Masjidil Haram, dan di luar Hijr Ismail.","Conditions: free of hadas and najis, aurat covered, Kaabah on the left, starting at the Black Stone, 7 full circuits, inside Masjid al-Haram, and outside Hijr Ismail."],["Sunat: idtiba' dan ramal bagi lelaki dalam 3 pusingan pertama, istilam di Hajar Aswad dan Rukun Yamani, berdoa, kemudian solat sunat tawaf 2 rakaat.","Sunnah: idtiba' and ramal for men in the first 3 circuits, istilam at the Black Stone and the Yemeni Corner, doa, then 2 rakaat of the tawaf prayer."]]},
  {t:["Sa'ie","Sa'i"], p:[["Sa'ie ialah berjalan 7 kali antara Safa dan Marwah, mula di Safa dan tamat di Marwah. Safa ke Marwah dikira satu.","Sa'i is walking 7 lengths between Safa and Marwah, starting at Safa and ending at Marwah. Safa to Marwah counts as one."],["Sa'ie mesti selepas tawaf yang sah. Wuduk tidak wajib untuk sa'ie, tetapi sunat.","Sa'i must come after a valid tawaf. Wudu is not required for sa'i, but it is sunnah."]]},
  {t:["Tahallul","Tahallul"], p:[["Selepas sa'ie, bercukur atau bergunting sekurang-kurangnya 3 helai rambut. Lelaki afdal bercukur; wanita memotong sedikit hujung rambut.","After sa'i, shave or trim at least 3 hairs. Shaving is better for men; women trim a little from the ends."],["Selepas tahallul, semua larangan ihram terangkat dan umrah selesai.","After tahallul all ihram prohibitions are lifted and the umrah is complete."]]},
  {t:["Di Madinah","In Madinah"], p:[["Ziarah Masjid Nabawi bukan sebahagian daripada umrah, tetapi sunat. Berniat untuk menziarahi masjid, kemudian beri salam kepada Rasulullah ﷺ dengan sopan.","Visiting Masjid an-Nabawi is not part of umrah, but it is sunnah. Intend to visit the mosque, then give salam to the Prophet ﷺ with good manners."],["Raudhah memerlukan permit Nusuk. Jangan berebut; solat dan berdoa dengan tenang.","Raudhah needs a Nusuk permit. Don't push; pray and make doa calmly."]]}
];
// [question ms, question en, [options ms/en pairs], index of correct]
var UMX_QUIZ = [
  [["Berapakah rukun umrah dalam mazhab Syafi'i?","How many pillars does umrah have in the Shafi'i school?"],[["3","3"],["4","4"],["5","5"],["6","6"]],2],
  [["Yang manakah BUKAN rukun umrah?","Which is NOT a pillar of umrah?"],[["Tawaf","Tawaf"],["Sa'ie","Sa'i"],["Berihram dari miqat","Ihram from the miqat"],["Bercukur atau bergunting","Shaving or trimming"]],2],
  [["Jika wajib umrah ditinggalkan, apa hukumnya?","If an obligation of umrah is missed, what happens?"],[["Umrah batal","The umrah is void"],["Sah tetapi kena dam","Valid but dam is due"],["Tiada apa-apa","Nothing"],["Ulang umrah","Repeat the umrah"]],1],
  [["Bagi jemaah dari Malaysia yang terbang terus ke Jeddah, di manakah berniat ihram?","For pilgrims flying from Malaysia straight to Jeddah, where is the ihram niat made?"],[["Di lapangan terbang Jeddah","At Jeddah airport"],["Di hotel Makkah","At the hotel in Makkah"],["Dalam pesawat apabila melintasi miqat","On the plane when crossing the miqat"],["Di Masjid Tan'im","At Masjid Tan'im"]],2],
  [["Miqat bagi yang datang dari Madinah ialah…","The miqat for those coming from Madinah is…"],[["Bir Ali (Dhul Hulaifah)","Bir Ali (Dhul Hulayfah)"],["Ja'ranah","Ji'ranah"],["Yalamlam","Yalamlam"],["Jeddah","Jeddah"]],0],
  [["Tawaf bermula di…","Tawaf starts at…"],[["Rukun Yamani","The Yemeni Corner"],["Maqam Ibrahim","Maqam Ibrahim"],["Hajar Aswad","The Black Stone"],["Pintu Kaabah","The Kaabah door"]],2],
  [["Ketika tawaf, Kaabah berada di sebelah…","During tawaf the Kaabah is on your…"],[["Kanan","Right"],["Kiri","Left"],["Hadapan","Front"],["Tidak penting","It does not matter"]],1],
  [["Tawaf yang melalui dalam Hijr Ismail…","A tawaf going through Hijr Ismail…"],[["Lebih afdal","Is better"],["Tidak dikira untuk pusingan itu","Does not count for that circuit"],["Sah tanpa masalah","Is fine"],["Wajib dam","Needs dam"]],1],
  [["Ramal (berjalan cepat) disunatkan bagi…","Ramal (brisk walking) is sunnah for…"],[["Semua jemaah, 7 pusingan","Everyone, 7 circuits"],["Lelaki, 3 pusingan pertama","Men, the first 3 circuits"],["Wanita sahaja","Women only"],["Warga emas","Seniors"]],1],
  [["Sa'ie bermula di…","Sa'i starts at…"],[["Marwah","Marwah"],["Safa","Safa"],["Hajar Aswad","The Black Stone"],["Mana-mana","Anywhere"]],1],
  [["Berapakah kiraan Safa ke Marwah kemudian kembali ke Safa?","How many lengths is Safa to Marwah and back to Safa?"],[["1","1"],["2","2"],["0.5","0.5"],["4","4"]],1],
  [["Adakah wuduk wajib untuk sa'ie?","Is wudu required for sa'i?"],[["Ya, wajib","Yes"],["Tidak wajib, tetapi sunat","No, but sunnah"],["Hanya untuk wanita","Only for women"],["Hanya di pusingan pertama","Only for the first length"]],1],
  [["Minimum rambut yang dipotong untuk tahallul (Syafi'i)?","The minimum hair cut for tahallul (Shafi'i)?"],[["1 helai","1 hair"],["3 helai","3 hairs"],["Separuh kepala","Half the head"],["Seluruh kepala","The whole head"]],1],
  [["Yang manakah larangan ihram bagi wanita sahaja?","Which ihram prohibition is for women only?"],[["Memakai wangian","Wearing perfume"],["Memotong kuku","Cutting nails"],["Menutup muka dan memakai sarung tangan","Covering the face and wearing gloves"],["Bertengkar","Arguing"]],2],
  [["Untuk masuk Raudhah anda perlukan…","To enter the Raudhah you need…"],[["Pasport sahaja","Only a passport"],["Permit Nusuk","A Nusuk permit"],["Tiket berbayar","A paid ticket"],["Tiada apa-apa","Nothing"]],1]
];

// ---------- tips & saving money: [cat, ms, en] ----------
var UMX_TIP_CAT = {jimat:["Jimat kos","Save money"], masa:["Masa & tenaga","Time & energy"], sihat:["Kesihatan","Health"], haram:["Di Masjidil Haram","At the Haram"], madinah:["Di Madinah","In Madinah"], fon:["Telefon & wang","Phone & money"]};
var UMX_TIPS = [
  ["jimat","Tempah tiket 3-5 bulan awal dan elak cuti sekolah serta Ramadan.","Book flights 3-5 months ahead and avoid school holidays and Ramadan."],
  ["jimat","Bandingkan tambang terus dengan 1 hentian; transit di Muscat atau Doha selalunya lebih murah.","Compare direct with 1-stop fares; a Muscat or Doha transit is often cheaper."],
  ["jimat","Hotel 1-2 km dengan syuttle boleh separuh harga hotel barisan hadapan.","A hotel 1-2 km out with a shuttle can be half the price of a front-row hotel."],
  ["jimat","Kongsi apartmen dengan dapur jika berkeluarga; masak sarapan dan makan malam.","Share an apartment with a kitchen as a family; cook breakfast and dinner."],
  ["jimat","Kereta api Haramain kelas ekonomi lebih murah daripada kereta peribadi untuk 1-3 orang.","Haramain economy is cheaper than a private car for 1-3 people."],
  ["jimat","Bas Makkah dan bas Madinah hampir percuma berbanding teksi untuk ke Haram.","Makkah and Madinah buses cost little compared with taxis to the Haram."],
  ["jimat","Beli kurma dan cenderahati di pasar kurma, bukan di kedai hotel.","Buy dates and gifts at the dates market, not hotel shops."],
  ["jimat","Tetapkan bajet belanja dan rekod setiap hari dalam Tracker Belanja.","Set a shopping budget and log it daily in the spending tracker."],
  ["jimat","Guna kad dengan caj tukaran asing rendah; elak tukar wang di lapangan terbang.","Use a card with low foreign fees; avoid airport money changers."],
  ["masa","Tidur selepas Isyak dan bangun awal; masa terbaik di Haram ialah sebelum Subuh.","Sleep after Isyak and wake early; the best Haram time is before Subuh."],
  ["masa","Lakukan umrah selepas Isyak atau selepas Subuh, bukan tengah hari.","Do the umrah after Isyak or after Subuh, not at midday."],
  ["masa","Tawaf di tingkat atas lebih lapang tetapi lebih jauh (kira-kira 1 km sepusingan).","Tawaf on the upper floors is less crowded but longer (about 1 km per circuit)."],
  ["sihat","Minum air zamzam kerap dan bawa botol kecil.","Drink zamzam often and carry a small bottle."],
  ["sihat","Pakai kasut yang sudah biasa dipakai; jangan kasut baru.","Wear shoes you have already broken in, not new ones."],
  ["sihat","Pakai pelitup muka di tempat sesak; batuk umrah sangat biasa.","Wear a mask in crowds; the 'umrah cough' is very common."],
  ["sihat","Bawa ubat sendiri cukup untuk tempoh perjalanan + 1 minggu.","Bring enough of your own medicine for the trip plus a week."],
  ["haram","Ingat nombor pintu masuk dan keluar; ambil gambar papan tanda pintu.","Remember your gate numbers; take a photo of the gate sign."],
  ["haram","Letak kasut dalam beg kasut, bukan di rak; rak mudah keliru.","Keep shoes in a shoe bag, not on the racks; racks get confusing."],
  ["haram","Datang 45 minit lebih awal untuk solat Jumaat.","Come at least 45 minutes early for Jumu'ah."],
  ["haram","Tetapkan titik pertemuan dengan keluarga jika terpisah.","Set a meeting point with your family in case you are separated."],
  ["madinah","Semak aplikasi Nusuk setiap hari untuk slot Raudhah yang dibuka.","Check the Nusuk app daily for newly opened Raudhah slots."],
  ["madinah","Pergi ke Quba pada pagi Sabtu selepas berwuduk di hotel.","Go to Quba on Saturday morning after making wudu at the hotel."],
  ["madinah","Malam musim sejuk di Madinah boleh sejuk; bawa jaket nipis.","Winter nights in Madinah can be cold; bring a light jacket."],
  ["fon","Beli eSIM Saudi sebelum terbang supaya Nusuk dan peta terus berfungsi.","Buy a Saudi eSIM before flying so Nusuk and maps work at once."],
  ["fon","Muat turun peta dan simpan dokumen dalam Peti Dokumen sebelum berlepas.","Save documents in the Document box before you fly."]
];

// ---------- daily ibadah in the Haram ----------
var UMX_AMAL = [
  ["s5",["5 waktu berjemaah di masjid","All 5 prayers in the masjid"]],
  ["tahajjud",["Tahajud / qiamullail","Tahajjud"]],
  ["isyraq",["Isyraq / Dhuha","Ishraq / Dhuha"]],
  ["tawaf",["Tawaf sunat (Makkah)","Sunnah tawaf (Makkah)"]],
  ["quran",["Al-Quran (sekurang-kurangnya 1 juzuk)","Quran (at least 1 juz)"]],
  ["zikir",["Zikir pagi & petang","Morning & evening dhikr"]],
  ["selawat",["Selawat 100 kali","Salawat 100 times"]],
  ["doa",["Doa untuk ibu bapa & keluarga","Doa for parents & family"]],
  ["sedekah",["Sedekah","Charity"]],
  ["zamzam",["Minum zamzam dengan doa","Drink zamzam with a doa"]]
];
// ---------- istiqamah: 40 days after home ----------
var UMX_HABITS = [
  ["jemaah",["Solat berjemaah / awal waktu","Prayer in congregation / on time"]],
  ["quran",["Baca al-Quran setiap hari","Read the Quran daily"]],
  ["dhuha",["Solat Dhuha","Dhuha prayer"]],
  ["tahajjud",["Tahajud","Tahajjud"]],
  ["zikir",["Zikir pagi & petang","Morning & evening dhikr"]],
  ["sedekah",["Sedekah","Charity"]],
  ["puasa",["Puasa Isnin / Khamis (pada hari itu)","Monday / Thursday fast (on those days)"]],
  ["akhlak",["Jaga lidah & akhlak","Mind your tongue & manners"]]
];
var UMX_DOC_TYPES = [["pass",["Pasport","Passport"]],["visa",["Visa","Visa"]],["flight",["Tiket penerbangan","Flight tickets"]],["train",["Tiket kereta api","Train tickets"]],["hotel",["Baucar hotel","Hotel vouchers"]],["vax",["Sijil vaksin","Vaccine certificate"]],["ins",["Insurans","Insurance"]],["raud",["Permit Raudhah / Nusuk","Raudhah / Nusuk permit"]],["ic",["IC / lesen","IC / licence"]],["other",["Lain-lain","Other"]]];
var UMX_EXP_CAT = [["food",["Makan","Food"],"🍽"],["trans",["Pengangkutan","Transport"],"🚕"],["shop",["Belanja / ole-ole","Shopping / gifts"],"🛍"],["ziarah",["Ziarah","Ziarah"],"🧭"],["hotel",["Penginapan","Stay"],"🏨"],["sedekah",["Sedekah","Charity"],"🤲"],["health",["Kesihatan","Health"],"💊"],["other",["Lain-lain","Other"],"•"]];
