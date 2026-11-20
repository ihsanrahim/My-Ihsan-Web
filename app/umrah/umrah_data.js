/* Umrah DIY: bundled data. Every price, distance and opening note is an ESTIMATE (as of Nov 2026), shown with "please check".
   Coordinates are approximate (OpenStreetMap-based, hand-entered) and must be re-checked before relying on them for navigation.
   Religious notes are written from memory and flagged for ustaz review, like the Hajj 3D data. */
var UM_ASOF = "2026-11";

// ---------- places ----------
// id: {n:[ms,en], ar, ll:[lat,lng], c:city (mk|md|jd|tf|my|air), k:kind, d:[ms,en] what/why, o:[ms,en] opening/tip, sr:sirah hint}
var UM_PLACES = {
  // Makkah: the Haram
  haram:   {n:["Masjidil Haram, Makkah","Masjid al-Haram, Makkah"], ar:"المسجد الحرام", ll:[21.4225,39.8262], c:"mk", k:"masjid",
            d:["Masjid paling mulia. Solat di sini menyamai 100,000 solat di tempat lain (HR Ibn Majah 1406).","The most honoured mosque. A prayer here equals 100,000 elsewhere (Ibn Majah 1406)."]},
  gate1:   {n:["Pintu King Abdulaziz (Pintu 1), Masjidil Haram","King Abdulaziz Gate (Gate 1), Masjid al-Haram"], ar:"باب الملك عبدالعزيز", ll:[21.4214,39.8253], c:"mk", k:"masjid",
            d:["Pintu utama di sebelah menara jam. Titik pertemuan yang mudah diingati.","The main gate on the Clock Tower side. An easy meeting point to remember."]},
  mataf:   {n:["Mataf (dataran tawaf), Masjidil Haram","Mataf (tawaf area), Masjid al-Haram"], ar:"المطاف", ll:[21.4225,39.8262], c:"mk", k:"rite",
            d:["Tawaf 7 pusingan mengelilingi Kaabah, bermula dan berakhir di garisan Hajar Aswad.","7 circuits of the Kaabah, starting and ending at the Black Stone line."]},
  masa:    {n:["Mas'a (Safa ke Marwah), Masjidil Haram","Mas'a (Safa to Marwah), Masjid al-Haram"], ar:"المسعى", ll:[21.4238,39.8274], c:"mk", k:"rite",
            d:["Sa'ie 7 kali dari Safa ke Marwah, kira-kira 3.2 km semuanya. Tingkat atas untuk kerusi roda.","7 lengths from Safa to Marwah, about 3.2 km in all. Upper floors for wheelchairs."]},
  clock:   {n:["Abraj Al Bait (Menara Jam Makkah)","Abraj Al Bait (Makkah Clock Tower)"], ar:"أبراج البيت", ll:[21.4189,39.8254], c:"mk", k:"area",
            d:["Kompleks hotel, pusat beli-belah dan muzium jam betul-betul di depan Masjidil Haram.","Hotels, a mall and the clock museum directly in front of the Haram."], o:["Muzium jam bertiket; semak waktu buka.","The clock museum is ticketed; check opening hours."]},
  maulid:  {n:["Tempat lahir Nabi ﷺ (Maktabah Makkah)","Birthplace of the Prophet ﷺ (Makkah Library)"], ar:"مكتبة مكة المكرمة", ll:[21.4240,39.8292], c:"mk", k:"ziarah",
            d:["Kini perpustakaan. Lihat dari luar sahaja; tiada amalan khusus.","Now a library. View from outside only; there is no special rite here."]},
  maala:   {n:["Perkuburan Jannatul Ma'la","Jannat al-Mu'alla cemetery"], ar:"جنة المعلاة", ll:[21.4330,39.8282], c:"mk", k:"ziarah",
            d:["Makam Saidatina Khadijah RA dan ramai sahabat. Beri salam dan doakan ahli kubur.","Resting place of Khadijah RA and many companions. Give salam and pray for them."], o:["Lelaki boleh masuk pada waktu tertentu; wanita melihat dari luar.","Men may enter at set times; women view from outside."]},
  jin:     {n:["Masjid Jin","Masjid al-Jinn"], ar:"مسجد الجن", ll:[21.4316,39.8291], c:"mk", k:"ziarah",
            d:["Tempat jin mendengar al-Quran (Surah al-Jin). Solat sunat tahiyatul masjid.","Where jinn listened to the Quran (Surah al-Jinn). Pray tahiyyat al-masjid."]},
  hira:    {n:["Jabal Nur (Gua Hira) & Hira Cultural District","Jabal al-Nour (Cave of Hira) & Hira Cultural District"], ar:"جبل النور - غار حراء", ll:[21.4575,39.8593], c:"mk", k:"ziarah", sr:"hira",
            d:["Tempat wahyu pertama (Iqra'). Pendakian 1-2 jam, kira-kira 1,200 anak tangga.","Where the first revelation (Iqra') came. Climb 1-2 hours, about 1,200 steps."], o:["Daki selepas Subuh; jangan pada tengah hari atau jika lutut lemah. Muzium di kaki bukit bertiket.","Climb after Subuh; not at midday or with weak knees. The museum at the foot is ticketed."]},
  thawr:   {n:["Jabal Thawr (Gua Thur)","Jabal Thawr (Cave of Thawr)"], ar:"جبل ثور", ll:[21.3772,39.8497], c:"mk", k:"ziarah", sr:"hijrah",
            d:["Nabi ﷺ dan Abu Bakar RA bersembunyi 3 malam ketika hijrah. Pendakian curam 2-3 jam.","The Prophet ﷺ and Abu Bakr RA hid here 3 nights during the Hijrah. Steep climb, 2-3 hours."], o:["Melihat dari bawah pun memadai.","Viewing from below is enough."]},
  tanim:   {n:["Masjid Tan'im (Masjid Aisyah)","Masjid al-Tan'im (Masjid Aisha)"], ar:"مسجد التنعيم", ll:[21.4659,39.7847], c:"mk", k:"miqat",
            d:["Miqat terdekat untuk umrah kedua dari Makkah.","The nearest miqat for a second umrah from within Makkah."]},
  jiranah: {n:["Masjid Ja'ranah","Masjid al-Ji'ranah"], ar:"مسجد الجعرانة", ll:[21.5658,39.9608], c:"mk", k:"miqat",
            d:["Nabi ﷺ berihram umrah dari sini selepas Hunain.","The Prophet ﷺ entered ihram for umrah here after Hunayn."]},
  mina:    {n:["Mina (Masjid al-Khaif)","Mina (Masjid al-Khayf)"], ar:"منى - مسجد الخيف", ll:[21.4152,39.8890], c:"mk", k:"ziarah",
            d:["Kawasan khemah haji. Di luar musim haji dilihat dari kenderaan.","The hajj tent city. Outside hajj it is seen from the car."]},
  jamrat:  {n:["Jamrat","Jamarat"], ar:"الجمرات", ll:[21.4227,39.8727], c:"mk", k:"ziarah",
            d:["Tempat melontar ketika haji.","Where pilgrims stone the pillars during hajj."]},
  muzdal:  {n:["Muzdalifah (Masjid Masy'aril Haram)","Muzdalifah (Masjid al-Mash'ar al-Haram)"], ar:"مزدلفة", ll:[21.3833,39.9361], c:"mk", k:"ziarah",
            d:["Tempat bermalam jemaah haji selepas Arafah.","Where hajj pilgrims spend the night after Arafah."]},
  arafah:  {n:["Padang Arafah & Jabal Rahmah","Plain of Arafah & Jabal al-Rahmah"], ar:"عرفات - جبل الرحمة", ll:[21.3549,39.9841], c:"mk", k:"ziarah",
            d:["Wukuf haji di sini. Berdoa di mana-mana; memanjat dan menulis pada batu bukan sunnah.","The hajj standing is here. Make doa anywhere; climbing for blessing or writing on rocks is not sunnah."]},
  namirah: {n:["Masjid Namirah, Arafah","Masjid Namirah, Arafah"], ar:"مسجد نمرة", ll:[21.3516,39.9668], c:"mk", k:"ziarah",
            d:["Masjid tempat khutbah Arafah.","The mosque of the Arafah sermon."]},
  joud:    {n:["Pameran Dua Masjid Suci & Kilang Kiswah (Umm al-Joud)","Exhibition of the Two Holy Mosques & Kiswah factory (Umm al-Joud)"], ar:"معرض عمارة الحرمين - مصنع الكسوة", ll:[21.4440,39.7795], c:"mk", k:"ziarah",
            d:["Pintu lama Kaabah, tiang dan kiswah.","Old Kaabah doors, pillars and the kiswah."], o:["Semak waktu dan syarat lawatan.","Check opening times and visit rules."]},
  aziziyah:{n:["Aziziyah, Makkah","Al-Aziziyah, Makkah"], ar:"العزيزية", ll:[21.4045,39.8605], c:"mk", k:"area"},
  misfalah:{n:["Misfalah (Jalan Ibrahim Khalil), Makkah","Misfalah (Ibrahim Al Khalil Rd), Makkah"], ar:"المسفلة", ll:[21.4160,39.8228], c:"mk", k:"area"},
  kudai:   {n:["Kudai, Makkah","Kudai, Makkah"], ar:"كدي", ll:[21.4005,39.8195], c:"mk", k:"area"},
  jomar:   {n:["Jabal Omar, Makkah","Jabal Omar, Makkah"], ar:"جبل عمر", ll:[21.4205,39.8212], c:"mk", k:"area"},
  mkst:    {n:["Stesen Haramain Makkah (Rusaifah)","Haramain Makkah Station (Al Rusaifah)"], ar:"محطة مكة", ll:[21.3946,39.7872], c:"mk", k:"station"},
  // Taif (optional)
  taif:    {n:["Taif: Masjid Abdullah ibn Abbas & Masjid Addas","Taif: Masjid Abdullah ibn Abbas & Masjid Addas"], ar:"الطائف", ll:[21.2706,40.4175], c:"tf", k:"ziarah", sr:"taif",
            d:["Kota dakwah Nabi ﷺ yang ditolak; kebun mawar dan udara sejuk.","The city that rejected the Prophet's ﷺ call; rose farms and cool air."], o:["Sehari penuh dengan kereta (kira-kira 90 km sehala).","A full day by car (about 90 km each way)."]},
  // Jeddah
  jed:     {n:["Lapangan Terbang Antarabangsa King Abdulaziz, Jeddah (Terminal 1)","King Abdulaziz International Airport, Jeddah (Terminal 1)"], ar:"مطار الملك عبدالعزيز", ll:[21.6796,39.1565], c:"jd", k:"airport", code:"JED"},
  jedst:   {n:["Stesen Haramain Lapangan Terbang Jeddah","Haramain KAIA Airport Station, Jeddah"], ar:"محطة المطار", ll:[21.6770,39.1555], c:"jd", k:"station"},
  // Madinah
  nabawi:  {n:["Masjid Nabawi, Madinah","Masjid an-Nabawi, Madinah"], ar:"المسجد النبوي", ll:[24.4672,39.6111], c:"md", k:"masjid",
            d:["Masjid Rasulullah ﷺ. Solat di sini lebih baik daripada 1,000 solat di tempat lain kecuali Masjidil Haram (HR Bukhari 1190).","The Prophet's ﷺ Mosque. A prayer here is better than 1,000 elsewhere except Masjid al-Haram (Bukhari 1190)."]},
  salam:   {n:["Bab as-Salam, Masjid Nabawi","Bab al-Salam, Masjid an-Nabawi"], ar:"باب السلام", ll:[24.4667,39.6104], c:"md", k:"masjid",
            d:["Masuk di sini untuk memberi salam kepada Rasulullah ﷺ, Abu Bakar RA dan Umar RA; keluar di Bab al-Baqi'.","Enter here to give salam to the Prophet ﷺ, Abu Bakr RA and Umar RA; leave by Bab al-Baqi'."]},
  raudhah: {n:["Raudhah, Masjid Nabawi","Al-Rawdah, Masjid an-Nabawi"], ar:"الروضة الشريفة", ll:[24.4673,39.6116], c:"md", k:"rite",
            d:["\"Antara rumahku dan mimbarku ialah satu taman dari taman-taman syurga\" (HR Bukhari 1196). Perlu permit Nusuk.","\"Between my house and my pulpit is a garden of the gardens of Paradise\" (Bukhari 1196). Needs a Nusuk permit."], o:["Tempah slot di aplikasi Nusuk; slot sering penuh, semak setiap hari.","Book a slot in the Nusuk app; slots fill fast, check daily."]},
  baqi:    {n:["Perkuburan Jannatul Baqi'","Jannat al-Baqi' cemetery"], ar:"بقيع الغرقد", ll:[24.4670,39.6165], c:"md", k:"ziarah",
            d:["Makam ahli keluarga dan ribuan sahabat Nabi ﷺ.","Resting place of the Prophet's ﷺ family and thousands of companions."], o:["Lelaki, biasanya selepas Subuh dan selepas Asar (semak).","Men, usually after Subuh and after Asar (check)."]},
  ghamamah:{n:["Masjid Ghamamah & Masjid Abu Bakar, Umar, Ali","Masjid al-Ghamamah & the Abu Bakr, Umar, Ali mosques"], ar:"مسجد الغمامة", ll:[24.4651,39.6085], c:"md", k:"ziarah",
            d:["Tempat Nabi ﷺ solat Hari Raya dan solat minta hujan.","Where the Prophet ﷺ prayed the Eid and rain prayers."]},
  jumuah:  {n:["Masjid Jumaat (Bani Salim)","Masjid al-Jumu'ah (Bani Salim)"], ar:"مسجد الجمعة", ll:[24.4475,39.6095], c:"md", k:"ziarah", sr:"hijrah",
            d:["Tempat Jumaat pertama Nabi ﷺ ketika hijrah.","Where the Prophet ﷺ led the first Jumu'ah on the Hijrah."]},
  quba:    {n:["Masjid Quba","Masjid Quba"], ar:"مسجد قباء", ll:[24.4393,39.6173], c:"md", k:"ziarah", sr:"hijrah",
            d:["Masjid pertama dalam Islam. Berwuduk di rumah dan solat 2 rakaat di sini = pahala umrah (HR Ibn Majah 1412). Sunnah pada hari Sabtu.","The first mosque in Islam. Make wudu at home and pray 2 rakaat here = reward of an umrah (Ibn Majah 1412). Sunnah on Saturdays."], o:["Laluan pejalan kaki Quba dari Masjid Nabawi kira-kira 3 km.","The Quba walkway from Masjid an-Nabawi is about 3 km."]},
  qiblatain:{n:["Masjid Qiblatain","Masjid al-Qiblatayn"], ar:"مسجد القبلتين", ll:[24.4842,39.5791], c:"md", k:"ziarah",
            d:["Tempat turun ayat pertukaran kiblat ke Kaabah (al-Baqarah 144).","Where the change of qibla to the Kaabah was revealed (al-Baqarah 144)."]},
  khandaq: {n:["Sab'ah Masajid & Khandaq (Masjid al-Fath)","Seven Mosques & the Trench (Masjid al-Fath)"], ar:"المساجد السبعة", ll:[24.4776,39.5955], c:"md", k:"ziarah", sr:"khandaq",
            d:["Tapak Perang Khandaq.","Site of the Battle of the Trench."]},
  uhud:    {n:["Jabal Uhud & Makam Syuhada (Saidina Hamzah RA)","Mount Uhud & the Martyrs' graves (Hamzah RA)"], ar:"جبل أحد - شهداء أحد", ll:[24.5015,39.6125], c:"md", k:"ziarah", sr:"uhud",
            d:["Tapak Perang Uhud dan Jabal Rumah. \"Uhud gunung yang mencintai kita dan kita mencintainya\" (HR Bukhari 4083).","Site of the Battle of Uhud and the Archers' Hill. \"Uhud loves us and we love it\" (Bukhari 4083)."]},
  kurma:   {n:["Pasar Kurma Madinah","Madinah Dates Market"], ar:"سوق التمور", ll:[24.4700,39.6180], c:"md", k:"shop",
            d:["Kurma Ajwa, Sukari, Safawi. Rasa dahulu, banding harga.","Ajwa, Sukkari, Safawi dates. Taste first, compare prices."]},
  qurancx: {n:["Kompleks Percetakan al-Quran King Fahd","King Fahd Quran Printing Complex"], ar:"مجمع الملك فهد", ll:[24.5545,39.6460], c:"md", k:"ziarah",
            o:["Lawatan terhad; semak dahulu.","Visits are limited; check first."]},
  dama:    {n:["Muzium Dar Al Madinah","Dar Al Madinah Museum"], ar:"دار المدينة", ll:[24.4600,39.6005], c:"md", k:"ziarah", o:["Bertiket; semak waktu buka.","Ticketed; check opening hours."]},
  birali:  {n:["Bir Ali (Masjid Dhul Hulaifah, miqat)","Bir Ali (Masjid Dhul Hulayfah, miqat)"], ar:"ذو الحليفة - أبيار علي", ll:[24.4137,39.5432], c:"md", k:"miqat",
            d:["Miqat penduduk Madinah. Mandi sunat ihram di hotel, solat sunat ihram dan niat di sini.","The miqat for Madinah. Take the ihram bath at the hotel, pray the ihram sunnah and make niat here."]},
  mdst:    {n:["Stesen Haramain Madinah","Haramain Madinah Station"], ar:"محطة المدينة", ll:[24.4846,39.5640], c:"md", k:"station"},
  med:     {n:["Lapangan Terbang Prince Mohammad bin Abdulaziz, Madinah","Prince Mohammad bin Abdulaziz Airport, Madinah"], ar:"مطار الأمير محمد بن عبدالعزيز", ll:[24.5534,39.7051], c:"md", k:"airport", code:"MED"},
  mdcentral:{n:["Zon pusat Madinah (Markaziyah)","Madinah central zone (Markaziyah)"], ar:"المنطقة المركزية", ll:[24.4685,39.6080], c:"md", k:"area"},
  mdquba:  {n:["Jalan Quba, Madinah","Quba Road, Madinah"], ar:"طريق قباء", ll:[24.4520,39.6140], c:"md", k:"area"}
};

