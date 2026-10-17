# Essentials — Ultimate All Tools

**43 native Android tools** in one **pure Kotlin + Jetpack Compose** app with **Material You** (dynamic wallpaper colors) and a true **AMOLED pure-black theme**. Plus a 64-tool web/PWA edition in the same repo.

> This is a **real native Android app** — no WebView, no wrapper. Every tool is Kotlin + Compose with direct access to Android hardware APIs (Camera2 torch, sensors, MediaRecorder, BatteryManager, LocationManager, Vibrator).

## 📱 The Native Android App (Kotlin / Compose)

### Design
- **Material You** — dynamic color schemes generated from the device wallpaper (Android 12+), with a hand-tuned brand fallback (indigo/blue) on older devices
- **AMOLED black** — optional pure `#000000` theme that kills every pixel on OLED screens
- **Material 3 everywhere** — tonal cards, FilterChips, sliders, switches, top app bars
- Light / Dark / System theme modes, all persistent

### Tools (43)
**Math & Converters (12):** Calculator · Unit Converter · Percentage · Tip & Split · Discount · BMI · Age · Base Converter · Loan & EMI · GCD & LCM · Statistics · Roman Numerals

**Generate (8):** Password (entropy meter) · PIN · UUID · Random Number · Dice & Coin · Picker · Gradient · Palette

**Text & Dev (5):** Word Counter · Case Converter · Base64 · Lorem Ipsum · Morse Code

**Time & Focus (7):** Stopwatch · Timer · Pomodoro · World Clock · Unix Time · Sleep · Metronome

**Device & Sensors (8):** Flashlight (real Camera2 LED torch) · Vibration · Battery · Device Info · Compass · Bubble Level · Sound Meter · GPS Speed

**Notes & Lists (3):** Notes · Checklist · Credit Card (Luhn) validator

### Native hardware access
Camera2 torch · accelerometer + magnetometer rotation matrix (compass/level) · MediaRecorder mic amplitude · BatteryManager broadcasts · LocationManager GPS speed · Vibrator/VibratorManager waveforms · android.os.Build specs

## 🚀 Build it

```bash
cd android
./gradlew assembleDebug
# APK at android/app/build/outputs/apk/debug/app-debug.apk
```

Or open `android/` in Android Studio and press Run. Min SDK 26, target SDK 34.

## 🤖 CI: APK on every push

`.github/workflows/android.yml` builds the native APK on every push/PR:
- Uploads the APK as a workflow artifact
- On `v*` tags: publishes a **GitHub Release** with the APK and mirrors it to the `dist` branch

## 🌐 Web / PWA edition (64 tools)

The repo root is also a static, offline-first **PWA** with an iOS-inspired design and 64 tools (adds QR codes, JSON/regex/HTML tooling, expense tracker, drawing pad, magnifier, motion detector and more). Serve the root folder:

```bash
python3 -m http.server 3000
```

## 🗂 Structure

```
android/                 Native Kotlin + Compose app (the main event)
  app/src/main/java/com/deepak/essentials/
    MainActivity.kt      Home, search, favourites, Material You settings
    ui/theme/Theme.kt    M3 color schemes, dynamic color, AMOLED black
    ui/Components.kt     Shared Material 3 building blocks
    tools/*.kt           43 tool screens (math, gen, text, time, device, notes)
index.html …             Web PWA (64 tools)
.github/workflows/       APK build & release pipeline
```

## 📄 License

MIT.
