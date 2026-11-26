# Astra VPet 2.0 — Little lives

An offline Three.js pet module with three original procedural characters and their own miniature homes. The supplied version 1.0 ZIP is left unchanged.

## Open it

Open `demo.html` directly in Chrome, Edge or Safari, or serve this folder with any static web server. No build, account, CDN, model download or internet connection is needed. The demo saves each species separately on the device. If browser storage is unavailable, it keeps the current session in memory.

The cat has a sculpted face, softly layered fur, articulated paws and a **continuous tapered tail**. The bird has a continuous pear-shaped body, curved overlapping feathers, articulated wings and a crest. The fish has a continuous body, raised scale detail, an iridescent material and deforming fan fins with radial rays. Bodies and tails are not assembled from bead chains.

The kitten lives in a sunroom with an arched window, knitted bed, yarn and bowl. The bird has a leafy conservatory, perch, feeding dish, hanging ring and bell. The aquarium has a stone shelter, sand, moving caustics, flexible aquatic leaves and rising bubbles. Lighting uses a local generated reflection environment, filmic tone mapping, soft shadow maps and a day/evening cycle.

## Play

- **Tap the glass:** the pet notices and approaches. **Kiss:** the pet comes closer, reacts and leaves a fading glass-kiss mark.
- **Stroke the pet:** it leans into affection. The Pet button enables brushing even if the stroke starts away from the body. **Hold a place in the home:** the pet follows it with eased acceleration, braking and turns.
- **Move button:** reveal the touch thumbstick. Arrow keys and WASD also work while movement is enabled. Feeding and other care commands hand control back to the pet.
- **Feed:** choose a species-appropriate food, tap Bismillah / Serve, and the pet travels to its feeding position. Fullness improves on arrival.
- **Play:** the kitten chases rolling yarn and pounces; the bird visits its bell and flutters; the fish chases bubbles. **Surprise** triggers a small species-specific trick.
- **Bath:** bubbles and improved cleanliness. **Sleep / Wake:** travel to a resting position, close the eyes, recover energy and wake again.
- **Style:** name, coat/accent/eye colors, four patterns, accessories and curious/playful/dreamy personality. **Camera:** save the rendered world as a PNG.

Autonomous routines mix breathing, blinks, head tilts, tail/fin motion, preening/grooming, stretches, yawns, sneezes, rolls, hops, swims and short journeys. Hunger, energy, cleanliness and mood influence what the pet does next. Neglected pets become sleepy or ask for attention; they never die. This is a procedural utility/state system, with personality-weighted idle choices, rather than generative AI.

## Drop-in integration

Load Three.js r159 once, then `vpet.js`. The bundled `three.min.js` is the original supplied library; the module uses `window.THREE` and does not load another copy.

```html
<div id="pet" style="position:relative;width:100%;height:600px"></div>
<script src="three.min.js"></script>
<script src="vpet.js"></script>
<script>
var saved = {sp: 'cat'};
var controller = VPet.mount(document.getElementById('pet'), {
  state: saved,
  save: function (state) { /* host persistence */ },
  T: function (ms, en) { return en; },
  vib: function (ms) { /* optional haptic */ },
  lowfx: false,
  compact: false,
  base: './',
  onEvent: function (name, data) { /* optional */ }
});
</script>
```

The existing interface is preserved:

```js
VPet.version;                  // "2.0.0"
VPet.species;                  // ["cat", "bird", "fish"]
controller.state();            // live host-owned state
controller.act('feed');        // feed, play, pet, bath, sleep, wake, custom
controller.stop();             // idempotent save, dispose and remove
```

Additional commands are `kiss`, `poke`, `surprise`. Additional helpers are `controller.photo()` and `controller.diagnostics()`. An optional `onPhoto(dataURL, state)` mount callback lets a native host save photos; otherwise the module uses a browser PNG download. The native host must implement its own file-save bridge if WebView download links are unsupported.

Events: the existing `feed`, `play`, `pet`, `bath`, `sleep`, `wake`, `levelup` (`data.level`) are preserved. Kisses emit `pet` with `interaction: "kiss"`; photo capture emits `photo`.

The optional saved `night` key is `day`, `night` or `auto` (missing also follows the clock). Personality is saved as `curious`, `playful` or `dreamy`. Existing `sp`, `n`, `born`, `t`, `xp`, `sleeping`, `mute`, `s` and `look` keys remain. Unknown species and invalid colors/stats fall back safely. An old version 1.0 save loads without conversion.

Fullness, joy, energy and cleanliness decay in real time with the supplied version's rates, including up to 24 hours of offline catch-up. Sleeping restores energy. Stats have a floor of 5. State is settled before saving, on care actions, about every 15 seconds, on hiding, and on stop. XP increases the level through care. Character growth stages and unlocked inventories are **not** implemented; `born` is retained for compatibility.

The module fills only its relative-positioned host, uses `.vp2`-scoped styles, watches resize/removal, pauses rendering when the document is hidden and releases its WebGL context on stop. Multiple hosts can coexist. It caps idle/sleep rendering at 30 fps and active rendering at 60 fps. `lowfx` disables shadow maps and antialiasing, uses pixel ratio 1, fewer fur layers, lower mesh detail and fewer particles, with a 30 fps cap. Reduced-motion preference suppresses most particle feedback.

## Source and rebuild

`src/cat.js`, `src/bird-fish.js`, `src/habitat.js` and `src/entry.js` are the editable sources. `node build.mjs` concatenates them to the classic-script `vpet.js`. No npm packages are required. The shaders and all textures are generated locally. These are procedural rigs and materials, not imported hand-authored glTF skeletons or cinematic assets.

The fur approach is inspired by Jérémie Piellard's [fur-threejs](https://github.com/piellardj/fur-threejs), which describes the shells-and-fins technique. This package implements its own Three.js material patches and geometry; it does not copy the reference project's implementation or assets. The kitten uses shell layers with a smooth-face mask. Feather layering and scale/fin shaders are separate original implementations.

## Verification and limits

See `QA.md` for the measured checks. Real Chromium/software-WebGL rendering was checked at desktop, tablet and phone widths. The scripted behavior, legacy-state, resource cleanup and localization scenarios passed. Runtime activity requested only the three local HTML/JS files and made no external network requests.

Desktop screenshots establish appearance in that browser. They do **not** establish sustained frame rates on Snapdragon hardware, Android System WebView 90, iOS WKWebView 15, or physical touch delivery. The frame caps are targets, not measured mobile performance claims. The shaders require functioning WebGL; an unavailable context shows an inline fallback. Navigation is bounded steering; there is no collision physics or obstacle pathfinding. Audio is a short optional synthesized pet sound, without music.

The work is a polished procedural browser implementation and integration candidate. Console-platform AAA production quality, native app integration and hardware certification are not claimed.
