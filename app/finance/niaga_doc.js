/* My Ihsan 0.6.25 · Kewangan › Niaga: document model (no UI).
   One key ihsan_biz. Every record carries id / rev / upd / by / del (sync fields) so import and restore never duplicate.
   Money is kept in sen (integers) inside the maths and stored as plain numbers with 2 decimals. */
(function(){ "use strict";
var KEY = "ihsan_biz";
var TYPES = {
  QT: {p:"QT", bm:"Sebut Harga", en:"Quotation", ic:"📝", to:["INV","DO"]},
  INV:{p:"INV", bm:"Invois", en:"Invoice", ic:"📄", to:["DO"]},
  CS: {p:"CS", bm:"Bil Tunai", en:"Cash Sale", ic:"🧾", to:[]},
  OR: {p:"OR", bm:"Resit Rasmi", en:"Official Receipt", ic:"✅", to:[]},
  DO: {p:"DO", bm:"Nota Hantaran", en:"Delivery Order", ic:"🚚", to:["INV"]},
  // 0.6.29 phase 3
  PF: {p:"PF", bm:"Invois Proforma", en:"Proforma Invoice", ic:"📋", to:["INV"]},
  CN: {p:"CN", bm:"Nota Kredit", en:"Credit Note", ic:"➖", to:[], sub:1},
  DN: {p:"DN", bm:"Nota Debit", en:"Debit Note", ic:"➕", to:[], sub:1},
  PO: {p:"PO", bm:"Pesanan Belian", en:"Purchase Order", ic:"🛒", to:[], buy:1},
  PV: {p:"PV", bm:"Baucar Bayaran", en:"Payment Voucher", ic:"💸", to:[], buy:1}
};
TYPES.INV.to = ["DO","CN","DN"];
var ORDER = ["QT","PF","INV","CS","OR","DO","PO","PV"], ALLT = ["QT","PF","INV","CS","OR","DO","CN","DN","PO","PV"];
// 0.6.29 multi-currency: a document may be in another currency with a rate to the business's base currency (1 doc unit = rate base units)
var CURS = [["MYR","RM"],["SGD","S$"],["BND","B$"],["IDR","Rp"],["USD","US$"],["EUR","€"],["GBP","£"],["AUD","A$"],["CNY","¥"],["JPY","JP¥"],["THB","฿"],["SAR","SR"],["AED","AED"],["INR","₹"]];
function sym(c){ for(var i = 0; i < CURS.length; i++) if(CURS[i][0] === c) return CURS[i][1]; return c || "RM"; }
function docCur(doc, p){ return doc && doc.cur ? doc.cur : (p && p.base) || "MYR"; }
function rate(doc, p){ return doc && doc.cur && doc.cur !== ((p && p.base) || "MYR") ? (+doc.rate || 1) : 1; }
var METHODS = [["cash","Tunai","Cash"],["bank","Pindahan bank","Bank transfer"],["duitnow","DuitNow","DuitNow"],["cheque","Cek","Cheque"],["card","Kad","Card"],["ewallet","e-Dompet","e-Wallet"],["other","Lain-lain","Other"]];
var UNITS = ["pcs","unit","kg","g","jam","hari","set","kotak","lot","m","m²","pek","botol","bulan"];
var TAXES = [[0,"Tiada","None"],[8,"SST perkhidmatan 8%","SST service 8%"],[6,"SST perkhidmatan 6%","SST service 6%"],[5,"Cukai jualan 5%","Sales tax 5%"],[10,"Cukai jualan 10%","Sales tax 10%"]];

function rid(n){ var s = "", a = "abcdefghijkmnpqrstuvwxyz23456789"; var r = window.crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(n || 16)) : null;
  for(var i = 0; i < (n || 16); i++) s += a[(r ? r[i] : Math.floor(Math.random() * 256)) % a.length]; return s; }
function iso(){ return new Date().toISOString(); }
function ymd(d){ d = d || new Date(); if(typeof d === "string") return d.slice(0, 10); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function addDays(s, n){ var p = String(s).split("-"), d = new Date(+p[0], +p[1] - 1, +p[2] + (+n || 0)); return ymd(d); }
function daysBetween(a, b){ var pa = a.split("-"), pb = b.split("-"); return Math.round((new Date(+pb[0], +pb[1] - 1, +pb[2]) - new Date(+pa[0], +pa[1] - 1, +pa[2])) / 864e5); }
function sen(v){ if(v == null || v === "") return 0; var n = typeof v === "number" ? v : +String(v).replace(/[^0-9.\-]/g, ""); return isFinite(n) ? Math.round(n * 100) : 0; }
function rm(c){ return Math.round(c) / 100; }
function num(v){ var n = typeof v === "number" ? v : +String(v == null ? "" : v).replace(/,/g, ""); return isFinite(n) ? n : 0; }
function fmt(c, cur){ var neg = c < 0; c = Math.abs(Math.round(c)); return (neg ? "−" : "") + (cur == null ? "RM" : cur) + (cur === "" ? "" : " ") + Math.floor(c / 100).toLocaleString("en") + "." + ("0" + (c % 100)).slice(-2); }
// a tiny calculator for number fields: "12*3.5", "100-10%"
function calc(s){ s = String(s == null ? "" : s).replace(/,/g, "").replace(/[x×]/g, "*").replace(/÷/g, "/").trim(); if(s === "") return "";
  if(/^-?\d*\.?\d+$/.test(s)) return +s;
  if(!/^[0-9+\-*/().% ]+$/.test(s)) return null;
  s = s.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
  try{ var v = Function('"use strict";return (' + s + ")")(); return isFinite(v) ? Math.round(v * 10000) / 10000 : null; }catch(e){ return null; } }

// ---------- store ----------
function blank(){ return {v:1, cur:"", profiles:[], customers:[], items:[], docs:[], expenses:[], sales:[], log:[], dev:{id:rid(12), name:"", letter:"A", role:"owner", staff:""}, ctr:{}, sync:{seq:0, pending:[], conflicts:[]}}; }
function fix(D){ var b = blank(); D = D && typeof D === "object" ? D : b; ["profiles","customers","items","docs","expenses","log","sales","bkcfg","bookings"].forEach(function(k){ if(!Array.isArray(D[k])) D[k] = []; });
  D.dev = D.dev || b.dev; if(!D.dev.id) D.dev.id = rid(12); D.ctr = D.ctr || {}; D.sync = D.sync || b.sync; D.v = 1; return D; }
function stamp(D, rec){ rec.rev = (rec.rev || 0) + 1; rec.upd = iso(); rec.by = D.dev.id; if(!rec.id) rec.id = rid(); return rec; }
function log(D, doc, act){ D.log.push({at:iso(), doc:doc, act:act, dev:D.dev.id}); if(D.log.length > 3000) D.log = D.log.slice(-3000); }
function live(a){ return a.filter(function(x){ return !x.del; }); }
function byId(a, id){ for(var i = 0; i < a.length; i++) if(a[i].id === id) return a[i]; return null; }

function newProfile(name){ return {id:rid(), name:name || "", trade:"", regNo:"", regOld:"", licence:"", sstNo:"", tin:"", msic:"",
  addr:{l1:"", l2:"", pc:"", city:"", state:"", country:"MY"}, phone:"", wa:"", email:"", web:"", social:"",
  logo:"", sigs:[], stamp:"", stampCol:"", bank:[{bank:"", accName:"", accNo:""}], qr:"", payLink:"",
  base:"MYR", lang:"both", design:"moden", color:"#0f5132", font:"sans",
  tax:{sst:false, rate:8, inclusive:false}, round5:true,
  terms:{QT:"", INV:"", CS:"", OR:"", DO:""}, notes:{}, footer:"", compGen:true, brand:false,
  num:{}, due:14, valid:30, waTpl:"", created:iso()}; }

// ---------- numbering ----------
var DEF_FMT = {QT:"QT-{YYYY}-{P}{N}", INV:"INV-{YYYY}-{P}{N}", CS:"CS-{YYYY}-{P}{N}", OR:"OR-{YYYY}-{P}{N}", DO:"DO-{YYYY}-{P}{N}", PF:"PF-{YYYY}-{P}{N}", CN:"CN-{YYYY}-{P}{N}", DN:"DN-{YYYY}-{P}{N}", PO:"PO-{YYYY}-{P}{N}", PV:"PV-{YYYY}-{P}{N}"};
function numCfg(p, t){ var n = (p.num || {})[t] || {}; return {pre:n.pre || DEF_FMT[t], pad:n.pad || 4, reset:n.reset || "year", alwaysLetter:!!n.alwaysLetter, start:n.start || 1}; }
function phones(D, pid){ var l = (D.link || {})[pid]; return l && l.devs ? l.devs : 1 + (D.peers || 0); }
function periodKey(c, date){ return c.reset === "month" ? date.slice(0, 7) : c.reset === "never" ? "all" : date.slice(0, 4); }
function fmtNo(c, n, date, letter){ var d = date.split("-");
  return c.pre.replace(/\{YYYY\}/g, d[0]).replace(/\{YY\}/g, d[0].slice(2)).replace(/\{MM\}/g, d[1]).replace(/\{DD\}/g, d[2]).replace(/\{P\}/g, letter || "").replace(/\{N\}/g, ("0000000000" + n).slice(-c.pad)); }
// 0.6.26: each linked sheet gives this phone its own letter (A, B, C…); letters show once a second phone joins
function letterOf(D, c, pid){ var l = (D.link || {})[pid]; return (c.alwaysLetter || phones(D, pid) > 1) ? ((l && l.letter) || D.dev.letter || "A") : ""; }
function usedNo(D, pid, t, no, skip){ return D.docs.some(function(x){ return x.pid === pid && x.type === t && x.no === no && x.id !== skip; }); }
// the next number this phone will give (does not take it)
// 0.6.26: the counter also continues from the highest number already issued with this phone's letter (phone A also owns the
// numbers made before letters started), so a phone restored from the Sheet carries on where the old one stopped
function usedMax(D, p, t, c, date, L){ var pk = periodKey(c, date), mx = 0; D.docs.forEach(function(d){ if(d.pid !== p.id || d.type !== t || !d.no || d.del || periodKey(c, d.date || date) !== pk) return; var m = /(\d+)\s*$/.exec(d.no); if(!m) return; var n = +m[1];
    if(fmtNo(c, n, d.date, L) === d.no || ((L === "A" || !L) && fmtNo(c, n, d.date, "") === d.no) || (!L && fmtNo(c, n, d.date, "A") === d.no)) mx = Math.max(mx, n); }); return mx; }
function peekNo(D, p, t, date){ var c = numCfg(p, t), k = p.id + "|" + t + "|" + periodKey(c, date), L = letterOf(D, c, p.id), n = Math.max((D.ctr[k] || 0) + 1, usedMax(D, p, t, c, date, L) + 1, c.start), no;
  for(var g = 0; g < 100000; g++){ no = fmtNo(c, n, date, L); if(!usedNo(D, p.id, t, no)) break; n++; } return {no:no, n:n, k:k}; }
function takeNo(D, p, t, date){ var r = peekNo(D, p, t, date); D.ctr[r.k] = r.n; return r.no; }

// ---------- totals ----------
// line: {t:"item"|"head", desc, qty, unit, price, disc, discT:"%"|"rm", tax}
function lineAmt(l){ if(l.t === "head") return 0; var g = Math.round(num(l.qty) * sen(l.price)); var d = l.discT === "%" ? Math.round(g * num(l.disc) / 100) : sen(l.disc); return Math.max(0, g - d); }
function paymentsFor(D, doc){ var ids = [doc.id]; if(doc.from) ids.push(doc.from);
  var out = []; live(D.docs).forEach(function(r){ if(r.type !== "OR" || r.status === "void" || r.status === "draft") return; (r.apply || []).forEach(function(a){ if(ids.indexOf(a.doc) >= 0) out.push({r:r, amt:sen(a.amt), dep:!!r.dep, src:a.doc}); }); });
  return out; }
function totals(D, doc, prof){
  var T = {sub:0, disc:0, tax:{}, taxSum:0, ship:sen(doc.ship), other:sen(doc.other), round:0, total:0, paid:0, credit:0, bal:0, lines:[]};
  if(doc.type === "OR" || doc.type === "PV"){ var a = doc.type === "OR" ? (doc.apply || []).reduce(function(s, x){ return s + sen(x.amt); }, 0) : 0; T.total = a || sen(doc.amt); T.sub = T.total; T.paid = T.total; T.debit = 0; T.notes = []; return T; }
  var sst = prof ? !!(prof.tax && prof.tax.sst) : true, incl = prof && prof.tax && prof.tax.inclusive;
  (doc.lines || []).forEach(function(l){ var a = lineAmt(l); T.lines.push(a); T.sub += a; });
  T.disc = doc.discT === "%" ? Math.round(T.sub * num(doc.disc) / 100) : Math.min(T.sub, sen(doc.disc));
  var k = T.sub ? (T.sub - T.disc) / T.sub : 0;
  if(sst) (doc.lines || []).forEach(function(l, i){ var r = num(l.tax); if(!r || l.t === "head") return; var base = T.lines[i] * k, tx = incl ? base * r / (100 + r) : base * r / 100; T.tax[r] = (T.tax[r] || 0) + tx; });
  Object.keys(T.tax).forEach(function(r){ T.tax[r] = Math.round(T.tax[r]); T.taxSum += T.tax[r]; });
  var pre = T.sub - T.disc + (incl ? 0 : T.taxSum) + T.ship + T.other;
  if(doc.round){ var r5 = Math.round(pre / 5) * 5; T.round = r5 - pre; pre = r5; }
  T.total = Math.max(0, pre);
  if(doc.type === "CS"){ T.paid = T.total; }
  else if(D && doc.type !== "DO" && !TYPES[doc.type].sub && !TYPES[doc.type].buy){ T.pays = paymentsFor(D, doc); T.paid = T.pays.reduce(function(s, x){ return s + x.amt; }, 0); }
  if(doc.type === "PV") T.paid = T.total;
  T.debit = 0; T.notes = [];
  if(D && doc.type === "INV") live(D.docs).forEach(function(n){ if(n.from !== doc.id || (n.type !== "CN" && n.type !== "DN") || n.status === "draft" || n.status === "void") return; var t2 = totals(null, n, prof); T.notes.push({d:n, amt:t2.total}); if(n.type === "CN") T.credit += t2.total; else T.debit += t2.total; });
  T.bal = Math.max(0, T.total + T.debit - T.paid - T.credit);
  return T; }
function cache(D, doc, prof){ var T = totals(D, doc, prof); doc.totals = {sub:rm(T.sub), disc:rm(T.disc), tax:Object.keys(T.tax).reduce(function(o, r){ o[r] = rm(T.tax[r]); return o; }, {}), total:rm(T.total), paid:rm(T.paid), credit:rm(T.credit), debit:rm(T.debit || 0), bal:rm(T.bal)}; return T; }

// ---------- status ----------
// stored: draft | sent | accepted | rejected | void ; shown adds expired, partial, paid, overdue
function status(D, doc, today){ today = today || ymd(); var s = doc.status || "draft";
  if(s === "draft" || s === "void") return s;
  if(doc.type === "QT"){ if(s === "accepted" || s === "rejected") return s; if((doc.to || []).length) return "accepted"; if(doc.valid && doc.valid < today) return "expired"; return "sent"; }
  if(doc.type === "INV"){ var T = totals(D, doc, profOf(D, doc)); if(T.total > 0 && T.bal <= 0) return "paid"; if(doc.due && doc.due < today) return "overdue"; return T.paid > 0 ? "partial" : "sent"; }
  if(doc.type === "CS" || doc.type === "OR" || doc.type === "PV") return "paid";
  if(doc.type === "CN" || doc.type === "DN") return "issued";
  if(doc.type === "PF") return (doc.to || []).length ? "accepted" : "sent";
  if(doc.type === "PO") return doc.recv ? "received" : (doc.to || []).length ? "received" : "sent";
  if(doc.type === "DO") return doc.recv ? "delivered" : "sent";
  return s; }
var ST_LAB = {draft:["Draf","Draft","#8a8f98"], sent:["Dihantar","Sent","#3b82f6"], accepted:["Diterima","Accepted","#16a34a"], rejected:["Ditolak","Rejected","#b45309"],
  expired:["Tamat","Expired","#9ca3af"], partial:["Separa bayar","Part paid","#d97706"], paid:["Dibayar","Paid","#15803d"], overdue:["Lewat","Overdue","#dc2626"], void:["Batal","Void","#6b7280"], delivered:["Diterima","Delivered","#15803d"], issued:["Dikeluarkan","Issued","#3b82f6"], received:["Barang diterima","Goods received","#15803d"]};
function profOf(D, doc){ return byId(D.profiles, doc.pid); }

// ---------- convert / duplicate ----------
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function makeFrom(D, src, type){ var p = profOf(D, src), d = blankDoc(D, p, type);
  d.cust = clone(src.cust || {}); d.custId = src.custId; d.lines = clone(src.lines || []); d.disc = src.disc; d.discT = src.discT; d.ship = src.ship; d.other = src.other; d.round = src.round;
  d.notes = src.notes; d.ref = src.ref || (src.no || ""); d.from = src.id; d.sig = src.sig; d.stamp = src.stamp; d.design = src.design; d.color = src.color; d.lang = src.lang;
  if(type === "DO") d.hidePrice = true; if(src.cur){ d.cur = src.cur; d.rate = src.rate; }
  if(type === "CN" || type === "DN"){ d.lines = []; d.reason = ""; }
  return d; }
function blankDoc(D, p, type){ var t = ymd(); var d = {id:rid(), pid:p ? p.id : "", type:type, no:"", date:t, cust:{}, custId:"", lines:[], disc:"", discT:"rm", ship:"", other:"", round:false,
  status:"draft", from:"", to:[], terms:p ? ((p.terms || {})[type] || "") : "", notes:p ? ((p.notes || {})[type] || "") : "", ref:"", sig:p && p.sigs && p.sigs[0] ? p.sigs[0].id : "none", stamp:!!(p && p.stamp),
  design:"", color:"", lang:"", sent:[], created:iso()};
  if(type === "INV") d.due = addDays(t, p ? (+p.due || 0) : 14);
  if(type === "QT") d.valid = addDays(t, p ? (+p.valid || 30) : 30);
  if(type === "CS" || type === "OR") d.round = !!(p && p.round5);
  if(type === "OR"){ d.amt = ""; d.method = "bank"; d.pdate = t; d.pref = ""; d.apply = []; }
  if(type === "PV"){ d.method = "bank"; d.pdate = t; d.pref = ""; d.cat = "lain"; }
  if(type === "PF") d.due = addDays(t, 7);
  if(type === "PO") d.deliv = addDays(t, 7);
  if(type === "CS"){ d.method = "cash"; }
  return d; }

// ---------- 0.6.29 recurring invoices: an issued invoice with doc.recur {f:"w"|"m"|"y", next, end} makes a new draft when due ----------
function nextD(d, f){ var p = d.split("-"), y = +p[0], m = +p[1] - 1, dd = +p[2]; if(f === "w") return addDays(d, 7); if(f === "y") return ymd(new Date(y + 1, m, Math.min(dd, new Date(y + 1, m + 1, 0).getDate())));
  return ymd(new Date(y, m + 1, Math.min(dd, new Date(y, m + 2, 0).getDate()))); }
function recurInv(D, pid){ var t = ymd(), made = []; live(D.docs).forEach(function(src){ var r = src.recur; if(src.pid !== pid || !r || !r.next || src.status === "void") return; var g = 0;
    while(r.next <= t && (!r.end || r.next <= r.end) && g++ < 24){ var p = byId(D.profiles, pid), d = blankDoc(D, p, src.type), keep = ["cust","custId","lines","disc","discT","ship","other","notes","terms","sig","stamp","design","color","lang","pterm","cur","rate","round"];
      keep.forEach(function(k){ if(src[k] != null) d[k] = clone(src[k]); }); d.date = r.next; if(d.type === "INV"){ var m = /Net (\d+)/.exec(d.pterm || ""); d.due = addDays(d.date, m ? +m[1] : (+p.due || 14)); }
      d.recurFrom = src.id; d.mk = src.mk; stamp(D, d); D.docs.push(d); log(D, d.id, "recur"); made.push(d); r.next = nextD(r.next, r.f); }
    if(g) stamp(D, src); }); return made; }

// ---------- amount in words ----------
var BM1 = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Lapan", "Sembilan"];
function bm999(n){ var h = Math.floor(n / 100), r = n % 100, out = [];
  if(h) out.push(BM1[h] + " Ratus");
  if(r){ if(r < 10) out.push(BM1[r]); else if(r === 10) out.push("Sepuluh"); else if(r === 11) out.push("Sebelas"); else if(r < 20) out.push(BM1[r - 10] + " Belas");
    else out.push(BM1[Math.floor(r / 10)] + " Puluh" + (r % 10 ? " " + BM1[r % 10] : "")); }
  return out.join(" "); }
function bmInt(n){ if(n === 0) return "Kosong"; var parts = [], S = [[1e9, "Bilion"], [1e6, "Juta"], [1e3, "Ribu"]];
  S.forEach(function(s){ var q = Math.floor(n / s[0]); if(q){ parts.push(bm999(q) + " " + s[1]); n %= s[0]; } });
  if(n) parts.push(bm999(n)); return parts.join(" "); }
var EN1 = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"],
  EN10 = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
function en999(n){ var h = Math.floor(n / 100), r = n % 100, out = []; if(h) out.push(EN1[h] + " Hundred");
  if(r){ out.push(r < 20 ? EN1[r] : EN10[Math.floor(r / 10)] + (r % 10 ? "-" + EN1[r % 10] : "")); } return out.join(" "); }
function enInt(n){ if(n === 0) return "Zero"; var parts = [], S = [[1e9, "Billion"], [1e6, "Million"], [1e3, "Thousand"]];
  S.forEach(function(s){ var q = Math.floor(n / s[0]); if(q){ parts.push(en999(q) + " " + s[1]); n %= s[0]; } }); if(n) parts.push(en999(n)); return parts.join(" "); }
var CURW = {MYR:["Ringgit Malaysia","Ringgit Malaysia","Sen","Cents"], SGD:["Dolar Singapura","Singapore Dollars","Sen","Cents"], USD:["Dolar AS","US Dollars","Sen","Cents"], IDR:["Rupiah","Rupiah","Sen","Cents"], BND:["Dolar Brunei","Brunei Dollars","Sen","Cents"],
  EUR:["Euro","Euros","Sen","Cents"], GBP:["Paun Sterling","Pounds Sterling","Pence","Pence"], AUD:["Dolar Australia","Australian Dollars","Sen","Cents"], CNY:["Yuan","Yuan","Fen","Fen"], JPY:["Yen","Yen","Sen","Sen"], THB:["Baht","Baht","Satang","Satang"], SAR:["Riyal Saudi","Saudi Riyals","Halala","Halalas"], AED:["Dirham UAE","UAE Dirhams","Fils","Fils"], INR:["Rupee India","Indian Rupees","Paisa","Paise"]};
function words(c, lang, cur){ c = Math.round(Math.abs(c)); var r = Math.floor(c / 100), s = c % 100, w = CURW[cur || "MYR"] || CURW.MYR;
  if(lang === "en") return w[1] + ": " + (r || !s ? enInt(r) : "") + (s ? (r ? " and " : "") + w[3] + " " + enInt(s) : "") + " Only";
  return w[0] + ": " + (r || !s ? bmInt(r) : "") + (s ? (r ? " dan " : "") + w[2] + " " + bmInt(s) : "") + " Sahaja"; }

// ---------- CSV ----------
function csvParse(txt){ txt = String(txt || "").replace(/^﻿/, ""); var sep = (txt.split("\n")[0].match(/;/g) || []).length > (txt.split("\n")[0].match(/,/g) || []).length ? ";" : ",";
  var rows = [], row = [], f = "", q = false;
  for(var i = 0; i < txt.length; i++){ var ch = txt[i];
    if(q){ if(ch === '"'){ if(txt[i + 1] === '"'){ f += '"'; i++; } else q = false; } else f += ch; continue; }
    if(ch === '"') q = true; else if(ch === sep){ row.push(f); f = ""; } else if(ch === "\n"){ row.push(f.replace(/\r$/, "")); rows.push(row); row = []; f = ""; } else f += ch; }
  if(f !== "" || row.length){ row.push(f.replace(/\r$/, "")); rows.push(row); }
  return rows.filter(function(r){ return r.some(function(x){ return String(x).trim() !== ""; }); }); }
function csvCell(v){ v = v == null ? "" : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function csvMake(rows){ return "﻿" + rows.map(function(r){ return r.map(csvCell).join(","); }).join("\n"); }
// "31/12/2026", "2026-12-31", "31-12-26" → 2026-12-31
function pDate(s){ s = String(s || "").trim(); var m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/); if(m) return m[1] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[3]).slice(-2);
  m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/); if(m){ var y = m[3].length === 2 ? "20" + m[3] : m[3]; return y + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[1]).slice(-2); } return ""; }

