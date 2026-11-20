/* My Ihsan 0.6.26 (owner spec §12–13, phase 2): Kewangan › Niaga › Google Sheet.
   The person's own Google Sheet + Apps Script (finance/niaga_gas.js) is the account book and the shared truth between phones.
   This phone keeps, per business, D.link[pid] = {url, key, letter, role, seq, sent:{id:rev}, block:{id:rev}, devs, last, err, auto, sheet}
   (never exported in .ihsanbiz, never synced). Push = every record whose rev differs from sent[id]; pull = rows changed after seq.
   Conflicts: newer rev wins (then later upd); the losing local version is kept in D.sync.conflicts to keep or drop. Nothing is lost.
   Never sent: images (only their ids), customers' IC digits. NiagaSheet.init(ctx) */
(function(){ "use strict";
var N = window.NiagaDoc, C = null, busy = {}, kickT = {}, seqId = 0, tick = null;
var KA = {profile:"profiles", customer:"customers", item:"items", doc:"docs", expense:"expenses", bkcfg:"bkcfg", booking:"bookings"};   // 0.6.53: bookings sync too
function H(){ return C.H; }
function L(a, b){ return C.H.L2x(a, b); }
function E(s){ return C.H.esc(s == null ? "" : String(s)); }
function link(D, pid){ D.link = D.link || {}; return D.link[pid] || null; }
function ago(iso){ if(!iso) return ""; var m = Math.round((Date.now() - Date.parse(iso)) / 60000); return m < 1 ? L("baru tadi", "just now") : m < 60 ? m + L(" min lalu", " min ago") : m < 1440 ? Math.round(m / 60) + L(" jam lalu", " h ago") : Math.round(m / 1440) + L(" hari lalu", " d ago"); }
function msg(e){ var m = String(e && e.message || e || ""); if(m === "html") return L("Skrip belum dibuka untuk \"Anyone\". Semak langkah 3.", "The script is not open to \"Anyone\". Check step 3.");
  if(m === "auth") return L("Telefon ini dibatalkan atau kunci salah", "This phone was removed or its key is wrong"); if(m === "token") return L("Token salah: salin skrip sekali lagi", "Wrong token: copy the script again");
  if(m === "code") return L("Kod jemputan salah atau tamat (10 minit)", "The invite code is wrong or expired (10 minutes)"); if(m === "other") return L("Sheet ini milik perniagaan lain", "This sheet belongs to another business");
  if(/timeout|network|failed to fetch|UnknownHost|ConnectException/i.test(m)) return L("Tiada internet. Akan cuba lagi.", "No internet. Will try again."); return m.slice(0, 120); }

// ---------- transport ----------
function post(url, obj){ var body = JSON.stringify(obj), Nn = H().N;
  if(window.Native && Nn && Nn.postText) return new Promise(function(ok, bad){ var id = "ngs" + (++seqId), t = null;
    var h = function(r){ if(!r || r.id !== id) return; H().off("post2", h); clearTimeout(t); if(!r.status || r.status >= 400){ bad(new Error(r.status ? "HTTP " + r.status : (r.body || "network"))); return; }
      try{ ok(JSON.parse(r.body)); }catch(e){ bad(new Error(/<html/i.test(r.body || "") ? "html" : "bad reply")); } };
    t = setTimeout(function(){ H().off("post2", h); bad(new Error("timeout")); }, 130000); H().on("post2", h); Nn.postText(id, url, body); });
  return fetch(url, {method:"POST", body:body, headers:{"Content-Type":"text/plain;charset=utf-8"}, redirect:"follow"}).then(function(r){ if(!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
    .then(function(t){ try{ return JSON.parse(t); }catch(e){ throw new Error(/<html/i.test(t) ? "html" : "bad reply"); } }); }
function call(l, op, extra){ var D = C.D(); return post(l.url, Object.assign({op:op, dev:D.dev.id, key:l.key, app:C.ver}, extra || {})).then(function(r){ if(!r || !r.ok) throw new Error((r && r.err) || "fail"); return r; }); }

// ---------- records ----------
function recs(D, pid){ var out = [], p = N.byId(D.profiles, pid); if(p) out.push(["profile", p]);
  [["customers","customer"],["items","item"],["docs","doc"],["expenses","expense"],["bkcfg","bkcfg"],["bookings","booking"]].forEach(function(k){ (D[k[0]] || []).forEach(function(r){ if(r.pid === pid) out.push([k[1], r]); }); }); return out; }
function strip(kind, r){ var o = JSON.parse(JSON.stringify(r)); if(kind === "doc" && o.csig) delete o.csig.ic; return o; }
function rowOf(kind, r){ return {id:r.id, kind:kind, pid:kind === "profile" ? r.id : r.pid, rev:r.rev || 0, upd:r.upd || "", by:r.by || "", del:!!r.del, json:JSON.stringify(strip(kind, r))}; }
function pending(D, pid){ var l = link(D, pid); if(!l) return []; l.sent = l.sent || {}; var bl = l.block || {};
  return recs(D, pid).filter(function(x){ var r = x[1]; if(r.status === "draft" && r.del && l.sent[r.id] == null) return false; return l.sent[r.id] !== (r.rev || 0) && bl[r.id] !== (r.rev || 0); }); }
// apply one row from the sheet; returns 1 when this phone changed
function apply(D, l, row, why){ var arr = D[KA[row.kind]]; if(!arr) return 0; var j; try{ j = JSON.parse(row.json); }catch(e){ return 0; }
  j.id = row.id; j.rev = +row.rev || 0; j.upd = row.upd; if(row.del) j.del = true; if(row.kind !== "profile" && !j.pid) j.pid = row.pid;
  var cur = N.byId(arr, row.id);
  if(!cur){ arr.push(j); l.sent[row.id] = j.rev; return 1; }
  if((cur.rev || 0) === j.rev && cur.upd === j.upd){ l.sent[row.id] = j.rev; return 0; }
  if(why === "server" || N.newer(j, cur)){ var dirty = l.sent[cur.id] !== (cur.rev || 0);
    if(dirty && JSON.stringify(strip(row.kind, cur)) !== JSON.stringify(strip(row.kind, j))) D.sync.conflicts.push({id:cur.id, kind:row.kind, pid:row.kind === "profile" ? cur.id : cur.pid, mine:JSON.parse(JSON.stringify(cur)), at:N.iso(), why:"edit"});
    if(cur.csig && cur.csig.ic && j.csig && !j.csig.ic) j.csig.ic = cur.csig.ic;
    arr[arr.indexOf(cur)] = j; l.sent[row.id] = j.rev; return 1; }
  return 0; }

// ---------- sync ----------
function sync(pid, opt){ opt = opt || {}; var D0 = C.D(), l0 = link(D0, pid); if(!l0 || !l0.url || l0.off) return Promise.resolve(0);
  if(busy[pid]) return busy[pid]; if(C.editing() && !opt.force){ kick(pid, 8000); return Promise.resolve(0); }
  var changed = 0, prog = 0; l0.st = "busy"; paint();
  var pull = function(){ var l = link(C.D(), pid); return call(l, "pull", {since:l.seq || 0, limit:500}).then(function(r){ var D = C.D(), l2 = link(D, pid); l2.sent = l2.sent || {};
      (r.rows || []).forEach(function(row){ changed += apply(D, l2, row, ""); }); prog += (r.rows || []).length; l2.seq = r.seq; if(r.nd){ if((l2.devs || 1) <= 1 && r.nd > 1 && !l2.letterNote) l2.letterNote = 1; l2.devs = r.nd; }
      if(!D.cur || !N.byId(D.profiles, D.cur) || N.byId(D.profiles, D.cur).del){ if(N.byId(D.profiles, pid)) D.cur = pid; }
      C.save(); if(opt.progress) opt.progress(prog); paint(); if(r.more) return pull(); }); };
  var push = function(){ var D = C.D(), l = link(D, pid), list = pending(D, pid).map(function(x){ return rowOf(x[0], x[1]); }); if(!list.length) return;
    var batch = list.slice(0, 200);
    return call(l, "push", {rows:batch}).then(function(r){ var D2 = C.D(), l2 = link(D2, pid), rej = {}; (r.rejected || []).forEach(function(x){ rej[x.id] = x; });
      batch.forEach(function(b){ var x = rej[b.id]; if(!x){ l2.sent[b.id] = b.rev; return; }
        if(x.why === "old" && x.server){ changed += apply(D2, l2, {id:b.id, kind:b.kind, pid:b.pid, rev:x.rev, upd:x.upd, del:x.del, json:x.server}, "server"); }
        else { l2.block = l2.block || {}; l2.block[b.id] = b.rev; D2.sync.conflicts.push({id:b.id, kind:b.kind, pid:b.pid, why:x.why, at:N.iso(), mine:JSON.parse(b.json)}); changed++; } });
      C.save(); if(list.length > 200) return push(); }); };
  var imgs = function(){ var D = C.D(), l = link(D, pid), pr = N.byId(D.profiles, pid); if(!pr || !pr.driveImg || !C.imgGet) return;
    var ids = [pr.logo, pr.stamp, pr.qr].concat((pr.sigs || []).map(function(g){ return g.img; })).filter(Boolean); l.imgUp = l.imgUp || {};
    var chain = Promise.resolve(); ids.forEach(function(id){ chain = chain.then(function(){ var have = C.imgGet(id), l2 = link(C.D(), pid);
      if(have && !l2.imgUp[id]) return call(l2, "imgput", {id:id, data:have}).then(function(){ l2.imgUp[id] = 1; C.save(); });
      if(!have) return call(l2, "imgget", {id:id}).then(function(r){ if(r.data){ C.imgPut(id, r.data); l2.imgUp[id] = 1; changed++; C.save(); } }, function(){}); }); });
    return chain.catch(function(e){ var l3 = link(C.D(), pid); if(String(e && e.message) === "op") l3.err = L("Kemas kini skrip untuk simpan gambar di Drive", "Update the script to keep images in Drive"); }); };
  var p = pull().then(push).then(imgs).then(function(){ var D = C.D(), l = link(D, pid); l.last = N.iso(); l.err = ""; })
    .catch(function(e){ var D = C.D(), l = link(D, pid); if(l){ l.err = msg(e); if(String(e && e.message) === "auth") l.gone = true; } })
    .then(function(){ var D = C.D(), l = link(D, pid); busy[pid] = null; if(l) l.st = ""; C.save(); paint(); if(changed && !C.editing()) C.redraw(); return changed; });
  busy[pid] = p; return p; }
function kick(pid, ms){ var D = C.D(), l = link(D, pid); if(!l || l.auto === false || l.off) return; clearTimeout(kickT[pid]); kickT[pid] = setTimeout(function(){ if(C.alive()) sync(pid); }, ms || 4000); }
function start(){ if(tick) return; tick = setInterval(function(){ if(!C || !C.alive()){ clearInterval(tick); tick = null; return; } var D = C.D(); Object.keys(D.link || {}).forEach(function(pid){ var l = D.link[pid]; if(l && l.auto !== false && !l.off) sync(pid); }); }, 5 * 60000); }

// ---------- status chip (top of every Niaga page) ----------
function chip(pid){ var D = C.D(), l = link(D, pid); if(!l || !l.url) return C.role && C.role() === "none" ? "" : '<button class="ngSync off" data-ngsync="' + pid + '">📗 Google Sheet · ' + L("belum disambung. Ketik untuk sambung", "not connected. Tap to connect") + '</button>';
  var nc = D.sync.conflicts.filter(function(c){ return c.pid === pid; }).length, np = pending(D, pid).length, t;
  if(l.off) t = "⏸ " + L("Sync dihentikan", "Sync paused"); else if(busy[pid] || l.st === "busy") t = "🔄 " + L("Sync…", "Syncing…"); else if(l.gone) t = "⛔ " + L("Telefon ini dibatalkan", "This phone was removed");
  else if(nc) t = "⚠️ " + nc + L(" konflik", " conflicts"); else if(l.err) t = "⚠️ " + E(l.err); else if(np) t = "⏳ " + np + L(" menunggu", " waiting"); else t = "✅ " + L("Sync ", "Synced ") + ago(l.last);
  return '<button class="ngSync' + (nc || l.err || l.gone ? " warn" : "") + '" data-ngsync="' + pid + '">' + t + (l.letter && (l.devs || 1) > 1 ? ' · ' + L("telefon ", "phone ") + E(l.letter) : '') + '</button>'; }
function paint(){ try{ var D = C.D(); document.querySelectorAll("[data-ngsync]").forEach(function(b){ var pid = b.getAttribute("data-ngsync"), x = document.createElement("div"); x.innerHTML = chip(pid); if(x.firstChild) b.replaceWith(x.firstChild); }); bindChips(); }catch(e){} }
function bindChips(){ document.querySelectorAll("[data-ngsync]").forEach(function(b){ b.onclick = function(){ open(b.getAttribute("data-ngsync")); }; }); }

// ---------- Profil › Google Sheet ----------
function openUrl(u){ var Nn = H().N; if(window.Native && Nn.openUrl) Nn.openUrl(u); else window.open(u, "_blank"); }
function copy(t){ var Nn = H().N; try{ if(window.Native && Nn.copyText){ Nn.copyText(t); return; } }catch(e){} try{ navigator.clipboard.writeText(t); }catch(e){} }
function open(pid){ var D = C.D(), l = link(D, pid), p = N.byId(D.profiles, pid); if(!l || !l.url){ connect(pid); return; }
  var nc = D.sync.conflicts.filter(function(c){ return c.pid === pid; }), owner = l.role !== "staff";
  var ov = H().showSheet("📗 Google Sheet", '<div class="card ngGs"><b>' + E(l.name || "Google Sheet") + '</b><div class="mut small">' + E(p ? p.name : "") + ' · ' + L("Telefon ini: ", "This phone: ") + E(l.letter || "A") + ' · ' + (owner ? L("Pemilik", "Owner") : L("Staf", "Staff")) + '</div>' +
    '<div id="gsChip">' + chip(pid) + '</div>' + (l.err ? '<div class="mut small">' + E(l.err) + '</div>' : '') + '</div>' +
    '<div class="ngShare"><button class="btn gold g3d" id="gsNow">🔄 ' + L("Sync sekarang", "Sync now") + '</button><button class="btn alt g3d" id="gsOpen">📗 ' + L("Buka Sheet", "Open the Sheet") + '</button>' +
    (owner ? '<button class="btn alt g3d" id="gsAdd">📱 ' + L("Tambah telefon", "Add a phone") + '</button><button class="btn alt g3d" id="gsDev">👥 ' + L("Peranti", "Phones") + '</button><button class="btn alt g3d" id="gsReb">🛠 ' + L("Bina semula", "Rebuild") + '</button>' : '') +
    '<button class="btn alt g3d" id="gsPause">' + (l.off ? "▶ " + L("Sambung sync", "Resume sync") : "⏸ " + L("Henti sync", "Pause sync")) + '</button></div>' +
    (owner && p ? '<div class="snl">👤 ' + L("Kebenaran staf", "Staff permissions") + '</div><div class="f2"><label class="fl">' + L("Diskaun maksimum staf (%)", "Staff's maximum discount (%)") + '<input id="gsDm" type="number" min="0" max="100" value="' + E((p.perms || {}).staffDiscMax != null ? p.perms.staffDiscMax : 10) + '"></label></div>' +
      '<label class="ngTog"><input type="checkbox" id="gsPay"' + ((p.perms || {}).staffPay !== false ? " checked" : "") + '><span><b>' + L("Staf boleh rekod bayaran", "Staff can record payments") + '</b></span></label>' +
      '<label class="ngTog"><input type="checkbox" id="gsPdf"' + (p.drivePdf ? " checked" : "") + '><span><b>' + L("Simpan PDF ke Drive", "Save PDFs to Drive") + '</b><small>' + L("Setiap dokumen yang dikongsi disalin ke folder PDF <tahun> dalam Drive anda; pautan dalam tab Dokumen.", "Every shared document is copied to a PDF <year> folder in your Drive; the link is in the Dokumen tab.") + '</small></span></label>' +
      '<label class="ngTog"><input type="checkbox" id="gsImg"' + (p.driveImg ? " checked" : "") + '><span><b>' + L("Simpan gambar profil ke Drive", "Keep profile images in Drive") + '</b><small>' + L("Logo, tandatangan, cop dan QR dalam folder peribadi Drive anda, supaya telefon lain dapat memuatkannya.", "Logo, signatures, stamp and QR in a private folder in your Drive, so other phones can load them.") + '</small></span></label>' +
      (D.gsTok && D.gsTok[pid] ? '<button class="btn alt full g3d" id="gsUpd">⬆ ' + L("Kemas kini skrip", "Update the script") + '</button>' : '') : '') +
    '<label class="ngTog"><input type="checkbox" id="gsAuto"' + (l.auto !== false ? " checked" : "") + '><span><b>' + L("Sync automatik", "Automatic sync") + '</b><small>' + L("Selepas setiap simpan dan setiap 5 minit semasa Niaga dibuka.", "After every save and every 5 minutes while Niaga is open.") + '</small></span></label>' +
    (nc.length ? '<div class="snl">⚠️ ' + L("Konflik", "Conflicts") + '</div>' + nc.map(function(c, i){ return confRow(D, c, i); }).join("") : '') +
    '<div class="mut tiny" style="margin-top:10px">🔒 ' + L("Logo, tandatangan, cop dan IC tidak pernah dihantar ke Sheet.", "Logos, signatures, stamps and IC numbers are never sent to the Sheet.") + '</div>' +
    '<button class="btn alt full g3d" id="gsUn" style="margin-top:10px">⛓ ' + L("Putuskan telefon ini dari Sheet", "Unlink this phone from the Sheet") + '</button>');
  var again = function(){ H().closeOverlay(); open(pid); };
  ov.querySelector("#gsNow").onclick = function(){ sync(pid, {force:true}).then(function(){ if(document.body.contains(ov)) again(); }); var c = ov.querySelector("#gsChip"); if(c) c.innerHTML = chip(pid); };
  ov.querySelector("#gsOpen").onclick = function(){ openUrl(l.sheet || l.url); };
  ov.querySelector("#gsAuto").onchange = function(){ l.auto = this.checked; C.save(); };
  var perm = function(){ var pr = N.byId(C.D().profiles, pid); pr.perms = pr.perms || {}; pr.perms.staffDiscMax = Math.max(0, Math.min(100, +ov.querySelector("#gsDm").value || 0)); pr.perms.staffPay = ov.querySelector("#gsPay").checked; pr.driveImg = ov.querySelector("#gsImg").checked; pr.drivePdf = ov.querySelector("#gsPdf").checked; N.stamp(C.D(), pr); C.save(); kick(pid, 800); };
  ["#gsDm", "#gsPay", "#gsImg", "#gsPdf"].forEach(function(id){ var x = ov.querySelector(id); if(x) x.onchange = perm; });
  var up = ov.querySelector("#gsUpd"); if(up) up.onclick = function(){ copy(window.NIAGA_GAS.replace("__TOKEN__", D.gsTok[pid])); H().toast("📋 " + L("Skrip baharu disalin", "New script copied"));
    alert(L("Di Apps Script: padam semua, tampal, Simpan. Kemudian Deploy › Manage deployments › ✎ › Version: New version › Deploy. URL kekal sama.", "In Apps Script: delete everything, paste, Save. Then Deploy › Manage deployments › ✎ › Version: New version › Deploy. The URL stays the same.")); };
  ov.querySelector("#gsPause").onclick = function(){ l.off = !l.off; C.save(); again(); };
  ov.querySelector("#gsUn").onclick = function(){ if(!confirm(L("Putuskan? Data di telefon dan di Sheet kekal. Anda boleh sambung semula dengan kod jemputan.", "Unlink? Data on this phone and in the Sheet stays. You can link again with an invite code."))) return; delete D.link[pid]; C.save(); H().closeOverlay(); C.redraw(); };
  var on = function(id, f){ var x = ov.querySelector(id); if(x) x.onclick = f; };
  on("#gsAdd", function(){ invite(pid); }); on("#gsDev", function(){ phones(pid); });
  on("#gsReb", function(){ var b = ov.querySelector("#gsReb"); b.disabled = true; call(l, "rebuild").then(function(){ H().toast("✅ " + L("Sheet dibina semula", "Sheet rebuilt")); }, function(e){ H().toast("⚠️ " + msg(e)); }).then(function(){ b.disabled = false; }); });
  ov.querySelectorAll("[data-cf]").forEach(function(b){ b.onclick = function(){ var q = b.getAttribute("data-cf").split("|"); resolve(pid, +q[0], q[1]); again(); }; }); }
function label(D, c){ var m = c.mine || {}; if(c.kind === "doc") return (m.no || L("Draf", "Draft")) + " · " + ((m.cust || {}).name || ""); if(c.kind === "profile") return L("Profil perniagaan", "Business profile"); return m.name || c.kind; }
function confRow(D, c, i){ var why = {edit:L("Diubah di dua telefon", "Changed on two phones"), dup:L("Nombor sudah digunakan telefon lain", "Number already used by another phone"), role:L("Perlu kelulusan pemilik", "Needs the owner"), json:"?"}[c.why] || c.why;
  var all = D.sync.conflicts.indexOf(c);
  return '<div class="ngRow card"><i>⚠️</i><span><b>' + E(label(D, c)) + '</b><small>' + E(why) + ' · ' + E(String(c.at).slice(0, 16).replace("T", " ")) + '</small></span><span class="ngCfB">' +
    (c.why === "edit" ? '<button class="chip" data-cf="' + all + '|mine">' + L("Guna saya", "Keep mine") + '</button><button class="chip" data-cf="' + all + '|theirs">' + L("Guna Sheet", "Keep theirs") + '</button>' : '<button class="chip" data-cf="' + all + '|theirs">' + L("Faham", "OK") + '</button>') + '</span></div>'; }
// Keep mine: my copy becomes the newest version (rev above the sheet's) and is sent again
function resolve(pid, i, how){ var D = C.D(), c = D.sync.conflicts[i], l = link(D, pid); if(!c) return; D.sync.conflicts.splice(i, 1);
  if(how === "mine"){ var arr = D[KA[c.kind]], cur = N.byId(arr, c.id), m = c.mine; m.rev = Math.max(cur ? cur.rev || 0 : 0, m.rev || 0); N.stamp(D, m); if(cur) arr[arr.indexOf(cur)] = m; else arr.push(m); }
  if(l && l.block) delete l.block[c.id];
  C.save(); C.redraw(); kick(pid, 500); }

// ---------- connect a NEW sheet (owner, first phone) ----------
function connect(pid){ var D = C.D(), p = N.byId(D.profiles, pid); if(!p) return; var tok = (D.gsTok = D.gsTok || {})[pid] || (D.gsTok[pid] = N.rid(24)); C.save();
  var step = function(n, t, b){ return '<div class="ngStep"><i>' + n + '</i><div><b>' + t + '</b>' + (b || "") + '</div></div>'; };
  var ov = H().showSheet("📗 " + L("Sambung Google Sheet", "Connect a Google Sheet"), '<div class="mut small">' + L("Satu Sheet kosong menjadi buku akaun lengkap yang dikemas kini sendiri. Percuma, dalam akaun Google anda sendiri. Buat sekali sahaja, kira-kira 3 minit.", "One empty Sheet becomes a full account book that keeps itself up to date. Free, in your own Google account. Done once, about 3 minutes.") + '</div>' +
    step(1, L("Buka Sheet kosong", "Open an empty Sheet"), '<button class="btn alt sm g3d" id="gs1">📗 sheets.new</button>') +
    step(2, L("Sambungan › Apps Script, padam semua, tampal skrip", "Extensions › Apps Script, delete everything, paste the script"), '<button class="btn gold sm g3d" id="gs2">📋 ' + L("Salin skrip", "Copy the script") + '</button>') +
    step(3, L("Deploy › New deployment › ⚙ Web app", "Deploy › New deployment › ⚙ Web app"), '<small class="mut">' + L("Execute as: Me · Who has access: Anyone → Deploy → Authorize access (Advanced › Go to… jika diminta)", "Execute as: Me · Who has access: Anyone → Deploy → Authorize access (Advanced › Go to… if asked)") + '</small>') +
    step(4, L("Salin Web app URL dan tampal di sini", "Copy the Web app URL and paste it here"), '<input id="gsU" type="url" placeholder="https://script.google.com/macros/s/…/exec"><button class="btn alt sm g3d" id="gsPaste">📥 ' + L("Tampal", "Paste") + '</button>') +
    step(5, L("Uji & sambung", "Test & connect"), '<button class="btn gold sm g3d" id="gs5">✓ ' + L("Uji & sambung", "Test & connect") + '</button><div id="gsMsg" class="mut small"></div>') +
    '<div class="snl" style="margin-top:12px">' + L("Sudah ada Sheet?", "Already have a Sheet?") + '</div><button class="btn alt full g3d" id="gsJoin">🔗 ' + L("Sambung ke Sheet sedia ada", "Join an existing Sheet") + '</button>');
  ov.querySelector("#gs1").onclick = function(){ openUrl("https://sheets.new"); };
  ov.querySelector("#gs2").onclick = function(){ copy(window.NIAGA_GAS.replace("__TOKEN__", tok)); H().toast("📋 " + L("Skrip disalin", "Script copied")); };
  ov.querySelector("#gsPaste").onclick = function(){ try{ navigator.clipboard.readText().then(function(t){ if(t) ov.querySelector("#gsU").value = t.trim(); }); }catch(e){} };
  ov.querySelector("#gsJoin").onclick = function(){ H().closeOverlay(); join(); };
  ov.querySelector("#gs5").onclick = function(){ var u = ov.querySelector("#gsU").value.trim(), m = ov.querySelector("#gsMsg");
    if(!/^https:\/\/script\.google(usercontent)?\.com\/.+/.test(u)){ m.textContent = L("URL mesti bermula https://script.google.com/macros/s/…", "The URL must start with https://script.google.com/macros/s/…"); return; }
    m.textContent = "⏳ " + L("Menguji…", "Testing…");
    hello(u, tok, pid, "").then(function(){ m.textContent = "✅ " + L("Bersambung. Menghantar rekod…", "Connected. Sending records…"); return sync(pid, {force:true}); })
      .then(function(){ H().closeOverlay(); H().toast("✅ " + L("Google Sheet bersambung", "Google Sheet connected")); C.redraw(); }, function(e){ m.textContent = "⚠️ " + msg(e); }); }; }
function hello(url, tok, pid, replace){ var D = C.D();
  return post(url, {op:"hello", token:tok, pid:pid, replace:replace || "", dev:{id:D.dev.id, name:devName(), app:C.ver}}).then(function(r){ if(!r || !r.ok) throw new Error((r && r.err) || "fail");
    var D2 = C.D(); D2.link = D2.link || {}; var pid2 = r.pid || pid; D2.link[pid2] = {url:url, key:r.key, letter:r.letter, role:r.role, seq:0, sent:{}, block:{}, devs:r.devs || 1, name:r.name, sheet:r.url, auto:true, at:N.iso()}; C.save(); return pid2; }); }
function devName(){ var n = ""; try{ n = (C.H.N && C.H.N.deviceName && C.H.N.deviceName()) || ""; }catch(e){} return n || (navigator.userAgent.match(/;\s*([^;)]+)\s+Build/) || [0, "Android"])[1]; }

// ---------- add a phone: owner shows a QR (url + one-time code, 10 minutes) ----------
function invite(pid){ var D = C.D(), l = link(D, pid), role = "staff";
  var ov = H().showSheet("📱 " + L("Tambah telefon", "Add a phone"), '<div class="snl">' + L("Peranan telefon baharu", "Role of the new phone") + '</div><div class="chips"><button class="chip on" data-rl="staff">👤 ' + L("Staf", "Staff") + '</button><button class="chip" data-rl="owner">👑 ' + L("Pemilik", "Owner") + '</button></div>' +
    '<div class="mut small" id="rlD"></div><button class="btn gold full g3d" id="ivGo" style="margin-top:10px">🔑 ' + L("Buat kod jemputan", "Make an invite code") + '</button><div id="ivOut"></div>');
  var desc = function(){ ov.querySelector("#rlD").textContent = role === "staff" ? L("Staf boleh buat dan kongsi dokumen, rekod bayaran dan tambah pelanggan. Tidak boleh batal dokumen, ubah profil atau lihat jumlah perniagaan.", "Staff can make and share documents, record payments and add customers. They cannot void documents, change the profile or see business totals.") : L("Pemilik boleh semua, termasuk tambah dan batalkan telefon.", "Owners can do everything, including adding and removing phones."); };
  ov.querySelectorAll("[data-rl]").forEach(function(b){ b.onclick = function(){ role = b.getAttribute("data-rl"); ov.querySelectorAll("[data-rl]").forEach(function(x){ x.classList.toggle("on", x === b); }); desc(); }; }); desc();
  ov.querySelector("#ivGo").onclick = function(){ var b = this; b.disabled = true; call(l, "invite", {role:role}).then(function(r){ var txt = "ihsanbiz:" + JSON.stringify({u:l.url, c:r.code, n:l.name || ""});
      var show = function(){ var q = ""; try{ q = qrSvg(txt); }catch(e){} ov.querySelector("#ivOut").innerHTML = '<div class="ngQr">' + q + '</div><div class="center"><b class="ngCode">' + E(r.code) + '</b><div class="mut small">' + L("Di telefon baharu: Niaga › Sambung ke Sheet sedia ada › Imbas, atau salin kod penuh. Sah 10 minit, sekali guna.", "On the new phone: Business › Join an existing Sheet › Scan, or copy the full code. Valid 10 minutes, one use.") + '</div><button class="btn alt g3d" id="ivCp">📋 ' + L("Salin kod penuh", "Copy the full code") + '</button></div>';
        ov.querySelector("#ivCp").onclick = function(){ copy(txt); H().toast(L("Disalin", "Copied")); }; };
      if(window.NostrKit) show(); else C.loadJs(["groups/nostrkit.js"], show, show); }, function(e){ H().toast("⚠️ " + msg(e)); }).then(function(){ b.disabled = false; }); }; }
function qrSvg(text){ var q = window.NostrKit.qrcode(0, "M"); q.addData(text); q.make(); var n = q.getModuleCount(), s = 4, p = "";
  for(var r = 0; r < n; r++) for(var c = 0; c < n; c++) if(q.isDark(r, c)) p += "M" + (c * s + s * 2) + " " + (r * s + s * 2) + "h" + s + "v" + s + "h-" + s + "z";
  var w = n * s + s * 4; return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + w + '"><rect width="' + w + '" height="' + w + '" fill="#fff"/><path d="' + p + '" fill="#000"/></svg>'; }
function phones(pid){ var D = C.D(), l = link(D, pid);
  var ov = H().showSheet("👥 " + L("Telefon yang bersambung", "Linked phones"), '<div id="pdL" class="mut">⏳</div>');
  call(l, "devs").then(function(r){ var box = ov.querySelector("#pdL"); if(!box) return; box.classList.remove("mut");
    box.innerHTML = r.devs.map(function(d){ return '<div class="ngRow card"><i>' + (d.revoked ? "⛔" : d.role === "owner" ? "👑" : "👤") + '</i><span><b>' + E(d.letter) + ' · ' + E(d.name || "—") + (d.id === D.dev.id ? L(" (telefon ini)", " (this phone)") : "") + '</b><small>' + (d.revoked ? L("dibatalkan", "removed") : (d.role === "owner" ? L("Pemilik", "Owner") : L("Staf", "Staff")) + " · " + L("aktif ", "seen ") + ago(d.last)) + '</small></span>' +
      (!d.revoked && d.id !== D.dev.id ? '<span class="ngCfB"><button class="chip" data-pr="' + E(d.id) + '|' + (d.role === "owner" ? "staff" : "owner") + '">' + (d.role === "owner" ? L("Jadi staf", "Make staff") : L("Jadi pemilik", "Make owner")) + '</button><button class="chip" data-px="' + E(d.id) + '">⛔ ' + L("Batal", "Remove") + '</button></span>' : '') + '</div>'; }).join("") +
      '<div class="mut tiny">' + L("Telefon yang dibatalkan tidak boleh membaca atau menulis lagi. Hurufnya tidak digunakan semula.", "A removed phone can no longer read or write. Its letter is never reused.") + '</div>';
    box.querySelectorAll("[data-px]").forEach(function(b){ b.onclick = function(){ if(!confirm(L("Batalkan telefon ini?", "Remove this phone?"))) return; call(l, "revoke", {id:b.getAttribute("data-px")}).then(function(){ H().closeOverlay(); phones(pid); }, function(e){ H().toast(msg(e)); }); }; });
    box.querySelectorAll("[data-pr]").forEach(function(b){ b.onclick = function(){ var q = b.getAttribute("data-pr").split("|"); call(l, "role", {id:q[0], role:q[1]}).then(function(){ H().closeOverlay(); phones(pid); }, function(e){ H().toast(msg(e)); }); }; });
  }, function(e){ var box = ov.querySelector("#pdL"); if(box) box.textContent = "⚠️ " + msg(e); }); }

// ---------- join an existing sheet (second phone, or a new phone after the old one is gone) ----------
function parseCode(t){ t = String(t || "").trim(); if(t.indexOf("ihsanbiz:") !== 0) return null; try{ var j = JSON.parse(t.slice(9)); return j.u && j.c ? j : null; }catch(e){ return null; } }
function join(){ var ov = H().showSheet("🔗 " + L("Sambung ke Sheet sedia ada", "Join an existing Sheet"),
    '<div class="snl">' + L("Telefon kedua (staf atau pasangan)", "A second phone (staff or partner)") + '</div><div class="mut small">' + L("Di telefon pemilik: Niaga › butang 📗 Google Sheet di bawah menu › 📱 Tambah telefon.", "On the owner's phone: Business › the 📗 Google Sheet button under the menu › 📱 Add a phone.") + '</div>' +
    '<div class="btns"><button class="btn gold g3d" id="jnScan">📷 ' + L("Imbas QR", "Scan the QR") + '</button></div><label class="fl">' + L("atau tampal kod penuh", "or paste the full code") + '<textarea id="jnC" rows="2" placeholder="ihsanbiz:{…}"></textarea></label><button class="btn alt full g3d" id="jnGo">🔗 ' + L("Sambung", "Join") + '</button>' +
    '<div class="snl" style="margin-top:14px">' + L("Telefon lama hilang / tukar telefon", "Old phone lost / changing phone") + '</div><div class="mut small">' + L("Web app URL ada dalam Apps Script (Deploy › Manage deployments). Token ada di baris TOKEN dalam skrip.", "The Web app URL is in Apps Script (Deploy › Manage deployments). The token is on the TOKEN line of the script.") + '</div>' +
    '<label class="fl">Web app URL<input id="jnU" type="url" placeholder="https://script.google.com/macros/s/…/exec"></label><label class="fl">Token<input id="jnT" type="text"></label>' +
    '<label class="fl">' + L("Ganti telefon berhuruf", "Replace the phone with letter") + '<select id="jnR"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option><option value="">' + L("Telefon tambahan baharu", "A new extra phone") + '</option></select></label>' +
    '<button class="btn alt full g3d" id="jnRec">♻ ' + L("Pulihkan dari Sheet", "Restore from the Sheet") + '</button><div id="jnMsg" class="mut small"></div>');
  var m = ov.querySelector("#jnMsg"), progress = function(n){ m.textContent = "⏳ " + n + L(" rekod diterima…", " records received…"); };
  var finish = function(pid){ m.textContent = "⏳ " + L("Menerima rekod…", "Receiving records…"); return sync(pid, {force:true, progress:progress}).then(function(){ var D = C.D(); if(N.byId(D.profiles, pid)) D.cur = pid; C.save(); H().closeOverlay(); C.afterJoin(pid); H().toast("✅ " + L("Bersambung", "Connected")); }); };
  var go = function(t){ var j = parseCode(t); if(!j){ m.textContent = "⚠️ " + L("Kod tidak sah", "Not a valid code"); return; } m.textContent = "⏳ " + L("Menyambung…", "Joining…"); var D = C.D();
    post(j.u, {op:"join", code:j.c, dev:{id:D.dev.id, name:devName(), app:C.ver}}).then(function(r){ if(!r || !r.ok) throw new Error((r && r.err) || "fail"); var D2 = C.D(); D2.link = D2.link || {};
      D2.link[r.pid] = {url:j.u, key:r.key, letter:r.letter, role:r.role, seq:0, sent:{}, block:{}, devs:r.devs || 2, name:r.name, sheet:r.url, auto:true, at:N.iso()}; C.save(); return finish(r.pid); }).catch(function(e){ m.textContent = "⚠️ " + msg(e); }); };
  ov.querySelector("#jnGo").onclick = function(){ go(ov.querySelector("#jnC").value); };
  ov.querySelector("#jnScan").onclick = function(){ scan(function(t){ join(); setTimeout(function(){ var c = document.querySelector("#jnC"); if(c){ c.value = t; document.querySelector("#jnGo").click(); } }, 300); }); };
  ov.querySelector("#jnRec").onclick = function(){ var u = ov.querySelector("#jnU").value.trim(), t = ov.querySelector("#jnT").value.trim().replace(/^.*TOKEN\s*=\s*"?|"?;?\s*$/g, ""), rp = ov.querySelector("#jnR").value;
    if(!u || !t){ m.textContent = L("Isi URL dan token", "Enter the URL and token"); return; } m.textContent = "⏳ " + L("Menyambung…", "Connecting…");
    hello(u, t, "", rp).then(finish).catch(function(e){ m.textContent = "⚠️ " + msg(e); }); }; }
// camera QR scan (BarcodeDetector, else the bundled ZXing), same as Groups invites
function scan(done, ok2, title){ var Hh = H(), Nn = Hh.N, valid = ok2 || function(t){ return !!parseCode(t); };
  var go = function(){ if(window.Native && Nn.hasPerm && !Nn.hasPerm("camera")){ var ph = function(r){ if(r.which !== "camera") return; Hh.off("perm", ph); if(r.granted) go(); }; Hh.on("perm", ph); Nn.requestPerm("camera"); return; }
    var ov = document.getElementById("overlay"), stream = null, t = null, closed = false;
    ov.className = "bcov"; ov.innerHTML = '<video id="gqV" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover"></video><div class="bcTop"><button class="qcX" id="gqX">✕</button><b>' + (title || L("Imbas QR telefon pemilik", "Scan the owner's QR")) + '</b><span></span></div>';
    var stop = function(){ closed = true; clearTimeout(t); if(stream) stream.getTracks().forEach(function(x){ x.stop(); }); Hh.closeOverlay(); };
    ov.querySelector("#gqX").onclick = stop; ov._close = stop;
    var v = ov.querySelector("#gqV"), cv = document.createElement("canvas"), cx = cv.getContext("2d", {willReadFrequently:true}), det = ("BarcodeDetector" in window) ? new window.BarcodeDetector({formats:["qr_code"]}) : null, zx = null;
    var hit = function(txt){ if(closed || !valid(txt)) return false; stop(); done(txt); return true; };
    var tk = function(){ if(closed) return; if(v.videoWidth){ if(det){ det.detect(v).then(function(r){ if(!(r && r[0] && hit(r[0].rawValue))) t = setTimeout(tk, 250); }).catch(function(){ t = setTimeout(tk, 400); }); return; }
        if(zx){ cv.width = v.videoWidth; cv.height = v.videoHeight; cx.drawImage(v, 0, 0); try{ var Z = window.ZXing, img = cx.getImageData(0, 0, cv.width, cv.height), lum = new Z.RGBLuminanceSource(img.data, cv.width, cv.height), r2 = zx.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(lum))); if(hit(r2.getText())) return; }catch(e){} } }
      t = setTimeout(tk, 300); };
    var cam = function(){ navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}).then(function(s){ stream = s; v.srcObject = s; tk(); }).catch(function(){ stop(); Hh.toast(L("Kamera tidak tersedia", "Camera not available")); }); };
    if(det) cam(); else { var sc = document.createElement("script"); sc.src = "halal/zxing.min.js"; sc.onload = function(){ var Z = window.ZXing; zx = new Z.MultiFormatReader(); var hm = new Map(); hm.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.QR_CODE]); zx.setHints(hm); cam(); }; sc.onerror = cam; if(window.ZXing) sc.onload(); else document.body.appendChild(sc); } };
  go(); }

