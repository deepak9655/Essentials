# Essentials — Ultimate All Tools

**64 beautifully crafted A–Z utilities in one app**, wrapped in a premium iOS-inspired interface — frosted glass cards, squircle gradient icons, live widgets, spring animations, and true dark mode. Star your favourites, find anything instantly, and run everything 100% on-device.

## ✨ Highlights

- 🎨 **Premium iOS UI** — translucent glass, widget row with live clock, squircle icons, sheet modals, haptic-style interactions
- ⭐ **Favourites & Recents** — star any tool to pin it, and jump back into recently used tools instantly
- 🌗 **Light & dark mode** — automatic system preference + manual toggle
- 🔍 **Instant search** — press `/`; browse by category or the A–Z index
- 📱 **Installable** — PWA (Add to Home Screen) **and** a full native Android project
- 🔒 **Private by design** — no accounts, no tracking, no server. Notes, expenses & settings stay in your browser
- ⚡ **Zero build step for the web app** — plain HTML/CSS/JS with one vendored MIT QR library

## 🧰 The Toolkit (64 tools)

### Math & Converters (16)
Calculator (scientific) · Unit Converter · Currency · Percentage · Tip & Split · Discount · Loan & EMI · Base Converter · BMI · Age · GCD & LCM · Quadratic Solver · Statistics · Primes · Roman Numerals · Geometry

### Text & Dev (14)
Word Counter · Case Converter · JSON Formatter · Base64 · URL Encode · Lorem Ipsum · Markdown Preview · Regex Tester · Hash (SHA-1/256/384/512) · Keycode · Text Compare · Slugify · HTML Formatter · Character Info · Speech (TTS & dictation)

### Generate (10)
Password · QR Code (SVG + PNG) · UUID · Random Numbers · Dice & Coin · Gradient · Color Palette · PIN Generator · Random Picker · Tone Generator

### Time & Focus (7)
Stopwatch · Timer · Pomodoro · World Clock · Unix Time · Sleep Calculator · Metronome (with tap tempo)

### Notes & Lists (4)
Notes · Checklist · Drawing Pad · Expense Tracker

### Device & Sensors (12)
Flashlight (SOS strobe) · Compass · Leveler · Vibration · Battery · Sound Meter · Pulse BPM · Device Info · Ruler · Magnifier (camera zoom + torch) · Motion Detector · Network Info

## 📱 Two ways to run on Android

### 1. PWA — instant install
Serve the app over any host (or `localhost`), open in Chrome on Android → **Menu → Add to Home screen**. It installs with the Essentials launcher icon, splash screen, and full offline support (service worker).

```bash
python3 -m http.server 3000
```

### 2. Native Android app (Capacitor project included)
The repo contains a ready-to-build Android Studio project in `android/` (package `com.deepak.essentials`) with branded launcher icons and theme colors.

```bash
npm install          # one-time: installs Capacitor
npm run sync         # copies web assets into the Android project
npx cap open android # open in Android Studio → Build APK
```

Then in Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)**. Requires Android SDK (Android Studio handles the rest).

## 🖥 Run on the web

```bash
python3 -m http.server 3000   # or: npx serve .
```

Open `http://localhost:3000`. No install, no build.

## ⭐ Favourites & organizing

- Tap the **★ star** on any tile to pin it to the **Favourites** section and the **★ Favourites** chip
- The **Recently Used** strip appears under the widgets for one-tap access to your last 10 tools
- The **A–Z** chip flips the whole library into an alphabetical index with sticky letter headers
- Everything persists in `localStorage` — favourites, recents, notes, checklist, expenses

## 📱 Sensor notes

Device tools use progressive enhancement — on hardware without a sensor (or with permission denied), each tool explains what happened instead of failing silently:

- **Compass / Leveler** need `DeviceOrientation` (most phones; iOS prompts for motion permission)
- **Magnifier / Motion Detector** need camera access
- **Vibration** uses the Vibration API (Android/Chrome; not available on iOS Safari or desktops)
- **Battery** uses the Battery Status API (Chrome/Edge)
- **Sound Meter / Tone / Metronome** use the microphone / WebAudio
- **Ruler** needs a quick on-screen calibration against a real ruler

## 🗂 Structure

```
index.html              App shell (widgets, search, chips, sheets)
manifest.webmanifest    PWA manifest
sw.js                   Service worker (offline cache)
css/style.css           iOS-inspired design system
js/app.js               Registry, favourites, recents, search, sheets, theme
js/util.js              Shared helpers
js/tools/*.js           9 tool modules (64 tools)
js/vendor/qrcode.mjs    Vendored QR library (MIT, Kazuhiko Arase)
assets/                 App icons (PWA + Apple touch)
android/                Native Android project (Capacitor)
scripts/sync-web.mjs    Web → www/ sync for Capacitor
```

## 📄 License

App code: MIT. Vendored `qrcode.mjs`: MIT (Kazuhiko Arase).
