// Popup Script - Social Media Downloader

document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Check if user has agreed to ethical terms
  const hasAgreed = await checkEthicalAgreement();
  
  if (!hasAgreed) {
    showEthicalNotice();
  } else {
    showMainContent();
  }
  
  // Set up event listeners
  setupEventListeners();
  
  // Load settings
  await loadSettings();
  
  // Detect current platform
  detectCurrentPlatform();
  
  // Load history
  await loadHistory();
  
  // Apply theme
  applyTheme();
}

// Check if user has agreed to ethical usage
async function checkEthicalAgreement() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['ethicalAgreement'], (result) => {
      resolve(result.ethicalAgreement === true);
    });
  });
}

// Show ethical notice
function showEthicalNotice() {
  document.getElementById('ethical-notice').classList.remove('hidden');
  document.getElementById('main-content').classList.add('hidden');
}

// Show main content
function showMainContent() {
  document.getElementById('ethical-notice').classList.add('hidden');
  document.getElementById('main-content').classList.remove('hidden');
}

// Setup event listeners
function setupEventListeners() {
  // Ethical agreement
  const agreeCheckbox = document.getElementById('agree-checkbox');
  const agreeBtn = document.getElementById('agree-btn');
  
  agreeCheckbox?.addEventListener('change', (e) => {
    agreeBtn.disabled = !e.target.checked;
  });
  
  agreeBtn?.addEventListener('click', async () => {
    await chrome.storage.sync.set({ ethicalAgreement: true });
    showMainContent();
  });
  
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  
  // Quick download button
  document.getElementById('quick-download-btn')?.addEventListener('click', triggerQuickDownload);
  
  // Settings buttons
  document.getElementById('save-settings-btn')?.addEventListener('click', saveSettings);
  document.getElementById('clear-history-btn')?.addEventListener('click', clearHistory);
  
  // Footer links
  document.getElementById('help-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showHelp();
  });
  
  document.getElementById('about-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showAbout();
  });
}

// Switch tabs
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });
}

// Detect current platform
async function detectCurrentPlatform() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      updatePlatformStatus(null);
      return;
    }
    
    const url = tab.url;
    let platform = null;
    
    if (url.includes('instagram.com')) {
      platform = { name: 'Instagram', icon: '📷', supported: true };
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = { name: 'YouTube', icon: '▶️', supported: true };
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      platform = { name: 'Twitter/X', icon: '🐦', supported: true };
    } else if (url.includes('tiktok.com')) {
      platform = { name: 'TikTok', icon: '🎵', supported: true };
    }
    
    updatePlatformStatus(platform);
  } catch (error) {
    console.error('Error detecting platform:', error);
    updatePlatformStatus(null);
  }
}

// Update platform status display
function updatePlatformStatus(platform) {
  const indicator = document.getElementById('platform-indicator');
  const platformName = document.getElementById('platform-name');
  const platformSubtitle = document.getElementById('platform-subtitle');
  const quickDownloadBtn = document.getElementById('quick-download-btn');
  
  if (platform && platform.supported) {
    platformName.textContent = platform.name;
    platformSubtitle.textContent = 'Ready to download';
    indicator.querySelector('.status-icon').textContent = platform.icon;
    quickDownloadBtn.disabled = false;
  } else {
    platformName.textContent = 'Not Supported';
    platformSubtitle.textContent = 'Navigate to a supported platform';
    indicator.querySelector('.status-icon').textContent = '❌';
    quickDownloadBtn.disabled = true;
  }
}

// Trigger quick download
async function triggerQuickDownload() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) return;
    
    // Send message to content script to trigger download
    await chrome.tabs.sendMessage(tab.id, { action: 'triggerDownload' });
    
    // Close popup after triggering
    window.close();
  } catch (error) {
    console.error('Error triggering download:', error);
    alert('Could not trigger download. Make sure you\'re on a supported page with video content.');
  }
}

