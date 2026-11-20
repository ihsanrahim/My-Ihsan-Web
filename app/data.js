// Ihsan app content. PROTOTYPE: all religious text must be reviewed by a qualified ustaz before public release.
var STATES = {JHR:"Johor",KDH:"Kedah",KTN:"Kelantan",MLK:"Melaka",NSN:"Negeri Sembilan",PHG:"Pahang",PRK:"Perak",PLS:"Perlis",PNG:"Pulau Pinang",SBH:"Sabah",SWK:"Sarawak",SGR:"Selangor",TRG:"Terengganu",KUL:"W.P. Kuala Lumpur",LBN:"W.P. Labuan",PJY:"W.P. Putrajaya"};
var GROUP_A = ["KDH","KTN","TRG"];
// JAKIM zones: code, state, districts, sample points [lat,lon] for nearest-zone auto detect (approximate)
var ZONES = [
["JHR01","JHR","Pulau Aur dan Pulau Pemanggil",[[2.45,104.52]],1],
["JHR02","JHR","Johor Bahru, Kota Tinggi, Mersing, Kulai",[[1.49,103.74],[1.73,103.90],[2.43,103.84],[1.66,103.60]]],
["JHR03","JHR","Kluang, Pontian",[[2.03,103.32],[1.49,103.39]]],
["JHR04","JHR","Batu Pahat, Muar, Segamat, Gemas Johor, Tangkak",[[1.85,102.93],[2.04,102.57],[2.51,102.82],[2.27,102.55]]],
["KDH01","KDH","Kota Setar, Kubang Pasu, Pokok Sena",[[6.12,100.37],[6.27,100.42],[6.17,100.52]]],
["KDH02","KDH","Kuala Muda, Yan, Pendang",[[5.65,100.49],[5.80,100.37],[5.99,100.48]]],
["KDH03","KDH","Padang Terap, Sik",[[6.25,100.61],[5.82,100.74]]],
["KDH04","KDH","Baling",[[5.68,100.92]]],
["KDH05","KDH","Bandar Baharu, Kulim",[[5.37,100.56],[5.13,100.50]]],
["KDH06","KDH","Langkawi",[[6.35,99.80]]],
["KDH07","KDH","Puncak Gunung Jerai",[[5.79,100.43]],1],
["KTN01","KTN","Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai, Mukim Chiku",[[6.13,102.24],[5.77,102.22],[5.53,102.20],[6.05,102.14],[5.97,102.40]]],
["KTN02","KTN","Gua Musang, Jeli, Lojing",[[4.88,101.97],[5.70,101.84]]],
["MLK01","MLK","Seluruh Negeri Melaka",[[2.19,102.25],[2.38,102.22]]],
["NGS01","NSN","Tampin, Jempol",[[2.47,102.23],[2.81,102.41]]],
["NGS02","NSN","Jelebu, Kuala Pilah, Rembau",[[2.74,102.25],[3.03,102.06],[2.59,102.09]]],
["NGS03","NSN","Port Dickson, Seremban",[[2.73,101.94],[2.52,101.80]]],
["PHG01","PHG","Pulau Tioman",[[2.79,104.17]],1],
["PHG02","PHG","Kuantan, Pekan, Muadzam Shah",[[3.81,103.33],[3.49,103.39],[3.05,103.08]]],
["PHG03","PHG","Jerantut, Temerloh, Maran, Bera, Chenor, Jengka",[[3.45,102.42],[3.94,102.36],[3.59,102.77],[3.25,102.45]]],
["PHG04","PHG","Bentong, Lipis, Raub",[[3.52,101.91],[3.79,101.86],[4.18,102.05]]],
["PHG05","PHG","Genting Sempah, Janda Baik, Bukit Tinggi",[[3.36,101.80]],1],
["PHG06","PHG","Cameron Highlands, Genting Highlands, Bukit Fraser",[[4.47,101.38]]],
["PHG07","PHG","Zon Khas Daerah Rompin",[[2.71,103.49]]],
["PLS01","PLS","Kangar, Padang Besar, Arau",[[6.44,100.20],[6.66,100.32]]],
["PNG01","PNG","Seluruh Negeri Pulau Pinang",[[5.41,100.33],[5.40,100.36],[5.36,100.46]]],
["PRK01","PRK","Tapah, Slim River, Tanjung Malim",[[4.20,101.26],[3.68,101.52],[3.83,101.40]]],
["PRK02","PRK","Kuala Kangsar, Sg. Siput, Ipoh, Batu Gajah, Kampar",[[4.60,101.08],[4.77,100.94],[4.31,101.15],[4.47,101.04]]],
["PRK03","PRK","Lenggong, Pengkalan Hulu, Grik",[[5.43,101.13],[5.10,100.97],[5.70,100.99]]],
["PRK04","PRK","Temengor, Belum",[[5.50,101.40]],1],
["PRK05","PRK","Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor",[[4.02,101.02],[4.22,100.70],[4.23,100.63],[4.36,100.98],[3.99,100.78]]],
["PRK06","PRK","Selama, Taiping, Bagan Serai, Parit Buntar",[[4.85,100.74],[5.13,100.49],[5.01,100.54],[5.22,100.69]]],
["PRK07","PRK","Bukit Larut",[[4.86,100.79]],1],
["SBH01","SBH","Bahagian Sandakan (Timur)",[[5.84,118.12]]],
["SBH02","SBH","Beluran, Telupid, Pinangah, Terusan, Kuamut",[[5.89,117.56],[5.63,117.12]]],
["SBH03","SBH","Lahad Datu, Silabukan, Kunak, Sahabat, Semporna, Tungku",[[5.03,118.33],[4.48,118.61],[4.69,118.25]]],
["SBH04","SBH","Bandar Tawau, Balong, Merotai, Kalabakan",[[4.24,117.89],[4.42,117.48]]],
["SBH05","SBH","Kudat, Kota Marudu, Pitas, Pulau Banggi",[[6.88,116.84],[6.49,116.74],[6.71,117.06]]],
["SBH06","SBH","Gunung Kinabalu",[[6.07,116.56]],1],
["SBH07","SBH","Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan",[[5.98,116.07],[5.95,116.66],[6.35,116.43],[5.73,115.93],[6.18,116.23]]],
["SBH08","SBH","Pensiangan, Keningau, Tambunan, Nabawan",[[5.34,116.16],[5.67,116.36],[5.05,116.44]]],
["SBH09","SBH","Beaufort, Kuala Penyu, Sipitang, Tenom, Long Pasia, Membakut, Weston",[[5.35,115.75],[5.08,115.55],[5.12,115.95],[5.57,115.60]]],
["SGR01","SGR","Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Shah Alam",[[3.07,101.52],[3.11,101.61],[3.25,101.65],[3.00,101.79],[2.69,101.75],[3.57,101.66]]],
["SGR02","SGR","Kuala Selangor, Sabak Bernam",[[3.34,101.25],[3.77,100.99]]],
["SGR03","SGR","Klang, Kuala Langat",[[3.04,101.45],[2.81,101.50]]],
["SWK01","SWK","Limbang, Lawas, Sundar, Trusan",[[4.75,115.01],[4.86,115.41]]],
["SWK02","SWK","Miri, Niah, Bekenu, Sibuti, Marudi",[[4.40,113.99],[4.18,114.32]]],
["SWK03","SWK","Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu",[[3.17,113.04],[2.70,113.78]]],
["SWK04","SWK","Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit",[[2.30,111.82],[2.90,112.09],[2.01,112.93],[2.10,112.15]]],
["SWK05","SWK","Sarikei, Matu, Julau, Rajang, Daro, Bintangor, Belawai",[[2.13,111.52],[2.17,111.63],[2.52,111.43]]],
["SWK06","SWK","Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkelili, Betong, Spaoh, Pusa, Saratok",[[1.24,111.46],[1.41,111.53],[1.75,111.34],[1.04,111.83]]],
["SWK07","SWK","Serian, Simunjan, Samarahan, Sebuyau, Meludam",[[1.17,110.57],[1.46,110.49],[1.38,110.75]]],
["SWK08","SWK","Kuching, Bau, Lundu, Sematan",[[1.55,110.36],[1.42,110.15],[1.67,109.85]]],
["SWK09","SWK","Zon Khas (Kampung Patarikan)",[[4.70,115.55]],1],
["TRG01","TRG","Kuala Terengganu, Marang, Kuala Nerus",[[5.33,103.14],[5.21,103.21]]],
["TRG02","TRG","Besut, Setiu",[[5.74,102.49],[5.52,102.74]]],
["TRG03","TRG","Hulu Terengganu",[[5.07,103.01]]],
["TRG04","TRG","Dungun, Kemaman",[[4.76,103.42],[4.23,103.42]]],
["WLY01","KUL","Kuala Lumpur, Putrajaya",[[3.14,101.69],[2.93,101.69]]],
["WLY02","LBN","Labuan",[[5.28,115.24]]]
];

