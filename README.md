# My-Ihsan-Web

Live at **https://myihsan.app** (GitHub Pages, custom domain in `CNAME`; DNS at Cloudflare).

- `/` (index.html): the My Ihsan home page (BM/EN). `privacy.html`: privacy policy (the Play Console URL). `delete.html`: how to delete your data.
- `/app/`: **the complete My Ihsan app in the browser** (same files as the Android app, built by `tools/web/build-webapp.sh` in the app repo).
  Sign in with Google (⟳ at the top) to sync with the phone through your own Google Drive (hidden app folder, scope `drive.appdata`).
  Everything a browser can do works (Quran, School, Business with bookings and Google Sheet sync, Finance, Family, Move with the Letters
  camera game, Qibla on phones with a compass, speech, notifications while open). Phone-only features (screen time, rakaat camera counting,
  the Speaker / broadcast audio, GPS tracking with the screen off) are shown grey with "📱 Android app".
  `app/config.js` holds the Google OAuth web client ID (not a secret); the build keeps it.
- `/split/`: shared Split bill page.
