// Instagram Content Script
// Detects Instagram Reels, Posts, and Stories and adds download buttons

(function() {
  'use strict';
  
  const PLATFORM = 'instagram';
  let observerInstance = null;
  
  // Initialize when page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    console.log('Instagram downloader initialized');
    
    // Start observing for video elements
    startObserver();
    
    // Initial scan for existing videos
    scanForVideos();
  }
  
  // MutationObserver to detect dynamically loaded content
  function startObserver() {
    observerInstance = new MutationObserver((mutations) => {
      scanForVideos();
    });
    
    observerInstance.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Scan page for video elements
  function scanForVideos() {
    // Find all video elements that don't already have a download button
    const videos = document.querySelectorAll('video:not([data-download-btn-added])');
    
    videos.forEach(video => {
      video.setAttribute('data-download-btn-added', 'true');
      addDownloadButton(video);
    });
  }
  
  // Add download button to video element
  function addDownloadButton(videoElement) {
    // Find the appropriate container for the button
    const container = findButtonContainer(videoElement);
    if (!container) return;
    
    // Create download button
    const downloadBtn = createDownloadButton();
    
    // Add click handler
    downloadBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      await handleDownloadClick(videoElement, downloadBtn);
    });
    
    // Insert button into container
    container.appendChild(downloadBtn);
  }
  
  // Find the best container for the download button
  function findButtonContainer(videoElement) {
    // Try to find Instagram's action bar
    let parent = videoElement.closest('article');
    if (!parent) {
      parent = videoElement.parentElement;
    }
    
    // Look for action buttons section
    const actionSection = parent?.querySelector('section[class*="button"], section > div > div');
    if (actionSection) {
      return actionSection;
    }
    
    // Fallback: create a container overlay on the video
    const overlay = document.createElement('div');
    overlay.className = 'smd-video-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
    `;
    
    const videoContainer = videoElement.parentElement;
    if (videoContainer && getComputedStyle(videoContainer).position === 'static') {
      videoContainer.style.position = 'relative';
    }
    videoContainer.appendChild(overlay);
    
    return overlay;
  }
  
  // Create download button element
  function createDownloadButton() {
    const button = document.createElement('button');
    button.className = 'smd-download-btn smd-instagram-btn';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      </svg>
      <span class="smd-btn-text">Download</span>
    `;
    button.title = 'Download video (only if you have permission)';
    
    return button;
  }
  
  // Handle download button click
  async function handleDownloadClick(videoElement, button) {
    try {
      // Update button state
      button.disabled = true;
      button.innerHTML = `
        <svg class="smd-spinner" width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
          <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="3" fill="none"/>
        </svg>
        <span class="smd-btn-text">Processing...</span>
      `;
      
      // Extract video URL
      const videoUrl = await extractVideoUrl(videoElement);

      if (!videoUrl) {
        throw new Error('Could not extract video URL.\n\n' +
          '📌 Instagram uses protected streaming URLs.\n' +
          '✅ Try downloading:\n' +
          '   • Your own uploaded content\n' +
          '   • Posts where you have edit access\n' +
          '   • Content with explicit download permission\n\n' +
          '💡 Alternative: Use Instagram\'s "Save" feature or download from your Archive.');
      }
      
      // Get username and post info
      const username = extractUsername();
      
      // Show quality selection if multiple qualities available
      const selectedQuality = await showQualitySelector(videoElement);
      
      // Send download request to background script
      chrome.runtime.sendMessage({
        action: 'download',
        data: {
          url: videoUrl,
          filename: 'video.mp4',
          platform: PLATFORM,
          username: username,
          quality: selectedQuality
        }
      }, (response) => {
        if (response.success) {
          showNotification('Download started!', 'success');
          button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            <span class="smd-btn-text">Downloaded!</span>
          `;
          
          setTimeout(() => {
            button.disabled = false;
            button.innerHTML = `
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              <span class="smd-btn-text">Download</span>
            `;
          }, 3000);
        } else {
          throw new Error(response.error || 'Download failed');
        }
      });
      
    } catch (error) {
      console.error('Download error:', error);
      showNotification(error.message, 'error');
      
      // Reset button
      button.disabled = false;
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
        <span class="smd-btn-text">Download</span>
      `;
    }
  }
  
  // Extract video URL from video element
  async function extractVideoUrl(videoElement) {
    // Try to get the source URL
    let videoUrl = videoElement.src || videoElement.currentSrc;

    if (!videoUrl || videoUrl.startsWith('blob:')) {
      // Try to find source element
      const source = videoElement.querySelector('source');
      if (source) {
        videoUrl = source.src;
      }
    }

    // If still blob URL, try to extract from Instagram's page data
    if (videoUrl && videoUrl.startsWith('blob:')) {
      console.log('Blob URL detected, attempting to extract real URL from page data...');

      // Try to find video URL in Instagram's embedded data
      const videoUrlFromPage = await extractVideoUrlFromPageData(videoElement);
      if (videoUrlFromPage) {
        console.log('Found video URL in page data:', videoUrlFromPage);
        return videoUrlFromPage;
      }

      // This is a limitation - blob URLs can't be directly downloaded
      // Instagram uses blob URLs for security and to prevent easy downloading
      console.warn('Blob URL detected - direct download not possible without Instagram API');
      console.info('💡 Tip: This video can only be downloaded if you have permission from the creator or if it\'s your own content.');
      return null;
    }

    return videoUrl;
  }

  // Try to extract video URL from Instagram's page data
  async function extractVideoUrlFromPageData(videoElement) {
    try {
      // Instagram embeds video data in <script> tags as JSON
      const scripts = document.querySelectorAll('script[type="application/ld+json"], script:not([src])');

      for (const script of scripts) {
        const content = script.textContent;
        if (!content) continue;

        // Look for video URLs in the script content
        const videoUrlMatches = content.match(/https:\/\/[^"'\s]+\.mp4[^"'\s]*/gi);
        if (videoUrlMatches && videoUrlMatches.length > 0) {
          // Return the first high-quality video URL found
          const highQualityUrl = videoUrlMatches.find(url => !url.includes('_n.mp4')) || videoUrlMatches[0];
          return highQualityUrl;
        }
      }

      // Try to find in window.__additionalDataLoaded or similar objects
      if (window._sharedData || window.__additionalDataLoaded) {
        console.log('Found Instagram data objects, searching for video URL...');
        // This would need more specific logic based on Instagram's current data structure
      }

    } catch (error) {
      console.error('Error extracting video URL from page data:', error);
    }

    return null;
  }
  
  // Extract username from page
  function extractUsername() {
    // Try various selectors for username
    const usernameEl = document.querySelector('header a[href^="/"]');
    if (usernameEl) {
      return usernameEl.getAttribute('href')?.replace(/\//g, '') || 'unknown';
    }
    
    return 'unknown';
  }
  
  // Show quality selector (simplified version)
  async function showQualitySelector(videoElement) {
    // In a real implementation, you'd detect available qualities
    // For now, return default
    return 'best';
  }
  
  // Show notification to user
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `smd-notification smd-notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('smd-notification-show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('smd-notification-show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'triggerDownload') {
      // Find the currently visible video
      const videos = document.querySelectorAll('video');
      const visibleVideo = Array.from(videos).find(v => {
        const rect = v.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      });
      
      if (visibleVideo) {
        const button = visibleVideo.closest('[data-download-btn-added]')
          ?.querySelector('.smd-download-btn');
        if (button) {
          button.click();
        }
      }
    }
  });
  
})();
