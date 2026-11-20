/* My Ihsan 0.37.0: Senaman (Kalendar › Senaman) data. 50 simple (90 since 0.2.0) cardio moves, warm-up and cool-down moves,
   three levels, ready-made routines and everyday activities with MET values.
   MET values are rounded from the Compendium of Physical Activities (Ainsworth et al., 2011 / 2024 update) and are estimates.
   Move record: [id, Malay name, English name, parts, level 1-3, MET, animation, low impact (1/0), Malay how-to, English how-to, prop]
   Parts: lengan arms, bahu shoulders, dada chest, perut core, belakang back, punggung glutes, paha thighs, betis calves. */
window.FIT_PARTS=[["lengan","💪","Lengan","Arms"],["bahu","🫱","Bahu","Shoulders"],["dada","🫁","Dada","Chest"],["perut","🎯","Perut & teras","Core"],
  ["belakang","🔙","Belakang","Back"],["punggung","🍑","Punggung","Glutes"],["paha","🦵","Paha","Thighs"],["betis","🦶","Betis","Calves"]];
window.FIT_LEVELS=[
  {id:1, ms:"Pemula", en:"Beginner", work:30, rest:30, rounds:2, tempo:0.8, metF:0.85, dms:"Gerakan perlahan dan impak rendah. 30 s gerak, 30 s rehat.", den:"Slow, low-impact moves. 30 s on, 30 s rest."},
  {id:2, ms:"Sederhana", en:"Intermediate", work:40, rest:20, rounds:3, tempo:1, metF:1, dms:"Lebih laju, sedikit lompatan. 40 s gerak, 20 s rehat.", den:"Faster, some jumps. 40 s on, 20 s rest."},
  {id:3, ms:"Mahir", en:"Advanced", work:45, rest:15, rounds:4, tempo:1.2, metF:1.1, dms:"Lompatan dan gerakan lantai. 45 s gerak, 15 s rehat.", den:"Jumps and floor moves. 45 s on, 15 s rest."}];
