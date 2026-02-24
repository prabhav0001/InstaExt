/**
 * Content Script
 * Runs on zefame.com pages to automate form filling and submission
 */

(function () {
  'use strict';

  // // ============ Terminal Hacking UI ============
  // const blurOverlay = document.createElement('div');
  // blurOverlay.id = 'ext-blur-overlay';
  // blurOverlay.innerHTML = `
  //   <style>
  //     @keyframes blink {
  //       0%, 50% { opacity: 1; }
  //       51%, 100% { opacity: 0; }
  //     }
  //     @keyframes scanline {
  //       0% { top: -10%; }
  //       100% { top: 110%; }
  //     }
  //     @keyframes glitch {
  //       0%, 100% { transform: translate(0); text-shadow: 0 0 8px #00ff00; }
  //       10% { transform: translate(-2px, 1px); text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; }
  //       20% { transform: translate(2px, -1px); text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff; }
  //       30% { transform: translate(0); text-shadow: 0 0 8px #00ff00; }
  //     }
  //     @keyframes borderGlow {
  //       0%, 100% { border-color: rgba(0, 255, 0, 0.3); box-shadow: inset 0 0 30px rgba(0, 255, 0, 0.05), 0 0 15px rgba(0, 255, 0, 0.1); }
  //       50% { border-color: rgba(0, 255, 255, 0.4); box-shadow: inset 0 0 40px rgba(0, 255, 255, 0.08), 0 0 20px rgba(0, 255, 255, 0.15); }
  //     }
  //     @keyframes textGlow {
  //       0%, 100% { text-shadow: 0 0 4px currentColor, 0 0 8px currentColor; }
  //       50% { text-shadow: 0 0 8px currentColor, 0 0 16px currentColor, 0 0 24px currentColor; }
  //     }
  //     @keyframes fadeSlideIn {
  //       from { opacity: 0; transform: translateX(-10px); }
  //       to { opacity: 1; transform: translateX(0); }
  //     }
  //     @keyframes flicker {
  //       0%, 100% { opacity: 0.97; }
  //       50% { opacity: 1; }
  //       25%, 75% { opacity: 0.94; }
  //     }
  //     @keyframes pulseGlow {
  //       0%, 100% { opacity: 0.6; }
  //       50% { opacity: 1; }
  //     }
  //     #ext-blur-overlay {
  //       position: fixed;
  //       top: 0;
  //       left: 0;
  //       width: 100vw;
  //       height: 100vh;
  //       background: rgba(5, 5, 15, 0.85);
  //       backdrop-filter: blur(12px);
  //       -webkit-backdrop-filter: blur(12px);
  //       z-index: 999999;
  //       font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', 'Consolas', monospace;
  //       overflow: hidden;
  //       padding: 0;
  //       box-sizing: border-box;
  //       animation: flicker 4s infinite;
  //     }
  //     #ext-blur-overlay::before {
  //       content: '';
  //       position: absolute;
  //       top: 0;
  //       left: 0;
  //       right: 0;
  //       bottom: 0;
  //       background: repeating-linear-gradient(
  //         0deg,
  //         transparent,
  //         transparent 2px,
  //         rgba(0, 255, 0, 0.015) 2px,
  //         rgba(0, 255, 0, 0.015) 4px
  //       );
  //       pointer-events: none;
  //       z-index: 1;
  //     }
  //     #ext-blur-overlay::after {
  //       content: '';
  //       position: absolute;
  //       top: 0;
  //       left: 0;
  //       right: 0;
  //       bottom: 0;
  //       background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.5) 100%);
  //       pointer-events: none;
  //       z-index: 2;
  //     }
  //     .terminal-window {
  //       position: absolute;
  //       top: 20px;
  //       left: 20px;
  //       right: 20px;
  //       bottom: 20px;
  //       border: 1px solid rgba(0, 255, 0, 0.3);
  //       border-radius: 8px;
  //       background: rgba(0, 0, 0, 0.4);
  //       animation: borderGlow 3s ease-in-out infinite;
  //       display: flex;
  //       flex-direction: column;
  //       overflow: hidden;
  //       z-index: 3;
  //     }
  //     .terminal-titlebar {
  //       display: flex;
  //       align-items: center;
  //       padding: 8px 14px;
  //       background: rgba(0, 0, 0, 0.6);
  //       border-bottom: 1px solid rgba(0, 255, 0, 0.2);
  //       gap: 8px;
  //       flex-shrink: 0;
  //     }
  //     .titlebar-dot {
  //       width: 10px;
  //       height: 10px;
  //       border-radius: 50%;
  //       display: inline-block;
  //     }
  //     .dot-red { background: #ff5f57; box-shadow: 0 0 6px #ff5f57; }
  //     .dot-yellow { background: #ffbd2e; box-shadow: 0 0 6px #ffbd2e; }
  //     .dot-green { background: #28c840; box-shadow: 0 0 6px #28c840; }
  //     .titlebar-text {
  //       flex: 1;
  //       text-align: center;
  //       color: rgba(0, 255, 0, 0.5);
  //       font-size: 11px;
  //       letter-spacing: 1px;
  //     }
  //     .scanline {
  //       position: absolute;
  //       width: 100%;
  //       height: 6px;
  //       background: linear-gradient(180deg, transparent, rgba(0, 255, 255, 0.08), transparent);
  //       animation: scanline 6s linear infinite;
  //       pointer-events: none;
  //       z-index: 10;
  //     }
  //     .terminal-header {
  //       color: #00ff00;
  //       font-size: 11px;
  //       padding: 10px 16px;
  //       border-bottom: 1px solid rgba(0, 255, 0, 0.15);
  //       display: flex;
  //       justify-content: space-between;
  //       align-items: center;
  //       flex-shrink: 0;
  //       text-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
  //     }
  //     .header-title {
  //       animation: glitch 5s infinite;
  //       letter-spacing: 1px;
  //     }
  //     .header-stats {
  //       display: flex;
  //       gap: 16px;
  //       font-size: 10px;
  //       color: rgba(0, 255, 0, 0.6);
  //     }
  //     .stat-item {
  //       display: flex;
  //       align-items: center;
  //       gap: 4px;
  //     }
  //     .stat-dot {
  //       width: 5px;
  //       height: 5px;
  //       border-radius: 50%;
  //       background: #00ff00;
  //       animation: pulseGlow 2s infinite;
  //     }
  //     .stat-dot.orange { background: #ffbd2e; }
  //     .terminal-body {
  //       flex: 1;
  //       overflow: hidden;
  //       font-size: 12px;
  //       line-height: 1.7;
  //       padding: 12px 16px;
  //       position: relative;
  //     }
  //     .line {
  //       color: #00ff00;
  //       margin: 1px 0;
  //       opacity: 0;
  //       animation: fadeSlideIn 0.3s forwards;
  //       white-space: nowrap;
  //       overflow: hidden;
  //       position: relative;
  //       padding-left: 2px;
  //     }
  //     .prompt { color: #00ffff; text-shadow: 0 0 6px rgba(0, 255, 255, 0.4); font-weight: bold; }
  //     .success { color: #00ff88; text-shadow: 0 0 6px rgba(0, 255, 136, 0.3); }
  //     .warning { color: #ffdd00; text-shadow: 0 0 6px rgba(255, 221, 0, 0.3); }
  //     .error { color: #ff4444; text-shadow: 0 0 6px rgba(255, 68, 68, 0.3); }
  //     .info { color: #7a8a99; }
  //     .highlight { color: #ff00ff; text-shadow: 0 0 8px rgba(255, 0, 255, 0.4); animation: fadeSlideIn 0.3s forwards, textGlow 2s ease-in-out infinite; }
  //     .dim { color: #3a4a3a; font-size: 10px; }
  //     .separator { color: rgba(0, 255, 0, 0.2); letter-spacing: 2px; }
  //     .cursor {
  //       display: inline-block;
  //       width: 8px;
  //       height: 14px;
  //       background: #00ff00;
  //       animation: blink 0.8s infinite;
  //       vertical-align: middle;
  //       margin-left: 2px;
  //       box-shadow: 0 0 8px #00ff00;
  //     }
  //     .matrix-canvas {
  //       position: absolute;
  //       top: 0;
  //       left: 0;
  //       width: 100%;
  //       height: 100%;
  //       pointer-events: none;
  //       opacity: 0.12;
  //       z-index: 0;
  //     }
  //     .progress-bar-terminal {
  //       display: inline-block;
  //       width: 200px;
  //       background: rgba(0, 255, 0, 0.1);
  //       border: 1px solid rgba(0, 255, 0, 0.3);
  //       height: 10px;
  //       border-radius: 5px;
  //       margin-left: 10px;
  //       position: relative;
  //       overflow: hidden;
  //     }
  //     .progress-fill-terminal {
  //       height: 100%;
  //       background: linear-gradient(90deg, #00ff00, #00ffff);
  //       border-radius: 5px;
  //       width: 0%;
  //       animation: fillProgress 3s ease-out forwards;
  //       box-shadow: 0 0 10px #00ff00;
  //     }
  //     @keyframes fillProgress {
  //       0% { width: 0%; }
  //       100% { width: 100%; }
  //     }
  //     .footer-bar {
  //       position: absolute;
  //       bottom: 0;
  //       left: 0;
  //       right: 0;
  //       text-align: center;
  //       padding: 8px 10px;
  //       background: rgba(0, 0, 0, 0.7);
  //       border-top: 1px solid rgba(0, 255, 0, 0.15);
  //       flex-shrink: 0;
  //     }
  //     .footer-bar span {
  //       color: rgba(255, 255, 255, 0.4);
  //       font-size: 10px;
  //       letter-spacing: 0.5px;
  //     }
  //     .footer-bar a {
  //       color: #00ffff;
  //       text-decoration: none;
  //       transition: text-shadow 0.3s;
  //     }
  //     .footer-bar a:hover {
  //       text-shadow: 0 0 10px #00ffff;
  //     }
  //   </style>
  //   <canvas class="matrix-canvas" id="matrix-canvas"></canvas>
  //   <div class="terminal-window">
  //     <div class="terminal-titlebar">
  //       <span class="titlebar-dot dot-red"></span>
  //       <span class="titlebar-dot dot-yellow"></span>
  //       <span class="titlebar-dot dot-green"></span>
  //       <span class="titlebar-text">root@instaext — bash — 80×24</span>
  //     </div>
  //     <div class="scanline"></div>
  //     <div class="terminal-header">
  //       <span class="header-title">█▀▀ █▄█ █▀ ▀█▀ █▀▀ █▀▄▀█   ▄▀█ █▀▀ ▀█▀ █ █░█ █▀▀</span>
  //       <div class="header-stats">
  //         <div class="stat-item"><span class="stat-dot"></span><span>SECURE</span></div>
  //         <div class="stat-item"><span class="stat-dot orange"></span><span id="datetime"></span></div>
  //       </div>
  //     </div>
  //     <div class="terminal-body" id="terminal-body"></div>
  //     <div class="footer-bar">
  //       <span>Made with <span style="color:#ff0055;">❤</span> by <a href="https://github.com/deepak5310" target="_blank">Deepak Jangir</a></span>
  //     </div>
  //   </div>
  // `;
  // document.documentElement.appendChild(blurOverlay);

  // // Animated Matrix Rain (Canvas)
  // const canvas = document.getElementById('matrix-canvas');
  // const ctx = canvas.getContext('2d');
  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;
  // const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン<>{}[]|/\\=+-_!@#$%^&*';
  // const fontSize = 13;
  // const columns = Math.floor(canvas.width / fontSize);
  // const drops = Array(columns).fill(1);
  // function drawMatrix() {
  //   ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  //   ctx.fillRect(0, 0, canvas.width, canvas.height);
  //   ctx.fillStyle = '#00ff00';
  //   ctx.font = fontSize + 'px monospace';
  //   for (let i = 0; i < drops.length; i++) {
  //     const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
  //     ctx.fillStyle = Math.random() > 0.95 ? '#ffffff' : (Math.random() > 0.5 ? '#00ff00' : '#00aa44');
  //     ctx.fillText(char, i * fontSize, drops[i] * fontSize);
  //     if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
  //       drops[i] = 0;
  //     }
  //     drops[i]++;
  //   }
  //   requestAnimationFrame(drawMatrix);
  // }
  // drawMatrix();
  // window.addEventListener('resize', () => {
  //   canvas.width = window.innerWidth;
  //   canvas.height = window.innerHeight;
  // });

  // // Update datetime
  // const updateTime = () => {
  //   const now = new Date();
  //   document.getElementById('datetime').textContent = now.toLocaleTimeString();
  // };
  // updateTime();
  // setInterval(updateTime, 1000);

  // // Terminal lines — more cinematic
  // const terminalLines = [
  //   { delay: 0, class: 'dim', text: '$ ssh root@instaext.local -p 2222' },
  //   { delay: 300, class: 'info', text: 'Last login: ' + new Date().toUTCString() + ' from 127.0.0.1' },
  //   { delay: 500, class: 'separator', text: '─────────────────────────────────────────────' },
  //   { delay: 700, class: 'prompt', text: '❯ Initializing secure tunnel...' },
  //   { delay: 900, class: 'info', text: '  ├─ Loading crypto modules ........... done' },
  //   { delay: 1100, class: 'success', text: '  ├─ [✓] AES-256-GCM encryption active' },
  //   { delay: 1300, class: 'success', text: '  └─ [✓] TLS 1.3 handshake complete (ECDHE-RSA)' },
  //   { delay: 1600, class: 'separator', text: '─────────────────────────────────────────────' },
  //   { delay: 1800, class: 'prompt', text: '❯ Establishing connection to target...' },
  //   { delay: 2000, class: 'info', text: '  ├─ DNS resolution: zefame.com → 104.21.**.***' },
  //   { delay: 2200, class: 'dim', text: '  │  traceroute: 3 hops (12ms → 28ms → 41ms)' },
  //   { delay: 2400, class: 'success', text: '  └─ [✓] Tunnel established (latency: 41ms)' },
  //   { delay: 2700, class: 'separator', text: '─────────────────────────────────────────────' },
  //   { delay: 2900, class: 'prompt', text: '❯ Deploying injection payload...' },
  //   { delay: 3100, class: 'warning', text: '  ├─ [!] WAF detected — rerouting via proxy chain' },
  //   { delay: 3300, class: 'dim', text: '  │  0x4A 0x6F 0x62 0x20 0x44 0x6F 0x6E 0x65' },
  //   { delay: 3500, class: 'success', text: '  ├─ [✓] Firewall bypassed (3 proxies)' },
  //   { delay: 3700, class: 'info', text: '  ├─ Locating DOM targets...' },
  //   { delay: 3900, class: 'dim', text: '  │  input  → document.querySelector("#instagram-link")' },
  //   { delay: 4100, class: 'dim', text: '  │  submit → document.querySelector("#submit-btn")' },
  //   { delay: 4300, class: 'success', text: '  └─ [✓] All selectors resolved' },
  //   { delay: 4600, class: 'separator', text: '─────────────────────────────────────────────' },
  //   { delay: 4800, class: 'prompt', text: '❯ Executing automation sequence...' },
  //   { delay: 5000, class: 'success', text: '  ├─ [✓] Form data injected' },
  //   { delay: 5200, class: 'success', text: '  ├─ [✓] Submit triggered' },
  //   { delay: 5400, class: 'highlight', text: '  ██████████████████████████████ 100% COMPLETE' },
  //   { delay: 5700, class: 'success', text: '  └─ [SUCCESS] Payload delivered — awaiting response...' },
  //   { delay: 6000, class: 'prompt typing', text: '❯ _' },
  // ];

  // const terminalBody = document.getElementById('terminal-body');

  // // Typewriter effect for each line
  // function typewriteLine(container, text, speed) {
  //   let i = 0;
  //   function type() {
  //     if (i < text.length) {
  //       container.textContent += text.charAt(i);
  //       i++;
  //       setTimeout(type, speed);
  //     }
  //   }
  //   type();
  // }

  // terminalLines.forEach((line) => {
  //   setTimeout(() => {
  //     const div = document.createElement('div');
  //     div.className = 'line ' + line.class;
  //     div.style.animationDelay = '0s';
  //     if (line.class.includes('typing')) {
  //       div.innerHTML = '❯ <span class="cursor"></span>';
  //     } else {
  //       div.textContent = '';
  //       typewriteLine(div, line.text, 12);
  //     }
  //     terminalBody.appendChild(div);
  //     terminalBody.scrollTop = terminalBody.scrollHeight;
  //   }, line.delay);
  // });

  // ============ Configuration ============
  const CONFIG = {
    MAX_WAIT_TIME: 15000,
    RETRY_INTERVAL: 500,
    BUTTON_CLICK_DELAY: 1000,
    ERROR_CHECK_DELAY: 2000,  // Check for error 2 sec after click
    // Direct selectors for zefame.com
    INPUT_SELECTOR: '#instagram-link',
    BUTTON_SELECTOR: '#submit-btn',
    ERROR_SELECTOR: '#error-message'
  };

  // ============ Helper Functions ============

  /**
   * Check if element is visible and enabled
   */
  function isElementInteractable(element) {
    return element &&
      element.offsetParent !== null &&
      !element.disabled;
  }

  /**
   * Find input field
   */
  function findInputField() {
    const input = document.querySelector(CONFIG.INPUT_SELECTOR);
    return isElementInteractable(input) ? input : null;
  }

  /**
   * Find submit button
   */
  function findSubmitButton() {
    const btn = document.querySelector(CONFIG.BUTTON_SELECTOR);
    return isElementInteractable(btn) ? btn : null;
  }

  /**
   * Fill input field with value and trigger events
   */
  function fillInput(inputField, value) {
    inputField.focus();
    inputField.value = value;

    // Trigger events for React/Vue/Angular apps
    const events = [
      new Event('input', { bubbles: true }),
      new Event('change', { bubbles: true }),
      new KeyboardEvent('keyup', { bubbles: true })
    ];

    events.forEach(event => inputField.dispatchEvent(event));
  }

  // ============ Main Functions ============

  /**
   * Fill form and submit
   */
  async function fillAndSubmit(instaUrl) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      function attemptFill() {
        const inputField = findInputField();

        if (!inputField) {
          if (Date.now() - startTime < CONFIG.MAX_WAIT_TIME) {
            setTimeout(attemptFill, CONFIG.RETRY_INTERVAL);
            return;
          }
          reject(new Error('Input field not found'));
          return;
        }

        // Fill the input
        fillInput(inputField, instaUrl);

        // Wait and click button
        setTimeout(() => {
          attemptClickButton(resolve, reject, startTime);
        }, CONFIG.BUTTON_CLICK_DELAY);
      }

      function attemptClickButton(resolve, reject, startTime) {
        const submitButton = findSubmitButton();

        if (!submitButton) {
          if (Date.now() - startTime < CONFIG.MAX_WAIT_TIME) {
            setTimeout(() => attemptClickButton(resolve, reject, startTime), CONFIG.RETRY_INTERVAL);
            return;
          }
          reject(new Error('Submit button not found'));
          return;
        }

        // Click the button
        submitButton.click();

        // Check for error after 2 seconds
        setTimeout(() => {
          const errorElement = document.querySelector(CONFIG.ERROR_SELECTOR);

          if (errorElement && errorElement.textContent.includes('Please wait')) {
            // Cooldown error found
            reject(new Error(errorElement.textContent.trim()));
          } else {
            // No error = success
            resolve({ success: true });
          }
        }, CONFIG.ERROR_CHECK_DELAY);
      }

      attemptFill();
    });
  }

  // ============ Message Listener ============

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillAndSubmit') {
      fillAndSubmit(message.instaUrl)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));

      return true; // Keep channel open for async response
    }
  });

})();