// Public holidays 2026 (gazette list as published Aug 2025; Islamic dates subject to official announcement).
// s: "ALL", or list of states, or {except:[...]}
var HOLIDAYS = [
["2026-01-01","Tahun Baru","New Year's Day",{except:["JHR","KDH","KTN","PLS","TRG"]}],
["2026-01-14","Hari Keputeraan Yang di-Pertuan Besar N. Sembilan","YDPB Negeri Sembilan's Birthday",["NSN"]],
["2026-01-16","Israk dan Mikraj (anggaran)","Isra' and Mi'raj (estimated)",["KDH","NSN","PLS","TRG"]],
["2026-02-01","Hari Wilayah Persekutuan","Federal Territory Day",["KUL","LBN","PJY"]],
["2026-02-01","Thaipusam","Thaipusam",["JHR","KUL","NSN","PNG","PRK","PJY","SGR","KDH"]],
["2026-02-02","Cuti Thaipusam / Hari Wilayah","Thaipusam / Federal Territory Day holiday",["JHR","KUL","NSN","PNG","PRK","PJY","SGR","LBN"]],
["2026-02-17","Tahun Baru Cina","Chinese New Year","ALL"],
["2026-02-18","Tahun Baru Cina (Hari Kedua)","Chinese New Year (2nd day)","ALL"],
["2026-02-19","Awal Ramadan","Start of Ramadan",["JHR","KDH"]],
["2026-02-20","Hari Pengisytiharan Kemerdekaan","Independence Declaration Day",["MLK"]],
["2026-03-04","Ulang Tahun Pertabalan Sultan Terengganu","Installation of the Sultan of Terengganu",["TRG"]],
["2026-03-07","Nuzul Al-Quran (anggaran)","Nuzul Al-Quran (estimated)",["KTN","KUL","LBN","PHG","PJY","PLS","PNG","PRK","SGR","TRG"]],
["2026-03-21","Hari Raya Aidilfitri","Hari Raya Aidilfitri","ALL"],
["2026-03-22","Hari Raya Aidilfitri (Hari Kedua)","Hari Raya Aidilfitri (2nd day)","ALL"],
["2026-03-23","Hari Keputeraan Sultan Johor","Sultan of Johor's Birthday",["JHR"]],
["2026-03-30","Hari Jadi TYT Sabah","Sabah Governor's Birthday",["SBH"]],
["2026-04-03","Good Friday","Good Friday",["SBH","SWK"]],
["2026-04-26","Hari Keputeraan Sultan Terengganu","Sultan of Terengganu's Birthday",["TRG"]],
["2026-05-01","Hari Pekerja","Labour Day","ALL"],
["2026-05-03","Cuti Hari Pekerja","Labour Day holiday",["KDH"]],
["2026-05-17","Hari Keputeraan Raja Perlis","Raja of Perlis' Birthday",["PLS"]],
["2026-05-18","Cuti Hari Keputeraan Raja Perlis","Raja of Perlis' Birthday holiday",["PLS"]],
["2026-05-20","Hari Hol Pahang","Hari Hol Pahang",["PHG"]],
["2026-05-26","Hari Arafah","Arafat Day",["KTN","TRG"]],
["2026-05-27","Hari Raya Aidiladha","Hari Raya Haji","ALL"],
["2026-05-28","Hari Raya Aidiladha (Hari Kedua)","Hari Raya Haji (2nd day)",["KDH","KTN","TRG","PLS"]],
["2026-05-30","Pesta Kaamatan","Harvest Festival",["SBH","LBN"]],
["2026-05-31","Hari Wesak","Wesak Day","ALL"],
["2026-06-01","Hari Keputeraan Yang di-Pertuan Agong","Agong's Birthday","ALL"],
["2026-06-01","Hari Gawai","Gawai Dayak",["SWK"]],
["2026-06-02","Hari Gawai (Hari Kedua)","Gawai Dayak (2nd day)",["SWK"]],
["2026-06-17","Awal Muharram","Awal Muharram","ALL"],
["2026-06-21","Hari Keputeraan Sultan Kedah","Sultan of Kedah's Birthday",["KDH"]],
["2026-07-07","Hari Bandaraya Warisan Dunia George Town","George Town World Heritage City Day",["PNG"]],
["2026-07-11","Hari Jadi TYT Pulau Pinang","Penang Governor's Birthday",["PNG"]],
["2026-07-21","Hari Hol Almarhum Sultan Iskandar","Hari Hol Almarhum Sultan Iskandar",["JHR"]],
["2026-07-22","Hari Sarawak","Sarawak Day",["SWK"]],
["2026-07-31","Hari Keputeraan Sultan Pahang","Sultan of Pahang's Birthday",["PHG"]],
["2026-08-24","Hari Jadi TYT Melaka","Melaka Governor's Birthday",["MLK"]],
["2026-08-25","Maulidur Rasul","Prophet Muhammad's Birthday","ALL"],
["2026-08-31","Hari Kebangsaan","National Day","ALL"],
["2026-09-16","Hari Malaysia","Malaysia Day","ALL"],
["2026-09-29","Hari Keputeraan Sultan Kelantan","Sultan of Kelantan's Birthday",["KTN"]],
["2026-09-30","Hari Keputeraan Sultan Kelantan (Hari Kedua)","Sultan of Kelantan's Birthday (2nd day)",["KTN"]],
["2026-10-10","Hari Jadi TYT Sarawak","Sarawak Governor's Birthday",["SWK"]],
["2026-11-06","Hari Keputeraan Sultan Perak","Sultan of Perak's Birthday",["PRK"]],
["2026-11-08","Deepavali","Deepavali",{except:["SWK"]}],
["2026-11-09","Cuti Deepavali","Deepavali holiday",{except:["KDH","KTN","SWK","TRG"]}],
["2026-12-11","Hari Keputeraan Sultan Selangor","Sultan of Selangor's Birthday",["SGR"]],
["2026-12-24","Hari Krismas (Malam)","Christmas Eve",["SBH"]],
["2026-12-25","Hari Krismas","Christmas Day","ALL"],
// 2027 (non-Islamic, national). Lunar-based dates marked (anggaran) until gazetted. Islamic holidays for 2027 are computed from the Hijri calendar in app.js.
["2027-01-01","Tahun Baru","New Year's Day",{except:["JHR","KDH","KTN","PLS","TRG"]}],
["2027-01-22","Thaipusam (anggaran)","Thaipusam (estimate)",["JHR","KDH","NSN","PRK","PNG","SGR","KUL","PJY"]],
["2027-02-01","Hari Wilayah Persekutuan","Federal Territory Day",["KUL","PJY","LBN"]],
["2027-02-06","Tahun Baru Cina","Chinese New Year","ALL"],
["2027-02-07","Tahun Baru Cina (Hari Kedua)","Chinese New Year (2nd day)","ALL"],
["2027-05-01","Hari Pekerja","Labour Day","ALL"],
["2027-05-20","Hari Wesak (anggaran)","Wesak Day (estimate)","ALL"],
["2027-06-07","Hari Keputeraan Yang di-Pertuan Agong","Agong's Birthday","ALL"],
["2027-08-31","Hari Kebangsaan","National Day","ALL"],
["2027-09-16","Hari Malaysia","Malaysia Day","ALL"],
["2027-10-29","Deepavali (anggaran)","Deepavali (estimate)",{except:["SWK"]}],
["2027-12-25","Hari Krismas","Christmas Day","ALL"]
];
// School calendar 2026 (KPM Surat Siaran Bil. 3/2025 and later KPM announcements). [start,end,ms,en,group]
var SCHOOL = [
["2026-02-16","2026-02-16","Cuti tambahan Tahun Baru Cina","Extra CNY school holiday","A"],
["2026-02-19","2026-02-19","Cuti tambahan Tahun Baru Cina","Extra CNY school holiday","A"],
["2026-02-19","2026-02-20","Cuti tambahan Tahun Baru Cina","Extra CNY school holiday","B"],
["2026-03-18","2026-03-19","Cuti tambahan Aidilfitri","Extra Aidilfitri school holiday","A"],
["2026-03-18","2026-03-20","Cuti tambahan Aidilfitri","Extra Aidilfitri school holiday","B"],
["2026-03-20","2026-03-28","Cuti Penggal 1","Term 1 break","A"],
["2026-03-21","2026-03-29","Cuti Penggal 1","Term 1 break","B"],
["2026-05-22","2026-06-06","Cuti Pertengahan Tahun","Mid-year holiday","A"],
["2026-05-23","2026-06-07","Cuti Pertengahan Tahun","Mid-year holiday","B"],
["2026-08-28","2026-09-05","Cuti Penggal 2","Term 2 break","A"],
["2026-08-29","2026-09-06","Cuti Penggal 2","Term 2 break","B"],
["2026-11-08","2026-11-09","Cuti tambahan Deepavali","Extra Deepavali school holiday","A"],
["2026-11-09","2026-11-10","Cuti tambahan Deepavali","Extra Deepavali school holiday","B-SWK"],
["2026-11-09","2026-11-09","Cuti tambahan Deepavali","Extra Deepavali school holiday","SWK"],
["2026-12-04","2026-12-31","Cuti Akhir Persekolahan","Year-end school holiday","A"],
["2026-12-05","2026-12-31","Cuti Akhir Persekolahan","Year-end school holiday","B"]
];
var SCHOOL_START = {A:"2026-01-11",B:"2026-01-12"};

var HIJRI_MONTHS = ["Muharram","Safar","Rabiulawal","Rabiulakhir","Jamadilawal","Jamadilakhir","Rejab","Syaaban","Ramadan","Syawal","Zulkaedah","Zulhijjah"];
// Islamic days by Hijri month/day
var ISLAMIC_DAYS = [
[1,1,"Awal Muharram (Maal Hijrah)","Islamic New Year"],
[1,9,"Hari Tasu'a (puasa sunat)","Tasu'a (sunnah fast)"],
[1,10,"Hari Asyura (puasa sunat)","Ashura (sunnah fast)"],
[3,12,"Maulidur Rasul","Prophet's Birthday"],
[7,27,"Israk dan Mikraj","Isra' and Mi'raj"],
[8,15,"Nisfu Syaaban","Mid-Sha'ban"],
[9,1,"Awal Ramadan","First of Ramadan"],
[9,17,"Nuzul Al-Quran","Nuzul Al-Quran"],
[9,21,"Malam ganjil 10 akhir Ramadan","Odd night, last 10 of Ramadan"],
[9,23,"Malam ganjil 10 akhir Ramadan","Odd night, last 10 of Ramadan"],
[9,25,"Malam ganjil 10 akhir Ramadan","Odd night, last 10 of Ramadan"],
[9,27,"Malam ganjil 10 akhir Ramadan","Odd night, last 10 of Ramadan"],
[9,29,"Malam ganjil 10 akhir Ramadan","Odd night, last 10 of Ramadan"],
[10,1,"Hari Raya Aidilfitri","Eid al-Fitr"],
[12,9,"Hari Arafah (puasa sunat)","Day of Arafah (sunnah fast)"],
[12,10,"Hari Raya Aidiladha","Eid al-Adha"],
[12,11,"Hari Tasyrik","Days of Tashriq"],
[12,12,"Hari Tasyrik","Days of Tashriq"],
[12,13,"Hari Tasyrik","Days of Tashriq"]
];

// ---- Religious content ----
// Each item: ar (Arabic), ms, en, n (repeat), src (source), why (ms/en)
var Q = {
fatihah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾",
baqarah1_5: "الم ﴿١﴾ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ﴿٢﴾ الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ ﴿٣﴾ وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ ﴿٤﴾ أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ ﴿٥﴾",
kursi: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ ﴿٢٥٥﴾",
ikhlas: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾",
falaq: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾",
nas: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾"
};

var TASBIH = [
{ar:"سُبْحَانَ اللَّهِ", ms:"Maha Suci Allah", en:"Glory be to Allah", n:33},
{ar:"الْحَمْدُ لِلَّهِ", ms:"Segala puji bagi Allah", en:"All praise is for Allah", n:33},
{ar:"اللَّهُ أَكْبَرُ", ms:"Allah Maha Besar", en:"Allah is the Greatest", n:33},
{ar:"لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", ms:"Tiada Tuhan melainkan Allah, Yang Esa, tiada sekutu bagi-Nya; bagi-Nya kerajaan dan pujian, dan Dia Maha Berkuasa atas segala sesuatu", en:"None has the right to be worshipped but Allah alone, without partner; His is the dominion and the praise, and He has power over all things", n:1}
];
var TASBIH_WHY = {src:"Sahih Muslim 597", ms:"Abu Hurairah meriwayatkan: sesiapa bertasbih 33 kali, bertahmid 33 kali dan bertakbir 33 kali selepas setiap solat, lalu menggenapkan 100 dengan tahlil, diampunkan dosanya walaupun seperti buih di lautan.", en:"Abu Hurairah reported: whoever glorifies Allah 33 times, praises Him 33 times and magnifies Him 33 times after every prayer, then completes 100 with the tahlil, his sins are forgiven even if they are like the foam of the sea."};

