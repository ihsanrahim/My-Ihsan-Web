/* My Ihsan 0.6.26 · Kewangan › Niaga › Google Sheet: the Apps Script the person pastes into their own empty Google Sheet.
   The app replaces __TOKEN__ with a fresh random setup token. Kept as text (no backticks or dollar-braces inside). */
window.NIAGA_GAS = String.raw`/* My Ihsan · Niaga account book (Apps Script). Paste into Extensions > Apps Script, then Deploy > New deployment > Web app,
   Execute as: Me, Who has access: Anyone. The app talks to this script only; your Google password never leaves Google.
   Hidden tabs _data, _log, _dev, _inv, _num belong to the app. Add your own columns to the right of any visible tab: the app never touches them. */
var TOKEN = "__TOKEN__";
var VER = 5;
var TABS = ["Ringkasan","Dokumen","Butiran","Bayaran","Belanja","Pelanggan","Barang","Lejar","Cukai","Tetapan"];
var HID = {_data:["id","kind","pid","rev","upd","by","del","seq","j1","j2","j3","j4"], _log:["seq","id","kind","rev","dev","time"], _dev:["id","name","letter","role","key","first","last","app","revoked"], _inv:["code","role","exp","used"], _num:["letter","type","period","last"], _img:["id","file","at"]};

function doGet(e){ var b = e && e.parameter && e.parameter.book; if(b) return bkHtml(String(b)); return out({ok:true, app:"My Ihsan Niaga", v:VER}); }
function doPost(e){
  var q = {}; try{ q = JSON.parse(e.postData.contents); }catch(x){ return out({ok:false, err:"bad json"}); }
  try{ return out(route(q)); }catch(x){ return out({ok:false, err:String(x && x.message || x)}); } }
function out(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function props(){ return PropertiesService.getScriptProperties(); }
function token(){ return props().getProperty("TOKEN") || TOKEN; }
function ss(){ return SpreadsheetApp.getActiveSpreadsheet(); }
function now(){ return new Date().toISOString(); }
function rnd(n){ var a = "abcdefghjkmnpqrstuvwxyz23456789", s = ""; for(var i = 0; i < n; i++) s += a.charAt(Math.floor(Math.random() * a.length)); return s; }

function route(q){
  var op = q.op;
  if(op === "ping") return {ok:true, v:VER, name:ss().getName(), url:ss().getUrl(), pid:props().getProperty("PID") || "", seq:+(props().getProperty("SEQ") || 0)};
  if(op === "hello") return hello(q);
  if(op === "join") return join(q);
  var me = auth(q); if(!me) return {ok:false, err:"auth"};
  touchDev(me, q);
  if(op === "push") return withLock(function(){ return push(me, q.rows || []); });
  if(op === "pull") return pull(q.since || 0, q.limit || 500);
  if(op === "imgget"){ var f = imgFile(q.id); return f ? {ok:true, data:f.getBlob().getDataAsString()} : {ok:false, err:"none"}; }
  if(op === "tabs") return {ok:true, tabs:ss().getSheets().map(function(x){ return x.getName(); }).filter(function(n){ return TABS.indexOf(n) < 0 && n.charAt(0) !== "_"; })};
  if(op === "readtab"){ var t = ss().getSheetByName(q.name); if(!t) return {ok:false, err:"none"}; var lr = t.getLastRow(), lc = t.getLastColumn ? t.getLastColumn() : 20; if(lr < 1) return {ok:true, rows:[]};
    return {ok:true, rows:t.getRange(1, 1, Math.min(lr, 5000), Math.max(1, lc)).getValues().map(function(r){ return r.map(function(v){ return v instanceof Date ? Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(v); }); })}; }
  if(op === "pdfput") return withLock(function(){ var f = pdfFolder(String(q.year || "")).createFile(Utilities.newBlob(Utilities.base64Decode(q.b64), "application/pdf", String(q.name || "doc.pdf"))); return {ok:true, url:f.getUrl(), id:f.getId()}; });
  if(op === "imglist") return {ok:true, ids:rows("_img").map(function(r){ return r[0]; })};
  if(op === "devs") return {ok:true, devs:devs().map(function(d){ return {id:d.id, name:d.name, letter:d.letter, role:d.role, first:d.first, last:d.last, app:d.app, revoked:d.revoked}; })};
  if(me.role !== "owner") return {ok:false, err:"role"};
  if(op === "setup") return withLock(function(){ setup(); rebuild(); return {ok:true, url:ss().getUrl()}; });
  if(op === "rebuild") return withLock(function(){ setup(); rebuild(); return {ok:true}; });
  if(op === "imgput") return withLock(function(){ var old = imgFile(q.id); if(old) return {ok:true, had:true}; var f = folder().createFile(q.id + ".txt", String(q.data || ""), "text/plain"); sheet("_img").appendRow([q.id, f.getId(), now()]); return {ok:true}; });
  if(op === "invite"){ var code = rnd(8); sheet("_inv").appendRow([code, q.role === "staff" ? "staff" : "owner", Date.now() + 10 * 60000, ""]); return {ok:true, code:code}; }
  if(op === "revoke") return withLock(function(){ var n = setDev(q.id, "revoked", "yes"); return {ok:n > 0}; });
  if(op === "role") return withLock(function(){ var n = setDev(q.id, "role", q.role === "staff" ? "staff" : "owner"); return {ok:n > 0}; });
  return {ok:false, err:"op"}; }
function withLock(f){ var l = LockService.getScriptLock(); l.waitLock(30000); try{ return f(); } finally { l.releaseLock(); } }

// ---------- devices ----------
function sheet(n){ var s = ss().getSheetByName(n); if(!s){ s = ss().insertSheet(n); var h = HID[n]; if(h){ s.getRange(1, 1, 1, h.length).setValues([h]); s.setFrozenRows(1); s.hideSheet(); try{ s.protect().setWarningOnly(true); }catch(x){} } } return s; }
function rows(n){ var s = sheet(n), last = s.getLastRow(); if(last < 2) return []; var h = HID[n]; return s.getRange(2, 1, last - 1, h.length).getValues(); }
function devs(){ return rows("_dev").map(function(r, i){ return {row:i + 2, id:r[0], name:r[1], letter:r[2], role:r[3], key:r[4], first:r[5], last:r[6], app:r[7], revoked:r[8] === "yes"}; }); }
function auth(q){ if(!q.dev || !q.key) return null; var d = devs().filter(function(x){ return x.id === q.dev && x.key === q.key && !x.revoked; })[0]; return d || null; }
function setDev(id, col, v){ var c = HID._dev.indexOf(col) + 1, n = 0; devs().forEach(function(d){ if(d.id === id){ sheet("_dev").getRange(d.row, c).setValue(v); n++; } }); return n; }
function touchDev(me, q){ try{ var s = sheet("_dev"); s.getRange(me.row, 7).setValue(now()); if(q.app) s.getRange(me.row, 8).setValue(q.app); }catch(x){} }
// letters ever handed out: once a second phone has joined, numbers keep their phone letter for good
function letters(){ var u = {}; devs().forEach(function(d){ u[d.letter] = 1; }); return Object.keys(u).length; }
function nextLetter(){ var used = devs().map(function(d){ return d.letter; }), A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; for(var i = 0; i < A.length; i++) if(used.indexOf(A.charAt(i)) < 0) return A.charAt(i); return "Z" + used.length; }
function addDev(dev, role, letter){ var key = rnd(32); sheet("_dev").appendRow([dev.id, dev.name || "", letter, role, key, now(), now(), dev.app || "", ""]); return key; }
function hello(q){ if(!q.token || q.token !== token()) return {ok:false, err:"token"};
  return withLock(function(){ var pid = props().getProperty("PID") || "";
    if(q.pid && pid && q.pid !== pid && !q.join) return {ok:false, err:"other", pid:pid};
    if(q.pid && !pid){ props().setProperty("PID", q.pid); pid = q.pid; }
    var dv = q.dev || {}, letter = "", ds = devs();
    var same = ds.filter(function(d){ return d.id === dv.id; })[0]; if(same) setDev(same.id, "revoked", "yes");
    if(q.replace){ ds.forEach(function(d){ if(d.letter === q.replace && !d.revoked) setDev(d.id, "revoked", "yes"); }); letter = q.replace; }
    else if(same) letter = same.letter; else letter = ds.length ? nextLetter() : "A";
    var key = addDev(dv, "owner", letter);
    setup(); return {ok:true, key:key, letter:letter, role:"owner", pid:pid, name:ss().getName(), url:ss().getUrl(), devs:letters()}; }); }
function join(q){ return withLock(function(){ var s = sheet("_inv"), r = rows("_inv"), hit = -1;
  r.forEach(function(x, i){ if(x[0] === q.code && !x[3] && +x[2] > Date.now()) hit = i; });
  if(hit < 0) return {ok:false, err:"code"};
  s.getRange(hit + 2, 4).setValue(now());
  var letter = nextLetter(), role = r[hit][1], key = addDev(q.dev || {}, role, letter);
  return {ok:true, key:key, letter:letter, role:role, pid:props().getProperty("PID") || "", name:ss().getName(), url:ss().getUrl(), devs:letters()}; }); }

// ---------- profile images (logo, signatures, stamp, QR) in a private Drive folder, only when the owner turns it on ----------
function folder(){ var n = "My Ihsan Niaga - " + ss().getName(), it = DriveApp.getFoldersByName(n); return it.hasNext() ? it.next() : DriveApp.createFolder(n); }
function pdfFolder(y){ var f = folder(), n = "PDF " + (y || new Date().getFullYear()), it = f.getFoldersByName(n); return it.hasNext() ? it.next() : f.createFolder(n); }
function imgFile(id){ var r = rows("_img").filter(function(x){ return x[0] === id; })[0]; if(!r) return null; try{ return DriveApp.getFileById(r[1]); }catch(e){ return null; } }

// ---------- data ----------
function dataMap(){ var m = {}, r = rows("_data"); r.forEach(function(x, i){ m[x[0]] = {row:i + 2, id:x[0], kind:x[1], pid:x[2], rev:+x[3], upd:String(x[4]), by:x[5], del:x[6] === "yes", json:String(x[8]) + String(x[9] || "") + String(x[10] || "") + String(x[11] || "")}; }); return m; }
function chunks(s){ s = String(s || ""); var a = []; for(var i = 0; i < 4; i++) a.push(s.slice(i * 45000, (i + 1) * 45000)); return a; }
function newer(a, b){ if((+a.rev || 0) !== (+b.rev || 0)) return (+a.rev || 0) > (+b.rev || 0); return String(a.upd || "") > String(b.upd || ""); }
function push(me, list){ var m = dataMap(), ds = sheet("_data"), lg = sheet("_log"), seq = +(props().getProperty("SEQ") || 0), rej = [], newRows = [], logs = [], ok = 0;
  var nos = {}; Object.keys(m).forEach(function(id){ var x = m[id]; if(x.kind === "doc" && !x.del){ try{ var j = JSON.parse(x.json); if(j.no && j.status !== "draft") nos[x.pid + "|" + j.type + "|" + j.no] = id; }catch(e){} } });
  list.forEach(function(r){ if(!r || !r.id) return; var cur = m[r.id], j = null; try{ j = JSON.parse(r.json); }catch(e){ rej.push({id:r.id, why:"json"}); return; }
    if(me.role === "staff"){ var was = cur ? JSON.parse(cur.json) : null;
      if(r.kind === "profile" || (r.kind === "doc" && j.status === "void" && !(was && was.status === "void")) || (r.del && r.kind !== "doc") || (r.del && j.status !== "draft")){ rej.push({id:r.id, why:"role", server:cur ? cur.json : ""}); return; } }
    if(r.kind === "doc" && j.no && j.status !== "draft" && !r.del){ var k = r.pid + "|" + j.type + "|" + j.no; if(nos[k] && nos[k] !== r.id){ rej.push({id:r.id, why:"dup"}); return; } nos[k] = r.id; }
    if(cur && !newer(r, cur)){ if(+cur.rev === +r.rev && cur.upd === String(r.upd)){ ok++; return; } rej.push({id:r.id, why:"old", rev:cur.rev, upd:cur.upd, del:cur.del, server:cur.json}); return; }
    seq++; var vals = [r.id, r.kind, r.pid || "", +r.rev || 0, String(r.upd || ""), r.by || me.id, r.del ? "yes" : "", seq].concat(chunks(r.json));
    if(cur){ ds.getRange(cur.row, 1, 1, vals.length).setValues([vals]); cur.rev = +r.rev; cur.upd = String(r.upd); cur.json = r.json; }
    else { newRows.push(vals); m[r.id] = {id:r.id}; }
    logs.push([seq, r.id, r.kind, +r.rev || 0, me.letter, now()]); ok++; });
  if(newRows.length) ds.getRange(ds.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  if(logs.length) lg.getRange(lg.getLastRow() + 1, 1, logs.length, 6).setValues(logs);
  props().setProperty("SEQ", String(seq));
  if(logs.length) rebuild();
  return {ok:true, seq:seq, done:ok, rejected:rej}; }
function pull(since, limit){ var lg = rows("_log").filter(function(x){ return +x[0] > since; }).sort(function(a, b){ return a[0] - b[0]; }), m = dataMap(), seen = {}, outR = [], last = since, more = false;
  for(var i = 0; i < lg.length; i++){ if(outR.length >= limit){ more = true; break; } var id = lg[i][1]; last = +lg[i][0]; if(seen[id]) continue; seen[id] = 1; var x = m[id]; if(x) outR.push({id:x.id, kind:x.kind, pid:x.pid, rev:x.rev, upd:x.upd, by:x.by, del:x.del, json:x.json}); }
  return {ok:true, rows:outR, seq:last, more:more, top:+(props().getProperty("SEQ") || 0), nd:letters()}; }

// ---------- visible tabs (rebuilt from _data) ----------
function tab(n, head){ var s = ss().getSheetByName(n); if(!s) s = ss().insertSheet(n); if(head){ s.getRange(1, 1, 1, head.length).setValues([head]); s.setFrozenRows(1); try{ s.getRange(1, 1, 1, head.length).setFontWeight("bold").setBackground("#0f5132").setFontColor("#ffffff"); }catch(x){} } return s; }
function fill(s, ncol, vals, from){ from = from || 2; var last = Math.max(s.getLastRow(), from); if(last >= from) s.getRange(from, 1, last - from + 1, ncol).clearContent(); if(vals.length) s.getRange(from, 1, vals.length, ncol).setValues(vals); }
function dt(s){ if(!s) return ""; var p = String(s).slice(0, 10).split("-"); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : ""; }
function n2(v){ var x = +String(v == null ? "" : v).replace(/,/g, ""); return isFinite(x) ? x : 0; }
var H = {Dokumen:["ID","Jenis","No.","Tarikh","Tarikh akhir","Pelanggan","Jumlah kecil","Diskaun","Cukai","Jumlah","Dibayar","Baki","Status","Berkaitan","Telefon","Dikemas kini","Mata wang","Jumlah asal","PDF"],
  Butiran:["No. dokumen","Jenis","Tarikh","Perkara","Kuantiti","Unit","Harga","Diskaun","Cukai %","Amaun","ID barang"],
  Bayaran:["No.","Tarikh","Pelanggan","Kaedah","Rujukan","Amaun","Untuk","Jenis"],
  Belanja:["Tarikh","Kategori","Pembekal","Amaun","SST","Kaedah","Nota","Layanan cukai","Boleh ditolak","No. resit","Wang runcit"],
  Pelanggan:["ID","Nama","Syarikat","Telefon","E-mel","Dibil","Dibayar","Baki"],
  Barang:["ID","Nama","Unit","Harga","Terjual","Hasil"],
  Lejar:["Tarikh","Keterangan","Masuk","Keluar","Baki"],
  Cukai:["Bulan","Kadar %","Cukai dikutip"],
  Tetapan:["Perkara","Nilai"]};
function setup(){ TABS.forEach(function(n){ var s = tab(n, H[n]); }); Object.keys(HID).forEach(function(n){ sheet(n); });
  var d = ss().getSheetByName("Sheet1") || ss().getSheetByName("Helaian1"); if(d && d.getLastRow() < 1 && ss().getSheets().length > 1) try{ ss().deleteSheet(d); }catch(x){}
  summary(); }
function rebuild(){ var m = dataMap(), all = Object.keys(m).map(function(k){ return m[k]; }).filter(function(x){ return !x.del; }), J = function(x){ try{ return JSON.parse(x.json); }catch(e){ return {}; } };
  var docs = all.filter(function(x){ return x.kind === "doc"; }).map(function(x){ var j = J(x); j._by = x.by; return j; }).filter(function(j){ return j.status && j.status !== "draft"; }).sort(function(a, b){ return String(a.date).localeCompare(String(b.date)) || String(a.no).localeCompare(String(b.no)); });
  var byId = {}; docs.forEach(function(d){ byId[d.id] = d; });
  var custs = all.filter(function(x){ return x.kind === "customer"; }).map(J), items = all.filter(function(x){ return x.kind === "item"; }).map(J), exps = all.filter(function(x){ return x.kind === "expense"; }).map(J).filter(function(e){ return !e.rule && !e.pending && e.cat !== "_topup"; }), prof = all.filter(function(x){ return x.kind === "profile"; }).map(J)[0] || {};
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var st = function(d){ var t = d.totals || {}; if(d.status === "void") return "void"; if(d.type === "INV"){ if(n2(t.total) > 0 && n2(t.bal) <= 0) return "paid"; if(d.due && dt(d.due) < today) return "overdue"; return n2(t.paid) > 0 ? "partial" : "sent"; } if(d.type === "CS" || d.type === "OR" || d.type === "PV") return "paid"; if(d.type === "CN" || d.type === "DN") return "issued"; if(d.type === "QT") return d.status === "rejected" ? "rejected" : (d.to || []).length || d.status === "accepted" ? "accepted" : "sent"; return d.status; };
  var tx = function(t){ var s = 0; Object.keys(t || {}).forEach(function(k){ s += n2(t[k]); }); return s; };
  var base = prof.base || "MYR", rt = function(d){ return d.cur && d.cur !== base ? (+d.rate || 1) : 1; }, r2 = function(v, d){ return Math.round(n2(v) * rt(d) * 100) / 100; };
  fill(tab("Dokumen"), 19, docs.map(function(d){ var t = d.totals || {}, link = [d.from ? (byId[d.from] || {}).no || "" : ""].concat((d.to || []).map(function(i){ return (byId[i] || {}).no || ""; })).filter(String).join(", ");
    return [d.id, d.type, d.no, dt(d.date), dt(d.due), (d.cust || {}).name || "", r2(t.sub, d), r2(t.disc, d), Math.round(tx(t.tax) * rt(d) * 100) / 100, r2(t.total, d), r2(t.paid, d), d.type === "INV" ? r2(t.bal, d) : 0, st(d), link, d.no && /-([A-Z])\d+$/.test(d.no) ? RegExp.$1 : "", d.upd || "", d.cur || base, n2(t.total), d.pdfUrl || ""]; }));
  var lines = []; docs.forEach(function(d){ if(d.type === "OR") return; (d.lines || []).forEach(function(l){ if(l.t === "head") return; var g = n2(l.qty) * n2(l.price), ds = l.discT === "%" ? g * n2(l.disc) / 100 : n2(l.disc); lines.push([d.no, d.type, dt(d.date), l.desc || "", n2(l.qty), l.unit || "", n2(l.price), Math.round(ds * 100) / 100, n2(l.tax), d.type === "DO" ? 0 : Math.round((g - ds) * 100) / 100, l.item || ""]); }); });
  fill(tab("Butiran"), 11, lines);
  var pays = []; docs.forEach(function(d){ if(d.status === "void") return; if(d.type === "OR") pays.push([d.no, dt(d.pdate || d.date), (d.cust || {}).name || "", d.method || "", d.pref || "", r2((d.totals || {}).total, d), (d.apply || []).map(function(a){ return (byId[a.doc] || {}).no || ""; }).filter(String).join(", "), d.dep ? "Deposit" : "Resit"]);
    if(d.type === "CS") pays.push([d.no, dt(d.date), (d.cust || {}).name || "", d.method || "cash", "", r2((d.totals || {}).total, d), d.no, "Bil tunai"]); });
  fill(tab("Bayaran"), 8, pays);
  var TAXC = {hiburan:"50%", aset:"Elaun modal", zakat:"Zakat (had 2.5%)", derma:"Tidak", peribadi:"Tidak", denda:"Tidak"};
  fill(tab("Belanja"), 11, exps.sort(function(a, b){ return String(a.date).localeCompare(String(b.date)); }).map(function(e){ var t = e.ded === "full" ? "Penuh" : e.ded === "half" ? "50%" : e.ded === "no" ? "Tidak" : TAXC[e.cat] || "Penuh", a = n2(e.amt);
    return [dt(e.date), e.cat || "", e.vendor || "", a, n2(e.tax), e.method === "petty" ? "wang runcit" : e.method || "", e.note || "", t, t === "Penuh" ? a : t === "50%" ? Math.round(a * 50) / 100 : 0, e.ref || "", e.method === "petty" ? "ya" : ""]; }));
  var cs = tab("Pelanggan"); fill(cs, 8, custs.map(function(c, i){ var r = i + 2; return [c.id, c.name || "", c.co || "", c.phone || "", c.email || "",
    "=SUMIFS(Dokumen!$J:$J,Dokumen!$F:$F,$B" + r + ",Dokumen!$B:$B,\"INV\",Dokumen!$M:$M,\"<>void\")+SUMIFS(Dokumen!$J:$J,Dokumen!$F:$F,$B" + r + ",Dokumen!$B:$B,\"CS\",Dokumen!$M:$M,\"<>void\")",
    "=SUMIFS(Bayaran!$F:$F,Bayaran!$C:$C,$B" + r + ")", "=SUMIFS(Dokumen!$L:$L,Dokumen!$F:$F,$B" + r + ",Dokumen!$M:$M,\"<>void\")"]; }));
  fill(tab("Barang"), 6, items.map(function(x, i){ var r = i + 2; return [x.id, x.name || "", x.unit || "", n2(x.price), "=SUMIFS(Butiran!$E:$E,Butiran!$K:$K,$A" + r + ",Butiran!$B:$B,\"<>QT\",Butiran!$B:$B,\"<>DO\")", "=SUMIFS(Butiran!$J:$J,Butiran!$K:$K,$A" + r + ",Butiran!$B:$B,\"<>QT\",Butiran!$B:$B,\"<>DO\")"]; }));
  var led = pays.map(function(p){ return [p[1], (p[7] === "Bil tunai" ? "Bil tunai " : "Resit ") + p[0] + " · " + p[2], p[5], 0]; }).concat(exps.map(function(e){ return [dt(e.date), "Belanja · " + (e.vendor || e.cat || ""), 0, n2(e.amt)]; }))
    .sort(function(a, b){ return (a[0] || 0) - (b[0] || 0); }).map(function(r, i){ return r.concat([i ? "=E" + (i + 1) + "+C" + (i + 2) + "-D" + (i + 2) : "=C2-D2"]); });
  fill(tab("Lejar"), 5, led);
  var tax = {}; docs.forEach(function(d){ if(d.status === "void" || (d.type !== "INV" && d.type !== "CS")) return; Object.keys((d.totals || {}).tax || {}).forEach(function(r){ var k = String(d.date).slice(0, 7) + "|" + r; tax[k] = (tax[k] || 0) + n2(d.totals.tax[r]); }); });
  fill(tab("Cukai"), 3, Object.keys(tax).sort().map(function(k){ var p = k.split("|"); return [p[0], +p[1], Math.round(tax[k] * 100) / 100]; }));
  var nums = {}; docs.forEach(function(d){ var mm = /-([A-Z]?)(\d+)$/.exec(d.no || ""); if(!mm) return; var k = (mm[1] || "A") + "|" + d.type + "|" + String(d.date).slice(0, 4); nums[k] = Math.max(nums[k] || 0, +mm[2]); });
  fill(sheet("_num"), 4, Object.keys(nums).sort().map(function(k){ var p = k.split("|"); return [p[0], p[1], p[2], nums[k]]; }));
  fill(tab("Tetapan"), 2, [["Perniagaan", prof.name || ""], ["Mata wang", prof.base || "MYR"], ["Sync terakhir", new Date()], ["Versi skrip", VER], ["Dokumen", docs.length], ["Pelanggan", custs.length], ["Barang", items.length], ["Telefon", devs().filter(function(d){ return !d.revoked; }).length]]); }
function summary(){ var s = tab("Ringkasan"); if(s.getRange(1, 1).getValue() === "Ringkasan My Ihsan Niaga" && s.getRange(1, 4).getValue() === "v" + VER) return;
  var M = ["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"], v = [["Ringkasan My Ihsan Niaga", ""], ["Tahun", "=YEAR(TODAY())"], ["", ""],
    ["Belum dibayar", "=SUMIFS(Dokumen!$L:$L,Dokumen!$B:$B,\"INV\",Dokumen!$M:$M,\"<>void\")"], ["Lewat", "=SUMIFS(Dokumen!$L:$L,Dokumen!$B:$B,\"INV\",Dokumen!$E:$E,\"<\"&TODAY(),Dokumen!$M:$M,\"<>void\")"],
    ["Sebut harga terbuka", "=SUMIFS(Dokumen!$J:$J,Dokumen!$B:$B,\"QT\",Dokumen!$M:$M,\"sent\")"], ["", ""]];
  try{ s.getCharts().forEach(function(c){ s.removeChart(c); }); }catch(x){}
  s.getRange(1, 1, v.length, 2).setValues(v); s.getRange(1, 4).setValue("v" + VER);
  var hd = [["Bulan", "Jualan", "Kutipan", "Belanja", "Untung kasar"]], rowsM = [];
  for(var i = 0; i < 12; i++){ var r = 9 + i, a = "DATE($B$2," + (i + 1) + ",1)", b = "DATE($B$2," + (i + 2) + ",1)";
    rowsM.push([M[i], ["INV","CS","DN","CN"].map(function(ty, k){ return (k === 3 ? "-" : k ? "+" : "=") + "SUMIFS(Dokumen!$J:$J,Dokumen!$B:$B,\"" + ty + "\",Dokumen!$D:$D,\">=\"&" + a + ",Dokumen!$D:$D,\"<\"&" + b + ",Dokumen!$M:$M,\"<>void\")"; }).join(""),
      "=SUMIFS(Bayaran!$F:$F,Bayaran!$B:$B,\">=\"&" + a + ",Bayaran!$B:$B,\"<\"&" + b + ")", "=SUMIFS(Belanja!$D:$D,Belanja!$A:$A,\">=\"&" + a + ",Belanja!$A:$A,\"<\"&" + b + ")", "=C" + r + "-D" + r]); }
  rowsM.push(["Jumlah", "=SUM(B9:B20)", "=SUM(C9:C20)", "=SUM(D9:D20)", "=SUM(E9:E20)"]);
  s.getRange(8, 1, 1, 5).setValues(hd); s.getRange(9, 1, 13, 5).setValues(rowsM);
  var ag = [["Umur hutang", "Amaun"], ["Semasa", "=SUMIFS(Dokumen!$L:$L,Dokumen!$B:$B,\"INV\",Dokumen!$E:$E,\">=\"&TODAY(),Dokumen!$M:$M,\"<>void\")"]];
  [[1, 30], [31, 60], [61, 90]].forEach(function(b){ ag.push([b[0] + "–" + b[1] + " hari", "=SUMIFS(Dokumen!$L:$L,Dokumen!$B:$B,\"INV\",Dokumen!$E:$E,\"<=\"&(TODAY()-" + b[0] + "),Dokumen!$E:$E,\">=\"&(TODAY()-" + b[1] + "),Dokumen!$M:$M,\"<>void\")"]); });
  ag.push(["90+ hari", "=SUMIFS(Dokumen!$L:$L,Dokumen!$B:$B,\"INV\",Dokumen!$E:$E,\"<\"&(TODAY()-90),Dokumen!$M:$M,\"<>void\")"]);
  s.getRange(8, 7, ag.length, 2).setValues(ag);
  s.getRange(15, 7, 1, 2).setValues([["Pelanggan utama (kutipan)", ""]]);
  s.getRange(16, 7).setFormula("=IFERROR(QUERY(Bayaran!A2:H,\"select C, sum(F) where C is not null group by C order by sum(F) desc limit 5 label sum(F) ''\",0),\"\")");
  try{ s.getRange("A1").setFontSize(16).setFontWeight("bold"); s.getRange(8, 1, 1, 5).setFontWeight("bold"); s.getRange(8, 7, 1, 2).setFontWeight("bold"); s.getRange(4, 2, 3, 1).setNumberFormat("#,##0.00"); s.getRange(9, 2, 13, 4).setNumberFormat("#,##0.00"); s.getRange(9, 8, 5, 1).setNumberFormat("#,##0.00");
    s.insertChart(s.newChart().setChartType(Charts.ChartType.COLUMN).addRange(s.getRange(8, 1, 13, 3)).setPosition(23, 1, 0, 0).setOption("title", "Jualan & kutipan").build());
    s.insertChart(s.newChart().setChartType(Charts.ChartType.PIE).addRange(s.getRange(9, 7, 5, 2)).setPosition(23, 7, 0, 0).setOption("title", "Umur hutang").build()); }catch(x){}
  try{ ss().setActiveSheet(s); ss().moveActiveSheet(1); }catch(x){} }

// ---------- 0.6.53 public booking page: <web app url>?book=<business id> (no sign-in; the customer sees free dates only) ----------
function bkRow(id){ var m = dataMap(); return m[id] || null; }
function bkJ(x){ try{ return JSON.parse(x.json); }catch(e){ return {}; } }
function bkAll(pid){ var m = dataMap(), cfg = null, prof = {}, list = []; Object.keys(m).forEach(function(k){ var x = m[k]; if(x.del || x.pid !== pid) return;
    if(x.kind === "bkcfg") cfg = bkJ(x); else if(x.kind === "profile") prof = bkJ(x); else if(x.kind === "booking") list.push(bkJ(x)); });
  return {cfg:cfg, prof:prof, list:list}; }
function bkLive(cfg, list){ var hold = ((cfg.set || {}).hold || 24) * 3600000, t = Date.now(); return list.filter(function(b){ if(b.st === "cancel" || b.st === "expired") return false; if(b.st === "hold" && !(b.pays || []).length && b.made && t - b.made > hold) return false; return true; }); }
function bkPub(pid){ var A = bkAll(pid); if(!A.cfg) return {ok:false, err:"none"}; var s = A.cfg.set || {};
  var units = (A.cfg.units || []).map(function(u){ return {id:u.id, ic:u.ic, name:u.name, mode:u.mode, price:u.price, dow:u.dow || {}, cap:u.cap || 1, ci:u.ci, co:u.co, min:u.min || 1, minDow:u.minDow || {}, slot:u.slot, open:u.open, close:u.close, whole:!!u.whole, pkgs:u.pkgs || [], depT:u.depT, dep:u.dep}; });
  var busy = bkLive(A.cfg, A.list).map(function(b){ return {us:b.us || (b.u ? [b.u] : []), from:b.from, to:b.to, t0:b.t0, t1:b.t1, st:b.st === "block" ? "block" : "busy"}; });
  return {ok:true, name:A.prof.name || ss().getName(), phone:A.prof.phone || "", units:units, addons:(A.cfg.addons || []).map(function(a){ return {id:a.id, ic:a.ic, name:a.name, price:a.price, per:a.per, stock:a.stock || 0}; }), busy:busy,
    set:{hold:s.hold || 24, depT:s.depT || "pct", dep:s.dep == null ? 30 : s.dep, pay:s.pay || "", payLink:s.payLink || "", seasons:s.seasons || [], whole:s.whole || {dow:[]}, pol:s.pol || null}}; }
function bkData(pid){ return JSON.stringify(bkPub(String(pid))); }
function bkDays(u, b){ var out = [], d = new Date(b.from + "T00:00:00Z"), e = new Date((b.to || b.from) + "T00:00:00Z"); if(u.mode === "slot") return [b.from];
  while(u.mode === "night" ? d < e : d <= e){ out.push(d.toISOString().slice(0, 10)); d = new Date(d.getTime() + 86400000); if(out.length > 120) break; } return out; }
function bkCovers(b, uid, k, units){ var us = b.us || (b.u ? [b.u] : []); if(us.indexOf(uid) < 0) return false; var u = units.filter(function(x){ return x.id === uid; })[0]; if(!u) return false;
  if(u.mode === "night") return k >= b.from && k < b.to; if(u.mode === "slot") return k === b.from; return k >= b.from && k <= (b.to || b.from); }
function bkLinked(uid, units){ var u = units.filter(function(x){ return x.id === uid; })[0], w = units.filter(function(x){ return x.whole; })[0]; if(!u || !w || u.mode !== "night") return [uid];
  if(u.whole) return [uid].concat(units.filter(function(x){ return x.mode === "night" && !x.whole; }).map(function(x){ return x.id; })); return [uid, w.id]; }
function bkFree(req, units, live){ for(var j = 0; j < req.us.length; j++){ var u = units.filter(function(x){ return x.id === req.us[j]; })[0]; if(!u) return "unit"; var ks = bkDays(u, req);
    for(var i = 0; i < ks.length; i++){ var n = 0; live.forEach(function(b){ bkLinked(u.id, units).forEach(function(id){ if(!bkCovers(b, id, ks[i], units)) return; if(u.mode === "slot" && b.t0 != null && !(req.t0 < b.t1 && b.t0 < req.t1)) return; n++; }); }); if(n >= (u.cap || 1)) return ks[i]; } } return ""; }
function bkAdd(id, pid, j, rev){ var ds = sheet("_data"), lg = sheet("_log"), seq = +(props().getProperty("SEQ") || 0) + 1, m = dataMap(), cur = m[id];
  var vals = [id, "booking", pid, rev, now(), "web", "", seq].concat(chunks(JSON.stringify(j)));
  if(cur) ds.getRange(cur.row, 1, 1, vals.length).setValues([vals]); else ds.getRange(ds.getLastRow() + 1, 1, 1, vals.length).setValues([vals]);
  lg.getRange(lg.getLastRow() + 1, 1, 1, 6).setValues([[seq, id, "booking", rev, "W", now()]]); props().setProperty("SEQ", String(seq)); }
/** a customer's request from the page: checked again here (dates still free, the hour's limit), then saved as a held booking */
function bkRequest(raw){ var q = {}; try{ q = JSON.parse(raw); }catch(e){ return JSON.stringify({ok:false, err:"json"}); }
  var hr = "RL_" + Math.floor(Date.now() / 3600000), used = +(props().getProperty(hr) || 0); if(used >= 30) return JSON.stringify({ok:false, err:"busy"}); props().setProperty(hr, String(used + 1));
  return withLock(function(){ var pid = String(q.pid || ""), A = bkAll(pid); if(!A.cfg) return JSON.stringify({ok:false, err:"none"});
    var name = String(q.name || "").slice(0, 60).trim(), phone = String(q.phone || "").replace(/[^\d+]/g, "").slice(0, 16); if(!name || phone.length < 8) return JSON.stringify({ok:false, err:"contact"});
    var req = {us:(q.us || []).slice(0, 10).map(String), from:String(q.from || "").slice(0, 10), to:String(q.to || q.from || "").slice(0, 10), t0:q.t0 == null ? null : +q.t0, t1:q.t1 == null ? null : +q.t1};
    if(!/^\d{4}-\d\d-\d\d$/.test(req.from) || !req.us.length) return JSON.stringify({ok:false, err:"dates"});
    var units = A.cfg.units || [], clash = bkFree(req, units, bkLive(A.cfg, A.list)); if(clash) return JSON.stringify({ok:false, err:"full", day:clash});
    var promo = String(q.promo || "").trim().toUpperCase(), P = ((A.cfg.set || {}).promos || []).filter(function(x){ return String(x.code).toUpperCase() === promo; })[0];
    if(promo && (!P || (P.exp && P.exp < new Date().toISOString().slice(0, 10)) || (P.max && A.list.filter(function(b){ return b.promo === P.code; }).length >= P.max))) return JSON.stringify({ok:false, err:"promo"});
    var id = "w" + rnd(14), adds = (q.adds || []).slice(0, 20).map(function(a){ return {id:String(a.id), q:Math.max(0, Math.min(99, +a.q || 0))}; }).filter(function(a){ return a.q > 0; });
    var j = {id:id, pid:pid, us:req.us, u:req.us[0], from:req.from, to:req.to, t0:req.t0, t1:req.t1, name:name, phone:phone, guests:String(+q.guests || 1), note:String(q.note || "").slice(0, 300), adds:adds, promo:P ? P.code : "", pkg:q.pkg ? String(q.pkg) : null,
      st:"hold", made:Date.now(), src:"web", total:Math.max(0, +q.total || 0), pays:[], disc:null};
    bkAdd(id, pid, j, 1); return JSON.stringify({ok:true, ref:id.slice(-6).toUpperCase(), id:id, hold:(A.cfg.set || {}).hold || 24}); }); }
/** the customer's payment proof (a picture): saved in the business's Drive folder and linked to the booking */
function bkProof(id, b64, mime){ return withLock(function(){ var x = bkRow(String(id)); if(!x || x.kind !== "booking") return JSON.stringify({ok:false, err:"none"}); var j = bkJ(x);
  if(String(b64 || "").length > 3000000) return JSON.stringify({ok:false, err:"big"});
  var f = folder(), it = f.getFoldersByName ? f.getFoldersByName("Tempahan") : null, bf = it && it.hasNext() ? it.next() : (f.createFolder ? f.createFolder("Tempahan") : f);
  var file = bf.createFile(Utilities.newBlob(Utilities.base64Decode(String(b64)), mime || "image/jpeg", "bukti-" + id + ".jpg")); j.proofId = file.getId(); j.proofUrl = file.getUrl ? file.getUrl() : ""; j.proofAt = Date.now();
  bkAdd(id, j.pid, j, (+x.rev || 1) + 1); return JSON.stringify({ok:true}); }); }
function bkHtml(pid){ var h = HtmlService.createHtmlOutput(BKPAGE.replace("__PID__", pid.replace(/[^A-Za-z0-9_-]/g, ""))); try{ h.setTitle("Tempahan / Booking").addMetaTag("viewport", "width=device-width, initial-scale=1"); }catch(e){} return h; }
var BKPAGE = "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>\nbody{margin:0;font-family:system-ui,sans-serif;background:#f6f7f5;color:#1d2a22}.w{max-width:560px;margin:0 auto;padding:14px}h1{font-size:22px;margin:6px 0}.c{background:#fff;border-radius:14px;padding:12px;margin:10px 0;box-shadow:0 1px 3px rgba(0,0,0,.08)}\nlabel{display:block;font-size:13px;margin:8px 0 3px;color:#4b5a51}input,select,textarea{width:100%;box-sizing:border-box;padding:10px;border:1px solid #cfd8d2;border-radius:10px;font-size:15px}\n.u{display:flex;gap:8px;align-items:center;padding:8px;border:1px solid #e3e8e5;border-radius:10px;margin:5px 0}.u input{width:20px;flex:none}\n.b{display:block;box-sizing:border-box;text-align:center;text-decoration:none;width:100%;padding:13px;border:0;border-radius:12px;background:#0b5d3b;color:#fff;font-size:16px;font-weight:700;margin-top:10px}.g{background:#c9a646;color:#1d2a22}\n.m{color:#6b7a71;font-size:13px}.e{color:#c0392b;font-weight:600}.r{display:flex;justify-content:space-between;font-size:14px;padding:3px 0}.ok{color:#0b5d3b;font-weight:700}\n.a{display:flex;align-items:center;gap:8px;margin:4px 0}.a span{flex:1}.a input{width:70px}.pre{white-space:pre-wrap}\n</style></head><body><div class=\"w\"><div id=\"app\">Memuatkan\u2026 / Loading\u2026</div></div><script>\nvar PID = \"__PID__\", D = null, EN = /^en/i.test(navigator.language), S = {us:[], adds:{}};\nfunction L(a, b){ return EN ? b : a; }\nfunction E(s){ return String(s == null ? \"\" : s).replace(/[&<>\"]/g, function(c){ return {\"&\":\"&amp;\", \"<\":\"&lt;\", \">\":\"&gt;\", '\"':\"&quot;\"}[c]; }); }\nfunction rm(s){ return \"RM\" + (s / 100).toFixed(2); }\nfunction ad(k, n){ var d = new Date(k + \"T00:00:00Z\"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }\nfunction dw(k){ return new Date(k + \"T00:00:00Z\").getUTCDay(); }\nfunction mm(v){ var p = String(v || \"0:0\").split(\":\"); return +p[0] * 60 + +p[1]; }\nfunction un(id){ return D.units.filter(function(u){ return u.id === id; })[0]; }\nfunction price(u, k){ var b = (u.dow && u.dow[dw(k)] != null && u.dow[dw(k)] !== \"\") ? +u.dow[dw(k)] : u.price || 0, se = (D.set.seasons || []).filter(function(x){ return k >= x.from && k <= x.to && (!x.units || !x.units.length || x.units.indexOf(u.id) >= 0); })[0];\n  if(se) return se.t === \"fix\" ? Math.round(se.v * 100) : Math.round(b * (1 + (+se.v || 0) / 100)); return b; }\nfunction quote(){ var tot = 0, n = 0, lines = [];\n  S.us.forEach(function(id){ var u = un(id); if(!u) return;\n    if(u.mode === \"slot\"){ var p0 = price(u, S.from); tot += p0; lines.push([u.name, p0]); n = 1; return; }\n    var k = S.from, c = 0, t = 0; while(u.mode === \"night\" ? k < S.to : k <= (S.to || S.from)){ t += price(u, k); c++; k = ad(k, 1); if(c > 90) break; } tot += t; n = Math.max(n, c); lines.push([u.name + \" \u00d7 \" + c, t]); });\n  var pax = Math.max(1, +S.guests || 1);\n  D.addons.forEach(function(a){ var q = +S.adds[a.id] || 0; if(!q) return; var m = a.per === \"night\" ? n : a.per === \"pax\" ? pax : a.per === \"paxnight\" ? pax * n : 1; tot += a.price * q * m; lines.push([a.name + \" \u00d7 \" + q * m, a.price * q * m]); });\n  return {tot:tot, lines:lines}; }\nfunction dep(t){ var u = un(S.us[0]) || {}, ty = u.depT || D.set.depT, v = u.dep != null && u.dep !== \"\" ? u.dep : D.set.dep; return ty === \"fix\" ? Math.min(t, Math.round(v * 100) * S.us.length) : Math.round(t * (+v || 0) / 100); }\nfunction linked(id){ var u = un(id), w = D.units.filter(function(x){ return x.whole; })[0]; if(!u || !w || u.mode !== \"night\") return [id];\n  return u.whole ? [id].concat(D.units.filter(function(x){ return x.mode === \"night\" && !x.whole; }).map(function(x){ return x.id; })) : [id, w.id]; }\nfunction busyOn(id, k){ return D.busy.filter(function(b){ return linked(id).some(function(i){ if(b.us.indexOf(i) < 0) return false; var v = un(i); if(v.mode === \"night\") return k >= b.from && k < b.to; if(v.mode === \"slot\") return k === b.from && (b.t0 == null || S.t0 == null || (S.t0 < b.t1 && b.t0 < S.t1)); return k >= b.from && k <= (b.to || b.from); }); }).length; }\nfunction clash(){ for(var j = 0; j < S.us.length; j++){ var u = un(S.us[j]); if(!u) continue; var k = S.from, c = 0; while(u.mode === \"night\" ? k < S.to : k <= (S.to || S.from)){ if(busyOn(u.id, k) >= (u.cap || 1)) return k; k = ad(k, 1); if(++c > 90) break; } } return \"\"; }\nfunction draw(){\n  var h = \"<h1>\" + E(D.name) + \"</h1><div class=m>\" + L(\"Tempahan dalam talian\", \"Online booking\") + \"</div><div class=c><label>\" + L(\"Pilih\", \"Choose\") + \"</label>\" +\n    D.units.map(function(u){ return \"<label class=u><input type=checkbox data-u='\" + u.id + \"'\" + (S.us.indexOf(u.id) >= 0 ? \" checked\" : \"\") + \"><span>\" + E(u.ic + \" \" + u.name) + \"<br><span class=m>\" + rm(u.price) + \" / \" + (u.mode === \"night\" ? L(\"malam\", \"night\") : u.mode === \"slot\" ? \"slot\" : L(\"hari\", \"day\")) + \"</span></span></label>\"; }).join(\"\") +\n    \"<label>\" + L(\"Masuk / tarikh\", \"Check-in / date\") + \"</label><input type=date id=f value='\" + (S.from || \"\") + \"'><label>\" + L(\"Keluar / hingga\", \"Check-out / to\") + \"</label><input type=date id=t value='\" + (S.to || \"\") + \"'><label>\" + L(\"Bil. orang\", \"Guests\") + \"</label><input type=number id=g min=1 value='\" + (S.guests || 1) + \"'>\" + (D.units.some(function(u){ return u.mode === \"slot\"; }) ? \"<label>\" + L(\"Masa (slot)\", \"Time (slot)\") + \"</label><div class=a><input type=time id=t0 value='\" + (S.h0 || \"09:00\") + \"' style='width:auto;flex:1'><span style='flex:none'>\u2013</span><input type=time id=t1 value='\" + (S.h1 || \"12:00\") + \"' style='width:auto;flex:1'></div>\" : \"\") + \"</div>\" +\n    (D.addons.length ? \"<div class=c><label>\" + L(\"Tambahan\", \"Add-ons\") + \"</label>\" + D.addons.map(function(a){ return \"<div class=a><span>\" + E(a.ic + \" \" + a.name) + \" <span class=m>\" + rm(a.price) + \"</span></span><input type=number min=0 data-a='\" + a.id + \"' value='\" + (S.adds[a.id] || 0) + \"'></div>\"; }).join(\"\") + \"</div>\" : \"\") +\n    \"<div class=c><label>\" + L(\"Nama\", \"Name\") + \"</label><input id=n value='\" + E(S.name || \"\") + \"'><label>\" + L(\"Telefon (WhatsApp)\", \"Phone (WhatsApp)\") + \"</label><input id=p type=tel value='\" + E(S.phone || \"\") + \"'><label>\" + L(\"Kod promosi (pilihan)\", \"Promo code (optional)\") + \"</label><input id=pr value='\" + E(S.promo || \"\") + \"'><label>\" + L(\"Nota\", \"Notes\") + \"</label><textarea id=no rows=2>\" + E(S.note || \"\") + \"</textarea></div>\" +\n    \"<div class=c id=q></div><button class=b id=go>\" + L(\"Tempah & tahan tarikh\", \"Book & hold the dates\") + \"</button><div id=msg></div>\";\n  document.getElementById(\"app\").innerHTML = h;\n  var rd = function(){ S.us = [].slice.call(document.querySelectorAll(\"[data-u]\")).filter(function(x){ return x.checked; }).map(function(x){ return x.getAttribute(\"data-u\"); });\n    S.from = document.getElementById(\"f\").value; S.to = document.getElementById(\"t\").value || S.from; S.guests = document.getElementById(\"g\").value; var x0 = document.getElementById(\"t0\"), x1 = document.getElementById(\"t1\"); if(x0){ S.h0 = x0.value; S.h1 = x1.value; S.t0 = mm(x0.value); S.t1 = mm(x1.value); }\n    [].forEach.call(document.querySelectorAll(\"[data-a]\"), function(x){ S.adds[x.getAttribute(\"data-a\")] = +x.value || 0; });\n    S.name = document.getElementById(\"n\").value; S.phone = document.getElementById(\"p\").value; S.promo = document.getElementById(\"pr\").value; S.note = document.getElementById(\"no\").value; showQ(); };\n  [].forEach.call(document.querySelectorAll(\"input,textarea\"), function(x){ x.onchange = rd; x.oninput = rd; });\n  document.getElementById(\"go\").onclick = function(){ rd(); send(); }; showQ(); }\nfunction showQ(){ var el = document.getElementById(\"q\"); if(!S.us.length || !S.from){ el.innerHTML = \"<div class=m>\" + L(\"Pilih unit dan tarikh untuk lihat harga.\", \"Choose a unit and dates to see the price.\") + \"</div>\"; return; }\n  var cl = clash(); if(cl){ el.innerHTML = \"<div class=e>\" + L(\"Sudah penuh pada \", \"Already full on \") + cl + \"</div>\"; return; }\n  var q = quote(); el.innerHTML = q.lines.map(function(l){ return \"<div class=r><span>\" + E(l[0]) + \"</span><b>\" + rm(l[1]) + \"</b></div>\"; }).join(\"\") + \"<div class=r><span>\" + L(\"Jumlah\", \"Total\") + \"</span><b>\" + rm(q.tot) + \"</b></div><div class=r><span>\" + L(\"Deposit\", \"Deposit\") + \"</span><b>\" + rm(dep(q.tot)) + \"</b></div><div class=m>\" + L(\"Harga cuti umum / promosi disahkan oleh pemilik.\", \"Holiday prices / promotions are confirmed by the owner.\") + \"</div>\"; }\nfunction send(){ if(clash()) return; var q = quote(), m = document.getElementById(\"msg\"); m.innerHTML = \"<div class=m>\u2026</div>\";\n  google.script.run.withSuccessHandler(function(r){ r = JSON.parse(r);\n    if(!r.ok){ m.innerHTML = \"<div class=e>\" + ({full:L(\"Maaf, tarikh baru sahaja penuh.\", \"Sorry, the dates just got booked.\"), contact:L(\"Isi nama dan telefon.\", \"Enter your name and phone.\"), promo:L(\"Kod promosi tidak sah.\", \"The promo code is not valid.\"), busy:L(\"Terlalu banyak permintaan. Cuba sebentar lagi.\", \"Too many requests. Try again shortly.\"), dates:L(\"Pilih tarikh.\", \"Choose the dates.\")}[r.err] || r.err) + \"</div>\"; return; }\n    S.id = r.id; var dp = dep(q.tot);\n    document.getElementById(\"app\").innerHTML = \"<h1>\u2705 \" + L(\"Tarikh ditahan\", \"Dates held\") + \"</h1><div class=c><div class=r><span>\" + L(\"Rujukan\", \"Reference\") + \"</span><b>\" + r.ref + \"</b></div><div class=r><span>\" + L(\"Jumlah\", \"Total\") + \"</span><b>\" + rm(q.tot) + \"</b></div><div class=r><span>\" + L(\"Deposit\", \"Deposit\") + \"</span><b>\" + rm(dp) + \"</b></div><div class=m>\" + L(\"Ditahan \" + r.hold + \" jam. Bayar deposit dan muat naik bukti untuk mengesahkan.\", \"Held for \" + r.hold + \" hours. Pay the deposit and upload the proof to confirm.\") + \"</div></div>\" +\n      (D.set.payLink ? \"<a class='b g' href='\" + E(D.set.payLink) + \"' target=_blank>\ud83d\udcb3 \" + L(\"Bayar dalam talian\", \"Pay online\") + \"</a>\" : \"\") + (D.set.pay ? \"<div class=c><b>\ud83c\udfe6 \" + L(\"Cara bayar\", \"How to pay\") + \"</b><div class=pre>\" + E(D.set.pay) + \"</div></div>\" : \"\") +\n      \"<div class=c><label>\ud83d\udcce \" + L(\"Muat naik bukti bayaran\", \"Upload the payment proof\") + \"</label><input type=file accept='image/*' id=pf><div id=pm></div></div>\";\n    document.getElementById(\"pf\").onchange = proof; }).withFailureHandler(function(){ m.innerHTML = \"<div class=e>\" + L(\"Gagal. Cuba lagi.\", \"Failed. Try again.\") + \"</div>\"; })\n    .bkRequest(JSON.stringify({pid:PID, us:S.us, from:S.from, to:S.to, t0:S.t0, t1:S.t1, guests:S.guests, adds:Object.keys(S.adds).map(function(k){ return {id:k, q:S.adds[k]}; }), name:S.name, phone:S.phone, promo:S.promo, note:S.note, total:q.tot})); }\nfunction proof(){ var f = this.files[0], pm = document.getElementById(\"pm\"); if(!f) return; pm.innerHTML = \"<div class=m>\u2026</div>\"; var r = new FileReader();\n  r.onload = function(){ var im = new Image(); im.onload = function(){ var s = Math.min(1, 1200 / Math.max(im.width, im.height)), c = document.createElement(\"canvas\"); c.width = im.width * s; c.height = im.height * s; c.getContext(\"2d\").drawImage(im, 0, 0, c.width, c.height);\n      google.script.run.withSuccessHandler(function(x){ x = JSON.parse(x); pm.innerHTML = x.ok ? \"<div class=ok>\u2705 \" + L(\"Bukti dihantar. Pemilik akan mengesahkan.\", \"Proof sent. The owner will confirm.\") + \"</div>\" : \"<div class=e>\" + L(\"Gagal\", \"Failed\") + \"</div>\"; }).bkProof(S.id, c.toDataURL(\"image/jpeg\", .8).split(\",\")[1], \"image/jpeg\"); }; im.src = r.result; };\n  r.readAsDataURL(f); }\ngoogle.script.run.withSuccessHandler(function(r){ D = JSON.parse(r); if(!D.ok){ document.getElementById(\"app\").innerHTML = L(\"Tempahan dalam talian belum dibuka.\", \"Online booking is not open yet.\"); return; }\n  var t = new Date().toISOString().slice(0, 10); S.from = t; S.to = ad(t, 1); draw(); }).bkData(PID);\n</script></body></html>\n";
`;
