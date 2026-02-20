/**
 * Background Service Worker
 * Handles timing, tab management, and round execution
 */

// ============ Configuration ============
const CONFIG = {
  ZEFAME_URL: 'https://zefame.com/uk/free-instagram-views',
  DELAY: {
    FIXED_MINUTES: 7,
    PAGE_LOAD_WAIT: 2000
  }
};

// ============ State ============
let currentTabId = null;

// Load saved tabId on startup
chrome.storage.local.get(['currentTabId'], (result) => {
  if (result.currentTabId) {
    currentTabId = result.currentTabId;
  }
});

// Listen for tab close - clear currentTabId if our tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === currentTabId) {
    currentTabId = null;
    chrome.storage.local.remove('currentTabId');
  }
});

// ============ Utility Functions ============

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for tab to finish loading
 */
function waitForTabLoad(tabId) {
  return new Promise((resolve) => {
    const checkTab = () => {
      chrome.tabs.get(tabId, (tab) => {
        if (tab && tab.status === 'complete') {
          resolve();
        } else {
          setTimeout(checkTab, 500);
        }
      });
    };
    checkTab();
  });
}

/**
 * Broadcast message to popup (ignore errors if closed)
 */
function broadcastMessage(message) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup might be closed, ignore error
  });
}

// ============ Tab Management ============

/**
 * Open or reuse tab for Zefame (in background - not active)
 */
async function openZefameTab() {
  // Try to reuse existing tab
  if (currentTabId) {
    try {
      const existingTab = await chrome.tabs.get(currentTabId);
      if (existingTab) {
        // Tab exists, navigate to zefame URL (this will reload the page)
        await chrome.tabs.update(currentTabId, {
          url: CONFIG.ZEFAME_URL,
          active: false
        });
        return currentTabId;
      }
    } catch {
      // Tab doesn't exist anymore
      currentTabId = null;
      await chrome.storage.local.remove('currentTabId');
    }
  }

  // Check if zefame tab already exists anywhere (user might have opened it)
  const allTabs = await chrome.tabs.query({ url: '*://zefame.com/*' });
  if (allTabs.length > 0) {
    // Reuse existing zefame tab
    currentTabId = allTabs[0].id;
    await chrome.storage.local.set({ currentTabId: currentTabId });
    await chrome.tabs.update(currentTabId, {
      url: CONFIG.ZEFAME_URL,
      active: false
    });
    return currentTabId;
  }

  // Create new tab only if no existing tab found
  const tab = await chrome.tabs.create({
    url: CONFIG.ZEFAME_URL,
    active: false
  });
  currentTabId = tab.id;
  await chrome.storage.local.set({ currentTabId: tab.id });

  return currentTabId;
}

/**
 * Close current tab
 */
async function closeCurrentTab() {
  if (currentTabId) {
    try {
      await chrome.tabs.remove(currentTabId);
    } catch { }
    currentTabId = null;
    // Clear from storage too
    await chrome.storage.local.remove('currentTabId');
  }
}

// ============ Process Management ============

/**
 * Start the automation process
 */
async function startProcess(instaUrl, repeatCount) {
  // Clear any existing alarms
  await chrome.alarms.clearAll();

  // Start first round immediately
  executeRound(instaUrl, 1, repeatCount);
}

/**
 * Execute a single round
 */
async function executeRound(instaUrl, roundNumber, totalRounds) {
  try {
    // Update storage
    await chrome.storage.local.set({
      currentRound: roundNumber - 1,
      isRunning: true
    });

    // Open Zefame tab
    const tabId = await openZefameTab();

    // Wait for page to load
    await waitForTabLoad(tabId);
    await sleep(CONFIG.DELAY.PAGE_LOAD_WAIT);

    // Send message to content script
    const response = await chrome.tabs.sendMessage(tabId, {
      action: 'fillAndSubmit',
      instaUrl: instaUrl
    });

    if (response && response.success) {
      // Round completed successfully
      await chrome.storage.local.set({ currentRound: roundNumber });

      // Broadcast progress
      broadcastMessage({
        action: 'updateProgress',
        currentRound: roundNumber,
        totalRounds: totalRounds
      });

      if (roundNumber < totalRounds) {
        // Schedule next round
        const delayMinutes = CONFIG.DELAY.FIXED_MINUTES;
        const nextRunTime = Date.now() + (delayMinutes * 60 * 1000);

        await chrome.storage.local.set({ nextRunTime: nextRunTime });

        broadcastMessage({
          action: 'updateProgress',
          currentRound: roundNumber,
          totalRounds: totalRounds,
          nextRunTime: nextRunTime
        });

        chrome.alarms.create('nextRound', { delayInMinutes: delayMinutes });
      } else {
        // All rounds completed
        await chrome.storage.local.set({ isRunning: false });
        broadcastMessage({ action: 'processComplete' });
        await closeCurrentTab();
      }
    } else {
      throw new Error(response?.error || 'Unknown error during round execution');
    }
  } catch (error) {
    await chrome.storage.local.set({ isRunning: false });
    broadcastMessage({
      action: 'processError',
      error: error.message
    });
  }
}

/**
 * Stop the automation process
 */
async function stopProcess() {
  await chrome.alarms.clearAll();
  await chrome.storage.local.set({ isRunning: false });
  await closeCurrentTab();
}

// ============ Event Listeners ============

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startProcess':
      startProcess(message.instaUrl, message.repeatCount);
      break;
    case 'stopProcess':
      stopProcess();
      break;
  }
});

// Listen for alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'nextRound') {
    const state = await chrome.storage.local.get([
      'isRunning',
      'instaUrl',
      'currentRound',
      'totalRounds'
    ]);

    if (state.isRunning && state.currentRound < state.totalRounds) {
      executeRound(state.instaUrl, state.currentRound + 1, state.totalRounds);
    }
  }
});

// Handle tab close
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === currentTabId) {
    currentTabId = null;
    // Don't stop process, next round will create new tab
  }
});
