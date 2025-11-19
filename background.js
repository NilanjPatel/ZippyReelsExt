// Background Service Worker for Social Media Downloader
// Handles downloads, context menus, keyboard shortcuts, and storage

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Social Media Downloader installed');
  
  // Create context menu
  chrome.contextMenus.create({
    id: 'download-media',
    title: 'Download with Social Media Downloader',
    contexts: ['page', 'video', 'image', 'link']
  });

  // Set default settings
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.sync.set({
        settings: {
          defaultQuality: 'best',
          autoDownload: false,
          theme: 'light',
          filenameFormat: '[platform]_[username]_[timestamp]'
        },
        downloadHistory: []
      });
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'download-media') {
    chrome.tabs.sendMessage(tab.id, { action: 'triggerDownload' });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'download-video') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'triggerDownload' });
      }
    });
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download') {
    handleDownload(request.data, sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['settings'], (result) => {
      sendResponse(result.settings);
    });
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getHistory') {
    chrome.storage.sync.get(['downloadHistory'], (result) => {
      sendResponse(result.downloadHistory || []);
    });
    return true;
  }
});

// Handle the actual download
async function handleDownload(data, sendResponse) {
  try {
    const { url, filename, platform, username, quality } = data;
    
    // Show ethical warning on first download
    const hasAgreed = await checkEthicalAgreement();
    if (!hasAgreed) {
      sendResponse({ 
        success: false, 
        error: 'Please read and agree to the ethical usage terms in the extension popup.' 
      });
      return;
    }
    
    // Generate filename
    const finalFilename = await generateFilename(platform, username, filename);
    
    // Start download
    chrome.downloads.download({
      url: url,
      filename: finalFilename,
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ 
          success: false, 
          error: chrome.runtime.lastError.message 
        });
        return;
      }
      
      // Add to history
      addToHistory({
        downloadId,
        platform,
        username,
        filename: finalFilename,
        quality,
        timestamp: Date.now()
      });
      
      sendResponse({ 
        success: true, 
        downloadId,
        filename: finalFilename 
      });
    });
    
  } catch (error) {
    sendResponse({ 
      success: false, 
      error: error.message 
    });
  }
}

// Check if user has agreed to ethical usage terms
function checkEthicalAgreement() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['ethicalAgreement'], (result) => {
      resolve(result.ethicalAgreement === true);
    });
  });
}

// Generate filename based on settings
async function generateFilename(platform, username, originalFilename) {
  const settings = await new Promise((resolve) => {
    chrome.storage.sync.get(['settings'], (result) => {
      resolve(result.settings);
    });
  });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const format = settings?.filenameFormat || '[platform]_[username]_[timestamp]';
  
  let filename = format
    .replace('[platform]', platform)
    .replace('[username]', username || 'unknown')
    .replace('[timestamp]', timestamp);
  
  // Add extension from original filename if present
  const ext = originalFilename.match(/\.[^.]+$/)?.[0] || '.mp4';
  filename += ext;
  
  // Sanitize filename
  filename = filename.replace(/[<>:"/\\|?*]/g, '_');
  
  return filename;
}

// Add download to history
function addToHistory(downloadInfo) {
  chrome.storage.sync.get(['downloadHistory'], (result) => {
    let history = result.downloadHistory || [];
    
    // Add new download at the beginning
    history.unshift(downloadInfo);
    
    // Keep only last 50 downloads
    if (history.length > 50) {
      history = history.slice(0, 50);
    }
    
    chrome.storage.sync.set({ downloadHistory: history });
  });
}

// Monitor download progress
chrome.downloads.onChanged.addListener((delta) => {
  if (delta.state) {
    // Notify content script or popup about download state changes
    chrome.runtime.sendMessage({
      action: 'downloadStateChanged',
      downloadId: delta.id,
      state: delta.state.current
    });
  }
  
  if (delta.error) {
    console.error('Download error:', delta.error);
  }
});

console.log('Background service worker loaded');
