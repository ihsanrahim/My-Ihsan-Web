/* 0.5.20 (review 22): when the app is in English (?ui=en), the engine's own UI words are shown in English.
   Only whole text nodes that exactly match a known UI phrase (or a counting pattern) are changed, so question
   content in a Malay pack is never touched. Subject and topic names stay as written (they are content). */
(function(){ "use strict";
if(!/[?&]ui=en\b/.test(location.search)) return;
var W = {"Kemajuan":"Progress","☰ Kemajuan":"☰ Progress","Kertas baharu":"New paper","🔄 Kertas baharu":"🔄 New paper","🧾 Slip keputusan":"🧾 Result slip",
  "Kuiz":"Quiz","✏️ Kuiz":"✏️ Quiz","Nota":"Notes","📖 Nota":"📖 Notes","🎮 Main":"🎮 Play","📝 Ujian Contoh":"📝 Sample exam","Main":"Play",
  "Padam":"Clear","Padam semua?":"Clear everything?","🧹 Padam semua":"🧹 Clear all","Pilih":"Choose","Pilih semua":"Choose all","Batal":"Cancel","tutup":"close","tekan":"tap",
  "Cari perkataan…":"Search words…","Tiada perkataan yang sepadan.":"No matching words.","Belum dibuka":"Not opened yet","✓ sudah dibaca":"✓ read","belum dibaca":"not read yet",
  "betul":"correct","salah":"wrong","Tidak betul.":"Not correct.","🎉 Semua betul. Syabas!":"🎉 All correct. Well done!","cubaan pertama":"first try","betul sekarang":"correct now",
  "💡 Tahukah kamu?":"💡 Did you know?","⏳ Memuatkan…":"⏳ Loading…","↑ Naik ke atas":"↑ Back to top","✔ Semak jawapan":"✔ Check answers",
  "Semua sudah dijawab. Tekan Semak untuk lihat markah.":"Everything is answered. Tap Check to see the marks.",
  "Tekan kad untuk lihat maksudnya. Cuba teka dahulu!":"Tap a card to see its meaning. Try to guess first!",
  "Tekan nombor merah, betulkan, kemudian Semak sekali lagi.":"Tap a red number, fix it, then Check again.",
  "Tekan petak kosong, kemudian pilih jawapan di bawah.":"Tap an empty box, then choose an answer below.",
  "Tekan baris di sebelah kiri, kemudian tekan jawapan di bawah.":"Tap a line on the left, then tap an answer below.",
  "Mula dari kotak paling kanan. Tekan mana-mana kotak untuk pindah.":"Start from the right-most box. Tap any box to move.",
  "Belum betul. Cuba lagi, kemudian tekan Semak.":"Not yet. Try again, then tap Check.","📖 Lihat nota":"📖 See notes","📝 Draf":"📝 Draft",
  "Petunjuk":"Hint","📚 Semua topik":"📚 All topics","Semua topik":"All topics","Pengembaraan Wira":"Hero Quest","Misi, HP, XP, lencana dan raksasa":"Missions, HP, XP, badges and monsters",
  "Bilik Lolos":"Escape Room","3 bilik, kod rahsia, petunjuk":"3 rooms, secret codes, hints","Pilih Pengembaraan":"Choose Your Adventure","Cerita bercabang, 3 pengakhiran":"Branching story, 3 endings",
  "Juara Kuiz":"Quiz Champion","3 pusingan, 50:50, jutawan":"3 rounds, 50:50, millionaire","Kandungan ini ditulis sendiri dan belum disemak oleh guru. Sila laporkan kesilapan.":"Written for this app and not yet checked by a teacher. Please report mistakes.",
  "Kandungan ini ditulis sendiri dan belum disemak oleh guru dan ustaz. Sila laporkan kesilapan.":"Written for this app and not yet checked by a teacher and an ustaz. Please report mistakes.","Mula":"Start","Main lagi":"Play again","Kembali":"Back","Seterusnya":"Next","Tamat":"Finished","Tanpa masa":"No time limit",
  "Kira jawapan":"Work it out","Kelaskan":"Sort","Betul / Salah":"True / False","Isi tempat kosong":"Fill in the blank","Padankan":"Match","Susun":"Put in order","Lengkapkan jadual":"Complete the table","Kira turus":"Column sums","Eja":"Spell","Lisan":"Oral","Kira":"Count"};
var P = [[/^(\d+)\/(\d+) dijawab · (\d+) betul$/, "$1/$2 answered · $3 correct"], [/^(\d+) soalan$/, "$1 questions"], [/^(.*) · (\d+) topik$/, function(m, a, n){ return (W[a] || a) + " · " + n + " topics"; }],
  [/^SOALAN (\d+)$/, "QUESTION $1"], [/^✔ Semak (\d+) jawapan$/, "✔ Check $1 answers"], [/^(\d+) soalan belum dijawab\.$/, "$1 questions not answered yet."],
  [/^Semak — (.*)$/, "Check — $1"], [/^Pusingan (\d+)/, "Round $1"], [/^Bertulis \/(\d+) · Lisan \/(\d+) · tiada pemasa$/, "Written /$1 · Oral /$2 · no timer"]];
var SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/;
function tr(n){ var t = n.nodeValue, k = t.trim(); if(!k || k.length > 90) return; var p = n.parentNode; if(!p || SKIP.test(p.nodeName)) return;
  var o = W[k]; if(o == null) for(var i = 0; i < P.length; i++) if(P[i][0].test(k)){ o = k.replace(P[i][0], P[i][1]); break; }
  if(o != null && o !== k) n.nodeValue = t.replace(k, o); }
function scan(r){ if(!r) return; if(r.nodeType === 3){ tr(r); return; } if(r.nodeType !== 1) return; if(r.placeholder && W[r.placeholder]) r.placeholder = W[r.placeholder];
  var w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT, null), a = [], x; while((x = w.nextNode())) a.push(x); a.forEach(tr);
  if(r.querySelectorAll) [].forEach.call(r.querySelectorAll("[placeholder]"), function(e){ if(W[e.placeholder]) e.placeholder = W[e.placeholder]; }); }
function go(){ document.documentElement.lang = "en"; scan(document.body);
  new MutationObserver(function(ms){ ms.forEach(function(m){ if(m.type === "characterData") tr(m.target); else [].forEach.call(m.addedNodes, scan); }); }).observe(document.body, {childList: true, subtree: true, characterData: true}); }
if(document.body) go(); else document.addEventListener("DOMContentLoaded", go);
})();
