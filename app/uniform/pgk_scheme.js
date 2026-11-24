/* My Ihsan 0.7.47 · Pengakap Muda: the official PPM scheme "Skim Latihan Pengakap Muda" (Pasukan Latihan Negara, Persekutuan Pengakap Malaysia, Mac 2010).
   Path: Lencana Keahlian → Usaha → 2 Kegemaran → Maju → 3 Pengetahuan (Ahli Berkhemah wajib) + 3 Perkhidmatan (Ahli Pertolongan Cemas wajib) → Jaya → Rambu Pengakap Muda.
   Every badge lists its tests as in the book (long sub-points are shortened, wording of the book otherwise kept). The English is a plain translation.
   Strings are "Bahasa Melayu|English". A part is a group of tests; need = how many of its items must be passed (default all); pick = how many parts of the badge must be completed (default all).
   Check the exact test wording and sign-off with your Pemimpin Pengakap: the book, your Penilai and PPM have the final say. */
(function(){
var U = window.UA; U.scheme = U.scheme || {};
function P(h, items, need){ return {h:h, items:items, need:need}; }
var S = {};
S.intro = "Pengakap Muda ialah unit untuk budak berumur 12 hingga 15 tahun (Tingkatan 1–3), peringkat kedua dalam latihan progresif Pengakap. Setiap Patrol terdiri daripada 6 hingga 8 orang, diketuai seorang Ketua Patrol di bawah pimpinan Pemimpin Pengakap.|Pengakap Muda is the unit for ages 12 to 15 (Form 1–3), the second stage of progressive Scout training. Each Patrol has 6 to 8 members led by a Patrol Leader (Ketua Patrol), under an adult Pemimpin Pengakap.";
S.order = ["keahlian", "usaha", "kegemaran", "maju", "pengetahuan", "perkhidmatan", "jaya", "rambu"];
S.flow = [["Lencana Keahlian|Keahlian badge", "Tingkatan 1 atau Istiadat Meningkat Naik (Kanak-kanak → Muda)|Form 1, or the Moving-Up Ceremony from Cubs"], ["Lencana Usaha", "Tingkatan 1|Form 1"], ["2 Lencana Kegemaran|2 Kegemaran badges", "Tingkatan 1|Form 1"], ["Lencana Maju", "Tingkatan 2|Form 2"], ["3 Pengetahuan + 3 Perkhidmatan|3 Pengetahuan + 3 Perkhidmatan", "Tingkatan 2|Form 2"], ["Lencana Jaya", "Tingkatan 3|Form 3"], ["Rambu Pengakap Muda", "Pertengahan Tingkatan 3|Mid Form 3"]];

// ---------- Keahlian ----------
S.keahlian = {id:"keahlian", n:"Lencana Keahlian|Keahlian badge", ic:"🔰", xp:100,
  about:"Diberi kepada seorang budak sebagai pengiktirafan bahawa dia Ahli dalam Persaudaraan Pengakap Malaysia dan Sedunia. Bagi Pengakap Kanak-kanak yang telah ke Pengakap Muda, tidak perlu ujian: hanya Istiadat Meningkat Naik.|Given to a boy as recognition that he is a member of the Pengakap Malaysia and World Scout brotherhood. A Cub who moves up does not need the tests, only the Moving-Up Ceremony.",
  wear:"Dipakai pada saku kiri baju; bendera Malaysia pada saku kanan.|Worn on the left pocket; the Malaysia flag on the right pocket.",
  parts:[P("", [
    "Peraturan pakaian seragam Pengakap.|The rules for the Pengakap uniform.",
    "Prinsip Rukun Negara.|The principles of Rukun Negara.",
    "Lambang Pengakap Malaysia & Lambang Pengakap Sedunia.|The Pengakap Malaysia emblem and the World Scout emblem.",
    "Persetiaan Pengakap & Undang-Undang Pengakap.|The Scout Promise (Persetiaan) and the Scout Law.",
    "Hormat Pengakap & Cogankata Pengakap.|The Scout salute and the Scout motto (Selalu Sedia).",
    "Sejarah Pengakap Malaysia & sejarah pengasas Pengakap, Lord Baden-Powell.|History of Pengakap Malaysia and of the founder, Lord Baden-Powell.",
    "Simpulan & ikatan: Buku Sila (reef knot), Bunga Geti (sheet bend), Simpul Manuk (clove hitch), Tindih Kasih (bowline), Lilit Dua Simpul (round turn & two half hitches), Lilit Pemati Biasa (common whipping).|Knots and lashings: reef knot, sheet bend, clove hitch, bowline, round turn & two half hitches, common whipping."])]};

// ---------- Usaha ----------
S.usaha = {id:"usaha", n:"Lencana Usaha|Usaha badge", ic:"🟤", xp:150,
  about:"Diberi untuk mengiktiraf minat dan kegemaran luar seperti berkhemah, memasak, mengembara, kecergasan jasmani, kemahiran Pengakap dan perkhidmatan. Syarat: Lencana Keahlian (atau Istiadat Meningkat Naik).|Given for outdoor interests such as camping, cooking, exploring, fitness, Scout skills and service. Needs the Keahlian badge (or the Moving-Up Ceremony).",
  wear:"Lengan kanan, di bawah tab NEGERI, DAERAH dan nombor KUMPULAN.|Right sleeve, below the STATE and DISTRICT tabs and the GROUP number.",
  parts:[
  P("A. Cita-Cita Pengakap|A. Scouting ideals", [
    "Bendera Malaysia dan Bendera Negeri masing-masing.|The Malaysian flag and your own State flag.",
    "Lagu Negaraku dan lagu negeri masing-masing.|Negaraku and your State anthem.",
    "Menaikkan bendera.|Raising the flag.",
    "Orang-orang kenamaan: nama penuh DYMM Sultan/Raja, TYT Yang Dipertua Negeri, Menteri Besar dan Ketua Menteri.|Dignitaries: the full names of the Sultan/Raja, the Yang Dipertua Negeri, the Menteri Besar and the Chief Minister.",
    "Persetiaan Pengakap & Undang-Undang Pengakap.|The Scout Promise and the Scout Law."]),
  P("B. Kecergasan dan Kesegaran Jasmani|B. Fitness", [
    "Asas perbarisan.|Basic drill.","Kawat Tongkat.|Staff drill (Kawat Tongkat).","Isyarat-isyarat tangan Pengakap.|Scout hand signals.","Halangan Komando.|The commando obstacle course.","Melipat dan mengibarkan bendera.|Folding and flying the flag."]),
  P("C. Kemahiran Berpengakap|C. Scout skills", [
    "Menjaga dan menyimpan pisau serta parang.|Care and storage of the knife and parang.",
    "Simpulan & ikatan: Simpul Himpit (fisherman's knot), Simpul Pulih (sheepshank), Bunga Geti Ganda (double sheet bend), Lilit Balak (timber hitch), Lilit Taut-line, Ikat Seraya (square lashing), Ikat Serong (diagonal lashing).|Knots & lashings: fisherman's knot, sheepshank, double sheet bend, timber hitch, taut-line hitch, square lashing, diagonal lashing.",
    "Undang-undang Lalulintas Jalanraya.|The road traffic rules.",
    "Memilih tapak perkhemahan.|Choosing a campsite.",
    "Keperluan peribadi untuk berkhemah.|Personal needs for camping.",
    "Alatan pertolongan cemas peribadi.|A personal first-aid kit.",
    "Menghidupkan api.|Lighting a fire.",
    "Berkhemah sekurang-kurangnya 1 malam.|Camping at least 1 night.",
    "Arah mata angin dan mengenali peta topo.|The compass points and the topographic map.",
    "Isyarat Sulit Pengakap.|Scout secret signals.",
    "Mengembara sejauh 8 km berjalan kaki dalam patrolnya; membuat laporan bertulis dalam buku log.|A hike of 8 km on foot with the patrol; a written report in the log book."]),
  P("D. Kecenderungan dan Minat|D. Aptitude and interests", ["Kraftangan.|A handicraft.","Plaster cast.|Plaster casts.","Rekod 12 orang sahabat pena.|A record of 12 pen friends."]),
  P("E. Perkhidmatan|E. Service", ["Balutan anduh: melipat kain anduh; anduh tangan dan kaki.|Triangular bandages: folding the bandage; arm and foot slings.","Tindakan kecemasan.|Emergency action.","Memandu orang.|Guiding people."])]};

// ---------- Kepandaian: Kegemaran (pick 2 of 11) ----------
S.kegemaran = {id:"kegemaran", n:"Lencana Kepandaian · Kegemaran|Kepandaian · Hobbies", ic:"🔴", need:2, xp:75,
  about:"Selepas Lencana Usaha, Pengakap Muda meneruskan latihan untuk mendapat DUA Lencana Kegemaran mengikut minat. Cincin lencana berwarna merah.|After the Usaha badge a Pengakap Muda earns TWO Kegemaran badges, by interest. The badge ring is red.",
  wear:"Lengan kiri: tempat 1 dan 2.|Left sleeve: positions 1 and 2.",
  badges:[
  {id:"koleksi", n:"Ahli Koleksi Hobi|Hobby Collector", ic:"🦋", parts:[P("", [
    "Mengumpul, menyusun dan mengatur dengan kemas dan menarik suatu jenis barang dalam tempoh tidak kurang daripada 6 bulan (setem, kotak mancis, duit syiling, siput, pembalut tin dll).|Collect, sort and display one kind of item neatly for at least 6 months (stamps, matchboxes, coins, shells, tin wrappers etc).",
    "Mengetahui serba sedikit berkenaan benda yang dikumpul; membincangkan dengan Penilai sebab barang itu dipilih dan dikumpul.|Know something about what you collect; discuss with the assessor why you chose it.",
    "Mengumpul/menyimpan EMPAT perkara: skaf, lencana (kain/logam), wogel, topi (peak cap), tali pinggang, kemeja-T, sampul surat hari pertama Jambori, majalah Pengakap.|Collect FOUR of: scarf, badges (cloth/metal), woggle, peak cap, belt, T-shirt, a Jamboree first-day cover, Scout magazine."])]},
  {id:"muzik", n:"Ahli Muzik|Musician", ic:"🎵", pick:1, parts:[
    P("Bahagian A|Part A", ["Menyanyi sebuah lagu yang ada korus.|Sing a song with a chorus.","Membaca titinada muzik sekurang-kurangnya untuk 3 lagu (melodi).|Read music notation for at least 3 songs (melody).","Mengetahui erti tanda tempo dan tanda muzik (Sonata, Concerto, Oratario) serta memberi 3 contoh bagi tiap-tiap satu.|Know the meaning of tempo and music marks (Sonata, Concerto, Oratario) with 3 examples each.","Membincangkan dengan Penilai sekurang-kurangnya dua pertunjukan hiburan terbaru.|Discuss at least two recent shows with the assessor."]),
    P("Bahagian B|Part B", ["Menyanyi 2 lagu pilihan sendiri dan sebuah lagu yang sesuai untuk dinyanyikan dengan iringan muzik.|Sing 2 songs of your choice and one suited to music accompaniment.","Menyanyi 2 lagu pilihan, satu cepat dan satu lambat, memainkan muziknya sendiri atau dengan muzik latar.|Sing 2 chosen songs, one fast and one slow, playing the music yourself or with background music.","Erti tanda tempo (Sonata, Concerto, Oratario) dengan 3 contoh.|The meaning of the tempo marks with 3 examples."]),
    P("Bahagian C|Part C", ["Menyanyi tanpa iringan dua jenis lagu rakyat berlainan jenis (keperwiraan, nelayan, kampung, dondang sayang, dikir barat) ATAU satu lagu pilihan sambil bermain gambus, banjo, gitar, mandolin atau harmonika.|Sing two different folk songs unaccompanied (heroic, fishermen's, village, dondang sayang, dikir barat) OR one song of your choice while playing gambus, banjo, guitar, mandolin or harmonica.","Mengetahui sedikit prinsip asas muzik (menala alat, titinada, tali dan nada suara/bass).|Know the basic principles of music (tuning, pitch, strings, bass)."]),
    P("Bahagian D (bagpipe)|Part D (bagpipe)", ["Memain dan membunyikan bagpipe dengan memuaskan; 2 lagu march 2/4 dan 2 lagu 6/8; 2 lagu slow march; satu lagu strathspey dan reel.|Play the bagpipe satisfactorily; 2 marches in 2/4 and 2 in 6/8; 2 slow marches; one strathspey and reel.","Membincangkan jenis muzik bercorak kebudayaan dengan Penilai.|Discuss cultural music with the assessor."]),
    P("Bahagian E (pancaragam)|Part E (band)", ["Menjadi ahli pancaragam di sekolah atau Kumpulan Pengakap.|Be a member of a band at school or in the Scout group.","Memainkan dan menjaga SATU alat: gendang iringan, gendang suara langsung (tenor), gendang suara rendah (bass) atau bugle/trumpet; berbaris sambil bermain; kadar memalu 116 langkah seminit; lagu bugle (Fall In, Cook-House, Light Out, Reveille, General Salute, Retreat).|Play and look after ONE instrument: side drum, tenor drum, bass drum or bugle/trumpet; march while playing; 116 steps a minute; the bugle calls."])]},
  {id:"pertahanan", n:"Ahli Pertahanan Diri|Self-Defence", ic:"🥋", parts:[P("", [
    "Menjadi ahli sekurang-kurangnya 6 bulan dalam persatuan seni mempertahankan diri (Seni Silat, Kung Fu, Karate, Taekwondo, Judo, Akido, Salambam dll).|Be a member for at least 6 months of a martial-arts club (silat, kung fu, karate, taekwondo, judo, aikido, salambam etc).",
    "Mengetahui sejarah seni mempertahankan diri yang berkenaan.|Know the history of your art.",
    "Mengetahui prinsip yang terkandung di dalamnya.|Know its principles.",
    "Mengetahui jenis kekuda, pergerakan asas, jenis tangkisan serta jenis serangan tangan dan kaki.|Know the stances, basic movements, blocks and hand and foot attacks.",
    "Menunjukkan cara membuat serangan dan menangkis serangan (one-step sparring dan free-sparring).|Show how to attack and defend (one-step sparring and free-sparring)."])]},
  {id:"renang", n:"Ahli Renang|Swimmer", ic:"🏊", parts:[P("", [
    "Berenang sejauh 100 meter dengan sebarang cara atau gaya.|Swim 100 metres in any stroke.",
    "Berenang dengan 2 cara pilihan: front crawl 50 m, back crawl 50 m, breast stroke 50 m atau butterfly 50 m.|Swim 2 chosen strokes: front crawl 50 m, back crawl 50 m, breast stroke 50 m or butterfly 50 m.",
    "Terjun ke permukaan air dari atas sebelah kolam atau tempat renang.|Dive into the water from the side of the pool.",
    "Berenang di air cetek 25 m dengan pakaian ringan, berjalan di air 1 minit dan menanggalkan pakaian dalam air.|Swim 25 m in shallow water in light clothes, tread water for 1 minute and remove the clothes in the water.",
    "Berenang 25 m ke arah orang yang lemas, pusingkan badannya, bawa ke tepi dengan cara menyelamat yang diakui; tunjukkan pemulihan pernafasan.|Swim 25 m to a drowning person, turn them, bring them to the edge with a recognised rescue; show resuscitation.",
    "Menyelam 2 meter dan mengambil satu benda dari bawah dengan kedua-dua belah tangan.|Dive 2 metres and bring up an object with both hands."])]},
  {id:"sukan", n:"Ahli Sukan|Athlete", ic:"🏃", parts:[P("Pilih LIMA acara, sekurang-kurangnya SATU daripada tiap kumpulan, mencapai darjah minima umur|Choose FIVE events, at least ONE from each group, at the minimum standard for your age", [
    "Kumpulan A (berlari): 100 m 15 saat; 200 m 34 s (<14) / 30 s (<15); 400 m 80 s / 70 s; 800 m 3:10 / 2:45; 1500 m 6:10 / 5:50.|Group A (running): 100 m 15 s; 200 m 34 s (<14) / 30 s (<15); 400 m 80 s / 70 s; 800 m 3:10 / 2:45; 1500 m 6:10 / 5:50.",
    "Kumpulan B (melompat): lompat tinggi 1.10 m (<14) / 1.23 m (<15); lompat jauh 3.65 m / 4.26 m.|Group B (jumping): high jump 1.10 m (<14) / 1.23 m (<15); long jump 3.65 m / 4.26 m.",
    "Kumpulan C (melontar): cakera 16.5 m / 22.00 m; peluru 7.30 m / 8.85 m; bola kriket 41.20 m / 46.60 m.|Group C (throwing): discus 16.5 m / 22.00 m; shot put 7.30 m / 8.85 m; cricket ball 41.20 m / 46.60 m.",
    "Penilai boleh menggunakan budi bicara mengikut cuaca atau keadaan gelanggang.|The assessor may use judgement for weather or the field."], 3)]},
  {id:"jurumasak", n:"Juru Masak di Khemah|Camp Cook", ic:"🍳", parts:[P("", [
    "Memasak DUA jenis makanan tanpa perkakas dapur, untuk diri sendiri dan seorang lagi.|Cook TWO kinds of food without kitchen utensils, for yourself and one other.",
    "Memasak dan menghidangkan SATU: ikan panggang, roti berlauk atau bubur.|Cook and serve ONE of: grilled fish, bread with a filling, or porridge.",
    "Memasak dan menghidangkan SATU: mee rebus/goreng, ayam/daging panggang atau salai, atau masakan biasa.|Cook and serve ONE of: noodles, grilled or smoked chicken/meat, or an ordinary dish.",
    "Memasak dan menghidangkan SATU: makanan manis, halua buah-buahan, gula-gula manisan, lengkong atau manisan pilihan sendiri.|Cook and serve ONE sweet: a sweet dish, fruit halwa, candy, lengkong or a sweet of your choice.",
    "Menyediakan DUA jenis menu dengan sukatan sekali untuk satu patrol (6 orang); tidak semua perlu dimasak. Semua hidangan dimasak dalam keadaan berkhemah.|Prepare TWO menus, measured once, for a patrol of 6; not everything must be cooked. All dishes are cooked while camping."])]},
  {id:"perpustakaan", n:"Juru Perpustakaan|Librarian", ic:"📚", pick:1, parts:[
    P("Pilihan 1|Option 1", ["Berikan kepada Penilai senarai sekurang-kurangnya 12 jenis buku yang dibaca dalam 12 bulan; terangkan sebab buku dibaca, pendapat anda, dan jawab soalan kandungan buku (cerita fiksyen dan bukan fiksyen, tidak lebih 3 buku oleh seorang pengarang, bukan buku teks).|Give the assessor a list of at least 12 books read in 12 months; explain why you read them, give your opinion and answer questions on their content (fiction and non-fiction, no more than 3 by one author, no school textbooks)."]),
    P("Pilihan 2|Option 2", ["Senarai buku yang digemari; terangkan sebab dipilih dan jawab soalan tentang kandungan.|A list of favourite books; say why you chose them and answer questions about the content.","Mengetahui apa yang dikatakan Buku Rujukan dan maklumat yang diperolehi daripadanya.|Know what a reference book is and what information it gives.","Terangkan dengan ringkas cara mengatur dan menyusun buku supaya mudah dicari.|Explain briefly how to arrange books so they are easy to find."])]},
  {id:"peladang", n:"Peladang Muda|Young Farmer", ic:"🌱", pick:1, parts:[
    P("Kumpulan A (pusat ternakan)|Group A (livestock centre)", ["Mengetahui pengurusan pusat ternakan di luar bandar atau desa.|Know how a livestock centre in a rural area is run.","Menunjuk cara pengelolaan harian, termasuk jenis ternakan, tanaman, hasil, jentera dan pekerja; menghuraikan perubahan yang dibuat; mengadakan 12 keping gambar dengan keterangan.|Show the daily management, covering livestock, crops, produce, machinery and workers; describe a change made; produce 12 captioned photos."]),
    P("Kumpulan B (kebun)|Group B (garden)", ["Menanam dalam kawasan sekurang-kurangnya 11 meter persegi, selama setahun, 3 jenis pokok bunga tahan lama, 3 jenis sayuran, 3 jenis pokok bebawang, rumput-rampai atau ros.|Grow, in at least 11 square metres over a year, 3 lasting flowers, 3 vegetables, 3 onion-type plants, herbs or roses.","Menerangkan kepada Penilai kerja yang dijalankan dan hasilnya (Penilai melawat kebun ≥ 4 kali setahun).|Explain the work done and the results (the assessor visits at least 4 times a year)."]),
    P("Kumpulan C (haiwan)|Group C (animals)", ["Bagi binatang kecil (anjing, kucing, arnab, tikus, kura-kura): tabiat, kelakuan dan cara memberi makan.|For small animals (dogs, cats, rabbits, mice, tortoises): habits, behaviour and feeding.","Bagi binatang ternakan (kuda, lembu, kambing): makan, kandang, tabiat, kegunaan ekonomi.|For livestock (horses, cattle, goats): feeding, housing, habits, economic uses.","Jika unggas: burung belaan atau burung yang dimakan (ayam, merpati).|For poultry: pet birds or birds kept for eating (chickens, pigeons)."]),
    P("Kumpulan D (akuarium)|Group D (aquarium)", ["Mengadakan dan menjaga akuarium ikan air tawar lengkap dengan tumbuhan, sekurang-kurangnya 3 jenis ikan.|Set up and care for a freshwater aquarium with plants and at least 3 kinds of fish.","Menerangkan cara menjaga akuarium sepanjang tahun dan masalah yang terdapat.|Explain how to look after it all year and the problems met."])]},
  {id:"pelukis", n:"Pelukis|Artist", ic:"🎨", parts:[P("", [
    "Melukis satu pemandangan dari sebuah cerita yang dipilih Penilai.|Paint a scene from a story chosen by the assessor.",
    "Melukis rupa seorang manusia yang wajahnya bengis, tersenyum atau sedih.|Draw a person's face: stern, smiling or sad.",
    "Melukis satu pemandangan keindahan alam semulajadi yang ditentukan Penilai.|Paint a natural landscape set by the assessor.",
    "Melukis poster gambar simpulan dan ikatan yang telah dipelajari.|Draw a poster of knots and lashings you have learned.",
    "Melukis gambar perkhemahan (layout) yang ideal.|Draw an ideal camp layout.",
    "Melukis sekurang-kurangnya tiga gejet yang patut ada dalam perkhemahan.|Draw at least three camp gadgets.",
    "Melukis lambang Pengakap pada bahan seperti kadbod, papan lapis atau polystrene.|Draw the Scout emblem on card, plywood or polystyrene.",
    "Mengumpul pelbagai lukisan daripada akhbar dan majalah untuk rujukan.|Collect drawings from newspapers and magazines as references."])]},
  {id:"pengail", n:"Pengail|Angler", ic:"🎣", parts:[P("", [
    "Mengetahui peraturan keselamatan dalam air, bahaya air dan tindakan sebelum menghargunginya.|Know water safety rules, the dangers of water and what to do before going in.",
    "Mengail di air tawar atau masin sekurang-kurangnya enam kali dalam tiga bulan dan menyimpan rekod: banyak ikan, jenis, ukuran, berat, cara tangkapan, umpan, cuaca.|Fish in fresh or salt water at least six times in three months and keep a record: catch, kinds, sizes, weights, method, bait, weather.",
    "Mengenali 12 jenis ikan dan mengetahui lubuk, umpan serta mata kail dan batu ladung yang sesuai.|Know 12 kinds of fish, where they live, the bait, and suitable hooks and sinkers.",
    "Melempar dan melabuhkan mata kail 6 kali berturut-turut sejauh tidak kurang 5 meter ATAU melabuhkan mata kail dengan batu ladung ringan sedalam lebih kurang 1 meter.|Cast and place the hook 6 times in a row at least 5 m, OR lower a hook with a light sinker about 1 m.",
    "Mengenali sekurang-kurangnya 6 jenis alat mengail (joran, batu ladung, takal, tali kail, mata kail dll).|Know at least 6 pieces of fishing gear (rod, sinker, reel, line, hook etc)."])]},
  {id:"basikal", n:"Penunggang Basikal|Cyclist", ic:"🚲", parts:[P("", [
    "Mempunyai dan menggunakan selama sekurang-kurangnya 6 bulan sebuah basikal yang lengkap dan berkeadaan baik.|Own and use a complete bicycle in good condition for at least 6 months.",
    "Membaiki kerosakan: menukar tayar dan tiub, menampal tiub bocor, mengganti alat brek dll.|Repair faults: change a tyre and tube, mend a puncture, replace brake parts.",
    "Mengetahui peraturan lalulintas dan keselamatan jalanraya; boleh membaca peta jalanraya.|Know the traffic and road-safety rules and read a road map.",
    "Mengambil bahagian dalam kegiatan Pengakap menggunakan basikal sekurang-kurangnya 10 km.|Take part in a Scout activity by bicycle of at least 10 km.",
    "Mengulangi kata-kata satu berita lisan yang disampaikan kepada pihak tertentu selepas menunggang basikal selama satu jam.|Deliver a spoken message to a named person after cycling for one hour."])]}]};

// ---------- Maju ----------
S.maju = {id:"maju", n:"Lencana Maju|Maju badge", ic:"⚪", xp:200,
  about:"Diberi untuk mengiktiraf kemahiran, kegiatan luar dan memperkenalkan asas berdikari dan perkhidmatan (Kawat Tongkat, Istiadat Bendera, Pertolongan Cemas dll). Syarat: Lencana Usaha dan DUA Lencana Kegemaran.|Given for skills, outdoor activity and basic self-reliance and service (staff drill, flag ceremonies, first aid etc). Needs the Usaha badge and TWO Kegemaran badges.",
  wear:"Lengan kanan, menggantikan Lencana Usaha.|Right sleeve, in place of the Usaha badge.",
  parts:[
  P("A. Cita-Cita Pengakap|A. Scouting ideals", ["Organisasi Kumpulan, PPM Daerah dan PPM Negeri.|The organisation of the Group, PPM District and PPM State.","Melukis semua bendera negeri-negeri di Malaysia.|Draw the flags of all the states of Malaysia.","Nama penuh Ketua Pesuruhjaya Negeri, Pesuruhjaya Daerah dan Penolong Pesuruhjaya Daerah.|The full names of the State Chief Commissioner, the District Commissioner and the Assistant District Commissioner.","Undang-Undang Pengakap.|The Scout Law."]),
  P("B. Kecergasan dan Kesegaran Jasmani|B. Fitness", ["Latihan asas perbarisan.|Basic drill.","Kawat Tongkat.|Staff drill.","Upacara mengibarkan dan menurunkan bendera.|The flag raising and lowering ceremony.","Memanjat tali atau pokok setinggi 5 meter.|Climb a rope or tree 5 metres high."]),
  P("C. Kemahiran Berpengakap|C. Scout skills", [
    "Menjaga, mengasah dan menyimpan kapak dan gergaji.|Care for, sharpen and store an axe and saw.","Teknik menggunakan kapak.|Axe technique.",
    "Simpulan & ikatan: Tindih Kasih Ganda, Belit Lucut, Lilit Pasdul, Simpul Kerusi, Lilit Pemati Selit, Simpul Kepala Lalat, Sambat Balik, Ikat Silang Gunting.|Knots & lashings: double bowline, slip hitch, rolling-type hitch, chair knot, eye-splice type whipping, cat's paw type hitch, back splice, shear lashing (names as in the book).",
    "Memasak masakan rimba: menghidupkan api, roti lilit, ikan.|Backwoods cooking: lighting a fire, twist bread, fish.","Model projek perintis.|A pioneering project model.",
    "Kajian 1 perkara: burung, binatang dan pokok tempatan, atau lawatan bangunan/kawasan penting, atau kawasan tempatan.|A study of 1 subject: local birds, animals and trees, a visit to an important building/area, or the local area.",
    "Berkhemah tidak kurang daripada 8 malam.|Camp at least 8 nights.","Langkah keselamatan berenang.|Swimming safety.","Langkah keselamatan kegiatan kerja luar.|Safety in outdoor activities.",
    "Melakukan 2 perkara: dapur gas, lampu gas/dapur minyak tanah; keperluan berkhemah; memasak untuk 2 orang.|Do 2 things: use a gas stove, gas lamp or kerosene stove; camping needs; cook for 2 people."]),
  P("D. Pengembaraan|D. Exploring", ["Jenis kompas dan membaca bearing.|Types of compass and reading a bearing.","Sistem kontur, rujukan grid, skil dan kunci peta.|Contours, grid references, map scale and key.","Mengembara 16 km berjalan kaki dalam patrol dan bermalam di luar dengan mendirikan khemah; laporan bertulis dalam Buku Log.|A 16 km hike on foot in a patrol, camping out overnight; a written report in the Log Book.","Ikhtiar hidup.|Survival skills."]),
  P("E. Perkhidmatan|E. Service", ["Balutan: kepala, lutut dan lengan.|Bandages: head, knee and arm.","Tindakan kecemasan.|Emergency action.","Memanggil Polis, Bomba dan Ambulan.|Calling the Police, Fire Brigade and Ambulance.","Khidmat sukarela / khidmat masyarakat.|Voluntary / community service."])]};

// ---------- Kepandaian: Pengetahuan (3, Ahli Berkhemah wajib) ----------
S.pengetahuan = {id:"pengetahuan", n:"Lencana Kepandaian · Pengetahuan|Kepandaian · Knowledge", ic:"🟢", need:3, must:"berkhemah", xp:75,
  about:"Selepas Lencana Maju, Pengakap Muda meneruskan latihan untuk TIGA lagi Lencana Pengetahuan: Ahli Berkhemah wajib dan DUA pilihan. Cincin lencana berwarna hijau.|After Maju, a Pengakap Muda earns THREE Pengetahuan badges: Ahli Berkhemah is compulsory and TWO are optional. The badge ring is green.",
  wear:"Lengan kiri: tempat 3, 4 dan 5.|Left sleeve: positions 3, 4 and 5.",
  badges:[
  {id:"berkhemah", n:"Ahli Berkhemah (wajib)|Camper (compulsory)", ic:"⛺", parts:[P("", [
    "Telah berkhemah dalam patrol sejumlah sekurang-kurangnya 12 malam.|Camped with the patrol for at least 12 nights in total.",
    "Mendiri, meroboh dan menggulung khemah pengembara (hike tent).|Pitch, strike and roll a hike tent.",
    "Mengarah dengan jayanya kerja mendiri, meroboh dan menggulung sebuah khemah patrol.|Direct the pitching, striking and rolling of a patrol tent.",
    "Perkara mustahak dalam memilih tapak perkhemahan.|What matters in choosing a campsite.",
    "Prinsip berkenaan kebersihan dan keselamatan dalam perkhemahan.|Principles of cleanliness and safety in camp.",
    "Cara menyimpan bahan makanan di khemah kuartermaster.|How to store food in the quartermaster's tent.",
    "Membuat sendiri tempat menyimpan bahan makanan, dapur pelantar dan dua gejet lain pilihan sendiri.|Make a food store, a platform kitchen and two other gadgets of your choice.",
    "Memasak untuk 2 orang dewasa: masakan panas untuk sarapan pagi atau satu hidangan untuk tetamu termasuk sejenis sayur-sayuran.|Cook for 2 adults: a hot breakfast or a meal for guests including a vegetable dish.",
    "Mempunyai pengetahuan untuk mencapai darjah perkhemahan paling tinggi.|Know what it takes to reach the highest standard of camping."])]},
  {id:"elektronik", n:"Ahli Elektronik|Electronics", ic:"🔌", parts:[P("", [
    "Menunjukkan sekurang-kurangnya 4 jenis litar elektrik yang telah dipasang, satu daripadanya set radio mudah; terangkan cara tiap-tiapnya berfungsi.|Show at least 4 electric circuits you have built, one a simple radio set, and explain how each works.",
    "Senaraikan sekurang-kurangnya 4 jenis alat elektronik rumah tangga dan perindustrian serta terangkan cara berfungsi.|List at least 4 household and industrial electronic devices and explain how they work.",
    "Teori mudah transistor dan cara ia dirangkaikan dengan resistor, capacitor dan coil.|The simple theory of the transistor and how it is connected with resistors, capacitors and coils.",
    "Membuat litar elektrik untuk menyalakan lampu LED.|Build a circuit that lights an LED."])]},
  {id:"perintis", n:"Ahli Ilmu Perintis|Pioneering", ic:"🪢", parts:[P("", [
    "Ciri utama pelbagai jenis dan ukuran tali; cara menggulung dan menjaga tali serta menguji keteguhannya.|The main features of different ropes and sizes; coiling, caring for and testing ropes.",
    "Menentukan dan mengawasi keselamatan penggunaan tali.|Make sure rope is used safely.",
    "Mengerti dan menunjukkan kegunaan pancang dogang (anchorage) untuk peneroka.|Understand and show the use of anchorages for pioneering.",
    "Kegunaan semua simpulan, ikatan dan cara mematikan tali yang digunakan dalam peneroka.|The use of all the knots and lashings and how to finish ropes in pioneering.",
    "Mengetuai patrol membuat satu projek yang dipilih Penilai dengan jayanya.|Lead the patrol in making a project chosen by the assessor.",
    "Mengetuai patrol membuat projek yang direka sendiri, berbincang dahulu dengan Penilai tentang rangka, model, cara membuat, alatan dan jangka masa.|Lead a patrol in a project of your own design, first discussing the plan, model, method, tools and time with the assessor."])]},
  {id:"komputer", n:"Ahli Komputer|Computing", ic:"💻", parts:[P("", [
    "Mempunyai atau telah menggunakan komputer di sekolah sekurang-kurangnya 12 bulan.|Own or have used a computer at school for at least 12 months.",
    "Menerangkan apa itu komputer dan komponen asasnya.|Explain what a computer is and its basic components.",
    "Mengetahui sejarah ringkas komputer.|Know a short history of the computer.",
    "Menerangkan jenis komputer dan bagaimana data disimpan.|Explain kinds of computer and how data is stored.",
    "Mengetahui Sistem Pengoperasian (Windows, Macintosh, Linux) dan kegunaannya.|Know operating systems (Windows, Macintosh, Linux) and their use.",
    "Mengenali virus komputer dan cara mencegahnya.|Know computer viruses and how to prevent them.",
    "Mengetahui 6 jenis kegunaan komputer di rumah, pejabat dan industri.|Know 6 uses of computers at home, in offices and industry.",
    "Menyediakan satu pengaturcaraan persembahan MS Power Point ATAU kemahiran pemprosesan perkataan (MS Word).|Prepare a presentation in MS PowerPoint OR show word-processing skills (MS Word)."])]},
  {id:"mekanik", n:"Ahli Mekanik|Mechanics", ic:"🔧", pick:1, parts:[
    P("Bahagian A (motosikal)|Part A (motorcycle)", ["Beza enjin 2 lejang dengan 4 lejang.|The difference between 2-stroke and 4-stroke engines.","Bahagian asas motosikal.|The basic parts of a motorcycle.","Membuka, mencuci dan memeriksa ukuran celah plag.|Remove, clean and check the plug gap.","Menukar minyak pelincir; tahu minyak pelincir yang sesuai.|Change the lubricating oil; know the right oil.","Membuka tayar, menampal tiub bocor dan memasang semula.|Remove a tyre, patch a puncture and refit.","Membetulkan clutch dan brek.|Adjust the clutch and brakes.","Menukar mentol yang terbakar.|Change a blown bulb.","Menegangkan rantai yang kendur.|Tighten a slack chain.","Menambah air bateri.|Top up the battery water."]),
    P("Bahagian B (radio)|Part B (radio)", ["Membuat penerima radio dua mentol (valve) atau transistor di atas papan.|Build a two-valve or transistor radio receiver on a board.","Menggunakan pemateri (soldering iron) dengan berhati-hati.|Use a soldering iron carefully.","Keselamatan apabila memperbaiki peti radio AC/DC.|Safety when repairing an AC/DC radio.","Memperbaiki kerosakan kecil pada peti radio.|Repair minor faults in a radio.","Syarat mendapatkan Lesen Radio Amatur.|The conditions for an Amateur Radio Licence."]),
    P("Bahagian C (motobot)|Part C (outboard)", ["Menerangkan prinsip dan perjalanan 2 jenis jentera motobot lebih daripada 2 kuda kuasa dan cara menyelenggarakannya.|Explain the principle and running of 2 types of outboard motor over 2 hp and how to maintain them.","Menjalankan jentera motobot 4 kuda kuasa atau enjin laut diesel; ATAU membuka, mencuci dan memasang enjin sangkut serta memasangnya pada bot.|Run a 4 hp outboard or a marine diesel; OR strip, clean and refit an outboard and fit it to a boat."])]},
  {id:"penukang", n:"Ahli Penukang|Craftsman", ic:"🔨", pick:3, parts:[
    P("Bahagian A (pembuat bakul)|Part A (basket making)", ["Membuat sendiri benda yang boleh digunakan sebagai bakul daripada rotan, rumput atau jerami.|Make a basket-type object from rattan, grass or straw.","Mengetahui tempat mendapat bahan mentah dan cara memprosesnya.|Know where to get the raw materials and how to process them."]),
    P("Bahagian B (penjilid buku)|Part B (bookbinding)", ["Memelihara bahan bacaan (buku, majalah, nota): teknik, media, proses.|Care for reading material (books, magazines, notes): techniques, media, process.","Kemasan dan persembahan.|Finish and presentation.","Penilaian dan pemeliharaan; cara menyimpan dan menggunakan buku.|Judging, care, storing and using books."]),
    P("Bahagian C (penyambung kayu)|Part C (joinery)", ["Memasukkan skru sedalam 3.5 cm tanpa merosakkan kayu atau skru.|Drive a screw 3.5 cm deep without damaging the wood or screw.","Memaku penutup peti dengan betul (papan 2 cm, paku 3.5 cm).|Nail a box lid correctly (2 cm board, 3.5 cm nails).","Membelah sekeping papan 2.5 cm tebal, 60 cm panjang dengan gergaji biasa.|Rip a board 2.5 cm thick and 60 cm long with an ordinary saw.","Mengasah pahat dan mata ketam, membuat lubang tanggam dan sambungan separuh.|Sharpen a chisel and plane iron; make a mortise and a half joint.","Membuat sebuah bangku (stool) atau kerusi.|Make a stool or chair.","Mengetahui jenis kayu: 2 lembut, 2 serbaguna keras dan 3 keras.|Know the woods: 2 soft, 2 general hardwoods and 3 hard."]),
    P("Bahagian D (tukang kulit)|Part D (leatherwork)", ["Membuat tumit sepatu but atau tumit sepatu biasa dengan kulit, ATAU satu barang kulit sendiri (rantai kunci, wogel, sarung kapak/pisau, dompet).|Make a boot or shoe heel in leather, OR a leather item of your own (key ring, woggle, axe/knife sheath, wallet).","Mengetahui alatan dan bahan yang digunakan; jenis kulit dan cara memilihnya.|Know the tools and materials; the kinds of leather and how to choose.","Mencampur dan menggunakan pewarna dalam pelbagai campuran warna.|Mix and use dyes in different colours."]),
    P("Bahagian E (percetakan)|Part E (printing)", ["Menyusun rangka surat sebaran, menaip dan mencetaknya.|Set out a circular letter, type and print it.","Mengenali jenis huruf percetakan mengikut saiz (point-system) dan namakan enam jenis.|Know the sizes of type (the point system) and name six kinds.","Mengetahui tanda pembetulan percetakan dan nama pelbagai bentuk kertas.|Know the printing correction marks and the names of paper shapes."])]},
  {id:"perahu", n:"Ahli Perahu Dayung|Rowing", ic:"🚣", parts:[P("", [
    "Berenang 20 meter dengan memakai pakaian lengkap.|Swim 20 metres fully clothed.",
    "Melukis dan menamakan semua bahagian perahu.|Draw and name all the parts of a boat.",
    "Mengetahui alatan perahu dayung dan cara mengatur; membaiki kerosakan kecil; ikatan water bowline, double sheet bend, fisherman's bend, round turn & two half hitches; mengawal hujung tali.|Know the rowing gear and how to stow it; repair small faults; the water bowline, double sheet bend, fisherman's bend and round turn & two half hitches; whip rope ends.",
    "Pengetahuan langkah keselamatan menggunakan perahu dayung.|Know the safety steps for using a rowing boat.",
    "Berdayung seorang diri: mendekatkan perahu ke tembok tinggi, tepi pantai dan tebing sungai; berkayuh ke hadapan, ke belakang dan berpusing.|Row alone: bring the boat alongside a high wall, a beach and a river bank; row forward, backward and turn."])]},
  {id:"perhubungan", n:"Ahli Perhubungan|Communications", ic:"📡", pick:1, parts:[
    P("Bahagian A (semaphore dan Morse)|Part A (semaphore and Morse)", ["Memahami semaphore dan kegunaannya; isyarat huruf A–Z, nombor 0–9 dan isyarat penting lain.|Understand semaphore and its use; the letters A–Z, numbers 0–9 and other important signals.","Menghantar dan menerima berita mudah seperti panggilan kecemasan S.O.S.|Send and receive simple messages such as an S.O.S. emergency call.","Menghantar dan menerima berita dengan kod Morse menggunakan buzzer sejauh 100 meter.|Send and receive Morse by buzzer over 100 metres."]),
    P("Bahagian B (radio amatur)|Part B (amateur radio)", ["Menyimpan Buku Log 3 bulan penerimaan berita dari 20 stesen amatur (tarikh, masa, gelaran panggilan, kekuatan signal, pendengaran, tempat); membincangkan pengalaman dengan Penilai.|Keep a 3-month log of messages from 20 amateur stations (date, time, call sign, signal strength, readability, place); discuss your experience.","Membincangkan gelombang (frequency bands) dan yang sesuai untuk siang dan malam.|Discuss frequency bands and which suit day and night.","Menerangkan sekurang-kurangnya 10 jenis semboyan 'Q' antarabangsa.|Explain at least 10 international Q codes.","Peraturan SKMM berkenaan penggunaan walkie-talkie.|The SKMM rules on using walkie-talkies."])]},
  {id:"perhutanan", n:"Ahli Perhutanan|Forestry", ic:"🌳", parts:[P("", [
    "Mengenali 15 jenis pokok tempatan dan juga pokok lain berpandukan bahan rujukan.|Know 15 kinds of local trees and others with reference material.",
    "Mengetahui menanam dan memelihara pokok dan tumbuhan; sebab pokok dan tumbuhan musnah (api, cuaca, binatang, serangga).|Know how to plant and care for trees; why they are destroyed (fire, weather, animals, insects).",
    "Menyediakan tapak semaian dengan baja yang sesuai.|Prepare a seed bed with suitable fertiliser.",
    "Memilih dan menggunakan kapak, menjaganya, peraturan keselamatan dan menyimpan kapak.|Choose and use an axe, look after it, its safety rules and storage.",
    "Menebang sebatang pokok, memotong dahan dan ranting serta menyusunnya.|Fell a tree, trim branches and twigs and stack them.",
    "Membuat kajian tumbuh-tumbuhan di Hutan Simpanan Kerajaan / Hutan Lipur.|Study plants in a Government Forest Reserve / recreational forest."])]},
  {id:"pelihat", n:"Pelihat|Observer", ic:"🔭", parts:[P("", [
    "Permainan Kim: mengingati 20 daripada 25 benda selepas melihat selama satu minit; dua kali berturut-turut.|Kim's game: remember 20 of 25 items after a minute's look, twice in a row.",
    "Mengenali 8 daripada 10 jenis bunyi yang senang dengan mendengar sahaja.|Identify 8 of 10 common sounds by ear alone.",
    "Membuat laporan lisan kurang daripada satu minit tentang kejadian dengan 3 orang pelakon; menjawab soalan.|Give an oral report in under a minute on an incident acted by 3 people; answer questions.",
    "Membuat enam acuan plaster jejak burung dan binatang (dua daripadanya burung atau binatang liar) dan kesan tayar; berlabel tarikh dan tempat.|Make six plaster casts of bird and animal tracks (two wild) and tyre marks, labelled with date and place.",
    "Mengikuti satu jejak sejauh 1.5 km dengan sekurang-kurangnya 25 jenis kesan binatang, kenderaan dll.|Follow a trail of 1.5 km with at least 25 kinds of track (animals, vehicles etc)."])]},
  {id:"pengembara", n:"Pengembara|Explorer", ic:"🧭", parts:[P("", [
    "Mengembara berjalan kaki, berbasikal, berperahu atau berakit bersama dua Pengakap sekurang-kurangnya 2 hari 1 malam ke tempat yang belum dilawati, membawa alatan dan bekalan cukup.|Travel on foot, bicycle, boat or raft with two Scouts for at least 2 days and 1 night to a new place, carrying enough gear and food.",
    "Mengetahui persediaan pengembaraan dan menyusun alatan; menyediakan rancangan.|Know how to prepare and pack for an expedition and make a plan.",
    "Merancang projek berhubung pengembaraan: peta jalan kampung dan taliair dalam lingkungan dua kilometer; tunjukkan rancangan kepada Penilai.|Plan a related project: a map of village paths and waterways within two kilometres; show the plan.",
    "Mengembara dengan seorang Pengakap lain sejauh 10 km berpandukan kompas dan peta sahaja.|Hike 10 km with another Scout using only compass and map."])]},
  {id:"tukangmasak", n:"Tukang Masak|Cook", ic:"👨‍🍳", parts:[P("", [
    "Terma masakan umum: tumis, cincang, parut, seram kuku, manis-manis buah dll.|Common cooking terms: sauté, chop, grate, simmer, fruit sweets etc.",
    "Menyediakan dan memasak dua daripada: telur goreng, pisang goreng, bubur kacang, sambal tumis, sup, masak kicap, asam pedas, sayur campur.|Prepare and cook two of: fried egg, fried banana, bean porridge, sambal tumis, soup, soy-sauce dish, asam pedas, mixed vegetables.",
    "Memasak dan menghidangkan untuk 2–4 tetamu: nasi putih, kari daging, sejenis masakan sayur, manisan, kopi atau teh.|Cook and serve for 2–4 guests: rice, meat curry, a vegetable dish, a sweet, coffee or tea.",
    "Prinsip memotong dan menghiris daging lembu/kambing dan ayam, sebelum dan selepas dimasak.|The principles of cutting and slicing beef/goat and chicken, before and after cooking."])]}]};

// ---------- Kepandaian: Perkhidmatan (3, Ahli Pertolongan Cemas wajib) ----------
S.perkhidmatan = {id:"perkhidmatan", n:"Lencana Kepandaian · Perkhidmatan|Kepandaian · Service", ic:"🟡", need:3, must:"pcemas", xp:75,
  about:"Selepas Pengetahuan, Pengakap Muda mendapat TIGA lagi Lencana Perkhidmatan: Ahli Pertolongan Cemas wajib dan DUA pilihan. Cincin lencana berwarna kuning.|After Pengetahuan, a Pengakap Muda earns THREE Perkhidmatan badges: Ahli Pertolongan Cemas is compulsory and TWO are optional. The badge ring is yellow.",
  wear:"Lengan kiri: tempat 6, 7 dan 8.|Left sleeve: positions 6, 7 and 8.",
  badges:[
  {id:"pcemas", n:"Ahli Pertolongan Cemas (wajib)|First Aider (compulsory)", ic:"🩹", parts:[P("", [
    "Menerangkan susunan anggota jasmani dan fungsi tiap-tiap satu.|Explain the body's parts and what each does.",
    "Mengetahui kedudukan urat nadi dan cara menghentikan keluaran darah.|Know where the pulse points are and how to stop bleeding.",
    "Menunjukkan cara memulihkan orang terkejut (shock), termasuk terkena kejutan elektrik.|Show how to treat shock, including electric shock.",
    "Menggunakan balutan tiga segi pada luka di kepala, tangan, kaki, lutut dan siku serta balutan bergulung pada anggota badan.|Use triangular bandages on wounds to the head, hand, foot, knee and elbow, and roller bandages.",
    "Mengendalikan tulang selangka patah dan menjaga tulang patah atau disyaki patah supaya tidak bergerak.|Treat a broken collarbone and keep a broken or suspected fracture still.",
    "Menunjukkan cara pemulihan pernafasan (CPR/EAR).|Show resuscitation (CPR/EAR).",
    "Menghantar berita kecemasan dengan betul secara lisan, bertulis dan telefon.|Send an emergency message correctly by mouth, in writing and by phone."])]},
  {id:"antidadah", n:"Ahli Anti-Dadah|Anti-Drugs", ic:"🚭", parts:[
    P("Tahap 1|Stage 1", ["Unit I Remaja: perubahan, masalah, penyelesaian, perhubungan.|Unit I Youth: change, problems, solutions, relationships.","Unit II Tingkah Laku Negatif: sebab dan akibat merokok, akibat dadah, akibat alkohol, sikap masyarakat.|Unit II Negative behaviour: causes and effects of smoking, effects of drugs and alcohol, society's attitude.","Unit III Tekanan dan Masalah Hidup: cabaran di dalam dan luar sekolah, khidmat bantu.|Unit III Stress and life problems: challenges inside and outside school, help services.","Unit IV Dasar Negara Mengenai Dadah: Akta Keselamatan, Akta Dadah Berbahaya.|Unit IV National drug policy: the Security Act and the Dangerous Drugs Act."]),
    P("Tahap 2|Stage 2", ["Unit I Amali (pilih DUA): menyimpan buku skrap, melukis poster, menulis esei, menyertai pertandingan.|Unit I Practical (choose TWO): a scrapbook, a poster, an essay, a competition.","Unit II Kerja Luar (pilih SATU): menyampaikan mesej anti dadah, membuat lawatan, menghadiri ceramah.|Unit II Outdoor work (choose ONE): deliver an anti-drug message, make a visit, attend a talk."])]},
  {id:"komuniti", n:"Ahli Komuniti|Community", ic:"🤝", pick:1, parts:[
    P("Bahagian A (masyarakat setempat)|Part A (local community)", ["Mengkaji perkhidmatan kemasyarakatan setempat (pendidikan, kesihatan, rekreasi, sosial); membincangkan dengan Majlis Ketua Patrol bagaimana ia dapat menunaikan keperluan masyarakat.|Study local community services (education, health, recreation, social) and discuss with the Patrol Leaders' Council how they meet needs.","Menjalankan kajian satu aspek masyarakat setempat selama sekurang-kurangnya 6 bulan.|Study one aspect of the local community for at least 6 months.","Mengambil bahagian dalam perkhidmatan kemasyarakatan sekurang-kurangnya 2 bulan.|Take part in community service for at least 2 months."]),
    P("Bahagian B (orang kurang upaya)|Part B (people with disabilities)", ["Mengetahui 3 perkara tentang kelemahan orang cacat (deria, intelek, sistem saraf, jantung dan paru-paru, fizikal, bahasa).|Know 3 things about disabilities (senses, intellect, nervous system, heart and lungs, physical, language).","Menunjukkan kesedaran dan menerangkan 4 cara membantu orang cacat.|Show awareness and explain 4 ways to help.","Menyenaraikan agensi dan penganjur yang memberi perkhidmatan kepada OKU.|List agencies and organisers who serve people with disabilities.","Berhubung giat dengan orang cacat dalam tempoh 3 bulan.|Keep in active contact with a person with a disability for 3 months.","Menunjukkan satu kemahiran: bahasa isyarat, Braille, kerusi roda atau teknik mengendalikan.|Show one skill: sign language, Braille, wheelchair or handling.","Menyiapkan satu: merakam cerpen/sajak untuk buta, mengkaji kemudahan awam, atau menemani orang buta."]),
    P("Bahagian C (polis)|Part C (police)", ["Melawat balai polis dan mengkaji organisasi, bahagian, perhubungan (radio, walkie-talkie), sistem kecemasan dan kod fonetik, serta tugas anggota polis.|Visit a police station and study its organisation, sections, communications (radio, walkie-talkie), emergency system and phonetic code, and the duties of police."])]},
  {id:"jurubahasa", n:"Jurubahasa|Interpreter", ic:"🌐", parts:[P("Lulus dalam bahasa lain selain bahasa ibunda|Pass in a language other than your mother tongue", [
    "Berceramah dengan Pengakap atas tajuk yang diberi selama sekurang-kurangnya 5 minit.|Talk to Scouts on a given subject for at least 5 minutes.",
    "Menulis satu karangan sekurang-kurangnya 150 patah perkataan.|Write an essay of at least 150 words.",
    "Menterjemahkan petikan lebih kurang 100 patah perkataan daripada surat khabar atau majalah.|Translate an extract of about 100 words from a newspaper or magazine.",
    "Menjadi jurubahasa kepada seorang pelawat luar negeri; menulis surat kepada Kumpulan Pengakap/sekolah luar negara, ATAU berkirim surat sekurang-kurangnya enam bulan.|Act as interpreter for a foreign visitor; write a letter to a Scout group or school abroad, OR correspond for at least six months."])]},
  {id:"kuartermaster", n:"Kuartermaster|Quartermaster", ic:"🗝️", pick:1, parts:[
    P("Kumpulan Ujian A (1–6)|Test group A (1–6)", ["Telah membantu Kuartermaster Kumpulan dengan baik selama enam bulan; menjaga tali-menali (pemecut, mematikan hujung tali), khemah (membaiki, menyimpan), alatan (mengasah, membaiki, menyimpan).|Helped the Group Quartermaster well for six months: ropes, tents and tools.","Cara menyimpan rekod mudah dan berkesan, termasuk catatan keluar dan masuk alatan.|How to keep simple, effective records, with signing out and in.","Cara menyimpan alatan kegunaan Pengakap, termasuk sistem warna atau kod.|How to store Scout equipment, including a colour or code system.","Cara menjaga dan menyimpan alatan pandang dengar (model, carta dinding, bahan lukisan).|How to look after audio-visual aids (models, wall charts, drawing materials).","Cara menilai barang dan harga barang yang hendak dibeli.|How to judge goods and the price of items to buy."]),
    P("Kumpulan Ujian B (7–14)", ["Telah membantu Kuartermaster dalam satu perkhemahan Pasukan atau PEK bercuti Pengakap Kanak-kanak selama lima hari.|Helped the Quartermaster at a camp for five days.","Menunjukkan cara menjaga semua alat perkhemahan: tali-menali, khemah, alatan dan alatan masak.|Show how to care for all camping gear: ropes, tents, tools and cooking equipment.","Menyimpan rekod yang mudah termasuk catatan keluar dan masuk alatan.|Keep simple records of equipment out and in.","Menyenaraikan semua alat dalam perkhemahan seperti pakaian seragam, alatan mengembara dan mendaki bukit/gunung.|List all the items in a camp such as uniform, expedition gear and mountaineering gear.","Satu daftar makanan selama 48 jam dan bersedia membincangkan dengan Penilai.|A 48-hour food list and discuss it with the assessor.","Cara mengawal penyimpanan barang makanan dalam perkhemahan.|How to control food storage in camp.","Satu senarai alatan untuk dibawa ke perkhemahan dan cara membaiki dengan segera dalam kecemasan.|A list of equipment for a camp and how to repair it quickly in an emergency.","Kebersihan sebagai kunci kejayaan seorang Kuartermaster.|Cleanliness as the key to a Quartermaster's success."])]},
  {id:"pemadam", n:"Pemadam Api|Fire Fighter", ic:"🧯", parts:[P("", [
    "Mengetahui tugas Pasukan Bomba dan Penyelamat Tempatan.|Know the duties of the local Fire and Rescue service.",
    "Bahaya api dan tindakan mencegah kebakaran di rumah: pemanas (minyak, elektrik, bahan pembakar), wayar elektrik, fius, alat gas dan minyak petrol, perhiasan rumah.|Fire hazards and preventing fires at home: heaters, wiring, fuses, gas and petrol appliances, home décor.",
    "Merancang persediaan mencegah kebakaran bagi sesuatu perhimpunan Pengakap termasuk peraturan tempat duduk.|Plan fire prevention for a Scout gathering, including seating rules.",
    "Bahaya api dalam perkhemahan dan persediaan mencegah kebakaran; punca kebakaran belukar, lalang dan cara mengawal.|Fire dangers in camp and prevention; causes of scrub and grass fires and control.",
    "Tindakan apabila berlaku kebakaran di dalam dan di luar rumah; cara memanggil Bomba dan maklumat yang diberi.|What to do in a fire indoors and outdoors; how to call the Fire Brigade and what to say.",
    "Baldi berderat, pam kaki (stirrup pump), pam tangan, pemadam api (air, asid soda, gas cartridge, karbon tetraklorida, buih) dan jenis yang sesuai bagi api tertentu.|Bucket chains, stirrup pump, hand pump and extinguishers (water, soda-acid, gas cartridge, carbon tetrachloride, foam) and which suits which fire.",
    "Mengendalikan orang yang terbakar pakaian di badannya.|Deal with a person whose clothing is on fire."])]},
  {id:"pemandu", n:"Pemandu|Guide", ic:"🧭", parts:[P("", [
    "Menunjukkan arah jalan mudah ke tempat tertentu.|Give clear directions to a given place.",
    "Membuat peta kasar menandakan: doktor, doktor haiwan, doktor gigi, hospital, klinik, ambulan; balai bomba, polis, pejabat pos, telefon, bengkel motokar; bas, keretapi; Ibu Pejabat Pengakap, tempat perhimpunan awam, taman, muzium; Pesuruhjaya Daerah dan Ketua Pengakap.|Draw a rough map marking: doctors, vets, dentists, hospitals, clinics; fire, police, post office, phone, garage; bus and train stops; Scout HQ, public places, parks, museums; District Commissioner and Group leaders.",
    "Menggunakan peta untuk pergi ke tempat yang diarahkan Penilai.|Use the map to go to a place the assessor names.",
    "Mengarahkan dengan jelas arah jalan kepada pelawat ke tapak perkhemahan sekurang-kurangnya 8 km menggunakan kenderaan awam, basikal atau kereta.|Give a visitor clear directions to a campsite at least 8 km away by public transport, bicycle or car."])]},
  {id:"pemelihara", n:"Pemelihara|Conservationist", ic:"🌍", parts:[P("", [
    "Tujuan pemeliharaan; 5 jenis tanah dan sebab tanah terhakis; hujan lebat berbanding kemarau.|The aims of conservation; 5 kinds of soil and why soil erodes; heavy rain versus drought.",
    "Sebab utama udara dan air tercemar dan akibatnya; cara mengawal pencemaran.|Main causes of air and water pollution, the effects and how to control them.",
    "Hubungan antara tumbuhan, binatang dan manusia.|How plants, animals and people depend on each other.",
    "Empat contoh, dua daripadanya di kawasan Pengakap sendiri, bagaimana alam boleh rosak dan cara dicegah.|Four examples, two in your own Scout area, of how nature is damaged and how it can be prevented.",
    "Kajian dua kawasan berlainan (satu yang ramai dikunjungi) dan terangkan hasilnya kepada Penilai: penggunaan tanah, hiburan, hidupan liar, perselisihan pengguna.|A study of two different areas (one busy) and explain the results: land use, recreation, wildlife, conflicts between users.",
    "Mengambil bahagian dalam satu projek pemeliharaan alam sekitar sekurang-kurangnya sehari.|Take part in a nature conservation project of at least one day."])]},
  {id:"pengawal", n:"Pengawal Perkhemahan|Camp Warden", ic:"🏕️", parts:[P("", [
    "Telah berkhemah sekurang-kurangnya 10 malam di sekurang-kurangnya empat tapak perkhemahan berlainan.|Camped at least 10 nights at four different campsites.",
    "Telah bertugas 7 hari di tapak perkhemahan tetap membantu Pengawal Perkhemahan.|Served 7 days at a permanent campsite helping the Camp Warden.",
    "Menunjukkan tiga daripada: menggunakan kayu arang untuk memasak, membuat unggun api, memasang khemah patrol, menyidai kain basah, mencegah kebakaran.|Show three of: cooking with charcoal, building a campfire, pitching a patrol tent, drying wet clothes, preventing fires.",
    "Menerangkan cara kerja: meja makanan, tandas, menjaga alat memasak, air minuman, alatan perkhemahan.|Explain how to do: a food table, latrines, caring for cooking gear, drinking water, camp equipment.",
    "Betapa mustahaknya menjaga taraf perkhemahan yang tinggi dan baik.|Why it matters to keep a high standard of camping.",
    "Menyediakan peti pertolongan cemas untuk satu patrol perkhemahan selama 7 hari.|Prepare a first-aid kit for a patrol camp of 7 days.",
    "Menggunakan tiga daripada: kapak penebang, gergaji, alat ketuk, mesin ringan.|Use three of: felling axe, saw, hammering tools, light machines.",
    "Membincangkan bagaimana tapak perkhemahan tetap boleh diperbaiki.|Discuss how a permanent campsite can be improved."])]},
  {id:"penyelamat", n:"Penyelamat Nyawa|Life Saver", ic:"🛟", parts:[P("", [
    "Telah memperolehi Lencana Ahli Renang.|Hold the Ahli Renang badge.",
    "Menunjukkan dua cara penyelamatan bagi melepaskan diri pertama di darat dan kedua di dalam air.|Show two rescue methods: the first from land and the second in the water.",
    "Menunjukkan chin tow, cross tow dan extended tow.|Show the chin tow, cross tow and extended tow.",
    "Melemparkan tali penyelamat sejauh 10 meter ke antara 2 pacang jarak 1 meter, 2 kali daripada 3 lemparan.|Throw a rescue line 10 m between 2 posts 1 m apart, 2 times out of 3.",
    "Menyelamatkan mangsa dari rumah terbakar yang terhidu gas racun, dan yang kena kejutan elektrik.|Rescue a casualty from a burning house who inhaled toxic gas, and one suffering electric shock.",
    "Pemulihan pernafasan mulut ke mulut (CPR/EAR) dengan patung.|Mouth-to-mouth resuscitation (CPR/EAR) on a manikin."])]},
  {id:"setiausaha", n:"Setiausaha|Secretary", ic:"✍️", parts:[P("", [
    "Mengetahui peraturan pentadbiran PPM di peringkat Kumpulan dan Daerah; menyusun dan menyimpan alatan persuratan.|Know PPM's administrative rules at Group and District level; organise and keep stationery and correspondence.",
    "Di hadapan Penilai: menulis karangan 250 patah perkataan, ATAU menaip 100 patah perkataan dengan tidak lebih 5 kesalahan.|Before the assessor: write an essay of 250 words, OR type 100 words with no more than 5 mistakes.",
    "Peraturan mesyuarat jawatankuasa; menyediakan aturcara dan minit mesyuarat.|The rules for committee meetings; prepare an agenda and minutes.",
    "Hal ehwal pengurusan kewangan Kumpulan: kira-kira penerimaan dan perbelanjaan, cara menyimpan wang dan bank.|Group finances: income and expenditure accounts, keeping money and banking.",
    "Menulis surat atas tajuk diberi; draf kad jemputan untuk upacara Kumpulan atau Patrol.|Write a letter on a given subject; draft an invitation card for a Group or Patrol ceremony.",
    "Urusan dengan Pejabat Pos: kadar pos dalam Malaysia, bungkusan, pos berdaftar, pos laju dan pengiriman luar negeri.|Dealing with the Post Office: rates, parcels, registered and express post, overseas mail.",
    "Menyediakan keluaran berita untuk Majalah Pengakap tentang satu peristiwa Kumpulan atau Daerah.|Write a news item for the Scout magazine on a Group or District event.",
    "Mengendalikan urusan pengurusan fail.|Handle file management."])]}]};

// ---------- Jaya ----------
S.jaya = {id:"jaya", n:"Lencana Jaya|Jaya badge", ic:"🟡", xp:300,
  about:"Diberi untuk mengiktiraf kebolehan, keberanian dan penghargaan diri dalam menjalankan tanggungjawab dan kepimpinan Ketua Patrol, khidmat masyarakat, cabaran aktiviti luar, komunikasi radio amatur, ilmu pertolongan cemas dan penyelamat nyawa. Syarat: Lencana Maju dan Lencana Kepandaian (TIGA Pengetahuan dan TIGA Perkhidmatan).|Given for ability, courage and self-respect in carrying out the duties and leadership of a Patrol Leader, community service, outdoor challenge, amateur radio, first aid and life-saving. Needs Maju and the Kepandaian badges (THREE Pengetahuan and THREE Perkhidmatan).",
  wear:"Lengan kanan, menggantikan Lencana Maju.|Right sleeve, in place of the Maju badge.",
  parts:[
  P("A. Cita-Cita Pengakap|A. Scouting ideals", ["Organisasi Ibu Pejabat PPM, Biro Pengakap Sedunia dan Biro Wilayah Asia Pasifik.|The organisation of PPM Headquarters, the World Scout Bureau and the Asia-Pacific Regional Bureau.","Sejarah tertubuhnya Malaysia.|How Malaysia was formed.","Jata Kebangsaan dan Lambang Negeri.|The national coat of arms and your State emblem.","Tugas kerja Dewan Undangan Negeri.|The work of the State Legislative Assembly.","Mengenali Ketua Pengakap Negara dan Ketua Pesuruhjaya Pengakap Negara.|Know the Chief Scout and the Chief Commissioner of Malaysia."]),
  P("B. Kecergasan dan Kesegaran Jasmani|B. Fitness", ["Latihan asas perbarisan.|Basic drill.","Kawad Tongkat semasa berjalan.|Staff drill on the march.","Halangan Komando.|The commando obstacle course."]),
  P("C. Kepimpinan|C. Leadership", ["Menghadiri Kursus Ketua Patrol ATAU melatih 2 orang untuk Lencana Maju.|Attend a Patrol Leaders' course OR train 2 others for the Maju badge.","Kebolehan: merancang dan menjalankan pengembaraan; merancang Malam Pengakap; menjalankan Mesyuarat Ketua Patrol.|Ability to plan and run an expedition, plan a Scout night and run a Patrol Leaders' meeting.","Membawa bendera.|Carry the flag."]),
  P("D1. Kejayaan · Kumpulan I Cabaran (SATU)|D1. Achievement · Group I Challenge (ONE)", ["Mendayung perahu ATAU melayarkan sampan layar.|Paddle a boat OR sail a sailing boat.","Mendaki bukit.|Climb a hill.","Pengembaraan malam selama 8 jam.|A night expedition of 8 hours."], 1),
  P("D2. Kumpulan II Amali (SATU)|D2. Group II Practical (ONE)", ["Pekerjaan tangan / tukang gambar.|Handwork / drawing.","Mekanik.|Mechanics.","Kod fonetik antarabangsa.|The international phonetic code.","Khidmat masyarakat.|Community service."], 1),
  P("D3. Kumpulan III Kesungguhan|D3. Group III Endeavour", ["Pengembaraan 24 km berjalan kaki atau 50 km berbasikal dalam patrol, bermalam dengan mendirikan khemah; laporan bertulis.|A 24 km hike or 50 km bicycle trip in a patrol, camping overnight; a written report.","Buku Log.|The log book.","Gimnastik / seni mempertahankan diri.|Gymnastics / self-defence.","Membuat bekalan daripada makanan kering.|Make rations from dry food.","SATU kegiatan luar: memanah, memancing, kajian barang purba, kajian isi bumi atau pemeliharaan alam sekitar.|ONE outdoor activity: archery, fishing, a study of antiquities or geology, or conservation."]),
  P("D4. Kumpulan IV Masyarakat|D4. Group IV Community", ["Menyedia, memasak dan melayan.|Prepare, cook and serve.","Pertunjukan hiburan amatur.|An amateur entertainment.","Perkhidmatan dan menjalankan Malam Pengakap.|Serving at and running a Scout night."]),
  P("D5. Kumpulan V Kemahiran Berpengakap|D5. Group V Scout skills", ["Simpulan & ikatan: Simpul Abah-Abah (manharness), Lilit Tindih Kejap (rolling hitch), Simpul Ngah (middleman's), Tindih Kasih Air (water bowline), Ikatan Pengail (fisherman's), Sambatan Mata (eye splice), Lilit Ular/Kacang (floor/snake lashing), Ikat Silang Tungku (tripod/figure-8 lashing).|Knots & lashings: manharness knot, rolling hitch, middleman's knot, water bowline, fisherman's knot, eye splice, floor/snake lashing, tripod/figure-8 lashing.","Mendirikan pondok sementara (bivouac).|Build a temporary shelter (bivouac).","Projek perintis.|A pioneering project."]),
  P("E. Perkhidmatan|E. Service", ["Rawatan dan pertolongan cemas (rawatan patah tulang, usungan pesakit).|Treatment and first aid (fractures, stretchers).","Kegunaan kayu tuap.|The use of a splint.","Sistem pemulihan nafas mulut ke mulut.|Mouth-to-mouth resuscitation.","Perkhidmatan 6 jam.|6 hours of service."])]};

// ---------- Rambu ----------
S.rambu = {id:"rambu", n:"Tanda Cemerlang Rambu Pengakap Muda|Rambu Pengakap Muda (Excellence award)", ic:"🏅", xp:400,
  about:"Anugerah Ketua Pesuruhjaya Negara. Seorang Pengakap mesti telah memegang Lencana Jaya selama 3 BULAN dan menunjukkan sikap serta tingkah laku yang baik dan boleh dicontohi. Pesuruhjaya Daerah atau Penolongnya memberi anugerah apabila layak. Ini anugerah tertinggi Pengakap Muda sebelum Anugerah Pengakap Raja.|The Chief Commissioner's award. A Scout must have held the Jaya badge for 3 MONTHS and show good, exemplary attitude and behaviour. The District Commissioner or an assistant gives it when eligible. It is the highest Pengakap Muda award before the Pengakap Raja award.",
  wear:"Rambu hijau dipakai pada bahu; wisel dipasang pada Rambu jika penerima ialah Ketua Patrol atau Penolong Ketua Patrol.|The green Rambu cord is worn on the shoulder; a whistle is fitted to it if the holder is a Patrol Leader or Assistant Patrol Leader.",
  parts:[P("", ["Telah memegang Lencana Jaya sekurang-kurangnya 3 bulan.|Held the Jaya badge for at least 3 months.","Menunjukkan sikap dan tingkah laku yang baik dan boleh dicontohi.|Shown good, exemplary attitude and behaviour.","Disahkan oleh Pesuruhjaya Daerah atau Penolongnya.|Confirmed by the District Commissioner or an assistant."])]};

// ---------- uniform: where the badges go ----------
S.wear = [
  ["Lencana Keahlian|Keahlian badge", "Saku kiri; bendera Malaysia pada saku kanan.|Left pocket; the Malaysia flag on the right pocket."],
  ["Lengan kanan|Right sleeve", "Tab NEGERI (cth JOHOR), tab DAERAH, nombor KUMPULAN, kemudian Lencana Usaha → Maju → Jaya.|STATE tab, DISTRICT tab, GROUP number, then the badge Usaha → Maju → Jaya."],
  ["Lengan kiri|Left sleeve", "Tab nama PATROL; di bawahnya Lencana Kepandaian: Kegemaran (1, 2), Pengetahuan (3, 4, 5), Perkhidmatan (6, 7, 8).|PATROL name tab; below it the Kepandaian badges: Kegemaran (1, 2), Pengetahuan (3, 4, 5), Perkhidmatan (6, 7, 8)."],
  ["Rambu|Rambu cord", "Rambu hijau di bahu kiri; wisel hanya untuk Ketua Patrol dan Penolong Ketua Patrol.|The green Rambu cord on the shoulder; the whistle only for the Patrol Leader and Assistant."]];
S.manage = [["Lulus Lencana Keahlian|Pass Keahlian", "Tingkatan 1 (atau Istiadat Meningkat Naik)|Form 1 (or the Moving-Up Ceremony)"], ["Lulus Lencana Usaha|Pass Usaha", "Tingkatan 1|Form 1"], ["Lulus Lencana Kegemaran|Pass Kegemaran", "Tingkatan 1|Form 1"], ["Lulus Lencana Maju|Pass Maju", "Tingkatan 2|Form 2"], ["Lulus Lencana Pengetahuan / Perkhidmatan|Pass Pengetahuan / Perkhidmatan", "Tingkatan 2|Form 2"], ["Lulus Lencana Jaya|Pass Jaya", "Tingkatan 3|Form 3"], ["Memakai Rambu Pengakap Muda|Wear the Rambu", "Pertengahan Tingkatan 3|Mid Form 3"]];
U.scheme.pengakap = S;
})();
