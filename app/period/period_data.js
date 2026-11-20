/* Period (haid) tab content, 0.3.0: fiqh (Shafi'i, Malaysian practice), hadith, fatwa notes and health guidance.
   Every religious text here was written from memory and is PENDING REVIEW by a qualified ustaz/ustazah, like the rest of the app.
   Hadith are given as meaning (no Arabic) with the usual reference numbers; check them before release.
   Health text is general information, not medical advice. Each entry: [ms, en]. */
(function(){
"use strict";
var D = {};
// ---- Shafi'i limits used by the rules engine ----
D.LIM = {haidMinH:24, haidMaxD:15, haidUsualD:[6,7], tuhrMinD:15, nifasMaxD:60, nifasUsualD:40};
D.RULES = [
  ["Haid paling sedikit sehari semalam (24 jam, terkumpul), kebiasaannya 6 atau 7 hari, paling lama 15 hari 15 malam.","Haid is at least one day and night (24 hours, added up), usually 6 or 7 days, and at most 15 days and nights."],
  ["Tempoh suci antara dua haid paling sedikit 15 hari. Darah yang keluar sebelum cukup 15 hari suci ialah istihadhah.","Purity between two haids is at least 15 days. Blood that comes before 15 days of purity is istihadhah."],
  ["Darah berwarna perang, kuning atau keruh dalam tempoh haid dikira haid (mazhab Syafi'i). Selepas suci yang sempurna, ia tidak dikira haid.","Brown, yellow or cloudy discharge within the haid days counts as haid (Shafi'i). After full purity, it does not."],
  ["Hari-hari bersih di celah darah dalam tempoh 15 hari dikira haid jika jumlah darah cukup 24 jam (pendapat muktamad Syafi'i).","Clean days between bleeding within 15 days count as haid if the blood adds up to 24 hours (the relied-upon Shafi'i view)."],
  ["Nifas: darah selepas bersalin. Paling sedikit seketika, kebiasaannya 40 hari, paling lama 60 hari. Lebih 60 hari ialah istihadhah.","Nifas: blood after giving birth. At least a moment, usually 40 days, at most 60 days. Beyond 60 days is istihadhah."],
  ["Istihadhah ialah darah penyakit. Wanita istihadhah wajib solat dan berpuasa.","Istihadhah is blood of illness. A woman with istihadhah must pray and fast."]
];
D.FORBID = [
  ["Solat (tidak perlu diqadha)","Prayer (no need to make it up)"],
  ["Puasa (wajib diqadha selepas suci)","Fasting (must be made up after purity)"],
  ["Tawaf (sa'i dan amalan haji lain dibenarkan)","Tawaf (sa'i and other Hajj rites are allowed)"],
  ["Menyentuh dan membawa mushaf Al-Quran","Touching and carrying the mushaf"],
  ["Membaca Al-Quran dengan niat membaca (mazhab Syafi'i). Zikir, doa, selawat, mendengar Al-Quran dan membaca dalam hati dibenarkan.","Reciting the Quran with the intention of recitation (Shafi'i). Dhikr, doa, salawat, listening and reading in the heart are allowed."],
  ["Berhenti atau duduk dalam masjid","Staying or sitting in a masjid"],
  ["Persetubuhan (bermesra selain itu dibenarkan)","Intercourse (other closeness is allowed)"],
  ["Talak semasa haid (talak bid'ah, berdosa tetapi jatuh)","Divorce during haid (an innovated divorce: sinful, though it takes effect)"]
];
D.ALLOWED = [
  ["Zikir, doa, istighfar, selawat dan mendengar ceramah","Dhikr, doa, istighfar, salawat and listening to talks"],
  ["Menghadiri majlis ilmu di luar masjid, belajar dan mengajar","Attending classes outside the masjid, learning and teaching"],
  ["Memotong kuku dan rambut (pendapat yang kuat: harus)","Cutting nails and hair (the stronger view: allowed)"],
  ["Bersedekah, berbuat baik, memasak untuk orang berbuka","Charity, kindness, cooking for people who fast"],
  ["Semasa haji: semua amalan kecuali tawaf","During Hajj: every rite except tawaf"]
];
D.ISTIHADHAH = [
  ["Basuh darah, pakai tuala wanita atau pelapik.","Wash the blood off and use a pad or liner."],
  ["Ambil wuduk selepas masuk waktu, untuk setiap solat fardhu.","Make wudhu after the prayer time has begun, for each obligatory prayer."],
  ["Bersegera solat selepas wuduk. Satu wuduk untuk satu fardhu dan sunat-sunatnya.","Pray soon after wudhu. One wudhu covers one obligatory prayer and its sunnah prayers."],
  ["Wajib berpuasa. Persetubuhan dibenarkan (jumhur ulama).","Fasting is required. Intercourse is allowed (most scholars)."]
];
D.GHUSL = [
  ["Niat (dalam hati): \"Sahaja aku mandi wajib untuk mengangkat hadas haid kerana Allah Taala.\" Untuk nifas, sebut nifas.","Intention (in the heart): \"I intend the obligatory bath to lift the state of haid for Allah.\" For nifas, say nifas."],
  ["Basuh kemaluan dan buang kotoran, kemudian berwuduk seperti untuk solat (sunat).","Wash the private parts and any dirt, then make wudhu as for prayer (sunnah)."],
  ["Ratakan air ke seluruh badan termasuk kulit kepala, pangkal rambut, celah ketiak, pusat dan lipatan kulit. Rukun: niat dan meratakan air.","Let water reach the whole body, including the scalp, hair roots, armpits, navel and skin folds. Essentials: intention and water over the whole body."],
  ["Sunat menyapu sedikit wangian pada bekas darah (hadis Bukhari 314). Rambut yang disanggul tidak wajib dileraikan jika air sampai ke kulit kepala.","It is sunnah to dab a little fragrance where the blood was (hadith, Bukhari 314). Braided hair need not be undone if water reaches the scalp."]
];
// ---- Hadith (meaning) ----
D.HADITH = [
  ["Al-Baqarah 2:222","\"Mereka bertanya kepadamu tentang haid. Katakanlah: ia adalah gangguan (kotoran). Oleh itu jauhilah (jangan bersetubuh dengan) isteri semasa haid, dan jangan dekati mereka sehingga mereka suci…\"","\"They ask you about menstruation. Say: it is a harm. So keep away from (intercourse with) wives during menstruation, and do not approach them until they are pure…\""],
  ["Muslim 335","Aisyah r.a.: \"Kami mengalami haid pada zaman Rasulullah ﷺ, lalu kami diperintahkan mengqadha puasa dan tidak diperintahkan mengqadha solat.\"","Aisha r.a.: \"We used to have our periods in the time of the Messenger ﷺ, and we were told to make up the fasts but not the prayers.\""],
  ["Bukhari 228, Muslim 333","Kepada Fatimah binti Abi Hubaisy yang istihadhah: \"Itu darah urat, bukan haid. Apabila datang haid, tinggalkan solat; apabila ia berlalu, basuhlah darah daripadamu dan solatlah.\"","To Fatimah bint Abi Hubaysh, who had istihadhah: \"That is a vein, not menstruation. When your period comes, leave prayer; when it has gone, wash the blood from yourself and pray.\""],
  ["Abu Dawud 287, Tirmizi 128","Kepada Hamnah binti Jahsy yang istihadhah: kira haid 6 atau 7 hari mengikut kebiasaan wanita, kemudian mandi, solat dan berpuasa.","To Hamnah bint Jahsh, who had istihadhah: count your period as six or seven days, as women usually do, then bathe, pray and fast."],
  ["Bukhari 305, Muslim 1211","Kepada Aisyah r.a. yang haid semasa haji: \"Lakukanlah apa yang dilakukan oleh orang yang mengerjakan haji, kecuali jangan tawaf di Baitullah sehingga kamu suci.\"","To Aisha r.a., who got her period during Hajj: \"Do everything the pilgrims do, except tawaf around the House until you are pure.\""],
  ["Bukhari 326, Abu Dawud 307","Ummu 'Atiyyah r.a.: \"Kami tidak mengira darah keruh dan kekuningan selepas suci sebagai sesuatu (haid).\"","Umm 'Atiyyah r.a.: \"We did not count brownish or yellowish discharge after purity as anything (haid).\""],
  ["Muslim 302","Anas r.a.: Nabi ﷺ bersabda tentang isteri yang haid: \"Lakukanlah segala-galanya kecuali jimak.\"","Anas r.a.: the Prophet ﷺ said about wives during menstruation: \"Do everything except intercourse.\""],
  ["Bukhari 297, Muslim 301","Aisyah r.a.: Nabi ﷺ bersandar di pangkuanku ketika aku haid, lalu membaca Al-Quran.","Aisha r.a.: the Prophet ﷺ would lean on my lap while I was menstruating and recite the Quran."],
  ["Bukhari 314, Muslim 332","Seorang wanita bertanya cara mandi haid; Nabi ﷺ mengajarnya mandi dan menggunakan kapas berwangian pada bekas darah.","A woman asked how to bathe after menstruation; the Prophet ﷺ taught her to bathe and to use a scented piece of cotton where the blood was."],
  ["Abu Dawud 311, Tirmizi 139","Ummu Salamah r.a.: \"Wanita nifas pada zaman Rasulullah ﷺ berehat (tidak solat) selama 40 hari.\"","Umm Salamah r.a.: \"Women in nifas in the time of the Messenger ﷺ would sit (not pray) for forty days.\""],
  ["Bukhari 304","Haid ialah ketetapan Allah ke atas anak-anak perempuan Adam (Bukhari 294); meninggalkan solat dan puasa ketika haid ialah keringanan, bukan dosa.","Menstruation is something Allah has decreed for the daughters of Adam (Bukhari 294); leaving prayer and fasting during it is an allowance, not a sin."]
];
// ---- Fatwa and rulings (Malaysian practice; check the latest from JAKIM / state mufti offices) ----
D.FATWA = [
  ["Pil penangguh haid","Period-delaying pills","Harus mengambil pil untuk menangguhkan haid supaya dapat berpuasa penuh atau mengerjakan haji/umrah, dengan syarat tidak memudaratkan dan dengan nasihat doktor (pandangan pejabat mufti, cth. Irsyad al-Fatwa WP).","Taking pills to delay a period so as to fast all of Ramadan or perform Hajj/umrah is permissible, provided it causes no harm and is done with a doctor's advice (mufti office views, e.g. Irsyad al-Fatwa WP)."],
  ["Darah keguguran","Blood after miscarriage","Jika janin sudah berbentuk ketulan darah (alaqah) atau daging (mudghah), darah selepasnya ialah nifas. Jika belum, ia dinilai sebagai haid atau istihadhah mengikut syaratnya.","If the foetus had become a clot ('alaqah) or lump of flesh (mudghah), the blood after it is nifas. If not, it is judged as haid or istihadhah by the usual conditions."],
  ["Darah semasa hamil","Bleeding in pregnancy","Mazhab Syafi'i: darah semasa hamil boleh dikira haid jika cukup syarat haid (sekurang-kurangnya 24 jam dan tidak lebih 15 hari). Dapatkan rawatan doktor segera.","Shafi'i school: bleeding in pregnancy can count as haid if it meets the conditions (at least 24 hours, not over 15 days). See a doctor promptly."],
  ["Al-Quran dalam telefon","The Quran on a phone","Telefon atau aplikasi Al-Quran tidak dihukum sebagai mushaf, maka harus menyentuhnya. Membaca dengan lisan tetap ditegah dalam mazhab Syafi'i; sebahagian ulama membenarkan untuk tujuan belajar dan mengajar atau menjaga hafazan.","A phone or Quran app is not ruled a mushaf, so touching it is allowed. Reciting aloud is still not allowed in the Shafi'i school; some scholars allow it for learning, teaching or keeping memorisation."],
  ["Suci sebelum habis waktu","Purity before a prayer time ends","Jika suci dalam waktu Asar, wajib solat Zohor dan Asar; jika suci dalam waktu Isyak, wajib Maghrib dan Isyak (mazhab Syafi'i), jika sempat sekurang-kurangnya takbiratul ihram sebelum waktu habis.","If purity comes in Asar time, Zohor and Asar are due; if in Isyak time, Maghrib and Isyak (Shafi'i), as long as there was time for at least the opening takbir before the time ended."],
  ["Haid selepas masuk waktu","Haid after a prayer time began","Jika haid datang selepas masuk waktu dan sempat solat tetapi belum solat, wajib qadha solat itu selepas suci.","If haid comes after a prayer time began and there was time to pray but you had not prayed, that prayer must be made up after purity."],
  ["Puasa: suci pada siang hari","Purity during a fasting day","Jika suci pada siang Ramadan, hari itu tetap wajib diqadha; sunat menahan diri daripada makan dan minum (imsak) hingga Maghrib menurut sebahagian ulama.","If purity comes during a Ramadan day, that day must still be made up; some scholars say it is recommended to refrain from food and drink until Maghrib."],
  ["Lewat ganti puasa","Making up fasts late","Puasa yang ditinggalkan kerana haid mesti diganti sebelum Ramadan berikutnya. Jika ditangguh tanpa uzur hingga masuk Ramadan baru, wajib qadha serta fidyah (secupak makanan asasi sehari bagi setiap tahun tertangguh) dalam mazhab Syafi'i.","Fasts missed for haid must be made up before the next Ramadan. If delayed without excuse past the next Ramadan, Shafi'i requires the make-up plus fidyah (one cupak of staple food per day for each year of delay)."],
  ["Bersetubuh semasa haid","Intercourse during haid","Haram dan berdosa besar; wajib bertaubat. Mazhab Syafi'i: sunat bersedekah satu dinar jika di awal haid, setengah dinar jika di akhirnya.","Forbidden and a major sin; repentance is required. Shafi'i: it is recommended to give a dinar in charity if early in the period, half a dinar if near its end."]
];
// ---- Health ----
D.NORMAL = [
  ["Kitaran normal: 21 hingga 35 hari (dari hari pertama haid ke hari pertama haid berikutnya). Remaja: 21 hingga 45 hari dalam 2 hingga 3 tahun pertama.","A normal cycle: 21 to 35 days (from the first day of one period to the first day of the next). Teens: 21 to 45 days in the first 2 to 3 years."],
  ["Haid normal: 2 hingga 7 hari. Jumlah darah biasanya 5 hingga 80 ml (kira-kira 1 hingga 5 tuala sehari).","A normal period: 2 to 7 days. Blood loss is usually 5 to 80 ml (about 1 to 5 pads a day)."],
  ["Perbezaan panjang kitaran sehingga 7 hingga 9 hari dari bulan ke bulan masih biasa.","Cycles varying by up to 7 to 9 days from month to month is still common."],
  ["Senggugut ringan pada hari 1 hingga 2, kembung, sakit dada dan perubahan emosi (PMS) adalah biasa.","Mild cramps on days 1 to 2, bloating, breast tenderness and mood changes (PMS) are common."]
];
D.ABNORMAL = [
  ["Kitaran kurang 21 hari atau lebih 35 hari (45 bagi remaja)","Cycles shorter than 21 days or longer than 35 (45 for teens)"],
  ["Haid lebih 7 hari, atau berdarah antara haid / selepas bersetubuh","Periods over 7 days, or bleeding between periods / after sex"],
  ["Sangat banyak: tukar tuala setiap jam selama beberapa jam, ketulan darah lebih besar daripada duit syiling 50 sen","Very heavy: soaking a pad every hour for several hours, clots bigger than a 50 sen coin"],
  ["Tiada haid 3 bulan (bukan hamil), atau berdarah selepas menopaus","No period for 3 months (not pregnant), or bleeding after menopause"],
  ["Senggugut teruk yang mengganggu sekolah/kerja, tidak lega dengan ubat tahan sakit biasa","Severe cramps that stop school/work and do not ease with usual painkillers"],
  ["Pening, letih teruk, sesak nafas (tanda kurang darah / anemia)","Dizziness, great tiredness, breathlessness (signs of anaemia)"],
  ["Demam, keputihan berbau atau sakit ketika memakai tampon (rujuk segera)","Fever, foul-smelling discharge or pain while using a tampon (seek care quickly)"]
];
D.CONDITIONS = [
  ["PCOS","PCOS","Kitaran jarang atau tidak menentu, jerawat, bulu berlebihan, berat badan naik. Boleh dirawat; rujuk doktor.","Infrequent or irregular cycles, acne, extra hair, weight gain. Treatable; see a doctor."],
  ["Endometriosis","Endometriosis","Senggugut sangat teruk yang makin bertambah, sakit ketika bersetubuh atau buang air, sukar hamil.","Very severe, worsening cramps, pain with sex or toilet visits, difficulty conceiving."],
  ["Fibroid","Fibroids","Haid sangat banyak atau panjang, perut terasa penuh, kerap kencing.","Very heavy or long periods, a full feeling in the belly, frequent urination."],
  ["Anemia","Anaemia","Haid banyak boleh menyebabkan kurang zat besi: makan daging merah, hati, sayur hijau, kekacang; ujian darah di klinik.","Heavy periods can cause iron deficiency: eat red meat, liver, greens, legumes; get a blood test."],
  ["Tiroid","Thyroid","Kitaran berubah bersama letih, berat badan berubah, rambut gugur.","Cycle changes with tiredness, weight change, hair loss."]
];
D.CRAMPS = [
  ["Tuam perut atau belakang dengan botol air panas / tuala suam 15 hingga 20 minit.","A hot water bottle or warm towel on the belly or back for 15 to 20 minutes."],
  ["Bergerak ringan: berjalan, regangan, yoga lembut (lihat Masa › Kecergasan).","Light movement: walking, stretching, gentle yoga (see Time › Fitness)."],
  ["Minum air yang cukup, kurangkan kafein, garam dan makanan bergula.","Drink enough water; cut down caffeine, salt and sugary food."],
  ["Ubat tahan sakit (parasetamol atau ibuprofen) ikut arahan label atau ahli farmasi; ibuprofen paling berkesan jika dimakan awal.","Painkillers (paracetamol or ibuprofen) as the label or pharmacist says; ibuprofen works best taken early."],
  ["Tidur cukup; urut perlahan bahagian bawah perut.","Enough sleep; gently massage the lower belly."],
  ["Jika sakit sangat teruk, berulang setiap bulan atau bertambah, jumpa doktor.","If pain is very severe, every month, or getting worse, see a doctor."]
];
D.HYGIENE = [
  ["Tukar tuala wanita setiap 4 hingga 6 jam (lebih kerap jika banyak); tampon tidak lebih 8 jam.","Change pads every 4 to 6 hours (more often if heavy); tampons no longer than 8 hours."],
  ["Basuh tangan sebelum dan selepas menukar.","Wash hands before and after changing."],
  ["Cuci dari depan ke belakang dengan air bersih; tidak perlu sabun wangi atau douche di bahagian dalam.","Wash front to back with clean water; no perfumed soap or douching inside."],
  ["Balut tuala terpakai dan buang dalam tong sampah (jangan dalam tandas).","Wrap used pads and put them in the bin (not the toilet)."],
  ["Pakai seluar dalam kapas dan tukar setiap hari.","Wear cotton underwear and change it daily."],
  ["Mandi setiap hari; selepas suci, mandi wajib.","Bathe every day; after purity, take the obligatory bath (ghusl)."],
  ["Cuci darah pada pakaian dengan air sejuk; kain yang kena darah haid najis dan mesti dibasuh sebelum solat.","Rinse blood from clothes with cold water; cloth with menstrual blood is impure and must be washed before prayer."]
];
D.FIRST = [
  ["Haid pertama biasanya antara umur 9 hingga 15 tahun. Ini tanda baligh: mulai sekarang wajib solat, puasa, menutup aurat dan semua hukum syarak.","A first period usually comes between ages 9 and 15. It is a sign of puberty: from now on prayer, fasting, covering the aurat and all religious duties are obligatory."],
  ["Tidak perlu takut atau malu; ia ketetapan Allah untuk semua wanita (Bukhari 294). Beritahu ibu, kakak atau guru.","There is no need to be afraid or embarrassed; Allah decreed it for all women (Bukhari 294). Tell your mother, sister or teacher."],
  ["Simpan tuala wanita dan seluar dalam ganti dalam beg sekolah.","Keep pads and spare underwear in your school bag."],
  ["Catat hari pertama dalam aplikasi ini; kitaran tahun pertama selalunya tidak tetap.","Log the first day in this app; cycles in the first year are often irregular."],
  ["Hukum haid pertama (mubtada'ah): jika darah lebih 15 hari dan tidak dapat dibezakan, haid dikira sehari semalam dan bakinya istihadhah (mazhab Syafi'i). Tanya ustazah jika ragu.","First-period ruling (mubtada'ah): if blood goes beyond 15 days and cannot be told apart, haid is one day and night and the rest is istihadhah (Shafi'i). Ask an ustazah if unsure."]
];
D.PREG = [
  ["Lewat haid 1 minggu atau lebih: buat ujian kehamilan air kencing (paling tepat pada air kencing pertama pagi).","Period a week or more late: take a urine pregnancy test (most accurate with the first morning urine)."],
  ["Tanda awal: haid lewat, loya, sakit buah dada, kerap kencing, letih.","Early signs: late period, nausea, sore breasts, frequent urination, tiredness."],
  ["Positif: daftar di klinik kesihatan / doktor; mula asid folik jika belum.","Positive: register at a health clinic or doctor; start folic acid if not yet."],
  ["Berdarah atau sakit perut teruk ketika hamil: pergi ke klinik/hospital segera.","Bleeding or severe belly pain in pregnancy: go to a clinic or hospital at once."]
];
D.SPOUSE = [
  ["Bersabar dan berlembut; senggugut dan perubahan emosi adalah nyata.","Be patient and gentle; cramps and mood changes are real."],
  ["Bantu kerja rumah, sediakan tuam panas dan makanan berkhasiat.","Help with housework, prepare a warm compress and nourishing food."],
  ["Bermesra dan tidur bersama dibenarkan; hanya persetubuhan yang haram sehingga isteri suci dan mandi wajib.","Closeness and sharing a bed are allowed; only intercourse is forbidden until she is pure and has done ghusl."],
  ["Jangan menjatuhkan talak semasa haid.","Do not pronounce divorce during her period."],
  ["Galakkan rawatan jika tanda tidak normal muncul.","Encourage medical care if abnormal signs appear."]
];
D.ADVICE = [
  ["Tidur 7 hingga 9 jam; senaman ringan 30 minit sehari mengurangkan senggugut dan PMS.","Sleep 7 to 9 hours; 30 minutes of light exercise a day eases cramps and PMS."],
  ["Makanan kaya zat besi dan vitamin C (buah-buahan) membantu mengganti darah.","Iron-rich food with vitamin C (fruit) helps replace blood."],
  ["Tetap berzikir dan berdoa; pahala niat baik tetap ada walaupun tidak solat.","Keep up dhikr and doa; good intentions are still rewarded even when not praying."],
  ["Gunakan masa haid untuk belajar ilmu agama, mendengar tafsir dan menyediakan juadah berbuka untuk keluarga.","Use the days of haid to learn, listen to tafsir and prepare iftar for the family."]
];
window.PERIOD_DATA = D;
})();
