/* My Ihsan · Google Drive sync (shared, byte-identical in the app: app/assets/www/sync/drivesync.js and the web: My-Ihsan-Web/app/sync/drivesync.js).
   Owner spec "Google Drive sync + web dashboard" (2026-11-18). Each person's data goes only to THEIR OWN Google Drive, in the hidden app folder
   (scope drive.appdata). No server, no client library: the Drive REST API v3 with fetch.

   Files in appDataFolder: one JSON per section (notes.json, niaga.json, …) + manifest.json.
   Section file: {v, section, updatedAt, by, keys:{<storage key>:{shape, u, items:{<itemKey>:{v, _u, _by, o} | {_del:true, _u, _by}}}}, conflicts:[…]}
   Every stored value is split into items so two devices merge per record, per map entry or per log line:
     array of records with a stable id → one item per record; array without ids → one item per entry (content hash: logs union);
     plain object → one item per property, and an array-of-records property is split again per record (e.g. ihsan_biz docs/<id>);
     anything else → one item.
   3-way merge per item (local now / cloud / last synced): changed on one side → that side; changed on both → the later one wins and the other
   copy goes to "conflicts"; deletes are tombstones kept 90 days so an old device cannot bring them back.

   DriveSync.init({getToken(interactive) → Promise<token|null>, invalidate(), store, apiBase, play, onStatus(st)})
   store = {get(k) → string|null, set(k, str), del(k), keys() → []}. Default: localStorage (the app); the web passes an IndexedDB-backed store. */
