// Content script - runs on zefame.com pages
(function() {
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillAndSubmit') {
      fillAndSubmit(message.instaUrl)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep channel open for async response
    }
  });

  async function fillAndSubmit(instaUrl) {
    return new Promise((resolve, reject) => {
      // Wait for page to be fully loaded
      const maxWaitTime = 15000;
      const startTime = Date.now();

      function attemptFill() {
        // Find the input field - zefame uses various selectors
        const inputSelectors = [
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

        let inputField = null;
        for (const selector of inputSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            if (el.offsetParent !== null && !el.disabled) { // visible and enabled
              inputField = el;
              break;
            }
          }
          if (inputField) break;
        }

        if (!inputField) {
          if (Date.now() - startTime < maxWaitTime) {
            setTimeout(attemptFill, 500);
            return;
          }
          reject(new Error('Input field not found'));
          return;
        }

        // Fill the input field
        inputField.focus();
        inputField.value = instaUrl;
        
        // Trigger input events for React/Vue apps
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        inputField.dispatchEvent(new Event('change', { bubbles: true }));
        inputField.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

        // Wait a moment then find and click the button
        setTimeout(() => {
          findAndClickButton(resolve, reject, startTime, maxWaitTime);
        }, 1000);
      }

      function findAndClickButton(resolve, reject, startTime, maxWaitTime) {
        // Find the submit button
        const buttonSelectors = [
          'button:contains("Get")',
          'button:contains("get")',
          'button:contains("Now")',
          'button:contains("Submit")',
          'button:contains("Start")',
          'input[type="submit"]',
          'button[type="submit"]',
          '.btn-primary',
          '.btn-success',
          'button.btn'
        ];

        let submitButton = null;
        
        // Custom contains selector since CSS doesn't support :contains
        const allButtons = document.querySelectorAll('button, input[type="submit"]');
        for (const btn of allButtons) {
          const text = btn.textContent.toLowerCase() || btn.value?.toLowerCase() || '';
          if ((text.includes('get') || text.includes('now') || text.includes('submit') || text.includes('start')) 
              && btn.offsetParent !== null && !btn.disabled) {
            submitButton = btn;
            break;
          }
        }

        // If not found by text, try by selectors
        if (!submitButton) {
          for (const selector of buttonSelectors) {
            if (selector.includes(':contains')) continue;
            const btn = document.querySelector(selector);
            if (btn && btn.offsetParent !== null && !btn.disabled) {
              submitButton = btn;
              break;
            }
          }
        }

        if (!submitButton) {
          if (Date.now() - startTime < maxWaitTime) {
            setTimeout(() => findAndClickButton(resolve, reject, startTime, maxWaitTime), 500);
            return;
          }
          reject(new Error('Submit button not found'));
          return;
        }

        // Click the button
        submitButton.click();
        
        // Wait for the process to complete (check for success message or loading)
        setTimeout(() => {
          resolve({ success: true });
        }, 3000);
      }

      attemptFill();
    });
  }
})();
