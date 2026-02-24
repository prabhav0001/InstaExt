# Copilot Instructions — InstaExt

## Architecture Overview

Chrome Extension (Manifest V3) that automates Instagram view boosting via [zefame.com](https://zefame.com). Three runtime contexts communicate through `chrome.runtime.sendMessage` and `chrome.storage.local`:

```
popup.js  ──message──►  background.js (service worker)  ──message──►  content.js (zefame.com)
   │                          │                                              │
   └──── chrome.storage.local (shared state: isRunning, currentRound, etc.) ─┘
```

- **`src/background/background.js`** — Service worker orchestrating the process: manages `chrome.alarms` for timed rounds, controls tab lifecycle (open/reuse/close zefame tabs), and dispatches `fillAndSubmit` messages to the content script.
- **`src/content/content.js`** — IIFE injected on `zefame.com/*`. Fills the Instagram URL input (`#instagram-link`), clicks submit (`#submit-btn`), and checks for errors (`#error-message`). Contains a large commented-out "terminal hacking" UI overlay (~250 lines) — leave it commented.
- **`src/popup/popup.js`** — Popup UI logic. Validates input, persists state to `chrome.storage.local`, sends start/stop messages to background, and runs a countdown timer using `setInterval`.
- **`popup.html`** — Entry point popup, loads `src/styles/popup.css` and `src/popup/popup.js`.

## Key Patterns & Conventions

### State Management
All shared state lives in `chrome.storage.local` with these keys: `isRunning`, `instaUrl`, `currentRound`, `totalRounds`, `nextRunTime`, `currentTabId`. Always update storage before broadcasting messages so the popup can restore state on reopen.

### Messaging Protocol
Messages use `{ action: string, ...payload }` format. Key actions:
- Popup → Background: `startProcess`, `stopProcess`
- Background → Content: `fillAndSubmit`
- Background → Popup: `updateProgress`, `processComplete`, `processError`

Content script listeners must `return true` to keep the message channel open for async responses.

### Configuration Constants
Each file defines its own `CONFIG` object at the top. Key values:
- `background.js`: `DELAY.FIXED_MINUTES: 7` (gap between rounds), `PAGE_LOAD_WAIT: 2000`
- `content.js`: `MAX_WAIT_TIME: 15000`, `RETRY_INTERVAL: 500`, DOM selectors for zefame.com
- `popup.js`: `INSTAGRAM_URL_PATTERN` regex, `MIN_REPEAT: 1`, `MAX_REPEAT: 50`

### CSS Architecture
Dark theme using CSS custom properties in `:root` (`src/styles/popup.css`). Instagram brand gradient colors are stored as `--instagram-*` variables. Popup width is fixed at `380px` via `--popup-width`. Use existing variables rather than hardcoding colors.

### Code Style
- Plain vanilla JavaScript — no build tools, bundlers, or frameworks
- Functions documented with JSDoc-style `/** */` comments
- Code sections separated by `// ============ Section Name ============` banners
- Content script wrapped in an IIFE for isolation
- DOM elements cached in an `elements` object (popup.js)

## Development & Debugging

### Loading the Extension
1. Navigate to `chrome://extensions/`, enable Developer Mode
2. Click "Load unpacked" and select the project root folder
3. After code changes, click the refresh icon on the extension card

### Key Debugging Tips
- **Service worker (background.js)**: Inspect via "Service worker" link on `chrome://extensions`. It can go idle — use `chrome.alarms` (not `setTimeout`) for delays > 30s.
- **Content script (content.js)**: Inspect via DevTools on any `zefame.com` tab. Only runs on `https://zefame.com/*` per manifest.
- **Popup**: Right-click extension icon → "Inspect popup". Closing the popup kills its JS context; state must be persisted to `chrome.storage.local`.

### No Build Step
Edit files directly and reload the extension. No `npm`, no transpilation, no bundling.

## Important Constraints

- Host permissions are scoped to `https://zefame.com/*` only — adding new domains requires updating `host_permissions` in `manifest.json`
- The content script's DOM selectors (`#instagram-link`, `#submit-btn`, `#error-message`) are specific to zefame.com's current HTML structure — if the site changes, these break
- `chrome.alarms` minimum interval is 1 minute in production; the 7-minute round gap and 1.5-minute final wait are both alarm-based
- Tab reuse logic (`openZefameTab`) checks for existing zefame tabs before creating new ones — preserve this to avoid tab proliferation
