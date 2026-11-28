/* My Ihsan 0.7.93 (owner pick #25): Learn › Explore › 🕰 Islamic history timeline. 3D pixel-art scenes: thousands of little blocks fly in
   to rebuild each scene (mosques, walls, ships, banners, camels…), from the first revelation to 1924, with the great conquests and the Malay world.
   No people are drawn (no figures of the Prophet ﷺ, Companions or anyone): armies are shown by banners, tents, horses and ships.
   Each event has a short note and a question. Progress: ihsan_hist {seen:{i:1}, q:{i:1}}. Hist.open(H) · Hist._t for tests. */
(function(){ "use strict";
var H = null, T = null;
// ---------- pixel templates: rows top→bottom, "." empty; letters are palette keys ----------
var PAL = {W:"#f1e9d8", w:"#d9cdb4", S:"#c9b48a", s:"#a88f5e", G:"#e6b941", g:"#b8892a", B:"#2f6fb8", b:"#7fb6e6", T:"#2d9a8a", R:"#b5463c", r:"#e0705f", K:"#1c1c1c", k:"#4a4a4a", N:"#6b4a2b", n:"#8f6a3e", L:"#3f8f3f", l:"#7cc36a", Y:"#ffd85a", O:"#e88a3a", P:"#7a4fb0", V:"#8a8f99", v:"#c4c8d0", X:"#ffffff", Z:"#0d2a4a", C:"#3c2a1a", M:"#7f7465", m:"#a59a8a", Q:"#2b5c2b"};
var TPL = {
 dome: ["....YY....","...GGGG...","..GGGGGG..",".GGGGGGGG.",".GGGGGGGG.","WWWWWWWWWW","WWBWWWWBWW","WWBWWWWBWW","WWWWNNWWWW","WWWWNNWWWW"],
 bdome: ["....YY....","...bbbb...","..bBBBBb..",".bBBBBBBb.",".BBBBBBBB.","vvvvvvvvvv","vvBvvvvBvv","vvBvvvvBvv","vvvvKKvvvv","vvvvKKvvvv"],
 minaret: ["..Y..",".GGG.","..W..","..W..","WWWWW","..W..","..W..","..W..","..W..","..W..",".WWW.",".WWW."],
 pencil: ["..Y..","..v..",".vVv.",".vvv.","vvvvv",".vvv.",".vvv.",".vvv.",".vvv.",".vvv.",".vvv.",".vvv.",".vvv.",".vvv."],
 sqmin: ["SSS","SsS","SSS","SSS","SsS","SSS","SSS","SSS","SSS"],
 kaaba: ["KKKKKK","GGGGGG","KKKKKK","KKKKKK","KKKGKK","KKKKKK"],
 rock: [".....GGG.....","...GGGGGGG...","..GGGGGGGGG..","BBBBBBBBBBBBB","BbBbBbBbBbBbB","BBBBBBBBBBBBB","BBBBBNNBBBBBB"],
 wall: ["S.S.S.S.S.S.S.S","SSSSSSSSSSSSSSS","SSsSSSSSSSSSsSS","SSSSSSSSSSSSSSS","SSSSSS...SSSSSS","SSSSSS...SSSSSS","SSSSSS...SSSSSS"],
 tower: ["S.S.S","SSSSS","SsSsS","SSSSS","SSsSS","SSSSS","SSSSS","SSSSS"],
 round: ["..SSSSSSS..",".SS.....SS.","SS..GGG..SS","S...GGG...S","SS.......SS",".SS.....SS.","..SSSSSSS.."],
 palm: ["L.L.L","LLLLL",".LLL.","..N..","..N..","..N..","..N..","..N.."],
 olive: [".lLl.","lLLLl","LlLlL",".lLl.","..N..","..N.."],
 tent: ["...R...","..RRR..",".RRrRR.","RRRrRRR","RRK.KRR"],
 tentw: ["...W...","..WWW..",".WWwWW.","WWWwWWW","WWK.KWW"],
 banner: ["RRRR.","RRRR.","RRRR.","N....","N....","N....","N...."],
 camel: ["..n.......","..nn..nn..","...nnnnnn.","...nnnnnnn","...n.n.n.n","...n.n.n.n"],
 horse: ["nn........","nnn.......",".nnnnnnn..",".nnnnnnnn.","..n.n.n.n.","..n.n.n.n."],
 ship: ["....X....","...XXX...","..XXXXX..","....N....","....N....","NNNNNNNNN",".NnNnNnN.","..NNNNN.."],
 cannon: ["...kkk","kkkkkK","kkkkk.",".N.N..","NNNNN."],
 mount: [".....M.....","....MMM....","...MMmMM...","..MMMMMmM..",".MMmMMMMMM.","MMMMMMMMmMM"],
 hill: ["....s....","..sssss..",".sssSsss.","sssssssss"],
 pyramid: [".....S.....","....SSS....","...SSsSS...","..SSSSSSS..",".SSSsSSSSS.","SSSSSSSSSSS"],
 cave: [".MMMMMM.","MMMMMMMM","MM.KK.MM","MM.KK.MM","MMMMMMMM"],
 moon: [".YY..","Y....","Y....","Y....",".YY.."],
 star: [".Y.","YYY",".Y."],
 sun: [".OOO.","OYYYO","OYYYO","OYYYO",".OOO."],
 book: ["RRRRR","RXXXR","RXXXR","RRRRR"],
 astro: [".GGG.","G.G.G","GGGGG","G.G.G",".GGG."],
 arches: ["RWRWRWRWRWR","W.R.W.R.W.R","R.W.R.W.R.W","W.R.W.R.W.R","S.S.S.S.S.S"],
 octo: ["....YY....","...GGGG...","..GGGGGG..","..GGGGGG..","BBBBBBBBBB","BTBTBTBTBT","BBBBBBBBBB","BTBBNNBBTB"],
 melaka: [".....R.....","....RRR....","...NNNNN...","..RRRRRRR..",".NNNNNNNNN.","RRRRRRRRRRR","..W.W.W.W..","..W.W.W.W..","..N.N.N.N.."],
 elephant: [".VVVVV....","VVVVVVV...","VVVVVVVVV.","VVVVVVVVVV","V.VV..VV.V","V.VV..VV.."],
 trench: ["CCCCCCCCCCCCCCC","CCCCCCCCCCCCCCC"],
 well: [".N.N.",".NNN.","S...S","SSSSS"],
 river: ["bbbbbbbbbbbbbbbbbbbb","BBBBBBBBBBBBBBBBBBBB","bbbbbbbbbbbbbbbbbbbb"],
 taj: ["....X....","...XXX...","..XXXXX..","..XXXXX..","XXXXXXXXX","XX.XXX.XX","XX.XXX.XX","XXXXXXXXX"],
 crescent: [".GG.","G...","G...",".GG."]};
var VS = 0.11; // template pixel size (each pixel is drawn as 2×2 blocks of VS/2)
// scene = {g: ground "sand"|"grass"|"sea"|"snow"|"rock", sky: "day"|"dusk"|"night", p:[[tpl, x, z, {c: colour swaps}, depth]]}
function band(c1, c2){ return {R: c1, r: c2 || c1}; }
var SC = {
 hira: {g: "rock", sky: "night", p: [["mount", -1, -1, null, 3], ["cave", -0.2, 0.3], ["star", -2, -2, null, 1], ["star", 1.6, -2.2, null, 1], ["star", 0.3, -2.6, null, 1], ["kaaba", 1.8, 1.2, null, 4]]},
 hijrah: {g: "sand", sky: "night", p: [["moon", -1.8, -2.4, null, 1], ["camel", -1.2, 0.4], ["camel", 0.2, 0.9], ["palm", 1.8, -0.4], ["palm", 2.4, 0.3], ["hill", -2.2, -0.8, null, 3], ["star", 1, -2.6, null, 1]]},
 badr: {g: "sand", sky: "day", p: [["well", -0.3, 0.2, null, 3], ["well", 0.6, 0.6, null, 3], ["banner", -1.8, 0, {c: band("#2d9a5b")}], ["tentw", -2.4, -0.8], ["banner", 2, 0, {c: band("#b5463c")}], ["tent", 2.4, -0.8], ["camel", -1.2, 1.1], ["horse", 1.2, 1.2]]},
 uhud: {g: "sand", sky: "day", p: [["mount", -0.6, -1.4, null, 3], ["hill", 1.8, -0.6, null, 2], ["banner", -0.6, 0.6, {c: band("#2d9a5b")}], ["banner", 0.8, 0.8, {c: band("#e6b941")}], ["tentw", -1.8, 0.4]]},
 khandaq: {g: "sand", sky: "dusk", p: [["trench", -0.8, 0.2, null, 3], ["trench", -0.8, 0.6, null, 3], ["tentw", -1.6, 1.4], ["banner", -0.4, 1.3, {c: band("#2d9a5b")}], ["tent", 1.6, -1.2], ["tent", -0.6, -1.4], ["horse", 0.6, -0.8], ["palm", 2.4, 1]]},
 hudaibiyah: {g: "sand", sky: "day", p: [["tentw", -1.2, 0], ["tentw", 0.2, -0.4], ["camel", 1.2, 0.6], ["palm", -2.2, -0.6], ["well", 0.6, 1.2, null, 3]]},
 khaibar: {g: "sand", sky: "day", p: [["wall", -0.8, -0.8, null, 3], ["tower", -1.8, -0.6, null, 3], ["tower", 1.2, -0.6, null, 3], ["palm", -2.4, 0.8], ["palm", 2.4, 0.6], ["banner", 0, 0.8, {c: band("#2d9a5b")}]]},
 makkah: {g: "sand", sky: "day", p: [["kaaba", -0.3, -0.2, null, 6], ["mount", -2.2, -1.8, null, 2], ["mount", 1.2, -2, null, 2], ["banner", -1.4, 0.8, {c: band("#2d9a5b")}], ["banner", 1.2, 0.8, {c: band("#ffffff", "#e6e6e6")}]]},
 wada: {g: "sand", sky: "dusk", p: [["hill", -0.4, -1, null, 3], ["tentw", -2, 0.4], ["tentw", -0.6, 0.8], ["tentw", 0.8, 0.6], ["tentw", 2, 0.2], ["sun", 2.2, -2.4, null, 1]]},
 yarmuk: {g: "grass", sky: "day", p: [["river", -1.1, 0.9, null, 2], ["banner", -1.8, -0.2, {c: band("#2d9a5b")}], ["horse", -1, -0.4], ["horse", 0.4, -0.8], ["hill", 1.8, -1.4, null, 3], ["banner", 1.6, 0.2, {c: band("#7a4fb0")}]]},
 qadisiyyah: {g: "sand", sky: "dusk", p: [["river", -1.1, 1.2, null, 2], ["elephant", 1, -0.6], ["banner", 2.2, -0.2, {c: band("#7a4fb0")}], ["horse", -1.2, -0.2], ["camel", -2, 0.4], ["banner", -0.4, -0.4, {c: band("#2d9a5b")}]]},
 quds: {g: "rock", sky: "day", p: [["wall", -0.8, -1, {c: {S: "#d8c9a3", s: "#b8a578"}}, 3], ["olive", -2.2, 0.4], ["olive", 1.8, 0.6], ["olive", 2.6, -0.2], ["banner", 0, 0.6, {c: band("#2d9a5b")}]]},
 misr: {g: "sand", sky: "day", p: [["pyramid", -1.6, -1.4, null, 4], ["pyramid", 0.2, -1.8, null, 3], ["river", -1.1, 0.8, null, 2], ["palm", 1.8, 0.2], ["tentw", 1, -0.4], ["banner", 2.4, -0.6, {c: band("#2d9a5b")}]]},
 nahawand: {g: "snow", sky: "dusk", p: [["mount", -1.8, -1.6, null, 3], ["mount", 0.6, -1.8, null, 3], ["horse", -0.6, 0.4], ["banner", 0.6, 0.4, {c: band("#2d9a5b")}], ["tentw", 1.8, 0.6]]},
 kairouan: {g: "sand", sky: "day", p: [["sqmin", -1.6, -0.6, null, 3], ["dome", 0, -0.4, {c: {G: "#e6dcc4", Y: "#e6b941"}}, 4], ["palm", 2, 0.4], ["camel", -0.6, 1.2]]},
 qubbah: {g: "rock", sky: "day", p: [["octo", -0.55, -0.4, null, 6], ["olive", -2.2, 0.6], ["olive", 2.2, 0.6], ["wall", -0.8, -2, {c: {S: "#d8c9a3", s: "#b8a578"}}, 2]]},
 umayyad: {g: "rock", sky: "day", p: [["dome", -0.5, -0.5, null, 4], ["minaret", -1.8, -0.6, null, 2], ["minaret", 1.3, -0.6, null, 2], ["olive", 2.4, 0.8], ["arches", -0.6, 0.6, {c: {R: "#d9cdb4"}}, 2]]},
 andalus: {g: "sea", sky: "dawn", p: [["rock", 1, -1, {c: {B: "#8a7d68", b: "#a59a8a", G: "#7f7465", N: "#6b5f50"}}, 3], ["ship", -1.6, 0.2], ["ship", -0.2, 0.8], ["ship", -2.4, 1.2], ["banner", 1.4, 0.4, {c: band("#2d9a5b")}]]},
 sindh: {g: "grass", sky: "day", p: [["river", -1.1, 0.2, null, 2], ["ship", -1, -0.6], ["ship", 0.8, -0.8], ["elephant", 1.8, 0.8], ["banner", -1.8, 1, {c: band("#2d9a5b")}], ["palm", 2.4, -0.4]]},
 samarkand: {g: "sand", sky: "dusk", p: [["bdome", -0.6, -0.6, null, 4], ["tower", -1.8, -0.4, null, 3], ["tower", 1, -0.4, null, 3], ["camel", -0.8, 1], ["camel", 0.8, 1.2]]},
 tours: {g: "grass", sky: "dusk", p: [["hill", -1.4, -1, {c: {s: "#4a7a3a", S: "#3f6a30"}}, 3], ["banner", -0.6, 0.4, {c: band("#2d9a5b")}], ["tentw", -1.8, 0.6], ["horse", 0.6, 0.2], ["olive", 2, -0.4]]},
 baghdad: {g: "sand", sky: "day", p: [["round", -0.6, -0.4, null, 3], ["river", -1.1, 1.3, null, 2], ["palm", 2.2, -0.6], ["palm", -2.4, -0.8], ["ship", 1.2, 1.6]]},
 cordoba: {g: "grass", sky: "day", p: [["arches", -0.6, -0.4, null, 4], ["sqmin", 1.8, -0.8, {c: {S: "#d9b66a", s: "#a8843c"}}, 3], ["olive", -2.2, 0.6], ["olive", 2.4, 0.8]]},
 hikmah: {g: "rock", sky: "night", p: [["book", -1.4, 0, null, 3], ["book", -0.6, 0.2, {c: {R: "#2f6fb8"}}, 3], ["book", 0.2, 0, {c: {R: "#2d9a5b"}}, 3], ["astro", 1.4, -0.4, null, 2], ["star", -1.6, -2.2, null, 1], ["star", 0.6, -2.4, null, 1], ["moon", 2, -2.4, null, 1]]},
 sicily: {g: "sea", sky: "day", p: [["mount", 0.6, -1.6, null, 3], ["ship", -1.6, 0.4], ["ship", 0.2, 0.8], ["banner", 1.8, -0.2, {c: band("#2d9a5b")}]]},
 azhar: {g: "sand", sky: "day", p: [["dome", -0.5, -0.5, {c: {G: "#d9cdb4"}}, 4], ["minaret", -1.8, -0.6, {c: {G: "#d9cdb4"}}, 2], ["minaret", 1.4, -0.6, {c: {G: "#d9cdb4"}}, 2], ["palm", 2.4, 0.6], ["river", -1.1, 1.6, null, 2]]},
 manzikert: {g: "grass", sky: "dusk", p: [["mount", -1.8, -1.8, null, 3], ["horse", -1, 0], ["horse", 0.4, 0.4], ["banner", -0.2, -0.4, {c: band("#2f6fb8")}], ["banner", 2, 0, {c: band("#7a4fb0")}]]},
 crusade: {g: "rock", sky: "dusk", p: [["wall", -0.8, -1, {c: {S: "#9a8f7a", s: "#7a705e"}}, 3], ["tent", -2, 0.8, {c: band("#e6e6e6", "#b5463c")}], ["banner", 1.6, 0.6, {c: band("#ffffff", "#b5463c")}]]},
 hattin: {g: "rock", sky: "day", p: [["hill", -1.2, -1, null, 3], ["hill", 1, -1.2, null, 3], ["banner", 0, 0.2, {c: band("#e6b941")}], ["horse", -1, 0.6], ["horse", 1, 0.8], ["olive", 2.4, 0.2]]},
 delhi: {g: "grass", sky: "day", p: [["pencil", -0.2, -0.6, {c: {v: "#c46a4a", V: "#a0503a"}}, 3], ["elephant", 1.2, 0.6], ["banner", -1.6, 0.4, {c: band("#2d9a5b")}]]},
 mongol: {g: "sand", sky: "night", p: [["round", -0.6, -0.4, {c: {S: "#5a4a3a", G: "#5a4a3a"}}, 3], ["river", -1.1, 1.3, {c: {b: "#2b2b4a", B: "#1b1b3a"}}, 2], ["tent", 2, -1, {c: band("#5a4a3a")}], ["book", -2.2, 1, {c: {R: "#1b1b3a"}}, 2]]},
 ainjalut: {g: "sand", sky: "day", p: [["hill", -1.6, -1.2, null, 3], ["banner", -0.4, 0, {c: band("#e6b941")}], ["horse", -1.2, 0.4], ["horse", 0.2, 0.8], ["horse", 1.4, 0.4]]},
 osman: {g: "grass", sky: "day", p: [["tent", -1, -0.2, {c: band("#b5463c")}], ["banner", 0.6, 0, {c: band("#b5463c")}], ["crescent", 0.7, -1.2, null, 1], ["hill", 1.6, -1.2, {c: {s: "#4a7a3a", S: "#3f6a30"}}, 3], ["horse", -2, 0.6]]},
 pasai: {g: "grass", sky: "day", p: [["ship", -1.8, 0.8], ["palm", 0.4, -0.6], ["palm", 1.2, -0.2], ["melaka", -0.4, -0.8, null, 3]]},
 batu: {g: "grass", sky: "day", p: [["sqmin", -0.2, -0.2, {c: {S: "#8a8f99", s: "#c4c8d0"}}, 2], ["palm", -1.8, -0.4], ["palm", 1.6, -0.6], ["river", -1.1, 1.2, null, 2]]},
 battuta: {g: "sand", sky: "dusk", p: [["camel", -2, 0.4], ["ship", 0.6, 0.6], ["pyramid", -0.6, -1.6, null, 2], ["dome", 1.6, -1.4, null, 3]]},
 melaka: {g: "grass", sky: "day", p: [["melaka", -0.6, -0.8, null, 4], ["ship", -2, 1], ["ship", 1.4, 1.2], ["palm", 2.2, -0.6], ["river", -1.1, 0.4, null, 2]]},
 fatih: {g: "sea", sky: "dawn", p: [["wall", -0.6, -1.4, {c: {S: "#9a8f7a", s: "#7a705e"}}, 3], ["tower", 1.4, -1.2, {c: {S: "#9a8f7a", s: "#7a705e"}}, 3], ["cannon", -1.8, 0.4], ["cannon", 0.4, 0.6], ["ship", 2, 0.6], ["banner", -0.8, 0.6, {c: band("#b5463c")}], ["crescent", -0.6, -2.2, null, 1]]},
 granada: {g: "grass", sky: "dusk", p: [["wall", -0.8, -1, {c: {S: "#c4703a", s: "#a0582a"}}, 3], ["tower", 1.2, -0.8, {c: {S: "#c4703a", s: "#a0582a"}}, 3], ["mount", -1.4, -2.4, {c: {M: "#eef2f6", m: "#c8d0dc"}}, 2], ["olive", 2.4, 0.6]]},
 portugis: {g: "sea", sky: "dusk", p: [["melaka", -0.6, -1.2, {c: {R: "#7a5a4a", N: "#4a3a2a"}}, 3], ["ship", 0.8, 0.6, {c: {X: "#e6e6e6"}}], ["ship", -1.8, 1, {c: {X: "#e6e6e6"}}], ["cannon", 2, -0.2]]},
 selim: {g: "sand", sky: "day", p: [["pyramid", -1.8, -1.6, null, 2], ["pencil", 0, -0.6, null, 3], ["banner", 1.2, 0.2, {c: band("#b5463c")}], ["river", -1.1, 1.2, null, 2]]},
 mohacs: {g: "grass", sky: "dusk", p: [["river", -1.1, 1.2, null, 2], ["cannon", -1.4, 0], ["cannon", 0.2, 0.2], ["banner", 1.6, -0.2, {c: band("#b5463c")}], ["tent", -2.2, -0.8, {c: band("#b5463c")}], ["horse", 1, 0.6]]},
 panipat: {g: "grass", sky: "day", p: [["elephant", -1.2, -0.4], ["cannon", 0.6, 0.4], ["banner", 1.6, -0.2, {c: band("#2d9a5b")}], ["tentw", -2.2, 0.6]]},
 vienna: {g: "grass", sky: "dusk", p: [["wall", -0.8, -1.4, {c: {S: "#9a8f7a", s: "#7a705e"}}, 3], ["tent", -1.8, 0.6, {c: band("#b5463c")}], ["tent", 0, 0.8, {c: band("#b5463c")}], ["cannon", 1.4, 0.4], ["olive", 2.4, -0.6]]},
 sulaymaniyah: {g: "rock", sky: "day", p: [["bdome", -0.55, -0.4, {c: {b: "#9aa0aa", B: "#7a808a"}}, 5], ["pencil", -1.8, -0.6, null, 2], ["pencil", 1.3, -0.6, null, 2], ["pencil", -2.4, 0.2, null, 2], ["pencil", 1.9, 0.2, null, 2]]},
 taj: {g: "grass", sky: "dawn", p: [["taj", -0.5, -0.6, null, 5], ["pencil", -1.8, -0.6, {c: {v: "#ffffff", V: "#e6e6e6"}}, 2], ["pencil", 1.4, -0.6, {c: {v: "#ffffff", V: "#e6e6e6"}}, 2], ["river", -1.1, 1.4, null, 2]]},
 end: {g: "rock", sky: "night", p: [["bdome", -0.55, -0.4, {c: {b: "#4a4f5a", B: "#3a3f4a"}}, 4], ["crescent", -0.2, -2.2, null, 1], ["star", 1.6, -2.4, null, 1]]}};
// [year AD, scene, era, title ms, title en, place ms, place en, note ms, note en]
var EV = [[610,"hira","nabi","Wahyu pertama","The first revelation","Gua Hira', Makkah","Cave of Hira, Makkah","Nabi Muhammad ﷺ menerima wahyu pertama, \"Iqra'\" (Surah al-'Alaq 1–5), ketika berusia 40 tahun.","The Prophet Muhammad ﷺ received the first revelation, \"Iqra'\" (Surah al-'Alaq 1–5), at the age of 40."],
 [622,"hijrah","nabi","Hijrah ke Madinah","The Hijrah to Madinah","Makkah → Madinah","Makkah → Madinah","Nabi ﷺ dan Abu Bakar berhijrah ke Madinah. Tahun ini menjadi tahun 1 Hijrah dalam kalendar Islam.","The Prophet ﷺ and Abu Bakr migrated to Madinah. This year became year 1 of the Islamic calendar."],
 [624,"badr","nabi","Perang Badar","The Battle of Badr","Badar","Badr","Kira-kira 313 orang Islam menewaskan tentera Quraisy yang jauh lebih besar pada 17 Ramadan 2 H.","About 313 Muslims defeated a much larger Quraysh army on 17 Ramadan, 2 AH."],
 [625,"uhud","nabi","Perang Uhud","The Battle of Uhud","Bukit Uhud, Madinah","Mount Uhud, Madinah","Pemanah meninggalkan kedudukan di bukit; pengajaran tentang taat kepada arahan pemimpin.","The archers left their hill; a lesson in obeying the commander."],
 [627,"khandaq","nabi","Perang Khandaq","The Battle of the Trench","Madinah","Madinah","Atas cadangan Salman al-Farisi, parit digali mengelilingi Madinah dan tentera Ahzab akhirnya berundur.","On Salman al-Farisi's advice a trench was dug round Madinah, and the allied tribes finally withdrew."],
 [628,"hudaibiyah","nabi","Perjanjian Hudaibiyah","The Treaty of Hudaybiyyah","Hudaibiyah","Hudaybiyyah","Perjanjian damai dengan Quraisy yang disebut al-Quran sebagai \"kemenangan yang nyata\" (al-Fath 1).","A peace treaty with Quraysh that the Quran calls \"a clear victory\" (al-Fath 1)."],
 [628,"khaibar","nabi","Pembukaan Khaibar","The conquest of Khaybar","Khaibar","Khaybar","Kubu-kubu Khaibar dibuka; Ali bin Abi Talib diberi panji.","The forts of Khaybar were taken; Ali ibn Abi Talib was given the banner."],
 [630,"makkah","nabi","Pembukaan Kota Makkah","The conquest of Makkah","Makkah","Makkah","Makkah dibuka hampir tanpa pertumpahan darah; berhala di sekeliling Kaabah dimusnahkan dan penduduk diampunkan.","Makkah was opened almost without bloodshed; the idols around the Kaaba were destroyed and its people forgiven."],
 [632,"wada","nabi","Haji Wada' dan wafat Nabi ﷺ","The Farewell Hajj and the Prophet's ﷺ passing","Arafah, Madinah","Arafah, Madinah","Khutbah di Arafah, kemudian Nabi ﷺ wafat di Madinah. Abu Bakar as-Siddiq menjadi khalifah pertama.","The sermon at Arafah, then the Prophet ﷺ passed away in Madinah. Abu Bakr as-Siddiq became the first caliph."],
 [636,"yarmuk","rasyidin","Perang Yarmuk","The Battle of Yarmouk","Sungai Yarmuk, Syam","Yarmouk River, Syria","Di bawah Khalid al-Walid dan Abu Ubaidah, tentera Islam menewaskan Rom Byzantine dan membuka Syam.","Under Khalid ibn al-Walid and Abu Ubaydah, the Muslims defeated the Byzantines and opened Syria."],
 [636,"qadisiyyah","rasyidin","Perang Qadisiyyah","The Battle of al-Qadisiyyah","Iraq","Iraq","Saad bin Abi Waqqas menewaskan tentera Parsi Sasan, termasuk pasukan gajahnya.","Sa'd ibn Abi Waqqas defeated the Sasanian Persians, elephants and all."],
 [638,"quds","rasyidin","Pembukaan Baitulmaqdis","Jerusalem opened","Baitulmaqdis","Jerusalem","Khalifah Umar al-Khattab datang sendiri menerima kunci kota dan menjamin keselamatan penduduknya.","Caliph Umar ibn al-Khattab came himself to receive the keys and guaranteed the people's safety."],
 [641,"misr","rasyidin","Pembukaan Mesir","Egypt opened","Mesir","Egypt","Amr bin al-As membuka Mesir dan membina kota Fustat dengan masjid pertamanya.","Amr ibn al-As opened Egypt and founded Fustat with its first mosque."],
 [642,"nahawand","rasyidin","Perang Nahawand","The Battle of Nahavand","Parsi","Persia","Disebut \"kemenangan segala kemenangan\": empayar Parsi Sasan runtuh selepasnya.","Called \"the victory of victories\": the Sasanian Empire fell after it."],
 [670,"kairouan","umayyah","Kota Kairouan","Kairouan founded","Tunisia","Tunisia","Uqbah bin Nafi' mengasaskan Kairouan, pusat Islam pertama di Afrika Utara.","Uqba ibn Nafi founded Kairouan, the first Muslim centre in North Africa."],
 [691,"qubbah","umayyah","Kubah as-Sakhrah siap","The Dome of the Rock completed","Baitulmaqdis","Jerusalem","Dibina oleh Khalifah Abdul Malik bin Marwan di kawasan Masjid al-Aqsa.","Built by Caliph Abd al-Malik ibn Marwan in the al-Aqsa compound."],
 [711,"andalus","umayyah","Tariq bin Ziyad ke Andalus","Tariq ibn Ziyad crosses to Spain","Jabal Tariq (Gibraltar)","Jabal Tariq (Gibraltar)","Tariq menyeberangi selat; bukit tempat dia mendarat dinamakan Jabal Tariq, kini Gibraltar.","Tariq crossed the strait; the rock where he landed was named Jabal Tariq, now Gibraltar."],
 [711,"sindh","umayyah","Muhammad bin Qasim ke Sind","Muhammad ibn Qasim in Sindh","Sind (Pakistan)","Sindh (Pakistan)","Panglima muda berusia 17 tahun membawa Islam ke lembah Sungai Indus.","A 17-year-old commander brought Islam to the Indus valley."],
 [712,"samarkand","umayyah","Pembukaan Samarkand","Samarkand opened","Asia Tengah","Central Asia","Qutaibah bin Muslim membuka Bukhara dan Samarkand; kemudian lahir ulama seperti Imam al-Bukhari.","Qutayba ibn Muslim opened Bukhara and Samarkand; later came scholars like Imam al-Bukhari."],
 [715,"umayyad","umayyah","Masjid Umayyah, Damsyik","The Umayyad Mosque, Damascus","Damsyik","Damascus","Khalifah al-Walid I membina salah satu masjid terbesar dan tertua di dunia.","Caliph al-Walid I built one of the largest and oldest mosques in the world."],
 [732,"tours","umayyah","Pertempuran Balat asy-Syuhada'","The Battle of Tours","Perancis","France","Abdul Rahman al-Ghafiqi gugur; kemaraan ke Eropah Barat terhenti di sini.","Abd al-Rahman al-Ghafiqi fell; the advance into Western Europe stopped here."],
 [762,"baghdad","abbasiyah","Kota Baghdad diasaskan","Baghdad founded","Iraq","Iraq","Khalifah al-Mansur membina \"Kota Bulat\" di tebing Sungai Dajlah (Tigris).","Caliph al-Mansur built the \"Round City\" on the Tigris."],
 [785,"cordoba","andalus","Masjid Kordoba","The Mosque of Cordoba","Kordoba, Andalus","Cordoba, al-Andalus","Abdul Rahman I memulakan masjid dengan gerbang berjalur merah putih yang terkenal.","Abd al-Rahman I began the mosque with its famous red-and-white arches."],
 [830,"hikmah","abbasiyah","Baitul Hikmah","The House of Wisdom","Baghdad","Baghdad","Pusat ilmu zaman al-Ma'mun: al-Khawarizmi menulis tentang algebra di sini.","A centre of learning under al-Ma'mun: al-Khwarizmi wrote on algebra here."],
 [831,"sicily","abbasiyah","Palermo dibuka","Palermo taken","Sicily","Sicily","Kerajaan Aghlabiyah membuka Palermo; Sicily menjadi pusat ilmu dan pertanian.","The Aghlabids took Palermo; Sicily became a centre of learning and farming."],
 [970,"azhar","fatimiyah","Masjid al-Azhar","Al-Azhar Mosque","Kaherah","Cairo","Dibina selepas Kaherah diasaskan (969); kini antara universiti tertua di dunia.","Built after Cairo was founded (969); now one of the oldest universities in the world."],
 [1071,"manzikert","saljuk","Pertempuran Manzikert","The Battle of Manzikert","Anatolia","Anatolia","Sultan Alp Arslan dari Saljuk menewaskan Byzantine dan membuka Anatolia.","The Seljuk Sultan Alp Arslan defeated the Byzantines and opened Anatolia."],
 [1099,"crusade","saljuk","Tentera Salib menawan Baitulmaqdis","The Crusaders take Jerusalem","Baitulmaqdis","Jerusalem","Satu kehilangan besar: kota itu dikuasai tentera Salib selama 88 tahun.","A great loss: the Crusaders held the city for 88 years."],
 [1187,"hattin","ayyubiyah","Hattin dan pembebasan Baitulmaqdis","Hattin and Jerusalem freed","Hattin, Baitulmaqdis","Hattin, Jerusalem","Salahuddin al-Ayyubi menang di Hattin dan membuka semula Baitulmaqdis tanpa membalas dendam.","Salah al-Din won at Hattin and reopened Jerusalem without revenge."],
 [1206,"delhi","india","Kesultanan Delhi","The Delhi Sultanate","Delhi","Delhi","Qutbuddin Aibak mengasaskan kesultanan; Qutb Minar dibina di Delhi.","Qutb al-Din Aibak founded the sultanate; the Qutb Minar was built in Delhi."],
 [1258,"mongol","abbasiyah","Mongol memusnahkan Baghdad","The Mongols destroy Baghdad","Baghdad","Baghdad","Hulagu Khan memusnahkan kota; dikatakan Sungai Dajlah menjadi hitam dengan dakwat buku.","Hulagu Khan destroyed the city; it is said the Tigris ran black with the ink of books."],
 [1260,"ainjalut","mamluk","Ain Jalut","Ain Jalut","Palestin","Palestine","Mamluk di bawah Qutuz dan Baibars menghentikan kemaraan Mongol buat kali pertama.","The Mamluks under Qutuz and Baybars stopped the Mongols for the first time."],
 [1297,"pasai","nusantara","Samudera Pasai","Samudera Pasai","Sumatera","Sumatra","Batu nisan Sultan Malik as-Salih (1297) antara bukti awal kerajaan Islam di Nusantara.","The tombstone of Sultan Malik al-Salih (1297) is early proof of a Muslim kingdom in the Malay world."],
 [1299,"osman","uthmaniyah","Kerajaan Uthmaniyah","The Ottoman state","Anatolia","Anatolia","Osman I mengasaskan kerajaan yang akan bertahan lebih 600 tahun.","Osman I founded a state that would last over 600 years."],
 [1303,"batu","nusantara","Batu Bersurat Terengganu","The Terengganu Inscription","Kuala Berang, Terengganu","Kuala Berang, Terengganu","Batu bertulisan Jawi tertua di Tanah Melayu, mencatat hukum Islam.","The oldest Jawi inscription in the Malay Peninsula, recording Islamic laws."],
 [1325,"battuta","mamluk","Pengembaraan Ibnu Battutah","Ibn Battuta's travels","Tangier → seluruh dunia Islam","Tangier → the whole Muslim world","Bermula dengan haji, dia mengembara hampir 30 tahun hingga ke China dan Nusantara.","Setting out for Hajj, he travelled nearly 30 years, as far as China and the Malay world."],
 [1400,"melaka","nusantara","Kesultanan Melayu Melaka","The Malacca Sultanate","Melaka","Malacca","Parameswara mengasaskan Melaka; ia menjadi pelabuhan dan pusat penyebaran Islam di Nusantara.","Parameswara founded Malacca; it became a great port and a centre for spreading Islam in the region."],
 [1453,"fatih","uthmaniyah","Pembukaan Konstantinopel","The conquest of Constantinople","Istanbul","Istanbul","Sultan Muhammad al-Fatih, 21 tahun, membuka kota dengan meriam besar dan kapal yang ditarik melalui darat.","Sultan Mehmed II al-Fatih, aged 21, took the city with great cannons and ships hauled over land."],
 [1492,"granada","andalus","Kejatuhan Granada","The fall of Granada","Granada","Granada","Kerajaan Islam terakhir di Andalus berakhir selepas hampir 800 tahun.","The last Muslim kingdom in al-Andalus ended after nearly 800 years."],
 [1511,"portugis","nusantara","Portugis menawan Melaka","The Portuguese take Malacca","Melaka","Malacca","Kehilangan besar; kesultanan berpindah dan lahir Kesultanan Johor.","A great loss; the sultanate moved on and the Johor Sultanate was born."],
 [1517,"selim","uthmaniyah","Uthmaniyah di Mesir","The Ottomans in Egypt","Kaherah","Cairo","Sultan Selim I menewaskan Mamluk; gelaran khalifah berpindah kepada Uthmaniyah.","Sultan Selim I defeated the Mamluks; the caliphate passed to the Ottomans."],
 [1526,"mohacs","uthmaniyah","Pertempuran Mohács","The Battle of Mohács","Hungary","Hungary","Sultan Sulaiman al-Qanuni menewaskan Hungary.","Sultan Suleiman the Magnificent defeated Hungary."],
 [1526,"panipat","india","Panipat dan Empayar Mughal","Panipat and the Mughal Empire","India","India","Babur menang di Panipat dan mengasaskan Empayar Mughal.","Babur won at Panipat and founded the Mughal Empire."],
 [1529,"vienna","uthmaniyah","Kepungan Vienna pertama","The first siege of Vienna","Vienna","Vienna","Kemaraan Uthmaniyah ke Eropah Tengah tidak berjaya membuka Vienna (dicuba lagi pada 1683).","The Ottoman advance into Central Europe failed to take Vienna (tried again in 1683)."],
 [1557,"sulaymaniyah","uthmaniyah","Masjid Sulaimaniyah","The Süleymaniye Mosque","Istanbul","Istanbul","Karya agung arkitek Mimar Sinan untuk Sultan Sulaiman.","A masterpiece by the architect Mimar Sinan for Sultan Suleiman."],
 [1653,"taj","india","Taj Mahal siap","The Taj Mahal completed","Agra","Agra","Makam marmar yang dibina oleh Shah Jahan untuk isterinya, Mumtaz Mahal.","The marble tomb Shah Jahan built for his wife, Mumtaz Mahal."],
 [1924,"end","uthmaniyah","Khilafah Uthmaniyah dimansuhkan","The Ottoman caliphate abolished","Istanbul","Istanbul","Selepas lebih 600 tahun kerajaan Uthmaniyah, khilafah dimansuhkan pada 3 Mac 1924.","After over 600 years of the Ottoman state, the caliphate was abolished on 3 March 1924."]];
var ERAS = [["nabi","🕋","Zaman Nabi ﷺ","The Prophet ﷺ"],["rasyidin","🟢","Khulafa' ar-Rasyidin","Rightly-guided caliphs"],["umayyah","⚪","Umayyah","Umayyads"],["abbasiyah","⚫","Abbasiyah","Abbasids"],["andalus","🟥","Andalus","al-Andalus"],["fatimiyah","🟩","Fatimiyah","Fatimids"],["saljuk","🔷","Saljuk","Seljuks"],["ayyubiyah","🟨","Ayyubiyah","Ayyubids"],["mamluk","🟧","Mamluk","Mamluks"],["india","🐘","India","India"],["nusantara","🌴","Nusantara","Malay world"],["uthmaniyah","🔴","Uthmaniyah","Ottomans"]];
function hijri(y){ return Math.max(0, Math.floor((y - 622) * 33 / 32)); }
function L(a, b){ return H.L2x(a, b); }
function E(s){ return H.esc(s == null ? "" : String(s)); }
// ---------- voxels for a scene ----------
// each template pixel becomes 2×2 small blocks with a little light/shade (top edges brighter, lower blocks darker), so the art reads finer;
// the ground gets scattered detail (ripples, tufts, waves, pebbles) from a seed per scene
function shade(hex, f){ var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255; r = Math.max(0, Math.min(255, Math.round(r * f))); g = Math.max(0, Math.min(255, Math.round(g * f))); b = Math.max(0, Math.min(255, Math.round(b * f))); return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }
function hash(a, b, c){ var x = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453; return x - Math.floor(x); }
var SCAT = {sand: ["#e2c486", "#f0d9a4", "#cdb07a"], grass: ["#4f8f3a", "#8fcf6a", "#6aa84f"], sea: ["#ffffff", "#bfe0ff", "#5c9ad6"], snow: ["#ffffff", "#e3e9f1", "#c9d3df"], rock: ["#9a8a6a", "#b8a780", "#7f7259"]};
function voxels(sc, plain){ var out = [], q = VS / 2;
  sc.p.forEach(function(pl, pi){ var t = TPL[pl[0]]; if(!t) return; var sw = pl[3] && pl[3].c || {}, d = (pl[4] || 2) * 2, h = t.length, w = t[0].length;
    for(var r = 0; r < h; r++) for(var c = 0; c < w; c++){ var ch = t[r].charAt(c); if(ch === ".") continue; var col = sw[ch] || PAL[ch] || "#ff00ff", top = r === 0 || t[r - 1].charAt(c) === ".";
      for(var sy = 0; sy < 2; sy++) for(var sx = 0; sx < 2; sx++){ var f = 0.94 + hash(pi, r * 2 + sy, c * 2 + sx) * 0.12 - (r / h) * 0.08 + (top && sy === 0 ? 0.1 : 0), cc = plain ? col : shade(col, f);
        for(var k = 0; k < d; k++) out.push([pl[1] + (c - w / 2) * VS + (sx - 0.5) * q, (h - r - 0.5) * VS + (0.5 - sy) * q, pl[2] + (k - d / 2) * q, k === 0 || k === d - 1 ? shade(cc, 0.9) : cc]); } } });
  var sp = SCAT[sc.g] || SCAT.sand, seed = sc.p.length * 7 + (sc.g || "").length;
  for(var i = 0; i < 260; i++){ var a = hash(seed, i, 1) * Math.PI * 2, rr = 0.6 + Math.sqrt(hash(seed, i, 2)) * 2.6, x = Math.cos(a) * rr, z = Math.sin(a) * rr, hgt = sc.g === "grass" ? 1 + Math.floor(hash(seed, i, 3) * 3) : 1;
    for(var y = 0; y < hgt; y++) out.push([x, q * (y + 0.5), z, sp[Math.floor(hash(seed, i, 4) * sp.length)]]); }
  return out; }
var GROUND = {sand: ["#e8cf96", "#d9bc7c"], grass: ["#7cb85a", "#5f9e45"], sea: ["#3e7fc0", "#2f6aa6"], snow: ["#eef2f6", "#d6dee8"], rock: ["#c9b48a", "#a8956a"]};
var SKY = {day: ["#8fd3ff", "#e8f7ff"], dusk: ["#ff9a6b", "#ffd9a8"], night: ["#0b1630", "#26355f"], dawn: ["#f7b4a8", "#bfe2ff"]};
function stage(host){ T = window.THREE; var W = host.clientWidth || 360, Hh = Math.round(Math.min(W * 0.78, (window.innerHeight || 700) * 0.46));
  var r = new T.WebGLRenderer({antialias: true}); r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.setSize(W, Hh); r.domElement.className = "hsCv"; host.appendChild(r.domElement);
  var sc = new T.Scene(), cam = new T.PerspectiveCamera(42, W / Hh, 0.1, 100); sc.add(new T.HemisphereLight(0xffffff, 0x8a7a5a, 1.6)); var dl = new T.DirectionalLight(0xffffff, 1.5); dl.position.set(3, 6, 4); sc.add(dl);
  var MAX = 9000, geo = new T.BoxGeometry(VS * 0.48, VS * 0.48, VS * 0.48), mat = new T.MeshLambertMaterial({}), mesh = new T.InstancedMesh(geo, mat, MAX); mesh.frustumCulled = false; mesh.instanceMatrix.setUsage(T.DynamicDrawUsage); sc.add(mesh);
  var ground = new T.Mesh(new T.CylinderGeometry(3.4, 3.6, 0.2, 40), new T.MeshLambertMaterial({color: 0xe8cf96})); ground.position.y = -0.1; sc.add(ground);
  var from = [], to = [], cols = [], n = 0, t0 = 0, dur = 1700, ang = 0.6, drag = null, alive = true, raf = 0, mtx = new T.Matrix4(), col = new T.Color(), hidden = new T.Vector3(0, -50, 0);
  for(var i = 0; i < MAX; i++){ from.push(hidden.clone()); to.push(hidden.clone()); mtx.makeTranslation(0, -50, 0); mesh.setMatrixAt(i, mtx); mesh.setColorAt(i, col.set(0xffffff)); }
  var set = function(scene){ var vx = voxels(scene), g = GROUND[scene.g] || GROUND.sand, sk = SKY[scene.sky] || SKY.day; sc.background = new T.Color(sk[0]); ground.material.color.set(g[0]);
    for(var i = 0; i < MAX; i++){ var cur = new T.Vector3(); mesh.getMatrixAt(i, mtx); cur.setFromMatrixPosition(mtx); from[i] = i < n ? cur : new T.Vector3((Math.random() - .5) * 18, 6 + Math.random() * 8, (Math.random() - .5) * 18); }
    for(var j = 0; j < MAX; j++){ if(j < vx.length){ to[j] = new T.Vector3(vx[j][0], vx[j][1], vx[j][2]); mesh.setColorAt(j, col.set(vx[j][3])); } else to[j] = j < n ? new T.Vector3((Math.random() - .5) * 18, 8 + Math.random() * 6, (Math.random() - .5) * 18) : hidden.clone(); }
    mesh.instanceColor.needsUpdate = true; var old = n; n = Math.max(vx.length, old); t0 = performance.now(); setTimeout(function(){ n = vx.length; }, dur + 400); return vx.length; };
  var ease = function(x){ return 1 - Math.pow(1 - x, 3); };
  var loop = function(){ if(!alive) return; var now = performance.now(), moving = now - t0 < dur + 700;
    if(moving) for(var i = 0; i < n; i++){ var dly = (i % 97) / 97 * 500, k = Math.max(0, Math.min(1, (now - t0 - dly) / dur)), e = ease(k), a = from[i], b = to[i]; mtx.makeTranslation(a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e + Math.sin(k * Math.PI) * 1.2, a.z + (b.z - a.z) * e); mesh.setMatrixAt(i, mtx); }
    if(moving) mesh.instanceMatrix.needsUpdate = true; if(!drag) ang += 0.0018; cam.position.set(Math.sin(ang) * 5.4, 2.6, Math.cos(ang) * 5.4); cam.lookAt(0, 0.6, 0); r.render(sc, cam); raf = requestAnimationFrame(loop); };
  r.domElement.addEventListener("pointerdown", function(e){ drag = e.clientX; }); window.addEventListener("pointerup", function(){ drag = null; });
  r.domElement.addEventListener("pointermove", function(e){ if(drag == null) return; ang -= (e.clientX - drag) * 0.01; drag = e.clientX; });
  loop();
  return {set: set, stop: function(){ alive = false; cancelAnimationFrame(raf); try{ r.dispose(); geo.dispose(); }catch(e){} }}; }
// ---------- page ----------
var STG = null, cur = 0, quiz = false;
function close(){ if(STG) STG.stop(); STG = null; H.closeOverlay(); }
function draw(){ var ov = document.getElementById("overlay"), e = EV[cur], st = H.load("ihsan_hist", null) || {seen: {}, q: {}}; st.seen[cur] = 1; H.save("ihsan_hist", st);
  var era = ERAS.filter(function(x){ return x[0] === e[2]; })[0];
  ov.querySelector("#hsEra").innerHTML = ERAS.map(function(x){ return '<button class="chip' + (x[0] === e[2] ? " on" : "") + '" data-era="' + x[0] + '">' + x[1] + ' ' + E(L(x[2], x[3])) + '</button>'; }).join("");
  var on = ov.querySelector('[data-era="' + e[2] + '"]'); if(on) try{ on.scrollIntoView({inline: "center", block: "nearest"}); }catch(x){}
  ov.querySelector("#hsCard").innerHTML = '<div class="hsYr"><b>' + e[0] + ' M</b><span>≈ ' + hijri(e[0]) + ' H</span><span class="hsEraT">' + era[1] + ' ' + E(L(era[2], era[3])) + '</span></div><h3>' + E(L(e[3], e[4])) + '</h3><div class="hsPl">📍 ' + E(L(e[5], e[6])) + '</div><p>' + E(L(e[7], e[8])) + '</p>' +
    '<div class="hsQz" id="hsQz">' + (st.q[cur] ? '✓ ' + L("Kuiz dijawab", "Quiz answered") : '<button class="chip gold" id="hsQ">🧠 ' + L("Kuiz", "Quiz") + '</button>') + '</div>';
  ov.querySelector("#hsN").textContent = (cur + 1) + "/" + EV.length + " · " + L("dilihat ", "seen ") + Object.keys(st.seen).length;
  ov.querySelector("#hsR").value = cur;
  if(STG) STG.set(SC[e[1]] || SC.end);
  ov.querySelectorAll("[data-era]").forEach(function(b){ b.onclick = function(){ for(var i = 0; i < EV.length; i++) if(EV[i][2] === b.getAttribute("data-era")){ cur = i; break; } draw(); }; });
  var qb = ov.querySelector("#hsQ"); if(qb) qb.onclick = function(){ var yrs = [e[0]], d = [-60, -25, 30, 75, 120, -110, 15]; while(yrs.length < 4){ var y = e[0] + d[Math.floor(Math.random() * d.length)]; if(yrs.indexOf(y) < 0 && y > 570 && y < 2000) yrs.push(y); } yrs.sort(function(a, b){ return a - b; });
    ov.querySelector("#hsQz").innerHTML = '<div class="small">' + L("Tahun berapa?", "Which year?") + '</div><div class="hsQo">' + yrs.map(function(y){ return '<button class="btn alt" data-hy="' + y + '">' + y + '</button>'; }).join("") + '</div>';
    ov.querySelectorAll("[data-hy]").forEach(function(b){ b.onclick = function(){ var ok = +b.getAttribute("data-hy") === e[0]; b.classList.add(ok ? "ok" : "no"); if(ok){ st.q[cur] = 1; H.save("ihsan_hist", st); try{ H.N.vibrate(30); }catch(x){} } else ov.querySelector('[data-hy="' + e[0] + '"]').classList.add("ok"); }; }); }; }
function open(h, at){ H = h; if(!document.querySelector('link[href="history/hist.css"]')){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "history/hist.css"; document.head.appendChild(l); }
  var ov = document.getElementById("overlay"); ov.className = "hsov"; cur = at || 0;
  ov.innerHTML = '<div class="hsHead"><button class="chip" id="hsX">‹</button><b>🕰 ' + E(L("Garis masa sejarah Islam", "Islamic history timeline")) + '</b></div><div class="hsEra chips" id="hsEra"></div><div class="hsSt" id="hsSt"></div>' +
    '<div class="hsNav"><button class="btn alt" id="hsP">‹</button><input type="range" id="hsR" min="0" max="' + (EV.length - 1) + '" value="0"><button class="btn alt" id="hsF">›</button></div><div class="mut tiny hsNn" id="hsN"></div><div class="hsCard" id="hsCard"></div>' +
    '<div class="mut tiny hsFoot">' + L("Gambaran seni piksel; tiada lukisan manusia. Tarikh Hijrah ialah anggaran. Ringkasan sejarah ini menunggu semakan.", "Pixel-art impressions; no people are drawn. Hijri years are approximate. These summaries await review.") + '</div>';
  ov._close = close; ov.querySelector("#hsX").onclick = close;
  ov.querySelector("#hsP").onclick = function(){ if(cur > 0){ cur--; draw(); } };
  ov.querySelector("#hsF").onclick = function(){ if(cur < EV.length - 1){ cur++; draw(); } };
  ov.querySelector("#hsR").oninput = function(){ cur = +this.value; draw(); };
  var sw0 = null; ov.querySelector("#hsCard").addEventListener("touchstart", function(e){ sw0 = e.touches[0].clientX; }, {passive: true});
  ov.querySelector("#hsCard").addEventListener("touchend", function(e){ if(sw0 == null) return; var dx = e.changedTouches[0].clientX - sw0; sw0 = null; if(Math.abs(dx) > 50){ cur = Math.max(0, Math.min(EV.length - 1, cur + (dx < 0 ? 1 : -1))); draw(); } });
  try{ STG = window.THREE ? stage(ov.querySelector("#hsSt")) : null; }catch(e){ STG = null; } if(!STG) ov.querySelector("#hsSt").innerHTML = '<div class="mut small" style="padding:20px;text-align:center">' + L("Paparan 3D tidak tersedia pada peranti ini.", "3D view is not available on this device.") + '</div>';
  draw(); }
window.Hist = {open: open, _t: {EV: EV, SC: SC, TPL: TPL, ERAS: ERAS, voxels: voxels, hijri: hijri}};
})();
