/* My Ihsan 0.18.0: Tajwid lessons (Ilmu › Tajwid) and "Asas Membaca" 6 reading levels in the style of Iqra' (Ilmu › Bahasa).
   Examples and quizzes use real ayat from the app's tajwid-coloured Quran data (quran/qs), so every highlighted example is a
   genuine instance of the rule. Explanations follow the common Malaysian syllabus and await an ustaz review.
   Storage: localStorage ihsan_tajwid {done:{id:1}, best:{id:n}}, ihsan_iqra {p:{"L-P":1}, last:"L-P"}. */
(function(){
"use strict";
var H=null, box=null, kind="", st={l:null, mode:"learn", q:null}, iq={lv:0, pg:0};
function L(a,b){ return H.L2x(a,b); }
function E(s){ return H.esc(s); }
function load(k,d){ return H.load(k,d); }
function save(k,v){ H.save(k,v); }
function QV(){ QuranView.ensure(H); return QuranView; }

// =============== TAJWID ===============
// [id, icon, [ms,en] title, rules to find examples (tajwid classes), letters, [ms,en] body]
var TJ=[
["intro","📘",["Pengenalan tajwid","What tajwid is"],[],"",
 ["Tajwid bermaksud memperelokkan bacaan: menyebut setiap huruf dari makhrajnya dengan sifat yang betul, serta menjaga hukum dengung, panjang pendek dan berhenti.\n• Mempelajari ilmu tajwid: fardu kifayah.\n• Membaca al-Quran dengan bertajwid: wajib bagi setiap pembaca (fardu ain), kerana Allah berfirman: \"Dan bacalah al-Quran dengan tartil\" (Al-Muzzammil 73:4).\n• Lahn jali (kesalahan nyata): menukar huruf atau baris sehingga makna boleh berubah. Haram.\n• Lahn khafi (kesalahan tersembunyi): tidak sempurna dengung, panjang atau sifat huruf. Makruh, dan perlu diperbaiki.\n• Ukuran panjang: 1 harakat lebih kurang satu ketukan jari dengan kadar sederhana.\nWarna dalam aplikasi: setiap hukum ada warnanya sendiri dalam paparan Al-Quran. Belajar satu demi satu di bawah.",
  "Tajwid means reading beautifully: saying each letter from its point of articulation with its right qualities, and keeping the rules of nasal sound, length and stopping.\n• Learning the science of tajwid: a communal duty (fardu kifayah).\n• Reciting with tajwid: required of every reciter (fardu ain), as Allah says: \"And recite the Quran with measured recitation\" (Al-Muzzammil 73:4).\n• Lahn jali (clear mistake): changing a letter or vowel so the meaning can change. Forbidden.\n• Lahn khafi (hidden mistake): imperfect nasal sound, length or letter quality. Disliked, and should be corrected.\n• Measure of length: 1 harakah is about one finger tap at a moderate pace.\nColours in the app: each rule has its own colour in the Quran view. Learn them one by one below."]],
["makhraj","👄",["Makhraj huruf","Where letters come from"],[],"",
 ["Makhraj ialah tempat keluar huruf. Ada 5 kawasan utama (17 makhraj terperinci):\n1. Al-Jauf (rongga mulut dan tekak): huruf mad ا و ي ketika menjadi mad.\n2. Al-Halq (tekak): ء ه dari pangkal tekak; ع ح dari tengah tekak; غ خ dari hujung tekak (dekat mulut).\n3. Al-Lisan (lidah): ق ك (pangkal lidah); ج ش ي (tengah lidah); ض (tepi lidah); ل ن ر (hujung lidah); ط د ت (hujung lidah dengan pangkal gigi atas); ظ ذ ث (hujung lidah dengan hujung gigi atas); ص س ز (hujung lidah, bunyi desir).\n4. Asy-Syafatain (dua bibir): ف (bibir bawah dengan gigi atas); و ب م (dua bibir).\n5. Al-Khaisyum (pangkal hidung): tempat bunyi dengung (ghunnah) bagi ن dan م.\nCara menguji: sebut huruf itu berbaris mati selepas hamzah berbaris atas, cth. أَبْ أَتْ أَثْ. Di mana bunyi berhenti, itulah makhrajnya.",
  "Makhraj is where a letter comes from. There are 5 main areas (17 detailed points):\n1. Al-Jawf (the space of mouth and throat): the madd letters ا و ي when they lengthen.\n2. Al-Halq (throat): ء ه from the deepest part; ع ح from the middle; غ خ from the top, near the mouth.\n3. Al-Lisan (tongue): ق ك (back of the tongue); ج ش ي (middle); ض (side of the tongue); ل ن ر (tip); ط د ت (tip on the gum of the upper teeth); ظ ذ ث (tip on the edge of the upper teeth); ص س ز (tip, whistling sound).\n4. Ash-Shafatain (the lips): ف (lower lip with the upper teeth); و ب م (both lips).\n5. Al-Khaishum (the nasal passage): where the ghunnah of ن and م comes from.\nHow to test: say the letter with a sukun after a hamzah with fathah, e.g. أَبْ أَتْ أَثْ. Where the sound stops is its makhraj."]],
["sifat","🔤",["Sifat huruf: tebal dan nipis","Letter qualities: heavy and light"],["tafkhim"],"خ ص ض غ ط ق ظ",
 ["Huruf isti'la' (sentiasa dibaca tebal/tafkhim) ada 7: خُصَّ ضَغْطٍ قِظْ, iaitu خ ص ض غ ط ق ظ. Pangkal lidah terangkat ke lelangit.\nHuruf lain dibaca nipis (tarqiq), kecuali:\n• Ra' (ر): tebal apabila berbaris atas atau hadapan, atau mati selepas huruf berbaris atas/hadapan. Nipis apabila berbaris bawah, atau mati selepas baris bawah (jika bukan sebelum huruf isti'la').\n• Lam pada lafaz Allah: tebal selepas baris atas atau hadapan (قَالَ ٱللَّهُ، رَسُولُ ٱللَّهِ); nipis selepas baris bawah (بِسْمِ ٱللَّهِ).\nAlif mengikut huruf sebelumnya: tebal selepas huruf tebal (قَا), nipis selepas huruf nipis (بَا).",
  "The 7 isti'la' letters are always heavy (tafkhim): خُصَّ ضَغْطٍ قِظْ, that is خ ص ض غ ط ق ظ. The back of the tongue rises to the palate.\nOther letters are light (tarqiq), except:\n• Ra' (ر): heavy with fathah or dammah, or with sukun after a fathah/dammah. Light with kasrah, or with sukun after a kasrah (unless an isti'la' letter follows).\n• The lam of the name Allah: heavy after fathah or dammah (قَالَ ٱللَّهُ، رَسُولُ ٱللَّهِ); light after kasrah (بِسْمِ ٱللَّهِ).\nAlif follows the letter before it: heavy after a heavy letter (قَا), light after a light one (بَا)."]],
["izhar","🔆",["Nun mati & tanwin: Izhar halqi","Nun sakinah & tanwin: Izhar"],[],"ء ه ع ح غ خ",
 ["Apabila nun mati (نْ) atau tanwin (ـًـٍـٌ) bertemu salah satu huruf halqi (tekak): ء ه ع ح غ خ, nun dibaca jelas tanpa dengung.\nContoh: مَنْ آمَنَ، مِنْ عِلْمٍ، عَذَابٌ أَلِيمٌ، مِنْ خَيْرٍ.\nIni hukum pertama daripada empat hukum nun mati dan tanwin: Izhar, Idgham, Iqlab dan Ikhfa'. Izhar tidak berwarna dalam mushaf bertajwid kerana ia dibaca biasa.",
  "When a nun with sukun (نْ) or tanwin meets one of the throat letters ء ه ع ح غ خ, the nun is pronounced clearly with no nasal sound.\nExamples: مَنْ آمَنَ، مِنْ عِلْمٍ، عَذَابٌ أَلِيمٌ، مِنْ خَيْرٍ.\nThis is the first of the four rules of nun sakinah and tanwin: Izhar, Idgham, Iqlab and Ikhfa'. Izhar has no colour in a colour-coded mushaf because it is read normally."]],
["idgham","🔗",["Nun mati & tanwin: Idgham","Nun sakinah & tanwin: Idgham"],["idgham_ghunnah","idgham_wo_ghunnah"],"ي ن م و ل ر",
 ["Idgham bermaksud memasukkan nun mati atau tanwin ke dalam huruf selepasnya.\n• Idgham ma'al ghunnah (dengan dengung): huruf ي ن م و (يَنْمُو). Dengung 2 harakat. Warna hijau.\n• Idgham bila ghunnah (tanpa dengung): huruf ل ر. Nun terus hilang ke dalam ل atau ر. Warna hijau muda.\nIdgham hanya berlaku antara dua kalimah. Jika nun mati bertemu و atau ي dalam satu kalimah, ia dibaca jelas (izhar mutlak): دُنْيَا، بُنْيَانٌ، صِنْوَانٌ، قِنْوَانٌ.",
  "Idgham means merging the nun sakinah or tanwin into the next letter.\n• Idgham with ghunnah: the letters ي ن م و (يَنْمُو). Nasal sound for 2 counts. Green.\n• Idgham without ghunnah: the letters ل ر. The nun disappears into ل or ر. Light green.\nIdgham only happens across two words. If a nun sakinah meets و or ي inside one word, it is read clearly (izhar mutlaq): دُنْيَا، بُنْيَانٌ، صِنْوَانٌ، قِنْوَانٌ."]],
["iqlab","🔄",["Nun mati & tanwin: Iqlab","Nun sakinah & tanwin: Iqlab"],["iqlab"],"ب",
 ["Apabila nun mati atau tanwin bertemu huruf ب, bunyi nun ditukar kepada mim (م) dengan dengung 2 harakat. Bibir dirapatkan lembut.\nDalam mushaf biasanya ada mim kecil (ۢ) di atas nun atau tanwin sebagai tanda.\nContoh: مِنۢ بَعْدِ، سَمِيعٌۢ بَصِيرٌ، أَنۢبِئْهُم.",
  "When a nun sakinah or tanwin meets ب, the nun turns into a mim (م) sound with a 2-count ghunnah. The lips close gently.\nMost mushafs mark it with a small mim (ۢ) over the nun or tanwin.\nExamples: مِنۢ بَعْدِ، سَمِيعٌۢ بَصِيرٌ، أَنۢبِئْهُم."]],
["ikhfa","🌫",["Nun mati & tanwin: Ikhfa' hakiki","Nun sakinah & tanwin: Ikhfa'"],["ikhafa"],"ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك",
 ["Apabila nun mati atau tanwin bertemu salah satu daripada 15 huruf ini: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك, nun disamarkan (antara jelas dan idgham) dengan dengung 2 harakat. Lidah tidak menyentuh makhraj nun; ia bersedia untuk huruf seterusnya.\nIkhfa' boleh berlaku dalam satu kalimah (أَنتُمْ، مُنذِرٌ) atau dua kalimah (مِن شَرِّ).",
  "When a nun sakinah or tanwin meets one of these 15 letters: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك, the nun is hidden (between clear and merged) with a 2-count ghunnah. The tongue does not touch the nun's point; it gets ready for the next letter.\nIkhfa' can happen inside one word (أَنتُمْ، مُنذِرٌ) or across two words (مِن شَرِّ)."]],
["mim","👄",["Mim mati","Mim sakinah"],["ikhafa_shafawi","idgham_shafawi"],"ب م",
 ["Mim mati (مْ) ada tiga hukum:\n1. Ikhfa' syafawi: bertemu ب. Bibir dirapatkan lembut dengan dengung 2 harakat. Cth: تَرْمِيهِم بِحِجَارَةٍ.\n2. Idgham mithlain (mutamathilain saghir): bertemu م. Mim pertama masuk ke mim kedua dengan dengung 2 harakat. Cth: لَهُم مَّا.\n3. Izhar syafawi: bertemu huruf selain ب dan م. Mim dibaca jelas tanpa dengung, lebih-lebih lagi sebelum و dan ف. Cth: عَلَيْهِمْ وَلَا، هُمْ فِيهَا.",
  "Mim with sukun (مْ) has three rules:\n1. Ikhfa' shafawi: before ب. The lips close gently with a 2-count ghunnah. E.g. تَرْمِيهِم بِحِجَارَةٍ.\n2. Idgham mithlain: before م. The first mim merges into the second with a 2-count ghunnah. E.g. لَهُم مَّا.\n3. Izhar shafawi: before any other letter. The mim is clear with no ghunnah, especially before و and ف. E.g. عَلَيْهِمْ وَلَا، هُمْ فِيهَا."]],
["ghunnah","👃",["Nun dan mim bersyaddah","Nun and mim with shaddah"],["ghunnah"],"نّ مّ",
 ["Setiap nun dan mim yang bersyaddah (نّ مّ) wajib didengungkan 2 harakat. Ini dipanggil ghunnah musyaddadah.\nContoh: إِنَّ، ثُمَّ، ٱلنَّاسِ، مِمَّا.",
  "Every nun and mim with a shaddah (نّ مّ) must carry a 2-count ghunnah. This is called ghunnah mushaddadah.\nExamples: إِنَّ، ثُمَّ، ٱلنَّاسِ، مِمَّا."]],
["alif_lam","☀️",["Alif lam: qamariah dan syamsiah","Alif lam: moon and sun letters"],["laam_shamsiyah"],"ت ث د ذ ر ز س ش ص ض ط ظ ل ن",
 ["Alif lam ta'rif (ال) ada dua hukum:\n• Qamariah (lam dibaca jelas): sebelum 14 huruf ابغ حجك وخف عقيمه, iaitu ا ب غ ح ج ك و خ ف ع ق ي م ه. Cth: ٱلْقَمَرُ، ٱلْحَمْدُ.\n• Syamsiah (lam tidak dibaca, huruf selepasnya bersyaddah): sebelum 14 huruf lain: ت ث د ذ ر ز س ش ص ض ط ظ ل ن. Cth: ٱلشَّمْسُ، ٱلرَّحْمَٰنِ.\nDalam mushaf bertajwid, lam syamsiah berwarna kelabu kerana tidak dibaca.",
  "The definite article (ال) has two rules:\n• Qamariyyah (lam pronounced): before the 14 letters ابغ حجك وخف عقيمه: ا ب غ ح ج ك و خ ف ع ق ي م ه. E.g. ٱلْقَمَرُ، ٱلْحَمْدُ.\n• Shamsiyyah (lam silent, the next letter doubled): before the other 14: ت ث د ذ ر ز س ش ص ض ط ظ ل ن. E.g. ٱلشَّمْسُ، ٱلرَّحْمَٰنِ.\nIn a colour-coded mushaf the silent lam is grey."]],
["qalqalah","💥",["Qalqalah","Qalqalah"],["qalaqah"],"ق ط ب ج د",
 ["Qalqalah ialah bunyi melantun apabila huruf قُطْبُ جَدٍّ (ق ط ب ج د) berbaris mati.\n• Qalqalah sughra (kecil): huruf mati di tengah kalimah. Cth: يَقْطَعُونَ، يَجْعَلُ.\n• Qalqalah kubra (besar): huruf itu di hujung dan kita berhenti padanya. Lantunan lebih kuat. Cth: ٱلْفَلَقِ، أَحَدٌ (ketika waqaf).\nJangan menambah baris: lantunan bukan bunyi \"e\" atau \"a\".",
  "Qalqalah is the echoing sound when one of the letters قُطْبُ جَدٍّ (ق ط ب ج د) has a sukun.\n• Minor qalqalah: the letter is still in the middle of a word. E.g. يَقْطَعُونَ، يَجْعَلُ.\n• Major qalqalah: the letter is at the end and you stop on it. The echo is stronger. E.g. ٱلْفَلَقِ، أَحَدٌ (when stopping).\nDo not add a vowel: the echo is not an \"e\" or \"a\" sound."]],
["mad_asli","➖",["Mad asli (tabi'i)","Natural madd"],["madda_normal"],"ا و ي",
 ["Mad asli dibaca 2 harakat. Ia berlaku apabila:\n• alif (ا) selepas huruf berbaris atas: قَالَ\n• wau mati (و) selepas huruf berbaris hadapan: يَقُولُ\n• ya mati (ي) selepas huruf berbaris bawah: قِيلَ\nTermasuk juga alif kecil (ٰ) seperti ٱلرَّحْمَٰنِ dan mad silah sughra: ha dhamir (ـهُۥ / ـهِۦ) di antara dua huruf berbaris dibaca 2 harakat.",
  "Natural madd is 2 counts. It happens when:\n• alif (ا) follows a letter with fathah: قَالَ\n• a silent waw (و) follows a letter with dammah: يَقُولُ\n• a silent ya (ي) follows a letter with kasrah: قِيلَ\nThis includes the dagger alif (ٰ) as in ٱلرَّحْمَٰنِ, and minor silah: the pronoun ha (ـهُۥ / ـهِۦ) between two voweled letters is lengthened 2 counts."]],
["mad_fari","〰️",["Mad far'i (mad cabang)","Secondary madd"],["madda_obligatory","madda_permissible","madda_necessary"],"",
 ["Mad far'i berlaku apabila mad asli bertemu hamzah atau sukun:\n• Mad wajib muttasil: hamzah selepas huruf mad dalam satu kalimah. 4 atau 5 harakat. Cth: جَآءَ، ٱلسَّمَآءِ. Biru tua.\n• Mad jaiz munfasil: huruf mad di hujung kalimah, hamzah di awal kalimah seterusnya. 2, 4 atau 5 harakat. Cth: إِنَّآ أَعْطَيْنَٰكَ. Biru.\n• Mad 'arid lissukun: berhenti pada huruf selepas huruf mad. 2, 4 atau 6 harakat. Cth: ٱلْعَٰلَمِينَ، نَسْتَعِينُ (ketika waqaf).\n• Mad lazim: sukun asli atau syaddah selepas huruf mad. 6 harakat. Cth: ٱلضَّآلِّينَ، الٓمٓ. Ungu.\n• Lain-lain: mad lin (عَلَيْهِمْ، خَوْفٌ ketika waqaf), mad badal (ءَامَنُوا, 2 harakat), mad 'iwad (tanwin baris atas ketika waqaf dibaca alif 2 harakat), mad silah kubra (ha dhamir sebelum hamzah, 4 atau 5 harakat).\nPilih satu kadar dan kekalkan sepanjang bacaan.",
  "Secondary madd happens when a natural madd meets a hamzah or a sukun:\n• Obligatory joined madd: hamzah after the madd letter in the same word. 4 or 5 counts. E.g. جَآءَ، ٱلسَّمَآءِ. Dark blue.\n• Permissible separated madd: the madd letter ends a word and the next word starts with hamzah. 2, 4 or 5 counts. E.g. إِنَّآ أَعْطَيْنَٰكَ. Blue.\n• Madd 'arid lis-sukun: stopping on the letter after a madd letter. 2, 4 or 6 counts. E.g. ٱلْعَٰلَمِينَ، نَسْتَعِينُ (when stopping).\n• Necessary madd: a fixed sukun or shaddah after the madd letter. 6 counts. E.g. ٱلضَّآلِّينَ، الٓمٓ. Purple.\n• Others: madd lin (عَلَيْهِمْ، خَوْفٌ when stopping), madd badal (ءَامَنُوا, 2 counts), madd 'iwad (fathah tanwin read as alif, 2 counts, when stopping), major silah (pronoun ha before hamzah, 4 or 5 counts).\nPick one length and keep it the same through your recitation."]],
["idgham2","🧩",["Idgham dua huruf","Merging two letters"],["idgham_mutajanisayn","idgham_mutaqaribayn"],"",
 ["Selain nun dan mim mati, ada idgham antara dua huruf yang bertemu, huruf pertama mati:\n• Mutamathilain: dua huruf sama (ٱضْرِب بِّعَصَاكَ). Huruf pertama dimasukkan ke huruf kedua.\n• Mutajanisain: makhraj sama, sifat berbeza: ت-ط (قَالَت طَّآئِفَةٌ), د-ت (قَد تَّبَيَّنَ), ذ-ظ (إِذ ظَّلَمُوٓا), ث-ذ (يَلْهَث ذَّٰلِكَ), ب-م (ٱرْكَب مَّعَنَا).\n• Mutaqaribain: makhraj dan sifat hampir: ل-ر (قُل رَّبِّ), ق-ك (أَلَمْ نَخْلُقكُّم).\nDalam mushaf, huruf pertama tidak bertanda sukun dan huruf kedua bersyaddah.",
  "Besides nun and mim sakinah, two meeting letters can merge when the first has a sukun:\n• Mutamathilayn: the same letter twice (ٱضْرِب بِّعَصَاكَ). The first merges into the second.\n• Mutajanisayn: same point, different qualities: ت-ط (قَالَت طَّآئِفَةٌ), د-ت (قَد تَّبَيَّنَ), ذ-ظ (إِذ ظَّلَمُوٓا), ث-ذ (يَلْهَث ذَّٰلِكَ), ب-م (ٱرْكَب مَّعَنَا).\n• Mutaqaribayn: close points and qualities: ل-ر (قُل رَّبِّ), ق-ك (أَلَمْ نَخْلُقكُّم).\nIn the mushaf the first letter has no sukun mark and the second has a shaddah."]],
["wasl","🔇",["Hamzah wasl dan huruf tidak dibaca","Connecting hamzah and silent letters"],["ham_wasl","slnt"],"ٱ",
 ["Hamzah wasl (ٱ, alif dengan kepala sad kecil) hanya dibaca apabila memulakan bacaan. Jika bersambung dengan kalimah sebelumnya, ia tidak dibaca.\n• Mula dengan ٱلْ: baca dengan baris atas (أَلْ).\n• Mula dengan kata kerja: jika huruf ketiga berbaris hadapan, baca baris hadapan (ٱنظُرْ → أُنظُرْ); jika tidak, baris bawah (ٱهْدِنَا → إِهْدِنَا).\nAda juga huruf yang ditulis tetapi tidak dibaca, seperti alif selepas wau jamak (قَالُوا) dan alif pada أَنَا ketika bersambung. Semuanya kelabu dalam mushaf bertajwid.",
  "The connecting hamzah (ٱ, alif with a small sad head) is only pronounced when you start reading from it. When joined to the word before, it is silent.\n• Starting with ٱلْ: read it with fathah (أَلْ).\n• Starting with a verb: if the third letter has dammah, start with dammah (ٱنظُرْ → أُنظُرْ); otherwise with kasrah (ٱهْدِنَا → إِهْدِنَا).\nSome letters are written but not read, such as the alif after a plural waw (قَالُوا) and the alif of أَنَا when joined. All are grey in a colour-coded mushaf."]],
["waqaf","✋",["Waqaf dan ibtida'","Stopping and starting"],[],"",
 ["Waqaf ialah berhenti seketika untuk bernafas, kemudian menyambung (ibtida') dari tempat yang sesuai.\nTanda waqaf dalam mushaf:\n• مـ (lazim): mesti berhenti, kerana makna berubah jika bersambung.\n• لا: jangan berhenti di situ.\n• ج (jaiz): boleh berhenti atau sambung.\n• صلى: lebih baik sambung.\n• قلى: lebih baik berhenti.\n• ∴ ∴ (mu'anaqah): berhenti pada salah satu sahaja, bukan kedua-duanya.\nCara berhenti: huruf terakhir dimatikan (sukun). Tanwin baris atas dibaca alif 2 harakat (عَلِيمًا → عَلِيمَا). Ta marbutah (ة) dibaca ha mati (رَحْمَةٌ → رَحْمَهْ).\nJika terpaksa berhenti di tengah ayat kerana nafas, ulang dari kalimah sebelumnya yang sesuai.",
  "Waqf is pausing to breathe, then continuing (ibtida') from a suitable place.\nStop signs in the mushaf:\n• مـ (lazim): you must stop, as joining changes the meaning.\n• لا: do not stop here.\n• ج (ja'iz): stopping and joining are both fine.\n• صلى: joining is better.\n• قلى: stopping is better.\n• ∴ ∴ (mu'anaqah): stop at one of the two, not both.\nHow to stop: the last letter takes a sukun. Fathah tanwin is read as an alif of 2 counts (عَلِيمًا → عَلِيمَا). Ta marbutah (ة) is read as a silent ha (رَحْمَةٌ → رَحْمَهْ).\nIf you run out of breath mid-ayat, restart from a suitable earlier word."]]
];
var EXS=[1,112,113,114,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,2];
function tjState(){ return load("ihsan_tajwid",{done:{}, best:{}}); }
function tajwidHome(){
  var S=tjState(), n=Object.keys(S.done).length;
  var h='<div class="card bcHero"><h3>🎨 '+L("Ilmu Tajwid","Tajwid")+'</h3><div class="small">'+L("Belajar hukum satu demi satu. Contoh diambil terus daripada ayat al-Quran dengan warna tajwid, dan setiap pelajaran ada kuiz kecil.","Learn the rules one by one. Examples come straight from Quran ayat in tajwid colours, and each lesson has a short quiz.")+'</div><div class="bar"><div style="width:'+Math.round(n*100/TJ.length)+'%"></div></div><div class="mut tiny">'+n+'/'+TJ.length+' '+L("pelajaran selesai","lessons done")+'</div></div><div class="qlist">';
  TJ.forEach(function(x,i){ h+='<button class="qsr" data-tl="'+i+'"><span class="qno">'+(S.done[x[0]]?"✅":x[1])+'</span><span class="qsn"><b>'+(i+1)+'. '+E(L(x[2][0],x[2][1]))+'</b><small>'+(x[4]?'<span dir="rtl" class="bcL">'+E(x[4])+'</span>':'')+(S.best[x[0]]!=null?' · '+L("Kuiz ","Quiz ")+S.best[x[0]]+'/5':'')+'</small></span><span class="shGo">›</span></button>'; });
  box.innerHTML=h+'</div><div class="mut tiny" style="padding:8px 2px">'+L("Huraian mengikut silibus tajwid yang lazim di Malaysia (riwayat Hafs 'an 'Asim) dan menunggu semakan ustaz. Belajar bersama guru tetap yang terbaik.","Explanations follow the usual Malaysian tajwid syllabus (Hafs from 'Asim) and await an ustaz review. Learning with a teacher is still best.")+'</div>';
  box.querySelectorAll("[data-tl]").forEach(function(b){ b.onclick=function(){ st.l=+b.getAttribute("data-tl"); st.mode="learn"; tajwidLesson(); top(); }; });
}
function top(){ var v=document.getElementById("view"); if(v) v.scrollTop=0; }
function para(t){ return t.split("\n").map(function(l){ return '<p'+(/^[•\d]/.test(l)?' class="bcli"':'')+'>'+E(l).replace(/([؀-ۿ][؀-ۿً-ٰٟۖ-ۭ\s،]*[؀-ۿً-ٰٟۖ-ۭ])/g,'<span class="bcar" dir="rtl">$1</span>')+'</p>'; }).join(""); }
function findEx(rules, max, cb){
  var out=[], i=0;
  var next=function(){ if(out.length>=max || i>=EXS.length){ cb(out); return; } var s=EXS[i++];
    QV().surah(s, function(d){ for(var a=0;a<d.t.length && out.length<max;a++){ var segs=d.t[a]; if(rules.some(function(r){ return QuranView.has(segs, r); }) && segs.length<40) out.push([s,a+1,segs]); if(out.length && out[out.length-1][0]===s && out.filter(function(x){ return x[0]===s; }).length>=2) break; } next(); }); };
  next();
}
function tajwidLesson(){
  var x=TJ[st.l], S=tjState();
  var h='<div class="qtop"><button class="ib" id="bcBack">‹</button><div class="qtt"><b>'+x[1]+' '+E(L(x[2][0],x[2][1]))+'</b><small>'+L("Pelajaran ","Lesson ")+(st.l+1)+'/'+TJ.length+'</small></div></div>';
  if(x[4]) h+='<div class="card bcLet" dir="rtl">'+x[4].split(" ").map(function(c){ return '<button class="bcLb" data-bsay="'+E(c)+'">'+E(c)+'</button>'; }).join("")+'</div>';
  h+='<div class="card bcBody">'+para(L(x[5][0],x[5][1]))+'</div>';
  if(x[3].length) h+='<div class="snl">'+L("Contoh daripada al-Quran","Examples from the Quran")+'</div><div id="bcEx"><div class="card mut">'+L("Mencari contoh…","Finding examples…")+'</div></div>'+
    '<button class="btn gold full" id="bcQ">🎯 '+L("Kuiz: cari hukum ini","Quiz: spot this rule")+'</button>';
  h+='<div class="row" style="margin:12px 0"><button class="btn alt" id="bcN"'+(st.l>=TJ.length-1?" disabled":"")+'>‹ '+L("Seterusnya","Next")+'</button><button class="btn '+(S.done[x[0]]?"alt":"gold")+'" id="bcD">'+(S.done[x[0]]?"✅ "+L("Selesai","Done"):L("Tanda selesai","Mark done"))+'</button><button class="btn alt" id="bcP"'+(st.l<=0?" disabled":"")+'>'+L("Sebelum","Previous")+' ›</button></div>';
  box.innerHTML=h;
  box.querySelector("#bcBack").onclick=function(){ back(); };
  box.querySelector("#bcN").onclick=function(){ st.l++; tajwidLesson(); top(); };
  box.querySelector("#bcP").onclick=function(){ st.l--; tajwidLesson(); top(); };
  box.querySelector("#bcD").onclick=function(){ var S2=tjState(); S2.done[x[0]]=1; save("ihsan_tajwid",S2); tajwidLesson(); };
  var q=box.querySelector("#bcQ"); if(q) q.onclick=function(){ quizStart(); };
  if(x[3].length) findEx(x[3], 4, function(list){ var el=box&&box.querySelector("#bcEx"); if(!el) return;
    el.innerHTML=list.length?list.map(function(e){ return '<div class="card bcEx"><div class="row"><b class="small">'+E(QuranView.sname(e[0]))+' '+e[0]+':'+e[1]+'</b><button class="ib" data-pk="'+QuranView.idx(e[0],e[1])+'">🔊</button></div><div class="bcAy" dir="rtl" lang="ar">'+QuranView.segHtml(e[2], x[3])+'</div></div>'; }).join(""):'<div class="card mut">'+L("Tiada contoh pendek ditemui.","No short example found.")+'</div>';
    el.querySelectorAll("[data-pk]").forEach(function(b){ b.onclick=function(){ QuranView.play(+b.getAttribute("data-pk"), H); }; }); });
}
// quiz: tap the word that has the rule; 5 rounds
function quizStart(){ var x=TJ[st.l]; findEx(x[3], 12, function(list){ if(!list.length) return; for(var i=list.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=list[i]; list[i]=list[j]; list[j]=t; } st.q={list:list.slice(0,5), i:0, ok:0}; quizDraw(); }); }
function quizDraw(){
  var x=TJ[st.l], Q=st.q; if(Q.i>=Q.list.length){ var S=tjState(); S.best[x[0]]=Math.max(S.best[x[0]]||0, Q.ok); if(Q.ok>=4) S.done[x[0]]=1; save("ihsan_tajwid",S);
    box.innerHTML='<div class="card bcQz" style="text-align:center"><div style="font-size:48px">'+(Q.ok>=4?"🌟":Q.ok>=2?"👍":"💪")+'</div><h3>'+Q.ok+' / '+Q.list.length+'</h3><div class="small">'+(Q.ok>=4?L("Syabas! Pelajaran ditanda selesai.","Well done! Lesson marked done."):L("Ulang kaji pelajaran dan cuba lagi.","Review the lesson and try again."))+'</div><div class="row" style="margin-top:10px;justify-content:center"><button class="btn gold" id="qzR">🔁 '+L("Cuba lagi","Try again")+'</button><button class="btn alt" id="qzB">'+L("Kembali ke pelajaran","Back to the lesson")+'</button></div></div>';
    box.querySelector("#qzR").onclick=quizStart; box.querySelector("#qzB").onclick=function(){ st.q=null; tajwidLesson(); }; return; }
  var e=Q.list[Q.i], words=[], cur="", hit=false, lg=QuranView.meta().tj, bits=x[3].map(function(r){ return 1<<lg.indexOf(r); }).reduce(function(a,b){ return a|b; },0);
  e[2].forEach(function(sg){ var t=typeof sg==="string"?sg:sg[0], b=typeof sg==="string"?0:sg[1]; t.split(" ").forEach(function(p,i){ if(i>0){ if(cur) words.push([cur,hit]); cur=""; hit=false; } cur+=p; if(b & bits) hit=true; }); });
  if(cur) words.push([cur,hit]);
  box.innerHTML='<div class="qtop"><button class="ib" id="bcBack">‹</button><div class="qtt"><b>🎯 '+E(L(x[2][0],x[2][1]))+'</b><small>'+(Q.i+1)+' / '+Q.list.length+' · ✓ '+Q.ok+'</small></div></div>'+
    '<div class="card"><div class="small">'+L("Ketik perkataan yang mengandungi hukum ini.","Tap the word that has this rule.")+'</div><div class="bcAy bcQw" dir="rtl" lang="ar">'+words.map(function(w,i){ return '<button class="bcW" data-w="'+i+'">'+E(w[0])+'</button>'; }).join(" ")+'</div><div class="mut tiny">'+E(QuranView.sname(e[0]))+' '+e[0]+':'+e[1]+'</div><div id="qzF"></div></div>';
  box.querySelector("#bcBack").onclick=function(){ st.q=null; tajwidLesson(); };
  var done=false;
  box.querySelectorAll("[data-w]").forEach(function(b){ b.onclick=function(){ if(done) return; done=true; var w=words[+b.getAttribute("data-w")], any=words.some(function(z){ return z[1]; });
    if(w[1]){ Q.ok++; b.classList.add("ok"); } else b.classList.add("no");
    box.querySelectorAll("[data-w]").forEach(function(c){ if(words[+c.getAttribute("data-w")][1]) c.classList.add("ok"); });
    box.querySelector("#qzF").innerHTML='<div class="'+(w[1]?"bcOk":"bcNo")+'">'+(w[1]?"✓ "+L("Betul!","Correct!"):"✗ "+L("Bukan itu. Yang hijau ialah jawapannya.","Not that one. The green word is the answer."))+'</div><div class="bcAy" dir="rtl">'+QuranView.segHtml(e[2], x[3])+'</div><button class="btn gold full" id="qzN">'+L("Seterusnya","Next")+' ›</button>';
    box.querySelector("#qzN").onclick=function(){ Q.i++; quizDraw(); top(); }; if(!any) Q.ok++; }; });
}

// =============== ASAS MEMBACA (Iqra'-style levels 1-6) ===============
var HJ="ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن و ه ء ي".split(" ");
var FA="َ", KA="ِ", DA="ُ", SU="ْ", SY="ّ", TF="ً", TK="ٍ", TD="ٌ";
var NJ="اأدذرزو"; // letters that do not join to the next
function seed(n){ var x=n*9301+49297; return function(){ x=(x*9301+49297)%233280; return x/233280; }; }
function car(c){ return c==="ا"||c==="ء"?"أ":c; }
function pick(r, arr){ return arr[Math.floor(r()*arr.length)]; }
// [ms title, en title, ms note, en note, pages]
var LV=[
 ["Tahap 1: Huruf berbaris atas","Level 1: Letters with fathah","Sebut setiap huruf dengan baris atas (a). Baca dari kanan ke kiri, satu-satu, jangan dipanjangkan.","Say each letter with fathah (a). Read right to left, one by one, without lengthening.",8],
 ["Tahap 2: Huruf bersambung & mad alif","Level 2: Joined letters & long a","Huruf yang bersambung dibaca sama seperti huruf tunggal. Alif selepas baris atas dibaca panjang 2 harakat (baa).","Joined letters read the same as single ones. An alif after fathah is long, 2 counts (baa).",8],
 ["Tahap 3: Baris bawah, hadapan & mad","Level 3: Kasrah, dammah & long vowels","Baris bawah (i) dan hadapan (u). Ya mati selepas baris bawah dibaca panjang (bii); wau mati selepas baris hadapan dibaca panjang (buu).","Kasrah (i) and dammah (u). A silent ya after kasrah is long (bii); a silent waw after dammah is long (buu).",8],
 ["Tahap 4: Tanwin, sukun & qalqalah","Level 4: Tanwin, sukun & qalqalah","Tanwin berbunyi -an, -in, -un. Huruf bertanda sukun (mati) disambung pada huruf sebelumnya. ق ط ب ج د yang mati dibaca melantun.","Tanwin sounds -an, -in, -un. A letter with sukun joins the letter before it. ق ط ب ج د with sukun bounce (qalqalah).",8],
 ["Tahap 5: Syaddah, alif lam & waqaf","Level 5: Shaddah, the article & stopping","Syaddah menggandakan huruf (rabba). Alif lam qamariah dibaca (al-qa), syamsiah tidak (asy-syam). Ketika berhenti, huruf akhir dimatikan.","Shaddah doubles the letter (rabba). Moon-letter al is read (al-qa), sun-letter al is not (ash-sham). When stopping, the last letter takes sukun.",8],
 ["Tahap 6: Membaca ayat al-Quran","Level 6: Reading Quran ayat","Gabungkan semua yang dipelajari. Baca ayat Juz Amma dengan warna tajwid, kemudian dengar bacaan Syeikh Mishary.","Put it all together. Read Juz Amma ayat in tajwid colours, then listen to Sheikh Mishary.",10]
];
var L6=[1,114,113,112,111,110,109,108,107,103];
function rowsFor(lv, pg){
  var r=seed(lv*100+pg+1), rows=[], known=HJ.slice(0, Math.min(29, 4+pg*4)), fresh=HJ.slice(Math.max(0,(pg)*4), Math.min(29,4+pg*4));
  var J=HJ.filter(function(c){ return c!=="ء" && c!=="ا"; });
  var Jk=J.slice(0, Math.min(J.length, 6+pg*3));
  var syl=function(c,v){ return car(c)+v; };
  var word=function(n, v){ var w=""; for(var i=0;i<n;i++){ var c=i===0&&r()<0.25?"أ":pick(r,Jk); w+=c+(typeof v==="function"?v(i):v); } return w; };
  if(lv===0){
    rows.push(fresh.map(function(c){ return syl(c,FA); }));
    for(var i=0;i<6;i++){ var row=[]; for(var j=0;j<5;j++) row.push(syl(r()<0.5?pick(r,fresh):pick(r,known),FA)); rows.push(row); }
  } else if(lv===1){
    for(var i1=0;i1<7;i1++){ var row1=[]; for(var j1=0;j1<4;j1++){ var w=word(2+Math.floor(r()*2),FA); if(i1>=3 && r()<0.6){ var c=pick(r,Jk); w=car(c)+FA+"ا"+pick(r,Jk)+FA; } row1.push(w); } rows.push(row1); }
  } else if(lv===2){
    var vs=[FA,KA,DA];
    rows.push(Jk.slice(0,5).map(function(c){ return c+KA; })); rows.push(Jk.slice(0,5).map(function(c){ return c+DA; }));
    for(var i2=0;i2<5;i2++){ var row2=[]; for(var j2=0;j2<4;j2++){ var w2=word(3,function(){ return pick(r,vs); }); if(i2>=2 && r()<0.6){ var c2=pick(r,Jk), m=r()<0.5?[KA,"ي"]:[DA,"و"]; w2=pick(r,Jk)+FA+c2+m[0]+m[1]+SU+pick(r,Jk)+pick(r,vs); } row2.push(w2); } rows.push(row2); }
  } else if(lv===3){
    rows.push(Jk.slice(0,4).map(function(c,i){ return c+[TF,TK,TD,TF][i]+(i===0||i===3?"ا":""); }));
    for(var i3=0;i3<6;i3++){ var row3=[]; for(var j3=0;j3<4;j3++){ var t=r(); var w3;
      if(t<0.35){ w3=pick(r,Jk)+FA+pick(r,Jk)+SU+pick(r,Jk)+FA; }
      else if(t<0.6){ w3=pick(r,Jk)+FA+pick(r,"قطبجد".split(""))+SU; }
      else { var tn=pick(r,[TF,TK,TD]); w3=pick(r,Jk)+FA+pick(r,Jk)+KA+pick(r,"بتدرسعلمنكق".split(""))+tn+(tn===TF?"ا":""); }
      row3.push(w3); } rows.push(row3); }
  } else if(lv===4){
    var sun="تثدذرزسشصضطظلن".split(""), moon="بجحخعغفقكمهي".split("");
    for(var i4=0;i4<7;i4++){ var row4=[]; for(var j4=0;j4<3;j4++){ var t4=r(), w4;
      if(t4<0.33){ var c4=pick(r,Jk); w4=pick(r,Jk)+FA+c4+SY+FA+pick(r,Jk)+FA; }
      else if(t4<0.66){ var mo=r()<0.5; var c5=mo?pick(r,moon):pick(r,sun); w4="ٱل"+(mo?SU:"")+c5+(mo?FA:SY+FA)+pick(r,Jk)+FA+pick(r,Jk)+DA; }
      else { w4=pick(r,Jk)+FA+pick(r,Jk)+KA+"ي"+pick(r,Jk)+SU; }
      row4.push(w4); } rows.push(row4); }
  }
  return rows;
}
function iqState(){ return load("ihsan_iqra",{p:{}, last:null}); }
function iqraHome(){
  var S=iqState();
  // 0.5.70 (owner): the Arabic letters (Huruf Hijaiyah) live inside Asas Membaca
  var h=(H.openLetters?'<button class="bnHero bn-huruf" id="iqLet"><span class="bnSc"></span><span class="bnI">🔤</span><span class="shTxt"><b>'+L("Huruf Hijaiyah","Arabic letters")+'</b><small>'+L("28 huruf, bentuk awal/tengah/akhir, sebutan dan latihan","The 28 letters, their start/middle/end shapes, sounds and practice")+'</small></span><span class="shGo">›</span></button>':'')+'<div class="card bcHero"><h3>📗 '+L("Asas Membaca al-Quran","Learn to Read the Quran")+'</h3><div class="small">'+L("Enam tahap, dari huruf pertama hingga membaca ayat, mengikut kaedah berperingkat seperti Iqra'. Ketik suku kata untuk mendengar sebutan (suara telefon). Guru atau ibu bapa menanda ✓ apabila lancar.","Six levels, from the first letters to reading ayat, step by step like Iqra'. Tap a syllable to hear it (phone voice). A teacher or parent ticks ✓ when it is fluent.")+'</div>'+(S.last?'<button class="btn gold full" id="iqC" style="margin-top:8px">▶ '+L("Sambung: Tahap ","Continue: Level ")+S.last.replace("-",", "+L("halaman ","page "))+'</button>':'')+'</div>';
  LV.forEach(function(lv,i){ var n=0; for(var p=1;p<=lv[4];p++) if(S.p[(i+1)+"-"+p]) n++;
    h+='<div class="card bcLv"><div class="row"><b>'+E(L(lv[0],lv[1]))+'</b><span class="badge">'+n+'/'+lv[4]+'</span></div><div class="mut small">'+E(L(lv[2],lv[3]))+'</div><div class="bcPg">';
    for(var p2=1;p2<=lv[4];p2++) h+='<button class="chip'+(S.p[(i+1)+"-"+p2]?" on":"")+'" data-ip="'+i+'-'+p2+'">'+p2+'</button>';
    h+='</div></div>'; });
  box.innerHTML=h+'<div class="mut tiny" style="padding:6px 2px 12px">'+L("Latihan disusun sendiri oleh aplikasi mengikut kaedah berperingkat; ia bukan buku Iqra' asal. Sebutan suara telefon hanyalah panduan; tahap 6 menggunakan bacaan qari sebenar.","The drills are generated by the app in the same step-by-step method; this is not the original Iqra' book. The phone voice is only a guide; level 6 uses a real reciter.")+'</div>';
  box.querySelectorAll("[data-ip]").forEach(function(b){ b.onclick=function(){ var p=b.getAttribute("data-ip").split("-"); iq.lv=+p[0]; iq.pg=+p[1]; iqraPage(); top(); }; });
  var lt=box.querySelector("#iqLet"); if(lt) lt.onclick=function(){ H.openLetters(); };
  var c=box.querySelector("#iqC"); if(c) c.onclick=function(){ var p=S.last.split("-"); iq.lv=+p[0]-1; iq.pg=+p[1]; iqraPage(); top(); };
}
function iqraPage(){
  var lv=LV[iq.lv], key=(iq.lv+1)+"-"+iq.pg, S=iqState(); S.last=key; save("ihsan_iqra",S);
  var h='<div class="qtop"><button class="ib" id="bcBack">‹</button><div class="qtt"><b>'+E(L(lv[0],lv[1]))+'</b><small>'+L("Halaman ","Page ")+iq.pg+'/'+lv[4]+'</small></div></div><div class="mut small" style="margin:2px 2px 8px">'+E(L(lv[2],lv[3]))+'</div>';
  if(iq.lv<5){
    var rows=rowsFor(iq.lv, iq.pg-1);
    h+='<div class="card bcIq" dir="rtl" lang="ar">'+rows.map(function(row,i){ return '<div class="bcRow'+(i===0&&iq.lv!==1?" first":"")+'">'+row.map(function(w){ return '<button class="bcS" data-bsay="'+E(w)+'">'+E(w)+'</button>'; }).join("")+'</div>'; }).join("")+'</div>';
  } else h+='<div id="iq6" class="card bcIq"><div class="mut">'+L("Memuatkan…","Loading…")+'</div></div>';
  h+='<div class="row" style="margin:10px 0"><button class="btn alt" id="iqN">‹ '+L("Seterusnya","Next")+'</button><button class="btn '+(S.p[key]?"alt":"gold")+'" id="iqT">'+(S.p[key]?"✅ "+L("Lulus","Passed"):"✓ "+L("Tanda lulus","Mark passed"))+'</button><button class="btn alt" id="iqP">'+L("Sebelum","Previous")+' ›</button></div>';
  box.innerHTML=h;
  box.querySelector("#bcBack").onclick=function(){ back(); };
  box.querySelector("#iqT").onclick=function(){ var S2=iqState(); if(S2.p[key]) delete S2.p[key]; else S2.p[key]=1; save("ihsan_iqra",S2); iqraPage(); };
  box.querySelector("#iqN").onclick=function(){ if(iq.pg<lv[4]) iq.pg++; else if(iq.lv<5){ iq.lv++; iq.pg=1; } iqraPage(); top(); };
  box.querySelector("#iqP").onclick=function(){ if(iq.pg>1) iq.pg--; else if(iq.lv>0){ iq.lv--; iq.pg=LV[iq.lv][4]; } iqraPage(); top(); };
  if(iq.lv===5){ var s=L6[iq.pg-1]; QV().surah(s, function(d){ var el=box&&box.querySelector("#iq6"); if(!el) return;
    el.innerHTML='<div class="row"><b>'+E(QuranView.sname(s))+'</b><button class="chip" id="iqAll">▶ '+L("Dengar surah","Listen to the surah")+'</button></div>'+d.t.map(function(segs,i){ return '<div class="bcAy6" dir="rtl" lang="ar"><span>'+QuranView.tj(segs)+'</span> <button class="ib" data-pk="'+QuranView.idx(s,i+1)+'">🔊 '+(i+1)+'</button></div>'; }).join("");
    el.querySelectorAll("[data-pk]").forEach(function(b){ b.onclick=function(){ QuranView.play(+b.getAttribute("data-pk"), H); }; });
    el.querySelector("#iqAll").onclick=function(){ QuranView.ensure(H); var k0=QuranView.idx(s,1); QuranView.play(k0, H); }; }); }
}

// =============== mount ===============
function back(){
  if(kind==="tajwid"){ if(st.q){ st.q=null; tajwidLesson(); return true; } if(st.l!=null){ st.l=null; tajwidHome(); top(); return true; } return false; }
  if(kind==="iqra"){ if(box && box.querySelector(".bcIq")){ iqraHome(); top(); return true; } return false; }
  return false;
}
function BacaanView(el, k, helpers){
  H=helpers; box=el; kind=k;
  el.onclick=function(e){ var b=e.target.closest("[data-bsay]"); if(b && H.speakAr){ H.speakAr(b.getAttribute("data-bsay")); b.classList.add("said"); } };
  if(k==="tajwid"){ if(st.q) quizDraw(); else if(st.l!=null) tajwidLesson(); else tajwidHome(); }
  else { if(box && iq.open){ iq.open=false; iqraPage(); } else iqraHome(); }
}
BacaanView.back=back;
BacaanView.navGet=function(){ var io=!!(box && document.body.contains(box) && box.querySelector(".bcIq")); return {l:st.l, lv:iq.lv, pg:iq.pg, io:io, k:st.l+"/"+(io?iq.lv+"."+iq.pg:"")}; };
BacaanView.navSet=function(o){ st.l=o.l; st.q=null; iq.lv=o.lv; iq.pg=o.pg; iq.open=o.io; };
BacaanView.stop=function(){ box=null; };
window.BacaanView=BacaanView;
})();
