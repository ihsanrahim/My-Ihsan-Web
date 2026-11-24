/* My Ihsan 0.7.44 · School › Uniformed bodies (Pengakap, TKRS/KRS, PBSM). Content from the owner's "Uniform Academy 3D" guide.
   Strings are "Bahasa Melayu|English" (one string = same in both). Colours identify each body; no emblems or logos are drawn
   (the Red Crescent emblem is protected by law and the others need written permission). Check exact wording against your unit's manual. */
window.UA = (function(){
var LV = [["Rekrut|Recruit", 0], ["Ahli|Member", 300], ["Mahir|Skilled", 900], ["Pemimpin|Leader", 2000], ["Jurulatih|Trainer", 4000]];
var BLUE = [
  ["Teori|Theory", "40%", "30 MCQ + 5 jawapan pendek, 40 min|30 MCQ + 5 short answers, 40 min", "60%"],
  ["Amali (simulasi + sebenar)|Practical (sim + live)", "50%", "3 stesen × 8 min, ikut rubrik|3 stations × 8 min, rubric-marked", "70%"],
  ["Sikap & kehadiran|Attitude & attendance", "10%", "Log guru (≥ 75% hadir, pakaian, khidmat)|Teacher log (≥ 75% attendance, uniform, service)", "Disahkan|Signed off"]];
var RUBRIC = [
  ["Ketepatan|Accuracy", "Setiap langkah betul|Every step correct", "Silap kecil|Minor slips", "Tidak selamat atau salah|Unsafe or wrong"],
  ["Kelajuan|Speed", "Dalam masa sasaran|Within the target time", "Hingga +50%|Up to +50%", "Lebih dua kali ganda|More than double"],
  ["Keyakinan & suara|Confidence & voice", "Jelas, tenang, memimpin|Clear, calm, leads", "Teragak-agak|Hesitant", "Tidak dapat siap|Can't complete"],
  ["Keselamatan|Safety", "Periksa tempat, guna PPE, ikut peraturan|Checks the scene, uses PPE, follows the rules", "Terlepas satu semakan|One missed check", "Tidak selamat → gagal terus|Unsafe → auto-fail"],
  ["Kerja berpasukan|Teamwork", "Mengarah orang lain dengan baik|Directs others well", "Bekerja bersama|Works alongside", "Bertentangan dengan pasukan|Works against the team"]];
var GRADES = [["A ≥ 85", "Cemerlang|Excellent"], ["B 70–84", "Kepujian|Credit"], ["C 60–69", "Lulus|Pass"], ["< 60", "Ulang (ambil semula selepas 2 minggu)|Retake after 2 weeks"]];
var YEAR = [
  ["Penggal 1|Term 1", "L1 Asas (identiti, keselamatan) 6 minggu · L2 Kemahiran teras 6 minggu|L1 Basics (identity, safety) 6 wks · L2 Core skills 6 wks"],
  ["Penggal 2|Term 2", "L3 Kemahiran gunaan + misi 8 minggu · Peperiksaan pertengahan tahun (hujung Mei)|L3 Applied skills + missions 8 wks · Mid-year exam (end May)"],
  ["Penggal 3|Term 3", "L4 Kepimpinan + kem/kembara 10 minggu · L5 Bimbing + pertandingan 8 minggu · Peperiksaan akhir & lencana (Nov)|L4 Leadership + camp/expedition 10 wks · L5 Mentoring + competitions 8 wks · Final exam & badges (Nov)"]];
var WEEK = [["Isn|Mon", "3 kad belajar|3 Learn cards"], ["Sel|Tue", "Latihan 3D|3D drill"], ["Rab|Wed", "Kuiz 10 soalan|10-question quiz"], ["Khm|Thu", "Latihan 3D|3D drill"], ["Jum|Fri", "Misi/amali kecil|Mission / small practical"], ["Sab|Sat", "Latihan sebenar di unit|Real-life practice at the unit"], ["Ahd|Sun", "Rehat, semak 🔥 streak|Rest, review your 🔥 streak"]];
var SPRINT = ["M1–2: peperiksaan diagnostik → baiki jurang|W1–2: diagnostic exam → fix gaps", "M3–4: latihan harian 3 kemahiran terlemah|W3–4: daily drills on the weakest 3 skills", "M5–6: simulasi penuh bermasa|W5–6: full timed simulations", "M7: peperiksaan percubaan dengan guru|W7: mock exam with a teacher", "M8: kemas, rehat, semak kit|W8: polish, rest and kit check"];

var PGK = {
  id:"pengakap", ic:"🏕️", n:"Pengakap", nn:"Pengakap|Scouts", full:"Persekutuan Pengakap Malaysia (PPM)", motto:"Selalu Sedia|Be Prepared",
  col:{p:"#4B2A7B", a:"#E3B23C", k:"#C8A96A", g:"#2E5E3E", d:"#2D1A4D"},
  about:"Pengakap Kanak-kanak → Muda → Remaja → Kelana|Cubs → Scouts → Senior Scouts → Rovers",
  facts:[
    ["Pengasas|Founder", "Lord Robert Baden-Powell (B-P)"],
    ["Kelahiran|Birth of Scouting", "Kem Pulau Brownsea 1907; Scouting for Boys 1908|1907 Brownsea Island camp; Scouting for Boys 1908"],
    ["Di Tanah Melayu|In Malaya", "Pasukan pertama di Pulau Pinang sekitar 1908–1910|First troops formed in Penang around 1908–1910"],
    ["Cogankata|Motto", "Selalu Sedia · Kanak-kanak: Buat Sebaik-baiknya|Be Prepared · Cubs: Do Your Best"],
    ["Hormat|Salute", "Tiga jari: tiga bahagian Persetiaan|Three fingers: the three parts of the Promise"],
    ["Jabat tangan|Handshake", "Tangan kiri|Left hand"],
    ["Budi baik|Good turn", "Satu perbuatan baik setiap hari|One good deed every day"],
    ["Hari Pengasas|Founder's Day", "22 Februari|22 February"]],
  note:"Hafal perkataan tepat Persetiaan dan Undang-undang daripada Buku Panduan PPM anda; peperiksaan menanda perkataannya.|Memorise the exact PPM wording of the Promise and Law from your handbook; the exam marks the wording.",
  mods:[
    ["P1","🏛️","Sejarah & Cita-cita|History & Ideals",["B-P, cogankata, hormat|B-P, motto, salute","Persetiaan dan Undang-undang, tepat perkataan|Promise and Law, word-perfect","Pengakap Sedunia (WOSM), struktur PPM|World Scouting (WOSM), PPM structure","Ajar cita-cita kepada junior|Teach the ideals to juniors"]],
    ["P2","🪢","Simpulan & Ikatan|Knots & Lashings",["4 simpulan asas|4 basic knots","8 simpulan + ikatan hujung|8 knots + whipping","3 ikatan, bina gajet|3 lashings, build a gadget","Projek pioneering (menara atau jambatan)|Pioneering project (tower or bridge)"]],
    ["P3","🚩","Kawad & Upacara|Drill & Ceremony",["Baris, hormat, senang diri|Fall in, salute, at ease","Menaikkan dan menurunkan bendera|Flag raising and lowering","Pimpin upacara pasukan|Lead a troop ceremony","Rancang program unggun api|Plan a campfire programme"]],
    ["P4","🧭","Peta & Kompas|Map & Compass",["8 arah kompas|8 compass points","Bearing, simbol peta|Bearings, map symbols","Rujukan grid 6 angka, kontur|6-figure grid reference, contours","Rancang dan pimpin laluan hiking|Plan and lead a hike route"]],
    ["P5","⛺","Perkhemahan|Camping",["Senarai kit, bahagian khemah|Kit list, tent parts","Dirikan dan runtuhkan khemah, susun atur tapak|Pitch and strike a tent, campsite layout","Jenis api, masak di kem|Fire types, camp cooking","Pimpin kem 3 hari|Lead a 3-day camp"]],
    ["P6","👣","Jejak & Isyarat|Tracking & Signals",["Tanda jejak|Tracking signs","Kod Morse|Morse code","Semaphore","Reka permainan besar|Wide game design"]],
    ["P7","🩹","Pertolongan Cemas|First Aid",["DRSABC, luka kecil|DRSABC, minor cuts","Melecur, terseliuh, anduh|Burns, sprains, slings","CPR, tercekik|CPR, choking","Bertugas di pos pertolongan cemas|First-aid post duty"]],
    ["P8","🤝","Khidmat & Kepimpinan|Service & Leadership",["Diari budi baik|Good turn diary","Peranan patrol|Patrol roles","Ketua Patrol (PL)|Patrol Leader (PL)","Projek komuniti (tahap Raja)|Community project (Raja level)"]]],
  sheets:[
    {t:"🪢 Simpulan (nama Melayu)|🪢 Knots (Malay names)", head:["Melayu|Malay","Inggeris|English","Guna|Use"], rows:[
      ["Simpul Buku Sila","Reef knot","Sambung tali sama besar; balutan|Joining equal ropes; bandages"],
      ["Bunga Geti","Sheet bend","Sambung tali tidak sama besar|Joining unequal ropes"],
      ["Simpul Manuk","Clove hitch","Mula dan tamat ikatan; ikat pada tiang|Starting and ending lashings; tying to a pole"],
      ["Tindih Kasih","Bowline","Gelung tidak tergelincir; menyelamat|A loop that won't slip; rescue"],
      ["Simpul Simpul Pulih","Sheepshank","Memendekkan tali|Shortening a rope"],
      ["Simpul Lilit Balak","Timber hitch","Seret kayu balak; mula ikatan serong|Dragging logs; starting a diagonal lashing"],
      ["Simpul Lilit Dua Simpul","Round turn & two half hitches","Kunci pada tiang di bawah beban|Securing to a post under load"],
      ["Lilit Pemati Biasa","Whipping","Elak hujung tali terurai|Stopping rope ends fraying"]]},
    {t:"📋 Ikatan, jejak, kompas, Morse, api|📋 Lashings, tracking, compass, Morse, fire", list:[
      "Ikatan: Seraya (segi empat) · Serong (menyilang) · Ikat Silang Gunting (gunting)|Lashings: Ikat Seraya (square) · Ikat Serong (diagonal) · Ikat Silang Gunting (shear)",
      "Tanda jejak: ➡️ anak panah = ikut sini · ✖️ silang = jangan ikut · ⭕ bertitik = sudah pulang / tamat · ③ batu = mesej tersembunyi berdekatan|Tracking signs: ➡️ arrow = this way · ✖️ cross = not this way · ⭕ with a dot = gone home / end · ③ stones = message hidden nearby",
      "Kompas: Utara (U) 0°/360° · Timur (T) 90° · Selatan (S) 180° · Barat (B) 270°|Compass: North (U) 0°/360° · East (T) 90° · South (S) 180° · West (B) 270°",
      "Morse: SOS ··· ––– ··· · E · · T – · A ·– · N –·",
      "Jenis api: teepee (panas cepat), log cabin (bara untuk masak), bintang (perlahan, tahan lama). Jangan tinggalkan kesan: bawa balik sampah.|Fires: teepee (quick heat), log cabin (cooking coals), star (slow, long-lasting). Leave No Trace: pack it in, pack it out."]}],
  quiz:[
    ["Siapa pengasas Pengakap?|Who founded Scouting?", ["Henry Dunant","Baden-Powell","Tunku Abdul Rahman"], 1, "Lord Robert Baden-Powell (B-P) mengasaskan Pengakap.|Lord Robert Baden-Powell (B-P) founded Scouting."],
    ["Cogankata Pengakap ialah…|The Scout motto in BM is…", ["Buat Sebaik-baiknya","Selalu Sedia","Sedia Berkhidmat"], 1, "“Selalu Sedia” = Be Prepared. “Buat Sebaik-baiknya” ialah moto Kanak-kanak.|“Selalu Sedia” = Be Prepared. “Buat Sebaik-baiknya” is the Cubs motto."],
    ["Tiga jari pada hormat melambangkan…|The three fingers of the salute stand for…", ["tiga bahagian Persetiaan|the three parts of the Promise","tiga patrol|three patrols","tiga warna|three colours"], 0, "Tiga bahagian Persetiaan: tugas, membantu orang, patuh Undang-undang.|The three parts of the Promise: duty, helping others, obeying the Law."],
    ["Pengakap berjabat tangan dengan tangan…|Scouts shake hands with the…", ["kanan|right","kiri|left","kedua-dua|both"], 1, "Jabat tangan kiri.|The left hand."],
    ["Simpulan untuk menyambung dua tali yang sama besar ialah…|The knot for joining two ropes of the same size is…", ["Manuk","Buku Sila","Tindih Kasih"], 1, "Simpul Buku Sila (reef knot) menyambung tali sama besar.|The reef knot (Buku Sila) joins ropes of equal size."],
    ["Simpulan mana membuat gelung yang tidak tergelincir?|Which knot makes a loop that won't slip?", ["Tindih Kasih","Simpul Pulih","Lilit Balak"], 0, "Tindih Kasih (bowline).|The bowline (Tindih Kasih)."],
    ["Ikatan untuk menyambung dua tiang pada sudut 90° ialah…|A lashing for joining two poles at 90° is…", ["Seraya","Ikat Silang Gunting","Serong"], 0, "Ikatan Seraya (square lashing).|The square lashing (Seraya)."],
    ["Bearing 90° menghala ke…|A bearing of 90° points…", ["utara|north","timur|east","selatan|south"], 1, "0° utara, 90° timur, 180° selatan, 270° barat.|0° north, 90° east, 180° south, 270° west."],
    ["SOS dalam Morse ialah…|SOS in Morse is…", ["···–––···","–––···–––","·–·–·–"], 0, "SOS = tiga titik, tiga garis, tiga titik.|SOS = three dots, three dashes, three dots."],
    ["Hari Pengasas ialah pada…|Founder's Day is on…", ["31 Ogos|31 August","22 Februari|22 February","1 Januari|1 January"], 1, "22 Februari, hari lahir B-P.|22 February, B-P's birthday."],
    ["Api terbaik untuk bara masakan yang stabil ialah…|The best fire for steady cooking coals is…", ["teepee","log cabin","bintang|star"], 1, "Log cabin memberi bara yang stabil untuk memasak.|The log cabin gives steady coals for cooking."],
    ["“Leave No Trace” bermaksud…|“Leave No Trace” means…", ["tanam semua sampah|bury all rubbish","bawa semua sampah keluar|take all rubbish out with you","bakar plastik|burn plastic"], 1, "Bawa masuk, bawa keluar.|Pack it in, pack it out."]],
  stations:[
    ["Ikat 4 simpulan dalam 3 minit|Tie 4 knots in 3 min","Sebut Persetiaan|Recite the Promise"],
    ["8 simpulan + ikatan hujung|8 knots + whipping","Berjalan ikut bearing 4 arah|A 4-point bearing walk"],
    ["Ikatan Seraya + dirikan khemah|Square lashing + pitch a tent"],
    ["Bina gajet pioneering|Build a pioneering gadget","Laluan rujukan grid 6 angka|6-figure grid route"],
    ["Pimpin patrol hiking semalaman|Lead a patrol on an overnight hike"]],
  daily:[["2 min: Buku Sila ×5|2 min: Reef knot ×5"],["2 min: Manuk pada tiang ×5|2 min: Clove hitch on a pole ×5"],["2 min: Tindih Kasih, mata tertutup ×3|2 min: Bowline, eyes closed ×3"],["3 min: ikatan seraya ×1|3 min: square lashing ×1"],["3 min: bearing kompas ×4|3 min: compass bearings ×4"],["3 min: kuiz 5 soalan|3 min: 5-question quiz"]],
  explore:["Kem daerah, Jambori negeri dan kebangsaan|District camps, state and national Jamboree","Pertandingan pioneering, orienteering, campcraft|Pioneering, orienteering, campcraft competitions","Keris Emas → Rambu → Pengakap Raja|Keris Emas → Rambu → King's Scout (Pengakap Raja)"]
};

var KRS = {
  id:"krs", ic:"🎖️", n:"TKRS / KRS", nn:"TKRS / KRS", full:"Tunas Kadet Remaja Sekolah · Kadet Remaja Sekolah (KPM)", motto:"Disiplin|Discipline",
  col:{p:"#4B5320", a:"#D4AF37", k:"#8B1E2D", g:"#2F3A17", d:"#2F3A17"},
  about:"TKRS (Tahun 4–6) → KRS Junior (T1–3) → KRS Senior (T4–5) → PALAPES · ATM · Wataniah|TKRS (Y4–6) → KRS Junior (F1–3) → KRS Senior (F4–5) → PALAPES · ATM · Wataniah",
  facts:[
    ["Tujuan|Purpose", "Disiplin, kepimpinan, patriotisme, ketahanan diri dan budaya khidmat negara|Discipline, leadership, patriotism, resilience and a culture of national service"],
    ["Nilai teras|Core values", "Disiplin · Kepimpinan · Patriotisme · Ketahanan Diri · Semangat Berpasukan|Discipline · Leadership · Patriotism · Resilience · Teamwork"],
    ["Wajib tahu|Must-know", "Rukun Negara, Negaraku, Jalur Gemilang dan maknanya, lagu negeri|Rukun Negara, Negaraku, the Jalur Gemilang and its symbolism, the state anthem"],
    ["Aktiviti|Activities", "Kawad kaki, ikhtiar hidup, kembara, kaji peta, kecergasan, kem kepimpinan|Foot drill, survival, expedition, map work, fitness, leadership camps"],
    ["Pangkat biasa|Typical ranks", "Kadet → Lans Koperal → Koperal → Sarjan → Staf Sarjan → Sarjan Mejar (berbeza ikut sekolah dan negeri; tanya guru anda)|Kadet → Lans Koperal → Koperal → Sarjan → Staf Sarjan → Sarjan Mejar (varies by school and state; ask your teacher)"]],
  note:"Pangkat, pakaian dan manual kawad berbeza ikut negeri; ikut manual unit anda.|Ranks, uniform and drill manuals differ by state; follow your unit's manual.",
  mods:[
    ["K1","🇲🇾","Patriotisme & Protokol|Patriotism & Protocol",["Rukun Negara, Negaraku|Rukun Negara, Negaraku","Protokol bendera|Flag protocol","Tonggak sejarah negara|National history milestones","Jalankan upacara bendera|Run a flag ceremony"]],
    ["K2","🧍","Kawad Statik|Static Drill",["Sedia, Senang Diri, Rehatkan Diri|Sedia, Senang Diri, Rehatkan Diri","Pusing kanan/kiri/belakang|Right/left/about turns","Lencang, Hormat|Lencang (dressing), Hormat","Pimpin skuad serta-merta|Command a squad on the spot"]],
    ["K3","🚶","Kawad Bergerak|Marching Drill",["Ke depan gerak, Berhenti|Quick march, Halt","Hormat kanan/kiri semasa berjalan|Hormat kanan/kiri on the march","Belok, tukar langkah|Wheel, change step","Rutin pertandingan (7–10 min)|Competition routine (7–10 min)"]],
    ["K4","🗺️","Kaji Peta|Map Work",["Simbol peta, kompas|Map symbols, compass","Bearing|Bearings","Rujukan grid, bentuk muka bumi|Grid references, relief","Kad laluan untuk kembara|Route card for an expedition"]],
    ["K5","🏕️","Ikhtiar Hidup|Survival",["Kit hidup, air|Survival kit, water","Tempat berteduh, api|Shelter, fire","Isyarat, keselamatan makanan|Signalling, food safety","Pimpin malam ikhtiar hidup|Lead a survival night"]],
    ["K6","💪","Kecergasan|Fitness",["Memanaskan badan|Warm-up","Larian daya tahan|Endurance run","Halangan|Obstacle course","Rancang program kecergasan|Plan a fitness programme"]],
    ["K7","⭐","Kepimpinan|Leadership",["Kerja berpasukan|Teamwork","Penolong ketua seksyen (2IC)|Section 2IC","Ketua seksyen|Section commander","Pegawai unit / Sarjan Mejar|Unit officer / Sarjan Mejar"]],
    ["K8","🦺","Keselamatan|Safety",["Pertolongan cemas asas|Basic first aid","Sakit akibat panas|Heat illness","Pemindahan mangsa|Casualty evacuation","Taklimat risiko kepada junior|Brief juniors on risks"]]],
  sheets:[
    {t:"🇲🇾 Rukun Negara & Jalur Gemilang|🇲🇾 Rukun Negara & Jalur Gemilang", list:[
      "Rukun Negara: 1) Kepercayaan kepada Tuhan 2) Kesetiaan kepada Raja dan Negara 3) Keluhuran Perlembagaan 4) Kedaulatan Undang-undang 5) Kesopanan dan Kesusilaan",
      "Jalur Gemilang: 14 jalur (13 negeri + Wilayah Persekutuan) · bintang 14 bucu · bulan sabit = Islam agama Persekutuan · kuning = Raja-raja · biru = perpaduan|Jalur Gemilang: 14 stripes (13 states + Federal Territories) · 14-point star · crescent = Islam as the religion of the Federation · yellow = the Rulers · blue = unity"]},
    {t:"🎤 Arahan kawad|🎤 Drill commands", head:["Arahan|Command","Tindakan|Action","Perkara penting|Key point"], rows:[
      ["Sedia!","Berdiri tegak|Attention","Tumit rapat, kaki 30°, lengan lurus, ibu jari di sisi seluar, pandang depan|Heels together, feet at 30°, arms straight, thumbs along the trouser seam, eyes front"],
      ["Senang diri!","Berdiri senang|Stand at ease","Kaki kiri keluar kira-kira 30 cm, tangan di belakang (kanan dalam kiri)|Left foot out about 30 cm, hands behind the back (right in left)"],
      ["Rehatkan diri!","Berdiri rehat|Stand easy","Rehat tetapi jangan bercakap atau alih kaki|Relax but don't talk or move your feet"],
      ["Lencang kanan, lencang!","Betulkan barisan ke kanan|Dress right","Lengan kanan keluar, kepala ke kanan; selaraskan|Right arm out, head turned right; align into place"],
      ["Pandang depan!","Pandang ke depan|Eyes front","Kepala dan lengan kembali cepat|Snap head and arm back"],
      ["Pusing kanan, pusing!","Pusing kanan|Right turn","Berpusing pada tumit kanan dan hujung kaki kiri, rapatkan kaki kiri|Pivot on the right heel and left toe, then bring the left foot in"],
      ["Pusing belakang, pusing!","Pusing belakang|About turn","180° ke kanan|180° to the right"],
      ["Dari kanan, cium!","Kira dari kanan|Number from the right","Sebut nombor bergilir|Call off numbers in turn"],
      ["Ke depan, gerak!","Berjalan pantas|Quick march","Mula dengan kaki KIRI, lengan hayun separas bahu|Step off with the LEFT foot, arms swing to shoulder height"],
      ["Skuad, berhenti!","Berhenti|Halt","Diberi pada kaki kiri; berhenti dalam 2 kiraan|Given on the left foot; halt in 2 counts"],
      ["Hormat kanan / kiri!","Tabik semasa berjalan|Salute on the march","Kepala berpusing; ketua memberi tabik|Head turns; the leader salutes"],
      ["Bersurai!","Bubar|Dismiss","Pusing kanan, tabik, jalan 3 langkah|Turn right, salute, then march off 3 paces"]]},
    {t:"🏆 Markah pertandingan kawad|🏆 Drill competition scoring", list:["Pakaian 10 · kawad statik 25 · kawad bergerak 35 · suara dan kawalan ketua 20 · masa dan disiplin 10|Turnout 10 · static drill 25 · marching drill 35 · commander's voice and control 20 · timing and discipline 10"]}],
  quiz:[
    ["Arahan untuk berdiri tegak ialah…|The command for attention is…", ["Senang diri","Sedia","Bersurai"], 1, "“Sedia!” = attention.|“Sedia!” = attention."],
    ["Pada “Ke depan, gerak!” anda mula dengan kaki…|On “Ke depan, gerak!” you step off with the…", ["kanan|right","kiri|left","mana-mana|either"], 1, "Mula dengan kaki kiri.|Step off with the left foot."],
    ["Prinsip pertama Rukun Negara ialah…|The first principle of Rukun Negara is…", ["Kesetiaan kepada Raja dan Negara","Kepercayaan kepada Tuhan","Keluhuran Perlembagaan"], 1, "Kepercayaan kepada Tuhan.|Belief in God."],
    ["Berapa jalur pada Jalur Gemilang?|How many stripes does the Jalur Gemilang have?", ["13","14","15"], 1, "14 jalur: 13 negeri + Wilayah Persekutuan.|14 stripes: 13 states + the Federal Territories."],
    ["Warna kuning pada Jalur Gemilang melambangkan…|Yellow on the Jalur Gemilang stands for…", ["Raja-raja|the Rulers","kekayaan|wealth","matahari|the sun"], 0, "Kuning = Duli Yang Maha Mulia Raja-raja.|Yellow = the Rulers."],
    ["“Lencang kanan” digunakan untuk…|“Lencang kanan” is used to…", ["pusing kanan|turn right","betulkan barisan|align the squad","memberi tabik|salute"], 1, "Lencang = selaraskan barisan.|Lencang = dress / align the line."],
    ["“Pusing belakang” memusingkan anda…|“Pusing belakang” turns you…", ["90°","180°","360°"], 1, "Pusing belakang = 180°.|About turn = 180°."],
    ["Bearing kompas 270° ialah…|A compass bearing of 270° is…", ["timur|east","selatan|south","barat|west"], 2, "270° = barat.|270° = west."],
    ["Tanda awal terbaik sakit akibat panas semasa kawad ialah…|The best early sign of heat exhaustion during kawad is…", ["banyak berpeluh dan pening|heavy sweating and dizziness","suara lebih kuat|a stronger voice","lapar|hunger"], 0, "Berpeluh banyak dan pening: berehat di tempat teduh dan minum air.|Heavy sweating and dizziness: rest in the shade and sip water."],
    ["Keperluan hidup paling penting selepas tempat berteduh biasanya…|The most important survival need after shelter is usually…", ["air|water","permainan|games","isyarat telefon|a phone signal"], 0, "Air.|Water."],
    ["“Bersurai” bermaksud…|“Bersurai” means…", ["berhenti|halt","bubar|dismiss","senang diri|at ease"], 1, "Bersurai = bubar.|Bersurai = dismiss."],
    ["Dalam skuad, “2IC” ialah…|In a squad, the “2IC” is…", ["penolong ketua (kedua dalam perintah)|second-in-command","kad pengenalan kedua|a second ID card","gerakan kawad|a drill move"], 0, "2IC = second-in-command.|2IC = second-in-command."]],
  stations:[
    ["Sedia / Senang diri / Pusing|Sedia / Senang diri / turns"],
    ["Berjalan, berhenti, memberi tabik|Marching, halting, saluting"],
    ["Pimpin skuad 3 minit|Command a squad for 3 min"],
    ["Rutin pertandingan 7 minit|A 7-min competition routine"],
    ["Pimpin upacara unit|Lead a unit ceremony"]],
  daily:[["2 min: Sedia / Senang diri ×10|2 min: Sedia / Senang diri ×10"],["3 min: Pusing kanan/kiri/belakang|3 min: Pusing kanan/kiri/belakang"],["3 min: Ke depan gerak → Berhenti|3 min: Ke depan gerak → Berhenti"],["3 min: latihan suara ketua|3 min: commander voice practice"],["2 min: Hormat kanan / Bersurai|2 min: Hormat kanan / Bersurai"],["2 min: kuiz 5 soalan|2 min: 5-question quiz"]],
  explore:["Kem kepimpinan, kembara, kem ikhtiar hidup|Leadership camps, expeditions, survival camps","Pertandingan kawad kaki (daerah → kebangsaan)|Foot drill competitions (district → national)","Pangkat senior dan anugerah kadet terbaik|Senior rank and best-cadet awards"]
};

var PBS = {
  id:"pbsm", ic:"🚑", n:"PBSM", nn:"PBSM", full:"Persatuan Bulan Sabit Merah Malaysia", motto:"Kemanusiaan|Humanity",
  col:{p:"#C8102E", a:"#FFFFFF", k:"#2B2B2B", g:"#8E0B20", d:"#7A0A1E"},
  about:"Kelab rendah → Detasmen menengah → Ahli kanan → Sukarelawan / Pemimpin belia|Primary club → Secondary detachment → Senior members → Volunteer / Youth leader",
  facts:[
    ["Pengasas gerakan|Movement founder", "Henry Dunant (Solferino 1859; Kenangan Solferino 1862)|Henry Dunant (Solferino 1859; A Memory of Solferino 1862)"],
    ["ICRC", "Ditubuhkan 1863 di Geneva · Konvensyen Geneva pertama 1864 · empat Konvensyen Geneva 1949|Founded 1863 in Geneva · First Geneva Convention 1864 · four Geneva Conventions of 1949"],
    ["Di Malaysia|In Malaysia", "Cawangan Palang Merah British 1948 → Malaysian Red Cross Society → dinamakan PBSM pada 1975|British Red Cross branch 1948 → Malaysian Red Cross Society → renamed PBSM in 1975"],
    ["Gerakan|Movement", "ICRC + IFRC + Persatuan Kebangsaan (PBSM ialah Persatuan Kebangsaan Malaysia)|ICRC + IFRC + National Societies (PBSM is Malaysia's National Society)"],
    ["Hari Palang Merah & Bulan Sabit Merah Sedunia|World Red Cross & Red Crescent Day", "8 Mei|8 May"],
    ["Kecemasan|Emergency", "999 (112 dari telefon bimbit)|999 (112 from a mobile)"],
    ["Peranan biasa|Typical roles", "Ahli → Ketua Seksyen → Penolong Ketua Pasukan → Ketua Pasukan (diselia guru penasihat dan pegawai PBSM)|Ahli → Ketua Seksyen → Penolong Ketua Pasukan → Ketua Pasukan (supervised by the teacher-advisor and a PBSM officer)"]],
  note:"Lambang bulan sabit merah dilindungi undang-undang (Konvensyen Geneva dan akta Malaysia): aplikasi ini tidak melukisnya. Kompetensi sebenar perlukan kursus bertauliah secara amali.|The red crescent emblem is protected by law (Geneva Conventions and Malaysian law), so this app does not draw it. Real competence needs a hands-on certified course.",
  mods:[
    ["R1","🌍","Gerakan & Prinsip|Movement & Principles",["Dunant, 8 Mei|Dunant, 8 May","7 prinsip|7 principles","Lambang dan perlindungannya, asas IHL|The emblem and its protection, IHL basics","Ajar sesi prinsip|Teach a principles session"]],
    ["R2","👀","Tinjauan Utama|Primary Survey",["DRSABC","Posisi pemulihan|Recovery position","Tinjauan sekunder (kepala ke kaki)|Secondary survey (head-to-toe)","Triaj di tempat kejadian|Triage at an incident"]],
    ["R3","💓","CPR & AED|CPR & AED",["Kenal henti jantung|Recognise cardiac arrest","CPR dewasa 30:2|Adult CPR 30:2","Beza kanak-kanak/bayi, guna AED|Child/infant differences, AED use","Pimpin latihan CPR 2 penyelamat|Lead a 2-rescuer CPR drill"]],
    ["R4","🩸","Pendarahan & Luka|Bleeding & Wounds",["Bersihkan luka kecil|Clean small cuts","Tekanan terus|Direct pressure","Objek tertanam, kejutan|Embedded objects, shock","Uruskan ramai mangsa|Manage multiple casualties"]],
    ["R5","🧣","Pembalutan (Anduh)|Bandaging (Anduh)",["Bahagian anduh segi tiga|Parts of the triangular bandage","Anduh lengan|Arm sling","Anduh tinggi, balut kepala dan tangan|Elevation sling, head and hand bandages","Pertandingan kelajuan|Speed competition"]],
    ["R6","🦴","Tulang & Sendi|Bones & Joints",["RICE","Menetapkan anggota|Immobilise a limb","Splint buatan sendiri|Improvised splints","Ketua pasukan pengusung|Stretcher team leader"]],
    ["R7","🚨","Kecemasan Perubatan|Medical Emergencies",["Pengsan, hidung berdarah|Fainting, nosebleed","Asma, sakit akibat panas|Asthma, heat illness","Sawan, kecemasan diabetes, alahan|Seizure, diabetic emergency, allergy","Pos pertolongan cemas acara|Event first-aid post"]],
    ["R8","🌊","Bencana & Kesihatan|Disaster & Health",["Cuci tangan, cegah denggi|Hand-washing, dengue prevention","Beg kecemasan|Go-bag","Keselamatan banjir, kesedaran derma darah|Flood safety, blood donation awareness","Projek komuniti|Community project"]]],
  sheets:[
    {t:"❤️ 7 Prinsip Asas|❤️ 7 Fundamental Principles", head:["BM","EN","Maksud|Meaning"], rows:[
      ["Kemanusiaan","Humanity","Cegah dan ringankan penderitaan|Prevent and relieve suffering"],
      ["Kesaksamaan","Impartiality","Bantu ikut keperluan sahaja, tanpa diskriminasi|Help by need alone, without discrimination"],
      ["Berkecuali","Neutrality","Tidak memihak dalam konflik atau pertikaian|Take no sides in conflicts or controversies"],
      ["Kebebasan","Independence","Bebas daripada kawalan kerajaan|Autonomous from government control"],
      ["Khidmat Sukarela","Voluntary Service","Bukan untuk keuntungan|Not for gain"],
      ["Kesatuan","Unity","Hanya satu Persatuan Kebangsaan setiap negara|Only one National Society per country"],
      ["Kesejagatan","Universality","Gerakan seluruh dunia, taraf sama|A worldwide movement with equal status"]]},
    {t:"🩹 Pertolongan cemas (panduan penyelamat awam)|🩹 First-aid cheat-sheet (lay rescuer)", head:["Keadaan|Situation","Buat ✅|Do ✅","Jangan ❌|Don't ❌"], rows:[
      ["DRSABC","Danger (bahaya) → Response (respons) → Send (hubungi 999) → Airway (saluran udara) → Breathing (pernafasan, ≤10 s) → CPR|Danger → Response → Send for help (999) → Airway → Breathing (≤10 s) → CPR","Meluru masuk bila tempat tidak selamat|Rush in when the scene is unsafe"],
      ["CPR dewasa|Adult CPR","Tengah dada, 5–6 cm dalam, 100–120/min, 30 tekanan : 2 nafas, guna AED secepat ada|Centre of the chest, 5–6 cm deep, 100–120/min, 30 compressions : 2 breaths, use an AED as soon as one arrives","Berhenti semak nadi; bersandar pada dada antara tekanan|Stop to check a pulse; lean on the chest between compressions"],
      ["Tercekik (dewasa)|Choking (adult)","Galak batuk → 5 tepukan belakang → 5 tujahan perut, ulang; jika tidak sedar, mula CPR|Encourage coughing → 5 back blows → 5 abdominal thrusts, repeat; if unresponsive, start CPR","Korek jari secara buta|Blind finger sweeps"],
      ["Pendarahan|Bleeding","Sarung tangan, tekan kuat terus, tambah pad di atas, minta bantuan|Gloves, firm direct pressure, add pads on top, call for help","Cabut objek tertanam|Remove an embedded object"],
      ["Melecur|Burns","Sejukkan di bawah air mengalir 20 minit, tutup longgar dengan bungkus plastik|Cool under running water for 20 minutes, cover loosely with cling film","Ais, mentega, ubat gigi; pecahkan lepuh|Ice, butter, toothpaste; popping blisters"],
      ["Hidung berdarah|Nosebleed","Duduk, condong ke depan, picit bahagian lembut 10–15 min|Sit up, lean forward, pinch the soft part for 10–15 min","Dongakkan kepala|Tilt the head back"],
      ["Pengsan|Fainting","Baringkan dan angkat kaki|Lay down and raise the legs","Mengerumuni|Crowd around"],
      ["Terseliuh|Sprain","RICE: Rehat, Ais (berbalut), Tekanan, Angkat|RICE: Rest, Ice (wrapped), Compression, Elevation","Urut kecederaan|Massage the injury"],
      ["Patah|Fracture","Sokong pada kedudukan asal, tetapkan, minta bantuan|Support in the position found, immobilise, get help","Cuba luruskan|Try to straighten it"],
      ["Sakit akibat panas|Heat illness","Teduh, air sejuk pada kulit, teguk kecil jika sedar, 999 jika keliru|Shade, cool water on the skin, small sips if fully conscious, 999 if confused","Beri minum kepada yang separuh sedar|Give drinks to someone semi-conscious"],
      ["Gigitan ular|Snake bite","Tenang dan diam, tetapkan anggota, ke hospital, ingat rupa ular|Keep still and calm, immobilise the limb, get to hospital, note the snake's appearance","Potong, sedut, ikat kuat|Cutting, sucking, a tight tourniquet"],
      ["Sawan|Seizure","Lindungi kepala, catat masa, posisi pemulihan selepas itu|Protect the head, time it, recovery position afterwards","Menahan atau letak apa-apa dalam mulut|Restrain or put anything in the mouth"]]}],
  quiz:[
    ["Siapa yang mengilhamkan Gerakan Palang Merah/Bulan Sabit Merah?|Who inspired the Red Cross/Red Crescent Movement?", ["Florence Nightingale","Henry Dunant","Baden-Powell"], 1, "Henry Dunant selepas Pertempuran Solferino (1859).|Henry Dunant, after the Battle of Solferino (1859)."],
    ["Hari Palang Merah & Bulan Sabit Merah Sedunia ialah pada…|World Red Cross & Red Crescent Day is on…", ["8 Mei|8 May","22 Februari|22 February","10 Oktober|10 October"], 0, "8 Mei, hari lahir Dunant.|8 May, Dunant's birthday."],
    ["“Kesaksamaan” bermaksud…|“Kesaksamaan” means…", ["membantu ikut keperluan sahaja|helping based on need alone","memihak|taking sides","dibayar|being paid"], 0, "Impartiality: bantu ikut keperluan sahaja.|Impartiality: help by need alone."],
    ["“S” dalam DRSABC bermaksud…|The “S” in DRSABC stands for…", ["Berhenti|Stop","Hubungi bantuan|Send for help","Duduk|Sit"], 1, "Send for help (999).|Send for help (999)."],
    ["Nisbah CPR dewasa ialah…|The adult CPR ratio is…", ["15:2","30:2","5:1"], 1, "30 tekanan : 2 nafas.|30 compressions : 2 breaths."],
    ["Kadar tekanan dada ialah…|The compression rate is…", ["60–80/min","100–120/min","150/min"], 1, "100–120 tekanan seminit.|100–120 compressions per minute."],
    ["Lecur disejukkan dengan air mengalir selama…|A burn should be cooled with running water for…", ["2 minit|2 minutes","20 minit|20 minutes","1 jam|1 hour"], 1, "20 minit.|20 minutes."],
    ["Untuk hidung berdarah, kepala hendaklah…|For a nosebleed, the head should be…", ["didongak ke belakang|tilted back","condong ke depan|leaning forward","berbaring rata|lying flat"], 1, "Condong ke depan dan picit 10–15 minit.|Lean forward and pinch for 10–15 minutes."],
    ["Dewasa tercekik: selepas 5 tepukan belakang, beri…|Choking adult, after 5 back blows give…", ["5 tujahan perut|5 abdominal thrusts","air|water","korek jari|a finger sweep"], 0, "5 tujahan perut, ulang.|5 abdominal thrusts, repeat."],
    ["RICE ialah Rehat, Ais, Tekanan dan…|RICE stands for Rest, Ice, Compression and…", ["Senaman|Exercise","Angkat|Elevation","Kecemasan|Emergency"], 1, "Elevation = angkat anggota.|Elevation = raise the limb."],
    ["Nombor kecemasan Malaysia ialah…|Malaysia's emergency number is…", ["991","999","911"], 1, "999 (112 dari telefon bimbit).|999 (112 from a mobile)."],
    ["Mengapa lambang bulan sabit merah tidak boleh digunakan sesuka hati?|Why can't anyone use the red crescent emblem freely?", ["Ia bergaya|It's trendy","Dilindungi Konvensyen Geneva dan undang-undang negara|It is protected by the Geneva Conventions and national law","Seni berhak cipta|It's copyrighted art"], 1, "Dilindungi undang-undang antarabangsa dan negara.|Protected by international and national law."]],
  stations:[
    ["DRSABC pada manikin|DRSABC on a manikin"],
    ["Posisi pemulihan + anduh lengan|Recovery position + arm sling"],
    ["2 minit CPR pada kadar dan kedalaman betul|2 min of CPR at the right rate and depth"],
    ["Senario triaj ramai mangsa|Multi-casualty triage scenario"],
    ["Uruskan pos pertolongan cemas acara|Run an event first-aid post"]],
  daily:[["2 min: sebut DRSABC dengan kuat|2 min: recite DRSABC aloud"],["4 min: CPR 30:2 pada kusyen (2 × 2 min, 100–120/min)|4 min: CPR 30:2 on a cushion (2 × 2 min, 100–120/min)"],["3 min: anduh lengan ×2|3 min: arm sling ×2"],["3 min: posisi pemulihan pada ahli keluarga|3 min: recovery position on a family member"],["2 min: kad imbas 7 prinsip|2 min: flashcards on the 7 principles"],["1 min: nota Muhasabah|1 min: Muhasabah note"]],
  explore:["Kem pertolongan cemas, latihan kesiapsiagaan bencana|First-aid camps, disaster-preparedness drills","Pertandingan pertolongan cemas (individu dan pasukan)|First-aid competitions (individual and team)","Derma darah (16+ dengan kebenaran)|Blood donation drives (16+ with consent)"]
};
return {LV:LV, BLUE:BLUE, RUBRIC:RUBRIC, GRADES:GRADES, YEAR:YEAR, WEEK:WEEK, SPRINT:SPRINT, orgs:{pengakap:PGK, krs:KRS, pbsm:PBS}, order:["pengakap","krs","pbsm"]};
})();