// Malaysian home cities and airports
var UM_AIRPORTS = {
  KUL:{n:"KLIA, Sepang", ll:[2.7456,101.7099]}, PEN:{n:"Penang Int'l", ll:[5.2971,100.2770]}, BKI:{n:"Kota Kinabalu Int'l", ll:[5.9372,116.0510]},
  KCH:{n:"Kuching Int'l", ll:[1.4847,110.3470]}, JHB:{n:"Senai, Johor", ll:[1.6413,103.6697]}, LGK:{n:"Langkawi Int'l", ll:[6.3297,99.7287]},
  KBR:{n:"Sultan Ismail Petra, Kota Bharu", ll:[6.1669,102.2930]}, KUA:{n:"Sultan Haji Ahmad Shah, Kuantan", ll:[3.7754,103.2090]},
  TGG:{n:"Sultan Mahmud, Kuala Terengganu", ll:[5.3826,103.1030]}, MYY:{n:"Miri", ll:[4.3220,113.9870]}, SDK:{n:"Sandakan", ll:[5.9009,118.0590]},
  TWU:{n:"Tawau", ll:[4.3133,118.1220]}, IPH:{n:"Sultan Azlan Shah, Ipoh", ll:[4.5680,101.0920]}, SIN:{n:"Singapore Changi", ll:[1.3644,103.9915]}
};
// [name, lat, lng, nearest airport]
var UM_CITIES = [
  ["Kuala Lumpur",3.139,101.687,"KUL"],["Shah Alam",3.0738,101.5183,"KUL"],["Petaling Jaya",3.1073,101.6067,"KUL"],["Putrajaya",2.9264,101.6964,"KUL"],
  ["Klang",3.0449,101.4456,"KUL"],["Kajang",2.9935,101.7874,"KUL"],["Seremban",2.7297,101.9381,"KUL"],["Melaka",2.1896,102.2501,"KUL"],
  ["Johor Bahru",1.4927,103.7414,"JHB"],["Muar",2.0442,102.5689,"KUL"],["Batu Pahat",1.8548,102.9325,"JHB"],["Ipoh",4.5975,101.0901,"KUL"],
  ["Taiping",4.8500,100.7333,"PEN"],["George Town",5.4141,100.3288,"PEN"],["Butterworth",5.3991,100.3638,"PEN"],["Sungai Petani",5.6470,100.4877,"PEN"],
  ["Alor Setar",6.1248,100.3678,"PEN"],["Kangar",6.4414,100.1986,"PEN"],["Langkawi",6.3500,99.8000,"LGK"],["Kota Bharu",6.1254,102.2381,"KBR"],
  ["Kuala Terengganu",5.3302,103.1408,"TGG"],["Kuantan",3.8077,103.3260,"KUA"],["Temerloh",3.4500,102.4167,"KUL"],["Kota Kinabalu",5.9804,116.0735,"BKI"],
  ["Sandakan",5.8402,118.1179,"SDK"],["Tawau",4.2448,117.8912,"TWU"],["Kuching",1.5535,110.3593,"KCH"],["Miri",4.3995,113.9914,"MYY"],["Sibu",2.2870,111.8305,"KCH"]
];
// KUL is the only airport with direct Saudi flights; others connect through KUL (or SIN for Johor).
var UM_HUB = {KUL:1, SIN:1};