var POST_PRAYER = [
{ar:"أَسْتَغْفِرُ اللَّهَ", ms:"Aku memohon ampun kepada Allah", en:"I seek Allah's forgiveness", n:3, src:"Sahih Muslim 591", why_ms:"Nabi ﷺ beristighfar tiga kali sebaik selesai solat (hadis Thauban).", why_en:"The Prophet ﷺ sought forgiveness three times as soon as he finished the prayer (hadith of Thawban)."},
{ar:"اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", ms:"Ya Allah, Engkaulah Maha Sejahtera dan daripada-Mu kesejahteraan; Maha Berkat Engkau wahai Tuhan yang memiliki kebesaran dan kemuliaan", en:"O Allah, You are Peace and from You is peace; blessed are You, Owner of majesty and honour", n:1, src:"Sahih Muslim 591", why_ms:"Dibaca selepas istighfar, dalam hadis yang sama.", why_en:"Read right after the istighfar, in the same hadith."},
{ar:"لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ", ms:"Tiada Tuhan melainkan Allah, Yang Esa, tiada sekutu bagi-Nya... Ya Allah, tiada yang dapat menghalang apa yang Engkau beri, tiada yang dapat memberi apa yang Engkau tahan, dan tidak bermanfaat kekayaan bagi pemiliknya di sisi-Mu", en:"None is worthy of worship but Allah alone... O Allah, none can withhold what You give, nor give what You withhold, and no wealth avails its owner against You", n:1, src:"Sahih al-Bukhari 844, Sahih Muslim 593", why_ms:"Al-Mughirah meriwayatkan Nabi ﷺ membacanya selepas setiap solat fardu.", why_en:"Al-Mughirah reported the Prophet ﷺ said this after every obligatory prayer."},
{title:"Ayat al-Kursi (Al-Baqarah 2:255)", ar:Q.kursi, ms:"Allah, tiada Tuhan melainkan Dia, Yang Hidup Kekal lagi terus-menerus mentadbir makhluk-Nya... (maksud ringkas)", en:"Allah, there is no deity except Him, the Ever-Living, the Sustainer of existence... (summary)", n:1, src:"An-Nasa'i, as-Sunan al-Kubra 9928 (disahihkan oleh al-Albani)", why_ms:"Sesiapa membacanya selepas setiap solat fardu, tiada yang menghalangnya masuk syurga kecuali mati.", why_en:"Whoever reads it after every obligatory prayer, nothing stands between him and Paradise except death."},
{title:"Al-Ikhlas", ar:Q.ikhlas, ms:"Katakanlah: Dialah Allah Yang Maha Esa...", en:"Say: He is Allah, the One...", n:1, n3:true, src:"Sunan Abi Dawud 1523, Jami' at-Tirmidhi 2903", why_ms:"Uqbah bin Amir disuruh membaca al-mu'awwidzat selepas setiap solat (3 kali selepas Subuh dan Maghrib).", why_en:"Uqbah ibn Amir was told to recite the mu'awwidhat after every prayer (3 times after Subuh and Maghrib)."},
{title:"Al-Falaq", ar:Q.falaq, ms:"Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh...", en:"Say: I seek refuge in the Lord of daybreak...", n:1, n3:true, src:"Sunan Abi Dawud 1523, Jami' at-Tirmidhi 2903", why_ms:"Sama seperti di atas.", why_en:"Same as above."},
{title:"An-Nas", ar:Q.nas, ms:"Katakanlah: Aku berlindung kepada Tuhan manusia...", en:"Say: I seek refuge in the Lord of mankind...", n:1, n3:true, src:"Sunan Abi Dawud 1523, Jami' at-Tirmidhi 2903", why_ms:"Sama seperti di atas.", why_en:"Same as above."},
{tasbih:true, title:"Tasbih, Tahmid, Takbir 33×", ar:"سُبْحَانَ اللَّهِ ×٣٣ ، الْحَمْدُ لِلَّهِ ×٣٣ ، اللَّهُ أَكْبَرُ ×٣٣", ms:"Buka kaunter tasbih", en:"Open the tasbih counter", n:1, src:"Sahih Muslim 597", why_ms:TASBIH_WHY.ms, why_en:TASBIH_WHY.en},
{ar:"اللَّهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", ms:"Ya Allah, bantulah aku untuk mengingati-Mu, bersyukur kepada-Mu dan memperelokkan ibadah kepada-Mu", en:"O Allah, help me to remember You, thank You and worship You well", n:1, src:"Sunan Abi Dawud 1522, Sunan an-Nasa'i 1303", why_ms:"Nabi ﷺ berpesan kepada Mu'adz agar jangan meninggalkannya selepas setiap solat.", why_en:"The Prophet ﷺ told Mu'adh never to leave it after any prayer."},
{only:["subuh","maghrib"], ar:"لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", ms:"Tiada Tuhan melainkan Allah... Dia menghidupkan dan mematikan, dan Dia Maha Berkuasa atas segala sesuatu", en:"None is worthy of worship but Allah alone... He gives life and causes death, and He has power over all things", n:10, src:"Jami' at-Tirmidhi 3474 (hasan)", why_ms:"Selepas Subuh (dan Maghrib): ditulis 10 kebaikan, dihapus 10 kejahatan, dan dilindungi pada hari itu.", why_en:"After Subuh (and Maghrib): ten good deeds written, ten sins erased, and protection that day."},
{only:["subuh"], ar:"اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا", ms:"Ya Allah, aku memohon ilmu yang bermanfaat, rezeki yang baik dan amalan yang diterima", en:"O Allah, I ask You for beneficial knowledge, good provision and accepted deeds", n:1, src:"Sunan Ibn Majah 925", why_ms:"Ummu Salamah meriwayatkan Nabi ﷺ membacanya selepas solat Subuh.", why_en:"Umm Salamah reported the Prophet ﷺ said it after Subuh."}
];

