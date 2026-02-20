document.addEventListener('DOMContentLoaded', async () => {
  const instaUrlInput = document.getElementById('instaUrl');
  const repeatCountInput = document.getElementById('repeatCount');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusDiv = document.getElementById('status');
  const progressInfo = document.getElementById('progressInfo');

  // Load saved state
  const savedState = await chrome.storage.local.get(['isRunning', 'instaUrl', 'currentRound', 'totalRounds']);
  
  if (savedState.isRunning) {
    instaUrlInput.value = savedState.instaUrl || '';
    repeatCountInput.value = savedState.totalRounds || 5;
    updateUI(true, savedState.currentRound, savedState.totalRounds);
  }

  function updateUI(isRunning, currentRound = 0, totalRounds = 0) {
    if (isRunning) {
      startBtn.disabled = true;
      stopBtn.style.display = 'block';
      instaUrlInput.disabled = true;
      repeatCountInput.disabled = true;
      statusDiv.className = 'status running';
      statusDiv.textContent = '✅ Process चल रहा है...';
      progressInfo.textContent = `Round ${currentRound}/${totalRounds} complete`;
    } else {
      startBtn.disabled = false;
      stopBtn.style.display = 'none';
      instaUrlInput.disabled = false;
      repeatCountInput.disabled = false;
      statusDiv.className = 'status';
      statusDiv.style.display = 'none';
      progressInfo.textContent = '';
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
      showError('❌ Repeat count 1 से 50 के बीच होना चाहिए');
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
      if (message.nextIn) {
        progressInfo.textContent += ` | Next in ${message.nextIn}`;
      }
    } else if (message.action === 'processComplete') {
      updateUI(false);
      statusDiv.className = 'status running';
      statusDiv.textContent = '🎉 All rounds completed!';
    } else if (message.action === 'processError') {
      updateUI(false);
      showError('❌ ' + message.error);
    }
  });
});