// ---------- options ----------
// p:[lo,hi] RM; u: unit -> "pp" per person per trip, "pn" per person per night, "pd" per person per day, "grp" per group per trip, "pc" per person per city
// t: tiers it is the default for (b basic, n normal, c comfort). bk: booking link keys.
var UM_OPT = {
  flight: {h:["Penerbangan pergi-balik","Return flights"], ic:"✈", u:"pp", o:[
    {id:"promo", n:["Tambang promo / 1 hentian","Promo or 1-stop fare"], d:["Jualan Saudia, Oman Air, Emirates, Qatar atau penerbangan tambang rendah jika ada. Transit 2-6 jam.","Sale fares on Saudia, Oman Air, Emirates, Qatar or a low-cost carrier when operating. 2-6 h transit."], p:[1800,2800], t:"b", bk:["gflights","skyscanner"], hrs:13},
    {id:"direct", n:["Terus, kelas ekonomi","Direct, economy"], d:["Saudia atau Malaysia Airlines terus KUL-JED/MED, kira-kira 9-10 jam.","Saudia or Malaysia Airlines direct KUL-JED/MED, about 9-10 hours."], p:[3000,4500], t:"n", bk:["gflights","skyscanner","saudia","mas"], hrs:9.5},
    {id:"biz", n:["Kelas perniagaan / pertama","Business or first class"], d:["Terus, tempat duduk rata, lounge.","Direct, flat bed, lounge."], p:[12000,30000], t:"c", bk:["gflights","saudia","mas"], hrs:9.5}
  ]},
  lodgeMk: {h:["Penginapan di Makkah","Stay in Makkah"], ic:"🏨", u:"pn", city:"mk", o:[
    {id:"suite", n:["Suite / penthouse Menara Jam","Clock Tower suite or penthouse"], d:["Fairmont Makkah Clock Royal Tower, Raffles Makkah Palace, Swissôtel, Pullman ZamZam, Mövenpick Hajar Tower. Suite pandangan Kaabah. Semak ketersediaan.","Fairmont Makkah Clock Royal Tower, Raffles Makkah Palace, Swissôtel, Pullman ZamZam, Mövenpick Hajar Tower. Kaaba-view suites. Check availability."], p:[3000,20000], t:"c", at:"clock", q:"Clock Tower Makkah suite Kaaba view", bk:["agoda","trivago","ghotel"]},
    {id:"h5", n:["Hotel 5★ barisan hadapan","Front-row 5★ hotel"], d:["Jabal Omar (Hilton Suites, Conrad, Hyatt Regency, Marriott) atau Menara Jam. 0-300 m.","Jabal Omar (Hilton Suites, Conrad, Hyatt Regency, Marriott) or the Clock Tower. 0-300 m."], p:[600,2000], at:"jomar", q:"5 star hotel near Masjid al-Haram", bk:["agoda","trivago","ghotel"]},
    {id:"h3", n:["Hotel 3-4★","3-4★ hotel"], d:["300 m - 1 km, sekitar Ibrahim Khalil dan Misfalah.","300 m to 1 km, around Ibrahim Al Khalil Rd and Misfalah."], p:[150,450], t:"n", at:"misfalah", q:"hotel Misfalah Makkah", bk:["agoda","trivago","ghotel"]},
    {id:"apt", n:["Apartmen / servis","Apartment / serviced"], d:["Ada dapur, sesuai keluarga dan bekal. Aziziyah atau Kudai, 2-4 km, bas atau syuttle.","Kitchen, good for families and bekal. Aziziyah or Kudai, 2-4 km, bus or shuttle."], p:[80,250], at:"aziziyah", q:"apartment Aziziyah Makkah", bk:["agoda","gmaps"]},
    {id:"bunk", n:["Bilik berkongsi / katil asrama","Shared room / bunk bed"], d:["Satu katil dalam bilik 4-8 orang sejantina. Jarang di laman besar; biasanya melalui kumpulan umrah.","One bed in a 4-8 person same-gender room. Rare on big sites; usually through umrah groups."], p:[40,90], t:"b", at:"kudai", q:"hostel Makkah", bk:["agoda","gmaps"]},
    {id:"rent", n:["Bilik sewa murah","Cheap rented room"], d:["Bilik sewa 2-5 km dengan bas Makkah atau syuttle hotel.","Rooms 2-5 km out with Makkah Bus or a hotel shuttle."], p:[60,150], at:"aziziyah", q:"furnished apartments Makkah", bk:["gmaps","agoda"]},
    {id:"free", n:["Percuma (keluarga / kenalan)","Free (family or friends)"], d:["Hanya jika ada keluarga atau kenalan di Saudi. Tidur di masjid tidak dibenarkan kecuali i'tikaf; tapak \"tumpang percuma\" tidak boleh diharap di Saudi.","Only if you have family or friends in Saudi. Sleeping in the mosque is not allowed except i'tikaf; free-stay sites are not dependable in Saudi."], p:[0,0], at:"aziziyah", bk:[]}
  ]},
  lodgeMd: {h:["Penginapan di Madinah","Stay in Madinah"], ic:"🏨", u:"pn", city:"md", o:[
    {id:"suite", n:["Suite pandangan Masjid Nabawi","Haram-view suite"], d:["The Oberoi, Pullman Zamzam, Anwar Al Madinah Mövenpick, Dar Al Taqwa. Barisan hadapan.","The Oberoi, Pullman Zamzam, Anwar Al Madinah Mövenpick, Dar Al Taqwa. Front row."], p:[1500,8000], t:"c", at:"mdcentral", q:"Madinah hotel suite Haram view", bk:["agoda","trivago","ghotel"]},
    {id:"h5", n:["Hotel 5★ barisan hadapan","Front-row 5★ hotel"], d:["0-200 m dari pagar Masjid Nabawi.","0-200 m from the Masjid an-Nabawi gates."], p:[450,1500], at:"mdcentral", q:"5 star hotel near Masjid Nabawi", bk:["agoda","trivago","ghotel"]},
    {id:"h3", n:["Hotel 3-4★ zon pusat","3-4★ hotel, central zone"], d:["200-600 m, zon Markaziyah.","200-600 m, the Markaziyah zone."], p:[120,400], t:"n", at:"mdcentral", q:"hotel Markaziyah Madinah", bk:["agoda","trivago","ghotel"]},
    {id:"apt", n:["Apartmen / servis","Apartment / serviced"], d:["Jalan Quba atau luar zon pusat, 1-3 km.","Quba Road or outside the centre, 1-3 km."], p:[70,200], at:"mdquba", q:"apartment Madinah", bk:["agoda","gmaps"]},
    {id:"bunk", n:["Bilik berkongsi / katil asrama","Shared room / bunk bed"], d:["Katil dalam bilik berkongsi sejantina.","A bed in a same-gender shared room."], p:[35,80], t:"b", at:"mdquba", q:"hostel Madinah", bk:["agoda","gmaps"]},
    {id:"rent", n:["Bilik sewa murah","Cheap rented room"], d:["2-5 km dengan bas bandar.","2-5 km out with the city bus."], p:[50,130], at:"mdquba", q:"furnished apartments Madinah", bk:["gmaps","agoda"]},
    {id:"free", n:["Percuma (keluarga / kenalan)","Free (family or friends)"], d:["Hanya jika ada keluarga atau kenalan. I'tikaf 10 malam terakhir Ramadan di Masjid Nabawi perlu pendaftaran rasmi.","Only with family or friends. I'tikaf in the last 10 nights of Ramadan at Masjid an-Nabawi needs official registration."], p:[0,0], at:"mdquba", bk:[]}
  ]},
  transfer: {h:["Dari/ke lapangan terbang Saudi","Saudi airport transfers"], ic:"🚕", u:"pp", o:[
    {id:"bus", n:["Bas SAPTCO / van kongsi","SAPTCO bus or shared van"], d:["Paling murah, perlu masa.","Cheapest, takes time."], p:[0,80], t:"b", mode:"bus", bk:["saptco"]},
    {id:"train", n:["Kereta api Haramain + teksi","Haramain train + taxi"], d:["Stesen lapangan terbang Jeddah ke Makkah kira-kira 30-45 min, kemudian teksi 15-20 min.","Jeddah airport station to Makkah about 30-45 min, then a 15-20 min taxi."], p:[80,200], mode:"train", bk:["hhr"]},
    {id:"ride", n:["Uber / Careem / teksi","Uber, Careem or taxi"], d:["Pintu ke pintu. Setuju harga dahulu untuk teksi.","Door to door. Agree the price first for a taxi."], p:[150,400], t:"n", mode:"car", bk:["uber","careem"]},
    {id:"private", n:["Kereta peribadi / GMC dengan pemandu","Private car or GMC with driver"], d:["Sambutan di balai ketibaan.","Meet-and-greet at arrivals."], p:[800,2500], t:"c", mode:"car", bk:["gmaps_cartransfer"]},
    {id:"rentcar", n:["Sewa kereta sendiri","Rent your own car"], d:["Perlu IDP (JPJ) dan lesen Malaysia. Parkir dekat Haram sangat terhad.","Needs an IDP (from JPJ) and your Malaysian licence. Parking near the Haram is very limited."], p:[300,900], mode:"car", bk:["yelo","rentals"]}
  ]},
  intercity: {h:["Makkah ↔ Madinah","Makkah ↔ Madinah"], ic:"🚄", u:"pp", o:[
    {id:"bus", n:["Bas SAPTCO","SAPTCO bus"], d:["5-6 jam.","5-6 hours."], p:[60,120], t:"b", mode:"bus", hrs:5.5, bk:["saptco"]},
    {id:"train", n:["Kereta api Haramain (ekonomi)","Haramain train (economy)"], d:["Kira-kira 2 j 15 min antara stesen; tambah teksi ke hotel.","About 2 h 15 m station to station; add a taxi to the hotel."], p:[180,350], t:"n", mode:"train", hrs:2.25, bk:["hhr"]},
    {id:"trainb", n:["Kereta api Haramain (perniagaan)","Haramain train (business)"], d:["Kerusi lebih luas, ruang menunggu.","Wider seats, lounge."], p:[350,700], mode:"train", hrs:2.25, bk:["hhr"]},
    {id:"private", n:["Kereta peribadi dengan pemandu","Private car with driver"], d:["4.5 jam, boleh singgah Bir Ali.","4.5 hours, can stop at Bir Ali."], p:[1000,3000], t:"c", mode:"car", hrs:4.5, bk:["gmaps_cartransfer"]},
    {id:"rentcar", n:["Kereta sewa sendiri","Own rental car"], d:["Kira-kira 450 km di lebuh raya.","About 450 km on the highway."], p:[200,500], mode:"car", hrs:4.5, bk:["yelo","rentals"]}
  ]},
  local: {h:["Pengangkutan dalam bandar","Getting around the city"], ic:"🚌", u:"pd", o:[
    {id:"walk", n:["Jalan kaki + bas bandar","Walk + city bus"], d:["Bas Makkah (BRT) dan bas Madinah ke kawasan Haram.","Makkah Bus (BRT) and Madinah buses to the Haram area."], p:[0,10], t:"b", mode:"walk", bk:["makkahbus"]},
    {id:"ride", n:["Uber / Careem","Uber or Careem"], d:["Untuk ziarah dan hotel yang jauh. Zon ambil di Haram terhad.","For ziarah and far hotels. Pickup near the Haram is restricted."], p:[15,50], t:"n", mode:"car", bk:["uber","careem"]},
    {id:"driver", n:["Kereta dengan pemandu sedia ada","Car and driver on call"], d:["Melalui concierge hotel.","Through the hotel concierge."], p:[200,600], t:"c", mode:"car", bk:[]},
    {id:"rentcar", n:["Kereta sewa sendiri","Own rental car"], d:["Bagus di Madinah dan Taif; elak pusat Makkah.","Good in Madinah and Taif; avoid central Makkah."], p:[60,150], mode:"car", bk:["yelo","rentals"]}
  ]},
  food: {h:["Makanan","Food"], ic:"🍲", u:"pd", o:[
    {id:"bekal", n:["Bekal dari rumah","Bekal (food from home)"], d:["Serunding, rendang tin, mi segera, biskut, kurma, 3 dalam 1. Perlu cerek. Satu hidangan sehari di kedai murah.","Serunding, canned rendang, instant noodles, biscuits, dates, 3-in-1. Needs a kettle. One meal a day at a cheap shop."], p:[20,45], t:"b"},
    {id:"normal", n:["Makan biasa","Normal meals"], d:["Rangkaian tempatan (contoh Al Baik, Kudu, Al Tazaj) dan restoran Malaysia/Indonesia. SAR 15-40 sehidangan.","Local chains (for example Al Baik, Kudu, Al Tazaj) and Malaysian or Indonesian restaurants. SAR 15-40 a meal."], p:[80,140], t:"n"},
    {id:"hotel", n:["Makanan hotel","Hotel meals"], d:["Sarapan termasuk, bufet makan malam. Sesuai warga emas.","Breakfast included, dinner buffet. Good for seniors."], p:[150,350]},
    {id:"lux", n:["Restoran hotel premium","Premium hotel restaurants"], d:["Restoran hotel Menara Jam dan Jabal Omar, bufet hotel Madinah, dan restoran pilihan anda. Semak ulasan terkini.","Clock Tower and Jabal Omar hotel restaurants, Madinah hotel buffets, and restaurants you add. Check recent reviews."], p:[300,900], t:"c"}
  ]},
  ziarah: {h:["Ziarah","Ziarah"], ic:"🧭", u:"pc", o:[
    {id:"self", n:["Sendiri: jalan kaki + bas","On your own: walk + bus"], d:["Ziarah dekat dengan kaki; Madinah ada bas hop-on.","Walk to the near sites; Madinah has a hop-on bus."], p:[0,30], t:"b", mode:"walk"},
    {id:"van", n:["Van / teksi ziarah separuh hari","Half-day ziarah van or taxi"], d:["Satu pusingan ziarah utama setiap bandar.","One main ziarah loop in each city."], p:[50,150], t:"n", mode:"car"},
    {id:"guide", n:["Ziarah peribadi dengan mutawwif","Private ziarah with a mutawwif"], d:["Kereta, pemandu dan penerangan.","Car, driver and explanations."], p:[300,1000], t:"c", mode:"car"}
  ]},
  guide: {h:["Mutawwif","Mutawwif (guide)"], ic:"🧕", u:"pp", o:[
    {id:"app", n:["Tiada: guna panduan 3D aplikasi ini","None: use this app's 3D guide"], d:["Mod Ikut langkah + kaunter tawaf & sa'ie.","Step-by-step mode + the tawaf & sa'ie counter."], p:[0,0], t:"b"},
    {id:"shared", n:["Mutawwif berkongsi untuk umrah","Shared mutawwif for the umrah"], d:["Ikut kumpulan kecil untuk umrah pertama.","Join a small group for the first umrah."], p:[0,500], t:"n"},
    {id:"private", n:["Mutawwif peribadi sepanjang perjalanan","Private mutawwif all trip"], d:["Untuk keluarga dan warga emas.","For families and seniors."], p:[1500,5000], t:"c"}
  ]},
  home: {h:["Rumah ke lapangan terbang","Home to the airport"], ic:"🚗", u:"grp", o:[
    {id:"family", n:["Keluarga hantar","Family drops you off"], d:["",""], p:[0,50], t:"b", mode:"car"},
    {id:"grab", n:["Grab / teksi","Grab or taxi"], d:["",""], p:[80,250], t:"n", mode:"car"},
    {id:"erl", n:["Tren / ERL KLIA Ekspres","Train / KLIA Ekspres"], d:["Dari KL Sentral 28 min.","28 min from KL Sentral."], p:[60,150], mode:"train"},
    {id:"park", n:["Kereta sendiri + parkir jangka panjang","Own car + long-term parking"], d:["",""], p:[150,400], t:"c", mode:"car"}
  ]},
  shop: {h:["Membeli-belah","Shopping"], ic:"🛍", u:"pp", o:[
    {id:"none", n:["Tiada","None"], d:["Fokus ibadah sepenuhnya.","Full focus on worship."], p:[0,0]},
    {id:"min", n:["Minimum (1 slot setiap bandar)","Minimum (1 slot per city)"], d:["60 minit selepas Isyak pada malam terakhir di bandar itu.","60 minutes after Isyak on your last night in that city."], p:[100,600], t:"bnc"},
    {id:"mid", n:["Sederhana (2 slot)","Moderate (2 slots)"], d:["",""], p:[600,1500]}
  ]}
};
var UM_ORDER = ["flight","home","transfer","lodgeMk","lodgeMd","intercity","local","food","ziarah","guide","shop"];
// fixed per-person costs
var UM_FIXED = [
  {id:"visa", n:["Visa (eVisa pelancong atau visa umrah, termasuk insurans)","Visa (tourist eVisa or umrah visa, insurance included)"], p:[550,650]},
  {id:"vax", n:["Vaksin meningokokus ACYW (wajib)","Meningococcal ACYW vaccine (required)"], p:[0,200]}
];
var UM_TIERS = {
  b:{n:["Asas","Basic"], d:["Paling jimat: jalan kaki, bilik berkongsi, bas, bekal.","Lowest cost: walking, shared rooms, bus, bekal."], ic:"🎒"},
  n:{n:["Biasa","Normal"], d:["Hotel 3-4★, kereta api Haramain, makan biasa.","3-4★ hotels, Haramain train, normal meals."], ic:"🧳"},
  c:{n:["Selesa","Comfort"], d:["Suite Menara Jam, kelas perniagaan, kereta peribadi.","Clock Tower suites, business class, private car."], ic:"✨"}
};