// Al-Ma'thurat (Wazifah Sughra). Order and counts: VERIFY against an endorsed printed edition.
var MATHURAT = [
{title:"Ta'awwuz & Al-Fatihah", ar:"أَعُوذُ بِاللَّهِ السَّمِيعِ الْعَلِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ " + Q.fatihah, ms:"Surah pembukaan: pujian kepada Allah dan permohonan petunjuk jalan yang lurus (maksud ringkas)", en:"The Opening: praise of Allah and a plea for guidance to the straight path (summary)", n:1, src:"Al-Quran 1:1-7"},
{title:"Al-Baqarah 1-5", ar:Q.baqarah1_5, ms:"Kitab ini tiada keraguan, petunjuk bagi orang bertakwa... merekalah orang yang berjaya (maksud ringkas)", en:"This is the Book, no doubt in it, guidance for the God-conscious... they are the successful (summary)", n:1, src:"Al-Quran 2:1-5"},
{title:"Ayat al-Kursi (2:255)", ar:Q.kursi, ms:"Allah, tiada Tuhan melainkan Dia, Yang Hidup Kekal... (maksud ringkas)", en:"Allah, there is no deity except Him, the Ever-Living... (summary)", n:1, src:"Al-Quran 2:255"},
{title:"Al-Baqarah 256-257", ar:"لَا إِكْرَاهَ فِي الدِّينِ ۖ قَد تَّبَيَّنَ الرُّشْدُ مِنَ الْغَيِّ ۚ فَمَن يَكْفُرْ بِالطَّاغُوتِ وَيُؤْمِن بِاللَّهِ فَقَدِ اسْتَمْسَكَ بِالْعُرْوَةِ الْوُثْقَىٰ لَا انفِصَامَ لَهَا ۗ وَاللَّهُ سَمِيعٌ عَلِيمٌ ﴿٢٥٦﴾ اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا يُخْرِجُهُم مِّنَ الظُّلُمَاتِ إِلَى النُّورِ ۖ وَالَّذِينَ كَفَرُوا أَوْلِيَاؤُهُمُ الطَّاغُوتُ يُخْرِجُونَهُم مِّنَ النُّورِ إِلَى الظُّلُمَاتِ ۗ أُولَٰئِكَ أَصْحَابُ النَّارِ ۖ هُمْ فِيهَا خَالِدُونَ ﴿٢٥٧﴾", ms:"(256) Tidak ada paksaan dalam agama (Islam), kerana sesungguhnya telah nyata kebenaran (Islam) daripada kesesatan. Oleh itu, sesiapa yang tidak percayakan Taghut dan ia pula beriman kepada Allah, maka sesungguhnya ia telah berpegang kepada simpulan (tali agama) yang teguh yang tidak akan putus. Dan (ingatlah), Allah Maha Mendengar, lagi Maha Mengetahui. (257) Allah Pelindung (yang mengawal dan menolong) orang-orang yang beriman. Ia mengeluarkan mereka dari kegelapan (kufur) kepada cahaya (iman). Dan orang-orang yang kafir, penolong-penolong mereka ialah Taghut yang mengeluarkan mereka dari cahaya (iman) kepada kegelapan (kufur). Mereka itulah ahli neraka, mereka kekal di dalamnya.", en:"(256) There shall be no compulsion in religion. The right course has become clear from the wrong. So whoever disbelieves in false deities and believes in Allah has grasped the most trustworthy handhold, which will never break. And Allah is All-Hearing, All-Knowing. (257) Allah is the ally of those who believe. He brings them out from darknesses into the light. And those who disbelieve, their allies are false deities. They take them out of the light into darknesses. Those are the companions of the Fire; they will abide eternally therein.", n:1, src:"Al-Quran 2:256-257"},
{title:"Al-Baqarah 284-286", ar:"لِّلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ وَإِن تُبْدُوا مَا فِي أَنفُسِكُمْ أَوْ تُخْفُوهُ يُحَاسِبْكُم بِهِ اللَّهُ ۖ فَيَغْفِرُ لِمَن يَشَاءُ وَيُعَذِّبُ مَن يَشَاءُ ۗ وَاللَّهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ﴿٢٨٤﴾ آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ﴿٢٨٥﴾ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ ﴿٢٨٦﴾", ms:"(284) Segala yang ada di langit dan yang ada di bumi adalah kepunyaan Allah. Dan jika kamu melahirkan apa yang ada di dalam hati kamu atau kamu menyembunyikannya, nescaya Allah akan menghitung dan menyatakannya kepada kamu. Kemudian Ia mengampunkan bagi sesiapa yang dikehendaki-Nya dan menyeksa sesiapa yang dikehendaki-Nya. Dan (ingatlah), Allah Maha Kuasa atas tiap-tiap sesuatu. (285) Rasulullah telah beriman kepada apa yang diturunkan kepadanya dari Tuhannya, dan juga orang-orang yang beriman. Semuanya beriman kepada Allah, dan Malaikat-malaikat-Nya, dan Kitab-kitab-Nya, dan Rasul-rasul-Nya. (Mereka berkata): Kami tidak membezakan antara seorang dengan yang lain dari Rasul-rasul-Nya. Mereka berkata lagi: Kami dengar dan kami taat (kami pohonkan) keampunan-Mu wahai Tuhan kami, dan kepada-Mu jualah tempat kembali. (286) Allah tidak memberati seseorang melainkan apa yang terdaya olehnya. Ia mendapat pahala kebaikan yang diusahakannya, dan ia juga menanggung dosa kejahatan yang diusahakannya. (Mereka berdoa): Wahai Tuhan kami! Janganlah Engkau mengirakan kami salah jika kami lupa atau kami tersalah. Wahai Tuhan kami! Janganlah Engkau bebankan kepada kami bebanan yang berat sebagaimana yang telah Engkau bebankan kepada orang-orang yang terdahulu daripada kami. Wahai Tuhan kami! Janganlah Engkau pikulkan kepada kami apa yang kami tidak terdaya memikulnya. Dan maafkanlah kesalahan kami, serta ampunkanlah dosa kami, dan berilah rahmat kepada kami. Engkaulah Penolong kami; oleh itu, tolonglah kami untuk mencapai kemenangan terhadap kaum-kaum yang kafir.", en:"(284) To Allah belongs whatever is in the heavens and whatever is in the earth. Whether you show what is within yourselves or conceal it, Allah will bring you to account for it. Then He will forgive whom He wills and punish whom He wills, and Allah is over all things competent. (285) The Messenger has believed in what was revealed to him from his Lord, and so have the believers. All of them have believed in Allah and His angels and His books and His messengers, (saying), We make no distinction between any of His messengers. And they say, We hear and we obey. (We seek) Your forgiveness, our Lord, and to You is the final destination. (286) Allah does not charge a soul except with that within its capacity. It will have the reward of what it has earned, and it will bear the consequence of what it has earned. Our Lord, do not impose blame upon us if we forget or err. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us, and forgive us, and have mercy upon us. You are our protector, so give us victory over the disbelieving people.", n:1, src:"Al-Quran 2:284-286; Sahih al-Bukhari 5009"},
{title:"Al-Ikhlas", ar:Q.ikhlas, ms:"Katakanlah: Dialah Allah Yang Maha Esa...", en:"Say: He is Allah, the One...", n:3, src:"Al-Quran 112; Sunan Abi Dawud 5082"},
{title:"Al-Falaq", ar:Q.falaq, ms:"Aku berlindung kepada Tuhan yang menguasai subuh...", en:"I seek refuge in the Lord of daybreak...", n:3, src:"Al-Quran 113; Sunan Abi Dawud 5082"},
{title:"An-Nas", ar:Q.nas, ms:"Aku berlindung kepada Tuhan manusia...", en:"I seek refuge in the Lord of mankind...", n:3, src:"Al-Quran 114; Sunan Abi Dawud 5082"},
{ar:"أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا شَرِيكَ لَهُ، لَا إِلَٰهَ إِلَّا هُوَ، وَإِلَيْهِ النُّشُورُ", ev:"أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا شَرِيكَ لَهُ، لَا إِلَٰهَ إِلَّا هُوَ، وَإِلَيْهِ الْمَصِيرُ", ms:"Kami berpagi (berpetang) dan kerajaan milik Allah; segala puji bagi Allah, tiada sekutu bagi-Nya... kepada-Nya kebangkitan (tempat kembali)", en:"We have entered the morning (evening) and the dominion belongs to Allah; all praise is His, He has no partner... to Him is the resurrection (the return)", n:1, src:"Sahih Muslim 2723 (makna)"},
{ar:"أَصْبَحْنَا عَلَىٰ فِطْرَةِ الْإِسْلَامِ، وَعَلَىٰ كَلِمَةِ الْإِخْلَاصِ، وَعَلَىٰ دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَىٰ مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا، وَمَا كَانَ مِنَ الْمُشْرِكِينَ", ev:"أَمْسَيْنَا عَلَىٰ فِطْرَةِ الْإِسْلَامِ، وَعَلَىٰ كَلِمَةِ الْإِخْلَاصِ، وَعَلَىٰ دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَىٰ مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا، وَمَا كَانَ مِنَ الْمُشْرِكِينَ", ms:"Kami berpagi (berpetang) di atas fitrah Islam, kalimah ikhlas, agama Nabi kami Muhammad ﷺ dan millah bapa kami Ibrahim yang lurus lagi muslim", en:"We have entered the morning (evening) upon the fitrah of Islam, the word of sincerity, the religion of our Prophet Muhammad ﷺ and the way of our father Ibrahim, upright and Muslim", n:1, src:"Musnad Ahmad 15360"},
{ar:"اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ", ev:"اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ", ms:"Ya Allah, apa jua nikmat padaku atau pada makhluk-Mu pagi (petang) ini adalah daripada-Mu semata-mata; bagi-Mu segala puji dan syukur", en:"O Allah, whatever blessing I or any of Your creation have this morning (evening) is from You alone; to You be praise and thanks", n:1, src:"Sunan Abi Dawud 5073"},
{ar:"اللَّهُمَّ إِنِّي أَصْبَحْتُ مِنْكَ فِي نِعْمَةٍ وَعَافِيَةٍ وَسِتْرٍ، فَأَتِمَّ نِعْمَتَكَ عَلَيَّ وَعَافِيَتَكَ وَسِتْرَكَ فِي الدُّنْيَا وَالْآخِرَةِ", ev:"اللَّهُمَّ إِنِّي أَمْسَيْتُ مِنْكَ فِي نِعْمَةٍ وَعَافِيَةٍ وَسِتْرٍ، فَأَتِمَّ نِعْمَتَكَ عَلَيَّ وَعَافِيَتَكَ وَسِتْرَكَ فِي الدُّنْيَا وَالْآخِرَةِ", ms:"Ya Allah, aku berpagi (berpetang) dalam nikmat, afiat dan perlindungan-Mu; sempurnakanlah semuanya di dunia dan akhirat", en:"O Allah, I have entered the morning (evening) in Your blessing, wellbeing and covering; complete them for me in this world and the next", n:3, src:"Amalan Al-Ma'thurat (VERIFY sanad)"},
{ar:"يَا رَبِّ لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ", ms:"Wahai Tuhanku, bagi-Mu segala puji sebagaimana layak bagi keagungan wajah-Mu dan kebesaran kekuasaan-Mu", en:"O my Lord, to You is praise as befits the majesty of Your Face and the greatness of Your authority", n:3, src:"Sunan Ibn Majah 3801"},
{ar:"رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا وَرَسُولًا", ms:"Aku reda Allah sebagai Tuhan, Islam sebagai agama dan Muhammad ﷺ sebagai Nabi dan Rasul", en:"I am pleased with Allah as Lord, Islam as religion and Muhammad ﷺ as Prophet and Messenger", n:3, src:"Sunan Abi Dawud 5072"},
{ar:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", ms:"Maha Suci Allah dan segala puji bagi-Nya, sebanyak makhluk-Nya, seredha diri-Nya, seberat Arasy-Nya dan sebanyak dakwat kalimah-Nya", en:"Glory and praise be to Allah, as many as His creation, as much as pleases Him, the weight of His Throne and the ink of His words", n:3, src:"Sahih Muslim 2726"},
{ar:"بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", ms:"Dengan nama Allah yang bersama nama-Nya tiada sesuatu pun di bumi dan di langit dapat memudaratkan; Dia Maha Mendengar lagi Maha Mengetahui", en:"In the name of Allah, with whose name nothing on earth or in heaven can cause harm; He is the All-Hearing, the All-Knowing", n:3, src:"Sunan Abi Dawud 5088, Jami' at-Tirmidhi 3388"},
{ar:"أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", ms:"Aku berlindung dengan kalimah-kalimah Allah yang sempurna daripada kejahatan makhluk-Nya", en:"I seek refuge in the perfect words of Allah from the evil of what He created", n:3, src:"Sahih Muslim 2708"},
{ar:"اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ", ms:"Ya Allah, aku berlindung dengan-Mu daripada dukacita dan kesedihan, lemah dan malas, pengecut dan bakhil, serta beban hutang dan penindasan manusia", en:"O Allah, I seek refuge in You from worry and grief, weakness and laziness, cowardice and miserliness, the burden of debt and being overpowered by men", n:3, src:"Sahih al-Bukhari 6369; Sunan Abi Dawud 1555"},
{ar:"اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ", ms:"Ya Allah, sejahterakanlah tubuhku, pendengaranku dan penglihatanku; tiada Tuhan melainkan Engkau", en:"O Allah, grant me wellbeing in my body, my hearing and my sight; there is no deity but You", n:3, src:"Sunan Abi Dawud 5090"},
{title:"Sayyidul Istighfar", ar:"اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", ms:"Ya Allah, Engkau Tuhanku, tiada Tuhan melainkan Engkau; Engkau menciptakan aku dan aku hamba-Mu... ampunilah aku, kerana tiada yang mengampunkan dosa melainkan Engkau", en:"O Allah, You are my Lord, there is no deity but You; You created me and I am Your servant... so forgive me, for none forgives sins but You", n:1, src:"Sahih al-Bukhari 6306"},
{ar:"أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ", ms:"Aku memohon ampun kepada Allah Yang Maha Agung, tiada Tuhan melainkan Dia Yang Hidup Kekal lagi Berdiri Sendiri, dan aku bertaubat kepada-Nya", en:"I seek forgiveness from Allah the Magnificent, besides whom there is no deity, the Ever-Living, the Self-Sustaining, and I repent to Him", n:3, src:"Sunan Abi Dawud 1517 (makna)"},
{title:"Selawat", ar:"اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلِّمْ", ms:"Ya Allah, limpahkanlah selawat dan salam ke atas penghulu kami Muhammad, keluarga dan para sahabatnya", en:"O Allah, send blessings and peace upon our master Muhammad, his family and companions", n:10, src:"Sahih Muslim 408 (kelebihan selawat)"},
{title:"Doa Rabitah", ar:"اللَّهُمَّ إِنَّكَ تَعْلَمُ أَنَّ هَٰذِهِ الْقُلُوبَ قَدِ اجْتَمَعَتْ عَلَىٰ مَحَبَّتِكَ، وَالْتَقَتْ عَلَىٰ طَاعَتِكَ، وَتَوَحَّدَتْ عَلَىٰ دَعْوَتِكَ، وَتَعَاهَدَتْ عَلَىٰ نُصْرَةِ شَرِيعَتِكَ، فَوَثِّقِ اللَّهُمَّ رَابِطَتَهَا، وَأَدِمْ وُدَّهَا، وَاهْدِهَا سُبُلَهَا، وَامْلَأْهَا بِنُورِكَ الَّذِي لَا يَخْبُو، وَاشْرَحْ صُدُورَهَا بِفَيْضِ الْإِيمَانِ بِكَ، وَجَمِيلِ التَّوَكُّلِ عَلَيْكَ، وَأَحْيِهَا بِمَعْرِفَتِكَ، وَأَمِتْهَا عَلَى الشَّهَادَةِ فِي سَبِيلِكَ، إِنَّكَ نِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ. اللَّهُمَّ آمِينَ، وَصَلِّ اللَّهُمَّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلِّمْ", ms:"Ya Allah, sesungguhnya Engkau mengetahui bahawa hati-hati ini telah berhimpun kerana cinta kepada-Mu, bertemu dalam mentaati-Mu, bersatu dalam menyeru kepada-Mu, dan berjanji setia untuk membela syariat-Mu. Maka kukuhkanlah, ya Allah, ikatannya, kekalkanlah kemesraannya, tunjukkanlah jalan-jalannya, penuhilah ia dengan cahaya-Mu yang tidak pernah malap, lapangkanlah dadanya dengan limpahan iman kepada-Mu dan keindahan tawakal kepada-Mu, hidupkanlah ia dengan makrifah-Mu, dan matikanlah ia dalam keadaan syahid di jalan-Mu. Sesungguhnya Engkaulah sebaik-baik Pelindung dan sebaik-baik Penolong. Ya Allah, perkenankanlah. Dan limpahkanlah, ya Allah, selawat dan salam ke atas penghulu kami Muhammad, keluarga dan sahabat-sahabatnya.", en:"O Allah, You know that these hearts have gathered in love for You, met in obedience to You, united in calling to You, and pledged to support Your law. So strengthen, O Allah, their bond, make their affection last, guide them to their paths, fill them with Your light that never dims, expand their chests with abundant faith in You and beautiful reliance on You, give them life with knowledge of You, and let them die as martyrs in Your path. You are the best Protector and the best Helper. O Allah, accept. And send blessings and peace, O Allah, upon our master Muhammad, his family and his companions.", n:1, src:"Susunan Imam Hasan al-Banna (bukan hadis; doa ulama)"},
];

var DOA = [
{cat:"Makan / Eating", items:[
{t_ms:"Sebelum makan", t_en:"Before eating", ar:"بِسْمِ اللَّهِ", ms:"Dengan nama Allah", en:"In the name of Allah", src:"Sahih al-Bukhari 5376"},
{t_ms:"Sebelum makan (doa lazim)", t_en:"Before eating (common doa)", ar:"اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ", ms:"Ya Allah, berkatilah kami pada rezeki yang Engkau kurniakan kepada kami, dan peliharalah kami daripada azab neraka", en:"O Allah, bless us in what You have provided for us, and protect us from the punishment of the Fire", src:"Ibn as-Sunni, 'Amal al-Yaum wa al-Lailah (sanad da'if)"},
{t_ms:"Terlupa baca di awal", t_en:"If you forgot at the start", ar:"بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ", ms:"Dengan nama Allah pada awal dan akhirnya", en:"In the name of Allah at its beginning and its end", src:"Sunan Abi Dawud 3767, Jami' at-Tirmidhi 1858"},
{t_ms:"Selepas makan", t_en:"After eating", ar:"الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ", ms:"Segala puji bagi Allah yang memberiku makanan ini dan merezekikannya tanpa daya dan kekuatan dariku", en:"Praise be to Allah who fed me this and provided it for me without any power or strength from me", src:"Sunan Abi Dawud 4023, Jami' at-Tirmidhi 3458"},
{t_ms:"Berbuka puasa", t_en:"Breaking the fast", ar:"ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ", ms:"Telah hilang dahaga, urat-urat telah basah, dan pahala telah tetap insya-Allah", en:"Thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills", src:"Sunan Abi Dawud 2357"}]},
{cat:"Rumah / Home", items:[
{t_ms:"Keluar rumah", t_en:"Leaving the house", ar:"بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", ms:"Dengan nama Allah, aku bertawakal kepada Allah, tiada daya dan kekuatan melainkan dengan Allah", en:"In the name of Allah, I rely on Allah, there is no power and no strength except with Allah", src:"Sunan Abi Dawud 5095, Jami' at-Tirmidhi 3426"},
{t_ms:"Masuk rumah", t_en:"Entering the house", ar:"بِسْمِ اللَّهِ", ms:"Sebut nama Allah ketika masuk, kemudian beri salam kepada ahli rumah; syaitan tidak mendapat tempat bermalam", en:"Mention Allah on entering, then greet the household; Shaytan finds no place to stay", src:"Sahih Muslim 2018"}]},
{cat:"Kenderaan / Travel", items:[
{t_ms:"Naik kenderaan", t_en:"Getting into a vehicle", ar:"سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ", ms:"Maha Suci Allah yang menundukkan kenderaan ini bagi kami, padahal kami tidak mampu menguasainya, dan kepada Tuhan kamilah kami akan kembali", en:"Glory be to Him who has subjected this to us, and we could never have done it ourselves, and to our Lord we will surely return", src:"Al-Quran 43:13-14; Sunan Abi Dawud 2602"},
{t_ms:"Doa musafir", t_en:"Starting a journey", ar:"اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ", ms:"Ya Allah, kami memohon dalam perjalanan ini kebaikan, takwa dan amalan yang Engkau redai (dibaca selepas takbir 3× dan ayat naik kenderaan)", en:"O Allah, we ask You on this journey for righteousness, piety and deeds that please You (after takbir ×3 and the vehicle verse)", src:"Sahih Muslim 1342"}]},
{cat:"Tandas & Wuduk / Toilet & Wudhu", items:[
{t_ms:"Masuk tandas", t_en:"Entering the toilet", ar:"اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ", ms:"Ya Allah, aku berlindung dengan-Mu daripada syaitan jantan dan betina", en:"O Allah, I seek refuge in You from male and female devils", src:"Sahih al-Bukhari 142, Sahih Muslim 375"},
{t_ms:"Keluar tandas", t_en:"Leaving the toilet", ar:"غُفْرَانَكَ", ms:"Aku memohon keampunan-Mu", en:"I seek Your forgiveness", src:"Sunan Abi Dawud 30, Jami' at-Tirmidhi 7"},
{t_ms:"Selepas wuduk", t_en:"After wudhu", ar:"أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", ms:"Aku bersaksi tiada Tuhan melainkan Allah, Yang Esa, tiada sekutu bagi-Nya, dan aku bersaksi Muhammad hamba dan rasul-Nya", en:"I bear witness that none is worthy of worship but Allah alone, without partner, and that Muhammad is His servant and Messenger", src:"Sahih Muslim 234"}]},
{cat:"Masjid", items:[
{t_ms:"Masuk masjid", t_en:"Entering the masjid", ar:"اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", ms:"Ya Allah, bukakanlah bagiku pintu-pintu rahmat-Mu", en:"O Allah, open for me the gates of Your mercy", src:"Sahih Muslim 713"},
{t_ms:"Keluar masjid", t_en:"Leaving the masjid", ar:"اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", ms:"Ya Allah, aku memohon kurniaan-Mu", en:"O Allah, I ask You of Your bounty", src:"Sahih Muslim 713"}]},
{cat:"Tidur / Sleep", items:[
{t_ms:"Sebelum tidur", t_en:"Before sleeping", ar:"بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", ms:"Dengan nama-Mu ya Allah, aku mati dan aku hidup", en:"In Your name, O Allah, I die and I live", src:"Sahih al-Bukhari 6324"},
{t_ms:"Bangun tidur", t_en:"Waking up", ar:"الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", ms:"Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dibangkitkan", en:"Praise be to Allah who gave us life after causing us to die, and to Him is the resurrection", src:"Sahih al-Bukhari 6324"}]},
{cat:"Pakaian / Clothing", items:[
{t_ms:"Memakai pakaian", t_en:"Putting on clothes", ar:"الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَٰذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ", ms:"Segala puji bagi Allah yang memakaikan aku pakaian ini dan merezekikannya tanpa daya dan kekuatan dariku", en:"Praise be to Allah who clothed me with this and provided it without any power or strength from me", src:"Sunan Abi Dawud 4023"}]},
{cat:"Lain-lain / Others", items:[
{t_ms:"Ketika hujan", t_en:"When it rains", ar:"اللَّهُمَّ صَيِّبًا نَافِعًا", ms:"Ya Allah, jadikanlah hujan ini bermanfaat", en:"O Allah, make it a beneficial rain", src:"Sahih al-Bukhari 1032"},
{t_ms:"Ketika susah hati", t_en:"In distress", ar:"لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", ms:"Tiada Tuhan melainkan Engkau, Maha Suci Engkau, sesungguhnya aku termasuk orang yang zalim", en:"There is no deity but You, glory be to You; indeed I have been of the wrongdoers", src:"Al-Quran 21:87; Jami' at-Tirmidhi 3505"},
{t_ms:"Sebelum belajar", t_en:"Before studying", ar:"رَبِّ زِدْنِي عِلْمًا", ms:"Ya Tuhanku, tambahkanlah ilmuku", en:"My Lord, increase me in knowledge", src:"Al-Quran 20:114"},
{t_ms:"Bersin", t_en:"Sneezing", ar:"الْحَمْدُ لِلَّهِ", ms:"Yang bersin: Alhamdulillah. Yang mendengar: Yarhamukallah (يَرْحَمُكَ اللَّهُ). Dijawab: Yahdikumullah wa yuslihu balakum (يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ)", en:"The sneezer says Alhamdulillah; the listener says Yarhamukallah; the sneezer replies Yahdikumullah wa yuslih balakum", src:"Sahih al-Bukhari 6224"}]}
];

// ---- Full meanings (Malay based on Tafsir Pimpinan Ar-Rahman wording; English after Saheeh International). VERIFY by ustaz. ----
var MEAN = {
fatihah_ms:"(1) Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani. (2) Segala puji tertentu bagi Allah, Tuhan yang memelihara dan mentadbirkan sekalian alam. (3) Yang Maha Pemurah, lagi Maha Mengasihani. (4) Yang Menguasai pemerintahan hari pembalasan (hari akhirat). (5) Engkaulah sahaja (Ya Allah) yang kami sembah, dan kepada Engkaulah sahaja kami memohon pertolongan. (6) Tunjukilah kami jalan yang lurus. (7) Iaitu jalan orang-orang yang Engkau telah kurniakan nikmat kepada mereka, bukan (jalan) orang-orang yang Engkau telah murkai, dan bukan pula (jalan) orang-orang yang sesat.",
fatihah_en:"(1) In the name of Allah, the Entirely Merciful, the Especially Merciful. (2) All praise is due to Allah, Lord of the worlds, (3) the Entirely Merciful, the Especially Merciful, (4) Sovereign of the Day of Recompense. (5) It is You we worship and You we ask for help. (6) Guide us to the straight path, (7) the path of those upon whom You have bestowed favour, not of those who have earned Your anger or of those who are astray.",
taawwuz_ms:"Aku berlindung kepada Allah Yang Maha Mendengar lagi Maha Mengetahui daripada syaitan yang direjam. ",
taawwuz_en:"I seek refuge in Allah, the All-Hearing, the All-Knowing, from Satan the accursed. ",
baqarah_ms:"(1) Alif, Laam, Miim. (2) Kitab Al-Quran ini, tidak ada sebarang syak padanya; ia menjadi petunjuk bagi orang-orang yang (hendak) bertakwa; (3) Iaitu orang-orang yang beriman kepada perkara-perkara yang ghaib, dan mendirikan (mengerjakan) sembahyang serta membelanjakan sebahagian dari rezeki yang Kami berikan kepada mereka. (4) Dan juga orang-orang yang beriman kepada Kitab Al-Quran yang diturunkan kepadamu (wahai Muhammad), dan Kitab-kitab yang diturunkan dahulu daripadamu, serta mereka yakin akan (adanya) hari akhirat. (5) Mereka itulah yang tetap mendapat petunjuk dari Tuhan mereka, dan merekalah orang-orang yang berjaya.",
baqarah_en:"(1) Alif, Lam, Mim. (2) This is the Book about which there is no doubt, a guidance for those conscious of Allah, (3) who believe in the unseen, establish prayer, and spend out of what We have provided for them, (4) and who believe in what has been revealed to you, (O Muhammad), and what was revealed before you, and of the Hereafter they are certain. (5) Those are upon guidance from their Lord, and it is those who are the successful.",
kursi_ms:"Allah, tiada Tuhan (yang berhak disembah) melainkan Dia, Yang Tetap Hidup, Yang Kekal selama-lamanya mentadbirkan (sekalian makhluk-Nya). Yang tidak mengantuk usahkan tidur. Yang memiliki segala yang ada di langit dan yang ada di bumi. Tiada sesiapa yang dapat memberi syafaat (pertolongan) di sisi-Nya melainkan dengan izin-Nya. Yang mengetahui apa yang ada di hadapan mereka dan apa yang ada di belakang mereka, sedang mereka tidak mengetahui sesuatu pun dari (kandungan) ilmu Allah melainkan apa yang Allah kehendaki. Luasnya Kursi Allah meliputi langit dan bumi; dan tiadalah menjadi keberatan kepada Allah menjaga serta memelihara keduanya. Dan Dialah Yang Maha Tinggi (darjat kemuliaan-Nya), lagi Maha Besar (kekuasaan-Nya).",
kursi_en:"Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass nothing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
ikhlas_ms:"(1) Katakanlah (wahai Muhammad): Dialah Allah Yang Maha Esa; (2) Allah Yang menjadi tumpuan sekalian makhluk untuk memohon sebarang hajat; (3) Ia tiada beranak, dan Ia pula tidak diperanakkan; (4) Dan tidak ada sesiapapun yang serupa dengan-Nya.",
ikhlas_en:"(1) Say, He is Allah, (who is) One. (2) Allah, the Eternal Refuge. (3) He neither begets nor is born, (4) nor is there to Him any equivalent.",
falaq_ms:"(1) Katakanlah (wahai Muhammad): Aku berlindung kepada (Allah) Tuhan yang menciptakan cahaya subuh, (2) Dari bencana makhluk-makhluk yang Ia ciptakan; (3) Dan dari bahaya gelap apabila ia masuk; (4) Dan dari kejahatan makhluk-makhluk yang menghembus pada simpulan-simpulan (dan ikatan-ikatan); (5) Dan dari kejahatan orang yang dengki apabila ia melakukan dengkinya.",
falaq_en:"(1) Say, I seek refuge in the Lord of daybreak (2) from the evil of that which He created, (3) and from the evil of darkness when it settles, (4) and from the evil of the blowers in knots, (5) and from the evil of an envier when he envies.",
nas_ms:"(1) Katakanlah (wahai Muhammad): Aku berlindung kepada (Allah) Pemulihara sekalian manusia. (2) Yang Menguasai sekalian manusia, (3) Tuhan yang berhak disembah oleh sekalian manusia, (4) Dari kejahatan pembisik penghasut yang timbul tenggelam, (5) Yang melemparkan bisikan dan hasutannya ke dalam hati manusia, (6) (Iaitu pembisik dan penghasut) dari kalangan jin dan manusia.",
nas_en:"(1) Say, I seek refuge in the Lord of mankind, (2) the Sovereign of mankind, (3) the God of mankind, (4) from the evil of the retreating whisperer (5) who whispers into the breasts of mankind, (6) from among the jinn and mankind."
};
(function(){
  function setQ(it,k){ it.ms=MEAN[k+"_ms"]; it.en=MEAN[k+"_en"]; }
  var P=POST_PRAYER;
  P[2].ms="Tiada Tuhan melainkan Allah, Yang Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala puji, dan Dia Maha Berkuasa atas segala sesuatu. Ya Allah, tiada yang dapat menghalang apa yang Engkau berikan, dan tiada yang dapat memberi apa yang Engkau tahan, dan tidak bermanfaat kekayaan dan kemuliaan pemiliknya (untuk menyelamatkannya) daripada-Mu.";
  P[2].en="None has the right to be worshipped except Allah, alone, without partner. To Him belongs the dominion and to Him belongs all praise, and He has power over all things. O Allah, none can withhold what You give, and none can give what You withhold, and the wealth of the wealthy cannot avail him against You.";
  setQ(P[3],"kursi"); setQ(P[4],"ikhlas"); setQ(P[5],"falaq"); setQ(P[6],"nas");
  P[9].ms="Tiada Tuhan melainkan Allah, Yang Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala puji. Dia menghidupkan dan mematikan, dan Dia Maha Berkuasa atas segala sesuatu.";
  P[9].en="None has the right to be worshipped except Allah, alone, without partner. To Him belongs the dominion and to Him belongs all praise. He gives life and causes death, and He has power over all things.";
  var M=MATHURAT;
  M[0].ms=MEAN.taawwuz_ms+MEAN.fatihah_ms; M[0].en=MEAN.taawwuz_en+MEAN.fatihah_en;
  setQ(M[1],"baqarah"); setQ(M[2],"kursi"); setQ(M[5],"ikhlas"); setQ(M[6],"falaq"); setQ(M[7],"nas");
  M[8].ms="Kami berada di waktu pagi dan kerajaan (seluruh alam) pada waktu pagi ini milik Allah. Segala puji bagi Allah; tiada sekutu bagi-Nya, tiada Tuhan melainkan Dia, dan kepada-Nya jualah kebangkitan.";
  M[8].ev_ms="Kami berada di waktu petang dan kerajaan (seluruh alam) pada waktu petang ini milik Allah. Segala puji bagi Allah; tiada sekutu bagi-Nya, tiada Tuhan melainkan Dia, dan kepada-Nya jualah tempat kembali.";
  M[8].en="We have entered the morning and the whole dominion belongs to Allah. All praise is for Allah; He has no partner; there is no deity except Him, and to Him is the resurrection.";
  M[8].ev_en="We have entered the evening and the whole dominion belongs to Allah. All praise is for Allah; He has no partner; there is no deity except Him, and to Him is the final return.";
  M[9].ms="Kami berada di waktu pagi di atas fitrah Islam, di atas kalimah ikhlas (syahadah), di atas agama Nabi kami Muhammad ﷺ, dan di atas millah bapa kami Ibrahim yang lurus lagi berserah diri (Muslim), dan dia bukanlah daripada golongan orang-orang musyrik.";
  M[9].ev_ms=M[9].ms.replace("waktu pagi","waktu petang");
  M[9].en="We have entered the morning upon the natural way of Islam, upon the word of sincere devotion (the shahadah), upon the religion of our Prophet Muhammad ﷺ, and upon the way of our father Ibrahim, who was upright and a Muslim, and he was not of those who associate partners with Allah.";
  M[9].ev_en=M[9].en.replace("the morning","the evening");
  M[10].ms="Ya Allah, apa sahaja nikmat yang ada padaku atau pada sesiapa pun daripada makhluk-Mu pada waktu pagi ini, maka ia adalah daripada-Mu semata-mata, tiada sekutu bagi-Mu. Maka bagi-Mu segala puji dan bagi-Mu segala syukur.";
  M[10].ev_ms=M[10].ms.replace("waktu pagi","waktu petang");
  M[10].en="O Allah, whatever blessing I or any of Your creation have received this morning is from You alone, without partner. So to You is all praise and to You is all thanks.";
  M[10].ev_en=M[10].en.replace("this morning","this evening");
  M[11].ms="Ya Allah, sesungguhnya aku berada di waktu pagi dalam nikmat, kesejahteraan dan perlindungan (tutupan aib) daripada-Mu. Maka sempurnakanlah nikmat-Mu, kesejahteraan-Mu dan perlindungan-Mu ke atasku di dunia dan di akhirat.";
  M[11].ev_ms=M[11].ms.replace("waktu pagi","waktu petang");
  M[11].en="O Allah, I have entered the morning in blessing, wellbeing and covering (of my faults) from You. So complete Your blessing, Your wellbeing and Your covering upon me in this world and the Hereafter.";
  M[11].ev_en=M[11].en.replace("the morning","the evening");
  M[19].ms="Ya Allah, Engkaulah Tuhanku, tiada Tuhan melainkan Engkau. Engkau telah menciptakan aku dan aku adalah hamba-Mu. Aku berpegang kepada perjanjian dan janji-Mu sedaya upayaku. Aku berlindung dengan-Mu daripada keburukan apa yang telah aku lakukan. Aku mengakui nikmat-Mu ke atasku dan aku mengakui dosaku, maka ampunilah aku, kerana sesungguhnya tiada yang dapat mengampunkan dosa melainkan Engkau.";
  M[19].en="O Allah, You are my Lord; there is no deity except You. You created me and I am Your servant, and I keep to Your covenant and promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for indeed none forgives sins except You.";
  POST_PRAYER[7].ms="Buka kaunter tasbih"; POST_PRAYER[7].en="Open the tasbih counter";
})();

// ---- 10 more doa categories (0.1.6). VERIFY by ustaz. ----
DOA = DOA.concat([
{cat:"Istighfar & Taubat / Forgiveness & Repentance", items:[
{t_ms:"Istighfar harian",t_en:"Daily istighfar",ar:"أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",ms:"Aku memohon ampun kepada Allah dan aku bertaubat kepada-Nya (Nabi ﷺ membacanya lebih 70 kali sehari)",en:"I seek Allah's forgiveness and repent to Him (the Prophet ﷺ said it more than 70 times a day)",src:"Sahih al-Bukhari 6307"},
{t_ms:"Ampunkan aku dan terimalah taubatku",t_en:"Forgive me and accept my repentance",ar:"رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",ms:"Wahai Tuhanku, ampunilah aku dan terimalah taubatku, sesungguhnya Engkau Maha Penerima taubat lagi Maha Penyayang",en:"My Lord, forgive me and accept my repentance; You are the Accepter of repentance, the Merciful",src:"Sunan Abi Dawud 1516"},
{t_ms:"Doa Nabi Adam a.s.",t_en:"The supplication of Adam",ar:"رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",ms:"Wahai Tuhan kami, kami telah menganiaya diri kami sendiri; jika Engkau tidak mengampunkan kami dan memberi rahmat kepada kami, nescaya kami termasuk orang-orang yang rugi",en:"Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy on us, we will surely be among the losers",src:"Al-Quran 7:23"},
{t_ms:"Memohon kemaafan (Lailatul Qadar)",t_en:"Asking pardon (Laylatul Qadr)",ar:"اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",ms:"Ya Allah, sesungguhnya Engkau Maha Pemaaf dan suka memaafkan, maka maafkanlah aku",en:"O Allah, You are Most Forgiving and love to forgive, so forgive me",src:"Jami' at-Tirmidhi 3513"}]},
{cat:"Keluarga & Perkahwinan / Family & Marriage", items:[
{t_ms:"Pasangan & zuriat penyejuk mata",t_en:"Spouses and children as a comfort",ar:"رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",ms:"Wahai Tuhan kami, kurniakanlah kepada kami pasangan dan zuriat yang menjadi penyejuk mata, dan jadikanlah kami ikutan bagi orang-orang yang bertakwa",en:"Our Lord, grant us from our spouses and offspring comfort to our eyes, and make us leaders of the righteous",src:"Al-Quran 25:74"},
{t_ms:"Untuk ibu bapa",t_en:"For parents",ar:"رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",ms:"Wahai Tuhanku, kasihanilah mereka berdua sebagaimana mereka telah mendidikku semasa kecil",en:"My Lord, have mercy on them as they brought me up when I was small",src:"Al-Quran 17:24"},
{t_ms:"Memohon zuriat yang baik",t_en:"Asking for righteous children",ar:"رَبِّ هَبْ لِي مِنْ لَدُنْكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ",ms:"Wahai Tuhanku, kurniakanlah kepadaku dari sisi-Mu zuriat yang baik; sesungguhnya Engkau Maha Mendengar doa",en:"My Lord, grant me from Yourself good offspring; indeed You hear all supplication",src:"Al-Quran 3:38"},
{t_ms:"Anak & diri tetap solat",t_en:"Keeping my family steadfast in prayer",ar:"رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ",ms:"Wahai Tuhanku, jadikanlah aku dan zuriatku orang yang tetap mendirikan solat; wahai Tuhan kami, perkenankanlah doaku",en:"My Lord, make me and my descendants establishers of prayer; our Lord, accept my supplication",src:"Al-Quran 14:40"},
{t_ms:"Ucapan kepada pengantin",t_en:"To newlyweds",ar:"بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",ms:"Semoga Allah memberkatimu, melimpahkan keberkatan ke atasmu, dan menghimpunkan kamu berdua dalam kebaikan",en:"May Allah bless you, shower His blessings upon you, and unite you both in goodness",src:"Sunan Abi Dawud 2130, Jami' at-Tirmidhi 1091"}]},
{cat:"Dukacita & Kesulitan / Distress & Hardship", items:[
{t_ms:"Ketika sangat susah (doa al-karb)",t_en:"In great distress",ar:"لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",ms:"Tiada Tuhan melainkan Allah Yang Maha Agung lagi Maha Penyantun; tiada Tuhan melainkan Allah, Tuhan Arasy yang agung; tiada Tuhan melainkan Allah, Tuhan langit, Tuhan bumi dan Tuhan Arasy yang mulia",en:"None has the right to be worshipped but Allah, the Magnificent, the Forbearing; none but Allah, Lord of the mighty Throne; none but Allah, Lord of the heavens, Lord of the earth and Lord of the noble Throne",src:"Sahih al-Bukhari 6346, Sahih Muslim 2730"},
{t_ms:"Dukacita, malas & hutang",t_en:"Worry, laziness and debt",ar:"اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",ms:"Ya Allah, aku berlindung dengan-Mu daripada dukacita dan kesedihan, lemah dan malas, bakhil dan pengecut, beban hutang dan dikuasai manusia",en:"O Allah, I seek refuge in You from worry and grief, weakness and laziness, miserliness and cowardice, the burden of debt and being overpowered by men",src:"Sahih al-Bukhari 6369"},
{t_ms:"Cukuplah Allah bagiku",t_en:"Allah is sufficient for us",ar:"حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",ms:"Cukuplah Allah bagi kami, dan Dialah sebaik-baik Pelindung",en:"Allah is sufficient for us, and He is the best Disposer of affairs",src:"Al-Quran 3:173; Sahih al-Bukhari 4563"},
{t_ms:"Memohon kemudahan",t_en:"Asking for ease",ar:"اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",ms:"Ya Allah, tiada yang mudah melainkan apa yang Engkau jadikan mudah, dan Engkau menjadikan yang sukar itu mudah jika Engkau kehendaki",en:"O Allah, nothing is easy except what You make easy, and You make the difficult easy if You will",src:"Sahih Ibn Hibban 974"},
{t_ms:"Doa Nabi Yunus a.s.",t_en:"The supplication of Yunus",ar:"لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",ms:"Tiada Tuhan melainkan Engkau, Maha Suci Engkau, sesungguhnya aku termasuk orang yang zalim",en:"There is no deity but You, glory be to You; indeed I have been of the wrongdoers",src:"Al-Quran 21:87; Jami' at-Tirmidhi 3505"}]},
{cat:"Kesihatan & Ruqyah / Health & Healing", items:[
{t_ms:"Doa menyembuhkan orang sakit",t_en:"For healing the sick",ar:"اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا",ms:"Ya Allah, Tuhan manusia, hilangkanlah penyakit; sembuhkanlah, Engkaulah Yang Maha Menyembuhkan; tiada penyembuhan melainkan penyembuhan-Mu, penyembuhan yang tidak meninggalkan sebarang penyakit",en:"O Allah, Lord of mankind, remove the harm and heal; You are the Healer; there is no healing but Yours, a healing that leaves no illness",src:"Sahih al-Bukhari 5743, Sahih Muslim 2191"},
{t_ms:"Letak tangan pada tempat sakit",t_en:"Hand on the place of pain",ar:"بِسْمِ اللَّهِ (٣×) أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (٧×)",ms:"Dengan nama Allah (3 kali). Aku berlindung dengan Allah dan kekuasaan-Nya daripada keburukan yang aku rasa dan yang aku bimbangi (7 kali)",en:"In the name of Allah (3 times). I seek refuge in Allah and His power from the evil of what I feel and fear (7 times)",src:"Sahih Muslim 2202"},
{t_ms:"Ruqyah Jibril",t_en:"The ruqyah of Jibril",ar:"بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ",ms:"Dengan nama Allah aku meruqyahmu, daripada segala yang menyakitimu, daripada kejahatan setiap jiwa atau mata yang dengki; Allah menyembuhkanmu; dengan nama Allah aku meruqyahmu",en:"In the name of Allah I perform ruqyah for you, from everything that harms you, from the evil of every soul or envious eye; may Allah heal you; in the name of Allah I perform ruqyah for you",src:"Sahih Muslim 2186"},
{t_ms:"Al-Mu'awwidzat ketika sakit",t_en:"The protective surahs when ill",ar:"قُلْ هُوَ اللَّهُ أَحَدٌ • قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ • قُلْ أَعُوذُ بِرَبِّ النَّاسِ",ms:"Baca Al-Ikhlas, Al-Falaq dan An-Nas, hembus pada kedua tapak tangan, kemudian sapu ke seluruh badan (seperti amalan Nabi ﷺ ketika sakit)",en:"Recite Al-Ikhlas, Al-Falaq and An-Nas, blow into the palms and wipe over the body (as the Prophet ﷺ did when ill)",src:"Sahih al-Bukhari 5016"}]},
{cat:"Rezeki & Kerja / Provision & Work", items:[
{t_ms:"Rezeki halal & cukup",t_en:"Sufficient halal provision",ar:"اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",ms:"Ya Allah, cukupkanlah aku dengan yang halal daripada yang haram, dan kayakanlah aku dengan kurniaan-Mu daripada bergantung kepada selain-Mu",en:"O Allah, suffice me with what You have made lawful instead of what You have forbidden, and make me independent by Your bounty of all besides You",src:"Jami' at-Tirmidhi 3563"},
{t_ms:"Kebaikan dunia & akhirat",t_en:"Good in this world and the next",ar:"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",ms:"Wahai Tuhan kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami daripada azab neraka",en:"Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire",src:"Al-Quran 2:201; Sahih al-Bukhari 6389"},
{t_ms:"Doa Nabi Musa a.s. (memohon rezeki)",t_en:"The supplication of Musa (for provision)",ar:"رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",ms:"Wahai Tuhanku, sesungguhnya aku sangat memerlukan apa jua kebaikan yang Engkau turunkan kepadaku",en:"My Lord, I am truly in need of whatever good You send down to me",src:"Al-Quran 28:24"},
{t_ms:"Ilmu, rezeki & amal",t_en:"Knowledge, provision and deeds",ar:"اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",ms:"Ya Allah, aku memohon ilmu yang bermanfaat, rezeki yang baik dan amalan yang diterima",en:"O Allah, I ask You for beneficial knowledge, good provision and accepted deeds",src:"Sunan Ibn Majah 925"}]},
{cat:"Ilmu & Hidayah / Knowledge & Guidance", items:[
{t_ms:"Tambahkan ilmu",t_en:"Increase my knowledge",ar:"رَبِّ زِدْنِي عِلْمًا",ms:"Wahai Tuhanku, tambahkanlah ilmuku",en:"My Lord, increase me in knowledge",src:"Al-Quran 20:114"},
{t_ms:"Lapangkan dada (Nabi Musa a.s.)",t_en:"Expand my chest (Musa)",ar:"رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي",ms:"Wahai Tuhanku, lapangkanlah dadaku, mudahkanlah urusanku, dan lepaskanlah kekakuan lidahku supaya mereka memahami perkataanku",en:"My Lord, expand my chest, ease my task, and untie the knot from my tongue so they may understand my speech",src:"Al-Quran 20:25-28"},
{t_ms:"Tetapkan hati atas agama",t_en:"Keep my heart firm on Your religion",ar:"يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَىٰ دِينِكَ",ms:"Wahai Yang membolak-balikkan hati, tetapkanlah hatiku di atas agama-Mu",en:"O Turner of hearts, keep my heart firm upon Your religion",src:"Jami' at-Tirmidhi 2140"},
{t_ms:"Jangan pesongkan hati kami",t_en:"Do not let our hearts deviate",ar:"رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ",ms:"Wahai Tuhan kami, janganlah Engkau pesongkan hati kami setelah Engkau memberi petunjuk kepada kami, dan kurniakanlah kepada kami rahmat dari sisi-Mu; sesungguhnya Engkau Maha Pemberi",en:"Our Lord, let not our hearts deviate after You have guided us, and grant us mercy from Yourself; You are the Bestower",src:"Al-Quran 3:8"},
{t_ms:"Petunjuk, takwa, kesucian & kecukupan",t_en:"Guidance, piety, chastity and sufficiency",ar:"اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَىٰ وَالتُّقَىٰ وَالْعَفَافَ وَالْغِنَىٰ",ms:"Ya Allah, aku memohon kepada-Mu petunjuk, takwa, kesucian diri dan kecukupan",en:"O Allah, I ask You for guidance, piety, chastity and self-sufficiency",src:"Sahih Muslim 2721"}]},
{cat:"Sakit & Jenazah / Sickness & Death", items:[
{t_ms:"Menziarahi orang sakit",t_en:"Visiting the sick",ar:"لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ",ms:"Tidak mengapa, (sakit ini) penyuci (dosa) insya-Allah",en:"No harm; it is a purification, if Allah wills",src:"Sahih al-Bukhari 3616"},
{t_ms:"Doa untuk pesakit (7 kali)",t_en:"For the sick person (7 times)",ar:"أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ",ms:"Aku memohon kepada Allah Yang Maha Agung, Tuhan Arasy yang agung, agar Dia menyembuhkanmu",en:"I ask Allah the Magnificent, Lord of the magnificent Throne, to heal you",src:"Sunan Abi Dawud 3106, Jami' at-Tirmidhi 2083"},
{t_ms:"Ditimpa musibah",t_en:"When struck by calamity",ar:"إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",ms:"Sesungguhnya kami milik Allah dan kepada-Nya kami kembali. Ya Allah, berilah pahala atas musibahku dan gantikanlah untukku yang lebih baik daripadanya",en:"Indeed we belong to Allah and to Him we return. O Allah, reward me in my calamity and replace it for me with something better",src:"Sahih Muslim 918"},
{t_ms:"Doa untuk si mati",t_en:"For the deceased",ar:"اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ وَاعْفُ عَنْهُ",ms:"Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia dan maafkanlah dia (tukar لَهُ kepada لَهَا bagi perempuan)",en:"O Allah, forgive him, have mercy on him, keep him safe and pardon him (use لَهَا for a woman)",src:"Sahih Muslim 963"},
{t_ms:"Takziah kepada keluarga",t_en:"Condolence to the family",ar:"إِنَّ لِلَّهِ مَا أَخَذَ، وَلَهُ مَا أَعْطَىٰ، وَكُلُّ شَيْءٍ عِنْدَهُ بِأَجَلٍ مُسَمًّى، فَلْتَصْبِرْ وَلْتَحْتَسِبْ",ms:"Sesungguhnya milik Allah apa yang Dia ambil dan milik-Nya apa yang Dia beri, dan segala sesuatu di sisi-Nya ada tempoh yang ditetapkan; maka bersabarlah dan haraplah pahala",en:"To Allah belongs what He took and what He gave, and everything with Him has an appointed term; so be patient and hope for reward",src:"Sahih al-Bukhari 1284"},
{t_ms:"Menziarahi kubur",t_en:"Visiting graves",ar:"السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَلَاحِقُونَ، أَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ",ms:"Salam sejahtera ke atas kamu wahai penghuni kubur daripada kalangan mukmin dan muslim; kami insya-Allah akan menyusul kamu; aku memohon kepada Allah kesejahteraan untuk kami dan kamu",en:"Peace be upon you, O dwellers of these abodes among the believers and Muslims; we will, if Allah wills, join you; I ask Allah for wellbeing for us and for you",src:"Sahih Muslim 975"}]},
{cat:"Perlindungan / Protection", items:[
{t_ms:"Singgah di sesuatu tempat",t_en:"When stopping at a place",ar:"أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",ms:"Aku berlindung dengan kalimah-kalimah Allah yang sempurna daripada kejahatan makhluk-Nya",en:"I seek refuge in the perfect words of Allah from the evil of what He has created",src:"Sahih Muslim 2708"},
{t_ms:"Perlindungan untuk anak-anak",t_en:"Protection for children",ar:"أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",ms:"Aku memohon perlindungan untuk kamu berdua dengan kalimah-kalimah Allah yang sempurna daripada setiap syaitan dan binatang berbisa, serta daripada setiap mata yang jahat (tukar ـكُمَا kepada ـكَ untuk seorang)",en:"I seek protection for you both in the perfect words of Allah from every devil and poisonous creature, and from every harmful eye (use ـكَ for one child)",src:"Sahih al-Bukhari 3371"},
{t_ms:"Tiada mudarat dengan nama-Nya",t_en:"Nothing harms with His name",ar:"بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",ms:"Dengan nama Allah yang bersama nama-Nya tiada sesuatu pun di bumi dan di langit dapat memudaratkan; Dia Maha Mendengar lagi Maha Mengetahui (3 kali pagi & petang)",en:"In the name of Allah, with whose name nothing on earth or in heaven can harm; He is the All-Hearing, the All-Knowing (3 times morning and evening)",src:"Sunan Abi Dawud 5088, Jami' at-Tirmidhi 3388"},
{t_ms:"Ketika takut akan musuh",t_en:"When fearing an enemy",ar:"اللَّهُمَّ إِنَّا نَجْعَلُكَ فِي نُحُورِهِمْ وَنَعُوذُ بِكَ مِنْ شُرُورِهِمْ",ms:"Ya Allah, kami jadikan Engkau di hadapan mereka (untuk menghadapi mereka) dan kami berlindung dengan-Mu daripada kejahatan mereka",en:"O Allah, we place You before them and seek refuge in You from their evil",src:"Sunan Abi Dawud 1537"}]},
{cat:"Akhirat / The Hereafter", items:[
{t_ms:"Sebelum salam (empat perlindungan)",t_en:"Before salam (four refuges)",ar:"اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ، وَمِنْ عَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",ms:"Ya Allah, aku berlindung dengan-Mu daripada azab Jahannam, azab kubur, fitnah kehidupan dan kematian, serta kejahatan fitnah Al-Masih Ad-Dajjal",en:"O Allah, I seek refuge in You from the punishment of Hell, the punishment of the grave, the trials of life and death, and the evil of the trial of the False Messiah",src:"Sahih Muslim 588"},
{t_ms:"Memohon syurga",t_en:"Asking for Paradise",ar:"اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ",ms:"Ya Allah, aku memohon syurga kepada-Mu dan aku berlindung dengan-Mu daripada neraka",en:"O Allah, I ask You for Paradise and seek refuge in You from the Fire",src:"Sunan Abi Dawud 792"},
{t_ms:"Selamatkan dari neraka (7 kali)",t_en:"Save me from the Fire (7 times)",ar:"اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ",ms:"Ya Allah, selamatkanlah aku daripada neraka (selepas Subuh dan Maghrib)",en:"O Allah, save me from the Fire (after Subuh and Maghrib)",src:"Sunan Abi Dawud 5079 [weak]"},
{t_ms:"Wafat sebagai Muslim",t_en:"To die as a Muslim",ar:"تَوَفَّنِي مُسْلِمًا وَأَلْحِقْنِي بِالصَّالِحِينَ",ms:"Wafatkanlah aku dalam keadaan Islam dan hubungkanlah aku dengan orang-orang yang soleh",en:"Cause me to die a Muslim and join me with the righteous",src:"Al-Quran 12:101"}]},
{cat:"Syukur & Pujian / Gratitude & Praise", items:[
{t_ms:"Mendapat berita gembira",t_en:"On good news",ar:"الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",ms:"Segala puji bagi Allah yang dengan nikmat-Nya sempurnalah segala kebaikan",en:"Praise be to Allah, by whose favour good things are completed",src:"Sunan Ibn Majah 3803"},
{t_ms:"Menghadapi perkara tidak disukai",t_en:"On something disliked",ar:"الْحَمْدُ لِلَّهِ عَلَىٰ كُلِّ حَالٍ",ms:"Segala puji bagi Allah dalam setiap keadaan",en:"Praise be to Allah in every circumstance",src:"Sunan Ibn Majah 3803"},
{t_ms:"Doa Nabi Sulaiman a.s. (syukur)",t_en:"The supplication of Sulaiman (gratitude)",ar:"رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ",ms:"Wahai Tuhanku, ilhamkanlah aku untuk mensyukuri nikmat-Mu yang Engkau kurniakan kepadaku dan kepada ibu bapaku, dan untuk mengerjakan amal soleh yang Engkau redai",en:"My Lord, enable me to be grateful for Your favour which You have bestowed upon me and my parents, and to do righteousness that pleases You",src:"Al-Quran 27:19"},
{t_ms:"Dua kalimah yang berat di timbangan",t_en:"Two words heavy on the scale",ar:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",ms:"Maha Suci Allah dan segala puji bagi-Nya, Maha Suci Allah Yang Maha Agung",en:"Glory and praise be to Allah; glory be to Allah the Magnificent",src:"Sahih al-Bukhari 6406"}]}
]);
