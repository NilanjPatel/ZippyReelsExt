// TikTok Content Script
// Detects TikTok videos and adds download buttons

(function() {
  'use strict';
  
  const PLATFORM = 'tiktok';
  let processedVideos = new Set();
  
  init();
  
  function init() {
    console.log('TikTok downloader initialized');
    
    // Start observing
    startObserver();
    
    // Initial scan
    setTimeout(scanForVideos, 1000);
  }
  
  // Start MutationObserver
  function startObserver() {
    const observer = new MutationObserver(() => {
      scanForVideos();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Scan for videos
  function scanForVideos() {
    // TikTok video containers
    const videoContainers = document.querySelectorAll('[data-e2e="browse-video"], [data-e2e="user-post-item"]');
    
    videoContainers.forEach(container => {
      const video = container.querySelector('video');
      if (!video) return;
      
      const videoId = getVideoId(container);
      if (!videoId || processedVideos.has(videoId)) return;
      
      processedVideos.add(videoId);
      addDownloadButton(container, video);
    });
  }
  
  // Get video ID
  function getVideoId(container) {
    // Try to find link to video
    const link = container.querySelector('a[href*="/video/"]');
    if (link) {
      const match = link.getAttribute('href')?.match(/\/video\/(\d+)/);
      return match ? match[1] : null;
    }
    
    // Fallback: use video src as ID
    const video = container.querySelector('video');
    return video?.src?.split('/').pop()?.split('?')[0] || null;
  }
  
  // Add download button
  function addDownloadButton(container, videoElement) {
    // Find actions bar (like, comment, share buttons)
    const actionsBar = container.querySelector('[data-e2e="browse-video-actions"], [data-e2e="video-actions"]');
    
    if (!actionsBar) {
      // Fallback: create overlay button
      addOverlayButton(container, videoElement);
      return;
    }
    
    // Create button
    const button = createDownloadButton();
    
    // Add click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDownloadClick(videoElement, button, container);
    });
    
    // Insert button
    actionsBar.appendChild(button);
  }
  
  // Add overlay button as fallback
  function addOverlayButton(container, videoElement) {
    const overlay = document.createElement('div');
    overlay.className = 'smd-tiktok-overlay';
    overlay.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      z-index: 100;
    `;
    
    const button = createDownloadButton();
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDownloadClick(videoElement, button, container);
    });
    
    overlay.appendChild(button);
    
    const videoContainer = videoElement.closest('[data-e2e="browse-video"]') || videoElement.parentElement;
    if (videoContainer) {
      if (getComputedStyle(videoContainer).position === 'static') {
        videoContainer.style.position = 'relative';
      }
      videoContainer.appendChild(overlay);
    }
  }
  
  // Create download button
  function createDownloadButton() {
    const button = document.createElement('button');
    button.className = 'smd-download-btn smd-tiktok-btn';
    button.innerHTML = `
      <div class="smd-btn-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
      </div>
    `;
    button.title = 'Download video (only if download is enabled by creator)';
    
    return button;
  }
  
  // Handle download click
  async function handleDownloadClick(videoElement, button, container) {
    try {
      // Check if video allows downloads
      const downloadAllowed = checkDownloadAllowed(container);
      
      if (!downloadAllowed) {
        showNotification('⚠️ This video does not allow downloads. Please respect creator settings.', 'warning');
        return;
      }
      
      // Update button state
      button.disabled = true;
      button.innerHTML = `
        <div class="smd-btn-content">
          <svg class="smd-spinner" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
            <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="3" fill="none"/>
          </svg>
        </div>
      `;
      
      // Extract video URL
      const videoUrl = await extractVideoUrl(videoElement, container);
      
      if (!videoUrl) {
        throw new Error('Could not extract video URL.');
      }
      
      // Get video info
      const username = extractUsername(container);
      const description = extractDescription(container);
      
      // Send download request
      chrome.runtime.sendMessage({
        action: 'download',
        data: {
          url: videoUrl,
          filename: `${description.substring(0, 30)}.mp4`,
          platform: PLATFORM,
          username: username,
          quality: 'best'
        }
      }, (response) => {
        if (response.success) {
          showNotification('✓ Download started!', 'success');
          button.innerHTML = `
            <div class="smd-btn-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
            </div>
          `;
          
          setTimeout(() => {
            button.disabled = false;
            button.innerHTML = `
              <div class="smd-btn-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
              </div>
            `;
          }, 3000);
        } else {
          throw new Error(response.error || 'Download failed');
        }
      });
      
    } catch (error) {
      console.error('Download error:', error);
      showNotification('✗ ' + error.message, 'error');
      
      button.disabled = false;
      button.innerHTML = `
        <div class="smd-btn-content">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </div>
      `;
    }
  }
  
  // Check if download is allowed by creator
  function checkDownloadAllowed(container) {
    // TikTok has a built-in download button that appears when allowed
    const nativeDownloadBtn = container.querySelector('[data-e2e="download-button"]');
    
    // If native download button exists, downloads are allowed
    if (nativeDownloadBtn) {
      return true;
    }
    
    // Check if this is user's own video (could check for edit options)
    const editButton = container.querySelector('[data-e2e="video-edit"]');
    if (editButton) {
      return true;
    }
    
    // Conservative approach: if we can't confirm, show warning
    return false;
  }
  
  // Extract video URL
  async function extractVideoUrl(videoElement, container) {
    let videoUrl = videoElement.src || videoElement.currentSrc;
    
    // TikTok often uses blob URLs
    if (videoUrl && videoUrl.startsWith('blob:')) {
      // Try to find source element
      const source = videoElement.querySelector('source');
      if (source) {
        videoUrl = source.src;
      }
      
      // If still blob, try to get from data attributes or API
      if (videoUrl.startsWith('blob:')) {
        // Check if native download button exists and use its URL
        const nativeDownloadBtn = container.querySelector('[data-e2e="download-button"]');
        if (nativeDownloadBtn) {
          // The native button would have the video URL
          // In production, you'd extract this from TikTok's API or network requests
          console.warn('Using native TikTok download would be preferred here');
        }
        
        return null;
      }
    }
    
    return videoUrl;
  }
  
  // Extract username
  function extractUsername(container) {
    const usernameEl = container.querySelector('[data-e2e="browse-username"], [data-e2e="video-author-uniqueid"]');
    return usernameEl?.textContent?.trim()?.replace('@', '') || 'unknown';
  }
  
  // Extract description
  function extractDescription(container) {
    const descEl = container.querySelector('[data-e2e="browse-video-desc"], [data-e2e="video-desc"]');
    let desc = descEl?.textContent?.trim() || 'tiktok';
    
    // Sanitize
    desc = desc.replace(/[<>:"/\\|?*]/g, '_');
    return desc.substring(0, 50);
  }
  
  // Show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `smd-notification smd-notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('smd-notification-show'), 10);
    setTimeout(() => {
      notification.classList.remove('smd-notification-show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Listen for keyboard shortcut
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'triggerDownload') {
      // Find currently visible video
      const videos = document.querySelectorAll('video');
      for (const video of videos) {
        const rect = video.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          const container = video.closest('[data-e2e="browse-video"]');
          if (container) {
            const button = container.querySelector('.smd-tiktok-btn');
            if (button) {
              button.click();
              break;
            }
          }
        }
      }
    }
  });
  
})();
