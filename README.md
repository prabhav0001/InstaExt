# Instagram Views Booster - Chrome Extension

A professional Chrome extension to automate Instagram views using Zefame.

## 📁 Project Structure

```
NewExt/
├── manifest.json              # Extension configuration
├── popup.html                 # Main popup UI
├── README.md                  # This file
│
├── assets/
│   └── icons/
│       ├── icon16.png         # 16x16 icon
│       ├── icon48.png         # 48x48 icon
│       └── icon128.png        # 128x128 icon
│
└── src/
    ├── background/
    │   └── background.js      # Service worker - handles timing & tabs
    │
    ├── content/
    │   └── content.js         # Content script - runs on zefame.com
    │
    ├── popup/
    │   └── popup.js           # Popup UI logic
    │
    └── styles/
        └── popup.css          # Popup styles (dark theme)
```

## 🚀 Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `NewExt` folder

## ✨ Features

- 🎨 **Dark Theme UI** - Modern, sleek design
- ⏱️ **Live Countdown Timer** - Shows time until next round
- 🔄 **Automated Rounds** - 5-6 minute random gaps
- 💾 **State Persistence** - Survives popup close
- ⚡ **Pro Architecture** - Clean, modular code

## 📝 Usage

1. Click the extension icon
2. Paste your Instagram Reel/Post URL
3. Set repeat count (1-50)
4. Click **Start Process**

## ⚠️ Requirements

- Instagram account must be **PUBLIC**
- Valid Reel/Post URL
- Don't close the browser during process

## 🛠️ Development

### File Responsibilities

| File | Purpose |
|------|---------|
| `background.js` | Timer management, tab control, round execution |
| `content.js` | DOM manipulation on zefame.com |
| `popup.js` | UI interactions, countdown display |
| `popup.css` | All styling with CSS variables |

### Key Constants

```javascript
DELAY: {
  MIN_MINUTES: 5,    // Minimum wait time
  MAX_MINUTES: 6     // Maximum wait time
}
```

## 📄 License

MIT License - Feel free to modify and distribute.

---

Made with ❤️ for Instagram Growth
