/* My Ihsan 0.7.44 · Pengakap: the full syllabus as lessons (P1–P8), each with a Three.js picture (uniform/learn3d.js) and 24 more quiz questions.
   Strings are "Bahasa Melayu|English". Content follows standard Scouting practice (Baden-Powell's Scouting for Boys, WOSM, common PPM training).
   Exact wording of the Promise and Law, ranks, badge names and ceremony drill differ by country and by handbook: always check the current PPM handbook. */
(function(){
var U = window.UA, M = {};
// section kinds: p (paragraph) · list · steps · rows (label → text) · morse
M.P1 = {d3:"salute", intro:"Dari satu kem percubaan 1907 kepada gerakan sedunia: kenali pengasas, Persetiaan, Undang-undang dan cara Pengakap memberi salam.|From one experimental camp in 1907 to a world movement: meet the founder, the Promise, the Law and how Scouts greet each other.", secs:[
 {h:"Baden-Powell (B-P)", list:[
  "Lahir 22 Februari 1857 di London; pegawai Tentera British.|Born 22 February 1857 in London; a British Army officer.",
  "Mempertahankan Mafeking (1899–1900) di Afrika Selatan. Bukunya Aids to Scouting (1899) mengajar kemahiran meninjau, dan dibaca ramai budak lelaki.|Defended Mafeking (1899–1900) in South Africa. His book Aids to Scouting (1899) taught scouting skills and was read by many boys.",
  "1907: kem percubaan di Pulau Brownsea dengan kira-kira 20 budak lelaki dari pelbagai latar belakang.|1907: an experimental camp on Brownsea Island with about 20 boys from different backgrounds.",
  "1908: Scouting for Boys diterbitkan; kumpulan Pengakap tumbuh pantas di seluruh dunia.|1908: Scouting for Boys was published; Scout troops spread fast around the world.",
  "1920: Jambori Sedunia pertama di Olympia, London; B-P dipilih sebagai Ketua Pengakap Dunia.|1920: the first World Jamboree at Olympia, London; B-P was acclaimed Chief Scout of the World.",
  "Meninggal 8 Januari 1941 di Kenya.|He died on 8 January 1941 in Kenya."]},
 {h:"Persetiaan (Janji)|The Promise", p:"Persetiaan Pengakap ada tiga bahagian: (1) menjalankan tugas kepada Tuhan, Raja dan negara; (2) menolong orang lain pada setiap masa; (3) mematuhi Undang-undang Pengakap. Hafal perkataan tepat daripada Buku Panduan PPM anda kerana peperiksaan menanda perkataannya.|The Scout Promise has three parts: (1) do my duty to God, the King and my country; (2) help other people at all times; (3) obey the Scout Law. Learn the exact words from your PPM handbook, because exams mark the wording."},
 {h:"Undang-undang Pengakap (sepuluh klasik)|The Scout Law (the classic ten)", steps:[
  "Pengakap boleh dipercayai.|A Scout is trustworthy.","Pengakap setia.|A Scout is loyal.","Pengakap berguna dan suka menolong.|A Scout is useful and helpful.","Pengakap sahabat kepada semua.|A Scout is a friend to all.","Pengakap sopan santun.|A Scout is courteous.","Pengakap menyayangi binatang.|A Scout is kind to animals.","Pengakap patuh.|A Scout obeys orders.","Pengakap periang dan tabah menghadapi kesukaran.|A Scout smiles and is cheerful under difficulties.","Pengakap berjimat cermat.|A Scout is thrifty.","Pengakap bersih fikiran, kata-kata dan perbuatan.|A Scout is clean in thought, word and deed."], n:"Susunan dan perkataan versi PPM boleh berbeza sedikit daripada versi asal B-P; ikut buku anda.|The order and wording of PPM's version may differ slightly from B-P's original; follow your handbook."},
 {h:"Cogankata, hormat dan jabat tangan|Motto, salute and handshake", rows:[
  ["Cogankata|Motto","Selalu Sedia = Be Prepared. Kanak-kanak: Buat Sebaik-baiknya = Do Your Best.|Selalu Sedia = Be Prepared. Cubs: Buat Sebaik-baiknya = Do Your Best."],
  ["Isyarat dan hormat|Sign and salute","Tangan kanan, tiga jari ke atas, ibu jari menutup jari kelingking; tiga jari = tiga bahagian Persetiaan.|Right hand, three fingers up, the thumb over the little finger; three fingers = the three parts of the Promise."],
  ["Jabat tangan|Handshake","Tangan kiri, kerana tangan kiri memegang perisai: menghulur tangan kiri bermakna percaya dan tidak berlawan (B-P belajar adat ini daripada pahlawan Ashanti).|The left hand, because the left hand held the shield: offering it shows trust and peace (B-P learned the custom from Ashanti warriors)."],
  ["Budi baik|Good turn","Satu perbuatan baik setiap hari, tanpa mengharap balasan.|One good deed every day, without expecting a reward."]]},
 {h:"Seksyen dan perkembangan|Sections and progression", rows:[
  ["Kanak-kanak|Cubs","Sekitar 9–12 tahun. Keris Gangsa → Perak → Emas; anugerah tertinggi Keris Emas.|About 9–12 years. Keris Gangsa → Perak → Emas; top award Keris Emas."],
  ["Muda|Scouts","Tingkatan 1–3. Lencana Usaha → Maju → Jaya; anugerah tertinggi Rambu.|Form 1–3. Lencana Usaha → Maju → Jaya; top award Rambu."],
  ["Remaja|Senior Scouts","Tingkatan 4–5. Lencana kemahiran dan khidmat; anugerah tertinggi Pengakap Raja.|Form 4–5. Proficiency and service badges; top award Pengakap Raja (King's Scout)."],
  ["Kelana|Rovers","18–25 tahun, selepas sekolah: latihan dan projek khidmat.|18–25 years, after school: training and service projects."]], n:"Nama dan umur boleh berbeza mengikut negeri dan sekolah; sahkan dengan pemimpin anda.|Names and ages can differ by state and school; confirm with your leader."},
 {h:"Pergerakan sedunia|The world movement", p:"Pertubuhan Pengakap Sedunia (WOSM) menghubungkan Pengakap di lebih 170 negara dan wilayah. Persekutuan Pengakap Malaysia (PPM) ialah ahli Malaysia. Hari Pengasas (Thinking Day) ialah 22 Februari.|The World Organization of the Scout Movement (WOSM) links Scouts in more than 170 countries and territories. Persekutuan Pengakap Malaysia (PPM) is Malaysia's member. Founder's Day (Thinking Day) is 22 February."}]};

M.P2 = {d3:"knots", intro:"Bahagian tali, simpulan paling berguna, dan tiga ikatan untuk membina gajet. Latih dengan tali sebenar; model 3D membantu anda faham langkah.|The parts of a rope, the most useful knots, and three lashings for building gadgets. Practise with a real rope; the 3D model helps you see the steps.", secs:[
 {h:"Bahagian tali|Parts of a rope", rows:[
  ["Bahagian tetap|Standing part","Bahagian tali yang tidak digunakan untuk membuat simpulan.|The long part of the rope that is not used in tying."],
  ["Hujung kerja|Working end","Hujung yang anda gunakan untuk membuat simpulan.|The end you use to make the knot."],
  ["Gelung (bight)|Bight","Lengkungan tali yang tidak bersilang sendiri.|A curve in the rope that does not cross itself."],
  ["Lilitan, lilitan bulat|Turn, round turn","Satu lilitan penuh mengelilingi tiang; dua lilitan = round turn.|One pass round a pole; two passes = a round turn."],
  ["Separuh simpul|Half hitch","Hujung kerja melilit bahagian tetap sekali.|The working end goes once round the standing part."]]},
 {h:"Simpul Buku Sila (reef knot)", p:"Guna: menyambung dua tali sama tebal, mengikat balutan. Bukan untuk beban penting.|Use: joining two ropes of equal thickness, tying bandages. Not for critical loads.", steps:["Kanan di atas kiri, kemudian bawah.|Right end over left, and under.","Kiri di atas kanan, kemudian bawah.|Left end over right, and under.","Tarik rapat. Setiap tali keluar di sebelah yang sama.|Pull tight. Each rope's two ends come out on the same side."], n:"Jika hujung bersilang menjadi simpul nenek (granny) yang tergelincir.|If the ends cross it is a granny knot, which slips."},
 {h:"Bunga Geti (sheet bend)", p:"Guna: menyambung tali tidak sama tebal. Tali tebal membuat gelung.|Use: joining ropes of different thickness. The thicker rope makes the bight.", steps:["Buat gelung pada tali tebal.|Make a bight in the thicker rope.","Tali nipis naik melalui gelung dari bawah.|Pass the thinner rope up through the bight.","Lilit di belakang kedua-dua bahagian gelung, kemudian selit di bawah dirinya sendiri.|Take it round behind both parts of the bight, then tuck it under itself.","Tarik rapat; untuk keselamatan lebih, buat dua lilitan.|Pull tight; for more security make two turns (double sheet bend)."]},
 {h:"Simpul Manuk (clove hitch)", p:"Guna: memulakan dan menamatkan ikatan, mengikat tali pada tiang.|Use: starting and finishing lashings, tying a rope to a pole.", steps:["Lilit sekali mengelilingi tiang.|Take one turn round the pole.","Lilit kali kedua dan silangkan di atas lilitan pertama.|Take a second turn, crossing over the first.","Selit hujung di bawah lilitan kedua.|Tuck the end under the second turn.","Tarik kedua-dua hujung rapat.|Pull both ends tight."]},
 {h:"Tindih Kasih (bowline)", p:"Guna: gelung yang tidak tergelincir dan mudah dibuka; menyelamat. Terkenal sebagai cerita arnab.|Use: a loop that does not slip and is easy to untie; rescue. Remembered by the rabbit story.", steps:["Buat gelung kecil (lubang) pada bahagian tetap.|Make a small loop (the hole) in the standing part.","Hujung kerja (arnab) keluar dari lubang.|The working end (the rabbit) comes up through the hole.","Pusing di belakang bahagian tetap (pokok).|It goes round behind the standing part (the tree).","Turun semula ke dalam lubang; tarik rapat.|Back down the hole; pull tight."]},
 {h:"Simpul lain|Other knots", rows:[
  ["Lilit Dua Simpul|Round turn and two half hitches","Satu lilitan bulat pada tiang, kemudian dua separuh simpul pada bahagian tetap; tahan beban.|A round turn on the post, then two half hitches round the standing part; holds a load."],
  ["Lilit Balak|Timber hitch","Lilit hujung pada kayu, bawa mengelilingi bahagian tetap, pintal sekurang-kurangnya tiga kali; untuk menarik kayu dan memulakan ikatan serong.|Pass the end round the log, round the standing part, twist it at least three times; for dragging logs and starting a diagonal lashing."],
  ["Simpul Pulih|Sheepshank","Memendekkan tali tanpa memotong: dua gelung bertindih, separuh simpul pada setiap hujung. Bukan untuk beban berat.|Shortens a rope without cutting: two overlapping bights with a half hitch on each end. Not for heavy loads."],
  ["Ikatan hujung (whipping)|Whipping","Letak gelung benang sepanjang tali, lilit rapat ke arah hujung, selit hujung melalui gelung, tarik hujung satu lagi supaya gelung masuk di bawah lilitan, kemudian potong.|Lay a loop of twine along the rope, wind tight turns towards the end, pass the end through the loop, pull the other end to draw the loop under the turns, then trim."]]},
 {h:"Ikatan (lashing)|Lashings", rows:[
  ["Ikat Seraya (square)|Square","Dua tiang bersilang 90°. Mula dengan simpul manuk pada tiang tegak tepat di bawah tiang melintang; lilit 3–4 kali mengelilingi kedua-dua tiang; 2–3 lilitan frapping di antara tiang; tamat dengan simpul manuk pada tiang melintang. Untuk meja, rangka, pintu pagar.|Two poles crossing at 90°. Start with a clove hitch on the upright just under the crossbar; make 3–4 wraps round both poles; 2–3 frapping turns between the poles; finish with a clove hitch on the crossbar. For tables, frames, gates."],
  ["Ikat Serong (diagonal)|Diagonal","Dua tiang bersilang pada sudut lain, untuk menahan rangka. Mula dengan simpul ikat balak mengelilingi kedua-dua tiang; 3 lilitan satu arah dan 3 lilitan arah silang; frapping; tamat dengan simpul manuk.|Two poles crossing at another angle, for bracing a frame. Start with a timber hitch round both poles; 3 wraps one way and 3 the other way; frapping; finish with a clove hitch."],
  ["Ikat Silang Gunting (shear)|Shear","Dua tiang berdampingan: mula dengan simpul manuk pada satu tiang, lilit kira-kira 8 kali, 2 lilitan frapping, tamat dengan simpul manuk; kemudian buka kaki menjadi bentuk A (tripod/menara).|Two poles side by side: a clove hitch on one pole, about 8 wraps, 2 frapping turns, finish with a clove hitch; then open the legs into an A-frame (tripod or tower)."]], n:"Keselamatan: periksa setiap simpulan sebelum guna, jangan melebihi beban gajet, dan jangan panjat gajet tanpa pengawasan dan batas tinggi yang ditetapkan.|Safety: check every knot before use, never exceed the load, and never climb a gadget without supervision and the set height limit."}]};

M.P3 = {d3:"flag", intro:"Kawad asas, upacara bendera, dan cara merancang program unggun api.|Basic drill, flag ceremony, and how to plan a campfire programme.", secs:[
 {h:"Bentuk dan arahan asas|Basic formations and commands", list:[
  "Patrol berbaris sebaris atau dua baris; ketua patrol di hadapan kanan.|A patrol falls in in one or two lines, the patrol leader at the front right.",
  "Sedia: berdiri tegak, tumit rapat, pandang depan. Senang diri: kaki kiri keluar sedikit, tangan di belakang.|Sedia: stand to attention, heels together, eyes front. Senang diri: left foot out a little, hands behind the back.",
  "Kumpulan (troop) berbaris dalam bentuk ladam kuda (horseshoe) untuk membuka dan menutup upacara, supaya semua nampak bendera dan pemimpin.|The troop forms a horseshoe to open and close a ceremony, so everyone can see the flag and the leader.",
  "Dalam upacara, Pengakap memberi hormat Pengakap (tiga jari) apabila berpakaian seragam dan tidak memakai topi, atau menurut manual unit.|In ceremony, Scouts give the Scout salute (three fingers) in uniform; follow your unit's manual for hats and details."]},
 {h:"Upacara bendera|Flag ceremony", steps:[
  "Patrol atau pengawal bendera tiba, berbaris dan memeriksa tali serta bendera.|The flag party arrives, forms up and checks the halyard and flag.",
  "Semua berdiri sedia; bendera dinaikkan dengan pantas dan ceria semasa Negaraku, semua memberi hormat.|Everyone stands to attention; the flag is raised briskly while Negaraku plays, everyone saluting.",
  "Bendera diturunkan dengan perlahan dan penuh hormat, tidak menyentuh tanah, kemudian dilipat dengan betul.|The flag is lowered slowly and with respect, never touching the ground, then folded correctly.",
  "Pemimpin membubarkan upacara.|The leader dismisses the ceremony."], n:"Ikut protokol Jalur Gemilang dan manual unit anda untuk butiran.|Follow the Jalur Gemilang protocol and your unit's manual for details."},
 {h:"Program unggun api (campfire)|Campfire programme", list:[
  "Mulakan dengan upacara menyalakan api yang pendek dan selamat.|Open with a short, safe fire-lighting ceremony.",
  "Susunan: nyanyian bertenaga → yel → persembahan pendek (drama) → cerita → lagu perlahan → penutup yang tenang.|Order: lively songs → yells → short skits → a story → quiet songs → a calm closing.",
  "Tenaga bermula tinggi dan menurun perlahan supaya peserta bersedia tidur.|Energy starts high and winds down gently so everyone is ready for bed.",
  "Selamat: bulatan api jelas, baldi air dan penjaga api; padamkan sehingga sejuk.|Safe: a clear fire circle, a water bucket and a fire marshal; put out until cold."]}]};

M.P4 = {d3:"contour", intro:"Mengenal peta dan kompas: arah, bearing, rujukan grid, kontur dan merancang laluan.|Learn the map and compass: directions, bearings, grid references, contours and route planning.", secs:[
 {h:"16 arah kompas|The 16 compass points", rows:[
  ["Utara · Timur · Selatan · Barat|N · E · S · W","0° · 90° · 180° · 270°"],
  ["Timur Laut · Tenggara · Barat Daya · Barat Laut|NE · SE · SW · NW","45° · 135° · 225° · 315°"],
  ["Antara-antara (contoh: UTL, TTL)|Between (e.g. NNE, ENE)","22.5° · 67.5° · 112.5° … setiap 22.5°|22.5° · 67.5° · 112.5° … every 22.5°"]]},
 {h:"Bahagian kompas|Parts of a compass", list:[
  "Plat dasar (baseplate) dengan anak panah arah perjalanan.|The baseplate with the direction-of-travel arrow.",
  "Perumah (housing) berskala 0–360° yang boleh diputar.|The rotating housing marked 0–360°.",
  "Jarum magnet: hujung merah menunjuk utara magnet.|The magnetic needle: the red end points to magnetic north.",
  "Anak panah orientasi dan garisan indeks untuk membaca bearing.|The orienting arrow and the index line, used to read the bearing."]},
 {h:"Mengambil dan mengikut bearing|Taking and following a bearing", steps:[
  "Pegang kompas rata di depan perut, anak panah perjalanan menghala ke sasaran.|Hold the compass flat in front of you, the travel arrow pointing at the target.",
  "Putar perumah sehingga anak panah orientasi selari dengan jarum (merah dalam 'rumah').|Turn the housing until the orienting arrow lines up with the needle (red 'in the shed').",
  "Baca bearing pada garisan indeks.|Read the bearing at the index line.",
  "Untuk mengikut: tetapkan bearing, putar badan sehingga jarum sejajar, jalan menghala ke arah anak panah.|To follow: set the bearing, turn your body until the needle lines up, walk the way the travel arrow points.",
  "Bearing balik: tambah 180° jika kurang 180°, tolak 180° jika lebih.|Back bearing: add 180° if the bearing is under 180°, subtract 180° if it is over."], n:"Contoh: bearing 60° → bearing balik 240°. Jauhkan kompas daripada besi dan telefon.|Example: bearing 60° → back bearing 240°. Keep the compass away from metal and phones."},
 {h:"Tiga utara|Three norths", list:[
  "Utara benar: ke Kutub Utara geografi.|True north: toward the geographic North Pole.",
  "Utara magnet: arah jarum kompas; sisihan magnet di Malaysia sangat kecil (kira-kira 0–1°), tetapi semak peta anda.|Magnetic north: where the needle points; the magnetic variation in Malaysia is very small (about 0–1°), but check your map.",
  "Utara grid: garis menegak pada peta.|Grid north: the vertical grid lines on the map."]},
 {h:"Membaca peta|Reading the map", rows:[
  ["Skala|Scale","1:50 000 bermakna 1 cm di peta = 500 m sebenar; 2 cm = 1 km.|1:50,000 means 1 cm on the map = 500 m on the ground; 2 cm = 1 km."],
  ["Warna|Colours","Biru = air; hijau = tumbuhan; coklat = kontur; hitam = jalan dan bangunan; merah = jalan utama (biasa).|Blue = water; green = vegetation; brown = contours; black = roads and buildings; red = main roads (usual)."],
  ["Kontur|Contours","Garis menyambung tempat yang sama tinggi. Garis rapat = curam, garis jarang = landai; bulatan dalam bulatan = bukit.|Lines joining places of equal height. Close lines = steep, wide apart = gentle; rings within rings = a hill."],
  ["Rujukan grid 6 angka|6-figure grid reference","Baca garisan timuran (kiri → kanan) dahulu, kemudian garisan utaraan (bawah → atas): 'sepanjang koridor, naik tangga'. Anggar persepuluh dalam petak.|Read the eastings (left → right) first, then the northings (bottom → top): 'along the corridor, up the stairs'. Estimate the tenths inside the square."]]},
 {h:"Merancang laluan hiking|Planning a hike", list:[
  "Kad laluan: titik mula, titik pemeriksaan, bearing, jarak, anggaran masa, titik keluar kecemasan.|Route card: start, checkpoints, bearings, distances, estimated times, emergency exits.",
  "Peraturan Naismith: 5 km sejam, tambah 1 jam bagi setiap 600 m pendakian.|Naismith's rule: 5 km per hour, plus 1 hour for every 600 m of ascent.",
  "Beritahu orang dewasa laluan dan masa pulang; sentiasa dalam kumpulan (sistem rakan).|Tell an adult your route and return time; always stay in a group (buddy system).",
  "Bawa air, makanan ringan, wisel, kit pertolongan cemas, pakaian hujan, torch, peta dan kompas.|Carry water, snacks, a whistle, a first-aid kit, rain gear, a torch, the map and compass."]}]};

M.P5 = {d3:"camp", intro:"Dari senarai kit hingga tapak kem, khemah, api, memasak dan tidak meninggalkan kesan.|From kit list to campsite, tent, fire, cooking and leaving no trace.", secs:[
 {h:"Kit peribadi|Personal kit", list:[
  "Botol air, torch (dengan bateri ganti), wisel, kit pertolongan cemas kecil.|Water bottle, torch (spare batteries), whistle, small first-aid kit.",
  "Beg tidur, tikar tanah, pakaian ganti kering, pakaian hujan, kasut kukuh.|Sleeping bag, ground mat, dry spare clothes, rain gear, sturdy shoes.",
  "Mess tin, cawan, sudu, alatan mandi, tuala, topi dan pelindung matahari.|Mess tin, cup, spoon, toiletries, towel, hat and sun protection.",
  "Patrol: khemah, tali, pasak, kapak/gergaji (hanya dengan latihan), periuk, kit pertolongan cemas patrol.|Patrol: tents, ropes, pegs, axe/saw (only when trained), cooking pots, patrol first-aid kit."]},
 {h:"Memilih tapak kem|Choosing a campsite", list:[
  "Tanah rata dan tersalir baik; jauh dari lembah sungai yang boleh banjir.|Flat, well-drained ground; away from flood-prone riverbeds.",
  "Dekat air bersih tetapi tidak di tebing; terlindung dari angin kuat.|Near clean water but not on the bank; sheltered from strong wind.",
  "Jauh dari dahan mati, pokok tinggi tunggal, sarang semut dan lorong binatang.|Clear of dead branches, lone tall trees, ant nests and animal trails.",
  "Tandas jauh dari sumber air (sekurang-kurangnya kira-kira 30 m) dan di bawah arah angin dari dapur.|Latrines well away from the water source (at least about 30 m) and downwind of the kitchen."]},
 {h:"Bahagian dan mendirikan khemah|Tent parts and pitching", rows:[
  ["Bahagian|Parts","Lapisan luar (flysheet), lapisan dalam, alas tanah (groundsheet), tiang, tali penegang (guy ropes), pasak.|Flysheet, inner tent, groundsheet, poles, guy ropes, pegs."],
  ["Mendirikan|Pitching","Bersihkan tanah dari batu; hamparkan alas; pasang tiang; tegangkan tali dan pasak pada sudut 45° menjauhi khemah; pintu membelakangi angin.|Clear stones; lay the groundsheet; assemble the poles; stake the guy ropes at about 45° away from the tent; door away from the wind."],
  ["Mengemas|Striking","Keringkan sebelum dilipat; keluarkan pasak, cuci dan kira; lipat dan simpan dalam beg.|Dry it before packing; remove, clean and count the pegs; fold and bag it."]]},
 {h:"Api dan keselamatan api|Fires and fire safety", rows:[
  ["Teepee","Kayu bersandar membentuk kon: nyala cepat dan panas.|Sticks leaning in a cone: quick, hot flame."],
  ["Log cabin (pondok kayu)|Log cabin","Kayu disusun segi empat bertingkat: bara stabil untuk memasak.|Logs stacked in a square: steady coals for cooking."],
  ["Bintang|Star","Kayu memancar dari tengah, ditolak ke dalam perlahan: api kecil, tahan lama.|Logs radiating from the centre, pushed in slowly: a small, long-lasting fire."]],
  list:["Bersihkan bulatan kira-kira 3 m; baldi air dan penjaga api sentiasa ada; jangan tinggalkan api.|Clear a circle of about 3 m; keep a water bucket and a fire marshal; never leave a fire unattended.","Padamkan: siram, kacau, rasa dengan belakang tangan sehingga sejuk.|Put out: drown, stir, feel with the back of your hand until cold."]},
 {h:"Memasak dan kebersihan|Cooking and hygiene", list:[
  "Cuci tangan sebelum menyentuh makanan; pisahkan daging mentah dan makanan siap.|Wash hands before touching food; keep raw meat apart from cooked food.",
  "Masak sehingga masak benar; simpan makanan tertutup dan jauh dari binatang.|Cook food thoroughly; store food covered and away from animals.",
  "Air minum: air paip, dimasak atau ditapis; cuci pinggan dengan air panas dan keringkan.|Drinking water: tap water, boiled or filtered; wash dishes in hot water and let them dry.",
  "Pastikan makanan halal dan keperluan diet ahli diambil kira.|Make sure food is halal and members' dietary needs are respected."]},
 {h:"Tidak meninggalkan kesan (7 prinsip)|Leave No Trace (7 principles)", steps:["Rancang dan bersedia.|Plan ahead and prepare.","Berkhemah dan berjalan di permukaan yang kukuh.|Travel and camp on durable surfaces.","Buang sampah dengan betul.|Dispose of waste properly.","Biarkan apa yang anda temui.|Leave what you find.","Kurangkan kesan api.|Minimise campfire impacts.","Hormati hidupan liar.|Respect wildlife.","Bertimbang rasa terhadap pengunjung lain.|Be considerate of other visitors."]}]};

M.P6 = {d3:"signs", intro:"Tanda jejak, Morse, isyarat dan permainan besar yang melatih pemerhatian dan kerja berkumpulan.|Tracking signs, Morse, signalling and wide games that train observation and teamwork.", secs:[
 {h:"Tanda jejak|Tracking signs", rows:[
  ["➡️ Anak panah|Arrow","Ikut arah ini.|Go this way."],["✖️ Silang|Cross","Jangan ikut arah ini.|Not this way."],["⭕ Bulatan bertitik|Circle with a dot","Sudah pulang / tamat.|Gone home / end of trail."],["③ Tiga batu|Three stones","Mesej tersembunyi berdekatan.|A message is hidden nearby."]], n:"Buat tanda dengan ranting, batu atau rumput; jangan merosakkan alam; kutip semula selepas permainan.|Make signs with twigs, stones or grass; don't damage nature; pick them up after the game."},
 {h:"Kod Morse|Morse code", morse:true, p:"Titik = unit pendek; garis = tiga unit. Jarak antara huruf = tiga unit; antara perkataan = tujuh unit. Boleh dihantar dengan torch, wisel atau bunyi. SOS = ··· −−− ···.|A dot is one short unit; a dash is three units. The gap between letters is three units; between words, seven. Send it with a torch, whistle or sound. SOS = ··· −−− ···."},
 {h:"Semaphore dan wisel|Semaphore and whistle", p:"Semaphore menggunakan dua bendera yang dipegang pada lengan terbentang; kedudukan lengan pada sudut 45° menentukan huruf. Pelajari jadual lengkap daripada buku PPM dan latih dengan rakan.|Semaphore uses two flags held at arm's length; the arm positions in 45° steps stand for letters. Learn the full chart from your PPM book and practise with a partner.", list:["Wisel: satu tiupan panjang = perhatian; tiga tiupan = minta bantuan (ulang).|Whistle: one long blast = attention; three blasts = help (repeat)."]},
 {h:"Pemerhatian dan permainan besar|Observation and wide games", list:[
  "Permainan Kim: lihat 15–20 barang selama 1 minit, tutup, ingat sebanyak mungkin.|Kim's game: look at 15–20 items for a minute, cover them, recall as many as you can.",
  "Permainan besar (contoh: menawan bendera, mengintip): peraturan jelas, sempadan, kawasan selamat, wisel berhenti.|Wide games (e.g. capture the flag, stalking): clear rules, boundaries, safe areas, a stop whistle.",
  "Keselamatan: sistem rakan, tiada tempat berbahaya, air minum, pemimpin dewasa memantau.|Safety: buddy system, no dangerous places, drinking water, adult leaders supervising."]}]};

M.P7 = {d3:"aid", intro:"Pertolongan cemas untuk Pengakap: bertindak tenang, selamatkan diri dahulu, panggil bantuan dan beri rawatan asas. Ini sokongan, bukan pengganti kursus bertauliah.|First aid for Scouts: stay calm, keep yourself safe, call for help and give basic care. This supports, and does not replace, a certified course.", secs:[
 {h:"DRSABC", steps:["Danger (bahaya): periksa tempat untuk anda dan mangsa.|Danger: check the scene for you and the casualty.","Response (respons): tepuk bahu dan panggil kuat.|Response: tap the shoulders and shout.","Send for help (hubungi bantuan): 999 atau 112, minta AED.|Send for help: 999 or 112, ask for an AED.","Airway (saluran udara): dongakkan kepala, angkat dagu.|Airway: tilt the head, lift the chin.","Breathing (pernafasan): lihat dada sehingga 10 saat.|Breathing: look at the chest for up to 10 seconds.","CPR: 30 tekanan : 2 nafas, 100–120 seminit, 5–6 cm dalam.|CPR: 30 compressions : 2 breaths, 100–120 per minute, 5–6 cm deep."]},
 {h:"Posisi pemulihan|Recovery position", p:"Untuk mangsa tidak sedar yang bernafas normal.|For an unconscious casualty who is breathing normally.", steps:["Melutut di sisi mangsa; letakkan lengan paling dekat pada sudut tepat.|Kneel beside the casualty; place the nearer arm at a right angle.","Silangkan lengan jauh di dada, letakkan belakang tangan pada pipi.|Bring the far arm across the chest, back of the hand against the cheek.","Bengkokkan lutut jauh dan tarik mangsa mengiring ke arah anda.|Bend the far knee and roll the casualty towards you.","Laraskan kaki atas supaya stabil; condongkan kepala untuk memastikan saluran udara; pantau pernafasan sehingga bantuan tiba.|Adjust the upper leg for stability; tilt the head to keep the airway open; monitor breathing until help arrives."]},
 {h:"Luka dan lecur|Wounds and burns", rows:[
  ["Pendarahan|Bleeding","Pakai sarung tangan, tekan kuat terus, tambah pad di atas, minta bantuan. Jangan cabut objek tertanam.|Wear gloves, press firmly and directly, add pads on top, call for help. Never remove an embedded object."],
  ["Lecur|Burns","Sejukkan di bawah air mengalir 20 minit, tutup longgar dengan bungkus plastik. Jangan guna ais, mentega atau ubat gigi.|Cool under running water for 20 minutes, cover loosely with cling film. Do not use ice, butter or toothpaste."],
  ["Luka kecil|Minor cuts","Basuh tangan, bersihkan dengan air bersih, tutup dengan plaster atau pembalut bersih.|Wash your hands, rinse with clean water, cover with a plaster or clean dressing."]]},
 {h:"Terseliuh, patah dan anduh|Sprains, fractures and slings", rows:[
  ["RICE","Rest (rehat), Ice (ais berbalut), Compression (tekanan), Elevation (angkat).|Rest, Ice (wrapped), Compression, Elevation."],
  ["Patah|Fracture","Sokong pada kedudukan asal, tetapkan, minta bantuan. Jangan cuba luruskan.|Support it as found, immobilise, get help. Do not try to straighten it."],
  ["Anduh (anduh segi tiga)|Triangular bandage","Bahagian: tapak (base), hujung (point), dua hujung ikat. Anduh lengan: letakkan anduh di bawah lengan, bawa hujung atas ke bahu, ikat dengan simpul buku sila di sisi leher.|Parts: base, point, two ends. Arm sling: place the bandage under the arm, bring the upper end over the shoulder, tie with a reef knot at the side of the neck."]]},
 {h:"Tercekik dan sakit akibat panas|Choking and heat illness", rows:[
  ["Tercekik (dewasa)|Choking (adult)","Galak batuk → 5 tepukan belakang → 5 tujahan perut, ulang; jika tidak sedar, mula CPR.|Encourage coughing → 5 back blows → 5 abdominal thrusts, repeat; if unresponsive, start CPR."],
  ["Panas|Heat","Teduh, air sejuk pada kulit, teguk kecil jika sedar; 999 jika keliru.|Shade, cool water on the skin, small sips if conscious; 999 if confused."]]}]};

M.P8 = {d3:"patrol", intro:"Pengakap belajar memimpin melalui sistem patrol, berbuat baik, dan merancang projek khidmat.|Scouts learn to lead through the patrol system, do good turns and plan service projects.", secs:[
 {h:"Sistem patrol|The patrol system", p:"Satu patrol terdiri daripada kira-kira 6–8 Pengakap. Setiap patrol ada nama, bendera dan pemimpin sendiri. Beberapa patrol membentuk satu Kumpulan (troop).|A patrol is about 6–8 Scouts, each patrol with its own name, flag and leader. Several patrols make a troop.", rows:[
  ["Ketua Patrol (KP)|Patrol Leader (PL)","Merancang, membahagi tugas, mewakili patrol dalam Majlis Ketua Patrol.|Plans, shares out the work, represents the patrol at the Court of Honour."],
  ["Penolong Ketua Patrol (PKP)|Assistant PL (APL)","Membantu PL dan memimpin apabila PL tiada.|Helps the PL and leads when the PL is away."],
  ["Setiausaha|Scribe","Menulis buku log dan minit.|Keeps the logbook and minutes."],
  ["Bendahari|Treasurer","Menyimpan dana patrol dengan catatan jelas.|Looks after the patrol fund with clear records."],
  ["Pengurus kit|Quartermaster","Menjaga dan memeriksa peralatan.|Looks after and checks the equipment."],
  ["Pembantu pertolongan cemas|First-aider","Membawa kit pertolongan cemas patrol.|Carries the patrol first-aid kit."]], n:"Nama jawatan boleh berbeza mengikut kumpulan.|Role names can differ between troops."},
 {h:"Majlis Ketua Patrol|The Court of Honour", p:"Ketua-ketua patrol bersama Pemimpin Pengakap berbincang merancang program, menyelesaikan masalah dan menilai aktiviti.|The patrol leaders, with the troop leader, meet to plan the programme, solve problems and review activities."},
 {h:"Diari budi baik|Good turn diary", list:[
  "Catat setiap hari: apa yang dibuat, untuk siapa, apa yang dipelajari.|Write each day: what you did, for whom, and what you learned.",
  "Budi baik kecil (membantu keluarga, jiran) dan besar (projek komuniti) sama bernilai.|Small good turns (helping family, neighbours) and big ones (community projects) both count.",
  "Niat yang ikhlas: tanpa mengharap upah atau pujian.|A sincere intention: without expecting pay or praise."]},
 {h:"Merancang projek khidmat|Planning a service project", steps:[
  "Kenal pasti keperluan: tanya komuniti apa yang diperlukan.|Find the need: ask the community what is needed.",
  "Rancang: matlamat, siapa, bila, di mana, belanjawan, risiko.|Plan: goal, who, when, where, budget, risks.",
  "Dapatkan kebenaran pemimpin, sekolah dan pihak berkaitan.|Get permission from leaders, the school and the people concerned.",
  "Laksanakan dengan keselamatan: sistem rakan, penyeliaan dewasa.|Carry it out safely: buddy system, adult supervision.",
  "Nilai dan renung: apa yang berjaya, apa yang boleh diperbaiki; ucap terima kasih.|Review and reflect: what worked, what to improve; say thank you."], n:"Projek tahap Raja ialah projek khidmat komuniti yang dirancang dan dipimpin oleh Pengakap sendiri.|A Raja-level project is a community service project planned and led by the Scout."}]};

U.lessons = U.lessons || {}; U.lessons.pengakap = M;
U.MORSE = {A:".-", B:"-...", C:"-.-.", D:"-..", E:".", F:"..-.", G:"--.", H:"....", I:"..", J:".---", K:"-.-", L:".-..", M:"--", N:"-.", O:"---", P:".--.", Q:"--.-", R:".-.", S:"...", T:"-", U:"..-", V:"...-", W:".--", X:"-..-", Y:"-.--", Z:"--..", 0:"-----", 1:".----", 2:"..---", 3:"...--", 4:"....-", 5:".....", 6:"-....", 7:"--...", 8:"---..", 9:"----."};
// more quiz questions: the whole syllabus (the first 12 stay as they were)
var Q = [
 ["Di manakah kem percubaan Pengakap pada 1907?|Where was the 1907 experimental Scout camp?", ["Pulau Brownsea|Brownsea Island","Mafeking","London"], 0, "Di Pulau Brownsea dengan kira-kira 20 budak lelaki.|On Brownsea Island with about 20 boys."],
 ["Mengapa Pengakap berjabat tangan kiri?|Why do Scouts shake hands with the left hand?", ["Tangan kiri memegang perisai: tanda percaya dan damai|The left hand held the shield: a sign of trust and peace","Tangan kanan tidak boleh|The right hand is not allowed","Ia hanya kebiasaan baharu|It is just a new habit"], 0, "B-P belajar adat ini daripada pahlawan Ashanti.|B-P learned the custom from Ashanti warriors."],
 ["Berapa perkara dalam Undang-undang Pengakap klasik?|How many points are in the classic Scout Law?", ["7","10","12"], 1, "Sepuluh.|Ten."],
 ["Simpulan untuk menarik balak ialah…|The knot for dragging a log is the…", ["Lilit Balak|Timber hitch","Simpul Pulih|Sheepshank","Bunga Geti|Sheet bend"], 0, "Simpul ikat balak (timber hitch).|The timber hitch."],
 ["Jika hujung bersilang pada simpul buku sila, ia menjadi…|If the ends cross on a reef knot it becomes a…", ["simpul nenek yang boleh tergelincir|a granny knot that can slip","simpul yang lebih kuat|a stronger knot","simpul manuk|a clove hitch"], 0, "Simpul nenek (granny) tidak selamat.|A granny knot is unsafe."],
 ["Ikatan seraya bermula dan tamat dengan…|A square lashing starts and finishes with a…", ["simpul manuk|clove hitch","kaki kambing|sheepshank","kelalat|bowline"], 0, "Mula dan tamat dengan simpul manuk.|Start and finish with a clove hitch."],
 ["Simpulan sesuai untuk menyambung tali berbeza ketebalan ialah…|The knot for joining ropes of different thickness is the…", ["Buku Sila|Reef knot","Bunga Geti|Sheet bend","Manuk|Clove hitch"], 1, "Bunga Geti (sheet bend).|The sheet bend."],
 ["Hujung tali yang anda gunakan untuk membuat simpulan dipanggil…|The end of the rope you use to tie the knot is the…", ["bahagian tetap|standing part","hujung kerja|working end","gelung|bight"], 1, "Hujung kerja (working end).|The working end."],
 ["Bendera negara diturunkan…|The national flag is lowered…", ["perlahan-lahan dan penuh hormat|slowly and with respect","dengan cepat|quickly","sambil berlari|while running"], 0, "Diturunkan perlahan dan tidak menyentuh tanah.|Lowered slowly and never touching the ground."],
 ["Isyarat Pengakap menggunakan…|The Scout sign uses…", ["tiga jari tangan kanan|three fingers of the right hand","lima jari|five fingers","tangan kiri|the left hand"], 0, "Tiga jari tangan kanan.|Three fingers of the right hand."],
 ["Kumpulan berbaris dalam bentuk apa semasa upacara?|What shape does the troop form for a ceremony?", ["ladam kuda|a horseshoe","bulatan kecil|a small circle","satu garisan|a single line"], 0, "Bentuk ladam kuda.|A horseshoe."],
 ["Bearing balik bagi 60° ialah…|The back bearing of 60° is…", ["120°","240°","300°"], 1, "60° + 180° = 240°.|60° + 180° = 240°."],
 ["Dalam rujukan grid 6 angka, baca dahulu…|In a 6-figure grid reference, read first the…", ["garis timuran (kiri → kanan)|eastings (left → right)","garis utaraan (bawah → atas)|northings (bottom → top)","skala|scale"], 0, "Sepanjang koridor, naik tangga.|Along the corridor, up the stairs."],
 ["Pada peta 1:50 000, 1 cm mewakili…|On a 1:50,000 map, 1 cm stands for…", ["50 m","500 m","5 km"], 1, "1 cm = 500 m.|1 cm = 500 m."],
 ["Garis kontur yang rapat bermaksud…|Contour lines that are close together mean…", ["tanah curam|steep ground","tanah rata|flat ground","air|water"], 0, "Rapat = curam.|Close together = steep."],
 ["Peraturan Naismith: tambah 1 jam bagi setiap … pendakian.|Naismith's rule: add 1 hour for every … of ascent.", ["100 m","600 m","2000 m"], 1, "5 km sejam + 1 jam bagi setiap 600 m.|5 km an hour + 1 hour for every 600 m."],
 ["Tapak khemah yang baik ialah…|A good campsite is…", ["rata, tersalir baik dan jauh dari dahan mati|flat, well-drained and clear of dead branches","di dasar sungai yang kering|in a dry riverbed","di bawah pokok tunggal tinggi|under a lone tall tree"], 0, "Rata, tersalir baik, selamat.|Flat, well-drained and safe."],
 ["Api mesti dipadamkan sehingga…|A fire must be put out until it is…", ["tiada api kelihatan|no flames show","sejuk apabila disentuh|cold to the touch","asap hilang|the smoke has gone"], 1, "Siram, kacau, rasa: sejuk.|Drown, stir, feel: cold."],
 ["Berapa prinsip Leave No Trace?|How many Leave No Trace principles are there?", ["3","7","10"], 1, "Tujuh prinsip.|Seven principles."],
 ["Tanda jejak anak panah bermaksud…|A tracking sign of an arrow means…", ["ikut arah ini|go this way","jangan ikut|do not follow","sudah pulang|gone home"], 0, "Ikut arah ini.|Go this way."],
 ["Dalam Morse, satu garis (dash) ialah…|In Morse, one dash is…", ["tiga kali panjang titik|three times as long as a dot","sama panjang titik|the same as a dot","dua kali titik|twice a dot"], 0, "Garis = 3 unit.|A dash = 3 units."],
 ["Morse bagi huruf E ialah…|The Morse for the letter E is…", ["satu titik|one dot","satu garis|one dash","dua titik|two dots"], 0, "E = ·|E = ·"],
 ["Posisi pemulihan digunakan untuk mangsa yang…|The recovery position is for a casualty who is…", ["tidak sedar tetapi bernafas normal|unconscious but breathing normally","tidak bernafas|not breathing","sedar dan berjalan|awake and walking"], 0, "Tidak sedar dan bernafas normal.|Unconscious and breathing normally."],
 ["Huruf R dalam RICE ialah…|The R in RICE stands for…", ["Rehat|Rest","Rawat|Treat","Rendam|Soak"], 0, "Rest = rehat.|Rest."],
 ["Satu patrol biasanya kira-kira…|A patrol is usually about…", ["6–8 ahli|6–8 members","20 ahli|20 members","2 ahli|2 members"], 0, "6–8 Pengakap.|6–8 Scouts."],
 ["Majlis Ketua Patrol dianggotai oleh…|The Court of Honour is made up of…", ["ketua patrol dan Pemimpin Pengakap|the patrol leaders and the troop leader","semua ibu bapa|all the parents","hanya ahli baharu|only new members"], 0, "Ketua-ketua patrol.|The patrol leaders."],
 ["Langkah terakhir projek khidmat ialah…|The last step of a service project is to…", ["menilai dan merenung|review and reflect","melupakannya|forget it","menjual hasilnya|sell the results"], 0, "Menilai dan renung, ucap terima kasih.|Review and reflect, say thank you."]];
Q.forEach(function(q){ U.orgs.pengakap.quiz.push(q); });
})();