// ---------- ziarah sets per city: [place id, minutes on site, needs car, priority 1 high .. 3 low, walking-near flag] ----------
var UM_ZIARAH = {
  mk: {
    walk: [["maala",40,0,2],["jin",20,0,3],["maulid",15,0,3]],
    loop: [["thawr",15,1,2],["arafah",30,1,1],["namirah",10,1,3],["muzdal",10,1,2],["mina",10,1,1],["jamrat",10,1,2],["hira",25,1,1]],
    extra:[["joud",60,1,3],["clock",60,0,3]]
  },
  md: {
    walk: [["baqi",30,0,1],["ghamamah",25,0,2],["kurma",0,0,3]],
    loop: [["quba",40,1,1],["jumuah",15,1,3],["qiblatain",25,1,2],["khandaq",25,1,2],["uhud",45,1,1]],
    extra:[["qurancx",60,1,3],["dama",60,1,3]]
  }
};

// ---------- booking links ----------
// Real services. Query formats can change; every link lands on the right site even if the pre-filled search is ignored.
var UM_LINKS = {
  nusuk:     {n:"Nusuk", d:["Rasmi: permit umrah dan Raudhah","Official: umrah and Raudhah permits"], u:"https://www.nusuk.sa", app:"https://play.google.com/store/search?q=Nusuk&c=apps"},
  visa:      {n:"Saudi eVisa (Visit Saudi)", d:["Rasmi: visa pelancong, boleh untuk umrah di luar musim haji","Official: tourist visa, valid for umrah outside hajj season"], u:"https://visa.visitsaudi.com"},
  hhr:       {n:"Haramain High Speed Railway", d:["Rasmi: tiket kereta api Jeddah, Makkah, Madinah","Official: train tickets Jeddah, Makkah, Madinah"], u:"https://sar.hhr.sa"},
  saptco:    {n:"SAPTCO", d:["Bas antara bandar","Intercity buses"], u:"https://www.saptco.com.sa"},
  makkahbus: {n:"Makkah Bus", d:["Bas bandar Makkah","Makkah city buses"], u:"https://www.google.com/maps/search/?api=1&query=Makkah+Bus+station"},
  agoda:     {n:"Agoda", d:["Hotel, apartmen, asrama","Hotels, apartments, hostels"], fn:"agoda"},
  trivago:   {n:"trivago", d:["Banding harga hotel","Compare hotel prices"], fn:"trivago"},
  ghotel:    {n:"Google Hotels", d:["Cari hotel ikut tarikh","Search hotels by date"], fn:"ghotel"},
  gmaps:     {n:"Google Maps", d:["Cari di peta","Search on the map"], fn:"gmaps"},
  gflights:  {n:"Google Flights", d:["Banding penerbangan","Compare flights"], fn:"gflights"},
  skyscanner:{n:"Skyscanner", d:["Banding penerbangan","Compare flights"], fn:"skyscanner"},
  saudia:    {n:"Saudia", d:["Syarikat penerbangan","Airline"], u:"https://www.saudia.com"},
  mas:       {n:"Malaysia Airlines", d:["Syarikat penerbangan","Airline"], u:"https://www.malaysiaairlines.com"},
  uber:      {n:"Uber", d:["Teksi aplikasi","Ride app"], u:"https://m.uber.com"},
  careem:    {n:"Careem", d:["Teksi aplikasi","Ride app"], u:"https://www.careem.com"},
  yelo:      {n:"Yelo", d:["Sewa kereta Saudi","Saudi car rental"], u:"https://www.iyelo.com"},
  rentals:   {n:"Google: sewa kereta","n_en":"Google: car rental", d:["Banding syarikat sewa kereta","Compare rental companies"], fn:"rentals"},
  gmaps_cartransfer:{n:"Google Maps", d:["Cari syarikat kereta peribadi berlesen","Find licensed private car companies"], fn:"cartransfer"}
};

