/**
 * Popup Script
 * Handles UI interactions and state management for the popup
 */

// DOM Elements
const elements = {
  instaUrlInput: document.getElementById('instaUrl'),
  repeatCountInput: document.getElementById('repeatCount'),
  startBtn: document.getElementById('startBtn'),
  stopBtn: document.getElementById('stopBtn'),
  statusDiv: document.getElementById('status'),
  progressInfo: document.getElementById('progressInfo'),
  timerBox: document.getElementById('timerBox'),
  timerValue: document.getElementById('timerValue'),
  warningBox: document.querySelector('.warning-box')
};

// State
let countdownInterval = null;

// Constants
const CONFIG = {
  MIN_REPEAT: 1,
  MAX_REPEAT: 50,
  INSTAGRAM_URL_PATTERN: /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+\/?/
};

// ============ Utility Functions ============

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Validate Instagram URL
 */
function isValidInstagramUrl(url) {
  return CONFIG.INSTAGRAM_URL_PATTERN.test(url);
}

// ============ UI Functions ============

/**
 * Show error message
 */
function showError(message) {
  elements.statusDiv.className = 'status error';
  elements.statusDiv.textContent = message;
}

/**
 * Show success message
 */
function showSuccess(message) {
  elements.statusDiv.className = 'status running';
  elements.statusDiv.textContent = message;
}

/**
 * Update UI based on running state
 */
function updateUI(isRunning, currentRound = 0, totalRounds = 0) {
  if (isRunning) {
    elements.startBtn.disabled = true;
    elements.stopBtn.style.display = 'block';
    elements.instaUrlInput.disabled = true;
    elements.repeatCountInput.disabled = true;
    elements.statusDiv.className = 'status running';
    elements.statusDiv.textContent = '✅ Process is running...';
    elements.progressInfo.textContent = `Round ${currentRound}/${totalRounds} complete`;

    // Hide warning box to save space
    if (elements.warningBox) {
      elements.warningBox.classList.add('hidden');
    }
  } else {
    elements.startBtn.disabled = false;
    elements.stopBtn.style.display = 'none';
    elements.instaUrlInput.disabled = false;
    elements.repeatCountInput.disabled = false;
    elements.statusDiv.className = 'status';
    elements.statusDiv.style.display = 'none';
    elements.progressInfo.textContent = '';
    stopCountdown();

    // Show warning box
    if (elements.warningBox) {
      elements.warningBox.classList.remove('hidden');
    }
  }
}

// ============ Timer Functions ============

/**
 * Start countdown timer
 */
function startCountdown(nextRunTime) {
  // Clear existing countdown
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  elements.timerBox.classList.add('visible');

  countdownInterval = setInterval(() => {
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((nextRunTime - now) / 1000));

    if (remaining <= 0) {
      elements.timerValue.textContent = 'Starting...';
      clearInterval(countdownInterval);
      countdownInterval = null;

      setTimeout(() => {
        elements.timerBox.classList.remove('visible');
      }, 3000);
    } else {
      elements.timerValue.textContent = formatTime(remaining);
    }
  }, 1000);
}

/**
 * Stop countdown timer
 */
function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  elements.timerBox.classList.remove('visible');
}

// ============ Event Handlers ============

/**
 * Handle start button click
 */
async function handleStart() {
  const instaUrl = elements.instaUrlInput.value.trim();
  const repeatCount = parseInt(elements.repeatCountInput.value);

  // Validation
  if (!instaUrl) {
    showError('❌ Please enter Instagram URL');
    return;
  }

  if (!isValidInstagramUrl(instaUrl)) {
    showError('❌ Invalid Instagram URL format');
    return;
  }

  if (repeatCount < CONFIG.MIN_REPEAT || repeatCount > CONFIG.MAX_REPEAT) {
    showError(`❌ Repeat count must be between ${CONFIG.MIN_REPEAT} and ${CONFIG.MAX_REPEAT}`);
    return;
  }

  // Save state and start
  await chrome.storage.local.set({
    isRunning: true,
    instaUrl: instaUrl,
    currentRound: 0,
    totalRounds: repeatCount
  });

  // Send message to background
  chrome.runtime.sendMessage({
    action: 'startProcess',
    instaUrl: instaUrl,
    repeatCount: repeatCount
  });

  updateUI(true, 0, repeatCount);
}

/**
 * Handle stop button click
 */
async function handleStop() {
  await chrome.storage.local.set({ isRunning: false });
  chrome.runtime.sendMessage({ action: 'stopProcess' });
  updateUI(false);
  elements.statusDiv.className = 'status error';
  elements.statusDiv.textContent = '⏹️ Process stopped by user';
}

/**
 * Handle messages from background
 */
function handleMessage(message, sender, sendResponse) {
  switch (message.action) {
    case 'updateProgress':
      elements.progressInfo.textContent = `Round ${message.currentRound}/${message.totalRounds} complete`;
      if (message.nextRunTime) {
        startCountdown(message.nextRunTime);
      }
      break;

    case 'processComplete':
      updateUI(false);
      stopCountdown();
      showSuccess('🎉 All rounds completed!');
      break;

    case 'processError':
      updateUI(false);
      stopCountdown();
      showError('❌ ' + message.error);
      break;
  }
}

// ============ Initialization ============

/**
 * Initialize popup
 */
async function init() {
  // Attach event listeners
  elements.startBtn.addEventListener('click', handleStart);
  elements.stopBtn.addEventListener('click', handleStop);
  chrome.runtime.onMessage.addListener(handleMessage);

  // Load saved state
  const savedState = await chrome.storage.local.get([
    'isRunning',
    'instaUrl',
    'currentRound',
    'totalRounds',
    'nextRunTime'
  ]);

  if (savedState.isRunning) {
    elements.instaUrlInput.value = savedState.instaUrl || '';
    elements.repeatCountInput.value = savedState.totalRounds || 5;
    updateUI(true, savedState.currentRound, savedState.totalRounds);

    // Start countdown if there's a next run time
    if (savedState.nextRunTime && savedState.currentRound < savedState.totalRounds) {
      startCountdown(savedState.nextRunTime);
    }
  }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