window.FIT_MOVES=[
 ["march","Jalan setempat","March in place",["paha","betis"],1,3.5,"march",1,"Angkat lutut bergilir sambil hayun tangan. Tegakkan badan.","Lift each knee in turn and swing your arms. Stand tall."],
 ["jog","Joging setempat","Jog in place",["paha","betis"],2,7,"jog",0,"Lari kecil di tempat, mendarat di hujung kaki dengan lembut.","Run lightly on the spot, landing softly on the balls of your feet."],
 ["highknee","Lutut tinggi","High knees",["paha","perut","betis"],2,8,"highknee",0,"Angkat lutut ke paras pinggang secara laju, tangan mengepam.","Drive the knees to hip height quickly, arms pumping."],
 ["sprint","Pecut setempat","Sprint in place",["paha","betis","lengan"],3,10,"sprint",0,"Lutut tinggi sepantas yang boleh, badan sedikit condong ke depan.","High knees as fast as you can, leaning slightly forward."],
 ["buttkick","Tendang punggung","Butt kicks",["paha","betis"],2,7,"buttkick",0,"Bengkokkan lutut sehingga tumit hampir menyentuh punggung, bergilir.","Bend each knee so the heel comes up towards the glutes, in turn."],
 ["stepjack","Jack langkah","Step jacks",["bahu","paha"],1,4.5,"stepjack",1,"Langkah sebelah kaki ke sisi sambil angkat tangan ke atas, tanpa lompat.","Step one foot out to the side as the arms go up, no jumping."],
 ["jack","Jumping jack","Jumping jacks",["bahu","paha","betis"],2,8,"jack",0,"Lompat buka kaki dan angkat tangan ke atas, kemudian rapatkan semula.","Jump the feet apart with arms overhead, then back together."],
 ["starjump","Lompat bintang","Star jumps",["bahu","paha","betis","punggung"],3,8.5,"starjump",0,"Cangkung sedikit, lompat tinggi dan buka tangan dan kaki seperti bintang.","Dip, jump high and spread arms and legs like a star."],
 ["sidestep","Langkah sisi","Side steps",["paha","punggung"],1,4,"sidestep",1,"Langkah ke kanan dan rapatkan kaki, kemudian ke kiri. Lutut sedikit bengkok.","Step right and bring the feet together, then left. Knees soft."],
 ["sideclap","Langkah sisi tepuk atas","Side step with overhead clap",["bahu","paha"],1,4.5,"sideclap",1,"Langkah ke sisi dan tepuk tangan di atas kepala pada setiap langkah.","Step to the side and clap overhead on each step."],
 ["heeltap","Ketuk tumit depan","Front heel taps",["paha","betis"],1,3.5,"heeltap",1,"Hulur tumit ke depan bergilir sambil tangan dihulur ke depan.","Tap each heel forward in turn as the arms reach forward."],
 ["toetap","Ketuk hujung kaki","Toe taps",["paha","betis"],1,4,"toetap",1,"Ketuk hujung kaki pada anak tangga atau buku tebal secara bergilir.","Tap each toe on a step or thick book, in turn.","step"],
 ["calfraise","Jengket","Calf raises",["betis"],1,3,"calfraise",1,"Naik ke hujung jari kaki perlahan-lahan, tahan sekejap, turun.","Rise onto your toes slowly, hold, lower."],
 ["squat","Cangkung","Squats",["paha","punggung"],1,5,"squat",1,"Kaki selebar bahu, tolak punggung ke belakang seperti duduk, lutut ikut arah jari kaki.","Feet shoulder-width, sit the hips back, knees follow the toes."],
 ["chairsquat","Duduk-bangun kerusi","Sit-to-stand",["paha","punggung"],1,3.5,"chairsquat",1,"Duduk perlahan di kerusi dan bangun semula tanpa guna tangan. Sesuai untuk warga emas.","Sit slowly onto a chair and stand up again without using your hands. Good for seniors.","chair"],
 ["squatpunch","Cangkung + tumbuk","Squat and punch",["paha","punggung","lengan"],2,6,"squatpunch",1,"Cangkung, bangun dan tumbuk ke depan kiri dan kanan.","Squat, stand up and punch forward left and right."],
 ["squatjump","Cangkung lompat","Squat jumps",["paha","punggung","betis"],3,8.5,"squatjump",0,"Cangkung, lompat ke atas, mendarat lembut terus ke cangkung.","Squat, jump up, land softly back into the squat."],
 ["lunge","Langkah belakang (lunge)","Reverse lunges",["paha","punggung"],1,4.5,"lunge",1,"Langkah sebelah kaki ke belakang dan turunkan lutut, kembali dan tukar.","Step one leg back and lower the knee, come back and switch."],
 ["lungetwist","Lunge + pusing","Lunge with twist",["paha","perut"],2,5,"lungetwist",1,"Dalam lunge, pusing badan ke arah kaki depan dengan tangan terhulur.","In the lunge, turn the chest towards the front leg, arms out."],
 ["lungejump","Lunge lompat","Jumping lunges",["paha","punggung","betis"],3,9,"lungejump",0,"Dari lunge, lompat dan tukar kaki di udara.","From a lunge, jump and switch legs in the air."],
 ["skater","Luncur sisi (skater)","Skaters",["punggung","paha"],2,7,"skater",0,"Lompat ke sisi atas sebelah kaki, kaki lain silang di belakang.","Leap sideways onto one foot, the other leg crossing behind."],
 ["lathop","Lompat sisi","Lateral hops",["betis","paha"],2,7,"lathop",0,"Lompat kecil kiri dan kanan dengan kedua-dua kaki rapat.","Small hops left and right with the feet together."],
 ["rope","Lompat tali tanpa tali","Invisible jump rope",["betis","bahu"],2,8,"rope",0,"Lompat kecil di hujung kaki sambil pusing pergelangan tangan.","Small bounces on the toes while circling the wrists."],
 ["tuckjump","Lompat lutut","Tuck jumps",["paha","perut","betis"],3,9,"tuckjump",0,"Lompat tinggi dan bawa kedua-dua lutut ke dada.","Jump high and bring both knees towards the chest."],
 ["frontkick","Tendang depan","Front kicks",["paha","perut"],2,5,"frontkick",1,"Angkat lutut dan luruskan kaki ke depan, bergilir. Tangan di depan muka.","Lift the knee and extend the leg forward, in turn. Hands guard the face."],
 ["sidekick","Tendang sisi","Side kicks",["punggung","paha"],2,5,"sidekick",1,"Angkat kaki ke sisi, badan condong sedikit ke arah lain.","Lift the leg out to the side, leaning slightly away."],
 ["kickback","Tendang belakang","Glute kickbacks",["punggung"],1,3.5,"kickback",1,"Condong sedikit, tolak sebelah kaki lurus ke belakang dan picit punggung.","Lean a little, push one leg straight back and squeeze the glutes."],
 ["kneeelbow","Lutut silang ke siku","Cross knee to elbow",["perut","paha"],1,4,"kneeelbow",1,"Tangan di belakang kepala, bawa siku ke lutut bertentangan.","Hands behind the head, bring each elbow to the opposite knee."],
 ["kneedrive","Tolak lutut pantas","Fast knee drives",["perut","paha"],2,6,"kneedrive",1,"Tarik tangan dari atas ke bawah sambil lutut naik, sebelah kaki 20 s.","Pull the arms down as the knee drives up, one side for 20 s."],
 ["punch","Tumbuk depan","Front punches",["lengan","bahu"],1,4,"punch",1,"Lutut lembut, tumbuk ke depan bergilir kiri dan kanan.","Knees soft, punch forward left and right in turn."],
 ["uppercut","Tumbuk ke atas (uppercut)","Uppercuts",["lengan","perut"],1,4.5,"uppercut",1,"Tumbuk dari bawah ke atas sambil pusing pinggang sedikit.","Punch upwards from below, turning the waist a little."],
 ["ohpunch","Tumbuk ke langit","Overhead punches",["bahu","lengan"],1,4.5,"ohpunch",1,"Tumbuk lurus ke atas kepala, bergilir.","Punch straight up overhead, in turn."],
 ["boxshuffle","Langkah peninju","Boxer shuffle",["lengan","betis","bahu"],2,7,"boxshuffle",0,"Lompat kecil bertukar kaki sambil jab dan tumbuk.","Bounce lightly from foot to foot with jabs and crosses."],
 ["armcircle","Bulatan lengan","Arm circles",["bahu"],1,3,"armcircle",1,"Depakan tangan dan buat bulatan kecil, kemudian tukar arah.","Arms out to the sides, make small circles, then reverse."],
 ["swim","Renang berdiri","Standing front crawl",["bahu","belakang"],1,3.5,"swim",1,"Pusing tangan bergilir seperti berenang gaya bebas.","Circle the arms in turn like front-crawl swimming."],
 ["pulldown","Tarik ke bawah","Standing pull-downs",["belakang","lengan"],1,3.5,"pulldown",1,"Tangan lurus ke atas, tarik siku ke bawah ke sisi rusuk dan picit belakang.","Arms up, pull the elbows down to the ribs and squeeze the back."],
 ["fly","Kepak dada","Chest flys",["dada","bahu"],1,3,"fly",1,"Depakan tangan, rapatkan di depan dada, kemudian buka semula.","Arms open wide, bring them together in front of the chest, open again."],
 ["wallpush","Tekan tubi dinding","Wall push-ups",["dada","lengan"],1,3.8,"wallpush",1,"Tangan di dinding, bengkok siku dan dekatkan dada ke dinding, tolak semula.","Hands on a wall, bend the elbows to bring the chest in, push back.","wall"],
 ["kneepush","Tekan tubi lutut","Knee push-ups",["dada","lengan","perut"],2,4,"kneepush",1,"Lutut di lantai, badan lurus dari lutut ke kepala, turun dan tolak.","Knees down, body straight from knees to head, lower and push up.","mat"],
 ["pushup","Tekan tubi","Push-ups",["dada","lengan","perut"],3,8,"pushup",1,"Badan lurus seperti papan, turunkan dada ke lantai dan tolak.","Body straight like a plank, lower the chest and push up.","mat"],
 ["twist","Pusing badan","Standing twists",["perut","belakang"],1,3.5,"twist",1,"Kaki tetap, pusing badan atas ke kiri dan kanan.","Feet still, turn the upper body left and right."],
 ["sidebend","Lentur sisi","Side bends",["perut"],1,2.8,"sidebend",1,"Sebelah tangan ke atas, lentur ke sisi bertentangan, bergilir.","One arm up, bend to the other side, in turn."],
 ["windmill","Kincir angin","Windmill toe touch",["perut","belakang"],1,4,"windmill",1,"Kaki lebar, tangan didepakan, sentuh kaki bertentangan, bergilir.","Feet wide, arms out, touch the opposite foot, in turn."],
 ["hipcircle","Pusing pinggul","Hip circles",["perut","punggung"],1,2.5,"hipcircle",1,"Tangan di pinggang, buat bulatan besar dengan pinggul.","Hands on hips, make big circles with the hips."],
 ["hinge","Tunduk pinggul","Hip hinges",["belakang","punggung"],1,3.5,"hinge",1,"Tangan di belakang kepala, tunduk dari pinggul dengan belakang lurus, bangun.","Hands behind the head, bow from the hips with a flat back, rise."],
 ["inchworm","Ulat bengkang","Inchworms",["belakang","bahu","perut"],2,4.5,"inchworm",1,"Tunduk, jalan tangan ke depan hingga papan, jalan balik dan berdiri.","Bend down, walk the hands out to a plank, walk back and stand.","mat"],
 ["climber","Pendaki gunung","Mountain climbers",["perut","bahu","paha"],3,8,"climber",0,"Dalam papan, tarik lutut ke dada bergilir dengan laju.","In a plank, drive the knees to the chest in turn, quickly.","mat"],
 ["plankjack","Plank jack","Plank jacks",["perut","bahu","paha"],3,7,"plankjack",0,"Dalam papan, lompat buka dan rapat kaki.","In a plank, jump the feet apart and together.","mat"],
 ["shtap","Papan sentuh bahu","Plank shoulder taps",["perut","bahu","dada"],2,5,"shtap",1,"Dalam papan, sentuh bahu bertentangan bergilir, pinggul tidak bergoyang.","In a plank, tap the opposite shoulder in turn, hips steady.","mat"],
 ["burpee","Burpee","Burpees",["lengan","dada","paha","perut"],3,8,"burpee",0,"Cangkung, tangan ke lantai, lompat ke papan, kembali dan lompat ke atas.","Squat, hands down, jump to a plank, come back and jump up.","mat"]
];
// 0.2.0: 40 more moves so every level has 30 (Pemula 25+5, Sederhana 16+14, Mahir 9+21)
window.FIT_MOVES=window.FIT_MOVES.concat([
 // Level 1 (+5)
 ["latraise","Angkat tangan ke sisi","Lateral arm raises",["bahu"],1,3,"latraise",1,"Tangan di sisi, angkat lurus ke paras bahu, tahan sekejap, turunkan perlahan.","Arms by your sides, lift them out to shoulder height, hold briefly, lower slowly."],
 ["frontraise","Angkat tangan ke depan","Front arm raises",["bahu","dada"],1,3,"frontraise",1,"Angkat kedua-dua tangan lurus ke depan hingga paras bahu, turunkan perlahan.","Raise both arms straight forward to shoulder height, lower slowly."],
 ["curl","Lipat lengan","Arm curls",["lengan"],1,3,"curl",1,"Siku rapat ke rusuk, lipat lengan ke bahu bergilir dan turunkan perlahan. Genggam botol air jika mahu.","Elbows close to the ribs, curl each hand towards the shoulder in turn and lower slowly. Hold a water bottle if you like."],
 ["legraise","Angkat kaki ke sisi","Side leg raises",["punggung","paha"],1,3.2,"legraise",1,"Tangan di pinggang, angkat sebelah kaki ke sisi dengan lutut lurus, turunkan, tukar.","Hands on hips, lift one leg out to the side with a straight knee, lower, switch."],
 ["sumo","Cangkung sumo","Sumo squats",["paha","punggung"],1,4.8,"sumo",1,"Kaki lebih lebar daripada bahu, jari kaki keluar sedikit. Turun lurus ke bawah dengan tangan bertaut di dada.","Feet wider than the shoulders, toes turned out a little. Lower straight down with hands clasped at the chest."],
 // Level 2 (+14)
 ["curtsy","Lunge silang (curtsy)","Curtsy lunges",["punggung","paha"],2,5,"curtsy",1,"Langkah sebelah kaki ke belakang dan silang ke sisi bertentangan, turunkan lutut, kembali dan tukar.","Step one leg back and across behind the other, lower the knee, return and switch."],
 ["pulsesquat","Cangkung denyut","Pulse squats",["paha","punggung"],2,5.5,"pulsesquat",1,"Turun ke cangkung dan kekal rendah, naik-turun sedikit dengan cepat.","Sink into a squat and stay low, then bob up and down a few centimetres."],
 ["sidelunge","Lunge sisi","Side lunges",["paha","punggung"],2,5,"sidelunge",1,"Langkah lebar ke sisi, bengkokkan satu lutut, tolak punggung ke belakang, kembali dan tukar.","Step wide to the side, bend one knee, push the hips back, return and switch."],
 ["crossjack","Jack silang","Cross jacks",["bahu","paha","betis"],2,7.5,"crossjack",0,"Lompat buka kaki sambil buka tangan, kemudian rapatkan kaki sambil silangkan tangan di depan dada.","Jump the feet apart as the arms open, then together as the arms cross in front of the chest."],
 ["jabcross","Jab-silang","Jab-cross combo",["lengan","bahu","perut"],2,6,"jabcross",1,"Lutut lembut, tumbuk jab dengan tangan depan dan silang dengan tangan belakang sambil pusing pinggul.","Knees soft, jab with the front hand and cross with the back hand, turning the hips."],
 ["hookpunch","Tumbuk kait","Hook punches",["lengan","perut","bahu"],2,5.5,"hookpunch",1,"Siku bengkok 90°, hayun lengan melintang ke dalam sambil pusing badan, bergilir.","Elbow bent 90°, swing the arm across in an arc as you turn the body, in turn."],
 ["standcrunch","Kerut sisi berdiri","Standing oblique crunch",["perut"],2,4.5,"standcrunch",1,"Tangan di belakang kepala, angkat lutut ke sisi dan lentur badan ke arahnya, bergilir.","Hands behind the head, lift a knee out to the side and bend the body towards it, in turn."],
 ["skihop","Lompat ski","Ski hops",["betis","paha","bahu"],2,7,"skihop",0,"Lompat ke kiri dan kanan dengan kaki rapat sambil hayun tangan ke depan seperti ski.","Hop left and right with the feet together, swinging the arms forward like skiing."],
 ["squattouch","Cangkung sentuh lantai","Squat to floor touch",["paha","punggung","belakang"],2,6,"squattouch",1,"Cangkung dan sentuh lantai dengan tangan, bangun sambil angkat tangan ke atas.","Squat and touch the floor with your hands, stand up and reach overhead."],
 ["reachlunge","Lunge capai atas","Lunge with overhead reach",["paha","punggung","bahu"],2,5,"reachlunge",1,"Lunge ke belakang sambil angkat kedua-dua tangan ke atas, kembali dan tukar.","Reverse lunge as both arms reach overhead, return and switch."],
 ["lungekick","Lunge + tendang","Lunge to front kick",["paha","punggung","perut"],2,6,"lungekick",1,"Langkah ke belakang dalam lunge, kemudian bawa kaki itu ke depan dengan tendangan. Tukar.","Step back into a lunge, then swing that leg forward in a kick. Switch."],
 ["fastfeet","Kaki pantas","Fast feet",["betis","paha"],2,7.5,"fastfeet",0,"Lutut lembut, badan condong sedikit, langkah kecil sepantas mungkin di hujung kaki.","Knees soft, lean slightly, tiny steps as fast as you can on the balls of your feet."],
 ["kneeraiseside","Angkat lutut ke sisi","Lateral knee raises",["perut","punggung","paha"],2,4.5,"kneeraiseside",1,"Tangan di pinggang, angkat lutut ke sisi hingga paras pinggang, turunkan, tukar.","Hands on hips, lift a knee out to the side to hip height, lower, switch."],
 ["twistjack","Jack pusing","Twisting jacks",["perut","paha","betis"],2,7,"twistjack",0,"Lompat buka dan rapat kaki sambil tangan bertaut di depan dan badan berpusing kiri-kanan.","Jump the feet apart and together with hands clasped in front, turning the body left and right."],
 // Level 3 (+21)
 ["frogjump","Lompat katak","Frog jumps",["paha","punggung","betis"],3,9,"frogjump",0,"Cangkung dalam dengan lutut keluar dan tangan di antara kaki, lompat ke atas, mendarat lembut.","Deep squat with the knees out and hands between the feet, jump up, land softly."],
 ["sumojump","Cangkung sumo lompat","Sumo squat jumps",["paha","punggung","betis"],3,8.5,"sumojump",0,"Kaki lebar, cangkung dalam, lompat lurus ke atas dan mendarat semula dalam cangkung lebar.","Wide stance, deep squat, jump straight up and land back in the wide squat."],
 ["plyoskater","Luncur sisi tinggi","Plyo skaters",["punggung","paha","betis"],3,9,"plyoskater",0,"Seperti luncur sisi tetapi lompat lebih jauh dan lebih tinggi, mendarat dengan satu kaki.","Like skaters but with a bigger, higher leap, landing on one foot."],
 ["squatstar","Bintang cangkung","Squat to star jump",["paha","punggung","bahu"],3,9,"squatstar",0,"Cangkung dalam dengan tangan di dada, lompat tinggi sambil buka tangan dan kaki seperti bintang.","Deep squat with hands at the chest, explode into a star jump."],
 ["burpeepush","Burpee + tekan tubi","Burpee with push-up",["dada","lengan","paha","perut"],3,10,"burpeepush",0,"Burpee, tambah satu tekan tubi di bawah papan sebelum bangun dan lompat.","A burpee with one push-up in the plank before you stand and jump."],
 ["burpeetuck","Burpee lompat lutut","Burpee with tuck jump",["lengan","paha","perut","betis"],3,10.5,"burpeetuck",0,"Burpee, kemudian lompat dan bawa lutut ke dada.","A burpee finished with a jump and the knees pulled to the chest."],
 ["climbercross","Pendaki silang","Cross-body climbers",["perut","bahu","paha"],3,8.5,"climbercross",0,"Dalam papan, bawa lutut ke siku bertentangan bergilir dengan laju.","In a plank, drive each knee to the opposite elbow in turn, quickly.","mat"],
 ["spiderman","Papan lelabah","Spider-man plank",["perut","bahu","paha"],3,8,"spiderman",0,"Dalam papan, bawa lutut ke siku sebelah yang sama, bergilir. Pinggul rendah.","In a plank, bring each knee out to the elbow on the same side, in turn. Keep the hips low.","mat"],
 ["pushuptap","Tekan tubi + sentuh bahu","Push-up with shoulder tap",["dada","lengan","perut","bahu"],3,8.5,"pushuptap",1,"Satu tekan tubi, kemudian sentuh bahu bertentangan dengan setiap tangan.","One push-up, then tap the opposite shoulder with each hand.","mat"],
 ["spinjump","Lompat pusing","Spin jumps",["paha","betis","perut"],3,8.5,"spinjump",0,"Cangkung sedikit, lompat dan pusing 180°, mendarat lembut. Pusing balik pada lompatan seterusnya.","Dip, jump and turn 180°, land softly. Turn back on the next jump."],
 ["sprawl","Sprawl","Sprawls",["lengan","dada","paha","perut"],3,8,"sprawl",1,"Cangkung, lontar kaki ke belakang ke papan, tarik kembali dan bangun tanpa lompat.","Squat, shoot the feet back to a plank, pull them in and stand without jumping.","mat"],
 ["squatkick","Cangkung + tendang sisi","Squat and side kick",["paha","punggung"],3,7,"squatkick",1,"Cangkung, bangun dan tendang ke sisi bergilir.","Squat, stand and kick out to the side, left and right."],
 ["hikneepunch","Lutut tinggi + tumbuk","High knees with punches",["perut","lengan","paha"],3,9,"hikneepunch",0,"Lutut tinggi pantas dengan tangan bertentangan menumbuk ke bawah setiap kali.","Fast high knees with the opposite arm punching down each time."],
 ["cossack","Cangkung kosak","Cossack squats",["paha","punggung"],3,6,"cossack",1,"Kaki sangat lebar, turun ke satu sisi dengan kaki lain lurus, kembali dan tukar.","A very wide stance, sink to one side with the other leg straight, return and switch."],
 ["rdl1","Tunduk satu kaki","Single-leg hinge",["punggung","belakang","paha"],3,5,"rdl1",1,"Berdiri atas satu kaki, tunduk dari pinggul sambil kaki lain naik ke belakang. Pegang dinding jika perlu.","Stand on one leg, hinge at the hips as the other leg lifts behind you. Hold a wall if needed."],
 ["pistol","Cangkung satu kaki","Assisted pistol squats",["paha","punggung"],3,7,"pistol",1,"Turun dengan satu kaki sementara kaki lain dihulur ke depan. Pegang dinding atau kerusi jika perlu.","Lower on one leg with the other held out in front. Hold a wall or chair if needed."],
 ["lungepunch","Lunge lompat + tumbuk","Jump lunges with punches",["paha","punggung","lengan"],3,9.5,"lungepunch",0,"Lunge lompat, tukar kaki di udara dan tumbuk dengan tangan bertentangan kaki depan.","Jump lunges, switch legs in the air and punch with the arm opposite the front leg."],
 ["sealjack","Jack anjing laut","Seal jacks",["dada","bahu","paha"],3,8,"sealjack",0,"Lompat buka kaki sambil buka tangan lurus ke sisi, rapatkan dan tepuk di depan.","Jump the feet apart as the arms open to the sides, then together as you clap in front."],
 ["powerskip","Langkau kuasa","Power skips",["paha","betis","bahu"],3,9,"powerskip",0,"Langkah besar dengan lutut tinggi dan hayun tangan bertentangan, melambung sedikit setiap langkah.","Big strides with a high knee and opposite arm swing, springing off the floor each step."],
 ["bearcrawl","Merangkak beruang","Bear crawl",["perut","bahu","paha"],3,7.5,"bearcrawl",1,"Tangan dan hujung kaki di lantai, lutut melayang 5 cm, gerakkan tangan dan kaki bertentangan bergilir.","Hands and toes on the floor, knees hovering a hand's width up, move opposite hand and foot in turn.","mat"],
 ["jacksquat","Jack + cangkung","Jack to squat",["paha","punggung","bahu"],3,8,"jacksquat",0,"Satu jumping jack, kemudian satu cangkung dalam. Ulang.","One jumping jack, then one deep squat. Repeat."]
]);
// warm-up and cool-down (not counted in the 90)
window.FIT_WARM=[
 ["w_march","Jalan setempat perlahan","Easy march",["paha"],1,3,"march",1,"Panaskan badan: jalan setempat dan tarik nafas dalam.","Warm up: march gently and breathe deeply."],
 ["w_arm","Bulatan lengan","Arm circles",["bahu"],1,3,"armcircle",1,"Bulatan kecil ke depan dan ke belakang.","Small circles forwards and backwards."],
 ["w_twist","Pusing badan perlahan","Easy twists",["perut"],1,3,"twist",1,"Pusing perlahan untuk longgarkan pinggang.","Turn slowly to loosen the waist."]];
