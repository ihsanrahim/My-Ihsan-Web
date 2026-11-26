/* My Ihsan 0.7.68 · Kids Planet, ideas 91-190 (owner: "Do all"): 13 more buildings across the four areas, extra activities for the
   Observatory and the Sports Park, and their content banks. Loaded after kw_data.js. Strings are "Bahasa Melayu|English" (one "|" only).
   New activity types (kw_play.js): sort (two boxes), count, dig, target (tap the moving thing), note (a card to send). Hadith and duas are
   pending ustaz review like the rest of the app. */
(function(){
var K = window.KW = window.KW || {}, BANK = K.BANK;
var NEW = [
 // ---------------- City ----------------
 {id:"lib", b:"lib", biome:"city", e:-0.52, n:0.32, col:"#8a5a2b", roof:"#5c3b0b", n1:"Perpustakaan|Library", ic:"📚", acts:[
   {id:"b_week", i:91, t:"tip", bank:"books", ic:"📕", n:"Buku minggu ini|Book of the week"},
   {id:"b_log",  i:92, t:"counter", key:"pages", unit:"×10 ms", goal:5, step:1, ic:"📖", n:"Log bacaan: bintang setiap 10 muka surat|Reading log: a star every 10 pages"},
   {id:"b_aloud",i:93, t:"timer", secs:60, ic:"🗣️", n:"Cabaran baca kuat 1 minit|1-minute read-aloud challenge"},
   {id:"b_jawi", i:94, t:"tip", bank:"jawi", daily:1, ic:"✒️", n:"Perkataan Jawi hari ini|Jawi word of the day"},
   {id:"b_card", i:95, t:"diary", key:"books", stk:["📕","📗","📘","📙","⭐","🏅"], q:"Buku apa yang anda habis baca?|Which book did you finish?", ph:"Tajuk buku…|Book title…", ic:"🎫", n:"Cop kad perpustakaan|Library card stamps"},
   {id:"b_guess",i:96, t:"quiz", bank:"guessbook", ic:"🔍", n:"Teka buku daripada petunjuk|Guess the book from clues"},
   {id:"b_sci",  i:97, t:"tip", bank:"scientists", ic:"🔬", n:"Kad saintis Muslim|Muslim scientist cards"},
   {id:"b_mini", i:98, t:"draw", q:"Lukis kulit buku kecil anda|Draw the cover of your mini book", ic:"📓", n:"Buat buku mini|Make a mini book"}
 ]},
 {id:"fire", b:"fire", biome:"city", e:0.42, n:0.34, col:"#e03131", roof:"#a61e1e", n1:"Balai Bomba|Fire & Rescue Station", ic:"🚒", acts:[
   {id:"f_999",  i:99,  t:"quiz", bank:"call999", ic:"☎️", n:"Permainan telefon 999|Call 999 game"},
   {id:"f_plan", i:100, t:"check", key:"escape", ic:"🚪", n:"Pelan keluar rumah jika kebakaran|Fire escape plan for my house", items:["Saya tahu 2 jalan keluar dari bilik saya|I know 2 ways out of my room","Kami pilih tempat berkumpul di luar|We chose a meeting place outside","Saya tahu jangan ambil barang, terus keluar|I know to leave things and just get out","Saya merangkak rendah jika ada asap|I crawl low if there is smoke","Saya rasa pintu dahulu, jika panas jangan buka|I feel the door first; if it is hot, do not open it","Kami latih bersama keluarga|We practised it as a family"]},
   {id:"f_stop", i:101, t:"moves", bank:"stopdrop", ic:"🧯", n:"Berhenti, jatuh dan berguling|Stop, drop and roll"},
   {id:"f_safe", i:102, t:"sort", bank:"safe", ic:"⚠️", n:"Selamat atau tidak?|Safe or not safe?"},
   {id:"f_str",  i:103, t:"quiz", bank:"stranger", ic:"🙅", n:"Keselamatan orang asing|Stranger safety"},
   {id:"f_lost", i:104, t:"quiz", bank:"lost", ic:"🏬", n:"Sesat di pusat beli-belah|Lost in a mall"},
   {id:"f_addr", i:105, t:"check", key:"addr", ic:"🏠", n:"Alamat dan nombor telefon ibu bapa|My address and a parent's phone", items:["Saya boleh sebut nama penuh saya|I can say my full name","Saya boleh sebut nama penuh ibu atau ayah|I can say Ummi's or Ayah's full name","Saya boleh sebut alamat rumah|I can say my home address","Saya hafal satu nombor telefon ibu bapa|I know one parent's phone number by heart","Saya tahu nombor 999|I know the number 999"]},
   {id:"f_flood",i:106, t:"quiz", bank:"flood", ic:"🌊", n:"Latihan banjir|Flood drill"}
 ]},
 {id:"pasar", b:"pasar", biome:"city", e:-0.04, n:-0.2, col:"#fab005", roof:"#e8697d", n1:"Pasar|Market", ic:"🛒", acts:[
   {id:"k_weigh",i:107, t:"quiz", bank:"weigh", ic:"⚖️", n:"Timbang dan kira harga buah|Weigh and price the fruit"},
   {id:"k_halal",i:108, t:"quiz", bank:"halallogo", ic:"✅", n:"Cari logo halal|Halal logo spotter"},
   {id:"k_list", i:109, t:"quiz", bank:"shoplist", ic:"📝", n:"Senarai belanja daripada resipi|Shopping list from a recipe"},
   {id:"k_change",i:110,t:"quiz", bank:"change", ic:"🪙", n:"Kira baki duit|Count the change"},
   {id:"k_need", i:111, t:"sort", bank:"needs", ic:"🤔", n:"Keperluan atau kehendak?|Needs or wants?"},
   {id:"k_sadaqah",i:112,t:"counter", key:"sadaqah", keep:1, unit:"RM", goal:5, step:1, ic:"🤲", n:"Tabung sedekah|Sadaqah jar"},
   {id:"k_fruit",i:113, t:"tip", bank:"fruits", ic:"🥭", n:"Kad buah-buahan Malaysia|Malaysian fruit cards"},
   {id:"k_stall",i:114, t:"quiz", bank:"stall", ic:"🧺", n:"Gerai pura-pura: kira untung|Pretend stall: work out the profit"}
 ]},
 {id:"clinic", b:"clinic", biome:"city", e:0, n:0.5, col:"#12b886", roof:"#63e6be", n1:"Klinik|Clinic", ic:"🏥", acts:[
   {id:"c_body", i:115, t:"quiz", bank:"body", ic:"🖐️", n:"Anggota badan: BM, Inggeris, Arab|Body parts in BM, English and Arabic"},
   {id:"c_wash", i:116, t:"timer", secs:20, ic:"🧼", n:"Basuh tangan 20 saat|20-second hand-wash"},
   {id:"c_doc",  i:117, t:"tip", bank:"doctor", ic:"🩺", n:"Cerita pergi ke doktor|Going to the doctor story"},
   {id:"c_grow", i:118, t:"diary", key:"growth", stk:["📏","⚖️","🌱","⭐"], q:"Ukur tinggi anda dengan ibu bapa|Measure your height with a parent", ph:"cth. 112 cm, 19 kg|e.g. 112 cm, 19 kg", ic:"📏", n:"Carta tumbesaran saya|My growth chart"},
   {id:"c_sense",i:119, t:"quiz", bank:"senses", ic:"👀", n:"Permainan lima deria|Five senses game"},
   {id:"c_doa",  i:120, t:"tip", bank:"sickdoa", ic:"🤲", n:"Doa ketika sakit dan melawat orang sakit|Dua when sick and visiting the sick"}
 ]},
 // ---------------- Desert ----------------
 {id:"oasis", b:"oasis", biome:"desert", e:-0.56, n:-0.44, col:"#4dabf7", roof:"#2f9e44", n1:"Telaga Oasis|Oasis Well", ic:"🌴", acts:[
   {id:"o_cycle",i:121, t:"tip", bank:"watercycle", ic:"🌧️", n:"Kitaran air|The water cycle"},
   {id:"o_save", i:122, t:"check", key:"savewater", ic:"🚰", n:"Cabaran jimat air|Save-water challenge", items:["Tutup paip semasa memberus gigi|Tap off while brushing teeth","Mandi cepat|A quick shower","Tadah air basuh sayur untuk siram pokok|Use veg-washing water for plants","Beritahu jika ada paip bocor|Tell a grown-up about a leaking tap","Minum air habis, jangan buang|Finish my water, do not pour it away"]},
   {id:"o_zam",  i:123, t:"tip", bank:"zamzam", ic:"💧", n:"Kisah air Zamzam|The Zamzam story"},
   {id:"o_palm", i:124, t:"tip", bank:"datepalm", ic:"🌴", n:"Kitaran hidup pokok kurma|Date palm life cycle"},
   {id:"o_ani",  i:125, t:"quiz", bank:"desertani", ic:"🦂", n:"Kuiz haiwan padang pasir|Desert animals quiz"},
   {id:"o_wudu", i:126, t:"check", key:"wuducup", ic:"🫗", n:"Wuduk dengan secawan air|Wudu with one cup", items:["Saya buka paip kecil sahaja|I open the tap just a little","Saya tutup paip ketika menyapu kepala|I turn the tap off while wiping my head","Saya basuh 3 kali sahaja, tidak lebih|I wash 3 times only, not more","Rasulullah ﷺ berwuduk dengan satu mud (lebih kurang secawan besar)|The Prophet ﷺ made wudu with one mudd (about one big cup)"]},
   {id:"o_dates",i:127, t:"quiz", bank:"dates", ic:"🟤", n:"Sunnah kurma: nombor ganjil|Sunnah of dates: odd numbers"}
 ]},
 {id:"caravan", b:"caravan", biome:"desert", e:-0.66, n:0.26, col:"#f08c00", roof:"#ffe8cc", n1:"Hentian Kafilah|Caravan Stop", ic:"🐪", acts:[
   {id:"r_pack", i:128, t:"sort", bank:"pack", ic:"🎒", n:"Kemas kafilah: bawa atau tinggal?|Pack the caravan: bring or leave?"},
   {id:"r_doa",  i:129, t:"tip", bank:"traveldoa", ic:"🤲", n:"Doa menaiki kenderaan|Travel dua"},
   {id:"r_hello",i:130, t:"tip", bank:"hello", ic:"👋", n:"Helo dalam 10 bahasa|Hello in 10 languages"},
   {id:"r_comp", i:131, t:"quiz", bank:"compass", ic:"🧭", n:"Permainan arah kompas|Compass directions game"},
   {id:"r_battuta",i:132,t:"tip", bank:"battuta", ic:"🗺️", n:"Jejak perjalanan Ibn Battuta|Ibn Battuta's journey"},
   {id:"r_trade",i:133, t:"quiz", bank:"trade", ic:"🧂", n:"Laluan dagang|Trade routes"},
   {id:"r_post", i:134, t:"draw", q:"Lukis poskad dari negara kegemaran anda|Draw a postcard from a country you like", ic:"🖼️", n:"Poskad dari sebuah negara|Postcard from a country"}
 ]},
 {id:"fossil", b:"fossil", biome:"desert", e:0, n:-0.72, col:"#e0b46a", roof:"#c9973f", n1:"Tapak Fosil|Fossil Dig", ic:"🦴", acts:[
   {id:"d_dig",  i:135, t:"dig", ic:"⛏️", n:"Gali dan berus fosil|Dig and brush the fossils"},
   {id:"d_anc",  i:136, t:"tip", bank:"ancient", ic:"🦕", n:"Kad haiwan purba|Ancient animal cards"},
   {id:"d_rock", i:137, t:"quiz", bank:"rocks", ic:"🪨", n:"Jenis batuan|Rock types"},
   {id:"d_sand", i:138, t:"draw", sym:6, q:"Lukis, corak akan berulang|Draw, and the pattern repeats", ic:"🏜️", n:"Corak seni pasir|Sand art patterns"},
   {id:"d_place",i:139, t:"tip", bank:"quranplaces", ic:"📍", n:"Jejak tempat dalam al-Quran|Places in the Quran trail"},
   {id:"d_star", i:140, t:"draw", sym:8, q:"Lukis satu garisan, bintang 8 penjuru terbina|Draw one line and an 8-point star appears", ic:"✴️", n:"Pembuat bintang geometri Islam|Islamic geometric star maker"},
   {id:"d_wait", i:141, t:"timer", secs:60, ic:"⏳", n:"Jam pasir: sabar 1 minit|Sand timer: wait patiently 1 minute"}
 ]},
 // ---------------- Forest ----------------
 {id:"lab", b:"lab", biome:"forest", e:0.7, n:0.1, col:"#74c0fc", roof:"#1c7ed6", n1:"Makmal Rumah Pokok|Treehouse Lab", ic:"🧪", acts:[
   {id:"x_float",i:146, t:"sort", bank:"floatsink", ic:"🛟", n:"Terapung atau tenggelam?|Float or sink?"},
   {id:"x_mag",  i:147, t:"sort", bank:"magnet", ic:"🧲", n:"Permainan magnet|Magnet game"},
   {id:"x_leaf", i:148, t:"tip", bank:"leaves", ic:"🍃", n:"Gosok daun dan kenali daun|Leaf rubbing and leaf ID"},
   {id:"x_bug",  i:149, t:"check", key:"bugs", ic:"🐞", n:"Senarai memburu serangga|Bug hunt checklist", items:["🐜 Semut|An ant","🐞 Kumbang kura-kura|A ladybird","🦋 Rama-rama|A butterfly","🐌 Siput|A snail","🕷️ Labah-labah (lihat sahaja!)|A spider (just look!)","🪱 Cacing|A worm"]},
   {id:"x_shadow",i:150,t:"quiz", bank:"shadowq", ic:"🔦", n:"Cahaya dan bayang-bayang|Light and shadow"},
   {id:"x_rain", i:151, t:"tip", bank:"rainbowexp", ic:"🌈", n:"Pelangi dalam gelas|Rainbow in a glass"},
   {id:"x_volc", i:152, t:"tip", bank:"volcano", ic:"🌋", n:"Gunung berapi soda penaik (dengan ibu bapa)|Baking-soda volcano (with a parent)"},
   {id:"x_why",  i:153, t:"tip", bank:"why", daily:1, ic:"❔", n:"Soalan “kenapa” hari ini|Why question of the day"}
 ]},
 {id:"ranger", b:"ranger", biome:"forest", e:-0.42, n:-0.58, col:"#2b8a3e", roof:"#8b5a2b", n1:"Pondok Renjer|Ranger Hut", ic:"🦧", acts:[
   {id:"y_my",   i:154, t:"tip", bank:"myani", ic:"🦧", n:"Haiwan Malaysia|Malaysian animals"},
   {id:"y_sound",i:155, t:"quiz", bank:"sounds", ic:"🔊", n:"Padankan bunyi haiwan|Animal sounds match"},
   {id:"y_kind", i:156, t:"tip", bank:"kindani", ic:"🐈", n:"Berbuat baik kepada haiwan|Kindness to animals"},
   {id:"y_track",i:157, t:"quiz", bank:"tracks", ic:"🐾", n:"Jejak tapak kaki|Footprint tracking"},
   {id:"y_quran",i:158, t:"quiz", bank:"quranani", ic:"🐜", n:"Haiwan dalam al-Quran|Animals in the Quran"},
   {id:"y_tree", i:159, t:"check", key:"treepledge", ic:"🌳", n:"Ikrar tanam pokok|Plant-a-tree pledge", items:["Saya tanam satu biji benih atau anak pokok|I planted a seed or a seedling","Saya siram pokok hari ini|I watered a plant today","Saya tidak patahkan dahan atau petik bunga sesuka hati|I did not snap branches or pick flowers for fun","Saya ingat: menanam pokok ialah sedekah jariah|I remember: planting a tree is ongoing charity"]},
   {id:"y_recy", i:160, t:"sort", bank:"recycle", ic:"♻️", n:"Asingkan sampah kitar semula|Rubbish sorting and recycling"},
   {id:"y_save", i:161, t:"quiz", bank:"endangered", ic:"🐯", n:"Selamatkan haiwan terancam|Endangered animal rescue"}
 ]},
 {id:"river", b:"river", biome:"forest", e:0.4, n:0.58, col:"#339af0", roof:"#868e96", n1:"Sungai & Air Terjun|River & Waterfall", ic:"🏞️", acts:[
   {id:"w_swim", i:162, t:"quiz", bank:"swim", ic:"🏊", n:"Peraturan keselamatan berenang|Swimming safety rules"},
   {id:"w_fish", i:163, t:"count", things:["🐟","🐠"], q:"Berapa ikan?|How many fish?", ic:"🐟", n:"Kira ikan|Count the fish"},
   {id:"w_raft", i:164, t:"quiz", bank:"raft", ic:"🛶", n:"Bina rakit|Build a raft"},
   {id:"w_clean",i:165, t:"sort", bank:"riverclean", ic:"🧤", n:"Bersihkan sungai|River clean-up"},
   {id:"w_boat", i:166, t:"tip", bank:"boatfold", ic:"⛵", n:"Lipat bot kertas|Fold a paper boat"},
   {id:"w_yunus",i:167, t:"tip", bank:"yunus", ic:"🐋", n:"Nabi Yunus dan ikan paus|Prophet Yunus and the whale"}
 ]},
 // ---------------- Garden ----------------
 {id:"farm", b:"farm", biome:"garden", e:0.18, n:0.68, col:"#c92a2a", roof:"#862e2e", n1:"Ladang & Bangsal|Farm & Barn", ic:"🐄", acts:[
   {id:"z_feed", i:174, t:"check", key:"feed", ic:"🌾", n:"Jadual memberi makan|Feeding schedule", items:["🐄 Lembu: rumput dan air pagi|Cow: grass and water in the morning","🐐 Kambing: daun dan air|Goat: leaves and water","🐔 Ayam: bijirin dan air|Chickens: grain and water","🐈 Kucing: makanan dan air bersih|Cat: food and clean water","Basuh tangan selepas memberi makan|Wash hands after feeding"]},
   {id:"z_eggs", i:175, t:"count", things:["🥚"], q:"Berapa biji telur dalam bakul?|How many eggs in the basket?", ic:"🥚", n:"Kutip dan kira telur|Collect and count the eggs"},
   {id:"z_from", i:176, t:"quiz", bank:"foodfrom", ic:"🥛", n:"Dari mana makanan datang?|Where food comes from"},
   {id:"z_qurban",i:177,t:"tip", bank:"qurban", ic:"🐑", n:"Korban diterangkan dengan lembut|Qurban explained gently"},
   {id:"z_baby", i:178, t:"quiz", bank:"babies", ic:"🐣", n:"Padankan haiwan dengan anaknya|Match each animal with its baby"},
   {id:"z_harv", i:179, t:"tip", bank:"harvest", ic:"🧺", n:"Kalendar menuai|Harvest calendar"}
 ]},
 {id:"bee", b:"bee", biome:"garden", e:0.52, n:-0.48, col:"#f2b632", roof:"#5c3b0b", n1:"Rumah Lebah|Bee House", ic:"🐝", acts:[
   {id:"e_life", i:180, t:"tip", bank:"bee", ic:"🍯", n:"Kehidupan lebah (Surah an-Nahl)|Honeybee life (Surah An-Nahl)"},
   {id:"e_hex",  i:181, t:"quiz", bank:"hex", ic:"⬡", n:"Teka-teki heksagon|Hexagon puzzle"},
   {id:"e_pol",  i:182, t:"target", hit:"🌸", goal:10, q:"Bantu lebah: ketik bunga untuk mendebunga|Help the bee: tap the flowers to pollinate", ic:"🌼", n:"Permainan mendebunga|Pollinate the flowers"},
   {id:"e_flow", i:183, t:"quiz", bank:"flowers", ic:"🌺", n:"Nama bunga dalam BM dan Inggeris|Flower names in BM and English"}
 ]},
 {id:"post", b:"post", biome:"garden", e:-0.32, n:0.64, col:"#1971c2", roof:"#74c0fc", n1:"Pejabat Pos Kebaikan|Kindness Post Office", ic:"📮", acts:[
   {id:"q_thank",i:184, t:"note", to:"Ummi dan Ayah|Ummi and Ayah", start:"Terima kasih kerana…|Thank you for…", ic:"💌", n:"Nota terima kasih untuk Ummi dan Ayah|Thank-you note to Ummi and Ayah"},
   {id:"q_salam",i:185, t:"note", to:"Tok, Nenek, Atuk…|Grandma, Grandpa…", start:"Assalamualaikum! Saya rindu…|Assalamualaikum! I miss…", stk:["🌸","🤲","🌙","💐","☕"], ic:"✉️", n:"Kad salam untuk datuk nenek|Salam card to grandparents"},
   {id:"q_deed", i:186, t:"diary", key:"deeds", stk:["🤝","😊","🧹","🍲","🤲","💐"], q:"Apa kebaikan anda hari ini?|What good deed did you do today?", ph:"cth. Saya tolong adik pakai kasut|e.g. I helped my little brother with his shoes", ic:"🌟", n:"Kebaikan hari ini|Good deed of the day"},
   {id:"q_secret",i:187,t:"tip", bank:"secret", daily:1, ic:"🕵️", n:"Misi pembantu rahsia|Secret helper mission"},
   {id:"q_sorry",i:188, t:"tip", bank:"sorry", ic:"🫂", n:"Minta maaf dan memaafkan|Saying sorry and forgiving"},
   {id:"q_grand",i:189, t:"check", key:"grand", ic:"👵", n:"Telefon atau lawat datuk nenek|Call or visit grandparents", items:["Saya beri salam kepada datuk nenek|I gave salam to my grandparents","Saya bercerita tentang hari saya|I told them about my day","Saya bertanya khabar kesihatan mereka|I asked how they are feeling","Saya doakan mereka|I made dua for them"]},
   {id:"q_nb",   i:190, t:"check", key:"neighbour", ic:"🍲", n:"Kongsi makanan dengan jiran|Share food with a neighbour", items:["Saya tolong sediakan makanan untuk jiran|I helped prepare food for a neighbour","Saya beri salam dan senyum|I gave salam and smiled","Saya hantar bersama orang dewasa|I took it with a grown-up","Saya ingat: muliakan jiran (Bukhari dan Muslim)|I remember: honour your neighbour (Bukhari and Muslim)"]}
 ]}
];
// extras for existing houses
var EXTRA = {
 obs:[
   {id:"s_plan", i:142, t:"quiz", bank:"planets", ic:"🪐", n:"Planet sistem suria|Planets of the solar system"},
   {id:"s_nav",  i:143, t:"tip", bank:"starnav", ic:"✨", n:"Bintang panduan pengembara|Stars that guided travellers"},
   {id:"s_asr",  i:144, t:"tip", bank:"shadow", ic:"📐", n:"Bayang kayu: bila masuk Asar?|Stick shadow: when is Asr?"},
   {id:"s_rock", i:145, t:"moves", bank:"rocket", ic:"🚀", n:"Bina dan lancar roket|Build and launch a rocket"}],
 sports:[
   {id:"p_silat",i:168, t:"moves", bank:"silat", ic:"🥋", n:"Gerak asas silat|Basic silat moves"},
   {id:"p_arch", i:169, t:"target", hit:"🎯", goal:8, q:"Ketik sasaran untuk memanah|Tap the target to shoot", ic:"🏹", n:"Memanah (sukan sunnah)|Archery (a sunnah sport)"},
   {id:"p_sun",  i:170, t:"quiz", bank:"sunnahsport", ic:"🐎", n:"Kuiz sukan sunnah|Sunnah sports quiz"},
   {id:"p_wau",  i:171, t:"target", hit:"🪁", goal:10, speed:1000, q:"Ketik wau supaya terus terbang tinggi|Tap the wau to keep it flying high", ic:"🪁", n:"Permainan menerbangkan wau|Wau kite-flying game"},
   {id:"p_takraw",i:172,t:"counter", key:"takraw", unit:"sepak|kicks", goal:20, step:1, ic:"🏐", n:"Kiraan sepak takraw|Sepak takraw juggle counter"},
   {id:"p_steps",i:173, t:"counter", key:"steps", unit:"×1000", goal:6, step:1, ic:"👟", n:"Matlamat langkah harian|Daily step goal"}]
};

// ---------------- banks ----------------
// quiz: [question, [options], answerIndex]   tip: [title, text]   sort: {bins:[a,b], items:[[thing, bin, why?]]}
BANK.books = [
 ["Burung Hud-hud yang membawa berita|The hoopoe who brought news","Hud-hud terbang jauh dan melihat sebuah kerajaan di Saba. Dia pulang dan memberitahu Nabi Sulaiman dengan jujur. Soalan: Siapa raja yang mendengar berita itu? Apa yang hud-hud buat dengan baik? Kenapa jujur itu penting?|The hoopoe flew far and saw a kingdom in Saba. It came back and told Prophet Sulaiman the truth. Questions: Which king heard the news? What did the hoopoe do well? Why is honesty important?"],
 ["Aminah dan payung biru|Aminah and the blue umbrella","Hujan turun lebat. Aminah nampak seorang nenek kebasahan di perhentian bas, lalu berkongsi payungnya. Soalan: Bagaimana cuaca hari itu? Apa yang Aminah kongsi? Bagaimana perasaan nenek?|It rained hard. Aminah saw a grandmother getting wet at the bus stop and shared her umbrella. Questions: What was the weather? What did Aminah share? How did the grandmother feel?"],
 ["Sang Kancil dan buaya|Sang Kancil and the crocodiles","Kancil mahu menyeberang sungai. Dia berfikir dengan bijak dan mengira buaya-buaya sebagai jambatan. Soalan: Haiwan apa yang bijak? Bagaimana dia menyeberang? Adakah menipu itu baik? Bincang dengan ibu bapa.|Kancil wanted to cross the river. He thought cleverly and counted the crocodiles as a bridge. Questions: Which animal was clever? How did he cross? Is tricking others good? Talk about it with a parent."],
 ["Pokok kurma Ali|Ali's date tree","Ali menanam sebiji benih kurma bersama datuknya. Setiap hari dia menyiram dan berdoa. Bertahun-tahun kemudian, pokok itu berbuah untuk seluruh kampung. Soalan: Siapa menanam bersama Ali? Apa yang Ali buat setiap hari? Siapa yang makan buahnya?|Ali planted a date seed with his grandfather. Every day he watered it and made dua. Years later the tree gave fruit to the whole village. Questions: Who planted with Ali? What did he do every day? Who ate the fruit?"],
 ["Kotak bekal yang tertinggal|The forgotten lunch box","Yusuf tertinggal bekalnya. Kawannya, Hana, berkongsi separuh roti. Esoknya Yusuf membawa dua biji epal untuk Hana. Soalan: Apa yang tertinggal? Apa Hana kongsi? Bagaimana Yusuf membalas kebaikan?|Yusuf forgot his lunch. His friend Hana shared half her bread. The next day Yusuf brought two apples for Hana. Questions: What was forgotten? What did Hana share? How did Yusuf repay the kindness?"]
];
BANK.jawi = [
 ["سکوله · sekolah|سکوله · sekolah (school)","Sekolah ditulis س ک و ل ه. Cuba tulis sekali!|School is written س ک و ل ه in Jawi. Try writing it once!"],
 ["ايبو · ibu|ايبو · ibu (mother)","Ibu ditulis ا ي ب و.|Ibu (mother) is written ا ي ب و."],
 ["ايه · ayah|ايه · ayah (father)","Ayah ditulis ا ي ه.|Ayah (father) is written ا ي ه."],
 ["بوکو · buku|بوکو · buku (book)","Buku ditulis ب و ک و.|Buku (book) is written ب و ک و."],
 ["رومه · rumah|رومه · rumah (house)","Rumah ditulis ر و م ه.|Rumah (house) is written ر و م ه."],
 ["ماکن · makan|ماکن · makan (eat)","Makan ditulis م ا ک ن.|Makan (eat) is written م ا ک ن."],
 ["کوچيڠ · kucing|کوچيڠ · kucing (cat)","Kucing ditulis dengan huruf چ (ca) dan ڠ (nga).|Kucing (cat) uses the Jawi letters چ (ca) and ڠ (nga)."]
];
BANK.guessbook = [
 ["Seekor ikan besar menelan seorang nabi. Kisah siapa?|A big fish swallowed a prophet. Whose story?",["Nabi Yunus|Prophet Yunus","Nabi Nuh|Prophet Nuh","Nabi Musa|Prophet Musa"],0],
 ["Sebuah bahtera besar dan banjir. Kisah siapa?|A big ark and a flood. Whose story?",["Nabi Nuh|Prophet Nuh","Nabi Ibrahim|Prophet Ibrahim","Nabi Isa|Prophet Isa"],0],
 ["Seekor kancil bijak di tepi sungai. Buku apa?|A clever mouse-deer by a river. Which book?",["Hikayat Sang Kancil|The tales of Sang Kancil","Kisah semut|The ant story","Buku masak|A cookbook"],0],
 ["Api yang menjadi sejuk. Kisah siapa?|Fire that became cool. Whose story?",["Nabi Ibrahim|Prophet Ibrahim","Nabi Sulaiman|Prophet Sulaiman","Nabi Yusuf|Prophet Yusuf"],0],
 ["Seorang budak dibuang ke perigi oleh abang-abangnya. Kisah siapa?|A boy thrown into a well by his brothers. Whose story?",["Nabi Yusuf|Prophet Yusuf","Nabi Yunus|Prophet Yunus","Nabi Adam|Prophet Adam"],0],
 ["Raja yang faham bahasa semut. Kisah siapa?|A king who understood the ants. Whose story?",["Nabi Sulaiman|Prophet Sulaiman","Nabi Daud|Prophet Daud","Nabi Hud|Prophet Hud"],0],
 ["Tongkat menjadi ular dan laut terbelah. Kisah siapa?|A staff became a snake and the sea split. Whose story?",["Nabi Musa|Prophet Musa","Nabi Nuh|Prophet Nuh","Nabi Saleh|Prophet Saleh"],0]
];
BANK.scientists = [
 ["Ibn Sina (980–1037)|Ibn Sina (980–1037)","Doktor hebat dari Bukhara. Bukunya tentang perubatan digunakan di universiti selama ratusan tahun.|A great doctor from Bukhara. His book of medicine was used in universities for hundreds of years."],
 ["Al-Khwarizmi (lebih kurang 780–850)|Al-Khwarizmi (about 780–850)","Ahli matematik di Baghdad. Perkataan “algebra” dan “algoritma” datang daripada karya dan namanya.|A mathematician in Baghdad. The words “algebra” and “algorithm” come from his book and his name."],
 ["Al-Jazari (1136–1206)|Al-Jazari (1136–1206)","Jurutera yang mencipta mesin air dan jam gajah yang terkenal. Dia melukis setiap mesin dengan teliti.|An engineer who built water machines and the famous elephant clock. He drew every machine carefully."],
 ["Ibn al-Haytham (965–1040)|Ibn al-Haytham (965–1040)","Bapa ilmu optik. Dia menerangkan bagaimana mata melihat cahaya dan membuat uji kaji dengan teliti.|The father of optics. He explained how eyes see light and tested his ideas with careful experiments."],
 ["Al-Zahrawi (936–1013)|Al-Zahrawi (936–1013)","Pakar bedah dari Andalusia. Dia mereka lebih 200 alat pembedahan.|A surgeon from Andalusia. He designed more than 200 surgical tools."],
 ["Fatimah al-Fihri (abad ke-9)|Fatimah al-Fihri (9th century)","Dia membina Masjid dan Universiti al-Qarawiyyin di Fez pada tahun 859, antara universiti tertua di dunia.|She founded the al-Qarawiyyin mosque and university in Fez in 859, one of the oldest universities in the world."]
];
BANK.call999 = [
 ["Rumah jiran terbakar. Nombor apa?|A neighbour's house is on fire. Which number?",["999","123","101"],0],
 ["Bila telefon 999, apa yang anda beritahu dahulu?|When you call 999, what do you say first?",["Apa yang berlaku dan di mana|What happened and where","Nama kartun kegemaran|Your favourite cartoon","Tiada apa, letak telefon|Nothing, hang up"],0],
 ["Bolehkah telefon 999 untuk bergurau?|Can you call 999 as a joke?",["Tidak, hanya kecemasan|No, only for emergencies","Ya, seronok|Yes, it is fun","Hanya hari Jumaat|Only on Fridays"],0],
 ["Datuk jatuh dan tidak bangun. Apa buat?|Grandpa fell and does not get up. What do you do?",["Panggil orang dewasa dan telefon 999|Call a grown-up and phone 999","Tunggu esok|Wait until tomorrow","Main dahulu|Play first"],0],
 ["Operator bertanya. Anda...|The operator asks questions. You...",["Jawab dengan tenang dan jangan letak telefon|Answer calmly and do not hang up","Menjerit sahaja|Just scream","Letak telefon cepat|Hang up quickly"],0],
 ["Bomba juga boleh dihubungi terus di nombor...|You can also reach the fire brigade directly on...",["994","999 sahaja tidak boleh|Only 999 is not allowed","12345"],0]
];
BANK.stopdrop = [["Berhenti! Jangan lari|Stop! Do not run", 4], ["Jatuh ke lantai|Drop to the floor", 4], ["Tutup muka dengan tangan|Cover your face with your hands", 4], ["Guling ke kiri dan kanan|Roll left and right", 8], ["Panggil orang dewasa|Call a grown-up", 4], ["Bagus! Anda tahu caranya|Well done! You know how", 3]];
BANK.safe = {bins:["✅ Selamat|✅ Safe","⛔ Tidak selamat|⛔ Not safe"], items:[
 ["Main dengan mancis|Playing with matches",1],["Pegang tangan ibu ketika melintas|Holding Ummi's hand when crossing",0],["Sentuh dapur yang panas|Touching a hot stove",1],["Pakai topi keledar ketika berbasikal|Wearing a helmet on a bike",0],
 ["Masukkan jari ke dalam soket|Putting fingers in a plug socket",1],["Minta orang dewasa ambil ubat|Asking a grown-up for medicine",0],["Makan pil seperti gula-gula|Eating pills like sweets",1],["Pakai tali pinggang keledar dalam kereta|Wearing a seat belt in the car",0],
 ["Bermain di tepi jalan raya|Playing next to the road",1],["Duduk di kerusi kanak-kanak dalam kereta|Sitting in a child seat in the car",0],["Panjat tingkap tinggi|Climbing a high window",1],["Berenang bersama orang dewasa|Swimming with a grown-up",0]]};
BANK.stranger = [
 ["Orang asing tawar gula-gula dan ajak ikut. Anda...|A stranger offers sweets and asks you to come. You...",["Kata TIDAK, lari dan beritahu orang dewasa|Say NO, run and tell a grown-up","Ikut sebentar|Go for a bit","Ambil gula-gula|Take the sweets"],0],
 ["Seseorang kata “Ibu suruh saya ambil kamu”, tapi anda tak kenal. Anda...|Someone says “Your mum sent me”, but you do not know them. You...",["Tanya kata rahsia keluarga atau cikgu|Ask for the family password or ask a teacher","Terus ikut|Go with them","Masuk kereta|Get in the car"],0],
 ["Siapa orang selamat untuk minta tolong?|Who is a safe person to ask for help?",["Polis, pengawal keselamatan atau cikgu|A police officer, a guard or a teacher","Sesiapa sahaja di jalan|Anyone on the street","Orang dalam kereta yang berhenti|Someone in a car that stops"],0],
 ["Seseorang suruh anda simpan rahsia daripada ibu bapa. Anda...|Someone asks you to keep a secret from your parents. You...",["Beritahu ibu bapa juga|Tell your parents anyway","Simpan sahaja|Keep it","Takut dan diam|Stay scared and quiet"],0],
 ["Orang asing di dalam talian minta gambar atau alamat. Anda...|A stranger online asks for a photo or your address. You...",["Jangan beri dan beritahu ibu bapa|Do not give it and tell a parent","Beri gambar|Send a photo","Beri alamat|Give your address"],0],
 ["Badan anda milik siapa?|Whose body is yours?",["Milik saya; saya boleh kata TIDAK|Mine; I can say NO","Sesiapa boleh sentuh|Anyone can touch it","Tidak tahu|I do not know"],0]
];
BANK.lost = [
 ["Anda terpisah dari ibu di pusat beli-belah. Mula-mula...|You lose Ummi in a mall. First...",["Berhenti dan tunggu di tempat itu|Stop and stay where you are","Lari mencari ke merata tempat|Run everywhere","Keluar dari bangunan|Leave the building"],0],
 ["Siapa yang anda minta tolong?|Who do you ask for help?",["Juruwang kedai atau pengawal berpakaian seragam|A shop cashier or a guard in uniform","Orang yang ajak anda keluar|Someone who asks you to leave with them","Tiada sesiapa|Nobody"],0],
 ["Apa yang anda beritahu mereka?|What do you tell them?",["Nama saya dan nombor telefon ibu bapa|My name and a parent's phone number","Warna baju sahaja|Only my shirt colour","Nama kucing|My cat's name"],0],
 ["Seorang asing kata “mari ikut saya cari ibu ke luar”. Anda...|A stranger says “come, let's look for Ummi outside”. You...",["Tidak ikut; tunggu dengan pengawal|Do not go; wait with the guard","Ikut keluar|Go outside","Masuk lif dengannya|Get in the lift with them"],0],
 ["Sebelum pergi ke tempat ramai, apa yang bagus dibuat?|Before going somewhere busy, what is good to do?",["Setuju tempat berjumpa jika terpisah|Agree on a meeting point in case you get lost","Tidak perlu apa-apa|Nothing at all","Pakai baju gelap|Wear dark clothes"],0]
];
BANK.flood = [
 ["Air banjir naik di jalan. Bolehkah bermain air?|Flood water is rising on the road. Can you play in it?",["Tidak; air banjir deras, kotor dan berbahaya|No; flood water is fast, dirty and dangerous","Ya, seronok|Yes, it is fun","Hanya dengan basikal|Only on a bike"],0],
 ["Polis atau bomba suruh pindah. Anda...|The police or bomba say to move out. You...",["Ikut arahan dan pergi ke pusat pemindahan|Follow them to the relief centre","Sorok di bilik|Hide in your room","Tunggu esok|Wait until tomorrow"],0],
 ["Apa yang patut ada dalam beg kecemasan?|What goes in an emergency bag?",["Air, lampu suluh, ubat, dokumen penting|Water, a torch, medicine, important papers","Mainan sahaja|Only toys","Tiada apa-apa|Nothing"],0],
 ["Air masuk ke rumah. Elektrik...|Water comes into the house. The electricity...",["Orang dewasa tutup suis utama|A grown-up switches off the main switch","Biar sahaja menyala|Leave it on","Pegang suis yang basah|Touch the wet switch"],0],
 ["Musim banjir di pantai timur Malaysia biasanya pada...|The flood season on Malaysia's east coast is usually in...",["Musim tengkujuh (November hingga Januari)|The monsoon (November to January)","Hari Raya sahaja|Only at Hari Raya","Tiada banjir di Malaysia|Malaysia has no floods"],0]
];
BANK.halallogo = [
 ["Logo halal rasmi di Malaysia dikeluarkan oleh...|Malaysia's official halal logo is issued by...",["JAKIM|JAKIM","Kedai runcit|The corner shop","Sesiapa sahaja|Anyone"],0],
 ["Logo halal JAKIM berbentuk...|JAKIM's halal logo is shaped like...",["Bulatan dengan bintang dan tulisan حلال|A circle with a star and the word حلال","Segi tiga merah|A red triangle","Hati|A heart"],0],
 ["Tiada logo halal pada coklat import. Anda...|An imported chocolate has no halal logo. You...",["Tanya ibu bapa dan semak ramuan|Ask a parent and check the ingredients","Terus makan|Eat it straight away","Buang ke lantai|Throw it on the floor"],0],
 ["Ramuan yang perlu disemak dengan teliti?|Which ingredient needs careful checking?",["Gelatin|Gelatin","Air|Water","Garam|Salt"],0],
 ["Buah segar seperti epal...|Fresh fruit like apples...",["Halal secara semula jadi|Is halal by nature","Perlu logo|Needs a logo","Haram|Is haram"],0],
 ["Di My Ihsan, alat apa membantu semak label?|In My Ihsan, which tool helps check a label?",["Penyemak halal|The halal checker","Kalendar|The calendar","Kompas|The compass"],0]
];
BANK.shoplist = [
 ["Mahu buat lempeng pisang. Barang mana perlu dibeli?|Making banana pancakes. What do you buy?",["Pisang, tepung, telur|Bananas, flour, eggs","Ikan, nasi, kicap|Fish, rice, soy sauce","Sabun, berus, span|Soap, brush, sponge"],0],
 ["Mahu buat nasi goreng. Barang yang paling penting?|Making fried rice. The most important item?",["Nasi|Rice","Aiskrim|Ice cream","Gula-gula|Sweets"],0],
 ["Mahu buat salad buah. Barang mana?|Making fruit salad. What do you buy?",["Tembikai, betik, anggur|Watermelon, papaya, grapes","Bawang, cili, ikan bilis|Onions, chillies, anchovies","Roti dan mentega sahaja|Only bread and butter"],0],
 ["Mahu buat sup ayam. Barang mana?|Making chicken soup. What do you buy?",["Ayam, lobak merah, kentang|Chicken, carrots, potatoes","Coklat dan krim|Chocolate and cream","Jem dan roti|Jam and bread"],0],
 ["Sebelum ke pasar, apa yang bagus dibuat?|Before going to the market, what is good to do?",["Tulis senarai dan bawa beg sendiri|Write a list and bring your own bag","Beli semua yang nampak|Buy everything you see","Lupakan dompet|Forget the wallet"],0],
 ["Mahu buat roti telur. Barang mana?|Making egg sandwiches. What do you buy?",["Roti dan telur|Bread and eggs","Nanas dan cili|Pineapple and chilli","Ais dan sirap|Ice and syrup"],0]
];
BANK.needs = {bins:["🍞 Keperluan|🍞 Need","🎈 Kehendak|🎈 Want"], items:[
 ["Air minuman|Drinking water",0],["Mainan baru|A new toy",1],["Kasut sekolah|School shoes",0],["Gula-gula|Sweets",1],["Ubat ketika sakit|Medicine when sick",0],["Permainan video|A video game",1],
 ["Buku sekolah|School books",0],["Aiskrim|Ice cream",1],["Rumah untuk berteduh|A home to live in",0],["Pelekat berkilat|Sparkly stickers",1],["Sayur dan nasi|Vegetables and rice",0],["Belon|A balloon",1]]};
BANK.fruits = [
 ["Durian|Durian","Raja buah. Kulitnya berduri dan baunya kuat. Musimnya biasanya Jun hingga Ogos.|The king of fruits. Spiky skin and a strong smell. Its season is usually June to August."],
 ["Rambutan|Rambutan","Kulit merah berbulu lembut, isi putih manis. “Rambut” bermaksud hair!|Red, hairy skin and sweet white flesh. “Rambut” means hair in Malay!"],
 ["Manggis|Mangosteen","Ratu buah. Kulit ungu tebal, isi putih seperti ulas bawang.|The queen of fruits. Thick purple skin and white segments inside."],
 ["Cempedak|Cempedak","Saudara nangka yang lebih kecil. Sedap digoreng!|A smaller cousin of the jackfruit. Tasty when fried!"],
 ["Langsat|Langsat","Buah kecil kuning dalam tandan. Isinya jernih dan manis-masam.|Small yellow fruit in bunches. Clear, sweet and slightly sour flesh."],
 ["Betik|Papaya","Isi oren lembut, baik untuk perut. Bijinya hitam kecil.|Soft orange flesh that is good for the tummy. Small black seeds."],
 ["Ciku|Sapodilla","Kulit perang, rasa manis seperti gula perang.|Brown skin and a taste like brown sugar."]
];
BANK.body = [
 ["Tangan dalam bahasa Arab?|“Hand” in Arabic?",["يَد (yad)","رَأْس (ra'su)","عَيْن ('ayn)"],0],
 ["Mata dalam bahasa Arab?|“Eye” in Arabic?",["عَيْن ('ayn)","أُذُن (udhun)","يَد (yad)"],0],
 ["Kepala dalam bahasa Arab?|“Head” in Arabic?",["رَأْس (ra'su)","قَدَم (qadam)","فَم (fam)"],0],
 ["Telinga dalam bahasa Inggeris?|“Telinga” in English?",["Ear","Nose","Knee"],0],
 ["Kaki dalam bahasa Arab?|“Foot” in Arabic?",["قَدَم (qadam)","يَد (yad)","أَنْف (anf)"],0],
 ["Mulut dalam bahasa Arab?|“Mouth” in Arabic?",["فَم (fam)","عَيْن ('ayn)","رَأْس (ra'su)"],0],
 ["Hidung dalam bahasa Inggeris?|“Hidung” in English?",["Nose","Mouth","Hand"],0],
 ["Hati (jantung) bahasa Arab?|“Heart” in Arabic?",["قَلْب (qalb)","فَم (fam)","يَد (yad)"],0]
];
BANK.doctor = [
 ["1. Di ruang menunggu|1. In the waiting room","Kita daftar nama dan tunggu giliran. Bawa buku atau bermain senyap. Baca Bismillah dan bertenang.|We register and wait for our turn. Bring a book or play quietly. Say Bismillah and stay calm."],
 ["2. Doktor menyapa|2. The doctor says hello","Doktor senyum dan bertanya apa yang sakit. Ceritakan dengan jujur: di mana sakit, sejak bila.|The doctor smiles and asks what hurts. Tell the truth: where it hurts and since when."],
 ["3. Stetoskop|3. The stethoscope","Doktor dengar degupan jantung dan nafas. Sejuk sedikit, tapi tidak sakit!|The doctor listens to your heart and breathing. It is a bit cold, but it does not hurt!"],
 ["4. Buka mulut “Aaa”|4. Open wide, “Aaa”","Doktor lihat tekak dengan lampu kecil. Sekejap sahaja.|The doctor looks at your throat with a little light. Just a moment."],
 ["5. Ubat dan terima kasih|5. Medicine and thank you","Ambil ubat ikut arahan. Ucap terima kasih. Allah yang menyembuhkan, ubat ialah usaha kita.|Take the medicine as told. Say thank you. Allah heals; medicine is our effort."]
];
BANK.senses = [
 ["Kita mencium bau dengan...|We smell with our...",["Hidung|Nose","Telinga|Ears","Lidah|Tongue"],0],
 ["Kita merasa manis dan masin dengan...|We taste sweet and salty with our...",["Lidah|Tongue","Mata|Eyes","Kulit|Skin"],0],
 ["Kita mendengar azan dengan...|We hear the adhan with our...",["Telinga|Ears","Hidung|Nose","Kaki|Feet"],0],
 ["Kita merasa air sejuk atau panas dengan...|We feel water is hot or cold with our...",["Kulit|Skin","Rambut|Hair","Gigi|Teeth"],0],
 ["Kita melihat pelangi dengan...|We see a rainbow with our...",["Mata|Eyes","Telinga|Ears","Lidah|Tongue"],0],
 ["Berapa deria yang kita ada?|How many senses do we have?",["5","3","10"],0]
];
BANK.sickdoa = [
 ["Bila sakit di badan|When a part of you hurts","Letak tangan di tempat sakit. Baca بِسْمِ اللَّهِ tiga kali, kemudian tujuh kali: أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ “Aku berlindung dengan Allah dan kekuasaan-Nya daripada keburukan yang aku rasa dan aku takuti.” (Muslim)|Put your hand where it hurts. Say بِسْمِ اللَّهِ three times, then seven times: أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ “I seek refuge in Allah and His power from the harm I feel and fear.” (Muslim)"],
 ["Melawat orang sakit|Visiting someone who is sick","Ucapkan: لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ “Tidak mengapa, ia penyuci (dosa), insya-Allah.” (Bukhari)|Say: لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ “No harm, it is a purification, in sha Allah.” (Bukhari)"],
 ["Sabar ketika sakit|Patience when sick","Rasulullah ﷺ mengajar bahawa sakit yang kita sabar menghapuskan dosa, seperti daun gugur dari pokok. (Bukhari dan Muslim)|The Prophet ﷺ taught that sickness borne with patience removes sins, like leaves falling from a tree. (Bukhari and Muslim)"],
 ["Adab melawat|Visiting manners","Lawat sekejap, bawa buah atau makanan, doakan dia, dan jangan buat bising.|Keep the visit short, bring fruit or food, make dua for them and keep quiet."]
];
BANK.watercycle = [
 ["1. Sejatan|1. Evaporation","Matahari memanaskan laut dan sungai. Air naik ke langit sebagai wap yang tidak nampak.|The Sun warms the sea and rivers. Water rises into the sky as invisible vapour."],
 ["2. Kondensasi|2. Condensation","Di atas, udara sejuk. Wap bertukar menjadi titisan kecil dan membentuk awan.|Up high the air is cold. The vapour turns into tiny drops that make clouds."],
 ["3. Kerpasan|3. Precipitation","Titisan bergabung dan menjadi berat, lalu turun sebagai hujan. Allah menurunkan hujan dari langit (al-Baqarah 2:22).|The drops join and get heavy, then fall as rain. Allah sends down rain from the sky (al-Baqarah 2:22)."],
 ["4. Kumpulan|4. Collection","Air hujan mengalir ke sungai, tasik dan bawah tanah, kemudian ke laut. Kitaran bermula semula!|Rain flows into rivers, lakes and the ground, then to the sea. The cycle starts again!"]
];
BANK.zamzam = [
 ["Lembah yang kering|A dry valley","Nabi Ibrahim meninggalkan Hajar dan bayi Ismail di lembah Makkah dengan perintah Allah. Tiada air dan tiada orang.|By Allah's command, Prophet Ibrahim left Hajar and baby Ismail in the valley of Makkah. There was no water and no people."],
 ["Tujuh kali berlari|Seven runs","Ismail haus. Hajar berlari antara bukit Safa dan Marwah tujuh kali mencari air. Hari ini jemaah haji dan umrah berjalan sa'i untuk mengingatinya.|Ismail was thirsty. Hajar ran between the hills of Safa and Marwah seven times looking for water. Today pilgrims walk the sa'i to remember her."],
 ["Air memancut|Water springs up","Allah mengutus malaikat Jibril, dan air memancut dari bumi dekat kaki Ismail. Hajar berkata “Zam zam!” (berkumpullah!).|Allah sent the angel Jibril, and water burst from the ground near Ismail's feet. Hajar said “Zam zam!” (gather, stop!)."],
 ["Sehingga hari ini|To this day","Telaga Zamzam masih mengalir, memberi minum berjuta-juta jemaah. Pengajaran: yakin kepada Allah dan terus berusaha.|The well of Zamzam still flows and gives water to millions of pilgrims. The lesson: trust Allah and keep trying."]
];
BANK.datepalm = [
 ["Biji|The seed","Biji kurma ditanam di tanah yang hangat dan disiram.|A date seed is planted in warm soil and watered."],
 ["Anak pokok|The seedling","Selepas beberapa minggu, daun hijau tumbuh. Pokok kurma tumbuh perlahan.|After some weeks a green leaf appears. Date palms grow slowly."],
 ["Pokok dewasa|The grown palm","Selepas 4 hingga 8 tahun, pokok mula berbunga. Pokok kurma boleh hidup lebih 100 tahun!|After 4 to 8 years the palm starts to flower. A date palm can live more than 100 years!"],
 ["Buah|The fruit","Tandan kurma bertukar dari hijau ke kuning atau merah, kemudian perang dan manis.|Bunches of dates turn from green to yellow or red, then brown and sweet."],
 ["Dalam al-Quran|In the Quran","Maryam diperintah menggoncang pokok kurma dan memakan buahnya (Maryam 19:25).|Maryam was told to shake the palm tree and eat its dates (Maryam 19:25)."]
];
BANK.desertani = [
 ["Haiwan yang boleh berjalan lama tanpa minum?|Which animal can go a long time without drinking?",["Unta|Camel","Ikan|Fish","Itik|Duck"],0],
 ["Bonggol unta menyimpan...|A camel's hump stores...",["Lemak|Fat","Air|Water","Pasir|Sand"],0],
 ["Rubah padang pasir bertelinga besar untuk...|The fennec fox has big ears to...",["Menyejukkan badan dan mendengar|Cool down and hear well","Terbang|Fly","Berenang|Swim"],0],
 ["Haiwan berekor sengat di padang pasir?|A desert animal with a stinging tail?",["Kala jengking|Scorpion","Arnab|Rabbit","Kura-kura|Turtle"],0],
 ["Kenapa unta ada bulu mata yang panjang?|Why do camels have long eyelashes?",["Melindungi mata daripada pasir|To keep sand out of their eyes","Supaya cantik|To look pretty","Untuk tidur|To sleep"],0],
 ["Ayat al-Quran meminta kita melihat bagaimana unta diciptakan. Surah apa?|A Quran verse asks us to look at how camels are created. Which surah?",["Al-Ghasyiyah|Al-Ghashiyah","Al-Fatihah|Al-Fatihah","An-Nas|An-Nas"],0]
];
BANK.dates = [
 ["Rasulullah ﷺ berbuka dengan kurma dalam bilangan ganjil. Mana nombor ganjil?|The Prophet ﷺ ate dates in odd numbers. Which number is odd?",["3","4","6"],0],
 ["Mana nombor ganjil?|Which number is odd?",["5","2","8"],0],
 ["Mana nombor ganjil?|Which number is odd?",["7","10","4"],0],
 ["3 kurma + 2 kurma = ?|3 dates + 2 dates = ?",["5","6","4"],0],
 ["Mana nombor genap?|Which number is even?",["6","3","9"],0],
 ["Pagi Hari Raya Aidilfitri, sunnah makan kurma dalam bilangan...|On the morning of Eid al-Fitr it is sunnah to eat dates in...",["Ganjil|An odd number","Genap|An even number","Seratus|A hundred"],0]
];
BANK.pack = {bins:["🎒 Bawa|🎒 Bring","🏠 Tinggal|🏠 Leave"], items:[
 ["Air minuman|Drinking water",0],["Kurma dan roti|Dates and bread",0],["Kompas|A compass",0],["Selimut untuk malam sejuk|A blanket for cold nights",0],["Lampu suluh|A torch",0],["Ubat|Medicine",0],
 ["Televisyen|A television",1],["Peti ais|A fridge",1],["Katil besar|A big bed",1],["Akuarium ikan|A fish tank",1],["Piano berat|A heavy piano",1],["Basikal|A bicycle",1]]};
BANK.traveldoa = [
 ["Doa naik kenderaan|Dua for riding","سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ “Maha Suci Allah yang memudahkan kenderaan ini untuk kami, sedangkan kami tidak mampu menguasainya, dan kepada Tuhan kami, kami akan kembali.” (az-Zukhruf 43:13-14)|سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ “Glory be to Him who has made this ride easy for us, which we could not do ourselves, and to our Lord we will return.” (az-Zukhruf 43:13-14)"],
 ["Mula dengan Bismillah|Start with Bismillah","Sebelum kereta bergerak, baca بِسْمِ اللَّهِ dan الْحَمْدُ لِلَّهِ, kemudian doa di atas.|Before the car moves, say بِسْمِ اللَّهِ and الْحَمْدُ لِلَّهِ, then the dua above."],
 ["Doa musafir dimakbulkan|A traveller's dua is answered","Rasulullah ﷺ bersabda doa orang yang bermusafir dimakbulkan. Doakan keluarga anda dalam perjalanan! (Abu Dawud)|The Prophet ﷺ said the dua of a traveller is answered. Make dua for your family on the journey! (Abu Dawud)"]
];
BANK.hello = [
 ["Assalamualaikum|Assalamualaikum","Salam umat Islam di seluruh dunia: “Semoga kesejahteraan ke atas kamu.” Jawab: Waalaikumussalam.|The greeting of Muslims all over the world: “Peace be upon you.” Reply: Wa alaikum salam."],
 ["Helo (Bahasa Melayu)|Helo (Malay)","Helo! Apa khabar?|Helo! Apa khabar? (How are you?)"],
 ["Hello (English)|Hello (English)","Hello! How are you?|Hello! How are you?"],
 ["Marhaban (Arab)|Marhaban (Arabic)","مَرْحَبًا Selamat datang!|مَرْحَبًا Welcome!"],
 ["Merhaba (Turki)|Merhaba (Turkish)","Merhaba! Nasılsın?|Merhaba! Nasılsın? (How are you?)"],
 ["Ni hao (Mandarin)|Ni hao (Mandarin)","你好 Ni hao!|你好 Ni hao!"],
 ["Vanakkam (Tamil)|Vanakkam (Tamil)","வணக்கம் Vanakkam!|வணக்கம் Vanakkam!"],
 ["Salam (Parsi)|Salam (Persian)","سلام Salam!|سلام Salam!"],
 ["Halo (Indonesia)|Halo (Indonesian)","Halo! Apa kabar?|Halo! Apa kabar?"],
 ["Bonjour (Perancis)|Bonjour (French)","Bonjour! Comment ça va?|Bonjour! Comment ça va?"]
];
BANK.battuta = [
 ["Bermula di Tangier|Starting in Tangier","Pada tahun 1325, Ibn Battuta yang berumur 21 tahun meninggalkan Tangier, Maghribi, untuk menunaikan haji.|In 1325, 21-year-old Ibn Battuta left Tangier in Morocco to go on Hajj."],
 ["Makkah dan Madinah|Makkah and Madinah","Dia menunaikan haji, kemudian terus mengembara untuk belajar dan melihat dunia ciptaan Allah.|He performed Hajj, then kept travelling to learn and see Allah's world."],
 ["India dan Maldives|India and the Maldives","Dia menjadi hakim (qadi) di Delhi dan di Kepulauan Maldives.|He worked as a judge (qadi) in Delhi and in the Maldives."],
 ["Sumatera dan China|Sumatra and China","Dia singgah di Samudera Pasai di Sumatera, dekat dengan Tanah Melayu, sebelum belayar ke China.|He stopped at Samudra Pasai in Sumatra, near the Malay lands, before sailing to China."],
 ["30 tahun, 120,000 km|30 years, 120,000 km","Dia pulang selepas hampir 30 tahun dan menulis kisahnya dalam buku Rihlah.|He came home after almost 30 years and told his story in the book Rihla."]
];
BANK.trade = [
 ["Rempah seperti lada dan cengkih banyak datang dari...|Spices like pepper and cloves came a lot from...",["Kepulauan Melayu|The Malay Archipelago","Kutub Utara|The North Pole","Padang pasir Sahara|The Sahara"],0],
 ["Kafilah unta membawa barang merentas...|Camel caravans carried goods across...",["Padang pasir|Deserts","Lautan dalam|Deep oceans","Awan|Clouds"],0],
 ["Pelabuhan terkenal di Tanah Melayu pada abad ke-15?|A famous port in the Malay lands in the 15th century?",["Melaka|Melaka","Paris|Paris","Tokyo|Tokyo"],0],
 ["Kain yang terkenal dari China dalam Jalan Sutera?|The famous cloth from China on the Silk Road?",["Sutera|Silk","Plastik|Plastic","Kertas pasir|Sandpaper"],0],
 ["Bagaimana pedagang Muslim membawa Islam ke Tanah Melayu?|How did Muslim traders bring Islam to the Malay lands?",["Dengan akhlak yang baik dan jujur berniaga|With good manners and honest trade","Dengan paksaan|By force","Dengan surat sahaja|Only by letters"],0]
];
BANK.ancient = [
 ["Fosil ialah...|A fossil is...","Kesan haiwan atau tumbuhan yang sangat lama, terawet dalam batu.|The remains of a very old animal or plant, kept in rock."],
 ["Mamot berbulu|The woolly mammoth","Saudara gajah yang berbulu tebal dan bergading panjang, hidup di zaman ais.|A cousin of the elephant with thick fur and long tusks, from the ice age."],
 ["Dinosaur|Dinosaurs","Reptilia besar yang hidup berjuta tahun dahulu. Kita tahu tentang mereka daripada tulang fosil.|Big reptiles that lived millions of years ago. We know them from fossil bones."],
 ["Amonit|Ammonites","Haiwan laut berkulit berpusar seperti siput. Fosilnya banyak dijumpai di batu.|Sea animals with spiral shells. Their fossils are found in many rocks."],
 ["Tunjukkan rasa kagum|Wonder at creation","Allah mencipta pelbagai makhluk sejak dahulu. Mengkaji bumi membuat kita lebih mengenal ciptaan-Nya.|Allah has created many creatures through time. Studying the earth helps us know His creation better."]
];
BANK.rocks = [
 ["Batu yang terbentuk daripada lava yang menyejuk?|Rock made from cooled lava?",["Igneus (cth. granit)|Igneous (e.g. granite)","Kayu|Wood","Kaca plastik|Plastic glass"],0],
 ["Batu berlapis-lapis daripada pasir dan lumpur?|Rock made in layers of sand and mud?",["Sedimen (cth. batu pasir)|Sedimentary (e.g. sandstone)","Igneus|Igneous","Ais|Ice"],0],
 ["Batu yang berubah kerana haba dan tekanan?|Rock changed by heat and pressure?",["Metamorf (cth. marmar)|Metamorphic (e.g. marble)","Sedimen|Sedimentary","Span|Sponge"],0],
 ["Di mana fosil biasanya dijumpai?|Where are fossils usually found?",["Batu sedimen|Sedimentary rock","Lava panas|Hot lava","Awan|Clouds"],0],
 ["Gunung Kinabalu kebanyakannya diperbuat daripada...|Mount Kinabalu is mostly made of...",["Granit|Granite","Coklat|Chocolate","Garam|Salt"],0]
];
BANK.quranplaces = [
 ["Saba'|Saba'","Negeri yang subur dengan dua taman dan empangan besar. Apabila penduduknya tidak bersyukur, empangan pecah (Saba' 34:15-16).|A green land with two gardens and a big dam. When its people stopped being thankful, the dam broke (Saba' 34:15-16)."],
 ["Kaum Thamud|The people of Thamud","Mereka memahat rumah di gunung. Nabi Saleh dihantar kepada mereka dengan seekor unta betina sebagai tanda (al-A'raf 7:73-74).|They carved homes in the mountains. Prophet Saleh was sent to them with a she-camel as a sign (al-A'raf 7:73-74)."],
 ["Kaum 'Ad dan Iram|The people of 'Ad and Iram","Kaum yang kuat dan bangunannya tinggi. Nabi Hud mengajak mereka menyembah Allah (al-Fajr 89:6-8).|A strong people with tall buildings. Prophet Hud called them to worship Allah (al-Fajr 89:6-8)."],
 ["Bukit Judi|Mount Judi","Tempat bahtera Nabi Nuh berlabuh selepas banjir (Hud 11:44).|Where Prophet Nuh's ark came to rest after the flood (Hud 11:44)."],
 ["Madyan|Madyan","Kaum Nabi Syuaib. Baginda mengajar mereka menimbang dengan adil ketika berniaga (Hud 11:84-85).|The people of Prophet Shu'aib. He taught them to weigh fairly in trade (Hud 11:84-85)."]
];
BANK.planets = [
 ["Planet paling dekat dengan Matahari?|The planet closest to the Sun?",["Utarid|Mercury","Musytari|Jupiter","Neptun|Neptune"],0],
 ["Planet yang kita diami?|The planet we live on?",["Bumi|Earth","Marikh|Mars","Zuhal|Saturn"],0],
 ["Planet merah?|The red planet?",["Marikh|Mars","Zuhrah|Venus","Uranus|Uranus"],0],
 ["Planet paling besar?|The biggest planet?",["Musytari|Jupiter","Bumi|Earth","Utarid|Mercury"],0],
 ["Planet dengan gelang cantik?|The planet with beautiful rings?",["Zuhal|Saturn","Marikh|Mars","Bumi|Earth"],0],
 ["Berapa planet dalam sistem suria?|How many planets are in the solar system?",["8","5","12"],0]
];
BANK.starnav = [
 ["Bintang sebagai petunjuk|Stars as guides","Allah menjadikan bintang untuk petunjuk dalam kegelapan darat dan laut (al-An'am 6:97).|Allah made the stars to guide us in the darkness of land and sea (al-An'am 6:97)."],
 ["Bintang Utara|The North Star","Polaris hampir tidak bergerak di langit dan menunjukkan arah utara.|Polaris hardly moves in the sky and shows where north is."],
 ["Nama bintang dalam bahasa Arab|Star names in Arabic","Banyak bintang bernama Arab: Altair (الطائر, burung), Aldebaran (الدبران, pengikut), Betelgeuse.|Many stars have Arabic names: Altair (the bird), Aldebaran (the follower), Betelgeuse."],
 ["Pelaut Melayu|Malay sailors","Pelaut Nusantara menggunakan bintang dan angin monsun untuk belayar jauh.|Malay sailors used the stars and the monsoon winds to sail far."]
];
BANK.shadow = [
 ["Pacak kayu di bawah matahari|Put a stick in the sun","Pacak sebatang kayu tegak di tanah lapang. Perhatikan bayangnya sepanjang hari.|Stand a straight stick in open ground. Watch its shadow during the day."],
 ["Tengah hari (Zohor)|Midday (Zuhr)","Bayang paling pendek ketika matahari paling tinggi. Selepas matahari tergelincir sedikit, masuk waktu Zohor.|The shadow is shortest when the Sun is highest. Just after the Sun passes the top, Zuhr begins."],
 ["Masuk Asar|Asr begins","Mazhab Syafi'i: Asar masuk apabila panjang bayang = panjang kayu + bayang tengah hari tadi.|In the Shafi'i school, Asr begins when the shadow equals the stick's length plus the midday shadow."],
 ["Cuba sendiri|Try it yourself","Tandakan hujung bayang setiap jam dengan batu kecil. Bandingkan dengan waktu solat dalam aplikasi!|Mark the shadow's tip every hour with a pebble. Compare it with the prayer times in the app!"]
];
BANK.rocket = [["Pasang badan roket (bangun berdiri tegak)|Build the body (stand up tall)", 5], ["Pasang sayap (depakan tangan)|Add the fins (arms out)", 5], ["Isi bahan api (tarik nafas dalam)|Fuel up (deep breath)", 5], ["10, 9, 8... kira mundur|10, 9, 8... count down", 10], ["Lancar! Lompat tinggi!|Lift off! Jump high!", 5], ["Terapung di angkasa (gerak perlahan)|Float in space (move slowly)", 8]];
BANK.silat = [["Salam hormat kepada guru|Salute your teacher", 4], ["Kuda-kuda: buka kaki, bengkok lutut|Stance: feet apart, knees bent", 8], ["Tangkis atas dengan tangan kanan|Block up with your right hand", 6], ["Tangkis atas dengan tangan kiri|Block up with your left hand", 6], ["Langkah ke depan perlahan|Step forward slowly", 6], ["Langkah ke belakang|Step back", 6], ["Tunduk hormat dan senyum|Bow and smile", 4]];
BANK.sunnahsport = [
 ["Rasulullah ﷺ bersabda: “Memanahlah wahai anak Ismail.” Sukan apa?|The Prophet ﷺ said: “Shoot, O children of Ismail.” Which sport?",["Memanah|Archery","Bola sepak|Football","Catur|Chess"],0],
 ["Rasulullah ﷺ pernah berlumba lari dengan...|The Prophet ﷺ once ran a race with...",["Aisyah r.a.|Aisyah r.a.","Seekor unta|A camel","Tiada sesiapa|Nobody"],0],
 ["Umar r.a. diriwayatkan menyuruh mengajar anak berenang, memanah dan...|Umar r.a. is reported to have said to teach children swimming, archery and...",["Menunggang kuda|Horse riding","Main telefon|Phone games","Tidur|Sleeping"],0],
 ["Kenapa bersukan itu baik?|Why is sport good?",["Badan kuat untuk beribadah dan membantu orang|A strong body to worship and help others","Untuk menunjuk-nunjuk|To show off","Supaya tak perlu belajar|So you do not have to study"],0],
 ["“Mukmin yang kuat lebih baik dan lebih dicintai Allah...” (Muslim). Kuat bermaksud...|“The strong believer is better and more beloved to Allah...” (Muslim). Strong means...",["Kuat badan, hati dan iman|Strong in body, heart and faith","Suka bergaduh|Likes fighting","Makan banyak|Eats a lot"],0]
];
BANK.floatsink = {bins:["🛟 Terapung|🛟 Floats","⬇️ Tenggelam|⬇️ Sinks"], items:[
 ["Daun kering|A dry leaf",0],["Batu|A stone",1],["Bola plastik|A plastic ball",0],["Duit syiling|A coin",1],["Gabus|A cork",0],["Kunci besi|A metal key",1],["Span|A sponge",0,"Span terapung kerana penuh udara (sehingga basah sepenuhnya).|A sponge floats because it is full of air (until it soaks right through)."],["Guli kaca|A glass marble",1],["Ranting kayu|A twig",0],["Sudu besi|A metal spoon",1],["Itik getah|A rubber duck",0],["Paku|A nail",1]]};
BANK.magnet = {bins:["🧲 Melekat|🧲 Sticks","✋ Tidak melekat|✋ Does not stick"], items:[
 ["Paku besi|An iron nail",0],["Pemadam|An eraser",1],["Klip kertas besi|A steel paper clip",0],["Kayu|Wood",1],["Pintu peti ais|A fridge door",0],["Pensel|A pencil",1],["Sudu keluli|A steel spoon",0],["Tin minuman aluminium|An aluminium drink can",1,"Aluminium tidak ditarik oleh magnet.|Magnets do not pull aluminium."],["Gunting besi|Iron scissors",0],["Kertas|Paper",1]]};
BANK.leaves = [
 ["Gosok daun|Leaf rubbing","Letak daun di bawah kertas, gosok perlahan dengan krayon. Urat daun akan muncul!|Put a leaf under paper and rub gently with a crayon. The veins will appear!"],
 ["Daun pandan|Pandan leaf","Panjang, hijau dan wangi. Digunakan dalam kuih dan nasi lemak.|Long, green and fragrant. Used in kuih and nasi lemak."],
 ["Daun pisang|Banana leaf","Besar dan lebar. Digunakan untuk membungkus makanan.|Big and wide. Used to wrap food."],
 ["Daun kelapa|Coconut leaf","Panjang dengan banyak helai kecil. Digunakan untuk membuat ketupat!|Long with many thin leaflets. Used to weave ketupat!"],
 ["Daun bunga raya|Hibiscus leaf","Bergerigi di tepi. Bunga raya ialah bunga kebangsaan Malaysia.|Jagged at the edges. The hibiscus is Malaysia's national flower."],
 ["Setiap daun bertasbih|Every leaf praises Allah","Tiada sehelai daun pun yang gugur melainkan Allah mengetahuinya (al-An'am 6:59).|Not a leaf falls without Allah knowing it (al-An'am 6:59)."]
];
BANK.shadowq = [
 ["Bayang-bayang terbentuk apabila cahaya...|A shadow forms when light is...",["Dihalang oleh objek|Blocked by an object","Berwarna|Coloured","Sejuk|Cold"],0],
 ["Lampu suluh dekat dengan tangan. Bayang menjadi...|A torch close to your hand. The shadow gets...",["Lebih besar|Bigger","Lebih kecil|Smaller","Hilang|Gone"],0],
 ["Waktu tengah hari, bayang kita...|At midday our shadow is...",["Paling pendek|Shortest","Paling panjang|Longest","Biru|Blue"],0],
 ["Objek mana membiarkan cahaya lalu?|Which lets light through?",["Kaca tingkap|Window glass","Kayu|Wood","Batu|Stone"],0],
 ["Waktu petang, bayang kita menjadi...|In the late afternoon our shadow becomes...",["Panjang|Long","Hilang|Gone","Hijau|Green"],0]
];
BANK.rainbowexp = [
 ["Bahan|You need","Segelas air jernih, lampu suluh atau cahaya matahari, dan sehelai kertas putih.|A clear glass of water, a torch or sunlight, and white paper."],
 ["Langkah 1|Step 1","Letak gelas di tepi tingkap yang terkena matahari, atau suluh lampu melaluinya.|Put the glass by a sunny window, or shine the torch through it."],
 ["Langkah 2|Step 2","Letak kertas putih di belakang gelas. Gerakkan perlahan sehingga warna muncul.|Hold the white paper behind the glass. Move it slowly until colours appear."],
 ["Kenapa?|Why?","Air membengkokkan cahaya putih dan memisahkannya kepada warna pelangi: merah, jingga, kuning, hijau, biru, indigo, ungu.|Water bends white light and splits it into rainbow colours: red, orange, yellow, green, blue, indigo, violet."]
];
BANK.volcano = [
 ["Dengan orang dewasa|With a grown-up","Buat di luar atau di dalam dulang besar. Jangan rasa atau sentuh mata.|Do this outside or in a big tray. Do not taste it or touch your eyes."],
 ["Bahan|You need","Botol kecil, 2 sudu soda penaik, cuka, sedikit sabun cecair dan pewarna makanan merah.|A small bottle, 2 spoons of baking soda, vinegar, a drop of washing-up liquid and red food colouring."],
 ["Bina gunung|Build the mountain","Letak botol di tengah, bentuk gunung dengan tanah liat atau pasir di sekelilingnya.|Put the bottle in the middle and build a mountain around it with clay or sand."],
 ["Letus!|Erupt!","Masukkan soda, sabun dan pewarna, kemudian tuang cuka. Buih meletus keluar!|Add the soda, soap and colour, then pour in the vinegar. Foam bursts out!"],
 ["Kenapa?|Why?","Soda (bes) dan cuka (asid) bertindak balas dan membuat gas karbon dioksida yang menolak buih keluar.|Soda (a base) and vinegar (an acid) react and make carbon dioxide gas that pushes the foam out."]
];
BANK.why = [
 ["Kenapa langit biru?|Why is the sky blue?","Cahaya matahari ada semua warna. Udara menyerakkan cahaya biru ke seluruh langit lebih banyak daripada warna lain.|Sunlight has every colour. The air scatters blue light across the sky more than the others."],
 ["Kenapa laut masin?|Why is the sea salty?","Sungai membawa garam kecil dari batu ke laut. Air laut sejat, tetapi garam tinggal.|Rivers carry tiny bits of salt from rocks to the sea. The water evaporates but the salt stays."],
 ["Kenapa kita menguap?|Why do we yawn?","Mungkin untuk menyejukkan otak dan bila kita penat. Sunnah: tutup mulut ketika menguap.|Maybe to cool the brain and when we are tired. Sunnah: cover your mouth when you yawn."],
 ["Kenapa daun hijau?|Why are leaves green?","Daun mempunyai klorofil yang menyerap cahaya untuk membuat makanan dan memantulkan warna hijau.|Leaves have chlorophyll that soaks up light to make food and reflects green."],
 ["Kenapa bulan berubah bentuk?|Why does the Moon change shape?","Bulan mengelilingi Bumi dan kita nampak bahagian yang terkena cahaya matahari berbeza-beza setiap malam.|The Moon goes round the Earth, so each night we see a different part lit by the Sun."],
 ["Kenapa kita perlu tidur?|Why do we need sleep?","Tidur membantu badan membesar dan otak menyimpan apa yang dipelajari. Allah menjadikan tidur sebagai rehat (an-Naba' 78:9).|Sleep helps the body grow and the brain store what we learned. Allah made sleep for rest (an-Naba' 78:9)."],
 ["Kenapa guruh berbunyi?|Why does thunder rumble?","Kilat memanaskan udara dengan sangat cepat. Udara mengembang dan menghasilkan bunyi dentuman.|Lightning heats the air very fast. The air expands and makes a booming sound."]
];
BANK.myani = [
 ["Orang utan|Orang utan","Tinggal di hutan Borneo dan Sumatera. “Orang hutan” bermaksud manusia hutan. Ia bijak dan suka buah.|Lives in the rainforests of Borneo and Sumatra. “Orang hutan” means person of the forest. Clever and loves fruit."],
 ["Tapir|Malayan tapir","Badannya hitam dan putih seperti memakai baju. Hidungnya panjang dan boleh bergerak.|Black and white like it is wearing a shirt. Its long nose can wiggle."],
 ["Enggang|Hornbill","Burung berparuh besar dari Sarawak, Negeri Kenyalang.|A big-beaked bird from Sarawak, the Land of the Hornbills."],
 ["Harimau Malaya|Malayan tiger","Simbol negara pada jata Malaysia. Hanya tinggal sedikit di hutan; kita perlu melindunginya.|A national symbol on Malaysia's coat of arms. Very few are left in the wild; we must protect them."],
 ["Penyu|Sea turtle","Penyu belimbing dan penyu agar bertelur di pantai Terengganu dan Sabah.|Leatherback and green turtles lay eggs on the beaches of Terengganu and Sabah."],
 ["Kancil|Mouse-deer","Rusa paling kecil di dunia, setinggi kucing. Wira cerita rakyat Melayu!|The smallest deer in the world, as tall as a cat. The hero of Malay folk tales!"]
];
BANK.sounds = [
 ["Haiwan mana berbunyi “moo”?|Which animal says “moo”?",["Lembu|Cow","Kucing|Cat","Itik|Duck"],0],
 ["Haiwan mana berbunyi “meow”?|Which animal says “meow”?",["Kucing|Cat","Kambing|Goat","Ayam|Chicken"],0],
 ["Haiwan mana berkokok “kukuruyuk”?|Which animal crows “cock-a-doodle-doo”?",["Ayam jantan|Rooster","Lembu|Cow","Ikan|Fish"],0],
 ["Haiwan mana berbunyi “mbek”?|Which animal says “baa”?",["Kambing atau biri-biri|Goat or sheep","Itik|Duck","Gajah|Elephant"],0],
 ["Haiwan mana berbunyi “kuek kuek”?|Which animal says “quack”?",["Itik|Duck","Harimau|Tiger","Lebah|Bee"],0],
 ["Haiwan mana mendengung “bzzz”?|Which animal buzzes “bzzz”?",["Lebah|Bee","Lembu|Cow","Kuda|Horse"],0],
 ["Haiwan mana mengaum?|Which animal roars?",["Harimau|Tiger","Arnab|Rabbit","Rama-rama|Butterfly"],0]
];
BANK.kindani = [
 ["Wanita dan kucing|The woman and the cat","Rasulullah ﷺ menceritakan seorang wanita yang dihukum kerana mengurung kucing tanpa memberinya makan dan minum. (Bukhari dan Muslim)|The Prophet ﷺ told of a woman punished for locking up a cat without food or water. (Bukhari and Muslim)"],
 ["Lelaki dan anjing yang dahaga|The man and the thirsty dog","Seorang lelaki menimba air dengan kasutnya untuk anjing yang dahaga. Allah mengampunkannya. (Bukhari)|A man drew water in his shoe for a thirsty dog. Allah forgave him. (Bukhari)"],
 ["Burung yang kehilangan anak|The bird that lost its chicks","Para sahabat mengambil anak burung. Ibunya terbang resah. Rasulullah ﷺ bersabda: “Kembalikan anak-anaknya.” (Abu Dawud)|The companions took some chicks. Their mother fluttered in distress. The Prophet ﷺ said: “Return her young to her.” (Abu Dawud)"],
 ["Unta yang menangis|The crying camel","Seekor unta menangis kerana penat dan lapar. Rasulullah ﷺ menegur pemiliknya supaya bertakwa kepada Allah tentang haiwannya. (Abu Dawud)|A camel cried because it was tired and hungry. The Prophet ﷺ told its owner to fear Allah about his animal. (Abu Dawud)"],
 ["Apa yang boleh kita buat?|What can we do?","Beri makan dan minum kucing, jangan baling batu kepada haiwan, letak bekas air untuk burung.|Feed and give water to cats, never throw stones at animals, put out a water bowl for birds."]
];
BANK.tracks = [
 ["Tapak kaki dengan 3 jari panjang dan tajam?|Footprints with 3 long, thin toes?",["Burung|A bird","Gajah|An elephant","Ikan|A fish"],0],
 ["Tapak kaki bulat besar seperti dulang?|Big round footprints like a tray?",["Gajah|An elephant","Semut|An ant","Arnab|A rabbit"],0],
 ["Tapak berkuku belah dua?|Hoof prints split in two?",["Kambing atau rusa|A goat or a deer","Kucing|A cat","Ayam|A chicken"],0],
 ["Garis berliku tanpa kaki di atas pasir?|A wiggly line with no feet on the sand?",["Ular|A snake","Kuda|A horse","Kucing|A cat"],0],
 ["Tapak kecil dengan 4 jari bulat dan tiada kuku nampak?|Small prints with 4 round toes and no claws showing?",["Kucing|A cat","Itik|A duck","Lembu|A cow"],0],
 ["Tapak berselaput antara jari?|Prints with webbing between the toes?",["Itik|A duck","Harimau|A tiger","Kambing|A goat"],0]
];
BANK.quranani = [
 ["Semut yang memberi amaran kepada kawan-kawannya ada dalam surah...|The ant that warned its friends is in surah...",["An-Naml (Semut)|An-Naml (The Ant)","Al-Fil|Al-Fil","Al-Baqarah|Al-Baqarah"],0],
 ["Lebah yang menghasilkan madu ada dalam surah...|The bee that makes honey is in surah...",["An-Nahl (Lebah)|An-Nahl (The Bee)","An-Nas|An-Nas","Al-Asr|Al-Asr"],0],
 ["Tentera bergajah yang mahu meruntuhkan Kaabah ada dalam surah...|The army with elephants that tried to destroy the Kaaba is in surah...",["Al-Fil (Gajah)|Al-Fil (The Elephant)","Al-Kawthar|Al-Kawthar","Al-Ikhlas|Al-Ikhlas"],0],
 ["Rumah yang paling lemah ialah rumah...|The weakest house is the house of the...",["Labah-labah (al-Ankabut)|Spider (al-Ankabut)","Burung|Bird","Semut|Ant"],0],
 ["Burung yang membawa berita kepada Nabi Sulaiman?|The bird that brought news to Prophet Sulaiman?",["Hud-hud|The hoopoe","Burung gagak|The crow","Burung merak|The peacock"],0],
 ["Burung yang menunjukkan cara mengebumikan kepada anak Nabi Adam?|The bird that showed Adam's son how to bury?",["Burung gagak|The crow","Burung hantu|The owl","Burung pipit|The sparrow"],0],
 ["Surah al-Baqarah bermaksud...|Surah al-Baqarah means...",["Lembu betina|The Cow","Kuda|The Horse","Unta|The Camel"],0]
];
BANK.recycle = {bins:["♻️ Kitar semula|♻️ Recycle","🗑️ Tong biasa|🗑️ Normal bin"], items:[
 ["Botol plastik bersih|A clean plastic bottle",0],["Tin minuman|A drink can",0],["Kotak kertas|A cardboard box",0],["Surat khabar lama|Old newspapers",0],["Botol kaca|A glass jar",0],
 ["Tisu kotor|A used tissue",1],["Sisa makanan berminyak|Oily food scraps",1,"Sisa makanan boleh jadi baja kompos!|Food scraps can become compost!"],["Lampin pakai buang|A used nappy",1],["Bungkus snek berkilat|A shiny snack wrapper",1],["Pinggan polistirena kotor|A dirty foam plate",1]]};
BANK.endangered = [
 ["Haiwan Malaysia yang sangat terancam dan menjadi simbol negara?|A very endangered Malaysian animal that is a national symbol?",["Harimau Malaya|Malayan tiger","Ayam|Chicken","Kucing|Cat"],0],
 ["Apa yang menyebabkan hutan orang utan berkurang?|What makes the orang utan's forest shrink?",["Pembalakan dan pembukaan tanah|Logging and land clearing","Hujan|Rain","Pelangi|Rainbows"],0],
 ["Penyu mati kerana tersalah makan...|Turtles die from mistakenly eating...",["Beg plastik yang nampak seperti obor-obor|Plastic bags that look like jellyfish","Rumput laut|Seaweed","Ikan kecil|Small fish"],0],
 ["Bagaimana kita boleh bantu?|How can we help?",["Kurangkan plastik dan sokong hutan simpan|Use less plastic and support protected forests","Beli haiwan liar sebagai peliharaan|Buy wild animals as pets","Buang sampah ke sungai|Throw rubbish in rivers"],0],
 ["Allah menjadikan manusia sebagai khalifah di bumi (al-Baqarah 2:30). Maksudnya kita...|Allah made people caretakers on earth (al-Baqarah 2:30). It means we...",["Menjaga bumi dan makhluknya|Look after the earth and its creatures","Boleh rosakkan apa sahaja|Can destroy anything","Tidak peduli|Do not care"],0]
];
BANK.swim = [
 ["Bolehkah berenang tanpa orang dewasa?|Can you swim without a grown-up?",["Tidak, sentiasa bersama orang dewasa|No, always with a grown-up","Ya|Yes","Hanya di sungai|Only in rivers"],0],
 ["Di tepi kolam, kita...|By the pool, we...",["Berjalan perlahan, tidak berlari|Walk slowly, never run","Berlari laju|Run fast","Tolak kawan|Push friends"],0],
 ["Kawan terkapai-kapai dalam air. Anda...|A friend is struggling in the water. You...",["Jerit minta tolong orang dewasa dan hulur kayu atau pelampung|Shout for a grown-up and reach out a stick or a float","Terjun sendiri|Jump in yourself","Ketawa|Laugh"],0],
 ["Air sungai selepas hujan lebat...|River water after heavy rain is...",["Deras dan bahaya; jangan masuk|Fast and dangerous; stay out","Sangat selamat|Very safe","Sejuk dan seronok sahaja|Just cold and fun"],0],
 ["Apa yang membantu kita terapung?|What helps us float?",["Jaket keselamatan|A life jacket","Beg sekolah|A school bag","Kasut|Shoes"],0],
 ["Sebelum berenang, kita...|Before swimming, we...",["Panaskan badan dan tunggu selepas makan berat|Warm up and wait after a big meal","Makan banyak terus|Eat a lot right away","Tidur|Sleep"],0]
];
BANK.raft = [
 ["Bahan terbaik untuk rakit?|The best thing to build a raft from?",["Batang buluh|Bamboo poles","Batu-bata|Bricks","Besi berat|Heavy iron"],0],
 ["Kenapa buluh terapung?|Why does bamboo float?",["Ia berongga dan penuh udara|It is hollow and full of air","Ia berat|It is heavy","Ia berwarna hijau|It is green"],0],
 ["Untuk mengikat buluh, kita guna...|To tie the bamboo together we use...",["Tali|Rope","Gula|Sugar","Air|Water"],0],
 ["Rakit lebar atau sempit lebih stabil?|Is a wide or a narrow raft steadier?",["Lebar|Wide","Sempit|Narrow","Sama sahaja|The same"],0],
 ["Nabi mana membina bahtera besar dengan perintah Allah?|Which prophet built a big ark by Allah's command?",["Nabi Nuh|Prophet Nuh","Nabi Isa|Prophet Isa","Nabi Adam|Prophet Adam"],0]
];
BANK.riverclean = {bins:["🧤 Kutip sampah|🧤 Pick it up","🌿 Biarkan, ia alam|🌿 Leave it, it is nature"], items:[
 ["Botol plastik|A plastic bottle",0],["Batu sungai|A river stone",1],["Beg plastik|A plastic bag",0],["Ikan kecil|A little fish",1],["Tin kosong|An empty can",0],["Daun gugur|A fallen leaf",1],
 ["Straw plastik|A plastic straw",0],["Katak|A frog",1],["Bungkus gula-gula|A sweet wrapper",0],["Siput air|A water snail",1]]};
BANK.boatfold = [
 ["1. Lipat dua|1. Fold in half","Ambil kertas segi empat tepat. Lipat dua dari atas ke bawah.|Take a rectangle of paper. Fold it in half from top to bottom."],
 ["2. Bucu ke tengah|2. Corners to the middle","Lipat dua bucu atas ke garisan tengah sehingga menjadi bentuk rumah.|Fold the two top corners to the middle line to make a house shape."],
 ["3. Lipat tepi bawah|3. Fold up the bottom","Lipat jalur bawah ke atas di kedua-dua belah. Sekarang ia seperti topi!|Fold the bottom strips up on both sides. Now it looks like a hat!"],
 ["4. Buka dan rata|4. Open and flatten","Buka topi dari bawah dan tekan menjadi segi empat. Lipat bucu bawah ke atas, buka semula.|Open the hat from the bottom and flatten it into a square. Fold the bottom corners up, then open again."],
 ["5. Tarik menjadi bot|5. Pull into a boat","Tarik perlahan kedua-dua hujung atas ke tepi. Bot siap! Cuba apungkan dalam besen.|Gently pull the two top points apart. Your boat is ready! Try floating it in a basin."]
];
BANK.yunus = [
 ["Nabi Yunus meninggalkan kaumnya|Prophet Yunus leaves his people","Kaumnya tidak mahu mendengar. Nabi Yunus berasa kecewa dan pergi sebelum diizinkan Allah, lalu menaiki kapal.|His people would not listen. Prophet Yunus left in sadness before Allah allowed him, and boarded a ship."],
 ["Ditelan ikan besar|Swallowed by a big fish","Laut bergelora. Nabi Yunus jatuh ke laut dan ditelan ikan besar dengan izin Allah (as-Saffat 37:139-142).|The sea grew stormy. Prophet Yunus went into the sea and, by Allah's will, a big fish swallowed him (as-Saffat 37:139-142)."],
 ["Doa dalam kegelapan|A dua in the dark","Dalam perut ikan, Baginda berdoa: لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ (al-Anbiya' 21:87)|In the belly of the fish he prayed: لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ “There is no god but You, glory be to You, I have done wrong.” (al-Anbiya' 21:87)"],
 ["Diselamatkan|Saved","Allah menyelamatkannya. Ikan meluahkannya ke pantai dan Allah menumbuhkan pokok labu untuk melindunginya (as-Saffat 37:145-146).|Allah saved him. The fish put him on the shore and Allah grew a gourd plant to shade him (as-Saffat 37:145-146)."],
 ["Pengajaran|The lesson","Bila kita tersilap, kita bertaubat dan berdoa. Allah sentiasa mendengar, walaupun dalam kegelapan.|When we make a mistake, we say sorry to Allah and make dua. Allah always hears, even in the dark."]
];
BANK.foodfrom = [
 ["Susu datang daripada...|Milk comes from...",["Lembu atau kambing|A cow or a goat","Pokok|A tree","Kedai sahaja|Only the shop"],0],
 ["Keju dibuat daripada...|Cheese is made from...",["Susu|Milk","Telur|Eggs","Gandum|Wheat"],0],
 ["Roti dibuat daripada tepung...|Bread is made from flour of...",["Gandum|Wheat","Ais|Ice","Gula|Sugar"],0],
 ["Nasi datang daripada pokok...|Rice comes from the plant called...",["Padi|Paddy","Kelapa|Coconut","Getah|Rubber"],0],
 ["Madu dibuat oleh...|Honey is made by...",["Lebah|Bees","Semut|Ants","Burung|Birds"],0],
 ["Minyak masak sawit datang daripada...|Palm cooking oil comes from...",["Buah kelapa sawit|Oil palm fruit","Batu|Stones","Susu|Milk"],0],
 ["Telur ayam datang daripada...|Chicken eggs come from...",["Ayam betina|Hens","Lembu|Cows","Ikan|Fish"],0]
];
BANK.qurban = [
 ["Hari Raya Aidiladha|Eid al-Adha","Pada 10 Zulhijjah, umat Islam menyambut Aidiladha dan ramai yang melakukan ibadah korban.|On 10 Dhul Hijjah, Muslims celebrate Eid al-Adha and many offer the qurban."],
 ["Kisah Nabi Ibrahim|The story of Prophet Ibrahim","Nabi Ibrahim taat kepada perintah Allah, dan Allah menggantikan Nabi Ismail dengan seekor kibas (as-Saffat 37:102-107).|Prophet Ibrahim obeyed Allah, and Allah gave a ram in place of Prophet Ismail (as-Saffat 37:102-107)."],
 ["Haiwan dijaga dengan baik|The animal is cared for","Haiwan diberi makan dan minum, tidak ditakutkan, dan pisau diasah supaya cepat. Rasulullah ﷺ menyuruh kita berbuat baik dalam semua perkara (Muslim).|The animal gets food and water, is not frightened, and the knife is sharp so it is quick. The Prophet ﷺ told us to do everything kindly (Muslim)."],
 ["Daging dikongsi|The meat is shared","Daging dibahagikan untuk keluarga, saudara dan jiran, serta orang yang memerlukan. Semua orang dapat merasa!|The meat is shared with family, relatives, neighbours and people in need. Everyone gets to eat!"],
 ["Yang sampai kepada Allah|What reaches Allah","Bukan daging atau darah yang sampai kepada Allah, tetapi takwa kita (al-Hajj 22:37).|It is not the meat or blood that reaches Allah, but our taqwa (al-Hajj 22:37)."]
];
BANK.babies = [
 ["Anak kucing dipanggil...|A baby cat is a...",["Anak kucing (kitten)|Kitten","Anak ayam (chick)|Chick","Anak lembu (calf)|Calf"],0],
 ["Anak lembu dipanggil...|A baby cow is a...",["Calf|Calf","Kid|Kid","Duckling|Duckling"],0],
 ["Anak ayam dipanggil...|A baby chicken is a...",["Chick|Chick","Foal|Foal","Lamb|Lamb"],0],
 ["Anak kambing dipanggil...|A baby goat is a...",["Kid|Kid","Calf|Calf","Cub|Cub"],0],
 ["Anak biri-biri dipanggil...|A baby sheep is a...",["Lamb|Lamb","Chick|Chick","Kitten|Kitten"],0],
 ["Anak kuda dipanggil...|A baby horse is a...",["Foal|Foal","Duckling|Duckling","Kid|Kid"],0],
 ["Anak itik dipanggil...|A baby duck is a...",["Duckling|Duckling","Lamb|Lamb","Calf|Calf"],0]
];
BANK.harvest = [
 ["Padi|Rice","Padi ditanam di sawah berair. Selepas kira-kira 4 bulan, padi menguning dan dituai.|Rice grows in flooded fields. After about 4 months it turns golden and is harvested."],
 ["Musim durian|Durian season","Biasanya Jun hingga Ogos, dan ada musim kedua hujung tahun di sesetengah negeri.|Usually June to August, with a second season at the end of the year in some states."],
 ["Kelapa sawit|Oil palm","Buahnya dituai setiap 2 hingga 3 minggu sepanjang tahun.|Its fruit is harvested every 2 to 3 weeks all year round."],
 ["Sayur cepat|Quick vegetables","Sawi dan kangkung boleh dituai hanya 3 hingga 5 minggu selepas ditanam. Cuba tanam di rumah!|Sawi and kangkung can be picked just 3 to 5 weeks after planting. Try growing some at home!"],
 ["Syukur selepas menuai|Thankful after harvest","Allah menumbuhkan tanaman dengan hujan. Ucap Alhamdulillah dan berkongsi hasil dengan jiran.|Allah grows the crops with rain. Say Alhamdulillah and share the harvest with neighbours."]
];
BANK.bee = [
 ["Allah memberi ilham kepada lebah|Allah inspired the bee","“Dan Tuhanmu memberi ilham kepada lebah: buatlah sarang di gunung, di pokok dan di tempat yang dibina manusia.” (an-Nahl 16:68)|“And your Lord inspired the bee: make homes in the mountains, the trees and what people build.” (an-Nahl 16:68)"],
 ["Madu penawar|Honey that heals","“Dari perutnya keluar minuman yang berlainan warnanya; padanya ada penawar bagi manusia.” (an-Nahl 16:69)|“From their bellies comes a drink of many colours, in which there is healing for people.” (an-Nahl 16:69)"],
 ["Pasukan lebah|The bee team","Ratu bertelur, lebah pekerja mencari nektar, membersihkan sarang dan menjaga bayi lebah.|The queen lays eggs; worker bees collect nectar, clean the hive and care for the baby bees."],
 ["Tarian lebah|The bee dance","Lebah menari dalam bentuk angka 8 untuk memberitahu kawan di mana bunga berada!|Bees dance in a figure 8 to tell their friends where the flowers are!"],
 ["Lebah membantu tanaman|Bees help plants","Ketika mengumpul nektar, lebah membawa debunga dari bunga ke bunga supaya buah boleh tumbuh.|While collecting nectar, bees carry pollen from flower to flower so fruit can grow."]
];
BANK.hex = [
 ["Berapa sisi pada heksagon?|How many sides does a hexagon have?",["6","5","8"],0],
 ["Kenapa sarang lebah berbentuk heksagon?|Why are honeycomb cells hexagons?",["Ia muat rapat tanpa ruang kosong dan jimat lilin|They fit tightly with no gaps and save wax","Supaya cantik sahaja|Just to look nice","Lebah suka nombor 6|Bees like the number 6"],0],
 ["Berapa sisi pada segi tiga?|How many sides does a triangle have?",["3","4","6"],0],
 ["2 heksagon, berapa sisi semuanya?|2 hexagons, how many sides in all?",["12","10","8"],0],
 ["Bentuk mana yang ada 8 sisi?|Which shape has 8 sides?",["Oktagon|Octagon","Heksagon|Hexagon","Pentagon|Pentagon"],0],
 ["Berapa bucu pada heksagon?|How many corners does a hexagon have?",["6","4","3"],0]
];
BANK.flowers = [
 ["Bunga raya dalam bahasa Inggeris?|“Bunga raya” in English?",["Hibiscus","Rose","Sunflower"],0],
 ["Bunga matahari dalam bahasa Inggeris?|“Bunga matahari” in English?",["Sunflower","Lily","Orchid"],0],
 ["Orchid dalam bahasa Melayu?|“Orchid” in Malay?",["Orkid","Mawar","Melur"],0],
 ["Rose dalam bahasa Melayu?|“Rose” in Malay?",["Mawar","Kemboja","Teratai"],0],
 ["Lotus dalam bahasa Melayu?|“Lotus” in Malay?",["Teratai","Orkid","Raya"],0],
 ["Jasmine dalam bahasa Melayu?|“Jasmine” in Malay?",["Melur","Mawar","Kertas"],0],
 ["Bunga kebangsaan Malaysia?|Malaysia's national flower?",["Bunga raya|Hibiscus","Mawar|Rose","Tulip|Tulip"],0]
];
BANK.secret = [
 ["Misi: susun kasut|Mission: line up the shoes","Susun semua kasut di pintu dengan kemas tanpa diberitahu. Shh, rahsia!|Line up all the shoes at the door neatly without being asked. Shh, it is a secret!"],
 ["Misi: nota senyum|Mission: a smiley note","Letak nota “Saya sayang awak” di bantal adik-beradik.|Leave a note saying “I love you” on a sibling's pillow."],
 ["Misi: lap meja|Mission: wipe the table","Selepas makan, lap meja sebelum orang lain perasan.|After the meal, wipe the table before anyone notices."],
 ["Misi: air untuk ayah|Mission: water for Ayah","Bawa segelas air kepada ayah atau ibu ketika mereka penat.|Bring a glass of water to Ayah or Ummi when they are tired."],
 ["Misi: doa rahsia|Mission: a secret dua","Doakan seorang kawan tanpa dia tahu. Malaikat berkata “untukmu juga” (Muslim).|Make dua for a friend without them knowing. The angel says “and for you too” (Muslim)."],
 ["Misi: lipat tuala|Mission: fold the towels","Lipat tuala yang sudah kering dan simpan di tempatnya.|Fold the dry towels and put them away."],
 ["Misi: senyum|Mission: smile","Senyum kepada 5 orang hari ini. Senyuman itu sedekah (Tirmidhi).|Smile at 5 people today. A smile is charity (Tirmidhi)."]
];
BANK.sorry = [
 ["Mengaku|Own it","Katakan apa yang anda buat: “Saya tertolak awak.” Jujur itu berani.|Say what you did: “I pushed you.” Being honest is brave."],
 ["Minta maaf|Say sorry","“Saya minta maaf.” Pandang mata dan cakap dengan lembut.|“I'm sorry.” Look at them and speak gently."],
 ["Baiki|Fix it","Tanya: “Boleh saya tolong?” Kutip mainan atau ganti yang rosak.|Ask: “Can I help?” Pick up the toys or replace what broke."],
 ["Memaafkan|Forgiving","Bila orang minta maaf, maafkan. Allah suka orang yang memaafkan (Ali 'Imran 3:134).|When someone says sorry, forgive them. Allah loves those who forgive (Ali 'Imran 3:134)."],
 ["Jangan merajuk lama|Do not sulk for long","Rasulullah ﷺ melarang kita memulaukan saudara lebih daripada tiga hari (Bukhari dan Muslim).|The Prophet ﷺ told us not to stay cross with a brother or sister for more than three days (Bukhari and Muslim)."]
];

// ---------------- register ----------------
NEW.forEach(function(h){ K.HOUSES.push(h); });
Object.keys(EXTRA).forEach(function(id){ var h = K.HOUSES.filter(function(x){ return x.id === id; })[0]; if(h) EXTRA[id].forEach(function(a){ h.acts.push(a); }); });
K.ALL = []; K.HOUSES.forEach(function(h){ h.acts.forEach(function(a){ a.house = h.id; K.ALL.push(a); }); });
})();
