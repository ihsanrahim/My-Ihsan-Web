/* My Ihsan 0.7.93 (owner pick #28): Time › Move › Health › ❤️ pulse with the camera. A fingertip covers the back camera with the torch on;
   the red light through the skin rises and falls with each heartbeat (photoplethysmography). 30 s of frames → detrend → smooth → count peaks → BPM.
   A wellness estimate only, not a medical device (stated on screen). IbPulse.open(H, onResult(bpm)) · IbPulse.bpm(samples, fps) (pure, for tests). */
(function(){ "use strict";
// samples: [{t: ms, v: red mean}] → {bpm, q (0–1 quality)}; pure
function bpm(S){ if(!S || S.length < 60) return {bpm: 0, q: 0}; var n = S.length, i, v = S.map(function(s){ return s.v; });
  // detrend with a 1.5 s moving average, then smooth with a 0.2 s moving average
  var span = (S[n - 1].t - S[0].t) / 1000, fps = (n - 1) / span, w1 = Math.max(3, Math.round(fps * 1.5)), w2 = Math.max(1, Math.round(fps * 0.2));
  var ma = function(a, w){ var o = [], s = 0, q = []; for(var k = 0; k < a.length; k++){ q.push(a[k]); s += a[k]; if(q.length > w) s -= q.shift(); o.push(s / q.length); } return o; };
  var base = ma(v, w1), d = v.map(function(x, k){ return x - base[k]; }), sm = ma(d, w2);
  var sd = Math.sqrt(sm.reduce(function(a, x){ return a + x * x; }, 0) / n) || 1e-9, peaks = [], minGap = 60 / 200 * 1000;   // ≤ 200 bpm
  for(i = 2; i < n - 2; i++){ if(sm[i] > sm[i - 1] && sm[i] >= sm[i + 1] && sm[i] > 0.4 * sd && (!peaks.length || S[i].t - peaks[peaks.length - 1] >= minGap)) peaks.push(S[i].t); }
  if(peaks.length < 4) return {bpm: 0, q: 0};
  var gaps = []; for(i = 1; i < peaks.length; i++) gaps.push(peaks[i] - peaks[i - 1]); gaps.sort(function(a, b){ return a - b; });
  var med = gaps[Math.floor(gaps.length / 2)], good = gaps.filter(function(g){ return Math.abs(g - med) < med * 0.25; }), mean = good.reduce(function(a, g){ return a + g; }, 0) / (good.length || 1);
  var b = Math.round(60000 / mean); if(b < 40 || b > 200) return {bpm: 0, q: 0};
  // a real pulse repeats: the smoothed wave must look like itself one beat later (autocorrelation), otherwise it is noise
  var lag = Math.round(mean / 1000 * fps), num = 0, d1 = 0, d2 = 0; for(i = 0; i + lag < n; i++){ num += sm[i] * sm[i + lag]; d1 += sm[i] * sm[i]; d2 += sm[i + lag] * sm[i + lag]; }
  var ac = num / Math.sqrt(d1 * d2 || 1); if(ac < 0.3) return {bpm: 0, q: 0, ac: ac};
  return {bpm: b, q: good.length / gaps.length, ac: ac}; }
function open(H, onResult){ var L = function(a, b){ return H.L2x(a, b); }, ov = document.getElementById("overlay"), stream = null, track = null, closed = false, raf = 0, S = [], t0 = 0, DUR = 30000;
  var cv = document.createElement("canvas"), g = cv.getContext("2d", {willReadFrequently: true}); cv.width = 40; cv.height = 30;
  ov.className = "plsov"; ov.innerHTML = '<div class="plsHead"><button class="chip" id="plX">‹</button><b>❤️ ' + L("Ukur nadi", "Measure pulse") + '</b></div><video id="plV" playsinline muted autoplay></video>' +
    '<div class="plsBody"><div class="plsRing"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="plsB"/><circle cx="60" cy="60" r="52" class="plsF" id="plF" stroke-dasharray="0 327"/></svg><div><b id="plN">--</b><small>BPM</small></div></div>' +
    '<canvas id="plW" class="plsW" width="600" height="120"></canvas><div class="plsMsg" id="plM">' + L("Tutup kamera belakang dan lampu dengan hujung jari. Jangan tekan kuat; duduk diam.", "Cover the back camera and the light with a fingertip. Press lightly; sit still.") + '</div>' +
    '<button class="btn gold full" id="plGo">▶ ' + L("Mula 30 saat", "Start 30 seconds") + '</button>' +
    '<div class="mut tiny plsNote">' + L("Anggaran kesihatan umum sahaja, bukan alat perubatan. Jika anda rasa tidak sihat, jumpa doktor.", "A general wellness estimate only, not a medical device. If you feel unwell, see a doctor.") + '</div></div>';
  var V = ov.querySelector("#plV"), M = ov.querySelector("#plM"), W = ov.querySelector("#plW"), wg = W.getContext("2d");
  var stop = function(){ cancelAnimationFrame(raf); if(track){ try{ track.applyConstraints({advanced: [{torch: false}]}).catch(function(){}); }catch(e){} } if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream = null; } track = null; };
  var close = function(){ if(closed) return; closed = true; stop(); H.off("pause", stop); H.closeOverlay(); };
  ov._close = close; ov.querySelector("#plX").onclick = close; H.on("pause", stop);
  var draw = function(){ var n = S.length; wg.clearRect(0, 0, 600, 120); if(n < 2) return; var a = S.slice(-150), mn = Infinity, mx = -Infinity; a.forEach(function(s){ mn = Math.min(mn, s.v); mx = Math.max(mx, s.v); }); var r = (mx - mn) || 1;
    wg.strokeStyle = "#e0605a"; wg.lineWidth = 3; wg.beginPath(); a.forEach(function(s, i){ var x = i * 4, y = 110 - (s.v - mn) / r * 100; if(i) wg.lineTo(x, y); else wg.moveTo(x, y); }); wg.stroke(); };
  var frame = function(){ if(closed || !stream) return; if(V.videoWidth){ g.drawImage(V, 0, 0, 40, 30); var d = g.getImageData(0, 0, 40, 30).data, r = 0, gr = 0; for(var i = 0; i < d.length; i += 4){ r += d[i]; gr += d[i + 1]; } r /= d.length / 4; gr /= d.length / 4;
      var covered = r > 120 && r > gr * 1.6, now = performance.now(), el = now - t0;
      if(!covered){ M.textContent = L("Letak jari menutupi kamera dan lampu…", "Put your finger over the camera and light…"); S = []; t0 = now; }
      else { S.push({t: now, v: r}); draw(); var p = Math.min(1, el / DUR); ov.querySelector("#plF").setAttribute("stroke-dasharray", (p * 327).toFixed(1) + " 327"); if(el > 8000){ var e = bpm(S.slice(-Math.round(S.length * 0.6))); if(e.bpm) ov.querySelector("#plN").textContent = e.bpm; } M.textContent = L("Mengukur… ", "Measuring… ") + Math.max(0, Math.ceil((DUR - el) / 1000)) + " s";
        if(el >= DUR){ var res = bpm(S.slice(Math.round(S.length * 0.15))); stop(); if(res.bpm && res.q >= 0.5){ ov.querySelector("#plN").textContent = res.bpm; M.innerHTML = "✓ " + L("Nadi anggaran: ", "Estimated pulse: ") + "<b>" + res.bpm + " BPM</b>"; try{ H.N.vibrate(80); }catch(x){} ov.querySelector("#plGo").textContent = "💾 " + L("Simpan sebagai nadi rehat", "Save as resting pulse"); ov.querySelector("#plGo").onclick = function(){ if(onResult) onResult(res.bpm); close(); }; }
          else { M.textContent = L("Bacaan tidak stabil. Duduk diam, tekan lebih perlahan dan cuba lagi.", "The reading was unsteady. Sit still, press more lightly and try again."); ov.querySelector("#plGo").textContent = "↻ " + L("Cuba lagi", "Try again"); ov.querySelector("#plGo").onclick = start; } return; } } }
    raf = requestAnimationFrame(frame); };
  var start = function(){ S = []; t0 = performance.now(); ov.querySelector("#plN").textContent = "--"; ov.querySelector("#plGo").textContent = "⏳ " + L("Menyediakan kamera…", "Starting the camera…");
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ M.textContent = L("Kamera tidak tersedia", "Camera not available"); return; }
    navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: "environment"}, width: {ideal: 320}, height: {ideal: 240}, frameRate: {ideal: 30}}, audio: false}).then(function(s){ if(closed){ s.getTracks().forEach(function(t){ t.stop(); }); return; }
      stream = s; V.srcObject = s; var p = V.play(); if(p && p.catch) p.catch(function(){}); track = s.getVideoTracks()[0];
      try{ track.applyConstraints({advanced: [{torch: true}]}).catch(function(){ M.textContent = L("Lampu tidak dapat dinyalakan; guna cahaya terang di belakang jari.", "The light would not turn on; hold your finger against a bright light."); }); }catch(e){}
      ov.querySelector("#plGo").textContent = "⏹ " + L("Henti", "Stop"); ov.querySelector("#plGo").onclick = function(){ stop(); ov.querySelector("#plGo").textContent = "▶ " + L("Mula 30 saat", "Start 30 seconds"); ov.querySelector("#plGo").onclick = go; }; frame(); },
      function(){ M.textContent = L("Kamera tidak dapat dibuka", "The camera could not open"); }); };
  var go = function(){ var N = H.N; if(window.Native && N && N.hasPerm && !N.hasPerm("camera")){ var hp = function(p){ if(p.which !== "camera") return; H.off("perm", hp); if(p.granted) start(); }; H.on("perm", hp); N.requestPerm("camera"); return; } start(); };
  ov.querySelector("#plGo").onclick = go; }
window.IbPulse = {open: open, bpm: bpm};
})();