window.NiagaSheet = {init:function(ctx){ C = ctx; start(); }, sync:sync, kick:kick, chip:chip, bind:bindChips, open:open, connect:connect, join:join, pending:pending, link:function(pid){ return link(C.D(), pid); },
  headless:function(ctx){ C = ctx; var D = C.D(); return Promise.all(Object.keys(D.link || {}).filter(function(pid){ var l = D.link[pid]; return l && l.url && l.auto !== false && !l.off && !l.gone; }).map(function(pid){ return sync(pid); })); },
  scan:scan,
  // 0.6.29: a PDF copy in the person's Drive (owner switch "Save PDFs to Drive"); returns the file link
  pdf:function(pid, name, b64, year){ var l = link(C.D(), pid); if(!l || !l.url || l.off || l.gone) return Promise.reject(new Error("off")); return call(l, "pdfput", {name:name, b64:b64, year:year}); },
  tabs:function(pid){ var l = link(C.D(), pid); return call(l, "tabs"); }, readtab:function(pid, name){ var l = link(C.D(), pid); return call(l, "readtab", {name:name}); },
  role:function(pid){ var l = link(C.D(), pid); return l && l.url ? l.role || "owner" : "owner"; }, parseCode:parseCode, rowOf:rowOf, apply:apply};
})();
