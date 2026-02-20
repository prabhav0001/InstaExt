// Background service worker - handles timing and tab management
const ZEFAME_URL = 'https://zefame.com/en/free-instagram-views';

let currentTabId = null;
let processInterval = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startProcess') {
    startProcess(message.instaUrl, message.repeatCount);
  } else if (message.action === 'stopProcess') {
    stopProcess();
  }
});

// Listen for alarm (for repeat timing)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'nextRound') {
    const state = await chrome.storage.local.get(['isRunning', 'instaUrl', 'currentRound', 'totalRounds']);
    if (state.isRunning && state.currentRound < state.totalRounds) {
      executeRound(state.instaUrl, state.currentRound + 1, state.totalRounds);
    }
  }
});

async function startProcess(instaUrl, repeatCount) {
  console.log('Starting process:', instaUrl, repeatCount);

  // Clear any existing alarms
  await chrome.alarms.clearAll();

  // Start first round immediately
  executeRound(instaUrl, 1, repeatCount);
}

async function executeRound(instaUrl, roundNumber, totalRounds) {
  console.log(`Executing round ${roundNumber}/${totalRounds}`);

  try {
    // Update storage
    await chrome.storage.local.set({
      currentRound: roundNumber - 1, // Will update to roundNumber after completion
      isRunning: true
    });

    // Open zefame in a new tab or reuse existing
    if (currentTabId) {
      try {
        await chrome.tabs.get(currentTabId);
        await chrome.tabs.update(currentTabId, { url: ZEFAME_URL, active: true });
      } catch {
        // Tab doesn't exist, create new
        const tab = await chrome.tabs.create({ url: ZEFAME_URL, active: true });
        currentTabId = tab.id;
      }
    } else {
      const tab = await chrome.tabs.create({ url: ZEFAME_URL, active: true });
      currentTabId = tab.id;
    }

    // Wait for page to load, then execute content script
    await waitForTabLoad(currentTabId);

    // Small delay to ensure page is fully ready
    await sleep(3000);

    // Send message to content script to fill and submit
    const response = await chrome.tabs.sendMessage(currentTabId, {
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
        // Schedule next round with random delay (5-6 minutes)
        const delayMinutes = Math.floor(Math.random() * 2) + 5; // 5-6 minutes
        const nextRunTime = Date.now() + (delayMinutes * 60 * 1000);

        // Save next run time to storage
        await chrome.storage.local.set({ nextRunTime: nextRunTime });

        broadcastMessage({
          action: 'updateProgress',
          currentRound: roundNumber,
          totalRounds: totalRounds,
          nextRunTime: nextRunTime
        });

        // Set alarm for next round
        chrome.alarms.create('nextRound', { delayInMinutes: delayMinutes });

        console.log(`Next round in ${delayMinutes} minutes`);
      } else {
        // All rounds completed
        await chrome.storage.local.set({ isRunning: false });
        broadcastMessage({ action: 'processComplete' });

        // Close the tab
        if (currentTabId) {
          try {
            await chrome.tabs.remove(currentTabId);
          } catch {}
          currentTabId = null;
        }
      }
    } else {
      throw new Error(response?.error || 'Unknown error during round execution');
    }
  } catch (error) {
    console.error('Round execution error:', error);
    await chrome.storage.local.set({ isRunning: false });
    broadcastMessage({
      action: 'processError',
      error: error.message
    });
  }
}

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function stopProcess() {
  console.log('Stopping process');

  // Clear all alarms
  await chrome.alarms.clearAll();

  // Update storage
  await chrome.storage.local.set({ isRunning: false });

  // Close the tab if it exists
  if (currentTabId) {
    try {
      await chrome.tabs.remove(currentTabId);
    } catch {}
    currentTabId = null;
  }
}

// Broadcast message to popup (if open)
function broadcastMessage(message) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup might be closed, ignore error
  });
}

// Handle tab close - if user closes the zefame tab during process
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === currentTabId) {
    currentTabId = null;
    // Don't stop the process, just clear the tab reference
    // Next round will create a new tab
  }
});
