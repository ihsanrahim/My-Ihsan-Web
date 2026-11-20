/* My Ihsan 0.5.51: true only in the Google Play build (build.sh / build_aab.sh write it). The Play build hides Care's medical parts
   (medicines, vital signs, appointments, emergency card, health fields) because declaring medical features needs an organization
   account on Play. Dev/test APKs (build_dev.sh) keep everything. Tests may set window.IHSAN_PLAY before this runs. */
window.IHSAN_PLAY = window.IHSAN_PLAY || false;
