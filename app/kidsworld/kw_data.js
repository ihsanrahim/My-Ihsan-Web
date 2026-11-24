/* My Ihsan 0.7.52 · Kids Planet data: the 10 houses, every activity (from the owner's ticked list, idea numbers in `i`), and the content banks.
   Strings are "Bahasa Melayu|English" (split on the first "|", so never use "|" twice).
   Activity types (played by kw_play.js): learn (opens an existing page), sirah, hajj, doa, asma, quiz, tip, memory, check, timer, moves, breath, counter, draw, colour, moon, diary, story, plant, feel, family, tower, soon.
   `soon` = placed in its house, shown as "Coming soon", not counted in the pearl ring yet. */
(function(){
var K = window.KW = window.KW || {};
var BIOMES = {city:["Bandar|City"], desert:["Padang pasir|Desert"], forest:["Hutan|Forest"], garden:["Taman|Garden"]};

// ---------- houses ----------
// e/n place the house around its biome centre (radians). col/roof are the house colours. b = the 3D builder in kw_world.js.
var HOUSES = [
 {id:"masjid", b:"masjid", biome:"city", e:0.0, n:0.14, col:"#12908a", roof:"#e0a82e", n1:"Bukit Masjid|Masjid Hill", ic:"🕌", acts:[
   {id:"m_pray", i:2,  t:"learn", page:"solat", ic:"🧎", n:"Belajar solat (3D)|Learn to pray (3D)"},
   {id:"m_wudu", i:3,  t:"learn", page:"wudhu", ic:"💧", n:"Wuduk langkah demi langkah|Wudu step by step"},
   {id:"m_doa",  i:4,  t:"doa", mode:"day", ic:"🤲", n:"Doa hari ini|Dua of the day"},
   {id:"m_surah",i:6,  t:"quiz", bank:"surah", ic:"📖", n:"Kuiz isi tempat kosong surah|Surah fill-in quiz"},
   {id:"m_asma", i:13, t:"asma", ic:"✨", n:"Kad 99 Nama Allah|99 Names cards"},
   {id:"m_tajwid",i:51,t:"learn", page:"tajwid", ic:"🎨", n:"Tajwid berwarna|Tajwid colours"},
   {id:"m_sunnah",i:53,t:"tip", bank:"sunnah", ic:"🌟", n:"Sunnah hari ini|Sunnah of the day"},
   {id:"m_sleep",i:56, t:"doa", mode:"sleep", ic:"🌙", n:"Doa tidur dan bangun|Sleep and wake-up dua"},
   {id:"m_hajj", i:58, t:"hajj", ic:"🕋", n:"Haji untuk kanak-kanak|Hajj for kids"},
   {id:"m_sirah",i:0,  t:"sirah", ic:"🐪", n:"Jejak Sirah Nabi ﷺ|The Prophet's ﷺ Sirah trail"},
   {id:"m_qibla",i:52, t:"soon", ic:"🧭", n:"Permainan hadap kiblat|Face-the-qibla game"},
   {id:"m_eid",  i:57, t:"soon", ic:"🌙", n:"Mod Aidilfitri dan Aidiladha|Eid mode"},
   {id:"m_recite",i:61,t:"soon", ic:"🎙️", n:"Baca dan banding dengan qari|Recite and compare"},
   {id:"m_card", i:50, t:"soon", ic:"💌", n:"Hadiahkan kad doa|Gift a dua card"}
 ]},
 {id:"letter", b:"letter", biome:"city", e:-0.38, n:-0.12, col:"#9775fa", roof:"#7048e8", n1:"Rumah Huruf|Letter House", ic:"🔤", acts:[
   {id:"l_hij",  i:11, t:"learn", page:"hijaiyah", ic:"ب", n:"Menjejak huruf Hijaiyah|Trace the Hijaiyah letters"},
   {id:"l_spell",i:16, t:"quiz", bank:"spell", ic:"✏️", n:"Permainan ejaan|Spelling game"},
   {id:"l_read", i:20, t:"learn", page:"iqra", ic:"📗", n:"Sudut bacaan|Reading corner"},
   {id:"l_word", i:62, t:"tip", bank:"arabic", ic:"🔠", n:"Perkataan Arab hari ini|Arabic word of the day"},
   {id:"l_peri", i:63, t:"quiz", bank:"peri", ic:"💬", n:"Kad peribahasa|Peribahasa cards"},
   {id:"l_jamma",i:0,  t:"learn", page:"jamma", ic:"📖", n:"Juz Amma|Juz Amma"}
 ]},
 {id:"number", b:"number", biome:"city", e:0.38, n:-0.1, col:"#f08c00", roof:"#e03131", n1:"Rumah Nombor|Number House", ic:"🔢", acts:[
   {id:"n_times",i:17, t:"quiz", bank:"times", ic:"✖️", n:"Sifir|Times tables"},
   {id:"n_clock",i:65, t:"quiz", bank:"clock", ic:"🕒", n:"Permainan jam|Clock game"},
   {id:"n_money",i:66, t:"quiz", bank:"money", ic:"💰", n:"Kedai Ringgit|Ringgit shop"},
   {id:"n_save", i:87, t:"counter", key:"save", unit:"RM", goal:20, step:1, ic:"🐷", n:"Matlamat simpanan|Savings goal"}
 ]},
 {id:"obs", b:"obs", biome:"desert", e:0.0, n:0.2, col:"#5c7cfa", roof:"#364fc7", n1:"Balai Cerap|Observatory", ic:"🔭", acts:[
   {id:"s_fact", i:15, t:"tip", bank:"didyou", ic:"💡", n:"Tahukah anda?|Did you know?"},
   {id:"s_geo",  i:64, t:"quiz", bank:"geo", ic:"🗺️", n:"Kuiz peta dunia Islam|Muslim world map quiz"},
   {id:"s_home", i:67, t:"tip", bank:"homesci", ic:"🧪", n:"Kad sains di rumah|Home science cards"},
   {id:"s_moon", i:68, t:"moon", ic:"🌙", n:"Bulan dan kalendar Hijrah|Moon and Hijri calendar"},
   {id:"s_aid",  i:70, t:"quiz", bank:"firstaid", ic:"🩹", n:"Pertolongan cemas untuk kanak-kanak|First aid for kids"},
   {id:"s_wx",   i:69, t:"soon", ic:"🌦️", n:"Cuaca dan musim|Weather and seasons"}
 ]},
 {id:"tent", b:"tent", biome:"desert", e:0.26, n:-0.2, col:"#e8697d", roof:"#ffffff", n1:"Khemah Cerita|Story Tent", ic:"⛺", acts:[
   {id:"t_nabi", i:12, t:"learn", page:"nabi", ic:"🌿", n:"Kisah para Nabi|Prophet stories"},
   {id:"t_bed",  i:14, t:"tip", bank:"bedtime", ic:"🌙", n:"Cerita sebelum tidur|Bedtime story"},
   {id:"t_adab", i:54, t:"quiz", bank:"adab", ic:"🤝", n:"Babak adab|Adab scenes"},
   {id:"t_pillar",i:55,t:"tip", bank:"pillars", ic:"🏛️", n:"Peta rukun Islam dan Iman|Pillars map"},
   {id:"t_build",i:71, t:"story", ic:"📚", n:"Pembina cerita|Story builder"},
   {id:"t_sahabat",i:0,t:"learn", page:"sahabat", ic:"🏅", n:"Kisah Sahabat|Companion stories"},
   {id:"t_voice",i:74, t:"soon", ic:"🎤", n:"Rak suara saya|My voice shelf"},
   {id:"t_puppet",i:75,t:"soon", ic:"🎭", n:"Teater wayang bayang|Shadow-puppet theatre"}
 ]},
 {id:"tree", b:"tree", biome:"forest", e:0.0, n:0.2, col:"#51cf66", roof:"#e03131", n1:"Arked Permainan|Game Arcade", ic:"🎮", acts:[
   {id:"g_iq",   i:21, t:"learn", page:"iqg", ic:"🧠", n:"Permainan otak 3 minit|3-minute brain game"},
   {id:"g_pat",  i:24, t:"quiz", bank:"pattern", ic:"🧩", n:"Teka corak|Pattern puzzles"},
   {id:"g_mem",  i:25, t:"memory", ic:"🃏", n:"Kad ingatan|Memory cards"},
   {id:"g_rid",  i:78, t:"quiz", bank:"riddle", ic:"❓", n:"Teka-teki hari ini|Daily riddles"},
   {id:"g_maze", i:28, t:"soon", ic:"🌀", n:"Permainan labirin dan peta|Maze and map games"},
   {id:"g_code", i:29, t:"soon", ic:"🤖", n:"Blok pengaturcaraan mudah|Simple coding blocks"},
   {id:"g_clap", i:76, t:"soon", ic:"👏", n:"Permainan irama tepuk|Clapping rhythm game"},
   {id:"g_jig",  i:79, t:"soon", ic:"🖼️", n:"Teka-teki jigsaw|Jigsaw puzzles"}
 ]},
 {id:"sports", b:"sports", biome:"forest", e:0.12, n:-0.32, col:"#4dabf7", roof:"#1971c2", n1:"Taman Sukan|Sports Park", ic:"⚽", acts:[
   {id:"p_move", i:31, t:"moves", ic:"🏃", n:"Pengembaraan senaman|Exercise adventure"},
   {id:"p_water",i:32, t:"counter", key:"water", unit:"cup", goal:8, step:1, ic:"💧", n:"Air minum hari ini|Water today"},
   {id:"p_sleep",i:32, t:"counter", key:"sleep", unit:"h", goal:9, step:1, ic:"😴", n:"Tidur malam tadi|Last night's sleep"},
   {id:"p_teeth",i:34, t:"timer", secs:120, ic:"🪥", n:"Pemasa memberus gigi|Brush-your-teeth timer"}
 ]},
 {id:"studio", b:"studio", biome:"garden", e:0.32, n:0.02, col:"#f783ac", roof:"#f59f00", n1:"Studio Seni|Art Studio", ic:"🎨", acts:[
   {id:"a_draw", i:22, t:"draw", ic:"🖌️", n:"Papan lukisan|Drawing pad"},
   {id:"a_col",  i:72, t:"colour", ic:"🌸", n:"Halaman mewarna|Colouring pages"},
   {id:"a_stick",i:26, t:"stickers", ic:"⭐", n:"Album pelekat|Sticker album"},
   {id:"a_diary",i:30, t:"diary", mode:"day", ic:"📔", n:"Diari “hari saya”|“My day” diary"},
   {id:"a_masjid",i:23,t:"soon", ic:"🕌", n:"Bina masjid 3D|Build-a-masjid in 3D"},
   {id:"a_block",i:73, t:"soon", ic:"🧱", n:"Pembina blok 3D|3D block builder"}
 ]},
 {id:"pav", b:"pav", biome:"garden", e:-0.25, n:0.16, col:"#20c997", roof:"#12908a", n1:"Pavilion Taman|Garden Pavilion", ic:"🌳", acts:[
   {id:"v_grow", i:80, t:"plant", ic:"🌱", n:"Tanam taman|Grow-a-garden"},
   {id:"v_seed", i:90, t:"diary", mode:"seed", ic:"🌰", n:"Diari biji benih|Seed diary"},
   {id:"v_eat",  i:33, t:"quiz", bank:"healthy", ic:"🍎", n:"Makan sihat|Healthy eating"},
   {id:"v_cook", i:86, t:"tip", bank:"recipes", ic:"🍳", n:"Pembantu memasak|Cooking helper"}
 ]},
 {id:"home", b:"home", biome:"garden", e:-0.02, n:-0.38, col:"#ffa94d", roof:"#c92a2a", n1:"Rumahku|Home Sweet Home", ic:"🏠", acts:[
   {id:"h_morn", i:81, t:"check", key:"morn", ic:"☀️", n:"Rutin pagi|Morning routine", items:["Kemas katil|Make the bed","Gosok gigi|Brush teeth","Pakai baju|Get dressed","Sarapan|Eat breakfast","Siap beg sekolah|Pack the school bag"]},
   {id:"h_chore",i:82, t:"check", key:"chore", approve:1, ic:"🧹", n:"Carta tugasan|Chore chart", items:["Simpan mainan|Put toys away","Basuh pinggan sendiri|Take your plate to the sink","Tolong lipat baju|Help fold clothes","Siram pokok|Water a plant"]},
   {id:"h_tidy", i:83, t:"timer", secs:180, ic:"🧺", n:"Permainan kemas 3 minit|3-minute tidy-up game"},
   {id:"h_feel", i:84, t:"feel", ic:"💛", n:"Semak perasaan|Feelings check-in"},
   {id:"h_calm", i:85, t:"breath", ic:"🫧", n:"Sudut tenang|Calm corner"},
   {id:"h_road", i:88, t:"quiz", bank:"road", ic:"🚦", n:"Keselamatan jalan raya|Road safety"},
   {id:"h_manner",i:89,t:"quiz", bank:"manners", ic:"🙏", n:"Adab makan dan bertamu|Table and visiting manners"},
   {id:"h_tree", i:40, t:"family", ic:"🌳", n:"Salasilah keluarga saya|My family tree"},
   {id:"h_hunt", i:77, t:"soon", ic:"🗝️", n:"Memburu harta karun|House treasure hunt"}
 ]}
];

// Star Tower (ideas 36, 37, 38) and Parent Tower (the parent corner) are special buildings.
var TOWER = {id:"tower", biome:"city", e:0.0, n:-0.58, n1:"Menara Bintang|Star Tower", ic:"⭐"};
var PARENT = {id:"parent", biome:"garden", e:-0.55, n:-0.3, n1:"Menara Ibu Bapa|Parent Tower", ic:"🔒"};

// ---------- content banks ----------
var BANK = {};
// quiz banks: [question, [options], answerIndex, hint?]
BANK.surah = [
 ["Al-Fatihah: الْحَمْدُ لِلَّهِ رَبِّ ___",["الْعَالَمِينَ","النَّاسِ","الْفَلَقِ"],0],
 ["Al-Fatihah: إِيَّاكَ نَعْبُدُ وَإِيَّاكَ ___",["نَسْتَعِينُ","نَعْلَمُ","نَصْبِرُ"],0],
 ["Al-Ikhlas: قُلْ هُوَ اللَّهُ ___",["أَحَدٌ","الصَّمَدُ","الْكَوْثَرَ"],0],
 ["Al-Ikhlas: اللَّهُ ___",["الصَّمَدُ","أَحَدٌ","الرَّحِيمُ"],0],
 ["Al-Ikhlas: لَمْ يَلِدْ وَلَمْ ___",["يُولَدْ","يَقُلْ","يَعْلَمْ"],0],
 ["Al-Kawthar: إِنَّا أَعْطَيْنَاكَ ___",["الْكَوْثَرَ","الْعَصْرَ","الْفَلَقَ"],0],
 ["Al-Kawthar: فَصَلِّ لِرَبِّكَ ___",["وَانْحَرْ","وَاصْبِرْ","وَاسْجُدْ"],0],
 ["Al-Asr: إِنَّ ___ لَفِي خُسْرٍ",["الْإِنسَانَ","الْجِنَّ","الْعَالَمِينَ"],0],
 ["An-Nas: قُلْ أَعُوذُ بِرَبِّ ___",["النَّاسِ","الْفَلَقِ","الْكَوْثَرِ"],0]
];
BANK.spell = [
 ["Mana ejaan yang betul?|Which spelling is right?",["sekolah","skolah","sekola"],0],
 ["Mana ejaan yang betul?|Which spelling is right?",["gembira","gembera","gimbira"],0],
 ["Mana ejaan yang betul?|Which spelling is right?",["terima kasih","terimah kasih","terima kaseh"],0],
 ["Mana ejaan yang betul?|Which spelling is right?",["bersih","bersi","berseh"],0],
 ["Mana ejaan yang betul?|Which spelling is right?",["kucing","kuching","kucin"],0],
 ["Mana ejaan yang betul?|Which spelling is right?",["Ramadan","Ramadhan","Ramdan"],0],
 ["Which spelling is right?|Which spelling is right?",["beautiful","beutiful","beautifull"],0],
 ["Which spelling is right?|Which spelling is right?",["because","becuase","becaus"],0],
 ["Which spelling is right?|Which spelling is right?",["friend","freind","frend"],0],
 ["Which spelling is right?|Which spelling is right?",["Wednesday","Wensday","Wednesdy"],0]
];
BANK.peri = [
 ["Rajin pangkal pandai|Rajin pangkal pandai",["Rajin belajar membawa kejayaan|Working hard brings success","Tidur lena dapat ilmu|Sleeping a lot gives knowledge","Pandai tidak perlu rajin|Clever people do not need to work"],0],
 ["Malu bertanya sesat jalan|Malu bertanya sesat jalan",["Jangan malu bertanya supaya tidak tersilap|Do not be shy to ask, so you do not go wrong","Jalan yang jauh perlu peta|A far road needs a map","Bertanya itu memalukan|Asking is embarrassing"],0],
 ["Berat sama dipikul, ringan sama dijinjing|Berat sama dipikul, ringan sama dijinjing",["Berkongsi susah dan senang bersama|Share the hard and the easy together","Beg yang berat itu susah|A heavy bag is hard","Setiap orang bawa sendiri|Everyone carries their own"],0],
 ["Sedikit-sedikit lama-lama jadi bukit|Sedikit-sedikit lama-lama jadi bukit",["Simpanan sedikit lama-lama jadi banyak|Small savings grow big over time","Bukit itu tinggi|The hill is tall","Jangan menyimpan|Do not save"],0],
 ["Seperti kacang lupakan kulit|Seperti kacang lupakan kulit",["Lupa asal usul dan budi orang|Forgetting your roots and who helped you","Kacang itu sedap|Peanuts are tasty","Kulit kacang keras|The shell is hard"],0],
 ["Bagai aur dengan tebing|Bagai aur dengan tebing",["Saling membantu dan rapat|Close and helping each other","Aur itu pokok tinggi|Aur is a tall plant","Tebing itu runtuh|The bank collapses"],0],
 ["Di mana bumi dipijak, di situ langit dijunjung|Di mana bumi dipijak, di situ langit dijunjung",["Hormati adat tempat yang kita duduki|Respect the customs where you live","Bumi itu bulat|The earth is round","Langit sentiasa biru|The sky is always blue"],0]
];
BANK.geo = [
 ["Ibu negara Malaysia?|Capital of Malaysia?",["Kuala Lumpur","Johor Bahru","Ipoh"],0],
 ["Ibu negara Indonesia?|Capital of Indonesia?",["Jakarta","Surabaya","Bandung"],0],
 ["Ibu negara Brunei?|Capital of Brunei?",["Bandar Seri Begawan","Kuching","Dhaka"],0],
 ["Ibu negara Arab Saudi?|Capital of Saudi Arabia?",["Riyadh","Jeddah","Makkah"],0],
 ["Ibu negara Mesir?|Capital of Egypt?",["Cairo","Alexandria","Giza"],0],
 ["Ibu negara Turkiye?|Capital of Turkiye?",["Ankara","Istanbul","Izmir"],0],
 ["Ibu negara Pakistan?|Capital of Pakistan?",["Islamabad","Karachi","Lahore"],0],
 ["Ibu negara Maghribi?|Capital of Morocco?",["Rabat","Casablanca","Fez"],0],
 ["Ibu negara Jordan?|Capital of Jordan?",["Amman","Petra","Aqaba"],0],
 ["Ibu negara Qatar?|Capital of Qatar?",["Doha","Dubai","Muscat"],0],
 ["Ibu negara Oman?|Capital of Oman?",["Muscat","Doha","Riyadh"],0],
 ["Ibu negara Bangladesh?|Capital of Bangladesh?",["Dhaka","Karachi","Colombo"],0]
];
BANK.firstaid = [
 ["Jari anda terluka sedikit. Apa buat dahulu?|You get a small cut on your finger. What first?",["Basuh dengan air bersih dan beritahu orang dewasa|Rinse with clean water and tell a grown-up","Sorokkan luka itu|Hide the cut","Gigit jari itu|Bite the finger"],0],
 ["Tangan terkena air panas. Apa buat?|Your hand touches hot water. What do you do?",["Alirkan air sejuk dan panggil orang dewasa|Run cool water and call a grown-up","Letak ais terus|Put ice straight on","Calit pasta gigi|Rub on toothpaste"],0],
 ["Hidung berdarah. Apa buat?|Your nose bleeds. What do you do?",["Duduk, condong ke depan, picit hidung lembut|Sit, lean forward, pinch the nose gently","Dongak kepala ke atas|Tilt your head back","Berlari|Run around"],0],
 ["Seseorang pengsan dan tidak menjawab. Apa buat?|Someone faints and does not answer. What do you do?",["Panggil orang dewasa dan telefon 999|Shout for a grown-up and call 999","Tinggalkan dia|Leave them","Bagi dia minum|Give them a drink"],0],
 ["Nombor kecemasan di Malaysia?|Emergency number in Malaysia?",["999","123","555"],0],
 ["Anda berasa pening kerana panas. Apa buat?|You feel dizzy from the heat. What do you do?",["Duduk di tempat teduh dan minum air|Sit in the shade and drink water","Terus berlari|Keep running","Berjemur lagi|Stay in the sun"],0]
];
BANK.adab = [
 ["Anda masuk rumah. Apa yang dibaca atau diucap?|You come into the house. What do you say?",["Assalamualaikum|Assalamualaikum","Hai sahaja|Just hi","Tidak berkata apa-apa|Say nothing"],0],
 ["Sebelum makan, anda...|Before eating you...",["Baca Bismillah dan makan dengan tangan kanan|Say Bismillah and eat with your right hand","Terus makan|Start right away","Makan sambil berlari|Eat while running"],0],
 ["Orang tua sedang bercakap. Anda...|An elder is speaking. You...",["Dengar dengan sopan|Listen politely","Memotong cakap|Interrupt","Bermain telefon|Play on a phone"],0],
 ["Seseorang membantu anda. Anda berkata...|Someone helps you. You say...",["Jazakallahu khairan / terima kasih|Jazakallahu khairan / thank you","Tiada apa|Nothing","Itu tugas dia|That is their job"],0],
 ["Ingin masuk bilik orang lain. Anda...|You want to enter someone else's room. You...",["Ketuk dan minta izin dahulu|Knock and ask permission first","Terus masuk|Walk straight in","Menjerit|Shout"],0],
 ["Anda bersin. Anda berkata...|You sneeze. You say...",["Alhamdulillah|Alhamdulillah","Aduh|Ouch","Tiada|Nothing"],0],
 ["Kawan sedih. Anda...|A friend is sad. You...",["Menghiburkan dan menemani|Comfort and stay with them","Mengejek|Tease","Pergi|Walk away"],0],
 ["Kasut anda semasa masuk rumah orang...|Your shoes when you enter someone's home...",["Tanggal di pintu|Take them off at the door","Pakai sahaja|Keep them on","Campak ke tepi|Throw them aside"],0]
];
BANK.manners = [
 ["Di meja makan, anda menunggu...|At the table, you wait for...",["Orang tua mula dahulu|The elders to begin","Makan sebelum semua orang|Eating before everyone","Mengambil semua lauk|Taking all the food"],0],
 ["Mulut penuh makanan. Anda...|Your mouth is full. You...",["Kunyah dahulu, kemudian bercakap|Chew first, then speak","Bercakap sambil makan|Talk while eating","Ketawa kuat|Laugh loudly"],0],
 ["Anda tiba di rumah kawan. Anda...|You arrive at a friend's house. You...",["Beri salam dan tunggu dijemput|Give salam and wait to be invited","Terus masuk|Walk straight in","Jerit dari jauh|Shout from far away"],0],
 ["Selepas makan, anda...|After eating, you...",["Ucap Alhamdulillah dan bawa pinggan ke sinki|Say Alhamdulillah and take your plate to the sink","Tinggalkan pinggan|Leave the plate","Terus bermain|Go straight to play"],0],
 ["Hendak pulang dari rumah orang, anda...|Leaving someone's home, you...",["Ucap terima kasih dan salam|Say thank you and salam","Pergi senyap-senyap|Slip away quietly","Menyuruh tuan rumah cepat|Hurry the host"],0],
 ["Makanan tidak sedap. Anda...|The food is not to your taste. You...",["Tidak mengutuk dan berterima kasih|Do not complain, and say thank you","Menolak dengan kasar|Refuse rudely","Membuang di lantai|Throw it on the floor"],0]
];
BANK.healthy = [
 ["Mana yang lebih sihat?|Which is healthier?",["Epal|An apple","Gula-gula|Candy"],0],
 ["Mana yang lebih sihat?|Which is healthier?",["Air kosong|Plain water","Minuman bergas manis|Sweet fizzy drink"],0],
 ["Mana yang lebih sihat?|Which is healthier?",["Sayur-sayuran|Vegetables","Kerepek berminyak|Oily chips"],0],
 ["Mana yang lebih sihat?|Which is healthier?",["Pisang|A banana","Coklat bar besar|A big chocolate bar"],0],
 ["Mana yang lebih sihat?|Which is healthier?",["Nasi dengan ikan dan sayur|Rice with fish and vegetables","Mi segera setiap hari|Instant noodles every day"],0],
 ["Berapa kali sehari makan buah dan sayur?|How often should you eat fruit and vegetables?",["Setiap hari|Every day","Sekali setahun|Once a year","Tidak perlu|Never"],0]
];
BANK.road = [
 ["Lampu isyarat merah bermakna...|A red light means...",["Berhenti|Stop","Jalan|Go","Pecut|Speed up"],0],
 ["Di mana kita menyeberang jalan?|Where do you cross the road?",["Di lintasan pejalan kaki|At a crossing","Di mana-mana|Anywhere","Di bawah kereta|Under a car"],0],
 ["Sebelum menyeberang, kita...|Before crossing, you...",["Tengok kiri dan kanan|Look left and right","Tutup mata|Close your eyes","Berlari|Run"],0],
 ["Dalam kereta, kita pakai...|In a car you wear...",["Tali pinggang keledar|A seatbelt","Topi|A hat","Kasut besar|Big boots"],0],
 ["Menunggang basikal, kita pakai...|When cycling you wear...",["Topi keledar|A helmet","Cermin mata hitam sahaja|Only sunglasses","Tiada apa|Nothing"],0],
 ["Lampu isyarat hijau bermakna...|A green light means...",["Kereta boleh jalan, tunggu isyarat anda|Cars may go, wait for your signal","Semua berhenti|Everyone stops","Berlari ke jalan|Run onto the road"],0]
];
BANK.riddle = [
 ["Apa yang naik tetapi tidak pernah turun?|What goes up but never comes down?",["Umur|Your age","Belon|A balloon","Asap|Smoke"],0],
 ["Ada empat kaki tetapi tidak boleh berjalan. Apa dia?|It has four legs but cannot walk. What is it?",["Meja|A table","Kucing|A cat","Ayam|A chicken"],0],
 ["Makin dibasuh makin basah. Apa dia?|The more it dries, the wetter it gets. What is it?",["Tuala|A towel","Kain buruk|A rag","Sabun|Soap"],0],
 ["Ada leher tetapi tiada kepala. Apa dia?|It has a neck but no head. What is it?",["Botol|A bottle","Baju|A shirt","Pokok|A tree"],0],
 ["Ada gigi tetapi tidak menggigit. Apa dia?|It has teeth but does not bite. What is it?",["Sikat|A comb","Singa|A lion","Kuda|A horse"],0],
 ["Apa yang basah semasa dipakai untuk mengeringkan?|What gets wetter the more it dries?",["Tuala|A towel","Pasir|Sand","Batu|A stone"],0],
 ["Saya ada banyak muka surat tetapi bukan pokok. Apa saya?|I have many pages but I am not a tree. What am I?",["Buku|A book","Pintu|A door","Kerusi|A chair"],0],
 ["Apa yang ada jarum tetapi tidak menjahit?|What has hands but cannot clap?",["Jam|A clock","Beg|A bag","Kasut|A shoe"],0]
];
// tip banks: [title, body, optional arabic]
BANK.sunnah = [
 ["Memberi salam|Give salam","Ucapkan Assalamualaikum apabila bertemu orang.|Say Assalamualaikum when you meet someone."],
 ["Bismillah sebelum makan|Bismillah before eating","Baca Bismillah dan makan dengan tangan kanan.|Say Bismillah and eat with your right hand."],
 ["Gosok gigi dengan siwak|Clean your teeth","Menjaga kebersihan mulut adalah sunnah.|Keeping your mouth clean is sunnah."],
 ["Senyum itu sedekah|A smile is charity","Senyum kepada ibu, ayah dan kawan hari ini.|Smile at your mum, dad and friends today."],
 ["Masuk masjid dengan kaki kanan|Enter the masjid with the right foot","Keluar dengan kaki kiri.|Leave with the left foot."],
 ["Tidur mengiring ke kanan|Sleep on your right side","Baca doa tidur sebelum lelap.|Say the sleeping dua before you sleep."],
 ["Alhamdulillah apabila bersin|Alhamdulillah when you sneeze","Orang yang mendengar menjawab Yarhamukallah.|The listener replies Yarhamukallah."],
 ["Menziarahi orang sakit|Visit the sick","Doakan mereka cepat sembuh.|Pray for them to get well soon."],
 ["Berbuat baik kepada jiran|Be kind to your neighbours","Beri salam atau kongsi sedikit makanan.|Greet them or share a little food."],
 ["Ucap Jazakallahu khairan|Say Jazakallahu khairan","Apabila seseorang membantu anda.|When someone helps you."],
 ["Solat sunat sebelum Subuh|Two sunnah rakaat before Subuh","Dua rakaat yang ringan tetapi besar ganjarannya.|Two light rakaat with a great reward."],
 ["Baca Ayat Kursi sebelum tidur|Read Ayat Kursi before sleep","Minta ibu atau ayah ajar bersama.|Ask mum or dad to read it with you."],
 ["Menolong kerja rumah|Help at home","Nabi ﷺ membantu keluarganya di rumah.|The Prophet ﷺ helped his family at home."],
 ["Berkata benar|Tell the truth","Kejujuran membawa kepada kebaikan.|Honesty leads to goodness."]
];
BANK.arabic = [
 ["الْكِتَابُ","Buku|Book"],["الْقَلَمُ","Pen|Pen"],["الْمَسْجِدُ","Masjid|Mosque"],["الْمَاءُ","Air|Water"],["الشَّمْسُ","Matahari|Sun"],["الْقَمَرُ","Bulan|Moon"],
 ["بَيْتٌ","Rumah|House"],["شَجَرَةٌ","Pokok|Tree"],["بَابٌ","Pintu|Door"],["خُبْزٌ","Roti|Bread"],["تُفَّاحٌ","Epal|Apple"],["سَمَاءٌ","Langit|Sky"],["أُمٌّ","Ibu|Mother"],["أَبٌ","Ayah|Father"]
];
BANK.didyou = [
 ["Matahari ialah bintang|The Sun is a star","Ia kelihatan besar kerana paling dekat dengan kita.|It looks big because it is the closest star to us."],
 ["Bulan tidak mempunyai cahaya sendiri|The Moon has no light of its own","Kita nampak cahaya Matahari yang dipantulkan olehnya.|We see sunlight bouncing off it."],
 ["Pelangi muncul dari cahaya dan titis hujan|Rainbows come from light and raindrops","Cahaya putih terpisah kepada banyak warna.|White light splits into many colours."],
 ["Tumbuhan membuat makanan daripada cahaya|Plants make food from light","Itu dipanggil fotosintesis.|This is called photosynthesis."],
 ["Sepanjang 70% bumi ialah air|About 70% of Earth is water","Jagalah air, jangan membazir.|Look after water and do not waste it."],
 ["Sotong kurita mempunyai tiga jantung|An octopus has three hearts","Dua untuk insang, satu untuk badan.|Two for the gills, one for the body."],
 ["Jantung anda berdegup kira-kira 100,000 kali sehari|Your heart beats about 100,000 times a day","Ia bekerja tanpa rehat.|It works without a rest."],
 ["Semut boleh mengangkat benda yang jauh lebih berat daripada dirinya|Ants can carry far more than their own weight","Bekerja bersama menjadikan kita kuat.|Working together makes us strong."],
 ["Satu hari ialah masa bumi berputar sekali|A day is one spin of the Earth","Itulah sebab ada siang dan malam.|That is why we have day and night."],
 ["Lebah membuat madu|Bees make honey","Mereka bekerja dalam pasukan yang besar.|They work in big teams."]
];
BANK.homesci = [
 ["Pelangi dalam gelas|Rainbow in a glass","Letakkan gelas berisi air di tepi tingkap yang cerah, dengan kertas putih di bawahnya. Lihat warna!|Put a glass of water by a sunny window with white paper below. Look for colours!"],
 ["Telur terapung|The floating egg","Masukkan telur ke dalam air biasa: tenggelam. Tambah banyak garam: telur terapung! Minta orang dewasa membantu.|An egg sinks in plain water. Add lots of salt and it floats! Ask a grown-up to help."],
 ["Belon melekat pada dinding|A sticky balloon","Gosok belon pada rambut kering, kemudian letakkan pada dinding. Itu elektrik statik.|Rub a balloon on dry hair and stick it on a wall. That is static electricity."],
 ["Gunung berapi baking soda|Baking-soda volcano","Dengan orang dewasa: tuang cuka ke atas sedikit baking soda dalam dulang.|With a grown-up: pour vinegar onto a little baking soda in a tray."],
 ["Biji kacang dalam beg|Beans in a bag","Letak biji kacang pada kapas lembap dalam beg lutsinar. Tengok akarnya tumbuh setiap hari.|Put a bean on damp cotton in a clear bag. Watch the roots grow each day."],
 ["Tenggelam atau terapung?|Sink or float?","Cuba pelbagai benda dalam besen air. Ramalkan dahulu, kemudian periksa.|Try different things in a bowl of water. Guess first, then check."]
];
BANK.bedtime = [
 ["Semut dan belalang|The ant and the grasshopper","Semut bekerja keras mengumpul makanan. Belalang hanya bermain. Apabila musim sejuk tiba, belalang lapar, tetapi semut berkongsi sedikit makanan. Belalang belajar bekerja keras dan berterima kasih.|The ant worked hard to store food. The grasshopper only played. When winter came the grasshopper was hungry, but the ant shared a little food. The grasshopper learned to work hard and say thank you."],
 ["Bintang kecil yang jujur|The honest little star","Ada bintang kecil yang tersilap menjatuhkan sebiji awan. Dia malu, tetapi dia berkata benar. Bulan tersenyum dan berkata, 'Kejujuran lebih bersinar daripada cahaya.' Bintang itu tidur lena malam itu.|A little star accidentally knocked down a cloud. She felt shy, but she told the truth. The moon smiled and said, 'Honesty shines brighter than light.' The little star slept well that night."],
 ["Pokok kurma yang sabar|The patient date palm","Sebatang pokok kurma kecil mahu cepat besar. Ibu pokok berkata, 'Sabar, siram, dan tunggu.' Bertahun-tahun kemudian, pokok itu penuh dengan kurma manis untuk semua orang.|A small date palm wanted to grow up fast. The mother palm said, 'Be patient, drink, and wait.' Years later the little palm was full of sweet dates for everyone."]
];
BANK.pillars = [
 ["Rukun Islam 1: Syahadah|Pillar 1: Shahadah","Mengaku tiada tuhan selain Allah dan Nabi Muhammad ﷺ utusan Allah.|Saying there is no god but Allah and Muhammad ﷺ is His messenger."],
 ["Rukun Islam 2: Solat|Pillar 2: Salah","Solat lima waktu setiap hari.|Praying five times every day."],
 ["Rukun Islam 3: Zakat|Pillar 3: Zakat","Memberi sebahagian harta kepada yang berhak.|Giving part of our wealth to those in need."],
 ["Rukun Islam 4: Puasa|Pillar 4: Fasting","Berpuasa pada bulan Ramadan.|Fasting in the month of Ramadan."],
 ["Rukun Islam 5: Haji|Pillar 5: Hajj","Pergi ke Makkah jika mampu.|Going to Makkah if able."],
 ["Rukun Iman: percaya kepada Allah|Faith: believe in Allah","Allah itu Esa dan Pencipta segala-galanya.|Allah is One and the Creator of everything."],
 ["Rukun Iman: Malaikat, Kitab, Rasul|Faith: Angels, Books, Messengers","Kita percaya kepada malaikat, kitab-kitab dan para rasul.|We believe in the angels, the books and the messengers."],
 ["Rukun Iman: Hari Akhirat dan Qada dan Qadar|Faith: the Last Day and Destiny","Kita percaya kepada hari akhirat dan ketentuan Allah.|We believe in the Last Day and in Allah's decree."]
];
BANK.recipes = [
 ["Smoothi pisang dan susu|Banana milk smoothie","Dengan orang dewasa: kisar 1 pisang, 1 cawan susu dan beberapa ketul ais. Bismillah dan nikmati!|With a grown-up: blend 1 banana, 1 cup milk and a few ice cubes. Bismillah and enjoy!"],
 ["Roti sapu kaya sihat|Fruity toast","Sapu sedikit mentega kacang atau kaya pada roti, tambah hirisan pisang atau strawberi.|Spread a little peanut butter or kaya on toast and add banana or strawberry slices."],
 ["Salad buah warna-warni|Rainbow fruit salad","Potong buah-buahan pelbagai warna dengan orang dewasa dan campurkan dalam mangkuk.|Cut fruit of many colours with a grown-up and mix in a bowl."],
 ["Telur rebus|Boiled egg","Orang dewasa merebus telur 10 minit. Anda boleh mengupas kulitnya dan makan dengan sedikit garam.|A grown-up boils the egg for 10 minutes. You peel it and eat it with a pinch of salt."]
];
// moves: guided exercise steps [text, seconds]
BANK.moves = [
 ["Regangkan tangan ke atas|Reach your arms up high",20],["Lompat di tempat|Jump on the spot",20],["Putar bahu ke belakang|Roll your shoulders back",20],["Duduk dan bangun (skuat)|Sit down and stand up (squats)",20],["Berdiri atas satu kaki|Balance on one foot",20],["Tarik nafas dalam-dalam|Take deep breaths",20]
];
BANK.feel = [
 ["😊","Gembira|Happy","Bagus! Kongsi kegembiraan anda dengan seseorang.|Great! Share your happiness with someone."],
 ["😐","Biasa sahaja|Okay","Tidak mengapa. Minum air dan bergerak sedikit.|That is fine. Drink water and move a little."],
 ["😢","Sedih|Sad","Tarik nafas dalam-dalam dan peluk ibu atau ayah. Anda boleh berdoa: Ya Allah, tenangkan hatiku.|Take deep breaths and hug mum or dad. You can pray: O Allah, calm my heart."],
 ["😠","Marah|Angry","Berhenti, tarik nafas, dan hitung hingga 10. Nabi ﷺ mengajar kita menahan marah.|Stop, breathe and count to 10. The Prophet ﷺ taught us to control anger."],
 ["😨","Takut|Scared","Anda selamat. Cakap dengan orang dewasa dan baca doa.|You are safe. Talk to a grown-up and say a dua."],
 ["😴","Penat|Tired","Berehat sebentar dan minum air.|Rest a little and drink water."]
];
BANK.stickers = ["⭐","🌙","🕌","🌴","🐪","🌸","🌈","🦋","🍎","🚀","🎈","🏅","💎","🌟","🐢","🎨"];
BANK.badges = [
 ["🌱","Bermula|First steps",1],["⭐","Bintang pertama|Ten stars",10],["🏅","Pelajar rajin|Busy learner",25],["🕌","Sahabat masjid|Masjid friend",40],["🌟","Bintang bersinar|Shining star",60],["👑","Juara planet|Planet champion",100]
];
BANK.goals = [
 ["Buat 5 aktiviti minggu ini|Finish 5 activities this week",5],["Buat 10 aktiviti minggu ini|Finish 10 activities this week",10],["Lawat 3 rumah berbeza|Visit 3 different houses",3],["Baca doa 3 hari|Do the dua 3 days",3]
];
K.BIOMES = BIOMES; K.HOUSES = HOUSES; K.TOWER = TOWER; K.PARENT = PARENT; K.BANK = BANK;
K.ALL = []; HOUSES.forEach(function(h){ h.acts.forEach(function(a){ a.house = h.id; K.ALL.push(a); }); });
})();
