# Instagram Views Booster - Chrome Extension

## 📦 Installation

1. Chrome browser खोलें
2. Address bar में `chrome://extensions/` टाइप करें
3. **Developer mode** ON करें (top right corner)
4. **Load unpacked** button click करें
5. `NewExt` folder select करें

## 🎨 Icons Setup (Required)

Extension को icons की जरूरत है। आप:

### Option 1: Online Icon Generator
1. https://www.favicon-generator.org/ पर जाएं
2. कोई भी Instagram-style image upload करें
3. Generate करें और 16x16, 48x48, 128x128 PNG download करें
4. Files को `icon16.png`, `icon48.png`, `icon128.png` नाम से इस folder में save करें

### Option 2: Simple colored squares
नीचे दिए गए commands PowerShell में run करें (ImageMagick install होना चाहिए):
```powershell
# Or simply use any 16x16, 48x48, 128x128 PNG images
```

### Option 3: Use placeholder
अभी के लिए, किसी भी PNG image को rename करके use कर सकते हैं।

## 🚀 Usage

1. Extension icon पर click करें
2. अपनी **Instagram Reel/Post URL** paste करें
3. **Repeat count** set करें (1-50)
4. **Start Process** click करें

## ⚠️ Important Notes

- आपका Instagram account **PUBLIC** होना चाहिए
- Process के दौरान browser बंद न करें
- हर round के बीच 5-10 minutes का random gap रहता है
- Tab को manually close न करें

## 🔧 Troubleshooting

**Extension load नहीं हो रहा:**
- Icons (PNG files) add करें
- manifest.json check करें

**Site पर form fill नहीं हो रहा:**
- Site का structure change हो सकता है
- Manually try करें पहले

## 📁 Files

```
NewExt/
├── manifest.json      # Extension configuration
├── popup.html         # User interface
├── popup.js           # UI logic
├── content.js         # Website automation
├── background.js      # Timer & tab management
├── icon16.png         # 16x16 icon (add this)
├── icon48.png         # 48x48 icon (add this)
└── icon128.png        # 128x128 icon (add this)
```