// ---------- checklist ----------
// [id, group, [ms,en], condition key or ""]
var UM_CHECK = [
  ["pass","doc",["Pasport (sah 6 bulan lebih)","Passport (valid 6+ months)"],""],
  ["visa","doc",["Visa (cetak atau PDF dalam telefon)","Visa (printed or PDF on the phone)"],""],
  ["nusuk","doc",["Aplikasi Nusuk dipasang dan log masuk","Nusuk app installed and signed in"],""],
  ["raud","doc",["Permit Raudhah (tangkapan skrin)","Raudhah permit (screenshot)"],""],
  ["tix","doc",["Tiket penerbangan dan kereta api","Flight and train tickets"],""],
  ["hotel","doc",["Baucar hotel","Hotel vouchers"],""],
  ["vax","doc",["Sijil vaksin meningokokus ACYW","Meningococcal ACYW vaccine certificate"],""],
  ["ins","doc",["Insurans perjalanan","Travel insurance"],""],
  ["idp","doc",["Lesen memandu antarabangsa (IDP) + lesen Malaysia","International Driving Permit + Malaysian licence"],"rentcar"],
  ["copy","doc",["Salinan pasport/IC dalam telefon dan kertas","Copies of passport and IC on the phone and on paper"],""],
  ["emb","doc",["Nombor Kedutaan Malaysia Riyadh & Konsulat Jeddah","Malaysian Embassy Riyadh & Consulate Jeddah numbers"],""],
  ["ihram","cloth",["2 pasang kain ihram + tali pinggang ihram","2 sets of ihram + ihram belt"],"male"],
  ["telekung","cloth",["Telekung dan pakaian longgar menutup aurat","Telekung and loose modest clothes"],"female"],
  ["sandal","cloth",["Selipar yang tidak menutup buku lali (ihram lelaki)","Sandals that leave the ankle bone open (men in ihram)"],"male"],
  ["shoes","cloth",["Kasut berjalan yang selesa","Comfortable walking shoes"],""],
  ["jacket","cloth",["Jaket nipis (malam Madinah sejuk musim sejuk)","Light jacket (Madinah winter nights are cold)"],""],
  ["shoebag","cloth",["Beg kasut untuk masuk masjid","Shoe bag for the masjid"],""],
  ["meds","health",["Ubat sendiri dalam pek asal + surat doktor","Own medicine in original packs + doctor's letter"],""],
  ["pain","health",["Panadol, ORS, plaster, krim kaki","Paracetamol, ORS, plasters, foot cream"],""],
  ["unsc","health",["Sabun dan losyen tanpa wangian (untuk ihram)","Unscented soap and lotion (for ihram)"],""],
  ["sun","health",["Pelindung matahari tanpa wangian, pelembap bibir","Unscented sunblock, lip balm"],""],
  ["mask","health",["Pelitup muka","Face masks"],""],
  ["insulin","health",["Beg sejuk insulin dan alat gula","Insulin cooler and glucose meter"],"diabetes"],
  ["bag","gear",["Beg galas kecil","Small backpack"],""],
  ["bottle","gear",["Botol boleh isi semula untuk zamzam","Refillable bottle for zamzam"],""],
  ["mat","gear",["Sejadah lipat","Foldable prayer mat"],""],
  ["power","gear",["Power bank dan plag 3 pin jenis G (UK)","Power bank and type G (UK) 3-pin adapter"],""],
  ["sim","gear",["eSIM Saudi atau perayauan","Saudi eSIM or roaming"],""],
  ["umb","gear",["Payung kecil untuk panas","Small umbrella for the sun"],""],
  ["tag","gear",["Kad nama dengan alamat hotel dalam bahasa Arab","Name card with the hotel address in Arabic"],""],
  ["wheel","gear",["Kerusi roda (atau sewa di sana)","Wheelchair (or rent there)"],"wheel"],
  ["stroller","gear",["Kereta sorong bayi ringan (terhad dalam masjid)","Light stroller (limited inside the masjid)"],"infant"],
  ["kettle","food",["Cerek elektrik kecil (jika hotel benarkan)","Small electric kettle (if the hotel allows)"],"bekal"],
  ["bekalf","food",["Bekal: serunding, rendang tin, mi segera, biskut, kurma, 3 dalam 1 (bertutup dan berlabel)","Bekal: serunding, canned rendang, instant noodles, biscuits, dates, 3-in-1 (sealed and labelled)"],"bekal"],
  ["spoon","food",["Bekas makanan dan sudu","Food box and spoon"],"bekal"],
  ["cash","money",["Sedikit wang tunai SAR","Some SAR cash"],""],
  ["card","money",["Kad dengan caj tukaran rendah + kad kecemasan","A low-fee card + a spare emergency card"],""]
];
var UM_CHECK_G = {doc:["Dokumen","Documents"], cloth:["Pakaian & ihram","Clothes & ihram"], health:["Kesihatan","Health"], gear:["Barang","Gear"], food:["Bekal","Bekal"], money:["Wang","Money"]};
var UM_DONT_BRING = [["Wang tunai banyak tanpa diisytihar","Large undeclared cash"],["Dron","Drones"],["Minyak wangi semasa ihram","Perfume while in ihram"],["Barang tajam dalam beg kabin","Sharp items in the cabin bag"],["Daging segar atau makanan tanpa label","Fresh meat or unlabelled food"]];

