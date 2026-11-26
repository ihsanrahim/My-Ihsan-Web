/* My Ihsan › Gifts admin: the Google Sheet behind myihsan.app/admin and the app's 🎁 Gift page.
   Paste this whole file into the Sheet: Extensions › Apps Script › Code.gs, Save, then Deploy › New deployment › Web app:
   Execute as: Me · Who has access: Anyone. Copy the Web app URL (…/exec) into myihsan.app/admin.
   The sheet tabs "Categories" and "Products" are made on the first call (20 starter categories).
   Sign-in: the FIRST sign-in on the admin page sets the user name and password (stored only as a salted SHA-256 hash in this
   script's properties, never in this file or on the website). Change it later in the admin page › Settings.
   Reading the gift list (GET …/exec) is public; every change needs the password. 8 wrong passwords lock changes for 15 minutes. */

var VER = 3;   // 3: dates as yyyy-MM-dd; 2: photos (op img → Drive folder "My Ihsan Gifts images", shared to view by link)
var CAT_H = ["id", "icon", "name_ms", "name_en", "order", "on"];
var PROD_H = ["id", "cat", "name", "price", "link", "image", "tag", "on", "order", "added", "updated"];
var START = [
  ["quran", "📖", "Al-Quran & buku", "Quran & books"], ["kitab", "📚", "Kitab & buku agama", "Religious books"],
  ["telekung", "🧕", "Telekung", "Telekung"], ["tudung", "🧣", "Tudung & hijab", "Tudung & hijab"],
  ["sejadah", "🕌", "Sejadah", "Prayer mats"], ["muslimah", "👗", "Pakaian muslimah", "Muslimah wear"],
  ["lelaki", "👳", "Baju Melayu & jubah", "Baju Melayu & jubah"], ["songkok", "🧢", "Songkok & kopiah", "Songkok & kopiah"],
  ["tasbih", "📿", "Tasbih & kaunter zikir", "Tasbih & zikir counters"], ["attar", "🌸", "Attar & wangian", "Attar & fragrance"],
  ["kanak", "🧒", "Mainan & belajar kanak-kanak", "Kids' learning & toys"], ["bajukanak", "👶", "Pakaian kanak-kanak", "Kids' clothing"],
  ["haji", "🧳", "Kelengkapan haji & umrah", "Hajj & umrah kit"], ["musafir", "🕋", "Set solat musafir", "Travel prayer kit"],
  ["sunnah", "🍯", "Makanan sunnah", "Sunnah foods"], ["kurma", "🌴", "Kurma & snek halal", "Dates & halal snacks"],
  ["hamper", "🧺", "Hamper & set hadiah", "Hampers & gift sets"], ["kahwin", "💍", "Hadiah kahwin & hantaran", "Wedding gifts & hantaran"],
  ["doorgift", "🎀", "Cenderahati kenduri", "Kenduri door gifts"], ["hiasan", "🖼", "Hiasan rumah Islamik", "Islamic home decor"]];
var OK_HOSTS = ["shopee.com.my", "s.shopee.com.my", "shp.ee", "shope.ee", "lazada.com.my", "s.lazada.com.my", "invol.co"];

