document.addEventListener('DOMContentLoaded', async () => {
  const instaUrlInput = document.getElementById('instaUrl');
  const repeatCountInput = document.getElementById('repeatCount');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusDiv = document.getElementById('status');
  const progressInfo = document.getElementById('progressInfo');
  const timerBox = document.getElementById('timerBox');
  const timerValue = document.getElementById('timerValue');

  let countdownInterval = null;

  // Load saved state
  const savedState = await chrome.storage.local.get(['isRunning', 'instaUrl', 'currentRound', 'totalRounds', 'nextRunTime']);

  if (savedState.isRunning) {
    instaUrlInput.value = savedState.instaUrl || '';
    repeatCountInput.value = savedState.totalRounds || 5;
    updateUI(true, savedState.currentRound, savedState.totalRounds);

    // Start countdown if there's a next run time
    if (savedState.nextRunTime && savedState.currentRound < savedState.totalRounds) {
      startCountdown(savedState.nextRunTime);
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function startCountdown(nextRunTime) {
    // Clear any existing countdown
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    timerBox.classList.add('visible');

    countdownInterval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((nextRunTime - now) / 1000));

      if (remaining <= 0) {
        timerValue.textContent = 'Starting...';
        clearInterval(countdownInterval);
        countdownInterval = null;
        setTimeout(() => {
          timerBox.classList.remove('visible');
        }, 3000);
      } else {
        timerValue.textContent = formatTime(remaining);
      }
    }, 1000);
  }

  function stopCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    timerBox.classList.remove('visible');
  }

  function updateUI(isRunning, currentRound = 0, totalRounds = 0) {
    if (isRunning) {
      startBtn.disabled = true;
      stopBtn.style.display = 'block';
      instaUrlInput.disabled = true;
      repeatCountInput.disabled = true;
      statusDiv.className = 'status running';
      statusDiv.textContent = '✅ Process is running...';
      progressInfo.textContent = `Round ${currentRound}/${totalRounds} complete`;
    } else {
      startBtn.disabled = false;
      stopBtn.style.display = 'none';
      instaUrlInput.disabled = false;
      repeatCountInput.disabled = false;
      statusDiv.className = 'status';
      statusDiv.style.display = 'none';
      progressInfo.textContent = '';
      stopCountdown();
    }
  }

  function showError(message) {
    statusDiv.className = 'status error';
    statusDiv.textContent = message;
  }

  function isValidInstagramUrl(url) {
    const pattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+\/?/;
    return pattern.test(url);
  }

  startBtn.addEventListener('click', async () => {
    const instaUrl = instaUrlInput.value.trim();
    const repeatCount = parseInt(repeatCountInput.value);

    // Validation
    if (!instaUrl) {
      showError('❌ Please enter Instagram URL');
      return;
    }

    if (!isValidInstagramUrl(instaUrl)) {
      showError('❌ Invalid Instagram URL format');
      return;
    }

    if (repeatCount < 1 || repeatCount > 50) {
      showError('❌ Repeat count must be between 1 and 50');
      return;
    }

    // Save state and start
    await chrome.storage.local.set({
      isRunning: true,
      instaUrl: instaUrl,
      currentRound: 0,
      totalRounds: repeatCount
    });

    // Send message to background to start process
    chrome.runtime.sendMessage({
      action: 'startProcess',
      instaUrl: instaUrl,
      repeatCount: repeatCount
    });

    updateUI(true, 0, repeatCount);
  });

  stopBtn.addEventListener('click', async () => {
    await chrome.storage.local.set({ isRunning: false });
    chrome.runtime.sendMessage({ action: 'stopProcess' });
    updateUI(false);
    statusDiv.className = 'status error';
    statusDiv.textContent = '⏹️ Process stopped by user';
  });

  // Listen for updates from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateProgress') {
      progressInfo.textContent = `Round ${message.currentRound}/${message.totalRounds} complete`;

      // Start countdown timer if nextRunTime is provided
      if (message.nextRunTime) {
        startCountdown(message.nextRunTime);
      }
    } else if (message.action === 'processComplete') {
      updateUI(false);
      stopCountdown();
      statusDiv.className = 'status running';
      statusDiv.textContent = '🎉 All rounds completed!';
    } else if (message.action === 'processError') {
      updateUI(false);
      stopCountdown();
      showError('❌ ' + message.error);
    }
  });
});
