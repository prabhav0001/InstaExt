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
  //       0% { top: 0; }
  //       100% { top: 100%; }
  //     }
  //     @keyframes typing {
  //       from { width: 0; }
  //       to { width: 100%; }
  //     }
  //     #ext-blur-overlay {
  //       position: fixed;
  //       top: 0;
  //       left: 0;
  //       width: 100vw;
  //       height: 100vh;
  //       background: #0a0a0a;
  //       z-index: 999999;
  //       font-family: 'Courier New', 'Consolas', monospace;
  //       overflow: hidden;
  //       padding: 20px;
  //       box-sizing: border-box;
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
  //         rgba(0, 255, 0, 0.03) 2px,
  //         rgba(0, 255, 0, 0.03) 4px
  //       );
  //       pointer-events: none;
  //     }
  //     .scanline {
  //       position: absolute;
  //       width: 100%;
  //       height: 4px;
  //       background: rgba(0, 255, 0, 0.1);
  //       animation: scanline 8s linear infinite;
  //       pointer-events: none;
  //     }
  //     .terminal-header {
  //       color: #00ff00;
  //       font-size: 12px;
  //       margin-bottom: 10px;
  //       padding-bottom: 10px;
  //       border-bottom: 1px solid #0f0;
  //       display: flex;
  //       justify-content: space-between;
  //     }
  //     .terminal-body {
  //       height: calc(100vh - 80px);
  //       overflow: hidden;
  //       font-size: 13px;
  //       line-height: 1.6;
  //     }
  //     .line {
  //       color: #00ff00;
  //       margin: 2px 0;
  //       opacity: 0;
  //       animation: fadeIn 0.1s forwards;
  //     }
  //     @keyframes fadeIn {
  //       to { opacity: 1; }
  //     }
  //     .prompt { color: #00ffff; }
  //     .success { color: #00ff00; }
  //     .warning { color: #ffff00; }
  //     .error { color: #ff0000; }
  //     .info { color: #888; }
  //     .highlight { color: #ff00ff; }
  //     .cursor {
  //       display: inline-block;
  //       width: 8px;
  //       height: 14px;
  //       background: #00ff00;
  //       animation: blink 1s infinite;
  //       vertical-align: middle;
  //       margin-left: 2px;
  //     }
  //     .matrix-bg {
  //       position: absolute;
  //       top: 0;
  //       left: 0;
  //       right: 0;
  //       bottom: 0;
  //       opacity: 0.15;
  //       font-size: 12px;
  //       line-height: 1.2;
  //       color: #00ff00;
  //       overflow: hidden;
  //       pointer-events: none;
  //       word-wrap: break-word;
  //       text-shadow: 0 0 5px #00ff00;
  //     }
  //     .progress-line {
  //       color: #00ff00;
  //     }
  //     .progress-bar-terminal {
  //       display: inline-block;
  //       width: 200px;
  //       background: #111;
  //       border: 1px solid #0f0;
  //       height: 12px;
  //       margin-left: 10px;
  //       position: relative;
  //       overflow: hidden;
  //     }
  //     .progress-fill-terminal {
  //       height: 100%;
  //       background: #00ff00;
  //       width: 0%;
  //       animation: fillProgress 3s ease-out forwards;
  //     }
  //     @keyframes fillProgress {
  //       0% { width: 0%; }
  //       100% { width: 100%; }
  //     }
  //   </style>
  //   <div class="scanline"></div>
  //   <div class="matrix-bg" id="matrix-bg"></div>
  //   <div class="terminal-header">
  //     <span>█▀▀ █▄█ █▀ ▀█▀ █▀▀ █▀▄▀█   ▄▀█ █▀▀ ▀█▀ █ █░█ █▀▀</span>
  //     <span id="datetime"></span>
  //   </div>
  //   <div class="terminal-body" id="terminal-body"></div>
  //   <div style="position:absolute;bottom:15px;left:0;right:0;text-align:center;color:#444;font-size:11px;">
  //     Made with <span style="color:#ff0055;">❤</span> by <a href="https://github.com/deepak5310" target="_blank" style="color:#00ffff;text-decoration:none;">Deepak Jangir</a>
  //   </div>
  // `;
  // document.documentElement.appendChild(blurOverlay);

  // // Matrix background effect
  // const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  // let matrixBg = '';
  // for(let i = 0; i < 5000; i++) {
  //   matrixBg += matrixChars[Math.floor(Math.random() * matrixChars.length)];
  // }
  // document.getElementById('matrix-bg').textContent = matrixBg;

  // // Update datetime
  // const updateTime = () => {
  //   const now = new Date();
  //   document.getElementById('datetime').textContent = now.toLocaleString();
  // };
  // updateTime();
  // setInterval(updateTime, 1000);

  // // Terminal lines
  // const terminalLines = [
  //   { delay: 0, class: 'prompt', text: '> Initializing secure connection...' },
  //   { delay: 200, class: 'info', text: '[INFO] Loading encryption modules...' },
  //   { delay: 400, class: 'success', text: '[OK] AES-256 encryption enabled' },
  //   { delay: 600, class: 'success', text: '[OK] SSL/TLS handshake complete' },
  //   { delay: 800, class: 'prompt', text: '> Connecting to target server...' },
  //   { delay: 1000, class: 'info', text: '[INFO] Resolving DNS: zefame.com' },
  //   { delay: 1200, class: 'info', text: '[INFO] IP: 104.21.**.*** (masked)' },
  //   { delay: 1400, class: 'success', text: '[OK] Connection established' },
  //   { delay: 1600, class: 'prompt', text: '> Injecting payload...' },
  //   { delay: 1800, class: 'info', text: '[INFO] Bypassing rate limiter...' },
  //   { delay: 2000, class: 'warning', text: '[WARN] Firewall detected, rerouting...' },
  //   { delay: 2200, class: 'success', text: '[OK] Firewall bypassed via proxy' },
  //   { delay: 2400, class: 'prompt', text: '> Executing automation script...' },
  //   { delay: 2600, class: 'info', text: '[INFO] DOM elements located' },
  //   { delay: 2800, class: 'info', text: '[INFO] Input field: #instagram-link' },
  //   { delay: 3000, class: 'info', text: '[INFO] Submit btn: #submit-btn' },
  //   { delay: 3200, class: 'success', text: '[OK] Form data injected' },
  //   { delay: 3400, class: 'prompt', text: '> Processing request...' },
  //   { delay: 3600, class: 'highlight', text: '████████████████████████████ 100%' },
  //   { delay: 3800, class: 'success', text: '[SUCCESS] Operation in progress' },
  //   { delay: 4000, class: 'info', text: '[INFO] Waiting for server response...' },
  //   { delay: 4200, class: 'prompt typing', text: '> _' },
  // ];

  // const terminalBody = document.getElementById('terminal-body');
  // terminalLines.forEach((line, index) => {
  //   setTimeout(() => {
  //     const div = document.createElement('div');
  //     div.className = 'line ' + line.class;
  //     div.style.animationDelay = '0s';
  //     if (line.class.includes('typing')) {
  //       div.innerHTML = '> <span class="cursor"></span>';
  //     } else {
  //       div.textContent = line.text;
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