function out(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function book(){ return SpreadsheetApp.getActiveSpreadsheet(); }
function tab(name, head){ var s = book().getSheetByName(name);
  if(!s){ s = book().insertSheet(name); s.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight("bold"); s.setFrozenRows(1);
    if(name === "Categories") s.getRange(2, 1, START.length, 6).setValues(START.map(function(c, i){ return [c[0], c[1], c[2], c[3], i + 1, true]; })); }
  return s; }
function rows(name, head){ var s = tab(name, head), v = s.getDataRange().getValues(), h = v.shift();
  return v.map(function(r, i){ var o = {_row: i + 2}; h.forEach(function(k, j){ o[k] = r[j] instanceof Date ? Utilities.formatDate(r[j], "Asia/Kuala_Lumpur", "yyyy-MM-dd") : r[j]; }); return o; }).filter(function(o){ return o.id !== ""; }); }
function yes(v){ return v === true || String(v).toUpperCase() === "TRUE" || v === 1 || v === "1" || v === "Y"; }
function host(u){ return String(u).replace(/^https?:\/\//, "").split("/")[0].toLowerCase(); }
function linkOk(u){ var h = host(u); return /^https:\/\//.test(u) && OK_HOSTS.some(function(x){ return h === x || h.slice(-x.length - 1) === "." + x; }); }
function today(){ return Utilities.formatDate(new Date(), "Asia/Kuala_Lumpur", "yyyy-MM-dd"); }

/* public: the gift list in the app's feed format (cached 5 minutes) */
function doGet(e){ var p = (e && e.parameter) || {};
  if(p.a === "ping") return out({ok: true, v: VER, setup: !PropertiesService.getScriptProperties().getProperty("HASH")});
  var c = CacheService.getScriptCache(), hit = c.get("feed"); if(hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
  var s = JSON.stringify(feed()); try{ c.put("feed", s, 300); }catch(x){} return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON); }
function feed(){ var cats = rows("Categories", CAT_H).filter(function(c){ return yes(c.on); }).sort(function(a, b){ return (+a.order || 0) - (+b.order || 0); }),
    prods = rows("Products", PROD_H).filter(function(p){ return yes(p.on) && linkOk(p.link); }).sort(function(a, b){ return (+a.order || 0) - (+b.order || 0); }), last = "";
  prods.forEach(function(p){ var u = String(p.updated || p.added || ""); if(u > last) last = u; });
  return {v: 1, updated: last || today(), source: "Shopee Malaysia (affiliate)", cur: "RM", cats: cats.map(function(c){
    return {id: String(c.id), ic: String(c.icon), ms: String(c.name_ms), en: String(c.name_en), items: prods.filter(function(p){ return String(p.cat) === String(c.id); }).map(function(p){
      return {id: String(p.id), n: String(p.name).slice(0, 120), p: p.price === "" ? null : +p.price, url: String(p.link), img: /^https:\/\//.test(p.image) ? String(p.image) : "", tag: String(p.tag || ""), pick: true}; })}; })}; }

/* admin: POST text/plain JSON {u, p, op, ...} */
function hash(salt, pw){ return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + "|" + pw, Utilities.Charset.UTF_8)); }
function doPost(e){ var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try{ var q = JSON.parse(e.postData.contents || "{}"), P = PropertiesService.getScriptProperties(), C = CacheService.getScriptCache();
    var fails = +(C.get("fails") || 0); if(fails >= 8) return out({ok: false, err: "locked"});
    var u = String(q.u || "").trim().toLowerCase(), pw = String(q.p || "");
    if(!P.getProperty("HASH")){ if(q.op !== "login" || u.length < 3 || pw.length < 4) return out({ok: false, err: "setup"});
      var salt = Utilities.getUuid(); P.setProperties({USER: u, SALT: salt, HASH: hash(salt, pw)}); return out({ok: true, first: true}); }
    if(u !== P.getProperty("USER") || hash(P.getProperty("SALT"), pw) !== P.getProperty("HASH")){ C.put("fails", String(fails + 1), 900); return out({ok: false, err: "login"}); }
    var r = act(q, P); if(q.op !== "login" && q.op !== "list") C.remove("feed"); return out(r);
  }catch(x){ return out({ok: false, err: String(x && x.message || x)}); } finally { lock.releaseLock(); } }

function act(q, P){
  if(q.op === "login") return {ok: true};
  if(q.op === "list") return {ok: true, cats: rows("Categories", CAT_H), prods: rows("Products", PROD_H), hosts: OK_HOSTS};
  if(q.op === "pass"){ var n = String(q.np || ""), nu = String(q.nu || "").trim().toLowerCase(); if(n.length < 6 || nu.length < 3) return {ok: false, err: "short"};
    var salt = Utilities.getUuid(); P.setProperties({USER: nu, SALT: salt, HASH: hash(salt, n)}); return {ok: true}; }
  if(q.op === "saveCat") return save("Categories", CAT_H, q.row, function(o){ o.id = String(o.id || "").toLowerCase().replace(/[^a-z0-9]/g, ""); if(!o.id) throw new Error("id"); });
  if(q.op === "saveProd") return save("Products", PROD_H, q.row, function(o){ if(!linkOk(o.link)) throw new Error("link"); if(!o.id) o.id = "g" + Date.now().toString(36) + Math.floor(Math.random() * 1e3); if(!o.added) o.added = today(); o.updated = today(); });
  if(q.op === "saveProds"){ var n2 = 0; (q.rows || []).forEach(function(r){ save("Products", PROD_H, r, function(o){ if(!linkOk(o.link)) throw new Error("link"); if(!o.id) o.id = "g" + Date.now().toString(36) + (n2++) + Math.floor(Math.random() * 1e3); if(!o.added) o.added = today(); o.updated = today(); }); }); return {ok: true, n: (q.rows || []).length}; }
  if(q.op === "delCat" || q.op === "delProd"){ var nm = q.op === "delCat" ? "Categories" : "Products", s = tab(nm, q.op === "delCat" ? CAT_H : PROD_H), f = rows(nm, q.op === "delCat" ? CAT_H : PROD_H).filter(function(o){ return String(o.id) === String(q.id); })[0];
    if(!f) return {ok: false, err: "missing"}; if(q.op === "delCat" && rows("Products", PROD_H).some(function(p){ return String(p.cat) === String(q.id); })) return {ok: false, err: "notempty"};
    s.deleteRow(f._row); return {ok: true}; }
  if(q.op === "order"){ var nm2 = q.what === "cat" ? "Categories" : "Products", hd = q.what === "cat" ? CAT_H : PROD_H, s2 = tab(nm2, hd), col = hd.indexOf("order") + 1, all = rows(nm2, hd);
    (q.ids || []).forEach(function(id, i){ var f2 = all.filter(function(o){ return String(o.id) === String(id); })[0]; if(f2) s2.getRange(f2._row, col).setValue(i + 1); }); return {ok: true}; }
  if(q.op === "img"){ var raw = Utilities.base64Decode(String(q.data || "")); if(!raw.length || raw.length > 4 * 1024 * 1024) return {ok: false, err: "imgsize"};
    var fid = P.getProperty("IMGDIR"), dir = null; try{ if(fid) dir = DriveApp.getFolderById(fid); }catch(x){ dir = null; }
    if(!dir){ dir = DriveApp.createFolder("My Ihsan Gifts images"); P.setProperty("IMGDIR", dir.getId()); }
    var nm = String(q.name || "gift").replace(/[^\w .-]/g, "").slice(0, 40) || "gift", f = dir.createFile(Utilities.newBlob(raw, "image/jpeg", nm + " " + today() + ".jpg"));
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return {ok: true, id: f.getId(), url: "https://lh3.googleusercontent.com/d/" + f.getId() + "=w800"}; }
  return {ok: false, err: "op"}; }

function save(name, head, row, fix){ var s = tab(name, head), o = {}; head.forEach(function(k){ o[k] = row && row[k] != null ? row[k] : ""; }); fix(o);
  var all = rows(name, head), f = all.filter(function(x){ return String(x.id) === String(o.id); })[0];
  if(f){ head.forEach(function(k){ if(row[k] == null && k !== "updated") o[k] = f[k]; }); } else if(o.order === "") o.order = all.filter(function(x){ return name !== "Products" || String(x.cat) === String(o.cat); }).length + 1;
  if(o.on === "") o.on = true; var vals = [head.map(function(k){ return o[k]; })];
  if(f) s.getRange(f._row, 1, 1, head.length).setValues(vals); else s.appendRow(vals[0]);
  return {ok: true, row: o}; }
