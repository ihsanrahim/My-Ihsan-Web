/* My Ihsan 0.7.72 · Pet manager content: species, default care, health guides, adab, names. Strings are "Bahasa Melayu|English".
   Health text is general guidance for owners, not a vet diagnosis. Fiqh and hadith notes are pending ustaz review like the rest of the app. */
(function(){
var P = window.PetData = {};
// species: [emoji, name, weight band kg [min,max] or null, gestation/incubation days or 0, lifespan, phone-pet species]
P.SP = {
 cat:     ["🐈", "Kucing|Cat",            [3.5, 5.5],  65, "12–18 tahun|12–18 years", "cat"],
 bird:    ["🐦", "Burung|Bird",           [0.03, 0.6], 18, "5–20 tahun (ikut spesies)|5–20 years (by species)", "bird"],
 fish:    ["🐠", "Ikan|Fish",             null,        0,  "2–10 tahun|2–10 years", "fish"],
 rabbit:  ["🐇", "Arnab|Rabbit",          [1, 2.5],    31, "8–12 tahun|8–12 years", "cat"],
 hamster: ["🐹", "Hamster|Hamster",       [0.03, 0.2], 18, "2–3 tahun|2–3 years", "cat"],
 other:   ["🐾", "Lain-lain|Other",       null,        0,  "", "cat"]
};
P.ORDER = ["cat","bird","fish","rabbit","hamster","other"];
// default care tasks: [key, icon, "name", every N days, category] (category: care | health)
P.CARE = {
 cat:     [["water","💧","Tukar air|Fresh water",1,"care"],["litter","🧺","Kaut pasir|Scoop the litter",1,"care"],["litter2","🧽","Tukar semua pasir|Full litter change",14,"care"],["groom","🪮","Sikat bulu|Brush the coat",3,"care"],["nail","✂️","Potong kuku|Trim nails",21,"care"],["deworm","🪱","Ubat cacing|Deworming",90,"health"],["flea","🐜","Ubat kutu|Flea and tick",30,"health"]],
 bird:    [["water","💧","Tukar air|Fresh water",1,"care"],["seed","🌾","Isi bijirin|Top up seed",1,"care"],["paper","📰","Tukar alas sangkar|Change cage paper",2,"care"],["cage","🧽","Cuci sangkar|Clean the cage",7,"care"],["cuttle","🦴","Tukar tulang sotong|Replace cuttlebone",30,"care"],["nail","✂️","Semak kuku dan paruh|Check nails and beak",60,"health"]],
 fish:    [["feedf","🍤","Beri makan sedikit|Feed a pinch",1,"care"],["tankw","🪣","Tukar 20–25% air|Change 20–25% water",7,"care"],["test","🧪","Uji air (pH, ammonia)|Test the water (pH, ammonia)",7,"care"],["filter","🌀","Cuci penapis|Rinse the filter",30,"care"]],
 rabbit:  [["water","💧","Tukar air|Fresh water",1,"care"],["hay","🌿","Isi rumput kering|Top up hay",1,"care"],["cage","🧽","Cuci kandang|Clean the hutch",3,"care"],["groom","🪮","Sikat bulu|Brush the coat",3,"care"],["nail","✂️","Potong kuku|Trim nails",42,"care"],["teeth","🦷","Semak gigi|Check teeth",30,"health"]],
 hamster: [["water","💧","Tukar air|Fresh water",1,"care"],["food","🌰","Isi makanan|Top up food",1,"care"],["cage","🧽","Cuci sangkar|Clean the cage",7,"care"],["teeth","🦷","Semak gigi|Check teeth",30,"health"]],
 other:   [["water","💧","Tukar air|Fresh water",1,"care"],["clean","🧽","Bersihkan tempat|Clean its home",7,"care"]]
};
P.FOOD = {cat:"Makanan kucing|Cat food", bird:"Bijirin|Seed mix", fish:"Pelet ikan|Fish flakes", rabbit:"Pelet dan rumput|Pellets and hay", hamster:"Campuran bijirin|Seed mix", other:"Makanan|Food"};
P.MEALS = {cat:[["08:00","1/4 cawan|1/4 cup"],["19:00","1/4 cawan|1/4 cup"]], bird:[["08:00","1 sudu|1 spoon"]], fish:[["09:00","secubit|a pinch"]], rabbit:[["08:00","1/4 cawan pelet|1/4 cup pellets"],["18:00","sayur hijau|greens"]], hamster:[["19:00","1 sudu|1 spoon"]], other:[["08:00",""]]};
// kids' pet chores (Kids Planet stars when a parent approves)
P.CHORES = {cat:["Isi air|Refill the water","Beri makan|Give food","Sikat bulu|Brush the coat","Main 10 minit|Play 10 minutes"], bird:["Isi air|Refill the water","Isi bijirin|Top up seed","Bercakap dengan burung|Talk to the bird"], fish:["Beri makan secubit|Feed a pinch","Lihat ikan sihat|Check the fish look well"], rabbit:["Isi air|Refill the water","Beri rumput|Give hay","Sikat bulu|Brush the coat"], hamster:["Isi air|Refill the water","Isi makanan|Top up food"], other:["Isi air|Refill the water","Beri makan|Give food"]};

// ---------------- health ----------------
// symptom checker: [symptom, level 3 = vet now, 2 = call the vet today, 1 = watch at home, advice, species or ""]
P.SYM = [
 ["Tidak bernafas atau rebah|Not breathing or collapsed",3,"Pergi ke klinik kecemasan segera. Telefon dahulu dalam perjalanan.|Go to an emergency vet now. Call on the way.",""],
 ["Sawan (kejang)|A seizure (fit)",3,"Jauhkan barang keras, jangan pegang mulut, catat berapa lama. Ke doktor haiwan segera.|Move hard things away, do not touch the mouth, time it. See a vet now.",""],
 ["Pendarahan tidak berhenti|Bleeding that will not stop",3,"Tekan dengan kain bersih dan pergi ke klinik.|Press with a clean cloth and go to the vet.",""],
 ["Termakan racun atau ubat manusia|Ate poison or human medicine",3,"Jangan paksa muntah sendiri. Bawa bungkusan dan pergi segera.|Do not make it vomit yourself. Bring the packet and go now.",""],
 ["Tercungap-cungap kerana panas|Panting hard in the heat",3,"Pindah ke tempat teduh, basahkan dengan air sejuk (bukan ais), dan ke klinik.|Move to shade, wet with cool (not icy) water and go to the vet.",""],
 ["Kucing jantan meneran tetapi tiada air kencing|Male cat straining with no urine",3,"Ini mungkin saluran kencing tersumbat. Kecemasan.|This may be a blocked bladder. An emergency.","cat"],
 ["Arnab tidak makan atau tidak berak 12 jam|Rabbit not eating or pooping for 12 hours",3,"Usus arnab boleh berhenti. Hubungi doktor haiwan segera.|A rabbit's gut can stop. Call a vet now.","rabbit"],
 ["Muntah lebih 2 kali sehari|Vomiting more than twice in a day",2,"Tahan makanan beberapa jam, beri air sedikit-sedikit, hubungi klinik.|Hold food a few hours, offer small sips of water, call the vet.",""],
 ["Cirit-birit berdarah|Diarrhoea with blood",2,"Hubungi klinik hari ini.|Call the vet today.",""],
 ["Tidak makan lebih 24 jam|Not eating for over 24 hours",2,"Kucing tidak boleh berlapar lama. Hubungi klinik hari ini.|Cats must not go long without food. Call the vet today.",""],
 ["Burung kembang bulu dan mengantuk|Bird fluffed up and sleepy",2,"Burung menyorok sakit. Panaskan sangkar sedikit dan hubungi klinik.|Birds hide illness. Keep the cage warm and call the vet.","bird"],
 ["Mata merah, bengkak atau tertutup|Red, swollen or closed eye",2,"Jangan sapu ubat manusia. Hubungi klinik hari ini.|Do not use human eye drops. Call the vet today.",""],
 ["Tempang lebih sehari|Limping for more than a day",2,"Rehatkan dan semak tapak kaki. Klinik jika tidak baik.|Rest it and check the paw. Vet if it does not improve.",""],
 ["Ikan tercungap di permukaan|Fish gasping at the surface",2,"Uji air, tukar 25% air, pastikan pam udara berfungsi.|Test the water, change 25%, check the air pump.","fish"],
 ["Hamster ekor basah|Hamster with a wet tail",2,"Penyakit cirit-birit yang serius. Klinik hari ini.|A serious diarrhoea illness. Vet today.","hamster"],
 ["Bersin sekali-sekala, aktif dan makan|Sneezing now and then, active and eating",1,"Perhatikan 2–3 hari. Klinik jika ada lelehan pekat atau tidak makan.|Watch 2–3 days. Vet if thick discharge or not eating.",""],
 ["Menggaru lebih dari biasa|Scratching more than usual",1,"Semak kutu dan kulit merah. Ubat kutu jika sudah tiba masa.|Check for fleas and red skin. Flea treatment if due.",""],
 ["Minum dan kencing lebih banyak|Drinking and peeing a lot more",1,"Buat temujanji minggu ini untuk ujian darah.|Book a check this week for a blood test.",""],
 ["Berat turun tanpa sebab|Losing weight for no reason",1,"Timbang setiap minggu dan buat temujanji.|Weigh weekly and book a check-up.",""]
];
P.AID = [
 ["☠️","Keracunan|Poisoning","Alihkan haiwan dari punca. Simpan bungkusan atau tumbuhan. Jangan beri susu atau garam. Telefon klinik dan pergi segera.|Move the pet away from it. Keep the packet or plant. Do not give milk or salt. Call the vet and go now."],
 ["🌡️","Strok haba|Heatstroke","Bawa ke tempat teduh dan berkipas. Basahkan badan dengan air sejuk, bukan ais. Beri sedikit air. Ke klinik walaupun nampak pulih.|Shade and a fan. Wet the body with cool water, not ice. Small sips of water. See a vet even if it seems better."],
 ["🩸","Pendarahan|Bleeding","Tekan kuat dengan kain bersih 5 minit tanpa angkat. Balut longgar. Ke klinik jika dalam atau tidak berhenti.|Press firmly with a clean cloth for 5 minutes without lifting. Wrap loosely. Vet if deep or it will not stop."],
 ["😮‍💨","Tercekik|Choking","Buka mulut dengan berhati-hati; keluarkan objek jika nampak dengan mudah. Jangan tolak ke dalam. Terus ke klinik.|Open the mouth carefully; remove the object only if easy to reach. Never push it deeper. Go to the vet."],
 ["🔥","Melecur|Burns","Alirkan air sejuk 10 minit. Tutup dengan kain lembap bersih. Jangan sapu mentega atau ubat gigi.|Run cool water for 10 minutes. Cover with a clean damp cloth. No butter or toothpaste."],
 ["🦴","Patah atau cedera teruk|Broken bone or bad injury","Gerakkan sesedikit mungkin. Angkat dengan papan atau kotak dan tuala. Ke klinik.|Move it as little as possible. Carry on a board or in a box with a towel. Go to the vet."],
 ["⚡","Sawan|Seizure","Jauhkan objek, malapkan lampu, jangan pegang mulut. Catat masa. Lebih 3 minit = kecemasan.|Move objects away, dim lights, never touch the mouth. Time it. Over 3 minutes is an emergency."],
 ["👁️","Kecederaan mata|Eye injury","Jangan gosok atau sapu ubat. Basuh lembut dengan air garam steril jika ada pasir. Ke klinik.|Do not rub or add drops. Rinse gently with sterile saline if there is grit. See a vet."]
];
// toxic things: [name, kinds ("food" | "plant" | "home"), species list or "" for all, danger 3 high / 2 medium]
P.TOX = [
 ["Coklat|Chocolate","food","dog cat bird",3],["Bawang besar, bawang putih, daun bawang|Onion, garlic, leeks","food","cat dog",3],["Anggur dan kismis|Grapes and raisins","food","dog cat",3],
 ["Xylitol (gula-gula getah tanpa gula)|Xylitol (sugar-free gum)","food","dog",3],["Kafein (kopi, teh)|Caffeine (coffee, tea)","food","",3],["Avokado|Avocado","food","bird rabbit",3],
 ["Kacang macadamia|Macadamia nuts","food","dog",2],["Susu lembu|Cow's milk","food","cat",2],["Biji epal, biji ceri|Apple seeds, cherry pits","food","",2],["Garam berlebihan|Too much salt","food","",2],["Doh yis mentah|Raw yeast dough","food","dog cat",2],
 ["Bunga lili|Lilies","plant","cat",3],["Pokok sirih / money plant (pothos)|Money plant (pothos)","plant","cat dog",2],["Keladi bunga (dieffenbachia)|Dumb cane (dieffenbachia)","plant","cat dog",2],["Pokok sagu (sago palm)|Sago palm","plant","dog cat",3],
 ["Oleander (bunga jepun)|Oleander","plant","",3],["Lidah buaya|Aloe vera","plant","cat dog",2],["Poinsettia|Poinsettia","plant","cat dog",2],
 ["Paracetamol (Panadol)|Paracetamol (Panadol)","home","cat dog",3],["Ibuprofen|Ibuprofen","home","cat dog",3],["Ubat kutu anjing (permethrin) pada kucing|Dog flea products (permethrin) on cats","home","cat",3],
 ["Minyak pati (tea tree, eucalyptus)|Essential oils (tea tree, eucalyptus)","home","cat bird",3],["Asap kuali tidak melekat (Teflon) panas|Fumes from overheated non-stick pans","home","bird",3],["Peluntur dan pencuci lantai|Bleach and floor cleaners","home","",2],["Racun tikus dan lipas|Rat and cockroach poison","home","",3],["Ubat nyamuk bakar dekat sangkar|Mosquito coils near the cage","home","bird",2]
];
P.RECOVER = ["Pakai kon (cone) supaya tidak menjilat luka|Wear the cone so it cannot lick the wound","Semak luka 2 kali sehari: merah, bengkak, nanah?|Check the wound twice a day: red, swollen, pus?","Rehat dalam bilik kecil yang tenang 7–10 hari|Rest in a small quiet room for 7–10 days","Tiada lompat atau main kasar|No jumping or rough play","Beri ubat tahan sakit ikut arahan|Give the pain medicine as prescribed","Temujanji buka jahitan|Stitch removal appointment"];
P.TRAVEL = ["Bekas pembawa (carrier) yang selamat|A secure carrier","Makanan dan air untuk perjalanan|Food and water for the trip","Mangkuk lipat|A folding bowl","Ubat-ubatan|Medicines","Kad vaksin dan dokumen|Vaccine card and papers","Tuala atau selimut kesukaan|A favourite towel or blanket","Pasir dan dulang kecil (kucing)|Litter and a small tray (cats)","Beg plastik dan tisu|Bags and tissues","Nombor klinik di tempat dituju|A vet's number at your destination","Gambar terkini (jika hilang)|A recent photo (in case it gets lost)"];

// ---------------- adab & fiqh ----------------
P.ADAB = [
 ["Ganjaran untuk setiap makhluk|A reward for every living being","“Pada setiap makhluk bernyawa ada pahala (bila berbuat baik kepadanya).” (Bukhari)|“There is a reward for kindness to every living being.” (Bukhari)"],
 ["Wanita dan kucing|The woman and the cat","Seorang wanita diazab kerana mengurung kucing tanpa memberinya makan dan minum. (Bukhari dan Muslim)|A woman was punished for locking up a cat without food or water. (Bukhari and Muslim)"],
 ["Air untuk haiwan yang dahaga|Water for a thirsty animal","Seorang yang memberi minum kepada anjing yang dahaga diampunkan Allah. (Bukhari)|A person who gave water to a thirsty dog was forgiven by Allah. (Bukhari)"],
 ["Takutlah Allah tentang haiwan|Fear Allah about animals","“Bertakwalah kepada Allah tentang haiwan-haiwan yang tidak boleh berkata-kata ini.” (Abu Dawud)|“Fear Allah regarding these animals that cannot speak.” (Abu Dawud)"],
 ["Kembalikan anak burung|Return the chicks","Rasulullah ﷺ menyuruh anak burung dikembalikan kepada ibunya yang resah. (Abu Dawud)|The Prophet ﷺ told the companions to return the chicks to their distressed mother. (Abu Dawud)"],
 ["Jangan pukul muka|Never strike the face","Rasulullah ﷺ melarang memukul muka haiwan dan menyelarnya di muka. (Muslim)|The Prophet ﷺ forbade striking or branding an animal's face. (Muslim)"],
 ["Jangan jadikan sasaran|Not a target","Rasulullah ﷺ melarang menjadikan makhluk bernyawa sebagai sasaran. (Muslim)|The Prophet ﷺ forbade using a living creature as a target. (Muslim)"],
 ["Ihsan dalam semua perkara|Excellence in everything","“Allah mewajibkan ihsan dalam segala hal.” (Muslim)|“Allah has prescribed excellence (ihsan) in all things.” (Muslim)"],
 ["Abu Hurairah dan anak kucing|Abu Hurairah and the kitten","Nama Abu Hurairah bermaksud “bapa anak kucing” kerana dia menyayangi kucing kecilnya. (Tirmidhi)|Abu Hurairah means “father of the kitten”, because he loved his little cat. (Tirmidhi)"],
 ["Jangan bebankan|Do not overburden","Jangan muatkan haiwan melebihi kemampuannya dan berilah rehat. (Abu Dawud)|Do not load an animal beyond its strength, and let it rest. (Abu Dawud)"]
];
P.FIQH = [
 ["Kucing tidak najis|Cats are not impure","Rasulullah ﷺ bersabda tentang kucing: “Ia tidak najis, ia antara yang berlegar di sekeliling kamu.” Air bekas minumannya boleh digunakan untuk wuduk. (Abu Dawud, Tirmidhi)|The Prophet ﷺ said of cats: “It is not impure; it is one of those who go around among you.” Water it drank from may be used for wudu. (Abu Dawud, Tirmidhi)"],
 ["Bulu kucing di baju|Cat fur on clothes","Bulu kucing yang gugur tidak menghalang solat menurut kebanyakan ulama. Bersihkan jika banyak supaya kemas.|Most scholars say shed cat fur does not stop your prayer. Brush it off if there is a lot, to be tidy."],
 ["Anjing dalam mazhab Syafi'i|Dogs in the Shafi'i school","Air liur dan badan anjing yang basah ialah najis mughallazah. Basuh 7 kali, salah satunya dengan air bercampur tanah. (Muslim)|A dog's saliva and wet body are najis mughallazah. Wash 7 times, one of them with water mixed with soil. (Muslim)"],
 ["Memelihara anjing|Keeping a dog","Memelihara anjing dibenarkan untuk keperluan seperti menjaga rumah, ternakan atau berburu; selain itu pahala berkurang setiap hari. (Bukhari dan Muslim)|Keeping a dog is allowed for a need such as guarding, livestock or hunting; otherwise a person's reward decreases each day. (Bukhari and Muslim)"],
 ["Najis haiwan|Animal droppings","Najis kucing, burung dan haiwan lain ialah najis mutawassitah. Buang dan basuh sehingga hilang warna, bau dan rasa.|Droppings of cats, birds and other animals are najis mutawassitah. Remove them and wash until colour, smell and taste are gone."],
 ["Memandulkan haiwan|Neutering pets","Ramai ulama membenarkan memandulkan kucing untuk maslahah seperti kesihatan dan mengelak kucing terbiar. Rujuk ustaz untuk pandangan setempat.|Many scholars allow neutering cats for a benefit such as health and fewer strays. Ask your ustaz for local views."],
 ["Menjual dan membeli haiwan|Buying and selling pets","Sebahagian ulama memakruhkan jual beli kucing; mengambil kucing terbiar (adopt) adalah amalan yang baik.|Some scholars dislike selling cats; adopting a stray is a beautiful deed."]
];
P.QURBAN = [
 ["Haiwan yang sah|Which animals","Unta, lembu, kerbau, kambing dan biri-biri yang cukup umur dan tidak cacat (buta, tempang teruk, sangat kurus, sakit). Semak umur dengan pihak masjid.|Camel, cow, buffalo, goat and sheep of the right age with no defects (blind, badly lame, very thin, sick). Check ages with your masjid."],
 ["Jaga sebelum hari korban|Care before the day","Beri makan dan minum cukup, teduh, jangan diikat terlalu pendek.|Give enough food and water, shade, and do not tie it too short."],
 ["Jangan takutkan|Do not frighten it","Asah pisau jauh dari pandangan haiwan; jangan sembelih di depan haiwan lain. (Muslim: ihsan dalam sembelihan)|Sharpen the knife out of its sight; do not slaughter in front of other animals. (Muslim: excellence in slaughter)"],
 ["Selepas sembelihan|After slaughter","Tunggu haiwan benar-benar tidak bergerak sebelum melapah.|Wait until the animal is completely still before skinning."],
 ["Agihan daging|Sharing the meat","Daging dikongsi dengan keluarga, jiran dan yang memerlukan. Bukan daging atau darah yang sampai kepada Allah tetapi takwa (al-Hajj 22:37).|Meat is shared with family, neighbours and those in need. Not the meat or blood reaches Allah, but taqwa (al-Hajj 22:37)."]
];
P.GRIEF = [
 ["Sedih itu fitrah|Sadness is natural","Menangis kerana kehilangan haiwan kesayangan adalah tanda kasih sayang. Rasulullah ﷺ juga pernah menangis ketika kehilangan.|Crying for a beloved pet shows love. The Prophet ﷺ also wept at loss."],
 ["Doa ketika musibah|Dua in hardship","إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا “Sesungguhnya kami milik Allah dan kepada-Nya kami kembali. Ya Allah, berilah pahala atas musibahku dan gantikan dengan yang lebih baik.” (Muslim)|إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا “We belong to Allah and to Him we return. O Allah, reward me in my loss and give me something better.” (Muslim)"],
 ["Bercakap dengan anak|Talking to children","Terangkan dengan jujur dan lembut. Benarkan anak bertanya dan melukis gambar kenangan.|Explain honestly and gently. Let children ask questions and draw a memory picture."],
 ["Kebumikan dengan hormat|Bury with respect","Tanam di tempat yang dibenarkan, cukup dalam, jauh dari sumber air. Tanya pihak berkuasa tempatan jika di kawasan awam.|Bury where allowed, deep enough and away from water sources. Ask the local council for public land."],
 ["Kenang kebaikan|Remember the good","Tulis kenangan, simpan gambar, dan teruskan kebaikan dengan memberi makan haiwan terbiar.|Write memories, keep photos, and continue the kindness by feeding strays."]
];
// kids' pet-care quiz: [question, [options], answer index]
P.QUIZ = [
 ["Berapa kerap tukar air haiwan?|How often should a pet get fresh water?",["Setiap hari|Every day","Seminggu sekali|Once a week","Bila ingat|When I remember"],0],
 ["Makanan yang bahaya untuk kucing?|Which food is dangerous for cats?",["Bawang|Onion","Ayam rebus|Boiled chicken","Air|Water"],0],
 ["Kucing berasa takut. Kita...|A cat looks scared. We...",["Biarkan ia tenang|Let it calm down","Kejar ia|Chase it","Jerit|Shout"],0],
 ["Ikan perlukan air yang...|Fish need water that is...",["Bersih dan ditukar sedikit-sedikit|Clean and changed a little at a time","Sentiasa baru 100%|All new every time","Berkhlorin dari paip terus|Straight from the tap with chlorine"],0],
 ["Selepas bermain dengan haiwan kita...|After playing with a pet we...",["Basuh tangan|Wash our hands","Terus makan|Eat straight away","Gosok mata|Rub our eyes"],0],
 ["Arnab suka makan...|Rabbits love to eat...",["Rumput kering (hay)|Hay","Coklat|Chocolate","Gula-gula|Sweets"],0],
 ["Siapa yang menyayangi anak kucing sehingga digelar “bapa anak kucing”?|Who loved his kitten so much he was called “father of the kitten”?",["Abu Hurairah|Abu Hurairah","Abu Bakar|Abu Bakr","Umar|Umar"],0],
 ["Kenapa haiwan perlu vaksin?|Why do pets need vaccines?",["Supaya tidak dijangkiti penyakit|To protect them from illness","Supaya cantik|To look pretty","Tidak perlu|They do not"],0],
 ["Burung dalam sangkar perlukan...|A caged bird needs...",["Air, bijirin, ruang dan kawan bercakap|Water, seed, space and someone to talk to","Gelap sepanjang hari|Darkness all day","Muzik kuat|Loud noise"],0],
 ["Kita jumpa kucing terbiar yang lapar. Kita...|We find a hungry stray cat. We...",["Beri makan dan air dengan izin ibu bapa|Give food and water, with a parent's OK","Baling batu|Throw stones","Abaikan|Ignore it"],0]
];
// names: [name, language, meaning]
P.NAMES = [
 ["Oyen","Melayu","Kucing oren|An orange cat"],["Comel","Melayu","Cute|Cute"],["Tompok","Melayu","Bertompok|Spotted"],["Belang","Melayu","Berjalur|Striped"],["Gebu","Melayu","Lembut dan gebu|Soft and fluffy"],["Labu","Melayu","Labu|Pumpkin"],["Si Putih","Melayu","Si putih|Whitey"],["Bulus","Melayu","Bulat comel|Round and cute"],["Kiki","Melayu","Ceria|Cheerful"],["Manja","Melayu","Suka dimanja|Loves a cuddle"],
 ["Layla","Arab","Malam|Night"],["Noor","Arab","Cahaya|Light"],["Qamar","Arab","Bulan|Moon"],["Najmah","Arab","Bintang|Star"],["Asal","Arab","Madu|Honey"],["Sukkar","Arab","Gula|Sugar"],["Lulu","Arab","Mutiara|Pearl"],["Zaitun","Arab","Zaitun|Olive"],["Ward","Arab","Bunga mawar|Rose"],["Simsim","Arab","Bijan|Sesame"],
 ["Biscuit","English","Biskut|Biscuit"],["Pumpkin","English","Labu|Pumpkin"],["Pepper","English","Lada hitam|Pepper"],["Cloud","English","Awan|Cloud"],["Bubbles","English","Buih|Bubbles"],["Sunny","English","Cerah|Sunny"],["Peanut","English","Kacang|Peanut"],["Mango","English","Mangga|Mango"],["Mochi","English","Kuih mochi|Mochi"],["Tiny","English","Kecil|Tiny"]
];
// species info cards: [lifespan & size, diet, home, Malaysia tip]
P.INFO = {
 cat:["Hidup 12–18 tahun, 3.5–5.5 kg.|Lives 12–18 years, 3.5–5.5 kg.","Daging: makanan kucing lengkap, air bersih. Tiada susu lembu.|A meat eater: complete cat food and clean water. No cow's milk.","Dalam rumah lebih selamat; pasir, tempat memanjat, tempat bersembunyi.|Indoors is safer; litter, something to climb, somewhere to hide.","Vaksin teras setiap tahun; mandulkan untuk kurangkan kucing terbiar.|Core vaccines yearly; neutering means fewer strays."],
 bird:["Bajrigar 5–10 tahun; kakaktua boleh 40+ tahun.|Budgies 5–10 years; parrots can live 40+.","Bijirin, pelet, sayur hijau, buah; tiada avokado atau coklat.|Seed, pellets, greens, fruit; no avocado or chocolate.","Sangkar luas, bertenggek pelbagai saiz, mainan, dan masa keluar sangkar.|A roomy cage, perches of many sizes, toys and time out of the cage.","Jauhkan dari asap dapur dan ubat nyamuk.|Keep away from kitchen fumes and mosquito coils."],
 fish:["Ikan emas 10+ tahun jika dijaga; betta 2–4 tahun.|Goldfish 10+ years with good care; betta 2–4 years.","Pelet atau serpihan secubit, sekali atau dua kali sehari.|A pinch of pellets or flakes once or twice a day.","Akuarium cukup besar dengan penapis; jangan mangkuk kecil.|A big enough tank with a filter; not a tiny bowl.","Biarkan air paip 24 jam atau guna penyahklorin.|Leave tap water 24 hours or use a dechlorinator."],
 rabbit:["Hidup 8–12 tahun.|Lives 8–12 years.","80% rumput kering (hay), sayur hijau, sedikit pelet.|80% hay, leafy greens, a little pellet.","Kandang luas dan masa berlari setiap hari; sejuk, tidak panas.|A big pen and daily running time; cool, not hot.","Cuaca panas Malaysia berbahaya; guna kipas dan botol air beku.|Malaysian heat is risky; use a fan and a frozen water bottle."],
 hamster:["Hidup 2–3 tahun.|Lives 2–3 years.","Campuran bijirin hamster, sedikit sayur.|Hamster mix and a little veg.","Sangkar luas, roda yang padat, tempat sembunyi; seekor sahaja (Syrian).|Big cage, a solid wheel, hides; one per cage (Syrian).","Aktif waktu malam; letak sangkar jauh dari bilik tidur.|Active at night; keep the cage out of bedrooms."],
 other:["","","",""]
};
})();
