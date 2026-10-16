# Essentials — Ultimate All Tools

**39 beautifully crafted A–Z utilities in one app**, wrapped in a premium iOS-inspired interface — frosted glass cards, squircle gradient icons, spring animations, and true dark mode. Everything runs 100% on-device and works offline.

## ✨ Highlights

- 🎨 **Premium iOS UI** — translucent glass, SF-style typography, smooth sheet modals, haptic-style interactions
- 🌗 **Light & dark mode** — with automatic system preference detection
- 🔍 **Instant search** — press `/` to find any tool; browse by category or the A–Z index
- 🔒 **Private by design** — no accounts, no tracking, no server. Notes and settings stay in your browser
- ⚡ **Zero dependencies, zero build step** — plain HTML/CSS/JS with one vendored MIT QR library

## 🧰 The Toolkit (39 tools)

### Math & Converters
| Tool | What it does |
|---|---|
| Calculator | Standard + scientific (trig, logs, roots, powers, π, e) |
| Unit Converter | Length, mass, temperature, area, volume, speed, time, data |
| Currency | Quick FX across 20 currencies (indicative rates) |
| Percentage | % of, X is % of Y, % change |
| Tip & Split | Bill, tip presets, per-person split |
| Discount | Sale price & savings |
| Loan & EMI | Monthly payment, total interest, amortization totals |
| Base Converter | Binary / octal / decimal / hex, live-linked |
| BMI | Metric & imperial with visual scale |
| Age | Years/months/days, next birthday, day of week |

### Text & Dev
| Tool | What it does |
|---|---|
| Word Counter | Words, characters, lines, sentences, reading & speak time |
| Case Converter | UPPER, Title, camelCase, snake_case, kebab, CONSTANT & more |
| JSON Formatter | Format, minify, validate with error hints |
| Base64 | Encode & decode (UTF-8 safe) |
| URL Encode | Percent-encode & decode |
| Lorem Ipsum | Placeholder paragraphs |
| Markdown | Split-pane live preview editor |
| Regex Tester | Live highlighting, match list, flags |
| Hash | SHA-1 / 256 / 384 / 512 via WebCrypto |
| Keycode | Keyboard event inspector (key, code, keyCode, modifiers) |

### Generate
| Tool | What it does |
|---|---|
| Password | Crypto-strong passwords with entropy meter & options |
| QR Code | Any text/URL/Wi-Fi card → SVG QR + PNG download |
| UUID | Bulk RFC 4122 v4 identifiers |
| Random | Range, count, unique-only, lottery draws |
| Dice & Coin | N-sided dice rolls & coin flips |
| Gradient | CSS gradient builder with live preview |

### Time & Focus
| Tool | What it does |
|---|---|
| Stopwatch | High-precision laps with best/worst highlighting |
| Timer | Countdown ring, quick presets, audio alert |
| Pomodoro | Focus/break cycles with session tracking |
| World Clock | Live times across 11 global cities |

### Notes & Lists
| Tool | What it does |
|---|---|
| Notes | Color-coded notes with search (saved locally) |
| Checklist | Tasks with progress bar (saved locally) |

### Device & Sensors
| Tool | What it does |
|---|---|
| Flashlight | Full-screen torch with dimmer + SOS strobe |
| Compass | Live heading via device orientation sensors |
| Leveler | Bubble level with calibration |
| Vibration | Haptic motor pattern tester |
| Battery | Live charge ring & power status |
| Sound Meter | Ambient noise meter via microphone |
| Pulse BPM | Heart rate by tapping with each beat |

## 🚀 Run it

Any static file server works:

```bash
# Python
python3 -m http.server 3000

# or Node
npx serve .
```

Then open `http://localhost:3000`. No install, no build.

## 📱 Sensor notes

Device tools use progressive enhancement — on hardware without a sensor (or with permission denied), each tool explains what happened instead of failing silently:

- **Compass / Leveler** need `DeviceOrientation` (most phones; iOS prompts for motion permission)
- **Vibration** uses the Vibration API (Android/Chrome; not available on iOS Safari or desktops)
- **Battery** uses the Battery Status API (Chrome/Edge)
- **Sound Meter** needs microphone access

## 🗂 Structure

```
index.html          App shell
css/style.css       iOS-inspired design system
js/app.js           Registry, search, categories, sheets, theme
js/util.js          Shared helpers
js/tools/*.js       Tool modules (math, text, generate, time, notes, device)
js/vendor/qrcode.mjs  Vendored QR library (MIT, Kazuhiko Arase)
```

## 📄 License

App code: MIT. Vendored `qrcode.mjs`: MIT (Kazuhiko Arase).