// ---------- do's and don'ts (flagged for ustaz review) ----------
var UM_ADAB = {
  do: [
    ["Belajar langkah umrah sebelum terbang dan kenali miqat laluan anda.","Learn the umrah steps before flying and know the miqat on your route.","hajj"],
    ["Pakai ihram sebelum miqat, niat di miqat, dan bertalbiah hingga mula tawaf.","Wear ihram before the miqat, make niat at the miqat, and say the talbiyah until tawaf starts.","hajj"],
    ["Jaga wuduk, datang awal setiap solat, ikut arahan petugas masjid dan kawasan lelaki/wanita.","Keep wudu, come early to every prayer, follow the masjid staff and the men's and women's areas.",""],
    ["Minum air dan zamzam secukupnya; rehat selepas Zohor; guna payung ketika panas.","Drink enough water and zamzam; rest after Zohor; use an umbrella in the heat.",""],
    ["Simpan kad hotel dan tetapkan titik pertemuan (nombor pintu) jika terpisah.","Keep the hotel card and set a meeting point (gate number) in case you get separated.",""],
    ["Tempah Raudhah di Nusuk awal dan semak setiap hari; hormati masa slot.","Book Raudhah on Nusuk early and keep checking; keep to your slot time.","nusuk"],
    ["Beri salam kepada Rasulullah ﷺ dengan tenang dan terus bergerak.","Give salam to the Prophet ﷺ calmly and keep moving.",""],
    ["Bawa salinan pasport dan permit Nusuk; pastikan telefon dicas.","Carry a passport copy and the Nusuk permit; keep your phone charged.",""],
    ["Doakan ibu bapa, keluarga dan umat.","Make doa for your parents, family and the ummah.",""],
    ["Buat tawaf wida' sejurus sebelum meninggalkan Makkah.","Do the farewell tawaf just before leaving Makkah.","hajj"]
  ],
  dont: [
    ["Jangan langgar larangan ihram: wangian, potong rambut/kuku, lelaki tutup kepala, wanita tutup muka dan tapak tangan, memburu, bersetubuh, bertengkar.","Don't break the ihram rules: perfume, cutting hair or nails, men covering the head, women covering the face and hands, hunting, marital relations, arguing."],
    ["Jangan tolak atau sakiti orang untuk mencium Hajar Aswad; isyarat dari jauh sudah memadai.","Don't push or hurt others to reach the Black Stone; pointing from afar is enough."],
    ["Jangan ambil gambar atau video yang menghalang orang; elak swafoto di makam.","Don't take photos or videos that block others; no selfies at the Prophet's ﷺ grave."],
    ["Jangan tidur di masjid kecuali i'tikaf, dan jangan tanda tempat dengan beg.","Don't sleep in the masjid except for i'tikaf, and don't save places with bags."],
    ["Jangan ikut amalan di tempat ziarah yang bukan sunnah: menyapu dinding untuk berkat, mengambil tanah atau batu, menulis pada batu.","Don't follow ziarah-site practices that are not sunnah: wiping walls for blessing, taking soil or stones, writing on rocks."],
    ["Jangan beli daripada ulat ziarah tanpa lesen, dan jangan serahkan pasport kepada sesiapa kecuali hotel atau pihak berkuasa.","Don't buy from unlicensed ziarah touts, and give your passport only to the hotel or the authorities."],
    ["Jangan berbelanja berlebihan; jadual hanya ada satu slot membeli-belah setiap bandar dengan sengaja.","Don't overspend; the plan keeps one shopping slot per city on purpose."],
    ["Jangan daki Jabal Nur atau Jabal Thawr pada tengah hari atau jika lutut lemah.","Don't climb Jabal Nur or Jabal Thawr at midday or with weak knees."],
    ["Jangan bawa wang tunai yang banyak atau tinggalkan beg tanpa jagaan.","Don't carry lots of cash or leave bags unattended."],
    ["Jangan minta Uber/Careem di zon larangan; jalan ke titik ambil yang ditanda.","Don't call a ride in a no-pickup zone; walk to the marked pickup point."]
  ]
};