(function(root){ "use strict";
var META = "ihsan_sync_meta", DAY = 864e5;
// §7 data map: section → keys (a trailing * is a prefix). Web rights: e = edit, v = view, p = PIN.
var SECTIONS = [
  ["notes", "📝", "Nota & perancang", "Notes & planner", "e", ["ihsan_notes","ihsan_planner","ihsan_events","ihsan_icsopt","ihsan_xrem","ihsan_kad","ihsan_meet","ihsan_dok_set","ihsan_dok_profile","ihsan_dok_docs","ihsan_tekap"]],
  ["karya", "✒️", "Karya", "Karya", "e", ["ihsan_karya"]],
  ["niaga", "📑", "Niaga", "Business", "e", ["ihsan_biz"]],
  ["recipes", "🍲", "Resepi", "Recipes", "e", ["ihsan_recipes","ihsan_rcp_set","ihsan_rcp_plan","ihsan_rcp_shop","ihsan_shop","ihsan_halal_hist"]],
  ["ibadah", "🕌", "Ibadah", "Worship", "v", ["ihsan_prlog","ihsan_qsolat","ihsan_jamma","ihsan_qada","ihsan_quran","ihsan_qwords","ihsan_tasbih","ihsan_counters","ihsan_tbtot","ihsan_mydoa","ihsan_myzikir","ihsan_deeds","ihsan_muhasabah","ihsan_ramadan","ihsan_n40","ihsan_asma","ihsan_sbk"]],
  ["ilmu", "📚", "Ilmu", "Learning", "v", ["ihsan_silibus","ihsan_iqra","ihsan_hijaiyah","ihsan_huruf","ihsan_tajwid","ihsan_khat","ihsan_sci","ihsan_sirah","ihsan_sirah_kids","ihsan_sahabat","ihsan_fiqh","ihsan_books","ihsan_books_set","ihsan_pod","ihsan_radio_fav","ihsan_chess","ihsan_chess_stats","ihsan_askai","ihsan_uni_*"]],
  ["move", "🏃", "Gerak", "Move", "v", ["ihsan_runs","ihsan_runsegs","ihsan_runbadges","ihsan_run_cfg","ihsan_routes","ihsan_fit","ihsan_sport","ihsan_fitrem","ihsan_focus","ihsan_focus_ex","ihsan_grow","ihsan_grow_ex","ihsan_screen","ihsan_usage","ihsan_insights"]],
  ["family", "👨‍👩‍👧", "Keluarga", "Family", "e", ["ihsan_family","ihsan_famrem","ihsan_baby","ihsan_kids","ihsan_kprof","ihsan_kp_*","ihsan_kplan","ihsan_pets","ihsan_vpet","ihsan_kwav"]],   // 0.7.66: the children's planners; 0.7.72: pets and phone pets
  ["finance", "💰", "Kewangan", "Finance", "e", ["ihsan_fin","ihsan_expense","ihsan_receipts","ihsan_receipt","ihsan_split","ihsan_splitev_*","ihsan_zcalc","ihsan_zstate","ihsan_gold","ihsan_saham","ihsan_fx","ihsan_donate"]],
  ["hajj", "🕋", "Haji & Umrah", "Hajj & Umrah", "e", ["ihsan_umrahdiy","ihsan_hajj","ihsan_umdocs","ihsan_tawaf","ihsan_umrah_live","ihsan_hjtrace"]],
  ["groups", "👥", "Kumpulan", "Groups", "e", ["ihsan_groups","ihsan_gset","ihsan_gblock","ihsan_gposts_*"]],
  ["care", "🌸", "Haid & Jaga (pilihan)", "Period & Care (opt-in)", "p", ["ihsan_period","ihsan_care"]],
  ["misc", "🧭", "Lain-lain", "Other", "v", ["ihsan_falak","ihsan_log","ihsan_tour","ihsan_news"]]];
// never synced, whatever the map says (settings, caches, secrets, outboxes, this file's own state)
var NEVER = /^ihsan_(settings|setlast|wall|side|view|navlast|news_head|extra|displays|dsauto|dscol|dsplay|dsqueue|dsremote.*|radio_cache.*|wx|gkey|pin|umdocpin|goutbox|splitout|sync_meta|tb_remote|.*img_.*|phx_.*|podf_.*)$/;
// written by the app in the background all the time (screen time, counters…): they ride along with the next sync but never start one
var QUIET = /^ihsan_(usage|screen|insights|log|tour|focus_ex|tasbih|tbtot|counters|umrah_live|hjtrace|run_cfg)$/;
var S = {opt:null, timer:null, busy:null, fail:0, applying:false, status:{state:"off"}, inited:false};

function lsStore(){ return {get:function(k){ return localStorage.getItem(k); }, set:function(k, v){ S.applying = true; try{ localStorage.setItem(k, v); } finally { S.applying = false; } },
  del:function(k){ S.applying = true; try{ localStorage.removeItem(k); } finally { S.applying = false; } }, keys:function(){ var a = []; for(var i = 0; i < localStorage.length; i++) a.push(localStorage.key(i)); return a; }}; }
function st(){ return S.opt.store; }
function meta(){ if(S.meta) return S.meta; var m = null; try{ m = JSON.parse(st().get(META) || "null"); }catch(e){}
  m = m && typeof m === "object" ? m : {}; m.dev = m.dev || ("d" + Math.random().toString(36).slice(2, 10)); m.k = m.k || {}; m.dirty = m.dirty || {}; m.rm = m.rm || {}; m.fid = m.fid || {};
  m.on = m.on || {}; if(m.auto === undefined) m.auto = true; if(m.wifi === undefined) m.wifi = true; m.conflicts = m.conflicts || []; S.meta = m; return m; }
function saveMeta(){ S.applying = true; try{ st().set(META, JSON.stringify(S.meta)); } finally { S.applying = false; } }

// ---------- which keys sync ----------
function sectionOn(id){ var m = meta(); if(id === "care"){ if(S.opt && S.opt.play) return false; return m.on.care === true; } return m.on[id] !== false; }
function sectionOf(key){ if(/^silibus\./.test(key)) return "ilmu";   // School answers, progress and per-child settings (silibus.<child>.<pack>), so a child can carry on on another device
  if(NEVER.test(key) || key.indexOf("ihsan_") !== 0) return null;
  for(var i = 0; i < SECTIONS.length; i++){ var ks = SECTIONS[i][5]; for(var j = 0; j < ks.length; j++){ var k = ks[j]; if(k.slice(-1) === "*" ? key.indexOf(k.slice(0, -1)) === 0 : key === k) return SECTIONS[i][0]; } } return null; }
function keysOf(sec, remote){ var out = {}, s = SECTIONS.filter(function(x){ return x[0] === sec; })[0]; if(!s) return [];
  st().keys().forEach(function(k){ if(sectionOf(k) === sec) out[k] = 1; });
  Object.keys((remote && remote.keys) || {}).forEach(function(k){ if(sectionOf(k) === sec) out[k] = 1; });
  Object.keys(meta().k).forEach(function(k){ if(sectionOf(k) === sec) out[k] = 1; });
  return Object.keys(out).sort(); }

// ---------- items ----------
function hash(s){ var h = 0x811c9dc5; for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + s.length.toString(36); }
var IDF = ["id", "uid", "key", "k"];
function idField(a){ if(!Array.isArray(a) || !a.length) return ""; for(var i = 0; i < IDF.length; i++){ var f = IDF[i], seen = {}, okf = true;
    for(var j = 0; j < a.length; j++){ var x = a[j]; if(!x || typeof x !== "object" || Array.isArray(x) || x[f] == null || (typeof x[f] !== "string" && typeof x[f] !== "number") || seen[x[f]]){ okf = false; break; } seen[x[f]] = 1; }
    if(okf) return f; } return ""; }
function arrItems(a, pre, out){ var f = idField(a); if(f){ a.forEach(function(x, i){ out[pre + "#" + x[f]] = {v:x, o:i}; }); return {t:"arr", f:f}; }
  var dup = {}; a.forEach(function(x, i){ var h = hash(JSON.stringify(x)); dup[h] = (dup[h] || 0) + 1; out[pre + "~" + h + (dup[h] > 1 ? "." + dup[h] : "")] = {v:x, o:i}; }); return {t:"log"}; }
// value (string as stored) → {shape, items:{ik:{v, o}}}
function itemize(raw){ var v; try{ v = JSON.parse(raw); }catch(e){ return {shape:{t:"raw"}, items:{_:{v:raw}}}; }
  var items = {};
  if(Array.isArray(v)) return {shape:arrItems(v, "", items), items:items};
  if(v && typeof v === "object"){ var sub = {}; Object.keys(v).forEach(function(p, i){ var x = v[p];
      if(Array.isArray(x) && x.length && idField(x)){ var tmp = {}; arrItems(x, "", tmp); sub[p] = idField(x); Object.keys(tmp).forEach(function(ik){ items["p:" + p + ik] = {v:tmp[ik].v, o:tmp[ik].o}; }); }
      else items["p:" + p] = {v:x, o:i}; });
    return {shape:{t:"obj", sub:sub, po:Object.keys(v)}, items:items}; }
  return {shape:{t:"json"}, items:{_:{v:v}}}; }
// {shape, items} → string to store (null = remove the key)
function build(shape, items){ var ks = Object.keys(items).filter(function(k){ return !items[k]._del; }); if(!ks.length && shape.t !== "obj") return null;
  var ord = function(a, b){ var x = items[a].o, y = items[b].o; if(x == null) x = 1e9; if(y == null) y = 1e9; return x - y || (a < b ? -1 : a > b ? 1 : 0); };
  if(shape.t === "raw") return items._ ? String(items._.v) : null;
  if(shape.t === "json") return items._ ? JSON.stringify(items._.v) : null;
  if(shape.t === "arr" || shape.t === "log") return JSON.stringify(ks.sort(ord).map(function(k){ return items[k].v; }));
  var o = {}, subs = {}; ks.sort(ord).forEach(function(k){ var m = /^p:([^#~]*)([#~].*)?$/.exec(k); if(!m) return; if(m[2]){ (subs[m[1]] = subs[m[1]] || []).push(items[k]); if(!(m[1] in o)) o[m[1]] = null; } else o[m[1]] = items[k].v; });
  Object.keys(subs).forEach(function(p){ o[p] = subs[p].sort(function(a, b){ return (a.o == null ? 1e9 : a.o) - (b.o == null ? 1e9 : b.o); }).map(function(x){ return x.v; }); });
  (shape.sub ? Object.keys(shape.sub) : []).forEach(function(p){ if(o[p] == null && !subs[p] && Object.keys(items).some(function(k){ return k.indexOf("p:" + p + "#") === 0; })) o[p] = []; });
  var r = {}; (shape.po || []).concat(Object.keys(o)).forEach(function(p){ if(p in o && !(p in r)) r[p] = o[p]; });
  return JSON.stringify(r); }

// ---------- 3-way merge of one key ----------
function mergeKey(key, R, now){ var m = meta(), M = m.k[key] || {h:{}, su:{}}, raw = st().get(key), L = raw == null ? {shape:(R && R.shape) || {t:"json"}, items:{}} : itemize(raw), dev = m.dev;
  R = R || {shape:L.shape, items:{}}; var out = {}, conf = [], chLocal = false, all = {};
  [L.items, R.items, M.h].forEach(function(o){ Object.keys(o).forEach(function(k){ all[k] = 1; }); });
  var dirtyAt = m.dirty[key] || (m.k[key] ? now : 0);   // never synced on this device: the cloud copy wins, the local one is kept as a conflict
  Object.keys(all).forEach(function(ik){ var li = L.items[ik], ri = R.items[ik], lh = li ? hash(JSON.stringify(li.v)) : null, mh = M.h[ik] == null ? null : M.h[ik];
    var lc = lh !== mh, rc = !!ri && (ri._u || 0) > (M.su[ik] || 0);
    if(!ri && !li) return;
    if(lc && rc){ var rv = ri._del ? null : JSON.stringify(ri.v);
      if(rv === (li ? JSON.stringify(li.v) : null)){ out[ik] = ri; return; }   // same change on both
      if(dirtyAt >= (ri._u || 0)){ var tu = Math.max(dirtyAt, (ri._u || 0) + 1); out[ik] = li ? {v:li.v, o:li.o, _u:tu, _by:dev} : {_del:true, _u:tu, _by:dev}; if(!ri._del) conf.push({key:key, item:ik, lost:ri.v, by:ri._by, at:ri._u}); }
      else { out[ik] = ri; if(li) conf.push({key:key, item:ik, lost:li.v, by:dev, at:dirtyAt}); chLocal = true; }
      return; }
    // stamp a local change with when it was made (not when it synced), never below what the cloud already had
    if(lc){ var t2 = Math.max(m.dirty[key] || now, (ri ? ri._u || 0 : M.su[ik] || 0) + 1); out[ik] = li ? {v:li.v, o:li.o, _u:t2, _by:dev} : {_del:true, _u:t2, _by:dev}; return; }
    if(rc){ out[ik] = ri; chLocal = true; return; }
    if(ri) out[ik] = ri; else if(li) out[ik] = {v:li.v, o:li.o, _u:M.su[ik] || now, _by:dev}; });
  // drop tombstones older than 90 days
  Object.keys(out).forEach(function(ik){ if(out[ik]._del && now - (out[ik]._u || 0) > 90 * DAY) delete out[ik]; });
  var shape = raw != null ? L.shape : R.shape;
  if(shape.t === "obj" && R.shape && R.shape.t === "obj"){ shape = {t:"obj", sub:Object.assign({}, R.shape.sub || {}, shape.sub || {}), po:shape.po || R.shape.po}; }
  if(chLocal){ var nv = build(shape, out); if(nv == null) st().del(key); else if(nv !== raw) st().set(key, nv); }
  var h = {}, su = {}; Object.keys(out).forEach(function(ik){ if(!out[ik]._del) h[ik] = hash(JSON.stringify(out[ik].v)); su[ik] = out[ik]._u || 0; });
  m.k[key] = {h:h, su:su};
  return {node:{shape:shape, u:now, items:out}, conflicts:conf, changedLocal:chLocal}; }

// ---------- Drive REST ----------
function api(){ return (S.opt && S.opt.apiBase) || "https://www.googleapis.com"; }
function req(method, url, body, ctype, retry){ return S.opt.getToken(false).then(function(tok){ if(!tok){ var e = new Error("signin"); e.code = "signin"; throw e; }
    var h = {Authorization:"Bearer " + tok}; if(ctype) h["Content-Type"] = ctype;
    return fetch(api() + url, {method:method, headers:h, body:body}).then(function(r){
      if(r.status === 401 && !retry){ if(S.opt.invalidate) S.opt.invalidate(); return req(method, url, body, ctype, true); }
      if(r.status === 401){ var e1 = new Error("signin"); e1.code = "signin"; throw e1; }
      if(r.status === 403 || r.status === 429 || r.status >= 500) return r.text().then(function(t){ var e2 = new Error(/storageQuotaExceeded/.test(t) ? "full" : "HTTP " + r.status); e2.code = /storageQuotaExceeded/.test(t) ? "full" : "retry"; throw e2; });
      if(!r.ok){ var e3 = new Error("HTTP " + r.status); e3.code = "http"; throw e3; }
      return r.status === 204 ? null : (/json/.test(r.headers.get("content-type") || "") ? r.json() : r.text()); }); }); }
function list(){ return req("GET", "/drive/v3/files?spaces=appDataFolder&pageSize=1000&fields=files(id,name,modifiedTime)").then(function(r){ var o = {}; ((r && r.files) || []).forEach(function(f){ o[f.name] = f; }); return o; }); }
function download(id){ return req("GET", "/drive/v3/files/" + id + "?alt=media").then(function(t){ return typeof t === "string" ? JSON.parse(t) : t; }); }
function fmeta(id){ return req("GET", "/drive/v3/files/" + id + "?fields=id,modifiedTime"); }
function upload(name, id, obj){ var data = JSON.stringify(obj);
  if(id) return req("PATCH", "/upload/drive/v3/files/" + id + "?uploadType=media&fields=id,modifiedTime", data, "application/json");
  var b = "ihsan" + Math.random().toString(36).slice(2), body = "--" + b + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" + JSON.stringify({name:name, parents:["appDataFolder"]}) + "\r\n--" + b + "\r\nContent-Type: application/json\r\n\r\n" + data + "\r\n--" + b + "--";
  return req("POST", "/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime", body, "multipart/related; boundary=" + b); }
function remove(id){ return req("DELETE", "/drive/v3/files/" + id); }

// ---------- one section ----------
function doSection(sec, file, tries){ var m = meta(), now = Date.now();
  return (file ? download(file.id) : Promise.resolve(null)).then(function(remote){ remote = remote && remote.keys ? remote : {v:1, section:sec, keys:{}, conflicts:[]};
    var before = JSON.stringify(remote.keys), nk = {}, conf = [], ch = false;
    keysOf(sec, remote).forEach(function(k){ var r = mergeKey(k, remote.keys[k], now); if(Object.keys(r.node.items).length || remote.keys[k]) nk[k] = r.node; conf = conf.concat(r.conflicts); if(r.changedLocal) ch = true; });
    var same = JSON.stringify(nk) === before && !conf.length;
    // node.u changes every run; compare without it
    var strip = function(o){ var c = {}; Object.keys(o).forEach(function(k){ c[k] = {shape:o[k].shape, items:o[k].items}; }); return JSON.stringify(c); };
    same = strip(nk) === strip(remote.keys) && !conf.length;
    if(conf.length){ m.conflicts = conf.map(function(c){ c.sec = sec; c.seen = now; return c; }).concat(m.conflicts).slice(0, 60); }
    var after = function(fm){ m.rm[sec] = fm.modifiedTime; m.fid[sec] = fm.id; if(ch) S.changed = true; };
    if(same){ if(file) after(file); return; }
    var doc = {v:1, section:sec, updatedAt:now, by:m.dev, keys:nk, conflicts:(conf.concat(remote.conflicts || [])).slice(0, 60)};
    return (file ? fmeta(file.id) : Promise.resolve(null)).then(function(cur){
      if(file && cur && cur.modifiedTime !== file.modifiedTime){ if((tries || 0) >= 2) throw new Error("busy"); return doSection(sec, cur, (tries || 0) + 1); }
      return upload(sec + ".json", file && file.id, doc).then(after); }); }); }

// ---------- the sync cycle ----------
function sync(opts){ opts = opts || {}; if(S.busy) return S.busy; var m = meta();
  if((!m.auto && !opts.manual) || !m.signed){ status(); return Promise.resolve(); }
  var start = Date.now(); S.changed = false; status("busy");
  S.busy = list().then(function(files){ var chain = Promise.resolve();
      SECTIONS.forEach(function(s){ var id = s[0]; if(!sectionOn(id)) return; var f = files[id + ".json"], dirty = Object.keys(m.dirty).some(function(k){ return sectionOf(k) === id; });
        if(f && m.rm[id] === f.modifiedTime && !dirty && !opts.full) return;
        if(!f && !dirty && !keysOf(id, null).length) return;
        chain = chain.then(function(){ return doSection(id, f); }); });
      return chain.then(function(){ var man = {v:1, by:m.dev, at:Date.now(), sections:{}}; SECTIONS.forEach(function(s){ if(m.fid[s[0]]) man.sections[s[0]] = {fileId:m.fid[s[0]], updatedAt:m.rm[s[0]]}; });
        if(JSON.stringify(man.sections) !== JSON.stringify(m.lastMan || {})){ m.lastMan = man.sections; return upload("manifest.json", files["manifest.json"] && files["manifest.json"].id, man); } }); })
    .then(function(){ Object.keys(m.dirty).forEach(function(k){ if(m.dirty[k] <= start) delete m.dirty[k]; }); m.last = Date.now(); m.err = ""; S.fail = 0; saveMeta(); status("ok"); if(S.changed && S.opt.onChanged) S.opt.onChanged(); })
    .catch(function(e){ m.err = e && e.code || "net"; saveMeta(); S.fail++; status(m.err === "signin" ? "signin" : m.err === "full" ? "full" : "err");
      if(m.auto && m.err !== "signin") schedule(Math.min(15 * 60000, 10000 * Math.pow(2, S.fail))); })
    .then(function(){ S.busy = null; });
  return S.busy; }
function schedule(ms){ clearTimeout(S.timer); S.timer = setTimeout(function(){ sync(); }, ms == null ? 5000 : ms); }
function markDirty(k){ if(S.applying || !sectionOf(k)) return; var m = meta(); m.dirty[k] = Date.now(); saveMeta(); if(QUIET.test(k)) return; status(); if(m.auto && m.signed) schedule(5000); }
function pending(){ return Object.keys(meta().dirty).filter(function(k){ var s = sectionOf(k); return s && sectionOn(s) && !QUIET.test(k); }).length; }
function status(state){ var m = meta(); if(state) S.status.state = state; else if(S.status.state !== "busy") S.status.state = !m.signed ? "off" : m.err === "signin" ? "signin" : m.err === "full" ? "full" : (m.err ? "err" : "ok");
  S.status.last = m.last || 0; S.status.pending = pending(); S.status.auto = m.auto; S.status.email = m.email || ""; S.status.name = m.name || "";
  if(S.opt && S.opt.onStatus) try{ S.opt.onStatus(S.status); }catch(e){} return S.status; }

// track writes made anywhere in the app (localStorage store only)
function watch(){ if(S.watched || typeof Storage === "undefined" || typeof localStorage === "undefined") return; S.watched = true;
  var set0 = Storage.prototype.setItem, rem0 = Storage.prototype.removeItem;
  Storage.prototype.setItem = function(k, v){ var r = set0.apply(this, arguments); if(this === localStorage) markDirty(String(k)); return r; };
  Storage.prototype.removeItem = function(k){ var r = rem0.apply(this, arguments); if(this === localStorage) markDirty(String(k)); return r; }; }

var DriveSync = {
  SECTIONS:SECTIONS, sectionOf:sectionOf, itemize:itemize, build:build, hash:hash,
  init:function(opt){ S.opt = opt || {}; S.opt.store = S.opt.store || lsStore(); S.meta = null; meta(); if(!S.opt.store.watchless) watch(); S.inited = true; status(); return DriveSync; },
  sync:function(o){ return sync(o || {manual:true}); }, auto:function(){ return sync({}); }, status:function(){ return status(); },
  touch:markDirty, pending:pending, meta:meta, saveMeta:saveMeta, sectionOn:sectionOn,
  setOn:function(sec, on){ meta().on[sec] = !!on; if(on){ delete meta().rm[sec]; } saveMeta(); status(); },
  setAuto:function(on){ meta().auto = !!on; saveMeta(); status(); if(on) schedule(500); },
  setWifi:function(on){ meta().wifi = !!on; saveMeta(); },
  signedIn:function(info){ var m = meta(); m.signed = true; m.email = info.email || m.email || ""; m.name = info.name || ""; m.photo = info.photo || ""; m.err = ""; saveMeta(); status(); },
  signedOut:function(){ var m = meta(); m.signed = false; m.email = ""; m.name = ""; m.photo = ""; m.rm = {}; m.fid = {}; m.k = {}; m.lastMan = null; saveMeta(); status("off"); },
  conflicts:function(){ return meta().conflicts; },
  restoreConflict:function(i){ var m = meta(), c = m.conflicts[i]; if(!c) return false; var raw = st().get(c.key), L = raw == null ? {shape:{t:"json"}, items:{}} : itemize(raw);
    L.items[c.item] = {v:c.lost, o:(L.items[c.item] || {}).o}; var nv = build(L.shape, L.items); m.conflicts.splice(i, 1); saveMeta(); if(nv != null){ st().set(c.key, nv); markDirty(c.key); m.dirty[c.key] = Date.now(); saveMeta(); } return true; },
  wipe:function(){ return list().then(function(files){ return Promise.all(Object.keys(files).map(function(n){ return remove(files[n].id); })); }).then(function(){ var m = meta(); m.rm = {}; m.fid = {}; m.k = {}; m.lastMan = null; m.last = 0; saveMeta(); status(); }); },
  _list:function(){ return list(); }, _download:function(id){ return download(id); }};
root.DriveSync = DriveSync;
if(typeof module !== "undefined" && module.exports) module.exports = DriveSync;
})(typeof window !== "undefined" ? window : this);
