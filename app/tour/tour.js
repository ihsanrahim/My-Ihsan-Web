/* My Ihsan 0.6.39 (steps updated 0.6.57 from the owner's "My Ihsan Lessons 2" page, artifact BH8oq6cN6wP1n7ngoREgZu) · tours as a Quick Start plus 10 separate lessons (owner's "Quick start and 10 lessons" page, artifact KZLd286sKni24Zw4JrCZLk).
   The Quick Start runs after onboarding; the lessons wait in Settings › Backup & about › Tours, in any order, each with its own progress
   (ihsan_tour.p[<lesson>] = {step, max, done}). A coach-mark engine: a spotlight hole over the target, a bubble with Back / Next / Pause / Exit
   and "Step n / N". Tap steps wait for the person to do it, with "Skip ›". Pause leaves a ▶ chip; Exit stops but keeps the place, so ▶ Continue
   on the lesson card picks it up. The tours only show things; the only changes are the ones the person makes in a tap step.
   IhsanTour.init(H) with H from tourH() in app.js. */
(function(){
"use strict";
var H=null, KEY="ihsan_tour";
function L(ms,en){ return H.L2x(ms,en); }
function ld(){ try{ return JSON.parse(localStorage.getItem(KEY)||"{}")||{}; }catch(e){ return {}; } }
function sv(o){ try{ localStorage.setItem(KEY, JSON.stringify(o)); }catch(e){} }

// ---- lessons: [id, icon, BM title, EN title, minutes, BM covers, EN covers] ----
var CH=[
 ["quick","⚡","Mula Pantas","Quick Start",2,"Sunting Utama, dua bar sisi, segerak, simpan kegemaran, dan tempat pelajaran.","Home edit, the two side bars, sync, saving favourites, and where the lessons are."],
 ["l1","🤖","Hidupkan AI Anda","Switch On Your AI",4,"Log masuk OpenRouter (Gemini 2.5 Flash), uji, cuba dalam Karya, dan semua ciri yang guna AI.","Sign in to OpenRouter (Gemini 2.5 Flash), test it, try it in Karya, and every feature that uses AI."],
 ["l2","🕌","Tiang Hari Anda","Pillars of the Day",4,"Waktu solat, makluman, rakaat, zikir, kiblat, sunat; Al-Quran, doa, wirid, amal dan Tanya.","Prayer times, alerts, rakaat, zikir, qibla, sunnah; Quran, doa, wirid, deeds and Ask."],
 ["l3", "🎒", "Belajar untuk Sekolah", "Study for School", 4, "Anak (tambah, tukar nama, susun, padam), kuiz ikut tahun dan subjek, laporan, tetapan ibu bapa dan kunci Sekolah; buku teks, PDF dan pembaca.", "Children (add, rename, reorder, delete), quizzes by year and subject, report, parent settings and the School lock; textbooks, PDFs and the reader."],
 ["l4", "🛒", "Berkat dalam Niaga", "Barakah in Business", 6, "Profil kedai, barang, kaunter Jual, resit, pencetak; dokumen, belanja, pelanggan, papan; Tempahan dengan harga, deposit, bayaran balik dan halaman tempahan dalam talian.", "Shop profile, items, the Sell till, receipts, printer; records, expenses, customers, dashboard; Bookings with prices, deposits, refunds and an online booking page."],
 ["l5", "💰", "Wang & Rancangan", "Money & Plans", 5, "Belanja dengan resit, komitmen, hutang, zakat, wasiat; Perancang, Fokus, Mesyuarat dengan Pembesar suara dan Dengar, dan Statistik.", "Expenses with receipts, commitments, debts, zakat, will; Planner, Focus, Meeting with Speaker and Listen, and Stats."],
 ["l6","🏃","Mukmin yang Kuat","Strong Believer",3,"Pilih jenis badan, rutin, kardio, sukan, huruf dan isyarat, pelan dan penjejak.","Body type, routines, cardio, sports, letters and signing, plan and tracker."],
 ["l7","👨‍👩‍👧","Silaturahim","Ties of Kinship",4,"Salasilah, hari jadi, bayi, jagaan, kumpulan, majlis, haid dan mod kanak-kanak.","Family tree, birthdays, baby, care, groups, events, period and kids mode."],
 ["l8","🏷️","Halal & Baik","Halal & Wholesome",3,"Imbas label, nombor E, resepi dari pautan dan video, pelan makan, senarai beli.","Scan a label, E-numbers, recipes from links and videos, meal plan, shopping list."],
 ["l9","✍️","Pena & Skrin","Pen & Screen",3,"Nota, kad ucapan, Karya; papan iklan, jam paparan masjid dan kod paparan.","Notes, greeting cards, Karya; billboard, masjid display clock and display codes."],
 ["l10","🧭","Khazanah untuk Diteroka","Treasures to Explore",4,"Kisah, dengar, haji dan umrah, falak, kalendar, puasa, Cari, tema dan sandaran.","Stories, listening, Hajj and Umrah, astronomy, calendar, fasting, Find, themes and backup."]
];
var LESSONS=CH.slice(1).map(function(c){ return c[0]; });

// ---- the steps: [id, go, target, BM, EN, flags] ----
// go: "home" | "tab:<tab>/<sub>" | "side" | "side><node id>" | "nav:<side id>" | "set" | "set:<group>" | "close"
// target: CSS selector, "~text" (first visible button/chip/heading with that text), "card~text" (its card), or "" (centred bubble)
// flags: tap (waits for the tap; Next becomes Skip), play (hidden in the Play build), ai, phone (0.6.57: skipped in the web app)
var S0=[
 ["quick",[
  ["q.hello","home","","Assalamualaikum! Jom luangkan 2 minit untuk mengenali aplikasi ini. Anda boleh jeda bila-bila masa.","Assalamualaikum! Let's take 2 minutes to show you around. You can pause any time."],
  ["q.edit","home","#wEdit","Ini Utama, hari anda dalam satu pandangan. Tekan ✎ Ubah untuk memilih, menyembunyi dan menyusun apa yang ditunjukkan.","This is Home, your day at a glance. Tap ✎ Edit to choose, hide and reorder what shows here.","tap"],
  ["q.editdone","","#wDone, #wEdit","Seret widget untuk menyusun, ＋ untuk menambah. Tekan ✓ Siap & kunci bila sudah puas hati.","Drag widgets to reorder and ＋ to add more. Tap ✓ Done & lock when you're happy.","tap"],
  ["q.left","side","#side","Ini bar kiri: setiap halaman aplikasi, disusun seperti tab di bawah. Kotak tanda di kanan menyembunyikan halaman atau tab yang anda tidak guna. Taip dalam kotak carian di atas untuk terus ke mana-mana.","This is the left bar: every page in the app, grouped like the tabs at the bottom. The tick boxes on the right hide a page or tab you don't use. Type in the search box at the top to jump anywhere."],
  ["q.right","set","#setp","Ini bar kanan, tetapan anda: bahasa, tema, zon solat, makluman, AI dan sandaran. Tekan di luar untuk menutupnya.","This is the right bar, your settings: language, theme, prayer zone, alerts, AI and backup. Tap outside to close it."],
  ["q.sync","close","#hSync","Tekan ⟳ Segerak untuk menyimpan salinan data anda dalam Google Drive anda sendiri. Kemudian buka My Ihsan di komputer riba atau tablet di myihsan.app/app dan log masuk dengan akaun Google yang sama: aplikasi penuh, seiring dengan telefon ini.","Tap ⟳ Sync to keep a copy of your data in your own Google Drive. Then open My Ihsan on a laptop or tablet at myihsan.app/app and sign in with the same Google account: the full app, in step with this phone."],
  ["q.save","side>sunat","[data-sfv=\"sunat/quran\"]","Sekarang jom simpan kegemaran. Tekan ☆ di sebelah Al-Quran.","Now let's save a favourite. Tap the ☆ next to Al-Quran.","tap"],
  ["q.school","side>learn","[data-sfv=\"learn/sekolah\"]","Satu lagi: tekan ☆ di sebelah Sekolah.","And one more: tap the ☆ next to School.","tap"],
  ["q.strip","side","#sdFav","Kedua-duanya ada di sini sekarang, di bawah bar kiri, sekali tekan sahaja.","Both are here now, at the bottom of the left bar, one tap away."],
  ["q.row","home","#qtBar","Ia juga ada dalam baris ini di atas tab bawah. Letak ☆ pada apa-apa yang anda selalu guna.","They also sit in this row above the bottom tabs. Put ☆ on anything you use often."],
  ["q.date", "tab:cal/bulan", ".ibdtT", "Tarikh dan masa: tekan kotak tarikh dan roda akan muncul. Tekan kotak sekali lagi untuk menaip, cth. 25/12. Hari ini hanya sekali tekan.", "Dates and times: tap a date box and the wheel drops down. Tap the box again to type, e.g. 25/12. Today is one tap away.", "tap"],
  ["q.about","set:sandaran","#tourCard","10 pelajaran ada di sini, setiap satu dengan kemajuannya sendiri. Pilih mana-mana, bila-bila anda ada 3 minit.","The 10 lessons live here, each with its own progress. Pick any one, whenever you have 3 minutes."],
  ["q.web", "close", "", "Di komputer, ciri khas telefon kelihatan kelabu dengan 📱, seperti masa skrin atau pembesar suara. Yang lain semua berfungsi di sana juga.", "On a computer, phone-only things show grey with 📱, like screen time or the speaker. Everything else works there too."],
  ["q.end","close","","Itu sahaja! Kami cadangkan mula dengan pelajaran 1: hidupkan pembantu AI anda. Ia membuka import resepi, bacaan label halal, resit dan banyak lagi.","That's it! We suggest starting with lesson 1: switch on your AI helper. It unlocks recipe import, halal label reading, receipts and more."]
 ]],
 ["l1",[
  ["ai.why","close","","Sesetengah alat guna AI: membaca label halal, import resepi, Tanya, menulis Karya, resit dan penyata, jurulatih khat, halaman buku ke teks, terjemah hantaran kumpulan, dan mengisi dokumen niaga dari chat. Jom hidupkan sekali untuk semuanya.","Some tools use AI: reading halal labels, importing recipes, Ask, Karya writing, receipts and statements, the khat coach, book pages to text, translating group posts, and filling business documents from a chat. Let's switch it on once for all of them."],
  ["ai.open","set:ai","#aiSetCard","Semua tetapan AI di satu tempat. Pilihan paling mudah ialah OpenRouter: satu akaun, semua model besar, dan ada yang percuma.","All AI settings are in one place. The easiest choice is OpenRouter: one account, all the big models, and some are free."],
  ["ai.get","set:ai","[data-login=\"openrouter\"]","Tekan Log masuk. openrouter.ai akan dibuka: log masuk dengan Google dan benarkan. Anda akan kembali ke sini dengan kunci sudah diisi.","Tap Sign in. openrouter.ai opens: sign in with Google and allow it. You come back here with the key already filled in.","tap"],
  ["ai.test","set:ai","#aiKeys","Model sudah ditetapkan kepada Gemini 2.5 Flash: pantas, murah dan pandai membaca gambar. Tekan Simpan & uji, dan tunggu titik hijau ✓.","The model is already set to Gemini 2.5 Flash: fast, cheap and good at reading photos. Tap Save & test and wait for the green ✓ dot.","tap"],
  ["ai.fix","set:ai","#aiSetCard","Tak berjaya? \"401\": log masuk semula. \"402\": tiada kredit, tambah sedikit kredit di OpenRouter atau pilih model bertanda FREE. Tiada internet? Cuba lagi nanti.","Not working? \"401\": sign in again. \"402\": no credit, so add a little credit on OpenRouter or pick a model marked FREE. No internet? Try again later."],
  ["ai.karya","nav:alat/nota/karya","#kyIdea","Jom cuba. Ini Karya, studio penulisan. Tekan 🔀 untuk idea, pilih Pantun, kemudian Cipta.","Let's try it. This is Karya, the writing studio. Tap 🔀 for an idea, choose Pantun, then tap Create.","tap ai"],
  ["ai.karyago","","#kyGo","Tekan Cipta dan lihat AI menulis untuk anda. Kunci yang sama kini berfungsi di seluruh aplikasi.","Tap Create and watch the AI write for you. The same key now works everywhere in the app.","tap ai"],
  ["ai.which","set:ai","#aiF, #aiSetCard","Setiap ciri boleh guna perkhidmatan atau model berbeza. Ciri peribadi (resit, halaman buku, chat niaga) tidak pernah jatuh ke perkhidmatan awam percuma.","Each feature can use a different service or model. Private ones (receipts, book pages, business chats) never fall back to a free public service."],
  ["ai.others","set:ai","#aiMoreK,#aiSetCard","Pilihan lain: Google Gemini, Groq dan Mistral ada kunci percuma. Qwen ada kuota percuma. DeepSeek murah tetapi teks sahaja. OpenAI, Claude dan Grok berbayar. Pollinations percuma tanpa kunci, tetapi perlahan dan awam.","Other choices: Google Gemini, Groq and Mistral have free keys. Qwen has a free quota. DeepSeek is cheap but text only. OpenAI, Claude and Grok are paid. Pollinations is free with no key, but slow and public."],
  ["ai.apps","close","","Tiada kunci? Setiap butang AI juga boleh menghantar gambar atau teks ke aplikasi AI yang anda sudah guna, seperti ChatGPT, Gemini atau Claude.","No key? Any AI button can also send the photo or text to an AI app you already use, such as ChatGPT, Gemini or Claude."],
  ["ai.done","close","","Siap ✓ Pembantu AI anda sudah sedia.","Done ✓ Your AI helper is ready."]
 ]],
 ["l2",[
  ["s.times","tab:solat/waktu","#view","Waktu solat hari ini untuk zon anda. Leret untuk hari lain.","Today's prayer times for your zone. Swipe for other days."],
  ["s.zone","tab:solat/waktu","~📍","Kawasan salah? Tekan di sini untuk menukar zon.","Wrong area? Tap here to change your zone."],
  ["s.alert","set:makluman","card~🔔","Pilih azan atau makluman bagi setiap solat, serta peringatan imsak, tahajud dan puasa sunat.","Choose the azan or alert for each prayer, and reminders for imsak, tahajjud and sunnah fasts."],
  ["s.rakaat","tab:solat/rakaat","#view","Terlupa bilangan rakaat? Letak telefon dan ia mengira setiap rakaat untuk anda.","Lose count in solat? Set the phone down and it counts each rakaat for you."],
  ["s.rakset","set:rakaat","card~🤲","Di sini anda tukar paparan solat dan kalibrasi sujud.","Here you change the solat display and calibrate sujud."],
  ["s.zikir","nav:solat/zikir/tasbih","#view","Tasbih digital. Tekan di mana-mana untuk mengira. Buat pembilang sendiri dengan sasaran.","A digital tasbih. Tap anywhere to count. Make your own counters with targets."],
  ["s.qibla","tab:solat/kiblat","card~🧭","Pegang telefon rata. Anak panah menunjuk ke Kaabah. 📷 melukis garisan pada paparan kamera.","Hold the phone flat. The arrow points to the Kaabah. 📷 draws the line over the camera view."],
  ["s.sunnah","tab:solat/ssunat","#view","Solat sunat, cara dan bila, serta waktu larangan hari ini.","Sunnah prayers, with how and when, and today's forbidden times."],
  ["p.quran","tab:sunat/quran","~▶,~📖","Sambung bacaan dari tempat anda berhenti. Tekan nombor ayat untuk audio, makna dan banyak lagi.","Continue reading where you stopped. Tap an ayat number for audio, meaning and more."],
  ["p.qset","tab:sunat/quran","~⚙,~🔍","Al-Quran ada tetapan sendiri: paparan, bacaan audio dan tatal automatik.","The Quran has its own settings: display, listening and auto-scroll."],
  ["p.khatam","tab:sunat/quran","~🏁","Pilih tarikh tamat dan dapatkan sasaran harian.","Pick an end date and get a daily target."],
  ["p.doa","tab:sunat/doa","#view","Doa untuk setiap ketika. ☆ menyimpan satu di Utama.","A doa for every moment. ☆ keeps one on Home."],
  ["p.wirid","tab:sunat/wirid","#view","Wirid pagi dan petang serta Ma'thurat, dengan audio dan pembilang.","Morning and evening wirid and Ma'thurat, with audio and counters."],
  ["p.deeds","tab:sunat/amal","#view","Tetapkan amalan harian dan tandakan: Al-Quran, Dhuha, sedekah, puasa.","Set daily deeds and tick them off: Quran, Dhuha, charity, fasting."],
  ["p.ask","tab:sunat/tanya","#view","Ada soalan tentang Islam? Tanya badan rasmi, atau AI anda.","A question about Islam? Ask the official bodies, or your AI.","ai"],
  ["l2.done","close","","Siap ✓","Done ✓"]
 ]],
 ["l3",[
  ["k.school","tab:learn/sekolah","#view","Kuiz silibus Malaysia, Tahun 1 hingga Tingkatan 5, serta UPKK dan PKSK.","Quizzes for the Malaysian syllabus, Year 1 to Form 5, plus UPKK and PKSK."],
  ["k.child","tab:learn/sekolah","~＋","Tambah setiap anak. Setiap seorang ada kemajuan sendiri. ⚙ untuk menukar nama, menyusun atau memadam anak.","Add each child. Each one gets their own progress. ⚙ lets you rename, reorder or delete a child."],
  ["k.year","tab:learn/sekolah","#view","Pilih tahun, kemudian subjek. Topik mengikut bab buku teks.","Pick a year, then a subject. Topics follow the textbook chapters."],
  ["k.quiz","tab:learn/sekolah","","Dalam topik, jawab dengan menekan. Barisan manik menunjukkan setiap soalan: hijau betul, merah salah. Lihat nota membuka nota, dengan gambar dan paparan 3D.","Inside a topic, answer by tapping. The bead line shows each question: green right, red wrong. Lihat nota opens the notes, with pictures and a 3D view."],
  ["k.report","tab:learn/sekolah","#skRep2","Minit seminggu, kekuatan dan topik lemah. Kongsi sebagai gambar atau teks.","Weekly minutes, strengths and weak topics. Share it as a picture or text."],
  ["k.parent","tab:learn/sekolah","~⚙","Ibu bapa memilih berapa kali cuba sebelum 💡 Jawapan muncul.","Parents choose how many tries before 💡 Answer appears."],
  ["k.lock", "tab:learn/sekolah", "~⚙", "Kunci telefon kepada Sekolah untuk seorang anak. Mereka hanya boleh belajar; PIN ibu bapa membukanya.", "Lock the phone to School for one child. They can only study; a parent PIN unlocks it."],
  ["k.games","tab:learn/sekolah","","Dalam setiap subjek, 🎮 Main menukar soalan yang sama menjadi permainan.","Inside each subject, 🎮 Games turn the same questions into learning games."],
  ["b.books","tab:learn/buku","#view","PDF dan buku teks anda dalam folder.","Your PDFs and textbooks in folders."],
  ["b.text","tab:learn/sekolah","","Tekan 📘 pada mana-mana kad subjek untuk memuat turun buku teks rasminya. Wifi disyorkan.","Tap 📘 on any subject card to download its official textbook. Wifi recommended."],
  ["b.tools","tab:learn/buku","~📂,~Open,~Buka","Buka PDF, imbas halaman dengan kamera, tukar gambar jadi PDF, atau gabung PDF.","Open a PDF, scan pages with the camera, turn photos into a PDF, or merge PDFs."],
  ["b.reader","tab:learn/buku","","Dalam pembaca, ✏️ di kanan bawah membuka pen dan penyerlah. Halaman buku ke teks guna AI.","In the reader, ✏️ at the bottom right opens the pen and highlighter. Book page to text uses AI.","ai"],
  ["k.basics","tab:learn/bahasa","#view","Iqra, tajwid, huruf Arab dan perkataan Al-Quran.","Iqra, tajwid, Arabic letters and Quran words."],
  ["k.explore","tab:learn/panduan","#view","Panduan, peta minda fiqh, falak, catur dan 20 teka-teki IQ.","Guides, the fiqh mind map, astronomy, chess and 20 IQ puzzles."],
  ["l3.done","close","","Siap ✓","Done ✓"]
 ]],
 ["l4",[
  ["n.open","tab:alat/niaga","#view","Uruskan perniagaan kecil: gerai, kek rumah, homestay atau perkhidmatan. Tab perniagaan ada di bar bawah. Baru? Sediakan perniagaan anda dahulu, dan tab akan muncul.","Run a small business: a stall, home bakes, a homestay or a service. The business tabs sit in the bar at the bottom. New here? Set up your business first and the tabs appear."],
  ["n.prof","tab:alat/niaga","[data-ngp=\"prof\"]","Nama, logo, bank dan QR DuitNow. Semuanya muncul pada setiap resit dan invois.","Name, logo, bank and DuitNow QR. They appear on every receipt and invoice."],
  ["n.items","tab:alat/niaga","[data-ngp=\"item\"]","Tambah barang dengan harga, dan gambar atau emoji jika mahu.","Add your items with a price, and a photo or emoji if you like."],
  ["n.sell","tab:alat/niaga","[data-ngp=\"pos\"]","Tekan barang untuk tambah. Tekan lama untuk kuantiti. Simpan bakul sambil melayan pelanggan seterusnya.","Tap an item to add it. Hold for quantity. Park a basket while serving the next customer."],
  ["n.calc","tab:alat/niaga","","Bukan barang? Dalam tab Kalkulator, taip 2.50×2 dan ia jadi satu baris.","Not an item? In the Calculator tab, type 2.50×2 and it becomes a line."],
  ["n.pay","tab:alat/niaga","","Bayar tunai menunjukkan baki. DuitNow menunjukkan QR anda. Resit hanya dibuat jika pelanggan minta: gambar ke WhatsApp, atau QR.","Cash shows the change. DuitNow shows your QR. A receipt is only made if the customer asks: a picture to WhatsApp, or a QR."],
  ["n.print","tab:alat/niaga","","🖨 Cetak ke pencetak terma Bluetooth yang murah.","🖨 Print to a cheap Bluetooth thermal printer."],
  ["n.today","tab:alat/niaga","","Tab Hari ini: jumlah hari ini, laci tunai dan barang terjual. Kembali ke mana-mana hari dan batalkan kesilapan.","The Today tab: today's total, the cash drawer and items sold. Go back any day and undo a mistake."],
  ["n.docs","tab:alat/niaga","[data-ngp=\"dok\"]","Sebut harga, invois, resit dan pesanan hantar. Sebut harga jadi invois sekali tekan. Isi dari chat pesanan WhatsApp dengan AI.","Quotes, invoices, receipts and delivery orders. A quote becomes an invoice in one tap. Fill from a WhatsApp order chat with AI.","ai"],
  ["n.exp","tab:alat/niaga","[data-ngp=\"exp\"]","Belanja niaga (snap resit) dan pelanggan anda, dengan hutang setiap seorang.","Business expenses (snap a receipt) and your customers, with what each one owes."],
  ["n.dash","tab:alat/niaga","[data-ngp=\"papan\"]","Jualan, untung dan siapa masih berhutang, sekali pandang.","Sales, profit and who still owes you, at a glance."],
  ["n.sheet","tab:alat/niaga","","Dalam Profil, sambung Google Sheet percuma dalam akaun Google anda sendiri: kongsi dengan rakan kongsi atau akauntan, dan ia juga menjalankan halaman tempahan dalam talian anda.","In Profile, connect a free Google Sheet in your own Google account: share with a partner or accountant, and it also runs your online booking page."],
  ["n.book", "nav:alat/niaga/book", "[data-ngp=\"book\"]", "Tempahan: kalendar untuk bilik, homestay, dewan, kereta atau slot servis. Tiada tempahan bertindih.", "Bookings: a calendar for rooms, a homestay, a hall, a car or service slots. No double bookings."],
  ["n.units", "nav:alat/niaga/book", "[data-nbv=\"units\"],#nbOwn", "Tetapkan harga setiap hari dalam minggu, cuti umum dan cuti sekolah, serta tarikh anda sendiri. Pakej seperti 2 hari 1 malam, tambahan seperti sarapan atau sistem PA. Tanda beberapa unit untuk ubah serentak.", "Set a price for each day of the week, public and school holidays, and your own dates. Packages like 2 days 1 night, add-ons like breakfast or a PA system. Tick several units to change them together."],
  ["n.bnew", "nav:alat/niaga/book", "[data-nbv=\"list\"],#nbOwn", "Pilih pelanggan di atas: cari, terkini atau kerap. Tambah unit lain untuk kumpulan. Tarikh ditahan sehingga deposit diterima.", "Pick the customer at the top: search, recent or frequent. Add more units for a group. The dates are held until the deposit comes in."],
  ["n.bpay", "nav:alat/niaga/book", "", "Deposit menjadi resit dan terus dikira dalam Kutipan. Terima baki kemudian; ia bertukar 💚 Dibayar.", "A deposit becomes a receipt and counts in Collected at once. Take the balance later; it turns 💚 Paid."],
  ["n.bcancel", "nav:alat/niaga/book", "", "Pembatalan ikut polisi bayaran balik anda: pulangkan dengan nota kredit, atau simpan sebagai kredit untuk penginapan pelanggan seterusnya.", "Cancelling follows your refund policy: refund with a credit note, or keep it as credit for the customer's next stay."],
  ["n.online", "nav:alat/niaga/book", "[data-nbv=\"set\"],#nbOwn", "Kongsi pautan atau QR tempahan anda. Pelanggan nampak tarikh kosong sahaja, menempah, dan memuat naik bukti bayaran. Tambah kod promosi dan pautan bayaran anda sendiri (ToyyibPay, Billplz…). Mereka bayar terus kepada anda.", "Share your booking link or QR. Customers see free dates only, book, and upload the payment proof. Add promo codes and your own payment link (ToyyibPay, Billplz…). They pay you directly."],
  ["l4.done","close","","Siap ✓","Done ✓"]
 ]],
 ["l5",[
  ["f.exp","nav:fin/belanja","#view","Setiap ringgit yang dibelanja. 📷 resit atau penyata bank dan AI mengisinya.","Every ringgit you spend. 📷 a receipt or bank statement and AI fills it in.","ai"],
  ["f.commit","nav:fin/komitmen","#view","Pendapatan, bil bulanan dan 30 hari akan datang.","Income, monthly bills and the next 30 days."],
  ["f.debt","nav:fin/hutang","#view","Siapa anda berhutang, dan siapa berhutang dengan anda, dengan peringatan.","Who you owe, and who owes you, with reminders."],
  ["f.split","nav:fin/bahagi","#view","Trip bersama kawan: siapa bayar apa, dan siapa hutang siapa.","Trips with friends: who paid what, and who owes whom."],
  ["f.zakat","nav:fin/zakat","#view","Kira zakat anda dan rekod apa yang sudah dibayar.","Work out your zakat and record what you've paid."],
  ["f.will","nav:fin/wasiat","#view","Harta, bahagian faraid dan hasrat, kemudian draf untuk dicetak.","Assets, faraid shares and wishes, then a draft to print."],
  ["f.fx","nav:fin/tukaran","#view","Kadar tukaran, harga emas dan saham patuh Syariah.","Rates, gold price and Shariah-compliant stocks."],
  ["t.plan","tab:cal/bulan","#view","Senarai harian, mingguan, bulanan dan tahunan anda. Mula dari pratetap seperti Hari Muslim atau Pelajar.","Your daily, weekly, monthly and yearly lists. Start from a preset like Muslim day or Student."],
  ["t.tick","tab:cal/bulan","","Tandakan sambil berjalan. Jalur minggu dan bulan terisi sendiri.","Tick as you go. The week and month strips fill in by themselves."],
  ["t.focus","tab:cal/fokus","#view","Fokus ada Hari ini, Matlamat, Tabiat, Berkembang dan Saya. Pemasa fokus ada dalam Hari ini: 25 minit, atau hingga solat seterusnya.","Focus has Today, Goals, Habits, Grow and Me. The focus timer is in Today: 25 minutes, or until the next prayer."],
  ["t.meet", "tab:cal/mesyuarat", "#view", "Nota mesyuarat yang berfungsi tanpa internet: rakam, tanda detik penting, kemudian dapatkan tindakan dan keputusan.", "Meeting notes that work offline: record, mark key moments, then get the action items and decisions.", "ai"],
  ["t.spk", "tab:cal/mesyuarat", "[data-mtp=\"spk\"]", "Pembesar suara menjadikan telefon sistem PA dengan mikrofon tanpa wayar atau Bluetooth. Orang lain boleh mendengar di telefon sendiri dengan mengimbas QR, pada Wi-Fi yang sama.", "Speaker turns the phone into a PA with a wireless or Bluetooth mic. Others can listen on their own phones by scanning a QR, on the same Wi-Fi.", "phone"],
  ["t.wt", "tab:cal/mesyuarat", "[data-mtp=\"wt\"]", "Walkie-talkie: tekan untuk bercakap, seorang pada satu masa. Di Wi-Fi yang sama tanpa internet, atau melalui internet ke mana-mana. Sesiapa boleh bercakap, atau hos beri giliran.", "Walkie-talkie: push to talk, one person at a time. On the same Wi-Fi with no internet, or over the internet to anywhere. Anyone can talk, or the host gives turns."],
  ["t.trip", "tab:cal/trip", ".bn-trip", "Trip: Umrah DIY di atas, dan Travel Anywhere untuk ke mana saja. Taip destinasi, hari dan orang; AI rancang hari demi hari dengan peta, gambar, pautan Google Maps, bajet dalam RM dan waktu solat. Tambah penerbangan atau hotel dengan tangkapan skrin.", "Trip: Umrah DIY on top, and Travel Anywhere for anywhere else. Type the destination, days and people; AI plans day by day with a map, photos, Google Maps links, a budget in RM and prayer times. Add flights or hotels with a screenshot.", "ai"],
  ["t.stats", "tab:cal/statistik", "#view", "Langkah, masa skrin, solat dan dengar Al-Quran, ikut hari, bulan dan tahun.", "Steps, screen time, prayers and Quran listening, by day, month and year.", "phone"],
  ["l5.done","close","","Siap ✓","Done ✓"]
 ]],
 ["l6",[
  ["m.open","tab:cal/senaman","#view","\"Mukmin yang kuat lebih baik.\" Senaman untuk setiap tubuh.","\"The strong believer is better.\" Exercise for every body."],
  ["m.pick","tab:cal/senaman","#view","Pilih jenis badan, berapa lama, dan tahap.","Choose your body type, how long, and how hard."],
  ["m.start","tab:cal/senaman","~▶","Setiap gerakan ada animasi, pemasa dan rehat.","Each move shows an animation, a timer and rest breaks."],
  ["m.routines","tab:cal/senaman","~⏱","Rutin siap sedia, sekali tekan untuk mula.","Ready-made routines, one tap to start."],
  ["m.types","tab:cal/senaman","~🏋","Di rumah, di bilik hotel, atau latihan untuk 19 sukan.","At home, in a hotel room, or drills for 19 sports."],
  ["m.letters","tab:cal/senaman","~🔤","Bentuk huruf dengan badan sambil kamera menyemak. Atau belajar bahasa isyarat dan surih huruf dengan gerakan.","Make letters with your body while the camera checks your shape. Or learn sign languages and trace letters with movements."],
  ["m.plan","tab:cal/senaman","~📋","Bina pelan mingguan anda sendiri.","Build your own weekly plan."],
  ["m.track","tab:cal/senaman","~📅","Apa yang anda buat setiap hari, dan nombor kesihatan anda.","What you've done each day, and your health numbers."],
  ["m.steps", "tab:cal/statistik", "#view", "Langkah anda dikira di latar. Tetapkan sasaran.", "Your steps are counted in the background. Set a goal.", "phone"],
  ["l6.done","close","","Siap ✓","Done ✓"]
 ]],
 ["l7",[
  ["fa.open","tab:alat/keluarga","#view","Keluarga anda di satu tempat.","Your family in one place."],
  ["fa.tree","tab:alat/keluarga","~🌳","Bina salasilah. Lihat sebagai Rumput 3D, Papan Hitam atau Vintaj, dan kongsi dengan saudara.","Build your tree. View it as Grass 3D, Chalkboard or Vintage, and share it with relatives."],
  ["fa.bday","tab:alat/keluarga","~🎂","Jangan terlepas hari jadi.","Never miss a birthday."],
  ["fa.baby","tab:alat/keluarga","~👶","Nama, akikah, tumbesaran dan peringatan.","Names, aqiqah, growth and reminders."],
  ["fa.care","tab:alat/keluarga","~🩺","Jaga yang sakit dan warga emas: waktu ubat, kemas kini bersama dan mod warga emas.","Care for the sick and elderly: medicine times, shared updates and an elder mode."],
  ["fa.groups","tab:alat/kumpulan","#view","Kumpulan untuk keluarga, kelas atau usrah. Kongsi tugas dan hantaran. Hantaran boleh diterjemah dengan AI.","A group for the family, a class or usrah. Share tasks and posts. Posts can be translated with AI.","ai"],
  ["fa.events","tab:alat/majlis","#view","Rancang majlis: tetamu, tugas dan bajet.","Plan a majlis: guests, tasks and budget."],
  ["fa.period","tab:cal/haid","#view","Haid dan kesihatan wanita, untuk diri sendiri atau isteri. Tab ini boleh disembunyikan.","Periods and women's health, for yourself or for your wife. You can hide this tab.","play"],
  ["fa.kids","set:khas","card~👓","Mod kanak-kanak: ruang selamat dengan bintang, kisah dan permainan. Kunci dengan PIN.","Kids mode: a safe space with stars, stories and games. Lock it with a PIN."],
  ["l7.done","close","","Siap ✓","Done ✓"]
 ]],
 ["l8",[
  ["h.check","tab:alat/halal","~🔍","Ambil gambar label makanan. AI membaca ramuan dan menanda yang meragukan. Panduan sahaja, bukan fatwa.","Snap a food label. AI reads the ingredients and flags anything doubtful. A guide only, not a fatwa.","ai"],
  ["h.e","tab:alat/halal","~🔍","Cari mana-mana nombor E atau ramuan.","Search any E-number or ingredient."],
  ["h.recipe","tab:alat/halal","#view","Simpan resepi dari pautan, video TikTok atau YouTube, gambar atau kamera. AI menulisnya dengan kemas.","Save a recipe from a link, TikTok or YouTube video, a photo or the camera. AI writes it out neatly.","ai"],
  ["h.share","tab:alat/halal","","Dari TikTok, Facebook, Instagram atau YouTube, tekan Kongsi dan pilih My Ihsan Recipe. Resepi terus masuk ke sini.","From TikTok, Facebook, Instagram or YouTube, tap Share and pick My Ihsan Recipe. The recipe comes straight in here.","img:share"],
  ["h.builder","tab:alat/halal","","Dalam pembina resepi, ubah hidangan dan tukar ramuan kepada yang halal. ⋮ membuat PDF berbingkai.","In the recipe builder, change servings and swap ingredients for halal ones. ⋮ makes a framed PDF."],
  ["h.plan","tab:alat/halal","~📅","Rancang makanan seminggu.","Plan the week's meals."],
  ["h.shop","tab:alat/halal","~🛒","Senarai beli terbina sendiri dari pelan anda.","The shopping list builds itself from your plan."],
  ["h.find","tab:alat/cari","#view","Makanan halal, masjid dan surau berdekatan.","Halal food, mosques and surau near you."],
  ["l8.done","close","","Siap ✓","Done ✓"]
 ]],
 ["l9",[
  ["w.notes","nav:alat/nota/nota","#view","Nota anda. Semat satu dan ia muncul dalam bar kiri.","Your notes. Pin one and it shows in the left bar."],
  ["w.cards","nav:alat/nota/kad","#view","Raya, perkahwinan, bayi baru dan banyak lagi. Pilih reka bentuk, tambah kata-kata, kongsi sebagai gambar.","Raya, wedding, new baby and more. Pick a design, add your words, share as a picture."],
  ["w.karya","nav:alat/nota/karya","#view","Sajak, pantun, cerpen dan munajat, ditulis dengan AI. Enam gaya halaman untuk dikongsi.","Poems, pantun, short stories and munajat, written with AI. Six page styles to share.","ai"],
  ["d.bill","tab:alat/paparan","~🪧","Jadikan telefon papan LED bergerak: jemput di lapangan terbang, sambutan majlis kahwin, tingkap kereta.","Turn your phone into a moving LED sign: airport pickup, wedding welcome, car window."],
  ["d.clock","tab:alat/paparan","~🕰","Jam gaya masjid dengan waktu solat dan kiraan iqamah. Sesuai untuk tablet lama di dinding.","A masjid-style clock with prayer times and iqamah countdown. Great for an old tablet on the wall."],
  ["d.code","tab:alat/paparan","~📥","Tunjukkan paparan reka orang lain dengan menampal kodnya.","Show a display someone else designed by pasting its code."],
  ["l9.done","close","","Siap ✓","Done ✓"]
 ]],
 ["l10",[
  ["x.bell","close","#hBell","🔔 Pemberitahuan: setiap kemas kini oleh orang lain (majlis dikongsi, bahagi bil, kumpulan, perniagaan) masuk ke sini. Leret ke kanan untuk arkib, ke kiri untuk padam. Pilih apa yang diberitahu, dan sembunyikan butiran pada telefon jika mahu.","🔔 Notifications: every update by someone else (shared events, split bills, groups, business) lands here. Swipe right to archive, left to delete. Choose what to be told about, and hide the details on the phone if you like."],
  ["x.stories","tab:learn/kisah","#view","Garis masa Sirah, 25 nabi, para sahabat dan Hadis 40.","The Sirah timeline, the 25 prophets, the companions and 40 Hadith."],
  ["x.listen","tab:learn/dengar","#view","Radio Islam dari seluruh dunia, dan 82 penceramah podcast.","Islamic radio from around the world, and 82 podcast speakers."],
  ["x.hajj","tab:learn/bahasa","[data-guide=\"haji\"]","Lalui Haji dan Umrah dalam 3D, rancang umrah sendiri, kemudian guna mod Umrah Langsung dan pembilang tawaf pada harinya.","Walk through Hajj and Umrah in 3D, plan a DIY umrah, then use Live Umrah mode and the tawaf counter on the day."],
  ["x.falak","tab:learn/panduan",".falakHero","Langit malam ini, fasa bulan dan laluan matahari.","The sky tonight, moon phases and the sun's path."],
  ["x.cal","tab:cal/bulan","#view","Kedua-dua kalendar dengan cuti umum dan sekolah. Segerak waktu solat ke Google Calendar.","Both calendars with public and school holidays. Sync prayer times to Google Calendar."],
  ["x.fast","tab:cal/puasa","#view","Penjejak Ramadan dan puasa ganti anda.","Ramadan tracker and your make-up fasts."],
  ["x.find","tab:alat/cari","#view","Masjid, surau, tempat menderma, dan kubur keluarga. Senyap automatik di masjid.","Mosques, surau, places to donate, and your family's graves. Auto-silent at the masjid."],
  ["x.theme","set:paparan","card~🎨","12 tema, cerah dan gelap, dan teks lebih besar.","12 themes, light and dark, and bigger text."],
  ["x.backup","set:sandaran","card~🗄","Simpan fail sandaran, atau guna ☁ Segerak, sebelum menukar telefon.","Save a backup file, or use ☁ Sync, before you change phones."],
  ["x.launcher","set:paparan","#homeCard","Anda juga boleh jadikan My Ihsan skrin utama telefon anda.","You can even make My Ihsan your phone's home screen."],
  ["x.end","close","","Alhamdulillah! Bar kiri dan cariannya sentiasa membawa anda ke mana-mana. Semoga Allah menerima amalan kita.","Alhamdulillah! The left bar and its search will always get you anywhere. May Allah accept our deeds."]
 ]]
];
var ALL=[]; S0.forEach(function(c){ c[1].forEach(function(s){ ALL.push({id:s[0], ch:c[0], go:s[1], el:s[2], ms:s[3], en:s[4], f:(s[5]||"").split(" ").filter(Boolean)}); }); });

function skip(s){
  if(s.f.indexOf("play")>=0 && window.IHSAN_PLAY) return true;
  if(s.f.indexOf("phone")>=0 && H.WEB) return true;   // 0.6.57: phone-only features are grey on the web
  if(s.id==="fa.period" && H.periodHidden()) return true;
  if(s.id==="x.launcher" && (H.WEB || !window.Native)) return true;
  if(/^(s\.alert|s\.rakset)$/.test(s.id) && H.WEB) return true;
  return false; }
function listFor(mode){ return ALL.filter(function(s){ if(skip(s)) return false; return mode==="complete" ? true : s.ch===mode; }); }
function counts(){ var o={}; CH.forEach(function(c){ o[c[0]]=listFor(c[0]).length; }); o.complete=listFor("complete").length; return o; }

// ---- DOM ----
var R=null, cur=null;   // cur = {mode, list, i}
function ui(){
  if(R) return R;
  var hole=document.createElement("div"); hole.id="tourHole";
  var blk=document.createElement("div"); blk.id="tourBlk";
  var bub=document.createElement("div"); bub.id="tourBub"; bub.setAttribute("role","dialog"); bub.setAttribute("aria-live","polite");
  document.body.appendChild(blk); document.body.appendChild(hole); document.body.appendChild(bub);
  blk.addEventListener("click", function(e){ e.stopPropagation(); e.preventDefault(); }, true);
  R={hole:hole, blk:blk, bub:bub}; return R;
}
function teardown(){ if(!R) return; ["hole","blk","bub"].forEach(function(k){ if(R[k].parentNode) R[k].parentNode.removeChild(R[k]); }); R=null; window.removeEventListener("resize", place); document.body.classList.remove("touring"); }

function vis(e){ if(!e) return false; var r=e.getBoundingClientRect(); return r.width>2 && r.height>2 && getComputedStyle(e).visibility!=="hidden"; }
function find(sel){
  if(!sel) return null;
  var parts=sel.split(/,(?=~|card~)/);   // "~▶,~📖" = try each in turn
  if(parts.length>1){ for(var i=0;i<parts.length;i++){ var x=find(parts[i]); if(x) return x; } return null; }
  var root=document.body, card=false;
  if(sel.indexOf("card~")===0){ card=true; sel="~"+sel.slice(5); }
  if(sel[0]==="~"){ var t=sel.slice(1), scope=document.getElementById("setp") && document.body.classList.contains("setOn") ? document.getElementById("setB") : document.getElementById("view");
    var c=[].slice.call((scope||root).querySelectorAll(card?"h3":"button,.chip,.qt,.lchip,h3,a"));
    var tt=t.replace(/\s+$/,""), exact=t!==tt;   // a trailing space = "the 2nd card with this emoji"
    var hits=c.filter(function(e){ return vis(e) && (e.textContent||"").indexOf(tt)>=0; });
    var e=hits[exact && hits.length>1 ? 1 : 0]; if(!e) return null;
    return card ? (e.closest(".card,.mSec")||e) : e; }
  var all=[].slice.call(root.querySelectorAll(sel)); for(var j=0;j<all.length;j++) if(vis(all[j])) return all[j];
  return null;
}
function doGo(g, done){
  var close=function(){ if(H.sideOpen()) H.side(false); if(H.setOn()) H.setShow(false); };
  if(!g){ done(); return; }
  if(g==="close"){ close(); setTimeout(done, 250); return; }
  if(g==="home"){ close(); H.go("home"); setTimeout(done, 350); return; }
  if(g.indexOf("tab:")===0){ close(); var p=g.slice(4).split("/"); H.sub(p[0], p[1]); setTimeout(done, 550); return; }
  if(g.indexOf("nav:")===0){ close(); H.nav(g.slice(4)); setTimeout(done, 600); return; }
  if(g==="side"){ if(H.setOn()) H.setShow(false); H.side(true); setTimeout(done, 380); return; }
  if(g.indexOf("side>")===0){ if(H.setOn()) H.setShow(false); H.side(true); H.sideOpenNode(g.slice(5)); setTimeout(done, 420); return; }
  if(g==="set"){ if(H.sideOpen()) H.side(false); H.settings(null, true); setTimeout(done, 420); return; }
  if(g.indexOf("set:")===0){ if(H.sideOpen()) H.side(false); H.settings(g.slice(4)); setTimeout(done, 700); return; }
  done();
}
var tgt=null;
function place(){
  if(!R) return; var b=R.bub, h=R.hole, vw=window.innerWidth, vh=window.innerHeight;
  if(tgt && vis(tgt)){ var r=tgt.getBoundingClientRect(), pad=6, big=r.height>vh*0.6;
    var top=Math.max(4, r.top-pad), left=Math.max(4, r.left-pad), bot=Math.min(vh-4, r.bottom+pad), right=Math.min(vw-4, r.right+pad);
    h.style.cssText="top:"+top+"px;left:"+left+"px;width:"+(right-left)+"px;height:"+(bot-top)+"px"; h.classList.remove("none");
    b.style.maxWidth=Math.min(360, vw-24)+"px"; var bh=b.offsetHeight, bw=b.offsetWidth;
    var y; if(big) y=vh-bh-18; else if(bot+bh+14<vh) y=bot+10; else if(top-bh-14>0) y=top-bh-10; else y=vh-bh-18;
    var x=Math.min(vw-bw-12, Math.max(12, (r.left+r.right)/2-bw/2));
    b.style.top=y+"px"; b.style.left=x+"px"; b.classList.toggle("over", big);
  } else { h.classList.add("none"); h.style.cssText=""; b.style.maxWidth=Math.min(380, vw-24)+"px"; b.style.top=Math.max(16,(vh-b.offsetHeight)/2)+"px"; b.style.left=Math.max(12,(vw-b.offsetWidth)/2)+"px"; b.classList.remove("over"); }
}
function shareImg(){
  var src=[["Facebook","#1877F2","f"],["TikTok","#111","♪"],["Instagram","#D62976","◎"],["YouTube","#E62117","▶"],["Threads","#000","@"]];
  return '<div class="trShare" aria-label="Share to My Ihsan Recipe"><div class="trSrc">'+src.map(function(s){ return '<span><i style="background:'+s[1]+'">'+s[2]+'</i><small>'+s[0]+'</small></span>'; }).join("")+'</div>'+
    '<div class="trArrow">'+L("Kongsi","Share")+' ⤵</div><div class="trSheet"><img src="logo.svg" alt=""><b>My Ihsan Recipe</b></div></div>'; }
function show(){
  var s=cur.list[cur.i]; if(!s){ finish(); return; }
  var st=ld(); st.mode=cur.mode; st.step=s.id; st.paused=false; st.seen=st.seen||{}; st.p=st.p||{}; var pp=st.p[cur.mode]=st.p[cur.mode]||{}; pp.step=s.id; pp.max=Math.max(pp.max||0, cur.i); sv(st);
  ui(); document.body.classList.add("touring"); var b=R.bub; b.classList.add("busy");
  doGo(s.go, function(){
    if(!cur || cur.list[cur.i]!==s || !R) return;   // paused or moved on while the page was opening
    tgt=find(s.el);
    var sc=tgt && tgt.id!=="view" && tgt.id!=="side" && tgt.id!=="setp" ? tgt : null;
    if(sc && sc.scrollIntoView){ var r=sc.getBoundingClientRect(); if(r.top<70 || r.bottom>window.innerHeight-150) sc.scrollIntoView({block:"center", behavior:"auto"}); }
    var n=cur.i+1, tot=cur.list.length, last=cur.i===cur.list.length-1, tap=s.f.indexOf("tap")>=0 && tgt, scr=s.f.indexOf("scroll")>=0;
        b.innerHTML='<div class="trCh">'+chName(s.ch)+'</div>'+
      '<div class="trTx">'+H.esc(L(s.ms,s.en))+'</div>'+(s.f.indexOf("img:share")>=0?shareImg():'')+
      '<div class="trBar"><i style="width:'+Math.round(n*100/tot)+'%"></i></div>'+
      '<div class="trBtns"><button class="trB" data-t="back"'+(cur.i?'':' disabled')+' aria-label="'+L("Kembali","Back")+'">‹</button>'+
      '<span class="trN">'+L("Langkah ","Step ")+n+' / '+tot+'</span>'+
      '<button class="trB" data-t="pause" aria-label="'+L("Jeda","Pause")+'">❚❚</button><button class="trB" data-t="exit" aria-label="'+L("Keluar","Exit")+'">✕</button>'+
      (last ? endBtns() : (tap?'<button class="trB" data-t="next">'+L("Langkau","Skip")+' ›</button>':'<button class="trB go" data-t="next">'+L("Seterusnya","Next")+' ›</button>'))+'</div>';
    b.querySelectorAll("[data-t]").forEach(function(x){ x.onclick=function(e){ e.stopPropagation(); act(x.getAttribute("data-t")); }; });
    R.blk.classList.toggle("pass", !!tap);
    if(tap){ var once=function(){ tgt.removeEventListener("click", once, true); setTimeout(function(){ if(cur && cur.list[cur.i]===s) act("next"); }, 450); }; tgt.addEventListener("click", once, true); R.hole.classList.add("pulse"); } else R.hole.classList.remove("pulse");
    b.classList.remove("busy"); setTimeout(place, 30); window.removeEventListener("resize", place); window.addEventListener("resize", place);
    if(scr){ var v=document.getElementById("view"); if(v){ var nb=b.querySelector('[data-t="next"]'); if(nb) nb.style.display="none"; var y0=v.scrollTop, end=v.scrollHeight-v.clientHeight, t0=0, reduce=window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      var stepF=function(ts){ if(!cur || cur.list[cur.i]!==s) return; if(!t0) t0=ts; var k=reduce?1:Math.min(1,(ts-t0)/2600); v.scrollTop=y0+(end-y0)*(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2); if(k<1) requestAnimationFrame(stepF); else { if(nb) nb.style.display=""; setTimeout(function(){ v.scrollTo({top:0, behavior:reduce?"auto":"smooth"}); }, 900); } };
      requestAnimationFrame(stepF); } }
  });
}
function endBtns(){
  if(cur.mode==="quick") return '<button class="trB" data-t="done">'+L("Nanti","Later")+'</button><button class="trB go" data-t="l1">▶ '+L("Pelajaran 1","Lesson 1")+'</button>';
  return '<button class="trB" data-t="hub">📚 '+L("Semua pelajaran","All lessons")+'</button><button class="trB go" data-t="done">'+L("Siap","Done")+' ✓</button>';
}
function act(a){
  if(!cur) return;
  if(a==="next"){ markSeen(cur.list[cur.i].id); cur.i++; if(cur.i>=cur.list.length) finish(); else show(); return; }
  if(a==="back"){ if(cur.i>0){ cur.i--; show(); } return; }
  if(a==="pause"){ pause(); return; }
  if(a==="exit"){ stop(); return; }
  if(a==="l1"){ markSeen(cur.list[cur.i].id); finish(true); start("l1"); return; }
  if(a==="hub"){ markSeen(cur.list[cur.i].id); finish(true); H.settings("sandaran"); return; }
  if(a==="done"){ markSeen(cur.list[cur.i].id); finish(); return; }
}
function markSeen(id){ var st=ld(); st.seen=st.seen||{}; st.seen[id]=1; sv(st); }
function finish(quiet){ var st=ld(); if(cur){ st.p=st.p||{}; st.p[cur.mode]={done:1}; st.done=st.done||{}; st.done[cur.mode]=1; } st.step=null; st.paused=false; st.mode=null; sv(st);
  var m=cur&&cur.mode; cur=null; tgt=null; teardown(); chip(); if(!quiet) H.toast(m==="quick" ? L("Mula Pantas selesai","Quick Start finished") : L("Pelajaran selesai ✓","Lesson finished ✓")); }
function pause(){ var st=ld(); st.paused=true; sv(st); cur=null; tgt=null; teardown(); chip(); }
// ✕ stops the lesson but keeps its place: ▶ Continue on its card picks it up again
function stop(){ var st=ld(); st.step=null; st.paused=false; st.mode=null; sv(st); cur=null; tgt=null; teardown(); chip(); H.toast(L("Dihentikan. Sambung dari Tetapan › Lawatan","Stopped. Continue from Settings › Tours")); }
function start(mode, fromId){
  if(H.S.kidLock || H.S.appLock){ H.toast(L("Buka kunci aplikasi dahulu","Unlock the app first")); return; }
  var list=listFor(mode), i=0; if(!list.length) return;
  if(fromId){ for(var k=0;k<list.length;k++) if(list[k].id===fromId){ i=k; break; } }
  var st=ld(); st.p=st.p||{}; if(!fromId || !st.p[mode]) st.p[mode]=st.p[mode]&&!st.p[mode].done ? st.p[mode] : {}; sv(st);
  cur={mode:mode, list:list, i:i}; chip(); show();
}
function resume(){ var st=ld(); if(st.mode && st.step) start(st.mode, st.step); }
function cont(mode){ var st=ld(), p=(st.p||{})[mode]; if(p && p.step && !p.done) start(mode, p.step); else { st.p=st.p||{}; st.p[mode]={}; sv(st); start(mode); } }
function paused(){ var st=ld(); if(!st.mode || !st.step) return null; var l=listFor(st.mode), i=0; for(var k=0;k<l.length;k++) if(l[k].id===st.step){ i=k; break; } return {mode:st.mode, n:i+1, tot:l.length}; }
function prog(mode){ var st=ld(), p=(st.p||{})[mode]||{}, tot=listFor(mode).length; if(p.done) return {n:tot, tot:tot, done:true, on:false};
  var l=listFor(mode), i=-1; for(var k=0;k<l.length;k++) if(l[k].id===p.step){ i=k; break; } return {n:Math.max(0,i), tot:tot, done:false, on:i>=0}; }
function chName(id){ var c=CH.filter(function(x){ return x[0]===id; })[0]; if(!c) return ""; var n=LESSONS.indexOf(id); return c[1]+" "+(n>=0 ? L("Pelajaran ","Lesson ")+(n+1)+" · " : "")+L(c[2],c[3]); }
// the ▶ chip above the dock while a lesson is paused; long-press stops it
function chip(){
  var c=document.getElementById("tourChip"), p=cur?null:paused();
  if(!p || H.S.kidLock){ if(c) c.parentNode.removeChild(c); return; }
  if(!c){ c=document.createElement("button"); c.id="tourChip"; document.body.appendChild(c);
    var t=0, lp=false; c.addEventListener("pointerdown", function(){ lp=false; t=setTimeout(function(){ lp=true; var st=ld(); st.step=null; st.mode=null; st.paused=false; sv(st); chip(); H.toast(L("Dihentikan. Sambung dari Tetapan › Lawatan","Stopped. Continue from Settings › Tours")); }, 700); });
    c.addEventListener("pointerup", function(){ clearTimeout(t); }); c.addEventListener("pointerleave", function(){ clearTimeout(t); });
    c.addEventListener("click", function(){ if(lp) return; resume(); }); }
  var ch=CH.filter(function(x){ return x[0]===p.mode; })[0];
  c.textContent="▶ "+(ch?L(ch[2],ch[3]):L("Sambung","Continue"))+" · "+p.n+"/"+p.tot;
}
function ring(n, tot, done){ var r=15, C=2*Math.PI*r, f=tot?n/tot:0;
  return '<svg class="trRing" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="'+r+'" class="bg"/><circle cx="18" cy="18" r="'+r+'" class="fg" stroke-dasharray="'+(C*f).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 18 18)"/>'+
    '<text x="18" y="22" text-anchor="middle">'+(done?'✓':n+'/'+tot)+'</text></svg>'; }
// Settings › Backup & about › Tours: the Quick Start and a card per lesson, any order
function card(el){
  var p=paused(), doneN=LESSONS.filter(function(id){ return prog(id).done; }).length;
  var row=function(c, i){ var g=prog(c[0]), lab=i>=0 ? L("Pelajaran ","Lesson ")+(i+1) : L("Mula","Start");
    return '<div class="trLes'+(g.done?' done':'')+'">'+ring(g.n, g.tot, g.done)+'<div class="trLesT"><div class="tiny mut">'+lab+' · '+g.tot+L(" langkah"," steps")+' · ~'+c[4]+L(" min"," min")+'</div><b>'+c[1]+' '+H.esc(L(c[2],c[3]))+'</b><div class="mut tiny">'+H.esc(L(c[5],c[6]))+'</div></div>'+
      '<div class="trLesB">'+(g.on?'<button class="btn g3d" data-tl="'+c[0]+'">▶ '+L("Sambung","Continue")+'</button><button class="chip" data-tr="'+c[0]+'" aria-label="'+L("Mula semula","Restart")+'">↺</button>':
        (g.done?'<button class="chip" data-tl="'+c[0]+'" aria-label="'+L("Ulang","Again")+'">↺</button>':'<button class="btn g3d" data-tl="'+c[0]+'">▶ '+L("Mula","Start")+'</button>'))+'</div></div>'; };
  el.innerHTML='<h3>📚 '+L("Lawatan & pelajaran","Tours & lessons")+'</h3><div class="mut small" style="margin-bottom:8px">'+L("Pilih mana-mana pelajaran, ikut susunan anda sendiri. Jeda atau berhenti bila-bila masa; ia sambung dari tempat anda berhenti.","Pick any lesson, in any order. Pause or stop any time; it continues where you left off.")+'</div>'+
    (p?'<button class="btn full g3d" data-tour="resume" style="margin-bottom:8px">▶ '+H.esc(chName(p.mode))+' · '+p.n+'/'+p.tot+'</button>':'')+
    row(CH[0], -1)+'<div class="tiny mut trLesH">'+L("10 pelajaran","10 lessons")+' · '+doneN+' / 10 ✓</div>'+CH.slice(1).map(function(c, i){ return row(c, i); }).join("")+
    '<div class="mut tiny" style="margin-top:8px"><a href="#" data-tour="reset">'+L("Set semula semua kemajuan","Reset all progress")+'</a></div>';
  el.querySelectorAll("[data-tl]").forEach(function(b){ b.onclick=function(){ var m=b.getAttribute("data-tl"); if(prog(m).done){ var st=ld(); st.p=st.p||{}; st.p[m]={}; sv(st); } cont(m); }; });
  el.querySelectorAll("[data-tr]").forEach(function(b){ b.onclick=function(){ var m=b.getAttribute("data-tr"), st=ld(); st.p=st.p||{}; st.p[m]={}; sv(st); start(m); }; });
  el.querySelectorAll("[data-tour]").forEach(function(b){ b.onclick=function(e){ e.preventDefault(); var a=b.getAttribute("data-tour");
    if(a==="reset"){ var st=ld(); sv({homeX:st.homeX}); chip(); card(el); return; }
    if(a==="resume") resume(); }; });
}
// the choice at the end of the first-install welcome screens
function choiceHtml(){ var c=counts();
  return '<div class="trChoice"><div class="small" style="margin:6px 0 8px">'+L("Mahu kenali aplikasi dalam 2 minit? Jeda bila-bila masa.","Want a 2-minute look around? You can pause any time.")+'</div>'+
    '<button class="btn full g3d" data-obtour="quick">⚡ '+L("Mula Pantas","Quick Start")+' · '+c.quick+L(" langkah"," steps")+'</button>'+
    '<div class="mut tiny" style="margin-top:6px">'+L("10 pelajaran lagi menunggu dalam Tetapan › Sandaran & perihal › Lawatan.","10 more lessons wait in Settings › Backup & about › Tours.")+'</div></div>'; }
// a "Lessons n/10" card on Home until all 10 are done or the card is closed
function homeCard(){ var st=ld(); if(st.homeX || paused()) return ""; var doneN=LESSONS.filter(function(id){ return prog(id).done; }).length; if(doneN>=10) return "";
  var q=prog("quick").done;
  return '<div class="card trHome" id="trHome"><button class="trX" data-trhx aria-label="✕">✕</button><h3>📚 '+L("Kenali My Ihsan","Get to know My Ihsan")+'</h3><div class="mut small">'+
    (q ? L("Pelajaran ","Lessons ")+doneN+' / 10 ✓ · '+L("pilih mana-mana, 3 minit setiap satu.","pick any, about 3 minutes each.") : L("Mula Pantas 2 minit, kemudian 10 pelajaran ringkas.","A 2-minute Quick Start, then 10 short lessons."))+'</div>'+
    '<div class="btns" style="margin-top:8px">'+(q?'':'<button class="btn g3d" data-trh="quick">⚡ '+L("Mula Pantas","Quick Start")+'</button>')+'<button class="btn'+(q?'':' alt')+' g3d" data-trh="hub">📚 '+L("Pelajaran","Lessons")+'</button></div></div>'; }
function homeBind(el){ var c=el.querySelector("#trHome"); if(!c) return;
  c.querySelectorAll("[data-trh]").forEach(function(b){ b.onclick=function(){ var m=b.getAttribute("data-trh"); if(m==="hub") H.settings("sandaran"); else start(m); }; });
  var x=c.querySelector("[data-trhx]"); if(x) x.onclick=function(){ var st=ld(); st.homeX=1; sv(st); c.parentNode.removeChild(c); }; }
// phone Back while a lesson is on screen = Pause
function back(){ if(cur && R){ pause(); return true; } return false; }

window.IhsanTour={init:function(h){ H=h; var st=ld(); if(st.mode && !CH.some(function(c){ return c[0]===st.mode; })){ st.mode=null; st.step=null; st.paused=false; sv(st); } chip(); }, start:start, resume:resume, cont:cont, hub:function(){ H.settings("sandaran"); }, back:back, card:card, choiceHtml:choiceHtml, homeCard:homeCard, homeBind:homeBind, chip:chip, counts:counts, prog:prog, active:function(){ return !!cur; },
  _steps:function(m){ return listFor(m||"complete"); }, _chapters:function(){ return CH.map(function(c){ return [c[0], c[1], c[2], c[3]]; }); }, _find:find, _lessons:LESSONS};
})();
