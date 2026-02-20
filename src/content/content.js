/**
 * Content Script
 * Runs on zefame.com pages to automate form filling and submission
 */

(function() {
  'use strict';

  // ============ Configuration ============
  const CONFIG = {
    MAX_WAIT_TIME: 15000,
    RETRY_INTERVAL: 500,
    BUTTON_CLICK_DELAY: 1000,
    SUCCESS_WAIT: 3000
  };

  // Input field selectors (in priority order)
  const INPUT_SELECTORS = [
    'input[placeholder*="Instagram"]',
    'input[placeholder*="instagram"]',
    'input[placeholder*="Paste"]',
    'input[placeholder*="paste"]',
    'input[placeholder*="link"]',
    'input[placeholder*="Link"]',
    'input[type="text"]',
    'input[type="url"]',
    '.form-control',
    '#link',
    'input[name="link"]'
  ];

  // Button keywords to search for
  const BUTTON_KEYWORDS = ['get', 'now', 'submit', 'start'];

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
   * Find visible input field
   */
  function findInputField() {
    for (const selector of INPUT_SELECTORS) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (isElementInteractable(el)) {
          return el;
        }
      }
    }
    return null;
  }

  /**
   * Find submit button
   */
  function findSubmitButton() {
    // First, try to find by text content
    const allButtons = document.querySelectorAll('button, input[type="submit"]');

    for (const btn of allButtons) {
      const text = (btn.textContent || btn.value || '').toLowerCase();
      const hasKeyword = BUTTON_KEYWORDS.some(keyword => text.includes(keyword));

      if (hasKeyword && isElementInteractable(btn)) {
        return btn;
      }
    }

    // Fallback to common selectors
    const fallbackSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      '.btn-primary',
      '.btn-success',
      'button.btn'
    ];

    for (const selector of fallbackSelectors) {
      const btn = document.querySelector(selector);
      if (isElementInteractable(btn)) {
        return btn;
      }
    }

    return null;
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

        // Wait for process to complete
        setTimeout(() => {
          resolve({ success: true });
        }, CONFIG.SUCCESS_WAIT);
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
