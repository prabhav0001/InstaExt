/**
 * Content Script
 * Runs on zefame.com pages to automate form filling and submission
 */

(function() {
  'use strict';

  // ============ Blur Page Immediately ============
  const blurOverlay = document.createElement('div');
  blurOverlay.id = 'ext-blur-overlay';
  blurOverlay.innerHTML = `
    <style>
      #ext-blur-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(20px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 18px;
      }
    </style>
    <div>⚙️ Processing... Please wait</div>
  `;
  document.documentElement.appendChild(blurOverlay);

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
