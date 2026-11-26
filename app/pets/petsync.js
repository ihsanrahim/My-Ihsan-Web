/* My Ihsan 0.7.72 · Pet manager ⇄ Family link. Turns ihsan_pets into records {id → value} so two phones merge (newest wins, deletions
   remembered). Photos and documents stay on the phone that took them. Registered as the FamLink channel "pets". */
(function(){
var KEY = "ihsan_pets", ARR = ["pets","meals","care","log","meds","vacc","vet","weight","exp","strays","prices","miles","kidch","litters","notes"];
function H(){ return window.PetSync._H; }
function load(){ var h = H(); return (h && h.load(KEY, null)) || {}; }
function strip(o){ var c = {}; Object.keys(o).forEach(function(k){ if(k !== "photo" && k !== "img" && k !== "_new") c[k] = o[k]; }); return c; }
function rec(d){ var r = {}; ARR.forEach(function(a){ (d[a] || []).forEach(function(x){ if(x && x.id) r[a + ":" + x.id] = strip(x); }); }); return r; }
function from(r, d){ var keep = {}; (d.pets || []).forEach(function(p){ if(p.photo) keep[p.id] = p.photo; });
  ARR.forEach(function(a){ d[a] = []; });
  Object.keys(r).forEach(function(id){ var i = id.indexOf(":"), a = id.slice(0, i); if(ARR.indexOf(a) < 0) return; var o = JSON.parse(JSON.stringify(r[id])); if(a === "pets" && keep[o.id]) o.photo = keep[o.id]; d[a].push(o); });
  d.log.sort(function(a, b){ return b.at - a.at; }); return d; }
function name(d, pid){ var p = (d.pets || []).filter(function(x){ return x.id === pid; })[0]; return p ? p.n : ""; }
function desc(id, v, added, removed){ var a = id.slice(0, id.indexOf(":")), d = load(), L = H().L2x;
  if(a === "log") return added && v && v.txt ? v.txt : "";
  if(a === "pets") return v ? (added ? "🐾 " + L("Haiwan baharu: ", "New pet: ") + v.n : removed ? "" : v.status === "passed" ? "🤍 " + v.n : "") : "";
  var n = v && (v.n || v.why || ""), who = v && v.p ? name(d, v.p) : "";
  var ic = {vacc: "💉", vet: "🩺", meds: "💊", weight: "⚖️", exp: "🧾", care: "🧽", meals: "🍽"}[a]; if(!ic) return "";
  if(removed) return ""; return ic + " " + (who ? who + ": " : "") + (n || (a === "weight" ? v.kg + " kg" : "")); }
window.PetSync = {_H: null, rec: rec, from: from,
  def: {label: "🐾 Pets", open: "side:alat/pets", get: load, put: function(d){ H().save(KEY, d); }, rec: rec, from: from, desc: desc, reload: function(){ if(window.PetMgr && PetMgr.reload) PetMgr.reload(); }}};
if(window.FamLink){ window.PetSync._H = window.PetSync._H || window.FamLink._H; }
window.PetSync.attach = function(h){ window.PetSync._H = h; if(window.FamLink) FamLink.channel("pets", window.PetSync.def); };
if(window.FamLink && window.FamLink._h) window.PetSync.attach(window.FamLink._h());
})();