window.FIT_COOL=[
 ["c_breath","Nafas dalam, tangan ke atas","Deep breath, arms up",["bahu"],1,2,"breath",1,"Angkat tangan sambil tarik nafas, turunkan sambil hembus.","Raise the arms breathing in, lower them breathing out."],
 ["c_side","Regangan sisi","Side stretch",["perut"],1,2,"sidestretch",1,"Lentur perlahan ke sisi dan tahan.","Lean slowly to each side and hold."],
 ["c_quad","Regangan paha","Thigh stretch",["paha"],1,2,"quad",1,"Pegang buku lali di belakang, lutut rapat. Pegang dinding jika perlu.","Hold the ankle behind you, knees together. Hold a wall if needed."],
 ["c_arm","Regangan lengan silang","Cross-arm stretch",["bahu","lengan"],1,2,"armx",1,"Tarik sebelah tangan merentasi dada, tukar.","Pull one arm across the chest, switch."]];
// ready-made routines: [id, icon, Malay, English, Malay note, English note, level, work s, rest s, rounds, rest between rounds s, warm-up, cool-down, moves]
window.FIT_ROUTINES=[
 ["r_pagi","🌅","Segar lepas Subuh","After-Subuh wake-up","Ringan 9 minit untuk mula hari.","A light 9 minutes to start the day.",1,30,15,1,0,1,1,["march","armcircle","stepjack","squat","twist","calfraise","punch","heeltap"]],
 ["r_7min","⏱","7 minit kardio","7-minute cardio","Gaya 7 minit klasik, versi berdiri.","The classic 7-minute style, standing version.",2,30,10,1,0,0,0,["jack","wallpush","squat","highknee","lunge","punch","kneeelbow","skater","twist","buttkick","sidestep","jog"]],
 ["r_tabata","🔥","Tabata","Tabata","8 × (20 s sekuat hati, 10 s rehat) = 4 minit, dengan panas dan sejuk badan.","8 × (20 s all out, 10 s rest) = 4 minutes, with warm-up and cool-down.",3,20,10,2,10,1,1,["highknee","squatjump","climber","jack"]],
 ["r_hiit15","⚡","HIIT bakar lemak 15","Fat-burn HIIT 15","Selang laju dan rehat, 3 pusingan.","Fast intervals and rest, 3 rounds.",3,40,20,3,45,1,1,["burpee","skater","tuckjump","plankjack","lungejump"]],
 ["r_low20","🚶","Kardio impak rendah 20","Low-impact cardio 20","Tiada lompatan, mesra lutut dan jiran bawah.","No jumping, kind to knees and downstairs neighbours.",1,40,20,3,40,1,1,["march","stepjack","sideclap","squatpunch","kneeelbow","toetap"]],
 ["r_core","🎯","Perut & teras 12","Core 12","Fokus pinggang dan perut.","Focus on the waist and tummy.",2,40,20,2,30,1,1,["kneeelbow","twist","windmill","shtap","kneedrive","sidebend"]],
 ["r_legs","🦵","Kaki & punggung 15","Legs & glutes 15","Cangkung, lunge dan tendang.","Squats, lunges and kicks.",2,40,20,3,40,1,1,["squat","lunge","kickback","sidekick","calfraise"]],
 ["r_upper","💪","Badan atas 10","Upper body 10","Lengan, bahu, dada dan belakang.","Arms, shoulders, chest and back.",1,30,20,2,30,1,1,["punch","ohpunch","fly","wallpush","pulldown","swim"]],
 ["r_senior","🧓","Warga emas & pemulihan","Seniors & easy recovery","Perlahan, ada kerusi, tiada lompatan.","Slow, with a chair, no jumping.",1,30,30,2,60,1,1,["march","chairsquat","heeltap","armcircle","calfraise","punch"]],
 ["r_office","💼","Rehat pejabat 5","Office break 5","Di sebelah meja, tanpa peluh banyak.","Next to your desk, without much sweat.",1,30,10,1,0,0,0,["march","armcircle","twist","calfraise","chairsquat","sidebend","pulldown"]],
 ["r_tarawih","🌙","Ringan lepas tarawih","Light after tarawih","Untuk bulan puasa: ringan, jaga air.","For Ramadan: light, mind your water.",1,30,30,2,45,1,1,["march","stepjack","squat","punch","kickback","twist"]],
 ["r_box","🥊","Kardio tinju 15","Boxing cardio 15","Jab, uppercut dan langkah peninju.","Jabs, uppercuts and the boxer shuffle.",2,45,15,3,40,1,1,["boxshuffle","punch","uppercut","frontkick","ohpunch"]]
];
// everyday activities for the manual log: [id, icon, Malay, English, MET]
window.FIT_ACT=[
 ["walk","🚶","Berjalan santai","Easy walk",3.5],["bwalk","🚶‍♂️","Jalan laju","Brisk walk",5],["run","🏃","Berlari","Running",9.8],["jogx","🏃‍♀️","Joging","Jogging",7],
 ["cycle","🚴","Berbasikal","Cycling",7.5],["swimx","🏊","Berenang","Swimming",6],["badminton","🏸","Badminton","Badminton",5.5],["futsal","⚽","Futsal / bola sepak","Futsal / football",7],
 ["takraw","🏐","Sepak takraw / bola tampar","Sepak takraw / volleyball",4],["pingpong","🏓","Ping pong","Table tennis",4],["hike","⛰","Mendaki bukit","Hiking",6],
 ["aerobic","🤸","Senamrobik","Aerobics",6.5],["silat","🥋","Silat / seni bela diri","Silat / martial arts",6],["archery","🏹","Memanah","Archery",4.3],["horse","🐎","Menunggang kuda","Horse riding",5.5],
 ["weights","🏋","Angkat berat","Weight training",5],["stretch","🧘","Regangan","Stretching",2.3],["stairs","🪜","Panjat tangga","Climbing stairs",8],
 ["garden","🌱","Berkebun","Gardening",3.8],["house","🧹","Kerja rumah","Housework",3.3],["play","🧒","Main dengan anak","Playing with children",4],["tawaf","🕋","Tawaf / sa'ie (berjalan)","Tawaf / sa'i (walking)",3.5]];
// badges: [id, icon, Malay, English, test(stats)]
window.FIT_BADGES=[
 ["b1","🌱","Langkah pertama","First step",function(s){ return s.n>=1; }],
 ["b5","⭐","5 sesi","5 sessions",function(s){ return s.n>=5; }],
 ["b20","🌟","20 sesi","20 sessions",function(s){ return s.n>=20; }],
 ["b50","🏅","50 sesi","50 sessions",function(s){ return s.n>=50; }],
 ["s3","🔥","3 hari berturut","3-day streak",function(s){ return s.best>=3; }],
 ["s7","🔥","7 hari berturut","7-day streak",function(s){ return s.best>=7; }],
 ["s30","🏆","30 hari berturut","30-day streak",function(s){ return s.best>=30; }],
 ["k1","💥","1,000 kcal","1,000 kcal",function(s){ return s.kcal>=1000; }],
 ["k10","☄","10,000 kcal","10,000 kcal",function(s){ return s.kcal>=10000; }],
 ["w150","❤️","150 minit seminggu","150 minutes in a week",function(s){ return s.bestWeek>=150; }],
 ["h10","⏳","10 jam bersenam","10 hours of exercise",function(s){ return s.min>=600; }]];