// ---------- merge (import / restore): by id, newer rev/upd wins, never duplicates ----------
function newer(a, b){ if((a.rev || 0) !== (b.rev || 0)) return (a.rev || 0) > (b.rev || 0); return String(a.upd || "") > String(b.upd || ""); }
function mergeInto(D, src, onlyPid){ var n = {add:0, upd:0, same:0};
  ["profiles","customers","items","docs","expenses","bkcfg","bookings"].forEach(function(k){ (src[k] || []).forEach(function(r){ if(onlyPid && (k === "profiles" ? r.id : r.pid) !== onlyPid) return;
    var cur = byId(D[k], r.id); if(!cur){ D[k].push(r); n.add++; } else if(newer(r, cur)){ D[k][D[k].indexOf(cur)] = r; n.upd++; } else n.same++; }); });
  Object.keys(src.ctr || {}).forEach(function(k){ if(onlyPid && k.indexOf(onlyPid + "|") !== 0) return; D.ctr[k] = Math.max(D.ctr[k] || 0, src.ctr[k] || 0); });
  return n; }

window.NiagaDoc = {KEY:KEY, TYPES:TYPES, ORDER:ORDER, ALLT:ALLT, CURS:CURS, sym:sym, docCur:docCur, rate:rate, recurInv:recurInv, nextD:nextD, METHODS:METHODS, UNITS:UNITS, TAXES:TAXES, ST_LAB:ST_LAB, DEF_FMT:DEF_FMT,
  rid:rid, iso:iso, ymd:ymd, addDays:addDays, daysBetween:daysBetween, sen:sen, rm:rm, num:num, fmt:fmt, calc:calc,
  blank:blank, fix:fix, stamp:stamp, log:log, live:live, byId:byId, newProfile:newProfile, blankDoc:blankDoc, makeFrom:makeFrom, clone:clone,
  numCfg:numCfg, fmtNo:fmtNo, peekNo:peekNo, takeNo:takeNo, usedNo:usedNo, lineAmt:lineAmt, totals:totals, cache:cache, paymentsFor:paymentsFor, status:status, profOf:profOf,
  words:words, bmInt:bmInt, enInt:enInt, csvParse:csvParse, csvMake:csvMake, pDate:pDate, mergeInto:mergeInto, newer:newer};
})();