// Load settings
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
      if (settings) {
        // Apply settings to UI
        document.getElementById('quality-setting').value = settings.defaultQuality || 'best';
        document.getElementById('auto-download-setting').checked = settings.autoDownload || false;
        document.getElementById('filename-setting').value = settings.filenameFormat || '[platform]_[username]_[timestamp]';
        document.getElementById('theme-setting').value = settings.theme || 'light';
      }
      resolve();
    });
  });
}

// Save settings
async function saveSettings() {
  const settings = {
    defaultQuality: document.getElementById('quality-setting').value,
    autoDownload: document.getElementById('auto-download-setting').checked,
    filenameFormat: document.getElementById('filename-setting').value,
    theme: document.getElementById('theme-setting').value
  };
  
  chrome.runtime.sendMessage({ 
    action: 'saveSettings', 
    settings: settings 
  }, (response) => {
    if (response && response.success) {
      // Show success feedback
      const btn = document.getElementById('save-settings-btn');
      const originalText = btn.textContent;
      btn.textContent = '✓ Saved';
      btn.style.background = '#10b981';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 2000);
      
      // Apply theme
      applyTheme();
    }
  });
}

// Load download history
async function loadHistory() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getHistory' }, (history) => {
      displayHistory(history || []);
      resolve();
    });
  });
}

// Display history
function displayHistory(history) {
  const historyList = document.getElementById('history-list');
  
  if (!history || history.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <p>No downloads yet</p>
        <p class="empty-subtitle">Your download history will appear here</p>
      </div>
    `;
    return;
  }
  
  // Show last 10 downloads
  const recentHistory = history.slice(0, 10);
  
  historyList.innerHTML = recentHistory.map(item => {
    const date = new Date(item.timestamp);
    const timeAgo = getTimeAgo(date);
    
    return `
      <div class="history-item">
        <div class="history-icon ${item.platform}">
          ${getPlatformEmoji(item.platform)}
        </div>
        <div class="history-info">
          <div class="history-filename" title="${item.filename}">${item.filename}</div>
          <div class="history-meta">${item.username} • ${timeAgo}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Get platform emoji
function getPlatformEmoji(platform) {
  const emojis = {
    instagram: '📷',
    youtube: '▶️',
    twitter: '🐦',
    tiktok: '🎵'
  };
  return emojis[platform] || '📥';
}

// Get time ago string
function getTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
}

// Clear history
function clearHistory() {
  if (confirm('Are you sure you want to clear your download history?')) {
    chrome.storage.sync.set({ downloadHistory: [] }, () => {
      displayHistory([]);
      
      const btn = document.getElementById('clear-history-btn');
      const originalText = btn.textContent;
      btn.textContent = '✓ Cleared';
      
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  }
}

// Apply theme
function applyTheme() {
  const themeSelect = document.getElementById('theme-setting');
  let theme = themeSelect?.value || 'light';
  
  if (theme === 'auto') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  document.body.setAttribute('data-theme', theme);
}

// Show help
function showHelp() {
  alert(`Social Media Downloader Help

HOW TO USE:
1. Navigate to a supported platform (Instagram, YouTube, Twitter/X, TikTok)
2. Look for the download button on videos
3. Click to download (ensure you have permission)

KEYBOARD SHORTCUTS:
• Ctrl+Shift+D (Cmd+Shift+D on Mac): Quick download

ETHICAL USAGE:
• Only download your own content
• Only download content with creator permission
• Respect copyright and intellectual property
• Follow platform terms of service

For more help, visit our documentation.`);
}

// Show about
function showAbout() {
  alert(`Social Media Downloader v1.0.0

A browser extension for ethically downloading social media content.

IMPORTANT:
This tool is designed to help you download:
• Your own content for backup purposes
• Content where creators have enabled downloads
• Content with explicit permission

Please use responsibly and respect all copyrights, creator rights, and platform policies.

Made with ❤️ for ethical content creators.`);
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.downloadHistory) {
      displayHistory(changes.downloadHistory.newValue || []);
    }
  }
});

// Watch for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  applyTheme();
});
