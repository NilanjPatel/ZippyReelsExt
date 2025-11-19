// YouTube Content Script
// Detects YouTube videos and shorts, adds download buttons

(function() {
  'use strict';
  
  const PLATFORM = 'youtube';
  let currentVideoId = null;
  
  init();
  
  function init() {
    console.log('YouTube downloader initialized');
    
    // Watch for URL changes (YouTube is a SPA)
    watchForNavigation();
    
    // Initial check
    checkAndAddButton();
  }
  
  // Watch for navigation changes in YouTube's SPA
  function watchForNavigation() {
    let lastUrl = location.href;
    
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        currentVideoId = null;
        setTimeout(checkAndAddButton, 1000);
      }
    }).observe(document, { subtree: true, childList: true });
  }
  
  // Check if we're on a video page and add button
  function checkAndAddButton() {
    const videoId = getVideoId();
    
    if (videoId && videoId !== currentVideoId) {
      currentVideoId = videoId;
      addDownloadButton();
    }
  }
  
  // Extract video ID from URL
  function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    
    // Check for Shorts
    const shortsMatch = window.location.pathname.match(/\/shorts\/([^\/]+)/);
    if (shortsMatch) {
      return shortsMatch[1];
    }
    
    return videoId;
  }
  
  // Add download button to YouTube player
  function addDownloadButton() {
    // Remove existing button if present
    const existingBtn = document.querySelector('.smd-youtube-download-btn');
    if (existingBtn) existingBtn.remove();
    
    // Find the container for buttons (below video, next to like/share)
    const container = findButtonContainer();
    if (!container) {
      console.log('Could not find button container, retrying...');
      setTimeout(addDownloadButton, 1000);
      return;
    }
    
    // Create button
    const button = createDownloadButton();
    
    // Add click handler
    button.addEventListener('click', handleDownloadClick);
    
    // Insert button
    container.appendChild(button);
  }
  
  // Find the container for action buttons
  function findButtonContainer() {
    // Try to find the actions menu (like, dislike, share, etc.)
    const actionsMenu = document.querySelector('#top-level-buttons-computed, #menu-container #top-level-buttons');
    
    if (actionsMenu) {
      return actionsMenu;
    }
    
    // Fallback for Shorts
    const shortsActions = document.querySelector('ytd-reel-video-renderer #actions');
    if (shortsActions) {
      return shortsActions;
    }
    
    return null;
  }
  
  // Create download button styled for YouTube
  function createDownloadButton() {
    const button = document.createElement('button');
    button.className = 'smd-download-btn smd-youtube-download-btn';
    button.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
        <span>Download</span>
      </div>
    `;
    button.title = 'Download video (requires permission or must be your own content)';
    
    return button;
  }
  
  // Handle download button click
  async function handleDownloadClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const button = e.currentTarget;
    
    try {
      button.disabled = true;
      button.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg class="smd-spinner" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
            <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="3" fill="none"/>
          </svg>
          <span>Processing...</span>
        </div>
      `;
      
      // Get video information
      const videoInfo = await getVideoInfo();
      
      if (!videoInfo.url) {
        throw new Error('Could not extract video URL.\n\n' +
          '📌 YouTube uses DASH streaming (blob URLs).\n' +
          '✅ Try downloading:\n' +
          '   • Your own uploaded videos (via YouTube Studio)\n' +
          '   • Videos with download enabled by creator\n' +
          '   • Use YouTube Premium\'s offline feature\n\n' +
          '💡 Note: Most YouTube videos require YouTube Data API for programmatic download.');
      }
      
      // Show quality selection dialog
      const quality = await showQualityDialog(videoInfo.qualities);
      
      // Send download request
      chrome.runtime.sendMessage({
        action: 'download',
        data: {
          url: videoInfo.url,
          filename: `${videoInfo.title}.mp4`,
          platform: PLATFORM,
          username: videoInfo.channel,
          quality: quality
        }
      }, (response) => {
        if (response.success) {
          showNotification('✓ Download started!', 'success');
          button.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              <span>Downloaded</span>
            </div>
          `;
          
          setTimeout(() => {
            button.disabled = false;
            button.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                <span>Download</span>
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
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          <span>Download</span>
        </div>
      `;
    }
  }
  
  // Get video information
  async function getVideoInfo() {
    const videoElement = document.querySelector('video');
    
    // Get title
    const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1 yt-formatted-string');
    const title = titleEl?.textContent?.trim() || 'video';
    
    // Get channel name
    const channelEl = document.querySelector('ytd-channel-name a, #channel-name a');
    const channel = channelEl?.textContent?.trim() || 'unknown';
    
    // Get video URL (this is simplified - in production you'd need to use YouTube's API)
    let videoUrl = videoElement?.src || videoElement?.currentSrc;

    // Note: YouTube videos are often delivered via blob URLs or DASH streaming
    // A production extension would need to either:
    // 1. Use YouTube Data API with proper authentication
    // 2. Use a backend service to fetch video URLs
    // 3. Only work with videos that allow embedding/downloading

    if (!videoUrl || videoUrl.startsWith('blob:')) {
      console.log('YouTube blob URL detected, attempting alternative methods...');

      // Try to extract from YouTube's player data
      const extractedUrl = await extractYouTubeVideoUrl();
      if (extractedUrl) {
        console.log('Extracted video URL from YouTube data');
        videoUrl = extractedUrl;
      } else {
        // Check if this is the user's own video or a video that allows downloading
        const isOwnVideo = await checkIfOwnVideo();
        if (!isOwnVideo) {
          console.warn('Cannot download: Not user\'s own video and no direct URL available');
          videoUrl = null; // Can't download this video
        }
      }
    }
    
    return {
      title: sanitizeFilename(title),
      channel: sanitizeFilename(channel),
      url: videoUrl,
      qualities: ['1080p', '720p', '480p', '360p'] // Would be detected dynamically
    };
  }
  
  // Try to extract video URL from YouTube's player data
  async function extractYouTubeVideoUrl() {
    try {
      // YouTube stores player data in ytInitialPlayerResponse
      if (window.ytInitialPlayerResponse) {
        const playerResponse = window.ytInitialPlayerResponse;

        // Try to get from streamingData
        if (playerResponse.streamingData) {
          const formats = playerResponse.streamingData.formats || [];
          const adaptiveFormats = playerResponse.streamingData.adaptiveFormats || [];
          const allFormats = [...formats, ...adaptiveFormats];

          // Find highest quality video+audio format
          const videoFormat = allFormats
            .filter(f => f.url && f.mimeType && f.mimeType.includes('video'))
            .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

          if (videoFormat && videoFormat.url) {
            console.log('Found video URL in YouTube player data');
            return videoFormat.url;
          }
        }
      }

      // Try to find in page scripts
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const content = script.textContent;
        if (content && content.includes('streamingData')) {
          // This would need more sophisticated parsing
          console.log('Found streamingData in script, but parsing required');
        }
      }

    } catch (error) {
      console.error('Error extracting YouTube video URL:', error);
    }

    return null;
  }

  // Check if this is the user's own video
  async function checkIfOwnVideo() {
    // Check if there's an edit button (indicates ownership)
    const editButton = document.querySelector('ytd-button-renderer[button-renderer] a[href*="/edit"]');
    return !!editButton;
  }
  
  // Show quality selection dialog
  function showQualityDialog(qualities) {
    return new Promise((resolve) => {
      const dialog = document.createElement('div');
      dialog.className = 'smd-quality-dialog';
      dialog.innerHTML = `
        <div class="smd-dialog-content">
          <h3>Select Quality</h3>
          <div class="smd-quality-options">
            ${qualities.map(q => `
              <button class="smd-quality-option" data-quality="${q}">
                ${q}
              </button>
            `).join('')}
          </div>
          <button class="smd-dialog-cancel">Cancel</button>
        </div>
      `;
      
      document.body.appendChild(dialog);
      
      dialog.querySelectorAll('.smd-quality-option').forEach(btn => {
        btn.addEventListener('click', () => {
          resolve(btn.dataset.quality);
          dialog.remove();
        });
      });
      
      dialog.querySelector('.smd-dialog-cancel').addEventListener('click', () => {
        resolve('best');
        dialog.remove();
      });
    });
  }
  
  // Sanitize filename
  function sanitizeFilename(filename) {
    return filename.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
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
      const button = document.querySelector('.smd-youtube-download-btn');
      if (button) {
        button.click();
      }
    }
  });
  
})();
